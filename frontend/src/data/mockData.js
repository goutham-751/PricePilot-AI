// ── Market Signals Stream ───────────────────────────
export const marketSignals = [
    { id: 1, time: '14:32:07', type: 'competitor', message: 'COMPETITOR A dropped "Pro Suite" price by 12% to $48.39', severity: 'alert' },
    { id: 2, time: '14:31:52', type: 'trend', message: 'Search volume for "pricing tools" surged +340% this week', severity: 'info' },
    { id: 3, time: '14:31:14', type: 'inventory', message: 'Stock levels for SKU-7721 fell below reorder threshold', severity: 'warning' },
    { id: 4, time: '14:30:48', type: 'competitor', message: 'COMPETITOR C launched new "Enterprise" tier at $89.99/mo', severity: 'info' },
    { id: 5, time: '14:30:02', type: 'trend', message: 'Seasonal demand index shifted from RISING → PEAK', severity: 'info' },
    { id: 6, time: '14:29:33', type: 'competitor', message: 'COMPETITOR B increased "Starter Plan" by 8% to $28.99', severity: 'positive' },
    { id: 7, time: '14:28:51', type: 'trend', message: 'Consumer sentiment score improved to 78/100 (+6 pts)', severity: 'positive' },
    { id: 8, time: '14:28:12', type: 'inventory', message: 'Warehouse fulfillment rate dropped to 91.2% (-3.8%)', severity: 'warning' },
    { id: 9, time: '14:27:44', type: 'competitor', message: 'COMPETITOR D pulled "Free Trial" offer — paywall active', severity: 'info' },
    { id: 10, time: '14:27:01', type: 'trend', message: 'Price elasticity coefficient shifted to -1.42 (elastic range)', severity: 'alert' },
    { id: 11, time: '14:26:19', type: 'competitor', message: 'COMPETITOR A added "AI Features" bundle at +$15/mo premium', severity: 'info' },
    { id: 12, time: '14:25:38', type: 'trend', message: 'Google Trends index for category: 82 (+14 from last week)', severity: 'positive' },
    { id: 13, time: '14:24:55', type: 'inventory', message: 'Lead time from supplier increased: 5 days → 8 days', severity: 'warning' },
    { id: 14, time: '14:24:10', type: 'competitor', message: 'COMPETITOR B offering 30-day money-back guarantee promotion', severity: 'alert' },
    { id: 15, time: '14:23:22', type: 'trend', message: 'Conversion rate on pricing page: 4.7% (+0.8% WoW)', severity: 'positive' },
];

// ── Forecast Timeline (Past + Future with Confidence) ──
export const forecastTimeline = [
    { month: 'Jul', past: 4200, forecast: null, upper: null, lower: null },
    { month: 'Aug', past: 4800, forecast: null, upper: null, lower: null },
    { month: 'Sep', past: 5400, forecast: null, upper: null, lower: null },
    { month: 'Oct', past: 6100, forecast: null, upper: null, lower: null },
    { month: 'Nov', past: 7200, forecast: null, upper: null, lower: null },
    { month: 'Dec', past: 8100, forecast: null, upper: null, lower: null },
    { month: 'Jan', past: 7800, forecast: 7800, upper: 7800, lower: 7800 },
    { month: 'Feb', past: null, forecast: 8200, upper: 8900, lower: 7500 },
    { month: 'Mar', past: null, forecast: 8900, upper: 9800, lower: 7900 },
    { month: 'Apr', past: null, forecast: 9400, upper: 10700, lower: 8100 },
    { month: 'May', past: null, forecast: 10200, upper: 12000, lower: 8400 },
    { month: 'Jun', past: null, forecast: 11500, upper: 13800, lower: 9200 },
];

// ── Optimal Pricing ─────────────────────────────────
export const optimalPricing = {
    currentPrice: 49.99,
    optimalPrice: 54.49,
    confidence: 94,
    revenueImpact: '+$186K',
    revenueImpactPercent: '+18.6%',
    demandChange: '-2.1%',
    marginImprovement: '+22.4%',
    elasticity: -1.42,
    competitorAvg: 52.87,
};

// ── Executive KPIs ──────────────────────────────────
export const executiveKPIs = {
    revenueScore: { value: 87, label: 'Revenue Opportunity Score', change: +12.4, unit: '/100' },
    demandMomentum: { value: 73, label: 'Demand Momentum', change: +8.2, unit: '%' },
    marketVolatility: { value: 34, label: 'Market Volatility', change: -5.1, unit: '%' },
};

