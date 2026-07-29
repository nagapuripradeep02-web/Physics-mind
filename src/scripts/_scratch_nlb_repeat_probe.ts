/**
 * SCRATCH — push_off `repeat_every_ms` proof (2026-07-29 engine seam).
 * NOT product code. Not a concept. Writes NOTHING to the database.
 *
 * Drives the REAL renderer, exactly like _scratch_nlb_bringup.ts:
 * assembleField3DHtml() -> scratch HTML -> Playwright chromium (real Three.js,
 * real animate() master clock, real nlbRunPushOff / nlbResetTrajectory) on a
 * deterministic virtual clock. Every number below is READ OUT of the live
 * window.PM_nlbEngine — none of the gate arithmetic is re-implemented here.
 *
 * Run: npx tsx src/scripts/_scratch_nlb_repeat_probe.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_nlb_repeat');

const RELEASE = 420;      // 1000*sqrt(1.76/(30*(1/4+1/12))) — the founder's case
const REPEAT = 2600;
const S_A = 0.91;         // facing faces 0.72 m apart (0.91*2 - 0.55*2)
const S_B = -0.91;

function cart(id: string, mass: number, s0: number) {
    return { id, label: id, mass_kg: mass, initial_position_m: s0 };
}

/** STATE_1 single-fire (repeat OMITTED), STATE_2 repeating, STATE_3 sandbox. */
const CFG: Field3DConfig = {
    scenario_type: 'newtons_laws_body',
    explorer_id: 'newtons_laws_body_explorer',
    field_lines: { count: 0, color_positive: '#FF6B6B', color_negative: '#4ECDC4', opacity: 0, arrow_spacing: 0 },
    states: {
        STATE_1: {
            label: 'Push off once',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_surface'],
            caption: 'Equal and opposite',
            formula_overlay: 'F₁₂ = −F₂₁',
            newtons_laws_body: {
                mode: 'action_reaction_pair',
                surface: { theta_deg: 0, length_m: 6, frictionless: true },
                bodies: [cart('A', 4, S_A), cart('B', 12, S_B)],
                push_off: { body_a_id: 'A', body_b_id: 'B', force_N: 30, contact_from_ms: 0, release_at_ms: RELEASE },
                spring: { between: ['A', 'B'], coils: 8 },
                arrows: [
                    { body_id: 'A', show: ['applied', 'net'] },
                    { body_id: 'B', show: ['applied', 'net'] },
                ],
                glow_focal: 'nlb_spring',
                readouts: ['F_applied', 'a', 'v'],
                controls_visible: ['m'],
            },
        },
        STATE_2: {
            label: 'Push off, again and again',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_surface'],
            caption: 'The demo repeats',
            formula_overlay: 'F₁₂ = −F₂₁',
            newtons_laws_body: {
                mode: 'action_reaction_pair',
                surface: { theta_deg: 0, length_m: 6, frictionless: true },
                bodies: [cart('A', 4, S_A), cart('B', 12, S_B)],
                push_off: {
                    body_a_id: 'A', body_b_id: 'B', force_N: 30,
                    contact_from_ms: 0, release_at_ms: RELEASE, repeat_every_ms: REPEAT,
                },
                spring: { between: ['A', 'B'], coils: 8 },
                arrows: [
                    { body_id: 'A', show: ['applied', 'net'] },
                    { body_id: 'B', show: ['applied', 'net'] },
                ],
                glow_focal: 'nlb_spring',
                readouts: ['F_applied', 'a', 'v'],
                controls_visible: ['m'],
            },
        },
        STATE_3: {
            label: 'Explore',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_surface'],
            caption: 'Try it',
            formula_overlay: 'ΣF = ma',
            newtons_laws_body: {
                mode: 'sandbox',
                surface: { theta_deg: 0, length_m: 6, frictionless: true },
                bodies: [cart('A', 4, S_A), cart('B', 12, S_B)],
                // repeat AUTHORED in a sandbox on purpose: the whole gate must stay inert.
                push_off: {
                    body_a_id: 'A', body_b_id: 'B', force_N: 30,
                    contact_from_ms: 0, release_at_ms: RELEASE, repeat_every_ms: REPEAT,
                },
                spring: { between: ['A', 'B'], coils: 8, compressed: true },
                arrows: [{ body_id: 'A', show: ['applied', 'net'] }],
                glow_focal: 'nlb_body_A',
                readouts: ['F_applied', 'a', 'v'],
                controls_visible: ['m', 'F'],
                trusted_drag_seizes: true,
            },
        },
    },
};

