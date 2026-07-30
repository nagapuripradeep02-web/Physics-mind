/**
 * SCRATCH probe — rolling_friction STATE_5 "sandbox stall" triage (2026-07-30).
 *
 * eye-walker reported: from t=5000 ms onward both bodies read v = 0.00 while the
 * idle sweep drives F up to 45 N, far above the block's 19.6 N break-away, and
 * they never move again. Severity was proposed CRITICAL.
 *
 * The question this probe answers, which frames CANNOT: is that a physics freeze
 * (a real bug) or a body pinned against the END OF THE TRACK (the documented
 * finite-track limit, where F pushes it into a wall and no force can help)?
 *
 * Method: drive the real renderer, read s/v/a AND the bound, then write s back
 * up-track — the same thing a teacher's trusted drag does — and see whether
 * motion resumes. THE EYE cannot fire trusted events, which is exactly why
 * eye-walker could not settle this itself.
 *
 * Run: npx tsx src/scripts/_scratch_rf_s5_probe.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_rf_probe');
const THREE_TAG =
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" crossorigin="anonymous"></script>';
const CLOCK_INIT = `(function () {
  var vclock = 0, q = [];
  window.requestAnimationFrame = function (cb) { q.push(cb); return q.length; };
  window.cancelAnimationFrame = function () {};
  try { performance.now = function () { return vclock; }; } catch (e) {}
  window.__NLB_TICK = function (dtMs, n) {
    var count = n || 1;
    for (var k = 0; k < count; k++) {
      vclock += dtMs;
      var cur = q; q = [];
      for (var i = 0; i < cur.length; i++) {
        try { cur[i](vclock); } catch (e) { window.__NLB_TICK_ERR = String(e && e.message || e); }
      }
    }
    return vclock;
  };
})()`;

(async () => {
    const raw = JSON.parse(fs.readFileSync(
        path.join(process.cwd(), 'src', 'data', 'concepts', 'rolling_friction.json'), 'utf8'));
    const config = raw.field_3d_config as Field3DConfig;

    fs.mkdirSync(OUT, { recursive: true });
    const html = assembleField3DHtml(config);
    const file = path.join(OUT, 'rf.html');
    fs.writeFileSync(file, html, 'utf8');

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.addInitScript(CLOCK_INIT);
    await page.goto('file:///' + file.replace(/\\/g, '/'));
    await page.waitForFunction('typeof window.__NLB_TICK === "function"', null, { timeout: 20000, polling: 100 });
    const tick = (dtMs: number, n = 1) => page.evaluate(
        ([d, k]) => (window as any).__NLB_TICK(d, k), [dtMs, n] as [number, number]);
    for (let i = 0; i < 40; i++) {
        await tick(16.7, 4);
        if (await page.evaluate(() => typeof (window as any).PM_nlbEngine !== 'undefined')) break;
        await page.waitForTimeout(100);
    }

    const read = () => page.evaluate(() => {
        const eng = (window as any).PM_nlbEngine;
        const o: any = { t_ms: eng.t_ms, len: eng.length_m, bodies: {} };
        for (const id of eng.order) {
            const b = eng.bodies[id];
            o.bodies[id] = {
                s: b.s, v: b.v, a: b.a, F: b.F_applied, mu_s: b.mu_s, N: b.N,
                maxStat: b.mu_s * b.N, boundLatch: !!b._boundArrestedSliding,
            };
        }
        return o;
    });

    await page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_5' }, '*'));
    await tick(16.7, 5);

    console.log('\n=== STATE_5 timeline (s = position m, bound = ±length_m) ===');
    const marks = [1000, 2000, 3000, 4000, 6000, 8000, 11000];
    let last: any = null;
    for (const target of marks) {
        while (true) {
            const r = await read();
            if (r.t_ms >= target - 20) { last = r; break; }
            await tick(16.7, 3);
        }
        const row = Object.entries(last.bodies).map(([id, b]: [string, any]) =>
            `${id}: s=${b.s.toFixed(3)} v=${b.v.toFixed(3)} a=${b.a.toFixed(3)} F=${b.F.toFixed(1)} maxStat=${b.maxStat.toFixed(2)}`
        ).join('  |  ');
        console.log(`t=${String(Math.round(last.t_ms)).padStart(6)}ms  len=${last.len}  ${row}`);
    }

    // Is every halted body sitting exactly ON its bound?
    const atBound = Object.entries(last.bodies).every(([, b]: [string, any]) =>
        Math.abs(Math.abs(b.s) - last.len) < 1e-6 || Math.abs(b.v) > 1e-6);
    console.log('\nHALT CAUSE: every stopped body sits exactly on the track bound? ' + atBound);

    // The recovery test: put the bodies back up-track (what a teacher's drag does)
    // and see whether the physics re-engages. If it does, the "stall" is a finite
    // track, not a dead integrator.
    await page.evaluate(() => {
        const eng = (window as any).PM_nlbEngine;
        for (const id of eng.order) { eng.bodies[id].s = -5; }
    });
    await tick(16.7, 30);
    const after = await read();
    const moved = Object.entries(after.bodies).map(([id, b]: [string, any]) =>
        `${id}: s=${b.s.toFixed(3)} v=${b.v.toFixed(3)} a=${b.a.toFixed(3)}`).join('  |  ');
    console.log('AFTER repositioning to s=-5 and 30 frames:  ' + moved);
    const resumed = Object.values(after.bodies).some((b: any) => Math.abs(b.v) > 1e-3);
    console.log('\nVERDICT: motion resumes after repositioning? ' + resumed);
    console.log(resumed
        ? '  => FINITE TRACK, not a dead integrator. The halt is the end of the run;\n'
        + '     a teacher drag (trusted_drag_seizes) or a state replay re-runs it.\n'
        + '     THE EYE cannot fire trusted events, so it could not see this path.'
        : '  => GENUINE FREEZE: the integrator does not re-engage even from a legal\n'
        + '     position. This would be a real engine defect.');
    if (errs.length) console.log('page errors:', errs.slice(0, 5));
    await browser.close();
})();