// ── Demand Forecast ─────────────────────────────────
export const demandForecastData = [
    { month: 'Jan', actual: 4200, forecast: 4100, season: 'Low' },
    { month: 'Feb', actual: 4800, forecast: 4600, season: 'Low' },
    { month: 'Mar', actual: 5400, forecast: 5200, season: 'Rising' },
    { month: 'Apr', actual: 6100, forecast: 5900, season: 'Rising' },
    { month: 'May', actual: 7200, forecast: 6800, season: 'Peak' },
    { month: 'Jun', actual: 8100, forecast: 7500, season: 'Peak' },
    { month: 'Jul', actual: 7800, forecast: 7900, season: 'Peak' },
    { month: 'Aug', actual: 7200, forecast: 7400, season: 'Declining' },
    { month: 'Sep', actual: 6400, forecast: 6600, season: 'Declining' },
    { month: 'Oct', actual: 5800, forecast: 5900, season: 'Low' },
    { month: 'Nov', actual: 6200, forecast: 6100, season: 'Rising' },
    { month: 'Dec', actual: 7800, forecast: 7600, season: 'Peak' },
];

// ── Competitor Pricing ──────────────────────────────
export const competitorPricingData = [
    { name: 'Your Price', price: 49.99, variance: 0, position: 'Competitive' },
    { name: 'Competitor A', price: 54.99, variance: +10.0, position: 'Premium' },
    { name: 'Competitor B', price: 44.99, variance: -10.0, position: 'Budget' },
    { name: 'Competitor C', price: 52.49, variance: +5.0, position: 'Mid-Premium' },
    { name: 'Competitor D', price: 47.99, variance: -4.0, position: 'Competitive' },
];

export const priceHistoryData = [
    { week: 'W1', you: 49.99, compA: 54.99, compB: 44.99, compC: 52.49 },
    { week: 'W2', you: 49.99, compA: 53.99, compB: 45.99, compC: 51.99 },
    { week: 'W3', you: 48.99, compA: 54.49, compB: 44.49, compC: 52.99 },
    { week: 'W4', you: 49.99, compA: 55.99, compB: 43.99, compC: 53.49 },
    { week: 'W5', you: 51.99, compA: 54.99, compB: 44.99, compC: 52.49 },
    { week: 'W6', you: 49.99, compA: 53.49, compB: 45.49, compC: 51.49 },
    { week: 'W7', you: 49.99, compA: 54.99, compB: 44.99, compC: 52.99 },
    { week: 'W8', you: 49.99, compA: 56.99, compB: 43.49, compC: 53.99 },
];

// ── Recommendations ─────────────────────────────────
export const recommendations = [
    {
        id: 1, type: 'increase', title: 'Increase price by 8%',
        description: 'Market analysis indicates strong demand with low elasticity. Competitor A recently raised prices.',
        impact: '+$124K', impactPercent: '+12.4%', confidence: 92, urgency: 'High',
    },
    {
        id: 2, type: 'discount', title: 'Schedule discount window',
        description: 'Forecast shows demand dip in weeks 3–4. A targeted 15% discount could capture market share.',
        impact: '+$67K', impactPercent: '+6.7%', confidence: 78, urgency: 'Medium',
    },
    {
        id: 3, type: 'stock', title: 'Increase stock before surge',
        description: 'Historical data and search trends predict a 40% demand surge in the next 6 weeks.',
        impact: '+$210K', impactPercent: '+21.0%', confidence: 85, urgency: 'High',
    },
];

// ── Market Trend Data ───────────────────────────────
export const marketTrendData = [
    { month: 'Jan', trend: 42, sentiment: 55 },
    { month: 'Feb', trend: 48, sentiment: 58 },
    { month: 'Mar', trend: 55, sentiment: 62 },
    { month: 'Apr', trend: 61, sentiment: 59 },
    { month: 'May', trend: 72, sentiment: 71 },
    { month: 'Jun', trend: 81, sentiment: 75 },
    { month: 'Jul', trend: 78, sentiment: 72 },
    { month: 'Aug', trend: 72, sentiment: 68 },
    { month: 'Sep', trend: 64, sentiment: 65 },
    { month: 'Oct', trend: 58, sentiment: 60 },
    { month: 'Nov', trend: 62, sentiment: 63 },
    { month: 'Dec', trend: 78, sentiment: 74 },
];

// ══════════════════════════════════════════════════════
// NEW MODULE DATA — maps to backend structure
// ══════════════════════════════════════════════════════

