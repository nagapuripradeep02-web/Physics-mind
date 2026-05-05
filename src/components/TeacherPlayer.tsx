"use client";

import { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { Play, Pause, RotateCcw, BookOpen, Loader2, X } from "lucide-react";
import type { Lesson, TeachingStep } from "@/lib/teacherEngine";
import { AISimulationRenderer } from "@/components/AISimulationRenderer";
import type { TeacherScriptStep } from "@/lib/aiSimulationGenerator";
import { getPanelConfig, type ConceptPanelConfig } from "@/config/panelConfig";
import { BeliefProbeCard } from "@/components/sections/BeliefProbeCard";
import DeepDiveFeedbackThumbs from "@/components/DeepDiveFeedbackThumbs";

// Inline deep-dive sub-state shape (Phase D inline UX). One entry per sub-pill
// (3a, 3b, 3c, 3d). Populated from /api/deep-dive payload by LearnConceptTab
// when the concept is in INLINE_DEEP_DIVE_CONCEPTS.
export interface DeepDiveSubState {
    /** Unique id, e.g., "STATE_3_DEEPDIVE_1" — never overlaps with parent state ids. */
    sub_state_id: string;
    /** Parent state this deep-dive was triggered from (e.g., "STATE_3"). */
    parent_state_id: string;
    /** Display label on the sub-pill, e.g., "3a", "3b". */
    label: string;
    /** PCPL primitives for the sub-scene. Rendered via inline_scene_composition postMessage. */
    scene_composition: unknown[];
    /** Teacher script text for this sub-state. */
    teacher_text: string;
    /** Optional variable overrides for the sub-state (e.g., force theta=45 for a worked example). */
    variables?: Record<string, number>;
    /** Per-sub-state Indian real-world anchor (overrides the parent concept's
     *  global anchor on the EXAMPLE tag while this sub-state is active). */
    example_anchor?: string;
}

interface TeacherPlayerProps {
    lesson: Lesson;
    simHtml?: string | null;
    isLoadingSim?: boolean;
    compact?: boolean;
    /** Phase 2D: AI-generated script steps aligned to simulation states */
    aiScript?: TeacherScriptStep[] | null;
    /**
     * External ref to the VISIBLE simulation iframe (in LearnConceptTab's AISimulationRenderer).
     * When provided, all postMessage sync commands target this iframe instead of the
     * internal simulationIframeRef. This is the fix for the "two separate iframes" bug.
     */
    iframeRef?: React.RefObject<HTMLIFrameElement | null>;
    /** concept_id used to look up panel layout from CONCEPT_PANEL_MAP */
    conceptId?: string;
    /** HTML for the secondary panel in dual layouts (graph, wave, etc.) */
    secondarySimHtml?: string | null;
    /** External ref to the secondary panel iframe (LearnConceptTab wires this in dual layouts) */
    secondaryIframeRef?: React.RefObject<HTMLIFrameElement | null>;
    /** Layer 2: session ID for belief probe feedback */
    sessionId?: string;
    /** Layer 2: student's wrong belief text (from extractStudentConfusion) */
    studentBelief?: string;
    /** Variant system: start at a specific state instead of STATE_1 */
    entryState?: string;
    /** Variant system: ordered list of sim_states to play (filters aiScript steps).
     *  When provided and non-empty, only script steps whose sim_state is in this list
     *  are rendered/played, in the order they appear in steps[]. */
    stateSequence?: string[];
    /** Phase F: callback fired when the "Explain step-by-step" button is clicked.
     *  Receives the current state_id so the parent can open a DeepDiveModal.
     *  When undefined, the button is not rendered. */
    onDeepDiveClick?: (stateId: string) => void;
    /** Phase F: list of state IDs whose JSON has `allow_deep_dive: true`.
     *  The Explain button only renders when the current state is in this list
     *  (CLAUDE.md §23). When undefined, the button is suppressed entirely. */
    allowedDeepDiveStates?: string[];
    /** Inline deep-dive UX (INLINE_DEEP_DIVE_CONCEPTS). When populated, sub-pills
     *  render inline after the parent state pill; the current sub-pill's text
     *  appears in the step-title row; Panel A receives SET_STATE with
     *  inline_scene_composition so the sub-scene renders without a new iframe. */
    deepDiveSubStates?: DeepDiveSubState[] | null;
    /** The parent state id the deep-dive was triggered from (e.g., "STATE_3").
     *  Sub-pills render only next to this pill. null/undefined = no deep-dive active. */
    activeDeepDiveParent?: string | null;
    /** Index into deepDiveSubStates of the currently-playing sub-pill. */
    activeDeepDiveIdx?: number | null;
    /** Status from /api/deep-dive. "pending_review" shows a badge next to the step title. */
    deepDiveStatus?: 'pending_review' | 'served' | 'fresh' | null;
    /** Loading flag — true while /api/deep-dive is in flight (shows a spinner on Explain). */
    deepDiveLoading?: boolean;
    /** Called when the student clicks a sub-pill (by index in deepDiveSubStates). */
    onSubStateClick?: (subIdx: number) => void;
    /** Called to collapse inline sub-pills and return to the parent state. */
    onDeepDiveExit?: () => void;
    /** Phase D: cache row id (deep_dive_cache.id) returned from /api/deep-dive.
     *  When present together with sessionId and an active sub-state, the inline
     *  thumbs-up/down rating control renders under the step-title row. */
    deepDiveCacheId?: string | null;
    /** Fired when the iframe broadcasts STATE_REACHED (student lands on a new state).
     *  Used by LearnConceptTab to keep DrillDownWidget's state_id in sync with the
     *  live current state — without this, Confused? always queries STATE_1. */
    onStateChange?: (state: string) => void;
}


/** Render **bold** markdown spans as React elements (no dangerouslySetInnerHTML). */
function renderBold(text: string): React.ReactNode[] {
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
            ? <strong key={i} className="text-blue-300">{part.slice(2, -2)}</strong>
            : <span key={i}>{part}</span>
    );
}

