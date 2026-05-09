import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Zap, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { fetchAllSignals, fetchOptimization } from '../../services/api';
import AnimatedNumber from '../ui/AnimatedNumber';
import ErrorState from '../ui/ErrorState';
import RefreshIndicator from '../ui/RefreshIndicator';

export default function AIActionPanel({ xrayMode }) {
    const [pricing, setPricing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [simulating, setSimulating] = useState(false);
    const [simulated, setSimulated] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadData = useCallback(async (isRefresh = false) => {
        try {
            setError(null);
            if (isRefresh) setIsRefreshing(true);
            else setLoading(true);

            // Get first product ID from signals
            const sigRes = await fetchAllSignals();
            if (sigRes?.signals?.[0]) {
                const pid = sigRes.signals[0].product_id;
                const optRes = await fetchOptimization(pid);
                if (optRes?.optimization) {
                    setPricing(optRes.optimization);
                }
            }
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData(false);
        const interval = setInterval(() => loadData(true), 60000);
        return () => clearInterval(interval);
    }, [loadData]);

    const handleSimulate = async () => {
        if (!pricing?.product_id || !pricing?.optimal_price) return;
        setSimulating(true);
        try {
            const { applyOptimalPrice } = await import('../../services/api');
            await applyOptimalPrice(pricing.product_id, pricing.optimal_price);
            setSimulating(false);
            setSimulated(true);
            setTimeout(() => {
                loadData(true); // Refresh data from backend to show the new state globally!
            }, 1000);
        } catch (err) {
            console.error(err);
            setSimulating(false);
        }
    };

    const opt = pricing;
    const currentPrice = opt?.current_price || 0;
    const optimalPrice = opt?.optimal_price || 0;
    const confidence = opt?.confidence ? Math.round(opt.confidence * 100) : 0;
    const revenueImpact = opt?.revenue_impact || '+$0';
    const demandChange = opt?.demand_change || '-0%';
    const marginImprovement = opt?.margin_improvement || '+0%';

    const jsonData = opt
        ? JSON.stringify({ module: 'price_optimization', endpoint: '/pricing/optimize/{id}', result: { currentPrice, optimalPrice, confidence, revenueImpact } }, null, 2)
        : '{ "status": "loading..." }';

    if (error && !opt) {
        return (
            <div className="cosmic-card p-4 h-full flex flex-col">
                <div className="px-0 pb-3 border-b border-glass-border">
                    <div className="flex items-center gap-2 mb-1">
                        <Crosshair className="w-4 h-4 text-stellar-green" />
                        <span className="mono-label text-stellar-green text-[0.65rem]">AI ACTION PANEL</span>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <ErrorState message={error} onRetry={() => loadData(false)} compact />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="cosmic-card p-0 h-full flex flex-col"
        >
            <div className="px-4 pt-4 pb-3 border-b border-glass-border">
                <div className="flex items-center gap-2 mb-1">
                    <Crosshair className="w-4 h-4 text-stellar-green" />
                    <span className="mono-label text-stellar-green text-[0.65rem]">AI ACTION PANEL</span>
                    <RefreshIndicator isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
                </div>
                <p className="text-[0.65rem] text-starlight-faint">
                    {loading ? 'Computing optimal price...' : 'Optimal pricing recommendation'}
                </p>
            </div>

            <div className="flex-1 p-4">
                {loading ? (
                    <div className="space-y-5 animate-pulse">
                        <div className="text-center py-4">
                            <div className="h-2 w-24 bg-white/[0.04] rounded mx-auto mb-3" />
                            <div className="h-12 w-28 bg-white/[0.06] rounded mx-auto mb-2" />
                            <div className="h-2 w-20 bg-white/[0.03] rounded mx-auto" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="p-3 rounded-lg border border-glass-border">
                                    <div className="h-2 w-16 bg-white/[0.03] rounded mb-2" />
                                    <div className="h-5 w-12 bg-white/[0.05] rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : xrayMode ? (
                    <div className="h-full overflow-auto">
                        <pre className="terminal-text text-stellar-green/70 whitespace-pre-wrap text-[0.65rem] leading-relaxed">
                            {jsonData}
                        </pre>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Optimal Price */}
                        <div className="text-center py-4">
                            <div className="mono-label text-[0.6rem] text-starlight-faint mb-2">OPTIMAL PRICE POINT</div>
                            <motion.div
                                className="text-5xl font-bold text-stellar-green glow-green font-mono"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.3, type: 'spring' }}
                            >
                                $<AnimatedNumber value={optimalPrice} decimals={2} />
                            </motion.div>
                            <div className="mono-label text-[0.55rem] text-starlight-faint mt-2">
                                CURRENT: <span className="text-hyper-cyan">$<AnimatedNumber value={currentPrice} decimals={2} /></span>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <MetricCard label="REVENUE IMPACT" value={revenueImpact} icon={TrendingUp} color="stellar-green" delay={0.4} />
                            <MetricCard label="DEMAND CHANGE" value={demandChange} icon={TrendingDown} color="supernova-red" delay={0.5} />
                            <MetricCard label="MARGIN GAIN" value={marginImprovement} icon={BarChart3} color="hyper-cyan" delay={0.6} />
                            <MetricCard
                                label="CONFIDENCE"
                                value={<><AnimatedNumber value={confidence} />%</>}
                                icon={Crosshair}
                                color="stellar-green"
                                delay={0.7}
                            />
                        </div>

                        {/* Confidence Bar */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="mono-label text-[0.55rem]">AI CONFIDENCE</span>
                                <span className="mono-label text-[0.55rem] text-stellar-green"><AnimatedNumber value={confidence} />%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-stellar-green"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${confidence}%` }}
                                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                                    style={{ boxShadow: '0 0 10px rgba(57,255,20,0.4)' }}
                                />
                            </div>
                        </div>

                        {/* Simulate Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSimulate}
                            disabled={simulating}
                            className={`w-full py-3 rounded-lg font-mono text-xs uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer ${simulated
                                ? 'bg-stellar-green/10 border border-stellar-green/30 text-stellar-green box-glow-green'
                                : simulating
                                    ? 'bg-hyper-cyan/5 border border-hyper-cyan/20 text-hyper-cyan animate-pulse'
                                    : 'bg-hyper-cyan/10 border border-hyper-cyan/30 text-hyper-cyan hover:bg-hyper-cyan/15 box-glow-cyan'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Zap className="w-4 h-4" />
                                {simulated ? 'IMPACT SIMULATED ✓' : simulating ? 'SIMULATING...' : 'SIMULATE IMPACT'}
                            </span>
                        </motion.button>

                        {/* Simulation Result */}
                        {simulated && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-stellar-green/5 border border-stellar-green/10"
                            >
                                <div className="terminal-text text-stellar-green/80 text-[0.65rem] space-y-1">
                                    <div>{'>'} Optimal price applied: ${optimalPrice.toFixed(2)}</div>
                                    <div>{'>'} Projected revenue uplift: {revenueImpact}</div>
                                    <div>{'>'} Demand impact: {demandChange}</div>
                                    <div>{'>'} Net margin improvement: {marginImprovement}</div>
                                    <div className="text-stellar-green glow-green">{'>'} Status: RECOMMENDED FOR DEPLOYMENT</div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function MetricCard({ label, value, icon: Icon, color, delay }) {
    const colorClasses = {
        'stellar-green': 'text-stellar-green bg-stellar-green/5 border-stellar-green/15',
        'supernova-red': 'text-supernova-red bg-supernova-red/5 border-supernova-red/15',
        'hyper-cyan': 'text-hyper-cyan bg-hyper-cyan/5 border-hyper-cyan/15',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className={`p-3 rounded-lg border ${colorClasses[color]}`}
        >
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3" />
                <span className="mono-label text-[0.5rem]">{label}</span>
            </div>
            <div className="font-mono text-lg font-bold">{value}</div>
        </motion.div>
    );
}
