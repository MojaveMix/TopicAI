import React, { useState } from 'react';
import {
  X,
  History,
  Trash2,
  Search,
  Clock,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelectSearch,
  onDeleteSearch,
  onClearHistory,
  isLoading,
  selectedId
}) {
  const [filterText, setFilterText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const filteredHistory = (history || []).filter((item) =>
    (item.search || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (item.result || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0c1220] border-l border-slate-800 shadow-2xl flex flex-col text-slate-100">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 bg-[#090e1a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-slate-100">Search History</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {history?.length || 0} saved queries
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Filter Bar */}
          <div className="p-4 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter saved queries..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#080d18] border border-slate-700/70 focus:border-cyan-500 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
              {filterText && (
                <button
                  onClick={() => setFilterText('')}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredHistory.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <History className="w-10 h-10 stroke-[1.5] text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-300">No search history found</p>
                <p className="text-xs text-slate-500 mt-1">
                  {filterText
                    ? 'No queries match your filter query.'
                    : 'Search queries and AI answers will appear here.'}
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectSearch(item)}
                    className={`group relative p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500/50 shadow-sm shadow-cyan-900/20'
                        : 'bg-[#0e1628]/80 border-slate-800/80 hover:border-slate-700 hover:bg-[#111b30]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                          <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition truncate">
                            {item.search}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {item.result?.replace(/[#*`_]/g, '')}
                        </p>
                        <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          <span>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Recent'}
                          </span>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSearch(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition"
                        title="Delete query"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Clear All */}
          {history?.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-[#090e1a]">
              {showClearConfirm ? (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-red-300 font-medium">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span>Clear all search history?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClearHistory();
                        setShowClearConfirm(false);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition"
                    >
                      Yes, Clear All
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full py-2.5 rounded-xl border border-slate-800 hover:border-red-500/40 bg-slate-900/60 hover:bg-red-950/20 text-slate-400 hover:text-red-300 text-xs font-medium flex items-center justify-center gap-2 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Entire History</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
