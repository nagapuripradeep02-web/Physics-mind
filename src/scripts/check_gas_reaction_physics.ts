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

// ── 13. the K chip must be READABLE, not just correct ──
// A state whose whole claim is "these amounts changed a lot, this number did
// not" needs an instrument a teacher can point at. The raw per-frame ratio is
// built from small integer counts and swings ~2x, which would have had the
// narration apologising for the instrument. The chip therefore prints the same
// 5 s window the rate bars use. This check compares the two directly, so the
// day someone "simplifies" the chip back to an instantaneous read, it fails.
boot(makeConfig({ temperature_K: 450 }, { T: 450, adiabatic: false, species_counts: { A: 60, B: 60, AB: 0 } }));
{
  const st = R.config.states.STATE_1;
  for (let i = 0; i < 4200; i++) R.stepGas(st);        // settle first
  let rawMin = Infinity, rawMax = 0, winMin = Infinity, winMax = 0;
  for (let i = 0; i < 3600; i++) {
    R.stepGas(st);
    const c = counts();
    if (c.A > 0 && c.B > 0) {
      const raw = c.AB / (c.A * c.B);
      rawMin = Math.min(rawMin, raw); rawMax = Math.max(rawMax, raw);
    }
    const w = Number(R.gasKMean);
    if (w > 0) { winMin = Math.min(winMin, w); winMax = Math.max(winMax, w); }
  }
  const rawSpread = (rawMax - rawMin) / rawMax;
  const winSpread = (winMax - winMin) / winMax;
  check('K chip is steadier than a per-frame read', winSpread < rawSpread * 0.8,
    `per-frame swings ${(rawSpread * 100).toFixed(0)}% (${rawMin.toFixed(5)}-${rawMax.toFixed(5)}), ` +
    `chip swings ${(winSpread * 100).toFixed(0)}% (${winMin.toFixed(5)}-${winMax.toFixed(5)})`);
  // Deliberately NOT a "holds its digits" assertion. Measured at the concept's
  // own configuration, the displayed value still swings ~50% on a 10 s window
  // and 13% on 60 s — the fluctuations are slow, so no window a state can
  // afford will freeze the digits. Recording the real bound here keeps a future
  // author from narrating "watch this number stay fixed" over an instrument
  // that visibly does not; the honest claim is comparative (see drawGasKRatio).
  check('K chip swing stays within its documented bound', winSpread < 0.75,
    `chip range ${winMin.toFixed(4)}-${winMax.toFixed(4)} — wanders by design, narrate comparatively`);
}

