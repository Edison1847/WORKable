import React from 'react';
import { motion } from 'framer-motion';
import { Radio, ExternalLink, Zap } from 'lucide-react';

const items = [
  {
    source: 'Harvard Business Review',
    date: 'Mar 2026',
    headline: '"The Hidden Cost of Friction Tolerance in Finance Teams"',
    insight: 'Organisations that normalise high-friction environments lose 1.3× more talent within 12 months than those that intervene early. The cost is not the friction itself — it is the learned helplessness it produces.',
    relevance: 98,
    signal: 'High Friction · Q9',
    color: '#f43f5e',
  },
  {
    source: 'McKinsey Org Practice',
    date: 'Feb 2026',
    headline: '"Burnout at Scale: Why Middle Management is the Epicentre"',
    insight: 'Mid-management burnout precedes frontline burnout by 1–2 quarters in 83% of organisations studied. Addressing the middle layer first produces downstream recovery 40% faster than bottom-up interventions.',
    relevance: 91,
    signal: 'Burnout Risk · HC-WEL-001',
    color: '#fb923c',
  },
  {
    source: 'MIT Sloan Management Review',
    date: 'Mar 2026',
    headline: '"Perception Gaps: The Invisible Governance Risk"',
    insight: 'A perception gap above 30 points between leadership and team signals a breakdown in psychological safety. Boards treating this as a "culture issue" miss its direct connection to execution risk and earnings variance.',
    relevance: 87,
    signal: 'Perception Gap · Q7+Q8',
    color: '#a78bfa',
  },
  {
    source: 'Deloitte Human Capital Trends',
    date: 'Jan 2026',
    headline: '"Voice Suppression: The Unreported Metric That Predicts Attrition"',
    insight: 'Organisations tracking voice suppression as a leading indicator reduced unplanned attrition by 28% compared to those relying solely on engagement survey data. Suppression velocity matters more than the level.',
    relevance: 83,
    signal: 'Voice Suppression · Q11',
    color: '#38bdf8',
  },
];

const IndustryDiscourseLayer: React.FC = () => (
  <div className="rounded-2xl overflow-hidden"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #a78bfa', boxShadow: 'var(--shadow-md)' }}>

    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
      <div className="flex items-center gap-2">
        <Radio size={13} style={{ color: '#a78bfa' }} />
        <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Industry Discourse Layer</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#34d399' }} />
        <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Live · matched to your active signals</span>
      </div>
    </div>

    <div className="p-5">
      <p className="text-[10px] mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        What the <span className="font-semibold text-white">smartest minds in your sector</span> are currently saying about the exact signals firing in your organisation.
        Relevance score = semantic match to your active reveals.
      </p>

      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-xl p-4"
            style={{ background: `${item.color}06`, border: `1px solid ${item.color}18` }}>

            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold" style={{ color: item.color, fontFamily: 'var(--font-mono)' }}>{item.source}</span>
                  <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>{item.date}</span>
                </div>
                <p className="text-[11px] font-semibold text-white leading-snug" style={{ fontFamily: 'var(--font-display)' }}>{item.headline}</p>
              </div>
              <div className="shrink-0 text-center">
                <div className="w-9 h-9 rounded-xl flex flex-col items-center justify-center"
                  style={{ background: `${item.color}14`, border: `1px solid ${item.color}28` }}>
                  <span className="text-[11px] font-black" style={{ color: item.color, fontFamily: 'var(--font-display)' }}>{item.relevance}</span>
                  <span className="text-[7px]" style={{ color: item.color, fontFamily: 'var(--font-mono)' }}>rel.</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] leading-relaxed mb-2.5" style={{ color: 'var(--text-secondary)' }}>{item.insight}</p>

            <div className="flex items-center gap-2">
              <Zap size={9} style={{ color: item.color }} />
              <span className="text-[8px]" style={{ fontFamily: 'var(--font-mono)', color: item.color }}>Matched to: {item.signal}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default IndustryDiscourseLayer;
