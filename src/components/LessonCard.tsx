"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    ChevronDown,
    ChevronRight,
    Layers,
    Loader2,
    MessageSquare,
    RefreshCw,
    Send,
    Sigma,
    Sparkles,
    X,
} from "lucide-react";
import { AISimulationRenderer } from "@/components/AISimulationRenderer";
import type { CatalogConcept, NanoDef } from "@/lib/conceptCatalog";
import type { TeacherScriptStep } from "@/lib/aiSimulationGenerator";
import { getSessionId } from "@/lib/session";

type ViewMode = "conceptual" | "board";

interface SimResult {
    simHtml: string | null;
    teacherScript: TeacherScriptStep[] | null;
    allowDeepDiveStates: string[];
    fingerprintKey: string | null;
    conceptId: string | null;
}

interface ChatMessage {
    role: "user" | "assistant";
    text: string;
}

interface NextConceptHint {
    concept_id: string;
    concept_name: string;
}

// ── State progress dots ───────────────────────────────────────────────────────

function StateDots({
    steps,
    currentState,
}: {
    steps: TeacherScriptStep[];
    currentState: string | null;
}) {
    const activeIdx = steps.findIndex(s => s.sim_state === currentState);
    const activeStep = steps[activeIdx] ?? null;

    return (
        <div className="flex items-center gap-3 py-2">
            <div className="flex items-center gap-1">
                {steps.map((s, i) => (
                    <span
                        key={s.sim_state}
                        title={s.title}
                        className={`w-2 h-2 rounded-full transition-all ${
                            i === activeIdx
                                ? "bg-blue-400 scale-125"
                                : i < activeIdx
                                ? "bg-blue-700"
                                : "bg-zinc-700"
                        }`}
                    />
                ))}
            </div>
            {activeStep && (
                <span className="text-[11px] text-zinc-400 truncate">
                    {activeStep.title}
                </span>
            )}
            {steps.length > 0 && (
                <span className="text-[11px] text-zinc-600 ml-auto shrink-0">
                    {activeIdx >= 0 ? activeIdx + 1 : "—"} / {steps.length}
                </span>
            )}
        </div>
    );
}

// ── Confidence rating (per-state, no chatId dependency) ───────────────────────

const RATINGS = [
    { emoji: "😕", value: 1, label: "Very unclear" },
    { emoji: "😐", value: 2, label: "Still confused" },
    { emoji: "🙂", value: 3, label: "Getting it" },
    { emoji: "😊", value: 4, label: "Clear!" },
    { emoji: "💪", value: 5, label: "Got it!" },
];

