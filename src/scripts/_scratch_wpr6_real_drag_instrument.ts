// _scratch_wpr6_real_drag_instrument.ts — throwaway instrumentation probe,
// reopened WP-R6 (quality_auditor live-drive finding, 2026-08-08), ROUND 2.
//
// ROUND 1 (bare page.setContent(simHtml), no real iframe) reproduced a
// "leak" but it was a TEST-HARNESS ARTIFACT: with no real iframe,
// window.parent === window inside the sim, so drawPlotPoint's genuine-drag
// branch's OUTGOING window.parent.postMessage({type:'PARAM_UPDATE',...})
// (intended for a REAL host page) loops straight back into the SAME
// window's own PARAM_UPDATE listener — which recomputes physics against
// WHATEVER state is current at the moment the (asynchronously-queued)
// message is finally delivered, not the state it was sent from. That
// self-loop cannot happen in the real review site: build_review_site.ts
// embeds the sim in a REAL <iframe id="sim" src="sim.html">, so
// window.parent !== window inside it, and the parent's own PARAM_UPDATE
// handler (build_review_site.ts:1824) only logs telemetry — it never
// echoes back into the iframe. THIS ROUND wraps the sim in an actual
// iframe (srcdoc, mirroring build_review_site.ts's own <iframe id="sim">)
// to test the PRODUCTION-FAITHFUL embedding and settle whether the leak
// survives a real frame boundary.
//
// Reads the REAL definite_integral_as_accumulated_area concept JSON from a
// SCRATCHPAD copy (git-show'd from origin/feat/mathematics-definite-integral,
// NEVER checked out or written into this desk's own tracked working tree).
//
// Run: npx tsx --env-file=.env.local src/scripts/_scratch_wpr6_real_drag_instrument.ts
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { assembleParametricHtml } from '@/lib/renderers/parametric_renderer';
import { buildParametricConfig, type ParametricSourceJson } from './lib/buildParametricConfig';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';

const REAL_JSON_PATH =
  '/private/tmp/claude-501/-Users-karthikyerragadda-Desktop-Viditra-Physics-mind/611b52fb-e36c-4836-bc55-155a95a1d9b8/scratchpad/wpr6b/definite_integral_READONLY.json';

const COMPUTE_DIA_INJECT = [
  'var __compute_dia = function (vars) {',
  '  var b = (vars && typeof vars.b === "number" && isFinite(vars.b)) ? vars.b : 2.0;',
  '  var c = (vars && typeof vars.c === "number" && isFinite(vars.c)) ? vars.c : 0;',
  '  var beta = (vars && typeof vars.beta === "number" && isFinite(vars.beta)) ? vars.beta : 0;',
  '  var exact = Math.pow(b, 3) / 3 - c * b;',
  '  var aBeta = Math.pow(beta, 3) / 3 - c * beta;',
  '  var crossX = Math.min(b, Math.sqrt(c > 0 ? c : 0));',
  '  var areaBelowRaw = Math.pow(crossX, 3) / 3 - c * crossX;',
  '  var areaBelow = (Math.abs(areaBelowRaw) < 0.00005) ? 0 : areaBelowRaw;',
  '  var areaTotal = exact - 2 * areaBelow;',
  '  return {',
  '    concept_id: "definite_integral_as_accumulated_area",',
  '    variables: { b: b, c: c, beta: beta },',
  '    derived: { exact: exact, A_beta: aBeta, area_total: areaTotal, area_below: areaBelow },',
  '    forces: []',
  '  };',
  '};',
  'var __compute_orig = window.computePhysics;',
  'window.computePhysics = function (conceptId, vars) {',
  '  if (conceptId === "definite_integral_as_accumulated_area") return __compute_dia(vars);',
  '  return __compute_orig(conceptId, vars);',
  '};',
].join('\n');

