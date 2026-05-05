"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface TeacherScriptStep {
    text: string;
    sim_state: string;
    title?: string;
    step_number?: number;
}

interface Props {
    conceptId: string;
    simHtml: string;
    secondarySimHtml: string | null;
    stateIds: string[];
    teacherScript?: TeacherScriptStep[] | null;
}

interface StateEvent {
    panel: "A" | "B";
    state: string;
    timestamp: number;
}

const VIEWPORT_WIDTH = 760;
const VIEWPORT_HEIGHT = 480;

/**
 * Manual eyeball viewer with state-stepper.
 *
 * Renders the cached sim_html inside an iframe via srcDoc. For multi-panel
 * sims, two iframes side-by-side share a state-stepper button row.
 *
 * PostMessage contract (built into every cached sim):
 *   - SIM_READY:     iframe → parent (we listen, mark ready)
 *   - SET_STATE:     parent → iframe (we post on button click)
 *   - STATE_REACHED: iframe → parent (we log to status panel)
 *   - PARAM_UPDATE:  iframe → parent (we relay between panels for multi-panel)
 */
export function SimViewerClient({ conceptId, simHtml, secondarySimHtml, stateIds, teacherScript }: Props) {
    const isMulti = !!secondarySimHtml;
    const aRef = useRef<HTMLIFrameElement | null>(null);
    const bRef = useRef<HTMLIFrameElement | null>(null);

    const [activeState, setActiveState] = useState<string>(stateIds[0] ?? "");
    const [aReady, setAReady] = useState(false);
    const [bReady, setBReady] = useState(false);
    const [events, setEvents] = useState<StateEvent[]>([]);

    // ── TTS (Web Speech API) — speaks teacher_script for the active state.
    const ttsVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
    const ttsUnlockedRef = useRef(false);
    const ttsPendingStateRef = useRef<string | null>(null);

    const stateScriptMap = useMemo(() => {
        const m = new Map<string, string[]>();
        if (!teacherScript) return m;
        for (const step of teacherScript) {
            if (!step?.sim_state || !step?.text) continue;
            const list = m.get(step.sim_state) ?? [];
            list.push(step.text.replace(/\*\*/g, "").replace(/\s+/g, " ").trim());
            m.set(step.sim_state, list);
        }
        return m;
    }, [teacherScript]);

    const speakState = useCallback((stateId: string) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const sentences = stateScriptMap.get(stateId) ?? [];
        if (!sentences.length) {
            console.log("[TTS] no sentences for", stateId);
            return;
        }
        if (!ttsUnlockedRef.current) {
            ttsPendingStateRef.current = stateId;
            console.log("[TTS] waiting for first user gesture before speaking", stateId);
            return;
        }
        console.log("[TTS] speaking", stateId, "—", sentences.length, "sentences");
        for (const text of sentences) {
            const u = new SpeechSynthesisUtterance(text);
            if (ttsVoiceRef.current) u.voice = ttsVoiceRef.current;
            u.rate = 0.95;
            u.pitch = 1.0;
            u.volume = 1.0;
            u.onerror = (e) => console.warn("[TTS] error", e);
            window.speechSynthesis.speak(u);
        }
    }, [stateScriptMap]);

    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            console.warn("[TTS] speechSynthesis not available in this browser");
            return;
        }
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
                const pending = ttsPendingStateRef.current;
                if (pending) {
                    ttsPendingStateRef.current = null;
                    speakState(pending);
                }
            } catch (e) {
                console.warn("[TTS] unlock failed", e);
            }
        };
        window.addEventListener("pointerdown", unlock);
        window.addEventListener("keydown", unlock);
        return () => {
            window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
            window.removeEventListener("pointerdown", unlock);
            window.removeEventListener("keydown", unlock);
            window.speechSynthesis.cancel();
        };
    }, [speakState]);

    const sendStateToFrame = useCallback((iframe: HTMLIFrameElement | null, stateId: string) => {
        if (!iframe?.contentWindow) return;
        iframe.contentWindow.postMessage({ type: "SET_STATE", state: stateId }, "*");
    }, []);

    const handleStateClick = useCallback(
        (stateId: string) => {
            setActiveState(stateId);
            sendStateToFrame(aRef.current, stateId);
            if (isMulti) sendStateToFrame(bRef.current, stateId);
            speakState(stateId);
        },
        [isMulti, sendStateToFrame, speakState],
    );

    // Listen for SIM_READY / STATE_REACHED / PARAM_UPDATE from both iframes.
    // PARAM_UPDATE is relayed: A→B and B→A so multi-panel sliders stay in sync.
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            const data = e.data as Record<string, unknown> | null;
            if (!data || typeof data !== "object") return;

            // Identify which iframe the message came from
            let panel: "A" | "B" | null = null;
            if (aRef.current && e.source === aRef.current.contentWindow) panel = "A";
            else if (bRef.current && e.source === bRef.current.contentWindow) panel = "B";
            if (!panel) return;

            const type = data.type;
            if (type === "SIM_READY") {
                if (panel === "A") setAReady(true);
                if (panel === "B") setBReady(true);
                return;
            }
            if (type === "STATE_REACHED" && typeof data.state === "string") {
                setEvents((prev) =>
                    [{ panel, state: data.state as string, timestamp: Date.now() }, ...prev].slice(0, 12),
                );
                return;
            }
            if (type === "PARAM_UPDATE" && isMulti) {
                // Relay to the other panel
                const target = panel === "A" ? bRef.current : aRef.current;
                if (target?.contentWindow) {
                    target.contentWindow.postMessage(data, "*");
                }
            }
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, [isMulti]);

    // Auto-send initial state when both panels are ready
    useEffect(() => {
        if (!aReady) return;
        if (isMulti && !bReady) return;
        if (!activeState) return;
        sendStateToFrame(aRef.current, activeState);
        if (isMulti) sendStateToFrame(bRef.current, activeState);
        // Intentionally only run once both panels become ready; further state
        // changes go through handleStateClick.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aReady, bReady]);

    const formatEvent = (ev: StateEvent) => {
        const age = Math.round((Date.now() - ev.timestamp) / 100) / 10;
        return `panel ${ev.panel} → ${ev.state} (${age}s ago)`;
    };

    const aReadyBadge = useMemo(() => readinessBadge(aReady, "A"), [aReady]);
    const bReadyBadge = useMemo(() => (isMulti ? readinessBadge(bReady, "B") : null), [bReady, isMulti]);

    return (
        <div className="space-y-4">
            {/* State stepper */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase tracking-wider text-slate-400 mr-2">States:</span>
                    {stateIds.length === 0 ? (
                        <span className="text-rose-400 text-sm">No states found in physics_config</span>
                    ) : (
                        stateIds.map((sid) => (
                            <button
                                key={sid}
                                onClick={() => handleStateClick(sid)}
                                className={`px-3 py-1.5 text-sm font-mono rounded ${
                                    activeState === sid
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                }`}
                            >
                                {sid}
                            </button>
                        ))
                    )}
                    <div className="ml-auto flex gap-2 items-center text-xs">
                        {aReadyBadge}
                        {bReadyBadge}
                    </div>
                </div>
            </div>

            {/* Sim iframes */}
            <div className={`flex gap-4 ${isMulti ? "" : "justify-start"}`}>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 font-mono">panel A · {conceptId}</span>
                    <iframe
                        ref={aRef}
                        title="sim panel A"
                        srcDoc={simHtml}
                        sandbox="allow-scripts allow-same-origin"
                        width={VIEWPORT_WIDTH}
                        height={VIEWPORT_HEIGHT}
                        className="border border-slate-700 bg-black"
                    />
                </div>
                {isMulti && secondarySimHtml && (
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-mono">panel B · graph</span>
                        <iframe
                            ref={bRef}
                            title="sim panel B"
                            srcDoc={secondarySimHtml}
                            sandbox="allow-scripts allow-same-origin"
                            width={VIEWPORT_WIDTH}
                            height={VIEWPORT_HEIGHT}
                            className="border border-slate-700 bg-black"
                        />
                    </div>
                )}
            </div>

            {/* Event log */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                    PostMessage event log (last 12)
                </h2>
                {events.length === 0 ? (
                    <p className="text-slate-600 text-sm font-mono">no events yet — click a state button above</p>
                ) : (
                    <ul className="space-y-1">
                        {events.map((ev, i) => (
                            <li key={i} className="text-xs font-mono text-slate-300">
                                {formatEvent(ev)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Manual checklist hint */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 text-xs text-slate-400">
                <p className="font-medium text-slate-300 mb-1">Manual eyeball checklist (vision-gate categories):</p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <li>A · Layout: text overlap? out-of-bounds? overcrowded?</li>
                    <li>B · Physics: gravity down? normal ⊥ surface? friction direction?</li>
                    <li>C · Choreography: smooth transitions? no teleports?</li>
                    <li>D · Animation: actually plays? smooth motion?</li>
                    <li>E · Pedagogy: focal point clear? formula visible?</li>
                    <li>F · Multi-panel: A/B in sync? slider relay works?</li>
                    <li>G · Graph: axes labeled? trace visible? legend?</li>
                    <li>H · Hygiene: any {"{var}"} placeholders rendered? (pixelGate auto-catches)</li>
                </ul>
            </div>
        </div>
    );
}

function readinessBadge(ready: boolean, panel: "A" | "B") {
    return (
        <span
            className={`px-2 py-0.5 rounded font-mono ${
                ready ? "bg-emerald-900/60 border border-emerald-700 text-emerald-200" : "bg-slate-800 border border-slate-700 text-slate-500"
            }`}
        >
            panel {panel} {ready ? "ready" : "loading…"}
        </span>
    );
}
