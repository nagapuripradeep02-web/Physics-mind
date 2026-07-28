/**
 * CONSERVATION GATE for the gas_box reaction layer (A + B <-> AB).
 *   npm run check:gas-reaction
 *
 * Runs the EMITTED renderer body in a vm context with p5 stubs and drives
 * stepGas() directly — no browser, no pixels, just the numbers that must hold.
 *
 * WHY THIS EXISTS. The gas_box session (2026-07-28) established that a green
 * deterministic gate proves frames are REPRODUCIBLE, not correct: THE EYE
 * passed 31/31 twice over frames stepped by the wrong physics, and
 * validate:chemistry passed a sim whose gas heated 80x on a slider drag. Every
 * real defect was found by DRIVING the sim. This file drives it, in 4 seconds,
 * with no browser — and it caught two on its first run against the layer it
 * was written for:
 *
 *   1. gasSyncCount() pinned the particle count at N, so it DELETED
 *      dissociation fragments and minted fresh atoms to backfill merges.
 *      Measured over 60 s: A atoms 60 -> 68, B 60 -> 101, 60% of the box's
 *      energy gone. Invisible to every existing gate — it takes an atom count.
 *   2. Collision-activated dissociation made the reverse direction bimolecular
 *      like the forward one, so the density factors cancelled and compressing
 *      the box moved the product the WRONG WAY (41 -> 36). The reverse is now
 *      first-order Arrhenius (gasRxDecay) and compression roughly doubles it.
 *
 * The strongest check here is the exact one: fwd_total - rev_total must EQUAL
 * the number of dimers on screen. A rate tolerance can be argued with; a
 * bookkeeping identity cannot.
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

function makeConfig(over: Record<string, unknown> = {}, stateOver: Record<string, unknown> = {}) {
  return {
    scenario_type: 'gas_box',
    design: { background: '#0A0A1A', phys_seed: 987654321 },
    canvas: { width: 900, height: 560 },
    gas: {
      count: 120,
      temperature_K: 400,
      speed_scale: 0.115,
      ea_ref_T: 400,
      species: [
        { id: 'A', mass: 1, radius: 5, color: '#60A5FA', label: 'A', count: 60 },
        { id: 'B', mass: 1, radius: 5, color: '#F472B6', label: 'B', count: 60 },
        { id: 'AB', mass: 2, radius: 7.0710678, color: '#E2E8F0', label: 'AB', count: 0 },
      ],
      reaction: {
        enabled: true, reactants: ['A', 'B'], product: 'AB',
        activation_fwd_kT: 1.2, bond_energy_kT: 2.0,
      },
      ...over,
    },
    slider_controls: {
      T: { label: 'Temperature', min: 200, max: 900, step: 10, default: 400, unit: 'K' },
      V: { label: 'Volume', min: 0.35, max: 1, step: 0.05, default: 1 },
      N: { label: 'Particles', min: 40, max: 200, step: 10, default: 120 },
    },
    states: { STATE_1: { label: 'STATE_1', T: 400, adiabatic: true, ...stateOver } },
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
  R.physRand = R.mulberry32(R.PHYS_SEED);   // exactly what rebuildScene() does
  R.gasInit();
}

function counts() {
  const c: Record<string, number> = {};
  for (const p of R.particles) {
    const id = R.gasSpecies[p.sp].id;
    c[id] = (c[id] || 0) + 1;
  }
  return { A: c.A || 0, B: c.B || 0, AB: c.AB || 0 };
}
function momentum() {
  let px = 0, py = 0;
  for (const p of R.particles) {
    const m = R.gasSpecies[p.sp].mass;
    px += m * p.vx; py += m * p.vy;
  }
  return Math.hypot(px, py);
}
function run(ticks: number) {
  const st = R.config.states.STATE_1;
  for (let i = 0; i < ticks; i++) R.stepGas(st);
}

const fail: string[] = [];
function check(name: string, ok: boolean, detail: string) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
  if (!ok) fail.push(name);
}

// ── 1. mass/atom bookkeeping + momentum + energy ledger (adiabatic, parked) ──
boot(makeConfig());
const c0 = counts();
const totalA0 = c0.A + c0.AB, totalB0 = c0.B + c0.AB;
const led0 = R.gasEnergyLedger(R.config.states.STATE_1);
const mom0 = momentum();
run(3600);                                   // 60 s
const c1 = counts();
const led1 = R.gasEnergyLedger(R.config.states.STATE_1);
const drift = Math.abs(led1 - led0) / Math.abs(led0 || 1);

check('atom conservation A', c1.A + c1.AB === totalA0, `${totalA0} -> ${c1.A + c1.AB}`);
check('atom conservation B', c1.B + c1.AB === totalB0, `${totalB0} -> ${c1.B + c1.AB}`);
check('energy ledger flat', drift < 0.01, `${led0.toFixed(3)} -> ${led1.toFixed(3)} (${(drift * 100).toFixed(3)}% drift)`);
check('no net drift', momentum() < Math.max(mom0 * 5, 1e-6), `|p| ${mom0.toExponential(2)} -> ${momentum().toExponential(2)}`);
check('reaction actually ran', R.gasRxFwdTotal > 20 && R.gasRxRevTotal > 5, `fwd ${R.gasRxFwdTotal}, rev ${R.gasRxRevTotal}`);
console.log(`      composition ${JSON.stringify(c1)}  rates fwd ${R.gasRxFwdRate.toFixed(2)}/s rev ${R.gasRxRevRate.toFixed(2)}/s  T ${R.gasTempK.toFixed(0)} K`);

// ── 2. equilibrium: composition plateaus while BOTH rates keep running ──────
const eqA = counts().AB;
run(1800);
const eqB = counts().AB;
const plateau = Math.abs(eqB - eqA) <= Math.max(6, eqA * 0.18);
check('composition plateaus', plateau, `AB ${eqA} -> ${eqB} over 30 s`);
check('both directions live', R.gasRxFwdRate > 0.05 && R.gasRxRevRate > 0.05, `fwd ${R.gasRxFwdRate.toFixed(2)}/s rev ${R.gasRxRevRate.toFixed(2)}/s`);
// Exact bookkeeping identity: every dimer on screen is one net forward event,
// because the box started with zero product. Stronger than any rate tolerance —
// an instantaneous rate is Poisson-noisy, this cannot be noisy at all.
const netId = R.gasRxFwdTotal - R.gasRxRevTotal;
check('event ledger exact', netId === counts().AB, `fwd ${R.gasRxFwdTotal} - rev ${R.gasRxRevTotal} = ${netId}, AB on screen ${counts().AB}`);

// ── 3. Le Chatelier — temperature (exothermic forward: hotter = less product) ─
boot(makeConfig({ temperature_K: 350 }, { T: 350, adiabatic: false }));
run(4200);
const cold = counts().AB;
boot(makeConfig({ temperature_K: 750 }, { T: 750, adiabatic: false }));
run(4200);
const hot = counts().AB;
check('heat shifts exothermic back', hot < cold, `AB cold(350K) ${cold} vs hot(750K) ${hot}`);

// ── 4. Le Chatelier — pressure (2 particles -> 1, so squeezing makes product) ─
boot(makeConfig({ temperature_K: 500 }, { T: 500, adiabatic: false }));
run(4200);
const openBox = counts().AB;
boot(makeConfig({ temperature_K: 500 }, { T: 500, adiabatic: false, piston_frac: 0.45 }));
run(4200);
const squeezed = counts().AB;
check('compression makes product', squeezed > openBox, `AB open ${openBox} vs compressed(0.45) ${squeezed}`);

// ── 5. determinism: same seed, same trajectory ──────────────────────────────
boot(makeConfig());
run(900);
const sig1 = JSON.stringify(counts()) + '|' + R.particles.map((p: Ctx) => p.x.toFixed(6) + ',' + p.vx.toFixed(6)).join(';');
boot(makeConfig());
run(900);
const sig2 = JSON.stringify(counts()) + '|' + R.particles.map((p: Ctx) => p.x.toFixed(6) + ',' + p.vx.toFixed(6)).join(';');
check('deterministic re-run', sig1 === sig2, sig1 === sig2 ? 'identical after 900 ticks' : 'DIVERGED');

// ── 6. non-reaction config is untouched (kinetic_particle_theory's path) ────
const plain = makeConfig();
delete (plain.gas as Ctx).reaction;
(plain.gas as Ctx).species = [{ id: 'A', mass: 1, radius: 5, color: '#60A5FA', label: 'gas' }];
boot(plain);
const n0 = R.particles.length;
const ke0 = R.gasMeasuredT();
run(1800);
check('no-reaction path inert', R.gasRxOn() === false && R.particles.length === n0 && R.gasRxFwdTotal === 0,
  `rxOn ${R.gasRxOn()}, N ${n0} -> ${R.particles.length}, events ${R.gasRxFwdTotal}`);
check('plain gas holds T', Math.abs(R.gasMeasuredT() - ke0) / ke0 < 0.05, `T ${ke0.toFixed(0)} -> ${R.gasMeasuredT().toFixed(0)} K`);

// ── 7. per-state species_counts, and the claim the concept rests on ─────────
// dynamic_equilibrium's central evidence is that the SAME equilibrium is reached
// from pure product as from pure reactants. That is a claim about the engine, so
// it is checked here rather than asserted in narration: same atom inventory (90),
// same temperature, opposite starting side, plateaus must agree.
// An equilibrium FLUCTUATES — a single-instant count of ~25 dimers carries ~5
// counts of Poisson noise, so comparing two snapshots compares two samples of
// noise. Average over a window instead. (This also tells the author what the
// plateau line's visible wiggle will be: real, and not a defect to hide.)
function runMeanAB(settleTicks: number, windowTicks: number) {
  run(settleTicks);
  let sum = 0, n = 0;
  for (let i = 0; i < windowTicks; i++) {
    run(1);
    if (i % 30 === 0) { sum += counts().AB; n++; }
  }
  return sum / Math.max(n, 1);
}
// BOTH runs must be ISOTHERMAL and must hold the SAME atom inventory — the two
// mistakes this check made while being written, each of which produced a
// convincing false failure. Adiabatic, the exothermic forward self-heated the
// box to 650 K while the product-side run cooled to 150 K and froze solid;
// mismatched inventories (60+60 atoms vs 45+45) compared two different
// equilibria and called the difference a bug.
boot(makeConfig({ temperature_K: 500 }, { T: 500, adiabatic: false }));
const meanFromReactants = runMeanAB(5400, 5400);

const cfgAB = makeConfig({ temperature_K: 500 }, { T: 500, adiabatic: false });
(cfgAB.states.STATE_1 as Ctx).species_counts = { A: 0, B: 0, AB: 60 };
boot(cfgAB);
const opened = counts();
check('species_counts opens the state', opened.A === 0 && opened.B === 0 && opened.AB === 60,
  `A ${opened.A} B ${opened.B} AB ${opened.AB} at t=0`);
const meanFromProduct = runMeanAB(5400, 5400);
const gap = Math.abs(meanFromProduct - meanFromReactants);
check('same equilibrium from either side', gap <= Math.max(3, meanFromReactants * 0.18),
  `mean AB from reactants ${meanFromReactants.toFixed(1)} vs from product ${meanFromProduct.toFixed(1)} (gap ${gap.toFixed(1)})`);
const fromProduct = counts();
check('atoms conserved through species_counts', fromProduct.A + fromProduct.AB === 60 && fromProduct.B + fromProduct.AB === 60,
  `A-units ${fromProduct.A + fromProduct.AB}, B-units ${fromProduct.B + fromProduct.AB} (both must be 60)`);

// ── 8. the N tap must be a CHEMICAL operation in both directions ───────────
// Dragging N down used to truncate the particle array, which destroyed bonded
// pairs in place and left the atom inventory lopsided and unrecoverable
// (measured 90/90 -> 55/60 on one drag). Removal now mirrors injection and
// never breaks a bond to satisfy a count.
boot(makeConfig({ temperature_K: 500 }, { T: 500, adiabatic: false }));
run(2400);                                   // let some product form first
const beforeCut = counts();
const abBefore = beforeCut.AB;
R.userTouched.N = true;
R.userParams.N = 80;                         // drag N down from 120
run(1);                                      // ONE tick: the removal itself, before
                                             // the box starts re-equilibrating. Measuring
                                             // later catches a real Le Chatelier shift
                                             // (fewer reactants -> dimers dissociate) and
                                             // misreads honest chemistry as bond damage.
const afterCut = counts();
const aUnits = afterCut.A + afterCut.AB, bUnits = afterCut.B + afterCut.AB;
check('N-down keeps A/B units balanced', Math.abs(aUnits - bUnits) <= 1,
  `A-units ${aUnits} vs B-units ${bUnits} (dimers before ${abBefore}, after ${afterCut.AB})`);
check('N-down breaks no bonds', afterCut.AB >= abBefore - 1,
  `AB ${abBefore} -> ${afterCut.AB} (removal must take free reactants, never dimers)`);

// ── 9. the equilibrium must not depend on the size of the teacher's window ──
// The renderer fills the viewport, and forward is bimolecular while reverse is
// first order — so without normalisation the balance point carries a factor of
// box area and moves with the browser window. Measured before the fix on
// identical authored constants: product 31 at the authoring geometry, 17 at
// 1440x900, 15 at 1920x1080. A state seeded at its measured plateau then drifts
// on every screen but the author's, and no gate could see it because every
// gate ran at one size.
function meanABat(w: number, h: number) {
  R.width = w; R.height = h;
  boot(makeConfig({ temperature_K: 500 }, { T: 500, adiabatic: false }));
  return runMeanAB(4200, 4200);
}
const atAuthoring = meanABat(900, 560);
const atBigScreen = meanABat(1600, 900);
const atSmall = meanABat(760, 480);
R.width = 900; R.height = 560;
const spread = Math.max(atAuthoring, atBigScreen, atSmall) - Math.min(atAuthoring, atBigScreen, atSmall);
check('equilibrium is viewport-independent', spread <= Math.max(3, atAuthoring * 0.18),
  `mean AB: 900x560 ${atAuthoring.toFixed(1)} · 1600x900 ${atBigScreen.toFixed(1)} · 760x480 ${atSmall.toFixed(1)} (spread ${spread.toFixed(1)})`);

// ── 10. T_from: the heating must be SEEN, not applied at the door ──
// Without T_from, gasInit seeds every velocity at the state's target, so a
// state narrating "now we heat it" opens already hot and the CAUSE never moves
// (Rule 32a inverted on what is usually an equilibrium lesson's key state).
// The piston has had piston_from since the reaction layer landed; temperature
// had no counterpart until 2026-07-29.
boot(makeConfig({ temperature_K: 300 }, { T: 600, T_from: 300, T_ramp_ms: 2000, adiabatic: false }));
const tOpen = Number(R.gasTempK);
run(60);                                     // 1.0 s — mid-ramp
const tMid = Number(R.gasTempK);
run(240);                                    // 5.0 s total — well past the 2 s ramp
const tEnd = Number(R.gasTempK);
check('T_from opens at the cold end', Math.abs(tOpen - 300) < 5,
  `opens at ${tOpen.toFixed(0)} K (T_from 300, target 600)`);
check('T_from ramp is watchable', tMid > 320 && tMid < 590,
  `1.0 s in: ${tMid.toFixed(0)} K — strictly between start and target, so the climb is on screen`);
check('T_from reaches its target', Math.abs(tEnd - 600) < 25,
  `5.0 s in: ${tEnd.toFixed(0)} K (target 600)`);

// Regression guard: every EXISTING gas_box state authors no T_from and must
// keep opening exactly at its temperature.
boot(makeConfig({ temperature_K: 300 }, { T: 600, adiabatic: false }));
check('no T_from still opens at T', Math.abs(Number(R.gasTempK) - 600) < 1,
  `opens at ${Number(R.gasTempK).toFixed(0)} K — unchanged for every state that authors no ramp`);

// ── 11. inject_cue: the disturbance ARRIVES, once, on the state clock ──
// Counted in A-UNITS (free A plus A locked in dimers), which the reaction
// conserves — raw particle count falls as A + B -> AB and would misread honest
// chemistry as a failed injection.
boot(makeConfig({}, {
  T: 400, adiabatic: false,
  cues: [{ id: 'add_a', at_ms: 1000 }],
  inject_cue: 'add_a', inject_n: 30, inject_species: 'A',
}));
const aU0 = counts().A + counts().AB;
run(30);                                     // 0.5 s — the cue has NOT fired yet
const aUBefore = counts().A + counts().AB;
run(90);                                     // 2.0 s total — past the cue
const aUAfter = counts().A + counts().AB;
run(600);                                    // 10 s more — a one-shot must not repeat
const aULater = counts().A + counts().AB;
check('inject_cue holds until its cue fires', aUBefore === aU0,
  `A-units ${aU0} -> ${aUBefore} at 0.5 s (cue at 1.0 s)`);
check('inject_cue delivers the authored amount', aUAfter === aU0 + 30,
  `A-units ${aU0} -> ${aUAfter} after the cue (authored +30)`);
check('inject_cue is a one-shot', aULater === aUAfter,
  `A-units ${aUAfter} -> ${aULater} over the next 10 s`);

// ── 12. the K chip's teaching claim: different amounts, same ratio ──
// This is the whole of the "adding reactant changes the equilibrium constant"
// misconception, checked as physics rather than asserted in narration. The chip
// prints raw nAB/(nA*nB) precisely because that ratio carries no box area (the
// reverse rate is already normalised to ref_area_px) — see drawGasKRatio.
function meanKfrom(sc: Record<string, number>) {
  boot(makeConfig({ temperature_K: 450 }, { T: 450, adiabatic: false, species_counts: sc }));
  const st = R.config.states.STATE_1;
  for (let i = 0; i < 4200; i++) R.stepGas(st);      // settle
  let sum = 0, n = 0;
  for (let i = 0; i < 4200; i++) {                    // then sample
    R.stepGas(st);
    if (i % 60 === 0) {
      const c = counts();
      if (c.A > 0 && c.B > 0) { sum += c.AB / (c.A * c.B); n++; }
    }
  }
  return n ? sum / n : 0;
}
const kBalanced = meanKfrom({ A: 60, B: 60, AB: 0 });
const kSurplusA = meanKfrom({ A: 90, B: 60, AB: 0 });
const kFromProduct = meanKfrom({ A: 0, B: 0, AB: 60 });
const kMax = Math.max(kBalanced, kSurplusA, kFromProduct);
const kMin = Math.min(kBalanced, kSurplusA, kFromProduct);
check('K is the same from different amounts', (kMax - kMin) <= kMax * 0.30,
  `K: balanced ${kBalanced.toFixed(5)} · surplus A ${kSurplusA.toFixed(5)} · from product ${kFromProduct.toFixed(5)}`);

console.log(fail.length ? `\n${fail.length} FAILED: ${fail.join(', ')}` : '\nall checks passed');
process.exit(fail.length ? 1 : 0);
