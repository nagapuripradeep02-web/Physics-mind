// Hybridisation physics — derive EVERY number before any renderer code exists.
// Units: rho = r/a0, a0 = 52.9177 pm. Z = 1.
// psi_h(rho, c) = cs * R20(rho) * Y00  +  cp * R21(rho) * sqrt(3/4pi) * c
//   where c = cos(angle from the hybrid's own axis), cs^2 + cp^2 = 1,
//   f = cs^2 = the S-CHARACTER fraction.
const A0 = 52.9177;
const FOURPI = 4 * Math.PI;

const R20 = (p) => (1 / (2 * Math.SQRT2)) * (2 - p) * Math.exp(-p / 2);
const R21 = (p) => (1 / (2 * Math.sqrt(6))) * p * Math.exp(-p / 2);

// psi as a function of (rho, c=cos theta from the lobe axis)
function psi(f, p, c) {
  const cs = Math.sqrt(f), cp = Math.sqrt(1 - f);
  return cs * R20(p) * (1 / Math.sqrt(FOURPI))
       + cp * R21(p) * Math.sqrt(3 / FOURPI) * c;
}
const dens = (f, p, c) => { const v = psi(f, p, c); return v * v; };

// ---------- 1. normalisation: integral |psi|^2 dV must be 1 ----------
function norm(f) {
  const NP = 6000, NC = 2000, RMAX = 40;
  const hp = RMAX / NP, hc = 2 / NC;
  let tot = 0;
  for (let i = 0; i <= NP; i++) {
    const p = i * hp, wp = (i === 0 || i === NP) ? 0.5 : 1;
    let inner = 0;
    for (let j = 0; j <= NC; j++) {
      const c = -1 + j * hc, wc = (j === 0 || j === NC) ? 0.5 : 1;
      inner += wc * dens(f, p, c);
    }
    tot += wp * inner * hc * 2 * Math.PI * p * p;
  }
  return tot * hp;
}

// ---------- 2. enclosed probability above an iso-density level ----------
function enclosed(f, lev) {
  const NP = 4000, NC = 1200, RMAX = 40;
  const hp = RMAX / NP, hc = 2 / NC;
  let tot = 0;
  for (let i = 0; i <= NP; i++) {
    const p = i * hp, wp = (i === 0 || i === NP) ? 0.5 : 1;
    let inner = 0;
    for (let j = 0; j <= NC; j++) {
      const c = -1 + j * hc, wc = (j === 0 || j === NC) ? 0.5 : 1;
      const d = dens(f, p, c);
      if (d >= lev) inner += wc * d;
    }
    tot += wp * inner * hc * 2 * Math.PI * p * p;
  }
  return tot * hp;
}

// bisect for the level enclosing exactly `frac`
function solveLevel(f, frac) {
  let lo = 1e-12, hi = 1e-1;
  for (let k = 0; k < 60; k++) {
    const mid = Math.sqrt(lo * hi);
    if (enclosed(f, mid) > frac) lo = mid; else hi = mid;
  }
  return Math.sqrt(lo * hi);
}

// outermost rho along direction c where density == lev (0 if never reached)
function rhoOuter(f, c, lev) {
  const N = 20000, RMAX = 40, h = RMAX / N;
  let last = 0;
  for (let i = N; i >= 1; i--) {
    const p = i * h;
    if (dens(f, p, c) >= lev) { last = p; break; }
  }
  if (last === 0) return 0;
  // refine
  let lo = last, hi = last + h;
  for (let k = 0; k < 60; k++) {
    const m = 0.5 * (lo + hi);
    if (dens(f, m, c) >= lev) lo = m; else hi = m;
  }
  return 0.5 * (lo + hi);
}

// ---------- 3. the equivalent-hybrid angle law ----------
// cos(theta) = -f/(1-f) for a set of equivalent hybrids with s-character f
const angleOf = (f) => Math.acos(-f / (1 - f)) * 180 / Math.PI;

// ---------- 4. independent check: are the authored direction sets
//              actually mutually orthogonal wavefunctions? ----------
// <h_i | h_j> = f + (1-f) * (a_i . a_j)   [s parts overlap = f, p parts = (1-f)cos]
function overlapMatrix(f, dirs) {
  const out = [];
  for (let i = 0; i < dirs.length; i++) {
    const row = [];
    for (let j = 0; j < dirs.length; j++) {
      const dot = dirs[i][0]*dirs[j][0] + dirs[i][1]*dirs[j][1] + dirs[i][2]*dirs[j][2];
      row.push(f + (1 - f) * dot);
    }
    out.push(row);
  }
  return out;
}
const norm3 = (v) => { const L = Math.hypot(...v); return v.map(x => x / L); };

const SETS = {
  sp:  { f: 1/2, dirs: [[0,0,1], [0,0,-1]] },
  sp2: { f: 1/3, dirs: [0,1,2].map(k => {
           const a = k * 2 * Math.PI / 3; return [Math.cos(a), 0, Math.sin(a)]; }) },
  sp3: { f: 1/4, dirs: [[1,1,1], [1,-1,-1], [-1,1,-1], [-1,-1,1]].map(norm3) }
};

