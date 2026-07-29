/**
 * check:sigma-pi — headless verification of the MOLECULAR-ORBITAL engine
 * (`kind: "mo"` on the orbital_shapes scenario, #17 sigma/pi bonding).
 *
 * Same shape and same reason as check:hybrid-orbitals: tsc, the validators and
 * THE EYE all pass on frames whose MEANING is wrong, so this does not check that
 * the renderer compiles. It pulls the SHIPPED function bodies out of
 * FIELD_3D_RENDERER_CODE, runs them in node, and asserts they reproduce numbers
 * that were solved independently BEFORE any renderer code existed
 * (docs/concepts/chemistry/sigma_pi_bonding_skeleton.md sections 5b-5f, measured
 * by docs/concepts/chemistry/sigma_pi_physics.js and
 * docs/concepts/chemistry/sigma_pi_mo_builder.js).
 *
 * It re-derives nothing that it then checks against itself. Every expectation is
 * either a design-gate literal or a quantity this file measures with its OWN
 * implementation on a FINER grid than the renderer's — including the one that
 * matters most, the connected-component volume, so section 4 is a true
 * end-to-end proof that the drawn surface IS the measured region.
 *
 *   npm run check:sigma-pi
 */
import { FIELD_3D_RENDERER_CODE } from "../lib/renderers/field_3d_renderer";

const SRC = FIELD_3D_RENDERER_CODE;

/** Pull `function NAME(...) { ... }` out of the emitted renderer by brace matching. */
function grabFn(name: string): string {
  const start = SRC.indexOf("function " + name + "(");
  if (start < 0) throw new Error("function not found in renderer: " + name);
  const i = SRC.indexOf("{", start);
  let depth = 0;
  for (let j = i; j < SRC.length; j++) {
    if (SRC[j] === "{") depth++;
    else if (SRC[j] === "}") { depth--; if (depth === 0) return SRC.slice(start, j + 1); }
  }
  throw new Error("unbalanced braces reading " + name);
}
/** Pull `var NAME = <literal>;` (object/array/expression) by brace matching. */
function grabVar(name: string): string {
  const m = new RegExp("var " + name + "\\s*=").exec(SRC);
  if (!m) throw new Error("var not found in renderer: " + name);
  const eq = m.index + m[0].length;
  let i = eq;
  while (i < SRC.length && /\s/.test(SRC[i])) i++;
  if (SRC[i] === "{" || SRC[i] === "[") {
    const open = SRC[i], close = open === "{" ? "}" : "]";
    let depth = 0;
    for (let j = i; j < SRC.length; j++) {
      if (SRC[j] === open) depth++;
      else if (SRC[j] === close) { depth--; if (depth === 0) return SRC.slice(m.index, j + 1) + ";"; }
    }
    throw new Error("unbalanced literal reading " + name);
  }
  return SRC.slice(m.index, SRC.indexOf(";", i) + 1);
}

// Multi-declarator statements (`var A = 1, B = 2;`) are grabbed once, by their
// FIRST name — grabbing the second would find no `var` and throw.
const VARS = [
  "OS_A0", "OS_PM_PER_UNIT", "OS_ENCLOSURES", "OS_HYB_SIGN", "OS_ORB2S", "OS_ORB2P",
  "OS_INV_S4PI", "OS_SQRT3_4PI",
  "OS_MO_ZEFF_C", "OS_MO_BONDS_PM", "OS_MO_ENC", "OS_MO_GRID_N", "OS_MO_LAD_N",
  "OS_MO_ND", "OS_MO_RAY_STEP", "OS_MO_TWIST_LADDER_DEG", "OS_MO_MAX_PARTS",
  "OS_MO_MAX_LOBES", "OS_MO_MAX_OVL", "OS_MO_S0_N", "OS_MOS", "OS_ORBITALS", "OS_HYBRIDS", "OS_R3",
  "OS_MO_CONSTRUCTIVE_COLOR", "OS_MO_DESTRUCTIVE_COLOR"
];
const FNS = [
  "osClamp", "osSmooth01", "osRamp", "osR", "osHybPsi",
  "osMoBondPm", "osMoPmPerRho", "osMoBondRho", "osMoUnits", "osMoAxes", "osMoCenters",
  "osMoCentersAtPm", "osMoAtomPsi", "osMoTotalField", "osMoProductField",
  "osMoSampleGrid", "osMoLevel", "osMoComponents", "osMoRootTable", "osMoTableVolume",
  "osMoTableMax", "osMoOverlapS0", "osMoOverlap", "osMoOverlapRatio", "osMoSliderReadout",
  "osMoAtomReachRho", "osMoContactPm",
  "osMoAtomLevel", "osMoApproachAt", "osMoSignedField", "osBuildMoTwistLadder", "osMoLadderAt", "osBuildMO"
];
const EXPORTS = [
  ...VARS.map((v) => (v === "OS_MO_GRID_N" ? "OS_MO_GRID_N, OS_MO_GRID_EXT"
    : v === "OS_MO_LAD_N" ? "OS_MO_LAD_N, OS_MO_LAD_EXT"
    : v === "OS_MO_ND" ? "OS_MO_ND, OS_MO_NA"
    : v === "OS_MO_S0_N" ? "OS_MO_S0_N, OS_MO_S0_EXT" : v)),
  ...FNS
];

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const E = new Function([
  ...VARS.map(grabVar),
  ...FNS.map(grabFn),
  "return { " + EXPORTS.join(", ") + " };"
].join("\n"))() as any;

