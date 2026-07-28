// UNION-SILHOUETTE WAIST — the honest legibility metric for a SET of hybrid lobes.
// Each lobe is a surface of revolution about its own axis, so the union's radius along a
// direction d is max_i rOut(d . a_i). Between two adjacent lobes the union dips; the depth
// of that dip is whether a student sees TWO lobes or one blob.
// (Convention fixed: "width" here is HALF-width, matching the shipped orbital_shapes numbers.)
const A0 = 52.9177, FOURPI = 4 * Math.PI;
const R20 = (p) => (1 / (2 * Math.SQRT2)) * (2 - p) * Math.exp(-p / 2);
const R21 = (p) => (1 / (2 * Math.sqrt(6))) * p * Math.exp(-p / 2);
function psi(f, p, c) {
  const cs = Math.sqrt(f), cp = Math.sqrt(1 - f);
  return -cs * R20(p) * (1 / Math.sqrt(FOURPI)) + cp * R21(p) * Math.sqrt(3 / FOURPI) * c;
}
const dens = (f, p, c) => { const v = psi(f, p, c); return v * v; };
function enclosed(f, lev) {
  const NP = 2500, NC = 900, RMAX = 40, hp = RMAX / NP, hc = 2 / NC;
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
  for (let k = 0; k < 50; k++) { const m = Math.sqrt(lo * hi); if (enclosed(f, m) > frac) lo = m; else hi = m; }
  return Math.sqrt(lo * hi);
}
function rOut(f, c, lev) {
  const N = 5000, RMAX = 40, h = RMAX / N;
  let last = 0;
  for (let i = N; i >= 1; i--) if (dens(f, i * h, c) >= lev) { last = i * h; break; }
  if (!last) return 0;
  let lo = last, hi = last + h;
  for (let k = 0; k < 40; k++) { const m = 0.5 * (lo + hi); if (dens(f, m, c) >= lev) lo = m; else hi = m; }
  return 0.5 * (lo + hi) * A0;
}
const halfW = (f, lev) => { // max r*sin(th) over the front lobe -> HALF-width (shipped convention)
  let best = 0, minR = Infinity, waist = Math.PI, rs = [];
  for (let j = 0; j <= 900; j++) { const th = (j / 900) * Math.PI; rs.push({ th, r: rOut(f, Math.cos(th), lev) }); }
  for (const s of rs) if (s.r < minR) { minR = s.r; waist = s.th; }
  for (const s of rs) if (s.th <= waist) best = Math.max(best, s.r * Math.sin(s.th));
  return best;
};

const SETS = {
  sp:  { f: 0.5,   n: 2, ang: 180.00 },
  sp2: { f: 1 / 3, n: 3, ang: 120.00 },
  sp3: { f: 0.25,  n: 4, ang: 109.47 }
};

console.log("L/W uses the shipped convention (length / HALF-width). Pure 2p @90% = 1.44 is the reference.");
console.log("waist ratio = union radius along the bisector between two adjacent lobes, / tip radius.");
console.log("  Lower = deeper notch between lobes = more countable. >0.90 means no visible notch.\n");
console.log("  set   encl   level(au)    tip(pm)  halfW(pm)   L/W    bisector(pm)  waist ratio  verdict");
for (const [name, S] of Object.entries(SETS)) {
  for (const enc of [0.50, 0.70, 0.90]) {
    const lev = solveLevel(S.f, enc);
    const tip = rOut(S.f, 1, lev);
    const hw = halfW(S.f, lev);
    const cBis = Math.cos(S.ang / 2 * Math.PI / 180);
    // union radius on the bisector = max over the two adjacent lobes (equal by symmetry),
    // but also check the BACK lobes of the other members, which can fill the notch
    let rBis = rOut(S.f, cBis, lev);
    // back lobes of the two other sp3 members also point near the bisector -> include them
    if (name === "sp3") {
      // bisector of lobes 1,2 ; the OTHER two lobes' back directions make angle:
      const a = [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(v => { const L = Math.hypot(...v); return v.map(x=>x/L); });
      const bis = [0,1,2].map(k => (a[0][k] + a[1][k]));
      const Lb = Math.hypot(...bis); const bh = bis.map(x => x / Lb);
      for (let i = 2; i < 4; i++) {
        const c = bh[0]*a[i][0] + bh[1]*a[i][1] + bh[2]*a[i][2];
        rBis = Math.max(rBis, rOut(S.f, c, lev));
      }
    }
    const ratio = rBis / tip;
    console.log(`  ${name.padEnd(4)} ${(enc*100).toFixed(0).padStart(4)}%  ${lev.toExponential(4)}  ${tip.toFixed(0).padStart(7)}  ${hw.toFixed(0).padStart(8)}  ${(tip/hw).toFixed(2).padStart(5)}  ${rBis.toFixed(0).padStart(11)}  ${ratio.toFixed(3).padStart(11)}  ${ratio<0.80?"COUNTABLE":ratio<0.90?"marginal":"FUSES"}`);
  }
}
console.log("\nreference: pure 2p @90%  L/W " + (() => { const l = solveLevel(0,0.9); return (rOut(0,1,l)/halfW(0,l)).toFixed(2); })());
