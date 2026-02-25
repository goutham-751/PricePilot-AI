"""
Feature Engineering Pipeline — Converts raw pricing, trend, and demand
data into actionable intelligence signals.

Computes 10 signals:
    Pricing Intelligence:
        1. competitor_price_avg     — mean competitor price
        2. price_variance           — std dev of competitor prices
        3. price_position_index     — your_price / competitor_avg
        4. price_volatility         — coefficient of variation over time

    Demand Signals:
        5. moving_avg_demand        — 7-day rolling average
        6. demand_growth_rate       — week-over-week change
        7. seasonal_index           — day-of-week demand multiplier

    Trend Intelligence:
        8. trend_momentum           — rate of change in trend score
        9. trend_acceleration       — 2nd derivative of trend score

    Price Sensitivity:
        10. elasticity_estimate     — price-demand correlation signal

Usage:
    engineer = FeatureEngineer()
    signals = await engineer.compute_signals(product_id, your_price)
"""

import math
import logging
from datetime import datetime, timedelta
from typing import Optional

from db.supabase_client import supabase

# ── Logging ──────────────────────────────────────────────────────────

logger = logging.getLogger("feature_engineering")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    ))
    logger.addHandler(handler)


# ── Helper Functions ─────────────────────────────────────────────────

def _safe_mean(values: list[float]) -> float:
    """Mean with zero-division guard."""
    return sum(values) / len(values) if values else 0.0


