"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Info, Paperclip, CheckCircle2 } from "lucide-react";

export default function CommanderPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", desc: "" });

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Membersihkan nama untuk jadi nama file nanti
      const fileName = form.url.replace(/^https?:\/\//, '').split('/')[0].replace(/\./g, '_');
      await addDoc(collection(db, "scrape_requests"), {
        ...form,
        fileName: fileName,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen skeleton" />;

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-[0.3em] text-white uppercase">XY-COMMANDER</h1>
          <div className="flex justify-center gap-8 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
            <span className="cursor-pointer hover:text-white transition">Home</span>
            <span className="cursor-pointer hover:text-white transition">Support</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-sm p-5 flex gap-4">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-wider">
                  <p className="font-bold text-blue-400 mb-1">Protocol Guide</p>
                  <p>• Masukkan URL target dan instruksi scraping secara detail.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 text-[12px]">
                <div className="space-y-3">
                  <label className="text-slate-400 font-bold uppercase tracking-widest block ml-1">Identity <span className="text-red-500">*</span></label>
                  <input required 
                    className="w-full bg-transparent border-b border-white/10 py-3 focus:border-white outline-none transition text-slate-200 placeholder:text-slate-800"
                    placeholder="Input your name..."
                    onChange={(e) => setForm({...form, name: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-slate-400 font-bold uppercase tracking-widest block ml-1">Target URL <span className="text-red-500">*</span></label>
                  <input required type="url"
                    className="w-full bg-transparent border-b border-white/10 py-3 focus:border-white outline-none transition text-slate-200 placeholder:text-slate-800"
                    placeholder="https://..."
                    onChange={(e) => setForm({...form, url: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-slate-400 font-bold uppercase tracking-widest block ml-1">Scrape Instructions <span className="text-red-500">*</span></label>
                  <textarea required rows={4}
                    className="w-full bg-transparent border border-white/10 rounded-sm px-4 py-3 focus:border-white outline-none transition text-slate-200 resize-none placeholder:text-slate-800"
                    placeholder="Specify elements to capture..."
                    onChange={(e) => setForm({...form, desc: e.target.value})}
                  />
                </div>

                <div className="pt-4">
                  <button disabled={loading} className="w-full bg-white text-black py-4 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 transition">
                    {loading ? "PROCESSING..." : "EXECUTE COMMAND"}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-20 space-y-8">
              <CheckCircle2 className="w-16 h-16 text-white mx-auto opacity-20" />
              <div className="space-y-4">
                <h2 className="text-lg font-bold tracking-[0.3em] uppercase">Status: Success</h2>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                   <button onClick={() => setSuccess(false)} className="w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest">New Request</button>
                   <button onClick={() => window.location.href='http://localhost:3001'} className="w-full py-3 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">Open Viewer</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <footer className="text-center text-[9px] text-slate-700 font-mono tracking-[0.4em] uppercase">PoweredBy Kall & XyTeam</footer>
      </div>
    </main>
  );
}