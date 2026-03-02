import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for API data fetching with:
 * - Loading & error state management
 * - Auto-refresh polling (default 60s)
 * - Cleanup on unmount (no memory leaks)
 * - Manual refetch capability
 * - Last updated timestamp
 *
 * @param {Function} fetchFn - Async function that returns data
 * @param {Object} options
 * @param {number} options.refreshInterval - Polling interval in ms (default 60000, 0 to disable)
 * @param {boolean} options.enabled - Whether to fetch (default true)
 * @param {any[]} options.deps - Dependency array for re-fetching
 */
export default function useApiData(fetchFn, options = {}) {
    const {
        refreshInterval = 60000,
        enabled = true,
        deps = [],
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const mountedRef = useRef(true);
    const fetchFnRef = useRef(fetchFn);
    fetchFnRef.current = fetchFn;

    const fetchData = useCallback(async (isRefresh = false) => {
        if (!mountedRef.current) return;

        if (isRefresh) {
            setIsRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const result = await fetchFnRef.current();
            if (mountedRef.current) {
                setData(result);
                setLastUpdated(new Date());
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err.message || 'Failed to fetch data');
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }
    }, []);

    // Initial fetch + deps change
    useEffect(() => {
        if (enabled) {
            fetchData(false);
        }
    }, [enabled, fetchData, ...deps]);

    // Auto-refresh polling
    useEffect(() => {
        if (!enabled || !refreshInterval || refreshInterval <= 0) return;

        const interval = setInterval(() => {
            fetchData(true);
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [enabled, refreshInterval, fetchData]);

    // Cleanup on unmount
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const refetch = useCallback(() => fetchData(false), [fetchData]);

    return { data, loading, error, refetch, lastUpdated, isRefreshing };
}