// ── 14. reaction_at_cue: the catalyst goes in MID-state, and shifts nothing ──
// The point of the beat is that both directions speed up by the same factor, so
// the balance does not move. That must stay EMERGENT: the cue lowers only the
// FORWARD barrier, and Ea_rev = Ea_fwd + E_bond drags the reverse barrier down
// with it through the same accessor. If someone ever special-cases the override
// onto activation_fwd_kT alone, the reverse would not follow and this fails.
{
  const catalysed = {
    T: 400, adiabatic: false,
    species_counts: { A: 47, B: 47, AB: 13 },
    cues: [{ id: 'add_catalyst', at_ms: 1000 }],
    reaction_at_cue: { cue: 'add_catalyst', activation_fwd_kT: 0.5 },
  };
  boot(makeConfig({}, catalysed));
  const st = R.config.states.STATE_1;
  for (let i = 0; i < 30; i++) R.stepGas(st);          // 0.5 s — before the cue
  for (let i = 0; i < 300; i++) R.stepGas(st);         // prime the rate windows
  const fwdBefore = Number(R.gasRxFwdRate), revBefore = Number(R.gasRxRevRate);
  // sanity: at 0.5 s the cue has not fired, so the barrier is still the baseline
  boot(makeConfig({}, catalysed));
  // 120 ticks, not 60: PM_simTimeMs accumulates 1000/60 per step and lands a
  // float hair UNDER 1000 after exactly 60, so an at_ms:1000 cue fires on tick
  // 61. Sampling on the boundary tests floating-point, not the mechanism.
  for (let i = 0; i < 120; i++) R.stepGas(R.config.states.STATE_1);
  const eaAfter = Number(R.gasRxEaFwd(R.config.states.STATE_1));
  boot(makeConfig({}, { ...catalysed, cues: [{ id: 'add_catalyst', at_ms: 999999 }] }));
  // 120 ticks, not 60: PM_simTimeMs accumulates 1000/60 per step and lands a
  // float hair UNDER 1000 after exactly 60, so an at_ms:1000 cue fires on tick
  // 61. Sampling on the boundary tests floating-point, not the mechanism.
  for (let i = 0; i < 120; i++) R.stepGas(R.config.states.STATE_1);
  const eaBefore = Number(R.gasRxEaFwd(R.config.states.STATE_1));
  check('reaction_at_cue lowers the barrier only after its cue', eaAfter < eaBefore,
    `Ea_fwd ${eaBefore.toFixed(4)} before the cue -> ${eaAfter.toFixed(4)} after`);

  // and the reverse barrier must have fallen by the SAME bond energy
  boot(makeConfig({}, catalysed));
  // 120 ticks, not 60: PM_simTimeMs accumulates 1000/60 per step and lands a
  // float hair UNDER 1000 after exactly 60, so an at_ms:1000 cue fires on tick
  // 61. Sampling on the boundary tests floating-point, not the mechanism.
  for (let i = 0; i < 120; i++) R.stepGas(R.config.states.STATE_1);
  const revAfterEa = Number(R.gasRxEaRev(R.config.states.STATE_1));
  const bondE = Number(R.gasRxBondE(R.config.states.STATE_1));
  check('reaction_at_cue keeps Ea_rev derived', Math.abs((revAfterEa - eaAfter) - bondE) < 1e-9,
    `Ea_rev ${revAfterEa.toFixed(4)} - Ea_fwd ${eaAfter.toFixed(4)} = ${(revAfterEa - eaAfter).toFixed(4)}, bond ${bondE.toFixed(4)}`);

  // both rates rise together, plateau does not move
  function meanABfrom(state: Record<string, unknown>, settle: number, sample: number) {
    boot(makeConfig({}, state));
    const s = R.config.states.STATE_1;
    for (let i = 0; i < settle; i++) R.stepGas(s);
    let sum = 0, n = 0;
    for (let i = 0; i < sample; i++) { R.stepGas(s); if (i % 30 === 0) { sum += counts().AB; n++; } }
    return { ab: sum / n, fwd: Number(R.gasRxFwdRate), rev: Number(R.gasRxRevRate) };
  }
  const plain = meanABfrom({ T: 400, adiabatic: false, species_counts: { A: 47, B: 47, AB: 13 } }, 3600, 3600);
  const cat = meanABfrom(catalysed, 3600, 3600);
  check('catalyst speeds both directions', cat.fwd > plain.fwd * 1.4 && cat.rev > plain.rev * 1.4,
    `fwd ${plain.fwd.toFixed(2)} -> ${cat.fwd.toFixed(2)}/s, rev ${plain.rev.toFixed(2)} -> ${cat.rev.toFixed(2)}/s`);
  check('catalyst does NOT move the plateau', Math.abs(cat.ab - plain.ab) <= Math.max(4, plain.ab * 0.18),
    `AB plateau ${plain.ab.toFixed(1)} uncatalysed vs ${cat.ab.toFixed(1)} catalysed`);
  void fwdBefore; void revBefore;
}

// ── 15. a compression beat must not cook the gas on its way in ──
// The default piston ease drives the wall ~12x faster than the particles move,
// and a wall that outruns its gas does enormous work on it: measured peak
// gasMeasuredT() of 8549 K on a state authored at 300 K, with the product count
// crashing 31 -> 7 first. A state narrating "squeeze it and the balance shifts"
// then shows the reverse rate LEADING for seconds. piston_ramp_ms exists to
// make the stroke slow enough to stay near the setpoint; this pins that it
// actually does, and that the default stroke is left exactly as it was.
function peakMeasuredT(stateOver: Record<string, unknown>, ticks: number) {
  boot(makeConfig({ temperature_K: 300 }, { T: 300, adiabatic: false, ...stateOver }));
  const st = R.config.states.STATE_1;
  let peak = 0;
  for (let i = 0; i < ticks; i++) { R.stepGas(st); peak = Math.max(peak, Number(R.gasMeasuredT())); }
  return peak;
}
const fastStroke = peakMeasuredT({ piston_from: 1.0, piston_frac: 0.55 }, 600);
const slowStroke = peakMeasuredT({ piston_from: 1.0, piston_frac: 0.55, piston_ramp_ms: 6000 }, 600);
check('default piston stroke is unchanged (shipped concepts keep their baselines)', fastStroke > 1500,
  `peak measured T ${fastStroke.toFixed(0)} K on the default ease — the documented behaviour, left alone`);
check('piston_ramp_ms keeps a compression near its setpoint', slowStroke < fastStroke * 0.25,
  `peak measured T ${slowStroke.toFixed(0)} K ramped over 6 s vs ${fastStroke.toFixed(0)} K on the default stroke`);

// and the ramp must still ARRIVE — a gentle stroke that never closes is worse
boot(makeConfig({ temperature_K: 300 }, { T: 300, adiabatic: false, piston_from: 1.0, piston_frac: 0.55, piston_ramp_ms: 6000 }));
for (let i = 0; i < 480; i++) R.stepGas(R.config.states.STATE_1);
const pistonAt8s = Number(R.gasPistonF);
check('piston_ramp_ms still reaches its target', Math.abs(pistonAt8s - 0.55) < 0.01,
  `piston at ${pistonAt8s.toFixed(3)} after 8 s (target 0.55, ramp 6 s)`);

