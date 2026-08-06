/**
 * SCRATCH — A-28 verification for Desk A (2026-08-07). Reads only; writes nothing.
 *
 * The architect's 0b skeleton for `rotational_work_energy` reports a CRITICAL:
 * rbrGridWalk composes W as a LEFT-Riemann sum (eng._w += tau * omega_k * h),
 * so the rendered W disagrees with the rendered change in KE by more than the
 * 0.01 J display quantum — which would block the quantitative form of the
 * concept's PRIMARY aha (W = ΔKE).
 *
 * It marked every figure "ASSUMPTION — probe-before-authoring" because they come
 * from a faithful RE-IMPLEMENTATION of the walk, not from the renderer. This
 * desk has burned four measurements this run on instruments that were wrong for
 * the question, so the claim is re-measured HERE on the real engine, reading the
 * RENDERED dp-2 strings a teacher actually sees — not engine internals, because
 * the claim is about what the screen shows.
 *
 * Liveness first (the E2 trap: byte-identical A/B proved dead-before-and-after):
 * the probe asserts KE genuinely falls and W genuinely accumulates before it
 * compares them. A ledger that closes because both sides are zero is not a pass.
 *
 * Run: npx tsx src/scripts/_scratch_rbr_a28_probe.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_rbr_a28');

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

// Contract apparatus, verbatim: r 0.80 · omega 1.50 · m 2.0 · I_frame 0.50 ·
// rod_half 1.00 · drum 0.55.  I = 0.50 + 2(2.0)(0.64) = 3.06 kg m^2, constant —
// no param_ramp anywhere, which is what makes W = dKE exact in principle.
const APPARATUS = {
    body_shape: 'turntable_rod', i_frame_kgm2: 0.50, rod_half_length_m: 1.00,
    brake_drum_radius_m: 0.55, rod_height_above_pad_m: 0.25, r_min_m: 0.15, r_max_m: 0.90,
};
const MASSES = { count: 2, mass_kg: 2.0, r_m: 0.80 };

function stateFor(tau: number) {
    return {
        label: 'tau ' + tau, caption: 'tau ' + tau,
        visible_elements: ['rbr_drum', 'rbr_rod'],
        rigid_body_rotation: {
            mode: 'fixed_axis', apparatus: APPARATUS, masses: MASSES,
            omega0_rad_s: 1.50, spin_sign: 1,
            external_torque: { source: 'brake', tau_brake_Nm: tau, engage_at_ms: 0, release_at_ms: 999999, pad_travel_ms: 1 },
            readouts: ['KE', 'W', 'theta', 'tau'],
        },
    };
}

const TAUS = [0.40, 0.50, 0.75, 1.00];
const CFG = {
    scenario_type: 'rigid_body_rotation',
    explorer_id: 'rbr_a28_probe',
    field_lines: { count: 0, color_positive: '#FF6B6B', color_negative: '#4ECDC4', opacity: 0, arrow_spacing: 0 },
    states: Object.fromEntries(TAUS.map((t, i) => ['STATE_' + (i + 1), stateFor(t)])),
} as unknown as Field3DConfig;

let failures = 0;
function check(label: string, ok: boolean, detail = '') {
    if (!ok) failures++;
    console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  — ' + detail : ''));
}

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const file = path.join(OUT, 'a28.html');
    fs.writeFileSync(file, assembleField3DHtml(CFG), 'utf8');

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
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

    // Read the RENDERED strings — the claim is about what a teacher reads, so
    // engine internals would be answering a different question.
    const READ = `(function () {
      var ro = document.getElementById('rbr_readout');
      return ro ? (ro.innerText || '').replace(/\\n/g, ' | ') : '';
    })()`;
    const parse = (hud: string, label: string): number => {
        const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const m = new RegExp('(?:^|\\|)\\s*' + esc + '\\s*=\\s*(\u2212?-?[0-9.]+)').exec(hud);
        return m ? parseFloat(m[1].replace('\u2212', '-')) : NaN;
    };

    async function sample(state: string, t: number) {
        await page.evaluate(() => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: null }, '*'));
        await page.evaluate(st => window.postMessage({ type: 'SET_STATE', state: st }, '*'), state);
        await tick(16.7, 8);
        await page.evaluate(at => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: at }, '*'), t);
        await tick(16.7, Math.ceil(t / 16.7) + 30);
        const hud = await page.evaluate(READ) as string;
        return { hud, KE: parse(hud, 'KE'), W: parse(hud, 'W'), theta: parse(hud, '\u03b8'), tau: parse(hud, '\u03c4') };
    }

    for (let i = 0; i < TAUS.length; i++) {
        const st = 'STATE_' + (i + 1), tau = TAUS[i];
        console.log('\n=== tau = %s N·m ===', tau.toFixed(2));
        // DIFFERENTIAL form, and deliberately so. A first attempt baselined KE at
        // t = 200 ms and compared it against W measured from t = 0 — by 200 ms the
        // brake has already done work, so the "residual" came out exactly equal to
        // |W(200)| and was entirely the probe's own offset, not the engine's bias.
        // Comparing CONSECUTIVE samples needs no baseline: over any interval the
        // work done must equal the energy change, whatever happened before it.
        // (It also sidesteps the known falsy-`at_ms: 0` pin, which free-runs to
        // ~1500 ms instead of holding at zero.)
        const t0 = await sample(st, 200);
        console.log('   t=  200  %s', t0.hud);
        let worst = 0, worstAt = 0, samples = 0, closed = 0;
        let lastKE = t0.KE, lastW = t0.W, keFell = false, wGrew = false;
        for (let t = 1000; t <= 8000; t += 1000) {
            const s = await sample(st, t);
            if (!Number.isFinite(s.KE) || !Number.isFinite(s.W)) continue;
            const dKE = s.KE - lastKE;          // rendered energy change over the step
            const dW = s.W - lastW;             // rendered work done over the same step
            const atRest = (s.KE === 0 && s.tau === 0);
            if (s.KE < lastKE - 1e-9) keFell = true;
            if (Math.abs(s.W) > Math.abs(lastW) + 1e-9) wGrew = true;
            lastKE = s.KE; lastW = s.W;
            if (atRest) {                        // past the rest clamp: nothing to compare
                console.log('   t=%5d  KE=%s  W=%s  (at rest — clamped, skipped)', t, s.KE.toFixed(2), s.W.toFixed(2));
                continue;
            }
            samples++;
            const ledger = Math.abs(dKE - dW);   // must be ~0: dKE = dW over the interval
            if (ledger <= 0.005) closed++;
            if (ledger > worst) { worst = ledger; worstAt = t; }
            const idty = Math.abs(Math.abs(s.W) - Math.abs(s.tau * s.theta));
            console.log('   t=' + String(t).padStart(5) + '  KE=' + s.KE.toFixed(2).padStart(6)
                + '  W=' + s.W.toFixed(2).padStart(7) + '  dKE=' + dKE.toFixed(2).padStart(6)
                + '  dW=' + dW.toFixed(2).padStart(6) + '   |dKE-dW|=' + ledger.toFixed(3)
                + '   ||W|-|tau*theta||=' + idty.toFixed(3));
        }
        // LIVENESS before comparison — a ledger that "closes" because nothing
        // moved is the E2 trap, not a result.
        check('tau=' + tau.toFixed(2) + ': KE genuinely falls (liveness)', keFell);
        check('tau=' + tau.toFixed(2) + ': W genuinely accumulates (liveness)', wGrew);
        console.log('   -> rendered ledger closed at %d of %d samples; worst residual %.3f J at t=%d',
            closed, samples, worst, worstAt);
        check('tau=' + tau.toFixed(2) + ': rendered dKE = dW over every interval, within half a display quantum',
            closed === samples, closed + '/' + samples + ' closed, worst ' + worst.toFixed(3) + ' J');
    }

    console.log('\nconsole errors: ' + (errors.length ? errors.slice(0, 5).join(' | ') : 'none'));
    await browser.close();
    console.log('\n' + (failures === 0
        ? 'A-28 NOT REPRODUCED on the real engine — the ledger closes as rendered.'
        : 'A-28 REPRODUCED on the real engine — ' + failures + ' check(s) failed.'));
}

main().catch(e => { console.error(e); process.exit(1); });
