/**
 * SCRATCH — WALL-ANCHORED spring proof (2026-07-30, bug_class
 * `nlb_spring_coil_slides_bodily_instead_of_staying_anchored_to_the_fixed_wall_face`).
 * NOT product code. Not a concept. Writes NOTHING to the database.
 *
 * Same contract as _scratch_nlb_spring_probe.ts: drives the REAL assembled
 * renderer (assembleField3DHtml -> scratch HTML -> Playwright chromium, real
 * Three.js, real animate() master clock, real nlbRunPushOff / integrator) on a
 * deterministic virtual clock, and reads every number OUT of the live window.
 *
 *   STATE_W  cart vs a `fixed` WALL, full spring_action choreography.
 *   STATE_C  two FREE carts, identical to the seam-A probe's STATE_2 — the
 *            bit-identity control.
 *
 * Run twice to prove control bit-identity:
 *   NLB_BASELINE=1 npx tsx src/scripts/_scratch_nlb_wall_spring_probe.ts   (renderer stashed)
 *   npx tsx src/scripts/_scratch_nlb_wall_spring_probe.ts                  (renderer fixed)
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_nlb_wall');
const BASELINE = process.env.NLB_BASELINE === '1';
const CTRL_JSON = path.join(OUT, 'control_samples' + (BASELINE ? '.baseline' : '') + '.json');
const CTRL_BASE = path.join(OUT, 'control_samples.baseline.json');

const A_MS = 600, C_MS = 1600, H_MS = 1200, SLOW = 6;
const LEAD = A_MS + C_MS + H_MS;                 // 3400
const FORCE = 30;

// ── the WALL case ────────────────────────────────────────────────────────
// push_off_report.md §2: |s_a - s_b| = 0.72 + 0.55 (cart half) + 0.275 (slab
// half) = 1.545 m, cart on the +s side. release = 1000*sqrt(2*0.88/(F/m_cart)).
const W_CART_M = 4;
const S_CART = 0.7725, S_WALL = -0.7725;
const REL_W = Math.round(1000 * Math.sqrt(1.76 / (FORCE * (1 / W_CART_M))));   // 484 ms
const RELW_WALL = REL_W * SLOW;                  // 2904 ms of wall time
const REPEAT_W = 7200;

// ── the two-free-cart CONTROL (seam-A probe numbers, verbatim) ───────────
const REL_C = 420, S_A = 0.91, S_B = -0.91, REPEAT_C = 7200;

// apparatus constants mirrored from the renderer (spec numbers, not self-checks)
const NAT_W = 0.80, COMP_W = NAT_W * 0.45, Q_W = 0.02, HIDE_EPS_W = 0.02;
const AIR_W = 0.30, RING_MS = 450;
const WALL_HALF_W = 0.55 * 0.5 / 2;              // NLB_WALL_T/2 = 0.1375 world = 0.275 m
const CART_HALF_W = 0.55 / 2;                    // NLB_BODY_SIZE/2 = 0.275 world = 0.55 m

function cart(id: string, mass: number, s0: number) {
    return { id, label: id, mass_kg: mass, initial_position_m: s0 };
}
const CFG: Field3DConfig = {
    scenario_type: 'newtons_laws_body',
    explorer_id: 'newtons_laws_body_explorer',
    field_lines: { count: 0, color_positive: '#FF6B6B', color_negative: '#4ECDC4', opacity: 0, arrow_spacing: 0 },
    states: {
        STATE_W: {
            label: 'Cart pushes off a wall',
            visible_elements: ['nlb_body_C', 'nlb_body_W', 'nlb_surface'],
            caption: 'Wall pushes back',
            formula_overlay: 'F₁₂ = −F₂₁',
            newtons_laws_body: {
                mode: 'action_reaction_pair',
                surface: { theta_deg: 0, length_m: 10, frictionless: true },
                bodies: [
                    cart('C', W_CART_M, S_CART),
                    { id: 'W', label: 'Wall', mass_kg: 1000, initial_position_m: S_WALL, fixed: true },
                ],
                spring: { between: ['C', 'W'] as [string, string], coils: 8 },
                arrows: [
                    { body_id: 'C', show: ['applied', 'net'] as ('applied' | 'net')[] },
                    { body_id: 'W', show: ['applied'] as ('applied')[] },
                ],
                glow_focal: 'nlb_spring',
                readouts: ['F_applied', 'a'] as ('F_applied' | 'a')[],
                controls_visible: ['m'] as ('m' | 'F')[],
                push_off: {
                    body_a_id: 'C', body_b_id: 'W', force_N: FORCE,
                    contact_from_ms: 0, release_at_ms: REL_W, repeat_every_ms: REPEAT_W,
                },
                spring_action: { approach_ms: A_MS, compress_ms: C_MS, hold_ms: H_MS, slow_factor: SLOW },
            },
        },
        STATE_C: {
            label: 'Two carts (control)',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_surface'],
            caption: 'Loaded, then released',
            formula_overlay: 'F₁₂ = −F₂₁',
            newtons_laws_body: {
                mode: 'action_reaction_pair',
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
                push_off: {
                    body_a_id: 'A', body_b_id: 'B', force_N: FORCE,
                    contact_from_ms: 0, release_at_ms: REL_C, repeat_every_ms: REPEAT_C,
                },
                spring_action: { approach_ms: A_MS, compress_ms: C_MS, hold_ms: H_MS, slow_factor: SLOW },
            },
        },
    },
};

const CLOCK_INIT = `(function () {
  var vclock = 0, q = [];
  window.__NLB_SAMPLES = [];
  window.requestAnimationFrame = function (cb) { q.push(cb); return q.length; };
  window.cancelAnimationFrame = function () {};
  try { performance.now = function () { return vclock; }; } catch (e) {}
  function v3(o) { return o ? { x: o.x, y: o.y, z: o.z } : null; }
  function sample() {
    var eng = window.PM_nlbEngine;
    if (!eng || !eng.bodies) return;
    var ids = Object.keys(eng.bodies);
    var b0 = eng.bodies[ids[0]], b1 = eng.bodies[ids[1]];
    if (!b0 || !b1) return;
    window.__NLB_SAMPLES.push({
      ids: ids.join(','),
      t_ms: eng.t_ms,
      cyc: (eng._po_cycle === null || eng._po_cycle === undefined) ? null : eng._po_cycle,
      ph: eng.spring_phase, phMs: eng.spring_phase_ms,
      contact: eng.push_off_contact === true, latched: eng.push_off_latched === true,
      slow: eng.slow_active === true,
      s0: b0.s, s1: b1.s, v0: b0.v, v1: b1.v, a0: b0.a, a1: b1.a,
      F0: b0.F_applied, F1: b1.F_applied,
      spVis: window.PM_nlbSpringVisible === true,
      spLen: (typeof window.PM_nlbSpringLen === 'number') ? window.PM_nlbSpringLen : -1,
      spMesh: (typeof window.PM_nlbSpringMeshLen === 'number') ? window.PM_nlbSpringMeshLen : -1,
      spGap: (typeof window.PM_nlbSpringGap === 'number') ? window.PM_nlbSpringGap : -1,
      anchor: (typeof window.PM_nlbSpringAnchor === 'string') ? window.PM_nlbSpringAnchor : '?',
      end0: v3(window.PM_nlbSpringEnd0), end1: v3(window.PM_nlbSpringEnd1),
      face0: v3(window.PM_nlbSpringFace0), face1: v3(window.PM_nlbSpringFace1)
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

interface V3 { x: number; y: number; z: number }
interface Sample {
    ids: string; t_ms: number; cyc: number | null;
    ph: string; phMs: number; contact: boolean; latched: boolean; slow: boolean;
    s0: number; s1: number; v0: number; v1: number; a0: number; a1: number;
    F0: number; F1: number;
    spVis: boolean; spLen: number; spMesh: number; spGap: number;
    anchor: string; end0: V3 | null; end1: V3 | null; face0: V3 | null; face1: V3 | null;
}

let failures = 0;
function check(label: string, ok: boolean, detail: string) {
    if (!ok) failures++;
    console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  — ' + detail : ''));
}
// The PRE-CHANGE renderer published no mount, so for the BASELINE run the coil's
// ends are derived from the OLD rule (centre = midpoint of the two body CENTRES,
// mesh height = the published quantised length) — that is exactly the formula
// under test, written once, so the baseline run yields real pre-fix numbers.
const WPM = 0.5;                                 // NLB_WORLD_PER_M
function derived(s: Sample) {
    const p0 = s.s0 * WPM, p1 = s.s1 * WPM;
    const u = (p1 - p0) / Math.abs(p1 - p0);
    const c = (p0 + p1) / 2;
    return {
        end0x: c - u * s.spMesh / 2, end1x: c + u * s.spMesh / 2,
        face0x: p0 + u * CART_HALF_W, face1x: p1 - u * WALL_HALF_W,
    };
}
function wallEndX(s: Sample): number { return s.end1 ? s.end1.x : derived(s).end1x; }
function wallFaceX(s: Sample): number { return s.face1 ? s.face1.x : derived(s).face1x; }
function freeEndX(s: Sample): number { return s.end0 ? s.end0.x : derived(s).end0x; }
/** The visible WALL SEAM: how far the coil's wall-side end sits off the slab face. */
function seam(s: Sample): number { return Math.abs(wallEndX(s) - wallFaceX(s)); }
function expectPhase(tMs: number, rep: number, relWall: number): string {
    const phase = rep ? tMs - Math.floor(tMs / rep) * rep : tMs;
    if (phase < A_MS) return 'approach';
    if (phase < A_MS + C_MS) return 'compress';
    if (phase < LEAD) return 'hold';
    if (phase < LEAD + relWall) return 'release';
    return 'coast';
}

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const html = assembleField3DHtml(CFG);
    const file = path.join(OUT, 'wall.html');
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
        ([d, k]) => (window as unknown as { __NLB_TICK: (a: number, b: number) => number }).__NLB_TICK(d, k),
        [dtMs, n] as [number, number]);
    for (let i = 0; i < 40; i++) {
        await tick(16.7, 4);
        const ok = await page.evaluate(() => typeof (window as unknown as Record<string, unknown>).PM_nlbEngine !== 'undefined');
        if (ok) break;
        await page.waitForTimeout(100);
    }
    const setState = (s: string) => page.evaluate(
        st => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
    const pinAt = (ms: number) => page.evaluate(
        at => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: at }, '*'), ms);
    const clear = () => page.evaluate(() => { (window as unknown as Record<string, unknown>).__NLB_SAMPLES = []; });
    const read = (): Promise<Sample[]> => page.evaluate(
        () => (window as unknown as Record<string, unknown>).__NLB_SAMPLES as unknown as Sample[]);

    async function freeRun(state: string, frames: number): Promise<Sample[]> {
        await setState(state);
        await tick(16.7, 2);
        await clear();
        await tick(16.7, frames);
        const rows = await read();
        if (rows.length === 0) throw new Error('no samples for ' + state);
        console.log('  [' + state + '] bodies=' + rows[0].ids + ' frames=' + rows.length
            + ' t_ms=' + rows[0].t_ms.toFixed(1) + '..' + rows[rows.length - 1].t_ms.toFixed(1));
        return rows;
    }

    // ═══ 1. THE WALL STATE — the anchored end never moves ═══════════════
    console.log('\n=== 1. cart vs FIXED WALL (STATE_W) — the coil is bolted to the wall ===');
    const w = await freeRun('STATE_W', 900);
    const c0 = w.filter(s => s.t_ms < REPEAT_W);
    const vis = c0.filter(s => s.spVis);
    const phBad = c0.filter(s => s.ph !== expectPhase(s.t_ms, REPEAT_W, RELW_WALL));
    check('the choreography runs its five phases (sanity for everything below)',
        phBad.length === 0 && ['approach', 'compress', 'hold', 'release', 'coast'].every(p => c0.some(s => s.ph === p)),
        phBad.length + ' phase mismatches; release window = ' + RELW_WALL + ' ms wall (' + REL_W + ' ms physics)');
    check('the WALL never moves and the CART takes the whole travel (requirement 5)',
        new Set(c0.map(s => s.s1)).size === 1 && c0.every(s => s.s1 === S_WALL && s.v1 === 0 && s.a1 === 0)
        && new Set(c0.map(s => s.s0.toFixed(4))).size > 50,
        'wall s = ' + JSON.stringify([...new Set(c0.map(s => s.s1))])
        + '  cart s = ' + Math.min(...c0.map(s => s.s0)).toFixed(3) + '..' + Math.max(...c0.map(s => s.s0)).toFixed(3)
        + ' m over ' + new Set(c0.map(s => s.s0.toFixed(4))).size + ' distinct poses');
    check('the coil reports the WALL as its anchor on every visible frame',
        vis.length > 100 && vis.every(s => s.anchor === 'W'),
        vis.length + ' visible frames, distinct anchor = ' + JSON.stringify([...new Set(vis.map(s => s.anchor))]));
    // THE BUG: both ends translated. Now the wall-side end must be invariant.
    const wallEnds = vis.map(wallEndX);
    const wallSpan = Math.max(...wallEnds) - Math.min(...wallEnds);
    check('the WALL-SIDE coil end is INVARIANT across the whole cycle (the bug)',
        wallSpan < 1e-9,
        'x span = ' + wallSpan.toExponential(3) + ' world = ' + (wallSpan / WPM).toFixed(4)
        + ' m over ' + vis.length + ' frames  (x = ' + wallEnds[0].toFixed(6) + ')');
    const seamMax = Math.max(...vis.map(seam));
    check('the coil TOUCHES the slab face in EVERY phase (gap ~ 0, requirement 2)',
        seamMax < 1e-9,
        'max coil-end-to-face distance = ' + seamMax.toExponential(3) + ' world = '
        + (seamMax / WPM).toFixed(4) + ' m');
    // The FREE end carries the whole length change, and — because the mesh is
    // rebuilt at the 0.02-world quantum — it is quantised: it tracks the cart's
    // face to within half a quantum (<= 0.02 m), stepping instead of sliding.
    // That residual used to be split across BOTH seams; pinning the wall end moves
    // all of it here, inside/at the moving cart, where nothing reads it.
    const track = vis.filter(s => s.ph === 'compress' || s.ph === 'hold' || s.ph === 'release');
    const trackErr = Math.max(...track.map(s => Math.abs(freeEndX(s) - (s.face0 ? s.face0.x : derived(s).face0x))));
    check('...and the FREE end tracks the cart face to within half a rebuild quantum',
        track.every(s => Math.abs(s.spLen - s.spGap) < 1e-6)
        && trackErr <= Q_W / 2 + 1e-9
        && new Set(vis.map(s => freeEndX(s).toFixed(4))).size > 20,
        'max free-end-to-cart-face = ' + trackErr.toFixed(4) + ' world = ' + (trackErr / WPM).toFixed(3)
        + ' m (half quantum ' + (Q_W / 2) + ' w)  distinct free-end x = '
        + new Set(vis.map(s => freeEndX(s).toFixed(4))).size
        + ', range ' + Math.min(...vis.map(freeEndX)).toFixed(3)
        + '..' + Math.max(...vis.map(freeEndX)).toFixed(3));
    if (c0[0].face1 && c0[0].face0) {
        check('half-extents are the CONTRACT ones (cart 0.55 m, slab 0.275 m)',
            Math.abs(Math.abs((c0[0].face1 as V3).x - S_WALL * WPM) - WALL_HALF_W) < 1e-9
            && Math.abs(Math.abs((c0[0].face0 as V3).x - c0[0].s0 * WPM) - CART_HALF_W) < 1e-9,
            'slab face offset = ' + Math.abs((c0[0].face1 as V3).x - S_WALL * WPM).toFixed(4)
            + ' w = ' + (Math.abs((c0[0].face1 as V3).x - S_WALL * WPM) / WPM).toFixed(3)
            + ' m (contract 0.275)  cart face offset = '
            + Math.abs((c0[0].face0 as V3).x - c0[0].s0 * WPM).toFixed(4) + ' w = '
            + (Math.abs((c0[0].face0 as V3).x - c0[0].s0 * WPM) / WPM).toFixed(3) + ' m (contract 0.55)');
    } else {
        console.log('  n/a   half-extent check needs the mount publication (baseline run)');
    }
    // The choreography still reads as compress -> release on the wall.
    const wApp = c0.filter(s => s.ph === 'approach');
    const wCom = c0.filter(s => s.ph === 'compress');
    const wHold = c0.filter(s => s.ph === 'hold');
    const wRel = c0.filter(s => s.ph === 'release');
    const wRing = c0.filter(s => s.ph === 'coast' && s.phMs < RING_MS);
    check('approach: coil at NATURAL on the wall, the CART closes the air gap',
        wApp.every(s => s.spVis && Math.abs(s.spMesh - NAT_W) <= Q_W)
        && Math.abs((wApp[0].spGap) - (NAT_W + AIR_W)) < 0.05
        && wApp.every((s, i) => i === 0 || s.s0 <= wApp[i - 1].s0 + 1e-9),
        'coil=' + wApp[0].spMesh.toFixed(3) + '  gap ' + wApp[0].spGap.toFixed(3) + ' -> '
        + wApp[wApp.length - 1].spGap.toFixed(3) + '  cart ' + wApp[0].s0.toFixed(3) + ' -> '
        + wApp[wApp.length - 1].s0.toFixed(3) + ' m');
    check('compress: the coil shrinks natural -> compressed as the CART pushes in',
        wCom.every((s, i) => i === 0 || s.spMesh <= wCom[i - 1].spMesh + 1e-9)
        && Math.abs(wCom[0].spMesh - NAT_W) <= Q_W
        && Math.abs(wCom[wCom.length - 1].spMesh - COMP_W) <= 2 * Q_W,
        'coil ' + wCom[0].spMesh.toFixed(3) + ' -> ' + wCom[wCom.length - 1].spMesh.toFixed(3)
        + ' over ' + wCom.length + ' frames');
    check('hold: coil compressed at the AUTHORED seed pose exactly',
        wHold.every(s => s.s0 === S_CART && Math.abs(s.spMesh - COMP_W) <= Q_W)
        && Math.abs(wHold[0].spGap - COMP_W) < 1e-6,
        'cart s = ' + JSON.stringify([...new Set(wHold.map(s => s.s0))]) + ' (seed ' + S_CART
        + ')  gap=' + wHold[0].spGap.toFixed(4) + ' (compressed ' + COMP_W + ')');
    check('release: the coil springs OPEN and the cart is pushed AWAY from the wall',
        wRel.every((s, i) => i === 0 || s.spMesh >= wRel[i - 1].spMesh - 1e-9)
        && wRel[wRel.length - 1].s0 > wRel[0].s0 + 0.8
        && Math.abs(wRel[wRel.length - 1].v0 - FORCE / W_CART_M * (REL_W / 1000)) < 0.05
        && wRel.every(s => s.v1 === 0),
        'coil ' + wRel[0].spMesh.toFixed(3) + ' -> ' + wRel[wRel.length - 1].spMesh.toFixed(3)
        + '  cart ' + wRel[0].s0.toFixed(3) + ' -> ' + wRel[wRel.length - 1].s0.toFixed(3)
        + ' m  v=' + wRel[wRel.length - 1].v0.toFixed(3) + ' (true ' + (FORCE / W_CART_M * REL_W / 1000).toFixed(3) + ')');
    check('ring: it twangs ON THE WALL (anchored end still invariant, F = 0)',
        wRing.length > 10 && wRing.every(s => s.F0 === 0)
        && Math.max(...wRing.map(seam)) < 1e-9
        && wRing.some(s => s.spMesh > NAT_W + Q_W - 1e-9),
        wRing.length + ' ring frames, coil range '
        + Math.min(...wRing.map(s => s.spMesh)).toFixed(3) + '..'
        + Math.max(...wRing.map(s => s.spMesh)).toFixed(3));
    check('the coil never overlaps the cart (drawn <= live gap, every visible frame)',
        vis.every(s => s.spLen <= s.spGap + 1e-6),
        'max (drawn - gap) = ' + Math.max(...vis.map(s => s.spLen - s.spGap)).toExponential(2));

    // ═══ 2. FROZEN PINS — one per beat, the founder-eyes frames ═════════
    console.log('\n=== 2. SET_TIME_FREEZE at every beat (byte-identity + the seam) ===');
    async function holdAt(state: string, pin: number, tag: string) {
        await setState(state);
        await pinAt(pin);
        for (let i = 0; i < 500; i++) {
            await tick(16.7, 8);
            const t = await page.evaluate(() => (window as unknown as Record<string, unknown>).PM_simTimeMs as number);
            if (typeof t === 'number' && t >= pin - 1) break;
        }
        await tick(16.7, 2);
        await clear();
        await tick(16.7, 40);
        const rows = await read();
        const r0 = rows[0];
        check('[' + tag + '] frozen: clock, pose, coil length AND mount all held',
            rows.every(s => s.t_ms === r0.t_ms && s.ph === r0.ph && s.s0 === r0.s0 && s.s1 === r0.s1
                && s.spMesh === r0.spMesh && s.spLen === r0.spLen
                && wallEndX(s) === wallEndX(r0)),
            rows.length + ' held frames  t=' + r0.t_ms.toFixed(0) + ' phase=' + r0.ph
            + ' coil=' + r0.spMesh.toFixed(3) + ' wallEnd.x=' + wallEndX(r0).toFixed(6));
        const shot1 = await page.screenshot();
        await tick(16.7, 20);
        const shot2 = await page.screenshot();
        check('[' + tag + '] frozen PIXELS byte-identical over 20 more held frames',
            Buffer.compare(shot1, shot2) === 0, shot1.length + ' vs ' + shot2.length + ' bytes');
        fs.writeFileSync(path.join(OUT, tag + '_' + pin + 'ms.png'), shot1);
        return r0;
    }
    const CY = 3 * REPEAT_W;
    const pins: Array<[string, number]> = [
        ['t0-cycle-start', CY + 8],   // phase ~0: the beat the founder's t=0 frame shows
                                      //   (a literal at_ms of 0 is not a pin — falsy)
        ['mid-approach', CY + Math.round(A_MS * 0.35)],
        ['mid-compress', CY + A_MS + Math.round(C_MS * 0.5)],
        ['mid-hold', CY + A_MS + C_MS + Math.round(H_MS * 0.5)],
        ['mid-release', CY + LEAD + Math.round(RELW_WALL * 0.5)],
        ['ring', CY + LEAD + RELW_WALL + 32],
    ];
    const pinRows: Array<[string, Sample]> = [];
    for (const [tag, at] of pins) {
        const r = await holdAt('STATE_W', at, tag);
        pinRows.push([tag, r]);
        check('[' + tag + '] the coil is ON the wall face (no gap at this beat)',
            r.spVis && seam(r) < 1e-9,
            'seam = ' + seam(r).toExponential(3) + ' world = ' + (seam(r) / WPM).toFixed(4)
            + ' m  coil=' + r.spMesh.toFixed(3)
            + '  wallEnd.x=' + wallEndX(r).toFixed(6) + '  freeEnd.x=' + freeEndX(r).toFixed(6));
    }
    const pinXs = pinRows.map(([, r]) => wallEndX(r));
    check('THE FOUNDER FINDING: the wall-side end is the SAME x at every pinned beat',
        Math.max(...pinXs) - Math.min(...pinXs) < 1e-9,
        pinRows.map(([t], i) => t + '=' + pinXs[i].toFixed(6)).join('  '));
    const pinFree = pinRows.map(([, r]) => freeEndX(r));
    check('...while the FREE end really does travel (so the coil is not just static)',
        Math.max(...pinFree) - Math.min(...pinFree) > 0.3,
        'free-end x range = ' + Math.min(...pinFree).toFixed(3) + '..' + Math.max(...pinFree).toFixed(3)
        + ' world (' + ((Math.max(...pinFree) - Math.min(...pinFree)) / 0.5).toFixed(2) + ' m)');

    // ═══ 3. TWO FREE CARTS — bit-identity control ══════════════════════
    console.log('\n=== 3. two FREE carts (STATE_C) — the byte-identity control ===');
    const c = await freeRun('STATE_C', 900);
    check('the control state is free-free: no anchor claimed',
        c.filter(s => s.spVis).every(s => s.anchor === ''),
        'distinct anchor = ' + JSON.stringify([...new Set(c.map(s => s.anchor))]));
    const ctrl = c.map(s => [s.t_ms, s.ph, s.s0, s.s1, s.v0, s.v1, s.F0, s.spVis ? 1 : 0,
        s.spLen, s.spMesh, s.spGap].join('|'));
    const ctrlShot = await page.screenshot();
    fs.writeFileSync(path.join(OUT, 'control' + (BASELINE ? '.baseline' : '') + '.png'), ctrlShot);
    fs.writeFileSync(CTRL_JSON, JSON.stringify(ctrl), 'utf8');
    if (BASELINE) {
        console.log('  BASELINE written: ' + CTRL_JSON + ' (' + ctrl.length + ' frames)');
    } else if (fs.existsSync(CTRL_BASE)) {
        const base: string[] = JSON.parse(fs.readFileSync(CTRL_BASE, 'utf8'));
        let bad = -1;
        for (let i = 0; i < Math.max(base.length, ctrl.length); i++) {
            if (base[i] !== ctrl[i]) { bad = i; break; }
        }
        check('two FREE bodies: EVERY frame identical to the pre-change renderer',
            bad === -1 && base.length === ctrl.length,
            base.length + ' baseline vs ' + ctrl.length + ' now frames'
            + (bad >= 0 ? '  first diff @' + bad + ': ' + base[bad] + '  vs  ' + ctrl[bad] : '  0 diffs'));
        const baseShot = path.join(OUT, 'control.baseline.png');
        if (fs.existsSync(baseShot)) {
            check('...and the control screenshot is byte-identical too',
                Buffer.compare(fs.readFileSync(baseShot), ctrlShot) === 0,
                ctrlShot.length + ' bytes');
        }
    } else {
        console.log('  (no baseline file — run with NLB_BASELINE=1 on the stashed renderer first)');
    }

    console.log('\npage errors: ' + (errors.length === 0 ? 'none' : JSON.stringify(errors.slice(0, 5))));
    if (errors.length) failures++;
    await browser.close();
    console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED')
        + (BASELINE ? '  [BASELINE RUN — wall failures are the PRE-FIX evidence]' : ''));
    process.exit(BASELINE ? 0 : (failures === 0 ? 0 : 1));
}

main().catch(e => { console.error(e); process.exit(1); });
