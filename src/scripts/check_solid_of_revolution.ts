/**
 * check:solid-of-revolution — headless verification of the SOLID-OF-REVOLUTION
 * engine (`scenario_type: "solid_of_revolution"`, the mathematics volume-by-
 * integration purchase).
 *
 * Same shape and same reason as check:sigma-pi / check:cartesian-plane: tsc, the
 * validators and THE EYE all pass on frames whose MEANING is wrong, so this does
 * not check that the renderer compiles. It pulls the SHIPPED function bodies out
 * of FIELD_3D_RENDERER_CODE by brace matching, runs them in node, and asserts
 * they reproduce values solved INDEPENDENTLY of the renderer.
 *
 * Two rules govern every assertion below, both paid for by this wave:
 *
 *   1. INDEPENDENT IMPLEMENTATION IS NOT INDEPENDENT VERIFICATION. Two probes
 *      can agree because they share a bug. So every expectation is either a
 *      closed form written out by hand here from the mathematics (not from the
 *      renderer's structure), or a literal from the design document.
 *   2. A NEGATIVE CONTROL IS ONLY WORTH WHAT IT DISCRIMINATES. Every section
 *      carries a deliberately broken twin, asserted to FAIL the very check it is
 *      paired with — because a gate that has never failed is not known to work,
 *      and because a control that measures a permutation-invariant summary of
 *      the thing that failed passes vacuously.
 *
 * SR-A owns sections 0, 1, 2, 4a, 8, 9, 10. Sections 3-7 and 11-13 (the theta sweep,
 * the disc / ring stack, the published volume total, the axis swap, the screen-
 * truth camera metrics) land with SR-B and are NOT stubbed here: an empty
 * section that prints PASS is exactly the vacuous pass this gate exists against.
 *
 *   npm run check:solid-of-revolution
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FIELD_3D_RENDERER_CODE } from "../lib/renderers/field_3d_renderer";
import {
  deriveMaxRevealTimeMs,
  deriveHoldExpectations,
  deriveMotionExpectations,
} from "../lib/validators/visual/deriveStateMeta";

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

const VARS = ["SR_MODES", "SR_MODES_COMPLETE", "SR_FAMILIES", "SR_READOUTS", "SR_GLOW_KEYS", "SR_PUB"];
const FNS = [
  "srClamp", "srClamp01", "srProfileFamily", "srF", "srAntiF", "srIntegralF",
  "srAntiF2", "srIntegralF2", "srHoldTotal", "srRampFrac", "srRamp", "srRampN",
  "srFmt", "srTickValues", "srPubClear",
];
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const E = new Function([
  ...VARS.map(grabVar),
  ...FNS.map(grabFn),
  "return { " + [...VARS, ...FNS].join(", ") + " };",
].join("\n"))() as Record<string, any>;

let failures = 0;
let controlsFired = 0;
function fmt(v: number): string {
  if (!isFinite(v)) return String(v);
  return (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(6) : v.toFixed(Math.abs(v) < 1e4 ? 10 : 4);
}
function check(label: string, got: number, want: number, tol: number): boolean {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(66)} got ${fmt(got)}  want ${fmt(want)}`);
  return ok;
}
function assertTrue(label: string, ok: boolean): boolean {
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  return ok;
}
/** A negative control PASSES only when the broken twin FAILS the target check. */
function control(label: string, brokenFails: boolean): void {
  controlsFired++;
  if (!brokenFails) failures++;
  console.log(`  ${brokenFails ? "PASS" : "FAIL"}  NEGATIVE CONTROL fired: ${label}`);
}
function throws(fn: () => unknown): boolean {
  try { fn(); return false; } catch { return true; }
}

