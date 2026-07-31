// COUNTABILITY SOLVE — which enclosure contour keeps 4 sp3 lobes readable as 4 lobes?
// The shipped orbital_shapes scar: a TRUE 90% 2p contour is plump (482 x 334 pm, L/W 1.44)
// and three of them fuse into a ball. A hybrid is worse. Solve it here, before authoring,
// the way the VSEPR camera was solved -- as a measurable quantity with a correct answer.
// CONTROL: pure p (f=0) at 90% must reproduce the shipped 482 x 334 pm / L/W 1.44.
const A0 = 52.9177, FOURPI = 4 * Math.PI;
const R20 = (p) => (1 / (2 * Math.SQRT2)) * (2 - p) * Math.exp(-p / 2);
const R21 = (p) => (1 / (2 * Math.sqrt(6))) * p * Math.exp(-p / 2);
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
      const d = dens(f, p, c); if (d >= lev) inner += wc * d;
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
function rOut(f, c, lev) {
  const N = 6000, RMAX = 40, h = RMAX / N;
  let last = 0;
  for (let i = N; i >= 1; i--) if (dens(f, i * h, c) >= lev) { last = i * h; break; }
  if (!last) return 0;
  let lo = last, hi = last + h;
  for (let k = 0; k < 40; k++) { const m = 0.5 * (lo + hi); if (dens(f, m, c) >= lev) lo = m; else hi = m; }
  return 0.5 * (lo + hi) * A0;
}
// front-lobe metrics: length along +axis, max FULL width, and the pinch angle where
// the front lobe ends (the local minimum of r, i.e. the waist between front and back)
function metrics(f, lev) {
  const M = 1400;
  let len = rOut(f, 1, lev), back = rOut(f, -1, lev), maxHalfW = 0, waistTh = Math.PI;
  const rs = [];
  for (let j = 0; j <= M; j++) { const th = (j / M) * Math.PI; rs.push({ th, r: rOut(f, Math.cos(th), lev) }); }
  // waist = the smallest r over the whole sweep (where the two lobes meet)
  let minR = Infinity;
  for (const s of rs) if (s.r < minR) { minR = s.r; waistTh = s.th; }
  for (const s of rs) if (s.th <= waistTh) maxHalfW = Math.max(maxHalfW, s.r * Math.sin(s.th));
  return { len, back, width: 2 * maxHalfW, waist: waistTh * 180 / Math.PI, minR };
}

console.log("CONTROL — pure 2p (f=0) at 90%: shipped concept says 482 long x 334 wide, L/W 1.44");
{
  const lev = solveLevel(0, 0.90), m = metrics(0, lev);
  console.log(`  measured: ${m.len.toFixed(0)} long x ${m.width.toFixed(0)} wide, L/W ${(m.len / m.width).toFixed(2)}  ` +
    `${Math.abs(m.len - 482) < 6 && Math.abs(m.width - 334) < 12 ? "*** CONTROL AGREES ***" : "*** CONTROL FAILS ***"}`);
}

console.log("\nHYBRID FRONT LOBE vs ENCLOSURE CONTOUR");
console.log("  set   encl   level(au)    front(pm)  back(pm)  width(pm)   L/W    waist(deg)");
const table = {};
for (const [name, f] of [["p", 0], ["sp3", 0.25], ["sp2", 1 / 3], ["sp", 0.5]]) {
  table[name] = {};
  for (const enc of [0.50, 0.70, 0.90]) {
    const lev = solveLevel(f, enc), m = metrics(f, lev);
    table[name][enc] = { lev, ...m };
    const lw = m.len / m.width;
    console.log(`  ${name.padEnd(4)} ${(enc * 100).toFixed(0).padStart(4)}%  ${lev.toExponential(4)}  ` +
      `${m.len.toFixed(0).padStart(8)}  ${m.back.toFixed(0).padStart(7)}  ${m.width.toFixed(0).padStart(8)}  ` +
      `${lw.toFixed(2).padStart(5)}  ${m.waist.toFixed(0).padStart(8)}   ${lw >= 1.30 ? "countable" : lw >= 1.0 ? "marginal" : "FUSES"}`);
  }
}

// The decisive test: 4 sp3 lobes at 109.47 deg. Do neighbouring lobes overlap?
// Two lobes at angle TH; the half-angular-width of a lobe at its widest is the th where
// r*sin(th) peaks. If (that half-width * 2) > TH the silhouettes merge.
console.log("\nDO FOUR sp3 LOBES STAY SEPARATE? (tetrahedral angle = 109.47 deg)");
console.log("  encl   half-angular-width(deg)   sum for a pair   verdict");
for (const enc of [0.50, 0.70, 0.90]) {
  const f = 0.25, lev = solveLevel(f, enc);
  const M = 1400; let bestTh = 0, bestW = 0, minR = Infinity, waistTh = Math.PI;
  const rs = [];
  for (let j = 0; j <= M; j++) { const th = (j / M) * Math.PI; rs.push({ th, r: rOut(f, Math.cos(th), lev) }); }
  for (const s of rs) if (s.r < minR) { minR = s.r; waistTh = s.th; }
  for (const s of rs) if (s.th <= waistTh) { const w = s.r * Math.sin(s.th); if (w > bestW) { bestW = w; bestTh = s.th; } }
  const halfDeg = bestTh * 180 / Math.PI;
  console.log(`  ${(enc * 100).toFixed(0).padStart(4)}%   ${halfDeg.toFixed(1).padStart(20)}   ${(2 * halfDeg).toFixed(1).padStart(14)}   ` +
    `${2 * halfDeg < 109.47 ? "SEPARATE" : "OVERLAP by " + (2 * halfDeg - 109.47).toFixed(0) + " deg"}`);
}
console.log("\nRECOMMENDED AUTHORING CONTOUR = the largest enclosure whose pair-sum clears 109.47 deg.");
