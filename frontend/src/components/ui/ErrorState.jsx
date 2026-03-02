import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error fallback with retry button, HUD-themed.
 */
export default function ErrorState({ message, onRetry, compact = false }) {
    if (compact) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-supernova-red/5 border border-supernova-red/15">
                <AlertTriangle className="w-3.5 h-3.5 text-supernova-red shrink-0" />
                <span className="text-[0.6rem] font-mono text-supernova-red/80 truncate">
                    {message || 'Connection failed'}
                </span>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="ml-auto shrink-0 p-1 rounded hover:bg-supernova-red/10 transition-colors cursor-pointer"
                    >
                        <RefreshCw className="w-3 h-3 text-supernova-red/60" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="cosmic-card p-8 text-center"
        >
            <div className="w-12 h-12 rounded-xl bg-supernova-red/10 border border-supernova-red/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-supernova-red" />
            </div>
            <div className="mono-label text-supernova-red text-[0.7rem] mb-2">CONNECTION ERROR</div>
            <p className="text-[0.65rem] text-starlight-faint max-w-sm mx-auto mb-4">
                {message || 'Unable to connect to the PricePilot AI backend. Ensure the server is running on localhost:8000.'}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-supernova-red/10 border border-supernova-red/20 text-supernova-red text-[0.65rem] font-mono hover:bg-supernova-red/15 transition-colors cursor-pointer"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    RETRY CONNECTION
                </button>
            )}
        </motion.div>
    );
}
