import React, { useState } from 'react';
import { LayoutDashboard, BrainCircuit, LineChart, Users, Activity, ChevronRight, Bell, Settings, Dna, FileDown, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDownloadLink } from '@react-pdf/renderer';
import './index.css';

import CommandCenter from './components/CommandCenter';
import DeepReveals from './components/DeepReveals';
import Benchmarking from './components/Benchmarking';
import CultureAndPerception from './components/CultureAndPerception';
import OrganisationalBiologicalAge from './components/OrganisationalBiologicalAge';
import MaturityIntelligence from './components/MaturityIntelligence';
import ActionPlanDocument from './components/ActionPlanPDFDocument';
import StrategicInsightsTicker from './components/StrategicInsightsTicker';
import useIntakeData from './hooks/useIntakeData';

const navItems = [
  { id: 'command',      label: 'Command Center',      icon: BrainCircuit,    sub: 'Live diagnostics' },
  { id: 'reveals',      label: 'Deep Reveals',         icon: LayoutDashboard, sub: 'Value leaks & risks' },
  { id: 'culture',      label: 'Culture & Perception', icon: Users,           sub: 'The mirror' },
  { id: 'benchmarking', label: 'Benchmarking',         icon: LineChart,       sub: 'Industry norms' },
  { id: 'oba',          label: 'Biological Age',        icon: Dna,             sub: 'Longevity science' },
  { id: 'maturity',     label: 'Maturity Intelligence', icon: TrendingUp,      sub: 'Capability & growth' },
];

const pageMeta: Record<string, { title: string; sub: string; accent: string }> = {
  command:      { title: 'Command Center',               sub: 'Real-time human system intelligence',              accent: '#38bdf8' },
  reveals:      { title: 'Deep Reveals',                 sub: 'Value leaks, risk radar & opportunities',          accent: '#f43f5e' },
  culture:      { title: 'Culture & Perception',         sub: 'The mirror — what leadership cannot see',          accent: '#a78bfa' },
  benchmarking: { title: 'Industry Benchmarking',        sub: 'Competitive intelligence & market norms',          accent: '#fb923c' },
  oba:          { title: 'Organisational Biological Age', sub: 'HC-BIO-001 · No board has heard this before',     accent: '#a78bfa' },
  maturity:     { title: 'Maturity Intelligence',         sub: 'Department capability · Assessment · Growth path', accent: '#10b981' },
};

