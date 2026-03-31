import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, ShieldAlert, BarChart3, Layers, Lightbulb, ChevronDown } from 'lucide-react';
import DarkMatterNetwork from './DarkMatterNetwork';
import SignalPulseStrip from './SignalPulseStrip';
import ActionCommandCentre from './ActionCommandCentre';
import TopKpiRow from './TopKpiRow';
import StrategicMatrix from './StrategicMatrix';
import SignalCorrelationMap from './SignalCorrelationMap';
import CrisisProximityIndex from './CrisisProximityIndex';
import TippingPointTimeline from './TippingPointTimeline';
import HumanSystemIndex from './HumanSystemIndex';
import FinancialImpactModel from './FinancialImpactModel';
import ActiveNudgesSummary from './ActiveNudgesSummary';
import useIntakeData from '../hooks/useIntakeData';

const NarrativeSynthesis: React.FC = () => {
  const { data } = useIntakeData();
  const allDiags  = (data?.all_diagnostics || []) as any[];
  const workers   = allDiags.filter(d => d.type === 'worker');
  const supervisors = allDiags.filter(d => d.type === 'supervisor');
  const combined  = [...workers, ...supervisors];

  if (allDiags.length === 0) return null;

  /* ── HSI ── */
  const calcAvg = (key: string, isP1 = false) => {
    if (workers.length === 0) return 0;
    return workers.reduce((acc: number, r: any) => acc + (isP1 ? (r.p1?.[key] || 0) : (r[key] || 0)), 0) / workers.length;
  };
  const hsi = workers.length > 0
    ? Math.round((((calcAvg('orgHealth', true) + calcAvg('targetClarity', true)) / 2 + (10 - calcAvg('burnout', true)) + (10 - calcAvg('capGap', true))) / 30) * 100)
    : 0;

  /* ── Value Leak ── */
  let lowCrit = 0, totalTime = 0;
  allDiags.forEach(d => (d.activityDetails || []).forEach((a: any) => {
    totalTime += (a.percentTime || 0);
    if (a.criticality === 'Low') lowCrit += (a.percentTime || 0);
  }));
  const leakPct = totalTime > 0 ? Math.round((lowCrit / totalTime) * 100) : 0;

  /* ── Full CPI (same formula as TopKpiRow) ── */
  const avgBurnout  = combined.length > 0 ? combined.reduce((s: number, d: any) => s + (d.p1?.burnout || 0), 0) / combined.length : 0;
  const avgCapGap   = workers.length > 0  ? workers.reduce((s: number, d: any) => s + (d.p1?.capGap || 0), 0) / workers.length : 0;
  const overloadPct = workers.length > 0  ? (workers.filter((d: any) => (d.p1?.weeklyHrs || 0) > 45).length / workers.length) * 100 : 0;
  const avgLegacy   = workers.length > 0  ? workers.reduce((s: number, d: any) => s + (d.p1?.legacyBurden || 0), 0) / workers.length : 0;
  const supWithEnth = supervisors.filter((d: any) => d.p3?.enthusiasm !== undefined);
  const avgEnth     = supWithEnth.length > 0 ? supWithEnth.reduce((s: number, d: any) => s + (d.p3?.enthusiasm || 0), 0) / supWithEnth.length : 12;
  const enthScore   = Math.max(0, 100 - (avgEnth / 25) * 100);
  const cpi = allDiags.length > 0
    ? Math.round((avgBurnout / 5) * 100 * 0.35 + (avgCapGap / 10) * 100 * 0.25 + overloadPct * 0.15 + avgLegacy * 0.15 + enthScore * 0.10)
    : 0;

  /* ── CEO Blindspot ── */
  const ceoDiags = allDiags.filter(d => d.type === 'ceo_audit');
  let bsSum = 0, bsCount = 0;
  ceoDiags.forEach((cd: any) => {
    const wd = workers.find((w: any) => w.employee_name?.toLowerCase() === cd.employee_name?.toLowerCase());
    if (wd) { bsSum += Math.abs((cd.p1?.clarity || 0) - (wd.p1?.targetClarity || 0)); bsCount++; }
  });
  const blindspot = bsCount > 0 ? bsSum / bsCount : null;

  /* ── Colours ── */
  const hsiColor  = hsi > 80 ? '#34d399' : hsi > 65 ? '#38bdf8' : hsi > 50 ? '#fb923c' : '#f43f5e';
  const cpiColor  = cpi > 70 ? '#f43f5e' : cpi > 45 ? '#fb923c' : cpi > 25 ? '#38bdf8' : '#34d399';
  const leakColor = leakPct > 25 ? '#f43f5e' : leakPct > 15 ? '#fb923c' : '#34d399';
  const accentColor = cpi > 70 ? '#f43f5e' : cpi > 45 ? '#fb923c' : '#38bdf8';

  /* ── Sentence 1: Overall state ── */
  const overallSentence = hsi > 80
    ? `Your people are in a good place right now.`
    : hsi > 65
    ? `Your people are managing, but the cracks are starting to show.`
    : hsi > 50
    ? `Your organisation is struggling under the surface — things look okay from the outside, but the data says otherwise.`
    : `Your people are at a breaking point. The numbers are sending a clear warning.`;

  /* ── Sentence 2: Top risk ── */
  const risks = [
    { score: (avgBurnout / 5) * 100,  label: 'burnout',
      sentence: `${Math.round(overloadPct)}% of your team is working more than 45 hours a week and burnout is building. If this continues, you will start losing people before you realise there was a problem.` },
    { score: (avgCapGap / 10) * 100,  label: 'capability gaps',
      sentence: `There is a skills mismatch across the organisation — people are being asked to do things they are not fully equipped for. This slows everything down and quietly erodes confidence.` },
    { score: overloadPct,             label: 'overload',
      sentence: `Too many people are carrying too much. When workload is this uneven, your best performers absorb the excess — and they are usually the first to leave.` },
    { score: avgLegacy,               label: 'legacy burden',
      sentence: `A large share of your team's time is locked into old ways of working that no longer serve the business. That is capacity you cannot deploy on what actually matters.` },
  ].sort((a, b) => b.score - a.score);
  const topRisk = risks[0];

  /* ── Sentence 3: Value leak ── */
  const leakSentence = leakPct > 25
    ? `On top of that, 1 in every 4 hours worked is going to activities your own people rate as low priority. Across a company, that adds up to a serious amount of wasted time and money.`
    : leakPct > 15
    ? `About 1 in every 6 working hours is going to low-priority tasks. Individually small — but across the whole team, it's a meaningful drag on output.`
    : leakPct > 0
    ? `A small portion of time is going to low-value work. It's manageable right now, but worth keeping an eye on.`
    : null;

  /* ── Sentence 4: CEO Blindspot ── */
  const blindspotSentence = blindspot === null ? null
    : blindspot <= 1.5
    ? `The good news is that leadership has a clear picture of what is happening on the ground — decisions are likely landing the way they were intended.`
    : blindspot <= 3.0
    ? `There is a gap between what leadership thinks and what employees are actually experiencing. It is not alarming yet, but decisions made on the wrong assumptions will compound over time.`
    : `Leadership and employees are seeing the organisation very differently. That gap means strategies designed at the top are likely landing differently than intended — a risk that grows quietly.`;

  /* ── Sentence 5: CTA ── */
  const ctaSentence = cpi > 70
    ? `Every week without action makes this harder to fix. This needs to be on the board's agenda now.`
    : cpi > 45
    ? `You have a window. The cost of acting now is a fraction of what recovery will cost if this is left to compound.`
    : cpi > 25
    ? `Stay ahead of it. Small, targeted actions now will prevent these signals from turning into a much bigger problem.`
    : `Keep doing what is working. Continue monitoring and address any new signals early.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="narrative-card rounded-2xl px-6 py-5 relative overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(56,189,248,0.10)',
      }}
    >
      {/* Shimmer accent bar — left edge */}
      <div className="narrative-accent-bar absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ background: accentColor }} />

      {/* Ambient aura gradient */}
      <div className="narrative-aura absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 15% 50%, ${accentColor}0C 0%, transparent 60%)` }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={12} style={{ color: accentColor }} />
            <span className="eyebrow" style={{ color: accentColor }}>Narrative Intelligence Synthesis</span>
          </div>
          <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
            {workers.length} workers · {supervisors.length} supervisors · {ceoDiags.length} CEO audits
          </span>
        </div>

        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>

          {/* Overall state */}
          <span className="font-semibold" style={{ color: hsiColor }}>{overallSentence}</span>{' '}

          {/* Top risk */}
          {topRisk.sentence}{' '}

          {/* Value leak */}
          {leakSentence && <>
            <span style={{ color: leakColor }}>{leakSentence}</span>{' '}
          </>}

          {/* CEO Blindspot */}
          {blindspotSentence && <>{blindspotSentence}{' '}</>}

          {/* CPI value + CTA */}
          The organisation's risk index is currently at{' '}
          <span className="font-semibold" style={{ color: cpiColor }}>{cpi} out of 100</span>.{' '}
          <span className="font-semibold text-white">{ctaSentence}</span>
        </p>
      </div>
    </motion.div>
  );
};

