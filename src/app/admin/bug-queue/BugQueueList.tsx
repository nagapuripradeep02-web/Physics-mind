"use client";

import { useMemo, useState } from "react";
import type { BugQueueRow } from "./page";

interface Props {
    rows: BugQueueRow[];
}

type ActionState =
    | { status: "idle" }
    | { status: "pending"; action: string }
    | { status: "done"; message: string }
    | { status: "error"; message: string };

type ProbeResult =
    | {
          ok: true;
          probe_type: "sql";
          result: unknown;
      }
    | {
          ok: true;
          probe_type: "js_eval";
          body: string;
      }
    | {
          ok: true;
          probe_type: "manual";
          instruction: string;
      }
    | { ok: false; error: string };

const STATUSES = ["OPEN", "FIXED", "DEFERRED", "NOT_REPRODUCING"] as const;
const OWNERS = [
    "alex:architect",
    "alex:physics_author",
    "alex:json_author",
    "peter_parker:renderer_primitives",
    "peter_parker:runtime_generation",
    "ambiguous",
] as const;

function StatusBadge({ status }: { status: BugQueueRow["status"] }) {
    const colorMap: Record<BugQueueRow["status"], string> = {
        OPEN: "bg-amber-900/60 border-amber-700 text-amber-200",
        FIXED: "bg-emerald-900/60 border-emerald-700 text-emerald-200",
        DEFERRED: "bg-blue-900/60 border-blue-700 text-blue-200",
        NOT_REPRODUCING:
            "bg-slate-800 border-slate-700 text-slate-300",
    };
    return (
        <span
            className={`px-2 py-0.5 text-[10px] font-mono border rounded ${colorMap[status]}`}
        >
            {status}
        </span>
    );
}

function SeverityBadge({ severity }: { severity: BugQueueRow["severity"] }) {
    const colorMap: Record<BugQueueRow["severity"], string> = {
        CRITICAL: "bg-red-900/60 border-red-700 text-red-200",
        MAJOR: "bg-orange-900/60 border-orange-700 text-orange-200",
        MODERATE: "bg-yellow-900/60 border-yellow-700 text-yellow-200",
    };
    return (
        <span
            className={`px-2 py-0.5 text-[10px] font-mono border rounded ${colorMap[severity]}`}
        >
            {severity}
        </span>
    );
}

function ProbeTypeBadge({
    probeType,
}: {
    probeType: BugQueueRow["probe_type"];
}) {
    const colorMap: Record<BugQueueRow["probe_type"], string> = {
        sql: "bg-purple-900/60 border-purple-700 text-purple-200",
        js_eval: "bg-cyan-900/60 border-cyan-700 text-cyan-200",
        manual: "bg-slate-800 border-slate-600 text-slate-300",
    };
    return (
        <span
            className={`px-1.5 py-0.5 text-[10px] font-mono border rounded ${colorMap[probeType]}`}
        >
            probe: {probeType}
        </span>
    );
}

