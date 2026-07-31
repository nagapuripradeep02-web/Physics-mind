/**
 * sigma_pi_cameras.js — SOLVE the cameras. Never choose them.
 *
 * #13's most transferable lesson: the shipped `p_set` camera foreshortened one of
 * four sp3 lobes to EXACTLY 0.000 under a caption counting four. Only a
 * measurement says so. This concept has that hazard doubled at STATE_8, where the
 * two pi systems are 90 degrees apart about the bond axis and any view down one of
 * them collapses it.
 *
 * It also has a rule tension the skeleton did not anticipate. The engine measured
 * that Z_eff makes the MO picture ~4x smaller than an atomic one, so sigma states
 * and pi states do NOT fill the frame equally. Two rules pull opposite ways:
 *
 *   Rule 29  emphasis is brightness, NEVER size -- an element's apparent size may
 *            change ONLY when its real physical magnitude does.
 *   Rule 32d same apparatus, home pose, no teleport -- at every click the only
 *            visible change IS the new thing.
 *
 * Per-state distances would equalise the framing, but a sigma-to-pi click would
 * then read as a ZOOM -- a size change with no physical cause, which is exactly
 * what Rule 29 forbids. sigma and pi ARE genuinely different sizes. So the honest
 * solve is ONE distance for every state, chosen so the LARGEST scene fits and the
 * smallest is still legible, with true relative sizes preserved.
 *
 * This script decides whether that single distance actually exists, and picks the
 * angles that keep every counted object non-degenerate.
 *
 *   node docs/concepts/chemistry/sigma_pi_cameras.js
 */
const fs = require("fs");
const path = require("path");

const SRC = fs.readFileSync(
  path.join(__dirname, "../../../src/lib/renderers/field_3d_renderer.ts"), "utf8");
function grabFn(name) {
  const s = SRC.indexOf("function " + name + "(");
  if (s < 0) throw new Error("fn not found: " + name);
  let i = SRC.indexOf("{", s), d = 0;
  for (let j = i; j < SRC.length; j++) {
    if (SRC[j] === "{") d++;
    else if (SRC[j] === "}") { d--; if (!d) return SRC.slice(s, j + 1); }
  }
  throw new Error("unbalanced: " + name);
}
function grabVar(n) {
  const m = new RegExp("var " + n + "\\s*=").exec(SRC);
  if (!m) throw new Error("var not found: " + n);
  return SRC.slice(m.index, SRC.indexOf(";", m.index + m[0].length) + 1);
}
const E = new Function([
  grabVar("OS_A0"), grabVar("OS_PM_PER_UNIT"), grabVar("OS_HYB_SIGN"),
  grabVar("OS_ORB2S"), grabVar("OS_ORB2P"), grabVar("OS_INV_S4PI"), grabVar("OS_SQRT3_4PI"),
  grabFn("osClamp"), grabFn("osR"), grabFn("osHybPsi"),
  "return {OS_A0:OS_A0, OS_PM_PER_UNIT:OS_PM_PER_UNIT, osR:osR, osHybPsi:osHybPsi, OS_SQRT3_4PI:OS_SQRT3_4PI};"
].join("\n"))();

const Z_C = 6 - (3 * 0.35 + 2 * 0.85);          // 3.25
const PM_PER_RHO = E.OS_A0 / Z_C;
const UNITS_PER_RHO = PM_PER_RHO / E.OS_PM_PER_UNIT;   // rho -> world units
const BOND_PM = 133.9;
const Rb = BOND_PM / PM_PER_RHO;
const cA = [0, 0, -Rb / 2], cB = [0, 0, +Rb / 2];

// ── the two fields, as the engine builds them ─────────────────────────────
function psiSp2(p, c, ax) {
  const d = [p[0]-c[0], p[1]-c[1], p[2]-c[2]], r = Math.hypot(...d);
  if (r < 1e-9) return 0;
  return E.osHybPsi({ f: 1/3 }, r, (d[0]*ax[0]+d[1]*ax[1]+d[2]*ax[2]) / r);
}
function psi2p(p, c, ax) {
  const d = [p[0]-c[0], p[1]-c[1], p[2]-c[2]], r = Math.hypot(...d);
  if (r < 1e-9) return 0;
  return E.osR(E.OS_ORB2P || {n:2,l:1}, r) * E.OS_SQRT3_4PI * ((d[0]*ax[0]+d[1]*ax[1]+d[2]*ax[2]) / r);
}
const FIELDS = {
  sigma: (p) => Math.pow(psiSp2(p, cA, [0,0,1]) + psiSp2(p, cB, [0,0,-1]), 2),
  pi:    (p) => Math.pow(psi2p(p, cA, [1,0,0]) + psi2p(p, cB, [1,0,0]), 2),
  pi2:   (p) => Math.pow(psi2p(p, cA, [0,1,0]) + psi2p(p, cB, [0,1,0]), 2),   // the 90-deg partner
};

