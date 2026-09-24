export const SEARCH_MODES = [
  {
    id: '3d-graph',
    name: '3D Knowledge Graph',
    icon: 'Network',
    description: 'Interactive 2D/3D concept map with labeled nodes & visual links',
    promptSuffix: `
After your explanation, output a JSON block at the END of your response with this EXACT structure (no extra text outside the block):

\`\`\`json
{
  "graph": {
    "centerNode": "Main Topic Name",
    "nodes": [
      { "id": "1", "label": "Main Topic", "category": "core", "description": "One sentence: what this is at its core.", "val": 20 },
      { "id": "2", "label": "Key Component 1", "category": "feature", "description": "One sentence explaining this component.", "val": 12 },
      { "id": "3", "label": "Key Component 2", "category": "mechanism", "description": "One sentence explaining how this works.", "val": 12 },
      { "id": "4", "label": "How It Works", "category": "mechanism", "description": "Brief description of the core process.", "val": 10 },
      { "id": "5", "label": "Real-World Use", "category": "application", "description": "One concrete real-world example.", "val": 10 },
      { "id": "6", "label": "Key Benefit", "category": "impact", "description": "Main advantage or outcome.", "val": 9 },
      { "id": "7", "label": "Related Concept", "category": "concept", "description": "A closely related idea or technology.", "val": 8 },
      { "id": "8", "label": "Challenge / Limit", "category": "detail", "description": "A key limitation or open problem.", "val": 8 }
    ],
    "links": [
      { "source": "1", "target": "2", "label": "includes" },
      { "source": "1", "target": "3", "label": "works via" },
      { "source": "1", "target": "4", "label": "operates as" },
      { "source": "2", "target": "5", "label": "enables" },
      { "source": "3", "target": "6", "label": "produces" },
      { "source": "4", "target": "7", "label": "relates to" },
      { "source": "1", "target": "8", "label": "limited by" },
      { "source": "5", "target": "6", "label": "leads to" }
    ]
  }
}
\`\`\`

RULES:
- node labels must be SHORT (1-4 words max)
- descriptions must be ONE sentence, clear and informative
- use only these categories: core, feature, mechanism, application, impact, concept, detail
- you MUST output between 6 and 10 nodes
- the JSON must be valid — no trailing commas, no comments`
  },
  {
    id: 'wiki',
    name: 'Wikipedia / Infobox',
    icon: 'BookOpen',
    description: 'Encyclopedia-style article with infobox, sections & key facts',
    promptSuffix: `
Format your entire response as a high-quality Wikipedia-style encyclopedia article.

Start with an Infobox as a markdown table (2 columns: Property | Value) with 5-7 quick facts such as: Type, Field/Domain, Origin/Year, Creator(s)/Author(s), Primary Purpose, Key Features, Notable Examples.

Then write these sections:
## 1. Overview & Definition
## 2. Background & History
## 3. Core Concepts & How It Works
## 4. Real-World Applications & Examples
## 5. Advantages & Limitations
## 6. Key Takeaways

Use clear, encyclopedic prose. Include a mix of bullet points and paragraphs. Be informative and precise.`
  },
  {
    id: 'flowchart',
    name: 'Flowchart & Schema',
    icon: 'GitFork',
    description: 'Step-by-step visual process schema with animated diagram',
    promptSuffix: `
Explain this concept as a step-by-step visual process.

FIRST, output a valid Mermaid.js flowchart diagram that clearly shows the workflow, architecture, or decision process. Use simple node labels (short text). Example format:

\`\`\`mermaid
flowchart TD
  A["Start / Input"] --> B["Step 1: Process"]
  B --> C{"Decision?"}
  C -->|"Yes"| D["Action A"]
  C -->|"No"| E["Action B"]
  D --> F["Result / Output"]
  E --> F
  style A fill:#0c4a6e,stroke:#06b6d4,color:#fff
  style F fill:#064e3b,stroke:#10b981,color:#fff
\`\`\`

THEN write a detailed step-by-step explanation for each node in the diagram. Label each step clearly.`
  },
  {
    id: 'eli5',
    name: "Explain Like I'm 5",
    icon: 'Sparkles',
    description: 'Simple, fun explanation using everyday analogies — anyone can understand',
    promptSuffix: `
Explain this concept so that a complete beginner or even a child can understand it.

Use this exact structure:

### 💡 The Big Idea in One Sentence
(A single, crystal-clear sentence. No jargon.)

### 🎯 The Best Analogy
(A fun, creative real-world comparison that makes the concept click. Use something everyone knows.)

### 🪜 How It Works — 3 Simple Steps
1. **Step 1:** ...
2. **Step 2:** ...
3. **Step 3:** ...

### ✅ Why This Matters
(2-3 sentences on the real-world impact and why people care about this.)

### 🤔 Common Questions
- **Q:** [A common beginner question]
  **A:** [Simple answer]
- **Q:** [Another common question]
  **A:** [Simple answer]`
  },
  {
    id: 'deep-dive',
    name: 'Deep Dive & Comparison',
    icon: 'Layers',
    description: 'In-depth analysis with comparison matrix, pros & cons, technical details',
    promptSuffix: `
Provide a rigorous, in-depth technical breakdown. Be comprehensive and precise.

Structure your response as follows:

## 🔬 Technical Deep Dive
(Detailed technical explanation with architecture, mechanisms, and inner workings.)

## ⚖️ Comparison Matrix
Create a markdown table comparing this topic against 2-3 alternatives or related approaches across 5+ dimensions (e.g., Performance, Complexity, Use Case, Scalability, Cost).

## ✅ Advantages
(Bullet points — be specific, not generic)

## ❌ Limitations & Challenges
(Bullet points — be honest about drawbacks)

## 🛠️ Implementation & Best Practices
(Practical guidance, common patterns, pitfalls to avoid)

## 📊 When To Use vs. When Not To Use
(Clear decision criteria in a table or bullet format)`
  }
];
