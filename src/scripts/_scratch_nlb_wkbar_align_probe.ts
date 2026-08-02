/**
 * SCRATCH — work-bar track collinearity proof (2026-08-02, bug_class
 * `nlb_work_bar_tracks_misalign_when_one_caption_wraps_to_more_lines_than_its_neighbours`).
 * NOT product code. Writes NOTHING to the database. Delete after the dispatch.
 *
 * Contract (same harness as _scratch_nlb_mass_label_probe.ts): drives the REAL
 * assembled renderer under a deterministic virtual clock and reads the LIVE
 * getBoundingClientRect() of every visible work track out of the page.
 *
 *   A  the REAL positive_negative_zero_work config, every state that renders >1
 *      work accumulator: assert every #nlb_wk_<i>_t top is equal to the pixel and
 *      every height is equal.
 *   B  synthetic captions of 1, 2 and 3 wrapped lines in ONE row: same assertion.
 *   C  the SHIPPED work_done_by_constant_force config (all 2-line captions): the
 *      same assertion, plus its measured tops printed so a before/after diff can
 *      prove its pixels did not move.
 *
 * Run:  npx tsx src/scripts/_scratch_nlb_wkbar_align_probe.ts
 */
import { chromium, type Page, type Browser } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { assembleField3DHtml, type Field3DConfig } from '../lib/renderers/field_3d_renderer';

const OUT = path.join(process.cwd(), '.scratch_nlb_wkbar');

