<p align="center">
  <h1 align="center">🚀 PricePilot AI</h1>
  <p align="center">
    <strong>Intelligent Pricing Engine powered by Feature Engineering & Machine Learning</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#api-reference">API Reference</a> •
    <a href="#project-structure">Project Structure</a>
  </p>
</p>

---

## Overview

PricePilot AI is an end-to-end pricing intelligence platform that ingests competitor data, market trends, and sales history to generate **data-driven pricing recommendations** and **demand forecasts**. It transforms raw data into 10 intelligence signals via a feature engineering pipeline, then feeds them through demand forecasting, price elasticity estimation, and a rule-based decision engine to produce actionable pricing strategies with confidence scores.

---

## Features

### 🧠 Intelligence Pipeline
- **Feature Engineering** — Computes 10 real-time signals: competitor price averages, price variance, price position index, volatility, moving average demand, demand growth rate, seasonal index, trend momentum, trend acceleration, and elasticity estimates.
- **Demand Forecasting** — Holt-Winters triple exponential smoothing with trend/seasonality decomposition, confidence intervals, and spike detection.
- **Price Elasticity** — Log-log OLS regression (`log(Q) = a + ε·log(P)`) for elasticity coefficient, sensitivity classification, R² scoring, and optimal price range.
- **Price Optimization** — Revenue-maximizing price finder with 4 scenarios (Aggressive Growth, Balanced Optimal, Premium Push, Market Penetration).
- **Decision Engine** — 6 rule-based triggers (competitor undercut, demand surge, low demand, seasonal discount, trend surge prep, margin floor) with confidence scoring and audit trail.

### 📊 Data Collection
- **Competitor Scraping** — Automated competitor price extraction via HTTP + BeautifulSoup with retries, rate limiting, and normalization.
- **Google Trends** — Real-time trend data fetching via `pytrends` with fallback simulation.
- **Sales Simulation** — Synthetic sales data generation with seasonality, price elasticity, trend effects, and noise.

