// WHICH WAY DOES THE BIG LOBE POINT?
// The relative sign of the s and p terms is the whole question. R20 = (1/2sqrt2)(2-rho)e^{-rho/2}
// is NEGATIVE for rho > 2 -- i.e. across most of the bonding region -- so writing
// psi = +cs*R20 + cp*R21*c puts the CONSTRUCTIVE side at c = -1.
// Measure it: hemisphere probability, not tip radius.
const A0 = 52.9177, FOURPI = 4 * Math.PI;
const R20 = (p) => (1 / (2 * Math.SQRT2)) * (2 - p) * Math.exp(-p / 2);
const R21 = (p) => (1 / (2 * Math.sqrt(6))) * p * Math.exp(-p / 2);

// sgn = +1 -> psi = cs*R20*Y00 + cp*R21*sqrt(3/4pi)*c
// sgn = -1 -> psi = -cs*R20*Y00 + cp*R21*sqrt(3/4pi)*c   (the textbook convention)
function psi(f, p, c, sgn) {
  const cs = Math.sqrt(f), cp = Math.sqrt(1 - f);
  return sgn * cs * R20(p) * (1 / Math.sqrt(FOURPI))
       + cp * R21(p) * Math.sqrt(3 / FOURPI) * c;
}
const dens = (f, p, c, s) => { const v = psi(f, p, c, s); return v * v; };

// probability in the c > 0 hemisphere (the "front", along the lobe axis)
function frontProb(f, sgn) {
  const NP = 5000, NC = 1600, RMAX = 40, hp = RMAX / NP, hc = 1 / NC;
  let front = 0, back = 0;
  for (let i = 0; i <= NP; i++) {
    const p = i * hp, wp = (i === 0 || i === NP) ? 0.5 : 1;
    let fi = 0, bi = 0;
    for (let j = 0; j <= NC; j++) {
      const c = j * hc, wc = (j === 0 || j === NC) ? 0.5 : 1;
      fi += wc * dens(f, p, +c, sgn);
      bi += wc * dens(f, p, -c, sgn);
    }
    front += wp * fi * hc * 2 * Math.PI * p * p;
    back  += wp * bi * hc * 2 * Math.PI * p * p;
  }
  return { front: front * hp, back: back * hp };
}

// where is the density MAXIMUM, and along which direction?
function peak(f, sgn) {
  let best = { d: -1, p: 0, c: 0 };
  for (let i = 1; i <= 4000; i++) {
    const p = i * 0.01;
    for (let j = 0; j <= 400; j++) {
      const c = -1 + j * 0.005;
      const d = dens(f, p, c, sgn);
      if (d > best.d) best = { d, p, c };
    }
  }
  return best;
}

function enclosed(f, lev, sgn) {
  const NP = 3000, NC = 1000, RMAX = 40, hp = RMAX / NP, hc = 2 / NC;
  let tot = 0;
  for (let i = 0; i <= NP; i++) {
    const p = i * hp, wp = (i === 0 || i === NP) ? 0.5 : 1;
    let inner = 0;
    for (let j = 0; j <= NC; j++) {
      const c = -1 + j * hc, wc = (j === 0 || j === NC) ? 0.5 : 1;
      const d = dens(f, p, c, sgn);
      if (d >= lev) inner += wc * d;
    }
    tot += wp * inner * hc * 2 * Math.PI * p * p;
  }
  return tot * hp;
}
function solveLevel(f, frac, sgn) {
  let lo = 1e-12, hi = 1e-1;
  for (let k = 0; k < 55; k++) {
    const mid = Math.sqrt(lo * hi);
    if (enclosed(f, mid, sgn) > frac) lo = mid; else hi = mid;
  }
  return Math.sqrt(lo * hi);
}
function rhoOuter(f, c, lev, sgn) {
  const N = 16000, RMAX = 40, h = RMAX / N;
  let last = 0;
  for (let i = N; i >= 1; i--) if (dens(f, i * h, c, sgn) >= lev) { last = i * h; break; }
  if (!last) return 0;
  let lo = last, hi = last + h;
  for (let k = 0; k < 50; k++) { const m = 0.5 * (lo + hi); if (dens(f, m, c, sgn) >= lev) lo = m; else hi = m; }
  return 0.5 * (lo + hi);
}

for (const sgn of [+1, -1]) {
  console.log(`\n########  psi = ${sgn > 0 ? "+" : "-"}cs*psi_2s + cp*psi_2p  ########`);
  console.log("  set   f       P(front)  P(back)   peak at (rho, c)      front tip  back tip");
  for (const [k, f] of [["sp", 0.5], ["sp2", 1/3], ["sp3", 0.25]]) {
    const { front, back } = frontProb(f, sgn);
    const pk = peak(f, sgn);
    const lev = solveLevel(f, 0.90, sgn);
    const ft = rhoOuter(f, +1, lev, sgn) * A0, bt = rhoOuter(f, -1, lev, sgn) * A0;
    console.log(`  ${k.padEnd(4)} ${f.toFixed(4)}  ${front.toFixed(4)}    ${back.toFixed(4)}   rho=${pk.p.toFixed(2)} c=${pk.c.toFixed(3)} (${pk.c>0?"FRONT":"BACK"})  ${ft.toFixed(1).padStart(7)}  ${bt.toFixed(1).padStart(7)}`);
  }
}

console.log("\n=== VERDICT ===");
const a = frontProb(0.25, +1), b = frontProb(0.25, -1);
console.log(`  sp3 with +s:  ${(100*a.front).toFixed(1)}% of the electron sits on the +axis side`);
console.log(`  sp3 with -s:  ${(100*b.front).toFixed(1)}% of the electron sits on the +axis side`);
console.log(`  The convention that puts the BIG lobe along the bond axis is: ${b.front > a.front ? "MINUS the 2s term" : "PLUS the 2s term"}`);
