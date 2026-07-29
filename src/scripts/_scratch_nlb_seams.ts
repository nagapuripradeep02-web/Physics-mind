/**
 * SCRATCH — newtons_laws_body SEAM G + SEAM H bring-up proof (lom-e, 2026-07-30).
 * NOT product code. Not a concept. Same shape and scaffolding as
 * _scratch_nlb_bringup.ts (the sealed Phase-0 harness), narrowed to the two new
 * seams:
 *
 *   SEAM G  bodies[].shape === 'wheel'  — a body that visibly ROLLS
 *   SEAM H  train?: { body_ids }        — N carts, one string each, T₁ ≠ T₂
 *
 * Drives the REAL renderer (assembleField3DHtml -> Playwright chromium -> real
 * Three.js + real animate() clock) and asserts against closed forms derived
 * HERE, independently of the renderer's own algebra — so a wrong implementation
 * cannot agree with the expectation by construction.
 *
 * Fixtures deliberately live in this file, never in src/data/concepts/ (they
 * would be swept into validate:concepts and fail the authoring gates), and
 * nothing is written to the database.
 *
 * Run: npx tsx src/scripts/_scratch_nlb_seams.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_nlb_seams');
const G = 9.8;
const WORLD_PER_M = 0.5;        // NLB_WORLD_PER_M
const BODY_SIZE = 0.55;         // NLB_BODY_SIZE
const WHEEL_R = BODY_SIZE / 2;  // NLB_WHEEL_R

const THREE_TAG =
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" crossorigin="anonymous"></script>';
const PROBE = `
<script>
(function () {
  var OrigScene = THREE.Scene;
  function PatchedScene() { var s = new OrigScene(); window.__NLB_SCENE = s; return s; }
  PatchedScene.prototype = OrigScene.prototype;
  THREE.Scene = PatchedScene;
})();
</script>`;

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

const INERT_FIELD_LINES = {
    count: 0, color_positive: '#FF6B6B', color_negative: '#4ECDC4', opacity: 0, arrow_spacing: 0,
};

function writeFixture(name: string, config: Field3DConfig): string {
    let html = assembleField3DHtml(config);
    if (html.indexOf(THREE_TAG) < 0) throw new Error('three.js tag anchor not found');
    html = html.replace(THREE_TAG, THREE_TAG + PROBE);
    fs.mkdirSync(OUT, { recursive: true });
    const f = path.join(OUT, name + '.html');
    fs.writeFileSync(f, html, 'utf8');
    return f;
}

// ════════════════════════════════════════════════════════════════════════════
// SEAM G fixture — the rolling_friction race: same mass, same push, one block
// (μ 0.40) beside one wheel (μ_r 0.002). F must clear the BLOCK's static limit
// (μ·m·g = 15.68 N) or the block never starts and there is no race to compare.
// ════════════════════════════════════════════════════════════════════════════
const M_RACE = 4, F_RACE = 20, MU_SLIDE = 0.40, MU_ROLL = 0.002;
const WHEEL: Field3DConfig = {
    scenario_type: 'newtons_laws_body',
    explorer_id: 'newtons_laws_body_explorer',
    field_lines: INERT_FIELD_LINES,
    states: {
        STATE_1: {
            label: 'Same push, different fate',
            visible_elements: [],
            camera_position: [0, 2.4, 9.8],
            caption: 'Same push, different fate',
            newtons_laws_body: {
                mode: 'compare_mass_same_force',
                surface: { theta_deg: 0, length_m: 6 },
                bodies: [
                    { id: 'A', label: 'block', mass_kg: M_RACE, initial_position_m: -4, mu_s: MU_SLIDE, mu_k: MU_SLIDE, applied_force_N: F_RACE },
                    { id: 'B', label: 'wheel', shape: 'wheel', mass_kg: M_RACE, initial_position_m: -4, mu_s: MU_ROLL, mu_k: MU_ROLL, applied_force_N: F_RACE },
                ],
                arrows: [{ body_id: 'A', show: ['applied', 'friction'] }, { body_id: 'B', show: ['applied', 'friction'] }],
                glow_focal: 'nlb_body_B',
                readouts: ['a', 'v', 'f'],
                controls_visible: ['F'],
            },
        },
    },
} as unknown as Field3DConfig;

// ════════════════════════════════════════════════════════════════════════════
// SEAM H fixture — the tension_force train: 3 carts, 2 strings, pull at the
// FRONT so each string forward carries one more cart.
// ════════════════════════════════════════════════════════════════════════════
const M_CART = 2, MU_CART = 0.1;
function trainState(label: string, thetaDeg: number, F: number) {
    return {
        label,
        visible_elements: [],
        camera_position: [0, 2.4, 10.2],
        caption: label,
        newtons_laws_body: {
            mode: 'train_pull',
            surface: { theta_deg: thetaDeg, length_m: 6 },
            bodies: [
                // 2.5 m apart, NOT 1 m: a body is NLB_BODY_SIZE = 0.55 world units
                // = 1.1 m wide, so anything under ~1.5 m puts the carts inside each
                // other and leaves no rope to draw. Expected drawn segment length
                // (world units) = Δs·WORLD_PER_M − BODY_SIZE = 1.25 − 0.55 = 0.70.
                { id: 'P', label: 'm₁', mass_kg: M_CART, initial_position_m: -5.0, mu_s: MU_CART, mu_k: MU_CART },
                { id: 'Q', label: 'm₂', mass_kg: M_CART, initial_position_m: -2.5, mu_s: MU_CART, mu_k: MU_CART },
                { id: 'R', label: 'm₃', mass_kg: M_CART, initial_position_m: 0.0, mu_s: MU_CART, mu_k: MU_CART, applied_force_N: F },
            ],
            train: { body_ids: ['P', 'Q', 'R'] },
            arrows: [{ body_id: 'R', show: ['applied'] }],
            glow_focal: 'nlb_rope_a',
            readouts: ['a', 'T1', 'T2'],
            controls_visible: ['F'],
        },
    };
}
// ════════════════════════════════════════════════════════════════════════════
// SEAM I fixture — the opt-in shared push. STATE_1 opts in, STATE_2 does NOT,
// so one run proves the new behaviour AND that the default is unchanged.
// ════════════════════════════════════════════════════════════════════════════
function sharedState(label: string, shared: boolean) {
    const nlb: Record<string, any> = {
        mode: 'sandbox',
        surface: { theta_deg: 0, length_m: 6 },
        bodies: [
            { id: 'A', label: 'block', mass_kg: M_RACE, initial_position_m: -4, mu_s: MU_SLIDE, mu_k: MU_SLIDE, applied_force_N: F_RACE },
            { id: 'B', label: 'wheel', shape: 'wheel', mass_kg: M_RACE, initial_position_m: -4, mu_s: MU_ROLL, mu_k: MU_ROLL, applied_force_N: F_RACE },
        ],
        arrows: [{ body_id: 'A', show: ['applied'] }, { body_id: 'B', show: ['applied'] }],
        glow_focal: 'nlb_body_B',
        readouts: ['F_applied', 'a'],
        controls_visible: ['F'],
        trusted_drag_seizes: true,
    };
    if (shared) nlb.shared_applied_force = true;
    return { label, visible_elements: [], camera_position: [0, 2.4, 9.8], caption: label, newtons_laws_body: nlb };
}
const SHARED: Field3DConfig = {
    scenario_type: 'newtons_laws_body',
    explorer_id: 'newtons_laws_body_explorer',
    // REQUIRED, and the reason the first run of this fixture failed: NLB_SLIDER_SPEC
    // defaults F to [-20, 20], and a range input CLAMPS an out-of-range assignment,
    // so a drag to 30 silently became 20 and nothing moved. Widening here mirrors
    // what the rolling_friction skeleton authors (max 50 clears the heaviest block's
    // 39.2 N break-away) — the same slider-too-narrow trap lom-c and lom-d each hit
    // as a fix cycle.
    slider_controls: { F: { min: 0, max: 50, step: 0.5, default: F_RACE, label: 'F' } },
    field_lines: INERT_FIELD_LINES,
    states: {
        STATE_1: sharedState('Shared push opted in', true),
        STATE_2: sharedState('Default single-target push', false),
    },
} as unknown as Field3DConfig;

const TRAIN: Field3DConfig = {
    scenario_type: 'newtons_laws_body',
    explorer_id: 'newtons_laws_body_explorer',
    field_lines: INERT_FIELD_LINES,
    states: {
        STATE_1: trainState('Two strings, two tensions', 0, 12),
        STATE_2: trainState('Uphill: every string works harder', 20, 40),
    },
} as unknown as Field3DConfig;

// ── Closed forms, derived here and NOT from the renderer ─────────────────────
// Uniform carts, uniform μ, pull applied to the FRONT cart, all moving forward:
//   a   = (F − M g (μ cosθ + sinθ)) / M                with M = Σ m
//   T_i = (Σ_{j≤i} m_j) · (a + g (μ cosθ + sinθ))
// The bracket is "what one kilogram of cart behind this string costs": its own
// share of the acceleration plus the friction and gravity it has to overcome.
function trainExpect(thetaDeg: number, F: number, n = 3) {
    const r = thetaDeg * Math.PI / 180;
    const resist = MU_CART * Math.cos(r) + Math.sin(r);
    const M = n * M_CART;
    const a = (F - M * G * resist) / M;
    const T: number[] = [];
    for (let i = 0; i < n - 1; i++) T.push((i + 1) * M_CART * (a + G * resist));
    return { a, T };
}

type Row = Record<string, any>;
const SNAP = () => {
    const w = window as any, scene = w.__NLB_SCENE, eng = w.PM_nlbEngine;
    const objs: Row = {};
    scene.traverse((o: any) => {
        const id = o.userData && o.userData.id;
        if (!id) return;
        if (/^(nlb_rope_[ab]|nlb_seg_label_[01]|nlb_pulley_group)$/.test(id)) {
            objs[id] = { visible: o.visible, ropeLen: o.scale ? o.scale.y : null, text: o._nlbText || null };
        }
        if (/^nlb_body_[A-Z]$/.test(id)) {
            let wheel: any = null;
            for (const c of o.children || []) {
                if (c.userData && c.userData.elementType === 'nlb_wheel') wheel = c;
            }
            objs[id] = {
                z: o.position.z, y: o.position.y, x: o.position.x,
                matVisible: o.material ? o.material.visible : null,
                hasWheel: !!wheel,
                wheelVisible: wheel ? wheel.visible : null,
                spin: wheel ? wheel.rotation.z : null,
                wheelParts: wheel ? wheel.children.length : null,
            };
        }
    });
    const bodies: Row = {};
    for (const id of eng.order) {
        const b = eng.bodies[id];
        bodies[id] = { s: b.s, v: b.v, a: b.a, T: b.T, f: b.f, N: b.N };
    }
    const hud: Row = {};
    for (const k of ['T1', 'T2']) {
        const el = document.getElementById('nlb_ro_SEG_' + k + '_val');
        hud[k] = el ? el.textContent : null;
    }
    return {
        simTimeMs: w.PM_simTimeMs, t_ms: eng.t_ms,
        coupled: !!eng.coupled, hasTrain: !!eng.train, hasPulley: !!eng.pulley,
        T_seg: eng.T_seg ? eng.T_seg.slice() : null,
        a_string: eng.a_string, v_string: eng.v_string,
        bodies, objs, hud,
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
    await page.waitForFunction('typeof window.__NLB_TICK === "function"', null, { timeout: 20000, polling: 100 });
    const tick = (dtMs: number, n = 1) => page.evaluate(
        ([d, k]) => (window as any).__NLB_TICK(d, k), [dtMs, n] as [number, number]);
    for (let i = 0; i < 40; i++) {
        await tick(16.7, 4);
        if (await page.evaluate(() => !!(window as any).__NLB_SCENE && typeof (window as any).PM_nlbEngine !== 'undefined')) break;
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
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

(async () => {
    fs.mkdirSync(OUT, { recursive: true });

    // ══ SEAM G ═════════════════════════════════════════════════════════════
    {
        const h = await open('seam_g_wheel', WHEEL);
        await h.setState('STATE_1');
        await h.tick(16.7, 60);
        const s1 = await h.snap();
        await h.tick(16.7, 60);
        const s2 = await h.snap();

        const A1 = s1.objs['nlb_body_A'], B1 = s1.objs['nlb_body_B'], B2 = s2.objs['nlb_body_B'];
        chk('G1_wheel_group_built', !!B1.hasWheel && B1.wheelVisible !== false,
            'B.hasWheel=' + B1.hasWheel + ' visible=' + B1.wheelVisible + ' parts=' + B1.wheelParts);
        chk('G2_block_has_no_wheel', !A1.hasWheel, 'A.hasWheel=' + A1.hasWheel);
        chk('G3_wheel_carrier_box_hidden', B1.matVisible === false && A1.matVisible !== false,
            'B.matVisible=' + B1.matVisible + ' A.matVisible=' + A1.matVisible);
        chk('G4_wheel_parts_hub_and_spokes', B1.wheelParts === 4, 'children=' + B1.wheelParts + ' (tyre+hub+2 spokes)');

        // Spin must be the exact rolling-without-slipping angle for its position.
        const expSpin = (s: number) => -(s * WORLD_PER_M) / WHEEL_R;
        chk('G5_spin_equals_minus_s_over_r',
            near(B1.spin, expSpin(s1.bodies['B'].s), 1e-9) && near(B2.spin, expSpin(s2.bodies['B'].s), 1e-9),
            'spin1=' + B1.spin.toFixed(6) + ' exp=' + expSpin(s1.bodies['B'].s).toFixed(6) +
            ' | spin2=' + B2.spin.toFixed(6) + ' exp=' + expSpin(s2.bodies['B'].s).toFixed(6));
        chk('G6_wheel_actually_turns', Math.abs(B2.spin - B1.spin) > 0.5,
            'dspin=' + (B2.spin - B1.spin).toFixed(4) + ' rad over ' + (s2.bodies['B'].s - s1.bodies['B'].s).toFixed(3) + ' m');

        // The pedagogy: identical mass + identical push, wildly different a.
        const aBlockExp = (F_RACE - MU_SLIDE * M_RACE * G) / M_RACE;
        const aWheelExp = (F_RACE - MU_ROLL * M_RACE * G) / M_RACE;
        chk('G7_race_accelerations_match_closed_form',
            near(s1.bodies['A'].a, aBlockExp, 1e-9) && near(s1.bodies['B'].a, aWheelExp, 1e-9),
            'a_block=' + s1.bodies['A'].a.toFixed(4) + ' exp=' + aBlockExp.toFixed(4) +
            ' | a_wheel=' + s1.bodies['B'].a.toFixed(4) + ' exp=' + aWheelExp.toFixed(4));
        chk('G8_wheel_outruns_block', s2.bodies['B'].s - s2.bodies['A'].s > 0.5,
            'gap=' + (s2.bodies['B'].s - s2.bodies['A'].s).toFixed(3) + ' m');

        // Rule 36: a freeze pin must leave the spin bit-identical (it is read from
        // s, and s does not move at dt = 0).
        await h.pin(1500);
        for (let i = 0; i < 300; i++) {
            await h.tick(16.7, 8);
            const t = await h.page.evaluate(() => (window as any).PM_simTimeMs);
            if (typeof t === 'number' && t >= 1499) break;
        }
        const p1 = await h.snap();
        await h.tick(16.7, 25);
        const p2 = await h.snap();
        chk('G9_spin_byte_stable_under_freeze',
            p1.objs['nlb_body_B'].spin === p2.objs['nlb_body_B'].spin && p1.bodies['B'].s === p2.bodies['B'].s,
            'spin ' + p1.objs['nlb_body_B'].spin + ' -> ' + p2.objs['nlb_body_B'].spin);

        // Rule 36 fold: 20 x 16.7 ms (1 step each) vs 10 x 33.4 ms (2 steps each).
        await h.pin(1); await h.tick(16.7, 2);
        await h.setState('STATE_1'); await h.tick(16.7, 21);
        const single = await h.snap();
        await h.pin(1); await h.tick(16.7, 2);
        await h.setState('STATE_1'); await h.tick(33.4, 11);
        const folded = await h.snap();
        chk('G10_fold_exact_60_vs_120hz',
            Math.abs(single.bodies['B'].s - folded.bodies['B'].s) < 1e-9 &&
            Math.abs(single.objs['nlb_body_B'].spin - folded.objs['nlb_body_B'].spin) < 1e-9,
            'ds=' + Math.abs(single.bodies['B'].s - folded.bodies['B'].s).toExponential(2) +
            ' dspin=' + Math.abs(single.objs['nlb_body_B'].spin - folded.objs['nlb_body_B'].spin).toExponential(2));

        fs.writeFileSync(path.join(OUT, 'seam_g.png'), await h.page.screenshot());
        results.seam_g = { s1, s2, errors: h.errors.slice(0, 8) };
        chk('G11_no_page_errors', h.errors.length === 0, JSON.stringify(h.errors.slice(0, 3)));
        await h.browser.close();
    }

    // ══ SEAM H ═════════════════════════════════════════════════════════════
    {
        const h = await open('seam_h_train', TRAIN);
        for (const [st, theta, F] of [['STATE_1', 0, 12], ['STATE_2', 20, 40]] as Array<[string, number, number]>) {
            await h.setState(st);
            await h.tick(16.7, 40);
            const s = await h.snap();
            const exp = trainExpect(theta, F);
            const tag = st + '(θ=' + theta + ')';

            chk('H1_' + st + '_coupled_via_train',
                s.coupled === true && s.hasTrain === true && s.hasPulley === false,
                tag + ' coupled=' + s.coupled + ' train=' + s.hasTrain + ' pulley=' + s.hasPulley);
            chk('H2_' + st + '_one_rope_one_motion',
                near(s.bodies['P'].v, s.bodies['Q'].v, 1e-12) && near(s.bodies['Q'].v, s.bodies['R'].v, 1e-12) &&
                near(s.bodies['P'].a, s.bodies['R'].a, 1e-12),
                tag + ' v=' + s.bodies['P'].v.toFixed(6) + '/' + s.bodies['Q'].v.toFixed(6) + '/' + s.bodies['R'].v.toFixed(6));
            chk('H3_' + st + '_shared_a_matches_closed_form', near(s.a_string, exp.a, 1e-9),
                tag + ' a=' + s.a_string.toFixed(6) + ' exp=' + exp.a.toFixed(6));
            chk('H4_' + st + '_segment_tensions_match_closed_form',
                !!s.T_seg && s.T_seg.length === 2 && near(s.T_seg[0], exp.T[0], 1e-9) && near(s.T_seg[1], exp.T[1], 1e-9),
                tag + ' T=[' + (s.T_seg || []).map((x: number) => x.toFixed(4)).join(', ') +
                '] exp=[' + exp.T.map(x => x.toFixed(4)).join(', ') + ']');
            chk('H5_' + st + '_T2_greater_than_T1',
                !!s.T_seg && s.T_seg[1] > s.T_seg[0] + 1e-6,
                tag + ' T₁=' + s.T_seg[0].toFixed(3) + ' < T₂=' + s.T_seg[1].toFixed(3) +
                ' (ratio ' + (s.T_seg[1] / s.T_seg[0]).toFixed(3) + ', expect 2.000 for equal carts)');
            chk('H6_' + st + '_single_lane_no_stagger',
                s.objs['nlb_body_P'].z === 0 && s.objs['nlb_body_Q'].z === 0 && s.objs['nlb_body_R'].z === 0,
                tag + ' z=' + s.objs['nlb_body_P'].z + '/' + s.objs['nlb_body_Q'].z + '/' + s.objs['nlb_body_R'].z);
            // Asserts the EXPECTED length, not merely "nonzero": a magnitude-based
            // fitter happily draws a backwards stub between overlapping carts, which
            // a > 0.01 test passes on. Expected = Δs·WORLD_PER_M − BODY_SIZE.
            const expRope = 2.5 * WORLD_PER_M - BODY_SIZE;
            chk('H7_' + st + '_both_ropes_drawn_at_expected_length',
                s.objs['nlb_rope_a'].visible === true && s.objs['nlb_rope_b'].visible === true &&
                near(Number(s.objs['nlb_rope_a'].ropeLen), expRope, 1e-6) &&
                near(Number(s.objs['nlb_rope_b'].ropeLen), expRope, 1e-6),
                tag + ' lenA=' + Number(s.objs['nlb_rope_a'].ropeLen).toFixed(4) +
                ' lenB=' + Number(s.objs['nlb_rope_b'].ropeLen).toFixed(4) + ' exp=' + expRope.toFixed(4));
            chk('H8_' + st + '_no_pulley_bracket',
                s.objs['nlb_pulley_group'] ? s.objs['nlb_pulley_group'].visible === false : true,
                tag + ' bracket visible=' + (s.objs['nlb_pulley_group'] || {}).visible);
            const l0 = s.objs['nlb_seg_label_0'], l1 = s.objs['nlb_seg_label_1'];
            chk('H9_' + st + '_segment_labels_live',
                !!l0 && l0.visible === true && !!l0.text && l0.text.indexOf('T₁') === 0 &&
                !!l1 && l1.visible === true && !!l1.text && l1.text.indexOf('T₂') === 0,
                tag + ' "' + (l0 || {}).text + '" / "' + (l1 || {}).text + '"');
            chk('H10_' + st + '_hud_segment_rows',
                s.hud['T1'] != null && s.hud['T2'] != null && s.hud['T1'] !== '--' && s.hud['T2'] !== '--',
                tag + ' HUD T₁=' + s.hud['T1'] + ' T₂=' + s.hud['T2']);

            // Inextensibility, sampled over real motion: both gaps and both drawn
            // rope lengths must hold while the whole train accelerates.
            const gaps: number[][] = [];
            for (let i = 0; i < 8; i++) {
                await h.tick(16.7, 6);
                const q = await h.snap();
                gaps.push([
                    q.bodies['Q'].s - q.bodies['P'].s,
                    q.bodies['R'].s - q.bodies['Q'].s,
                    Number(q.objs['nlb_rope_a'].ropeLen),
                    Number(q.objs['nlb_rope_b'].ropeLen),
                ]);
            }
            const spread = (k: number) => Math.max(...gaps.map(g => g[k])) - Math.min(...gaps.map(g => g[k]));
            chk('H11_' + st + '_strings_stay_inextensible',
                spread(0) < 1e-9 && spread(1) < 1e-9 && spread(2) < 1e-6 && spread(3) < 1e-6,
                tag + ' gapPQ±' + spread(0).toExponential(2) + ' gapQR±' + spread(1).toExponential(2) +
                ' ropeA±' + spread(2).toExponential(2) + ' ropeB±' + spread(3).toExponential(2));
            fs.writeFileSync(path.join(OUT, 'seam_h_' + st + '.png'), await h.page.screenshot());
            results['seam_h_' + st] = { snap: s, expected: exp };
        }

        // Freeze stability + the 60/120 Hz fold, on the train branch.
        await h.setState('STATE_1');
        await h.pin(1200);
        for (let i = 0; i < 300; i++) {
            await h.tick(16.7, 8);
            const t = await h.page.evaluate(() => (window as any).PM_simTimeMs);
            if (typeof t === 'number' && t >= 1199) break;
        }
        const q1 = await h.snap();
        const px1 = await h.page.screenshot();
        await h.tick(16.7, 25);
        const q2 = await h.snap();
        const px2 = await h.page.screenshot();
        chk('H12_frozen_stable',
            JSON.stringify(q1.bodies) === JSON.stringify(q2.bodies) &&
            JSON.stringify(q1.T_seg) === JSON.stringify(q2.T_seg) &&
            Buffer.compare(px1, px2) === 0,
            'bodies+T_seg identical, pixels identical=' + (Buffer.compare(px1, px2) === 0));

        await h.pin(1); await h.tick(16.7, 2);
        await h.setState('STATE_1'); await h.tick(16.7, 21);
        const single = await h.snap();
        await h.pin(1); await h.tick(16.7, 2);
        await h.setState('STATE_1'); await h.tick(33.4, 11);
        const folded = await h.snap();
        chk('H13_fold_exact_60_vs_120hz',
            Math.abs(single.bodies['P'].s - folded.bodies['P'].s) < 1e-9 &&
            Math.abs(single.T_seg[0] - folded.T_seg[0]) < 1e-9,
            'ds=' + Math.abs(single.bodies['P'].s - folded.bodies['P'].s).toExponential(2) +
            ' dT₁=' + Math.abs(single.T_seg[0] - folded.T_seg[0]).toExponential(2));
        chk('H14_no_page_errors', h.errors.length === 0, JSON.stringify(h.errors.slice(0, 3)));
        results.seam_h_errors = h.errors.slice(0, 8);
        await h.browser.close();
    }

    // ══ SEAM I ═════════════════════════════════════════════════════════════
    {
        const h = await open('seam_i_shared_push', SHARED);
        // Drive the F slider the way a teacher does — a TRUSTED input event, since
        // the seize logic and the emit path both key off ev.isTrusted.
        const dragF = (v: number) => h.page.evaluate((val) => {
            const el = document.getElementById('nlb_f_slider') as HTMLInputElement | null;
            if (!el) return false;
            el.value = String(val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
        }, v);

        for (const [st, shared] of [['STATE_1', true], ['STATE_2', false]] as Array<[string, boolean]>) {
            await h.setState(st);
            await h.tick(16.7, 10);
            const found = await dragF(30);
            await h.tick(16.7, 10);
            const s = await h.snap();
            const fA = s.bodies['A'].a, fB = s.bodies['B'].a;
            // Recover each body's push from its own equation of motion: F = m·a + |f|,
            // with f = μ·m·g while sliding forward. Independent of the engine's own
            // bookkeeping, so this cannot agree with a wrong implementation.
            const pushA = M_RACE * fA + MU_SLIDE * M_RACE * G;
            const pushB = M_RACE * fB + MU_ROLL * M_RACE * G;
            chk('I0_' + st + '_slider_present', found === true, 'F slider found=' + found);
            if (shared) {
                chk('I1_shared_both_bodies_get_30N',
                    near(pushA, 30, 1e-6) && near(pushB, 30, 1e-6),
                    st + ' recovered pushes: block=' + pushA.toFixed(4) + ' wheel=' + pushB.toFixed(4) + ' (both expect 30.0000)');
            } else {
                chk('I2_default_unchanged_only_first_body',
                    near(pushA, 30, 1e-6) && near(pushB, F_RACE, 1e-6),
                    st + ' recovered pushes: block=' + pushA.toFixed(4) + ' (expect 30) wheel=' + pushB.toFixed(4) + ' (expect ' + F_RACE + ' — untouched)');
            }
            fs.writeFileSync(path.join(OUT, 'seam_i_' + st + '.png'), await h.page.screenshot());
            results['seam_i_' + st] = { snap: s, pushA, pushB, shared };
        }
        chk('I3_no_page_errors', h.errors.length === 0, JSON.stringify(h.errors.slice(0, 3)));
        await h.browser.close();
    }

    fs.writeFileSync(path.join(OUT, 'probe.json'), JSON.stringify(results, null, 1), 'utf8');
    const failed = checks.filter(c => !c.ok);
    console.log('\n──────────────────────────────────────────────');
    console.log(checks.length + ' checks · ' + (checks.length - failed.length) + ' passed · ' + failed.length + ' failed');
    if (failed.length) console.log('FAILED: ' + failed.map(f => f.id).join(', '));
    console.log('probe.json + screenshots -> ' + OUT);
    process.exit(failed.length ? 1 : 0);
})();
