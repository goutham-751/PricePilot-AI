import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Radar, Globe, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchCompetitorPrices, fetchAllSignals } from '../services/api';
import useApiData from '../hooks/useApiData';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorState from '../components/ui/ErrorState';
import RefreshIndicator from '../components/ui/RefreshIndicator';

const threatColor = { high: 'text-supernova-red bg-supernova-red/10 border-supernova-red/20', medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', low: 'text-stellar-green bg-stellar-green/10 border-stellar-green/20' };

export default function CompetitorIntelPage() {
    const { data: signalData, loading: sigLoading, error: sigError, refetch: refetchSig, lastUpdated, isRefreshing } = useApiData(
        () => fetchAllSignals(),
        { refreshInterval: 60000 }
    );

    const { data: compData, loading: compLoading, error: compError, refetch: refetchComp } = useApiData(
        () => fetchCompetitorPrices(100),
        { refreshInterval: 60000 }
    );

    const loading = sigLoading || compLoading;
    const error = sigError || compError;
    const signals = signalData?.signals || [];
    const competitors = compData?.data || [];

    // Build competitor profiles from signals
    const competitorProfiles = [];
    const competitorMap = new Map();

    for (const c of competitors) {
        const key = c.competitor_name;
        if (!competitorMap.has(key)) {
            competitorMap.set(key, {
                id: key,
                name: c.competitor_name,
                prices: [],
                productCount: 0,
                lastRecorded: c.recorded_at,
            });
        }
        const profile = competitorMap.get(key);
        profile.prices.push(parseFloat(c.price));
        profile.productCount++;
    }

    competitorMap.forEach((profile) => {
        const prices = profile.prices;
        const minPrice = Math.min(...prices).toFixed(2);
        const maxPrice = Math.max(...prices).toFixed(2);
        const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length);
        const timeSince = profile.lastRecorded
            ? `${Math.floor((Date.now() - new Date(profile.lastRecorded).getTime()) / 60000)}m ago`
            : 'N/A';

        // Calculate threat level based on pricing
        const strategy = avgPrice > 50 ? 'Premium' : avgPrice > 30 ? 'Mid-Range' : 'Budget';
        const threatLevel = profile.productCount > 10 ? 'high' : profile.productCount > 5 ? 'medium' : 'low';

        competitorProfiles.push({
            ...profile,
            priceRange: `$${minPrice}–${maxPrice}`,
            avgPrice: avgPrice.toFixed(2),
            strategy,
            threatLevel,
            lastScraped: timeSince,
        });
    });

    // Build price history for chart
    const priceHistory = [];
    const dateMap = new Map();

    for (const c of competitors.slice(0, 200)) {
        const date = (c.recorded_at || '').slice(0, 10);
        if (!dateMap.has(date)) {
            dateMap.set(date, { date: date.slice(5) });
        }
        const entry = dateMap.get(date);
        const compKey = (c.competitor_name || 'unknown').replace(/\s+/g, '_').slice(0, 10);
        entry[compKey] = parseFloat(c.price);
    }

    dateMap.forEach(v => priceHistory.push(v));
    priceHistory.sort((a, b) => a.date.localeCompare(b.date));
    const chartKeys = [...new Set(competitors.map(c => (c.competitor_name || '').replace(/\s+/g, '_').slice(0, 10)))].slice(0, 5);
    const chartColors = ['#39FF14', '#00F0FF', '#FF2A6D', '#FFD700', '#A78BFA'];

    if (error && !competitorProfiles.length) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 h-full overflow-y-auto pr-2">
                <div className="flex items-center gap-2 mb-2">
                    <Radar className="w-5 h-5 text-hyper-cyan" />
                    <h2 className="mono-label text-hyper-cyan text-sm">COMPETITOR INTELLIGENCE</h2>
                </div>
                <ErrorState message={error} onRetry={() => { refetchSig(); refetchComp(); }} />
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            <div className="flex items-center gap-2 mb-2">
                <Radar className="w-5 h-5 text-hyper-cyan" />
                <h2 className="mono-label text-hyper-cyan text-sm">COMPETITOR INTELLIGENCE</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto">
                    {loading ? 'LOADING...' : <><RefreshIndicator isRefreshing={isRefreshing} lastUpdated={lastUpdated} /> {competitorProfiles.length} COMPETITORS • {competitors.length} RECORDS</>}
                </span>
            </div>

            {loading ? (
                <>
                    <SkeletonLoader variant="metric" count={4} />
                    <SkeletonLoader variant="chart" />
                    <SkeletonLoader variant="table" count={5} />
                </>
            ) : (
                <>
                    {/* Competitor Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                        {competitorProfiles.map((comp, idx) => (
                            <motion.div key={comp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx }}
                                className="cosmic-card p-4 hover:border-white/10 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="text-starlight font-mono text-sm font-semibold">{comp.name}</div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Globe className="w-3 h-3 text-starlight-faint" />
                                            <span className="text-[0.6rem] text-starlight-faint">{comp.productCount} price records</span>
                                        </div>
                                    </div>
                                    <span className={`text-[0.5rem] font-mono uppercase px-2 py-0.5 rounded border ${threatColor[comp.threatLevel]}`}>
                                        {comp.threatLevel} THREAT
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-white/[0.02] rounded p-2">
                                        <div className="mono-label text-[0.45rem] text-starlight-faint">PRICE RANGE</div>
                                        <div className="font-mono text-xs text-hyper-cyan mt-0.5">{comp.priceRange}</div>
                                    </div>
                                    <div className="bg-white/[0.02] rounded p-2">
                                        <div className="mono-label text-[0.45rem] text-starlight-faint">AVG PRICE</div>
                                        <div className="font-mono text-xs text-starlight mt-0.5">${comp.avgPrice}</div>
                                    </div>
                                    <div className="bg-white/[0.02] rounded p-2">
                                        <div className="mono-label text-[0.45rem] text-starlight-faint">STRATEGY</div>
                                        <div className="font-mono text-xs text-starlight mt-0.5">{comp.strategy}</div>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center gap-1.5 text-[0.55rem] text-starlight-faint">
                                    <Clock className="w-3 h-3" />
                                    Last recorded: {comp.lastScraped}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Price History Chart */}
                    {priceHistory.length > 0 && (
                        <div className="cosmic-card p-4">
                            <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">PRICE HISTORY — COMPETITOR COMPARISON</div>
                            <div className="h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={priceHistory}>
                                        <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                                        <YAxis tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} domain={['auto', 'auto']} />
                                        <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                                        {chartKeys.map((key, i) => (
                                            <Line key={key} type="monotone" dataKey={key} stroke={chartColors[i]} strokeWidth={1.5} dot={false} name={key} />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Product Signals with competitor data */}
                    {signals.length > 0 && (
                        <div className="cosmic-card p-4">
                            <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">PRICE POSITION BY PRODUCT</div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-[0.6rem] font-mono">
                                    <thead>
                                        <tr className="text-starlight-faint border-b border-glass-border">
                                            <th className="text-left py-2 px-2">PRODUCT</th>
                                            <th className="text-right py-2 px-2">YOUR PRICE</th>
                                            <th className="text-right py-2 px-2">COMP AVG</th>
                                            <th className="text-right py-2 px-2">POSITION</th>
                                            <th className="text-right py-2 px-2">VOLATILITY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {signals.slice(0, 10).map((s, i) => (
                                            <tr key={i} className="border-b border-glass-border/50 hover:bg-white/[0.02]">
                                                <td className="py-2 px-2 text-starlight">{s.product_name || s.product_id?.slice(0, 8)}</td>
                                                <td className="py-2 px-2 text-right text-hyper-cyan">${s.your_price?.toFixed(2)}</td>
                                                <td className="py-2 px-2 text-right text-starlight">${s.competitor_avg_price?.toFixed(2) || '—'}</td>
                                                <td className={`py-2 px-2 text-right ${s.price_position_index > 1.05 ? 'text-supernova-red' : s.price_position_index < 0.95 ? 'text-stellar-green' : 'text-starlight'}`}>
                                                    {s.price_position_index?.toFixed(2)}
                                                </td>
                                                <td className={`py-2 px-2 text-right ${s.price_volatility === 'high' ? 'text-supernova-red' : s.price_volatility === 'medium' ? 'text-yellow-400' : 'text-stellar-green'}`}>
                                                    {s.price_volatility?.toUpperCase()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}
