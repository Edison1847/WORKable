import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

// ── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  black:        '#050510',
  navy:         '#0d1117',
  charcoal:     '#1c2333',
  gray800:      '#1f2937',
  gray700:      '#374151',
  gray600:      '#4b5563',
  gray500:      '#6b7280',
  gray400:      '#9ca3af',
  gray300:      '#d1d5db',
  gray200:      '#e5e7eb',
  gray100:      '#f3f4f6',
  gray50:       '#f9fafb',
  white:        '#ffffff',
  sky:          '#0ea5e9',
  skyDark:      '#0284c7',
  skyLight:     '#e0f2fe',
  violet:       '#7c3aed',
  violetLight:  '#ede9fe',
  green:        '#059669',
  greenLight:   '#d1fae5',
  red:          '#dc2626',
  redLight:     '#fee2e2',
  amber:        '#d97706',
  amberLight:   '#fef3c7',
  orange:       '#ea580c',
  orangeLight:  '#ffedd5',
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // ── Page layouts ──
  coverPage: {
    backgroundColor: C.black,
    paddingTop: 0, paddingBottom: 0, paddingHorizontal: 0,
    flexDirection: 'column',
  },
  page: {
    backgroundColor: C.white,
    paddingTop: 56,
    paddingBottom: 60,
    paddingHorizontal: 50,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.gray800,
    flexDirection: 'column',
  },

  // ── Cover elements ──
  coverTopStripe: { height: 10, backgroundColor: C.sky },
  coverContent: { flex: 1, paddingHorizontal: 56, paddingTop: 60, paddingBottom: 50, flexDirection: 'column' },
  coverEyebrow: { fontFamily: 'Helvetica', fontSize: 9, color: C.sky, letterSpacing: 3, marginBottom: 16 },
  coverWordmark: { fontFamily: 'Helvetica-Bold', fontSize: 52, color: C.white, letterSpacing: -1, lineHeight: 1 },
  coverWordmarkAccent: { fontFamily: 'Helvetica-Bold', fontSize: 52, color: C.sky },
  coverSubtitle: { fontFamily: 'Helvetica-Bold', fontSize: 20, color: C.sky, marginTop: 12, letterSpacing: 0.5 },
  coverMeta: { fontFamily: 'Helvetica', fontSize: 9.5, color: C.gray400, marginTop: 8 },
  coverDivider: { height: 1, backgroundColor: C.charcoal, marginTop: 36, marginBottom: 36 },
  coverStatsRow: { flexDirection: 'row', marginTop: 0 },
  coverStatBox: { flex: 1, marginRight: 12, backgroundColor: C.charcoal, padding: 16, borderRadius: 6 },
  coverStatBoxLast: { flex: 1, backgroundColor: C.charcoal, padding: 16, borderRadius: 6 },
  coverStatLabel: { fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray400, letterSpacing: 1, marginBottom: 6 },
  coverStatValue: { fontFamily: 'Helvetica-Bold', fontSize: 22, color: C.white },
  coverStatUnit: { fontFamily: 'Helvetica', fontSize: 9, color: C.gray500, marginTop: 2 },
  coverBottomStripe: { height: 8, backgroundColor: C.violet },
  coverConfidential: { paddingHorizontal: 56, paddingTop: 16, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between' },
  coverConfText: { fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray600 },

  // ── Fixed header/footer ──
  fixedHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 36,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 50, paddingTop: 12,
    borderBottomWidth: 1, borderBottomColor: C.gray200, borderBottomStyle: 'solid',
  },
  fixedHeaderLeft: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: C.sky, letterSpacing: 1 },
  fixedHeaderRight: { fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray400 },
  fixedFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 50, paddingBottom: 12,
    borderTopWidth: 1, borderTopColor: C.gray200, borderTopStyle: 'solid',
  },
  fixedFooterLeft: { fontFamily: 'Helvetica', fontSize: 7, color: C.gray400 },
  fixedFooterRight: { fontFamily: 'Helvetica', fontSize: 7, color: C.gray400 },

  // ── Section header ──
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  sectionHeaderBar: { width: 4, marginRight: 12, borderRadius: 2 },
  sectionHeaderText: { flex: 1 },
  sectionNum: { fontFamily: 'Helvetica', fontSize: 8, color: C.gray400, letterSpacing: 1, marginBottom: 4 },
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 16, color: C.gray800, lineHeight: 1.2 },
  sectionSub: { fontFamily: 'Helvetica', fontSize: 8.5, color: C.gray500, marginTop: 3 },

  // ── Typography ──
  h3: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.gray800, marginBottom: 8 },
  body: { fontFamily: 'Helvetica', fontSize: 9, color: C.gray700, lineHeight: 1.5 },
  bodyBold: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.gray800 },
  caption: { fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray500 },
  captionBold: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: C.gray600 },
  label: { fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray500, letterSpacing: 0.8 },

  // ── Layout ──
  row: { flexDirection: 'row' },
  col2: { flex: 1, marginRight: 12 },
  col2Last: { flex: 1 },
  spacer4:  { height: 4 },
  spacer8:  { height: 8 },
  spacer12: { height: 12 },
  spacer16: { height: 16 },
  spacer24: { height: 24 },
  divider: { height: 1, backgroundColor: C.gray200, marginVertical: 12 },

  // ── Cards / boxes ──
  metricRow: { flexDirection: 'row', marginBottom: 16 },
  metricCard: { flex: 1, borderRadius: 6, padding: 12, marginRight: 10 },
  metricCardLast: { flex: 1, borderRadius: 6, padding: 12 },
  metricCardLabel: { fontFamily: 'Helvetica', fontSize: 7, color: C.gray500, letterSpacing: 0.8, marginBottom: 4 },
  metricCardValue: { fontFamily: 'Helvetica-Bold', fontSize: 20, lineHeight: 1 },
  metricCardSub: { fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray500, marginTop: 3 },

  infoBox: { borderRadius: 6, padding: 12, marginBottom: 10 },
  infoBoxTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 4 },
  infoBoxBody: { fontFamily: 'Helvetica', fontSize: 8.5, lineHeight: 1.5, color: C.gray700 },

  // ── Tables ──
  tableHeader: { flexDirection: 'row', backgroundColor: C.gray800, padding: '7 10', borderRadius: 4, marginBottom: 2 },
  tableHeaderCell: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: C.white, flex: 1 },
  tableRow: { flexDirection: 'row', padding: '7 10', borderBottomWidth: 1, borderBottomColor: C.gray200, borderBottomStyle: 'solid' },
  tableRowAlt: { flexDirection: 'row', padding: '7 10', backgroundColor: C.gray50, borderBottomWidth: 1, borderBottomColor: C.gray200, borderBottomStyle: 'solid' },
  tableCell: { fontFamily: 'Helvetica', fontSize: 8, color: C.gray700, flex: 1 },
  tableCellBold: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.gray800, flex: 1 },
  tableCellRed: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.red, flex: 1 },
  tableCellGreen: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.green, flex: 1 },
  tableCellAmber: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.amber, flex: 1 },

  // ── Urgency bands ──
  bandHeader: { flexDirection: 'row', alignItems: 'center', padding: '8 12', marginBottom: 4 },
  bandDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  bandTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9.5 },
  bandRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.gray200, borderBottomStyle: 'solid' },
  bandArrow: { fontFamily: 'Helvetica', fontSize: 8, color: C.gray400, marginRight: 8, marginTop: 1 },
  bandAction: { flex: 2.5, fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.gray800 },
  bandDept: { flex: 1.2, fontFamily: 'Helvetica', fontSize: 8, color: C.gray600 },
  bandValue: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 8, textAlign: 'right' },
  bandConf: { flex: 0.8, fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray500, textAlign: 'right' },

  // ── Roadmap columns ──
  roadmapCol: { flex: 1, marginRight: 10, borderRadius: 6, overflow: 'hidden' },
  roadmapColLast: { flex: 1, borderRadius: 6, overflow: 'hidden' },
  roadmapColHeader: { padding: '10 12', },
  roadmapColPhase: { fontFamily: 'Helvetica', fontSize: 7, letterSpacing: 1, color: C.white, marginBottom: 3 },
  roadmapColTitle: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.white },
  roadmapColBody: { padding: '10 12', flex: 1 },
  roadmapItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 7 },
  roadmapBullet: { width: 5, height: 5, borderRadius: 2.5, marginRight: 7, marginTop: 2 },
  roadmapItemText: { fontFamily: 'Helvetica', fontSize: 8, color: C.gray700, flex: 1, lineHeight: 1.4 },
  roadmapItemBold: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.gray800 },
  roadmapValue: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.green, textAlign: 'right' },

  // ── Narrative (pre-mortem) ──
  timelineRow: { flexDirection: 'row', marginBottom: 10 },
  timelineLine: { width: 2, marginRight: 12, borderRadius: 1 },
  timelineMonth: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.gray600, width: 52 },
  timelineBody: { flex: 1, fontFamily: 'Helvetica', fontSize: 8.5, color: C.gray700, lineHeight: 1.5 },
  timelineBodyAlert: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 8.5, lineHeight: 1.5 },

  // ── Executive summary signals ──
  signalRow: { flexDirection: 'row', alignItems: 'center', padding: '7 0', borderBottomWidth: 1, borderBottomColor: C.gray200, borderBottomStyle: 'solid' },
  signalLabel: { flex: 2.5, fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: C.gray800 },
  signalScore: { flex: 0.6, fontFamily: 'Helvetica-Bold', fontSize: 10, textAlign: 'center' },
  signalTrack: { flex: 3, height: 5, backgroundColor: C.gray200, borderRadius: 2.5, marginHorizontal: 8 },
  signalFill: { height: 5, borderRadius: 2.5 },
  signalTrend: { flex: 0.8, fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray500, textAlign: 'right' },
});

