import { motion } from 'framer-motion';
import {
    LayoutDashboard, Radar, TrendingUp, DollarSign,
    BarChart3, Brain, GitBranch, Server, ChevronLeft, ChevronRight
} from 'lucide-react';

const navItems = [
    { id: 'command', label: 'Command Center', icon: LayoutDashboard },
    { id: 'competitors', label: 'Competitor Intel', icon: Radar },
    { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
    { id: 'pricing', label: 'Pricing Engine', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'decision', label: 'Decision Engine', icon: Brain },
    { id: 'pipeline', label: 'Data Pipeline', icon: GitBranch },
    { id: 'system', label: 'System Status', icon: Server },
];

export default function HUDSidebar({ activePage, onNavigate, collapsed, onToggle }) {
    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={`fixed left-0 top-0 h-screen z-40 bg-obsidian/90 backdrop-blur-xl border-r border-glass-border flex flex-col transition-all duration-300 ${collapsed ? 'w-[60px]' : 'w-[200px]'
                }`}
        >
            {/* Logo area */}
            <div className="px-3 py-4 border-b border-glass-border flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-hyper-cyan/10 border border-hyper-cyan/20 flex items-center justify-center shrink-0">
                    <span className="text-hyper-cyan font-bold text-sm">P</span>
                </div>
                {!collapsed && (
                    <span className="mono-label text-hyper-cyan text-[0.6rem] truncate">PRICEPILOT</span>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-200 cursor-pointer group ${isActive
                                ? 'bg-hyper-cyan/10 border border-hyper-cyan/20'
                                : 'border border-transparent hover:bg-white/[0.03] hover:border-glass-border'
                                }`}
                        >
                            <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-hyper-cyan' : 'text-starlight-faint group-hover:text-starlight-dim'
                                }`} />
                            {!collapsed && (
                                <span className={`mono-label text-[0.55rem] truncate ${isActive ? 'text-hyper-cyan' : 'text-starlight-faint group-hover:text-starlight-dim'
                                    }`}>
                                    {item.label.toUpperCase()}
                                </span>
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-indicator"
                                    className="absolute left-0 w-[2px] h-6 bg-hyper-cyan rounded-r"
                                    style={{ boxShadow: '0 0 8px rgba(0,240,255,0.5)' }}
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <div className="px-2 py-3 border-t border-glass-border">
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                    {collapsed
                        ? <ChevronRight className="w-4 h-4 text-starlight-faint" />
                        : <ChevronLeft className="w-4 h-4 text-starlight-faint" />
                    }
                </button>
            </div>
        </motion.aside>
    );
}
