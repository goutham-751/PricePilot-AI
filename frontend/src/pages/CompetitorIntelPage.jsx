import { motion } from 'framer-motion';
import { Radar, Globe, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { competitorProfiles, scraperJobs, priceHistoryData } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const statusIcon = { completed: CheckCircle, running: Clock, failed: XCircle };
const statusColor = { completed: 'text-stellar-green', running: 'text-hyper-cyan animate-pulse', failed: 'text-supernova-red' };
const threatColor = { high: 'text-supernova-red bg-supernova-red/10 border-supernova-red/20', medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', low: 'text-stellar-green bg-stellar-green/10 border-stellar-green/20' };

export default function CompetitorIntelPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <Radar className="w-5 h-5 text-hyper-cyan" />
                <h2 className="mono-label text-hyper-cyan text-sm">COMPETITOR INTELLIGENCE</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto">api/competitors.py • services/scraper.py</span>
            </div>

            {/* Competitor Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {competitorProfiles.map((comp) => (
                    <motion.div key={comp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * parseInt(comp.id, 36) }}
                        className="cosmic-card p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="text-starlight font-mono text-sm font-semibold">{comp.name}</div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Globe className="w-3 h-3 text-starlight-faint" />
                                    <span className="text-[0.6rem] text-starlight-faint">{comp.domain}</span>
                                </div>
                            </div>
                            <span className={`text-[0.5rem] font-mono uppercase px-2 py-0.5 rounded border ${threatColor[comp.threatLevel]}`}>
                                {comp.threatLevel} THREAT
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white/[0.02] rounded p-2">
                                <div className="mono-label text-[0.45rem] text-starlight-faint">PRICE RANGE</div>
                                <div className="font-mono text-xs text-hyper-cyan mt-0.5">{comp.priceRange}</div>
                            </div>
                            <div className="bg-white/[0.02] rounded p-2">
                                <div className="mono-label text-[0.45rem] text-starlight-faint">PRODUCTS</div>
                                <div className="font-mono text-xs text-starlight mt-0.5">{comp.products}</div>
                            </div>
                            <div className="bg-white/[0.02] rounded p-2">
                                <div className="mono-label text-[0.45rem] text-starlight-faint">STRATEGY</div>
                                <div className="font-mono text-xs text-starlight mt-0.5">{comp.strategy}</div>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-[0.55rem] text-starlight-faint">
                            <Clock className="w-3 h-3" />
                            Last scraped: {comp.lastScraped}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Price History Chart */}
            <div className="cosmic-card p-4">
                <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">PRICE HISTORY — 8 WEEK COMPARISON</div>
                <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceHistoryData}>
                            <XAxis dataKey="week" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} />
                            <YAxis tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a1a1a' }} domain={['auto', 'auto']} />
                            <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                            <Line type="monotone" dataKey="you" stroke="#39FF14" strokeWidth={2} dot={false} name="Your Price" />
                            <Line type="monotone" dataKey="compA" stroke="#00F0FF" strokeWidth={1.5} dot={false} name="Comp A" strokeDasharray="4 2" />
                            <Line type="monotone" dataKey="compB" stroke="#FF2A6D" strokeWidth={1.5} dot={false} name="Comp B" strokeDasharray="4 2" />
                            <Line type="monotone" dataKey="compC" stroke="#FFD700" strokeWidth={1.5} dot={false} name="Comp C" strokeDasharray="4 2" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Scraper Status Table */}
            <div className="cosmic-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="mono-label text-yellow-400 text-[0.65rem]">SCRAPER JOB STATUS</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-[0.65rem] font-mono">
                        <thead>
                            <tr className="text-starlight-faint border-b border-glass-border">
                                <th className="text-left py-2 px-2">TARGET</th>
                                <th className="text-left py-2 px-2">STATUS</th>
                                <th className="text-left py-2 px-2">DURATION</th>
                                <th className="text-left py-2 px-2">RECORDS</th>
                                <th className="text-left py-2 px-2">LAST RUN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scraperJobs.map((job) => {
                                const Icon = statusIcon[job.status] || Clock;
                                return (
                                    <tr key={job.id} className="border-b border-glass-border/50 hover:bg-white/[0.02]">
                                        <td className="py-2 px-2 text-starlight">{job.target}</td>
                                        <td className={`py-2 px-2 ${statusColor[job.status]}`}>
                                            <span className="flex items-center gap-1"><Icon className="w-3 h-3" />{job.status.toUpperCase()}</span>
                                        </td>
                                        <td className="py-2 px-2 text-starlight-dim">{job.duration}</td>
                                        <td className="py-2 px-2 text-hyper-cyan">{job.records}</td>
                                        <td className="py-2 px-2 text-starlight-faint">{job.lastRun}</td>
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
