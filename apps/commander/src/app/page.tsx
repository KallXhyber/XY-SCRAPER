"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Info, CheckCircle2, Zap } from "lucide-react";

export default function CommanderPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", desc: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Kirim Data ke Firebase
      await addDoc(collection(db, "scrape_requests"), {
        ...form,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // 2. Instant Trigger GitHub Action
      // Pastikan NEXT_PUBLIC_GITHUB_TOKEN ada di .env.local
      await fetch(`https://api.github.com/repos/KallXhyber/XY-SCRAPER//dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({ event_type: 'trigger_scraper' })
      });

      setSuccess(true);
    } catch (error) {
      console.error("Critical Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-16 px-4 bg-black">
      <div className="max-w-xl mx-auto space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-[0.5em] text-white">XYScrape</h1>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Deep Reconnaissance System v2.0</p>
        </header>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em]">Target Identity</label>
                <input required 
                  className="w-full bg-transparent border-b border-white/10 py-4 focus:border-blue-500 outline-none transition text-white placeholder:text-slate-800"
                  placeholder="OPERATOR_NAME"
                  onChange={(e) => setForm({...form, name: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em]">Endpoint URL</label>
                <input required type="url"
                  className="w-full bg-transparent border-b border-white/10 py-4 focus:border-blue-500 outline-none transition text-white placeholder:text-slate-800"
                  placeholder="HTTPS://TARGET-SOURCE.COM"
                  onChange={(e) => setForm({...form, url: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em]">Mission Parameters</label>
                <textarea required rows={3}
                  className="w-full bg-transparent border border-white/5 p-4 focus:border-blue-500 outline-none transition text-white placeholder:text-slate-800 resize-none text-xs"
                  placeholder="SPECIFY_DATA_TO_EXTRACT..."
                  onChange={(e) => setForm({...form, desc: e.target.value})}
                />
              </div>

              <button disabled={loading} className="w-full bg-white text-black py-5 font-black uppercase tracking-[0.4em] text-xs hover:bg-blue-500 hover:text-white transition group">
                {loading ? "INJECTING_PAYLOAD..." : <span className="flex items-center justify-center gap-2">Send <Zap size={14} className="fill-current"/></span>}
              </button>
            </motion.form>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-6">
              <CheckCircle2 className="w-16 h-16 text-blue-500 mx-auto" />
              <h2 className="text-xl font-bold uppercase tracking-widest">Signal Sent</h2>
              <div className="flex gap-4">
                <button onClick={() => setSuccess(false)} className="flex-1 py-3 bg-white text-black text-[10px] font-black uppercase">New Mission</button>
                <button onClick={() => window.location.href='http://localhost:3001'} className="flex-1 py-3 border border-white/10 text-[10px] font-black uppercase">Open Vault</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <footer className="text-center text-[9px] text-slate-800 font-mono tracking-[0.5em] uppercase">PoweredBy Kall & XyTeam</footer>
      </div>
    </main>
  );
}