function StateRating({
    conceptId,
    stateId,
    onLowConfidence,
}: {
    conceptId: string;
    stateId: string | null;
    onLowConfidence: () => void;
}) {
    const [selected, setSelected] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const key = `${conceptId}__${stateId ?? "none"}`;

    // Reset when state changes
    const prevKey = useRef(key);
    if (prevKey.current !== key) {
        prevKey.current = key;
    }

    const handleRate = async (value: number) => {
        if (selected) return;
        setSelected(value);
        setSaving(true);
        try {
            await fetch("/api/chats/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: conceptId,
                    message_idx: stateId ? stateId.replace(/\D/g, "") : 0,
                    rating: value,
                }),
            });
        } catch { }
        setSaving(false);
        if (value <= 2) setTimeout(onLowConfidence, 400);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-600 shrink-0">How clear is this?</span>
            <div className="flex gap-0.5">
                {RATINGS.map(r => (
                    <button
                        key={r.value}
                        onClick={() => handleRate(r.value)}
                        title={r.label}
                        disabled={!!selected || saving}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
                            selected === r.value
                                ? "bg-blue-500/20 scale-110 ring-1 ring-blue-500/40"
                                : selected
                                ? "opacity-30 cursor-default"
                                : "hover:bg-zinc-800 hover:scale-110"
                        }`}
                    >
                        {r.emoji}
                    </button>
                ))}
            </div>
            {selected !== null && selected <= 2 && (
                <span className="text-[11px] text-amber-400">Opening chat…</span>
            )}
        </div>
    );
}

// ── Side-chat drawer ──────────────────────────────────────────────────────────

function SideChatDrawer({
    concept,
    currentStateTitle,
    currentStateId,
    onClose,
}: {
    concept: CatalogConcept;
    currentStateTitle: string | null;
    currentStateId: string | null;
    onClose: () => void;
}) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // One sessionId for the lifetime of this drawer instance — gives the server
    // a stable key to write into student_confusion_log + session_context.
    const sessionIdRef = useRef<string>("");
    if (!sessionIdRef.current) {
        sessionIdRef.current = (typeof crypto !== "undefined" && "randomUUID" in crypto)
            ? crypto.randomUUID()
            : `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    // Authenticated student UUID — read once on mount; null until resolved.
    const [studentId, setStudentId] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        void getSessionId().then(id => {
            if (!cancelled && id) setStudentId(id);
        });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || sending) return;
        setInput("");
        setSending(true);
        const userMsg: ChatMessage = { role: "user", text };
        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        try {
            // Send the FULL message history each turn — the server uses
            // `messages.length` as turnNumber and reuses cached NCERT chunks
            // for follow-ups. Concept and state are sent as STRUCTURED fields
            // (no longer embedded in a context-prefix string).
            const apiMessages = nextMessages.map(m => ({
                role: m.role,
                content: m.text,
            }));
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(studentId ? { "x-user-id": studentId } : {}),
                },
                body: JSON.stringify({
                    messages: apiMessages,
                    mode: "conceptual",
                    sessionId: sessionIdRef.current,
                    profile: { class: `Class ${concept.class_level}` },
                    concept_id: concept.concept_id,
                    state_id: currentStateId ?? null,
                    student_id: studentId,
                }),
            });
            const data = await res.json() as { explanation?: string; error?: string };
            const reply = data.explanation ?? data.error ?? "Something went wrong.";
            setMessages(prev => [...prev, { role: "assistant", text: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: "assistant", text: "Network error — please try again." }]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 shrink-0">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-zinc-200 truncate">
                        {concept.concept_name}
                    </p>
                    {currentStateTitle && (
                        <p className="text-[10px] text-zinc-500 truncate">
                            {currentStateTitle}
                        </p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <Sparkles className="w-5 h-5 text-zinc-700 mx-auto mb-2" />
                        <p className="text-[11px] text-zinc-600">
                            Ask anything about {concept.concept_name}
                        </p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`text-[12px] leading-relaxed ${
                            m.role === "user"
                                ? "text-zinc-300 text-right"
                                : "text-zinc-400"
                        }`}
                    >
                        {m.role === "user" ? (
                            <span className="inline-block bg-blue-600/20 border border-blue-500/30 rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                                {m.text}
                            </span>
                        ) : (
                            <span className="inline-block bg-zinc-900 border border-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 max-w-[95%] whitespace-pre-wrap">
                                {m.text}
                            </span>
                        )}
                    </div>
                ))}
                {sending && (
                    <div className="flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 text-zinc-600 animate-spin" />
                        <span className="text-[11px] text-zinc-600">Thinking…</span>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-zinc-800 shrink-0">
                <div className="flex gap-2 items-end">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void sendMessage();
                            }
                        }}
                        placeholder="Ask about this concept…"
                        rows={2}
                        className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl px-3 py-2 text-[12px] placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60 resize-none leading-relaxed"
                    />
                    <button
                        onClick={() => void sendMessage()}
                        disabled={!input.trim() || sending}
                        className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Lesson-end "Next concept" card ────────────────────────────────────────────

function LessonEndCard({ next }: { next: NextConceptHint }) {
    return (
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600/10 to-emerald-600/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400/70 mb-1">
                Lesson complete
            </p>
            <p className="text-sm text-zinc-300 mb-3">
                Ready for the next concept?
            </p>
            <Link
                href={`/learn/${next.concept_id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-200 text-[13px] font-semibold hover:bg-emerald-600/30 transition-colors"
            >
                {next.concept_name}
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}

// ── Quick definitions (nano content surfaced in-lesson) ──────────────────────

function QuickDefinitionsFooter({ definitions }: { definitions: NanoDef[] }) {
    const [open, setOpen] = useState(false);
    return (
        <section className="rounded-xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
            <button
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-zinc-900/50 transition-colors"
            >
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 shrink-0 transition-transform ${open ? "" : "-rotate-90"}`} />
                <BookOpen className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="text-[12px] font-semibold text-zinc-400">
                    Quick definitions ({definitions.length})
                </span>
                <span className="flex-1 h-px bg-zinc-800/60" />
                <span className="text-[10px] text-zinc-600 shrink-0">
                    Tap a term to expand
                </span>
            </button>
            {open && (
                <div className="px-4 pb-3 pt-1 space-y-2 border-t border-zinc-800/60">
                    {definitions.map(def => (
                        <details key={def.id} className="group rounded-lg border border-zinc-800/80 bg-zinc-900/30">
                            <summary className="cursor-pointer list-none px-3 py-2 flex items-center gap-2 hover:bg-zinc-900/60 rounded-lg">
                                <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0 group-open:rotate-90 transition-transform" />
                                <span className="text-[12px] font-semibold text-zinc-200">
                                    {def.name}
                                </span>
                            </summary>
                            <div className="px-6 pb-2.5 text-[12px] text-zinc-400 leading-relaxed">
                                {def.one_line}
                            </div>
                        </details>
                    ))}
                </div>
            )}
        </section>
    );
}

