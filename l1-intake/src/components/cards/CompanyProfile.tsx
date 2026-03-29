import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ArrowRight, ArrowLeft, Users, Wallet, GitBranch, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const cardVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export default function CompanyProfile({ onNext, initialData }: { onNext: (data: any) => void, initialData?: any }) {
  const [activeSubStep, setActiveSubStep] = useState(0);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [showHierarchy, setShowHierarchy] = useState(false);
  
  const defaultFormData = {
    company: {
      name: '',
      industry: '',
      headcount: '',
      currency: 'USD',
      financialYear: 'Jan-Dec'
    },
    financials: {
      revenueTarget: '',
      totalSalaryBudget: '',
    },
    departments: [
      { id: 'd1', name: 'Operations', roles: [{ id: 'r1', title: 'CEO', grade: 'L10', minSalary: '200000', maxSalary: '300000' }] },
      { id: 'd2', name: 'Engineering', roles: [] },
      { id: 'd3', name: 'Sales', roles: [] },
      { id: 'd4', name: 'Marketing', roles: [] },
      { id: 'd5', name: 'HR', roles: [] }
    ],
    employees: [
      { id: 'e1', name: 'Alice Smith', role: 'CEO', manager: 'None', departmentId: 'd1' }
    ]
  };

  // Use initialData if available (it will be ready since IntakeFlow waits for isLoading)
  const [formData, setFormData] = useState(
    initialData && Object.keys(initialData).length > 0 ? initialData : defaultFormData
  );

  // Also listen for late prop changes (e.g. when navigating between steps)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);

  const saveToBackend = (data: any) => {
    fetch('http://localhost:3000/api/company-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };

  const nextSubStep = () => {
    saveToBackend(formData);
    setActiveSubStep(s => s + 1);
  };
  const prevSubStep = () => setActiveSubStep(s => s - 1);

  const addDepartment = () => setFormData({
    ...formData,
    departments: [...formData.departments, { id: Date.now().toString() + Math.random().toString(36).substring(2, 6), name: '', roles: [] }]
  });

  const removeDepartment = (id: string) => setFormData({
    ...formData,
    departments: formData.departments.filter(d => d.id !== id)
  });

  const addRole = (deptId: string) => {
    const newDepts = formData.departments.map(d => {
      if (d.id === deptId) {
        return { ...d, roles: [...d.roles, { id: Date.now().toString() + Math.random().toString(36).substring(2, 6), title: '', grade: '', minSalary: '', maxSalary: '' }] };
      }
      return d;
    });
    setFormData({ ...formData, departments: newDepts });
  };

  const removeRole = (deptId: string, roleId: string) => {
    const newDepts = formData.departments.map(d => {
      if (d.id === deptId) {
        return { ...d, roles: d.roles.filter(r => r.id !== roleId) };
      }
      return d;
    });
    setFormData({ ...formData, departments: newDepts });
  };



  const removeEmployee = (id: string) => setFormData({
    ...formData,
    employees: formData.employees.filter(e => e.id !== id)
  });

  const handleSubmit = () => {
    // Persist to backend
    fetch('http://localhost:3000/api/company-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    // Pass raw formData to IntakeFlow - IntakeFlow handles the 'company_setup' nesting
    onNext(formData);
  };

  const handleShowHierarchy = () => {
    saveToBackend(formData);
    setShowHierarchy(true);
  };

  const renderHierarchyNode = (emp: any, level: number = 0) => {
    const directReports = formData.employees.filter((e: any) => e.manager === emp.name);
    return (
      <div key={emp.id} className="flex flex-col items-center mt-2 relative">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: level * 0.15 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white shadow-lg shadow-gray-200/50 z-10 ${level === 0 ? 'border-accent ring-2 ring-accent/10' : 'border-gray-200'}`}
        >
          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold ${level === 0 ? 'bg-accent' : 'bg-gray-800'}`}>
             {emp.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 leading-tight">{emp.name}</div>
            <div className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">{emp.role}</div>
          </div>
        </motion.div>
        
        {directReports.length > 0 && (
          <div className="flex flex-col items-center mt-0 w-full relative">
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="w-full flex justify-center gap-4 relative pt-3 border-t border-gray-300">
              <div className="absolute top-0 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-gray-200 border border-white"></div>
              {directReports.map((report: any) => renderHierarchyNode(report, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };


  return (
    <>
      <AnimatePresence>
         {showHierarchy && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[100] bg-gray-50/95 backdrop-blur-xl flex flex-col p-8 min-h-screen min-w-full"
            >
               <div className="text-center mb-6 pt-10 relative">
                  <div className="absolute top-0 left-0">
                     <button 
                        onClick={() => setShowHierarchy(false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 hover:bg-white text-gray-700 font-bold shadow-sm transition-all"
                     >
                        <ArrowLeft size={18} /> Back to Editing
                     </button>
                  </div>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-4">
                     <CheckCircle2 size={28} />
                  </div>
                  <h2 className="text-4xl font-display font-bold text-gray-900">Setup Complete</h2>
                  <p className="text-gray-500 mt-2 text-lg">Your organizational hierarchy has been mapped and locked.</p>
               </div>
               
               <div className="flex-1 overflow-auto custom-scrollbar flex items-start justify-center pt-8">
                 <div className="min-w-max pb-20">
                   {formData.employees.filter((e: any) => e.manager === 'None' || !e.manager).map((ceo: any) => renderHierarchyNode(ceo, 0))}
                 </div>
               </div>

               <div className="absolute bottom-10 left-0 right-0 flex justify-center z-[110] pointer-events-none">
                  <button 
                     onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
                     className="pointer-events-auto group flex items-center justify-center gap-3 bg-black text-white px-10 py-4 rounded-2xl hover:bg-gray-900 transition-all shadow-2xl hover:scale-105 active:scale-95"
                  >
                     <span className="font-bold text-lg">Proceed to Supervisor Diagnostic</span>
                     <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col flex-1 min-h-0"
    >

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-semibold text-textMain">Company Onboarding</h2>
            <p className="text-textMuted text-sm mt-1">Section 3 Layer 1 — Master Setup</p>
          </div>
        </div>
        <div className="flex space-x-1">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${activeSubStep === i ? 'bg-accent w-12' : 'bg-gray-100'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <AnimatePresence mode="wait">
          {activeSubStep === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">Company Name</label>
                  <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3" value={formData.company.name} onChange={e => setFormData({ ...formData, company: { ...formData.company, name: e.target.value } })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">Industry</label>
                  <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3" value={formData.company.industry} onChange={e => setFormData({ ...formData, company: { ...formData.company, industry: e.target.value } })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">Total Headcount</label>
                  <input type="number" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3" value={formData.company.headcount} onChange={e => setFormData({ ...formData, company: { ...formData.company, headcount: e.target.value } })} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-textMain mb-1.5">Currency</label>
                    <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3" value={formData.company.currency} onChange={e => setFormData({ ...formData, company: { ...formData.company, currency: e.target.value } })}>
                       <option>USD</option><option>GBP</option><option>EUR</option><option>AUD</option><option>SLR</option>
                    </select>
                 </div>
                <div>
                   <label className="block text-sm font-medium text-textMain mb-1.5">FY Cycle</label>
                   <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3" value={formData.company.financialYear} onChange={e => setFormData({ ...formData, company: { ...formData.company, financialYear: e.target.value } })} />
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Description (Optional)</label>
                <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3" placeholder="Brief about the company..." />
              </div>
            </motion.div>
          )}

          {activeSubStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4 text-blue-600">
                    <Wallet size={20} />
                    <h3 className="font-semibold">Financial Targets</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Annual Revenue Target</label>
                      <input type="number" className="w-full bg-white border-blue-200 rounded-xl px-4 py-3 text-blue-900" value={formData.financials.revenueTarget} onChange={e => setFormData({...formData, financials: {...formData.financials, revenueTarget: e.target.value}})} />
                    </div>
                     <div>
                      <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Total Salary Budget</label>
                      <input type="number" className="w-full bg-white border-blue-200 rounded-xl px-4 py-3 text-blue-900" value={formData.financials.totalSalaryBudget} onChange={e => setFormData({...formData, financials: {...formData.financials, totalSalaryBudget: e.target.value}})} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-4 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Revenue per Employee</p>
                    <p className="text-3xl font-display font-bold text-textMain">
                      {formData.company.headcount && formData.financials.revenueTarget ? (Number(formData.financials.revenueTarget) / Number(formData.company.headcount)).toLocaleString() : '0'} 
                      <span className="text-sm font-normal text-gray-400 ml-2">{formData.company.currency}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Salary as % of Revenue</p>
                    <p className="text-3xl font-display font-bold text-textMain">
                      {formData.financials.totalSalaryBudget && formData.financials.revenueTarget ? ((Number(formData.financials.totalSalaryBudget) / Number(formData.financials.revenueTarget)) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

           {activeSubStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-accent">
                    <GitBranch size={20} />
                    <h3 className="font-semibold">Departments & Roles</h3>
                 </div>
                 <button onClick={addDepartment} className="flex items-center gap-2 text-xs font-bold bg-accent text-white px-3 py-1.5 rounded-lg">
                    <Plus size={14} /> Add Department
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {formData.departments.map((dept, deptIdx) => (
                  <div key={dept.id} className="bg-white/50 border border-gray-100 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <input 
                        className="bg-transparent text-lg font-bold text-textMain border-none focus:ring-0 p-0 w-1/2" 
                        value={dept.name} 
                        onChange={e => {
                          const newDepts = [...formData.departments];
                          newDepts[deptIdx].name = e.target.value;
                          setFormData({...formData, departments: newDepts});
                        }}
                        placeholder="Department Name"
                      />
                      <div className="flex items-center gap-4">
                        <button onClick={() => addRole(dept.id)} className="text-accent text-xs font-bold flex items-center gap-1 hover:underline">
                          <Plus size={14} /> Add Role
                        </button>
                        <button onClick={() => removeDepartment(dept.id)} className="text-gray-300 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {dept.roles.map((role, roleIdx) => (
                        <div key={role.id} className="grid grid-cols-12 gap-3 p-3 bg-white border border-gray-50 rounded-xl items-center shadow-sm">
                          <div className="col-span-4">
                            <input 
                              placeholder="Role Title" 
                              className="w-full text-sm font-semibold border-none focus:ring-0 p-0" 
                              value={role.title} 
                              onChange={e => {
                                const newDepts = [...formData.departments];
                                newDepts[deptIdx].roles[roleIdx].title = e.target.value;
                                setFormData({...formData, departments: newDepts});
                              }} 
                            />
                          </div>
                          <div className="col-span-2">
                             <input 
                              placeholder="Grade" 
                              className="w-full text-[10px] text-gray-400 uppercase font-bold border-none focus:ring-0 p-0" 
                              value={role.grade} 
                              onChange={e => {
                                const newDepts = [...formData.departments];
                                newDepts[deptIdx].roles[roleIdx].grade = e.target.value;
                                setFormData({...formData, departments: newDepts});
                              }} 
                            />
                          </div>
                          <div className="col-span-2">
                             <input 
                              placeholder="Min" 
                              type="number" 
                              className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1" 
                              value={role.minSalary} 
                              onChange={e => {
                                const newDepts = [...formData.departments];
                                newDepts[deptIdx].roles[roleIdx].minSalary = e.target.value;
                                setFormData({...formData, departments: newDepts});
                              }} 
                            />
                          </div>
                          <div className="col-span-3">
                             <input 
                              placeholder="Max" 
                              type="number" 
                              className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1" 
                              value={role.maxSalary} 
                              onChange={e => {
                                const newDepts = [...formData.departments];
                                newDepts[deptIdx].roles[roleIdx].maxSalary = e.target.value;
                                setFormData({...formData, departments: newDepts});
                              }} 
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                             <button onClick={() => removeRole(dept.id, role.id)} className="text-gray-300 hover:text-red-500">
                                <Trash2 size={14} />
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

           {activeSubStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-purple-600">
                    <Users size={20} />
                    <h3 className="font-semibold">Direct Report Relationships</h3>
                 </div>
                 <div className="flex items-center gap-3">
                    <select 
                      className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 font-medium text-gray-600"
                      value={selectedDeptId}
                      onChange={e => setSelectedDeptId(e.target.value)}
                    >
                      <option value="">Select Department</option>
                      {formData.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <button 
                      onClick={() => {
                        const newId = Date.now().toString() + Math.random().toString(36).substring(2, 6);
                        setFormData({
                          ...formData,
                          employees: [...formData.employees, { id: newId, name: '', role: '', manager: '', departmentId: selectedDeptId }]
                        });
                      }} 
                      disabled={!selectedDeptId}
                      className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all ${!selectedDeptId ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                    >
                      <Plus size={14} /> Add Employee
                    </button>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {formData.employees
                  .filter(emp => !selectedDeptId || emp.departmentId === selectedDeptId)
                  .map((emp) => {
                    const globalIdx = formData.employees.findIndex(e => e.id === emp.id);
                    const currentDept = formData.departments.find(d => d.id === emp.departmentId);
                    
                    return (
                      <div key={emp.id} className="grid grid-cols-12 gap-3 p-4 bg-white border border-gray-100 rounded-2xl items-center shadow-sm">
                        <div className="col-span-4">
                          <input placeholder="Full Name" className="w-full text-sm font-semibold border-none focus:ring-0 p-0" value={emp.name} onChange={e => {
                            const newEmps = [...formData.employees];
                            newEmps[globalIdx].name = e.target.value;
                            setFormData({...formData, employees: newEmps});
                          }} />
                        </div>
                        <div className="col-span-3">
                           <select className="w-full text-xs border-none focus:ring-0 p-0 text-gray-500" value={emp.role} onChange={e => {
                              const newEmps = [...formData.employees];
                              newEmps[globalIdx].role = e.target.value;
                              setFormData({...formData, employees: newEmps});
                           }}>
                              <option value="">Select Role</option>
                              {currentDept?.roles.map(r => <option key={r.id} value={r.title}>{r.title}</option>)}
                           </select>
                        </div>
                        <div className="col-span-4">
                           <select className="w-full text-xs border-none focus:ring-0 p-0 text-accent font-medium italic" value={emp.manager} onChange={e => {
                              const newEmps = [...formData.employees];
                              newEmps[globalIdx].manager = e.target.value;
                              setFormData({...formData, employees: newEmps});
                           }}>
                              <option value="">Manager</option>
                              <option value="None">None (CEO)</option>
                              {formData.employees.filter(e => e.id !== emp.id).map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                           </select>
                        </div>
                        <div className="col-span-1 flex justify-end">
                           <button onClick={() => removeEmployee(emp.id)} className="text-gray-300 hover:text-red-500">
                              <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                    );
                  })}
                {selectedDeptId && formData.employees.filter(emp => emp.departmentId === selectedDeptId).length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm italic">
                    No employees added to this department yet.
                  </div>
                )}
                {!selectedDeptId && (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    Please select a department to manage relationships.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-10 flex items-center justify-between relative z-10 border-t border-gray-100 pt-6">
        <button
          onClick={prevSubStep}
          disabled={activeSubStep === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${activeSubStep === 0 ? 'opacity-0' : 'text-textMuted hover:bg-gray-50'}`}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {activeSubStep < 3 ? (
          <button
            onClick={nextSubStep}
            className="group flex items-center space-x-2 bg-textMain text-white px-8 py-3 rounded-xl hover:bg-black transition-all shadow-md"
          >
            <span>Continue</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button
            onClick={handleShowHierarchy}
            className="group flex items-center space-x-2 bg-accent text-white px-10 py-3 rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-accent/20"
          >
            <span className="font-bold">Complete Onboarding</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </motion.div>
    </>
  );
}
