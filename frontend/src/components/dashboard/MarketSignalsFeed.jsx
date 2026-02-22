import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, AlertTriangle, TrendingUp, ArrowDownRight, Package } from 'lucide-react';
import { marketSignals } from '../../data/mockData';

const severityConfig = {
    alert: { color: 'text-supernova-red', badge: 'bg-supernova-red/10 border-supernova-red/20 text-supernova-red', icon: AlertTriangle },
    warning: { color: 'text-yellow-400', badge: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400', icon: Package },
    info: { color: 'text-hyper-cyan', badge: 'bg-hyper-cyan/10 border-hyper-cyan/20 text-hyper-cyan', icon: TrendingUp },
    positive: { color: 'text-stellar-green', badge: 'bg-stellar-green/10 border-stellar-green/20 text-stellar-green', icon: ArrowDownRight },
};

export default function MarketSignalsFeed({ xrayMode }) {
    const [signals, setSignals] = useState(marketSignals.slice(0, 8));
    const scrollRef = useRef(null);
    const signalIndexRef = useRef(8);

    // Auto-add new signals periodically
    useEffect(() => {
        const interval = setInterval(() => {
            const idx = signalIndexRef.current % marketSignals.length;
            const newSignal = {
                ...marketSignals[idx],
                id: Date.now(),
                time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            };
            setSignals(prev => [newSignal, ...prev].slice(0, 20));
            signalIndexRef.current++;
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to top when new signal arrives
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [signals]);

    const jsonData = JSON.stringify(
        { module: 'data_ingestion', endpoint: '/api/v1/signals/stream', signals: marketSignals.slice(0, 4) },
        null, 2
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="cosmic-card p-0 h-full flex flex-col"
        >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-glass-border">
                <div className="flex items-center gap-2 mb-1">
                    <Terminal className="w-4 h-4 text-hyper-cyan" />
                    <span className="mono-label text-hyper-cyan text-[0.65rem]">MARKET SIGNALS</span>
                </div>
                <p className="text-[0.65rem] text-starlight-faint">Real-time competitor & market feed</p>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden">
                {xrayMode ? (
                    <div className="p-4 h-full overflow-auto">
                        <pre className="terminal-text text-hyper-cyan/70 whitespace-pre-wrap text-[0.65rem] leading-relaxed">
                            {jsonData}
                        </pre>
                    </div>
                ) : (
                    <div ref={scrollRef} className="p-3 h-full overflow-y-auto space-y-1">
                        {signals.map((signal, i) => {
                            const config = severityConfig[signal.severity] || severityConfig.info;
                            const Icon = config.icon;
                            return (
                                <motion.div
                                    key={signal.id}
                                    initial={i === 0 ? { opacity: 0, y: -10 } : false}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="group px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors cursor-default"
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 ${config.badge} border`}>
                                            <Icon className="w-2.5 h-2.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-mono text-[0.6rem] text-starlight-faint">{signal.time}</span>
                                                <span className={`font-mono text-[0.55rem] uppercase px-1.5 py-0.5 rounded ${config.badge} border`}>
                                                    {signal.type}
                                                </span>
                                            </div>
                                            <p className="terminal-text text-starlight-dim text-[0.68rem] leading-snug">
                                                {signal.message}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Fade at bottom */}
                {!xrayMode && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-obsidian to-transparent pointer-events-none" />
                )}
            </div>
        </motion.div>
    );
}
