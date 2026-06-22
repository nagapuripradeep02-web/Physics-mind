// Proves the highlight is now a STEADY brightness glow, not a size throb. Uses
// the stationary B-field grid + 3D hand: captures two frames ~1.1s apart while
// glowed — old behaviour pulsed their size (frames would differ), new behaviour
// keeps size constant and just brightens. Run: npx tsx src/scripts/_capture_glow.ts
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

async function main() {
    const json = JSON.parse(readFileSync(join(process.cwd(), 'src/data/concepts/magnetic_force_moving_charge.json'), 'utf-8'));
    const cfg: Field3DConfig = json.field_3d_config;
    const outDir = join(process.cwd(), '.visual_runs', 'glow');
    mkdirSync(outDir, { recursive: true });
    const html = assembleField3DHtml(cfg);
    const browser = await launchBrowser();
    const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    const post = (m: object) => page.evaluate((x) => window.postMessage(x, '*'), m);

    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await post({ type: 'SET_STATE', state: 'STATE_2' });
    await page.waitForTimeout(1300);
    await page.screenshot({ path: join(outDir, '0_baseline_noglow.png') });

    await post({ type: 'SET_GLOW', target: ['b', 'hand', 'v', 'f'] });
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(outDir, '1_glow_frameA.png') });
    await page.waitForTimeout(1100);  // time advances ~ a full old-pulse period
    await page.screenshot({ path: join(outDir, '2_glow_frameB.png') });

    await post({ type: 'SET_GLOW', target: null });
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(outDir, '3_glow_cleared.png') });

    await browser.close();
    console.log('GLOW CAPTURE DONE -> ' + outDir);
    console.log('Compare 1_glow_frameA vs 2_glow_frameB: field/hand must be the SAME size (no throb).');
    console.log('Compare 0_baseline vs 1_glow: glowed elements should be BRIGHTER. 3_cleared should match baseline.');
    console.log('page errors: ' + (errors.length ? '\n' + errors.join('\n') : 'none'));
}

main().catch((e) => { console.error(e); process.exit(1); });
