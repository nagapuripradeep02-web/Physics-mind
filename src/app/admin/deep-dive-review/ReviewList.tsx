"use client";

import { useState } from "react";
import type { DeepDiveRow } from "./page";

interface Props {
    rows: DeepDiveRow[];
}

type ActionState = { status: "idle" } | { status: "pending" } | { status: "done"; action: "approve" | "reject" } | { status: "error"; message: string };

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

function DeepDiveCard({ row }: { row: DeepDiveRow }) {
    const [expanded, setExpanded] = useState(false);
    const [action, setAction] = useState<ActionState>({ status: "idle" });

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
        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <div className="font-mono text-sm text-slate-300">
                            <span className="text-blue-400">{row.concept_id}</span>
                            <span className="text-slate-500"> / </span>
                            <span className="text-emerald-400">{row.state_id}</span>
                            <span className="text-slate-500"> / {row.class_level} / {row.mode}</span>
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
