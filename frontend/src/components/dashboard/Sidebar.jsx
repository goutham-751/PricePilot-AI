import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    TrendingUp,
    BarChart3,
    Lightbulb,
    Settings,
    ChevronLeft,
    Rocket,
} from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', section: 'overview' },
    { icon: TrendingUp, label: 'Demand Forecast', section: 'forecast' },
    { icon: BarChart3, label: 'Competitors', section: 'competitors' },
    { icon: Lightbulb, label: 'Recommendations', section: 'recommendations' },
];

export default function Sidebar({ activeSection, onSectionChange, collapsed, onToggle }) {
    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
        bg-space-800/80 backdrop-blur-xl border-r border-white/5`}
        >
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                    <Rocket className="w-4 h-4 text-white" />
                </div>
                {!collapsed && (
                    <span className="font-display font-bold text-sm text-white whitespace-nowrap">
                        PricePilot<span className="text-neon-green">.AI</span>
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1">
                {navItems.map(({ icon: Icon, label, section }) => {
                    const isActive = activeSection === section;
                    return (
                        <button
                            key={section}
                            onClick={() => onSectionChange(section)}
                            title={collapsed ? label : ''}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                ${isActive
                                    ? 'bg-accent-green/10 text-white border border-accent-green/20 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                                }
                ${collapsed ? 'justify-center' : ''}`}
                        >
                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent-green' : ''}`} />
                            {!collapsed && <span>{label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="px-2 py-4 border-t border-white/5 space-y-1">
                <Link
                    to="/"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all"
                >
                    <ChevronLeft className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>Back to Home</span>}
                </Link>
                <button
                    onClick={onToggle}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all cursor-pointer
            ${collapsed ? 'justify-center' : ''}`}
                >
                    <Settings className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </motion.aside>
    );
}
