import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, TrendingDown, Sparkles } from 'lucide-react';
import InactionCostClock from './InactionCostClock';
import VoiceSuppression from './VoiceSuppression';
import DarkEnergyReport from './DarkEnergyReport';
import TrustDecayCurve from './TrustDecayCurve';
import BurnoutByLevel from './BurnoutByLevel';
import CognitiveEconomyModel from './CognitiveEconomyModel';
import EmployerBrandHealth from './EmployerBrandHealth';
import CulturalContagionDNA from './CulturalContagionDNA';
import ShadowOrganisation from './ShadowOrganisation';

const CultureAndPerception: React.FC = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">

    {/* Voice Suppression — live data from supervisor diagnostics */}
    <VoiceSuppression />

    {/* Dark Energy Report — live systemic force analysis */}
    <DarkEnergyReport />

    {/* [HIDDEN] Trust Decay + Burnout by Level — hardcoded multi-cycle/level data */}
    {false && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TrustDecayCurve />
        <BurnoutByLevel />
      </div>
    )}

    {/* [HIDDEN] Cognitive Economy — hardcoded time allocation model */}
    {false && <CognitiveEconomyModel />}

    {/* [HIDDEN] Employer Brand Health + Cultural Contagion DNA — hardcoded brand/culture data */}
    {false && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EmployerBrandHealth />
        <CulturalContagionDNA />
      </div>
    )}

    {/* [HIDDEN] Shadow Organisation — hardcoded informal network data */}
    {false && <ShadowOrganisation />}

    {/* [HIDDEN] InactionCostClock + Cultural Contagion Signal — hardcoded NLP/cost data */}
    {false && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <InactionCostClock />

        <div className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #a78bfa', boxShadow: 'var(--shadow-md)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={13} style={{ color: '#a78bfa' }} />
              <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Cultural Contagion Signal</span>
            </div>
            <span className="badge badge-violet">NLP Detected</span>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl mb-4"
            style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.14)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.2)' }}>
              <TrendingDown size={16} style={{ color: '#f43f5e' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>+14% Resignation Language</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Operations dept · Q11 responses · last 2 cycles</p>
            </div>
            <div className="ml-auto text-right">
              <p className="data-md" style={{ color: '#f43f5e' }}>+14%</p>
              <p className="eyebrow">Δ vs prior</p>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            NLP analysis detected a{' '}
            <span className="font-semibold text-white">14% increase</span> in resignation language
            within Q11 responses from Operations. This correlates highly with the{' '}
            <span className="font-semibold" style={{ color: '#fb923c' }}>widening Perception Gap</span>
            {' '}and is a leading indicator of voluntary attrition risk within 90 days.
          </p>

          <div className="mt-4 flex items-center gap-1.5">
            <Sparkles size={10} style={{ color: '#a78bfa' }} />
            <span className="eyebrow" style={{ color: '#a78bfa' }}>Top detected phrases</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['"not recognised"', '"looking elsewhere"', '"no growth path"', '"disconnected"'].map(p => (
              <span key={p} className="text-[9px] px-2 py-1 rounded-md"
                style={{ fontFamily: 'var(--font-mono)', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.18)', color: '#c4b5fd' }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    )}

  </motion.div>
);

export default CultureAndPerception;
