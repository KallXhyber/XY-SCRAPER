"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Copy, Terminal, Globe, Braces, Link2, Shield, Zap } from "lucide-react";

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'api' | 'json' | 'headers'>('api');

  useEffect(() => {
    if (!params.id) return;
    const unsub = onSnapshot(doc(db, "scrape_requests", params.id as string), (doc) => {
      if (doc.exists()) {
        const rawResult = doc.data().result;
        setData({ 
          ...doc.data(), 
          parsedResult: rawResult ? JSON.parse(rawResult) : null 
        });
      }
    });
    return () => unsub();
  }, [params.id]);

  if (!data) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono text-xs tracking-[0.5em] animate-pulse">INITIATING_VAULT_DECRYPTION...</div>;

  const result = data.parsedResult;
  const fileName = data.fileName || "unknown_source";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Payload copied to clipboard!");
  };

  return (
    <main className="min-h-screen bg-black text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Header Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition">
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition" /> Back to Terminal
          </button>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'completed' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{data.status}</span>
            </div>
            <button onClick={() => window.location.href='http://localhost:3000'} className="bg-white text-black px-4 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition">Execute New</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8 lg:p-12 space-y-12">
        {/* Identity Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-500">
            <Shield size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scrape Identity: {data.name}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">{fileName}.js</h1>
          <div className="flex items-center gap-2 text-slate-600 font-mono text-xs">
            <Link2 size={14} />
            <a href={data.url} target="_blank" className="hover:text-blue-400 transition truncate">{data.url}</a>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar: Endpoints List */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-sm overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Globe size={12}/> Network Traffic</span>
                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">{result?.intercepted?.api_endpoints?.length || 0}</span>
              </div>
              <div className="p-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                {result?.intercepted?.api_endpoints?.length > 0 ? (
                  result.intercepted.api_endpoints.map((api: any, i: number) => (
                    <div key={i} className="p-3 hover:bg-white/[0.03] rounded-sm transition group cursor-pointer border border-transparent hover:border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black text-blue-500 uppercase">{api.method || 'GET'}</span>
                        <span className={`text-[8px] font-bold ${api.status < 400 ? 'text-green-500' : 'text-red-500'}`}>{api.status}</span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 break-all leading-relaxed">{api.url}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-[10px] text-slate-700 font-mono uppercase tracking-widest">No Traffic Captured</div>
                )}
              </div>
            </div>
          </div>

          {/* Main View: JSON Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-sm overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Braces size={12}/> Intercepted_Payload.json
                </span>
                <button onClick={() => copyToClipboard(JSON.stringify(result?.intercepted?.data_responses, null, 2))} className="p-1.5 hover:bg-white/10 rounded-sm text-slate-500 transition">
                  <Copy size={14}/>
                </button>
              </div>
              
              <div className="flex-grow p-8 bg-black/40 overflow-auto max-h-[600px] custom-scrollbar">
                {result?.intercepted?.data_responses ? (
                  <pre className="font-mono text-[11px] md:text-[12px] leading-relaxed text-blue-300/80">
                    <code>{JSON.stringify(result.intercepted.data_responses, null, 2)}</code>
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                    <Zap size={40} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Data Injection</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        <footer className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-[9px] font-mono uppercase tracking-[0.3em] text-slate-700">
          <span>XY-VIEWER SYSTEM // INTERNAL USE ONLY</span>
          <span>PoweredBy Kall & XyTeam // © 2026</span>
        </footer>
      </div>
    </main>
  );
}