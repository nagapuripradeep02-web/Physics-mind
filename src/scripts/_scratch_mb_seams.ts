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
    // Scene-wide census of ANY object that is, or ever was, the contact element:
    // matched on a SUBSTRING of both id and elementType, so a renamed or
    // re-prefixed survivor is still caught. The founder ruling of 2026-08-01 is
    // that this number is 0, always, in every state, engaged or not — nothing is
    // drawn between the two bodies.
    let ceGeom = 0;
    const ceIds: string[] = [];
    scene.traverse((o: any) => {
        const ud0 = o.userData || {};
        const sid = String(ud0.id || ''), set = String(ud0.elementType || '');
        if (sid.indexOf('contact_element') >= 0 || set.indexOf('contact_element') >= 0) {
            ceGeom++;
            if (ceIds.length < 6) ceIds.push(sid + '/' + set + '/vis=' + o.visible);
        }
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
        p_before: e.p_before, p_after: e.p_after,
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
        bodies, events, objs, arrows, hudRows, contacts, rows, ceGeom, ceIds,
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

// The per-frame probe for the RAMPED write-path: every live value mbSetParam can
// write, plus whether a contact segment is being solved right now. Cheap enough
// to call on every one of ~300 frames (SNAP serialises every force sample and is
// far too heavy for that). Same rule as SNAP: no named local function inside.
const RAMP_LITE = () => {
    const eng = (window as any).PM_mbEngine;
    const c0 = (eng.contacts || [])[0] || null;
    let engaged = 0;
    for (const c of (eng.contacts || [])) if (c && c.engaged && !c.latched) engaged++;
    const mov: any[] = [];
    for (const id of eng.order) { const b = eng.bodies[id]; if (b && !b.fixed) mov.push(b); }
    return {
        t_ms: eng.t_ms as number,
        engaged: engaged > 0,
        k: c0 ? (c0.k as number) : 0,
        cdamp: c0 ? (c0.c as number) : 0,
        v: mov[0] ? (mov[0].v as number) : 0,
        v0: mov[0] ? (mov[0].v0 as number) : 0,
        s: mov[0] ? (mov[0].s as number) : 0,
        m1: mov[0] ? (mov[0].m as number) : 0,
        m2: mov[1] ? (mov[1].m as number) : 0,
        nev: (eng.events || []).length as number,
    };
};
type RampFrame = ReturnType<typeof RAMP_LITE>;
// Consecutive runs of frames on which a contact segment was being solved. One run
// = one engaged segment, which is the window inside which k and m must not move.
function engagedRuns(fr: RampFrame[]): RampFrame[][] {
    const runs: RampFrame[][] = [];
    let cur: RampFrame[] = [];
    for (const f of fr) {
        if (f.engaged) cur.push(f);
        else if (cur.length) { runs.push(cur); cur = []; }
    }
    if (cur.length) runs.push(cur);
    return runs;
}
const spread = (xs: number[]) => (xs.length ? Math.max(...xs) - Math.min(...xs) : 0);
// The plain, un-quantised linear sweep — i.e. what param_ramp has always done and
// what mode:'continuous' (and mode absent) must keep doing exactly.
const contRamp = (from: number, to: number, ms: number, t: number) =>
    from + (to - from) * Math.min(1, Math.max(0, t / ms));
// Per repeat_every_ms cycle: the frames of that cycle, the ramped value it was
// armed with, and the FREE-FLIGHT window between the re-arm and that cycle's first
// contact. The run-up window is the whole point — a body with nothing touching it
// must hold its speed, and `drift` is exactly the defect this measures.
type CycleReport = {
    cycle: number; frames: RampFrame[]; n: number;
    value: number; jitter: number; runup: number[]; launch: number; drift: number;
};
function cycleReport(fr: RampFrame[], rep: number, read: (f: RampFrame) => number = f => f.v0): CycleReport[] {
    const byCycle = new Map<number, RampFrame[]>();
    for (const f of fr) {
        const c = Math.floor(f.t_ms / rep);
        if (!byCycle.has(c)) byCycle.set(c, []);
        (byCycle.get(c) as RampFrame[]).push(f);
    }
    const out: CycleReport[] = [];
    for (const c of Array.from(byCycle.keys()).sort((a, b) => a - b)) {
        const fs2 = byCycle.get(c) as RampFrame[];
        const iEng = fs2.findIndex(f => f.engaged);
        const runFr = (iEng >= 0 ? fs2.slice(0, iEng) : fs2).filter(f => !f.engaged);
        const runup = runFr.map(f => Math.abs(f.v));
        const vals = fs2.map(read);
        out.push({
            cycle: c, frames: fs2, n: fs2.length,
            value: vals[0], jitter: spread(vals),
            runup, launch: runup.length ? runup[0] : NaN, drift: spread(runup),
        });
    }
    return out;
}

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
// 8) SEAM C — the param_ramp WRITE-PATH, one fixture per ramped parameter.
// mbSetParam is the single write-path, so 'v1' and 'm2' ride branches that the
// k-only ramp above never touched: v1 writes a body's LIVE velocity and m2 its
// MASS, and both of those sit inside a segment the contact solver is already
// solving. ('m1' shares the m2 branch, 'v2' the v1 branch and 'c' the k branch,
// so these three fixtures cover every branch of the write-path.)
const VR_FROM = 1.5, VR_TO = 4.0, VR_MS = 3000;                   // v1, one flight
const VC_FROM = 1.5, VC_TO = 4.5, VC_MS = 6000, VC_REP = 1500;    // v1, re-armed per cycle
const KR_FROM = 2000, KR_TO = 200, KR_MS = 4000, KR_REP = 1200;   // k, across contacts
const MR_FROM = 2, MR_TO = 5, MR_MS = 4000, MR_REP = 1500;        // m2, across contacts
// 9) SEAM C — param_ramp.mode 'step'. The SAME ramp is authored three ways —
// step, explicit continuous, and mode absent — over IDENTICAL apparatus, so the
// only difference between the three runs IS the mode key.
//   end_ms = SP_N x SP_REP, which is the sizing relationship the JSON author uses:
// cycles 0..SP_N land u = 0, 1/N ... 1, i.e. SP_N+1 distinct launches spanning
// from -> to inclusive; every later cycle clamps at `to`.
const SP_FROM = 1.5, SP_TO = 4.5, SP_REP = 1200, SP_N = 4, SP_MS = SP_REP * SP_N;
const SP_S0 = -1.6;                                  // ball start; run-up = 0.62 m
// 10) SEAM C — a k ramp in step mode, to prove the composition with the
// mbContactBusy deferral guard (k acts only DURING contact, so step mode must not
// disturb it).
const SK_FROM = 2000, SK_TO = 400, SK_REP = 1200, SK_N = 3, SK_MS = SK_REP * SK_N;
// 11) THE SEIZE LIFETIME. A long k ramp (so it is still mid-window when the drag
// lands, and still writing after it) over a short repeat cycle, in a state that
// authorises the sandbox seize.
const SD_FROM = 2000, SD_TO = 200, SD_MS = 9000, SD_REP = 1200;

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
    // S16–S19 — THE RAMPED WRITE-PATH, one state per ramped parameter, every one
    // of them running a ramp straight THROUGH a contact. S14 above ramps k and is
    // only ever read between contacts, which is exactly how a write that lands in
    // the middle of a flight (v1) or in the middle of a solved segment (k, m2)
    // stayed invisible.
    STATE_16: benchState('v₁ ramped, one flight', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -2, initial_velocity_mps: VR_FROM },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_STIFF }, {
        controls_visible: ['v1'],
        param_ramp: { param: 'v1', from: VR_FROM, to: VR_TO, start_ms: 0, end_ms: VR_MS },
    }),
    STATE_17: benchState('v₁ ramped, re-armed each cycle', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -2, initial_velocity_mps: VC_FROM },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_STIFF }, {
        controls_visible: ['v1'],
        param_ramp: { param: 'v1', from: VC_FROM, to: VC_TO, start_ms: 0, end_ms: VC_MS },
        repeat_every_ms: VC_REP,
    }),
    STATE_18: benchState('k ramped across contacts', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -1.6, initial_velocity_mps: IMP_V },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: KR_FROM }, {
        controls_visible: ['k'],
        param_ramp: { param: 'k', from: KR_FROM, to: KR_TO, start_ms: 0, end_ms: KR_MS },
        repeat_every_ms: KR_REP,
    }),
    STATE_19: benchState('m₂ ramped across contacts', 'collision', [
        { id: 'A', label: 'm₁', mass_kg: EL_M1, shape: 'cart', initial_position_m: -3, initial_velocity_mps: EL_V1 },
        { id: 'B', label: 'm₂', mass_kg: MR_FROM, shape: 'cart', initial_position_m: 0 },
    ], { between: ['A', 'B'], stiffness_N_per_m: EL_K }, {
        controls_visible: ['m2'],
        param_ramp: { param: 'm2', from: MR_FROM, to: MR_TO, start_ms: 0, end_ms: MR_MS },
        repeat_every_ms: MR_REP,
    }),
    // S20–S23 — param_ramp.mode. S20/S21/S22 are the SAME apparatus and the SAME
    // ramp authored step / explicit-continuous / mode-absent, so any difference
    // between the three runs is the mode key and nothing else. S21 IS the pre-fix
    // engine's code path, byte for byte, which is what makes it both the defect
    // exhibit and the default-path regression guard.
    STATE_20: benchState('v₁ ramped, STEP per cycle', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: SP_S0, initial_velocity_mps: SP_FROM },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_STIFF }, {
        controls_visible: ['v1'],
        param_ramp: { param: 'v1', from: SP_FROM, to: SP_TO, start_ms: 0, end_ms: SP_MS, mode: 'step' },
        repeat_every_ms: SP_REP,
    }),
    STATE_21: benchState('v₁ ramped, explicit CONTINUOUS', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: SP_S0, initial_velocity_mps: SP_FROM },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_STIFF }, {
        controls_visible: ['v1'],
        param_ramp: { param: 'v1', from: SP_FROM, to: SP_TO, start_ms: 0, end_ms: SP_MS, mode: 'continuous' },
        repeat_every_ms: SP_REP,
    }),
    STATE_22: benchState('v₁ ramped, mode ABSENT', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: SP_S0, initial_velocity_mps: SP_FROM },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_STIFF }, {
        controls_visible: ['v1'],
        param_ramp: { param: 'v1', from: SP_FROM, to: SP_TO, start_ms: 0, end_ms: SP_MS },
        repeat_every_ms: SP_REP,
    }),
    // S24 — the SEIZE LIFETIME fixture: a scripted k ramp, a repeat cycle and a
    // sandbox seize all at once. It is the only state in which the two consumers
    // of a seize can be told apart, because they want DIFFERENT lifetimes: the
    // repeat cycle must resume when the drag ends, the ramp must stay overridden.
    STATE_24: benchState('Seize lifetime: ramp + repeat + sandbox', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: -1.6, initial_velocity_mps: IMP_V },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: SD_FROM }, {
        controls_visible: ['k'],
        param_ramp: { param: 'k', from: SD_FROM, to: SD_TO, start_ms: 0, end_ms: SD_MS },
        trusted_drag_seizes: true,
        repeat_every_ms: SD_REP,
    }),
    STATE_23: benchState('k ramped, STEP per cycle', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: SP_S0, initial_velocity_mps: IMP_V },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: SK_FROM }, {
        controls_visible: ['k'],
        param_ramp: { param: 'k', from: SK_FROM, to: SK_TO, start_ms: 0, end_ms: SK_MS, mode: 'step' },
        repeat_every_ms: SK_REP,
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

// Likewise its own page: mode 'step' with NO repeat_every_ms is the other
// deliberate contradiction, and it too must be LOUD.
const STEPBAD = benchConfig({
    STATE_1: benchState('step ramp, no repeat cycle', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: IMP_M, shape: 'ball', initial_position_m: SP_S0, initial_velocity_mps: SP_FROM },
        { id: 'WALL', label: 'wall', mass_kg: 1, shape: 'wall', initial_position_m: 0, fixed: true },
    ], { between: ['BALL', 'WALL'], stiffness_N_per_m: IMP_K_STIFF }, {
        controls_visible: ['v1'],
        param_ramp: { param: 'v1', from: SP_FROM, to: SP_TO, start_ms: 0, end_ms: SP_MS, mode: 'step' },
    }),
});