// ── 16. the activation-energy layer: slider units, the guard, and ea_at_cue ──
// Added 2026-07-29 for collision_theory_activation_energy (P1 #4). Three
// separate mechanisms, each of which was silently wrong or absent before:
//   * the Ea slider read a RAW px/tick energy — a number no teacher can reason
//     about, and not the unit the author writes (Rule 33d)
//   * it had NO userTouched guard, so merely DECLARING it replaced every
//     state's authored barrier with the slider default. Every other gas slider
//     (T, V, N) has that guard; this one was the outlier
//   * there was no way to lower the barrier MID-state, so a catalyst beat could
//     only be a between-state comparison — the exact defect that redesigned
//     le_chateliers_principle's STATE_7 (Rule 32a: the cause must be seen to arrive)
{
  const eaState = { T: 300, adiabatic: false, activation_energy_kT: 3 };
  const withEaSlider = (over: Record<string, unknown> = {}) => {
    const c = makeConfig({ temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105 }, { ...eaState, ...over }) as Ctx;
    c.slider_controls.Ea = { label: 'Activation energy', min: 0.5, max: 6, step: 0.1, default: 1 };
    return c;
  };

  // one kT at the reference temperature, in the px/tick units the test uses
  const kTref = 0.105 * 0.105 * 300;

  boot(makeConfig({ temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105 }, eaState));
  const eaAuthored = Number(R.gasActivationE(R.config.states.STATE_1));
  check('activation_energy_kT converts through one kT at ea_ref_T',
    Math.abs(eaAuthored - 3 * kTref) < 1e-9,
    `authored 3 kT -> ${eaAuthored.toFixed(4)} raw (1 kT = ${kTref.toFixed(4)})`);

  // THE GUARD. An untouched slider must not touch the authored barrier.
  boot(withEaSlider());
  const eaSliderUntouched = Number(R.gasActivationE(R.config.states.STATE_1));
  check('an UNTOUCHED Ea slider leaves the authored barrier alone',
    Math.abs(eaSliderUntouched - eaAuthored) < 1e-9,
    `authored ${eaAuthored.toFixed(4)} vs ${eaSliderUntouched.toFixed(4)} with the slider declared but untouched`);

  // and a dragged one wins, in kT
  boot(withEaSlider());
  R.userTouched.Ea = true;
  R.userParams.Ea = 1.5;
  const eaSliderDragged = Number(R.gasActivationE(R.config.states.STATE_1));
  check('a dragged Ea slider is read in kT of ea_ref_T, not raw energy',
    Math.abs(eaSliderDragged - 1.5 * kTref) < 1e-9,
    `slider 1.5 -> ${eaSliderDragged.toFixed(4)} raw (1.5 kT = ${(1.5 * kTref).toFixed(4)})`);

  // the counter's threshold and the reaction's forward barrier must move TOGETHER
  check('a dragged Ea slider drives the reaction barrier too',
    Math.abs(Number(R.gasRxEaFwd(R.config.states.STATE_1)) - eaSliderDragged) < 1e-9,
    `counter threshold ${eaSliderDragged.toFixed(4)} vs Ea_fwd ${Number(R.gasRxEaFwd(R.config.states.STATE_1)).toFixed(4)}`);
  // ...and Ea_rev must STILL be derived, so the equilibrium position holds
  const dragRev = Number(R.gasRxEaRev(R.config.states.STATE_1));
  const dragBond = Number(R.gasRxBondE(R.config.states.STATE_1));
  check('a dragged Ea slider keeps Ea_rev derived (no scripted shift)',
    Math.abs((dragRev - eaSliderDragged) - dragBond) < 1e-9,
    `Ea_rev ${dragRev.toFixed(4)} - Ea_fwd ${eaSliderDragged.toFixed(4)} = ${(dragRev - eaSliderDragged).toFixed(4)}, bond ${dragBond.toFixed(4)}`);

  // ea_at_cue: before the cue the authored barrier holds, after it the new one does
  const cued = { ...eaState, cues: [{ id: 'catalyst_in', at_ms: 1000 }], ea_at_cue: { cue: 'catalyst_in', activation_energy_kT: 1.5 } };
  boot(makeConfig({ temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105 },
    { ...cued, cues: [{ id: 'catalyst_in', at_ms: 999999 }] }));
  for (let i = 0; i < 120; i++) R.stepGas(R.config.states.STATE_1);
  const eaPreCue = Number(R.gasActivationE(R.config.states.STATE_1));
  boot(makeConfig({ temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105 }, cued));
  for (let i = 0; i < 120; i++) R.stepGas(R.config.states.STATE_1);
  const eaPostCue = Number(R.gasActivationE(R.config.states.STATE_1));
  check('ea_at_cue holds the authored barrier until its cue fires',
    Math.abs(eaPreCue - 3 * kTref) < 1e-9, `${eaPreCue.toFixed(4)} raw before the cue (authored 3 kT)`);
  check('ea_at_cue drops the barrier after its cue fires',
    Math.abs(eaPostCue - 1.5 * kTref) < 1e-9, `${eaPostCue.toFixed(4)} raw after the cue (cued 1.5 kT)`);

  // and the consequence a state actually narrates: more collisions clear it
  function clearFraction(stateOver: Record<string, unknown>, settle: number, sample: number) {
    boot(makeConfig({ temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105 }, { T: 300, adiabatic: false, ...stateOver }));
    const st = R.config.states.STATE_1;
    for (let i = 0; i < settle; i++) R.stepGas(st);
    const c0 = Number(R.gasCollTotal), s0 = Number(R.gasSuccessTotal);
    for (let i = 0; i < sample; i++) R.stepGas(st);
    const coll = Number(R.gasCollTotal) - c0, succ = Number(R.gasSuccessTotal) - s0;
    return coll > 0 ? succ / coll : 0;
  }
  const fracHigh = clearFraction({ activation_energy_kT: 3 }, 180, 1800);
  const fracLow = clearFraction({ activation_energy_kT: 1.5 }, 180, 1800);
  check('a lower barrier is cleared by more collisions', fracLow > fracHigh * 2,
    `${(100 * fracHigh).toFixed(2)}% clear Ea at 3 kT vs ${(100 * fracLow).toFixed(2)}% at 1.5 kT`);

  // the OTHER lever on the same fraction: temperature, with Ea pinned to ea_ref_T
  const fracHot = clearFraction({ activation_energy_kT: 3, T: 600 }, 180, 1800);
  check('heating raises the cleared fraction at a FIXED barrier', fracHot > fracHigh * 2.5,
    `${(100 * fracHigh).toFixed(2)}% at 300 K vs ${(100 * fracHot).toFixed(2)}% at 600 K (Ea pinned to ea_ref_T)`);

  // ...while barely moving the collision COUNT. This asymmetry IS collision
  // theory's claim, and it is the pair of numbers the concept narrates.
  function collRate(stateOver: Record<string, unknown>, settle: number, sample: number) {
    boot(makeConfig({ temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105 }, { T: 300, adiabatic: false, ...stateOver }));
    const st = R.config.states.STATE_1;
    for (let i = 0; i < settle; i++) R.stepGas(st);
    const c0 = Number(R.gasCollTotal);
    for (let i = 0; i < sample; i++) R.stepGas(st);
    return (Number(R.gasCollTotal) - c0) / (sample / 60);
  }
  const collCold = collRate({ activation_energy_kT: 3 }, 180, 1800);
  const collHot = collRate({ activation_energy_kT: 3, T: 600 }, 180, 1800);
  const fracRatio = fracHot / Math.max(fracHigh, 1e-9), collRatio = collHot / Math.max(collCold, 1e-9);
  check('heating moves the FRACTION far more than the collision COUNT', fracRatio > collRatio * 2,
    `300->600 K: collisions x${collRatio.toFixed(2)}, cleared fraction x${fracRatio.toFixed(2)}`);

  // AUTHORING TRAP, pinned here because it cost this build a gate cycle:
  // IN A REACTING BOX A PER-STATE `N` IS INERT ON ENTRY. gasInit places by
  // species_counts (or the species list's own counts) and never consults
  // gasCount() unless some species is left undeclared; gasSyncCount then pins
  // gasNPrev to the target on its first tick and returns, because in reaction
  // mode N is a DELTA control, not a population. So a state that authors
  // "N: 360" expecting a fuller box gets exactly the box its species_counts
  // describe — silently, with no warning anywhere. Crowding is authored as
  // species_counts, full stop. (le_chateliers_principle's STATE_7 authors both
  // and is correct only because its species_counts already sum to its N.)
  const denseCounts = { species_counts: { A: 120, B: 120, AB: 0 } };
  const baseCounts = { species_counts: { A: 60, B: 60, AB: 0 } };
  boot(makeConfig({ temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105 },
    { T: 300, adiabatic: false, activation_energy_kT: 3, N: 360 }));
  const nAtEntry = R.particles.length;
  // ...and it stays inert: the only later movement is the chemistry's own
  // (A + B -> AB turns two discs into one), never a climb toward the authored N.
  for (let i = 0; i < 120; i++) R.stepGas(R.config.states.STATE_1);
  check('a per-state N is INERT in a reacting box (author species_counts instead)',
    nAtEntry === 120 && R.particles.length <= 120,
    `state authored N: 360, box opened at ${nAtEntry} (the species list's 60+60+0) and ran to ${R.particles.length} — never toward 360`);

  const fracDense = clearFraction({ activation_energy_kT: 3, ...denseCounts }, 180, 1800);
  const collDense = collRate({ activation_energy_kT: 3, ...denseCounts }, 180, 1800);
  const fracBase = clearFraction({ activation_energy_kT: 3, ...baseCounts }, 180, 1800);
  const collBase = collRate({ activation_energy_kT: 3, ...baseCounts }, 180, 1800);
  check('crowding moves the COUNT and leaves the fraction flat',
    collDense > collBase * 2 && Math.abs(fracDense - fracBase) < fracBase * 0.3,
    `120->240 particles: collisions x${(collDense / collBase).toFixed(2)}, fraction ${(100 * fracBase).toFixed(2)}% -> ${(100 * fracDense).toFixed(2)}%`);
  void collCold;
}