def _safe_std(values: list[float]) -> float:
    """Population standard deviation with guard."""
    if len(values) < 2:
        return 0.0
    mean = _safe_mean(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return math.sqrt(variance)


def _classify_level(value: float, low: float, high: float) -> str:
    """Classify a value into low / medium / high."""
    if value <= low:
        return "low"
    elif value <= high:
        return "medium"
    return "high"


# ── Feature Engineer ─────────────────────────────────────────────────

class FeatureEngineer:
    """
    Reads raw data from Supabase and computes intelligence signals
    for a given product.
    """

    # ── A. Pricing Intelligence ──────────────────────────────────

    async def _pricing_features(
        self, product_id: str, your_price: float,
    ) -> dict:
        """
        Compute competitor price average, variance, position index,
        and volatility from competitor_prices table.
        """
        try:
            response = (
                supabase.table("competitor_prices")
                .select("price, recorded_at")
                .eq("product_id", product_id)
                .order("recorded_at", desc=True)
                .limit(200)
                .execute()
            )
            rows = response.data or []
        except Exception as e:
            logger.warning(f"Failed to fetch competitor prices: {e}")
            rows = []

        if not rows:
            return {
                "competitor_price_avg": 0.0,
                "price_variance": 0.0,
                "price_position_index": 1.0,
                "price_volatility": "low",
                "price_volatility_score": 0.0,
            }

        prices = [float(r["price"]) for r in rows]
        avg = _safe_mean(prices)
        std = _safe_std(prices)

        position = round(your_price / avg, 4) if avg > 0 else 1.0
        cv = (std / avg) if avg > 0 else 0.0  # coefficient of variation

        return {
            "competitor_price_avg": round(avg, 2),
            "price_variance": round(std, 2),
            "price_position_index": position,
            "price_volatility": _classify_level(cv, 0.05, 0.15),
            "price_volatility_score": round(cv, 4),
        }

    # ── B. Demand Signals ────────────────────────────────────────

    async def _demand_features(self, product_id: str) -> dict:
        """
        Compute moving average demand, growth rate, and seasonal
        index from sales_data table.
        """
        try:
            cutoff = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
            response = (
                supabase.table("sales_data")
                .select("units_sold, sale_date")
                .eq("product_id", product_id)
                .gte("sale_date", cutoff)
                .order("sale_date", desc=True)
                .limit(60)
                .execute()
            )
            rows = response.data or []
        except Exception as e:
            logger.warning(f"Failed to fetch sales data: {e}")
            rows = []

        if not rows:
            return {
                "moving_avg_demand": 0.0,
                "demand_growth_rate": 0.0,
                "demand_growth_label": "stable",
                "seasonal_index": 1.0,
            }

        # Sort oldest → newest
        rows.sort(key=lambda r: r["sale_date"])
        units = [int(r["units_sold"]) for r in rows]

        # 7-day moving average (last 7 entries)
        last_7 = units[-7:] if len(units) >= 7 else units
        prev_7 = units[-14:-7] if len(units) >= 14 else units[:len(units) // 2] or [0]

        ma = _safe_mean(last_7)
        prev_ma = _safe_mean(prev_7)

        # Growth rate
        if prev_ma > 0:
            growth = (ma - prev_ma) / prev_ma
        else:
            growth = 0.0

        # Seasonal index: weekend vs weekday ratio
        weekend_sales, weekday_sales = [], []
        for r in rows:
            try:
                d = datetime.strptime(r["sale_date"], "%Y-%m-%d")
                u = int(r["units_sold"])
                if d.weekday() >= 5:
                    weekend_sales.append(u)
                else:
                    weekday_sales.append(u)
            except (ValueError, KeyError):
                continue

        wd_avg = _safe_mean(weekday_sales) if weekday_sales else 1.0
        we_avg = _safe_mean(weekend_sales) if weekend_sales else wd_avg
        seasonal = round(we_avg / wd_avg, 4) if wd_avg > 0 else 1.0

        growth_label = "rising" if growth > 0.05 else ("falling" if growth < -0.05 else "stable")

        return {
            "moving_avg_demand": round(ma, 2),
            "demand_growth_rate": round(growth, 4),
            "demand_growth_label": growth_label,
            "seasonal_index": seasonal,
        }

    # ── C. Trend Intelligence ────────────────────────────────────

    async def _trend_features(self, product_id: str) -> dict:
        """
        Compute trend momentum and acceleration from trend_metrics
        table.
        """
        try:
            response = (
                supabase.table("trend_metrics")
                .select("trend_score, recorded_at")
                .eq("product_id", product_id)
                .order("recorded_at", desc=True)
                .limit(20)
                .execute()
            )
            rows = response.data or []
        except Exception as e:
            logger.warning(f"Failed to fetch trend metrics: {e}")
            rows = []

        if len(rows) < 2:
            return {
                "trend_momentum": 0.0,
                "trend_momentum_label": "stable",
                "trend_acceleration": 0.0,
            }

        # Oldest → newest
        rows.reverse()
        scores = [float(r["trend_score"]) for r in rows]

        # Momentum: change between first half avg and second half avg
        mid = len(scores) // 2
        early = _safe_mean(scores[:mid])
        late = _safe_mean(scores[mid:])
        momentum = late - early

        # Acceleration: difference of consecutive deltas
        if len(scores) >= 3:
            deltas = [scores[i + 1] - scores[i] for i in range(len(scores) - 1)]
            mid_d = len(deltas) // 2
            early_d = _safe_mean(deltas[:mid_d]) if mid_d > 0 else 0
            late_d = _safe_mean(deltas[mid_d:])
            acceleration = late_d - early_d
        else:
            acceleration = 0.0

        momentum_label = "rising" if momentum > 5 else ("falling" if momentum < -5 else "stable")

        return {
            "trend_momentum": round(momentum, 2),
            "trend_momentum_label": momentum_label,
            "trend_acceleration": round(acceleration, 2),
        }

    # ── D. Price Sensitivity ─────────────────────────────────────

    async def _elasticity_signal(self, product_id: str) -> dict:
        """
        Quick elasticity estimate: correlate price changes with
        demand changes from recent data.
        """
        try:
            cutoff = (datetime.utcnow() - timedelta(days=90)).strftime("%Y-%m-%d")

            sales_resp = (
                supabase.table("sales_data")
                .select("units_sold, sale_date")
                .eq("product_id", product_id)
                .gte("sale_date", cutoff)
                .order("sale_date", desc=False)
                .limit(200)
                .execute()
            )
            sales = sales_resp.data or []

            price_resp = (
                supabase.table("competitor_prices")
                .select("price, recorded_at")
                .eq("product_id", product_id)
                .order("recorded_at", desc=True)
                .limit(50)
                .execute()
            )
            prices = price_resp.data or []
        except Exception as e:
            logger.warning(f"Failed to fetch elasticity data: {e}")
            return {"elasticity_estimate": 0.0, "elasticity_label": "unknown"}

        if len(sales) < 4 or len(prices) < 2:
            return {"elasticity_estimate": 0.0, "elasticity_label": "unknown"}

        # Simple correlation: does higher average competitor price
        # correspond to lower demand?
        price_vals = [float(p["price"]) for p in prices]
        demand_vals = [int(s["units_sold"]) for s in sales]

        # Normalize both to z-scores and compute correlation
        p_mean = _safe_mean(price_vals)
        p_std = _safe_std(price_vals)
        d_mean = _safe_mean(demand_vals)
        d_std = _safe_std(demand_vals)

        if p_std == 0 or d_std == 0:
            return {"elasticity_estimate": 0.0, "elasticity_label": "low"}

        # Use the shorter of the two for correlation
        n = min(len(price_vals), len(demand_vals))
        correlation = sum(
            ((price_vals[i] - p_mean) / p_std) * ((demand_vals[i] - d_mean) / d_std)
            for i in range(n)
        ) / n

        # Negative correlation means elastic (price up → demand down)
        elasticity = round(correlation, 4)
        label = _classify_level(abs(elasticity), 0.3, 0.6)

        return {
            "elasticity_estimate": elasticity,
            "elasticity_label": label,
        }

    # ── Main Entry Point ─────────────────────────────────────────

    async def compute_signals(
        self,
        product_id: str,
        your_price: float,
    ) -> dict:
        """
        Run all feature engineering computations for a product.

        Args:
            product_id: UUID of the product.
            your_price: Current selling price of your product.

        Returns:
            dict with all 10+ intelligence signals.
        """
        logger.info(f"Computing signals for product {product_id}...")

        pricing = await self._pricing_features(product_id, your_price)
        demand = await self._demand_features(product_id)
        trends = await self._trend_features(product_id)
        elasticity = await self._elasticity_signal(product_id)

        signals = {
            "product_id": product_id,
            "your_price": your_price,
            "computed_at": datetime.utcnow().isoformat(),
            **pricing,
            **demand,
            **trends,
            **elasticity,
        }

        logger.info(
            f"✓ Signals computed: growth={demand['demand_growth_label']}, "
            f"momentum={trends['trend_momentum_label']}, "
            f"position={pricing['price_position_index']}, "
            f"volatility={pricing['price_volatility']}, "
            f"elasticity={elasticity['elasticity_label']}"
        )

        return signals

    async def compute_all_products(self) -> list[dict]:
        """
        Compute signals for every product in the products table.
        """
        try:
            response = (
                supabase.table("products")
                .select("id, name, base_price")
                .execute()
            )
            products = response.data or []
        except Exception as e:
            logger.error(f"Failed to fetch products: {e}")
            return []

        results = []
        for p in products:
            signals = await self.compute_signals(
                product_id=p["id"],
                your_price=float(p["base_price"]),
            )
            signals["product_name"] = p["name"]
            results.append(signals)

        logger.info(f"✓ Computed signals for {len(results)} products")
        return results


# ── Standalone test ──────────────────────────────────────────────────

if __name__ == "__main__":
    import asyncio

    async def _test():
        engineer = FeatureEngineer()
        results = await engineer.compute_all_products()
        print("\n=== FEATURE ENGINEERING RESULTS ===")
        for r in results:
            print(f"\nProduct: {r.get('product_name', r['product_id'])}")
            for k, v in r.items():
                if k not in ("product_id", "product_name"):
                    print(f"  {k}: {v}")

    asyncio.run(_test())
