/**
 * sigma_pi_physics.js — settle the physics BEFORE any renderer code exists.
 *
 * The stated top lesson of the hybridisation session: "the defect that no gate
 * can see is the one you settle before you build." That session found that the
 * natural way to write a hybrid puts 82.5% of the electron behind the atom —
 * renders beautifully, passes every gate, teaches the inverse of the concept.
 *
 * This harness asks the equivalent question for sigma/pi, which the pattern doc
 * claims is "one line" of engine work (a per-lobe origin offset):
 *
 *   Q1  CONTROL — does this implementation reproduce a number already on master?
 *   Q2  SCALE — the shipped orbitals are hydrogenic Z=1. A Z=1 carbon 2p tip is
 *       482 pm and a C=C bond is 134 pm, so at shipped scale each lobe reaches
 *       3.6 bond lengths PAST the other nucleus. Does the picture survive that?
 *   Q3  THE REAL QUESTION — is "the same lobe pool, translated" actually a
 *       picture of a BOND? A bond is one molecular orbital, psi_A +/- psi_B.
 *       Two translated atomic lobes are two atoms standing near each other,
 *       which is the misconception this concept exists to kill.
 *       Measured, not asserted: connectivity + density on the bond axis.
 *
 * Every radial function is PULLED FROM THE SHIPPED RENDERER, never re-typed, so
 * every number below is commensurable with atomic_orbitals_s_p_d and
 * hybridisation_sp_sp2_sp3 on master.
 *
 *   node docs/concepts/chemistry/sigma_pi_physics.js
 */
const fs = require("fs");
const path = require("path");

const SRC = fs.readFileSync(
  path.join(__dirname, "../../../src/lib/renderers/field_3d_renderer.ts"), "utf8");

function grabFn(name) {
  const start = SRC.indexOf("function " + name + "(");
  if (start < 0) throw new Error("function not found in renderer: " + name);
  let i = SRC.indexOf("{", start), depth = 0;
  for (let j = i; j < SRC.length; j++) {
    if (SRC[j] === "{") depth++;
    else if (SRC[j] === "}") { depth--; if (depth === 0) return SRC.slice(start, j + 1); }
  }
  throw new Error("unbalanced braces reading " + name);
}
function grabVar(name) {
  const m = new RegExp("var " + name + "\\s*=").exec(SRC);
  if (!m) throw new Error("var not found in renderer: " + name);
  const end = SRC.indexOf(";", m.index + m[0].length);
  return SRC.slice(m.index, end + 1);
}

// osR is the SHIPPED radial function R_nl(rho). osClamp/osNorm are its helpers.
const E = new Function([
  grabVar("OS_A0"), grabVar("OS_PM_PER_UNIT"),
  grabFn("osClamp"), grabFn("osNorm"), grabFn("osR"),
  "return { OS_A0: OS_A0, OS_PM_PER_UNIT: OS_PM_PER_UNIT, osR: osR };"
].join("\n"))();

const A0 = E.OS_A0;                       // 52.9177 pm
const ORB2P = { n: 2, l: 1 }, ORB1S = { n: 1, l: 0 };

// ── SIGNED wavefunctions (the renderer only ever needed |psi|^2; an MO needs
//    the sign, because the whole point is that the two lobes ADD or CANCEL).
const INV_S4PI = 1 / Math.sqrt(4 * Math.PI);
const SQRT3_4PI = Math.sqrt(3 / (4 * Math.PI));

/** psi_2p at world point p (in units of a0/Z), nucleus at c, lobe axis a. */
function psi2p(p, c, a) {
  const dx = p[0] - c[0], dy = p[1] - c[1], dz = p[2] - c[2];
  const r = Math.hypot(dx, dy, dz);
  if (r < 1e-9) return 0;
  const cosA = (dx * a[0] + dy * a[1] + dz * a[2]) / r;
  return E.osR(ORB2P, r) * SQRT3_4PI * cosA;      // signed: cosA carries it
}
function psi1s(p, c) {
  const r = Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]);
  return E.osR(ORB1S, r) * INV_S4PI;
}