const NG = 101, EXT = 16, step = 2*EXT/(NG-1);
const at = (i) => -EXT + i*step;
const idx = (i,j,k) => (i*NG+j)*NG+k;
function sample(f) {
  const g = new Float64Array(NG**3);
  for (let i=0;i<NG;i++) for (let j=0;j<NG;j++) for (let k=0;k<NG;k++) g[idx(i,j,k)] = f([at(i),at(j),at(k)]);
  return g;
}
function levelFor(g, frac) {
  const cell = step**3; let tot=0;
  for (let n=0;n<g.length;n++) tot += g[n]*cell;
  const v = Array.from(g).filter(x=>x>0).sort((a,b)=>b-a);
  let acc=0; for (const x of v) { acc += x*cell; if (acc >= frac*tot) return x; }
  return v[v.length-1];
}
/** every voxel on the 50% contour, as world-unit points */
function shellPoints(f) {
  const g = sample(f), lev = levelFor(g, 0.5), pts = [];
  for (let i=0;i<NG;i++) for (let j=0;j<NG;j++) for (let k=0;k<NG;k++)
    if (g[idx(i,j,k)] >= lev) pts.push([at(i)*UNITS_PER_RHO, at(j)*UNITS_PER_RHO, at(k)*UNITS_PER_RHO]);
  return pts;
}

console.log("\nSOLVING CAMERAS — measured, never chosen\n");
console.log(`  1 rho = ${PM_PER_RHO.toFixed(3)} pm = ${UNITS_PER_RHO.toFixed(4)} world units (Z_eff ${Z_C})`);

const PTS = { sigma: shellPoints(FIELDS.sigma), pi: shellPoints(FIELDS.pi), pi2: shellPoints(FIELDS.pi2) };
for (const k of Object.keys(PTS)) {
  const r = Math.max(...PTS[k].map(p => Math.hypot(...p)));
  console.log(`  ${k.padEnd(6)} shell: ${PTS[k].length} voxels, bounding radius ${r.toFixed(3)} units`);
}

// ── projection: camera at (az, el, dist) looking at the origin ─────────────
function camBasis(azDeg, elDeg) {
  const az = azDeg*Math.PI/180, el = elDeg*Math.PI/180;
  const fwd = [Math.cos(el)*Math.sin(az), Math.sin(el), Math.cos(el)*Math.cos(az)];  // eye dir
  let up = [0,1,0];
  const right = norm(cross(up, fwd));
  up = norm(cross(fwd, right));
  return { fwd, right, up };
}
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const norm=(v)=>{const n=Math.hypot(...v); return [v[0]/n,v[1]/n,v[2]/n];};
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];

/** on-screen extent (in units) of a point cloud, perpendicular to the view dir */
function screenExtent(pts, B) {
  let rmin=1e9,rmax=-1e9,umin=1e9,umax=-1e9;
  for (const p of pts) {
    const r = dot(p,B.right), u = dot(p,B.up);
    if(r<rmin)rmin=r; if(r>rmax)rmax=r; if(u<umin)umin=u; if(u>umax)umax=u;
  }
  return { w: rmax-rmin, h: umax-umin, radius: Math.max(rmax-rmin, umax-umin)/2 };
}
/** the degeneracy test: apparent AREA of a lobe set relative to its best view */
function apparentArea(pts, B) {
  const cell = (step*UNITS_PER_RHO);
  const seen = new Set();
  for (const p of pts) {
    const r = Math.round(dot(p,B.right)/cell), u = Math.round(dot(p,B.up)/cell);
    seen.add(r+","+u);
  }
  return seen.size * cell * cell;
}

// ── STATE_8 is the binding constraint: sigma + TWO pi, 90 deg apart ────────
//
// CORRECTED METRIC. A first version of this scored candidates by projected AREA
// and picked az 0 / el 0 -- the view straight down the bond axis, which the same
// script's own reject-list names as degenerate. Two errors, both worth recording:
//
//   (1) A lobe seen END-ON still projects a filled disc, so "area" is LARGE
//       exactly when the lobe is most collapsed. Area is the wrong measure.
//       #13's real test was extent ALONG THE LOBE AXIS -- that is what went to
//       0.000. The right quantity is the foreshortening factor sin(angle between
//       the view direction and the axis), which is 0 when you look down it.
//   (2) There was no constraint that the BOND be visible at all. Down the bond
//       axis the two nuclei sit one behind the other, so a concept about a bond
//       between two atoms shows one atom. That must be a hard reject, not a
//       low score.
//
// So: maximise the WORST foreshortening across the three named directions --
// the bond axis z (carries sigma and the nuclei), pi1's axis x, pi2's axis y.
const AXES = { bond: [0,0,1], pi1: [1,0,0], pi2: [0,1,0] };
function foreshorten(axis, B) {
  // |sin| of the angle between the view direction and the axis: 1 = broadside,
  // 0 = looking straight down it (fully collapsed).
  const c = Math.abs(dot(norm(axis), B.fwd));
  return Math.sqrt(Math.max(0, 1 - c*c));
}
function nucleiSeparationUnits(B) {
  const pA = [cA[0]*UNITS_PER_RHO, cA[1]*UNITS_PER_RHO, cA[2]*UNITS_PER_RHO];
  const pB = [cB[0]*UNITS_PER_RHO, cB[1]*UNITS_PER_RHO, cB[2]*UNITS_PER_RHO];
  return Math.hypot(dot(pB,B.right)-dot(pA,B.right), dot(pB,B.up)-dot(pA,B.up));
}
const BOND_UNITS = Rb * UNITS_PER_RHO;
const MIN_FORESHORTEN = 0.50;   // no named direction may present below half broadside
const MIN_BOND_FRAC   = 0.50;   // the two nuclei must be at least half their true separation apart

