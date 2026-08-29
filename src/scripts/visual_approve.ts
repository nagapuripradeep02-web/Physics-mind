/**
 * visual:approve — promote the newest .visual_runs capture of a concept to
 * its APPROVED regression baseline (H2 VISUAL_REGRESSION gate).
 *
 * Copies each <STATE_N>__panel_a.png from the newest run into
 * visual_baselines/<concept_id>/<STATE_N>.png (downscaled to width 640,
 * ~50–100 KB each — git-tracked) and writes baselines.json.
 *
 * Animated states (declared motion) default to compare:false — their
 * continuous animation makes instant-capture diffs flaky. The baseline PNG is
 * still stored for human reference; flip compare to true in baselines.json
 * with a looser per-concept tolerance if you want them auto-checked.
 *
 * Usage:
 *   npm run visual:approve -- <concept_id> [runDir]
 *     runDir optional — defaults to the newest .visual_runs/<concept_id>/<ts>/
 */

// MUST be the first import.
import '@/lib/loadEnvLocal';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import {
    BASELINE_NORMALIZED_WIDTH,
    REGRESSION_DEFAULT_TOLERANCE,
    type BaselineManifest,
} from '@/lib/validators/visual/regressionGate';
import { deriveMotionExpectations } from '@/lib/validators/visual/deriveStateMeta';
import { loadCachedSim, loadConceptJson, fail } from './lib/loadCachedSim';

