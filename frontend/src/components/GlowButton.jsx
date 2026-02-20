import { motion } from 'framer-motion';

export default function GlowButton({ children, variant = 'primary', className = '', onClick, ...props }) {
    const base = 'relative px-8 py-3 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 cursor-pointer overflow-hidden';

    const variants = {
        primary: 'gradient-bg text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]',
        secondary: 'bg-transparent border border-white/10 text-white/80 hover:border-accent-green/50 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
        lime: 'bg-accent-lime/10 border border-accent-lime/30 text-neon-green hover:bg-accent-lime/20 hover:shadow-[0_0_25px_rgba(74,222,128,0.3)]',
    };

    return (
        <motion.button
            className={`${base} ${variants[variant]} ${className}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
}
