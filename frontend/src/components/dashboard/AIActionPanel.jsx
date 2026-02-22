import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Zap, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { optimalPricing } from '../../data/mockData';

export default function AIActionPanel({ xrayMode }) {
    const [simulating, setSimulating] = useState(false);
    const [simulated, setSimulated] = useState(false);

    const handleSimulate = () => {
        setSimulating(true);
        setTimeout(() => {
            setSimulating(false);
            setSimulated(true);
        }, 2000);
    };

    const jsonData = JSON.stringify(
        { module: 'price_optimization', endpoint: '/api/v1/optimize/price', algorithm: 'gradient_descent_v3', result: optimalPricing },
        null, 2
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="cosmic-card p-0 h-full flex flex-col"
        >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-glass-border">
                <div className="flex items-center gap-2 mb-1">
                    <Crosshair className="w-4 h-4 text-stellar-green" />
                    <span className="mono-label text-stellar-green text-[0.65rem]">AI ACTION PANEL</span>
                </div>
                <p className="text-[0.65rem] text-starlight-faint">Optimal pricing recommendation</p>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
                {xrayMode ? (
                    <div className="h-full overflow-auto">
                        <pre className="terminal-text text-stellar-green/70 whitespace-pre-wrap text-[0.65rem] leading-relaxed">
                            {jsonData}
                        </pre>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Optimal Price — Hero Display */}
                        <div className="text-center py-4">
                            <div className="mono-label text-[0.6rem] text-starlight-faint mb-2">OPTIMAL PRICE POINT</div>
                            <motion.div
                                className="text-5xl font-bold text-stellar-green glow-green font-mono"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.8, type: 'spring' }}
                            >
                                ${optimalPricing.optimalPrice}
                            </motion.div>
                            <div className="mono-label text-[0.55rem] text-starlight-faint mt-2">
                                CURRENT: <span className="text-hyper-cyan">${optimalPricing.currentPrice}</span>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <MetricCard
                                label="REVENUE IMPACT"
                                value={optimalPricing.revenueImpact}
                                sub={optimalPricing.revenueImpactPercent}
                                icon={TrendingUp}
                                color="stellar-green"
                                delay={0.9}
                            />
                            <MetricCard
                                label="DEMAND CHANGE"
                                value={optimalPricing.demandChange}
                                sub="projected"
                                icon={TrendingDown}
                                color="supernova-red"
                                delay={1.0}
                            />
                            <MetricCard
                                label="MARGIN GAIN"
                                value={optimalPricing.marginImprovement}
                                sub="improvement"
                                icon={BarChart3}
                                color="hyper-cyan"
                                delay={1.1}
                            />
                            <MetricCard
                                label="CONFIDENCE"
                                value={`${optimalPricing.confidence}%`}
                                sub="model score"
                                icon={Crosshair}
                                color="stellar-green"
                                delay={1.2}
                            />
                        </div>

                        {/* Confidence Bar */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="mono-label text-[0.55rem]">AI CONFIDENCE</span>
                                <span className="mono-label text-[0.55rem] text-stellar-green">{optimalPricing.confidence}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-stellar-green"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${optimalPricing.confidence}%` }}
                                    transition={{ duration: 1.5, ease: 'easeOut', delay: 1 }}
                                    style={{
                                        boxShadow: '0 0 10px rgba(57,255,20,0.4)',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Simulate Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSimulate}
                            disabled={simulating}
                            className={`w-full py-3 rounded-lg font-mono text-xs uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer ${simulated
                                    ? 'bg-stellar-green/10 border border-stellar-green/30 text-stellar-green box-glow-green'
                                    : simulating
                                        ? 'bg-hyper-cyan/5 border border-hyper-cyan/20 text-hyper-cyan animate-pulse'
                                        : 'bg-hyper-cyan/10 border border-hyper-cyan/30 text-hyper-cyan hover:bg-hyper-cyan/15 box-glow-cyan'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Zap className="w-4 h-4" />
                                {simulated ? 'IMPACT SIMULATED ✓' : simulating ? 'SIMULATING...' : 'SIMULATE IMPACT'}
                            </span>
                        </motion.button>

                        {/* Simulation Result */}
                        {simulated && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-stellar-green/5 border border-stellar-green/10"
                            >
                                <div className="terminal-text text-stellar-green/80 text-[0.65rem] space-y-1">
                                    <div>{'>'} Optimal price applied: ${optimalPricing.optimalPrice}</div>
                                    <div>{'>'} Projected revenue uplift: {optimalPricing.revenueImpact}</div>
                                    <div>{'>'} Demand impact: {optimalPricing.demandChange}</div>
                                    <div>{'>'} Net margin improvement: {optimalPricing.marginImprovement}</div>
                                    <div className="text-stellar-green glow-green">{'>'} Status: RECOMMENDED FOR DEPLOYMENT</div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function MetricCard({ label, value, sub, icon: Icon, color, delay }) {
    const colorClasses = {
        'stellar-green': 'text-stellar-green bg-stellar-green/5 border-stellar-green/15',
        'supernova-red': 'text-supernova-red bg-supernova-red/5 border-supernova-red/15',
        'hyper-cyan': 'text-hyper-cyan bg-hyper-cyan/5 border-hyper-cyan/15',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className={`p-3 rounded-lg border ${colorClasses[color]}`}
        >
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3" />
                <span className="mono-label text-[0.5rem]">{label}</span>
            </div>
            <div className="font-mono text-lg font-bold">{value}</div>
            <div className="mono-label text-[0.5rem] opacity-50 mt-0.5">{sub}</div>
        </motion.div>
    );
}