// ── 17. the Arrhenius instrument ────────────────────────────────────────────
// This is the only gas HUD that makes a claim about a LAW, so it is the one
// that most needs pinning: it must accumulate real tallies (not evaluate the
// Arrhenius expression), refuse to draw a line through too few points, hold its
// axis fixed against moving data, and recover a slope close to -Ea/k.
{
  const arrCfg = (over: Record<string, unknown> = {}) => makeConfig(
    { temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105, count: 180 },
    {
      T: 800, T_from: 250, T_ramp_ms: 40000, adiabatic: false,
      activation_energy_kT: 3, species_counts: { A: 90, B: 90, AB: 0 },
      show_arrhenius_plot: true, arrhenius_window_ms: 4000,
      arrhenius_T_min: 250, arrhenius_T_max: 800, ...over,
    },
  );

  // a state that does NOT ask for the plot must accumulate nothing
  boot(makeConfig({ temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105 },
    { T: 300, adiabatic: false, activation_energy_kT: 3, species_counts: { A: 90, B: 90, AB: 0 } }));
  for (let i = 0; i < 900; i++) R.stepGas(R.config.states.STATE_1);
  check('the Arrhenius accumulator is inert unless a state asks for it',
    R.gasArrPts.length === 0, `${R.gasArrPts.length} points accumulated over 15 s with the flag off`);

  // too few points must NOT produce a fit — no "law" through two dots
  boot(arrCfg());
  for (let i = 0; i < 300; i++) R.stepGas(R.config.states.STATE_1);   // 5 s -> 1 window
  check('no fit is drawn from too few points', R.gasArrhFit(R.config.states.STATE_1) === null,
    `${R.gasArrPts.length} point(s) after 5 s -> fit ${R.gasArrhFit(R.config.states.STATE_1) === null ? 'null' : 'DRAWN'}`);

  // ...and the LOAD-BEARING half: plenty of points crowded into a narrow slice
  // of the axis must not produce one either. This is the case that printed
  // "slope -410 K" beside "law -900 K" under a caption reading "one straight
  // line" — a confidently wrong line in the instrument carrying the state's
  // whole claim. A point-count threshold alone does NOT catch it.
  boot(arrCfg({ T: 320, T_from: 300, T_ramp_ms: 40000 }));   // a nearly-flat ramp
  for (let i = 0; i < 40 * 60; i++) R.stepGas(R.config.states.STATE_1);
  const crowded = R.gasArrhFit(R.config.states.STATE_1);
  check('no fit is drawn from points crowded into a narrow 1/T span',
    R.gasArrPts.length >= 6 && crowded === null,
    `${R.gasArrPts.length} points spanning 300-320 K on a 250-800 K axis -> fit ${crowded === null ? 'null (says "measuring...")' : `DRAWN at slope ${crowded.slope.toFixed(0)}`}`);

  // the full ramp: 8 windows in 32 s, a real fit, a slope near -Ea/k
  boot(arrCfg());
  for (let i = 0; i < 60; i++) R.stepGas(R.config.states.STATE_1);
  const axis0 = JSON.stringify(R.gasArrhAxis(R.config.states.STATE_1));
  for (let i = 0; i < 33 * 60; i++) R.stepGas(R.config.states.STATE_1);
  const arrFit = R.gasArrhFit(R.config.states.STATE_1);
  const axis1 = JSON.stringify(R.gasArrhAxis(R.config.states.STATE_1));
  check('a 4 s window yields ~8 points inside one state',
    R.gasArrPts.length >= 7 && R.gasArrPts.length <= 9,
    `${R.gasArrPts.length} measured points over a 33 s ramp at arrhenius_window_ms 4000`);
  check('the axis is solved ONCE and never rescales to its own data', axis0 === axis1,
    `axis at 1 s ${axis0} === axis at 34 s ${axis1}`);
  check('the fitted slope lands near -Ea/k',
    arrFit !== null && Math.abs(arrFit.slope - -900) < 900 * 0.15,
    arrFit ? `slope ${arrFit.slope.toFixed(0)} K against -Ea/k = -900 K (${(100 * Math.abs(arrFit.slope + 900) / 900).toFixed(1)}% off), R2 ${arrFit.r2.toFixed(4)}` : 'no fit');
  check('the points genuinely lie on a line', arrFit !== null && arrFit.r2 > 0.9,
    arrFit ? `R2 ${arrFit.r2.toFixed(4)} over ${arrFit.n} measured points` : 'no fit');

  // THE POINT OF THE INSTRUMENT: it must be a MEASUREMENT, so a box whose
  // barrier is different must produce a DIFFERENT slope. If the plot evaluated
  // the Arrhenius expression instead of tallying collisions, this would still
  // pass — so pair it with the check below.
  boot(arrCfg({ activation_energy_kT: 1.5 }));
  for (let i = 0; i < 34 * 60; i++) R.stepGas(R.config.states.STATE_1);
  const halfFit = R.gasArrhFit(R.config.states.STATE_1);
  check('halving the barrier halves the measured slope',
    halfFit !== null && Math.abs(halfFit.slope - -450) < 450 * 0.2,
    halfFit ? `slope ${halfFit.slope.toFixed(0)} K at Ea 1.5 kT against -Ea/k = -450 K` : 'no fit');

  // ...and the tallies must be REAL: with the barrier so high that essentially
  // nothing clears it, there is nothing to plot. A formula would still draw.
  boot(arrCfg({ activation_energy_kT: 12, T: 300, T_from: 300 }));
  for (let i = 0; i < 34 * 60; i++) R.stepGas(R.config.states.STATE_1);
  check('an unclearable barrier plots NOTHING (the points are tallies, not a formula)',
    R.gasArrPts.length <= 2,
    `${R.gasArrPts.length} points at Ea 12 kT — windows with zero clearing collisions are dropped, not invented`);

  // determinism, because THE EYE re-simulates this state from its seed
  const sig = () => R.gasArrPts.map((p: Ctx) => p.invT.toFixed(9) + ',' + p.lnf.toFixed(9)).join(';');
  boot(arrCfg()); for (let i = 0; i < 20 * 60; i++) R.stepGas(R.config.states.STATE_1);
  const sigA = sig();
  boot(arrCfg()); for (let i = 0; i < 20 * 60; i++) R.stepGas(R.config.states.STATE_1);
  check('the Arrhenius points are deterministic', sigA === sig() && sigA.length > 0,
    sigA === sig() ? `identical across two runs (${R.gasArrPts.length} points)` : 'DIVERGED');
}