// ── Reusable primitives ───────────────────────────────────────────────────────

const PageHeader: React.FC = () => (
  <View style={S.fixedHeader} fixed>
    <Text style={S.fixedHeaderLeft}>WORKable · EXECUTIVE ACTION PLAN</Text>
    <Text style={S.fixedHeaderRight}>Audit Cycle 6 · March 2026 · Strictly Confidential</Text>
  </View>
);

const PageFooter: React.FC = () => (
  <View style={S.fixedFooter} fixed>
    <Text style={S.fixedFooterLeft}>Innovation Quotient (Pvt) Ltd  ·  WORKable Intelligence Platform  ·  Blueprint v5</Text>
    <Text style={S.fixedFooterRight} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
  </View>
);

interface SectionHeaderProps { num: string; title: string; sub: string; color: string }
const SectionHeader: React.FC<SectionHeaderProps> = ({ num, title, sub, color }) => (
  <View style={S.sectionHeader}>
    <View style={[S.sectionHeaderBar, { height: 44, backgroundColor: color }]} />
    <View style={S.sectionHeaderText}>
      <Text style={S.sectionNum}>SECTION {num}</Text>
      <Text style={S.sectionTitle}>{title}</Text>
      {sub ? <Text style={S.sectionSub}>{sub}</Text> : null}
    </View>
  </View>
);

interface InfoBoxProps { title: string; body: string; color: string; bgColor: string }
const InfoBox: React.FC<InfoBoxProps> = ({ title, body, color, bgColor }) => (
  <View style={[S.infoBox, { backgroundColor: bgColor, borderLeftWidth: 3, borderLeftColor: color, borderLeftStyle: 'solid' }]}>
    <Text style={[S.infoBoxTitle, { color }]}>{title}</Text>
    <Text style={S.infoBoxBody}>{body}</Text>
  </View>
);

// ── Cover Page ────────────────────────────────────────────────────────────────
const CoverPage: React.FC = () => (
  <Page size="A4" style={S.coverPage}>
    <View style={S.coverTopStripe} />
    <View style={S.coverContent}>
      <Text style={S.coverEyebrow}>WORKABLE INTELLIGENCE PLATFORM</Text>
      <Text style={S.coverWordmark}>
        <Text style={S.coverWordmarkAccent}>WORK</Text>
        <Text>able</Text>
      </Text>
      <Text style={S.coverSubtitle}>Executive Action Plan</Text>
      <Text style={S.coverMeta}>Audit Cycle 6  ·  March 2026  ·  CEO + COO Distribution Only</Text>

      <View style={S.coverDivider} />

      <Text style={{ fontFamily: 'Helvetica', fontSize: 9, color: C.gray400, marginBottom: 16 }}>
        This document contains 13 sections and 47 prioritised recommendations generated from Cycle 6 signal analysis.
        Total recoverable value identified: $2.4M across 6 departments. This plan supersedes all prior cycle recommendations.
      </Text>

      <View style={S.coverStatsRow}>
        {[
          { label: 'TOTAL RECOVERABLE VALUE', value: '$2.4M', unit: 'across 47 recommendations' },
          { label: 'HUMAN SYSTEM INDEX', value: '61/100', unit: '▼ −4.2 this cycle' },
          { label: 'CRISIS PROXIMITY INDEX', value: '48', unit: '⚠ Elevated — threshold: 60' },
          { label: 'INACTION COST (PRIOR CYCLE)', value: '$830K', unit: 'Cost of dismissed nudges' },
        ].map((stat, i) => (
          <View key={i} style={i < 3 ? S.coverStatBox : S.coverStatBoxLast}>
            <Text style={S.coverStatLabel}>{stat.label}</Text>
            <Text style={S.coverStatValue}>{stat.value}</Text>
            <Text style={S.coverStatUnit}>{stat.unit}</Text>
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ flexDirection: 'row', marginTop: 40 }}>
        <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: C.charcoal, borderTopStyle: 'solid', paddingTop: 12 }}>
          <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray600 }}>Prepared for</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.gray300, marginTop: 2 }}>Chief Executive Officer + Chief Operating Officer</Text>
        </View>
        <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: C.charcoal, borderTopStyle: 'solid', paddingTop: 12, paddingLeft: 20 }}>
          <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray600 }}>Generated by</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.gray300, marginTop: 2 }}>WORKable Intelligence Platform · Blueprint v5.0</Text>
        </View>
      </View>
    </View>
    <View style={S.coverBottomStripe} />
    <View style={S.coverConfidential}>
      <Text style={S.coverConfText}>STRICTLY CONFIDENTIAL — Not for distribution beyond executive leadership</Text>
      <Text style={S.coverConfText}>© Innovation Quotient (Pvt) Ltd · WORKable · March 2026</Text>
    </View>
  </Page>
);

// ── Executive Summary ─────────────────────────────────────────────────────────
const ExecSummaryPage: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="" title="Executive Summary" sub="Current state of the human system · Cycle 6 signal reading" color={C.sky} />

    <View style={S.metricRow}>
      {[
        { label: 'HSI SCORE',          value: '61',   unit: '/100 · Declining', color: C.amber,  bg: C.amberLight },
        { label: 'CRISIS PROXIMITY',   value: '48',   unit: '/100 · Elevated',  color: C.orange, bg: C.orangeLight },
        { label: 'BURNOUT RISK',        value: '41%',  unit: 'Frontline: 67%',  color: C.red,    bg: C.redLight },
        { label: 'WASTED SALARY',       value: '14.2%',unit: '$1.9M/yr',        color: C.green,  bg: C.greenLight },
      ].map((m, i) => (
        <View key={i} style={i < 3 ? [S.metricCard, { backgroundColor: m.bg }] : [S.metricCardLast, { backgroundColor: m.bg }]}>
          <Text style={S.metricCardLabel}>{m.label}</Text>
          <Text style={[S.metricCardValue, { color: m.color }]}>{m.value}</Text>
          <Text style={S.metricCardSub}>{m.unit}</Text>
        </View>
      ))}
    </View>

    <Text style={S.h3}>5 Direct Signal Readings</Text>
    {[
      { label: 'Time Allocation (HC-EFF-002)',     score: 38, optimal: 70, trend: '▼ −6pp', color: C.red,    status: 'Critical — 38% on valuable work' },
      { label: 'Perceived Value',                  score: 52, optimal: 75, trend: '▼ −4pp', color: C.amber,  status: 'Below target — value misalignment detected' },
      { label: 'Motivation (HC-WEL-001)',          score: 61, optimal: 80, trend: '▼ −3pp', color: C.amber,  status: 'Declining — energy drain in Operations' },
      { label: 'Control & Accountability (Q7+Q8)', score: 74, optimal: 80, trend: '→ stable', color: C.green, status: 'Adequate — slight oversight excess flagged' },
      { label: 'Friction Load (Q9)',               score: 29, optimal: 85, trend: '▼ −8pp', color: C.red,    status: 'High friction — systemic blockers present' },
    ].map((sig, i) => (
      <View key={i} style={S.signalRow}>
        <Text style={S.signalLabel}>{sig.label}</Text>
        <Text style={[S.signalScore, { color: sig.color }]}>{sig.score}</Text>
        <View style={S.signalTrack}>
          <View style={[S.signalFill, { width: `${sig.score}%`, backgroundColor: sig.color }]} />
        </View>
        <Text style={S.signalTrend}>{sig.trend}</Text>
      </View>
    ))}

    <View style={S.spacer16} />
    <Text style={S.h3}>Strategic Assessment</Text>
    <Text style={[S.body, { marginBottom: 10 }]}>
      Cycle 6 signals confirm a pattern of compounding dysfunction driven by three reinforcing forces: structural
      friction in Operations is consuming 24% of total cognitive capacity; frontline burnout has doubled since Cycle 4
      and is spreading via cultural contagion from a high-intensity FinTech hire cohort; and the perception gap between
      management and teams has widened to 31 points — a level associated with breakdown in execution fidelity.
    </Text>
    <Text style={S.body}>
      Left unaddressed, the Crisis Proximity Index crosses the critical threshold of 60 within 47 days. The 47
      recommendations in this plan, if executed in sequence, recover an estimated $2.4M in wasted salary, reduce the
      CPI to below 35, and extend the organisation's biological age advantage by 2.9 years.
    </Text>

    <View style={S.spacer16} />
    <View style={{ flexDirection: 'row' }}>
      <InfoBox
        title="Primary Risk Vector"
        body="Frontline burnout at 67% (+19pp above industry). If senescence burden continues doubling each cycle, operational capacity loss reaches critical in 2 cycles. Immediate intervention in top 3 friction sources is the highest-ROI action available."
        color={C.red} bgColor={C.redLight} />
    </View>
  </Page>
);

