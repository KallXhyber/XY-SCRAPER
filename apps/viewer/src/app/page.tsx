"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { Search, Code2, Clock, ExternalLink, Terminal } from "lucide-react";
import Link from "next/link";

export default function ViewerPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, "scrape_requests"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const filtered = requests.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header & Search ala CodeLabs */}
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-xl font-black tracking-[0.3em] uppercase text-white">XY-VIEWER</h1>
          
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-3.5 text-slate-600 w-5 h-5" />
            <input 
              className="w-full bg-[#0d0d0d] border border-white/5 rounded-full pl-12 pr-6 py-3.5 text-sm focus:border-white/20 outline-none transition-all placeholder:text-slate-700 shadow-2xl"
              placeholder="Search scraper results or identity..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {['All', 'Pending', 'Completed', 'Failed'].map((tab) => (
              <button key={tab} className="px-4 py-1.5 rounded-full bg-[#121212] border border-white/5 text-[10px] text-slate-500 hover:text-white transition uppercase font-bold tracking-widest">
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Cards ala Screenshot 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Link key={item.id} href={`/detail/${item.id}`}>
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-[#0d0d0d] border border-white/5 rounded-md p-6 space-y-4 cursor-pointer hover:border-white/20 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-white/5 rounded-md group-hover:bg-white/10 transition">
                    <Code2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter ${item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-400'}`}>
                    {item.status}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-200 truncate">{item.name || "Untitled Request"}</h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                    <ExternalLink size={10} /> {item.url}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                  <span className="flex items-center gap-1"><Clock size={12}/> {item.createdAt?.toDate().toLocaleDateString()}</span>
                  <span className="text-white/20 group-hover:text-white transition">VIEW_CODE _</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}