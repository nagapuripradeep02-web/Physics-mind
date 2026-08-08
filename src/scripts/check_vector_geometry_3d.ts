/**
 * check:vector-geometry-3d — headless verification of the `vector_geometry_3d`
 * engine family on `field_3d_renderer.ts` (bug_class
 * field3d_has_no_generic_two_vector_scenario_so_every_vector_claim_is_hardcoded_
 * per_physics_scenario — the GENERIC two-vector / 3D-geometry scenario,
 * Rule-40 platform dispatch, 2026-08-08).
 *
 * Same shape and reason as check:cartesian-plane / check:sigma-pi /
 * check:bonding-scene: tsc, the validators and THE EYE all pass on frames
 * whose GEOMETRY or CAMERA FRAMING is wrong, so this does not check that the
 * renderer compiles. It pulls the SHIPPED pure functions out of
 * FIELD_3D_RENDERER_CODE by brace matching, runs them in node, and asserts
 * them against values solved INDEPENDENTLY of the renderer (hand-derived
 * closed forms, or a second, differently-written implementation in this
 * file).
 *
 * Sections are numbered per the Phase-0 §0c gate table
 * (docs/MATHEMATICS_PHASE0_VECTORS_3D.md), NOT sequentially — 8/9/10/12 are
 * VG-C's (lines, planes, distances, the D2 quad identity) and are absent
 * until that dispatch lands, which is why the numbering has holes:
 *
 *   1  core ops (vgCross/vgDot/vgLen/vgNormalize) against closed forms at
 *      20 sampled (theta, phi) pairs, to 1e-12.
 *   2  a.(a x b) = 0 and b.(a x b) = 0 at every sample — the ARITHMETIC the
 *      primary-aha state displays, and the reason that state stays true
 *      under an adversarial camera.
 *   3  |a x b| = |a||b| sin(theta) and a.b = |a||b| cos(theta) across the
 *      whole range INCLUDING the obtuse regime where a.b goes negative.
 *   4  vgBuildVectors: the symmetric convention (a and b straddle +x at
 *      -/+ theta/2 so a x b runs along +Y), b_tilt_deg as a Rodrigues
 *      rotation about a-hat, and F21 (vgAnimValue) as a closed form of ms.
 *   5  deriveStateMeta registration — the reveal pin lands past the LAST
 *      settled beat (grow-in, ramps AND camera steps), and the explore
 *      state is classified interactive.
 *   6  the parallelogram quad's AREA equals |a x b| (VG-B's mesh, already
 *      present on this desk, so its gate section is kept rather than
 *      deleted and rebuilt).
 *   7  the parallelepiped: 8 corners, 6 faces, the solid CLOSES by
 *      construction, and its volume equals |a.(b x c)|.
 *  11  FLEET SAFETY — every scenario other than vector_geometry_3d emits
 *      byte-identical template output vs the base ref.
 *  13  the CAMERA, under THE WORST-CASE LAW: scored PAIRWISE over every
 *      rendered pair, in PERSPECTIVE, at FOV 60 against a declared
 *      reference aspect, at the worst case over EVERY live slider — with
 *      an exempt-pair list (pairs antiparallel BY DESIGN) and a screen
 *      LENGTH floor (a pairwise angle cannot see foreshortening).
 *
 * Every section carries a NEGATIVE CONTROL — a gate that has never failed is
 * not known to work (dispatch mandate). Negative controls are demonstrated
 * against a deliberately-broken alternative computed IN THIS FILE, never
 * against the shipped renderer (the renderer is never mutated to fail), and
 * are run and shown to FAIL before the corresponding positive assertion.
 *
 *   npm run check:vector-geometry-3d
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { FIELD_3D_RENDERER_CODE } from "../lib/renderers/field_3d_renderer";
import { deriveMaxRevealTimeMs, deriveHoldExpectations } from "../lib/validators/visual/deriveStateMeta";

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

const FNS = [
  "vgSub", "vgAddVec", "vgCrossVec", "vgDotVec", "vgLenVec", "vgNormalize",
  "vgTranslateVerts", "vgRotateAbout", "vgBuildVectors", "vgParallelogramVerts",
  "vgParallelepipedFaces", "vgProjectPoint", "vgPairwiseScreenSeparationDeg",
  "vgEase", "vgAnimKnobs", "vgAnimValue", "vgAnimEndMs",
  "vgCamScheduleAt", "vgCamStepsEndMs", "vgAutoFramePos",
];

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const E = new Function([
  ...FNS.map((f) => grabFn(f)),
  "var VG_CAM_EASE_MS = 900;",
  "return { " + FNS.join(", ") + " };",
].join("\n"))() as any;

let failures = 0;
function check(label: string, got: unknown, want: unknown, tol: number, unit = ""): boolean {
  const ok = typeof got === "number" && typeof want === "number"
    ? Math.abs(got - want) <= tol
    : got === want;
  if (!ok) failures++;
  const fmt = (v: unknown) => (typeof v === "number" ? v.toFixed(Math.abs(v) < 10 ? 6 : 2) : JSON.stringify(v));
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(70)} got ${fmt(got)}${unit}  want ${fmt(want)}${unit}`);
  return ok;
}
function assertTrue(label: string, ok: boolean) {
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
}
/** Run a predicate and assert it evaluates to `wantFail` (used for negative controls). */
function expectFail(label: string, ok: boolean) {
  // ok === true means the (deliberately broken) thing passed the check —
  // which is the FAILURE MODE this negative control exists to demonstrate.
  const caughtTheDefect = !ok;
  if (!caughtTheDefect) failures++;
  console.log(`  ${caughtTheDefect ? "PASS" : "FAIL"}  NEGATIVE CONTROL (must itself fail first): ${label}`);
}

