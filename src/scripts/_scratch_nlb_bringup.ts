/**
 * SCRATCH — newtons_laws_body engine bring-up proof (spec §7 step 2).
 * NOT product code. Not a concept. Delete or keep at the orchestrator's call.
 *
 * Drives the REAL renderer: assembleField3DHtml() -> a scratch HTML file ->
 * Playwright chromium (real Three.js, real DOM, real animate() clock), then
 * probes window.PM_nlbEngine + the live THREE scene graph.
 *
 * Deliberately does NOT put fixtures in src/data/concepts/ (they would be swept
 * into validate:concepts and fail Rule 15/19/31 gates) and writes NOTHING to the
 * database.
 *
 * Run: npx tsx src/scripts/_scratch_nlb_bringup.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_nlb');
const G = 9.8;

// ── probe injected right after the three.js CDN tag: captures the live scene ──
const THREE_TAG =
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" crossorigin="anonymous"></script>';
const PROBE = `
<script>
(function () {
  // r128 assigns WebGLRenderer methods to the INSTANCE, not the prototype, so
  // the scene handle is captured by wrapping the Scene constructor instead.
  var OrigScene = THREE.Scene;
  function PatchedScene() { var s = new OrigScene(); window.__NLB_SCENE = s; return s; }
  PatchedScene.prototype = OrigScene.prototype;
  THREE.Scene = PatchedScene;
})();
</script>`;

function writeFixture(name: string, config: Field3DConfig): string {
    let html = assembleField3DHtml(config);
    if (html.indexOf(THREE_TAG) < 0) throw new Error('three.js tag anchor not found — probe cannot be injected');
    html = html.replace(THREE_TAG, THREE_TAG + PROBE);
    fs.mkdirSync(OUT, { recursive: true });
    const f = path.join(OUT, name + '.html');
    fs.writeFileSync(f, html, 'utf8');
    return f;
}

// ════════════════════════════════════════════════════════════════════════════
// EXTREME 1 — free_body_diagram: arrow overlay + ghost, a ~ 0, no pulley.
// ════════════════════════════════════════════════════════════════════════════
const FBD: Field3DConfig = {
    scenario_type: 'newtons_laws_body',
    explorer_id: 'newtons_laws_body_explorer',
    // Field3DConfig requires `field_lines` even for scenarios that draw NO tube
    // field lines (newtons_laws_body draws none) — an inert block, count 0.
    field_lines: { count: 0, color_positive: '#FF6B6B', color_negative: '#4ECDC4', opacity: 0, arrow_spacing: 0 },
    states: {
        // S1 — static: mg + N drawn, ΣF genuinely zero -> its arrow must HIDE.
        STATE_1: {
            label: 'Isolate the body',
            visible_elements: ['nlb_body_A', 'nlb_surface'],
            caption: 'Two forces only',
            formula_overlay: 'ΣF = 0',
            newtons_laws_body: {
                mode: 'fbd_isolate',
                surface: { theta_deg: 0, length_m: 6 },
                bodies: [{ id: 'A', label: 'm', mass_kg: 4, mu_s: 0.5, mu_k: 0.4 }],
                arrows: [{ body_id: 'A', show: ['weight', 'normal', 'net'] }],
                glow_focal: 'nlb_arrow_A_weight',
                readouts: ['N', 'F_net'],
                controls_visible: ['m'],
            },
        },
        // S2 — push below the static threshold: fₛ + F drawn, ΣF still zero.
        STATE_2: {
            label: 'Push, still held',
            visible_elements: ['nlb_body_A', 'nlb_surface'],
            caption: 'Friction answers the push',
            formula_overlay: 'fₛ ≤ μₛN',
            newtons_laws_body: {
                mode: 'rest_equilibrium',
                surface: { theta_deg: 0, length_m: 6 },
                bodies: [{ id: 'A', label: 'm', mass_kg: 4, mu_s: 0.5, mu_k: 0.4, applied_force_N: 10 }],
                arrows: [{ body_id: 'A', show: ['weight', 'normal', 'friction', 'applied', 'net'] }],
                glow_focal: 'nlb_arrow_A_friction',
                readouts: ['N', 'f', 'F_applied', 'F_net', 'a'],
                controls_visible: ['F', 'mu_s'],
            },
        },
        // S3 — sliding: fₖ glyph + a non-zero ΣF arrow.
        STATE_3: {
            label: 'Net force',
            visible_elements: ['nlb_body_A', 'nlb_surface'],
            caption: 'Push beats friction',
            formula_overlay: 'ΣF = ma',
            newtons_laws_body: {
                mode: 'accelerate_applied_force',
                surface: { theta_deg: 0, length_m: 6 },
                bodies: [{
                    id: 'A', label: 'm', mass_kg: 4, mu_s: 0.3, mu_k: 0.2,
                    applied_force_N: 20, initial_velocity_mps: 0.5,
                }],
                arrows: [{ body_id: 'A', show: ['weight', 'normal', 'friction', 'applied', 'net'] }],
                glow_focal: 'nlb_arrow_A_net',
                readouts: ['N', 'f', 'a', 'v', 'F_net'],
                controls_visible: ['F', 'mu_k'],
            },
        },
        // S4 — incline beat: show_components at θ = 30°.
        STATE_4: {
            label: 'Resolve the weight',
            visible_elements: ['nlb_body_A', 'nlb_surface'],
            caption: 'Weight splits in two',
            formula_overlay: 'mg → mg·sin θ + mg·cos θ',
            newtons_laws_body: {
                mode: 'incline_decompose',
                surface: { theta_deg: 30, length_m: 6, frictionless: true },
                bodies: [{ id: 'A', label: 'm', mass_kg: 4, mu_s: 0.9, mu_k: 0.9 }],
                arrows: [{ body_id: 'A', show: ['weight', 'normal'], show_components: true }],
                glow_focal: 'nlb_comp_A_sin',
                readouts: ['N'],
                controls_visible: ['theta'],
            },
        },
        // S5 — SAME show_components flag at θ = 0: components must HIDE.
        STATE_5: {
            label: 'Flat ground again',
            visible_elements: ['nlb_body_A', 'nlb_surface'],
            caption: 'Nothing left to resolve',
            formula_overlay: 'N = mg',
            newtons_laws_body: {
                mode: 'fbd_isolate',
                surface: { theta_deg: 0, length_m: 6 },
                bodies: [{ id: 'A', label: 'm', mass_kg: 4, mu_s: 0.5, mu_k: 0.4 }],
                arrows: [
                    { body_id: 'A', show: ['weight', 'normal', 'tension'], show_components: true },
                ],
                glow_focal: 'nlb_arrow_A_normal',
                readouts: ['N', 'T'],
                controls_visible: ['m'],
            },
        },
        // S6 — ghost context body + custom Unicode label overrides.
        STATE_6: {
            label: 'Context, then isolation',
            visible_elements: ['nlb_body_A', 'nlb_body_G', 'nlb_surface'],
            caption: 'Only one body is ours',
            formula_overlay: 'ΣF = ma',
            newtons_laws_body: {
                mode: 'fbd_isolate',
                surface: { theta_deg: 0, length_m: 6 },
                bodies: [
                    { id: 'A', label: 'm₁', mass_kg: 4, mu_s: 0.5, mu_k: 0.4, applied_force_N: 24 },
                    // ghost: dim, NEVER integrated (nonzero v0 on purpose — s must not move)
                    {
                        id: 'G', label: 'm₂', mass_kg: 3, ghost: true,
                        initial_position_m: -3, initial_velocity_mps: 2, applied_force_N: 15,
                    },
                ],
                arrows: [
                    { body_id: 'A', show: ['weight', 'normal', 'friction', 'applied', 'net'], labels: { net: 'ΣF' } },
                    { body_id: 'G', show: ['weight', 'normal'] },
                ],
                glow_focal: 'nlb_arrow_A_applied',
                readouts: ['a', 'v', 'F_net'],
                controls_visible: ['F'],
            },
        },
        // S7 — sandbox (Rule 37 / deriveStateMeta 'interactive').
        STATE_7: {
            label: 'Explore',
            visible_elements: ['nlb_body_A', 'nlb_surface'],
            caption: 'Try it',
            formula_overlay: 'ΣF = ma',
            newtons_laws_body: {
                mode: 'sandbox',
                surface: { theta_deg: 15, length_m: 6 },
                bodies: [
                    { id: 'A', label: 'm', mass_kg: 4, mu_s: 0.4, mu_k: 0.3 },
                    { id: 'G', label: 'm₂', mass_kg: 3, ghost: true, initial_position_m: -3 },
                ],
                arrows: [{ body_id: 'A', show: ['weight', 'normal', 'friction', 'applied', 'net'], show_components: true }],
                glow_focal: 'nlb_body_A',
                readouts: ['N', 'f', 'a', 'v', 'F_net'],
                controls_visible: ['m', 'F', 'theta', 'mu_s', 'mu_k', 'v0'],
                trusted_drag_seizes: true,
                idle_auto_sweep: { param: 'F', range: [-12, 12] },
            },
        },
    },
};

// ════════════════════════════════════════════════════════════════════════════
// EXTREME 2 — connected_bodies: Branch B + pulley/post/wheel/rope geometry.
// ════════════════════════════════════════════════════════════════════════════
const CONN: Field3DConfig = {
    scenario_type: 'newtons_laws_body',
    explorer_id: 'newtons_laws_body_explorer',
    // Field3DConfig requires `field_lines` even for scenarios that draw NO tube
    // field lines (newtons_laws_body draws none) — an inert block, count 0.
    field_lines: { count: 0, color_positive: '#FF6B6B', color_negative: '#4ECDC4', opacity: 0, arrow_spacing: 0 },
    states: {
        // S1 — Atwood (both hanging). Checksum a = (m1-m2)g/(m1+m2).
        STATE_1: {
            label: 'Atwood pair',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_pulley'],
            caption: 'Heavier side falls',
            formula_overlay: 'a = (m₁ − m₂)g / (m₁ + m₂)',
            newtons_laws_body: {
                mode: 'connected_atwood',
                surface: { theta_deg: 0, length_m: 6 },
                // NOTE: distinct ids from the incline states. A body id's `hanging`
                // flag must be CONSTANT across states (the meshes are built once
                // from the union of every state's bodies, and the parent group is
                // chosen by `hanging` at build time) — see the report.
                bodies: [
                    { id: 'P', label: 'm₁', mass_kg: 3, hanging: true, initial_position_m: 4 },
                    { id: 'Q', label: 'm₂', mass_kg: 5, hanging: true, initial_position_m: 2 },
                ],
                pulley: { body_a_id: 'P', body_b_id: 'Q', post_position_m: 6 },
                arrows: [
                    { body_id: 'P', show: ['weight', 'tension', 'net'] },
                    { body_id: 'Q', show: ['weight', 'tension', 'net'] },
                ],
                glow_focal: 'nlb_arrow_Q_tension',
                readouts: ['T', 'a', 'v'],
                controls_visible: ['m', 'm2'],
            },
        },
        // S2 — incline + hanging at θ = 0 (flat ground, SAME code path).
        STATE_2: {
            label: 'Block and weight, flat',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_pulley', 'nlb_surface'],
            caption: 'One string, one acceleration',
            formula_overlay: 'a = (m₂g − μₖm₁g) / (m₁ + m₂)',
            newtons_laws_body: {
                mode: 'connected_incline_hanging',
                surface: { theta_deg: 0, length_m: 6 },
                bodies: [
                    { id: 'A', label: 'm₁', mass_kg: 4, mu_s: 0.25, mu_k: 0.2, initial_position_m: 0 },
                    { id: 'B', label: 'm₂', mass_kg: 3, hanging: true, initial_position_m: 2 },
                ],
                pulley: { body_a_id: 'A', body_b_id: 'B', post_position_m: 6 },
                arrows: [
                    { body_id: 'A', show: ['weight', 'normal', 'friction', 'tension', 'net'] },
                    { body_id: 'B', show: ['weight', 'tension', 'net'] },
                ],
                glow_focal: 'nlb_arrow_A_tension',
                readouts: ['N', 'f', 'T', 'a', 'v'],
                controls_visible: ['m', 'm2', 'mu_k'],
            },
        },
        // S3 — the SAME state at θ = 25°, with components resolved.
        STATE_3: {
            label: 'Same rig, on a slope',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_pulley', 'nlb_surface'],
            caption: 'Slope steals from the pull',
            formula_overlay: 'a = (m₂g − m₁g·sin θ − μₖm₁g·cos θ) / (m₁ + m₂)',
            newtons_laws_body: {
                mode: 'connected_incline_hanging',
                surface: { theta_deg: 25, length_m: 6 },
                bodies: [
                    { id: 'A', label: 'm₁', mass_kg: 4, mu_s: 0.25, mu_k: 0.2, initial_position_m: 0 },
                    { id: 'B', label: 'm₂', mass_kg: 3, hanging: true, initial_position_m: 2 },
                ],
                pulley: { body_a_id: 'A', body_b_id: 'B', post_position_m: 6 },
                arrows: [
                    { body_id: 'A', show: ['weight', 'normal', 'friction', 'tension', 'net'], show_components: true },
                    { body_id: 'B', show: ['weight', 'tension', 'net'] },
                ],
                glow_focal: 'nlb_comp_A_sin',
                readouts: ['N', 'f', 'T', 'a', 'v'],
                controls_visible: ['theta', 'mu_k'],
            },
        },
        // S4 — UNCOUPLED: no pulley, no post, no wheel, no rope.
        STATE_4: {
            label: 'Cut the string',
            visible_elements: ['nlb_body_A', 'nlb_surface'],
            caption: 'No string, no tension',
            formula_overlay: 'T = 0',
            newtons_laws_body: {
                mode: 'rest_equilibrium',
                surface: { theta_deg: 0, length_m: 6 },
                bodies: [{ id: 'A', label: 'm₁', mass_kg: 4, mu_s: 0.5, mu_k: 0.4, initial_position_m: 0 }],
                arrows: [{ body_id: 'A', show: ['weight', 'normal', 'tension', 'net'] }],
                glow_focal: 'nlb_body_A',
                readouts: ['N', 'T'],
                controls_visible: ['m'],
            },
        },
        // S5 — sandbox.
        STATE_5: {
            label: 'Explore',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_pulley', 'nlb_surface'],
            caption: 'Try it',
            formula_overlay: 'a = (m₂g − m₁g·sin θ − μₖm₁g·cos θ) / (m₁ + m₂)',
            newtons_laws_body: {
                mode: 'sandbox',
                surface: { theta_deg: 20, length_m: 6 },
                bodies: [
                    { id: 'A', label: 'm₁', mass_kg: 4, mu_s: 0.25, mu_k: 0.2, initial_position_m: 0 },
                    { id: 'B', label: 'm₂', mass_kg: 3, hanging: true, initial_position_m: 2 },
                ],
                pulley: { body_a_id: 'A', body_b_id: 'B', post_position_m: 6 },
                arrows: [
                    { body_id: 'A', show: ['weight', 'normal', 'friction', 'tension', 'net'] },
                    { body_id: 'B', show: ['weight', 'tension', 'net'] },
                ],
                glow_focal: 'nlb_body_A',
                readouts: ['N', 'f', 'T', 'a', 'v'],
                controls_visible: ['m', 'm2', 'theta', 'mu_s', 'mu_k'],
                trusted_drag_seizes: true,
                idle_auto_sweep: { param: 'theta', range: [0, 40] },
            },
        },
    },
};

// ── in-page snapshot routine (stringified into page.evaluate) ────────────────
const SNAP = `(function () {
  var scene = window.__NLB_SCENE;
  var map = {};
  if (scene) scene.traverse(function (o) {
    var id = o.userData && o.userData.id;
    if (typeof id === 'string' && id.indexOf('nlb') === 0) map[id] = o;
  });
  function mat(o) {
    var m = o && o.material;
    if (!m && o && o.children && o.children.length) m = o.children[0].material;
    if (!m) return null;
    return { opacity: m.opacity, color: m.color ? m.color.getHexString() : null };
  }
  function arrowLen(o) {
    if (!o) return null;
    // ArrowHelper.setLength puts the TRUE total length at cone.position.y
    // (line.scale.y is length - headLength, so it under-reads).
    if (o.cone && o.cone.position) return o.cone.position.y;
    if (o.userData && o.userData._head) return o.userData._head.position.x + 0.14;  // NLB_COMP_HEAD_LEN
    if (o.scale) return o.scale.y;
    return null;
  }
  function ent(id) {
    var o = map[id];
    if (!o) return { present: false };
    var wp = new THREE.Vector3(); o.getWorldPosition(wp);
    return {
      present: true, visible: o.visible, len: arrowLen(o),
      text: o._nlbText != null ? o._nlbText : null,
      pos: [+wp.x.toFixed(4), +wp.y.toFixed(4), +wp.z.toFixed(4)],
      mat: mat(o)
    };
  }
  var eng = window.PM_nlbEngine || null;
  var bodies = {};
  if (eng) for (var i = 0; i < eng.order.length; i++) {
    var b = eng.bodies[eng.order[i]];
    bodies[b.id] = {
      m: b.m, hanging: b.hanging, ghost: b.ghost,
      s: b.s, v: b.v, a: b.a, N: b.N, f: b.f, T: b.T,
      F_net: b.F_net, F_applied: b.F_applied, stuck: !!b._stuck,
      mu_s: b.mu_s, mu_k: b.mu_k
    };
  }
  var kinds = ['weight', 'normal', 'friction', 'applied', 'tension', 'net'];
  var arrows = {}, comps = {}, ids = eng ? eng.order : [];
  for (var j = 0; j < ids.length; j++) {
    var bid = ids[j], per = {};
    for (var k = 0; k < kinds.length; k++) {
      per[kinds[k]] = { arrow: ent('nlb_arrow_' + bid + '_' + kinds[k]), label: ent('nlb_arrowlbl_' + bid + '_' + kinds[k]) };
    }
    arrows[bid] = per;
    comps[bid] = {
      sin: ent('nlb_comp_' + bid + '_sin'), sin_lbl: ent('nlb_complbl_' + bid + '_sin'),
      cos: ent('nlb_comp_' + bid + '_cos'), cos_lbl: ent('nlb_complbl_' + bid + '_cos'),
      right_angle: ent('nlb_ra_' + bid)
    };
  }
  var rows = {};
  var toks = ['m', 'm2', 'f', 'theta', 'mus', 'muk', 'v0'];
  for (var r = 0; r < toks.length; r++) {
    var el = document.getElementById('nlb_' + toks[r] + '_row');
    rows[toks[r]] = el ? { present: true, visibility: el.style.visibility, display: el.style.display } : { present: false };
  }
  var ro = document.getElementById('nlb_readout');
  var ff = document.getElementById('nlb_formula');
  var gen = document.getElementById('formula_overlay') || document.getElementById('formula');
  var sp = document.getElementById('nlb_sliders');
  var generic = document.getElementById('sliders');
  return {
    state: window.PM_currentState, simTimeMs: window.PM_simTimeMs, engTimeMs: eng ? eng.t_ms : null,
    coupled: eng ? eng.coupled : null, theta: eng ? eng.theta_deg : null,
    v_string: eng ? eng.v_string : null, a_string: eng ? eng.a_string : null,
    glow_focal: eng ? eng.glow_focal : null,
    bodies: bodies, arrows: arrows, comps: comps,
    surface: ent('nlb_surface'), theta_arc: ent('nlb_theta_arc'), theta_label: ent('nlb_theta_label'),
    body_mesh: (function () { var o = {}; for (var q = 0; q < ids.length; q++) { o[ids[q]] = ent('nlb_body_' + ids[q]); o[ids[q] + '_hit'] = ent('nlb_body_' + ids[q] + '_hit'); } return o; })(),
    pulley: {
      post: ent('nlb_pulley_post'), arm: ent('nlb_pulley_arm'),
      wheel: ent('nlb_pulley_wheel'), hub: ent('nlb_pulley_hub'),
      rope_a: ent('nlb_rope_a'), rope_b: ent('nlb_rope_b')
    },
    readout: ro ? { display: ro.style.display, text: ro.textContent } : null,
    formula: ff ? { display: ff.style.display, text: ff.textContent } : null,
    generic_formula: gen ? { display: gen.style.display, text: (gen.textContent || '').slice(0, 60) } : { absent: true },
    sliders_panel: sp ? { display: sp.style.display } : null,
    generic_sliders: generic ? { display: generic.style.display } : { absent: true },
    rows: rows,
    dragged: window.PM_nlbBodyDragged, seized: window.PM_nlbSweepSeized,
    supportsTimePin: window.__PM_supportsTimePin
  };
})()`;

type Snap = any;

// Deterministic virtual clock + manual rAF pump, installed BEFORE any page
// script (so before three.js and before the renderer). This is what makes the
// Rule-36 fold test possible: __pmSteps is a pure function of the wall-clock
// delta the renderer reads from performance.now(), so a 16.7 ms tick yields
// exactly 1 fixed step and a 50.1 ms tick exactly 3 — no engine hook needed.
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

async function run(name: string, config: Field3DConfig, plan: Array<{ state: string; at_ms: number }>, foldState: string, trackStates: string[]) {
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
        const ok = await page.evaluate(() => !!(window as any).__NLB_SCENE && typeof (window as any).PM_nlbEngine !== 'undefined');
        if (ok) break;
        await page.waitForTimeout(100);
    }
    const ready = await page.evaluate(() => ({
        scene: !!(window as any).__NLB_SCENE,
        eng: typeof (window as any).PM_nlbEngine,
        three: typeof (window as any).THREE,
        state: (window as any).PM_currentState,
        tickErr: (window as any).__NLB_TICK_ERR || null,
    }));
    if (!ready.scene || ready.eng === 'undefined') throw new Error('not ready: ' + JSON.stringify(ready));

    const setState = (s: string) => page.evaluate(
        st => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
    const pin = (ms: number) => page.evaluate(
        at => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: at }, '*'), ms);

    const snaps: Record<string, Snap> = {};
    for (const step of plan) {
        await setState(step.state);
        await pin(step.at_ms);
        // crawl: under a pin __pmSteps is forced to 1, so 16 ms of sim time per tick
        for (let i = 0; i < 400; i++) {
            await tick(16.7, 8);
            const t = await page.evaluate(() => (window as any).PM_simTimeMs);
            if (typeof t === 'number' && t >= step.at_ms - 1) break;
        }
        await tick(16.7, 2);
        const key = step.state + '@' + step.at_ms;
        snaps[key] = await page.evaluate(SNAP);
        const shot1 = await page.screenshot();
        await tick(16.7, 20);                 // 20 more frames AT the pin (dt = 0)
        const shot2 = await page.screenshot();
        const snapAgain: Snap = await page.evaluate(SNAP);
        snaps[key]._frozen_stable_pixels = Buffer.compare(shot1, shot2) === 0;
        snaps[key]._frozen_stable_state = JSON.stringify(snapAgain.bodies) === JSON.stringify(snaps[key].bodies);
        snaps[key]._frozen_stable_simtime = snapAgain.simTimeMs === snaps[key].simTimeMs;
        fs.writeFileSync(path.join(OUT, name + '_' + key.replace('@', '_') + '.png'), shot1);
    }

    // ── Rule 36 fold test: 30 x 0.016 s vs 10 x 0.048 s from the SAME seed ──
    const readBodies = () => page.evaluate(() => {
        const eng = (window as any).PM_nlbEngine;
        const o: any = { v_string: eng.v_string, a_string: eng.a_string, t_ms: eng.t_ms, bodies: {} };
        for (const id of eng.order) {
            const b = eng.bodies[id];
            o.bodies[id] = { s: b.s, v: b.v, a: b.a, T: b.T, F_net: b.F_net };
        }
        return o;
    });
    // Both legs start from an identical clock state: a frozen frame resets
    // __pmLastWall to undefined, so the first UNFROZEN tick of each leg
    // contributes exactly 0 fixed steps in both legs (symmetry, not luck).
    await pin(1); await tick(16.7, 2);
    await setState(foldState);                  // SET_STATE clears the pin + re-seeds
    await tick(16.7, 21);                       // 1 warm-up frame (0 steps) + 20 x 1 step
    const single = await readBodies();
    await pin(1); await tick(16.7, 2);
    await setState(foldState);
    // 33.4 ms/frame => __pmSteps = 2 => dtStep = 0.032 s in ONE call.
    // (3 steps is unreachable: the accumulator is clamped to 50 ms, and
    //  3 x 1000/60 = 50.000000000000004 > 50 — noted in the report.)
    await tick(33.4, 11);                       // 1 warm-up frame (0 steps) + 10 x 2 steps
    const folded = await readBodies();
    const fold: any = { state: foldState, single, folded, delta: {} };
    for (const id of Object.keys(single.bodies)) {
        fold.delta[id] = {
            ds: Math.abs(single.bodies[id].s - folded.bodies[id].s),
            dv: Math.abs(single.bodies[id].v - folded.bodies[id].v),
            da: Math.abs(single.bodies[id].a - folded.bodies[id].a),
            dT: Math.abs(single.bodies[id].T - folded.bodies[id].T),
        };
    }
    fold.d_v_string = Math.abs(single.v_string - folded.v_string);
    fold.d_t_ms = Math.abs(single.t_ms - folded.t_ms);

    // ── string inextensibility + ghost immobility, sampled over real motion ──
    const track = async (stateId: string) => {
        await pin(1); await tick(16.7, 2);
        await setState(stateId);
        const rows: any[] = [];
        for (let i = 0; i < 12; i++) {
            await tick(16.7, 5);
            rows.push(await page.evaluate(() => {
                const w = window as any, scene = w.__NLB_SCENE, eng = w.PM_nlbEngine;
                let ra: any = null, rb: any = null;
                scene.traverse((o: any) => {
                    const id = o.userData && o.userData.id;
                    if (id === 'nlb_rope_a') ra = o;
                    if (id === 'nlb_rope_b') rb = o;
                });
                const bs: any = {};
                for (const id of eng.order) bs[id] = { s: eng.bodies[id].s, v: eng.bodies[id].v, ghost: eng.bodies[id].ghost };
                return {
                    t: eng.t_ms, theta: eng.theta_deg,
                    lenA: ra && ra.visible ? ra.scale.y : null,
                    lenB: rb && rb.visible ? rb.scale.y : null,
                    bodies: bs,
                };
            }));
        }
        return rows;
    };

    const trackData: Record<string, any> = {};
    for (const st of trackStates) trackData[st] = await track(st);

    const tickErr = await page.evaluate(() => (window as any).__NLB_TICK_ERR || null);
    await browser.close();
    return { snaps, fold, errors, tickErr, file, track: trackData };
}

(async () => {
    const results: any = {};

    // ── run 1: FBD ──────────────────────────────────────────────────────────
    results.fbd = await run('nlb_smoke_fbd', FBD, [
        { state: 'STATE_1', at_ms: 800 },
        { state: 'STATE_2', at_ms: 800 },
        { state: 'STATE_3', at_ms: 500 },
        { state: 'STATE_4', at_ms: 800 },
        { state: 'STATE_5', at_ms: 800 },
        { state: 'STATE_6', at_ms: 500 },
        { state: 'STATE_7', at_ms: 800 },
    ], 'STATE_3', ['STATE_6', 'STATE_7']);

    // ── run 2: connected ────────────────────────────────────────────────────
    results.conn = await run('nlb_smoke_connected', CONN, [
        { state: 'STATE_1', at_ms: 400 },
        { state: 'STATE_2', at_ms: 400 },
        { state: 'STATE_3', at_ms: 400 },
        { state: 'STATE_4', at_ms: 400 },
        { state: 'STATE_5', at_ms: 400 },
    ], 'STATE_2', ['STATE_1', 'STATE_2', 'STATE_3']);

    fs.writeFileSync(path.join(OUT, 'probe.json'), JSON.stringify(results, null, 1), 'utf8');

    // ── checksums (host-side, independent of the renderer) ───────────────────
    const chk: any = {};
    {
        // Atwood: m1 = 3 (A), m2 = 5 (B)
        const m1 = 3, m2 = 5;
        const a = (m1 - m2) * G / (m1 + m2);
        chk.atwood = { a_expected: a, T_from_m2: m2 * (G + a), T_from_m1: m1 * (G - a) };
    }
    {
        const mi = 4, mh = 3, mu = 0.2;
        for (const th of [0, 25]) {
            const r = th * Math.PI / 180;
            const a = (mh * G - mi * G * Math.sin(r) - mu * mi * G * Math.cos(r)) / (mi + mh);
            const T = mh * (G - a);
            chk['incline_' + th] = { a_expected: a, T_expected_from_hang: T, N_expected: mi * G * Math.cos(r) };
        }
    }
    chk.mg = 4 * G;
    chk.comp30 = { sin: 4 * G * Math.sin(Math.PI / 6), cos: 4 * G * Math.cos(Math.PI / 6) };
    chk.recompose30 = Math.hypot(chk.comp30.sin, chk.comp30.cos);
    fs.writeFileSync(path.join(OUT, 'checksums.json'), JSON.stringify(chk, null, 1), 'utf8');

    console.log('WROTE', path.join(OUT, 'probe.json'));
    console.log('CHECKSUMS', JSON.stringify(chk, null, 1));
    console.log('FBD errors', results.fbd.errors.slice(0, 8));
    console.log('CONN errors', results.conn.errors.slice(0, 8));
    console.log('FBD tickErr', results.fbd.tickErr);
    console.log('CONN tickErr', results.conn.tickErr);
    console.log('FBD fold', JSON.stringify(results.fbd.fold, null, 1));
    console.log('CONN fold', JSON.stringify(results.conn.fold, null, 1));
    for (const run of ['fbd', 'conn']) {
        for (const k of Object.keys(results[run].snaps)) {
            const s = results[run].snaps[k];
            console.log(run, k, 'stable_px=' + s._frozen_stable_pixels,
                'stable_state=' + s._frozen_stable_state, 'simTime=' + s.simTimeMs);
        }
    }
})();
