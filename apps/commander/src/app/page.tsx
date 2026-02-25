"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Zap, Shield, ChevronRight, CheckCircle2, Cpu } from "lucide-react";

export default function CommanderPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", desc: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "scrape_requests"), {
        ...form,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Trigger GitHub Action Instan
      await fetch(`https://api.github.com/repos/KallXhyber/XY-SCRAPER/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({ event_type: 'trigger_scraper' })
      });

      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-slate-300 flex items-center justify-center p-6 selection:bg-blue-500/30">
      {/* Hiasan Bubble Terminal di Samping (Desktop Only) */}
      <div className="fixed left-10 bottom-10 hidden lg:block space-y-3 opacity-30 pointer-events-none">
        <div className="bg-[#0a0a0a] border border-white/5 p-3 rounded-sm font-mono text-[9px] text-blue-400">
          <p className="animate-pulse">{`> INITIALIZING_RECON...`}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/5 p-3 rounded-sm font-mono text-[9px] text-green-400">
          <p>{`> SYSTEM_READY: 127.0.0.1`}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/5 p-3 rounded-sm font-mono text-[9px] text-slate-500">
          <p>{`> ENCRYPTION_STRENGTH: 256-BIT`}</p>
        </div>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Branding */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-sm text-blue-400 text-[9px] font-black uppercase tracking-[0.2em]">
            <Shield size={12}/> Secure Uplink Established
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
            XY<span className="text-blue-500">.</span>COMMANDER
          </h1>
          <p className="text-xs text-slate-500 font-mono leading-relaxed max-w-sm">
            Deploy advanced reconnaissance payloads to any endpoint with stealth-optimized interception. 
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="h-[1px] w-12 bg-white/10" />
            <span className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.4em]">PoweredBy Kall & XyTeam</span>
          </div>
        </div>

        {/* Right Side: Form Kotak */}
        <div className="bg-[#0a0a0a] border border-white/5 p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <Cpu size={80} />
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit} 
                className="space-y-6 relative z-10"
              >
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Operator_ID</label>
                  <input required 
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-none px-4 py-3 text-xs focus:border-blue-500 focus:outline-none transition placeholder:text-slate-800"
                    placeholder="Enter Identity..."
                    onChange={(e) => setForm({...form, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target_URL</label>
                  <input required type="url"
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-none px-4 py-3 text-xs focus:border-blue-500 focus:outline-none transition placeholder:text-slate-800"
                    placeholder="https://target-source.net"
                    onChange={(e) => setForm({...form, url: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Extraction_Parameters</label>
                  <textarea required rows={3}
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-none px-4 py-3 text-xs focus:border-blue-500 focus:outline-none transition placeholder:text-slate-800 resize-none"
                    placeholder="Define elements (API, Keys, etc)..."
                    onChange={(e) => setForm({...form, desc: e.target.value})}
                  />
                </div>

                <button 
                  disabled={loading} 
                  className="w-full bg-white text-black py-4 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-blue-500 hover:text-white transition flex items-center justify-center gap-3"
                >
                  {loading ? "INITIALIZING..." : <><Zap size={14} className="fill-current"/> Deploy Payload</>}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-center py-10 space-y-6"
              >
                <CheckCircle2 size={48} className="text-blue-500 mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">Payload Injected</h3>
                  <p className="text-[10px] text-slate-500 font-mono italic">Signal has been intercepted by GitHub Action.</p>
                </div>
                <div className="space-y-2">
                   <button onClick={() => setSuccess(false)} className="w-full bg-white text-black py-3 text-[9px] font-black uppercase tracking-widest">New Session</button>
                   <button onClick={() => window.location.href='http://localhost:3001'} className="w-full border border-white/10 text-white py-3 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition">Open Viewer</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none -z-10" />
    </main>
  );
}