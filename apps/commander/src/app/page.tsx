"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, MessageSquare, Terminal, HelpCircle } from "lucide-react";

export default function CommanderPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", desc: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "scrape_requests"), {
        ...form, status: "pending", createdAt: serverTimestamp(),
      });
      // Trigger GitHub Action (Ganti URL & Token sesuai spek sebelumnya)
      await fetch(`https://api.github.com/repos/KallXhyber/XY-SCRAPER/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({ event_type: 'trigger_scraper' })
      });
      setSuccess(true);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-slate-300 flex items-center justify-center p-6 overflow-hidden">
      {/* Tutorial Bubble Melayang */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-10 right-10 z-50 max-w-[250px]"
      >
        <div className="bg-blue-600 p-4 rounded-none shadow-2xl relative">
          <p className="text-[10px] font-black uppercase text-white leading-tight">
            <HelpCircle size={12} className="inline mr-1 mb-0.5"/> 
            Tutorial: Masukkan URL target, klik Deploy, dan pantau hasil di Vault. Gunakan PAT GitHub agar instan!
          </p>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-blue-600 rotate-45" />
        </div>
      </motion.div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6 self-center">
          <h1 className="text-6xl font-black text-white tracking-tighter">XY<span className="text-blue-600">.</span>CMD</h1>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Pusat Komando Scraping Dewa</p>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <span className="text-[9px] font-bold text-green-500 uppercase">System Online</span>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 p-8 relative shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Operator</label>
              <input required className="w-full bg-[#0d0d0d] border border-white/10 rounded-none p-3 text-xs focus:border-blue-600 outline-none text-white" placeholder="NAMA_LU" onChange={(e) => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">URL Target</label>
              <input required type="url" className="w-full bg-[#0d0d0d] border border-white/10 rounded-none p-3 text-xs focus:border-blue-600 outline-none text-white" placeholder="https://..." onChange={(e) => setForm({...form, url: e.target.value})} />
            </div>
            <button disabled={loading} className="w-full bg-white text-black py-4 font-black uppercase tracking-[0.4em] text-[10px] hover:bg-blue-600 hover:text-white transition">
              {loading ? "INJECTING..." : "DEPLOY PAYLOAD"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}