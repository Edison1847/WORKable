import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import useIntakeData from '../hooks/useIntakeData';

/* ── SVG constants ───────────────────────────────────────── */
const CX = 110;
const CY = 110;
const VW = 220;
const VH = 220;

/* ── Threat arc helper ───────────────────────────────────── */
const toRad = (d: number) => (d * Math.PI) / 180;
const arcPath = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
  if (endDeg - startDeg >= 360) endDeg = startDeg + 359.9;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

/* ── Node config ─────────────────────────────────────────── */
interface NodeCfg {
  key:       string;
  label:     string;
  orbitR:    number;
  speed:     number;
  initAngle: number;
  color:     string;
  trackColor:string;
}

const NODE_CFGS: NodeCfg[] = [
  { key: 'burnout',    label: 'Burnout',   orbitR: 38, speed:  0.22, initAngle: 0.4, color: '#f43f5e', trackColor: 'rgba(244,63,94,0.12)'   },
  { key: 'capGap',     label: 'Cap Gap',   orbitR: 54, speed: -0.14, initAngle: 2.1, color: '#fb923c', trackColor: 'rgba(251,146,60,0.10)'   },
  { key: 'misalign',   label: 'Misalign',  orbitR: 68, speed:  0.09, initAngle: 3.8, color: '#fbbf24', trackColor: 'rgba(251,191,36,0.08)'   },
  { key: 'overload',   label: 'Overload',  orbitR: 54, speed: -0.18, initAngle: 1.1, color: '#a78bfa', trackColor: 'rgba(167,139,250,0.10)'  },
  { key: 'shadowOrg',  label: 'Shadow',    orbitR: 80, speed:  0.07, initAngle: 5.0, color: '#38bdf8', trackColor: 'rgba(56,189,248,0.07)'   },
];

/* ── Color helpers ───────────────────────────────────────── */
const cpiColor = (v: number) => v >= 70 ? '#f43f5e' : v >= 50 ? '#fb923c' : v >= 30 ? '#fbbf24' : '#34d399';
const severityColor = (v: number, max: number) => {
  const pct = v / max;
  return pct > 0.7 ? '#f43f5e' : pct > 0.5 ? '#fb923c' : pct > 0.3 ? '#fbbf24' : '#34d399';
};

