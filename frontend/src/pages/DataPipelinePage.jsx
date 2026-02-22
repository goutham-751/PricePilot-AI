import { motion } from 'framer-motion';
import { GitBranch, CheckCircle, Clock, XCircle, Play, Terminal } from 'lucide-react';
import { pipelineJobs, pipelineLogs } from '../data/mockData';

const jobStatusConfig = {
    running: { icon: Play, color: 'text-hyper-cyan', bg: 'bg-hyper-cyan/10 border-hyper-cyan/20', label: 'RUNNING' },
    idle: { icon: Clock, color: 'text-starlight-faint', bg: 'bg-white/[0.02] border-glass-border', label: 'IDLE' },
    completed: { icon: CheckCircle, color: 'text-stellar-green', bg: 'bg-stellar-green/10 border-stellar-green/20', label: 'COMPLETED' },
    failed: { icon: XCircle, color: 'text-supernova-red', bg: 'bg-supernova-red/10 border-supernova-red/20', label: 'FAILED' },
};

const logColor = { INFO: 'text-hyper-cyan', OK: 'text-stellar-green', WARN: 'text-yellow-400', ERROR: 'text-supernova-red' };

export default function DataPipelinePage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-5 h-5 text-hyper-cyan" />
                <h2 className="mono-label text-hyper-cyan text-sm">DATA PIPELINE</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto">services/scraper.py • services/trends_fetcher.py • core/scheduler.py</span>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {pipelineJobs.map((job, i) => {
                    const config = jobStatusConfig[job.status];
                    const Icon = config.icon;
                    return (
                        <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            className="cosmic-card p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="font-mono text-xs text-starlight font-semibold">{job.name}</div>
                                    <div className="text-[0.55rem] text-starlight-faint mt-0.5">{job.service}</div>
                                </div>
                                <span className={`flex items-center gap-1 text-[0.5rem] font-mono px-2 py-0.5 rounded border ${config.bg} ${config.color}`}>
                                    <Icon className={`w-3 h-3 ${job.status === 'running' ? 'animate-pulse' : ''}`} />
                                    {config.label}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3 text-[0.55rem]">
                                <div>
                                    <div className="mono-label text-[0.45rem] text-starlight-faint">SCHEDULE</div>
                                    <code className="text-hyper-cyan">{job.cron}</code>
                                </div>
                                <div>
                                    <div className="mono-label text-[0.45rem] text-starlight-faint">AVG DURATION</div>
                                    <span className="text-starlight">{job.avgDuration}</span>
                                </div>
                                <div>
                                    <div className="mono-label text-[0.45rem] text-starlight-faint">LAST RUN</div>
                                    <span className="text-starlight-dim">{job.lastRun}</span>
                                </div>
                                <div>
                                    <div className="mono-label text-[0.45rem] text-starlight-faint">NEXT RUN</div>
                                    <span className="text-hyper-cyan">{job.nextRun}</span>
                                </div>
                            </div>
                            {/* Success rate bar */}
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="mono-label text-[0.45rem] text-starlight-faint">SUCCESS RATE</span>
                                    <span className="font-mono text-[0.55rem] text-stellar-green">{job.successRate}%</span>
                                </div>
                                <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div className="h-full rounded-full bg-stellar-green" initial={{ width: 0 }} animate={{ width: `${job.successRate}%` }}
                                        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + i * 0.1 }}
                                        style={{ boxShadow: '0 0 6px rgba(57,255,20,0.3)' }} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Pipeline Log */}
            <div className="cosmic-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-4 h-4 text-stellar-green" />
                    <span className="mono-label text-stellar-green text-[0.65rem]">PIPELINE LOG</span>
                </div>
                <div className="bg-void/50 rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-0.5">
                    {pipelineLogs.map((log, i) => (
                        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-3 py-1.5 font-mono text-[0.6rem]">
                            <span className="text-starlight-faint shrink-0">{log.time}</span>
                            <span className={`shrink-0 w-10 text-center ${logColor[log.level]}`}>[{log.level}]</span>
                            <span className="text-starlight-faint shrink-0">{log.job}</span>
                            <span className="text-starlight-dim">{log.message}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
