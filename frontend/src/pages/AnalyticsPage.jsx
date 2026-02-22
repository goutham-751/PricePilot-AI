import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { analyticsKPIs, featureImportance, marketTrendData } from '../data/mockData';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const trendIcon = { up: TrendingUp, down: TrendingDown };
const trendColor = { up: 'text-stellar-green', down: 'text-stellar-green' }; // down churn is good
const categoryColor = { competitor: '#00F0FF', market: '#39FF14', temporal: '#FFD700', supply: '#FF2A6D', pricing: '#9B59B6', marketing: '#E67E22', external: '#1ABC9C', engagement: '#3498DB' };

export default function AnalyticsPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-hyper-cyan" />
                <h2 className="mono-label text-hyper-cyan text-sm">ANALYTICS DASHBOARD</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto">api/analytics.py • services/feature_engineering.py</span>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {analyticsKPIs.map((kpi, i) => {
                    const Icon = trendIcon[kpi.trend];
                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            className="cosmic-card p-4 text-center">
                            <div className="mono-label text-[0.45rem] text-starlight-faint mb-1">{kpi.label.toUpperCase()}</div>
                            <div className="font-mono text-xl text-starlight font-bold">{kpi.value}</div>
                            <div className={`flex items-center justify-center gap-1 mt-1 ${trendColor[kpi.trend]}`}>
                                <Icon className="w-3 h-3" />
                                <span className="font-mono text-[0.6rem]">{kpi.change}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Market Trends Chart */}
                <div className="cosmic-card p-4">
                    <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">MARKET TRENDS & SENTIMENT</div>
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={marketTrendData}>
                                <defs>
                                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#00F0FF" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#39FF14" stopOpacity={0.15} />
                                        <stop offset="100%" stopColor="#39FF14" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                                <YAxis tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                                <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                                <Area type="monotone" dataKey="trend" stroke="#00F0FF" strokeWidth={2} fill="url(#trendGrad)" name="Trend Index" />
                                <Area type="monotone" dataKey="sentiment" stroke="#39FF14" strokeWidth={2} fill="url(#sentGrad)" name="Sentiment" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Feature Importance */}
                <div className="cosmic-card p-4">
                    <div className="mono-label text-stellar-green text-[0.65rem] mb-3">FEATURE IMPORTANCE — TOP 10</div>
                    <div className="h-[200px] mb-3">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={featureImportance} layout="vertical">
                                <XAxis type="number" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                                <YAxis type="category" dataKey="feature" tick={{ fill: '#999', fontSize: 8, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} width={140} />
                                <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                                    {featureImportance.map((entry, i) => (
                                        <Cell key={i} fill={categoryColor[entry.category] || '#555'} fillOpacity={0.7} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(categoryColor).map(([cat, color]) => (
                            <div key={cat} className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                <span className="text-[0.5rem] font-mono text-starlight-faint">{cat}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
