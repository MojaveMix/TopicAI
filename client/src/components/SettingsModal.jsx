import React from 'react';
import { X, Sliders, Sparkles, RefreshCw, Check } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  aiStatus,
  onRefreshAIStatus,
  isRefreshing
}) {
  const [localSettings, setLocalSettings] = React.useState(settings);
  const availableModels = aiStatus?.availableModels || [];

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings({
      model: aiStatus?.model || 'Qwen3:8b',
      systemPrompt: '',
      temperature: 0.2
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0c1322]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">AI Engine Settings</h3>
              <p className="text-xs text-slate-400">Configure Ollama LLM parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* AI Status Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  aiStatus?.online ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <div className="text-xs">
                <span className="font-medium text-slate-200">
                  {aiStatus?.online ? 'Ollama Server Online' : 'Ollama Server Unreachable'}
                </span>
                <p className="text-slate-400 font-mono text-[11px]">
                  {aiStatus?.online ? `http://127.0.0.1:11434` : 'Check if `ollama serve` is running'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRefreshAIStatus}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition disabled:opacity-50"
              title="Refresh connection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Active LLM Model
            </label>
            {availableModels.length > 0 ? (
              <select
                value={localSettings.model}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, model: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b101b] border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-mono text-slate-100"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={localSettings.model}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, model: e.target.value })
                }
                placeholder="e.g., Qwen3:8b, llama3.1:8b"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b101b] border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-mono text-slate-100"
              />
            )}
            <p className="text-[11px] text-slate-400">
              Select any model loaded on your local Ollama server.
            </p>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Temperature
              </label>
              <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-medium">
                {localSettings.temperature}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={localSettings.temperature}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  temperature: parseFloat(e.target.value)
                })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.0 (Deterministic / Precise)</span>
              <span>1.0 (Creative)</span>
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>System Prompt (Optional)</span>
              <span className="text-[10px] lowercase text-slate-500 font-normal">custom instructions</span>
            </label>
            <textarea
              rows={3}
              value={localSettings.systemPrompt}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  systemPrompt: e.target.value
                })
              }
              placeholder="Default: Fast, direct, and structured AI search response formatted in Markdown..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b101b] border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-xs text-slate-200 resize-none font-sans"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 transition"
            >
              Reset to Defaults
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-black font-semibold flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
