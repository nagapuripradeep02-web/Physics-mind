/**
 * validate-chemistry.ts — v0 chemistry concept validator
 * (2026-07-23, CHEMISTRY_BUILD_PLAN.md Phase 2.5 pull-forward; full chemistry
 * gates — machine-checked balanced-equation ledger, chemistry animation
 * vocabulary — land in Phase 4.)
 *
 * Scans ONLY src/data/concepts/chemistry/*.json (the isolation contract:
 * the physics validator's flat scan is non-recursive by design and never sees
 * these files — docs/CHEMISTRY_ARCHITECTURE.md §7). An empty namespace is a
 * PASS (0 files scanned) so this can run in CI before the first concept lands.
 *
 * v0 gates:
 *   1. JSON parses.
 *   2. Zod schema via validateConceptJson (src/schemas/conceptJson.ts) — the
 *      subject-neutral schema the vertical slice reuses as-is, including its
 *      superRefine gates (≥2 advance_mode, coverage/quiz when assessment
 *      present, board all-or-nothing).
 *   3. Word budget (Rule 31a) — WARN-only: guided states 25–55 EN words on
 *      text_en; explore states (advance_mode interaction_complete) exempt.
 *
 * Usage: npm run validate:chemistry
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateConceptJson } from '../schemas/conceptJson';

const CHEM_DIR = join(process.cwd(), 'src', 'data', 'concepts', 'chemistry');

interface StateShape {
    advance_mode?: string;
    teacher_script?: { tts_sentences?: Array<{ text_en?: string }> };
}

function wordBudgetWarnings(data: unknown, file: string): string[] {
    const warnings: string[] = [];
    const states =
        (data as { epic_l_path?: { states?: Record<string, StateShape> } })?.epic_l_path?.states ?? {};
    for (const [stateId, state] of Object.entries(states)) {
        if (state.advance_mode === 'interaction_complete') continue; // explore = 0/open
        const words = (state.teacher_script?.tts_sentences ?? [])
            .map((s) => s.text_en ?? '')
            .join(' ')
            .trim()
            .split(/\s+/)
            .filter(Boolean).length;
        if (words > 55) warnings.push(`${file} ${stateId}: ${words} EN words (>55 — two ideas? split)`);
        else if (words > 0 && words < 20) warnings.push(`${file} ${stateId}: ${words} EN words (<~20 — merge/enrich)`);
    }
    return warnings;
}

function main(): void {
    if (!existsSync(CHEM_DIR)) {
        console.log('validate:chemistry — chemistry namespace not found; 0 files scanned. PASS');
        return;
    }

    const files = readdirSync(CHEM_DIR)
        .filter((f) => f.endsWith('.json') && !f.includes('.legacy.') && !f.includes('.deleted'))
        .sort();

    console.log(`\nvalidate:chemistry — scanning src/data/concepts/chemistry/ (${files.length} JSON file(s))\n`);

    let passCount = 0;
    const failures: string[] = [];
    const allWarnings: string[] = [];

    for (const file of files) {
        let parsed: unknown;
        try {
            parsed = JSON.parse(readFileSync(join(CHEM_DIR, file), 'utf-8'));
        } catch (e) {
            failures.push(`${file}: JSON parse error — ${e instanceof Error ? e.message : String(e)}`);
            console.log(`FAIL        ${file} (parse error)`);
            continue;
        }

        const result = validateConceptJson(parsed, file);
        if (result.passed) {
            passCount += 1;
            console.log(`PASS        ${file}`);
        } else {
            failures.push(`${file}:\n${result.errors.join('\n')}`);
            console.log(`FAIL        ${file}`);
        }

        allWarnings.push(...wordBudgetWarnings(parsed, file));
    }

    if (allWarnings.length > 0) {
        console.log(`\nWord-budget warnings (Rule 31a — non-fatal):`);
        for (const w of allWarnings) console.log(`  WARN  ${w}`);
    }

    console.log(`\nSummary: ${files.length} scanned, ${passCount} PASS, ${failures.length} FAIL`);
    if (failures.length > 0) {
        console.error('\nFailures:\n' + failures.join('\n\n'));
        process.exit(1);
    }
    console.log('PASS');
}

main();
