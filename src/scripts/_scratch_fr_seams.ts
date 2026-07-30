/**
 * SCRATCH — force_rig BRANCH A (force_table) bring-up proof (lom-g, 2026-07-30).
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
 * Spec: docs/FORCE_RIG_ENGINE_SPEC.md section 5. Assertions 1/2/3/9 are
 * implemented here; 4-8 belong to the whirl branch and report SKIPPED.
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
            x: o.position.x, y: o.position.y,
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
    for (const k of ['m1', 'm2', 'm3', 'angle1', 'angle2']) {
        const el = document.getElementById('fr_' + k + '_row');
        rows[k] = el ? el.style.visibility : null;
    }
    const gen = document.getElementById('sliders');
    return {
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
function skip(id: string, detail: string) {
    console.log('SKIP ' + id + '  ' + detail);
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

    // ── Spec section 5 assertions owned by the WHIRL branch (dispatch 2) ────
    skip('S4_conical_solution', 'whirl branch not built in this dispatch');
    skip('S5_physical_range_clamp', 'whirl branch not built in this dispatch');
    skip('S6_period', 'whirl branch not built in this dispatch');
    skip('S7_cut_the_string_is_straight', 'whirl branch not built in this dispatch');
    skip('S8_no_outward_force_exists', 'whirl branch not built in this dispatch');

    fs.writeFileSync(path.join(OUT, 'probe.json'), JSON.stringify(results, null, 1), 'utf8');
    const failed = checks.filter(c => !c.ok);
    console.log('\n──────────────────────────────────────────────');
    console.log(checks.length + ' checks · ' + (checks.length - failed.length) + ' passed · ' + failed.length + ' failed');
    if (failed.length) console.log('FAILED: ' + failed.map(f => f.id).join(', '));
    console.log('probe.json + screenshots -> ' + OUT);
    process.exit(failed.length ? 1 : 0);
})();
