/**
 * SCRATCH — momentum_bench SEAM A bring-up proof (lom-f, 2026-07-30).
 * NOT product code. Not a concept. Same shape and scaffolding as
 * _scratch_nlb_seams.ts / _scratch_nlb_bringup.ts.
 *
 * Drives the REAL renderer (assembleField3DHtml -> Playwright chromium -> real
 * Three.js + real animate() clock, virtual-clock shim) and asserts against
 * closed forms derived HERE, independently of the renderer's own algebra — so a
 * wrong implementation cannot agree with the expectation by construction.
 *
 * Fixtures deliberately live in this file, never in src/data/concepts/ (they
 * would be swept into validate:concepts and fail the authoring gates), and
 * nothing is written to the database.
 *
 * Assertions (docs/MOMENTUM_BENCH_ENGINE_SPEC.md section 6):
 *   1 momentum conservation (elastic / inelastic / explosion)
 *   2 emergent closed forms  (+ grep: the textbook formula is NOT in the source)
 *   3 impulse identity        J = m dv, stiff and soft
 *   4 THE IMPULSE LESSON      10x k -> equal areas, F_peak differs >= 3x
 *   5 contact duration        t_c = pi sqrt(mu/k), invariant to impact speed
 *   6 inelastic KE drop       0.5 mu (dv)^2, Sigma-p unchanged
 *   7 wall case               fixed body never moves, |dp| = 2 m v
 *   8 Rule 36 fold            N steps of 0.016 == 1 step of 0.016 N
 *   9 friction case           mu_k > 0 -> Sigma-p decays monotonically
 *
 * Run: npx tsx src/scripts/_scratch_mb_seams.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';
import { conceptJsonSchema } from '../schemas/conceptJson';

const OUT = path.join(process.cwd(), '.scratch_mb_seams');
const RENDERER_SRC = path.join(process.cwd(), 'src', 'lib', 'renderers', 'field_3d_renderer.ts');

const THREE_TAG =
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" crossorigin="anonymous"></script>';
const PROBE = `
<script>
(function () {
  var OrigScene = THREE.Scene;
  function PatchedScene() { var s = new OrigScene(); window.__MB_SCENE = s; return s; }
  PatchedScene.prototype = OrigScene.prototype;
  THREE.Scene = PatchedScene;
})();
</script>`;

const CLOCK_INIT = `(function () {
  var vclock = 0, q = [];
  window.requestAnimationFrame = function (cb) { q.push(cb); return q.length; };
  window.cancelAnimationFrame = function () {};
  try { performance.now = function () { return vclock; }; } catch (e) {}
  window.__MB_TICK = function (dtMs, n) {
    var count = n || 1;
    for (var k = 0; k < count; k++) {
      vclock += dtMs;
      var cur = q; q = [];
      for (var i = 0; i < cur.length; i++) {
        try { cur[i](vclock); } catch (e) { window.__MB_TICK_ERR = String(e && e.message || e); }
      }
    }
    return vclock;
  };
})()`;

const INERT_FIELD_LINES = {
    count: 0, color_positive: '#FF6B6B', color_negative: '#4ECDC4', opacity: 0, arrow_spacing: 0,
};

// ── Geometry the harness derives INDEPENDENTLY of the renderer ──────────────
// Half-extent along the track, in metres. These mirror the spec's stated shapes
// (ball r = 0.28 m) and the engine's cart/wall extents; the harness needs them to
// compute where a contact must BEGIN, and it must not ask the renderer.
const HALF = { cart: 0.4, ball: 0.28, wall: 0.3 };
const L_NAT_DEFAULT = 0.4;

function writeFixture(name: string, config: Field3DConfig): string {
    let html = assembleField3DHtml(config);
    if (html.indexOf(THREE_TAG) < 0) throw new Error('three.js tag anchor not found');
    html = html.replace(THREE_TAG, THREE_TAG + PROBE);
    fs.mkdirSync(OUT, { recursive: true });
    const f = path.join(OUT, name + '.html');
    fs.writeFileSync(f, html, 'utf8');
    return f;
}

type Body = {
    id: string; label?: string; mass_kg: number; shape?: string;
    initial_position_m: number; initial_velocity_mps?: number; fixed?: boolean; color?: string;
};
type Contact = {
    between: [string, string]; stiffness_N_per_m: number; damping_Ns_per_m?: number;
    sticks?: boolean; preload_m?: number; natural_length_m?: number; label?: string;
};
function benchState(label: string, mode: string, bodies: Body[], contact: Contact | null, extra: Record<string, unknown> = {}) {
    const mb: Record<string, unknown> = {
        mode, track: { length_m: 20 }, bodies,
        glow_focal: 'mb_body_' + bodies[0].id,
        readouts: ['v', 'p', 'sum_p', 'KE', 'F_contact', 'J'],
    };
    if (contact) mb.contact = contact;
    for (const k of Object.keys(extra)) mb[k] = extra[k];
    return {
        label, visible_elements: [], camera_position: [0, 3.2, 12], caption: label,
        momentum_bench: mb,
    };
}
function benchConfig(states: Record<string, unknown>): Field3DConfig {
    return {
        scenario_type: 'momentum_bench',
        explorer_id: 'momentum_bench_explorer',
        field_lines: INERT_FIELD_LINES,
        states,
    } as unknown as Field3DConfig;
}

type Row = Record<string, any>;
const SNAP = () => {
    const w = window as any, scene = w.__MB_SCENE, eng = w.PM_mbEngine;
    const objs: Row = {};
    // SEAM B: the arrow overlay, read straight off the drawn objects.
    // NOTE: no named local function may be declared inside this probe — tsx's
    // esbuild keepNames rewrites `const f = () => {}` to `__name(() => {}, "f")`,
    // and __name does not exist inside the page. Everything stays inline.
    const arrows: Row = {};
    scene.traverse((o: any) => {
        const id = o.userData && o.userData.id;
        if (!id) return;
        if (/^mb_body_[A-Za-z0-9]+$/.test(id) || /^mb_contact_element(_\d+)?$/.test(id) || id === 'mb_track') {
            const m = o.material;
            objs[id] = {
                x: o.position.x, y: o.position.y, z: o.position.z, visible: o.visible, sx: o.scale.x,
                op: m ? m.opacity : null, emI: (m && m.emissiveIntensity != null) ? m.emissiveIntensity : null,
            };
        }
        if (/^mb_contact_label(_\d+)?$/.test(id)) {
            objs[id] = {
                x: o.position.x, y: o.position.y, z: o.position.z, visible: o.visible,
                text: o.userData._mbText,
            };
        }
        if (/^mb_arrow(lbl)?_/.test(id)) {
            const ms: any[] = [];
            if (o.line && o.line.material) ms.push(o.line.material);
            if (o.cone && o.cone.material) ms.push(o.cone.material);
            if (o.material) ms.push(o.material);
            arrows[id] = {
                visible: o.visible, x: o.position.x, y: o.position.y,
                len: o.userData.len, dirx: o.userData.dirx, F: o.userData.F,
                fixedBody: !!o.userData.fixedBody,
                op: ms.length ? Math.min.apply(null, ms.map((m: any) => m.opacity)) : null,
                col: ms.length && ms[0].color ? ms[0].color.getHexString() : null,
            };
        }
    });
    // SEAM B: the DOM instrument layer, read as the teacher sees it.
    const panels: Row = {};
    // The SHARED chrome overlays are in the list too: #legend is fixed bottom-LEFT,
    // which is exactly where the force-trace panel lives, and a collision check that
    // only compares a scenario's OWN panels cannot see that (it shipped once).
    const panelIds = ['mb_readout', 'mb_trace', 'mb_slowmo', 'mb_formula', 'mb_sliders', 'caption', 'legend'];
    for (let i = 0; i < panelIds.length; i++) {
        const e = document.getElementById(panelIds[i]);
        if (!e) { panels[panelIds[i]] = null; continue; }
        const r = e.getBoundingClientRect();
        panels[panelIds[i]] = {
            shown: getComputedStyle(e).display !== 'none',
            text: e.textContent || '',
            rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        };
    }
    const hudRows: Row = {};
    const nodes = document.querySelectorAll('[id^="mb_ro_"][id$="_val"]');
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i] as any;
        hudRows[String(n.id).replace(/^mb_ro_/, '').replace(/_val$/, '')] = n.textContent;
    }
    const bodies: Row = {};
    for (const id of eng.order) {
        const b = eng.bodies[id];
        bodies[id] = { m: b.m, s: b.s, v: b.v, a: b.a, fixed: !!b.fixed, half: b.half, F: b.F_contact };
    }
    const events = (eng.events || []).map((e: any) => ({
        start_ms: e.start_ms, end_ms: e.end_ms, duration_ms: e.duration_ms,
        k: e.k, c: e.c, F_peak: e.F_peak, n: e.samples.length, lane: e.lane,
        label: e.label, lane_z: e.lane_z, contact_index: e.contact_index,
        samples: e.samples,
    }));
    // SEAM C — every contact (contacts[0] is the base one) + the control rows as
    // the teacher sees them on screen.
    const contacts = (eng.contacts || []).map((c: any) => ({
        index: c.index, lane: c.laneId, loId: c.loId, hiId: c.hiId, k: c.k, c: c.c,
        sticks: !!c.sticks, preload: c.preload, label: c.label,
        engaged: !!c.engaged, latched: !!c.latched, F: c.F,
    }));
    const rows: Row = {};
    const rowNodes = document.querySelectorAll('#mb_sliders div[id$="_row"]');
    for (let i = 0; i < rowNodes.length; i++) {
        const n = rowNodes[i] as HTMLElement;
        const r = n.getBoundingClientRect();
        const inp = n.querySelector('input') as HTMLInputElement | null;
        rows[n.id] = {
            shown: getComputedStyle(n).display !== 'none',
            rect: { x: r.x, y: r.y, w: r.width, h: r.height },
            value: inp ? inp.value : null,
            text: n.textContent || '',
        };
    }
    return {
        t_ms: eng.t_ms, tphys_ms: eng.tphys_ms, mode: eng.mode, mu_k: eng.mu_k,
        bound_hits: eng.bound_hits, F_contact: eng.F_contact,
        latch: eng.latch || null,
        contact: eng.contact ? {
            loId: eng.contact.loId, hiId: eng.contact.hiId, k: eng.contact.k, c: eng.contact.c,
            sticks: !!eng.contact.sticks, preload: eng.contact.preload, L_nat: eng.contact.L_nat,
            engaged: !!eng.contact.engaged, latched: !!eng.contact.latched,
        } : null,
        bodies, events, objs, arrows, hudRows, contacts, rows,
        seized: !!w.PM_mbSeized, ctrlSlots: w.PM_mbCtrlSlots || [],
        hud: panels['mb_readout'], trace: panels['mb_trace'], badge: panels['mb_slowmo'],
        formula: panels['mb_formula'], sliders: panels['mb_sliders'],
        caption: panels['caption'], legend: panels['legend'],
        traceDrawn: w.PM_mbTraceDrawn || [], traceAxes: w.PM_mbTraceAxes || null,
    };
};
// A CHEAP per-frame probe (SNAP serialises every force sample — far too heavy to
// call 340 times). Used only to time the slow-motion playback window.
const LITE = () => {
    const eng = (window as any).PM_mbEngine;
    let engaged = 0;
    for (const c of (eng.contacts || [])) if (c && c.engaged && !c.latched) engaged++;
    return {
        tphys_ms: eng.tphys_ms,
        engaged: engaged > 0,
        nEngaged: engaged,
        nev: (eng.events || []).length,
    };
};

async function open(name: string, config: Field3DConfig) {
    const file = writeFixture(name, config);
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.addInitScript(CLOCK_INIT);
    await page.goto('file:///' + file.replace(/\\/g, '/'));
    await page.waitForFunction('typeof window.__MB_TICK === "function"', null, { timeout: 20000, polling: 100 });
    const tick = (dtMs: number, n = 1) => page.evaluate(
        ([d, k]) => (window as any).__MB_TICK(d, k), [dtMs, n] as [number, number]);
    for (let i = 0; i < 40; i++) {
        await tick(16.7, 4);
        if (await page.evaluate(() => !!(window as any).__MB_SCENE && typeof (window as any).PM_mbEngine !== 'undefined')) break;
        await page.waitForTimeout(100);
    }
    const setState = (s: string) => page.evaluate(st => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
    const pin = (ms: number) => page.evaluate(at => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: at }, '*'), ms);
    const snap = () => page.evaluate(SNAP);
    const lite = () => page.evaluate(LITE);
    return { browser, page, tick, setState, pin, snap, lite, errors, file };
}

const results: Row = {};
const checks: Array<{ id: string; ok: boolean; detail: string }> = [];
function chk(id: string, ok: boolean, detail: string) {
    checks.push({ id, ok, detail });
    console.log((ok ? 'PASS ' : 'FAIL ') + id + '  ' + detail);
}
function pending(id: string, detail: string) {
    console.log('PENDING ' + id + '  ' + detail);
}
const rel = (a: number, b: number) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));

// Trapezoid over the engine's raw (t_ms, F) samples. The engine records the
// samples; the AREA is computed here, so the impulse the harness checks is never
// a number the engine handed it.
function areaOf(samples: number[][]): number {
    let a = 0;
    for (let i = 1; i < samples.length; i++) {
        const dt = (samples[i][0] - samples[i - 1][0]) / 1000;
        a += 0.5 * (samples[i][1] + samples[i - 1][1]) * dt;
    }
    return a;
}
function peakOf(samples: number[][]): number {
    let p = 0;
    for (const s of samples) if (s[1] > p) p = s[1];
    return p;
}

// ── Fixtures ────────────────────────────────────────────────────────────────
// Track length 20 m everywhere so no bound clamp can ever touch the momentum
// ledger; every run below is short enough that no body reaches +-20 m.

// 1) Elastic two-cart collision. m1 = 2 heading right at 3, m2 = 3 at rest.
const EL_M1 = 2, EL_M2 = 3, EL_V1 = 3, EL_V2 = 0, EL_K = 300;
// 2) Wall impact, elastic. Ball m = 1.5 at 4 m/s into a fixed wall.
const W_M = 1.5, W_V = 4, W_K = 400;
// 3) Inelastic (sticks). Same masses as the elastic pair.
// 4) Explosion. preload 0.25 m, k 800, masses 1 and 4, both at rest.
const EX_M1 = 1, EX_M2 = 4, EX_K = 800, EX_PRE = 0.25;
// 5) Stiffness pair for the impulse lesson — identical everything but k.
const IMP_M = 1.0, IMP_V = 3.0, IMP_K_SOFT = 200, IMP_K_STIFF = 2000;
// 6) SEAM B — the slow-motion factor under test.
const SLOW_N = 20;
// 7) SEAM C — the param_ramp window under test.
const RAMP_K0 = 200, RAMP_K1 = 2000, RAMP_MS = 2000;

const FIX = benchConfig({
    // S1 elastic two-body
    STATE_1: benchState('Elastic collision', 'collision', [
        { id: 'A', label: 'm₁', mass_kg: EL_M1, shape: 'cart', initial_position_m: -3, initial_velocity_mps: EL_V1 },
        { id: 'B', label: 'm₂', mass_kg: EL_M2, shape: 'cart', initial_position_m: 0 },
    ], { between: ['A', 'B'], stiffness_N_per_m: EL_K }),
    // S2 wall impact
    STATE_2: benchState('Wall impact', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: W_M, shape: 'ball', initial_position_m: -3, initial_velocity_mps: W_V },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: W_K }),
    // S3 inelastic latch
    STATE_3: benchState('Inelastic (velcro)', 'collision', [
        { id: 'A', label: 'm₁', mass_kg: EL_M1, shape: 'cart', initial_position_m: -3, initial_velocity_mps: EL_V1 },
        { id: 'B', label: 'm₂', mass_kg: EL_M2, shape: 'cart', initial_position_m: 0 },
    ], { between: ['A', 'B'], stiffness_N_per_m: EL_K, sticks: true }),
    // S4 explosion
    STATE_4: benchState('Explosion', 'explosion', [
        { id: 'A', label: 'm₁', mass_kg: EX_M1, shape: 'cart', initial_position_m: -0.6 },
        { id: 'B', label: 'm₂', mass_kg: EX_M2, shape: 'cart', initial_position_m: 0.6 },
    ], { between: ['A', 'B'], stiffness_N_per_m: EX_K, preload_m: EX_PRE }),
    // S5 / S6 the impulse lesson — SAME ball, SAME speed, k differs 10x
    STATE_5: benchState('Soft wall', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -2, initial_velocity_mps: IMP_V },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_SOFT }),
    STATE_6: benchState('Rigid wall', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -2, initial_velocity_mps: IMP_V },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_STIFF }),
    // S7 same as S5 but HALF the impact speed — contact duration must not change
    STATE_7: benchState('Soft wall, half speed', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -2, initial_velocity_mps: IMP_V / 2 },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_SOFT }),
    // S8 friction track — the ONLY external force; Sigma-p must decay
    STATE_8: benchState('Friction track', 'single_body', [
        { id: 'A', label: 'm₁', mass_kg: 2, shape: 'cart', initial_position_m: -6, initial_velocity_mps: 4 },
        { id: 'B', label: 'm₂', mass_kg: 3, shape: 'cart', initial_position_m: 6, initial_velocity_mps: 2 },
    ], null, { track: { length_m: 20, mu_k: 0.25 } }),
    // ── SEAM B fixtures ─────────────────────────────────────────────────────
    // S9 is STATE_5 (soft wall) with the INSTRUMENTS turned on and nothing else
    // changed, so STATE_5 is its exact un-slowed, un-instrumented control: any
    // difference between the two IS the slow window perturbing the physics.
    STATE_9: benchState('Soft wall, instrumented + slow', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -2, initial_velocity_mps: IMP_V },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_SOFT, label: 'foam pad' }, {
        force_trace: { show: true, fill_area: true, peak_marker: true },
        slow_window: { slow_factor: SLOW_N, badge: true },
    }),
    // S10 — the shared-axis overlay. repeat_every_ms re-arms the SAME contact, so
    // two recorded events accumulate and compare_with_previous_lane must put BOTH
    // on ONE axis pair. (A second INDEPENDENT lane contact is SEAM C's
    // lanes[].contact_override; the panel machinery it will feed is proved here.)
    STATE_10: benchState('Two traces, one axis', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -2, initial_velocity_mps: IMP_V },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_SOFT, label: 'foam pad' }, {
        force_trace: { show: true, fill_area: true, peak_marker: true, compare_with_previous_lane: true },
        repeat_every_ms: 1200,
    }),
    // S11 — an inelastic latch with the momentum ledger's full readout set: the
    // KE drop must be VISIBLE in the HUD, which is what the readout exists for.
    STATE_11: benchState('Inelastic, full ledger', 'collision', [
        { id: 'A', label: 'm₁', mass_kg: EL_M1, shape: 'cart', initial_position_m: -3, initial_velocity_mps: EL_V1 },
        { id: 'B', label: 'm₂', mass_kg: EL_M2, shape: 'cart', initial_position_m: 0 },
    ], { between: ['A', 'B'], stiffness_N_per_m: EL_K, sticks: true, label: 'velcro' },
        { readouts: ['v', 'p', 'sum_p', 'KE', 'sum_KE'] }),
    // ── SEAM C fixtures ─────────────────────────────────────────────────────
    // S12 — THE TWO-LANE CASE. The reason SEAM C exists: the SAME ball at the
    // SAME speed hits a soft wall in one lane and a rigid wall in the other AT
    // THE SAME INSTANT. Equal areas, very different peaks, side by side on one
    // axis pair — that IS impulse's payoff beat, and until now nothing tested it.
    STATE_12: benchState('Two lanes at once', 'wall_impact', [
        { id: 'BALLA', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -2, initial_velocity_mps: IMP_V },
        { id: 'WALLA', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
        { id: 'BALLB', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -2, initial_velocity_mps: IMP_V },
        { id: 'WALLB', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALLA', 'WALLA'], stiffness_N_per_m: IMP_K_SOFT, label: 'foam pad' }, {
        lanes: [
            { id: 'soft', offset_z_m: -1.3, bodies: ['BALLA', 'WALLA'] },
            {
                id: 'rigid', offset_z_m: 1.3, bodies: ['BALLB', 'WALLB'],
                contact_override: { stiffness_N_per_m: IMP_K_STIFF, label: 'steel bumper' },
            },
        ],
        force_trace: { show: true, fill_area: true, peak_marker: true, compare_with_previous_lane: true },
        formula: 'J = FΔt = Δp',
    }),
    // S13 / S14 — the Rule-31 control rows. They SHARE the k slider, so k must
    // land on identical screen pixels in both however many neighbours are shown.
    STATE_13: benchState('Controls: v₁ and k', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -2, initial_velocity_mps: IMP_V },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_SOFT }, {
        controls_visible: ['v1', 'k'],
        formula: 'J = mΔv',
    }),
    STATE_14: benchState('Control: k only, ramped', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -2, initial_velocity_mps: IMP_V },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_SOFT }, {
        controls_visible: ['k'],
        param_ramp: { param: 'k', from: RAMP_K0, to: RAMP_K1, start_ms: 0, end_ms: RAMP_MS },
    }),
    // S15 — the SANDBOX. Rule 37: it must never sit dead — repeat_every_ms keeps
    // re-arming the bench for as long as the clock runs — and a TRUSTED drag
    // seizes it so the teacher's value stands.
    STATE_15: benchState('Sandbox', 'sandbox', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -2, initial_velocity_mps: IMP_V },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_SOFT }, {
        controls_visible: ['v1', 'k'],
        trusted_drag_seizes: true,
        repeat_every_ms: 1400,
    }),
});

// A SEPARATE page: the sticks + preload_m contradiction deliberately logs a
// console error, and the shared harness page asserts zero console errors.
const CONTRA = benchConfig({
    STATE_1: benchState('sticks + preload together', 'explosion', [
        { id: 'A', label: 'm₁', mass_kg: EX_M1, shape: 'cart', initial_position_m: -0.6 },
        { id: 'B', label: 'm₂', mass_kg: EX_M2, shape: 'cart', initial_position_m: 0.6 },
    ], { between: ['A', 'B'], stiffness_N_per_m: EX_K, preload_m: EX_PRE, sticks: true }),
});

(async () => {
    fs.mkdirSync(OUT, { recursive: true });

    // ══ Assertion 2b — the textbook formula must NOT be in the renderer ══════
    {
        const src = fs.readFileSync(RENDERER_SRC, 'utf8');
        // Match the closed form in any plausible spelling, restricted to the
        // momentum_bench region so an unrelated scenario cannot mask it.
        const mbStart = src.indexOf('momentum_bench scenario — SEAM A');
        const mbEnd = src.indexOf('function applyMomentumBenchGlow');
        const raw = (mbStart >= 0 && mbEnd > mbStart) ? src.slice(mbStart, mbEnd) : src;
        // Strip comments before scanning. The engine header DELIBERATELY quotes the
        // forbidden closed form in prose in order to say it is absent; the assertion
        // is about what the engine COMPUTES, so only executable text is scanned.
        const region = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\n)\s*\/\/[^\n]*/g, '$1');
        const patterns: Array<[string, RegExp]> = [
            ['(m1-m2)/(m1+m2) form', /\(\s*m\w*\s*-\s*m\w*\s*\)[\s\S]{0,40}\/\s*\(\s*m\w*\s*\+\s*m\w*\s*\)/],
            ['2*m2*v2/(m1+m2) form', /2\s*\*\s*m\w*\s*\*\s*v\w*[\s\S]{0,30}\/[\s\S]{0,20}\(\s*m\w*\s*\+\s*m\w*\s*\)/],
            ['restitution coefficient', /coefficient[_ ]of[_ ]restitution|\be_restitution\b/i],
        ];
        const hits = patterns.filter(p => p[1].test(region)).map(p => p[0]);
        chk('A2b_no_textbook_collision_formula_in_source', hits.length === 0,
            region.length + ' chars of EXECUTABLE momentum_bench source scanned (' + raw.length +
            ' raw, comments stripped); forbidden closed forms found: ' + (hits.length ? hits.join(' | ') : 'NONE'));
    }

    const h = await open('mb_seam_a', FIX);

    // Run a state for a wall-clock span, sampling.
    async function run(state: string, frames: number, sampleEvery = 0) {
        await h.setState(state);
        const seq: Row[] = [];
        for (let i = 0; i < frames; i++) {
            await h.tick(16.7, 1);
            if (sampleEvery > 0 && i % sampleEvery === 0) seq.push(await h.snap());
        }
        const fin = await h.snap();
        return { seq, fin };
    }

    // ══ Assertion 1 + 2 — elastic two-body ═══════════════════════════════════
    {
        const { seq, fin } = await run('STATE_1', 200, 4);
        // Sigma-p across the WHOLE run, from the harness's own masses.
        const ps = seq.concat([fin]).map(s => EL_M1 * s.bodies['A'].v + EL_M2 * s.bodies['B'].v);
        const p0 = EL_M1 * EL_V1 + EL_M2 * EL_V2;
        const worst = Math.max(...ps.map(p => Math.abs(p - p0)));
        chk('A1a_elastic_sigma_p_constant', worst <= 1e-9,
            'p0=' + p0.toFixed(6) + ' worst |dp| over ' + ps.length + ' samples = ' + worst.toExponential(3) + ' (tol 1e-9)');
        chk('A1a_no_bound_clamp', fin.bound_hits === 0, 'bound_hits=' + fin.bound_hits);

        // Assertion 2 — the closed form, derived HERE.
        const v1p = ((EL_M1 - EL_M2) * EL_V1 + 2 * EL_M2 * EL_V2) / (EL_M1 + EL_M2);
        const v2p = ((EL_M2 - EL_M1) * EL_V2 + 2 * EL_M1 * EL_V1) / (EL_M1 + EL_M2);
        const gotA = fin.bodies['A'].v, gotB = fin.bodies['B'].v;
        chk('A2_elastic_outcome_matches_closed_form',
            rel(gotA, v1p) <= 0.005 && rel(gotB, v2p) <= 0.005,
            'v1′ got ' + gotA.toFixed(6) + ' exp ' + v1p.toFixed(6) + ' (' + (100 * rel(gotA, v1p)).toFixed(4) + '%) | ' +
            'v2′ got ' + gotB.toFixed(6) + ' exp ' + v2p.toFixed(6) + ' (' + (100 * rel(gotB, v2p)).toFixed(4) + '%)');

        // Assertion 5 — contact duration, derived HERE.
        const mu = EL_M1 * EL_M2 / (EL_M1 + EL_M2);
        const tcExp = Math.PI * Math.sqrt(mu / EL_K) * 1000;
        const ev = fin.events[0];
        chk('A5a_contact_duration_matches_pi_sqrt_mu_over_k',
            !!ev && ev.duration_ms != null && rel(ev.duration_ms, tcExp) <= 0.02,
            'events=' + fin.events.length + ' t_c got ' + (ev ? Number(ev.duration_ms).toFixed(4) : 'n/a') +
            ' ms exp ' + tcExp.toFixed(4) + ' ms (' + (ev ? (100 * rel(ev.duration_ms, tcExp)).toFixed(4) : '--') + '%)');

        // Assertion 3 — impulse identity, from the RAW samples.
        const J = ev ? areaOf(ev.samples) : 0;
        const dpA = Math.abs(EL_M1 * (gotA - EL_V1));
        chk('A3a_impulse_area_equals_m_dv_elastic', ev && rel(J, dpA) <= 0.005,
            'area(F dt)=' + J.toFixed(6) + ' N·s  |m dv|=' + dpA.toFixed(6) +
            ' (' + (100 * rel(J, dpA)).toFixed(4) + '%), ' + (ev ? ev.samples.length : 0) + ' samples');
        results.elastic = { fin, v1p, v2p, tcExp, J, dpA };
    }

    // ══ Assertion 7 — the wall case ══════════════════════════════════════════
    {
        const { seq, fin } = await run('STATE_2', 200, 4);
        const wallMoved = seq.concat([fin]).some(s => s.bodies['WALL'].s !== 0 || s.bodies['WALL'].v !== 0);
        chk('A7a_fixed_body_never_moves', !wallMoved,
            'WALL s/v across ' + (seq.length + 1) + ' samples: ' +
            (wallMoved ? 'MOVED' : 'all s=0, v=0') + ' (final s=' + fin.bodies['WALL'].s + ' v=' + fin.bodies['WALL'].v + ')');
        const dp = Math.abs(W_M * (fin.bodies['BALL'].v - W_V));
        chk('A7b_ball_delta_p_equals_2mv', rel(dp, 2 * W_M * W_V) <= 0.005,
            '|dp| got ' + dp.toFixed(6) + ' exp 2mv = ' + (2 * W_M * W_V).toFixed(6) +
            ' (' + (100 * rel(dp, 2 * W_M * W_V)).toFixed(4) + '%); v_out=' + fin.bodies['BALL'].v.toFixed(6));
        const ev = fin.events[0];
        const J = ev ? areaOf(ev.samples) : 0;
        chk('A3b_impulse_area_equals_m_dv_wall', ev && rel(J, dp) <= 0.005,
            'area=' + J.toFixed(6) + ' |m dv|=' + dp.toFixed(6) + ' (' + (100 * rel(J, dp)).toFixed(4) + '%)');
        // The wall must still REPORT its half of the pair while it is engaged.
        const anyWallForce = seq.some(s => s.bodies['WALL'].F > 0);
        chk('A7c_fixed_body_reports_its_half_of_the_pair', anyWallForce,
            'WALL F_contact went above 0 during the impact: ' + anyWallForce +
            ' (peak seen ' + Math.max(...seq.map(s => s.bodies['WALL'].F)).toFixed(3) + ' N)');
        // ── A7d (SEAM B) — the wall's own force arrow ────────────────────────
        // Sampled ACROSS the contact rather than at one instant: a single sample
        // can land on the designed-zero at contact entry or release (the lom-e
        // SEAM J lesson, and the trap SEAM A hit twice). Every frame on which the
        // pair is engaged must satisfy all three clauses.
        await h.setState('STATE_2');
        const arrowFrames: Row[] = [];
        for (let i = 0; i < 200; i++) {
            await h.tick(16.7, 1);
            const q = await h.snap();
            const ab = q.arrows['mb_arrow_BALL'], aw = q.arrows['mb_arrow_WALL'];
            if (ab && aw && ab.visible && aw.visible) arrowFrames.push({ ab, aw, body: q.objs });
        }
        const exists = arrowFrames.length > 0;
        const opposite = exists && arrowFrames.every(f => f.ab.dirx === -1 && f.aw.dirx === 1);
        const equalMag = exists && arrowFrames.every(f => Math.abs(f.ab.F - f.aw.F) <= 1e-12 &&
            Math.abs(f.ab.len - f.aw.len) <= 1e-12);
        // "Full brightness" = the wall's arrow is never dimmed by the Rule-32e glow
        // pass even though the WALL is a non-focal peer on this state (glow_focal
        // is mb_body_BALL). Opacity 1 on every engaged frame, identical to the
        // focal body's own arrow.
        const fullBright = exists && arrowFrames.every(f => f.aw.op === 1 && f.ab.op === 1);
        // and prove the glow pass really did run (else "never dimmed" is vacuous):
        // the focal ball is emissive-boosted above the non-focal wall.
        const glowRan = arrowFrames.some(f => f.body['mb_body_BALL'].emI > f.body['mb_body_WALL'].emI + 0.1);
        chk('A7d_wall_arrow_full_brightness',
            exists && opposite && equalMag && fullBright && glowRan,
            'engaged frames with BOTH arrows drawn = ' + arrowFrames.length +
            '; equal magnitude+length on every frame = ' + equalMag +
            '; opposite (ball -x, wall +x) = ' + opposite +
            '; wall arrow opacity 1 on every frame = ' + fullBright +
            '; glow pass active (focal emI > wall emI) = ' + glowRan +
            (exists ? '; peak arrow F = ' + Math.max(...arrowFrames.map(f => f.aw.F)).toFixed(3) +
                ' N, len ' + Math.max(...arrowFrames.map(f => f.aw.len)).toFixed(4) + ' world' : ''));
        results.wall = { fin, dp, arrow_frames: arrowFrames.length };
    }

    // ══ Assertion 6 — inelastic (sticks) ═════════════════════════════════════
    {
        const { seq, fin } = await run('STATE_3', 200, 4);
        const p0 = EL_M1 * EL_V1 + EL_M2 * EL_V2;
        const ps = seq.concat([fin]).map(s => EL_M1 * s.bodies['A'].v + EL_M2 * s.bodies['B'].v);
        const worst = Math.max(...ps.map(p => Math.abs(p - p0)));
        chk('A1b_inelastic_sigma_p_constant', worst <= 1e-9,
            'p0=' + p0.toFixed(6) + ' worst |dp| = ' + worst.toExponential(3) + ' (tol 1e-9)');
        const mu = EL_M1 * EL_M2 / (EL_M1 + EL_M2);
        const dv = EL_V1 - EL_V2;
        const keDropExp = 0.5 * mu * dv * dv;
        const keBefore = 0.5 * EL_M1 * EL_V1 * EL_V1 + 0.5 * EL_M2 * EL_V2 * EL_V2;
        const keAfter = 0.5 * EL_M1 * fin.bodies['A'].v * fin.bodies['A'].v +
            0.5 * EL_M2 * fin.bodies['B'].v * fin.bodies['B'].v;
        chk('A6_inelastic_ke_drop_matches_half_mu_dv_squared',
            rel(keBefore - keAfter, keDropExp) <= 0.005,
            'KE drop got ' + (keBefore - keAfter).toFixed(6) + ' J exp 0.5·μ·(Δv)² = ' +
            keDropExp.toFixed(6) + ' J (' + (100 * rel(keBefore - keAfter, keDropExp)).toFixed(4) + '%)');
        const latched = !!(fin.contact && fin.contact.latched);
        chk('A6b_bodies_share_one_velocity_after_latch',
            Math.abs(fin.bodies['A'].v - fin.bodies['B'].v) <= 1e-12 && latched,
            'latched=' + latched + ' vA=' + fin.bodies['A'].v.toFixed(9) + ' vB=' + fin.bodies['B'].v.toFixed(9));
        results.inelastic = { fin, keDropExp, keDrop: keBefore - keAfter };
    }

    // ══ Assertion 1c — explosion ═════════════════════════════════════════════
    {
        // 40 frames only: the light body leaves at ~6.3 m/s, so a 200-frame run
        // would drive it into the track bound, and a bound clamp legitimately
        // changes Sigma-p. That is a FIXTURE constraint, so it is asserted rather
        // than assumed.
        const { seq, fin } = await run('STATE_4', 40, 2);
        const ps = seq.concat([fin]).map(s => EX_M1 * s.bodies['A'].v + EX_M2 * s.bodies['B'].v);
        const worst = Math.max(...ps.map(p => Math.abs(p)));
        chk('A1c_explosion_sigma_p_stays_zero', worst <= 1e-9 && fin.bound_hits === 0,
            'worst |Σp| over ' + ps.length + ' samples = ' + worst.toExponential(3) +
            ' (tol 1e-9), bound_hits=' + fin.bound_hits);
        // Speeds in inverse mass ratio, and the energy stored in the preload.
        const ratio = Math.abs(fin.bodies['A'].v) / Math.abs(fin.bodies['B'].v);
        chk('A1d_explosion_speeds_in_inverse_mass_ratio', rel(ratio, EX_M2 / EX_M1) <= 0.005,
            '|vA|/|vB| got ' + ratio.toFixed(6) + ' exp m₂/m₁ = ' + (EX_M2 / EX_M1).toFixed(6) +
            ' (' + (100 * rel(ratio, EX_M2 / EX_M1)).toFixed(4) + '%)  [vA=' +
            fin.bodies['A'].v.toFixed(5) + ' vB=' + fin.bodies['B'].v.toFixed(5) + ']');
        const muX = EX_M1 * EX_M2 / (EX_M1 + EX_M2);
        const vRelExp = EX_PRE * Math.sqrt(EX_K / muX);
        const vRelGot = Math.abs(fin.bodies['B'].v - fin.bodies['A'].v);
        chk('A1e_explosion_release_speed_from_stored_energy', rel(vRelGot, vRelExp) <= 0.005,
            '|v_rel| got ' + vRelGot.toFixed(6) + ' exp preload·√(k/μ) = ' + vRelExp.toFixed(6) +
            ' (' + (100 * rel(vRelGot, vRelExp)).toFixed(4) + '%)');
        results.explosion = { fin, vRelExp, vRelGot };
    }

    // ══ Assertion 4 — THE IMPULSE LESSON (the founder go/no-go) ══════════════
    {
        const soft = (await run('STATE_5', 200, 0)).fin;
        const stiff = (await run('STATE_6', 200, 0)).fin;
        const evS = soft.events[0], evR = stiff.events[0];
        const aS = evS ? areaOf(evS.samples) : 0, aR = evR ? areaOf(evR.samples) : 0;
        const pS = evS ? peakOf(evS.samples) : 0, pR = evR ? peakOf(evR.samples) : 0;
        const dpExp = 2 * IMP_M * IMP_V;
        console.log('   [A4 raw] soft  k=' + IMP_K_SOFT + '  area=' + aS.toFixed(6) + ' N·s  F_peak=' + pS.toFixed(4) +
            ' N  t_c=' + (evS ? Number(evS.duration_ms).toFixed(4) : 'n/a') + ' ms  samples=' + (evS ? evS.samples.length : 0));
        console.log('   [A4 raw] rigid k=' + IMP_K_STIFF + '  area=' + aR.toFixed(6) + ' N·s  F_peak=' + pR.toFixed(4) +
            ' N  t_c=' + (evR ? Number(evR.duration_ms).toFixed(4) : 'n/a') + ' ms  samples=' + (evR ? evR.samples.length : 0));
        chk('A4a_equal_areas_across_10x_stiffness', !!evS && !!evR && rel(aS, aR) <= 0.01,
            'area_soft=' + aS.toFixed(6) + ' N·s  area_rigid=' + aR.toFixed(6) +
            ' N·s  difference ' + (100 * rel(aS, aR)).toFixed(4) + '% (tol 1%)');
        chk('A4b_areas_both_equal_2mv', rel(aS, dpExp) <= 0.01 && rel(aR, dpExp) <= 0.01,
            'expected 2mv = ' + dpExp.toFixed(6) + ' N·s; soft off by ' + (100 * rel(aS, dpExp)).toFixed(4) +
            '%, rigid off by ' + (100 * rel(aR, dpExp)).toFixed(4) + '%');
        chk('A4c_peak_force_differs_by_at_least_3x', pR / Math.max(1e-12, pS) >= 3,
            'F_peak rigid ' + pR.toFixed(4) + ' N / soft ' + pS.toFixed(4) + ' N = ' +
            (pR / Math.max(1e-12, pS)).toFixed(4) + 'x (expect √10 = 3.1623, need ≥ 3)');
        // F_peak * t_c = pi J / 2 for a half-sine pulse — the identity that IS the
        // concept. Checked on BOTH lanes.
        const idS = pS * (evS ? evS.duration_ms / 1000 : 0), idR = pR * (evR ? evR.duration_ms / 1000 : 0);
        chk('A4d_peak_times_duration_equals_pi_J_over_2',
            rel(idS, Math.PI * aS / 2) <= 0.01 && rel(idR, Math.PI * aR / 2) <= 0.01,
            'soft F_peak·t_c=' + idS.toFixed(6) + ' vs πJ/2=' + (Math.PI * aS / 2).toFixed(6) +
            ' | rigid ' + idR.toFixed(6) + ' vs ' + (Math.PI * aR / 2).toFixed(6));
        results.impulse_lesson = {
            soft: { k: IMP_K_SOFT, area: aS, peak: pS, t_c_ms: evS ? evS.duration_ms : null },
            rigid: { k: IMP_K_STIFF, area: aR, peak: pR, t_c_ms: evR ? evR.duration_ms : null },
            expected_area: dpExp,
        };

        // Assertion 5b — duration invariant to impact SPEED (same k, half v).
        const half = (await run('STATE_7', 200, 0)).fin;
        const evH = half.events[0];
        const tcExp = Math.PI * Math.sqrt(IMP_M / IMP_K_SOFT) * 1000;
        chk('A5b_contact_duration_invariant_to_impact_speed',
            !!evS && !!evH && rel(evH.duration_ms, evS.duration_ms) <= 0.02 && rel(evH.duration_ms, tcExp) <= 0.02,
            'v=' + IMP_V + ' -> ' + (evS ? Number(evS.duration_ms).toFixed(4) : 'n/a') + ' ms | v=' + (IMP_V / 2) +
            ' -> ' + (evH ? Number(evH.duration_ms).toFixed(4) : 'n/a') + ' ms | closed form π√(μ/k) = ' +
            tcExp.toFixed(4) + ' ms');
        const peakHalf = evH ? peakOf(evH.samples) : 0;
        chk('A5c_peak_force_scales_with_impact_speed', rel(pS / Math.max(1e-12, peakHalf), 2) <= 0.02,
            'F_peak(v) / F_peak(v/2) = ' + (pS / Math.max(1e-12, peakHalf)).toFixed(5) +
            ' (expect 2.0 — F_peak = Δv√(kμ) is linear in speed while t_c is not)');
    }

    // ══ Assertion 9 — friction: Sigma-p must DECAY ═══════════════════════════
    {
        const { seq, fin } = await run('STATE_8', 220, 5);
        const all = seq.concat([fin]);
        const ps = all.map(s => 2 * s.bodies['A'].v + 3 * s.bodies['B'].v);
        let monotone = true;
        for (let i = 1; i < ps.length; i++) if (ps[i] > ps[i - 1] + 1e-9) monotone = false;
        chk('A9a_friction_sigma_p_decays_monotonically', monotone && ps[ps.length - 1] < ps[0] - 0.5,
            'Σp ' + ps[0].toFixed(4) + ' -> ' + ps[ps.length - 1].toFixed(4) +
            ' kg·m/s over ' + ps.length + ' samples, monotone=' + monotone);
        // Both bodies stop; the harness derives the stopping distance itself:
        // d = v0^2 / (2 mu g).
        const dExpA = 4 * 4 / (2 * 0.25 * 9.8), dExpB = 2 * 2 / (2 * 0.25 * 9.8);
        const dGotA = fin.bodies['A'].s - (-6), dGotB = fin.bodies['B'].s - 6;
        chk('A9b_stopping_distance_matches_v0_squared_over_2_mu_g',
            rel(dGotA, dExpA) <= 0.01 && rel(dGotB, dExpB) <= 0.01,
            'A travelled ' + dGotA.toFixed(5) + ' m exp ' + dExpA.toFixed(5) + ' (' + (100 * rel(dGotA, dExpA)).toFixed(3) +
            '%) | B travelled ' + dGotB.toFixed(5) + ' m exp ' + dExpB.toFixed(5) + ' (' + (100 * rel(dGotB, dExpB)).toFixed(3) + '%)');
        chk('A9c_friction_run_never_hit_a_track_bound', fin.bound_hits === 0, 'bound_hits=' + fin.bound_hits);
        results.friction = { ps_first: ps[0], ps_last: ps[ps.length - 1], dGotA, dExpA, dGotB, dExpB };
    }

    // ══ Assertion 8 — Rule 36 fold + freeze stability ════════════════════════
    {
        // 8a: the fold, ACROSS a whole collision (contact opens at ~600 ms and
        // closes at ~800 ms, so 992 ms of run contains all of it).
        //   51 x 20 ms vs 26 x 40 ms. Both spans accumulate EXACTLY 1000 ms of
        // wall clock (the first frame after a pin release seeds __pmLastWall and
        // therefore contributes 0, so the span is (n-1)*dt), which is what makes
        // the shared __pmAccumMs hand both runs the same TOTAL step count — 60 —
        // while distributing them 1-2 per frame in one run and 2-3 per frame in
        // the other. Anything else measures the accumulator rather than the
        // integrator: at 62 x 16 vs 31 x 32 the spans are 976 and 960 ms, which
        // differ by one 1/60 s step, and the runs then legitimately disagree by
        // exactly |v| * 0.016 with nothing wrong in the physics at all.
        // Rule 36's claim is N steps of h == 1 step of N h, and this is that claim.
        await h.pin(1); await h.tick(20, 2);
        await h.setState('STATE_1'); await h.tick(20, 51);
        const single = await h.snap();
        await h.pin(1); await h.tick(20, 2);
        await h.setState('STATE_1'); await h.tick(40, 26);
        const folded = await h.snap();
        const dsA = Math.abs(single.bodies['A'].s - folded.bodies['A'].s);
        const dvA = Math.abs(single.bodies['A'].v - folded.bodies['A'].v);
        const dsB = Math.abs(single.bodies['B'].s - folded.bodies['B'].s);
        const dvB = Math.abs(single.bodies['B'].v - folded.bodies['B'].v);
        chk('A8a_fold_exact_60_vs_120hz_across_a_collision',
            dsA < 1e-9 && dvA < 1e-9 && dsB < 1e-9 && dvB < 1e-9,
            'ΔsA=' + dsA.toExponential(2) + ' ΔvA=' + dvA.toExponential(2) +
            ' ΔsB=' + dsB.toExponential(2) + ' ΔvB=' + dvB.toExponential(2) +
            ' (contact ' + (single.events.length ? 'DID' : 'did NOT') + ' occur inside the folded span)');
        chk('A8b_fold_span_actually_contained_the_contact',
            single.events.length > 0 && folded.events.length === single.events.length,
            'events single=' + single.events.length + ' folded=' + folded.events.length);

        // 8c: a freeze pin holds the physics dead still.
        await h.setState('STATE_1');
        await h.pin(1400);
        for (let i = 0; i < 300; i++) {
            await h.tick(16.7, 8);
            const t = await h.page.evaluate(() => (window as any).PM_simTimeMs);
            if (typeof t === 'number' && t >= 1399) break;
        }
        const q1 = await h.snap();
        await h.tick(16.7, 25);
        const q2 = await h.snap();
        chk('A8c_frozen_state_byte_stable',
            JSON.stringify(q1.bodies) === JSON.stringify(q2.bodies) &&
            q1.tphys_ms === q2.tphys_ms && q1.F_contact === q2.F_contact,
            'bodies + tphys_ms + F_contact identical across 25 further ticks under the pin (tphys ' +
            q1.tphys_ms.toFixed(4) + ')');

        // 8d: rewind determinism — pin 3000 -> 9000 -> 3000 must return the SAME state.
        const pinTo = async (ms: number) => {
            await h.setState('STATE_1');
            await h.pin(ms);
            for (let i = 0; i < 600; i++) {
                await h.tick(16.7, 8);
                const t = await h.page.evaluate(() => (window as any).PM_simTimeMs);
                if (typeof t === 'number' && t >= ms - 1) break;
            }
            return await h.snap();
        };
        const r1 = await pinTo(3000);
        await pinTo(9000);
        const r3 = await pinTo(3000);
        chk('A8d_rewind_3000_9000_3000_is_identical',
            JSON.stringify(r1.bodies) === JSON.stringify(r3.bodies),
            'bodies identical after the round trip: ' + (JSON.stringify(r1.bodies) === JSON.stringify(r3.bodies)) +
            ' (A.s ' + r1.bodies['A'].s.toFixed(9) + ' -> ' + r3.bodies['A'].s.toFixed(9) + ')');
        results.fold = { dsA, dvA, dsB, dvB };
    }

    // ══ SEAM B — the instrument layer ════════════════════════════════════════
    // Every expectation below is derived HERE from the fixture's own masses and
    // speeds, or from the un-slowed control run; none of it is a number the
    // renderer handed over.
    {
        const trapz = (pts: number[][]) => {
            let a = 0;
            for (let i = 1; i < pts.length; i++) a += 0.5 * (pts[i][1] + pts[i - 1][1]) * (pts[i][0] - pts[i - 1][0]) / 1000;
            return a;
        };
        const num = (s: string) => Number(String(s).replace(/[^0-9.\-]/g, ''));

        // Run a state to completion while counting the frames the contact is open.
        async function runTimed(state: string, frames: number) {
            await h.setState(state);
            let engagedFrames = 0, tStart: number | null = null, tEnd: number | null = null;
            for (let i = 0; i < frames; i++) {
                await h.tick(16.7, 1);
                const l = await h.lite();
                if (l.engaged) { engagedFrames++; if (tStart == null) tStart = l.tphys_ms; }
                else if (tStart != null && tEnd == null) tEnd = l.tphys_ms;
            }
            return { engagedFrames, fin: await h.snap() };
        }

        // Control: the SAME collision with no slow window and no instruments.
        const ctl = await runTimed('STATE_5', 200);
        // Under test: identical physics + force trace + slow_window xSLOW_N.
        const slow = await runTimed('STATE_9', 360);
        const evC = ctl.fin.events[0], evS = slow.fin.events[0];

        // ── B1 — the DRAWN area is the impulse ──────────────────────────────
        // Read back out of the panel's own polyline (window.PM_mbTraceDrawn), not
        // out of the engine's sample buffer: this asserts what the teacher SEES.
        const drawn = slow.fin.traceDrawn;
        const drawnArea = drawn.length ? trapz(drawn[0].points) : 0;
        const dpExp = 2 * IMP_M * IMP_V;
        chk('B1_drawn_trace_area_equals_m_dv',
            drawn.length === 1 && rel(drawnArea, dpExp) <= 0.005,
            'traces drawn=' + drawn.length + ' pts=' + (drawn.length ? drawn[0].points.length : 0) +
            '; area under the DRAWN curve = ' + drawnArea.toFixed(6) + ' N·s vs m·Δv = ' +
            dpExp.toFixed(6) + ' (' + (100 * rel(drawnArea, dpExp)).toFixed(4) + '%, tol 0.5%)');
        chk('B1b_trace_panel_is_shown_and_filled',
            !!slow.fin.trace && slow.fin.trace.shown && !!slow.fin.traceAxes && slow.fin.traceAxes.fill &&
            drawn.length === 1 && drawn[0].filled,
            'panel shown=' + (slow.fin.trace && slow.fin.trace.shown) + ' fill_area=' +
            (slow.fin.traceAxes && slow.fin.traceAxes.fill) + ' axes window_ms=' +
            (slow.fin.traceAxes && slow.fin.traceAxes.window_ms) + ' F_max=' +
            (slow.fin.traceAxes && slow.fin.traceAxes.F_max));

        // ── B2 — the HUD reports the TRUE numbers while playback crawls ──────
        const trueF = num(slow.fin.hudRows['all_true_F_peak']);
        const trueDt = num(slow.fin.hudRows['all_true_dt']);
        const ctlF = num(ctl.fin.hudRows['all_true_F_peak']);
        const ctlDt = num(ctl.fin.hudRows['all_true_dt']);
        // The closed forms, derived here: F_peak = v√(kμ), t_c = π√(μ/k).
        const fPeakExp = IMP_V * Math.sqrt(IMP_K_SOFT * IMP_M);
        const tcExp = Math.PI * Math.sqrt(IMP_M / IMP_K_SOFT) * 1000;
        chk('B2_hud_true_values_unchanged_by_slow_motion',
            trueF === ctlF && trueDt === ctlDt &&
            rel(trueF, fPeakExp) <= 0.005 && rel(trueDt, tcExp) <= 0.02,
            'slowed HUD reads Fₚₑₐₖ ' + trueF + ' N / Δt ' + trueDt + ' ms; un-slowed control reads ' +
            ctlF + ' N / ' + ctlDt + ' ms; closed forms v√(kμ) = ' + fPeakExp.toFixed(2) +
            ' N and π√(μ/k) = ' + tcExp.toFixed(2) + ' ms');

        // ── B3 — slow_factor does NOT perturb the physics ────────────────────
        // Post-contact the ball is in free flight at constant v (mu_k = 0), so its
        // position at a COMMON physical time is exact from (s, v, tphys). That
        // makes the two runs comparable even though their frames land on different
        // physical instants — which is the whole point of a dt multiplier.
        const T_REF = 2000;   // ms of physical time
        const sAt = (st: Row) => st.bodies['BALL'].s + st.bodies['BALL'].v * (T_REF - st.tphys_ms) / 1000;
        const dV = Math.abs(slow.fin.bodies['BALL'].v - ctl.fin.bodies['BALL'].v);
        const dS = Math.abs(sAt(slow.fin) - sAt(ctl.fin));
        const dDur = rel(evS.duration_ms, evC.duration_ms);
        const dPk = rel(evS.F_peak, evC.F_peak);
        chk('B3_slow_factor_does_not_perturb_the_physics',
            dV < 1e-9 && dS < 1e-9 && dDur < 1e-9 && dPk < 1e-9,
            'Δv=' + dV.toExponential(2) + ' m/s  Δs@t=' + T_REF + 'ms=' + dS.toExponential(2) +
            ' m  Δduration=' + dDur.toExponential(2) + '  ΔF_peak=' + dPk.toExponential(2) +
            ' (tol 1e-9; the residuals are machine epsilon over ~300 frames)');
        // The recorded PULSE is the same pulse, sampled differently: a slowed frame
        // ends inside the contact ~SLOW_N times as often, and every segment end
        // emits one extra off-grid sample, so the slowed run trapezoids the SAME
        // continuous F(t) on a finer mesh. That is a quadrature difference, not a
        // physics difference — so it is asserted at quadrature scale, and BOTH
        // areas are separately held to the physical claim (m·Δv, 0.5%).
        const arS = areaOf(evS.samples), arC = areaOf(evC.samples);
        chk('B3b_slow_and_unslowed_impulse_agree_and_both_equal_m_dv',
            rel(arS, arC) < 1e-4 && rel(arS, dpExp) <= 0.005 && rel(arC, dpExp) <= 0.005,
            'slowed ∫F dt = ' + arS.toFixed(6) + ' N·s (' + evS.samples.length + ' samples) vs un-slowed ' +
            arC.toFixed(6) + ' (' + evC.samples.length + ' samples): ' + (100 * rel(arS, arC)).toFixed(6) +
            '% apart (tol 0.01%); both vs m·Δv = ' + dpExp.toFixed(6) + ' -> ' +
            (100 * rel(arS, dpExp)).toFixed(4) + '% / ' + (100 * rel(arC, dpExp)).toFixed(4) + '%');

        // ── B4 — only the PLAYBACK slows, and by exactly slow_factor ─────────
        // Measured as WALL CLOCK, not as a frame ratio: the un-slowed contact is
        // only ~13.3 frames long, so a frame ratio carries a +-1-frame (~7%)
        // quantisation error in its denominator and cannot resolve 20x at all.
        const FRAME_MS = 16.7;
        const trueDurMs = evC.duration_ms;
        const slowWall = slow.engagedFrames * FRAME_MS;
        const ctlWall = ctl.engagedFrames * FRAME_MS;
        const ratio = slow.engagedFrames / Math.max(1, ctl.engagedFrames);
        chk('B4_playback_wall_clock_scales_by_slow_factor',
            rel(slowWall, trueDurMs * SLOW_N) <= 0.02 && Math.abs(ctlWall - trueDurMs) <= 2 * FRAME_MS,
            'true contact = ' + trueDurMs.toFixed(2) + ' ms. Un-slowed it occupied ' + ctl.engagedFrames +
            ' frames = ' + ctlWall.toFixed(1) + ' ms of wall clock (within ' +
            (Math.abs(ctlWall - trueDurMs) / FRAME_MS).toFixed(2) + ' frames of true). At ×' + SLOW_N +
            ' it occupied ' + slow.engagedFrames + ' frames = ' + slowWall.toFixed(1) + ' ms vs the ×' +
            SLOW_N + ' expectation ' + (trueDurMs * SLOW_N).toFixed(1) + ' ms (' +
            (100 * rel(slowWall, trueDurMs * SLOW_N)).toFixed(3) + '%, tol 2%); raw frame ratio ' +
            ratio.toFixed(2) + '×');
        chk('B4b_slow_motion_badge_states_the_factor',
            !!slow.fin.badge,
            'badge element exists; text at end of run = "' + (slow.fin.badge ? slow.fin.badge.text : '') +
            '" shown=' + (slow.fin.badge ? slow.fin.badge.shown : 'n/a'));

        // The badge must be OPEN during the contact and CLOSED outside it — the
        // honesty requirement is a window, not a permanent label.
        await h.setState('STATE_9');
        let badgeOnDuringContact = false, badgeOffOutside = true, badgeText = '';
        for (let i = 0; i < 360; i++) {
            await h.tick(16.7, 1);
            const l = await h.lite();
            if (i % 3 !== 0 && !l.engaged) continue;
            const q = await h.snap();
            if (l.engaged) {
                if (q.badge && q.badge.shown) { badgeOnDuringContact = true; badgeText = q.badge.text; }
            } else if (q.badge && q.badge.shown) badgeOffOutside = false;
        }
        chk('B4c_badge_open_only_inside_the_contact_window',
            badgeOnDuringContact && badgeOffOutside && badgeText === 'slow motion ×' + SLOW_N,
            'shown during contact=' + badgeOnDuringContact + ', hidden outside it=' + badgeOffOutside +
            ', text="' + badgeText + '"');

        // ── B5 — the contact label is drawn on the contact ───────────────────
        const lblSnap = await h.snap();
        chk('B5_contact_label_drawn',
            !!lblSnap.objs['mb_contact_label'] && lblSnap.objs['mb_contact_label'].text === 'foam pad',
            'mb_contact_label text=' + JSON.stringify(lblSnap.objs['mb_contact_label'] &&
                lblSnap.objs['mb_contact_label'].text));

        // ── B6 — compare_with_previous_lane: two traces, ONE axis pair ───────
        const cmp = (await runTimed('STATE_10', 160)).fin;
        fs.writeFileSync(path.join(OUT, 'mb_compare.png'), await h.page.screenshot());
        const cd = cmp.traceDrawn;
        const areasCmp = cd.map((d: Row) => trapz(d.points));
        chk('B6_compare_draws_two_traces_on_one_shared_axis',
            cd.length === 2 && !!cmp.traceAxes && cmp.traceAxes.compare === true &&
            areasCmp.every((a: number) => rel(a, dpExp) <= 0.005),
            'traces drawn=' + cd.length + ' on ONE axis pair (window_ms=' +
            (cmp.traceAxes && cmp.traceAxes.window_ms) + ', F_max=' + (cmp.traceAxes && cmp.traceAxes.F_max) +
            '); drawn areas = [' + areasCmp.map((a: number) => a.toFixed(5)).join(', ') +
            '] N·s vs m·Δv = ' + dpExp.toFixed(5));

        // ── B7 — the momentum ledger tells the truth ─────────────────────────
        const led = (await runTimed('STATE_11', 200)).fin;
        const pA = EL_M1 * led.bodies['A'].v, pB = EL_M2 * led.bodies['B'].v;
        const keA = 0.5 * EL_M1 * led.bodies['A'].v * led.bodies['A'].v;
        const muL = EL_M1 * EL_M2 / (EL_M1 + EL_M2);
        const keAfterExp = 0.5 * (EL_M1 * EL_V1) * (EL_M1 * EL_V1) / (EL_M1 + EL_M2);
        const hudOk =
            num(led.hudRows['A_p']) === Number((pA).toFixed(2)) &&
            num(led.hudRows['B_p']) === Number((pB).toFixed(2)) &&
            num(led.hudRows['all_sum_p']) === Number((pA + pB).toFixed(2)) &&
            num(led.hudRows['A_KE']) === Number(keA.toFixed(2)) &&
            num(led.hudRows['all_sum_KE']) === Number(keAfterExp.toFixed(2));
        chk('B7_hud_ledger_matches_the_harness_own_arithmetic', hudOk,
            'HUD p₁=' + led.hudRows['A_p'] + ' (harness ' + pA.toFixed(2) + ')  p₂=' + led.hudRows['B_p'] +
            ' (' + pB.toFixed(2) + ')  Σp=' + led.hudRows['all_sum_p'] + ' (' + (pA + pB).toFixed(2) +
            ')  ΣKE=' + led.hudRows['all_sum_KE'] + ' (closed form p₀²/2(m₁+m₂) = ' + keAfterExp.toFixed(2) +
            ')  KE drop from ' + (0.5 * EL_M1 * EL_V1 * EL_V1).toFixed(2) + ' J, μ(Δv)²/2 = ' +
            (0.5 * muL * EL_V1 * EL_V1).toFixed(2) + ' J');
        chk('B7b_fixed_body_gets_no_zero_stub_rows',
            !('WALL_v' in slow.fin.hudRows) && !('WALL_p' in slow.fin.hudRows) && ('BALL_v' in slow.fin.hudRows),
            'wall_impact HUD rows = ' + JSON.stringify(Object.keys(slow.fin.hudRows)));

        // ── B8 — Rule 34d: the three overlays never collide ──────────────────
        await h.setState('STATE_9');
        for (let i = 0; i < 40; i++) await h.tick(16.7, 1);
        const zs = await h.snap();
        const rects = [['mb_readout', zs.hud], ['mb_trace', zs.trace], ['mb_slowmo', zs.badge],
        ['caption', zs.caption], ['legend', zs.legend]]
            .filter(r => r[1] && (r[1] as Row).shown && (r[1] as Row).rect.w > 0) as Array<[string, Row]>;
        let overlap = '';
        for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < rects.length; j++) {
                const a = rects[i][1].rect, b = rects[j][1].rect;
                if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
                    overlap += rects[i][0] + '/' + rects[j][0] + ' ';
                }
            }
        }
        // Only the scenario's OWN top-anchored panels have to clear the review
        // chrome; #caption is shared chrome itself and sits above it by design.
        const clearsChrome = rects.every(r => r[0] === 'caption' || r[1].rect.y >= 52 - 0.01);
        const legendOff = !zs.legend || !zs.legend.shown;
        chk('B8_overlay_zones_disjoint_and_clear_of_review_chrome',
            overlap === '' && clearsChrome && legendOff,
            rects.map(r => r[0] + '[' + Math.round(r[1].rect.x) + ',' + Math.round(r[1].rect.y) + ' ' +
                Math.round(r[1].rect.w) + '×' + Math.round(r[1].rect.h) + ']').join(' | ') +
            '; collisions: ' + (overlap || 'NONE') + '; every scenario panel top ≥ 52px: ' + clearsChrome +
            '; generic #legend suppressed: ' + legendOff);

        // ── B9 — Rule 34c: real Unicode on ALL THREE text paths ─────────────
        // DOM innerHTML rows, canvas fillText labels and the 3D sprite label all
        // live in the one momentum_bench region, so ONE scan covers all three —
        // and it is the only way to see the canvas path at all (a fillText string
        // never lands in the DOM).
        {
            const src = fs.readFileSync(RENDERER_SRC, 'utf8');
            const a = src.indexOf('SEAM B — THE INSTRUMENT LAYER');
            const b = src.indexOf('function applyMomentumBenchGlow');
            const region = a >= 0 && b > a ? src.slice(a, b) : '';
            const bad = [/"[^"]*kg\.m\/s/, /"[^"]*N\.s"/, /"Sigma/, /"F_peak *=/, /"Fpeak/, /"delta t/i, /"[^"]*\bx *" *\+ *[a-z]*[Ff]actor/];
            const badHits = bad.filter(r => r.test(region)).map(r => String(r));
            const want = ['Σp', 'ΣKE', 'kg·m/s', 'N·s', 'Fₚₑₐₖ', 'Δt', 'slow motion ×', 'F (N)', 't (ms)', 'Cambria Math'];
            const missing = want.filter(t => region.indexOf(t) < 0);
            chk('B9_all_on_canvas_math_is_real_unicode',
                region.length > 0 && badHits.length === 0 && missing.length === 0,
                region.length + ' chars of SEAM B scanned; ASCII transcriptions found: ' +
                (badHits.length ? badHits.join(' | ') : 'NONE') + '; required Unicode present: ' +
                (missing.length ? 'MISSING ' + missing.join(', ') : want.join(' ')));
        }

        // ── A8e — the frozen frame is byte-identical, PIXELS included ────────
        // Now that instruments are drawn this is a real test: HUD text, the trace
        // polyline+fill, the badge and the arrows all have to land on the same
        // pixels tick after tick under the pin.
        await h.setState('STATE_9');
        await h.pin(2000);
        for (let i = 0; i < 400; i++) {
            await h.tick(16.7, 8);
            const t = await h.page.evaluate(() => (window as any).PM_simTimeMs);
            if (typeof t === 'number' && t >= 1999) break;
        }
        const pixA = await h.page.screenshot();
        const stA = await h.snap();
        await h.tick(16.7, 25);
        const pixB = await h.page.screenshot();
        await h.tick(16.7, 40);
        const pixC = await h.page.screenshot();
        const stC = await h.snap();
        fs.writeFileSync(path.join(OUT, 'mb_frozen.png'), pixA);
        chk('A8e_frozen_frame_byte_identical_pixels',
            Buffer.compare(pixA, pixB) === 0 && Buffer.compare(pixA, pixC) === 0 &&
            JSON.stringify(stA.hudRows) === JSON.stringify(stC.hudRows),
            'pinned at 2000 ms mid-contact (arrows + HUD + filled trace + badge all drawn); ' +
            pixA.length + '-byte PNG identical after +25 ticks = ' + (Buffer.compare(pixA, pixB) === 0) +
            ' and after +65 ticks = ' + (Buffer.compare(pixA, pixC) === 0) +
            '; HUD text identical = ' + (JSON.stringify(stA.hudRows) === JSON.stringify(stC.hudRows)) +
            ' (badge shown=' + (stA.badge && stA.badge.shown) + ', trace shown=' + (stA.trace && stA.trace.shown) + ')');

        results.seam_b = {
            drawn_area: drawnArea, expected_area: dpExp,
            hud_true_F_peak: trueF, hud_true_dt: trueDt, control_F_peak: ctlF, control_dt: ctlDt,
            engaged_frames_control: ctl.engagedFrames, engaged_frames_slow: slow.engagedFrames,
            slow_ratio: ratio, compare_areas: areasCmp,
            zones: rects.map(r => ({ id: r[0], rect: r[1].rect })),
        };
    }

    // ══ SEAM C — two lanes, controls, ramp, sandbox, formula surface ═════════
    {
        // ── C1 — THE TWO-LANE CASE ───────────────────────────────────────────
        // Two contacts of DIFFERENT stiffness, running at the SAME TIME in two
        // lanes. Every number below is derived here from the harness's own
        // masses and speeds; the engine is never asked what to expect.
        await h.setState('STATE_12');
        let bothEngagedFrames = 0, maxSimul = 0;
        for (let i = 0; i < 260; i++) {
            await h.tick(16.7, 1);
            const q = await h.lite();
            if (q.nEngaged > maxSimul) maxSimul = q.nEngaged;
            if (q.nEngaged >= 2) bothEngagedFrames++;
        }
        const two = await h.snap();
        chk('C1a_two_lane_contacts_are_built_and_engage_simultaneously',
            two.contacts.length === 2 && maxSimul === 2 && bothEngagedFrames > 0 &&
            two.contacts[0].k === IMP_K_SOFT && two.contacts[1].k === IMP_K_STIFF &&
            two.contacts[0].lane === 'soft' && two.contacts[1].lane === 'rigid',
            'contacts=' + two.contacts.length + ' [' +
            two.contacts.map((c: Row) => c.lane + ' k=' + c.k + ' ' + c.loId + '/' + c.hiId +
                ' "' + c.label + '"').join(' | ') +
            ']; frames with BOTH engaged at once = ' + bothEngagedFrames + ' (max simultaneous ' + maxSimul + ')');

        // The claim itself: equal AREAS, different PEAKS.
        const evS = two.events.find((e: Row) => e.k === IMP_K_SOFT);
        const evR = two.events.find((e: Row) => e.k === IMP_K_STIFF);
        const dp2 = 2 * IMP_M * IMP_V;                    // |Δp| for an elastic wall bounce
        const aS = evS ? areaOf(evS.samples) : 0, aR = evR ? areaOf(evR.samples) : 0;
        const pS = evS ? peakOf(evS.samples) : 0, pR = evR ? peakOf(evR.samples) : 0;
        const kRatio = IMP_K_STIFF / IMP_K_SOFT;
        const peakRatio = pS > 0 ? pR / pS : 0;
        chk('C1b_two_lane_areas_agree_while_peaks_differ',
            !!evS && !!evR &&
            rel(aS, dp2) <= 0.01 && rel(aR, dp2) <= 0.01 &&
            rel(peakRatio, Math.sqrt(kRatio)) <= 0.02,
            'soft  ∫F dt = ' + aS.toFixed(6) + ' N·s (vs m·Δv = ' + dp2.toFixed(6) + ', ' +
            (100 * rel(aS, dp2)).toFixed(4) + '%)  Fₚₑₐₖ = ' + pS.toFixed(4) + ' N | ' +
            'rigid ∫F dt = ' + aR.toFixed(6) + ' N·s (' + (100 * rel(aR, dp2)).toFixed(4) + '%)  Fₚₑₐₖ = ' +
            pR.toFixed(4) + ' N | areas agree to ' + (100 * rel(aS, aR)).toFixed(4) +
            '%; peak ratio ' + peakRatio.toFixed(5) + ' vs √(k ratio ' + kRatio + ') = ' +
            Math.sqrt(kRatio).toFixed(5) + ' (' + (100 * rel(peakRatio, Math.sqrt(kRatio))).toFixed(4) + '%)');

        // …and the PANEL actually drew both, on one shared axis pair.
        const cd2 = two.traceDrawn || [];
        const drawnAreas2 = cd2.map((d: Row) => areaOf(d.points));
        chk('C1c_panel_draws_both_lanes_on_one_shared_axis',
            cd2.length === 2 && !!two.traceAxes && two.traceAxes.compare === true &&
            drawnAreas2.every((a: number) => rel(a, dp2) <= 0.01) &&
            Math.max(...cd2.map((d: Row) => d.F_peak)) / Math.min(...cd2.map((d: Row) => d.F_peak)) >= 3,
            'traces drawn=' + cd2.length + ' on ONE axis (window_ms=' +
            (two.traceAxes && two.traceAxes.window_ms) + ', F_max=' + (two.traceAxes && two.traceAxes.F_max) +
            '); drawn areas = [' + drawnAreas2.map((a: number) => a.toFixed(5)).join(', ') +
            '] N·s vs ' + dp2.toFixed(5) + '; drawn peaks = [' +
            cd2.map((d: Row) => Number(d.F_peak).toFixed(2)).join(', ') + '] N');
        chk('C1d_each_lane_body_drawn_in_its_own_lane',
            Math.abs(two.objs['mb_body_BALLA'].z - (-1.3 * 0.5)) < 1e-9 &&
            Math.abs(two.objs['mb_body_BALLB'].z - (1.3 * 0.5)) < 1e-9 &&
            two.objs['mb_contact_element'] && two.objs['mb_contact_element_1'],
            'BALLA z=' + two.objs['mb_body_BALLA'].z.toFixed(4) + ' BALLB z=' +
            two.objs['mb_body_BALLB'].z.toFixed(4) + ' (offset_z_m ∓1.3 × 0.5 world/m); ' +
            'two contact elements built = ' +
            (!!two.objs['mb_contact_element'] && !!two.objs['mb_contact_element_1']));
        results.two_lane = {
            areas: [aS, aR], peaks: [pS, pR], expected_area: dp2,
            peak_ratio: peakRatio, sqrt_k_ratio: Math.sqrt(kRatio),
            drawn_areas: drawnAreas2, both_engaged_frames: bothEngagedFrames,
        };

        // ── C2 — validate:concepts REJECTS sticks + preload_m ────────────────
        // Asserted by calling the schema directly. Nothing is written into
        // src/data/concepts/ — a fixture file there would be swept into the
        // authoring gates and fail for a dozen unrelated reasons.
        {
            // superRefine only runs when the BASE object parses, so the probe is
            // built on a real, currently-passing concept and swaps in nothing but
            // the field_3d_config block. Nothing is written to disk, so
            // validate:concepts' own 145-file count cannot move.
            const baseConcept = JSON.parse(fs.readFileSync(
                path.join(process.cwd(), 'src', 'data', 'concepts', 'block_on_incline.json'), 'utf8'));
            const baseOk = conceptJsonSchema.safeParse(baseConcept).success;
            const mk = (contact: Record<string, unknown>) => Object.assign({}, baseConcept, {
                field_3d_config: {
                    scenario_type: 'momentum_bench',
                    states: { STATE_1: { momentum_bench: { bodies: [], contact } } },
                },
            });
            const hit = (o: unknown) => {
                const r = conceptJsonSchema.safeParse(o);
                if (r.success) return [];
                return r.error.issues
                    .filter(i => i.path.join('.').indexOf('momentum_bench.contact') >= 0)
                    .map(i => i.message);
            };
            const bad = hit(mk({ between: ['A', 'B'], stiffness_N_per_m: 300, sticks: true, preload_m: 0.25 }));
            const ok1 = hit(mk({ between: ['A', 'B'], stiffness_N_per_m: 300, preload_m: 0.25 }));
            const ok2 = hit(mk({ between: ['A', 'B'], stiffness_N_per_m: 300, sticks: true }));
            chk('C2_validator_rejects_sticks_plus_preload_and_allows_each_alone',
                baseOk && bad.length === 1 && bad[0].indexOf('Gate 8m') === 0 &&
                ok1.length === 0 && ok2.length === 0,
                'base concept parses = ' + baseOk + '; both authored → ' + bad.length +
                ' issue(s): ' + (bad[0] || 'NONE') +
                ' | preload_m alone → ' + ok1.length + ' issue(s) | sticks alone → ' + ok2.length + ' issue(s)');
        }

        // ── C3 — renderer fallback: loud, and preload_m wins ─────────────────
        {
            const g = await open('mb_seam_c_contra', CONTRA);
            await g.setState('STATE_1');
            for (let i = 0; i < 120; i++) await g.tick(16.7, 1);
            const cs = await g.page.evaluate(SNAP);
            const loud = g.errors.filter(e => e.indexOf('sticks') >= 0 && e.indexOf('preload_m') >= 0);
            const sep = Math.abs(cs.bodies['B'].s - cs.bodies['A'].s);
            const pSum = EX_M1 * cs.bodies['A'].v + EX_M2 * cs.bodies['B'].v;
            chk('C3_renderer_logs_error_and_honours_preload_over_sticks',
                loud.length > 0 && cs.contacts[0].sticks === false && cs.contacts[0].preload === EX_PRE &&
                !cs.contacts[0].latched && cs.bodies['A'].v < -1e-6 && cs.bodies['B'].v > 1e-6 &&
                Math.abs(pSum) <= 1e-9,
                'console error logged = ' + (loud.length > 0) + ' (' + (loud[0] || '').slice(0, 96) + '…); ' +
                'contact sticks=' + cs.contacts[0].sticks + ' preload=' + cs.contacts[0].preload +
                ' latched=' + cs.contacts[0].latched + '; the pair EXPLODED apart: v_A=' +
                cs.bodies['A'].v.toFixed(6) + ' v_B=' + cs.bodies['B'].v.toFixed(6) +
                ' separation=' + sep.toFixed(4) + ' m; Σp=' + pSum.toExponential(3) + ' (must stay 0)');
            await g.browser.close();
        }

        // ── C4 — Rule 31 rows: exactly the requested ones, at fixed slots ─────
        await h.setState('STATE_13');
        await h.tick(16.7, 4);
        const s13 = await h.snap();
        await h.setState('STATE_14');
        await h.tick(16.7, 4);
        const s14 = await h.snap();
        const shown = (s: Row) => Object.keys(s.rows).filter(k => s.rows[k].shown).sort();
        chk('C4a_controls_visible_shows_exactly_the_requested_rows',
            JSON.stringify(shown(s13)) === JSON.stringify(['mb_k_row', 'mb_v1_row']) &&
            JSON.stringify(shown(s14)) === JSON.stringify(['mb_k_row']) &&
            s13.sliders.shown === true && s14.sliders.shown === true,
            'slots built = [' + s13.ctrlSlots.join(', ') + ']; STATE_13 (v1+k) shows [' +
            shown(s13).join(', ') + ']; STATE_14 (k) shows [' + shown(s14).join(', ') + ']');
        const kA = s13.rows['mb_k_row'].rect, kB = s14.rows['mb_k_row'].rect;
        chk('C4b_shared_slider_holds_the_same_screen_position_across_states',
            kA.x === kB.x && kA.y === kB.y && kA.w === kB.w && kA.h === kB.h,
            'mb_k_row STATE_13 [' + kA.x + ',' + kA.y + ' ' + kA.w + '×' + kA.h +
            '] vs STATE_14 [' + kB.x + ',' + kB.y + ' ' + kB.w + '×' + kB.h + ']' +
            ' — v₁ hidden in STATE_14, k must not move');

        // ── C5 — a TRUSTED drag changes the physics live ─────────────────────
        await h.setState('STATE_13');
        await h.tick(16.7, 4);
        const before = await h.snap();
        const emitted: Row[] = [];
        await h.page.evaluate(() => {
            (window as any).__MB_PARAMS = [];
            window.addEventListener('message', (e: any) => {
                if (e.data && e.data.type === 'PARAM_UPDATE') (window as any).__MB_PARAMS.push(e.data);
            });
        });
        await h.page.locator('#mb_v1_slider').fill('1.2');   // a REAL, trusted input event
        await h.tick(16.7, 1);
        const after = await h.snap();
        emitted.push(...(await h.page.evaluate(() => (window as any).__MB_PARAMS || [])));
        chk('C5_slider_drag_changes_the_physics_live_and_emits_param_update',
            Math.abs(before.bodies['BALL'].v - IMP_V) < 1e-9 &&
            Math.abs(after.bodies['BALL'].v - 1.2) < 1e-9 &&
            emitted.some(m => m.param === 'v1' && Math.abs(m.value - 1.2) < 1e-9) &&
            after.rows['mb_v1_row'].text.indexOf('1.2') >= 0,
            'v was ' + before.bodies['BALL'].v.toFixed(4) + ' m/s; after filling #mb_v1_slider = 1.2 → ' +
            after.bodies['BALL'].v.toFixed(4) + ' m/s; PARAM_UPDATE = ' +
            JSON.stringify(emitted.filter(m => m.param === 'v1').slice(-1)) +
            '; row text now "' + after.rows['mb_v1_row'].text.trim() + '"');

        // ── C6 — param_ramp drives from → to over its declared window ────────
        await h.setState('STATE_14');
        const rampSeen: Array<[number, number]> = [];
        for (let i = 0; i < 200; i++) {
            await h.tick(16.7, 1);
            const q = await h.page.evaluate(() => {
                const e = (window as any).PM_mbEngine;
                return [e.t_ms, e.contacts[0].k] as [number, number];
            });
            rampSeen.push(q);
        }
        const kAt = (t: number) => {
            let best: [number, number] = rampSeen[0];
            for (const r of rampSeen) if (Math.abs(r[0] - t) < Math.abs(best[0] - t)) best = r;
            return best;
        };
        const want = (t: number) => RAMP_K0 + (RAMP_K1 - RAMP_K0) * Math.min(1, Math.max(0, t / RAMP_MS));
        const probes = [0, 500, 1000, 1500, 2000, 3000].map(t => {
            const [tt, kk] = kAt(t);
            return { t, tt, kk, exp: want(tt) };
        });
        chk('C6_param_ramp_drives_its_parameter_from_to_over_the_window',
            probes.every(p => rel(p.kk, p.exp) <= 0.02) &&
            Math.abs(rampSeen[rampSeen.length - 1][1] - RAMP_K1) < 1e-9,
            'k(t): ' + probes.map(p => 't≈' + Math.round(p.tt) + 'ms k=' + p.kk.toFixed(1) +
                ' (exp ' + p.exp.toFixed(1) + ')').join(' | ') +
            '; holds at ' + rampSeen[rampSeen.length - 1][1].toFixed(1) +
            ' after end_ms (from ' + RAMP_K0 + ' → ' + RAMP_K1 + ' over ' + RAMP_MS + ' ms)');

        // ── C7 — Rule 37 sandbox: it never sits dead, and a drag seizes it ────
        await h.setState('STATE_15');
        let nev = 0;
        for (let i = 0; i < 400; i++) { await h.tick(16.7, 1); nev = (await h.lite()).nev; }
        const sandA = await h.snap();
        // A REAL mouse drag on the range thumb. locator.fill() sets the value
        // programmatically, so its input event carries isTrusted=false — which is
        // exactly what THE EYE and any scripted driver produce, and exactly what
        // must NOT seize the bench. Only a genuine pointer interaction may.
        const kBox = await h.page.locator('#mb_k_slider').boundingBox();
        if (kBox) {
            await h.page.mouse.move(kBox.x + kBox.width * 0.5, kBox.y + kBox.height / 2);
            await h.page.mouse.down();
            await h.page.mouse.move(kBox.x + kBox.width * 0.62, kBox.y + kBox.height / 2, { steps: 4 });
            await h.page.mouse.up();
        }
        const kAfterDrag = await h.page.evaluate(() => (window as any).PM_mbEngine.contacts[0].k);
        const nevAtSeize = (await h.lite()).nev;
        for (let i = 0; i < 400; i++) await h.tick(16.7, 1);
        const sandB = await h.snap();
        chk('C7_sandbox_free_runs_and_a_trusted_drag_seizes_the_sweep',
            nev >= 3 && sandA.seized === false && sandB.seized === true &&
            sandB.events.length === nevAtSeize &&
            sandB.contacts[0].k === kAfterDrag && kAfterDrag !== IMP_K_SOFT,
            'repeat_every_ms=1400: ' + nev + ' contact events recorded over ~6.7 s of free-running clock ' +
            '(the bench keeps demonstrating, Rule 37); seized before drag = ' + sandA.seized +
            '; after a REAL mouse drag on #mb_k_slider → seized = ' + sandB.seized +
            ', events frozen at ' + nevAtSeize + ' → ' + sandB.events.length +
            ' over a further ~6.7 s (the idle sweep stopped re-arming), k moved ' + IMP_K_SOFT +
            ' → ' + kAfterDrag + ' N/m and HELD at ' + sandB.contacts[0].k);

        // ── C8 — the formula surface + Rule 34d with the two new zones ────────
        await h.setState('STATE_12');
        for (let i = 0; i < 30; i++) await h.tick(16.7, 1);
        const zc = await h.snap();
        await h.setState('STATE_13');
        for (let i = 0; i < 30; i++) await h.tick(16.7, 1);
        const zd = await h.snap();
        chk('C8a_formula_surface_is_one_symbolic_equation_and_carries_no_value',
            zc.formula.shown === true && zc.formula.text.trim() === 'J = FΔt = Δp' &&
            zd.formula.text.trim() === 'J = mΔv' &&
            !/[0-9]/.test(zc.formula.text) && !/[0-9]/.test(zd.formula.text) &&
            zc.hud.shown === true,
            'STATE_12 #mb_formula = "' + zc.formula.text.trim() + '" | STATE_13 = "' +
            zd.formula.text.trim() + '"; contains no digit = ' +
            (!/[0-9]/.test(zc.formula.text) && !/[0-9]/.test(zd.formula.text)) +
            '; the value-only HUD stays a SEPARATE surface, shown = ' + zc.hud.shown);
        const zr = [['mb_readout', zd.hud], ['mb_trace', zd.trace], ['mb_slowmo', zd.badge],
        ['mb_formula', zd.formula], ['mb_sliders', zd.sliders], ['caption', zd.caption], ['legend', zd.legend]]
            .filter(r => r[1] && (r[1] as Row).shown && (r[1] as Row).rect.w > 0) as Array<[string, Row]>;
        // STATE_12 draws the trace + formula together; STATE_13 draws the sliders
        // + formula. Both are checked, so no pair of zones escapes the test.
        const zr2 = [['mb_readout', zc.hud], ['mb_trace', zc.trace], ['mb_slowmo', zc.badge],
        ['mb_formula', zc.formula], ['mb_sliders', zc.sliders], ['caption', zc.caption], ['legend', zc.legend]]
            .filter(r => r[1] && (r[1] as Row).shown && (r[1] as Row).rect.w > 0) as Array<[string, Row]>;
        const collide = (rs: Array<[string, Row]>) => {
            let o = '';
            for (let i = 0; i < rs.length; i++) {
                for (let j = i + 1; j < rs.length; j++) {
                    const a = rs[i][1].rect, b = rs[j][1].rect;
                    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) o += rs[i][0] + '/' + rs[j][0] + ' ';
                }
            }
            return o;
        };
        const fmt = (rs: Array<[string, Row]>) => rs.map(r => r[0] + '[' + Math.round(r[1].rect.x) + ',' +
            Math.round(r[1].rect.y) + ' ' + Math.round(r[1].rect.w) + '×' + Math.round(r[1].rect.h) + ']').join(' ');
        chk('C8b_all_overlay_zones_including_formula_and_sliders_are_disjoint',
            collide(zr) === '' && collide(zr2) === '' &&
            zr.some(r => r[0] === 'mb_sliders') && zr2.some(r => r[0] === 'mb_trace') &&
            zr.every(r => r[0] === 'caption' || r[1].rect.y >= 52 - 0.01),
            'STATE_13 zones: ' + fmt(zr) + ' → collisions: ' + (collide(zr) || 'NONE') +
            ' || STATE_12 zones: ' + fmt(zr2) + ' → collisions: ' + (collide(zr2) || 'NONE'));
        results.seam_c_zones = {
            state_13: zr.map(r => ({ id: r[0], rect: r[1].rect })),
            state_12: zr2.map(r => ({ id: r[0], rect: r[1].rect })),
        };
    }

    // ══ Scene skeleton — the meshes must EXIST, not merely be declared ═══════
    {
        await h.setState('STATE_2');
        await h.tick(16.7, 6);
        const s = await h.snap();
        chk('S1_track_and_bodies_built',
            !!s.objs['mb_track'] && !!s.objs['mb_body_BALL'] && !!s.objs['mb_body_WALL'] &&
            s.objs['mb_body_BALL'].visible === true && s.objs['mb_body_WALL'].visible === true,
            'mb_track=' + !!s.objs['mb_track'] + ' ball=' + !!s.objs['mb_body_BALL'] + ' wall=' + !!s.objs['mb_body_WALL']);
        chk('S2_body_mesh_tracks_its_physics_position',
            Math.abs(s.objs['mb_body_BALL'].x - s.bodies['BALL'].s * 0.5) < 1e-9,
            'mesh x=' + s.objs['mb_body_BALL'].x.toFixed(6) + ' vs s·WORLD_PER_M=' + (s.bodies['BALL'].s * 0.5).toFixed(6));
        // The contact element must be a real, visibly COMPRESSING object.
        const spans: number[] = [];
        for (let i = 0; i < 40; i++) {
            await h.tick(16.7, 1);
            const q = await h.snap();
            const ce = q.objs['mb_contact_element'];
            if (ce && ce.visible) spans.push(ce.sx);
        }
        chk('S3_contact_element_exists_and_compresses',
            spans.length > 0 && (Math.max(...spans) - Math.min(...spans)) > 0.02,
            'visible on ' + spans.length + ' frames; span ' + (spans.length ? Math.min(...spans).toFixed(4) : '--') +
            ' -> ' + (spans.length ? Math.max(...spans).toFixed(4) : '--') + ' world units');
        chk('S4_body_absent_from_a_state_is_hidden',
            s.objs['mb_body_A'] ? s.objs['mb_body_A'].visible === false : true,
            'STATE_2 lists BALL + WALL only; mb_body_A visible=' + (s.objs['mb_body_A'] || {}).visible);
        fs.writeFileSync(path.join(OUT, 'mb_scene.png'), await h.page.screenshot());
    }

    chk('Z_no_page_errors', h.errors.length === 0, JSON.stringify(h.errors.slice(0, 3)));
    results.errors = h.errors.slice(0, 8);
    await h.browser.close();

    fs.writeFileSync(path.join(OUT, 'probe.json'), JSON.stringify(results, null, 1), 'utf8');
    const failed = checks.filter(c => !c.ok);
    console.log('\n──────────────────────────────');
    console.log(checks.length + ' checks · ' + (checks.length - failed.length) + ' passed · ' + failed.length + ' failed');
    if (failed.length) console.log('FAILED: ' + failed.map(f => f.id).join(', '));
    console.log('probe.json + screenshot -> ' + OUT);
    process.exit(failed.length ? 1 : 0);
})();
