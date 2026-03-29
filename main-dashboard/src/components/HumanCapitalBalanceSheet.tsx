import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';

interface LineItem {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
  blank?: boolean;
}

const ASSETS: LineItem[] = [
  { label: 'Engaged Workforce Value',    value: '$8.4M' },
  { label: 'High-HSI Talent Capital',    value: '$4.2M' },
  { label: 'Innovation Capacity Reserve',value: '$2.8M' },
  { label: 'Succession Pipeline Depth',  value: '$1.6M' },
  { label: 'Capability & Knowledge Base',value: '$1.2M' },
  { blank: true, label: '', value: '' },
  { label: 'TOTAL HC ASSETS',           value: '$18.2M', bold: true, color: '#34d399' },
];

const LIABILITIES: LineItem[] = [
  { label: 'Burnout Risk Cost',                value: '$2.1M' },
  { label: 'Wasted Salary (Low-ROI Activity)', value: '$1.8M' },
  { label: 'Attrition Pipeline Cost',          value: '$1.4M' },
  { label: 'Process Friction Tax',             value: '$0.9M' },
  { label: 'Compliance & Legal Exposure',      value: '$0.4M' },
  { blank: true, label: '', value: '' },
  { label: 'TOTAL HC LIABILITIES',             value: '$6.6M', bold: true, color: '#f43f5e' },
];

/* Dots leader */
const Leaders: React.FC<{ label: string; value: string; bold?: boolean; color?: string }> = ({
  label,
  value,
  bold,
  color,
}) => (
  <div
    className="flex items-baseline justify-between gap-1"
    style={{ paddingTop: bold ? 4 : 0 }}
  >
    <span
      style={{
        fontFamily: bold ? 'var(--font-display)' : 'var(--font-body)',
        fontSize: bold ? 11 : 10,
        fontWeight: bold ? 700 : 400,
        color: bold ? (color ?? 'white') : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: bold ? 12 : 10.5,
        fontWeight: bold ? 700 : 400,
        color: bold ? (color ?? 'white') : 'var(--text-secondary)',
        letterSpacing: '0.01em',
        flexShrink: 0,
      }}
    >
      {value}
    </span>
  </div>
);

/* Animated counter for NET POSITION */
const useCounter = (target: number, duration = 1.4, delay = 0.8) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = Date.now() + delay * 1000;
    const end   = start + duration * 1000;
    const tick  = () => {
      const now = Date.now();
      if (now < start) { requestAnimationFrame(tick); return; }
      const progress = Math.min((now - start) / (end - start), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(1)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, delay]);
  return value;
};

const HumanCapitalBalanceSheet: React.FC = () => {
  const netValue = useCounter(11.6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-1)',
        borderLeft: '2px solid #34d399',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--border-1)' }}
      >
        <div className="flex items-center gap-2">
          <Scale size={14} style={{ color: '#34d399' }} />
          <span
            className="text-sm font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Human Capital Balance Sheet
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="px-2.5 py-1 rounded-lg"
            style={{
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.3)',
            }}
          >
            <span
              className="text-[9px] font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}
            >
              Q1 2026
            </span>
          </div>
          <span
            className="text-[9px]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
          >
            ISO 30414:2023 compliant format
          </span>
        </div>
      </div>

      {/* Body: two columns */}
      <div
        className="grid grid-cols-2 divide-x"
        style={{ borderColor: 'var(--border-1)' }}
      >
        {/* ASSETS column */}
        <div className="px-6 py-5">
          <p
            className="text-[10px] font-bold tracking-widest mb-4"
            style={{ fontFamily: 'var(--font-display)', color: '#34d399' }}
          >
            HUMAN CAPITAL ASSETS
          </p>
          <div className="space-y-2">
            {ASSETS.map((item, i) =>
              item.blank ? (
                <div key={`blank-a-${i}`} style={{ height: 8 }} />
              ) : (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.07, duration: 0.35 }}
                  style={{
                    borderTop: item.bold ? '1px solid rgba(52,211,153,0.2)' : undefined,
                    paddingTop: item.bold ? 8 : 0,
                  }}
                >
                  <Leaders
                    label={item.label}
                    value={item.value}
                    bold={item.bold}
                    color={item.color}
                  />
                </motion.div>
              )
            )}
          </div>
        </div>

        {/* LIABILITIES column */}
        <div className="px-6 py-5">
          <p
            className="text-[10px] font-bold tracking-widest mb-4"
            style={{ fontFamily: 'var(--font-display)', color: '#f43f5e' }}
          >
            HUMAN CAPITAL LIABILITIES
          </p>
          <div className="space-y-2">
            {LIABILITIES.map((item, i) =>
              item.blank ? (
                <div key={`blank-l-${i}`} style={{ height: 8 }} />
              ) : (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.07, duration: 0.35 }}
                  style={{
                    borderTop: item.bold ? '1px solid rgba(244,63,94,0.2)' : undefined,
                    paddingTop: item.bold ? 8 : 0,
                  }}
                >
                  <Leaders
                    label={item.label}
                    value={item.value}
                    bold={item.bold}
                    color={item.color}
                  />
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>

      {/* NET POSITION footer */}
      <div
        className="px-6 py-5"
        style={{
          borderTop: '1px solid var(--border-1)',
          background: 'rgba(52,211,153,0.04)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[10px] font-bold tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
            >
              NET HUMAN CAPITAL POSITION
            </p>
            <motion.p
              className="text-[32px] font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: '#34d399', lineHeight: 1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              +${netValue.toFixed(1)}M
            </motion.p>
          </div>
          <div className="text-right">
            <p
              className="text-[9px] mb-1"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
            >
              vs last quarter
            </p>
            <div className="flex items-center gap-1 justify-end">
              <span style={{ color: '#34d399', fontSize: 12 }}>↑</span>
              <span
                className="text-[13px] font-bold"
                style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}
              >
                +$1.2M
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HumanCapitalBalanceSheet;