// ── Main LessonCard ───────────────────────────────────────────────────────────

interface LessonCardProps {
    concept: CatalogConcept;
    classLevel: number;
}

export default function LessonCard({ concept, classLevel }: LessonCardProps) {
    const [mode, setMode] = useState<ViewMode>("conceptual");
    const [sim, setSim] = useState<SimResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentState, setCurrentState] = useState<string | null>(null);
    const [simReady, setSimReady] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [nextConcept, setNextConcept] = useState<NextConceptHint | null>(null);
    const [lessonDone, setLessonDone] = useState(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const loadedModeRef = useRef<ViewMode | null>(null);

    // Derive unique ordered state steps from teacherScript
    const stateSteps: TeacherScriptStep[] = (() => {
        if (!sim?.teacherScript) return [];
        const seen = new Set<string>();
        return sim.teacherScript.filter(s => {
            if (seen.has(s.sim_state)) return false;
            seen.add(s.sim_state);
            return true;
        });
    })();

    const currentStateTitle = stateSteps.find(s => s.sim_state === currentState)?.title ?? null;
    const isLastState = stateSteps.length > 0 && currentState === stateSteps[stateSteps.length - 1]?.sim_state;
    const isDeepDiveState = sim?.allowDeepDiveStates.includes(currentState ?? "") ?? false;

    // Fetch simulation — handles both single-panel and multi_panel API shapes.
    const fetchSim = useCallback(async (targetMode: ViewMode) => {
        if (loadedModeRef.current === targetMode && sim?.simHtml) return;
        setLoading(true);
        setError(null);
        setCurrentState(null);
        setSimReady(false);
        setLessonDone(false);
        try {
            const res = await fetch("/api/generate-simulation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    concept: concept.concept_id,
                    classLevel: String(classLevel),
                    mode: targetMode,
                    examMode: targetMode,
                }),
            });
            if (!res.ok) throw new Error(`Simulation API ${res.status}`);
            const data = await res.json() as {
                type?: string;
                // Single-panel shape
                simHtml?: string | null;
                // Multi-panel shape
                panel_a?: { simHtml?: string | null; sim_html?: string | null };
                // Common fields
                teacherScript?: TeacherScriptStep[] | null;
                allowDeepDiveStates?: string[];
                fingerprintKey?: string | null;
                conceptId?: string | null;
            };

            // Resolve simHtml for both response shapes
            let resolvedHtml: string | null = null;
            if (data.type === "multi_panel") {
                const pa = data.panel_a;
                resolvedHtml = (pa?.simHtml ?? pa?.sim_html ?? null) as string | null;
            } else {
                resolvedHtml = data.simHtml ?? null;
            }

            setSim({
                simHtml: resolvedHtml,
                teacherScript: data.teacherScript ?? null,
                allowDeepDiveStates: data.allowDeepDiveStates ?? [],
                fingerprintKey: data.fingerprintKey ?? null,
                conceptId: data.conceptId ?? null,
            });
            loadedModeRef.current = targetMode;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load simulation.");
        } finally {
            setLoading(false);
        }
    }, [concept.concept_id, classLevel, sim?.simHtml]);

    // Load on mount
    useEffect(() => {
        void fetchSim("conceptual");
    }, [concept.concept_id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Mode toggle: re-fetch
    const switchMode = (next: ViewMode) => {
        if (next === loadedModeRef.current) return;
        setSim(null);
        setMode(next);
        void fetchSim(next);
    };

    // Fetch next concept hint once lesson ends
    useEffect(() => {
        if (!isLastState || nextConcept) return;
        fetch(`/api/catalog?levels=${classLevel}`)
            .then(r => r.ok ? r.json() : null)
            .then((chapters: unknown) => {
                if (!Array.isArray(chapters)) return;
                const allLive = (chapters as Array<{ concepts: Array<{ concept_id: string; concept_name: string; status: string }> }>)
                    .flatMap(ch => ch.concepts.filter(c => c.status === "live"));
                const idx = allLive.findIndex(c => c.concept_id === concept.concept_id);
                if (idx >= 0 && idx < allLive.length - 1) {
                    const n = allLive[idx + 1];
                    setNextConcept({ concept_id: n.concept_id, concept_name: n.concept_name });
                }
            })
            .catch(() => null);
    }, [isLastState, concept.concept_id, classLevel, nextConcept]);

    // postMessage listener — STATE_REACHED, SIM_READY
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (!e.data || typeof e.data !== "object") return;
            if (e.data.type === "SIM_READY") {
                setSimReady(true);
            }
            if (e.data.type === "STATE_REACHED" && typeof e.data.state === "string") {
                setCurrentState(e.data.state as string);
            }
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    // Mark lesson done when last state is reached (with a brief delay)
    useEffect(() => {
        if (!isLastState) return;
        const t = setTimeout(() => setLessonDone(true), 3000);
        return () => clearTimeout(t);
    }, [isLastState]);

    const handleLowConfidence = () => setChatOpen(true);

    const handleDeepDive = async () => {
        if (!currentState || !isDeepDiveState) return;
        setChatOpen(true);
    };

    const handleVariant = () => {
        setSim(null);
        loadedModeRef.current = null;
        void fetchSim(mode);
    };

    return (
        <div className="flex gap-4 h-full">
            {/* ── Main content ── */}
            <div className={`flex flex-col gap-4 min-w-0 transition-all ${chatOpen ? "flex-1" : "w-full"}`}>
                {/* Why am I learning this? — pedagogical motivation, JEE/NEET-framed.
                    Renders only when authored on the concept; no generic fallback. */}
                {concept.why_learn && (
                    <div className="flex gap-3 rounded-lg border border-blue-500/20 bg-blue-600/5 p-3">
                        <span className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/30 text-blue-300 shrink-0">
                            <Sparkles className="w-3.5 h-3.5" />
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-semibold uppercase tracking-widest text-blue-300/80 mb-0.5">
                                Why this matters
                            </div>
                            <p className="text-[13px] text-zinc-200 leading-relaxed">
                                {concept.why_learn}
                            </p>
                        </div>
                    </div>
                )}

                {/* Mode toggle */}
                <div className="flex items-center gap-2">
                    <div className="flex gap-1 rounded-lg bg-zinc-900 border border-zinc-800 p-1">
                        <button
                            onClick={() => switchMode("conceptual")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                                mode === "conceptual"
                                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                                    : "text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            Conceptual
                        </button>
                        <button
                            onClick={() => switchMode("board")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                                mode === "board"
                                    ? "bg-amber-600/20 text-amber-300 border border-amber-500/30"
                                    : "text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            <Sigma className="w-3.5 h-3.5" />
                            Board / Exam
                        </button>
                    </div>
                    {loading && (
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            {sim ? "Switching mode…" : "Loading simulation…"}
                        </div>
                    )}
                </div>

                {/* Simulation player */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
                    <div className="aspect-video">
                        {error ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                                <p className="text-sm text-red-400">{error}</p>
                                <button
                                    onClick={handleVariant}
                                    className="inline-flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-zinc-200"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <AISimulationRenderer
                                simHtml={sim?.simHtml ?? null}
                                isLoading={loading}
                                concept={concept.concept_name}
                                iframeRef={iframeRef}
                                hideZoomOverlay={false}
                            />
                        )}
                    </div>

                    {/* State progress bar */}
                    {stateSteps.length > 0 && (
                        <div className="px-4 py-2 border-t border-zinc-800/60">
                            <StateDots steps={stateSteps} currentState={currentState} />
                        </div>
                    )}
                </div>

                {/* ConfidenceMeter + action chips */}
                {sim?.simHtml && !loading && (
                    <div className="flex flex-col gap-3">
                        <StateRating
                            conceptId={concept.concept_id}
                            stateId={currentState}
                            onLowConfidence={handleLowConfidence}
                        />
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setChatOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-blue-500/40 text-zinc-300 text-[12px] font-semibold transition-all hover:text-zinc-100"
                            >
                                <span>🤔</span> I&apos;m confused
                            </button>
                            {isDeepDiveState && (
                                <button
                                    onClick={() => void handleDeepDive()}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 text-zinc-300 text-[12px] font-semibold transition-all hover:text-zinc-100"
                                >
                                    <span>🪜</span> Step-by-step
                                </button>
                            )}
                            <button
                                onClick={handleVariant}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-500 text-[12px] font-semibold transition-all hover:text-zinc-300"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Try a variant
                            </button>
                        </div>
                    </div>
                )}

                {/* Lesson-end next concept */}
                {lessonDone && nextConcept && (
                    <LessonEndCard next={nextConcept} />
                )}
                {lessonDone && !nextConcept && (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-center">
                        <Sparkles className="w-5 h-5 text-zinc-600 mx-auto mb-2" />
                        <p className="text-sm text-zinc-400">You&apos;ve completed this chapter&apos;s content.</p>
                        <Link
                            href="/learn"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mt-3"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            Back to catalog
                        </Link>
                    </div>
                )}

                {/* Quick definitions — invisible nano content surfaced inline.
                    Renders only when the JSON has nano_definitions[]. */}
                {concept.nano_definitions && concept.nano_definitions.length > 0 && (
                    <QuickDefinitionsFooter definitions={concept.nano_definitions} />
                )}
            </div>

            {/* ── Side-chat drawer ── */}
            {chatOpen && (
                <div className="w-80 shrink-0 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden">
                    <SideChatDrawer
                        concept={concept}
                        currentStateTitle={currentStateTitle}
                        currentStateId={currentState}
                        onClose={() => setChatOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}
