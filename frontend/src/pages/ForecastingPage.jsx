import { motion } from 'framer-motion';
import { TrendingUp, Cpu, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { forecastTimeline, forecastModelMetrics, forecastBreakdown, demandForecastData } from '../data/mockData';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';

const dirIcon = { up: ArrowUp, down: ArrowDown, neutral: Minus };
const dirColor = { up: 'text-stellar-green', down: 'text-supernova-red', neutral: 'text-starlight-faint' };

export default function ForecastingPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-hyper-cyan" />
                <h2 className="mono-label text-hyper-cyan text-sm">DEMAND FORECASTING</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto">api/forecasting.py • models/demand_model.py</span>
            </div>

            {/* Full-width Forecast Chart */}
            <div className="cosmic-card p-4">
                <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">FORECAST TIMELINE — PROPHET + LIGHTGBM ENSEMBLE</div>
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={forecastTimeline}>
                            <defs>
                                <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#00F0FF" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                            <YAxis tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                            <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                            <ReferenceLine x="Jan" stroke="rgba(0,240,255,0.3)" strokeDasharray="3 3" label={{ value: 'NOW', fill: '#00F0FF', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                            <Area dataKey="upper" stroke="none" fill="url(#confGrad)" />
                            <Area dataKey="lower" stroke="none" fill="#000000" />
                            <Line type="monotone" dataKey="past" stroke="#00F0FF" strokeWidth={2} dot={{ fill: '#00F0FF', r: 3 }} connectNulls={false} name="Actual" />
                            <Line type="monotone" dataKey="forecast" stroke="#00F0FF" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: '#050505', stroke: '#00F0FF', r: 3 }} connectNulls={false} name="Forecast" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Model Metrics */}
                <div className="cosmic-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Cpu className="w-4 h-4 text-stellar-green" />
                        <span className="mono-label text-stellar-green text-[0.65rem]">MODEL PERFORMANCE</span>
                    </div>
                    <div className="space-y-2">
                        {[
                            { label: 'Model', value: forecastModelMetrics.model },
                            { label: 'Version', value: forecastModelMetrics.version },
                            { label: 'MAPE', value: `${forecastModelMetrics.mape}%`, highlight: true },
                            { label: 'RMSE', value: forecastModelMetrics.rmse.toString() },
                            { label: 'R² Score', value: forecastModelMetrics.r2.toString(), highlight: true },
                            { label: 'Training Points', value: forecastModelMetrics.trainingDataPoints.toLocaleString() },
                            { label: 'Features', value: forecastModelMetrics.features.toString() },
                            { label: 'CV Folds', value: forecastModelMetrics.crossValidationFolds.toString() },
                            { label: 'Last Trained', value: forecastModelMetrics.lastTrained },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-1.5 px-2 rounded hover:bg-white/[0.02]">
                                <span className="mono-label text-[0.55rem] text-starlight-faint">{item.label}</span>
                                <span className={`font-mono text-xs ${item.highlight ? 'text-stellar-green' : 'text-starlight'}`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-glass-border">
                        <div className="mono-label text-[0.5rem] text-starlight-faint mb-1.5">SEASONAL COMPONENTS</div>
                        <div className="flex flex-wrap gap-1.5">
                            {forecastModelMetrics.seasonalComponents.map((s) => (
                                <span key={s} className="px-2 py-0.5 rounded text-[0.5rem] font-mono bg-hyper-cyan/5 border border-hyper-cyan/15 text-hyper-cyan">{s}</span>
                            ))}
                        </div>
                        <div className="mono-label text-[0.5rem] text-starlight-faint mt-2 mb-1.5">REGRESSORS</div>
                        <div className="flex flex-wrap gap-1.5">
                            {forecastModelMetrics.regressors.map((r) => (
                                <span key={r} className="px-2 py-0.5 rounded text-[0.5rem] font-mono bg-stellar-green/5 border border-stellar-green/15 text-stellar-green">{r}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Forecast Breakdown */}
                <div className="cosmic-card p-4">
                    <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">FORECAST DECOMPOSITION</div>
                    <div className="h-[200px] mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecastBreakdown} layout="vertical">
                                <XAxis type="number" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} unit="%" />
                                <YAxis type="category" dataKey="component" tick={{ fill: '#999', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} width={120} />
                                <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                                <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                                    {forecastBreakdown.map((entry, i) => (
                                        <Cell key={i} fill={entry.direction === 'up' ? '#39FF14' : entry.direction === 'down' ? '#FF2A6D' : '#555'} fillOpacity={0.7} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-1.5">
                        {forecastBreakdown.map((item, i) => {
                            const Icon = dirIcon[item.direction];
                            return (
                                <div key={i} className="flex items-center justify-between py-1 px-2 rounded hover:bg-white/[0.02]">
                                    <span className="font-mono text-xs text-starlight-dim">{item.component}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-hyper-cyan">{item.contribution}%</span>
                                        <Icon className={`w-3 h-3 ${dirColor[item.direction]}`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Actual vs Forecast Table */}
            <div className="cosmic-card p-4">
                <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">MONTHLY ACTUAL vs FORECAST</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-[0.65rem] font-mono">
                        <thead>
                            <tr className="text-starlight-faint border-b border-glass-border">
                                <th className="text-left py-2 px-2">MONTH</th>
                                <th className="text-right py-2 px-2">ACTUAL</th>
                                <th className="text-right py-2 px-2">FORECAST</th>
                                <th className="text-right py-2 px-2">ERROR</th>
                                <th className="text-left py-2 px-2">SEASON</th>
                            </tr>
                        </thead>
                        <tbody>
                            {demandForecastData.map((row, i) => {
                                const error = ((row.actual - row.forecast) / row.actual * 100).toFixed(1);
                                return (
                                    <tr key={i} className="border-b border-glass-border/50 hover:bg-white/[0.02]">
                                        <td className="py-2 px-2 text-starlight">{row.month}</td>
                                        <td className="py-2 px-2 text-right text-starlight">{row.actual.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right text-hyper-cyan">{row.forecast.toLocaleString()}</td>
                                        <td className={`py-2 px-2 text-right ${Math.abs(error) < 3 ? 'text-stellar-green' : 'text-yellow-400'}`}>{error > 0 ? '+' : ''}{error}%</td>
                                        <td className="py-2 px-2 text-starlight-faint">{row.season}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
