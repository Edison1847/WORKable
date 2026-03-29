import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface OrbitalNode {
  label: string;
  radius: number;   // px distance from centre in the 200×200 viewBox
  size: number;     // dot diameter
  speed: number;    // radians per second  (positive = clockwise)
  initAngle: number;
  color: string;
}

const NODES: OrbitalNode[] = [
  { label: 'Friction',   radius: 42, size: 7,   speed:  0.28, initAngle: 0.4,  color: '#ef4444' },
  { label: 'Overload',   radius: 62, size: 9,   speed: -0.18, initAngle: 2.1,  color: '#f87171' },
  { label: 'Burnout',    radius: 78, size: 11,  speed:  0.14, initAngle: 3.8,  color: '#ef4444' },
  { label: 'Misalign',   radius: 55, size: 6.5, speed: -0.22, initAngle: 1.1,  color: '#fca5a5' },
  { label: 'Shadow Org', radius: 82, size: 8,   speed:  0.10, initAngle: 5.0,  color: '#f87171' },
];

const CX = 100; // SVG centre X
const CY = 100; // SVG centre Y

const DarkMatterNetwork: React.FC = () => {
  const [angle, setAngle] = useState(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const accRef = useRef<number>(0);

  // Core-node pulse
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 2400);
    return () => clearInterval(id);
  }, []);

  // Continuous orbit loop
  useEffect(() => {
    const loop = (ts: number) => {
      if (lastRef.current) {
        const dt = (ts - lastRef.current) / 1000; // seconds
        accRef.current += dt;
        setAngle(accRef.current); // single value — each node applies its own speed multiplier
      }
      lastRef.current = ts;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Compute current (x,y) for each node in the 200×200 SVG space
  const positions = NODES.map(n => {
    const a = n.initAngle + angle * n.speed;
    return {
      ...n,
      svgX: CX + n.radius * Math.cos(a),
      svgY: CY + n.radius * Math.sin(a),
      // normalise to % of container for DOM overlay
      pctX: ((CX + n.radius * Math.cos(a)) / 200) * 100,
      pctY: ((CY + n.radius * Math.sin(a)) / 200) * 100,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(9, 13, 22, 0.9)',
        border: '1px solid rgba(239,68,68,0.18)',
        boxShadow: '0 4px 32px rgba(239,68,68,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
        minHeight: 380,
      }}
    >
      {/* Red radial wash */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 44%, rgba(239,68,68,0.06) 0%, transparent 65%)' }} />

      {/* Header */}
      <div className="relative z-10 px-5 pt-5 pb-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} style={{ color: '#ef4444' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            System Vulnerability
          </span>
        </div>
        <span className="badge badge-red">Live</span>
      </div>

      {/* Radar canvas */}
      <div className="relative flex-1" style={{ minHeight: 220 }}>

        {/* SVG — rings + dynamic lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Concentric rings */}
          {[38, 60, 78, 92].map((r, i) => (
            <circle key={i} cx={CX} cy={CY} r={r} fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={i === 3 ? 0.6 : 0.8}
              strokeDasharray={i === 3 ? '2 5' : undefined}
            />
          ))}

          {/* Rotating scanner sweep */}
          <line
            x1={CX} y1={CY}
            x2={CX + 92 * Math.cos(angle * 0.4)}
            y2={CY + 92 * Math.sin(angle * 0.4)}
            stroke="rgba(239,68,68,0.18)"
            strokeWidth="1"
          />
          <line
            x1={CX} y1={CY}
            x2={CX + 92 * Math.cos(angle * 0.4 - 0.12)}
            y2={CY + 92 * Math.sin(angle * 0.4 - 0.12)}
            stroke="rgba(239,68,68,0.08)"
            strokeWidth="2"
          />

          {/* Lines from centre to each live node */}
          {positions.map((n, i) => (
            <line key={i}
              x1={CX} y1={CY}
              x2={n.svgX} y2={n.svgY}
              stroke="rgba(239,68,68,0.2)"
              strokeWidth="0.7"
              strokeDasharray="2 3"
            />
          ))}

          {/* Node dots rendered in SVG for pixel-perfect orbit */}
          {positions.map((n, i) => (
            <g key={i}>
              {/* Glow halo */}
              <circle cx={n.svgX} cy={n.svgY} r={n.size * 1.6} fill={n.color} opacity={0.12} />
              {/* Core dot */}
              <circle cx={n.svgX} cy={n.svgY} r={n.size * 0.55} fill={n.color} opacity={0.9} />
            </g>
          ))}

          {/* Core amber node */}
          <circle cx={CX} cy={CY} r={10} fill="url(#coreGrad)"
            style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.7))' }} />
          <circle cx={CX} cy={CY} r={4} fill="rgba(255,255,255,0.35)" />

          <defs>
            <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>
        </svg>

        {/* Floating label overlays — follow each node */}
        {positions.map((n, i) => {
          const isRight = n.pctX > 50;
          const isBottom = n.pctY > 60;
          return (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: `${n.pctX}%`,
                top: `${n.pctY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span
                className="absolute whitespace-nowrap text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(5,8,15,0.85)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#fca5a5',
                  // offset label away from dot
                  left: isRight ? 'calc(100% + 4px)' : undefined,
                  right: isRight ? undefined : 'calc(100% + 4px)',
                  top: isBottom ? undefined : '50%',
                  bottom: isBottom ? '50%' : undefined,
                  transform: 'translateY(-50%)',
                }}
              >
                {n.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* CPI readout */}
      <div className="relative z-10 px-5 pb-5">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="label-xs mb-1">Crisis Proximity Index</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black font-mono"
                style={{ color: '#ef4444', textShadow: '0 0 20px rgba(239,68,68,0.4)' }}>62</span>
              <span className="text-base font-bold" style={{ color: 'rgba(239,68,68,0.5)' }}>/100</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold" style={{ color: '#f87171' }}>12 dark networks</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>$412k unallocated</p>
          </div>
        </div>

        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '62%' }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{ background: 'linear-gradient(90deg, #ef4444, #f87171)', boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default DarkMatterNetwork;