// ── Section 1: Counterfactual History ─────────────────────────────────────────
const Section1Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="01" title="Counterfactual History" sub="What inaction already cost — financial record of dismissed Cycle 5 recommendations" color={C.red} />

    <Text style={[S.body, { marginBottom: 12 }]}>
      Four recommendations were dismissed or deprioritised in Cycle 5. The table below records what was recommended,
      the confidence level at the time of dismissal, what subsequently occurred, and the estimated financial cost of
      not acting. This record changes the psychological frame for every recommendation that follows in this plan.
    </Text>

    <View style={S.tableHeader}>
      {['Dismissed Recommendation', 'Cycle', 'Confidence', 'What Happened', 'Cost of Inaction'].map((h, i) => (
        <Text key={i} style={[S.tableHeaderCell, i === 0 ? { flex: 2 } : i === 3 ? { flex: 2 } : {}]}>{h}</Text>
      ))}
    </View>
    {[
      { rec: 'Engineer Process Redesign — Operations workflow overhaul', cycle: 'C5', conf: '81%', happened: 'Frontline attrition +7%. 3 senior departures.', cost: '−$390,000' },
      { rec: 'Operations Friction Elimination — Remove top 3 blockers', cycle: 'C5', conf: '74%', happened: 'Burnout index +11pp. Sick leave +18%.', cost: '−$280,000' },
      { rec: 'Manager Blind-Spot Coaching (2 managers identified)', cycle: 'C4', conf: '69%', happened: 'Perception gap widened from 17pt to 31pt.', cost: '−$160,000' },
      { rec: 'Cognitive Load Reduction — Meeting elimination', cycle: 'C5', conf: '88%', happened: 'Meeting hours unchanged. Productivity declined 6%.', cost: '−$0 direct\n+$190K opportunity', },
    ].map((r, i) => (
      <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
        <Text style={[S.tableCell, { flex: 2 }]}>{r.rec}</Text>
        <Text style={S.tableCell}>{r.cycle}</Text>
        <Text style={[S.tableCell, { color: C.amber }]}>{r.conf}</Text>
        <Text style={[S.tableCell, { flex: 2 }]}>{r.happened}</Text>
        <Text style={S.tableCellRed}>{r.cost}</Text>
      </View>
    ))}
    <View style={{ flexDirection: 'row', padding: '10 10', backgroundColor: C.gray800, marginTop: 2, borderRadius: 4 }}>
      <Text style={[S.tableCellBold, { flex: 2, color: C.white }]}>Total Compounding Leakage — Cycle 5 Inaction</Text>
      <Text style={S.tableCell}></Text>
      <Text style={S.tableCell}></Text>
      <Text style={[S.tableCell, { flex: 2 }]}></Text>
      <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 12, color: C.red }}>−$830,000</Text>
    </View>

    <View style={S.spacer16} />
    <InfoBox
      title="The Compounding Effect"
      body="Each cycle of inaction increases intervention cost by approximately 1.4×. The $830K realised loss in Cycle 5 was avoidable at a total implementation cost of under $12,000. The same signals firing today carry a forward cost of $2.4M if dismissed again. This document exists to prevent a second compounding cycle."
      color={C.red} bgColor={C.redLight} />

    <View style={S.spacer12} />
    <InfoBox
      title="How to Read This Plan"
      body="Every recommendation that follows carries a confidence score derived from the Intervention Genome — the accumulated outcomes of similar interventions in similar contexts. High confidence (≥75%) means this pattern has been validated across multiple comparable organisations. Act-Now items should be initiated within 7 days of this report being received."
      color={C.sky} bgColor={C.skyLight} />
  </Page>
);

// ── Section 2: Action Priority Matrix ────────────────────────────────────────
const Section2Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="02" title="Action Priority Matrix" sub="Strategic board categorisation — Cost-to-Implement vs Value-Recovered" color={C.violet} />

    <Text style={[S.body, { marginBottom: 16 }]}>
      The 2×2 matrix below categorises all 47 recommendations by implementation cost and recoverable value.
      Quadrant placement drives sequencing: Quick Wins first (maximum ROI at minimum cost),
      followed by Strategic Investments, with Deprioritise items held for Phase 3 review.
    </Text>

    {/* 2x2 matrix */}
    <View style={{ flexDirection: 'row', height: 260 }}>
      {/* Y-axis label */}
      <View style={{ width: 16, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Helvetica', fontSize: 7, color: C.gray500, transform: 'rotate(-90deg)' }}>VALUE RECOVERED →</Text>
      </View>
      <View style={{ flex: 1 }}>
        {/* Top row */}
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Quick Wins */}
          <View style={{ flex: 1, backgroundColor: C.greenLight, borderWidth: 1, borderColor: C.green, borderStyle: 'solid', padding: 12, marginRight: 4, marginBottom: 4, borderRadius: 4 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.green, marginBottom: 6 }}>⚡ QUICK WINS</Text>
            <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray600, marginBottom: 8 }}>High Value · Low Cost</Text>
            {['Meeting elimination — $52K', 'Recovery buffer policy — $0', 'Role clarity — 12 roles — $0', 'Friction removal (top 2) — $120K'].map((t, i) => (
              <Text key={i} style={{ fontFamily: 'Helvetica', fontSize: 8, color: C.gray700, marginBottom: 3 }}>▸ {t}</Text>
            ))}
          </View>
          {/* Strategic Investments */}
          <View style={{ flex: 1, backgroundColor: C.skyLight, borderWidth: 1, borderColor: C.sky, borderStyle: 'solid', padding: 12, marginLeft: 4, marginBottom: 4, borderRadius: 4 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.skyDark, marginBottom: 6 }}>🎯 STRATEGIC INVESTMENTS</Text>
            <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray600, marginBottom: 8 }}>High Value · Higher Cost</Text>
            {['Process redesign — Engineering — $148K', 'Senior Dev reallocation — $210K', 'PM capacity reallocation — $185K', 'Automation programme — $94K'].map((t, i) => (
              <Text key={i} style={{ fontFamily: 'Helvetica', fontSize: 8, color: C.gray700, marginBottom: 3 }}>▸ {t}</Text>
            ))}
          </View>
        </View>
        {/* Bottom row */}
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Deprioritise */}
          <View style={{ flex: 1, backgroundColor: C.gray50, borderWidth: 1, borderColor: C.gray300, borderStyle: 'solid', padding: 12, marginRight: 4, marginTop: 4, borderRadius: 4 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.gray600, marginBottom: 6 }}>↓ DEPRIORITISE</Text>
            <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray500, marginBottom: 8 }}>Low Value · Low Cost</Text>
            {['Reporting format update', 'Onboarding deck revision', 'Desk policy update'].map((t, i) => (
              <Text key={i} style={{ fontFamily: 'Helvetica', fontSize: 8, color: C.gray500, marginBottom: 3 }}>▸ {t}</Text>
            ))}
          </View>
          {/* Monitor */}
          <View style={{ flex: 1, backgroundColor: C.amberLight, borderWidth: 1, borderColor: C.amber, borderStyle: 'solid', padding: 12, marginLeft: 4, marginTop: 4, borderRadius: 4 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.amber, marginBottom: 6 }}>⏱ MONITOR</Text>
            <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray600, marginBottom: 8 }}>Low Value · High Cost</Text>
            {['3D digital twin build-out', 'Custom LLM fine-tuning', 'HRIS deep integration'].map((t, i) => (
              <Text key={i} style={{ fontFamily: 'Helvetica', fontSize: 8, color: C.gray700, marginBottom: 3 }}>▸ {t}</Text>
            ))}
          </View>
        </View>
        {/* X axis label */}
        <Text style={{ fontFamily: 'Helvetica', fontSize: 7, color: C.gray500, textAlign: 'center', marginTop: 6 }}>← IMPLEMENTATION COST →</Text>
      </View>
    </View>
  </Page>
);

