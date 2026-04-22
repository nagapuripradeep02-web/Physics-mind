/**
 * POST /api/deep-dive/feedback
 *
 * Records a thumbs-up / thumbs-down vote from a student on a generated
 * deep-dive sub-simulation. UPSERTs into deep_dive_feedback (unique per
 * (cache_id, session_id) so a student can change their mind but not
 * ballot-stuff), then recounts + possibly auto-promotes via autoPromotion.
 *
 * Request:  { cacheId: uuid, sessionId: string, signal: 'positive' | 'negative' }
 * Response: { ok: true, positive, negative, promoted, status }
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
        .from("deep_dive_feedback")
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
        console.error("[deep-dive/feedback] upsert error:", upsertErr);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    try {
        const result = await recountAndMaybePromote("deep_dive_cache", cacheId);
        return NextResponse.json({ ok: true, ...result });
    } catch (err) {
        console.error("[deep-dive/feedback] promote error:", err);
        return NextResponse.json({ error: "Recount failed" }, { status: 500 });
    }
}
