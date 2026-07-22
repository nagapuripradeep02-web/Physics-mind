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
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';

interface Shot {
  state: number;
  action: string;
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
  motionProbe: { frameA: string; frameB: string; bytesEqual: boolean } | null;
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
    motionProbe: null,
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

  const shoot = async (state: number, action: string, name: string): Promise<void> => {
    const file = `${name}.png`;
    await page.screenshot({ path: join(outDir, file) });
    manifest.shots.push({ state, action, file, simTimeMs: await simTime(page) });
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

    // ── Explore state (last card): post-narration sandbox re-drag + Rule-37 motion probe. ──
    if (stateCount > 0) {
      const exploreIdx = stateCount - 1;
      await cards.nth(exploreIdx).click();
      await page.waitForTimeout(1400);
      await page.locator('#playBtn').click();
      // Let the narration/timeline run out so we test the post-narration sandbox.
      await page.waitForTimeout(9000);
      const dragged = await dragVisibleSliders(exploreIdx + 1, 'explore');
      if (dragged === 0) {
        manifest.flags.push('NO_VISIBLE_SLIDERS_IN_EXPLORE: explore state exposes no sliders');
      }

      // Rule-37 probe: two frames 1s apart, long after narration end. Byte-equal
      // PNGs from a live renderer = the explore state froze (the exact pre-1d63d79
      // failure). founder-proxy judges; we only record.
      const fa = 'motion_probe_a.png';
      const fb = 'motion_probe_b.png';
      await page.screenshot({ path: join(outDir, fa) });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: join(outDir, fb) });
      const bytesEqual = readFileSync(join(outDir, fa)).equals(readFileSync(join(outDir, fb)));
      manifest.motionProbe = { frameA: fa, frameB: fb, bytesEqual };
      if (bytesEqual) manifest.flags.push('EXPLORE_FROZEN: motion probe frames are byte-identical (Rule 37)');
    }
  } finally {
    await browser.close();
  }

  writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`founder_drive done: ${outDir}`);
  console.log(
    `  states=${manifest.stateCount} shots=${manifest.shots.length} drags=${manifest.sliderDrags.length} ` +
      `collisions=${manifest.overlayCollisions.length} flags=${manifest.flags.length} ` +
      `consoleErrors=${manifest.consoleErrors.length}`,
  );
  for (const c of manifest.overlayCollisions) {
    console.log(`  COLLISION: S${c.state} ${c.overlay} x ${c.chrome} (${c.overlapPx.w}x${c.overlapPx.h}px)`);
  }
  for (const f of manifest.flags) console.log(`  FLAG: ${f}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
