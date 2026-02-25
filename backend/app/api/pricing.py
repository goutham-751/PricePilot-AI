"""
Pricing API — Serves elasticity analysis, price optimization,
scenario generation, and recommendations.

Endpoints:
    GET /pricing/elasticity/{product_id}       — price elasticity analysis
    GET /pricing/optimize/{product_id}         — optimal price recommendation
    GET /pricing/scenarios/{product_id}        — pricing scenarios
    GET /pricing/recommendations               — all active recommendations
    GET /pricing/recommendations/{product_id}  — decision engine evaluation
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from models.elasticity_model import ElasticityEstimator
from models.price_optimizer import PriceOptimizer
from services.decision_engine import DecisionEngine
from db.supabase_client import supabase

router = APIRouter(prefix="/pricing", tags=["Pricing"])
estimator = ElasticityEstimator()
optimizer = PriceOptimizer()
engine = DecisionEngine()


# ── GET /pricing/elasticity/{product_id} ─────────────────────────────

@router.get("/elasticity/{product_id}")
async def get_elasticity(product_id: str, your_price: Optional[float] = None):
    """
    Price elasticity analysis for a product.

    Returns elasticity coefficient, sensitivity level, R² score,
    optimal price range, and elasticity curve.
    """
    result = await estimator.estimate(product_id, your_price)
    return {"status": "ok", "elasticity": result}


# ── GET /pricing/optimize/{product_id} ───────────────────────────────

@router.get("/optimize/{product_id}")
async def optimize_price(product_id: str, save: bool = Query(True)):
    """
    Full price optimization: finds the revenue-maximizing price,
    generates scenarios, and computes revenue impact.
    """
    result = await optimizer.optimize(product_id, save_to_db=save)
    return {"status": "ok", "optimization": result}


# ── GET /pricing/scenarios/{product_id} ──────────────────────────────

@router.get("/scenarios/{product_id}")
async def get_scenarios(product_id: str):
    """Get pricing scenarios without full optimization."""
    result = await optimizer.optimize(product_id, save_to_db=False)
    return {
        "status": "ok",
        "current_price": result["current_price"],
        "optimal_price": result["optimal_price"],
        "scenarios": result["scenarios"],
    }


# ── GET /pricing/recommendations ─────────────────────────────────────

@router.get("/recommendations")
async def get_all_recommendations():
    """
    Get all stored price recommendations from the database,
    plus run the decision engine for live recommendations.
    """
    # Stored recommendations
    try:
        response = (
            supabase.table("price_recommendations")
            .select("*, products(name)")
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        stored = response.data or []
    except Exception:
        stored = []

    # Live decision engine evaluation
    try:
        products = supabase.table("products").select("id, name").limit(10).execute()
        product_list = products.data or []
    except Exception:
        product_list = []

    live_recommendations = []
    decision_logs = []
    for p in product_list[:5]:  # cap to 5 products for performance
        result = await engine.evaluate(p["id"])
        for rec in result["recommendations"]:
            rec["product_name"] = result["product_name"]
            rec["product_id"] = p["id"]
            live_recommendations.append(rec)
        decision_logs.extend(result["decision_log"])

    return {
        "status": "ok",
        "stored_recommendations": stored,
        "live_recommendations": live_recommendations,
        "decision_log": decision_logs,
        "rules": engine._evaluate_rules.__doc__ or "",
    }


# ── GET /pricing/recommendations/{product_id} ───────────────────────

@router.get("/recommendations/{product_id}")
async def get_product_recommendations(product_id: str):
    """
    Run full decision engine evaluation for a specific product.

    Returns recommendations, decision log, signals, and rules.
    """
    result = await engine.evaluate(product_id)
    return {"status": "ok", "evaluation": result}
