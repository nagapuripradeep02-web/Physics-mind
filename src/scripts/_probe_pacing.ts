// Runtime proof of the pacing control surface (SET_SPEED / PAUSE / RESUME) on
// magnetic_force_moving_charge. Asserts against the renderer's own sim clock
// (window.PM_simTimeMs): paused → clock frozen; slow-mo → clock advances slower.
// Run: npx tsx src/scripts/_probe_pacing.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

async function main() {
    const json = JSON.parse(readFileSync(join(process.cwd(), 'src/data/concepts/magnetic_force_moving_charge.json'), 'utf-8'));
    const cfg: Field3DConfig = json.field_3d_config;
    const html = assembleField3DHtml(cfg);
    const browser = await launchBrowser();
    const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

    const post = (msg: object) => page.evaluate((m) => window.postMessage(m, '*'), msg);
    const simMs = () => page.evaluate(() => (window as unknown as { PM_simTimeMs: number }).PM_simTimeMs);

    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await post({ type: 'SET_STATE', state: 'STATE_2' });
    await page.waitForTimeout(600);

    // Normal speed: clock advances over 1.2s.
    const n0 = await simMs(); await page.waitForTimeout(1200); const n1 = await simMs();
    const normal = n1 - n0;

    // Paused: clock must NOT advance.
    await post({ type: 'PAUSE' }); await page.waitForTimeout(200);
    const p0 = await simMs(); await page.waitForTimeout(1200); const p1 = await simMs();
    const pausedDelta = p1 - p0;

    // Resume at 0.3×: clock advances, but slower than normal.
    await post({ type: 'RESUME' });
    await post({ type: 'SET_SPEED', rate: 0.3 }); await page.waitForTimeout(200);
    const s0 = await simMs(); await page.waitForTimeout(1200); const s1 = await simMs();
    const slow = s1 - s0;

    await browser.close();
    const ratio = normal > 0 ? (slow / normal) : 0;
    console.log(`normal Δ:  ${normal.toFixed(0)} ms/1.2s`);
    console.log(`paused Δ:  ${pausedDelta.toFixed(0)} ms  (expect ~0 → frozen)`);
    console.log(`slow Δ:    ${slow.toFixed(0)} ms  (expect ~0.3× of normal)`);
    console.log(`slow/normal ratio: ${ratio.toFixed(2)} (expect ~0.3)`);
    console.log('PASS pause:  ' + (Math.abs(pausedDelta) < 30));
    console.log('PASS slowmo: ' + (slow > 10 && ratio < 0.6));
    console.log('page errors: ' + (errors.length ? '\n' + errors.join('\n') : 'none'));
}

main().catch((e) => { console.error(e); process.exit(1); });