// ── Section 3: Action Command Centre ──────────────────────────────────────────
const Section3Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="03" title="Action Command Centre" sub="All 47 recommendations · 4 urgency bands · Confidence-weighted and financially quantified" color={C.red} />

    {/* Band 1: Act Now — Redesign */}
    <View style={[S.bandHeader, { backgroundColor: C.redLight }]}>
      <View style={[S.bandDot, { backgroundColor: C.red }]} />
      <Text style={[S.bandTitle, { color: C.red }]}>ACT NOW — REDESIGN</Text>
      <Text style={{ fontFamily: 'Helvetica', fontSize: 8, color: C.gray500, marginLeft: 8 }}>Initiate within 7 days</Text>
    </View>
    <View style={S.tableHeader}>
      {['Recommendation', 'Dept', 'Value', 'Confidence', 'Time-to-Impact'].map((h, i) => (
        <Text key={i} style={[S.tableHeaderCell, i === 0 ? { flex: 2.5 } : {}]}>{h}</Text>
      ))}
    </View>
    {[
      { rec: 'Over-Engineered Workflows — Simplify approval chains from 5 to 2 steps', dept: 'Engineering', value: '$148K', conf: '84%', time: '3–4 weeks' },
      { rec: 'High Time–Low Value Activities — Eliminate 6 identified activities', dept: 'Operations', value: '$120K', conf: '81%', time: '2–3 weeks' },
      { rec: 'Meeting Architecture — Eliminate 4 recurring all-hands, replace with digest', dept: 'All Depts', value: '$52K', conf: '88%', time: '1 week' },
    ].map((r, i) => (
      <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
        <Text style={[S.tableCell, { flex: 2.5 }]}>{r.rec}</Text>
        <Text style={S.tableCell}>{r.dept}</Text>
        <Text style={S.tableCellGreen}>{r.value}</Text>
        <Text style={[S.tableCell, { color: C.amber }]}>{r.conf}</Text>
        <Text style={S.tableCell}>{r.time}</Text>
      </View>
    ))}

    <View style={S.spacer12} />

    {/* Band 2: Act Now — Reallocate */}
    <View style={[S.bandHeader, { backgroundColor: C.orangeLight }]}>
      <View style={[S.bandDot, { backgroundColor: C.orange }]} />
      <Text style={[S.bandTitle, { color: C.orange }]}>ACT NOW — REALLOCATE</Text>
      <Text style={{ fontFamily: 'Helvetica', fontSize: 8, color: C.gray500, marginLeft: 8 }}>Initiate within 14 days</Text>
    </View>
    {[
      { rec: 'Senior Developer capacity → Product innovation pipeline', dept: 'Engineering', value: '$210K', conf: '79%', time: '4–6 weeks' },
      { rec: 'Product Manager capacity → Direct customer-facing work', dept: 'Product', value: '$185K', conf: '76%', time: '4–6 weeks' },
      { rec: 'Finance analyst → Strategic modelling (currently in admin)', dept: 'Finance', value: '$67K', conf: '71%', time: '2–3 weeks' },
    ].map((r, i) => (
      <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
        <Text style={[S.tableCell, { flex: 2.5 }]}>{r.rec}</Text>
        <Text style={S.tableCell}>{r.dept}</Text>
        <Text style={S.tableCellGreen}>{r.value}</Text>
        <Text style={[S.tableCell, { color: C.amber }]}>{r.conf}</Text>
        <Text style={S.tableCell}>{r.time}</Text>
      </View>
    ))}

    <View style={S.spacer12} />

    {/* Band 3: Plan This Quarter */}
    <View style={[S.bandHeader, { backgroundColor: C.skyLight }]}>
      <View style={[S.bandDot, { backgroundColor: C.sky }]} />
      <Text style={[S.bandTitle, { color: C.skyDark }]}>PLAN THIS QUARTER — AUTOMATE / ELIMINATE / RE-SCOPE</Text>
    </View>
    {[
      { rec: 'Automate report generation — 3 recurring manual reports', dept: 'Finance / Ops', value: '$94K', conf: '77%', time: '6–8 weeks' },
      { rec: 'Eliminate 2 redundant review cycles — Product approval loop', dept: 'Product', value: '$38K', conf: '82%', time: '2 weeks' },
      { rec: 'Re-scope 4 roles with activity–skill mismatch identified', dept: 'Engineering', value: '$110K', conf: '68%', time: '8–10 weeks' },
    ].map((r, i) => (
      <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
        <Text style={[S.tableCell, { flex: 2.5 }]}>{r.rec}</Text>
        <Text style={S.tableCell}>{r.dept}</Text>
        <Text style={S.tableCellGreen}>{r.value}</Text>
        <Text style={[S.tableCell, { color: C.amber }]}>{r.conf}</Text>
        <Text style={S.tableCell}>{r.time}</Text>
      </View>
    ))}

    <View style={S.spacer12} />

    {/* Band 4: People Actions */}
    <View style={[S.bandHeader, { backgroundColor: C.violetLight }]}>
      <View style={[S.bandDot, { backgroundColor: C.violet }]} />
      <Text style={[S.bandTitle, { color: C.violet }]}>PEOPLE ACTIONS — CLARIFY / SUPPORT / COACH</Text>
    </View>
    {[
      { rec: 'Clarify success definitions — 12 roles with ambiguous KPIs identified', dept: 'All Depts', value: '$0 cost', conf: '91%', time: '2 weeks' },
      { rec: 'Support — 3 individuals at burnout threshold. Recovery plan required.', dept: 'Operations', value: 'Risk mitigation', conf: '87%', time: 'Immediate' },
      { rec: 'Coach/Review — 2 managers with blind-spot scores >40pts', dept: 'Operations / Eng', value: '+4% team signal', conf: '73%', time: '4–8 weeks' },
      { rec: 'Recovery buffer policy — 20% protected deep-work time enforced', dept: 'All Depts', value: '$0 cost', conf: '85%', time: '1 week' },
    ].map((r, i) => (
      <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
        <Text style={[S.tableCell, { flex: 2.5 }]}>{r.rec}</Text>
        <Text style={S.tableCell}>{r.dept}</Text>
        <Text style={[S.tableCell, { color: C.violet }]}>{r.value}</Text>
        <Text style={[S.tableCell, { color: C.amber }]}>{r.conf}</Text>
        <Text style={S.tableCell}>{r.time}</Text>
      </View>
    ))}
  </Page>
);

// ── Section 4: Signal-to-Action Trace ─────────────────────────────────────────
const Section4Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="04" title="Signal-to-Action Trace" sub="Every recommendation is traceable to its exact signal chain — making WORKable's reasoning visible and credible" color={C.sky} />

    <Text style={[S.body, { marginBottom: 16 }]}>
      Each action below shows the complete chain from raw diagnostic signal through the reveal engine to the
      financial recommendation. This transparency is the foundation of WORKable's credibility —
      every number has a traceable origin.
    </Text>

    {[
      {
        signal: 'Time Allocation (Q3: 38%)',
        reveal: 'High Time–Low Value detected in Operations',
        action: 'Eliminate recommendation — remove 6 low-value activities',
        financial: '$120K recoverable/yr',
        chainColor: C.red,
      },
      {
        signal: 'Motivation (Q4: 61%) + Friction (Q9: critical)',
        reveal: 'Burnout Risk Cluster — 3 individuals at threshold',
        action: 'Support — immediate recovery intervention required',
        financial: 'Risk mitigation — estimated $280K replacement avoided',
        chainColor: C.orange,
      },
      {
        signal: 'Control (Q7+Q8: 74%) + Supervisor–Worker gap: 31pts',
        reveal: 'Perception Gap — Misalignment reveal triggered',
        action: 'Clarify — success definition sessions for 12 ambiguous roles',
        financial: '$0 cost · +14pts expected perception recovery',
        chainColor: C.amber,
      },
      {
        signal: 'Time (Q3) + Value (Q2: 52%) — Senior Developer cohort',
        reveal: 'Underutilisation — Signal fingerprint match to higher-value role',
        action: 'Reallocate — Senior Dev capacity to innovation pipeline',
        financial: '$210K value unlocked · Payback: immediate',
        chainColor: C.sky,
      },
      {
        signal: 'Friction (Q9: high) + Cognitive load (Q12: 31% meetings)',
        reveal: 'Over-Engineered Workflow — 5-step approval where 2 suffice',
        action: 'Redesign — Engineering approval chain simplification',
        financial: '$148K/yr · Implementation cost: <$5K',
        chainColor: C.violet,
      },
      {
        signal: 'Value (Q2) + Energy (Q4) — Finance analyst cohort',
        reveal: 'Activity–Skill Mismatch — analyst capability underutilised in admin',
        action: 'Reallocate — Move to strategic modelling function',
        financial: '$67K value unlocked · Transition: 2 weeks',
        chainColor: C.green,
      },
    ].map((trace, i) => (
      <View key={i} style={{ marginBottom: 10, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: C.gray200, borderStyle: 'solid' }}>
        <View style={{ backgroundColor: trace.chainColor, padding: '6 12', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.white }}>TRACE {i + 1}</Text>
        </View>
        <View style={{ padding: '10 12', backgroundColor: C.gray50 }}>
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: C.gray500, width: 60 }}>SIGNAL</Text>
            <Text style={{ fontFamily: 'Helvetica', fontSize: 8.5, color: C.gray800, flex: 1 }}>{trace.signal}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: C.gray500, width: 60 }}>REVEAL</Text>
            <Text style={{ fontFamily: 'Helvetica', fontSize: 8.5, color: C.gray700, flex: 1 }}>{trace.reveal}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: C.gray500, width: 60 }}>ACTION</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: C.gray800, flex: 1 }}>{trace.action}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: C.gray500, width: 60 }}>VALUE</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: C.green, flex: 1 }}>{trace.financial}</Text>
          </View>
        </View>
      </View>
    ))}
  </Page>
);

