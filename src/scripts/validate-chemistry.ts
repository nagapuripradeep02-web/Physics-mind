/**
 * validate-chemistry.ts — chemistry concept validator
 * (2026-07-23, CHEMISTRY_BUILD_PLAN.md Phase 2.5 pull-forward; full chemistry
 * gates — machine-checked balanced-equation ledger, chemistry animation
 * vocabulary — land in Phase 4.)
 *
 * Scans ONLY src/data/concepts/chemistry/*.json (the isolation contract:
 * the physics validator's flat scan is non-recursive by design and never sees
 * these files — docs/CHEMISTRY_ARCHITECTURE.md §7). An empty namespace is a
 * PASS (0 files scanned) so this can run in CI before the first concept lands.
 *
 * 2026-08-04 (MATHEMATICS_BUILD_PLAN.md Phase 2.5): the SUBJECT-NEUTRAL gates
 * moved BY MOVE to `src/scripts/lib/conceptGates.ts` so `validate-mathematics.ts`
 * shares them rather than forking them. Behaviour here is unchanged — output was
 * captured before the move and diffed after, byte-identical. Only
 * `gasPopulationErrors` below is chemistry-specific and stays.
 *
 * Gates:
 *   1. JSON parses.
 *   2. Zod schema via validateConceptJson (src/schemas/conceptJson.ts) — the
 *      subject-neutral schema the vertical slice reuses as-is, including its
 *      superRefine gates (≥2 advance_mode, coverage/quiz when assessment
 *      present, board all-or-nothing).
 *   3. Shared gates (conceptGates.ts): word budget (Rule 31a, WARN-only),
 *      indicator binding, duplicate keys, narration-vs-choreography (WARN-only).
 *   4. Chemistry-specific: gas_box population/composition coherence.
 *
 * Usage: npm run validate:chemistry
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

const CHEM_DIR = join(process.cwd(), 'src', 'data', 'concepts', 'chemistry');

// ── Gate: a gas_box state that turns the reaction OFF must declare a population
// matching its composition. HARD FAIL. ──────────────────────────────────────
// With the reaction ON, gasSyncCount treats N as a DELTA control and leaves the
// composition alone. With it OFF it takes the other branch, where N is the
// population and the array is TRUNCATED to it — `particles.length = want`.
// Because gasPlaceSpecies lays species down in order, the survivors are the
// FIRST species only.
//
// Measured cost (collision_theory_activation_energy STATE_7, 2026-07-29): the
// state authored species_counts {A:360, B:360} for a deliberate density
// exception but no N, so the config count of 180 truncated it on the next tick.
// It opened with 720 discs and ran with 180, EVERY ONE OF THEM species A —
// every B disc deleted. Nothing caught it: tsc, the validators, check:gas-reaction
// and a 35/35 THE EYE run were all green, and the state's own Arrhenius
// instrument still drew a clean straight line, because A-A collisions clear the
// barrier exactly as well as A-B ones. It was found by looking at a frame and
// noticing the box had gone entirely blue.
function gasPopulationErrors(data: unknown, file: string): string[] {
    const errors: string[] = [];
    const cfg = (data as { particle_field_config?: Record<string, unknown> })?.particle_field_config;
    if (!cfg || cfg.scenario_type !== 'gas_box') return errors;
    const gas = (cfg.gas ?? {}) as { count?: number; reaction?: { enabled?: boolean } };
    const configOn = !!gas.reaction && gas.reaction.enabled !== false;
    const states = (cfg.states ?? {}) as Record<string, Record<string, unknown>>;
    for (const [stateId, st] of Object.entries(states)) {
        const counts = st.species_counts as Record<string, number> | undefined;
        if (!counts) continue;
        const stateRx = st.reaction as { enabled?: boolean } | undefined;
        const rxOn = (stateRx && typeof stateRx.enabled === 'boolean') ? stateRx.enabled : configOn;
        if (rxOn) continue;                       // N is a delta control; no truncation
        const declared = Object.values(counts).reduce((a, b) => a + (Number(b) || 0), 0);
        const population = (typeof st.N === 'number') ? st.N : (gas.count ?? 0);
        if (declared !== population) {
            errors.push(
                `${file} ${stateId}: species_counts sum to ${declared} but the state's population is ${population} ` +
                `(${typeof st.N === 'number' ? `state N: ${st.N}` : `config gas.count: ${gas.count}`}), and this state turns the ` +
                `reaction OFF. gasSyncCount will TRUNCATE the array to ${population} on the next tick, keeping only the ` +
                `FIRST species in placement order — the rest are silently deleted. Author "N": ${declared} on this state.`,
            );
        }
    }
    return errors;
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
        let raw = '';
        try {
            raw = readFileSync(join(CHEM_DIR, file), 'utf-8');
            parsed = JSON.parse(raw);
        } catch (e) {
            failures.push(`${file}: JSON parse error — ${e instanceof Error ? e.message : String(e)}`);
            console.log(`FAIL        ${file} (parse error)`);
            continue;
        }

        const result = validateConceptJson(parsed, file);
        const indicatorErrors = indicatorBindingErrors(parsed, file);
        const dupErrors = duplicateKeyErrors(raw, file);
        const popErrors = gasPopulationErrors(parsed, file);
        const errors = [...(result.passed ? [] : result.errors), ...indicatorErrors, ...dupErrors, ...popErrors];

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
