-- =============================================
-- PricePilot AI — Actual Database Schema
-- Reference DDL (tables already created in Supabase)
-- =============================================

-- Central product catalog
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    base_price NUMERIC(10,2) NOT NULL CHECK (base_price > 0),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Competitor pricing history (FK → products)
CREATE TABLE IF NOT EXISTS competitor_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    competitor_name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price > 0),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comp_product ON competitor_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_comp_recorded ON competitor_prices(recorded_at DESC);

-- Google Trends / market trend signals (FK → products)
CREATE TABLE IF NOT EXISTS trend_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    trend_score NUMERIC(5,2) CHECK (trend_score BETWEEN 0 AND 100),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trend_product ON trend_metrics(product_id);

-- Historical / simulated sales (FK → products)
CREATE TABLE IF NOT EXISTS sales_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    units_sold INT4 NOT NULL CHECK (units_sold >= 0),
    sale_date DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sales_product ON sales_data(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_data(sale_date DESC);

-- Demand forecasts (FK → products) — Phase 3+
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    predicted_demand NUMERIC(10,2) NOT NULL,
    confidence NUMERIC(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    forecast_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Price recommendations (FK → products) — Phase 4+
CREATE TABLE IF NOT EXISTS price_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    recommended_price NUMERIC(10,2) NOT NULL CHECK (recommended_price > 0),
    expected_revenue NUMERIC(12,2),
    confidence NUMERIC(5,4) CHECK (confidence BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ DEFAULT now()
);
