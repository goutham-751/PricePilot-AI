from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from db.supabase_client import supabase
import uuid
from datetime import datetime

router = APIRouter(prefix="/demo", tags=["Demo Simulation"])

class ApplyPriceRequest(BaseModel):
    product_id: str
    price: float

class MarketEventRequest(BaseModel):
    product_id: str
    event_type: str # "surge", "drop", "competitor_undercut"

@router.post("/apply-price")
async def apply_price(req: ApplyPriceRequest):
    """Update a product's base price to simulate accepting an AI recommendation."""
    try:
        response = supabase.table("products").update({"base_price": req.price}).eq("id", req.product_id).execute()
        return {"status": "success", "message": f"Price updated to {req.price}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate-market")
async def simulate_market(req: MarketEventRequest):
    """Inject extreme data into the mock database to trigger dashboard responses."""
    try:
        if req.event_type == "surge":
            # Add a massive sales bump today
            supabase.table("sales_data").insert({
                "product_id": req.product_id,
                "units_sold": 500,
                "sale_date": datetime.now().strftime("%Y-%m-%d")
            }).execute()
            
            # Add a trend spike
            supabase.table("trend_metrics").insert({
                "product_id": req.product_id,
                "trend_score": 98.0,
                "recorded_at": datetime.now().isoformat()
            }).execute()
            
        elif req.event_type == "competitor_undercut":
            # Add an aggressive competitor price drop
            current_product = supabase.table("products").select("base_price").eq("id", req.product_id).execute()
            p = current_product.data[0]['base_price'] if current_product.data else 100.0
            
            supabase.table("competitor_prices").insert({
                "product_id": req.product_id,
                "competitor_name": "AggressiveRival",
                "price": round(p * 0.70, 2), # 30% cheaper!
                "recorded_at": datetime.now().isoformat()
            }).execute()
        else:
            raise HTTPException(status_code=400, detail="Unknown event type.")
            
        return {"status": "success", "event": req.event_type}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
