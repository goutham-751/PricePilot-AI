"""
Pydantic schemas matching the actual Supabase tables.
All tables use product_id (UUID FK → products.id) as the linking key.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


# ── Products (central entity) ───────────────────────────────────────

class ProductCreate(BaseModel):
    """Input schema for creating a product."""
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    base_price: float = Field(..., gt=0)

    @field_validator("base_price")
    @classmethod
    def round_price(cls, v: float) -> float:
        return round(v, 2)


class ProductResponse(BaseModel):
    """Response schema for product records."""
    id: str
    name: str
    category: str
    base_price: float
    created_at: str


# ── Competitor Prices ────────────────────────────────────────────────

class CompetitorPriceCreate(BaseModel):
    """Input schema for a scraped competitor price."""
    product_id: str = Field(..., description="UUID FK → products.id")
    competitor_name: str = Field(..., min_length=1, max_length=255)
    price: float = Field(..., gt=0)

    @field_validator("price")
    @classmethod
    def round_price(cls, v: float) -> float:
        return round(v, 2)


class CompetitorPriceResponse(BaseModel):
    """Response schema for competitor price records."""
    id: str
    product_id: str
    competitor_name: str
    price: float
    recorded_at: str


# ── Trend Metrics ────────────────────────────────────────────────────

class TrendMetricCreate(BaseModel):
    """Input schema for a trend data point."""
    product_id: str = Field(..., description="UUID FK → products.id")
    trend_score: float = Field(..., ge=0, le=100)

    @field_validator("trend_score")
    @classmethod
    def round_score(cls, v: float) -> float:
        return round(v, 2)


class TrendMetricResponse(BaseModel):
    """Response schema for trend metric records."""
    id: str
    product_id: str
    trend_score: float
    recorded_at: str


# ── Sales Data ───────────────────────────────────────────────────────

class SalesRecordCreate(BaseModel):
    """Input schema for a sales record."""
    product_id: str = Field(..., description="UUID FK → products.id")
    units_sold: int = Field(..., ge=0)
    sale_date: date

    @field_validator("units_sold")
    @classmethod
    def validate_units(cls, v: int) -> int:
        if v < 0:
            raise ValueError("units_sold cannot be negative")
        return v


class SalesRecordResponse(BaseModel):
    """Response schema for sales records."""
    id: str
    product_id: str
    units_sold: int
    sale_date: str


# ── Demand Forecasts (for later phases) ──────────────────────────────

class DemandForecastCreate(BaseModel):
    """Input schema for a demand forecast."""
    product_id: str = Field(..., description="UUID FK → products.id")
    predicted_demand: float = Field(..., ge=0)
    confidence: float = Field(..., ge=0, le=1)
    forecast_date: date


class DemandForecastResponse(BaseModel):
    """Response schema for demand forecast records."""
    id: str
    product_id: str
    predicted_demand: float
    confidence: float
    forecast_date: str
    created_at: str


# ── Price Recommendations (for later phases) ─────────────────────────

class PriceRecommendationCreate(BaseModel):
    """Input schema for a price recommendation."""
    product_id: str = Field(..., description="UUID FK → products.id")
    recommended_price: float = Field(..., gt=0)
    expected_revenue: float = Field(..., ge=0)
    confidence: float = Field(..., ge=0, le=1)

    @field_validator("recommended_price", "expected_revenue")
    @classmethod
    def round_money(cls, v: float) -> float:
        return round(v, 2)


class PriceRecommendationResponse(BaseModel):
    """Response schema for price recommendation records."""
    id: str
    product_id: str
    recommended_price: float
    expected_revenue: float
    confidence: float
    created_at: str