async function main(): Promise<void> {
  const json = JSON.parse(readFileSync(REAL_JSON_PATH, 'utf8')) as ParametricSourceJson;
  const config = buildParametricConfig('definite_integral_as_accumulated_area', json, {
    synthesizeFocalSequenceFromScript: false,
  });
  const simHtml = assembleParametricHtml(config);

  // A minimal HOST page with a REAL <iframe> — mirrors build_review_site.ts's
  // own <iframe id="sim" src="sim.html">. srcdoc avoids needing to write a
  // temp file / serve it over HTTP; the frame boundary (window.parent !==
  // window inside it) is what matters, not how the bytes arrived.
  const hostHtml = `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0} iframe{width:760px;height:500px;border:0;display:block}</style></head><body>
<iframe id="sim" srcdoc="${simHtml.replace(/"/g, '&quot;')}"></iframe>
<script>
  var iframe = document.getElementById('sim');
  function post(msg) { if (iframe.contentWindow) iframe.contentWindow.postMessage(msg, '*'); }
  window.__hostPost = post;
</script>
</body></html>`;

  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 760, height: 500 }, deviceScaleFactor: 1 });
  const consoleLines: string[] = [];
  page.on('console', (m) => { const line = '[console] ' + m.text(); consoleLines.push(line); });
  page.on('pageerror', (e) => { const line = '[pageerror] ' + String(e); consoleLines.push(line); console.log(line); });

  await page.setContent(hostHtml, { waitUntil: 'load' });
  const simFrame = page.frameLocator('#sim');
  await page.waitForTimeout(300);
  const frame = page.frames().find((f) => f !== page.mainFrame());
  if (!frame) throw new Error('iframe not found among page.frames()');
  console.log('[probe] iframe frame URL:', frame.url());
  await frame.waitForFunction(() => typeof (window as unknown as { PM_simTimeMs?: number }).PM_simTimeMs === 'number', undefined, { timeout: 20000 });
  await page.waitForTimeout(300);

  // Verify the frame boundary is REAL (window.parent !== window inside the iframe) —
  // the whole point of this round.
  const frameBoundaryCheck = await frame.evaluate(() => (window as unknown as { parent: unknown }).parent === window);
  console.log('[probe] window.parent === window INSIDE the iframe (should be FALSE for a real embedding):', frameBoundaryCheck);

  await frame.evaluate(COMPUTE_DIA_INJECT);

  await frame.evaluate(() => {
    const w = window as unknown as {
      PM_overlayLiveControlValues: (vars: Record<string, number>, stateData: unknown, stateSliderVars: Record<string, boolean>) => Record<string, number>;
      __PM_OVERLAY_LOG: unknown[];
    };
    w.__PM_OVERLAY_LOG = [];
    const orig = w.PM_overlayLiveControlValues;
    w.PM_overlayLiveControlValues = function (vars, stateData, stateSliderVars) {
      const before = JSON.parse(JSON.stringify(vars));
      const result = orig(vars, stateData, stateSliderVars);
      w.__PM_OVERLAY_LOG.push({
        source: 'PM_overlayLiveControlValues (SET_STATE handler)',
        currentState: (window as unknown as { PM_currentState: string }).PM_currentState,
        advance_mode: (stateData as { advance_mode?: string } | null)?.advance_mode,
        stateSliderVars: JSON.parse(JSON.stringify(stateSliderVars)),
        varsBefore: before,
        varsAfter: JSON.parse(JSON.stringify(result)),
        sliderValuesAtCallTime: JSON.parse(JSON.stringify((window as unknown as { PM_sliderValues: Record<string, number> }).PM_sliderValues)),
      });
      return result;
    };
  });

  // Instrument computePhysics ITSELF (the ONE choke point every vars-rebuild
  // path funnels through) so every caller — SET_STATE handler, PARAM_UPDATE
  // handler, PM_applyChoreography, or a genuine drag branch — is caught,
  // even one this probe never explicitly named.
  await frame.evaluate(() => {
    const w = window as unknown as {
      computePhysics: (conceptId: string, vars: Record<string, number>) => unknown;
      __PM_COMPUTE_LOG: unknown[];
    };
    w.__PM_COMPUTE_LOG = [];
    const orig = w.computePhysics;
    w.computePhysics = function (conceptId, vars) {
      const result = orig(conceptId, vars);
      // Capture the call SITE via a synthetic Error stack — cheap, throwaway,
      // and the only way to attribute a call without hand-patching every caller.
      const stack = new Error().stack || '';
      w.__PM_COMPUTE_LOG.push({
        currentState: (window as unknown as { PM_currentState: string }).PM_currentState,
        varsIn: JSON.parse(JSON.stringify(vars)),
        bOut: (result as { variables?: { b?: number } } | null)?.variables?.b,
        callerLine: stack.split('\n')[2] || stack.split('\n')[1] || '(unknown)',
      });
      return result;
    };
  });

  // Log every message the IFRAME receives (verbatim), from the parent
  // driving it AND from itself (its own PARAM_UPDATE self-writes, if any).
  await frame.evaluate(() => {
    const w = window as unknown as { __PM_MSG_LOG: unknown[] };
    w.__PM_MSG_LOG = [];
    window.addEventListener('message', (e) => {
      try { w.__PM_MSG_LOG.push(JSON.parse(JSON.stringify(e.data))); } catch (err) { w.__PM_MSG_LOG.push({ __unserializable: String(err) }); }
    });
  });
  // Log every message the HOST page's OWN window receives (catches a
  // PARAM_UPDATE the iframe sends to window.parent landing back at the host).
  await page.evaluate(() => {
    const w = window as unknown as { __PM_HOST_MSG_LOG: unknown[] };
    w.__PM_HOST_MSG_LOG = [];
    window.addEventListener('message', (e) => {
      try { w.__PM_HOST_MSG_LOG.push(JSON.parse(JSON.stringify(e.data))); } catch (err) { w.__PM_HOST_MSG_LOG.push({ __unserializable: String(err) }); }
    });
  });

  // ── Drive it EXACTLY like build_review_site.ts's own sendState() does —
  // through the HOST page's post(), targeting iframe.contentWindow. ───────
  await page.evaluate(() => (window as unknown as { __hostPost: (m: unknown) => void }).__hostPost({ type: 'SET_STATE', state: 'STATE_8' }));
  await page.waitForTimeout(500);

  const b8entry = await frame.evaluate(() => (window as unknown as { PM_liveExprVars: () => Record<string, number> }).PM_liveExprVars().b);
  console.log('[probe] STATE_8 fresh entry, b =', b8entry);

  const markerPx = await frame.evaluate(() => {
    const w = window as unknown as {
      PM_config: { states: Record<string, { scene_composition: { id: string; type: string }[] }> };
      PM_currentState: string;
      PM_liveExprVars: () => Record<string, number>;
      PM_plotPointResolve: (spec: unknown, vars: unknown) => { x: number; y: number };
      PM_planeResolve: (spec: unknown, x: number, y: number) => { x: number; y: number } | null;
    };
    const scene = w.PM_config.states[w.PM_currentState].scene_composition;
    const spec = scene.find((p) => p.id === 'bound_marker');
    const vars = w.PM_liveExprVars();
    const resolved = spec ? w.PM_plotPointResolve(spec, vars) : null;
    return spec && resolved ? w.PM_planeResolve(spec, resolved.x, resolved.y) : null;
  });
  console.log('[probe] bound_marker resolved px (iframe-local design coords):', markerPx);
  if (!markerPx) throw new Error('marker not resolved');

  // frameLocator gives us a canvas locator whose boundingBox() is already in
  // TOP-LEVEL page coordinates (Playwright resolves the frame offset).
  const canvasBox = await simFrame.locator('canvas').first().boundingBox();
  if (!canvasBox) throw new Error('no canvas in iframe');
  const startPage = { x: canvasBox.x + markerPx.x, y: canvasBox.y + markerPx.y };
  const targetPage = { x: canvasBox.x + markerPx.x - 200, y: startPage.y };

  await page.mouse.move(startPage.x, startPage.y);
  await page.waitForTimeout(80);
  await page.mouse.down();
  await page.waitForTimeout(80);
  for (let i = 1; i <= 10; i++) {
    const t = i / 10;
    await page.mouse.move(startPage.x + (targetPage.x - startPage.x) * t, startPage.y);
    await page.waitForTimeout(60);
  }
  await page.mouse.up();
  await page.waitForTimeout(400);

  const bAfterDrag = await frame.evaluate(() => (window as unknown as { PM_sliderValues: Record<string, number> }).PM_sliderValues.b);
  console.log('[probe] PM_sliderValues.b after real drag (inside iframe):', bAfterDrag);

  for (const st of ['STATE_2', 'STATE_3', 'STATE_5', 'STATE_1']) {
    await page.evaluate((state) => (window as unknown as { __hostPost: (m: unknown) => void }).__hostPost({ type: 'SET_STATE', state }), st);
    await page.waitForTimeout(500);
    const snap = await frame.evaluate(() => ({
      b: (window as unknown as { PM_liveExprVars: () => Record<string, number> }).PM_liveExprVars().b,
      userTouched: (window as unknown as { PM_userTouched: Record<string, boolean> }).PM_userTouched,
      sliderValues: (window as unknown as { PM_sliderValues: Record<string, number> }).PM_sliderValues,
    }));
    console.log(`[probe] ${st}: b=${snap.b}  PM_userTouched=${JSON.stringify(snap.userTouched)}  PM_sliderValues=${JSON.stringify(snap.sliderValues)}`);
  }

  const iframeMsgTypeCounts = await frame.evaluate(() => {
    const w = window as unknown as { __PM_MSG_LOG: { type?: string }[] };
    const counts: Record<string, number> = {};
    for (const m of w.__PM_MSG_LOG) { const t = (m && m.type) || '(no type)'; counts[t] = (counts[t] || 0) + 1; }
    return counts;
  });
  console.log('\n[probe] ==== IFRAME-received message TYPE COUNTS ====', JSON.stringify(iframeMsgTypeCounts));

  const hostMsgLog = await page.evaluate(() => (window as unknown as { __PM_HOST_MSG_LOG: unknown[] }).__PM_HOST_MSG_LOG);
  console.log('\n[probe] ==== HOST-page-received message LOG (from the iframe, verbatim) ====');
  for (const m of hostMsgLog) console.log('  ', JSON.stringify(m));

  const overlayLog = await frame.evaluate(() => (window as unknown as { __PM_OVERLAY_LOG: unknown[] }).__PM_OVERLAY_LOG);
  console.log('\n[probe] ==== PM_overlayLiveControlValues CALL LOG ====');
  for (const c of overlayLog) console.log('  ', JSON.stringify(c));

  const computeLog = await frame.evaluate(() => (window as unknown as { __PM_COMPUTE_LOG: { currentState: string; varsIn: Record<string, number>; bOut: number; callerLine: string }[] }).__PM_COMPUTE_LOG);
  console.log('\n[probe] ==== computePhysics CALL LOG (every call, any caller, since STATE_5 first appears) ====');
  let sawState5 = false;
  for (const c of computeLog) {
    if (c.currentState === 'STATE_5') sawState5 = true;
    if (sawState5) console.log('  ', JSON.stringify(c));
  }
  console.log(`[probe] total computePhysics calls logged: ${computeLog.length}`);

  console.log('\n[probe] console/page lines:', consoleLines.length ? '\n' + consoleLines.join('\n') : '(none)');

  await browser.close();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
