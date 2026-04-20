/**
 * Admin — Deep-Dive Review Queue
 *
 * Lists pending_review rows from deep_dive_cache with an Approve / Reject
 * button per row. Quick-preview shows the first sub-state's title and the
 * first TTS sentence so the reviewer can judge quality at a glance. Click
 * to expand the full sub_states JSONB.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DeepDiveReviewList } from "./ReviewList";

export interface DeepDiveRow {
    id: string;
    fingerprint_key: string;
    concept_id: string;
    state_id: string;
    class_level: string | null;
    mode: string | null;
    sub_states: Record<string, unknown>;
    teacher_script: Array<{ id: string; text: string }> | null;
    status: string;
    served_count: number;
    positive_feedback_count: number;
    negative_feedback_count: number;
    generated_by: string | null;
    model: string | null;
    created_at: string;
}

export default async function DeepDiveReviewPage() {
    const { data, error } = await supabaseAdmin
        .from("deep_dive_cache")
        .select(
            "id, fingerprint_key, concept_id, state_id, class_level, mode, sub_states, teacher_script, status, served_count, positive_feedback_count, negative_feedback_count, generated_by, model, created_at"
        )
        .eq("status", "pending_review")
        .order("created_at", { ascending: false });

    const rows = (data ?? []) as DeepDiveRow[];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Deep-Dive Review Queue</h1>
                    <p className="text-slate-400 text-sm">
                        {rows.length} row{rows.length === 1 ? "" : "s"} pending review
                        {error && <span className="text-red-400 ml-2">— fetch error: {error.message}</span>}
                    </p>
                </div>

                {rows.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
                        No pending deep-dive entries. Cache is clean.
                    </div>
                ) : (
                    <DeepDiveReviewList rows={rows} />
                )}
            </div>
        </div>
    );
}
