import { motion } from 'framer-motion';
import { Activity, Radio, Eye, EyeOff } from 'lucide-react';

export default function HUDHeader({ xrayMode, onToggleXray }) {
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
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stellar-green/5 border border-stellar-green/20">
                    <div className="w-2 h-2 rounded-full bg-stellar-green animate-pulse-glow" />
                    <span className="mono-label text-stellar-green text-[0.6rem]">SYSTEMS NOMINAL</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-hyper-cyan/5 border border-hyper-cyan/20">
                    <Radio className="w-3 h-3 text-hyper-cyan animate-pulse" />
                    <span className="mono-label text-hyper-cyan text-[0.6rem]">LIVE DATA STREAM</span>
                </div>
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
