/**
 * MEASUREMENT HARNESS for collision_theory_activation_energy (P1 #4).
 *   npx tsx --env-file=.env.local src/scripts/measure_collision_theory.ts
 *
 * Same vm-driven approach as check_gas_reaction_physics.ts: run the EMITTED
 * renderer body headlessly and DRIVE stepGas(), so every number this concept
 * narrates is MEASURED on the shipped engine, never computed from theory.
 *
 * Design-stage questions this answers, in order:
 *   Q1  What Ea (in kT of ea_ref_T) gives a legible "most collisions fail"
 *       fraction at the opening temperature?
 *   Q2  How much does the success FRACTION move with temperature, and does the
 *       collision RATE move too (they are different claims)?
 *   Q3  Does concentration/volume move the collision rate while leaving the
 *       fraction flat? (the contrast that separates frequency from energy)
 *   Q4  Catalyst: how far does the fraction jump when Ea drops?
 *   Q5  With the reaction layer on and both barriers equal, how big is the gap
 *       between "clears Ea" and "actually reacts"? (the partner requirement —
 *       the engine's honest stand-in for the orientation factor)
 *   Q6  Histogram tail threshold sqrt(2Ea/m) vs the counter's line-of-centres
 *       criterion: how far apart are those two numbers on screen?
 *   Q7  Is the Ea slider's missing userTouched guard a real defect?
 *   Q8  Arrhenius: is ln(fraction) linear in 1/T with slope -Ea/k?
 */
import vm from 'node:vm';
import { PARTICLE_FIELD_RENDERER_CODE } from '@/lib/renderers/particle_field_renderer';

const noop = () => {};
const ctx: Record<string, unknown> = {
  console,
  max: (...a: number[]) => Math.max(...a),
  min: (...a: number[]) => Math.min(...a),
  floor: Math.floor, ceil: Math.ceil, round: Math.round, abs: Math.abs,
  sqrt: Math.sqrt, pow: Math.pow, atan2: Math.atan2, cos: Math.cos, sin: Math.sin,
  exp: Math.exp, log: Math.log, tan: Math.tan, sq: (x: number) => x * x,
  constrain: (v: number, a: number, b: number) => Math.min(Math.max(v, a), b),
  dist: (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x2 - x1, y2 - y1),
  lerp: (a: number, b: number, t: number) => a + (b - a) * t,
  map: (v: number, a: number, b: number, c: number, d: number) => c + (d - c) * ((v - a) / (b - a)),
  random: () => 0.5,
  TWO_PI: Math.PI * 2, PI: Math.PI, HALF_PI: Math.PI / 2, QUARTER_PI: Math.PI / 4,
  createCanvas: noop, frameRate: noop, background: noop, noStroke: noop, stroke: noop,
  fill: noop, noFill: noop, rect: noop, circle: noop, ellipse: noop, line: noop,
  text: noop, textAlign: noop, textSize: noop, textFont: noop, textWidth: () => 10,
  beginShape: noop, vertex: noop, endShape: noop, strokeWeight: noop, push: noop, pop: noop,
  translate: noop, rotate: noop, arc: noop, triangle: noop, quad: noop, point: noop,
  curveVertex: noop, bezierVertex: noop, bezier: noop, strokeCap: noop, strokeJoin: noop,
  rectMode: noop, ellipseMode: noop, imageMode: noop, noLoop: noop, loop: noop, redraw: noop,
  color: (c: unknown) => c, colorMode: noop, blendMode: noop, clear: noop, cursor: noop,
  LEFT: 'left', RIGHT: 'right', CENTER: 'center', TOP: 'top', BOTTOM: 'bottom',
  BASELINE: 'baseline', ROUND: 'round', SQUARE: 'square', PROJECT: 'project',
  CLOSE: 'close', CORNER: 'corner', RADIUS: 'radius', BLEND: 'blend', ADD: 'add',
  width: 900, height: 560, deltaTime: 1000 / 60, frameCount: 0,
  windowWidth: 900, windowHeight: 560, millis: () => 0, mouseX: 0, mouseY: 0,
  drawingContext: { setLineDash: noop, shadowBlur: 0, shadowColor: '', createLinearGradient: () => ({ addColorStop: noop }) },
  document: {
    getElementById: () => null,
    createElement: () => ({ style: {}, appendChild: noop, setAttribute: noop, classList: { add: noop, remove: noop } }),
    querySelectorAll: () => [],
    querySelector: () => null,
    body: { appendChild: noop },
    addEventListener: noop,
  },
  addEventListener: noop, postMessage: noop, parent: { postMessage: noop },
  requestAnimationFrame: noop, setTimeout: noop, clearTimeout: noop,
};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(PARTICLE_FIELD_RENDERER_CODE, ctx);

