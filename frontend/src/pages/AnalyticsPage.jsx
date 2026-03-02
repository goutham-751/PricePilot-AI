import { motion } from 'framer-motion';
import { Activity, TrendingUp, DollarSign, BarChart3, Zap, Target } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchAllSignals, fetchKPIs } from '../services/api';
import useApiData from '../hooks/useApiData';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorState from '../components/ui/ErrorState';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import RefreshIndicator from '../components/ui/RefreshIndicator';

export default function AnalyticsPage() {
    const { data: sigRes, loading: sigLoading, error: sigError, refetch: refetchSig, isRefreshing: sigRefreshing } = useApiData(
        () => fetchAllSignals(),
        { refreshInterval: 60000 }
    );

    const { data: kpiRes, loading: kpiLoading, error: kpiError, refetch: refetchKpi, lastUpdated, isRefreshing: kpiRefreshing } = useApiData(
        () => fetchKPIs(),
        { refreshInterval: 60000 }
    );

    const loading = sigLoading || kpiLoading;
    const error = sigError || kpiError;
    const signals = sigRes?.signals || [];
    const kpis = kpiRes?.kpis || null;
    const isRefreshing = sigRefreshing || kpiRefreshing;

    const kpiCards = kpis ? [
        { label: 'Est. Monthly Revenue', value: kpis.est_monthly_revenue, prefix: '$', suffix: 'K', transform: v => v / 1000, icon: DollarSign, color: 'text-stellar-green' },
        { label: 'Demand Growth', value: kpis.avg_demand_growth * 100, suffix: '%', decimals: 1, icon: TrendingUp, color: kpis.avg_demand_growth > 0 ? 'text-stellar-green' : 'text-supernova-red' },
        { label: 'Price Position', value: kpis.avg_price_position, decimals: 2, icon: Target, color: 'text-hyper-cyan' },
        { label: 'Trend Momentum', value: kpis.avg_trend_momentum, prefix: kpis.avg_trend_momentum > 0 ? '+' : '', decimals: 1, icon: Zap, color: 'text-yellow-400' },
    ] : null;

    // Build trends from signals
    const trendData = signals.length > 0
        ? signals.slice(0, 12).map((s, i) => ({
            name: s.product_name?.slice(0, 10) || `P${i + 1}`,
            demand: Math.round(s.moving_avg_demand || 0),
            trend: Math.round(s.trend_momentum + 50 || 50),
            position: Math.round((s.price_position_index || 1) * 100),
        }))
        : [];

    // Feature importance from signals
    const featureData = signals.length > 0
        ? [
            { feature: 'Demand Growth', importance: Math.abs(signals.reduce((a, s) => a + (s.demand_growth_rate || 0), 0) / signals.length * 100) },
            { feature: 'Trend Momentum', importance: Math.abs(signals.reduce((a, s) => a + (s.trend_momentum || 0), 0) / signals.length) },
            { feature: 'Price Position', importance: Math.abs(signals.reduce((a, s) => a + ((s.price_position_index || 1) - 1), 0) / signals.length * 100) },
            { feature: 'Elasticity', importance: Math.abs(signals.reduce((a, s) => a + (s.elasticity_estimate || 0), 0) / signals.length * 50) },
            { feature: 'Seasonal Index', importance: Math.abs(signals.reduce((a, s) => a + ((s.seasonal_index || 1) - 1), 0) / signals.length * 100) },
        ].sort((a, b) => b.importance - a.importance)
        : [];

    if (error && !signals.length && !kpis) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 h-full overflow-y-auto pr-2">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-hyper-cyan" />
                    <h2 className="mono-label text-hyper-cyan text-sm">ANALYTICS ENGINE</h2>
                </div>
                <ErrorState message={error} onRetry={() => { refetchSig(); refetchKpi(); }} />
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-hyper-cyan" />
                <h2 className="mono-label text-hyper-cyan text-sm">ANALYTICS ENGINE</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto flex items-center gap-2">
                    <RefreshIndicator isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
                    {loading ? 'LOADING...' : `${signals.length} PRODUCTS • LIVE`}
                </span>
            </div>

            {/* KPI Cards */}
            {loading ? (
                <SkeletonLoader variant="metric" count={4} />
            ) : kpiCards ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {kpiCards.map((kpi, i) => {
                        const Icon = kpi.icon;
                        const displayVal = kpi.transform ? kpi.transform(kpi.value) : kpi.value;
                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }} className="cosmic-card p-4 text-center hover:border-white/10 transition-colors">
                                <Icon className={`w-5 h-5 ${kpi.color} mx-auto mb-2`} />
                                <div className="mono-label text-[0.5rem] text-starlight-faint">{kpi.label}</div>
                                <div className={`font-mono text-lg font-bold ${kpi.color} mt-1`}>
                                    <AnimatedNumber value={displayVal} prefix={kpi.prefix || ''} suffix={kpi.suffix || ''} decimals={kpi.decimals || 0} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : null}

            {/* Signals Table */}
            {loading ? (
                <SkeletonLoader variant="table" count={8} />
            ) : signals.length > 0 && (
                <div className="cosmic-card p-4">
                    <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">INTELLIGENCE SIGNALS</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[0.6rem] font-mono">
                            <thead>
                                <tr className="text-starlight-faint border-b border-glass-border">
                                    <th className="text-left py-2 px-2">PRODUCT</th>
                                    <th className="text-right py-2 px-2">DEMAND</th>
                                    <th className="text-right py-2 px-2">GROWTH</th>
                                    <th className="text-right py-2 px-2">MOMENTUM</th>
                                    <th className="text-right py-2 px-2">POSITION</th>
                                    <th className="text-right py-2 px-2">VOLATILITY</th>
                                    <th className="text-right py-2 px-2">ELASTICITY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {signals.slice(0, 10).map((s, i) => (
                                    <tr key={i} className="border-b border-glass-border/50 hover:bg-white/[0.02]">
                                        <td className="py-2 px-2 text-starlight">{s.product_name || s.product_id?.slice(0, 8)}</td>
                                        <td className="py-2 px-2 text-right text-hyper-cyan">{s.moving_avg_demand?.toFixed(0)}</td>
                                        <td className={`py-2 px-2 text-right ${s.demand_growth_rate > 0 ? 'text-stellar-green' : 'text-supernova-red'}`}>
                                            {(s.demand_growth_rate * 100).toFixed(1)}%
                                        </td>
                                        <td className={`py-2 px-2 text-right ${s.trend_momentum > 0 ? 'text-stellar-green' : 'text-supernova-red'}`}>
                                            {s.trend_momentum > 0 ? '+' : ''}{s.trend_momentum?.toFixed(1)}
                                        </td>
                                        <td className="py-2 px-2 text-right text-starlight">{s.price_position_index?.toFixed(2)}</td>
                                        <td className={`py-2 px-2 text-right ${s.price_volatility === 'high' ? 'text-supernova-red' : s.price_volatility === 'medium' ? 'text-yellow-400' : 'text-stellar-green'}`}>
                                            {s.price_volatility?.toUpperCase()}
                                        </td>
                                        <td className={`py-2 px-2 text-right ${s.elasticity_label === 'high' ? 'text-supernova-red' : s.elasticity_label === 'medium' ? 'text-yellow-400' : 'text-stellar-green'}`}>
                                            {s.elasticity_label?.toUpperCase()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Market Trends Chart */}
            {loading ? (
                <SkeletonLoader variant="chart" />
            ) : trendData.length > 0 && (
                <div className="cosmic-card p-4">
                    <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">PRODUCT DEMAND vs TREND</div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="demand_grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                                <YAxis tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                                <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                                <Area type="monotone" dataKey="demand" stroke="#00F0FF" fill="url(#demand_grad)" strokeWidth={2} name="Demand" />
                                <Area type="monotone" dataKey="trend" stroke="#39FF14" fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Trend" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Feature Importance */}
            {!loading && featureData.length > 0 && (
                <div className="cosmic-card p-4">
                    <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">FEATURE IMPORTANCE</div>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={featureData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                <XAxis type="number" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                                <YAxis type="category" dataKey="feature" tick={{ fill: '#888', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} width={100} />
                                <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                                <Bar dataKey="importance" fill="#00F0FF" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
