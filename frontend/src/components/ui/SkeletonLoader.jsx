import { motion } from 'framer-motion';

/**
 * Reusable skeleton loader with shimmer animation.
 * Variants: card, chart, table, text, metric
 */
export default function SkeletonLoader({ variant = 'card', count = 1, className = '' }) {
    const skeletons = Array.from({ length: count }, (_, i) => i);

    switch (variant) {
        case 'metric':
            return (
                <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
                    {skeletons.map(i => (
                        <div key={i} className="cosmic-card p-4 text-center animate-pulse">
                            <div className="w-5 h-5 rounded bg-white/[0.06] mx-auto mb-2" />
                            <div className="h-2 w-16 bg-white/[0.04] rounded mx-auto mb-2" />
                            <div className="h-6 w-12 bg-white/[0.08] rounded mx-auto" />
                        </div>
                    ))}
                </div>
            );

        case 'chart':
            return (
                <div className={`cosmic-card p-4 ${className}`}>
                    <div className="h-3 w-40 bg-white/[0.06] rounded mb-4 animate-pulse" />
                    <div className="h-[250px] flex items-end gap-1 px-4">
                        {Array.from({ length: 12 }, (_, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 bg-white/[0.04] rounded-t"
                                initial={{ height: 0 }}
                                animate={{ height: `${30 + Math.random() * 60}%` }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                            />
                        ))}
                    </div>
                </div>
            );

        case 'table':
            return (
                <div className={`cosmic-card p-4 ${className}`}>
                    <div className="h-3 w-32 bg-white/[0.06] rounded mb-4 animate-pulse" />
                    <div className="space-y-2">
                        <div className="flex gap-4 border-b border-glass-border pb-2">
                            {[80, 50, 50, 50, 60].map((w, i) => (
                                <div key={i} className={`h-2 bg-white/[0.04] rounded animate-pulse`} style={{ width: `${w}px` }} />
                            ))}
                        </div>
                        {Array.from({ length: count || 5 }, (_, i) => (
                            <div key={i} className="flex gap-4 py-1.5 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                                {[80, 50, 50, 50, 60].map((w, j) => (
                                    <div key={j} className="h-2 bg-white/[0.03] rounded" style={{ width: `${w}px` }} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'text':
            return (
                <div className={`space-y-2 animate-pulse ${className}`}>
                    {skeletons.map(i => (
                        <div key={i} className="h-2 bg-white/[0.04] rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
                    ))}
                </div>
            );

        case 'card':
        default:
            return (
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${className}`}>
                    {skeletons.map(i => (
                        <div key={i} className="cosmic-card p-4 animate-pulse">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-white/[0.06]" />
                                <div className="flex-1">
                                    <div className="h-3 w-24 bg-white/[0.06] rounded mb-1" />
                                    <div className="h-2 w-16 bg-white/[0.03] rounded" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 bg-white/[0.03] rounded w-full" />
                                <div className="h-2 bg-white/[0.03] rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            );
    }
}

/**
 * Inline skeleton line for single values
 */
export function SkeletonLine({ width = '60px', height = '14px' }) {
    return (
        <span
            className="inline-block bg-white/[0.06] rounded animate-pulse align-middle"
            style={{ width, height }}
        />
    );
}