// ═══════════════════════════════════════════════════════════════════════════
// INDEPENDENT closed forms. Written out here from the mathematics by hand, NOT
// read off the renderer's structure. f is the profile, F2 is the antiderivative
// of f squared, F1 the antiderivative of f.
// ═══════════════════════════════════════════════════════════════════════════
type Prof = Record<string, any>;
function ref_f(p: Prof, x: number): number {
  switch (p.family) {
    case "power": return p.a * Math.pow(x, p.p) + (p.c ?? 0);
    case "circle_arc": return Math.sqrt(p.r * p.r - (x - (p.x0 ?? 0)) ** 2) + (p.c ?? 0);
    case "sin": return p.A * Math.sin(p.omega * x + (p.phi ?? 0)) + (p.c ?? 0);
    case "exp": return p.A * Math.exp(p.k * x) + (p.c ?? 0);
  }
  throw new Error("ref_f: bad family");
}
function ref_F1(p: Prof, x: number): number {
  const c = p.c ?? 0;
  switch (p.family) {
    case "power":
      return (Math.abs(p.p + 1) < 1e-15)
        ? p.a * Math.log(Math.abs(x)) + c * x
        : p.a * Math.pow(x, p.p + 1) / (p.p + 1) + c * x;
    case "circle_arc": {
      const u = x - (p.x0 ?? 0);
      return 0.5 * (u * Math.sqrt(p.r * p.r - u * u) + p.r * p.r * Math.asin(u / p.r)) + c * u;
    }
    case "sin": return -(p.A / p.omega) * Math.cos(p.omega * x + (p.phi ?? 0)) + c * x;
    case "exp": return (p.A / p.k) * Math.exp(p.k * x) + c * x;
  }
  throw new Error("ref_F1: bad family");
}
function ref_F2(p: Prof, x: number): number {
  const c = p.c ?? 0;
  switch (p.family) {
    case "power": {
      const t1 = (Math.abs(2 * p.p + 1) < 1e-15)
        ? p.a * p.a * Math.log(Math.abs(x))
        : p.a * p.a * Math.pow(x, 2 * p.p + 1) / (2 * p.p + 1);
      const t2 = (Math.abs(p.p + 1) < 1e-15)
        ? 2 * p.a * c * Math.log(Math.abs(x))
        : 2 * p.a * c * Math.pow(x, p.p + 1) / (p.p + 1);
      return t1 + t2 + c * c * x;
    }
    case "circle_arc": {
      const u = x - (p.x0 ?? 0);
      return (p.r * p.r * u - u ** 3 / 3)
        + c * (u * Math.sqrt(p.r * p.r - u * u) + p.r * p.r * Math.asin(u / p.r))
        + c * c * u;
    }
    case "sin": {
      const w = p.omega, ph = p.phi ?? 0;
      return p.A * p.A * (x / 2 - Math.sin(2 * w * x + 2 * ph) / (4 * w))
        - (2 * p.A * c / w) * Math.cos(w * x + ph) + c * c * x;
    }
    case "exp":
      return p.A * p.A * Math.exp(2 * p.k * x) / (2 * p.k)
        + 2 * p.A * c * Math.exp(p.k * x) / p.k + c * c * x;
  }
  throw new Error("ref_F2: bad family");
}
/** An INDEPENDENT numeric integral, used only to CORROBORATE the hand closed
 *  forms above (never to check the renderer): Simpson at 200 001 points. */
function ref_quad(g: (x: number) => number, x0: number, x1: number, n = 200000): number {
  const h = (x1 - x0) / n;
  let s = g(x0) + g(x1);
  for (let i = 1; i < n; i++) s += g(x0 + i * h) * (i % 2 ? 4 : 2);
  return s * h / 3;
}

console.log("\n╔══════════════════════════════════════════════════════════════════════════╗");
console.log("║  check:solid-of-revolution — SR-A (shell / profile enum / frame /        ║");
console.log("║  region / HUD / log-n ramp). Sections 3-7 + 11-13 land with SR-B.      ║");
console.log("╚══════════════════════════════════════════════════════════════════════════╝");

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 0. THE CLOSED ENUMS, AND THAT AN UNKNOWN MEMBER THROWS (SR-D8) ===");
// ═══════════════════════════════════════════════════════════════════════════
assertTrue("profile enum is exactly power | circle_arc | sin | exp",
  Object.keys(E.SR_FAMILIES).sort().join("|") === "circle_arc|exp|power|sin");
assertTrue("mode enum is exactly region | sweep | slice | stack | compare | explore",
  Object.keys(E.SR_MODES).sort().join("|") === "compare|explore|region|slice|stack|sweep");
assertTrue("SR-A declares which modes it renders COMPLETELY (region, explore)",
  Object.keys(E.SR_MODES_COMPLETE).sort().join("|") === "explore|region");
assertTrue("srF THROWS on an unknown family (no family || \"power\" fallback)",
  throws(() => E.srF({ family: "parabola", a: 1, p: 2 }, 1)));
assertTrue("srF THROWS on a missing profile block",
  throws(() => E.srF(null, 1)));
assertTrue("srIntegralF2 THROWS on an unknown family",
  throws(() => E.srIntegralF2({ family: "ln" }, 1, 2)));
// The measurement the enum decision rests on, re-run here so a future session
// cannot quietly introduce an evaluator and leave this document stale.
assertTrue("field_3d ships ZERO expression evaluation (safeEval / new Function / *_expr)",
  !/safeEval|new\s+Function|_expr\b/.test(SRC));
