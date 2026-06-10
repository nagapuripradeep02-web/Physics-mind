'use client';

import { useState } from 'react';
import type { ProposalRow } from './page';

interface Props {
    pending: ProposalRow[];
    decided: ProposalRow[];
}

type RowState =
    | { status: 'idle' }
    | { status: 'busy' }
    | { status: 'done'; decision: 'approved' | 'rejected' }
    | { status: 'error'; message: string };

const KIND_COLORS: Record<string, string> = {
    new_cluster: 'bg-sky-900/60 border-sky-700 text-sky-200',
    archive_cluster: 'bg-amber-900/60 border-amber-700 text-amber-200',
    flag_sub_sim: 'bg-violet-900/60 border-violet-700 text-violet-200',
    engine_config_delta: 'bg-emerald-900/60 border-emerald-700 text-emerald-200',
    concept_json_edit: 'bg-rose-900/60 border-rose-700 text-rose-200',
};

function KindBadge({ kind }: { kind: string }) {
    const colors = KIND_COLORS[kind] ?? 'bg-slate-800 border-slate-600 text-slate-300';
    return (
        <span className={`px-1.5 py-0.5 text-[10px] font-mono border rounded ${colors}`}>
            {kind}
        </span>
    );
}

function JsonBlock({ label, value }: { label: string; value: Record<string, unknown> }) {
    return (
        <details className="mt-1">
            <summary className="text-xs text-slate-400 cursor-pointer select-none">{label}</summary>
            <pre className="mt-1 p-2 bg-slate-900 border border-slate-800 rounded text-[11px] overflow-x-auto max-h-64">
                {JSON.stringify(value, null, 2)}
            </pre>
        </details>
    );
}

function PendingCard({ row }: { row: ProposalRow }) {
    const [state, setState] = useState<RowState>({ status: 'idle' });
    const [notes, setNotes] = useState('');

    async function decide(decision: 'approved' | 'rejected'): Promise<void> {
        setState({ status: 'busy' });
        try {
            const res = await fetch('/api/admin/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: row.id, decision, notes: notes || undefined }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({})) as { error?: string };
                throw new Error(body.error ?? `HTTP ${res.status}`);
            }
            setState({ status: 'done', decision });
        } catch (err) {
            setState({ status: 'error', message: err instanceof Error ? err.message : 'failed' });
        }
    }

    if (state.status === 'done') {
        return (
            <div className="p-4 border border-slate-800 rounded-lg bg-slate-900/40 opacity-70">
                <span className={state.decision === 'approved' ? 'text-emerald-400' : 'text-rose-400'}>
                    {state.decision === 'approved' ? '✅ Approved' : '❌ Rejected'}
                </span>
                <span className="ml-2 text-sm text-slate-400">{row.kind} · {row.concept_id}</span>
            </div>
        );
    }

    return (
        <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/60">
            <div className="flex items-center gap-2 flex-wrap">
                <KindBadge kind={row.kind} />
                <span className="font-mono text-sm">{row.concept_id}</span>
                {row.state_id && <span className="font-mono text-xs text-slate-400">{row.state_id}</span>}
                {row.confidence !== null && (
                    <span className="text-xs text-slate-400">confidence {(row.confidence * 100).toFixed(0)}%</span>
                )}
                <span className="ml-auto text-xs text-slate-500">
                    {new Date(row.created_at).toLocaleString()}
                </span>
            </div>

            <JsonBlock label="payload (the proposed change)" value={row.payload} />
            <JsonBlock label="evidence" value={row.evidence} />

            <div className="mt-3 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="decision notes (optional)"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder:text-slate-600"
                />
                <button
                    type="button"
                    disabled={state.status === 'busy'}
                    onClick={() => void decide('approved')}
                    className="px-3 py-1 text-xs font-semibold rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
                >
                    Approve
                </button>
                <button
                    type="button"
                    disabled={state.status === 'busy'}
                    onClick={() => void decide('rejected')}
                    className="px-3 py-1 text-xs font-semibold rounded bg-rose-800 hover:bg-rose-700 disabled:opacity-50"
                >
                    Reject
                </button>
            </div>
            {state.status === 'error' && (
                <p className="mt-2 text-xs text-rose-400">Error: {state.message}</p>
            )}
        </div>
    );
}

export function ProposalList({ pending, decided }: Props) {
    return (
        <div className="space-y-8 max-w-4xl">
            <section>
                <h2 className="text-sm font-semibold text-slate-300 mb-3">
                    Pending ({pending.length})
                </h2>
                {pending.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        No pending proposals. (Writers are deferred until real students exist —
                        rows arrive via manual INSERT or future Tier-8 agents.)
                    </p>
                ) : (
                    <div className="space-y-3">
                        {pending.map(row => <PendingCard key={row.id} row={row} />)}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-sm font-semibold text-slate-300 mb-3">
                    Recent decisions ({decided.length})
                </h2>
                {decided.length === 0 ? (
                    <p className="text-sm text-slate-500">None yet.</p>
                ) : (
                    <div className="space-y-2">
                        {decided.map(row => (
                            <div key={row.id} className="p-3 border border-slate-800 rounded bg-slate-900/30 text-sm flex items-center gap-2 flex-wrap">
                                <span className={row.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}>
                                    {row.status === 'approved' ? '✅' : '❌'}
                                </span>
                                <KindBadge kind={row.kind} />
                                <span className="font-mono">{row.concept_id}</span>
                                {row.decision_notes && (
                                    <span className="text-xs text-slate-400">“{row.decision_notes}”</span>
                                )}
                                <span className="ml-auto text-xs text-slate-500">
                                    {row.decided_at ? new Date(row.decided_at).toLocaleString() : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
