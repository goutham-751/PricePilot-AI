import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Cpu, TrendingDown, DollarSign, Target, BarChart3 } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchOptimization, fetchAllSignals } from '../services/api';
import useApiData from '../hooks/useApiData';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorState from '../components/ui/ErrorState';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import RefreshIndicator from '../components/ui/RefreshIndicator';

export default function PricingEnginePage() {
    const [optimization, setOptimization] = useState(null);
    const [optLoading, setOptLoading] = useState(false);
    const { data: sigRes, loading: sigLoading, error, refetch, lastUpdated, isRefreshing } = useApiData(() => fetchAllSignals(), { refreshInterval: 60000 });

    const loadOpt = useCallback(async () => {
        const fp = sigRes?.signals?.[0];
        if (fp) {
            setOptLoading(true);
            try { const r = await fetchOptimization(fp.product_id); if (r?.optimization) setOptimization(r.optimization); } catch { }
            setOptLoading(false);
        }
    }, [sigRes]);
    useEffect(() => { loadOpt(); }, [loadOpt]);

    const loading = sigLoading || optLoading;
    const opt = optimization;
    const elasticity = opt?.elasticity;
    const curve = opt?.elasticity_curve || [];
    const scenarios = opt?.scenarios || [];
    const riskColor = { low: 'text-stellar-green bg-stellar-green/10 border-stellar-green/20', medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', high: 'text-supernova-red bg-supernova-red/10 border-supernova-red/20' };

    if (error && !opt) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 h-full overflow-y-auto pr-2">
            <div className="flex items-center gap-2 mb-2"><Cpu className="w-5 h-5 text-hyper-cyan" /><h2 className="mono-label text-hyper-cyan text-sm">PRICING ENGINE</h2></div>
            <ErrorState message={error} onRetry={refetch} />
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-hyper-cyan" />
                <h2 className="mono-label text-hyper-cyan text-sm">PRICING ENGINE</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto flex items-center gap-2">
                    <RefreshIndicator isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
                    {loading ? 'LOADING...' : opt ? `CONFIDENCE: ${(opt.confidence * 100).toFixed(0)}%` : 'WAITING FOR DATA'}
                </span>
            </div>

            {loading ? <SkeletonLoader variant="metric" count={4} /> : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Current Price', nv: opt?.current_price || 0, pfx: '$', dec: 2, icon: DollarSign, color: 'text-starlight' },
                        { label: 'Optimal Price', nv: opt?.optimal_price || 0, pfx: '$', dec: 2, icon: Target, color: 'text-stellar-green' },
                        { label: 'Revenue Impact', val: opt?.revenue_impact || '—', icon: TrendingDown, color: 'text-hyper-cyan' },
                        { label: 'Elasticity', nv: elasticity?.elasticity_coefficient || 0, dec: 2, icon: BarChart3, color: elasticity?.sensitivity === 'high' ? 'text-supernova-red' : 'text-yellow-400' },
                    ].map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="cosmic-card p-4 text-center hover:border-white/10 transition-colors">
                                <Icon className={`w-5 h-5 ${m.color} mx-auto mb-2`} />
                                <div className="mono-label text-[0.5rem] text-starlight-faint">{m.label}</div>
                                <div className={`font-mono text-lg font-bold ${m.color} mt-1`}>
                                    {m.nv !== undefined ? <AnimatedNumber value={m.nv} prefix={m.pfx || ''} decimals={m.dec || 0} /> : m.val}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {loading ? <SkeletonLoader variant="chart" /> : curve.length > 0 && (
                <div className="cosmic-card p-4">
                    <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">PRICE-DEMAND-REVENUE CURVE</div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={curve}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="price" tick={{ fill: '#666', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} tickFormatter={v => `$${v}`} />
                                <YAxis yAxisId="left" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                                <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                                <Line yAxisId="left" type="monotone" dataKey="demand" stroke="#00F0FF" strokeWidth={2} dot={false} name="Demand" />
                                <Bar yAxisId="right" dataKey="revenue" fill="rgba(57,255,20,0.15)" stroke="#39FF14" strokeWidth={1} name="Revenue" radius={[2, 2, 0, 0]} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {!loading && scenarios.length > 0 && (
                <div className="cosmic-card p-4">
                    <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">PRICING SCENARIOS</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {scenarios.map((s, i) => (
                            <motion.div key={s.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                                className="bg-white/[0.02] rounded-xl border border-glass-border p-4 hover:border-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-sm text-starlight font-semibold">{s.name}</span>
                                    <span className={`text-[0.5rem] font-mono uppercase px-2 py-0.5 rounded border ${riskColor[s.risk] || riskColor.low}`}>{s.risk} RISK</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-[0.55rem]">
                                    <div><div className="mono-label text-[0.45rem] text-starlight-faint">PRICE</div><div className="font-mono text-hyper-cyan mt-0.5">${s.price}</div></div>
                                    <div><div className="mono-label text-[0.45rem] text-starlight-faint">REVENUE</div><div className="font-mono text-stellar-green mt-0.5">{s.revenue}</div></div>
                                    <div><div className="mono-label text-[0.45rem] text-starlight-faint">DEMAND</div><div className="font-mono text-starlight mt-0.5">{s.demand}</div></div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && elasticity && (
                <div className="cosmic-card p-4">
                    <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">ELASTICITY MODEL</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Coefficient (ε)', value: elasticity.elasticity_coefficient?.toFixed(3) },
                            { label: 'Sensitivity', value: elasticity.sensitivity?.toUpperCase() },
                            { label: 'R² Score', value: elasticity.r2_score?.toFixed(3) },
                            { label: 'Data Points', value: elasticity.data_points },
                        ].map((m, i) => (
                            <div key={i} className="bg-white/[0.02] rounded-lg p-3 text-center">
                                <div className="mono-label text-[0.45rem] text-starlight-faint">{m.label}</div>
                                <div className="font-mono text-sm text-hyper-cyan mt-1">{m.value}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-glass-border text-[0.55rem] font-mono text-starlight-faint">
                        Optimal Range: ${elasticity.optimal_price_range?.min} — ${elasticity.optimal_price_range?.max} • {elasticity.algorithm}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
