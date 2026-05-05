/**
 * POST /api/admin/bug-queue-action
 *
 * Four action types over a single engine_bug_queue row, dispatched by the
 * admin /admin/bug-queue UI:
 *
 *   1. mark_fixed              → status='FIXED', fixed_at=now()
 *   2. mark_not_reproducing    → status='NOT_REPRODUCING'
 *   3. update_prevention_rule  → prevention_rule (≤500 chars)
 *   4. run_probe               → executes probe_logic against concept_id
 *      - probe_type='sql':    substitutes $1 → concept_id, runs via supabaseAdmin
 *      - probe_type='js_eval': returns the body for the operator to paste into preview_eval
 *      - probe_type='manual':  returns the prevention_rule as the manual-check instruction
 *
 * Concept_id input is regex-validated /^[a-z][a-z0-9_]+$/ before substitution.
 * Probe text is author-curated via seed migration, never operator-typed.
 *
 * SECURITY NOTE: Endpoint posture matches /api/admin/review-action — currently
 * unprotected; wrap in admin-auth middleware before launch.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const CONCEPT_ID_RE = /^[a-z][a-z0-9_]+$/;

const markFixedSchema = z.object({
    id: z.string().uuid(),
    action: z.literal("mark_fixed"),
});

const markNotReproducingSchema = z.object({
    id: z.string().uuid(),
    action: z.literal("mark_not_reproducing"),
});

const updatePreventionRuleSchema = z.object({
    id: z.string().uuid(),
    action: z.literal("update_prevention_rule"),
    prevention_rule: z.string().min(1).max(500),
});

const runProbeSchema = z.object({
    id: z.string().uuid(),
    action: z.literal("run_probe"),
    concept_id: z
        .string()
        .min(1)
        .max(80)
        .regex(CONCEPT_ID_RE, "concept_id must match /^[a-z][a-z0-9_]+$/"),
});

const bodySchema = z.discriminatedUnion("action", [
    markFixedSchema,
    markNotReproducingSchema,
    updatePreventionRuleSchema,
    runProbeSchema,
]);

interface BugQueueRowFull {
    id: string;
    bug_class: string;
    probe_type: "sql" | "js_eval" | "manual";
    probe_logic: string;
    prevention_rule: string;
    status: string;
}

export async function POST(req: NextRequest) {
    try {
        const raw = await req.json();
        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Invalid request body",
                    details: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }
        const body = parsed.data;
        const nowIso = new Date().toISOString();

        if (body.action === "mark_fixed") {
            const { data, error } = await supabaseAdmin
                .from("engine_bug_queue")
                .update({
                    status: "FIXED",
                    fixed_at: nowIso,
                    updated_at: nowIso,
                })
                .eq("id", body.id)
                .select("id, status, fixed_at")
                .maybeSingle();
            if (error) {
                console.error("[bug-queue-action] mark_fixed error:", error);
                return NextResponse.json(
                    { error: "Database error" },
                    { status: 500 }
                );
            }
            if (!data) {
                return NextResponse.json(
                    { error: "Row not found" },
                    { status: 404 }
                );
            }
            return NextResponse.json({ ok: true, ...data });
        }

        if (body.action === "mark_not_reproducing") {
            const { data, error } = await supabaseAdmin
                .from("engine_bug_queue")
                .update({
                    status: "NOT_REPRODUCING",
                    updated_at: nowIso,
                })
                .eq("id", body.id)
                .select("id, status")
                .maybeSingle();
            if (error) {
                console.error(
                    "[bug-queue-action] mark_not_reproducing error:",
                    error
                );
                return NextResponse.json(
                    { error: "Database error" },
                    { status: 500 }
                );
            }
            if (!data) {
                return NextResponse.json(
                    { error: "Row not found" },
                    { status: 404 }
                );
            }
            return NextResponse.json({ ok: true, ...data });
        }

        if (body.action === "update_prevention_rule") {
            const { data, error } = await supabaseAdmin
                .from("engine_bug_queue")
                .update({
                    prevention_rule: body.prevention_rule,
                    updated_at: nowIso,
                })
                .eq("id", body.id)
                .select("id, prevention_rule")
                .maybeSingle();
            if (error) {
                console.error(
                    "[bug-queue-action] update_prevention_rule error:",
                    error
                );
                return NextResponse.json(
                    { error: "Database error" },
                    { status: 500 }
                );
            }
            if (!data) {
                return NextResponse.json(
                    { error: "Row not found" },
                    { status: 404 }
                );
            }
            return NextResponse.json({ ok: true, ...data });
        }

        // body.action === "run_probe"
        const { data: rowData, error: fetchError } = await supabaseAdmin
            .from("engine_bug_queue")
            .select(
                "id, bug_class, probe_type, probe_logic, prevention_rule, status"
            )
            .eq("id", body.id)
            .maybeSingle();
        if (fetchError) {
            console.error("[bug-queue-action] fetch error:", fetchError);
            return NextResponse.json(
                { error: "Database error" },
                { status: 500 }
            );
        }
        if (!rowData) {
            return NextResponse.json(
                { error: "Row not found" },
                { status: 404 }
            );
        }
        const row = rowData as BugQueueRowFull;

        if (row.probe_type === "manual") {
            return NextResponse.json({
                ok: true,
                probe_type: "manual",
                instruction: row.prevention_rule,
            });
        }

        if (row.probe_type === "js_eval") {
            return NextResponse.json({
                ok: true,
                probe_type: "js_eval",
                body: row.probe_logic,
                hint:
                    "Paste this body into preview_eval against the relevant simulation iframe; truthy = pass.",
            });
        }

        // probe_type === 'sql'
        // Re-validate the concept_id one more time as a defense-in-depth gate
        // before string substitution. Zod already enforced the shape; this
        // explicit assert prevents a future refactor from skipping the regex.
        if (!CONCEPT_ID_RE.test(body.concept_id)) {
            return NextResponse.json(
                { error: "Invalid concept_id" },
                { status: 400 }
            );
        }

        // Substitute $1 → 'concept_id' literal. Any author-curated probe
        // referencing a concept_id placeholder uses $1 by convention.
        const literal = `'${body.concept_id}'`;
        const sql = row.probe_logic.replace(/\$1/g, literal);

        try {
            const result = await runProbeSql(sql);
            return NextResponse.json({
                ok: true,
                probe_type: "sql",
                bug_class: row.bug_class,
                executed_sql: sql,
                result,
            });
        } catch (err) {
            console.error("[bug-queue-action] probe sql error:", err);
            return NextResponse.json(
                {
                    ok: false,
                    error:
                        err instanceof Error
                            ? err.message
                            : "Probe execution failed",
                    executed_sql: sql,
                },
                { status: 500 }
            );
        }
    } catch (err) {
        console.error("[bug-queue-action] EXCEPTION:", err);
        return NextResponse.json(
            { error: "Internal error" },
            { status: 500 }
        );
    }
}

/**
 * Execute a SELECT-only SQL probe against Supabase.
 *
 * Tries supabaseAdmin.rpc('execute_sql', { sql }) first (matches the MCP
 * tool surface used by feedback collection). If the RPC isn't deployed,
 * falls back to returning a "not_executable" envelope with the SQL body so
 * the operator can paste it into psql / Supabase SQL editor manually.
 */
async function runProbeSql(sql: string): Promise<unknown> {
    // Defense-in-depth: refuse anything other than a SELECT.
    const trimmed = sql.trim().toLowerCase();
    if (!trimmed.startsWith("select")) {
        throw new Error(
            "Probe SQL must start with SELECT (defense-in-depth)"
        );
    }

    const { data, error } = await supabaseAdmin.rpc("execute_sql", { sql });
    if (error) {
        // Most likely the rpc isn't installed in this project. Surface the
        // SQL so the operator can run it externally.
        return {
            executed: false,
            reason: error.message,
            sql,
        };
    }
    return { executed: true, rows: data };
}
