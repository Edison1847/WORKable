import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ArrowLeft, Bot } from 'lucide-react';

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

export default function SetupComplete({ onBack, data }: { onBack: () => void, data?: any }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const hasSyntheticDataToSave = data?.syntheticData && !isSaved;

  useEffect(() => {
    // Fetch fresh data including AI generated employees
    fetch('http://localhost:3000/api/company-setup')
      .then(res => res.json())
      .then(serverData => {
        // Merge in the synthetic ones if they exist
        if (data?.syntheticData?.syntheticEmployees) {
            serverData.employees = [
                ...(serverData.employees || []),
                ...data.syntheticData.syntheticEmployees
            ];
        }
        setFormData(serverData);
        setIsLoading(false);
      })
      .catch(err => console.error(err));
  }, [data]);

  const handleSaveSynthetic = async () => {
      if (!data?.syntheticData) return;
      setIsSaving(true);
      try {
          const res = await fetch('http://localhost:3000/api/commit-synthetic-workforce', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data.syntheticData)
          });
          if (res.ok) {
              setIsSaved(true);
          } else {
              alert('Failed to save synthetic employees.');
          }
      } catch (err) {
          console.error(err);
      } finally {
          setIsSaving(false);
      }
  };

  const renderHierarchyNode = (emp: any, level: number = 0) => {
    if (!formData || !formData.employees) return null;
    
    const directReports = formData.employees.filter((e: any) => e.manager === emp.name);
    const isAI = emp.is_ai;

    return (
      <div key={emp.id} className="flex flex-col items-center mt-2 relative">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: level * 0.1 }}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border z-10 
            ${isAI 
              ? 'bg-emerald-50/90 border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
              : 'bg-white border-gray-200 shadow-md shadow-gray-200/30'
            } 
            ${level === 0 ? 'ring-2 ring-accent/10 border-accent' : ''}`}
        >
          <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-black relative shrink-0
            ${isAI ? 'bg-emerald-500' : (level === 0 ? 'bg-accent' : 'bg-slate-800')}
          `}>
             {isAI ? <Bot size={12} /> : emp.name.charAt(0)}
             {isAI && (
               <div className="absolute -top-1 -right-1 flex items-center justify-center">
                 <div className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
                 <div className="relative w-1.5 h-1.5 bg-emerald-400 rounded-full border border-white shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
               </div>
             )}
          </div>
          <div className="min-w-[60px]">
            <div className="flex items-center gap-1.5">
                <div className={`text-[10px] font-bold leading-tight truncate max-w-[80px] ${isAI ? 'text-emerald-900' : 'text-gray-900'}`}>
                    {emp.name}
                </div>
                {isAI && <span className="text-[7px] bg-emerald-500 text-white px-1 py-0.2 rounded font-black tracking-tighter">AI</span>}
            </div>
            <div className={`text-[8px] uppercase tracking-[0.1em] font-black opacity-60 truncate max-w-[80px] ${isAI ? 'text-emerald-700' : 'text-slate-400'}`}>
                {emp.role}
            </div>
          </div>
        </motion.div>
        
        {directReports.length > 0 && (
          <div className="flex flex-col items-center mt-0 w-full relative">
            <div className={`w-px h-5 ${isAI ? 'bg-emerald-200' : 'bg-gray-200'}`}></div>
            <div className={`w-full flex justify-center gap-3 relative pt-3 border-t ${isAI ? 'border-emerald-200' : 'border-gray-200'}`}>
              <div className={`absolute top-0 left-1/2 w-1.5 h-1.5 -ml-0.75 -mt-0.75 rounded-full border border-white ${isAI ? 'bg-emerald-300' : 'bg-gray-200'}`}></div>
              {directReports.map((report: any) => renderHierarchyNode(report, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
      return (
          <div className="flex-1 w-full glass-card rounded-3xl p-8 flex items-center justify-center">
              <div className="text-emerald-600 animate-pulse font-display font-medium">Reconstructing Organizational Overlay...</div>
          </div>
      );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-auto min-h-[80vh] glass-card rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden flex flex-col flex-1 shadow-2xl border-white/50"
    >
        <div className="text-center mb-10 pt-4 relative z-10 shrink-0">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-lg shadow-emerald-100/30">
                <CheckCircle2 size={32} />
            </div>
            <h2 className="text-5xl font-display font-black text-slate-900 tracking-tight">Synthesis Complete</h2>
            <p className="text-slate-500 mt-3 text-xl font-medium">Organization hierarchy successfully mapped and simulated.</p>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/50 rounded-[2rem] border border-slate-200/50 inner-shadow-sm min-h-[600px] relative">
            <div className="w-full min-h-full">
                <div className="w-max mx-auto px-12 pt-12 pb-40 touch-pan-x touch-pan-y flex flex-col items-center">
                   {formData?.employees?.filter((e: any) => e.manager === 'None' || !e.manager).map((ceo: any) => renderHierarchyNode(ceo, 0))}
                </div>
            </div>
        </div>

        <div className="flex items-center justify-between relative z-10 pt-4 border-t border-gray-100">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold shadow-sm transition-all active:scale-95"
            >
                <ArrowLeft size={18} /> Back
            </button>

            <div className="flex gap-4">
                {hasSyntheticDataToSave ? (
                    <button 
                        onClick={handleSaveSynthetic}
                        disabled={isSaving}
                        className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? 'Synchronizing Neural Core...' : 'Finalize & Save Simulation'} <CheckCircle2 size={20} />
                    </button>
                ) : (
                    <div className="flex gap-4">
                        <button 
                            onClick={() => window.location.href = 'http://localhost:5173'}
                            className="group flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                            Executive Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => navigate('/ceo-audit')}
                            className="group flex items-center gap-2 px-8 py-3 rounded-xl bg-textMain text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                            CEO Audit <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    </motion.div>
  );
}
