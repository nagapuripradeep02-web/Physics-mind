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
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import {
    BASELINE_NORMALIZED_WIDTH,
    REGRESSION_DEFAULT_TOLERANCE,
    type BaselineManifest,
} from '@/lib/validators/visual/regressionGate';
import { deriveMotionExpectations } from '@/lib/validators/visual/deriveStateMeta';
import { loadCachedSim, fail } from './lib/loadCachedSim';

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

    // Motion expectations decide the compare default per state.
    const cached = await loadCachedSim(conceptId);
    const expectsMotion = deriveMotionExpectations(cached.physics_config);

    const statePngs = readdirSync(runDir)
        .filter(f => f.endsWith('__panel_a.png'))
        .sort();
    if (statePngs.length === 0) fail(`Run dir has no <STATE>__panel_a.png files: ${runDir}`);

    const baselineDir = join(process.cwd(), 'visual_baselines', conceptId);
    mkdirSync(baselineDir, { recursive: true });

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
        const animated = expectsMotion[stateId] === true;
        states[stateId] = { compare: !animated };
        console.log(`   ${animated ? '◌' : '✓'} ${stateId}.png (${Math.round(downscaled.length / 1024)} KB)${animated ? ' — compare:false (animated state, reference only)' : ''}`);
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
    console.log(`\n✅ ${statePngs.length} baselines approved. Remember: git add visual_baselines/${conceptId}\n`);
}

main().catch(err => {
    console.error('\n💥 visual:approve crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
