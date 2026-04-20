import { generateSimulation } from "@/lib/aiSimulationGenerator";
import { classifyQuestion } from "@/lib/intentClassifier";
import { loadConstants } from "@/lib/physics_constants/index";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const {
            concept,
            question,
            classLevel,
            imageContext,
            simConfig,
            mode,
            fingerprintKey,
            recentMessages,
            confusionPoint,
            mvsContext,
            studentConfusionData,
            panelConfig,
            forceRegenerate,
            scope,
            examMode,
        } = await req.json();

        console.log("[generate-simulation] REQUEST:", {
            concept: concept?.slice(0, 40),
            question: question?.slice(0, 40),
            classLevel,
            mode,
            fingerprintKey: fingerprintKey?.slice(0, 60) ?? "none",
        });
        console.log('[SCOPE TRACE] generate-simulation received:', scope);

        if (!concept && !question) {
            return NextResponse.json({ error: "concept or question required" }, { status: 400 });
        }

        // BUG 1 FIX: When fingerprintKey is present, extract concept_id from its first segment.
        // fingerprintKey format: "concept_id|intent|class|mode|source"
        // Never pass raw student text as the concept — use the classified concept_id.
        const conceptIdFromFingerprint = fingerprintKey
            ? fingerprintKey.split('|')[0]
            : null;

        const conceptToUse = conceptIdFromFingerprint || concept || question;
        const classLevelToUse = classLevel || "12";
        const modeToUse = mode || "conceptual";

        // Helper: fetch pre-generated variant configs for this concept (non-blocking)
        const fetchCachedVariants = async (conceptId: string) => {
            try {
                const { data } = await supabaseAdmin
                    .from("simulation_variants")
                    .select("variant_index, approach, entry_state, config")
                    .eq("concept_id", conceptId)
                    .not("config", "is", null)
                    .order("variant_index");
                return data ?? [];
            } catch { return []; }
        };

        // Helper: read regeneration_variants from concept JSON (Phase 4 — JSON-driven pills)
        const fetchRegenerationVariants = async (conceptId: string) => {
            try {
                const constants = await loadConstants(conceptId);
                return (constants as Record<string, unknown> | null)?.regeneration_variants ?? null;
            } catch { return null; }
        };

        // Helper: list state IDs flagged allow_deep_dive in the concept JSON.
        // The client gates the "Explain" button on this list (CLAUDE.md §23).
        const fetchAllowDeepDiveStates = async (conceptId: string): Promise<string[]> => {
            try {
                const constants = await loadConstants(conceptId) as {
                    epic_l_path?: { states?: Record<string, { allow_deep_dive?: boolean }> };
                } | null;
                const states = constants?.epic_l_path?.states ?? {};
                return Object.entries(states)
                    .filter(([, s]) => s?.allow_deep_dive === true)
                    .map(([id]) => id);
            } catch { return []; }
        };

        // Fast fingerprint cache check (bypasses full classifier)
        // Skip when forceRegenerate=true (e.g. Retry after SIM_ERROR) — deletes bad cache entry too
        if (forceRegenerate && fingerprintKey) {
            await supabaseAdmin.from("simulation_cache").delete().eq("fingerprint_key", fingerprintKey);
            console.log("[generate-simulation] forceRegenerate: deleted cache for", fingerprintKey);
        }

        if (fingerprintKey && !forceRegenerate) {
            const { data: cached } = await supabaseAdmin
                .from("simulation_cache")
                .select("physics_config, engine, sim_brief, sim_html, secondary_sim_html, sim_type, renderer_type, teacher_script, concept_id")
                .eq("fingerprint_key", fingerprintKey)
                .maybeSingle();

            if (cached?.sim_html) {
                console.log("[generate-simulation] FINGERPRINT CACHE HIT (v3):", fingerprintKey,
                    '| sim_type:', (cached as Record<string, unknown>).sim_type ?? 'single');
                const conceptIdForLookup = cached.concept_id ?? conceptIdFromFingerprint ?? conceptToUse;
                const cachedVariants = await fetchCachedVariants(conceptIdForLookup);
                const regenerationVariants = await fetchRegenerationVariants(conceptIdForLookup);
                const allowDeepDiveStates = await fetchAllowDeepDiveStates(conceptIdForLookup);

                // Multi-panel cache hit — return dual-panel shape
                if ((cached as Record<string, unknown>).sim_type === 'multi_panel' && cached.secondary_sim_html) {
                    return NextResponse.json({
                        type: 'multi_panel',
                        panel_a: {
                            renderer: (cached as Record<string, unknown>).renderer_type ?? 'mechanics_2d',
                            simHtml: cached.sim_html,
                            physicsConfig: cached.physics_config ?? null,
                        },
                        panel_b: {
                            renderer: 'graph_interactive',
                            simHtml: cached.secondary_sim_html,
                        },
                        sync_required: true,
                        primary_panel: 'panel_a',
                        shared_states: ['STATE_1','STATE_2','STATE_3','STATE_4','STATE_5','STATE_6'],
                        brief: cached.sim_brief ?? {},
                        physicsConfig: cached.physics_config ?? null,
                        engine: 'p5js',
                        teacherScript: cached.teacher_script ?? null,
                        fromCache: true,
                        fingerprintKey,
                        conceptId: cached.concept_id ?? null,
                        cached_variants: cachedVariants,
                        regeneration_variants: regenerationVariants,
                        allowDeepDiveStates,
                    });
                }

                // Single-panel cache hit (existing behavior)
                return NextResponse.json({
                    simHtml: cached.sim_html,
                    secondarySimHtml: cached.secondary_sim_html ?? null,
                    conceptId: cached.concept_id ?? null,
                    physicsConfig: cached.physics_config,
                    engine: cached.engine ?? "p5js",
                    brief: cached.sim_brief ?? {},
                    teacherScript: cached.teacher_script ?? null,
                    fromCache: true,
                    fingerprintKey,
                    cached_variants: cachedVariants,
                    regeneration_variants: regenerationVariants,
                    allowDeepDiveStates,
                });
            }
        }

        // FIX A: When fingerprintKey exists (from upstream /api/chat which correctly classified),
        // build the fingerprint from it. NEVER re-classify raw student text — it loses physics context.
        let fingerprint: Awaited<ReturnType<typeof classifyQuestion>> | null = null;

        if (fingerprintKey) {
            // fingerprintKey format: "concept_id|intent|class_level|mode|aspect"
            const [fp_concept_id, fp_intent, fp_class_level, fp_mode, fp_aspect] = fingerprintKey.split('|');
            fingerprint = {
                concept_id: fp_concept_id,
                intent: fp_intent,
                class_level: fp_class_level,
                mode: fp_mode,
                aspect: fp_aspect,
                confidence: 1.0,  // trust the upstream classifier fully
                cache_key: fingerprintKey,
            } as any;
            console.log("[generate-simulation] Using fingerprintKey-derived fingerprint:", fp_concept_id);
        } else {
            // Only classify when no fingerprintKey from chat
            fingerprint = await classifyQuestion(
                question || concept,
                classLevelToUse,
                modeToUse
            ).catch(() => null);

            // Classifier treats {MODE} as a hint and often returns its own mode
            // based on question text. When the caller has an explicit examMode
            // (e.g. UI mode-toggle refetch with mode='board'), override the
            // classifier's mode + rebuild the cache key so board/conceptual
            // fingerprints don't collide. Without this, switching Conceptual →
            // Board re-reads the already-cached conceptual row.
            if (fingerprint && examMode && fingerprint.mode !== examMode) {
                console.log("[generate-simulation] overriding classifier mode:", fingerprint.mode, "→", examMode);
                fingerprint.mode = examMode;
                fingerprint.cache_key = [
                    fingerprint.concept_id,
                    fingerprint.intent,
                    fingerprint.class_level,
                    fingerprint.mode,
                    fingerprint.aspect,
                ].join("|");
            }
        }

        const result = await generateSimulation(
            conceptToUse,
            question || concept,
            classLevelToUse,
            imageContext || undefined,
            simConfig || undefined,
            fingerprint ?? undefined,
            recentMessages,
            confusionPoint,
            mvsContext,
            studentConfusionData,
            panelConfig ?? null,
            scope ?? undefined,
            examMode ?? undefined,
        );

        if (!result) {
            console.warn("[generate-simulation] generateSimulation returned null");
            return NextResponse.json({ physicsConfig: null });
        }

        // ── Phase 6: Multi-panel result ─────────────────────────────────────
        if (result.type === 'multi_panel') {
            console.log("[generate-simulation] SUCCESS (multi_panel):", {
                primary: result.primary_panel,
                sync: result.sync_required,
                fromCache: result.fromCache,
            });

            const conceptIdForLookupMulti = fingerprint?.concept_id ?? conceptToUse;
            const cachedVariantsMulti = await fetchCachedVariants(conceptIdForLookupMulti);
            const regenerationVariantsMulti = await fetchRegenerationVariants(conceptIdForLookupMulti);
            const allowDeepDiveStatesMulti = await fetchAllowDeepDiveStates(conceptIdForLookupMulti);
            return NextResponse.json({
                type: 'multi_panel',
                panel_a: result.panel_a,
                panel_b: result.panel_b,
                sync_required: result.sync_required,
                primary_panel: result.primary_panel,
                shared_states: result.shared_states,
                brief: result.brief,
                physicsConfig: (result.panel_a as Record<string, unknown>)?.physicsConfig ?? null,
                engine: 'p5js',
                teacherScript: result.teacherScript ?? null,
                fromCache: result.fromCache,
                fingerprintKey: fingerprint?.cache_key ?? null,
                conceptId: fingerprint?.concept_id ?? null,
                cached_variants: cachedVariantsMulti,
                regeneration_variants: regenerationVariantsMulti,
                allowDeepDiveStates: allowDeepDiveStatesMulti,
            });
        }

        // ── Single-panel result (existing) ──────────────────────────────────
        // Dual layout: primarySimHtml = particle panel, simHtml = graph panel (secondary)
        const isDual = !!result.primarySimHtml;
        const primarySimHtml = isDual ? result.primarySimHtml! : result.simHtml;
        const secondarySimHtml = isDual ? result.simHtml : null;

        console.log("[generate-simulation] SUCCESS (v3):", {
            engine: result.engine,
            fromCache: result.fromCache,
            simHtmlLen: result.simHtml?.length ?? 0,
            dual: isDual,
        });

        const conceptIdForLookupSingle = fingerprint?.concept_id ?? conceptToUse;
        const cachedVariantsSingle = await fetchCachedVariants(conceptIdForLookupSingle);
        const regenerationVariantsSingle = await fetchRegenerationVariants(conceptIdForLookupSingle);
        const allowDeepDiveStatesSingle = await fetchAllowDeepDiveStates(conceptIdForLookupSingle);
        return NextResponse.json({
            simHtml: primarySimHtml,
            secondarySimHtml,
            physicsConfig: result.physicsConfig,
            engine: result.engine,
            brief: result.brief,
            teacherScript: result.teacherScript ?? null,
            fromCache: result.fromCache,
            fingerprintKey: fingerprint?.cache_key ?? null,
            conceptId: fingerprint?.concept_id ?? null,
            cached_variants: cachedVariantsSingle,
            regeneration_variants: regenerationVariantsSingle,
            allowDeepDiveStates: allowDeepDiveStatesSingle,
        });

    } catch (err) {
        console.error("[generate-simulation] EXCEPTION:", err);
        return NextResponse.json({ physicsConfig: null });
    }
}