const INIT = `(function () {
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

// Every VISIBLE work slot: the track rect (the thing that carries the zero line),
// the caption text + rect, and the value rect. Straight off getBoundingClientRect.
const READ = `(function () {
  var out = [];
  var sec = document.getElementById('nlb_wk');
  var secVis = !!sec && window.getComputedStyle(sec).display !== 'none';
  for (var i = 0; i < 8; i++) {
    var sl = document.getElementById('nlb_wk_' + i);
    if (!sl) continue;
    if (window.getComputedStyle(sl).display === 'none') continue;
    var t = document.getElementById('nlb_wk_' + i + '_t');
    var y = document.getElementById('nlb_wk_' + i + '_y');
    var v = document.getElementById('nlb_wk_' + i + '_v');
    var tr = t ? t.getBoundingClientRect() : null;
    var yr = y ? y.getBoundingClientRect() : null;
    var vr = v ? v.getBoundingClientRect() : null;
    out.push({
      i: i,
      cap: y ? (y.textContent || '') : '',
      capH: yr ? yr.height : 0,
      capLines: (yr && y) ? Math.round(yr.height / (parseFloat(window.getComputedStyle(y).lineHeight) || 1)) : 0,
      trkTop: tr ? tr.top : 0,
      trkBottom: tr ? tr.bottom : 0,
      trkH: tr ? tr.height : 0,
      valTop: vr ? vr.top : 0,
      valBottom: vr ? vr.bottom : 0,
      slotH: sl.getBoundingClientRect().height
    });
  }
  var p = document.getElementById('nlb_energy');
  return { secVis: secVis, slots: out, panelH: p ? p.getBoundingClientRect().height : 0 };
})()`;

interface Slot {
  i: number; cap: string; capH: number; capLines: number;
  trkTop: number; trkBottom: number; trkH: number;
  valTop: number; valBottom: number; slotH: number;
}
interface Snap { secVis: boolean; slots: Slot[]; panelH: number }

let failures = 0;
function check(label: string, ok: boolean, detail: string) {
  if (!ok) failures++;
  console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (detail ? '\n           ' + detail : ''));
}
// The probe from the scar row: every top equal TO THE PIXEL, every height equal.
function assertCollinear(tag: string, s: Snap) {
  const sl = s.slots;
  if (sl.length < 2) { console.log('  skip  ' + tag + ' — ' + sl.length + ' visible track(s)'); return; }
  const tops = sl.map(x => Math.round(x.trkTop));
  const hs = sl.map(x => Math.round(x.trkH));
  const vbots = sl.map(x => Math.round(x.valBottom));
  const spread = Math.max(...tops) - Math.min(...tops);
  const table = sl.map(x =>
    '#' + x.i + ' ' + JSON.stringify(x.cap).padEnd(24) +
    ' capLines=' + x.capLines +
    ' capH=' + x.capH.toFixed(1) +
    ' trkTop=' + x.trkTop.toFixed(1) +
    ' trkH=' + x.trkH.toFixed(1) +
    ' zeroLine=' + (x.trkTop + x.trkH / 2).toFixed(1) +
    ' valBottom=' + x.valBottom.toFixed(1)).join('\n           ');
  check(tag + ': every work track top is equal to the pixel (spread ' + spread + ' px)',
    spread === 0, table);
  check(tag + ': every work track height is equal',
    new Set(hs).size === 1, 'heights = ' + hs.join(','));
  check(tag + ': every value readout bottom is equal to the pixel',
    new Set(vbots).size === 1, 'value bottoms = ' + vbots.join(','));
}

async function openCfg(browser: Browser, cfg: Field3DConfig, name: string): Promise<{
  page: Page; tick: (d: number, n?: number) => Promise<number>;
  setState: (s: string) => Promise<void>; snap: () => Promise<Snap>; errs: string[];
}> {
  const html = assembleField3DHtml(cfg);
  const file = path.join(OUT, name + '.html');
  fs.writeFileSync(file, html, 'utf8');
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs: string[] = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.addInitScript(INIT);
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
  const setState = async (s: string) => { await page.evaluate(x => window.postMessage({ type: 'SET_STATE', state: x }, '*'), s); };
  const snap = async (): Promise<Snap> => await page.evaluate(READ) as unknown as Snap;
  return { page, tick, setState, snap, errs };
}

function synthetic(): Field3DConfig {
  const cap = (label: string, force: string) => ({ force, label, body_id: 'crate' });
  const base = {
    mode: 'accelerate_applied_force',
    surface: { theta_deg: 0, length_m: 6 },
    bodies: [{
      id: 'crate', label: 'm', mass_kg: 5, color: '#42A5F5',
      initial_position_m: -5.4, initial_velocity_mps: 0, mu_s: 0.4, mu_k: 0.4,
      applied_force: { N: 30, angle_deg: 0 }
    }],
    arrows: [{ body_id: 'crate', show: ['applied', 'friction', 'normal'] }],
    work_scale_J: 180,
    loop_reset_ms: 2000,
    readouts: ['F_applied', 'v'],
    controls_visible: [] as string[]
  };
  return {
    scenario_type: 'newtons_laws_body',
    explorer_id: 'newtons_laws_body_explorer',
    field_lines: { count: 0, color_positive: '#FF6B6B', color_negative: '#4ECDC4', opacity: 0, arrow_spacing: 0 },
    states: {
      // 1 line / 2 lines / 3 lines / 4 lines in ONE row — the worst mix.
      STATE_MIX: {
        label: 'mixed caption wraps',
        visible_elements: ['nlb_body_crate', 'nlb_surface'],
        caption: 'Mixed wraps',
        newtons_laws_body: {
          ...base,
          work_accumulators: [
            cap('pull', 'applied'),
            cap('by friction', 'friction'),
            cap('by the normal force', 'normal'),
            cap('the net sum of every force acting', 'net')
          ]
        }
      },
      // every caption one line — the control
      STATE_ONE: {
        label: 'all one line',
        visible_elements: ['nlb_body_crate', 'nlb_surface'],
        caption: 'One line',
        newtons_laws_body: {
          ...base,
          work_accumulators: [cap('pull', 'applied'), cap('drag', 'friction'), cap('lift', 'normal'), cap('net', 'net')]
        }
      }
    }
  } as unknown as Field3DConfig;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  // ═══ A. the real concept ════════════════════════════════════════════════
  console.log('\n=== A. positive_negative_zero_work (REAL config) ===');
  const real = JSON.parse(fs.readFileSync(
    path.join(process.cwd(), 'src', 'data', 'concepts', 'positive_negative_zero_work.json'), 'utf8'));
  const A = await openCfg(browser, real.field_3d_config as Field3DConfig, 'pnzw');
  for (const st of Object.keys(real.field_3d_config.states)) {
    await A.setState(st);
    await A.tick(16.7, 60);
    const s = await A.snap();
    if (!s.secVis || s.slots.length < 2) { console.log('  skip  ' + st + ' (no multi-ledger work section)'); continue; }
    console.log('  --- ' + st + ' (' + s.slots.length + ' ledgers) ---');
    assertCollinear(st, s);
    await A.page.screenshot({ path: path.join(OUT, 'pnzw_' + st + '.png') });
  }
  check('positive_negative_zero_work page threw no errors', A.errs.length === 0, A.errs.slice(0, 3).join(' | ') || 'clean');

  // ═══ B. synthetic wraps ═════════════════════════════════════════════════
  console.log('\n=== B. synthetic captions of 1 / 2 / 3 / 4 wrapped lines in one row ===');
  const B = await openCfg(browser, synthetic(), 'synthetic');
  for (const st of ['STATE_ONE', 'STATE_MIX']) {
    await B.setState(st);
    await B.tick(16.7, 60);
    const s = await B.snap();
    console.log('  --- ' + st + ' ---');
    assertCollinear(st, s);
    await B.page.screenshot({ path: path.join(OUT, 'synth_' + st + '.png') });
  }
  check('synthetic page threw no errors', B.errs.length === 0, B.errs.slice(0, 3).join(' | ') || 'clean');

  // ═══ C. the shipped sibling — its pixels must NOT move ══════════════════
  console.log('\n=== C. work_done_by_constant_force (SHIPPED — regression witness) ===');
  const wd = JSON.parse(fs.readFileSync(
    path.join(process.cwd(), 'src', 'data', 'concepts', 'work_done_by_constant_force.json'), 'utf8'));
  const C = await openCfg(browser, wd.field_3d_config as Field3DConfig, 'wdbcf');
  for (const st of Object.keys(wd.field_3d_config.states)) {
    await C.setState(st);
    await C.tick(16.7, 60);
    const s = await C.snap();
    if (!s.secVis || !s.slots.length) { console.log('  skip  ' + st + ' (no work section)'); continue; }
    console.log('  --- ' + st + ' (' + s.slots.length + ' ledgers, panelH=' + s.panelH.toFixed(1) + ') ---');
    console.log('           ' + s.slots.map(x =>
      '#' + x.i + ' ' + JSON.stringify(x.cap) + ' lines=' + x.capLines +
      ' trkTop=' + x.trkTop.toFixed(2) + ' trkH=' + x.trkH.toFixed(2) +
      ' valBottom=' + x.valBottom.toFixed(2) + ' slotH=' + x.slotH.toFixed(2)).join('\n           '));
    if (s.slots.length > 1) assertCollinear(st, s);
  }
  check('work_done_by_constant_force page threw no errors', C.errs.length === 0, C.errs.slice(0, 3).join(' | ') || 'clean');

  await browser.close();
  console.log('\nframes -> ' + OUT);
  console.log(failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED');
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
