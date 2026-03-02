import { motion } from 'framer-motion';
import { Database, CheckCircle, Clock, XCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { checkHealth } from '../services/api';
import useApiData from '../hooks/useApiData';
import ErrorState from '../components/ui/ErrorState';
import RefreshIndicator from '../components/ui/RefreshIndicator';

const PIPELINE_JOBS = [
    { id: 'competitor_scraper', name: 'Competitor Price Scraper', schedule: 'Every 6 hours', endpoint: '/competitors/scrape', type: 'scraper' },
    { id: 'trend_collector', name: 'Google Trends Collector', schedule: 'Every 12 hours', endpoint: '/analytics/signals/all', type: 'collector' },
    { id: 'demand_forecaster', name: 'Demand Forecast Pipeline', schedule: 'Every 24 hours', endpoint: '/forecasting/predict/{id}', type: 'ml' },
    { id: 'price_optimizer', name: 'Price Optimization Engine', schedule: 'Every 24 hours', endpoint: '/pricing/optimize/{id}', type: 'ml' },
    { id: 'decision_engine', name: 'Decision Engine', schedule: 'On demand / triggers', endpoint: '/pricing/recommendations', type: 'engine' },
];

export default function DataPipelinePage() {
    const { data: health, loading, error, refetch, lastUpdated, isRefreshing } = useApiData(() => checkHealth(), { refreshInterval: 30000 });
    const connected = health?.status === 'healthy';
    const dbOk = health?.database === 'connected';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-hyper-cyan" />
                <h2 className="mono-label text-hyper-cyan text-sm">DATA PIPELINE</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto flex items-center gap-2">
                    <RefreshIndicator isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
                </span>
            </div>

            {/* Live Status */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className={`cosmic-card p-4 text-center ${connected ? 'border-stellar-green/20' : 'border-supernova-red/20'}`}>
                    {connected ? <Wifi className="w-5 h-5 text-stellar-green mx-auto mb-2" /> : <WifiOff className="w-5 h-5 text-supernova-red mx-auto mb-2" />}
                    <div className="mono-label text-[0.5rem] text-starlight-faint">API STATUS</div>
                    <div className={`font-mono text-sm font-bold mt-1 ${connected ? 'text-stellar-green' : 'text-supernova-red'}`}>{connected ? 'CONNECTED' : loading ? 'CHECKING...' : 'OFFLINE'}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className={`cosmic-card p-4 text-center ${dbOk ? 'border-stellar-green/20' : 'border-supernova-red/20'}`}>
                    <Database className={`w-5 h-5 mx-auto mb-2 ${dbOk ? 'text-stellar-green' : 'text-supernova-red'}`} />
                    <div className="mono-label text-[0.5rem] text-starlight-faint">DATABASE</div>
                    <div className={`font-mono text-sm font-bold mt-1 ${dbOk ? 'text-stellar-green' : 'text-supernova-red'}`}>{dbOk ? 'SUPABASE OK' : loading ? 'CHECKING...' : 'DISCONNECTED'}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="cosmic-card p-4 text-center">
                    <Clock className="w-5 h-5 text-hyper-cyan mx-auto mb-2" />
                    <div className="mono-label text-[0.5rem] text-starlight-faint">PIPELINES</div>
                    <div className="font-mono text-sm font-bold text-hyper-cyan mt-1">{PIPELINE_JOBS.length} ACTIVE</div>
                </motion.div>
            </div>

            {error && <ErrorState message={error} onRetry={refetch} compact />}

            {/* Pipeline Jobs */}
            <div className="cosmic-card p-4">
                <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">PIPELINE JOBS</div>
                <div className="space-y-2">
                    {PIPELINE_JOBS.map((job, i) => (
                        <motion.div key={job.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
                            className="flex items-center gap-3 py-3 px-3 rounded-lg bg-white/[0.01] hover:bg-white/[0.02] border border-glass-border transition-colors">
                            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-stellar-green animate-pulse' : 'bg-supernova-red'}`} />
                            <div className="flex-1">
                                <div className="font-mono text-xs text-starlight">{job.name}</div>
                                <div className="text-[0.55rem] text-starlight-faint">{job.schedule}</div>
                            </div>
                            <span className="text-[0.5rem] font-mono text-starlight-faint px-2 py-0.5 rounded bg-white/[0.02] border border-glass-border">{job.type}</span>
                            <code className="text-[0.5rem] font-mono text-hyper-cyan/60">{job.endpoint}</code>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
