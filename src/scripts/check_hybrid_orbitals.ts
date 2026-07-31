/**
 * check:hybrid-orbitals — headless verification of the hybrid-orbital engine.
 *
 * The recurring chemistry lesson is that tsc, the validators and THE EYE all pass
 * on frames whose MEANING is wrong. So this does not check that the renderer
 * compiles; it pulls the SHIPPED function bodies out of FIELD_3D_RENDERER_CODE,
 * runs them in node, and asserts they reproduce the numbers that were solved
 * independently before any renderer code existed
 * (docs/concepts/chemistry/hybridisation_physics_block.md).
 *
 * It re-derives nothing. Every expectation below came from a separate harness on
 * a separate implementation, and one of them (the pure-2p tip) is a number
 * already shipped on master by atomic_orbitals_s_p_d.
 *
 *   npm run check:hybrid-orbitals
 */
import { FIELD_3D_RENDERER_CODE } from "../lib/renderers/field_3d_renderer";

const SRC = FIELD_3D_RENDERER_CODE;

/** Pull `function NAME(...) { ... }` out of the emitted renderer by brace matching. */
function grabFn(name: string): string {
  const start = SRC.indexOf("function " + name + "(");
  if (start < 0) throw new Error("function not found in renderer: " + name);
  let i = SRC.indexOf("{", start), depth = 0;
  for (let j = i; j < SRC.length; j++) {
    if (SRC[j] === "{") depth++;
    else if (SRC[j] === "}") { depth--; if (depth === 0) return SRC.slice(start, j + 1); }
  }
  throw new Error("unbalanced braces reading " + name);
}
/** Pull `var NAME = <literal>;` (object/array/number) by brace matching. */
function grabVar(name: string): string {
  const re = new RegExp("var " + name + "\\s*=");
  const m = re.exec(SRC);
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
  const end = SRC.indexOf(";", i);
  return SRC.slice(m.index, end + 1);
}

const VARS = ["OS_A0", "OS_PM_PER_UNIT", "OS_DOT_MAX", "OS_SAMPLE_MAX", "OS_ENCLOSURES",
  "OS_HYB_SIGN", "OS_ORB2S", "OS_ORB2P", "OS_INV_S4PI", "OS_SQRT3_4PI", "OS_R3",
  "OS_HYBRIDS", "OS_HYB_LADDER_N", "OS_HYB_LADDER_ENC", "OS_ORBITALS"];
const FNS = ["osClamp", "osNorm", "osCross", "osBasis", "osRng", "osR", "osHybAngleDeg",
  "osHybPsi", "osHybRootTable", "osHybRootAt", "osHybSolveLevel", "osBuildHybrid"];

const sandboxSrc = [
  ...VARS.map(grabVar),
  ...FNS.map(grabFn),
  "return { " + [...VARS, ...FNS].join(", ") + " };"
].join("\n");

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const E = new Function(sandboxSrc)() as any;

