/**
 * POST /api/deep-dive
 *
 * Returns a 4–6 sub-state elaboration of a specific parent state. Cache-first:
 * if the (concept_id, state_id, class_level, mode) key hits deep_dive_cache
 * and status != 'rejected', return instantly. On miss, generate with Sonnet
 * and upsert with status='pending_review' for human review.
 *
 * Request:
 *   { concept_id: string,
 *     state_id: string,
 *     class_level?: string,   default '11'
 *     mode?: string,          default 'conceptual'
 *     session_id?: string }
 *
 * Response:
 *   { id: string, sub_states: object, teacher_script_flat: array,
 *     status: string, from_cache: boolean, served_count: number,
 *     fingerprint_key: string }
 *
 *   400 if concept_id or state_id missing.
 *   404 if the parent concept JSON or state cannot be loaded.
 *   500 on generation failure.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { loadConstants } from "@/lib/physics_constants";
import { generateDeepDive } from "@/lib/deepDiveGenerator";
import { assembleParametricHtml } from "@/lib/renderers/parametric_renderer";
import { validatePCPLSubSimStates } from "@/lib/pcplPhysicsValidator";

interface ConceptJsonShape {
    concept_id?: string;
    concept_name?: string;
    real_world_anchor?: unknown;
    physics_engine_config?: {
        variables?: Record<string, { default?: number; constant?: number }>;
    };
    epic_l_path?: {
        states?: Record<string, {
            title?: string;
            scene_composition?: unknown;
            teacher_script?: unknown;
        }>;
    };
}

/**
 * Derive default_variables from a concept JSON's physics_engine_config.variables.
 * Each variable may declare `default` (tunable) or `constant` (fixed). We take
 * whichever is defined, with `default` taking precedence.
 */
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

/**
 * Build a parametric sim HTML from the sub_states. Picks the first state as
 * current; the SubSimPlayer on the client drives state transitions via
 * SET_STATE postMessage.
 */
function buildSubSimHtml(
    conceptId: string,
    subStates: Record<string, unknown>,
    defaultVariables: Record<string, number>
): string {
    const stateKeys = Object.keys(subStates);
    const firstKey = stateKeys[0] ?? "STATE_DD1";
    const firstStateScene =
        (subStates[firstKey] as { scene_composition?: unknown[] } | undefined)?.scene_composition ?? [];
    return assembleParametricHtml({
        concept_id: conceptId,
        scene_composition: firstStateScene as unknown[],
        states: subStates as Record<string, { scene_composition?: unknown[] }>,
        default_variables: defaultVariables,
        current_state: firstKey,
    });
}

function buildSiblingSummary(states: Record<string, { title?: string }> | undefined, excludeStateId: string): string {
    if (!states) return "(no sibling states)";
    return Object.entries(states)
        .filter(([key]) => key !== excludeStateId)
        .map(([key, s]) => `${key}: ${s?.title ?? "(untitled)"}`)
        .join("\n");
}

/**
 * Rebuild the flat teacher script from sub_states so each entry carries its
 * per-sentence `duration_ms` (B3 — sentence-synced pacing). Falls back to the
 * generator's Sonnet-authored flat list when sub_states is missing timing data.
 */
