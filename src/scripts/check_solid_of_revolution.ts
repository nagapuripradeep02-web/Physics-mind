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
 * SR-A owned sections 0, 1, 2, 4a, 8, 9, 10. SR-B adds 3, 4, 4b, 5, 6, 7, 11, 11a,
 * 12 and 13 — the theta sweep, the disc / ring stack, the published volume total
 * and its cap, the axis swap, determinism, and screen truth. Every section is now
 * live; none is stubbed, because an empty section that prints PASS is exactly the
 * vacuous pass this gate exists against.
 *
 * TWO CONTROLS IN THIS FILE WERE WRONG WHEN FIRST WRITTEN AND ARE LEFT DOCUMENTED
 * RATHER THAN QUIETLY FIXED, because both are the lesson: (i) the theta-major
 * control scored an index COUNT, which is permutation-invariant on this grid and
 * passed vacuously — only the index ORDER discriminates, and order is what the
 * renderer consumes; (ii) the compensated-summation control asserted that naive
 * accumulation fails at the authored n, which is false by three orders (measured
 * 1.2e-13, tolerance 1e-12). Run every control and watch it fail before trusting it.
 *
 *   npm run check:solid-of-revolution
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FIELD_3D_RENDERER_CODE } from "../lib/renderers/field_3d_renderer";
import { runFleetSafety, classify, type FleetSafetySpec } from "./lib/fleetSafety";
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

const VARS = ["SR_MODES", "SR_MODES_COMPLETE", "SR_FAMILIES", "SR_READOUTS", "SR_GLOW_KEYS", "SR_PUB",
  "SR_RULES", "SR_KINDS", "SR_RAMP_PARAMS", "SR_DISC_POOL", "SR_DEFAULT_MAX_DRAWN"];
const FNS = [
  "srClamp", "srClamp01", "srProfileFamily", "srF", "srAntiF", "srIntegralF",
  "srAntiF2", "srIntegralF2", "srHoldTotal", "srRampFrac", "srRamp", "srRampN",
  "srFmt", "srTickValues", "srPubClear",
  // SR-B
  "srInvF", "srAntiInvF2", "srStackSpan", "srSpanOuterR", "srSpanInnerR",
  "srDiscSum", "srExactVolume", "srProjectPoint", "srPairwiseScreenSeparationDeg",
  // section 14 — the CONFIG PATH, not just the arithmetic. srDomain and srOuter
  // read live globals off `window`, and srWriteHud writes the strings a teacher
  // actually reads through `document`. Both are shimmed below, because the whole
  // lesson of section 14 is that a probe aimed at the pure summation could never
  // have seen the defect this section exists for.
  "srDomain", "srOuter", "srInner", "srSliceX", "srCapLine", "srWriteHud",
];
/** The two live-global surfaces the SR block reads. Fresh per construction. */
function makeWindowShim(): Record<string, any> {
  return { PM_srA: null, PM_srB: null, PM_srR: null, PM_srN: null, PM_srX: null, PM_srAxis: null };
}
/** A `document` just rich enough for srWriteHud: one element whose innerHTML we read back. */
function makeDocShim(): { doc: any; hud: any } {
  const hud = { innerHTML: "", style: { display: "none" } };
  return { doc: { getElementById: (id: string) => (id === "sr_readout" ? hud : null) }, hud };
}
const WIN = makeWindowShim();
const DOC = makeDocShim();
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const E = new Function("window", "document", [
  ...VARS.map(grabVar),
  ...FNS.map(grabFn),
  "return { " + [...VARS, ...FNS].join(", ") + " };",
].join("\n"))(WIN, DOC.doc) as Record<string, any>;
/** The lines srWriteHud actually rendered, split back out of the <br> join. */
function hudLines(sr: Record<string, any>, outer: any, inner: any, x0: number, x1: number, ax: string): string[] {
  DOC.hud.innerHTML = ""; DOC.hud.style.display = "none";
  E.srWriteHud(sr, outer, inner, x0, x1, 1, 1, ax);
  return DOC.hud.style.display === "none" || !DOC.hud.innerHTML ? [] : String(DOC.hud.innerHTML).split("<br>");
}

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
console.log("║  region / HUD / ramp) + SR-B (sweep / stack / publication / axis /       ║");
console.log("║  determinism / screen truth). Every section is live.                     ║");
console.log("╚══════════════════════════════════════════════════════════════════════════╝");

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 0. THE CLOSED ENUMS, AND THAT AN UNKNOWN MEMBER THROWS (SR-D8) ===");
// ═══════════════════════════════════════════════════════════════════════════
assertTrue("profile enum is exactly power | circle_arc | sin | exp",
  Object.keys(E.SR_FAMILIES).sort().join("|") === "circle_arc|exp|power|sin");
assertTrue("mode enum is exactly region | sweep | slice | stack | compare | explore",
  Object.keys(E.SR_MODES).sort().join("|") === "compare|explore|region|slice|stack|sweep");
// With SR-B landed every declared mode renders completely, and the map stays as a
// LIVE invariant: a mode added to SR_MODES and not to this map would render the
// shared apparatus and nothing else, silently.
assertTrue("every declared mode is declared COMPLETE — no mode is a silent no-op",
  Object.keys(E.SR_MODES).sort().join("|") === Object.keys(E.SR_MODES_COMPLETE).sort().join("|"));
assertTrue("the rule enum is exactly left | right | midpoint",
  Object.keys(E.SR_RULES).sort().join("|") === "left|midpoint|right");
assertTrue("the slice-kind enum is exactly disc | ring | radius_difference",
  Object.keys(E.SR_KINDS).sort().join("|") === "disc|radius_difference|ring");
assertTrue("the ramp-target enum is exactly x_cut | r | b",
  Object.keys(E.SR_RAMP_PARAMS).sort().join("|") === "b|r|x_cut");