// ── Competitor Intel (api/competitors + services/scraper) ──
export const competitorProfiles = [
    { id: 'A', name: 'CloudPrice Pro', domain: 'cloudpricepro.io', lastScraped: '2 min ago', status: 'active', priceRange: '$39–89', products: 12, strategy: 'Premium', threatLevel: 'high' },
    { id: 'B', name: 'BudgetBase', domain: 'budgetbase.com', lastScraped: '5 min ago', status: 'active', priceRange: '$19–49', products: 8, strategy: 'Budget', threatLevel: 'medium' },
    { id: 'C', name: 'PriceForge', domain: 'priceforge.ai', lastScraped: '8 min ago', status: 'active', priceRange: '$45–99', products: 15, strategy: 'Mid-Premium', threatLevel: 'high' },
    { id: 'D', name: 'ValueStack', domain: 'valuestack.co', lastScraped: '12 min ago', status: 'active', priceRange: '$29–59', products: 6, strategy: 'Competitive', threatLevel: 'low' },
    { id: 'E', name: 'RateMaster', domain: 'ratemaster.app', lastScraped: '15 min ago', status: 'stale', priceRange: '$35–79', products: 10, strategy: 'Dynamic', threatLevel: 'medium' },
];

export const scraperJobs = [
    { id: 1, target: 'cloudpricepro.io', status: 'completed', duration: '2.3s', records: 48, lastRun: '14:32:07' },
    { id: 2, target: 'budgetbase.com', status: 'completed', duration: '1.8s', records: 32, lastRun: '14:27:12' },
    { id: 3, target: 'priceforge.ai', status: 'running', duration: '—', records: 0, lastRun: '14:35:00' },
    { id: 4, target: 'valuestack.co', status: 'completed', duration: '3.1s', records: 24, lastRun: '14:20:44' },
    { id: 5, target: 'ratemaster.app', status: 'failed', duration: '5.0s', records: 0, lastRun: '14:18:22', error: 'CAPTCHA detected' },
];

// ── Forecasting (api/forecasting + models/demand_model) ──
export const forecastModelMetrics = {
    model: 'Prophet + LightGBM Ensemble',
    version: 'v3.2.1',
    lastTrained: '2026-02-22 08:00 UTC',
    mape: 4.2,
    rmse: 312,
    r2: 0.94,
    trainingDataPoints: 14580,
    features: 47,
    crossValidationFolds: 5,
    seasonalComponents: ['weekly', 'monthly', 'quarterly', 'yearly'],
    regressors: ['google_trends', 'competitor_prices', 'inventory_levels', 'sentiment_score'],
};

export const forecastBreakdown = [
    { component: 'Trend', contribution: 42, direction: 'up' },
    { component: 'Weekly Seasonality', contribution: 18, direction: 'up' },
    { component: 'Monthly Seasonality', contribution: 12, direction: 'down' },
    { component: 'Competitor Effect', contribution: 15, direction: 'up' },
    { component: 'Google Trends', contribution: 8, direction: 'up' },
    { component: 'Residual', contribution: 5, direction: 'neutral' },
];

// ── Pricing Engine (api/pricing + models/price_optimizer + models/elasticity_model) ──
export const elasticityCurve = [
    { price: 29.99, demand: 12400, revenue: 371876 },
    { price: 34.99, demand: 11200, revenue: 391888 },
    { price: 39.99, demand: 10100, revenue: 403899 },
    { price: 44.99, demand: 9100, revenue: 409409 },
    { price: 49.99, demand: 8200, revenue: 409918 },
    { price: 54.49, demand: 7600, revenue: 414124 },
    { price: 59.99, demand: 6800, revenue: 407932 },
    { price: 64.99, demand: 5900, revenue: 383441 },
    { price: 69.99, demand: 5000, revenue: 349950 },
    { price: 74.99, demand: 4100, revenue: 307459 },
];

export const pricingScenarios = [
    { id: 1, name: 'Aggressive Growth', price: 44.99, revenue: '+$82K', demand: '+12%', margin: '-3.2%', risk: 'low' },
    { id: 2, name: 'Balanced Optimal', price: 54.49, revenue: '+$186K', demand: '-2.1%', margin: '+22.4%', risk: 'low' },
    { id: 3, name: 'Premium Push', price: 64.99, revenue: '+$45K', demand: '-18%', margin: '+38.1%', risk: 'medium' },
    { id: 4, name: 'Market Penetration', price: 39.99, revenue: '-$28K', demand: '+28%', margin: '-12.8%', risk: 'high' },
];

export const elasticityModelInfo = {
    algorithm: 'Gradient Descent v3 + Bayesian Optimization',
    elasticityCoefficient: -1.42,
    crossElasticity: 0.34,
    optimalPriceRange: { min: 51.99, max: 57.99 },
    lastCalibrated: '2026-02-22 06:30 UTC',
    r2Score: 0.91,
};

