import React from 'react';
import { Download, FileText } from 'lucide-react';

const ActionPlanPDF: React.FC = () => {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto pb-20">
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Executive Action Plan preview</h2>
          <p className="text-sm text-text-secondary mt-1">Ready for PDF generation</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-accent-cyan bg-opacity-20 text-accent-cyan border border-accent-cyan px-4 py-2 hover:bg-opacity-40 transition rounded shadow-glow-cyan"
        >
          <Download size={18} />
          <span className="font-semibold text-sm tracking-wide">EXPORT PDF</span>
        </button>
      </div>

      {/* A4 Paper Simulation */}
      <div className="bg-white w-full rounded-md shadow-2xl min-h-[1122px] relative p-12 print:p-0 print:shadow-none print:m-0 text-black overflow-hidden font-sans">
        
        {/* Header */}
        <div className="border-b-4 border-black pb-8 mb-10">
          <div className="flex justify-between items-end">
             <div>
               <h1 className="text-5xl font-black tracking-tighter text-black mb-2">WORK<span className="text-gray-400">able</span></h1>
               <p className="text-lg font-bold uppercase tracking-widest text-[#ef4444]">Executive Action Plan</p>
             </div>
             <div className="text-right">
               <p className="font-semibold">March 2026</p>
               <p className="text-gray-500 text-sm">Confidential Draft</p>
             </div>
          </div>
        </div>

        {/* Section 1: Counterfactual History */}
        <div className="mb-12">
          <h2 className="text-2xl font-black border-l-4 border-black pl-4 mb-6 uppercase tracking-wider">1. The Cost of Inaction</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            In the previous audit cycle, 4 recommendations were dismissed. The structural friction from these unactioned leaks has compounded, generating a measurable opportunity cost.
          </p>
          <div className="bg-gray-50 border border-gray-200 p-6 rounded">
             <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
               <span className="font-bold text-gray-800">Dismissed: Engineer Process Redesign</span>
               <span className="font-bold text-[#ef4444]">-$64,000 realised loss</span>
             </div>
             <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
               <span className="font-bold text-gray-800">Dismissed: Product Management Reallocation</span>
               <span className="font-bold text-[#ef4444]">-$42,000 realised loss</span>
             </div>
             <div className="flex justify-between items-center pt-2">
               <span className="font-black text-gray-900 uppercase">Total compounding leakage</span>
               <span className="font-black text-2xl text-[#ef4444]">-$106,000</span>
             </div>
          </div>
        </div>

        {/* Section 2: Command Center Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-black border-l-4 border-black pl-4 mb-6 uppercase tracking-wider">2. Action Priority Matrix</h2>
          <div className="grid grid-cols-2 gap-4">
             {/* Redesign */}
             <div className="border-2 border-[#ef4444] p-5">
               <h3 className="font-black text-[#ef4444] text-lg uppercase mb-2">ACT NOW (Redesign)</h3>
               <ul className="list-disc pl-5 text-sm font-semibold text-gray-800 space-y-2">
                 <li>Over-Engineered Work (Engineering) - <span className="text-[#ef4444]">$148k</span></li>
                 <li>High Time/Low Value (Operations) - <span className="text-[#ef4444]">$120k</span></li>
               </ul>
             </div>
             {/* Reallocate */}
             <div className="border-2 border-[#10b981] p-5">
               <h3 className="font-black text-[#10b981] text-lg uppercase mb-2">ACT NOW (Reallocate)</h3>
               <ul className="list-disc pl-5 text-sm font-semibold text-gray-800 space-y-2">
                 <li>Senior Developers (+ $210k potential)</li>
                 <li>Product Managers (+ $185k potential)</li>
               </ul>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-12 left-12 right-12 border-t-2 border-gray-200 pt-6 flex justify-between text-xs font-bold text-gray-400">
          <span>WORKable Intelligence Platform</span>
          <span>Page 1 of 4</span>
        </div>

      </div>
    </div>
  );
};

export default ActionPlanPDF;
