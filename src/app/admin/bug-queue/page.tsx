/**
 * Admin — Engine Bug Queue
 *
 * Lists every row in engine_bug_queue with status / severity / owner_cluster
 * badges. Reviewer can:
 *   - Mark a row FIXED (sets fixed_at = now())
 *   - Mark a row NOT_REPRODUCING (status update only)
 *   - Update prevention_rule (free-text, ≤500 chars)
 *   - Run the row's probe against a candidate concept_id (server-side
 *     execute via supabaseAdmin for probe_type='sql'; returns the literal
 *     body for js_eval / manual probes)
 *
 * SECURITY NOTE: Endpoint posture matches /admin/deep-dive-review and
 * /admin/costs — currently unprotected; wrap in admin-auth before launch.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { BugQueueList } from "./BugQueueList";

export interface BugQueueRow {
    id: string;
    bug_class: string;
    title: string;
    severity: "CRITICAL" | "MAJOR" | "MODERATE";
    owner_cluster:
        | "alex:architect"
        | "alex:physics_author"
        | "alex:json_author"
        | "peter_parker:renderer_primitives"
        | "peter_parker:runtime_generation"
        | "ambiguous";
    root_cause: string;
    prevention_rule: string;
    probe_type: "sql" | "js_eval" | "manual";
    probe_logic: string;
    status: "OPEN" | "FIXED" | "DEFERRED" | "NOT_REPRODUCING";
    concepts_affected: string[];
    fixed_in_files: string[];
    discovered_in_session: string | null;
    fixed_at: string | null;
    created_at: string;
    updated_at: string;
}

export default async function BugQueuePage() {
    // status ASC ⇒ DEFERRED, FIXED, NOT_REPRODUCING, OPEN — but we want OPEN
    // first because that's the actionable bucket. Use a CASE-style ordering
    // via two passes (Supabase JS doesn't expose CASE in .order). Simpler:
    // sort severity DESC and let the UI filter strip do the bucketing.
    const { data, error } = await supabaseAdmin
        .from("engine_bug_queue")
        .select(
            "id, bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, fixed_at, created_at, updated_at"
        )
        .order("status", { ascending: true })
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false });

    const rows = (data ?? []) as BugQueueRow[];

    const counts = rows.reduce<Record<string, number>>((acc, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Engine Bug Queue
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {rows.length} row{rows.length === 1 ? "" : "s"} —{" "}
                        <span className="text-amber-400">
                            {counts.OPEN ?? 0} OPEN
                        </span>
                        <span className="mx-2 text-slate-600">·</span>
                        <span className="text-emerald-400">
                            {counts.FIXED ?? 0} FIXED
                        </span>
                        <span className="mx-2 text-slate-600">·</span>
                        <span className="text-blue-400">
                            {counts.DEFERRED ?? 0} DEFERRED
                        </span>
                        <span className="mx-2 text-slate-600">·</span>
                        <span className="text-slate-400">
                            {counts.NOT_REPRODUCING ?? 0} NOT_REPRODUCING
                        </span>
                        {error && (
                            <span className="text-red-400 ml-2">
                                — fetch error: {error.message}
                            </span>
                        )}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                        Quality_auditor's Gate 8 reads this table before
                        approving any concept. Renderer_primitives /
                        runtime_generation INSERT or UPDATE rows after every
                        fix. Owner clusters consult prevention_rules before
                        producing artifacts.
                    </p>
                </div>

                {rows.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
                        No bug-queue rows. Either the seed migration hasn't
                        run or the table is genuinely empty.
                    </div>
                ) : (
                    <BugQueueList rows={rows} />
                )}
            </div>
        </div>
    );
}
