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
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { captureSimStates } from '@/lib/validators/visual/screenshotter';
import { buildContactSheets } from '@/lib/validators/visual/contactSheet';
import { runPixelGate } from '@/lib/validators/visual/pixelGate';
import { runRegressionGate } from '@/lib/validators/visual/regressionGate';
import { deriveStateIds } from '@/lib/validators/visual/deriveStateIds';
import { deriveStateDurationsMs, deriveMotionExpectations, deriveMaxRevealTimeMs, deriveHoldExpectations, describeScenario } from '@/lib/validators/visual/deriveStateMeta';
import { dumpCaptureToDisk } from '@/lib/validators/visual/frameDump';
import { extractTtsVisualBindings, buildTtsMathByState } from '@/lib/validators/visual/ttsBindings';
import type { CheckResult } from '@/lib/validators/visual/spec';
import { tally, tallyLine, skipBreakdown, motionGateBlackout, verdictLine } from '@/lib/validators/visual/skipReport';
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
            // ⊘ (never ran) is deliberately NOT ✓ — a skip that renders as a tick
            // is how a concept with no motion coverage reads as verified.
            const sym = r.skipped === true ? '⊘' : r.passed ? '✓' : '✗';
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

    // Loaded BEFORE the motion derivation below — see the comment there. (It is
    // also the TTS math_show source further down; one load serves both.)
    const conceptJson = loadConceptJson(conceptId);

    // D5's motion expectations read `conceptJson ?? cached.physics_config`, the
    // SAME source as the reveal/hold derivations below — and the reason is a
    // measured one, not symmetry for its own sake.
    //
    // SCAR (2026-08-09, lines_and_planes_in_space bring-up; the mechanism behind
    // the OPEN row eye_gate_skipped_for_an_unregistered_scenario_is_counted_as_a_pass):
    // this read `cached.physics_config` alone. A SUBJECT-NAMESPACE concept
    // (chemistry / mathematics) is HAND-SEEDED into simulation_cache, and its
    // seeded physics_config carries only `epic_l_path` — no field_3d_config and
    // no states. So resolveField3dStates() returned null, deriveMotionExpectations
    // returned {}, every state's expectation was `undefined`, and D5 emitted
    // "Skipped — motion expectation unknown" on EVERY state while visual_eyes
    // aggregated those skips into the headline pass count. Measured on the first
    // run of lines_and_planes_in_space: "39 checks · 39 passed · 0 failed" where
    // NINE were skips (8x D5 + H2) and the motion gate had never executed once.
    //
    // This is why registering `vg` in deriveMotionExpectations did not make D5
    // run on vector_products_in_space either: the registration was never
    // reachable, because the config handed to it does not contain the states the
    // resolver looks for. A gate fed the wrong source cannot be fixed by teaching
    // it about a new scenario.
    const expectsMotion = deriveMotionExpectations(conceptJson ?? cached.physics_config);
    const ttsBindings = conceptJson ? extractTtsVisualBindings(conceptJson) : {};
    const ttsMathByState = Object.keys(ttsBindings).length > 0 ? buildTtsMathByState(ttsBindings) : undefined;
    const i2FormulaStates = ttsMathByState ? Object.keys(ttsMathByState).length : 0;

    // Sim-time-aware capture targets. The concept JSON is authoritative for
    // field_3d reveal timings (field_3d_config.states); fall back to the cached
    // physics_config when the JSON is unavailable.
    const revealSource = conceptJson ?? cached.physics_config;
    const maxRevealMsByState = deriveMaxRevealTimeMs(revealSource);
    const holdExpectations = deriveHoldExpectations(revealSource);

    // EMERGENT-PHYSICS CAPTURE TIME (2026-07-29). Reveal timings are derived from
    // discrete cues, and a scenario whose content EMERGES from the physics has
    // none — so the derived target is null and the renderer's 1500ms default is
    // used. On dynamic_equilibrium that meant the frozen H2 baselines of states
    // with genuinely different physics (reverse switched off vs both directions
    // live) came out near-identical, because at 1.5s none of the content exists
    // yet. A baseline photographed before the concept happens cannot catch a
    // regression in the concept.
    //
    // Opt-in per state, never a default: a state authors eye_capture_ms at a time
    // when its claim is actually on screen. Concepts that author nothing keep the
    // exact behaviour they were baselined under — which is why every approved
    // baseline in the fleet is untouched by this.
    const eyeOverrides = extractEyeCaptureMs(conceptJson);
    const overriddenStates = Object.keys(eyeOverrides);
    for (const sid of overriddenStates) maxRevealMsByState[sid] = eyeOverrides[sid];
    if (overriddenStates.length > 0) {
        console.log('  Eye capture: authored eye_capture_ms on ' + overriddenStates.length + ' state(s) — ' +
            overriddenStates.map(s => s + '=' + eyeOverrides[s] + 'ms').join(', '));
    }

    console.log(`  Sim type:    ${cached.sim_type ?? 'single (default)'}`);
    console.log(`  States:      ${stateIds.join(', ')}`);
    console.log(`  Scenario:    ${describeScenario(conceptJson ?? cached.physics_config)}`);
    console.log(`  Motion map:  ${stateIds.map(s => `${s}=${expectsMotion[s] ?? '?'}`).join(', ')}`);
    console.log(`  Reveal map:  ${stateIds.map(s => `${s}=${maxRevealMsByState[s] ?? '?'}ms${holdExpectations[s] ? `(${holdExpectations[s]})` : ''}`).join(', ')}`);
    if (i2FormulaStates > 0) console.log(`  I2 formulas: replaying math_show in ${i2FormulaStates} states (equation-panel frames dumped)`);

    // A partitioned state's non-default views are captured as EXTRA entries keyed
    // `<STATE>@<group>` (bug_class every_visual_gate_captures_only_the_default_
    // scene_group...). Every per-state map the gates read is keyed by state id, so
    // each synthetic id inherits its base state's expectations — a view is the same
    // state seen from a different picker position, not a different state.
    const sceneGroupsByState = extractSceneGroups(conceptJson);
    const extraSceneGroupsByState: Record<string, string[]> = {};
    for (const [sid, g] of Object.entries(sceneGroupsByState)) {
        if (g.extra.length === 0) continue;
        extraSceneGroupsByState[sid] = g.extra;
        for (const grp of g.extra) {
            const synth = `${sid}@${grp}`;
            if (expectsMotion[sid] !== undefined) expectsMotion[synth] = expectsMotion[sid];
            if (holdExpectations[sid] !== undefined) holdExpectations[synth] = holdExpectations[sid];
            if (maxRevealMsByState[sid] !== undefined) maxRevealMsByState[synth] = maxRevealMsByState[sid];
            if (durationMsByState[sid] !== undefined) durationMsByState[synth] = durationMsByState[sid];
        }
    }
    const extraViewCount = Object.values(extraSceneGroupsByState).reduce((k, v) => k + v.length, 0);
    if (extraViewCount > 0) {
        console.log(`  Scene groups: ${Object.entries(sceneGroupsByState)
            .map(([sid, g]) => `${sid}[${g.all.join('|')}] default=${g.dflt}`).join(', ')}`);
        console.log(`                capturing ${extraViewCount} non-default view(s) as <STATE>@<group>`);
    }

    console.log('\n📸 Capturing every state + dense frames (this takes 1–3 min)...');
    const captureStart = Date.now();
    const capture = await captureSimStates({
        conceptId,
        panelAHtml: cached.sim_html,
        panelBHtml: isMulti ? (cached.secondary_sim_html as string) : undefined,
        stateIds,
        // intervalMs deliberately NOT set here — it must stay incommensurate with
        // the drive periods sims animate at, and that constraint (with the
        // measurement behind it) lives on DENSE_DEFAULT_INTERVAL_MS in
        // screenshotter.ts. Hardcoding 1000 here silently overrode that default
        // and phase-locked the sampler to every f_demo=0.5Hz state in Ch.7.
        dense: { durationMsByState },
        ttsMathByState,
        // Sim-time-aware primary capture — pin+poll PM_simTimeMs to each state's
        // all-reveals-complete time so late reveals are photographed (headless
        // rAF throttling lags field_3d's frame-count clock → false negatives).
        maxRevealMsByState,
        // Deterministic pinned frame per state at its reveal-complete time — the
        // H2 frozen-baseline source (was a fixed 1500ms, which missed late reveals).
        frozenFrame: { atMsByState: maxRevealMsByState },
        extraSceneGroupsByState,
    });
    const denseFrameCount = (capture.dense_timeseries ?? []).reduce((n, s) => n + s.frames_b64.length, 0);
    console.log(`   ✅ ${capture.state_captures.length} states + ${denseFrameCount} dense frames in ${Date.now() - captureStart}ms`);
    if (capture.warnings.length > 0) {
        console.log('   ⚠️  Capture warnings (ALL):');
        for (const w of capture.warnings) console.log(`      - ${w}`);
    }

    console.log('\n🎯 Running deterministic gates (pixel + dense motion + regression — $0)...');
    const [pixelResult, regressionResult] = await Promise.all([
        runPixelGate({ conceptId, capture, panelCount: isMulti ? 2 : 1, expectsMotion, holdExpectations }),
        runRegressionGate({ conceptId, capture, expectsMotion }),
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
    const dump = dumpCaptureToDisk({ conceptId, capture, checks: allResults });
    console.log(`   Run dir:  ${dump.dir}`);
    console.log(`   Manifest: ${dump.manifestPath}`);

    // Contact sheets — one grid PNG per state (static + dense + I2 + frozen).
    // Reading 8 sheets replaces reading ~90 individual frames.
    const sheetPaths: string[] = [];
    try {
        const sheets = await buildContactSheets(capture);
        for (const sheet of sheets) {
            const p = join(dump.dir, `${sheet.state_id}__contact_sheet.png`);
            writeFileSync(p, sheet.png);
            sheetPaths.push(p);
        }
    } catch (err) {
        console.log(`   ⚠️  Contact-sheet build failed (individual frames below still valid): ${err instanceof Error ? err.message : String(err)}`);
    }

    if (sheetPaths.length > 0) {
        console.log(`\n👁  CONTACT SHEETS — Read these FIRST (one grid per state; drill into individual frames only where a cell looks wrong):\n`);
        for (const p of sheetPaths) console.log(p);
    }

    console.log(`\n👁  Individual frames (drill-down — every file the sheets were built from):\n`);
    for (const f of dump.files) console.log(f);

    // Skips are counted SEPARATELY from passes — a check that never ran is not
    // evidence, and reporting it as a pass is a measured defect (skipReport.ts).
    const t = tally(allResults);
    console.log(`\n📊 ${tallyLine(t)} · $0.00 · ${Date.now() - overallStart}ms`);
    const breakdown = skipBreakdown(allResults);
    if (breakdown.length > 0) {
        console.log(`\n⊘ GATE COVERAGE — ${t.skipped} check(s) never executed (a skip is NOT evidence):`);
        for (const line of breakdown) console.log(line);
    }
    // ── VIEW COVERAGE — a state can be more than one sandbox ──────────────
    //   A field_3d state may partition its scene into scene_groups a teacher
    //   switches with the in-sim picker. This run captures EVERY declared view:
    //   the authored default under its ordinary id, and each other view under
    //   `<STATE>@<group>` — dense series, motion gates and frozen frame alike.
    //
    //   Before this existed the walk saw only the default, and the other view was
    //   captured by nothing and gated by nothing (bug_class every_visual_gate_
    //   captures_only_the_default_scene_group_so_a_partitioned_explore_states_
    //   other_view_is_ungated). On lines_and_planes_in_space the unvisited view
    //   was a STILL PICTURE for its entire life and survived three Checkpoint-B
    //   cycles; the CRITICAL introduced by the fix for that freeze then shipped
    //   through the same hole.
    //
    //   A view the sim could not switch to is reported as NOT captured rather
    //   than quietly counted — the capture warns, and this block names it.
    const partitioned = Object.keys(sceneGroupsByState);
    if (partitioned.length > 0) {
        const capturedIds = new Set(capture.state_captures.map(c => c.state_id));
        console.log(`\n👁  VIEW COVERAGE — ${partitioned.length} state(s) declare more than one scene_group:`);
        for (const sid of partitioned) {
            const g = sceneGroupsByState[sid];
            const missing = g.extra.filter(k => !capturedIds.has(`${sid}@${k}`));
            const got = g.extra.filter(k => capturedIds.has(`${sid}@${k}`));
            console.log(`  ${missing.length === 0 ? '✓' : '⊘'} ${sid}: views [${g.all.join(', ')}] — ` +
                `default ${g.dflt} captured as ${sid}` +
                (got.length ? `, ${got.map(k => `${k} as ${sid}@${k}`).join(', ')}` : '') +
                (missing.length ? ` — NOT CAPTURED: ${missing.join(', ')}` : ''));
        }
        console.log('  Each non-default view is a NEW baseline id — H2 skips it until');
        console.log('  `npm run visual:approve` is run, which is honest, not a gap.');
    }

    const blackout = motionGateBlackout(allResults, describeScenario(conceptJson ?? cached.physics_config));
    if (blackout) console.log(`\n${blackout}`);
    console.log(verdictLine(t, '✅ Deterministic gates clean. Now Read the frames — the eye is the gate the machine cannot replace.\n'));

    // Exit 3 = motion-gate blackout: no failure, but D5 never ran on any state
    // (unregistered scenario). Machine consumers must not read that as green.
    process.exit(t.failed > 0 ? 1 : blackout ? 3 : 0);
}

main().catch(err => {
    console.error('\n💥 visual:eyes crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});

/**
 * States that partition their scene into more than one `scene_groups` view.
 *
 * Returns { STATE_ID: [group, ...] } for states with 2+ declared groups only —
 * a single-group (or group-less) state is not partitioned and is fully covered
 * by the ordinary capture, so it is deliberately absent from the result.
 */
function extractSceneGroups(conceptJson: unknown): Record<string, { all: string[]; dflt: string; extra: string[] }> {
    const out: Record<string, { all: string[]; dflt: string; extra: string[] }> = {};
    const cfg = (conceptJson as { field_3d_config?: { states?: Record<string, unknown> } } | null | undefined)
        ?.field_3d_config?.states;
    if (!cfg || typeof cfg !== 'object') return out;
    for (const [sid, st] of Object.entries(cfg)) {
        const vg = (st as { vg?: { scene_groups?: unknown; scene_group?: unknown } } | null)?.vg;
        const g = vg?.scene_groups;
        if (Array.isArray(g) && g.length > 1) {
            // Authored as [{ key, label }] on field_3d (a bare string is tolerated
            // for any other shape). `key` is what the picker's <option> value is,
            // so it is what founder_drive selects on — report the same token.
            const all = g.map(x => {
                if (typeof x === 'string') return x;
                const o = x as { key?: string; id?: string; label?: string };
                return o?.key ?? o?.id ?? o?.label ?? JSON.stringify(x);
            });
            // The renderer seeds PM_vgSceneGroup from the state's authored
            // `vg.scene_group`, falling back to the FIRST declared group — so
            // that one is what the ordinary walk already captured, and only the
            // others need an extra pass.
            const authored = typeof vg?.scene_group === 'string' && vg.scene_group !== '' ? vg.scene_group : null;
            const dflt = authored && all.includes(authored) ? authored : all[0];
            out[sid] = { all, dflt, extra: all.filter(k => k !== dflt) };
        }
    }
    return out;
}

/**
 * Per-state `eye_capture_ms` authored on a scenario config (or on epic_l_path).
 * Opt-in override for the frozen-baseline capture time — see the call site for
 * why an emergent-physics scenario needs one.
 */
function extractEyeCaptureMs(conceptJson: unknown): Record<string, number> {
    const out: Record<string, number> = {};
    if (!conceptJson || typeof conceptJson !== 'object') return out;
    const j = conceptJson as Record<string, unknown>;
    const buckets = ['particle_field_config', 'field_3d_config', 'parametric_config', 'epic_l_path'];
    for (const bucket of buckets) {
        const cfg = j[bucket] as { states?: Record<string, { eye_capture_ms?: unknown }> } | undefined;
        const states = cfg?.states;
        if (!states || typeof states !== 'object') continue;
        for (const sid of Object.keys(states)) {
            const v = states[sid]?.eye_capture_ms;
            if (typeof v === 'number' && v > 0) out[sid] = v;
        }
    }
    return out;
}
