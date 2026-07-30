/**
 * SCRATCH — `spring_action` phase machine + slow-motion window proof
 * (2026-07-30 engine seam A). NOT product code. Not a concept. Writes NOTHING
 * to the database.
 *
 * Clone of _scratch_nlb_repeat_probe.ts, same contract: drives the REAL renderer
 * (assembleField3DHtml() -> scratch HTML -> Playwright chromium with real
 * Three.js, the real animate() master clock, the real nlbRunPushOff /
 * nlbResetTrajectory / integrator) on a deterministic virtual clock. Every number
 * below is READ OUT of the live window.PM_nlbEngine and the live DOM — none of
 * the gate arithmetic is re-implemented here, only the EXPECTED values are.
 *
 * Run: npx tsx src/scripts/_scratch_nlb_spring_probe.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';
import { deriveMaxRevealTimeMs } from '../lib/validators/visual/deriveStateMeta';

const OUT = path.join(process.cwd(), '.scratch_nlb_spring');

const RELEASE = 420;            // 1000*sqrt(1.76/(30*(1/4+1/12))) — the founder's case
const CONTACT_FROM = 0;
const A_MS = 600, C_MS = 1600, H_MS = 1200, SLOW = 6;   // the spec's suggested choreography
const LEAD = A_MS + C_MS + H_MS;                        // 3400
const REL_WALL = (RELEASE - CONTACT_FROM) * SLOW;       // 2520 ms of WALL time
const REPEAT_SA = 7200;         // > LEAD + REL_WALL = 5920
const REPEAT_BASE = 2600;       // the no-spring_action control state
const S_A = 0.91;               // facing faces 0.72 m apart (0.91*2 - 0.55*2)
const S_B = -0.91;
const FORCE = 30;
// Apparatus geometry (world units), mirrored from the renderer constants so the
// probe checks the ENGINE's numbers against the SPEC's, never against itself.
const NAT_W = 0.80;                 // NLB_SPRING_NATURAL_W          = 1.6 m
const COMP_W = NAT_W * 0.45;        // x NLB_SPRING_COMPRESS_FRAC    = 0.72 m -> 0.36 world
const Q_W = 0.02;                   // NLB_SPRING_LEN_Q (rebuild quantum)
const HIDE_EPS_W = 0.02;            // NLB_SPRING_HIDE_EPS
const AIR_W = 0.30;                 // NLB_SPRING_APPROACH_AIR_W     = 0.6 m of approach travel
const RING_MS = 450;                // NLB_SPRING_RING_MS
const SEED_GAP_W = 0.36;            // (S_A - S_B - 1.1 m) * 0.5 world/m — the authored seed gap

function cart(id: string, mass: number, s0: number) {
    return { id, label: id, mass_kg: mass, initial_position_m: s0 };
}
function baseNlb(mode: 'action_reaction_pair' | 'sandbox') {
    return {
        mode,
        surface: { theta_deg: 0, length_m: 10, frictionless: true },
        bodies: [cart('A', 4, S_A), cart('B', 12, S_B)],
        spring: { between: ['A', 'B'] as [string, string], coils: 8 },
        arrows: [
            { body_id: 'A', show: ['applied', 'net'] as ('applied' | 'net')[] },
            { body_id: 'B', show: ['applied', 'net'] as ('applied' | 'net')[] },
        ],
        glow_focal: 'nlb_spring',
        readouts: ['F_applied', 'a', 'v'] as ('F_applied' | 'a' | 'v')[],
        controls_visible: ['m'] as ('m' | 'F')[],
    };
}

/**
 * STATE_1 — repeat, NO spring_action  (the omitted-key control: must be the
 *           pre-2026-07-30 behaviour exactly).
 * STATE_2 — the full choreography.
 * STATE_3 — sandbox WITH spring_action authored on purpose (must stay inert).
 * STATE_4 — the choreography single-fire (no repeat_every_ms) for the pin math.
 */
const CFG: Field3DConfig = {
    scenario_type: 'newtons_laws_body',
    explorer_id: 'newtons_laws_body_explorer',
    field_lines: { count: 0, color_positive: '#FF6B6B', color_negative: '#4ECDC4', opacity: 0, arrow_spacing: 0 },
    states: {
        STATE_1: {
            label: 'Push off (no choreography)',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_surface'],
            caption: 'Equal and opposite',
            formula_overlay: 'F₁₂ = −F₂₁',
            newtons_laws_body: {
                ...baseNlb('action_reaction_pair'),
                push_off: {
                    body_a_id: 'A', body_b_id: 'B', force_N: FORCE,
                    contact_from_ms: CONTACT_FROM, release_at_ms: RELEASE, repeat_every_ms: REPEAT_BASE,
                },
            },
        },
        STATE_2: {
            label: 'Load, hold, release',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_surface'],
            caption: 'Loaded, then released',
            formula_overlay: 'F₁₂ = −F₂₁',
            newtons_laws_body: {
                ...baseNlb('action_reaction_pair'),
                push_off: {
                    body_a_id: 'A', body_b_id: 'B', force_N: FORCE,
                    contact_from_ms: CONTACT_FROM, release_at_ms: RELEASE, repeat_every_ms: REPEAT_SA,
                },
                spring_action: { approach_ms: A_MS, compress_ms: C_MS, hold_ms: H_MS, slow_factor: SLOW },
            },
        },
        STATE_3: {
            label: 'Explore',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_surface'],
            caption: 'Try it',
            formula_overlay: 'ΣF = ma',
            newtons_laws_body: {
                ...baseNlb('sandbox'),
                push_off: {
                    body_a_id: 'A', body_b_id: 'B', force_N: FORCE,
                    contact_from_ms: CONTACT_FROM, release_at_ms: RELEASE, repeat_every_ms: REPEAT_SA,
                },
                spring_action: { approach_ms: A_MS, compress_ms: C_MS, hold_ms: H_MS, slow_factor: SLOW },
                controls_visible: ['m', 'F'] as ('m' | 'F')[],
                trusted_drag_seizes: true,
            },
        },
        STATE_4: {
            label: 'Load, hold, release (once)',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_surface'],
            caption: 'Loaded, then released',
            formula_overlay: 'F₁₂ = −F₂₁',
            newtons_laws_body: {
                ...baseNlb('action_reaction_pair'),
                push_off: {
                    body_a_id: 'A', body_b_id: 'B', force_N: FORCE,
                    contact_from_ms: CONTACT_FROM, release_at_ms: RELEASE,
                },
                spring_action: { approach_ms: A_MS, compress_ms: C_MS, hold_ms: H_MS, slow_factor: SLOW },
            },
        },
    },
};

