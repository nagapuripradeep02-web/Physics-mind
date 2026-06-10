/**
 * Smoke test for the Visual Validator (Engine E29).
 *
 * Loads a cached simulation from simulation_cache and runs the full validator
 * pipeline against it: Playwright screenshot capture, vision gate (cost ladder
 * Gemini→Sonnet→Opus-flag), Category I TTS↔visual sync (when the concept JSON
 * has glow/math_show bindings), F1/F4 DOM timing, deterministic pixel +
 * regression gates, engine_bug_queue write-back.
 *
 * Usage:
 *   npx tsx --env-file=.env.local src/scripts/smoke_visual_validator.ts [concept_id] [--dense] [--dump-frames]
 *     --dense        capture ~1s frames per state and run D5/D6/D7 motion checks
 *     --dump-frames  write every captured PNG to .visual_runs/<id>/<ts>/
 *
 * Prereqs (one-time):
 *   npx playwright install chromium
 *
 * Cost: ~$0.04-0.35 per run depending on state count, panel count, and ladder
 *       behavior (clean Gemini passes are much cheaper than Sonnet escalations).
 *       Stays under the $5/concept/day cap unless you re-run repeatedly.
 *
 * Output discipline (founder rule, 2026-06-10): print EVERY check result,
 * pass AND fail — nothing summarized away, no "+N more" truncation.
 *
 * Defaults:
 *   concept_id = normal_reaction (single-panel, mechanics_2d)
 */

// MUST be the first import — guarantees .env.local values win over any empty
// system-env values that Node 24 + --env-file leaves unfilled.
import '@/lib/loadEnvLocal';
import { captureSimStates } from '@/lib/validators/visual/screenshotter';
import { runVisionGate } from '@/lib/validators/visual/visionGate';
import { runPixelGate } from '@/lib/validators/visual/pixelGate';
import { runRegressionGate } from '@/lib/validators/visual/regressionGate';
import { deriveStateIds } from '@/lib/validators/visual/deriveStateIds';
import { deriveStateDurationsMs, deriveMotionExpectations } from '@/lib/validators/visual/deriveStateMeta';
import { dumpCaptureToDisk } from '@/lib/validators/visual/frameDump';
import { extractTtsVisualBindings, buildTtsMathByState } from '@/lib/validators/visual/ttsBindings';
import type { VisionGateContext } from '@/lib/validators/visual/visionGate';
import type { CheckResult } from '@/lib/validators/visual/spec';
import { loadCachedSim, loadConceptJson, fail } from './lib/loadCachedSim';

