"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Terminal, Info, Paperclip, CheckCircle2, MessageSquare, LifeBuoy } from "lucide-react";

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
      await addDoc(collection(db, "scrape_requests"), {
        ...form,
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
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-[0.2em] text-white uppercase">XY-COMMANDER</h1>
          <div className="flex justify-center gap-8 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
            <span className="cursor-not-allowed opacity-50 flex items-center gap-1"><LifeBuoy size={12}/> Support</span>
            <span className="cursor-not-allowed opacity-50 flex items-center gap-1"><MessageSquare size={12}/> Feedback</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Alert Guide */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-sm p-5 flex gap-4">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  <p className="font-bold text-blue-400 mb-1 tracking-wider uppercase">Protocol Guide</p>
                  <p>• Lengkapi form identitas dan target URL secara valid.</p>
                  <p>• Deskripsi harus mencakup elemen spesifik yang ingin di-scrap.</p>
                  <p>• Screenshot bersifat opsional untuk membantu visualisasi.</p>
                </div>
              </div>

              {/* Form Container */}
              <div className="bg-[#0d0d0d] border border-white/5 rounded-sm shadow-2xl">
                {/* MacOS Dots Toolbar */}
                <div className="flex gap-1.5 px-5 py-4 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 text-[12px]">
                  {/* Field Nama */}
                  <div className="space-y-3">
                    <label className="text-slate-400 font-bold uppercase tracking-widest block ml-1">Nama Anda <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      className="w-full bg-black border border-white/5 rounded-sm px-4 py-3 focus:border-white/20 outline-none transition text-slate-200 placeholder:text-slate-800"
                      placeholder="Input identity..."
                      onChange={(e) => setForm({...form, name: e.target.value})}
                    />
                  </div>

                  {/* Field URL */}
                  <div className="space-y-3">
                    <label className="text-slate-400 font-bold uppercase tracking-widest block ml-1">URL Target <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      type="url"
                      className="w-full bg-black border border-white/5 rounded-sm px-4 py-3 focus:border-white/20 outline-none transition text-slate-200 placeholder:text-slate-800"
                      placeholder="https://target-endpoint.com"
                      onChange={(e) => setForm({...form, url: e.target.value})}
                    />
                  </div>

                  {/* Field Deskripsi */}
                  <div className="space-y-3">
                    <label className="text-slate-400 font-bold uppercase tracking-widest block ml-1">Instruksi Scraping <span className="text-red-500">*</span></label>
                    <textarea 
                      required 
                      rows={5}
                      className="w-full bg-black border border-white/5 rounded-sm px-4 py-3 focus:border-white/20 outline-none transition text-slate-200 resize-none placeholder:text-slate-800"
                      placeholder="Detail elements, attributes, or JSON structure..."
                      onChange={(e) => setForm({...form, desc: e.target.value})}
                    />
                  </div>

                  {/* Field Screenshot (Opsional) */}
                  <div className="space-y-3">
                    <label className="text-slate-400 font-bold uppercase tracking-widest block ml-1">Attachment (Optional)</label>
                    <div className="relative group cursor-pointer">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled />
                      <div className="flex items-center gap-3 bg-black border border-dashed border-white/10 rounded-sm px-4 py-4 text-slate-600 group-hover:border-white/20 transition">
                        <Paperclip size={14} />
                        <span className="font-mono">SELECT_FILE_IMAGE</span>
                        <span className="ml-auto text-[9px] bg-white/5 px-2 py-1 rounded">MAX_5MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      disabled={loading}
                      className="w-full bg-white hover:bg-slate-200 text-black rounded-sm py-4 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? (
                         <div className="flex gap-2">
                            <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                            <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse [animation-delay:-0.5s]" />
                         </div>
                      ) : (
                        <>
                          <Send size={14} strokeWidth={3} />
                          <span>Execute Command</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-24 space-y-6"
            >
              <CheckCircle2 className="w-16 h-16 text-white mx-auto opacity-10" />
              <div className="space-y-2">
                <h2 className="text-lg font-bold tracking-[0.3em] uppercase">Status: Success</h2>
                <p className="text-[10px] text-slate-500 font-mono">Payload has been injected to Firebase Queue.</p>
              </div>
              <button 
                onClick={() => setSuccess(false)}
                className="px-8 py-2 text-[10px] text-white border border-white/10 hover:bg-white hover:text-black transition uppercase font-bold tracking-widest rounded-sm"
              >
                Reset_Console
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="text-center text-[9px] text-slate-700 font-mono pt-12 tracking-[0.4em] uppercase">
          PoweredBy Kall & XyTeam
        </footer>
      </div>
    </main>
  );
}