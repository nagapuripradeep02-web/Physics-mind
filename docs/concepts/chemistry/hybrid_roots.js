// Does the hybrid's 90% iso-surface have hidden inner structure the mesh would lie about?
// A 2p has zero density at the nucleus; a hybrid inherits the 2s cusp, so the FRONT ray
// may cross the contour more than twice. Count every crossing before building a mesh
// that assumes exactly one outer root.
const A0 = 52.9177, FOURPI = 4 * Math.PI;
const R20 = (p) => (1 / (2 * Math.SQRT2)) * (2 - p) * Math.exp(-p / 2);
const R21 = (p) => (1 / (2 * Math.sqrt(6))) * p * Math.exp(-p / 2);
// textbook convention (verified): MINUS the 2s
function psi(f, p, c) {
  const cs = Math.sqrt(f), cp = Math.sqrt(1 - f);
  return -cs * R20(p) * (1 / Math.sqrt(FOURPI)) + cp * R21(p) * Math.sqrt(3 / FOURPI) * c;
}
const dens = (f, p, c) => { const v = psi(f, p, c); return v * v; };

function enclosed(f, lev) {
  const NP = 3000, NC = 1000, RMAX = 40, hp = RMAX / NP, hc = 2 / NC;
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
function solveLevel(f, frac) {
  let lo = 1e-12, hi = 1e-1;
  for (let k = 0; k < 55; k++) { const m = Math.sqrt(lo * hi); if (enclosed(f, m) > frac) lo = m; else hi = m; }
  return Math.sqrt(lo * hi);
}
// every crossing of dens == lev along a ray
function roots(f, c, lev) {
  const N = 40000, RMAX = 40, h = RMAX / N, out = [];
  let prev = dens(f, 1e-9, c) >= lev;
  for (let i = 1; i <= N; i++) {
    const p = i * h, cur = dens(f, p, c) >= lev;
    if (cur !== prev) {
      let lo = (i - 1) * h, hi = p;
      for (let k = 0; k < 45; k++) { const m = 0.5 * (lo + hi); if ((dens(f, m, c) >= lev) === prev) lo = m; else hi = m; }
      out.push({ rho: 0.5 * (lo + hi), pm: 0.5 * (lo + hi) * A0, enter: cur });
      prev = cur;
    }
  }
  return { startsInside: dens(f, 1e-9, c) >= lev, crossings: out };
}

for (const [name, f] of [["sp", 0.5], ["sp2", 1 / 3], ["sp3", 0.25]]) {
  const lev = solveLevel(f, 0.90);
  console.log(`\n===== ${name}  (f = ${f.toFixed(4)}, 90% level = ${lev.toExponential(4)}) =====`);
  for (const [dirName, c] of [["FRONT c=+1", +1], ["side  c= 0", 0], ["BACK  c=-1", -1]]) {
    const r = roots(f, c, lev);
    const desc = r.crossings.map(x => `${x.enter ? "in@" : "out@"}${x.pm.toFixed(1)}pm`).join("  ");
    console.log(`  ${dirName}: starts ${r.startsInside ? "INSIDE" : "outside"}  ->  ${desc || "(never enters)"}`);
  }
  // how much probability lives in the inner nub (rho < first exit on the front ray)?
  const fr = roots(f, +1, lev);
  if (fr.startsInside && fr.crossings.length >= 1) {
    const cut = fr.crossings[0].rho;
    console.log(`  >>> the front ray starts INSIDE the contour and exits at ${(cut*A0).toFixed(1)} pm`);
    console.log(`      => a near-nucleus core blob exists; a single-outer-root mesh would swallow it.`);
  }
}

// widths: how fat is each lobe? measure max perpendicular half-width of the front lobe
console.log("\n===== LOBE PROPORTIONS at the 90% contour (front lobe) =====");
console.log("  set   length(pm)   max half-width(pm)   L/W");
for (const [name, f] of [["sp", 0.5], ["sp2", 1 / 3], ["sp3", 0.25]]) {
  const lev = solveLevel(f, 0.90);
  // sample the surface: for each polar angle from the axis, outermost root
  let maxW = 0, len = 0;
  for (let j = 0; j <= 900; j++) {
    const th = (j / 900) * Math.PI, c = Math.cos(th);
    const N = 8000, RMAX = 40, h = RMAX / N;
    let last = 0;
    for (let i = N; i >= 1; i--) if (dens(f, i * h, c) >= lev) { last = i * h; break; }
    if (!last) continue;
    const pm = last * A0;
    if (th < 1e-6) len = pm;
    const w = pm * Math.sin(th);
    // only the FRONT half (th < the pinch) counts toward the front lobe width
    if (c > 0) maxW = Math.max(maxW, w);
  }
  console.log(`  ${name.padEnd(4)} ${len.toFixed(1).padStart(8)}   ${maxW.toFixed(1).padStart(14)}   ${(len / (2 * maxW)).toFixed(2)}`);
}
