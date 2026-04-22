/**
 * Auto-promotion of pending-review deep-dive / drill-down cache rows.
 *
 * Rule (CLAUDE.md Rule #19 + Principle #18 relaxation):
 *   pending_review + >= 20 positive votes + 0 negative votes  →  verified
 *
 * Called from /api/deep-dive/feedback and /api/drill-down/feedback after
 * every vote upsert. Recounts from the feedback log (source of truth),
 * overwrites the derived counters on the cache row, and flips status if
 * the threshold is met.
 */
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const AUTO_PROMOTION_POSITIVE_THRESHOLD = 20;

export type CacheTable = "deep_dive_cache" | "drill_down_cache";
type FeedbackTable = "deep_dive_feedback" | "drill_down_feedback";

const FEEDBACK_TABLE: Record<CacheTable, FeedbackTable> = {
    deep_dive_cache: "deep_dive_feedback",
    drill_down_cache: "drill_down_feedback",
};

export interface RecountResult {
    positive: number;
    negative: number;
    promoted: boolean;
    status: string;
}

/**
 * Recount votes for one cache row from its feedback log, overwrite the
 * derived counters on the cache row, and auto-promote if the threshold
 * is met. Idempotent — safe to call repeatedly.
 */
export async function recountAndMaybePromote(
    table: CacheTable,
    cacheId: string
): Promise<RecountResult> {
    const feedbackTable = FEEDBACK_TABLE[table];

    // Count positive votes.
    const { count: positiveCount, error: posErr } = await supabaseAdmin
        .from(feedbackTable)
        .select("id", { count: "exact", head: true })
        .eq("cache_id", cacheId)
        .eq("signal", "positive");
    if (posErr) {
        throw new Error(`[autoPromotion] positive count: ${posErr.message}`);
    }

    // Count negative votes.
    const { count: negativeCount, error: negErr } = await supabaseAdmin
        .from(feedbackTable)
        .select("id", { count: "exact", head: true })
        .eq("cache_id", cacheId)
        .eq("signal", "negative");
    if (negErr) {
        throw new Error(`[autoPromotion] negative count: ${negErr.message}`);
    }

    const positive = positiveCount ?? 0;
    const negative = negativeCount ?? 0;

    // Read current row to know whether promotion applies.
    const { data: row, error: readErr } = await supabaseAdmin
        .from(table)
        .select("id, status")
        .eq("id", cacheId)
        .maybeSingle();
    if (readErr || !row) {
        throw new Error(
            `[autoPromotion] read cache row: ${readErr?.message ?? "not found"}`
        );
    }

    const shouldPromote =
        row.status === "pending_review" &&
        negative === 0 &&
        positive >= AUTO_PROMOTION_POSITIVE_THRESHOLD;

    const updatePayload: Record<string, unknown> = {
        positive_feedback_count: positive,
        negative_feedback_count: negative,
        updated_at: new Date().toISOString(),
    };

    if (shouldPromote) {
        const nowIso = new Date().toISOString();
        updatePayload.status = "verified";
        updatePayload.verified_at = nowIso;
        updatePayload.review_notes = `auto_promoted on ${nowIso} (${positive} positive, ${negative} negative)`;
    }

    const { data: updated, error: updErr } = await supabaseAdmin
        .from(table)
        .update(updatePayload)
        .eq("id", cacheId)
        .select("status")
        .maybeSingle();
    if (updErr || !updated) {
        throw new Error(
            `[autoPromotion] update cache row: ${updErr?.message ?? "not found"}`
        );
    }

    return {
        positive,
        negative,
        promoted: shouldPromote,
        status: updated.status,
    };
}
