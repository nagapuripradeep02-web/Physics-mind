// Throwaway THE EYE capture for electric_field_dipole — renders each state
// through the production assembleField3DHtml path and screenshots it. Verifies the
// new dipole_field scenario visually. Run: npx tsx src/scripts/_capture_dipole.ts
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

async function main() {
    const json = JSON.parse(
        readFileSync(join(process.cwd(), 'src/data/concepts/electric_field_dipole.json'), 'utf-8'),
    );
    const cfg: Field3DConfig = json.field_3d_config;
    const outDir = join(process.cwd(), '.visual_runs', 'dipole');
    mkdirSync(outDir, { recursive: true });

    const html = assembleField3DHtml(cfg);
    const browser = await launchBrowser();
    const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(1600);

    const states = ['STATE_1', 'STATE_2', 'STATE_3', 'STATE_4', 'STATE_5', 'STATE_6', 'STATE_7'];
    for (const s of states) {
        await page.evaluate((st) => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
        await page.waitForTimeout(1700);
        await page.screenshot({ path: join(outDir, s + '.png') });
    }

    // Motion sampling — headless rAF is throttled, so grab several timepoints to
    // catch the build / sweep / flow at different phases.
    const sampleMotion = async (st: string, label: string, waits: number[]) => {
        await page.evaluate((s) => window.postMessage({ type: 'SET_STATE', state: s }, '*'), st);
        for (let i = 0; i < waits.length; i++) {
            await page.waitForTimeout(waits[i]);
            await page.screenshot({ path: join(outDir, label + '_t' + i + '.png') });
        }
    };
    await sampleMotion('STATE_2', 'S2_build', [400, 500, 600]);   // ~0.4s, 0.9s, 1.5s
    await sampleMotion('STATE_5', 'S5_sweep', [600, 2200, 2200]); // ~0.6s, 2.8s, 5.0s
    await sampleMotion('STATE_6', 'S6_flow', [600, 1500, 1500]);  // ~0.6s, 2.1s, 3.6s

    // STATE_7 explorer — sweep theta 0 -> 90 (axial -> equatorial), then push r out.
    await page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_7' }, '*'));
    await page.waitForTimeout(1000);
    await page.evaluate((a: { q: string; r: string; th: string }) => {
        const qel = document.getElementById('df_q_slider') as HTMLInputElement | null;
        if (qel) { qel.value = a.q; qel.dispatchEvent(new Event('input')); }
        const rel = document.getElementById('df_r_slider') as HTMLInputElement | null;
        if (rel) { rel.value = a.r; rel.dispatchEvent(new Event('input')); }
        const tel = document.getElementById('df_theta_slider') as HTMLInputElement | null;
        if (tel) { tel.value = a.th; tel.dispatchEvent(new Event('input')); }
    }, { q: '5', r: '2.2', th: '90' });
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(outDir, 'STATE_7_theta90.png') });
    const ro90 = await page.evaluate(() => document.getElementById('df_e_readout')?.textContent ?? '');
    await page.evaluate((a: { q: string; r: string; th: string }) => {
        const qel = document.getElementById('df_q_slider') as HTMLInputElement | null;
        if (qel) { qel.value = a.q; qel.dispatchEvent(new Event('input')); }
        const rel = document.getElementById('df_r_slider') as HTMLInputElement | null;
        if (rel) { rel.value = a.r; rel.dispatchEvent(new Event('input')); }
        const tel = document.getElementById('df_theta_slider') as HTMLInputElement | null;
        if (tel) { tel.value = a.th; tel.dispatchEvent(new Event('input')); }
    }, { q: '10', r: '3.2', th: '45' });
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(outDir, 'STATE_7_qhi_rfar_th45.png') });
    const ro45 = await page.evaluate(() => document.getElementById('df_e_readout')?.textContent ?? '');

    // Rotated orbit view of STATE_6 (field-line map) for a 3D check.
    await page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_6' }, '*'));
    await page.waitForTimeout(1200);
    const cv = page.locator('canvas');
    const box = await cv.boundingBox();
    if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 140, box.y + box.height / 2 - 40, { steps: 12 });
        await page.mouse.up();
        await page.waitForTimeout(600);
        await page.screenshot({ path: join(outDir, 'STATE_6_orbit.png') });
    }

    console.log('readout theta=90:', ro90);
    console.log('readout q=10,r=3.2,theta=45:', ro45);
    console.log('pageerrors:', errors.length ? errors.slice(0, 8) : 'none');
    console.log('frames →', outDir);
    await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