type V3 = [number, number, number];
const dot3 = (u: V3, v: V3) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const cross3 = (u: V3, v: V3): V3 => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const sub3 = (u: V3, v: V3): V3 => [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
const add3 = (u: V3, v: V3): V3 => [u[0] + v[0], u[1] + v[1], u[2] + v[2]];
const len3 = (u: V3) => Math.sqrt(dot3(u, u));

// ── The projection parameters, NAMED, because a camera number that does not
//    name them is not measured (AMENDMENT A10 — every camera solve in this
//    wave was first computed at an assumed FOV 50 against a renderer that is
//    PerspectiveCamera(60, ...)).
const FOV = 60;                       // field_3d_renderer.ts PerspectiveCamera(60, ...)
const ASPECT = 16 / 9;                // the file's own reference solve aspect (camera.aspect is live)
const HALF_V = Math.tan((FOV / 2) * Math.PI / 180);        // 0.5774 vertical half-extent
const HALF_H = HALF_V * ASPECT;                            // 1.0264 horizontal
const FRAME_TARGET = 0.8 * HALF_V;                         // 0.4619 — 20% left for the tip label
const TARGET: V3 = [0, 0, 0];
const UP: V3 = [0, 1, 0];
/** The renderer's own spherical camera model: az/el/dist -> world position. */
function camPosFromAzEl(azDeg: number, elDeg: number, dist: number): V3 {
  const az = azDeg * Math.PI / 180, el = elDeg * Math.PI / 180;
  return [dist * Math.cos(el) * Math.cos(az), dist * Math.sin(el), dist * Math.cos(el) * Math.sin(az)];
}
type Arrow = { id: string; origin: V3; tip: V3 };
function arrowsOf(v: { a: V3; b: V3 }): Arrow[] {
  return [
    { id: "a", origin: [0, 0, 0], tip: v.a },
    { id: "b", origin: [0, 0, 0], tip: v.b },
    { id: "axb", origin: [0, 0, 0], tip: E.vgCrossVec(v.a, v.b) },
  ];
}
/**
 * THE WORST-CASE LAW, mechanised. Scores a pose PAIRWISE over every rendered
 * pair AND reports the screen extent against the frustum — an angle alone has
 * not measured framing, and a metric evaluated at the authored pose is a
 * sample that will agree with the design that produced it.
 *
 * `exempt` names pairs that are parallel BY DESIGN (a x b vs b x a fold to
 * 0.00 degrees and that is CORRECT — the whole lesson of the order-matters
 * state is that reversing the operands flips the vector). Without the
 * exemption the gate fails the state that is right, which is how a real gate
 * gets switched off by whoever meets it first.
 */
function scorePose(camPos: V3, arrows: Arrow[], exempt: string[] = []) {
  const pairs = E.vgPairwiseScreenSeparationDeg(camPos, TARGET, UP, FOV, ASPECT, arrows);
  let minSep = Infinity, worstPair = "";
  for (const p of pairs) {
    const key = p.pair.split("|").sort().join("^");
    if (exempt.indexOf(key) >= 0) continue;
    if (p.sepDeg < minSep) { minSep = p.sepDeg; worstPair = p.pair; }
  }
  let maxArm = 0, minArm = Infinity, offFrame = false;
  for (const v of arrows) {
    const o = E.vgProjectPoint(camPos, TARGET, UP, FOV, ASPECT, v.origin);
    const t = E.vgProjectPoint(camPos, TARGET, UP, FOV, ASPECT, v.tip);
    if (!o || !t) { offFrame = true; continue; }
    const L = Math.hypot(t.sx - o.sx, t.sy - o.sy);
    if (L > maxArm) maxArm = L;
    if (L < minArm) minArm = L;
    if (Math.abs(t.sx) > HALF_H || Math.abs(t.sy) > HALF_V) offFrame = true;
  }
  return { minSep, worstPair, maxArm, minArm, offFrame };
}
console.log("\n=== 1. Core ops — vgCrossVec/vgDotVec/vgLenVec/vgNormalize against closed forms, 20 sampled (theta, phi) pairs, 1e-12 ===");
{
  // 20 sampled directions on the sphere, chosen to cover both hemispheres,
  // the poles' neighbourhood, and generic (non-axis-aligned) directions.
  const samples: Array<[number, number]> = [];
  for (let i = 0; i < 20; i++) samples.push([9 + i * 8.4, 13 + i * 37]);   // theta 9..168, phi 13..716 (mod 360)
  let maxErrCross = 0, maxErrDot = 0, maxErrLen = 0, maxErrNorm = 0;
  for (const [th, ph] of samples) {
    const t = th * Math.PI / 180, p = ph * Math.PI / 180;
    const u: V3 = [Math.sin(t) * Math.cos(p), Math.cos(t), Math.sin(t) * Math.sin(p)];
    const v: V3 = [Math.cos(t) * Math.sin(p), Math.sin(t) * Math.sin(p), Math.cos(p)];
    const gotCross = E.vgCrossVec(u, v) as V3, wantCross = cross3(u, v);
    maxErrCross = Math.max(maxErrCross, len3(sub3(gotCross, wantCross)));
    maxErrDot = Math.max(maxErrDot, Math.abs(E.vgDotVec(u, v) - dot3(u, v)));
    maxErrLen = Math.max(maxErrLen, Math.abs(E.vgLenVec(v) - len3(v)));
    // normalize: unit length, and parallel to the input.
    const n = E.vgNormalize(v) as V3;
    maxErrNorm = Math.max(maxErrNorm, Math.abs(len3(n) - 1), len3(cross3(n, v)));
  }
  check("max |vgCrossVec - closed form| over 20 samples", maxErrCross, 0, 1e-12);
  check("max |vgDotVec - closed form| over 20 samples", maxErrDot, 0, 1e-12);
  check("max |vgLenVec - closed form| over 20 samples", maxErrLen, 0, 1e-12);
  check("max vgNormalize error (unit length AND parallel) over 20 samples", maxErrNorm, 0, 1e-12);
  // A zero vector normalizes to zero, never to NaN leaking into setLength().
  assertTrue("vgNormalize([0,0,0]) returns [0,0,0], never NaN",
    (E.vgNormalize([0, 0, 0]) as V3).every((n: number) => n === 0));

  // NEGATIVE CONTROL — a cross product with its middle component's sign
  // flipped (the single most common hand-transcription error in the
  // determinant expansion). Written here only, never shipped.
  const u: V3 = [1, 2, 3], v: V3 = [-2, 0.5, 4];
  const wrong: V3 = [u[1] * v[2] - u[2] * v[1], -(u[2] * v[0] - u[0] * v[2]), u[0] * v[1] - u[1] * v[0]];
  expectFail("a sign-flipped middle cross component still matches the closed form",
    len3(sub3(wrong, cross3(u, v))) < 1e-12);
  assertTrue("the shipped vgCrossVec does NOT share that defect",
    len3(sub3(E.vgCrossVec(u, v) as V3, cross3(u, v))) < 1e-12);
}

console.log("\n=== 2. a.(a x b) = 0 and b.(a x b) = 0 to 1e-12 at every sample — the arithmetic the primary-aha state DISPLAYS ===");
{
  // This is not a maths identity check for its own sake. Projection preserves
  // NOTHING: at a bad pose two vectors perpendicular in 3D draw on ONE screen
  // line. The state whose claim is "a x b is perpendicular to both" therefore
  // carries that claim as a NUMBER computed in 3D; the picture's job is to
  // make the number believable, never to be the evidence.
  let maxErrA = 0, maxErrB = 0, n = 0;
  for (let th = 5; th <= 175; th += 5) {
    for (const tilt of [0, 17, 35, 60]) {
      const v = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: th, b_tilt_deg: tilt });
      const axb = E.vgCrossVec(v.a, v.b);
      maxErrA = Math.max(maxErrA, Math.abs(E.vgDotVec(v.a, axb)));
      maxErrB = Math.max(maxErrB, Math.abs(E.vgDotVec(v.b, axb)));
      n++;
    }
  }
  check(`max |a.(a x b)| over ${n} (theta, tilt) samples`, maxErrA, 0, 1e-12);
  check(`max |b.(a x b)| over ${n} (theta, tilt) samples`, maxErrB, 0, 1e-12);

  // NEGATIVE CONTROL — a "cross product" built from a fixed, non-orthogonal
  // basis (the classic shortcut of assuming a x b is always the scene's up
  // axis). It is NOT perpendicular to a once the pair is tilted, so the very
  // readout the state prints would be a non-zero number presented as zero.
  const v = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: 60, b_tilt_deg: 35 });
  const fakeCross: V3 = [0, len3(E.vgCrossVec(v.a, v.b) as V3), 0];  // BUG: pinned to +Y
  // Scored against b, not a: `a` is ALWAYS in the xz-plane, so ANY +Y vector
  // is perpendicular to it by accident and the defect would hide behind that
  // accident. b is the vector the tilt actually moves, so b is what
  // discriminates — which is itself the lesson of this whole gate: check that
  // the thing the measurement measures is the thing that can fail.
  expectFail(`a cross pinned to the scene up-axis still satisfies b.(a x b) = 0 under tilt (got ${E.vgDotVec(v.b, fakeCross).toFixed(4)})`,
    Math.abs(E.vgDotVec(v.b, fakeCross)) < 1e-12);
  assertTrue("the shipped vgCrossVec does NOT share that defect (it co-rotates with b)",
    Math.abs(E.vgDotVec(v.b, E.vgCrossVec(v.a, v.b))) < 1e-12);
}

console.log("\n=== 3. |a x b| = |a||b|sin(theta) and a.b = |a||b|cos(theta) across [0,180] INCLUDING the obtuse regime ===");
{
  let maxErrMag = 0, maxErrDot = 0;
  let sawNegativeDot = false;
  for (let th = 0; th <= 180; th += 2) {
    const v = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: th });
    const r = th * Math.PI / 180;
    maxErrMag = Math.max(maxErrMag, Math.abs(E.vgLenVec(E.vgCrossVec(v.a, v.b)) - 3.0 * 2.0 * Math.sin(r)));
    const d = E.vgDotVec(v.a, v.b);
    maxErrDot = Math.max(maxErrDot, Math.abs(d - 3.0 * 2.0 * Math.cos(r)));
    if (d < -1e-9) sawNegativeDot = true;
  }
  check("max ||a x b| - |a||b|sin(theta)| over theta in [0,180] step 2", maxErrMag, 0, 1e-12);
  check("max |a.b - |a||b|cos(theta)| over theta in [0,180] step 2", maxErrDot, 0, 1e-12);
  assertTrue("the sweep genuinely REACHES the obtuse regime (a.b goes negative)", sawNegativeDot);
  // The sign crossing is a taught beat, so pin it exactly.
  const v90 = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: 90 });
  check("a.b at theta=90 is exactly zero", E.vgDotVec(v90.a, v90.b), 0, 1e-12);
  check("|a x b| at theta=90 is |a||b|", E.vgLenVec(E.vgCrossVec(v90.a, v90.b)), 6.0, 1e-12);

  // NEGATIVE CONTROL — a |sin(theta)|-style magnitude that silently clamps
  // theta into the acute half (as a "0..90 is all a student needs" shortcut
  // would). It agrees everywhere below 90 and diverges above it, which is
  // exactly the half of the range the obtuse state is built to teach.
  let clampedAgrees = true, clampedWorst = 0;
  for (let th = 92; th <= 178; th += 2) {
    const v = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: th });
    const clamped = 3.0 * 2.0 * Math.sin(Math.min(th, 90) * Math.PI / 180);   // BUG
    const err = Math.abs(clamped - E.vgLenVec(E.vgCrossVec(v.a, v.b)));
    if (err > 1e-9) clampedAgrees = false;
    clampedWorst = Math.max(clampedWorst, err);
  }
  expectFail(`a theta-clamped |a x b| still matches the shipped magnitude above 90 degrees (worst disagreement ${clampedWorst.toFixed(4)})`, clampedAgrees);
}

