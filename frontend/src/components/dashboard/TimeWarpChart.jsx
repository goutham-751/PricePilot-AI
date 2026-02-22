import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Line, ComposedChart,
} from 'recharts';
import { Clock } from 'lucide-react';
import { forecastTimeline } from '../../data/mockData';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="cosmic-card p-3 !rounded-xl text-sm !border-hyper-cyan/20">
            <div className="font-mono text-xs font-semibold text-hyper-cyan mb-2">{label}</div>
            {payload
                .filter(entry => entry.value != null)
                .map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 text-[0.7rem] mb-0.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-starlight-dim font-mono">{entry.name}:</span>
                        <span className="text-white font-mono font-medium">{entry.value?.toLocaleString()}</span>
                    </div>
                ))}
        </div>
    );
}

export default function TimeWarpChart({ xrayMode }) {
    const nowIndex = forecastTimeline.findIndex(d => d.past !== null && d.forecast !== null);

    const jsonData = JSON.stringify(
        { module: 'demand_forecasting', endpoint: '/api/v1/forecast/timeline', model: 'prophet_v2', data: forecastTimeline },
        null, 2
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="cosmic-card p-0 h-full flex flex-col"
        >
            {/* Header */}
            <div className="px-5 pt-4 pb-3 border-b border-glass-border flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-hyper-cyan" />
                        <span className="mono-label text-hyper-cyan text-[0.65rem]">TIME WARP — DEMAND FORECAST</span>
                    </div>
                    <p className="text-[0.65rem] text-starlight-faint">6-month historical + 6-month forecast with confidence</p>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-[2px] rounded-full bg-hyper-cyan" />
                        <span className="mono-label text-[0.55rem] text-starlight-faint">ACTUAL</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-[2px] rounded-full bg-hyper-cyan/60" style={{ borderTop: '2px dashed rgba(0,240,255,0.6)', height: 0 }} />
                        <span className="mono-label text-[0.55rem] text-starlight-faint">FORECAST</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-3 rounded-sm bg-hyper-cyan/10" />
                        <span className="mono-label text-[0.55rem] text-starlight-faint">CONFIDENCE</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
                {xrayMode ? (
                    <div className="h-full overflow-auto">
                        <pre className="terminal-text text-hyper-cyan/70 whitespace-pre-wrap text-[0.65rem] leading-relaxed">
                            {jsonData}
                        </pre>
                    </div>
                ) : (
                    <div className="h-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={forecastTimeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradPast" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradConfidence" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.08} />
                                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,240,255,0.04)" />
                                <XAxis
                                    dataKey="month"
                                    stroke="rgba(224,224,224,0.15)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    fontFamily="'JetBrains Mono', monospace"
                                />
                                <YAxis
                                    stroke="rgba(224,224,224,0.15)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                    fontFamily="'JetBrains Mono', monospace"
                                />
                                <Tooltip content={<CustomTooltip />} />

                                {/* NOW reference line */}
                                {nowIndex >= 0 && (
                                    <ReferenceLine
                                        x={forecastTimeline[nowIndex].month}
                                        stroke="rgba(0,240,255,0.4)"
                                        strokeDasharray="4 4"
                                        label={{
                                            value: 'NOW',
                                            position: 'top',
                                            fill: '#00F0FF',
                                            fontSize: 10,
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}
                                    />
                                )}

                                {/* Confidence interval (ghost band) */}
                                <Area
                                    type="monotone"
                                    dataKey="upper"
                                    name="Upper Bound"
                                    stroke="none"
                                    fill="url(#gradConfidence)"
                                    dot={false}
                                    activeDot={false}
                                    connectNulls={false}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="lower"
                                    name="Lower Bound"
                                    stroke="rgba(0,240,255,0.1)"
                                    strokeWidth={1}
                                    strokeDasharray="2 4"
                                    fill="transparent"
                                    dot={false}
                                    activeDot={false}
                                    connectNulls={false}
                                />

                                {/* Past data — solid glowing cyan */}
                                <Area
                                    type="monotone"
                                    dataKey="past"
                                    name="Actual"
                                    stroke="#00F0FF"
                                    strokeWidth={2.5}
                                    fill="url(#gradPast)"
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#00F0FF', stroke: '#00F0FF', strokeWidth: 2 }}
                                    connectNulls={false}
                                />

                                {/* Future forecast — dashed glowing line */}
                                <Line
                                    type="monotone"
                                    dataKey="forecast"
                                    name="Forecast"
                                    stroke="#00F0FF"
                                    strokeWidth={2}
                                    strokeDasharray="8 4"
                                    strokeOpacity={0.65}
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#00F0FF', stroke: '#000', strokeWidth: 2 }}
                                    connectNulls={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
