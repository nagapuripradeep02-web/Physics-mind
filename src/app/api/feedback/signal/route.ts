/**
 * POST /api/feedback/signal
 *
 * Records a positive/negative signal for a simulation variant
 * and returns the next available variant when signal is negative.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { loadConstants } from "@/lib/physics_constants/index";
import {
  buildVariantCacheKey,
  pickNextVariant,
  recordFeedback,
} from "@/lib/variantPicker";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      base_cache_key,
      concept_id,
      variant_index,
      session_id,
      signal,
    } = body as {
      base_cache_key: string;
      concept_id: string;
      variant_index: number;
      session_id: string;
      signal: "positive" | "negative";
    };

    if (!base_cache_key || !concept_id || variant_index == null || !session_id || !signal) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (signal !== "positive" && signal !== "negative") {
      return NextResponse.json({ error: "signal must be 'positive' or 'negative'" }, { status: 400 });
    }

    // Build the cache key for the variant being rated
    const cacheKey = buildVariantCacheKey(base_cache_key, variant_index);

    // Record the feedback
    await recordFeedback(cacheKey, concept_id, variant_index, session_id, signal);

    if (signal === "positive") {
      return NextResponse.json({ success: true });
    }

    // signal === 'negative' — find the next variant
    // 1. Read which variants this student has already seen
    const { data: feedbackRows } = await supabaseAdmin
      .from("variant_feedback")
      .select("variant_index")
      .eq("session_id", session_id)
      .eq("concept_id", concept_id);

    const shownVariantIndexes = [
      ...new Set((feedbackRows ?? []).map((r: { variant_index: number }) => r.variant_index)),
    ];

    // 2. Load concept JSON to access regeneration_variants
    const conceptJson = await loadConstants(concept_id);
    if (!conceptJson) {
      return NextResponse.json({
        can_regenerate: false,
        next_variant: null,
        message: "Concept data not found.",
      });
    }

    // 3. Pick the next unseen variant
    const next = await pickNextVariant(
      conceptJson as unknown as Record<string, unknown>,
      base_cache_key,
      shownVariantIndexes
    );

    if (!next) {
      return NextResponse.json({
        can_regenerate: false,
        next_variant: null,
        message: "You've seen all our explanations for this concept.",
      });
    }

    return NextResponse.json({
      can_regenerate: true,
      next_variant: {
        variantIndex: next.variantIndex,
        approach: next.approach,
        entry_state: next.entry_state,
        isCached: next.isCached,
      },
    });
  } catch (err) {
    console.error("[feedback/signal] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
