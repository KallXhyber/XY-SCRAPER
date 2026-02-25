"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ChevronLeft, Globe, Braces, Shield, Zap, Terminal } from "lucide-react";

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "scrape_requests", params.id as string), (doc) => {
      if (doc.exists()) {
        const raw = doc.data().result;
        setData({ ...doc.data(), parsed: raw ? JSON.parse(raw) : null });
      }
    });
    return () => unsub();
  }, [params.id]);

  if (!data) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-white text-[10px] tracking-[1em]">DECRYPTING...</div>;

  const recon = data.parsed;

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        <nav className="flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition">
            <ChevronLeft size={14} /> Back to List
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${data.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
            <span className="text-[10px] font-black uppercase">{data.status}</span>
          </div>
        </nav>

        <header className="space-y-4">
          <div className="flex items-center gap-2 text-blue-500">
             <Shield size={16}/> <span className="text-[10px] font-black uppercase tracking-widest">Agent: {data.name}</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase">{data.fileName || "analyzing"}.js</h1>
          <p className="text-xs font-mono text-slate-500 break-all">{data.url}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 bg-black border border-white/5 rounded-sm p-6 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-blue-400">
              <Globe size={14}/> Network Intercepts
            </h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {recon?.endpoints?.map((e: any, i: number) => (
                <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-sm">
                  <p className="text-[9px] text-blue-500 font-bold mb-1">API_CALL</p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{e.url}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-black border border-white/5 rounded-sm overflow-hidden">
            <div className="bg-white/[0.03] px-6 py-3 border-b border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Braces size={14}/> Payload_Output
              </span>
              <Terminal size={14} className="text-slate-700"/>
            </div>
            <pre className="p-6 text-[12px] font-mono text-indigo-300 leading-relaxed overflow-x-auto max-h-[600px] custom-scrollbar">
              <code>{JSON.stringify(recon || "Awaiting Signal...", null, 2)}</code>
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}