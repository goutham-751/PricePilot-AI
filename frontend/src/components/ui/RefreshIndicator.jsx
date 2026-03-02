import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

/**
 * Subtle refresh indicator that appears during auto-refresh.
 */
export default function RefreshIndicator({ isRefreshing, lastUpdated }) {
    return (
        <div className="flex items-center gap-2">
            {isRefreshing && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                >
                    <RefreshCw className="w-3 h-3 text-hyper-cyan animate-spin" />
                </motion.div>
            )}
            {lastUpdated && (
                <span className="mono-label text-[0.45rem] text-starlight-faint">
                    {isRefreshing ? 'REFRESHING...' : `UPDATED ${formatTimeAgo(lastUpdated)}`}
                </span>
            )}
        </div>
    );
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 10) return 'JUST NOW';
    if (seconds < 60) return `${seconds}s AGO`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m AGO`;
}
