/**
 * sigma_pi_mo_builder.js — the MO surface builder, verified BEFORE it goes near
 * the renderer.
 *
 * This is the algorithm that will become `kind: "mo"` on the orbital_shapes
 * scenario. It is written here first, standalone, so that its output can be
 * checked against numbers already measured in sigma_pi_physics.js — the same
 * order #13 used (physics headless -> renderer -> check:hybrid-orbitals pulls
 * the shipped bodies back out and re-asserts them).
 *
 * WHAT IT PRODUCES, per (molecular orbital, enclosure):
 *   components: [{ centroid, rootTable(NDelta x NAzim), tipPm, cells }]
 * Each component is a STAR-SHAPED surface about its own centroid (measured:
 * 0.0-0.1% ray re-entry), so it feeds the shipped osLobeGeometry-style
 * (delta, azimuth) -> radius mesh pipeline unchanged. #13's hybrid needed a 1-D
 * table because a hybrid is a surface of revolution; a pi sausage is not, so
 * this is the same idea one dimension wider.
 *
 * Everything is built ONCE and read as a pure lookup afterwards, so the
 * SET_TIME_FREEZE byte-identical guarantee is untouched (Rule 36).
 *
 *   node docs/concepts/chemistry/sigma_pi_mo_builder.js
 */
const fs = require("fs");
const path = require("path");

const SRC = fs.readFileSync(
  path.join(__dirname, "../../../src/lib/renderers/field_3d_renderer.ts"), "utf8");
function grabFn(name) {
  const start = SRC.indexOf("function " + name + "(");
  if (start < 0) throw new Error("function not found: " + name);
  let i = SRC.indexOf("{", start), depth = 0;
  for (let j = i; j < SRC.length; j++) {
    if (SRC[j] === "{") depth++;
    else if (SRC[j] === "}") { depth--; if (depth === 0) return SRC.slice(start, j + 1); }
  }
  throw new Error("unbalanced braces: " + name);
}
function grabVar(name) {
  const m = new RegExp("var " + name + "\\s*=").exec(SRC);
  if (!m) throw new Error("var not found: " + name);
  return SRC.slice(m.index, SRC.indexOf(";", m.index + m[0].length) + 1);
}
const E = new Function([
  grabVar("OS_A0"), grabVar("OS_HYB_SIGN"), grabVar("OS_ORB2S"), grabVar("OS_ORB2P"),
  grabVar("OS_INV_S4PI"), grabVar("OS_SQRT3_4PI"),
  grabFn("osClamp"), grabFn("osR"), grabFn("osHybPsi"),
  "return { OS_A0:OS_A0, osR:osR, osHybPsi:osHybPsi, OS_SQRT3_4PI:OS_SQRT3_4PI };"
].join("\n"))();

const A0 = E.OS_A0;
const Z_C = 6 - (3 * 0.35 + 2 * 0.85);        // Slater, carbon 2p  = 3.25
const PM_PER_RHO = A0 / Z_C;                   // rho -> pm at Z_eff

// ── the two molecular orbitals this concept ships ──────────────────────────
const BOND_PM = { double: 133.9, triple: 120.3, single: 153.5 };

