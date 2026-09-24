import React from 'react';
import { Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AIStatusBadge({ aiStatus, onClick }) {
  const isOnline = aiStatus?.online;
  const modelName = aiStatus?.model || 'Qwen3:8b';

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer ${
        isOnline
          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40 shadow-sm shadow-emerald-900/20'
          : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/40 shadow-sm shadow-amber-900/20'
      }`}
      title="Click to configure AI Engine settings"
    >
      <div className="relative flex items-center justify-center">
        <span
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        />
        {isOnline && (
          <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
        )}
      </div>

      <Cpu className="w-3.5 h-3.5 opacity-70" />
      
      <span className="font-mono font-medium">
        {isOnline ? modelName : 'Local AI Offline'}
      </span>

      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 border border-white/5 font-semibold">
        {isOnline ? 'Ollama' : 'Fallback'}
      </span>
    </button>
  );
}
