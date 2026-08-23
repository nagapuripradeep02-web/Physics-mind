/**
 * SCRATCH — A-26 evidence for Desk A (2026-08-06). Reads only; writes nothing.
 *
 * A-23 was withdrawn because eye-walker read motion off 1 Hz dense frames on a
 * rotor with a 4.19 s period — 86 deg per frame on a 2-fold-symmetric rod, which
 * aliases a steady spin into stillness. A-26 is the narrow remainder, and it
 * must not repeat that mistake: it is measured HERE from the engine's own theta,
 * on a 100 ms grid (42 samples per revolution), never from a rendering.
 *
 * The claim under test: across STATE_6's authored restart the apparatus keeps
 * turning in the OLD direction through the 500 ms "restarting" blank, then
 * instantaneously reverses — so the restart is asserted by chrome (a badge and
 * em-dashed digits) and contradicted by the only thing a student watches.
 *
 * Source basis (read, not inferred): rbrThetaAt = g.th + g.omega*g.rem off
 * rbrGridWalk, a continuous integration; rbrThetaReset (which seeds _th =
 * theta0) is called at STATE APPLY, never at a restart cut; rbrSignAt flips on
 * rbrRestartCount parity, and rbrEffTime(k) = rbrCutTime(k) + blankMs.
 *
 * Run: npx tsx src/scripts/_scratch_rbr_theta_probe.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_rbr_theta');
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

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const json = JSON.parse(fs.readFileSync(CONCEPT, 'utf-8')) as { field_3d_config?: Field3DConfig };
    if (!json.field_3d_config) throw new Error('no field_3d_config');
    const file = path.join(OUT, 'rbr.html');
    fs.writeFileSync(file, assembleField3DHtml(json.field_3d_config), 'utf8');

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
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

    // The apparatus pose is spin.rotation.y = rbrThetaAt(tMs). Read the SCENE
    // OBJECT's actual rotation rather than an engine accumulator, so the number
    // is the pose the student sees, not an internal that might diverge from it.
    const READ = `(function () {
      var eng = window.PM_rbrEngine || {};
      var th = null;
      try {
        var idx = window.PM_rbrIndex || {};
        var keys = Object.keys(idx);
        for (var i = 0; i < keys.length; i++) {
          var o = idx[keys[i]];
          if (o && o.userData && o.userData.id === 'rbr_spin' && o.rotation) { th = o.rotation.y; break; }
        }
      } catch (e) {}
      var ro = document.getElementById('rbr_readout');
      var rp = document.getElementById('rbr_repin');
      return {
        t: eng.t_ms,
        thScene: th,
        thEng: (typeof eng._th === 'number') ? eng._th : null,
        hud: ro ? (ro.innerText || '').replace(/\\n/g, ' | ') : '',
        repinVisible: !!(rp && rp.style.display !== 'none'),
      };
    })()`;

    await page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_6' }, '*'));
    await tick(16.7, 10);

    console.log('STATE_6 — theta on a 100 ms grid across the authored restart');
    console.log('%-7s %-12s %-12s %-6s %s', 't_ms', 'theta_scene', 'theta_eng', 'repin', 'HUD');
    let prev: number | null = null;
    for (let t = 3800; t <= 5400; t += 100) {
        await page.evaluate(() => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: null }, '*'));
        await page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_6' }, '*'));
        await tick(16.7, 6);
        await page.evaluate(at => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: at }, '*'), t);
        await tick(16.7, Math.ceil(t / 16.7) + 30);
        const r = await page.evaluate(READ) as Record<string, number | string | boolean | null>;
        const th = r.thScene != null ? Number(r.thScene) : Number(r.thEng);
        const d = prev != null ? (th - prev) : NaN;
        console.log('%-7d %-12s %-12s %-6s %s%s', t,
            r.thScene != null ? Number(r.thScene).toFixed(4) : 'n/a',
            r.thEng != null ? Number(r.thEng).toFixed(4) : 'n/a',
            r.repinVisible ? 'YES' : '',
            String(r.hud).slice(0, 46),
            Number.isFinite(d) ? '   d(theta)=' + d.toFixed(4) : '');
        prev = th;
    }
    await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