export function BugQueueList({ rows }: Props) {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [ownerFilter, setOwnerFilter] = useState<string>("ALL");
    const [conceptFilter, setConceptFilter] = useState<string>("");

    const filtered = useMemo(() => {
        return rows.filter((r) => {
            if (statusFilter !== "ALL" && r.status !== statusFilter)
                return false;
            if (ownerFilter !== "ALL" && r.owner_cluster !== ownerFilter)
                return false;
            if (
                conceptFilter.trim() !== "" &&
                !r.concepts_affected.some((c) =>
                    c
                        .toLowerCase()
                        .includes(conceptFilter.trim().toLowerCase())
                )
            )
                return false;
            return true;
        });
    }, [rows, statusFilter, ownerFilter, conceptFilter]);

    return (
        <div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4 flex flex-wrap items-center gap-3">
                <label className="text-xs text-slate-400 flex items-center gap-2">
                    Status
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
                    >
                        <option value="ALL">ALL</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs text-slate-400 flex items-center gap-2">
                    Owner
                    <select
                        value={ownerFilter}
                        onChange={(e) => setOwnerFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
                    >
                        <option value="ALL">ALL</option>
                        {OWNERS.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs text-slate-400 flex items-center gap-2">
                    Concept
                    <input
                        value={conceptFilter}
                        onChange={(e) => setConceptFilter(e.target.value)}
                        placeholder="friction_static_kinetic"
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm font-mono w-64"
                    />
                </label>
                <span className="text-xs text-slate-500 ml-auto">
                    showing {filtered.length} of {rows.length}
                </span>
            </div>
            <div className="space-y-3">
                {filtered.map((r) => (
                    <BugCard key={r.id} row={r} />
                ))}
            </div>
        </div>
    );
}

function BugCard({ row }: { row: BugQueueRow }) {
    const [expanded, setExpanded] = useState(false);
    const [editingRule, setEditingRule] = useState(false);
    const [draftRule, setDraftRule] = useState(row.prevention_rule);
    const [action, setAction] = useState<ActionState>({ status: "idle" });
    const [probeConceptId, setProbeConceptId] = useState<string>(
        row.concepts_affected[0] ?? ""
    );
    const [probeResult, setProbeResult] = useState<ProbeResult | null>(null);

    async function postAction(payload: Record<string, unknown>) {
        setAction({ status: "pending", action: String(payload.action ?? "") });
        try {
            const res = await fetch("/api/admin/bug-queue-action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const body = (await res
                    .json()
                    .catch(() => ({}))) as { error?: string };
                setAction({
                    status: "error",
                    message: body.error ?? `HTTP ${res.status}`,
                });
                return null;
            }
            const json = (await res.json()) as Record<string, unknown>;
            setAction({
                status: "done",
                message: `${payload.action} applied`,
            });
            return json;
        } catch (err) {
            setAction({
                status: "error",
                message:
                    err instanceof Error ? err.message : "Unknown error",
            });
            return null;
        }
    }

    async function runProbe() {
        setProbeResult(null);
        const json = await postAction({
            id: row.id,
            action: "run_probe",
            concept_id: probeConceptId,
        });
        if (json) setProbeResult(json as ProbeResult);
    }

    async function markFixed() {
        await postAction({ id: row.id, action: "mark_fixed" });
    }

    async function markNotReproducing() {
        await postAction({ id: row.id, action: "mark_not_reproducing" });
    }

    async function saveRule() {
        const json = await postAction({
            id: row.id,
            action: "update_prevention_rule",
            prevention_rule: draftRule,
        });
        if (json) setEditingRule(false);
    }

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <StatusBadge status={row.status} />
                            <SeverityBadge severity={row.severity} />
                            <ProbeTypeBadge probeType={row.probe_type} />
                            <span className="font-mono text-xs text-slate-500">
                                {row.owner_cluster}
                            </span>
                        </div>
                        <div className="font-semibold text-slate-100 text-sm">
                            {row.title}
                        </div>
                        <div className="font-mono text-xs text-slate-500 mt-0.5">
                            {row.bug_class}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <button
                            onClick={markFixed}
                            disabled={
                                row.status === "FIXED" ||
                                action.status === "pending"
                            }
                            className="px-2 py-1 text-xs bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded transition"
                        >
                            Mark FIXED
                        </button>
                        <button
                            onClick={markNotReproducing}
                            disabled={
                                row.status === "NOT_REPRODUCING" ||
                                action.status === "pending"
                            }
                            className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded transition"
                        >
                            Mark NOT_REPRO
                        </button>
                    </div>
                </div>

                <div className="mt-3 bg-slate-950 border border-slate-800 rounded p-3 space-y-2">
                    <div>
                        <div className="text-xs text-slate-500 mb-0.5">
                            root cause
                        </div>
                        <div className="text-sm text-slate-200">
                            {row.root_cause}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 mb-0.5 flex items-center gap-2">
                            prevention rule
                            <button
                                onClick={() => {
                                    setEditingRule((e) => !e);
                                    setDraftRule(row.prevention_rule);
                                }}
                                className="text-xs text-slate-400 hover:text-slate-200 underline"
                            >
                                {editingRule ? "cancel" : "edit"}
                            </button>
                        </div>
                        {editingRule ? (
                            <div className="space-y-1">
                                <textarea
                                    value={draftRule}
                                    onChange={(e) =>
                                        setDraftRule(e.target.value)
                                    }
                                    maxLength={500}
                                    rows={3}
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-100"
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={saveRule}
                                        disabled={
                                            action.status === "pending"
                                        }
                                        className="px-2 py-1 text-xs bg-blue-700 hover:bg-blue-600 disabled:bg-slate-800 text-white rounded"
                                    >
                                        Save
                                    </button>
                                    <span className="text-xs text-slate-500">
                                        {draftRule.length}/500
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-emerald-200">
                                {row.prevention_rule}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <input
                        value={probeConceptId}
                        onChange={(e) => setProbeConceptId(e.target.value)}
                        placeholder="candidate_concept_id"
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm font-mono w-56"
                    />
                    <button
                        onClick={runProbe}
                        disabled={action.status === "pending"}
                        className="px-3 py-1 text-xs bg-purple-700 hover:bg-purple-600 disabled:bg-slate-800 text-white rounded"
                    >
                        Run probe
                    </button>
                    {action.status === "pending" && (
                        <span className="text-xs text-slate-400">
                            running…
                        </span>
                    )}
                    {action.status === "done" && (
                        <span className="text-xs text-emerald-400">
                            {action.message}
                        </span>
                    )}
                    {action.status === "error" && (
                        <span className="text-xs text-red-400">
                            {action.message}
                        </span>
                    )}
                </div>

                {probeResult && (
                    <div className="mt-3 bg-slate-950 border border-slate-800 rounded p-3">
                        <div className="text-xs text-slate-500 mb-1">
                            probe result
                        </div>
                        <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(probeResult, null, 2)}
                        </pre>
                    </div>
                )}

                <button
                    onClick={() => setExpanded((e) => !e)}
                    className="mt-3 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                    {expanded
                        ? "▼ Hide probe + concepts + files"
                        : "▶ Show probe + concepts + files"}
                </button>

                {expanded && (
                    <div className="mt-2 space-y-3">
                        <div>
                            <div className="text-xs text-slate-500 mb-1">
                                probe_logic ({row.probe_type})
                            </div>
                            <pre className="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-300 overflow-x-auto max-h-60 whitespace-pre-wrap">
                                {row.probe_logic}
                            </pre>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 mb-1">
                                concepts_affected (
                                {row.concepts_affected.length})
                            </div>
                            <div className="font-mono text-xs text-slate-300 flex flex-wrap gap-1">
                                {row.concepts_affected.length === 0 ? (
                                    <span className="text-slate-500">
                                        (cross-cutting — empty array)
                                    </span>
                                ) : (
                                    row.concepts_affected.map((c) => (
                                        <span
                                            key={c}
                                            className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5"
                                        >
                                            {c}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 mb-1">
                                fixed_in_files ({row.fixed_in_files.length})
                            </div>
                            <div className="font-mono text-xs text-slate-300 space-y-0.5">
                                {row.fixed_in_files.length === 0 ? (
                                    <span className="text-slate-500">
                                        (none recorded)
                                    </span>
                                ) : (
                                    row.fixed_in_files.map((f) => (
                                        <div key={f}>{f}</div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="text-xs text-slate-500">
                            discovered_in_session:{" "}
                            <span className="text-slate-300">
                                {row.discovered_in_session ?? "—"}
                            </span>
                            <span className="mx-2">·</span>
                            fixed_at:{" "}
                            <span className="text-slate-300">
                                {row.fixed_at
                                    ? new Date(
                                          row.fixed_at
                                      ).toLocaleString()
                                    : "—"}
                            </span>
                            <span className="mx-2">·</span>
                            updated_at:{" "}
                            <span className="text-slate-300">
                                {new Date(row.updated_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