### 🎨 Premium Dashboard
- **Dark-themed executive dashboard** with solar system-inspired design language.
- **Real-time market signals feed** and AI action panel.
- **Interactive charts** — Demand forecasts, elasticity curves, pricing scenarios, feature importance.
- **Decision engine console** — Rules table, recommendations, and decision audit log.
- **Graceful fallback** — Pages render with mock data when the API is unavailable.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                │
│  ┌────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │ Analytics  │ │ Forecasting  │ │  Pricing Engine     │  │
│  │   Page     │ │    Page      │ │  + Decision Engine  │  │
│  └─────┬──────┘ └──────┬───────┘ └────────┬───────────┘  │
│        └───────────────┼──────────────────┘               │
│                   api.js (Service Layer)                   │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP (localhost:8000)
┌────────────────────────┼─────────────────────────────────┐
│                  BACKEND (FastAPI)                         │
│  ┌─────────────────────┴────────────────────────────┐    │
│  │              API Routes (FastAPI Routers)          │    │
│  │  /analytics  │  /forecasting  │  /pricing         │    │
│  └──────┬───────┴───────┬────────┴──────┬───────────┘    │
│         │               │               │                 │
│  ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────────┐    │
│  │  Feature    │ │  Demand     │ │  Elasticity      │    │
│  │  Engineer   │ │  Forecaster │ │  Estimator       │    │
│  │ (10 signals)│ │(Holt-Winters│ │ (Log-Log OLS)    │    │
│  └─────────────┘ └─────────────┘ └────────┬─────────┘    │
│                                           │               │
│                        ┌──────────────────┴──────┐       │
│                        │  Price Optimizer         │       │
│                        │  + Decision Engine       │       │
│                        │  (6 Rules · Scoring)     │       │
│                        └─────────────────────────┘       │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Data Collectors                                   │   │
│  │  Scraper · Trends Fetcher · Sales Simulator        │   │
│  └────────────────────────┬──────────────────────────┘   │
└───────────────────────────┼──────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │   Supabase    │
                    │  (PostgreSQL) │
                    └───────────────┘
```

---

## Tech Stack

| Layer      | Technology                                                                 |
|------------|----------------------------------------------------------------------------|
| **Frontend** | React 19, Vite 7, Framer Motion, Recharts, Lucide Icons                  |
| **Backend**  | FastAPI, Uvicorn, Pydantic                                               |
| **ML/Analytics** | NumPy, Pandas, Scikit-learn                                          |
| **Data Collection** | httpx, BeautifulSoup4, pytrends, Selenium                         |
| **Database** | Supabase (PostgreSQL)                                                    |
| **Styling**  | Custom CSS with glassmorphism, dark theme, JetBrains Mono typography     |

---

## Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Supabase** account with a project set up

### 1. Clone the Repository

```bash
git clone https://github.com/goutham-751/PricePilot-AI.git
cd PricePilot-AI
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key
```

### 3. Set Up the Database

Run the SQL in [`backend/app/db/supabase_tables.sql`](backend/app/db/supabase_tables.sql) in your Supabase SQL Editor to create the required tables:

- `products` — Product catalog
- `competitor_prices` — Scraped competitor pricing data
- `trend_metrics` — Google Trends data
- `sales_data` — Historical / simulated sales records
- `demand_forecasts` — Model predictions
- `price_recommendations` — Generated pricing recommendations

### 4. Start the Backend

```bash
cd backend
./venv/Scripts/Activate        # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
cd app
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the interactive Swagger UI.

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

---

## API Reference

### Health

| Method | Endpoint   | Description              |
|--------|-----------|--------------------------|
| GET    | `/`        | Root health check        |
| GET    | `/health`  | Detailed health + DB test |

### Competitors

| Method | Endpoint                           | Description                     |
|--------|------------------------------------|---------------------------------|
| GET    | `/competitors/prices`              | List all competitor prices      |
| GET    | `/competitors/prices/{product_id}` | Price history for a product     |
| POST   | `/competitors/scrape`              | Trigger a competitor scrape job |

### Analytics (Feature Engineering)

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/analytics/signals/all`          | Intelligence signals for all products |
| GET    | `/analytics/signals/{product_id}` | Signals for a specific product     |
| GET    | `/analytics/kpis`                 | Aggregated KPIs                    |

### Forecasting

| Method | Endpoint                             | Description                      |
|--------|--------------------------------------|----------------------------------|
| POST   | `/forecasting/predict/{product_id}`  | Generate demand forecast         |
| GET    | `/forecasting/latest/{product_id}`   | Get latest saved forecast        |
| GET    | `/forecasting/model-metrics`         | Model performance stats          |

### Pricing & Decision Engine

| Method | Endpoint                                  | Description                        |
|--------|-------------------------------------------|------------------------------------|
| GET    | `/pricing/elasticity/{product_id}`        | Price elasticity analysis          |
| GET    | `/pricing/optimize/{product_id}`          | Full price optimization            |
| GET    | `/pricing/scenarios/{product_id}`         | Pricing scenarios only             |
| GET    | `/pricing/recommendations`               | All recommendations + decision log |
| GET    | `/pricing/recommendations/{product_id}`   | Decision engine evaluation         |

---

## Project Structure

```
PricePilot-AI/
├── backend/
│   ├── app/
│   │   ├── api/                        # FastAPI route handlers
│   │   │   ├── analytics.py            # Intelligence signals & KPIs
│   │   │   ├── competitors.py          # Competitor data endpoints
│   │   │   ├── forecasting.py          # Demand prediction endpoints
│   │   │   └── pricing.py             # Elasticity, optimization, decisions
│   │   ├── models/                     # ML & analytics models
│   │   │   ├── demand_model.py         # Holt-Winters demand forecaster
│   │   │   ├── elasticity_model.py     # Log-log price elasticity
│   │   │   └── price_optimizer.py      # Revenue-maximizing optimizer
│   │   ├── services/                   # Business logic services
│   │   │   ├── feature_engineering.py  # 10 intelligence signals
│   │   │   ├── decision_engine.py      # 6-rule recommendation engine
│   │   │   ├── scraper.py             # Competitor price scraper
│   │   │   ├── trends_fetcher.py      # Google Trends integration
│   │   │   └── sales_simulator.py     # Synthetic sales generator
│   │   ├── db/
│   │   │   ├── supabase_client.py     # Supabase connection
│   │   │   ├── supabase_tables.sql    # Database DDL
│   │   │   └── schemas.py            # Pydantic validation schemas
│   │   ├── core/
│   │   │   └── config.py             # Application configuration
│   │   └── main.py                    # FastAPI app entry point
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/                     # Dashboard pages
│   │   │   ├── DashboardPage.jsx      # Main command center
│   │   │   ├── AnalyticsPage.jsx      # Feature signals & KPIs
│   │   │   ├── ForecastingPage.jsx    # Demand forecast charts
│   │   │   ├── PricingEnginePage.jsx  # Elasticity & scenarios
│   │   │   ├── DecisionEnginePage.jsx # Rules & recommendations
│   │   │   └── CompetitorIntelPage.jsx# Competitor analysis
│   │   ├── components/                # Reusable UI components
│   │   ├── services/
│   │   │   └── api.js                # Backend API service layer
│   │   ├── data/
│   │   │   └── mockData.js           # Fallback mock data
│   │   ├── App.jsx
│   │   └── index.css                 # Design system
│   └── package.json
│
├── .env                               # Environment variables
├── .gitignore
├── LICENSE
└── README.md
```

---

## Intelligence Signals

The feature engineering pipeline computes the following **10 signals** per product:

| Signal               | Category  | Description                                     |
|----------------------|-----------|-------------------------------------------------|
| `competitor_price_avg`   | Pricing   | Average competitor price                         |
| `price_variance`         | Pricing   | Standard deviation across competitor prices      |
| `price_position_index`   | Pricing   | Your price ÷ competitor average (1.0 = at parity)|
| `price_volatility`       | Pricing   | Low / Medium / High classification               |
| `moving_avg_demand`      | Demand    | 7-day rolling average unit sales                 |
| `demand_growth_rate`     | Demand    | Week-over-week demand change rate                |
| `seasonal_index`         | Demand    | Seasonal multiplier (< 1 = low season)           |
| `trend_momentum`         | Trend     | Weighted trend score delta                       |
| `trend_acceleration`     | Trend     | Rate of change of momentum                       |
| `elasticity_estimate`    | Sensitivity | Price-demand correlation coefficient            |

---

## Decision Engine Rules

| # | Rule                        | Trigger Condition                   | Action                      | Priority  |
|---|-----------------------------|------------------------------------|------------------------------|-----------|
| 1 | Competitor Undercut Response | `price_position > 1.10`            | Match price within 5%        | Critical  |
| 2 | Demand Surge Capture         | `growth > 15% AND momentum > 10`   | Increase 5–8%               | High      |
| 3 | Low Demand Guard             | `growth < -15%`                     | 10% discount                | High      |
| 4 | Seasonal Discount Window     | `seasonal_index < 0.9`             | 10–15% discount             | Medium    |
| 5 | Trend Surge Preparation      | `momentum > 15`                     | Increase stock              | Medium    |
| 6 | Margin Floor Protection      | `position < 0.85`                   | Block price decrease        | Critical  |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/goutham-751">Goutham</a>
</p>
