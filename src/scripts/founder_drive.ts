// founder_drive.ts — deterministic live-drive of a BUILT review-site sim for the
// founder-proxy review (EXPERIMENTAL chapter-loop trial, 2026-07-22).
//
// Drives the real teacher surface (the review player page), not the raw sim HTML:
// clicks every rail state card, plays each state's clock (t0/mid/late screenshots
// stamped with the sim's actual PM_simTimeMs), then in the final explore state
// drags every visible slider with TRUSTED mouse input (Playwright CDP — the drag
// path THE EYE's synthetic events cannot exercise) and runs the Rule-37 probe
// (two late frames byte-compared; equal bytes = frozen explore state).
//
// Output: .founder_runs/<id>/<ts>/  — PNGs + manifest.json. Read by founder-proxy;
// this script judges nothing.
//
// Run: npm run founder:drive -- --id ac_generator --url http://localhost:8087
//      (--url is the review-site server root; the page driven is <url>/<id>/)

import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { Frame, Page } from '@playwright/test';
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';

interface Shot {
  state: number;
  action: string;
  /** The scene_group this frame was captured in, or null on an unpartitioned state. */
  sceneGroup: string | null;
  file: string;
  simTimeMs: number;
}

interface SliderDrag {
  sliderId: string;
  state: number;
  before: string;
  after: string;
  valueBefore: string;
  valueAtRelease: string; // input value the instant the mouse releases
  valueAfter: string; // input value ~1.2s later — a scripted ramp clobbering the drag shows here
  moved: boolean;
  reverted: boolean; // true = the sim took the drag then overwrote it (the dead-guided-slider class)
  /** The scene_group this row was visible in. Null on an unpartitioned state. */
  sceneGroup: string | null;
}

/**
 * Rule-37 motion probe, ONE PER SCENE GROUP, shot BEFORE that group's drags.
 *
 * `changedPx` is the measurement; `bytesEqual` is kept only so an older reader
 * does not silently lose the field it used to key on. Ordering is recorded
 * EXPLICITLY (`shotBeforeDrags`) because the verdict is meaningless without it —
 * see bug_class founder_drive_rule37_motion_probe_runs_after_its_own_slider_
 * drags_so_a_drag_seized_scene_is_scored_by_noise.
 */
interface MotionProbe {
  sceneGroup: string | null;
  frameA: string;
  frameB: string;
  changedPx: number;
  totalPx: number;
  ratio: number;
  bytesEqual: boolean;
  shotBeforeDrags: boolean;
  frozen: boolean;
}

interface OverlayCollision {
  state: number;
  overlay: string;
  chrome: string;
  overlapPx: { w: number; h: number };
}

