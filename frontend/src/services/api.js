/**
 * PricePilot AI — API Service Layer
 *
 * Central API client with retry logic, error handling,
 * and all endpoint functions for the backend pipeline.
 */

const API_BASE = 'http://localhost:8000';

/**
 * Core fetch wrapper with retry, timeout, and error handling.
 */
async function apiFetch(endpoint, options = {}, retries = 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorBody = await response.text().catch(() => '');
                throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeout);

            if (attempt < retries && !error.name?.includes('Abort')) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                continue;
            }

            console.warn(`[API] ${endpoint} failed after ${attempt + 1} attempt(s):`, error.message);
            throw error;
        }
    }
}

/**
 * Safe fetch that returns null on failure (for backward compat).
 */
async function safeFetch(endpoint, options = {}) {
    try {
        return await apiFetch(endpoint, options);
    } catch {
        return null;
    }
}

// ── Products ────────────────────────────────────────────────────────

export async function fetchProducts(limit = 50) {
    return apiFetch(`/products?limit=${limit}`);
}

export async function fetchProduct(productId) {
    return apiFetch(`/products/${productId}`);
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

export async function fetchAnalyticsSummary() {
    return apiFetch('/analytics/summary');
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

// ── Competitors ─────────────────────────────────────────────────────

export async function fetchCompetitorPrices(limit = 50) {
    return apiFetch(`/competitors?limit=${limit}`);
}

export async function fetchProductCompetitors(productId, limit = 100) {
    return apiFetch(`/competitors/${productId}?limit=${limit}`);
}

// ── Health ───────────────────────────────────────────────────────────

export async function checkHealth() {
    return apiFetch('/health');
}

// ── Demo / Simulation ─────────────────────────────────────────────────

export async function applyOptimalPrice(productId, price) {
    return apiFetch('/demo/apply-price', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, price }),
    });
}

export async function simulateMarketEvent(productId, eventType) {
    return apiFetch('/demo/simulate-market', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, event_type: eventType }),
    });
}

// ── Utility ─────────────────────────────────────────────────────────

export { apiFetch, safeFetch, API_BASE };