console.log("=== 1. NORMALISATION (must be 1.000000) ===");
for (const [k, s] of Object.entries(SETS))
  console.log(`  ${k.padEnd(4)} f=${s.f.toFixed(4)}  <psi|psi> = ${norm(s.f).toFixed(6)}`);
console.log(`  pure p (f=0)      <psi|psi> = ${norm(0).toFixed(6)}`);

console.log("\n=== 2. THE ANGLE LAW  cos(th) = -f/(1-f) ===");
for (const [k, s] of Object.entries(SETS)) {
  const pred = angleOf(s.f);
  // measured from the authored direction list
  const d = s.dirs;
  const dot = d[0][0]*d[1][0] + d[0][1]*d[1][1] + d[0][2]*d[1][2];
  const meas = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI;
  console.log(`  ${k.padEnd(4)} s-char ${(s.f*100).toFixed(1)}%  law ${pred.toFixed(2)} deg  dirs ${meas.toFixed(2)} deg  ${Math.abs(pred-meas)<0.01?"MATCH":"*** MISMATCH ***"}`);
}

console.log("\n=== 3. ORTHONORMALITY of each hybrid SET ===");
for (const [k, s] of Object.entries(SETS)) {
  const M = overlapMatrix(s.f, s.dirs);
  let maxOff = 0, maxDiagErr = 0;
  for (let i = 0; i < M.length; i++) for (let j = 0; j < M.length; j++) {
    if (i === j) maxDiagErr = Math.max(maxDiagErr, Math.abs(M[i][j] - 1));
    else maxOff = Math.max(maxOff, Math.abs(M[i][j]));
  }
  console.log(`  ${k.padEnd(4)} n=${M.length}  max|<i|i>-1| = ${maxDiagErr.toExponential(2)}  max|<i|j>| = ${maxOff.toExponential(2)}  ${maxOff<1e-12&&maxDiagErr<1e-12?"ORTHONORMAL":"*** NOT ORTHOGONAL ***"}`);
}

console.log("\n=== 4. LOBE GEOMETRY at the 90% contour (pm) ===");
console.log("  set   f       level(au)     front tip   back tip   ratio   enclosed");
const rows = [];
for (const [k, s] of Object.entries({ p: {f:0}, ...SETS })) {
  const lev = solveLevel(s.f, 0.90);
  const front = rhoOuter(s.f, +1, lev) * A0;
  const back  = rhoOuter(s.f, -1, lev) * A0;
  const enc = enclosed(s.f, lev);
  rows.push({ k, f: s.f, lev, front, back, enc });
  console.log(`  ${k.padEnd(5)} ${s.f.toFixed(4)}  ${lev.toExponential(4)}   ${front.toFixed(1).padStart(7)}   ${back.toFixed(1).padStart(7)}   ${(front/(back||Infinity)).toFixed(2).padStart(5)}   ${enc.toFixed(4)}`);
}

console.log("\n=== 5. THE MORPH SWEEP (one continuous parameter) ===");
console.log("  s-char   angle(deg)   front(pm)   back(pm)   front/back");
for (const f of [0, 0.05, 0.10, 0.15, 0.20, 0.25, 1/3, 0.40, 0.50]) {
  const lev = solveLevel(f, 0.90);
  const front = rhoOuter(f, +1, lev) * A0;
  const back = rhoOuter(f, -1, lev) * A0;
  const ang = f === 0 ? 90 : angleOf(f);
  const nm = f===0.25?" <- sp3":f===1/3?" <- sp2":f===0.5?" <- sp":f===0?" <- pure p":"";
  console.log(`  ${(f*100).toFixed(1).padStart(5)}%   ${ang.toFixed(2).padStart(7)}   ${front.toFixed(1).padStart(8)}   ${back.toFixed(1).padStart(7)}   ${(back>0?(front/back).toFixed(2):"inf").padStart(9)}${nm}`);
}

console.log("\n=== 6. CROSS-CHECK against the SHIPPED atomic_orbitals_s_p_d numbers ===");
// pure 2p tip at 90% should reproduce the shipped 482 pm (level 9.0768e-5)
const shippedLev = 9.0768e-5;
const p2tip = rhoOuter(0, +1, shippedLev) * A0;
console.log(`  pure 2p tip at the SHIPPED level 9.0768e-5 = ${p2tip.toFixed(1)} pm  (shipped says 482 pm)  ${Math.abs(p2tip-482)<2?"AGREES":"*** DISAGREES ***"}`);
const myP = rows.find(r => r.k === "p");
console.log(`  my own solved p level = ${myP.lev.toExponential(4)}  (shipped 9.0768e-5)  ratio ${(myP.lev/shippedLev).toFixed(4)}`);
