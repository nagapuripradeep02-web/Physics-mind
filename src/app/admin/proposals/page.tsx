/**
 * Admin Proposal Queue — the founder-approval surface of the Part-2
 * improvement loop (Session 59 two-loop architecture; CLAUDE.md Rule 17 human
 * gate). Lists pending proposals newest-first with Approve / Reject; recent
 * decisions shown below for audit.
 *
 * Writers (Tier-8 nightly agents) are deferred until real students exist —
 * until then rows arrive only via manual INSERT or future tooling. The gate
 * exists BEFORE the writers so no un-reviewed artifact ever has anywhere to
 * land but here.
 *
 * Reachable at /admin/proposals.
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ProposalList } from './ProposalList';

export const dynamic = 'force-dynamic';

export interface ProposalRow {
    id: string;
    kind: string;
    concept_id: string;
    state_id: string | null;
    payload: Record<string, unknown>;
    evidence: Record<string, unknown>;
    confidence: number | null;
    status: string;
    reviewer: string | null;
    decided_at: string | null;
    decision_notes: string | null;
    created_at: string;
}

export default async function ProposalsPage() {
    const { data: pending, error: pendingError } = await supabaseAdmin
        .from('proposal_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(100);

    const { data: decided } = await supabaseAdmin
        .from('proposal_queue')
        .select('*')
        .neq('status', 'pending')
        .order('decided_at', { ascending: false })
        .limit(20);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <h1 className="text-xl font-bold mb-1">Proposal Queue</h1>
            <p className="text-sm text-slate-400 mb-6 max-w-2xl">
                The human gate of the improvement loop. Every learned change — content or engine
                default — lands here as a reviewable artifact before anything ships. Approving a
                proposal records the decision only; applying it is a separate, reviewed step.
            </p>

            {pendingError ? (
                <p className="text-rose-400">Failed to load proposals: {pendingError.message}</p>
            ) : (
                <ProposalList
                    pending={(pending ?? []) as ProposalRow[]}
                    decided={(decided ?? []) as ProposalRow[]}
                />
            )}
        </div>
    );
}
