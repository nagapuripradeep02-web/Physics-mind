/**
 * SCRATCH — mass-legibility proof (2026-07-30, bug_class
 * `nlb_hud_and_body_labels_never_show_mass_so_an_unequal_mass_state_is_unreadable`).
 * NOT product code. Not a concept. Writes NOTHING to the database.
 *
 * Same contract as _scratch_nlb_wall_spring_probe.ts: drives the REAL assembled
 * renderer (assembleField3DHtml -> scratch HTML -> Playwright chromium, real
 * Three.js, real animate() master clock) on a deterministic virtual clock, and
 * reads every string and every screen rect OUT of the live window.
 *
 *   STATE_U  two FREE carts, UNEQUAL (4 kg vs 12 kg), standing as close as the
 *            apparatus allows — the founder's case, and the worst case for
 *            label collision.
 *   STATE_W  a cart vs a `fixed` WALL authored at 1000000 kg.
 *   STATE_P  formatting: 0.5 kg, a float artifact (4.000000000001) and a live
 *            mass-slider write.
 *
 * Run:  npx tsx src/scripts/_scratch_nlb_mass_label_probe.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_nlb_mass');

type ArrowKind = 'weight' | 'normal' | 'friction' | 'applied' | 'tension' | 'net';
const SHOW: ArrowKind[] = ['weight', 'normal', 'applied', 'net'];

const CFG: Field3DConfig = {
    scenario_type: 'newtons_laws_body',
    explorer_id: 'newtons_laws_body_explorer',
    field_lines: { count: 0, color_positive: '#FF6B6B', color_negative: '#4ECDC4', opacity: 0, arrow_spacing: 0 },
    states: {
        STATE_U: {
            label: 'Unequal masses',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_surface'],
            caption: 'Same push, unequal mass',
            formula_overlay: 'a = F / m',
            newtons_laws_body: {
                mode: 'action_reaction_pair',
                surface: { theta_deg: 0, length_m: 10, frictionless: true },
                bodies: [
                    { id: 'A', label: 'm1', mass_kg: 4, initial_position_m: 0.62 },
                    { id: 'B', label: 'm₂', mass_kg: 12, initial_position_m: -0.62 },
                ],
                arrows: [
                    { body_id: 'A', show: SHOW },
                    { body_id: 'B', show: SHOW },
                ],
                readouts: ['F_applied', 'a'] as ('F_applied' | 'a')[],
                controls_visible: ['m', 'm2'] as ('m' | 'm2')[],
                push_off: { body_a_id: 'A', body_b_id: 'B', force_N: 30, contact_from_ms: 0, release_at_ms: 4000 },
            },
        },
        STATE_W: {
            label: 'Cart and wall',
            visible_elements: ['nlb_body_C', 'nlb_body_W', 'nlb_surface'],
            caption: 'Wall pushes back',
            formula_overlay: 'F₁₂ = −F₂₁',
            newtons_laws_body: {
                mode: 'action_reaction_pair',
                surface: { theta_deg: 0, length_m: 10, frictionless: true },
                bodies: [
                    { id: 'C', label: 'm₁', mass_kg: 4, initial_position_m: 0.7725 },
                    { id: 'W', label: 'Wall', mass_kg: 1000000, initial_position_m: -0.7725, fixed: true },
                ],
                arrows: [
                    { body_id: 'C', show: ['applied', 'net'] as ArrowKind[] },
                    { body_id: 'W', show: ['applied'] as ArrowKind[] },
                ],
                readouts: ['F_applied', 'a'] as ('F_applied' | 'a')[],
                controls_visible: ['m'] as ('m')[],
                push_off: { body_a_id: 'C', body_b_id: 'W', force_N: 30, contact_from_ms: 0, release_at_ms: 4000 },
            },
        },
        STATE_P: {
            label: 'Formatting',
            visible_elements: ['nlb_body_P', 'nlb_body_Q', 'nlb_surface'],
            caption: 'Mass formatting',
            newtons_laws_body: {
                mode: 'sandbox',
                surface: { theta_deg: 0, length_m: 10, frictionless: true },
                bodies: [
                    { id: 'P', label: 'm₁', mass_kg: 0.5, initial_position_m: 1.4 },
                    { id: 'Q', label: 'm₂', mass_kg: 4.000000000001, initial_position_m: -1.4 },
                ],
                arrows: [{ body_id: 'P', show: ['weight'] as ArrowKind[] }],
                readouts: ['a', 'v'] as ('a' | 'v')[],
                controls_visible: ['m', 'm2'] as ('m' | 'm2')[],
            },
        },
    },
};

// Virtual clock + a THREE.WebGLRenderer.render hook that captures (scene, camera)
// so the probe can project real screen rects. No renderer code is modified.
const INIT = `(function () {
  var vclock = 0, q = [];
  window.requestAnimationFrame = function (cb) { q.push(cb); return q.length; };
  window.cancelAnimationFrame = function () {};
  try { performance.now = function () { return vclock; }; } catch (e) {}
  // r128 WebGLRenderer assigns render() per INSTANCE, so a prototype hook never
  // fires. Intercept the CDN's global assignment instead and wrap Scene /
  // PerspectiveCamera so the probe gets the renderer's own first instance of each
  // (prototype chain preserved, so instanceof and every internal path are intact).
  var _T;
  Object.defineProperty(window, 'THREE', {
    configurable: true,
    get: function () { return _T; },
    set: function (v) {
      _T = v;
      // The UMD assigns an EMPTY object first and populates it in the same script, so
      // the wrap is deferred one microtask: that drains after three.min.js finishes and
      // before the next script tag (the renderer) runs.
      var wrap = function () {
        try {
          if (window.__NLB_WRAPPED || !v.Scene || !v.PerspectiveCamera) return;
          window.__NLB_WRAPPED = true;
          var S = v.Scene, C = v.PerspectiveCamera;
          // r128 ships Scene / PerspectiveCamera as ES CLASSES, so .apply() throws
          // ("cannot be invoked without new") — Reflect.construct with WS/WC as
          // newTarget builds the real instance with the real prototype.
          function WS() { var o = Reflect.construct(S, arguments, WS); if (!window.__NLB_SCENE) window.__NLB_SCENE = o; return o; }
          WS.prototype = S.prototype;
          function WC() { var o = Reflect.construct(C, arguments, WC); if (!window.__NLB_CAM) window.__NLB_CAM = o; return o; }
          WC.prototype = C.prototype;
          v.Scene = WS; v.PerspectiveCamera = WC;
        } catch (e) { window.__NLB_HOOK_ERR = String(e && e.message || e); }
      };
      wrap();
      Promise.resolve().then(wrap);
    }
  });
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

// Collect, for every VISIBLE nlb sprite, its text and its INK rect in screen px
// (a sprite is a camera-plane billboard, so its quad spans camera-right/up; the
// ink fraction is measured from the sprite's own retained canvas), plus every
// visible arrow shaft sampled as a screen polyline, plus the DOM overlay rects.
const READ = `(function () {
  var THREE = window.THREE, sc = window.__NLB_SCENE, cam = window.__NLB_CAM;
  if (!sc || !cam) return { err: 'no scene/camera captured' };
  var W = window.innerWidth, H = window.innerHeight;
  var right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0).normalize();
  var up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1).normalize();
  function toPx(v) {
    var p = v.clone().project(cam);
    return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H };
  }
  function visibleUp(o) { var p = o; while (p) { if (p.visible === false) return false; p = p.parent; } return true; }
  var labels = [], arrows = [];
  sc.traverse(function (o) {
    var ud = o.userData || {};
    var et = ud.elementType || '';
    if (et === 'nlb_body_label' || et === 'nlb_body_mass' || et === 'nlb_arrow_label' ||
        et === 'nlb_comp_label' || et === 'nlb_theta_label') {
      if (!visibleUp(o)) return;
      var txt = (et === 'nlb_body_mass') ? (o._nlbMassTxt || o._pmText || '') : (o._pmText || o._nlbText || '');
      var c = o._pmCanvas, frac = 1;
      if (c && o._pmCtx) {
        var ctx = o._pmCtx; ctx.font = o._pmFont || ctx.font;
        var probeTxt = txt;
        if (!probeTxt) { frac = 0; } else { frac = Math.min(1, ctx.measureText(probeTxt).width / c.width); }
      }
      var ctr = o.getWorldPosition(new THREE.Vector3());
      var hw = o.scale.x * frac / 2, hh = o.scale.y * 0.5;
      var pts = [];
      for (var sx = -1; sx <= 1; sx += 2) for (var sy = -1; sy <= 1; sy += 2) {
        pts.push(toPx(ctr.clone().addScaledVector(right, sx * hw).addScaledVector(up, sy * hh)));
      }
      var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
      labels.push({
        et: et, id: ud.id || '', bodyId: ud.bodyId || '', text: txt,
        inkFrac: frac, worldInkW: o.scale.x * frac,
        x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs),
        y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys)
      });
    }
    if (et === 'nlb_arrow') {
      if (!visibleUp(o)) return;
      var len = (o.cone && o.cone.position) ? o.cone.position.y : 0;
      if (!(len > 0)) return;
      var dir = new THREE.Vector3(0, 1, 0).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()));
      var o0 = o.getWorldPosition(new THREE.Vector3());
      var poly = [];
      for (var i = 0; i <= 24; i++) poly.push(toPx(o0.clone().addScaledVector(dir, len * i / 24)));
      arrows.push({ id: ud.id || '', poly: poly });
    }
  });
  function domRect(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    var st = window.getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return null;
    var r = el.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return null;
    return { id: id, x0: r.left, x1: r.right, y0: r.top, y1: r.bottom, text: el.innerText || '' };
  }
  var doms = [];
  ['nlb_readout', 'nlb_slowmo', 'nlb_formula', 'nlb_sliders'].forEach(function (id) {
    var r = domRect(id); if (r) doms.push(r);
  });
  var ro = document.getElementById('nlb_readout');
  var sl = document.getElementById('nlb_sliders');
  return {
    labels: labels, arrows: arrows, doms: doms, W: W, H: H,
    hudText: ro ? (ro.innerText || '') : '', hudHtml: ro ? ro.innerHTML : '',
    sliderText: sl ? (sl.innerText || '') : ''
  };
})()`;

interface Rect { x0: number; x1: number; y0: number; y1: number }
interface Lab extends Rect { et: string; id: string; bodyId: string; text: string; inkFrac: number; worldInkW: number }
interface Dom extends Rect { id: string; text: string }
interface Snap {
    err?: string;
    labels: Lab[]; arrows: { id: string; poly: { x: number; y: number }[] }[]; doms: Dom[];
    W: number; H: number; hudText: string; hudHtml: string; sliderText: string;
}

let failures = 0;
function check(label: string, ok: boolean, detail: string) {
    if (!ok) failures++;
    console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  — ' + detail : ''));
}
function inter(a: Rect, b: Rect, pad = 0): boolean {
    return a.x0 - pad < b.x1 && b.x0 - pad < a.x1 && a.y0 - pad < b.y1 && b.y0 - pad < a.y1;
}
function ptInRect(p: { x: number; y: number }, r: Rect, pad = 0): boolean {
    return p.x >= r.x0 - pad && p.x <= r.x1 + pad && p.y >= r.y0 - pad && p.y <= r.y1 + pad;
}

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const html = assembleField3DHtml(CFG);
    const file = path.join(OUT, 'mass.html');
    fs.writeFileSync(file, html, 'utf8');

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.addInitScript(INIT);
    await page.goto('file:///' + file.replace(/\\/g, '/'));
    await page.waitForFunction('typeof window.__NLB_TICK === "function"', null, { timeout: 20000, polling: 100 });
    await page.waitForFunction('typeof window.THREE !== "undefined"', null, { timeout: 30000, polling: 100 });
    const tick = (dtMs: number, n = 1) => page.evaluate(
        ([d, k]) => (window as unknown as { __NLB_TICK: (a: number, b: number) => number }).__NLB_TICK(d, k),
        [dtMs, n] as [number, number]);
    for (let i = 0; i < 40; i++) {
        await tick(16.7, 4);
        const ok = await page.evaluate(() => typeof (window as unknown as Record<string, unknown>).PM_nlbEngine !== 'undefined'
            && typeof (window as unknown as Record<string, unknown>).__NLB_SCENE !== 'undefined');
        if (ok) break;
        await page.waitForTimeout(100);
    }
    const setState = (s: string) => page.evaluate(st => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
    const pinAt = (ms: number) => page.evaluate(at => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: at }, '*'), ms);
    const unpin = () => page.evaluate(() => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: null }, '*'));
    const snap = async (): Promise<Snap> => await page.evaluate(READ) as unknown as Snap;

    async function enter(state: string, frames = 40): Promise<Snap> {
        await setState(state);
        await tick(16.7, frames);
        const s = await snap();
        if (s.err) throw new Error(s.err);
        return s;
    }

    // ═══ 1. UNEQUAL FREE MASSES — the founder's state ════════════════════
    console.log('\n=== 1. STATE_U — two free carts, 4 kg vs 12 kg, standing 1.24 m apart ===');
    const u = await enter('STATE_U');
    await page.screenshot({ path: path.join(OUT, 'state_u_unequal.png') });
    console.log('  HUD text:\n    ' + u.hudText.replace(/\n/g, '\n    '));
    console.log('  slider text:\n    ' + u.sliderText.replace(/\n/g, '\n    '));
    const massLabs = u.labels.filter(l => l.et === 'nlb_body_mass');
    check('every free body has an on-block mass label carrying its VALUE',
        massLabs.length === 2 && massLabs.some(l => l.text === '4 kg') && massLabs.some(l => l.text === '12 kg'),
        massLabs.map(l => l.bodyId + '="' + l.text + '"').join('  '));
    check('the HUD names each body WITH its mass (Unicode subscripts, no ASCII m1/m2)',
        /m₁ = 4 kg/.test(u.hudText) && /m₂ = 12 kg/.test(u.hudText)
        && !/m1|m2/.test(u.hudText) && !/m1|m2/.test(u.sliderText),
        'HUD = ' + JSON.stringify(u.hudText) + '  slider = ' + JSON.stringify(u.sliderText));
    check('the authored ASCII "m1" is RENDERED as m₁ on the sprite path too (Rule 34c)',
        u.labels.some(l => l.et === 'nlb_body_label' && l.bodyId === 'A' && l.text === 'm₁')
        && !u.labels.some(l => /m[0-9]/.test(l.text)),
        u.labels.filter(l => l.et === 'nlb_body_label').map(l => l.bodyId + '="' + l.text + '"').join('  '));
    check('mass never prints as a fixed-dp float ("4.0 kg" / "12.00 kg")',
        !/\d\.0+ kg/.test(u.hudText + ' ' + u.sliderText + ' ' + massLabs.map(l => l.text).join(' ')),
        'strings = ' + JSON.stringify(massLabs.map(l => l.text)) + ' + HUD + slider rows');

    // ── the Rule 34d collision proof, in real screen pixels ──────────────
    const others = u.labels.filter(l => l.et !== 'nlb_body_mass' && l.text);
    let worst = '', collide = 0;
    for (const m of massLabs) {
        for (const o of others) {
            if (inter(m, o)) { collide++; worst = m.bodyId + ' mass x ' + o.et + ' ' + o.id; }
        }
        for (const m2 of massLabs) {
            if (m2 !== m && inter(m, m2)) { collide++; worst = 'mass x mass ' + m.bodyId + '/' + m2.bodyId; }
        }
    }
    const gap = (massLabs.length === 2)
        ? Math.max(massLabs[0].x0, massLabs[1].x0) - Math.min(massLabs[0].x1, massLabs[1].x1) : 0;
    check('no mass label intersects ANY other on-canvas label (incl. the other cart)',
        collide === 0,
        collide + ' intersections' + (worst ? ' (worst: ' + worst + ')' : '')
        + '; the two mass rects are ' + gap.toFixed(1) + ' px apart'
        + '; ink widths = ' + massLabs.map(l => l.worldInkW.toFixed(3)).join('/') + ' world (cube = 0.55)');
    check('every mass label ink stays INSIDE its own cube silhouette (structural bound)',
        massLabs.every(l => l.worldInkW <= 0.55),
        massLabs.map(l => l.text + ' -> ' + l.worldInkW.toFixed(3) + ' world').join('  '));
    let arrowHit = 0, arrowWorst = '';
    for (const m of massLabs) {
        for (const a of u.arrows) {
            for (const p of a.poly) if (ptInRect(p, m)) { arrowHit++; arrowWorst = a.id; }
        }
    }
    check('no arrow shaft crosses a mass label ink rect',
        arrowHit === 0, arrowHit + ' shaft samples inside a mass rect' + (arrowWorst ? ' (' + arrowWorst + ')' : '')
        + '; ' + u.arrows.length + ' visible arrows sampled at 25 points each');
    let domHit = 0, domWorst = '';
    for (const m of massLabs) for (const d of u.doms) if (inter(m, d)) { domHit++; domWorst = d.id; }
    check('no mass label enters the HUD / badge / formula / slider DOM zones',
        domHit === 0,
        domHit + ' overlaps' + (domWorst ? ' (' + domWorst + ')' : '') + '; DOM zones present = '
        + u.doms.map(d => d.id).join(','));
    check('every mass label is fully inside the viewport',
        massLabs.every(l => l.x0 > 0 && l.x1 < u.W && l.y0 > 0 && l.y1 < u.H),
        massLabs.map(l => l.bodyId + ' [' + l.x0.toFixed(0) + ',' + l.x1.toFixed(0) + ']x['
            + l.y0.toFixed(0) + ',' + l.y1.toFixed(0) + ']').join('  ') + ' in ' + u.W + 'x' + u.H);

    // ═══ 2. THE FIXED WALL ══════════════════════════════════════════════
    console.log('\n=== 2. STATE_W — a cart vs a fixed wall authored at 1000000 kg ===');
    const w = await enter('STATE_W');
    await page.screenshot({ path: path.join(OUT, 'state_w_wall.png') });
    console.log('  HUD text:\n    ' + w.hudText.replace(/\n/g, '\n    '));
    check('the wall NEVER prints 1000000 (or any mass number) and reads as m ≫ the free bodies',
        !/1000000/.test(w.hudText) && !/1e\+?6/i.test(w.hudText) && /Wall — fixed, m ≫ m₁/.test(w.hudText),
        JSON.stringify(w.hudText));
    check('the cart still prints its own mass beside it',
        /m₁ = 4 kg/.test(w.hudText), JSON.stringify(w.hudText.split('\n')[0]));
    const wMass = w.labels.filter(l => l.et === 'nlb_body_mass');
    check('the wall carries NO on-block mass number; the cart does',
        wMass.length === 1 && wMass[0].bodyId === 'C' && wMass[0].text === '4 kg',
        wMass.map(l => l.bodyId + '="' + l.text + '"').join('  ') || '(none)');
    let wHit = 0;
    for (const m of wMass) {
        for (const o of w.labels) if (o !== m && o.text && inter(m, o)) wHit++;
        for (const d of w.doms) if (inter(m, d)) wHit++;
        for (const a of w.arrows) for (const p of a.poly) if (ptInRect(p, m)) wHit++;
    }
    check('the wall state is collision-free too', wHit === 0, wHit + ' intersections');

    // ═══ 3. FORMATTING + a live slider write ════════════════════════════
    console.log('\n=== 3. STATE_P — 0.5 kg, a float artifact, and a live mass write ===');
    const p0 = await enter('STATE_P');
    await page.screenshot({ path: path.join(OUT, 'state_p_formatting.png') });
    console.log('  HUD text:\n    ' + p0.hudText.replace(/\n/g, '\n    '));
    const pm = p0.labels.filter(l => l.et === 'nlb_body_mass');
    check('a non-integer mass prints at minimum readable precision ("0.5 kg")',
        /m₁ = 0.5 kg/.test(p0.hudText) && pm.some(l => l.text === '0.5 kg'),
        JSON.stringify(p0.hudText) + '  sprites = ' + JSON.stringify(pm.map(l => l.text)));
    check('a float artifact (4.000000000001) prints as "4 kg"',
        /m₂ = 4 kg/.test(p0.hudText) && pm.some(l => l.text === '4 kg')
        && !/4\.0000/.test(p0.hudText + JSON.stringify(pm.map(l => l.text))),
        JSON.stringify(p0.hudText));
    // live write through the real slider input path (the same handler a drag uses)
    await page.evaluate(() => {
        const el = document.getElementById('nlb_m_slider') as HTMLInputElement | null;
        if (el) { el.value = '7.5'; el.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    await tick(16.7, 5);
    const p1 = await snap();
    await page.screenshot({ path: path.join(OUT, 'state_p_slider_7p5.png') });
    const pm1 = p1.labels.filter(l => l.et === 'nlb_body_mass');
    check('a live mass write moves BOTH surfaces at once (HUD header + the block)',
        /m₁ = 7.5 kg/.test(p1.hudText) && pm1.some(l => l.text === '7.5 kg')
        && /7.5 kg/.test(p1.sliderText) && !/7\.50 kg/.test(p1.sliderText),
        'HUD = ' + JSON.stringify(p1.hudText.split('\n')[0]) + '  sprite = '
        + JSON.stringify(pm1.map(l => l.text)) + '  slider = ' + JSON.stringify(p1.sliderText.split('\n')[0]));

    // ═══ 4. FREEZE STABILITY (Rule 36 / THE EYE) ════════════════════════
    //   A mass label reads no clock, so the property under test is: while a pin is
    //   HELD, nothing about it moves a pixel; and returning to a pin renders the
    //   label identically. (Bit-equality of the WHOLE frame across a pin excursion is
    //   NOT a property of this scenario and never was: the nlb integrator carries
    //   s/v forward and only RESET_TRAJECTORY rewinds them, so a 3000 -> 9000 -> 3000
    //   excursion legitimately leaves the CARTS somewhere else. The probe measures
    //   that separately and reports it, so the two can never be confused.)
    console.log('\n=== 4. SET_TIME_FREEZE — a held pin is byte-static, the label is pin-invariant ===');
    const bodyS = () => page.evaluate(() => {
        const e = (window as unknown as Record<string, any>).PM_nlbEngine;
        return Object.keys(e.bodies).map(k => k + ':' + e.bodies[k].s.toFixed(6)).join(' ');
    });
    await setState('STATE_U');
    await tick(16.7, 20);
    // Pin-by-target (renderer contract, ~line 2590): time advances NORMALLY up to the
    // pin and then holds, so the clock must be ticked all the way TO 3000 ms before the
    // frame is stable — 220 frames at 16.7 ms.
    await pinAt(3000); await tick(16.7, 220);
    const a1 = await page.screenshot({ path: path.join(OUT, 'pin3000_first.png') });
    const s1 = await bodyS();
    const l1 = (await snap()).labels.filter(l => l.et === 'nlb_body_mass');
    await tick(16.7, 12);
    const a1b = await page.screenshot({ path: path.join(OUT, 'pin3000_first_held.png') });
    const s1b = await bodyS();
    const l1b = (await snap()).labels.filter(l => l.et === 'nlb_body_mass');
    check('a HELD pin holds the MASS LABELS byte-stable (text + ink + slot) over 12 frames',
        JSON.stringify(l1.map(l => [l.bodyId, l.text, l.worldInkW.toFixed(6)]))
        === JSON.stringify(l1b.map(l => [l.bodyId, l.text, l.worldInkW.toFixed(6)])),
        JSON.stringify(l1b.map(l => l.bodyId + '=' + l.text)));
    console.log('  note  whole frame over 12 HELD frames: ' + (Buffer.compare(a1, a1b) === 0 ? 'byte-identical' : 'differs')
        + '; cart s ' + (s1 === s1b ? 'held' : 'ADVANCED') + ' (' + s1 + ' -> ' + s1b + ')');
    check('any held-pin frame difference is the CARTS, never the label layer',
        Buffer.compare(a1, a1b) === 0 || s1 !== s1b,
        'frameSame=' + (Buffer.compare(a1, a1b) === 0) + ' cartsMoved=' + (s1 !== s1b));
    await pinAt(9000); await tick(16.7, 380);
    await page.screenshot({ path: path.join(OUT, 'pin9000.png') });
    await pinAt(3000); await tick(16.7, 30);
    const a2 = await page.screenshot({ path: path.join(OUT, 'pin3000_return.png') });
    const s2 = await bodyS();
    const l2 = (await snap()).labels.filter(l => l.et === 'nlb_body_mass');
    const same = (x: Lab[], y: Lab[]) => JSON.stringify(x.map(l => [l.bodyId, l.text, l.worldInkW.toFixed(6)]))
        === JSON.stringify(y.map(l => [l.bodyId, l.text, l.worldInkW.toFixed(6)]));
    check('the mass labels are PIN-INVARIANT (same text, same ink, same body slot)',
        same(l1, l2), JSON.stringify(l1.map(l => l.bodyId + '=' + l.text)) + ' vs '
        + JSON.stringify(l2.map(l => l.bodyId + '=' + l.text)));
    const framesDiffer = Buffer.compare(a1, a2) !== 0;
    console.log('  note  whole-frame equality across the 3000->9000->3000 excursion = '
        + (framesDiffer ? 'NO' : 'yes') + '; cart positions ' + (s1 === s2 ? 'IDENTICAL' : 'moved')
        + '\nfirst visit  ' + s1 + '\nreturn visit ' + s2
        + '\n(the accumulating integrator, pre-existing and unrelated to any label:'
        + ' only RESET_TRAJECTORY rewinds s/v.)');
    console.log('        (pin-by-target, renderer contract line ~2590: a pin only ever HOLDS the clock,'
        + ' it never rewinds it — a backwards excursion is not a renderer property and THE EYE'
        + ' never asks for one: it re-enters the state, which rebases the pin target.)');
    // THE EYE's actual determinism contract: re-enter the state, pin the same instant,
    // get the same frame.
    await unpin();
    await setState('STATE_W'); await tick(16.7, 30);
    await setState('STATE_U'); await tick(16.7, 4);
    await pinAt(3000); await tick(16.7, 220);
    const a3 = await page.screenshot({ path: path.join(OUT, 'pin3000_reentered.png') });
    check('a RE-ENTERED state pinned at the same instant is byte-identical (THE EYE contract)',
        Buffer.compare(a1, a3) === 0, 'bytes ' + a1.length + ' vs ' + a3.length
        + '; excursion note above: framesDiffer=' + framesDiffer + ' positions=' + (s1 === s2 ? 'same' : 'moved'));
    await unpin();

    check('no page errors anywhere in the run', errors.length === 0, errors.slice(0, 4).join(' | ') || 'clean');
    await browser.close();
    console.log('\nframes -> ' + OUT);
    console.log(failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED');
    process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