type Ctx = Record<string, any>;
const R = ctx as Ctx;

const SEED = 246813579;
const SPEED_SCALE = 0.105;   // the value dynamic_equilibrium / le_chatelier both ship
const REF_T = 300;

interface Opts {
  T?: number;
  N?: number;
  eaKT?: number | null;
  reaction?: boolean;
  rxEaKT?: number;
  bondKT?: number;
  piston?: number;
  seed?: number;
  counts?: Record<string, number>;
  eaSlider?: { min: number; max: number; default: number } | null;
  stateOver?: Record<string, unknown>;
}

function makeConfig(o: Opts = {}) {
  const N = o.N ?? 180;
  const species: Ctx[] = [
    { id: 'A', mass: 1, radius: 5, color: '#60A5FA', label: 'A', count: Math.round(N / 2) },
    { id: 'B', mass: 1, radius: 5, color: '#F472B6', label: 'B', count: Math.round(N / 2) },
  ];
  if (o.reaction) species.push({ id: 'AB', mass: 2, radius: 7.0710678, color: '#C084FC', label: 'AB', count: 0 });

  const gas: Ctx = {
    count: N,
    temperature_K: REF_T,
    ea_ref_T: REF_T,
    speed_scale: SPEED_SCALE,
    species,
  };
  if (o.eaKT !== null && o.eaKT !== undefined) gas.activation_energy_kT = o.eaKT;
  if (o.reaction) {
    gas.reaction = {
      enabled: true, reactants: ['A', 'B'], product: 'AB',
      activation_fwd_kT: o.rxEaKT ?? 3.0,
      bond_energy_kT: o.bondKT ?? 2.1,
      reverse_attempt_per_s: 8,
      inject: 'A',
    };
  }

  const sliders: Ctx = {
    T: { label: 'Temperature', min: 200, max: 900, step: 10, default: REF_T, unit: 'K' },
  };
  if (o.eaSlider) sliders.Ea = { label: 'Activation energy', ...o.eaSlider };

  const state: Ctx = { label: 'STATE_1', T: o.T ?? REF_T, ...(o.stateOver ?? {}) };
  if (o.N !== undefined) state.N = o.N;
  if (o.piston !== undefined) state.piston_frac = o.piston;
  if (o.counts) state.species_counts = o.counts;

  return {
    scenario_type: 'gas_box',
    design: { background: '#0A0A1A', phys_seed: o.seed ?? SEED },
    canvas: { width: 900, height: 560 },
    gas,
    slider_controls: sliders,
    states: { STATE_1: state },
  };
}

function boot(cfg: unknown) {
  R.config = cfg;
  R.PM_currentState = 'STATE_1';
  R.PM_simTimeMs = 0;
  R.userParams = {};
  R.userTouched = {};
  R.cueFiredAt = {};
  R.particles = [];
  R.PHYS_SEED = (cfg as Ctx).design.phys_seed;
  R.physRand = R.mulberry32(R.PHYS_SEED);
  R.gasInit();
}
function run(ticks: number) {
  const st = R.config.states.STATE_1;
  for (let i = 0; i < ticks; i++) R.stepGas(st);
}
function counts() {
  const c: Record<string, number> = {};
  for (const p of R.particles) {
    const id = R.gasSpecies[p.sp].id;
    c[id] = (c[id] || 0) + 1;
  }
  return c;
}

