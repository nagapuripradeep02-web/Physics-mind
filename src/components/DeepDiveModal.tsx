"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import SubSimPlayer, { type TeacherScriptSentence } from "@/components/SubSimPlayer";

interface Props {
    open: boolean;
    conceptId: string;
    stateId: string;
    classLevel?: string;
    mode?: string;
    sessionId?: string;
    onClose: () => void;
}

type FetchState =
    | { status: "idle" }
    | { status: "loading" }
    | {
          status: "ok";
          teacherScript: TeacherScriptSentence[];
          simHtml: string;
          fromCache: boolean;
          servedCount: number;
          reviewStatus: string;
      }
    | { status: "error"; message: string };

export default function DeepDiveModal({ open, conceptId, stateId, classLevel, mode, sessionId, onClose }: Props) {
    const [state, setState] = useState<FetchState>({ status: "idle" });

    useEffect(() => {
        if (!open) return;

        let cancelled = false;
        setState({ status: "loading" });

        void (async () => {
            try {
                const res = await fetch("/api/deep-dive", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        concept_id: conceptId,
                        state_id: stateId,
                        class_level: classLevel ?? "11",
                        mode: mode ?? "conceptual",
                        session_id: sessionId,
                    }),
                });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    if (!cancelled) setState({ status: "error", message: body.error ?? `HTTP ${res.status}` });
                    return;
                }
                const data = await res.json();
                if (cancelled) return;
                const ts = Array.isArray(data.teacher_script_flat) ? data.teacher_script_flat : [];
                setState({
                    status: "ok",
                    teacherScript: ts as TeacherScriptSentence[],
                    simHtml: typeof data.sim_html === "string" ? data.sim_html : "",
                    fromCache: !!data.from_cache,
                    servedCount: typeof data.served_count === "number" ? data.served_count : 0,
                    reviewStatus: typeof data.status === "string" ? data.status : "unknown",
                });
            } catch (err) {
                if (!cancelled) {
                    setState({ status: "error", message: err instanceof Error ? err.message : "Network error" });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [open, conceptId, stateId, classLevel, mode, sessionId]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-zinc-800">
                    <div>
                        <h2 className="text-sm font-semibold text-white">Explain step-by-step</h2>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            {conceptId} / {stateId}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {state.status === "loading" && (
                        <div className="py-12 text-center">
                            <div className="inline-flex items-center gap-2 text-sm text-zinc-400">
                                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                                <span>Generating step-by-step explanation…</span>
                            </div>
                            <p className="text-xs text-zinc-600 mt-2">
                                First time for this state — takes ~5 seconds. Cached after this.
                            </p>
                        </div>
                    )}

                    {state.status === "error" && (
                        <div className="py-8 text-center">
                            <p className="text-sm text-red-400">Could not load deep-dive.</p>
                            <p className="text-xs text-zinc-500 mt-2 font-mono">{state.message}</p>
                        </div>
                    )}

                    {state.status === "ok" && (
                        <div>
                            {state.teacherScript.length === 0 ? (
                                <p className="text-sm text-zinc-500 italic">No sub-state content returned.</p>
                            ) : state.simHtml ? (
                                <SubSimPlayer
                                    simHtml={state.simHtml}
                                    teacherScript={state.teacherScript}
                                    heightPx={340}
                                />
                            ) : (
                                // Fallback: no sim HTML (unexpected) — show text list
                                <div className="space-y-3">
                                    {state.teacherScript.map((s, i) => (
                                        <div key={s.id ?? i} className="flex gap-3">
                                            <div className="shrink-0 w-6 h-6 rounded-full bg-blue-900/40 border border-blue-800/60 flex items-center justify-center text-[11px] font-semibold text-blue-300">
                                                {i + 1}
                                            </div>
                                            <p className="text-sm text-zinc-200 leading-relaxed pt-0.5">{s.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {state.status === "ok" && (
                    <div className="shrink-0 px-5 py-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                        <span>
                            {state.fromCache ? "From cache" : "Freshly generated"}
                            <span className="mx-2">·</span>
                            {state.reviewStatus === "pending_review" ? (
                                <span className="text-amber-400">Pending review</span>
                            ) : (
                                <span className="text-emerald-400">{state.reviewStatus}</span>
                            )}
                            <span className="mx-2">·</span>
                            Served {state.servedCount}×
                        </span>
                        <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
