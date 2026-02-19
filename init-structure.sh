#!/bin/bash

echo "📁 Creating PricePilot-AI project structure..."

# BACKEND STRUCTURE


mkdir -p backend/app/api
mkdir -p backend/app/core
mkdir -p backend/app/models
mkdir -p backend/app/services
mkdir -p backend/app/db
mkdir -p backend/notebooks

touch backend/app/main.py

touch backend/app/api/pricing.py
touch backend/app/api/forecasting.py
touch backend/app/api/analytics.py
touch backend/app/api/competitors.py

touch backend/app/core/config.py
touch backend/app/core/security.py
touch backend/app/core/scheduler.py

touch backend/app/models/demand_model.py
touch backend/app/models/elasticity_model.py
touch backend/app/models/price_optimizer.py

touch backend/app/services/scraper.py
touch backend/app/services/trends_fetcher.py
touch backend/app/services/feature_engineering.py
touch backend/app/services/decision_engine.py

touch backend/app/db/supabase_client.py
touch backend/app/db/schemas.py

touch backend/requirements.txt
touch backend/Dockerfile