/**
 * Run `secs` of simulated time after a `warm` warm-up and return the CUMULATIVE
 * totals over the measured window — never the instantaneous rolling rate, which
 * is Poisson-noisy by construction (the renderer's own comment says so).
 */
function measure(cfg: unknown, warm = 180, secs = 30) {
  boot(cfg);
  run(warm);
  const c0 = R.gasCollTotal, s0 = R.gasSuccessTotal;
  const f0 = R.gasRxFwdTotal ?? 0, r0 = R.gasRxRevTotal ?? 0;
  const ticks = Math.round(secs * 60);
  run(ticks);
  const coll = R.gasCollTotal - c0, succ = R.gasSuccessTotal - s0;
  const fwd = (R.gasRxFwdTotal ?? 0) - f0, rev = (R.gasRxRevTotal ?? 0) - r0;
  return {
    collPerS: coll / secs,
    succPerS: succ / secs,
    frac: coll > 0 ? succ / coll : 0,
    fwdPerS: fwd / secs,
    revPerS: rev / secs,
    coll, succ, fwd, rev,
    T: R.gasMeasuredT(),
    counts: counts(),
    eaRaw: R.gasActivationE(R.config.states.STATE_1),
  };
}

/** Median over N seeds — every headline number in this concept is seed-swept. */
function sweepSeeds(mk: (seed: number) => unknown, seeds = 5, warm = 180, secs = 30) {
  const runs: ReturnType<typeof measure>[] = [];
  for (let i = 0; i < seeds; i++) runs.push(measure(mk(SEED + i * 7919), warm, secs));
  const pick = (f: (r: typeof runs[0]) => number) => {
    const v = runs.map(f).sort((a, b) => a - b);
    return { med: v[Math.floor(v.length / 2)], lo: v[0], hi: v[v.length - 1] };
  };
  return {
    collPerS: pick(r => r.collPerS),
    succPerS: pick(r => r.succPerS),
    frac: pick(r => r.frac),
    fwdPerS: pick(r => r.fwdPerS),
    runs,
  };
}

const line = (s: string) => console.log(s);
const pct = (x: number) => (100 * x).toFixed(2) + '%';

line('═'.repeat(78));
line('COLLISION THEORY — measurement run (' + new Date(0).toISOString().slice(0, 0) + 'headless, emitted renderer)');
line('speed_scale ' + SPEED_SCALE + ' · ea_ref_T ' + REF_T + ' K · seed sweep 5 · 30 s windows after 3 s warm-up');
line('═'.repeat(78));

// ── Q1 — pick Ea: what fraction clears each barrier height at 300 K? ────────
line('\n── Q1  Barrier height sweep at T = 300 K (N = 180, no reaction) ──');
line('  Ea/kT   collisions/s        clear/s          fraction        theory e^-Ea/kT');
for (const ea of [1, 1.5, 2, 2.5, 3, 4, 5]) {
  const s = sweepSeeds(seed => makeConfig({ eaKT: ea, seed }));
  line(
    `  ${String(ea).padEnd(6)}  ${s.collPerS.med.toFixed(0).padStart(5)} (${s.collPerS.lo.toFixed(0)}–${s.collPerS.hi.toFixed(0)})`.padEnd(34) +
    `${s.succPerS.med.toFixed(1).padStart(6)}`.padEnd(17) +
    `${pct(s.frac.med).padStart(7)} (${pct(s.frac.lo)}–${pct(s.frac.hi)})`.padEnd(26) +
    `${pct(Math.exp(-ea))}`
  );
}