// ── 17b. per-state reaction disable, and the ea_at_cue ramp ─────────────────
{
  const base = { T: 300, adiabatic: false, activation_energy_kT: 3, species_counts: { A: 60, B: 60, AB: 0 } };
  const g = { temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105 };

  // ON by config (the default) — product accumulates
  boot(makeConfig(g, base));
  for (let i = 0; i < 40 * 60; i++) R.stepGas(R.config.states.STATE_1);
  const onAB = counts().AB, onFwd = R.gasRxFwdTotal;

  // OFF for this state — the SAME apparatus, and NOTHING may bond. Zero is the
  // only acceptable number here: a suppression hack (a huge fake barrier) leaks
  // product slowly and would pass any "roughly none" tolerance.
  boot(makeConfig(g, { ...base, reaction: { enabled: false } }));
  const offN0 = R.particles.length;
  for (let i = 0; i < 40 * 60; i++) R.stepGas(R.config.states.STATE_1);
  check('a state may switch the reaction OFF, and then nothing bonds at all',
    R.gasRxOn() === false && counts().AB === 0 && R.gasRxFwdTotal === 0 && onAB > 0,
    `reaction off: AB ${counts().AB}, fwd events ${R.gasRxFwdTotal} — same config ON gives AB ${onAB}, fwd ${onFwd}`);
  check('a reaction-off state keeps its population stable',
    R.particles.length === offN0 && offN0 === 120,
    `${offN0} discs at entry -> ${R.particles.length} after 40 s`);
  // ...and the collision counter still works, because that is the whole point:
  // five states count collisions against a barrier with no chemistry running.
  check('a reaction-off state still counts collisions against the barrier',
    R.gasCollTotal > 1000 && R.gasSuccessTotal > 20,
    `${R.gasCollTotal} collisions, ${R.gasSuccessTotal} cleared Ea, 0 reacted`);

  // ea_at_cue ramp: the barrier must be strictly BETWEEN its endpoints mid-ramp,
  // which is the whole difference between a slide and a jump cut.
  const kTref = 0.105 * 0.105 * 300;
  const cued = {
    ...base, cues: [{ id: 'cat', at_ms: 1000 }],
    ea_at_cue: { cue: 'cat', activation_energy_kT: 1.5, ramp_ms: 4000 },
  };
  boot(makeConfig(g, cued));
  for (let i = 0; i < 120; i++) R.stepGas(R.config.states.STATE_1);       // just past the cue
  const eaAtCue = Number(R.gasActivationE(R.config.states.STATE_1));
  for (let i = 0; i < 120; i++) R.stepGas(R.config.states.STATE_1);       // ~2 s in: mid-ramp
  const eaMid = Number(R.gasActivationE(R.config.states.STATE_1));
  for (let i = 0; i < 300; i++) R.stepGas(R.config.states.STATE_1);       // past the end
  const eaEnd = Number(R.gasActivationE(R.config.states.STATE_1));
  check('ea_at_cue ramp_ms slides the barrier instead of stepping it',
    eaMid < eaAtCue - 1e-6 && eaMid > eaEnd + 1e-6,
    `${eaAtCue.toFixed(3)} at the cue -> ${eaMid.toFixed(3)} mid-ramp -> ${eaEnd.toFixed(3)} at the end (target ${(1.5 * kTref).toFixed(3)})`);
  check('ea_at_cue ramp still ARRIVES at the authored barrier',
    Math.abs(eaEnd - 1.5 * kTref) < 1e-9, `${eaEnd.toFixed(4)} vs ${(1.5 * kTref).toFixed(4)}`);
  // and with no ramp_ms it must still be the instant step it always was
  boot(makeConfig(g, { ...base, cues: [{ id: 'cat', at_ms: 1000 }], ea_at_cue: { cue: 'cat', activation_energy_kT: 1.5 } }));
  for (let i = 0; i < 120; i++) R.stepGas(R.config.states.STATE_1);
  check('ea_at_cue without ramp_ms is unchanged (an instant step)',
    Math.abs(Number(R.gasActivationE(R.config.states.STATE_1)) - 1.5 * kTref) < 1e-9,
    `${Number(R.gasActivationE(R.config.states.STATE_1)).toFixed(4)} immediately after the cue`);
}

