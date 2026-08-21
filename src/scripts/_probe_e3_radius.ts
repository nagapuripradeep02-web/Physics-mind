/**
 * E3 verification probe — does a RADIUS WRITE re-lift, re-scale and re-space?
 *
 * Desk B is the named verifier for E3. Slider PRESENCE was confirmed on pixels;
 * this drives the actual write path (the DOM `input` event nlbWireSlider binds —
 * exactly what a teacher drag fires) and captures the geometry before/after.
 *
 * Subject: pure_rolling STATE_1 (authored radius_m 0.25, controls_visible ["R"],
 * revolution_marks with a 2piR bracket). Doubling R must:
 *   - re-SCALE  the wheel mesh (visibly bigger)
 *   - re-LIFT   it so it still sits ON the track, not sunk through it
 *   - re-SPACE  the revolution marks to the new 2piR = 3.1416 m
 *   - restate   the bracket label
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_probe_e3_radius.ts
 */
import '@/lib/loadEnvLocal';
import { chromium } from 'playwright';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT = 'pure_rolling';
const R_OLD = 0.25;
const R_NEW = 0.50;
const OUT = '.visual_runs/_e3_probe';

async function main(): Promise<void> {
    const { data, error } = await supabaseAdmin
        .from('simulation_cache').select('sim_html').eq('concept_key', CONCEPT).single();
    if (error) throw new Error(error.message);
    const html = (data as { sim_html: string }).sim_html;

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForFunction(`!!window.PM_nlbEngine`, null, { timeout: 30000 });
    await page.evaluate(`window.postMessage({ type: 'SET_STATE', state: 'STATE_1' }, '*')`);
    await page.waitForTimeout(2500);
    // Pin the clock so before/after differ ONLY by the radius write, not by travel.
    await page.evaluate(`window.postMessage({ type: 'SET_TIME_FREEZE', ms: 1200 }, '*')`);
    await page.waitForTimeout(800);

    // NOTE: evaluate bodies are passed as STRINGS, not functions. tsx/esbuild
    // compiles with keepNames, which injects a `__name` helper that does not
    // exist in the page context — a named-function body throws ReferenceError.
    const READ_JS = `(function () {
        var eng = window.PM_nlbEngine;
        var b = eng && eng.bodies ? eng.bodies.wheel : null;
        function g(id) { return document.getElementById(id); }
        function txt(id) { var e = g(id); return e && e.textContent ? e.textContent.trim() : ''; }
        var sl = g('nlb_r_slider'), row = g('nlb_r_row');
        var hudEl = document.querySelector('.pm_hud');
        return {
            sliderValue: sl ? sl.value : null,
            sliderVisible: !!(row && row.offsetParent !== null),
            rowLabel: (txt('nlb_r_lbl') + ' ' + txt('nlb_r_val')).trim(),
            engRadius: b && b.radius_m != null ? Number(b.radius_m) : null,
            engS: b && b.s != null ? Number(b.s) : null,
            engOmega: b && b.omega != null ? Number(b.omega) : null,
            hud: hudEl && hudEl.textContent ? hudEl.textContent.replace(/\\s+/g, ' ').trim().slice(0, 200) : ''
        };
    })()`;

    const read = async () => page.evaluate(READ_JS) as Promise<Record<string, unknown>>;

    const before = await read();
    await page.screenshot({ path: `${OUT}/S1_before_R${R_OLD}.png` });

    const wrote = await page.evaluate(`(function () {
        var el = document.getElementById('nlb_r_slider');
        if (!el) return 'NO_R_SLIDER';
        el.value = String(${R_NEW});
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return el.id;
    })()`);
    await page.waitForTimeout(1500);

    const after = await read();
    await page.screenshot({ path: `${OUT}/S1_after_R${R_NEW}.png` });

    console.log(`\n=== E3 RADIUS-WRITE PROBE — ${CONCEPT} STATE_1 ===`);
    console.log(`wrote via: ${wrote}`);
    console.log('\nBEFORE:', JSON.stringify(before));
    console.log('\nAFTER :', JSON.stringify(after));
    console.log(`\n2piR expected: ${(2 * Math.PI * R_OLD).toFixed(4)} m -> ${(2 * Math.PI * R_NEW).toFixed(4)} m (ratio 2.000)`);
    const rBefore = Number(before.engRadius), rAfter = Number(after.engRadius);
    if (Number.isFinite(rBefore) && Number.isFinite(rAfter) && rBefore !== 0) {
        console.log(`engine radius_m: ${rBefore} -> ${rAfter} (ratio ${(rAfter / rBefore).toFixed(3)})`);
    }
    console.log(`\nframes: ${OUT}/S1_before_R${R_OLD}.png  ${OUT}/S1_after_R${R_NEW}.png`);

    await browser.close();
}

main().catch((e) => { console.error('PROBE FAILED:', e instanceof Error ? e.stack : e); process.exit(1); });
