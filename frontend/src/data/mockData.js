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
        id: 1,
        type: 'increase',
        title: 'Increase price by 8%',
        description: 'Market analysis indicates strong demand with low elasticity. Competitor A recently raised prices.',
        impact: '+$124K',
        impactPercent: '+12.4%',
        confidence: 92,
        urgency: 'High',
    },
    {
        id: 2,
        type: 'discount',
        title: 'Schedule discount window',
        description: 'Forecast shows demand dip in weeks 3–4. A targeted 15% discount could capture market share.',
        impact: '+$67K',
        impactPercent: '+6.7%',
        confidence: 78,
        urgency: 'Medium',
    },
    {
        id: 3,
        type: 'stock',
        title: 'Increase stock before surge',
        description: 'Historical data and search trends predict a 40% demand surge in the next 6 weeks.',
        impact: '+$210K',
        impactPercent: '+21.0%',
        confidence: 85,
        urgency: 'High',
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