console.log("\n  STATE_8 angle search (sigma + pi1 + pi2) — worst-axis foreshortening, hard rejects");
let best = null, rejected = 0;
for (let az = 0; az <= 90; az += 1) {
  for (let el = 0; el <= 90; el += 1) {
    const B = camBasis(az, el);
    const f = { bond: foreshorten(AXES.bond,B), pi1: foreshorten(AXES.pi1,B), pi2: foreshorten(AXES.pi2,B) };
    const worst = Math.min(f.bond, f.pi1, f.pi2);
    const bondFrac = nucleiSeparationUnits(B) / BOND_UNITS;
    if (worst < MIN_FORESHORTEN || bondFrac < MIN_BOND_FRAC) { rejected++; continue; }
    if (!best || worst > best.worst) best = { az, el, ...f, worst, bondFrac };
  }
}
console.log(`    ${rejected} of ${91*91} candidate views HARD-REJECTED (a collapsed axis or a hidden bond)`);
console.log(`    best: az ${best.az}° el ${best.el}°  |  bond ${best.bond.toFixed(3)}  ` +
  `pi1 ${best.pi1.toFixed(3)}  pi2 ${best.pi2.toFixed(3)}  |  worst axis ${best.worst.toFixed(3)}  ` +
  `nuclei ${(100*best.bondFrac).toFixed(0)}% apart`);

// the degenerate views, proving the corrected test actually fails them
console.log("    negative control — views that MUST be rejected:");
for (const [name, az, el] of [["down the bond axis (z)", 0, 0], ["down pi1 (x)", 90, 0], ["down pi2 (y)", 0, 90]]) {
  const B = camBasis(az, el);
  const f = [foreshorten(AXES.bond,B), foreshorten(AXES.pi1,B), foreshorten(AXES.pi2,B)];
  const bf = nucleiSeparationUnits(B)/BOND_UNITS;
  const why = Math.min(...f) < MIN_FORESHORTEN ? "collapsed axis" : (bf < MIN_BOND_FRAC ? "bond hidden" : "!! NOT REJECTED !!");
  console.log(`      ${name.padEnd(24)} bond ${f[0].toFixed(3)} pi1 ${f[1].toFixed(3)} pi2 ${f[2].toFixed(3)}` +
    `  nuclei ${(100*bf).toFixed(0)}%  -> ${why}`);
}

// ── ONE distance for every state (Rule 29 + 32d) ──────────────────────────
console.log("\n  ONE distance for all nine states — true relative sizes preserved");
const B = camBasis(best.az, best.el);
const scenes = {
  "S1,S2,S3 (σ)":        PTS.sigma,
  "S4,S5,S9 (π)":        PTS.pi,
  "S6,S7 (σ+π)":         PTS.sigma.concat(PTS.pi),
  "S8 (σ+2π)":           PTS.sigma.concat(PTS.pi, PTS.pi2),
};
let maxR = 0;
for (const [n, pts] of Object.entries(scenes)) {
  const e = screenExtent(pts, B);
  if (e.radius > maxR) maxR = e.radius;
}
// fit the largest scene into 78% of the half-viewport; 35-degree vertical FOV
const FOV = 35 * Math.PI/180;
const dist = (maxR / 0.78) / Math.tan(FOV/2);
console.log(`    largest scene radius ${maxR.toFixed(3)} units  ->  dist ${dist.toFixed(2)} at ${(FOV*180/Math.PI).toFixed(0)}° FOV`);
console.log(`    scene                       radius   % of frame   verdict`);
let allLegible = true;
for (const [n, pts] of Object.entries(scenes)) {
  const e = screenExtent(pts, B);
  const frac = e.radius / (dist * Math.tan(FOV/2));
  const ok = frac >= 0.28;                       // legibility floor
  if (!ok) allLegible = false;
  console.log(`    ${n.padEnd(26)} ${e.radius.toFixed(3)}    ${(100*frac).toFixed(1)}%      ` +
    `${ok ? "legible" : "TOO SMALL — needs its own distance"}`);
}
console.log(`\n  VERDICT: a single distance ${allLegible ? "WORKS" : "does NOT work"} for every state` +
  ` — ${allLegible ? "no zoom between states, true relative sizes kept (Rule 29 + 32d both satisfied)"
    : "Rule 29 and Rule 32d are in genuine conflict here; escalate"}`);
console.log(`\n  SOLVED CAMERA:  az ${best.az}°  el ${best.el}°  dist ${dist.toFixed(2)}\n`);
