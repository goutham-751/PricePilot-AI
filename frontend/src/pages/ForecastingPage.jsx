import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { fetchModelMetrics, fetchLatestForecast } from '../services/api';
import { forecastTimeline as mockTimeline } from '../data/mockData';

export default function ForecastingPage() {
    const [forecast, setForecast] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [productId, setProductId] = useState(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const metricsRes = await fetchModelMetrics();
            if (metricsRes?.metrics) {
                setMetrics(metricsRes.metrics);
                // Auto-fetch forecast for first product
                const firstProduct = metricsRes.metrics.product_metrics?.[0];
                if (firstProduct) {
                    setProductId(firstProduct.product_id);
                    const forecastRes = await fetchLatestForecast(firstProduct.product_id, 14);
                    if (forecastRes?.forecasts) setForecast(forecastRes);
                }
            }
            setLoading(false);
        }
        load();
    }, []);

    // Build timeline from API or mock
    const timeline = forecast?.forecasts?.length > 0
        ? forecast.forecasts.map(f => ({
            date: f.date || f.forecast_date,
            predicted: f.predicted_demand || f.predicted_demand,
            upper: f.upper_bound || (f.predicted_demand * 1.2),
            lower: f.lower_bound || (f.predicted_demand * 0.8),
        }))
        : mockTimeline;

    const modelInfo = metrics ? {
        algorithm: metrics.algorithm,
        products: metrics.products_analyzed,
        totalForecasts: metrics.total_forecasts,
        params: metrics.smoothing_params,
    } : null;

    const confidence = forecast?.confidence || 0.85;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-hyper-cyan" />
                <h2 className="mono-label text-hyper-cyan text-sm">DEMAND FORECASTING</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto">
                    {loading ? 'LOADING...' : `CONFIDENCE: ${(confidence * 100).toFixed(0)}%`}
                </span>
            </div>

            {/* Model Performance Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Algorithm', value: modelInfo?.algorithm?.split(' ')[0] || 'Holt-Winters', icon: Brain, color: 'text-hyper-cyan' },
                    { label: 'Confidence', value: `${(confidence * 100).toFixed(0)}%`, icon: CheckCircle, color: confidence > 0.8 ? 'text-stellar-green' : 'text-yellow-400' },
                    { label: 'Products', value: modelInfo?.products || '—', icon: TrendingUp, color: 'text-hyper-cyan' },
                    { label: 'Forecasts', value: modelInfo?.totalForecasts || '—', icon: Clock, color: 'text-starlight' },
                ].map((m, i) => {
                    const Icon = m.icon;
                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }} className="cosmic-card p-4 text-center">
                            <Icon className={`w-5 h-5 ${m.color} mx-auto mb-2`} />
                            <div className="mono-label text-[0.5rem] text-starlight-faint">{m.label}</div>
                            <div className={`font-mono text-lg font-bold ${m.color} mt-1`}>{m.value}</div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Forecast Timeline Chart */}
            <div className="cosmic-card p-4">
                <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">
                    FORECAST TIMELINE — {timeline.length} DAY HORIZON
                </div>
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeline}>
                            <defs>
                                <linearGradient id="forecast_band" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }}
                                tickFormatter={d => d?.slice(5) || d} />
                            <YAxis tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                            <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#forecast_band)" name="Upper Bound" />
                            <Area type="monotone" dataKey="lower" stroke="none" fill="none" name="Lower Bound" />
                            <Line type="monotone" dataKey="predicted" stroke="#00F0FF" strokeWidth={2} dot={false} name="Predicted" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Forecast Decomposition */}
            {modelInfo?.params && (
                <div className="cosmic-card p-4">
                    <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">MODEL DECOMPOSITION</div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {[
                            { label: 'Level (α)', value: modelInfo.params.alpha, desc: 'Smoothing factor' },
                            { label: 'Trend (β)', value: modelInfo.params.beta, desc: 'Trend responsiveness' },
                            { label: 'Season (γ)', value: modelInfo.params.gamma, desc: 'Seasonal weight' },
                        ].map((p, i) => (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
                                className="bg-white/[0.02] rounded-lg p-3">
                                <div className="mono-label text-[0.5rem] text-starlight-faint">{p.label}</div>
                                <div className="font-mono text-xl text-hyper-cyan font-bold mt-1">{p.value}</div>
                                <div className="text-[0.5rem] text-starlight-faint mt-1">{p.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Predictions Table */}
            {forecast?.forecasts?.length > 0 && (
                <div className="cosmic-card p-4">
                    <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">PREDICTED DEMAND</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[0.6rem] font-mono">
                            <thead>
                                <tr className="text-starlight-faint border-b border-glass-border">
                                    <th className="text-left py-2 px-2">DATE</th>
                                    <th className="text-right py-2 px-2">PREDICTED</th>
                                    <th className="text-right py-2 px-2">LOWER</th>
                                    <th className="text-right py-2 px-2">UPPER</th>
                                    <th className="text-left py-2 px-2">DAY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {forecast.forecasts.slice(0, 14).map((p, i) => (
                                    <tr key={i} className="border-b border-glass-border/50 hover:bg-white/[0.02]">
                                        <td className="py-2 px-2 text-starlight">{p.date || p.forecast_date}</td>
                                        <td className="py-2 px-2 text-right text-hyper-cyan font-semibold">
                                            {(p.predicted_demand || p.predicted)?.toFixed(0)}
                                        </td>
                                        <td className="py-2 px-2 text-right text-starlight-faint">
                                            {(p.lower_bound || p.lower)?.toFixed(0)}
                                        </td>
                                        <td className="py-2 px-2 text-right text-starlight-faint">
                                            {(p.upper_bound || p.upper)?.toFixed(0)}
                                        </td>
                                        <td className="py-2 px-2 text-starlight-dim">{p.day_of_week || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
