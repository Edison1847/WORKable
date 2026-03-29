import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Crown, CheckCircle2, Activity, Target, X, Lock, Unlock, FileText, TrendingDown, AlertTriangle, Eye, Zap, BarChart3 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// METRIC COMPUTATION ENGINE — Top-3-of-5 Dynamic Sorting
// ─────────────────────────────────────────────────────────────────
interface MetricResult {
  id: string;
  title: string;
  headline: string;
  detail: string;
  score: number; // 0-100 severity
  icon: any;
  color: string;
  gradient: string;
}

function computeTop3Metrics(allDiags: any[], employees: any[], ceoName: string): MetricResult[] {
  const supAudits = allDiags.filter(d => d.type === 'supervisor' && (d.status === 'complete' || d.p3));
  const workerAudits = allDiags.filter(d => d.type === 'worker' && (d.status === 'complete' || d.payload?.status === 'complete'));
  const ceoAudits = allDiags.filter(d => d.type === 'ceo_audit' && (d.status === 'complete' || d.p3));

  const metrics: MetricResult[] = [];

  // ── 1. PERCEPTION GAP INDEX ──────────────────────────────────
  {
    let totalGap = 0, count = 0;
    employees.forEach((emp: any) => {
      const supForEmp = supAudits.find(d => d.employee_name?.toLowerCase() === emp.name?.toLowerCase());
      const wrkForEmp = workerAudits.find(d => d.employee_name?.toLowerCase() === emp.name?.toLowerCase());
      const supClarity = supForEmp?.p1?.clarity ?? supForEmp?.clarity;
      const wrkClarity = wrkForEmp?.p1?.targetClarity ?? wrkForEmp?.targetClarity ?? wrkForEmp?.p1?.clarity;
      if (supClarity != null && wrkClarity != null) {
        totalGap += Math.abs(supClarity - wrkClarity);
        count++;
      }
    });
    const avgGap = count > 0 ? totalGap / count : 0;
    const score = Math.min(100, avgGap * 12); // 1pt gap = 12% severity
    metrics.push({
      id: 'perception_gap',
      title: 'Perception Gap Index',
      headline: count > 0
        ? `${avgGap.toFixed(1)}/10 avg disconnect between manager & team clarity ratings`
        : 'Managers and workers see role clarity differently',
      detail: count > 0
        ? `Normal: High-performing companies keep this gap below 5%. \nMeaning: Your managers and their teams see the world differently. \nImpact: This slows down work because people aren't on the same page. \nAction: Start a honest conversation with your managers to get everyone aligned.`
        : 'Comparing manager and worker views reveals where people are seeing tasks differently in your company.',
      score: Math.max(score, 35), // minimum baseline for always-relevant metric
      icon: Eye,
      color: 'text-rose-400',
      gradient: 'from-rose-500/20 to-rose-900/5'
    });
  }

  // ── 2. HIDDEN CAPACITY LEAK ──────────────────────────────────
  {
    let totalLowCritTime = 0, totalActivities = 0, highMeetingCount = 0, totalPeople = 0;
    const allAuditsWithDetails = [...supAudits, ...workerAudits, ...ceoAudits].filter(d => d.activityDetails);
    allAuditsWithDetails.forEach(d => {
      const details = d.activityDetails || [];
      details.forEach((act: any) => {
        totalActivities++;
        if (act.criticality === 'Low') totalLowCritTime += (act.percentTime || 0);
      });
      const meetRatio = d.p3?.meetingsVsFocus ?? d.p4?.meetingRatio ?? d.meetingsVsFocus;
      if (meetRatio != null) {
        totalPeople++;
        if (meetRatio > 50) highMeetingCount++;
      }
    });
    const meetingPct = totalPeople > 0 ? Math.round((highMeetingCount / totalPeople) * 100) : 0;
    const lowCritPct = totalActivities > 0 ? Math.round((totalLowCritTime / (totalActivities * 100)) * 100) : 0;
    const score = Math.min(100, meetingPct * 0.6 + lowCritPct * 0.8);
    metrics.push({
      id: 'capacity_leak',
      title: 'Hidden Capacity Leak',
      headline: `${meetingPct}% of staff spend >50% of their week in meetings`,
      detail: `Normal: Top companies keep meeting time below 20%. \nMeaning: Most of your team's week is spent talking in meetings instead of doing work. \nImpact: You are losing valuable "quiet time" where the real work gets done. \nAction: Cancel unnecessary meetings or try "No-Meeting" days each week.`,
      score: Math.max(score, 28),
      icon: TrendingDown,
      color: 'text-amber-400',
      gradient: 'from-amber-500/20 to-amber-900/5'
    });
  }

  // ── 3. BURNOUT FLIGHT RISK ───────────────────────────────────
  {
    let flightRisks: string[] = [];
    let highCritOwnership = 0, totalHighCrit = 0;
    const allAuditsWithP1 = [...supAudits, ...ceoAudits].filter(d => d.p1);
    allAuditsWithP1.forEach(d => {
      const burnout = d.p1?.burnout ?? 0;
      const details = d.activityDetails || [];
      const hasHighEngagement = details.some((a: any) => a.engaged === 'high');
      const highCritCount = details.filter((a: any) => a.criticality === 'High').length;
      totalHighCrit += highCritCount;
      if (burnout >= 4 && hasHighEngagement) {
        flightRisks.push(d.employee_name || d.name || 'Unknown');
        highCritOwnership += highCritCount;
      }
    });
    const ownershipPct = totalHighCrit > 0 ? Math.round((highCritOwnership / totalHighCrit) * 100) : 0;
    const score = Math.min(100, flightRisks.length * 25 + ownershipPct * 0.5);
    metrics.push({
      id: 'burnout_risk',
      title: 'Burnout Flight Risk',
      headline: flightRisks.length > 0
        ? `${flightRisks.length} high-burnout, high-engagement employees detected`
        : 'Monitoring burnout-to-engagement correlation',
      detail: flightRisks.length > 0
        ? `Normal: High-risk areas should be below 2%. \nMeaning: Your best people are working hard but are very close to quitting. \nImpact: If they leave, you lose ${ownershipPct}% of your most important work today. \nAction: Talk to ${flightRisks.join(', ')} today and help them reduce their workload.`
        : 'People who work hard but are very tired are your biggest risk. Finding them early helps you keep your best talent.',
      score: Math.max(score, 30),
      icon: AlertTriangle,
      color: 'text-red-400',
      gradient: 'from-red-500/20 to-red-900/5'
    });
  }

  // ── 4. REALITY MATRIX ────────────────────────────────────────
  {
    let totalVariance = 0, count = 0;
    employees.forEach((emp: any) => {
      const sup = supAudits.find(d => d.employee_name?.toLowerCase() === emp.name?.toLowerCase());
      const wrk = workerAudits.find(d => d.employee_name?.toLowerCase() === emp.name?.toLowerCase());
      if (sup?.p1 && wrk?.p1) {
        const supHrs = sup.p1.weeklyHrs ?? sup.p1.weeklyHrs ?? 40;
        const wrkHrs = wrk.p1.weeklyHrs ?? wrk.weeklyHrs ?? 40;
        const supBurn = sup.p1.burnout ?? 3;
        const wrkBurn = wrk.p1.burnout ?? wrk.burnout ?? 3;
        totalVariance += Math.abs(supHrs - wrkHrs) + Math.abs(supBurn - wrkBurn) * 5;
        count++;
      }
    });
    const avgVar = count > 0 ? totalVariance / count : 0;
    const score = Math.min(100, avgVar * 4);
    metrics.push({
      id: 'reality_matrix',
      title: 'Reality Matrix',
      headline: count > 0
        ? `${avgVar.toFixed(0)}-point avg variance between supervisor & worker self-assessments`
        : 'Supervisor vs Worker reality check',
      detail: count > 0
        ? `Normal: High-performing companies aim for a difference below 5%. \nMeaning: What your managers think is happening is not what is actually happening on the ground. \nImpact: You are putting people and money in the wrong places. \nAction: Get your managers to spend more time listening to what's really going on.`
        : 'Comparing manager reports with worker reports shows if your leadership team really knows what is happening.',
      score: Math.max(score, 22),
      icon: BarChart3,
      color: 'text-blue-400',
      gradient: 'from-blue-500/20 to-blue-900/5'
    });
  }

  // ── 5. CEO BLINDSPOT DETECTOR ────────────────────────────────
  {
    let blindspotScore = 0, count = 0;
    ceoAudits.forEach(ceo => {
      const empName = ceo.employee_name || ceo.name;
      const wrk = workerAudits.find(d => d.employee_name?.toLowerCase() === empName?.toLowerCase());
      const teamAudits = supAudits.filter(d => d.supervisorName?.toLowerCase() === empName?.toLowerCase());
      if (ceo.p1 && wrk?.p1) {
        const ceoClarity = ceo.p1.clarity ?? 5;
        const wrkClarity = wrk.p1.targetClarity ?? wrk.p1.clarity ?? 5;
        blindspotScore += Math.abs(ceoClarity - wrkClarity) * 3;
        count++;
      }
      if (ceo.p1 && teamAudits.length > 0) {
        const ceoEnthusiasm = ceo.p3?.enthusiasm ?? 3;
        const teamAvg = teamAudits.reduce((s: number, t: any) => s + (t.p3?.enthusiasm ?? 3), 0) / teamAudits.length;
        blindspotScore += Math.abs(ceoEnthusiasm - teamAvg) * 5;
        count++;
      }
    });
    const avg = count > 0 ? blindspotScore / count : 0;
    const score = Math.min(100, avg * 5);
    metrics.push({
      id: 'ceo_blindspot',
      title: 'CEO Blindspot Detector',
      headline: count > 0
        ? `${avg.toFixed(0)}-point discrepancy between CEO view & ground truth`
        : 'Triangulating executive perception against organizational reality',
      detail: count > 0
        ? `Normal: The difference in your view should be under 10%. \nMeaning: Your view of the company is out of sync with what's really happening. \nImpact: You might be making big decisions based on the wrong information. \nAction: Spend some time on the "front line" to reset your view of the team's energy.`
        : 'By comparing your executive view with worker and team data, we see where your view of the company is different from reality.',
      score: Math.max(score, 25),
      icon: Zap,
      color: 'text-violet-400',
      gradient: 'from-violet-500/20 to-violet-900/5'
    });
  }

  // Sort by score descending, return top 3
  return metrics.sort((a, b) => b.score - a.score).slice(0, 3);
}


// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function CEOAuditFlow() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [phase, setPhase] = useState(0);
  const [ceoName, setCeoName] = useState('');
  const [auditeeName, setAuditeeName] = useState('');
  const [localCompleted, setLocalCompleted] = useState<string[]>([]);

  // Form State
  const [p1, setP1] = useState({ clarity: 5, weeklyHrs: 40, burnout: 3, capabilityGap: 5 });
  const [activities, setActivities] = useState<string[]>([]);
  const [activityInput, setActivityInput] = useState('');
  const [activityDetails, setActivityDetails] = useState<any[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [p3, setP3] = useState({
    targetsAchievable: 'Neutral', whoReviews: '', reviewFrequency: 'Monthly', blockers: '', improvements: '', meetingsVsFocus: 50, enthusiasm: 3
  });

  // Mini-Report Overlay State
  const [showMiniReport, setShowMiniReport] = useState(false);
  const [animPhase, setAnimPhase] = useState(0); // 0: vault-enter, 1: unlocking, 2: reveal-report
  const [topMetrics, setTopMetrics] = useState<MetricResult[]>([]);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [companyRes, intakeRes] = await Promise.all([
          fetch('http://localhost:3000/api/company-setup'),
          fetch('http://localhost:3000/api/intake')
        ]);
        const companyJson = await companyRes.json();
        const intakeJson = await intakeRes.json();
        
        setData({ 
          company_setup: companyJson || {},
          all_diagnostics: intakeJson?.all_diagnostics || []
        });

        const employees = companyJson?.employees || [];
        const topLevel = employees.find((e: any) => !e.manager || e.manager.trim() === '' || e.manager.toLowerCase() === 'none');
        if (topLevel) setCeoName(topLevel.name);

      } catch (err) { } finally { setIsLoading(false); }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
  }, [phase, carouselIndex, auditeeName]);

  if (isLoading || !data) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center font-display">
        <div className="text-emerald-500 animate-pulse font-medium">Initializing Executive Interface...</div>
      </div>
    );
  }

  const employees = data.company_setup.employees || [];
  
  const getRemainingSubordinates = () => {
    if (!ceoName) return [];
    const historical = (data.all_diagnostics || [])
      .filter((d: any) => d.type === 'ceo_audit' && d.supervisorName === ceoName && (d.status === 'complete' || d.p3))
      .map((d: any) => d.employee_name?.trim().toLowerCase());
    const allCompleted = [...historical, ...localCompleted.map(l => l.trim().toLowerCase())];
    return employees.filter((e: any) => e.manager === ceoName && !allCompleted.includes(e.name?.trim().toLowerCase()));
  };

  const getCompletedSubordinates = () => {
    if (!ceoName) return [];
    const historical = (data.all_diagnostics || [])
      .filter((d: any) => d.type === 'ceo_audit' && d.supervisorName === ceoName && (d.status === 'complete' || d.p3))
      .map((d: any) => d.employee_name?.trim().toLowerCase());
    const allCompleted = [...historical, ...localCompleted.map(l => l.trim().toLowerCase())];
    return employees.filter((e: any) => e.manager === ceoName && allCompleted.includes(e.name?.trim().toLowerCase()));
  };

  const pendingReports = getRemainingSubordinates();
  const completedReports = getCompletedSubordinates();
  const allReportsDone = pendingReports.length === 0 && completedReports.length > 0;

  const saveDraft = async (pageData: any, status: 'draft' | 'complete') => {
    const payload = {
      supervisorName: ceoName, ...pageData, status, name: auditeeName, dept: 'Executive'
    };
    try {
      // 1. Save as CEO Audit (for executive logic/filtering)
      await fetch('http://localhost:3000/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: data.company_setup?.company?.id || 1, type: 'ceo_audit', intake_data: payload })
      });

      // 2. Save as Supervisor Audit (for standard analytical tracking)
      await fetch('http://localhost:3000/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: data.company_setup?.company?.id || 1, type: 'supervisor', intake_data: payload })
      });
    } catch (err) {}
  };

  const selectAuditee = (name: string) => {
    setAuditeeName(name);
    setP1({ clarity: 5, weeklyHrs: 40, burnout: 3, capabilityGap: 5 });
    setActivities([]);
    setActivityDetails([]);
    setCarouselIndex(0);
    setP3({ targetsAchievable: 'Neutral', whoReviews: '', reviewFrequency: 'Monthly', blockers: '', improvements: '', meetingsVsFocus: 50, enthusiasm: 3 });
    setPhase(1);
  };

  const goPhase2 = () => {
    if (activities.length === 0) return;
    if (activityDetails.length !== activities.length) {
      setActivityDetails(activities.map(a => ({
        name: a, criticality: 'Med', percentTime: 20, engaged: 'Neutral', goodDefined: 'Yes', skillMatch: 'Match'
      })));
    }
    saveDraft({ p1, activities }, 'draft');
    setPhase(2);
  };

  const advanceCarousel = () => {
    if (carouselIndex < activities.length - 1) {
      setCarouselIndex(carouselIndex + 1);
    } else {
      saveDraft({ p1, activities, activityDetails }, 'draft');
      setPhase(3);
    }
  };

  // ── SEAL CALIBRATION — The Core Finalization Logic ────────────
  const finishAudit = async () => {
    const newLocal = [...localCompleted, auditeeName];
    setLocalCompleted(newLocal);
    await saveDraft({ p1, activities, activityDetails, p3 }, 'complete');

    // Check: is this the LAST worker?
    const historicalCompleted = (data.all_diagnostics || [])
      .filter((d: any) => d.type === 'ceo_audit' && d.supervisorName === ceoName && (d.status === 'complete' || d.p3))
      .map((d: any) => d.employee_name?.trim().toLowerCase());
    const allCompletedNow = [...historicalCompleted, ...newLocal.map(l => l.trim().toLowerCase())];
    const stillPending = employees.filter((e: any) => e.manager === ceoName && !allCompletedNow.includes(e.name?.trim().toLowerCase()));

    if (stillPending.length === 0) {
      // ── FINAL WORKER: Trigger the Mini-Report Overlay ──
      // Re-fetch fresh data for accurate metric computation
      try {
        const freshRes = await fetch('http://localhost:3000/api/intake');
        const freshJson = await freshRes.json();
        const allDiags = freshJson?.all_diagnostics || [];
        const metrics = computeTop3Metrics(allDiags, employees, ceoName);
        setTopMetrics(metrics);
      } catch {
        setTopMetrics(computeTop3Metrics(data.all_diagnostics || [], employees, ceoName));
      }
      
      // Start the unboxing animation sequence
      setAnimPhase(0);
      setShowMiniReport(true);
      setTimeout(() => setAnimPhase(1), 1200);  // vault unlocks
      setTimeout(() => setAnimPhase(2), 2800);  // report reveals
    } else {
      // More workers remain — go back to selector
      setAuditeeName('');
      setPhase(0);
    }
  };

  const handleAddActivity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activityInput.trim() && activities.length < 20) {
      e.preventDefault();
      setActivities([...activities, activityInput.trim()]);
      setActivityInput('');
    }
  };
  const removeActivity = (idx: number) => setActivities(activities.filter((_, i) => i !== idx));

  return (
    <div className="h-screen overflow-hidden bg-slate-950 flex flex-col pt-12 px-4 pb-8 font-display relative">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-6 left-6 cursor-pointer" onClick={() => navigate('/intake')}>
        <div className="font-semibold text-xl tracking-tight text-white">
          WORKable<span className="text-emerald-500"> Executive</span>
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto relative z-10 flex flex-col flex-1 min-h-0 bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] shadow-2xl overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div key="selector" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-800 text-emerald-400 flex items-center justify-center mb-6 shadow-inner border border-emerald-500/20">
                  <Crown size={32} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">CEO Audit Directive</h2>
                <p className="text-slate-400 text-sm mb-8">Executive review of direct reports. Evaluate alignment and strategic execution.</p>

                {allReportsDone ? (
                   <motion.div 
                     animate={{ y: [-8, 8, -8] }}
                     transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                     className="p-8 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-center mb-6 shadow-lg shadow-emerald-900/20"
                   >
                      <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Executive Audit Complete</h3>
                      <p className="text-emerald-200/60 text-sm mb-6">All direct reports have been evaluated successfully.</p>
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => window.open('http://localhost:5173', '_blank')} 
                          className="group px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-3"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Activity size={18} className="text-white" />
                          </motion.div>
                          WORKable Dashboard
                        </button>
                        <button 
                          onClick={() => navigate('/')} 
                          className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all"
                        >
                          Home
                        </button>
                      </div>
                   </motion.div>
                ) : (
                  <>
                    <div className="mb-6 flex justify-between items-end">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Direct Reports ({pendingReports.length} pending)</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      {pendingReports.map((emp: any, i: number) => (
                        <motion.div 
                          key={emp.name}
                          onClick={() => selectAuditee(emp.name)} 
                          animate={{ x: [0, (i % 2 === 0 ? 4 : -4), 0], y: [0, (i % 3 === 0 ? -5 : 5), 0] }}
                          transition={{ duration: 5 + (i % 3), repeat: Infinity, ease: "easeInOut" }}
                          whileHover={{ scale: 1.05, x: 0, y: 0, transition: { duration: 0.2 } }}
                          className="group relative aspect-square flex flex-col items-center justify-center p-6 rounded-[2.5rem] bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 hover:border-emerald-500/50 cursor-pointer transition-all shadow-xl hover:shadow-emerald-500/10 overflow-hidden text-center"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-emerald-500/20 to-slate-900 text-emerald-400 flex items-center justify-center font-bold text-2xl shadow-inner border border-emerald-500/20 group-hover:border-emerald-500/40 transition-all group-hover:scale-110">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors leading-tight">{emp.name}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 opacity-70">{emp.title || 'Executive Report'}</p>
                            </div>
                          </div>
                          <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Audit Report</span>
                          </div>
                          <div className="absolute top-4 right-4 text-slate-700 group-hover:text-emerald-500/30 transition-colors">
                            <Activity size={14} />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {completedReports.length > 0 && (
                      <div className="mt-10">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Completed Evaluations</h4>
                        <div className="flex flex-col gap-3">
                          {completedReports.map((emp: any) => (
                            <div key={emp.name} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-800/50 opacity-60">
                              <span className="text-slate-300 font-medium">{emp.name}</span>
                              <CheckCircle2 size={16} className="text-emerald-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {phase === 1 && (
              <motion.div key="phase1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-8">
                  <div className="flex items-center gap-3 text-emerald-500 mb-2">
                    <Target size={20} /> <span className="font-bold text-[10px] tracking-widest uppercase">Phase 1: Diagnosis</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Evaluating {auditeeName}
                    <span className="text-emerald-500/50 ml-3 text-lg font-medium">— {employees.find((e: any) => e.name === auditeeName)?.role || 'Executive Report'}</span>
                  </h2>
                  <p className="text-slate-400 text-sm">Define their core operational metrics.</p>
                </div>

                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3">Role Clarity (1-10)</label>
                    <input type="range" min="1" max="10" value={p1.clarity} onChange={e => setP1({...p1, clarity: parseInt(e.target.value)})} className="w-full accent-emerald-500" />
                    <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-bold uppercase"><span className="text-red-400">Vague</span><span className="text-emerald-400">Crystal Clear</span></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3">Weekly Hours</label>
                      <input type="number" min="0" max="100" value={p1.weeklyHrs} onChange={e => setP1({...p1, weeklyHrs: parseInt(e.target.value)})} 
                             className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3">Burnout Risk (1-5)</label>
                      <input type="range" min="1" max="5" value={p1.burnout} onChange={e => setP1({...p1, burnout: parseInt(e.target.value)})} className="w-full accent-red-500 mt-2" />
                    </div>
                  </div>

                  <div className="mt-8">
                     <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3">Core Activities & Responsibilities</label>
                     <div className="flex gap-2 mb-4">
                        <input type="text" value={activityInput} onChange={e=>setActivityInput(e.target.value)} onKeyDown={handleAddActivity} placeholder="E.g. Quarterly Strategic Planning" 
                               className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none" />
                        <button onClick={() => { if(activityInput.trim() && activities.length < 20) { setActivities([...activities, activityInput.trim()]); setActivityInput(''); } }}
                                className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">Add</button>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {activities.map((act, i) => (
                           <span key={i} className="pl-3 pr-2 py-1.5 rounded-lg bg-emerald-900/30 text-emerald-300 border border-emerald-500/20 text-sm flex items-center gap-2">
                             {act} <button onClick={() => removeActivity(i)} className="p-0.5 hover:bg-emerald-800/50 rounded"><X size={14} /></button>
                           </span>
                        ))}
                     </div>
                  </div>

                  <button onClick={goPhase2} disabled={activities.length === 0} 
                          className="w-full py-4 mt-8 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    Deep Dive Activities <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 2 && activityDetails.length > 0 && (
              <motion.div key="phase2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-6 flex justify-between items-center text-slate-400 text-[10px] font-bold tracking-widest uppercase">
                  <span>Activity Deep Dive</span>
                  <span>{carouselIndex + 1} / {activities.length}</span>
                </div>
                
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-[2rem] p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700/50">
                    <h3 className="text-2xl font-bold text-white leading-tight">{activityDetails[carouselIndex].name}</h3>
                    <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-tighter">Strategic Impact</div>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Criticality</label>
                        <div className="flex gap-2">
                          {['Low', 'Med', 'High'].map(opt => (
                            <button key={opt} onClick={() => { const n = [...activityDetails]; n[carouselIndex].criticality = opt; setActivityDetails(n); }}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${activityDetails[carouselIndex].criticality === opt ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-700'}`}>{opt}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">{"What % of this person's week do you expect each activity to consume?"} ({activityDetails[carouselIndex].percentTime}%)</label>
                        <input type="range" className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer" min="0" max="100" value={activityDetails[carouselIndex].percentTime} 
                               onChange={(e) => { const n = [...activityDetails]; n[carouselIndex].percentTime = parseInt(e.target.value); setActivityDetails(n); }} />
                        <div className="flex justify-between mt-1 text-[8px] font-bold text-slate-600 uppercase"><span>Focus</span><span>Intensive</span></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Employee Engagement</label>
                        <div className="flex gap-2">
                          {['low', 'neutral', 'high'].map(opt => (
                            <button key={opt} onClick={() => { const n = [...activityDetails]; n[carouselIndex].engaged = opt; setActivityDetails(n); }}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border capitalize transition-all ${activityDetails[carouselIndex].engaged === opt ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-700'}`}>{opt}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">{"Definition of \"Good\" Clear?"}</label>
                        <div className="flex gap-2">
                          {['No', 'Pending', 'Yes'].map(opt => (
                            <button key={opt} onClick={() => { const n = [...activityDetails]; n[carouselIndex].goodDefined = opt; setActivityDetails(n); }}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${activityDetails[carouselIndex].goodDefined === opt ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-700'}`}>{opt}</button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Capability / Skill Alignment</label>
                      <div className="flex gap-3">
                        {['Stretched', 'Match', 'Misaligned'].map(opt => (
                          <button key={opt} onClick={() => { const n = [...activityDetails]; n[carouselIndex].skillMatch = opt; setActivityDetails(n); }}
                                  className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${activityDetails[carouselIndex].skillMatch === opt ? 'bg-white text-slate-900 border-white shadow-xl' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-700'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-10">
                  <button onClick={() => setPhase(1)} className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:text-white transition-all hover:bg-slate-800/50">Back</button>
                  <button onClick={advanceCarousel} className="px-10 py-4 rounded-2xl font-bold bg-white text-slate-900 hover:bg-slate-200 transition-all shadow-xl hover:shadow-white/10 flex items-center gap-2">
                    {carouselIndex < activities.length - 1 ? 'Next Activity' : 'Final Calibration'} <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 3 && (
              <motion.div key="phase3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-8">
                  <div className="flex items-center gap-3 text-amber-500 mb-2">
                    <Activity size={20} /> <span className="font-bold text-[10px] tracking-widest uppercase">Phase 3: Final Calibration</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Strategic Review: {auditeeName}</h2>
                  <p className="text-slate-400 text-sm">Synchronize expectations and operational blockers.</p>
                </div>

                <div className="space-y-8 pb-12">
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2rem] p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Are targets genuinely achievable?</label>
                        <select className="w-full bg-slate-900/80 border border-slate-700 text-white text-xs rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all font-bold"
                                value={p3.targetsAchievable} onChange={e => setP3({...p3, targetsAchievable: e.target.value})}>
                          <option>Unrealistic</option><option>Neutral</option><option>Achievable</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Responsible for Reviewing Work</label>
                        <select className="w-full bg-slate-900/80 border border-slate-700 text-white text-xs rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all font-bold"
                                value={p3.whoReviews || ceoName} onChange={e => setP3({...p3, whoReviews: e.target.value})}>
                          {(() => {
                            const getSuperiors = (name: string): any[] => {
                              const emp = employees.find((e: any) => e.name === name);
                              if (!emp || !emp.manager || emp.manager.toLowerCase() === 'none') return [];
                              const mgr = employees.find((e: any) => e.name === emp.manager);
                              if (!mgr) return [emp.manager];
                              return [mgr.name, ...getSuperiors(mgr.name)];
                            };
                            const superiors = Array.from(new Set([ceoName, ...getSuperiors(auditeeName)]));
                            return superiors.map(s => {
                              const mgrData = employees.find((e: any) => e.name === s);
                              return <option key={s} value={s}>{s} {s === ceoName ? '(CEO)' : `(${mgrData?.role || 'Superior'})`}</option>;
                            });
                          })()}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Review Frequency</label>
                        <select className="w-full bg-slate-900/80 border border-slate-700 text-white text-xs rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all font-bold"
                                value={p3.reviewFrequency || 'Monthly'} onChange={e => setP3({...p3, reviewFrequency: e.target.value})}>
                          <option>Monthly</option><option>Quarterly</option><option>Yearly</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Energy & Enthusiasm (1-5)</label>
                        <input type="range" min="1" max="5" value={p3.enthusiasm} onChange={e => setP3({...p3, enthusiasm: parseInt(e.target.value)})} className="w-full accent-amber-500 mt-2" />
                        <div className="flex justify-between mt-1 text-[8px] font-bold text-slate-600 uppercase"><span>Passive</span><span>Highly Energized</span></div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Meetings vs. Focused Work: {p3.meetingsVsFocus}% Meetings</label>
                      <input type="range" className="w-full h-2 bg-slate-900 rounded-lg cursor-pointer accent-blue-500" min="0" max="100" value={p3.meetingsVsFocus} 
                             onChange={(e) => setP3({...p3, meetingsVsFocus: parseInt(e.target.value)})} />
                      <div className="flex justify-between mt-1 text-[8px] font-bold text-slate-600 uppercase"><span>Deep Focus</span><span>Meeting Intensive</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2rem] p-8 space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">What prevents full effectiveness?</label>
                      <textarea rows={2} className="w-full bg-slate-900/80 border border-slate-700 text-white text-xs rounded-xl p-4 outline-none focus:border-emerald-500 transition-all"
                                placeholder="Describe systemic blockers..." value={p3.blockers} onChange={e => setP3({...p3, blockers: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">What changes would most improve effectiveness?</label>
                      <textarea rows={2} className="w-full bg-slate-900/80 border border-slate-700 text-white text-xs rounded-xl p-4 outline-none focus:border-emerald-500 transition-all font-medium"
                                placeholder="Process changes, resources, or management support..." value={p3.improvements} onChange={e => setP3({...p3, improvements: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button onClick={() => setPhase(2)} className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:text-white transition-all hover:bg-slate-800/50">Back</button>
                    <button onClick={finishAudit} className="px-12 py-4 rounded-2xl font-bold bg-emerald-500 text-white shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_35px_-5px_rgba(16,185,129,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                       Seal Calibration <CheckCircle2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MINI-REPORT OVERLAY — THE UNBOXING SEQUENCE
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showMiniReport && (
          <motion.div
            key="mini-report-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            {/* ── Phase 0 & 1: The Data Vault ── */}
            {animPhase < 2 && (
              <motion.div
                initial={{ scale: 0.3, opacity: 0, rotateY: -30 }}
                animate={{ 
                  scale: animPhase === 0 ? 1 : 1.05, 
                  opacity: 1, 
                  rotateY: animPhase === 0 ? 0 : 5
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Vault Icon */}
                <motion.div 
                  className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-500/10 relative overflow-hidden"
                  animate={animPhase === 1 ? { borderColor: ['rgba(16,185,129,0.3)', 'rgba(16,185,129,0.8)', 'rgba(16,185,129,0.3)'] } : {}}
                  transition={{ duration: 1, repeat: 2 }}
                >
                  {/* Shimmer */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                  />
                  
                  <motion.div
                    animate={animPhase === 1 ? { rotate: [0, -15, 0], scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    {animPhase === 0 
                      ? <Lock size={56} className="text-emerald-500/60" />
                      : <Unlock size={56} className="text-emerald-400" />
                    }
                  </motion.div>
                </motion.div>

                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-slate-300 text-sm font-medium tracking-wide"
                >
                  {animPhase === 0 ? 'Accessing secure data vault...' : 'Decrypting executive intelligence...'}
                </motion.p>
              </motion.div>
            )}

            {/* ── Phase 2: The Report Reveal ── */}
            {animPhase === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto custom-scrollbar"
              >
                <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-[2.5rem] shadow-2xl shadow-emerald-500/5 overflow-hidden">
                  {/* Header */}
                  <div className="relative px-10 pt-10 pb-8 border-b border-slate-800/80">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500" />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-start gap-5"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-slate-800 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <FileText size={28} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Executive Intelligence Report</p>
                        <h2 className="text-2xl font-bold text-white leading-tight">We are ready to give you the 1st mini-report</h2>
                        <p className="text-slate-400 text-xs mt-2 leading-relaxed">Based on cross-referencing all audit data, here are your top 3 strategic insights ranked by organizational impact.</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Metrics */}
                  <div className="px-10 py-8 space-y-5">
                    {topMetrics.map((metric, i) => (
                      <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.25, duration: 0.6 }}
                        className={`p-6 rounded-2xl bg-gradient-to-br ${metric.gradient} border border-slate-700/50 relative overflow-hidden group`}
                      >
                        {/* Score badge */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[9px] font-black uppercase tracking-wide ${metric.color}`}>
                            Severity: {metric.score}%
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-center flex-shrink-0 ${metric.color}`}>
                            <metric.icon size={20} />
                          </div>
                          <div className="pr-24">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${metric.color}`}>{metric.title}</p>
                            <p className="text-white font-bold text-sm leading-snug mb-2">{metric.headline}</p>
                            <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap">{metric.detail}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-10 pb-10 pt-4">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 }}
                      onClick={() => {
                        setShowMiniReport(false);
                        setAuditeeName('');
                        setPhase(0);
                      }}
                      className="w-full py-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_15px_40px_-10px_rgba(16,185,129,0.4)] hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                      <Crown size={22} /> Executive Audit Complete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