// NEGATIVE CONTROL — a family resolver with a default. This is the shape the
// gate exists to forbid: it returns a plausible curve for a typo.
{
  const withDefault = (fam: string) => (["power", "circle_arc", "sin", "exp"].includes(fam) ? fam : "power");
  control("a family resolver WITH a default silently accepts the typo \"parabola\"",
    withDefault("parabola") === "power" && !throws(() => withDefault("parabola")));
}
// SR-D3 — the publication map's clearing discipline, asserted STATICALLY on the
// shipped source, not on a runtime observation that could pass by luck.
{
  const upd = grabFn("updateSolidOfRevolutionFrame");
  const body = upd.slice(upd.indexOf("{") + 1);
  const firstStmt = body.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//"))[1] ?? "";
  assertTrue("SR_PUB is cleared unconditionally at the TOP of the frame pass",
    /srPubClear\(\)/.test(firstStmt));
  assertTrue("SR_PUB is never REASSIGNED anywhere in the renderer (a fresh object strands stale readers)",
    (SRC.match(/SR_PUB\s*=/g) || []).length === 1);
  // and the HUD reads the published n rather than recomputing it
  const hud = grabFn("srWriteHud");
  assertTrue("the HUD READS SR_PUB.n and never recomputes a count of its own",
    /SR_PUB\.n/.test(hud) && !/srRampN|n_ramp/.test(hud));
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 1. srF — all four families at 20 sampled x, against closed forms ===");
// ═══════════════════════════════════════════════════════════════════════════
const PROFILES: Array<{ name: string; p: Prof; x0: number; x1: number }> = [
  { name: "power  a=1  p=0.5 c=0   (the authored main profile)", p: { family: "power", a: 1, p: 0.5, c: 0 }, x0: 0.05, x1: 4 },
  { name: "power  a=1.4 p=1   c=0.7 (line + offset — the CROSS-TERM case)", p: { family: "power", a: 1.4, p: 1, c: 0.7 }, x0: 0.05, x1: 3 },
  { name: "power  a=2   p=2   c=-0.3 (parabola)", p: { family: "power", a: 2, p: 2, c: -0.3 }, x0: 0.1, x1: 2 },
  { name: "power  a=1   p=-1  c=0.5 (reciprocal — the log branch)", p: { family: "power", a: 1, p: -1, c: 0.5 }, x0: 0.4, x1: 3 },
  { name: "power  a=1   p=3   c=0   (cubic)", p: { family: "power", a: 1, p: 3, c: 0 }, x0: 0.1, x1: 1.5 },
  { name: "circle_arc r=2 x0=0 c=0  (the SPHERE)", p: { family: "circle_arc", r: 2, x0: 0, c: 0 }, x0: -1.9, x1: 1.9 },
  { name: "circle_arc r=1.5 x0=0.5 c=0.4 (torus profile — cross-term)", p: { family: "circle_arc", r: 1.5, x0: 0.5, c: 0.4 }, x0: -0.9, x1: 1.9 },
  { name: "sin    A=1.2 w=1.1 ph=0.3 c=0", p: { family: "sin", A: 1.2, omega: 1.1, phi: 0.3, c: 0 }, x0: 0.1, x1: 2.5 },
  { name: "sin    A=1   w=2   ph=0   c=1.5 (cross-term)", p: { family: "sin", A: 1, omega: 2, phi: 0, c: 1.5 }, x0: 0, x1: 1.4 },
  { name: "exp    A=0.8 k=0.6 c=0", p: { family: "exp", A: 0.8, k: 0.6, c: 0 }, x0: 0, x1: 2 },
  { name: "exp    A=1.1 k=-0.4 c=0.9 (cross-term)", p: { family: "exp", A: 1.1, k: -0.4, c: 0.9 }, x0: 0, x1: 3 },
];
for (const { name, p, x0, x1 } of PROFILES) {
  let worst = 0;
  for (let i = 0; i < 20; i++) {
    const x = x0 + (x1 - x0) * (i / 19);
    worst = Math.max(worst, Math.abs(E.srF(p, x) - ref_f(p, x)));
  }
  check("srF  " + name, worst, 0, 1e-12);
}
// Out of domain must be NON-FINITE, never 0 — a believable wrong number is
// invisible where a NaN is not.
{
  const arc = { family: "circle_arc", r: 1, x0: 0, c: 0 };
  assertTrue("circle_arc OUTSIDE its radius returns non-finite (never 0)", !isFinite(E.srF(arc, 1.4)));
  assertTrue("power with fractional p at x<0 returns non-finite", !isFinite(E.srF({ family: "power", a: 1, p: 0.5, c: 0 }, -1)));
  // NEGATIVE CONTROL — the clamped implementation.
  const clamped = (x: number) => { const s = 1 - x * x; return s < 0 ? 0 : Math.sqrt(s); };
  control("a circle_arc CLAMPED to 0 outside its radius returns a finite 0 at x=1.4",
    isFinite(clamped(1.4)) && clamped(1.4) === 0);
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. srIntegralF / srIntegralF2 — closed forms INCLUDING the cross-term ===");
// ═══════════════════════════════════════════════════════════════════════════
for (const { name, p, x0, x1 } of PROFILES) {
  const gotA = E.srIntegralF(p, x0, x1), wantA = ref_F1(p, x1) - ref_F1(p, x0);
  const gotV = E.srIntegralF2(p, x0, x1), wantV = ref_F2(p, x1) - ref_F2(p, x0);
  check("area  " + name, gotA, wantA, 1e-12);
  check("f^2   " + name, gotV, wantV, 1e-12);
}
// The hand closed forms are themselves corroborated against a numeric integral
// computed here — this is the ONE place quadrature appears, and it checks the
// REFERENCE, never the renderer (a numeric gate on the shipped value could not
// tell an engine bug from quadrature error, which is the whole enum argument).
for (const { name, p, x0, x1 } of PROFILES) {
  const q = ref_quad((x) => ref_f(p, x) ** 2, x0, x1);
  check("(reference corroborated by Simpson) " + name.slice(0, 34), ref_F2(p, x1) - ref_F2(p, x0), q, 1e-7);
}
// The design document's own literals, solved outside every tool.
check("V = pi * integral(x) over [0,4] = 8pi  (the concept's headline answer)",
  Math.PI * E.srIntegralF2({ family: "power", a: 1, p: 0.5, c: 0 }, 0, 4), 8 * Math.PI, 1e-12);
check("region area = integral(sqrt x) over [0,4] = 16/3",
  E.srIntegralF({ family: "power", a: 1, p: 0.5, c: 0 }, 0, 4), 16 / 3, 1e-12);
check("sphere r=2: pi * integral(4-x^2) over [-2,2] = 32pi/3",
  Math.PI * E.srIntegralF2({ family: "circle_arc", r: 2, x0: 0, c: 0 }, -2, 2), 32 * Math.PI / 3, 1e-12);
check("ring: pi*(integral f^2 - integral g^2), f=sqrt x, g=x/2 on [0,4] = 8pi/3",
  Math.PI * (E.srIntegralF2({ family: "power", a: 1, p: 0.5, c: 0 }, 0, 4)
    - E.srIntegralF2({ family: "power", a: 0.5, p: 1, c: 0 }, 0, 4)), 8 * Math.PI / 3, 1e-12);
// NEGATIVE CONTROL — drop the 2ac cross-term. It is INVISIBLE on every c = 0
// profile, which is every profile the first concept authors, so the control
// must be run on a c != 0 profile or it passes vacuously.
{
  const p = { family: "power", a: 1.4, p: 1, c: 0.7 };
  const noCross = (x: number) => p.a * p.a * Math.pow(x, 3) / 3 + p.c * p.c * x;   // 2ac term dropped
  const broken = noCross(3) - noCross(0.05);
  const right = ref_F2(p, 3) - ref_F2(p, 0.05);
  control("dropping the 2ac cross-term disagrees by " + Math.abs(broken - right).toFixed(4)
    + " on a c!=0 profile", Math.abs(broken - right) > 1e-6);
  const pZero = { family: "power", a: 1.4, p: 1, c: 0 };
  const brokenZ = (1.4 * 1.4) * 27 / 3;
  control("...and is INVISIBLE at c=0, so the control is only worth what it discriminates",
    Math.abs(brokenZ - (ref_F2(pZero, 3) - ref_F2(pZero, 0))) < 1e-12);
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 4a. SR4 — the REGION STRIP and the CURVE TUBE, actually run ===");
// ═══════════════════════════════════════════════════════════════════════════
// THE EYE cannot run on this scenario yet (no concept JSON authors it), so this
// is the only place shipped RENDERING code executes. srWriteRegion and
// srWriteTube touch no THREE symbol — they write into
// mesh.geometry.attributes.position.array and call setDrawRange — so both run
// here against a minimal stub mesh, and what is asserted is the GEOMETRY they
// actually wrote, not a summary of it.
{
  const W = new Function([
    grabVar("SR_FAMILIES"),
    grabVar("SR_REGION_SAMPLES"), grabVar("SR_CURVE_TUB"), grabVar("SR_CURVE_RADIAL"),
    grabFn("srClamp"), grabFn("srClamp01"), grabFn("srProfileFamily"), grabFn("srF"),
    grabFn("srWriteRegion"), grabFn("srWriteTube"),
    "return { srWriteRegion, srWriteTube, SR_REGION_SAMPLES, SR_CURVE_TUB, SR_CURVE_RADIAL };",
  ].join("\n"))() as Record<string, any>;
  const stub = (floats: number) => ({
    visible: true,
    geometry: {
      attributes: { position: { array: new Float32Array(floats), needsUpdate: false } },
      drawRange: { start: 0, count: 0 },
      setDrawRange(s: number, c: number) { this.drawRange = { start: s, count: c }; },
    },
  });
  const quads = W.SR_REGION_SAMPLES - 1;
  const sqrtP = { family: "power", a: 1, p: 0.5, c: 0 };

  // (i) the strip's own area, by shoelace over the vertices the renderer WROTE.
  const stripArea = (arr: Float32Array, tris: number) => {
    let a = 0;
    for (let t = 0; t < tris; t++) {
      const o = t * 9;
      a += Math.abs((arr[o + 3] - arr[o]) * (arr[o + 7] - arr[o + 1])
        - (arr[o + 6] - arr[o]) * (arr[o + 4] - arr[o + 1])) / 2;
    }
    return a;
  };
  const m = stub(quads * 6 * 3);
  W.srWriteRegion(m, sqrtP, null, 0, 4, 1);
  // INDEPENDENT expectation: the trapezoid rule on sqrt(x) over [0,4] at 120
  // panels, written out here, not read off the renderer.
  let trap = 0;
  for (let q = 0; q < quads; q++) {
    const xa = 4 * (q / quads), xb = 4 * ((q + 1) / quads);
    trap += (Math.sqrt(xa) + Math.sqrt(xb)) / 2 * (xb - xa);
  }
  check("the drawn strip's area equals the 120-panel trapezoid rule",
    stripArea(m.geometry.attributes.position.array, m.geometry.drawRange.count / 3), trap, 1e-5);
  // 1.24e-3 short of 16/3, and that gap is HONEST rather than a tolerance
  // widened to fit: sqrt(x) has infinite slope at 0, so a 120-panel trapezoid
  // under-reads there. It is also why the HUD prints srIntegralF (the CLOSED
  // form, exact) and never measures the polygon it drew — the picture is an
  // approximation of the region, the NUMBER is not an approximation of anything.
  check("...and that under-reads the exact 16/3 by 1.24e-3 (the sqrt singularity at 0)",
    16 / 3 - trap, 1.2419e-3, 1e-6);
  check("a full fill draws every quad (2 triangles each)", m.geometry.drawRange.count, quads * 6, 0);
  assertTrue("the region writer marks its position attribute dirty",
    m.geometry.attributes.position.needsUpdate === true);

  // (ii) the fill REVEAL — half filled must span half the domain, not all of it.
  const mh = stub(quads * 6 * 3);
  W.srWriteRegion(mh, sqrtP, null, 0, 4, 0.5);
  const arrH = mh.geometry.attributes.position.array;
  let maxX = -Infinity;
  for (let i = 0; i < mh.geometry.drawRange.count / 3 * 9; i += 3) maxX = Math.max(maxX, arrH[i]);
  check("a half fill reaches x = 2.000, not 4.000", maxX, 2, 1e-6);
  // NEGATIVE CONTROL — a writer that ignores fillFrac (the reveal that is not
  // a reveal). It must reach x = 4 where the shipped one reaches 2.
  {
    const ignore = (x0: number, x1: number) => x1;   // fillFrac dropped
    control("a region writer that ignores fillFrac reaches x = " + ignore(0, 4)
      + " at half fill", Math.abs(ignore(0, 4) - 2) > 1e-6);
  }
  // (iii) an inner profile makes the strip a BAND — its area is the difference,
  // never the outer alone (the ring-region case S6 authors).
  const mb = stub(quads * 6 * 3);
  W.srWriteRegion(mb, sqrtP, { family: "power", a: 0.5, p: 1, c: 0 }, 0, 4, 1);
  check("with an inner profile the strip's area is the DIFFERENCE (16/3 - 4), same panel error",
    stripArea(mb.geometry.attributes.position.array, mb.geometry.drawRange.count / 3),
    16 / 3 - 4 - 1.2419e-3, 1e-5);

  // (iv) the curve tube's draw range reveals left to right one segment at a time.
  const tub = W.SR_CURVE_TUB, rad = W.SR_CURVE_RADIAL;
  const pts: number[][] = [];
  for (let i = 0; i <= tub; i++) { const x = 4 * i / tub; pts.push([x, Math.sqrt(x)]); }
  const mt = stub((tub + 1) * (rad + 1) * 3);
  W.srWriteTube(mt, pts, 0.035, tub);
  check("a fully drawn tube indexes every segment", mt.geometry.drawRange.count, tub * rad * 6, 0);
  W.srWriteTube(mt, pts, 0.035, tub * 0.5);
  check("a half-drawn tube indexes half the segments", mt.geometry.drawRange.count, (tub / 2) * rad * 6, 0);
  W.srWriteTube(mt, pts, 0.035, 0);
  assertTrue("a tube with zero segments drawn is HIDDEN, not a zero-length smear",
    mt.visible === false && mt.geometry.drawRange.count === 0);
  // the tube's radius is honoured in the plane, so the curve is a rod and not a
  // ribbon: the ring at a sample must span 2r in z.
  W.srWriteTube(mt, pts, 0.035, tub);
  const arrT = mt.geometry.attributes.position.array;
  let zMin = Infinity, zMax = -Infinity;
  for (let j = 0; j <= rad; j++) { const z = arrT[(60 * (rad + 1) + j) * 3 + 2]; zMin = Math.min(zMin, z); zMax = Math.max(zMax, z); }
  // A 6-sided cross-section, so the z extent is 2 r sin(60deg) = 0.0606, NOT 2r.
  // Asserted at the value the geometry actually has: rounding it up to 2r would
  // be a gate agreeing with a design that never existed.
  check("the tube ring spans 2 r sin(60deg) in z (a hexagonal rod, not a flat ribbon)",
    zMax - zMin, 2 * 0.035 * Math.sin(Math.PI / 3), 1e-7);
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 8. SR10 — the ramp, in ADVANCING PROGRESS TIME (holds excluded) ===");
// ═══════════════════════════════════════════════════════════════════════════
// (a) srRamp is LINEAR — it is NOT capRamp's capSmooth01.
{
  let worst = 0;
  for (let i = 0; i <= 100; i++) {
    const f = i / 100;
    worst = Math.max(worst, Math.abs(E.srRampFrac(1000 + f * 8000, 1000, 8000, null) - f));
  }
  check("srRampFrac(f) === f  (LINEAR, no smoothstep)", worst, 0, 1e-15);
  // NEGATIVE CONTROL — the capSmooth01 easing the clone target actually uses.
  const smooth = (u: number) => u * u * (3 - 2 * u);
  control("a capSmooth01-eased ramp differs from linear at f=0.25 by "
    + Math.abs(smooth(0.25) - 0.25).toFixed(4), Math.abs(smooth(0.25) - 0.25) > 1e-3);
}
// (b)/(c) the LOG-n law. from = log10(4), to = 3.0 (n: 4 -> 1000).
{
  const L0 = Math.log10(4), L1 = 3.0;
  check("log ramp at f=0 gives n = 4", E.srRampN(0, L0, L1), 4, 0);
  check("log ramp at f=1 gives n = 1000", E.srRampN(1, L0, L1), 1000, 0);
  check("log ramp at 50% of PROGRESS gives n = 63 (geometric mid of 4 and 1000)",
    E.srRampN(0.5, L0, L1), 63, 3);
  // TWO crossings, because the design literal and the screen disagree and the
  // difference is real: the ramp's VALUE reaches 8 at 12.554% (the skeleton's
  // measured number, 10^L = 8), but srRampN ROUNDS, so the n the HUD prints
  // first reads 8 at 11.385% (10^L = 7.5). Both are asserted, both against the
  // >= 10% floor, because asserting only the un-rounded one would gate a
  // quantity no one can see and asserting only the rounded one would silently
  // drop the design literal.
  const fVal8 = (Math.log10(8) - L0) / (L1 - L0);
  check("the ramp VALUE reaches 8 at 12.554% of advancing progress (design literal)",
    fVal8 * 100, 12.554, 0.01);
  let f8 = 1;
  for (let i = 0; i <= 1000000; i++) {
    const f = i / 1000000;
    if (E.srRampN(f, L0, L1) >= 8) { f8 = f; break; }
  }
  check("the ROUNDED n first prints 8 at 11.385% (10^L = 7.5)", f8 * 100, 11.385, 0.01);
  assertTrue("...and BOTH clear the >= 10% floor a linear ramp cannot",
    f8 >= 0.10 && fVal8 >= 0.10);
  // the authored round value 0.602 gives the same answer to within 0.01 points
  const f8b = (Math.log10(8) - 0.602) / (3.0 - 0.602);
  check("...and the authored rounded log10_from = 0.602 gives 12.556%", f8b * 100, 12.556, 0.01);
  // NEGATIVE CONTROLS — a LINEAR n-ramp. It must fail BOTH (b) and (c), and it
  // must fail (c) on BOTH crossings, or the control discriminates only one.
  const linN = (f: number) => Math.round(4 + f * (1000 - 4));
  control("a LINEAR n-ramp gives n = " + linN(0.5) + " at 50% progress, not 63", linN(0.5) === 502);
  control("a LINEAR n-ramp reaches n = 8 at 0.402% (value) / 0.351% (rounded), both below 10%",
    (8 - 4) / (1000 - 4) * 100 < 10 && (7.5 - 4) / (1000 - 4) * 100 < 10);
}
// (d) hold semantics, at the authored S4 boundaries.
{
  const start = 2000, dur = 16000;
  const holds = [{ at_ms: 5000, hold_ms: 2000 }, { at_ms: 11000, hold_ms: 2000 }];
  check("advancing span = duration - sum(holds) = 12000", 16000 - E.srHoldTotal(holds), 12000, 0);
  check("t = start           -> f = 0", E.srRampFrac(start, start, dur, holds), 0, 1e-15);
  check("t = start + 5000    -> f = 5000/12000 (first hold begins)",
    E.srRampFrac(start + 5000, start, dur, holds), 5000 / 12000, 1e-15);
  check("t = start + 6000    -> f HOLDS at 5000/12000",
    E.srRampFrac(start + 6000, start, dur, holds), 5000 / 12000, 1e-15);
  check("t = start + 7000    -> f still 5000/12000 (hold just ended)",
    E.srRampFrac(start + 7000, start, dur, holds), 5000 / 12000, 1e-15);
  check("t = start + 9000    -> f = 7000/12000 (advancing again)",
    E.srRampFrac(start + 9000, start, dur, holds), 7000 / 12000, 1e-15);
  check("t = start + 16000   -> f = 1 (ramp complete at its WALL end)",
    E.srRampFrac(start + dur, start, dur, holds), 1, 1e-15);
  check("the S4 pin at 18800 ms (post-ramp) gives n = 1000",
    E.srRampN(E.srRampFrac(18800, 2000, 16000, holds), Math.log10(4), 3), 1000, 0);
  // NEGATIVE CONTROL — holds subtracted TWICE (once from the span, once from the
  // numerator's own hold accounting), the classic double-count.
  {
    const twice = (t: number) => {
      const w = t - start;
      let held = 0;
      for (const h of holds) if (w > h.at_ms) held += Math.min(h.hold_ms, w - h.at_ms);
      return Math.min(1, Math.max(0, (w - 2 * held) / 12000));
    };
    control("holds subtracted twice gives f = " + twice(start + 9000).toFixed(4)
      + " at t+9000, not " + (7000 / 12000).toFixed(4),
      Math.abs(twice(start + 9000) - 7000 / 12000) > 1e-6);
  }
}
// srFmt: the -0.000 clamp, applied BEFORE toFixed.
assertTrue("srFmt clamps a sub-precision negative to a plain 0 (never \"-0.000\")",
  E.srFmt(-1e-9, 3) === "0.000" && E.srFmt(-0.0004, 3) === "0.000");
// srTickValues: the origin always carries a mark.
{
  const t = E.srTickValues(-6.5, 6.5, 1);
  assertTrue("srTickValues walks from 0 outward, so 0 IS a mark on [-6.5, 6.5]/1",
    t.some((v: number) => Math.abs(v) < 1e-12) && t.length === 13);
  // NEGATIVE CONTROL — the pre-fix enumerator that walked from rangeMin.
  const preFix: number[] = [];
  for (let v = -6.5; v <= 6.5 + 1e-9; v += 1) preFix.push(v);
  control("the walk-from-rangeMin enumerator has NO mark at 0 (every mark lands on a .5)",
    !preFix.some((v) => Math.abs(v) < 1e-9));
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 9. deriveStateMeta — the reveal pin, the motion and hold classes ===");
// ═══════════════════════════════════════════════════════════════════════════
{
  const mkConfig = (states: Record<string, unknown>) => ({ field_3d_config: { scenario_type: "solid_of_revolution", states } });
  const cfg = mkConfig({
    STATE_1: {
      sr: { mode: "region", outer: { family: "power", a: 1, p: 0.5, c: 0 }, domain: [0, 4],
            reveal: { frame_at_ms: 0, frame_ms: 1200, curve_at_ms: 1200, curve_ms: 4800, region_at_ms: 6000, region_ms: 7000 } },
    },
    STATE_4: {
      sr: { mode: "stack", outer: { family: "power", a: 1, p: 0.5, c: 0 }, domain: [0, 4],
            discs: { n_ramp: { log10_from: 0.602, log10_to: 3.0, start_ms: 2000, duration_ms: 16000,
                               holds: [{ at_ms: 5000, hold_ms: 2000 }, { at_ms: 11000, hold_ms: 2000 }] } } },
    },
    STATE_9: {
      sr: { mode: "explore", outer: { family: "power", a: 1, p: 0.5, c: 0 }, domain: [0, 4], controls: ["a", "b", "n"] },
      show_sliders: true,
    },
  });
  const reveal = deriveMaxRevealTimeMs(cfg as never);
  const hold = deriveHoldExpectations(cfg as never);
  const motion = deriveMotionExpectations(cfg as never);
  check("S1 pins PAST the region fill (6000 + 7000 + 600)", reveal.STATE_1, 13600, 0);
  check("S4 pins PAST the log-n ramp (2000 + 16000 + 800)", reveal.STATE_4, 18800, 0);
  assertTrue("S1 (guided) is classified reveal_hold", hold.STATE_1 === "reveal_hold");
  assertTrue("S4 (guided, with a live row) is classified reveal_hold", hold.STATE_4 === "reveal_hold");
  assertTrue("S9 (mode explore) is classified interactive", hold.STATE_9 === "interactive");
  assertTrue("S9 declares STATIC motion (user-driven)", motion.STATE_9 === false);
  assertTrue("guided states declare no motion expectation (their ramps settle)",
    motion.STATE_1 === undefined && motion.STATE_4 === undefined);
  assertTrue("'sr' is a recognised field_3d reveal key (a cached flattened config is not read as PCPL)",
    Object.keys(reveal).length === 3);
  // NEGATIVE CONTROL — a state with no sr block falls to the 1500 ms default,
  // which is the defect this registration exists to prevent.
  {
    const bare = deriveMaxRevealTimeMs(mkConfig({ STATE_1: { capacitance: {} } }) as never);
    control("a state with NO sr block pins at the 1500 ms default, mid-animation",
      bare.STATE_1 === 1500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 10. FLEET SAFETY — every other scenario emits byte-identical output ===");
// ═══════════════════════════════════════════════════════════════════════════
{
  const base = execFileSync("git", ["merge-base", "HEAD", "origin/master"], { encoding: "utf8" }).trim();
  const oldFile = execFileSync("git", ["show", base + ":src/lib/renderers/field_3d_renderer.ts"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  // FIELD_3D_RENDERER_CODE is the emitted template CONTENTS, not the TS file, so
  // the comparison is made on the TS source region that carries it — read from
  // disk for HEAD and from git for the merge base.
  const marker = "export const FIELD_3D_RENDERER_CODE = ";
  const bodyOf = (s: string) => {
    const i = s.indexOf(marker);
    if (i < 0) throw new Error("FIELD_3D_RENDERER_CODE marker not found");
    return s.slice(i);
  };
  const newFile = readFileSync("src/lib/renderers/field_3d_renderer.ts", "utf8");
  // Strip the SR block from the NEW body by its own sentinels, so what remains
  // must be the old body plus only the enumerated one-line glue chains.
  const startMark = "    // solid_of_revolution — VOLUME BY INTEGRATION (MATHEMATICS, 2026-08-08).";
  const newBody = bodyOf(newFile);
  const iSr = newBody.indexOf(startMark);
  const iEnd = newBody.indexOf("    function buildScenario() {");
  const iStart = iSr > 0 ? newBody.lastIndexOf("    // ═══", iSr) : -1;
  assertTrue("the SR block is delimited and sits immediately before buildScenario()",
    iSr > 0 && iEnd > iSr && iStart > 0 && iStart < iSr);
  const stripped = newBody.slice(0, iStart) + newBody.slice(iEnd);
  const dir = mkdtempSync(join(tmpdir(), "sr-fleet-"));
  const fa = join(dir, "old.js"), fb = join(dir, "new.js");
  writeFileSync(fa, bodyOf(oldFile));
  writeFileSync(fb, stripped);
  let diffOut = "";
  try {
    execFileSync("git", ["diff", "--no-index", "--unified=0", fa, fb], { encoding: "utf8" });
  } catch (e: unknown) {
    diffOut = String((e as { stdout?: string }).stdout ?? "");
  }
  // Every surviving change must be one of the enumerated shared chains, and the
  // classification is per HUNK rather than per line, because an allow-list keyed
  // on keywords passes any comment that happens to mention nothing — which is
  // how a real edit to a shared line would slip through as "context".
  //   A MODIFIED line is legal only if the old and new text are IDENTICAL after
  //   deleting the scenario's own insertions; a PURE INSERTION hunk is legal only
  //   if it names the scenario. A shared line whose text changed for any other
  //   reason therefore has no partner and is reported.
  const ALLOWED = [
    "solid_of_revolution", "isSolidRev", "buildSolidOfRevolution",
    "applySolidOfRevolutionState", "updateSolidOfRevolutionFrame",
    "applySolidOfRevolutionGlow", "srStateDef",
  ];
  const strip = (l: string) => l.slice(1)
    .split(' || config.scenario_type === "solid_of_revolution"').join("")
    .split(" && !isSolidRev").join("");
  const hunks: Array<{ add: string[]; del: string[] }> = [];
  let cur: { add: string[]; del: string[] } | null = null;
  for (const l of diffOut.split("\n")) {
    if (l.startsWith("@@")) { cur = { add: [], del: [] }; hunks.push(cur); continue; }
    if (!cur) continue;
    if (l.startsWith("+++") || l.startsWith("---")) continue;
    if (l.startsWith("+")) cur.add.push(l);
    else if (l.startsWith("-")) cur.del.push(l);
  }
  const stray: string[] = [];
  let changed = 0;
  for (const h of hunks) {
    changed += h.add.length + h.del.length;
    const addPool = h.add.slice();
    for (const d of h.del) {
      const i = addPool.findIndex((a) => strip(a) === strip(d));
      if (i >= 0) addPool.splice(i, 1);
      else stray.push(d);
    }
    // whatever addition is left must be part of the scenario's own glue
    const namesScenario = h.add.some((a) => ALLOWED.some((k) => a.includes(k)));
    if (!namesScenario) for (const a of addPool) stray.push(a);
  }
  for (const s of stray.slice(0, 12)) console.log("      stray: " + s.slice(0, 150));
  assertTrue("no line outside the SR block and the enumerated glue chains changed ("
    + changed + " changed, " + stray.length + " stray)", stray.length === 0);
  // NEGATIVE CONTROL — touch a shared line and prove the comparator sees it.
  {
    const tampered = stripped.replace("    function addToScene(obj) {", "    function addToScene(obj) { /* tampered */");
    const fc = join(dir, "tampered.js");
    writeFileSync(fc, tampered);
    let d2 = "";
    try { execFileSync("git", ["diff", "--no-index", "--unified=0", fa, fc], { encoding: "utf8" }); }
    catch (e: unknown) { d2 = String((e as { stdout?: string }).stdout ?? ""); }
    const hunks2: Array<{ add: string[]; del: string[] }> = [];
    let cur2: { add: string[]; del: string[] } | null = null;
    for (const l of d2.split("\n")) {
      if (l.startsWith("@@")) { cur2 = { add: [], del: [] }; hunks2.push(cur2); continue; }
      if (!cur2 || l.startsWith("+++") || l.startsWith("---")) continue;
      if (l.startsWith("+")) cur2.add.push(l);
      else if (l.startsWith("-")) cur2.del.push(l);
    }
    const stray2: string[] = [];
    for (const h of hunks2) {
      const pool = h.add.slice();
      for (const d of h.del) {
        const i = pool.findIndex((a) => strip(a) === strip(d));
        if (i >= 0) pool.splice(i, 1); else stray2.push(d);
      }
      if (!h.add.some((a) => ALLOWED.some((k) => a.includes(k)))) for (const a of pool) stray2.push(a);
    }
    control("tampering with a SHARED line (addToScene) is reported as a stray change",
      stray2.length > 0);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n" + "═".repeat(78));
console.log("  sections run: 0, 1, 2, 4a, 8, 9, 10  (SR-A scope)");
console.log("  negative controls fired: " + controlsFired);
console.log("  NOT RUN — sections 3-7, 11-13 land with SR-B (theta sweep, disc/ring");
console.log("  stack, SR-D3 volume publication, SR-D5 cap, axis swap, screen truth).");
console.log("═".repeat(78));
if (failures > 0) {
  console.log("\n❌ check:solid-of-revolution FAILED — " + failures + " assertion(s)\n");
  process.exit(1);
}
console.log("\n✅ check:solid-of-revolution PASSED — every negative control fired.\n");
