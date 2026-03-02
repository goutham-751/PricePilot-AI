"""
Analytics API — Serves intelligence signals and KPIs from the
feature engineering pipeline.

Endpoints:
    GET /analytics/signals/all           — signals for all products
    GET /analytics/signals/{product_id}  — signals for one product
    GET /analytics/kpis                  — aggregated KPIs
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from services.feature_engineering import FeatureEngineer
from db.supabase_client import supabase

router = APIRouter(prefix="/analytics", tags=["Analytics"])
engineer = FeatureEngineer()


# ── GET /analytics/signals/all ───────────────────────────────────────

@router.get("/signals/all")
async def get_all_signals():
    """Compute intelligence signals for every product."""
    results = await engineer.compute_all_products()
    if not results:
        return {
            "status": "no_products",
            "signals": [],
            "message": "No products found in database. Add products to generate signals.",
        }
    return {"status": "ok", "count": len(results), "signals": results}


# ── GET /analytics/signals/{product_id} ──────────────────────────────

@router.get("/signals/{product_id}")
async def get_product_signals(product_id: str, your_price: Optional[float] = None):
    """
    Compute intelligence signals for a single product.

    Args:
        product_id: UUID of the product.
        your_price: Optional override for your price. If omitted,
                    fetched from the products table.
    """
    if your_price is None:
        try:
            resp = (
                supabase.table("products")
                .select("base_price")
                .eq("id", product_id)
                .limit(1)
                .execute()
            )
            if resp.data:
                your_price = float(resp.data[0]["base_price"])
            else:
                raise HTTPException(404, f"Product {product_id} not found")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(500, f"Database error: {e}")

    signals = await engineer.compute_signals(product_id, your_price)
    return {"status": "ok", "signals": signals}


# ── GET /analytics/kpis ──────────────────────────────────────────────

@router.get("/kpis")
async def get_kpis():
    """
    Aggregated KPIs across all products:
        - Total revenue (estimated)
        - Average demand momentum
        - Average price position
        - Volatility distribution
    """
    all_signals = await engineer.compute_all_products()

    if not all_signals:
        return {
            "status": "no_data",
            "kpis": {
                "total_products": 0,
                "avg_demand_growth": 0.0,
                "avg_price_position": 1.0,
                "avg_trend_momentum": 0.0,
                "volatility_breakdown": {"low": 0, "medium": 0, "high": 0},
            },
        }

    n = len(all_signals)
    avg_growth = sum(s.get("demand_growth_rate", 0) for s in all_signals) / n
    avg_position = sum(s.get("price_position_index", 1) for s in all_signals) / n
    avg_momentum = sum(s.get("trend_momentum", 0) for s in all_signals) / n

    # Volatility breakdown
    vol_counts = {"low": 0, "medium": 0, "high": 0}
    for s in all_signals:
        vol = s.get("price_volatility", "low")
        vol_counts[vol] = vol_counts.get(vol, 0) + 1

    # Estimated daily revenue = sum(price * avg_demand_proxy)
    est_daily_revenue = sum(
        s.get("your_price", 0) * max(s.get("moving_avg_demand", 0), 1)
        for s in all_signals
    )

    return {
        "status": "ok",
        "kpis": {
            "total_products": n,
            "est_daily_revenue": round(est_daily_revenue, 2),
            "est_monthly_revenue": round(est_daily_revenue * 30, 2),
            "avg_demand_growth": round(avg_growth, 4),
            "avg_price_position": round(avg_position, 4),
            "avg_trend_momentum": round(avg_momentum, 2),
            "volatility_breakdown": vol_counts,
            "computed_at": all_signals[0].get("computed_at") if all_signals else None,
        },
    }


# ── GET /analytics/summary ──────────────────────────────────────────

@router.get("/summary")
async def get_analytics_summary():
    """
    High-level intelligence summary for the dashboard.
    Returns demand momentum, price opportunity score,
    volatility index, and trend direction.
    """
    all_signals = await engineer.compute_all_products()

    if not all_signals:
        return {
            "status": "no_data",
            "summary": {
                "demand_momentum": 0,
                "price_opportunity_score": 0,
                "volatility_index": 0,
                "trend_direction": "neutral",
                "total_products": 0,
            },
        }

    n = len(all_signals)

    # Demand momentum: average trend momentum across products
    demand_momentum = round(
        sum(s.get("trend_momentum", 0) for s in all_signals) / n, 2
    )

    # Price opportunity: how far avg price position is from optimal (1.0)
    avg_position = sum(s.get("price_position_index", 1) for s in all_signals) / n
    price_opportunity = round(max(0, (avg_position - 1.0)) * 100, 1)

    # Volatility index: percentage of products with medium/high volatility
    vol_high = sum(1 for s in all_signals if s.get("price_volatility") in ("medium", "high"))
    volatility_index = round((vol_high / n) * 100, 1)

    # Trend direction
    avg_growth = sum(s.get("demand_growth_rate", 0) for s in all_signals) / n
    if avg_growth > 0.05:
        trend_direction = "up"
    elif avg_growth < -0.05:
        trend_direction = "down"
    else:
        trend_direction = "neutral"

    return {
        "status": "ok",
        "summary": {
            "demand_momentum": demand_momentum,
            "price_opportunity_score": price_opportunity,
            "volatility_index": volatility_index,
            "trend_direction": trend_direction,
            "total_products": n,
            "avg_demand_growth": round(avg_growth * 100, 2),
            "avg_price_position": round(avg_position, 3),
        },
    }
