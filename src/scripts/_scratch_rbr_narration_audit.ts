/**
 * SCRATCH — narration audit for Desk A (2026-08-06). Reads only; writes nothing.
 *
 * Desk B's N2 was the run's most dangerous defect: narration quoted arrow
 * WORLD-UNIT lengths as speeds on the PRIMARY aha state ("0.55 m/s" where the
 * canvas read 0.60), and the wrong number had propagated into
 * aha_moment.visual_confirmation and misconception_watch[].visual_counter. Its
 * sibling concept (B-15) rendered the design table as narration on 7 of 8
 * states — ms timings, engine verbs and world units read aloud.
 *
 * This concept was unaudited. The rule being tested: EVERY number a sentence
 * asserts must be readable on the canvas at the instant that sentence plays,
 * in the units spoken, on a live instrument (Rule 33d).
 *
 * Method: for each state, pin the clock and dump EVERY on-canvas string — the
 * HUD rows, the formula surface, the caption, the slider rows, and the 3D
 * sprite labels (which carry their text on `_pmText`, and are the text path a
 * DOM-only sweep silently skips — Rule 34c). Then diff the numbers a sentence
 * claims against the numbers actually on screen.
 *
 * Run: npx tsx src/scripts/_scratch_rbr_narration_audit.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_rbr_narr');
const CONCEPT = path.join(process.cwd(), 'src', 'data', 'concepts', 'conservation_of_angular_momentum.json');

const INIT = `(function () {
  var vclock = 0, q = [];
  window.requestAnimationFrame = function (cb) { q.push(cb); return q.length; };
  window.cancelAnimationFrame = function () {};
  try { performance.now = function () { return vclock; }; } catch (e) {}
  window.__TICK = function (dtMs, n) {
    for (var i = 0; i < (n || 1); i++) {
      vclock += dtMs;
      var due = q; q = [];
      for (var j = 0; j < due.length; j++) { try { due[j](vclock); } catch (e) {} }
    }
    return vclock;
  };
})()`;

// Every on-canvas text surface, DOM and 3D-sprite alike.
const READ = `(function () {
  function txt(id){ var e=document.getElementById(id); return e && e.style.display!=='none' ? (e.innerText||'').replace(/\\n/g,' | ') : ''; }
  var sprites = [];
  try {
    var scene = window.__PM_SCENE || null;
    if (!scene && window.PM_rbrIndex) scene = null;
    // Sprite labels carry their rendered string on _pmText (see createLabelSprite).
    var seen = {};
    var walk = function (o) {
      if (!o) return;
      if (o.userData && o.userData.elementType && o._pmText != null && o.visible !== false) {
        var k = o.userData.id + '=' + o._pmText;
        if (!seen[k]) { seen[k] = 1; sprites.push(o.userData.id + ': "' + o._pmText + '"'); }
      }
      if (o.children) for (var i=0;i<o.children.length;i++) walk(o.children[i]);
    };
    if (scene) walk(scene);
  } catch (e) { sprites.push('ERR ' + e.message); }
  return {
    hud: txt('rbr_readout'),
    formula: txt('rbr_formula'),
    kebar: txt('rbr_kebar'),
    sliders: txt('rbr_sliders'),
    caption: txt('caption'),
    repin: txt('rbr_repin'),
    sprites: sprites.join(' · '),
  };
})()`;

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const json = JSON.parse(fs.readFileSync(CONCEPT, 'utf-8')) as {
        field_3d_config?: Field3DConfig;
        epic_l_path?: { states: Record<string, { teacher_script?: { tts_sentences?: Array<{ id: string; text_en: string }> } }> };
    };
    if (!json.field_3d_config) throw new Error('no field_3d_config');

    const html = assembleField3DHtml(json.field_3d_config);
    const file = path.join(OUT, 'rbr.html');
    fs.writeFileSync(file, html, 'utf8');

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.addInitScript(INIT);
    await page.goto('file:///' + file.replace(/\\/g, '/'));
    await page.waitForFunction('typeof window.__TICK === "function"', null, { timeout: 20000, polling: 100 });
    const tick = (dt: number, n = 1) => page.evaluate(
        ([d, k]) => (window as unknown as { __TICK: (a: number, b: number) => number }).__TICK(d, k),
        [dt, n] as [number, number]);
    for (let i = 0; i < 60; i++) {
        await tick(16.7, 4);
        if (await page.evaluate(() => typeof (window as unknown as Record<string, unknown>).PM_rbrEngine !== 'undefined')) break;
        await page.waitForTimeout(100);
    }

    const setState = (s: string) => page.evaluate(st => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
    const pinAt = (ms: number) => page.evaluate(at => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: at }, '*'), ms);

    const states = Object.keys(json.field_3d_config.states as unknown as Record<string, unknown>);
    const SAMPLES = [500, 2000, 4000, 6000, 9000];

    for (const s of states) {
        const sent = json.epic_l_path?.states?.[s]?.teacher_script?.tts_sentences || [];
        console.log('\n' + '='.repeat(78));
        console.log(s);
        for (const t of sent) {
            const nums = (t.text_en.match(/\d+\.?\d*/g) || []);
            const spoken = t.text_en.match(/\b(zero|one|two|three|four|five|six|seven|eight|nine)\b[\w\s.]*?(?=[,.;:]|$)/gi);
            console.log('  NARR %-6s %s', t.id, JSON.stringify(t.text_en));
            if (nums.length) console.log('        digits: %s', nums.join(', '));
            if (spoken) console.log('        spoken-number phrases: %s', spoken.map(x => x.trim()).join(' | '));
        }
        for (const t of SAMPLES) {
            await setState(s);
            await tick(16.7, 10);
            await pinAt(t);
            await tick(16.7, Math.ceil(t / 16.7) + 30);
            const r = await page.evaluate(READ) as Record<string, string>;
            const bits = [];
            if (r.hud) bits.push('HUD[' + r.hud + ']');
            if (r.formula) bits.push('FORMULA[' + r.formula.replace(/\n/g, ' / ') + ']');
            if (r.kebar) bits.push('KEBAR[' + r.kebar + ']');
            if (r.sliders) bits.push('SLIDERS[' + r.sliders + ']');
            if (r.repin) bits.push('REPIN[' + r.repin + ']');
            if (r.sprites) bits.push('SPRITES[' + r.sprites + ']');
            console.log('   t=%-5d %s', t, bits.join('  '));
        }
    }
    console.log('\nconsole errors: ' + (errors.length ? errors.slice(0, 5).join(' | ') : 'none'));
    await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
