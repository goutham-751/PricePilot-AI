"""
Forecasting API — Serves demand predictions and model metrics.

Endpoints:
    POST /forecasting/predict/{product_id}  — generate new forecast
    GET  /forecasting/latest/{product_id}   — get latest saved forecast
    GET  /forecasting/model-metrics         — model performance stats
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from models.demand_model import DemandForecaster
from db.supabase_client import supabase

router = APIRouter(prefix="/forecasting", tags=["Forecasting"])
forecaster = DemandForecaster()


# ── POST /forecasting/predict/{product_id} ───────────────────────────

@router.post("/predict/{product_id}")
async def predict_demand(
    product_id: str,
    horizon_days: int = Query(14, ge=7, le=30),
    save: bool = Query(True),
):
    """
    Generate a demand forecast for a product.

    Args:
        product_id: UUID of the product.
        horizon_days: Number of days to forecast (7–30).
        save: Whether to persist predictions to the database.
    """
    result = await forecaster.forecast(product_id, horizon_days, save_to_db=save)

    if not result["predictions"]:
        raise HTTPException(
            404,
            f"No sales data found for product {product_id}. "
            "Generate sales data first using the sales simulator.",
        )

    return {"status": "ok", "forecast": result}


# ── GET /forecasting/latest/{product_id} ─────────────────────────────

@router.get("/latest/{product_id}")
async def get_latest_forecast(product_id: str, limit: int = Query(14, ge=1, le=60)):
    """
    Get the most recently saved forecast for a product.
    """
    try:
        response = (
            supabase.table("demand_forecasts")
            .select("*")
            .eq("product_id", product_id)
            .order("forecast_date", desc=True)
            .limit(limit)
            .execute()
        )
        forecasts = response.data or []
    except Exception as e:
        raise HTTPException(500, f"Database error: {e}")

    if not forecasts:
        # If no stored forecasts, generate one on the fly
        result = await forecaster.forecast(product_id, horizon_days=limit, save_to_db=True)
        if not result["predictions"]:
            return {
                "status": "no_data",
                "forecasts": [],
                "message": f"No data available for product {product_id}",
            }
        return {
            "status": "generated",
            "forecasts": result["predictions"],
            "confidence": result["confidence"],
            "model_metrics": result["model_metrics"],
        }

    # Oldest → newest for charting
    forecasts.reverse()

    return {
        "status": "ok",
        "forecasts": forecasts,
        "count": len(forecasts),
    }


# ── GET /forecasting/model-metrics ───────────────────────────────────

@router.get("/model-metrics")
async def get_model_metrics():
    """
    Return model performance metrics across all products.
    """
    try:
        products = supabase.table("products").select("id, name").execute()
        product_list = products.data or []
    except Exception as e:
        raise HTTPException(500, f"Database error: {e}")

    if not product_list:
        return {
            "status": "no_products",
            "metrics": {
                "algorithm": "Holt-Winters Triple Exponential Smoothing",
                "products_analyzed": 0,
            },
        }

    # Get forecast stats for each product
    product_metrics = []
    total_forecasts = 0

    for p in product_list[:10]:  # cap to 10 products
        try:
            resp = (
                supabase.table("demand_forecasts")
                .select("predicted_demand, confidence")
                .eq("product_id", p["id"])
                .order("created_at", desc=True)
                .limit(30)
                .execute()
            )
            forecasts = resp.data or []
            count = len(forecasts)
            total_forecasts += count

            if count > 0:
                avg_demand = sum(float(f["predicted_demand"]) for f in forecasts) / count
                avg_conf = sum(float(f["confidence"]) for f in forecasts) / count
                product_metrics.append({
                    "product_id": p["id"],
                    "product_name": p["name"],
                    "forecast_count": count,
                    "avg_predicted_demand": round(avg_demand, 1),
                    "avg_confidence": round(avg_conf, 4),
                })
        except Exception:
            continue

    return {
        "status": "ok",
        "metrics": {
            "algorithm": "Holt-Winters Triple Exponential Smoothing",
            "smoothing_params": {"alpha": 0.3, "beta": 0.1, "gamma": 0.2},
            "products_analyzed": len(product_metrics),
            "total_forecasts": total_forecasts,
            "seasonal_components": ["daily", "weekly"],
            "product_metrics": product_metrics,
        },
    }
