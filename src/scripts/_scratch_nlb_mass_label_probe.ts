/**
 * SCRATCH — MASS LEGIBILITY proof (2026-07-31, bug_class
 * `nlb_hud_and_body_labels_never_show_mass_so_an_unequal_mass_state_is_unreadable`).
 * NOT product code. Not a concept. Writes NOTHING to the database.
 *
 * Same contract as the sibling nlb probes: drives the REAL assembled renderer
 * (assembleField3DHtml -> scratch HTML -> Playwright chromium, real Three.js,
 * real animate() master clock) on a deterministic virtual clock and reads the
 * rendered strings + measured rects OUT of the live page.
 *
 * Sprite text is INK — invisible to any DOM probe — and scene/camera live inside
 * the renderer's own scope, so the sprite layer is read by INTERCEPTING the draw:
 * a fillText wrapper logs every string with the canvas it landed on and the width
 * the engine itself measured for it. "What does the block say, and how wide is
 * that ink" are therefore MEASURED, never re-derived. The DOM half (HUD text,
 * slider rows, panel rects) is read directly.
 *
 *   STATE_U  unequal free pair, ASCII-authored labels "m1"/"m2", 4 vs 12 kg
 *   STATE_W  cart vs a `fixed` wall authored at 1000000 kg
 *   STATE_G  a GHOST alongside a real body
 *
 * Run: npx tsx src/scripts/_scratch_nlb_mass_label_probe.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_nlb_mass');

const CFG: Field3DConfig = {
    scenario_type: 'newtons_laws_body',
    explorer_id: 'newtons_laws_body_explorer',
    field_lines: { count: 0, color_positive: '#FF6B6B', color_negative: '#4ECDC4', opacity: 0, arrow_spacing: 0 },
    states: {
        STATE_U: {
            label: 'Unequal masses',
            visible_elements: ['nlb_body_A', 'nlb_body_B', 'nlb_surface'],
            caption: 'Same push, unequal carts',
            newtons_laws_body: {
                mode: 'action_reaction_pair',
                surface: { theta_deg: 0, length_m: 10, frictionless: true },
                // ASCII labels on PURPOSE: Rule 34c says m1 must RENDER as m-subscript-1.
                bodies: [
                    { id: 'A', label: 'm1', mass_kg: 4, initial_position_m: 0.91 },
                    { id: 'B', label: 'm2', mass_kg: 12, initial_position_m: -0.91 },
                ],
                arrows: [
                    { body_id: 'A', show: ['applied'] as ('applied')[] },
                    { body_id: 'B', show: ['applied'] as ('applied')[] },
                ],
                readouts: ['F_applied', 'a', 'v'] as ('F_applied' | 'a' | 'v')[],
                controls_visible: ['m', 'm2'] as ('m' | 'm2')[],
            },
        },
        STATE_W: {
            label: 'Cart against a wall',
            visible_elements: ['nlb_body_C', 'nlb_body_W', 'nlb_surface'],
            caption: 'The wall pushes back',
            newtons_laws_body: {
                mode: 'action_reaction_pair',
                surface: { theta_deg: 0, length_m: 10, frictionless: true },
                bodies: [
                    { id: 'C', label: 'm1', mass_kg: 4, initial_position_m: 0.77 },
                    { id: 'W', label: 'Wall', mass_kg: 1000000, initial_position_m: -0.77, fixed: true },
                ],
                arrows: [{ body_id: 'C', show: ['applied'] as ('applied')[] }],
                readouts: ['F_applied', 'a'] as ('F_applied' | 'a')[],
                controls_visible: ['m'] as ('m')[],
            },
        },
        STATE_G: {
            label: 'Ghost context',
            visible_elements: ['nlb_body_A', 'nlb_body_G', 'nlb_surface'],
            caption: 'Where it started',
            newtons_laws_body: {
                mode: 'accelerate_applied_force',
                surface: { theta_deg: 0, length_m: 10, frictionless: true },
                bodies: [
                    { id: 'A', label: 'm1', mass_kg: 4, initial_position_m: 0.5 },
                    { id: 'G', mass_kg: 4, initial_position_m: -1.6, ghost: true },
                ],
                readouts: ['a', 'v'] as ('a' | 'v')[],
                controls_visible: [] as ('m')[],
            },
        },
    },
};

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
  // Sprite text is INK, not DOM — and scene/camera live inside the renderer's own
  // scope, unreachable from here. So the sprite layer is read the only honest way:
  // by INTERCEPTING the draw. Every fillText the page ever performs is recorded
  // with the canvas it landed on and the width the engine itself measured for it,
  // so "what does the block say, and how wide is that ink" are both MEASURED
  // quantities rather than re-derived ones. Wrapping the prototype changes no
  // renderer code and no pixels (the original call still runs).
  window.__NLB_INK = [];              // append-only draw log
  var _ft = CanvasRenderingContext2D.prototype.fillText;
  var _cid = 0;
  CanvasRenderingContext2D.prototype.fillText = function (t, x, y) {
    try {
      var cv = this.canvas;
      if (cv && !cv.__nlbId) cv.__nlbId = 'cv' + (++_cid);
      window.__NLB_INK.push({
        cv: cv ? cv.__nlbId : '?', text: String(t),
        w: this.measureText(String(t)).width, cw: cv ? cv.width : 0,
        onScreen: !!(cv && cv.parentNode)     // a sprite canvas is never in the DOM
      });
    } catch (e) {}
    return _ft.apply(this, arguments);
  };
  // The LAST string drawn on each sprite canvas = what that sprite currently says.
  window.__NLB_SPRITES = function () {
    var last = {}, out = [];
    var ink = window.__NLB_INK;
    for (var i = 0; i < ink.length; i++) { if (!ink[i].onScreen) last[ink[i].cv] = ink[i]; }
    for (var k in last) if (last.hasOwnProperty(k)) out.push(last[k]);
    return out;
  };
  window.__NLB_SURF = function () {
    function rect(id) {
      var el = document.getElementById(id);
      if (!el || el.style.display === 'none') return null;
      var r = el.getBoundingClientRect();
      if (!(r.width > 0 && r.height > 0)) return null;
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    }
    var ro = document.getElementById('nlb_readout');
    return {
      sprites: window.__NLB_SPRITES(),
      hudText: ro ? ro.innerText : '',
      hudFont: ro ? ro.style.font : '',
      hudDisplay: ro ? ro.style.display : '',
      rects: { readout: rect('nlb_readout'), sliders: rect('nlb_sliders'), formula: rect('nlb_formula') },
      sliderVals: {
        m: (document.getElementById('nlb_m_val') || {}).textContent || null,
        m2: (document.getElementById('nlb_m2_val') || {}).textContent || null
      },
      sliderLbls: {
        m: (document.getElementById('nlb_m_lbl') || {}).textContent || null,
        m2: (document.getElementById('nlb_m2_lbl') || {}).textContent || null
      }
    };
  };
})()`;

interface Ink { cv: string; text: string; w: number; cw: number; onScreen: boolean }
interface Rect { left: number; right: number; top: number; bottom: number }
interface Surf {
    sprites: Ink[]; hudText: string; hudFont: string; hudDisplay: string;
    rects: { readout: Rect | null; sliders: Rect | null; formula: Rect | null };
    sliderVals: { m: string | null; m2: string | null };
    sliderLbls: { m: string | null; m2: string | null };
}

let failures = 0;
function check(label: string, ok: boolean, detail: string) {
    if (!ok) failures++;
    console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  — ' + detail : ''));
}
/** The sprite whose ink currently reads <text>, if any. */
function ink(s: Surf, text: string): Ink | undefined { return s.sprites.filter(k => k.text === text)[0]; }
/** Every distinct string currently painted on a sprite canvas. */
function inkSet(s: Surf): string[] { return s.sprites.map(k => k.text).sort(); }
/** canvas id -> the string currently on it, so ONE sprite can be tracked over time. */
function byCv(s: Surf): Record<string, string> {
    const o: Record<string, string> = {};
    for (const k of s.sprites) o[k.cv] = k.text;
    return o;
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
    const surf = (): Promise<Surf> => page.evaluate(
        () => (window as unknown as { __NLB_SURF: () => Surf }).__NLB_SURF());

    // ═══ 1. THE FINDING: 4 kg and 12 kg read DIFFERENTLY on screen ══════
    console.log('\n=== 1. unequal free pair (4 kg vs 12 kg), ASCII-authored m1/m2 ===');
    await setState('STATE_U');
    await tick(16.7, 12);
    const u = await surf();
    const uA = ink(u, 'm₁ = 4 kg'), uB = ink(u, 'm₂ = 12 kg');
    check('the billboard above the 4 kg cart states its mass',
        !!uA, 'sprite ink = ' + JSON.stringify(inkSet(u)));
    check('the billboard above the 12 kg cart states a DIFFERENT mass',
        !!uB, 'sprite ink = ' + JSON.stringify(inkSet(u)));
    check('...and the two strings measure different INK (not just different data)',
        !!uA && !!uB && uB.w - uA.w > 8,
        'measured ink ' + (uA ? uA.w.toFixed(1) : '?') + ' px vs ' + (uB ? uB.w.toFixed(1) : '?') +
        ' px on canvases ' + (uA ? uA.cw : '?') + '/' + (uB ? uB.cw : '?') + ' px wide');
    check('Rule 34c: the ASCII-authored "m1"/"m2" RENDER as Unicode subscripts on the SPRITE path',
        inkSet(u).some(t => /m₁/.test(t)) && inkSet(u).some(t => /m₂/.test(t)) &&
        !inkSet(u).some(t => /m1|m2/.test(t)),
        'U+2081 / U+2082 present, no ASCII digit anywhere in the sprite ink');
    check('the HUD states BOTH masses, one header per body',
        /m₁ = 4 kg/.test(u.hudText) && /m₂ = 12 kg/.test(u.hudText),
        JSON.stringify(u.hudText.replace(/\n/g, ' | ')));
    check('Rule 34c on the DOM slider-row path too',
        u.sliderLbls.m === 'm₁' && u.sliderLbls.m2 === 'm₂',
        JSON.stringify(u.sliderLbls));
    check('one mass FORMAT everywhere: the slider row reads bare, like the HUD and the block',
        u.sliderVals.m === '4' && u.sliderVals.m2 === '12',
        'row m=' + u.sliderVals.m + ' m2=' + u.sliderVals.m2);

    // ═══ 2. Rule 34d — nothing collides ════════════════════════════════
    console.log('\n=== 2. Rule 34d — HUD above the sliders, labels clear of every panel ===');
    check('the HUD clears the review chrome (top:52px+)',
        !!u.rects.readout && u.rects.readout.top >= 52,
        'HUD top = ' + (u.rects.readout ? u.rects.readout.top.toFixed(0) : 'n/a') + 'px');
    check('the HUD bottom sits ABOVE the slider panel top',
        !!u.rects.readout && !!u.rects.sliders && u.rects.readout.bottom <= u.rects.sliders.top,
        'HUD bottom ' + (u.rects.readout ? u.rects.readout.bottom.toFixed(0) : '?') +
        ' vs sliders top ' + (u.rects.sliders ? u.rects.sliders.top.toFixed(0) : '?'));
    check('the HUD settled at the AUTHORED look (it fits — no reflow, so no baseline moves)',
        u.hudFont.replace(/\s+/g, '') === '13px/1.7monospace' && u.hudDisplay === 'block',
        'font ' + JSON.stringify(u.hudFont) + ' display ' + JSON.stringify(u.hudDisplay));
    check('every sprite canvas grew to fit its own string (no clipped mass label)',
        u.sprites.every(k => k.w <= k.cw), u.sprites.map(k => k.w.toFixed(0) + '/' + k.cw).join(' '));

    // ═══ 3. the WALL — never a number ══════════════════════════════════
    console.log('\n=== 3. a `fixed` body authored at 1000000 kg ===');
    await setState('STATE_W');
    await tick(16.7, 12);
    const w = await surf();
    check('the wall billboard NEVER prints its stand-in-for-infinity mass',
        !inkSet(w).some(t => /1000000|1e\+?6/.test(t)) && !/1000000/.test(w.hudText),
        'sprite ink = ' + JSON.stringify(inkSet(w)));
    check('...it states the ORDER relation against the free bodies instead',
        !!ink(w, 'Wall — m ≫ m₁'), 'sprite ink = ' + JSON.stringify(inkSet(w)));
    check('the HUD says the same thing, and flags it as fixed',
        /Wall — fixed, m ≫ m₁/.test(w.hudText),
        JSON.stringify(w.hudText.replace(/\n/g, ' | ')));
    check('the free cart beside it still states a real number',
        !!ink(w, 'm₁ = 4 kg'), 'sprite ink = ' + JSON.stringify(inkSet(w)));

    // ═══ 4. a GHOST carries no number ══════════════════════════════════
    console.log('\n=== 4. a ghost is decorative context, never a second mass ===');
    await setState('STATE_G');
    await tick(16.7, 12);
    const g = await surf();
    check('the ghost billboard is exactly its id — no mass, identical pixels to before',
        !!ink(g, 'G') && !inkSet(g).some(t => /^G .*kg/.test(t)),
        'sprite ink = ' + JSON.stringify(inkSet(g)));
    check('the real body beside it still carries its mass',
        !!ink(g, 'm₁ = 4 kg'), 'sprite ink = ' + JSON.stringify(inkSet(g)));
    check('the ghost prints no HUD group either',
        !/\bG\b/.test(g.hudText), JSON.stringify(g.hudText.replace(/\n/g, ' | ')));

    // ═══ 5. an OFF-GRID slider write rounds to 1 dp ════════════════════
    console.log('\n=== 5. THE EYE / a real drag writes interpolated values ===');
    await setState('STATE_U');
    await tick(16.7, 8);
    const pre = await surf();
    await page.evaluate(() => {
        const el = document.getElementById('nlb_m_slider') as HTMLInputElement | null;
        if (!el) return;
        el.value = '8.4642';
        el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await tick(16.7, 6);
    const d = await surf();
    check('an 8.4642 kg drag reaches the block as 1 dp, never verbatim',
        !!ink(d, 'm₁ = 8.5 kg') && !inkSet(d).some(t => /8\.46/.test(t)),
        'sprite ink = ' + JSON.stringify(inkSet(d)));
    check('...and the HUD and the slider row agree, to the same digit',
        /m₁ = 8\.5 kg/.test(d.hudText) && d.sliderVals.m === '8.5' && !/8\.46/.test(d.hudText),
        'HUD ok, row = ' + d.sliderVals.m);
    // Tracked per CANVAS, so "which sprite changed" is a measured fact rather than a
    // set difference (several bodies across the three states share a label string).
    const before = byCv(pre), after = byCv(d);
    const moved = Object.keys(after).filter(k => before[k] !== after[k]);
    check('the live drag moved EXACTLY the dragged body (the label is not a build-time snapshot)',
        moved.length === 1 && before[moved[0]] === 'm₁ = 4 kg' && after[moved[0]] === 'm₁ = 8.5 kg',
        moved.length + ' sprite(s) changed: ' +
        moved.map(k => JSON.stringify(before[k]) + ' -> ' + JSON.stringify(after[k])).join(', '));

    // ═══ 6. Rule 36 — a frozen pin is byte-stable ══════════════════════
    console.log('\n=== 6. SET_TIME_FREEZE — the mass layer cannot move a frozen pixel ===');
    for (const [state, pin] of [['STATE_U', 1500], ['STATE_W', 2800]] as [string, number][]) {
        await setState(state);
        await tick(16.7, 4);
        await pinAt(pin);
        for (let i = 0; i < 90; i++) await tick(16.7, 4);
        const shot0 = await page.screenshot();
        const s0 = await surf();
        for (let i = 0; i < 20; i++) await tick(16.7, 1);
        const shot1 = await page.screenshot();
        const s1 = await surf();
        fs.writeFileSync(path.join(OUT, 'pin_' + state + '_' + pin + '.png'), shot1);
        check('[' + state + ' @' + pin + 'ms] 20 extra held frames are byte-identical',
            Buffer.compare(shot0, shot1) === 0, shot1.length + ' bytes');
        check('[' + state + ' @' + pin + 'ms] every billboard string is unchanged across the hold',
            JSON.stringify(inkSet(s0)) === JSON.stringify(inkSet(s1)),
            JSON.stringify(inkSet(s1)));
    }

    console.log('\npage errors: ' + (errors.length ? '\n  ' + errors.join('\n  ') : 'none'));
    await browser.close();
    console.log(failures ? '\n' + failures + ' CHECK(S) FAILED' : '\nALL CHECKS PASSED');
    process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