assertTrue("the drawing cap can never exceed the mesh pool it draws into",
  E.SR_DEFAULT_MAX_DRAWN <= E.SR_DISC_POOL);
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
console.log("\n=== 4b. SR5 — the SWEPT SURFACE and its theta-major draw range ===");
// ═══════════════════════════════════════════════════════════════════════════
// srWriteSurface touches no THREE symbol, so the shipped writer runs here against
// the same kind of stub mesh section 4a uses, and what is asserted is the
// GEOMETRY it wrote — where the vertices are, and how many indices the draw range
// exposes at a given angle.
{
  const S = new Function([
    grabVar("SR_FAMILIES"), grabVar("SR_SURF_NU"), grabVar("SR_SURF_NTH"),
    grabFn("srClamp"), grabFn("srClamp01"), grabFn("srProfileFamily"), grabFn("srF"),
    grabFn("srWriteSurface"),
    "return { srWriteSurface, SR_SURF_NU, SR_SURF_NTH };",
  ].join("\n"))() as Record<string, any>;
  const nu = S.SR_SURF_NU, nth = S.SR_SURF_NTH;
  const stub = () => ({
    visible: true,
    geometry: {
      attributes: { position: { array: new Float32Array((nth + 1) * (nu + 1) * 3), needsUpdate: false } },
      drawRange: { start: 0, count: 0 },
      setDrawRange(s: number, c: number) { this.drawRange = { start: s, count: c }; },
    },
  });
  const sqrtR = (u: number) => Math.sqrt(u);
  const m = stub();
  S.srWriteSurface(m, 0, 4, "x", sqrtR, 360);
  check("a fully swept surface indexes every theta ring", m.geometry.drawRange.count, nth * nu * 6, 0);
  // the index order is THETA-MAJOR: that is the whole reveal mechanism, so it is
  // asserted as a count, not assumed from the writer's loop nesting.
  const m90 = stub();
  S.srWriteSurface(m90, 0, 4, "x", sqrtR, 90);
  check("a 90 deg sweep indexes exactly a QUARTER of the rings", m90.geometry.drawRange.count,
    Math.round(nth / 4) * nu * 6, 0);
  const m0 = stub();
  S.srWriteSurface(m0, 0, 4, "x", sqrtR, 0);
  assertTrue("a 0 deg sweep is HIDDEN, not a degenerate sliver",
    m0.visible === false && m0.geometry.drawRange.count === 0);
  // the vertices themselves: ring 0 is theta = 0, so it must lie in the +y plane
  // at radius f(u), and the axis must be x.
  {
    const arr = m.geometry.attributes.position.array;
    const i = nu;                                   // ring 0, last u sample (u = 4)
    check("ring 0 at u = 4 sits at (4, f(4), 0) — theta = 0 is +y, the axis is x",
      Math.hypot(arr[i * 3] - 4, arr[i * 3 + 1] - 2, arr[i * 3 + 2]), 0, 1e-6);
    const j = Math.round(nth / 4) * (nu + 1) + nu;  // ring at theta = 90 deg
    check("the quarter ring at u = 4 sits at (4, 0, f(4)) — a real revolution, not a fan",
      Math.hypot(arr[j * 3] - 4, arr[j * 3 + 1], arr[j * 3 + 2] - 2), 0, 1e-6);
  }
  // axis y swaps which coordinate carries u — the SAME writer, no branch of its own
  const my = stub();
  S.srWriteSurface(my, 0, 2, "y", (u: number) => 4, 360);
  {
    const arr = my.geometry.attributes.position.array;
    const i = nu;
    check("about y, ring 0 at u = 2 sits at (4, 2, 0) — u is the HEIGHT",
      Math.hypot(arr[i * 3] - 4, arr[i * 3 + 1] - 2, arr[i * 3 + 2]), 0, 1e-6);
  }
  // NEGATIVE CONTROL — a U-MAJOR index order, and it has to be scored on WHICH
  // vertices the first quarter of the index buffer touches, NOT on how many.
  // THE FIRST ATTEMPT AT THIS CONTROL PASSED VACUOUSLY: on a 96 x 72 grid both
  // orderings expose 0.25 * nth * nu * 6 indices at a quarter reveal, so a COUNT
  // is permutation-invariant — exactly the defect VG-C's area-based control had.
  // Order is what the renderer consumes, so order is what must be measured.
  {
    const quarter = (major: "theta" | "u") => {
      const idx: number[] = [];
      for (let t = 0; t < nth; t++) {
        for (let u = 0; u < nu; u++) {
          const a = t * (nu + 1) + u, b = (t + 1) * (nu + 1) + u;
          const six = [a, b, a + 1, b, b + 1, a + 1];
          if (major === "theta") idx.push(...six);
        }
      }
      if (major === "u") {
        for (let u = 0; u < nu; u++) {
          for (let t = 0; t < nth; t++) {
            const a = t * (nu + 1) + u, b = (t + 1) * (nu + 1) + u;
            idx.push(a, b, a + 1, b, b + 1, a + 1);
          }
        }
      }
      const head = idx.slice(0, Math.round(idx.length / 4));
      let maxT = 0, maxU = 0;
      for (const v of head) { maxT = Math.max(maxT, Math.floor(v / (nu + 1))); maxU = Math.max(maxU, v % (nu + 1)); }
      return { maxT, maxU, n: head.length };
    };
    const th = quarter("theta"), um = quarter("u");
    assertTrue("at a quarter reveal the SHIPPED theta-major order touches a quarter of the "
      + "rings and ALL of the length (rings " + th.maxT + "/" + nth + ", u " + th.maxU + "/" + nu + ")",
      th.maxT <= nth / 4 + 1 && th.maxU >= nu);
    control("a u-major order exposes the SAME index COUNT (" + um.n + " = " + th.n
      + ") but touches all " + um.maxT + " rings and only u <= " + um.maxU
      + " — a growing ROD, not a quarter turn, and invisible to a count-based control",
      um.n === th.n && um.maxU < nu && um.maxT >= nth);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. SR6 — the disc series, against the closed form solved by hand ===");
// ═══════════════════════════════════════════════════════════════════════════
// The left disc sum of pi f(x)^2 for f = sqrt x on [0, 4] with n slabs:
//   V_n = pi * (4/n) * SUM_{i=0..n-1} (4i/n) = 8 pi (n-1)/n,   V - V_n = 8 pi / n
// derived here from the mathematics, not read off the renderer.
const SQRT_P = { family: "power", a: 1, p: 0.5, c: 0 };
const HALF_P = { family: "power", a: 0.5, p: 1, c: 0 };
const stack = (o: Prof, i: Prof | null, n: number, rule: string, kind: string, axis = "x",
  x0 = 0, x1 = 4, cap = 120) =>
  E.srDiscSum({ outer: o, inner: i, x0, x1, n, axis, rule, kind, max_drawn: cap });
for (const n of [4, 8, 20, 100, 1000, 5000]) {
  const got = stack(SQRT_P, null, n, "left", "disc").volume;
  check(`left disc sum at n = ${String(n).padEnd(5)} = 8pi(n-1)/n`, got, 8 * Math.PI * (n - 1) / n, 1e-12);
  check(`   ...and the gap V - V_n is EXACTLY 8pi/n`, 8 * Math.PI - got, 8 * Math.PI / n, 1e-12);
}
// the OTHER two rules through the SAME placement loop — three independent closed
// forms is a far stronger check of one loop than one closed form is.
check("right disc sum at n = 7 = 8pi(n+1)/n", stack(SQRT_P, null, 7, "right", "disc").volume,
  8 * Math.PI * 8 / 7, 1e-12);
check("midpoint at n = 7 is EXACTLY 8pi — the declared hazard, asserted so it cannot surprise",
  stack(SQRT_P, null, 7, "midpoint", "disc").volume, 8 * Math.PI, 1e-12);
assertTrue("an unknown rule THROWS (no rule || \"left\" fallback)",
  throws(() => stack(SQRT_P, null, 4, "simpson", "disc")));
assertTrue("an unknown kind THROWS", throws(() => stack(SQRT_P, null, 4, "left", "washer")));
// COMPENSATED SUMMATION — measured, not assumed, and the first version of this
// block asserted something FALSE. It claimed naive accumulation drifts ~1.5e-10 at
// the n = 20 000 S5 authors; measured, naive drifts 1.2e-13 there and would have
// PASSED. So the claim is restated at what compensation actually buys: a tolerance
// that is a property of the SUMMATION rather than of the particular n someone
// authored. The control is run at the n where naive genuinely crosses 1e-12.
{
  const n = 20000;
  check("at n = 20 000 the shipped sum holds 1e-12", stack(SQRT_P, null, n, "left", "disc").volume,
    8 * Math.PI * (n - 1) / n, 1e-12);
  const sphereNaive = (r: number, N: number) => {
    const du = 2 * r / N;
    let s = 0;
    for (let i = 0; i < N; i++) { const x = -r + i * du, f = Math.sqrt(r * r - x * x); s += f * f; }
    return Math.PI * du * s;
  };
  const want = (r: number, N: number) => (4 / 3) * Math.PI * r ** 3 * (1 - 1 / (N * N));
  const at20k = Math.abs(sphereNaive(2, 20000) - want(2, 20000));
  const at20m = Math.abs(sphereNaive(2, 20000000) - want(2, 20000000));
  const shipped20m = Math.abs(E.srDiscSum({ outer: { family: "circle_arc", r: 2, x0: 0, c: 0 },
    inner: null, x0: -2, x1: 2, n: 20000000, axis: "x", rule: "left", kind: "disc", max_drawn: 120 }).volume
    - want(2, 20000000));
  console.log("      naive drift: " + at20k.toExponential(2) + " at n = 2e4 (INSIDE 1e-12 — the "
    + "first draft of this control was wrong), " + at20m.toExponential(2) + " at n = 2e7; "
    + "the shipped compensated sum holds " + shipped20m.toExponential(2) + " there");
  control("a NAIVE accumulator crosses 1e-12 at n = 2e7 where the shipped one holds "
    + shipped20m.toExponential(2), at20m > 1e-12 && shipped20m <= 1e-12);
}
// NEGATIVE CONTROL — the off-by-one partition: n sampled points but the slab
// width computed over n-1 of them.
{
  const offByOne = (n: number) => {
    const dx = 4 / (n - 1);
    let s = 0;
    for (let i = 0; i < n; i++) s += i * dx;
    return Math.PI * dx * s;
  };
  control("an off-by-one partition at n = 20 gives " + offByOne(20).toFixed(4) + ", not "
    + (8 * Math.PI * 19 / 20).toFixed(4), Math.abs(offByOne(20) - 8 * Math.PI * 19 / 20) > 1e-6);
}
// THE CAP BOUNDS COST, NEVER EXTENT (the PCPL F2 lesson, mechanised here).
{
  const r = stack(SQRT_P, null, 20000, "left", "disc");
  check("the cap draws exactly max_discs_drawn discs", r.n_drawn, 120, 0);
  check("...whose FIRST index is 0 (the near end, exactly)", r.place[0].u, 0, 1e-12);
  check("...and whose LAST is index n-1, so the drawn stack spans the WHOLE solid",
    r.place[119].u, 4 - 4 / 20000, 1e-12);
  check("...while the published total still sums all 20 000 terms",
    r.volume, 8 * Math.PI * 19999 / 20000, 1e-12);
  // NEGATIVE CONTROL — the pre-F2 shape: keep the FIRST 120 indices.
  const firstN = 120 * (4 / 20000);
  control("keeping the FIRST 120 of 20 000 draws out to x = " + firstN.toFixed(3)
    + " — 0.6 % of the solid, SHRINKING as n rises", Math.abs(firstN - 4) > 1e-6);
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. SR6 — the RING stack, and M2 built as a named kind ===");
// ═══════════════════════════════════════════════════════════════════════════
// Outer sqrt x, inner x/2 on [0, 4]. The two meet at x = 0 and x = 4.
//   exact    V = pi INT (x - x^2/4) dx = pi(8 - 16/3) = 8pi/3   = 8.3776
//   left sum V_n = (8pi/3)(1 - 1/n^2)                            (derived by hand)
//   the WRONG reading pi INT (sqrt x - x/2)^2 dx = 0.5333 pi     = 1.6755
check("the EXACT ring volume is 8pi/3", E.srExactVolume(SQRT_P, HALF_P, 0, 4, "x"), 8 * Math.PI / 3, 1e-12);
for (const n of [8, 120, 4000]) {
  check(`ring stack at n = ${String(n).padEnd(4)} = (8pi/3)(1 - 1/n^2)`,
    stack(SQRT_P, HALF_P, n, "left", "ring").volume, (8 * Math.PI / 3) * (1 - 1 / (n * n)), 1e-12);
}
{
  // M2, mechanised: the same loop, the same partition, the wrong slice rule.
  const wrong = stack(SQRT_P, HALF_P, 4000, "left", "radius_difference").volume;
  check("the radius_difference kind converges on 0.5333pi = 1.6755 (M2's own number)",
    wrong, 0.5333333333333333 * Math.PI, 1e-3);
  control("a (R - r)^2 implementation reads " + wrong.toFixed(4) + " where the ring reads "
    + (8 * Math.PI / 3).toFixed(4) + " — 5.0x too small",
    Math.abs(wrong - 8 * Math.PI / 3) > 1);
  // and at the LABELLED slice the design chose (x = 1, the widest radial gap)
  const R = Math.sqrt(1), ri = 1 / 2;
  check("at the labelled slice x = 1 the ring area is 0.75pi = 2.3562", Math.PI * (R * R - ri * ri), 0.75 * Math.PI, 1e-12);
  check("...against the wrong area 0.25pi = 0.7854, 3.0x too small", Math.PI * (R - ri) ** 2, 0.25 * Math.PI, 1e-12);
  // NEGATIVE CONTROL — the slice the design deliberately did NOT label.
  control("at x = 4 the two curves MEET (R = r = 2), so the ring is empty and "
    + "carries no contrast at all", Math.abs(Math.sqrt(4) - 4 / 2) < 1e-12);
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. SR-D3 — ONE summation, PUBLISHED, and nothing else recomputes it ===");
// ═══════════════════════════════════════════════════════════════════════════
// WHICH READING OF D11 IS HONOURED, stated so it can be argued with. SR-D3's
// WORDING said the total is computed "inside the loop that places the cylinders".
// At n = 20 000 with a 120-disc cap that loop runs 120 times, so the wording
// demands the wrong number on the one state whose claim is an equality. The
// PROPERTY D11 buys is honoured instead: computed ONCE, published, never
// recomputed. srDiscSum is that one computation and it returns the placement
// radii in the same pass — one implementation, two consumers.
{
  // CODE lines only: the block's own header comment names srDiscSum, and a count
  // that includes prose would be a check on documentation, not on the build.
  const codeOnly = SRC.split("\n").filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join("\n");
  const calls = (codeOnly.match(/srDiscSum\(/g) || []).length;
  assertTrue("srDiscSum appears exactly twice in renderer CODE: its definition and ONE call site ("
    + calls + ")", calls === 2);
  const hud = grabFn("srWriteHud");
  assertTrue("the HUD READS SR_PUB.volume and never calls srDiscSum",
    /SR_PUB\.volume/.test(hud) && !/srDiscSum/.test(hud));
  assertTrue("no function outside the summation writes SR_PUB.volume",
    (SRC.match(/SR_PUB\.volume\s*=/g) || []).length === 1);
  assertTrue("no function outside the summation writes SR_PUB.n_drawn",
    (SRC.match(/SR_PUB\.n_drawn\s*=/g) || []).length === 1);
  // SR-D5 — the cap declaration is STRUCTURAL, not authored: the HUD emits the
  // drawn count whenever n_drawn < n whatever the state's readout list says.
  assertTrue("the HUD declares the cap even when the state did not author the key",
    /SR_PUB\.n_drawn\s*<\s*SR_PUB\.n/.test(hud) && /indexOf\("discs_drawn"\)\s*<\s*0/.test(hud));
  // NEGATIVE CONTROL — the shape this forbids: a HUD with its own loop.
  {
    const hudRecompute = (n: number) => { let s = 0; for (let i = 0; i < n; i++) s += i * 4 / n; return Math.PI * (4 / n) * s; };
    control("a HUD that recomputes the total is a SECOND implementation that can disagree ("
      + hudRecompute(1000).toFixed(6) + " vs the published "
      + stack(SQRT_P, null, 1000, "left", "disc").volume.toFixed(6) + " — equal today, "
      + "unpoliced tomorrow)", /for\s*\(/.test(hudRecompute.toString()));
  }
}
// and the RUNTIME half: the published total equals the independent series at
// every n, on every family the stack can carry.
{
  let worst = 0;
  for (const n of [4, 17, 120, 1001, 20000]) {
    worst = Math.max(worst, Math.abs(stack(SQRT_P, null, n, "left", "disc").volume - 8 * Math.PI * (n - 1) / n));
    const cap = stack(SQRT_P, null, n, "left", "disc");
    if (cap.n_drawn !== Math.min(n, 120)) worst = 1;
  }
  check("the published total matches the series and n_drawn = min(n, cap) at every n", worst, 0, 1e-12);
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. SR7 — the AXIS SWAP, which is a different solid, not a relabelling ===");
// ═══════════════════════════════════════════════════════════════════════════
// The region under sqrt x on [0, 4] turned about the Y axis: at height y the
// slice runs from the curve (x = y^2) out to the far edge (x = 4), so
//   V = pi INT_0^2 (16 - y^4) dy = pi(32 - 32/5) = 128pi/5 = 80.4248
check("about y the EXACT volume is 128pi/5 = 80.4248", E.srExactVolume(SQRT_P, null, 0, 4, "y"),
  128 * Math.PI / 5, 1e-12);
check("about x the SAME region gives 8pi = 25.1327", E.srExactVolume(SQRT_P, null, 0, 4, "x"),
  8 * Math.PI, 1e-12);
check("the y stack converges on 128pi/5", stack(SQRT_P, null, 200000, "left", "ring", "y").volume,
  128 * Math.PI / 5, 1e-3);
// the inner radius at height y IS y squared — the inverse, not a relabelled f
{
  const sp = E.srStackSpan(SQRT_P, null, 0, 4, "y");
  check("about y the inner radius at height 1.4 is 1.96 = y^2", E.srSpanInnerR(sp, 1.4), 1.96, 1e-12);
  check("about y the outer radius is the far edge 4, at every height", E.srSpanOuterR(sp, 0.3), 4, 1e-12);
}
// SR-D8 for the inverse: the families that are not one-to-one THROW.
assertTrue("a circle_arc revolved about y THROWS (two x for every y — a branch choice)",
  throws(() => E.srInvF({ family: "circle_arc", r: 2, x0: 0, c: 0 }, 1)));
assertTrue("a sin profile revolved about y THROWS", throws(() => E.srInvF({ family: "sin", A: 1, omega: 1, phi: 0, c: 0 }, 0.5)));
assertTrue("an exp profile revolved about y THROWS — monotone, but DECLARED not bought",
  throws(() => E.srInvF({ family: "exp", A: 1, k: 1, c: 0 }, 2)));
// NEGATIVE CONTROL — the symbol swap: reuse the x formula and call it y.
control("a y-revolve that merely swaps symbols returns 25.1327, not 80.4248",
  Math.abs(8 * Math.PI - 128 * Math.PI / 5) > 1);

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. SR-D2 — determinism: same ms in, same bytes out, no carry-over ===");
// ═══════════════════════════════════════════════════════════════════════════
{
  // (i) the summation carries NO state between calls: a big n between two small
  // ones must not change the small one's answer.
  const a1 = stack(SQRT_P, null, 5, "left", "disc");
  stack(SQRT_P, null, 20000, "left", "disc");
  const a2 = stack(SQRT_P, null, 5, "left", "disc");
  check("srDiscSum at n = 5 is identical either side of an n = 20 000 call", a2.volume, a1.volume, 0);
  assertTrue("...including its placement array", JSON.stringify(a1.place) === JSON.stringify(a2.place));
  // (ii) the surface writer produces byte-identical vertex buffers at the same
  // theta, into two independent buffers.
  const S = new Function([
    grabVar("SR_FAMILIES"), grabVar("SR_SURF_NU"), grabVar("SR_SURF_NTH"),
    grabFn("srClamp"), grabFn("srClamp01"), grabFn("srProfileFamily"), grabFn("srF"),
    grabFn("srWriteSurface"), "return { srWriteSurface, SR_SURF_NU, SR_SURF_NTH };",
  ].join("\n"))() as Record<string, any>;
  const mk = () => ({
    visible: true,
    geometry: {
      attributes: { position: { array: new Float32Array((S.SR_SURF_NTH + 1) * (S.SR_SURF_NU + 1) * 3), needsUpdate: false } },
      drawRange: { start: 0, count: 0 },
      setDrawRange(s: number, c: number) { this.drawRange = { start: s, count: c }; },
    },
  });
  const A = mk(), B = mk(), C = mk();
  const f = (u: number) => Math.sqrt(u);
  S.srWriteSurface(A, 0, 4, "x", f, 137.5);
  S.srWriteSurface(B, 0, 4, "x", f, 300);        // B is walked THROUGH another angle
  S.srWriteSurface(B, 0, 4, "x", f, 137.5);
  S.srWriteSurface(C, 0, 4, "x", f, 137.5);
  const eq = (p: Float32Array, q: Float32Array) => p.every((v, i) => v === q[i]);
  assertTrue("two independent writes at the same theta are BYTE-identical",
    eq(A.geometry.attributes.position.array, C.geometry.attributes.position.array));
  assertTrue("...and a buffer walked through another angle first lands on the same bytes "
    + "(no accumulation, no history)",
    eq(A.geometry.attributes.position.array, B.geometry.attributes.position.array));
  // (iii) theta itself is a closed form of ms — a re-pin cannot land elsewhere.
  const T = new Function([
    grabFn("srClamp"), grabFn("srClamp01"), grabFn("srHoldTotal"), grabFn("srRampFrac"),
    grabFn("srThetaDeg"), "return { srThetaDeg };",
  ].join("\n"))() as Record<string, any>;
  const srB = { mode: "sweep", theta_ramp: { from_deg: 0, to_deg: 360, start_ms: 1500, duration_ms: 12000 } };
  check("theta at 7500 ms is 214.3 deg, computed from the clock alone",
    T.srThetaDeg(srB, 7500), 360 * (7500 - 1500) / 12000, 1e-12);
  assertTrue("...and re-asking at 7500 after asking at 11 000 gives the same answer",
    (T.srThetaDeg(srB, 11000), T.srThetaDeg(srB, 7500)) === 180);
  assertTrue("a state with no theta_ramp is NOT mid-sweep (region 0, every other mode 360)",
    T.srThetaDeg({ mode: "region" }, 5000) === 0 && T.srThetaDeg({ mode: "stack" }, 5000) === 360);
  // NEGATIVE CONTROL — n (or theta) from a frame counter.
  {
    let frames = 0;
    const fromCounter = () => { frames++; return frames * 6; };
    const first = fromCounter(); fromCounter(); fromCounter();
    control("a theta derived from a FRAME COUNTER returns " + fromCounter()
      + " the fourth time it is asked for the same instant, not " + first,
      fromCounter() !== first);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 7b. GLOW — a translucent volume is never made opaque by its own emphasis ===");
// ═══════════════════════════════════════════════════════════════════════════
// The generic pass REWRITES opacity: focal -> 1.0, peer -> GLOW_DIM_OPACITY. For a
// volume you must see through, both are defects: an opaque focal stack hides the
// axis, region and curve inside it, and a 0.20 ghost skin "dimmed" to 0.40 gets
// TWICE as opaque. Asserted statically, on the shipped glow applier.
{
  const glow = grabFn("applySolidOfRevolutionGlow");
  const dim = /var GLOW_DIM_OPACITY = ([\d.]+)/.exec(SRC);
  assertTrue("GLOW_DIM_OPACITY is read from the renderer, not assumed", !!dim);
  const dimV = Number(dim ? dim[1] : NaN);
  assertTrue("every entry in the glow map carries its OWN brightenOnly flag "
    + "(no shared literal false)", /map\[i\]\[2\]/.test(glow) && !/,\s*1,\s*false\)/.test(glow));
  assertTrue("the two swept skins and all three disc pools are brightenOnly",
    (glow.match(/,\s*true\]/g) || []).length === 5);
  assertTrue("the opaque line objects still carry the peer dim (brightenOnly false)",
    (glow.match(/,\s*false\]/g) || []).length === 5);
  // NEGATIVE CONTROL — the shared-literal form, and what it would do to a 0.20 skin.
  {
    const surfOpacity = 0.20;
    control("a peer dim applied to a 0.20 ghost skin would set it to " + dimV
      + " — " + (dimV / surfOpacity).toFixed(1) + "x MORE opaque, which is emphasis "
      + "running backwards", dimV > surfOpacity);
  }
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
    STATE_2: {
      sr: { mode: "sweep", outer: { family: "power", a: 1, p: 0.5, c: 0 }, domain: [0, 4],
            theta_ramp: { from_deg: 0, to_deg: 360, start_ms: 1500, duration_ms: 12000 } },
    },
    STATE_5: {
      sr: { mode: "stack", outer: { family: "circle_arc", r: 1, x0: 0, c: 0 }, domain: [-1, 1],
            discs: { n: 20000, max_discs_drawn: 120, rule: "left" },
            param_ramp: { param: "r", from: 1.0, to: 2.0, start_ms: 2500, duration_ms: 14000 } },
    },
    STATE_6: {
      sr: { mode: "compare", outer: { family: "power", a: 1, p: 0.5, c: 0 },
            inner: { family: "power", a: 0.5, p: 1, c: 0 }, domain: [0, 4],
            contrast: { kind: "radius_difference", at_ms: 1500, dissolve_at_ms: 9000 } },
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
  check("S2 pins PAST the theta sweep (1500 + 12000 + 700)", reveal.STATE_2, 14200, 0);
  check("S5 pins PAST the radius sweep — the PRIMARY AHA (2500 + 14000 + 700)", reveal.STATE_5, 17200, 0);
  check("S6 pins PAST the wrong solid's DISSOLVE (9000 + 900)", reveal.STATE_6, 9900, 0);
  assertTrue("S1 (guided) is classified reveal_hold", hold.STATE_1 === "reveal_hold");
  assertTrue("S4 (guided, with a live row) is classified reveal_hold", hold.STATE_4 === "reveal_hold");
  assertTrue("every SR-B mode is classified: sweep / stack / compare are reveal_hold",
    hold.STATE_2 === "reveal_hold" && hold.STATE_5 === "reveal_hold" && hold.STATE_6 === "reveal_hold");
  assertTrue("S9 (mode explore) is classified interactive", hold.STATE_9 === "interactive");
  assertTrue("S9 declares STATIC motion (user-driven)", motion.STATE_9 === false);
  assertTrue("guided states declare no motion expectation (their ramps settle)",
    motion.STATE_1 === undefined && motion.STATE_4 === undefined && motion.STATE_5 === undefined);
  assertTrue("'sr' is a recognised field_3d reveal key (a cached flattened config is not read as PCPL)",
    Object.keys(reveal).length === 6);
  // NEGATIVE CONTROL — a state whose param_ramp is NOT accounted for pins at the
  // 1500 ms default, mid-sweep, with the two readouts of the primary aha in flight.
  {
    const noRamp = deriveMaxRevealTimeMs(mkConfig({
      STATE_5: { sr: { mode: "stack", outer: { family: "circle_arc", r: 1, x0: 0, c: 0 }, domain: [-1, 1] } },
    }) as never);
    control("a stack state with NO ramp of any kind pins at the 1500 ms default",
      noRamp.STATE_5 === 1500);
  }
  // NEGATIVE CONTROL — a state with no sr block falls to the 1500 ms default,
  // which is the defect this registration exists to prevent.
  {
    const bare = deriveMaxRevealTimeMs(mkConfig({ STATE_1: { capacitance: {} } }) as never);
    control("a state with NO sr block pins at the 1500 ms default, mid-animation",
      bare.STATE_1 === 1500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 10. FLEET SAFETY — SR's blast radius is the enumerated glue, and nothing else ===");
// ═══════════════════════════════════════════════════════════════════════════
{
  // REWRITTEN 2026-08-09 (bug_class engine_gate_fleet_safety_baseline_rots_
  // the_moment_its_own_scenario_merges). This section was RED ON MASTER from
  // the hour SR merged, and the cause was not a fleet regression: the
  // baseline was merge-base(HEAD, origin/master), which on master IS HEAD, so
  // the baseline already contained SR while the comparison subtracted SR from
  // the other side. Measured: 1271 of 1271 deleted-only lines were the SR
  // block's own text; on plain master the added-only count was ZERO, so not
  // one of those lines belonged to a sibling scenario. A gate that is red by
  // default trains everyone who runs it to ignore it, and this gate is the
  // only evidence solid_of_revolution has — THE EYE cannot run on it.
  //
  // The baseline is now DERIVED (newest ancestor with no SR at all) and every
  // difference is ATTRIBUTED BY AUTHORSHIP rather than by time, so a sibling's
  // work is credited to the sibling instead of being reported here. The
  // mechanism and the options rejected on measurement are documented once, in
  // src/scripts/lib/fleetSafety.ts, and shared with check:vector-geometry-3d.
  const SPEC: FleetSafetySpec = {
    renderer: "src/lib/renderers/field_3d_renderer.ts",
    sentinel: "solid_of_revolution",
    // The scenario's VOCABULARY: its type string plus the `sr` symbol prefix
    // this file already names everything with. Derived from the naming
    // convention, not a list of symbols that would need a line per addition.
    vocabulary: /solid_of_revolution|\bsr[A-Z]|\bsr_[a-z]|SolidOfRevolution/,
    regionStart: "solid_of_revolution — VOLUME BY INTEGRATION",
    regionEnd: "    function buildScenario() {",
    glue: [
      "solid_of_revolution", "isSolidRev", "buildSolidOfRevolution",
      "applySolidOfRevolutionState", "updateSolidOfRevolutionFrame",
      "applySolidOfRevolutionGlow", "srStateDef",
      // The #sliders NOT-list condition. SR appends `&& !isSolidRev` to it, so
      // it IS part of SR's declared blast radius and was missing from this
      // list — an omission with teeth: a glue site this scenario modifies but
      // does not declare falls through to "somebody else touched it too" and
      // becomes exempt. Found by running the glue-tamper control against a
      // baseline old enough that a sibling had also rewritten the line, where
      // it silently stopped firing.
      "slidersEl.style.display",
    ],
    stripOwn: (l: string) => l
      .split(' || config.scenario_type === "solid_of_revolution"').join("")
      .split(" && !isSolidRev").join(""),
    baseEnv: "SR_FLEET_BASE",
  };
  const R = runFleetSafety(SPEC);
  if (!R.base) {
    console.log("  SKIP  no pre-SR ancestor found in the last 60 renderer commits (set SR_FLEET_BASE)");
  } else {
    console.log(`        baseline (newest ancestor with NO solid_of_revolution): ${R.base.slice(0, 10)}`);
    console.log(`        SR region excised: template lines ${R.region[0]}..${R.region[1]} (${R.region[1] - R.region[0]} lines)`);
    console.log(`        commits since the baseline: ${R.mineCommits.length} SR, ${R.othersCommits.length} other`);
    assertTrue("the baseline predates SR — it is not HEAD wearing a baseline's name (the defect this section shipped with)",
      R.base !== execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim());
    assertTrue("the SR region is delimited and sits immediately before buildScenario()",
      R.region[0] > 0 && R.region[1] > R.region[0]);

    // ── THE STRUCTURAL HALF. No history: with the region excised, every
    //    surviving mention of the scenario must be an enumerated glue site.
    //    This is strictly stronger than the diff on the addition side, which
    //    could never see an unlisted dispatch that arrived in the SAME commit
    //    as the region — to a snapshot diff that just looks like "SR landed".
    for (const s of R.unlistedReach.slice(0, 8)) console.log("      unlisted reach: " + s.trim().slice(0, 120));
    assertTrue(`SR names itself outside its own region ONLY on enumerated glue lines (${R.unlistedReach.length} unlisted)`,
      R.unlistedReach.length === 0);
    assertTrue(`every enumerated glue site is actually present (${R.glueHits.length} hits over ${SPEC.glue.length} chains)`,
      R.glueHits.length >= SPEC.glue.length);
    for (const chain of ['case "solid_of_revolution":', "var isSolidRev = config.scenario_type",
      "buildSolidOfRevolution(config);", "applySolidOfRevolutionState(", "updateSolidOfRevolutionFrame(", "applySolidOfRevolutionGlow("]) {
      assertTrue(`the "${chain.slice(0, 42)}" dispatch is wired exactly once or twice`,
        R.stripped.filter((l) => l.includes(chain)).length >= 1);
    }

    // ── THE HISTORICAL HALF, attributed.
    const C = classify(SPEC, R);
    for (const s of C.strayAdded.slice(0, 6)) console.log("      stray ADDED:   " + s.trim().slice(0, 120));
    for (const s of C.strayRemoved.slice(0, 6)) console.log("      stray REMOVED: " + s.trim().slice(0, 120));
    console.log(`        ${C.changed} lines differ from the baseline; ${C.exemptOthers} attributed to other scenarios' commits, ${C.exemptNearGlue} inside SR's own dispatch insertions, ${C.exemptPunctuation} structural punctuation`);
    assertTrue(`no line outside the SR region and the enumerated glue changed (${C.strayAdded.length} added, ${C.strayRemoved.length} removed unexplained)`,
      C.strayAdded.length === 0 && C.strayRemoved.length === 0);

    // ── NEGATIVE CONTROLS. Three, because the exemption this rewrite adds is
    //    exactly the kind of widening that can make a gate pass vacuously, and
    //    the only proof it has not is that the gate still catches a planted
    //    line in each place the exemption could have swallowed it.
    const tamperedAt = (find: string, replace: string) =>
      classify(SPEC, R, R.stripped.map((l) => (l.includes(find) ? l.replace(find, replace) : l)));

    // (1) SHARED SPINE. The classic: a helper every scenario calls.
    const t1 = tamperedAt("    function addToScene(obj) {", "    function addToScene(obj) { /* tampered */");
    control("tampering with a SHARED helper (addToScene) is reported",
      t1.strayAdded.length + t1.strayRemoved.length > 0);

    // (2) A SIBLING SCENARIO'S REGION — the discriminating one for this
    //     rewrite. Authorship exempts lines a SIBLING'S COMMIT wrote; it must
    //     NOT exempt a line nobody wrote, merely because it sits inside a
    //     sibling's region. If this control ever stops firing, the exemption
    //     has become "everything outside my own block is forgiven", which is
    //     the vacuous pass at gate scope.
    const sibling = R.stripped.find((l) => l.includes("function vgBuildVectors(vg) {"))
      ?? R.stripped.find((l) => l.includes("function buildVectorGeometry3D("));
    assertTrue("a sibling scenario's region is present in the stripped body, so the control below has something to plant in",
      !!sibling);
    const t2 = tamperedAt(sibling!, sibling! + " /* tampered */");
    control("a planted line inside a SIBLING scenario's region (vector_geometry_3d) is still reported — authorship exempts a sibling's COMMITS, never a sibling's TERRITORY",
      t2.strayAdded.length + t2.strayRemoved.length > 0);

    // (3) THE GLUE ITSELF, and this control was WRONG when first written —
    //     left documented rather than quietly retargeted, because it is this
    //     file's own lesson arriving again. It first planted its tamper on
    //     `var isSolidRev = ...`, a line SR CREATED OUTRIGHT. Nothing can
    //     detect an edit to a line that has no earlier version to differ
    //     from, so the control could not fail, and it appeared to prove the
    //     gate blind when in fact the question was meaningless. The
    //     discriminating target is a line SR APPENDED TO — a shared line with
    //     a pre-SR version — and the detection runs through the REMOVAL side:
    //     the old text vanishes, and is explained only if the new text MINUS
    //     SR's own insertion is exactly the old text. Anything else changed
    //     under cover of the append leaves the old line unexplained.
    const glueLine = R.stripped.find((l) => l.includes("slidersEl.style.display") && l.includes("isSolidRev"));
    assertTrue("a shared line SR APPENDED TO (the #sliders NOT-list) exists, so control (3) has a real target rather than a line SR created outright",
      !!glueLine);
    const t3 = glueLine ? tamperedAt(glueLine, glueLine + " /* tampered */") : { strayAdded: [], strayRemoved: [] };
    control("editing a shared line SR appended to, BEYOND SR's own insertion, is reported",
      t3.strayAdded.length + t3.strayRemoved.length > 0);

    // (4) And the counterpart that proves the exemption is REAL rather than
    //     decorative: a line a sibling's commit genuinely added is exempt, so
    //     this gate stays green while the fleet grows around it. Asserted on
    //     the measured set, not on the absence of failures.
    assertTrue(`somebody else's commits are actually being attributed (${R.othersAdded.size} added / ${R.othersRemoved.size} removed lines credited elsewhere)`,
      R.othersCommits.length === 0 || R.othersAdded.size + R.othersRemoved.size > 0);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN TRUTH (sections 11 + 12). The renderer ships the RULER — srProjectPoint,
// pure and THREE-free — and this gate supplies the POSES. No pose is hardcoded,
// defaulted or assumed anywhere in the renderer: poses are authored JSON, and the
// engine's job is only to make them checkable.
//
// UNITS, and this is the wave's central defect stated as a rule: SHAPE and ANGLE
// are scored in the ISOTROPIC tangent plane (tx, ty); FRAME FILL is scored in NDC,
// which is the only place the 16:9 aspect belongs. A helper that returned NDC and
// was used for angles sheared every measured angle by 1.78x — inside the gate
// written to catch projection defects.
//
// The RULER IS VERIFIED BEFORE IT IS USED, because a gate that scores poses with a
// broken projector agrees with the bug.
// ═══════════════════════════════════════════════════════════════════════════
const FOV = 60, ASPECT = 16 / 9, ORIGIN = [0, 0, 0];
const P = (cam: number[], x: number, y: number, z: number) =>
  E.srProjectPoint(cam, ORIGIN, FOV, ASPECT, x, y, z);

console.log("\n=== 11a. THE RULER ITSELF, against perspective solved by hand ===");
{
  // camera on +z looking at the origin: a point one unit up at the origin plane
  // subtends atan(1/5) in the isotropic plane, and NDC-y divides by tan(30 deg).
  const c = [0, 0, 5];
  const p = P(c, 0, 1, 0);
  check("tangent-plane ty of (0,1,0) from [0,0,5] is 1/5", p.ty, 0.2, 1e-12);
  check("ndcY is ty / tan(fov/2)", p.ndcY, 0.2 / Math.tan(Math.PI / 6), 1e-12);
  const q = P(c, 1, 0, 0);
  check("tangent-plane tx of (1,0,0) is 1/5 — the SAME scale as ty (isotropic)", q.tx, 0.2, 1e-12);
  check("ndcX carries the 16:9 aspect and ty does NOT", q.ndcX, 0.2 / (Math.tan(Math.PI / 6) * ASPECT), 1e-12);
  assertTrue("a point BEHIND the camera is flagged, not silently projected",
    P(c, 0, 0, 9).behind === true);
  check("depth is the distance along the view axis", p.depth, 5, 1e-12);
  // NEGATIVE CONTROL — the wave's actual defect: measure a 45 deg screen angle in
  // NDC instead of isotropic units and watch it shear.
  {
    const a = P(c, 1, 1, 0);
    const isoDeg = Math.atan2(a.ty, a.tx) * 180 / Math.PI;
    const ndcDeg = Math.atan2(a.ndcY, a.ndcX) * 180 / Math.PI;
    control("the same 45 deg direction reads " + ndcDeg.toFixed(1) + " deg in NDC and "
      + isoDeg.toFixed(1) + " deg isotropic — a 1.78x shear at 16:9",
      Math.abs(ndcDeg - isoDeg) > 5);
  }
  // and the pairwise separation, on a pair whose answer is known by hand
  {
    const sep = E.srPairwiseScreenSeparationDeg(c, ORIGIN, FOV, ASPECT, [0, 0, 0], [1, 0, 0], [0, 1, 0]);
    check("two perpendicular world directions face-on separate by 90 deg on screen", sep, 90, 1e-6);
  }
}

console.log("\n=== 11. S3's CIRCLE, over the FULL x_cut sweep, in perspective ===");
// A circular disc face viewed off-axis projects to an ELLIPSE, so the state whose
// whole lesson is "every slice is a circle" can draw an ellipse. The remedy is
// scored at the WORST position of everything that moves (A14), not at the authored
// pose — the round-0 remedy was solved at one pose and gated at that same pose.
// THE ASSERTION IS THE >= 0.95 FLOOR, NOT THE 0.960 SOLVE CONSTRAINT. Two aspect
// metrics disagree by ~0.004 (conic fit vs normal angle), so a gate asserting
// 0.960 would pass or fail on metric CHOICE. Both are measured and both reported.
{
  /** algebraic conic fit through projected rim points -> minor/major axis ratio.
   *  Independent of the renderer: only srProjectPoint is shipped code. */
  const conicAspect = (pts: Array<[number, number]>): number => {
    let cx = 0, cy = 0;
    for (const p of pts) { cx += p[0]; cy += p[1]; }
    cx /= pts.length; cy /= pts.length;
    let s = 0;
    for (const p of pts) s += Math.hypot(p[0] - cx, p[1] - cy);
    const sc = pts.length / s, N = 5;
    const M = Array.from({ length: N }, () => new Array(N).fill(0));
    const b = new Array(N).fill(0);
    for (const p of pts) {
      const x = (p[0] - cx) * sc, y = (p[1] - cy) * sc;
      const row = [x * x, x * y, y * y, x, y];
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) M[i][j] += row[i] * row[j];
        b[i] += row[i];
      }
    }
    for (let i = 0; i < N; i++) {
      let piv = i;
      for (let k = i + 1; k < N; k++) if (Math.abs(M[k][i]) > Math.abs(M[piv][i])) piv = k;
      [M[i], M[piv]] = [M[piv], M[i]]; [b[i], b[piv]] = [b[piv], b[i]];
      for (let k = i + 1; k < N; k++) {
        const f = M[k][i] / M[i][i];
        for (let j = i; j < N; j++) M[k][j] -= f * M[i][j];
        b[k] -= f * b[i];
      }
    }
    const sol = new Array(N).fill(0);
    for (let i = N - 1; i >= 0; i--) {
      let v = b[i];
      for (let j = i + 1; j < N; j++) v -= M[i][j] * sol[j];
      sol[i] = v / M[i][i];
    }
    const [A, B, C] = sol;
    const tr = A + C, d = Math.sqrt((A - C) ** 2 + B * B);
    const l1 = (tr + d) / 2, l2 = (tr - d) / 2;
    return (l1 > 0 && l2 > 0) ? Math.sqrt(Math.min(l1, l2) / Math.max(l1, l2)) : NaN;
  };
  const SHIFT = -2;                       // SR-D10: the apparatus sits on the origin
  const rimConic = (cam: number[], xg: number) => {
    const r = Math.sqrt(xg), pts: Array<[number, number]> = [];
    for (let i = 0; i < 720; i++) {
      const ph = (i / 720) * Math.PI * 2;
      const p = P(cam, xg + SHIFT, r * Math.cos(ph), r * Math.sin(ph));
      pts.push([p.tx, p.ty]);
    }
    return conicAspect(pts);
  };
  const rimNormal = (cam: number[], xg: number) => {
    const vx = xg + SHIFT - cam[0], vy = -cam[1], vz = -cam[2];
    return Math.abs(vx / Math.hypot(vx, vy, vz));
  };
  const sweep = (cam: number[], f: (c: number[], x: number) => number) => {
    let min = 2, at = 0;
    for (let i = 1; i <= 80; i++) {
      const x = i * 0.05, v = f(cam, x);
      if (v < min) { min = v; at = x; }
    }
    return { min, at };
  };
  const DESIGN = [7.83, 0.80, 1.46];      // the CHECKPOINT-A pose, supplied by the gate
  const ROUND0 = [11.0, 1.6, 2.9];        // the pose the remedy replaced
  const dc = sweep(DESIGN, rimConic), dn = sweep(DESIGN, rimNormal);
  console.log(`      design pose worst aspect: conic ${dc.min.toFixed(4)} @x=${dc.at.toFixed(2)}`
    + `  |  normal-angle ${dn.min.toFixed(4)} @x=${dn.at.toFixed(2)}  (they differ by `
    + `${Math.abs(dc.min - dn.min).toFixed(4)} — which is why the FLOOR is asserted)`);
  assertTrue("the design pose holds aspect >= 0.95 at EVERY one of the 80 swept x_cut "
    + "positions, on BOTH metrics", dc.min >= 0.95 && dn.min >= 0.95);
  assertTrue("...and the worst position is the FAR end of the travel, not the authored pose",
    Math.abs(dc.at - 4) < 1e-9);
  // (b) the solid never reads as a flat disc: projected axial length / face diameter
  {
    const r = Math.sqrt(4), pts: Array<[number, number]> = [];
    for (let i = 0; i < 360; i++) {
      const ph = (i / 360) * Math.PI * 2;
      const p = P(DESIGN, 4 + SHIFT, r * Math.cos(ph), r * Math.sin(ph));
      pts.push([p.tx, p.ty]);
    }
    let dia = 0;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      dia = Math.max(dia, Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]));
    }
    const a0 = P(DESIGN, 0 + SHIFT, 0, 0), a1 = P(DESIGN, 4 + SHIFT, 0, 0);
    const axial = Math.hypot(a0.tx - a1.tx, a0.ty - a1.ty);
    console.log("      projected axial length / face diameter at x = 4: "
      + (100 * axial / dia).toFixed(1) + "%  (floor 8 %)");
    assertTrue("the solid's projected depth is >= 8 % of its face diameter", axial / dia >= 0.08);
  }
  // (d) the axis line and the profile curve never collapse onto each other
  {
    const sep = E.srPairwiseScreenSeparationDeg(DESIGN, ORIGIN, FOV, ASPECT,
      [1 + SHIFT, 1, 0], [1, 0, 0], [1, 0.5, 0]);   // axis tangent vs curve tangent at x = 1
    console.log("      (axis, curve) pairwise screen separation at x = 1: " + sep.toFixed(1) + " deg");
    assertTrue("the axis and the profile curve separate by >= 15 deg on screen", sep >= 15);
  }
  // (e) the whole solid stays inside the frame
  {
    let mx = 0, my = 0;
    for (let i = 0; i <= 60; i++) {
      const x = 4 * i / 60, r = Math.sqrt(x);
      for (let k = 0; k < 48; k++) {
        const ph = (k / 48) * Math.PI * 2;
        const p = P(DESIGN, x + SHIFT, r * Math.cos(ph), r * Math.sin(ph));
        mx = Math.max(mx, Math.abs(p.ndcX)); my = Math.max(my, Math.abs(p.ndcY));
      }
    }
    console.log("      max |NDC| over the whole solid: (" + mx.toFixed(3) + ", " + my.toFixed(3) + ")");
    assertTrue("max |NDC| <= 0.80 over the whole solid", Math.max(mx, my) <= 0.80);
  }
  // FOUR NEGATIVE CONTROLS.
  const r0c = sweep(ROUND0, rimConic), r0n = sweep(ROUND0, rimNormal);
  control("round 0's own pose [11.0, 1.6, 2.9] FAILS the 0.95 floor at x = 4 (conic "
    + r0c.min.toFixed(4) + ", normal " + r0n.min.toFixed(4) + ") — the gate carries the "
    + "history of the defect it was written for", r0c.min < 0.95 && r0n.min < 0.95);
  control("an aspect scored ONLY at the authored pose x = 0 reads "
    + rimConic(ROUND0, 0.05).toFixed(4) + " and would PASS the pose that fails — the "
    + "vacuous pass PROVED, not assumed", rimConic(ROUND0, 0.05) >= 0.95);
  {
    // an on-axis camera: the circle is perfect and the solid is a disc
    const onAxis = [9, 0, 0];
    const a0 = P(onAxis, 0 + SHIFT, 0, 0), a1 = P(onAxis, 4 + SHIFT, 0, 0);
    const axial = Math.hypot(a0.tx - a1.tx, a0.ty - a1.ty);
    control("an ON-AXIS camera draws a perfect circle (" + rimConic(onAxis, 4).toFixed(4)
      + ") with " + (axial * 100).toFixed(2) + "% axial extent — it fails the DEPTH floor, "
      + "which is why a circle metric alone is not a camera solve", axial < 1e-6);
  }
  {
    // a per-object foreshortening metric passes where the pairwise one fails: the
    // apparatus lives in the plane z = 0, so a camera IN that plane views it
    // edge-on — every object still has a perfectly good foreshortening of its own,
    // and the axis and the curve lie on top of each other on screen.
    const bad = [6.0, 3.0, 0.05];
    const perObject = rimNormal(bad, 1) > 0.30;   // each object individually "visible"
    const pair = E.srPairwiseScreenSeparationDeg(bad, ORIGIN, FOV, ASPECT,
      [1 + SHIFT, 1, 0], [1, 0, 0], [1, 0.5, 0]);
    control("a per-object metric PASSES at a pose where the pairwise separation is "
      + pair.toFixed(1) + " deg — a per-object camera check cannot see two things collapsing",
      perObject && pair < 15);
  }
}

console.log("\n=== 12. S9's explore camera, over the FULL slider product, ENUMERATED ===");
// A camera solved from the default slider values is a camera solved for one point
// of a 793-point product, and a sweep of ONE axis with the other held is a search
// that hides the feasible region in the axis it held fixed.
{
  const solidExtent = (cam: number[], a: number, b: number) => {
    const shift = -b / 2;
    let mx = 0, my = 0, ymin = Infinity, ymax = -Infinity;
    for (let i = 0; i <= 60; i++) {
      const x = b * i / 60, r = a * Math.sqrt(x);
      for (let k = 0; k < 48; k++) {
        const ph = (k / 48) * Math.PI * 2;
        const p = P(cam, x + shift, r * Math.cos(ph), r * Math.sin(ph));
        mx = Math.max(mx, Math.abs(p.ndcX)); my = Math.max(my, Math.abs(p.ndcY));
        ymin = Math.min(ymin, p.ndcY); ymax = Math.max(ymax, p.ndcY);
      }
    }
    // NDC y runs -1..1, so the frame is 2 NDC tall and the span FRACTION is /2
    return { mx, my, span: (ymax - ymin) / 2 };
  };
  const EXPLORE = [5.42, 3.43, 6.32];
  let worst = { v: 0, a: 0, b: 0 }, minSpan = { v: 9, a: 0, b: 0 }, corners = 0;
  for (let ia = 0; ia <= 12; ia++) {
    for (let ib = 0; ib <= 60; ib++) {
      const a = 0.8 + ia * 0.05, b = 1.0 + ib * 0.05;
      corners++;
      const m = solidExtent(EXPLORE, a, b);
      const v = Math.max(m.mx, m.my);
      if (v > worst.v) worst = { v, a, b };
      if (m.span < minSpan.v) minSpan = { v: m.span, a, b };
    }
  }
  check("the product is ENUMERATED, not sampled: 13 x 61 corners", corners, 793, 0);
  console.log(`      worst max |NDC| = ${worst.v.toFixed(3)} at a = ${worst.a.toFixed(2)}, `
    + `b = ${worst.b.toFixed(2)}  |  min corner screen span = ${(minSpan.v * 100).toFixed(1)}% `
    + `at a = ${minSpan.a.toFixed(2)}, b = ${minSpan.b.toFixed(2)}`);
  assertTrue("BOTH are reported and BOTH are asserted — an angle-only or fill-only "
    + "report is not a solve: max |NDC| <= 0.80 AND min span >= 12 %",
    worst.v <= 0.80 && minSpan.v >= 0.12);
  assertTrue("the worst corner is the LARGEST solid (a = 1.40, b = 4.00), as designed",
    Math.abs(worst.a - 1.40) < 1e-9 && Math.abs(worst.b - 4.00) < 1e-9);
  // TWO NEGATIVE CONTROLS. Both are framed against a TIGHTER floor than the shipped
  // one, because at 0.80 every search passes and a control that cannot fail proves
  // nothing: what is being demonstrated is that a partial search HIDES NDC.
  {
    const dflt = solidExtent(EXPLORE, 1.0, 4.0);
    const dv = Math.max(dflt.mx, dflt.my);
    control("framing computed from the DEFAULT corner alone reads " + dv.toFixed(3)
      + " and misses " + (worst.v - dv).toFixed(3) + " of NDC at the a = 1.40 corner",
      dv < worst.v - 0.05);
    let bOnly = 0;
    for (let ib = 0; ib <= 60; ib++) {
      const m = solidExtent(EXPLORE, 1.0, 1.0 + ib * 0.05);
      bOnly = Math.max(bOnly, Math.max(m.mx, m.my));
    }
    control("a sweep of b with a HELD at its default reads " + bOnly.toFixed(3)
      + " — it would PASS a 0.60 floor that the full product (" + worst.v.toFixed(3)
      + ") fails: the one-axis search hides the feasible region in the axis it held",
      bOnly <= 0.60 && worst.v > 0.60);
  }
}

console.log("\n=== 13. S5's PRIMARY AHA, on the RENDERED STRINGS, EXHAUSTIVELY ===");
// The state claims the disc total and (4/3)pi r cubed "stay equal at every r".
// The closed form, derived by hand here and NOT read off the renderer: for
// f = sqrt(r^2 - x^2) on [-r, r] the semicircle vanishes at both ends, so the LEFT
// rule IS the trapezoid rule, and
//     V_n(r) = (4/3) pi r^3 (1 - 1/n^2),   gap = (4/3) pi r^3 / n^2
// Quantising r to its slider step does not make the claim TRUE — n does that. It
// makes it PROVABLE: the reachable set is 101 values, so this is an EXHAUSTIVE
// assertion over a finite set rather than a probabilistic bound.
{
  const R_STEP = 0.01, N_SHIP = 20000, N_CONTROL = 1000;
  const radii: number[] = [];
  for (let i = 0; i <= 100; i++) radii.push(Math.round((1 + i * R_STEP) / R_STEP) * R_STEP);
  check("the reachable radius set is exactly 101 values", radii.length, 101, 0);
  const sphere = (r: number, n: number) =>
    E.srDiscSum({ outer: { family: "circle_arc", r, x0: 0, c: 0 }, inner: null,
      x0: -r, x1: r, n, axis: "x", rule: "left", kind: "disc", max_drawn: 120 });
  // (i) the closed form the claim rests on, to 1e-12
  {
    let worst = 0;
    for (const r of [1.0, 1.5, 2.0]) {
      for (const n of [120, 316, 1000, 20000]) {
        worst = Math.max(worst, Math.abs(sphere(r, n).volume - (4 / 3) * Math.PI * r ** 3 * (1 - 1 / (n * n))));
      }
    }
    check("the disc sum equals (4/3)pi r^3 (1 - 1/n^2) at 3 radii x 4 counts", worst, 0, 1e-12);
  }
  // (ii) THE STRING ASSERTION, over all 101 radii, at the shipped n
  {
    let bad = 0, worstGap = 0, first = "";
    for (const r of radii) {
      const got = sphere(r, N_SHIP).volume, want = (4 / 3) * Math.PI * r ** 3;
      worstGap = Math.max(worstGap, Math.abs(want - got));
      if (E.srFmt(got, 4) !== E.srFmt(want, 4)) {
        bad++;
        if (!first) first = `r=${r.toFixed(2)} ${E.srFmt(got, 4)} vs ${E.srFmt(want, 4)}`;
      }
    }
    console.log("      worst analytic gap at n = 20 000: " + worstGap.toExponential(3)
      + "  (display quantum 1e-4)");
    assertTrue("at n = 20 000 all 101 reachable radii format to the IDENTICAL 4-dp string ("
      + bad + " disagree)", bad === 0);
    assertTrue("...and the analytic gap is <= 8.38e-8 at every one, four orders below the "
      + "display quantum", worstGap <= 8.38e-8);
  }
  // TWO NEGATIVE CONTROLS.
  {
    let bad = 0, first = "";
    for (const r of radii) {
      const got = sphere(r, N_CONTROL).volume, want = (4 / 3) * Math.PI * r ** 3;
      if (E.srFmt(got, 4) !== E.srFmt(want, 4)) { bad++; if (!first) first = `r=${r.toFixed(2)} ${E.srFmt(got, 4)} vs ${E.srFmt(want, 4)}`; }
    }
    control("n = 1000 DISAGREES at " + bad + " of the 101 radii (" + first
      + ") — the measured number that killed round 0's n choice", bad === 13);
    // an UNQUANTISED r: the set is not enumerable, so the claim can only be sampled
    let sampledBad = 0;
    for (let i = 0; i < 5000; i++) {
      const r = 1 + Math.abs(Math.sin(i * 12.9898)) ;            // deterministic spread in [1,2]
      const got = sphere(r, N_CONTROL).volume, want = (4 / 3) * Math.PI * r ** 3;
      if (E.srFmt(got, 4) !== E.srFmt(want, 4)) sampledBad++;
    }
    control("an UNQUANTISED r has no finite reachable set — 5 000 samples at n = 1000 find "
      + sampledBad + " disagreements and can never prove there are no more",
      sampledBad > 0);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 14. THE CONFIG PATH — a circle_arc's drawn domain, over the swept radius ===");
// WHY THIS SECTION EXISTS, stated so it is not simplified away later. Section 13
// asserts the disc total over all 101 reachable radii and PASSES on the source
// that shipped before this fix — because srDiscSum coerces a non-finite radius to
// zero, so the slabs outside the arc contribute nothing and the sum is right for a
// reason unrelated to whether the picture is. The domain is a STATIC authored pair
// with a live override on the HIGH end only, so an author sweeping r could not
// move x0: at every r < the authored reach, srF returned non-finite outside the
// arc, srWriteTube and srWriteSurface drew y = 0 there (a FLAT LINE where no curve
// exists), and srExactVolume — the readout the state's whole claim rests on —
// returned NaN.
//
// THIS IS A29's RULE APPLIED TO A GATE INSTEAD OF A RECONSTRUCTION: an exact match
// on a quantity INVARIANT under the error you might have made is weaker evidence
// than an approximate match on one that DISCRIMINATES. The disc total is invariant
// here (measured below: bit-identical on both domains). The DRAWN SAMPLES and the
// exact-volume readout discriminate. Score those.
{
  const R_STEP = 0.01, N_SHIP = 20000, SAMPLES = 121;
  const radii: number[] = [];
  for (let i = 0; i <= 100; i++) radii.push(Math.round((1 + i * R_STEP) / R_STEP) * R_STEP);
  const S5 = { mode: "stack", outer: { family: "circle_arc", r: 2.0, x0: 0, c: 0 }, domain: [-2, 2] };
  /** The pre-fix srDomain, reconstructed from the four lines it used to be. */
  const preFixDomain = (sr: any): [number, number] => {
    const d = sr.domain || [0, 1];
    return [d[0], WIN.PM_srB != null ? WIN.PM_srB : d[1]];
  };
  const drawnFinite = (outer: any, x0: number, x1: number): number => {
    let ok = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const x = x0 + (x1 - x0) * (i / (SAMPLES - 1));
      if (isFinite(E.srF(outer, x))) ok++;
    }
    return ok;
  };

  // (i) THE SHIPPED PATH — the domain IS the arc's support at every reachable r.
  let badSpan = 0, badFinite = 0, badReadout = 0, firstBad = "";
  for (const r of radii) {
    WIN.PM_srR = r;
    const [x0, x1] = E.srDomain(S5);
    const outer = E.srOuter(S5);
    if (Math.abs(x0 + r) > 1e-12 || Math.abs(x1 - r) > 1e-12) badSpan++;
    if (drawnFinite(outer, x0, x1) !== SAMPLES) { badFinite++; if (!firstBad) firstBad = "r=" + r.toFixed(2); }
    const vex = E.srExactVolume(outer, null, x0, x1, "x");
    if (E.srFmt(vex, 4) !== E.srFmt((4 / 3) * Math.PI * r ** 3, 4)) badReadout++;
  }
  assertTrue("the drawn domain equals the arc's own support [-r, +r] at all 101 reachable radii ("
    + badSpan + " wrong)", badSpan === 0);
  assertTrue("every one of 121 drawn samples is FINITE at all 101 radii — no flat line where no "
    + "curve exists (" + badFinite + " radii bad" + (firstBad ? ", first " + firstBad : "") + ")", badFinite === 0);
  assertTrue("the V_exact readout formats identically to (4/3)pi r^3 at all 101 radii ("
    + badReadout + " disagree)", badReadout === 0);

  // (ii) THE NEGATIVE CONTROL THAT MATTERS — the pre-fix domain FAILS both
  //      discriminating checks, while the disc total agrees BIT-FOR-BIT.
  {
    let preBadFinite = 0, preBadReadout = 0, worstSumDiff = 0, preStrBad = 0, postStrBad = 0;
    for (const r of radii) {
      WIN.PM_srR = r;
      const [px0, px1] = preFixDomain(S5);
      const [sx0, sx1] = E.srDomain(S5);
      const outer = E.srOuter(S5);
      if (drawnFinite(outer, px0, px1) !== SAMPLES) preBadFinite++;
      if (!isFinite(E.srExactVolume(outer, null, px0, px1, "x"))) preBadReadout++;
      const spec = { outer, inner: null, n: N_SHIP, axis: "x", rule: "left", kind: "disc", max_drawn: 120 };
      const pre = E.srDiscSum({ ...spec, x0: px0, x1: px1 }).volume;
      const post = E.srDiscSum({ ...spec, x0: sx0, x1: sx1 }).volume;
      worstSumDiff = Math.max(worstSumDiff, Math.abs(pre - post));
      const want4 = E.srFmt((4 / 3) * Math.PI * r ** 3, 4);
      if (E.srFmt(pre, 4) !== want4) preStrBad++;
      if (E.srFmt(post, 4) !== want4) postStrBad++;
    }
    control("the PRE-FIX domain draws a non-existent curve at " + preBadFinite + " of 101 radii and "
      + "returns a NaN V_exact at " + preBadReadout + " of them", preBadFinite > 0 && preBadReadout > 0);
    // ⚠ THIS CONTROL WAS WRONG WHEN FIRST WRITTEN AND IS LEFT DOCUMENTED, because
    // it is the same mistake in miniature that the section is about. Its first
    // draft asserted the two domains give a BIT-IDENTICAL disc total, on the
    // strength of having watched both print the same four decimals. Measured, they
    // differ by 3.224e-8 — small, but not zero, and "same rendered string" is not
    // "same number". The claim that discriminates is the one section 13 actually
    // makes: the 4-dp STRING. That is invariant under the defect, and this is the
    // measurement rather than the assumption.
    console.log("      raw disc totals differ by " + worstSumDiff.toExponential(3)
      + " between the two domains — NOT zero, four orders below the 1e-4 display quantum");
    control("SECTION 13's OWN ASSERTION CANNOT SEE THIS — it scores the 4-dp string, and both "
      + "domains render all 101 radii correctly (" + preStrBad + " pre-fix / " + postStrBad
      + " post-fix disagree), which is why this section scores the drawn samples and the readout",
      preStrBad === 0 && postStrBad === 0);
  }

  // (iii) THE CLAMP INTERSECTS, IT DOES NOT REPLACE — a deliberately narrow
  //       authored window must survive, or the fix trades one wrong picture for
  //       another (a quarter arc silently re-widened to a full semicircle).
  {
    WIN.PM_srR = null;
    const quarter = { mode: "stack", outer: { family: "circle_arc", r: 2, x0: 0, c: 0 }, domain: [0, 2] };
    const narrow = { mode: "stack", outer: { family: "circle_arc", r: 2, x0: 0, c: 0 }, domain: [-1, 1] };
    const wide = { mode: "stack", outer: { family: "circle_arc", r: 2, x0: 0, c: 0 }, domain: [-3, 3] };
    const eq = (g: number[], w: number[]) => Math.abs(g[0] - w[0]) < 1e-12 && Math.abs(g[1] - w[1]) < 1e-12;
    assertTrue("a quarter arc authored [0, 2] is UNTOUCHED", eq(E.srDomain(quarter), [0, 2]));
    assertTrue("a narrow window [-1, 1] inside the support is UNTOUCHED", eq(E.srDomain(narrow), [-1, 1]));
    assertTrue("an over-reaching [-3, 3] is pulled back to the support [-2, 2]", eq(E.srDomain(wide), [-2, 2]));
    control("a REPLACING clamp would widen the narrow window to [-2, 2] — the intersecting one does not",
      !eq([-2, 2], E.srDomain(narrow)));
  }

  // (iv) THE OTHER AUTHORED FAMILY IS UNTOUCHED. power carries S1-S4 / S7-S9 and
  //      its b ramp is the ONE live domain override that already shipped.
  {
    WIN.PM_srR = null; WIN.PM_srB = null;
    const pw = { mode: "stack", outer: { family: "power", a: 1, p: 0.5, c: 0 }, domain: [0, 4] };
    const d0 = E.srDomain(pw);
    check("a power profile keeps its authored domain hi", d0[1], 4, 0);
    WIN.PM_srB = 2.5;
    const d1 = E.srDomain(pw);
    check("...and S8's live b ramp still wins over the authored hi", d1[1], 2.5, 0);
    WIN.PM_srB = null;
  }
}

console.log("\n=== 14b. THE THREE READOUT KEYS, ON THE RENDERED STRINGS ===");
// Scored through srWriteHud itself — the function that writes what a teacher
// reads — rather than through the quantities behind it. A30's lesson: every
// assertion about the number can be true while the WORD beside it is wrong.
{
  const sqrtP = { family: "power", a: 1, p: 0.5, c: 0 };
  const halfLine = { family: "power", a: 0.5, p: 1, c: 0 };
  WIN.PM_srR = null; WIN.PM_srB = null; WIN.PM_srN = null; WIN.PM_srX = null; WIN.PM_srAxis = null;

  // S4's shape: the ONE summation runs, publishes, and the HUD reads it.
  E.srPubClear();
  const res = E.srDiscSum({ outer: sqrtP, inner: null, x0: 0, x1: 4, n: 1000, axis: "x",
    rule: "left", kind: "disc", max_drawn: 120 });
  E.SR_PUB.n = 1000; E.SR_PUB.volume = res.volume; E.SR_PUB.n_drawn = res.n_drawn;
  E.SR_PUB.kind = "disc"; E.SR_PUB.du = res.du;
  const s4 = hudLines({ mode: "stack", readouts: ["n", "dx", "V_n", "V_settles", "gap", "discs_drawn"],
    domain: [0, 4], outer: sqrtP }, sqrtP, null, 0, 4, "x");
  console.log("      S4 HUD renders: " + JSON.stringify(s4));
  assertTrue("V_settles renders the CORE-ring label, not the advanced-ring assertion 'V ='",
    s4.some(l => l === "settles on = 25.1327"));
  assertTrue("...and no line on this core state reads 'V = ' (whose account is S8, the first ring cut)",
    !s4.some(l => l.startsWith("V = ")));
  assertTrue("dx renders the slab width the summation PUBLISHED (4/1000 = 0.0040)",
    s4.some(l => l === "\u0394x = 0.0040"));
  assertTrue("the formula surface's other symbols still render beside it (n, V_n, the shortfall)",
    s4.some(l => l === "n = 1000") && s4.some(l => l === "V\u2099 = 25.1076")
    && s4.some(l => l === "still missing = 0.0251"));
  control("V_settles and V_exact carry the SAME number under DIFFERENT labels — a key that merely "
    + "aliased V_exact would render the identical string and close nothing",
    E.srFmt(E.srExactVolume(sqrtP, null, 0, 4, "x"), 4) === "25.1327"
    && !hudLines({ mode: "stack", readouts: ["V_exact"], domain: [0, 4], outer: sqrtP }, sqrtP, null, 0, 4, "x")
        .some(l => l.startsWith("settles on")));

  // dx must be SILENT where no pass placed a slab (S1 / S2 / S3 publish no du).
  E.srPubClear();
  const s1 = hudLines({ mode: "region", readouts: ["area", "dx"], domain: [0, 4], outer: sqrtP }, sqrtP, null, 0, 4, "x");
  console.log("      S1 HUD renders: " + JSON.stringify(s1));
  control("dx is SILENT when no pass has placed a slab — a width printed from an authored n the "
    + "picture never drew is the provenance split SR-D5 exists against",
    !s1.some(l => l.indexOf("\u0394x") >= 0));
  assertTrue("...while the state's own area line still renders", s1.some(l => l === "area = 5.3333"));

  // S3's M1 chip: the consequence of the wrong belief, SHOWN.
  E.srPubClear();
  const s3 = hudLines({ mode: "slice", slice_x: 1, readouts: ["x_cut", "r", "face_area", "pi_area"],
    domain: [0, 4], outer: sqrtP }, sqrtP, null, 0, 4, "x");
  console.log("      S3 HUD renders: " + JSON.stringify(s3));
  assertTrue("pi_area renders M1's consequence pi x 5.3333 = 16.7552",
    s3.some(l => l === "\u03C0 \u00D7 area = 16.7552"));
  assertTrue("...beside the TRUE face area at the labelled slice, so the contrast is on one screen",
    s3.some(l => l === "face area = 3.1416"));
  control("the two numbers are 5.3x apart, so a student cannot read the wrong one as a rounding of "
    + "the right one", Math.abs(Math.PI * (16 / 3) - Math.PI) > 13);

  // the ring state still reads its own pair through the same writer
  E.srPubClear();
  const ring = E.srDiscSum({ outer: sqrtP, inner: halfLine, x0: 0, x1: 4, n: 1000, axis: "x",
    rule: "left", kind: "ring", max_drawn: 120 });
  E.SR_PUB.n = 1000; E.SR_PUB.volume = ring.volume; E.SR_PUB.n_drawn = ring.n_drawn;
  E.SR_PUB.kind = "ring"; E.SR_PUB.du = ring.du;
  const s6 = hudLines({ mode: "compare", slice_x: 1, readouts: ["R", "r_inner", "ring_area", "V_n", "dx"],
    domain: [0, 4], outer: sqrtP, inner: halfLine }, sqrtP, halfLine, 0, 4, "x");
  console.log("      S6 HUD renders: " + JSON.stringify(s6));
  assertTrue("S6 still reads R, the inner r and the ring area at the labelled slice x = 1",
    s6.some(l => l === "R = 1.000") && s6.some(l => l === "r = 0.500") && s6.some(l => l === "ring area = 2.3562"));
  assertTrue("...and dx serves the SAME formula surface on the extended ring", s6.some(l => l === "\u0394x = 0.0040"));
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 15. THE BUILDER ACTUALLY EXECUTES — the half no pure-helper gate can reach ===");
// WHY THIS SECTION EXISTS. Every assertion above this line runs a PURE helper
// pulled out of the template literal by brace matching, precisely so the gate
// needs no browser. buildSolidOfRevolution touches DOM and THREE, so it was the
// one function the gate could NOT call — and until a concept authored the
// scenario, nothing else called it either. It shipped through 217 assertions
// and 32 negative controls with "ReferenceError: textColor is not defined" on
// its first line of DOM work: the scenario never started, PM_simTimeMs stayed
// at 0, and THE EYE aborted rather than photograph an arbitrary phase.
//
// So this section EXECUTES the whole shipped region under shims and asserts the
// builder runs to completion. The shims are an ALLOWLIST, and the guard below
// is what stops the allowlist from becoming a way to silence the next bug.
{
  // (i) THE ALLOWLIST GUARD, FIRST — a name may be shimmed only if it is really
  //     declared at RENDERER scope outside this region. textColor is not: all
  //     149 of its uses are function-locals inside individual scenario builders,
  //     which is exactly why the SR block had to declare its own and did not.
  // slice from the START OF THE LINE — the marker sits mid-comment, and cutting
  // there hands the parser a bare comment tail (a SyntaxError, not a
  // ReferenceError, which would have masked exactly what this section tests).
  const markIdx = SRC.indexOf("solid_of_revolution — VOLUME BY INTEGRATION");
  const startIdx = SRC.lastIndexOf("\n", markIdx) + 1;
  const endIdx = SRC.indexOf("    function buildScenario() {", startIdx);
  const REGION = SRC.slice(startIdx, endIdx);
  const OUTSIDE = SRC.slice(0, startIdx) + SRC.slice(endIdx);
  // renderer scope in this file is exactly four spaces of indent; a scenario
  // builder's own locals sit at eight or more.
  const declaredAtRendererScope = (n: string) =>
    new RegExp("^ {4}(?:var|let|const|function)\\s+" + n + "\\b", "m").test(OUTSIDE);
  const SHIMS = ["window", "document", "config", "THREE", "console", "addToScene",
    "hexToThreeColor", "cueTriggerMs", "osCamScheduleAt", "nlbProjPx",
    "targetSpherical", "spherical", "updateCameraFromSpherical", "animating",
    "time", "stateStartTime"];
  const HOST = ["window", "document", "console", "THREE", "config"];
  const notDeclared = SHIMS.filter(n => !HOST.includes(n) && !declaredAtRendererScope(n));
  assertTrue("every shimmed name below is really declared at RENDERER scope outside this region ("
    + (notDeclared.length ? "MISSING: " + notDeclared.join(", ") : "all " + (SHIMS.length - HOST.length) + " checked")
    + ")", notDeclared.length === 0);
  control("the guard REFUSES textColor — its 149 uses are all function-locals inside individual "
    + "scenario builders, so shimming it would have hidden the defect instead of finding it",
    !declaredAtRendererScope("textColor"));
  assertTrue("...and the SR region now declares its OWN textColor, like every sibling builder",
    /\bvar\s+textColor\s*=/.test(REGION));

  // (ii) EXECUTE IT. Anything the region references that is neither declared
  //      inside it nor in the allowlist throws ReferenceError here.
  const made: Record<string, any> = {};
  const mkNode = (): any => {
    const node: any = {
      style: {}, children: [], innerHTML: "", textContent: "", value: "", step: "0",
      setAttribute(k: string, v: string) { node["attr_" + k] = v; },
      appendChild(c: any) { node.children.push(c); return c; },
      addEventListener() { /* the wire() handlers are exercised in (iii) */ },
    };
    return node;
  };
  const documentShim: any = {
    body: mkNode(),
    createElement: () => {
      const n = mkNode();
      // id is assigned by the caller right after createElement; register lazily
      Object.defineProperty(n, "id", {
        get: () => n._id, set: (v: string) => { n._id = v; made[v] = n; }, configurable: true,
      });
      return n;
    },
    getElementById: (id: string) => made[id] || null,
  };
  // THREE is auto-stubbed: every property is a constructor, every instance
  // answers any property with another stub. This can only hide a TYPE error,
  // never a ReferenceError — and a ReferenceError is the defect class here.
  //   `array` answers with a real Float32Array because the writers index into
  //   it; `position`/`rotation`/`scale` answer with a settable triple. Nothing
  //   else needs to be real — a stub can mask a TYPE error but never a
  //   ReferenceError, and a ReferenceError is the defect class this section is
  //   written for. The claim asserted below is therefore exactly that: the
  //   builder resolves every name it uses and runs to the end.
  const BIG = 400000;
  const stub = (): any => new Proxy(function () { /* constructible */ } as any, {
    get: (_t, k) => (k === "then" ? undefined
      : k === "array" ? new Float32Array(BIG)
      : k === "count" ? 0
      : k === "userData" ? {}
      : k === "rotation" || k === "scale"
        ? { set: () => undefined, x: 0, y: 0, z: 0 }
      : k === "position"
        ? { set: () => undefined, x: 0, y: 0, z: 0, needsUpdate: false }
        : stub()),
    set: () => true,
    apply: () => stub(),
    construct: () => stub(),
    has: () => true,
  });
  const CONFIG = {
    scenario_type: "solid_of_revolution",
    slider_controls: {
      a: { min: 0.8, max: 1.4, step: 0.05, default: 1.0 },
      b: { min: 1.0, max: 4.0, step: 0.05, default: 4.0 },
      n: { min: 4, max: 120, step: 4, default: 20 },
      r: { min: 1.0, max: 2.0, step: 0.01, default: 1.0 },
      x_cut: { min: 0.0, max: 4.0, step: 0.05, default: 0.0 },
    },
    states: {
      STATE_1: {
        camera_position: [0, 0, 5.2], formula_overlay: "y = \u221Ax",
        sr: { mode: "region", outer: { family: "power", a: 1, p: 0.5, c: 0 },
          domain: [0, 4], axis: "x",
          frame: { x_range: [0, 4], y_range: [0, 2], x_tick: 1, y_tick: 1, tick_decimals: 0, show_frame: true },
          reveal: { curve_at_ms: 1200, curve_ms: 4800, region_at_ms: 6000, region_ms: 7000 },
          controls: [], readouts: ["x_edge", "area"], glow_focal: "region" },
      },
    },
  };
  const winShim: any = { PM_srA: null, PM_srB: null, PM_srR: null, PM_srN: null,
    PM_srX: null, PM_srAxis: null, PM_srSeized: {}, PM_srCamPose: null };
  const ARGS: Record<string, any> = {
    window: winShim, document: documentShim, config: CONFIG, THREE: stub(),
    console: { warn: () => undefined, log: () => undefined },
    addToScene: () => undefined, hexToThreeColor: () => ({}),
    cueTriggerMs: (_k: string, d: number) => d, osCamScheduleAt: () => null,
    nlbProjPx: () => null,
    targetSpherical: { radius: 8, phi: 1, theta: 1 }, spherical: { radius: 8, phi: 1, theta: 1 },
    updateCameraFromSpherical: () => undefined, animating: false,
    time: 0, stateStartTime: 0,
  };
  const names = Object.keys(ARGS);
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const mkApi = () => new Function(...names, REGION
    + "\nreturn { build: buildSolidOfRevolution, apply: applySolidOfRevolutionState,"
    + " frame: updateSolidOfRevolutionFrame, glow: applySolidOfRevolutionGlow };"
  )(...names.map(n => ARGS[n]));
  /** Run fn and report WHICH class of error came back. */
  const classifyRun = (fn: () => void): { ok: boolean; ref: boolean; msg: string } => {
    try { fn(); return { ok: true, ref: false, msg: "" }; }
    catch (e) {
      const ref = e instanceof ReferenceError;
      return { ok: false, ref, msg: (e instanceof Error ? e.constructor.name + ": " + e.message : String(e)) };
    }
  };

  // (ii-a) THE DOM HALF, with no state to apply — this path touches no geometry,
  //        so it must complete CLEANLY, with no error of any class.
  const domOnly = classifyRun(() => mkApi().build({ ...CONFIG, states: {} }));
  assertTrue("with no state to apply, buildSolidOfRevolution completes CLEANLY — the DOM half of "
    + "the builder, which is where the shipped defect was"
    + (domOnly.ok ? "" : " — threw: " + domOnly.msg), domOnly.ok);

  // (ii-b) THE FULL PATH, including the first-state apply and a frame. A stubbed
  //        THREE can raise a TypeError that says nothing about the renderer, so
  //        only a ReferenceError — a name the region uses and nobody declares —
  //        fails here. That IS the shipped defect's class, and (iii) proves this
  //        assertion catches it.
  const full = classifyRun(() => {
    const api = mkApi();
    api.build(CONFIG);
    api.apply(CONFIG.states.STATE_1);
    api.frame(CONFIG.states.STATE_1);
    api.glow(CONFIG.states.STATE_1);
  });
  assertTrue("no name used anywhere in build -> apply -> frame -> glow is undeclared"
    + (full.ok ? "" : " (non-ReferenceError under the THREE stub, which is not evidence either way: "
      + full.msg + ")"), !full.ref);
  for (const id of ["sr_ticks", "sr_readout", "sr_formula", "sr_sliders"]) {
    assertTrue("...and created the DOM surface #" + id, !!made[id]);
  }
  assertTrue("the HUD and the slider panel carry real ink, not the string 'undefined' "
    + "(the shape the missing textColor would have left had it merely been undefined)",
    !!made["sr_readout"] && made["sr_readout"].style.cssText.indexOf("undefined") < 0
    && !!made["sr_sliders"] && made["sr_sliders"].style.cssText.indexOf("undefined") < 0);
  assertTrue("the slider panel built all five contextual rows plus the axis toggle",
    !!made["sr_sliders"] && ["sr_acoef_row", "sr_bend_row", "sr_radius_row", "sr_count_row",
      "sr_cut_row", "sr_axis_row"].every(r => made["sr_sliders"].innerHTML.indexOf(r) >= 0));

  // (iii) THE NEGATIVE CONTROL — reconstruct the pre-fix region by deleting the
  //       one declaration, and watch this section fail on it.
  {
    const broken = REGION.replace(/^ {8}var textColor = .*$/m, "        // (declaration removed)");
    assertTrue("the control's broken twin really differs from the shipped region",
      broken !== REGION);
    const brokenRun = classifyRun(() => {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const run = new Function(...names, broken + "\nreturn { b: buildSolidOfRevolution };");
      run(...names.map(n => ARGS[n])).b({ ...CONFIG, states: {} });
    });
    control("removing the one declaration reproduces the SHIPPED failure exactly, and it is a "
      + "ReferenceError — the class (ii-b) fails on — " + (brokenRun.msg || "no throw at all"),
      brokenRun.ref && /textColor is not defined/.test(brokenRun.msg));
    control("...and it also breaks (ii-a), the CLEAN-completion assertion, so both halves of this "
      + "section are load-bearing rather than one carrying the other", !brokenRun.ok);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n" + "═".repeat(78));
console.log("  sections run: 0, 1, 2, 3, 4, 4a, 4b, 5, 6, 7, 8, 9, 10, 11, 11a, 12, 13, 14, 14b, 15");
console.log("  negative controls fired: " + controlsFired);
// Self-correcting, because this banner was a CLAIM about the repo and claims
// rot: the moment a concept authors the scenario, THE EYE becomes the stronger
// evidence and this gate stops being the only kind there is.
{
  const roots = ["src/data/concepts", "src/data/concepts/mathematics",
    "src/data/concepts/chemistry"];
  let authoredBy: string | null = null;
  for (const dir of roots) {
    let entries: string[] = [];
    try { entries = readdirSync(dir).filter((f) => f.endsWith(".json")); } catch { continue; }
    for (const f of entries) {
      try {
        if (readFileSync(join(dir, f), "utf8").includes('"solid_of_revolution"')) {
          authoredBy = join(dir, f); break;
        }
      } catch { /* unreadable file is not evidence either way */ }
    }
    if (authoredBy) break;
  }
  if (authoredBy) {
    console.log("  THE EYE CAN run: " + authoredBy + " authors this scenario, so frames and a");
    console.log("  baseline exist. This gate is necessary evidence, no longer the only evidence.");
  } else {
    console.log("  THE EYE CANNOT RUN on this scenario: no concept JSON authors it yet, so");
    console.log("  there are no frames and no baseline. This gate is the only evidence.");
  }
}
console.log("═".repeat(78));
if (failures > 0) {
  console.log("\n❌ check:solid-of-revolution FAILED — " + failures + " assertion(s)\n");
  process.exit(1);
}
console.log("\n✅ check:solid-of-revolution PASSED — every negative control fired.\n");
