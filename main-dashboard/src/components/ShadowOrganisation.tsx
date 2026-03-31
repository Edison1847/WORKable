import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Eye, AlertCircle } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  title: string;
  formal: boolean;
  influence: number;
  x: number;
  y: number;
  color: string;
  shadow?: boolean;
}

interface Edge {
  from: string;
  to: string;
  w: number;
  formal: boolean;
  color?: string;
}

const ShadowOrganisation: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [shadowLeaders, setShadowLeaders] = useState<Node[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/culture/shadow-organization')
      .then(res => res.json())
      .then(data => {
        if (data.nodes) setNodes(data.nodes);
        if (data.edges) setEdges(data.edges);
        if (data.shadowLeaders) setShadowLeaders(data.shadowLeaders);
      })
      .catch(err => {
        console.error('Failed to fetch shadow organization:', err);
        // Fallback to default data
        setNodes([
          { id: 'ceo', label: 'CEO', title: 'Chief Executive', formal: true, influence: 82, x: 50, y: 10, color: '#38bdf8' },
          { id: 'coo', label: 'COO', title: 'Chief Operating', formal: true, influence: 58, x: 22, y: 30, color: '#38bdf8' },
          { id: 'cto', label: 'CTO', title: 'Chief Technology', formal: true, influence: 61, x: 78, y: 30, color: '#38bdf8' },
        ]);
        setEdges([
          { from: 'ceo', to: 'coo', w: 3, formal: true },
          { from: 'ceo', to: 'cto', w: 3, formal: true },
        ]);
      });
  }, []);

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const sel = selected ? nodeMap[selected] : null;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #a78bfa', boxShadow: 'var(--shadow-md)' }}>

      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-2">
          <Network size={13} style={{ color: '#a78bfa' }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Shadow Organisation View</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye size={11} style={{ color: '#a78bfa' }} />
          <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Actual influence vs org chart</span>
        </div>
      </div>

      <div className="p-5">
        <p className="text-[10px] mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Signal pattern analysis reveals who <span className="font-semibold text-white">actually drives decisions</span> — independent of formal title.
          Red nodes are informal influence hubs whose authority exceeds their seniority.
          <span className="font-semibold" style={{ color: '#f43f5e' }}> Click any node to inspect.</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Graph */}
          <div className="lg:col-span-2 relative rounded-xl overflow-hidden"
            style={{ height: 280, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-1)' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* Edges */}
              {edges.map((e, i) => {
                const a = nodeMap[e.from];
                const b = nodeMap[e.to];
                return (
                  <line key={i}
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={e.formal ? 'rgba(255,255,255,0.12)' : (e.color ?? '#a78bfa')}
                    strokeWidth={e.formal ? 0.5 : e.w * 0.35}
                    strokeDasharray={e.formal ? undefined : '1.5 1'}
                    opacity={e.formal ? 0.6 : 0.7}
                  />
                );
              })}
              {/* Nodes */}
              {nodes.map((n) => {
                const isSelected = selected === n.id;
                const r = n.shadow ? 5.5 : 3.8;
                return (
                  <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(isSelected ? null : n.id)}>
                    {n.shadow && (
                      <circle cx={n.x} cy={n.y} r={r + 3} fill="none" stroke={n.color} strokeWidth={0.4} opacity={0.3}>
                        <animate attributeName="r" values={`${r + 2};${r + 5};${r + 2}`} dur="2.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={n.x} cy={n.y} r={isSelected ? r + 1.5 : r}
                      fill={`${n.color}${n.shadow ? '2a' : '18'}`}
                      stroke={n.color}
                      strokeWidth={isSelected ? 1.5 : (n.shadow ? 1.2 : 0.6)}
                    />
                    <text x={n.x} y={n.y + 1} textAnchor="middle" fontSize={2.8} fill="white" fontFamily="var(--font-display)" fontWeight={700}>
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend overlay */}
            <div className="absolute bottom-2 left-2 space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-[1.5px]" style={{ background: 'rgba(255,255,255,0.25)' }} />
                <span className="text-[7px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Formal authority</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-[1.5px]" style={{ background: '#a78bfa', borderTop: '1.5px dashed #a78bfa' }} />
                <span className="text-[7px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Shadow influence</span>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-3">
            {/* Selected node detail */}
            <AnimatePresence mode="wait">
              {sel ? (
                <motion.div key={sel.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="rounded-xl p-3.5"
                  style={{ background: `${sel.color}10`, border: `1px solid ${sel.color}28` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: sel.color }} />
                    <span className="text-[12px] font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{sel.label}</span>
                    {sel.shadow && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${sel.color}20`, color: sel.color, fontFamily: 'var(--font-mono)' }}>SHADOW</span>}
                  </div>
                  <p className="text-[10px] mb-2" style={{ color: 'var(--text-secondary)' }}>{sel.title}</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Influence score</span>
                      <span className="text-[11px] font-bold" style={{ color: sel.color, fontFamily: 'var(--font-mono)' }}>{sel.influence}/100</span>
                    </div>
                    <div className="progress-track">
                      <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${sel.influence}%` }}
                        style={{ background: `linear-gradient(90deg, ${sel.color}88, ${sel.color})` }} />
                    </div>
                    {sel.shadow && (
                      <p className="text-[9px] mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        Influence exceeds formal authority. Key decision path runs through this person regardless of hierarchy.
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-xl p-3.5 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-1)' }}>
                  <Network size={18} style={{ color: 'var(--text-muted)', margin: '0 auto 6px' }} />
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Click a node to inspect influence score</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Shadow leaders summary */}
            <div className="rounded-xl p-3" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.18)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle size={10} style={{ color: '#f43f5e' }} />
                <span className="text-[10px] font-bold" style={{ color: '#f43f5e', fontFamily: 'var(--font-display)' }}>Shadow Leaders Detected</span>
              </div>
              <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-bold text-white">3 informal leaders</span> not on the executive team drive an estimated{' '}
                <span className="font-bold" style={{ color: '#f43f5e' }}>47%</span> of key decisions.
                Ignoring shadow authority creates misaligned change programmes.
              </p>
            </div>

            {/* Top shadows */}
            {shadowLeaders.map((n, i) => (
              <div key={n.id} className="flex items-center gap-2 rounded-lg p-2.5"
                style={{ background: `${n.color}08`, border: `1px solid ${n.color}1a`, cursor: 'pointer' }}
                onClick={() => setSelected(n.id === selected ? null : n.id)}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: n.color }} />
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{n.label}</p>
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{n.title}</p>
                </div>
                <span className="text-[10px] font-bold" style={{ color: n.color, fontFamily: 'var(--font-mono)' }}>{n.influence}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadowOrganisation;
