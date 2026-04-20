/**
 * POST /api/feedback/generate-variant
 *
 * Generates (or serves cached) a variant simulation for a concept.
 * Called after /api/feedback/signal returns can_regenerate: true.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { loadConstants } from "@/lib/physics_constants/index";
import { buildVariantCacheKey, type VariantConfig } from "@/lib/variantPicker";
import { generateSimulation } from "@/lib/aiSimulationGenerator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      base_cache_key,
      concept_id,
      session_id,
      variant_index,
      class_level,
      question,
    } = body as {
      base_cache_key: string;
      concept_id: string;
      session_id: string;
      variant_index: number;
      class_level?: string;
      question?: string;
    };

    if (!base_cache_key || !concept_id || variant_index == null || !session_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cacheKey = buildVariantCacheKey(base_cache_key, variant_index);
    console.log("[generate-variant] cacheKey:", cacheKey, "concept:", concept_id, "variant:", variant_index);

    // 1. Check simulation_variants for existing fully-generated config
    const { data: existing } = await supabaseAdmin
      .from("simulation_variants")
      .select("config, entry_state, approach, total_shown")
      .eq("cache_key", cacheKey)
      .not("config", "is", null)
      .single();

    if (existing?.config) {
      console.log("[generate-variant] CACHE HIT:", cacheKey);

      // Increment total_shown (fire-and-forget)
      void supabaseAdmin
        .from("simulation_variants")
        .update({
          total_shown: ((existing as Record<string, number>).total_shown ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("cache_key", cacheKey)
        .then(() => {});

      return NextResponse.json({
        config: existing.config,
        variant_index,
        entry_state: existing.entry_state,
        approach_pill_label: existing.approach,
        source: "cache",
      });
    }

    // 2. Load concept JSON to get the variant definition
    const conceptJson = await loadConstants(concept_id);
    if (!conceptJson) {
      return NextResponse.json({ error: "Concept data not found" }, { status: 404 });
    }

    const alternatives = (conceptJson as unknown as Record<string, unknown>).regeneration_variants as Array<{
      variant_id: string;
      approach_pill_label: string;
      entry_state: string;
      state_sequence: string[];
      teacher_angle?: string;
      locked_facts_focus?: string[];
    }> | undefined;

    // variant_index is the 1-based ordinal position in regeneration_variants[]
    // (Architect rule: 0 = default explanation, 1..N = JSON variants in order)
    const variantDef = alternatives?.[variant_index - 1];
    if (!variantDef) {
      return NextResponse.json({ error: `Variant ${variant_index} not found in concept JSON` }, { status: 404 });
    }

    const variant: VariantConfig = {
      variant_id: variantDef.variant_id,
      approach_pill_label: variantDef.approach_pill_label,
      entry_state: variantDef.entry_state,
      state_sequence: variantDef.state_sequence,
      teacher_angle: variantDef.teacher_angle ?? null,
      locked_facts_focus: variantDef.locked_facts_focus ?? null,
    };

    // 3. Build fingerprint from base_cache_key
    const [fp_concept_id, fp_intent, fp_class_level, fp_mode, fp_aspect] = base_cache_key.split("|");
    const fingerprint = {
      concept_id: fp_concept_id,
      intent: fp_intent ?? "full_explanation",
      class_level: fp_class_level ?? class_level ?? "12",
      mode: fp_mode ?? "conceptual",
      aspect: fp_aspect ?? "none",
      confidence: 1.0,
      cache_key: base_cache_key,
    };

    console.log("[generate-variant] Generating fresh variant:", variant.approach_pill_label, "entry_state:", variant.entry_state);

    // 4. Call the existing generation pipeline
    // We pass the variant info through — it reaches runStage2 → buildStage2Prompt
    const result = await generateSimulation(
      concept_id,
      question || concept_id.replace(/_/g, " "),
      fingerprint.class_level,
      undefined, // imageContext
      undefined, // simConfig
      fingerprint as any,
      undefined, // recentMessages
      undefined, // confusionPoint
      undefined, // mvsContext
      undefined, // studentConfusionData
      undefined, // panelConfig
      undefined, // scope
      undefined, // examMode
      variant,   // variant — new parameter
    );

    if (!result) {
      return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }

    // 5. Build the config object to store
    const configToStore = {
      simHtml: "simHtml" in result ? result.simHtml : null,
      secondarySimHtml: "primarySimHtml" in result ? result.primarySimHtml : null,
      physicsConfig: "physicsConfig" in result ? result.physicsConfig : null,
      engine: "engine" in result ? result.engine : "p5js",
      teacherScript: result.teacherScript ?? null,
      brief: result.brief ?? null,
    };

    // 6. Upsert into simulation_variants
    // DB column 'approach' is unchanged (no DDL); we map JS field approach_pill_label → DB column approach
    const { error: upsertError } = await supabaseAdmin
      .from("simulation_variants")
      .upsert(
        {
          cache_key: cacheKey,
          concept_id,
          variant_index,
          approach: variant.approach_pill_label,
          entry_state: variant.entry_state,
          config: configToStore,
          positive_count: 0,
          negative_count: 0,
          total_shown: 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "cache_key" }
      );

    if (upsertError) {
      console.error("[generate-variant] upsert error:", upsertError.message);
    }

    console.log("[generate-variant] SUCCESS:", cacheKey, "approach:", variant.approach_pill_label);

    return NextResponse.json({
      config: configToStore,
      variant_index,
      entry_state: variant.entry_state,
      approach_pill_label: variant.approach_pill_label,
      source: "generated",
    });
  } catch (err) {
    console.error("[generate-variant] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