interface Manifest {
  concept: string;
  url: string;
  startedAt: string;
  stateCount: number;
  stateTitles: string[];
  shots: Shot[];
  sliderDrags: SliderDrag[];
  overlayCollisions: OverlayCollision[];
  /** Declared scene_groups of the explore state ([] when it is not partitioned). */
  exploreSceneGroups: string[];
  motionProbes: MotionProbe[];
  consoleErrors: string[];
  pageErrors: string[];
  flags: string[];
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function simTime(page: Page): Promise<number> {
  return page.evaluate(() => {
    const f = document.getElementById('sim') as HTMLIFrameElement | null;
    try {
      const w = f?.contentWindow as (Window & { PM_simTimeMs?: number }) | null | undefined;
      return w?.PM_simTimeMs ?? -1;
    } catch {
      return -1;
    }
  });
}

async function main(): Promise<void> {
  const concept = arg('id');
  const base = arg('url');
  if (!concept || !base) {
    console.error('Usage: founder_drive --id <concept_id> --url <review-site server root>');
    process.exit(1);
  }
  const pageUrl = `${base.replace(/\/$/, '')}/${concept}/`;
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = join(process.cwd(), '.founder_runs', concept, ts);
  mkdirSync(outDir, { recursive: true });

  const manifest: Manifest = {
    concept,
    url: pageUrl,
    startedAt: new Date().toISOString(),
    stateCount: 0,
    stateTitles: [],
    shots: [],
    sliderDrags: [],
    overlayCollisions: [],
    exploreSceneGroups: [],
    motionProbes: [],
    consoleErrors: [],
    pageErrors: [],
    flags: [],
  };

  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => manifest.pageErrors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') manifest.consoleErrors.push(m.text());
  });

  /** Set by the explore walk so every artifact records the view it came from. */
  let currentGroup: string | null = null;

  const shoot = async (state: number, action: string, name: string): Promise<void> => {
    const file = `${name}.png`;
    await page.screenshot({ path: join(outDir, file) });
    manifest.shots.push({ state, action, sceneGroup: currentGroup, file, simTimeMs: await simTime(page) });
  };

  /** Decode a captured PNG to raw RGBA so two frames can be pixel-compared. */
  const rgba = async (file: string) =>
    sharp(join(outDir, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  /**
   * Rule-37: does this view MOVE on its own? Two frames 1 s apart, compared by
   * CHANGED-PIXEL COUNT rather than byte equality.
   *
   * Byte equality was the original test and it cannot fail once anything has
   * touched a slider: field_3d's knob() permanently prefers the live value over
   * vgAnimValue after a trusted drag (correct — a teacher who sets a value wants
   * it held), so a post-drag scene is legitimately still and the boolean is then
   * decided by anti-alias jitter. Measured on lines_and_planes_in_space: 838
   * changed px per 3 s before a lambda drag, 0 px after, while byte comparison
   * reported "not equal" (i.e. alive) both times. A count carries its own scale;
   * a boolean does not. CALLERS MUST SHOOT THIS BEFORE ANY DRAG.
   */
  const motionProbe = async (label: string, shotBeforeDrags: boolean): Promise<void> => {
    const fa = `motion_probe_${label}_a.png`;
    const fb = `motion_probe_${label}_b.png`;
    // CLIP TO THE SIM. A full-page shot cannot answer "did the SIM move": the
    // player's own timeline scrubber and elapsed-time readout advance every
    // frame on their own, so a completely frozen sim still scores hundreds of
    // changed pixels. Measured during this fix — view B with its only animated
    // knob REMOVED (the exact pre-F-7 defect) still read 258 px/1 s full-page
    // and passed. Clipped to the iframe, the same scene reads ~0.
    const simEl = await page.$('#sim');
    const clip = (await simEl?.boundingBox()) ?? undefined;
    await page.screenshot({ path: join(outDir, fa), clip });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(outDir, fb), clip });

    const bytesEqual = readFileSync(join(outDir, fa)).equals(readFileSync(join(outDir, fb)));
    let changedPx = -1;
    let totalPx = 0;
    try {
      const a = await rgba(fa);
      const b = await rgba(fb);
      if (a.info.width === b.info.width && a.info.height === b.info.height) {
        totalPx = a.info.width * a.info.height;
        changedPx = pixelmatch(a.data, b.data, undefined, a.info.width, a.info.height, { threshold: 0.1 });
      }
    } catch {
      /* leave changedPx at -1 — reported as unmeasured, never as "moving" */
    }
    const ratio = totalPx > 0 && changedPx >= 0 ? changedPx / totalPx : 0;
    // THE BAR IS AN ABSOLUTE PIXEL COUNT, NOT A RATIO OF THE PAGE.
    //
    //   A page-relative ratio is the diluted-lens mistake already on the scar
    //   list as visual_eyes_d5_ink_relative_lens_is_diluted_by_static_chrome_on_
    //   explore_states: this frame is 1280x800 and mostly static chrome, so a
    //   real but slow motion scores a tiny fraction and reads as dead. Measured
    //   The frame is CLIPPED to the sim (see above), so `ratio` is sim-relative
    //   and meaningful — but the bar stays absolute, because the populations are
    //   orders of magnitude apart and a ratio invites exactly the dilution this
    //   probe just had to fix. Measured on lines_and_planes_in_space, clipped,
    //   both views shot before any drag: several hundred to several thousand
    //   changed px for a live view, and ~0 for a frozen one (its only animated
    //   knob removed, or seized by a drag). 60 px sits ~10x above the
    //   anti-alias floor and far below the slowest real motion observed.
    const MOTION_FLOOR_PX = 60;
    const frozen = changedPx >= 0 ? changedPx < MOTION_FLOOR_PX : bytesEqual;
    manifest.motionProbes.push({
      sceneGroup: currentGroup, frameA: fa, frameB: fb,
      changedPx, totalPx, ratio, bytesEqual, shotBeforeDrags, frozen,
    });
    if (frozen) {
      manifest.flags.push(
        `EXPLORE_FROZEN${currentGroup ? ` [view: ${currentGroup}]` : ''}: ` +
          `${changedPx < 0 ? 'frames byte-identical' : `only ${changedPx}px changed over 1s (floor ${MOTION_FLOOR_PX}px)`} (Rule 37)`,
      );
    }
  };

  try {
    await page.goto(pageUrl, { waitUntil: 'load', timeout: 30000 });

    // Sim boot: PM_simTimeMs appears on the iframe window once the renderer runs.
    await page
      .waitForFunction(
        () => {
          const f = document.getElementById('sim') as HTMLIFrameElement | null;
          try {
            const w = f?.contentWindow as (Window & { PM_simTimeMs?: number }) | null | undefined;
            return w != null && typeof w.PM_simTimeMs === 'number';
          } catch {
            return false;
          }
        },
        undefined,
        { timeout: 25000 },
      )
      .catch(() => {
        manifest.flags.push('SIM_BOOT_TIMEOUT: PM_simTimeMs never appeared — sim may not have loaded');
      });
    await page.waitForTimeout(1500); // brand curtain settle

    const cards = page.locator('#rail .card');
    const stateCount = await cards.count();
    manifest.stateCount = stateCount;
    if (stateCount === 0) {
      manifest.flags.push('NO_RAIL_CARDS: state rail is empty — player did not build');
    }
    for (let i = 0; i < stateCount; i++) {
      manifest.stateTitles.push(((await cards.nth(i).textContent()) ?? '').trim());
    }

    const findSimFrame = (): Frame | null =>
      page.frames().find((f) => f !== page.mainFrame() && f.url() !== 'about:blank') ?? null;

    // Trusted drag on every visible slider of the CURRENT state (Stage-0 harness gap:
    // the dead-guided-slider class lives in scripted states, not explore — drag everywhere).
  /**
   * The scene_group picker (field_3d Δ10) lives INSIDE the sim iframe as
   * #vg_scene_group_select. A state that declares no groups returns [] and every
   * caller falls back to a single unpartitioned pass — so an ordinary concept
   * behaves exactly as it did before this existed.
   */
  const sceneGroupOptions = async (): Promise<string[]> => {
    const simFrame = findSimFrame();
    if (!simFrame) return [];
    const sel = simFrame.locator('#vg_scene_group_select');
    if ((await sel.count()) === 0) return [];
    return (await sel.locator('option').all()).length
      ? await sel.locator('option').evaluateAll((os: Element[]) => os.map((o) => (o as HTMLOptionElement).value))
      : [];
  };

  const selectSceneGroup = async (value: string): Promise<void> => {
    const simFrame = findSimFrame();
    if (!simFrame) return;
    await simFrame.locator('#vg_scene_group_select').selectOption(value);
    await page.waitForTimeout(1200); // let the group swap settle before measuring
  };

    const dragVisibleSliders = async (stateNum: number, prefix: string): Promise<number> => {
      const simFrame = findSimFrame();
      if (!simFrame) {
        manifest.flags.push(`NO_SIM_FRAME: could not locate the sim iframe in state ${stateNum}`);
        return 0;
      }
      const sliders = simFrame.locator('input[type="range"]:visible');
      const n = await sliders.count();
      for (let s = 0; s < n; s++) {
        const el = sliders.nth(s);
        const id = (await el.getAttribute('id')) ?? `slider_${s}`;
        const box = await el.boundingBox();
        if (!box) continue;
        const valueBefore = (await el.inputValue()) ?? '';
        const beforeFile = `${prefix}_${id}_before.png`;
        await page.screenshot({ path: join(outDir, beforeFile) });

        const y = box.y + box.height / 2;
        await page.mouse.move(box.x + box.width * 0.15, y);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.85, y, { steps: 12 });
        await page.mouse.up();
        const valueAtRelease = (await el.inputValue()) ?? '';
        await page.waitForTimeout(1200);

        const valueAfter = (await el.inputValue()) ?? '';
        const afterFile = `${prefix}_${id}_after.png`;
        await page.screenshot({ path: join(outDir, afterFile) });
        const reverted = valueAtRelease !== valueBefore && valueAfter !== valueAtRelease;
        if (reverted) {
          manifest.flags.push(
            `SLIDER_CLOBBERED: ${id} in state ${stateNum} took the drag (${valueAtRelease}) then reverted to ${valueAfter}`,
          );
        }
        manifest.sliderDrags.push({
          sliderId: id,
          state: stateNum,
          before: beforeFile,
          after: afterFile,
          valueBefore,
          valueAtRelease,
          valueAfter,
          moved: valueBefore !== valueAfter,
          reverted,
          sceneGroup: currentGroup,
        });
      }
      return n;
    };

    // Overlay-vs-chrome collision probe (Stage-0 harness gap: THE EYE shoots the raw sim,
    // so review-chrome collisions are invisible to every gate but this one). Measures the
    // sim iframe's fixed-position overlays + .pm_hud statics against the player's glass
    // buttons in PAGE coordinates.
    const CHROME_SELECTORS = ['#fsBtn', '#wgBtn', '#fsCleanBtn', '#simPenBar'];
    const probeChromeCollisions = async (stateNum: number): Promise<void> => {
      const simFrame = findSimFrame();
      if (!simFrame) return;
      const chrome = await page.evaluate((sels) => {
        const out: { sel: string; x: number; y: number; w: number; h: number }[] = [];
        for (const sel of sels) {
          const el = document.querySelector(sel);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none') {
            out.push({ sel, x: r.x, y: r.y, w: r.width, h: r.height });
          }
        }
        const iframeEl = document.getElementById('sim');
        const ir = iframeEl ? iframeEl.getBoundingClientRect() : { x: 0, y: 0 };
        return { chrome: out, iframeX: ir.x, iframeY: ir.y };
      }, CHROME_SELECTORS);
      const overlays = await simFrame.evaluate(() => {
        const out: { name: string; x: number; y: number; w: number; h: number }[] = [];
        const seen = new Set<Element>();
        const candidates = [
          ...Array.from(document.querySelectorAll('.pm_hud')),
          ...Array.from(document.querySelectorAll('div, canvas')).filter(
            (el) => getComputedStyle(el).position === 'fixed',
          ),
        ];
        for (const el of candidates) {
          if (seen.has(el)) continue;
          seen.add(el);
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 8 || r.height < 8) continue;
          out.push({
            name: el.id || el.className.toString().split(' ')[0] || el.tagName.toLowerCase(),
            x: r.x,
            y: r.y,
            w: r.width,
            h: r.height,
          });
        }
        return out;
      });
      for (const ov of overlays) {
        const ox = ov.x + chrome.iframeX;
        const oy = ov.y + chrome.iframeY;
        for (const ch of chrome.chrome) {
          const w = Math.min(ox + ov.w, ch.x + ch.w) - Math.max(ox, ch.x);
          const h = Math.min(oy + ov.h, ch.y + ch.h) - Math.max(oy, ch.y);
          if (w > 4 && h > 4) {
            manifest.overlayCollisions.push({
              state: stateNum,
              overlay: ov.name,
              chrome: ch.sel,
              overlapPx: { w: Math.round(w), h: Math.round(h) },
            });
          }
        }
      }
    };

    // ── Per-state walk: click card (enters paused at t=0), Play, sample, probe, drag. ──
    for (let i = 0; i < stateCount; i++) {
      await cards.nth(i).click();
      await page.waitForTimeout(1400); // STATE_REACHED + first paint
      await shoot(i + 1, 'enter_t0', `S${i + 1}_t0`);
      await probeChromeCollisions(i + 1);

      await page.locator('#playBtn').click();
      await page.waitForTimeout(2500);
      await shoot(i + 1, 'playing_mid', `S${i + 1}_mid`);
      // Drag mid-play so a scripted ramp that clobbers manual input shows as `reverted`.
      await dragVisibleSliders(i + 1, `S${i + 1}`);
      await page.waitForTimeout(2300);
      await shoot(i + 1, 'playing_late', `S${i + 1}_late`);
    }

    // ── Explore state (last card): ONCE PER SCENE GROUP. ──
    //   A group-partitioned explore state is TWO sandboxes behind one card. This
    //   walk used to visit only the authored default, and the non-default group's
    //   slider rows are display:none while it is unselected — so `:visible` never
    //   matched them and the entire other view went ungated. That blind spot hid a
    //   frozen view through three Checkpoint-B cycles AND the CRITICAL introduced
    //   by the fix for it (bug_class every_visual_gate_captures_only_the_default_
    //   scene_group_so_a_partitioned_explore_states_other_view_is_ungated).
    //
    //   ORDER IS PART OF THE CLAIM: probe, THEN drag. Dragging first seizes the
    //   knob, and the probe then measures a scene this harness froze itself.
    if (stateCount > 0) {
      const exploreIdx = stateCount - 1;
      await cards.nth(exploreIdx).click();
      await page.waitForTimeout(1400);
      await page.locator('#playBtn').click();
      // Let the narration/timeline run out so we test the post-narration sandbox.
      await page.waitForTimeout(9000);

      const groups = await sceneGroupOptions();
      manifest.exploreSceneGroups = groups;
      // [] = unpartitioned: one pass with currentGroup null, exactly as before.
      const passes: (string | null)[] = groups.length ? groups : [null];

      let draggedTotal = 0;
      for (const g of passes) {
        currentGroup = g;
        if (g !== null) {
          await selectSceneGroup(g);
          await shoot(exploreIdx + 1, `explore_view_${g}`, `explore_${g}_enter`);
        }
        // BEFORE any drag in this view — see motionProbe()'s contract.
        await motionProbe(g ?? 'explore', true);
        draggedTotal += await dragVisibleSliders(exploreIdx + 1, `explore${g ? `_${g}` : ''}`);
      }
      currentGroup = null;

      if (draggedTotal === 0) {
        manifest.flags.push('NO_VISIBLE_SLIDERS_IN_EXPLORE: explore state exposes no sliders');
      }
      // A declared group that surfaced no control of its own is a coverage hole,
      // not a pass: the picker promised a view this walk could not exercise.
      for (const g of groups) {
        if (!manifest.sliderDrags.some((d) => d.sceneGroup === g)) {
          manifest.flags.push(`SCENE_GROUP_UNEXERCISED: view "${g}" declared but exposed no draggable control`);
        }
      }
    }
  } finally {
    await browser.close();
  }

  writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`founder_drive done: ${outDir}`);
  console.log(
    `  states=${manifest.stateCount} shots=${manifest.shots.length} drags=${manifest.sliderDrags.length} ` +
      `collisions=${manifest.overlayCollisions.length} flags=${manifest.flags.length} ` +
      `groups=${manifest.exploreSceneGroups.length || 1} probes=${manifest.motionProbes.length} ` +
      `consoleErrors=${manifest.consoleErrors.length}`,
  );
  for (const c of manifest.overlayCollisions) {
    console.log(`  COLLISION: S${c.state} ${c.overlay} x ${c.chrome} (${c.overlapPx.w}x${c.overlapPx.h}px)`);
  }
  for (const mp of manifest.motionProbes) {
    console.log(
      `  MOTION${mp.sceneGroup ? ` [${mp.sceneGroup}]` : ''}: ` +
        `${mp.changedPx < 0 ? 'unmeasured' : `${mp.changedPx}px (${(mp.ratio * 100).toFixed(3)}%)`} over 1s ` +
        `— ${mp.frozen ? 'FROZEN' : 'moving'} (shot ${mp.shotBeforeDrags ? 'before' : 'AFTER'} drags)`,
    );
  }
  for (const f of manifest.flags) console.log(`  FLAG: ${f}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
