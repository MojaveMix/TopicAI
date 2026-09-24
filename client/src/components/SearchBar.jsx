import React, { useState } from 'react';
import { Search, Sparkles, CornerDownLeft, X, Loader2, Compass, ChevronDown } from 'lucide-react';
import ModeSelector from './ModeSelector.jsx';

const TOPIC_GROUPS = [
  {
    label: 'Science & Tech',
    color: 'cyan',
    items: [
      '🧬 DNA & Genetics',
      '⚛️ Quantum Computing',
      '🌌 Black Holes',
      '🤖 Neural Networks',
      '🔬 CRISPR Gene Editing'
    ]
  },
  {
    label: 'History & World',
    color: 'blue',
    items: [
      '🏛️ Roman Empire',
      '🌍 Climate Change',
      '🦠 Pandemics & Viruses',
      '🚀 Space Race History',
      '⚔️ World War II'
    ]
  },
  {
    label: 'Ideas & Concepts',
    color: 'violet',
    items: [
      '🧠 Consciousness',
      '💰 Blockchain',
      '🎮 Game Theory',
      '🔁 Recursion in CS',
      '📈 Compound Interest'
    ]
  }
];

export default function SearchBar({ onSearch, isLoading, activeMode, onSelectMode }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showTopics, setShowTopics] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query.trim(), activeMode);
  };

  const handleTopicClick = (topic) => {
    const clean = topic.replace(/^[^\w\s]+\s*/, '').trim();
    setQuery(clean);
    onSearch(clean, activeMode);
    setShowTopics(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') setIsFocused(false);
  };

  const MODE_COLOR_MAP = {
    '3d-graph': 'text-cyan-300',
    wiki: 'text-blue-300',
    flowchart: 'text-violet-300',
    eli5: 'text-amber-300',
    'deep-dive': 'text-rose-300'
  };

  const modeLabel = {
    '3d-graph': '3D Graph',
    wiki: 'Wiki Style',
    flowchart: 'Flowchart',
    eli5: 'ELI5',
    'deep-dive': 'Deep Dive'
  }[activeMode] || activeMode;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative group">
        {/* Animated gradient border glow on focus */}
        <div
          className={`absolute -inset-0.5 rounded-2xl blur transition-all duration-500 pointer-events-none
            ${isFocused
              ? 'opacity-80 bg-gradient-to-r from-cyan-500/50 via-blue-500/40 to-violet-500/50'
              : 'opacity-20 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-violet-500/30 group-hover:opacity-50'
            }`}
        />

        <div className={`relative flex items-center bg-[#0d1424] border rounded-2xl shadow-2xl transition-all duration-200 overflow-hidden
          ${isFocused ? 'border-cyan-500/50' : 'border-slate-700/70 hover:border-slate-600/80'}`}
        >
          {/* Icon */}
          <div className={`pl-4 pr-2 transition-colors duration-200 ${isFocused ? 'text-cyan-400' : 'text-slate-500'}`}>
            {isLoading
              ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              : <Search className="w-5 h-5" />
            }
          </div>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
            placeholder="Search any topic — concepts, science, history, code, ideas..."
            className="w-full py-4 px-2 bg-transparent text-slate-100 placeholder-slate-500 outline-none text-sm sm:text-[15px] font-normal disabled:opacity-50"
            maxLength={1000}
            autoComplete="off"
          />

          {/* Active mode badge */}
          {query && !isLoading && (
            <div className={`shrink-0 mr-2 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono font-medium hidden sm:block ${MODE_COLOR_MAP[activeMode]}`}>
              {modeLabel}
            </div>
          )}

          {/* Clear */}
          {query && !isLoading && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 mr-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Submit */}
          <div className="pr-3">
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md
                ${query.trim() && !isLoading
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="text-cyan-400 font-mono hidden sm:inline">Thinking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Search</span>
                  <CornerDownLeft className="w-3.5 h-3.5 opacity-50 hidden sm:inline" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Mode Selector */}
      <ModeSelector
        activeMode={activeMode}
        onSelectMode={onSelectMode}
        disabled={isLoading}
      />

      {/* Quick Topics */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowTopics(!showTopics)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition group"
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick topic ideas</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showTopics ? 'rotate-180' : ''}`} />
        </button>

        {showTopics && (
          <div className="animate-fade-in-up space-y-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/70">
            {TOPIC_GROUPS.map((group) => (
              <div key={group.label}>
                <p className={`text-[10px] font-mono font-semibold uppercase tracking-wider mb-1.5 ${
                  group.color === 'cyan' ? 'text-cyan-400' :
                  group.color === 'blue' ? 'text-blue-400' : 'text-violet-400'
                }`}>
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleTopicClick(item)}
                      disabled={isLoading}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all duration-150 disabled:opacity-50
                        bg-slate-800/70 border border-slate-700/60 text-slate-300
                        ${group.color === 'cyan' ? 'hover:border-cyan-500/50 hover:text-cyan-300 hover:bg-cyan-950/20' :
                          group.color === 'blue' ? 'hover:border-blue-500/50 hover:text-blue-300 hover:bg-blue-950/20' :
                          'hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-950/20'
                        }
                      `}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
