import React from 'react';
import { Atom, History, Sliders } from 'lucide-react';
import AIStatusBadge from './AIStatusBadge.jsx';

export default function Navbar({
  aiStatus,
  onOpenSettings,
  onToggleHistory,
  historyCount,
  isHistoryOpen
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-[#090d16]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          {/* Animated Logo */}
          <div className="relative w-9 h-9 flex items-center justify-center">
            {/* Spinning outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 border-r-blue-500 animate-spin-slow opacity-70" />
            {/* Inner icon */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/25">
              <Atom className="w-4 h-4 text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[15px] tracking-tight text-white">
                Topic<span className="gradient-text-cyan">AI</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/25 text-cyan-300 text-[9px] font-mono uppercase font-bold">
                v2
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block leading-none mt-0.5">
              Visual Knowledge Search Engine
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <AIStatusBadge aiStatus={aiStatus} onClick={onOpenSettings} />

          <button
            onClick={onToggleHistory}
            className={`relative p-2 rounded-xl border transition-all text-xs font-medium flex items-center gap-1.5
              ${isHistoryOpen
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700'
              }`}
            title="Search History"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500 text-black text-[9px] font-bold font-mono leading-none">
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 hover:border-slate-700 transition"
            title="Configure AI"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Animated shimmer line */}
      <div className="h-px w-full overflow-hidden">
        <div
          className="h-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #06b6d4 20%, #3b82f6 50%, #a78bfa 80%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'border-shimmer 4s linear infinite',
            opacity: 0.6
          }}
        />
      </div>
    </header>
  );
}