interface FlatSentence {
    id: string;
    text: string;
    duration_ms?: number;
}
function enrichTeacherScriptFlat(
    subStates: Record<string, unknown>,
    fallback: Array<{ id: string; text: string }>
): FlatSentence[] {
    const out: FlatSentence[] = [];
    for (const [stateKey, rawState] of Object.entries(subStates)) {
        const state = rawState as { teacher_script?: { tts_sentences?: Array<{ id?: string; text_en?: string; duration_ms?: number }> } };
        const sentences = state?.teacher_script?.tts_sentences;
        if (!Array.isArray(sentences)) continue;
        for (const s of sentences) {
            if (!s?.id || typeof s.text_en !== "string") continue;
            out.push({
                id: `${stateKey}_${s.id}`,
                text: s.text_en,
                duration_ms: typeof s.duration_ms === "number" ? s.duration_ms : undefined,
            });
        }
    }
    // Fallback when Sonnet skipped the tts_sentences structure entirely (older
    // cached rows predate B3 and have no duration_ms).
    if (out.length === 0) return fallback.map(f => ({ id: f.id, text: f.text }));
    return out;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const conceptId = typeof body.concept_id === "string" ? body.concept_id.trim() : "";
        const stateId = typeof body.state_id === "string" ? body.state_id.trim() : "";
        const classLevel = typeof body.class_level === "string" ? body.class_level.trim() : "11";
        const mode = typeof body.mode === "string" ? body.mode.trim() : "conceptual";
        const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : undefined;

        if (!conceptId) {
            return NextResponse.json({ error: "concept_id is required" }, { status: 400 });
        }
        if (!stateId) {
            return NextResponse.json({ error: "state_id is required" }, { status: 400 });
        }

        const fingerprintKey = `${conceptId}|${stateId}|${classLevel}|${mode}`;

        // Cache lookup
        const { data: cached, error: cacheErr } = await supabaseAdmin
            .from("deep_dive_cache")
            .select("id, sub_states, teacher_script, status, served_count")
            .eq("fingerprint_key", fingerprintKey)
            .maybeSingle();
        if (cacheErr) {
            console.error("[deep-dive] cache lookup error:", cacheErr);
        }

        // Load parent concept JSON up-front — needed for default_variables regardless
        // of cache hit or miss, so the sub-sim HTML assembler has the right vars.
        const conceptJson = (await loadConstants(conceptId)) as unknown as ConceptJsonShape | null;
        if (!conceptJson) {
            return NextResponse.json({ error: `Concept JSON not found for ${conceptId}` }, { status: 404 });
        }
        const defaultVariables = extractDefaultVariables(conceptJson);
        // E42 surface inheritance: sub-states often omit the surface primitive
        // because the iframe hoists it from the parent state. Pass the parent
        // scene to the validator so it knows the actual surface angle.
        // Concept JSONs wrap the scene in `{primitives: [...]}`. Unwrap so the
        // validator sees a bare array of primitive specs.
        const parentSceneRaw = conceptJson.epic_l_path?.states?.[stateId]?.scene_composition;
        const parentSceneForValidation: unknown[] = Array.isArray(parentSceneRaw)
            ? parentSceneRaw
            : Array.isArray((parentSceneRaw as { primitives?: unknown[] } | null | undefined)?.primitives)
                ? ((parentSceneRaw as { primitives: unknown[] }).primitives)
                : [];

        if (cached && cached.status !== "rejected") {
            // Fire-and-forget served_count increment
            void supabaseAdmin
                .from("deep_dive_cache")
                .update({ served_count: (cached.served_count ?? 0) + 1, updated_at: new Date().toISOString() })
                .eq("id", cached.id)
                .then(({ error }) => {
                    if (error) console.error("[deep-dive] served_count update failed:", error);
                });

            const subStates = (cached.sub_states ?? {}) as Record<string, unknown>;
            const simHtml = buildSubSimHtml(conceptId, subStates, defaultVariables);
            const cachedFlat = Array.isArray(cached.teacher_script)
                ? cached.teacher_script as Array<{ id: string; text: string }>
                : [];
            const enrichedFlat = enrichTeacherScriptFlat(subStates, cachedFlat);

            // E42 — re-validate cached rows at serve time so the probe UI can
            // surface physics violations on previously-generated content
            // without a fresh Sonnet call. Cheap: <2 ms. Parent scene passed
            // so surface primitives are inherited properly.
            const cachedPhysics = validatePCPLSubSimStates(
                subStates as Record<string, { scene_composition?: unknown[] }>,
                2,
                parentSceneForValidation,
                defaultVariables,
            );

            return NextResponse.json({
                id: cached.id,
                sub_states: subStates,
                teacher_script_flat: enrichedFlat,
                sim_html: simHtml,
                default_variables: defaultVariables,
                status: cached.status,
                from_cache: true,
                served_count: (cached.served_count ?? 0) + 1,
                fingerprint_key: fingerprintKey,
                physics_violations: cachedPhysics.violations,
                physics_valid: cachedPhysics.valid,
            });
        }

        // Cache miss path: look up the parent state for context
        const parentState = conceptJson.epic_l_path?.states?.[stateId];
        if (!parentState) {
            return NextResponse.json({ error: `State ${stateId} not found in ${conceptId}` }, { status: 404 });
        }

        const gen = await generateDeepDive({
            conceptId,
            conceptName: conceptJson.concept_name ?? conceptId,
            classLevel,
            mode,
            stateId,
            stateTitle: parentState.title ?? "",
            parentSceneComposition: parentState.scene_composition ?? [],
            parentTeacherScript: parentState.teacher_script ?? {},
            siblingStatesSummary: buildSiblingSummary(conceptJson.epic_l_path?.states, stateId),
            realWorldAnchor: conceptJson.real_world_anchor ?? {},
            physicsEngineConfig: conceptJson.physics_engine_config ?? {},
            sessionId,
        });

        // Upsert with pending_review. ON CONFLICT fingerprint_key: preserve any
        // manually-reviewed existing row by only inserting if absent.
        // Capture any solver-contract violations into review_notes so admins
        // can triage them during review (off unless DEEP_DIVE_USES_RELATIONSHIPS=1).
        const solverReviewNote =
            gen.layoutViolations && gen.layoutViolations.length > 0
                ? `solver_schema_invalid: ${gen.layoutViolations.length} violation(s) — ${gen.layoutViolations
                      .slice(0, 5)
                      .map((v) => `${v.primitiveId}:${v.code}`)
                      .join(", ")}`
                : undefined;

        // E42 physics violations → review_notes. CRITICAL violations (wrong
        // direction_deg for N/mg/mg_perp, N-perp not 180° opposite, angle_arc
        // value mismatch) are quality-blockers for human review.
        const physicsCritical = (gen.physicsViolations ?? []).filter(v => v.severity === 'CRITICAL');
        const physicsNote =
            physicsCritical.length > 0
                ? `physics_invalid: ${physicsCritical.length} critical violation(s) — ${physicsCritical
                      .slice(0, 5)
                      .map((v) => `${v.code}@${v.state_id ?? ''}/${v.primitive_id}(expected=${v.expected} actual=${v.actual})`)
                      .join(" | ")}`
                : undefined;

        const combinedReviewNote = [solverReviewNote, physicsNote].filter(Boolean).join("\n");

        // E42 HARD GATE: when Sonnet's output has ANY CRITICAL physics violation,
        // persist the row with status='rejected' (so the next request regenerates
        // instead of serving broken content) and return a 422 fallback to the
        // client. Student sees a "regenerating — please try again" state, NOT a
        // sub-sim with arrows pointing the wrong way.
        const isRejected = physicsCritical.length > 0;
        const rowStatus = isRejected ? "rejected" : "pending_review";

        const { data: inserted, error: insertErr } = await supabaseAdmin
            .from("deep_dive_cache")
            .insert({
                fingerprint_key: fingerprintKey,
                concept_id: conceptId,
                state_id: stateId,
                class_level: classLevel,
                mode,
                sub_states: gen.subStates,
                teacher_script: gen.teacherScriptFlat,
                status: rowStatus,
                generated_by: "sonnet-lazy",
                model: "claude-sonnet-4-6",
                served_count: isRejected ? 0 : 1,
                ...(combinedReviewNote ? { review_notes: combinedReviewNote } : {}),
            })
            .select("id")
            .maybeSingle();

        if (insertErr) {
            console.error("[deep-dive] cache insert error:", insertErr);
        }

        if (isRejected) {
            console.warn(
                `[deep-dive] E42 rejected generation for ${fingerprintKey}: ${physicsCritical.length} critical violation(s)`,
            );
            return NextResponse.json(
                {
                    id: inserted?.id ?? null,
                    error: "physics_validation_failed",
                    message:
                        "This explanation is being regenerated — the physics validator caught an error in the draft. Please try again in a moment.",
                    status: "rejected",
                    from_cache: false,
                    fingerprint_key: fingerprintKey,
                    physics_violations: gen.physicsViolations ?? [],
                    physics_valid: false,
                },
                { status: 422 },
            );
        }

        const simHtml = buildSubSimHtml(conceptId, gen.subStates, defaultVariables);
        const enrichedFlat = enrichTeacherScriptFlat(gen.subStates, gen.teacherScriptFlat);

        return NextResponse.json({
            id: inserted?.id ?? null,
            sub_states: gen.subStates,
            teacher_script_flat: enrichedFlat,
            sim_html: simHtml,
            default_variables: defaultVariables,
            status: rowStatus,
            from_cache: false,
            served_count: 1,
            fingerprint_key: fingerprintKey,
            physics_violations: gen.physicsViolations ?? [],
            physics_valid: gen.physicsValid ?? true,
        });
    } catch (err) {
        console.error("[deep-dive] EXCEPTION:", err);
        const msg = err instanceof Error ? err.message : "Internal error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
