import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Database, ArrowRight, Sparkles, Download, RefreshCw, Settings } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [isDrawerHovered, setIsDrawerHovered] = useState(false);

  const handleRefreshDb = async () => {
    if (!confirm('Are you sure you want to clear the entire database? This will reset all company settings and diagnostics.')) return;
    try {
      const res = await fetch('http://localhost:3000/api/refresh', { method: 'POST' });
      if (res.ok) {
        localStorage.removeItem('workable_l1_data');
        alert('System reset successfully.');
      }
    } catch (err) {
      alert('Failed to clear database.');
    }
  };

  const handleRestoreLatest = async () => {
    if (!confirm('Warning: This will overwrite ALL current data with the latest snapshot. Proceed?')) return;
    try {
      const res = await fetch('http://localhost:3000/api/restore', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
      } else {
        alert(data.error || 'Restore failed.');
      }
    } catch (err) {
      alert('Failed to connect to restore service.');
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/backup');
      const data = await res.json();
      if (res.ok) {
        alert(`Strategic Snapshot successful!\nArchive created: ${data.filename}\nLocation: server/backups/`);
      } else {
        alert(`Vault Error: ${data.error || 'Unknown failure'}`);
      }
    } catch (err) {
      alert('Network Error: Could not connect to Strategic Vault.');
    }
  };

  const handleInitDb = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/init-db', { method: 'POST' });
      if (res.ok) alert('Database tables initialized successfully.');
    } catch (err) {
      alert('Failed to initialize database. Ensure SQLite environment is stable.');
    }
  };

  const handleLaunchAnalytics = () => {
    window.location.href = 'http://localhost:5173';
  };

  const handlePurgeAIData = async () => {
    if (!confirm('Are you sure you want to permanently delete all AI-generated employees and diagnostic records?')) return;
    try {
      const res = await fetch('http://localhost:3000/api/purge-ai-data', { method: 'DELETE' });
      if (res.ok) alert('Synthetic workforce purged successfully.');
    } catch (err) {
      alert('Failed to purge AI data.');
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col p-8 font-sans antialiased text-textMain">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none" />

      {/* TOP: Brand Header */}
      <header className="relative z-50">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(129,140,248,0.15))', border: '1px solid rgba(56,189,248,0.2)' }}>
                <Activity size={20} style={{ color: '#007aff' }} />
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,122,255,0.4), transparent)' }} />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold tracking-tighter text-textMain leading-none">
                  <span style={{ color: '#007aff' }}>WORK</span>able
                </span>
                <span className="text-[9px] font-black text-textMuted uppercase tracking-[0.3em] mt-1.5 opacity-60">Enterprise Diagnostic Intel Node</span>
              </div>
          </div>
      </header>

      {/* CENTER: Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full mb-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-50/50 text-accent font-bold text-[9px] tracking-[0.2em] uppercase border border-blue-100 shadow-sm">
            Platform Protocol v5.1
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-textMain leading-[0.9] mb-10 tracking-tighter">
            Intelligence starts <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">
              at the source.
            </span>
          </h1>
          <p className="text-lg text-textMuted mb-12 font-sans max-w-lg mx-auto leading-relaxed font-medium opacity-70">
            Capturing organizational ground-truth through high-fidelity diagnostic probes. Turning workforce experience into operational alpha.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/intake')}
            className="group relative inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-full bg-accent text-white font-bold text-lg overflow-hidden shadow-[0_12px_30px_rgba(0,122,255,0.15)] hover:shadow-[0_15px_35px_rgba(0,122,255,0.25)] transition-all cursor-pointer"
          >
            <span className="relative z-10">Initiate Local Audit</span>
            <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </motion.div>
      </div>

      {/* RIGHT SIDEBAR: Strategic Console (Slide-out) */}
      <div 
        className="fixed top-0 right-0 h-full z-[100] flex items-center transition-all"
        onMouseEnter={() => setIsDrawerHovered(true)}
        onMouseLeave={() => setIsDrawerHovered(false)}
        style={{ width: isDrawerHovered ? '280px' : '40px' }}
      >
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full transition-all duration-500 ${isDrawerHovered ? 'opacity-0' : 'bg-accent/30'}`} />
        
        <motion.div 
            animate={{ x: isDrawerHovered ? 0 : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full h-[95%] bg-white/70 backdrop-blur-3xl border-l border-white/40 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] rounded-l-[32px] flex flex-col p-8 overflow-hidden"
        >
            <div className="mb-10 flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-3">
                    <Settings size={18} />
                </div>
                <h3 className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">System Console</h3>
            </div>

            <div className="flex-1 space-y-6">
                <div>
                    <p className="text-[9px] font-bold text-textMuted uppercase tracking-widest mb-4 ml-1 opacity-50">Intelligence Core</p>
                    <div className="space-y-1.5">
                        <button onClick={() => navigate('/hub')} 
                            className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-100/50 bg-emerald-50/30 hover:bg-emerald-50 transition-all text-emerald-800 font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                            <Activity size={14} className="opacity-60" />
                            <span>CEO Hub View</span>
                        </button>
                        <button onClick={handleLaunchAnalytics} 
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-textMain text-white hover:bg-black transition-all font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-md">
                            <Activity size={14} className="opacity-60" />
                            <span>Launch Analytics</span>
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <p className="text-[9px] font-bold text-textMuted uppercase tracking-widest mb-4 ml-1 opacity-50">Data Security</p>
                    <div className="space-y-1.5">
                        <button onClick={handleCreateSnapshot} 
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-100/50 bg-blue-50/20 hover:bg-blue-50 transition-all text-blue-700 font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                            <Download size={14} />
                            <span>Capture Snapshot</span>
                        </button>
                        <button onClick={handleRestoreLatest} 
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-100/50 bg-blue-50/20 hover:bg-blue-50 transition-all text-blue-700 font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                            <RefreshCw size={14} />
                            <span>Restore latest</span>
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <p className="text-[9px] font-bold text-textMuted uppercase tracking-widest mb-4 ml-1 opacity-50">Critical Actions</p>
                    <div className="space-y-1.5">
                        <button onClick={handlePurgeAIData} 
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-orange-100/50 bg-orange-50/20 hover:bg-orange-100 transition-all text-orange-700 font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                            <Database size={14} />
                            <span>Purge Synthetic</span>
                        </button>
                        <button onClick={handleRefreshDb} 
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-100/50 bg-red-50/20 hover:bg-red-100 transition-all text-red-700 font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                            <Database size={14} />
                            <span>Reset Core</span>
                        </button>
                        <button onClick={handleInitDb} 
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/20 hover:bg-gray-100 transition-all text-gray-500 font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                            <Sparkles size={14} className="text-accent" />
                            <span>Init Schema</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center opacity-20">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
        </motion.div>
      </div>

      <footer className="fixed bottom-8 left-8 z-10 transition-opacity duration-500" style={{ opacity: isDrawerHovered ? 0 : 0.4 }}>
          <p className="text-[9px] text-textMuted font-mono uppercase tracking-widest">Protocol v5.1 · Enterprise Intelligence Node</p>
      </footer>
    </div>
  );
}
