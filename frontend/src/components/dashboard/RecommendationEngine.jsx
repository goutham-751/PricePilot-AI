import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Package, ArrowUpRight, Info, X, CheckCircle } from 'lucide-react';
import GlassCard from '../GlassCard';
import { recommendations } from '../../data/mockData';

const iconMap = {
    increase: TrendingUp,
    discount: Clock,
    stock: Package,
};

const colorMap = {
    increase: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', bar: 'bg-success', glow: 'rgba(16,185,129,0.15)' },
    discount: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', bar: 'bg-warning', glow: 'rgba(245,158,11,0.15)' },
    stock: { bg: 'bg-accent-lime/10', border: 'border-accent-lime/20', text: 'text-neon-green', bar: 'bg-accent-lime', glow: 'rgba(74,222,128,0.15)' },
};

function ConfidenceBar({ value, color }) {
    return (
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
                className={`h-full rounded-full ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
            />
        </div>
    );
}

function RecommendationCard({ rec, index }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const Icon = iconMap[rec.type];
    const colors = colorMap[rec.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
        >
            <GlassCard className="relative overflow-hidden group">
                {/* Ambient corner glow */}
                <div
                    className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ backgroundColor: colors.glow }}
                />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${colors.text}`} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <CheckCircle className={`w-3.5 h-3.5 ${colors.text}`} />
                                    {rec.title}
                                </h4>
                                <div className={`text-xs mt-0.5 px-2 py-0.5 rounded-full inline-block ${colors.bg} ${colors.text} border ${colors.border}`}>
                                    {rec.urgency} urgency
                                </div>
                            </div>
                        </div>

                        {/* Info tooltip toggle */}
                        <button
                            onClick={() => setShowTooltip(!showTooltip)}
                            className="text-white/20 hover:text-white/50 transition-colors cursor-pointer"
                        >
                            {showTooltip ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Tooltip explanation */}
                    <AnimatePresence>
                        {showTooltip && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 overflow-hidden"
                            >
                                <div className="text-xs text-white/40 leading-relaxed p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                    {rec.description}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Impact row */}
                    <div className="flex items-center gap-6 mb-4">
                        <div>
                            <div className="text-xs text-white/30 mb-1">Expected Revenue Impact</div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xl font-display font-bold ${colors.text}`}>{rec.impact}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                                    <ArrowUpRight className="w-3 h-3 inline" /> {rec.impactPercent}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Confidence bar */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-white/30">Confidence Level</span>
                            <span className={`text-xs font-semibold ${colors.text}`}>{rec.confidence}%</span>
                        </div>
                        <ConfidenceBar value={rec.confidence} color={colors.bar} />
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

export default function RecommendationEngine() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="mb-6">
                <h3 className="text-lg font-display font-semibold text-white">AI Recommendations</h3>
                <p className="text-sm text-white/30 mt-0.5">Data-driven pricing actions with revenue projections</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((rec, i) => (
                    <RecommendationCard key={rec.id} rec={rec} index={i} />
                ))}
            </div>
        </motion.div>
    );
}