const App = () => {
  const [activeTab, setActiveTab] = useState('command');
  const page = pageMeta[activeTab];

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 relative z-20 no-grid h-screen overflow-hidden"
        style={{
          background: 'var(--bg-base)',
          borderRight: '1px solid var(--border-1)',
        }}>

        {/* Wordmark */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(129,140,248,0.2))', border: '1px solid rgba(56,189,248,0.25)' }}>
              <Activity size={15} style={{ color: '#38bdf8' }} />
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
            </div>
            <div>
              <span className="font-display text-sm font-700 tracking-tight text-white" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                <span style={{ color: '#38bdf8' }}>WORK</span>able
              </span>
              <p className="eyebrow" style={{ marginTop: 1 }}>Intelligence</p>
            </div>
          </div>
        </div>

        {/* Nav section */}
        <div className="px-2.5 pt-4 pb-2">
          <p className="eyebrow px-2.5 mb-2">Navigation</p>
          <nav className="space-y-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-left cursor-pointer"
                  style={{
                    transition: 'all 0.15s ease',
                    background: active ? 'rgba(56,189,248,0.08)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(56,189,248,0.18)' : 'transparent'}`,
                    position: 'relative',
                  }}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
                      style={{ background: '#38bdf8', boxShadow: '0 0 8px rgba(56,189,248,0.6)' }} />
                  )}
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: active ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
                      transition: 'background 0.15s ease',
                    }}>
                    <Icon size={14} style={{ color: active ? '#38bdf8' : 'var(--text-muted)', transition: 'color 0.15s' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate"
                      style={{ fontFamily: 'var(--font-display)', color: active ? 'white' : 'var(--text-secondary)', transition: 'color 0.15s', fontWeight: active ? 600 : 500 }}>
                      {item.label}
                    </p>
                  </div>
                  {active && <ChevronRight size={11} style={{ color: 'rgba(56,189,248,0.6)', flexShrink: 0 }} />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* System status */}
        <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="dot dot-green dot-pulse" style={{ position: 'relative', width: 6, height: 6, display: 'inline-block', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 5px #34d399' }} />
            <span className="eyebrow" style={{ color: '#34d399' }}>System Live</span>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>HSI v5 · 47 signals</p>
        </div>

        {/* User footer */}
        <div className="px-3 pb-4" style={{ borderTop: '1px solid var(--border-1)', paddingTop: 12 }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #0c4a6e, #164e63)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate" style={{ fontFamily: 'var(--font-display)' }}>System Admin</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Blueprint v5</p>
            </div>
            <Settings size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, cursor: 'pointer' }} />
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative">

        {/* Deep ambient glows */}
        <div className="fixed pointer-events-none ambient-a"
          style={{ top: '-10%', left: '20%', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 65%)', filter: 'blur(40px)' }} />
        <div className="fixed pointer-events-none ambient-b"
          style={{ bottom: '-10%', right: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.035) 0%, transparent 65%)', filter: 'blur(40px)' }} />

        {/* ── Top header bar ── */}
        <header className="sticky top-0 z-20 no-grid"
          style={{ background: 'rgba(3,5,10,0.9)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border-1)' }}>
          <StrategicInsightsTicker />
          <div className="flex items-center justify-between px-7 py-3.5">

            {/* Page title */}
            <div className="flex items-center gap-3">
              {/* Accent line */}
              <div className="w-0.5 h-8 rounded-full" style={{ background: `linear-gradient(180deg, ${page.accent}, ${page.accent}44)` }} />
              <div>
                <h1 className="text-base font-bold text-white leading-none" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  {page.title}
                </h1>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{page.sub}</p>
              </div>
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-3">
              {/* Action Plan PDF Download */}
              <PDFDownloadLink
                document={<ActionPlanDocument />}
                fileName="WORKable-Executive-Action-Plan-Mar2026.pdf"
                style={{ textDecoration: 'none' }}
              >
                {({ loading }) => (
                  <button
                    disabled={loading}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl cursor-pointer"
                    style={{
                      background: loading ? 'rgba(167,139,250,0.06)' : 'rgba(167,139,250,0.1)',
                      border: '1px solid rgba(167,139,250,0.25)',
                      transition: 'all 0.15s',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    <FileDown size={13} style={{ color: '#a78bfa', flexShrink: 0 }} />
                    <span className="text-[11px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#a78bfa', whiteSpace: 'nowrap' }}>
                      {loading ? 'Generating…' : 'Action Plan'}
                    </span>
                  </button>
                )}
              </PDFDownloadLink>

              {/* Notification bell */}
              <button className="w-8 h-8 rounded-xl flex items-center justify-center relative cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', transition: 'all 0.15s' }}>
                <Bell size={13} style={{ color: 'var(--text-muted)' }} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#f43f5e', boxShadow: '0 0 4px #f43f5e' }} />
              </button>

              {/* HSI Widget */}
              {(() => {
                const { data } = useIntakeData();
                const workerDiags = (data?.all_diagnostics || []).filter((d: any) => d.type === 'worker');
                
                // Calculate Live HSI (Matching TopKpiRow logic)
                const calcAvg = (key: string, isP1: boolean = false) => {
                  if (workerDiags.length === 0) return 0;
                  return workerDiags.reduce((acc: number, r: any) => acc + (isP1 ? (r.p1?.[key] || 0) : (r[key] || 0)), 0) / workerDiags.length;
                };

                const avgMeaning = (calcAvg('orgHealth', true) + calcAvg('targetClarity', true)) / 2;
                const avgEnergy = 10 - calcAvg('burnout', true);
                const avgSustainability = 10 - calcAvg('capGap', true);
                const hsi = workerDiags.length > 0 ? Math.round(((avgMeaning + avgEnergy + avgSustainability) / 30) * 100) : null;

                // Calculate Crisis Proximity Index — same formula as TopKpiRow / CrisisProximityIndex
                const allDiags = data?.all_diagnostics || [];
                const supervisorDiags = allDiags.filter((d: any) => d.type === 'supervisor');
                const allCombined = [...workerDiags, ...supervisorDiags];

                const avgBurnout   = allCombined.length > 0 ? allCombined.reduce((s: number, d: any) => s + (d.p1?.burnout || 0), 0) / allCombined.length : 0;
                const avgCapGap    = workerDiags.length > 0 ? workerDiags.reduce((s: number, d: any) => s + (d.p1?.capGap || 0), 0) / workerDiags.length : 0;
                const overloadPct  = workerDiags.length > 0 ? (workerDiags.filter((d: any) => (d.p1?.weeklyHrs || 0) > 45).length / workerDiags.length) * 100 : 0;
                const avgLegacy    = workerDiags.length > 0 ? workerDiags.reduce((s: number, d: any) => s + (d.p1?.legacyBurden || 0), 0) / workerDiags.length : 0;
                const supWithEnth  = supervisorDiags.filter((d: any) => d.p3?.enthusiasm !== undefined);
                const avgEnth      = supWithEnth.length > 0 ? supWithEnth.reduce((s: number, d: any) => s + (d.p3?.enthusiasm || 0), 0) / supWithEnth.length : 12;
                const enthScore    = Math.max(0, 100 - (avgEnth / 25) * 100);
                const cpiValue     = allDiags.length > 0
                  ? Math.round((avgBurnout / 5) * 100 * 0.35 + (avgCapGap / 10) * 100 * 0.25 + overloadPct * 0.15 + avgLegacy * 0.15 + enthScore * 0.10)
                  : 0;

                const crisisStatus = cpiValue > 70 ? 'CRITICAL' : cpiValue > 45 ? 'ELEVATED' : cpiValue > 25 ? 'MONITORED' : 'STABLE';
                const crisisColor  = cpiValue > 70 ? '#f43f5e'  : cpiValue > 45 ? '#fb923c'  : cpiValue > 25 ? '#38bdf8'  : '#34d399';

                return (
                  <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)' }}>

                    {/* HSI score */}
                    <div>
                      <p className="eyebrow mb-1">Human System Index</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="data-lg" style={{ color: hsi ? '#38bdf8' : 'var(--text-muted)' }}>{hsi ?? '--'}</span>
                        {hsi && <span className="text-[10px] font-semibold" style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>↑ LIVE</span>}
                      </div>
                    </div>

                    <div style={{ width: 1, height: 32, background: 'var(--border-1)' }} />

                    {/* Crisis proximity */}
                    <div>
                      <p className="eyebrow mb-1">Crisis Proximity</p>
                      <div className="flex items-center gap-1.5">
                        <span className="dot" style={{ background: crisisColor, boxShadow: `0 0 5px ${crisisColor}`, width: 6, height: 6, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
                        <span className="text-sm font-semibold" style={{ color: crisisColor, fontFamily: 'var(--font-display)', textTransform: 'capitalize' }}>
                          {workerDiags.length > 0 ? crisisStatus.toLowerCase() : '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Hair-line progress tint under header */}
          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent 0%, ${page.accent}33 50%, transparent 100%)` }} />
        </header>

        {/* ── Page content ── */}
        <div className="px-8 py-8 max-w-[1400px] mx-auto w-full relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'command'      && <CommandCenter />}
              {activeTab === 'reveals'      && <DeepReveals />}
              {activeTab === 'culture'      && <CultureAndPerception />}
              {activeTab === 'benchmarking' && <Benchmarking />}
              {activeTab === 'oba'          && <OrganisationalBiologicalAge />}
              {activeTab === 'maturity'    && <MaturityIntelligence />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
