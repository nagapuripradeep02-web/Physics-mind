/**
 * THE EYE — deterministic visual inspection run (AUTHORING_PIPELINE.md §3).
 *
 * Captures EVERY state of a cached simulation (static render + dense ~1s
 * frames), runs ALL deterministic gates (D1p/H1 pixel, D5/D6/D7 dense motion,
 * H2 regression baseline), dumps every PNG to .visual_runs/<id>/<timestamp>/,
 * and prints:
 *   - EVERY check result, pass AND fail — nothing summarized away
 *   - the per-state adjacent-frame diff table
 *   - the absolute path of every frame, one per line, so Claude can Read each
 *     one and actually LOOK before presenting to the founder
 *
 * ZERO AI cost — no vision calls. For the vision categories run
 * `npm run smoke:visual-validator -- <concept_id> [--dense]`.
 *
 * Usage:
 *   npm run visual:eyes -- <concept_id>
 */

// MUST be the first import — guarantees .env.local values win over any empty
// system-env values that Node 24 + --env-file leaves unfilled.
import '@/lib/loadEnvLocal';
import { captureSimStates } from '@/lib/validators/visual/screenshotter';
import { runPixelGate } from '@/lib/validators/visual/pixelGate';
import { runRegressionGate } from '@/lib/validators/visual/regressionGate';
import { deriveStateIds } from '@/lib/validators/visual/deriveStateIds';
import { deriveStateDurationsMs, deriveMotionExpectations } from '@/lib/validators/visual/deriveStateMeta';
import { dumpCaptureToDisk } from '@/lib/validators/visual/frameDump';
import { extractTtsVisualBindings, buildTtsMathByState } from '@/lib/validators/visual/ttsBindings';
import type { CheckResult } from '@/lib/validators/visual/spec';
import { loadCachedSim, loadConceptJson, fail } from './lib/loadCachedSim';

function printAllChecks(label: string, results: CheckResult[]): void {
    console.log(`\n${label}`);
    const byCategory = new Map<string, CheckResult[]>();
    for (const r of results) {
        const arr = byCategory.get(r.category) ?? [];
        arr.push(r);
        byCategory.set(r.category, arr);
    }
    for (const [cat, rows] of [...byCategory.entries()].sort()) {
        console.log(`  Category ${cat}:`);
        for (const r of rows) {
            const sym = r.passed ? '✓' : '✗';
            // Surface-everything rule: failures print FULL evidence; passes a readable slice.
            const evidence = r.passed && r.evidence.length > 140 ? `${r.evidence.slice(0, 140)}…` : r.evidence;
            console.log(`    ${sym} [${r.check_id}] ${r.state_id}: ${evidence}`);
        }
    }
}

async function main(): Promise<void> {
    const conceptId = (process.argv[2] ?? '').trim();
    if (!conceptId) fail('Usage: npm run visual:eyes -- <concept_id>');
    const overallStart = Date.now();

    console.log(`\n👁  THE EYE — deterministic visual inspection: ${conceptId}\n`);

    const cached = await loadCachedSim(conceptId);
    const stateIds = deriveStateIds(cached.physics_config);
    if (stateIds.length === 0) fail('No states found in physics_config — cannot drive simulation.');

    const isMulti = cached.sim_type === 'multi_panel' && !!cached.secondary_sim_html;
    const durationMsByState = deriveStateDurationsMs(cached.physics_config);
    const expectsMotion = deriveMotionExpectations(cached.physics_config);

    // TTS math_show replay — drives SET_MATH so the equation panel renders in
    // dedicated I2 frames (the headless capture never plays TTS). $0 — these are
    // just extra screenshots dumped to disk so the founder/Claude can confirm
    // every formula actually renders before paying for the vision smoke.
    const conceptJson = loadConceptJson(conceptId);
    const ttsBindings = conceptJson ? extractTtsVisualBindings(conceptJson) : {};
    const ttsMathByState = Object.keys(ttsBindings).length > 0 ? buildTtsMathByState(ttsBindings) : undefined;
    const i2FormulaStates = ttsMathByState ? Object.keys(ttsMathByState).length : 0;

    console.log(`  Sim type:    ${cached.sim_type ?? 'single (default)'}`);
    console.log(`  States:      ${stateIds.join(', ')}`);
    console.log(`  Motion map:  ${stateIds.map(s => `${s}=${expectsMotion[s] ?? '?'}`).join(', ')}`);
    if (i2FormulaStates > 0) console.log(`  I2 formulas: replaying math_show in ${i2FormulaStates} states (equation-panel frames dumped)`);

    console.log('\n📸 Capturing every state + dense ~1s frames (this takes 1–3 min)...');
    const captureStart = Date.now();
    const capture = await captureSimStates({
        conceptId,
        panelAHtml: cached.sim_html,
        panelBHtml: isMulti ? (cached.secondary_sim_html as string) : undefined,
        stateIds,
        dense: { intervalMs: 1000, durationMsByState },
        ttsMathByState,
    });
    const denseFrameCount = (capture.dense_timeseries ?? []).reduce((n, s) => n + s.frames_b64.length, 0);
    console.log(`   ✅ ${capture.state_captures.length} states + ${denseFrameCount} dense frames in ${Date.now() - captureStart}ms`);
    if (capture.warnings.length > 0) {
        console.log('   ⚠️  Capture warnings (ALL):');
        for (const w of capture.warnings) console.log(`      - ${w}`);
    }

    console.log('\n🎯 Running deterministic gates (pixel + dense motion + regression — $0)...');
    const [pixelResult, regressionResult] = await Promise.all([
        runPixelGate({ conceptId, capture, panelCount: isMulti ? 2 : 1, expectsMotion }),
        runRegressionGate({ conceptId, capture }),
    ]);

    const allResults = [...pixelResult.check_results, ...regressionResult.check_results];
    printAllChecks('📋 EVERY check result (surface-everything — nothing hidden):', allResults);

    // Per-state dense diff table lives inside D6 evidence; also give a compact view.
    const denseStates = capture.dense_timeseries ?? [];
    if (denseStates.length > 0) {
        console.log('\n📈 Dense-series frame counts:');
        for (const s of denseStates) {
            console.log(`  ${s.state_id}: ${s.frames_b64.length} frames over ${s.capture_times_ms[s.capture_times_ms.length - 1] ?? 0}ms`);
        }
    }

    console.log('\n💾 Dumping frames to disk...');
    const dump = dumpCaptureToDisk({ conceptId, capture });
    console.log(`   Run dir:  ${dump.dir}`);
    console.log(`   Manifest: ${dump.manifestPath}`);

    console.log(`\n👁  LOOK AT THESE — Read every file below before presenting to the founder:\n`);
    for (const f of dump.files) console.log(f);

    const failed = allResults.filter(r => !r.passed).length;
    console.log(`\n📊 ${allResults.length} deterministic checks · ${allResults.length - failed} passed · ${failed} failed · $0.00 · ${Date.now() - overallStart}ms`);
    console.log(failed === 0
        ? '✅ Deterministic gates clean. Now Read the frames — the eye is the gate the machine cannot replace.\n'
        : '❌ Deterministic failures above — fix before any founder review.\n');

    process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => {
    console.error('\n💥 visual:eyes crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
