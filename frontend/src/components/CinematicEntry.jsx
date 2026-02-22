import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const terminalLines = [
    { delay: 0, text: '> Initializing PricePilot AI v3.2.1...' },
    { delay: 400, text: '> Loading neural pricing models...' },
    { delay: 800, text: '> Establishing uplink to market data streams...' },
    { delay: 1400, text: '> Ingesting competitor pricing matrices...' },
    { delay: 2000, text: '> Calibrating demand forecast engine...' },
    { delay: 2600, text: '> Syncing real-time inventory feeds...' },
    { delay: 3200, text: '> All systems nominal.' },
    { delay: 3600, text: '> System Status: ONLINE.' },
];

export default function CinematicEntry({ onComplete }) {
    const [stage, setStage] = useState('terminal'); // terminal | ignition | done
    const [visibleLines, setVisibleLines] = useState([]);
    const [typingLine, setTypingLine] = useState('');
    const [currentLineIdx, setCurrentLineIdx] = useState(0);

    // Terminal typing effect
    useEffect(() => {
        if (stage !== 'terminal') return;

        if (currentLineIdx >= terminalLines.length) {
            // All lines typed, move to ignition after a beat
            const timer = setTimeout(() => setStage('ignition'), 600);
            return () => clearTimeout(timer);
        }

        const line = terminalLines[currentLineIdx];
        const startDelay = currentLineIdx === 0 ? 500 : 100;

        const startTimer = setTimeout(() => {
            let charIdx = 0;
            const typeInterval = setInterval(() => {
                if (charIdx <= line.text.length) {
                    setTypingLine(line.text.slice(0, charIdx));
                    charIdx++;
                } else {
                    clearInterval(typeInterval);
                    setVisibleLines(prev => [...prev, line.text]);
                    setTypingLine('');
                    setCurrentLineIdx(prev => prev + 1);
                }
            }, 20);

            return () => clearInterval(typeInterval);
        }, startDelay);

        return () => clearTimeout(startTimer);
    }, [stage, currentLineIdx]);

    // Ignition → done
    useEffect(() => {
        if (stage !== 'ignition') return;
        const timer = setTimeout(() => {
            setStage('done');
            setTimeout(onComplete, 800);
        }, 2200);
        return () => clearTimeout(timer);
    }, [stage, onComplete]);

    return (
        <AnimatePresence>
            {stage !== 'done' && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-void flex items-center justify-center"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                >
                    {/* Terminal Stage */}
                    {stage === 'terminal' && (
                        <motion.div
                            className="w-full max-w-2xl px-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Terminal header */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-supernova-red/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-3 h-3 rounded-full bg-stellar-green/60" />
                                <span className="ml-3 mono-label text-hyper-cyan/40">PRICEPILOT://BOOT</span>
                            </div>

                            {/* Terminal body */}
                            <div className="cosmic-card p-6 min-h-[300px]">
                                <div className="terminal-text text-starlight-dim space-y-1">
                                    {visibleLines.map((line, i) => (
                                        <div key={i} className={
                                            line.includes('ONLINE')
                                                ? 'text-stellar-green glow-green'
                                                : line.includes('nominal')
                                                    ? 'text-hyper-cyan glow-cyan'
                                                    : ''
                                        }>
                                            {line}
                                        </div>
                                    ))}
                                    {typingLine && (
                                        <div className="text-hyper-cyan">
                                            {typingLine}
                                            <span className="animate-cursor text-hyper-cyan">█</span>
                                        </div>
                                    )}
                                    {!typingLine && currentLineIdx < terminalLines.length && (
                                        <span className="animate-cursor text-hyper-cyan">█</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Ignition Stage — Cyan Orb Big Bang */}
                    {stage === 'ignition' && (
                        <div className="relative flex items-center justify-center w-full h-full">
                            {/* Central orb */}
                            <motion.div
                                className="absolute w-4 h-4 rounded-full bg-hyper-cyan"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{
                                    boxShadow: '0 0 60px rgba(0,240,255,0.8), 0 0 120px rgba(0,240,255,0.4), 0 0 200px rgba(0,240,255,0.2)',
                                }}
                            />
                            {/* Expanding shockwave */}
                            <motion.div
                                className="absolute w-4 h-4 rounded-full bg-hyper-cyan/30"
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 150, opacity: 0 }}
                                transition={{ duration: 2, ease: [0.23, 1, 0.32, 1], delay: 0.4 }}
                            />
                            {/* Flash overlay */}
                            <motion.div
                                className="absolute inset-0 bg-hyper-cyan"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.6, 0] }}
                                transition={{ duration: 1.2, delay: 0.6, times: [0, 0.3, 1] }}
                            />
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
