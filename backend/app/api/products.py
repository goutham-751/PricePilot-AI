"""
Products API — CRUD endpoints for the product catalog.

Endpoints:
    GET /products       — list all tracked products
    GET /products/{id}  — get a single product
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from db.supabase_client import supabase

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", summary="List all tracked products")
async def list_products(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    category: Optional[str] = None,
):
    """
    Retrieve all tracked products with optional category filter.
    """
    try:
        query = (
            supabase.table("products")
            .select("*")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
        )

        if category:
            query = query.eq("category", category)

        response = query.execute()

        return {
            "status": "success",
            "count": len(response.data),
            "data": response.data,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")


@router.get("/{product_id}", summary="Get a single product")
async def get_product(product_id: str):
    """Get a specific product by ID."""
    try:
        response = (
            supabase.table("products")
            .select("*")
            .eq("id", product_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

        return {
            "status": "success",
            "data": response.data[0],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")
