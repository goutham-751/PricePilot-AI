import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true, glow = false, ...props }) {
    return (
        <motion.div
            className={`glass-card ${hover ? 'glass-card-hover' : ''} ${glow ? 'glow-border' : ''} p-6 transition-all duration-300 ${className}`}
            whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
            {...props}
        >
            {children}
        </motion.div>
    );
}