/** Build {STATE_N: focal_primitive_id} from the concept JSON's epic_l_path. */
function extractFocalPrimitiveIds(
    conceptJson: Record<string, unknown> | null,
): Record<string, string> | undefined {
    const elp = conceptJson?.epic_l_path as { states?: Record<string, unknown> } | undefined;
    const states = elp?.states;
    if (!states || typeof states !== 'object') return undefined;
    const out: Record<string, string> = {};
    for (const [stateId, raw] of Object.entries(states)) {
        const focal = (raw as { focal_primitive_id?: unknown })?.focal_primitive_id;
        if (typeof focal === 'string' && focal.length > 0) out[stateId] = focal;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function printAllResults(results: CheckResult[]): void {
    const byCategory = new Map<string, CheckResult[]>();
    for (const r of results) {
        const arr = byCategory.get(r.category) ?? [];
        arr.push(r);
        byCategory.set(r.category, arr);
    }
    for (const [cat, rows] of [...byCategory.entries()].sort()) {
        const failures = rows.filter(r => !r.passed).length;
        console.log(`\n  Category ${cat} — ${rows.length} checks, ${failures} failed:`);
        for (const r of rows) {
            const sym = r.passed ? '✓' : '✗';
            // Failures print FULL evidence (surface-everything); passes a readable slice.
            const evidence = r.passed && r.evidence.length > 140 ? `${r.evidence.slice(0, 140)}…` : r.evidence;
            console.log(`    ${sym} [${r.check_id}] ${r.state_id}: ${evidence}`);
        }
    }
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const flags = new Set(args.filter(a => a.startsWith('--')));
    const conceptId = (args.find(a => !a.startsWith('--')) ?? 'normal_reaction').trim();
    const dense = flags.has('--dense');
    const dumpFrames = flags.has('--dump-frames');
    const overallStart = Date.now();
    // Deterministic-only mode skips the AI vision gate (~$0.04–$0.35 / run)
    // and runs only screenshot capture + pixel/regression gates + DOM timing.
    const skipVision = process.env.SKIP_VISUAL_VALIDATION === 'true';

    console.log(`\n🔍 Visual Validator smoke test — concept: ${conceptId}${skipVision ? ' (deterministic-only)' : ''}${dense ? ' +dense' : ''}\n`);

    const cached = await loadCachedSim(conceptId);
    const stateIds = deriveStateIds(cached.physics_config);
    if (stateIds.length === 0) fail('No states found in physics_config — cannot drive simulation.');

    const isMulti = cached.sim_type === 'multi_panel' && !!cached.secondary_sim_html;
    const panelCount = isMulti ? 2 : 1;
    const expectsMotion = deriveMotionExpectations(cached.physics_config);

    // Category I bindings come from the RAW concept JSON (glow / math_show are
    // not in the cached teacher_script). Absent file or no bindings → Category
    // I stays dormant, exactly like the auto-fire path.
    const conceptJson = loadConceptJson(conceptId);
    const ttsBindings = conceptJson ? extractTtsVisualBindings(conceptJson) : {};
    const boundStates = Object.keys(ttsBindings).length;
    // Per-state math_show replay sequence — drives SET_MATH during capture so
    // Category I2 sees TTS-synced formulas the headless harness would otherwise
    // never render. Only populated when bindings exist.
    const ttsMathByState = boundStates > 0 ? buildTtsMathByState(ttsBindings) : undefined;
    const i2FormulaStates = ttsMathByState ? Object.keys(ttsMathByState).length : 0;

    console.log(`  Sim type:    ${cached.sim_type ?? 'single (default)'}`);
    console.log(`  Panel count: ${panelCount}`);
    console.log(`  States:      ${stateIds.join(', ')}`);
    console.log(`  Sim HTML:    ${cached.sim_html.length} chars`);
    if (isMulti) console.log(`  Panel B:     ${cached.secondary_sim_html?.length ?? 0} chars`);
    console.log(`  Fingerprint: ${cached.fingerprint_key ?? '(none)'}`);
    console.log(`  Cat I:       ${boundStates > 0 ? `${boundStates} states with TTS bindings${i2FormulaStates > 0 ? `, ${i2FormulaStates} with math_show (I2 formula replay on)` : ''}` : 'dormant (no concept-JSON glow/math_show bindings)'}\n`);

    console.log('📸 Capturing screenshots via Playwright...');
    const captureStart = Date.now();
    const capture = await captureSimStates({
        conceptId,
        panelAHtml: cached.sim_html,
        panelBHtml: isMulti ? (cached.secondary_sim_html as string) : undefined,
        stateIds,
        dense: dense ? { intervalMs: 1000, durationMsByState: deriveStateDurationsMs(cached.physics_config) } : undefined,
        ttsMathByState,
    });
    console.log(`   ✅ ${capture.state_captures.length} state captures in ${Date.now() - captureStart}ms`);
    if (capture.warnings.length > 0) {
        console.log('   ⚠️  Capture warnings (ALL):');
        for (const w of capture.warnings) console.log(`      - ${w}`);
    }

    if (isMulti) {
        const lags = capture.timings
            .filter(t => t.panel_b_lag_ms !== undefined)
            .map(t => `${t.state_id}: ${t.panel_b_lag_ms}ms`);
        console.log(`   F1 lags: ${lags.join(', ') || 'no readings'}`);
        console.log(`   F4 relay: A→B ${capture.param_relay.a_to_b_ms ?? 'TIMEOUT'}ms, B→A ${capture.param_relay.b_to_a_ms ?? 'TIMEOUT'}ms`);
    }

    let visionResult: { valid: boolean; errors: string[]; check_results: CheckResult[]; cost_usd: number; duration_ms: number };
    if (skipVision) {
        console.log('\n⏭️  Skipping vision gate (SKIP_VISUAL_VALIDATION=true) — deterministic checks only.');
        visionResult = { valid: true, errors: [], check_results: [], cost_usd: 0, duration_ms: 0 };
    } else {
        const ladder = process.env.VISION_LADDER !== 'off' && !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        console.log(`\n🤖 Running vision gate (${ladder ? 'ladder: Gemini Flash → Sonnet 4.6' : 'direct: Sonnet 4.6'}${process.env.VISION_ESCALATION_MAX_TIER === 'opus' ? ' → Opus' : ''})...`);
        const visionStart = Date.now();
        const context: VisionGateContext = {
            physics_engine_config: cached.physics_config ?? undefined,
            teacher_script:        cached.teacher_script ?? undefined,
            tts_visual_bindings:   boundStates > 0 ? ttsBindings : undefined,
            // Storyboard (Category E) metadata lives in the concept JSON, NOT the
            // cached sim — without it E2/E3 false-fail on null anchor / empty focal.
            real_world_anchor:     conceptJson?.real_world_anchor ?? undefined,
            focal_primitive_ids:   extractFocalPrimitiveIds(conceptJson),
        };
        visionResult = await runVisionGate({
            conceptId,
            capture,
            context,
            panelCount,
            hasEpicC: false,
            hasTimingMetadata: false,
        });
        console.log(`   ✅ Vision gate finished in ${Date.now() - visionStart}ms`);
    }

    console.log('\n🎯 Running deterministic gates (pixel D1p/H1' + (dense ? '/D5/D6/D7' : '') + ' + regression H2, no API)...');
    const [pixelResult, regressionResult] = await Promise.all([
        runPixelGate({ conceptId, capture, panelCount, expectsMotion }),
        runRegressionGate({ conceptId, capture }),
    ]);
    console.log(`   ✅ Deterministic gates finished ($0)`);
    console.log(`   DOM template-leak findings: ${capture.template_leak_dom_findings.length}`);

    const allChecks: CheckResult[] = [
        ...visionResult.check_results,
        ...pixelResult.check_results,
        ...regressionResult.check_results,
    ];
    const deterministicFailures = [...pixelResult.check_results, ...regressionResult.check_results]
        .filter(r => !r.passed);
    const valid = visionResult.valid && deterministicFailures.length === 0;

    const totalChecks = allChecks.length;
    const passed = allChecks.filter(r => r.passed).length;
    const failed = totalChecks - passed;

    console.log('\n📊 Results');
    console.log('  ──────────────────────────────────────────────────────────────');
    console.log(`  Total checks:  ${totalChecks}`);
    console.log(`  Passed:        ${passed}`);
    console.log(`  Failed:        ${failed}`);
    console.log(`  Cost:          $${visionResult.cost_usd.toFixed(4)}`);
    console.log(`  Total time:    ${Date.now() - overallStart}ms`);
    console.log(`  Valid:         ${valid ? 'YES ✅' : 'NO ❌'}`);
    console.log('  ──────────────────────────────────────────────────────────────');

    // Surface-everything: EVERY check, pass and fail, full failure evidence.
    printAllResults(allChecks);

    if (dumpFrames) {
        console.log('\n💾 Dumping frames to disk (--dump-frames)...');
        const dump = dumpCaptureToDisk({ conceptId, capture });
        console.log(`   Run dir: ${dump.dir}`);
        for (const f of dump.files) console.log(f);
    }

    console.log(failed === 0 ? '\n✅ All checks passed.\n' : `\n❌ ${failed} check(s) failed — every one is listed above.\n`);
    process.exit(valid ? 0 : 1);
}

main().catch(err => {
    console.error('\n💥 Smoke test crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