let failures = 0;
function check(label: string, got: number, want: number, tol: number, unit = "") {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) failures++;
  const g = Math.abs(got) < 1e-3 ? got.toExponential(4) : got.toFixed(Math.abs(got) < 10 ? 3 : 1);
  const w = Math.abs(want) < 1e-3 ? want.toExponential(4) : want.toFixed(Math.abs(want) < 10 ? 3 : 1);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(46)} got ${g}${unit}  want ${w}${unit}`);
}

console.log("\n=== 1. THE ANGLE LAW  cos(theta) = -f/(1-f) ===");
check("sp3  f = 1/4", E.osHybAngleDeg(0.25), 109.4712, 0.001, " deg");
check("sp2  f = 1/3", E.osHybAngleDeg(1 / 3), 120.0, 0.001, " deg");
check("sp   f = 1/2", E.osHybAngleDeg(0.5), 180.0, 0.001, " deg");
check("pure p  f = 0", E.osHybAngleDeg(0), 90.0, 0.001, " deg");

console.log("\n=== 2. THE SIGN CONVENTION (the defect this concept nearly shipped) ===");
// psi at rho = 3 (inside the bonding region, where R20 < 0) along the lobe axis
// must be LARGER in magnitude in front than behind. If OS_HYB_SIGN flipped, this
// inverts and the big lobe silently points away from the bond.
const sp3 = E.OS_HYBRIDS["sp3"];
const front = Math.abs(E.osHybPsi(sp3, 3, +1)), back = Math.abs(E.osHybPsi(sp3, 3, -1));
console.log(`  |psi| at rho=3: front ${front.toExponential(3)}  back ${back.toExponential(3)}`);
if (front > back) console.log("  PASS  the big lobe points ALONG the bond axis");
else { failures++; console.log("  FAIL  *** the big lobe points AWAY from the bond -- OS_HYB_SIGN is wrong ***"); }
check("OS_HYB_SIGN is the textbook minus", E.OS_HYB_SIGN, -1, 0);

console.log("\n=== 3. SOLVED LEVELS reproduce the offline bisection ===");
// osHybSolveLevel uses a mass-vs-level HISTOGRAM; the physics block used a
// bisection with full re-integration. Different algorithms, same answer.
const NR = 2000, rhoMax = 26;
const g2s = new Float64Array(NR + 1), g2p = new Float64Array(NR + 1);
for (let j = 0; j <= NR; j++) {
  const p = (j * rhoMax) / NR;
  g2s[j] = E.osR(E.OS_ORB2S, p); g2p[j] = E.osR(E.OS_ORB2P, p);
}
for (const [id, want] of [["sp", 8.5587e-4], ["sp2", 9.4100e-4], ["sp3", 9.6698e-4]] as [string, number][]) {
  const f = E.OS_HYBRIDS[id].f;
  const lev = E.osHybSolveLevel(f, 0.50, rhoMax, g2s, g2p, NR);
  check(`${id} 50% iso-density level`, lev, want, want * 0.02);
}

console.log("\n=== 4. LOBE TIPS from the shipped root table (pm) ===");
// expectations: hybridisation_physics_block.md section 4a / the countability solve
const TIPS: Record<string, { front: number; back: number }> = {
  sp:  { front: 349, back: 166 },
  sp2: { front: 343, back: 202 },
  sp3: { front: 341, back: 222 }
};
for (const id of ["sp", "sp2", "sp3"]) {
  const orb = E.OS_HYBRIDS[id];
  const tab = E.osHybRootTable(orb.f, orb.levels["50"], orb.rhoMax, 200, NR, g2s, g2p);
  check(`${id} front tip @50%`, E.osHybRootAt(tab, 1) * E.OS_A0, TIPS[id].front, 3, " pm");
  check(`${id} back tip  @50%`, E.osHybRootAt(tab, -1) * E.OS_A0, TIPS[id].back, 3, " pm");
}

console.log("\n=== 5. FULL BUILD — measured directional concentration + occupancy ===");
// frontFrac is MEASURED from the seeded sample, so it is the end-to-end check
// that the sampler, the root tables and the sign all agree.
const FRONT: Record<string, number> = { sp: 87.5, sp2: 85.4, sp3: 82.5 };
for (const id of ["sp", "sp2", "sp3"]) {
  const orb = E.OS_HYBRIDS[id];
  E.osBuildHybrid(orb);
  check(`${id} electron on bond side`, orb.frontFrac * 100, FRONT[id], 1.5, " %");
  // the occupancy HUD counts dots inside the contour: it must land on the
  // enclosure the contour was solved for, or the HUD is printing a claim.
  const n = orb._sampleN;
  for (const enc of ["50", "70", "90"]) {
    check(`${id} measured occupancy @${enc}%`, (orb._insideBy[enc][n] / n) * 100, Number(enc), 2.0, " %");
  }
  check(`${id} energy`, orb.E, -3.4, 0.001, " eV");
}

console.log("\n=== 6. CROSS-CHECK against SHIPPED atomic_orbitals_s_p_d ===");
// f = 0 must BE the pure 2p orbital -- that identity is what makes the merge beat
// a real geometric morph instead of a crossfade. Its tip at the level the shipped
// concept ships must reproduce the 482 pm already on master.
const p2lev = E.OS_ORBITALS["2p_z"].levels["90"];
const tab0 = E.osHybRootTable(0, p2lev, 26, 200, NR, g2s, g2p);
check("f=0 tip at the SHIPPED 2p 90% level", E.osHybRootAt(tab0, 1) * E.OS_A0, 482, 3, " pm");
check("f=0 is front/back symmetric (a pure p)",
  E.osHybRootAt(tab0, 1) - E.osHybRootAt(tab0, -1), 0, 1e-6);

console.log(failures === 0
  ? "\nALL HYBRID CHECKS PASS\n"
  : `\n*** ${failures} HYBRID CHECK(S) FAILED ***\n`);
process.exit(failures === 0 ? 0 : 1);
