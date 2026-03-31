import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, CheckCircle2, X, ArrowLeft, Plus } from 'lucide-react';
import SyntheticGeneration from '../animations/SyntheticGeneration';

export default function WorkerDiagnostic({ data, onRestart, onNext }: { data: any, onRestart?: () => void, onNext?: (data?: any) => void }) {
  const companySetup = data?.company_setup || {};
  const departments = companySetup.departments || data.departments || [];
  const employees = companySetup.employees || data.employees || [];

  // Flow State
  const [phase, setPhase] = useState(0);

  // Identity State
  const [workerDept, setWorkerDept] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  
  // Phase 1: Core Metrics
  const [p1, setP1] = useState({
    orgHealth: 5,
    targetClarity: 5,
    weeklyHrs: 40,
    burnout: 3, // 1-5
    capGap: 5,
    legacyBurden: 20 // 0-100
  });

  // Phase 2: Execution (Activities)
  const [activities, setActivities] = useState<string[]>([]);
  const [activityInput, setActivityInput] = useState('');

  // Phase 3: Activity Deep Dive
  const [activityDetails, setActivityDetails] = useState<any[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Phase 4: Calibration
  const [p4, setP4] = useState({
    realistic: 'Neutral' as 'Unrealistic' | 'Neutral' | 'Achievable',
    reviewer: '',
    freq: 'Weekly',
    blockers: '',
    changes: '',
    meetingRatio: 50, // % of time in meetings
    enthusiasm: 10, // Recovered/Energetic days per month
    voiceSuppression: 5, // How often withhold ideas/concerns (1-10)
    alternateContact: '' // Who they go to for help besides supervisor
  });

  const [showVerification, setShowVerification] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [localCompleted, setLocalCompleted] = useState<string[]>([]);
  const [dbEmployeeCount, setDbEmployeeCount] = useState(0);
  const [allDiagnostics, setAllDiagnostics] = useState<any[]>(data?.all_diagnostics || []);
  const targetHeadcount = parseInt(companySetup?.company?.headcount || '0');
  const headcountMet = targetHeadcount > 0 && dbEmployeeCount >= targetHeadcount;

  // Fetch live employee count and diagnostics from DB
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3000/api/company-setup').then(res => res.json()),
      fetch('http://localhost:3000/api/intake').then(res => res.json())
    ]).then(([companyData, intakeData]) => {
      const totalEmps = (companyData.employees || []).length;
      setDbEmployeeCount(totalEmps);
      setAllDiagnostics(intakeData.all_diagnostics || []);
    }).catch(() => {});
  }, [phase, localCompleted]);

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------
  const getEligibleWorkers = () => {
    const historical = allDiagnostics
      .filter((d: any) => d.type === 'worker' && (d.status === 'complete' || d.payload?.status === 'complete'))
      .map((d: any) => d.employee_name?.trim().toLowerCase());
    
    const locals = localCompleted.map(l => l.trim().toLowerCase());
    const allCompletedNames = [...historical, ...locals];

    return employees.filter((e: any) => {
      const isTop = data.roleEligibility?.[e.id] === 'top';
      const nameNorm = e.name?.trim().toLowerCase();
      // Only show workers who haven't completed their self-audit
      return !isTop && !allCompletedNames.includes(nameNorm);
    });
  };

  const getComplianceSummary = () => {
    const allDiags = [...allDiagnostics, ...localCompleted.map(l => ({ employee_name: l, type: 'worker', payload: { status: 'complete' } }))];
    const targetEmployees = employees.filter((e: any) => data.roleEligibility?.[e.id] !== 'top');
    
    const supervisorAudits = targetEmployees.filter((e: any) => 
        allDiags.some((d: any) => d.employee_name?.toLowerCase() === e.name?.toLowerCase() && d.type === 'supervisor' && (d.status === 'complete' || d.payload?.status === 'complete'))
    ).length;

    const workerAudits = targetEmployees.filter((e: any) => 
        allDiags.some((d: any) => d.employee_name?.toLowerCase() === e.name?.toLowerCase() && d.type === 'worker' && (d.status === 'complete' || d.payload?.status === 'complete'))
    ).length;

    return {
        totalTarget: targetEmployees.length,
        supervisorAudits,
        workerAudits,
        isFullyCompliant: supervisorAudits === targetEmployees.length && workerAudits === targetEmployees.length
    };
  };

  const compliance = getComplianceSummary();

  const pendingWorkers = getEligibleWorkers();
  const isGlobalDone = pendingWorkers.length === 0;

  // ---------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
  }, [phase, carouselIndex, workerName]);

  // ---------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------
  const saveDraft = async (pageData: any, status: 'draft' | 'complete') => {
    const payload = {
      ...pageData,
      status, 
      name: workerName, 
      dept: workerDept,
      supervisorName,
      worker_diagnostic: true // Tag to help differentiate fields if needed
    };

    try {
      await fetch('http://localhost:3000/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          company_id: data.company_setup?.id || 1, 
          type: 'worker', 
          intake_data: payload 
        })
      });
    } catch (err) {}
  };

  const cleanupDrafts = async () => {
    if (!workerName) return;
    try {
      await fetch('http://localhost:3000/api/intake/drafts/cleanup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_name: workerName, type: 'worker' })
      });
    } catch (err) {}
  };

  const handleExit = () => {
    cleanupDrafts();
    setPhase(0);
    setWorkerName('');
    setWorkerDept('');
    setSupervisorName('');
  };

  const startAudit = () => {
    if (!workerName || !supervisorName) return;
    // Reset state for new worker
    setP1({ orgHealth: 5, targetClarity: 5, weeklyHrs: 40, burnout: 3, capGap: 5, legacyBurden: 20 });
    setActivities([]);
    setActivityDetails([]);
    setCarouselIndex(0);
    setP4({ realistic: 'Neutral', reviewer: '', freq: 'Weekly', blockers: '', changes: '', meetingRatio: 50, voiceSuppression: 5, alternateContact: '' });
    setPhase(1);
  };

  const goPhase2 = () => {
    saveDraft({ p1 }, 'draft');
    setPhase(2);
  };

  const goPhase3 = () => {
    if (activities.length === 0) return;
    if (activityDetails.length !== activities.length) {
      setActivityDetails(activities.map(a => ({
        name: a, contrib: 'Med', percentTime: 20, energy: 3, successClear: true, skillMatch: 'Match'
      })));
    }
    saveDraft({ p1, activities }, 'draft');
    setPhase(3);
  };

  const advanceCarousel = () => {
    if (carouselIndex < activities.length - 1) {
      setCarouselIndex(carouselIndex + 1);
    } else {
      saveDraft({ p1, activities, activityDetails }, 'draft');
      setPhase(4);
    }
  };

  const completeAudit = () => {
    const newLocal = [...localCompleted, workerName];
    setLocalCompleted(newLocal);
    saveDraft({ p1, activities, activityDetails, p4 }, 'complete');
    setPhase(5);
  };

  const handleAddActivity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activityInput.trim() && activities.length < 20) {
      e.preventDefault();
      setActivities([...activities, activityInput.trim()]);
      setActivityInput('');
    }
  };
  const removeActivity = (idx: number) => setActivities(activities.filter((_, i) => i !== idx));

  // Visual Helper for Energy Wave
  const currentEnergy = activityDetails[carouselIndex]?.energy || 3;

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div ref={scrollRef} className="relative w-full flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-y-auto custom-scrollbar overflow-x-hidden">
      
      {/* ABORT BUTTON */}
      <div className="sticky top-0 right-0 z-[100] flex justify-end p-4 pointer-events-none">
        {(phase > 0 && phase < 5) && (
          <button onClick={handleExit} className="pointer-events-auto text-gray-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-100">
            <X size={12} /> Exit & Discard
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        
        {/* PHASE 0: IDENTIFY */}
        {phase === 0 && (
          <motion.div key="p0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="p-8 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] max-w-sm w-full text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent to-emerald-400" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 text-accent flex items-center justify-center mx-auto mb-6 shadow-inner border border-white">
                <Activity size={32} />
              </div>
              <h2 className="text-2xl font-display font-bold text-textMain mb-2">Worker Diagnostic</h2>
              <p className="text-textMuted text-xs mb-8">Identify yourself and your direct supervisor to begin.</p>

                {isGlobalDone ? (
                  <div className="pt-4">
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 mb-8">
                       <div className="flex items-center gap-3 text-emerald-600 mb-2">
                          <CheckCircle2 size={20} />
                          <span className="font-bold text-sm tracking-tight">Audit Coverage Complete</span>
                       </div>
                       <p className="text-emerald-800/60 text-xs leading-relaxed text-left">All workers have successfully submitted their self-audits. You can now proceed to synthesize the final employee profiles.</p>
                    </div>
                    {headcountMet ? (
                      <button 
                        onClick={() => onNext ? onNext() : null} 
                        className="w-full py-5 rounded-2xl font-bold bg-[#1e293b] text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0.5 transition-all flex items-center justify-center gap-3 ring-1 ring-white/20"
                      >
                        Complete Hierarchy <ArrowRight size={22} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setPhase(5);
                          setShowVerification(true);
                        }} 
                        className="w-full py-5 rounded-2xl font-bold bg-[#10B981] text-white shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:translate-y-0.5 transition-all flex items-center justify-center gap-3 ring-1 ring-white/20"
                      >
                        Process & Synthesize Results <ArrowRight size={20} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Your Department</label>
                      <select className="w-full mt-1 bg-white/80 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm transition-all" value={workerDept} onChange={e => { setWorkerDept(e.target.value); setWorkerName(''); setSupervisorName(''); }}>
                        <option value="">-- Choose --</option>
                        {departments.map((d: any) => <option key={d.id || d} value={d.id || d}>{d.name || d}</option>)}
                      </select>
                    </div>
                    {workerDept && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Your Name</label>
                        <select className="w-full mt-1 bg-white/80 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm transition-all" value={workerName} onChange={e => setWorkerName(e.target.value)}>
                          <option value="">-- Choose --</option>
                          {pendingWorkers
                            .filter((e: any) => (e.departmentId || e.department) === workerDept)
                            .map((e: any) => <option key={e.id} value={e.name}>{e.name}</option>)}
                        </select>
                      </div>
                    )}
                    {workerName && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Select Supervisor</label>
                        <select className="w-full mt-1 bg-white/80 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm transition-all" value={supervisorName} onChange={e => setSupervisorName(e.target.value)}>
                            <option value="">-- Choose --</option>
                            {employees.map((e: any) => <option key={e.id} value={e.name}>{e.name} ({e.role})</option>)}
                        </select>
                      </div>
                    )}

                    <button onClick={startAudit} disabled={!workerName || !supervisorName} className="w-full mt-6 py-4 rounded-xl font-bold bg-textMain text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                      Begin Diagnostic <ArrowRight size={16} />
                    </button>
                  </div>
                )}
            </div>
          </motion.div>
        )}

        {/* PHASE 1: CORE METRICS */}
        {phase === 1 && (
          <motion.div key="p1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-display font-bold text-textMain mb-2">Core Metrics</h1>
              <p className="text-textMuted text-sm">Assess your current working environment and capacity.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 space-y-12">
              
              {/* Org Health Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <label className="text-lg font-display font-bold text-textMain">Perceived Organisational Health</label>
                    <span className="text-3xl font-bold text-accent">{p1.orgHealth}<span className="text-lg text-gray-300">/10</span></span>
                </div>
                <p className="text-xs text-textMuted max-w-sm">Gut feeling on how well the department / team is functioning.</p>
                <input type="range" min="1" max="10" value={p1.orgHealth} onChange={e => setP1({...p1, orgHealth: parseInt(e.target.value)})} className="w-full h-2 bg-gray-100 rounded-full appearance-none accent-accent shadow-inner" />
              </div>

              {/* Value-Creation Clarity */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <label className="text-lg font-display font-bold text-textMain">Target Value-Creation Clarity</label>
                    <span className="text-3xl font-bold text-blue-500">{p1.targetClarity}<span className="text-lg text-gray-300">/10</span></span>
                </div>
                <p className="text-xs text-textMuted max-w-sm">When you start your day, how clear are you about which specific tasks create the most value?</p>
                <input type="range" min="1" max="10" value={p1.targetClarity} onChange={e => setP1({...p1, targetClarity: parseInt(e.target.value)})} className="w-full h-2 bg-gray-100 rounded-full appearance-none accent-blue-500 shadow-inner" />
              </div>

              {/* Weekly Expectation & Burnout Risk */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <label className="text-sm font-bold text-gray-500 block">Weekly Expectation</label>
                        <p className="text-[10px] text-gray-400 mt-1 mb-4">Standard hours/week you work.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-200 w-max shadow-sm">
                        <button onClick={() => setP1({...p1, weeklyHrs: Math.max(0, p1.weeklyHrs - 1)})} className="w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-600 font-bold text-xl flex items-center justify-center transition-colors">-</button>
                        <span className="text-2xl font-bold w-12 text-center text-textMain">{p1.weeklyHrs}</span>
                        <button onClick={() => setP1({...p1, weeklyHrs: p1.weeklyHrs + 1})} className="w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-600 font-bold text-xl flex items-center justify-center transition-colors">+</button>
                    </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-50/50 to-white rounded-2xl border border-orange-100 shadow-sm flex flex-col">
                    <div>
                        <label className="text-sm font-bold text-gray-500 block">Estimated Burnout Risk</label>
                        <p className="text-[10px] text-gray-400 mt-1 mb-4">Mental/physical energy to sustain workload for next 6 months.</p>
                    </div>
                    <div className="flex gap-1 mt-auto">
                        {[1, 2, 3, 4, 5].map(b => (
                            <button key={b} onClick={() => setP1({...p1, burnout: b})} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all border ${p1.burnout === b ? 'bg-orange-500 text-white border-orange-600 shadow-md transform -translate-y-1' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}>
                                {b}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase mt-2 px-1">
                        <span>Low Risk</span>
                        <span>High Risk</span>
                    </div>
                </div>
              </div>

              {/* Capability Gap */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <label className="text-lg font-display font-bold text-textMain">Capability Gap</label>
                    <span className="text-3xl font-bold text-purple-500">{p1.capGap}<span className="text-lg text-gray-300">/10</span></span>
                </div>
                <p className="text-xs text-textMuted max-w-sm">Do you have the tools and training to be extraordinary in this role? (1 = fully equipped, 10 = learning on the fly)</p>
                <input type="range" min="1" max="10" value={p1.capGap} onChange={e => setP1({...p1, capGap: parseInt(e.target.value)})} className="w-full h-2 bg-gray-100 rounded-full appearance-none accent-purple-500 shadow-inner" />
              </div>

              {/* Legacy Burden */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-end">
                    <label className="text-lg font-display font-bold text-textMain">Legacy Burden</label>
                    <span className="text-3xl font-bold text-rose-500">{p1.legacyBurden}%</span>
                </div>
                <p className="text-xs text-textMuted max-w-md">Estimated % of weekly capacity eaten up by 'non-value' activities (fighting outdated systems, manual processes, redundant spreadsheets).</p>
                <input type="range" min="0" max="100" value={p1.legacyBurden} onChange={e => setP1({...p1, legacyBurden: parseInt(e.target.value)})} className="w-full h-3 bg-rose-50 rounded-full appearance-none accent-rose-500 shadow-inner cursor-pointer" />
              </div>

              <div className="flex justify-between pt-8 border-t border-gray-100 mt-8">
                <button onClick={() => setPhase(0)} className="px-6 py-3 text-gray-400 font-bold flex items-center gap-2 hover:text-gray-600 transition-colors"><ArrowLeft size={16} /> Identity</button>
                <button onClick={goPhase2} className="px-8 py-4 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 flex items-center gap-2 hover:-translate-y-0.5 transition-all">Activities <ArrowRight size={16} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: EXECUTION & ALIGNMENT (ACTIVITIES) */}
        {phase === 2 && (
          <motion.div key="p2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8">
             <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-textMain mb-2">Execution & Alignment</h1>
              <p className="text-textMuted text-sm">List the main activities you actually do regularly.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 min-h-[50vh] flex flex-col">
                <div className="flex-1">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest block mb-4">Add Activity (Max 20)</label>
                    <div className="flex gap-2 relative">
                        <input 
                            type="text" 
                            value={activityInput} 
                            onChange={e => setActivityInput(e.target.value)} 
                            onKeyDown={handleAddActivity} 
                            placeholder="Type activity and press Enter..." 
                            className="flex-1 p-4 pl-5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent outline-none text-textMain transition-shadow" 
                            disabled={activities.length >= 20}
                        />
                        <button 
                            onClick={() => {
                                if (activityInput.trim() && activities.length < 20) {
                                    setActivities([...activities, activityInput.trim()]);
                                    setActivityInput('');
                                }
                            }}
                            disabled={!activityInput.trim() || activities.length >= 20}
                            className="px-6 bg-textMain text-white rounded-xl font-bold disabled:opacity-50 transition-opacity flex items-center gap-2"
                        >
                            <Plus size={18} /> Add
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-3 px-1">
                        <span className="text-[10px] text-gray-400 font-bold">{activities.length} / 20 Activities listed</span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-8">
                        <AnimatePresence>
                            {activities.map((a, i) => (
                                <motion.span 
                                    key={a+i} 
                                    initial={{ opacity: 0, scale: 0.8 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="bg-blue-50/50 border border-blue-100 text-textMain rounded-full px-5 py-2.5 text-sm shadow-sm flex items-center gap-3 transition-colors hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 group cursor-pointer"
                                    onClick={() => removeActivity(i)}
                                >
                                    {a} 
                                    <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-rose-500 group-hover:bg-rose-100 transition-colors">
                                        <X size={12}/>
                                    </span>
                                </motion.span>
                            ))}
                        </AnimatePresence>
                        {activities.length === 0 && (
                            <div className="w-full py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-medium">
                                No activities added yet.<br/><span className="text-xs font-normal">Press enter to save an activity.</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between pt-8 border-t border-gray-100 mt-8">
                    <button onClick={() => setPhase(1)} className="px-6 py-3 text-gray-400 font-bold flex items-center gap-2 hover:text-gray-600 transition-colors"><ArrowLeft size={16} /> Metrics</button>
                    <button onClick={goPhase3} disabled={activities.length === 0} className="px-8 py-4 bg-textMain text-white rounded-xl font-bold shadow-lg disabled:opacity-30 flex items-center gap-2 hover:-translate-y-0.5 transition-all">Deep Dive <ArrowRight size={16} /></button>
                </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: DEEP DIVE CAROUSEL */}
        {phase === 3 && (
          <motion.div 
            key="p3" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/50 pointer-events-none" />
            
            <div className="relative z-10 text-center mb-10 w-full max-w-2xl px-4">
              <p className="text-xs font-bold text-accent uppercase tracking-widest mb-2">Deep Dive (3/4) &middot; Activity {carouselIndex + 1} of {activities.length}</p>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-textMain mb-4 drop-shadow-sm">{activities[carouselIndex]}</h1>
            </div>
            
            <div className="relative z-10 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 max-w-2xl w-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white space-y-10">
              
              {/* Meaningful Results */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">Contribution to meaningful results</label>
                <div className="flex gap-2">
                    {['Low','Med','High'].map(l => (
                        <button 
                            key={l} 
                            onClick={() => {const d=[...activityDetails]; d[carouselIndex].contrib=l; setActivityDetails(d);}} 
                            className={`flex-1 py-4 rounded-2xl font-bold transition-all border ${activityDetails[carouselIndex].contrib===l ? 'bg-accent text-white border-accent shadow-md shadow-accent/20':'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
              </div>

              {/* % Consumed */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-end mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Time Consumed</label>
                    <span className="text-2xl font-bold text-textMain">{activityDetails[carouselIndex].percentTime}%</span>
                </div>
                <input type="range" min="0" max="100" value={activityDetails[carouselIndex].percentTime} onChange={e => {const d=[...activityDetails]; d[carouselIndex].percentTime=parseInt(e.target.value); setActivityDetails(d);}} className="w-full h-2 bg-gray-200 rounded-full appearance-none accent-accent cursor-pointer" />
              </div>

              {/* Energised / Drained */}
              <div>
                <div className="flex justify-between items-end mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Energy Impact</label>
                    <span className={`text-sm font-bold ${currentEnergy < 3 ? 'text-red-500' : currentEnergy > 3 ? 'text-emerald-500' : 'text-gray-400'}`}>
                        {currentEnergy < 3 ? 'Draining' : currentEnergy > 3 ? 'Energising' : 'Neutral'}
                    </span>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(eLevel => (
                        <button 
                            key={eLevel} 
                            onClick={() => {const d=[...activityDetails]; d[carouselIndex].energy=eLevel; setActivityDetails(d);}} 
                            className={`flex-1 h-14 rounded-2xl font-bold transition-all border ${activityDetails[carouselIndex].energy === eLevel ? 'bg-textMain text-white border-textMain scale-105 shadow-md z-10' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}
                        >
                            {eLevel}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-300 mt-3 px-2">
                    <span>Highly Drained</span>
                    <span>Highly Energised</span>
                </div>
              </div>

              {/* Success & Skill */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 leading-relaxed">Do you know exactly what a successful outcome looks like?</label>
                    <div className="flex bg-gray-200 rounded-xl p-1 gap-1">
                        {['Yes', 'No'].map(opt => (
                            <button 
                                key={opt}
                                onClick={() => {const d=[...activityDetails]; d[carouselIndex].successClear = (opt==='Yes'); setActivityDetails(d);}}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activityDetails[carouselIndex].successClear === (opt==='Yes') ? 'bg-white text-textMain shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                 </div>

                 <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Skill Match</label>
                    <div className="flex flex-col gap-2">
                        <select 
                            className="bg-white text-textMain text-sm font-bold p-3 rounded-xl border border-gray-200 outline-none w-full shadow-sm"
                            value={activityDetails[carouselIndex].skillMatch}
                            onChange={(e) => {const d=[...activityDetails]; d[carouselIndex].skillMatch=e.target.value; setActivityDetails(d);}}
                        >
                            <option value="Stretched">Stretched (Learning)</option>
                            <option value="Match">Match (Ideal)</option>
                            <option value="Misaligned">Misaligned (Wrong Role)</option>
                        </select>
                    </div>
                 </div>
              </div>

              {/* Nav */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <button onClick={() => {if(carouselIndex > 0) setCarouselIndex(carouselIndex-1); else setPhase(2);}} className="text-gray-400 font-bold hover:text-gray-600 transition-colors text-sm px-4 py-2 flex items-center gap-2"><ArrowLeft size={16} /> Previous</button>
                <button onClick={advanceCarousel} className="px-8 py-4 bg-textMain text-white rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2">
                    {carouselIndex < activities.length - 1 ? 'Next Activity' : 'Finish Loop'} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 4: CALIBRATION */}
        {phase === 4 && (
          <motion.div key="p4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-display font-bold text-textMain mb-2">Final Calibration</h1>
              <p className="text-textMuted text-sm">Wrap up your self-audit with a few high-level reflections.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Targets */}
                  <div>
                    <label className="text-sm font-bold text-gray-500 block mb-3">Do targets feel realistic?</label>
                    <div className="flex gap-2">
                        {['Unrealistic', 'Neutral', 'Achievable'].map(opt => (
                            <button 
                                key={opt}
                                onClick={() => setP4({...p4, realistic: opt as any})}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl border transition-all ${p4.realistic === opt ? 'bg-blue-50 text-accent border-accent text-accent' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                  </div>

                  {/* Review */}
                  <div className="flex gap-4">
                      <div className="flex-1">
                          <label className="text-sm font-bold text-gray-500 block mb-3">Who reviews your work?</label>
                          <select 
                            value={p4.reviewer} 
                            onChange={e => setP4({...p4, reviewer: e.target.value})} 
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm focus:border-accent transition-colors font-bold text-textMain"
                          >
                            <option value="">-- Choose Reviewer --</option>
                            {/* 1. The Assigned Supervisor */}
                            {supervisorName && <option value={supervisorName}>{supervisorName} (Direct Supervisor)</option>}
                            
                            {/* 2. Top Leadership / CEO */}
                            {employees
                                .filter((e: any) => data.roleEligibility?.[e.id] === 'top' && e.name !== supervisorName)
                                .map((e: any) => (
                                    <option key={e.id} value={e.name}>{e.name} (Leadership)</option>
                                ))
                            }
                          </select>
                      </div>
                      <div className="w-1/3">
                          <label className="text-sm font-bold text-gray-500 block mb-3">Frequency</label>
                          <select value={p4.freq} onChange={e => setP4({...p4, freq: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm focus:border-accent">
                              <option>Weekly</option>
                              <option>Monthly</option>
                              <option>Quarterly</option>
                              <option>Annually</option>
                          </select>
                      </div>
                  </div>
              </div>

              <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-100/50">
                  <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between">
                      <label className="text-sm font-bold text-gray-700">Meetings vs Focused Work</label>
                      <span className="text-lg font-bold text-orange-500 mt-2 md:mt-0">{p4.meetingRatio}% Meetings</span>
                  </div>
                  <input type="range" min="0" max="100" value={p4.meetingRatio} onChange={e => setP4({...p4, meetingRatio: parseInt(e.target.value)})} className="w-full h-3 bg-orange-100 rounded-full appearance-none accent-orange-400 cursor-pointer" />
                  <div className="flex justify-between text-[10px] font-bold text-orange-300 uppercase mt-2 px-1">
                        <span>All Focus</span>
                        <span>All Meetings</span>
                  </div>
              </div>

              {/* Energy & Vitality */}
              <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Energy & Vitality</h4>
                    <p className="text-[10px] text-blue-400 font-medium">How many days this month did you feel genuinely energetic & refreshed?</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-accent font-display">{p4.enthusiasm}</span>
                    <span className="text-[10px] font-black text-gray-300 block uppercase tracking-widest">Days / 21</span>
                  </div>
                </div>
                <div className="flex justify-between items-end gap-1 bg-white/50 p-4 rounded-2xl border border-blue-50 shadow-inner">
                  {[...Array(22)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setP4({...p4, enthusiasm: i})} 
                      className="group relative flex flex-col items-center transition-all duration-300"
                    >
                      <div className={`transition-all duration-500 ${i <= p4.enthusiasm ? 'mb-1 scale-100' : 'mb-0 scale-75 opacity-20'}`}>
                        <Activity 
                          size={10} 
                          className={`${i <= p4.enthusiasm ? 'text-accent fill-accent shadow-accent/20' : 'text-gray-300'}`} 
                        />
                      </div>
                      <div className={`w-1 rounded-full transition-all duration-500 ${i === p4.enthusiasm ? 'h-4 bg-accent' : i < p4.enthusiasm ? 'h-1 bg-blue-200' : 'h-1 bg-gray-100'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-gray-100">
                  <div>
                      <label className="text-sm font-bold text-gray-500 block mb-2">What prevents you from full effectiveness?</label>
                      <textarea value={p4.blockers} onChange={e => setP4({...p4, blockers: e.target.value})} rows={3} placeholder="Systems, processes, lack of clarity..." className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all custom-scrollbar resize-none" />
                  </div>
                  <div>
                      <label className="text-sm font-bold text-gray-500 block mb-2">What 1 or 2 changes would most improve your best work?</label>
                      <textarea value={p4.changes} onChange={e => setP4({...p4, changes: e.target.value})} rows={3} placeholder="Actionable suggestions..." className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all custom-scrollbar resize-none" />
                  </div>
              </div>

              {/* Voice Suppression */}
              <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Voice Suppression</h4>
                    <p className="text-xs text-slate-400">How often do you withhold a useful idea or valid concern because it feels safer to stay quiet?</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-accent font-display">{p4.voiceSuppression}</span>
                    <span className="text-[10px] font-black text-slate-300 block uppercase tracking-widest">/ 10</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                    const isSelected = p4.voiceSuppression === num;
                    const getColor = (n: number) => {
                      if (n <= 3) return isSelected ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white border-emerald-100 text-emerald-600 hover:bg-emerald-50';
                      if (n <= 6) return isSelected ? 'bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-100' : 'bg-white border-amber-100 text-amber-600 hover:bg-amber-50';
                      return isSelected ? 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-100' : 'bg-white border-rose-100 text-rose-600 hover:bg-rose-50';
                    };
                    return (
                      <button 
                        key={num} 
                        onClick={() => setP4({...p4, voiceSuppression: num})}
                        className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all duration-200 ${getColor(num)} ${isSelected ? 'scale-105 z-10' : 'scale-100'}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[9px] text-emerald-400 font-medium">Never</span>
                  <span className="text-[9px] text-rose-400 font-medium">Always</span>
                </div>
              </div>

              {/* Alternate Contact */}
              <div className="p-6 bg-gradient-to-br from-blue-50/30 to-white rounded-2xl border border-blue-100/50">
                <label className="text-sm font-bold text-slate-800 block mb-2">Other than your direct supervisor, who helps you to solve problems or get work done?</label>
                <p className="text-[10px] text-slate-400 mb-4">Select the person you most often turn to for help or guidance.</p>
                <select 
                  value={p4.alternateContact} 
                  onChange={e => setP4({...p4, alternateContact: e.target.value})} 
                  className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none text-sm focus:border-blue-400 transition-colors font-medium"
                >
                  <option value="">-- Choose Contact --</option>
                  {employees
                    .filter((e: any) => e.name !== workerName && e.name !== supervisorName)
                    .map((e: any) => (
                      <option key={e.id} value={e.name}>{e.name} ({e.role || 'Team Member'})</option>
                    ))
                  }
                  <option value="colleagues">Colleagues / Peer Group</option>
                  <option value="none">I work independently</option>
                </select>
              </div>

              <div className="flex justify-between pt-8 border-t border-gray-100 mt-8">
                <button onClick={() => setPhase(3)} className="px-6 py-3 text-gray-400 font-bold flex items-center gap-2 hover:text-gray-600 transition-colors"><ArrowLeft size={16} /> Previous</button>
                <button onClick={completeAudit} className="px-10 py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">Submit Audit <CheckCircle2 size={18} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 5: COMPLETE */}
        {phase === 5 && (
          <motion.div key="p5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center p-8">
             <div className="p-12 rounded-[2rem] bg-white border border-gray-100 shadow-2xl max-w-md w-full text-center">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-display font-bold text-textMain mb-4">Audit Saved.</h2>
                <p className="text-textMuted text-sm mb-10">Your diagnostic profile has been successfully recorded to the system.</p>

                {isGlobalDone ? (
                    <button onClick={() => setShowVerification(true)} className="w-full py-4 rounded-xl font-bold bg-textMain text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                        Generate remaining profiles
                    </button>
                ) : (
                    <button onClick={() => {
                        setWorkerName('');
                        setWorkerDept('');
                        setSupervisorName('');
                        setPhase(0);
                    }} className="w-full py-4 rounded-xl font-bold bg-accent text-white shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                        Begin new self audit
                    </button>
                )}
             </div>

             {/* VERIFICATION MODAL */}
             <AnimatePresence>
                {showVerification && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowVerification(false)} />
                        
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-md p-8 md:p-12 shadow-2xl relative z-10 border border-gray-100"
                        >
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-blue-50 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Activity size={40} />
                                </div>
                                <h2 className="text-3xl font-display font-bold text-textMain mb-2">Final Verification</h2>
                                <p className="text-textMuted text-sm">Review audit coverage before profile synthesis.</p>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center transition-all">
                                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Total Headcount (Step 1)</span>
                                    <span className="text-2xl font-display font-bold text-textMain">{companySetup?.company?.headcount || 'N/A'}</span>
                                </div>
                                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                                    <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">Actually Audited (Unique)</span>
                                    <span className="text-2xl font-display font-bold text-emerald-600">
                                        {[...new Set(allDiagnostics.map((d: any) => d.employee_name?.toLowerCase()))].length + localCompleted.length}
                                    </span>
                                </div>

                                <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex justify-between items-center">
                                    <div>
                                        <span className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] block">Employees to be generated by AI</span>
                                        <span className="text-[9px] text-indigo-400 font-medium">Remaining gap to headcount</span>
                                    </div>
                                    <span className="text-3xl font-display font-bold text-indigo-600">
                                        {Math.max(0, (companySetup?.company?.headcount || 0) - [...new Set(allDiagnostics.map((d: any) => d.employee_name?.toLowerCase()))].length - localCompleted.length)}
                                    </span>
                                </div>

                                {compliance.isFullyCompliant ? (
                                    <div className="bg-emerald-100/50 p-4 rounded-xl border border-emerald-200 flex items-center gap-3 text-emerald-700 text-xs font-bold shadow-inner">
                                        <CheckCircle2 size={18} /> Full Compliance Achieved
                                    </div>
                                ) : (
                                    <div className="bg-orange-100/50 p-4 rounded-xl border border-orange-200 flex items-center gap-3 text-orange-700 text-xs font-bold shadow-inner">
                                        <Activity size={18} /> Coverage Gap Detected
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {headcountMet ? (
                                  <button
                                      onClick={() => onNext ? onNext() : null}
                                      className="w-full py-4 bg-textMain text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                  >
                                      Complete Hierarchy <ArrowRight size={18} />
                                  </button>
                                ) : (
                                  <button
                                      onClick={() => {
                                          setShowVerification(false);
                                          setIsSynthesizing(true);
                                      }}
                                      className="w-full py-4 bg-textMain text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                  >
                                      AI Generate Remaining Staff <ArrowRight size={18} />
                                  </button>
                                )}
                                <button
                                    onClick={() => setShowVerification(false)}
                                    className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft size={16} /> Back to Hub
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
             </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>

      <AnimatePresence>
          {isSynthesizing && (
              <SyntheticGeneration 
                  onComplete={(dataToReturn) => {
                      setIsSynthesizing(false);
                      if (onNext) onNext(dataToReturn);
                  }} 
              />
          )}
      </AnimatePresence>
    </div>
  );
}
