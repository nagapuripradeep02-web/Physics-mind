/**
 * WP-F2 acceptance verification — isolated proof that the PCPL/parametric
 * renderer's SET_TIME_FREEZE handler (WP-R1) is live and that THE EYE's
 * screenshotter (screenshotter.ts captureDenseSeries, ~line 830-848) will
 * detect it via `window.__PM_supportsTimePin` and take the PINNED dense
 * capture path, not the legacy wall-clock free-run fallback.
 *
 * Mirrors screenshotter.ts's wrapper+relay harness exactly (single panel;
 * see buildWrapperHtml/PANEL_A_PATH) so this is a faithful, non-invasive
 * probe — no production/validator file is touched or imported beyond
 * `launchBrowser` (already exported) and `assembleParametricHtml` (already
 * exported, used only to build the identical HTML string THE EYE's own
 * capture would receive from the freshly-seeded simulation_cache row).
 *
 * Checks, in order:
 *   1. window.__PM_supportsTimePin === true inside the panel_a iframe
 *      (the exact boolean screenshotter.ts's capability probe reads).
 *   2. SET_TIME_FREEZE {at_ms: 2000} twice (with RESET_TRAJECTORY +
 *      REPLAY_ANIMATIONS before each, exactly like captureFrozenFrame) →
 *      screenshot each time → sha256 compare. Byte-identical = WP-R1's
 *      determinism claim proven directly (also exercises the same
 *      mechanism the dense/frozen capture paths depend on).
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_verify_pcpl_time_pin.ts <concept_id>
 */
import '@/lib/loadEnvLocal';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assembleParametricHtml, type ParametricConfig } from '@/lib/renderers/parametric_renderer';
import { launchBrowser } from '@/lib/validators/visual/chromiumProvider';

interface EpicLState {
    scene_composition?: Array<{ type?: string }>;
    [key: string]: unknown;
}
interface ConceptJson {
    concept_id: string;
    physics_engine_config?: { variables?: Record<string, { default?: number; constant?: number }> };
    epic_l_path?: { states?: Record<string, EpicLState> };
}

function loadConceptJson(conceptId: string): ConceptJson {
    const path = join(process.cwd(), 'src', 'data', 'concepts', `${conceptId}.json`);
    return JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
}

function defaultVarsFromConfig(json: ConceptJson): Record<string, number> {
    const vars: Record<string, number> = {};
    const declared = json.physics_engine_config?.variables ?? {};
    for (const [name, spec] of Object.entries(declared)) {
        if (typeof spec.default === 'number') vars[name] = spec.default;
        else if (typeof spec.constant === 'number') vars[name] = spec.constant;
    }
    return vars;
}

function chooseEntryState(states: Record<string, EpicLState>): string | null {
    const keys = Object.keys(states);
    for (const key of keys) {
        if ((states[key].scene_composition ?? []).some(p => p.type === 'force_arrow')) return key;
    }
    return keys[0] ?? null;
}

const PANEL_A_PATH = 'http://__pm_verify__.local/panel-a.html';

function buildWrapperHtml(): string {
    return `<!doctype html>
<html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:#000;width:1280px;height:720px;overflow:hidden;}
iframe{border:none;width:1280px;height:720px;}
</style></head><body>
<iframe id="panel_a" name="panel_a" src="${PANEL_A_PATH}"></iframe>
<script>
(function(){
  var readyA = false;
  window.__simReady = function(){ return readyA; };
  window.addEventListener('message', function(e){
    if (e.data && e.data.type === 'SIM_READY') readyA = true;
  });
  window.__postToPanel = function(panel, msg){
    var el = document.getElementById('panel_a');
    if (el && el.contentWindow) el.contentWindow.postMessage(msg, '*');
  };
})();
</script>
</body></html>`;
}

