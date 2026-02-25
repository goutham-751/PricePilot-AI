/**
 * PricePilot AI — API Service Layer
 * 
 * Connects frontend to backend intelligence pipeline.
 * Falls back gracefully when API is unavailable.
 */

const API_BASE = 'http://localhost:8000';

async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`[API] ${endpoint} failed:`, error.message);
        return null;
    }
}

// ── Analytics ───────────────────────────────────────────────────────

export async function fetchAllSignals() {
    return apiFetch('/analytics/signals/all');
}

export async function fetchProductSignals(productId, yourPrice) {
    const params = yourPrice ? `?your_price=${yourPrice}` : '';
    return apiFetch(`/analytics/signals/${productId}${params}`);
}

export async function fetchKPIs() {
    return apiFetch('/analytics/kpis');
}

// ── Forecasting ─────────────────────────────────────────────────────

export async function predictDemand(productId, horizonDays = 14) {
    return apiFetch(`/forecasting/predict/${productId}?horizon_days=${horizonDays}`, {
        method: 'POST',
    });
}

export async function fetchLatestForecast(productId, limit = 14) {
    return apiFetch(`/forecasting/latest/${productId}?limit=${limit}`);
}

export async function fetchModelMetrics() {
    return apiFetch('/forecasting/model-metrics');
}

// ── Pricing ─────────────────────────────────────────────────────────

export async function fetchElasticity(productId, yourPrice) {
    const params = yourPrice ? `?your_price=${yourPrice}` : '';
    return apiFetch(`/pricing/elasticity/${productId}${params}`);
}

export async function fetchOptimization(productId) {
    return apiFetch(`/pricing/optimize/${productId}`);
}

export async function fetchScenarios(productId) {
    return apiFetch(`/pricing/scenarios/${productId}`);
}

export async function fetchRecommendations() {
    return apiFetch('/pricing/recommendations');
}

export async function fetchProductRecommendations(productId) {
    return apiFetch(`/pricing/recommendations/${productId}`);
}

// ── Health ───────────────────────────────────────────────────────────

export async function checkHealth() {
    return apiFetch('/health');
}
