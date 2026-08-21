/**
 * SCRATCH — E1 + E4 verification probe for Desk A (2026-08-05).
 * NOT product code. Writes NOTHING to the database. Reads only.
 *
 * Why this exists: ENGINE_LANDING_NOTICE §1 asks each desk to re-verify sealed
 * work by diffing its own earlier EYE frames. On this concept that is NOT
 * executable — the turntable spins continuously and the capture is not
 * phase-locked, so two runs with NO change between them differ by up to 3.1% of
 * canvas (measured: STATE_2 28,524 px, STATE_7 27,421 px). The run-to-run noise
 * floor swamps any plausible signal, so pixels cannot answer whether E4 changed
 * this concept's physics.
 *
 * Numbers can. E4 rewrote `rbrLAt` from an unconditional subtraction into a
 * breakpoint walk over per-source engaged windows, and moved the rest clamp from
 * the integrator onto the `brake` KIND. This concept authors brake-only torque
 * (S5) and no `sources[]`, no `applied_torque_Nm`, no omega0 = 0 — so E4's claim
 * for it is "byte-identical". This probe tests exactly that claim against the
 * invariants founder-proxy established at the previous Checkpoint B:
 *
 *   - every torque-free state holds L EXACTLY 4.59 at every sampled t
 *     (founder-proxy was explicit: 4.59, not 4.5899)
 *   - S3's ω lands exactly on its authored prediction 1.50
 *   - S5's braked state holds the quadruple I 3.06 / ω 0.75 / L 2.29 / KE 0.86
 *   - S2/S4/S7's ramps hold at `to` and never re-approach `from`
 *
 * Run:  npx tsx src/scripts/_scratch_rbr_e4_probe.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_rbr_e4');
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

let failures = 0;
function check(label: string, ok: boolean, detail = '') {
    if (!ok) failures++;
    console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  — ' + detail : ''));
}

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const json = JSON.parse(fs.readFileSync(CONCEPT, 'utf-8')) as { field_3d_config?: Field3DConfig };
    if (!json.field_3d_config) throw new Error('no field_3d_config');

    const html = assembleField3DHtml(json.field_3d_config);
    const file = path.join(OUT, 'rbr.html');
    fs.writeFileSync(file, html, 'utf8');

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

    const setState = (s: string) => page.evaluate(st => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
    const pinAt = (ms: number) => page.evaluate(at => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: at }, '*'), ms);

    // Read the ENGINE's own state, at full precision — not the rendered digits,
    // which are rounded to 2 dp and would hide exactly the ULP drift a
    // breakpoint-walk rewrite could introduce.
    // The engine object stores only PRIMITIVES (m, r, omega0, iFrame, tau…).
    // I / omega / L / KE are computed per frame by rbrIAt / rbrOmegaAt / rbrLAt,
    // so reading `eng.L` yields undefined -> NaN. Call the renderer's OWN
    // accessors at the pinned instant — the same functions the frame loop and
    // the HUD use, so the probe cannot diverge from what is drawn. The HUD text
    // is captured alongside as an independent cross-check at 2 dp.
    const READ = `(function () {
      var e = window.PM_rbrEngine || {};
      var ro = document.getElementById('rbr_readout');
      var t = e.t_ms;
      var have = (typeof rbrLAt === 'function');
      return {
        t: t, r: have ? rbrRAt(t) : e.r, tau: e.tau,
        accessors: have,
        hud: ro ? (ro.innerText || '').replace(/\\n/g, ' | ') : ''
      };
    })()`;

    // The accessors are NOT global (the renderer body is IIFE-wrapped), so read
    // the live HUD instead — RBR_RO_META renders I / ω / L / KE / dL/dt / F at
    // 2 dp. That is the instrument a teacher actually reads, and it is the same
    // instrument founder-proxy's "L is exactly 4.59" reading came off. 2 dp
    // cannot prove ULP-identity, so this probe tests the PHYSICS invariants
    // (constant L, the braked quadruple, monotonic decay) rather than
    // bit-equality — and says so rather than overclaiming.
    const parseHud = (hud: string): Record<string, number> => {
        const out: Record<string, number> = {};
        for (const [key, label] of [['I', 'I'], ['omega', 'ω'], ['L', 'L'], ['KE', 'KE'], ['dLdt', 'dL/dt'], ['F', 'F']] as Array<[string, string]>) {
            // Anchor on the row label followed by '=' so 'L' does not match
            // inside 'dL/dt' and 'I' does not match inside a unit string.
            const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const m = new RegExp('(?:^|\\|)\\s*' + esc + '\\s*=\\s*(\u2212?-?[0-9.]+)').exec(hud);
            if (m) out[key] = parseFloat(m[1].replace('\u2212', '-'));
        }
        return out;
    };

    async function sample(state: string, t: number) {
        await setState(state);
        await tick(16.7, 10);
        await pinAt(t);
        await tick(16.7, Math.ceil(t / 16.7) + 30);
        const raw = await page.evaluate(READ) as Record<string, number | string>;
        const hud = parseHud(String(raw.hud || ''));
        return { ...raw, ...hud } as Record<string, number | string>;
    }

    // ── 1. Torque-free states hold L EXACTLY 4.59 ────────────────────────────
    // Every guided state except S3 (which re-seeds at r = 0.20) and S5 (braked)
    // is seeded at the contract home pose, so L = I(0.80)·1.50 = 3.06·1.50.
    console.log('\n=== 1. E4 regression: L in every TORQUE-FREE state ===');
    const L0 = 4.59;
    for (const st of ['STATE_1', 'STATE_2', 'STATE_4', 'STATE_6', 'STATE_7']) {
        const rows: Array<Record<string, number | string>> = [];
        for (const t of [0, 1000, 3000, 6000, 9000]) rows.push(await sample(st, t));
        for (const r of rows) {
            console.log('   %s t=%s  L=%s  I=%s  omega=%s  tau=%s',
                st, String(r.t), Number(r.L).toFixed(2), Number(r.I).toFixed(6),
                Number(r.omega).toFixed(6), Number(r.tau).toFixed(6));
        }
        // A row that has not been REVEALED yet is absent from the HUD by design
        // (Rule 25 / readout_at_ms — a quantity is printed only after the
        // sentence that defines it; STATE_1 authors I@2000, omega@2800, L@3600).
        // Sampling before that instant yields no L row, which is correct
        // behaviour, not a defect — so those samples are N/A, never a FAIL.
        const measurable = rows.filter(r => Number.isFinite(Number(r.L)));
        const skipped = rows.length - measurable.length;
        if (skipped) console.log('   (%d/%d samples before the L row is revealed — N/A by design, not counted)',
            skipped, rows.length);
        // S6 reverses spin, so compare |L|.
        const worst = measurable.length
            ? Math.max(...measurable.map(r => Math.abs(Math.abs(Number(r.L)) - L0)))
            : NaN;
        check(st + ': |L| holds 4.59 wherever the row is revealed (' + measurable.length + ' samples)',
            measurable.length > 0 && worst < 0.005,
            measurable.length ? 'worst deviation ' + worst.toExponential(3) : 'NO measurable sample');
    }

    // ── 2. S3's prediction still lands exactly ───────────────────────────────
    console.log('\n=== 2. S3 lands on its authored prediction ===');
    const s3 = await sample('STATE_3', 8000);
    console.log('   S3 t=8000  r=%s  I=%s  omega=%s  L=%s',
        Number(s3.r).toFixed(6), Number(s3.I).toFixed(6), Number(s3.omega).toFixed(2), Number(s3.L).toFixed(2));
    check('S3: omega lands on the authored prediction 1.50', Math.abs(Number(s3.omega) - 1.5) < 0.005,
        'omega = ' + Number(s3.omega).toFixed(2));
    check('S3: L equals 4.59 after the ramp', Math.abs(Number(s3.L) - L0) < 0.005,
        'L = ' + Number(s3.L).toFixed(2));

    // ── 3. THE E4 CLAIM UNDER TEST: brake byte-identical ─────────────────────
    // S5 is the only braked state. founder-proxy recorded its held quadruple.
    console.log('\n=== 3. E4 claim: the BRAKE path is unchanged (S5) ===');
    const expect = { I: 3.06, omega: 0.75, L: 2.29, KE: 0.86 };
    const s5rows: Array<Record<string, number | string>> = [];
    for (const t of [0, 1000, 2000, 3000, 4000, 6000, 9000]) s5rows.push(await sample('STATE_5', t));
    for (const r of s5rows) {
        console.log('   S5 t=%s  L=%s  omega=%s  KE=%s  tau=%s',
            String(r.t), Number(r.L).toFixed(9), Number(r.omega).toFixed(9),
            Number(r.KE).toFixed(9), Number(r.tau).toFixed(6));
    }
    const held = s5rows[s5rows.length - 1];
    check('S5: held I = 3.06', Math.abs(Number(held.I) - expect.I) < 0.005, 'I = ' + Number(held.I).toFixed(6));
    check('S5: held omega = 0.75', Math.abs(Number(held.omega) - expect.omega) < 0.005, 'omega = ' + Number(held.omega).toFixed(6));
    check('S5: held L = 2.29', Math.abs(Number(held.L) - expect.L) < 0.005, 'L = ' + Number(held.L).toFixed(6));
    check('S5: held KE = 0.86', Math.abs(Number(held.KE) - expect.KE) < 0.005, 'KE = ' + Number(held.KE).toFixed(6));
    // The rest clamp is now a property of the `brake` kind — it must still clamp
    // at zero and never drive the body backwards.
    const neg = s5rows.filter(r => Number(r.omega) < -1e-9);
    check('S5: the brake never reverses the body (rest clamp intact)', neg.length === 0,
        neg.length ? 'negative omega at t=' + neg.map(r => r.t).join(',') : '');

    // ── 4. Monotonic decay: L must fall, never rise, under a brake ───────────
    const Ls = s5rows.map(r => Math.abs(Number(r.L)));
    let mono = true;
    for (let i = 1; i < Ls.length; i++) if (Ls[i] > Ls[i - 1] + 1e-9) mono = false;
    check('S5: |L| is non-increasing under the brake', mono, Ls.map(v => v.toFixed(4)).join(' -> '));

    // ── 5. Ramped states hold at `to` and never return to `from` ────────────
    console.log('\n=== 5. Ramps hold at `to` (open scar: authored_beat_ends_by_undoing_the_state_own_claim) ===');
    for (const [st, to] of [['STATE_2', 0.20], ['STATE_3', 0.80], ['STATE_4', 0.20], ['STATE_7', 0.20]] as Array<[string, number]>) {
        const late = await sample(st, 20000);
        console.log('   %s t=20000  r=%s (authored to = %s)', st, Number(late.r).toFixed(6), to.toFixed(2));
        check(st + ': holds at ramp `to` 20 s past end', Math.abs(Number(late.r) - to) < 1e-6,
            'r = ' + Number(late.r).toFixed(9));
    }

    console.log('\n=== console/page errors ===');
    console.log(errors.length ? errors.slice(0, 8).join('\n') : '  (none)');
    check('no page or console errors', errors.length === 0, errors.slice(0, 2).join(' | '));

    await browser.close();
    console.log('\n' + (failures === 0 ? '✅ E1/E4 PROBE: ALL CHECKS PASSED' : '❌ ' + failures + ' CHECK(S) FAILED'));
    process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