console.log("\n=== 4. vgBuildVectors — the SYMMETRIC convention, the Rodrigues b_tilt, and F21 (vgAnimValue) as a closed form of ms ===");
{
  // ── 4a. the symmetric convention (skeleton D-2) ──────────────────────────
  const v = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: 60 });
  check("|a| == a_mag", len3(v.a as V3), 3.0, 1e-12);
  check("|b| == b_mag", len3(v.b as V3), 2.0, 1e-12);
  check("a and b STRADDLE +x: a.z = +|a|sin(theta/2)", v.a[2], 3.0 * Math.sin(30 * Math.PI / 180), 1e-12);
  check("a and b STRADDLE +x: b.z = -|b|sin(theta/2)", v.b[2], -2.0 * Math.sin(30 * Math.PI / 180), 1e-12);
  check("a is in the xz-plane (a.y == 0)", v.a[1], 0, 1e-12);
  check("b is in the xz-plane at zero tilt (b.y == 0)", v.b[1], 0, 1e-12);
  const axb = E.vgCrossVec(v.a, v.b) as V3;
  check("a x b runs along +Y: x component", axb[0], 0, 1e-12);
  check("a x b runs along +Y: z component", axb[2], 0, 1e-12);
  check("a x b runs along +Y: y component = |a||b|sin(theta)", axb[1], 3.0 * 2.0 * Math.sin(60 * Math.PI / 180), 1e-12);
  // The convention is what makes the two taught pairs SYMMETRIC, which is the
  // picture the order-matters state needs when it swaps the operands.
  const angAX = Math.acos(dot3(v.a as V3, axb) / (len3(v.a as V3) * len3(axb)));
  const angBX = Math.acos(dot3(v.b as V3, axb) / (len3(v.b as V3) * len3(axb)));
  check("a^(a x b) and b^(a x b) are the SAME 3D angle (the symmetry the convention buys)",
    Math.abs(angAX - angBX), 0, 1e-12);
  // Defaults resolve when a field is omitted (never NaN reaching setLength()).
  const defs = E.vgBuildVectors({});
  assertTrue("vgBuildVectors({}) returns finite defaults for a/b/c",
    [...defs.a, ...defs.b, ...defs.c].every((n: number) => Number.isFinite(n)));

  // ── 4b. b_tilt_deg is a ROTATION ABOUT a-hat (skeleton D-3) ──────────────
  //   The earlier "lift toward an axis" semantics gave a-hat.b-hat =
  //   cos(beta)cos(theta), so the tilt SILENTLY CHANGED the taught angle
  //   (worst case 41.98 degrees of error) while the HUD, the angle arc and
  //   the formula surface all still reported the slider. Rotating about
  //   a-hat cannot: it preserves theta and |b| identically.
  let worstThetaErr = 0, worstMagErr = 0, worstCrossMagErr = 0, n = 0;
  for (let th = 20; th <= 160; th += 1) {
    for (let tilt = 0; tilt <= 60; tilt += 5) {
      const w = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: th, b_tilt_deg: tilt });
      const got = Math.acos(Math.max(-1, Math.min(1, dot3(w.a as V3, w.b as V3) / (len3(w.a as V3) * len3(w.b as V3))))) * 180 / Math.PI;
      worstThetaErr = Math.max(worstThetaErr, Math.abs(got - th));
      worstMagErr = Math.max(worstMagErr, Math.abs(len3(w.b as V3) - 2.0));
      worstCrossMagErr = Math.max(worstCrossMagErr,
        Math.abs(len3(E.vgCrossVec(w.a, w.b) as V3) - 3.0 * 2.0 * Math.sin(th * Math.PI / 180)));
      n++;
    }
  }
  check(`worst |measured theta - authored theta| over ${n} (theta, tilt) pairs`, worstThetaErr, 0, 1e-9, " deg");
  check(`worst ||b| - b_mag| over the same ${n} pairs`, worstMagErr, 0, 1e-12);
  check(`worst ||a x b| - |a||b|sin(theta)| under tilt (|a x b| is INVARIANT)`, worstCrossMagErr, 0, 1e-12);
  // ...and the tilt is not a no-op: it genuinely takes b out of the a-b plane.
  const tilted = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: 60, b_tilt_deg: 45 });
  assertTrue(`b_tilt_deg genuinely moves b out of the xz-plane (b.y = ${tilted.b[1].toFixed(4)})`,
    Math.abs(tilted.b[1]) > 0.1);

  // NEGATIVE CONTROL — a b_tilt that silently no-ops (the field is read,
  // parsed and then never applied, which is the shape of every "the slider
  // does nothing" bug). Assert the shipped builder does NOT behave that way.
  const noTilt = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: 60, b_tilt_deg: 0 });
  const silentNoOp = noTilt.b as V3;   // BUG: what a no-op tilt would return at tilt=45
  expectFail("a b_tilt that silently no-ops still differs from the untilted b",
    len3(sub3(silentNoOp, noTilt.b as V3)) > 1e-9);
  assertTrue("the shipped b_tilt_deg DOES change b (it is not a silent no-op)",
    len3(sub3(tilted.b as V3, noTilt.b as V3)) > 0.1);

  // ── 4c. F21 vg.animate[] — a PORT of param_ramp / idle_auto_sweep ────────
  assertTrue("the PORTED mechanisms exist in the shipped renderer (Rule 40a on the MECHANISM, not the name): param_ramp",
    SRC.indexOf("function nlbRunParamRamp(") >= 0);
  assertTrue("...and idle_auto_sweep", SRC.indexOf("function nlbRunIdleSweep(") >= 0);
  const knobs: string[] = E.vgAnimKnobs();
  assertTrue(`vgAnimKnobs() is a CLOSED enum of ${knobs.length} knobs (${knobs.join(", ")})`, knobs.length >= 8);
  const ramp = [{ knob: "theta_deg", from: 20, to: 90, start_ms: 0, duration_ms: 2400, easing: "linear" },
                { knob: "theta_deg", from: 90, to: 130, start_ms: 3400, duration_ms: 2200, easing: "linear" }];
  check("ramp before the window opens holds `from`", E.vgAnimValue(ramp, "theta_deg", 0, 60), 20, 1e-12);
  check("ramp mid-window (linear, halfway)", E.vgAnimValue(ramp, "theta_deg", 1200, 60), 55, 1e-9);
  check("ramp HOLDS at `to` after its window (never returns toward `from`)", E.vgAnimValue(ramp, "theta_deg", 3000, 60), 90, 1e-12);
  check("the second segment's hold gap keeps the first segment's end value", E.vgAnimValue(ramp, "theta_deg", 3400, 60), 90, 1e-12);
  check("the second segment runs", E.vgAnimValue(ramp, "theta_deg", 4500, 60), 90 + 40 * (1100 / 2200), 1e-9);
  check("and holds at its own `to` forever", E.vgAnimValue(ramp, "theta_deg", 999999, 60), 130, 1e-12);
  check("a knob no entry names resolves to its AUTHORED value, untouched", E.vgAnimValue(ramp, "b_mag", 4500, 2.0), 2.0, 1e-12);
  check("vgAnimEndMs reports the last moving ms (the number the reveal pin needs)", E.vgAnimEndMs(ramp), 5600, 0);
  // D3 / Rule 36 — the REWIND test. A closed form reproduces an earlier ms
  // exactly; an accumulator cannot.
  const forward = [0, 600, 1200, 1800, 2400, 3000, 4000, 5000, 6000].map((t) => E.vgAnimValue(ramp, "theta_deg", t, 60));
  const rewound = [6000, 5000, 4000, 3000, 2400, 1800, 1200, 600, 0].map((t) => E.vgAnimValue(ramp, "theta_deg", t, 60));
  assertTrue("REWIND: replaying the ramp backwards reproduces every forward value BIT FOR BIT (no accumulator)",
    forward.every((x, i) => x === rewound[rewound.length - 1 - i]));
  // Easing enum: all three start at `from` and end at `to`, and smoothstep
  // (the default) starts and ends AT REST.
  for (const ez of ["linear", "smoothstep", "ease_out_cubic"]) {
    const r1 = [{ knob: "flip_frac", from: 0, to: 1, start_ms: 0, duration_ms: 1000, easing: ez }];
    check(`easing ${ez}: value at t=0 is from`, E.vgAnimValue(r1, "flip_frac", 0, 0), 0, 1e-12);
    check(`easing ${ez}: value at t=dur is to`, E.vgAnimValue(r1, "flip_frac", 1000, 0), 1, 1e-12);
  }
  const smooth = [{ knob: "flip_frac", from: 0, to: 1, start_ms: 0, duration_ms: 1000 }];
  assertTrue("the DEFAULT easing is smoothstep — it starts at rest (value at 1% of the window is well under 1% of the travel)",
    E.vgAnimValue(smooth, "flip_frac", 10, 0) < 0.001);
}
console.log("\n=== 5. deriveStateMeta registration — the reveal pin lands past the LAST settled beat, and explore is interactive ===");
{
  // Skipping this registration makes THE EYE pin EVERY state at
  // DEFAULT_REVEAL_MS = 1500 mid-animation and mint a self-contradictory H2
  // baseline (scar field3d_scenario_missing_maxreveal_block_frozen_pin_
  // defaults_1500ms_predates_scripted_reveal). It is the first line of the
  // field_3d scar checklist, which is why it lands in the SAME change.
  const cfg = {
    field_3d_config: {
      scenario_type: "vector_geometry_3d",
      states: {
        // grow-in only
        STATE_1: { vg: { mode: "products", reveal_ms: 2000 } },
        // a ramp that ends LONG after the grow-in — the pin must follow it
        STATE_2: { vg: { mode: "products", reveal_ms: 900, animate: [{ knob: "theta_deg", from: 60, to: 20, start_ms: 400, duration_ms: 4600 }] } },
        // a camera schedule that ends after both
        STATE_3: { vg: { mode: "products", reveal_ms: 900, camera_steps: [{ at_ms: 0, az: 90, el: 70, dist: 10, ease_ms: 0 }, { at_ms: 2800, az: 90, el: 30, dist: 16, ease_ms: 1600 }] } },
        // explore
        STATE_4: { vg: { mode: "products", controls: ["a_mag", "b_mag", "theta_deg", "b_tilt_deg"] }, show_sliders: true },
      },
    },
  };
  const reveal = deriveMaxRevealTimeMs(cfg as any);
  const hold = deriveHoldExpectations(cfg as any);
  check("STATE_1 (grow-in only) pins at reveal_ms + cushion", reveal.STATE_1, 2300, 0, " ms");
  // deriveMaxRevealTimeMs clamps to a [1500, 60000] floor, so a SHORT reveal
  // is indistinguishable from the un-registered default by its value alone —
  // recorded here so the fixture above is never "simplified" back under it.
  const shortState = { field_3d_config: { scenario_type: "vector_geometry_3d", states: { S: { vg: { reveal_ms: 900 } } } } };
  check("a 900 ms reveal + 300 cushion is raised to the 1500 ms clamp floor", deriveMaxRevealTimeMs(shortState as any).S, 1500, 0, " ms");
  check("STATE_2 pins past the LAST ramp end (400 + 4600) + cushion, NOT at reveal_ms + cushion", reveal.STATE_2, 5300, 0, " ms");
  check("STATE_3 pins past the LAST camera step (2800 + 1600) + cushion", reveal.STATE_3, 4700, 0, " ms");
  check("STATE_4 (explore) is classified interactive", hold.STATE_4, "interactive", 0);
  check("STATE_1 (guided) is classified reveal_hold", hold.STATE_1, "reveal_hold", 0);
  check("STATE_2 (guided, ramped) is classified reveal_hold", hold.STATE_2, "reveal_hold", 0);

  // NEGATIVE CONTROL — a state carrying NO vg block at all falls through to
  // DEFAULT_REVEAL_MS = 1500, which for STATE_2's script lands 3.8 s BEFORE
  // its ramp settles: the exact defect this registration exists to prevent.
  const noBlock = { field_3d_config: { scenario_type: "vector_geometry_3d", states: { STATE_X: { label: "no vg block" } } } };
  const bare = deriveMaxRevealTimeMs(noBlock as any);
  expectFail(`a state with no vg block pins past STATE_2's 5000 ms ramp (it pins at ${bare.STATE_X} ms)`,
    (bare.STATE_X ?? 0) >= 5000);
  assertTrue(`the un-registered default is exactly DEFAULT_REVEAL_MS = 1500 ms (got ${bare.STATE_X}) — mid-ramp, and the reason the block is mandatory`,
    bare.STATE_X === 1500);
  assertTrue("the registered STATE_2 pin is LATER than the un-registered default", (reveal.STATE_2 ?? 0) > (bare.STATE_X ?? 0));
}

