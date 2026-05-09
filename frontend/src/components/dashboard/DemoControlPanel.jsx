import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, TrendingDown } from 'lucide-react';
import { simulateMarketEvent, fetchAllSignals } from '../../services/api';

export default function DemoControlPanel() {
    const [productId, setProductId] = useState(null);
    const [simulating, setSimulating] = useState(false);

    useEffect(() => {
        // Fetch first available product to use for simulation
        fetchAllSignals().then(res => {
            if (res?.signals?.[0]) {
                setProductId(res.signals[0].product_id);
            }
        }).catch(() => {});
    }, []);

    const handleEvent = async (type) => {
        if (!productId) return;
        setSimulating(true);
        try {
            await simulateMarketEvent(productId, type);
            // Quick reload to show incoming data via standard component polling, 
            // but we can manually trigger a window reload or let standard intervals catch it.
        } catch (e) {
            console.error(e);
        }
        setSimulating(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="cosmic-card p-4 mt-4"
        >
            <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-supernova-red" />
                <span className="mono-label text-supernova-red text-[0.65rem]">HR DEMO CONTROLS</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleEvent('surge')}
                    disabled={simulating || !productId}
                    className="flex items-center justify-center gap-2 p-2 rounded bg-hyper-cyan/10 border border-hyper-cyan/30 text-hyper-cyan hover:bg-hyper-cyan/20 transition-colors font-mono text-[0.6rem]"
                >
                    <Zap className="w-3 h-3" />
                    TRIGGER DEMAND SURGE
                </button>
                <button
                    onClick={() => handleEvent('competitor_undercut')}
                    disabled={simulating || !productId}
                    className="flex items-center justify-center gap-2 p-2 rounded bg-supernova-red/10 border border-supernova-red/30 text-supernova-red hover:bg-supernova-red/20 transition-colors font-mono text-[0.6rem]"
                >
                    <TrendingDown className="w-3 h-3" />
                    COMPETITOR PRICE DROP
                </button>
            </div>
            <div className="mt-2 text-[0.55rem] text-starlight-faint font-mono text-center">
                Clicking these will inject synthetic events into the live pipeline.
            </div>
        </motion.div>
    );
}
