import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    BarChart3,
    Target,
    Zap,
    ArrowRight,
    Globe,
    Shield,
    LineChart,
    Sparkles,
} from 'lucide-react';
import GlowButton from '../components/GlowButton';
import GlassCard from '../components/GlassCard';
import OrbitRing from '../components/OrbitRing';
import ParticleField from '../components/ParticleField';

/* ── Fade-in section wrapper ──────────────────────── */
function RevealSection({ children, className = '' }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.section>
    );
}

/* ── Stat pill ────────────────────────────────────── */
function StatPill({ value, label }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-display font-bold gradient-text">{value}</span>
            <span className="text-xs md:text-sm text-white/40 mt-1">{label}</span>
        </div>
    );
}

/* ── Feature card for scroll sections ─────────────── */
function FeatureCard({ icon: Icon, title, description, color = 'green' }) {
    const colorMap = {
        green: 'from-accent-green/20 to-transparent border-accent-green/20 text-accent-green',
        lime: 'from-accent-lime/20 to-transparent border-accent-lime/20 text-accent-lime',
        emerald: 'from-accent-emerald/20 to-transparent border-accent-emerald/20 text-accent-emerald',
        teal: 'from-accent-teal/20 to-transparent border-accent-teal/20 text-accent-teal',
    };

    return (
        <GlassCard className="group relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color].split(' ').slice(0, 2).join(' ')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color].split(' ').slice(0, 2).join(' ')} border ${colorMap[color].split(' ')[2]} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${colorMap[color].split(' ').slice(-1)[0]}`} />
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{description}</p>
            </div>
        </GlassCard>
    );
}

