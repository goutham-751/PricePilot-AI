import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/dashboard/Sidebar';
import ExecutiveOverview from '../components/dashboard/ExecutiveOverview';
import DemandForecast from '../components/dashboard/DemandForecast';
import CompetitorPricing from '../components/dashboard/CompetitorPricing';
import RecommendationEngine from '../components/dashboard/RecommendationEngine';
import ParticleField from '../components/ParticleField';

export default function DashboardPage() {
    const [activeSection, setActiveSection] = useState('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-space-900 relative">
            {/* Subtle particle background */}
            <ParticleField particleCount={30} />

            {/* Background ambient glows */}
            <div className="ambient-glow bg-accent-green/20 -top-40 right-1/4" />
            <div className="ambient-glow bg-accent-emerald/10 bottom-0 left-0" />

            {/* Sidebar */}
            <Sidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main content */}
            <main
                className={`transition-all duration-300 min-h-screen ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[240px]'
                    }`}
            >
                <div className="p-6 lg:p-8 max-w-[1400px]">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-display font-bold text-white">
                                    Mission Control
                                </h1>
                                <p className="text-sm text-white/30 mt-1">
                                    Pricing Intelligence Command Center — Real-time analytics & AI recommendations
                                </p>
                            </div>
                            <div className="hidden md:flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                    <span className="text-xs text-success font-medium">Live</span>
                                </div>
                                <div className="text-xs text-white/20">
                                    Last updated: {new Date().toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content sections */}
                    <div className="space-y-8">
                        {(activeSection === 'overview' || activeSection === 'all') && (
                            <>
                                <ExecutiveOverview />
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <DemandForecast />
                                    <CompetitorPricing />
                                </div>
                                <RecommendationEngine />
                            </>
                        )}

                        {activeSection === 'forecast' && <DemandForecast />}
                        {activeSection === 'competitors' && <CompetitorPricing />}
                        {activeSection === 'recommendations' && <RecommendationEngine />}
                    </div>
                </div>
            </main>
        </div>
    );
}
