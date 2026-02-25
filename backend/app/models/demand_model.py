"""
Demand Forecasting Model — Predicts future demand using historical
sales data with trend decomposition, seasonality, and confidence
intervals.

Features:
    - Weighted moving average with exponential smoothing
    - Trend and seasonality decomposition
    - 7–30 day forecasting horizon
    - Confidence interval estimation
    - Spike period detection from seasonal patterns
    - Saves predictions to Supabase demand_forecasts table

Usage:
    forecaster = DemandForecaster()
    result = await forecaster.forecast(product_id, horizon_days=14)
"""

import math
import random
import logging
from datetime import date, datetime, timedelta
from typing import Optional

from db.supabase_client import supabase
from db.schemas import DemandForecastCreate

# ── Logging ──────────────────────────────────────────────────────────

logger = logging.getLogger("demand_model")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    ))
    logger.addHandler(handler)


# ── Demand Forecaster ────────────────────────────────────────────────

class DemandForecaster:
    """
    Forecasts demand using exponential smoothing with trend and
    seasonality decomposition. Lightweight alternative to Prophet
    that works without heavy ML dependencies.
    """

    def __init__(self, alpha: float = 0.3, beta: float = 0.1, gamma: float = 0.2):
        """
        Args:
            alpha: Smoothing factor for level (0–1).
            beta: Smoothing factor for trend (0–1).
            gamma: Smoothing factor for seasonality (0–1).
        """
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma

    async def _fetch_sales(self, product_id: str, days: int = 180) -> list[dict]:
        """Fetch historical sales data from Supabase."""
        try:
            cutoff = (date.today() - timedelta(days=days)).isoformat()
            response = (
                supabase.table("sales_data")
                .select("units_sold, sale_date")
                .eq("product_id", product_id)
                .gte("sale_date", cutoff)
                .order("sale_date", desc=False)
                .limit(500)
                .execute()
            )
            return response.data or []
        except Exception as e:
            logger.error(f"Failed to fetch sales data: {e}")
            return []

    async def _fetch_trend_score(self, product_id: str) -> float:
        """Get latest trend score as a demand amplifier."""
        try:
            response = (
                supabase.table("trend_metrics")
                .select("trend_score")
                .eq("product_id", product_id)
                .order("recorded_at", desc=True)
                .limit(1)
                .execute()
            )
            if response.data:
                return float(response.data[0]["trend_score"])
        except Exception:
            pass
        return 50.0  # neutral default

    def _decompose(self, values: list[float], season_length: int = 7) -> dict:
        """
        Decompose time series into level, trend, and seasonality.

        Uses Holt-Winters triple exponential smoothing.
        """
        n = len(values)
        if n < season_length * 2:
            # Not enough data for seasonal decomposition
            level = values[-1] if values else 0
            trend = 0
            if n >= 2:
                trend = (values[-1] - values[0]) / max(n - 1, 1)
            return {
                "level": level,
                "trend": trend,
                "seasonal": [1.0] * season_length,
                "residual_std": 0.0,
            }

        # Initialize seasonal indices from first full season
        initial_avg = sum(values[:season_length]) / season_length
        seasonal = [
            values[i] / initial_avg if initial_avg > 0 else 1.0
            for i in range(season_length)
        ]

        # Initialize level and trend
        level = initial_avg
        trend = (
            sum(values[season_length:2 * season_length]) / season_length - initial_avg
        ) / season_length

        # Smooth through the series
        levels = []
        residuals = []
        for i in range(n):
            idx = i % season_length
            season_factor = seasonal[idx]

            if season_factor > 0:
                new_level = self.alpha * (values[i] / season_factor) + (1 - self.alpha) * (level + trend)
            else:
                new_level = self.alpha * values[i] + (1 - self.alpha) * (level + trend)

            new_trend = self.beta * (new_level - level) + (1 - self.beta) * trend

            if new_level > 0:
                seasonal[idx] = self.gamma * (values[i] / new_level) + (1 - self.gamma) * seasonal[idx]

            fitted = (level + trend) * season_factor
            residuals.append(values[i] - fitted)

            level = new_level
            trend = new_trend
            levels.append(level)

        # Residual standard deviation for confidence intervals
        residual_std = 0.0
        if len(residuals) > 1:
            rmean = sum(residuals) / len(residuals)
            residual_std = math.sqrt(
                sum((r - rmean) ** 2 for r in residuals) / len(residuals)
            )

        return {
            "level": level,
            "trend": trend,
            "seasonal": seasonal,
            "residual_std": residual_std,
        }

    def _detect_spikes(
        self, seasonal: list[float], start_date: date, horizon: int,
    ) -> list[dict]:
        """Identify dates with unusually high seasonal indices."""
        spikes = []
        threshold = max(seasonal) * 0.85 if seasonal else 1.0

        for day in range(horizon):
            future_date = start_date + timedelta(days=day)
            idx = day % len(seasonal)
            if seasonal[idx] >= threshold and seasonal[idx] > 1.1:
                spikes.append({
                    "date": future_date.isoformat(),
                    "seasonal_index": round(seasonal[idx], 3),
                    "day_of_week": future_date.strftime("%A"),
                })
        return spikes

    async def forecast(
        self,
        product_id: str,
        horizon_days: int = 14,
        save_to_db: bool = True,
    ) -> dict:
        """
        Generate demand forecast for a product.

        Args:
            product_id: UUID of the product.
            horizon_days: Number of days to forecast (7–30).
            save_to_db: Whether to save predictions to Supabase.

        Returns:
            dict with predictions, confidence, spike periods, and
            model metrics.
        """
        horizon_days = max(7, min(30, horizon_days))

        rows = await self._fetch_sales(product_id)
        if not rows:
            logger.warning(f"No sales data for product {product_id}")
            return {
                "product_id": product_id,
                "predictions": [],
                "confidence": 0.0,
                "spike_periods": [],
                "model_metrics": {"error": "insufficient_data"},
            }

        # Extract demand values
        values = [float(r["units_sold"]) for r in rows]
        last_date = datetime.strptime(rows[-1]["sale_date"], "%Y-%m-%d").date()

        # Get trend multiplier
        trend_score = await self._fetch_trend_score(product_id)
        trend_multiplier = 0.95 + (trend_score / 500)  # 0.95–1.15 range

        # Decompose
        decomp = self._decompose(values, season_length=7)
        level = decomp["level"]
        trend = decomp["trend"]
        seasonal = decomp["seasonal"]
        residual_std = decomp["residual_std"]

        # Generate predictions
        predictions = []
        for day in range(1, horizon_days + 1):
            future_date = last_date + timedelta(days=day)
            idx = (day - 1) % len(seasonal)

            forecast_val = (level + trend * day) * seasonal[idx] * trend_multiplier
            forecast_val = max(0, forecast_val)

            # Confidence interval widens over time
            uncertainty = residual_std * math.sqrt(day) * 1.96
            upper = forecast_val + uncertainty
            lower = max(0, forecast_val - uncertainty)

            predictions.append({
                "date": future_date.isoformat(),
                "predicted_demand": round(forecast_val, 1),
                "upper_bound": round(upper, 1),
                "lower_bound": round(lower, 1),
                "day_of_week": future_date.strftime("%A"),
            })

        # Overall confidence: decreases with horizon and residual noise
        avg_demand = sum(values[-14:]) / min(len(values), 14)
        noise_ratio = residual_std / avg_demand if avg_demand > 0 else 0.5
        base_confidence = max(0.5, 1.0 - noise_ratio)
        horizon_penalty = 1.0 - (horizon_days / 100)
        confidence = round(max(0.4, min(0.98, base_confidence * horizon_penalty)), 4)

        # Detect spike periods
        spikes = self._detect_spikes(seasonal, last_date + timedelta(days=1), horizon_days)

        # Model metrics
        model_metrics = {
            "algorithm": "Holt-Winters Triple Exponential Smoothing",
            "training_points": len(values),
            "level": round(level, 2),
            "trend_per_day": round(trend, 4),
            "trend_score_multiplier": round(trend_multiplier, 4),
            "residual_std": round(residual_std, 2),
            "seasonal_components": ["daily", "weekly"],
        }

        # Save to DB
        stored = 0
        if save_to_db and predictions:
            stored = await self._store_predictions(product_id, predictions, confidence)

        result = {
            "product_id": product_id,
            "predictions": predictions,
            "confidence": confidence,
            "spike_periods": spikes,
            "model_metrics": model_metrics,
            "stored": stored,
        }

        logger.info(
            f"✓ Forecast generated: {horizon_days} days, "
            f"confidence={confidence:.0%}, "
            f"avg_predicted={sum(p['predicted_demand'] for p in predictions) / len(predictions):.0f}/day, "
            f"{len(spikes)} spike periods"
        )
        return result

    async def _store_predictions(
        self, product_id: str, predictions: list[dict], confidence: float,
    ) -> int:
        """Save forecasts to Supabase demand_forecasts table."""
        records = []
        for p in predictions:
            try:
                validated = DemandForecastCreate(
                    product_id=product_id,
                    predicted_demand=p["predicted_demand"],
                    confidence=confidence,
                    forecast_date=p["date"],
                )
                records.append(validated.model_dump(mode="json"))
            except Exception as e:
                logger.warning(f"Validation failed: {e}")

        if not records:
            return 0

        try:
            response = supabase.table("demand_forecasts").insert(records).execute()
            count = len(response.data) if response.data else 0
            logger.info(f"✓ Stored {count} forecasts in demand_forecasts")
            return count
        except Exception as e:
            logger.error(f"✗ Supabase insert failed: {e}")
            return 0


# ── Standalone test ──────────────────────────────────────────────────

if __name__ == "__main__":
    import asyncio

    async def _test():
        forecaster = DemandForecaster()
        # Fetch first product
        products = supabase.table("products").select("id, name").limit(1).execute()
        if products.data:
            pid = products.data[0]["id"]
            result = await forecaster.forecast(pid, horizon_days=14)
            print(f"\n=== FORECAST for {products.data[0]['name']} ===")
            print(f"Confidence: {result['confidence']:.0%}")
            print(f"Spike periods: {len(result['spike_periods'])}")
            for p in result["predictions"][:5]:
                print(f"  {p['date']}: {p['predicted_demand']} ({p['lower_bound']}–{p['upper_bound']})")
        else:
            print("No products found in database")

    asyncio.run(_test())
