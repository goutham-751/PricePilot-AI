"""
Sales Data Simulator — Generates realistic historical sales data
with seasonality, trends, and price-demand elasticity for portfolio demo.

Features:
    - Configurable products, date ranges, and pricing
    - Built-in seasonality (spring/summer/monsoon/autumn/winter)
    - Price-demand elasticity (higher price → lower demand)
    - Random noise for realism
    - Batch insert to Supabase sales_data table

Usage:
    simulator = SalesSimulator()
    results = await simulator.generate_and_store(products, days=365)
"""

import math
import random
import logging
from datetime import date, timedelta
from typing import Optional

from db.supabase_client import supabase
from db.schemas import SalesRecordCreate

# ── Logging ──────────────────────────────────────────────────────────

logger = logging.getLogger("sales_simulator")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    ))
    logger.addHandler(handler)


# ── Seasonality ──────────────────────────────────────────────────────

def get_season(d: date) -> str:
    """Map a date to an Indian season."""
    month = d.month
    if month in (3, 4):
        return "spring"
    elif month in (5, 6):
        return "summer"
    elif month in (7, 8, 9):
        return "monsoon"
    elif month in (10, 11):
        return "autumn"
    else:
        return "winter"


def seasonal_multiplier(d: date) -> float:
    """
    Return a demand multiplier based on season.
    Simulates real-world buying patterns.
    """
    season = get_season(d)
    multipliers = {
        "spring": 1.0,
        "summer": 1.15,     # summer sales boost
        "monsoon": 0.85,    # monsoon dip
        "autumn": 1.05,     # pre-festival buying
        "winter": 1.30,     # holiday/Diwali/Christmas peak
    }
    return multipliers.get(season, 1.0)


# ── Simulator ────────────────────────────────────────────────────────

class SalesSimulator:
    """
    Generates synthetic but realistic sales data for demo purposes.
    Incorporates seasonality, weekday effects, trend growth, and noise.
    """

    def __init__(self, seed: Optional[int] = 42):
        if seed is not None:
            random.seed(seed)
        self.records: list[dict] = []

    def generate_sales(
        self,
        product_id: str,
        product_name: str,
        base_price: float,
        base_demand: int = 50,
        days: int = 365,
        end_date: Optional[date] = None,
        growth_rate: float = 0.0005,
        elasticity: float = -1.2,
    ) -> list[dict]:
        """
        Generate daily sales records for a product.

        Args:
            product_id: UUID of the product.
            product_name: Display name.
            base_price: Average price point.
            base_demand: Average daily units at base price.
            days: Number of days to simulate.
            end_date: Last date (defaults to today).
            growth_rate: Daily growth trend (0.0005 = ~20% annual).
            elasticity: Price elasticity coefficient (negative = elastic).

        Returns:
            List of sales record dicts.
        """
        if end_date is None:
            end_date = date.today()

        start_date = end_date - timedelta(days=days - 1)
        records = []

        for day_offset in range(days):
            current_date = start_date + timedelta(days=day_offset)

            # 1. Base demand with growth trend
            trend_factor = 1.0 + growth_rate * day_offset
            demand = base_demand * trend_factor

            # 2. Seasonality
            demand *= seasonal_multiplier(current_date)

            # 3. Weekday effect (weekends = +20%)
            if current_date.weekday() >= 5:
                demand *= 1.20

            # 4. Random daily price variation (±8%)
            daily_price = base_price * (1 + random.uniform(-0.08, 0.08))

            # 5. Price elasticity effect on demand
            price_ratio = daily_price / base_price
            elasticity_effect = price_ratio ** elasticity
            demand *= elasticity_effect

            # 6. Random noise (±15%)
            noise = random.gauss(1.0, 0.15)
            demand *= max(noise, 0.1)  # floor to prevent negatives

            # 7. Occasional spike days (flash sales, viral moments)
            if random.random() < 0.02:  # 2% chance
                demand *= random.uniform(1.5, 3.0)
                logger.debug(f"Spike day: {current_date}")

            units_sold = max(1, int(round(demand)))

            record = {
                "product_id": product_id,
                "units_sold": units_sold,
                "sale_date": current_date.isoformat(),
            }
            records.append(record)

        logger.info(
            f"Generated {len(records)} days of sales for '{product_name}' "
            f"(avg ~{sum(r['units_sold'] for r in records) // len(records)} units/day)"
        )
        return records

    async def generate_and_store(
        self,
        products: list[dict],
        days: int = 365,
    ) -> dict:
        """
        Generate sales data for multiple products and store in Supabase.

        Args:
            products: list of dicts with product_id, product_name, base_price,
                      and optionally base_demand, growth_rate, elasticity.
            days: Number of days to simulate.

        Returns:
            dict with 'total_records', 'stored', 'products_processed'.
        """
        all_records = []

        for product in products:
            records = self.generate_sales(
                product_id=product["product_id"],
                product_name=product.get("product_name", "Unknown"),
                base_price=product.get("base_price", 100.0),
                base_demand=product.get("base_demand", 50),
                days=days,
                growth_rate=product.get("growth_rate", 0.0005),
                elasticity=product.get("elasticity", -1.2),
            )
            all_records.extend(records)

        # Validate all records
        valid_records = []
        for r in all_records:
            try:
                validated = SalesRecordCreate(**r)
                valid_records.append(validated.model_dump(mode="json"))
            except Exception as e:
                logger.warning(f"Validation failed: {e}")

        # Batch insert into Supabase (in chunks of 500 to avoid payload limits)
        stored_count = 0
        chunk_size = 500
        for i in range(0, len(valid_records), chunk_size):
            chunk = valid_records[i:i + chunk_size]
            try:
                response = supabase.table("sales_data").insert(chunk).execute()
                count = len(response.data) if response.data else 0
                stored_count += count
                logger.info(f"✓ Stored chunk {i // chunk_size + 1}: {count} records")
            except Exception as e:
                logger.error(f"✗ Supabase insert failed for chunk {i // chunk_size + 1}: {e}")

        summary = {
            "total_records": len(all_records),
            "stored": stored_count,
            "products_processed": len(products),
        }

        logger.info(
            f"Simulation complete: {len(all_records)} records generated, "
            f"{stored_count} stored for {len(products)} products"
        )
        return summary


# ── Standalone test ──────────────────────────────────────────────────

if __name__ == "__main__":
    import asyncio

    async def _test():
        sim = SalesSimulator(seed=42)
        demo_products = [
            {
                "product_id": "test-uuid-1",
                "product_name": "Wireless Earbuds Pro",
                "base_price": 2499.00,
                "base_demand": 40,
            },
            {
                "product_id": "test-uuid-2",
                "product_name": "Smart Watch X",
                "base_price": 4999.00,
                "base_demand": 25,
            },
        ]
        result = await sim.generate_and_store(demo_products, days=90)
        print("\n=== SIMULATION RESULTS ===")
        print(f"Records: {result['total_records']}")
        print(f"Stored:  {result['stored']}")
        print(f"Products: {result['products_processed']}")

    asyncio.run(_test())
