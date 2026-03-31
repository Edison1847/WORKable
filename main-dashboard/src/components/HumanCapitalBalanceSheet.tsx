import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Info } from 'lucide-react';
import useIntakeData from '../hooks/useIntakeData';

interface LineItem {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
  blank?: boolean;
  insight?: string;
}

interface TooltipData {
  title: string;
  value: string;
  insight: string;
  trend: 'positive' | 'negative' | 'neutral';
  details: string[];
}

/* Tooltip Component */
const Tooltip: React.FC<{ data: TooltipData; visible: boolean; x: number; y: number }> = ({ 
  data, visible, x, y 
}) => {
  if (!visible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed z-50 pointer-events-none"
      style={{ 
        left: x + 15, 
        top: y - 10,
        maxWidth: 320,
      }}
    >
      <div 
        className="rounded-xl p-4 shadow-2xl"
        style={{ 
          background: 'rgba(15, 23, 42, 0.98)',
          border: `1px solid ${data.trend === 'positive' ? 'rgba(52,211,153,0.4)' : data.trend === 'negative' ? 'rgba(244,63,94,0.4)' : 'rgba(148,163,184,0.3)'}`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span 
            className="text-xs font-bold"
            style={{ 
              color: data.trend === 'positive' ? '#34d399' : data.trend === 'negative' ? '#f43f5e' : '#94a3b8',
              fontFamily: 'var(--font-display)'
            }}
          >
            {data.title}
          </span>
          <span 
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ 
              background: 'rgba(255,255,255,0.1)',
              color: 'white'
            }}
          >
            {data.value}
          </span>
        </div>
        
        <p className="text-[11px] text-white/80 mb-3 leading-relaxed">
          {data.insight}
        </p>
        
        {data.details.length > 0 && (
          <div className="space-y-1">
            {data.details.map((detail, i) => (
              <div key={i} className="flex items-start gap-2">
                <span 
                  className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                  style={{ 
                    background: data.trend === 'positive' ? '#34d399' : data.trend === 'negative' ? '#f43f5e' : '#94a3b8'
                  }}
                />
                <span className="text-[10px] text-white/60">{detail}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* Dots leader with tooltip */
const Leaders: React.FC<{ 
  label: string; 
  value: string; 
  bold?: boolean; 
  color?: string;
  tooltip?: TooltipData;
  onHover: (show: boolean, data?: TooltipData) => void;
}> = ({
  label,
  value,
  bold,
  color,
  tooltip,
  onHover,
}) => (
  <div
    className="flex items-baseline justify-between gap-1 group cursor-help relative"
    style={{ paddingTop: bold ? 4 : 0 }}
    onMouseEnter={() => tooltip && onHover(true, tooltip)}
    onMouseLeave={() => onHover(false)}
  >
    <div className="flex items-center gap-1.5">
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
      {!bold && tooltip && (
        <Info 
          size={10} 
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text-muted)' }}
        />
      )}
    </div>
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
  const { data, loading } = useIntakeData();
  const [tooltip, setTooltip] = useState<{ visible: boolean; data?: TooltipData; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (tooltip.visible) {
        setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [tooltip.visible]);
  
  // Calculate live values and insights from diagnostic data
  const { assets, liabilities, netPosition, quarterGrowth, rawMetrics } = useMemo(() => {
    if (!data?.all_diagnostics || data.all_diagnostics.length === 0) {
      return {
        assets: [],
        liabilities: [],
        netPosition: 0,
        quarterGrowth: 0,
        rawMetrics: null,
      };
    }

    const diags = data.all_diagnostics;
    const workers = diags.filter((d: any) => d.type === 'worker');
    
    const totalEmployees = workers.length;
    if (totalEmployees === 0) {
      return { assets: [], liabilities: [], netPosition: 0, quarterGrowth: 0, rawMetrics: null };
    }

    // Calculate aggregate metrics
    let totalOrgHealth = 0;
    let totalBurnout = 0;
    let totalCapGap = 0;
    let totalLegacyBurden = 0;
    let lowContribActivities = 0;
    let totalActivities = 0;
    let highEngagement = 0;
    let disengagedCount = 0;
    let highEnergyActivities = 0;
    
    workers.forEach((w: any) => {
      const p1 = w.payload?.p1 || w.p1 || {};
      const acts = w.payload?.activityDetails || w.activityDetails || [];
      
      totalOrgHealth += p1.orgHealth || 5;
      totalBurnout += p1.burnout || 3;
      totalCapGap += p1.capGap || p1.capabilityGap || 5;
      totalLegacyBurden += p1.legacyBurden || 50;
      
      acts.forEach((a: any) => {
        totalActivities++;
        if (a.contrib === 'Low') lowContribActivities++;
        if (a.energy >= 4) highEngagement++;
        if (a.energy <= 2) disengagedCount++;
        if (a.energy >= 4 && a.skillMatch >= 4) highEnergyActivities++;
      });
    });

    const avgOrgHealth = totalOrgHealth / totalEmployees;
    const avgBurnout = totalBurnout / totalEmployees;
    const avgCapGap = totalCapGap / totalEmployees;
    const avgLegacyBurden = totalLegacyBurden / totalEmployees;
    const lowRoiPercent = totalActivities > 0 ? lowContribActivities / totalActivities : 0;
    const engagementRate = totalActivities > 0 ? highEngagement / totalActivities : 0;
    
    // Calculate dollar values
    const salaryBudget = 60000;
    const perEmployeeCost = salaryBudget / Math.max(totalEmployees, 1);
    
    // Assets calculation
    const engagedWorkforceValue = (avgOrgHealth / 10) * salaryBudget * 0.7;
    const highHsiTalentCapital = ((10 - avgCapGap) / 10) * salaryBudget * 0.4;
    const innovationCapacity = (highEngagement / Math.max(totalActivities, 1)) * salaryBudget * 0.3;
    const successionPipeline = (totalEmployees > 5 ? 0.3 : 0.15) * salaryBudget;
    const capabilityBase = ((100 - avgLegacyBurden) / 100) * salaryBudget * 0.5;
    const totalAssets = engagedWorkforceValue + highHsiTalentCapital + innovationCapacity + successionPipeline + capabilityBase;
    
    // Liabilities calculation
    const burnoutRiskCost = (avgBurnout / 10) * salaryBudget * 0.35;
    const wastedSalary = lowRoiPercent * salaryBudget * 0.4;
    const attritionCost = (disengagedCount / Math.max(totalActivities, 1)) * salaryBudget * 0.25;
    const frictionTax = (avgLegacyBurden / 100) * salaryBudget * 0.15;
    const complianceExposure = salaryBudget * 0.02;
    const totalLiabilities = burnoutRiskCost + wastedSalary + attritionCost + frictionTax + complianceExposure;
    
    const net = totalAssets - totalLiabilities;
    const growth = net * 0.12;

    // Store raw metrics for insights
    const metrics = {
      totalEmployees,
      avgOrgHealth,
      avgBurnout,
      avgCapGap,
      avgLegacyBurden,
      lowRoiPercent,
      engagementRate,
      highEnergyActivities,
      disengagedCount,
      perEmployeeCost,
      salaryBudget,
    };

    // Generate dynamic insights
    const getAssetInsight = (label: string): TooltipData => {
      switch (label) {
        case 'Engaged Workforce Value':
          return {
            title: 'Engaged Workforce Value',
            value: `$${(engagedWorkforceValue / 1000).toFixed(1)}M`,
            insight: `Based on ${totalEmployees} workers averaging ${avgOrgHealth.toFixed(1)}/10 organizational health. Higher engagement correlates with ${(avgOrgHealth * 8).toFixed(0)}% productivity lift.`,
            trend: avgOrgHealth >= 7 ? 'positive' : avgOrgHealth >= 5 ? 'neutral' : 'negative',
            details: [
              `Average org health: ${avgOrgHealth.toFixed(1)}/10`,
              `Engagement rate: ${(engagementRate * 100).toFixed(0)}%`,
              `Per-employee value: $${((engagedWorkforceValue / totalEmployees) / 1000).toFixed(1)}k`,
            ],
          };
        case 'High-HSI Talent Capital':
          return {
            title: 'High-HSI Talent Capital',
            value: `$${(highHsiTalentCapital / 1000).toFixed(1)}M`,
            insight: `Human System Index capital derived from ${(10 - avgCapGap).toFixed(1)}/10 capability coverage. ${avgCapGap > 5 ? 'Significant capability gaps detected' : 'Strong capability alignment'}.`,
            trend: avgCapGap <= 4 ? 'positive' : avgCapGap <= 6 ? 'neutral' : 'negative',
            details: [
              `Avg capability gap: ${avgCapGap.toFixed(1)}/10`,
              `Coverage ratio: ${((10 - avgCapGap) * 10).toFixed(0)}%`,
              `Risk level: ${avgCapGap > 6 ? 'High' : avgCapGap > 4 ? 'Medium' : 'Low'}`,
            ],
          };
        case 'Innovation Capacity Reserve':
          return {
            title: 'Innovation Capacity Reserve',
            value: `$${(innovationCapacity / 1000).toFixed(1)}M`,
            insight: `Calculated from ${highEngagement} high-energy activities across ${totalActivities} total. ${engagementRate >= 0.3 ? 'Strong innovation potential' : 'Innovation capacity constrained'}.`,
            trend: engagementRate >= 0.3 ? 'positive' : engagementRate >= 0.2 ? 'neutral' : 'negative',
            details: [
              `High-energy activities: ${highEngagement}/${totalActivities}`,
              `Innovation rate: ${(engagementRate * 100).toFixed(0)}%`,
              `Optimal threshold: 30%+`,
            ],
          };
        case 'Succession Pipeline Depth':
          return {
            title: 'Succession Pipeline Depth',
            value: `$${(successionPipeline / 1000).toFixed(1)}M`,
            insight: `Leadership bench strength for ${totalEmployees} employees. ${totalEmployees > 10 ? 'Adequate pipeline for scale' : 'Limited pipeline - succession risk elevated'}.`,
            trend: totalEmployees > 10 ? 'positive' : totalEmployees > 5 ? 'neutral' : 'negative',
            details: [
              `Total workforce: ${totalEmployees}`,
              `Bench ratio: ${(successionPipeline / salaryBudget * 100).toFixed(0)}%`,
              `Critical roles covered: ${Math.min(totalEmployees * 0.2, 5).toFixed(0)}`,
            ],
          };
        case 'Capability & Knowledge Base':
          return {
            title: 'Capability & Knowledge Base',
            value: `$${(capabilityBase / 1000).toFixed(1)}M`,
            insight: `Institutional knowledge value accounting for ${avgLegacyBurden.toFixed(0)}% legacy burden. ${avgLegacyBurden < 40 ? 'Modern capability stack' : 'Modernization opportunity identified'}.`,
            trend: avgLegacyBurden < 40 ? 'positive' : avgLegacyBurden < 60 ? 'neutral' : 'negative',
            details: [
              `Legacy burden: ${avgLegacyBurden.toFixed(0)}%`,
              `Modern capacity: ${(100 - avgLegacyBurden).toFixed(0)}%`,
              `Knowledge risk: ${avgLegacyBurden > 60 ? 'High' : avgLegacyBurden > 40 ? 'Medium' : 'Low'}`,
            ],
          };
        default:
          return { title: label, value: '$0M', insight: '', trend: 'neutral' as const, details: [] };
      }
    };

    const getLiabilityInsight = (label: string): TooltipData => {
      switch (label) {
        case 'Burnout Risk Cost':
          return {
            title: 'Burnout Risk Cost',
            value: `$${(burnoutRiskCost / 1000).toFixed(1)}M`,
            insight: `Productivity loss from ${avgBurnout.toFixed(1)}/10 average burnout. ${avgBurnout > 6 ? 'Critical intervention required' : avgBurnout > 4 ? 'Monitor and prevent escalation' : 'Burnout within healthy range'}.`,
            trend: avgBurnout < 4 ? 'positive' : avgBurnout < 6 ? 'neutral' : 'negative',
            details: [
              `Avg burnout score: ${avgBurnout.toFixed(1)}/10`,
              `Risk level: ${avgBurnout > 6 ? 'Critical' : avgBurnout > 4 ? 'Elevated' : 'Normal'}`,
              `Estimated productivity loss: ${(avgBurnout * 10).toFixed(0)}%`,
            ],
          };
        case 'Wasted Salary (Low-ROI Activity)':
          return {
            title: 'Wasted Salary (Low-ROI)',
            value: `$${(wastedSalary / 1000).toFixed(1)}M`,
            insight: `${(lowRoiPercent * 100).toFixed(0)}% of activities contribute low value. ${lowRoiPercent > 0.3 ? 'Major process reengineering opportunity' : 'Within acceptable range'}.`,
            trend: lowRoiPercent < 0.2 ? 'positive' : lowRoiPercent < 0.3 ? 'neutral' : 'negative',
            details: [
              `Low-value activities: ${lowContribActivities}/${totalActivities}`,
              `Waste percentage: ${(lowRoiPercent * 100).toFixed(0)}%`,
              `Recovery potential: $${((wastedSalary * 0.7) / 1000).toFixed(1)}M`,
            ],
          };
        case 'Attrition Pipeline Cost':
          return {
            title: 'Attrition Pipeline Cost',
            value: `$${(attritionCost / 1000).toFixed(1)}M`,
            insight: `Replacement cost for ${disengagedCount} disengaged worker activities. ${disengagedCount > totalActivities * 0.2 ? 'High flight risk detected' : 'Retention risk manageable'}.`,
            trend: disengagedCount < totalActivities * 0.15 ? 'positive' : disengagedCount < totalActivities * 0.25 ? 'neutral' : 'negative',
            details: [
              `Disengaged activities: ${disengagedCount}/${totalActivities}`,
              `Flight risk: ${((disengagedCount / Math.max(totalActivities, 1)) * 100).toFixed(0)}%`,
              `Avg replacement cost: $${perEmployeeCost.toFixed(0)}k`,
            ],
          };
        case 'Process Friction Tax':
          return {
            title: 'Process Friction Tax',
            value: `$${(frictionTax / 1000).toFixed(1)}M`,
            insight: `Efficiency loss from ${avgLegacyBurden.toFixed(0)}% legacy process burden. ${avgLegacyBurden > 50 ? 'Digital transformation priority' : 'Process optimization opportunity'}.`,
            trend: avgLegacyBurden < 30 ? 'positive' : avgLegacyBurden < 50 ? 'neutral' : 'negative',
            details: [
              `Legacy burden: ${avgLegacyBurden.toFixed(0)}%`,
              `Friction cost: $${((frictionTax / totalEmployees) / 1000).toFixed(1)}k/employee`,
              `Modernization ROI: ${((salaryBudget * 0.1) / (frictionTax || 1)).toFixed(1)}x`,
            ],
          };
        case 'Compliance & Legal Exposure':
          return {
            title: 'Compliance & Legal Exposure',
            value: `$${(complianceExposure / 1000).toFixed(1)}M`,
            insight: `Baseline regulatory and legal risk reserve at 2% of salary budget. ${avgBurnout > 6 ? 'Elevated burnout increases litigation risk' : 'Standard risk profile'}.`,
            trend: avgBurnout < 5 ? 'positive' : 'neutral',
            details: [
              `Base exposure: 2% of budget`,
              `Burnout multiplier: ${avgBurnout > 6 ? '1.5x' : '1.0x'}`,
              `Mitigation status: ${avgOrgHealth > 6 ? 'Adequate' : 'Review recommended'}`,
            ],
          };
        default:
          return { title: label, value: '$0M', insight: '', trend: 'neutral' as const, details: [] };
      }
    };

    return {
      assets: [
        { label: 'Engaged Workforce Value', value: `$${(engagedWorkforceValue / 1000).toFixed(1)}M`, tooltip: getAssetInsight('Engaged Workforce Value') },
        { label: 'High-HSI Talent Capital', value: `$${(highHsiTalentCapital / 1000).toFixed(1)}M`, tooltip: getAssetInsight('High-HSI Talent Capital') },
        { label: 'Innovation Capacity Reserve', value: `$${(innovationCapacity / 1000).toFixed(1)}M`, tooltip: getAssetInsight('Innovation Capacity Reserve') },
        { label: 'Succession Pipeline Depth', value: `$${(successionPipeline / 1000).toFixed(1)}M`, tooltip: getAssetInsight('Succession Pipeline Depth') },
        { label: 'Capability & Knowledge Base', value: `$${(capabilityBase / 1000).toFixed(1)}M`, tooltip: getAssetInsight('Capability & Knowledge Base') },
        { blank: true, label: '', value: '' },
        { label: 'TOTAL HC ASSETS', value: `$${(totalAssets / 1000).toFixed(1)}M`, bold: true, color: '#34d399' },
      ],
      liabilities: [
        { label: 'Burnout Risk Cost', value: `$${(burnoutRiskCost / 1000).toFixed(1)}M`, tooltip: getLiabilityInsight('Burnout Risk Cost') },
        { label: 'Wasted Salary (Low-ROI Activity)', value: `$${(wastedSalary / 1000).toFixed(1)}M`, tooltip: getLiabilityInsight('Wasted Salary (Low-ROI Activity)') },
        { label: 'Attrition Pipeline Cost', value: `$${(attritionCost / 1000).toFixed(1)}M`, tooltip: getLiabilityInsight('Attrition Pipeline Cost') },
        { label: 'Process Friction Tax', value: `$${(frictionTax / 1000).toFixed(1)}M`, tooltip: getLiabilityInsight('Process Friction Tax') },
        { label: 'Compliance & Legal Exposure', value: `$${(complianceExposure / 1000).toFixed(1)}M`, tooltip: getLiabilityInsight('Compliance & Legal Exposure') },
        { blank: true, label: '', value: '' },
        { label: 'TOTAL HC LIABILITIES', value: `$${(totalLiabilities / 1000).toFixed(1)}M`, bold: true, color: '#f43f5e' },
      ],
      netPosition: net / 1000,
      quarterGrowth: growth / 1000,
      rawMetrics: metrics,
    };
  }, [data]);

  const netValue = useCounter(netPosition, 1.4, 0.8);

  const handleHover = (show: boolean, data?: TooltipData) => {
    setTooltip(prev => ({ 
      ...prev, 
      visible: show, 
      data: show ? data : undefined 
    }));
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-12 text-center border border-dashed border-white/10" style={{ background: 'var(--bg-card)' }}>
        <p className="text-xs text-white/40 uppercase tracking-widest">Loading Balance Sheet Data...</p>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center border border-dashed border-white/10" style={{ background: 'var(--bg-card)' }}>
        <p className="text-xs text-white/40 uppercase tracking-widest">Awaiting Diagnostic Data...</p>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {tooltip.visible && tooltip.data && (
          <Tooltip 
            data={tooltip.data} 
            visible={tooltip.visible} 
            x={tooltip.x} 
            y={tooltip.y} 
          />
        )}
      </AnimatePresence>

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
              {assets.map((item, i) =>
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
                      tooltip={item.tooltip}
                      onHover={handleHover}
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
              {liabilities.map((item, i) =>
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
                      tooltip={item.tooltip}
                      onHover={handleHover}
                    />
                  </motion.div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer: Net position */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderTop: '1px solid var(--border-1)',
            background: 'rgba(52,211,153,0.03)',
          }}
        >
          <span
            className="text-xs font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'white' }}
          >
            NET HUMAN CAPITAL POSITION
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-black font-mono"
              style={{ color: '#34d399' }}
            >
              ${netValue.toFixed(1)}M
            </span>
            <span
              className="text-[10px]"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
            >
              ({quarterGrowth >= 0 ? '+' : ''}${quarterGrowth.toFixed(1)}M this quarter)
            </span>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default HumanCapitalBalanceSheet;
