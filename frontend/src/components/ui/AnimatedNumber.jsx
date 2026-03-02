import { useEffect, useRef, useState } from 'react';

/**
 * Animated counter that smoothly transitions between values.
 *
 * @param {number} value - Target number
 * @param {string} prefix - Prefix (e.g. '$')
 * @param {string} suffix - Suffix (e.g. '%', 'K')
 * @param {number} decimals - Decimal places
 * @param {number} duration - Animation duration in ms
 * @param {string} className - Additional CSS classes
 */
export default function AnimatedNumber({
    value,
    prefix = '',
    suffix = '',
    decimals = 0,
    duration = 800,
    className = '',
}) {
    const [displayed, setDisplayed] = useState(0);
    const prevRef = useRef(0);
    const frameRef = useRef(null);

    useEffect(() => {
        const startValue = prevRef.current;
        const endValue = typeof value === 'number' ? value : parseFloat(value) || 0;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * eased;

            setDisplayed(current);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                prevRef.current = endValue;
            }
        }

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [value, duration]);

    const formatted = decimals > 0
        ? displayed.toFixed(decimals)
        : Math.round(displayed).toLocaleString();

    return (
        <span className={className}>
            {prefix}{formatted}{suffix}
        </span>
    );
}
