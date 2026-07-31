/**
 * THE CALCULATOR — deterministic numeric-physics gate (PIPELINE_V2_PLAN.md §2 Phase 3).
 *
 * Drives every state of a concept headlessly, reads the HUD / probe / readout
 * values the sim actually PAINTS, and asserts them against the physics recomputed
 * from the concept's own declared variables. Three invariant classes:
 *
 *   N1  readout-matches-formula   — painted value vs the concept's own expression
 *   N2  conservation              — painted numbers vs each other (no model)
 *   N3  slider-response direction — a real drag moves the right number the right way
 *
 * Sits beside THE EYE and answers the question THE EYE cannot: THE EYE proves the
 * pixels moved; this proves the NUMBERS are right. ZERO AI cost, no vision calls,
 * no Supabase — sim HTML is assembled from source, so a stale cache row cannot
 * silently pass the gate.
 *
 * Advisory as of this build: it exits 1 on failure but is not yet wired into
 * verify.yml or the SOP. Promotion is gated on the fleet SKIP census.
 *
 * Usage:
 *   npm run numeric:calc -- <concept_id> [--no-sweeps] [--json]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { probeConcept, NotCheckableError } from '@/lib/validators/numeric/probeHarness';
import { runReadoutFormulaGate } from '@/lib/validators/numeric/gates/readoutFormula';
import { runConservationGate } from '@/lib/validators/numeric/gates/conservation';
import { runSliderResponseGate } from '@/lib/validators/numeric/gates/sliderResponse';
import { isSkip, type NumericCheckResult } from '@/lib/validators/numeric/spec';

function fail(msg: string): never {
    console.error(`\n✗ ${msg}\n`);
    process.exit(1);
}

/** Local timestamp slug, matching frameDump.ts's `.visual_runs` convention. */
function timestampSlug(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/**
 * Surface-everything rule (AUTHORING_PIPELINE.md §③): print EVERY result, pass
 * and fail. Failures carry full evidence; passes are truncated; skips are
 * grouped at the end so real results are not buried under them.
 */
function printAllChecks(results: NumericCheckResult[]): void {
    const real = results.filter((r) => !isSkip(r));
    const skips = results.filter(isSkip);

    console.log('\n  Category N — numeric physics:');
    const byState = new Map<string, NumericCheckResult[]>();
    for (const r of real) {
        const arr = byState.get(r.state_id) ?? [];
        arr.push(r);
        byState.set(r.state_id, arr);
    }
    for (const [stateId, rows] of [...byState.entries()].sort()) {
        console.log(`    ${stateId}:`);
        for (const r of rows) {
            const sym = r.passed ? '✓' : '✗';
            const evidence = r.passed && r.evidence.length > 160 ? `${r.evidence.slice(0, 160)}…` : r.evidence;
            console.log(`      ${sym} [${r.check_id}] ${evidence}`);
        }
    }
    if (real.length === 0) console.log('    (no assertable checks — see the skip census below)');

    if (skips.length > 0) {
        console.log(`\n  Skipped (${skips.length}) — nothing was asserted, and why:`);
        const byCheck = new Map<string, NumericCheckResult[]>();
        for (const s of skips) {
            const arr = byCheck.get(s.check_id) ?? [];
            arr.push(s);
            byCheck.set(s.check_id, arr);
        }
        for (const [checkId, rows] of [...byCheck.entries()].sort()) {
            console.log(`    ${checkId} — ${rows.length}`);
            for (const r of rows.slice(0, 12)) {
                console.log(`      · ${r.state_id}: ${r.evidence.replace(/^Skipped — /, '')}`);
            }
            if (rows.length > 12) console.log(`      · … and ${rows.length - 12} more (see readings.json)`);
        }
    }
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const flags = new Set(args.filter((a) => a.startsWith('--')));
    const conceptId = (args.find((a) => !a.startsWith('--')) ?? '').trim();
    if (!conceptId) fail('Usage: npm run numeric:calc -- <concept_id> [--no-sweeps] [--json]');

    const overallStart = Date.now();
    console.log(`\n🧮  THE CALCULATOR — deterministic numeric-physics gate: ${conceptId}\n`);

    let probe;
    try {
        probe = await probeConcept({ conceptId, skipSweeps: flags.has('--no-sweeps') });
    } catch (err: unknown) {
        if (err instanceof NotCheckableError) {
            // Same contract as assembleSimFromSource returning null: "not
            // checkable" is a clean exit, never a gate failure.
            console.log(`  ⊘ ${err.message}`);
            console.log(`\n📊 0 checks · not checkable · $0.00 · ${Date.now() - overallStart}ms\n`);
            process.exit(0);
        }
        throw err;
    }

    console.log(`  renderer: ${probe.rendererType} · states: ${probe.stateIds.length} `
        + `· time-pin: ${probe.pinnable ? 'yes' : 'NO (free-run readings)'} `
        + `· sliders swept: ${probe.sweeps.length}`);
    const totalReadings = probe.states.reduce((n, s) => n + s.readings.length, 0);
    console.log(`  harvested ${totalReadings} reading(s) across ${probe.states.length} state(s)`);
    for (const s of probe.states) {
        for (const w of s.warnings) console.log(`  ⚠ ${s.stateId}: ${w}`);
    }
    if (probe.consoleErrors.length > 0) {
        console.log(`  ⚠ ${probe.consoleErrors.length} console/page error(s) — first: ${probe.consoleErrors[0]}`);
    }

    const gates = [runReadoutFormulaGate(probe), runConservationGate(probe), runSliderResponseGate(probe)];
    const results = gates.flatMap((g) => g.check_results);
    printAllChecks(results);

    const failed = results.filter((r) => !r.passed);
    const skipped = results.filter(isSkip);
    const asserted = results.length - skipped.length;

    const runDir = join(process.cwd(), '.calc_runs', conceptId, timestampSlug());
    mkdirSync(runDir, { recursive: true });
    const readingsPath = join(runDir, 'readings.json');
    writeFileSync(readingsPath, JSON.stringify({
        concept_id: conceptId,
        renderer_type: probe.rendererType,
        pinnable: probe.pinnable,
        // Deliberately NOT stamped with a wall-clock time: two runs of the same
        // source must produce byte-identical files, which is the determinism proof.
        states: probe.states.map((s) => ({
            state_id: s.stateId,
            reached: s.reached,
            pinned_at_ms: s.pinnedAtMs,
            sim_time_ms: s.simTimeMs,
            warnings: s.warnings,
            sliders: s.sliders,
            readings: s.readings,
        })),
        sweeps: probe.sweeps,
        check_results: results,
    }, null, 2) + '\n', 'utf-8');

    console.log(`\n  readings: ${readingsPath}`);
    console.log(`\n📊 ${asserted} assertion(s) · ${asserted - failed.length} passed · ${failed.length} failed `
        + `· ${skipped.length} skipped · $0.00 · ${Date.now() - overallStart}ms`);
    if (failed.length > 0) {
        console.log(`\n✗ ${failed.length} numeric check(s) FAILED — every failure must be hand-confirmed `
            + `against the sim before it is believed (advisory gate).`);
    }
    console.log('');
    process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((err: unknown) => {
    console.error('\n✗ THE CALCULATOR crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