// ── Analytics (api/analytics + services/feature_engineering) ──
export const analyticsKPIs = [
    { label: 'Total Revenue', value: '$1.24M', change: '+14.2%', trend: 'up' },
    { label: 'Avg. Order Value', value: '$54.32', change: '+6.8%', trend: 'up' },
    { label: 'Customer LTV', value: '$342', change: '+9.1%', trend: 'up' },
    { label: 'Churn Rate', value: '3.2%', change: '-1.4%', trend: 'down' },
    { label: 'Conversion Rate', value: '4.7%', change: '+0.8%', trend: 'up' },
    { label: 'Cart Abandonment', value: '22.1%', change: '-3.2%', trend: 'down' },
];

export const featureImportance = [
    { feature: 'competitor_price_delta', importance: 0.24, category: 'competitor' },
    { feature: 'google_trends_index', importance: 0.18, category: 'market' },
    { feature: 'seasonal_index', importance: 0.15, category: 'temporal' },
    { feature: 'inventory_velocity', importance: 0.12, category: 'supply' },
    { feature: 'sentiment_score', importance: 0.10, category: 'market' },
    { feature: 'price_elasticity_30d', importance: 0.08, category: 'pricing' },
    { feature: 'promo_active_flag', importance: 0.06, category: 'marketing' },
    { feature: 'day_of_week', importance: 0.04, category: 'temporal' },
    { feature: 'weather_index', importance: 0.02, category: 'external' },
    { feature: 'page_views_7d', importance: 0.01, category: 'engagement' },
];

// ── Decision Engine (services/decision_engine) ──
export const decisionRules = [
    { id: 1, name: 'Competitor Undercut Response', trigger: 'competitor_delta < -10%', action: 'Match price within 5% if margin > 15%', status: 'active', lastTriggered: '2h ago', priority: 'critical' },
    { id: 2, name: 'Demand Surge Capture', trigger: 'demand_momentum > 80', action: 'Increase price by 5-8% gradually', status: 'active', lastTriggered: '6h ago', priority: 'high' },
    { id: 3, name: 'Low Inventory Guard', trigger: 'stock_days < 14', action: 'Hold price, suppress promotions', status: 'active', lastTriggered: '1d ago', priority: 'high' },
    { id: 4, name: 'Seasonal Discount Window', trigger: 'season == "declining" && margin > 20%', action: 'Apply 10-15% discount tier', status: 'paused', lastTriggered: '3d ago', priority: 'medium' },
    { id: 5, name: 'New Entrant Alert', trigger: 'new_competitor_detected', action: 'Run competitive analysis, notify team', status: 'active', lastTriggered: 'Never', priority: 'medium' },
    { id: 6, name: 'Margin Floor Protection', trigger: 'projected_margin < 12%', action: 'Block price decrease, escalate to review', status: 'active', lastTriggered: '12h ago', priority: 'critical' },
];

export const decisionLog = [
    { time: '14:32:00', rule: 'Competitor Undercut Response', input: 'COMP_A price drop -12%', decision: 'ADJUST: match within 5%', confidence: 91 },
    { time: '14:28:00', rule: 'Demand Surge Capture', input: 'Momentum = 73', decision: 'HOLD: below threshold', confidence: 88 },
    { time: '14:20:00', rule: 'Margin Floor Protection', input: 'Margin = 18.4%', decision: 'PASS: above floor', confidence: 95 },
    { time: '14:12:00', rule: 'Low Inventory Guard', input: 'Stock days = 22', decision: 'PASS: sufficient stock', confidence: 97 },
    { time: '13:55:00', rule: 'Competitor Undercut Response', input: 'COMP_B price +8%', decision: 'HOLD: favorable movement', confidence: 93 },
];

