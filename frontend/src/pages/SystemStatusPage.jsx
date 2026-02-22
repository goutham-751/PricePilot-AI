import { motion } from 'framer-motion';
import { Server, Database, Shield, Settings, CheckCircle, Cpu, HardDrive } from 'lucide-react';
import { systemServices, dbSchemaInfo, configInfo } from '../data/mockData';

const healthColor = { healthy: 'text-stellar-green', degraded: 'text-yellow-400', down: 'text-supernova-red' };

export default function SystemStatusPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <Server className="w-5 h-5 text-stellar-green" />
                <h2 className="mono-label text-stellar-green text-sm">SYSTEM STATUS</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto">core/config.py • core/security.py • db/supabase_client.py • db/schemas.py</span>
            </div>

            {/* Services Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {systemServices.map((service, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="cosmic-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle className={`w-4 h-4 ${healthColor[service.status]}`} />
                                <span className="font-mono text-sm text-starlight font-semibold">{service.name}</span>
                            </div>
                            <span className={`font-mono text-[0.55rem] uppercase ${healthColor[service.status]}`}>{service.status}</span>
                        </div>
                        <div className="text-[0.55rem] text-starlight-faint mb-2">{service.module}</div>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(service).filter(([k]) => !['name', 'module', 'status'].includes(k)).map(([key, val]) => (
                                <div key={key} className="bg-white/[0.02] rounded p-2">
                                    <div className="mono-label text-[0.4rem] text-starlight-faint">{key.toUpperCase().replace(/([A-Z])/g, ' $1')}</div>
                                    <div className="font-mono text-xs text-hyper-cyan mt-0.5">{val}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Database Schema */}
                <div className="cosmic-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Database className="w-4 h-4 text-hyper-cyan" />
                        <span className="mono-label text-hyper-cyan text-[0.65rem]">DATABASE SCHEMA</span>
                    </div>
                    <div className="flex items-center gap-4 mb-3 text-[0.55rem] font-mono">
                        <span className="text-starlight-faint">Provider: <span className="text-starlight">{dbSchemaInfo.provider}</span></span>
                        <span className="text-starlight-faint">Region: <span className="text-hyper-cyan">{dbSchemaInfo.region}</span></span>
                        <span className="text-starlight-faint">Size: <span className="text-stellar-green">{dbSchemaInfo.totalSize}</span></span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[0.6rem] font-mono">
                            <thead>
                                <tr className="text-starlight-faint border-b border-glass-border">
                                    <th className="text-left py-2 px-2">TABLE</th>
                                    <th className="text-right py-2 px-2">ROWS</th>
                                    <th className="text-right py-2 px-2">COLS</th>
                                    <th className="text-right py-2 px-2">UPDATED</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dbSchemaInfo.tables.map((table, i) => (
                                    <tr key={i} className="border-b border-glass-border/50 hover:bg-white/[0.02]">
                                        <td className="py-2 px-2 text-hyper-cyan">{table.name}</td>
                                        <td className="py-2 px-2 text-right text-starlight">{table.rows.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right text-starlight-dim">{table.columns}</td>
                                        <td className="py-2 px-2 text-right text-starlight-faint">{table.lastUpdated}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Config Overview */}
                <div className="cosmic-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Settings className="w-4 h-4 text-yellow-400" />
                        <span className="mono-label text-yellow-400 text-[0.65rem]">APP CONFIGURATION</span>
                    </div>
                    <div className="space-y-2">
                        {[
                            { label: 'Environment', value: configInfo.environment, icon: Server },
                            { label: 'API Version', value: configInfo.apiVersion, icon: Settings },
                            { label: 'Python', value: configInfo.pythonVersion, icon: Cpu },
                            { label: 'Framework', value: configInfo.framework, icon: Settings },
                            { label: 'Deployment', value: configInfo.deployment, icon: HardDrive },
                            { label: 'Rate Limiting', value: configInfo.rateLimiting, icon: Shield },
                            { label: 'Cache', value: configInfo.cacheBackend, icon: Database },
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.02]">
                                    <Icon className="w-3.5 h-3.5 text-starlight-faint shrink-0" />
                                    <span className="mono-label text-[0.55rem] text-starlight-faint w-24 shrink-0">{item.label}</span>
                                    <span className="font-mono text-xs text-starlight">{item.value}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-glass-border">
                        <div className="mono-label text-[0.5rem] text-starlight-faint mb-1.5">CORS ORIGINS</div>
                        <div className="space-y-1">
                            {configInfo.corsOrigins.map((origin, i) => (
                                <code key={i} className="block text-[0.55rem] font-mono text-hyper-cyan/70 bg-hyper-cyan/5 px-2 py-1 rounded">{origin}</code>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
