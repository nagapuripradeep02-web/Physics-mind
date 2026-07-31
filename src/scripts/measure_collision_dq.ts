/**
 * DESIGN-QUESTION MEASUREMENTS for collision_theory_activation_energy.
 *   npx tsx --env-file=.env.local src/scripts/measure_collision_dq.ts
 *
 * The architect skeleton left four questions it could not settle from the first
 * measurement run. Each is a build/no-build decision, so each gets measured
 * before anything is authored — never argued.
 *
 *  DQ-4  Is the counter's PERCENTAGE viewport-stable? The absolute rates are
 *        known to swing ~4x across viewports (gasRxAreaNorm normalises the
 *        equilibrium composition, not the readouts). The whole narration policy
 *        rests on the percentage being a ratio of two co-varying rates.
 *  DQ-2  On a LIVE temperature ramp with realistic sampling windows, is
 *        ln(fraction) vs 1/T legible, or is it 1/sqrt(n) noise? This decides
 *        whether an advanced Arrhenius state can exist at all.
 *  DQ-1  (falls out of DQ-2) — does an Arrhenius instrument earn its build?
 *  DQ-3  S4 crowding: piston squeeze vs single-species injection. Which reads
 *        as "more crowded" without lying about composition?
 *
 * Also measured here, because the skeleton commits narration to them:
 *  - the S5 catalyst beat driven by ea_at_cue on a live clock (not a config diff)
 *  - the S6 three-number ladder at the authored home pose, seed-swept
 *  - the S3 cooling mirror (the fridge anchor) at the explore slider's floor
 */
import vm from 'node:vm';
import { PARTICLE_FIELD_RENDERER_CODE } from '@/lib/renderers/particle_field_renderer';

const noop = () => {};
const mkCtx = (w: number, h: number) => {
  const c: Record<string, unknown> = {
    console,
    max: (...a: number[]) => Math.max(...a),
    min: (...a: number[]) => Math.min(...a),
    floor: Math.floor, ceil: Math.ceil, round: Math.round, abs: Math.abs,
    sqrt: Math.sqrt, pow: Math.pow, atan2: Math.atan2, cos: Math.cos, sin: Math.sin,
    exp: Math.exp, log: Math.log, tan: Math.tan, sq: (x: number) => x * x,
    constrain: (v: number, a: number, b: number) => Math.min(Math.max(v, a), b),
    dist: (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x2 - x1, y2 - y1),
    lerp: (a: number, b: number, t: number) => a + (b - a) * t,
    map: (v: number, a: number, b: number, cc: number, d: number) => cc + (d - cc) * ((v - a) / (b - a)),
    random: () => 0.5,
    TWO_PI: Math.PI * 2, PI: Math.PI, HALF_PI: Math.PI / 2, QUARTER_PI: Math.PI / 4,
    createCanvas: noop, frameRate: noop, background: noop, noStroke: noop, stroke: noop,
    fill: noop, noFill: noop, rect: noop, circle: noop, ellipse: noop, line: noop,
    text: noop, textAlign: noop, textSize: noop, textFont: noop, textWidth: () => 10,
    beginShape: noop, vertex: noop, endShape: noop, strokeWeight: noop, push: noop, pop: noop,
    translate: noop, rotate: noop, arc: noop, triangle: noop, quad: noop, point: noop,
    curveVertex: noop, bezierVertex: noop, bezier: noop, strokeCap: noop, strokeJoin: noop,
    rectMode: noop, ellipseMode: noop, imageMode: noop, noLoop: noop, loop: noop, redraw: noop,
    color: (x: unknown) => x, colorMode: noop, blendMode: noop, clear: noop, cursor: noop,
    LEFT: 'left', RIGHT: 'right', CENTER: 'center', TOP: 'top', BOTTOM: 'bottom',
    BASELINE: 'baseline', ROUND: 'round', SQUARE: 'square', PROJECT: 'project',
    CLOSE: 'close', CORNER: 'corner', RADIUS: 'radius', BLEND: 'blend', ADD: 'add',
    width: w, height: h, deltaTime: 1000 / 60, frameCount: 0,
    windowWidth: w, windowHeight: h, millis: () => 0, mouseX: 0, mouseY: 0,
    drawingContext: { setLineDash: noop, shadowBlur: 0, shadowColor: '', createLinearGradient: () => ({ addColorStop: noop }) },
    document: {
      getElementById: () => null,
      createElement: () => ({ style: {}, appendChild: noop, setAttribute: noop, classList: { add: noop, remove: noop } }),
      querySelectorAll: () => [], querySelector: () => null,
      body: { appendChild: noop }, addEventListener: noop,
    },
    addEventListener: noop, postMessage: noop, parent: { postMessage: noop },
    requestAnimationFrame: noop, setTimeout: noop, clearTimeout: noop,
  };
  c.window = c;
  vm.createContext(c);
  vm.runInContext(PARTICLE_FIELD_RENDERER_CODE, c);
  return c as Record<string, any>;
};

