/**
 * POST /api/drill-down
 *
 * End-to-end drill-down pipeline:
 *   1. Classify the student's confusion phrase via confusionClassifier (Haiku)
 *   2. If classifier returns null (no cluster match), respond with a
 *      "no cluster" signal so the UI can fall back to a generic hint
 *   3. Look up drill_down_cache by (concept_id, state_id, cluster_id,
 *      class_level, mode). If hit and status != 'rejected', return it
 *   4. On miss, generate a MICRO or LOCAL sub-sim with Sonnet and upsert
 *      with status='pending_review'
 *
 * Request:
 *   { concept_id: string,
 *     state_id: string,
 *     confusion_text: string,
 *     class_level?: string,   default '11'
 *     mode?: string,          default 'conceptual'
 *     session_id?: string }
 *
 * Response (cluster matched):
 *   { cluster_id, confidence, reasoning, protocol, sub_sim,
 *     teacher_script_flat, status, from_cache, fingerprint_key }
 *
 * Response (no cluster matched):
 *   { cluster_id: null, confidence, reasoning, message: "..." }
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { loadConstants } from "@/lib/physics_constants";
import { classifyConfusion } from "@/lib/confusionClassifier";
import { generateDrillDown } from "@/lib/drillDownGenerator";
import { assembleParametricHtml } from "@/lib/renderers/parametric_renderer";

interface ConceptJsonShape {
    concept_id?: string;
    concept_name?: string;
    real_world_anchor?: unknown;
    physics_engine_config?: {
        variables?: Record<string, { default?: number; constant?: number }>;
    };
    epic_l_path?: {
        states?: Record<string, { title?: string; scene_composition?: unknown }>;
    };
}

function extractDefaultVariables(concept: ConceptJsonShape): Record<string, number> {
    const out: Record<string, number> = {};
    const vars = concept.physics_engine_config?.variables;
    if (!vars) return out;
    for (const [name, spec] of Object.entries(vars)) {
        if (typeof spec?.default === "number") out[name] = spec.default;
        else if (typeof spec?.constant === "number") out[name] = spec.constant;
    }
    return out;
}

function buildSubSimHtml(
    conceptId: string,
    states: Record<string, unknown>,
    defaultVariables: Record<string, number>
): string {
    const stateKeys = Object.keys(states);
    const firstKey = stateKeys[0] ?? "DR_1";
    const firstStateScene =
        (states[firstKey] as { scene_composition?: unknown[] } | undefined)?.scene_composition ?? [];
    return assembleParametricHtml({
        concept_id: conceptId,
        scene_composition: firstStateScene as unknown[],
        states: states as Record<string, { scene_composition?: unknown[] }>,
        default_variables: defaultVariables,
        current_state: firstKey,
    });
}

interface ClusterRow {
    cluster_id: string;
    label: string;
    description: string | null;
    trigger_examples: string[] | null;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const conceptId = typeof body.concept_id === "string" ? body.concept_id.trim() : "";
        const stateId = typeof body.state_id === "string" ? body.state_id.trim() : "";
        const confusionText = typeof body.confusion_text === "string" ? body.confusion_text.trim() : "";
        const classLevel = typeof body.class_level === "string" ? body.class_level.trim() : "11";
        const mode = typeof body.mode === "string" ? body.mode.trim() : "conceptual";
        const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : undefined;

        if (!conceptId) {
            return NextResponse.json({ error: "concept_id is required" }, { status: 400 });
        }
        if (!stateId) {
            return NextResponse.json({ error: "state_id is required" }, { status: 400 });
        }
        if (!confusionText) {
            return NextResponse.json({ error: "confusion_text is required" }, { status: 400 });
        }

        // 1. Classify
        const classification = await classifyConfusion({
            confusionText,
            conceptId,
            stateId,
            sessionId,
        });

        if (!classification.clusterId) {
            return NextResponse.json({
                cluster_id: null,
                confidence: classification.confidence,
                reasoning: classification.reasoning,
                message:
                    "Your question doesn't match any pre-registered confusion cluster for this state. " +
                    "Try rephrasing, or proceed with the main explanation.",
            });
        }

        const clusterId = classification.clusterId;
        const fingerprintKey = `${conceptId}|${stateId}|${clusterId}|${classLevel}|${mode}`;

        // 2. Cache lookup
        const { data: cached } = await supabaseAdmin
            .from("drill_down_cache")
            .select("id, sub_sim, protocol, teacher_script, status, served_count")
            .eq("fingerprint_key", fingerprintKey)
            .maybeSingle();

        // Load parent concept JSON up-front — needed for default_variables on both
        // cache hit and miss paths so the sub-sim HTML assembler has the right vars.
        const conceptJson = (await loadConstants(conceptId)) as unknown as ConceptJsonShape | null;
        if (!conceptJson) {
            return NextResponse.json({ error: `Concept JSON not found for ${conceptId}` }, { status: 404 });
        }
        const defaultVariables = extractDefaultVariables(conceptJson);

        if (cached && cached.status !== "rejected") {
            void supabaseAdmin
                .from("drill_down_cache")
                .update({ served_count: (cached.served_count ?? 0) + 1, updated_at: new Date().toISOString() })
                .eq("id", cached.id)
                .then(({ error }) => {
                    if (error) console.error("[drill-down] served_count update failed:", error);
                });

            const cachedStates = ((cached.sub_sim as { states?: Record<string, unknown> } | null)?.states ?? {}) as Record<string, unknown>;
            const simHtml = buildSubSimHtml(conceptId, cachedStates, defaultVariables);

            return NextResponse.json({
                cluster_id: clusterId,
                confidence: classification.confidence,
                reasoning: classification.reasoning,
                protocol: cached.protocol,
                sub_sim: cached.sub_sim,
                sim_html: simHtml,
                default_variables: defaultVariables,
                teacher_script_flat: cached.teacher_script,
                status: cached.status,
                from_cache: true,
                served_count: (cached.served_count ?? 0) + 1,
                fingerprint_key: fingerprintKey,
            });
        }

        // 3. Cache miss — look up the parent state for generation context
        const parentState = conceptJson.epic_l_path?.states?.[stateId];
        if (!parentState) {
            return NextResponse.json({ error: `State ${stateId} not found in ${conceptId}` }, { status: 404 });
        }

        const { data: clusterData } = await supabaseAdmin
            .from("confusion_cluster_registry")
            .select("cluster_id, label, description, trigger_examples")
            .eq("cluster_id", clusterId)
            .maybeSingle();
        const cluster = clusterData as ClusterRow | null;
        if (!cluster) {
            return NextResponse.json(
                { error: `Classifier returned cluster_id ${clusterId} but no matching row in registry` },
                { status: 500 }
            );
        }

        // 4. Generate
        const gen = await generateDrillDown({
            conceptId,
            conceptName: conceptJson.concept_name ?? conceptId,
            classLevel,
            mode,
            stateId,
            stateTitle: parentState.title ?? "",
            parentSceneComposition: parentState.scene_composition ?? [],
            realWorldAnchor: conceptJson.real_world_anchor ?? {},
            physicsEngineConfig: conceptJson.physics_engine_config ?? {},
            clusterId,
            clusterLabel: cluster.label,
            clusterDescription: cluster.description ?? "",
            clusterTriggerExamples: cluster.trigger_examples ?? [],
            sessionId,
        });

        // 5. Upsert pending_review
        const { data: inserted, error: insertErr } = await supabaseAdmin
            .from("drill_down_cache")
            .insert({
                fingerprint_key: fingerprintKey,
                concept_id: conceptId,
                state_id: stateId,
                cluster_id: clusterId,
                class_level: classLevel,
                mode,
                sub_sim: gen.subSim,
                protocol: gen.protocol,
                teacher_script: gen.teacherScriptFlat,
                status: "pending_review",
                generated_by: "sonnet-lazy",
                model: "claude-sonnet-4-6",
                served_count: 1,
            })
            .select("id")
            .maybeSingle();

        if (insertErr) {
            console.error("[drill-down] cache insert error:", insertErr);
        }

        const simHtml = buildSubSimHtml(conceptId, gen.subSim.states, defaultVariables);

        return NextResponse.json({
            cluster_id: clusterId,
            confidence: classification.confidence,
            reasoning: classification.reasoning,
            protocol: gen.protocol,
            sub_sim: gen.subSim,
            sim_html: simHtml,
            default_variables: defaultVariables,
            teacher_script_flat: gen.teacherScriptFlat,
            status: "pending_review",
            from_cache: false,
            served_count: 1,
            fingerprint_key: fingerprintKey,
            id: inserted?.id ?? null,
        });
    } catch (err) {
        console.error("[drill-down] EXCEPTION:", err);
        const msg = err instanceof Error ? err.message : "Internal error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
