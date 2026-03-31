import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CompanyProfile from './cards/CompanyProfile';
import SupervisorDiagnostic from './cards/SupervisorDiagnostic';
import WorkerDiagnostic from './cards/WorkerDiagnostic';
import SetupComplete from './cards/SetupComplete';
import SynthesisSummary from './cards/SynthesisSummary';
import EngineInitialization from './EngineInitialization';

const IntakeFlow = () => {
  const [step, setStep] = useState(0); // 0: Company, 1: Supervisor, 2: Worker, 3: Summary, 4: Complete
  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [stepKey, setStepKey] = useState(0);
  const [syntheticSummaryData, setSyntheticSummaryData] = useState<any>(null);
  const [showEngineInit, setShowEngineInit] = useState(false); // Disabled per request
  const navigate = useNavigate();

  const calculateRoleEligibility = (employees: any[]) => {
    const roleEligibility: Record<string, 'top' | 'middle' | 'worker'> = {};
    if (!employees || !Array.isArray(employees)) return roleEligibility;
    
    employees.forEach((emp: any) => {
      const nameNorm = emp.name?.trim().toLowerCase();
      const hasManager = emp.manager && emp.manager !== 'None' && emp.manager.trim() !== '';
      const managesOthers = employees.some((e: any) => e.manager?.trim().toLowerCase() === nameNorm);
      
      if (!hasManager) {
        roleEligibility[emp.id] = 'top';
      } else if (hasManager && managesOthers) {
        roleEligibility[emp.id] = 'middle';
      } else {
        roleEligibility[emp.id] = 'worker';
      }
    });
    return roleEligibility;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [companyRes, intakeRes] = await Promise.all([
          fetch('http://localhost:3000/api/company-setup'),
          fetch('http://localhost:3000/api/intake')
        ]);
        
        const companyJson = await companyRes.json();
        const intakeJson = await intakeRes.json();
        
        // FORCED CLEAN SLATE: If server is empty, wipe the browser's persistent memory
        if (!companyJson || Object.keys(companyJson).length === 0) {
            console.log('[SYSTEM] Server is empty. Purging browser memory...');
            localStorage.clear();
            sessionStorage.clear();
        }
        
        const employees = companyJson?.employees || [];
        const roleEligibility = calculateRoleEligibility(employees);

        setData({ 
          company_setup: companyJson && Object.keys(companyJson).length > 0 ? companyJson : null,
          roleEligibility,
          latest_supervisor: intakeJson?.supervisor || null,
          all_diagnostics: intakeJson?.all_diagnostics || []
        });
      } catch (err) {
        console.error('Failed to load initial data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleNext = (stepData: any) => {
    let updatedData;
    if (step === 0) {
      const employees = stepData.employees || [];
      const eligibility = calculateRoleEligibility(employees);
      updatedData = { 
        ...data, 
        company_setup: stepData,
        roleEligibility: eligibility 
      };
    } else {
      updatedData = { ...data, ...stepData };
    }
    
    setData(updatedData);
    if (step < 4) setStep(step + 1);
    else navigate('/');
  };

  const handleRestart = () => {
    setData((prev: any) => ({ ...prev, latest_supervisor: null }));
    setStepKey((prev: number) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-blue-500 animate-pulse font-display font-medium">Loading organization context...</div>
      </div>
    );
  }

  // RENDER ONLY THE ACTIVE STEP TO PREVENT FUTURE STEP CRASHES
  const renderStep = () => {
    switch (step) {
      case 0:
        return <CompanyProfile onNext={handleNext} />;
      case 1:
        return <SupervisorDiagnostic key={`sup-${stepKey}`} data={data} onRestart={handleRestart} onNext={() => handleNext({})} />;
      case 2:
        return <WorkerDiagnostic key={`work-${stepKey}`} data={data} onRestart={handleRestart} onNext={(syntheticData) => {
          if (!syntheticData) setStep(4);
          else { setSyntheticSummaryData(syntheticData); handleNext({ syntheticData }); }
        }} />;
      case 3:
        return <SynthesisSummary data={syntheticSummaryData} onComplete={() => handleNext({})} onBack={() => setStep(2)} />;
      case 4:
        return <SetupComplete key={`complete-${stepKey}`} data={data} onBack={() => setStep(3)} />;
      default:
        return <div className="p-8 text-center text-slate-400">Step Out of Range</div>;
    }
  };

  return (
    <div className={`${step === 4 ? 'min-h-screen overflow-auto' : 'h-screen overflow-hidden'} bg-white relative flex flex-col pt-12 px-4 pb-8`}>
      <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="absolute top-6 left-6 cursor-pointer" onClick={() => navigate('/')}>
        <div className="font-display font-semibold text-xl tracking-tight text-slate-900">
          WORKable<span className="text-blue-600"> Intake</span>
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto mb-8 relative z-10">
        <div className="flex justify-between items-center px-2">
          {['Company Setup', 'Supervisor Audit', 'Worker Diagnostic', 'Setup Complete'].map((label, idx) => (
            <div 
              key={label} 
              className={`flex flex-col items-center cursor-pointer transition-all ${idx === (step > 3 ? 3 : step) ? 'scale-110' : 'opacity-40'}`}
              onClick={() => (idx <= step || Object.keys(data).length > 0) ? setStep(idx) : null}
            >
              <div 
                className={`w-2.5 h-2.5 rounded-full mb-2 transition-colors duration-500 ${
                  idx <= (step > 3 ? 3 : step) ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-slate-200'
                }`} 
              />
              <span className={`text-[9px] uppercase tracking-wider font-bold ${
                idx <= (step > 3 ? 3 : step) ? 'text-blue-600' : 'text-slate-400'
              }`}>{label}</span>
            </div>
          ))}
          <div className="absolute top-1 left-8 right-8 h-[1px] bg-slate-100 -z-10" />
        </div>
      </div>

      <div className={`flex-1 w-full ${step === 4 ? 'max-w-none px-4' : 'max-w-3xl'} mx-auto relative z-10 flex flex-col min-h-0`}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${step}-${stepKey}`}
            className="flex-1 w-full flex flex-col min-h-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IntakeFlow;
