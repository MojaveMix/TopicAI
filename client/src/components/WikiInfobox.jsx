import React from 'react';
import { BookOpen, Tag, CheckCircle2, Bookmark, ExternalLink } from 'lucide-react';

export default function WikiInfobox({ infoboxData, title }) {
  if (!infoboxData || infoboxData.length === 0) return null;

  return (
    <div className="w-full lg:w-80 shrink-0 bg-[#0c1322] border border-slate-700/80 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Top Banner */}
      <div className="text-center pb-3 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono uppercase font-bold mb-2">
          <BookOpen className="w-3 h-3 text-cyan-400" />
          <span>Quick Infobox</span>
        </div>
        <h3 className="text-sm font-bold text-slate-100 line-clamp-2">{title}</h3>
      </div>

      {/* Facts Table */}
      <div className="space-y-2 text-xs">
        {infoboxData.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-3 p-2 rounded-xl bg-[#090d16]/70 border border-slate-800/80"
          >
            <span className="text-slate-400 font-medium shrink-0 max-w-[90px] truncate">
              {item.key}
            </span>
            <span className="text-slate-200 font-mono text-right text-[11px] break-words">
              {item.val}
            </span>
          </div>
        ))}
      </div>

      {/* Wikipedia Style Note */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>Encyclopedia Schema</span>
        <span className="text-cyan-400 font-semibold">Structured Data</span>
      </div>
    </div>
  );
}
