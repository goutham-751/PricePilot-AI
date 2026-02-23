"""
Competitors API — REST endpoints for competitor pricing data.

Endpoints:
    GET  /competitors              → list all competitor prices
    GET  /competitors/{product_id} → price history for a product
    POST /competitors/scrape       → trigger a scrape job
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from db.supabase_client import supabase
from db.schemas import CompetitorPriceResponse
from services.scraper import CompetitorScraper

router = APIRouter(prefix="/competitors", tags=["Competitors"])


@router.get("/", summary="List all competitor prices")
async def list_competitor_prices(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    competitor_name: Optional[str] = None,
):
    """
    Retrieve stored competitor pricing data.
    Supports pagination and optional filtering by competitor name.
    """
    try:
        query = (
            supabase.table("competitor_prices")
            .select("*")
            .order("recorded_at", desc=True)
            .range(offset, offset + limit - 1)
        )

        if competitor_name:
            query = query.eq("competitor_name", competitor_name)

        response = query.execute()

        return {
            "status": "success",
            "count": len(response.data),
            "data": response.data,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")


@router.get("/{product_id}", summary="Get price history for a product")
async def get_product_price_history(
    product_id: str,
    limit: int = Query(default=100, ge=1, le=500),
):
    """
    Retrieve competitor pricing history for a specific product,
    ordered by most recent first.
    """
    try:
        response = (
            supabase.table("competitor_prices")
            .select("*")
            .eq("product_id", product_id)
            .order("recorded_at", desc=True)
            .limit(limit)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail=f"No pricing data found for product: {product_id}",
            )

        return {
            "status": "success",
            "product_id": product_id,
            "count": len(response.data),
            "data": response.data,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")


@router.post("/scrape", summary="Trigger a competitor scrape job")
async def trigger_scrape(targets: list[dict]):
    """
    Trigger a competitor price scrape job.

    Request body: list of targets, each with:
        - product_id: str (UUID)
        - competitor_name: str
        - url: str (page URL to scrape)

    Returns scrape results with success/error breakdown.
    """
    if not targets:
        raise HTTPException(status_code=400, detail="No scrape targets provided")

    # Validate target structure
    for i, target in enumerate(targets):
        if "url" not in target:
            raise HTTPException(status_code=400, detail=f"Target {i} missing 'url'")
        if "product_id" not in target:
            raise HTTPException(status_code=400, detail=f"Target {i} missing 'product_id'")
        if "competitor_name" not in target:
            raise HTTPException(status_code=400, detail=f"Target {i} missing 'competitor_name'")

    scraper = CompetitorScraper()
    result = await scraper.scrape_all(targets)

    return {
        "status": "success",
        "message": f"Scrape job completed: {result['success_rate']}",
        **result,
    }