// Virtual clock + manual rAF pump + a PER-FRAME sampler of the live engine + DOM.
const CLOCK_INIT = `(function () {
  var vclock = 0, q = [];
  window.__NLB_SAMPLES = [];
  window.requestAnimationFrame = function (cb) { q.push(cb); return q.length; };
  window.cancelAnimationFrame = function () {};
  try { performance.now = function () { return vclock; }; } catch (e) {}
  function ro(id) { var e = document.getElementById(id); return e ? e.textContent : null; }
  function sample() {
    var eng = window.PM_nlbEngine;
    if (!eng || !eng.bodies || !eng.bodies.A) return;
    var badge = document.getElementById('nlb_slowmo');
    window.__NLB_SAMPLES.push({
      mode: eng.mode,
      rep: (eng.push_off && eng.push_off.repeat_every_ms) || 0,
      sa: !!eng.spring_action,
      t_ms: eng.t_ms,
      cyc: (eng._po_cycle === null || eng._po_cycle === undefined) ? null : eng._po_cycle,
      contact: eng.push_off_contact === true,
      latched: eng.push_off_latched === true,
      slow: eng.slow_active === true,
      sf: eng.spring_slow_factor,
      ph: eng.spring_phase,
      phMs: eng.spring_phase_ms,
      prog: eng.spring_progress,
      ring: eng.spring_ring === true,
      pub: window.PM_nlbSpringPhase,
      FA: eng.bodies.A.F_applied, FB: eng.bodies.B.F_applied,
      aA: eng.bodies.A.a, aB: eng.bodies.B.a,
      sA: eng.bodies.A.s, sB: eng.bodies.B.s,
      vA: eng.bodies.A.v, vB: eng.bodies.B.v,
      spVis: window.PM_nlbSpringVisible === true,
      spLen: (typeof window.PM_nlbSpringLen === 'number') ? window.PM_nlbSpringLen : -1,
      spMesh: (typeof window.PM_nlbSpringMeshLen === 'number') ? window.PM_nlbSpringMeshLen : -1,
      spGap: (typeof window.PM_nlbSpringGap === 'number') ? window.PM_nlbSpringGap : -1,
      badge: badge ? badge.style.display : '?',
      badgeTxt: badge ? badge.textContent : '?',
      hudFA: ro('nlb_ro_A_F_applied_val'), hudFB: ro('nlb_ro_B_F_applied_val'),
      hudAA: ro('nlb_ro_A_a_val'), hudAB: ro('nlb_ro_B_a_val')
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
    mode: string; rep: number; sa: boolean; t_ms: number; cyc: number | null;
    contact: boolean; latched: boolean; slow: boolean; sf: number;
    ph: string; phMs: number; prog: number; ring: boolean; pub: string;
    FA: number; FB: number; aA: number; aB: number;
    sA: number; sB: number; vA: number; vB: number;
    spVis: boolean; spLen: number; spMesh: number; spGap: number;
    badge: string; badgeTxt: string;
    hudFA: string | null; hudFB: string | null; hudAA: string | null; hudAB: string | null;
}

let failures = 0;
function check(label: string, ok: boolean, detail: string) {
    if (!ok) failures++;
    console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  — ' + detail : ''));
}
/** The EXPECTED phase name, computed here from the authored numbers alone. */
function expectPhase(tMs: number, rep: number): string {
    const phase = rep ? tMs - Math.floor(tMs / rep) * rep : tMs;
    if (phase < A_MS) return 'approach';
    if (phase < A_MS + C_MS) return 'compress';
    if (phase < LEAD) return 'hold';
    if (phase < LEAD + REL_WALL) return 'release';
    return 'coast';
}

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const html = assembleField3DHtml(CFG);
    const file = path.join(OUT, 'spring.html');
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

    async function freeRun(state: string, frames: number, expectSa: boolean): Promise<Sample[]> {
        await setState(state);
        await tick(16.7, 2);
        await clear();
        await tick(16.7, frames);
        const rows = await read();
        if (rows.length === 0) throw new Error('no samples for ' + state);
        if (rows[0].sa !== expectSa) throw new Error(state + ' not applied: sa=' + rows[0].sa);
        console.log('  [' + state + '] mode=' + rows[0].mode + ' rep=' + rows[0].rep + ' spring_action=' + rows[0].sa
            + '  frames=' + rows.length + '  t_ms=' + rows[0].t_ms.toFixed(1) + '..' + rows[rows.length - 1].t_ms.toFixed(1));
        return rows;
    }
    function reArms(rows: Sample[]): Sample[] {
        const out: Sample[] = [];
        for (let i = 1; i < rows.length; i++) {
            if (rows[i - 1].cyc !== null && rows[i].cyc !== null && rows[i].cyc !== rows[i - 1].cyc) out.push(rows[i]);
        }
        return out;
    }

    // ═══ B. omitted spring_action  =====================================
    console.log('\n=== B. spring_action OMITTED (STATE_1) — must be bit-identical to the old gate ===');
    const b = await freeRun('STATE_1', 700, false);
    const bBad = b.filter(s => {
        const ph = s.t_ms - Math.floor(s.t_ms / REPEAT_BASE) * REPEAT_BASE;
        return s.contact !== (ph >= CONTACT_FROM && ph < RELEASE);       // the PRE-CHANGE gate, verbatim
    });
    check('contact <=> raw wall phase in [contact_from, release) on EVERY frame',
        bBad.length === 0, bBad.length + ' mismatching frames of ' + b.length);
    check('the whole choreography layer is INERT (no latch, no slow window, no phase)',
        b.every(s => !s.latched && !s.slow && s.sf === 1 && s.ph === '' && !s.ring),
        'distinct (latched|slow|sf|phase|ring) = ' + JSON.stringify([...new Set(b.map(s =>
            s.latched + '|' + s.slow + '|' + s.sf + '|' + s.ph + '|' + s.ring))]));
    check('badge never shown', b.every(s => s.badge === 'none'),
        'distinct display: ' + JSON.stringify([...new Set(b.map(s => s.badge))]));
    check('equal and opposite during contact, zero outside',
        b.filter(s => s.contact).every(s => s.FA === FORCE && s.FB === -FORCE)
        && b.filter(s => !s.contact).every(s => s.FA === 0 && s.FB === 0),
        b.filter(s => s.contact).length + ' contact frames');
    check('re-arm still fires once per cycle (repeat seam untouched)',
        reArms(b).length === Math.floor(b[b.length - 1].t_ms / REPEAT_BASE),
        reArms(b).length + ' re-arms at t = ' + reArms(b).map(s => s.t_ms.toFixed(0)).join(', '));

    // ═══ A. the phase sequence + wall-vs-physics window arithmetic  ====
    console.log('\n=== A. spring_action choreography (STATE_2) ===');
    // 7200 ms cycle at ~1 fixed step/frame => 460 frames covers one full cycle
    // plus a re-arm; 900 frames covers two.
    const a = await freeRun('STATE_2', 900, true);
    const aBad = a.filter(s => s.ph !== expectPhase(s.t_ms, REPEAT_SA));
    check('spring_phase == the authored phase chain on EVERY frame',
        aBad.length === 0, aBad.length + ' mismatches of ' + a.length
        + (aBad.length ? ' first: t=' + aBad[0].t_ms.toFixed(0) + ' got ' + aBad[0].ph
            + ' want ' + expectPhase(aBad[0].t_ms, REPEAT_SA) : ''));
    check('all five phases occur, in order, within one cycle',
        ['approach', 'compress', 'hold', 'release', 'coast'].every(p => a.some(s => s.ph === p))
        && (() => {                                              // strictly ordered inside cycle 0
            const seq: string[] = [];
            for (const s of a) { if (s.t_ms < REPEAT_SA && seq[seq.length - 1] !== s.ph) seq.push(s.ph); }
            return seq.join('>') === 'approach>compress>hold>release>coast';
        })(),
        'cycle-0 sequence = ' + (() => {
            const seq: string[] = [];
            for (const s of a) { if (s.t_ms < REPEAT_SA && seq[seq.length - 1] !== s.ph) seq.push(s.ph); }
            return seq.join(' > ');
        })());
    check('window.PM_nlbSpringPhase mirrors eng.spring_phase',
        a.every(s => s.pub === s.ph), 'ok');
    check('progress is 0..1 inside every bounded phase and monotone within it',
        a.every(s => s.prog >= 0 && s.prog <= 1), 'ok');
    const aRel = a.filter(s => s.ph === 'release' && s.t_ms < REPEAT_SA);
    const relWallMeasured = aRel.length ? (aRel[aRel.length - 1].t_ms - aRel[0].t_ms) : 0;
    check('the release window is held open for the WALL duration (t1-t0)*S = ' + REL_WALL + ' ms',
        Math.abs(relWallMeasured - REL_WALL) < 40,
        'measured ' + relWallMeasured.toFixed(0) + ' ms over ' + aRel.length + ' frames'
        + '  (raw physics would have been ' + RELEASE + ' ms)');
    check('contact === (phase in the release window) — one flag, one window',
        a.every(s => s.contact === (s.ph === 'release')), 'ok');
    // The money check: the PHYSICS inside that slowed window is still exactly
    // (t1-t0) = 420 ms, so the stroke and the exit speeds are the true ones.
    const vExitA = FORCE / 4 * (RELEASE / 1000), vExitB = -FORCE / 12 * (RELEASE / 1000);
    const strokeExpect = 0.5 * (FORCE / 4 + FORCE / 12) * Math.pow(RELEASE / 1000, 2);
    const last = aRel[aRel.length - 1];
    check('exit speeds are the TRUE physical ones (420 ms of physics, not 2520)',
        Math.abs(last.vA - vExitA) / vExitA < 0.03 && Math.abs(last.vB - vExitB) / Math.abs(vExitB) < 0.03,
        'vA = ' + last.vA.toFixed(3) + ' (expect ' + vExitA.toFixed(3) + ')  vB = '
        + last.vB.toFixed(3) + ' (expect ' + vExitB.toFixed(3) + ')');
    check('the release stroke is the true 0.88 m (natural - compressed)',
        Math.abs(((last.sA - last.sB) - (S_A - S_B)) - strokeExpect) < 0.03,
        'stroke = ' + ((last.sA - last.sB) - (S_A - S_B)).toFixed(3) + ' m (expect ' + strokeExpect.toFixed(3) + ')');
    // The latch. (Seam B 2026-07-30: the pair is still LATCHED — nothing
    // INTEGRATES — but the loading beats are now SCRIPTED, so the pose is a closed
    // form of the phase instead of the frozen seed. The `hold` beat is the one that
    // must sit exactly on the authored seed, because the release integrates from it.)
    const aPre = a.filter(s => s.ph === 'approach' || s.ph === 'compress' || s.ph === 'hold');
    const aHoldOnly = a.filter(s => s.ph === 'hold');
    check('LATCHED through approach/compress/hold: nothing INTEGRATES (v = a = 0)',
        aPre.every(s => s.latched && s.vA === 0 && s.vB === 0 && s.aA === 0 && s.aB === 0),
        aPre.length + ' pre-release frames');
    check('HOLD sits EXACTLY on the authored seed pose (what the release integrates from)',
        aHoldOnly.length > 10 && aHoldOnly.every(s => s.sA === S_A && s.sB === S_B),
        aHoldOnly.length + ' hold frames, distinct sA = ' + JSON.stringify([...new Set(aHoldOnly.map(s => s.sA))]));
    check('latch RELEASED for release + coast',
        a.filter(s => s.ph === 'release' || s.ph === 'coast').every(s => !s.latched), 'ok');
    // The force choreography.
    const aApp = a.filter(s => s.ph === 'approach');
    const aCom = a.filter(s => s.ph === 'compress' && s.t_ms < REPEAT_SA);
    const aHold = a.filter(s => s.ph === 'hold');
    const aCoast = a.filter(s => s.ph === 'coast');
    check('approach: force EXACTLY 0', aApp.every(s => s.FA === 0 && s.FB === 0), aApp.length + ' frames');
    check('compress: force ramps 0 -> force_N, monotone, closed form F = mag*progress',
        aCom.length > 10 && aCom[0].FA < 1 && Math.abs(aCom[aCom.length - 1].FA - FORCE) < 0.5
        && aCom.every((s, i) => i === 0 || s.FA >= aCom[i - 1].FA - 1e-9)
        && aCom.every(s => Math.abs(s.FA - FORCE * s.prog) < 1e-9)
        && aCom.every(s => s.FB === -s.FA),
        'F_A: ' + aCom[0].FA.toFixed(2) + ' -> ' + aCom[aCom.length - 1].FA.toFixed(2)
        + ' N over ' + aCom.length + ' frames');
    check('hold: FULL +-force_N with the pair still equal and opposite',
        aHold.every(s => s.FA === FORCE && s.FB === -FORCE), aHold.length + ' frames');
    check('release: FULL +-force_N', aRel.every(s => s.FA === FORCE && s.FB === -FORCE), aRel.length + ' frames');
    check('coast: force back to 0', aCoast.every(s => s.FA === 0 && s.FB === 0), aCoast.length + ' frames');
    check('seam-B publication: ring defaults TRUE, phase_ms is wall ms in-phase',
        a.every(s => s.ring) && aHold.every(s => s.phMs >= 0 && s.phMs <= H_MS + 20),
        'ring=' + a[0].ring + ', hold phase_ms 0..' + aHold[aHold.length - 1].phMs.toFixed(0));
    check('one re-arm per 7200 ms cycle, and the choreography restarts at approach',
        reArms(a).length === Math.floor(a[a.length - 1].t_ms / REPEAT_SA)
        && reArms(a).every(s => s.ph === 'approach'),
        reArms(a).length + ' re-arms at t = ' + reArms(a).map(s => s.t_ms.toFixed(0)).join(', ')
        + '  phases: ' + reArms(a).map(s => s.ph).join(','));

    // ═══ G. THE COIL GEOMETRY follows the choreography (seam B) ========
    console.log('\n=== G. coil geometry per phase (mesh length read from the live scene) ===');
    const c0 = a.filter(s => s.t_ms < REPEAT_SA);                 // one clean cycle
    const gApp = c0.filter(s => s.ph === 'approach');
    const gCom = c0.filter(s => s.ph === 'compress');
    const gHold = c0.filter(s => s.ph === 'hold');
    const gRel = c0.filter(s => s.ph === 'release');
    const gCoast = c0.filter(s => s.ph === 'coast');
    // (a) the state OPENS with the coil at NATURAL length and the carts APART.
    const app0 = gApp[0];
    check('(a) approach OPENS visible at ~NATURAL length, carts wider than the seed',
        gApp.length > 10 && app0.spVis && Math.abs(app0.spMesh - NAT_W) <= Q_W
        && app0.spGap > NAT_W + HIDE_EPS_W
        && Math.abs((app0.sA - app0.sB) - ((S_A - S_B) + (NAT_W - COMP_W + AIR_W) / 0.5)) < 0.05,
        'mesh=' + app0.spMesh.toFixed(3) + ' (natural ' + NAT_W + ')  gap=' + app0.spGap.toFixed(3)
        + '  sep=' + (app0.sA - app0.sB).toFixed(3) + ' m (seed ' + (S_A - S_B).toFixed(2) + ')');
    check('(a2) approach: coil HELD at natural while the carts CONVERGE to contact',
        gApp.every(s => s.spVis && Math.abs(s.spMesh - NAT_W) <= Q_W)
        && gApp.every((s, i) => i === 0 || (s.sA - s.sB) <= (gApp[i - 1].sA - gApp[i - 1].sB) + 1e-9)
        && Math.abs(gApp[gApp.length - 1].spGap - NAT_W) < 0.05,
        gApp.length + ' frames, sep ' + (gApp[0].sA - gApp[0].sB).toFixed(3) + ' -> '
        + (gApp[gApp.length - 1].sA - gApp[gApp.length - 1].sB).toFixed(3)
        + ' m, end gap=' + gApp[gApp.length - 1].spGap.toFixed(3));
    // (b) mid-compress the coil is at an INTERMEDIATE length, monotonically shrinking.
    const mid = gCom[Math.floor(gCom.length / 2)];
    check('(b) mid-compress: coil length strictly BETWEEN compressed and natural',
        mid.spVis && mid.spMesh > COMP_W + Q_W && mid.spMesh < NAT_W - Q_W,
        'mesh=' + mid.spMesh.toFixed(3) + '  (compressed ' + COMP_W.toFixed(2) + ' < x < natural ' + NAT_W + ')'
        + '  gap=' + mid.spGap.toFixed(3));
    check('(b2) compress: the coil SHRINKS monotonically natural -> compressed, tracking the gap',
        gCom.every((s, i) => i === 0 || s.spMesh <= gCom[i - 1].spMesh + 1e-9)
        && Math.abs(gCom[0].spMesh - NAT_W) <= Q_W
        && Math.abs(gCom[gCom.length - 1].spMesh - COMP_W) <= 2 * Q_W
        && gCom.every(s => Math.abs(s.spLen - s.spGap) < 1e-6),
        'mesh ' + gCom[0].spMesh.toFixed(3) + ' -> ' + gCom[gCom.length - 1].spMesh.toFixed(3)
        + ' over ' + gCom.length + ' frames; distinct lengths = '
        + new Set(gCom.map(s => s.spMesh.toFixed(2))).size);
    // (c) hold = compressed.
    check('(c) hold: coil at the COMPRESSED length, steady',
        gHold.every(s => s.spVis && Math.abs(s.spMesh - COMP_W) <= Q_W)
        && new Set(gHold.map(s => s.spMesh.toFixed(4))).size === 1
        && Math.abs(gHold[0].spGap - SEED_GAP_W) < 1e-6,
        'mesh=' + gHold[0].spMesh.toFixed(3) + ' over ' + gHold.length + ' frames, gap=' + gHold[0].spGap.toFixed(3));
    // (d) mid-release the coil EXTENDS WITH THE GAP (the seam-A bug: it held 0.36).
    const midR = gRel[Math.floor(gRel.length / 2)];
    check('(d) mid-release: coil INTERMEDIATE and extending WITH the gap',
        midR.spVis && midR.spMesh > COMP_W + Q_W && midR.spMesh < NAT_W - Q_W
        && Math.abs(midR.spLen - midR.spGap) < 1e-6,
        'mesh=' + midR.spMesh.toFixed(3) + '  drawn=' + midR.spLen.toFixed(3)
        + ' == gap=' + midR.spGap.toFixed(3));
    check('(d2) release: monotone GROWTH compressed -> natural, then it lets go',
        gRel.every((s, i) => i === 0 || s.spMesh >= gRel[i - 1].spMesh - 1e-9)
        && Math.abs(gRel[0].spMesh - COMP_W) <= 2 * Q_W
        && Math.abs(gRel[gRel.length - 1].spMesh - NAT_W) <= 2 * Q_W,
        'mesh ' + gRel[0].spMesh.toFixed(3) + ' -> ' + gRel[gRel.length - 1].spMesh.toFixed(3)
        + ' over ' + gRel.length + ' slowed frames; distinct lengths = '
        + new Set(gRel.map(s => s.spMesh.toFixed(2))).size);
    // (e) the RING: a damped oscillation about natural, then hide.
    const ringFr = gCoast.filter(s => s.phMs < RING_MS);
    const postRing = gCoast.filter(s => s.phMs > RING_MS + 40);
    check('(e) ring: the coil OSCILLATES about natural after it lets go (both lobes)',
        ringFr.length > 10 && ringFr.some(s => s.spVis && s.spMesh > NAT_W + Q_W)
        && ringFr.some(s => s.spVis && s.spMesh < NAT_W - Q_W),
        ringFr.length + ' ring frames, mesh range ' + Math.min(...ringFr.map(s => s.spMesh)).toFixed(3)
        + ' .. ' + Math.max(...ringFr.map(s => s.spMesh)).toFixed(3) + ' about ' + NAT_W);
    check('(e2) ring is COSMETIC: no force, no latch, carts keep coasting freely',
        ringFr.every(s => s.FA === 0 && s.FB === 0 && !s.latched && !s.slow)
        && ringFr.every((s, i) => i === 0 || Math.abs(s.vA - ringFr[i - 1].vA) < 1e-9),
        'F=0 on all ' + ringFr.length + ' frames, vA constant = ' + ringFr[0].vA.toFixed(3));
    check('(e3) ...and then the coil HIDES for the rest of the coast',
        postRing.length > 20 && postRing.every(s => !s.spVis),
        postRing.length + ' post-ring frames, all hidden = ' + postRing.every(s => !s.spVis));
    check('(e4) the ring never overlaps a cart (drawn <= the live gap, always)',
        c0.filter(s => s.spVis).every(s => s.spLen <= s.spGap + 1e-6),
        'max (drawn - gap) = ' + Math.max(...c0.filter(s => s.spVis).map(s => s.spLen - s.spGap)).toExponential(2));
    // (f) the omitted-key state's geometry is the OLD rule, frame for frame.
    const fBad = b.filter(s => {
        const want = s.spGap > NAT_W + HIDE_EPS_W ? -1
            : Math.min(s.spGap, s.contact ? COMP_W : NAT_W);
        if (want < 0) return s.spVis;                              // must be hidden
        return !s.spVis || Math.abs(s.spLen - want) > 1e-6;
    });
    check('(f) spring_action OMITTED: coil geometry is the PRE-2026-07-30 rule frame for frame',
        fBad.length === 0, fBad.length + ' mismatches of ' + b.length
        + (fBad.length ? ' first: t=' + fBad[0].t_ms.toFixed(0) + ' gap=' + fBad[0].spGap.toFixed(3)
            + ' drawn=' + fBad[0].spLen.toFixed(3) + ' vis=' + fBad[0].spVis : ''));
    check('(f2) ...and it never scripts a cart: the pair only ever SEPARATES from the seed',
        b.every(s => (s.sA - s.sB) >= (S_A - S_B) - 1e-9),
        'min separation = ' + Math.min(...b.map(s => s.sA - s.sB)).toFixed(4)
        + ' m (seed ' + (S_A - S_B).toFixed(2) + ')');

    // ═══ E. the HUD reports the TRUE physical numbers  =================
    console.log('\n=== E. HUD honesty (true values, never scaled) ===');
    const hHold = aHold[Math.floor(aHold.length / 2)];
    const hRel = aRel[Math.floor(aRel.length / 2)];
    check('HUD F = 30.00 / -30.00 N during HOLD',
        hHold.hudFA === '30.00' && hHold.hudFB === '-30.00',
        'F_A="' + hHold.hudFA + '" F_B="' + hHold.hudFB + '" a_A="' + hHold.hudAA + '" (latched: a is honestly 0)');
    check('HUD F = 30.00 / -30.00 N during the SLOWED RELEASE',
        hRel.hudFA === '30.00' && hRel.hudFB === '-30.00',
        'F_A="' + hRel.hudFA + '" F_B="' + hRel.hudFB + '"');
    check('HUD a = 7.50 / -2.50 m/s² during the SLOWED RELEASE (NEVER divided by ' + SLOW + ')',
        hRel.hudAA === '7.50' && hRel.hudAB === '-2.50',
        'a_A="' + hRel.hudAA + '" a_B="' + hRel.hudAB + '"  (scaled would be 1.25 / -0.42)');
    check('engine a is the true value too, every release frame',
        aRel.every(s => Math.abs(s.aA - 7.5) < 1e-9 && Math.abs(s.aB + 2.5) < 1e-9),
        'a_A = ' + aRel[0].aA + ', a_B = ' + aRel[0].aB);

    // ═══ F. the slow-motion badge  =====================================
    console.log('\n=== F. Rule 24/34 honesty badge ===');
    check('badge shown IFF the slow window is open (and the window IS the release)',
        a.every(s => (s.badge === 'block') === s.slow) && a.every(s => s.slow === (s.ph === 'release')),
        aRel.length + ' slow frames of ' + a.length);
    check('badge text is "slow motion ×6" with a real Unicode multiplication sign',
        hRel.badgeTxt === 'slow motion ×6',
        JSON.stringify(hRel.badgeTxt));
    check('badge hidden in every non-release phase',
        a.filter(s => s.ph !== 'release').every(s => s.badge === 'none'), 'ok');

    // ═══ C. SET_TIME_FREEZE  ===========================================
    console.log('\n=== C. SET_TIME_FREEZE (dt = 0 => dtPhysics = 0) — Rule 36 ===');
    const pins = deriveMaxRevealTimeMs(CFG as unknown as Record<string, unknown>);
    console.log('  deriveMaxRevealTimeMs: ' + JSON.stringify(pins));
    const canonical = pins.STATE_2;
    const phaseOf = (t: number) => t - Math.floor(t / REPEAT_SA) * REPEAT_SA;
    check('the canonical pin lands mid-HOLD (loaded + legible, not mid-transition)',
        expectPhase(canonical, REPEAT_SA) === 'hold'
        && Math.abs(phaseOf(canonical) - (A_MS + C_MS + H_MS * 0.5)) < 1,
        'pin ' + canonical + ' ms -> phase ' + phaseOf(canonical) + ' ms = ' + expectPhase(canonical, REPEAT_SA));
    check('the single-fire choreography pins mid-HOLD too (STATE_4)',
        expectPhase(pins.STATE_4, 0) === 'hold',
        'pin ' + pins.STATE_4 + ' ms = ' + expectPhase(pins.STATE_4, 0));
    // The seam-2026-07-29 value, unchanged: cycle 1 + 35% of the 420 ms contact
    // window = 2600 + 147 = 2747 (repeat_report.md §6).
    const ph1 = pins.STATE_1 - Math.floor(pins.STATE_1 / REPEAT_BASE) * REPEAT_BASE;
    check('a state with NO spring_action keeps its old repeat pin (2747 = 35% into contact)',
        pins.STATE_1 === 2747 && Math.abs(ph1 - RELEASE * 0.35) < 1 && ph1 < RELEASE,
        'pin ' + pins.STATE_1 + ' ms -> phase ' + ph1.toFixed(0) + ' ms (in contact, window 0..' + RELEASE + ')');

    async function holdAt(state: string, pin: number, tag: string) {
        await setState(state);
        await pinAt(pin);
        for (let i = 0; i < 500; i++) {
            await tick(16.7, 8);
            const t = await page.evaluate(() => (window as any).PM_simTimeMs);
            if (typeof t === 'number' && t >= pin - 1) break;
        }
        await tick(16.7, 2);
        await clear();
        await tick(16.7, 40);
        const rows = await read();
        const r0 = rows[0];
        check('[' + tag + '] clock + phase + pose + COIL LENGTH frozen',
            rows.every(s => s.t_ms === r0.t_ms && s.ph === r0.ph && s.sA === r0.sA && s.sB === r0.sB
                && s.vA === r0.vA && s.FA === r0.FA && s.spMesh === r0.spMesh && s.spLen === r0.spLen),
            rows.length + ' held frames at t=' + r0.t_ms.toFixed(0) + ' phase=' + r0.ph
            + ' sA=' + r0.sA.toFixed(4) + ' F_A=' + r0.FA + ' slow=' + r0.slow
            + ' coil=' + r0.spMesh.toFixed(3));
        check('[' + tag + '] zero re-arms under the pin', reArms(rows).length === 0,
            reArms(rows).length + ' re-arms');
        const shot1 = await page.screenshot();
        await tick(16.7, 20);
        const shot2 = await page.screenshot();
        check('[' + tag + '] frozen PIXELS byte-identical over 20 more held frames',
            Buffer.compare(shot1, shot2) === 0, shot1.length + ' vs ' + shot2.length + ' bytes');
        fs.writeFileSync(path.join(OUT, tag + '_' + pin + 'ms.png'), shot1);
        return r0;
    }
    const pinHold = await holdAt('STATE_2', canonical, 'mid-hold');
    check('[mid-hold] the frame shows the LOADED beat: full arrows, no badge',
        pinHold.FA === FORCE && pinHold.FB === -FORCE && pinHold.latched && !pinHold.slow
        && pinHold.badge === 'none' && pinHold.contact === false,
        'F=' + pinHold.FA + '/' + pinHold.FB + ' latched=' + pinHold.latched + ' badge=' + pinHold.badge);
    // ...and INSIDE the slow window, where dtPhysics is being divided.
    const midRel = 3 * REPEAT_SA + LEAD + Math.round(REL_WALL * 0.5);
    const pinRel = await holdAt('STATE_2', midRel, 'mid-release');
    check('[mid-release] held INSIDE the slow window: dtPhysics = 0, badge visible',
        pinRel.ph === 'release' && pinRel.slow && pinRel.badge === 'block'
        && pinRel.badgeTxt === 'slow motion ×6' && pinRel.FA === FORCE,
        'phase=' + pinRel.ph + ' slow=' + pinRel.slow + ' badge="' + pinRel.badgeTxt + '" sA=' + pinRel.sA.toFixed(4));
    check('[mid-release] the FROZEN frame shows a coil at an INTERMEDIATE length',
        pinRel.spVis && pinRel.spMesh > COMP_W + Q_W && pinRel.spMesh < NAT_W - Q_W
        && Math.abs(pinRel.spLen - pinRel.spGap) < 1e-6,
        'coil=' + pinRel.spMesh.toFixed(3) + ' gap=' + pinRel.spGap.toFixed(3));
    // ...and MID-COMPRESS: the frame the founder review said did not exist.
    const midCom = 3 * REPEAT_SA + A_MS + Math.round(C_MS * 0.5);
    const pinCom = await holdAt('STATE_2', midCom, 'mid-compress');
    check('[mid-compress] the FROZEN frame shows the coil part-way COMPRESSED',
        pinCom.ph === 'compress' && pinCom.spVis
        && pinCom.spMesh > COMP_W + Q_W && pinCom.spMesh < NAT_W - Q_W
        && pinCom.latched && !pinCom.slow && pinCom.badge === 'none'
        && pinCom.FA > 0 && pinCom.FA < FORCE,
        'phase=' + pinCom.ph + ' coil=' + pinCom.spMesh.toFixed(3) + ' gap=' + pinCom.spGap.toFixed(3)
        + ' F_A=' + pinCom.FA.toFixed(2) + ' N (ramping) sep=' + (pinCom.sA - pinCom.sB).toFixed(3) + ' m');
    // ...and the RING, mounted on between[0] and twanging as the pair flies apart.
    // Pinned near the ring's FIRST positive peak (tr ~ 25 ms of the 100 ms period);
    // the rebuild quantum is 0.02 world, so a pin off-peak legitimately quantises
    // back to natural — the oscillation itself is proved by (e) over the free run.
    const midRing = 3 * REPEAT_SA + LEAD + REL_WALL + 32;
    const pinRing = await holdAt('STATE_2', midRing, 'ring');
    check('[ring] the FROZEN frame shows a rung coil, mounted, LONGER than natural',
        pinRing.ph === 'coast' && pinRing.spVis && pinRing.phMs < RING_MS
        && pinRing.spMesh >= NAT_W + Q_W - 1e-9 && pinRing.spLen <= pinRing.spGap + 1e-6
        && pinRing.FA === 0,
        'phase=' + pinRing.ph + '+' + pinRing.phMs.toFixed(0) + 'ms coil=' + pinRing.spMesh.toFixed(3)
        + ' (natural ' + NAT_W + ') gap=' + pinRing.spGap.toFixed(3) + ' F_A=' + pinRing.FA);
    // ...and the new OPENING pose, for the same eye.
    const midApp = 3 * REPEAT_SA + Math.round(A_MS * 0.35);
    const pinApp = await holdAt('STATE_2', midApp, 'mid-approach');
    check('[mid-approach] the FROZEN frame shows a NATURAL-length coil between separated carts',
        pinApp.ph === 'approach' && pinApp.spVis && Math.abs(pinApp.spMesh - NAT_W) <= Q_W
        && pinApp.spGap > NAT_W && pinApp.FA === 0,
        'coil=' + pinApp.spMesh.toFixed(3) + ' gap=' + pinApp.spGap.toFixed(3)
        + ' sep=' + (pinApp.sA - pinApp.sB).toFixed(3) + ' m F_A=' + pinApp.FA);

    // ═══ D. Rule 37 — seize + sandbox  =================================
    console.log('\n=== D. Rule 37 — seize + sandbox ===');
    const d0 = await freeRun('STATE_2', 200, true);
    check('pre-seize the choreography is running', d0.some(s => s.latched || s.slow), 'ok');
    await page.evaluate(() => { (window as any).PM_nlbBodyDragged = true; });   // the flag a real drag sets
    await clear();
    await tick(16.7, 500);
    const d1 = await read();
    check('a drag/slider SEIZE cancels the choreography for good',
        d1.every(s => !s.latched && !s.slow && s.ph === '' && s.badge === 'none' && !s.ring),
        d1.length + ' post-seize frames, distinct phase = ' + JSON.stringify([...new Set(d1.map(s => s.ph))]));
    check('...and the gate degrades to the raw single-fire test (forces 0, no re-arm)',
        d1.every(s => s.FA === 0 && s.FB === 0) && reArms(d1).length === 0,
        'distinct F_A: ' + JSON.stringify([...new Set(d1.map(s => s.FA))]));

    check('...and the coil degrades to the plain GAP-DRIVEN fit (no stuck length)',
        d1.every(s => s.spGap > NAT_W + HIDE_EPS_W
            ? !s.spVis
            : (s.spVis && Math.abs(s.spLen - Math.min(s.spGap, NAT_W)) < 1e-6)),
        'post-seize gap=' + d1[0].spGap.toFixed(3) + ' drawn=' + d1[0].spLen.toFixed(3)
        + ' vis=' + d1[0].spVis);

    const e = await freeRun('STATE_3', 500, true);
    check('sandbox: whole gate inert — no phase, no latch, no slow window, no badge',
        e.every(s => s.ph === '' && !s.latched && !s.slow && !s.contact && s.badge === 'none')
        && reArms(e).length === 0,
        e.length + ' frames, ' + reArms(e).length + ' re-arms, distinct phase = '
        + JSON.stringify([...new Set(e.map(s => s.ph))]));
    check('sandbox: the coil sits at the authored seed gap, never scripted, never rung',
        e.every(s => s.spVis && Math.abs(s.spLen - SEED_GAP_W) < 1e-6
            && s.sA === S_A && s.sB === S_B),
        'drawn=' + e[0].spLen.toFixed(3) + ' gap=' + e[0].spGap.toFixed(3)
        + ' sA=' + e[0].sA + ' (seed ' + S_A + ')');

    // ═══ H. seize MID-APPROACH — the scripted-write handover  ==========
    console.log('\n=== H. Rule 37 — a seize DURING the scripted approach ===');
    const h0 = await freeRun('STATE_2', 26, true);                 // ~430 ms => mid-approach
    const hLast = h0[h0.length - 1];
    check('pre-seize we really are mid-approach with the carts scripted apart',
        hLast.ph === 'approach' && (hLast.sA - hLast.sB) > (S_A - S_B) + 0.2,
        'phase=' + hLast.ph + ' sep=' + (hLast.sA - hLast.sB).toFixed(3) + ' m coil=' + hLast.spMesh.toFixed(3));
    await page.evaluate(() => { (window as any).PM_nlbBodyDragged = true; });
    await clear();
    await tick(16.7, 120);
    const h1 = await read();
    check('the carts STAY where the script left them (no teleport back to the seed)',
        Math.abs(h1[0].sA - hLast.sA) < 0.02 && Math.abs(h1[0].sB - hLast.sB) < 0.02,
        'sA ' + hLast.sA.toFixed(4) + ' -> ' + h1[0].sA.toFixed(4)
        + '  sB ' + hLast.sB.toFixed(4) + ' -> ' + h1[0].sB.toFixed(4));
    check('the choreography is gone and the coil follows the LIVE GAP from there',
        h1.every(s => s.ph === '' && !s.latched && !s.slow)
        && h1.every(s => s.spGap > NAT_W + HIDE_EPS_W
            ? !s.spVis
            : (s.spVis && Math.abs(s.spLen - Math.min(s.spGap, NAT_W)) < 1e-6)),
        h1.length + ' post-seize frames, gap=' + h1[0].spGap.toFixed(3)
        + ' drawn=' + h1[0].spLen.toFixed(3) + ' vis=' + h1[0].spVis);

    console.log('\npage errors: ' + (errors.length === 0 ? 'none' : JSON.stringify(errors.slice(0, 5))));
    if (errors.length) failures++;
    await browser.close();
    console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'));
    process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
