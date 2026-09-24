import React from 'react';
import { SEARCH_MODES } from '../constants/searchModes.js';
import {
  Network,
  BookOpen,
  GitFork,
  Sparkles,
  Layers
} from 'lucide-react';

const ICON_MAP = { Network, BookOpen, GitFork, Sparkles, Layers };

const MODE_CONFIG = {
  '3d-graph': {
    accent: 'cyan',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    border: 'border-cyan-500/60',
    iconBg: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300',
    activeBg: 'bg-gradient-to-br from-cyan-950/60 to-blue-950/40',
    dot: 'bg-cyan-400',
    hint: '✦ Renders an animated 3D galaxy of interconnected concept nodes you can orbit & explore'
  },
  wiki: {
    accent: 'blue',
    gradient: 'from-blue-500/20 to-indigo-500/10',
    border: 'border-blue-500/60',
    iconBg: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
    activeBg: 'bg-gradient-to-br from-blue-950/60 to-indigo-950/40',
    dot: 'bg-blue-400',
    hint: '✦ Structures response as a full encyclopedia article with infobox, sections & key facts'
  },
  flowchart: {
    accent: 'violet',
    gradient: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/60',
    iconBg: 'bg-violet-500/20 border-violet-500/30 text-violet-300',
    activeBg: 'bg-gradient-to-br from-violet-950/60 to-purple-950/40',
    dot: 'bg-violet-400',
    hint: '✦ Generates an interactive step-by-step visual flowchart diagram with Mermaid.js'
  },
  eli5: {
    accent: 'amber',
    gradient: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/60',
    iconBg: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
    activeBg: 'bg-gradient-to-br from-amber-950/60 to-orange-950/40',
    dot: 'bg-amber-400',
    hint: '✦ Breaks down any concept using fun analogies & 3 simple steps anyone can understand'
  },
  'deep-dive': {
    accent: 'rose',
    gradient: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-500/60',
    iconBg: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
    activeBg: 'bg-gradient-to-br from-rose-950/60 to-pink-950/40',
    dot: 'bg-rose-400',
    hint: '✦ Full technical analysis with comparison matrix, pros & cons, and implementation details'
  }
};

export default function ModeSelector({ activeMode, onSelectMode, disabled }) {
  const activeCfg = MODE_CONFIG[activeMode] || MODE_CONFIG['3d-graph'];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Choose Visual Schema Format:</span>
        </span>
        <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
          AI-tailored pre-prompts · instant comprehension
        </span>
      </div>

      {/* Mode Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {SEARCH_MODES.map((mode) => {
          const Icon = ICON_MAP[mode.icon] || Sparkles;
          const cfg = MODE_CONFIG[mode.id] || MODE_CONFIG['3d-graph'];
          const isSelected = activeMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectMode(mode.id)}
              className={`
                relative p-3 rounded-xl border text-left transition-all duration-200
                flex flex-col gap-2 cursor-pointer disabled:opacity-50 overflow-hidden
                ${isSelected
                  ? `${cfg.activeBg} ${cfg.border} shadow-lg scale-[1.02]`
                  : 'bg-[#0b101b] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }
              `}
              title={mode.description}
            >
              {/* Selected Glow Effect */}
              {isSelected && (
                <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-50 pointer-events-none`} />
              )}

              {/* Icon + Indicator */}
              <div className="relative flex items-center justify-between w-full">
                <div className={`p-2 rounded-lg border transition ${isSelected ? cfg.iconBg : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {isSelected && (
                  <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
                )}
              </div>

              {/* Label + Description */}
              <div className="relative">
                <p className={`text-xs font-semibold leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {mode.name}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                  {mode.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Mode Preview Hint */}
      <div
        key={activeMode}
        className="animate-fade-in-up flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400"
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activeCfg.dot}`} />
        <span>{activeCfg.hint}</span>
      </div>
    </div>
  );
}
