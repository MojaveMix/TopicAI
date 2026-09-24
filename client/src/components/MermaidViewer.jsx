import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import {
  GitFork,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Maximize2,
  Minimize2,
  Download,
  Code2
} from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#090d16',
    primaryColor: '#0f172a',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#7c3aed',
    lineColor: '#818cf8',
    secondaryColor: '#1e293b',
    tertiaryColor: '#0b101b',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px'
  },
  securityLevel: 'loose',
  flowchart: { curve: 'basis', useMaxWidth: true }
});

export default function MermaidViewer({ code, query }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent]   = useState('');
  const [error, setError]             = useState(null);
  const [zoomLevel, setZoomLevel]     = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCode, setShowCode]       = useState(false);
  // Pan state
  const [pan, setPan]       = useState({ x: 0, y: 0 });
  const panRef              = useRef({ dragging: false, startX: 0, startY: 0, px: 0, py: 0 });

  useEffect(() => {
    let isMounted = true;
    async function render() {
      if (!code) return;
      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
      try {
        setError(null);
        let clean = code.replace(/```mermaid/gi, '').replace(/```/g, '').trim();
        if (
          !clean.startsWith('flowchart') &&
          !clean.startsWith('graph') &&
          !clean.startsWith('sequenceDiagram') &&
          !clean.startsWith('classDiagram') &&
          !clean.startsWith('stateDiagram')
        ) {
          clean = `flowchart TD\n${clean}`;
        }
        const { svg } = await mermaid.render(id, clean);
        if (isMounted) setSvgContent(svg);
      } catch (err) {
        console.warn('Mermaid render error:', err);
        if (isMounted) setError(err.message || 'Diagram syntax error');
      }
    }
    render();
    return () => { isMounted = false; };
  }, [code]);

  // Download SVG
  const handleDownload = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${query || 'diagram'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pan handlers
  const onPanStart = (e) => {
    if (e.button !== 0) return;
    panRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, px: pan.x, py: pan.y };
  };
  const onPanMove = (e) => {
    if (!panRef.current.dragging) return;
    setPan({
      x: panRef.current.px + (e.clientX - panRef.current.startX),
      y: panRef.current.py + (e.clientY - panRef.current.startY)
    });
  };
  const onPanEnd = () => { panRef.current.dragging = false; };

  const resetView = () => { setZoomLevel(1); setPan({ x: 0, y: 0 }); };

  if (!code && !svgContent) return null;

  const cleanCodeDisplay = code
    ? code.replace(/```mermaid/gi, '').replace(/```/g, '').trim()
    : '';

  return (
    <div
      className={`w-full rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-300
        ${isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : 'flex flex-col'}`}
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-800 bg-[#0c1322] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-500/25 text-violet-400">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100 font-mono">Interactive Flowchart Schema</h3>
            <p className="text-[11px] text-slate-500">Drag to pan · Use controls to zoom</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
            <button onClick={() => setZoomLevel((z) => Math.min(3, z + 0.2))}
              className="p-1.5 text-slate-400 hover:text-white rounded transition" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] text-violet-400 px-2 font-medium">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => setZoomLevel((z) => Math.max(0.3, z - 0.2))}
              className="p-1.5 text-slate-400 hover:text-white rounded transition" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={resetView}
              className="p-1.5 text-slate-400 hover:text-white rounded transition ml-0.5" title="Reset">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Action buttons */}
          <button onClick={() => setShowCode(!showCode)}
            className={`p-1.5 rounded-lg border transition text-xs ${showCode ? 'bg-violet-950/40 border-violet-500/40 text-violet-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
            title="View Code">
            <Code2 className="w-3.5 h-3.5" />
          </button>

          {svgContent && (
            <button onClick={handleDownload}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
              title="Download SVG">
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          <button onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code View */}
      {showCode && (
        <div className="border-b border-slate-800 bg-[#070b14] overflow-auto max-h-48 p-4">
          <pre className="text-[12px] font-mono text-violet-200 whitespace-pre-wrap">{cleanCodeDisplay}</pre>
        </div>
      )}

      {/* Canvas */}
      <div
        className={`flex-1 overflow-hidden relative ${isFullscreen ? '' : 'min-h-[340px]'}`}
        style={{ cursor: panRef.current.dragging ? 'grabbing' : 'grab', background: 'rgba(7,11,20,0.5)' }}
        onMouseDown={onPanStart}
        onMouseMove={onPanMove}
        onMouseUp={onPanEnd}
        onMouseLeave={onPanEnd}
      >
        {error ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/25 text-xs text-amber-200 flex items-start gap-3 max-w-lg">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Diagram rendering failed</p>
                <p className="text-amber-300/70 text-[11px] mb-2">The step-by-step explanation is in the article view.</p>
                {cleanCodeDisplay && (
                  <pre className="text-[10px] bg-slate-900/60 p-2 rounded border border-slate-800 overflow-x-auto text-slate-300 mt-2 max-h-32">
                    {cleanCodeDisplay}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full overflow-hidden p-4 flex items-start justify-center">
            <div
              ref={containerRef}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center top',
                transition: panRef.current.dragging ? 'none' : 'transform 0.15s ease'
              }}
              className="[&>svg]:max-w-full [&>svg]:h-auto filter drop-shadow-[0_8px_24px_rgba(139,92,246,0.15)]"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2 bg-[#080d18] border-t border-slate-800/70 text-[11px] text-slate-500 flex items-center justify-between font-mono flex-shrink-0">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-violet-400" />
          <span>Mermaid.js Interactive Diagram</span>
        </span>
        <span className="text-slate-600 text-[10px]">Drag to pan · Download SVG</span>
      </div>
    </div>
  );
}
