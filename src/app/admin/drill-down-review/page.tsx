/**
 * Admin — Drill-Down Review Queue
 *
 * Lists pending_review rows from drill_down_cache with Approve / Reject
 * buttons. Shows the confusion cluster that triggered the sub-sim and the
 * MICRO/LOCAL protocol choice. Expand for full sub_sim JSON.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DrillDownReviewList } from "./ReviewList";

export interface DrillDownRow {
    id: string;
    fingerprint_key: string;
    concept_id: string;
    state_id: string;
    cluster_id: string;
    class_level: string | null;
    mode: string | null;
    sub_sim: { states?: Record<string, unknown> } | null;
    protocol: string | null;
    teacher_script: Array<{ id: string; text: string }> | null;
    status: string;
    served_count: number;
    positive_feedback_count: number;
    negative_feedback_count: number;
    generated_by: string | null;
    model: string | null;
    created_at: string;
}

export default async function DrillDownReviewPage() {
    const { data, error } = await supabaseAdmin
        .from("drill_down_cache")
        .select(
            "id, fingerprint_key, concept_id, state_id, cluster_id, class_level, mode, sub_sim, protocol, teacher_script, status, served_count, positive_feedback_count, negative_feedback_count, generated_by, model, created_at"
        )
        .eq("status", "pending_review")
        .order("created_at", { ascending: false });

    const rows = (data ?? []) as DrillDownRow[];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Drill-Down Review Queue</h1>
                    <p className="text-slate-400 text-sm">
                        {rows.length} row{rows.length === 1 ? "" : "s"} pending review
                        {error && <span className="text-red-400 ml-2">— fetch error: {error.message}</span>}
                    </p>
                </div>

                {rows.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
                        No pending drill-down entries. Cache is clean.
                    </div>
                ) : (
                    <DrillDownReviewList rows={rows} />
                )}
            </div>
        </div>
    );
}