let failures = 0;
function check(label: string, got: number, want: number, tol: number, unit = "") {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) failures++;
  const fmt = (v: number) => (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(4)
    : v.toFixed(Math.abs(v) < 10 ? 6 : 2);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(52)} got ${fmt(got)}${unit}  want ${fmt(want)}${unit}`);
  return ok;
}

// ═══════════════════════════════════════════════════════════════════════════
// An INDEPENDENT implementation of the two-centre fields, written here against
// the shipped radial function only (osR / osHybPsi, both already gated by
// check:hybrid-orbitals). Nothing below calls the osMo* machinery it checks.
// ═══════════════════════════════════════════════════════════════════════════
const A0: number = E.OS_A0;
const Z_C = 6 - (3 * 0.35 + 2 * 0.85);            // Slater, carbon 2p = 3.25
const PM_PER_RHO = A0 / Z_C;
const BOND_PM = 133.9;                             // C=C
const Rb = BOND_PM / PM_PER_RHO;
const cA = [0, 0, -Rb / 2], cB = [0, 0, Rb / 2];
type V3 = number[];
function p2(p: V3, c: V3, ax: V3): number {
  const dx = p[0] - c[0], dy = p[1] - c[1], dz = p[2] - c[2];
  const r = Math.hypot(dx, dy, dz);
  if (r < 1e-9) return 0;
  return E.osR(E.OS_ORB2P, r) * E.OS_SQRT3_4PI * ((dx * ax[0] + dy * ax[1] + dz * ax[2]) / r);
}
function hyb(p: V3, c: V3, ax: V3): number {
  const dx = p[0] - c[0], dy = p[1] - c[1], dz = p[2] - c[2];
  const r = Math.hypot(dx, dy, dz);
  if (r < 1e-9) return 0;
  return E.osHybPsi({ f: 1 / 3 }, r, (dx * ax[0] + dy * ax[1] + dz * ax[2]) / r);
}
const piAxes = (phiDeg: number) => [[1, 0, 0], [Math.cos(phiDeg * Math.PI / 180), Math.sin(phiDeg * Math.PI / 180), 0]];
const refTotal = {
  sigma: (p: V3) => Math.pow(hyb(p, cA, [0, 0, 1]) + hyb(p, cB, [0, 0, -1]), 2),
  pi: (p: V3) => Math.pow(p2(p, cA, [1, 0, 0]) + p2(p, cB, [1, 0, 0]), 2)
};

// The design-gate grid: 121^3, half-extent 16 rho. FINER than the renderer's
// build grid (65^3 / 14), so section 4 is a real measurement of the shipped
// surface, not a restatement of the renderer's own voxel count.
const NG = 121, EXT = 16, step = 2 * EXT / (NG - 1), cell = step ** 3;
const at = (i: number) => -EXT + i * step;
const gidx = (i: number, j: number, k: number) => (i * NG + j) * NG + k;
function refSample(f: (p: V3) => number): Float64Array {
  const g = new Float64Array(NG * NG * NG);
  for (let i = 0; i < NG; i++) for (let j = 0; j < NG; j++) for (let k = 0; k < NG; k++)
    g[gidx(i, j, k)] = f([at(i), at(j), at(k)]);
  return g;
}
function refComponents(g: Float64Array, lev: number) {
  const seen = new Uint8Array(g.length), stack = new Int32Array(g.length), out: any[] = [];
  for (let s = 0; s < g.length; s++) {
    if (seen[s] || g[s] < lev) continue;
    let sp = 0; stack[sp++] = s; seen[s] = 1;
    let cnt = 0, sx = 0, sy = 0, sz = 0, zMin = 9e9, zMax = -9e9;
    while (sp > 0) {
      const n = stack[--sp];
      const k = n % NG, j = ((n - k) / NG) % NG, i = (n - k - j * NG) / (NG * NG);
      const z = at(k);
      cnt++; sx += at(i); sy += at(j); sz += z;
      if (z < zMin) zMin = z;
      if (z > zMax) zMax = z;
      const nb = [[i - 1, j, k], [i + 1, j, k], [i, j - 1, k], [i, j + 1, k], [i, j, k - 1], [i, j, k + 1]];
      for (const [a, b, c] of nb) {
        if (a < 0 || b < 0 || c < 0 || a >= NG || b >= NG || c >= NG) continue;
        const m = gidx(a, b, c);
        if (!seen[m] && g[m] >= lev) { seen[m] = 1; stack[sp++] = m; }
      }
    }
    out.push({ cells: cnt, vol: cnt * cell, centroid: [sx / cnt, sy / cnt, sz / cnt], spans: zMin < -Rb / 4 && zMax > Rb / 4 });
  }
  return out.sort((a, b) => b.cells - a.cells);
}

console.log("\n=== 0. THE LENGTH SCALE (skeleton 5a: Z_eff is physics, not polish) ===");
check("Slater Z_eff for carbon 2p", E.OS_MO_ZEFF_C, 3.25, 1e-9);
check("C=C bond length used by the engine", E.osMoBondPm(E.OS_MOS["pi_2p"]), 133.9, 1e-9, " pm");
check("shipped pm-per-rho at Z_eff", E.osMoPmPerRho(E.OS_MOS["pi_2p"]), PM_PER_RHO, 1e-9, " pm");
// The failure this prevents: at the shipped Z = 1 scale each 2p lobe reaches
// 3.6 bond lengths PAST the other nucleus — total interpenetration.
check("bond separation in rho at Z_eff", E.osMoBondRho(E.OS_MOS["pi_2p"]), Rb, 1e-9);

console.log("\n=== 1. THE SIGNED TWO-CENTRE FIELD ===");
// The shipped amplitude must be SIGNED and must agree with an independent
// implementation. If osMoAtomPsi silently squared (the shipped one-centre
// habit), every cancellation below would vanish and the pi bond would never
// break — so this is checked before anything is built on it.
{
  const mo = E.OS_MOS["pi_2p"];
  const probe: V3 = [2.0, -1.3, 0.7];
  const gotA = E.osMoAtomPsi(mo, probe, cA, [1, 0, 0]);
  check("pi psi_A at a probe point", gotA, p2(probe, cA, [1, 0, 0]), 1e-12);
  const mirrored = E.osMoAtomPsi(mo, [-probe[0], probe[1], probe[2]], cA, [1, 0, 0]);
  if (gotA * mirrored < 0) console.log("  PASS  the amplitude carries its SIGN (mirror flips it)");
  else { failures++; console.log("  FAIL  *** psi is sign-less — an MO cannot cancel ***"); }
  const so = E.OS_MOS["sigma_sp2"];
  const gotS = E.osMoAtomPsi(so, probe, cA, [0, 0, 1]);
  check("sigma psi_A (sp2 hybrid) at a probe point", gotS, hyb(probe, cA, [0, 0, 1]), 1e-12);
  // section 5c: the front lobe must be POSITIVE, which is what fixes the
  // bonding combination as psi_A + psi_B (OS_HYB_SIGN, #13's load-bearing minus).
  const front = E.osHybPsi({ f: 1 / 3 }, 3, +1), back = E.osHybPsi({ f: 1 / 3 }, 3, -1);
  if (front > 0 && Math.abs(front) > Math.abs(back)) {
    console.log(`  PASS  sp2 front lobe POSITIVE and dominant (|front|/|back| = ${(Math.abs(front) / Math.abs(back)).toFixed(2)})`);
  } else { failures++; console.log("  FAIL  *** the bonding combination psi_A + psi_B is wrong ***"); }
}

console.log("\n=== 2. THE OVERLAP INTEGRAL S(0) — measured, never asserted ===");
// The shipped S(0) is an OCTANT-symmetric quadrature. Recomputed here by the
// FULL triple sum (a different algorithm on the same grid) and cross-checked
// against the design-gate literal 0.270339 (sigma_pi_physics.js Q6).
function refOverlapPi(phiDeg: number): number {
  const [aA, aB] = piAxes(phiDeg);
  let s = 0;
  for (let i = 0; i < NG; i++) for (let j = 0; j < NG; j++) for (let k = 0; k < NG; k++) {
    const p: V3 = [at(i), at(j), at(k)];
    s += p2(p, cA, aA) * p2(p, cB, aB) * cell;
  }
  return s;
}
E.osBuildMO(E.OS_MOS["pi_2p"]);
E.osBuildMO(E.OS_MOS["sigma_sp2"]);
const moPi = E.OS_MOS["pi_2p"], moSig = E.OS_MOS["sigma_sp2"];
const refS0 = refOverlapPi(0);
check("shipped S(0) vs the FULL triple sum", moPi.S0, refS0, 1e-9);
check("shipped S(0) vs the design-gate literal", moPi.S0, 0.270339, 1e-5);

console.log("\n=== 3. THE cos(phi) LAW (skeleton 5d — derived, not fitted) ===");
{
  let maxDev = 0;
  for (const phi of [0, 15, 30, 45, 60, 75, 90]) {
    const shipped = E.osMoOverlap(moPi, phi);
    const quad = refOverlapPi(phi);
    const dev = Math.abs(shipped - quad);
    if (dev > maxDev) maxDev = dev;
    console.log(`    phi = ${String(phi).padStart(2)} deg   engine ${shipped.toFixed(6)}   quadrature ${quad.toFixed(6)}   |diff| ${dev.toExponential(2)}`);
  }
  check("max deviation from direct quadrature, 0-90 deg", maxDev, 0, 1e-6);
  check("S(90 deg) is exactly zero", Math.abs(E.osMoOverlap(moPi, 90)), 0, 1e-15);
  // The S3 <-> S6 contrast pair, asserted rather than described: the SAME input
  // motion leaves sigma untouched and kills pi. A sigma bond is cylindrically
  // symmetric about the bond axis, so rotation about it is a symmetry.
  check("sigma overlap is UNCHANGED by the same twist",
    E.osMoOverlap(moSig, 90) - E.osMoOverlap(moSig, 0), 0, 1e-15);
  if (Math.abs(E.osMoOverlap(moSig, 0)) < 1e-6) {
    failures++; console.log("  FAIL  *** sigma overlap is zero — it should be the largest number here ***");
  }
}

console.log("\n=== 4. TOPOLOGY + ROOT-TABLE FIDELITY (skeleton 5b/5c/5e) ===");
// The counts come from the design gate: at the 50% contour the MO field gives
// sigma = ONE bonding lump spanning both nuclei plus two back stubs, and pi =
// TWO lumps each spanning both nuclei, straddling a nodal plane. A translated
// atomic pool gives FOUR disconnected pi lobes that never touch — the
// misconception this concept exists to kill, rendered as the lesson.
for (const [id, wantParts, wantSpan] of [["sigma_sp2", 3, 1], ["pi_2p", 2, 2]] as [string, number, number][]) {
  const mo = E.OS_MOS[id];
  console.log(`  --- ${id} ---`);
  check(`${id} component count`, mo.partCount, wantParts, 0);
  check(`${id} components spanning both nuclei`, mo.spanCount, wantSpan, 0);
  // INDEPENDENT voxel measurement on the finer design-gate grid, against the
  // volume the SHIPPED root table encloses. This is the end-to-end proof that
  // the surface drawn on screen is the region that was measured.
  const g = refSample(id === "sigma_sp2" ? refTotal.sigma : refTotal.pi);
  const refComps = refComponents(g, mo.level);
  for (let n = 0; n < mo.parts.length; n++) {
    const tabVol = E.osMoTableVolume(mo.parts[n].tab, E.OS_MO_ND, E.OS_MO_NA);
    const ref = refComps[n];
    if (!ref) { failures++; console.log(`  FAIL  component ${n} has no independent counterpart`); continue; }
    const err = 100 * Math.abs(tabVol - ref.vol) / ref.vol;
    // Components under ~1000 voxels are only a few cells across, so the VOXEL
    // count is the coarser instrument there, not the table — the sigma back
    // stubs are 107 cells at the design grid. They are checked for existence
    // and tip, never for a percentage the grid cannot resolve.
    if (ref.cells >= 1000) check(`  part ${n} table volume vs independent voxels`, err, 0, 6, "%");
    else console.log(`  ----  part ${n} is a ${ref.cells}-cell stub (tip ${mo.parts[n].tipPm.toFixed(1)} pm) — below the voxel floor, existence only`);
    if (!(mo.parts[n].tipPm > 0)) { failures++; console.log(`  FAIL  part ${n} has zero extent`); }
  }
}

console.log("\n=== 4b. FIRST EXIT vs OUTERMOST ROOT (the bug the builder caught) ===");
// osHybRootTable takes the OUTERMOST crossing, which is right for ONE orbital.
// Here a ray leaving one pi sausage re-enters the OTHER, so the outermost root
// wraps both into a single surface. Proved rather than described: the same
// component, the same field, the two rules, side by side.
{
  const mo = E.OS_MOS["pi_2p"];
  const field = refTotal.pi;
  const origin = mo.parts[0].centroid;
  const lev = mo.level, ND = E.OS_MO_ND, NA = E.OS_MO_NA, rMax = 14, NSTEP = 240;
  const outermost = new Float64Array((ND + 1) * (NA + 1));
  for (let d = 0; d <= ND; d++) {
    const th = Math.PI * d / ND, st = Math.sin(th), ct = Math.cos(th);
    for (let a = 0; a <= NA; a++) {
      const az = 2 * Math.PI * a / NA;
      const dir = [st * Math.cos(az), ct, st * Math.sin(az)];
      let found = 0;
      for (let s = NSTEP; s >= 1; s--) {
        const t = s * rMax / NSTEP;
        if (field([origin[0] + dir[0] * t, origin[1] + dir[1] * t, origin[2] + dir[2] * t]) >= lev) { found = t; break; }
      }
      outermost[d * (NA + 1) + a] = found;
    }
  }
  const g = refSample(field);
  const refComps = refComponents(g, lev);
  const voxVol = refComps[0].vol;
  const firstExitVol = E.osMoTableVolume(mo.parts[0].tab, ND, NA);
  const outermostVol = E.osMoTableVolume(outermost, ND, NA);
  const errFirst = 100 * Math.abs(firstExitVol - voxVol) / voxVol;
  const errOuter = 100 * Math.abs(outermostVol - voxVol) / voxVol;
  console.log(`    voxel volume ${voxVol.toFixed(2)}   first-exit ${firstExitVol.toFixed(2)} (${errFirst.toFixed(2)}%)   outermost ${outermostVol.toFixed(2)} (${errOuter.toFixed(1)}%)`);
  check("SHIPPED (first exit) reproduces the component", errFirst, 0, 6, "%");
  if (errOuter > 50) console.log(`  PASS  the outermost-root rule would over-enclose by ${errOuter.toFixed(0)}% — the shipped choice is load-bearing`);
  else { failures++; console.log("  FAIL  *** the first-exit rule is no longer distinguishable — the guard has gone stale ***"); }
}

console.log("\n=== 5. THE TWIST LADDER — cancellation, never separation (5f) ===");
// THE DEFECT THAT WOULD HAVE SHIPPED: animating "the pi lumps come apart".
// They never come apart. What vanishes is the CONSTRUCTIVE region, and it
// vanishes because an equal DESTRUCTIVE region grows to annihilate it.
{
  const L = moPi.twistLadder;
  check("twist ladder rung count", L.length, E.OS_MO_TWIST_LADDER_DEG.length, 0);
  check("ladder spans 0 to 90 deg", L[L.length - 1].deg, 90, 0, " deg");
  console.log("    phi   constructive   destructive   engine S      cos(phi)");
  for (const r of L) {
    console.log(`    ${String(r.deg).padStart(3)}   ${r.posVol.toFixed(3).padStart(11)}   ${r.negVol.toFixed(3).padStart(11)}` +
      `   ${E.osMoOverlap(moPi, r.deg).toFixed(6).padStart(9)}   ${Math.cos(r.deg * Math.PI / 180).toFixed(4)}`);
  }
  const r0 = L[0], r90 = L[L.length - 1];
  check("no cancelling region at 0 deg", r90 === r0 ? 1 : r0.negVol, 0, 1e-9);
  check("constructive = destructive at 90 deg (they annihilate)",
    r90.posVol - r90.negVol, 0, 1e-6);
  if (!(r90.posVol > 0)) { failures++; console.log("  FAIL  *** nothing is drawn at 90 deg — the state would show an empty stage ***"); }
  // and the reinforcing region really does SHRINK on the way (the visible beat).
  const shrink = 100 * (1 - r90.posVol / r0.posVol);
  if (shrink > 60) console.log(`  PASS  the constructive region shrinks ${shrink.toFixed(0)}% from 0 to 90 deg`);
  else { failures++; console.log(`  FAIL  *** the constructive region barely moves (${shrink.toFixed(0)}%) — S6 has no visible beat ***`); }
  // Monotone: every rung smaller than the last, or the beat reads as a wobble.
  let mono = true;
  for (let i = 1; i < L.length; i++) if (L[i].posVol > L[i - 1].posVol + 1e-9) mono = false;
  if (mono) console.log("  PASS  constructive volume is monotone decreasing in the twist");
  else { failures++; console.log("  FAIL  *** constructive volume is not monotone — the ladder is inconsistent ***"); }
  // Every rung must carry BOTH constructive slots (a missing slot would mean a
  // sausage silently disappears mid-sweep) and a lerpable centroid everywhere.
  for (const r of L) {
    for (const key of ["pos", "neg"]) {
      for (let s = 0; s < 2; s++) {
        if (!r[key][s]) { failures++; console.log(`  FAIL  *** rung ${r.deg} deg has no ${key} slot ${s} — the lerp would tear ***`); }
      }
    }
  }
  // sigma gets a SINGLE rung: a twist about the bond axis is a symmetry of it.
  check("sigma ladder has exactly one rung", moSig.twistLadder.length, 1, 0);
  // ...and its constructive region is the S2 claim, made checkable: ONE lump
  // sitting ON the internuclear axis, centred at the bond midpoint. If this
  // ever became two lumps or drifted off centre, "end-on overlap builds ONE
  // bond lying on the axis" would be a caption over a different picture.
  const sr = moSig.twistLadder[0];
  const sigPos = sr.pos.filter((s: any) => s && s.voxVol > 0);
  check("sigma constructive region is ONE component", sigPos.length, 1, 0);
  if (sigPos.length) {
    const c = sigPos[0].centroid;
    check("  ...centred on the bond midpoint", Math.hypot(c[0], c[1], c[2]), 0, 0.2, " rho");
    if (!(sigPos[0].voxVol > 10 * sr.negVol)) {
      failures++; console.log("  FAIL  *** sigma's cancelling stubs are not negligible against its bond ***");
    } else {
      console.log(`  PASS  sigma reinforces ${sigPos[0].voxVol.toFixed(1)} vs ${sr.negVol.toFixed(1)} cancelling (${(100 * sr.negVol / sigPos[0].voxVol).toFixed(1)}%)`);
    }
  }
}

console.log("\n=== 5b. THE APPROACH BEAT (S2/S5 — NCERT 4.7 end-on vs sideways) ===");
// The founder's criterion for building this at all was that it is the syllabus's
// OWN language: a sigma bond is DEFINED by head-on overlap and a pi bond by
// sideways overlap. So the two motions have to be different events, not one ramp
// under two captions — and that is what is asserted here, from geometry the
// engine measured rather than from the parameter names.
{
  const AP = { from_pm: 340, at_ms: 400, duration_ms: 2600, settle_ms: 600, fade_ms: 900 };
  const END = AP.at_ms + AP.duration_ms;
  const DONE = END + AP.settle_ms + AP.fade_ms;
  for (const [id, mo] of [["sigma_sp2", moSig], ["pi_2p", moPi]] as [string, any][]) {
    console.log(`  --- ${id} ---`);
    // (1) it starts where it says and TERMINATES at the real bond separation.
    check(`${id} starts at from_pm`, E.osMoApproachAt(mo, AP.at_ms, AP).sepPm, AP.from_pm, 1e-9, " pm");
    check(`${id} lands on the real bond length`, E.osMoApproachAt(mo, END, AP).sepPm, mo.bondPmLive, 1e-9, " pm");
    check(`${id} stays there afterwards`, E.osMoApproachAt(mo, END + 5000, AP).sepPm, mo.bondPmLive, 1e-9, " pm");
    // (2) MONOTONE. A separation that wobbles reads as two atoms hunting for each
    // other, and would break the "cause moves first" reading outright.
    let mono = true, prev = 1e9, minStep = 1e9;
    for (let t = 0; t <= DONE + 800; t += 20) {
      const s = E.osMoApproachAt(mo, t, AP).sepPm;
      if (s > prev + 1e-12) mono = false;
      if (t > AP.at_ms + 200 && t < END - 200) minStep = Math.min(minStep, prev - s);
      prev = s;
    }
    if (mono) console.log("  PASS  separation is monotone non-increasing over the whole state");
    else { failures++; console.log("  FAIL  *** the approach is not monotone ***"); }
    if (minStep > 0) console.log("  PASS  and strictly decreasing while the approach runs");
    else { failures++; console.log("  FAIL  *** the approach stalls mid-travel ***"); }
    // (3) RULE 32a — the effect never starts before the cause finishes.
    let earliestFused = Infinity, worstBoth = 0;
    for (let t = 0; t <= DONE + 800; t += 10) {
      const a = E.osMoApproachAt(mo, t, AP);
      if (a.fusedF > 1e-9 && t < earliestFused) earliestFused = t;
      worstBoth = Math.max(worstBoth, Math.min(a.atomicF, a.fusedF));
      // complementary by construction: if this ever broke, a frame could show
      // separate atoms AND a finished bond both at full strength.
      if (Math.abs(a.atomicF + a.fusedF - 1) > 1e-12) {
        failures++; console.log(`  FAIL  *** the cross-fade is not complementary at t=${t} ***`); break;
      }
    }
    check(`${id} the fused surface starts only after the approach ends`,
      earliestFused - END, AP.settle_ms, 12, " ms");
    if (worstBoth <= 0.5 + 1e-9) console.log(`  PASS  the two representations are never both strong (max min = ${worstBoth.toFixed(3)})`);
    else { failures++; console.log("  FAIL  *** both representations reach full opacity together ***"); }
    // and the atoms are FULLY handed over by the time the beat is done.
    check(`${id} atomic picture is gone at the end`, E.osMoApproachAt(mo, DONE, AP).atomicF, 0, 1e-9);
  }
  // (4) THE DIFFERENCE. Same ramp, provably different geometry and different
  // events — measured off the contour the picture is drawn at.
  console.log("  --- end-on vs sideways, measured ---");
  const dot = (mo: any) => {
    const ax = E.osMoAxes(mo, 0).a;          // atom A's orbital axis
    return Math.abs(ax[2]);                  // ...against the travel direction, +z
  };
  check("sigma travels ALONG its orbital axis (end-on)", dot(moSig), 1, 1e-12);
  check("pi travels PERPENDICULAR to its orbital axis (sideways)", dot(moPi), 0, 1e-12);
  console.log(`    sigma reach ${(moSig.reachRho * E.osMoPmPerRho(moSig)).toFixed(1)} pm  -> surfaces touch at ${moSig.contactPm.toFixed(1)} pm  (bond ${moSig.bondPmLive} pm)`);
  console.log(`    pi    reach ${(moPi.reachRho * E.osMoPmPerRho(moPi)).toFixed(1)} pm  -> surfaces touch at ${moPi.contactPm.toFixed(1)} pm  (bond ${moPi.bondPmLive} pm)`);
  // The load-bearing asymmetry: sigma's drawn surfaces MEET partway through the
  // approach and then interpenetrate; pi's never meet at all, which is exactly
  // skeleton 5b (a translated-atomic pi is four lobes with a visible gap) and
  // exactly why the beat must hand over to the MO surface.
  if (moSig.contactsBeforeBond) console.log("  PASS  sigma: the two surfaces MEET during the approach (end-on overlap is large)");
  else { failures++; console.log("  FAIL  *** sigma's surfaces never meet — 'end-on overlap' is not being shown ***"); }
  if (!moPi.contactsBeforeBond) console.log("  PASS  pi: the two surfaces NEVER meet (sideways overlap is a flank, not a tip)");
  else { failures++; console.log("  FAIL  *** pi's surfaces meet head-on — the sideways geometry is wrong ***"); }
  // THE DISCRIMINATOR, and it is not a tuned threshold: the two contact
  // separations fall on OPPOSITE SIDES of the bond length. Expressed as the
  // fraction of the travel spent with the surfaces already touching, sigma
  // spends a large part of its approach fused and pi spends none of it — which
  // is "end-on overlap is large, sideways overlap is small" as a number.
  const contactFrac = (mo: any) => {
    const from = 340;  // the same authored start as the ramp above
    return Math.max(0, Math.min(1, (mo.contactPm - mo.bondPmLive) / (from - mo.bondPmLive)));
  };
  const fSig = contactFrac(moSig), fPi = contactFrac(moPi);
  console.log(`    travel spent in contact — sigma ${(100 * fSig).toFixed(1)}%   pi ${(100 * fPi).toFixed(1)}%`);
  if (moSig.contactPm > moSig.bondPmLive * 1.15 && moPi.contactPm < moPi.bondPmLive * 0.85) {
    console.log("  PASS  the two contact events straddle the bond length with margin — distinguishable motions, not one ramp twice");
  } else { failures++; console.log("  FAIL  *** S2 and S5 contact too near the bond length to read apart ***"); }
  check("sigma spends a quarter or more of its travel already touching", fSig > 0.25 ? 1 : 0, 1, 0);
  check("pi never touches at any point of its travel", fPi, 0, 0);
  // (5) the moving parts stay together: both nuclei are at +/- sep/2 at EVERY
  // instant, which is what stops a lobe sliding away from its own nucleus.
  let paired = true;
  for (let t = 0; t <= DONE; t += 50) {
    const s = E.osMoApproachAt(moPi, t, AP).sepPm;
    const c = E.osMoCentersAtPm(moPi, s);
    const gotPm = (c[1][2] - c[0][2]) * E.osMoPmPerRho(moPi);
    if (Math.abs(gotPm - s) > 1e-9 || Math.abs(c[0][2] + c[1][2]) > 1e-12) paired = false;
  }
  if (paired) console.log("  PASS  both centres are symmetric about the origin and exactly sep apart, always");
  else { failures++; console.log("  FAIL  *** the two centres drift out of register ***"); }
}

console.log("\n=== 5c. MULTI-MO (NCERT 4.7: a double bond IS one sigma plus one pi) ===");
// The root limitation this closes: mo.orbital was singular, so the state whose
// job is to COMPARE the two bonds could only show one of them, and "triple: one
// sigma, two pi" was a caption counting three objects over a picture holding two
// (the VSEPR missing-fourth-methane-bond class).
{
  // (1) each declared MO is built INDEPENDENTLY and keeps its own contour. A
  //     jointly-solved level would be a contour of a field that does not exist.
  check("sigma and pi have DIFFERENT solved levels",
    Math.abs(moSig.level - moPi.level) > 1e-6 ? 1 : 0, 1, 0);
  check("sigma and pi have DIFFERENT overlap-region levels",
    Math.abs(moSig.ovLevel - moPi.ovLevel) > 1e-9 ? 1 : 0, 1, 0);
  check("...and different component counts", moSig.partCount - moPi.partCount, 1, 0);
  if (moSig.parts[0].tab !== moPi.parts[0].tab) console.log("  PASS  neither MO shares a root table with the other");
  else { failures++; console.log("  FAIL  *** the two MOs share tables — one was solved from the other ***"); }

  // (2) THE PAYOFF, in one state: the SAME twist leaves sigma untouched and
  //     collapses pi. Previously impossible to show; now assertable.
  console.log("    phi    sigma S/S0    pi S/S0     cos(phi)");
  let sigDrift = 0, piMax = 0;
  for (const phi of [0, 30, 45, 60, 90]) {
    const rs = E.osMoOverlapRatio(moSig, phi), rp = E.osMoOverlapRatio(moPi, phi);
    sigDrift = Math.max(sigDrift, Math.abs(rs - 1));
    piMax = Math.max(piMax, Math.abs(rp - Math.cos(phi * Math.PI / 180)));
    console.log(`    ${String(phi).padStart(3)}    ${rs.toFixed(6)}     ${rp.toFixed(6)}    ${Math.cos(phi * Math.PI / 180).toFixed(6)}`);
  }
  check("sigma is INVARIANT under the twist (cylindrical symmetry)", sigDrift, 0, 1e-12);
  check("pi follows cos(phi) over the same twist", piMax, 0, 5e-4);

  // (3) the pools can actually hold sigma + two pi systems at once.
  const need = moSig.partCount + 2 * moPi.partCount;
  check("surface pool holds sigma + two pi systems", E.OS_MO_MAX_PARTS >= need ? 1 : 0, 1, 0);
  console.log(`    the triple bond needs ${need} surface slots; the pool has ${E.OS_MO_MAX_PARTS}`);
  check("lobe pool holds sigma + two pi lobe sets", E.OS_MO_MAX_LOBES >= 2 + 4 + 4 ? 1 : 0, 1, 0);
  check("overlap pool holds two MOs' regions", E.OS_MO_MAX_OVL >= 8 ? 1 : 0, 1, 0);

  // (4) COUNTABILITY IS A COLOUR PROBLEM NOW. sigma and pi share a frame for the
  //     first time, so every pair of things a state can be asked to count must be
  //     perceptually apart. Measured as CIELAB dE, never chosen by eye — the
  //     cyan/blue defect read fine in the source and only failed in pixels.
  const lab = (hex: string) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    const r = c[0], g = c[1], b = c[2];
    const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
    const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  };
  const dE = (a: string, b: string) => {
    const A = lab(a), B = lab(b);
    return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
  };
  const palette: Record<string, string> = {
    nuclei: "#FF5252", atomic_plus: moPi.lobePos, atomic_minus: moPi.lobeNeg,
    sigma_mo: moSig.color, pi_mo: moPi.color,
    constructive: E.OS_MO_CONSTRUCTIVE_COLOR, destructive: E.OS_MO_DESTRUCTIVE_COLOR
  };
  const pk = Object.keys(palette);
  let worst = Infinity, worstPair = "";
  for (let a = 0; a < pk.length; a++) {
    for (let b = a + 1; b < pk.length; b++) {
      const d = dE(palette[pk[a]], palette[pk[b]]);
      if (d < worst) { worst = d; worstPair = pk[a] + "/" + pk[b]; }
    }
  }
  console.log(`    closest pair in the whole palette: ${worstPair} at dE ${worst.toFixed(1)}`);
  // 30 is the floor the SHIPPED nuclei red vs the cancelling magenta already
  // sets; anything a colour edit drops below it is a countability regression.
  check("every drawable pair is perceptually separable (dE > 30)", worst > 30 ? 1 : 0, 1, 0);
  const dSigPi = dE(moSig.color, moPi.color);
  console.log(`    sigma vs pi surfaces: dE ${dSigPi.toFixed(1)} (violet, the previous choice, scored 19.6)`);
  check("sigma and pi surfaces are countable apart", dSigPi > 45 ? 1 : 0, 1, 0);
}

console.log("\n=== 5d. THE RATIO READOUT (S/S0, not two incomparable absolutes) ===");
// chemistry_author designed a self-normalised instrument for a reason: printing
// sigma 0.745 in one state and pi 0.270 three states later invites "pi is 36% of
// sigma", while the same concept teaches 76% from the bond enthalpies (266/348).
// Both numbers are correct and they are NOT comparable — different orbital
// shapes, and an overlap integral is not proportional to a bond energy (skeleton
// limit 2). The ratio asks the only question this instrument can answer.
{
  check("sigma ratio at rest", E.osMoOverlapRatio(moSig, 0), 1, 1e-12);
  check("pi ratio at rest", E.osMoOverlapRatio(moPi, 0), 1, 1e-12);
  check("pi ratio at 45 deg is cos 45", E.osMoOverlapRatio(moPi, 45), Math.SQRT1_2, 1e-12);
  // EXACT zero, not 6.1e-17 rendered as a signed zero on the payoff frame.
  const r90 = E.osMoOverlapRatio(moPi, 90);
  check("pi ratio at 90 deg is a TRUE zero", r90, 0, 0);
  if (Object.is(r90, -0)) { failures++; console.log("  FAIL  *** the ratio is negative zero — it would render as −0.000 ***"); }
  else console.log("  PASS  and it is +0, so no state can print −0.000");
  check("sigma ratio at 90 deg is still 1", E.osMoOverlapRatio(moSig, 90), 1, 1e-12);
  // the slider's inline readout must follow the SAME mode, or the panel and the
  // HUD disagree inside one frame (the gas_box rate-bar scar).
  const g: any = globalThis as any;
  g.window = g.window || {};
  g.window.PM_osMoReadout = "ratio";
  check("slider inline readout, ratio mode @45", Number(E.osMoSliderReadout(moPi, 45)), 0.707, 1e-9);
  check("slider inline readout, ratio mode @90", Number(E.osMoSliderReadout(moPi, 90)), 0, 0);
  g.window.PM_osMoReadout = "absolute";
  check("slider inline readout, absolute mode @45", Number(E.osMoSliderReadout(moPi, 45)), 0.191, 5e-4);
  console.log("  ----  absolute stays the DEFAULT, so nothing that already reads S regresses");
}

console.log("\n=== 6. DETERMINISM (Rule 36 — SET_TIME_FREEZE must be byte-identical) ===");
// Everything the frame reads is a build-time table. Rebuilding must reproduce
// it bit for bit, or a re-seeded cache would produce a different frozen frame
// from the baseline it is compared against.
{
  const before = {
    level: moPi.level, S0: moPi.S0, ov: moPi.ovLevel,
    c0: moPi.parts[0].centroid.slice(), tab0: Array.from(moPi.parts[0].tab.slice(0, 64)),
    lad: moPi.twistLadder.map((r: any) => [r.posVol, r.negVol])
  };
  E.osBuildMO(moPi);
  let same = before.level === moPi.level && before.S0 === moPi.S0 && before.ov === moPi.ovLevel;
  for (let i = 0; i < 3; i++) same = same && before.c0[i] === moPi.parts[0].centroid[i];
  for (let i = 0; i < 64; i++) same = same && before.tab0[i] === moPi.parts[0].tab[i];
  moPi.twistLadder.forEach((r: any, i: number) => {
    same = same && before.lad[i][0] === r.posVol && before.lad[i][1] === r.negVol;
  });
  if (same) console.log("  PASS  a full rebuild reproduces every table bit for bit");
  else { failures++; console.log("  FAIL  *** the MO build is not deterministic ***"); }
  // The component sort must be deterministic too: the two pi lumps are exactly
  // the same size, so a size-only sort could swap them between rungs and the
  // per-slot lerp would drag a surface across the screen.
  const cs = moPi.parts.map((p: any) => p.centroid[0]);
  if (cs[0] < cs[1]) console.log("  PASS  equal-size components are ordered deterministically (x ascending)");
  else { failures++; console.log("  FAIL  *** equal-size components have no stable order ***"); }
}

console.log(failures === 0
  ? "\nALL SIGMA/PI CHECKS PASS\n"
  : `\n*** ${failures} SIGMA/PI CHECK(S) FAILED ***\n`);
process.exit(failures === 0 ? 0 : 1);
