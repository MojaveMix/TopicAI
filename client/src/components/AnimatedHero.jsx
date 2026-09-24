import React from 'react';
import { Network, BookOpen, GitFork, Sparkles, Layers, ArrowRight, Brain } from 'lucide-react';

const FEATURES = [
  {
    icon: Network,
    id: '3d-graph',
    label: '3D Knowledge Graph',
    color: 'cyan',
    desc: 'Explore any topic as an interactive 3D galaxy of interconnected concept nodes. Rotate, zoom, and click to inspect.',
    preview: 'graph'
  },
  {
    icon: GitFork,
    id: 'flowchart',
    label: 'Flowchart & Schema',
    color: 'violet',
    desc: 'Visualize processes, architectures, and step-by-step logic as an animated interactive diagram.',
    preview: 'flow'
  },
  {
    icon: BookOpen,
    id: 'wiki',
    label: 'Wikipedia Style',
    color: 'blue',
    desc: 'Get a structured encyclopedia-quality article with an infobox, sections, and key facts — instantly.',
    preview: 'wiki'
  }
];

const STEPS = [
  { num: '01', title: 'Type anything', desc: 'A concept, question, process, technology, historical event, or scientific idea.' },
  { num: '02', title: 'Pick a view format', desc: 'Choose how you want to understand it: 3D graph, flowchart, wiki, simple analogy, or deep analysis.' },
  { num: '03', title: 'Explore & understand', desc: 'Interact with animated visualizations, read structured content, and really understand the topic.' }
];

function GraphPreview() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full opacity-70" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="40" r="10" fill="#06b6d4" opacity="0.9">
        <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite" />
      </circle>
      {[[25,18],[95,18],[20,62],[95,62],[60,75]].map(([cx,cy], i) => (
        <g key={i}>
          <line x1="60" y1="40" x2={cx} y2={cy} stroke="#1e293b" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="6" fill={['#10b981','#3b82f6','#f59e0b','#a855f7','#ec4899'][i]} opacity="0.8">
            <animate attributeName="r" values="6;7;6" dur={`${1.5+i*0.3}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

function FlowPreview() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full opacity-70" xmlns="http://www.w3.org/2000/svg">
      {[
        { x: 45, y: 8, w: 30, h: 14, rx: 4, fill: '#4c1d95', stroke: '#7c3aed', label: 'Start', labelY: 17 },
        { x: 40, y: 33, w: 40, h: 14, rx: 4, fill: '#1e1b4b', stroke: '#6366f1', label: 'Process', labelY: 42 },
        { x: 45, y: 58, w: 30, h: 14, rx: 4, fill: '#4c1d95', stroke: '#7c3aed', label: 'End', labelY: 67 }
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={b.rx} fill={b.fill} stroke={b.stroke} strokeWidth="1" />
          <text x="60" y={b.labelY} textAnchor="middle" fill="#e2e8f0" fontSize="6" fontFamily="monospace">{b.label}</text>
        </g>
      ))}
      <line x1="60" y1="22" x2="60" y2="33" stroke="#7c3aed" strokeWidth="1" markerEnd="url(#arr)" />
      <line x1="60" y1="47" x2="60" y2="58" stroke="#7c3aed" strokeWidth="1" />
      <defs><marker id="arr" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
        <polygon points="0,0 4,2 0,4" fill="#7c3aed" />
      </marker></defs>
    </svg>
  );
}

function WikiPreview() {
  return (
    <div className="w-full h-full flex flex-col gap-1.5 p-2 opacity-70">
      <div className="h-2.5 w-3/4 bg-blue-400/50 rounded" />
      <div className="h-1.5 w-full bg-slate-700/60 rounded" />
      <div className="h-1.5 w-5/6 bg-slate-700/60 rounded" />
      <div className="h-1.5 w-4/5 bg-slate-700/60 rounded" />
      <div className="mt-1 flex gap-2">
        <div className="flex-1 space-y-1">
          <div className="h-1.5 w-full bg-slate-700/50 rounded" />
          <div className="h-1.5 w-4/5 bg-slate-700/50 rounded" />
          <div className="h-1.5 w-full bg-slate-700/50 rounded" />
          <div className="h-1.5 w-3/4 bg-slate-700/50 rounded" />
        </div>
        <div className="w-14 flex-shrink-0 space-y-1 bg-slate-800/70 rounded p-1.5 border border-slate-700/40">
          <div className="h-1.5 w-full bg-blue-400/40 rounded" />
          <div className="h-1 w-full bg-slate-600/50 rounded" />
          <div className="h-1 w-full bg-slate-600/50 rounded" />
          <div className="h-1 w-full bg-slate-600/50 rounded" />
          <div className="h-1 w-full bg-slate-600/50 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function AnimatedHero({ historyCount }) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-16 py-4 animate-fade-in-up">

      {/* Hero Heading */}
      <div className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/25 text-cyan-300 text-xs font-mono">
          <Brain className="w-3.5 h-3.5 text-cyan-400" />
          <span>Visual Knowledge Search · Powered by local AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          <span className="text-white">Understand</span>{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            anything
          </span>
          <br />
          <span className="text-white text-3xl sm:text-5xl font-bold">through interactive visualizations</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          Search any topic — science, history, code, concepts — and explore it through
          <strong className="text-cyan-300"> 3D graphs</strong>, <strong className="text-violet-300">flowcharts</strong>,{' '}
          <strong className="text-blue-300">Wikipedia-style articles</strong>, or simple analogies.
        </p>

        {historyCount > 0 && (
          <p className="text-xs text-slate-500 font-mono">
            ↑ {historyCount} saved search{historyCount !== 1 ? 'es' : ''} in history
          </p>
        )}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          const colorMap = {
            cyan:   { border: 'border-cyan-500/30',   bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   preview: 'border-cyan-500/20' },
            violet: { border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-400', preview: 'border-violet-500/20' },
            blue:   { border: 'border-blue-500/30',   bg: 'bg-blue-500/10',   text: 'text-blue-400',   preview: 'border-blue-500/20' }
          }[f.color];

          return (
            <div
              key={f.id}
              className={`relative p-5 rounded-2xl bg-[#0d1424] border ${colorMap.border} hover:border-opacity-60 transition-all duration-300 group overflow-hidden`}
            >
              {/* Subtle glow */}
              <div className={`absolute inset-0 ${colorMap.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

              <div className="relative space-y-3">
                {/* Animated Preview */}
                <div className={`h-24 rounded-xl border ${colorMap.preview} bg-[#090d16]/60 overflow-hidden mb-4`}>
                  {f.preview === 'graph' && <GraphPreview />}
                  {f.preview === 'flow'  && <FlowPreview />}
                  {f.preview === 'wiki'  && <WikiPreview />}
                </div>

                <div className={`inline-flex p-2 rounded-xl ${colorMap.bg} border ${colorMap.preview} ${colorMap.text}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  <h3 className={`font-semibold text-sm ${colorMap.text}`}>{f.label}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works */}
      <div className="space-y-6">
        <h2 className="text-center text-sm font-mono uppercase tracking-widest text-slate-500">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative flex gap-4 items-start p-4 rounded-xl bg-[#0c1220]/60 border border-slate-800/60">
              <div className="text-2xl font-extrabold font-mono gradient-text-cyan flex-shrink-0 leading-none pt-0.5">
                {step.num}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{step.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