// Virtual clock + manual rAF pump + a PER-FRAME sampler of the live engine.
const CLOCK_INIT = `(function () {
  var vclock = 0, q = [];
  window.__NLB_SAMPLES = [];
  window.requestAnimationFrame = function (cb) { q.push(cb); return q.length; };
  window.cancelAnimationFrame = function () {};
  try { performance.now = function () { return vclock; }; } catch (e) {}
  function sample() {
    var eng = window.PM_nlbEngine;
    if (!eng || !eng.bodies || !eng.bodies.A) return;
    window.__NLB_SAMPLES.push({
      // PM_currentState is a renderer CLOSURE var, not a window global, so the
      // state is identified by engine fields the state itself seeded.
      mode: eng.mode,
      rep: (eng.push_off && eng.push_off.repeat_every_ms) || 0,
      t_ms: eng.t_ms,
      cyc: (eng._po_cycle === null || eng._po_cycle === undefined) ? null : eng._po_cycle,
      contact: eng.push_off_contact === true,
      FA: eng.bodies.A.F_applied, FB: eng.bodies.B.F_applied,
      sA: eng.bodies.A.s, sB: eng.bodies.B.s,
      vA: eng.bodies.A.v
    });
  }
  window.__NLB_TICK = function (dtMs, n) {
    var count = n || 1;
    for (var k = 0; k < count; k++) {
      vclock += dtMs;
      var cur = q; q = [];
      for (var i = 0; i < cur.length; i++) {
        try { cur[i](vclock); } catch (e) { window.__NLB_TICK_ERR = String(e && e.message || e); }
      }
      sample();
    }
    return vclock;
  };
})()`;

interface Sample {
    mode: string; rep: number; t_ms: number; cyc: number | null; contact: boolean;
    FA: number; FB: number; sA: number; sB: number; vA: number;
}

