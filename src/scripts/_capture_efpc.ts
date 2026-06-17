// Throwaway THE EYE capture for electric_field_point_charge — renders each state
// through the production assembleField3DHtml path and screenshots it. Verifies the
// electric_explorer dual-field renderer additions visually. Run:
//   npx tsx src/scripts/_capture_efpc.ts
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

async function main() {
    const json = JSON.parse(
        readFileSync(join(process.cwd(), 'src/data/concepts/electric_field_point_charge.json'), 'utf-8'),
    );
    const cfg: Field3DConfig = json.field_3d_config;
    const outDir = join(process.cwd(), '.visual_runs', 'efpc');
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

    // STATE_7 explorer — drive Q high + r low (close ⇒ big E), then flip sign.
    await page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_7' }, '*'));
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
        const q = document.getElementById('ec_q_slider') as HTMLInputElement | null;
        const r = document.getElementById('ec_r_slider') as HTMLInputElement | null;
        if (q) { q.value = '10'; q.dispatchEvent(new Event('input')); }
        if (r) { r.value = '3'; r.dispatchEvent(new Event('input')); }
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(outDir, 'STATE_7_Qhi_rlo.png') });
    const readout = await page.evaluate(() => {
        const el = document.getElementById('ec_e_readout');
        return el ? el.textContent : '(no readout)';
    });
    await page.evaluate(() => {
        const t = document.getElementById('ec_sign_toggle') as HTMLButtonElement | null;
        if (t) t.click();
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(outDir, 'STATE_7_negative.png') });

    // Rotated views — drag to orbit the camera so we test the 3D field from
    // angles other than the authored default (strong 3D check + resolves whether
    // the straight-up pole field-line is just a foreshortening artifact).
    for (const s of ['STATE_4', 'STATE_5']) {
        await page.evaluate((st) => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
        await page.waitForTimeout(1100);
        await page.mouse.move(450, 300);
        await page.mouse.down();
        await page.mouse.move(700, 380, { steps: 14 });
        await page.mouse.up();
        await page.waitForTimeout(700);
        await page.screenshot({ path: join(outDir, s + '_rotated.png') });
    }

    await browser.close();
    console.log('CAPTURE DONE → ' + outDir);
    console.log('STATE_7 readout (Q=10,r=3): ' + readout);
    console.log('page errors: ' + (errors.length ? '\n' + errors.join('\n') : 'none'));
}

main().catch((e) => { console.error(e); process.exit(1); });