/* ── Component ───────────────────────────────────────────── */
const DarkMatterNetwork: React.FC = () => {
  const { data } = useIntakeData();
  const [t, setT] = useState(0);
  const rafRef  = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const accRef  = useRef<number>(0);

  /* ── Live metrics from backend ── */
  const metrics = useMemo(() => {
    const workers = (data?.all_diagnostics || []).filter((d: any) => d.type === 'worker');
    const n = workers.length;
    if (n === 0) return { burnout: 0, capGap: 0, misalign: 0, overload: 0, shadowOrg: 0, cpi: 0, darkCount: 0, workers: 0 };

    const avg = (key: string, path = 'p1') =>
      workers.reduce((s: number, w: any) => s + (w[path]?.[key] || 0), 0) / n;

    const avgBurnout  = avg('burnout');
    const avgCapGap   = avg('capGap');
    const avgClarity  = avg('targetClarity');
    const avgLegacy   = avg('legacyBurden');

    // Misalignment: inverted clarity (scale 0-10 → pct)
    const misalign = Math.round(((10 - avgClarity) / 10) * 100);
    // Overload: burnout + legacy pressure combined
    const overload = Math.round(Math.min(100, avgBurnout * 7 + avgLegacy * 3));
    // Shadow org: workers with orgHealth < 5
    const shadowOrg = workers.filter((w: any) => (w.p1?.orgHealth || 0) < 5).length;
    // Dark networks: burnout > 6 AND capGap > 5
    const darkCount = workers.filter((w: any) => (w.p1?.burnout || 0) > 6 && (w.p1?.capGap || 0) > 5).length;

    const burnoutPct  = Math.round((avgBurnout  / 10) * 100);
    const capGapPct   = Math.round((avgCapGap   / 10) * 100);
    const shadowPct   = Math.round((shadowOrg   / n)  * 100);

    const cpi = Math.round(
      burnoutPct  * 0.35 +
      capGapPct   * 0.25 +
      overload    * 0.20 +
      misalign    * 0.10 +
      shadowPct   * 0.10
    );

    return { burnout: burnoutPct, capGap: capGapPct, misalign, overload, shadowOrg: shadowPct, cpi: Math.min(100, cpi), darkCount, workers: n };
  }, [data]);

  const nodeValues: Record<string, number> = {
    burnout:   metrics.burnout,
    capGap:    metrics.capGap,
    misalign:  metrics.misalign,
    overload:  metrics.overload,
    shadowOrg: metrics.shadowOrg,
  };

  /* ── RAF orbit loop ── */
  useEffect(() => {
    const loop = (ts: number) => {
      if (lastRef.current) {
        accRef.current += (ts - lastRef.current) / 1000;
        setT(accRef.current);
      }
      lastRef.current = ts;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── Compute node positions ── */
  const nodes = NODE_CFGS.map(cfg => {
    const a   = cfg.initAngle + t * cfg.speed;
    const svgX = CX + cfg.orbitR * Math.cos(a);
    const svgY = CY + cfg.orbitR * Math.sin(a);
    const val  = nodeValues[cfg.key] ?? 0;
    const nodeR = 3.5 + (val / 100) * 3.5;
    return { ...cfg, svgX, svgY, val, nodeR };
  });

  const cc = cpiColor(metrics.cpi);
  const cpiArcDeg = (metrics.cpi / 100) * 360;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55 }}
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(6, 10, 18, 0.96)',
        border: '1px solid rgba(244,63,94,0.18)',
        boxShadow: '0 4px 32px rgba(244,63,94,0.07), inset 0 1px 0 rgba(255,255,255,0.04)',
        minHeight: 380,
      }}
    >
      {/* Background radial wash */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 40% 42%, rgba(244,63,94,0.05) 0%, transparent 68%)' }} />

      {/* ── Header ── */}
      <div className="relative z-10 px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} style={{ color: '#f43f5e' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
            System Vulnerability
          </span>
          <span className="text-[7px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.22)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            LIVE
          </span>
        </div>
        <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {metrics.workers} workers
        </span>
      </div>

      {/* ── Radar canvas ── */}
      <div className="relative flex-1" style={{ minHeight: 220 }}>
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="dmCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={cc}          stopOpacity="1"   />
              <stop offset="60%"  stopColor={cc}          stopOpacity="0.7" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)"               />
            </radialGradient>
            <radialGradient id="dmCoreBody" cx="38%" cy="32%" r="68%">
              <stop offset="0%"   stopColor="#1a0c1c" />
              <stop offset="100%" stopColor="#0a0508" />
            </radialGradient>
            <filter id="dmGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="dmNodeGlow" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="dmSweep" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>

          {/* ── Orbit tracks ── */}
          {NODE_CFGS.map((cfg, i) => (
            <circle key={i} cx={CX} cy={CY} r={cfg.orbitR}
              fill="none" stroke={cfg.trackColor} strokeWidth="0.8"
              strokeDasharray="2 4"
            />
          ))}

          {/* ── Cross-hairs ── */}
          {[0, 90].map(a => (
            <line key={a}
              x1={CX + 92 * Math.cos(toRad(a))} y1={CY + 92 * Math.sin(toRad(a))}
              x2={CX - 92 * Math.cos(toRad(a))} y2={CY - 92 * Math.sin(toRad(a))}
              stroke="rgba(255,255,255,0.04)" strokeWidth="0.6"
            />
          ))}

          {/* ── Scanner sweep ── */}
          <g filter="url(#dmSweep)">
            <line x1={CX} y1={CY}
              x2={CX + 88 * Math.cos(t * 0.4)}
              y2={CY + 88 * Math.sin(t * 0.4)}
              stroke="rgba(244,63,94,0.22)" strokeWidth="1.5"
            />
            <line x1={CX} y1={CY}
              x2={CX + 88 * Math.cos(t * 0.4 - 0.15)}
              y2={CY + 88 * Math.sin(t * 0.4 - 0.15)}
              stroke="rgba(244,63,94,0.08)" strokeWidth="3"
            />
          </g>

          {/* ── Connection lines from centre ── */}
          {nodes.map((n, i) => (
            <line key={i}
              x1={CX} y1={CY} x2={n.svgX} y2={n.svgY}
              stroke={n.color} strokeWidth="0.5" opacity="0.18"
              strokeDasharray="2 3"
            />
          ))}

          {/* ── Cross-node threat lines (only critical pairs) ── */}
          {nodes.filter(n => n.val > 60).flatMap((a, ai) =>
            nodes.filter((b, bi) => bi > ai && b.val > 60).map((b, bi) => (
              <line key={`thr-${ai}-${bi}`}
                x1={a.svgX} y1={a.svgY} x2={b.svgX} y2={b.svgY}
                stroke="#f43f5e" strokeWidth="0.4" opacity="0.18"
                strokeDasharray="1.5 3"
              />
            ))
          )}

          {/* ── Orbital nodes ── */}
          {nodes.map((n, i) => {
            const isCrit = n.val > 65;
            return (
              <g key={i}>
                {/* Threat arc around orbit track */}
                {n.val > 20 && (
                  <path
                    d={arcPath(CX, CY, n.orbitR, -90, -90 + (n.val / 100) * 360)}
                    fill="none" stroke={n.color}
                    strokeWidth="1.8" opacity="0.35"
                    strokeLinecap="round"
                  />
                )}
                {/* Node glow halo */}
                <circle cx={n.svgX} cy={n.svgY} r={n.nodeR * 2.5}
                  fill={n.color} opacity={0.08}
                  filter="url(#dmNodeGlow)"
                />
                {/* Node body */}
                <circle cx={n.svgX} cy={n.svgY} r={n.nodeR}
                  fill={n.color} opacity={isCrit ? 0.92 : 0.7}
                  filter={isCrit ? 'url(#dmGlow)' : undefined}
                />
                {/* Inner highlight */}
                <circle cx={n.svgX - n.nodeR * 0.28} cy={n.svgY - n.nodeR * 0.28}
                  r={n.nodeR * 0.38} fill="rgba(255,255,255,0.25)"
                />
                {/* Pulse ring for critical */}
                {isCrit && (
                  <motion.circle cx={n.svgX} cy={n.svgY} r={n.nodeR}
                    fill="none" stroke={n.color}
                    animate={{ r: [n.nodeR, n.nodeR + 8], opacity: [0.5, 0], strokeWidth: [1.2, 0.2] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                {/* SVG label — positioned relative to node, offset outward */}
                {(() => {
                  const dx = n.svgX - CX;
                  const dy = n.svgY - CY;
                  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                  const lx = n.svgX + (dx / dist) * (n.nodeR + 5);
                  const ly = n.svgY + (dy / dist) * (n.nodeR + 5);
                  const anchor = dx > 0 ? 'start' : dx < -2 ? 'end' : 'middle';
                  const baseY  = dy > 0 ? 0 : -7;
                  return (
                    <g>
                      <text x={lx} y={ly + baseY}
                        textAnchor={anchor}
                        fontSize="6" fontWeight="700"
                        fontFamily="var(--font-display)"
                        fill={n.color} letterSpacing="0.08em"
                        opacity="0.85">
                        {n.label.toUpperCase()}
                      </text>
                      <text x={lx} y={ly + baseY + 7}
                        textAnchor={anchor}
                        fontSize="5.5" fontFamily="var(--font-mono)"
                        fill={severityColor(n.val, 100)} opacity="0.7">
                        {n.val}%
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })}

          {/* ── Central core ── */}
          {/* Atmospheric bloom */}
          <motion.circle cx={CX} cy={CY} r={18}
            fill={cc} opacity={0.08}
            animate={{ r: [18, 26, 18], opacity: [0.08, 0.16, 0.08] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Ripple rings */}
          {[0, 1, 2].map(ri => (
            <motion.circle key={ri} cx={CX} cy={CY} r={12}
              fill="none" stroke={cc}
              animate={{ r: [12, 32], opacity: [0.4, 0], strokeWidth: [1.2, 0.2] }}
              transition={{ duration: 2.8, delay: ri * 0.93, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
          {/* CPI arc track */}
          <circle cx={CX} cy={CY} r={14}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2"
          />
          {/* CPI arc fill */}
          {cpiArcDeg > 0 && (
            <path
              d={arcPath(CX, CY, 14, -90, -90 + cpiArcDeg)}
              fill="none" stroke={cc}
              strokeWidth="2.5" strokeLinecap="round"
              opacity="0.9"
            />
          )}
          {/* Core body */}
          <circle cx={CX} cy={CY} r={10} fill="url(#dmCoreBody)" />
          <motion.circle cx={CX} cy={CY} r={10}
            fill="none" stroke={cc}
            animate={{ strokeOpacity: [0.7, 1, 0.7], strokeWidth: [1.5, 2.2, 1.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* CPI number */}
          <text x={CX} y={CY + 1.5} textAnchor="middle" dominantBaseline="middle"
            fontSize="6.5" fontWeight="800" fontFamily="var(--font-mono)"
            fill={cc}>
            {metrics.cpi}
          </text>
        </svg>
      </div>

      {/* ── CPI readout ── */}
      <div className="relative z-10 px-5 pb-5">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[8.5px] font-bold uppercase tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Crisis Proximity Index
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black"
                style={{ fontFamily: 'var(--font-mono)', color: cc, textShadow: `0 0 20px ${cc}40`, lineHeight: 1 }}>
                {metrics.cpi}
              </span>
              <span className="text-base font-bold" style={{ color: `${cc}80` }}>/100</span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: metrics.darkCount > 0 ? '#f43f5e' : '#34d399', boxShadow: metrics.darkCount > 0 ? '0 0 6px #f43f5e' : undefined }} />
              <span className="text-[10px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: metrics.darkCount > 0 ? '#f87171' : '#34d399' }}>
                {metrics.darkCount} dark network{metrics.darkCount !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {metrics.workers} workers scanned
            </p>
          </div>
        </div>

        {/* CPI bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${metrics.cpi}%` }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{ background: `linear-gradient(90deg, ${cc}, ${cc}99)`, boxShadow: `0 0 8px ${cc}88` }}
          />
        </div>

        {/* Metric pills row */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {nodes.map(n => (
            <div key={n.key}
              className="flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{ background: `${n.color}0d`, border: `1px solid ${n.color}22` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: n.color, boxShadow: n.val > 65 ? `0 0 5px ${n.color}` : undefined }} />
              <span className="text-[8.5px]" style={{ fontFamily: 'var(--font-mono)', color: n.val > 65 ? n.color : 'rgba(255,255,255,0.4)' }}>
                {n.label} {n.val}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DarkMatterNetwork;