// ── 17c. T_cue / piston_cue — the cause must start WHEN it is named ─────────
// T_from and piston_from ramp from STATE ENTRY, so a state that binds its
// narration to a cue ("now the thermostat heats it") could have the heating
// already finishing as the sentence played. That is the cue/narration desync
// scar inverted, and it lands on whichever state is usually the most important
// one in the lesson. These two fields make the ramp wait; omitting them must
// leave every shipped T_from / piston_from state byte-identical.
{
  const g = { temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105 };
  const base = { adiabatic: false, species_counts: { A: 60, B: 60, AB: 0 }, reaction: { enabled: false } };

  // T_cue: held cold before the cue, ramping after, arriving on time
  const tCued = { ...base, T: 600, T_from: 300, T_ramp_ms: 6000, cues: [{ id: 'heat', at_ms: 5000 }], T_cue: 'heat' };
  boot(makeConfig(g, tCued));
  for (let i = 0; i < 240; i++) R.stepGas(R.config.states.STATE_1);       // 4 s — before the cue
  const tHeld = Number(R.gasTargetT());
  for (let i = 0; i < 240; i++) R.stepGas(R.config.states.STATE_1);       // 8 s — 3 s into the ramp
  const tMid = Number(R.gasTargetT());
  for (let i = 0; i < 300; i++) R.stepGas(R.config.states.STATE_1);       // 13 s — past the end
  const tEnd = Number(R.gasTargetT());
  check('T_cue holds the box at T_from until its cue fires',
    Math.abs(tHeld - 300) < 1e-9, `${tHeld.toFixed(1)} K at 4 s with the cue at 5 s (T_from 300)`);
  check('T_cue ramps FROM the cue, not from state entry',
    tMid > 300 + 1 && tMid < 600 - 1, `${tMid.toFixed(1)} K at 8 s — strictly between 300 and 600`);
  check('T_cue still reaches its target', Math.abs(tEnd - 600) < 1e-6, `${tEnd.toFixed(1)} K at 13 s`);

  // ...and omitting it is the OLD behaviour, exactly
  boot(makeConfig(g, { ...base, T: 600, T_from: 300, T_ramp_ms: 6000 }));
  for (let i = 0; i < 240; i++) R.stepGas(R.config.states.STATE_1);
  const tNoCue = Number(R.gasTargetT());
  check('no T_cue still ramps from state entry (shipped states unchanged)',
    tNoCue > 480 && tNoCue < 520, `${tNoCue.toFixed(1)} K at 4 s of a 6 s ramp from entry`);

  // piston_cue: the wall must not move at all before its cue
  const pCued = {
    ...base, T: 300, piston_from: 1.0, piston_frac: 0.4, piston_ramp_ms: 6000,
    cues: [{ id: 'squeeze', at_ms: 5000 }], piston_cue: 'squeeze',
  };
  boot(makeConfig(g, pCued));
  for (let i = 0; i < 240; i++) R.stepGas(R.config.states.STATE_1);
  const pHeld = Number(R.gasPistonF);
  for (let i = 0; i < 240; i++) R.stepGas(R.config.states.STATE_1);
  const pMid = Number(R.gasPistonF);
  for (let i = 0; i < 360; i++) R.stepGas(R.config.states.STATE_1);
  const pEnd = Number(R.gasPistonF);
  check('piston_cue holds the wall open until its cue fires',
    Math.abs(pHeld - 1.0) < 1e-9, `piston at ${pHeld.toFixed(3)} at 4 s with the cue at 5 s`);
  check('piston_cue strokes FROM the cue', pMid < 1.0 - 0.01 && pMid > 0.4 + 0.01,
    `piston at ${pMid.toFixed(3)} at 8 s — strictly between 1.00 and 0.40`);
  check('piston_cue still reaches its target', Math.abs(pEnd - 0.4) < 0.01, `piston at ${pEnd.toFixed(3)} at 14 s`);

  boot(makeConfig(g, { ...base, T: 300, piston_from: 1.0, piston_frac: 0.4, piston_ramp_ms: 6000 }));
  for (let i = 0; i < 240; i++) R.stepGas(R.config.states.STATE_1);
  const pNoCue = Number(R.gasPistonF);
  check('no piston_cue still strokes from state entry (shipped states unchanged)',
    pNoCue < 0.7 && pNoCue > 0.5, `piston at ${pNoCue.toFixed(3)} at 4 s of a 6 s stroke from entry`);
}

