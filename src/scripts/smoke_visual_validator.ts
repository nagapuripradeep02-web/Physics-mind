/**
 * Smoke test for the Visual Validator (Engine E29).
 *
 * Loads a cached simulation from simulation_cache and runs the full validator
 * pipeline against it: Playwright screenshot capture, 7-category vision gate,
 * F1/F4 DOM timing, engine_bug_queue write-back.
 *
 * Usage:
 *   npx tsx --env-file=.env.local src/scripts/smoke_visual_validator.ts [concept_id]
 *
 * Prereqs (one-time):
 *   npx playwright install chromium
 *
 * Cost: ~$0.04-0.30 per run depending on state count and panel count.
 *       Stays under the $5/concept/day cap unless you re-run repeatedly.
 *
 * Defaults:
 *   concept_id = normal_reaction (single-panel, mechanics_2d)
 */

// MUST be the first import — guarantees .env.local values win over any empty
// system-env values that Node 24 + --env-file leaves unfilled.
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { captureSimStates } from '@/lib/validators/visual/screenshotter';
import { runVisionGate } from '@/lib/validators/visual/visionGate';
import { runPixelGate } from '@/lib/validators/visual/pixelGate';
import { deriveStateIds } from '@/lib/validators/visual/deriveStateIds';
import type { VisionGateContext } from '@/lib/validators/visual/visionGate';

interface CacheRow {
    sim_html: string;
    secondary_sim_html: string | null;
    physics_config: Record<string, unknown> | null;
    teacher_script: unknown;
    sim_type: string | null;
    fingerprint_key: string | null;
}

function fail(message: string, exitCode = 1): never {
    console.error(`\n❌ ${message}\n`);
    process.exit(exitCode);
}

// deriveStateIds extracted to '@/lib/validators/visual/deriveStateIds'

async function loadCachedSim(conceptId: string): Promise<CacheRow> {
    const { data, error } = await supabaseAdmin
        .from('simulation_cache')
        .select('sim_html, secondary_sim_html, physics_config, teacher_script, sim_type, fingerprint_key')
        .eq('concept_key', conceptId)
        .order('served_count', { ascending: false })
        .limit(1)
        .maybeSingle<CacheRow>();
    if (error) fail(`simulation_cache query failed: ${error.message}`);
    if (!data) fail(`No cached simulation found for concept_id="${conceptId}". Run /api/generate-simulation against this concept first.`);
    if (!data.sim_html) fail(`Cached row exists but sim_html is empty for "${conceptId}".`);
    return data;
}

