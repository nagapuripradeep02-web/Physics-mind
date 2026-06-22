// Runtime check for the SET_CAMERA viewpoints on magnetic_force_moving_charge.
// Captures each named view so I can confirm face_on shows a circle, edge_on shows
// the helix stretch, etc. Run: npx tsx src/scripts/_capture_camera.ts
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

async function main() {
    const json = JSON.parse(readFileSync(join(process.cwd(), 'src/data/concepts/magnetic_force_moving_charge.json'), 'utf-8'));
    const cfg: Field3DConfig = json.field_3d_config;
    const outDir = join(process.cwd(), '.visual_runs', 'camera');
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
    // STATE_2 = the θ=90 circle. Test the views against a known circle.
    await post({ type: 'SET_STATE', state: 'STATE_2' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(outDir, '0_default.png') });

    for (const view of ['face_on', 'edge_on', 'top', 'closer', 'wider', 'default']) {
        await post({ type: 'SET_CAMERA', view });
        await page.waitForTimeout(2200); // allow the lerp to settle
        await page.screenshot({ path: join(outDir, view + '.png') });
    }

    await browser.close();
    console.log('CAMERA CAPTURE DONE -> ' + outDir);
    console.log('page errors: ' + (errors.length ? '\n' + errors.join('\n') : 'none'));
}

main().catch((e) => { console.error(e); process.exit(1); });
