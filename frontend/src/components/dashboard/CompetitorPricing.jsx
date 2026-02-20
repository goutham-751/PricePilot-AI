import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend, Cell,
} from 'recharts';
import GlassCard from '../GlassCard';
import { competitorPricingData, priceHistoryData } from '../../data/mockData';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card p-3 !rounded-xl text-sm !border-white/10">
            <div className="font-semibold text-white mb-1">{label}</div>
            {payload.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-white/50">{entry.name}:</span>
                    <span className="text-white font-medium">${entry.value}</span>
                </div>
            ))}
        </div>
    );
}

export default function CompetitorPricing() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
        >
            {/* Price Variance Chart */}
            <GlassCard hover={false}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-display font-semibold text-white">Price Variance</h3>
                        <p className="text-sm text-white/30 mt-0.5">Your pricing vs. competitors</p>
                    </div>
                </div>

                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={competitorPricingData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="price" radius={[6, 6, 0, 0]} maxBarSize={48}>
                                {competitorPricingData.map((entry, i) => (
                                    <Cell key={i} fill={i === 0 ? '#10b981' : 'rgba(255,255,255,0.08)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Market positioning badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {competitorPricingData.map((c) => {
                        const posColor = {
                            Competitive: 'bg-success/10 text-success border-success/20',
                            Premium: 'bg-warning/10 text-warning border-warning/20',
                            Budget: 'bg-accent-lime/10 text-neon-green border-accent-lime/20',
                            'Mid-Premium': 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
                        };
                        return (
                            <span
                                key={c.name}
                                className={`text-xs px-2.5 py-1 rounded-full border ${posColor[c.position] || 'bg-white/5 text-white/40 border-white/10'}`}
                            >
                                {c.name}: {c.position}
                            </span>
                        );
                    })}
                </div>
            </GlassCard>

            {/* Price History Trend */}
            <GlassCard hover={false}>
                <div className="mb-6">
                    <h3 className="text-lg font-display font-semibold text-white">Price Trend History</h3>
                    <p className="text-sm text-white/30 mt-0.5">8-week price movement comparison</p>
                </div>

                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceHistoryData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="week" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="you" name="You" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
                            <Line type="monotone" dataKey="compA" name="Competitor A" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={{ r: 3 }} />
                            <Line type="monotone" dataKey="compB" name="Competitor B" stroke="#4ade80" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={{ r: 3 }} />
                            <Line type="monotone" dataKey="compC" name="Competitor C" stroke="#34d399" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </motion.div>
    );
}
