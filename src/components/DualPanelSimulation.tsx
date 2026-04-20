"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AISimulationRenderer } from "@/components/AISimulationRenderer";
import type { TeacherScriptStep } from "@/lib/aiSimulationGenerator";

interface DualPanelSimulationProps {
    panelAHtml: string;
    panelBHtml: string;
    primaryPanel: "panel_a" | "panel_b";
    syncRequired: boolean;
    sharedStates: string[];
    script: TeacherScriptStep[] | null;
    conceptId?: string;
    /** Phase 4: variant entry state from pill click (e.g. "STATE_2") */
    variantEntryState?: string;
    /** Phase 4: ordered list of states to play for this variant (e.g. ["STATE_2","STATE_3","STATE_5","STATE_6"]) */
    variantStateSequence?: string[];
    /** External refs so the parent (TeacherPlayer via LearnConceptTab) can
     *  postMessage directly into the iframes this component renders. Without
     *  these, the parent's clickable state strip has no reachable target and
     *  SET_STATE messages silently no-op. */
    externalPrimaryRef?: React.RefObject<HTMLIFrameElement | null>;
    externalSecondaryRef?: React.RefObject<HTMLIFrameElement | null>;
}

export default function DualPanelSimulation({
    panelAHtml,
    panelBHtml,
    primaryPanel,
    syncRequired,
    sharedStates,
    script,
    conceptId,
    variantEntryState,
    variantStateSequence,
    externalPrimaryRef,
    externalSecondaryRef,
}: DualPanelSimulationProps) {
    // Compose external refs (from LearnConceptTab → TeacherPlayer) with local
    // ones. When a parent passes a RefObject, use it as the iframe ref directly
    // so both this component's sync bridge AND the parent's SET_STATE postMessage
    // target the same DOM node. When omitted, we fall back to internal refs.
    const localPanelARef = useRef<HTMLIFrameElement | null>(null);
    const localPanelBRef = useRef<HTMLIFrameElement | null>(null);
    const panelARef = externalPrimaryRef ?? localPanelARef;
    const panelBRef = externalSecondaryRef ?? localPanelBRef;

    // Refs to track ready state inside the message handler closure
    const panelAReadyRef = useRef(false);
    const panelBReadyRef = useRef(false);
    const currentStateRef = useRef("STATE_1");

    const [panelAReady, setPanelAReady] = useState(false);
    const [panelBReady, setPanelBReady] = useState(false);
    const [currentState, setCurrentState] = useState("STATE_1");
    const [pendingState, setPendingState] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState(0);

    // ── Resizable dividers state ─────────────────────────────────────────
    const [leftPanelPct, setLeftPanelPct] = useState(
        primaryPanel === 'panel_a' ? 62 : 38
    );
    const [isDragging, setIsDragging] = useState(false);
    const draggingDividerRef = useRef<null | 'horizontal' | 'vertical'>(null);
    const dragStartRef = useRef({ y: 0, x: 0, startHeight: 0, startPct: 0 });
    const containerRef = useRef<HTMLDivElement | null>(null);

    // ── postMessage sync bridge ──────────────────────────────────────────
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const { type, state } = event.data ?? {};

            if (type === "SIM_READY") {
                const matchA = event.source === panelARef.current?.contentWindow;
                const matchB = event.source === panelBRef.current?.contentWindow;

                if (matchA) {
                    panelAReadyRef.current = true;
                    setPanelAReady(true);
                    console.log("[DualPanel] Panel A SIM_READY received (source match)");
                } else if (matchB) {
                    panelBReadyRef.current = true;
                    setPanelBReady(true);
                    console.log("[DualPanel] Panel B SIM_READY received (source match)");
                } else {
                    // Fallback: event.source comparison fails with sandboxed srcDoc iframes
                    console.log("[DualPanel] SIM_READY received — event.source unmatched, using fallback");
                    if (!panelAReadyRef.current) {
                        panelAReadyRef.current = true;
                        setPanelAReady(true);
                        console.log("[DualPanel] Panel A set ready (fallback)");
                    } else if (!panelBReadyRef.current) {
                        panelBReadyRef.current = true;
                        setPanelBReady(true);
                        console.log("[DualPanel] Panel B set ready (fallback)");
                    }
                }
            }

            if (type === "STATE_REACHED") {
                console.log("[DualPanel] state reached:", state);
            }

            if (type === 'PARAM_UPDATE') {
                // Data-driven bilateral relay. Source panel already applied the
                // value locally; the other panel picks it up via its own
                // PARAM_UPDATE listener. Echo-guarded on both sides
                // (PM_sliderLastEmitted in parametric_renderer, lastEmitted in
                // graph_interactive_renderer) so ping-pong dies in one hop.
                const msg = event.data;
                const isFromA = event.source === panelARef.current?.contentWindow;
                const isFromB = event.source === panelBRef.current?.contentWindow;
                if (isFromA) {
                    panelBRef.current?.contentWindow?.postMessage(msg, '*');
                } else if (isFromB) {
                    panelARef.current?.contentWindow?.postMessage(msg, '*');
                } else {
                    // srcDoc-sandboxed iframes sometimes fail event.source match.
                    // Relay to both; receivers ignore self-echoes.
                    panelARef.current?.contentWindow?.postMessage(msg, '*');
                    panelBRef.current?.contentWindow?.postMessage(msg, '*');
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    // ── Send state to both panels simultaneously ─────────────────────────
    const sendStateToAll = useCallback(
        (stateName: string) => {
            if (!panelAReady || !panelBReady) {
                setPendingState(stateName);
                console.log("[sync] queued state:", stateName, "— panels not ready");
                return;
            }

            const message = { type: "SET_STATE", state: stateName };
            panelARef.current?.contentWindow?.postMessage(message, "*");
            panelBRef.current?.contentWindow?.postMessage(message, "*");

            console.log("[sync] sent", stateName, "to both panels");
            setCurrentState(stateName);
            currentStateRef.current = stateName;
        },
        [panelAReady, panelBReady]
    );

    // ── Send initial/pending state once both panels are ready ─────────────
    useEffect(() => {
        if (panelAReady && panelBReady) {
            console.log('[DualPanel] bothReady fired, sending SET_STATE to both iframes');
            if (pendingState) {
                sendStateToAll(pendingState);
                setPendingState(null);
            } else if (currentState === 'STATE_1') {
                // Both panels just became ready — send initial STATE_1
                const message = { type: 'SET_STATE', state: 'STATE_1' };
                panelARef.current?.contentWindow?.postMessage(message, '*');
                panelBRef.current?.contentWindow?.postMessage(message, '*');
                console.log('[DualPanel] initial STATE_1 sent to both panels');
            }
        }
    }, [panelAReady, panelBReady, pendingState, sendStateToAll, currentState]);

    // Phase 4: when variant pill is clicked, parent passes new variantStateSequence.
    // Send the first state in the sequence to both panels AND reset activeStep so
    // the strip highlights the new starting position. Mirrors TeacherPlayer's pattern.
    const prevSequenceRef = useRef<string>('');
    useEffect(() => {
        if (!panelAReady || !panelBReady) return;
        const sequenceKey = (variantStateSequence ?? []).join(',') + '|' + (variantEntryState ?? '');
        if (sequenceKey === prevSequenceRef.current) return;
        prevSequenceRef.current = sequenceKey;

        const hasSequence = !!(variantStateSequence && variantStateSequence.length > 0);
        const startState = hasSequence
            ? (variantStateSequence![0] ?? variantEntryState ?? 'STATE_1')
            : (variantEntryState ?? 'STATE_1');
        sendStateToAll(startState);
        setActiveStep(0);
        console.log('[DualPanel] variant switch → reset to:', startState,
                    '| sequence:', variantStateSequence ?? 'default');
    }, [variantStateSequence, variantEntryState, panelAReady, panelBReady, sendStateToAll]);

    // ── Divider drag handlers ────────────────────────────────────────────
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!draggingDividerRef.current) return;
            if (draggingDividerRef.current === 'vertical') {
                const containerW = containerRef.current?.offsetWidth ?? 800;
                const dx = e.clientX - dragStartRef.current.x;
                const dxPct = (dx / containerW) * 100;
                const next = Math.max(20, Math.min(80, dragStartRef.current.startPct + dxPct));
                setLeftPanelPct(next);
            }
        };
        const handleMouseUp = () => {
            if (!draggingDividerRef.current) return;
            draggingDividerRef.current = null;
            setIsDragging(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleVerticalDragStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        draggingDividerRef.current = 'vertical';
        dragStartRef.current = { y: 0, x: e.clientX, startHeight: 0, startPct: leftPanelPct };
        setIsDragging(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [leftPanelPct]);

    // displayedSteps: when variantStateSequence is set, filter script to that subset
    // (preserving sequence order). Otherwise show the full script.
    const displayedSteps = useMemo(() => {
        if (!script) return [];
        if (!variantStateSequence || variantStateSequence.length === 0) return script;
        return variantStateSequence
            .map(st => script.find(s => s.sim_state === st))
            .filter((s): s is TeacherScriptStep => !!s);
    }, [script, variantStateSequence]);

    // ── Step click handler ───────────────────────────────────────────────
    const handleStepClick = useCallback(
        (stepIdx: number) => {
            const step = displayedSteps[stepIdx];
            if (!step) return;
            const targetState = step.sim_state || `STATE_${stepIdx + 1}`;
            sendStateToAll(targetState);
            setActiveStep(stepIdx);
        },
        [displayedSteps, sendStateToAll]
    );

    const bothReady = panelAReady && panelBReady;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
            {/* Two panels side by side — fills remaining height */}
            <div ref={containerRef} className="dual-panel-container" style={{ flex: 1, display: "flex", flexDirection: "row", minHeight: 0 }}>
                <div style={{ width: `calc(${leftPanelPct}% - 3px)`, height: '100%', overflow: 'hidden', pointerEvents: isDragging ? 'none' : 'auto' }}>
                    <AISimulationRenderer
                        simHtml={panelAHtml}
                        concept={conceptId ?? ""}
                        iframeRef={panelARef}
                    />
                </div>
                {/* Vertical divider — drag to resize panel widths */}
                <div
                    onMouseDown={handleVerticalDragStart}
                    style={{
                        width: 6,
                        flexShrink: 0,
                        background: '#1a1f2e',
                        cursor: 'col-resize',
                        borderLeft: '1px solid #0a0d14',
                        borderRight: '1px solid #0a0d14',
                    }}
                />
                <div style={{ width: `calc(${100 - leftPanelPct}% - 3px)`, height: '100%', overflow: 'hidden', pointerEvents: isDragging ? 'none' : 'auto' }}>
                    <AISimulationRenderer
                        simHtml={panelBHtml}
                        concept={conceptId ?? ""}
                        iframeRef={panelBRef}
                    />
                </div>
            </div>

            {/* Minimal sync-status glyph — bottom-right dot only, label in tooltip.
                 Avoids the persistent "Panels in sync" text that read as UI noise. */}
            {script && script.length > 0 && (
                <div
                    title={bothReady ? "Both panels are synced" : "Syncing panels…"}
                    style={{
                        position: 'absolute', bottom: 6, right: 10, zIndex: 4,
                        width: 7, height: 7, borderRadius: '50%',
                        background: bothReady ? '#4ade80' : '#fbbf24',
                        boxShadow: bothReady ? '0 0 6px rgba(74,222,128,0.45)' : undefined,
                        pointerEvents: 'auto', cursor: 'help',
                    }}
                />
            )}
        </div>
    );
}
