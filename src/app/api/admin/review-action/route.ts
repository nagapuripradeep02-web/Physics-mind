/**
 * POST /api/admin/review-action
 *
 * Approves or rejects a pending-review cache row in deep_dive_cache or
 * drill_down_cache. Called from the admin review UI buttons.
 *
 * SECURITY NOTE: This endpoint is currently unprotected. It matches the
 * security posture of the existing /admin/costs page. Before launch, wrap
 * in an admin-auth middleware or require a shared-secret header.
 *
 * Request:
 *   { table: 'deep_dive_cache' | 'drill_down_cache',
 *     id:    uuid,
 *     action: 'approve' | 'reject' }
 *
 * Response:
 *   { ok: true, id, status }
 *   400 on invalid table/action; 404 if row not found; 500 on DB error.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_TABLES = new Set(["deep_dive_cache", "drill_down_cache"]);
const ALLOWED_ACTIONS = new Set(["approve", "reject"]);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const table = typeof body.table === "string" ? body.table : "";
        const id = typeof body.id === "string" ? body.id : "";
        const action = typeof body.action === "string" ? body.action : "";

        if (!ALLOWED_TABLES.has(table)) {
            return NextResponse.json({ error: "Invalid table" }, { status: 400 });
        }
        if (!ALLOWED_ACTIONS.has(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
        if (!id) {
            return NextResponse.json({ error: "id is required" }, { status: 400 });
        }

        const nextStatus = action === "approve" ? "verified" : "rejected";
        const updatePayload: Record<string, unknown> = {
            status: nextStatus,
            updated_at: new Date().toISOString(),
        };
        if (action === "approve") {
            updatePayload.verified_at = new Date().toISOString();
        }

        const { data, error } = await supabaseAdmin
            .from(table)
            .update(updatePayload)
            .eq("id", id)
            .select("id, status")
            .maybeSingle();

        if (error) {
            console.error("[admin/review-action] update error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
        if (!data) {
            return NextResponse.json({ error: "Row not found" }, { status: 404 });
        }

        return NextResponse.json({ ok: true, id: data.id, status: data.status });
    } catch (err) {
        console.error("[admin/review-action] EXCEPTION:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