function makeMO(kind, bondPm, twistDeg) {
  const Rb = bondPm / PM_PER_RHO;
  const cA = [0, 0, -Rb / 2], cB = [0, 0, +Rb / 2];
  const ph = (twistDeg || 0) * Math.PI / 180;
  if (kind === "sigma") {
    // sp2-sp2 head-on: both big lobes point AT each other, both positive in the
    // overlap region, so the BONDING combination is psi_A + psi_B (section 5c).
    const f = 1 / 3;
    const hy = (p, c, ax) => {
      const d = [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
      const r = Math.hypot(d[0], d[1], d[2]);
      if (r < 1e-9) return 0;
      return E.osHybPsi({ f: f }, r, (d[0] * ax[0] + d[1] * ax[1] + d[2] * ax[2]) / r);
    };
    return { Rb, cA, cB, field: (p) => Math.pow(hy(p, cA, [0, 0, 1]) + hy(p, cB, [0, 0, -1]), 2) };
  }
  // pi: unhybridised 2p on each carbon, perpendicular to the bond axis.
  // B's orbital is TWISTED by phi about the bond axis -- the S6 payoff.
  const p2 = (p, c, ax) => {
    const d = [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
    const r = Math.hypot(d[0], d[1], d[2]);
    if (r < 1e-9) return 0;
    return E.osR(E_ORB2P, r) * E.OS_SQRT3_4PI * ((d[0] * ax[0] + d[1] * ax[1] + d[2] * ax[2]) / r);
  };
  const aAx = [1, 0, 0], bAx = [Math.cos(ph), Math.sin(ph), 0];
  return { Rb, cA, cB, field: (p) => Math.pow(p2(p, cA, aAx) + p2(p, cB, bAx), 2) };
}
const E_ORB2P = { n: 2, l: 1 };

// ── grid + components ──────────────────────────────────────────────────────
const NG = 121, EXT = 16, step = 2 * EXT / (NG - 1);
const idx = (i, j, k) => (i * NG + j) * NG + k;
const at = (i) => -EXT + i * step;

function sample(field) {
  const g = new Float64Array(NG * NG * NG);
  for (let i = 0; i < NG; i++) for (let j = 0; j < NG; j++) for (let k = 0; k < NG; k++)
    g[idx(i, j, k)] = field([at(i), at(j), at(k)]);
  return g;
}
function levelFor(g, frac) {
  const cell = step ** 3;
  let tot = 0; for (let n = 0; n < g.length; n++) tot += g[n] * cell;
  const vals = Array.from(g).filter(v => v > 0).sort((a, b) => b - a);
  let acc = 0;
  for (const v of vals) { acc += v * cell; if (acc >= frac * tot) return v; }
  return vals[vals.length - 1];
}
function components(g, lev) {
  const seen = new Uint8Array(g.length), out = [];
  for (let s = 0; s < g.length; s++) {
    if (seen[s] || g[s] < lev) continue;
    const cells = [], stack = [s]; seen[s] = 1;
    while (stack.length) {
      const n = stack.pop(); cells.push(n);
      const k = n % NG, j = ((n - k) / NG) % NG, i = (n - k - j * NG) / (NG * NG);
      for (const [a, b, c] of [[i-1,j,k],[i+1,j,k],[i,j-1,k],[i,j+1,k],[i,j,k-1],[i,j,k+1]]) {
        if (a < 0 || b < 0 || c < 0 || a >= NG || b >= NG || c >= NG) continue;
        const m = idx(a, b, c);
        if (!seen[m] && g[m] >= lev) { seen[m] = 1; stack.push(m); }
      }
    }
    out.push(cells);
  }
  return out.sort((a, b) => b.length - a.length);
}
function centroidOf(cells) {
  let sx = 0, sy = 0, sz = 0;
  for (const n of cells) {
    const k = n % NG, j = ((n - k) / NG) % NG, i = (n - k - j * NG) / (NG * NG);
    sx += at(i); sy += at(j); sz += at(k);
  }
  return [sx / cells.length, sy / cells.length, sz / cells.length];
}

/**
 * The 2-D root table: for each (delta from +y local, azimuth about it), the
 * OUTERMOST radius from `origin` at which the field crosses `lev`. This is the
 * direct generalisation of #13's 1-D osHybRootTable.
 */
function rootTable2D(field, origin, lev, ND, NA, rMax) {
  const tab = new Float64Array((ND + 1) * (NA + 1));
  const NSTEP = 420;
  for (let d = 0; d <= ND; d++) {
    const th = Math.PI * d / ND, st = Math.sin(th), ct = Math.cos(th);
    for (let a = 0; a <= NA; a++) {
      const az = 2 * Math.PI * a / NA;
      const dir = [st * Math.cos(az), ct, st * Math.sin(az)];   // +y is the local axis
      // FIRST EXIT, not outermost root. #13's osHybRootTable takes the
      // OUTERMOST crossing, which is right for ONE orbital -- there is only one
      // component, so the outermost root is its surface. Here the field has
      // several components, and a ray leaving this sausage can re-enter the
      // OTHER one; taking the outermost root then wraps both into a single
      // surface and over-encloses by ~2x (measured: 118% volume error). Under
      // the star-shaped property (verified, 0.0-0.1% re-entry) the component
      // containing the origin is the connected run starting AT the origin, so
      // its boundary is the first exit.
      let found = 0;
      for (let s = 1; s <= NSTEP; s++) {
        const t = s * rMax / NSTEP;
        if (field([origin[0] + dir[0] * t, origin[1] + dir[1] * t, origin[2] + dir[2] * t]) < lev) {
          found = t - rMax / NSTEP; break;
        }
      }
      if (found > 0) {                                  // bisect to the surface
        let lo = found, hi = found + rMax / NSTEP;
        for (let b = 0; b < 30; b++) {
          const m = 0.5 * (lo + hi);
          if (field([origin[0] + dir[0] * m, origin[1] + dir[1] * m, origin[2] + dir[2] * m]) >= lev) lo = m;
          else hi = m;
        }
        found = 0.5 * (lo + hi);
      }
      tab[d * (NA + 1) + a] = found;
    }
  }
  return tab;
}

/** Volume enclosed by a star-shaped root table (spherical-sector quadrature). */
function tableVolume(tab, ND, NA) {
  let v = 0;
  for (let d = 0; d < ND; d++) {
    const th = Math.PI * (d + 0.5) / ND;
    for (let a = 0; a < NA; a++) {
      const r = 0.25 * (tab[d * (NA + 1) + a] + tab[(d + 1) * (NA + 1) + a] +
                        tab[d * (NA + 1) + a + 1] + tab[(d + 1) * (NA + 1) + a + 1]);
      v += (r ** 3 / 3) * Math.sin(th) * (Math.PI / ND) * (2 * Math.PI / NA);
    }
  }
  return v;
}

// ═══════════════════════════════════════════════════════════════════════════
let fails = 0;
function check(label, got, want, tol, unit) {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) fails++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}: ${typeof got === "number" ? got.toFixed(3) : got}` +
    `${unit || ""} (expected ${want}${unit || ""} +/- ${tol})`);
}

console.log("\nMO SURFACE BUILDER — verified against sigma_pi_physics.js\n");
const ND = 48, NA = 96;

for (const spec of [
  { name: "sigma (sp2-sp2, C=C)", kind: "sigma", bond: BOND_PM.double, twist: 0, wantParts: 3, wantSpan: 1 },
  { name: "pi (2p-2p, C=C, 0 deg)", kind: "pi", bond: BOND_PM.double, twist: 0, wantParts: 2, wantSpan: 2 },
  // NOTE the expectation here is 2, not 4 (see the twist-ladder finding below):
  // at 90 deg the four lobes still TOUCH diagonally even though the overlap
  // integral is exactly zero. `starShaped: false` records the second finding --
  // the twisted component is L-shaped (A's +x lobe joined to B's +y lobe at a
  // thin neck), so its centroid falls in the hollow OUTSIDE the region and the
  // root-table pipeline cannot represent it. That is not a bug to fix: it is
  // the reason S6 must not draw a fused MO surface through the twist at all.
  { name: "pi twisted 90 deg", kind: "pi", bond: BOND_PM.double, twist: 90,
    wantParts: 2, wantSpan: 2, starShaped: false },
]) {
  const mo = makeMO(spec.kind, spec.bond, spec.twist);
  const g = sample(mo.field);
  const lev = levelFor(g, 0.5);                      // enc 50 (section 7 limit 5)
  const comps = components(g, lev);
  const spanning = comps.filter(cells => {
    let neg = false, pos = false;
    for (const n of cells) {
      const z = at(n % NG);
      if (z < -mo.Rb / 4) neg = true;
      if (z > mo.Rb / 4) pos = true;
    }
    return neg && pos;
  }).length;

  console.log(`${spec.name}`);
  check("  component count", comps.length, spec.wantParts, 0, "");
  check("  spanning both nuclei", spanning, spec.wantSpan, 0, "");

  // build the biggest component's table and verify it reproduces the voxel set
  const cells = comps[0], origin = centroidOf(cells);
  const tab = rootTable2D(mo.field, origin, lev, ND, NA, 16);
  const volTab = tableVolume(tab, ND, NA);
  const volVox = cells.length * step ** 3;
  const err = 100 * Math.abs(volTab - volVox) / volVox;
  const tip = Math.max(...tab) * PM_PER_RHO;
  const originInside = mo.field(origin) >= lev;
  console.log(`  largest component: centroid [${origin.map(v => v.toFixed(2)).join(", ")}]` +
    `  tip ${tip.toFixed(1)} pm  centroid ${originInside ? "INSIDE" : "OUTSIDE"} the region`);
  if (spec.starShaped === false) {
    check("  centroid falls OUTSIDE (region is not star-shaped)", originInside ? 1 : 0, 0, 0, "");
    console.log("    -> root-table pipeline correctly cannot represent this; S6 must not");
    console.log("       draw a fused MO surface through the twist (see below).");
  } else {
    check("  table volume vs voxel volume (%)", err, 0, 6, "%");
  }
  console.log("");
}

// The twist ladder S6 plays back: surfaces precomputed, readout closed-form.
console.log("twist ladder (S6) — component count vs angle, enc 50");
for (const phi of [0, 30, 45, 60, 75, 90]) {
  const mo = makeMO("pi", BOND_PM.double, phi);
  const g = sample(mo.field);
  const comps = components(g, levelFor(g, 0.5));
  console.log(`  phi = ${String(phi).padStart(2)} deg   ${comps.length} components   ` +
    `S/S0 = ${Math.cos(phi * Math.PI / 180).toFixed(4)}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// THE S6 DRAWING PROBLEM, and what settles it.
//
// The twist ladder above shows the TOTAL-DENSITY surface stays at 2 components
// all the way to 90 deg: the four lobes still TOUCH diagonally (A's +x lobe
// meets B's +y lobe) even though the overlap integral is exactly zero there.
// So "the pi bond breaks" CANNOT be drawn as "the lumps come apart" -- the
// picture would contradict the number the same state is printing. Same defect
// class as #13's node_count clover: geometrically right, posed wrong.
//
// What actually vanishes is the BONDING REGION: where psi_A and psi_B have the
// same sign and reinforce. Measure it, so S6 draws the thing that is really
// going away.
// ═══════════════════════════════════════════════════════════════════════════
console.log("\nWHAT ACTUALLY VANISHES — the constructive-overlap region");

function bondingRegion(phi) {
  const mo = makeMO("pi", BOND_PM.double, phi);
  const ph = phi * Math.PI / 180;
  const aAx = [1, 0, 0], bAx = [Math.cos(ph), Math.sin(ph), 0];
  const p2 = (p, c, ax) => {
    const d = [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
    const r = Math.hypot(d[0], d[1], d[2]);
    if (r < 1e-9) return 0;
    return E.osR(E_ORB2P, r) * E.OS_SQRT3_4PI * ((d[0]*ax[0] + d[1]*ax[1] + d[2]*ax[2]) / r);
  };
  // the product psi_A psi_B: POSITIVE where the two reinforce (bonding),
  // negative where they cancel. Its positive part is the bond.
  let volPos = 0, volNeg = 0, peak = 0;
  const cell = step ** 3;
  for (let i = 0; i < NG; i++) for (let j = 0; j < NG; j++) for (let k = 0; k < NG; k++) {
    const p = [at(i), at(j), at(k)];
    const prod = p2(p, mo.cA, aAx) * p2(p, mo.cB, bAx);
    if (prod > 0) { volPos += prod * cell; if (prod > peak) peak = prod; }
    else volNeg += -prod * cell;
  }
  return { volPos, volNeg, net: volPos - volNeg, peak };
}
const ref = bondingRegion(0);
console.log(`  phi    constructive   destructive   net (= S)    net/S(0)`);
for (const phi of [0, 30, 45, 60, 75, 90]) {
  const r = bondingRegion(phi);
  console.log(`  ${String(phi).padStart(2)} deg   ${r.volPos.toFixed(5)}      ` +
    `${r.volNeg.toFixed(5)}      ${r.net.toFixed(5)}     ` +
    `${(r.net / ref.net).toFixed(4)}   (cos = ${Math.cos(phi * Math.PI / 180).toFixed(4)})`);
}
check("net bonding region at 90 deg is zero", Math.abs(bondingRegion(90).net), 0, 1e-6, "");
console.log("  -> S6 draws the CONSTRUCTIVE region (or sign-coloured lobes), never");
console.log("     'the lumps separate' -- the lumps never separate.");

console.log(`\n${fails === 0 ? "BUILDER VERIFIED — ready to transplant into the renderer"
  : fails + " FAILURE(S)"}\n`);
process.exit(fails === 0 ? 0 : 1);