// ── Section 5: 30-60-90 Day Roadmap ───────────────────────────────────────────
const Section5Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="05" title="30-60-90 Day Sequenced Roadmap" sub="Dependency-locked phases · Phase 2 cannot start until Phase 1 gate is cleared" color={C.green} />

    <Text style={[S.body, { marginBottom: 16 }]}>
      The roadmap is sequenced to maximise early momentum and minimise organisational disruption.
      Phase 1 stops the financial bleed with zero-cost immediate actions. Phase 2 fixes structural foundations.
      Phase 3 unlocks the full value upside. Dependency locks are enforced — do not begin Phase 2 items
      before Phase 1 gate conditions are met.
    </Text>

    <View style={{ flexDirection: 'row', flex: 1 }}>
      {[
        {
          phase: 'PHASE 1', label: '0–30 Days', title: 'Stop the Bleed',
          color: C.red, bg: '#fef2f2',
          items: [
            { action: 'Eliminate 4 recurring all-hands meetings', owner: 'COO', dep: 'None', value: '$52K' },
            { action: 'Implement 20% protected deep-work time policy', owner: 'All Managers', dep: 'None', value: '$0 cost' },
            { action: 'Immediate support for 3 burnout-threshold individuals', owner: 'HR Director', dep: 'None', value: 'Risk mitigation' },
            { action: 'Clarify KPIs for 12 roles with ambiguous success criteria', owner: 'Dept Heads', dep: 'None', value: '$0 cost' },
            { action: 'Freeze all non-critical approval steps in Engineering', owner: 'CTO', dep: 'None', value: 'Immediate' },
          ],
          gate: 'Gate: CPI stabilised below 55 · Burnout-threshold individuals have recovery plan in place',
        },
        {
          phase: 'PHASE 2', label: '30–60 Days', title: 'Fix Foundations',
          color: C.amber, bg: '#fffbeb',
          items: [
            { action: 'Engineering approval chain redesign: 5 → 2 steps', owner: 'CTO', dep: 'Phase 1 gate', value: '$148K' },
            { action: 'Operations friction elimination — top 3 blockers', owner: 'COO', dep: 'Phase 1 gate', value: '$120K' },
            { action: 'Manager blind-spot coaching — 2 identified managers', owner: 'HR Director', dep: 'Phase 1 gate', value: '+4% signal' },
            { action: 'Redundant review cycle elimination — Product', owner: 'VP Product', dep: 'Phase 1 gate', value: '$38K' },
            { action: 'Finance analyst role re-scope to strategic modelling', owner: 'CFO', dep: 'Phase 1 gate', value: '$67K' },
          ],
          gate: 'Gate: Friction score improved >15pts · Perception gap reduction initiated in target departments',
        },
        {
          phase: 'PHASE 3', label: '60–90 Days', title: 'Unlock the Upside',
          color: C.green, bg: '#f0fdf4',
          items: [
            { action: 'Senior Dev reallocation to innovation pipeline', owner: 'CTO', dep: 'Phase 2 gate', value: '$210K' },
            { action: 'PM capacity shift to customer-facing work', owner: 'VP Product', dep: 'Phase 2 gate', value: '$185K' },
            { action: 'Automate 3 recurring Finance/Ops reports', owner: 'CFO / COO', dep: 'Phase 2 gate', value: '$94K' },
            { action: '4 role re-scopes — activity/skill mismatch resolution', owner: 'Dept Heads', dep: 'Phase 2 gate', value: '$110K' },
            { action: 'Cognitive Economy review — calendar audit across all depts', owner: 'COO', dep: 'Phase 2 gate', value: '$420K' },
          ],
          gate: 'Gate: HSI above 68 · Burnout index below 35% · Wasted salary ratio below 10%',
        },
      ].map((phase, pi) => (
        <View key={pi} style={pi < 2 ? S.roadmapCol : S.roadmapColLast}>
          <View style={[S.roadmapColHeader, { backgroundColor: phase.color }]}>
            <Text style={S.roadmapColPhase}>{phase.phase} · {phase.label}</Text>
            <Text style={S.roadmapColTitle}>{phase.title}</Text>
          </View>
          <View style={[S.roadmapColBody, { backgroundColor: phase.bg }]}>
            {phase.items.map((item, ii) => (
              <View key={ii} style={S.roadmapItem}>
                <View style={[S.roadmapBullet, { backgroundColor: phase.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={S.roadmapItemBold}>{item.action}</Text>
                  <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray500, marginTop: 1 }}>Owner: {item.owner}</Text>
                  <Text style={[S.roadmapValue, { textAlign: 'left', marginTop: 1 }]}>{item.value}</Text>
                </View>
              </View>
            ))}
            <View style={{ marginTop: 10, padding: 8, backgroundColor: phase.color + '15', borderRadius: 4 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 7, color: phase.color, marginBottom: 3 }}>PHASE GATE</Text>
              <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray700, lineHeight: 1.4 }}>{phase.gate}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  </Page>
);

// ── Section 6: Minimum Viable Org ────────────────────────────────────────────
const Section6Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="06" title="Minimum Viable Org (MVO)" sub="If the organisation kept only activities scoring above value threshold — what would it look like?" color={C.violet} />

    <Text style={[S.body, { marginBottom: 6 }]}>
      The MVO is not a redundancy plan. It is a clarity exercise that reveals the productive core of the organisation.
      Activities below the value threshold are not deleted — they are surfaced as candidates for elimination, automation,
      or reallocation. The gap between current and MVO salary cost is the maximum recoverable structural waste.
    </Text>
    <Text style={[S.body, { marginBottom: 16, color: C.red }]}>
      Value threshold applied: Activity Score below 40/100 on combined Time × Value × Motivation composite.
    </Text>

    <View style={S.tableHeader}>
      {['Department', 'Current HC', 'MVO HC', 'Activities Retained', 'Current Salary', 'MVO Salary', 'Recoverable'].map((h, i) => (
        <Text key={i} style={[S.tableHeaderCell, i === 0 ? { flex: 1.5 } : {}]}>{h}</Text>
      ))}
    </View>
    {[
      { dept: 'Engineering',  curr: 45, mvo: 39, pct: '82%', salCurr: '$5.4M', salMvo: '$4.7M', rec: '$0.7M' },
      { dept: 'Operations',   curr: 38, mvo: 31, pct: '79%', salCurr: '$3.2M', salMvo: '$2.6M', rec: '$0.6M' },
      { dept: 'Product',      curr: 22, mvo: 20, pct: '88%', salCurr: '$2.8M', salMvo: '$2.5M', rec: '$0.3M' },
      { dept: 'Finance',      curr: 14, mvo: 11, pct: '76%', salCurr: '$1.6M', salMvo: '$1.3M', rec: '$0.3M' },
      { dept: 'HR',           curr: 8,  mvo: 7,  pct: '87%', salCurr: '$0.7M', salMvo: '$0.6M', rec: '$0.1M' },
    ].map((r, i) => (
      <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
        <Text style={[S.tableCellBold, { flex: 1.5 }]}>{r.dept}</Text>
        <Text style={S.tableCell}>{r.curr}</Text>
        <Text style={[S.tableCell, { color: C.sky }]}>{r.mvo}</Text>
        <Text style={S.tableCell}>{r.pct}</Text>
        <Text style={S.tableCell}>{r.salCurr}</Text>
        <Text style={[S.tableCell, { color: C.green }]}>{r.salMvo}</Text>
        <Text style={S.tableCellGreen}>{r.rec}</Text>
      </View>
    ))}
    <View style={{ flexDirection: 'row', padding: '10 10', backgroundColor: C.gray800, marginTop: 2, borderRadius: 4 }}>
      <Text style={[S.tableCellBold, { flex: 1.5, color: C.white }]}>Total Organisation</Text>
      <Text style={[S.tableCell, { color: C.gray300 }]}>127</Text>
      <Text style={[S.tableCell, { color: C.sky }]}>108</Text>
      <Text style={[S.tableCell, { color: C.gray300 }]}>82%</Text>
      <Text style={[S.tableCell, { color: C.gray300 }]}>$13.7M</Text>
      <Text style={[S.tableCell, { color: C.green }]}>$11.7M</Text>
      <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, color: C.green }}>$2.0M</Text>
    </View>

    <View style={S.spacer16} />
    <InfoBox
      title="Interpretation"
      body="The $2.0M gap between current and MVO salary cost represents structural waste — activities that consume payroll without contributing to outcomes above the value threshold. This is not a headcount reduction target. It is the maximum value available through activity redesign, reallocation, and elimination, without changing a single employment contract."
      color={C.violet} bgColor={C.violetLight} />
  </Page>
);

