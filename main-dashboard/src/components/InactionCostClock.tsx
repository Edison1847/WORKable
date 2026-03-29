import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

const InactionCostClock: React.FC = () => {
  const [cost, setCost] = useState(106450);
  const prevRef = useRef(106450);

  useEffect(() => {
    const id = setInterval(() => {
      const delta = Math.floor(Math.random() * 7 + 3);
      prevRef.current = cost;
      setCost(c => c + delta);
    }, 1600);
    return () => clearInterval(id);
  }, [cost]);

  const formatted = cost.toLocaleString('en-US');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(244,63,94,0.22)',
        boxShadow: '0 4px 32px rgba(244,63,94,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Pulsing red backdrop */}
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.03, 0.07, 0.03] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #f43f5e 0%, transparent 65%)' }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-6 right-6 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.6), transparent)' }} />

      <div className="relative z-10 p-5 text-center">
        {/* Label */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock size={12} style={{ color: '#f43f5e' }} className="animate-pulse" />
          <span className="eyebrow" style={{ color: 'var(--text-secondary)' }}>Inaction Cost Clock</span>
        </div>
        <p className="text-[10px] mb-5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Compounding loss from 4 un-actioned critical leaks
        </p>

        {/* Counter */}
        <div className="flex items-start justify-center gap-0.5 mb-4">
          <span className="text-xl font-semibold mt-2" style={{ color: 'rgba(244,63,94,0.7)', fontFamily: 'var(--font-mono)' }}>$</span>
          <motion.span
            key={cost}
            initial={{ y: -6, opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '2.75rem',
              fontWeight: 400,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: '#f43f5e',
              textShadow: '0 0 24px rgba(244,63,94,0.45), 0 0 48px rgba(244,63,94,0.15)',
            }}
          >
            {formatted}
          </motion.span>
        </div>

        {/* Status row */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl inline-flex mx-auto"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.18)' }}>
          <AlertTriangle size={10} style={{ color: '#f43f5e' }} />
          <span className="eyebrow" style={{ color: '#f43f5e' }}>
            Urgency: Critical · Status: Active
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default InactionCostClock;
