import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, Clock, Zap } from 'lucide-react';
import { fetchRecommendations } from '../services/api';
import useApiData from '../hooks/useApiData';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorState from '../components/ui/ErrorState';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import RefreshIndicator from '../components/ui/RefreshIndicator';

export default function DecisionEnginePage() {
    const { data, loading, error, refetch, lastUpdated, isRefreshing } = useApiData(() => fetchRecommendations(), { refreshInterval: 60000 });
    const recs = data?.recommendations || [];

    const actionColor = { increase: 'text-stellar-green bg-stellar-green/10 border-stellar-green/20', decrease: 'text-supernova-red bg-supernova-red/10 border-supernova-red/20', maintain: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', hold: 'text-hyper-cyan bg-hyper-cyan/10 border-hyper-cyan/20' };

    if (error && !recs.length) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 h-full overflow-y-auto pr-2">
            <div className="flex items-center gap-2 mb-2"><Shield className="w-5 h-5 text-hyper-cyan" /><h2 className="mono-label text-hyper-cyan text-sm">DECISION ENGINE</h2></div>
            <ErrorState message={error} onRetry={refetch} />
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-hyper-cyan" />
                <h2 className="mono-label text-hyper-cyan text-sm">DECISION ENGINE</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto flex items-center gap-2">
                    <RefreshIndicator isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
                    {loading ? 'LOADING...' : `${recs.length} RECOMMENDATIONS`}
                </span>
            </div>

            {loading ? (
                <>
                    <SkeletonLoader variant="metric" count={3} />
                    <SkeletonLoader variant="card" count={4} />
                </>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Active Rules', val: recs.length, icon: Zap, color: 'text-hyper-cyan' },
                            { label: 'Increase', val: recs.filter(r => r.action === 'increase').length, icon: CheckCircle, color: 'text-stellar-green' },
                            { label: 'Decrease', val: recs.filter(r => r.action === 'decrease').length, icon: AlertTriangle, color: 'text-supernova-red' },
                        ].map((m, i) => {
                            const Icon = m.icon;
                            return (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="cosmic-card p-4 text-center">
                                    <Icon className={`w-5 h-5 ${m.color} mx-auto mb-2`} />
                                    <div className="mono-label text-[0.5rem] text-starlight-faint">{m.label}</div>
                                    <div className={`font-mono text-2xl font-bold ${m.color} mt-1`}><AnimatedNumber value={m.val} /></div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="cosmic-card p-4">
                        <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">ACTIVE RECOMMENDATIONS</div>
                        <div className="space-y-3">
                            {recs.map((rec, i) => (
                                <motion.div key={rec.product_id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                                    className="bg-white/[0.02] rounded-xl border border-glass-border p-4 hover:border-white/10 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <span className="font-mono text-sm text-starlight font-semibold">{rec.product_name || rec.product_id?.slice(0, 8)}</span>
                                            <span className="text-[0.5rem] text-starlight-faint ml-2 font-mono">{rec.category}</span>
                                        </div>
                                        <span className={`text-[0.5rem] font-mono uppercase px-2 py-0.5 rounded border ${actionColor[rec.action] || actionColor.hold}`}>
                                            {rec.action}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3 text-center">
                                        <div><div className="mono-label text-[0.45rem] text-starlight-faint">CURRENT</div><div className="font-mono text-xs text-starlight mt-0.5">${rec.current_price?.toFixed(2)}</div></div>
                                        <div><div className="mono-label text-[0.45rem] text-starlight-faint">RECOMMENDED</div><div className="font-mono text-xs text-stellar-green mt-0.5">${rec.recommended_price?.toFixed(2)}</div></div>
                                        <div><div className="mono-label text-[0.45rem] text-starlight-faint">CONFIDENCE</div><div className="font-mono text-xs text-hyper-cyan mt-0.5"><AnimatedNumber value={(rec.confidence || 0) * 100} decimals={0} suffix="%" /></div></div>
                                        <div><div className="mono-label text-[0.45rem] text-starlight-faint">IMPACT</div><div className="font-mono text-xs text-yellow-400 mt-0.5">{rec.revenue_impact || '—'}</div></div>
                                    </div>
                                    {rec.reasoning && <div className="mt-2 pt-2 border-t border-glass-border text-[0.55rem] text-starlight-faint font-mono">{rec.reasoning}</div>}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
}
