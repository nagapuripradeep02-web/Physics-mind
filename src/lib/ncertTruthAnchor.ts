// =============================================================================
// ncertTruthAnchor.ts
// Calls Claude Sonnet 4.6 as a strict physics examiner.
// Loads ncert_truth_statements for the concept, checks each against the
// simulation config. Returns pass/fail with specific failure strings.
// Never blocks a simulation — API failures default to passed=true.
// =============================================================================

import fs from "fs";
import path from "path";
import { anthropicGenerate } from "@/lib/providers/anthropicProvider";
import { CONCEPT_FILE_MAP } from "@/lib/physics_validator";

export interface TruthAnchorResult {
    passed: boolean;
    failures: string[];
    checkedAt: number;
    skipped?: boolean;
}

function resolveFilename(conceptId: string): string {
    // 1. Exact match
    if (CONCEPT_FILE_MAP[conceptId]) return CONCEPT_FILE_MAP[conceptId];
    // 2. Partial match — e.g. "ohms_law_basic" contains key "ohms_law"
    for (const [key, file] of Object.entries(CONCEPT_FILE_MAP)) {
        if (conceptId.includes(key)) return file;
    }
    // 3. Fallback: use conceptId as-is (may or may not exist on disk)
    return conceptId;
}

function loadTruthStatements(conceptId: string): string[] | null {
    const filename = resolveFilename(conceptId);
    try {
        const filePath = path.join(
            process.cwd(),
            "src", "lib", "physics_constants",
            `${filename}.json`
        );
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw) as { ncert_truth_statements?: string[] };
        return parsed.ncert_truth_statements ?? null;
    } catch {
        return null;
    }
}

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildPrompt(
    conceptId: string,
    statements: string[],
    config: unknown
): string {
    const numberedStatements = statements
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n");

    return `You are a physics examiner checking a simulation config for the concept: "${conceptId}".

For each NCERT truth statement below, answer only YES or NO on a single line.
Format: "1. YES" or "1. NO" — nothing else. No explanations. Do not be generous.
A statement PASSES only if the simulation config clearly supports or does not contradict it.

NCERT TRUTH STATEMENTS:
${numberedStatements}

SIMULATION CONFIG:
${JSON.stringify(config, null, 2)}

Answer each statement number followed by YES or NO. One per line. Nothing else.`;
}

// ── Response parser ───────────────────────────────────────────────────────────
function parseExaminerResponse(
    raw: string,
    statements: string[]
): { failures: string[] } {
    const failures: string[] = [];
    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
        // Match patterns: "1. NO", "1) NO", "1 NO", "NO" after a number
        const match = line.match(/^(\d+)[.):\s]+\s*(YES|NO)\s*$/i);
        if (!match) continue;
        const idx = parseInt(match[1], 10) - 1;
        const verdict = match[2].toUpperCase();
        if (verdict === "NO" && idx >= 0 && idx < statements.length) {
            failures.push(statements[idx]);
        }
    }

    return { failures };
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function checkNcertTruth(
    config: unknown,
    conceptId: string
): Promise<TruthAnchorResult> {
    const checkedAt = Date.now();

    // Skip Truth Anchor for graph configs — graphs render axes/curves, not particle-level
    // physics. Truth statements describe particle behaviour and are not applicable here.
    const renderer = (config as Record<string, unknown>)?.renderer;
    if (renderer === "graph_interactive") {
        console.log("[v5-TruthAnchor] Skipping — graph renderer, truth statements not applicable");
        return { passed: true, failures: [], checkedAt, skipped: true };
    }

    const statements = loadTruthStatements(conceptId);
    if (!statements || statements.length === 0) {
        console.warn(`[ncertTruthAnchor] No truth statements found for concept_id="${conceptId}". Skipping check.`);
        return { passed: true, failures: [], checkedAt };
    }

    const prompt = buildPrompt(conceptId, statements, config);

    try {
        const { text } = await anthropicGenerate(
            {
                model: "claude-sonnet-4-6",
                provider: "anthropic",
                costPer1KInput: 0.003,
                costPer1KOutput: 0.015,
            },
            "You are a strict physics examiner. Answer only YES or NO for each statement. One answer per line. No explanations.",
            prompt,
            // At most 5 statements × 10 chars each — 100 tokens is sufficient.
            // Use 200 to be safe.
            200
        );

        const { failures } = parseExaminerResponse(text, statements);

        if (failures.length > 0) {
            console.warn(`[ncertTruthAnchor] FAILED ${failures.length}/${statements.length} checks for "${conceptId}":`, failures);
        } else {
            console.log(`[ncertTruthAnchor] All ${statements.length} truth checks PASSED for "${conceptId}".`);
        }

        return {
            passed: failures.length === 0,
            failures,
            checkedAt,
        };
    } catch (err) {
        console.warn(`[ncertTruthAnchor] Sonnet call failed for "${conceptId}" — defaulting to passed=true:`, err);
        return { passed: true, failures: [], checkedAt };
    }
}
