import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CompanyProfile from './cards/CompanyProfile';
import SupervisorDiagnostic from './cards/SupervisorDiagnostic';
import WorkerDiagnostic from './cards/WorkerDiagnostic';
import SetupComplete from './cards/SetupComplete';
import SynthesisSummary from './cards/SynthesisSummary';

const IntakeFlow = () => {
  const [step, setStep] = useState(0); // 0: Company, 1: Supervisor, 2: Worker, 3: Summary, 4: Complete
  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [stepKey, setStepKey] = useState(0);
  const [syntheticSummaryData, setSyntheticSummaryData] = useState<any>(null);
  const navigate = useNavigate();

  const calculateRoleEligibility = (employees: any[]) => {
    const roleEligibility: Record<string, 'top' | 'middle' | 'worker'> = {};
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
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      navigate('/');
    }
  };

  const handleRestart = () => {
    setData((prev: any) => ({ ...prev, latest_supervisor: null }));
    setStepKey((prev: number) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-accent animate-pulse font-display font-medium">Loading organization context...</div>
      </div>
    );
  }

  const steps = [
    <CompanyProfile onNext={handleNext} initialData={data.company_setup} />,
    <SupervisorDiagnostic 
      key={`sup-${stepKey}`} 
      data={data} 
      onRestart={handleRestart}
      onNext={() => handleNext({})}
    />,
    <WorkerDiagnostic 
      key={`work-${stepKey}`}
      data={data}
      onRestart={handleRestart}
      onNext={(syntheticData) => {
        if (!syntheticData) {
          // Direct bypass to final hierarchy if no AI generation was needed
          setStep(4);
        } else {
          setSyntheticSummaryData(syntheticData);
          handleNext({ syntheticData });
        }
      }}
    />,
    <SynthesisSummary 
        data={syntheticSummaryData} 
        onComplete={() => handleNext({})} 
        onBack={() => setStep(2)}
    />,
    <SetupComplete 
      key={`complete-${stepKey}`}
      data={data}
      onBack={() => setStep(3)}
    />
  ];

  return (
    <div className={`${step === 4 ? 'min-h-screen overflow-auto' : 'h-screen overflow-hidden'} bg-background relative flex flex-col pt-12 px-4 pb-8`}>
      <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      
      <div className="absolute top-6 left-6 cursor-pointer" onClick={() => navigate('/')}>
        <div className="font-display font-semibold text-xl tracking-tight text-textMain">
          WORKable<span className="text-accent"> Intake</span>
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto mb-8 relative z-10">
        <div className="flex justify-between items-center px-2">
          {['Company Setup', 'Supervisor Audit', 'Worker Diagnostic', 'Setup Complete'].map((label, idx) => (
            <div 
              key={label} 
              className={`flex flex-col items-center cursor-pointer transition-all ${idx === step ? 'scale-110' : 'opacity-50'}`}
              onClick={() => idx <= step || Object.keys(data).length > 0 ? setStep(idx) : null}
            >
              <div 
                className={`w-3 h-3 rounded-full mb-2 transition-colors duration-500 ${
                  idx <= step ? 'bg-accent shadow-[0_0_10px_rgba(0,122,255,0.4)]' : 'bg-gray-200'
                }`} 
              />
              <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                idx <= step ? 'text-accent' : 'text-gray-400'
              }`}>{label}</span>
            </div>
          ))}
          <div className="absolute top-1.5 left-4 right-4 h-[2px] bg-gray-100 -z-10" />
          <div 
            className="absolute top-1.5 left-4 h-[2px] bg-accent -z-10 transition-all duration-700 ease-out" 
            style={{ width: `calc(${(step / 3) * 100}% - 1rem)` }} 
          />
        </div>
      </div>

      <div className={`flex-1 w-full ${step === 4 ? 'max-w-none px-4' : 'max-w-3xl'} mx-auto relative z-10 flex flex-col min-h-0 transition-all duration-700`}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${step}-${stepKey}`}
            className="flex-1 w-full flex flex-col min-h-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IntakeFlow;
