import { motion } from 'framer-motion';
import { Brain, Play, Pause, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { decisionRules, decisionLog } from '../data/mockData';

const priorityColor = { critical: 'text-supernova-red bg-supernova-red/10 border-supernova-red/20', high: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', medium: 'text-hyper-cyan bg-hyper-cyan/10 border-hyper-cyan/20' };
const statusConfig = { active: { icon: Play, color: 'text-stellar-green' }, paused: { icon: Pause, color: 'text-yellow-400' } };

export default function DecisionEnginePage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-stellar-green" />
                <h2 className="mono-label text-stellar-green text-sm">DECISION ENGINE</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto">services/decision_engine.py</span>
            </div>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {decisionRules.map((rule, i) => {
                    const { icon: StatusIcon, color } = statusConfig[rule.status] || statusConfig.active;
                    return (
                        <motion.div key={rule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            className="cosmic-card p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <StatusIcon className={`w-4 h-4 ${color}`} />
                                    <span className="font-mono text-xs text-starlight font-semibold">{rule.name}</span>
                                </div>
                                <span className={`text-[0.5rem] font-mono uppercase px-2 py-0.5 rounded border ${priorityColor[rule.priority]}`}>{rule.priority}</span>
                            </div>
                            <div className="space-y-2 mt-3">
                                <div className="bg-white/[0.02] rounded p-2.5">
                                    <div className="mono-label text-[0.45rem] text-starlight-faint mb-1">TRIGGER CONDITION</div>
                                    <code className="text-[0.6rem] font-mono text-hyper-cyan">{rule.trigger}</code>
                                </div>
                                <div className="bg-white/[0.02] rounded p-2.5">
                                    <div className="mono-label text-[0.45rem] text-starlight-faint mb-1">ACTION</div>
                                    <code className="text-[0.6rem] font-mono text-stellar-green">{rule.action}</code>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-[0.55rem] text-starlight-faint">
                                <Clock className="w-3 h-3" />
                                Last triggered: {rule.lastTriggered}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Decision Log */}
            <div className="cosmic-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-hyper-cyan" />
                    <span className="mono-label text-hyper-cyan text-[0.65rem]">DECISION LOG — RECENT EVALUATIONS</span>
                </div>
                <div className="space-y-1">
                    {decisionLog.map((entry, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02]">
                            <span className="font-mono text-[0.6rem] text-starlight-faint shrink-0 mt-0.5">{entry.time}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-mono text-[0.6rem] text-hyper-cyan">{entry.rule}</span>
                                </div>
                                <div className="text-[0.6rem] text-starlight-dim">
                                    Input: <span className="text-starlight-faint">{entry.input}</span>
                                </div>
                                <div className="text-[0.6rem] font-mono mt-0.5">
                                    <span className={entry.decision.startsWith('ADJUST') ? 'text-yellow-400' : entry.decision.startsWith('PASS') ? 'text-stellar-green' : 'text-hyper-cyan'}>
                                        → {entry.decision}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <CheckCircle className="w-3 h-3 text-stellar-green" />
                                <span className="font-mono text-[0.55rem] text-stellar-green">{entry.confidence}%</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