// ── 17d. counter_window_ms — a rare event needs a long enough window ────────
// The cleared-Ea rate sits beside the collision rate on one chip, but the two
// are orders of magnitude apart: hundreds of collisions per second against a
// handful that clear. The 1 s default is right for the first and wrong for the
// second, which is the same reasoning that already gave the reaction rates 5 s.
// Measured before this was authorable: the DISPLAYED percentage swung 0.0%-8.2%
// on a steady-state box whose narration says "about three in a hundred", so a
// frame could read 0.0% under a caption about collisions clearing the barrier.
{
  const g = { temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105 };
  const st = { T: 300, adiabatic: false, activation_energy_kT: 3, species_counts: { A: 90, B: 90, AB: 0 }, reaction: { enabled: false }, show_collision_counter: true };
  function shownPct(windowMs: number | null) {
    const stateOver = windowMs === null ? st : { ...st, counter_window_ms: windowMs };
    boot(makeConfig(g, stateOver));
    const s0 = R.config.states.STATE_1;
    for (let i = 0; i < 600; i++) R.stepGas(s0);           // settle past the first window
    const seen: number[] = [];
    for (let i = 0; i < 1200; i++) {
      R.stepGas(s0);
      if (i % 30 === 0 && R.gasCollRate > 0) seen.push(100 * R.gasSuccessRate / R.gasCollRate);
    }
    seen.sort((a, b) => a - b);
    return { lo: seen[0], hi: seen[seen.length - 1], spread: seen[seen.length - 1] - seen[0] };
  }
  const w1 = shownPct(null), w5 = shownPct(5000);
  check('counter_window_ms narrows the displayed percentage', w5.spread < w1.spread * 0.7,
    `1 s window spans ${w1.lo.toFixed(1)}-${w1.hi.toFixed(1)}% (${w1.spread.toFixed(1)}pp), 5 s spans ${w5.lo.toFixed(1)}-${w5.hi.toFixed(1)}% (${w5.spread.toFixed(1)}pp)`);
  check('a 5 s window never shows a 0.0% frame on a live barrier', w5.lo > 0.5,
    `lowest displayed percentage ${w5.lo.toFixed(2)}% over 20 s`);
  // and the default is untouched, so every shipped counter state keeps its frames
  const wDefault = shownPct(null);
  check('the counter window default is unchanged', Math.abs(wDefault.spread - w1.spread) < 1e-9,
    `unauthored window still spans ${wDefault.spread.toFixed(1)}pp — identical to before`);
}

