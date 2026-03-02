import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Terminal, AlertTriangle, TrendingUp, ArrowDownRight, Package } from 'lucide-react';
import { fetchAllSignals, fetchCompetitorPrices } from '../../services/api';
import SkeletonLoader from '../ui/SkeletonLoader';
import ErrorState from '../ui/ErrorState';

const severityConfig = {
    alert: { color: 'text-supernova-red', badge: 'bg-supernova-red/10 border-supernova-red/20 text-supernova-red', icon: AlertTriangle },
    warning: { color: 'text-yellow-400', badge: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400', icon: Package },
    info: { color: 'text-hyper-cyan', badge: 'bg-hyper-cyan/10 border-hyper-cyan/20 text-hyper-cyan', icon: TrendingUp },
    positive: { color: 'text-stellar-green', badge: 'bg-stellar-green/10 border-stellar-green/20 text-stellar-green', icon: ArrowDownRight },
};

/**
 * Generate market signal messages from live API data.
 */
function buildSignalsFromData(signals, competitors) {
    const messages = [];

    // From product signals
    if (signals?.length) {
        for (const s of signals.slice(0, 8)) {
            const name = s.product_name || s.product_id?.slice(0, 8);

            if (s.demand_growth_rate > 0.1) {
                messages.push({
                    type: 'trend', severity: 'positive',
                    message: `Demand for "${name}" surging +${(s.demand_growth_rate * 100).toFixed(1)}% growth rate`,
                });
            } else if (s.demand_growth_rate < -0.1) {
                messages.push({
                    type: 'trend', severity: 'warning',
                    message: `Demand for "${name}" declining ${(s.demand_growth_rate * 100).toFixed(1)}% — monitor closely`,
                });
            }

            if (s.price_position_index > 1.1) {
                messages.push({
                    type: 'competitor', severity: 'alert',
                    message: `"${name}" priced ${((s.price_position_index - 1) * 100).toFixed(0)}% above competitor avg — consider adjustment`,
                });
            } else if (s.price_position_index < 0.9) {
                messages.push({
                    type: 'competitor', severity: 'positive',
                    message: `"${name}" priced ${((1 - s.price_position_index) * 100).toFixed(0)}% below competitors — opportunity to increase`,
                });
            }

            if (s.trend_momentum > 15) {
                messages.push({
                    type: 'trend', severity: 'info',
                    message: `Trend momentum for "${name}" at +${s.trend_momentum.toFixed(1)} — strong upward signal`,
                });
            }

            if (s.price_volatility === 'high') {
                messages.push({
                    type: 'inventory', severity: 'warning',
                    message: `High price volatility detected for "${name}" — market instability`,
                });
            }
        }
    }

    // From competitor data
    if (competitors?.data?.length) {
        const recent = competitors.data.slice(0, 3);
        for (const c of recent) {
            messages.push({
                type: 'competitor', severity: 'info',
                message: `${c.competitor_name} recorded at $${parseFloat(c.price).toFixed(2)} for product ${c.product_id?.slice(0, 8)}`,
            });
        }
    }

    // Add timestamp to each
    return messages.map((m, i) => ({
        ...m,
        id: Date.now() + i,
        time: new Date(Date.now() - i * 45000).toLocaleTimeString('en-US', { hour12: false }),
    }));
}

export default function MarketSignalsFeed({ xrayMode }) {
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);
    const rawDataRef = useRef({ signals: null, competitors: null });
    const cycleIndexRef = useRef(0);

    const loadData = useCallback(async () => {
        try {
            setError(null);
            if (!rawDataRef.current.signals) setLoading(true);

            const [sigRes, compRes] = await Promise.all([
                fetchAllSignals(),
                fetchCompetitorPrices(20),
            ]);

            rawDataRef.current = { signals: sigRes?.signals, competitors: compRes };
            const built = buildSignalsFromData(sigRes?.signals, compRes);
            if (built.length) setSignals(built);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, []);

    // Initial load + 60s refresh
    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, [loadData]);

    // Cycle through signals for live feed effect
    useEffect(() => {
        if (signals.length === 0) return;

        const interval = setInterval(() => {
            cycleIndexRef.current = (cycleIndexRef.current + 1) % signals.length;
            const sig = signals[cycleIndexRef.current];
            const newSignal = {
                ...sig,
                id: Date.now(),
                time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            };
            setSignals(prev => [newSignal, ...prev.filter(s => s.id !== newSignal.id)].slice(0, 20));
        }, 4000);

        return () => clearInterval(interval);
    }, [signals.length]);

    // Auto-scroll to top
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [signals[0]?.id]);

    const jsonData = rawDataRef.current.signals
        ? JSON.stringify({ module: 'live_data', endpoint: '/analytics/signals/all', signals: rawDataRef.current.signals?.slice(0, 3) }, null, 2)
        : '{ "status": "loading..." }';

    if (error && signals.length === 0) {
        return (
            <div className="cosmic-card p-4 h-full flex flex-col">
                <div className="px-0 pb-3 border-b border-glass-border">
                    <div className="flex items-center gap-2 mb-1">
                        <Terminal className="w-4 h-4 text-hyper-cyan" />
                        <span className="mono-label text-hyper-cyan text-[0.65rem]">MARKET SIGNALS</span>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <ErrorState message={error} onRetry={loadData} compact />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="cosmic-card p-0 h-full flex flex-col"
        >
            <div className="px-4 pt-4 pb-3 border-b border-glass-border">
                <div className="flex items-center gap-2 mb-1">
                    <Terminal className="w-4 h-4 text-hyper-cyan" />
                    <span className="mono-label text-hyper-cyan text-[0.65rem]">MARKET SIGNALS</span>
                </div>
                <p className="text-[0.65rem] text-starlight-faint">
                    {loading ? 'Connecting to data stream...' : 'Real-time competitor & market feed'}
                </p>
            </div>

            <div className="flex-1 relative overflow-hidden">
                {loading ? (
                    <div className="p-3 space-y-2">
                        {Array.from({ length: 6 }, (_, i) => (
                            <div key={i} className="flex gap-2 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="w-5 h-5 rounded bg-white/[0.04] shrink-0" />
                                <div className="flex-1 space-y-1">
                                    <div className="h-2 bg-white/[0.03] rounded w-20" />
                                    <div className="h-2 bg-white/[0.02] rounded w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : xrayMode ? (
                    <div className="p-4 h-full overflow-auto">
                        <pre className="terminal-text text-hyper-cyan/70 whitespace-pre-wrap text-[0.65rem] leading-relaxed">
                            {jsonData}
                        </pre>
                    </div>
                ) : (
                    <div ref={scrollRef} className="p-3 h-full overflow-y-auto space-y-1">
                        {signals.map((signal, i) => {
                            const config = severityConfig[signal.severity] || severityConfig.info;
                            const Icon = config.icon;
                            return (
                                <motion.div
                                    key={signal.id}
                                    initial={i === 0 ? { opacity: 0, y: -10 } : false}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="group px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors cursor-default"
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 ${config.badge} border`}>
                                            <Icon className="w-2.5 h-2.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-mono text-[0.6rem] text-starlight-faint">{signal.time}</span>
                                                <span className={`font-mono text-[0.55rem] uppercase px-1.5 py-0.5 rounded ${config.badge} border`}>
                                                    {signal.type}
                                                </span>
                                            </div>
                                            <p className="terminal-text text-starlight-dim text-[0.68rem] leading-snug">
                                                {signal.message}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {!xrayMode && !loading && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-obsidian to-transparent pointer-events-none" />
                )}
            </div>
        </motion.div>
    );
}