// ── Q2 — temperature sweep at fixed Ea ─────────────────────────────────────
line('\n── Q2  Temperature sweep, Ea = 3 kT(300 K) fixed (N = 180) ──');
line('   T(K)   collisions/s      clear/s        fraction          x vs 300 K');
const tBase = sweepSeeds(seed => makeConfig({ eaKT: 3, T: 300, seed }));
for (const T of [250, 300, 400, 500, 600, 800]) {
  const s = sweepSeeds(seed => makeConfig({ eaKT: 3, T, seed }));
  line(
    `  ${String(T).padStart(4)}   ${s.collPerS.med.toFixed(0).padStart(5)}`.padEnd(24) +
    `${s.succPerS.med.toFixed(1).padStart(7)}`.padEnd(15) +
    `${pct(s.frac.med).padStart(7)} (${pct(s.frac.lo)}–${pct(s.frac.hi)})`.padEnd(26) +
    `rate x${(s.succPerS.med / Math.max(tBase.succPerS.med, 1e-9)).toFixed(2)}  frac x${(s.frac.med / Math.max(tBase.frac.med, 1e-9)).toFixed(2)}`
  );
}

// ── Q3 — concentration and volume: frequency moves, fraction should not ────
line('\n── Q3  Concentration (N) at T = 300 K, Ea = 3 kT — does the FRACTION hold? ──');
line('     N    collisions/s      clear/s        fraction');
for (const N of [90, 130, 180, 260, 360]) {
  const s = sweepSeeds(seed => makeConfig({ eaKT: 3, N, seed }));
  line(`  ${String(N).padStart(4)}   ${s.collPerS.med.toFixed(0).padStart(5)}`.padEnd(24) +
    `${s.succPerS.med.toFixed(1).padStart(7)}`.padEnd(15) +
    `${pct(s.frac.med).padStart(7)} (${pct(s.frac.lo)}–${pct(s.frac.hi)})`);
}
line('\n── Q3b Volume (piston) at T = 300 K, N = 180, Ea = 3 kT ──');
line('  piston  collisions/s      clear/s        fraction');
for (const pv of [1.0, 0.75, 0.55, 0.4]) {
  const s = sweepSeeds(seed => makeConfig({ eaKT: 3, piston: pv, seed }));
  line(`  ${pv.toFixed(2).padStart(5)}   ${s.collPerS.med.toFixed(0).padStart(5)}`.padEnd(24) +
    `${s.succPerS.med.toFixed(1).padStart(7)}`.padEnd(15) +
    `${pct(s.frac.med).padStart(7)} (${pct(s.frac.lo)}–${pct(s.frac.hi)})`);
}

// ── Q4 — catalyst: drop Ea at fixed T ──────────────────────────────────────
line('\n── Q4  Catalyst — lower Ea at fixed T = 300 K, N = 180 ──');
line('  Ea/kT   clear/s     fraction      x vs Ea = 3');
const catBase = sweepSeeds(seed => makeConfig({ eaKT: 3, seed }));
for (const ea of [3, 2.4, 2, 1.5, 1]) {
  const s = sweepSeeds(seed => makeConfig({ eaKT: ea, seed }));
  line(`  ${String(ea).padEnd(6)} ${s.succPerS.med.toFixed(1).padStart(7)}`.padEnd(22) +
    `${pct(s.frac.med).padStart(7)}`.padEnd(15) +
    `x${(s.succPerS.med / Math.max(catBase.succPerS.med, 1e-9)).toFixed(2)}`);
}

// ── Q5 — reaction ON, both barriers EQUAL: clears-Ea vs actually-reacts ────
line('\n── Q5  Reaction ON, activation_energy_kT == activation_fwd_kT == 3 ──');
line('     the gap between "clears Ea" and "reacts" is the PARTNER requirement');
line('   T(K)  collisions/s   clear/s   reacts(fwd)/s   reacts / clears   AB@30s');
for (const T of [300, 400, 500, 600]) {
  const s = sweepSeeds(seed => makeConfig({ eaKT: 3, rxEaKT: 3, reaction: true, T, seed, counts: { A: 90, B: 90, AB: 0 } }));
  const last = s.runs[0];
  line(`  ${String(T).padStart(4)}  ${s.collPerS.med.toFixed(0).padStart(6)}`.padEnd(18) +
    `${s.succPerS.med.toFixed(1).padStart(8)}`.padEnd(12) +
    `${s.fwdPerS.med.toFixed(2).padStart(9)}`.padEnd(16) +
    `${pct(s.fwdPerS.med / Math.max(s.succPerS.med, 1e-9)).padStart(8)}`.padEnd(19) +
    `${last.counts.AB ?? 0}`);
}

