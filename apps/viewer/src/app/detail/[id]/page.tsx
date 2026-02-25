"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Copy, Download, Terminal, User, ArrowLeft, Code2, Cpu } from "lucide-react";

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [mode, setMode] = useState<'visual' | 'code'>('visual');

  useEffect(() => {
    if (!params.id) return;
    const unsub = onSnapshot(doc(db, "scrape_requests", params.id as string), (doc) => {
      if (doc.exists()) {
        const res = doc.data().result;
        setData({ ...doc.data(), parsed: res ? JSON.parse(res) : null });
      }
    });
    return () => unsub();
  }, [params.id]);

  if (!data) return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-[10px] text-white tracking-[1em] animate-pulse">DECRYPTING_VAULT...</div>;

  // Format Output JS Nyata
  const rawJsContent = `/**\n * AUTHOR: KallBaikhati Jl.Amba\n * TARGET: ${data.url}\n * STATUS: SUCCESS_DECRYPTED\n */\n\nconst SCRAPE_DATA = ${JSON.stringify(data.parsed, null, 2)};\n\nmodule.exports = SCRAPE_DATA;`;

  const handleCopy = () => { navigator.clipboard.writeText(rawJsContent); alert("CODE_COPIED_TO_CLIPBOARD"); };
  const handleDownload = () => {
    const blob = new Blob([rawJsContent], { type: 'text/javascript' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${data.fileName || 'result'}.js`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-blue-600/30 overflow-x-hidden">
      <div className="max-w-6xl mx-auto p-6 lg:p-12 space-y-10">
        
        {/* Navigasi Simpel */}
        <div className="flex justify-between items-center border-b border-white/5 pb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition">
            <ArrowLeft size={14} /> Back_To_Vault
          </button>
          <div className="flex gap-2">
            <button onClick={() => setMode('visual')} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition ${mode === 'visual' ? 'bg-blue-600 text-white' : 'bg-[#0a0a0a] text-slate-500 border border-white/5'}`}>Visual_View</button>
            <button onClick={() => setMode('code')} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition ${mode === 'code' ? 'bg-blue-600 text-white' : 'bg-[#0a0a0a] text-slate-500 border border-white/5'}`}>Code_Raw</button>
          </div>
        </div>

        {/* Identity Section */}
        <header className="space-y-4">
          <div className="flex items-center gap-3 text-blue-500">
            <Cpu size={16} />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Decrypted_Result: {data.name}</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">{data.fileName || 'Analyzing'}.js</h1>
          <p className="text-[10px] font-mono text-slate-600 truncate">{data.url}</p>
        </header>

        {/* Main Content (Kotak Tajam) */}
        <div className="bg-[#0a0a0a] border border-white/5 min-h-[500px] relative overflow-hidden">
          {mode === 'visual' ? (
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.parsed?.items?.map((item: any, i: number) => (
                  <div key={i} className="bg-[#050505] border border-white/5 p-4 space-y-4 group hover:border-blue-600/50 transition duration-500">
                    <div className="aspect-video bg-black overflow-hidden relative border border-white/5">
                      {/* Cek jika image valid (bukan placeholder svg) */}
                      {item.img && !item.img.includes('svg') ? (
                        <img src={item.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Result" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-slate-800 uppercase tracking-widest">Image_Not_Loaded</div>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-tight line-clamp-2">{item.title}</h3>
                    <a href={item.link} target="_blank" className="text-[9px] text-blue-500 font-mono hover:underline truncate block">{item.link}</a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button onClick={handleCopy} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"><Copy size={14}/></button>
                <button onClick={handleDownload} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"><Download size={14}/></button>
              </div>
              <pre className="p-8 text-[11px] font-mono text-blue-300 leading-relaxed overflow-x-auto max-h-[700px] custom-scrollbar">
                <code>{rawJsContent}</code>
              </pre>
            </div>
          )}
        </div>

        <footer className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-[9px] font-mono uppercase tracking-[0.4em] text-slate-800">
          <span>XY-SYSTEM_RECON // INTERNAL_ACCESS</span>
          <span>© 2026 // PoweredBy KallBaikhati Jl.Amba</span>
        </footer>
      </div>
    </main>
  );
}