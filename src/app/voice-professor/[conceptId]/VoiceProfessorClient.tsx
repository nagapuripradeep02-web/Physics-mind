"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Mic, MessageSquare, Play, Send } from "lucide-react";
import { operationToSimMessage, type Beat, type Operation } from "@/lib/voiceProfessor/operations";
import { chooseReframeTarget } from "@/lib/voiceProfessor/framing";
import { VoiceOrb } from "@/components/VoiceOrb";

/**
 * Voice Professor — generative beat player (Option B) with Sarvam voice.
 *
 * The brain (Sonnet, /api/voice-professor) reasons + explains live and returns a
 * "beats" plan — each beat = one spoken line + the sim operations that fire as it
 * is spoken. This client plays beats in sequence: apply ops (postMessage to the
 * sim) at beat start, speak the line, advance when audio ends.
 *
 * Voice: Sarvam (server proxies /api/voice/tts + /api/voice/stt), with browser
 * Web Speech as a fallback if Sarvam is unconfigured/errors. Operations are
 * translated through the shared whitelist (operations.ts) — the same one the
 * route validated against. The sim iframe MUST stay ≥768px wide (renderer drops
 * to a 2D fallback below that).
 */

interface StateInfo {
    id: string;
    title: string;
}
interface MoveInfo {
    move_id: string;
    label: string;
    beats: Beat[];
}
interface Props {
    conceptId: string;
    conceptName: string;
    simHtml: string;
    states: StateInfo[];
    stateNarration: Record<string, string[]>;
    moves: MoveInfo[];
    actor: "founder_test" | "student" | "reviewer";   // cost-tracking tag (from ?actor=)
    fontClass?: string;   // next/font Fraunces variable className (sets --font-fraunces)
}

// Instant acknowledgement fillers spoken the moment a turn starts, to cover the gap
// while the model generates + beat 1's audio synthesizes (no dead air after the mic).
// Generic, warm, plain English — they fit any ask and never commit to physics (they
// play before the answer is known). A subset is prefetched per session so the filler
// plays with zero latency in the Sarvam voice.
const FILLERS = [
    "That's a good question.",
    "Good question — let me show you.",
    "Oh, nice one.",
    "Yeah, I got you.",
    "Got it — let me explain.",
    "Sure, let me bring this up.",
    "Okay, let's look at this together.",
    "Right, give me one second.",
    "Hmm, good one — let me think.",
    "Alright, here we go.",
    "Let me walk you through it.",
    "Okay, watch this closely.",
    "Good — let me set this up.",
    "Let me bring up the picture for this.",
];

// Minimal typing for the webkit-prefixed Web Speech API (not in the TS DOM lib).
interface SRAlternative { readonly transcript: string; readonly confidence: number; }
interface SRResult { readonly isFinal: boolean; readonly length: number; readonly [i: number]: SRAlternative; }
interface SRResultList { readonly length: number; readonly [i: number]: SRResult; }
interface SREvent { readonly resultIndex: number; readonly results: SRResultList; }
interface SpeechRec {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: (() => void) | null;
    onresult: ((e: SREvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((e: { error?: string }) => void) | null;
}
type SpeechRecCtor = new () => SpeechRec;
function getSpeechRecCtor(): SpeechRecCtor | null {
    if (typeof window === "undefined") return null;
    const w = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// The line the professor actually SPEAKS: the model's `say`, plus the server-
// computed readout value when an `announce` op surfaced one — so the spoken
// number matches the on-screen value and is never model-fabricated.
function spokenText(b: Beat): string {
    return b.readout_value?.formatted ? `${b.say} ${b.readout_value.formatted}` : b.say;
}

interface BeatsResponse {
    mode?: string;
    beats?: Beat[];
    state_ids?: string[];
    meta?: { dropped_ops?: number; fallback_used?: boolean };
    error?: string;
}
// SSE frames from the streaming /api/voice-professor route.
type SseMsg =
    | { type: "beat"; beat: Beat }
    | { type: "done"; state_ids?: string[]; meta?: BeatsResponse["meta"] }
    | { type: "error"; error?: string };
type Intent = "doubt" | "explain_whole";
interface HistoryTurn {
    role: "student" | "professor";
    text: string;
}
type LogRole = "student" | "professor" | "nav" | "error";
interface LogEntry {
    role: LogRole;
    text: string;
    meta?: string;
}

// The sim is fully responsive: the renderer tracks its iframe viewport and resizes
// the 3D view live. (It only drops to a 2D SVG fallback below 768px wide, decided
// once at load — a non-issue on desktop, the V1 target.)

// Compact rail label: the first clause of the state title (split on : — ,), capped.
// The full sentence still shows on hover (title attr), so nothing is lost.
function shortLabel(title: string): string {
    const first = (title.split(/[:—,]/)[0] ?? "").trim();
    const s = first.length > 0 ? first : title.trim();
    return s.length > 28 ? s.slice(0, 27).trimEnd() + "…" : s;
}
// Pure "repeat that" command (the WHOLE message is just the command) → replay the
// last beats. This must NOT be a loose \bagain\b / \bslow\b match: real questions
// like "explain it again, I didn't get it" or "slow down and explain" have to reach
// the brain, which now handles slow-down / repeat / escalation (slow-motion + pauses)
// far better than a local replay. The old broad REPEAT_RE/SLOWER_RE swallowed any
// question containing "again" or "slow" and never called the AI.
const REPEAT_ONLY_RE = /^(repeat( that| it)?|say (that|it)( again)?|once more|come again|play (that|it) again)[.!?]*$/i;
const EXPLAIN_RE =
    /\b(explain|teach|walk|go|run|take|cover|describe)\b.{0,40}\b(whole|entire|full|complete|everything|concept|topic|lesson|chapter|step[ -]?by[ -]?step|from (the )?(start|beginning|scratch))\b/i;

// Encode captured Float32 PCM chunks → 16 kHz mono 16-bit WAV Blob. Sarvam STT
// rejects webm/opus (MediaRecorder's default), so we record raw and encode WAV.
function encodeWav(chunks: Float32Array[], inputRate: number): Blob {
    let total = 0;
    for (const c of chunks) total += c.length;
    const flat = new Float32Array(total);
    let off = 0;
    for (const c of chunks) {
        flat.set(c, off);
        off += c.length;
    }
    const outRate = 16000;
    const ratio = inputRate > outRate ? inputRate / outRate : 1;
    const outLen = Math.floor(flat.length / ratio) || flat.length;
    const samples = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) {
        const start = Math.floor(i * ratio);
        const end = Math.min(flat.length, Math.floor((i + 1) * ratio) || start + 1);
        let sum = 0;
        let n = 0;
        for (let j = start; j < end; j++) {
            sum += flat[j];
            n++;
        }
        samples[i] = n ? sum / n : flat[start] ?? 0;
    }
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeStr = (o: number, s: string) => {
        for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
    };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, outRate, true);
    view.setUint32(28, outRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, samples.length * 2, true);
    let p = 44;
    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        p += 2;
    }
    return new Blob([buffer], { type: "audio/wav" });
}