/* ═══════════════════════════════════════════════════ */
/*  LANDING PAGE                                      */
/* ═══════════════════════════════════════════════════ */
export default function LandingPage() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
        <div className="relative">
            {/* ── HERO ───────────────────────────────────── */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Ambient blobs */}
                <div className="ambient-glow bg-accent-green/60 -top-40 -left-40" />
                <div className="ambient-glow bg-accent-emerald/40 -bottom-20 -right-40" />
                <div className="ambient-glow bg-accent-lime/20 top-1/3 right-1/4" />

                {/* Particle background */}
                <ParticleField particleCount={60} />

                {/* Grid overlay */}
                <div className="absolute inset-0 grid-overlay" />

                {/* Orbit rings (decorative) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                    <OrbitRing size={600} duration={30} dotCount={4} />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                    <OrbitRing size={900} duration={45} dotCount={3} color="rgba(52,211,153,0.2)" dotColor="rgba(52,211,153,0.6)" />
                </div>

                {/* Content */}
                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="relative z-10 text-center px-4 max-w-5xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-8"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-neon-green" />
                        <span className="text-xs tracking-wider text-white/50 uppercase">AI-Powered Pricing Intelligence</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.05] tracking-tight mb-6"
                    >
                        Navigate Pricing{' '}
                        <br />
                        <span className="gradient-text">with Intelligence</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Real-time demand forecasting, competitor analysis, and AI-driven pricing recommendations — all in one command center.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/dashboard">
                            <GlowButton>
                                <span className="flex items-center gap-2">
                                    Launch Dashboard <ArrowRight className="w-4 h-4" />
                                </span>
                            </GlowButton>
                        </Link>
                        <GlowButton variant="secondary">Explore Features</GlowButton>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.2 }}
                        className="mt-16 flex items-center justify-center gap-8 md:gap-16"
                    >
                        <StatPill value="98%" label="Forecast Accuracy" />
                        <div className="w-px h-10 bg-white/10" />
                        <StatPill value="3.2x" label="Revenue Uplift" />
                        <div className="w-px h-10 bg-white/10 hidden sm:block" />
                        <div className="hidden sm:block">
                            <StatPill value="500+" label="Markets Tracked" />
                        </div>
                    </motion.div>
                </motion.div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-space-900 to-transparent" />
            </section>

            {/* ── SECTION 1: Market Intelligence ──────── */}
            <RevealSection className="relative py-32 px-4 overflow-hidden">
                <div className="ambient-glow bg-accent-green/30 top-0 right-0" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs tracking-widest text-neon-green/60 uppercase">Real-Time Awareness</span>
                        <h2 className="text-4xl md:text-6xl font-display font-bold mt-4 mb-6">
                            360° Market <span className="gradient-text">Intelligence</span>
                        </h2>
                        <p className="text-white/40 max-w-xl mx-auto">
                            Monitor every signal — search trends, competitor moves, seasonal shifts — unified in a single orbital view.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={Globe}
                            title="Global Market Scan"
                            description="Track pricing data across 500+ markets in real time with automated scraping and trend analysis."
                            color="lime"
                        />
                        <FeatureCard
                            icon={TrendingUp}
                            title="Trend Detection"
                            description="AI-powered pattern recognition identifies emerging trends before they hit mainstream awareness."
                            color="green"
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Risk Alerts"
                            description="Instant notifications when competitors shift strategy or market conditions change unexpectedly."
                            color="emerald"
                        />
                    </div>
                </div>
            </RevealSection>

            {/* ── SECTION 2: Demand Forecasting ──────── */}
            <RevealSection className="relative py-32 px-4 overflow-hidden">
                <div className="ambient-glow bg-accent-emerald/30 -bottom-20 -left-20" />
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Visual */}
                        <div className="relative flex items-center justify-center">
                            <OrbitRing size={350} duration={25} dotCount={5} color="rgba(74,222,128,0.3)" dotColor="rgba(74,222,128,0.8)" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-5xl font-display font-bold gradient-text">94%</div>
                                    <div className="text-sm text-white/40 mt-2">Prediction accuracy</div>
                                </div>
                            </div>
                        </div>

                        {/* Text */}
                        <div>
                            <span className="text-xs tracking-widest text-accent-emerald/60 uppercase">Predictive Engine</span>
                            <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 mb-6">
                                Demand <span className="gradient-text">Forecasting</span>
                            </h2>
                            <p className="text-white/40 leading-relaxed mb-8">
                                Our AI models analyse historical patterns, seasonal cycles, and external signals to predict demand with orbital precision — weeks before shifts happen.
                            </p>
                            <div className="space-y-4">
                                {['Seasonal cycle detection', 'Spike prediction engine', 'External signal integration'].map((item, i) => (
                                    <motion.div
                                        key={item}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.15 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-accent-emerald" />
                                        <span className="text-white/60">{item}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </RevealSection>

            {/* ── SECTION 3: Competitor Pricing ──────── */}
            <RevealSection className="relative py-32 px-4 overflow-hidden">
                <div className="ambient-glow bg-neon-green/20 top-1/4 right-0" />
                <div className="max-w-6xl mx-auto text-center">
                    <span className="text-xs tracking-widest text-neon-green/60 uppercase">Competitive Edge</span>
                    <h2 className="text-4xl md:text-6xl font-display font-bold mt-4 mb-6">
                        Competitor <span className="gradient-text-lime">Pricing Map</span>
                    </h2>
                    <p className="text-white/40 max-w-xl mx-auto mb-16">
                        Visualise where you stand in the market constellation. Track competitor price movements and find your optimal positioning.
                    </p>

                    {/* Competitor comparison cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {[
                            { name: 'You', price: '$49.99', delta: '—', highlight: true },
                            { name: 'Competitor A', price: '$54.99', delta: '+10%', color: 'text-warning' },
                            { name: 'Competitor B', price: '$44.99', delta: '-10%', color: 'text-success' },
                            { name: 'Competitor C', price: '$52.49', delta: '+5%', color: 'text-warning' },
                        ].map((item, i) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <GlassCard
                                    glow={item.highlight}
                                    className={`text-center ${item.highlight ? 'border-accent-green/30' : ''}`}
                                >
                                    <div className="text-sm text-white/40 mb-2">{item.name}</div>
                                    <div className="text-2xl font-display font-bold text-white mb-1">{item.price}</div>
                                    <div className={`text-sm font-medium ${item.color || 'text-white/30'}`}>{item.delta}</div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </RevealSection>

            {/* ── SECTION 4: Executive Insights ──────── */}
            <RevealSection className="relative py-32 px-4 overflow-hidden">
                <div className="ambient-glow bg-accent-green/25 bottom-0 left-1/4" />
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-xs tracking-widest text-success/60 uppercase">Decision Engine</span>
                            <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 mb-6">
                                Executive <span className="gradient-text">Insights</span>
                            </h2>
                            <p className="text-white/40 leading-relaxed mb-8">
                                Transform vast data into crystal-clear action items. Every recommendation comes with expected revenue impact, confidence scoring, and time-sensitive urgency.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { q: 'What is happening?', a: 'Market intelligence dashboard' },
                                    { q: 'Why is it happening?', a: 'Trend analysis & causal AI' },
                                    { q: 'What should we do?', a: 'AI recommendation engine' },
                                    { q: 'What revenue impact?', a: 'Impact simulation models' },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.q}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.12 }}
                                        className="glass-card p-4 flex items-start gap-4"
                                    >
                                        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shrink-0 mt-0.5">
                                            <Zap className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-white">{item.q}</div>
                                            <div className="text-xs text-white/40 mt-0.5">{item.a}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Visual - mini dashboard preview */}
                        <div className="relative">
                            <GlassCard glow className="p-8">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-white/40">Revenue Opportunity</span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success border border-success/20">
                                            ↑ High
                                        </span>
                                    </div>
                                    <div className="text-4xl font-display font-bold gradient-text">$2.4M</div>
                                    <div className="h-px bg-white/5" />
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-display font-bold text-neon-green">87</div>
                                            <div className="text-xs text-white/30">Confidence</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-display font-bold text-accent-emerald">+12%</div>
                                            <div className="text-xs text-white/30">Projected Gain</div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                            {/* Decorative orbit */}
                            <div className="absolute -top-10 -right-10 opacity-20">
                                <OrbitRing size={200} duration={15} dotCount={2} />
                            </div>
                        </div>
                    </div>
                </div>
            </RevealSection>

            {/* ── SECTION 5: CTA ─────────────────────── */}
            <RevealSection className="relative py-32 px-4 overflow-hidden">
                <div className="ambient-glow bg-accent-green/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="ambient-glow bg-accent-lime/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4" />
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
                        Ready to <span className="gradient-text">Launch</span>?
                    </h2>
                    <p className="text-lg text-white/40 mb-10 max-w-lg mx-auto">
                        Join forward-thinking teams that trust PricePilot AI to navigate complex pricing decisions with confidence.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/dashboard">
                            <GlowButton>
                                <span className="flex items-center gap-2">
                                    Open Dashboard <ArrowRight className="w-4 h-4" />
                                </span>
                            </GlowButton>
                        </Link>
                        <GlowButton variant="secondary">Request Demo</GlowButton>
                    </div>
                </div>
            </RevealSection>

            {/* ── Footer ─────────────────────────────── */}
            <footer className="border-t border-white/5 py-12 px-4">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm text-white/20">© 2026 PricePilot AI. All rights reserved.</span>
                    <div className="flex items-center gap-6 text-sm text-white/20">
                        <a href="#" className="hover:text-white/40 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white/40 transition-colors">Terms</a>
                        <a href="#" className="hover:text-white/40 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
