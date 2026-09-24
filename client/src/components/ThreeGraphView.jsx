import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Network,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapIcon,
} from "lucide-react";

/* ─── Category Theming ─────────────────────────────────────────── */
const CAT = {
  core: {
    hex: 0x06b6d4,
    css: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    border: "#06b6d4",
  },
  feature: {
    hex: 0x10b981,
    css: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "#10b981",
  },
  mechanism: {
    hex: 0x6366f1,
    css: "#6366f1",
    bg: "rgba(99,102,241,0.12)",
    border: "#6366f1",
  },
  application: {
    hex: 0xf59e0b,
    css: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "#f59e0b",
  },
  impact: {
    hex: 0xa855f7,
    css: "#a855f7",
    bg: "rgba(168,85,247,0.12)",
    border: "#a855f7",
  },
  detail: {
    hex: 0xec4899,
    css: "#ec4899",
    bg: "rgba(236,72,153,0.12)",
    border: "#ec4899",
  },
  concept: {
    hex: 0x14b8a6,
    css: "#14b8a6",
    bg: "rgba(20,184,166,0.12)",
    border: "#14b8a6",
  },
};
const getCat = (c) => CAT[c] || CAT.concept;

/* ════════════════════════════════════════════════════════════════
   2D SVG MIND MAP — default view, always readable
══════════════════════════════════════════════════════════════════ */
function MindMap({ nodes, links, onNodeClick, selectedId }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef({ drag: false, sx: 0, sy: 0, px: 0, py: 0 });
  const svgRef = useRef(null);

  if (!nodes || nodes.length === 0) return null;

  /* ── Layout: root at centre, others in concentric rings ── */
  const W = 900,
    H = 560;
  const cx = W / 2,
    cy = H / 2;

  const positioned = nodes.map((node, idx) => {
    if (idx === 0) return { ...node, x: cx, y: cy };
    const ring = idx <= 6 ? 1 : 2;
    const peersInRing = Math.min(
      nodes.length - 1,
      ring === 1 ? 6 : nodes.length - 7,
    );
    const posInRing = ring === 1 ? idx - 1 : idx - 7;
    const r = ring === 1 ? 195 : 340;
    const angleStep = (2 * Math.PI) / Math.max(peersInRing, 1);
    const angle = posInRing * angleStep - Math.PI / 2;
    return {
      ...node,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  const posMap = Object.fromEntries(positioned.map((n) => [String(n.id), n]));

  /* ── Pan handlers ── */
  const onPanStart = (e) => {
    panRef.current = {
      drag: true,
      sx: e.clientX,
      sy: e.clientY,
      px: pan.x,
      py: pan.y,
    };
  };
  const onPanMove = (e) => {
    if (!panRef.current.drag) return;
    setPan({
      x: panRef.current.px + e.clientX - panRef.current.sx,
      y: panRef.current.py + e.clientY - panRef.current.sy,
    });
  };
  const onPanEnd = () => {
    panRef.current.drag = false;
  };

  return (
    <div
      className="relative w-full h-full select-none"
      style={{ cursor: panRef.current.drag ? "grabbing" : "grab" }}
      onMouseDown={onPanStart}
      onMouseMove={onPanMove}
      onMouseUp={onPanEnd}
      onMouseLeave={onPanEnd}
    >
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 glass rounded-xl p-1 pointer-events-auto">
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
          className="p-1.5 text-slate-400 hover:text-white rounded transition"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono text-cyan-400 px-1.5">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          className="p-1.5 text-slate-400 hover:text-white rounded transition"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 text-slate-400 hover:text-white rounded ml-0.5 transition"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        style={{
          transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: panRef.current.drag ? "none" : "transform 0.15s ease",
        }}
      >
        <defs>
          {/* Glow filters */}
          <filter id="glow-core" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-node" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Arrow markers for links */}
          {Object.entries(CAT).map(([key, c]) => (
            <marker
              key={key}
              id={`arrow-${key}`}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 z" fill={c.css} opacity="0.7" />
            </marker>
          ))}
          <marker
            id="arrow-default"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 z" fill="#64748b" opacity="0.7" />
          </marker>
          {/* Gradient backgrounds for node cards */}
          {positioned.map((n) => {
            const c = getCat(n.category);
            return (
              <linearGradient
                key={n.id}
                id={`grad-${n.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={c.css} stopOpacity="0.18" />
                <stop offset="100%" stopColor={c.css} stopOpacity="0.06" />
              </linearGradient>
            );
          })}
        </defs>

        {/* ── Links ── */}
        {links.map((link, i) => {
          const src = posMap[String(link.source)];
          const tgt = posMap[String(link.target)];
          if (!src || !tgt) return null;

          const srcCat = getCat(src.category);
          const midX = (src.x + tgt.x) / 2;
          const midY = (src.y + tgt.y) / 2 - 20;
          const isRoot =
            String(link.source) === String(nodes[0]?.id) ||
            String(link.target) === String(nodes[0]?.id);

          return (
            <g key={i}>
              <path
                d={`M${src.x},${src.y} Q${midX},${midY} ${tgt.x},${tgt.y}`}
                stroke={srcCat.css}
                strokeWidth={isRoot ? 1.8 : 1.2}
                strokeOpacity={isRoot ? 0.55 : 0.35}
                fill="none"
                strokeDasharray={isRoot ? "none" : "5,4"}
                markerEnd={`url(#arrow-${src.category || "default"})`}
              />
              {/* Link label */}
              {link.label && (
                <text
                  x={midX}
                  y={midY - 5}
                  textAnchor="middle"
                  fontSize="9"
                  fill={srcCat.css}
                  opacity="0.7"
                  fontFamily="monospace"
                >
                  {link.label}
                </text>
              )}
            </g>
          );
        })}

        {/* ── Nodes ── */}
        {positioned.map((node, idx) => {
          const c = getCat(node.category);
          const isRoot = idx === 0;
          const isSel =
            selectedId === String(node.id) || selectedId === node.id;
          const label = node.label || "";
          const words = label.split(" ");

          // Break label into up to 3 lines of ~14 chars
          const lines = [];
          let cur = "";
          words.forEach((w) => {
            if ((cur + " " + w).trim().length <= 16) {
              cur = (cur + " " + w).trim();
            } else {
              if (cur) lines.push(cur);
              cur = w;
            }
          });
          if (cur) lines.push(cur);
          const maxLines = lines.slice(0, 3);

          const boxW = isRoot
            ? 130
            : Math.min(120, Math.max(80, label.length * 6.5));
          const boxH = isRoot ? 52 : Math.max(40, maxLines.length * 15 + 20);
          const rx = isRoot ? 16 : 12;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick(node);
              }}
              style={{ cursor: "pointer" }}
            >
              {/* Glow ring for selected */}
              {isSel && (
                <rect
                  x={-boxW / 2 - 4}
                  y={-boxH / 2 - 4}
                  width={boxW + 8}
                  height={boxH + 8}
                  rx={rx + 4}
                  fill="none"
                  stroke={c.css}
                  strokeWidth="2"
                  opacity="0.6"
                  filter="url(#glow-node)"
                />
              )}

              {/* Node card background */}
              <rect
                x={-boxW / 2}
                y={-boxH / 2}
                width={boxW}
                height={boxH}
                rx={rx}
                fill={`url(#grad-${node.id})`}
                stroke={c.css}
                strokeWidth={isRoot ? 2 : 1.2}
                strokeOpacity={isRoot ? 0.9 : 0.65}
                filter={isRoot ? "url(#glow-core)" : undefined}
              />

              {/* Category dot */}
              <circle
                cx={-boxW / 2 + 10}
                cy={-boxH / 2 + 10}
                r="3"
                fill={c.css}
                opacity="0.9"
              />

              {/* Label text */}
              {maxLines.map((line, li) => {
                const totalH = maxLines.length * 15;
                const startY = -totalH / 2 + li * 15 + (isRoot ? 2 : 0);
                return (
                  <text
                    key={li}
                    x="0"
                    y={startY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isRoot ? 13 : 11}
                    fontWeight={isRoot ? "700" : "600"}
                    fill={isRoot ? c.css : "#e2e8f0"}
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {line}
                  </text>
                );
              })}

              {/* Category badge at bottom */}
              {!isRoot && (
                <text
                  x="0"
                  y={boxH / 2 - 6}
                  textAnchor="middle"
                  fontSize="8"
                  fill={c.css}
                  opacity="0.8"
                  fontFamily="monospace"
                  letterSpacing="0.5"
                >
                  {(node.category || "concept").toUpperCase()}
                </text>
              )}

              {/* Pulse ring on root node */}
              {isRoot && (
                <circle
                  r={boxW * 0.62}
                  fill="none"
                  stroke={c.css}
                  strokeWidth="1"
                  opacity="0.2"
                >
                  <animate
                    attributeName="r"
                    values={`${boxW * 0.55};${boxW * 0.7};${boxW * 0.55}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.25;0;0.25"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   3D GRAPH VIEW — orbit / galaxy mode
══════════════════════════════════════════════════════════════════ */
function Graph3D({ nodes, links, onNodeClick }) {
  const containerRef = useRef(null);
  const labelLayerRef = useRef(null);
  const sceneDataRef = useRef(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    autoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;
    const W = containerRef.current.clientWidth;
    const H = containerRef.current.clientHeight || 480;

    /* Scene */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b14, 0.002);
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 800);
    camera.position.set(0, 0, 150);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x070b14, 1);
    containerRef.current.replaceChildren(renderer.domElement);

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dl1 = new THREE.DirectionalLight(0x06b6d4, 2.2);
    dl1.position.set(80, 80, 100);
    scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0xa855f7, 1.5);
    dl2.position.set(-80, -80, -60);
    scene.add(dl2);

    /* Stars */
    const sBuf = new Float32Array(600 * 3);
    for (let i = 0; i < sBuf.length; i++) sBuf[i] = (Math.random() - 0.5) * 700;
    const stars = new THREE.Points(
      Object.assign(new THREE.BufferGeometry(), {
        attributes: { position: new THREE.BufferAttribute(sBuf, 3) },
      }),
      new THREE.PointsMaterial({
        color: 0x1e293b,
        size: 1.3,
        transparent: true,
        opacity: 0.55,
      }),
    );
    scene.add(stars);

    /* Graph */
    const group = new THREE.Group();
    scene.add(group);
    const meshes = [];
    const posMap = new Map();

    nodes.forEach((node, idx) => {
      let x = 0,
        y = 0,
        z = 0;
      if (idx > 0) {
        const phi = Math.acos(-1 + (2 * (idx - 1)) / (nodes.length - 1 || 1));
        const theta = Math.sqrt((nodes.length - 1) * Math.PI) * phi;
        const r = 55 + (idx % 2 === 0 ? 15 : -10);
        x = r * Math.cos(theta) * Math.sin(phi);
        y = r * Math.sin(theta) * Math.sin(phi);
        z = r * Math.cos(phi);
      }
      const pos = new THREE.Vector3(x, y, z);
      posMap.set(String(node.id), pos);

      const c = getCat(node.category);
      const size = idx === 0 ? 9 : Math.max(4, (node.val || 8) * 0.45);
      const mat = new THREE.MeshStandardMaterial({
        color: c.hex,
        emissive: c.hex,
        emissiveIntensity: idx === 0 ? 0.8 : 0.35,
        roughness: 0.1,
        metalness: 0.9,
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 32, 32), mat);
      mesh.position.copy(pos);
      mesh.userData = { ...node, origEmissive: idx === 0 ? 0.8 : 0.35, size };

      if (idx === 0) {
        mesh.add(
          new THREE.Mesh(
            new THREE.SphereGeometry(size * 1.6, 24, 24),
            new THREE.MeshBasicMaterial({
              color: c.hex,
              transparent: true,
              opacity: 0.1,
              wireframe: true,
            }),
          ),
        );
      }
      group.add(mesh);
      meshes.push(mesh);
    });

    /* Links — bright gradient tubes */
    links.forEach((link) => {
      const src = posMap.get(String(link.source));
      const tgt = posMap.get(String(link.target));
      if (!src || !tgt) return;
      const pts = [src.clone(), tgt.clone()];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const srcCat = nodes.find((n) => String(n.id) === String(link.source));
      const color = getCat(srcCat?.category).hex;
      group.add(
        new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0.5,
          }),
        ),
      );
    });

    /* Controls */
    let dragging = false,
      prevM = { x: 0, y: 0 };
    const ray = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9999, -9999);

    const onMD = (e) => {
      dragging = true;
      prevM = { x: e.clientX, y: e.clientY };
    };
    const onMM = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      if (dragging) {
        group.rotation.y += (e.clientX - prevM.x) * 0.007;
        group.rotation.x += (e.clientY - prevM.y) * 0.007;
        prevM = { x: e.clientX, y: e.clientY };
      }
    };
    const onMU = () => {
      dragging = false;
    };
    const onWhl = (e) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + e.deltaY * 0.09,
        40,
        260,
      );
    };
    const onClick = () => {
      ray.setFromCamera(mouse, camera);
      const h = ray.intersectObjects(meshes);
      if (h.length > 0) onNodeClick(h[0].object.userData);
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onMD);
    domEl.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup", onMU);
    domEl.addEventListener("wheel", onWhl, { passive: false });
    domEl.addEventListener("click", onClick);

    /* Resize */
    const onResize = () => {
      if (!containerRef.current) return;
      const nW = containerRef.current.clientWidth;
      const nH = containerRef.current.clientHeight || 480;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener("resize", onResize);

    /* Store scene data for label projection */
    sceneDataRef.current = { camera, group, meshes, renderer };

    /* Labels — update DOM directly each frame */
    const labelEls = meshes.map((mesh, i) => {
      const div = document.createElement("div");
      div.style.cssText = `
        position:absolute; pointer-events:none; text-align:center;
        transform:translate(-50%, -50%);
        transition: opacity 0.2s;
      `;
      div.innerHTML = `
        <div style="
          background:${getCat(nodes[i].category).bg};
          border:1px solid ${getCat(nodes[i].category).border};
          border-radius:${i === 0 ? "10px" : "8px"};
          padding:${i === 0 ? "5px 10px" : "3px 8px"};
          backdrop-filter:blur(8px);
          max-width:${i === 0 ? "130px" : "110px"};
          box-shadow: 0 2px 12px ${getCat(nodes[i].category).css}33;
        ">
          <div style="
            color:${i === 0 ? getCat(nodes[i].category).css : "#e2e8f0"};
            font-size:${i === 0 ? "11px" : "10px"};
            font-weight:${i === 0 ? "700" : "600"};
            line-height:1.3;
            font-family:Inter,system-ui,sans-serif;
            white-space:normal;
            word-break:break-word;
          ">${nodes[i].label || ""}</div>
          ${i !== 0 ? `<div style="color:${getCat(nodes[i].category).css};font-size:8px;font-family:monospace;opacity:0.8;margin-top:2px;text-transform:uppercase;letter-spacing:0.3px">${nodes[i].category || "concept"}</div>` : ""}
        </div>
      `;
      labelLayerRef.current?.appendChild(div);
      return div;
    });

    const vProj = new THREE.Vector3();

    /* Animation loop */
    let rafId;
    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (autoRotateRef.current && !dragging) {
        group.rotation.y += 0.003;
        stars.rotation.y -= 0.0003;
      }
      meshes.forEach((m, i) => {
        const s = 1 + Math.sin(t * 1.6 + i * 0.7) * 0.03;
        m.scale.set(s, s, s);
      });

      /* Hover */
      ray.setFromCamera(mouse, camera);
      const hits = ray.intersectObjects(meshes);
      domEl.style.cursor = hits.length > 0 ? "pointer" : "grab";
      meshes.forEach((m) => {
        m.material.emissiveIntensity = m.userData.origEmissive;
      });
      if (hits.length > 0) hits[0].object.material.emissiveIntensity = 1.1;

      renderer.render(scene, camera);

      /* Project node world positions → screen → move label divs */
      if (!labelLayerRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      meshes.forEach((mesh, i) => {
        vProj.copy(mesh.position);
        vProj.applyMatrix4(group.matrixWorld);
        vProj.project(camera);
        const sx = (vProj.x * 0.5 + 0.5) * rect.width;
        const sy = (-vProj.y * 0.5 + 0.5) * rect.height;
        // Offset label above the sphere
        const size = mesh.userData.size || 6;
        const approxPixelSize =
          (size / (camera.position.z - vProj.z)) *
          (H / Math.tan((camera.fov * Math.PI) / 360)) *
          0.5;
        labelEls[i].style.left = `${sx}px`;
        labelEls[i].style.top = `${sy - Math.max(16, approxPixelSize) - 10}px`;
        labelEls[i].style.opacity = vProj.z < 1 ? "1" : "0";
      });
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      domEl.removeEventListener("mousedown", onMD);
      domEl.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup", onMU);
      domEl.removeEventListener("wheel", onWhl);
      domEl.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      labelEls.forEach((el) => el.remove());
    };
  }, [nodes, links]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
      {/* HTML label layer */}
      <div
        ref={labelLayerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      />
      {/* Rotate toggle */}
      <button
        onClick={() => setIsAutoRotate((v) => !v)}
        className="absolute bottom-3 left-3 glass px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 text-slate-300 hover:text-white transition pointer-events-auto"
      >
        {isAutoRotate ? (
          <Pause className="w-3 h-3 text-cyan-400" />
        ) : (
          <Play className="w-3 h-3" />
        )}
        <span className="font-mono">{isAutoRotate ? "Pause" : "Rotate"}</span>
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN EXPORT — switches between 2D map and 3D globe
══════════════════════════════════════════════════════════════════ */
export default function ThreeGraphView({ graphData, query }) {
  const [viewMode, setViewMode] = useState("map"); // 'map' | '3d'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const nodes = graphData?.nodes || [];
  const links = graphData?.links || [];
  const usedCats = [...new Set(nodes.map((n) => n.category).filter(Boolean))];

  if (nodes.length === 0) return null;

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#070b14] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-300
      ${isFullscreen ? "fixed inset-3 z-50" : "h-[540px]"}`}
    >
      {/* ── Header Bar ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2.5 glass-dark border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          {/* Title */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono font-bold text-slate-100">
              Knowledge Graph
            </span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
              {nodes.length} concepts
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700/50">
              {links.length} links
            </span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900/80 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                viewMode === "map"
                  ? "bg-cyan-500 text-black"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>2D Map</span>
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                viewMode === "3d"
                  ? "bg-cyan-500 text-black"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Network className="w-3 h-3" />
              <span>3D Globe</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="glass p-1.5 rounded-lg text-slate-400 hover:text-white transition"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Canvas Area ── */}
      <div className="absolute inset-0 top-11">
        {viewMode === "map" ? (
          <MindMap
            nodes={nodes}
            links={links}
            onNodeClick={setSelectedNode}
            selectedId={selectedNode?.id}
          />
        ) : (
          <Graph3D nodes={nodes} links={links} onNodeClick={setSelectedNode} />
        )}
      </div>

      {/* ── Node Info Panel (slides in from right) ── */}
      {selectedNode && (
        <div className="absolute top-12 right-2 bottom-2 w-64 z-30 animate-slide-right glass-dark border border-slate-700/50 rounded-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div
            className="px-3 py-2.5 border-b border-slate-800 flex-shrink-0 flex items-center justify-between"
            style={{
              background: `linear-gradient(135deg, ${getCat(selectedNode.category).css}22, transparent)`,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getCat(selectedNode.category).css,
                  boxShadow: `0 0 6px ${getCat(selectedNode.category).css}`,
                }}
              />
              <span className="text-xs font-bold text-white truncate max-w-[140px]">
                {selectedNode.label}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-500 hover:text-slate-200 transition flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            <div
              className="p-2.5 rounded-lg text-xs border"
              style={{
                background: getCat(selectedNode.category).bg,
                borderColor: `${getCat(selectedNode.category).css}44`,
              }}
            >
              <p
                className="text-[10px] uppercase font-mono tracking-wider mb-1 opacity-70"
                style={{ color: getCat(selectedNode.category).css }}
              >
                {selectedNode.category || "concept"}
              </p>
              <p className="text-slate-200 leading-relaxed text-xs">
                {selectedNode.description ||
                  "A key concept in this knowledge graph. Click other nodes to explore."}
              </p>
            </div>

            {/* Related nodes */}
            {(() => {
              const related = links
                .filter(
                  (l) =>
                    String(l.source) === String(selectedNode.id) ||
                    String(l.target) === String(selectedNode.id),
                )
                .map((l) => {
                  const otherId =
                    String(l.source) === String(selectedNode.id)
                      ? String(l.target)
                      : String(l.source);
                  const other = nodes.find((n) => String(n.id) === otherId);
                  return other ? { node: other, label: l.label } : null;
                })
                .filter(Boolean);

              return related.length > 0 ? (
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-2">
                    Connected to
                  </p>
                  <div className="space-y-1.5">
                    {related.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedNode(r.node)}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 transition text-left"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: getCat(r.node.category).css,
                          }}
                        />
                        <span className="text-xs text-slate-200 truncate flex-1">
                          {r.node.label}
                        </span>
                        {r.label && (
                          <span className="text-[9px] font-mono text-slate-600">
                            {r.label}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* ── Category Legend ── */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
        <div className="glass px-2.5 py-2 rounded-xl flex flex-wrap gap-x-3 gap-y-1 max-w-[260px]">
          {usedCats.map((cat) => (
            <div key={cat} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getCat(cat).css }}
              />
              <span className="text-[10px] text-slate-400 capitalize font-mono">
                {cat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom hint (only for 2D) */}
      {viewMode === "map" && (
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none text-[10px] font-mono text-slate-600 glass px-2 py-1 rounded-lg">
          Click node to inspect · Drag to pan · Scroll to zoom
        </div>
      )}
      {viewMode === "3d" && (
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none text-[10px] font-mono text-slate-600 glass px-2 py-1 rounded-lg">
          Drag to orbit · Scroll to zoom · Click to inspect
        </div>
      )}
    </div>
  );
}
