"use client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Copy, Download, Terminal } from "lucide-react";

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();

  // Dummy Code ala Screenshot 3/4
  const codeString = `const axios = require('axios');
const cheerio = require('cheerio');

async function XY_Scraper(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  
  // Scraped from: ${params.id}
  const results = [];
  $('article').each((i, el) => {
    results.push({
      title: $(el).find('h2').text(),
      link: $(el).find('a').attr('href')
    });
  });

  return results;
}`;

  return (
    <main className="min-h-screen py-16 px-4 md:px-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[11px] text-slate-500 hover:text-white transition uppercase font-bold"
        >
          <ChevronLeft size={14} /> Back to list
        </button>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">detail/result_{params.id?.slice(0, 8)}.js</h2>
          <p className="text-[10px] text-slate-600 font-mono">Generated on: Feb 24, 2026</p>
        </div>

        {/* MacOS Code Window ala Screenshot 3 */}
        <div className="bg-[#0d0d0d] border border-white/5 rounded-md shadow-2xl overflow-hidden">
          <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              <span className="ml-2 text-[10px] font-mono text-slate-500">result.js</span>
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 hover:bg-white/5 rounded text-slate-500 transition"><Copy size={14}/></button>
              <button className="p-1.5 hover:bg-white/5 rounded text-slate-500 transition"><Download size={14}/></button>
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            <pre className="font-mono text-[13px] leading-relaxed text-indigo-300">
              <code>{codeString}</code>
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}