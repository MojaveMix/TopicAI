import React, { useEffect, useRef, useState } from 'react';

/**
 * TableOfContents
 * Parses sanitized HTML for h2/h3 headings and renders a floating sidebar TOC.
 * Uses IntersectionObserver to highlight the current visible section.
 */
export default function TableOfContents({ htmlContent, containerRef }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const observerRef = useRef(null);

  // Extract headings and inject IDs into the DOM
  useEffect(() => {
    if (!containerRef?.current || !htmlContent) return;

    const el = containerRef.current;
    const hEls = el.querySelectorAll('h2, h3');
    if (hEls.length === 0) return;

    const extracted = [];
    hEls.forEach((h, i) => {
      const id = `toc-${i}-${h.textContent.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`;
      h.id = id;
      extracted.push({ id, text: h.textContent.trim(), level: h.tagName });
    });
    setHeadings(extracted);
    if (extracted.length > 0) setActiveId(extracted[0].id);

    // IntersectionObserver for active heading
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    hEls.forEach((h) => observerRef.current.observe(h));

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [htmlContent]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (headings.length < 2) return null;

  return (
    <aside className="w-52 flex-shrink-0 hidden lg:block sticky top-24 self-start">
      <div className="glass rounded-xl p-3 border border-slate-800/60">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2.5 px-1">
          Contents
        </p>
        <nav className="space-y-0.5">
          {headings.map(({ id, text, level }) => {
            const isActive = activeId === id;
            const isH3 = level === 'H3';
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full text-left px-2 py-1 rounded-lg text-[11px] leading-snug transition-all duration-150 block
                  ${isH3 ? 'pl-4' : ''}
                  ${isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border-l-2 border-cyan-500'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border-l-2 border-transparent'
                  }`}
              >
                {text}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
