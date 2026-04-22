"use client";

import { useState } from "react";
import type { DeepDiveRow } from "./page";
import { AUTO_PROMOTION_POSITIVE_THRESHOLD } from "@/lib/autoPromotion";

interface Props {
    rows: DeepDiveRow[];
}

const CLOSE_TO_PROMOTION = 15;

type ActionState = { status: "idle" } | { status: "pending" } | { status: "done"; action: "approve" | "reject" } | { status: "error"; message: string };

function SolverBadge({ reviewNotes }: { reviewNotes: string | null }) {
    if (!reviewNotes) return null;
    if (reviewNotes.startsWith("solver_schema_invalid")) {
        // e.g. "solver_schema_invalid: 2 violation(s) — N_label:pixel_only, ..."
        const count = reviewNotes.match(/(\d+)\s+violation/i)?.[1] ?? "?";
        return (
            <span
                className="px-1.5 py-0.5 text-[10px] font-mono bg-red-900/60 border border-red-700 text-red-200 rounded"
                title={reviewNotes}
            >
                solver × {count}
            </span>
        );
    }
    if (reviewNotes.startsWith("auto_promoted")) {
        return (
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-emerald-900/60 border border-emerald-700 text-emerald-200 rounded">
                auto-promoted
            </span>
        );
    }
    return null;
}

function firstTtsSentence(row: DeepDiveRow): string {
    if (!row.teacher_script || row.teacher_script.length === 0) return "(no teacher script)";
    return row.teacher_script[0]?.text ?? "(empty)";
}

function firstSubStateTitle(row: DeepDiveRow): string {
    const keys = Object.keys(row.sub_states ?? {});
    if (keys.length === 0) return "(no sub-states)";
    const first = row.sub_states[keys[0]] as { title?: string } | undefined;
    return first?.title ?? "(untitled)";
}

export function DeepDiveReviewList({ rows }: Props) {
    return (
        <div className="space-y-4">
            {rows.map((row) => (
                <DeepDiveCard key={row.id} row={row} />
            ))}
        </div>
    );
}

function FeedbackProgress({ positive, negative }: { positive: number; negative: number }) {
    const pct = Math.min(
        100,
        Math.round((positive / AUTO_PROMOTION_POSITIVE_THRESHOLD) * 100)
    );
    const blocked = negative > 0;
    return (
        <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 max-w-[180px] h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={blocked ? "h-full bg-slate-600" : "h-full bg-emerald-500"}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="font-mono text-slate-300 tabular-nums shrink-0">
                {positive}/{AUTO_PROMOTION_POSITIVE_THRESHOLD} 👍
            </span>
            {negative > 0 && (
                <span className="font-mono text-rose-400 tabular-nums shrink-0">
                    {negative} 👎
                </span>
            )}
        </div>
    );
}

function DeepDiveCard({ row }: { row: DeepDiveRow }) {
    const [expanded, setExpanded] = useState(false);
    const [action, setAction] = useState<ActionState>({ status: "idle" });
    const closeToPromotion =
        row.positive_feedback_count >= CLOSE_TO_PROMOTION &&
        row.negative_feedback_count === 0;

    async function submit(which: "approve" | "reject") {
        setAction({ status: "pending" });
        try {
            const res = await fetch("/api/admin/review-action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ table: "deep_dive_cache", id: row.id, action: which }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setAction({ status: "error", message: body.error ?? `HTTP ${res.status}` });
                return;
            }
            setAction({ status: "done", action: which });
        } catch (err) {
            setAction({ status: "error", message: err instanceof Error ? err.message : "Unknown error" });
        }
    }

    if (action.status === "done") {
        const label = action.action === "approve" ? "Approved" : "Rejected";
        const color = action.action === "approve" ? "text-emerald-400" : "text-red-400";
        return (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 opacity-60">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-mono text-sm text-slate-400">
                            {row.concept_id} / {row.state_id} / {row.class_level} / {row.mode}
                        </div>
                        <div className="text-slate-500 text-xs mt-1">{row.id}</div>
                    </div>
                    <div className={`${color} font-semibold`}>{label}</div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`bg-slate-900 border rounded-lg overflow-hidden ${
                closeToPromotion ? "border-amber-500/70 shadow-[0_0_0_1px_rgba(245,158,11,0.35)]" : "border-slate-700"
            }`}
        >
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <div className="font-mono text-sm text-slate-300 flex items-center gap-2 flex-wrap">
                            <span>
                                <span className="text-blue-400">{row.concept_id}</span>
                                <span className="text-slate-500"> / </span>
                                <span className="text-emerald-400">{row.state_id}</span>
                                <span className="text-slate-500"> / {row.class_level} / {row.mode}</span>
                            </span>
                            <SolverBadge reviewNotes={row.review_notes} />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {Object.keys(row.sub_states ?? {}).length} sub-states
                            <span className="mx-2">·</span>
                            served {row.served_count} time{row.served_count === 1 ? "" : "s"}
                            <span className="mx-2">·</span>
                            {row.generated_by ?? "unknown"} / {row.model ?? "?"}
                            <span className="mx-2">·</span>
                            {new Date(row.created_at).toLocaleString()}
                        </div>
                        <div className="mt-2">
                            <FeedbackProgress
                                positive={row.positive_feedback_count}
                                negative={row.negative_feedback_count}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                        <button
                            onClick={() => submit("approve")}
                            disabled={action.status === "pending"}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded transition"
                        >
                            {action.status === "pending" ? "..." : "Approve"}
                        </button>
                        <button
                            onClick={() => submit("reject")}
                            disabled={action.status === "pending"}
                            className="px-3 py-1.5 bg-red-700 hover:bg-red-600 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded transition"
                        >
                            Reject
                        </button>
                    </div>
                </div>

                <div className="mt-3 bg-slate-950 border border-slate-800 rounded p-3">
                    <div className="text-xs text-slate-500 mb-1">First sub-state title</div>
                    <div className="text-slate-200 text-sm mb-2">{firstSubStateTitle(row)}</div>
                    <div className="text-xs text-slate-500 mb-1">First TTS sentence</div>
                    <div className="text-slate-300 text-sm italic">"{firstTtsSentence(row)}"</div>
                </div>

                <button
                    onClick={() => setExpanded(e => !e)}
                    className="mt-3 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                    {expanded ? "▼ Hide full JSON" : "▶ Show full JSON"}
                </button>

                {expanded && (
                    <div className="mt-2 space-y-3">
                        <div>
                            <div className="text-xs text-slate-500 mb-1">sub_states</div>
                            <pre className="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-300 overflow-x-auto max-h-80">
                                {JSON.stringify(row.sub_states, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 mb-1">teacher_script_flat</div>
                            <pre className="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-300 overflow-x-auto max-h-60">
                                {JSON.stringify(row.teacher_script, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {action.status === "error" && (
                    <div className="mt-3 text-sm text-red-400">Error: {action.message}</div>
                )}
            </div>
        </div>
    );
}