let failures = 0;
function check(label: string, ok: boolean, detail: string) {
    if (!ok) failures++;
    console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  — ' + detail : ''));
}

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const html = assembleField3DHtml(CFG);
    const file = path.join(OUT, 'repeat.html');
    fs.writeFileSync(file, html, 'utf8');

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.addInitScript(CLOCK_INIT);
    await page.goto('file:///' + file.replace(/\\/g, '/'));
    await page.waitForFunction('typeof window.__NLB_TICK === "function"', null, { timeout: 20000, polling: 100 });
    const tick = (dtMs: number, n = 1) => page.evaluate(
        ([d, k]) => (window as any).__NLB_TICK(d, k), [dtMs, n] as [number, number]);
    for (let i = 0; i < 40; i++) {
        await tick(16.7, 4);
        const ok = await page.evaluate(() => typeof (window as any).PM_nlbEngine !== 'undefined');
        if (ok) break;
        await page.waitForTimeout(100);
    }
    const setState = (s: string) => page.evaluate(
        st => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
    const pinAt = (ms: number) => page.evaluate(
        at => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: at }, '*'), ms);
    const clear = () => page.evaluate(() => { (window as any).__NLB_SAMPLES = []; });
    const read = (): Promise<Sample[]> => page.evaluate(() => (window as any).__NLB_SAMPLES);

    // ── free-run an ~11 s state on the 60 Hz virtual clock ──────────────────
    async function freeRun(state: string, expectRep: number, expectMode: string): Promise<Sample[]> {
        await setState(state);
        await tick(16.7, 2);
        await clear();
        await tick(16.7, 700);                 // ~11.7 s of sim time, 1 fixed step/frame
        const rows = await read();
        if (rows.length === 0) throw new Error('no samples for ' + state);
        if (rows[0].rep !== expectRep || rows[0].mode !== expectMode) {
            throw new Error(state + ' not applied: mode=' + rows[0].mode + ' rep=' + rows[0].rep);
        }
        console.log('  [' + state + '] mode=' + rows[0].mode + ' repeat_every_ms=' + rows[0].rep
            + '  frames=' + rows.length + '  t_ms=' + rows[0].t_ms.toFixed(1)
            + '..' + rows[rows.length - 1].t_ms.toFixed(1));
        return rows;
    }

    function reArms(rows: Sample[]): Sample[] {
        const out: Sample[] = [];
        for (let i = 1; i < rows.length; i++) {
            if (rows[i - 1].cyc !== null && rows[i].cyc !== null && rows[i].cyc !== rows[i - 1].cyc) out.push(rows[i]);
        }
        return out;
    }

    console.log('\n=== A. repeat_every_ms OMITTED (STATE_1) — must be single-fire ===');
    const a = await freeRun('STATE_1', 0, 'action_reaction_pair');
    const aContact = a.filter(s => s.contact);
    const aExpect = a.filter(s => s.t_ms >= 0 && s.t_ms < RELEASE);   // the PRE-CHANGE gate, verbatim
    check('gate identical to raw-clock `t>=0 && t<release`',
        aContact.length === aExpect.length && aContact.every((s, i) => s.t_ms === aExpect[i].t_ms),
        aContact.length + ' contact frames, expected ' + aExpect.length);
    check('contact window is ONE unbroken run',
        aContact.length > 0 && aContact[aContact.length - 1].t_ms === aExpect[aExpect.length - 1].t_ms,
        't = ' + aContact[0].t_ms.toFixed(1) + ' .. ' + aContact[aContact.length - 1].t_ms.toFixed(1) + ' ms');
    check('no re-arm ever fires', reArms(a).length === 0, reArms(a).length + ' re-arms');
    check('cycle memo stays null (repeat branch not entered)',
        a.every(s => s.cyc === null), 'distinct cyc values: ' + JSON.stringify([...new Set(a.map(s => s.cyc))]));
    check('equal and opposite during contact',
        aContact.every(s => s.FA === 30 && s.FB === -30), 'F_A/F_B = ' + aContact[0].FA + '/' + aContact[0].FB);
    check('DEAD ZONE reproduced after release (the founder bug)',
        a.filter(s => s.t_ms > RELEASE).every(s => s.FA === 0 && s.FB === 0),
        (a.filter(s => s.t_ms > RELEASE).length) + ' frames with both forces 0 out of ' + a.length);
    const aLast = a[a.length - 1];
    console.log('        tail frame: t=' + aLast.t_ms.toFixed(0) + 'ms  F_A=' + aLast.FA
        + '  sA=' + aLast.sA.toFixed(2) + '  sB=' + aLast.sB.toFixed(2)
        + '  (' + (100 * a.filter(s => !s.contact).length / a.length).toFixed(1) + '% of the state empty)');

    console.log('\n=== B. repeat_every_ms = ' + REPEAT + ' (STATE_2) ===');
    const b = await freeRun('STATE_2', REPEAT, 'action_reaction_pair');
    const bBad = b.filter(s => s.contact !== ((s.t_ms - Math.floor(s.t_ms / REPEAT) * REPEAT) >= 0
        && (s.t_ms - Math.floor(s.t_ms / REPEAT) * REPEAT) < RELEASE));
    check('contact <=> phase in [contact_from, release) on EVERY frame',
        bBad.length === 0, bBad.length + ' mismatching frames of ' + b.length);
    const bArms = reArms(b);
    const expectedArms = Math.floor(b[b.length - 1].t_ms / REPEAT);
    check('re-arm fires EXACTLY once per cycle boundary',
        bArms.length === expectedArms, bArms.length + ' re-arms, expected ' + expectedArms
        + ' at t = ' + bArms.map(s => s.t_ms.toFixed(0)).join(', ') + ' ms');
    check('every re-arm lands in the first frame of its cycle',
        bArms.every(s => (s.t_ms - Math.floor(s.t_ms / REPEAT) * REPEAT) < 17),
        'phases: ' + bArms.map(s => (s.t_ms - Math.floor(s.t_ms / REPEAT) * REPEAT).toFixed(1)).join(', ') + ' ms');
    // The sample is taken at the END of the re-arm frame, i.e. AFTER the rewind
    // AND after that same frame's integrator step under the re-applied contact
    // force (one 0.016 s step: v = a*dt = 0.12 m/s for the 4 kg cart). So the
    // proof of the rewind is "back within one step of the seed, from metres away
    // on the previous frame", not an exact seed match.
    const bArmPrev = bArms.map(s => b[b.indexOf(s) - 1]);
    check('every re-arm rewinds s/v to the authored seed (+1 step of contact)',
        bArms.every(s => Math.abs(s.sA - S_A) < 0.01 && Math.abs(s.sB - S_B) < 0.01 && Math.abs(s.vA) < 0.2),
        'sA/sB/vA at re-arms: ' + bArms.map(s => s.sA.toFixed(4) + '/' + s.sB.toFixed(4) + '/' + s.vA.toFixed(3)).join('  '));
    check('...and the frame BEFORE each re-arm was far downrange (so it really rewound)',
        bArmPrev.every(s => !!s && Math.abs(s.sA) > 2),
        'previous-frame sA: ' + bArmPrev.map(s => s ? s.sA.toFixed(2) : '?').join(', ') + ' m');
    check('clock stays MONOTONIC across every re-arm',
        b.every((s, i) => i === 0 || s.t_ms >= b[i - 1].t_ms),
        't: ' + b[0].t_ms.toFixed(0) + ' .. ' + b[b.length - 1].t_ms.toFixed(0) + ' ms, ' + b.length + ' frames');
    check('no dead zone: contact recurs in the state tail',
        b.filter(s => s.t_ms > 6000 && s.contact).length > 0,
        b.filter(s => s.contact).length + ' contact frames spread over the state ('
        + (100 * b.filter(s => s.contact).length / b.length).toFixed(1) + '%)');
    check('carts always separate FROM the home pose (never drift away for good)',
        Math.max(...b.map(s => Math.abs(s.sA))) < 12 && bArms.length > 0,
        'max |sA| = ' + Math.max(...b.map(s => Math.abs(s.sA))).toFixed(2) + ' m');

    console.log('\n=== C. SET_TIME_FREEZE (dt = 0) — Rule 36 ===');
    // Pin mid-contact of cycle 2 (the deriveStateMeta pin class: 2*2600 + 147).
    const PIN = 2 * REPEAT + Math.round(RELEASE * 0.35);
    await setState('STATE_2');
    await pinAt(PIN);
    for (let i = 0; i < 400; i++) {
        await tick(16.7, 8);
        const t = await page.evaluate(() => (window as any).PM_simTimeMs);
        if (typeof t === 'number' && t >= PIN - 1) break;   // PM_simTimeMs is in ms
    }
    await tick(16.7, 2);
    await clear();
    await tick(16.7, 40);                       // 40 frames held AT the pin
    const c = await read();
    const c0 = c[0];
    check('t_ms frozen', c.every(s => s.t_ms === c0.t_ms),
        c.length + ' held frames, distinct t_ms = ' + JSON.stringify([...new Set(c.map(s => s.t_ms))]));
    check('cycle + phase frozen', c.every(s => s.cyc === c0.cyc), 'cycle = ' + c0.cyc);
    check('ZERO re-arms under the pin', reArms(c).length === 0, reArms(c).length + ' re-arms in ' + c.length + ' frames');
    check('force + positions bit-identical', c.every(s => s.FA === c0.FA && s.FB === c0.FB && s.sA === c0.sA && s.sB === c0.sB),
        'F_A=' + c0.FA + ' F_B=' + c0.FB + ' distinct sA = ' + JSON.stringify([...new Set(c.map(s => s.sA))]));
    check('the PIN LANDS IN CONTACT (spring compressed, both arrows drawn)',
        c0.contact === true && c0.FA !== 0, 'pin ' + PIN + ' ms -> contact=' + c0.contact + ', F_A=' + c0.FA);
    const shot1 = await page.screenshot();
    await tick(16.7, 20);
    const shot2 = await page.screenshot();
    check('frozen PIXELS byte-identical over 20 more held frames', Buffer.compare(shot1, shot2) === 0,
        shot1.length + ' vs ' + shot2.length + ' bytes');
    fs.writeFileSync(path.join(OUT, 'pin_' + PIN + 'ms.png'), shot1);

    console.log('\n=== D. Rule 37 — seize + sandbox ===');
    const d0 = await freeRun('STATE_2', REPEAT, 'action_reaction_pair');
    const armsBefore = reArms(d0).length;
    await page.evaluate(() => { (window as any).PM_nlbBodyDragged = true; });   // the flag a real drag sets
    await clear();
    await tick(16.7, 400);
    const d1 = await read();
    check('a drag/slider SEIZE stops the repeat for good (armsBefore=' + armsBefore + ')',
        reArms(d1).length === 0, reArms(d1).length + ' re-arms in ' + d1.length + ' post-seize frames');
    check('after the seize the gate degrades to single-fire (forces stay 0, no phase push)',
        d1.every(s => s.FA === 0 && s.FB === 0), 'distinct F_A: ' + JSON.stringify([...new Set(d1.map(s => s.FA))]));

    await setState('STATE_3');
    await tick(16.7, 3);
    await clear();
    await tick(16.7, 400);
    const e = await read();
    check('sandbox: gate inert, no re-arm, contact never set',
        reArms(e).length === 0 && e.every(s => !s.contact),
        e.length + ' frames, ' + reArms(e).length + ' re-arms');

    console.log('\npage errors: ' + (errors.length === 0 ? 'none' : JSON.stringify(errors.slice(0, 5))));
    if (errors.length) failures++;
    await browser.close();
    console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'));
    process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
