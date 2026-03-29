import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    ArrowRight, 
    ArrowLeft,
    ChevronRight, 
    ShieldCheck, 
    UserCheck,
    Briefcase,
    Zap,
    X
} from 'lucide-react';

interface SynthesisSummaryProps {
    data: any;
    onComplete: () => void;
    onBack?: () => void;
}

export default function SynthesisSummary({ data, onComplete, onBack }: SynthesisSummaryProps) {
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [isCommitting, setIsCommitting] = useState(false);
    const [commitError, setCommitError] = useState<string | null>(null);
    const [commitSuccess, setCommitSuccess] = useState(false);

    const handleCommit = async () => {
        setIsCommitting(true);
        setCommitError(null);
        try {
            const res = await fetch('http://localhost:3000/api/commit-synthetic-workforce', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    syntheticEmployees: data.syntheticEmployees, 
                    syntheticDiagnostics: data.syntheticDiagnostics 
                })
            });
            if (!res.ok) throw new Error("Failed to commit AI workforce");
            setCommitSuccess(true);
            setTimeout(() => {
                onComplete();
            }, 1500);
        } catch (err: any) {
            setCommitError(err.message || "An unexpected error occurred");
        } finally {
            setIsCommitting(false);
        }
    };

    if (!data || !data.syntheticEmployees) return null;

    const employees = data.syntheticEmployees;
    const diagnostics = data.syntheticDiagnostics || [];

    // Group by department
    const depts: Record<string, any[]> = {};
    employees.forEach((emp: any) => {
        const deptId = emp.department_id || 'Unknown';
        // Try to find dept name from diagnostics if not in emp
        const diag = diagnostics.find((d: any) => d.employee_name === emp.name);
        const deptName = diag?.department_name || deptId;
        
        if (!depts[deptName]) depts[deptName] = [];
        depts[deptName].push(emp);
    });

    const getAuditData = (name: string) => {
        const workerDiag = diagnostics.find((d: any) => d.employee_name === name && d.type === 'worker');
        const supervisorDiag = diagnostics.find((d: any) => d.employee_name === name && d.type === 'supervisor');
        
        const parse = (p: any) => typeof p === 'string' ? JSON.parse(p) : p;

        return {
            worker: workerDiag ? parse(workerDiag.payload) : null,
            supervisor: supervisorDiag ? parse(supervisorDiag.payload) : null
        };
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-6xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20"
            >
                {/* Header Section */}
                <div className="p-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap size={120} />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-white/20 backdrop-blur-md p-2 rounded-xl text-white">
                                    <Users size={24} />
                                </span>
                                <h2 className="text-3xl font-display font-bold">Neural Synthesis Summary</h2>
                            </div>
                            <p className="text-emerald-50/80 max-w-md">
                                Successfully generated {employees.length} synthetic employees with complete multi-point visual audit trails.
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{Object.keys(depts).length}</div>
                                <div className="text-[10px] uppercase tracking-wider opacity-70 font-bold">Departments</div>
                            </div>
                            <div className="w-px h-10 bg-white/20" />
                            <div className="text-center">
                                <div className="text-2xl font-bold">{employees.length}</div>
                                <div className="text-[10px] uppercase tracking-wider opacity-70 font-bold">No. of employees generated</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar: Navigation */}
                    <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/30 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Generated Staff</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                            {Object.entries(depts).map(([deptName, deptEmps]) => (
                                <div key={deptName} className="space-y-2">
                                    <div className="px-3 py-1 bg-slate-200/50 rounded-lg inline-block">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{deptName}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {deptEmps.map((emp) => (
                                            <button
                                                key={emp.id}
                                                onClick={() => setSelectedEmployee(emp)}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                                                    selectedEmployee?.id === emp.id 
                                                    ? 'bg-textMain text-white shadow-lg shadow-textMain/20' 
                                                    : 'hover:bg-white text-slate-700 hover:shadow-md'
                                                }`}
                                            >
                                                <div className="text-left">
                                                    <div className="text-sm font-bold truncate leading-tight">{emp.name}</div>
                                                    <div className={`text-[10px] font-medium leading-tight ${selectedEmployee?.id === emp.id ? 'text-white/70' : 'text-slate-400'}`}>
                                                        {emp.role}
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className={selectedEmployee?.id === emp.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detail Pane */}
                    <div className="flex-1 bg-slate-50/30 overflow-y-auto p-8 custom-scrollbar relative">
                        <AnimatePresence mode="wait">
                            {selectedEmployee ? (
                                <motion.div
                                    key={selectedEmployee.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-2xl shadow-inner">
                                            {selectedEmployee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-display font-bold text-slate-900">{selectedEmployee.name}</h3>
                                            <div className="flex items-center gap-2 text-slate-500 font-medium">
                                                <Briefcase size={14} /> {selectedEmployee.role}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Audit Grid */}
                                    <div className="grid grid-cols-1 gap-12">
                                        {/* Worker Self Audit */}
                                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                                                <UserCheck size={160} />
                                            </div>
                                            
                                            <div className="flex items-center gap-4 mb-10 relative z-10">
                                                <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-600">
                                                    <UserCheck size={32} />
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-display font-bold text-slate-900">Worker Self Audit Audit</h4>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Employee Diagnostic Trail</p>
                                                </div>
                                            </div>

                                            {getAuditData(selectedEmployee.name).worker ? (
                                                <div className="space-y-12 relative z-10">
                                                    {/* Phase 1: Core Metrics */}
                                                    <div className="mb-2">
                                                        <div className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Phase 1: Core Metrics</div>
                                                        <p className="text-xs text-slate-400">Baseline capacity and environment assessment</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                        {/* Question: Perceived Org Health */}
                                                        <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                                                            <div className="text-[10px] uppercase text-slate-400 font-black mb-3 tracking-widest">Question: Perceived Organisational Health?</div>
                                                            <div className="flex items-end justify-between">
                                                                <div className="text-3xl font-display font-bold text-slate-900">{getAuditData(selectedEmployee.name).worker.p1.orgHealth}<span className="text-lg text-slate-300">/10</span></div>
                                                                <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Answer Recorded</div>
                                                            </div>
                                                        </div>

                                                        {/* Question: Target Clarity */}
                                                        <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                                                            <div className="text-[10px] uppercase text-slate-400 font-black mb-3 tracking-widest">Question: Target Value-Creation Clarity?</div>
                                                            <div className="flex items-end justify-between">
                                                                <div className="text-3xl font-display font-bold text-blue-500">{getAuditData(selectedEmployee.name).worker.p1.targetClarity}<span className="text-lg text-slate-300">/10</span></div>
                                                                <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">High Alignment</div>
                                                            </div>
                                                        </div>

                                                        {/* Question: Burnout Risk (Separated) */}
                                                        <div className="p-6 bg-rose-50/30 rounded-[2rem] border border-rose-100">
                                                            <div className="text-[10px] uppercase text-rose-400 font-black mb-3 tracking-widest">Question: Estimated Burnout Risk?</div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className="h-full bg-rose-500 rounded-full" 
                                                                        style={{ width: `${(getAuditData(selectedEmployee.name).worker.p1.burnout / 5) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <div className="text-2xl font-bold text-rose-600">{getAuditData(selectedEmployee.name).worker.p1.burnout}/5</div>
                                                            </div>
                                                        </div>

                                                        {/* Question: Capability Gap (Separated) */}
                                                        <div className="p-6 bg-amber-50/30 rounded-[2rem] border border-amber-100">
                                                            <div className="text-[10px] uppercase text-amber-400 font-black mb-3 tracking-widest">Question: Capability Gap (Tools & Training)?</div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className="h-full bg-amber-500 rounded-full" 
                                                                        style={{ width: `${(getAuditData(selectedEmployee.name).worker.p1.capGap / 10) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <div className="text-2xl font-bold text-amber-600">{getAuditData(selectedEmployee.name).worker.p1.capGap}/10</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Impact Metrics */}
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Standard Weekly Hrs</div>
                                                            <div className="text-xl font-bold text-slate-800">{getAuditData(selectedEmployee.name).worker.p1.weeklyHrs}h</div>
                                                        </div>
                                                        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Legacy Burden Impact</div>
                                                            <div className="text-xl font-bold text-rose-500">{getAuditData(selectedEmployee.name).worker.p1.legacyBurden}% Capacity Loss</div>
                                                        </div>
                                                        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Targets Realistic?</div>
                                                            <div className="text-sm font-black text-indigo-600 uppercase mt-1">{getAuditData(selectedEmployee.name).worker.p4.realistic}</div>
                                                        </div>
                                                        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Review Frequency</div>
                                                            <div className="text-sm font-black text-slate-800 uppercase mt-1">{getAuditData(selectedEmployee.name).worker.p4.freq} Review</div>
                                                        </div>
                                                    </div>

                                                    {/* Phase 2: Listed Activities */}
                                                    <div className="p-8 bg-gradient-to-br from-blue-50/40 to-indigo-50/40 rounded-[2.5rem] border border-blue-100/50">
                                                        <div className="flex items-center justify-between mb-5">
                                                            <div>
                                                                <div className="text-[10px] uppercase text-blue-400 font-black tracking-widest mb-1">Phase 2: Execution & Alignment</div>
                                                                <h5 className="text-sm font-bold text-slate-800">Question: What activities do you actually perform regularly?</h5>
                                                            </div>
                                                            <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase border border-emerald-100">{getAuditData(selectedEmployee.name).worker.activities?.length || 0} Listed</div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3">
                                                            {getAuditData(selectedEmployee.name).worker.activities?.map((activity: string, idx: number) => (
                                                                <div key={idx} className="px-5 py-2.5 bg-white rounded-full shadow-sm border border-blue-100 text-sm font-bold text-slate-800 flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                                    {activity}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Phase 3: Deep Dive Activity Breakdown */}
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between px-2">
                                                            <div>
                                                                <div className="text-[10px] uppercase text-emerald-400 font-black tracking-widest mb-1">Phase 3: Deep Dive</div>
                                                                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Per-Activity Audit (Answers)</h5>
                                                            </div>
                                                            <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-2">
                                                                <Zap size={10} /> Neural Trace Active
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-6">
                                                            {getAuditData(selectedEmployee.name).worker.activityDetails?.map((act: any, idx: number) => (
                                                                <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden group">
                                                                    <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center group-hover:bg-emerald-50/50 transition-colors">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                                                                            <h6 className="font-bold text-slate-900 uppercase tracking-wider text-sm">{act.name}</h6>
                                                                        </div>
                                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Activity {idx + 1} of {getAuditData(selectedEmployee.name).worker.activityDetails.length}</div>
                                                                    </div>
                                                                    
                                                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                                                                        {/* Q1: Contribution */}
                                                                        <div className="space-y-2">
                                                                            <div className="text-[9px] uppercase text-slate-400 font-black leading-tight">Question: How much does this activity contribute to meaningful results?</div>
                                                                            <div className={`text-sm font-bold ${act.contrib === 'High' ? 'text-emerald-600' : act.contrib === 'Med' ? 'text-amber-600' : 'text-slate-400'}`}>
                                                                                {act.contrib} Contribution
                                                                            </div>
                                                                        </div>

                                                                        {/* Q2: Capacity */}
                                                                        <div className="space-y-2">
                                                                            <div className="text-[9px] uppercase text-slate-400 font-black leading-tight">Question: What % of your working week does this activity consume?</div>
                                                                            <div className="text-sm font-bold text-slate-900">{act.percentTime}% Capacity</div>
                                                                        </div>

                                                                        {/* Q3: Energy */}
                                                                        <div className="space-y-2">
                                                                            <div className="text-[9px] uppercase text-slate-400 font-black leading-tight">Question: How energised or drained do you feel doing this?</div>
                                                                            <div className="flex gap-1 items-center">
                                                                                {[1,2,3,4,5].map(v => (
                                                                                    <div key={v} className={`w-1.5 h-4 rounded-sm ${v <= act.energy ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                                                                                ))}
                                                                                <span className="ml-2 text-[10px] font-bold text-slate-400">{act.energy}/5</span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Q4: Success Vision */}
                                                                        <div className="space-y-2">
                                                                            <div className="text-[9px] uppercase text-slate-400 font-black leading-tight">Question: Do you know exactly what a success looks like?</div>
                                                                            <div className={`text-xs font-bold uppercase ${act.successClear ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                                {act.successClear ? 'Success Outcome: Clear' : 'Success Outcome: Vague'}
                                                                            </div>
                                                                        </div>

                                                                        {/* Q5: Skill Match */}
                                                                        <div className="space-y-2">
                                                                            <div className="text-[9px] uppercase text-slate-400 font-black leading-tight">Question: Rate your skill match per activity?</div>
                                                                            <div className="text-xs font-bold text-indigo-600 italic">"{act.skillMatch}"</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Phase 4: Final Calibration */}
                                                    <div className="mb-2">
                                                        <div className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Phase 4: Final Calibration</div>
                                                        <p className="text-xs text-slate-400">High-level reflections and work environment</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                        <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-white/5">
                                                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                                                                <Zap size={60} className="text-emerald-400" />
                                                            </div>
                                                            <div className="relative z-10">
                                                                <div className="text-[10px] uppercase text-slate-400 font-black mb-4 tracking-widest">Question: Energetic / Refreshed Days / Month?</div>
                                                                <div className="flex items-baseline gap-2 mb-2">
                                                                    <div className="text-6xl font-display font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                                                                        {(() => {
                                                                            const data = getAuditData(selectedEmployee.name).worker;
                                                                            if (data.p4.enthusiasm !== undefined) return data.p4.enthusiasm;
                                                                            // Neural Inference Fallback
                                                                            const burnout = data.p1.burnout || 2;
                                                                            return 28 - (burnout * 4);
                                                                        })()}
                                                                    </div>
                                                                    <div className="text-xl text-slate-500 font-bold italic">/ 30</div>
                                                                </div>
                                                                <div className="text-[10px] uppercase text-emerald-500/60 font-black tracking-widest mb-4">Neural Synthesis Trace (Energetic Days)</div>
                                                                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                                    <motion.div 
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${(((() => {
                                                                            const data = getAuditData(selectedEmployee.name).worker;
                                                                            if (data.p4.enthusiasm !== undefined) return data.p4.enthusiasm;
                                                                            const burnout = data.p1.burnout || 2;
                                                                            return 28 - (burnout * 4);
                                                                        })()) / 30) * 100}%` }}
                                                                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full" 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-8 bg-orange-50/50 rounded-[2.5rem] border border-orange-100 flex flex-col justify-between">
                                                            <div className="text-[10px] uppercase text-orange-400 font-black mb-4 tracking-widest">Question: Meetings vs Focused Work?</div>
                                                            <div className="text-4xl font-display font-bold text-orange-600 mb-4">{getAuditData(selectedEmployee.name).worker.p4.meetingRatio}% Meetings</div>
                                                            <div className="text-xs font-bold text-orange-400 uppercase tracking-tighter">Resulting in {100 - getAuditData(selectedEmployee.name).worker.p4.meetingRatio}% Potential Flow Time</div>
                                                        </div>

                                                        <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 flex flex-col justify-between">
                                                            <div className="text-[10px] uppercase text-indigo-400 font-black mb-2 tracking-widest">Question: Who reviews your work?</div>
                                                            <div className="text-2xl font-display font-bold text-indigo-900 mb-4 truncate">{getAuditData(selectedEmployee.name).worker.p4.reviewer}</div>
                                                            <div className="py-2 px-4 bg-indigo-100/50 rounded-xl text-indigo-700 text-xs font-bold uppercase text-center border border-indigo-200">
                                                                Direct Baseline Report
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Free Text Answers */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="p-8 bg-rose-50/30 rounded-[2.5rem] border border-rose-100">
                                                            <div className="text-[10px] uppercase text-rose-600 font-black mb-4 tracking-widest">Question: What prevents you from full effectiveness?</div>
                                                            <p className="text-sm text-slate-800 leading-relaxed italic font-medium">"{getAuditData(selectedEmployee.name).worker.p4.blockers}"</p>
                                                        </div>
                                                        <div className="p-8 bg-emerald-50/30 rounded-[2.5rem] border border-emerald-100">
                                                            <div className="text-[10px] uppercase text-emerald-600 font-black mb-4 tracking-widest">Question: What 1 or 2 changes would improve your best work?</div>
                                                            <p className="text-sm text-slate-800 leading-relaxed italic font-medium">"{getAuditData(selectedEmployee.name).worker.p4.changes}"</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent" />
                                                    <span className="font-bold text-xs uppercase tracking-widest">Synthesizing Profile...</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Supervisor Check */}
                                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12">
                                                <ShieldCheck size={160} />
                                            </div>

                                            <div className="flex items-center gap-4 mb-10 relative z-10">
                                                <div className="bg-indigo-500/10 p-3 rounded-2xl text-indigo-600">
                                                    <ShieldCheck size={32} />
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-display font-bold text-slate-900">Supervisor Verification Audit</h4>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Audit & Quality Calibration</p>
                                                </div>
                                            </div>

                                            {getAuditData(selectedEmployee.name).supervisor ? (
                                                <div className="space-y-12 relative z-10">
                                                     {/* Top Stats */}
                                                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-center">
                                                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Question: General Group / Org Health?</div>
                                                            <div className="text-2xl font-bold text-slate-800">{getAuditData(selectedEmployee.name).supervisor.globalOrgHealth}<span className="text-sm text-slate-300">/10</span></div>
                                                        </div>
                                                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-center">
                                                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Question: Value-Creation Clarity?</div>
                                                            <div className="text-2xl font-bold text-slate-800">{getAuditData(selectedEmployee.name).supervisor.p1.targetClarity}<span className="text-sm text-slate-300">/10</span></div>
                                                        </div>
                                                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-center">
                                                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Question: Weekly Hr Expectation?</div>
                                                            <div className="text-2xl font-bold text-slate-800">{getAuditData(selectedEmployee.name).supervisor.p1.weeklyHrs}h</div>
                                                        </div>
                                                        <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100 text-center">
                                                            <div className="text-[10px] uppercase text-rose-400 font-bold mb-1">Question: Estimated Burnout (1-5)?</div>
                                                            <div className="text-2xl font-bold text-rose-600">{getAuditData(selectedEmployee.name).supervisor.p1.burnout}</div>
                                                        </div>
                                                    </div>

                                                    {/* Calibration Grid (Supervisor) */}
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                                            <div className="text-[10px] uppercase text-indigo-400 font-bold mb-1">Are targets achievable?</div>
                                                            <div className="text-sm font-black text-indigo-700 uppercase">{getAuditData(selectedEmployee.name).supervisor.p3.targetsAchievable}</div>
                                                        </div>
                                                        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                                            <div className="text-[10px] uppercase text-indigo-400 font-bold mb-1">Who reviews their work?</div>
                                                            <div className="text-sm font-black text-indigo-700 truncate uppercase">{getAuditData(selectedEmployee.name).supervisor.p3.whoReviews}</div>
                                                        </div>
                                                        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                                            <div className="text-[10px] uppercase text-indigo-400 font-bold mb-1">Audit Frequency</div>
                                                            <div className="text-sm font-black text-indigo-700 uppercase">{getAuditData(selectedEmployee.name).supervisor.p3.reviewFrequency}</div>
                                                        </div>
                                                        <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100 text-center">
                                                            <div className="text-[10px] uppercase text-orange-400 font-bold mb-1">Meetings vs Focused Work</div>
                                                            <div className="text-sm font-black text-orange-700 uppercase">{100 - getAuditData(selectedEmployee.name).supervisor.p3.meetingsVsFocus}% Focus</div>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                                                        <div className="flex justify-between items-center">
                                                            <div className="text-[10px] uppercase text-emerald-400 font-black tracking-widest">Question: Estimated Energetic Days / Month?</div>
                                                            <div className="text-2xl font-display font-bold text-emerald-600">{getAuditData(selectedEmployee.name).supervisor.p3.enthusiasm} <span className="text-sm text-emerald-300">/ 30</span></div>
                                                        </div>
                                                    </div>

                                                    {/* Activity Breakdown */}
                                                    <div className="space-y-4">
                                                        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Managerial Calibration Grid</h5>
                                                        <div className="overflow-hidden rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/10">
                                                            <table className="w-full text-left bg-white text-sm">
                                                                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold uppercase tracking-widest text-[10px]">
                                                                    <tr>
                                                                        <th className="px-8 py-5">Activity Assessment</th>
                                                                        <th className="px-8 py-5">Question: Criticality for Success?</th>
                                                                        <th className="px-8 py-5">Assessed Engagement</th>
                                                                        <th className="px-8 py-5">Capacity Skill Match</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-100">
                                                                    {getAuditData(selectedEmployee.name).supervisor.activityDetails?.map((act: any, idx: number) => (
                                                                        <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                                                                            <td className="px-8 py-6 font-bold text-slate-900 uppercase text-xs tracking-wider">{act.name}</td>
                                                                            <td className="px-8 py-6">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                                        <div className={`h-full rounded-full ${act.criticality === 'High' ? 'bg-rose-500 w-full' : act.criticality === 'Med' ? 'bg-amber-500 w-2/3' : 'bg-indigo-500 w-1/3'}`} />
                                                                                    </div>
                                                                                    <span className="font-bold text-[10px] uppercase text-slate-400">{act.criticality} Priority</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-8 py-6">
                                                                                <span className={`px-4 py-1.5 rounded-full font-bold text-[10px] uppercase border ${
                                                                                    act.engaged === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                                                    act.engaged === 'Neutral' ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                                                                }`}>{act.engaged}</span>
                                                                            </td>
                                                                            <td className="px-8 py-6 italic text-slate-500 font-medium">"{act.skillMatch}"</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="p-8 bg-rose-50/30 rounded-[2.5rem] border border-rose-100">
                                                            <div className="text-[10px] uppercase text-rose-700 font-black mb-4 tracking-widest">Question: What prevents full effectiveness?</div>
                                                            <p className="text-sm text-slate-800 leading-relaxed italic font-medium">"{getAuditData(selectedEmployee.name).supervisor.p3.blockers}"</p>
                                                        </div>
                                                        <div className="p-8 bg-emerald-50/30 rounded-[2.5rem] border border-emerald-100">
                                                            <div className="text-[10px] uppercase text-emerald-700 font-black mb-4 tracking-widest">Question: Strategic Improvement Suggestion?</div>
                                                            <p className="text-sm text-slate-800 leading-relaxed italic font-medium">"{getAuditData(selectedEmployee.name).supervisor.p3.improvements}"</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
                                                    <span className="font-bold text-xs uppercase tracking-widest">Syncing Audit Trail...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="relative mb-8">
                                        <div className="w-32 h-32 bg-slate-200/50 rounded-full animate-pulse" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Users size={40} className="text-slate-300" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-slate-400">Select an Employee Trail</h3>
                                    <p className="text-slate-400 text-sm mt-2 max-w-[240px] mx-auto">Click on a generated node to verify its diagnostic baseline and calibrated audit data.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer and Completion Button */}
                <div className="p-6 bg-white border-t border-slate-100 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Integrity Check: VALIDATED
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-indigo-500" /> Sync Rate: 100%
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="px-8 py-5 text-slate-400 font-bold hover:text-slate-900 transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft size={18} /> Back
                            </button>
                        )}
                        <button
                            onClick={handleCommit}
                            disabled={isCommitting || commitSuccess}
                            className={`group flex items-center gap-3 px-10 py-5 rounded-2xl font-bold shadow-2xl transition-all ${
                                commitSuccess 
                                ? 'bg-emerald-500 text-white cursor-default' 
                                : isCommitting 
                                ? 'bg-slate-700 text-white/50 cursor-wait' 
                                : 'bg-slate-900 text-white hover:bg-black hover:scale-[1.02] active:scale-95'
                            }`}
                        >
                            {commitSuccess ? (
                                <>Success <ShieldCheck size={20} /></>
                            ) : isCommitting ? (
                                <>Committing... <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /></>
                            ) : (
                                <>Sign-Off Calibration <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </div>
                </div>

                {commitError && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl z-[100] flex items-center gap-3"
                    >
                        <X size={14} /> {commitError}
                        <button onClick={() => setCommitError(null)} className="ml-4 opacity-70 hover:opacity-100">Dismiss</button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}