const LOADING_FACTS = [
    "⚡ Drift velocity of electrons is only ~1 mm per second",
    "🔬 Copper has 8.5 × 10²⁸ free electrons per cubic metre",
    "💡 Electric field signal travels at nearly the speed of light",
    "🌊 Thermal velocity of electrons is ~10⁶ m/s — a million times faster than drift",
    "⚛️ A single hydrogen atom is 99.9999999% empty space",
    "🪐 If Earth were a smooth ball, Mount Everest would be a tiny bump",
    "🔭 Light from the Sun takes 8 minutes 20 seconds to reach Earth",
    "�� Magnetic field lines always form closed loops — they never start or end",
];

export default function TeacherPlayer({ lesson, simHtml, isLoadingSim, compact, aiScript, iframeRef: externalIframeRef, conceptId, secondarySimHtml, secondaryIframeRef: externalSecondaryIframeRef, sessionId, studentBelief, entryState, stateSequence, onDeepDiveClick, allowedDeepDiveStates, deepDiveSubStates, activeDeepDiveParent, activeDeepDiveIdx, deepDiveStatus, deepDiveLoading, onSubStateClick, onDeepDiveExit, deepDiveCacheId, onStateChange }: TeacherPlayerProps) {
    // Step strip uses ONLY aiScript (Stage 4). lesson.teaching_script is never shown in the strip.
    // When aiScript is null/empty, isScriptReady=false and the strip shows a skeleton loader.
    const isScriptReady = !!(aiScript?.length);
    // Phase 4: capture aiScript's sim_state per step so we can filter by stateSequence later.
    // (TeachingStep.sim_state is an object, but TeacherScriptStep.sim_state is a string like "STATE_1".)
    const allSteps: Array<import('@/lib/teacherEngine').TeachingStep & { ai_sim_state?: string }> = isScriptReady
        ? aiScript!.map(s => ({
              id: `ai-${s.step_number}`,
              text: s.text,
              sim_action: 'pause' as const,
              sim_target: '',
              sim_state: {},
              pause_ms: 6000,
              ai_sim_state: s.sim_state,
          }))
        : [];

    // Phase 4: when stateSequence is provided, restrict the played steps by index.
    // Map stateSequence state IDs directly to allSteps by index.
    // EPIC-L steps are always ordered: index 0 = STATE_1, index 1 = STATE_2, etc.
    // This is more reliable than trusting ai_sim_state string matching from Stage 4.
    const steps: Array<import('@/lib/teacherEngine').TeachingStep & { ai_sim_state?: string }> = useMemo(() => {
        if (!stateSequence || stateSequence.length === 0) return allSteps;
        return stateSequence
            .map(st => {
                const idx = parseInt(st.replace('STATE_', ''), 10) - 1;
                return allSteps[idx];
            })
            .filter((s): s is typeof allSteps[number] => !!s);
    }, [allSteps, stateSequence]);

    const [currentIdx, setCurrentIdx] = useState(-1);   // -1 = not started
    const [isPlaying, setIsPlaying] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [factIdx, setFactIdx] = useState(0);
    const [isInteractive, setIsInteractive] = useState(false);
    const [simState, setSimState] = useState<Record<string, number | string>>(lesson.sim_config);
    const [highlighted, setHighlighted] = useState<string | null>(null);
    // Ref to the active sub-pill so we can scroll it into view when the strip
    // overflows horizontally (4-6 sub-pills can push [4][5][✓] off-screen on
    // narrow viewports).
    const activeSubPillRef = useRef<HTMLButtonElement | null>(null);
    useEffect(() => {
        if (activeDeepDiveIdx == null) return;
        const t = setTimeout(() => {
            activeSubPillRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 50);
        return () => clearTimeout(t);
    }, [activeDeepDiveIdx, activeDeepDiveParent]);

    // Panel layout: look up concept_id in CONCEPT_PANEL_MAP; fall back to single if not found
    let panelConfig: ConceptPanelConfig | null = null;
    if (conceptId) {
        try { panelConfig = getPanelConfig(conceptId); } catch { /* concept not registered → single */ }
    }
    const panelLayout = panelConfig?.layout ?? 'single';

    // Phase 2D / 3A-3B: simulation postMessage sync
    // Internal ref used when TeacherPlayer renders its own AISimulationRenderer (non-compact, no external ref)
    const simulationIframeRef = useRef<HTMLIFrameElement>(null);
    // Secondary panel iframe ref (dual layouts only; postMessage targets primary only)
    const secondaryIframeRef = useRef<HTMLIFrameElement>(null);
    // Effective ref: external ref takes priority (LearnConceptTab wires the VISIBLE iframe here)
    const effectiveRef = externalIframeRef ?? simulationIframeRef;
    const [simReady, setSimReady] = useState(false);
    const pendingState = useRef<string | null>(null);
    // Keep onStateChange in a ref so the []-deps message handler always calls
    // the current prop (avoids stale-closure without re-binding the listener).
    const onStateChangeRef = useRef(onStateChange);
    useEffect(() => { onStateChangeRef.current = onStateChange; }, [onStateChange]);
    const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stepListRef = useRef<HTMLDivElement>(null);
    // Phase 4: tracks the last applied (stateSequence|entryState) so the variant-switch
    // reset useEffect only fires when the variant actually changes.
    const prevSequenceRef = useRef<string>('');

    // Cycle facts while simulation is loading
    useEffect(() => {
        if (!isLoadingSim) return;
        setFactIdx(0);
        const id = setInterval(() => setFactIdx(i => (i + 1) % LOADING_FACTS.length), 3000);
        return () => clearInterval(id);
    }, [isLoadingSim]);

    // Auto-start on mount with a small delay
    useEffect(() => {
        const t = setTimeout(() => setIsPlaying(true), 400);
        return () => clearTimeout(t);
    }, []);

    // ── Web Speech TTS ────────────────────────────────────────────────────────
    // Browsers gate speechSynthesis behind a user gesture (Chrome/Edge autoplay
    // policy). A primer utterance is queued on the first pointer/keyboard event
    // anywhere on the page so subsequent automatic speak() calls succeed.
    const ttsVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
    const ttsUnlockedRef = useRef(false);
    const ttsLastTextRef = useRef<string>("");
    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        const pickVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (!voices.length) return;
            ttsVoiceRef.current =
                voices.find(v => /en-IN/i.test(v.lang)) ??
                voices.find(v => /en-GB/i.test(v.lang)) ??
                voices.find(v => /^en/i.test(v.lang)) ??
                voices[0];
            console.log("[TTS] voice:", ttsVoiceRef.current?.name, ttsVoiceRef.current?.lang);
        };
        pickVoice();
        window.speechSynthesis.addEventListener("voiceschanged", pickVoice);

        const unlock = () => {
            if (ttsUnlockedRef.current) return;
            try {
                const primer = new SpeechSynthesisUtterance(" ");
                primer.volume = 0.01;
                window.speechSynthesis.speak(primer);
                ttsUnlockedRef.current = true;
                console.log("[TTS] unlocked by user gesture");
                // If we already have a current sentence queued (auto-start fired before
                // gesture), speak it now that the engine is unlocked.
                if (isPlaying && currentIdx >= 0 && ttsLastTextRef.current) {
                    const u = new SpeechSynthesisUtterance(ttsLastTextRef.current);
                    if (ttsVoiceRef.current) u.voice = ttsVoiceRef.current;
                    u.rate = 0.95;
                    window.speechSynthesis.speak(u);
                }
            } catch (e) {
                console.warn("[TTS] unlock failed", e);
            }
        };
        window.addEventListener("pointerdown", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });

        return () => {
            window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
            window.removeEventListener("pointerdown", unlock);
            window.removeEventListener("keydown", unlock);
            window.speechSynthesis.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        if (!isPlaying || currentIdx < 0) return;
        const sub = (activeDeepDiveParent && deepDiveSubStates && activeDeepDiveIdx != null)
            ? deepDiveSubStates[activeDeepDiveIdx] ?? null
            : null;
        const text = sub ? sub.teacher_text : (steps[currentIdx]?.text ?? "");
        if (!text.trim()) return;
        const clean = text.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
        ttsLastTextRef.current = clean;
        if (!ttsUnlockedRef.current) {
            console.log("[TTS] queued (waiting for user gesture):", clean.slice(0, 60));
            return;
        }
        const u = new SpeechSynthesisUtterance(clean);
        if (ttsVoiceRef.current) u.voice = ttsVoiceRef.current;
        u.rate = 0.95;
        u.pitch = 1.0;
        u.volume = 1.0;
        u.onerror = (e) => console.warn("[TTS] error", e);
        console.log("[TTS] speak:", clean.slice(0, 60));
        window.speechSynthesis.speak(u);
    }, [currentIdx, isPlaying, steps, activeDeepDiveParent, deepDiveSubStates, activeDeepDiveIdx]);

    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        if (!isPlaying) window.speechSynthesis.cancel();
    }, [isPlaying]);

    // Sends SET_STATE to primary panel; also secondary in dual layouts.
    // The msg shape accepts optional `inline_scene_composition` + `inline_variables`
    // for the inline deep-dive sub-state path (parametric_renderer handles them).
    const isDualLayout = panelLayout === 'dual_horizontal' || panelLayout === 'dual_vertical';
    const effectiveSecondaryRef = externalSecondaryIframeRef ?? secondaryIframeRef;
    type SetStateMsg = {
        type: string;
        state: string;
        inline_scene_composition?: unknown[];
        inline_variables?: Record<string, number>;
    };
    const sendToAll = (msg: SetStateMsg) => {
        effectiveRef.current?.contentWindow?.postMessage(msg, '*');
        if (isDualLayout) {
            effectiveSecondaryRef.current?.contentWindow?.postMessage(msg, '*');
        }
    };

    // Sub-pill click handler (inline deep-dive). Posts SET_STATE to Panel A
    // with the sub-state's scene primitives inline so no new iframe is needed.
    // Panel B's graph_interactive_renderer ignores unknown state ids (its
    // applyState is guarded by `if (config.states[stateName])`). Any sub-state
    // `variables` are broadcast as PARAM_UPDATE so Panel B's yellow dot tracks
    // the sub-state's θ/m (F1 fix).
    const handleSubPillClick = (subIdx: number) => {
        if (!deepDiveSubStates || !deepDiveSubStates[subIdx]) return;
        const ss = deepDiveSubStates[subIdx];
        onSubStateClick?.(subIdx);
        sendToAll({
            type: 'SET_STATE',
            state: ss.sub_state_id,
            inline_scene_composition: ss.scene_composition,
            inline_variables: ss.variables,
        });
        if (ss.variables) {
            for (const [k, v] of Object.entries(ss.variables)) {
                if (typeof v !== 'number') continue;
                effectiveRef.current?.contentWindow?.postMessage({ type: 'PARAM_UPDATE', key: k, value: v }, '*');
                if (isDualLayout) {
                    effectiveSecondaryRef.current?.contentWindow?.postMessage({ type: 'PARAM_UPDATE', key: k, value: v }, '*');
                }
            }
        }
    };

    // Listen for postMessage from simulation iframe (SIM_READY + STATE_REACHED)
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (!e.data) return;
            if (e.data.type === 'SIM_READY') {
                console.log('[Sync] SIM_READY received ✅');
                console.log('[Sync] effectiveRef:', effectiveRef.current);
                console.log('[Sync] iframe window:', effectiveRef.current?.contentWindow);
                setSimReady(true);
                if (pendingState.current) {
                    // Student clicked a step while sim was loading — fire now
                    sendToAll({ type: 'SET_STATE', state: pendingState.current });
                    pendingState.current = null;
                } else {
                    // Phase 4: when stateSequence is active, read first state directly from stateSequence[0].
                    // Otherwise fall back to entryState or STATE_1.
                    const startState = (stateSequence && stateSequence.length > 0)
                        ? (stateSequence[0] ?? entryState ?? 'STATE_1')
                        : (entryState ?? 'STATE_1');
                    console.log('[TeacherPlayer] state:', startState, '| sequence:', stateSequence ?? 'default');
                    sendToAll({ type: 'SET_STATE', state: startState });
                    if (stateSequence && stateSequence.length > 0) {
                        // Sequence mode — always start at idx 0 of the filtered steps[]
                        setCurrentIdx(0);
                    } else if (startState !== 'STATE_1') {
                        // Default mode — keep legacy behavior
                        const startIdx = parseInt(startState.replace('STATE_', ''), 10) - 1;
                        if (startIdx > 0 && startIdx < steps.length) {
                            setCurrentIdx(startIdx);
                        }
                    }
                }
            }
            if (e.data.type === 'STATE_REACHED') {
                console.log('[Sync] STATE_REACHED:', e.data.state);
                onStateChangeRef.current?.(e.data.state);
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Phase 4: when variant changes (stateSequence or entryState prop changes),
    // reset the player to the beginning of the new sequence.
    // Gate on simReady — don't fire before the sim has loaded.
    useEffect(() => {
        if (!simReady) return;
        const sequenceKey = (stateSequence ?? []).join(',') + '|' + (entryState ?? '');
        if (sequenceKey === prevSequenceRef.current) return; // no real change
        prevSequenceRef.current = sequenceKey;

        // Phase 4: read first state directly from stateSequence[0] — no ai_sim_state dependency.
        const startState = (stateSequence && stateSequence.length > 0)
            ? (stateSequence[0] ?? entryState ?? 'STATE_1')
            : (entryState ?? 'STATE_1');

        setCurrentIdx(0);
        setIsComplete(false);
        setIsPlaying(false);
        sendToAll({ type: 'SET_STATE', state: startState });
        console.log('[TeacherPlayer] variant switch → reset to:', startState,
                    '| sequence:', stateSequence ?? 'default');
    }, [stateSequence, entryState, simReady]); // eslint-disable-line react-hooks/exhaustive-deps

    // Cache-hit race condition fix:
    // When sim arrives from cache BEFORE TeacherPlayer mounts, the iframe fires SIM_READY
    // before our message listener is registered → simReady stays false forever.
    // Fix: when simHtml prop becomes non-null, proactively check if the iframe is already
    // loaded (contentWindow accessible) and set simReady=true so state sync can proceed.
    useEffect(() => {
        if (!simHtml) return;
        const t = setTimeout(() => {
            if (effectiveRef.current?.contentWindow) {
                setSimReady(prev => {
                    if (prev) return prev; // already ready via SIM_READY message
                    console.log('[Sync] Proactive: iframe already loaded before TeacherPlayer mounted — forcing simReady');
                    return true;
                });
            }
        }, 200);
        return () => clearTimeout(t);
    }, [simHtml]); // eslint-disable-line react-hooks/exhaustive-deps

    // When step changes, sync simulation state (only if sim is ready)
    useEffect(() => {
        if (!simReady || currentIdx < 0) return;
        // Phase 4: when sequence active, read state name directly from stateSequence[currentIdx].
        // No ai_sim_state dependency — always correct. Default path keeps legacy index math.
        const stateName = (stateSequence && stateSequence.length > 0)
            ? (stateSequence[currentIdx] ?? `STATE_${currentIdx + 1}`)
            : `STATE_${currentIdx + 1}`;
        console.log('[Sync] sending SET_STATE:', stateName, '| simReady:', simReady);
        console.log('[TeacherPlayer] state:', stateName, '| sequence:', stateSequence ?? 'default');
        sendToAll({ type: 'SET_STATE', state: stateName });
    }, [currentIdx, simReady]); // eslint-disable-line react-hooks/exhaustive-deps

    // Click a specific step (manual navigation)
    const handleStepClick = (stepIndex: number) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (playIntervalRef.current) clearInterval(playIntervalRef.current);
        setIsPlaying(false);
        // Auto-collapse inline deep-dive when navigating to any parent state.
        // User-confirmed UX: clicking a regular pill while in deep-dive should
        // exit without a confirmation prompt.
        if (activeDeepDiveParent && onDeepDiveExit) {
            onDeepDiveExit();
        }
        setCurrentIdx(stepIndex);
        // Phase 4: when sequence active, read state name directly from stateSequence[stepIndex].
        // Default path keeps legacy index math.
        const stateName = (stateSequence && stateSequence.length > 0)
            ? (stateSequence[stepIndex] ?? `STATE_${stepIndex + 1}`)
            : `STATE_${stepIndex + 1}`;
        console.log('[Sync] step clicked:', stepIndex, '→', stateName);
        console.log('[Sync] simReady:', simReady, '| effectiveRef:', !!effectiveRef.current);
        if (!simReady) {
            pendingState.current = stateName;
            console.log('[Sync] queued:', stateName, '(sim loading)');
            return;
        }
        if (!effectiveRef.current?.contentWindow) {
            console.warn('[Sync] effectiveRef.current is null — postMessage not sent');
            return;
        }
        sendToAll({ type: 'SET_STATE', state: stateName });
        console.log('[Sync] sent:', stateName);
        if (stepIndex === steps.length - 1) setIsComplete(true);
    };

    // Phase 2E: feedback state
    const [submittedRating, setSubmittedRating] = useState<string | null>(null);
    const interactionDataRef = useRef<Array<{ type: string; value: unknown; ts: number }>>([]);

    // Phase 2E: submit emoji rating to API
    const handleRating = async (rating: string, conceptId?: string, sessionId?: string) => {
        setSubmittedRating(rating);
        try {
            await fetch("/api/simulation-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId ?? "anonymous",
                    concept_id: conceptId ?? lesson.key_insight ?? "unknown",
                    student_rating: rating,
                    interaction_data: interactionDataRef.current,
                    sim_html_length: simHtml?.length ?? 0,
                }),
            });
        } catch { /* fire-and-forget */ }
    };

    // Scroll active step into view
    useEffect(() => {
        if (currentIdx < 0 || !stepListRef.current) return;
        const el = stepListRef.current.querySelector<HTMLElement>(`[data-step="${currentIdx}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [currentIdx]);

    // ── Playback engine ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isPlaying || isComplete || steps.length === 0) return;

        // Pause duration: compact uses 8s fixed; normal uses step's own pause_ms
        const pauseMs = compact
            ? (currentIdx < 0 ? 600 : 8000)
            : (currentIdx >= 0 ? steps[currentIdx].pause_ms : 600);

        timerRef.current = setTimeout(() => {
            const nextIdx = currentIdx + 1;

            if (nextIdx >= steps.length || steps.length === 0) {
                setIsPlaying(false);
                setIsComplete(true);
                setIsInteractive(true);
                setHighlighted(null);
                return;
            }

            const step: TeachingStep = steps[nextIdx];

            // Merge sim_state into current state
            if (Object.keys(step.sim_state).length > 0) {
                setSimState(prev => ({ ...prev, ...step.sim_state }));
            }

            // Apply highlight based on action type
            if (step.sim_action !== "pause") {
                setHighlighted(step.sim_target || null);
                // Non-animate highlights clear after 1.5 s
                if (step.sim_action !== "animate") {
                    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
                    highlightTimerRef.current = setTimeout(() => setHighlighted(null), 1500);
                }
            } else {
                setHighlighted(null);
            }

            setCurrentIdx(nextIdx);
        }, pauseMs);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentIdx, isComplete, steps, compact]);

    // ── Play / Pause / Restart ─────────────────────────────────────────────────
    const handlePlayPause = () => {
        if (isComplete) {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
            setCurrentIdx(-1);
            setIsComplete(false);
            setIsInteractive(false);
            setSimState(lesson.sim_config);
            setHighlighted(null);
            setIsPlaying(true);
            return;
        }
        setIsPlaying(p => !p);
    };


    // Determine if there's a right panel to show
    const hasRightPanel = !!simHtml || !!isLoadingSim;

    if (compact) {
        // When inline deep-dive is active on the current state, the sub-state's
        // teacher text takes over the title row (student's mental focus is the
        // sub-step, not the parent state's sentence). Otherwise show the parent
        // step's text as before.
        const activeSub = (activeDeepDiveParent && deepDiveSubStates && activeDeepDiveIdx != null)
            ? deepDiveSubStates[activeDeepDiveIdx] ?? null
            : null;
        const currentStep = currentIdx >= 0 ? steps[currentIdx] : null;
        const currentText = activeSub ? activeSub.teacher_text : (currentStep?.text ?? "");
        const titleMatch = currentText.match(/^(.+?[.!?])(\s|$)/);
        const currentTitle = titleMatch ? titleMatch[1].replace(/\*\*/g, "") : currentText.split("\n")[0];
        const currentRest = currentText.slice(currentTitle.length).trim();

        return (
            <div className="flex flex-col bg-zinc-950 overflow-hidden h-full">
                {/* Header: play/pause + numbered state pills + counter + Explain */}
                <div className="shrink-0 flex items-center gap-2 px-3 pt-2 pb-1 border-b border-zinc-800/40 bg-zinc-900/40">
                    <button
                        onClick={handlePlayPause}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-white transition-all shrink-0 hover:brightness-110"
                        style={{ backgroundColor: 'rgb(var(--accent))', boxShadow: '0 2px 8px rgb(var(--accent) / 0.35)' }}
                        title={isComplete ? "Restart" : isPlaying ? "Pause" : "Play"}
                    >
                        {isComplete ? (
                            <RotateCcw className="w-3.5 h-3.5 text-white" />
                        ) : isPlaying ? (
                            <Pause className="w-3.5 h-3.5 text-white" />
                        ) : (
                            <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                        )}
                    </button>

                    {/* State pill strip — bigger hit target, labeled, visually
                         distinct active pill. This is the primary progress UI. */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
                        {!isScriptReady ? (
                            [0,1,2,3,4].map(i => (
                                <div
                                    key={i}
                                    className="h-7 w-9 rounded-md bg-zinc-800 animate-pulse shrink-0"
                                    style={{ animationDelay: `${i * 120}ms` }}
                                />
                            ))
                        ) : (
                            <>
                                {steps.map((_, i) => {
                                    const isPast = i < currentIdx;
                                    const isCurrent = i === currentIdx;
                                    // Resolve the state id for this pill so we can
                                    // (a) mark the parent pill as deep-dive-available,
                                    // (b) insert inline sub-pills after the matching pill.
                                    const stateIdForPill = (stateSequence && stateSequence.length > 0)
                                        ? (stateSequence[i] ?? `STATE_${i + 1}`)
                                        : `STATE_${i + 1}`;
                                    const isDeepDiveCapable = !!(allowedDeepDiveStates?.includes(stateIdForPill));
                                    const isActiveParent = activeDeepDiveParent === stateIdForPill;
                                    const subIsActive = isActiveParent && activeDeepDiveIdx != null;
                                    return (
                                        <Fragment key={i}>
                                            <button
                                                onClick={() => handleStepClick(i)}
                                                title={steps[i]?.text}
                                                aria-label={`Go to step ${i + 1}`}
                                                aria-current={isCurrent && !subIsActive ? "step" : undefined}
                                                className={`shrink-0 h-7 min-w-[28px] px-2 rounded-md flex items-center justify-center text-[12px] font-bold tabular-nums transition-all relative ${
                                                    isCurrent && !subIsActive
                                                        ? "text-white scale-110 ring-2 ring-white/30"
                                                        : isPast
                                                            ? "text-white hover:brightness-110"
                                                            : "text-zinc-400 bg-zinc-800/80 border border-zinc-700 hover:text-zinc-200 hover:border-zinc-500"
                                                }`}
                                                style={
                                                    isCurrent && !subIsActive
                                                        ? { backgroundColor: 'rgb(var(--accent))', boxShadow: '0 0 14px rgb(var(--accent) / 0.6)' }
                                                        : isPast
                                                            ? { backgroundColor: 'rgb(var(--accent) / 0.55)' }
                                                            : undefined
                                                }
                                            >
                                                {isComplete && i === steps.length - 1 ? "✓" : i + 1}
                                                {/* Deep-dive-available chevron marker */}
                                                {isDeepDiveCapable && !isActiveParent && (
                                                    <span
                                                        aria-hidden
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: -2, right: -2,
                                                            width: 6, height: 6, borderRadius: '50%',
                                                            background: '#F59E0B',
                                                            boxShadow: '0 0 0 1.5px rgb(var(--bg, 10 10 30))',
                                                        }}
                                                    />
                                                )}
                                            </button>
                                            {/* Inline sub-pills (3a, 3b, 3c, 3d) */}
                                            {isActiveParent && deepDiveSubStates && deepDiveSubStates.length > 0 && (
                                                <>
                                                    {deepDiveSubStates.map((ss, j) => {
                                                        const isSubCurrent = activeDeepDiveIdx === j;
                                                        return (
                                                            <button
                                                                key={ss.sub_state_id}
                                                                ref={isSubCurrent ? activeSubPillRef : undefined}
                                                                onClick={() => handleSubPillClick(j)}
                                                                title={ss.teacher_text}
                                                                aria-label={`Deep-dive sub-state ${ss.label}`}
                                                                aria-current={isSubCurrent ? "step" : undefined}
                                                                className="shrink-0 h-6 min-w-[24px] px-1.5 rounded-md flex items-center justify-center text-[10.5px] font-bold tabular-nums transition-all"
                                                                style={{
                                                                    backgroundColor: isSubCurrent ? '#F59E0B' : 'transparent',
                                                                    color: isSubCurrent ? '#111' : '#F59E0B',
                                                                    border: '1px solid #F59E0B',
                                                                    boxShadow: isSubCurrent ? '0 0 10px rgba(245,158,11,0.55)' : undefined,
                                                                }}
                                                            >
                                                                {ss.label}
                                                            </button>
                                                        );
                                                    })}
                                                    {/* Exit chip */}
                                                    <button
                                                        onClick={() => onDeepDiveExit?.()}
                                                        title="Exit deep-dive"
                                                        aria-label="Exit deep-dive"
                                                        className="shrink-0 h-6 px-1.5 rounded-md flex items-center gap-1 text-[10px] font-semibold text-zinc-400 border border-zinc-700 hover:text-zinc-200 hover:border-zinc-500 transition-all"
                                                    >
                                                        <X className="w-3 h-3" />
                                                        <span className="hidden sm:inline">Exit</span>
                                                    </button>
                                                </>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </>
                        )}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-semibold tabular-nums shrink-0">
                        {currentIdx >= 0 ? `${Math.min(currentIdx + 1, steps.length)}/${steps.length}` : `0/${steps.length}`}
                    </span>
                    {(() => {
                        if (!onDeepDiveClick || !isScriptReady || currentIdx < 0) return null;
                        const stepState = steps[currentIdx]?.ai_sim_state;
                        const currentStateName = stepState
                            ?? (stateSequence && stateSequence.length > 0
                                ? (stateSequence[currentIdx] ?? `STATE_${currentIdx + 1}`)
                                : `STATE_${currentIdx + 1}`);
                        // Session 33: student-first — Explain button shown on
                        // every state, not just ones the architect pre-flagged
                        // allow_deep_dive. States WITH pre-built deep-dives
                        // serve from cache (fast); states WITHOUT generate
                        // on-demand via Sonnet (slower spinner). No student
                        // should be told "this state can't be explained deeper".
                        // `allowedDeepDiveStates` retained for downstream hints
                        // (e.g. pill rendering at :538) but no longer gates
                        // button visibility here.
                        // Suppress the button when inline deep-dive is already active
                        // on this state (prevents a double-fetch/duplicate sub-pills).
                        if (activeDeepDiveParent === currentStateName) return null;
                        const isLoadingThisState = deepDiveLoading === true;
                        return (
                            <button
                                onClick={() => onDeepDiveClick(currentStateName)}
                                disabled={isLoadingThisState}
                                className="shrink-0 flex items-center gap-1.5 px-3 h-7 rounded-md text-[11px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-70 disabled:cursor-wait"
                                style={{
                                    backgroundColor: 'rgb(var(--accent))',
                                    boxShadow: 'var(--shadow-md), 0 0 0 1px rgb(var(--accent) / 0.6)',
                                }}
                                title={isLoadingThisState ? "Generating deep-dive…" : "Explain this step in more detail"}
                            >
                                {isLoadingThisState
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <BookOpen className="w-3.5 h-3.5" />}
                                <span className="hidden sm:inline">{isLoadingThisState ? "Generating…" : "Explain"}</span>
                            </button>
                        );
                    })()}
                </div>

                {/* Current-step title row — first sentence as a visible headline.
                     Was previously 10.5 px at 55 % opacity (effectively unreadable),
                     now 13 px at full contrast with a Step-N badge for orientation. */}
                <div
                    ref={stepListRef}
                    title={isScriptReady ? currentStep?.text ?? undefined : undefined}
                    style={{
                        flex: 1, minHeight: 0, overflow: 'hidden',
                        padding: '4px 12px 6px',
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}
                >
                    {isScriptReady && currentStep ? (
                        <>
                            <span
                                style={{
                                    fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                                    color: activeSub ? '#F59E0B' : 'rgb(var(--accent))',
                                    textTransform: 'uppercase',
                                    padding: '2px 6px',
                                    border: `1px solid ${activeSub ? 'rgba(245,158,11,0.45)' : 'rgb(var(--accent) / 0.45)'}`,
                                    borderRadius: 4,
                                    background: activeSub ? 'rgba(245,158,11,0.08)' : 'rgb(var(--accent) / 0.08)',
                                    flexShrink: 0,
                                }}
                            >
                                {activeSub
                                    ? `Deep-dive ${activeSub.label}`
                                    : `Step ${Math.min(currentIdx + 1, steps.length)}`}
                            </span>
                            {activeSub && deepDiveStatus === 'pending_review' && (
                                <span
                                    style={{
                                        fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
                                        color: '#F59E0B',
                                        textTransform: 'uppercase',
                                        padding: '2px 6px',
                                        border: '1px dashed rgba(245,158,11,0.55)',
                                        borderRadius: 4,
                                        background: 'rgba(245,158,11,0.05)',
                                        flexShrink: 0,
                                    }}
                                    title="This deep-dive is awaiting review by the content team."
                                >
                                    Pending review
                                </span>
                            )}
                            <div
                                style={{
                                    flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.4,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 6, WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden', textOverflow: 'ellipsis', wordBreak: 'break-word',
                                }}
                            >
                                <strong style={{ color: '#f5f5f5', fontWeight: 600 }}>
                                    {currentTitle}
                                </strong>
                                {currentRest && (
                                    <span style={{ color: 'rgba(232,230,240,0.65)' }}> {currentRest}</span>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[0,1,2].map(i => (
                                <div key={i} style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)',
                                    animation: 'pulse 1.2s ease-in-out infinite',
                                    animationDelay: `${i * 200}ms`,
                                }} />
                            ))}
                        </div>
                    )}
                </div>
                {/* Phase D: thumbs rating on active inline deep-dive sub-state.
                     Keyed by deepDiveCacheId so switching between parent states
                     (or a fresh deep-dive row) resets the voted state. */}
                {activeSub && deepDiveCacheId && sessionId && (
                    <div
                        className="shrink-0 px-3 pb-2 -mt-1"
                        key={deepDiveCacheId}
                    >
                        <DeepDiveFeedbackThumbs
                            kind="deep-dive"
                            cacheId={deepDiveCacheId}
                            sessionId={sessionId}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="mt-3 w-full rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">

            {/* ── Header: play/pause + progress dots ── */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-900/60">
                <button
                    onClick={handlePlayPause}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-white transition-all shrink-0 hover:brightness-110"
                    style={{ backgroundColor: 'rgb(var(--accent))', boxShadow: 'var(--shadow-md)' }}
                    title={isComplete ? "Restart" : isPlaying ? "Pause" : "Play"}
                >
                    {isComplete ? (
                        <RotateCcw className="w-3.5 h-3.5 text-white" />
                    ) : isPlaying ? (
                        <Pause className="w-3.5 h-3.5 text-white" />
                    ) : (
                        <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                    )}
                </button>

                {/* Progress dots — skeleton when script not ready yet */}
                <div className="flex items-center gap-1.5">
                    {!isScriptReady ? (
                        [0,1,2,3].map(i => (
                            <div key={i} className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                        ))
                    ) : (
                        <>
                            {steps.map((_, i) => {
                                const isPast = i < currentIdx;
                                const isCurrent = i === currentIdx;
                                return (
                                    <div
                                        key={i}
                                        className={`rounded-full transition-all duration-300 ${
                                            isCurrent ? "w-4 h-3.5" : "w-3.5 h-3.5"
                                        }`}
                                        style={
                                            isCurrent
                                                ? { backgroundColor: 'rgb(var(--accent))', boxShadow: '0 0 8px rgb(var(--accent) / 0.6)' }
                                                : isPast
                                                    ? { backgroundColor: 'rgb(var(--accent) / 0.85)' }
                                                    : { backgroundColor: 'rgb(63 63 70)' }
                                        }
                                    />
                                );
                            })}
                            {isComplete && (
                                <span className="ml-2 text-[11px] text-emerald-400 font-semibold">Complete ✓</span>
                            )}
                        </>
                    )}
                </div>

                <div className="ml-auto text-[11px] text-zinc-500 shrink-0">
                    {currentIdx >= 0 ? `${Math.min(currentIdx + 1, steps.length)}/${steps.length}` : `0/${steps.length}`}
                    {isLoadingSim && (
                        <span className="ml-1.5 text-blue-600">· Generating…</span>
                    )}
                    {simHtml && !isLoadingSim && !simReady && (
                        <span className="ml-1.5 text-amber-500 animate-pulse">· Sim loading…</span>
                    )}
                    {simHtml && !isLoadingSim && simReady && (
                        <span className="ml-1.5 text-emerald-500">· Sim ready</span>
                    )}
                    {!simReady && simHtml && !isLoadingSim && (
                        <span className="ml-1.5 text-[11px] text-zinc-600">sync loading…</span>
                    )}
                </div>
            </div>

            {/* ── Body: step list (left) + simulator (right) ── */}
            <div className={hasRightPanel ? "flex" : "flex flex-col"} style={{ minHeight: 240 }}>

                {/* Left: scrolling step list */}
                <div
                    ref={stepListRef}
                    className={
                        hasRightPanel
                            ? "w-[45%] flex flex-col overflow-y-auto border-r border-zinc-800"
                            : "w-full max-w-2xl mx-auto flex flex-col overflow-y-auto"
                    }
                    style={{ maxHeight: 320 }}
                >
                    {!isScriptReady ? (
                        /* Skeleton rows — 4 pulsing grey bars while aiScript generates */
                        [0,1,2,3].map(i => (
                            <div key={i} className="px-4 py-3 border-l-2 border-transparent flex flex-col gap-1.5">
                                <div className="h-2 w-10 rounded bg-zinc-800 animate-pulse" style={{ animationDelay: `${i * 120}ms` }} />
                                <div className="h-2.5 rounded bg-zinc-800 animate-pulse" style={{ width: `${55 + i * 12}%`, animationDelay: `${i * 120}ms` }} />
                                <div className="h-2.5 rounded bg-zinc-800/60 animate-pulse" style={{ width: `${40 + i * 8}%`, animationDelay: `${i * 120 + 60}ms` }} />
                            </div>
                        ))
                    ) : (
                        steps.map((step, i) => (
                            <div
                                key={step.id}
                                data-step={i}
                                onClick={() => handleStepClick(i)}
                                className={`cursor-pointer px-4 py-3 text-[12px] leading-relaxed transition-colors duration-200 border-l-2 ${i === currentIdx
                                    ? "border-blue-500 bg-blue-500/10 text-zinc-100"
                                    : i < currentIdx
                                        ? "border-zinc-700 text-zinc-500"
                                        : "border-transparent text-zinc-700"
                                    }`}
                            >
                                <span className="text-[10px] font-semibold text-zinc-600 block mb-0.5">
                                    Step {i + 1}
                                </span>
                                {renderBold(step.text)}
                            </div>
                        ))
                    )}

                    {/* Key insight + JEE trap — revealed on completion */}
                    {isComplete && (
                        <>
                            <div className="mx-3 mt-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                                    Key Insight
                                </p>
                                <p className="text-[12px] text-zinc-200 leading-relaxed">
                                    {lesson.key_insight}
                                </p>
                            </div>
                            <div className="mx-3 mt-2 mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                                    JEE Trap
                                </p>
                                <p className="text-[12px] text-zinc-200 leading-relaxed">
                                    {lesson.jee_trap}
                                </p>
                            </div>
                            {sessionId && studentBelief && (
                                <div className="mx-3 mb-3">
                                    <BeliefProbeCard sessionId={sessionId} studentBelief={studentBelief} />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right: simulator panel — layout-aware */}
                {hasRightPanel && (
                    <div className="flex-1 flex flex-col min-w-0" style={{ overflowY: "auto", overflowX: "hidden" }}>

                        {/* ── dual_horizontal: two panels side by side, 50/50 ── */}
                        {panelLayout === 'dual_horizontal' ? (
                            <div className="flex flex-1 min-h-0">
                                {/* Primary — left */}
                                <div className="flex-1 flex flex-col border-r border-zinc-800 min-w-0">
                                    {panelConfig?.primary.label && (
                                        <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                            {panelConfig.primary.label}
                                        </div>
                                    )}
                                    <div className="flex-1 p-3 flex items-start">
                                        <AISimulationRenderer
                                            simHtml={simHtml ?? null}
                                            isLoading={isLoadingSim}
                                            concept={panelConfig?.primary.label ?? lesson.key_insight ?? ''}
                                            iframeRef={simulationIframeRef}
                                        />
                                    </div>
                                </div>
                                {/* Secondary — right */}
                                {panelConfig?.secondary && (
                                    <div className="flex-1 flex flex-col min-w-0">
                                        <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                            {panelConfig.secondary.label}
                                        </div>
                                        <div className="flex-1 p-3 flex items-start">
                                            <AISimulationRenderer
                                                simHtml={secondarySimHtml ?? null}
                                                isLoading={false}
                                                concept={panelConfig.secondary.label}
                                                iframeRef={effectiveSecondaryRef}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                        ) : panelLayout === 'dual_vertical' ? (
                            /* ── dual_vertical: two panels stacked, 50/50 ── */
                            <div className="flex flex-col flex-1 min-h-0">
                                {/* Primary — top */}
                                <div className="flex-1 flex flex-col border-b border-zinc-800 min-h-0">
                                    {panelConfig?.primary.label && (
                                        <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                            {panelConfig.primary.label}
                                        </div>
                                    )}
                                    <div className="flex-1 p-3 flex items-start">
                                        <AISimulationRenderer
                                            simHtml={simHtml ?? null}
                                            isLoading={isLoadingSim}
                                            concept={panelConfig?.primary.label ?? lesson.key_insight ?? ''}
                                            iframeRef={simulationIframeRef}
                                        />
                                    </div>
                                </div>
                                {/* Secondary — bottom */}
                                {panelConfig?.secondary && (
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                            {panelConfig.secondary.label}
                                        </div>
                                        <div className="flex-1 p-3 flex items-start">
                                            <AISimulationRenderer
                                                simHtml={secondarySimHtml ?? null}
                                                isLoading={false}
                                                concept={panelConfig.secondary.label}
                                                iframeRef={effectiveSecondaryRef}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                        ) : (
                            /* ── single (default): one panel, full width ── */
                            <div className="flex-1 p-3 flex items-start">
                                <AISimulationRenderer
                                    simHtml={simHtml ?? null}
                                    isLoading={isLoadingSim}
                                    concept={lesson.key_insight ?? ''}
                                    iframeRef={simulationIframeRef}
                                />
                            </div>
                        )}

                        {/* Interactive prompt — unlocked after lesson completes */}
                        {isComplete && (lesson.sim_type === "wire" || lesson.sim_type === "circuit") && (
                            <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/40">
                                <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    <span className="text-blue-400 font-semibold">Try it: </span>
                                    {lesson.interactive_prompt}
                                </p>
                            </div>
                        )}

                        {/* Phase 2E: emoji rating bar — shown after sim is ready */}
                        {simHtml && (
                            <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
                                <span className="text-[11px] text-zinc-500 shrink-0">Did this help?</span>
                                {submittedRating ? (
                                    <span className="text-[11px] text-emerald-400">Thanks for your feedback!</span>
                                ) : (
                                    <>
                                        {[
                                            { emoji: "😕", label: "confused", value: "confused" },
                                            { emoji: "😐", label: "neutral", value: "neutral" },
                                            { emoji: "🙂", label: "clear", value: "clear" },
                                            { emoji: "🤩", label: "great", value: "great" },
                                        ].map(({ emoji, label, value }) => (
                                            <button
                                                key={value}
                                                onClick={() => handleRating(value)}
                                                title={label}
                                                className="text-lg hover:scale-125 transition-transform"
                                                aria-label={label}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
