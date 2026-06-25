// Throwaway THE EYE capture for electric_dipole_in_field — renders each state
// through the production assembleField3DHtml path and screenshots it. Verifies
// the new dipole_in_uniform_field scenario visually.
// Run: npx tsx src/scripts/_capture_dipole_in_field.ts
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

async function main() {
    const json = JSON.parse(
        readFileSync(join(process.cwd(), 'src/data/concepts/electric_dipole_in_field.json'), 'utf-8'),
    );
    const cfg: Field3DConfig = json.field_3d_config;
    const outDir = join(process.cwd(), '.visual_runs', 'dipole_in_field');
    mkdirSync(outDir, { recursive: true });

    const html = assembleField3DHtml(cfg);
    const browser = await launchBrowser();
    const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(1600);

    const states = ['STATE_1', 'STATE_2', 'STATE_3', 'STATE_4', 'STATE_5', 'STATE_6', 'STATE_7', 'STATE_8'];
    for (const s of states) {
        await page.evaluate((st) => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
        await page.waitForTimeout(1700);
        await page.screenshot({ path: join(outDir, s + '.png') });
    }

    // Motion sampling — headless rAF is throttled, so grab several timepoints to
    // catch the rotation / sweep / oscillation at different phases.
    const sampleMotion = async (st: string, label: string, waits: number[]) => {
        await page.evaluate((s) => window.postMessage({ type: 'SET_STATE', state: s }, '*'), st);
        for (let i = 0; i < waits.length; i++) {
            await page.waitForTimeout(waits[i]);
            await page.screenshot({ path: join(outDir, label + '_t' + i + '.png') });
        }
    };
    await sampleMotion('STATE_4', 'S4_rotate', [400, 900, 1600]);  // couple → slow rotation toward align
    await sampleMotion('STATE_5', 'S5_sweep', [600, 2200, 2200]);  // θ sweep 0→180, τ traces sine
    await sampleMotion('STATE_7', 'S7_osc', [500, 1000, 1500]);    // oscillation about θ=0 + U-meter

    // STATE_8 sandbox — drive the three sliders and read τ/U back.
    await page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_8' }, '*'));
    await page.waitForTimeout(900);
    const drive = async (p: string, e: string, th: string) => {
        await page.evaluate((a: { p: string; e: string; th: string }) => {
            const pe = document.getElementById('p_dipole_slider') as HTMLInputElement | null;
            if (pe) { pe.value = a.p; pe.dispatchEvent(new Event('input', { bubbles: true })); }
            const ee = document.getElementById('e_dipole_slider') as HTMLInputElement | null;
            if (ee) { ee.value = a.e; ee.dispatchEvent(new Event('input', { bubbles: true })); }
            const te = document.getElementById('theta_dipole_slider') as HTMLInputElement | null;
            if (te) { te.value = a.th; te.dispatchEvent(new Event('input', { bubbles: true })); }
        }, { p, e, th });
        await page.waitForTimeout(700);
    };
    await drive('5', '5', '90');
    await page.screenshot({ path: join(outDir, 'STATE_8_theta90.png') });
    const ro90 = await page.evaluate(() => document.getElementById('dipole_readout')?.textContent ?? '');
    await drive('10', '8', '0');
    await page.screenshot({ path: join(outDir, 'STATE_8_theta0.png') });
    const ro0 = await page.evaluate(() => document.getElementById('dipole_readout')?.textContent ?? '');
    await drive('10', '8', '180');
    await page.screenshot({ path: join(outDir, 'STATE_8_theta180.png') });
    const ro180 = await page.evaluate(() => document.getElementById('dipole_readout')?.textContent ?? '');

    // Rotated orbit view of STATE_3 (the force couple) for a 3D check.
    await page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_3' }, '*'));
    await page.waitForTimeout(1000);
    const cv = page.locator('canvas');
    const box = await cv.boundingBox();
    if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 130, box.y + box.height / 2 - 40, { steps: 12 });
        await page.mouse.up();
        await page.waitForTimeout(600);
        await page.screenshot({ path: join(outDir, 'STATE_3_orbit.png') });
    }

    console.log('readout p5 E5 theta90 :', ro90);
    console.log('readout p10 E8 theta0 :', ro0);
    console.log('readout p10 E8 theta180:', ro180);
    console.log('pageerrors:', errors.length ? errors.slice(0, 10) : 'none');
    console.log('frames →', outDir);
    await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
