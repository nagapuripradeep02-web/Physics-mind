/**
 * POST /api/admin/proposals — founder decision on a proposal_queue row.
 *
 * Body: { id: string (uuid), decision: 'approved' | 'rejected', notes?: string }
 *
 * This is the human gate of the Part-2 improvement loop (CLAUDE.md Rule 17:
 * every learned change ships through an offline, reviewable, human-approved
 * artifact). Decisions only flip status + audit fields — APPLYING an approved
 * proposal (editing a concept JSON / engine config) stays a separate, manual,
 * reviewed step.
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface DecisionBody {
    id?: string;
    decision?: string;
    notes?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
    let body: DecisionBody;
    try {
        body = await request.json() as DecisionBody;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { id, decision, notes } = body;
    if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'id (uuid) is required' }, { status: 400 });
    }
    if (decision !== 'approved' && decision !== 'rejected') {
        return NextResponse.json({ error: "decision must be 'approved' or 'rejected'" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('proposal_queue')
        .update({
            status: decision,
            reviewer: 'founder',
            decided_at: new Date().toISOString(),
            decision_notes: notes ?? null,
        })
        .eq('id', id)
        .eq('status', 'pending')   // decisions are one-shot; no flip-flopping
        .select('id, status')
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
        return NextResponse.json({ error: 'Proposal not found or already decided' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, id: data.id, status: data.status });
}