let fails = 0;
function check(label, got, want, tol, unit) {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) fails++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}: ${got.toFixed(3)}${unit || ""} ` +
    `(expected ${want}${unit || ""} +/- ${tol})`);
}

// ═══════════════════════════════════════════════════════════════════════════
// Q1 — CONTROL. Reproduce the 2p tip already shipped by atomic_orbitals_s_p_d.
// ═══════════════════════════════════════════════════════════════════════════
console.log("\nQ1 CONTROL — reproduce a number already on master");

const LEV90_2P = 8.0806e-5 * 0;   // (hybrid levels are for hybrids; solve 2p's own)
// Solve the 2p 90% iso-level from scratch on the shipped R21, by bisection on
// enclosed probability, exactly as the shipped concept did offline.
function encl2p(lev) {
  // |psi|^2 = R^2 * (3/4pi) cos^2. Integrate over r,theta (axial symmetry).
  const NR = 4000, NT = 800, rMax = 40;
  let inside = 0, total = 0;
  for (let i = 0; i < NR; i++) {
    const r = (i + 0.5) * rMax / NR, R = E.osR(ORB2P, r), R2 = R * R;
    for (let j = 0; j < NT; j++) {
      const th = (j + 0.5) * Math.PI / NT, c = Math.cos(th);
      const d = R2 * (3 / (4 * Math.PI)) * c * c;
      const w = r * r * Math.sin(th) * (rMax / NR) * (Math.PI / NT) * 2 * Math.PI;
      total += d * w;
      if (d >= lev) inside += d * w;
    }
  }
  return inside / total;
}
let lo = 1e-9, hi = 1e-2;
for (let k = 0; k < 60; k++) { const mid = Math.sqrt(lo * hi); if (encl2p(mid) > 0.90) lo = mid; else hi = mid; }
const LEV90 = Math.sqrt(lo * hi);
// tip = outermost rho on the lobe axis where R^2 * 3/4pi == LEV90
function tipRho(lev, axisFactor) {
  let r = 40;
  while (r > 0.01) { const R = E.osR(ORB2P, r); if (R * R * axisFactor >= lev) return r; r -= 0.001; }
  return 0;
}
const tip2p_rho = tipRho(LEV90, 3 / (4 * Math.PI));
check("2p 90% tip (Z=1)", tip2p_rho * A0, 482, 3, " pm");

// ═══════════════════════════════════════════════════════════════════════════
// Q2 — SCALE. Slater Z_eff, and what it does to the overlap picture.
// ═══════════════════════════════════════════════════════════════════════════
console.log("\nQ2 SCALE — shipped Z=1 orbitals vs a real bond length");

// Slater's rules, carbon 1s2 2s2 2p2, screening of a 2p electron:
//   3 other n=2 electrons x 0.35 = 1.05 ; 2 n=1 electrons x 0.85 = 1.70
const Z_C = 6 - (3 * 0.35 + 2 * 0.85);
check("Z_eff carbon 2p (Slater)", Z_C, 3.25, 0.001, "");

const BOND = { CC_single: 153.5, CC_double: 133.9, CC_triple: 120.3, HH: 74.1 };
const tip_Z1 = tip2p_rho * A0;
const tip_Zc = tip_Z1 / Z_C;
console.log(`  2p 90% tip: ${tip_Z1.toFixed(1)} pm at Z=1  ->  ${tip_Zc.toFixed(1)} pm at Z_eff=${Z_C}`);
for (const k of Object.keys(BOND)) {
  const ratio_Z1 = tip_Z1 / BOND[k], ratio_Zc = tip_Zc / BOND[k];
  console.log(`  ${k.padEnd(11)} ${String(BOND[k]).padStart(5)} pm   ` +
    `tip/bond = ${ratio_Z1.toFixed(2)} (Z=1)  ->  ${ratio_Zc.toFixed(2)} (Z_eff)`);
}

// ═══════════════════════════════════════════════════════════════════════════
// Q3 — IS "TWO TRANSLATED LOBES" A PICTURE OF A BOND?
//     Grid the real MO density and the naive translated-atomic picture, and
//     measure the two things a student is asked to read off the screen:
//       (a) is the sigma surface ONE connected object spanning both nuclei?
//       (b) how much density actually sits BETWEEN the nuclei / ABOVE the axis?
// ═══════════════════════════════════════════════════════════════════════════
console.log("\nQ3 MO vs translated-atomic — measured on a grid");

const Rb = BOND.CC_double * Z_C / A0;    // C=C separation in rho units at Z_eff
console.log(`  C=C separation = ${BOND.CC_double} pm = ${Rb.toFixed(3)} rho at Z_eff=${Z_C}`);
const cA = [0, 0, -Rb / 2], cB = [0, 0, +Rb / 2];   // bond axis = z

/** Density fields. axis 'z' = head-on (sigma from 2p_z); 'x' = sideways (pi). */
function fieldMO(p, mode) {
  if (mode === "sigma") {
    // head-on: both lobe axes along +z, so the two orbitals point AT each other.
    // psi_A(+z lobe) meets psi_B(-z lobe): bonding combination is psi_A - psi_B.
    return Math.pow(psi2p(p, cA, [0, 0, 1]) - psi2p(p, cB, [0, 0, 1]), 2);
  }
  // sideways: both lobe axes along +x, perpendicular to the bond axis z.
  return Math.pow(psi2p(p, cA, [1, 0, 0]) + psi2p(p, cB, [1, 0, 0]), 2);
}
function fieldAtomic(p, mode) {
  // the "translated pool" picture: two INDEPENDENT atomic densities, max-blended
  // (which is what two overlapping translucent iso-surfaces show on screen).
  const a = mode === "sigma" ? [0, 0, 1] : [1, 0, 0];
  return Math.max(Math.pow(psi2p(p, cA, a), 2), Math.pow(psi2p(p, cB, a), 2));
}

const NG = 121, EXT = 16;      // grid half-extent in rho
const step = 2 * EXT / (NG - 1);
const idx = (i, j, k) => (i * NG + j) * NG + k;
function build(fn, mode) {
  const g = new Float64Array(NG * NG * NG);
  for (let i = 0; i < NG; i++) for (let j = 0; j < NG; j++) for (let k = 0; k < NG; k++) {
    g[idx(i, j, k)] = fn([-EXT + i * step, -EXT + j * step, -EXT + k * step], mode);
  }
  return g;
}
/** iso-level enclosing `frac` of the grid's total probability. */
function levelFor(g, frac) {
  const cell = step * step * step;
  let tot = 0; for (let n = 0; n < g.length; n++) tot += g[n] * cell;
  const vals = Array.from(g).filter(v => v > 0).sort((a, b) => b - a);
  let acc = 0;
  for (const v of vals) { acc += v * cell; if (acc >= frac * tot) return v; }
  return vals[vals.length - 1];
}
/** number of connected components of {g >= lev}, and whether one contains both nuclei. */
function components(g, lev) {
  const seen = new Uint8Array(g.length);
  const comps = [];
  const stack = [];
  for (let s = 0; s < g.length; s++) {
    if (seen[s] || g[s] < lev) continue;
    let size = 0; const cells = [];
    stack.push(s); seen[s] = 1;
    while (stack.length) {
      const n = stack.pop(); size++; cells.push(n);
      const k = n % NG, j = ((n - k) / NG) % NG, i = (n - k - j * NG) / (NG * NG);
      const nb = [[i-1,j,k],[i+1,j,k],[i,j-1,k],[i,j+1,k],[i,j,k-1],[i,j,k+1]];
      for (const [a, b, c] of nb) {
        if (a < 0 || b < 0 || c < 0 || a >= NG || b >= NG || c >= NG) continue;
        const m = idx(a, b, c);
        if (!seen[m] && g[m] >= lev) { seen[m] = 1; stack.push(m); }
      }
    }
    comps.push({ size, cells });
  }
  return comps.sort((a, b) => b.size - a.size);
}
/** does component c straddle the plane z=0 with cells on BOTH sides beyond +/- Rb/4? */
function straddles(c) {
  let neg = false, pos = false;
  for (const n of c.cells) {
    const k = n % NG, z = -EXT + k * step;
    if (z < -Rb / 4) neg = true;
    if (z > Rb / 4) pos = true;
    if (neg && pos) return true;
  }
  return false;
}

for (const mode of ["sigma", "pi"]) {
  console.log(`\n  --- ${mode.toUpperCase()} ---`);
  const gMO = build(fieldMO, mode), gAT = build(fieldAtomic, mode);
  for (const frac of [0.9, 0.7, 0.5]) {
    const lMO = levelFor(gMO, frac), lAT = levelFor(gAT, frac);
    const cMO = components(gMO, lMO), cAT = components(gAT, lAT);
    const spanMO = cMO.filter(straddles).length, spanAT = cAT.filter(straddles).length;
    console.log(`  enc ${(frac * 100).toFixed(0)}%  MO: ${String(cMO.length).padStart(2)} parts` +
      ` (${spanMO} spanning both nuclei)   |   translated-atomic: ` +
      `${String(cAT.length).padStart(2)} parts (${spanAT} spanning)`);
  }
  // density ON the bond axis at the midpoint, relative to each atom's own peak
  const mid = mode === "sigma" ? [0, 0, 0] : [0, 0, 0];
  const probe = mode === "sigma" ? [0, 0, 0] : [Math.max(1e-6, 2.0), 0, 0];
  const dMO = fieldMO(probe, mode), dAT = fieldAtomic(probe, mode);
  console.log(`  midpoint density  MO ${dMO.toExponential(3)}  vs  translated-atomic ` +
    `${dAT.toExponential(3)}   ratio ${(dMO / Math.max(dAT, 1e-300)).toFixed(2)}x`);
}

// ═══════════════════════════════════════════════════════════════════════════
// Q4 — HOW EXPENSIVE IS THE ENGINE? The shipped lobe mesh is a STAR-SHAPED
//     surface about one origin: osLobeGeometry maps (delta, azimuth) -> radius.
//     If each MO component is star-shaped about some origin, the shipped mesh
//     pipeline is reused with a 2-D root table (the hybrid's 1-D table, one
//     dimension wider). If it is NOT, this needs marching cubes — a different
//     and much larger build. Measure it; do not guess.
// ═══════════════════════════════════════════════════════════════════════════
console.log("\nQ4 ENGINE COST — is each MO component star-shaped?");

// The question is per-COMPONENT: a ray leaving the sigma central lobe and
// entering a back lobe is two components, not a non-star-shaped one. So build
// the component mask first and cast rays against THAT.
function maskOf(comp) {
  const m = new Uint8Array(NG * NG * NG);
  for (const n of comp.cells) m[n] = 1;
  return m;
}
function inMask(m, p) {
  const i = Math.round((p[0] + EXT) / step), j = Math.round((p[1] + EXT) / step),
        k = Math.round((p[2] + EXT) / step);
  if (i < 0 || j < 0 || k < 0 || i >= NG || j >= NG || k >= NG) return 0;
  return m[idx(i, j, k)];
}
/** centroid of a component, in rho */
function centroid(comp) {
  let sx = 0, sy = 0, sz = 0;
  for (const n of comp.cells) {
    const k = n % NG, j = ((n - k) / NG) % NG, i = (n - k - j * NG) / (NG * NG);
    sx += -EXT + i * step; sy += -EXT + j * step; sz += -EXT + k * step;
  }
  const L = comp.cells.length;
  return [sx / L, sy / L, sz / L];
}
/** Fraction of rays from `o` that ENTER the component more than once. */
function starTestMask(m, o, rMax) {
  let rays = 0, bad = 0, worst = 0;
  const NA = 60, NB = 120, N = 600;
  for (let a = 0; a < NA; a++) {
    const th = (a + 0.5) * Math.PI / NA, st = Math.sin(th), ct = Math.cos(th);
    for (let b = 0; b < NB; b++) {
      const ph = (b + 0.5) * 2 * Math.PI / NB;
      const d = [st * Math.cos(ph), st * Math.sin(ph), ct];
      let entries = 0, prev = inMask(m, o);
      for (let i = 1; i <= N; i++) {
        const t = i * rMax / N;
        const cur = inMask(m, [o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t]);
        if (cur && !prev) entries++;
        prev = cur;
      }
      rays++;
      if (entries > 1) { bad++; if (entries > worst) worst = entries; }
    }
  }
  return { pct: 100 * bad / rays, worst };
}

for (const mode of ["sigma", "pi"]) {
  const g = build(fieldMO, mode);
  const lev = levelFor(g, 0.5);          // the enclosure a multi-lobe scene must use
  const comps = components(g, lev);
  console.log(`  ${mode.toUpperCase()} enc50 — ${comps.length} components ` +
    `(sizes ${comps.slice(0, 4).map(c => c.size).join(", ")})`);
  comps.slice(0, 3).forEach((c, n) => {
    const m = maskOf(c), o = centroid(c);
    const r = starTestMask(m, o, 16);
    console.log(`    component ${n} (${c.size} cells, centroid ` +
      `[${o.map(v => v.toFixed(2)).join(", ")}]): ${r.pct.toFixed(1)}% of rays re-enter ` +
      `(max ${r.worst})  -> ${r.pct < 1.0 ? "STAR-SHAPED — reuse the shipped mesh pipeline"
        : "NOT star-shaped — needs marching cubes"}`);
  });
}

console.log(`\n${fails === 0 ? "ALL CONTROLS PASS" : fails + " CONTROL FAILURE(S)"}\n`);
process.exit(fails === 0 ? 0 : 1);