// ── Section 7: Energy Budget ─────────────────────────────────────────────────
const Section7Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="07" title="Energy Budget" sub="Cognitive capacity treated as a financial resource · Where the organisation's brain is actually being spent" color={C.amber} />

    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
      {[
        { label: 'TOTAL COGNITIVE BUDGET', value: '208,985', unit: 'peak-hours per year\n127 people × 7hrs × 235 days', color: C.sky, bg: C.skyLight },
        { label: 'COGNITIVE WASTE', value: '46%', unit: '96,133 hrs wasted\n$2.1M at avg hourly rate', color: C.red, bg: C.redLight },
        { label: 'STRATEGIC DEFICIT', value: '18pp', unit: 'Only 12% on strategy\nOptimal: 30%', color: C.amber, bg: C.amberLight },
        { label: 'RECOVERABLE VALUE', value: '$2.1M', unit: 'Via friction + meeting\nelimination', color: C.green, bg: C.greenLight },
      ].map((m, i) => (
        <View key={i} style={i < 3 ? [S.metricCard, { backgroundColor: m.bg }] : [S.metricCardLast, { backgroundColor: m.bg }]}>
          <Text style={S.metricCardLabel}>{m.label}</Text>
          <Text style={[S.metricCardValue, { color: m.color, fontSize: 16 }]}>{m.value}</Text>
          <Text style={S.metricCardSub}>{m.unit}</Text>
        </View>
      ))}
    </View>

    <Text style={S.h3}>Cognitive Capacity Allocation — Current vs Optimal</Text>
    <View style={S.tableHeader}>
      {['Activity Category', 'Current %', 'Current Hrs', 'Optimal %', 'Gap', 'Annual Cost of Gap'].map(h => (
        <Text key={h} style={S.tableHeaderCell}>{h}</Text>
      ))}
    </View>
    {[
      { cat: 'Strategic Work',      curr: '12%', hrs: '25,078', opt: '30%',  gap: '−18pp', cost: '$830K deficit' },
      { cat: 'Deep / Creative Work', curr: '18%', hrs: '37,617', opt: '28%', gap: '−10pp', cost: '$460K deficit' },
      { cat: 'Collaborative Work',   curr: '15%', hrs: '31,347', opt: '20%', gap: '−5pp',  cost: '$230K deficit' },
      { cat: 'Meetings',             curr: '31%', hrs: '64,785', opt: '15%', gap: '+16pp',  cost: '$740K waste' },
      { cat: 'Internal Friction',    curr: '24%', hrs: '50,156', opt: '4%',  gap: '+20pp',  cost: '$1.1M waste' },
      { cat: 'Admin & Overhead',     curr: '11%', hrs: '22,988', opt: '3%',  gap: '+8pp',   cost: '$370K waste' },
      { cat: 'Recovery / Idle',      curr: '4%',  hrs: '8,359',  opt: '11%', gap: '−7pp',   cost: '$320K deficit' },
    ].map((r, i) => (
      <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
        <Text style={S.tableCellBold}>{r.cat}</Text>
        <Text style={S.tableCell}>{r.curr}</Text>
        <Text style={S.tableCell}>{r.hrs}</Text>
        <Text style={[S.tableCell, { color: C.green }]}>{r.opt}</Text>
        <Text style={[S.tableCell, { color: r.gap.startsWith('+') ? C.red : C.amber }]}>{r.gap}</Text>
        <Text style={[S.tableCell, { color: r.cost.includes('waste') ? C.red : C.amber }]}>{r.cost}</Text>
      </View>
    ))}

    <View style={S.spacer16} />
    <Text style={S.h3}>Three Actions to Improve Cognitive ROI</Text>
    {[
      { action: '1. Eliminate 4 all-hands meetings + replace with async digest', recovery: '16,000 hrs/yr recovered', value: '$370K/yr' },
      { action: '2. Remove top 3 friction sources identified in Q9 responses', recovery: '28,000 hrs/yr recovered', value: '$650K/yr' },
      { action: '3. Mandate 20% deep-work protection across all departments', recovery: '41,000 hrs/yr redirected to strategy', value: '$950K/yr uplift' },
    ].map((a, i) => (
      <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, padding: 10, backgroundColor: C.gray50, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: C.green, borderLeftStyle: 'solid' }}>
        <View style={{ flex: 2 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.gray800 }}>{a.action}</Text>
          <Text style={{ fontFamily: 'Helvetica', fontSize: 8, color: C.gray500, marginTop: 2 }}>{a.recovery}</Text>
        </View>
        <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.green, textAlign: 'right' }}>{a.value}</Text>
      </View>
    ))}
  </Page>
);

// ── Section 8: Pre-Mortem Narrative ──────────────────────────────────────────
const Section8Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="08" title="Pre-Mortem Action Plan" sub="The crisis you are walking toward — month-by-month narrative · And the three actions that break the chain" color={C.red} />

    <InfoBox
      title="What is a Pre-Mortem?"
      body="A pre-mortem assumes the crisis has already happened and works backward to identify the chain of events that led to it. This is not a prediction — it is a signal-driven projection of what occurs if current trajectories continue unchanged. CPI: 48 (threshold: 60). Burnout: 67% frontline. Trust decay rate: 4.8pts/cycle."
      color={C.red} bgColor={C.redLight} />

    <View style={S.spacer12} />
    <Text style={S.h3}>The Crisis Narrative — If Nothing Changes</Text>

    {[
      { month: 'Month 1\n(April)', text: 'Crisis Proximity Index crosses 60. System escalates nudge priority automatically. Three frontline workers submit formal stress leave requests in Operations. Meeting overhead unchanged despite prior recommendations. Resignation language detected in Q11 responses increases to +22%.', alert: false },
      { month: 'Month 2\n(May)', text: 'First voluntary departures begin. Engineering loses 2 senior developers to competitor (Fintech Innovators LLC, already running 400% targeted recruitment). Delivery timelines slip 3 weeks. Product backlog grows. CEO receives first escalation from board member re: delivery risk.', alert: false },
      { month: 'Month 3\n(June)', text: 'Operations bottleneck triggers a client contract penalty clause: $400,000. CFO raises concern about Q2 revenue forecast. HR Director presents attrition report. Board requests explanations. Intervention cost at this stage: estimated $1.8M (vs $180K if actioned today).', alert: true },
      { month: 'Month 4–5\n(Jul–Aug)', text: 'Burnout index in mid-management crosses 55%. Four additional departures. Knowledge fragility score reaches critical — 41% of operational knowledge concentrated in 3 individuals. CTO briefs board on technical delivery risk. Remediation programme initiated.', alert: true },
      { month: 'Month 6\n(Sept)', text: 'Full board emergency session. Independent review commissioned. Total remediation cost estimated at $3.2M. The organisation is 18 months from full recovery. Biological ageing rate crosses 1.35× — recovery reserve is exhausted.', alert: true },
    ].map((row, i) => (
      <View key={i} style={S.timelineRow}>
        <View style={[S.timelineLine, { backgroundColor: row.alert ? C.red : C.gray300, minHeight: 50 }]} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: row.alert ? C.red : C.gray600, marginBottom: 3 }}>{row.month}</Text>
          <Text style={row.alert ? [S.timelineBodyAlert, { color: C.red }] : S.timelineBody}>{row.text}</Text>
        </View>
      </View>
    ))}

    <View style={S.spacer12} />
    <Text style={[S.h3, { color: C.green }]}>Three Actions That Break the Chain at Month 1</Text>
    {[
      { n: '1', title: 'Week 1: Recovery Buffer Policy', body: 'Implement mandatory 20% protected deep-work time across all departments. CPI stabilises within 3 weeks. Immediate cost: $0.' },
      { n: '2', title: 'Week 1: Escalate 3 burnout-threshold individuals', body: 'Identify and formally support the 3 individuals at critical threshold in Operations. Remove from high-friction workflows immediately.' },
      { n: '3', title: 'Weeks 2–4: Friction elimination in Operations (top 2 sources)', body: 'Remove the 2 highest-severity friction sources identified in Q9. Expected: CPI drops to below 42 within one cycle. Frontline resignation risk reduced by 60%.' },
    ].map((a, i) => (
      <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, padding: 12, backgroundColor: C.greenLight, borderRadius: 6 }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.white }}>{a.n}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.gray800 }}>{a.title}</Text>
          <Text style={{ fontFamily: 'Helvetica', fontSize: 8.5, color: C.gray700, marginTop: 3, lineHeight: 1.4 }}>{a.body}</Text>
        </View>
      </View>
    ))}
  </Page>
);

// ── Section 9: Human Capital Redeployment ─────────────────────────────────────
const Section9Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="09" title="Human Capital Redeployment Plan" sub="Signal fingerprint analysis — who is underutilised and where they would generate higher value" color={C.sky} />

    <Text style={[S.body, { marginBottom: 16 }]}>
      Signal fingerprint comparison identifies individuals whose current role utilises less than 60% of their
      demonstrated capability. The plan below specifies optimal redeployment targets, value unlocked,
      and transition cost. No redundancies — pure internal mobility optimisation.
    </Text>

    <View style={S.tableHeader}>
      {['Role (Anonymised)', 'Dept', 'Current Utilisation', 'Optimal Deployment', 'Value Unlocked', 'Transition Cost', 'Net ROI'].map((h, i) => (
        <Text key={i} style={[S.tableHeaderCell, i === 3 ? { flex: 1.5 } : {}]}>{h}</Text>
      ))}
    </View>
    {[
      { role: 'Senior Dev 1 (ED-07)',     dept: 'Engineering', util: '42%',  deploy: 'Innovation pipeline lead', value: '$210K', cost: '$0',    roi: 'Infinite' },
      { role: 'Senior Dev 2 (ED-12)',     dept: 'Engineering', util: '38%',  deploy: 'Platform architecture',   value: '$185K', cost: '$0',    roi: 'Infinite' },
      { role: 'Product Mgr 1 (PD-03)',    dept: 'Product',     util: '51%',  deploy: 'Customer success lead',   value: '$120K', cost: '$0',    roi: 'Infinite' },
      { role: 'Finance Analyst (FN-02)',  dept: 'Finance',     util: '44%',  deploy: 'Strategic modelling',     value: '$67K',  cost: '$8K',   roi: '738%' },
      { role: 'Ops Coordinator (OP-09)',  dept: 'Operations',  util: '55%',  deploy: 'Process optimisation',    value: '$52K',  cost: '$5K',   roi: '940%' },
    ].map((r, i) => (
      <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
        <Text style={S.tableCellBold}>{r.role}</Text>
        <Text style={S.tableCell}>{r.dept}</Text>
        <Text style={[S.tableCell, { color: C.red }]}>{r.util}</Text>
        <Text style={[S.tableCell, { flex: 1.5 }]}>{r.deploy}</Text>
        <Text style={S.tableCellGreen}>{r.value}</Text>
        <Text style={S.tableCell}>{r.cost}</Text>
        <Text style={S.tableCellGreen}>{r.roi}</Text>
      </View>
    ))}

    <View style={S.spacer16} />
    <InfoBox
      title="Total Redeployment Value"
      body="Combined value unlocked: $634,000/yr. Total transition cost: $13,000 (training and role change support). Net ROI on redeployment programme: 4,777%. All redeployments are internal — no hiring cost, no notice period, no knowledge loss. Implementation timeline: 4–6 weeks per redeployment with proper handover."
      color={C.green} bgColor={C.greenLight} />

    <View style={S.spacer12} />
    <Text style={S.h3}>Methodology — Signal Fingerprinting</Text>
    <Text style={S.body}>
      Each individual is represented as a multi-dimensional signal vector across 5 direct signals and 13 capability
      dimensions from Q13 responses. Redeployment candidates are identified when their signal fingerprint similarity
      score to a higher-value role exceeds 0.72 cosine similarity threshold. All identities are anonymised in this
      document — role codes are linked to the HR Intelligence Report distributed separately to the HR Director.
    </Text>
  </Page>
);