// ── Q6 — the two thresholds on screen ──────────────────────────────────────
line('\n── Q6  Histogram tail threshold vs the counter criterion (author trap) ──');
boot(makeConfig({ eaKT: 3 }));
{
  const eaRaw = R.gasActivationE(R.config.states.STATE_1);
  const m = 1;
  const vEa = Math.sqrt(2 * eaRaw / m);                      // what the histogram shades
  const sig = R.gasSigma(m, 300);
  // fraction of single particles above vEa in a 2D Rayleigh: exp(-v^2/2sig^2)
  const singleFrac = Math.exp(-(vEa * vEa) / (2 * sig * sig));
  line(`  Ea(raw px/tick energy) = ${eaRaw.toFixed(4)}   sigma(m=1, 300 K) = ${sig.toFixed(4)}`);
  line(`  histogram shades v > sqrt(2Ea/m) = ${vEa.toFixed(4)}  =  ${(vEa / sig).toFixed(2)} sigma`);
  line(`  => single particles above that speed: ${pct(singleFrac)}`);
  line(`  => collisions clearing Ea along line of centres: ${pct(catBase.frac.med)}  (measured)`);
  line('  These are DIFFERENT questions and must never be narrated as one number.');
}

// ── Q7 — is the Ea slider override a real defect? ──────────────────────────
line('\n── Q7  Ea slider: does declaring it override the state\'s authored Ea? ──');
{
  const withSlider = measure(makeConfig({ eaKT: 3, eaSlider: { min: 0, max: 20, default: 6.6 } }), 180, 20);
  const noSlider = measure(makeConfig({ eaKT: 3 }), 180, 20);
  line(`  authored activation_energy_kT: 3  (= ${noSlider.eaRaw.toFixed(4)} raw)`);
  line(`  Ea used with NO slider declared : ${noSlider.eaRaw.toFixed(4)}   fraction ${pct(noSlider.frac)}`);
  line(`  Ea used WITH slider declared    : ${withSlider.eaRaw.toFixed(4)}   fraction ${pct(withSlider.frac)}`);
  const defect = Math.abs(withSlider.eaRaw - noSlider.eaRaw) > 1e-9;
  line(`  => slider overrides authored Ea with NO userTouched guard: ${defect ? 'YES — DEFECT' : 'no'}`);
  line(`  => and the slider value is read as RAW px/tick energy, not kT: a teacher-facing`);
  line(`     control would be labelled in numbers nobody can reason about (Rule 33d).`);
}

// ── Q8 — Arrhenius linearity ───────────────────────────────────────────────
line('\n── Q8  Arrhenius: is ln(fraction) linear in 1/T with slope -Ea/k? ──');
line('   T(K)      1/T        fraction       ln(frac)     predicted ln = -3*(300/T)');
for (const T of [250, 300, 400, 500, 600, 800]) {
  const s = sweepSeeds(seed => makeConfig({ eaKT: 3, T, seed }), 5, 180, 40);
  const lnf = Math.log(Math.max(s.frac.med, 1e-12));
  line(`  ${String(T).padStart(4)}   ${(1 / T).toFixed(5)}   ${pct(s.frac.med).padStart(8)}     ${lnf.toFixed(3).padStart(7)}      ${(-3 * (300 / T)).toFixed(3)}`);
}

line('\n' + '═'.repeat(78));
line('done — every figure above is measured on the emitted renderer, not computed.');
line('═'.repeat(78));