/* ── Reusable section wrapper ── */
const SectionBlock: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  delay?: number;
  tag?: string;
}> = ({ icon, label, children, delay = 0, tag }) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
  >
    {/* Section heading with fading rule */}
    <div className="section-heading mb-5 flex items-center gap-2">
      {icon}
      {label}
      {tag && (
        <span className="text-[7px] font-semibold px-2 py-0.5 rounded"
          style={{ 
            background: 'rgba(251,191,36,0.12)', 
            color: '#fbbf24',
            border: '1px solid rgba(251,191,36,0.25)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em'
          }}>
          {tag}
        </span>
      )}
    </div>
    {children}
  </motion.section>
);

const QUAD_CHIPS = [
  { label: 'Quick Wins',      value: '$233k', color: '#34d399' },
  { label: 'Strategic Inv.',  value: '$330k', color: '#fb923c' },
  { label: 'Easy Maint.',     value: '$106k', color: '#38bdf8' },
  { label: 'Deprioritise',    value: '$94k',  color: '#94a3b8' },
];

const CommandCenter: React.FC = () => {
  const [prescriptiveOpen, setPrescriptiveOpen] = useState(false);

  return (
    <div className="space-y-10">

      {/* ═══ Section 1 — System Pulse ═══ */}
      <SectionBlock
        icon={<Layers size={12} style={{ color: '#38bdf8' }} />}
        label="System Pulse"
        delay={0.05}
      >
        <div className="space-y-6">
          <TopKpiRow />
          <NarrativeSynthesis />
        </div>
      </SectionBlock>

      <hr className="section-divider" />

      {/* Intelligence Overview — HumanSystemIndex live; FinancialImpactModel + ActiveNudgesSummary still illustrative */}
      <>
        <SectionBlock
          icon={<BarChart3 size={12} style={{ color: '#34d399' }} />}
          label="Intelligence Overview"
          delay={0.1}
        >
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <HumanSystemIndex />
            <FinancialImpactModel />
            <ActiveNudgesSummary />
          </div>
        </SectionBlock>

        <hr className="section-divider" />
      </>

      {/* [HIDDEN] Strategic Action Centre — hardcoded nudge library */}
      {false && (
        <>
          <ActionCommandCentre />
          <hr className="section-divider" />
        </>
      )}

      {/* Live Signals & Vulnerability — SignalPulseStrip live; DarkMatterNetwork still illustrative */}
      <>
        <SectionBlock
          icon={<Activity size={12} style={{ color: '#38bdf8' }} />}
          label="Live Signals & Vulnerability"
          delay={0.15}
          tag="Illustrative"
        >
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-3">
              <SignalPulseStrip />
            </div>
            <div className="xl:col-span-2">
              <DarkMatterNetwork />
            </div>
          </div>
        </SectionBlock>
        <hr className="section-divider" />
      </>

      {/* Strategic Analysis — CrisisProximityIndex live; others still hardcoded */}
      <SectionBlock
        icon={<ShieldAlert size={12} style={{ color: '#f43f5e' }} />}
        label="Strategic Analysis"
        delay={0.2}
      >
        <CrisisProximityIndex />
      </SectionBlock>

      {false && (
        <div className="space-y-6">
          <SignalCorrelationMap />
          <TippingPointTimeline />
        </div>
      )}

      {/* ═══ Prescriptive Layer separator ═══ */}
      <div className="relative flex items-center gap-4 py-2">
        <div className="flex-1 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.2) 30%, rgba(167,139,250,0.4) 60%, rgba(167,139,250,0.2) 80%, transparent)',
        }} />
        <span className="shrink-0 text-[9px] font-bold tracking-widest px-3 py-1 rounded-full"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'rgba(167,139,250,0.55)',
            background: 'rgba(167,139,250,0.06)',
            border: '1px solid rgba(167,139,250,0.15)',
            letterSpacing: '0.14em',
          }}>
          PRESCRIPTIVE LAYER
        </span>
        <div className="flex-1 h-px" style={{
          background: 'linear-gradient(90deg, rgba(167,139,250,0.2) 20%, rgba(167,139,250,0.4) 40%, rgba(167,139,250,0.2) 70%, transparent)',
        }} />
      </div>

      {/* ═══ Key Prescriptive Recommendations — collapsible ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(167,139,250,0.18)',
          borderLeft: '3px solid rgba(167,139,250,0.55)',
          boxShadow: '0 2px 24px rgba(167,139,250,0.05)',
        }}
      >
        {/* ── Header / collapsed row ── */}
        <button
          onClick={() => setPrescriptiveOpen(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 cursor-pointer"
          style={{ background: 'transparent', border: 'none', textAlign: 'left' }}
        >
          {/* Left: icon + title + badge */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.22)' }}>
              <Lightbulb size={13} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm font-bold text-white"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  Key Prescriptive Recommendations
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide"
                  style={{
                    fontFamily: 'var(--font-display)',
                    background: 'rgba(251,146,60,0.1)',
                    border: '1px solid rgba(251,146,60,0.22)',
                    color: '#fb923c',
                    letterSpacing: '0.08em',
                  }}>
                  ILLUSTRATIVE MODEL
                </span>
              </div>
              <p className="text-[10px] mt-0.5 text-left"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                Strategic ROI matrix · 8 actions · $763k total recoverable
              </p>
            </div>
          </div>

          {/* Right: quadrant chips + toggle */}
          <div className="flex items-center gap-4 shrink-0 ml-6">
            {QUAD_CHIPS.map(q => (
              <div key={q.label} className="hidden xl:flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: q.color, boxShadow: `0 0 4px ${q.color}88` }} />
                <span className="text-[9px] font-semibold"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
                  {q.label}
                </span>
                <span className="text-[9px]"
                  style={{ fontFamily: 'var(--font-mono)', color: q.color }}>
                  {q.value}
                </span>
              </div>
            ))}

            <div className="w-7 h-7 rounded-lg flex items-center justify-center ml-1"
              style={{
                background: 'rgba(167,139,250,0.08)',
                border: '1px solid rgba(167,139,250,0.2)',
              }}>
              <motion.div
                animate={{ rotate: prescriptiveOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <ChevronDown size={14} style={{ color: '#a78bfa' }} />
              </motion.div>
            </div>
          </div>
        </button>

        {/* ── Expandable body ── */}
        <AnimatePresence initial={false}>
          {prescriptiveOpen && (
            <motion.div
              key="prescriptive-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ borderTop: '1px solid rgba(167,139,250,0.12)' }}>
                <StrategicMatrix />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  );
};

export default CommandCenter;
