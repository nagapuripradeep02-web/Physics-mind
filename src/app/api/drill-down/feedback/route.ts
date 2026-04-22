/**
 * POST /api/drill-down/feedback
 *
 * Same contract as /api/deep-dive/feedback but targeting drill_down_cache /
 * drill_down_feedback. See that route for details.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { recountAndMaybePromote } from "@/lib/autoPromotion";

const BodySchema = z.object({
    cacheId: z.string().uuid(),
    sessionId: z.string().min(1).max(256),
    signal: z.enum(["positive", "negative"]),
});

export async function POST(req: NextRequest) {
    let parsed;
    try {
        parsed = BodySchema.parse(await req.json());
    } catch {
        return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { cacheId, sessionId, signal } = parsed;

    const { error: upsertErr } = await supabaseAdmin
        .from("drill_down_feedback")
        .upsert(
            {
                cache_id: cacheId,
                session_id: sessionId,
                signal,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "cache_id,session_id" }
        );

    if (upsertErr) {
        console.error("[drill-down/feedback] upsert error:", upsertErr);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    try {
        const result = await recountAndMaybePromote(
            "drill_down_cache",
            cacheId
        );
        return NextResponse.json({ ok: true, ...result });
    } catch (err) {
        console.error("[drill-down/feedback] promote error:", err);
        return NextResponse.json({ error: "Recount failed" }, { status: 500 });
    }
}
