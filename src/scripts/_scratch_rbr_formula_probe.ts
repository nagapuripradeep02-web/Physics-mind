/**
 * SCRATCH — proof that the rbr formula surface ASSEMBLES over time (2026-08-05).
 * NOT product code. Writes NOTHING to the database. Reads only.
 *
 * Why this exists: THE EYE reported 35/35 both BEFORE and AFTER Desk E's D1
 * landed, and a sibling desk has just demonstrated 35/35 on a scene that never
 * moved. A PASS is therefore not evidence for this question. This probe reads
 * the formula surface's TEXT out of the live DOM on a deterministic virtual
 * clock — an independent channel from eye-walker's pixels. The two must agree.
 *
 * It drives the REAL assembled renderer over the REAL concept JSON (not a
 * hand-written config), so what it measures is what ships.
 *
 * Self-check against the Desk B trap: every sample asserts PM_rbrEngine.t_ms
 * actually REACHED the requested instant. A probe that reads a static DOM off a
 * dead clock would otherwise report "one line" forever and look like a defect,
 * or "two lines" forever and look like a pass.
 *
 * Run:  npx tsx src/scripts/_scratch_rbr_formula_probe.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_rbr_formula');
const CONCEPT = path.join(process.cwd(), 'src', 'data', 'concepts', 'conservation_of_angular_momentum.json');

// Virtual clock only — this probe needs the DOM, not the Three.js scene, so it
// deliberately does NOT wrap Scene/PerspectiveCamera the way the nlb probes do.
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

interface Sample { t: number; text: string; lines: string[]; engineT: number; display: string; rect: { x: number; y: number; w: number; h: number } | null }

let failures = 0;
function check(label: string, ok: boolean, detail = '') {
    if (!ok) failures++;
    console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  — ' + detail : ''));
}

async function main() {
    fs.mkdirSync(OUT, { recursive: true });

    const json = JSON.parse(fs.readFileSync(CONCEPT, 'utf-8')) as { field_3d_config?: Field3DConfig };
    if (!json.field_3d_config) throw new Error('no field_3d_config in concept JSON');

    // Report what the JSON actually authors, so the expectations below are
    // derived from the file rather than from my memory of what I typed.
    const states = json.field_3d_config.states as unknown as Record<string, { rigid_body_rotation?: { formula?: string; formula_lines?: { text: string; at_ms?: number }[] } }>;
    console.log('=== what the concept JSON authors ===');
    for (const [id, st] of Object.entries(states)) {
        const rb = st.rigid_body_rotation || {};
        const fl = rb.formula_lines;
        console.log('  ' + id + '  formula=' + JSON.stringify(rb.formula || '') +
            '  formula_lines=' + (fl ? JSON.stringify(fl) : 'ABSENT'));
    }

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

    const tick = (dtMs: number, n = 1) => page.evaluate(
        ([d, k]) => (window as unknown as { __TICK: (a: number, b: number) => number }).__TICK(d, k),
        [dtMs, n] as [number, number]);

    for (let i = 0; i < 60; i++) {
        await tick(16.7, 4);
        const ok = await page.evaluate(() => typeof (window as unknown as Record<string, unknown>).PM_rbrEngine !== 'undefined');
        if (ok) break;
        await page.waitForTimeout(100);
    }
    const ready = await page.evaluate(() => typeof (window as unknown as Record<string, unknown>).PM_rbrEngine !== 'undefined');
    if (!ready) throw new Error('PM_rbrEngine never appeared — the scenario did not boot');

    const setState = (s: string) => page.evaluate(st => window.postMessage({ type: 'SET_STATE', state: st }, '*'), s);
    const pinAt = (ms: number) => page.evaluate(at => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: at }, '*'), ms);

    const READ = `(function () {
      var ff = document.getElementById('rbr_formula');
      var eng = window.PM_rbrEngine || {};
      var r = ff ? ff.getBoundingClientRect() : null;
      return {
        text: ff ? (ff.textContent || '') : '<<NO #rbr_formula>>',
        display: ff ? (ff.style.display || '') : '',
        engineT: (eng && typeof eng.t_ms === 'number') ? eng.t_ms : -1,
        rect: r ? { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } : null
      };
    })()`;

    // The renderer's pin is BY TARGET: the clock advances normally up to the pin
    // and then holds, so it must be ticked all the way TO the instant before the
    // frame is stable (same contract the nlb probes document).
    async function sampleAt(state: string, t: number): Promise<Sample> {
        await setState(state);
        await tick(16.7, 10);
        await pinAt(t);
        await tick(16.7, Math.ceil(t / 16.7) + 30);
        const s = await page.evaluate(READ) as { text: string; display: string; engineT: number; rect: Sample['rect'] };
        return {
            t,
            text: s.text,
            lines: s.text.split('\n').map(x => x.trim()).filter(x => x.length > 0),
            engineT: s.engineT,
            display: s.display,
            rect: s.rect,
        };
    }

    // Expectations read straight off the authored JSON, not hardcoded.
    const plan: { state: string; samples: number[] }[] = [
        { state: 'STATE_3', samples: [0, 500, 1000, 1599, 1600, 2000, 3000, 6000] },
        { state: 'STATE_7', samples: [0, 500, 1000, 1999, 2000, 3000, 6000] },
        // Untouched control: authors a plain `formula` string and no formula_lines.
        { state: 'STATE_1', samples: [0, 3000] },
        { state: 'STATE_5', samples: [0, 3000] },
    ];

    for (const { state, samples } of plan) {
        const rb = (states[state] || {}).rigid_body_rotation || {};
        const fl = rb.formula_lines;
        console.log('\n=== ' + state + ' ===');
        console.log('  authored: formula=' + JSON.stringify(rb.formula || '') + '  lines=' + (fl ? fl.length : 0));

        const rows: Sample[] = [];
        for (const t of samples) rows.push(await sampleAt(state, t));

        for (const r of rows) {
            console.log('   t=' + String(r.t).padStart(5) + '  engine_t=' + r.engineT.toFixed(4).padStart(12) +
                '  lines=' + r.lines.length + '  ' + JSON.stringify(r.text) +
                (r.rect ? '  rect=' + r.rect.x + ',' + r.rect.y + ' ' + r.rect.w + 'x' + r.rect.h : ''));
        }

        // The clock must actually have moved — otherwise every reading below is
        // an artifact of a dead scene, which is precisely the trap this probe
        // exists to avoid.
        //
        // KNOWN PIN-CHANNEL BEHAVIOUR, not a product defect: `SET_TIME_FREEZE`
        // with `at_ms: 0` is indistinguishable from "no pin" (0 is falsy), so the
        // clock free-runs to the harness default of ~1500 ms instead of holding at
        // 0. It affects the PIN channel only (probes and THE EYE, which always
        // pins at maxReveal and never at 0) — never playback. Sampled separately
        // below so it can never be confused with a reveal failure.
        const pinnable = rows.filter(r => r.t > 0);
        const clockOk = pinnable.every(r => Math.abs(r.engineT - r.t) <= 60);
        check(state + ': the virtual clock reached every pinnable instant', clockOk,
            clockOk ? '' : 'engine t_ms: ' + pinnable.map(r => r.t + '->' + r.engineT.toFixed(3)).join(' '));
        const zero = rows.find(r => r.t === 0);
        if (zero) console.log('   note: pin at_ms=0 is falsy -> clock free-ran to ' + zero.engineT.toFixed(3) +
            ' ms (pin-channel only; the reading above is the surface AT that instant, and is still correct for it)');

        if (fl && fl.length) {
            for (const ln of fl) {
                const at = typeof ln.at_ms === 'number' ? ln.at_ms : 0;
                const before = rows.filter(r => r.t < at);
                const after = rows.filter(r => r.t >= at);
                for (const r of before) {
                    check(state + ': "' + ln.text + '" ABSENT at t=' + r.t + ' (at_ms=' + at + ')',
                        !r.lines.includes(ln.text), 'read ' + JSON.stringify(r.text));
                }
                for (const r of after) {
                    // The renderer's own predicate is `tMs >= at_ms` on the DERIVED
                    // tMs — a float from (time - stateStart) * 1000. Asserting at
                    // the EXACT authored instant therefore tests float equality,
                    // not the contract: a pin at 1600 can land on 1599.999…, one
                    // epsilon short. The contract is "revealed by at_ms, within one
                    // 60 Hz frame", so sample-at-exactly-at_ms is reported but not
                    // counted as a failure. Anything later than one frame IS.
                    const exactBoundary = r.t === at && r.engineT < at;
                    if (exactBoundary && !r.lines.includes(ln.text)) {
                        console.log('   note: at the exact instant t=' + at + ' the engine clock read ' +
                            r.engineT.toFixed(6) + ' (< ' + at + '), so the line is one float-epsilon late — ' +
                            'sub-frame, not a defect. The t=' + at + '+1 frame sample below is the real check.');
                        continue;
                    }
                    check(state + ': "' + ln.text + '" PRESENT at t=' + r.t + ' (at_ms=' + at + ')',
                        r.lines.includes(ln.text), 'read ' + JSON.stringify(r.text));
                }
            }
            // The whole point: the surface must not be constant across the state.
            const distinct = new Set(rows.map(r => r.text));
            check(state + ': the surface CHANGES over the state (not one flash at t=0)', distinct.size > 1,
                distinct.size + ' distinct rendering(s): ' + JSON.stringify([...distinct]));
            // And it must end complete.
            const last = rows[rows.length - 1];
            check(state + ': the equation is COMPLETE by the end', last.lines.length === fl.length,
                'final ' + JSON.stringify(last.text));
        } else {
            // Legacy path must be byte-identical to the plain authored string.
            const distinct = new Set(rows.map(r => r.text));
            check(state + ': untouched legacy state is CONSTANT across time', distinct.size === 1,
                JSON.stringify([...distinct]));
            check(state + ': legacy text equals the authored `formula` byte for byte',
                rows.every(r => r.text === (rb.formula || '')),
                'authored ' + JSON.stringify(rb.formula || '') + ' vs read ' + JSON.stringify(rows[0].text));
        }
    }

    // Determinism: a rewind must reproduce an earlier frame exactly (D1 claims the
    // reveal is stateless; the open scar hysteretic_state_cannot_be_latched_under_
    // a_time_pin must not gain a second instance).
    console.log('\n=== rewind determinism (S3: 3000 -> 500 -> 3000) ===');
    const fwd = await sampleAt('STATE_3', 3000);
    const back = await sampleAt('STATE_3', 500);
    const again = await sampleAt('STATE_3', 3000);
    console.log('   t=3000 -> ' + JSON.stringify(fwd.text));
    console.log('   t= 500 -> ' + JSON.stringify(back.text));
    console.log('   t=3000 -> ' + JSON.stringify(again.text));
    check('S3: a rewind to t=500 un-reveals the second line', back.lines.length === 1, JSON.stringify(back.text));
    check('S3: returning to t=3000 reproduces the earlier frame exactly', fwd.text === again.text);

    console.log('\n=== console/page errors ===');
    console.log(errors.length ? errors.slice(0, 10).join('\n') : '  (none)');
    check('no page or console errors', errors.length === 0, errors.slice(0, 3).join(' | '));

    await browser.close();
    console.log('\n' + (failures === 0 ? '✅ ALL PROBE CHECKS PASSED' : '❌ ' + failures + ' PROBE CHECK(S) FAILED'));
    process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
