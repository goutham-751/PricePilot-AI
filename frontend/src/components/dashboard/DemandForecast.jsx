import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import GlassCard from '../GlassCard';
import { demandForecastData } from '../../data/mockData';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card p-3 !rounded-xl text-sm !border-white/10">
            <div className="font-semibold text-white mb-1">{label}</div>
            {payload.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-white/50">{entry.name}:</span>
                    <span className="text-white font-medium">{entry.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
}

export default function DemandForecast() {
    const spikeMonths = demandForecastData.filter(d => d.season === 'Peak').map(d => d.month);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <GlassCard hover={false} className="relative overflow-hidden">
                {/* Decorative orbit ring */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full border border-accent-green/5 animate-orbit-slow" />

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-display font-semibold text-white">Demand Forecast</h3>
                        <p className="text-sm text-white/30 mt-0.5">12-month actual vs. predicted demand</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-1 rounded-full bg-accent-green" />
                            <span className="text-white/40">Actual</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-1 rounded-full bg-accent-lime" />
                            <span className="text-white/40">Forecast</span>
                        </div>
                    </div>
                </div>

                {/* Season indicator pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {['Low', 'Rising', 'Peak', 'Declining'].map((s) => {
                        const colorMap = { Low: 'bg-white/5 text-white/30', Rising: 'bg-success/10 text-success', Peak: 'bg-warning/10 text-warning', Declining: 'bg-danger/10 text-danger' };
                        return (
                            <span key={s} className={`text-xs px-2.5 py-1 rounded-full ${colorMap[s]}`}>{s}</span>
                        );
                    })}
                </div>

                <div className="h-[300px] -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={demandForecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />

                            {spikeMonths.map((m) => (
                                <ReferenceLine key={m} x={m} stroke="rgba(245,158,11,0.15)" strokeDasharray="4 4" />
                            ))}

                            <Area
                                type="monotone"
                                dataKey="actual"
                                name="Actual"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="url(#gradActual)"
                                dot={false}
                                activeDot={{ r: 4, fill: '#10b981', stroke: '#10b981', strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="forecast"
                                name="Forecast"
                                stroke="#4ade80"
                                strokeWidth={2}
                                strokeDasharray="6 3"
                                fill="url(#gradForecast)"
                                dot={false}
                                activeDot={{ r: 4, fill: '#4ade80', stroke: '#4ade80', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </motion.div>
    );
}
