"use client";

import { useState, FormEvent } from "react";
import { HelpCircle, X } from "lucide-react";
import SubSimPlayer, { type TeacherScriptSentence } from "@/components/SubSimPlayer";
import DeepDiveFeedbackThumbs from "@/components/DeepDiveFeedbackThumbs";

interface Props {
    conceptId: string | null | undefined;
    currentStateId: string | null | undefined;
    classLevel?: string;
    mode?: string;
    sessionId?: string;
    /** When true, the collapsed trigger is a compact icon-only chip suitable for
     *  inline placement in a toolbar. Expanded form stays full-width below. */
    compact?: boolean;
}

type ResultState =
    | { status: "idle" }
    | { status: "loading" }
    | {
          status: "ok";
          clusterId: string | null;
          reasoning: string;
          protocol?: string | null;
          teacherScript: TeacherScriptSentence[];
          simHtml?: string;
          fromCache?: boolean;
          reviewStatus?: string;
          noMatchMessage?: string;
          cacheId?: string | null;
      }
    | { status: "error"; message: string };

export default function DrillDownWidget({ conceptId, currentStateId, classLevel, mode, sessionId, compact = false }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [text, setText] = useState("");
    const [result, setResult] = useState<ResultState>({ status: "idle" });

    const canSubmit = !!conceptId && !!currentStateId && text.trim().length >= 3;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;
        setResult({ status: "loading" });
        try {
            const res = await fetch("/api/drill-down", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    concept_id: conceptId,
                    state_id: currentStateId,
                    confusion_text: text.trim(),
                    class_level: classLevel ?? "11",
                    mode: mode ?? "conceptual",
                    session_id: sessionId,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setResult({ status: "error", message: body.error ?? `HTTP ${res.status}` });
                return;
            }
            const data = await res.json();
            if (!data.cluster_id) {
                setResult({
                    status: "ok",
                    clusterId: null,
                    reasoning: data.reasoning ?? "",
                    teacherScript: [],
                    noMatchMessage: data.message ?? "No matching confusion cluster.",
                });
                return;
            }
            const ts = Array.isArray(data.teacher_script_flat) ? data.teacher_script_flat : [];
            setResult({
                status: "ok",
                clusterId: data.cluster_id,
                reasoning: data.reasoning ?? "",
                protocol: data.protocol ?? null,
                teacherScript: ts as TeacherScriptSentence[],
                simHtml: typeof data.sim_html === "string" ? data.sim_html : undefined,
                fromCache: !!data.from_cache,
                reviewStatus: typeof data.status === "string" ? data.status : undefined,
                cacheId: typeof data.id === "string" ? data.id : null,
            });
        } catch (err) {
            setResult({ status: "error", message: err instanceof Error ? err.message : "Network error" });
        }
    }

    function clear() {
        setText("");
        setResult({ status: "idle" });
    }

    if (!conceptId || !currentStateId) return null;

    // Compact mode renders as a chip trigger + portal-like fixed overlay so the
    // expanded form doesn't break the surrounding flex row. Non-compact keeps
    // the old inline full-width treatment.
    if (compact) {
        return (
            <>
                <button
                    onClick={() => setExpanded(v => !v)}
                    aria-label="I'm confused about something — ask for a more targeted explanation"
                    aria-expanded={expanded}
                    title="Stuck on this step? Type your confusion"
                    className={`shrink-0 h-7 px-2.5 flex items-center gap-1.5 rounded-md text-[11px] font-semibold transition ${
                        expanded
                            ? "bg-amber-500/25 text-amber-100 border border-amber-400/60"
                            : "text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
                    }`}
                >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Confused?</span>
                </button>
                {expanded && (
                    <div className="absolute right-3 top-[calc(100%+4px)] z-30 w-[min(520px,90vw)] bg-zinc-950 border border-amber-500/30 rounded-lg shadow-xl">
                        <div className="px-3 py-2 space-y-2">
                            <form onSubmit={onSubmit} className="flex items-center gap-2">
                                <HelpCircle className="shrink-0 w-3.5 h-3.5 text-amber-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    placeholder="e.g. why doesn't gravity tilt with the surface?"
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                                    disabled={result.status === "loading"}
                                />
                                <button
                                    type="submit"
                                    disabled={!canSubmit || result.status === "loading"}
                                    className="px-2.5 py-1 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-[11px] font-semibold rounded transition hover:brightness-110"
                                    style={!canSubmit || result.status === "loading"
                                        ? undefined
                                        : { backgroundColor: 'rgb(var(--accent))' }}
                                >
                                    {result.status === "loading" ? "…" : "Ask"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setExpanded(false); clear(); }}
                                    className="p-1 text-zinc-500 hover:text-zinc-200 transition"
                                    aria-label="Close"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </form>
                            {result.status === "ok" && result.clusterId === null && (
                                <div className="px-2 py-2 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-400">
                                    <p>{result.noMatchMessage}</p>
                                    <p className="mt-1 italic text-zinc-600">{result.reasoning}</p>
                                </div>
                            )}
                            {result.status === "ok" && result.clusterId && (
                                <div className="px-2 py-2 bg-zinc-900 border border-zinc-800 rounded space-y-2 max-h-[320px] overflow-y-auto">
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                                        <span className="text-amber-400">{result.clusterId}</span>
                                        {result.protocol && (
                                            <span className="px-1.5 py-0.5 bg-purple-900/40 border border-purple-800/60 text-purple-300 rounded">
                                                {result.protocol}
                                            </span>
                                        )}
                                        {result.fromCache ? (
                                            <span className="text-zinc-600">cached</span>
                                        ) : (
                                            <span className="text-zinc-600">fresh</span>
                                        )}
                                        {result.reviewStatus === "pending_review" && (
                                            <span className="text-amber-500">pending review</span>
                                        )}
                                    </div>
                                    {result.teacherScript.length === 0 ? (
                                        <p className="text-[11px] text-zinc-500 italic">No response content.</p>
                                    ) : result.simHtml ? (
                                        <SubSimPlayer
                                            simHtml={result.simHtml}
                                            teacherScript={result.teacherScript}
                                            heightPx={220}
                                        />
                                    ) : (
                                        result.teacherScript.map((s, i) => (
                                            <p key={s.id ?? i} className="text-[12px] text-zinc-200 leading-relaxed">
                                                {s.text}
                                            </p>
                                        ))
                                    )}
                                    {result.cacheId && sessionId && (
                                        <DeepDiveFeedbackThumbs
                                            key={result.cacheId}
                                            kind="drill-down"
                                            cacheId={result.cacheId}
                                            sessionId={sessionId}
                                        />
                                    )}
                                </div>
                            )}
                            {result.status === "error" && (
                                <p className="px-2 text-[11px] text-red-400">Error: {result.message}</p>
                            )}
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="border-b border-zinc-800 bg-zinc-950">
            {!expanded ? (
                <button
                    onClick={() => setExpanded(true)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-amber-300/90 hover:text-amber-200 bg-amber-500/5 hover:bg-amber-500/10 border-l-2 border-amber-500/50 transition text-left"
                >
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span className="flex-1">I&apos;m confused about something…</span>
                    <span className="text-[10px] text-amber-400/60 shrink-0 hidden sm:inline">type to get unstuck</span>
                </button>
            ) : (
                <div className="px-3 py-2 space-y-2">
                    <form onSubmit={onSubmit} className="flex items-center gap-2">
                        <HelpCircle className="shrink-0 w-3.5 h-3.5 text-zinc-500" />
                        <input
                            type="text"
                            autoFocus
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="e.g. why doesn't gravity tilt with the surface?"
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-600"
                            disabled={result.status === "loading"}
                        />
                        <button
                            type="submit"
                            disabled={!canSubmit || result.status === "loading"}
                            className="px-2.5 py-1 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-[11px] font-semibold rounded transition hover:brightness-110"
                            style={!canSubmit || result.status === "loading"
                                ? undefined
                                : { backgroundColor: 'rgb(var(--accent))' }}
                        >
                            {result.status === "loading" ? "…" : "Ask"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setExpanded(false);
                                clear();
                            }}
                            className="p-1 text-zinc-500 hover:text-zinc-200 transition"
                            aria-label="Close"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </form>

                    {result.status === "ok" && result.clusterId === null && (
                        <div className="px-2 py-2 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-400">
                            <p>{result.noMatchMessage}</p>
                            <p className="mt-1 italic text-zinc-600">{result.reasoning}</p>
                        </div>
                    )}

                    {result.status === "ok" && result.clusterId && (
                        <div className="px-2 py-2 bg-zinc-900 border border-zinc-800 rounded space-y-2">
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                                <span className="text-amber-400">{result.clusterId}</span>
                                {result.protocol && (
                                    <span className="px-1.5 py-0.5 bg-purple-900/40 border border-purple-800/60 text-purple-300 rounded">
                                        {result.protocol}
                                    </span>
                                )}
                                {result.fromCache ? (
                                    <span className="text-zinc-600">cached</span>
                                ) : (
                                    <span className="text-zinc-600">fresh</span>
                                )}
                                {result.reviewStatus === "pending_review" && (
                                    <span className="text-amber-500">pending review</span>
                                )}
                            </div>
                            {result.teacherScript.length === 0 ? (
                                <p className="text-[11px] text-zinc-500 italic">No response content.</p>
                            ) : result.simHtml ? (
                                <SubSimPlayer
                                    simHtml={result.simHtml}
                                    teacherScript={result.teacherScript}
                                    heightPx={260}
                                />
                            ) : (
                                result.teacherScript.map((s, i) => (
                                    <p key={s.id ?? i} className="text-[12px] text-zinc-200 leading-relaxed">
                                        {s.text}
                                    </p>
                                ))
                            )}
                            {result.cacheId && sessionId && (
                                <DeepDiveFeedbackThumbs
                                    key={result.cacheId}
                                    kind="drill-down"
                                    cacheId={result.cacheId}
                                    sessionId={sessionId}
                                />
                            )}
                        </div>
                    )}

                    {result.status === "error" && (
                        <p className="px-2 text-[11px] text-red-400">Error: {result.message}</p>
                    )}
                </div>
            )}
        </div>
    );
}