const SEED = 246813579;
const SPEED_SCALE = 0.105;
const REF_T = 300;
const HOME = { A: 90, B: 90, AB: 0 };

function cfg(o: Record<string, any> = {}) {
  const g: Record<string, any> = {
    count: 180, temperature_K: REF_T, ea_ref_T: REF_T, speed_scale: SPEED_SCALE,
    activation_energy_kT: o.eaKT ?? 3,
    hist_ref_T: REF_T,
    species: [
      { id: 'A', mass: 1, radius: 5, color: '#60A5FA', label: 'A', count: 90 },
      { id: 'B', mass: 1, radius: 5, color: '#F472B6', label: 'B', count: 90 },
      { id: 'AB', mass: 2, radius: 7.0710678, color: '#C084FC', label: 'AB', count: 0 },
    ],
  };
  if (o.reaction) {
    g.reaction = {
      enabled: true, reactants: ['A', 'B'], product: 'AB',
      activation_fwd_kT: o.rxEaKT ?? 3, bond_energy_kT: 2.1,
      reverse_attempt_per_s: 8, inject: 'A',
    };
  }
  return {
    scenario_type: 'gas_box',
    design: { background: '#0A0A1A', phys_seed: o.seed ?? SEED },
    canvas: { width: 900, height: 560 },
    gas: g,
    slider_controls: { T: { label: 'Temperature', min: 200, max: 800, step: 10, default: REF_T, unit: 'K' } },
    states: { STATE_1: { label: 'STATE_1', T: o.T ?? REF_T, adiabatic: false, species_counts: o.counts ?? HOME, ...(o.state ?? {}) } },
  };
}

function boot(R: Record<string, any>, c: any) {
  R.config = c; R.PM_currentState = 'STATE_1'; R.PM_simTimeMs = 0;
  R.userParams = {}; R.userTouched = {}; R.cueFiredAt = {}; R.particles = [];
  R.PHYS_SEED = c.design.phys_seed; R.physRand = R.mulberry32(R.PHYS_SEED);
  R.gasInit();
}
const step = (R: Record<string, any>, n: number) => { const s = R.config.states.STATE_1; for (let i = 0; i < n; i++) R.stepGas(s); };
const pct = (x: number) => (100 * x).toFixed(2) + '%';
const L = (s = '') => console.log(s);

L('═'.repeat(78));
L('DESIGN-QUESTION MEASUREMENTS — collision_theory_activation_energy');
L('═'.repeat(78));

// ── DQ-4  Is the PERCENTAGE viewport-stable? ───────────────────────────────
L('\n── DQ-4  Viewport stability: absolute rates vs the PERCENTAGE ──');
L('  the narration policy (never speak an absolute rate) rests on this');
L('  viewport      collisions/s      clear/s       PERCENTAGE');
{
  const rows: Array<{ vp: string; coll: number; succ: number; frac: number }> = [];
  for (const [w, h] of [[900, 560], [1280, 720], [1600, 900], [760, 480]] as Array<[number, number]>) {
    const R = mkCtx(w, h);
    let coll = 0, succ = 0, frac = 0;
    for (let s = 0; s < 5; s++) {
      boot(R, cfg({ seed: SEED + s * 7919 }));
      step(R, 180);
      const c0 = R.gasCollTotal, s0 = R.gasSuccessTotal;
      step(R, 1800);
      const dc = R.gasCollTotal - c0, ds = R.gasSuccessTotal - s0;
      coll += dc / 30; succ += ds / 30; frac += ds / dc;
    }
    rows.push({ vp: `${w}x${h}`, coll: coll / 5, succ: succ / 5, frac: frac / 5 });
    L(`  ${`${w}x${h}`.padEnd(12)}  ${rows[rows.length - 1].coll.toFixed(0).padStart(6)}`.padEnd(32) +
      `${rows[rows.length - 1].succ.toFixed(1).padStart(7)}`.padEnd(15) + `${pct(rows[rows.length - 1].frac).padStart(8)}`);
  }
  const cs = rows.map(r => r.coll), fs = rows.map(r => r.frac);
  const spread = (a: number[]) => Math.max(...a) / Math.min(...a);
  L(`  => collisions/s spread across viewports: x${spread(cs).toFixed(2)}`);
  L(`  => PERCENTAGE  spread across viewports: x${spread(fs).toFixed(2)}   <- the number narration may speak`);
}

