/**
 * SCRATCH — E5 verification for Desk A (2026-08-06). Reads only; writes nothing.
 *
 * E5 added four readout rows (theta / alpha / tau / W) that RBR_RO_META had been
 * skipping in silence, and made an unknown token LOUD via a [PM_RBR_TOKEN]
 * console warning. Desk A is E5's named verifier.
 *
 * Two things have to be proved, and the second is the one usually skipped:
 *
 *   1. The new tokens actually PRINT — label, value, unit, dp — not merely that
 *      nothing threw. `conservation_of_angular_momentum` authors none of them
 *      (its readouts are I/omega/L/KE/dLdt), so they are exercised here on a
 *      scratch config rather than by mutating an approved concept.
 *
 *   2. The console gate is LIVE. A silent console proves nothing unless the
 *      warning is known to fire when it should — "byte-identical A/B proves
 *      non-regression, not correctness". So this probe authors a deliberately
 *      bogus token and asserts the warning appears, once per state, naming it.
 *      Only then is the real concept's silence meaningful.
 *
 * Units are ruled: theta rad · alpha rad/s² · tau N·m · W J, dp 2, authored SI.
 * Apparatus per APPARATUS_CONTRACT.md: r 0.80 · omega 1.50 · m 2.0 · I_frame
 * 0.50 · rod_half 1.00 · drum 0.55.
 *
 * Run: npx tsx src/scripts/_scratch_rbr_e5_probe.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_rbr_e5');
const CONCEPT = path.join(process.cwd(), 'src', 'data', 'concepts', 'conservation_of_angular_momentum.json');

const INIT = `(function () {
  var vclock = 0, q = [];
  window.requestAnimationFrame = function (cb) { q.push(cb); return q.length; };
  window.cancelAnimationFrame = function () {};
  try { performance.now = function () { return vclock; }; } catch (e) {}
  window.__TICK = function (dtMs, n) {
    for (var i = 0; i < (n || 1); i++) {
      vclock += dtMs;
      var due = q; q = [];
      for (var j = 0; j < due.length; j++) { try { due[j](vclock); } catch (e) {} }
    }
    return vclock;
  };
})()`;

const APPARATUS = {
    body_shape: 'turntable_rod', i_frame_kgm2: 0.50, rod_half_length_m: 1.00,
    brake_drum_radius_m: 0.55, rod_height_above_pad_m: 0.25, r_min_m: 0.15, r_max_m: 0.90,
};
const MASSES = { count: 2, mass_kg: 2.0, r_m: 0.80 };

// STATE_A exercises all four NEW tokens under a real brake, so tau/W/alpha are
// non-zero and theta accumulates. STATE_B authors a token no engine row can
// serve — the negative control for the console gate.
const CFG = {
    scenario_type: 'rigid_body_rotation',
    explorer_id: 'rbr_e5_probe',
    field_lines: { count: 0, color_positive: '#FF6B6B', color_negative: '#4ECDC4', opacity: 0, arrow_spacing: 0 },
    states: {
        STATE_A: {
            label: 'E5 rows', caption: 'E5 rows',
            visible_elements: ['rbr_drum', 'rbr_rod'],
            rigid_body_rotation: {
                mode: 'fixed_axis', apparatus: APPARATUS, masses: MASSES,
                omega0_rad_s: 1.50, spin_sign: 1,
                external_torque: { source: 'brake', tau_brake_Nm: 0.92, engage_at_ms: 1500, release_at_ms: 4000, pad_travel_ms: 1500 },
                readouts: ['theta', 'alpha', 'tau', 'W'],
            },
        },
        STATE_B: {
            label: 'unknown token', caption: 'unknown token',
            visible_elements: ['rbr_drum', 'rbr_rod'],
            rigid_body_rotation: {
                mode: 'fixed_axis', apparatus: APPARATUS, masses: MASSES,
                omega0_rad_s: 1.50, spin_sign: 1,
                readouts: ['L', 'definitely_not_a_real_token'],
            },
        },
    },
} as unknown as Field3DConfig;

let failures = 0;
function check(label: string, ok: boolean, detail = '') {
    if (!ok) failures++;
    console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  — ' + detail : ''));
}

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const browser = await chromium.launch();

    async function open(html: string, name: string) {
        const file = path.join(OUT, name);
        fs.writeFileSync(file, html, 'utf8');
        const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
        const console_: string[] = [];
        page.on('console', m => console_.push(m.type() + ': ' + m.text()));
        page.on('pageerror', e => console_.push('pageerror: ' + e.message));
        await page.addInitScript(INIT);
        await page.goto('file:///' + file.replace(/\\/g, '/'));
        await page.waitForFunction('typeof window.__TICK === "function"', null, { timeout: 20000, polling: 100 });
        const tick = (dt: number, n = 1) => page.evaluate(
            ([d, k]) => (window as unknown as { __TICK: (a: number, b: number) => number }).__TICK(d, k),
            [dt, n] as [number, number]);
        for (let i = 0; i < 60; i++) {
            await tick(16.7, 4);
            if (await page.evaluate(() => typeof (window as unknown as Record<string, unknown>).PM_rbrEngine !== 'undefined')) break;
            await page.waitForTimeout(100);
        }
        return { page, console_, tick };
    }

    const READ_HUD = `(function(){ var ro=document.getElementById('rbr_readout');
        return ro ? (ro.innerText||'').replace(/\\n/g,' | ') : '<<no readout>>'; })()`;

    // ── 1. The four NEW rows print, with the ruled units ─────────────────────
    console.log('\n=== 1. E5: do theta / alpha / tau / W actually PRINT? ===');
    const A = await open(assembleField3DHtml(CFG), 'e5.html');
    await A.page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_A' }, '*'));
    await A.tick(16.7, 10);
    await A.page.evaluate(() => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: 3000 }, '*'));
    await A.tick(16.7, 220);
    const hudA = await A.page.evaluate(READ_HUD) as string;
    console.log('   HUD @ t=3000: ' + hudA);
    for (const [tok, label, unit] of [['theta', 'θ', 'rad'], ['alpha', 'α', 'rad/s²'], ['tau', 'τ', 'N·m'], ['W', 'W', 'J']] as Array<[string, string, string]>) {
        const re = new RegExp('(?:^|\\|)\\s*' + label + '\\s*=\\s*(\u2212?-?[0-9]+\\.[0-9]{2})\\s*' + unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const m = re.exec(hudA);
        check('row "' + tok + '" prints as ' + label + ' … ' + unit + ' at dp 2', !!m,
            m ? 'read "' + m[0].trim() + '"' : 'NOT FOUND in HUD');
    }
    // Rule 34c — the glyphs must be true Unicode, not ASCII stand-ins.
    check('glyphs are real Unicode (θ U+03B8, α U+03B1, τ U+03C4, · U+00B7, ² U+00B2)',
        hudA.includes('\u03b8') && hudA.includes('\u03b1') && hudA.includes('\u03c4')
        && hudA.includes('\u00b7') && hudA.includes('\u00b2'),
        'theta=' + hudA.includes('\u03b8') + ' alpha=' + hudA.includes('\u03b1') + ' tau=' + hudA.includes('\u03c4'));
    // Liveness: the values must be REAL, not zero-filled placeholders. Under a
    // 0.92 N·m brake engaged at 1500 ms, by t=3000 theta has accumulated, alpha
    // is negative, tau is the resolved brake torque and W is negative work.
    const num = (label: string) => {
        const m = new RegExp('(?:^|\\|)\\s*' + label + '\\s*=\\s*(\u2212?-?[0-9.]+)').exec(hudA);
        return m ? parseFloat(m[1].replace('\u2212', '-')) : NaN;
    };
    check('LIVENESS: theta has accumulated (> 0)', num('\u03b8') > 0, 'theta = ' + num('\u03b8'));
    check('LIVENESS: alpha is negative under a brake', num('\u03b1') < 0, 'alpha = ' + num('\u03b1'));
    check('LIVENESS: tau is non-zero while the brake is engaged', Math.abs(num('\u03c4')) > 0, 'tau = ' + num('\u03c4'));
    check('LIVENESS: W is negative (brake removes energy)', num('W') < 0, 'W = ' + num('W'));

    // ── 2. NEGATIVE CONTROL — the console gate must FIRE ─────────────────────
    console.log('\n=== 2. Is the [PM_RBR_TOKEN] gate LIVE? (negative control) ===');
    await A.page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_B' }, '*'));
    await A.tick(16.7, 60);
    const warns = A.console_.filter(l => l.includes('[PM_RBR_TOKEN]'));
    console.log('   ' + (warns.length ? warns.join('\n   ') : '(no [PM_RBR_TOKEN] lines)'));
    check('the gate FIRES on an unknown token', warns.length > 0, warns.length + ' warning(s)');
    check('the warning NAMES the offending token', warns.some(w => w.includes('definitely_not_a_real_token')));
    check('the warning carries the state id', warns.some(w => w.includes('STATE_B')));
    check('warned ONCE per token per state, not per frame', warns.length <= 2, warns.length + ' lines after ~60 frames');
    const hudB = await A.page.evaluate(READ_HUD) as string;
    console.log('   STATE_B HUD: ' + hudB);
    check('the KNOWN token still renders alongside the unknown one', /(?:^|\|)\s*L\s*=/.test(hudB), hudB);
    await A.page.close();

    // ── 3. The real concept must be SILENT — meaningful only after step 2 ────
    console.log('\n=== 3. The real concept: every authored token is known ===');
    const json = JSON.parse(fs.readFileSync(CONCEPT, 'utf-8')) as { field_3d_config?: Field3DConfig };
    if (!json.field_3d_config) throw new Error('no field_3d_config');
    const R = await open(assembleField3DHtml(json.field_3d_config), 'real.html');
    const states = Object.keys((json.field_3d_config as unknown as { states: Record<string, unknown> }).states);
    for (const s of states) {
        await R.page.evaluate(st => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
        await R.tick(16.7, 40);
    }
    const realWarns = R.console_.filter(l => l.includes('[PM_RBR_TOKEN]'));
    const realErrs = R.console_.filter(l => l.startsWith('error:') || l.startsWith('pageerror:'));
    console.log('   states walked: ' + states.join(', '));
    check('zero [PM_RBR_TOKEN] warnings across all ' + states.length + ' states', realWarns.length === 0,
        realWarns.slice(0, 5).join(' | '));
    check('zero console errors across all states', realErrs.length === 0, realErrs.slice(0, 3).join(' | '));
    await R.page.close();

    await browser.close();
    console.log('\n' + (failures === 0 ? '✅ E5 PROBE: ALL CHECKS PASSED' : '❌ ' + failures + ' CHECK(S) FAILED'));
    process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
