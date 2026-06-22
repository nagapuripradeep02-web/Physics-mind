// Throwaway runtime check for the Voice Professor SET_PARAM control surface on
// magnetic_force_moving_charge. The renderer JS lives inside a template literal
// (tsc can't see it), so this drives the assembled HTML in a headless browser
// and screenshots each knob change. Run:
//   npx tsx src/scripts/_capture_lorentz_param.ts
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

async function main() {
    const json = JSON.parse(
        readFileSync(join(process.cwd(), 'src/data/concepts/magnetic_force_moving_charge.json'), 'utf-8'),
    );
    const cfg: Field3DConfig = json.field_3d_config;
    const outDir = join(process.cwd(), '.visual_runs', 'lorentz_param');
    mkdirSync(outDir, { recursive: true });

    const html = assembleField3DHtml(cfg);
    const browser = await launchBrowser();
    const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

    const setState = async (s: string) => {
        await page.evaluate((st) => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
        await page.waitForTimeout(1600);
    };
    const setParam = async (param: string, value: number) => {
        await page.evaluate((p) => window.postMessage({ type: 'SET_PARAM', param: p.param, value: p.value }, '*'), { param, value });
        await page.waitForTimeout(1700);
    };
    const shot = (name: string) => page.screenshot({ path: join(outDir, name + '.png') });

    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(1600);

    // ── Test 1: STATE_5 is an authored helix (θ=45) with NO sliders. The AI
    //    override must drive θ here (the whole point of the unlock). ──
    await setState('STATE_5');
    await shot('01_state5_default_45');
    await setParam('theta_deg', 10);          // should STRETCH the helix
    await shot('02_state5_theta10_stretched');
    await setParam('theta_deg', 80);          // should TIGHTEN toward a circle
    await shot('03_state5_theta80_tight');

    // ── Test 2: B and q_sign overrides in a moving state. ──
    await setParam('B', 0.08);                // stronger field → tighter/faster
    await shot('04_state5_B_high');
    await setParam('q_sign', -1);             // reverse circulation
    await shot('05_state5_qneg');

    // ── Test 3: circle → helix money shot. STATE_2 is a θ=90 circle; setting
    //    θ=30 should open it into a helix. ──
    await setState('STATE_2');
    await shot('06_state2_default_circle');
    await setParam('theta_deg', 30);
    await shot('07_state2_theta30_helix');

    // ── Test 4: leak regression. Re-enter STATE_5 → override must be cleared,
    //    so it shows the authored θ=45 helix again, NOT the θ=30 from STATE_2. ──
    await setState('STATE_5');
    await shot('08_state5_after_reentry_should_be_45');

    // ── Test 5: STATE_8 has on-screen sliders — SET_PARAM should move them. ──
    await setState('STATE_8');
    await shot('09_state8_default');
    await setParam('theta_deg', 20);
    const sliderVal = await page.evaluate(() => {
        const el = document.getElementById('theta_slider') as HTMLInputElement | null;
        return el ? el.value : '(no slider)';
    });
    await shot('10_state8_theta20_slidermoved');

    await browser.close();
    console.log('CAPTURE DONE -> ' + outDir);
    console.log('STATE_8 theta_slider value after SET_PARAM theta_deg 20: ' + sliderVal + ' (expect 20)');
    console.log('page errors: ' + (errors.length ? '\n' + errors.join('\n') : 'none'));
}

main().catch((e) => { console.error(e); process.exit(1); });