// ── Section 10: Culture Prescription ──────────────────────────────────────────
const Section10Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="10" title="Culture Prescription" sub="Clinical intervention protocols for each culture classification fired this cycle" color={C.violet} />

    <Text style={[S.body, { marginBottom: 16 }]}>
      Three culture classifications fired in Cycle 6. Each carries a specific intervention protocol specifying
      which management behaviours change first, which structural changes unlock the shift,
      signals to monitor weekly, and expected recovery timeline based on the Intervention Genome.
    </Text>

    {[
      {
        classification: 'BURNOUT TOLERANCE CULTURE',
        fired: 'Operations — Frontline 67% burnout · Mid-Management 41%',
        color: C.red, bg: C.redLight,
        behaviours: [
          'Stop celebrating "resilience" in team communications — it normalises overload',
          'Managers acknowledge workload in 1:1s and adjust delivery expectations accordingly',
          'Publicly model recovery — managers must visibly use protected time',
        ],
        structural: [
          'Recovery buffer policy: 20% protected weekly time, enforced at team level',
          'Workload capacity assessment before any new project assignment',
          'Burnout-threshold individuals removed from high-friction workflows immediately',
        ],
        signals: 'HC-WEL-001 weekly · Sick leave rate · Frontline attrition velocity',
        timeline: '2–3 cycles for burnout index to fall below 35%',
      },
      {
        classification: 'HIGH FRICTION TOLERANCE CULTURE',
        fired: 'Operations, Engineering — Q9 blockers chronic across both depts',
        color: C.orange, bg: C.orangeLight,
        behaviours: [
          'Managers escalate every blocker reported in Q9 within 48 hours — no tolerance for unresolved friction',
          'Stop rewarding "workarounds" — they mask systemic issues',
          'Weekly friction stand-up: one blocker removed every week, publicly tracked',
        ],
        structural: [
          'Approval chain simplification: Engineering from 5 steps to 2',
          'Cross-functional blocker removal task force: COO-owned, 30-day sprint',
          'Friction log published internally — accountability through visibility',
        ],
        signals: 'Q9 severity score weekly · Approval cycle time · Cross-team blocker count',
        timeline: '1–2 cycles for friction signal to improve >15pts',
      },
      {
        classification: 'PERCEPTION GAP / MISALIGNMENT',
        fired: 'All departments — Supervisor-subordinate gap: 31pts (threshold: 20pts)',
        color: C.amber, bg: C.amberLight,
        behaviours: [
          'Managers share their Q7+Q8 perception data with teams in facilitated sessions',
          'Replace assumption with direct inquiry — weekly structured check-ins on success clarity',
          'Acknowledge the gap publicly: "I thought X. You experienced Y. Let us close that."',
        ],
        structural: [
          'Success definition sessions: every role with ambiguous KPIs resolved within 30 days',
          'Anonymous signal review sessions facilitated by HR Director quarterly',
          'Manager blind-spot coaching for the 2 managers with scores >40pts',
        ],
        signals: 'Perception gap score by manager · Q5 "clarity of success" weekly · Q11 tone shift',
        timeline: '2 cycles for gap to close below 18pts (industry norm: 22pts)',
      },
    ].map((rx, i) => (
      <View key={i} style={{ marginBottom: 14, borderRadius: 6, borderWidth: 1, borderColor: rx.color, borderStyle: 'solid', overflow: 'hidden' }}>
        <View style={{ backgroundColor: rx.color, padding: '8 12' }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: C.white }}>{rx.classification}</Text>
          <Text style={{ fontFamily: 'Helvetica', fontSize: 8, color: C.white, marginTop: 2, opacity: 0.85 }}>Detected: {rx.fired}</Text>
        </View>
        <View style={{ flexDirection: 'row', padding: 12, backgroundColor: rx.bg }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: rx.color, marginBottom: 5 }}>MANAGER BEHAVIOURS TO CHANGE FIRST</Text>
            {rx.behaviours.map((b, bi) => (
              <Text key={bi} style={{ fontFamily: 'Helvetica', fontSize: 8, color: C.gray700, marginBottom: 3, lineHeight: 1.4 }}>• {b}</Text>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: rx.color, marginBottom: 5 }}>STRUCTURAL CHANGES</Text>
            {rx.structural.map((s, si) => (
              <Text key={si} style={{ fontFamily: 'Helvetica', fontSize: 8, color: C.gray700, marginBottom: 3, lineHeight: 1.4 }}>• {s}</Text>
            ))}
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: rx.color, marginTop: 6 }}>MONITOR: </Text>
            <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray600 }}>{rx.signals}</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: C.green, marginTop: 4 }}>Timeline: {rx.timeline}</Text>
          </View>
        </View>
      </View>
    ))}
  </Page>
);

// ── Section 11: Peer Playbook ─────────────────────────────────────────────────
const Section11Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="11" title="Peer Playbook" sub="What similar organisations did when the same signals fired — anonymised intelligence from the Intervention Genome" color={C.green} />

    <Text style={[S.body, { marginBottom: 16 }]}>
      The Intervention Genome contains outcome data from organisations with comparable signal profiles —
      same industry cluster, similar headcount range, same reveals fired. The cases below represent the
      three highest-similarity matches (similarity ≥ 81%) to your current Cycle 6 state.
    </Text>

    {[
      {
        company: 'SaaS Co. · Series C · 280 staff · Financial Services',
        similarity: '94%',
        signals: 'High Friction + Low Motivation · CPI: 52 · Burnout: 44%',
        action: 'Eliminated 3 weekly all-hands meetings, replaced with async signal digest. Redesigned approval chains from 4 steps to 2. Implemented 20% recovery buffer.',
        outcome: 'Friction signal −38% within 1 cycle. Motivation recovered +14pts over 2 cycles. Burnout index dropped from 44% to 28%.',
        timeToImpact: '1 cycle',
        valueRecovered: '$480K',
        color: C.green,
      },
      {
        company: 'Financial Services Mid-Market · 410 staff · Professional Services',
        similarity: '88%',
        signals: 'Burnout Risk >60% + Wasted Salary 16.4% · Frontline attrition accelerating',
        action: 'Mandatory recovery buffer policy enforced at team level. Meeting load reduced 30% via structured audit. Top 3 friction blockers eliminated in Q9 follow-up.',
        outcome: 'Burnout index dropped from 64% to 41% in 2 cycles. Wasted salary recovered $640K/yr. Attrition rate returned to industry baseline.',
        timeToImpact: '2 cycles',
        valueRecovered: '$640K',
        color: C.sky,
      },
      {
        company: 'Professional Services Firm · 190 staff · Consulting',
        similarity: '81%',
        signals: 'Perception Gap 35pts + Voice Suppression rising · Trust decay rate >5pts/cycle',
        action: 'Anonymous signal review sessions with external facilitators. Manager blind-spot coaching for top 8 managers. Role clarity workshops for 14 ambiguous roles.',
        outcome: 'Perception gap closed to 18pts within 3 cycles. Voice suppression fell from 58% to 34%. Trust decay reversed — +6pts in cycle following intervention.',
        timeToImpact: '3 cycles',
        valueRecovered: '$310K',
        color: C.violet,
      },
    ].map((p, i) => (
      <View key={i} style={{ marginBottom: 14, borderRadius: 6, borderWidth: 1, borderColor: C.gray200, borderStyle: 'solid', overflow: 'hidden' }}>
        <View style={{ backgroundColor: C.gray800, padding: '8 12', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.white, flex: 1 }}>{p.company}</Text>
          <View style={{ backgroundColor: p.color, borderRadius: 4, padding: '3 8' }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.white }}>{p.similarity} match</Text>
          </View>
        </View>
        <View style={{ padding: 12, backgroundColor: C.gray50 }}>
          <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, color: C.gray500, marginBottom: 6 }}>Active signals: {p.signals}</Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 2, marginRight: 10 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.gray600, marginBottom: 4 }}>ACTIONS TAKEN</Text>
              <Text style={{ fontFamily: 'Helvetica', fontSize: 8.5, color: C.gray700, lineHeight: 1.5 }}>{p.action}</Text>
            </View>
            <View style={{ flex: 1.5 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: p.color, marginBottom: 4 }}>OUTCOME</Text>
              <Text style={{ fontFamily: 'Helvetica', fontSize: 8.5, color: C.gray700, lineHeight: 1.5, marginBottom: 6 }}>{p.outcome}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontFamily: 'Helvetica', fontSize: 7, color: C.gray500 }}>TIME TO IMPACT</Text>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: p.color }}>{p.timeToImpact}</Text>
                </View>
                <View>
                  <Text style={{ fontFamily: 'Helvetica', fontSize: 7, color: C.gray500 }}>VALUE RECOVERED</Text>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.green }}>{p.valueRecovered}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    ))}
  </Page>
);

