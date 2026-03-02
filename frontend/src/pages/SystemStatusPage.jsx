import { motion } from 'framer-motion';
import { Settings, Wifi, WifiOff, Database, Clock, Shield, Server, Cpu } from 'lucide-react';
import { checkHealth } from '../services/api';
import useApiData from '../hooks/useApiData';
import ErrorState from '../components/ui/ErrorState';
import RefreshIndicator from '../components/ui/RefreshIndicator';

const SERVICES = [
    { name: 'FastAPI Server', port: '8000', desc: 'Core API gateway' },
    { name: 'Supabase (PostgreSQL)', port: '5432', desc: 'Primary datastore' },
    { name: 'Vite Dev Server', port: '5173', desc: 'Frontend build' },
];

const DB_TABLES = [
    { name: 'products', desc: 'Product catalog', fk: '—' },
    { name: 'competitor_prices', desc: 'Competitor pricing history', fk: '→ products' },
    { name: 'trend_metrics', desc: 'Google Trends signals', fk: '→ products' },
    { name: 'sales_data', desc: 'Historical sales', fk: '→ products' },
    { name: 'demand_forecasts', desc: 'ML demand forecasts', fk: '→ products' },
    { name: 'price_recommendations', desc: 'Pricing recommendations', fk: '→ products' },
];

export default function SystemStatusPage() {
    const { data: health, loading, error, refetch, lastUpdated, isRefreshing } = useApiData(() => checkHealth(), { refreshInterval: 30000 });
    const connected = health?.status === 'healthy';
    const dbOk = health?.database === 'connected';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-hyper-cyan" />
                <h2 className="mono-label text-hyper-cyan text-sm">SYSTEM STATUS</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto flex items-center gap-2">
                    <RefreshIndicator isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
                </span>
            </div>

            {/* Service Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SERVICES.map((svc, i) => {
                    const isApi = svc.port === '8000';
                    const isDb = svc.port === '5432';
                    const status = isApi ? connected : isDb ? dbOk : true;
                    const Icon = isApi ? Server : isDb ? Database : Cpu;
                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            className={`cosmic-card p-4 ${status ? '' : 'border-supernova-red/20'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className={`w-4 h-4 ${status ? 'text-stellar-green' : loading ? 'text-yellow-400' : 'text-supernova-red'}`} />
                                <span className="font-mono text-xs text-starlight font-semibold">{svc.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[0.55rem] text-starlight-faint">{svc.desc}</span>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${status ? 'bg-stellar-green animate-pulse' : loading ? 'bg-yellow-400 animate-pulse' : 'bg-supernova-red'}`} />
                                    <span className={`mono-label text-[0.5rem] ${status ? 'text-stellar-green' : loading ? 'text-yellow-400' : 'text-supernova-red'}`}>
                                        {status ? 'ONLINE' : loading ? 'CHECKING' : 'OFFLINE'}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 text-[0.5rem] font-mono text-starlight-faint">PORT: {svc.port}</div>
                        </motion.div>
                    );
                })}
            </div>

            {error && <ErrorState message={error} onRetry={refetch} compact />}

            {/* Database Schema */}
            <div className="cosmic-card p-4">
                <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">DATABASE SCHEMA</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-[0.6rem] font-mono">
                        <thead>
                            <tr className="text-starlight-faint border-b border-glass-border">
                                <th className="text-left py-2 px-2">TABLE</th>
                                <th className="text-left py-2 px-2">DESCRIPTION</th>
                                <th className="text-left py-2 px-2">FK</th>
                                <th className="text-center py-2 px-2">STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DB_TABLES.map((t, i) => (
                                <motion.tr key={t.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.04 }}
                                    className="border-b border-glass-border/50 hover:bg-white/[0.02]">
                                    <td className="py-2 px-2 text-hyper-cyan">{t.name}</td>
                                    <td className="py-2 px-2 text-starlight-dim">{t.desc}</td>
                                    <td className="py-2 px-2 text-starlight-faint">{t.fk}</td>
                                    <td className="py-2 px-2 text-center">
                                        <div className={`w-2 h-2 rounded-full mx-auto ${dbOk ? 'bg-stellar-green' : loading ? 'bg-yellow-400 animate-pulse' : 'bg-supernova-red'}`} />
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Environment */}
            <div className="cosmic-card p-4">
                <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">ENVIRONMENT</div>
                <div className="grid grid-cols-2 gap-2 text-[0.55rem] font-mono">
                    {[['Backend', 'FastAPI + Uvicorn'], ['Database', 'Supabase (PostgreSQL)'], ['Frontend', 'React + Vite'], ['ML Stack', 'scikit-learn, LightGBM, Prophet'], ['Styling', 'Tailwind CSS'], ['Charts', 'Recharts']].map(([k, v], i) => (
                        <div key={i} className="flex justify-between py-1.5 px-2 rounded bg-white/[0.01] border border-glass-border">
                            <span className="text-starlight-faint">{k}</span>
                            <span className="text-starlight">{v}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