export function VoiceProfessorClient({ conceptId, conceptName, simHtml, states, stateNarration, moves, actor, fontClass = "" }: Props) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const stateIds = useMemo(() => states.map((s) => s.id), [states]);

    const [simReady, setSimReady] = useState(false);
    // Force-remount key for the sim iframe — used to recover from the renderer's
    // one-time 2D/3D decision when the iframe happened to load while narrow.
    const [simKey, setSimKey] = useState(0);
    const simRetryRef = useRef(0);
    // Mount the sim AFTER first paint so the iframe loads at the settled (full)
    // width — the renderer picks 2D vs 3D once, from its width at load.
    const [simMounted, setSimMounted] = useState(false);
    useEffect(() => {
        setSimMounted(true);
    }, []);
    const [activeState, setActiveState] = useState<string>(stateIds[0] ?? "");
    const [recording, setRecording] = useState(false);
    const [thinking, setThinking] = useState(false);
    const [micSupported, setMicSupported] = useState(true);
    const [textInput, setTextInput] = useState("");
    const [log, setLog] = useState<LogEntry[]>([]);
    const [speaking, setSpeaking] = useState(false);
    // Hands-free real-time conversation mode (browser SpeechRecognition).
    const [convMode, setConvMode] = useState(false);   // continuous listen ↔ answer loop
    const [listening, setListening] = useState(false); // SR actively hearing the user
    const [interim, setInterim] = useState("");        // live (non-final) user words
    // Live parameter HUD + "what the professor is doing" cue. Reflects the knobs
    // the professor (or the scripted demo) has turned in the current state; reset
    // on every state change to mirror the renderer's per-state override reset.
    const [paramHud, setParamHud] = useState<{ theta_deg?: number; v?: number; B?: number; q_sign?: number }>({});
    const [hudPulse, setHudPulse] = useState<string | null>(null);
    const [pace, setPace] = useState<{ paused?: boolean; rate?: number }>({});

    // Collapsible side panels (Claude/ChatGPT-style) so the sim can take the stage.
    // SSR-safe: start expanded (matches server), then hydrate the saved choice.
    const [statesCollapsed, setStatesCollapsed] = useState(false);
    const [chatCollapsed, setChatCollapsed] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        setStatesCollapsed(localStorage.getItem("vp_states_collapsed") === "true");
        setChatCollapsed(localStorage.getItem("vp_chat_collapsed") === "true");
    }, []);
    const toggleStates = useCallback(() => {
        setStatesCollapsed((c) => {
            const n = !c;
            try { localStorage.setItem("vp_states_collapsed", String(n)); } catch { /* private mode */ }
            return n;
        });
    }, []);
    const toggleChat = useCallback(() => {
        setChatCollapsed((c) => {
            const n = !c;
            try { localStorage.setItem("vp_chat_collapsed", String(n)); } catch { /* private mode */ }
            return n;
        });
    }, []);

    const sessionId = useMemo(
        () =>
            typeof crypto !== "undefined" && "randomUUID" in crypto
                ? `vp_${crypto.randomUUID()}`
                : `vp_${Date.now()}`,
        [],
    );

    const currentStateRef = useRef<string>(activeState);
    useEffect(() => {
        currentStateRef.current = activeState;
    }, [activeState]);

    // The viewpoint the student is actually looking from (unit camera→origin axis),
    // reported by the renderer (CAMERA_VIEW) on orbit/zoom/state settle. Sent with each
    // turn so the professor can judge framing and reframe a hidden object.
    const currentViewAxisRef = useRef<[number, number, number] | null>(null);
    // Live world directions of the on-screen objects (OBJECT_DIRS), keyed by glow token.
    // Sent with each turn so the professor judges framing off real directions (any concept).
    const objectDirsRef = useRef<Record<string, [number, number, number]> | null>(null);
    // Glow tokens currently highlighted (tracked from set_glow ops) so the
    // inter-beat reframe check knows which objects to keep readable. (Gap 1)
    const glowedTokensRef = useRef<string[]>([]);

    const initAckedRef = useRef(false);
    const pendingOpsRef = useRef<ReturnType<typeof operationToSimMessage>[] | null>(null);
    const turnTokenRef = useRef(0); // bump to cancel an in-flight turn (barge-in)
    const turnAbortRef = useRef<AbortController | null>(null); // aborts the in-flight SSE fetch on barge-in
    const playResolveRef = useRef<(() => void) | null>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const ttsModeRef = useRef<"sarvam" | "webspeech">("sarvam");
    const historyRef = useRef<HistoryTurn[]>([]);
    const lastBeatsRef = useRef<Beat[]>([]);
    // Prefetched filler audio (base64 WAV), aligned to FILLERS indices — played
    // instantly at turn start to mask latency. lastFillerRef avoids back-to-back repeats.
    const fillerB64Ref = useRef<(string | null)[]>([]);
    const lastFillerRef = useRef<number>(-1);
    const fillersPrefetchedRef = useRef(false);
    // Conversation-mode plumbing (read inside SR callbacks to dodge stale closures).
    const recognitionRef = useRef<SpeechRec | null>(null);
    const convModeRef = useRef(false);
    const speakingRef = useRef(false);
    useEffect(() => { convModeRef.current = convMode; }, [convMode]);
    useEffect(() => { speakingRef.current = speaking; }, [speaking]);

    const logRef = useRef<HTMLDivElement | null>(null);
    const addLog = useCallback((entry: LogEntry) => setLog((p) => [...p, entry].slice(-40)), []);
    useEffect(() => {
        logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
    }, [log]);

    // ── Web Speech (fallback TTS) — gesture-unlock + pending-queue ────────────
    const ttsVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
    const ttsUnlockedRef = useRef(false);
    const ttsRateRef = useRef(0.95);
    const pendingSpeechRef = useRef<{ sentences: string[]; rate: number; onDone?: () => void } | null>(null);

    const speakSentences = useCallback((sentences: string[], rate?: number, onDone?: () => void) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            onDone?.();
            return;
        }
        const clean = sentences.map((s) => s.trim()).filter(Boolean);
        if (!clean.length) {
            onDone?.();
            return;
        }
        const useRate = rate ?? ttsRateRef.current;
        window.speechSynthesis.cancel();
        if (!ttsUnlockedRef.current) {
            pendingSpeechRef.current = { sentences: clean, rate: useRate, onDone };
            return;
        }
        clean.forEach((text, i) => {
            const u = new SpeechSynthesisUtterance(text);
            if (ttsVoiceRef.current) u.voice = ttsVoiceRef.current;
            u.rate = useRate;
            u.pitch = 1.0;
            u.volume = 1.0;
            if (i === clean.length - 1 && onDone) u.onend = () => onDone();
            u.onerror = (e) => {
                if (e.error === "canceled" || e.error === "interrupted") return;
                console.warn("[TTS] error:", e.error);
            };
            window.speechSynthesis.speak(u);
        });
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        const pickVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (!voices.length) return;
            ttsVoiceRef.current =
                voices.find((v) => /en-IN/i.test(v.lang) && v.localService) ??
                voices.find((v) => /en-IN/i.test(v.lang)) ??
                voices.find((v) => /^en/i.test(v.lang)) ??
                voices[0];
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
                const pending = pendingSpeechRef.current;
                if (pending) {
                    pendingSpeechRef.current = null;
                    speakSentences(pending.sentences, pending.rate, pending.onDone);
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
    }, [speakSentences]);

    // ── Voice output: Sarvam first, Web Speech fallback ───────────────────────
    const getTtsBase64 = useCallback(async (text: string): Promise<string | null> => {
        if (ttsModeRef.current !== "sarvam" || !text.trim()) return null;
        try {
            const res = await fetch("/api/voice/tts", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ text, actor, session_id: sessionId }),
            });
            if (!res.ok) {
                if (res.status === 503) ttsModeRef.current = "webspeech"; // unconfigured → fall back for the session
                return null;
            }
            const data = (await res.json()) as { audio_base64?: string };
            return data.audio_base64 && typeof data.audio_base64 === "string" ? data.audio_base64 : null;
        } catch {
            return null;
        }
    }, [actor, sessionId]);

    const playBase64 = useCallback(
        (b64: string): Promise<void> =>
            new Promise((resolve) => {
                let done = false;
                const finish = () => {
                    if (done) return;
                    done = true;
                    ttsAnalyserRef.current = null;
                    stopOrbLoop();
                    playResolveRef.current = null;
                    resolve();
                };
                playResolveRef.current = finish;
                try {
                    const audio = new Audio("data:audio/wav;base64," + b64);
                    currentAudioRef.current = audio;
                    audio.onended = finish;
                    audio.onerror = finish;
                    // Best-effort: route through an analyser so the orb pulses with the
                    // professor's voice. NEVER block playback — if anything fails, the
                    // audio still plays directly.
                    const ctx = fxCtxRef.current;
                    if (ctx && ctx.state === "running") {
                        try {
                            const node = ctx.createMediaElementSource(audio);
                            try {
                                const analyser = ctx.createAnalyser();
                                analyser.fftSize = 256;
                                node.connect(analyser);
                                analyser.connect(ctx.destination);
                                ttsAnalyserRef.current = analyser;
                                startOrbLoop(() => ttsAnalyserRef.current);
                            } catch {
                                node.connect(ctx.destination); // analyser failed → still audible
                            }
                        } catch {
                            /* createMediaElementSource failed → audio plays directly */
                        }
                    }
                    audio.play().catch(() => finish());
                } catch {
                    finish();
                }
            }),
        // stopOrbLoop / startOrbLoop are stable (useCallback []) and declared below;
        // the body refs them at call-time, so they don't belong in the deps array.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const speakWebSpeech = useCallback(
        (text: string): Promise<void> =>
            new Promise((resolve) => {
                let done = false;
                const finish = () => {
                    if (done) return;
                    done = true;
                    playResolveRef.current = null;
                    resolve();
                };
                playResolveRef.current = finish;
                if (!text.trim()) {
                    finish();
                    return;
                }
                speakSentences([text], undefined, finish);
                window.setTimeout(finish, Math.max(2500, text.length * 90 + 1500));
            }),
        [speakSentences],
    );

    const speakText = useCallback(
        async (text: string) => {
            const b64 = await getTtsBase64(text);
            if (b64) await playBase64(b64);
            else await speakWebSpeech(text);
        },
        [getTtsBase64, playBase64, speakWebSpeech],
    );

    // ── Latency-mask fillers ──────────────────────────────────────────────────
    // Prefetch a handful of filler clips once (Sarvam) so the turn-start filler plays
    // instantly in the same voice. Any clip that didn't prefetch (e.g. Sarvam
    // unconfigured → ttsMode flips to webspeech) falls back to a live browser voice.
    const prefetchFillers = useCallback(async () => {
        if (fillersPrefetchedRef.current) return;
        fillersPrefetchedRef.current = true;
        if (ttsModeRef.current !== "sarvam") return;
        const subset = FILLERS.slice(0, 8);
        fillerB64Ref.current = await Promise.all(subset.map((t) => getTtsBase64(t)));
    }, [getTtsBase64]);

    useEffect(() => {
        const t = window.setTimeout(() => { void prefetchFillers(); }, 1500);
        return () => window.clearTimeout(t);
    }, [prefetchFillers]);

    // Pick a filler (avoiding an immediate repeat), preferring a prefetched clip so it
    // plays with zero latency; a null b64 means speak it live via Web Speech.
    const pickFiller = useCallback((): { text: string; b64: string | null } => {
        const clips = fillerB64Ref.current;
        const ready: number[] = [];
        for (let i = 0; i < FILLERS.length; i++) if (clips[i]) ready.push(i);
        const pool = ready.length ? ready : FILLERS.map((_, i) => i);
        let idx = pool[Math.floor(Math.random() * pool.length)];
        if (pool.length > 1 && idx === lastFillerRef.current) idx = pool[(pool.indexOf(idx) + 1) % pool.length];
        lastFillerRef.current = idx;
        return { text: FILLERS[idx], b64: clips[idx] ?? null };
    }, []);

    // ── Sim control ───────────────────────────────────────────────────────────
    const sendState = useCallback((stateId: string) => {
        const frame = iframeRef.current?.contentWindow;
        if (frame && stateId) frame.postMessage({ type: "SET_STATE", state: stateId }, "*");
    }, []);

    // Reflect set_param ops in the HUD + pulse the knob that just changed.
    const reflectParams = useCallback((list: Operation[]) => {
        const next: Record<string, number> = {};
        let changed: string | null = null;
        for (const o of list) {
            if (o.op === "set_param") { next[o.param] = o.value; changed = o.param; }
            else if (o.op === "sweep_param") { next[o.param] = o.to; changed = o.param; } // HUD shows the target
        }
        if (Object.keys(next).length) {
            setParamHud((prev) => ({ ...prev, ...next }));
            setHudPulse(changed);
        }
        // Pacing cues for the HUD ("⏸ Paused" / "0.4× slow-mo").
        for (const o of list) {
            if (o.op === "pause") setPace((p) => ({ ...p, paused: true }));
            else if (o.op === "resume") setPace((p) => ({ ...p, paused: false }));
            else if (o.op === "set_speed") setPace({ paused: false, rate: o.rate });
        }
    }, []);

    const applyBeatOps = useCallback((ops: Operation[]) => {
        const frame = iframeRef.current?.contentWindow;
        if (!frame) return;
        const stateOp = ops.find((o): o is Extract<Operation, { op: "set_state" }> => o.op === "set_state");
        const others = ops.filter((o) => o.op !== "set_state");
        const otherMsgs = others.map(operationToSimMessage);
        // Track the live highlight so the inter-beat reframe knows what to keep visible. (Gap 1)
        const glowOp = ops.find((o): o is Extract<Operation, { op: "set_glow" }> => o.op === "set_glow");
        if (glowOp !== undefined) {
            const t = glowOp.target;
            glowedTokensRef.current = t === null ? [] : Array.isArray(t) ? (t as string[]) : [t as string];
        }
        if (stateOp && stateOp.state !== currentStateRef.current) {
            setActiveState(stateOp.state);
            setParamHud({});          // override + pace reset on state entry (mirrors the renderer)
            setHudPulse(null);
            setPace({});
            frame.postMessage(operationToSimMessage(stateOp), "*");
            pendingOpsRef.current = otherMsgs; // flushed on STATE_REACHED
            reflectParams(others);    // HUD reflects the knobs this beat will apply
        } else {
            for (const m of otherMsgs) frame.postMessage(m, "*");
            reflectParams(others);
        }
    }, [reflectParams]);

    // Gap 1 — after a beat's audio ends, an earlier set_state/sweep_param may have
    // rotated the glowed arrows; silently reframe the worst-foreshortened one so it
    // stays readable for the NEXT beat. No UI change, no server round-trip — the
    // renderer reports fresh OBJECT_DIRS right after STATE_REACHED, so objectDirsRef
    // is current by the time the (multi-second) audio finishes.
    const injectReframeIfNeeded = useCallback(() => {
        const tokens = glowedTokensRef.current;
        if (tokens.length === 0) return;
        const pick = chooseReframeTarget(tokens, objectDirsRef.current, currentViewAxisRef.current);
        if (!pick) return;
        iframeRef.current?.contentWindow?.postMessage({ type: "FRAME_OBJECT", object: pick.token }, "*");
    }, []);

    const abortCurrent = useCallback(() => {
        turnTokenRef.current += 1;
        pendingOpsRef.current = null;
        turnAbortRef.current?.abort();
        turnAbortRef.current = null;
        if (currentAudioRef.current) {
            try {
                currentAudioRef.current.pause();
            } catch {
                /* noop */
            }
            currentAudioRef.current = null;
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
        playResolveRef.current?.();
        setSpeaking(false);
    }, []);

    // Play beats in order. Pre-fetch beat i+1's audio while beat i plays so only
    // the first beat waits on TTS.
    const playBeats = useCallback(
        async (beats: Beat[], token: number) => {
            const cache = new Map<number, Promise<string | null>>();
            const prefetch = (i: number) => {
                if (i < beats.length && !cache.has(i)) cache.set(i, getTtsBase64(spokenText(beats[i])));
            };
            prefetch(0);
            for (let i = 0; i < beats.length; i++) {
                if (token !== turnTokenRef.current) return;
                applyBeatOps(beats[i].ops);
                prefetch(i + 1);
                const b64 = (await cache.get(i)) ?? null;
                if (token !== turnTokenRef.current) return;
                setSpeaking(true);
                if (b64) await playBase64(b64);
                else await speakWebSpeech(spokenText(beats[i]));
            }
            if (token === turnTokenRef.current) setSpeaking(false);
        },
        [applyBeatOps, getTtsBase64, playBase64, speakWebSpeech],
    );

    // ── A professor turn ──────────────────────────────────────────────────────
    const runTurn = useCallback(
        async (intent: Intent, transcript?: string) => {
            abortCurrent();
            const token = turnTokenRef.current;
            const ac = new AbortController();
            turnAbortRef.current = ac;

            if (transcript) addLog({ role: "student", text: transcript });
            setThinking(true);

            // Producer/consumer: beats stream in (producer) and play as they arrive
            // (consumer), so we speak beat 1 while beats 2..N are still generating.
            const queue: Beat[] = [];
            let streamDone = false;
            let wake: () => void = () => {};
            let waiter = new Promise<void>((r) => { wake = r; });
            const resetWaiter = () => { waiter = new Promise<void>((r) => { wake = r; }); };

            const tts = new Map<number, Promise<string | null>>();
            const prefetch = (i: number) => {
                if (i >= 0 && i < queue.length && !tts.has(i)) tts.set(i, getTtsBase64(spokenText(queue[i])));
            };

            // ONE professor transcript entry that grows as beats arrive.
            let profText = "";
            let profStarted = false;
            const appendProf = (say: string) => {
                if (!say) return;
                profText = profText ? `${profText} ${say}` : say;
                setLog((prev) => {
                    if (profStarted && prev.length && prev[prev.length - 1].role === "professor") {
                        const next = prev.slice();
                        next[next.length - 1] = { ...next[next.length - 1], text: profText };
                        return next;
                    }
                    profStarted = true;
                    return [...prev, { role: "professor" as LogRole, text: profText, meta: intent === "explain_whole" ? "lesson" : "answer" }].slice(-40);
                });
            };

            // ── consumer (player) ──
            const consume = async () => {
                // Latency mask: speak a short filler IMMEDIATELY (instant prefetched clip)
                // so there is no dead air while beat 1 is generated + synthesized. The
                // producer fetch below runs concurrently, so this overlaps generation.
                // Part of the turn → a barge-in (abortCurrent) interrupts it like any beat.
                const filler = pickFiller();
                if (token !== turnTokenRef.current) return;
                setThinking(false);
                setSpeaking(true);
                if (filler.b64) await playBase64(filler.b64);
                else await speakWebSpeech(filler.text);
                if (token !== turnTokenRef.current) return;
                // Beat 1 may still be generating — show "thinking" again until it lands.
                if (queue.length === 0 && !streamDone) { setSpeaking(false); setThinking(true); }

                let i = 0;
                let firstPlayed = false;
                for (;;) {
                    if (token !== turnTokenRef.current) return;          // barge-in
                    if (i >= queue.length) {
                        if (streamDone) break;
                        await waiter; resetWaiter();                     // sleep until a beat arrives / stream ends
                        continue;
                    }
                    const beat = queue[i];
                    applyBeatOps(beat.ops);
                    prefetch(i); prefetch(i + 1);                        // overlap the next beat's TTS
                    const b64 = (await tts.get(i)) ?? null;
                    if (token !== turnTokenRef.current) return;
                    if (!firstPlayed) { setThinking(false); firstPlayed = true; }
                    setSpeaking(true);
                    if (b64) await playBase64(b64);
                    else await speakWebSpeech(spokenText(beat));
                    if (token === turnTokenRef.current) injectReframeIfNeeded();  // Gap 1
                    i += 1;
                }
                if (token === turnTokenRef.current) setSpeaking(false);
            };
            const consumed = consume();

            // ── producer (SSE reader) ──
            try {
                const res = await fetch("/api/voice-professor", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    signal: ac.signal,
                    body: JSON.stringify({
                        concept_id: conceptId,
                        intent,
                        transcript: transcript ?? "",
                        current_state: currentStateRef.current,
                        current_view_axis: currentViewAxisRef.current,
                        object_directions: objectDirsRef.current,
                        history: historyRef.current.slice(-8),
                        session_id: sessionId,
                        actor,
                    }),
                });
                if (!res.ok || !res.body) {
                    let msg = `HTTP ${res.status}`;
                    try { const j = (await res.json()) as BeatsResponse; if (j?.error) msg = j.error; } catch { /* not json */ }
                    addLog({ role: "error", text: msg });
                    streamDone = true; wake(); setThinking(false);
                    return;
                }
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buf = "";
                for (;;) {
                    if (token !== turnTokenRef.current) { try { await reader.cancel(); } catch { /* noop */ } break; }
                    const { value, done } = await reader.read();
                    if (done) break;
                    buf += decoder.decode(value, { stream: true });
                    let sep: number;
                    while ((sep = buf.indexOf("\n\n")) >= 0) {
                        const frame = buf.slice(0, sep);
                        buf = buf.slice(sep + 2);
                        const lineStr = frame.startsWith("data:") ? frame.slice(5).trim() : frame.trim();
                        if (!lineStr) continue;
                        let msg: SseMsg;
                        try { msg = JSON.parse(lineStr) as SseMsg; } catch { continue; }
                        if (msg.type === "beat" && msg.beat) {
                            const idx = queue.length;
                            queue.push(msg.beat);
                            prefetch(idx);                               // start this beat's TTS the moment it arrives
                            appendProf(msg.beat.say);
                            lastBeatsRef.current = queue.slice();
                            wake();
                        } else if (msg.type === "done") {
                            if (transcript) historyRef.current.push({ role: "student", text: transcript });
                            if (profText) historyRef.current.push({ role: "professor", text: profText });
                        } else if (msg.type === "error") {
                            addLog({ role: "error", text: msg.error ?? "stream error" });
                        }
                    }
                }
            } catch (err) {
                if (!(err instanceof DOMException && err.name === "AbortError")) {
                    addLog({ role: "error", text: err instanceof Error ? err.message : "request failed" });
                }
            } finally {
                streamDone = true; wake();
                if (turnAbortRef.current === ac) turnAbortRef.current = null;
                setThinking(false);
            }

            await consumed;
        },
        [abortCurrent, addLog, applyBeatOps, conceptId, getTtsBase64, injectReframeIfNeeded, playBase64, sessionId, speakWebSpeech, actor, pickFiller],
    );

    const replayLast = useCallback(() => {
        const beats = lastBeatsRef.current;
        if (!beats.length) return;
        abortCurrent();
        const token = turnTokenRef.current;
        addLog({ role: "nav", text: "↺ replaying" });
        void playBeats(beats, token);
    }, [abortCurrent, addLog, playBeats]);

    const handleUserText = useCallback(
        (raw: string) => {
            const text = raw.trim();
            if (!text) return;
            // ONLY a bare "repeat that" replays locally; everything else — including
            // "explain again", "I didn't understand", "slow down" — goes to the brain,
            // which now answers with slow-motion / pause / escalation.
            if (REPEAT_ONLY_RE.test(text) && lastBeatsRef.current.length) {
                addLog({ role: "student", text });
                replayLast();
                return;
            }
            void runTurn(EXPLAIN_RE.test(text) ? "explain_whole" : "doubt", text);
        },
        [addLog, replayLast, runTurn],
    );
    const handleUserTextRef = useRef(handleUserText);
    useEffect(() => {
        handleUserTextRef.current = handleUserText;
    }, [handleUserText]);

    // Manual rail click: direct navigation + authored narration (not the AI brain).
    const onSelectState = useCallback(
        (stateId: string) => {
            abortCurrent();
            pendingOpsRef.current = null;
            setActiveState(stateId);
            setParamHud({});
            setHudPulse(null);
            setPace({});
            sendState(stateId);
            void speakText((stateNarration[stateId] ?? []).join(" "));
        },
        [abortCurrent, sendState, speakText, stateNarration],
    );

    // Panic-safe scripted hero demo — a fixed, validated beat sequence that
    // bypasses the API entirely, so a wedged/slow model call can never derail
    // the live presentation. Bound to a button and the F2 key. Showcases the
    // control surface: circle → helix → stretch → tighter field → flip charge.
    const runScriptedDemo = useCallback(() => {
        abortCurrent();
        const token = turnTokenRef.current;
        // Prefer the reviewed move (validated server-side, single source of truth);
        // the inline beats below are only a fallback if the bundle ships no moves.
        const hero = moves.find((m) => m.move_id === "circle_to_helix_demo") ?? moves[0];
        if (hero) {
            addLog({ role: "nav", text: `▶ ${hero.label} (reviewed move · offline-safe)` });
            void playBeats(hero.beats, token);
            return;
        }
        addLog({ role: "nav", text: "▶ Hero demo (scripted · offline-safe)" });
        const beats: Beat[] = [
            {
                say: "Here a charged particle moves perpendicular to the magnetic field. Watch it trace a perfect circle.",
                ops: [{ op: "set_state", state: "STATE_2" }, { op: "set_glow", target: ["v", "f"] }],
            },
            {
                say: "Now I tilt the angle to thirty degrees. The circle opens up into a helix.",
                ops: [{ op: "set_param", param: "theta_deg", value: 30 }],
            },
            {
                say: "Closer to parallel, at ten degrees, and it stretches into a long spiral.",
                ops: [{ op: "set_param", param: "theta_deg", value: 10 }],
            },
            {
                say: "Let me switch to the helix view and crank the field up. A stronger field winds it tighter.",
                ops: [{ op: "set_state", state: "STATE_5" }, { op: "set_param", param: "B", value: 0.08 }],
            },
            {
                say: "And if I flip the charge to negative, it spirals the opposite way. Same law, F equals q v cross B, the whole time.",
                ops: [{ op: "set_param", param: "q_sign", value: -1 }],
            },
        ];
        void playBeats(beats, token);
    }, [abortCurrent, addLog, playBeats, moves]);

    // F2 fires the scripted hero demo from anywhere (ignored while typing).
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "F2") return;
            const tag = (e.target as HTMLElement | null)?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA") return;
            e.preventDefault();
            runScriptedDemo();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [runScriptedDemo]);

    // ── SIM_READY / STATE_REACHED (flush pending companion ops) ───────────────
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return;
            const data = e.data as { type?: string; state?: string; axis?: unknown; dirs?: unknown } | null;
            if (!data || typeof data !== "object") return;
            if (data.type === "CAMERA_VIEW") {
                const a = data.axis;
                if (Array.isArray(a) && a.length === 3 && a.every((n) => typeof n === "number")) {
                    currentViewAxisRef.current = [a[0], a[1], a[2]];
                }
                return;
            }
            if (data.type === "OBJECT_DIRS") {
                const d = data.dirs;
                if (d && typeof d === "object") {
                    const out: Record<string, [number, number, number]> = {};
                    for (const [k, v] of Object.entries(d as Record<string, unknown>)) {
                        if (Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === "number")) {
                            out[k] = [v[0], v[1], v[2]];
                        }
                    }
                    objectDirsRef.current = out;
                }
                return;
            }
            if (data.type === "SIM_READY") {
                setSimReady(true);
                const first = stateIds[0] ?? "";
                if (first) sendState(first);
                return;
            }
            if (data.type === "STATE_REACHED" && typeof data.state === "string") {
                initAckedRef.current = true;
                setSimReady(true);
                setActiveState(data.state);
                const pending = pendingOpsRef.current;
                if (pending) {
                    pendingOpsRef.current = null;
                    const frame = iframeRef.current?.contentWindow;
                    if (frame) for (const m of pending) frame.postMessage(m, "*");
                }
            }
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, [sendState, stateIds]);

    useEffect(() => {
        const first = stateIds[0] ?? "";
        if (!first) return;
        const id = window.setInterval(() => {
            if (initAckedRef.current) {
                window.clearInterval(id);
                return;
            }
            sendState(first);
        }, 500);
        return () => window.clearInterval(id);
    }, [sendState, stateIds]);

    // ── STT: Web Audio capture → 16kHz mono WAV → Sarvam (Sarvam STT rejects
    //    MediaRecorder's webm/opus; only mp3/wav/pcm), so we encode WAV ourselves.
    const audioCtxRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const zeroGainRef = useRef<GainNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const pcmChunksRef = useRef<Float32Array[]>([]);
    const recSampleRateRef = useRef(48000);

    // ── Voice orb: live mic amplitude → the terracotta sphere on the mic, plus a
    //    synthesized "pop" on activation/settle (own AudioContext, gesture-unlocked
    //    by the mic click). ──
    const analyserRef = useRef<AnalyserNode | null>(null);       // student mic
    const ttsAnalyserRef = useRef<AnalyserNode | null>(null);    // professor TTS
    const orbRef = useRef<HTMLDivElement | null>(null);
    const orbRafRef = useRef<number | null>(null);
    const fxCtxRef = useRef<AudioContext | null>(null);

    // One persistent AudioContext for the pop FX + the TTS analyser; created/resumed
    // on a user gesture (mic / whole-concept / send) so autoplay policy is satisfied.
    const ensureFxCtx = useCallback((): AudioContext | null => {
        try {
            const Ctor =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (!Ctor) return null;
            let ctx = fxCtxRef.current;
            if (!ctx) {
                ctx = new Ctor();
                fxCtxRef.current = ctx;
            }
            if (ctx.state === "suspended") void ctx.resume();
            return ctx;
        } catch {
            return null;
        }
    }, []);

    const playPop = useCallback(
        (rising: boolean) => {
            try {
                const ctx = ensureFxCtx();
                if (!ctx) return;
                const t = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(rising ? 380 : 620, t);
                osc.frequency.exponentialRampToValueAtTime(rising ? 920 : 240, t + 0.09);
                gain.gain.setValueAtTime(0.0001, t);
                gain.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.19);
            } catch {
                /* audio FX are best-effort */
            }
        },
        [ensureFxCtx],
    );

    const stopOrbLoop = useCallback(() => {
        if (orbRafRef.current != null) {
            cancelAnimationFrame(orbRafRef.current);
            orbRafRef.current = null;
        }
        orbRef.current?.style.setProperty("--amp", "0");
    }, []);

    const startOrbLoop = useCallback((getAnalyser: () => AnalyserNode | null) => {
        if (orbRafRef.current != null) cancelAnimationFrame(orbRafRef.current);
        const buf = new Uint8Array(256);
        let smoothed = 0;
        const tick = () => {
            const a = getAnalyser();
            const el = orbRef.current;
            if (!a || !el) {
                orbRafRef.current = null;
                el?.style.setProperty("--amp", "0");
                return;
            }
            a.getByteTimeDomainData(buf);
            let sum = 0;
            for (let i = 0; i < buf.length; i++) {
                const v = (buf[i] - 128) / 128;
                sum += v * v;
            }
            const level = Math.min(1, Math.sqrt(sum / buf.length) * 3.2); // RMS → 0..1
            smoothed += (level - smoothed) * 0.25;
            el.style.setProperty("--amp", smoothed.toFixed(3));
            orbRafRef.current = requestAnimationFrame(tick);
        };
        orbRafRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        return () => {
            if (orbRafRef.current != null) cancelAnimationFrame(orbRafRef.current);
            const fx = fxCtxRef.current;
            if (fx && fx.state !== "closed") void fx.close();
        };
    }, []);

    // The field_3d renderer chooses 2D-fallback vs full 3D ONCE, from its width at
    // load. A responsive iframe can momentarily be narrow when its script runs and
    // wrongly fall back to 2D. If we end up wide but with no WebGL canvas (= 2D),
    // remount the iframe once so it re-inits at the correct width. Self-limited.
    const onSimLoad = useCallback(() => {
        window.setTimeout(() => {
            const el = iframeRef.current;
            if (!el || simRetryRef.current >= 3) return;
            try {
                const doc = el.contentDocument;
                const wide = el.clientWidth >= 768;
                const is2D = !!doc && !doc.querySelector("canvas");
                if (wide && is2D) {
                    simRetryRef.current += 1;
                    setSimKey((k) => k + 1);
                }
            } catch {
                /* cross-origin / not ready — ignore */
            }
        }, 80);
    }, []);

    useEffect(() => {
        const w = typeof window !== "undefined"
            ? (window as unknown as { AudioContext?: unknown; webkitAudioContext?: unknown })
            : undefined;
        const ok =
            typeof navigator !== "undefined" &&
            !!navigator.mediaDevices?.getUserMedia &&
            !!(w && (w.AudioContext || w.webkitAudioContext));
        setMicSupported(ok);
    }, []);

    const sendAudioForStt = useCallback(
        async (blob: Blob) => {
            setThinking(true);
            try {
                const form = new FormData();
                form.append("audio", blob, "audio.wav");
                form.append("actor", actor);
                form.append("session_id", sessionId);
                const res = await fetch("/api/voice/stt", { method: "POST", body: form });
                const data = (await res.json()) as { transcript?: string; error?: string };
                if (res.ok && data.transcript && data.transcript.trim()) handleUserTextRef.current(data.transcript);
                else addLog({ role: "error", text: data?.error ?? "could not transcribe audio" });
            } catch (err) {
                addLog({ role: "error", text: err instanceof Error ? err.message : "stt failed" });
            } finally {
                setThinking(false);
            }
        },
        [addLog, actor, sessionId],
    );

    const teardownRecorder = useCallback(() => {
        try { processorRef.current?.disconnect(); } catch { /* noop */ }
        try { zeroGainRef.current?.disconnect(); } catch { /* noop */ }
        try { sourceRef.current?.disconnect(); } catch { /* noop */ }
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const ctx = audioCtxRef.current;
        if (ctx && ctx.state !== "closed") void ctx.close();
        processorRef.current = null;
        zeroGainRef.current = null;
        sourceRef.current = null;
        streamRef.current = null;
        audioCtxRef.current = null;
    }, []);

    const startRecording = useCallback(async () => {
        abortCurrent();
        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioCtx =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const ctx = new AudioCtx();
            const source = ctx.createMediaStreamSource(stream);
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            const zeroGain = ctx.createGain();
            zeroGain.gain.value = 0; // route to destination silently so onaudioprocess fires without echo
            pcmChunksRef.current = [];
            recSampleRateRef.current = ctx.sampleRate;
            processor.onaudioprocess = (e) => {
                pcmChunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
            };
            source.connect(processor);
            processor.connect(zeroGain);
            zeroGain.connect(ctx.destination);
            // Voice orb: tap the same graph for live amplitude (no extra mic prompt).
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;
            audioCtxRef.current = ctx;
            processorRef.current = processor;
            sourceRef.current = source;
            zeroGainRef.current = zeroGain;
            streamRef.current = stream;
            setRecording(true);
            playPop(true);
            startOrbLoop(() => analyserRef.current);
        } catch (e) {
            console.warn("[STT] mic failed", e);
            addLog({ role: "error", text: "microphone unavailable" });
        }
    }, [abortCurrent, addLog, playPop, startOrbLoop]);

    const stopRecording = useCallback(() => {
        setRecording(false);
        stopOrbLoop();
        analyserRef.current = null;
        playPop(false);
        const chunks = pcmChunksRef.current;
        const rate = recSampleRateRef.current;
        pcmChunksRef.current = [];
        teardownRecorder();
        if (chunks.length) void sendAudioForStt(encodeWav(chunks, rate));
    }, [teardownRecorder, sendAudioForStt, stopOrbLoop, playPop]);

    // ── Hands-free conversation (browser SpeechRecognition) ───────────────────
    // One tap starts a continuous listen↔answer loop: your words stream in live,
    // a pause auto-submits (SR `isFinal`), she answers, and SR keeps listening so
    // you can just talk back — or cut in while she speaks (barge-in). Her voice
    // stays Sarvam; this only changes how YOUR speech is captured.
    const startConversation = useCallback((): boolean => {
        const Ctor = getSpeechRecCtor();
        if (!Ctor) return false;
        ensureFxCtx();
        let rec: SpeechRec;
        try { rec = new Ctor(); } catch { return false; }
        rec.lang = "en-IN";
        rec.continuous = true;
        rec.interimResults = true;
        rec.onstart = () => setListening(true);
        rec.onresult = (e: SREvent) => {
            let interimStr = "";
            let finalStr = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const r = e.results[i];
                const txt = r[0] ? r[0].transcript : "";
                if (r.isFinal) finalStr += txt; else interimStr += txt;
            }
            const speakingNow = speakingRef.current;
            if (!speakingNow) setInterim(interimStr);   // while SHE speaks, don't echo her words back as my interim
            const finalClean = finalStr.trim();
            if (!finalClean) return;
            // Echo guard: while she speaks, only a clear (multi-word) utterance counts as a barge-in.
            if (speakingNow && finalClean.split(/\s+/).length < 2) return;
            if (speakingNow) abortCurrent();            // barge-in: stop her, take the new question
            setInterim("");
            handleUserTextRef.current(finalClean);
        };
        rec.onerror = (ev: { error?: string }) => {
            if (ev && (ev.error === "not-allowed" || ev.error === "service-not-allowed")) {
                convModeRef.current = false;
                setConvMode(false);
                addLog({ role: "error", text: "microphone permission denied" });
            }
        };
        rec.onend = () => {
            setListening(false);
            // Continuous: restart while still in conversation mode (debounced to avoid a tight loop).
            if (convModeRef.current) {
                window.setTimeout(() => {
                    if (convModeRef.current && recognitionRef.current === rec) {
                        try { rec.start(); } catch { /* a stale session — next onend retries */ }
                    }
                }, 250);
            }
        };
        recognitionRef.current = rec;
        convModeRef.current = true;
        setConvMode(true);
        try { rec.start(); } catch { /* will restart via onend */ }
        return true;
    }, [ensureFxCtx, abortCurrent, addLog]);

    const stopConversation = useCallback(() => {
        convModeRef.current = false;
        setConvMode(false);
        setListening(false);
        setInterim("");
        abortCurrent();   // stop any in-flight answer audio
        const rec = recognitionRef.current;
        recognitionRef.current = null;
        if (rec) {
            rec.onend = null; rec.onresult = null; rec.onerror = null; rec.onstart = null;
            try { rec.stop(); } catch { /* noop */ }
            try { rec.abort(); } catch { /* noop */ }
        }
    }, [abortCurrent]);

    const toggleMic = useCallback(() => {
        ensureFxCtx(); // unlock audio in this gesture (pop + TTS analyser)
        if (convMode) { stopConversation(); return; }
        // Prefer hands-free conversation (browser SpeechRecognition); fall back to Sarvam batch record.
        if (getSpeechRecCtor()) { startConversation(); return; }
        if (recording) stopRecording();
        else void startRecording();
    }, [convMode, recording, startConversation, stopConversation, startRecording, stopRecording, ensureFxCtx]);

    const onSendText = useCallback(() => {
        const t = textInput.trim();
        if (!t) return;
        ensureFxCtx();
        setTextInput("");
        handleUserText(t);
    }, [textInput, handleUserText, ensureFxCtx]);

    const hudChips: Array<{ key: string; label: string; val: string | null }> = [
        { key: "theta_deg", label: "θ", val: paramHud.theta_deg != null ? `${Math.round(paramHud.theta_deg)}°` : null },
        { key: "v", label: "|v|", val: paramHud.v != null ? `${(paramHud.v / 1e5).toFixed(1)}×10⁵ m/s` : null },
        { key: "B", label: "B", val: paramHud.B != null ? `${Math.round(paramHud.B * 1000)} mT` : null },
        { key: "q_sign", label: "q", val: paramHud.q_sign != null ? (paramHud.q_sign > 0 ? "+e" : "−e") : null },
    ];
    const paceLabel = pace.paused ? "⏸ Paused" : pace.rate != null && pace.rate < 1 ? `${pace.rate}× slow-mo` : null;
    const hudActive = paceLabel != null || hudChips.some((c) => c.val != null);
    // The mic shows the living voice orb whenever a turn is in flight.
    const orbActive = convMode || recording || thinking || speaking;

    return (
        <div className={`${fontClass} relative flex h-screen flex-col overflow-hidden bg-stone-900 text-stone-200`}>
            {/* Ambient warm glow so the dark page isn't flat */}
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background:
                        "radial-gradient(46% 38% at 100% 0%, rgba(203,104,67,.07), transparent 60%), radial-gradient(40% 32% at 0% 100%, rgba(116,181,148,.04), transparent 60%)",
                }}
            />

            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="relative z-10 flex shrink-0 items-center gap-3.5 border-b border-white/[0.06] bg-stone-900/80 px-5 py-2.5 backdrop-blur">
                <div className="flex shrink-0 items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-brand shadow-md shadow-brand/30">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                            <circle cx="12" cy="12" r="2.3" fill="#fff" />
                            <ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" strokeWidth="1.5" />
                            <ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" strokeWidth="1.5" transform="rotate(60 12 12)" />
                            <ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" strokeWidth="1.5" transform="rotate(120 12 12)" />
                        </svg>
                    </div>
                    <span className="font-serif text-[18px] font-semibold text-stone-100">PhysicsMind</span>
                </div>
                <div className="h-6 w-px shrink-0 bg-white/10" />
                <div className="min-w-0 flex-1 truncate font-serif text-[16px] italic text-stone-300">{conceptName}</div>
                {!simReady && (
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-amber-300">
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> Loading…
                    </span>
                )}
                <span className="shrink-0 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft">
                    Teacher-Verified
                </span>
            </header>

            {/* ── Body: collapsible rails frame a full-height sim ───────── */}
            <div className="relative z-10 flex min-h-0 flex-1">
                {/* Left: lesson states — collapses to a numbered-dots strip */}
                <aside
                    className={`flex shrink-0 flex-col overflow-hidden border-r border-white/[0.06] transition-all duration-200 ${
                        statesCollapsed ? "w-[54px]" : "w-[212px]"
                    }`}
                >
                    <div className="flex shrink-0 items-center gap-1 px-2.5 py-3">
                        {!statesCollapsed && (
                            <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-stone-500">Today&apos;s lesson</span>
                        )}
                        <button
                            onClick={toggleStates}
                            title={statesCollapsed ? "Expand lesson states" : "Collapse lesson states"}
                            className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-lg text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
                        >
                            {statesCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </button>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-3">
                        {states.map((s, i) => {
                            const on = activeState === s.id;
                            if (statesCollapsed) {
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => onSelectState(s.id)}
                                        title={s.title}
                                        className={`grid h-9 w-9 shrink-0 place-items-center self-center rounded-lg font-serif text-sm font-semibold transition-colors ${
                                            on
                                                ? "bg-brand text-white shadow-md shadow-brand/30"
                                                : "bg-stone-800/60 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            }
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => onSelectState(s.id)}
                                    title={s.title}
                                    className={`relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left transition-colors ${
                                        on ? "bg-brand/[0.14]" : "hover:bg-stone-800/60"
                                    }`}
                                >
                                    {on && <span className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded bg-brand" />}
                                    <span className={`font-serif text-sm font-semibold ${on ? "text-brand-soft" : "text-stone-500"}`}>{i + 1}</span>
                                    <span className={`line-clamp-2 text-[12.5px] leading-snug ${on ? "text-stone-100" : "text-stone-400"}`}>
                                        {shortLabel(s.title)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Center: the simulation — fills all remaining space */}
                <section className="relative flex min-w-0 flex-1 flex-col p-3">
                    <div
                        className="pointer-events-none absolute inset-0 z-0"
                        style={{ background: "radial-gradient(58% 50% at 50% 45%, rgba(203,104,67,.08), transparent 75%)" }}
                    />
                    <div
                        className="relative z-10 flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl border border-brand/25 bg-black"
                        style={{ boxShadow: "0 18px 50px -24px rgba(0,0,0,.85), inset 0 1px 0 rgba(255,214,176,.07), inset 0 0 70px rgba(0,0,0,.45)" }}
                    >
                        {simMounted && (
                            <iframe
                                key={simKey}
                                ref={iframeRef}
                                title="voice professor sim"
                                srcDoc={simHtml}
                                sandbox="allow-scripts allow-same-origin"
                                onLoad={onSimLoad}
                                className="block h-full w-full"
                            />
                        )}

                        {hudActive && (
                            <div
                                className="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 backdrop-blur"
                                style={{ background: "rgba(10,8,6,.66)" }}
                            >
                                <span className="mr-1 text-[10px] uppercase tracking-wider text-brand-soft">Professor is controlling</span>
                                {paceLabel && (
                                    <span className="rounded-md border border-amber-500/60 bg-amber-500/15 px-2 py-0.5 font-mono text-xs text-amber-100">
                                        {paceLabel}
                                    </span>
                                )}
                                {hudChips
                                    .filter((c) => c.val != null)
                                    .map((c) => (
                                        <span
                                            key={c.key}
                                            className={`rounded-md border px-2 py-0.5 font-mono text-xs transition-all ${
                                                hudPulse === c.key ? "border-brand bg-brand/20 text-stone-50" : "border-white/10 bg-white/5 text-stone-200"
                                            }`}
                                        >
                                            {c.label} = {c.val}
                                        </span>
                                    ))}
                            </div>
                        )}

                        {/* sim controls as subtle overlays so the canvas keeps the space */}
                        <button
                            onClick={runScriptedDemo}
                            className="absolute right-3 top-3 rounded-lg border border-brand/30 bg-black/55 px-3 py-1.5 text-[12px] font-semibold text-brand-soft backdrop-blur transition-colors hover:bg-brand/20"
                        >
                            ▶ Hero demo <span className="font-normal text-stone-500">(F2)</span>
                        </button>
                        {/* chat collapsed → keep voice + reopen one tap away over the sim */}
                        {chatCollapsed && (
                            <div className="absolute bottom-4 right-4 flex items-center gap-2.5">
                                <button
                                    onClick={toggleChat}
                                    title="Open professor chat"
                                    className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-stone-800/90 text-stone-200 shadow-lg backdrop-blur transition-colors hover:bg-stone-700"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={toggleMic}
                                    disabled={!micSupported}
                                    title={convMode ? "Conversation on — tap to end" : recording ? "Recording — tap to send" : "Tap to talk"}
                                    className={`grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-xl transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-40 ${
                                        orbActive ? "animate-pulse" : ""
                                    }`}
                                    style={{
                                        boxShadow: orbActive
                                            ? "0 0 0 4px rgba(203,104,67,.25), 0 14px 36px -6px rgba(203,104,67,.85)"
                                            : "0 14px 32px -8px rgba(203,104,67,.7)",
                                    }}
                                >
                                    <Mic className="h-6 w-6" />
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right: minimal voice panel — big mic · ask field · whole concept */}
                <aside
                    className={`flex shrink-0 flex-col overflow-hidden border-l border-white/[0.06] transition-all duration-200 ${
                        chatCollapsed ? "w-0" : "w-[340px]"
                    }`}
                >
                    <div className="flex w-[340px] flex-1 flex-col p-4">
                        {/* subtle collapse control — the only chrome */}
                        <div className="flex shrink-0 justify-end">
                            <button
                                onClick={toggleChat}
                                title="Collapse panel"
                                className="grid h-7 w-7 place-items-center rounded-lg text-stone-500 transition-colors hover:bg-stone-800 hover:text-stone-200"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className={`flex flex-1 flex-col items-center gap-7 px-1 pb-6 ${convMode ? "justify-start pt-1" : "justify-center"}`}>
                            {/* big mic */}
                            <div className="flex flex-col items-center gap-3.5">
                                <button
                                    onClick={toggleMic}
                                    disabled={!micSupported}
                                    className="relative grid h-28 w-28 place-items-center rounded-full transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {/* idle face: terracotta mic (fades out while the orb is live) */}
                                    <span
                                        className={`absolute inset-0 grid place-items-center rounded-full bg-brand text-white transition-opacity duration-200 ${
                                            orbActive ? "opacity-0" : "opacity-100"
                                        }`}
                                        style={{ boxShadow: "0 18px 50px -12px rgba(203,104,67,.6), inset 0 2px 0 rgba(255,255,255,.25)" }}
                                    >
                                        <Mic className="h-11 w-11" />
                                    </span>
                                    {/* the living voice orb */}
                                    <VoiceOrb ref={orbRef} active={orbActive} />
                                </button>
                                <span
                                    className={`text-sm font-medium ${
                                        thinking ? "text-amber-300" : speaking ? "text-brand-soft" : (convMode || recording || listening) ? "text-rose-300" : "text-stone-400"
                                    }`}
                                >
                                    {thinking ? "Thinking…" : speaking ? "Speaking…" : (convMode || recording || listening) ? "Listening…" : "Tap to talk"}
                                </span>
                                {convMode && <span className="text-[11px] text-stone-500">tap the mic to end</span>}
                            </div>

                            {!convMode ? (
                            <>
                            {/* ask field */}
                            <div className="w-full">
                                <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-stone-800 p-1.5 transition-colors focus-within:border-brand/50">
                                    <input
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") onSendText();
                                        }}
                                        placeholder="Ask anything…"
                                        className="flex-1 bg-transparent px-2.5 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none"
                                    />
                                    <button
                                        onClick={onSendText}
                                        title="Send"
                                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-deep"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                                {!micSupported && <p className="mt-2 text-center text-xs text-amber-400">Mic unavailable — type your question.</p>}
                            </div>

                            {/* whole concept */}
                            <button
                                onClick={() => {
                                    ensureFxCtx();
                                    runTurn("explain_whole");
                                }}
                                className="flex items-center gap-2 rounded-full border border-white/10 bg-stone-800/70 px-5 py-2.5 text-sm font-semibold text-stone-200 transition-colors hover:border-brand/40 hover:bg-stone-800 hover:text-white"
                            >
                                <Play className="h-4 w-4 fill-current text-brand" /> Whole concept
                            </button>
                            </>
                            ) : (
                            /* transparent live transcript — you (right) ↔ professor (left), no bubbles */
                            <div ref={logRef} className="w-full flex-1 overflow-y-auto px-1 pt-1 space-y-2">
                                {log.every((e) => e.role === "nav") && !interim && (
                                    <p className="px-2 text-center text-[13px] italic text-stone-500/70">Listening… just start talking. Tap the mic to end.</p>
                                )}
                                {log.map((e, i) => {
                                    if (e.role === "nav") return null;
                                    const cls = e.role === "student"
                                        ? "text-right text-stone-300/75"
                                        : e.role === "professor"
                                            ? "text-left text-brand-soft/85"
                                            : "text-center text-xs text-rose-300/70";
                                    return <p key={i} className={`text-[13px] leading-snug ${cls}`}>{e.text}</p>;
                                })}
                                {interim && <p className="text-right text-[13px] italic leading-snug text-stone-400/55">{interim}</p>}
                            </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
