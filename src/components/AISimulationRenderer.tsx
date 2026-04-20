"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Props — v3 architecture: just render simHtml in an iframe
// ─────────────────────────────────────────────────────────────────────────────

export interface AISimulationRendererProps {
  simHtml: string | null;
  isLoading?: boolean;
  concept?: string;
  /** Phase 2D: ref forwarded to the iframe for postMessage sync */
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  /** Suppress the bottom-right zoom overlay — use when an outer shell already
   *  renders the zoom/pan hint (avoids the duplicated overlay in dual layouts). */
  hideZoomOverlay?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Physics facts for the loading card
// ─────────────────────────────────────────────────────────────────────────────

const PHYSICS_FACTS = [
  "⚡ Drift velocity of electrons is only ~1mm per second",
  "🔬 Copper has 8.5 × 10²⁸ free electrons per cubic metre",
  "💡 Electric field propagates at nearly the speed of light",
  "🌊 Thermal velocity of electrons is ~10⁶ m/s",
  "⚛️ A hydrogen atom is 99.9999999% empty space",
  "🧲 Magnetic field lines always form closed loops",
  "🔭 Light from Sun takes 8 min 20 sec to reach Earth",
  "🪐 If Earth were smooth, Everest would be a tiny bump",
];

// ─────────────────────────────────────────────────────────────────────────────
// Loading card with cycling physics facts
// ─────────────────────────────────────────────────────────────────────────────

function SimulationLoadingCard({ concept }: { concept: string }) {
  const [factIndex, setFactIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setFactIndex((i) => (i + 1) % PHYSICS_FACTS.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 300,
        background: "#0a0d14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 24,
      }}
    >
      {/* Animated pulse dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#3b82f6",
              animation: `simPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Cycling fact */}
      <div
        style={{
          opacity: fade ? 1 : 0,
          transition: "opacity 0.3s ease",
          color: "#94a3b8",
          fontSize: 15,
          textAlign: "center",
          maxWidth: 380,
          lineHeight: 1.6,
        }}
      >
        {PHYSICS_FACTS[factIndex]}
      </div>

      {/* Concept label */}
      <div style={{ color: "#475569", fontSize: 12 }}>
        Building simulation for {concept || "this concept"}…
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes simPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state — no simulation available
// ─────────────────────────────────────────────────────────────────────────────

function SimulationEmptyState() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 200,
        background: "#0f1117",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#4b5563",
        fontSize: 13,
      }}
    >
      No simulation available
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main renderer — v3: iframe with srcDoc + scroll-to-zoom
// No JSON parsing. No pre-built engines. Just render the HTML.
// ─────────────────────────────────────────────────────────────────────────────

export function AISimulationRenderer({
  simHtml,
  isLoading = false,
  concept = "",
  iframeRef,
  hideZoomOverlay = false,
}: AISimulationRendererProps) {
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale(prev => {
      const next = Math.min(2.0, Math.max(0.5, parseFloat((prev + delta).toFixed(2))));
      if (next <= 1) { setPanX(0); setPanY(0); }
      return next;
    });
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (scale <= 1) return; // only pan when zoomed in
    isPanningRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    const el = wrapperRef.current;
    if (el) el.style.cursor = 'grabbing';
  }, [scale]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setPanX(prev => {
      const maxPan = (scale - 1) *
        (wrapperRef.current?.offsetWidth ?? 800) / 2;
      return Math.max(-maxPan, Math.min(maxPan, prev + dx));
    });
    setPanY(prev => {
      const maxPan = (scale - 1) *
        (wrapperRef.current?.offsetHeight ?? 600) / 2;
      return Math.max(-maxPan, Math.min(maxPan, prev + dy));
    });
  }, [scale]);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
    const el = wrapperRef.current;
    if (el) el.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
  }, [scale]);

  const handleDblClick = useCallback(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mouseleave', handleMouseUp);
    el.addEventListener('dblclick', handleDblClick);
    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mouseleave', handleMouseUp);
      el.removeEventListener('dblclick', handleDblClick);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleDblClick]);

  // Loading state
  if (isLoading && !simHtml) {
    return (
      <div style={{ width: "100%", height: "100%", minHeight: 300, background: "#0a0d14" }}>
        <SimulationLoadingCard concept={concept} />
      </div>
    );
  }

  // No HTML available
  if (!simHtml) {
    return <SimulationEmptyState />;
  }

  // Render simulation with scroll-to-zoom
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#0a0a14",
      }}
    >
      {/* Zoom wrapper — captures wheel events */}
      <div
        ref={wrapperRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: scale > 1
            ? (isPanningRef.current ? 'grabbing' : 'grab')
            : 'zoom-in',
        }}
      >
        <iframe
          ref={iframeRef}
          srcDoc={simHtml}
          style={{
            display: "block",
            border: "none",
            background: "#0f1117",
            // Scale the iframe content; compensate dimensions so borders don't clip
            width: `${100 / scale}%`,
            height: `${100 / scale}%`,
            transform: `scale(${scale}) translate(${panX / scale}px, ${panY / scale}px)`,
            transformOrigin: "center center",
          }}
          sandbox="allow-scripts allow-same-origin"
          title={`${concept} simulation`}
        />
        {/* Mask over the top-left corner where pre-fix cached sims still render
             the "[pcpl] concept_id / STATE_N" debug text. The line was removed
             from the renderer, but existing simulation_cache rows still contain
             it. This overlay matches the canvas background so it is invisible
             when the text isn't there and hides it when it is. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: 260, height: 22,
            background: "#0f1117",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Zoom indicator — bottom right. Outer shells that already render a
           global zoom/pan hint can set hideZoomOverlay to avoid duplication. */}
      {!hideZoomOverlay && (
        <div
          title="Scroll to zoom · drag to pan · double-click to reset"
          style={{
            position: "absolute",
            bottom: 6,
            right: 8,
            background: "rgba(0,0,0,0.55)",
            color: "#94a3b8",
            borderRadius: 4,
            padding: "1px 6px",
            fontSize: 10,
            pointerEvents: "none",
            userSelect: "none",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
}

export default AISimulationRenderer;