// ── 18. hist_speed_marks opt-out must not disturb the histogram itself ──────
// Rule 25: v_mp/v_avg/v_rms are P1 #5's vocabulary and must be suppressible on a
// state that shows the histogram for another reason. The suppression is
// draw-only — it must not touch the physics, or kinetic_particle_theory's
// frozen baselines would move for a reason that has nothing to do with them.
{
  const histCfg = (marks: boolean | undefined) => makeConfig(
    { temperature_K: 300, ea_ref_T: 300, speed_scale: 0.105 },
    {
      T: 300, adiabatic: false, activation_energy_kT: 3,
      species_counts: { A: 90, B: 90, AB: 0 }, show_speed_histogram: true,
      ...(marks === undefined ? {} : { hist_speed_marks: marks }),
    },
  );
  const trace = (marks: boolean | undefined) => {
    boot(histCfg(marks));
    for (let i = 0; i < 600; i++) R.stepGas(R.config.states.STATE_1);
    return R.particles.map((p: Ctx) => p.x.toFixed(9) + ',' + p.vx.toFixed(9)).join(';');
  };
  const tDefault = trace(undefined), tOff = trace(false), tOn = trace(true);
  check('hist_speed_marks is draw-only — the physics is byte-identical',
    tDefault === tOff && tDefault === tOn, tDefault === tOff ? 'identical trajectories with the marks on, off, and unauthored' : 'DIVERGED');
}

console.log(fail.length ? `\n${fail.length} FAILED: ${fail.join(', ')}` : '\nall checks passed');
process.exit(fail.length ? 1 : 0);