// ── DQ-2  Arrhenius on a LIVE ramp with realistic windows ──────────────────
L('\n── DQ-2  Arrhenius on a live T ramp — signal or 1/sqrt(n) noise? ──');
L('  sampling the cleared fraction in windows while T ramps 250 -> 800 K');
{
  const R = mkCtx(900, 560);
  for (const [winS, dens] of [[4, 1], [4, 3], [8, 1], [8, 3]] as Array<[number, number]>) {
    const counts = { A: 90 * dens, B: 90 * dens, AB: 0 };
    const pts: Array<{ invT: number; lnf: number }> = [];
    boot(R, cfg({ counts, T: 800, state: { T: 800, T_from: 250, T_ramp_ms: 40000, species_counts: counts } }));
    step(R, 60);
    for (let k = 0; k < 8; k++) {
      const c0 = R.gasCollTotal, s0 = R.gasSuccessTotal;
      const tSum: number[] = [];
      for (let i = 0; i < winS * 60; i++) { R.stepGas(R.config.states.STATE_1); tSum.push(R.gasTempK); }
      const dc = R.gasCollTotal - c0, ds = R.gasSuccessTotal - s0;
      const Tm = tSum.reduce((a, b) => a + b, 0) / tSum.length;
      if (ds > 0) pts.push({ invT: 1 / Tm, lnf: Math.log(ds / dc) });
    }
    // least squares + R^2
    const n = pts.length;
    const mx = pts.reduce((a, p) => a + p.invT, 0) / n, my = pts.reduce((a, p) => a + p.lnf, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (const p of pts) { sxy += (p.invT - mx) * (p.lnf - my); sxx += (p.invT - mx) ** 2; syy += (p.lnf - my) ** 2; }
    const slope = sxy / sxx, r2 = (sxy * sxy) / (sxx * syy);
    L(`  window ${winS}s · density x${dens} (${counts.A + counts.B} discs): ${n} pts · slope ${slope.toFixed(0)} (ideal ${-3 * REF_T}) · R2 ${r2.toFixed(4)}`);
  }
  L('  (a state can only claim "the points fall on a line" if R2 is high at a window');
  L('   short enough that 8 points fit inside one state)');
}

// ── DQ-3  S4 crowding: piston squeeze vs single-species injection ──────────
L('\n── DQ-3  Crowding by piston vs by injection ──');
{
  const R = mkCtx(900, 560);
  const run = (state: Record<string, any>, counts = HOME) => {
    boot(R, cfg({ counts, state: { ...state, species_counts: counts } }));
    step(R, 600);                                   // let the disturbance land
    const c0 = R.gasCollTotal, s0 = R.gasSuccessTotal;
    step(R, 1200);
    const dc = R.gasCollTotal - c0, ds = R.gasSuccessTotal - s0;
    const by: Record<string, number> = {};
    for (const p of R.particles) { const id = R.gasSpecies[p.sp].id; by[id] = (by[id] || 0) + 1; }
    return { coll: dc / 20, frac: ds / dc, by };
  };
  const base = run({});
  const piston = run({ piston_from: 1.0, piston_frac: 0.40, piston_ramp_ms: 6000 });
  const inject = run({ cues: [{ id: 'more', at_ms: 1000 }], inject_cue: 'more', inject_n: 180, inject_species: 'A' });
  L(`  home         collisions/s ${base.coll.toFixed(0).padStart(4)}   fraction ${pct(base.frac)}   composition ${JSON.stringify(base.by)}`);
  L(`  piston 0.40  collisions/s ${piston.coll.toFixed(0).padStart(4)}   fraction ${pct(piston.frac)}   composition ${JSON.stringify(piston.by)}   count x${(piston.coll / base.coll).toFixed(2)}`);
  L(`  +180 A       collisions/s ${inject.coll.toFixed(0).padStart(4)}   fraction ${pct(inject.frac)}   composition ${JSON.stringify(inject.by)}   count x${(inject.coll / base.coll).toFixed(2)}`);
}

// ── S5 catalyst on a LIVE clock via ea_at_cue ──────────────────────────────
L('\n── S5  Catalyst via ea_at_cue on the state clock (not a config diff) ──');
{
  const R = mkCtx(900, 560);
  for (const eaTo of [2.0, 1.8, 1.5]) {
    const fr: number[] = [];
    for (let s = 0; s < 5; s++) {
      boot(R, cfg({
        seed: SEED + s * 7919,
        state: { cues: [{ id: 'catalyst_in', at_ms: 8000 }], ea_at_cue: { cue: 'catalyst_in', activation_energy_kT: eaTo } },
      }));
      step(R, 120);
      const cA = R.gasCollTotal, sA = R.gasSuccessTotal;
      step(R, 360);                                   // 2s..8s  pre-cue window
      const preC = R.gasCollTotal - cA, preS = R.gasSuccessTotal - sA;
      step(R, 60);                                    // cross the cue
      const cB = R.gasCollTotal, sB = R.gasSuccessTotal;
      step(R, 480);                                   // 9s..17s post-cue window
      const postC = R.gasCollTotal - cB, postS = R.gasSuccessTotal - sB;
      fr.push((postS / postC) / (preS / preC));
      if (s === 0) L(`  Ea 3 -> ${eaTo} kT:  pre ${pct(preS / preC)}  post ${pct(postS / postC)}`);
    }
    fr.sort((a, b) => a - b);
    L(`               fraction ratio across 5 seeds: x${fr[2].toFixed(2)}  (${fr[0].toFixed(2)}–${fr[fr.length - 1].toFixed(2)})`);
  }
}

// ── S6 the three-number ladder at the authored home pose ───────────────────
L('\n── S6  The ladder: collisions -> clear Ea -> actually react ──');
{
  const R = mkCtx(900, 560);
  const rows: number[][] = [];
  for (let s = 0; s < 5; s++) {
    boot(R, cfg({ seed: SEED + s * 7919, reaction: true, rxEaKT: 3 }));
    step(R, 180);
    const c0 = R.gasCollTotal, s0 = R.gasSuccessTotal, f0 = R.gasRxFwdTotal;
    step(R, 1200);
    const dc = R.gasCollTotal - c0, ds = R.gasSuccessTotal - s0, df = R.gasRxFwdTotal - f0;
    const by: Record<string, number> = {};
    for (const p of R.particles) { const id = R.gasSpecies[p.sp].id; by[id] = (by[id] || 0) + 1; }
    rows.push([dc / 20, ds / 20, df / 20, df / ds, by.AB ?? 0]);
  }
  const med = (i: number) => rows.map(r => r[i]).sort((a, b) => a - b)[2];
  const lo = (i: number) => Math.min(...rows.map(r => r[i]));
  const hi = (i: number) => Math.max(...rows.map(r => r[i]));
  L(`  collisions/s ${med(0).toFixed(0)}   clear Ea/s ${med(1).toFixed(1)}   react/s ${med(2).toFixed(2)}`);
  L(`  react / clear = ${pct(med(3))}  (5-seed band ${pct(lo(3))}–${pct(hi(3))})   AB after 20 s: ${med(4).toFixed(0)}`);
  L(`  => the honest sentence is a FRACTION ("about a third"), never the three raw rates`);
}

// ── S3/S8 the cooling mirror (the fridge anchor) ───────────────────────────
L('\n── S3/S8  Cooling: does the fridge beat survive the slider floor? ──');
{
  const R = mkCtx(900, 560);
  L('   T(K)   collisions/s    clear/s    fraction     vs 300 K');
  const at = (T: number) => {
    const f: number[] = [], c: number[] = [], s2: number[] = [];
    for (let s = 0; s < 5; s++) {
      boot(R, cfg({ seed: SEED + s * 7919, T, state: { T } }));
      step(R, 180);
      const c0 = R.gasCollTotal, s0 = R.gasSuccessTotal;
      step(R, 1800);
      const dc = R.gasCollTotal - c0, ds = R.gasSuccessTotal - s0;
      f.push(ds / dc); c.push(dc / 30); s2.push(ds / 30);
    }
    const m = (a: number[]) => a.sort((x, y) => x - y)[2];
    return { frac: m(f), coll: m(c), succ: m(s2) };
  };
  const base = at(300);
  for (const T of [200, 220, 250, 300]) {
    const r = at(T);
    L(`  ${String(T).padStart(4)}    ${r.coll.toFixed(0).padStart(5)}`.padEnd(23) +
      `${r.succ.toFixed(2).padStart(7)}`.padEnd(13) + `${pct(r.frac).padStart(7)}`.padEnd(13) +
      `frac x${(r.frac / base.frac).toFixed(2)}  clearing x${(r.succ / base.succ).toFixed(2)}`);
  }
}

L('\n' + '═'.repeat(78));
