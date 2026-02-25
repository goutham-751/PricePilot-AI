import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Package, DollarSign } from 'lucide-react';
import { fetchRecommendations } from '../services/api';

const actionIcon = { increase: TrendingUp, decrease: TrendingDown, discount: DollarSign, stock: Package, hold: CheckCircle };
const actionColor = {
    increase: 'text-stellar-green bg-stellar-green/10 border-stellar-green/20',
    decrease: 'text-supernova-red bg-supernova-red/10 border-supernova-red/20',
    discount: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    stock: 'text-hyper-cyan bg-hyper-cyan/10 border-hyper-cyan/20',
    hold: 'text-starlight-dim bg-white/[0.03] border-glass-border',
};
const urgencyColor = { Critical: 'text-supernova-red', High: 'text-yellow-400', Medium: 'text-hyper-cyan', Low: 'text-starlight-dim' };

// Default rules for when API is unavailable
const defaultRules = [
    { id: 1, name: 'Competitor Undercut Response', trigger: 'price_position > 1.10', action: 'Match price within 5%', priority: 'critical', status: 'active' },
    { id: 2, name: 'Demand Surge Capture', trigger: 'growth > 0.15 AND momentum > 10', action: 'Increase 5-8%', priority: 'high', status: 'active' },
    { id: 3, name: 'Low Demand Guard', trigger: 'growth < -0.15', action: '10% discount', priority: 'high', status: 'active' },
    { id: 4, name: 'Seasonal Discount Window', trigger: 'seasonal < 0.9', action: '10-15% discount', priority: 'medium', status: 'active' },
    { id: 5, name: 'Trend Surge Preparation', trigger: 'momentum > 15', action: 'Increase stock', priority: 'medium', status: 'active' },
    { id: 6, name: 'Margin Floor Protection', trigger: 'position < 0.85', action: 'Block decrease', priority: 'critical', status: 'active' },
];

export default function DecisionEnginePage() {
    const [recommendations, setRecommendations] = useState([]);
    const [decisionLog, setDecisionLog] = useState([]);
    const [rules, setRules] = useState(defaultRules);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await fetchRecommendations();
            if (res) {
                if (res.live_recommendations?.length) setRecommendations(res.live_recommendations);
                if (res.decision_log?.length) setDecisionLog(res.decision_log);
            }
            setLoading(false);
        }
        load();
    }, []);

    const priorityColor = { critical: 'text-supernova-red', high: 'text-yellow-400', medium: 'text-hyper-cyan', low: 'text-starlight-dim' };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4 h-full overflow-y-auto pr-2">
            <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-hyper-cyan" />
                <h2 className="mono-label text-hyper-cyan text-sm">DECISION ENGINE</h2>
                <span className="mono-label text-[0.5rem] text-starlight-faint ml-auto">
                    {loading ? 'EVALUATING...' : `${recommendations.length} ACTIONS • ${rules.length} RULES`}
                </span>
            </div>

            {/* Active Recommendations */}
            {recommendations.length > 0 && (
                <div className="space-y-3">
                    <div className="mono-label text-stellar-green text-[0.65rem]">ACTIVE RECOMMENDATIONS</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {recommendations.map((rec, i) => {
                            const Icon = actionIcon[rec.type] || AlertTriangle;
                            const colors = actionColor[rec.type] || actionColor.hold;
                            return (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className={`cosmic-card p-4 border-l-2 ${colors.split(' ').slice(2).join(' ')}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${colors}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-mono text-xs text-starlight font-semibold">{rec.title}</span>
                                                <span className={`text-[0.5rem] font-mono ${urgencyColor[rec.urgency]}`}>{rec.urgency}</span>
                                            </div>
                                            <p className="text-[0.55rem] text-starlight-faint leading-relaxed mb-2">{rec.description}</p>
                                            <div className="flex items-center gap-3 text-[0.5rem] font-mono">
                                                <span className="text-hyper-cyan">Impact: {rec.impact}</span>
                                                <span className="text-stellar-green">Confidence: {rec.confidence}%</span>
                                                {rec.product_name && <span className="text-starlight-faint">{rec.product_name}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Rules Table */}
            <div className="cosmic-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="mono-label text-yellow-400 text-[0.65rem]">RULES ENGINE ({rules.length} RULES)</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-[0.6rem] font-mono">
                        <thead>
                            <tr className="text-starlight-faint border-b border-glass-border">
                                <th className="text-left py-2 px-2">RULE</th>
                                <th className="text-left py-2 px-2">TRIGGER</th>
                                <th className="text-left py-2 px-2">ACTION</th>
                                <th className="text-center py-2 px-2">PRIORITY</th>
                                <th className="text-center py-2 px-2">STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map(rule => (
                                <tr key={rule.id} className="border-b border-glass-border/50 hover:bg-white/[0.02]">
                                    <td className="py-2 px-2 text-starlight">{rule.name}</td>
                                    <td className="py-2 px-2 text-hyper-cyan/70"><code>{rule.trigger}</code></td>
                                    <td className="py-2 px-2 text-starlight-dim">{rule.action}</td>
                                    <td className={`py-2 px-2 text-center uppercase ${priorityColor[rule.priority]}`}>{rule.priority}</td>
                                    <td className="py-2 px-2 text-center">
                                        <span className="text-stellar-green flex items-center justify-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> {rule.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Decision Log */}
            {decisionLog.length > 0 && (
                <div className="cosmic-card p-4">
                    <div className="mono-label text-hyper-cyan text-[0.65rem] mb-3">DECISION LOG</div>
                    <div className="bg-void/50 rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-1">
                        {decisionLog.map((log, i) => (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                className="flex items-start gap-3 py-1.5 font-mono text-[0.55rem]">
                                <span className="text-starlight-faint shrink-0">{log.time}</span>
                                <span className="text-hyper-cyan shrink-0 w-40 truncate">{log.rule}</span>
                                <span className="text-starlight-faint shrink-0 w-32 truncate">{log.input}</span>
                                <span className={`${log.decision?.startsWith('ACTION') ? 'text-stellar-green' : 'text-starlight-dim'}`}>
                                    {log.decision}
                                </span>
                                <span className="text-starlight-faint ml-auto shrink-0">{log.confidence}%</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
