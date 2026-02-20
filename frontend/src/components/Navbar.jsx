import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, BarChart3, Menu, X } from 'lucide-react';

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const links = [
        { to: '/', label: 'Home' },
        { to: '/dashboard', label: 'Dashboard' },
    ];

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50"
        >
            <div className="mx-4 mt-4">
                <div className="glass-card px-6 py-3 flex items-center justify-between max-w-7xl mx-auto">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                            <Rocket className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-display font-bold text-lg text-white group-hover:text-accent-green transition-colors">
                            PricePilot<span className="text-neon-green">.AI</span>
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${location.pathname === to
                                        ? 'text-white bg-white/5 border border-white/10'
                                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                        <Link
                            to="/dashboard"
                            className="ml-3 px-5 py-2 rounded-full text-sm font-semibold gradient-bg text-white hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-300"
                        >
                            Launch App
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden text-white/60 hover:text-white transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card mt-2 p-4 md:hidden max-w-7xl mx-auto"
                    >
                        {links.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                                {label}
                            </Link>
                        ))}
                        <Link
                            to="/dashboard"
                            onClick={() => setMobileOpen(false)}
                            className="block mt-2 text-center px-5 py-3 rounded-full text-sm font-semibold gradient-bg text-white"
                        >
                            Launch App
                        </Link>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
}
