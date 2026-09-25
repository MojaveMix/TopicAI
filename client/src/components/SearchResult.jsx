import React, { useState, useMemo, useRef, useEffect } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import {
  Copy,
  Check,
  Trash2,
  Cpu,
  Clock,
  Sparkles,
  FileText,
  AlertTriangle,
  Network,
  BookOpen,
  GitFork,
  Columns,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ThreeGraphView from "./ThreeGraphView.jsx";
import MermaidViewer from "./MermaidViewer.jsx";
import WikiInfobox from "./WikiInfobox.jsx";
import TableOfContents from "./TableOfContents.jsx";
import { extractGraphData } from "../utils/graphExtractor.js";

const MODE_ACCENT = {
  "3d-graph": {
    color: "text-cyan-300",
    bg: "bg-cyan-500",
    dim: "bg-cyan-500/10",
    border: "border-cyan-500/40",
  },
  wiki: {
    color: "text-blue-300",
    bg: "bg-blue-500",
    dim: "bg-blue-500/10",
    border: "border-blue-500/40",
  },
  flowchart: {
    color: "text-violet-300",
    bg: "bg-violet-500",
    dim: "bg-violet-500/10",
    border: "border-violet-500/40",
  },
  eli5: {
    color: "text-amber-300",
    bg: "bg-amber-500",
    dim: "bg-amber-500/10",
    border: "border-amber-500/40",
  },
  "deep-dive": {
    color: "text-rose-300",
    bg: "bg-rose-500",
    dim: "bg-rose-500/10",
    border: "border-rose-500/40",
  },
};

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-8 rounded-2xl bg-[#0d1424]/90 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl skeleton" />
          <div className="space-y-2">
            <div className="w-52 h-4 skeleton rounded-lg" />
            <div className="w-32 h-3 skeleton rounded-lg" />
          </div>
        </div>
        <div className="w-24 h-6 skeleton rounded-full" />
      </div>
      {/* Tabs */}
      <div className="px-6 py-2.5 bg-[#080d18] border-b border-slate-800 flex gap-2">
        {[80, 110, 100].map((w, i) => (
          <div
            key={i}
            className="h-7 skeleton rounded-lg"
            style={{ width: w }}
          />
        ))}
      </div>
      {/* Content */}
      <div className="p-8 space-y-4">
        <div className="flex gap-8">
          <div className="flex-1 space-y-3">
            {[100, 90, 95, 85, 100, 75, 90, 60].map((w, i) => (
              <div
                key={i}
                className="h-3.5 skeleton rounded-lg"
                style={{ width: `${w}%` }}
              />
            ))}
            <div className="h-32 skeleton rounded-xl mt-6 w-full" />
            {[100, 85, 70].map((w, i) => (
              <div
                key={i}
                className="h-3.5 skeleton rounded-lg"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <div className="w-44 flex-shrink-0 hidden lg:block">
            <div className="space-y-2">
              <div className="h-3 w-20 skeleton rounded-lg mb-3" />
              {[70, 90, 60, 80, 55].map((w, i) => (
                <div
                  key={i}
                  className="h-3 skeleton rounded-lg"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadingProgress({ containerRef }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? Math.min(100, (scrollTop / docH) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-800/50 z-10">
      <div
        className="h-full reading-progress-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function SearchResult({
  currentResult,
  onDelete,
  isLoading,
  activeMode,
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("article");
  const [articleExpanded, setArticleExpanded] = useState(true);
  const articleRef = useRef(null);
  const resultRef = useRef(null);

  const extracted = useMemo(() => {
    if (!currentResult?.result) return null;
    return extractGraphData(currentResult.result, currentResult.search);
  }, [currentResult]);

  useEffect(() => {
    if (activeMode === "3d-graph") setActiveTab("graph3d");
    else if (activeMode === "flowchart" || extracted?.mermaidCode)
      setActiveTab("flowchart");
    else setActiveTab("article");
  }, [currentResult?.id, activeMode]);

  if (isLoading) return <LoadingSkeleton />;
  if (!currentResult) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentResult.result || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanText = extracted?.cleanContent || currentResult.result || "";
  const rawHtml = marked.parse(cleanText);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  const wordCount = currentResult.result
    ? currentResult.result.split(/\s+/).length
    : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const isFallback = currentResult?.aiEngine?.status === "FALLBACK";

  const hasGraph = extracted?.graphData?.nodes?.length > 0;
  const hasMermaid = !!extracted?.mermaidCode;
  const hasInfobox = !!extracted?.infoboxData;
  const accent = MODE_ACCENT[activeMode] || MODE_ACCENT.wiki;

  const TABS = [
    { id: "article", icon: BookOpen, label: "Article", always: true },
    {
      id: "graph3d",
      icon: Network,
      label: "3D Graph",
      badge: "3D",
      show: hasGraph,
    },
    { id: "flowchart", icon: GitFork, label: "Flowchart", show: hasMermaid },
    {
      id: "split",
      icon: Columns,
      label: "Split View",
      show: hasGraph,
      hidden: "md:flex hidden",
    },
  ].filter((t) => t.always || t.show);

  return (
    <div
      ref={resultRef}
      className="w-full max-w-5xl mx-auto mt-8 bg-[#0d1424]/95 border border-slate-800 hover:border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-200 relative"
    >
      <ReadingProgress containerRef={resultRef} />

      {/* Top Bar */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-[#0a0f1d] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2 rounded-xl ${accent.dim} border ${accent.border} flex-shrink-0`}
          >
            <Sparkles className={`w-4 h-4 ${accent.color}`} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white truncate">
              {currentResult.search}
            </h2>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 font-mono mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentResult.createdAt
                  ? new Date(currentResult.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Just now"}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {wordCount} words · {readTime} min
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
              isFallback
                ? "bg-amber-950/30 text-amber-300 border-amber-500/30"
                : "bg-slate-800/80 text-slate-300 border-slate-700/60"
            }`}
          >
            {isFallback ? (
              <AlertTriangle className="w-3 h-3 text-amber-400" />
            ) : (
              <Cpu className="w-3 h-3 text-cyan-400" />
            )}
            <span>{currentResult?.aiEngine?.model || "AI"}</span>
          </div>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 hidden sm:inline">
                  Copied
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {onDelete && currentResult.id && (
            <button
              onClick={() => onDelete(currentResult.id)}
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/30 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sticky Tab Bar */}
      <div className="px-5 py-2.5 bg-[#080d18] border-b border-slate-800/60 flex items-center justify-between gap-2 sticky top-14 z-10">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800/60">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5
                  ${tab.hidden || ""}
                  ${
                    isActive
                      ? `${accent.bg} text-black font-semibold shadow-sm`
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && isActive && (
                  <span className="px-1 py-0.5 rounded bg-black/25 text-[9px] font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <span className="text-[11px] text-slate-600 font-mono hidden sm:block">
          AI Visual Comprehension Engine
        </span>
      </div>

      {/* Content Area */}
      <div className="p-5 sm:p-7">
        {/* ARTICLE TAB */}
        {activeTab === "article" && (
          <div className="tab-panel-enter flex gap-6 items-start">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {hasInfobox && (
                <WikiInfobox
                  infoboxData={extracted.infoboxData}
                  title={currentResult.search}
                />
              )}
              <div
                ref={articleRef}
                className="markdown-content text-slate-200"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </div>
            {/* Floating TOC */}
            <TableOfContents
              htmlContent={sanitizedHtml}
              containerRef={articleRef}
            />
          </div>
        )}

        {/* 3D GRAPH TAB */}
        {activeTab === "graph3d" && hasGraph && (
          <div className="tab-panel-enter space-y-5">
            <ThreeGraphView
              graphData={extracted.graphData}
              query={currentResult.search}
            />

            {/* Collapsible article below graph */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setArticleExpanded(!articleExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0a0f1d] hover:bg-[#0d1424] transition text-sm text-slate-300 font-medium"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Full Article
                </span>
                {articleExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {articleExpanded && (
                <div className="p-5 border-t border-slate-800">
                  <div
                    className="markdown-content text-slate-200"
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* FLOWCHART TAB */}
        {activeTab === "flowchart" && hasMermaid && (
          <div className="tab-panel-enter space-y-6">
            <MermaidViewer
              code={extracted.mermaidCode}
              query={currentResult.search}
            />
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setArticleExpanded(!articleExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0a0f1d] hover:bg-[#0d1424] transition text-sm text-slate-300 font-medium"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  Step-by-step Explanation
                </span>
                {articleExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {articleExpanded && (
                <div className="p-5 border-t border-slate-800">
                  <div
                    className="markdown-content text-slate-200"
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* SPLIT VIEW TAB */}
        {activeTab === "split" && hasGraph && (
          <div className="tab-panel-enter grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            <div className="lg:sticky lg:top-28">
              <ThreeGraphView
                graphData={extracted.graphData}
                query={currentResult.search}
              />
            </div>
            <div className="max-h-[580px] overflow-y-auto pr-2 p-4 rounded-xl bg-[#090e1a]/60 border border-slate-800">
              <div
                className="markdown-content text-slate-200"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 bg-[#080d18] border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-600 font-mono">
        <span>ID: {currentResult.id || "draft"}</span>
        <span>Three.js · Mermaid.js · AI Visualizer</span>
      </div>
    </div>
  );
}