async function main(): Promise<void> {
    const conceptId = (process.argv[2] ?? 'normal_reaction').trim();
    const overallStart = Date.now();
    // Deterministic-only mode skips the AI vision gate (~$0.04–$0.30 / run)
    // and runs only screenshot capture + pixel gate + DOM timing. Used by
    // `npm run validate:concepts -- --with-smoke <id>` and any post-cache-
    // regen hook that needs a cheap visual sanity check.
    const skipVision = process.env.SKIP_VISUAL_VALIDATION === 'true';

    console.log(`\n🔍 Visual Validator smoke test — concept: ${conceptId}${skipVision ? ' (deterministic-only)' : ''}\n`);

    const cached = await loadCachedSim(conceptId);
    const stateIds = deriveStateIds(cached.physics_config);
    if (stateIds.length === 0) fail('No states found in physics_config — cannot drive simulation.');

    const isMulti = cached.sim_type === 'multi_panel' && !!cached.secondary_sim_html;
    const panelCount = isMulti ? 2 : 1;

    console.log(`  Sim type:    ${cached.sim_type ?? 'single (default)'}`);
    console.log(`  Panel count: ${panelCount}`);
    console.log(`  States:      ${stateIds.join(', ')}`);
    console.log(`  Sim HTML:    ${cached.sim_html.length} chars`);
    if (isMulti) console.log(`  Panel B:     ${cached.secondary_sim_html?.length ?? 0} chars`);
    console.log(`  Fingerprint: ${cached.fingerprint_key ?? '(none)'}\n`);

    console.log('📸 Capturing screenshots via Playwright...');
    const captureStart = Date.now();
    const capture = await captureSimStates({
        conceptId,
        panelAHtml: cached.sim_html,
        panelBHtml: isMulti ? (cached.secondary_sim_html as string) : undefined,
        stateIds,
    });
    console.log(`   ✅ ${capture.state_captures.length} state captures in ${Date.now() - captureStart}ms`);
    if (capture.warnings.length > 0) {
        console.log(`   ⚠️  Capture warnings:`);
        for (const w of capture.warnings) console.log(`      - ${w}`);
    }

    if (isMulti) {
        const lags = capture.timings
            .filter(t => t.panel_b_lag_ms !== undefined)
            .map(t => `${t.state_id}: ${t.panel_b_lag_ms}ms`);
        console.log(`   F1 lags: ${lags.join(', ') || 'no readings'}`);
        console.log(`   F4 relay: A→B ${capture.param_relay.a_to_b_ms ?? 'TIMEOUT'}ms, B→A ${capture.param_relay.b_to_a_ms ?? 'TIMEOUT'}ms`);
    }

    let visionResult: { valid: boolean; errors: string[]; check_results: Array<{ check_id: string; state_id: string; passed: boolean; evidence: string; category: string }>; cost_usd: number; duration_ms: number };
    if (skipVision) {
        console.log('\n⏭️  Skipping vision gate (SKIP_VISUAL_VALIDATION=true) — deterministic checks only.');
        visionResult = { valid: true, errors: [], check_results: [], cost_usd: 0, duration_ms: 0 };
    } else {
        console.log('\n🤖 Running vision gate (Claude Sonnet 4.6 × ~7 categories)...');
        const visionStart = Date.now();
        const context: VisionGateContext = {
            physics_engine_config: cached.physics_config ?? undefined,
            teacher_script:        cached.teacher_script ?? undefined,
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

    console.log('\n🎯 Running pixel gate (deterministic D1p + H1, no API)...');
    const pixelStart = Date.now();
    const pixelResult = await runPixelGate({ conceptId, capture, panelCount });
    console.log(`   ✅ Pixel gate finished in ${Date.now() - pixelStart}ms (cost: $${pixelResult.cost_usd.toFixed(4)})`);
    console.log(`   DOM template-leak findings: ${capture.template_leak_dom_findings.length}`);
    for (const r of pixelResult.check_results) {
        const sym = r.passed ? '✓' : '✗';
        console.log(`   ${sym} [${r.check_id}] ${r.state_id}: ${r.evidence.slice(0, 100)}${r.evidence.length > 100 ? '…' : ''}`);
    }

    // Merge vision + pixel results into combined VisualValidationResult shape
    const result = {
        valid: visionResult.valid && pixelResult.check_results.every(r => r.passed),
        errors: [...visionResult.errors, ...pixelResult.check_results.filter(r => !r.passed).map(r => `[${r.check_id}] ${r.state_id}: ${r.evidence}`)],
        check_results: [...visionResult.check_results, ...pixelResult.check_results],
        cost_usd: visionResult.cost_usd, // pixel cost is always 0
        duration_ms: Math.max(visionResult.duration_ms, pixelResult.duration_ms),
    };

    const totalChecks = result.check_results.length;
    const passed = result.check_results.filter(r => r.passed).length;
    const failed = totalChecks - passed;

    console.log('\n📊 Results');
    console.log('  ──────────────────────────────────────────────────────────────');
    console.log(`  Total checks:  ${totalChecks}`);
    console.log(`  Passed:        ${passed}`);
    console.log(`  Failed:        ${failed}`);
    console.log(`  Cost:          $${result.cost_usd.toFixed(4)}`);
    console.log(`  Total time:    ${Date.now() - overallStart}ms`);
    console.log(`  Valid:         ${result.valid ? 'YES ✅' : 'NO ❌'}`);
    console.log('  ──────────────────────────────────────────────────────────────\n');

    // Group failures by category
    if (failed > 0) {
        console.log('❌ Failed checks:\n');
        const byCategory = new Map<string, typeof result.check_results>();
        for (const r of result.check_results) {
            if (r.passed) continue;
            const arr = byCategory.get(r.category) ?? [];
            arr.push(r);
            byCategory.set(r.category, arr);
        }
        for (const [cat, rows] of byCategory.entries()) {
            console.log(`  Category ${cat} (${rows.length} failure${rows.length === 1 ? '' : 's'}):`);
            for (const r of rows.slice(0, 5)) {
                console.log(`    [${r.check_id}] ${r.state_id}: ${r.evidence.slice(0, 140)}${r.evidence.length > 140 ? '…' : ''}`);
            }
            if (rows.length > 5) console.log(`    … and ${rows.length - 5} more`);
            console.log('');
        }
    } else {
        console.log('✅ All checks passed.\n');
    }

    process.exit(result.valid ? 0 : 1);
}

main().catch(err => {
    console.error('\n💥 Smoke test crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
