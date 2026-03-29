import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle, X, Clock, ArrowRight, ChevronDown } from 'lucide-react';

type Status = 'pending' | 'accepted' | 'inprogress' | 'completed' | 'dismissed';

interface Nudge {
  id: string;
  type: string;
  typeColor: string;
  dept: string;
  manager: string;
  title: string;
  signal: string;
  dailyCost: number;
  impactAnnual: number;
}

const TOP_NUDGES: Nudge[] = [
  {
    id: 's1', type: 'Redesign', typeColor: '#f43f5e',
    dept: 'Engineering', manager: 'Sarah Chen',
    title: 'Sprint planning process consuming 38% capacity',
    signal: 'Time ↑ + Friction ↑ → Broken Process',
    dailyCost: 389, impactAnnual: 142000,
  },
  {
    id: 's2', type: 'Reallocate', typeColor: '#f43f5e',
    dept: 'Engineering', manager: 'Sarah Chen',
    title: 'Senior Data Engineers underresourced on critical path',
    signal: 'Value ↑ + Time ↓ → Under-resourced Critical Work',
    dailyCost: 509, impactAnnual: 186000,
  },
  {
    id: 's3', type: 'Support', typeColor: '#38bdf8',
    dept: 'Customer Success', manager: 'Amy Torres',
    title: 'CS team at 127% load — burnout risk 79%',
    signal: 'Support Void ↑ + Burnout ↑ → Intervention Required',
    dailyCost: 88, impactAnnual: 32000,
  },
];

const STATUS_CFG: Record<Status, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',     color: '#94a3b8', bg: 'rgba(148,163,184,0.10)' },
  accepted:   { label: 'Accepted',    color: '#fb923c', bg: 'rgba(251,146,60,0.12)'  },
  inprogress: { label: 'In Progress', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
  completed:  { label: 'Completed',   color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  dismissed:  { label: 'Dismissed',   color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
};

const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

const ActiveNudgesSummary: React.FC = () => {
  const [statuses, setStatuses] = useState<Record<string, Status>>({
    s1: 'pending', s2: 'inprogress', s3: 'accepted',
  });
  const [expanded, setExpanded] = useState<string | null>(null);

  const act = (id: string, s: Status) => {
    setStatuses(p => ({ ...p, [id]: s }));
    setExpanded(null);
  };

  const pendingCount = Object.values(statuses).filter(s => s === 'pending').length;
  const totalDailyCost = TOP_NUDGES
    .filter(n => statuses[n.id] === 'pending')
    .reduce((sum, n) => sum + n.dailyCost, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.16 }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-2)',
        borderLeft: '3px solid #f43f5e',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* ── Card header ── */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-2">
          <Zap size={13} style={{ color: '#f43f5e' }} />
          <span className="text-sm font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}>
            Active Nudges
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ fontFamily: 'var(--font-mono)', background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.25)' }}>
            {pendingCount} pending
          </span>
        </div>
        {totalDailyCost > 0 && (
          <div className="flex items-center gap-1.5">
            <Clock size={9} style={{ color: '#f43f5e' }} />
            <span className="text-[10px] font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: '#f43f5e' }}>
              ${totalDailyCost}/day inaction
            </span>
          </div>
        )}
      </div>

      {/* ── Nudge list ── */}
      <div className="px-5 py-5 flex flex-col gap-3 flex-1">
        {TOP_NUDGES.map((nudge, i) => {
          const status = statuses[nudge.id];
          const sCfg   = STATUS_CFG[status];
          const isOpen = expanded === nudge.id;
          const done   = status === 'completed' || status === 'dismissed';

          return (
            <div key={nudge.id}
              className="rounded-xl overflow-hidden"
              style={{
                background: 'var(--bg-elevated)',
                border: `1px solid ${isOpen ? nudge.typeColor + '44' : 'var(--border-1)'}`,
                opacity: done ? 0.55 : 1,
                transition: 'border-color 0.2s, opacity 0.2s',
              }}>

              {/* Row */}
              <button
                onClick={() => !done && setExpanded(isOpen ? null : nudge.id)}
                disabled={done}
                className="w-full flex items-start gap-3 px-3.5 py-3 text-left"
                style={{ cursor: done ? 'default' : 'pointer' }}>

                {/* Type badge */}
                <span className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-md mt-0.5"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: nudge.typeColor,
                    background: `${nudge.typeColor}15`,
                    border: `1px solid ${nudge.typeColor}30`,
                    whiteSpace: 'nowrap',
                  }}>
                  {nudge.type}
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold leading-snug"
                    style={{ fontFamily: 'var(--font-display)', color: done ? 'var(--text-muted)' : 'white' }}>
                    {nudge.title}
                  </p>
                  <p className="text-[10px] mt-0.5"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {nudge.manager} · {nudge.dept}
                  </p>
                </div>

                {/* Right side */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ fontFamily: 'var(--font-mono)', color: sCfg.color, background: sCfg.bg }}>
                    {sCfg.label}
                  </span>
                  {status === 'pending' && (
                    <span className="text-[9px]"
                      style={{ fontFamily: 'var(--font-mono)', color: '#f43f5e' }}>
                      ${nudge.dailyCost}/day
                    </span>
                  )}
                </div>

                {!done && (
                  <ChevronDown size={11} style={{
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                    marginTop: 2,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }} />
                )}
              </button>

              {/* Expanded detail */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}>
                    <div className="px-3.5 pb-3.5"
                      style={{ borderTop: '1px solid var(--border-1)' }}>

                      {/* Signal */}
                      <div className="flex items-center gap-1.5 pt-3 pb-3">
                        <ArrowRight size={9} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span className="text-[10px]"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {nudge.signal}
                        </span>
                      </div>

                      {/* Impact */}
                      <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.16)' }}>
                        <span className="text-[10px] font-semibold"
                          style={{ fontFamily: 'var(--font-display)', color: '#34d399' }}>
                          {fmt(nudge.impactAnnual)}/yr recoverable
                        </span>
                        <span className="text-[9px]"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          ${nudge.dailyCost} inaction/day
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {status === 'pending' && (
                          <button onClick={() => act(nudge.id, 'accepted')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-[10px] font-bold"
                            style={{ fontFamily: 'var(--font-display)', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)', color: '#34d399' }}>
                            <CheckCircle size={10} /> Accept
                          </button>
                        )}
                        {status === 'accepted' && (
                          <button onClick={() => act(nudge.id, 'inprogress')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-[10px] font-bold"
                            style={{ fontFamily: 'var(--font-display)', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.28)', color: '#38bdf8' }}>
                            <CheckCircle size={10} /> Mark In Progress
                          </button>
                        )}
                        {status === 'inprogress' && (
                          <button onClick={() => act(nudge.id, 'completed')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-[10px] font-bold"
                            style={{ fontFamily: 'var(--font-display)', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)', color: '#34d399' }}>
                            <CheckCircle size={10} /> Complete
                          </button>
                        )}
                        <button onClick={() => act(nudge.id, 'dismissed')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-[10px] font-bold"
                          style={{ fontFamily: 'var(--font-display)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', color: 'var(--text-muted)' }}>
                          <X size={10} /> Dismiss
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Footer link to full ACC ── */}
      <div className="px-5 py-3"
        style={{ borderTop: '1px solid var(--border-1)' }}>
        <div className="flex items-center justify-between">
          <span className="eyebrow">47 total recommendations</span>
          <span className="text-[10px] font-semibold flex items-center gap-1"
            style={{ fontFamily: 'var(--font-display)', color: '#38bdf8' }}>
            View full Action Centre below
            <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ActiveNudgesSummary;
