/**
 * SCRATCH — label-ink legibility probe (bug_class
 * `nlb_friction_label_fk_text_colour_unaffected_by_arrow_fill_contrast_fix`).
 * NOT product code. Writes NOTHING to the database. Delete after the dispatch.
 *
 * Drives the REAL assembled renderer on the REAL concept config
 * (conservative_vs_nonconservative_forces) and reads, per ink element:
 *   - the hex the SEAM Q pass actually wrote (_nlbInkSrc for sprites,
 *     material.color for strokes),
 *   - the backdrop class the pass resolved for it,
 *   - the sprite's screen rect, so the pixels underneath can be measured.
 *
 * Run:  npx tsx src/scripts/_scratch_nlb_label_ink_probe.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_nlb_lbl');
const CONCEPT = process.argv[2] || 'conservative_vs_nonconservative_forces';
const STATES = (process.argv[3] || 'STATE_3').split(',');
const TIMES = (process.argv[4] || '3000').split(',').map(Number);

const INIT = `(function () {
  var vclock = 0, q = [];
  window.requestAnimationFrame = function (cb) { q.push(cb); return q.length; };
  window.cancelAnimationFrame = function () {};
  try { performance.now = function () { return vclock; }; } catch (e) {}
  var _T;
  Object.defineProperty(window, 'THREE', {
    configurable: true,
    get: function () { return _T; },
    set: function (v) {
      _T = v;
      var wrap = function () {
        try {
          if (window.__NLB_WRAPPED || !v.Scene || !v.PerspectiveCamera) return;
          window.__NLB_WRAPPED = true;
          var S = v.Scene, C = v.PerspectiveCamera;
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

const READ = `(function () {
  var THREE = window.THREE, sc = window.__NLB_SCENE, cam = window.__NLB_CAM;
  if (!sc || !cam) return { err: 'no scene/camera captured' };
  var W = window.innerWidth, H = window.innerHeight;
  var right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0).normalize();
  var up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1).normalize();
  function toPx(v) { var p = v.clone().project(cam); return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H }; }
  function visibleUp(o) { var p = o; while (p) { if (p.visible === false) return false; p = p.parent; } return true; }
  function hex(c) { return '#' + ('000000' + c.getHexString()).slice(-6); }
  var out = [];
  var slab = null, bodies = {};
  sc.traverse(function (o) {
    var ud = o.userData || {};
    if (ud.id === 'nlb_surface') slab = o;
    if (ud.elementType === 'nlb_body' && ud.id) bodies[ud.id] = o;
  });
  var RAY = new THREE.Raycaster();
  // Replica of nlbInkSampleClass, run from OUTSIDE the renderer so the class it
  // resolves can be reported without touching engine code.
  function classify(p, own) {
    var d = p.clone().sub(cam.position); var L = d.length();
    RAY.set(cam.position, d.multiplyScalar(1 / L));
    var r = { L: +L.toFixed(3), ownHit: null, slabHit: null, cls: 'PAGE', slabIsMesh: !!(slab && slab.isMesh) };
    if (own && own.visible) { var hb = RAY.intersectObject(own, false); if (hb && hb.length) r.ownHit = +hb[0].distance.toFixed(3); }
    if (r.ownHit != null && r.ownHit < L - 1e-3) { r.cls = 'OCCLUDED_BY_OWN_BODY->PAGE'; return r; }
    if (slab && slab.visible) {
      var hs = RAY.intersectObject(slab, false);
      if (hs && hs.length) {
        r.slabHit = +hs[0].distance.toFixed(3);
        r.cls = (hs[0].distance >= L - 1e-3) ? 'SLAB' : 'OCCLUDED_BY_SLAB->PAGE';
        return r;
      }
      r.cls = 'RAY_MISSES_SLAB->PAGE';
    }
    return r;
  }
  sc.traverse(function (o) {
    var ud = o.userData || {};
    var et = ud.elementType || '';
    if (!/^nlb_(arrow|comp|disp|fang|theta_arc|right_angle)(_label)?$|_label$/.test(et)) return;
    if (!visibleUp(o)) return;
    var rec = { et: et, id: ud.id || '', kind: ud.kind || '', text: o._pmText || o._nlbText || '' };
    rec.inkSrc = o._nlbInkSrc || null;
    var cols = [], ops = [], cases = [];
    o.traverse(function (n) {
      if (!n.material) return;
      var ms = Array.isArray(n.material) ? n.material : [n.material];
      for (var i = 0; i < ms.length; i++) {
        var isCase = !!(ms[i].userData && ms[i].userData._nlbCase);
        (isCase ? cases : cols).push(hex(ms[i].color) + '@' + (ms[i].opacity != null ? ms[i].opacity.toFixed(2) : '-') + (n.visible ? '' : '(hidden)'));
      }
    });
    rec.colors = cols.join(' '); rec.caseColors = cases.join(' ');
    var c = o._pmCanvas, frac = 1;
    if (c && o._pmCtx && rec.text) { var ctx = o._pmCtx; ctx.font = o._pmFont || ctx.font; frac = Math.min(1, ctx.measureText(rec.text).width / c.width); }
    rec.diag = classify(o.getWorldPosition(new THREE.Vector3()), ud.bodyId ? bodies['nlb_body_' + ud.bodyId] : null);
    if (o.isSprite) {
      var ctr = o.getWorldPosition(new THREE.Vector3());
      var hw = o.scale.x * frac / 2, hh = o.scale.y * 0.5, pts = [];
      for (var sx = -1; sx <= 1; sx += 2) for (var sy = -1; sy <= 1; sy += 2) {
        pts.push(toPx(ctr.clone().addScaledVector(right, sx * hw).addScaledVector(up, sy * hh)));
      }
      var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
      rec.rect = [Math.round(Math.min.apply(null, xs)), Math.round(Math.min.apply(null, ys)),
                  Math.round(Math.max.apply(null, xs)), Math.round(Math.max.apply(null, ys))];
    }
    out.push(rec);
  });
  return { items: out, W: W, H: H, cls: window.__NLB_CLS_LOG || null };
})()`;

interface Rec { et: string; id: string; kind: string; text: string; inkSrc: string | null; colors: string; caseColors: string; rect?: number[]; diag?: { L: number; ownHit: number | null; slabHit: number | null; cls: string; slabIsMesh: boolean } }

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const json = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/concepts/' + CONCEPT + '.json'), 'utf8'));
    const cfg = json.field_3d_config as Field3DConfig;
    const html = assembleField3DHtml(cfg);
    const file = path.join(OUT, CONCEPT + '.html');
    fs.writeFileSync(file, html, 'utf8');

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.addInitScript(INIT);
    await page.goto('file:///' + file.replace(/\\/g, '/'));
    await page.waitForFunction('typeof window.__NLB_TICK === "function"', null, { timeout: 20000, polling: 100 });
    await page.waitForFunction('typeof window.THREE !== "undefined"', null, { timeout: 30000, polling: 100 });
    const tick = (dtMs: number, n = 1) => page.evaluate(
        ([d, k]) => (window as unknown as { __NLB_TICK: (a: number, b: number) => number }).__NLB_TICK(d, k), [dtMs, n] as [number, number]);
    for (let i = 0; i < 40; i++) {
        await tick(16.7, 4);
        const ok = await page.evaluate(() => typeof (window as unknown as Record<string, unknown>).__NLB_SCENE !== 'undefined');
        if (ok) break;
        await page.waitForTimeout(100);
    }
    for (const st of STATES) {
        await page.evaluate(s => window.postMessage({ type: 'SET_STATE', state: s }, '*'), st);
        await tick(16.7, 8);
        for (const t of TIMES) {
            await page.evaluate(at => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: at }, '*'), t);
            await tick(16.7, 30);
            const snap = await page.evaluate(READ) as unknown as { err?: string; items: Rec[] };
            if (snap.err) { console.log('ERR ' + snap.err); continue; }
            console.log('\n=== ' + CONCEPT + ' ' + st + ' @ ' + t + ' ms ===');
            for (const r of snap.items) {
                console.log('  ' + r.et.padEnd(18) + (r.kind || '-').padEnd(11) +
                    ' text=' + JSON.stringify(r.text).padEnd(10) +
                    ' inkSrc=' + String(r.inkSrc).padEnd(9) +
                    ' col=' + r.colors.padEnd(30) +
                    (r.caseColors ? ' case=' + r.caseColors : '') +
                    (r.rect ? ' rect=' + r.rect.join(',') : '') +
                    (r.diag ? '\n        diag: ' + r.diag.cls + ' L=' + r.diag.L + ' ownHit=' + r.diag.ownHit + ' slabHit=' + r.diag.slabHit + ' slabIsMesh=' + r.diag.slabIsMesh : ''));
            }
            const tag = CONCEPT + '_' + st + '_' + t;
            await page.screenshot({ path: path.join(OUT, tag + '.png') });
            fs.writeFileSync(path.join(OUT, tag + '.json'), JSON.stringify(snap.items, null, 1), 'utf8');
        }
        await page.evaluate(() => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: null }, '*'));
    }
    console.log('\nerrors: ' + (errors.slice(0, 4).join(' | ') || 'clean'));
    await browser.close();
    console.log('out -> ' + OUT);
}
main().catch(e => { console.error(e); process.exit(1); });
