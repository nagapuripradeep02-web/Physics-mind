/**
 * Verification script for the field_3d fallback bug fix (session 2026-05-23).
 *
 * The bug: when Anthropic is unavailable (or returns 400), the SimulationBrief
 * confidence gate dropped to LOW and the "safe fallback brief" was emitted.
 * The strict-engines bypass in aiSimulationGenerator.ts then fell into the
 * non-PCPL else-branch (assembleMechanics2DHtml), silently collapsing every
 * field_3d concept (magnetism Diamonds #1–4) into mechanics_2d output.
 *
 * The fix: inside the strict-engines bypass, when renderer_a === 'field_3d'
 * AND the concept JSON ships a top-level field_3d_config, route to
 * assembleField3DHtml directly. Zero Sonnet, zero Anthropic dependency.
 *
 * This script calls generateSimulation directly (no HTTP, no auth) and asserts
 * the returned sim_html contains THREE.js markers (NOT M2_ globals). Mirrors
 * the regen pattern from src/scripts/regen-normal-reaction-dd.ts.
 *
 * Run:  npx tsx src/scripts/verify-field3d-fix.ts
 */

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

import { generateSimulation } from "../lib/aiSimulationGenerator";

const FIELD_3D_DIAMONDS = [
    "magnetic_field_solenoid",
    "magnetic_field_wire",
    "magnetic_force_moving_charge",
    "torque_on_current_loop_in_field",
] as const;

interface ProbeResult {
    concept_id: string;
    has_THREE: boolean;
    has_M2: boolean;
    sim_html_size: number;
    engine: string;
    error: string | null;
}

async function probeConcept(conceptId: string): Promise<ProbeResult> {
    try {
        const result = await generateSimulation(
            conceptId,                                          // concept
            `Explain ${conceptId.replace(/_/g, " ")}`,          // question
            "12",                                                // classLevel
            undefined,                                           // imageContext
            undefined,                                           // simConfig
            undefined,                                           // fingerprint
            undefined,                                           // recentMessages
            undefined,                                           // confusionPoint
            undefined,                                           // mvsContext
            null,                                                // studentConfusionData
            null,                                                // panelConfig
            undefined,                                           // scope
            "conceptual",                                        // examMode
        );
        if (!result) {
            return {
                concept_id: conceptId,
                has_THREE: false,
                has_M2: false,
                sim_html_size: 0,
                engine: "n/a",
                error: "generateSimulation returned null",
            };
        }
        // single_panel result shape
        const simHtml =
            "simHtml" in result && typeof result.simHtml === "string"
                ? result.simHtml
                : "";
        const engine =
            "engine" in result && typeof result.engine === "string"
                ? result.engine
                : "unknown";
        return {
            concept_id: conceptId,
            has_THREE: simHtml.includes("THREE") || simHtml.includes("three.module.js") || simHtml.includes("buildSolenoidField") || simHtml.includes("scenario_type"),
            has_M2: /\bM2_[A-Za-z_]+/.test(simHtml),
            sim_html_size: simHtml.length,
            engine,
            error: null,
        };
    } catch (err) {
        return {
            concept_id: conceptId,
            has_THREE: false,
            has_M2: false,
            sim_html_size: 0,
            engine: "n/a",
            error: err instanceof Error ? err.message : String(err),
        };
    }
}

async function main(): Promise<void> {
    console.log("\n=== Field 3D fallback-bug verification ===\n");
    const results: ProbeResult[] = [];
    for (const conceptId of FIELD_3D_DIAMONDS) {
        console.log(`[probe] ${conceptId} ...`);
        const r = await probeConcept(conceptId);
        results.push(r);
    }
    console.log("\n=== Results ===\n");
    let pass = 0;
    let fail = 0;
    for (const r of results) {
        const verdict =
            r.error !== null
                ? "ERROR"
                : r.has_THREE && !r.has_M2
                ? "PASS"
                : "FAIL";
        if (verdict === "PASS") pass++;
        else fail++;
        console.log(
            `${verdict.padEnd(5)} ${r.concept_id.padEnd(40)} engine=${r.engine.padEnd(8)} size=${String(r.sim_html_size).padStart(7)} THREE=${r.has_THREE} M2=${r.has_M2}` +
                (r.error ? `  err=${r.error.slice(0, 80)}` : ""),
        );
    }
    console.log(`\n${pass} PASS, ${fail} FAIL across ${results.length} field_3d Diamonds.\n`);
    process.exit(fail === 0 ? 0 : 1);
}

main().catch((err: unknown) => {
    console.error("verify-field3d-fix crashed:", err);
    process.exit(2);
});