// ── D — THE DEPARTURE RE-ARM (2026-08-01) ────────────────────────────────────
// Every state below is impulse STATE_8's apparatus EXACTLY — the DEFAULT 6 m
// track (no track key on that state), ball at −1.4 m, wall at +2.0 m, natural
// length 0.4 m, slow ×10, repeat_every_ms 2314 — with ONE CORNER of the three
// exposed slider ranges baked in as authored values. Baking beats driving the
// sliders here: mbSetParam has its own deferral semantics (4ecae93) and this
// section is about the RE-ARM, not the write-path.
//   The corners are the real MB_CTRL_SPEC extremes: m₁ 0.5…10 kg, v₁ −6…6 m/s,
// k 50…5000 N/m. Contact duration is π√(m/k) × slow_factor, i.e. 0.31 s at
// (0.5, 5000) and 14.05 s at (10, 50) — a 45× spread that NO single fixed
// period can serve, which is the whole reason this section exists.
const S8_REP = 2314, S8_S0 = -1.4, S8_WALL = 2.0, S8_LEN = 6, S8_SLOW = 10;
const M_LO = 0.5, M_HI = 10, V_MAX = 6, K_LO = 50, K_HI = 5000;
function sandboxCorner(m: number, v: number, k: number) {
    return benchState('m=' + m + ' v=' + v + ' k=' + k, 'sandbox', [
        { id: 'BALL', label: 'm', mass_kg: m, shape: 'ball', initial_position_m: S8_S0, initial_velocity_mps: v },
        { id: 'WALL', label: ' ', mass_kg: 1, shape: 'wall', initial_position_m: S8_WALL, fixed: true },
    ], {
        between: ['BALL', 'WALL'], stiffness_N_per_m: k, damping_Ns_per_m: 0,
        natural_length_m: 0.4, label: 'wall',
    }, {
        track: { length_m: S8_LEN },
        slow_window: { slow_factor: S8_SLOW, badge: true },
        readouts: ['v', 'p', 'F_contact'],
        force_trace: { show: true, fill_area: true, peak_marker: true },
        controls_visible: ['m1', 'v1', 'k'],
        trusted_drag_seizes: true,
        repeat_every_ms: S8_REP,
        formula: 'F̄Δt = Δp',
    });
}
// The eight corners of (m₁, k) × (v₁ min, max). v₁ NEGATIVE walks the ball AWAY
// from the wall toward the FAR clamp with no contact in the run at all — that
// path must re-arm too, and nothing about a contact can rescue it.
const CORNERS: Array<[number, number, number]> = [
    [M_LO, V_MAX, K_HI], [M_LO, -V_MAX, K_HI],
    [M_HI, V_MAX, K_LO], [M_HI, -V_MAX, K_LO],
    [M_LO, V_MAX, K_LO], [M_LO, -V_MAX, K_LO],
    [M_HI, V_MAX, K_HI], [M_HI, -V_MAX, K_HI],
];
// ── E — slow_window.from_cycle apparatus ─────────────────────────────────────
// mu = m (the wall is fixed, i.e. infinite mass), so t_c = pi sqrt(m/k) exactly.
const FC_M = 1, FC_K = 2000, FC_V = 6, FC_SLOW = 10, FC_LEN = 3, FC_S0 = -1.4, FC_WALL = 2.0;
const FC_TC_MS = Math.PI * Math.sqrt(FC_M / FC_K) * 1000;      // 70.248 ms, derived HERE
function fromCycleState(label: string, slow: Record<string, unknown>) {
    return benchState(label, 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: FC_M, shape: 'ball', initial_position_m: FC_S0, initial_velocity_mps: FC_V },
        { id: 'WALL', label: ' ', mass_kg: 1, shape: 'wall', initial_position_m: FC_WALL, fixed: true },
    ], {
        between: ['BALL', 'WALL'], stiffness_N_per_m: FC_K, damping_Ns_per_m: 0,
        natural_length_m: 0.4, label: 'rigid wall',
    }, {
        track: { length_m: FC_LEN }, slow_window: slow,
        readouts: ['v', 'p', 'F_contact'],
        force_trace: { show: true, fill_area: true, peak_marker: true },
        // Long enough that the DEPARTURE re-arm (not the period) ends every cycle,
        // which is the harder half of "both re-arm reasons count".
        repeat_every_ms: 20000,
    });
}
const REARM = benchConfig({
    STATE_1: sandboxCorner(CORNERS[0][0], CORNERS[0][1], CORNERS[0][2]),
    STATE_2: sandboxCorner(CORNERS[1][0], CORNERS[1][1], CORNERS[1][2]),
    STATE_3: sandboxCorner(CORNERS[2][0], CORNERS[2][1], CORNERS[2][2]),
    STATE_4: sandboxCorner(CORNERS[3][0], CORNERS[3][1], CORNERS[3][2]),
    STATE_5: sandboxCorner(CORNERS[4][0], CORNERS[4][1], CORNERS[4][2]),
    STATE_6: sandboxCorner(CORNERS[5][0], CORNERS[5][1], CORNERS[5][2]),
    STATE_7: sandboxCorner(CORNERS[6][0], CORNERS[6][1], CORNERS[6][2]),
    STATE_8: sandboxCorner(CORNERS[7][0], CORNERS[7][1], CORNERS[7][2]),
    // The AUTHORED default of impulse STATE_8 — the middle of every range. Its
    // cycle must stay EXACTLY the authored 2314 ms period: the departure guard
    // is a bound on the period, never a replacement for it.
    STATE_9: sandboxCorner(1.0, 3.0, 2000),
    // impulse STATE_2 — a GUIDED state with a fixed period, replicated verbatim
    // (slow ×20, repeat 4080). The regression guard: its re-arms must still land
    // on the authored period boundaries and nowhere else.
    STATE_10: benchState('Guided replica of impulse STATE_2', 'wall_impact', [
        { id: 'BALL', label: 'm', mass_kg: 1, shape: 'ball', initial_position_m: -3, initial_velocity_mps: 3 },
        { id: 'WALL', label: ' ', mass_kg: 1, shape: 'wall', initial_position_m: 2, fixed: true },
    ], {
        between: ['BALL', 'WALL'], stiffness_N_per_m: 2000, damping_Ns_per_m: 0,
        natural_length_m: 0.4, label: 'rigid wall',
    }, {
        track: { length_m: S8_LEN }, slow_window: { slow_factor: 20, badge: true },
        readouts: ['v', 'p', 'F_contact'], repeat_every_ms: 4080,
    }),
    // impulse STATE_5 — the two-lane guided state whose authored 4900 ms period
    // is ALREADY too long for its 6 m track: today the ball reaches the far end
    // and is clamped dead for ~0.5 s of every cycle. Same bug_class, in a state
    // nobody suspected.
    STATE_11: benchState('Guided replica of impulse STATE_5', 'wall_impact', [
        { id: 'BALLA', label: 'm', mass_kg: 1, shape: 'ball', initial_position_m: -3, initial_velocity_mps: 3 },
        { id: 'WALLA', label: ' ', mass_kg: 1, shape: 'wall', initial_position_m: 2, fixed: true },
        { id: 'BALLB', label: 'm', mass_kg: 1, shape: 'ball', initial_position_m: -3, initial_velocity_mps: 3 },
        { id: 'WALLB', label: ' ', mass_kg: 1, shape: 'wall', initial_position_m: 2, fixed: true },
    ], {
        between: ['BALLA', 'WALLA'], stiffness_N_per_m: 2000, damping_Ns_per_m: 0,
        natural_length_m: 0.4, label: 'soft pad',
    }, {
        track: { length_m: S8_LEN }, slow_window: { slow_factor: 10, badge: true },
        lanes: [
            { id: 'soft', offset_z_m: -1.3, bodies: ['BALLA', 'WALLA'] },
            { id: 'rigid', offset_z_m: 1.3, bodies: ['BALLB', 'WALLB'], contact_override: { stiffness_N_per_m: 2000 } },
        ],
        readouts: ['v', 'p', 'F_contact'], repeat_every_ms: 4900,
    }),
    // ── E — slow_window.from_cycle (founder ruling 2026-08-01) ───────────────
    //   "For the first few seconds show the ball go, collide, and come back at
    // NORMAL speed — don't slow it down. After that, in the next pass, slow down
    // the ball at the contact." Reality first, then the magnifier.
    //   ONE apparatus, authored THREE ways, so the only difference between the
    // three runs IS the from_cycle key: 12 opts in at cycle 1, 13 omits the key
    // entirely (today's behaviour) and 14 writes the explicit default 0. 13 and 14
    // must be indistinguishable from each other and from the pre-2026-08-01
    // engine — that is the regression guard.
    //   m = 1 kg into a FIXED wall, so mu = m and t_c = pi sqrt(1/2000) =
    // 70.248 ms, the number the founder's dispatch quotes. v = 6 m/s and a 3 m
    // track keep one whole cycle inside ~1.1 s of wall clock so both passes fit a
    // 260-frame budget even with the second one stretched x10.
    STATE_12: fromCycleState('from_cycle 1 — true speed, then slow', { slow_factor: FC_SLOW, badge: true, from_cycle: 1 }),
    STATE_13: fromCycleState('no from_cycle — the unchanged default', { slow_factor: FC_SLOW, badge: true }),
    STATE_14: fromCycleState('from_cycle 0 — the explicit default', { slow_factor: FC_SLOW, badge: true, from_cycle: 0 }),
});
// ONE round trip per state: tick and sample INSIDE the page (a per-frame
// page.evaluate over 1500 frames × 11 states is minutes of IPC). Same rule as
// SNAP — no named local function inside the probe (tsx keepNames).
const REARM_RUN = ([n, d]: [number, number]) => {
    const w = window as any;
    const out: any[] = [];
    for (let i = 0; i < n; i++) {
        w.__MB_TICK(d, 1);
        const eng = w.PM_mbEngine;
        let busy = 0;
        for (const c of (eng.contacts || [])) if (c && c.engaged && !c.latched) busy++;
        let s = 0, v = 0, s0 = 0, v0 = 0;
        for (const id of eng.order) {
            const b = eng.bodies[id];
            if (b && !b.fixed) { s = b.s; v = b.v; s0 = b.s0; v0 = b.v0; break; }
        }
        out.push({
            t: eng.t_ms, s: s, v: v, s0: s0, v0: v0, busy: busy > 0,
            bh: eng.bound_hits, bha: eng.bound_hits_all || 0,
            ra: eng.rearms || 0, inC: eng.rearm_in_contact || 0,
            nev: (eng.events || []).length,
        });
    }
    return out;
};
type RearmFrame = { t: number; s: number; v: number; s0: number; v0: number; busy: boolean; bh: number; bha: number; ra: number; inC: number; nev: number };
// ── E — the from_cycle probe ────────────────────────────────────────────────
//   Reads BOTH clocks on the same frame. That pairing is the whole measurement:
// eng.t_ms is the STATE (wall) clock and advances by the raw frame dt; eng.tphys_ms
// is the PHYSICAL clock and advances by the MULTIPLIED dt. Their ratio over an
// engaged window is therefore exactly 1 at true speed and exactly 1/slow_factor
// while the magnifier is on — with NO frame-quantisation error, because both
// numbers are sampled on the same frames. The engaged-frame wall-clock span is
// reported too (that is what a teacher actually watches), but the ratio is what
// the assertion rests on.
//   Same rule as SNAP: no named local function inside the probe (tsx keepNames).
const FC_RUN = ([n, d]: [number, number]) => {
    const w = window as any;
    const out: any[] = [];
    for (let i = 0; i < n; i++) {
        w.__MB_TICK(d, 1);
        const eng = w.PM_mbEngine;
        let busy = 0;
        for (const c of (eng.contacts || [])) if (c && c.engaged && !c.latched) busy++;
        const bg = document.getElementById('mb_slowmo');
        let ce = 0;
        const sc = w.__MB_SCENE;
        if (sc) sc.traverse((o: any) => {
            const ud = o.userData || {};
            if (String(ud.id || '').indexOf('contact_element') >= 0 ||
                String(ud.elementType || '').indexOf('contact_element') >= 0) ce++;
        });
        let s = 0, v = 0;
        for (const id of eng.order) {
            const b = eng.bodies[id];
            if (b && !b.fixed) { s = b.s; v = b.v; break; }
        }
        out.push({
            t: eng.t_ms, tp: eng.tphys_ms, s: s, v: v, busy: busy > 0,
            ra: eng.rearms || 0, sa: !!eng.slow_active,
            bg: !!bg && getComputedStyle(bg).display !== 'none',
            bt: bg ? (bg.textContent || '') : '',
            nev: (eng.events || []).length, ce: ce,
        });
    }
    return out;
};
type FcFrame = { t: number; tp: number; s: number; v: number; busy: boolean; ra: number; sa: boolean; bg: boolean; bt: string; nev: number; ce: number };
// One engaged window per pass, tagged with the re-arm cycle it belongs to.
type FcPass = { cycle: number; n: number; wallMs: number; physMs: number; ratio: number; badgeOn: number; badgeText: string };
function fcPasses(fr: FcFrame[]): FcPass[] {
    const out: FcPass[] = [];
    let cur: FcFrame[] = [];
    for (let i = 0; i <= fr.length; i++) {
        const f = i < fr.length ? fr[i] : null;
        if (f && f.busy) { cur.push(f); continue; }
        if (!cur.length) continue;
        const a = cur[0], z = cur[cur.length - 1];
        const wall = z.t - a.t, phys = z.tp - a.tp;
        out.push({
            cycle: a.ra, n: cur.length, wallMs: wall, physMs: phys,
            ratio: wall > 0 ? phys / wall : NaN,
            badgeOn: cur.filter(x => x.bg).length,
            badgeText: (cur.find(x => x.bg) || { bt: '' }).bt,
        });
        cur = [];
    }
    return out;
}
// A re-arm is visible WITHOUT asking the engine: the body is put back at its
// authored home pose AND relaunched at its authored speed. Derived this way the
// same detector reads the PRE-fix engine (which has no counter at all) and the
// post-fix one.
//   POSITION ALONE IS NOT ENOUGH, and that is a trap worth keeping: a period
// re-arm can land on the frame the returning ball happens to be PASSING its own
// start point (impulse STATE_8's default does exactly that — it is back at
// −1.395 m when the 2314 ms boundary fires from −1.400 m), so a jump test sees
// nothing at all. The launch VELOCITY is what makes it unambiguous: after the
// rebound the body carries −v₀ and only a re-arm can restore +v₀.
function rearmFrames(fr: RearmFrame[]): number[] {
    const home = fr.map(f =>
        Math.abs(f.s - f.s0) <= Math.abs(f.v0) * 0.06 + 1e-9 && Math.abs(f.v - f.v0) < 1e-9);
    const idx: number[] = [];
    for (let i = 1; i < fr.length; i++) if (home[i] && !home[i - 1]) idx.push(i);
    return idx;
}

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
        // REWORKED 2026-08-01: this used to close on "two contact elements built".
        // There are no contact elements any more (founder ruling — nothing is drawn
        // between the bodies), so the per-lane claim now rests on the two things
        // that DO still separate the lanes visually: each lane's body sits at its
        // own z, and each lane's contact NAMEPLATE sits over the lane it names.
        // Two travelling names sweeping through each other was the M2 defect; two
        // names parked in two different lanes is the lesson.
        const lbA = two.objs['mb_contact_label'], lbB = two.objs['mb_contact_label_1'];
        chk('C1d_each_lane_body_and_its_nameplate_are_drawn_in_their_own_lane',
            Math.abs(two.objs['mb_body_BALLA'].z - (-1.3 * 0.5)) < 1e-9 &&
            Math.abs(two.objs['mb_body_BALLB'].z - (1.3 * 0.5)) < 1e-9 &&
            !!lbA && !!lbB && lbA.visible === true && lbB.visible === true &&
            Math.abs(lbA.z - (-1.3 * 0.5)) < 1e-9 && Math.abs(lbB.z - (1.3 * 0.5)) < 1e-9 &&
            lbA.text !== lbB.text && two.ceGeom === 0,
            'BALLA z=' + two.objs['mb_body_BALLA'].z.toFixed(4) + ' BALLB z=' +
            two.objs['mb_body_BALLB'].z.toFixed(4) + ' (offset_z_m ∓1.3 × 0.5 world/m); ' +
            'nameplates "' + (lbA ? lbA.text : '--') + '" at z=' + (lbA ? lbA.z.toFixed(4) : '--') +
            ' and "' + (lbB ? lbB.text : '--') + '" at z=' + (lbB ? lbB.z.toFixed(4) : '--') +
            ', each over its own lane; contact-element objects in the scene = ' + two.ceGeom);
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

            // ── C2b — validate:concepts REJECTS mode:'step' with no repeat cycle
            const mkR = (mbExtra: Record<string, unknown>) => Object.assign({}, baseConcept, {
                field_3d_config: {
                    scenario_type: 'momentum_bench',
                    states: { STATE_1: { momentum_bench: Object.assign({ bodies: [] }, mbExtra) } },
                },
            });
            const hitR = (o: unknown) => {
                const r = conceptJsonSchema.safeParse(o);
                if (r.success) return [];
                return r.error.issues
                    .filter(i => i.path.join('.').indexOf('momentum_bench.param_ramp') >= 0)
                    .map(i => i.message);
            };
            const stepRamp = { param: 'v1', from: 1.5, to: 4.5, start_ms: 0, end_ms: 4800, mode: 'step' };
            const badR = hitR(mkR({ param_ramp: stepRamp }));
            const badR0 = hitR(mkR({ param_ramp: stepRamp, repeat_every_ms: 0 }));
            const okR1 = hitR(mkR({ param_ramp: stepRamp, repeat_every_ms: 1200 }));
            const okR2 = hitR(mkR({ param_ramp: Object.assign({}, stepRamp, { mode: 'continuous' }) }));
            const okR3 = hitR(mkR({ param_ramp: { param: 'v1', from: 1.5, to: 4.5, start_ms: 0, end_ms: 4800 } }));
            chk('C2b_validator_rejects_step_mode_without_repeat_every_ms',
                badR.length === 1 && badR[0].indexOf('Gate 8n') === 0 &&
                badR0.length === 1 && okR1.length === 0 && okR2.length === 0 && okR3.length === 0,
                'mode:"step" with no repeat_every_ms → ' + badR.length + ' issue(s): ' + (badR[0] || 'NONE') +
                ' | repeat_every_ms:0 → ' + badR0.length + ' issue(s) | + repeat_every_ms:1200 → ' +
                okR1.length + ' | mode:"continuous" alone → ' + okR2.length + ' | mode absent → ' + okR3.length);
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

        // ── C7 — Rule 37 sandbox: it never sits dead, and a HELD drag seizes it ─
        //   A seize is a LEASE, not a latch. C7 covers the half that must HOLD:
        //   while the teacher's pointer is physically down the bench must not
        //   re-arm under their hand. M3a below covers the half that must END.
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
        }
        const kAfterDrag = await h.page.evaluate(() => (window as any).PM_mbEngine.contacts[0].k);
        const nevAtSeize = (await h.lite()).nev;
        // STILL HELD — the pointer has not been released yet.
        for (let i = 0; i < 400; i++) await h.tick(16.7, 1);
        const sandB = await h.snap();
        chk('C7_sandbox_free_runs_and_a_held_trusted_drag_seizes_the_sweep',
            nev >= 3 && sandA.seized === false && sandB.seized === true &&
            sandB.events.length === nevAtSeize &&
            sandB.contacts[0].k === kAfterDrag && kAfterDrag !== IMP_K_SOFT,
            'repeat_every_ms=1400: ' + nev + ' contact events recorded over ~6.7 s of free-running clock ' +
            '(the bench keeps demonstrating, Rule 37); seized before drag = ' + sandA.seized +
            '; with a REAL mouse drag on #mb_k_slider STILL HELD DOWN → seized = ' + sandB.seized +
            ', events frozen at ' + nevAtSeize + ' → ' + sandB.events.length +
            ' over a further ~6.7 s (no re-arm under the teacher’s hand), k moved ' + IMP_K_SOFT +
            ' → ' + kAfterDrag + ' N/m and HELD at ' + sandB.contacts[0].k);

        // ── M3a — THE SEIZE IS A LEASE: it RELEASES, and the cycle resumes ────
        //   THE DEFECT: window.PM_mbSeized was set by the first trusted drag and
        //   never cleared by anything — no pointerup, no timeout, no state entry
        //   — so one slider touch permanently stopped mbRunRepeat from re-arming.
        //   The ball finished its last flight, ran to the end of the track, was
        //   clamped to v = 0 by mbClampToTrack and sat dead for the rest of the
        //   session while the HUD kept printing the previous impact's true
        //   Fₚₑₐₖ / Δt. Founder screen recording, 2026-08-01.
        await h.page.mouse.up();
        const relA = await h.snap();
        const nevAtRelease = relA.events.length;
        const relFr: RampFrame[] = [];
        for (let i = 0; i < 500; i++) { await h.tick(16.7, 1); relFr.push(await h.page.evaluate(RAMP_LITE)); }
        const relB = await h.snap();
        const tail = relFr.slice(-120);
        const movingTail = tail.filter(f => Math.abs(f.v) > 0.5).length;
        const cyclesAfter = (relFr[relFr.length - 1].t_ms - relFr[0].t_ms) / 1400;
        chk('M3a_a_released_seize_lets_the_repeat_cycle_resume_and_the_bench_move_again',
            relA.seized === false && relB.seized === false &&
            relB.events.length >= nevAtRelease + 3 &&
            movingTail >= 100 && Math.abs(relB.bodies['BALL'].v) > 0 &&
            relB.bound_hits === 0 && relB.contacts[0].k === kAfterDrag,
            'pointerup → seized = ' + relA.seized + ' immediately (the lease ends with the drag); over a ' +
            'further ' + cyclesAfter.toFixed(1) + ' repeat cycles the events resumed ' + nevAtRelease +
            ' → ' + relB.events.length + ' (pre-fix: frozen forever), |v| > 0.5 m/s on ' + movingTail +
            '/120 of the last frames (pre-fix: the ball is parked at the track end at v = 0.00), ' +
            'track-bound clamps = ' + relB.bound_hits + ', and the teacher’s k = ' +
            relB.contacts[0].k + ' N/m survived every re-arm');

        // ── M3b — the two consumers have DIFFERENT lifetimes ─────────────────
        //   The repeat cycle RESUMES after the drag (a sandbox that stops
        //   bouncing is the defect above); the scripted ramp on the parameter the
        //   teacher took hold of stays overridden for the rest of the state
        //   (resuming a sweep that fights the teacher's setting every frame would
        //   be worse). One flag cannot express both, which is why the fix models
        //   them separately.
        await h.setState('STATE_24');
        const sd0: RampFrame[] = [];
        for (let i = 0; i < 90; i++) { await h.tick(16.7, 1); sd0.push(await h.page.evaluate(RAMP_LITE)); }
        const kRampMoved = spread(sd0.map(f => f.k));
        const sdBox = await h.page.locator('#mb_k_slider').boundingBox();
        if (sdBox) {
            await h.page.mouse.move(sdBox.x + sdBox.width * 0.5, sdBox.y + sdBox.height / 2);
            await h.page.mouse.down();
            await h.page.mouse.move(sdBox.x + sdBox.width * 0.30, sdBox.y + sdBox.height / 2, { steps: 4 });
            await h.page.mouse.up();
        }
        const kSeized = await h.page.evaluate(() => (window as any).PM_mbEngine.contacts[0].k);
        const sdAt = await h.snap();
        const sd1: RampFrame[] = [];
        for (let i = 0; i < 300; i++) { await h.tick(16.7, 1); sd1.push(await h.page.evaluate(RAMP_LITE)); }
        const sdB = await h.snap();
        const kHeld = spread(sd1.map(f => f.k));
        const wantRamp = contRamp(SD_FROM, SD_TO, SD_MS, sd1[sd1.length - 1].t_ms);
        chk('M3b_the_repeat_cycle_resumes_but_the_ramp_on_a_seized_parameter_stays_overridden',
            kRampMoved > 100 &&
            kHeld === 0 && sd1.every(f => f.k === kSeized) && kSeized !== SD_FROM &&
            Math.abs(wantRamp - kSeized) > 100 &&
            sdB.events.length >= sdAt.events.length + 3 && sdB.seized === false,
            'k ramp ' + SD_FROM + ' → ' + SD_TO + ' N/m over ' + SD_MS + ' ms, repeat_every_ms=' + SD_REP +
            ', trusted_drag_seizes: before the drag the scripted sweep moved k by ' + kRampMoved.toFixed(1) +
            ' N/m; a REAL drag + RELEASE set k = ' + kSeized + ' N/m and it then held EXACTLY (spread ' +
            kHeld.toFixed(9) + ' N/m over ' + sd1.length + ' frames) while the un-overridden ramp would have ' +
            'written ' + wantRamp.toFixed(1) + ' N/m — the ramp stayed overridden. Over the SAME frames the ' +
            'repeat cycle RESUMED: events ' + sdAt.events.length + ' → ' + sdB.events.length +
            ', seized = ' + sdB.seized + ' (two consumers, two lifetimes)');

        // ── M1 (REWORKED 2026-08-01) — NOTHING is drawn between the bodies ────
        //   HISTORY. M1 was born as "the contact element is drawn only while the
        //   contact is engaged": mbFitContactElement had fitted a yellow box
        //   between the two facing faces on EVERY frame, so a 0.4 m element
        //   stretched across a 2.6 m approach and rendered as a solid rod glued
        //   between ball and wall through the whole free flight. Engaged-only made
        //   the physics honest, and the founder rejected it anyway (video review,
        //   2026-08-01): a thing that pops into existence at impact still reads as
        //   a THIRD OBJECT between the two bodies, and in a real collision nothing
        //   arrives at the collision. "Don't put anything between the wall and the
        //   ball during the collision — in ALL the states."
        //   THE NEW INVARIANT, which is what this now asserts: NO contact-element
        //   geometry is visible in ANY state, engaged or not — while what does
        //   render the interaction survives, namely the equal-and-opposite force
        //   arrows and the wall nameplate.
        //   Swept across the three shapes a state can take (single wall impact,
        //   two-lane compare, cart–cart), because "in ALL the states" is the ruling.
        type CeFrame = { st: string; engaged: boolean; ce: number; ids: string[] };
        const ceFr: CeFrame[] = [];
        for (const st of ['STATE_2', 'STATE_10', 'STATE_1']) {
            await h.setState(st);
            await h.tick(16.7, 4);
            for (let i = 0; i < 44; i++) {
                await h.tick(16.7, 1);
                const q = await h.snap();
                ceFr.push({
                    st, engaged: (q.contacts || []).some((c: Row) => c && c.engaged),
                    ce: q.ceGeom, ids: q.ceIds,
                });
            }
        }
        const freeFr = ceFr.filter(f => !f.engaged);
        const engFr = ceFr.filter(f => f.engaged);
        const withCe = ceFr.filter(f => f.ce > 0);
        // What must REMAIN at the contact: the equal-and-opposite arrow pair and
        // the nameplate — read on an engaged frame of the wall-impact state, and
        // the nameplate must not depend on any element mesh existing (M2's anchor).
        await h.setState('STATE_9');            // the state that authors contact.label
        let armed: Row | null = null;
        for (let i = 0; i < 120 && !armed; i++) {
            await h.tick(16.7, 1);
            const q = await h.snap();
            if (q.contacts[0] && q.contacts[0].engaged) armed = q;
        }
        const liveArrows = armed ? Object.keys(armed.arrows).filter(k => /^mb_arrow_/.test(k) && armed!.arrows[k].visible) : [];
        const nameplate = armed ? armed.objs['mb_contact_label'] : null;
        chk('M1_no_contact_element_geometry_in_any_state_engaged_or_not',
            freeFr.length > 40 && engFr.length > 5 && withCe.length === 0 &&
            armed !== null && liveArrows.length === 2 &&
            !!nameplate && nameplate.visible === true && nameplate.text === 'foam pad',
            'swept STATE_2 (wall impact) + STATE_10 (two lanes) + STATE_1 (cart–cart), ' +
            ceFr.length + ' frames = ' + freeFr.length + ' with no contact engaged + ' + engFr.length +
            ' engaged. Frames carrying ANY object whose id or elementType contains "contact_element": ' +
            withCe.length + '/' + ceFr.length + ' (must be 0; pre-fix the scene carried 3 of them in ' +
            'every single frame, drawn on the engaged ones)' +
            (withCe.length ? ' witness ' + JSON.stringify(withCe[0].ids) : '') +
            '. What REMAINS at the contact on an engaged frame: ' + liveArrows.length +
            ' visible force arrows ' + JSON.stringify(liveArrows) + ' and the nameplate "' +
            (nameplate ? nameplate.text : '(missing)') + '" at x=' +
            (nameplate ? nameplate.x.toFixed(3) : '--') + ' — the label survives the mesh removal.');

        // ── M2 — the contact label NAMES THE APPARATUS, so it must not move ───
        //   THE DEFECT: the label was anchored to the contact element's midpoint,
        //   which moves with the ball — so the WALL's own name ("rigid wall" /
        //   "padded wall") slid to and fro across the apparatus on every cycle,
        //   and in the two-lane state the two travelling names swept through each
        //   other and through the ball labels.
        //   Founder screen recording, 2026-08-01.
        await h.setState('STATE_10');                              // repeat_every_ms = 1200
        await h.tick(16.7, 4);
        const lbFr: Array<{ x: number; y: number; z: number; vis: boolean; bx: number }> = [];
        for (let i = 0; i < 150; i++) {
            await h.tick(16.7, 1);
            const q = await h.snap();
            const lb = q.objs['mb_contact_label'];
            lbFr.push({
                x: lb.x, y: lb.y, z: lb.z, vis: !!lb.visible,
                bx: q.objs['mb_body_BALL'].x,
            });
        }
        const lbSpread = { x: spread(lbFr.map(f => f.x)), y: spread(lbFr.map(f => f.y)), z: spread(lbFr.map(f => f.z)) };
        const ballSwing = spread(lbFr.map(f => f.bx));
        const wallX = (await h.snap()).objs['mb_body_WALL'].x;
        chk('M2_contact_label_holds_still_at_the_fixed_body_across_a_whole_repeat_cycle',
            lbFr.every(f => f.vis) &&
            lbSpread.x === 0 && lbSpread.y === 0 && lbSpread.z === 0 &&
            ballSwing > 0.5 && lbFr[0].x > wallX,
            'repeat_every_ms=1200, ' + lbFr.length + ' frames ≈ ' +
            (150 * 16.7 / 1200).toFixed(1) + ' cycles: the ball swept ' + ballSwing.toFixed(3) +
            ' world units while the "foam pad" label moved (Δx, Δy, Δz) = (' +
            lbSpread.x.toFixed(9) + ', ' + lbSpread.y.toFixed(9) + ', ' + lbSpread.z.toFixed(9) +
            ') — all three must be exactly 0. It sits at x = ' + lbFr[0].x.toFixed(3) +
            ', behind the fixed wall at x = ' + wallX.toFixed(3) + ', visible on every frame = ' +
            lbFr.every(f => f.vis));

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

        // ── C9–C12 — THE RAMPED WRITE-PATH, ACROSS A CONTACT ─────────────────
        // C6 above ramps k and reads it only BETWEEN contacts, so two whole
        // branches of mbSetParam (the live velocity, the mass) and every instant
        // INSIDE a contact went untested. Everything expected below is derived
        // here from the harness's own masses, speeds and ramp windows.
        const rampAt = (from: number, to: number, ms: number, t: number) =>
            from + (to - from) * Math.min(1, Math.max(0, t / ms));

        // C9 — v1 ramped through ONE flight. The ball must rebound and LEAVE.
        await h.setState('STATE_16');
        const fr16: RampFrame[] = [];
        for (let i = 0; i < 240; i++) { await h.tick(16.7, 1); fr16.push(await h.page.evaluate(RAMP_LITE)); }
        const s16 = await h.snap();
        const ev16 = s16.events;
        const e16 = ev16[0];
        // One full frame of grace after the release, then the ball is FREE and
        // nothing in the scene may ever push it back towards the wall again.
        const after16 = e16 && e16.end_ms != null ? fr16.filter(f => f.t_ms > e16.end_ms + 34) : [];
        const relaunched = after16.filter(f => f.v > -1e-9);
        const vOut16 = after16.length ? after16[after16.length - 1].v : 0;
        const v0End16 = fr16[fr16.length - 1].v0;
        chk('C9_ramped_v1_never_relaunches_a_ball_that_has_already_rebounded',
            ev16.length === 1 && after16.length > 120 && relaunched.length === 0 &&
            !!e16 && rel(-e16.p_after, e16.p_before) <= 1e-6 &&
            Math.abs(v0End16 - VR_TO) < 1e-9,
            'v₁ ramped ' + VR_FROM + ' → ' + VR_TO + ' m/s over ' + VR_MS + ' ms, no repeat: ' +
            ev16.length + ' contact event(s) in ' + Math.round(fr16[fr16.length - 1].t_ms) +
            ' ms (expect exactly 1); impact p = ' + (e16 ? e16.p_before.toFixed(6) : 'n/a') +
            ' → departure p = ' + (e16 ? e16.p_after.toFixed(6) : 'n/a') + ' kg·m/s (elastic ⇒ exact negation, ' +
            (e16 ? (100 * rel(-e16.p_after, e16.p_before)).toExponential(2) : 'n/a') + '%); frames after release with v ≥ 0 = ' +
            relaunched.length + '/' + after16.length + '; v still ' + vOut16.toFixed(4) +
            ' m/s at t=' + Math.round(fr16[fr16.length - 1].t_ms) + ' ms while the ramp re-armed v₀ to ' +
            v0End16.toFixed(4) + ' m/s (the re-arm intent, kept)');

        // C10 — v1 ramped ACROSS repeat cycles: one bounce per cycle, each launch
        // faster than the last, every peak the closed form for the ramp value the
        // cycle was armed with.
        await h.setState('STATE_17');
        const fr17: RampFrame[] = [];
        for (let i = 0; i < 348; i++) { await h.tick(16.7, 1); fr17.push(await h.page.evaluate(RAMP_LITE)); }
        const s17 = await h.snap();
        const ev17 = s17.events;
        const cyc17 = Math.floor(fr17[fr17.length - 1].t_ms / VC_REP) + 1;
        const pk17 = ev17.map((e: Row) => peakOf(e.samples));
        const exp17 = ev17.map((e: Row) => rampAt(VC_FROM, VC_TO, VC_MS, e.start_ms) * Math.sqrt(IMP_K_STIFF * IMP_M));
        let rising = ev17.length > 1;
        for (let i = 1; i < pk17.length; i++) if (!(pk17[i] > pk17[i - 1] * 1.05)) rising = false;
        chk('C10_ramped_v1_gives_exactly_one_ever_faster_bounce_per_repeat_cycle',
            ev17.length === cyc17 && rising &&
            ev17.every((e: Row, i: number) => rel(pk17[i], exp17[i]) <= 0.02) &&
            ev17.every((e: Row) => e.p_before > 0 && e.p_after < 0),
            'v₁ ramped ' + VC_FROM + ' → ' + VC_TO + ' over ' + VC_MS + ' ms, repeat_every_ms=' + VC_REP +
            ': ' + ev17.length + ' contact events over ' + Math.round(fr17[fr17.length - 1].t_ms) +
            ' ms of clock = ' + cyc17 + ' armed cycles (a 71 ms-spaced cluster would show many more); ' +
            ev17.map((e: Row, i: number) => 't=' + Math.round(e.start_ms) + 'ms Fₚₑₐₖ=' + pk17[i].toFixed(2) +
                ' N vs v(t)√(kμ)=' + exp17[i].toFixed(2) + ' (' + (100 * rel(pk17[i], exp17[i])).toFixed(2) + '%)').join(' | ') +
            '; every launch ≥5% faster than the last = ' + rising);

        // C11 — k ramped ACROSS contacts. k must hold still for the whole of any
        // one engaged segment, and each segment must then obey the closed forms
        // for the k it engaged with.
        await h.setState('STATE_18');
        const fr18: RampFrame[] = [];
        for (let i = 0; i < 280; i++) { await h.tick(16.7, 1); fr18.push(await h.page.evaluate(RAMP_LITE)); }
        const s18 = await h.snap();
        const runs18 = engagedRuns(fr18);
        const kRun = runs18.map(r => r[0].k);
        const kJitter = runs18.map(r => spread(r.map(f => f.k)));
        chk('C11a_ramped_k_holds_constant_for_the_whole_of_every_engaged_segment',
            runs18.length >= 3 && kJitter.every(x => x === 0) && spread(kRun) > 100 &&
            fr18.some(f => !f.engaged && Math.abs(f.k - KR_FROM) > 100),
            'k ramped ' + KR_FROM + ' → ' + KR_TO + ' N/m over ' + KR_MS + ' ms, repeat_every_ms=' + KR_REP +
            ': ' + runs18.length + ' engaged segments of ' + runs18.map(r => r.length).join('/') +
            ' frames; k inside each = [' + kRun.map(k => k.toFixed(1)).join(', ') +
            '] N/m with jitter [' + kJitter.map(x => x.toFixed(6)).join(', ') +
            '] (must be exactly 0); the ramp still moves BETWEEN segments, total spread ' +
            spread(kRun).toFixed(1) + ' N/m');
        const ev18 = s18.events;
        const cf18 = ev18.map((e: Row) => {
            const vIn = Math.abs(e.p_before / IMP_M);
            return {
                k: e.k, tc: e.duration_ms, tcExp: Math.PI * Math.sqrt(IMP_M / e.k) * 1000,
                pk: peakOf(e.samples), pkExp: vIn * Math.sqrt(e.k * IMP_M),
            };
        });
        chk('C11b_every_ramped_segment_matches_the_closed_form_for_its_own_k',
            ev18.length >= 3 &&
            cf18.every((c: Row) => rel(c.tc, c.tcExp) <= 0.02 && rel(c.pk, c.pkExp) <= 0.02),
            cf18.map((c: Row) => 'k=' + c.k.toFixed(0) + ': t_c=' + c.tc.toFixed(2) + ' ms vs π√(μ/k)=' +
                c.tcExp.toFixed(2) + ' (' + (100 * rel(c.tc, c.tcExp)).toFixed(2) + '%), Fₚₑₐₖ=' +
                c.pk.toFixed(2) + ' N vs Δv√(kμ)=' + c.pkExp.toFixed(2) + ' (' +
                (100 * rel(c.pk, c.pkExp)).toFixed(2) + '%)').join(' | '));

        // C12 — m2 ramped ACROSS contacts. Mass sits inside the reduced mass the
        // segment was solved with AND inside p = mv, so a write landing mid-contact
        // breaks Σp — the one thing this whole bench exists to conserve.
        await h.setState('STATE_19');
        const fr19: RampFrame[] = [];
        for (let i = 0; i < 300; i++) { await h.tick(16.7, 1); fr19.push(await h.page.evaluate(RAMP_LITE)); }
        const s19 = await h.snap();
        const runs19 = engagedRuns(fr19);
        const mRun = runs19.map(r => r[0].m2);
        const mJitter = runs19.map(r => spread(r.map(f => f.m2)));
        const free19 = fr19.filter(f => !f.engaged);
        // A DEFERRED write is allowed to be one frame late and no more: the frame a
        // segment releases on still carries the value the segment ran with (its own
        // ramp write was deferred while it was still engaged), and the very next
        // frame is back on the closed-form ramp with nothing kept anywhere.
        const mStale: number[] = [];
        for (let i = 0; i < fr19.length; i++) {
            if (fr19[i].engaged) continue;
            if (rel(fr19[i].m2, rampAt(MR_FROM, MR_TO, MR_MS, fr19[i].t_ms)) > 0.02) mStale.push(i);
        }
        const mSelfHeals = mStale.every(i =>
            i > 0 && fr19[i - 1].engaged &&
            i + 1 < fr19.length && rel(fr19[i + 1].m2, rampAt(MR_FROM, MR_TO, MR_MS, fr19[i + 1].t_ms)) <= 0.02);
        const mTrack = mStale;
        const ev19 = s19.events;
        chk('C12a_ramped_m2_holds_constant_for_the_whole_of_every_engaged_segment',
            runs19.length >= 3 && mJitter.every(x => x === 0) && spread(mRun) > 0.3 &&
            mTrack.length <= runs19.length && mSelfHeals && Math.abs(fr19[fr19.length - 1].m2 - MR_TO) < 1e-9,
            'm₂ ramped ' + MR_FROM + ' → ' + MR_TO + ' kg over ' + MR_MS + ' ms, repeat_every_ms=' + MR_REP +
            ': ' + runs19.length + ' engaged segments; m₂ inside each = [' + mRun.map(m => m.toFixed(4)).join(', ') +
            '] kg, jitter [' + mJitter.map(x => x.toFixed(9)).join(', ') + '] (must be exactly 0); between segments it tracks ' +
            'the closed-form ramp on ' + (free19.length - mTrack.length) + '/' + free19.length +
            ' free frames — the ' + mTrack.length + ' that lag are the release frames themselves and every one of them ' +
            'self-heals on the very next frame = ' + mSelfHeals +
            '; holds ' + fr19[fr19.length - 1].m2.toFixed(3) + ' kg after end_ms');
        chk('C12b_sigma_p_is_conserved_across_every_ramped_segment',
            ev19.length >= 3 && ev19.every((e: Row) => rel(e.p_after, e.p_before) <= 1e-9),
            ev19.map((e: Row) => 't=' + Math.round(e.start_ms) + 'ms Σp ' + e.p_before.toFixed(9) + ' → ' +
                e.p_after.toFixed(9) + ' kg·m/s (' + (100 * rel(e.p_after, e.p_before)).toExponential(2) +
                '%)').join(' | ') + ' — a mass write landing inside the segment moves p = mv instantly');
        results.ramped_write_path = {
            v1_single: { events: ev16.length, relaunch_frames: relaunched.length, v0_end: v0End16, v_end: vOut16 },
            v1_cycles: { events: ev17.length, cycles: cyc17, peaks: pk17, peaks_expected: exp17 },
            k_ramp: { segments: runs18.length, k_per_segment: kRun, k_jitter: kJitter, closed_form: cf18 },
            m2_ramp: { segments: runs19.length, m_per_segment: mRun, m_jitter: mJitter, events: ev19.length },
        };

        // ── C13–C15 — param_ramp.mode 'step' ─────────────────────────────────
        // THE DEFECT: a continuous v₁ sweep keeps retiming the ball while it is in
        // FREE FLIGHT on its run-up, so the ball accelerates with nothing touching
        // it. The fix quantises the clock to the repeat cycle BEFORE the ramp
        // fraction is taken. Every expectation below is the harness's own closed
        // form over the authored constants; the engine is never asked what to
        // expect, and STATE_21 (explicit 'continuous') is the pre-fix code path
        // byte for byte, so it serves as BOTH the defect exhibit and the
        // default-path regression guard.
        const stepVal = (from: number, to: number, t1: number, rep: number, t: number) =>
            from + (to - from) * Math.min(1, Math.max(0, (Math.floor(t / rep) * rep) / t1));
        const collect = async (state: string, frames: number) => {
            // Drain the SHARED fixed-step accumulator to a known state first (the
            // A8a idiom; SET_STATE clears the pin). Without it each run inherits a
            // different __pmAccumMs remainder from whatever ran before it, the
            // first frames carry 1 vs 2 steps, and two runs of the SAME fixture
            // would disagree on t_ms for reasons that have nothing to do with the
            // ramp — which would make the byte-identity guard below meaningless.
            await h.pin(1); await h.tick(16.7, 2);
            await h.setState(state);
            const out: RampFrame[] = [];
            for (let i = 0; i < frames; i++) { await h.tick(16.7, 1); out.push(await h.page.evaluate(RAMP_LITE)); }
            return out;
        };
        const fr20 = await collect('STATE_20', 380);   // step        — cycles 0..5
        const fr21 = await collect('STATE_21', 250);   // continuous  — cycles 0..3
        const fr22 = await collect('STATE_22', 250);   // mode absent — must equal 21

        // C13a — the value is EXACTLY constant across each whole repeat cycle, and
        // it moves ONLY on a frame that also crossed a cycle boundary.
        const q20 = cycleReport(fr20, SP_REP);
        const offForm = fr20.filter(f => Math.abs(f.v0 - stepVal(SP_FROM, SP_TO, SP_MS, SP_REP, f.t_ms)) > 1e-9);
        let movedOffBoundary = 0;
        for (let i = 1; i < fr20.length; i++) {
            if (fr20[i].v0 === fr20[i - 1].v0) continue;
            if (Math.floor(fr20[i].t_ms / SP_REP) === Math.floor(fr20[i - 1].t_ms / SP_REP)) movedOffBoundary++;
        }
        chk('C13a_step_mode_holds_the_ramped_value_constant_for_a_whole_repeat_cycle',
            q20.length >= SP_N + 1 && q20.every(c => c.jitter === 0) &&
            offForm.length === 0 && movedOffBoundary === 0,
            'v₁ ramped ' + SP_FROM + ' → ' + SP_TO + ' over ' + SP_MS + ' ms, mode:"step", repeat_every_ms=' +
            SP_REP + ': ' + q20.length + ' cycles of ' + q20.map(c => c.n).join('/') + ' frames; requested v₀ per cycle = [' +
            q20.map(c => c.value.toFixed(6)).join(', ') + '] m/s with in-cycle jitter [' +
            q20.map(c => c.jitter.toFixed(9)).join(', ') + '] (must be exactly 0); frames off the harness’s own ' +
            'quantised closed form = ' + offForm.length + '/' + fr20.length +
            '; value changes NOT on a cycle boundary = ' + movedOffBoundary);

        // C13b — THE DEFECT ITSELF, asserted directly: a body in free flight must
        // hold its speed. Sampled between each re-arm and that cycle's first
        // contact — continuous drifts, step does not.
        const q21 = cycleReport(fr21, SP_REP);
        const cmp = Math.min(3, q20.length, q21.length);
        const dStep = q20.slice(0, cmp).map(c => c.drift);
        const dCont = q21.slice(0, cmp).map(c => c.drift);
        const pctCont = q21.slice(0, cmp).map(c => 100 * c.drift / c.launch);
        chk('C13b_a_body_in_free_flight_keeps_its_speed_in_step_mode_and_drifts_in_continuous',
            dStep.every(d => d === 0) && dCont.every(d => d > 0.05) &&
            q20.slice(0, cmp).every(c => c.runup.length >= 5) &&
            q21.slice(0, cmp).every(c => c.runup.length >= 5),
            'run-up |v| sampled between re-arm and first contact (' +
            q20.slice(0, cmp).map(c => c.runup.length).join('/') + ' frames per cycle): ' +
            'STEP drift = [' + dStep.map(d => d.toFixed(9)).join(', ') + '] m/s (must be exactly 0) — ' +
            q20.slice(0, cmp).map(c => c.runup[0].toFixed(4) + '→' + c.runup[c.runup.length - 1].toFixed(4)).join(' | ') +
            ' || CONTINUOUS (= the pre-fix engine, byte for byte) drift = [' +
            dCont.map(d => d.toFixed(6)).join(', ') + '] m/s = [' + pctCont.map(p => p.toFixed(2) + '%').join(', ') +
            '] of the launch speed — ' +
            q21.slice(0, cmp).map(c => c.runup[0].toFixed(4) + '→' + c.runup[c.runup.length - 1].toFixed(4)).join(' | ') +
            ' (the ball accelerating with nothing touching it)');

        // C13c — end_ms = N × repeat_every_ms ⇒ N+1 distinct launches, u = 0, 1/N … 1.
        const launches = q20.slice(0, SP_N + 1).map(c => c.launch);
        const wantL: number[] = [];
        for (let i = 0; i <= SP_N; i++) wantL.push(SP_FROM + (SP_TO - SP_FROM) * (i / SP_N));
        let monotonic = launches.length === SP_N + 1;
        for (let i = 1; i < launches.length; i++) if (!(launches[i] > launches[i - 1])) monotonic = false;
        const clampCycle = q20[SP_N + 1];
        chk('C13c_end_ms_equals_N_times_repeat_gives_N_plus_1_distinct_launches_from_to',
            launches.length === SP_N + 1 && monotonic &&
            launches.every((v, i) => Math.abs(v - wantL[i]) < 1e-9) &&
            new Set(launches.map(v => v.toFixed(9))).size === SP_N + 1 &&
            (!clampCycle || Math.abs(clampCycle.launch - SP_TO) < 1e-9),
            'end_ms = ' + SP_MS + ' = ' + SP_N + ' × repeat_every_ms ' + SP_REP + ' ⇒ launches [' +
            launches.map(v => v.toFixed(6)).join(', ') + '] m/s vs from + (to−from)·i/N = [' +
            wantL.map(v => v.toFixed(6)).join(', ') + ']; distinct = ' +
            new Set(launches.map(v => v.toFixed(9))).size + '/' + (SP_N + 1) + ', strictly increasing = ' + monotonic +
            ', spans ' + SP_FROM + ' → ' + SP_TO + ' inclusive; the next cycle clamps at ' +
            (clampCycle ? clampCycle.launch.toFixed(6) : 'n/a'));

        // C13d — Rule 36: the stepped value is a PURE function of t_ms. Same t_ms
        // twice, and again after a rewind, must give an identical value.
        const pinStep = async (ms: number) => {
            await h.setState('STATE_20');
            await h.pin(ms);
            for (let i = 0; i < 600; i++) {
                await h.tick(16.7, 8);
                const t = await h.page.evaluate(() => (window as any).PM_simTimeMs);
                if (typeof t === 'number' && t >= ms - 1) break;
            }
            return { f: await h.page.evaluate(RAMP_LITE), s: await h.snap() };
        };
        const p1 = await pinStep(2600);
        await h.tick(16.7, 25);                          // the SAME t_ms, 25 frames later
        const p1b = await h.page.evaluate(RAMP_LITE);
        await pinStep(7000);                             // forward…
        const p3 = await pinStep(2600);                  // …and rewound
        const expP1 = stepVal(SP_FROM, SP_TO, SP_MS, SP_REP, p1.f.t_ms);
        chk('C13d_stepped_value_is_a_pure_function_of_t_ms_under_a_pin_and_a_rewind',
            Math.abs(p1.f.v0 - expP1) < 1e-9 &&
            p1b.v0 === p1.f.v0 && p1b.t_ms === p1.f.t_ms &&
            p3.f.v0 === p1.f.v0 &&
            JSON.stringify(p1.s.bodies) === JSON.stringify(p3.s.bodies),
            'pin 2600 ms → t_ms=' + p1.f.t_ms.toFixed(4) + ' (cycle ' + Math.floor(p1.f.t_ms / SP_REP) +
            ') v₀=' + p1.f.v0.toFixed(9) + ' vs the harness’s quantised closed form ' + expP1.toFixed(9) +
            '; 25 further ticks under the pin → t_ms=' + p1b.t_ms.toFixed(4) + ' v₀=' + p1b.v0.toFixed(9) +
            ' (unchanged = ' + (p1b.v0 === p1.f.v0) + '); pin 2600 → 7000 → 2600 returns v₀=' +
            p3.f.v0.toFixed(9) + ' and byte-identical bodies = ' +
            (JSON.stringify(p1.s.bodies) === JSON.stringify(p3.s.bodies)));

        // C13e — REGRESSION GUARD on the default path. mode:'continuous' and mode
        // absent must be the same run, and both must be the plain un-quantised
        // linear sweep this engine has always produced.
        const seq = (fr: RampFrame[]) => JSON.stringify(fr.map(f => [f.t_ms, f.v0, f.v, f.s, f.k]));
        const offCont = fr21.filter(f => Math.abs(f.v0 - contRamp(SP_FROM, SP_TO, SP_MS, f.t_ms)) > 1e-9);
        const offAbs = fr22.filter(f => Math.abs(f.v0 - contRamp(SP_FROM, SP_TO, SP_MS, f.t_ms)) > 1e-9);
        chk('C13e_continuous_and_mode_absent_are_the_unchanged_default_path',
            seq(fr21) === seq(fr22) && offCont.length === 0 && offAbs.length === 0 &&
            fr21.length === 250,
            'mode:"continuous" vs mode ABSENT over ' + fr21.length +
            ' frames: (t_ms, v₀, v, s, k) sequences byte-identical = ' + (seq(fr21) === seq(fr22)) +
            '; frames off the plain linear closed form from + (to−from)·t/end_ms: continuous ' +
            offCont.length + '/' + fr21.length + ', absent ' + offAbs.length + '/' + fr22.length +
            ' — the additive change touches neither');

        // C13f — composition with the 4ecae93 mbContactBusy deferral: k acts only
        // DURING contact, so a stepped k must still hold still inside every
        // engaged segment as well as across every cycle.
        const fr23 = await collect('STATE_23', 290);
        const q23 = cycleReport(fr23, SK_REP, f => f.k);
        const kByCycle = q23.map(c => c.value);
        const kCycleJit = q23.map(c => c.jitter);
        const runs23 = engagedRuns(fr23);
        const kSegJit = runs23.map(r => spread(r.map(f => f.k)));
        const kFormOff = fr23.filter(f => Math.abs(f.k - stepVal(SK_FROM, SK_TO, SK_MS, SK_REP, f.t_ms)) > 1e-9);
        chk('C13f_a_stepped_k_ramp_holds_across_the_cycle_and_inside_every_engaged_segment',
            q23.length >= SK_N + 1 && kCycleJit.every(x => x === 0) &&
            runs23.length >= SK_N && kSegJit.every(x => x === 0) &&
            kFormOff.length === 0 && spread(kByCycle) > 500,
            'k ramped ' + SK_FROM + ' → ' + SK_TO + ' N/m over ' + SK_MS + ' ms, mode:"step", repeat_every_ms=' +
            SK_REP + ': k per cycle = [' + kByCycle.map(k => k.toFixed(4)).join(', ') +
            '] N/m, in-cycle jitter [' + kCycleJit.map(x => x.toFixed(9)).join(', ') + ']; ' +
            runs23.length + ' engaged segments with jitter [' + kSegJit.map(x => x.toFixed(9)).join(', ') +
            '] (both must be exactly 0); frames off the quantised closed form = ' + kFormOff.length +
            '/' + fr23.length + '; total spread ' + spread(kByCycle).toFixed(1) + ' N/m');

        results.step_mode = {
            step_cycles: q20.map(c => ({ cycle: c.cycle, value: c.value, jitter: c.jitter, launch: c.launch, runup_frames: c.runup.length, drift: c.drift })),
            continuous_cycles: q21.map(c => ({ cycle: c.cycle, launch: c.launch, drift: c.drift, drift_pct: 100 * c.drift / c.launch })),
            launches, launches_expected: wantL,
            default_path_identical: seq(fr21) === seq(fr22),
            k_step: { per_cycle: kByCycle, cycle_jitter: kCycleJit, segment_jitter: kSegJit },
        };
    }

    // ── C14 — the step ramp with NO repeat cycle: loud, and continuous ────────
    {
        const g = await open('mb_seam_c_stepbad', STEPBAD);
        await g.setState('STATE_1');
        const frB: RampFrame[] = [];
        for (let i = 0; i < 150; i++) { await g.tick(16.7, 1); frB.push(await g.page.evaluate(RAMP_LITE)); }
        const loudB = g.errors.filter(e => e.indexOf('step') >= 0 && e.indexOf('repeat_every_ms') >= 0);
        const offB = frB.filter(f => Math.abs(f.v0 - contRamp(SP_FROM, SP_TO, SP_MS, f.t_ms)) > 1e-9);
        chk('C14_step_without_repeat_every_ms_is_loud_and_falls_back_to_continuous',
            loudB.length > 0 && offB.length === 0 &&
            Math.abs(frB[frB.length - 1].v0 - frB[0].v0) > 0.05,
            'console error logged = ' + (loudB.length > 0) + ' (' + (loudB[0] || '').slice(0, 110) + '…); ' +
            'frames off the CONTINUOUS closed form = ' + offB.length + '/' + frB.length +
            ' — the ramp degrades to a plain sweep rather than freezing at `from` (v₀ ' +
            frB[0].v0.toFixed(4) + ' → ' + frB[frB.length - 1].v0.toFixed(4) + ' m/s over ' +
            Math.round(frB[frB.length - 1].t_ms) + ' ms)');
        await g.browser.close();
    }

    // ══ D — THE DEPARTURE RE-ARM ═════════════════════════════════════════════
    //   D1 the slider-corner sweep: no clamp, no mid-contact re-arm, still cycling
    //   D2 the authored default keeps the authored period, to the frame
    //   D3 a guided state with a fixed period re-arms exactly where it always did
    //   D4 impulse STATE_5's two lanes — the same defect, already shipped
    //   D5 rewind / pin determinism: no re-arm latch survives a rewind
    //   D6 a re-arm can never fire on a frame that advances no time (frozen pin)
    {
        const r = await open('mb_rearm', REARM);
        const runState = async (st: string, n: number, d: number) => {
            await r.setState(st);
            return await r.page.evaluate(REARM_RUN, [n, d] as [number, number]) as RearmFrame[];
        };
        const cornerRows: Row[] = [];
        let cornerClamps = 0, cornerMidContact = 0, cornerDead = 0;
        for (let ci = 0; ci < CORNERS.length; ci++) {
            const [m, v, k] = CORNERS[ci];
            // (10 kg, 50 N/m) is a 14.05 s contact — the run must outlast TWO of
            // them or "still cycling" is untested at the corner that needs it most.
            const slow = (m === M_HI && k === K_LO);
            const fr = await runState('STATE_' + (ci + 1), slow ? 1500 : 700, 33.4);
            const idx = rearmFrames(fr);
            const clamped = fr.filter(f => f.bh > 0).length;
            const mid = idx.filter(i => fr[i - 1].busy).length;
            const inC = fr[fr.length - 1].inC;
            if (clamped > 0) cornerClamps++;
            if (mid > 0 || inC > 0) cornerMidContact++;
            if (idx.length < 2) cornerDead++;
            cornerRows.push({
                corner: 'm=' + m + ' v=' + v + ' k=' + k,
                t_span_s: +(fr[fr.length - 1].t / 1000).toFixed(2),
                rearms: idx.length,
                rearm_t_ms: idx.slice(0, 6).map(i => Math.round(fr[i].t)),
                clamped_frames: clamped, max_bound_hits: Math.max(...fr.map(f => f.bh)),
                bound_hits_all: fr[fr.length - 1].bha,
                mid_contact_rearms: mid, engine_in_contact_counter: inC,
                min_s: +Math.min(...fr.map(f => f.s)).toFixed(3),
                max_s: +Math.max(...fr.map(f => f.s)).toFixed(3),
                contacts: fr[fr.length - 1].nev,
            });
        }
        chk('D1a_no_slider_corner_ever_clamps_at_the_track_end',
            cornerClamps === 0,
            cornerRows.map(x => x.corner + ': bound_hits ' + x.max_bound_hits + '/' + x.bound_hits_all +
                ' |s|max ' + Math.max(Math.abs(x.min_s), Math.abs(x.max_s)).toFixed(2) + '/' + S8_LEN).join('  ·  '));
        chk('D1b_no_corner_re_arms_while_a_contact_is_engaged',
            cornerMidContact === 0,
            cornerRows.map(x => x.corner + ': ' + x.mid_contact_rearms + ' mid-contact re-arms (engine counter ' +
                x.engine_in_contact_counter + ')').join('  ·  '));
        chk('D1c_every_corner_keeps_cycling',
            cornerDead === 0,
            cornerRows.map(x => x.corner + ': ' + x.rearms + ' re-arms in ' + x.t_span_s + ' s at ' +
                JSON.stringify(x.rearm_t_ms) + ' ms, ' + x.contacts + ' contacts').join('  ·  '));

        // D2 — the authored default (m 1 kg, v 3 m/s, k 2000 N/m) must still run
        // on the authored 2314 ms period, to the frame. The departure guard is a
        // BOUND on the period, never a replacement for it.
        const frD = await runState('STATE_9', 700, 16.7);
        const idxD = rearmFrames(frD);
        const wantD = [1, 2, 3, 4].map(n => n * S8_REP).filter(t => t <= frD[frD.length - 1].t);
        const gotD = idxD.map(i => frD[i].t);
        // The re-arm lands on the FIRST frame at or past the boundary, so the
        // error is bounded by one frame of the state clock (16 ms).
        const offD = wantD.map((t, i) => (gotD[i] == null ? 1e9 : gotD[i] - t));
        chk('D2_the_authored_default_still_re_arms_on_the_authored_period',
            gotD.length === wantD.length && offD.every(o => o >= 0 && o <= 17) &&
            frD.every(f => f.bh === 0),
            'repeat_every_ms=' + S8_REP + ': boundaries [' + wantD.join(', ') + '] → re-arms [' +
            gotD.map(t => Math.round(t)).join(', ') + '] ms (lag ' + offD.map(o => Math.round(o)).join('/') +
            ' ms ≤ one 16 ms frame); bound_hits ' + Math.max(...frD.map(f => f.bh)));

        // D3 — REGRESSION GUARD. impulse STATE_2, verbatim: its re-arms must still
        // be period re-arms at 4080 / 8160 ms and nowhere else, and the ball must
        // still never reach the track end.
        const frG = await runState('STATE_10', 700, 16.7);
        const idxG = rearmFrames(frG);
        const wantG = [4080, 8160];
        const gotG = idxG.map(i => frG[i].t);
        const offG = wantG.map((t, i) => (gotG[i] == null ? 1e9 : gotG[i] - t));
        chk('D3_guided_state_with_a_fixed_period_re_arms_exactly_as_before',
            gotG.length === wantG.length && offG.every(o => o >= 0 && o <= 17) &&
            frG.every(f => f.bh === 0) && frG[frG.length - 1].nev >= 2,
            'impulse STATE_2 replica (slow ×20, repeat 4080): re-arms at [' +
            gotG.map(t => Math.round(t)).join(', ') + '] ms vs boundaries [' + wantG.join(', ') +
            ']; |s|max ' + Math.max(...frG.map(f => Math.abs(f.s))).toFixed(2) + '/' + S8_LEN +
            ' m; bound_hits ' + Math.max(...frG.map(f => f.bh)) + '; ' + frG[frG.length - 1].nev + ' contacts');

        // D4 — impulse STATE_5, verbatim. Its authored 4900 ms period is LONGER
        // than the 6 m track can hold: pre-fix the ball is clamped dead at the far
        // end for ~0.5 s of every cycle. Same bug_class, already shipped.
        const frL = await runState('STATE_11', 700, 16.7);
        const idxL = rearmFrames(frL);
        chk('D4_two_lane_guided_state_no_longer_parks_at_the_track_end',
            frL.every(f => f.bh === 0) && idxL.length >= 2,
            'impulse STATE_5 replica (two lanes, repeat 4900): clamped frames ' +
            frL.filter(f => f.bh > 0).length + '/' + frL.length + ', |s|max ' +
            Math.max(...frL.map(f => Math.abs(f.s))).toFixed(3) + '/' + S8_LEN + ' m, re-arms at [' +
            idxL.map(i => Math.round(frL[i].t)).join(', ') + '] ms');

        // D5 — REWIND / PIN DETERMINISM. The re-arm is a function of physical
        // state, and physical state is a deterministic function of the frame
        // sequence from the state's start — but only if NO "already re-armed"
        // latch survives the rewind. Pin 3000 → 9000 → 3000 on the corner whose
        // cycle is departure-driven (m 0.5 kg, k 5000 N/m: the period never fires
        // there, so any latch would show).
        const pinTo = async (st: string, ms: number) => {
            await r.setState(st);
            await r.pin(ms);
            for (let i = 0; i < 900; i++) {
                await r.tick(16.7, 8);
                const t = await r.page.evaluate(() => (window as any).PM_mbTimeMs);
                if (typeof t === 'number' && t >= ms - 1) break;
            }
            return await r.page.evaluate(() => {
                const eng = (window as any).PM_mbEngine, o: Row = {};
                for (const id of eng.order) {
                    const b = eng.bodies[id];
                    o[id] = { s: b.s, v: b.v, a: b.a, F: b.F_contact, spent: !!b.spent };
                }
                return {
                    bodies: o, t_ms: eng.t_ms, tphys_ms: eng.tphys_ms, cycle: eng._cycle,
                    rearms: eng.rearms || 0, bha: eng.bound_hits_all || 0, nev: (eng.events || []).length,
                };
            });
        };
        const p1 = await pinTo('STATE_1', 3000);
        await pinTo('STATE_1', 9000);
        const p3 = await pinTo('STATE_1', 3000);
        const same = JSON.stringify(p1) === JSON.stringify(p3);
        chk('D5_rewind_3000_9000_3000_leaves_no_re_arm_latch',
            same,
            'pin 3000 → 9000 → 3000 identical = ' + same + ' (s ' + p1.bodies['BALL'].s.toFixed(9) +
            ' → ' + p3.bodies['BALL'].s.toFixed(9) + ', v ' + p1.bodies['BALL'].v.toFixed(9) +
            ' → ' + p3.bodies['BALL'].v.toFixed(9) + ', re-arms ' + p1.rearms + ' → ' + p3.rearms +
            ', cycle ' + p1.cycle + ' → ' + p3.cycle + ', events ' + p1.nev + ' → ' + p3.nev + ')');

        // D6 — a pinned frame advances NO time, so it must not re-arm either. The
        // pin instant is chosen to sit INSIDE the departure zone (the ball is past
        // the re-arm line and still leaving), which is exactly where a
        // state-driven re-arm would otherwise fire on every held frame and THE
        // EYE's frozen baseline would show the home pose instead of the departure.
        const q1 = await pinTo('STATE_2', 700);          // v = −6: the ball is at the far end by 700 ms
        await r.tick(16.7, 40);
        const q2 = await r.page.evaluate(() => {
            const eng = (window as any).PM_mbEngine, o: Row = {};
            for (const id of eng.order) {
                const b = eng.bodies[id];
                o[id] = { s: b.s, v: b.v, a: b.a, F: b.F_contact, spent: !!b.spent };
            }
            return {
                bodies: o, t_ms: eng.t_ms, tphys_ms: eng.tphys_ms, cycle: eng._cycle,
                rearms: eng.rearms || 0, bha: eng.bound_hits_all || 0, nev: (eng.events || []).length,
            };
        });
        chk('D6_no_re_arm_on_a_frame_that_advances_no_time',
            JSON.stringify(q1) === JSON.stringify(q2),
            'pinned at 700 ms with the ball ' + q1.bodies['BALL'].s.toFixed(3) + ' m (track ±' + S8_LEN +
            '), 40 further frames under the pin: bodies + counters identical = ' +
            (JSON.stringify(q1) === JSON.stringify(q2)) + ' (re-arms ' + q1.rearms + ' → ' + q2.rearms + ')');

        // ══ E — slow_window.from_cycle ═══════════════════════════════════════
        //   "For the first few seconds show the ball go, collide, and come back
        //   at NORMAL speed — don't slow it down. After that, in the next pass,
        //   slow down the ball at the contact." (founder video review 2026-08-01)
        //   A contact slowed x20 from the very first bounce means the student
        //   never sees what a real bounce looks like.
        const fcRun = async (st: string, n: number) => {
            await r.setState(st);
            return await r.page.evaluate(FC_RUN, [n, 16.7] as [number, number]) as FcFrame[];
        };
        const fr12 = await fcRun('STATE_12', 320);
        const fr13 = await fcRun('STATE_13', 320);
        const fr14 = await fcRun('STATE_14', 320);
        const ps12 = fcPasses(fr12), ps13 = fcPasses(fr13);
        const FRM = 16.7;
        const p0 = ps12[0], p1f = ps12[1];
        // The TRUE physical duration of each pass, straight off the recorded
        // events — it must be t_c in BOTH cycles, slowed or not.
        const ev12 = await r.page.evaluate(() => ((window as any).PM_mbEngine.events || [])
            .map((e: any) => ({ d: e.duration_ms, F: e.F_peak })));

        //   THE MEASUREMENT. The exact half is the pair of clocks: eng.t_ms (wall)
        // and eng.tphys_ms (physical) are sampled on the SAME frames, so their
        // ratio over an engaged window is 1 at true speed and 1/slow_factor under
        // the magnifier with no quantisation error at all. The wall-clock span is
        // the thing a teacher actually watches, and it is bounded rather than
        // equated, because mbDtScale is decided ONCE PER FRAME from whether a
        // contact is engaged at the frame's START: the frame that ENTERS the
        // contact therefore runs at true speed and swallows up to one whole
        // 1/60 s of physical time before the magnifier turns on, and the frame
        // that leaves does the mirror image. That is a documented property of a
        // per-frame multiplier, not a defect, so the slowed window must last
        // between (t_c − 2 frames of physics) × slow_factor and t_c × slow_factor.
        const wallLo = (FC_TC_MS - 2 * FRM) * FC_SLOW, wallHi = FC_TC_MS * FC_SLOW;
        chk('E1_from_cycle_holds_the_first_pass_at_true_speed_and_slows_the_next',
            ps12.length >= 2 &&
            Math.abs(p0.ratio - 1) <= 1e-9 &&
            rel(p1f.ratio, 1 / FC_SLOW) <= 1e-9 &&
            Math.abs(p0.wallMs - FC_TC_MS) <= 2 * FRM &&
            p1f.wallMs >= wallLo && p1f.wallMs <= wallHi &&
            p1f.n >= 6 * p0.n &&
            p0.cycle === 0 && p1f.cycle >= 1 &&
            ev12.length >= 2 && rel(ev12[0].d, FC_TC_MS) <= 0.005 && rel(ev12[1].d, FC_TC_MS) <= 0.005,
            'm=' + FC_M + ' kg into a fixed wall at k=' + FC_K + ' N/m ⇒ t_c = π√(m/k) = ' +
            FC_TC_MS.toFixed(2) + ' ms (derived by the harness). from_cycle=1, slow ×' + FC_SLOW +
            ': ' + ps12.length + ' passes. CYCLE ' + p0.cycle + ' — ' + p0.n + ' engaged frames = ' +
            p0.wallMs.toFixed(1) + ' ms of WALL clock for ' + p0.physMs.toFixed(2) +
            ' ms of physical time, ratio ' + p0.ratio.toFixed(9) + ' (must be exactly 1 = true speed; ' +
            'wall within ' + (Math.abs(p0.wallMs - FC_TC_MS) / FRM).toFixed(2) + ' frames of t_c). ' +
            'CYCLE ' + p1f.cycle + ' — ' + p1f.n + ' engaged frames = ' + p1f.wallMs.toFixed(1) +
            ' ms of wall clock for ' + p1f.physMs.toFixed(2) + ' ms physical, ratio ' +
            p1f.ratio.toFixed(9) + ' (must be exactly 1/' + FC_SLOW + '), inside the derived band [' +
            wallLo.toFixed(1) + ', ' + wallHi.toFixed(1) + '] ms and ' +
            (p1f.n / p0.n).toFixed(1) + '× as many frames as cycle 0. The TRUE recorded ' +
            'durations are unchanged by any of it: ' + ev12.slice(0, 2).map((e: Row) => e.d.toFixed(3)).join(' / ') +
            ' ms, F_peak ' + ev12.slice(0, 2).map((e: Row) => e.F.toFixed(1)).join(' / ') + ' N');

        // The badge is the honesty instrument. Over a pass that is running at real
        // speed it would be a lie, so it must be dark there and only there.
        const badge0 = fr12.filter(f => f.ra === 0 && f.bg).length;
        const badge1 = fr12.filter(f => f.ra >= 1 && f.busy && f.bg).length;
        const eng1 = fr12.filter(f => f.ra >= 1 && f.busy).length;
        chk('E2_badge_absent_in_cycle_0_and_present_only_in_the_slowed_cycle',
            badge0 === 0 && eng1 > 5 && badge1 === eng1 &&
            p1f.badgeText === 'slow motion ×' + FC_SLOW,
            'cycle 0 (true speed): badge shown on ' + badge0 + '/' + fr12.filter(f => f.ra === 0).length +
            ' frames — must be 0, a "slow motion ×' + FC_SLOW + '" badge over a real-speed bounce is a lie. ' +
            'Cycle ≥1 engaged frames: ' + badge1 + '/' + eng1 + ' carry the badge, text "' +
            p1f.badgeText + '". Frames with the badge up but no contact engaged: ' +
            fr12.filter(f => f.bg && !f.busy).length);

        // The regression guard: the key ABSENT and the key at its explicit default
        // must be the same run, and that run must still slow the FIRST contact —
        // i.e. every existing concept is byte-identical to the pre-2026-08-01
        // engine unless it opts in.
        //   Compared on the EVENT LEDGER and the derived pass structure, NOT on
        // the raw frame stream. The raw stream is not a legitimate equality: every
        // fixture on this page shares one renderer clock accumulator, and 16.7 ms
        // ticks against a 1/60 s fixed step leave a residual that depends on how
        // many frames ran EARLIER in the session — so two identical states run
        // back to back differ in which frames take two steps. The event ledger is
        // immune by construction: contact entry and release are solved at their
        // exact instants and the fold property (A8a) makes them independent of how
        // the frame was partitioned. What must be identical is the physics and the
        // playback rate, and that is exactly what this compares.
        //   THE CONTROL IS A RE-RUN OF THE SAME STATE. Bit equality is not available
        // here and pretending otherwise would just be a tuned tolerance: every
        // fixture on this page shares ONE renderer clock accumulator, 16.7 ms ticks
        // against a 1/60 s fixed step leave a residual, and the residual depends on
        // how many frames ran earlier in the session. That moves which frame a
        // departure re-arm lands on (it is tested once per frame) and where the
        // 0.5 ms force-sample grid falls relative to the peak — so start_ms of a
        // re-armed contact shifts by a frame and duration_ms / F_peak wobble in
        // their last few digits. A standalone probe (2026-08-01) measured it:
        // STATE_13 → STATE_14 → STATE_13 gave durations 70.24814731040811 /
        // ...040419 / ...040397 ms and F_peak 268.32767 / 268.32727 / 268.32727 N,
        // and the SECOND STATE_13 matched STATE_14 exactly — i.e. the wobble tracks
        // run ORDER, not the from_cycle key.
        //   So the guard is a controlled comparison: run STATE_13, then STATE_14,
        // then STATE_13 AGAIN, and require that authoring the key makes no more
        // difference than re-running the identical state does. The last event of
        // each run is dropped: it is still mid-contact when the frame budget ends,
        // so its F_peak is a partial reading of where the budget stopped.
        const evOf = async () => await r.page.evaluate(() => ((window as any).PM_mbEngine.events || [])
            .filter((e: any) => e.duration_ms != null)
            .map((e: any) => [e.start_ms, e.duration_ms, e.F_peak])) as number[][];
        await r.setState('STATE_13'); const l13 = await r.page.evaluate(FC_RUN, [320, 16.7] as [number, number]) as FcFrame[];
        const ev13 = await evOf();
        await r.setState('STATE_14'); const l14 = await r.page.evaluate(FC_RUN, [320, 16.7] as [number, number]) as FcFrame[];
        const ev14 = await evOf();
        await r.setState('STATE_13'); const l13b = await r.page.evaluate(FC_RUN, [320, 16.7] as [number, number]) as FcFrame[];
        const ev13b = await evOf();
        const shape = (ps: FcPass[]) => JSON.stringify(ps.map(p => [p.cycle, +p.ratio.toFixed(9), p.badgeOn === p.n, p.badgeText]));
        // Worst relative disagreement over duration_ms and F_peak of every closed
        // contact, plus an EXACT check on the first contact's start (that one is a
        // pure free-flight time and no re-arm has happened yet, so it must not move).
        const ledgerGap = (a: number[][], b: number[][]) => {
            if (a.length !== b.length || a.length < 3) return Number.POSITIVE_INFINITY;
            if (a[0][0] !== b[0][0]) return Number.POSITIVE_INFINITY;
            let w = 0;
            for (let i = 0; i < a.length; i++) for (const j of [1, 2]) w = Math.max(w, rel(a[i][j], b[i][j]));
            return w;
        };
        const gapKey = ledgerGap(ev13, ev14);          // the from_cycle key's cost
        const gapRerun = ledgerGap(ev13, ev13b);       // the control: re-running STATE_13
        const same1314 = gapKey <= Math.max(gapRerun, 1e-12) && gapKey <= 1e-5 &&
            shape(fcPasses(l13)) === shape(fcPasses(l14)) &&
            shape(fcPasses(l13)) === shape(fcPasses(l13b));
        const firstPassSlowed13 = ps13.length > 0 && rel(ps13[0].ratio, 1 / FC_SLOW) <= 1e-9 && ps13[0].cycle === 0;
        chk('E3_default_and_explicit_zero_are_the_unchanged_today_behaviour',
            same1314 && ev13.length >= 3 && firstPassSlowed13 && ps13[0].badgeOn === ps13[0].n,
            'the SAME apparatus authored with no from_cycle key (STATE_13) and with from_cycle: 0 ' +
            '(STATE_14): ' + ev13.length + ' CLOSED contacts each, first contact starting at exactly ' +
            (ev13[0] ? ev13[0][0].toFixed(6) : '--') + ' ms of physical time in both. Worst relative ' +
            'disagreement in duration_ms / F_peak caused by AUTHORING THE KEY = ' + gapKey.toExponential(2) +
            '; caused by merely RE-RUNNING STATE_13 unchanged = ' + gapRerun.toExponential(2) +
            ' — the key costs no more than a re-run does, so the residual is the shared clock ' +
            'accumulator, not from_cycle. Pass structure (cycle, wall/phys ratio, badge) identical ' +
            'across all three runs = ' + (shape(fcPasses(l13)) === shape(fcPasses(l14)) &&
                shape(fcPasses(l13)) === shape(fcPasses(l13b))) +
            '. And that unchanged path still slows the VERY FIRST contact: cycle ' + ps13[0].cycle +
            ', ' + ps13[0].n + ' engaged frames, wall/phys ratio ' + ps13[0].ratio.toFixed(9) +
            ' (= 1/' + FC_SLOW + '), badge up on ' + ps13[0].badgeOn + '/' + ps13[0].n +
            ' of them — so a concept that does not opt in sees no change at all');

        // Rewind / pin determinism ACROSS the cycle boundary. The gate reads the
        // engine's own re-arm counter, which is born 0 with the state, cleared by
        // RESET_TRAJECTORY and advanced only by a frame that advances time — so a
        // pin inside cycle 0 must photograph true speed and a pin inside a later
        // cycle must photograph the magnifier, every time, from the clock alone.
        const fcPin = async (st: string, ms: number) => {
            await r.setState(st);
            await r.pin(ms);
            for (let i = 0; i < 900; i++) {
                await r.tick(16.7, 8);
                const t = await r.page.evaluate(() => (window as any).PM_mbTimeMs);
                if (typeof t === 'number' && t >= ms - 1) break;
            }
            return await r.page.evaluate(() => {
                const eng = (window as any).PM_mbEngine, o: Row = {};
                for (const id of eng.order) {
                    const b = eng.bodies[id];
                    o[id] = { s: b.s, v: b.v, a: b.a, F: b.F_contact, spent: !!b.spent };
                }
                const bg = document.getElementById('mb_slowmo');
                return {
                    bodies: o, t_ms: eng.t_ms, tphys_ms: eng.tphys_ms,
                    rearms: eng.rearms || 0, sa: !!eng.slow_active, nev: (eng.events || []).length,
                    badge: !!bg && getComputedStyle(bg).display !== 'none',
                };
            });
        };
        // Pin instants taken from the free run: the middle engaged frame of each
        // pass, so each pin lands INSIDE its own contact window.
        const eng0Fr = fr12.filter(f => f.busy && f.ra === 0);
        const eng1Fr = fr12.filter(f => f.busy && f.ra >= 1);
        const T0 = eng0Fr.length ? eng0Fr[Math.floor(eng0Fr.length / 2)].t : 0;
        const T1 = eng1Fr.length ? eng1Fr[Math.floor(eng1Fr.length / 2)].t : 0;
        const a0 = await fcPin('STATE_12', T0);
        const b1 = await fcPin('STATE_12', T1);
        const a0b = await fcPin('STATE_12', T0);
        chk('E4_from_cycle_is_deterministic_across_the_cycle_boundary_under_pin_and_rewind',
            eng0Fr.length > 2 && eng1Fr.length > 5 &&
            JSON.stringify(a0) === JSON.stringify(a0b) &&
            a0.rearms === 0 && a0.sa === false && a0.badge === false &&
            b1.rearms >= 1 && b1.sa === true && b1.badge === true,
            'pinned INSIDE cycle 0\\u0027s contact at t = ' + Math.round(T0) + ' ms: re-arms ' + a0.rearms +
            ', slow_active ' + a0.sa + ', badge ' + a0.badge + ' (true speed). Pinned INSIDE the next ' +
            'cycle\\u0027s contact at t = ' + Math.round(T1) + ' ms: re-arms ' + b1.rearms + ', slow_active ' +
            b1.sa + ', badge ' + b1.badge + ' (magnified). Rewound to ' + Math.round(T0) +
            ' ms again: identical to the first visit = ' + (JSON.stringify(a0) === JSON.stringify(a0b)) +
            ' (s ' + a0.bodies['BALL'].s.toFixed(9) + ' → ' + a0b.bodies['BALL'].s.toFixed(9) +
            ', re-arms ' + a0.rearms + ' → ' + a0b.rearms + ', slow_active ' + a0.sa + ' → ' + a0b.sa +
            ') — no latch survives the rewind');

        // The Part-1 negative, re-asserted on this page too: the from_cycle states
        // are wall impacts, and NOTHING may be drawn at the contact in any of them.
        const ceAll = fr12.concat(fr13, fr14).filter(f => f.ce > 0).length;
        chk('E5_no_contact_element_geometry_on_any_from_cycle_frame',
            ceAll === 0 && fr12.concat(fr13, fr14).filter(f => f.busy).length > 20,
            'objects whose id or elementType contains "contact_element", across ' +
            (fr12.length + fr13.length + fr14.length) + ' frames of which ' +
            fr12.concat(fr13, fr14).filter(f => f.busy).length + ' had a contact engaged: ' + ceAll);

        results.from_cycle = {
            t_c_ms: +FC_TC_MS.toFixed(3),
            state_12: ps12.map(p => ({ cycle: p.cycle, frames: p.n, wall_ms: +p.wallMs.toFixed(1), phys_ms: +p.physMs.toFixed(3), ratio: +p.ratio.toFixed(9), badge: p.badgeOn })),
            state_13: ps13.map(p => ({ cycle: p.cycle, frames: p.n, wall_ms: +p.wallMs.toFixed(1), ratio: +p.ratio.toFixed(9), badge: p.badgeOn })),
            default_equals_explicit_zero: same1314,
            pin: { T0: Math.round(T0), T1: Math.round(T1), a0, b1, stable: JSON.stringify(a0) === JSON.stringify(a0b) },
        };

        chk('D7_no_page_errors_on_the_re_arm_page', r.errors.length === 0, JSON.stringify(r.errors.slice(0, 3)));
        results.rearm = {
            corners: cornerRows,
            default_period: { want: wantD, got: gotD.map(t => Math.round(t)) },
            guided_2: { want: wantG, got: gotG.map(t => Math.round(t)), stream: frG.filter((_, i) => i % 10 === 0).map(f => [Math.round(f.t), +f.s.toFixed(6), +f.v.toFixed(6)]) },
            guided_5: { rearms: idxL.map(i => Math.round(frL[i].t)), clamped: frL.filter(f => f.bh > 0).length },
            pin: { p1, p3, frozen_stable: JSON.stringify(q1) === JSON.stringify(q2) },
        };
        await r.browser.close();
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
        // ── S3 (REWORKED 2026-08-01) — NO contact-element geometry, ever ──────
        //   It used to read "the contact element exists and compresses", which is
        // the OLD design: a compressible box fitted between the facing faces.
        // The founder removed it outright — a drawn thing at the collision reads
        // as a third object arriving at the impact, and in a real collision
        // nothing arrives. The invariant is now the negative one, and it is
        // asserted over the ENGAGED frames too (a check that only looked at free
        // flight would have passed the very design being removed).
        //   Existence-before-negative (scar #7): the run is only meaningful if a
        // contact actually happened, so the frame budget must contain engaged
        // frames AND a recorded event.
        let ceSeen = 0, engagedSeen = 0, ceWitness = '';
        for (let i = 0; i < 40; i++) {
            await h.tick(16.7, 1);
            const q = await h.snap();
            if (q.ceGeom > 0) { ceSeen++; if (!ceWitness) ceWitness = JSON.stringify(q.ceIds); }
            if (q.contacts[0] && q.contacts[0].engaged) engagedSeen++;
        }
        const s3 = await h.snap();
        chk('S3_no_contact_element_geometry_is_ever_visible',
            ceSeen === 0 && engagedSeen > 2 && s3.events.length > 0,
            'wall impact over 40 frames: ' + engagedSeen + ' of them with the contact ENGAGED and ' +
            s3.events.length + ' recorded contact event(s) — so the negative below covers the impact ' +
            'itself, not just the free flight. Objects in the scene whose id or elementType contains ' +
            '"contact_element": ' + ceSeen + '/40 frames (must be 0; pre-fix every frame carried ' +
            (3) + ' of them) ' + (ceWitness ? 'witness ' + ceWitness : ''));
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
