/**
 * SCRATCH — force_rig bring-up proof, BOTH branches (lom-g, 2026-07-30/31):
 * branch A = force_table, branch B = whirl.
 * NOT product code. Not a concept. Same shape and scaffolding as
 * _scratch_nlb_seams.ts: drives the REAL renderer (assembleField3DHtml ->
 * Playwright chromium -> real Three.js + real animate() clock) and asserts
 * against closed forms derived HERE, independently of the renderer's own
 * algebra — so a wrong implementation cannot agree with the expectation by
 * construction.
 *
 * Fixtures deliberately live in this file, never in src/data/concepts/ (they
 * would be swept into validate:concepts and fail the authoring gates), and
 * nothing is written to the database.
 *
 * Spec: docs/FORCE_RIG_ENGINE_SPEC.md section 5. Assertions 1/2/3/9 cover
 * branch A (force_table); 4-8 cover branch B (whirl). All nine run here.
 *
 * Run: npx tsx src/scripts/_scratch_fr_seams.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_fr_seams');
const G = 9.8;
const TABLE_R_M = 0.25;         // FR_TABLE_R_M
const WORLD_PER_M = 9.6;        // FR_TABLE_R_W / FR_TABLE_R_M

const THREE_TAG =
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" crossorigin="anonymous"></script>';
const PROBE = `
<script>
(function () {
  var OrigScene = THREE.Scene;
  function PatchedScene() { var s = new OrigScene(); window.__FR_SCENE = s; return s; }
  PatchedScene.prototype = OrigScene.prototype;
  THREE.Scene = PatchedScene;
})();
</script>`;

const CLOCK_INIT = `(function () {
  var vclock = 0, q = [];
  window.requestAnimationFrame = function (cb) { q.push(cb); return q.length; };
  window.cancelAnimationFrame = function () {};
  try { performance.now = function () { return vclock; }; } catch (e) {}
  window.__FR_TICK = function (dtMs, n) {
    var count = n || 1;
    for (var k = 0; k < count; k++) {
      vclock += dtMs;
      var cur = q; q = [];
      for (var i = 0; i < cur.length; i++) {
        try { cur[i](vclock); } catch (e) { window.__FR_TICK_ERR = String(e && e.message || e); }
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
// The fixture — a 3-4-5 force triangle, so equilibrium is EXACT and Lami is
// non-trivial (three DIFFERENT tensions and three different opposite angles;
// the usual 3x120-degrees fixture would make Lami true by symmetry alone and
// prove nothing).
//   T1 = 3g at   0 deg      -> ( 29.4,   0  )
//   T2 = 4g at  90 deg      -> (  0,   39.2 )
//   T3 = 5g at atan2(-4,-3) -> (-29.4, -39.2)   sums to exactly zero
// Masses sit in the 3-5 kg band deliberately: the arrow length map is reused
// verbatim from newtons_laws_body, floor included (every force under ~11.5 N
// draws at the same floor length), so a force table authored in grams would
// render three identical arrows.
// ════════════════════════════════════════════════════════════════════════════
const M1 = 3, M2 = 4, M3 = 5;
const A1 = 0, A2 = 90, A3 = (Math.atan2(-4, -3) * 180 / Math.PI + 360) % 360;   // 233.13010235...
const START_OFFSET = [0.06, -0.045];   // metres — the ring starts DISPLACED, so
                                       // "returns to the centre" is a real test

function tableState(label: string, m1: number, extra?: Record<string, unknown>) {
    const fr: Record<string, any> = {
        apparatus: 'force_table',
        force_table: {
            view: 'top_down',
            strings: [
                { id: 's1', angle_deg: A1, hanging_mass_kg: m1, label: 'T₁' },
                { id: 's2', angle_deg: A2, hanging_mass_kg: M2, label: 'T₂' },
                { id: 's3', angle_deg: A3, hanging_mass_kg: M3, label: 'T₃' },
            ],
            show_resultant: true,
            ring_start_offset_m: START_OFFSET,
        },
        arrows: [{ show: ['tension', 'resultant'] }],
        readouts: ['T', 'sum_Fx', 'sum_Fy', 'sum_F'],
        glow_focal: 'fr_ring',
        controls_visible: ['m1', 'm2', 'm3', 'angle1', 'angle2'],
    };
    if (extra) for (const k of Object.keys(extra)) fr[k] = extra[k];
    return {
        label, visible_elements: [], camera_position: [0, 0, 9.5], caption: label,
        formula_overlay: 'ΣF = 0', force_rig: fr,
    };
}

const TABLE: Field3DConfig = {
    scenario_type: 'force_rig',
    explorer_id: 'force_rig_explorer',
    field_lines: INERT_FIELD_LINES,
    states: {
        // Balanced: the ring must return to the centre and stay.
        STATE_1: tableState('Balanced', M1),
        // One weight 20% heavier: it must settle somewhere ELSE, and stay there.
        STATE_2: tableState('One weight heavier', M1 * 1.2),
        // Sandbox twin of STATE_1 (Rule 37 free-run, drag-seizing).
        STATE_3: tableState('Explore', M1, { trusted_drag_seizes: true }),
    },
} as unknown as Field3DConfig;

// ════════════════════════════════════════════════════════════════════════════
// BRANCH B fixtures — the whirl.
// Magnitudes are chosen against the arrow map's ~11.5 N floor (see the branch A
// note above), so "length is proportional to magnitude" is genuinely true here:
//   conical  m = 1.5 kg, L = 1.00 m, omega = 4.0  -> T = m w^2 L = 24.0 N, W = 14.7 N
//   flat     m = 4.0 kg, L = 1.00 m, omega = 1.8  -> T = 12.96 N, W = 39.2 N
// The flat/release fixture runs SLOW on purpose: at omega = 1.8 the bob covers
// 1.8 m/s after the cut, so a ~1.2 s post-release window (deriveStateMeta's pin
// offset) stays inside a normal camera frustum instead of leaving the frame.
// ════════════════════════════════════════════════════════════════════════════
const WL = 1.0;                 // string length, metres
const W_CONICAL_M = 1.5;        // conical bob mass, kg
const W_CONICAL_OMEGA = 4.0;    // rad/s   (omega^2 L = 16 > g, so a cone exists)
const W_FLAT_M = 4.0;
const W_FLAT_OMEGA = 1.8;
const W_RELEASE_MS = 2000;

function whirlState(label: string, whirl: Record<string, unknown>, extra?: Record<string, unknown>, formula?: string) {
    const fr: Record<string, any> = {
        apparatus: 'whirl',
        whirl: whirl,
        // NOT 'resultant' AND 'centripetal' together: in the steady state they are
        // the SAME vector, so authoring both stacks two arrows and two labels on
        // one line (seen in the first bring-up frame). One per state.
        arrows: [{ show: ['tension', 'weight', 'centripetal'] }],
        readouts: ['T', 'theta', 'v', 'omega', 'r', 'a_c'],
        glow_focal: 'fr_bob',
        controls_visible: ['omega', 'L', 'bob_mass'],
    };
    if (extra) for (const k of Object.keys(extra)) fr[k] = extra[k];
    return {
        label, visible_elements: [], camera_position: [0, 3.4, 9.2], caption: label,
        formula_overlay: formula || 'cos θ = g / (ω²L)', force_rig: fr,
    };
}

const WHIRL: Field3DConfig = {
    scenario_type: 'force_rig',
    explorer_id: 'force_rig_explorer',
    field_lines: INERT_FIELD_LINES,
    states: {
        // Conical pendulum. theta is SOLVED; nothing here authors it.
        STATE_1: whirlState('Conical', {
            geometry: 'conical', string_length_m: WL, bob_mass_kg: W_CONICAL_M,
            omega_rad_per_s: W_CONICAL_OMEGA, show_radius: true, show_velocity: true,
        }),
        // Flat plane + cut the string.
        STATE_2: whirlState('Cut the string', {
            geometry: 'flat', string_length_m: WL, bob_mass_kg: W_FLAT_M,
            omega_rad_per_s: W_FLAT_OMEGA, show_radius: true, show_velocity: true,
            release: { at_ms: W_RELEASE_MS, trail: true, ghost_circle: true },
        }, {
            // On a flat plane the resultant IS the tension, so only one of them is
            // drawn. After the cut BOTH are gone — which is the whole beat.
            arrows: [{ show: ['tension', 'weight', 'normal'] }],
            readouts: ['T', 'v', 'omega', 'r', 'a_c'],
        }, 'T = m ω² r'),
        // Sandbox twin of STATE_1 (Rule 37 free-run, drag-seizing) — the omega/L
        // sweep and the physical-range clamp are driven through its real sliders.
        STATE_3: whirlState('Explore', {
            geometry: 'conical', string_length_m: WL, bob_mass_kg: W_CONICAL_M,
            omega_rad_per_s: W_CONICAL_OMEGA, show_radius: true, show_velocity: true,
        }, { trusted_drag_seizes: true }),
    },
} as unknown as Field3DConfig;

// ── Independent whirl model, written HERE, never read off the renderer ──────
// The renderer INTEGRATES; these are the closed forms the integration must
// reproduce. They are derived from the spec statements (T cos θ = mg,
// T sin θ = m ω² L sin θ) rather than copied from any engine expression.
function conicalCos(omega: number, L: number): number { return G / (omega * omega * L); }
function conicalT(m: number, omega: number, L: number): number { return m * omega * omega * L; }
function conicalPeriod(omega: number, L: number): number {
    return 2 * Math.PI * Math.sqrt((L * conicalCos(omega, L)) / G);
}

// ── Independent model, written HERE, never read off the renderer ────────────
// Each string pulls the ring toward its own pulley with tension m*g exactly, so
// the pull DIRECTION is unit(pulley - p). The equilibrium is the root of that
// sum. Solved below by damped fixed-point iteration on the same physical
// statement — independently coded, so a renderer that solved a different
// problem cannot agree with it.
type Str = { angle: number; m: number };
function sumF(strs: Str[], px: number, py: number): { x: number; y: number; mag: number } {
    let fx = 0, fy = 0;
    for (const s of strs) {
        const t = s.angle * Math.PI / 180;
        const dx = TABLE_R_M * Math.cos(t) - px;
        const dy = TABLE_R_M * Math.sin(t) - py;
        const L = Math.hypot(dx, dy) || 1;
        const T = s.m * G;
        fx += T * dx / L;
        fy += T * dy / L;
    }
    return { x: fx, y: fy, mag: Math.hypot(fx, fy) };
}
function solveEquilibrium(strs: Str[]): { x: number; y: number } {
    let px = 0, py = 0;
    // Gradient descent on |ΣF| with a small step: the map is a contraction near
    // the root, and 200k tiny steps costs nothing here and needs no Jacobian.
    for (let i = 0; i < 200000; i++) {
        const f = sumF(strs, px, py);
        if (f.mag < 1e-12) break;
        px += f.x * 2e-5;
        py += f.y * 2e-5;
    }
    return { x: px, y: py };
}
// Lami: for three concurrent forces in equilibrium, T_i / sin(angle between the
// OTHER two) is the same for all three.
function lamiRatios(strs: Str[]): number[] {
    const ang = (a: number, b: number) => {
        let d = Math.abs(a - b) % 360;
        if (d > 180) d = 360 - d;
        return d * Math.PI / 180;
    };
    return [
        strs[0].m * G / Math.sin(ang(strs[1].angle, strs[2].angle)),
        strs[1].m * G / Math.sin(ang(strs[0].angle, strs[2].angle)),
        strs[2].m * G / Math.sin(ang(strs[0].angle, strs[1].angle)),
    ];
}

type Row = Record<string, any>;
const SNAP = () => {
    const w = window as any, scene = w.__FR_SCENE, eng = w.PM_frEngine;
    const objs: Row = {};
    scene.traverse((o: any) => {
        const id = o.userData && o.userData.id;
        if (!id || String(id).indexOf('fr_') !== 0) return;
        objs[id] = {
            visible: o.visible,
            x: o.position.x, y: o.position.y, z: o.position.z,
            sy: o.scale ? o.scale.y : null,
            text: o._frText || null,
        };
    });
    const strings = (eng.strings || []).map((s: any) => ({
        id: s.id, angle: s.angle_deg, m: s.m, T: s.T, ux: s.ux, uy: s.uy,
    }));
    const hud: Row = {};
    for (const k of ['T0', 'T1', 'T2', 'sum_Fx', 'sum_Fy', 'sum_F']) {
        const el = document.getElementById('fr_ro_' + k + '_val');
        hud[k] = el ? el.textContent : null;
    }
    const rows: Row = {};
    for (const k of ['m1', 'm2', 'm3', 'angle1', 'angle2', 'omega', 'L', 'bob_mass']) {
        const el = document.getElementById('fr_' + k + '_row');
        rows[k] = el ? el.style.visibility : null;
        const sl = document.getElementById('fr_' + k + '_slider') as HTMLInputElement | null;
        rows[k + '_value'] = sl ? sl.value : null;
        rows[k + '_disabled'] = sl ? sl.disabled : null;
    }
    // Whirl HUD (branch B). Read as TEXT, i.e. exactly what a teacher sees, so a
    // number that never reaches the screen cannot pass an assertion.
    const whud: Row = {};
    for (const k of ['wT', 'theta', 'v', 'omega', 'r', 'a_c', 'omega_min']) {
        const el = document.getElementById('fr_ro_' + k + '_val');
        whud[k] = el ? el.textContent : null;
    }
    const clampRow = document.getElementById('fr_ro_omega_min');
    whud['omega_min_display'] = clampRow ? clampRow.style.display : 'absent';
    const w3 = {
        geometry: eng.geometry, L: eng.L, m_bob: eng.m_bob,
        omega: eng.omega, omega_req: eng.omega_req, omega_min: eng.omega_min,
        omega_clamped: eng.omega_clamped, released: eng.released,
        theta_meas: eng.theta_meas, T: eng.T, speed: eng.speed, r_m: eng.r_m,
        a_c: eng.a_c, trailN: eng.trailN,
        p3: eng.p3 ? { x: eng.p3.x, y: eng.p3.y, z: eng.p3.z } : null,
        v3: eng.v3 ? { x: eng.v3.x, y: eng.v3.y, z: eng.v3.z } : null,
        anchor: eng.anchor ? { x: eng.anchor.x, y: eng.anchor.y, z: eng.anchor.z } : null,
        wArrows: (eng.wArrows || []).map((a: any) => ({ kind: a.kind, ux: a.ux, uy: a.uy, uz: a.uz, mag: a.mag })),
    };
    const gen = document.getElementById('sliders');
    return {
        whud, w3,
        simTimeMs: w.PM_simTimeMs, t_ms: eng.t_ms,
        p: { x: eng.p.x, y: eng.p.y }, v: { x: eng.v.x, y: eng.v.y },
        sumFx: eng.sumFx, sumFy: eng.sumFy, sumF: eng.sumF,
        m_ring: eng.m_ring, damping: eng.damping,
        strings, objs, hud, rows,
        genericSliders: gen ? gen.style.display : 'absent',
        formula: (document.getElementById('fr_formula') || { textContent: null }).textContent,
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
    await page.waitForFunction('typeof window.__FR_TICK === "function"', null, { timeout: 20000, polling: 100 });
    const tick = (dtMs: number, n = 1) => page.evaluate(
        ([d, k]) => (window as any).__FR_TICK(d, k), [dtMs, n] as [number, number]);
    for (let i = 0; i < 40; i++) {
        await tick(16.7, 4);
        if (await page.evaluate(() => !!(window as any).__FR_SCENE && typeof (window as any).PM_frEngine !== 'undefined')) break;
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

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const h = await open('force_table', TABLE);

    const BAL: Str[] = [{ angle: A1, m: M1 }, { angle: A2, m: M2 }, { angle: A3, m: M3 }];
    const IMB: Str[] = [{ angle: A1, m: M1 * 1.2 }, { angle: A2, m: M2 }, { angle: A3, m: M3 }];

    // ══ SEAM 1 — equilibrium settles ═══════════════════════════════════════
    await h.setState('STATE_1');
    const entry = await h.snap();
    chk('S1a_ring_starts_displaced',
        Math.hypot(entry.p.x, entry.p.y) > 0.05,
        'entry |p| = ' + (Math.hypot(entry.p.x, entry.p.y) * 1000).toFixed(2) + ' mm (authored offset ' +
        (Math.hypot(START_OFFSET[0], START_OFFSET[1]) * 1000).toFixed(2) + ' mm) — nothing to "return" to otherwise');
    chk('S1b_entry_sumF_is_a_real_restoring_pull',
        Math.abs(entry.sumF - sumF(BAL, entry.p.x, entry.p.y).mag) < 1e-9 && entry.sumF > 0.5,
        'engine ΣF = ' + entry.sumF.toFixed(6) + ' N vs independent model ' +
        sumF(BAL, entry.p.x, entry.p.y).mag.toFixed(6) + ' N — the displaced ring IS pulled back');

    // Settle. 900 ticks of 16.7 ms ~ 15 s of sim time.
    await h.tick(16.7, 900);
    const s1 = await h.snap();
    await h.tick(16.7, 300);
    const s1b = await h.snap();
    const r1 = Math.hypot(s1.p.x, s1.p.y);
    chk('S1_equilibrium_settles_to_centre', r1 < 1e-3,
        '|p| = ' + (r1 * 1e3).toExponential(3) + ' mm (must be < 1 mm) — the balanced ring returns to the centre');
    chk('S1_sumF_zero_at_rest', s1.sumF < 1e-6 && Math.hypot(s1.v.x, s1.v.y) === 0,
        '|ΣF| = ' + s1.sumF.toExponential(3) + ' N (must be < 1e-6), |v| = ' + Math.hypot(s1.v.x, s1.v.y).toExponential(3) + ' m/s');
    chk('S1_and_STAYS',
        Math.hypot(s1b.p.x - s1.p.x, s1b.p.y - s1.p.y) < 1e-9,
        'moved ' + Math.hypot(s1b.p.x - s1.p.x, s1b.p.y - s1.p.y).toExponential(2) +
        ' m over a further 5 s of sim time');
    // The dot IS the teaching: at ΣF = 0 the resultant arrow is replaced by a dot.
    chk('S1_resultant_collapses_to_a_dot',
        s1.objs['fr_zero_dot'].visible === true && s1.objs['fr_resultant'].visible === false,
        'zero-dot visible=' + s1.objs['fr_zero_dot'].visible + ', ΣF arrow visible=' + s1.objs['fr_resultant'].visible);
    chk('S1_three_tension_arrows_drawn',
        [0, 1, 2].every(i => s1.objs['fr_arrow_' + i].visible === true) && s1.objs['fr_arrow_3'].visible === false,
        'arrows 0/1/2 visible, unused 4th hidden');
    // Tension is the hanging weight, exactly (spec section 2).
    chk('S1_tension_is_mg_exactly',
        s1.strings.every((s: any, i: number) => Math.abs(s.T - BAL[i].m * G) < 1e-12),
        s1.strings.map((s: any) => s.T.toFixed(4)).join(' / ') + ' N vs m·g ' +
        BAL.map(b => (b.m * G).toFixed(4)).join(' / '));
    chk('S1_hud_reports_zero_resultant',
        s1.hud['sum_F'] === '0.00' && s1.hud['sum_Fx'] === '0.00' && s1.hud['sum_Fy'] === '0.00',
        'HUD ΣF=' + s1.hud['sum_F'] + ' ΣFx=' + s1.hud['sum_Fx'] + ' ΣFy=' + s1.hud['sum_Fy'] +
        ' (no "-0.00" anywhere)');
    chk('S1_generic_sliders_panel_excluded', s1.genericSliders === 'none' || s1.genericSliders === 'absent',
        '#sliders display = ' + s1.genericSliders + ' (force_rig owns #fr_sliders)');
    chk('S1_contextual_rows_visible',
        ['m1', 'm2', 'm3', 'angle1', 'angle2'].every(k => s1.rows[k] === 'visible'),
        'rows ' + JSON.stringify(s1.rows));
    fs.writeFileSync(path.join(OUT, 'seam1_balanced.png'), await h.page.screenshot());
    results.seam1 = { entry, settled: s1, held: s1b };

    // ══ SEAM 2 — imbalance moves it, to a SOLVED new fixed point ═══════════
    await h.setState('STATE_2');
    await h.tick(16.7, 900);
    const s2 = await h.snap();
    await h.tick(16.7, 300);
    const s2b = await h.snap();
    const r2 = Math.hypot(s2.p.x, s2.p.y);
    const expect2 = solveEquilibrium(IMB);
    chk('S2_imbalance_drives_the_ring_off_centre', r2 > 2e-3,
        '|p| = ' + (r2 * 1e3).toFixed(3) + ' mm (' + (r2 / TABLE_R_M * 100).toFixed(1) +
        '% of the table radius) after a 20% heavier weight');
    chk('S2_settles_at_a_NEW_fixed_point',
        Math.hypot(s2b.p.x - s2.p.x, s2b.p.y - s2.p.y) < 1e-9 && r2 > 2e-3,
        'moved ' + Math.hypot(s2b.p.x - s2.p.x, s2b.p.y - s2.p.y).toExponential(2) +
        ' m over a further 5 s — it settles, it does not drift');
    chk('S2_fixed_point_matches_the_independent_solve',
        Math.hypot(s2.p.x - expect2.x, s2.p.y - expect2.y) < 5e-5,
        'engine p = (' + s2.p.x.toFixed(6) + ', ' + s2.p.y.toFixed(6) + ') vs independently solved (' +
        expect2.x.toFixed(6) + ', ' + expect2.y.toFixed(6) + ') — the settle is SOLVED, not scripted');
    chk('S2_sumF_vanishes_at_the_new_point', s2.sumF < 1e-6,
        '|ΣF| = ' + s2.sumF.toExponential(3) + ' N at the new fixed point');
    chk('S2_drawn_weight_tracks_the_hanging_mass',
        s2.objs['fr_weight_0'].sy > s1.objs['fr_weight_0'].sy + 1e-6 &&
        s2.objs['fr_weightlbl_0'].text === (M1 * 1.2).toFixed(1) + ' kg',
        'plate height ' + s1.objs['fr_weight_0'].sy.toFixed(4) + ' -> ' + s2.objs['fr_weight_0'].sy.toFixed(4) +
        ', label "' + s2.objs['fr_weightlbl_0'].text + '" — one funnel: the drawn weight and the tension move together');
    chk('S2_tension_followed_the_same_write',
        Math.abs(s2.strings[0].T - M1 * 1.2 * G) < 1e-12,
        'T₁ = ' + s2.strings[0].T.toFixed(4) + ' N = ' + (M1 * 1.2).toFixed(1) + ' kg × 9.8');
    fs.writeFileSync(path.join(OUT, 'seam2_imbalance.png'), await h.page.screenshot());
    results.seam2 = { settled: s2, held: s2b, expected: expect2 };

    // ══ SEAM 3 — Lami's theorem ════════════════════════════════════════════
    await h.setState('STATE_1');
    await h.tick(16.7, 900);
    const s3 = await h.snap();
    const engRatios = (() => {
        const ang = (a: number, b: number) => { let d = Math.abs(a - b) % 360; if (d > 180) d = 360 - d; return d * Math.PI / 180; };
        const st = s3.strings;
        return [
            st[0].T / Math.sin(ang(st[1].angle, st[2].angle)),
            st[1].T / Math.sin(ang(st[0].angle, st[2].angle)),
            st[2].T / Math.sin(ang(st[0].angle, st[1].angle)),
        ];
    })();
    const spread = (Math.max(...engRatios) - Math.min(...engRatios)) / Math.max(...engRatios);
    const expRatios = lamiRatios(BAL);
    chk('S3_lami_ratios_agree_within_0p5pc', spread < 0.005,
        'T_i / sin(opposite) = ' + engRatios.map(r => r.toFixed(4)).join(' / ') +
        ' — spread ' + (spread * 100).toFixed(4) + '% (must be < 0.5%)');
    chk('S3_lami_matches_the_independent_derivation',
        engRatios.every((r, i) => Math.abs(r - expRatios[i]) < 1e-9),
        'independent: ' + expRatios.map(r => r.toFixed(4)).join(' / '));
    results.seam3 = { engRatios, expRatios, spread };

    // ══ SEAM 9 — Rule 36 ═══════════════════════════════════════════════════
    // (a) the frozen frame is byte-identical.
    await h.setState('STATE_1');
    await h.pin(1500);
    for (let i = 0; i < 400; i++) {
        await h.tick(16.7, 8);
        const t = await h.page.evaluate(() => (window as any).PM_simTimeMs);
        if (typeof t === 'number' && t >= 1499) break;
    }
    const f1 = await h.snap();
    const px1 = await h.page.screenshot();
    await h.tick(16.7, 25);
    const f2 = await h.snap();
    const px2 = await h.page.screenshot();
    chk('S9a_frozen_frame_byte_identical',
        JSON.stringify(f1.p) === JSON.stringify(f2.p) && JSON.stringify(f1.v) === JSON.stringify(f2.v) &&
        f1.sumF === f2.sumF && Buffer.compare(px1, px2) === 0,
        'p/v/ΣF identical under the pin, pixels identical=' + (Buffer.compare(px1, px2) === 0));

    // (b) N steps of 0.016 === 1 step of 0.016*N. Both runs cover the SAME 334 ms
    //     of real time (the first frame after a pin release contributes 0 ms), so
    //     they must execute the identical fixed sub-step sequence.
    await h.pin(1); await h.tick(16.7, 2);
    await h.setState('STATE_1'); await h.tick(16.7, 21);
    const single = await h.snap();
    await h.pin(1); await h.tick(16.7, 2);
    await h.setState('STATE_1'); await h.tick(33.4, 11);
    const folded = await h.snap();
    const dP = Math.hypot(single.p.x - folded.p.x, single.p.y - folded.p.y);
    const dV = Math.hypot(single.v.x - folded.v.x, single.v.y - folded.v.y);
    chk('S9b_fold_exact_60_vs_120hz', dP < 1e-12 && dV < 1e-12 && dP + dV > -1,
        'Δ|p| = ' + dP.toExponential(2) + ' m, Δ|v| = ' + dV.toExponential(2) +
        ' m/s across 20 sub-steps taken 1-at-a-time vs 2-at-a-time');
    chk('S9c_the_run_actually_moved',
        Math.hypot(single.p.x - entry.p.x, single.p.y - entry.p.y) > 1e-4,
        'the folded comparison travelled ' +
        (Math.hypot(single.p.x - entry.p.x, single.p.y - entry.p.y) * 1e3).toFixed(3) +
        ' mm — a frozen pair would compare equal for the wrong reason');
    results.seam9 = { f1, f2, single, folded };

    // ══ Rule 37 — the explore state free-runs and drags seize ══════════════
    await h.setState('STATE_3');
    await h.tick(16.7, 60);
    const e1 = await h.snap();
    const dragged = await h.page.evaluate(() => {
        const el = document.getElementById('fr_m2_slider') as HTMLInputElement | null;
        if (!el) return null;
        el.value = '5';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return { seized: (window as any).PM_frSeized, m: (window as any).PM_frEngine.strings[1].m };
    });
    await h.tick(16.7, 900);
    const e2 = await h.snap();
    chk('R37_slider_write_reaches_the_physics',
        !!dragged && Math.abs(dragged.m - 5) < 1e-12 && Math.abs(e2.strings[1].T - 5 * G) < 1e-12,
        'm₂ slider -> ' + (dragged ? dragged.m : 'MISSING') + ' kg, T₂ = ' + e2.strings[1].T.toFixed(4) +
        ' N (a write that is silently swallowed is the trap this asserts against)');
    chk('R37_explore_ring_reaches_the_new_equilibrium',
        Math.hypot(e2.p.x - solveEquilibrium([{ angle: A1, m: M1 }, { angle: A2, m: 5 }, { angle: A3, m: M3 }]).x,
                   e2.p.y - solveEquilibrium([{ angle: A1, m: M1 }, { angle: A2, m: 5 }, { angle: A3, m: M3 }]).y) < 5e-5,
        'live drag moved the ring to (' + e2.p.x.toFixed(5) + ', ' + e2.p.y.toFixed(5) + ') from (' +
        e1.p.x.toFixed(5) + ', ' + e1.p.y.toFixed(5) + ')');

    chk('Z_no_page_errors', h.errors.length === 0, JSON.stringify(h.errors.slice(0, 3)));
    fs.writeFileSync(path.join(OUT, 'explore.png'), await h.page.screenshot());
    results.errors = h.errors.slice(0, 8);
    await h.browser.close();

    // ════════════════════════════════════════════════════════════════════════
    // BRANCH B — the whirl (spec section 5 assertions 4-8)
    // ════════════════════════════════════════════════════════════════════════
    const w = await open('whirl', WHIRL);

    // A page-side recorder that samples the BOB MESH once per fixed tick. Every
    // geometric assertion below is therefore made against what was actually
    // DRAWN, and every one of them is a RATIO of drawn lengths, so none of them
    // needs to know the engine's world-per-metre scale.
    await w.page.evaluate(() => {
        const q = window as any;
        q.__FR_SAMP = [];
        q.__FR_REC = false;
        const orig = q.__FR_TICK;
        let bob: any = null;
        q.__FR_TICK = function (d: number, n: number) {
            const count = n || 1;
            let r = 0;
            for (let i = 0; i < count; i++) {
                r = orig(d, 1);
                if (!q.__FR_REC) continue;
                if (!bob || !bob.parent) {
                    bob = null;
                    q.__FR_SCENE.traverse((o: any) => { if (o.userData && o.userData.id === 'fr_bob') bob = o; });
                }
                if (bob) q.__FR_SAMP.push([q.PM_frTimeMs, bob.position.x, bob.position.y, bob.position.z]);
            }
            return r;
        };
    });
    const rec = (on: boolean) => w.page.evaluate((flag) => {
        const q = window as any; q.__FR_REC = flag; if (flag) q.__FR_SAMP = [];
    }, on);
    const samples = () => w.page.evaluate(() => (window as any).__FR_SAMP as number[][]);
    const setSlider = (id: string, v: number) => w.page.evaluate(([sid, val]) => {
        const el = document.getElementById(sid as string) as HTMLInputElement | null;
        if (!el) return null;
        el.value = String(val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return el.value;
    }, [id, v] as [string, number]);

    // ══ SEAM 4 — the cone angle is SOLVED, and it PERSISTS ═════════════════
    // Each omega is written through the real slider, then the sim is INTEGRATED
    // for 2 s before anything is measured — so this tests that conical motion is
    // a stable solution of the dynamics, not that a seed formula was copied
    // correctly. cos(theta) is read as a ratio of drawn lengths off the anchor
    // and bob meshes; T is read as the HUD TEXT a teacher sees.
    await w.setState('STATE_3');
    await w.tick(16.7, 30);
    const sweep = [3.4, 4.0, 4.6, 5.2, 5.8, 6.4];
    const s4: Row[] = [];
    for (const om of sweep) {
        await setSlider('fr_omega_slider', om);
        await w.tick(16.7, 120);
        const s = await w.snap();
        const A = s.objs['fr_anchor'], B = s.objs['fr_bob'];
        const dist = Math.hypot(B.x - A.x, B.y - A.y, B.z - A.z);
        const cosMeas = (A.y - B.y) / dist;
        const cosExp = conicalCos(om, WL);
        const Thud = parseFloat(String(s.whud.wT));
        const Texp = conicalT(W_CONICAL_M, om, WL);
        const thHud = parseFloat(String(s.whud.theta));
        const thExp = Math.acos(cosExp) * 180 / Math.PI;
        s4.push({
            omega: om, cosMeas, cosExp, eCos: Math.abs(cosMeas - cosExp) / cosExp,
            Thud, Texp, eT: Math.abs(Thud - Texp) / Texp,
            thHud, thExp, eTh: Math.abs(thHud - thExp) / thExp,
        });
    }
    const wCos = Math.max(...s4.map(r => r.eCos));
    const wT = Math.max(...s4.map(r => r.eT));
    const wTh = Math.max(...s4.map(r => r.eTh));
    chk('S4_cos_theta_equals_g_over_omega2L', wCos < 0.005,
        'worst |Δcos θ|/cos θ = ' + (wCos * 100).toFixed(4) + '% across ω = ' + sweep.join('/') +
        ' rad/s (measured off the anchor+bob meshes AFTER 2 s of integration each, must be < 0.5%)');
    chk('S4_tension_equals_m_omega2_L', wT < 0.005,
        'worst |ΔT|/T = ' + (wT * 100).toFixed(4) + '% — HUD reads ' +
        s4.map(r => r.Thud.toFixed(2)).join('/') + ' N vs m ω² L ' +
        s4.map(r => r.Texp.toFixed(2)).join('/') + ' N');
    chk('S4_hud_theta_matches_the_drawn_pose', wTh < 0.005,
        'worst |Δθ|/θ = ' + (wTh * 100).toFixed(4) + '% — HUD ' +
        s4.map(r => r.thHud.toFixed(1)).join('/') + '° vs acos(g/ω²L) ' +
        s4.map(r => r.thExp.toFixed(1)).join('/') + '°');
    fs.writeFileSync(path.join(OUT, 'seam4_conical.png'), await w.page.screenshot());
    results.seam4 = s4;

    // ══ SEAM 5 — the physical range clamp is HONEST ════════════════════════
    // L = 0.60 m raises the slowest conical speed to sqrt(g/L) = 4.04 rad/s, so a
    // perfectly legal SLIDER value of 3.2 rad/s is a physically impossible cone.
    // The write must be clamped AND observable: engine, HUD, and the slider
    // handle all have to agree that 3.2 is not what is being simulated.
    await setSlider('fr_L_slider', 0.6);
    await w.tick(16.7, 60);
    const wminExp = Math.sqrt(G / 0.6);
    await setSlider('fr_omega_slider', 3.2);
    await w.tick(16.7, 120);
    const s5 = await w.snap();
    const A5 = s5.objs['fr_anchor'], B5 = s5.objs['fr_bob'];
    const cos5 = (A5.y - B5.y) / Math.hypot(B5.x - A5.x, B5.y - A5.y, B5.z - A5.z);
    chk('S5_engine_clamps_omega_to_the_physical_minimum',
        s5.w3.omega_clamped === true && Math.abs(s5.w3.omega - wminExp) < 1e-9 &&
        Math.abs(s5.w3.omega_req - 3.2) < 1e-9,
        'requested ω = ' + s5.w3.omega_req + ' rad/s, simulated ω = ' + s5.w3.omega.toFixed(6) +
        ' rad/s vs √(g/L) = ' + wminExp.toFixed(6) + ' (clamped flag ' + s5.w3.omega_clamped + ')');
    chk('S5_no_cone_is_rendered_below_the_range',
        cos5 > 0.99999 && s5.w3.r_m < 1e-6 && s5.objs['fr_guide_ring'].visible === false,
        'cos θ = ' + cos5.toFixed(8) + ' (bob hangs, θ = ' +
        (Math.acos(Math.min(1, cos5)) * 180 / Math.PI).toFixed(3) + '°), swept radius ' +
        s5.w3.r_m.toExponential(2) + ' m, guide ring visible=' + s5.objs['fr_guide_ring'].visible);
    chk('S5_the_write_is_not_silently_swallowed',
        parseFloat(String(s5.rows.omega_value)) > 3.9 &&
        s5.whud.omega === wminExp.toFixed(2) &&
        s5.whud.omega_min_display === 'block' && s5.whud.omega_min === wminExp.toFixed(2),
        'slider handle snapped back to ' + s5.rows.omega_value + ' (from the written 3.2), HUD ω = ' +
        s5.whud.omega + ' rad/s and the clamp line reads ω min = ' + s5.whud.omega_min +
        ' rad/s, display=' + s5.whud.omega_min_display);
    fs.writeFileSync(path.join(OUT, 'seam5_clamp.png'), await w.page.screenshot());
    results.seam5 = { snap: s5, wminExp, cos5 };

    // ══ SEAM 6 — the revolution time is the conical period ═════════════════
    // Measured across TWO revolutions and halved, off the bob mesh's azimuth, so
    // no single sample landing on a designed instant can carry the result.
    await w.setState('STATE_1');
    await w.tick(16.7, 12);
    await rec(true);
    await w.tick(16.7, 230);            // ~3.8 s > 2 x tau (tau = 1.571 s at omega = 4)
    await rec(false);
    const samp6 = await samples();
    const tauExp = conicalPeriod(W_CONICAL_OMEGA, WL);
    let unwrap = 0, prevPhi = Math.atan2(samp6[0][3], samp6[0][1]);
    let tTwo: number | null = null;
    for (let i = 1; i < samp6.length; i++) {
        const phi = Math.atan2(samp6[i][3], samp6[i][1]);
        let d = phi - prevPhi;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        const before = unwrap;
        unwrap += d;
        prevPhi = phi;
        if (tTwo === null && Math.abs(unwrap) >= 4 * Math.PI) {
            const f = (4 * Math.PI - Math.abs(before)) / Math.abs(unwrap - before);
            tTwo = samp6[i - 1][0] + f * (samp6[i][0] - samp6[i - 1][0]);
        }
    }
    const tauMeas = tTwo === null ? NaN : (tTwo - samp6[0][0]) / 2000;
    chk('S6_period_matches_2pi_sqrt_Lcostheta_over_g',
        isFinite(tauMeas) && Math.abs(tauMeas - tauExp) / tauExp < 0.01,
        'measured τ = ' + (isFinite(tauMeas) ? tauMeas.toFixed(5) : 'NO REVOLUTION') +
        ' s over two revolutions of the drawn bob vs 2π√(L cos θ/g) = ' + tauExp.toFixed(5) +
        ' s — error ' + (isFinite(tauMeas) ? (Math.abs(tauMeas - tauExp) / tauExp * 100).toFixed(4) : 'n/a') +
        '% (must be < 1%)');
    results.seam6 = { tauMeas, tauExp, samples: samp6.length };

    // ══ SEAM 7 — cutting the string leaves a STRAIGHT, TANGENTIAL path ═════
    await w.setState('STATE_2');
    await w.tick(16.7, 6);
    await rec(true);
    await w.tick(16.7, 200);            // 3.34 s: 2 s of circling, then ~1.3 s of flight
    await rec(false);
    const samp7 = await samples();
    const pre = samp7.filter(s => s[0] < W_RELEASE_MS - 300);
    const post = samp7.filter(s => s[0] > W_RELEASE_MS + 120);
    const Rw = pre.reduce((a, s) => a + Math.hypot(s[1], s[3]), 0) / pre.length;
    const segs = [];
    for (let i = 1; i < post.length; i++) {
        segs.push({ dx: post[i][1] - post[i - 1][1], dy: post[i][2] - post[i - 1][2], dz: post[i][3] - post[i - 1][3] });
    }
    const lens = segs.map(s => Math.hypot(s.dx, s.dy, s.dz));
    const lenSpread = (Math.max(...lens) - Math.min(...lens)) / (lens.reduce((a, b) => a + b, 0) / lens.length);
    let maxTurn = 0;
    for (let i = 1; i < segs.length; i++) {
        const a = segs[i - 1], b = segs[i];
        const c = (a.dx * b.dx + a.dy * b.dy + a.dz * b.dz) / (lens[i - 1] * lens[i]);
        maxTurn = Math.max(maxTurn, Math.acos(Math.max(-1, Math.min(1, c))) * 180 / Math.PI);
    }
    const rads = post.map(s => Math.hypot(s[1], s[3]));
    let monotone = true;
    for (let i = 1; i < rads.length; i++) if (rads[i] <= rads[i - 1]) monotone = false;
    // Tangency, stated as geometry rather than as an angle at one instant: the
    // perpendicular distance from the axis to the straight post-cut line must BE
    // the radius of the circle the bob abandoned.
    const pA = post[2], pB = post[post.length - 1];
    const perp = Math.abs(pA[1] * pB[3] - pA[3] * pB[1]) / Math.hypot(pB[1] - pA[1], pB[3] - pA[3]);
    chk('S7_post_cut_path_is_straight', maxTurn < 0.5,
        'largest turn between successive drawn steps = ' + maxTurn.toFixed(5) +
        '° over ' + segs.length + ' steps (must be < 0.5°) — no curve, in or out');
    chk('S7_post_cut_speed_is_constant', lenSpread < 0.005,
        'step-length spread = ' + (lenSpread * 100).toFixed(5) + '% (must be < 0.5%) — nothing acts on it');
    chk('S7_departure_is_TANGENTIAL_not_outward',
        Math.abs(perp - Rw) / Rw < 0.01,
        'perpendicular distance from the axis to the straight path = ' + perp.toFixed(5) +
        ' vs the abandoned circle radius ' + Rw.toFixed(5) + ' (Δ ' +
        (Math.abs(perp - Rw) / Rw * 100).toFixed(4) + '%, must be < 1%) — a radial "flung outward" path would read 0');
    chk('S7_distance_from_the_axis_increases_monotonically', monotone && rads[rads.length - 1] > Rw * 1.5,
        'r grows ' + rads[0].toFixed(3) + ' -> ' + rads[rads.length - 1].toFixed(3) +
        ' (circle radius ' + Rw.toFixed(3) + '), strictly increasing=' + monotone);
    chk('S7_the_string_and_the_ghost_tell_the_story',
        (await w.snap()).objs['fr_wstring'].visible === false &&
        (await w.snap()).objs['fr_ghost_ring'].visible === true &&
        (await w.snap()).objs['fr_trail'].visible === true,
        'string cut (hidden), abandoned circle kept as a dim ghost, post-cut trail drawn');
    // A frame ~0.6 s after the cut, while the bob is still in shot — the picture a
    // teacher actually stops on.
    await w.setState('STATE_2');
    await w.tick(16.7, 156);
    fs.writeFileSync(path.join(OUT, 'seam7_release.png'), await w.page.screenshot());
    results.seam7 = { Rw, perp, maxTurn, lenSpread, monotone, n: post.length };

    // ══ SEAM 8 — there is no outward force, anywhere ═══════════════════════
    // (a) the source carries no centrifugal term at all, in any executable line.
    const src = fs.readFileSync(path.join(process.cwd(), 'src/lib/renderers/field_3d_renderer.ts'), 'utf8');
    // NOTE the /\r?\n/ split: the working tree is CRLF, and a plain '\n' split
    // leaves a trailing '\r' on every line, which makes an anchored /.*$/ comment
    // strip silently match nothing (it looked like two real hits on the first run;
    // both were prose in unrelated scenarios).
    const codeOnly = src.replace(/\/\*[\s\S]*?\*\//g, '').split(/\r?\n/)
        .map(l => l.replace(/^\s*\/\/.*$/, '').replace(/\s\/\/.*$/, ''))
        .join('\n');
    const centrifugalHits = (codeOnly.match(/centrifug/gi) || []).length;
    chk('S8a_no_centrifugal_term_in_the_renderer_source', centrifugalHits === 0,
        'occurrences of /centrifug/i in executable lines = ' + centrifugalHits);
    // (b) every arrow the engine actually DREW, sampled right round a revolution:
    //     none of them may have a component pointing away from the axis.
    await w.setState('STATE_1');
    await w.tick(16.7, 12);
    let worstOut = -1, worstKind = '', tensionDot = 1, sumFerr = 0, arrowKinds: string[] = [];
    for (let k = 0; k < 10; k++) {
        await w.tick(16.7, 10);
        const s = await w.snap();
        const B = s.objs['fr_bob'], A = s.objs['fr_anchor'];
        const rr = Math.hypot(B.x, B.z) || 1;
        const rx = B.x / rr, rz = B.z / rr;
        for (const a of s.w3.wArrows) {
            if (arrowKinds.indexOf(a.kind) < 0) arrowKinds.push(a.kind);
            const outward = a.ux * rx + a.uz * rz;
            if (outward > worstOut) { worstOut = outward; worstKind = a.kind; }
            if (a.kind === 'tension') {
                const dx = A.x - B.x, dy = A.y - B.y, dz = A.z - B.z;
                const d = Math.hypot(dx, dy, dz);
                const au = Math.hypot(a.ux, a.uy, a.uz);
                tensionDot = Math.min(tensionDot, (a.ux * dx + a.uy * dy + a.uz * dz) / (d * au));
            }
        }
        // The ONLY horizontal force before the cut is the string tension: the
        // horizontal part of the drawn resultant must equal T sin(theta) exactly.
        const res = s.w3.wArrows.filter((a: any) => a.kind === 'centripetal')[0];
        if (res) {
            const horiz = res.mag;
            const Thud = parseFloat(String(s.whud.wT));
            const thRad = parseFloat(String(s.whud.theta)) * Math.PI / 180;
            sumFerr = Math.max(sumFerr, Math.abs(horiz - Thud * Math.sin(thRad)) / (Thud * Math.sin(thRad)));
        }
    }
    chk('S8b_no_drawn_arrow_points_away_from_the_axis', worstOut < 1e-6,
        'largest outward radial component over a revolution = ' + worstOut.toExponential(3) +
        ' (worst kind "' + worstKind + '"); kinds drawn = ' + arrowKinds.join('/'));
    chk('S8c_tension_points_exactly_at_the_anchor', tensionDot > 1 - 1e-6,
        'min dot(tension arrow, unit(anchor - bob)) = ' + tensionDot.toFixed(9) + ' over a revolution');
    chk('S8d_the_only_horizontal_force_is_the_tension', sumFerr < 0.005,
        'worst |ΣF_horizontal - T sin θ| / (T sin θ) = ' + (sumFerr * 100).toFixed(4) + '% (must be < 0.5%)');
    results.seam8 = { centrifugalHits, worstOut, tensionDot, sumFerr, arrowKinds };

    chk('Z_no_page_errors_whirl', w.errors.length === 0, JSON.stringify(w.errors.slice(0, 3)));
    fs.writeFileSync(path.join(OUT, 'whirl_explore.png'), await w.page.screenshot());
    results.whirlErrors = w.errors.slice(0, 8);
    await w.browser.close();

    fs.writeFileSync(path.join(OUT, 'probe.json'), JSON.stringify(results, null, 1), 'utf8');
    const failed = checks.filter(c => !c.ok);
    console.log('\n──────────────────────────────────────────────');
    console.log(checks.length + ' checks · ' + (checks.length - failed.length) + ' passed · ' + failed.length + ' failed');
    if (failed.length) console.log('FAILED: ' + failed.map(f => f.id).join(', '));
    console.log('probe.json + screenshots -> ' + OUT);
    process.exit(failed.length ? 1 : 0);
})();
