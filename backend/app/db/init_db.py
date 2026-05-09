import sqlite3
import os
import uuid
import random
from datetime import datetime, timedelta
from db.sqlite_db import DB_PATH, get_db_connection

def create_tables(conn):
    cursor = conn.cursor()
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            base_price REAL NOT NULL,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS competitor_prices (
            id TEXT PRIMARY KEY,
            product_id TEXT,
            competitor_name TEXT NOT NULL,
            price REAL NOT NULL,
            recorded_at TEXT,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS trend_metrics (
            id TEXT PRIMARY KEY,
            product_id TEXT,
            trend_score REAL,
            recorded_at TEXT,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS sales_data (
            id TEXT PRIMARY KEY,
            product_id TEXT,
            units_sold INTEGER NOT NULL,
            sale_date TEXT NOT NULL,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS demand_forecasts (
            id TEXT PRIMARY KEY,
            product_id TEXT,
            predicted_demand REAL NOT NULL,
            confidence REAL NOT NULL,
            forecast_date TEXT NOT NULL,
            created_at TEXT
        );
        
        CREATE TABLE IF NOT EXISTS price_recommendations (
            id TEXT PRIMARY KEY,
            product_id TEXT,
            recommended_price REAL NOT NULL,
            expected_revenue_change REAL,
            confidence REAL,
            action TEXT DEFAULT 'hold',
            reasoning TEXT,
            created_at TEXT
        );
    """)
    conn.commit()

def seed_data(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM products")
    if cursor.fetchone()['count'] > 0:
        print("Database already seeded.")
        return

    print("Seeding SQLite database with mock historical data...")

    products = [
        {"id": str(uuid.uuid4()), "name": "Quantum X Pro Gaming Mouse", "category": "peripherals", "base_price": 129.99},
        {"id": str(uuid.uuid4()), "name": "Aether ANC Headphones", "category": "audio", "base_price": 249.00},
        {"id": str(uuid.uuid4()), "name": "Nebula 4K Monitor", "category": "displays", "base_price": 499.50},
    ]

    for p in products:
        cursor.execute(
            "INSERT INTO products (id, name, category, base_price, created_at) VALUES (?, ?, ?, ?, ?)",
            (p['id'], p['name'], p['category'], p['base_price'], datetime.now().isoformat())
        )

        # Seed sales data (last 30 days)
        for i in range(30):
            sale_date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            base_sales = random.randint(20, 80)
            if i % 7 in [5, 6]: # Weekend bump
                base_sales = int(base_sales * 1.5)
            
            cursor.execute(
                "INSERT INTO sales_data (id, product_id, units_sold, sale_date) VALUES (?, ?, ?, ?)",
                (str(uuid.uuid4()), p['id'], base_sales, sale_date)
            )
            
        # Seed competitor data (3 competitors, last 7 days)
        competitors = ["TechNova", "GameGear", "OptiBuy"]
        for comp in competitors:
            for i in range(7):
                recorded_at = (datetime.now() - timedelta(days=i, hours=random.randint(1, 12))).isoformat()
                comp_price = p['base_price'] * random.uniform(0.9, 1.1)
                cursor.execute(
                    "INSERT INTO competitor_prices (id, product_id, competitor_name, price, recorded_at) VALUES (?, ?, ?, ?, ?)",
                    (str(uuid.uuid4()), p['id'], comp, round(comp_price, 2), recorded_at)
                )

        # Seed trend metrics (last 10 days)
        trend_score = 50.0
        for i in range(10, -1, -1):
            recorded_at = (datetime.now() - timedelta(days=i)).isoformat()
            trend_score = max(0, min(100, trend_score + random.uniform(-5, 8)))
            cursor.execute(
                "INSERT INTO trend_metrics (id, product_id, trend_score, recorded_at) VALUES (?, ?, ?, ?)",
                (str(uuid.uuid4()), p['id'], round(trend_score, 2), recorded_at)
            )

    conn.commit()
    print("Database seeding complete.")

def init_db():
    conn = get_db_connection()
    create_tables(conn)
    seed_data(conn)
    conn.close()

if __name__ == "__main__":
    init_db()
