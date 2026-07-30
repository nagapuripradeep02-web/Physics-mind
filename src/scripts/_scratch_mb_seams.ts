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
    scene.traverse((o: any) => {
        const id = o.userData && o.userData.id;
        if (!id) return;
        if (/^mb_body_[A-Za-z0-9]+$/.test(id) || id === 'mb_contact_element' || id === 'mb_track') {
            objs[id] = { x: o.position.x, y: o.position.y, z: o.position.z, visible: o.visible, sx: o.scale.x };
        }
    });
    const bodies: Row = {};
    for (const id of eng.order) {
        const b = eng.bodies[id];
        bodies[id] = { m: b.m, s: b.s, v: b.v, a: b.a, fixed: !!b.fixed, half: b.half, F: b.F_contact };
    }
    const events = (eng.events || []).map((e: any) => ({
        start_ms: e.start_ms, end_ms: e.end_ms, duration_ms: e.duration_ms,
        k: e.k, c: e.c, F_peak: e.F_peak, n: e.samples.length,
        samples: e.samples,
    }));
    return {
        t_ms: eng.t_ms, tphys_ms: eng.tphys_ms, mode: eng.mode, mu_k: eng.mu_k,
        bound_hits: eng.bound_hits, F_contact: eng.F_contact,
        latch: eng.latch || null,
        contact: eng.contact ? {
            loId: eng.contact.loId, hiId: eng.contact.hiId, k: eng.contact.k, c: eng.contact.c,
            sticks: !!eng.contact.sticks, preload: eng.contact.preload, L_nat: eng.contact.L_nat,
            engaged: !!eng.contact.engaged, latched: !!eng.contact.latched,
        } : null,
        bodies, events, objs,
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
    return { browser, page, tick, setState, pin, snap, errors, file };
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
        pending('A7d_wall_arrow_full_brightness', 'force arrows are SEAM B — no arrow exists yet to measure');
        results.wall = { fin, dp };
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
        pending('A8e_frozen_frame_byte_identical_pixels',
            'pixel comparison deferred to SEAM B/C — SEAM A draws no instruments, so a pixel baseline would be re-taken there anyway');
        results.fold = { dsA, dvA, dsB, dvB };
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
