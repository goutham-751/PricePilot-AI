"""
PricePilot AI — FastAPI Application Entry Point

The core intelligence API for pricing recommendations,
demand forecasting, and competitor analysis.

Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.competitors import router as competitors_router

# ── App Init ─────────────────────────────────────────────────────────

app = FastAPI(
    title="PricePilot AI",
    description=(
        "Intelligent pricing engine that ingests competitor data, "
        "market trends, and sales history to generate data-driven "
        "pricing recommendations and demand forecasts."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Vite dev server
        "http://localhost:3000",      # Alternate frontend
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────

app.include_router(competitors_router)

# ── Health Check ─────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    """Health check / root endpoint."""
    return {
        "service": "PricePilot AI",
        "status": "operational",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "competitors": "/competitors",
            "health": "/",
        },
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check with DB connectivity test."""
    from db.supabase_client import supabase

    db_status = "connected"
    try:
        # Quick query to verify DB connection
        supabase.table("products").select("id").limit(1).execute()
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "version": "1.0.0",
    }
