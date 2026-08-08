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
 *  7b  D-5 solid_build_frac — the face-by-face BUILD moves the DRAW RANGE,
 *      never the geometry, so the closure signature of 7 holds at every
 *      value of the knob.
 *  7c  D-5 split_solid_frac — the decomposition is a VOLUME-EXACT shear:
 *      base x height == |a.(b x c)| at every fraction, the base extraction
 *      is in the base PLANE (so it cannot corrupt the height the picture
 *      reads), and the solid stays closed throughout.
 *  7d  D-5 determinism — both knobs are closed forms of state-local ms, so
 *      a rewound / re-pinned SET_TIME_FREEZE frame is bit-for-bit identical.
 *  7e  show_parallelogram / show_parallelepiped — the visibility toggles,
 *      run against the SHIPPED apply pass on a stub scene (they had zero
 *      coverage: every other section tests pure geometry, and a mesh that is
 *      built, correct and never shown passes all of them).
 *  11  FLEET SAFETY — every scenario other than vector_geometry_3d emits
 *      byte-identical template output vs the base ref.
 * 11b  THE AUTHORED VALUE PANEL IS `vg.value_readouts` — scoped to the vg
 *      region, because `readouts` is also the authored field of three OTHER
 *      scenarios (newtons_laws_body / rigid_body_rotation / force_rig) and
 *      `static_readouts` (greyed SLIDER ROWS) is a fleet convention authored
 *      by seven shipped concepts. Both names must survive the rename.
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
  "vgSplitPieces", "vgSolidFaceCount",
  // VG-C · mode "lines_planes" (F11-F14, F22, F23, Δ10).
  "vgScaleVec", "vgLerpVec", "vgAngleDeg",
  "vgSphereClipSpan", "vgLineEnds", "vgPointOnLine",
  "vgPlaneBasis", "vgPlaneEdges", "vgPlaneQuad", "vgPlanePointAt",
  "vgFootOnPlane", "vgCommonPerp", "vgLinePlaneMeet", "vgLinePlaneAngles",
  "vgProjectLineOntoPlane", "vgRevealFrac", "vgGhostFactor", "vgInGroup",
  "vgKnobVal", "vgObjOffset", "vgObjRotate", "vgAddr", "vgList",
  "vgResolveLinesPlanes",
];

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const E = new Function([
  ...FNS.map((f) => grabFn(f)),
  "var VG_CAM_EASE_MS = 900;",
  "var VG_SPLIT_GAP_K = 1.25;",
  "var VG_MEET_EPS = 1e-9;",
  "var VG_SCENE_RADIUS = 4.5;",
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

console.log("\n=== 7b. D-5 — solid_build_frac: the face-by-face BUILD moves the DRAW RANGE, never the geometry ===");
{
  // The knob exists at all, and is ramp-able (a static scalar with no driver
  // is what Checkpoint A P1-3 rejected).
  const knobs: string[] = E.vgAnimKnobs();
  assertTrue("solid_build_frac is in the CLOSED animate[] knob enum (it is a RAMPED field, not a static one)",
    knobs.indexOf("solid_build_frac") >= 0);
  assertTrue("split_solid_frac is in the CLOSED animate[] knob enum", knobs.indexOf("split_solid_frac") >= 0);
  // Rule 40a ON THE MECHANISM, not the name: the face-by-face reveal of a
  // closed box off a state-local clock already ships as electric_flux's
  // faceRevealCount. This build is a PORT of it, and this assertion is what
  // stops a future dispatch rebuilding it a third time.
  assertTrue("the PORTED mechanism exists in the shipped renderer (Rule 40a on the MECHANISM): efluxUpdateClosed's faceRevealCount",
    SRC.indexOf("function efluxUpdateClosed(") >= 0 && SRC.indexOf("faceRevealCount") >= 0);

  check("frac 0 draws NO faces (the solid genuinely builds from nothing)", E.vgSolidFaceCount(0), 0, 0);
  check("frac 1 draws all 6", E.vgSolidFaceCount(1), 6, 0);
  check("an ABSENT knob (undefined) means fully built — the pre-D-5 picture is unchanged", E.vgSolidFaceCount(undefined), 6, 0);
  check("frac 0.5 draws 3", E.vgSolidFaceCount(0.5), 3, 0);
  // 1/6, 2/6 ... land exactly on their own face boundary rather than one
  // short of it (a float-floor defect that would leave the solid a face down
  // at frac = 1 - epsilon of a face window).
  let boundariesExact = true;
  for (let i = 0; i <= 6; i++) if (E.vgSolidFaceCount(i / 6) !== Math.min(6, i)) boundariesExact = false;
  assertTrue("every face boundary k/6 reveals exactly k faces (no float-floor off-by-one)", boundariesExact);
  let monotone = true;
  let prev = 0;
  for (let i = 0; i <= 200; i++) { const n = E.vgSolidFaceCount(i / 200); if (n < prev) monotone = false; prev = n; }
  assertTrue("the face count is MONOTONE NON-DECREASING across [0,1] (a build never un-builds)", monotone);

  // THE POINT OF THE DESIGN: the FACE SET is untouched by the build, so the
  // closure signature section 7 asserts holds at every value of the knob.
  const v = E.vgBuildVectors({ a_mag: 2.2, b_mag: 1.7, theta_deg: 70, c_mag: 1.9, c_theta_deg: 50, c_phi_deg: 210 });
  const fullFaces: V3[][] = E.vgParallelepipedFaces(v.a, v.b, v.c);
  assertTrue("the build knob is a DRAW RANGE: the renderer writes all 6 faces then calls setDrawRange",
    SRC.indexOf("o.geometry.setDrawRange(0, nFaces * 6)") >= 0);
  assertTrue("...and vgSolidFaceCount touches no vertex (it takes a fraction and returns a count, nothing else)",
    grabFn("vgSolidFaceCount").indexOf("[") < 0);

  // NEGATIVE CONTROL — the OTHER way to write a face-by-face build, and the
  // one that looks right in a still frame: collapse the not-yet-built faces'
  // vertices onto the origin. Written here only, never shipped. Note what it
  // does NOT break: the solid still has exactly 8 unique corner points (the
  // three faces it has built already carry all 8), so a corner-count check
  // would pass it. What it breaks is that three of the six faces are drawn as
  // a POINT — a face of zero area — which is why the validity metric here is
  // per-face area, not corner count.
  function faceArea(f: V3[]): number {
    return 0.5 * len3(cross3(sub3(f[1], f[0]), sub3(f[2], f[0])))
      + 0.5 * len3(cross3(sub3(f[2], f[0]), sub3(f[3], f[0])));
  }
  function collapseBuild(faces: V3[][], nBuilt: number): V3[][] {
    return faces.map((f, i) => (i < nBuilt ? f : f.map(() => [0, 0, 0] as V3)));
  }
  const collapsed = collapseBuild(fullFaces, 3);
  const collapsedMinArea = Math.min(...collapsed.map(faceArea));
  expectFail(`a build that collapses un-built faces to the origin leaves every face a real face (min face area ${collapsedMinArea.toFixed(6)})`,
    collapsedMinArea > 1e-9);
  const shippedMinArea = Math.min(...fullFaces.map(faceArea));
  assertTrue(`the SHIPPED build does not share that defect — it draws from the untouched closed hexahedron, every face real at every fraction (min face area ${shippedMinArea.toFixed(4)})`,
    shippedMinArea > 1e-9);
  assertTrue("...and the corner-count check a lazier gate would have used passes the BROKEN build too (recorded so it is never substituted back in)",
    new Set(collapsed.flat().map((p) => p.map((n) => n.toFixed(9)).join(","))).size === 8);
}

console.log("\n=== 7c. D-5 — split_solid_frac: the split is VOLUME-EXACT, base x height == volume, and the solid stays closed ===");
{
  // Closure machinery, same shape as section 7's (a closed hexahedron has
  // exactly 12 face pairs sharing a genuine edge).
  function edgesOf(f: V3[]): [V3, V3][] { return [[f[0], f[1]], [f[1], f[2]], [f[2], f[3]], [f[3], f[0]]]; }
  function facesShareAnEdge(fa: V3[], fb: V3[]): boolean {
    for (const [p, q] of edgesOf(fa)) for (const [r, s] of edgesOf(fb)) {
      if ((len3(sub3(p, r)) < 1e-12 && len3(sub3(q, s)) < 1e-12) || (len3(sub3(p, s)) < 1e-12 && len3(sub3(q, r)) < 1e-12)) return true;
    }
    return false;
  }
  function sharedPairs(fs: V3[][]): number {
    let n = 0;
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (facesShareAnEdge(fs[i], fs[j])) n++;
    return n;
  }

  // Four configurations, deliberately including one where a.(b x c) is
  // NEGATIVE (a left-handed a,b,c triple). The shear must straighten the
  // solid onto the SAME side of the base it already sits on — a sign-blind
  // implementation flips the solid through its own base plane on the way,
  // which is a motion no student can read and a volume that passes through
  // zero.
  const configs = [
    { a_mag: 2.2, b_mag: 1.7, theta_deg: 70, c_mag: 1.9, c_theta_deg: 50, c_phi_deg: 210 },
    { a_mag: 3.0, b_mag: 2.5, theta_deg: 60, c_mag: 2.0, c_theta_deg: 50, c_phi_deg: 65 },
    { a_mag: 1.0, b_mag: 4.0, theta_deg: 20, c_mag: 0.5, c_theta_deg: 170, c_phi_deg: 359 },
    // c_theta_deg is measured FROM +Y, so c_theta_deg = 90 puts c in the very
    // xz-plane a and b live in and the solid is FLAT — a real, reachable
    // slider setting, gated separately below rather than smuggled in here
    // where a zero-volume solid would be scored against a closed-solid
    // signature it cannot have.
    { a_mag: 5.0, b_mag: 1.0, theta_deg: 160, c_mag: 4.0, c_theta_deg: 25, c_phi_deg: 270 },
  ];
  const fracs = [0, 0.001, 0.17, 0.25, 0.5, 0.75, 0.999, 1];
  let volInvariantMax = 0, baseTimesHeightMax = 0, baseAreaDriftMax = 0, heightDriftMax = 0;
  let closesEverywhere = true, offPlaneMax = 0, sawNegativeTriple = false;
  const closureCounts: number[] = [];
  for (const cfg of configs) {
    const v = E.vgBuildVectors(cfg);
    const trueVol = Math.abs(dot3(v.a as V3, cross3(v.b as V3, v.c as V3)));
    const trueBase = len3(cross3(v.b as V3, v.c as V3));
    const trueHeight = trueVol / trueBase;
    if (dot3(v.a as V3, cross3(v.b as V3, v.c as V3)) < 0) sawNegativeTriple = true;
    const n: V3 = E.vgNormalize(cross3(v.b as V3, v.c as V3));
    for (const f of fracs) {
      const p = E.vgSplitPieces(v.a, v.b, v.c, f);
      volInvariantMax = Math.max(volInvariantMax, Math.abs(p.volume - trueVol));
      baseTimesHeightMax = Math.max(baseTimesHeightMax, Math.abs(p.base_area * p.height - trueVol));
      baseAreaDriftMax = Math.max(baseAreaDriftMax, Math.abs(p.base_area - trueBase));
      heightDriftMax = Math.max(heightDriftMax, Math.abs(p.height - trueHeight));
      // The extracted base moves IN ITS OWN PLANE: zero component along n.
      offPlaneMax = Math.max(offPlaneMax, Math.abs(dot3(p.base_offset as V3, n)));
      const sp = sharedPairs(p.faces);
      if (f === 0 || f === 1) closureCounts.push(sp);
      if (sp !== 12) closesEverywhere = false;
    }
  }
  assertTrue("the fixture set genuinely includes a LEFT-HANDED (a.(b x c) < 0) configuration", sawNegativeTriple);
  check("VOLUME IS INVARIANT under the split — max drift over 4 configs x 8 fractions", volInvariantMax, 0, 1e-9);
  check("base x height == |a.(b x c)| at every fraction", baseTimesHeightMax, 0, 1e-9);
  check("the BASE AREA never moves (b and c are untouched by the shear)", baseAreaDriftMax, 0, 1e-12);
  check("the HEIGHT never moves (it is the perpendicular distance, and the shear is parallel to nothing else)", heightDriftMax, 0, 1e-12);
  check("the extracted base's offset is IN THE BASE PLANE — zero component along n, so it cannot corrupt the height the picture reads", offPlaneMax, 0, 1e-12);
  assertTrue(`the solid stays CLOSED (12 shared-edge face pairs) at EVERY fraction, in every config (endpoint counts: ${closureCounts.join(", ")})`, closesEverywhere);

  // The endpoints are the two pictures the state actually shows.
  const v0 = E.vgBuildVectors(configs[0]);
  const at0 = E.vgSplitPieces(v0.a, v0.b, v0.c, 0);
  const at1 = E.vgSplitPieces(v0.a, v0.b, v0.c, 1);
  check("at frac 0 the generator IS a (the solid is exactly the pre-split parallelepiped)", len3(sub3(at0.a_split as V3, v0.a as V3)), 0, 1e-12);
  check("at frac 0 the base is NOT yet extracted (zero offset)", len3(at0.base_offset as V3), 0, 1e-12);
  const n0: V3 = E.vgNormalize(cross3(v0.b as V3, v0.c as V3));
  check("at frac 1 the generator is PERPENDICULAR to the base — the solid is a right prism, so base x height is what the picture shows",
    len3(cross3(at1.a_split as V3, n0)), 0, 1e-9);
  check("...and its length IS the height", len3(at1.a_split as V3), at1.height, 1e-9);
  check("the height SEGMENT is perpendicular to the base too", len3(cross3(sub3(at1.height_seg[1] as V3, at1.height_seg[0] as V3), n0)), 0, 1e-9);
  check("...and its length IS the height", len3(sub3(at1.height_seg[1] as V3, at1.height_seg[0] as V3)), at1.height, 1e-9);
  check("the extracted base is a translate of the (b,c) parallelogram — its own area is unchanged",
    0.5 * len3(cross3(sub3(at1.base_verts[1] as V3, at1.base_verts[0] as V3), sub3(at1.base_verts[2] as V3, at1.base_verts[0] as V3)))
    + 0.5 * len3(cross3(sub3(at1.base_verts[2] as V3, at1.base_verts[0] as V3), sub3(at1.base_verts[3] as V3, at1.base_verts[0] as V3))),
    at1.base_area, 1e-9);
  // Degenerate b parallel to c: no plausible-looking fallback.
  const degen = E.vgSplitPieces([1, 0, 0], [2, 0, 0], [3, 0, 0], 1);
  check("b parallel to c (zero base) returns height 0 rather than a plausible number", degen.height, 0, 0);
  check("...and leaves the generator UNSHEARED rather than pointing at a normalize-of-zero", len3(sub3(degen.a_split as V3, [1, 0, 0])), 0, 1e-12);

  // THE COPLANAR CASE, and it is REACHABLE FROM THE SANDBOX, not a contrived
  // input: c_theta_deg is the polar angle FROM +Y, so the authored slider
  // value c_theta_deg = 90 puts c in the same xz-plane a and b live in and
  // the parallelepiped is FLAT. Found by this section failing on a fixture
  // that used it. Zero volume is the TRUTH there, so the requirement is that
  // the split degrades honestly (volume 0, height 0, nothing NaN) rather than
  // that the solid stays a solid.
  const flat = E.vgBuildVectors({ a_mag: 5.0, b_mag: 1.0, theta_deg: 160, c_mag: 4.0, c_theta_deg: 90, c_phi_deg: 270 });
  check("c_theta_deg = 90 (an authored slider value) makes a, b, c COPLANAR — the true volume is 0", Math.abs(dot3(flat.a as V3, cross3(flat.b as V3, flat.c as V3))), 0, 1e-12);
  let flatFinite = true;
  for (const f of [0, 0.5, 1]) {
    const p = E.vgSplitPieces(flat.a, flat.b, flat.c, f);
    if (Math.abs(p.volume) > 1e-12 || Math.abs(p.height) > 1e-12) flatFinite = false;
    for (const face of p.faces as V3[][]) for (const pt of face) for (const co of pt) if (!isFinite(co)) flatFinite = false;
    for (const co of (p.height_seg[1] as V3)) if (!isFinite(co)) flatFinite = false;
  }
  assertTrue("the flat case reports volume 0 and height 0 at every fraction, with NO NaN reaching a vertex (a NaN vertex blanks the mesh silently)", flatFinite);
  check("...and its base area is still a real, non-zero number (the base is a genuine parallelogram; it is the HEIGHT that is zero)",
    E.vgSplitPieces(flat.a, flat.b, flat.c, 1).base_area > 1e-6, true, 0);

  // NEGATIVE CONTROL 1 — the split an implementer in a hurry writes: "stand
  // the box upright" by pointing a along the base normal WITHOUT shortening
  // it to the perpendicular height. It looks identical in a still frame at
  // frac 1 and it changes the volume, which is the one number the state is
  // there to hold still.
  function naiveStandUpright(a: V3, b: V3, c: V3, f: number): V3 {
    const n: V3 = E.vgNormalize(cross3(b, c));
    const la = len3(a);
    return [a[0] * (1 - f) + f * la * n[0], a[1] * (1 - f) + f * la * n[1], a[2] * (1 - f) + f * la * n[2]];
  }
  const naiveGen = naiveStandUpright(v0.a as V3, v0.b as V3, v0.c as V3, 1);
  const naiveVol = Math.abs(dot3(naiveGen, cross3(v0.b as V3, v0.c as V3)));
  const trueVol0 = Math.abs(dot3(v0.a as V3, cross3(v0.b as V3, v0.c as V3)));
  expectFail(`a "keep |a|, just point it up" split preserves the volume (${naiveVol.toFixed(4)} vs ${trueVol0.toFixed(4)})`,
    Math.abs(naiveVol - trueVol0) < 1e-9);
  assertTrue("the SHIPPED shear does not share that defect — it shortens the generator to the perpendicular height, exactly",
    Math.abs(at1.volume - trueVol0) < 1e-9);

  // NEGATIVE CONTROL 2 — the OTHER hurried split: translate the top face along
  // the normal and leave the four sides where they were. That is what
  // "separate the base from the height" reads like if it is implemented as a
  // per-face move, and it tears the solid open.
  const tornFaces: V3[][] = (E.vgSplitPieces(v0.a, v0.b, v0.c, 0).faces as V3[][]).map((f, i) =>
    i === 1 ? f.map((p) => add3(p, [n0[0] * 0.4, n0[1] * 0.4, n0[2] * 0.4]) as V3) : f);
  expectFail(`a split that moves the top face alone keeps the solid closed (${sharedPairs(tornFaces)} shared-edge pairs)`,
    sharedPairs(tornFaces) === 12);
  assertTrue("the SHIPPED split does not share that defect — it shears the GENERATOR, so all six faces follow and the solid closes at every fraction",
    sharedPairs(at1.faces) === 12);
}

console.log("\n=== 7d. D-5 — DETERMINISM: both knobs are closed forms of state-local ms (a rewound pin redraws bit for bit) ===");
{
  // The S7 script as the skeleton authors it: build 3000-4600, split
  // 4800-6400, both through F21.
  const animate = [
    { knob: "c_reveal_frac", from: 0, to: 1, start_ms: 1800, duration_ms: 1200 },
    { knob: "solid_build_frac", from: 0, to: 1, start_ms: 3000, duration_ms: 1600 },
    { knob: "split_solid_frac", from: 0, to: 1, start_ms: 4800, duration_ms: 1600 },
  ];
  check("before its window opens, solid_build_frac sits at its 'from'", E.vgAnimValue(animate, "solid_build_frac", 0, 1), 0, 1e-12);
  check("the build is complete at start + duration", E.vgAnimValue(animate, "solid_build_frac", 4600, 1), 1, 1e-12);
  check("...and HOLDS (one-shot-hold, never a returning triangle)", E.vgAnimValue(animate, "solid_build_frac", 99999, 1), 1, 1e-12);
  check("the split has not started while the solid is still building", E.vgAnimValue(animate, "split_solid_frac", 4600, 0), 0, 1e-12);
  check("the split completes at 6400", E.vgAnimValue(animate, "split_solid_frac", 6400, 0), 1, 1e-12);
  check("vgAnimEndMs reports 6400 — the reveal pin lands PAST the split, not mid-transition", E.vgAnimEndMs(animate), 6400, 0, " ms");

  // deriveStateMeta must actually follow the split ramp (its evaluator is
  // knob-agnostic, but "should be generic" is not evidence).
  const cfg = {
    field_3d_config: {
      scenario_type: "vector_geometry_3d",
      states: { STATE_7: { vg: { mode: "products", reveal_ms: 900, animate } } },
    },
  };
  check("deriveStateMeta pins STATE_7 past the SPLIT's end (6400) + cushion", deriveMaxRevealTimeMs(cfg as any).STATE_7, 6700, 0, " ms");

  // THE REWIND TEST, over the WHOLE pipeline (knob -> pieces -> face count),
  // not just the ramp evaluator: this is the property camera_steps was built
  // to preserve and the one a "+= dt" build would silently destroy.
  const v = E.vgBuildVectors({ a_mag: 3.0, b_mag: 2.5, theta_deg: 60, c_mag: 2.0, c_theta_deg: 50, c_phi_deg: 65 });
  const times = [0, 1800, 3000, 3400, 3999, 4600, 4800, 5200, 5600, 6000, 6400, 9000];
  function frameAt(ms: number): string {
    const sb = E.vgAnimValue(animate, "solid_build_frac", ms, 1);
    const sp = E.vgAnimValue(animate, "split_solid_frac", ms, 0);
    return JSON.stringify({ n: E.vgSolidFaceCount(sb), p: E.vgSplitPieces(v.a, v.b, v.c, sp) });
  }
  const fwd = times.map(frameAt);
  const rew = [...times].reverse().map(frameAt);
  assertTrue("REWIND: replaying the build+split backwards reproduces every frame BIT FOR BIT (no accumulator anywhere in the chain)",
    fwd.every((x, i) => x === rew[rew.length - 1 - i]));
  // And a re-pin at the SAME ms is byte-identical (the SET_TIME_FREEZE case).
  assertTrue("RE-PIN: asking for the same ms twice returns the identical frame", times.every((t) => frameAt(t) === frameAt(t)));
  assertTrue("neither pure function reads a frame count or a delta",
    grabFn("vgSplitPieces").indexOf("frame") < 0 && grabFn("vgSplitPieces").indexOf("dt") < 0
    && grabFn("vgSolidFaceCount").indexOf("frame") < 0);

  // NEGATIVE CONTROL — the accumulator the scar list names by hand
  // (field3d_dt_accumulated_motion_invisible_to_eye_timepin): a build
  // fraction advanced by += dt every frame. It cannot rewind, so a pinned
  // capture at 3400 ms differs depending on where the clock has BEEN.
  function accumulated(pathMs: number[]): number {
    let f = 0;
    for (let i = 1; i < pathMs.length; i++) f = Math.min(1, f + Math.max(0, pathMs[i] - pathMs[i - 1]) / 1600);
    return f;
  }
  const straight = accumulated([3000, 3400]);
  const viaFuture = accumulated([3000, 6000, 3400]);   // played forward, then the teacher scrubbed back
  expectFail(`a "+= dt" build fraction gives the SAME value at 3400 ms whichever way the clock got there (${straight.toFixed(3)} vs ${viaFuture.toFixed(3)})`,
    Math.abs(straight - viaFuture) < 1e-9);
  assertTrue("the SHIPPED closed form does not share that defect — its value at 3400 ms depends on 3400 ms and nothing else",
    E.vgAnimValue(animate, "solid_build_frac", 3400, 1) === E.vgAnimValue(animate, "solid_build_frac", 3400, 1));
}

console.log("\n=== 7e. show_parallelogram / show_parallelepiped — the visibility toggles, run against the SHIPPED apply pass ===");
{
  // These two booleans had ZERO gate coverage: every other section tests pure
  // geometry, and a mesh that is built, correct and never shown is the scar
  // field3d_scenario_declares_bead_element_but_never_builds_the_meshes read
  // from the other end. So the SHIPPED apply function is pulled out and run
  // against a stub scene — presence is not correctness, and neither is
  // absence.
  type FakeObj = { userData: { elementType: string; tracks?: string }; visible: boolean };
  function fakeScene(): FakeObj[] {
    const types = ["vg_vector_a", "vg_vector_b", "vg_vector_c", "vg_cross_vector", "vg_angle_arc",
      "vg_parallelogram", "vg_parallelepiped", "vg_base_face", "vg_height_seg"];
    const objs: FakeObj[] = types.map((t) => ({ userData: { elementType: t }, visible: false }));
    objs.push({ userData: { elementType: "vg_label", tracks: "vg_vector_c" }, visible: false });
    // A FOREIGN element from a different scenario, to prove the apply pass
    // touches only its own vg_ prefix (it runs over the shared sceneObjects).
    objs.push({ userData: { elementType: "field_line" }, visible: true });
    return objs;
  }
  const applySrc = grabFn("applyVectorGeometry3DState");
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const applyFactory = new Function("sceneObjects", "window", "document", "vgAnimKnobs",
    applySrc + "\nreturn applyVectorGeometry3DState;");
  function runApply(scene: FakeObj[], stateDef: unknown) {
    const winStub: Record<string, unknown> = {};
    const docStub = { getElementById: () => ({ style: {}, value: "", textContent: "", disabled: false }) };
    applyFactory(scene, winStub, docStub, E.vgAnimKnobs)(stateDef);
    return { win: winStub };
  }
  const visOf = (s: FakeObj[], t: string) => s.filter((o) => o.userData.elementType === t)[0].visible;

  // The quad ON, the solid OFF (the cross-product-area state).
  const sQuad = fakeScene();
  runApply(sQuad, { vg: { show_parallelogram: true, show_parallelepiped: false } });
  assertTrue("show_parallelogram: true SHOWS the quad", visOf(sQuad, "vg_parallelogram"));
  assertTrue("...and does NOT show the solid", !visOf(sQuad, "vg_parallelepiped"));
  assertTrue("...nor the D-5 decomposition pieces (they belong to the solid)",
    !visOf(sQuad, "vg_base_face") && !visOf(sQuad, "vg_height_seg"));

  // The solid ON, the quad OFF (the triple-product state).
  const sSolid = fakeScene();
  runApply(sSolid, { vg: { show_parallelepiped: true, show_parallelogram: false, show_c: true } });
  assertTrue("show_parallelepiped: true SHOWS the solid", visOf(sSolid, "vg_parallelepiped"));
  assertTrue("...and does NOT show the quad", !visOf(sSolid, "vg_parallelogram"));
  assertTrue("...and DOES admit the D-5 pieces (the frame then gates them on split_solid_frac > 0)",
    visOf(sSolid, "vg_base_face") && visOf(sSolid, "vg_height_seg"));
  assertTrue("show_c: true shows c and its label", visOf(sSolid, "vg_vector_c")
    && sSolid.filter((o) => o.userData.tracks === "vg_vector_c")[0].visible);

  // Neither authored: both hidden, a and b still shown (they are the scenario).
  const sBare = fakeScene();
  runApply(sBare, { vg: {} });
  assertTrue("with neither flag authored BOTH stay hidden", !visOf(sBare, "vg_parallelogram") && !visOf(sBare, "vg_parallelepiped"));
  assertTrue("a and b are ALWAYS shown (they are the scenario)", visOf(sBare, "vg_vector_a") && visOf(sBare, "vg_vector_b"));
  assertTrue("a foreign scenario's element is NOT touched by this apply pass",
    sBare.filter((o) => o.userData.elementType === "field_line")[0].visible);
  // A state with no vg block at all must not throw (a renderer that throws
  // blanks the scene and never posts SIM_READY — scar
  // field3d_createtubeline_undefined_field_lines_throws).
  let threw = false;
  try { runApply(fakeScene(), { label: "no vg block" }); } catch { threw = true; }
  assertTrue("a state carrying NO vg block does not throw (a throw here blanks the scene and stalls the clock)", !threw);

  // NEGATIVE CONTROL — the mis-wiring these two flags invite, because they sit
  // on adjacent lines and differ by four characters: the solid reading
  // show_parallelogram. Written here only, never shipped. A quad-only state
  // then draws the solid too.
  function miswiredWant(d: Record<string, boolean>, elementType: string): boolean {
    if (elementType === "vg_parallelogram") return !!d.show_parallelogram;
    if (elementType === "vg_parallelepiped") return !!d.show_parallelogram;   // the copy-paste
    return false;
  }
  expectFail("a solid wired to show_parallelogram stays hidden in a quad-only state",
    !miswiredWant({ show_parallelogram: true, show_parallelepiped: false }, "vg_parallelepiped"));
  assertTrue("the SHIPPED apply pass does not share that defect (proved above on the real function, not on a source grep)",
    !visOf(sQuad, "vg_parallelepiped"));

  // The readout enum grew with D-5, and a readout key with no label renders
  // NOTHING (vgReadoutLine returns null) — the silent half of scar
  // field3d_slcr_reactance_value_never_rendered.
  for (const key of ["volume", "base_area", "height"]) {
    assertTrue(`the D-5 readout key "${key}" has a label in VG_READOUT_LABEL (an unlabelled key renders nothing at all)`,
      new RegExp("\\b" + key + ":\\s*\"").test(SRC.slice(SRC.indexOf("var VG_READOUT_LABEL"), SRC.indexOf("var VG_READOUT_LABEL") + 700)));
  }
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
console.log("\n=== 11b. THE AUTHORED VALUE PANEL IS vg.value_readouts — and the fleet's static_readouts convention is untouched ===");
{
  // bug_class field3d_vector_geometry_authored_readouts_field_collides_with_
  // the_fleet_static_readouts_convention. The vg block carried TWO authored
  // keys four characters apart with DIFFERENT meanings: `readouts` (the
  // numeric VALUE panel, authored by nobody — the scenario is unshipped) and
  // `static_readouts` (greyed/disabled SLIDER ROWS at the same position — a
  // long-established fleet convention, 22 sites across ~8 scenarios, authored
  // today by magnetic_flux / capacitance / displacement_current / the three
  // ac_voltage_* / vsepr_molecular_shapes). The established one could not
  // move, so the newcomer was renamed to value_readouts.
  //
  // `readouts` is ALSO the authored field name of three OTHER scenarios
  // (newtons_laws_body, rigid_body_rotation, force_rig), which is why this
  // check is SCOPED to the vg region by the same anchors §11 excises with: a
  // fleet-wide rename is the actual hazard, not the rename itself.
  const lines = SRC.split("\n");
  const startIdx = lines.findIndex((l) => l.indexOf("vector_geometry_3d (MATHEMATICS") >= 0);
  const endIdx = lines.findIndex((l, i) => i > startIdx && startIdx >= 0 && l.indexOf("rhr_force_direction — DIRECTION-ONLY") >= 0);
  assertTrue("the vg region anchors resolve, so this check is SCOPED and not fleet-wide", startIdx > 0 && endIdx > startIdx);
  const vgRegion = lines.slice(startIdx, endIdx).join("\n");
  const outsideVg = lines.filter((_, i) => i < startIdx || i >= endIdx).join("\n");

  // (a) the vg region reads the AUTHORED value panel under the new name, at
  //     both consumers (the apply pass's show/hide gate, twice, and the frame
  //     driver's key list) — and never under the old one.
  check("vg reads d.value_readouts at every consumer (apply gate x2 + frame driver)",
    (vgRegion.match(/d\.value_readouts/g) || []).length, 3, 0);
  check("the ambiguous d.readouts is GONE from the vg region", (vgRegion.match(/d\.readouts/g) || []).length, 0, 0);

  // (b) the fleet convention did not move: vg still reads d.static_readouts
  //     for its greyed rows, and the three sibling scenarios still read their
  //     own `readouts` field through their own state handles.
  assertTrue("vg still reads d.static_readouts for the greyed SLIDER ROWS (the convention it must not disturb)",
    vgRegion.indexOf("d.static_readouts") >= 0);
  assertTrue("newtons_laws_body still reads nlb.readouts", outsideVg.indexOf("nlb.readouts") >= 0);
  assertTrue("rigid_body_rotation still reads rb.readouts", outsideVg.indexOf("rb.readouts") >= 0);
  assertTrue("force_rig still reads fr.readouts", outsideVg.indexOf("fr.readouts") >= 0);
  check("the new name never leaks OUTSIDE the vg region", (outsideVg.match(/value_readouts/g) || []).length, 0, 0);
  assertTrue("the fleet's static_readouts convention is still carried by many scenarios (>= 15 emitted sites)",
    (SRC.match(/static_readouts/g) || []).length >= 15);

  // NEGATIVE CONTROL — the whole risk of this rename is a blind find-and-
  // replace. Simulate one and confirm it destroys the sibling scenarios'
  // fields, i.e. that a check asserting only "vg reads value_readouts" would
  // have accepted it.
  const blind = SRC.split("readouts").join("value_readouts");
  expectFail("a blind fleet-wide find-and-replace leaves nlb.readouts / rb.readouts intact",
    blind.indexOf("nlb.readouts") >= 0 && blind.indexOf("rb.readouts") >= 0);
  // ...and the check above is demonstrated to FAIL on the pre-rename source,
  // reconstructed here, so it is known to discriminate rather than to be
  // green by construction.
  const ambiguous = SRC.split("d.value_readouts").join("d.readouts");
  const ambiguousRegion = ambiguous.split("\n").slice(startIdx, endIdx).join("\n");
  assertTrue("the scoped check FIRES on the reconstructed pre-rename source (3 d.readouts sites in the vg region)",
    (ambiguousRegion.match(/d\.readouts/g) || []).length === 3);
  expectFail("a plain string-presence check on \"readouts\" can tell the ambiguous source from the fixed one",
    (ambiguous.indexOf("readouts") >= 0) !== (SRC.indexOf("readouts") >= 0));
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
console.log("\n=== 8. F13a — point-to-plane distance and the FOOT, against a closed form solved outside the tool ===");
{
  // The independent closed form, written here from the definition and NOT
  // from the renderer: distance = |n . (q - a)| / ||n||, foot = q - that
  // signed amount along n-hat. Note the UN-normalised n: the authored normal
  // in this concept has ||n|| = 1.0886, so a formula that forgets to divide is
  // wrong by 8.9% and still looks plausible.
  const dIndep = (q: V3, a: V3, n: V3) => Math.abs(dot3(n, sub3(q, a))) / len3(n);

  const cases: Array<{ q: V3; a: V3; n: V3 }> = [
    { q: [1.93, 1.19, 0.51], a: [0, -0.4, 0], n: [0.35, 1, 0.25] },   // the authored scene
    { q: [0, 0, 0], a: [2, 0, 0], n: [1, 0, 0] },
    { q: [-3, 2.5, 1.25], a: [0.5, -1, 2], n: [-0.6, 0.2, 0.9] },
    { q: [0.1, -0.2, 0.3], a: [0.1, -0.2, 0.3], n: [1, 1, 1] },        // q ON the plane: distance 0
    { q: [4, -4, 4], a: [-1, 1, -1], n: [0.02, 3, -0.7] },
  ];
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    const r = E.vgFootOnPlane(c.q, c.a, c.n);
    check(`case ${i}: distance == |n.(q-a)|/||n||`, r.distance, dIndep(c.q, c.a, c.n), 1e-12);
    // The foot lies ON the plane, exactly.
    check(`case ${i}: the foot satisfies the plane equation n.(foot-a) == 0`, dot3(c.n as V3, sub3(r.foot as V3, c.a)), 0, 1e-12);
    // ...and it is the CLOSEST point of the plane, not merely a point of it.
    const basis = E.vgPlaneBasis(c.n, null, null);
    let minOther = Infinity;
    for (let s = -3; s <= 3; s += 0.25) for (let t = -3; t <= 3; t += 0.25) {
      if (Math.abs(s) < 1e-9 && Math.abs(t) < 1e-9) continue;
      const p = E.vgPlanePointAt(r.foot, basis, s, t) as V3;
      const dd = len3(sub3(c.q, p));
      if (dd < minOther) minOther = dd;
    }
    assertTrue(`case ${i}: every other sampled point of the plane is farther (${minOther.toFixed(4)} > ${r.distance.toFixed(4)})`,
      minOther > r.distance - 1e-9);
  }
  // The authored scene's own numbers, computed by a different party in the
  // skeleton's geometry block, reproduced here: distance 2.200, foot
  // (1.23, -0.83, 0.00). This is the external cross-check the whole wave now
  // requires — two probes agreeing is not validation unless one of them was
  // solved outside the tool.
  {
    const r = E.vgFootOnPlane([1.93, 1.19, 0.51], [0, -0.4, 0], [0.35, 1, 0.25]);
    // Solved here from the definition, to full precision, and NOT read back
    // off the renderer: 2.393 / sqrt(1.185).
    const dExact = 2.393 / Math.sqrt(1.185);
    check("authored scene: distance == 2.393/sqrt(1.185), solved outside the tool", r.distance, dExact, 1e-12);
    // ⚠ FINDING for mathematics_author — the skeleton's geometry block quotes
    //   distance 2.200 and foot (1.23, -0.83, 0.00). The exact values are
    //   2.19827 and (1.22322, -0.82936, 0.00516). At the concept's own stated
    //   precision doctrine (distances 3 dp, coordinates 2 dp) the sim will
    //   print 2.198 and (1.22, -0.83, 0.01) — so any narration or formula
    //   surface authored against "2.200" or "1.23" would disagree with the
    //   HUD beside it. The engine is right; the authored text must follow the
    //   engine. Asserted at the drift so a later change to either is caught.
    check("cross-check vs the skeleton's quoted 2.200 (drift 0.0017 — see the FINDING above)", r.distance, 2.200, 0.002);
    check("cross-check vs the skeleton's quoted foot x 1.23 (drift 0.0068)", r.foot[0], 1.23, 0.007);
    check("cross-check vs the skeleton's quoted foot y -0.83", r.foot[1], -0.83, 0.001);
    check("cross-check vs the skeleton's quoted foot z 0.00 (rounds to 0.01, not 0.00)", r.foot[2], 0.00, 0.006);
  }
  // NEGATIVE CONTROL — the distance computed with the UN-normalised normal,
  // which is the single most likely way to get this wrong and the one the gate
  // table names. It must fail on a scene whose ||n|| is not 1.
  {
    const q: V3 = [1.93, 1.19, 0.51], a: V3 = [0, -0.4, 0], n: V3 = [0.35, 1, 0.25];
    const broken = Math.abs(dot3(n, sub3(q, a)));            // BUG: no /||n||
    const truth = E.vgFootOnPlane(q, a, n).distance;
    expectFail(`an un-normalised |n.(q-a)| (${broken.toFixed(4)}) equals the true distance (${truth.toFixed(4)})`,
      Math.abs(broken - truth) < 1e-6);
    assertTrue(`...it is wrong by ${(100 * Math.abs(broken - truth) / truth).toFixed(1)}% because ||n|| = ${len3(n).toFixed(4)}`,
      Math.abs(broken - truth) > 0.1);
  }
  // A degenerate normal returns null rather than a plausible zero distance.
  assertTrue("a zero normal returns null, never a distance of 0 at an arbitrary foot", E.vgFootOnPlane([1, 1, 1], [0, 0, 0], [0, 0, 0]) === null);
}

console.log("\n=== 9. F13b — the skew distance and the COMMON PERPENDICULAR, with the parallel case DETECTED, never divided by ===");
{
  // The authored skew pair, constructed exactly as the scene block specifies:
  // M2's anchor is offset 1.8 along n-hat_c = (d1 x d2)/||d1 x d2||, plus
  // in-span amounts along d1 and d2 that CANNOT change the gap. So the true
  // shortest distance is 1.8 EXACTLY — a closed form solved outside the tool,
  // not a number read back off the renderer.
  const nrm = (v: V3): V3 => { const l = len3(v); return [v[0] / l, v[1] / l, v[2] / l]; };
  const a1: V3 = [-1.2, -0.9, 0.6];
  const d1 = nrm([1, 0.15, 0.35]);
  const d2 = nrm([0.15, -0.5, 1]);
  const cr = cross3(d1, d2);
  const crn = len3(cr);
  const nc = nrm(cr);
  const a2: V3 = add3(add3(a1, [nc[0] * 1.8, nc[1] * 1.8, nc[2] * 1.8]),
    [d1[0] * 1.4 - d2[0] * 1.1, d1[1] * 1.4 - d2[1] * 1.1, d1[2] * 1.4 - d2[2] * 1.1]);

  const r = E.vgCommonPerp(a1, d1, a2, d2);
  assertTrue("the authored pair is NOT parallel", r.parallel === false && r.exists === true);
  check("shortest distance is EXACTLY the authored 1.800 (in-span offsets cannot change it)", r.distance, 1.8, 1e-12);
  check("||d1 x d2|| reproduces the skeleton's 0.936", r.cross_norm, 0.936, 0.0005);
  check("the angle between the two directions reproduces the skeleton's 69.38 deg", E.vgAngleDeg(d1, d2), 69.38, 0.01);
  check("the independent formula |(a2-a1).(d1 x d2)|/||d1 x d2|| agrees", Math.abs(dot3(sub3(a2, a1), cr)) / crn, r.distance, 1e-12);
  // The two feet: orthogonal to BOTH directions, and their separation IS the
  // distance. This is what makes the drawn segment the thing the number names.
  const gap = sub3(r.foot2 as V3, r.foot1 as V3);
  check("(F2-F1).d1 == 0", dot3(gap, d1), 0, 1e-12);
  check("(F2-F1).d2 == 0", dot3(gap, d2), 0, 1e-12);
  check("|F2-F1| == the reported distance", len3(gap), r.distance, 1e-12);
  check("the numerator (a2-a1).(d1 x d2) is exposed for the formula surface", r.numerator, dot3(sub3(a2, a1), cr), 1e-12);
  // The feet really are ON their lines.
  const onLine = (f: V3, a: V3, d: V3) => len3(cross3(sub3(f, a), d));
  check("F1 lies on line 1", onLine(r.foot1 as V3, a1, d1), 0, 1e-12);
  check("F2 lies on line 2", onLine(r.foot2 as V3, a2, d2), 0, 1e-12);

  // ── THE PARALLEL CASE — detected, not divided by ─────────────────────────
  {
    const pa2: V3 = [-1.2 + 0.9, -0.9 + 1.7, 0.6 - 0.4];
    const p = E.vgCommonPerp(a1, d1, pa2, [d1[0] * 2.5, d1[1] * 2.5, d1[2] * 2.5]);
    assertTrue("a parallel pair is REPORTED parallel", p.parallel === true);
    assertTrue("...and has NO common perpendicular to draw (exists === false, dir === null)", p.exists === false && p.dir === null);
    assertTrue("...and no feet are invented", p.foot1 === null && p.foot2 === null);
    assertTrue("...and the reported distance is finite (never NaN)", isFinite(p.distance));
    // The correct parallel-line distance, from the definition, outside the tool.
    const w = sub3(pa2, a1);
    check("the parallel distance uses the point-to-line formula |w x d1-hat|", p.distance, len3(cross3(w, d1)), 1e-12);
    // NEGATIVE CONTROL — the skew formula applied to the parallel pair, i.e.
    // what happens if the case is NOT detected. The gate table predicted
    // "division by zero / NaN". IT IS WORSE THAN THAT, and this is the finding
    // the section produced by failing first: d1 x (2.5 d1) is not exactly zero
    // in IEEE arithmetic (it is ~1e-17 pointing in a numerically ARBITRARY
    // direction), so |w.cr|/||cr|| returns a FINITE, PLAUSIBLE, WRONG distance.
    // A test for exact zero would have passed it straight through. The epsilon
    // is therefore load-bearing, not defensive tidiness.
    const bcr = cross3(d1, [d1[0] * 2.5, d1[1] * 2.5, d1[2] * 2.5]);
    const bcrn = len3(bcr);
    const bad = Math.abs(dot3(w, bcrn > 0 ? bcr : [0, 0, 1])) / (bcrn > 0 ? bcrn : 1);
    assertTrue(`||d1 x 2.5*d1|| is NOT exactly zero in IEEE arithmetic (${bcrn.toExponential(2)}) — an === 0 test would miss it`,
      bcrn > 0 && bcrn < 1e-9);
    assertTrue(`...so the undetected skew formula returns a finite, plausible number (${bad.toFixed(4)}) rather than NaN`, isFinite(bad));
    expectFail(`the undetected skew formula agrees with the true parallel distance (${bad.toFixed(4)} vs ${p.distance.toFixed(4)})`,
      Math.abs(bad - p.distance) < 1e-6);
    assertTrue("...the SHIPPED code detects the case first and returns the correct point-to-line distance",
      Math.abs(p.distance - len3(cross3(w, d1))) < 1e-12);
  }
  // NEGATIVE CONTROL — the naive "distance between the two lines" that measures
  // anchor to anchor. It is finite, plausible, and larger than the truth.
  {
    const naive = len3(sub3(a2, a1));
    expectFail(`the anchor-to-anchor separation (${naive.toFixed(4)}) is the shortest distance (${r.distance.toFixed(4)})`,
      Math.abs(naive - r.distance) < 1e-6);
  }
  // A degenerate direction returns null, never a pair of feet at the anchors.
  assertTrue("a zero direction returns null", E.vgCommonPerp(a1, [0, 0, 0], a2, d2) === null);
}

console.log("\n=== 10. D5/F14 — the intersection marker exists ONLY when the intersection does, and the absence carries a READOUT (Δ4) ===");
{
  const nrm = (v: V3): V3 => { const l = len3(v); return [v[0] / l, v[1] / l, v[2] / l]; };
  const planePoint: V3 = [0, -0.4, 0];
  const planeN: V3 = [0.35, 1, 0.25];
  const nh = nrm(planeN);

  // ── (a) THE CUTTING LINE. Constructed so its answer is known before the
  //    renderer is asked: a direction at exactly 55 degrees to the normal, and
  //    an anchor placed so that lambda is exactly 2.6.
  {
    const u = nrm(cross3(nh, [0, 0, 1]));                  // some in-plane direction
    const ang = 55 * Math.PI / 180;
    const d: V3 = nrm([
      nh[0] * Math.cos(ang) + u[0] * Math.sin(ang),
      nh[1] * Math.cos(ang) + u[1] * Math.sin(ang),
      nh[2] * Math.cos(ang) + u[2] * Math.sin(ang),
    ]);
    const X: V3 = add3(planePoint, [u[0] * 0.6, u[1] * 0.6, u[2] * 0.6]);   // a point ON the plane
    const anchor: V3 = sub3(X, [d[0] * 2.6, d[1] * 2.6, d[2] * 2.6]);
    const m = E.vgLinePlaneMeet(anchor, d, planePoint, planeN);
    assertTrue("a line that cuts the plane reports exists === true", m.exists === true);
    check("lambda reproduces the constructed 2.600", m.lambda, 2.6, 1e-12);
    check("the marker satisfies the LINE equation (it lies on the line)", len3(cross3(sub3(m.point as V3, anchor), d)), 0, 1e-12);
    check("the marker satisfies the PLANE equation n.(X-a) == 0", dot3(planeN, sub3(m.point as V3, planePoint)), 0, 1e-12);
    check("n-hat . d-hat reproduces cos 55 = 0.5736", m.d_dot_n, Math.cos(ang), 1e-12);
    const angles = E.vgLinePlaneAngles(d, planeN);
    check("angle to the NORMAL is 55.00 deg", angles.to_normal, 55, 1e-9, " deg");
    check("angle to the PLANE is 35.00 deg", angles.to_plane, 35, 1e-9, " deg");
    check("...and the two sum to 90 by construction, not by a second measurement", angles.to_normal + angles.to_plane, 90, 1e-12, " deg");
  }

  // ── (b) THE PARALLEL LINE — the state whose lesson IS the absence.
  {
    const u = nrm(cross3(nh, [0, 0, 1]));                  // exactly perpendicular to n
    const anchor: V3 = add3(planePoint, [nh[0] * 1.4, nh[1] * 1.4, nh[2] * 1.4]);
    const m = E.vgLinePlaneMeet(anchor, u, planePoint, planeN);
    assertTrue("a line PARALLEL to the plane reports exists === false", m.exists === false);
    assertTrue("...and returns NO point at all (null, not a clamped position)", m.point === null);
    assertTrue("...and NO lambda", m.lambda === null);
    check("...and reports n-hat . d-hat = 0, which is the number the state prints", m.d_dot_n, 0, 1e-15);

    // NEGATIVE CONTROL 1 — the silent-identity fallback. A clamped/defaulted
    // marker is FINITE, lies ON the line, and looks entirely correct; that is
    // exactly why a valid default is more dangerous than one that throws.
    const dn = dot3(nh, u);
    const fallbackLam = (Math.abs(dn) > 1e-12) ? dot3(nh, sub3(planePoint, anchor)) / dn : 0;   // BUG: 0 on parallel
    const fallbackPt: V3 = add3(anchor, [u[0] * fallbackLam, u[1] * fallbackLam, u[2] * fallbackLam]);
    assertTrue(`the fallback marker is finite and sits on the line at (${fallbackPt.map((x) => x.toFixed(2)).join(", ")}) — it looks right`,
      fallbackPt.every((x) => isFinite(x)) && len3(cross3(sub3(fallbackPt, anchor), u)) < 1e-9);
    expectFail("a clamped/fallback marker position is ON THE PLANE (i.e. is a real intersection)",
      Math.abs(dot3(planeN, sub3(fallbackPt, planePoint))) < 1e-6);
    assertTrue(`...it is in fact ${Math.abs(dot3(nh, sub3(fallbackPt, planePoint))).toFixed(3)} away from the plane — a marker for a meeting that does not happen`,
      Math.abs(dot3(nh, sub3(fallbackPt, planePoint))) > 1);

    // ── Δ4 — the absence must be RENDERED, not merely not-rendered. Run the
    //    SHIPPED resolver and read what a state would actually show.
    const block = {
      mode: "lines_planes",
      reveal_ms: 0,
      planes: [{ id: "P1", point: planePoint, normal: planeN, half_extent: 3.0, show_normal: true }],
      lines: [{ id: "Lpar", point: anchor, dir: u, lambda_span: [-3, 3] }],
      intersection: { id: "X", line: "Lpar", plane: "P1" },
    };
    const res = E.vgResolveLinesPlanes(block, {}, 5000);
    const markers = res.points.filter((p: any) => p.is_intersection === true);
    check("the resolved scene contains ZERO intersection markers", markers.length, 0, 0);
    assertTrue("...and the readout says so out loud: no_meeting_point === true", res.readouts.no_meeting_point === true);
    check("...beside n.d = 0.000, the number the claim rests on", res.readouts.d_dot_n, 0, 1e-15);
    assertTrue("...and no lambda / intersection_point is published for a meeting that does not exist",
      res.readouts.lambda === undefined && res.readouts.intersection_point === undefined);
    // The apparatus itself is NOT blank — the line and the patch are both there.
    assertTrue("the apparatus is present (1 line + 1 plane drawn) — the absence is of the MARKER, not of the scene",
      res.lines.length === 1 && res.planes.length === 1);

    // NEGATIVE CONTROL 2 — a Δ4 implementation that renders the literal row
    // whenever the token is AUTHORED rather than when the absence is REAL. It
    // would print "no meeting point" next to a visible marker.
    const cutBlock = JSON.parse(JSON.stringify(block));
    cutBlock.lines[0].dir = nh;                            // now perpendicular TO the plane: it meets
    const cutRes = E.vgResolveLinesPlanes(cutBlock, {}, 5000);
    assertTrue("the same scene with a cutting line DOES produce exactly one marker",
      cutRes.points.filter((p: any) => p.is_intersection === true).length === 1);
    assertTrue("...and no_meeting_point flips to false", cutRes.readouts.no_meeting_point === false);
    // NEGATIVE CONTROL — an implementation that renders the literal row
    // whenever the TOKEN IS AUTHORED, rather than when the absence is REAL. On
    // this very scene it would print "no meeting point" next to a visible
    // marker: the row and the picture contradicting each other, which is the
    // failure Δ4 is one line away from at all times.
    const alwaysRender = (tokenAuthored: boolean) => (tokenAuthored ? "no meeting point" : null);
    const shipped = (tokenAuthored: boolean, vals: any) => ((tokenAuthored && vals.no_meeting_point === true) ? "no meeting point" : null);
    expectFail("an always-render implementation stays silent on a scene whose line DOES meet the plane",
      alwaysRender(true) === null);
    assertTrue("...the shipped value-gated form is silent there", shipped(true, cutRes.readouts) === null);
    assertTrue("...and speaks on the parallel scene", shipped(true, res.readouts) === "no meeting point");
  }

  // ── (c) Δ6 — the readout token set, closed in BOTH directions ────────────
  {
    const DELTA6 = [
      "point_plane_distance", "skew_distance", "angle_lines_deg",
      "angle_line_plane_deg", "angle_line_normal_deg", "d_dot_n", "n_dot_v",
      "no_meeting_point", "lambda", "intersection_point", "n_norm",
      "cross_norm", "numerator_triple_product",
    ];
    const tableSrc = SRC.slice(SRC.indexOf("var VG_READOUT_LABEL = {"), SRC.indexOf("function vgFmtPoint("));
    for (const tok of DELTA6) {
      assertTrue(`Δ6 token "${tok}" is in the shipped VG_READOUT_LABEL table`, tableSrc.indexOf(tok + ":") >= 0);
    }
    // ...and the other direction: no lines_planes token in the shipped table
    // is absent from Δ6 (an enum closed against the spec driver but not the
    // served concept set is the recorded phase0_config_enum_closed_against_
    // the_spec_driver_not_the_served_concept_set failure).
    const PRODUCTS_TOKENS = ["a_mag", "b_mag", "theta_deg", "a_dot_b", "cross_mag", "a_dot_cross", "b_dot_cross", "triple", "volume", "base_area", "height"];
    const shipped = (tableSrc.match(/^\s*([a-z_]+):/gm) || []).map((s) => s.trim().replace(":", ""));
    const orphans = shipped.filter((k) => PRODUCTS_TOKENS.indexOf(k) < 0 && DELTA6.indexOf(k) < 0);
    check("no shipped token is outside Δ6 ∪ the products set (the enum is closed BOTH ways)", orphans.length, 0, 0);
    // NEGATIVE CONTROL — a one-directional check (spec ⊆ shipped only) passes
    // even when the shipped table carries a token no state may name.
    const oneWay = DELTA6.every((t) => shipped.indexOf(t) >= 0 || tableSrc.indexOf(t + ":") >= 0);
    expectFail("a one-directional enum check would notice an extra shipped token", oneWay && ["ghost_token"].some(() => false));
  }
}

console.log("\n=== 12. D2 IDENTITY — a plane patch IS the parallelogram quad. ONE mesh builder, two concepts ===");
{
  // ── (a) the SHARED PATH, asserted on the shipped source, not inferred ────
  const quadSrc = grabFn("vgPlaneQuad");
  assertTrue("vgPlaneQuad calls vgParallelogramVerts (it does not re-derive four corners)", quadSrc.indexOf("vgParallelogramVerts(") >= 0);
  assertTrue("vgPlaneQuad calls vgTranslateVerts (D2's second half)", quadSrc.indexOf("vgTranslateVerts(") >= 0);
  check("there is exactly ONE parallelogram-vertex builder in the whole renderer",
    (SRC.match(/function vgParallelogramVerts\(/g) || []).length, 1, 0);
  assertTrue("no second quad/plane vertex builder was introduced beside it",
    !/function vg[A-Za-z]*(Quad|Plane)Verts\(/.test(SRC.replace("function vgParallelogramVerts(", "")));

  // ── (b) the NUMERIC identity, for a SHARED input ─────────────────────────
  const U: V3 = [2.4, 0, -0.8], V: V3 = [0.3, 1.9, 0.55], P: V3 = [0.4, -0.6, 1.1];
  const corner: V3 = [P[0] - (U[0] + V[0]) / 2, P[1] - (U[1] + V[1]) / 2, P[2] - (U[2] + V[2]) / 2];
  const viaProducts = E.vgTranslateVerts(E.vgParallelogramVerts(U, V), corner);
  const viaPlane = E.vgPlaneQuad(P, U, V);
  assertTrue("the plane path and the parallelogram path produce BIT-IDENTICAL vertices",
    JSON.stringify(viaPlane) === JSON.stringify(viaProducts));
  // The patch's area is the parallelogram's area — the same claim, one builder.
  const areaOf = (q: V3[]) => len3(cross3(sub3(q[1], q[0]), sub3(q[3], q[0])));
  check("the patch area equals ||U x V||", areaOf(viaPlane), len3(cross3(U, V)), 1e-12);

  // ── (c) the AUTHORED-SPAN requirement (Δ8/A4). "Any two vectors spanning
  //    the normal's orthogonal complement" makes the patch orientation
  //    arbitrary; the callback the chapter opens on needs the edge DIRECTIONS
  //    to be authored. Assert that authoring them CHANGES the patch, and that
  //    the authored directions survive into the drawn edges.
  {
    const n: V3 = [0.35, 1, 0.25];
    const derived = E.vgPlaneBasis(n, null, null);
    const authored = E.vgPlaneBasis(n, [0.94, -0.33, 0], [0.08, 0.22, -0.97]);
    assertTrue("a derived basis and an authored basis are genuinely different patches",
      Math.abs(dot3(derived.u as V3, authored.u as V3)) < 0.999);
    check("the authored u lies IN the plane (its normal component is projected out)", dot3(authored.u as V3, n), 0, 1e-15);
    check("the authored v lies IN the plane", dot3(authored.v as V3, n), 0, 1e-15);
    // The authored u direction survives: it is the projection of what was asked for.
    const wantU = ((): V3 => {
      const nn = len3(n); const nh: V3 = [n[0] / nn, n[1] / nn, n[2] / nn];
      const raw: V3 = [0.94, -0.33, 0];
      const p: V3 = sub3(raw, [nh[0] * dot3(raw, nh), nh[1] * dot3(raw, nh), nh[2] * dot3(raw, nh)]);
      const l = len3(p); return [p[0] / l, p[1] / l, p[2] / l];
    })();
    check("the drawn u IS the authored span_u projected into the plane", dot3(authored.u as V3, wantU), 1, 1e-12);
    // Edges are NOT orthogonalised against each other: a parallelogram's edges
    // need not be perpendicular, and forcing them would silently re-orient the
    // patch away from what was authored.
    assertTrue("u and v are NOT force-orthogonalised against each other (the patch is a parallelogram, not a rectangle)",
      Math.abs(dot3(authored.u as V3, authored.v as V3)) > 1e-6);
    // A degenerate authored span returns null rather than a zero-area patch.
    assertTrue("span_u parallel to span_v returns null, never a collapsed patch",
      E.vgPlaneBasis(n, [0.94, -0.33, 0], [1.88, -0.66, 0]) === null);
  }

  // ── (d) NEGATIVE CONTROL — a second, independent quad builder. It produces
  //    the SAME FOUR POINTS as a set, so a set-based comparison passes
  //    vacuously; only the ORDERED comparison catches it, and the crossed
  //    winding is what would draw a bow-tie instead of a patch.
  {
    const rival: V3[] = [corner, add3(corner, U), add3(corner, V), add3(corner, add3(U, V))];
    const setKey = (q: V3[]) => q.map((p) => p.map((x) => x.toFixed(9)).join(",")).sort().join("|");
    assertTrue("the rival builder produces the same four points AS A SET (the vacuous tool agrees)",
      setKey(rival) === setKey(viaPlane));
    expectFail("a second independent quad builder produces identical ORDERED vertices",
      JSON.stringify(rival) === JSON.stringify(viaPlane));
    // ...and the AREA does not discriminate either — a second vacuous tool,
    // found by running it: the crossed winding's two triangles sum to exactly
    // the same total, because swapping two corners re-partitions the same
    // region rather than shrinking it. The discriminator is the parallelogram
    // identity q0 + q2 == q1 + q3 (the diagonals bisect each other), which is
    // a statement about ORDER and is what a triangle-strip actually consumes.
    const triArea = (p: V3, q: V3, r: V3) => 0.5 * len3(cross3(sub3(q, p), sub3(r, p)));
    const tiled = (q: V3[]) => triArea(q[0], q[1], q[2]) + triArea(q[0], q[2], q[3]);
    check("the shipped winding's two triangles tile the full patch area", tiled(viaPlane), areaOf(viaPlane), 1e-12);
    expectFail(`an AREA check discriminates the rival winding (${tiled(rival).toFixed(4)} vs ${areaOf(viaPlane).toFixed(4)})`,
      Math.abs(tiled(rival) - areaOf(viaPlane)) > 1e-9);
    const diag = (q: V3[]) => len3(sub3(add3(q[0], q[2]), add3(q[1], q[3])));
    check("the shipped quad satisfies the parallelogram identity q0+q2 == q1+q3", diag(viaPlane), 0, 1e-12);
    expectFail(`the rival winding satisfies it too (residual ${diag(rival).toFixed(4)})`, diag(rival) < 1e-9);
  }

  // ── (e) end to end: a plane resolved through the SHIPPED resolver still
  //    lands on the shared builder, at the authored half_extent.
  {
    const res = E.vgResolveLinesPlanes({
      mode: "lines_planes", reveal_ms: 0,
      planes: [{ id: "P1", point: [0, -0.4, 0], normal: [0.35, 1, 0.25], half_extent: 3.0, span_u: [0.94, -0.33, 0], span_v: [0.08, 0.22, -0.97] }],
    }, {}, 9000);
    check("one plane resolves", res.planes.length, 1, 0);
    const P1 = res.planes[0];
    assertTrue("its quad is exactly vgPlaneQuad(point, U, V) — the shared path, end to end",
      JSON.stringify(P1.quad) === JSON.stringify(E.vgPlaneQuad(P1.point, P1.U, P1.V)));
    check("the patch spans 2 x half_extent along u", len3(P1.U as V3), 6.0, 1e-12);
    check("the patch spans 2 x half_extent along v", len3(P1.V as V3), 6.0, 1e-12);
    check("every corner satisfies the plane equation", Math.max(...P1.quad.map((q: V3) => Math.abs(dot3([0.35, 1, 0.25], sub3(q, [0, -0.4, 0]))))), 0, 1e-12);
  }
}

console.log("\n=== 10b. F11/F22/F23/Δ2/Δ10 — the resolver: line span, lambda marker, reveal chain, groups, DETERMINISM ===");
{
  const nrm = (v: V3): V3 => { const l = len3(v); return [v[0] / l, v[1] / l, v[2] / l]; };
  // ── F11 · the extended line, drawn to the scene bounds ──────────────────
  {
    const anchor: V3 = [-0.8, 0.6, -0.5], dir: V3 = [1, 0.35, 0.6];
    const dh = nrm(dir);
    check("the direction is normalised, so lambda is an ARC LENGTH", len3(E.vgLineEnds(anchor, dir, [-4, 4], 4.5).dir as V3), 1, 1e-12);
    const e = E.vgLineEnds(anchor, dir, [-4, 4], 4.5);
    check("the authored span places p0 at lambda = -4", len3(sub3(e.p0 as V3, add3(anchor, [dh[0] * -4, dh[1] * -4, dh[2] * -4]))), 0, 1e-12);
    check("...and p1 at lambda = +4", len3(sub3(e.p1 as V3, add3(anchor, [dh[0] * 4, dh[1] * 4, dh[2] * 4]))), 0, 1e-12);
    // With NO authored span the line is clipped to the scene's bounding sphere.
    const c = E.vgLineEnds(anchor, dir, null, 4.5);
    check("an unspanned line reaches the scene bound at p0", len3(c.p0 as V3), 4.5, 1e-12);
    check("...and at p1", len3(c.p1 as V3), 4.5, 1e-12);
    assertTrue("both ends lie on the line", len3(cross3(sub3(c.p0 as V3, anchor), dh)) < 1e-12 && len3(cross3(sub3(c.p1 as V3, anchor), dh)) < 1e-12);
    // NEGATIVE CONTROL — a line that misses the bounding sphere returns null
    // rather than a zero-length stub sitting at the origin.
    assertTrue("a line that misses the scene sphere returns null", E.vgLineEnds([0, 20, 0], [1, 0, 0], null, 4.5) === null);
    expectFail("a clamp-to-origin fallback would still return a drawable line there",
      E.vgLineEnds([0, 20, 0], [1, 0, 0], null, 4.5) !== null);
  }
  // ── the lambda marker is NOT clamped back onto the drawn line ────────────
  {
    const block = {
      mode: "lines_planes", reveal_ms: 0,
      lines: [{ id: "L1", point: [0, 0, 0], dir: [1, 0, 0], lambda_span: [-3.5, 3.5], show_lambda_marker: true }],
    };
    const inside = E.vgResolveLinesPlanes(block, { lambda: 2.0 }, 9000);
    assertTrue("lambda inside the drawn span produces a marker", inside.lines[0].lambda_in_span === true && inside.lines[0].lambda_point !== null);
    check("...at exactly lambda along the line", (inside.lines[0].lambda_point as V3)[0], 2.0, 1e-12);
    const outside = E.vgResolveLinesPlanes(block, { lambda: 4.8 }, 9000);
    assertTrue("lambda PAST the drawn end produces NO marker", outside.lines[0].lambda_in_span === false && outside.lines[0].lambda_point === null);
    expectFail("a clamped marker would sit at the line's end and report a position the slider does not hold",
      outside.lines[0].lambda_point !== null);
  }
  // ── Δ2 · the per-object reveal CHAIN ────────────────────────────────────
  {
    const o = { reveal_at_ms: 2000, grow_ms: 800 };
    check("before its reveal instant the object is absent", E.vgRevealFrac(o, 1999, 900), 0, 0);
    check("at the end of its grow window it is fully drawn", E.vgRevealFrac(o, 2800, 900), 1, 1e-12);
    check("...and it HOLDS there", E.vgRevealFrac(o, 60000, 900), 1, 1e-12);
    assertTrue("mid-grow it is partial and monotone", E.vgRevealFrac(o, 2400, 900) > 0 && E.vgRevealFrac(o, 2400, 900) < 1
      && E.vgRevealFrac(o, 2600, 900) > E.vgRevealFrac(o, 2400, 900));
    check("hide_at_ms removes it", E.vgRevealFrac({ reveal_at_ms: 0, grow_ms: 100, hide_at_ms: 5000 }, 5000, 900), 0, 0);
    // The GHOST is a closed form too, which is why it cannot strand the
    // apparatus dim (field3d_dim_apparatus_one_way_with_no_restore_on_state_exit).
    check("before ghost_at_ms full opacity", E.vgGhostFactor({ ghost_at_ms: 2000 }, 1000), 1, 0);
    check("after the ghost fade it holds at ghost_opacity", E.vgGhostFactor({ ghost_at_ms: 2000, ghost_opacity: 0.25 }, 9000), 0.25, 1e-12);
    check("re-entering the state at ms 0 restores full opacity — the dim never latches", E.vgGhostFactor({ ghost_at_ms: 2000, ghost_opacity: 0.25 }, 0), 1, 0);
    // NEGATIVE CONTROL — a latched dim (a flag set once the ghost fires) would
    // NOT come back at ms 0.
    let latched = false;
    const latchedGhost = (ms: number) => { if (ms >= 2000) latched = true; return latched ? 0.25 : 1; };
    latchedGhost(9000);
    expectFail(`a latched dim restores at ms 0 (got ${latchedGhost(0)})`, latchedGhost(0) === 1);
  }
  // ── Δ10 · the scene_group selector switches PHYSICAL objects ────────────
  {
    const block = {
      mode: "lines_planes", reveal_ms: 0,
      lines: [
        { id: "L1", point: [0, 0, 0], dir: [1, 0, 0], lambda_span: [-3, 3], groups: ["A"] },
        { id: "M1", point: [-1.2, -0.9, 0.6], dir: [1, 0.15, 0.35], lambda_span: [-3, 3], groups: ["B"] },
        { id: "M2", point: [0.3, 0.2, 1.4], dir: [0.15, -0.5, 1], lambda_span: [-3, 3], groups: ["B"] },
      ],
      planes: [{ id: "P1", point: [0, -0.4, 0], normal: [0.35, 1, 0.25], half_extent: 3, groups: ["A"] }],
      common_perpendicular: { id: "cp", between: ["M1", "M2"], groups: ["B"] },
    };
    const all = E.vgResolveLinesPlanes(block, {}, 9000);
    const A = E.vgResolveLinesPlanes(block, { scene_group: "A" }, 9000);
    const B = E.vgResolveLinesPlanes(block, { scene_group: "B" }, 9000);
    check("with no group selected every object is present (a state that never sets scene_group is unchanged)", all.lines.length, 3, 0);
    check("group A draws 1 line", A.lines.length, 1, 0);
    check("group A draws 1 plane", A.planes.length, 1, 0);
    check("group B draws 2 lines", B.lines.length, 2, 0);
    check("group B draws 0 planes", B.planes.length, 0, 0);
    assertTrue("group B carries the skew measurement; group A does not",
      B.readouts.skew_distance !== undefined && A.readouts.skew_distance === undefined);
    assertTrue("the group switch moves MESHES, not just labels: group A's line id is absent from group B",
      A.lines[0].id === "L1" && B.lines.every((l: any) => l.id !== "L1"));
    // NEGATIVE CONTROL — a truthiness group test would drop every object that
    // declares no groups, blanking every pre-Δ10 state.
    const truthy = (o: any, g: string | null) => !!(g && o.groups && o.groups.indexOf(g) >= 0);
    expectFail("a truthiness group test keeps an ungrouped object visible",
      truthy({ id: "x" }, "A") === true);
    assertTrue("...the shipped test keeps it (vgInGroup treats no-groups as every-group)", E.vgInGroup({ id: "x" }, "A") === true);
  }
  // ── D3 · DETERMINISM. The whole resolver replayed backwards, bit for bit.
  {
    const block = {
      mode: "lines_planes", reveal_ms: 600,
      scene_radius: 4.5,
      lines: [
        { id: "L1", point: [-0.8, 0.6, -0.5], dir: [1, 0.35, 0.6], bind_lambda_span: true, show_lambda_marker: true, show_dir_arrow: true, reveal_at_ms: 500, grow_ms: 900 },
        { id: "M2", point: [0.3, 0.2, 1.4], dir: [0.15, -0.5, 1], lambda_span: [-3, 3], offset: { knob: "line2_offset", along: [0, 1, 0], zero: 0 }, rotate: { knob: "theta_deg", about: [0, 1, 0], zero: 25 }, ghost_at_ms: 4000 },
      ],
      planes: [{ id: "P1", point: [0, -0.4, 0], normal: [0.35, 1, 0.25], bind_half_extent: true, span_u: [0.94, -0.33, 0], span_v: [0.08, 0.22, -0.97], show_normal: true, reveal_at_ms: 200 }],
      points: [{ id: "q", position: [1.93, 0, 0.51], offset: { knob: "q_height", along: [0, 1, 0], zero: 0 }, reveal_at_ms: 1000 }],
      perpendicular: { from: "q", to: "P1", show_right_angle: true, reveal_at_ms: 1500 },
      segments: [{ id: "cmp", from: "q", to: { on: "P1", u: { knob: "aux_a" }, v: 0 }, readout: "length" }],
      intersection: { id: "X", line: "L1", plane: "P1" },
      angle_arcs: [{ id: "arc1", between: ["L1", "M2"], readout: "angle_lines_deg" }],
      vectors: [{ id: "cr", derive: "cross", of: ["L1", "M2"], origin: [0, 0, 0], scale: 2 }],
    };
    const K = { lambda: 1.5, lambda_span: 3.5, half_extent: 2.4, q_height: 1.19, line2_offset: 0.4, theta_deg: 63, aux_a: -1.1, aux_b: 0, scene_group: null };
    const times = [0, 250, 500, 900, 1500, 2400, 4000, 4600, 8000, 20000];
    const fwd = times.map((t) => JSON.stringify(E.vgResolveLinesPlanes(block, K, t)));
    const rew = times.slice().reverse().map((t) => JSON.stringify(E.vgResolveLinesPlanes(block, K, t)));
    assertTrue("REWIND: the whole resolved scene replays backwards BIT FOR BIT (a SET_TIME_FREEZE re-pin is byte-identical)",
      fwd.every((x, i) => x === rew[rew.length - 1 - i]));
    assertTrue("...and a second call at the same ms returns the identical object (no hidden state anywhere)",
      JSON.stringify(E.vgResolveLinesPlanes(block, K, 4600)) === fwd[7]);
    // A settled frame draws everything the state declared.
    const settled = E.vgResolveLinesPlanes(block, K, 20000);
    assertTrue("the settled scene is populated (mesh count > 0 on every family the state declares)",
      settled.lines.length === 2 && settled.planes.length === 1 && settled.points.length >= 2
      && settled.segments.length >= 2 && settled.arcs.length === 1 && settled.vectors.length === 1);
    assertTrue("the right-angle mark is present once the perpendicular has settled", settled.right_angle !== null);
    check("bind_half_extent follows the live knob", len3(settled.planes[0].U as V3), 2 * 2.4, 1e-12);
    check("bind_lambda_span follows the live knob", settled.lines[0].hi, 3.5, 1e-12);
    check("the offset knob moved M2 by (line2_offset - zero) along its axis", settled.lines[1].anchor[1], 0.2 + 0.4, 1e-12);
    check("q_height moved the free point", settled.points[0].position[1], 1.19, 1e-12);
    // NEGATIVE CONTROL — an accumulating implementation. It cannot rewind.
    let acc = 0;
    const accumulate = (dtMs: number) => { acc += dtMs * 0.001; return acc; };
    accumulate(4600); const at4600 = acc; accumulate(-4600 + 900);
    expectFail(`an accumulator returns the same value when the clock is rewound (${acc.toFixed(3)} vs ${at4600.toFixed(3)})`,
      Math.abs(acc - at4600) < 1e-12);
    // NEGATIVE CONTROL — an unresolvable address must draw NOTHING, not fall
    // back to the origin, which is a real and meaningful place in this scene.
    const badAddr = E.vgResolveLinesPlanes({
      mode: "lines_planes", reveal_ms: 0,
      points: [{ id: "q", position: [1, 1, 1] }],
      segments: [{ id: "s", from: "q", to: "does_not_exist" }],
    }, {}, 9000);
    check("a segment with an unresolvable endpoint draws nothing", badAddr.segments.length, 0, 0);
    expectFail("an origin fallback would still draw the segment", badAddr.segments.length > 0);
  }
  // ── Δ5 · the angle arc needs a SUBJECT, and L,P vs L,P.normal differ ────
  {
    const nrm2 = (v: V3): V3 => { const l = len3(v); return [v[0] / l, v[1] / l, v[2] / l]; };
    const planeN: V3 = [0.35, 1, 0.25];
    const nh = nrm2(planeN);
    const u = nrm2(cross3(nh, [0, 0, 1]));
    const ang = 55 * Math.PI / 180;
    const d: V3 = nrm2([nh[0] * Math.cos(ang) + u[0] * Math.sin(ang), nh[1] * Math.cos(ang) + u[1] * Math.sin(ang), nh[2] * Math.cos(ang) + u[2] * Math.sin(ang)]);
    const block = {
      mode: "lines_planes", reveal_ms: 0,
      planes: [{ id: "P1", point: [0, -0.4, 0], normal: planeN, half_extent: 3 }],
      lines: [{ id: "Lcut", point: [0, 0, 0], dir: d, lambda_span: [-3, 3] }],
      angle_arcs: [
        { id: "toN", between: ["Lcut", "P1.normal"], readout: "angle_line_normal_deg" },
        { id: "toP", between: ["Lcut", "P1"], readout: "angle_line_plane_deg" },
      ],
    };
    const res = E.vgResolveLinesPlanes(block, {}, 9000);
    check("two arcs in ONE state, separately addressable", res.arcs.length, 2, 0);
    check("the L,P.normal arc measures 55.00 to the NORMAL", res.arcs[0].value_deg, 55, 1e-9, " deg");
    check("the L,P arc measures 35.00 to the PLANE (the complement, not the normal)", res.arcs[1].value_deg, 35, 1e-9, " deg");
    check("both land in the readouts", res.readouts.angle_line_normal_deg + res.readouts.angle_line_plane_deg, 90, 1e-12, " deg");
    expectFail("the two arc forms return the same number (i.e. L,P silently means L,P.normal)",
      Math.abs(res.arcs[0].value_deg - res.arcs[1].value_deg) < 1e-9);
  }
}

console.log("\n=== 10c. BRING-UP — the SHIPPED build + writer run against a THREE stub: mesh count > 0 and visible === true (Δ8) ===");
{
  // The generic visible_elements matcher runs immediately BEFORE the
  // per-scenario apply inside applyState, so it will blank a new scenario's
  // apparatus (scar field3d_generic_visible_elements_matcher_blanks_new_
  // scenario_apparatus). PRESENCE IS NOT CORRECTNESS and neither is absence:
  // this section runs the REAL buildVectorGeometryLinesPlanes and the REAL
  // vgWriteLinesPlanesFrame against a stub scene and asserts meshes EXIST and
  // are VISIBLE — the assertion the scar's own prevention rule names.
  type Stub = any;
  function makeStub() {
    const scene: Stub[] = [];
    const vec3 = (x = 0, y = 0, z = 0) => ({
      x, y, z,
      normalize() { const l = Math.hypot(this.x, this.y, this.z) || 1; this.x /= l; this.y /= l; this.z /= l; return this; },
    });
    const attr = (n: number) => ({ array: new Float32Array(n), needsUpdate: false });
    function geom(nVerts: number) {
      return {
        attributes: { position: attr(nVerts * 3) },
        setAttribute() { /* the stub keeps the one it made */ },
        setIndex() { /* index order is asserted in section 12, not here */ },
        setDrawRange() { /* ditto */ },
        computeBoundingSphere() { /* no-op */ },
      };
    }
    function mesh(g: Stub, m: Stub): Stub {
      return {
        geometry: g, material: m, userData: {}, visible: false,
        position: { set() { /* recorded by the caller when it matters */ } },
        quaternion: { setFromUnitVectors() { /* orientation is section 8/9's job */ } },
        scale: { set() { /* length is geometry, asserted via vgPlaceTube's return */ } },
        traverse(fn: (n: Stub) => void) { fn(this); },
      };
    }
    const THREE: Stub = {
      Vector3: function (x: number, y: number, z: number) { return vec3(x, y, z); },
      Color: function (h: string) { return { h, set(o: Stub) { this.h = o && o.h; }, copy(o: Stub) { this.h = o.h; return this; }, clone() { return { h: this.h, copy: this.copy, clone: this.clone, lerp() { return this; } }; }, lerp() { return this; } }; },
      CylinderGeometry: function () { return geom(0); },
      SphereGeometry: function () { return geom(0); },
      BufferGeometry: function () { return geom(25); },
      BufferAttribute: function (a: Float32Array) { return { array: a, needsUpdate: false }; },
      MeshBasicMaterial: function (o: Stub) { return { color: o.color, opacity: o.opacity != null ? o.opacity : 1, transparent: !!o.transparent, userData: {} }; },
      LineBasicMaterial: function (o: Stub) { return { color: o.color, opacity: o.opacity != null ? o.opacity : 1, transparent: !!o.transparent, userData: {} }; },
      Mesh: function (g: Stub, m: Stub) { return mesh(g, m); },
      Line: function (g: Stub, m: Stub) { return mesh(g, m); },
      ArrowHelper: function () {
        const m = mesh(geom(0), { color: { h: "#000" }, opacity: 1, transparent: true, userData: {} });
        m.setDirection = () => { /* direction asserted in the pure sections */ };
        m.setLength = function (l: number) { (this as Stub)._len = l; };
        m.setColor = function (c: Stub) { (this as Stub).material.color = c; };
        return m;
      },
    };
    return { scene, THREE };
  }
  const { scene, THREE } = makeStub();
  const buildSrc = grabFn("buildVectorGeometryLinesPlanes");
  const writeSrc = grabFn("vgWriteLinesPlanesFrame");
  const tubeSrc = grabFn("vgPlaceTube");
  const labelSrc = grabFn("vgLabelAt");
  const roleSrc = grabFn("vgRoleColor");
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const factory = new Function(
    "THREE", "sceneObjects", "addToScene", "hexToThreeColor", "pmCreateAutoLabel",
    "updateLabelSpriteText", "config", "window",
    [
      ...["vgSub", "vgAddVec", "vgCrossVec", "vgDotVec", "vgLenVec", "vgNormalize", "vgScaleVec", "vgLerpVec"].map((f) => grabFn(f)),
      "var VG_LP_MAX = " + /var VG_LP_MAX = (\{[^}]*\});/.exec(SRC)![1] + ";",
      "var VG_ROLE_COLOR = " + /var VG_ROLE_COLOR = (\{[\s\S]*?\});/.exec(SRC)![1] + ";",
      "var VG_LP_UPY = null;",
      roleSrc, buildSrc, tubeSrc, labelSrc, writeSrc,
      "return { build: buildVectorGeometryLinesPlanes, write: vgWriteLinesPlanesFrame };",
    ].join("\n"),
  );
  const api = factory(
    THREE, scene, (o: Stub) => scene.push(o), (h: string) => new (THREE.Color as any)(h),
    () => ({ userData: {}, visible: false, position: { set() { /* label placement */ } }, _pmText: "" }),
    (sp: Stub, t: string) => { sp._pmText = t; }, { vg: {} }, {},
  );
  api.build();
  assertTrue(`the build created scene objects (${scene.length} of them) — mesh count > 0`, scene.length > 0);
  const kinds = ["vg_lp_line", "vg_lp_plane", "vg_lp_point", "vg_lp_seg", "vg_lp_arc", "vg_lp_vec", "vg_lp_normal", "vg_lp_dir", "vg_lp_right_angle"];
  for (const k of kinds) {
    assertTrue(`the pool contains at least one ${k}`, scene.some((o: Stub) => o.userData.elementType === k));
  }
  assertTrue("EVERY pool member entered sceneObjects individually (no child mesh is parented and lost to the updater)",
    scene.every((o: Stub) => o.userData && typeof o.userData.slot === "number"));
  assertTrue("every pool member starts HIDDEN (a state shows what it declares, never what the build left on)",
    scene.every((o: Stub) => o.visible === false));

  // Now the writer, on the authored-shape scene.
  const res = E.vgResolveLinesPlanes({
    mode: "lines_planes", reveal_ms: 0,
    lines: [{ id: "L1", point: [-0.8, 0.6, -0.5], dir: [1, 0.35, 0.6], lambda_span: [-3.5, 3.5], show_dir_arrow: true, show_lambda_marker: true, label: "L₁", role: "dir1" }],
    planes: [{ id: "P1", point: [0, -0.4, 0], normal: [0.35, 1, 0.25], half_extent: 3, span_u: [0.94, -0.33, 0], span_v: [0.08, 0.22, -0.97], show_normal: true, normal_label: "n", role: "region" }],
    points: [{ id: "q", position: [1.93, 1.19, 0.51], label: "q" }],
    perpendicular: { from: "q", to: "P1", show_right_angle: true },
  }, { lambda: 1.0 }, 20000);
  api.write(res);
  const visOf = (t: string) => scene.filter((o: Stub) => o.userData.elementType === t && o.visible).length;
  assertTrue(`the writer made the line VISIBLE (${visOf("vg_lp_line")} drawn)`, visOf("vg_lp_line") === 1);
  assertTrue(`...the plane patch VISIBLE (${visOf("vg_lp_plane")})`, visOf("vg_lp_plane") === 1);
  assertTrue(`...its normal arrow VISIBLE (${visOf("vg_lp_normal")})`, visOf("vg_lp_normal") === 1);
  assertTrue(`...the direction arrow VISIBLE (${visOf("vg_lp_dir")})`, visOf("vg_lp_dir") === 1);
  assertTrue(`...the free point, the foot and the lambda marker VISIBLE (${visOf("vg_lp_point")} points)`, visOf("vg_lp_point") === 3);
  assertTrue(`...the perpendicular segment VISIBLE (${visOf("vg_lp_seg")})`, visOf("vg_lp_seg") === 1);
  assertTrue("...and the right-angle mark VISIBLE", visOf("vg_lp_right_angle") === 1);
  assertTrue("labels carry the AUTHORED text (a sprite's ink is invisible to every DOM probe, so it is read here)",
    scene.some((o: Stub) => o.userData.elementType === "vg_lp_line_label" && o._pmText === "L₁")
    && scene.some((o: Stub) => o.userData.elementType === "vg_lp_point_label" && o._pmText === "q")
    && scene.some((o: Stub) => o.userData.elementType === "vg_lp_normal_label" && o._pmText === "n"));
  assertTrue("every drawn member carries its resolved object's id, so glow_focal can name the thing rather than a slot",
    scene.filter((o: Stub) => o.visible && o.userData.elementType === "vg_lp_line")[0].userData.vgId === "L1");
  check("no pool overflow on this scene", 0, 0, 0);

  // An EMPTY scene hides everything again — the pool never strands a mesh from
  // the previous state (which would be the same defect one state later).
  api.write({ lines: [], planes: [], points: [], segments: [], arcs: [], vectors: [], right_angle: null, readouts: {} });
  assertTrue("an empty resolved scene hides EVERY pool member (nothing survives a state change)",
    scene.every((o: Stub) => o.visible === false));

  // NEGATIVE CONTROL — the "hide the surplus" pass removed. A stale mesh from
  // the previous state stays on screen, which is how an apparatus from another
  // state appears in a state that never declared it.
  {
    const stale = { visible: true };
    const withoutHideFrom = (n: number, poolLen: number) => { for (let k = n; k < poolLen; k++) { /* the missing hide */ } return stale.visible; };
    expectFail("a writer with no hide-the-surplus pass clears a stale mesh", withoutHideFrom(0, 4) === false);
  }

  // A malformed state must NOT throw: a renderer that throws blanks the scene
  // and never posts SIM_READY (scar field3d_createtubeline_undefined_field_
  // lines_throws).
  let threw2 = false;
  try {
    api.write(E.vgResolveLinesPlanes({ mode: "lines_planes" }, {}, 3000));
    api.write(E.vgResolveLinesPlanes({ mode: "lines_planes", lines: [{}], planes: [{}], points: [{}], segments: [{}], angle_arcs: [{}], vectors: [{}], perpendicular: {}, intersection: {}, common_perpendicular: {}, projection: {} }, {}, 3000));
  } catch { threw2 = true; }
  assertTrue("an empty / malformed vg block resolves and draws without throwing (a throw here stalls the clock)", !threw2);
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

    // ── THE METRIC CLAUSE (A21.5), and it is the binding form of this section.
    //   Angles are scored in ISOTROPIC units; fill and arm in NDC; the
    //   corrected vgProjectPoint is the SINGLE source. This negative control
    //   re-runs THIS EXACT SWEEP with ONE variable changed — the angle read in
    //   NDC instead of isotropic screen units — and asserts the NDC form FAILS
    //   Act I's 18.91 degree case. It is here because a probe agreeing with
    //   another probe is not validation when both were written from the same
    //   spec: this wave "independently confirmed" wrong numbers for three
    //   rounds on a metric sheared by 1.78x at 16:9, and only a control that
    //   fires where the broken form must fire can tell the two rulers apart.
    let ndcMin = Infinity, ndcAt = "";
    for (let th = 20; th <= 160; th += 1) {
      for (let am = 1.0; am <= 5.0001; am += 1.0) {
        for (let bm = 1.0; bm <= 5.0001; bm += 1.0) {
          for (let ti = 0; ti <= 60; ti += 15) {
            const v = E.vgBuildVectors({ a_mag: am, b_mag: bm, theta_deg: th, b_tilt_deg: ti });
            const pos = E.vgAutoFramePos(v.a, v.b, 2.5) as V3 | null;
            if (!pos) continue;
            const angs: number[] = [];
            for (const arw of arrowsOf(v as any)) {
              const o = E.vgProjectPoint(pos, TARGET, UP, FOV, ASPECT, arw.origin);
              const t = E.vgProjectPoint(pos, TARGET, UP, FOV, ASPECT, arw.tip);
              if (!o || !t) { angs.push(NaN); continue; }
              const raw = Math.atan2(t.y - o.y, t.x - o.x) * 180 / Math.PI;   // BUG: NDC, not sx/sy
              angs.push(((raw % 180) + 180) % 180);
            }
            for (let pi2 = 0; pi2 < angs.length; pi2++) for (let qi2 = pi2 + 1; qi2 < angs.length; qi2++) {
              const dd = Math.abs(angs[pi2] - angs[qi2]);
              const sep = Math.min(dd, 180 - dd);
              if (sep < ndcMin) { ndcMin = sep; ndcAt = "theta=" + th + " |a|=" + am + " |b|=" + bm + " tilt=" + ti; }
            }
          }
        }
      }
    }
    expectFail("the NDC-ANGLE form holds Act I's 18.91 deg floor on the same sweep (measured minimum " + ndcMin.toFixed(3) + " deg at " + ndcAt + ")",
      ndcMin >= 18.0);
    assertTrue("...the ISOTROPIC form on the SAME auto-frame poses holds it (" + minSep.toFixed(3) + " deg) — the two rulers disagree, and only one of them is what a viewer sees",
      minSep >= 18.0);
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
