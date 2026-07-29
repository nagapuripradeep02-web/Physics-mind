/**
 * Render the gas_box instrument panel to real PNGs and LOOK at it.
 *   npx tsx --env-file=.env.local src/scripts/probe_gas_instruments.ts
 *   -> /tmp/arrh_probe/t*.png
 *
 * WHY THIS EXISTS. check:gas-reaction drives the physics and proves the numbers;
 * it cannot see a pixel. Every one of the four defects below was green across
 * tsc, check:renderer-syntax, check:renderer-backticks and all 51 physics checks,
 * and every one was found by rendering a frame and cropping it:
 *
 *   1. the collision counter sat UNDER the #pm-formula chip, hiding the
 *      percentage -- the one number on it that is safe to narrate
 *   2. the fit was drawn from 3 crowded early points and printed "slope -410 K"
 *      beside "law -900 K", under a caption reading "one straight line"
 *   3. the panel backing was 94% opaque, so drifting discs read as dirt inside
 *      an otherwise empty scatter plot
 *   4. Math.round emitted an ASCII hyphen beside a real Unicode minus in the
 *      same line, and the subscript-a was drawn but illegible at this size
 *
 * Keep it working. It is the cheapest way to re-check the gas instruments after
 * a renderer edit, and it needs no cache row, no concept JSON and no baseline.
 */
import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { assembleParticleFieldHtml } from '@/lib/renderers/particle_field_renderer';

const html = assembleParticleFieldHtml({
  scenario_type: 'gas_box',
  design: { background: '#0A0A1A', phys_seed: 246813579 },
  canvas: { width: 900, height: 560 },
  gas: {
    count: 180, temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105, hist_ref_T: 300,
    activation_energy_kT: 3,
    species: [
      { id: 'A', mass: 1, radius: 5, color: '#60A5FA', label: 'A', count: 90 },
      { id: 'B', mass: 1, radius: 5, color: '#F472B6', label: 'B', count: 90 },
    ],
  },
  states: {
    STATE_1: {
      label: 'STATE_1', caption: 'One straight line',
      T: 800, T_from: 250, T_ramp_ms: 40000, adiabatic: false,
      species_counts: { A: 90, B: 90 },
      show_arrhenius_plot: true, arrhenius_window_ms: 4000,
      arrhenius_T_min: 250, arrhenius_T_max: 800,
      show_collision_counter: true, show_gas_thermometer: true,
      formula_overlay: 'ln f = c − Eₐ/kT',
    },
  },
} as never);
writeFileSync('/tmp/arrh_probe/sim.html', html);

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 620 } });
  await p.goto('file:///tmp/arrh_probe/sim.html');
  await p.waitForTimeout(1200);
  await p.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_1' }, '*'));
  await p.waitForTimeout(400);
  for (const t of [4000, 12000, 22000, 34000]) {
    await p.evaluate((ms) => window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: ms }, '*'), t);
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `/tmp/arrh_probe/t${String(t).padStart(5, '0')}.png` });
    console.log('captured', t, 'PM_simTimeMs =', await p.evaluate(() => (window as never as Record<string, number>).PM_simTimeMs));
  }
  await b.close();
})();