function newestRunDir(conceptId: string): string | null {
    const root = join(process.cwd(), '.visual_runs', conceptId);
    if (!existsSync(root)) return null;
    const runs = readdirSync(root, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .sort();
    return runs.length > 0 ? join(root, runs[runs.length - 1]) : null;
}

async function main(): Promise<void> {
    const conceptId = (process.argv[2] ?? '').trim();
    if (!conceptId) fail('Usage: npm run visual:approve -- <concept_id> [runDir]');

    const runDir = (process.argv[3] ?? '').trim() || newestRunDir(conceptId);
    if (!runDir || !existsSync(runDir)) {
        fail(`No capture run found for "${conceptId}". Run npm run visual:eyes -- ${conceptId} first.`);
    }

    console.log(`\n📐 Approving visual baselines for ${conceptId}`);
    console.log(`   Source run: ${runDir}\n`);

    // Motion expectations decide the compare default per state — so they must be
    // read from the CONCEPT JSON, exactly as THE EYE reads them.
    //
    // SCAR (2026-08-13): this read `cached.physics_config` alone, the third copy of
    // the wrong-source bug fixed in visual_eyes.ts on 2026-08-09 (engine_bug_queue:
    // eye_gate_skipped_for_an_unregistered_scenario_is_counted_as_a_pass). A
    // hand-seeded concept's cached physics_config carries only epic_l_path — no
    // field_3d_config, no states — so resolveField3dStates() returned null, the map
    // came back EMPTY, and every state was approved as `compare: true` including
    // states that visibly animate. This is the worse half of the bug: THE EYE merely
    // fails to check, but this WRITES a baseline that cannot reproduce, and the
    // resulting H2 noise then teaches everyone to re-approve without looking.
    const cached = await loadCachedSim(conceptId);
    const conceptJson = loadConceptJson(conceptId);
    const expectsMotion = deriveMotionExpectations(conceptJson ?? cached.physics_config);

    /**
     * The concept-JSON state id a captured id belongs to.
     *
     * A non-default scene_group is captured under the synthetic id
     * `<STATE>@<group>` (ExtraSceneGroups, screenshotter.ts). It is the SAME state
     * seen from a different picker position, so it inherits that state's motion
     * expectation. deriveMotionExpectations only knows ids that literally appear in
     * the concept JSON, so without this every extra view is approved as UNKNOWN and
     * therefore compare:true — and an animated view live-compared frame-to-frame is
     * precisely the flakiness compare:false exists to prevent. It would go red on
     * the next honest run and be read as a regression.
     */
    const baseStateId = (capturedId: string): string => capturedId.split('@')[0];
    const unknownStates: string[] = [];

    const statePngs = readdirSync(runDir)
        .filter(f => f.endsWith('__panel_a.png'))
        .sort();
    if (statePngs.length === 0) fail(`Run dir has no <STATE>__panel_a.png files: ${runDir}`);

    const baselineDir = join(process.cwd(), 'visual_baselines', conceptId);
    mkdirSync(baselineDir, { recursive: true });

    // REFUSE to approve a run that would silently STRIP frozen coverage.
    //
    // The prune pass below owns this directory, so a state that has no frozen frame
    // in the source run loses its approved <STATE>__frozen.png — and the frozen
    // frame is the ONLY deterministic H2 guard an animated state has. Since
    // 2026-08-13 the harness legitimately DROPS a frozen frame whose sim-time pin
    // was never reached (a mid-reveal frame is not a baseline), which means a run
    // captured on a loaded machine can arrive here one frozen frame short. Approving
    // it would delete real coverage and report success — the exact invisible-loss
    // shape as the orphan-PNG bug the prune pass exists to fix, but in the direction
    // no one checks. Explicit opt-out only, and it prints what would be lost.
    const priorManifestPath = join(baselineDir, 'baselines.json');
    if (existsSync(priorManifestPath) && !process.argv.includes('--allow-frozen-loss')) {
        try {
            const prior = JSON.parse(readFileSync(priorManifestPath, 'utf-8')) as BaselineManifest;
            const losing = Object.entries(prior.states ?? {})
                .filter(([sid, meta]) => meta?.compare_frozen === true && !existsSync(join(runDir, `${sid}__frozen.png`)))
                .map(([sid]) => sid);
            if (losing.length > 0) {
                fail(
                    `REFUSING to approve: ${losing.length} state(s) currently have an approved FROZEN baseline that this `
                    + `run cannot replace — ${losing.join(', ')}.\n`
                    + `   The frozen frame is the only deterministic H2 guard an animated state has, and approving would\n`
                    + `   delete it. The usual cause is a capture whose sim-time pin was never reached on a loaded machine\n`
                    + `   (THE EYE prints "Frozen frame DROPPED" in its capture warnings) — re-run visual:eyes on a quiet\n`
                    + `   box rather than approving a degraded run.\n\n`
                    + `   If dropping that coverage is genuinely intended (e.g. the state no longer exists), re-run with\n`
                    + `     npm run visual:approve -- ${conceptId} ${runDir} --allow-frozen-loss`,
                );
            }
        } catch {
            // Unreadable prior manifest: nothing to protect, continue. (fail() exits
            // the process rather than throwing, so a refusal never lands here.)
        }
    }

    const states: BaselineManifest['states'] = {};
    for (const file of statePngs) {
        const stateId = file.replace('__panel_a.png', '');
        const src = readFileSync(join(runDir, file));
        const downscaled = await sharp(src)
            .resize({ width: BASELINE_NORMALIZED_WIDTH, withoutEnlargement: false })
            .png()
            .toBuffer();
        const dest = join(baselineDir, `${stateId}.png`);
        writeFileSync(dest, downscaled);
        // compare:false is EARNED by a declared-motion state. `undefined` is not a
        // declaration of stillness — it means the scenario is unregistered in
        // deriveMotionExpectations, so live compare here is a GUESS. It stays ON
        // (the pinned primary capture usually reproduces, and this is real H2
        // coverage worth keeping), but it is announced below rather than silently
        // assumed: an unpinnable animated state under a guessed compare:true is
        // exactly how electric_potential_point_charge got a 2.90% baseline that
        // could never pass (2026-08-11).
        const motionKey = baseStateId(stateId);
        const animated = expectsMotion[motionKey] === true;
        if (expectsMotion[motionKey] === undefined) unknownStates.push(stateId);
        states[stateId] = { compare: !animated };
        console.log(`   ${animated ? '◌' : '✓'} ${stateId}.png (${Math.round(downscaled.length / 1024)} KB)${animated ? ' — compare:false (animated state, reference only)' : ''}${expectsMotion[motionKey] === undefined ? ' — compare:true on an UNKNOWN motion expectation (guess)' : ''}${motionKey !== stateId ? ` — scene_group view, motion inherited from ${motionKey}` : ''}`);

        // Frozen baseline — the SET_TIME_FREEZE deterministic capture. This is
        // what gives ANIMATED states real H2 protection (live compare is off
        // for them by design). If a state's frozen frame proves flaky, flip
        // compare_frozen to false in baselines.json — same philosophy as
        // compare:false.
        const frozenSrcPath = join(runDir, `${stateId}__frozen.png`);
        if (existsSync(frozenSrcPath)) {
            const frozenDownscaled = await sharp(readFileSync(frozenSrcPath))
                .resize({ width: BASELINE_NORMALIZED_WIDTH, withoutEnlargement: false })
                .png()
                .toBuffer();
            writeFileSync(join(baselineDir, `${stateId}__frozen.png`), frozenDownscaled);
            states[stateId].compare_frozen = true;
            console.log(`   ❄ ${stateId}__frozen.png (${Math.round(frozenDownscaled.length / 1024)} KB) — compare_frozen:true (deterministic pinned frame)`);
        }
    }

    // PRUNE — this step OWNS the baseline directory, so it must own the whole
    // directory: write the current set AND delete anything no longer in it.
    // Without this, deleting a state leaves its approved PNGs behind forever;
    // the manifest stops referencing them so H2 never compares them and NOTHING
    // FAILS, and git carries pixels of a state the product does not have.
    // (work_energy_theorem 6→5 states left STATE_6.png + STATE_6__frozen.png;
    // found by hand, 2026-08-09.) The failure is invisible in exactly the case
    // that creates it, which is why the delete pass has to be automatic.
    const expected = new Set<string>(['baselines.json']);
    for (const stateId of Object.keys(states)) {
        expected.add(`${stateId}.png`);
        if (states[stateId].compare_frozen) expected.add(`${stateId}__frozen.png`);
    }
    const orphans = readdirSync(baselineDir).filter(f => !expected.has(f));
    for (const f of orphans) {
        rmSync(join(baselineDir, f), { force: true });
        console.log(`   ✂ removed ${f} — no longer a state of this concept`);
    }

    const manifest: BaselineManifest = {
        approved_at: new Date().toISOString(),
        source_run: runDir,
        tolerance: REGRESSION_DEFAULT_TOLERANCE,
        states,
    };
    const manifestPath = join(baselineDir, 'baselines.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`\n   Manifest: ${manifestPath}`);
    if (unknownStates.length > 0) {
        console.log(
            `\n⚠  ${unknownStates.length}/${statePngs.length} state(s) had an UNKNOWN motion expectation and were `
            + `live-compared on a guess: ${unknownStates.join(', ')}.\n`
            + `   THE EYE's D5 motion gate also never ran on these states — a dead animation would have looked\n`
            + `   identical to a working one in the run you are approving. Register this scenario in\n`
            + `   deriveMotionExpectations (see npm run check:motion-registry) so both the gate and this default\n`
            + `   stop guessing.`);
    }
    console.log(`\n✅ ${statePngs.length} baselines approved${orphans.length > 0 ? `, ${orphans.length} orphan(s) pruned` : ''}. Remember: git add visual_baselines/${conceptId}\n`);
}

main().catch(err => {
    console.error('\n💥 visual:approve crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