// ── Section 12: Industry Norm Deviation ───────────────────────────────────────
const Section12Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="12" title="Industry Norm Deviation" sub="Where this organisation deviates >1.5 standard deviations from industry benchmarks" color={C.sky} />

    <Text style={[S.body, { marginBottom: 16 }]}>
      Benchmarks are drawn from the WORKable Intervention Genome dataset — organisations in the same
      industry cluster and headcount range (100–500 staff). Deviations beyond ±1.5 SD require active response.
      Positive outliers must be protected. Dangerous outliers are addressed in the roadmap.
    </Text>

    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, color: C.green, marginBottom: 8 }}>▲ Protect Your Advantages — Positive Outliers</Text>
    <View style={S.tableHeader}>
      {['Metric', 'Your Score', 'Industry Avg', 'Delta', 'Financial Value', 'Risk if Lost'].map(h => (
        <Text key={h} style={S.tableHeaderCell}>{h}</Text>
      ))}
    </View>
    {[
      { metric: 'Wasted Salary Ratio',       ours: '14.2%', ind: '18.5%', delta: '−4.3pp', value: '+$840K advantage', risk: 'High — degrading' },
      { metric: 'Manager Blind-Spot Score',  ours: '31pts',  ind: '35pts',  delta: '−4pp',   value: '+4% exec alignment', risk: 'Medium' },
      { metric: 'Adaptive Capacity (OBA)',   ours: '78/100', ind: '61/100', delta: '+17pts', value: 'Change resilience',   risk: 'Medium' },
    ].map((r, i) => (
      <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
        <Text style={S.tableCellBold}>{r.metric}</Text>
        <Text style={[S.tableCell, { color: C.green }]}>{r.ours}</Text>
        <Text style={S.tableCell}>{r.ind}</Text>
        <Text style={S.tableCellGreen}>{r.delta}</Text>
        <Text style={S.tableCellGreen}>{r.value}</Text>
        <Text style={[S.tableCell, { color: C.amber }]}>{r.risk}</Text>
      </View>
    ))}

    <View style={S.spacer16} />
    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, color: C.red, marginBottom: 8 }}>▼ Address Your Anomalies — Dangerous Outliers</Text>
    {[
      { metric: 'Frontline Burnout Risk',        ours: '67%',    ind: '48%',    delta: '+19pp',   value: '−$1.2M exposure', action: 'Immediate — Culture Prescription' },
      { metric: 'Trust Decay Rate',               ours: '4.8pts', ind: '1.2pts', delta: '+3.6pts', value: 'Governance risk',  action: 'Phase 1 — Trust recovery plan' },
      { metric: 'Voice Suppression Index',        ours: '54%',    ind: '31%',    delta: '+23pp',   value: 'Attrition risk',   action: 'Phase 2 — Facilitated sessions' },
      { metric: 'Mid-Management Burnout',         ours: '41%',    ind: '35%',    delta: '+6pp',    value: '−$640K exposure',  action: 'Phase 1 — Recovery buffer' },
      { metric: 'Cognitive Waste (Meetings+Frx)', ours: '55%',    ind: '27%',    delta: '+28pp',   value: '−$2.1M waste',     action: 'Phase 1+2 — Energy Budget plan' },
    ].map((r, i) => (
      <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
        <Text style={S.tableCellBold}>{r.metric}</Text>
        <Text style={S.tableCellRed}>{r.ours}</Text>
        <Text style={S.tableCell}>{r.ind}</Text>
        <Text style={S.tableCellRed}>{r.delta}</Text>
        <Text style={S.tableCellRed}>{r.value}</Text>
        <Text style={[S.tableCell, { color: C.sky }]}>{r.action}</Text>
      </View>
    ))}
  </Page>
);

// ── Section 13: Opportunity Cost View ────────────────────────────────────────
const Section13Page: React.FC = () => (
  <Page size="A4" style={S.page}>
    <PageHeader />
    <PageFooter />

    <SectionHeader num="13" title="Opportunity Cost View" sub="What this organisation could become — growth framing alongside the problem framing" color={C.green} />

    <Text style={[S.body, { marginBottom: 16 }]}>
      For every High Value–Low Time reveal identified this cycle, the table below projects the additional
      output if that activity received its optimal time allocation. This is the growth case —
      the value WORKable unlocks when organisations move beyond fixing problems to activating potential.
    </Text>

    <View style={S.tableHeader}>
      {['High-Value Activity', 'Dept', 'Current Time %', 'Optimal Time %', 'Additional Output', 'Annual Value'].map((h, i) => (
        <Text key={i} style={[S.tableHeaderCell, i === 0 ? { flex: 2 } : {}]}>{h}</Text>
      ))}
    </View>
    {[
      { act: 'Strategic product architecture + roadmap design', dept: 'Engineering', curr: '8%',  opt: '22%', output: '+14% product velocity', value: '$320K' },
      { act: 'Direct customer engagement and requirements capture', dept: 'Product', curr: '12%', opt: '28%', output: '+18% NPS correlation', value: '$280K' },
      { act: 'Financial modelling + strategic scenario planning', dept: 'Finance', curr: '9%',  opt: '25%', output: '+22% decision quality', value: '$180K' },
      { act: 'Cross-team collaboration and knowledge transfer', dept: 'All', curr: '15%', opt: '20%', output: '+11% innovation rate', value: '$150K' },
      { act: 'Talent development and succession preparation', dept: 'HR', curr: '18%', opt: '35%', output: 'Succession risk −40%', value: '$120K' },
    ].map((r, i) => (
      <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
        <Text style={[S.tableCellBold, { flex: 2 }]}>{r.act}</Text>
        <Text style={S.tableCell}>{r.dept}</Text>
        <Text style={[S.tableCell, { color: C.red }]}>{r.curr}</Text>
        <Text style={[S.tableCell, { color: C.green }]}>{r.opt}</Text>
        <Text style={S.tableCell}>{r.output}</Text>
        <Text style={S.tableCellGreen}>{r.value}</Text>
      </View>
    ))}
    <View style={{ flexDirection: 'row', padding: '10 10', backgroundColor: C.gray800, marginTop: 2, borderRadius: 4 }}>
      <Text style={[S.tableCellBold, { flex: 2, color: C.white }]}>Total Opportunity Value (additional to problem-fix recovery)</Text>
      <Text style={S.tableCell}></Text><Text style={S.tableCell}></Text><Text style={S.tableCell}></Text><Text style={S.tableCell}></Text>
      <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.green }}>$1.05M</Text>
    </View>

    <View style={S.spacer16} />
    <InfoBox
      title="The Full Picture"
      body="Combined: $2.4M in waste recovery + $1.05M in opportunity activation = $3.45M total value available within 90 days of executing this plan. This is the business case for WORKable. Every cycle of data makes the system more accurate, and every completed intervention builds the evidence base that makes the next recommendation more credible."
      color={C.green} bgColor={C.greenLight} />

    {/* Closing statement */}
    <View style={{ marginTop: 24, padding: 20, backgroundColor: C.navy, borderRadius: 8 }}>
      <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.white, marginBottom: 8 }}>
        This plan expires at the start of Cycle 7.
      </Text>
      <Text style={{ fontFamily: 'Helvetica', fontSize: 9, color: C.gray400, lineHeight: 1.6 }}>
        Signal data is time-sensitive. Every dismissed recommendation increases the forward cost of intervention
        by approximately 1.4× per cycle. The leadership team receiving this document has a 30-day window in which
        the Phase 1 actions are at their lowest cost and highest confidence. After that window, signal drift
        will require a full recalibration.
      </Text>
      <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.sky, marginTop: 10 }}>
        WORKable Intelligence Platform · Blueprint v5 · Innovation Quotient (Pvt) Ltd · www.iq.lk
      </Text>
    </View>
  </Page>
);

// ── Root Document ─────────────────────────────────────────────────────────────
const ActionPlanDocument: React.FC = () => (
  <Document
    title="WORKable Executive Action Plan — Cycle 6 — March 2026"
    author="WORKable Intelligence Platform"
    subject="Executive Action Plan — Strictly Confidential"
    keywords="workable, human capital, action plan, executive"
    creator="WORKable v5"
  >
    <CoverPage />
    <ExecSummaryPage />
    <Section1Page />
    <Section2Page />
    <Section3Page />
    <Section4Page />
    <Section5Page />
    <Section6Page />
    <Section7Page />
    <Section8Page />
    <Section9Page />
    <Section10Page />
    <Section11Page />
    <Section12Page />
    <Section13Page />
  </Document>
);

export default ActionPlanDocument;