// ── Data Pipeline (services/scraper, trends_fetcher, core/scheduler) ──
export const pipelineJobs = [
    { id: 'scraper-main', name: 'Competitor Price Scraper', service: 'services/scraper.py', cron: '*/15 * * * *', status: 'running', lastRun: '14:30:00', nextRun: '14:45:00', avgDuration: '12s', successRate: 94.2 },
    { id: 'trends-fetch', name: 'Google Trends Fetcher', service: 'services/trends_fetcher.py', cron: '0 */2 * * *', status: 'idle', lastRun: '14:00:00', nextRun: '16:00:00', avgDuration: '8s', successRate: 98.7 },
    { id: 'feature-eng', name: 'Feature Engineering Pipeline', service: 'services/feature_engineering.py', cron: '0 */6 * * *', status: 'idle', lastRun: '12:00:00', nextRun: '18:00:00', avgDuration: '45s', successRate: 99.1 },
    { id: 'demand-train', name: 'Demand Model Retraining', service: 'models/demand_model.py', cron: '0 8 * * *', status: 'idle', lastRun: '08:00:00', nextRun: 'Tomorrow 08:00', avgDuration: '4m 22s', successRate: 97.8 },
    { id: 'elasticity-cal', name: 'Elasticity Calibration', service: 'models/elasticity_model.py', cron: '0 6 * * 1', status: 'idle', lastRun: 'Mon 06:00', nextRun: 'Next Mon 06:00', avgDuration: '2m 14s', successRate: 96.5 },
    { id: 'price-opt', name: 'Price Optimizer Run', service: 'models/price_optimizer.py', cron: '0 */4 * * *', status: 'idle', lastRun: '12:00:00', nextRun: '16:00:00', avgDuration: '1m 08s', successRate: 99.4 },
    { id: 'decision-eval', name: 'Decision Rule Evaluation', service: 'services/decision_engine.py', cron: '*/5 * * * *', status: 'completed', lastRun: '14:35:00', nextRun: '14:40:00', avgDuration: '3s', successRate: 99.9 },
];

export const pipelineLogs = [
    { time: '14:35:02', job: 'decision-eval', level: 'INFO', message: 'Evaluated 6 rules, 0 actions triggered' },
    { time: '14:30:14', job: 'scraper-main', level: 'INFO', message: 'Scraping 5 competitor domains...' },
    { time: '14:30:18', job: 'scraper-main', level: 'OK', message: 'cloudpricepro.io: 48 records extracted in 2.3s' },
    { time: '14:30:20', job: 'scraper-main', level: 'OK', message: 'budgetbase.com: 32 records extracted in 1.8s' },
    { time: '14:30:26', job: 'scraper-main', level: 'WARN', message: 'ratemaster.app: CAPTCHA detected, retry queued' },
    { time: '14:00:08', job: 'trends-fetch', level: 'INFO', message: 'Fetched Google Trends for 12 keywords' },
    { time: '14:00:12', job: 'trends-fetch', level: 'OK', message: 'Trend index updated: avg 72.4 (+8.1 from last fetch)' },
    { time: '12:00:45', job: 'feature-eng', level: 'INFO', message: 'Generated 47 features from 14,580 data points' },
    { time: '08:04:22', job: 'demand-train', level: 'OK', message: 'Model retrained: MAPE=4.2%, R²=0.94' },
];

// ── System Status (core/ + db/) ─────────────────────
export const systemServices = [
    { name: 'FastAPI Server', module: 'app/main.py', status: 'healthy', uptime: '14d 6h 32m', cpu: 12, memory: 340, requests: '2.4K/min' },
    { name: 'Supabase DB', module: 'db/supabase_client.py', status: 'healthy', uptime: '30d+', latency: '12ms', connections: '8/100', storage: '2.1 GB' },
    { name: 'APScheduler', module: 'core/scheduler.py', status: 'healthy', uptime: '14d 6h 32m', activeJobs: 7, completedToday: 142, failedToday: 2 },
    { name: 'Security Layer', module: 'core/security.py', status: 'healthy', authMethod: 'API Key + JWT', activeTokens: 3, blockedRequests: 12 },
];

export const dbSchemaInfo = {
    tables: [
        { name: 'products', rows: 1247, columns: 18, lastUpdated: '14:32:07' },
        { name: 'competitor_prices', rows: 48920, columns: 12, lastUpdated: '14:30:14' },
        { name: 'demand_history', rows: 14580, columns: 22, lastUpdated: '08:04:22' },
        { name: 'price_changes', rows: 3421, columns: 14, lastUpdated: '12:00:00' },
        { name: 'market_trends', rows: 8640, columns: 8, lastUpdated: '14:00:12' },
        { name: 'decisions_log', rows: 2847, columns: 16, lastUpdated: '14:35:02' },
    ],
    totalSize: '2.1 GB',
    provider: 'Supabase (PostgreSQL)',
    region: 'us-east-1',
};

export const configInfo = {
    environment: 'production',
    apiVersion: 'v3.2.1',
    pythonVersion: '3.11.4',
    framework: 'FastAPI 0.109',
    deployment: 'Docker + Railway',
    corsOrigins: ['https://pricepilot.ai', 'http://localhost:5173'],
    rateLimiting: '100 req/min per key',
    cacheBackend: 'Redis (256MB)',
};
