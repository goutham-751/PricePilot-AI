import { useState } from 'react';
import { motion } from 'framer-motion';
import HUDHeader from '../components/dashboard/HUDHeader';
import HUDSidebar from '../components/dashboard/HUDSidebar';
import MarketSignalsFeed from '../components/dashboard/MarketSignalsFeed';
import TimeWarpChart from '../components/dashboard/TimeWarpChart';
import AIActionPanel from '../components/dashboard/AIActionPanel';

import CompetitorIntelPage from './CompetitorIntelPage';
import ForecastingPage from './ForecastingPage';
import PricingEnginePage from './PricingEnginePage';
import AnalyticsPage from './AnalyticsPage';
import DecisionEnginePage from './DecisionEnginePage';
import DataPipelinePage from './DataPipelinePage';
import SystemStatusPage from './SystemStatusPage';

function CommandCenter({ xrayMode }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-120px)]">
            <div className="lg:col-span-3 min-h-[400px] lg:min-h-0">
                <MarketSignalsFeed xrayMode={xrayMode} />
            </div>
            <div className="lg:col-span-6 min-h-[400px] lg:min-h-0">
                <TimeWarpChart xrayMode={xrayMode} />
            </div>
            <div className="lg:col-span-3 min-h-[400px] lg:min-h-0">
                <AIActionPanel xrayMode={xrayMode} />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [xrayMode, setXrayMode] = useState(false);
    const [activePage, setActivePage] = useState('command');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const renderPage = () => {
        switch (activePage) {
            case 'command': return <CommandCenter xrayMode={xrayMode} />;
            case 'competitors': return <CompetitorIntelPage />;
            case 'forecasting': return <ForecastingPage />;
            case 'pricing': return <PricingEnginePage />;
            case 'analytics': return <AnalyticsPage />;
            case 'decision': return <DecisionEnginePage />;
            case 'pipeline': return <DataPipelinePage />;
            case 'system': return <SystemStatusPage />;
            default: return <CommandCenter xrayMode={xrayMode} />;
        }
    };

    return (
        <div className="min-h-screen bg-void relative">
            {/* Scan line */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-50 opacity-[0.03]">
                <div className="w-full h-[2px] bg-hyper-cyan animate-scanline" />
            </div>

            {/* Sidebar */}
            <HUDSidebar
                activePage={activePage}
                onNavigate={setActivePage}
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className={`relative z-10 transition-all duration-300 ${sidebarCollapsed ? 'ml-[60px]' : 'ml-[200px]'}`}
            >
                <div className="p-4 lg:p-6 max-w-[1600px]">
                    {/* HUD Header */}
                    <HUDHeader xrayMode={xrayMode} onToggleXray={() => setXrayMode(!xrayMode)} />

                    {/* Active Page */}
                    <div className="mt-4">
                        {renderPage()}
                    </div>

                    {/* Bottom status bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="mt-4 flex items-center justify-between px-4 py-2 rounded-lg bg-obsidian/50 border border-glass-border"
                    >
                        <div className="flex items-center gap-4">
                            <span className="mono-label text-[0.55rem] text-starlight-faint">
                                UPLINK: <span className="text-stellar-green">ACTIVE</span>
                            </span>
                            <span className="mono-label text-[0.55rem] text-starlight-faint">
                                LATENCY: <span className="text-hyper-cyan">12ms</span>
                            </span>
                            <span className="mono-label text-[0.55rem] text-starlight-faint">
                                DATA NODES: <span className="text-hyper-cyan">47/47</span>
                            </span>
                        </div>
                        <span className="mono-label text-[0.55rem] text-starlight-faint">
                            PRICEPILOT AI © 2026
                        </span>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
