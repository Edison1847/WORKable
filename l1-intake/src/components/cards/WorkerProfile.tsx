import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight, GraduationCap, Briefcase, Clock, MapPin } from 'lucide-react';

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

export default function WorkerProfile({ data, onNext }: { data: any, onNext: (data: any) => void }) {
  const companySetup = data?.company_setup || {};
  const roles = companySetup.roles || [];
  const employees = companySetup.employees || [];

  const [formData, setFormData] = useState({
    roleTitle: '',
    department: '',
    directManager: '',
    employmentType: 'Full-time',
    experienceYears: '',
    experienceInRole: '',
    qualification: '',
    fieldOfStudy: '',
    skills: {},
    location: 'Remote',
    workingHours: '8',
    meetingsPerWeek: '5'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ worker_profile: formData });
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden"
    >
      <div className="flex items-center space-x-4 mb-8 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
          <User size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-display font-semibold text-textMain">Worker Profile</h2>
          <p className="text-textMuted text-sm mt-1">Personal Context & Experience Onboarding</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5 flex items-center gap-2">
               <Briefcase size={14} className="text-accent" /> Role Title
            </label>
            <select 
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
              value={formData.roleTitle}
              onChange={e => setFormData({ ...formData, roleTitle: e.target.value })}
            >
              <option value="">Select your role</option>
              {roles.map((r: any) => <option key={r.id} value={r.title}>{r.title} ({r.grade})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Department</label>
            <select 
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="">Select department</option>
              {(companySetup.company?.departments || []).map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Direct Manager</label>
            <select 
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
              value={formData.directManager}
              onChange={e => setFormData({ ...formData, directManager: e.target.value })}
            >
              <option value="">Select your manager</option>
              {formData.roleTitle !== 'CEO' && employees.map((emp: any) => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
              {formData.roleTitle === 'CEO' && <option value="None">None (CEO)</option>}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Employment Type</label>
            <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" value={formData.employmentType} onChange={e => setFormData({...formData, employmentType: e.target.value})}>
               <option>Full-time</option><option>Contract</option><option>Part-time</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Total Experience (Years)</label>
            <input type="number" required placeholder="e.g. 8" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: e.target.value})} />
          </div>
           <div>
            <label className="block text-sm font-medium text-textMain mb-1.5 flex items-center gap-2">
               <GraduationCap size={14} className="text-accent" /> Qualification
            </label>
            <input type="text" placeholder="Highest Relevant Qualification" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
           <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1.5"><MapPin size={10} /> Location</label>
              <select className="w-full bg-gray-50 border-none rounded-xl px-3 py-2.5 text-xs font-semibold" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                 <option>Remote</option><option>Hybrid</option><option>Office-based</option>
              </select>
           </div>
           <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1.5"><Clock size={10} /> Typical Hours/Day</label>
              <input type="number" className="w-full bg-gray-50 border-none rounded-xl px-3 py-2.5 text-xs" value={formData.workingHours} onChange={e => setFormData({...formData, workingHours: e.target.value})} />
           </div>
           <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1.5">Meetings/Week</label>
              <input type="number" className="w-full bg-gray-50 border-none rounded-xl px-3 py-2.5 text-xs" value={formData.meetingsPerWeek} onChange={e => setFormData({...formData, meetingsPerWeek: e.target.value})} />
           </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="group w-full flex items-center justify-center space-x-2 bg-textMain text-white px-8 py-4 rounded-2xl hover:bg-black transition-all shadow-lg"
          >
            <span className="font-semibold">Professional Context Setup</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
