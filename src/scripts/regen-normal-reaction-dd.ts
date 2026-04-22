/**
 * One-off: regenerate deep_dive_cache rows for normal_reaction STATE_3 & STATE_5
 * under the hardened deep_dive_generator_v2 prompt + E42 hard-block gate.
 *
 * Calls generateDeepDive directly (no HTTP, no auth). Mirrors the cache-miss
 * branch of src/app/api/deep-dive/route.ts.
 *
 * Run:  npx tsx src/scripts/regen-normal-reaction-dd.ts
 */

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });
if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set after dotenv load. CWD:", process.cwd());
    process.exit(1);
}

interface ConceptJsonShape {
    concept_id?: string;
    concept_name?: string;
    real_world_anchor?: unknown;
    physics_engine_config?: { variables?: Record<string, { default?: number; constant?: number }> };
    epic_l_path?: {
        states?: Record<string, {
            title?: string;
            scene_composition?: unknown;
            teacher_script?: unknown;
        }>;
    };
}

function buildSiblingSummary(
    states: Record<string, { title?: string }> | undefined,
    excludeStateId: string,
): string {
    if (!states) return "(no sibling states)";
    return Object.entries(states)
        .filter(([key]) => key !== excludeStateId)
        .map(([key, s]) => `${key}: ${s?.title ?? "(untitled)"}`)
        .join("\n");
}

async function main(): Promise<void> {
    // Dynamic imports AFTER dotenv.config runs so module-init reads the key.
    const { supabaseAdmin } = await import("../lib/supabaseAdmin");
    const { loadConstants } = await import("../lib/physics_constants");
    const { generateDeepDive } = await import("../lib/deepDiveGenerator");

    async function regenOne(conceptId: string, stateId: string, classLevel: string, mode: string): Promise<void> {
        const fingerprintKey = `${conceptId}|${stateId}|${classLevel}|${mode}`;
        console.log(`\n=== regenerating ${fingerprintKey} ===`);

        const conceptJson = (await loadConstants(conceptId)) as unknown as ConceptJsonShape | null;
        if (!conceptJson) throw new Error(`concept not found: ${conceptId}`);
        const parentState = conceptJson.epic_l_path?.states?.[stateId];
        if (!parentState) throw new Error(`state ${stateId} not found in ${conceptId}`);

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
        });

        const physicsCritical = (gen.physicsViolations ?? []).filter(v => v.severity === "CRITICAL");
        const physicsNote = physicsCritical.length > 0
            ? `physics_invalid: ${physicsCritical.length} critical violation(s) — ${physicsCritical
                  .slice(0, 8)
                  .map(v => `${v.code}@${v.state_id ?? ""}/${v.primitive_id}(expected=${v.expected} actual=${v.actual})`)
                  .join(" | ")}`
            : undefined;
        const solverNote = gen.layoutViolations && gen.layoutViolations.length > 0
            ? `solver_schema_invalid: ${gen.layoutViolations.length} violation(s)`
            : undefined;
        const combinedNote = [solverNote, physicsNote].filter(Boolean).join("\n");

        const isRejected = physicsCritical.length > 0;
        const rowStatus = isRejected ? "rejected" : "pending_review";

        console.log(`  physicsValid=${gen.physicsValid} violations=${gen.physicsViolations?.length ?? 0} critical=${physicsCritical.length}`);
        if (gen.physicsViolations?.length) {
            for (const v of gen.physicsViolations) {
                console.log(`    ${v.severity} ${v.code}@${v.state_id ?? ""}/${v.primitive_id}  expected=${v.expected} actual=${v.actual}`);
            }
        }

        const { data: inserted, error } = await supabaseAdmin
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
                ...(combinedNote ? { review_notes: combinedNote } : {}),
            })
            .select("id")
            .maybeSingle();

        if (error) {
            console.error(`  INSERT ERROR:`, error);
            return;
        }
        console.log(`  inserted id=${inserted?.id} status=${rowStatus}`);
    }

    await regenOne("normal_reaction", "STATE_3", "Class 12", "conceptual");
    await regenOne("normal_reaction", "STATE_5", "Class 12", "conceptual");
    console.log("\ndone.");
}

main().catch(err => {
    console.error("FATAL:", err);
    process.exit(1);
});
