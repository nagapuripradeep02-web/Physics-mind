/**
 * src/lib/variantPicker.ts
 *
 * Picks the next regeneration variant for a concept when a student
 * thumbs-down the current simulation. Uses the simulation_variants
 * and variant_feedback tables.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface VariantConfig {
  variant_id: string;
  approach_pill_label: string;
  entry_state: string;
  state_sequence: string[];
  teacher_angle: string | null;
  locked_facts_focus: string[] | null;
}

export function buildVariantCacheKey(
  baseKey: string,
  variantIndex: number
): string {
  return `${baseKey}|v${variantIndex}`;
}

export async function pickNextVariant(
  conceptJson: Record<string, unknown>,
  baseKey: string,
  shownVariantIndexes: number[]
): Promise<{
  variant_id: string;
  approach_pill_label: string;
  entry_state: string;
  state_sequence: string[];
  teacher_angle: string | null;
  locked_facts_focus: string[] | null;
  isCached: boolean;
  cacheKey: string;
  // Backward-compat aliases for /api/feedback/signal (variant_index = ordinal position 1..N)
  variantIndex: number;
  approach: string;
} | null> {
  const alternatives = (conceptJson?.regeneration_variants ?? []) as Array<{
    variant_id: string;
    approach_pill_label: string;
    entry_state: string;
    state_sequence: string[];
    teacher_angle?: string;
    locked_facts_focus?: string[];
  }>;

  // Find the next variant the student hasn't seen yet.
  // Architect rule: variant_index = position in regeneration_variants[] (1-based: 0 reserved for default).
  for (let i = 0; i < alternatives.length; i++) {
    const alt = alternatives[i];
    const ordinal = i + 1;
    if (shownVariantIndexes.includes(ordinal)) continue;

    const cacheKey = buildVariantCacheKey(baseKey, ordinal);

    // Check if this variant is already fully generated in simulation_variants
    const { data: existing } = await supabaseAdmin
      .from("simulation_variants")
      .select("config")
      .eq("cache_key", cacheKey)
      .not("config", "is", null)
      .single();

    console.log('[variantPicker] resolved:', alt.variant_id, '| sequence:', alt.state_sequence);

    return {
      variant_id: alt.variant_id,
      approach_pill_label: alt.approach_pill_label,
      entry_state: alt.entry_state,
      state_sequence: alt.state_sequence,
      teacher_angle: alt.teacher_angle ?? null,
      locked_facts_focus: alt.locked_facts_focus ?? null,
      isCached: !!existing?.config,
      cacheKey,
      variantIndex: ordinal,
      approach: alt.approach_pill_label,
    };
  }

  // Student has seen all variants
  return null;
}

export async function recordFeedback(
  cacheKey: string,
  conceptId: string,
  variantIndex: number,
  sessionId: string,
  signal: "positive" | "negative"
): Promise<void> {
  // Log the signal
  await supabaseAdmin.from("variant_feedback").insert({
    cache_key: cacheKey,
    concept_id: conceptId,
    variant_index: variantIndex,
    session_id: sessionId,
    signal,
  });

  // Update aggregate counts on simulation_variants if row exists
  const col = signal === "positive" ? "positive_count" : "negative_count";
  const { data: existing } = await supabaseAdmin
    .from("simulation_variants")
    .select("id, positive_count, negative_count, total_shown")
    .eq("cache_key", cacheKey)
    .single();

  if (existing) {
    await supabaseAdmin
      .from("simulation_variants")
      .update({
        [col]: ((existing as Record<string, number>)[col] ?? 0) + 1,
        total_shown: (existing.total_shown ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("cache_key", cacheKey);
  }
}
