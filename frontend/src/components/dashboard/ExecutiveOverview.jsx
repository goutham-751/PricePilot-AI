import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Gauge, DollarSign } from 'lucide-react';
import GlassCard from '../GlassCard';
import AnimatedCounter from '../AnimatedCounter';
import { executiveKPIs } from '../../data/mockData';

function KpiCard({ icon: Icon, label, value, change, unit, color, delay }) {
    const isPositive = change >= 0;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <GlassCard className="relative overflow-hidden">
                {/* Ambient glow */}
                <div
                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10"
                    style={{ backgroundColor: color }}
                />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                        >
                            <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isPositive
                                ? 'bg-success/10 text-success border border-success/20'
                                : 'bg-danger/10 text-danger border border-danger/20'
                            }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isPositive ? '+' : ''}{change}%
                        </div>
                    </div>

                    <div className="text-3xl font-display font-bold text-white mb-1">
                        <AnimatedCounter target={value} suffix={unit} />
                    </div>
                    <div className="text-sm text-white/40">{label}</div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

export default function ExecutiveOverview() {
    const kpis = [
        {
            icon: DollarSign,
            ...executiveKPIs.revenueScore,
            color: '#10b981',
        },
        {
            icon: Activity,
            ...executiveKPIs.demandMomentum,
            color: '#4ade80',
        },
        {
            icon: Gauge,
            ...executiveKPIs.marketVolatility,
            color: '#34d399',
        },
    ];

    return (
        <div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
            >
                <h2 className="text-2xl font-display font-bold text-white">Executive Overview</h2>
                <p className="text-sm text-white/30 mt-1">Real-time market intelligence at a glance</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((kpi, i) => (
                    <KpiCard key={kpi.label} {...kpi} delay={i * 0.1} />
                ))}
            </div>
        </div>
    );
}
