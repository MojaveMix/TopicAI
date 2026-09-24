import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import SearchBar from './components/SearchBar.jsx';
import SearchResult from './components/SearchResult.jsx';
import HistoryDrawer from './components/HistoryDrawer.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import AnimatedHero from './components/AnimatedHero.jsx';
import { searchApi } from './services/api.js';
import { SEARCH_MODES } from './constants/searchModes.js';
import {
  Terminal,
  Activity,
  Server,
  Sparkles,
  AlertCircle,
  Brain,
  Loader2
} from 'lucide-react';

function AIThinkingLoader({ query }) {
  const [dot, setDot] = useState(0);
  const steps = ['Analyzing query', 'Generating knowledge graph', 'Synthesizing response', 'Structuring visualizations'];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dotT = setInterval(() => setDot((d) => (d + 1) % 4), 400);
    const stepT = setInterval(() => setStep((s) => (s + 1) % steps.length), 2200);
    return () => { clearInterval(dotT); clearInterval(stepT); };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 animate-fade-in-up">
      <div className="relative p-8 rounded-2xl bg-[#0d1424]/90 border border-slate-800 shadow-2xl overflow-hidden text-center space-y-6">
        {/* Animated gradient ring */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 border-r-blue-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-violet-500 border-l-indigo-500 animate-spin-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            {steps[step]}{'...'.slice(0, dot + 1)}
          </p>
          <h3 className="text-lg font-semibold text-slate-200">
            Understanding{' '}
            <span className="gradient-text-cyan font-bold">"{query}"</span>
          </h3>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-48 mx-auto bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #a78bfa)',
              width: `${25 * (step + 1)}%`,
              transition: 'width 2s ease'
            }}
          />
        </div>

        <p className="text-xs text-slate-600 font-mono">Local AI engine active · No data leaves your machine</p>
      </div>
    </div>
  );
}

export default function App() {
  const [history, setHistory]           = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState(null);
  const [activeMode, setActiveMode]     = useState('3d-graph');
  const [lastQuery, setLastQuery]       = useState('');

  const [aiStatus, setAiStatus] = useState({
    online: false,
    model: 'Qwen3:8b',
    modelFound: false,
    availableModels: []
  });
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  const [settings, setSettings] = useState({
    model: 'Qwen3:8b',
    systemPrompt: '',
    temperature: 0.2
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen]   = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const status = await searchApi.getAIStatus();
      setAiStatus(status);
      if (status?.model) setSettings((prev) => ({ ...prev, model: status.model }));

      const historyData = await searchApi.getHistory({ limit: 50 });
      setHistory(historyData.items || []);

      if (historyData.items?.length > 0) {
        setCurrentResult(historyData.items[0]);
      }
    } catch (err) {
      console.warn('Initial data load error:', err);
    }
  };

  const handleRefreshAIStatus = async () => {
    setIsRefreshingStatus(true);
    try {
      const status = await searchApi.getAIStatus();
      setAiStatus(status);
    } catch (err) {
      console.error('Failed to refresh AI status:', err);
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  const handleSearch = async (queryText, mode = activeMode) => {
    setIsLoading(true);
    setError(null);
    setLastQuery(queryText);

    try {
      const selectedModeConfig = SEARCH_MODES.find((m) => m.id === mode) || SEARCH_MODES[0];
      const customPrompt       = selectedModeConfig.promptSuffix || '';

      const effectiveSystemPrompt = settings.systemPrompt
        ? `${settings.systemPrompt}\n\n${customPrompt}`
        : customPrompt;

      const result = await searchApi.search({
        search: queryText,
        systemPrompt: effectiveSystemPrompt,
        model: settings.model,
        temperature: settings.temperature
      });

      setCurrentResult(result);
      setHistory((prev) => [result, ...prev.filter((item) => item.id !== result.id)]);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message || 'Failed to complete search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSearch = async (id) => {
    try {
      await searchApi.delete(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (currentResult?.id === id) {
        const remaining = history.filter((item) => item.id !== id);
        setCurrentResult(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error('Failed to delete search:', err);
    }
  };

  const handleClearHistory = async () => {
    try {
      await searchApi.clearHistory();
      setHistory([]);
      setCurrentResult(null);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const handleSelectSearch = (item) => {
    setCurrentResult(item);
    setIsHistoryOpen(false);
  };

  const showHero = !currentResult && !isLoading;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      <Navbar
        aiStatus={aiStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        historyCount={history.length}
        isHistoryOpen={isHistoryOpen}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/35 text-red-200 text-sm flex items-center justify-between gap-3 animate-fade-in-up">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-xs text-red-400 hover:text-red-200 underline font-mono">
              Dismiss
            </button>
          </div>
        )}

        {/* Search Input + Mode Selector */}
        <SearchBar
          onSearch={handleSearch}
          isLoading={isLoading}
          activeMode={activeMode}
          onSelectMode={setActiveMode}
        />

        {/* Hero Landing (only when no result yet) */}
        {showHero && <AnimatedHero historyCount={history.length} />}

        {/* AI Thinking Loader */}
        {isLoading && <AIThinkingLoader query={lastQuery} />}

        {/* Search Result */}
        {!isLoading && currentResult && (
          <SearchResult
            currentResult={currentResult}
            onDelete={handleDeleteSearch}
            isLoading={isLoading}
            activeMode={activeMode}
          />
        )}

        {/* Stats Footer Tiles */}
        {!showHero && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto pt-4">
            <div className="p-4 rounded-2xl bg-[#0c1220] border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/15">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Saved Searches</p>
                <p className="text-xl font-bold text-white font-mono">{history.length}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1220] border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/15">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Active Schema</p>
                <p className="text-sm font-bold text-slate-200 font-mono capitalize truncate max-w-[160px]">
                  {SEARCH_MODES.find((m) => m.id === activeMode)?.name || activeMode}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1220] border border-slate-800 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${
                aiStatus?.online
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/15'
              }`}>
                <Server className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Ollama Engine</p>
                <p className={`text-sm font-bold font-mono ${aiStatus?.online ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {aiStatus?.online ? 'Connected' : 'Offline (Fallback)'}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-5 mt-12 bg-[#070b14] text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500/60" />
            © 2026 TopicAI · Visual Knowledge Engine · Express.js + Three.js + React
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>API v1</span>
            <span>·</span>
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-cyan-400 transition">
              Configure AI
            </button>
          </div>
        </div>
      </footer>

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectSearch={handleSelectSearch}
        onDeleteSearch={handleDeleteSearch}
        onClearHistory={handleClearHistory}
        isLoading={isLoading}
        selectedId={currentResult?.id}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
        aiStatus={aiStatus}
        onRefreshAIStatus={handleRefreshAIStatus}
        isRefreshing={isRefreshingStatus}
      />
    </div>
  );
}
