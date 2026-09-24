/**
 * Extract structured graph data, mermaid code, and infobox from AI response text.
 * Handles multiple JSON formats the AI might return.
 */
export function extractGraphData(text, query = 'Concept') {
  if (!text || typeof text !== 'string') {
    return { cleanContent: '', graphData: null, mermaidCode: null, infoboxData: null };
  }

  let cleanContent = text;
  let graphData    = null;
  let mermaidCode  = null;

  // ── 1. Extract JSON graph block ──────────────────────────────
  // Try to find ```json ... ``` block
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/gi;
  let jsonMatch;
  while ((jsonMatch = jsonBlockRegex.exec(text)) !== null) {
    try {
      const raw    = jsonMatch[1].trim();
      const parsed = JSON.parse(raw);

      // Accept both { graph: {...} } and { nodes: [...], links: [...] }
      let g = null;
      if (parsed.graph && Array.isArray(parsed.graph.nodes)) {
        g = parsed.graph;
      } else if (Array.isArray(parsed.nodes)) {
        g = parsed;
      }

      if (g && g.nodes && g.nodes.length > 0) {
        // Normalize node IDs to strings
        g.nodes = g.nodes.map((n, i) => ({
          ...n,
          id: String(n.id ?? i),
          label: String(n.label || `Node ${i + 1}`).trim(),
          category: n.category || 'concept',
          description: n.description || '',
          val: Number(n.val) || 8
        }));

        // Normalize links
        g.links = (g.links || []).map((l) => ({
          source: String(l.source ?? l.from ?? ''),
          target: String(l.target ?? l.to ?? ''),
          label:  String(l.label ?? l.relation ?? '')
        })).filter((l) => l.source && l.target);

        graphData = g;
        // Remove the JSON block from displayed content
        cleanContent = cleanContent.replace(jsonMatch[0], '').trim();
        break;
      }
    } catch {
      // Try next match
    }
  }

  // ── 2. If no valid JSON graph, try inline JSON (no code block) ──
  if (!graphData) {
    const inlineMatch = text.match(/\{\s*"graph"\s*:\s*\{[\s\S]*?"nodes"\s*:/);
    if (inlineMatch) {
      try {
        const startIdx = text.indexOf(inlineMatch[0]);
        const sub      = text.slice(startIdx);
        // Find balanced braces
        let depth = 0, endIdx = 0;
        for (let i = 0; i < sub.length; i++) {
          if (sub[i] === '{') depth++;
          else if (sub[i] === '}') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
        }
        if (endIdx > 0) {
          const parsed = JSON.parse(sub.slice(0, endIdx));
          if (parsed.graph?.nodes?.length > 0) {
            graphData    = parsed.graph;
            cleanContent = (text.slice(0, startIdx) + text.slice(startIdx + endIdx)).trim();
          }
        }
      } catch { /* ignore */ }
    }
  }

  // ── 3. Extract Mermaid diagram ───────────────────────────────
  const mermaidRegex = /```mermaid\s*([\s\S]*?)\s*```/i;
  const mermaidMatch = text.match(mermaidRegex);
  if (mermaidMatch?.[1]) {
    mermaidCode = mermaidMatch[1].trim();
  }

  // ── 4. Fallback: generate graph from headings & bullets ──────
  if (!graphData || graphData.nodes.length < 2) {
    graphData = generateHeuristicGraph(cleanContent || text, query);
  }

  // ── 5. Extract infobox from markdown table ───────────────────
  const infoboxData = extractInfoboxData(text);

  return { cleanContent, graphData, mermaidCode, infoboxData };
}

/* ── Heuristic graph from markdown headings / bullets ── */
function generateHeuristicGraph(text, query) {
  const rootLabel = query.length > 28 ? `${query.slice(0, 25)}…` : query;
  const nodes     = [{ id: 'root', label: rootLabel, category: 'core', description: `Main topic: ${query}`, val: 20 }];
  const links     = [];
  let   idx       = 1;

  const cats = ['feature', 'mechanism', 'application', 'impact', 'concept', 'detail'];

  // Pull H2 / H3 headings
  const headingRe = /^#{2,3}\s+(.+)$/gm;
  let m;
  while ((m = headingRe.exec(text)) !== null && idx <= 9) {
    const raw = m[1]
      .replace(/^\d+[.)]\s*/, '')
      .replace(/[*_:`#[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Shorten to max 4 words
    const shortened = raw.split(' ').slice(0, 4).join(' ');

    if (shortened && shortened.length < 40 && shortened.toLowerCase() !== rootLabel.toLowerCase()) {
      const id = `h${idx}`;
      nodes.push({ id, label: shortened, category: cats[idx % cats.length], description: `Section: ${raw}`, val: 11 });
      links.push({ source: 'root', target: id, label: 'covers' });
      idx++;
    }
  }

  // Pull bold key terms **term**: desc
  const boldRe = /\*\*([^*]{3,25})\*\*[:\s–—]+([^.\n]{10,120})/gm;
  while ((m = boldRe.exec(text)) !== null && idx <= 9) {
    const term = m[1].trim();
    const desc = m[2].trim();
    if (!nodes.some((n) => n.label.toLowerCase() === term.toLowerCase())) {
      const id = `b${idx}`;
      nodes.push({ id, label: term, category: cats[idx % cats.length], description: desc, val: 8 });
      links.push({ source: 'root', target: id, label: 'includes' });
      idx++;
    }
  }

  // Cross-links for visual richness
  if (nodes.length >= 4) links.push({ source: nodes[1].id, target: nodes[2].id, label: 'relates' });
  if (nodes.length >= 5) links.push({ source: nodes[2].id, target: nodes[3].id, label: 'leads to' });
  if (nodes.length >= 6) links.push({ source: nodes[3].id, target: nodes[4].id, label: 'connects' });

  return { nodes, links };
}

/* ── Infobox: extract markdown table key-value pairs ── */
function extractInfoboxData(text) {
  const rows  = [];
  const rowRe = /\|([^|\n]+)\|([^|\n]+)\|/g;
  let m, count = 0;

  while ((m = rowRe.exec(text)) !== null && count < 10) {
    const key = m[1].replace(/[*_`#\-]/g, '').trim();
    const val = m[2].replace(/[*_`#\-]/g, '').trim();

    if (
      key && val &&
      !key.includes('---') && !val.includes('---') &&
      !['field', 'property', 'attribute', 'key', 'value', 'name'].includes(key.toLowerCase()) &&
      key.length < 35 && val.length < 150
    ) {
      rows.push({ key, val });
      count++;
    }
  }

  return rows.length >= 2 ? rows : null;
}