async function main(): Promise<void> {
    const conceptId = (process.argv[2] ?? 'scalar_vs_vector').trim();
    const json = loadConceptJson(conceptId);
    const states = json.epic_l_path?.states ?? {};
    const entryState = chooseEntryState(states);
    const config: ParametricConfig = {
        concept_id: conceptId,
        scene_composition: entryState ? (states[entryState].scene_composition ?? []) : [],
        states: states as Record<string, { scene_composition?: unknown[] }>,
        default_variables: defaultVarsFromConfig(json),
        current_state: entryState ?? Object.keys(states)[0],
        canvas_style: 'default',
    };
    const simHtml = assembleParametricHtml(config);
    console.log(`[verify] built sim_html for ${conceptId}: ${simHtml.length} chars, entry=${config.current_state}`);

    const browser = await launchBrowser();
    try {
        const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
        const page = await context.newPage();
        await page.route(PANEL_A_PATH, route => route.fulfill({ status: 200, contentType: 'text/html', body: simHtml }));
        await page.setContent(buildWrapperHtml());
        await page.waitForFunction(
            () => Boolean((window as unknown as { __simReady?: () => boolean }).__simReady?.()),
            undefined,
            { timeout: 8000 },
        );
        console.log('[verify] SIM_READY received.');

        const frame = page.frame({ name: 'panel_a' });
        if (!frame) throw new Error('panel_a frame not found');

        // Check 1 — the exact capability probe screenshotter.ts's
        // captureDenseSeries runs (screenshotter.ts ~line 841-844).
        const pinFlag = await frame.evaluate(() => (window as unknown as { __PM_supportsTimePin?: boolean }).__PM_supportsTimePin === true);
        console.log(`\n[CHECK 1] window.__PM_supportsTimePin === true  →  ${pinFlag ? 'TRUE (pinned dense path will fire)' : 'FALSE (would take wall-clock fallback)'}`);

        // Check 2 — SET_TIME_FREEZE {at_ms:2000} twice, byte-compare screenshots.
        // Mirrors captureFrozenFrame's message sequence exactly.
        async function frozenShotAt(atMs: number): Promise<Buffer> {
            await page.evaluate((m) => (window as unknown as { __postToPanel: (p: string, msg: unknown) => void }).__postToPanel('a', m), { type: 'RESET_TRAJECTORY' });
            await page.evaluate((m) => (window as unknown as { __postToPanel: (p: string, msg: unknown) => void }).__postToPanel('a', m), { type: 'REPLAY_ANIMATIONS' });
            await page.evaluate((m) => (window as unknown as { __postToPanel: (p: string, msg: unknown) => void }).__postToPanel('a', { type: 'SET_TIME_FREEZE', at_ms: m }), atMs);
            // Poll PM_simTimeMs until it reaches atMs (mirrors pollSimTimeReached).
            const deadline = Date.now() + atMs * 2.5 + 4000;
            let lastSim = 0;
            while (Date.now() < deadline) {
                const sim = await frame!.evaluate(() => (window as unknown as { PM_simTimeMs?: number }).PM_simTimeMs ?? null);
                if (typeof sim === 'number') {
                    lastSim = sim;
                    if (sim >= atMs - 50) break;
                }
                await page.waitForTimeout(50);
            }
            console.log(`   pin poll: target=${atMs}ms reached=${lastSim}ms`);
            await page.waitForTimeout(Math.max(0, 1000)); // fixed settle, same for both shots
            const panelFrame = page.frame({ name: 'panel_a' })!;
            const el = await panelFrame.frameElement();
            const png = await el.screenshot({ type: 'png' });
            await page.evaluate((m) => (window as unknown as { __postToPanel: (p: string, msg: unknown) => void }).__postToPanel('a', m), { type: 'SET_TIME_FREEZE', frozen: false });
            return png;
        }

        const shot1 = await frozenShotAt(2000);
        const shot2 = await frozenShotAt(2000);
        const hash1 = createHash('sha256').update(shot1).digest('hex');
        const hash2 = createHash('sha256').update(shot2).digest('hex');
        console.log(`\n[CHECK 2] SET_TIME_FREEZE at_ms=2000 twice:`);
        console.log(`   shot1 sha256: ${hash1}`);
        console.log(`   shot2 sha256: ${hash2}`);
        console.log(`   byte-identical: ${hash1 === hash2 ? 'YES' : 'NO — NON-DETERMINISTIC'}`);

        // Check 3 — PAUSE actually freezes the clock (independent of pinning):
        // read PM_simTimeMs, PAUSE, wait 600ms wall-clock, read again — must be equal.
        await page.evaluate((m) => (window as unknown as { __postToPanel: (p: string, msg: unknown) => void }).__postToPanel('a', m), { type: 'SET_TIME_FREEZE', frozen: false });
        await page.evaluate((m) => (window as unknown as { __postToPanel: (p: string, msg: unknown) => void }).__postToPanel('a', m), { type: 'RESET_TRAJECTORY' });
        await page.waitForTimeout(500);
        await page.evaluate((m) => (window as unknown as { __postToPanel: (p: string, msg: unknown) => void }).__postToPanel('a', m), { type: 'PAUSE' });
        const simAtPause = await frame.evaluate(() => (window as unknown as { PM_simTimeMs?: number }).PM_simTimeMs ?? null);
        await page.waitForTimeout(600);
        const simAfterWait = await frame.evaluate(() => (window as unknown as { PM_simTimeMs?: number }).PM_simTimeMs ?? null);
        console.log(`\n[CHECK 3] PAUSE holds the clock: at-pause=${simAtPause}ms, +600ms real wait=${simAfterWait}ms, held: ${simAtPause === simAfterWait ? 'YES' : 'NO'}`);
        await page.evaluate((m) => (window as unknown as { __postToPanel: (p: string, msg: unknown) => void }).__postToPanel('a', m), { type: 'RESUME' });
        await page.waitForTimeout(300);
        const simAfterResume = await frame.evaluate(() => (window as unknown as { PM_simTimeMs?: number }).PM_simTimeMs ?? null);
        console.log(`[CHECK 3b] RESUME continues: ${simAfterResume}ms (should be > ${simAfterWait}ms): ${(simAfterResume ?? 0) > (simAfterWait ?? 0) ? 'YES' : 'NO'}`);

        const allPass = pinFlag && hash1 === hash2 && simAtPause === simAfterWait && (simAfterResume ?? 0) > (simAfterWait ?? 0);
        console.log(`\n${allPass ? '✅ ALL CHECKS PASS' : '❌ SOME CHECK FAILED'}`);
        process.exitCode = allPass ? 0 : 1;
    } finally {
        await browser.close();
    }
}

main().catch(err => {
    console.error('💥 verify crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
