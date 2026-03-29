import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useIntakeData from '../hooks/useIntakeData';

const StrategicInsightsTicker: React.FC = () => {
  const { data } = useIntakeData();
  const [marketSignals, setMarketSignals] = useState<any[]>([]);

  useEffect(() => {
    const fetchMarket = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/market-signals`);
            if (res.ok) setMarketSignals(await res.json());
        } catch (e) {
            console.error(e);
        }
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);
  
  const liveInsights = useMemo(() => {
    const internal: { text: string; tint: string }[] = [];
    
    if (!data || !data.all_diagnostics) {
        internal.push({ text: "Initializing Strategic Intelligence Layer...", tint: "" });
    } else {
        const workerDiags = data.all_diagnostics.filter((d: any) => d.type === 'worker');
        const supervisorData = data.supervisor || {};
        
        const calculateAvg = (key: string, path: string = '') => {
            if (workerDiags.length === 0) return 0;
            const sum = workerDiags.reduce((acc: number, r: any) => {
                const parent = path ? r[path] : r;
                const val = parent?.[key] || 0;
                return acc + val;
            }, 0);
            return sum / workerDiags.length;
        };

        // 1. Value Leak Insight
        const leakValue = Math.round(calculateAvg('leakagePct', 'p1'));
        if (leakValue > 15) {
            internal.push({ text: `VALUE LEAK ALERT: ${leakValue}% of payroll currently spent on low-criticality tasks.`, tint: '#fb923c' });
        }

        // 2. Blindspot Insight
        const workerHealth = calculateAvg('orgHealth', 'p1');
        const supHealth = supervisorData.p1?.orgHealth || 5;
        const blindspot = (Math.abs(workerHealth - supHealth) / 10 * 100).toFixed(1);
        if (parseFloat(blindspot) > 20) {
            internal.push({ text: `EXECUTIVE BLINDSPOT: ${blindspot}% delta between leadership perception and frontline reality.`, tint: '#fb923c' });
        }

        // 3. Voice Suppression
        const voiceSup = Math.round(calculateAvg('ps1_voiceSuppression', 'p1'));
        if (voiceSup > 4) {
            internal.push({ text: `CULTURAL RISK: Significant voice suppression detected (${voiceSup}/10). Information bottleneck in culture.`, tint: '#fb923c' });
        }

        // 4. Recovery Capacity
        const recovery = Math.round((calculateAvg('enthusiasm', 'p4') / 21) * 100);
        if (recovery < 50) {
            internal.push({ text: `RECOVERY FAILURE: Organizational battery at ${recovery}%. High attrition risk cluster active.`, tint: '#f43f5e' });
        }

        internal.push({ text: `${workerDiags.length} diagnostic profiles analyzed. Strategic precision at ${Math.round(100 - parseFloat(blindspot))}%`, tint: '' });
    }

    // Interleave with Market Signals
    const combined: { text: string; tint: string }[] = [];
    const maxLen = Math.max(internal.length, marketSignals.length);
    
    for (let i = 0; i < maxLen; i++) {
        if (i < internal.length) combined.push(internal[i]);
        if (i < marketSignals.length) {
            const s = marketSignals[i];
            combined.push({ text: `[EXTERNAL MARKET SIG - ${s.source}] ${s.text}`, tint: '#38bdf8' });
        }
    }

    return combined;
  }, [data, marketSignals]);

  return (
    <div 
      className="w-full overflow-hidden flex items-center border-b"
      style={{ 
        height: '24px', 
        background: 'rgba(3,5,10,0.95)', 
        borderColor: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <div 
        className="px-3 flex items-center shrink-0 border-r h-full relative z-10 gap-3"
        style={{ 
          background: 'rgba(0,0,0,1)', 
          borderColor: 'rgba(14,165,233,0.15)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <motion.div 
            animate={{ opacity: [1, 0.4, 1] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-[#0ea5e9]" 
          />
          <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9] whitespace-nowrap">
            Strategic Insights
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative flex items-center h-full">
        <motion.div 
          className="flex items-center gap-20 whitespace-nowrap px-10"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            ease: "linear", 
            duration: 100, 
            repeat: Infinity 
          }}
        >
          {[...liveInsights, ...liveInsights].map((insight, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-[8px] text-white/20">•</span>
              <span 
                className="text-[9px] font-medium tracking-[0.12em] uppercase" 
                style={{ 
                  fontFamily: 'var(--font-mono)', 
                  color: insight.tint || 'rgba(255,255,255,0.4)' 
                }}
              >
                {insight.text}
              </span>
            </div>
          ))}
        </motion.div>
        
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#03050a] to-transparent pointer-events-none z-20" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#03050a] to-transparent pointer-events-none z-20" />
      </div>
    </div>
  );
};

export default StrategicInsightsTicker;
