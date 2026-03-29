import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, ChevronRight, CheckCircle2, X, ArrowLeft, Zap, Target, AlertTriangle, Lightbulb } from 'lucide-react';

export default function SupervisorDiagnostic({ data, onRestart, onNext }: { data: any, onRestart?: () => void, onNext?: () => void }) {
  const companySetup = data?.company_setup || {};
  const departments = companySetup.departments || data.departments || [];
  const employees = companySetup.employees || data.employees || [];

  const [phase, setPhase] = useState(0);
  const [supervisorDept, setSupervisorDept] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [orgHealth, setOrgHealth] = useState(5);
  const [auditeeName, setAuditeeName] = useState('');
  const [p1, setP1] = useState({ clarity: 5, weeklyHrs: 40, burnout: 3, capabilityGap: 5 });
  const [activities, setActivities] = useState<string[]>([]);
  const [activityInput, setActivityInput] = useState('');
  const [activityDetails, setActivityDetails] = useState<any[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [p3, setP3] = useState({
    targetsAchievable: 'Neutral', whoReviews: '', reviewFrequency: 'Weekly', blockers: '', improvements: '', meetingsVsFocus: 50, enthusiasm: 3
  });

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [localCompleted, setLocalCompleted] = useState<string[]>([]);

  const getGlobalPending = () => {
    const historical = (data.all_diagnostics || [])
      .filter((d: any) => d.type === 'supervisor' && (d.status === 'complete' || d.p3 || d.activityDetails))
      .map((d: any) => d.employee_name?.trim().toLowerCase());
    const locals = localCompleted.map(l => l.trim().toLowerCase());
    const allCompleted = [...historical, ...locals];
    return employees.filter((e: any) => {
      const managerVal = e.manager?.trim() || '';
      const hasManager = managerVal && managerVal.toLowerCase() !== 'none' && managerVal.toLowerCase() !== 'n/a';
      return hasManager && !allCompleted.includes(e.name?.trim().toLowerCase());
    });
  };

  const pendingSubordinates = getGlobalPending();
  
  const isOnlyCEOPending = pendingSubordinates.length > 0 && pendingSubordinates.every((p: any) => {
    const mgr = employees.find((e: any) => e.name === p.manager);
    return mgr && data.roleEligibility?.[mgr.id] === 'top';
  });

  const isGlobalDone = pendingSubordinates.length === 0 || isOnlyCEOPending;

  const getRemainingSubordinates = () => {
    if (!supervisorDept || !supervisorName) return [];
    const historical = (data.all_diagnostics || [])
      .filter((d: any) => d.type === 'supervisor' && d.supervisorName === supervisorName && (d.status === 'complete' || d.p3))
      .map((d: any) => d.employee_name?.trim().toLowerCase());
    const allCompleted = [...historical, ...localCompleted.map(l => l.trim().toLowerCase())];
    return employees.filter((e: any) => e.manager === supervisorName && !allCompleted.includes(e.name?.trim().toLowerCase()));
  };

  const eligibleSubordinates = getRemainingSubordinates();

  const getIsSupervisorDone = (name: string) => {
    const historical = (data.all_diagnostics || [])
      .filter((d: any) => d.type === 'supervisor' && d.supervisorName === name && (d.status === 'complete' || d.p3))
      .map((d: any) => d.employee_name?.trim().toLowerCase());
    const allCompleted = [...historical, ...localCompleted.map(l => l.trim().toLowerCase())];
    const reports = employees.filter((e: any) => e.manager === name);
    if (reports.length === 0) return true;
    return reports.every((e: any) => allCompleted.includes(e.name?.trim().toLowerCase()));
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
  }, [phase, carouselIndex, auditeeName]);

  const cleanupDrafts = async () => {
    if (!supervisorName) return;
    try {
      employees.forEach(async (e: any) => {
        await fetch('http://localhost:3000/api/intake/drafts/cleanup', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_name: e.name, type: 'supervisor' })
        });
      });
    } catch (err) {}
  };

  const saveDraft = async (pageData: any, status: 'draft' | 'complete') => {
    const payload = {
      supervisorName, ...pageData, status, name: auditeeName, dept: supervisorDept
    };
    const hasOrgHealth = (data.all_diagnostics || []).some((d: any) => d.supervisorName === supervisorName && d.globalOrgHealth !== undefined);
    if (!hasOrgHealth) payload.globalOrgHealth = orgHealth;
    try {
      await fetch('http://localhost:3000/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: data.company_setup?.id || 1, type: 'supervisor', intake_data: payload })
      });
    } catch (err) {}
  };

  const goPhase1 = () => {
    if (!supervisorDept || !supervisorName) return;
    const existing = (data.all_diagnostics || []).find((d: any) => d.type === 'supervisor' && d.supervisorName === supervisorName && d.globalOrgHealth !== undefined);
    if (existing) {
      setOrgHealth(existing.globalOrgHealth);
      setPhase(2);
      return;
    }
    setPhase(1);
  };

  const goPhase2 = () => {
    const rem = getRemainingSubordinates();
    if (rem.length === 0) {
      setSupervisorName('');
      setSupervisorDept('');
      setAuditeeName('');
      setPhase(0);
      return;
    }
    setPhase(2);
  };

  const selectAuditee = (name: string) => {
    setAuditeeName(name);
    setP1({ clarity: 5, weeklyHrs: 40, burnout: 3, capabilityGap: 5 });
    setActivities([]);
    setActivityDetails([]);
    setCarouselIndex(0);
    setP3({ targetsAchievable: 'Neutral', whoReviews: '', reviewFrequency: 'Weekly', blockers: '', improvements: '', meetingsVsFocus: 50, enthusiasm: 3 });
    setPhase(3);
  };

  const goPhase4 = () => {
    if (activities.length === 0) return;
    if (activityDetails.length !== activities.length) {
      setActivityDetails(activities.map(a => ({
        name: a, criticality: 'Med', percentTime: 20, engaged: 'Neutral', goodDefined: 'Yes', skillMatch: 'Match'
      })));
    }
    saveDraft({ p1, activities }, 'draft');
    setPhase(4);
  };

  const advanceCarousel = () => {
    if (carouselIndex < activities.length - 1) {
      setCarouselIndex(carouselIndex + 1);
    } else {
      saveDraft({ p1, activities, activityDetails }, 'draft');
      setPhase(5);
    }
  };

  const finishAudit = () => {
    const completedName = auditeeName;
    if (!completedName) return;
    const newLocal = [...localCompleted, completedName];
    setLocalCompleted(newLocal);
    saveDraft({ p1, activities, activityDetails, p3 }, 'complete');

    const historical = (data.all_diagnostics || []).filter((d: any) => d.status === 'complete' || d.p3 || d.activityDetails).map((d: any) => d.employee_name?.toLowerCase());
    const allDone = [...historical, ...newLocal.map(n => n.toLowerCase())];
    const supervisorReports = employees.filter((e: any) => e.manager === supervisorName);
    const remainingReports = supervisorReports.filter((e: any) => !allDone.includes(e.name?.toLowerCase()));

    if (remainingReports.length > 0) {
      setAuditeeName('');
      setPhase(2);
    } else {
      setSupervisorName('');
      setSupervisorDept('');
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

  const handleExit = () => {
    cleanupDrafts();
    setPhase(0);
  };

  return (
    <div ref={scrollRef} className="relative w-full flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-y-auto custom-scrollbar overflow-x-hidden">
      <div className="sticky top-0 right-0 z-[100] flex justify-end p-4 pointer-events-none">
        {(phase > 0 && phase < 6) && (
          <button onClick={handleExit} className="pointer-events-auto text-gray-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-100">
            <X size={12} /> Exit & Discard
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.div key="p0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="p-8 rounded-[2rem] bg-white border border-gray-100 shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent to-blue-400" />
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-accent flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-display font-bold text-textMain mb-2">Supervisor Hub</h2>
              <p className="text-textMuted text-xs mb-8">Identify yourself to begin the team audit loop.</p>

              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Select Department</label>
                  <select className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" value={supervisorDept} onChange={e => { setSupervisorDept(e.target.value); setSupervisorName(''); }}>
                    <option value="">-- Choose --</option>
                    {departments.map((d: any) => <option key={d.id || d} value={d.id || d}>{d.name || d}</option>)}
                  </select>
                </div>
                {supervisorDept && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Select Your Name</label>
                    <select className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" value={supervisorName} onChange={e => setSupervisorName(e.target.value)}>
                      <option value="">-- Choose --</option>
                      {employees
                        .filter((e: any) => (e.departmentId || e.department) === supervisorDept && data.roleEligibility?.[e.id] === 'middle')
                        .filter((e: any) => !getIsSupervisorDone(e.name))
                        .map((e: any) => <option key={e.id} value={e.name}>{e.name}</option>)}
                    </select>
                  </div>
                )}
                <button onClick={goPhase1} disabled={!supervisorName} className="w-full mt-4 py-4 rounded-xl font-bold bg-textMain text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black transition-all flex items-center justify-center gap-2">
                  Initialize Hub <ArrowRight size={16} />
                </button>
              </div>

              {pendingSubordinates.length > 0 && !isOnlyCEOPending && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pending Audits</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {pendingSubordinates.map((p: any) => (
                      <span key={p.id} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[10px] border border-gray-100">{p.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {isGlobalDone && onNext && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onNext}
                        className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all flex items-center justify-center gap-2 border border-emerald-400/20"
                    >
                        Proceed to Worker Diagnostic <ArrowRight size={18} />
                    </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {phase === 1 && (
          <motion.div key="p1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-xl w-full">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-display font-bold text-textMain mb-4">Department Pulse</h1>
                <p className="text-textMuted max-w-sm mx-auto">Gut feeling on current functioning.</p>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-center">
                <div className="text-[6rem] font-display font-bold text-accent mb-8">{orgHealth}<span className="text-2xl text-gray-300">/10</span></div>
                <input type="range" min="1" max="10" value={orgHealth} onChange={e => setOrgHealth(parseInt(e.target.value))} className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-accent mb-8" />
                <div className="flex justify-between md:flex-row gap-4">
                  <button onClick={() => setPhase(0)} className="px-8 py-4 text-gray-400 font-bold flex items-center gap-2"><ArrowLeft size={18} /> Back</button>
                  <button onClick={goPhase2} className="px-12 py-4 bg-accent text-white rounded-full font-bold shadow-lg shadow-accent/20 flex items-center gap-2 hover:translate-x-1 transition-transform">Continue <ChevronRight size={18} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div key="p2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
            <div className="max-w-5xl w-full">
              <div className="flex justify-between mb-8 px-4 items-end">
                <div>
                  <h1 className="text-3xl font-display font-bold text-textMain">Direct Reports</h1>
                  <p className="text-textMuted mt-1">Select an employee to audit.</p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Audited: {employees.filter((e:any) => e.manager === supervisorName).length - eligibleSubordinates.length}
                </div>
              </div>

              {eligibleSubordinates.length === 0 ? (
                <div className="bg-white p-12 rounded-[2rem] border border-gray-100 shadow-xl text-center">
                  <div className="w-20 h-20 bg-blue-50 text-accent rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
                  <h2 className="text-2xl font-display font-bold text-textMain mb-2">Team Audited.</h2>
                  <button onClick={() => {
                    setSupervisorName(''); setSupervisorDept(''); setPhase(0);
                  }} className="mt-8 px-8 py-4 bg-textMain text-white font-bold rounded-xl">{pendingSubordinates.length > 0 ? 'Back to Hub' : 'Audit Complete'}</button>
                </div>
              ) : (
                <div className="flex overflow-x-auto pb-8 pt-4 px-4 -mx-4 gap-6 custom-scrollbar">
                  {eligibleSubordinates.map((e: any) => (
                    <button key={e.name} onClick={() => selectAuditee(e.name)} className="shrink-0 w-64 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all flex flex-col text-left group">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-accent font-bold mb-4">{e.name.charAt(0)}</div>
                      <h3 className="text-lg font-bold text-textMain">{e.name}</h3>
                      <p className="text-xs text-textMuted uppercase mt-1 mb-6">{e.role}</p>
                      <div className="mt-auto text-xs font-bold text-accent flex items-center gap-1 group-hover:gap-2 transition-all">Start Audit <ArrowRight size={14} /></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {phase === 3 && (
          <motion.div key="p3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{auditeeName.charAt(0)}</div>
              <h2 className="text-xl font-display font-bold text-textMain">Auditing {auditeeName} (1/3)</h2>
            </div>
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 space-y-10">
              <div>
                <label className="text-lg font-display font-bold text-textMain block mb-4">Target Clarity: {p1.clarity}/10</label>
                <input type="range" min="1" max="10" value={p1.clarity} onChange={e => setP1({...p1, clarity: parseInt(e.target.value)})} className="w-full h-2 bg-gray-100 rounded-full appearance-none accent-accent" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-2xl"><label className="text-xs font-bold text-gray-400">Weekly Hrs</label><input type="number" className="w-full bg-transparent font-bold text-xl" value={p1.weeklyHrs} onChange={e => setP1({...p1, weeklyHrs: parseInt(e.target.value)})}/></div>
                <div className="p-4 bg-gray-50 rounded-2xl"><label className="text-xs font-bold text-gray-400">Burnout (1-5)</label><input type="number" min="1" max="5" className="w-full bg-transparent font-bold text-xl" value={p1.burnout} onChange={e => setP1({...p1, burnout: parseInt(e.target.value)})}/></div>
              </div>
              <div>
                <label className="text-lg font-display font-bold text-textMain block mb-4">Expected Activities</label>
                <input type="text" value={activityInput} onChange={e => setActivityInput(e.target.value)} onKeyDown={handleAddActivity} placeholder="Enter and press Enter..." className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200" />
                <div className="flex flex-wrap gap-2 mt-4">{activities.map((a, i) => <span key={i} onClick={() => removeActivity(i)} className="bg-white border rounded-full px-4 py-2 text-sm shadow-sm flex items-center gap-2 cursor-pointer hover:bg-red-50">{a} <X size={14}/></span>)}</div>
              </div>
              <div className="flex justify-between pt-6">
                <button onClick={() => setPhase(2)} className="text-gray-400 font-bold">Back</button>
                <button onClick={goPhase4} className="px-8 py-4 bg-textMain text-white rounded-xl font-bold">Next Stage</button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 4 && (
          <motion.div key="p4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 flex flex-col p-4 md:p-8 items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-rose-50/50 pointer-events-none" />
            
            <div className="relative z-10 text-center mb-10 w-full max-w-2xl px-4">
              <p className="text-xs font-bold text-accent uppercase tracking-[0.3em] mb-2">Deep Dive Calibration (2/3)</p>
              <h1 className="text-3xl md:text-5xl font-display font-black text-slate-900 mb-4 tracking-tighter">{activities[carouselIndex]}</h1>
            </div>
            
            <div className="relative z-10 bg-white/90 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 max-w-2xl w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white/50 space-y-12 overflow-y-auto max-h-[75vh] custom-scrollbar">
              
              {/* Question 1: Criticality (Segmented Control) */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-5 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> How critical is this activity to business outcomes?
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
                    {['Low','Med','High'].map(l => (
                        <button 
                            key={l} 
                            onClick={() => {const d=[...activityDetails]; d[carouselIndex].criticality=l; setActivityDetails(d);}} 
                            className={`py-3 rounded-[14px] font-bold text-sm transition-all ${
                                activityDetails[carouselIndex].criticality===l 
                                ? 'bg-white text-slate-900 shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
              </div>
              
              {/* Question 2: Time Consumed (Fluid Slider) */}
              <div className="p-8 bg-slate-100/50 rounded-3xl border border-slate-200/50">
                <div className="flex justify-between items-end mb-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-wrap max-w-[240px]">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> What % of this person's week do you expect each activity to consume?
                    </label>
                    <span className="text-3xl font-black text-slate-900 font-display">{activityDetails[carouselIndex].percentTime}% <span className="text-xs text-slate-400 uppercase font-bold">of Week</span></span>
                </div>
                <div className="relative h-6 flex items-center">
                    <div className="absolute w-full h-1.5 bg-slate-200 rounded-full" />
                    <div className="absolute h-1.5 bg-accent rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(0,122,255,0.4)]" style={{ width: `${activityDetails[carouselIndex].percentTime}%` }} />
                    <input 
                        type="range" min="0" max="100" step="5"
                        value={activityDetails[carouselIndex].percentTime} 
                        onChange={e => {const d=[...activityDetails]; d[carouselIndex].percentTime=parseInt(e.target.value); setActivityDetails(d);}} 
                        className="absolute w-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="absolute w-5 h-5 bg-white border-2 border-accent rounded-full shadow-lg pointer-events-none transition-all duration-300" style={{ left: `calc(${activityDetails[carouselIndex].percentTime}% - 10px)` }} />
                </div>
              </div>

              {/* Question 3: Engagement (Rating Style) */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Does this person appear engaged performing each activity?
                </label>
                <div className="flex gap-4">
                    {[
                        {v:'Disengaged', c:'text-rose-500 bg-rose-50', b:'border-rose-100', a:'bg-rose-500'},
                        {v:'Neutral', c:'text-slate-500 bg-slate-50', b:'border-slate-100', a:'bg-slate-500'},
                        {v:'Active', c:'text-emerald-500 bg-emerald-50', b:'border-emerald-100', a:'bg-emerald-500'}
                    ].map(l => (
                        <button 
                            key={l.v} 
                            onClick={() => {const d=[...activityDetails]; d[carouselIndex].engaged=l.v; setActivityDetails(d);}} 
                            className={`flex-1 flex flex-col items-center gap-3 py-4 rounded-3xl border transition-all ${
                                activityDetails[carouselIndex].engaged===l.v 
                                ? `${l.c} ${l.b} shadow-xl scale-105 ring-2 ring-offset-2 ring-transparent` 
                                : 'bg-white border-slate-100 text-slate-400 opacity-60 grayscale'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${activityDetails[carouselIndex].engaged===l.v ? l.a : 'bg-slate-200'}`} />
                            <span className="font-bold text-xs uppercase tracking-wider">{l.v}</span>
                        </button>
                    ))}
                </div>
              </div>

              {/* Question 4: Good Defined (Progressive Slider/Toggle) */}
              <div className="p-8 border-2 border-slate-50 rounded-3xl bg-white shadow-inner-sm">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Does the person knows what "good" looks like?
                </label>
                <div className="flex items-center justify-between gap-4">
                    {['No','Partial','Yes'].map((l) => (
                        <button 
                            key={l} 
                            onClick={() => {const d=[...activityDetails]; d[carouselIndex].goodDefined=l; setActivityDetails(d);}} 
                            className={`group relative flex-1 flex flex-col items-center gap-2 transition-all`}
                        >
                            <div className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                                activityDetails[carouselIndex].goodDefined === l 
                                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                                : 'bg-slate-100'
                            }`} />
                            <span className={`text-[10px] font-black tracking-[0.2em] uppercase mt-2 transition-colors ${
                                activityDetails[carouselIndex].goodDefined === l ? 'text-emerald-600' : 'text-slate-300'
                            }`}>{l}</span>
                        </button>
                    ))}
                </div>
              </div>

              {/* Question 5: Skill Match (Selection Chips) */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Rate this person's skill match per activity: Stretched/Match/Misaligned
                </label>
                <div className="flex flex-wrap gap-2">
                    {['Mismatch','Stretch','Match'].map(l => (
                        <button 
                            key={l} 
                            onClick={() => {const d=[...activityDetails]; d[carouselIndex].skillMatch=l; setActivityDetails(d);}} 
                            className={`px-8 py-3 rounded-full font-bold transition-all border-2 text-xs flex items-center gap-2 ${
                                activityDetails[carouselIndex].skillMatch===l 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-lg -translate-y-1' 
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                            }`}
                        >
                            {activityDetails[carouselIndex].skillMatch===l && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                            {l}
                        </button>
                    ))}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="flex justify-between items-center pt-10 border-t border-slate-100">
                <button onClick={() => {if(carouselIndex > 0) setCarouselIndex(carouselIndex-1); else setPhase(3);}} className="text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                   <ArrowLeft size={14} /> Back
                </button>
                <button onClick={advanceCarousel} className="group px-10 py-5 bg-slate-900 text-white rounded-[20px] font-black shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs flex items-center gap-3 uppercase tracking-widest">
                    {carouselIndex < activities.length - 1 ? 'Verify Activity' : 'Submit Core Audit'} 
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 5 && (
          <motion.div key="p5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">{auditeeName.charAt(0)}</div>
              <h2 className="text-xl font-display font-bold text-textMain">Calibration Audit (3/3)</h2>
            </div>
            <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 space-y-10">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 px-2">Focus & Feasibility</label>
                <h4 className="text-xl font-display font-bold text-slate-900 mb-6 px-2">Are targets achievable?</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { v: 'Unrealistic', icon: X, color: 'rose' },
                    { v: 'Neutral', icon: ShieldCheck, color: 'blue' },
                    { v: 'Achievable', icon: CheckCircle2, color: 'emerald' }
                  ].map(({ v, icon: Icon, color }) => (
                    <button 
                      key={v} 
                      onClick={() => setP3({...p3, targetsAchievable: v})} 
                      className={`group relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                        p3.targetsAchievable === v 
                        ? `bg-white border-${color}-500 shadow-xl shadow-${color}-100 scale-105` 
                        : 'bg-white border-transparent text-slate-400 opacity-60 hover:opacity-100 hover:border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        p3.targetsAchievable === v ? `bg-${color}-50 text-${color}-600` : 'bg-slate-50 text-slate-300'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        p3.targetsAchievable === v ? `text-${color}-600` : 'text-slate-400'
                      }`}>{v}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Who is responsible for reviewing this person's work?</label>
                  <select 
                    className="w-full bg-transparent font-bold text-slate-800 outline-none h-10" 
                    value={p3.whoReviews} 
                    onChange={e => setP3({...p3, whoReviews: e.target.value})}
                  >
                    <option value="">-- Select Reviewer --</option>
                    {/* 1. The Supervisor (Current User) */}
                    <option value={supervisorName}>{supervisorName} (You)</option>
                    
                    {/* 2. Higher Level Leadership (Top roles) */}
                    {employees
                      .filter((e: any) => data.roleEligibility?.[e.id] === 'top' && e.name !== supervisorName)
                      .map((e: any) => (
                        <option key={e.id} value={e.name}>{e.name} (Leadership)</option>
                    ))}
                    
                    {/* 3. Managers of the current supervisor (if any) */}
                    {employees
                      .filter((e: any) => {
                         const supObj = employees.find((s:any) => s.name === supervisorName);
                         return e.name === supObj?.manager && e.name !== supervisorName;
                      })
                      .map((e: any) => (
                         <option key={e.id} value={e.name}>{e.name} (Direct Manager)</option>
                      ))
                    }
                  </select>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Review Frequency</label>
                  <select className="w-full bg-transparent font-bold text-slate-800 outline-none h-10" value={p3.reviewFrequency} onChange={e => setP3({...p3, reviewFrequency: e.target.value})}>
                    <option>Weekly</option>
                    <option>Bi-Weekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertTriangle size={12} className="text-amber-500" /> What prevents this person from full effectiveness?
                  </label>
                  <textarea 
                    className="w-full bg-white p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-accent outline-none font-medium" 
                    rows={2}
                    placeholder="Identify blockers or gaps..."
                    value={p3.blockers} 
                    onChange={e => setP3({...p3, blockers: e.target.value})}
                  />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Lightbulb size={12} className="text-blue-500" /> Improvement Changes?
                  </label>
                  <textarea 
                    className="w-full bg-white p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-accent outline-none font-medium" 
                    rows={2}
                    placeholder="What would improve their best work?"
                    value={p3.improvements} 
                    onChange={e => setP3({...p3, improvements: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                   <Target size={120} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="shrink-0 text-center md:text-left">
                    <h4 className="text-xl font-display font-black leading-tight mb-1">Collaboration <br/> vs <span className="text-emerald-400">Deep Focus</span></h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Meetings vs focused work proportion?</p>
                  </div>
                  
                  <div className="flex-1 w-full max-w-sm">
                    <div className="flex justify-between items-end mb-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 mb-1">Meetings</span>
                        <span className={`text-2xl font-black font-display font-mono ${p3.meetingsVsFocus > 50 ? 'text-orange-500' : 'text-slate-400'}`}>{p3.meetingsVsFocus}%</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 mb-1">Deep Work</span>
                        <span className={`text-2xl font-black font-display font-mono ${p3.meetingsVsFocus <= 50 ? 'text-emerald-400' : 'text-slate-400'}`}>{100 - p3.meetingsVsFocus}%</span>
                      </div>
                    </div>
                    
                    <div className="relative h-4 bg-slate-800 rounded-full border border-slate-700 p-1 flex items-center">
                      <motion.div 
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all"
                        initial={false}
                        animate={{ width: `${100 - p3.meetingsVsFocus}%`, x: `${p3.meetingsVsFocus}%` }}
                        style={{ width: `${100 - p3.meetingsVsFocus}%` }}
                      />
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={p3.meetingsVsFocus} 
                        onChange={e => setP3({...p3, meetingsVsFocus: parseInt(e.target.value)})} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-6 px-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Energy & Vitality</h4>
                    <p className="text-xs text-slate-400">How many days this month did this person feel genuinely energetic / refreshed?</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-accent font-display">{p3.enthusiasm}</span>
                    <span className="text-[10px] font-black text-slate-300 block uppercase tracking-widest">Days / 21</span>
                  </div>
                </div>
                <div className="flex justify-between items-end gap-1.5 bg-slate-50/80 p-5 rounded-[2rem] border border-slate-100">
                  {[...Array(22)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setP3({...p3, enthusiasm: i})} 
                      className="group relative flex flex-col items-center transition-all duration-300"
                    >
                      <div className={`transition-all duration-500 ${i <= p3.enthusiasm ? 'mb-1 scale-100' : 'mb-0 scale-75 opacity-20'}`}>
                        <Zap 
                          size={12} 
                          className={`${i <= p3.enthusiasm ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'text-slate-400'}`} 
                        />
                      </div>
                      <div className={`w-1 rounded-full transition-all duration-500 ${i === p3.enthusiasm ? 'h-4 bg-accent' : i < p3.enthusiasm ? 'h-1 bg-amber-200' : 'h-1 bg-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between pt-6">
                <button onClick={() => setPhase(4)} className="text-gray-400 font-bold">Back</button>
                <button onClick={finishAudit} className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 flex items-center gap-2 hover:scale-[1.02] transition-all">Complete & Save Audit <CheckCircle2 size={20}/></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
