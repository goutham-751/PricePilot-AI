import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Radio, Eye, EyeOff, Wifi, WifiOff } from 'lucide-react';
import { checkHealth } from '../../services/api';

export default function HUDHeader({ xrayMode, onToggleXray }) {
    const [health, setHealth] = useState(null);
    const [latency, setLatency] = useState(null);

    useEffect(() => {
        async function ping() {
            const start = performance.now();
            try {
                const res = await checkHealth();
                const ms = Math.round(performance.now() - start);
                setHealth(res);
                setLatency(ms);
            } catch {
                setHealth(null);
                setLatency(null);
            }
        }

        ping();
        const interval = setInterval(ping, 30000);
        return () => clearInterval(interval);
    }, []);

    const isConnected = health?.status === 'healthy';
    const dbOk = health?.database === 'connected';

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="cosmic-card px-6 py-3 flex items-center justify-between"
        >
            {/* Left — Logo */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-hyper-cyan/10 border border-hyper-cyan/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-hyper-cyan" />
                </div>
                <div>
                    <span className="font-semibold text-sm text-white tracking-wide">
                        PRICEPILOT<span className="text-hyper-cyan">.AI</span>
                    </span>
                    <div className="mono-label text-[0.6rem] mt-0.5">COMMAND CENTER v3.2</div>
                </div>
            </div>

            {/* Center — System Status */}
            <div className="hidden md:flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isConnected
                        ? 'bg-stellar-green/5 border border-stellar-green/20'
                        : 'bg-supernova-red/5 border border-supernova-red/20'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-stellar-green animate-pulse-glow' : 'bg-supernova-red'}`} />
                    <span className={`mono-label text-[0.6rem] ${isConnected ? 'text-stellar-green' : 'text-supernova-red'}`}>
                        {isConnected ? 'SYSTEMS NOMINAL' : 'DISCONNECTED'}
                    </span>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isConnected
                        ? 'bg-hyper-cyan/5 border border-hyper-cyan/20'
                        : 'bg-white/[0.02] border border-glass-border'
                    }`}>
                    {isConnected ? (
                        <Radio className="w-3 h-3 text-hyper-cyan animate-pulse" />
                    ) : (
                        <WifiOff className="w-3 h-3 text-starlight-faint" />
                    )}
                    <span className={`mono-label text-[0.6rem] ${isConnected ? 'text-hyper-cyan' : 'text-starlight-faint'}`}>
                        {isConnected ? 'LIVE DATA STREAM' : 'OFFLINE'}
                    </span>
                </div>

                {latency !== null && (
                    <span className="mono-label text-[0.5rem] text-starlight-faint">
                        {latency}ms
                    </span>
                )}

                {dbOk !== undefined && (
                    <span className={`mono-label text-[0.5rem] ${dbOk ? 'text-stellar-green' : 'text-supernova-red'}`}>
                        DB: {dbOk ? 'OK' : 'ERR'}
                    </span>
                )}
            </div>

            {/* Right — X-Ray Toggle */}
            <button
                onClick={onToggleXray}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 cursor-pointer ${xrayMode
                    ? 'bg-hyper-cyan/10 border-hyper-cyan/30 text-hyper-cyan box-glow-cyan'
                    : 'bg-white/[0.02] border-white/10 text-starlight-dim hover:border-white/20 hover:text-starlight'
                    }`}
            >
                {xrayMode ? (
                    <EyeOff className="w-4 h-4" />
                ) : (
                    <Eye className="w-4 h-4" />
                )}
                <span className="mono-label text-[0.6rem]">
                    {xrayMode ? 'X-RAY ON' : 'X-RAY'}
                </span>
            </button>
        </motion.header>
    );
}
