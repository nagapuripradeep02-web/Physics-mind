/**
 * validate-mathematics.ts — mathematics concept validator
 * (2026-08-04, MATHEMATICS_BUILD_PLAN.md Phase 2.5.)
 *
 * Scans ONLY src/data/concepts/mathematics/*.json (the isolation contract: the
 * physics validator's flat scan is non-recursive by design and never sees these
 * files — docs/MATHEMATICS_ARCHITECTURE.md §5). An empty namespace is a PASS
 * (0 files scanned), which is deliberate: it lets this run in CI from the very
 * first commit, before any mathematics concept exists.
 *
 * ⚠ WHY THIS SHIPS WITH ITS CI STEP IN THE SAME COMMIT.
 * `validate:concepts` scans the flat dir non-recursively, so it never sees a
 * subject subfolder. Chemistry therefore ran FIVE SESSIONS with no CI coverage at
 * all — a broken chemistry concept passed the entire workflow green until
 * `validate:chemistry` was added to verify.yml on 2026-07-28, four concepts deep.
 * Mathematics does not repeat that: the gate and its CI step land together, empty.
 *
 * Gates (all shared, from ./lib/conceptGates):
 *   1. JSON parses.
 *   2. Zod schema via validateConceptJson — the subject-neutral schema, reused
 *      as-is exactly as chemistry reuses it (its shapes carry no physics).
 *   3. Word budget (Rule 31a) — WARN-only.
 *   4. Indicator position binding — HARD FAIL.
 *   5. Duplicate JSON keys — HARD FAIL.
 *   6. Narration must not outrun choreography (Rule 31a inversion) — WARN-only.
 *
 * MATHEMATICS-SPECIFIC GATES ARE DELIBERATELY ABSENT and must stay absent until a
 * real defect seeds one. House discipline: a gate is EARNED by a scar, never
 * anticipated (root CLAUDE.md §2 — the scar list is fed by the human, not by AI
 * judges). The two already named as likely first candidates, recorded here so the
 * intent is not lost:
 *   - INTERVAL HONESTY — a curve drawn over [a, b] under a caption claiming "for
 *     all x". This is the mathematics analogue of chemistry's conservation gate
 *     and the failure mode `mathematics_author` exists to prevent.
 *   - NOTATION LADDER (Rule 38c) — formal limit/integral/operator notation
 *     appearing on a `core` or `extended` depth_ring state.
 * Neither is machine-checkable cheaply today (both need the authored ledger,
 * which lives in the skeleton, not the JSON), which is precisely why they wait
 * for a defect rather than a guess.
 *
 * Usage: npm run validate:mathematics
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateConceptJson } from '../schemas/conceptJson';
import {
    wordBudgetWarnings,
    indicatorBindingErrors,
    duplicateKeyErrors,
    narrationChoreographyWarnings,
} from './lib/conceptGates';

const MATH_DIR = join(process.cwd(), 'src', 'data', 'concepts', 'mathematics');

function main(): void {
    if (!existsSync(MATH_DIR)) {
        console.log('validate:mathematics — mathematics namespace not found; 0 files scanned. PASS');
        return;
    }

    const files = readdirSync(MATH_DIR)
        .filter((f) => f.endsWith('.json') && !f.includes('.legacy.') && !f.includes('.deleted'))
        .sort();

    console.log(`\nvalidate:mathematics — scanning src/data/concepts/mathematics/ (${files.length} JSON file(s))\n`);

    let passCount = 0;
    const failures: string[] = [];
    const allWarnings: string[] = [];

    for (const file of files) {
        let parsed: unknown;
        let raw = '';
        try {
            raw = readFileSync(join(MATH_DIR, file), 'utf-8');
            parsed = JSON.parse(raw);
        } catch (e) {
            failures.push(`${file}: JSON parse error — ${e instanceof Error ? e.message : String(e)}`);
            console.log(`FAIL        ${file} (parse error)`);
            continue;
        }

        const result = validateConceptJson(parsed, file);
        const indicatorErrors = indicatorBindingErrors(parsed, file);
        const dupErrors = duplicateKeyErrors(raw, file);
        const errors = [...(result.passed ? [] : result.errors), ...indicatorErrors, ...dupErrors];

        if (errors.length === 0) {
            passCount += 1;
            console.log(`PASS        ${file}`);
        } else {
            failures.push(`${file}:\n${errors.join('\n')}`);
            console.log(`FAIL        ${file}`);
        }

        allWarnings.push(...wordBudgetWarnings(parsed, file));
        allWarnings.push(...narrationChoreographyWarnings(parsed, file));
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