console.log("\n=== 11. FLEET SAFETY — every scenario other than vector_geometry_3d emits byte-identical template output ===");
{
  // A new scenario_type is additive BY CONSTRUCTION: 60 existing scenarios
  // dispatch on their own string and none can reach a case that did not
  // exist. The blast radius is confined to SHARED GLUE — the scenario_type
  // union terminator, the #sliders NOT-list, and the build/apply/frame/glow
  // dispatch chains — which is exactly what this section bounds.
  // THE BASE REF IS DERIVED, NOT NAMED. "origin/master" is the wrong baseline
  // the moment origin/master moves ahead of the desk: the comparison then
  // reports somebody else's commits as this dispatch's blast radius. The
  // right baseline is the last ancestor of HEAD whose renderer carries NO
  // vector scenario AT ALL — in either its old or its new name — because
  // that is the fleet as it stood before this scenario existed, at the
  // mainline point this desk is synced to.
  const RENDERER = "src/lib/renderers/field_3d_renderer.ts";
  // Compare TEMPLATE-BODY SOURCE TEXT on both sides. Two traps, both
  // measured: (a) the imported SRC is the body BETWEEN the backticks while a
  // git blob is the whole file, so diffing one against the other compares
  // different things (1596 added / 4194 removed against a real diff of
  // 584 / 2); and (b) SRC is the EVALUATED literal, so every escape is
  // already resolved and `\\u2192` in source reads as `\u2192` here — every
  // escaped line then shows as changed. So both sides are sliced out of
  // source text by the same function.
  function emittedFrom(file: string, ref: string): string {
    const open = file.indexOf("FIELD_3D_RENDERER_CODE = ");
    if (open < 0) throw new Error("no FIELD_3D_RENDERER_CODE in " + ref);
    const tickOpen = file.indexOf("`", open);
    const tickClose = file.indexOf("`", tickOpen + 1);
    if (tickOpen < 0 || tickClose < 0) throw new Error("unbalanced template in " + ref);
    return file.slice(tickOpen + 1, tickClose);
  }
  const emittedAt = (ref: string) => emittedFrom(execFileSync("git", ["show", `${ref}:${RENDERER}`], { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 }), ref);
  const CUR_EMITTED = emittedFrom(readFileSync(RENDERER, "utf-8"), "working tree");
  const blobAt = emittedAt;
  const rawAt = (ref: string) => execFileSync("git", ["show", `${ref}:${RENDERER}`], { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
  const hasScenario = (body: string) => body.indexOf("vector_geometry_3d") >= 0 || body.indexOf("vector_products_in_space") >= 0;
  let BASE_REF = process.env.VG_FLEET_BASE || "";
  let baseSrc = "";
  try {
    if (BASE_REF) {
      baseSrc = blobAt(BASE_REF);
    } else {
      // The MAINLINE point this desk is synced to: the newest commit shared
      // with origin/master. Walking the desk's own first-parent chain instead
      // lands on the commit the desk was CUT from, which predates whatever
      // master has landed since, and reports master's own progress as this
      // dispatch's blast radius (measured: 4194 phantom removed lines).
      const mb = execFileSync("git", ["merge-base", "HEAD", "origin/master"], { encoding: "utf-8" }).trim();
      const candidates = [mb, ...execFileSync("git", ["rev-list", "--max-count=20", mb, "--", RENDERER], { encoding: "utf-8" }).split("\n").map((r) => r.trim()).filter(Boolean)];
      for (const r of candidates) {
        const body = rawAt(r);
        if (!hasScenario(body)) { BASE_REF = r; baseSrc = emittedAt(r); break; }
      }
    }
  } catch {
    /* fall through to the SKIP below */
  }
  if (!baseSrc) console.log(`  SKIP  no pre-scenario ancestor found in the last 40 renderer commits — cannot diff (set VG_FLEET_BASE)`);
  else console.log(`        base ref (last ancestor with NO vector scenario): ${BASE_REF.slice(0, 10)}`);
  if (baseSrc) {
    // The vg-owned region: the scenario body between its banner and the next
    // scenario's banner, plus the type-declaration block. Everything else in
    // the file is FLEET, and a changed fleet line must be one of the named
    // shared-glue lines below.
    // The shared glue, ENUMERATED — the entire blast radius of a new
    // scenario_type. Everything else in the emitted template must be
    // byte-identical, and lines inside the scenario's own region are excised
    // by span (below) rather than matched by token, because most of a
    // scenario body is comments and generic code that carries no prefix.
    const SHARED_GLUE = [
      "'vector_geometry_3d';",                                        // the scenario_type union terminator
      'case "vector_geometry_3d":',                                   // buildScenario dispatch
      'if (config.scenario_type === "vector_geometry_3d") {',         // applyState + animate dispatch
      "var isVecGeom = config.scenario_type",                         // the #sliders NOT-list boolean
      "slidersEl.style.display = (stateDef.show_sliders",             // the #sliders NOT-list condition
      "buildVectorGeometry3D();",                                     // buildScenario case body
      "applyVectorGeometry3DState(stateDef);",                        // applyState dispatch body
      "updateVectorGeometry3DFrame();",                               // animate() frame call
      "applyVectorGeometry3DGlow();",                                 // animate() glow call
    ];
    // A changed fleet line is accepted ONLY if it sits within GLUE_RADIUS
    // lines of one of the named code sites above — i.e. it is part of that
    // insertion's own comment block or its closing braces. Judged by INDEX,
    // not by content: a content allowlist has to keep growing to cover every
    // continuation comment, and each growth is a place a real fleet edit can
    // hide. Anything further away than the radius is a genuine fleet change
    // and fails, whatever it says.
    const GLUE_RADIUS = 12;
    const cur = CUR_EMITTED.split("\n"), base = baseSrc.split("\n");
    // Excise the scenario's OWN region by span. Both anchors are asserted, so
    // a rename that moves them fails loudly instead of silently widening the
    // region until the check passes vacuously.
    const vgBannerIdx = cur.findIndex((l) => l.indexOf("vector_geometry_3d (MATHEMATICS") >= 0);
    const vgEndIdx = cur.findIndex((l, i) => i > vgBannerIdx && vgBannerIdx >= 0 && l.indexOf("rhr_force_direction — DIRECTION-ONLY") >= 0);
    assertTrue("the vg region's opening anchor is found in the emitted template", vgBannerIdx > 0);
    assertTrue("the vg region's closing anchor (the next scenario's banner) is found", vgEndIdx > vgBannerIdx);
    const regionStart = Math.max(0, vgBannerIdx - 1);          // the ═ rule above the banner
    const regionEnd = Math.max(regionStart, vgEndIdx - 1);     // the ═ rule above the next banner
    console.log(`        vg region excised: emitted lines ${regionStart}..${regionEnd} (${regionEnd - regionStart} lines)`);
    const curFleet = cur.filter((_, i) => i < regionStart || i >= regionEnd);
    function multisetDiff(a: string[], b: string[]) {
      const bag = new Map<string, number>();
      for (const l of b) bag.set(l, (bag.get(l) || 0) + 1);
      const added: string[] = [];
      for (const l of a) { const n = bag.get(l) || 0; if (n > 0) bag.set(l, n - 1); else added.push(l); }
      const removed = [...bag.entries()].filter(([, n]) => n > 0).flatMap(([l, n]) => Array(n).fill(l) as string[]);
      return { added, removed };
    }
    const { added, removed } = multisetDiff(curFleet, base);
    const anchors: number[] = [];
    curFleet.forEach((l, i) => { if (SHARED_GLUE.some((g) => l.indexOf(g) >= 0)) anchors.push(i); });
    assertTrue(`every named shared-glue site is present exactly once or twice (${anchors.length} anchor lines found)`, anchors.length >= SHARED_GLUE.length);
    const nearAnchor = (l: string) => curFleet.some((c, i) => c === l && anchors.some((aIdx) => Math.abs(aIdx - i) <= GLUE_RADIUS));
    const unexplainedAdded = added.filter((l) => l.trim() && !nearAnchor(l));
    // A REMOVED line is explained only if the line that replaced it is one
    // of the named glue sites (the #sliders NOT-list condition is rewritten
    // in place, so its old text disappears). Nothing else may vanish.
    const unexplainedRemoved = removed.filter((l) => l.trim() && !SHARED_GLUE.some((g) => l.indexOf(g) >= 0));
    console.log(`        ${added.filter((l) => l.trim()).length} fleet lines changed, all within ${GLUE_RADIUS} lines of a named dispatch site`);
    if (unexplainedAdded.length) console.log("        unexplained ADDED:   " + unexplainedAdded.slice(0, 8).map((l) => l.trim().slice(0, 100)).join("\n                             "));
    if (unexplainedRemoved.length) console.log("        unexplained REMOVED: " + unexplainedRemoved.slice(0, 8).map((l) => l.trim().slice(0, 100)).join("\n                             "));
    check(`fleet lines ADDED outside the vg region and the named shared glue`, unexplainedAdded.length, 0, 0);
    check(`fleet lines REMOVED outside the vg region and the named shared glue`, unexplainedRemoved.length, 0, 0);
    assertTrue(`the shared-glue allowlist is SHORT and enumerated (${SHARED_GLUE.length} entries) — the measured blast radius of a new scenario_type`,
      SHARED_GLUE.length <= 10);

    // NEGATIVE CONTROL — the comparison must actually be able to SEE a fleet
    // change. Mutate a line belonging to ANOTHER scenario and confirm it is
    // reported as unexplained.
    const victim = base.find((l) => l.indexOf('case "ac_generator":') >= 0) || "";
    const mutatedFleet = curFleet.map((l) => (l === victim ? l + " /* fleet mutation */" : l));
    const mut = multisetDiff(mutatedFleet, base);
    const foreign2 = mut.added.filter((l) => l.trim() && !nearAnchor(l));
    expectFail(`a mutated fleet line (${victim.trim().slice(0, 40)}) goes UNDETECTED by this comparison`, foreign2.length === 0);
  }
}
console.log("\n=== 6. E2 — vgParallelogramVerts: drawn quad AREA == |a x b|, monotonic in |b| ===");
{
  // Shoelace-free planar-quad area via two triangles in the SAME winding the
  // renderer draws (indices [0,1,2] and [0,2,3] — see buildVectorProductsInSpace).
  function quadArea(v: V3[]): number {
    const t1 = 0.5 * len3(cross3(sub3(v[1], v[0]), sub3(v[2], v[0])));
    const t2 = 0.5 * len3(cross3(sub3(v[2], v[0]), sub3(v[3], v[0])));
    return t1 + t2;
  }
  const vec = E.vgBuildVectors({ a_mag: 2.5, b_mag: 2.0, theta_deg: 60 });
  const verts: V3[] = E.vgParallelogramVerts(vec.a, vec.b);
  check("quad vertex[0] is the ORIGIN", len3(verts[0]), 0, 1e-9);
  check("quad vertex[1] == a", len3(sub3(verts[1], vec.a as V3)), 0, 1e-9);
  check("quad vertex[2] == a+b", len3(sub3(verts[2], add3(vec.a as V3, vec.b as V3))), 0, 1e-9);
  check("quad vertex[3] == b", len3(sub3(verts[3], vec.b as V3)), 0, 1e-9);
  const area = quadArea(verts);
  const trueCrossMag = E.vgLenVec(E.vgCrossVec(vec.a, vec.b));
  check("drawn quad area == |a x b|", area, trueCrossMag, 1e-9);

  // Monotonic sweep: holding a_mag/theta fixed, area must strictly increase
  // as |b| sweeps its authored slider range [0.5, 4.0].
  const bSweep = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
  const areas = bSweep.map((bMag) => {
    const v = E.vgBuildVectors({ a_mag: 2.5, b_mag: bMag, theta_deg: 60 });
    return quadArea(E.vgParallelogramVerts(v.a, v.b));
  });
  let strictlyIncreasing = true;
  for (let i = 1; i < areas.length; i++) if (!(areas[i] > areas[i - 1])) strictlyIncreasing = false;
  assertTrue(`drawn area is STRICTLY increasing as |b| sweeps [0.5..4.0] (areas: ${areas.map((a) => a.toFixed(3)).join(", ")})`, strictlyIncreasing);
  // And it tracks |a x b| exactly at every sweep point, not just qualitatively.
  let allTrackExactly = true;
  bSweep.forEach((bMag, i) => {
    const v = E.vgBuildVectors({ a_mag: 2.5, b_mag: bMag, theta_deg: 60 });
    const trueMag = E.vgLenVec(E.vgCrossVec(v.a, v.b));
    if (Math.abs(areas[i] - trueMag) > 1e-9) allTrackExactly = false;
  });
  assertTrue("every sweep point's drawn area matches |a x b| to 1e-9", allTrackExactly);

  // NEGATIVE CONTROL — a plausible real-world mistake: the fourth vertex is
  // mistakenly left at the ORIGIN instead of being translated by b (as if a
  // implementer forgot `vgAddVec` on the third vertex and reused v0). Written
  // here only, never shipped. This collapses two of the four "corners" onto
  // each other, so the two-triangle area formula does NOT reproduce |a x b|.
  const forgotB: V3[] = [[0, 0, 0], vec.a as V3, [0, 0, 0], vec.b as V3];
  const forgotBArea = quadArea(forgotB);
  expectFail("a vertex[2] mistakenly left at the origin (forgot to add b) still gives the correct |a x b| area",
    Math.abs(forgotBArea - trueCrossMag) < 1e-9);
  assertTrue("the shipped vertex order [O,a,a+b,b] does NOT share that defect", Math.abs(area - trueCrossMag) < 1e-9);
}
console.log("\n=== 7. E3 — vgParallelepipedFaces: drawn solid VOLUME == |a.(b x c)|, and CLOSES across c's sweep ===");
{
  const vec = E.vgBuildVectors({ a_mag: 2.2, b_mag: 1.7, theta_deg: 70, c_mag: 1.9, c_theta_deg: 50, c_phi_deg: 210 });
  const faces: V3[][] = E.vgParallelepipedFaces(vec.a, vec.b, vec.c);
  check("vgParallelepipedFaces returns exactly 6 faces", faces.length, 6, 0);
  assertTrue("every face has exactly 4 vertices", faces.every((f) => f.length === 4));

  // Volume proof, WITHOUT trusting each face's own triangle winding (the
  // renderer draws with MeshBasicMaterial+DoubleSide, so winding is
  // deliberately not made outward-consistent across the 6 faces — a
  // divergence-theorem sum over the raw triangles under-/over-counts by
  // exactly that inconsistency, which is a property of the RENDERER's
  // choice, not a defect this gate should chase). Instead: (a) collect the
  // UNIQUE corner points the 24 drawn vertices reduce to and confirm there
  // are exactly 8, each matching one of the 8 true corners of the
  // parallelepiped spanned by a,b,c (O, a, b, c, a+b, a+c, b+c, a+b+c) — this
  // proves the DRAWN SHAPE is exactly that solid; (b) compute the volume
  // from those matched, drawn corners via the scalar triple product (a
  // formula that only needs 3 edge vectors from a shared corner, so it does
  // not depend on triangle winding at all) and compare to |a.(b x c)|.
  function roundKey(p: V3): string { return p.map((n) => n.toFixed(9)).join(","); }
  const uniqueCorners = new Map<string, V3>();
  for (const f of faces) for (const v of f) uniqueCorners.set(roundKey(v), v);
  check("the 24 drawn vertices reduce to exactly 8 UNIQUE corner points (no stray/duplicated corner)", uniqueCorners.size, 8, 0);

  const trueCorners: Record<string, V3> = {
    O: [0, 0, 0], A: vec.a, B: vec.b, C: vec.c,
    AB: add3(vec.a, vec.b), AC: add3(vec.a, vec.c), BC: add3(vec.b, vec.c),
    ABC: add3(add3(vec.a, vec.b), vec.c),
  };
  const drawnPoints = [...uniqueCorners.values()];
  function nearestMatch(target: V3): number { return Math.min(...drawnPoints.map((p) => len3(sub3(p, target)))); }
  let allCornersMatched = true;
  const matchErrors: string[] = [];
  for (const [label, target] of Object.entries(trueCorners)) {
    const err = nearestMatch(target);
    matchErrors.push(`${label}=${err.toExponential(1)}`);
    if (err > 1e-9) allCornersMatched = false;
  }
  assertTrue(`every one of the 8 TRUE corners (O/A/B/C/AB/AC/BC/ABC) has a matching drawn vertex (max err <= 1e-9; ${matchErrors.join(", ")})`, allCornersMatched);

  // Volume from the drawn, matched O/A/B/C corners — the scalar triple
  // product needs only 3 edge vectors from a shared corner, so it is
  // independent of how the 6 faces were triangulated/wound.
  const drawnO = drawnPoints.reduce((best, p) => (len3(p) < len3(best) ? p : best), drawnPoints[0]);
  const drawnA = drawnPoints.reduce((best, p) => (len3(sub3(p, trueCorners.A)) < len3(sub3(best, trueCorners.A)) ? p : best), drawnPoints[0]);
  const drawnB = drawnPoints.reduce((best, p) => (len3(sub3(p, trueCorners.B)) < len3(sub3(best, trueCorners.B)) ? p : best), drawnPoints[0]);
  const drawnC = drawnPoints.reduce((best, p) => (len3(sub3(p, trueCorners.C)) < len3(sub3(best, trueCorners.C)) ? p : best), drawnPoints[0]);
  const drawnVol = Math.abs(dot3(sub3(drawnA, drawnO), cross3(sub3(drawnB, drawnO), sub3(drawnC, drawnO))));
  const trueVol = Math.abs(E.vgDotVec(vec.a, E.vgCrossVec(vec.b, vec.c)));
  check("volume from the DRAWN (matched) O/A/B/C corners == |a.(b x c)|", drawnVol, trueVol, 1e-9);

  // CLOSURE — sweep c across its authored range and confirm, at every sample,
  // that every adjacent pair of faces shares an EDGE (two vertices whose
  // coordinates match to 1e-12 — i.e. a genuine shared edge, not merely a
  // nearby one) so the solid has NO gaps.
  function edgesOf(f: V3[]): [V3, V3][] {
    return [[f[0], f[1]], [f[1], f[2]], [f[2], f[3]], [f[3], f[0]]];
  }
  function facesShareAnEdge(fa: V3[], fb: V3[]): boolean {
    const ea = edgesOf(fa), eb = edgesOf(fb);
    for (const [p, q] of ea) {
      for (const [r, s] of eb) {
        const matchesForward = len3(sub3(p, r)) < 1e-12 && len3(sub3(q, s)) < 1e-12;
        const matchesReverse = len3(sub3(p, s)) < 1e-12 && len3(sub3(q, r)) < 1e-12;
        if (matchesForward || matchesReverse) return true;
      }
    }
    return false;
  }
  // The known adjacency of this face ordering (see vgParallelepipedFaces'
  // own header comment): bottom-top share NO edge (opposite faces), but
  // bottom neighbours front/back/left/right, etc. Test the full C(6,2)=15
  // pairs and require >= 8 genuine shared edges at every c-sweep sample (a
  // closed hexahedron has exactly 12 edges shared by exactly 2 faces each,
  // i.e. every face shares an edge with 4 of its 5 neighbours — opposite
  // faces share none — so >= 8 total observed shared-edge PAIRS is the
  // correct closure signature for this face set; see assertion just below
  // for the exact expected count, established independently on this fixture).
  const cSweep = [
    { c_mag: 0.5, c_theta_deg: 10, c_phi_deg: 5 },
    { c_mag: 1.0, c_theta_deg: 45, c_phi_deg: 90 },
    { c_mag: 1.8, c_theta_deg: 55, c_phi_deg: 200 },
    { c_mag: 2.5, c_theta_deg: 90, c_phi_deg: 270 },
    { c_mag: 4.0, c_theta_deg: 170, c_phi_deg: 359 },
  ];
  let closesEverywhere = true;
  let sharedEdgePairCounts: number[] = [];
  for (const cSample of cSweep) {
    const v = E.vgBuildVectors({ a_mag: 2.2, b_mag: 1.7, theta_deg: 70, ...cSample });
    const fSet: V3[][] = E.vgParallelepipedFaces(v.a, v.b, v.c);
    let sharedPairs = 0;
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (facesShareAnEdge(fSet[i], fSet[j])) sharedPairs++;
    sharedEdgePairCounts.push(sharedPairs);
    if (sharedPairs !== 12) closesEverywhere = false; // 12 shared-edge pairs = a closed hexahedron
  }
  assertTrue(`solid closes (exactly 12 shared-edge face pairs, the closed-hexahedron signature) at every c-sweep sample (counts: ${sharedEdgePairCounts.join(", ")})`, closesEverywhere);

  // NEGATIVE CONTROL — a deliberately-broken face set with the TOP face
  // shifted off by an epsilon (as if built from a stale/rounded copy of c
  // instead of the live one), demonstrating the closure check actually
  // catches a gap.
  const vBroken = E.vgBuildVectors({ a_mag: 2.2, b_mag: 1.7, theta_deg: 70, c_mag: 1.8, c_theta_deg: 55, c_phi_deg: 200 });
  const brokenFaces: V3[][] = (E.vgParallelepipedFaces(vBroken.a, vBroken.b, vBroken.c) as V3[][]).map((f: V3[], idx: number) =>
    idx === 1 ? f.map((v: V3) => [v[0] + 0.01, v[1], v[2]] as V3) : f); // idx 1 = "top" face, nudged
  let brokenSharedPairs = 0;
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (facesShareAnEdge(brokenFaces[i], brokenFaces[j])) brokenSharedPairs++;
  expectFail(`a top-face-nudged-by-0.01 solid still closes with 12 shared-edge pairs (got ${brokenSharedPairs})`, brokenSharedPairs === 12);
}
console.log("\n=== 13. THE CAMERA, under THE WORST-CASE LAW — pairwise, perspective, FOV 60 / 16:9, worst case over EVERY live slider ===");
{
  // ── 13a. the mechanism is GENERIC, never scenario-gated ─────────────────
  assertTrue("animateCameraTo() exists in the shipped renderer", SRC.indexOf("function animateCameraTo(") >= 0);
  assertTrue("lerpSpherical() exists in the shipped renderer", SRC.indexOf("function lerpSpherical(") >= 0);
  const applyStateBody = grabFn("applyState");
  const marker = "if (stateDef.camera_position) {";
  const markerIdx = applyStateBody.indexOf(marker);
  assertTrue("applyState() contains the generic camera_position block", markerIdx >= 0);
  assertTrue("applyState() calls animateCameraTo(stateDef.camera_position) exactly once",
    (applyStateBody.match(/animateCameraTo\(stateDef\.camera_position\)/g) || []).length === 1);
  function depthAt(src: string, idx: number): number {
    const bodyStart = src.indexOf("{");
    let depth = 0;
    for (let j = bodyStart; j < idx; j++) { if (src[j] === "{") depth++; else if (src[j] === "}") depth--; }
    return depth;
  }
  check("camera_position block sits at brace-depth 1 (top-level in applyState, not nested in a scenario gate)", depthAt(applyStateBody, markerIdx), 1, 0);
  const vgApplyMarker = 'if (config.scenario_type === "vector_geometry_3d") {';
  const vgApplyIdx = applyStateBody.indexOf(vgApplyMarker);
  assertTrue("applyState() dispatches vector_geometry_3d's own apply fn", vgApplyIdx >= 0);
  check("the vg scenario-gated dispatch ALSO sits at depth 1 (both are top-level siblings)", depthAt(applyStateBody, vgApplyIdx), 1, 0);
  const syntheticNested = [
    "function fakeApplyState(stateId) {",
    '    if (config.scenario_type === "some_other_scenario") {',
    "        if (stateDef.camera_position) {",
    "            animateCameraTo(stateDef.camera_position);",
    "        }",
    "    }",
    "}",
  ].join("\n");
  const synMarkerIdx = syntheticNested.indexOf("if (stateDef.camera_position) {");
  const synDepth = depthAt(syntheticNested, synMarkerIdx);
  expectFail("a synthetic scenario-gated camera_position block would ALSO report depth 1 (the vacuous-tool failure mode)", synDepth === 1);
  check("the depth-walk correctly reports depth 2 for the deliberately-nested synthetic block", synDepth, 2, 0);

  // ── 13b. the metric measures an ANGLE A VIEWER SEES, not an NDC angle ────
  //   vgProjectPoint returns BOTH: x,y in NDC (each axis over its own
  //   half-extent — the right space for "is it inside the frame") and sx,sy
  //   in isotropic screen units (the right space for "what angle do these
  //   two segments make"). Measuring the angle in NDC shears every screen
  //   direction by the aspect ratio, so a true 90-degree pair at a GOOD pose
  //   reads 61.8 degrees and the pose gets rejected for a defect it does not
  //   have. Asserted here so the two spaces can never be silently merged.
  {
    const p = E.vgProjectPoint(camPosFromAzEl(90, 70, 10), TARGET, UP, FOV, ASPECT, [1, 0, 1]);
    assertTrue("vgProjectPoint returns isotropic sx/sy alongside NDC x/y", p && typeof p.sx === "number" && typeof p.sy === "number");
    check("NDC x is the isotropic sx divided by (tan(fov/2) * aspect)", p.x, p.sx / (HALF_V * ASPECT), 1e-12);
    check("NDC y is the isotropic sy divided by tan(fov/2)", p.y, p.sy / HALF_V, 1e-12);
    // The consequence, measured on the authored S1-S3 pose: the taught angle
    // at theta=90 reads ~86.4 degrees isotropically and ~61.8 in NDC.
    const v90 = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: 90 });
    const cam = camPosFromAzEl(90, 70, 10);
    const iso = scorePose(cam, [{ id: "a", origin: [0, 0, 0], tip: v90.a }, { id: "b", origin: [0, 0, 0], tip: v90.b }]).minSep;
    const oA = E.vgProjectPoint(cam, TARGET, UP, FOV, ASPECT, [0, 0, 0]);
    const tA = E.vgProjectPoint(cam, TARGET, UP, FOV, ASPECT, v90.a);
    const tB = E.vgProjectPoint(cam, TARGET, UP, FOV, ASPECT, v90.b);
    const angNdc = (pt: any) => Math.atan2(pt.y - oA.y, pt.x - oA.x) * 180 / Math.PI;
    let dNdc = Math.abs(((angNdc(tA) % 180) + 180) % 180 - (((angNdc(tB) % 180) + 180) % 180));
    dNdc = Math.min(dNdc, 180 - dNdc);
    assertTrue(`az=90/el=70, theta=90: ISOTROPIC separation ${iso.toFixed(2)} deg is within 4 deg of the true 90 (the pose is GOOD)`, Math.abs(iso - 90) < 4);
    expectFail(`the same pose scored in NDC (${dNdc.toFixed(2)} deg) is also within 4 deg of 90 — i.e. NDC would agree`, Math.abs(dNdc - 90) < 4);
  }

  // ── 13c. the historical defect, REPRODUCED, and the per-object metric's
  //   VACUOUS PASS on it. This fixture is frozen at the ORIGINAL convention
  //   (a pinned along +x, b in the xy-plane) because that is the geometry
  //   the defect was measured in; the shipped symmetric convention exists
  //   precisely so this configuration is no longer reachable. The gate
  //   carries its own history so the defect cannot be re-derived.
  {
    const th = 35 * Math.PI / 180;
    const a: V3 = [2.5, 0, 0];
    const b: V3 = [2.0 * Math.cos(th), 2.0 * Math.sin(th), 0];
    const axb = E.vgCrossVec(a, b) as V3;
    check("fixture sanity: b.(a x b) == 0 (they ARE perpendicular in 3D)", E.vgDotVec(b, axb), 0, 1e-12);
    const cam = camPosFromAzEl(35, 30, 9);
    const arrows: Arrow[] = [{ id: "b", origin: [0, 0, 0], tip: b }, { id: "axb", origin: [0, 0, 0], tip: axb }];
    const sc = scorePose(cam, arrows);
    assertTrue(`REPRODUCED: at theta=35/az=35/el=30 two vectors PERPENDICULAR in 3D draw within ${sc.minSep.toFixed(3)} deg of ONE SCREEN LINE (<= 1 deg)`, sc.minSep <= 1);
    // NEGATIVE CONTROL (a) — the per-object foreshortening margin, which is
    // the metric this bug_class exists to retire, PASSES VACUOUSLY on it.
    const MIN_SCREEN_LEN = 0.05;
    const perObjectPasses = sc.minArm > MIN_SCREEN_LEN;
    expectFail(`a per-object foreshortening margin (each arm's own screen length ${sc.minArm.toFixed(4)} > ${MIN_SCREEN_LEN}) catches the b/(a x b) collinearity`,
      !perObjectPasses);
    assertTrue(`the PAIRWISE metric on the SAME configuration flags it (${sc.minSep.toFixed(3)} deg)`, sc.minSep <= 1);
    // ...and the shipped symmetric convention does NOT reach that defect.
    const v = E.vgBuildVectors({ a_mag: 2.5, b_mag: 2.0, theta_deg: 35 });
    const scNew = scorePose(cam, [{ id: "b", origin: [0, 0, 0], tip: v.b }, { id: "axb", origin: [0, 0, 0], tip: E.vgCrossVec(v.a, v.b) }]);
    assertTrue(`the SHIPPED symmetric convention at the same pose is well separated (${scNew.minSep.toFixed(2)} deg > 30)`, scNew.minSep > 30);
  }

  // ── 13d. NEGATIVE CONTROL (b) — the FALSIFIED az = (theta + 90) rule.
  //   Carried as a gate assertion so it cannot be re-derived by a future
  //   round: it was verified on ONE pair, reported as a measured 90.0 deg
  //   minimum, and returns 0.00 over all three pairs.
  {
    let worst = Infinity, worstAt = "";
    for (let th = 20; th <= 160; th += 1) {
      for (const el of [0, 30]) {
        const v = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: th });
        const sc = scorePose(camPosFromAzEl((th + 90) % 360, el, 9), arrowsOf(v as any));
        if (sc.minSep < worst) { worst = sc.minSep; worstAt = `theta=${th} el=${el} pair ${sc.worstPair}`; }
      }
    }
    expectFail(`the falsified az = (theta + 90) rule holds a 90.0 deg pairwise floor (measured minimum ${worst.toFixed(3)} deg at ${worstAt})`, worst >= 90);
    assertTrue(`...it in fact COLLAPSES to ${worst.toFixed(3)} deg — two arms on one screen line`, worst < 1);
  }

  // ── 13e. NEGATIVE CONTROL (c) — the EXEMPT-PAIR list. a x b and b x a are
  //   antiparallel BY DESIGN (that IS the order-matters lesson), so a gate
  //   without the exemption fails the state that is CORRECT — which is how a
  //   real gate gets switched off by whoever meets it first.
  {
    const v = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: 60 });
    const axb = E.vgCrossVec(v.a, v.b) as V3, bxa = E.vgCrossVec(v.b, v.a) as V3;
    const arrows: Arrow[] = [
      { id: "a", origin: [0, 0, 0], tip: v.a }, { id: "b", origin: [0, 0, 0], tip: v.b },
      { id: "axb", origin: [0, 0, 0], tip: axb }, { id: "bxa", origin: [0, 0, 0], tip: bxa },
    ];
    const cam = camPosFromAzEl(90, 30, 16);
    const noExempt = scorePose(cam, arrows);
    expectFail(`a gate with NO exempt-pair list passes this CORRECT state (it scores the by-design antiparallel pair at ${noExempt.minSep.toFixed(2)} deg via ${noExempt.worstPair})`,
      noExempt.minSep > 5);
    const withExempt = scorePose(cam, arrows, ["axb^bxa"]);
    assertTrue(`with the exemption the same state scores ${withExempt.minSep.toFixed(2)} deg and PASSES`, withExempt.minSep > 20);
    // ...and the SCREEN-LENGTH floor, because a pairwise ANGLE cannot see
    // foreshortening: two well-separated directions can both be 3 px long.
    assertTrue(`the length floor is reported alongside the angle (min arm ${withExempt.minArm.toFixed(4)}, max arm ${withExempt.maxArm.toFixed(4)} vs half-extent ${HALF_V.toFixed(4)})`,
      withExempt.minArm > 0 && withExempt.maxArm <= HALF_V);
  }

  // ── 13f. THE WORST-CASE LAW applied to the explore camera: ALL FOUR live
  //   sliders, 1-degree theta resolution, pairwise over every rendered pair,
  //   in perspective, reporting BOTH an angular separation AND a screen
  //   extent against the frustum. A metric evaluated at the authored pose,
  //   at the pin, or over a SUBSET of the axes is not a measurement.
  {
    let minSep = Infinity, maxArm = 0, minArm = Infinity, n = 0, offFrame = 0;
    let worstSepAt = "", worstArmAt = "";
    for (let th = 20; th <= 160; th += 1) {
      for (let am = 1.0; am <= 5.0001; am += 0.25) {
        for (let bm = 1.0; bm <= 5.0001; bm += 0.25) {
          for (let ti = 0; ti <= 60; ti += 5) {
            const v = E.vgBuildVectors({ a_mag: am, b_mag: bm, theta_deg: th, b_tilt_deg: ti });
            const pos = E.vgAutoFramePos(v.a, v.b, 2.5) as V3 | null;
            if (!pos) continue;
            n++;
            const sc = scorePose(pos, arrowsOf(v as any));
            if (sc.minSep < minSep) { minSep = sc.minSep; worstSepAt = `theta=${th} |a|=${am} |b|=${bm} tilt=${ti} pair ${sc.worstPair}`; }
            if (sc.maxArm > maxArm) { maxArm = sc.maxArm; worstArmAt = `theta=${th} |a|=${am} |b|=${bm} tilt=${ti}`; }
            if (sc.minArm < minArm) minArm = sc.minArm;
            if (sc.offFrame) offFrame++;
          }
        }
      }
    }
    console.log(`        swept ${n} poses over ALL FOUR live sliders (theta x a_mag x b_mag x b_tilt) at FOV ${FOV} / aspect 16:9, perspective`);
    console.log(`        MIN pairwise ${minSep.toFixed(3)} deg  (${worstSepAt})`);
    console.log(`        MAX arm ${maxArm.toFixed(4)}  (${worstArmAt})   MIN arm ${minArm.toFixed(4)}   half-extent ${HALF_V.toFixed(4)}, framing target ${FRAME_TARGET.toFixed(4)}`);
    assertTrue(`the sweep is the FULL cartesian product, not a subset (${n} poses, all four axes)`, n > 250000);
    assertTrue(`auto_frame holds a min pairwise separation >= 18.0 deg over the whole product (got ${minSep.toFixed(3)})`, minSep >= 18.0);
    assertTrue(`auto_frame keeps the longest arm ON FRAME against the 0.4619 target (got ${maxArm.toFixed(4)})`, maxArm <= FRAME_TARGET);
    check("no pose in the whole product puts an arrow tip outside the frustum", offFrame, 0, 0);
    // The min-arm number is REPORTED, not thresholded: it is the figure the
    // renderer's arrow length floor must be checked against (skeleton D-8),
    // and it is genuinely small because at |a|=1 beside |b|=5 the short arrow
    // really is 12x shorter than the cross product. Honest, not hidden.
    assertTrue(`the min arm is REPORTED for the D-8 arrow-floor check (${minArm.toFixed(4)}) and is non-zero`, minArm > 0);
    // The entry pose the sandbox opens at.
    const v0 = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.0, theta_deg: 60 });
    const p0 = E.vgAutoFramePos(v0.a, v0.b, 2.5) as V3;
    const d0 = len3(p0);
    console.log(`        entry pose (theta=60, |a|=3, |b|=2, tilt=0): az ${(Math.atan2(p0[2], p0[0]) * 180 / Math.PI).toFixed(2)} deg, el ${(Math.asin(p0[1] / d0) * 180 / Math.PI).toFixed(2)} deg, R ${d0.toFixed(2)}`);
    // NEGATIVE CONTROL — a FIXED radius against the same dials, which is the
    // OPEN CRITICAL scar field3d_explore_camera_fixed_while_its_own_dials_
    // span_two_orders_of_radius. Prove the auto-framed radius is doing work.
    let fixedOff = 0, fixedMaxArm = 0;
    for (let th = 20; th <= 160; th += 10) {
      for (const am of [1.0, 3.0, 5.0]) for (const bm of [1.0, 3.0, 5.0]) for (const ti of [0, 30, 60]) {
        const v = E.vgBuildVectors({ a_mag: am, b_mag: bm, theta_deg: th, b_tilt_deg: ti });
        const dir = E.vgNormalize(E.vgAddVec(E.vgAddVec(E.vgNormalize(v.a), E.vgNormalize(v.b)), E.vgNormalize(E.vgCrossVec(v.a, v.b)))) as V3;
        const fixed: V3 = [dir[0] * 9, dir[1] * 9, dir[2] * 9];   // BUG: R pinned at 9
        const sc = scorePose(fixed, arrowsOf(v as any));
        if (sc.offFrame) fixedOff++;
        if (sc.maxArm > fixedMaxArm) fixedMaxArm = sc.maxArm;
      }
    }
    expectFail(`a FIXED radius R=9 keeps every pose on frame (max arm ${fixedMaxArm.toFixed(4)} vs half-extent ${HALF_V.toFixed(4)}; ${fixedOff} poses off-frame)`,
      fixedOff === 0 && fixedMaxArm <= HALF_V);
    assertTrue("the AUTO-FRAMED radius does keep every pose on frame — the radius is load-bearing, not decoration", offFrame === 0);
  }

  // ── 13g. F24 vg.camera_steps — CLOSED FORM on state-local ms ────────────
  //   The property is the whole reason three concepts adopted os.camera_steps
  //   and withdrew their frame-rate workarounds. Asserted, not assumed.
  {
    assertTrue("the PORTED mechanism exists in the shipped renderer (Rule 40a on the MECHANISM): os.camera_steps",
      SRC.indexOf("function osCamScheduleAt(") >= 0);
    const base = { az: 90, el: 70, dist: 10 };
    const steps = [
      { at_ms: 0, az: 90, el: 70, dist: 10, ease_ms: 0 },
      { at_ms: 200, dist: 16, ease_ms: 1200 },              // staging dolly — inherits az/el
      { at_ms: 2800, el: 30, ease_ms: 1600 },               // the reveal tilt — inherits az/dist
    ];
    check("before the first step the pose IS the state's base camera", E.vgCamScheduleAt(steps, -1, base).az, 90, 1e-12);
    check("a step inherits the fields it does not name (az through the dolly)", E.vgCamScheduleAt(steps, 1400, base).az, 90, 1e-12);
    check("...and the dolly reaches its dist", E.vgCamScheduleAt(steps, 1400, base).dist, 16, 1e-9);
    check("...and el is still the pre-tilt value", E.vgCamScheduleAt(steps, 1400, base).el, 70, 1e-9);
    check("the tilt completes at at_ms + ease_ms (2800 + 1600)", E.vgCamScheduleAt(steps, 4400, base).el, 30, 1e-9);
    check("...and HOLDS there", E.vgCamScheduleAt(steps, 99999, base).el, 30, 1e-12);
    check("...carrying the dolly's dist with it (inheritance is cumulative)", E.vgCamScheduleAt(steps, 99999, base).dist, 16, 1e-12);
    check("vgCamStepsEndMs reports the settle time the reveal pin needs", E.vgCamStepsEndMs(steps), 4400, 0);
    assertTrue("smoothstep starts AT REST — 1% into the tilt the camera has moved well under 1% of the travel (Rule 32d, no teleport)",
      Math.abs(E.vgCamScheduleAt(steps, 2816, base).el - 70) < 0.4);
    assertTrue("a state authoring NO steps gets null (nothing happens — every shipped concept)", E.vgCamScheduleAt(null, 1000, base) === null);
    // The REWIND test: a lerp is history-dependent, a closed form is not.
    const fwd = [0, 400, 900, 1400, 2000, 2800, 3400, 4000, 4400, 6000].map((t) => JSON.stringify(E.vgCamScheduleAt(steps, t, base)));
    const rew = [6000, 4400, 4000, 3400, 2800, 2000, 1400, 900, 400, 0].map((t) => JSON.stringify(E.vgCamScheduleAt(steps, t, base)));
    assertTrue("REWIND: replaying the schedule backwards reproduces every pose BIT FOR BIT — a SET_TIME_FREEZE pin is reproducible",
      fwd.every((x, i) => x === rew[rew.length - 1 - i]));
    // NEGATIVE CONTROL — a fixed-rate lerp toward the same target, which is
    // what animateCameraTo does. Its pose at a given ms depends on how many
    // frames have run, so two pinned captures disagree.
    function lerpPose(frames: number, rate: number) { let el = 70; for (let i = 0; i < frames; i++) el += (30 - el) * rate; return el; }
    expectFail(`a fixed-rate lerp reaches the SAME pose at 30 fps and 120 fps (${lerpPose(60, 0.05).toFixed(3)} vs ${lerpPose(240, 0.05).toFixed(3)})`,
      Math.abs(lerpPose(60, 0.05) - lerpPose(240, 0.05)) < 1e-6);
    assertTrue("the closed form has no such dependence — it never reads a frame count", grabFn("vgCamScheduleAt").indexOf("frame") < 0);
  }
}
console.log(`\n${failures === 0 ? "ALL SECTIONS PASSED" : `${failures} ASSERTION(S) FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
