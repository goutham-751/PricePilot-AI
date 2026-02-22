import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Zap, Target, Shield } from 'lucide-react';
import { elasticityCurve, pricingScenarios, elasticityModelInfo, optimalPricing } from '../data/mockData';
import { ComposedChart, Line, Area, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const riskColor = { low: 'text-stellar-green bg-stellar-green/10 border-stellar-green/20', medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', high: 'text-supernova-red bg-supernova-red/10 border-supernova-red/20' };

export default function PricingEnginePage() {
    const [selectedScenario, setSelectedScenario] = useState(1);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-stellar-green" />
                <h2 className="mono-label text-stellar-green text-sm">PRICING ENGINE</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto">api/pricing.py • models/price_optimizer.py • models/elasticity_model.py</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Optimal Price Hero */}
                <div className="cosmic-card p-5 flex flex-col items-center justify-center text-center">
                    <div className="mono-label text-[0.6rem] text-starlight-faint mb-2">OPTIMAL PRICE POINT</div>
                    <motion.div className="text-5xl font-bold text-stellar-green glow-green font-mono" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.8 }}>
                        ${optimalPricing.optimalPrice}
                    </motion.div>
                    <div className="mono-label text-[0.55rem] text-starlight-faint mt-2">
                        CURRENT: <span className="text-hyper-cyan">${optimalPricing.currentPrice}</span> · COMP AVG: <span className="text-yellow-400">${optimalPricing.competitorAvg}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 w-full">
                        <div className="bg-white/[0.02] rounded p-2">
                            <div className="mono-label text-[0.45rem] text-starlight-faint">REVENUE</div>
                            <div className="font-mono text-sm text-stellar-green">{optimalPricing.revenueImpact}</div>
                        </div>
                        <div className="bg-white/[0.02] rounded p-2">
                            <div className="mono-label text-[0.45rem] text-starlight-faint">MARGIN</div>
                            <div className="font-mono text-sm text-hyper-cyan">{optimalPricing.marginImprovement}</div>
                        </div>
                    </div>
                </div>

                {/* Elasticity Curve */}
                <div className="cosmic-card p-4 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-hyper-cyan" />
                        <span className="mono-label text-hyper-cyan text-[0.65rem]">PRICE ELASTICITY CURVE</span>
                    </div>
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={elasticityCurve}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#39FF14" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#39FF14" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="price" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} tickFormatter={(v) => `$${v}`} />
                                <YAxis yAxisId="demand" orientation="left" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                                <YAxis yAxisId="revenue" orientation="right" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                                <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                                <ReferenceLine x={54.49} yAxisId="demand" stroke="rgba(57,255,20,0.4)" strokeDasharray="3 3" label={{ value: 'OPTIMAL', fill: '#39FF14', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                                <Area yAxisId="revenue" type="monotone" dataKey="revenue" fill="url(#revGrad)" stroke="none" />
                                <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#39FF14" strokeWidth={2} dot={false} name="Revenue" />
                                <Line yAxisId="demand" type="monotone" dataKey="demand" stroke="#00F0FF" strokeWidth={2} dot={false} name="Demand" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Pricing Scenarios */}
            <div className="cosmic-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="mono-label text-yellow-400 text-[0.65rem]">PRICING SCENARIOS</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {pricingScenarios.map((s) => (
                        <button key={s.id} onClick={() => setSelectedScenario(s.id)}
                            className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${selectedScenario === s.id
                                ? 'bg-hyper-cyan/5 border-hyper-cyan/25'
                                : 'bg-white/[0.01] border-glass-border hover:bg-white/[0.03]'
                                }`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="mono-label text-[0.55rem] text-starlight">{s.name}</span>
                                <span className={`text-[0.5rem] font-mono uppercase px-1.5 py-0.5 rounded border ${riskColor[s.risk]}`}>{s.risk}</span>
                            </div>
                            <div className="font-mono text-2xl text-hyper-cyan mb-2">${s.price}</div>
                            <div className="space-y-1 text-[0.6rem] font-mono">
                                <div className="flex justify-between"><span className="text-starlight-faint">Revenue</span><span className="text-stellar-green">{s.revenue}</span></div>
                                <div className="flex justify-between"><span className="text-starlight-faint">Demand</span><span className={s.demand.startsWith('+') ? 'text-stellar-green' : 'text-supernova-red'}>{s.demand}</span></div>
                                <div className="flex justify-between"><span className="text-starlight-faint">Margin</span><span className={s.margin.startsWith('+') ? 'text-stellar-green' : 'text-supernova-red'}>{s.margin}</span></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Model Info */}
            <div className="cosmic-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-stellar-green" />
                    <span className="mono-label text-stellar-green text-[0.65rem]">ELASTICITY MODEL INFO</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Algorithm', value: elasticityModelInfo.algorithm },
                        { label: 'Elasticity ε', value: elasticityModelInfo.elasticityCoefficient.toString() },
                        { label: 'Cross-Elasticity', value: elasticityModelInfo.crossElasticity.toString() },
                        { label: 'Optimal Range', value: `$${elasticityModelInfo.optimalPriceRange.min}–$${elasticityModelInfo.optimalPriceRange.max}` },
                        { label: 'R² Score', value: elasticityModelInfo.r2Score.toString() },
                        { label: 'Last Calibrated', value: elasticityModelInfo.lastCalibrated },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/[0.02] rounded-lg p-3">
                            <div className="mono-label text-[0.45rem] text-starlight-faint mb-1">{item.label}</div>
                            <div className="font-mono text-xs text-starlight">{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
