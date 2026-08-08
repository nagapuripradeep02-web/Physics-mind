/**
 * check:vector-products — headless verification of the vector_products_in_space
 * engine family on `field_3d_renderer.ts` (bug_class
 * field3d_no_generic_two_vector_scenario — dot & cross product in 3D,
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
 * Sections:
 *   1. vpBuildVectors — a always along +x, b in the xy-plane at theta_deg,
 *      c a genuine 3D vector via its own spherical angles.
 *   2. vpCrossVec/vpDotVec — |a x b| = |a||b|sin(theta), a.b = |a||b|cos(theta).
 *   3. E2 — vpParallelogramVerts: the drawn quad's AREA equals |a x b|, and
 *      tracks it MONOTONICALLY as |b| sweeps its authored range.
 *   4. E3 — vpParallelepipedFaces: the drawn solid's VOLUME (via a tetrahedral
 *      decomposition, independent of the renderer's triangle indices) equals
 *      |a.(b x c)|, and the solid CLOSES (every adjacent face pair shares an
 *      edge with byte-identical vertex coordinates) across an authored sweep
 *      of c (c_mag / c_theta_deg / c_phi_deg).
 *   5. Camera mechanism — the per-state `camera_position` -> animateCameraTo()
 *      path in applyState() is GENERIC (top-level, never gated behind
 *      `config.scenario_type === "vector_products_in_space"` or any other
 *      scenario_type), so every authored state of this NEW scenario gets a
 *      distinct pose + a smooth eased transition for free.
 *   6. vpProjectPoint / vpPairwiseScreenSeparationDeg — the scar-mandated
 *      PAIRWISE screen-separation metric (bug_class
 *      camera_metric_scored_foreshortening_not_pairwise_screen_separation):
 *      reproduces the founder's own reported defects (a true 90 degrees
 *      rendering foreshortened; b and a x b projecting onto the same screen
 *      line at theta=35 degrees) and demonstrates a per-object foreshortening
 *      margin — the OLD, insufficient metric this bug_class exists to
 *      retire — passes vacuously on exactly that defect.
 *
 * Every section carries a NEGATIVE CONTROL — a gate that has never failed is
 * not known to work (dispatch mandate). Negative controls are demonstrated
 * against a deliberately-broken alternative computed IN THIS FILE, never
 * against the shipped renderer (the renderer is never mutated to fail), and
 * are run and shown to FAIL before the corresponding positive assertion.
 *
 *   npm run check:vector-products
 */
import { FIELD_3D_RENDERER_CODE } from "../lib/renderers/field_3d_renderer";

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
  "vpSub", "vpAddVec", "vpCrossVec", "vpDotVec", "vpLenVec", "vpNormalize",
  "vpTranslateVerts", "vpBuildVectors", "vpParallelogramVerts",
  "vpParallelepipedFaces", "vpProjectPoint", "vpPairwiseScreenSeparationDeg",
];

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const E = new Function([
  ...FNS.map((f) => grabFn(f)),
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

console.log("\n=== 1. vpBuildVectors — a along +x, b in the xy-plane at theta_deg, c via its own spherical angles ===");
{
  const vec = E.vpBuildVectors({ a_mag: 2.5, b_mag: 2.0, theta_deg: 60, c_mag: 1.8, c_theta_deg: 55, c_phi_deg: 200 });
  check("a.x", vec.a[0], 2.5, 1e-9);
  check("a.y", vec.a[1], 0, 1e-9);
  check("a.z", vec.a[2], 0, 1e-9);
  const thetaRad = 60 * Math.PI / 180;
  check("b.x = |b|cos(theta)", vec.b[0], 2.0 * Math.cos(thetaRad), 1e-9);
  check("b.y = |b|sin(theta)", vec.b[1], 2.0 * Math.sin(thetaRad), 1e-9);
  check("b.z", vec.b[2], 0, 1e-9);
  // c is genuinely 3D (non-zero in all three axes for a generic (theta_c, phi_c)).
  assertTrue("c has non-zero x, y AND z (a genuine 3D vector, not confined to a plane)",
    Math.abs(vec.c[0]) > 1e-6 && Math.abs(vec.c[1]) > 1e-6 && Math.abs(vec.c[2]) > 1e-6);
  check("|c| == c_mag", len3(vec.c as V3), 1.8, 1e-9);
  check("|a| == a_mag", len3(vec.a as V3), 2.5, 1e-9);
  check("|b| == b_mag", len3(vec.b as V3), 2.0, 1e-9);

  // Defaults resolve when a field is omitted (never NaN / undefined leaking
  // into a THREE.Vector3.setLength()).
  const defs = E.vpBuildVectors({});
  assertTrue("vpBuildVectors({}) returns finite defaults for a/b/c",
    [...defs.a, ...defs.b, ...defs.c].every((n: number) => Number.isFinite(n)));

  // NEGATIVE CONTROL — a plausible-but-wrong builder that puts `a` along +y
  // instead of +x (design intent: "a is pinned along +x"). Written here only,
  // never shipped. The assertion this section exists to make ("a.y ~ 0")
  // correctly FAILS against it.
  const wrongA: V3 = [0, 2.5, 0];
  expectFail("a wrongly along +y would still satisfy 'a.y ~ 0'", Math.abs(wrongA[1] - 0) < 1e-9);
  assertTrue("the shipped vpBuildVectors does NOT share that defect", Math.abs(vec.a[1] - 0) < 1e-9);
}

console.log("\n=== 2. vpCrossVec / vpDotVec — |a x b| = |a||b|sin(theta), a.b = |a||b|cos(theta) ===");
{
  for (const theta of [10, 35, 60, 90, 120, 150]) {
    const vec = E.vpBuildVectors({ a_mag: 2.5, b_mag: 2.0, theta_deg: theta });
    const axb = E.vpCrossVec(vec.a, vec.b);
    const ab = E.vpDotVec(vec.a, vec.b);
    const thetaRad = theta * Math.PI / 180;
    check(`theta=${theta}: |a x b| = |a||b|sin(theta)`, E.vpLenVec(axb), 2.5 * 2.0 * Math.sin(thetaRad), 1e-9);
    check(`theta=${theta}: a.b = |a||b|cos(theta)`, ab, 2.5 * 2.0 * Math.cos(thetaRad), 1e-9);
  }
  // a x b runs along +/-z by construction (a, b confined to the xy-plane).
  const vec90 = E.vpBuildVectors({ a_mag: 2.5, b_mag: 2.0, theta_deg: 90 });
  const axb90 = E.vpCrossVec(vec90.a, vec90.b);
  check("theta=90: a x b .x", axb90[0], 0, 1e-9);
  check("theta=90: a x b .y", axb90[1], 0, 1e-9);
  check("theta=90: a x b .z = |a||b|", axb90[2], 5.0, 1e-9);

  // NEGATIVE CONTROL — a wrong "magnitude-only" cross-product stand-in that
  // ignores theta entirely (always returns |a||b|, the classic dot/cross
  // confusion). Demonstrated to disagree with the shipped |a x b| at theta=35
  // (a non-multiple-of-90 angle, so sin(theta) != 1 and the defect is real,
  // not accidentally masked).
  const vec35 = E.vpBuildVectors({ a_mag: 2.5, b_mag: 2.0, theta_deg: 35 });
  const wrongMagOnly = 2.5 * 2.0; // BUG: ignores sin(theta)
  const trueCrossMag = E.vpLenVec(E.vpCrossVec(vec35.a, vec35.b));
  expectFail("magnitude-only stand-in (|a||b|, ignoring theta) matches the true |a x b| at theta=35",
    Math.abs(wrongMagOnly - trueCrossMag) < 1e-6);
}

console.log("\n=== 3. E2 — vpParallelogramVerts: drawn quad AREA == |a x b|, monotonic in |b| ===");
{
  // Shoelace-free planar-quad area via two triangles in the SAME winding the
  // renderer draws (indices [0,1,2] and [0,2,3] — see buildVectorProductsInSpace).
  function quadArea(v: V3[]): number {
    const t1 = 0.5 * len3(cross3(sub3(v[1], v[0]), sub3(v[2], v[0])));
    const t2 = 0.5 * len3(cross3(sub3(v[2], v[0]), sub3(v[3], v[0])));
    return t1 + t2;
  }
  const vec = E.vpBuildVectors({ a_mag: 2.5, b_mag: 2.0, theta_deg: 60 });
  const verts: V3[] = E.vpParallelogramVerts(vec.a, vec.b);
  check("quad vertex[0] is the ORIGIN", len3(verts[0]), 0, 1e-9);
  check("quad vertex[1] == a", len3(sub3(verts[1], vec.a as V3)), 0, 1e-9);
  check("quad vertex[2] == a+b", len3(sub3(verts[2], add3(vec.a as V3, vec.b as V3))), 0, 1e-9);
  check("quad vertex[3] == b", len3(sub3(verts[3], vec.b as V3)), 0, 1e-9);
  const area = quadArea(verts);
  const trueCrossMag = E.vpLenVec(E.vpCrossVec(vec.a, vec.b));
  check("drawn quad area == |a x b|", area, trueCrossMag, 1e-9);

  // Monotonic sweep: holding a_mag/theta fixed, area must strictly increase
  // as |b| sweeps its authored slider range [0.5, 4.0].
  const bSweep = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
  const areas = bSweep.map((bMag) => {
    const v = E.vpBuildVectors({ a_mag: 2.5, b_mag: bMag, theta_deg: 60 });
    return quadArea(E.vpParallelogramVerts(v.a, v.b));
  });
  let strictlyIncreasing = true;
  for (let i = 1; i < areas.length; i++) if (!(areas[i] > areas[i - 1])) strictlyIncreasing = false;
  assertTrue(`drawn area is STRICTLY increasing as |b| sweeps [0.5..4.0] (areas: ${areas.map((a) => a.toFixed(3)).join(", ")})`, strictlyIncreasing);
  // And it tracks |a x b| exactly at every sweep point, not just qualitatively.
  let allTrackExactly = true;
  bSweep.forEach((bMag, i) => {
    const v = E.vpBuildVectors({ a_mag: 2.5, b_mag: bMag, theta_deg: 60 });
    const trueMag = E.vpLenVec(E.vpCrossVec(v.a, v.b));
    if (Math.abs(areas[i] - trueMag) > 1e-9) allTrackExactly = false;
  });
  assertTrue("every sweep point's drawn area matches |a x b| to 1e-9", allTrackExactly);

  // NEGATIVE CONTROL — a plausible real-world mistake: the fourth vertex is
  // mistakenly left at the ORIGIN instead of being translated by b (as if a
  // implementer forgot `vpAddVec` on the third vertex and reused v0). Written
  // here only, never shipped. This collapses two of the four "corners" onto
  // each other, so the two-triangle area formula does NOT reproduce |a x b|.
  const forgotB: V3[] = [[0, 0, 0], vec.a as V3, [0, 0, 0], vec.b as V3];
  const forgotBArea = quadArea(forgotB);
  expectFail("a vertex[2] mistakenly left at the origin (forgot to add b) still gives the correct |a x b| area",
    Math.abs(forgotBArea - trueCrossMag) < 1e-9);
  assertTrue("the shipped vertex order [O,a,a+b,b] does NOT share that defect", Math.abs(area - trueCrossMag) < 1e-9);
}

console.log("\n=== 4. E3 — vpParallelepipedFaces: drawn solid VOLUME == |a.(b x c)|, and CLOSES across c's sweep ===");
{
  const vec = E.vpBuildVectors({ a_mag: 2.2, b_mag: 1.7, theta_deg: 70, c_mag: 1.9, c_theta_deg: 50, c_phi_deg: 210 });
  const faces: V3[][] = E.vpParallelepipedFaces(vec.a, vec.b, vec.c);
  check("vpParallelepipedFaces returns exactly 6 faces", faces.length, 6, 0);
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
  const trueVol = Math.abs(E.vpDotVec(vec.a, E.vpCrossVec(vec.b, vec.c)));
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
  // The known adjacency of this face ordering (see vpParallelepipedFaces'
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
    const v = E.vpBuildVectors({ a_mag: 2.2, b_mag: 1.7, theta_deg: 70, ...cSample });
    const fSet: V3[][] = E.vpParallelepipedFaces(v.a, v.b, v.c);
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
  const vBroken = E.vpBuildVectors({ a_mag: 2.2, b_mag: 1.7, theta_deg: 70, c_mag: 1.8, c_theta_deg: 55, c_phi_deg: 200 });
  const brokenFaces: V3[][] = (E.vpParallelepipedFaces(vBroken.a, vBroken.b, vBroken.c) as V3[][]).map((f: V3[], idx: number) =>
    idx === 1 ? f.map((v: V3) => [v[0] + 0.01, v[1], v[2]] as V3) : f); // idx 1 = "top" face, nudged
  let brokenSharedPairs = 0;
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (facesShareAnEdge(brokenFaces[i], brokenFaces[j])) brokenSharedPairs++;
  expectFail(`a top-face-nudged-by-0.01 solid still closes with 12 shared-edge pairs (got ${brokenSharedPairs})`, brokenSharedPairs === 12);
}

console.log("\n=== 5. Camera mechanism — per-state camera_position -> animateCameraTo() is GENERIC, never scenario-gated ===");
{
  assertTrue("animateCameraTo() exists in the shipped renderer", SRC.indexOf("function animateCameraTo(") >= 0);
  assertTrue("lerpSpherical() exists in the shipped renderer", SRC.indexOf("function lerpSpherical(") >= 0);

  const applyStateBody = grabFn("applyState");
  const marker = "if (stateDef.camera_position) {";
  const markerIdx = applyStateBody.indexOf(marker);
  assertTrue("applyState() contains the generic camera_position block", markerIdx >= 0);
  assertTrue("applyState() calls animateCameraTo(stateDef.camera_position) exactly once",
    (applyStateBody.match(/animateCameraTo\(stateDef\.camera_position\)/g) || []).length === 1);

  // Brace-depth walk: confirm the marker sits at depth 1 relative to
  // applyState's OWN opening brace — i.e. a direct sibling statement of the
  // function body, NOT nested inside any `if (config.scenario_type === ...)`
  // (or any other) conditional. depth 1 == "one level inside applyState's
  // own { }", the depth every other top-level per-scenario dispatch (e.g.
  // the rhr_force_direction / vector_products_in_space blocks) also sits at.
  function depthAt(src: string, idx: number): number {
    const bodyStart = src.indexOf("{");
    let depth = 0;
    for (let j = bodyStart; j < idx; j++) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}") depth--;
    }
    return depth; // depth AFTER consuming applyState's own opening brace == 1 at top level
  }
  const camDepth = depthAt(applyStateBody, markerIdx);
  check("camera_position block sits at brace-depth 1 (top-level in applyState, not nested in a scenario gate)", camDepth, 1, 0);

  // Cross-check against a KNOWN scenario-gated dispatch line in the SAME
  // function (the vector_products_in_space apply call this dispatch just
  // added) — it sits at the SAME depth 1 (a sibling statement), confirming
  // depth 1 is genuinely "top-level dispatch", not an artifact of this one
  // block's position.
  const vpApplyMarker = 'if (config.scenario_type === "vector_products_in_space") {';
  const vpApplyIdx = applyStateBody.indexOf(vpApplyMarker);
  assertTrue("applyState() dispatches vector_products_in_space's own apply fn", vpApplyIdx >= 0);
  check("the vp scenario-gated dispatch ALSO sits at depth 1 (both are top-level siblings)", depthAt(applyStateBody, vpApplyIdx), 1, 0);

  // NEGATIVE CONTROL — a synthetic function string where camera_position IS
  // nested one level inside a scenario_type gate. Prove the SAME depth-walk
  // tool used above correctly reports depth 2 for it (never silently
  // reports 1) — i.e. the tool actually discriminates nested vs top-level,
  // it is not vacuously reporting 1 for everything.
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
}

console.log("\n=== 6. vpProjectPoint / vpPairwiseScreenSeparationDeg — the scar-mandated PAIRWISE metric ===");
{
  // Reproduce the renderer's own spherical camera model: az/el/dist -> world
  // position, camera always looks at the origin, up = +y (see
  // updateCameraFromSpherical / animateCameraTo in this same file).
  function camPosFromAzEl(azDeg: number, elDeg: number, dist: number): V3 {
    const theta = azDeg * Math.PI / 180;
    const phi = Math.PI / 2 - elDeg * Math.PI / 180;
    return [dist * Math.sin(phi) * Math.cos(theta), dist * Math.cos(phi), dist * Math.sin(phi) * Math.sin(theta)];
  }
  const FOV = 60, ASPECT = 16 / 9, TARGET: V3 = [0, 0, 0], UP: V3 = [0, 1, 0];

  // The founder's own repro #1: at az=35, el=30, a TRUE 90-degree angle
  // between a and b renders foreshortened. We don't re-derive the exact
  // 125.2-degree figure (that was measured against the full 3D-hand overlay,
  // not this scenario) — instead we prove the METRIC ITSELF is sensitive:
  // the on-screen angle between a's and b's drawn directions differs
  // measurably from their true 3D angle at this pose.
  {
    const vec90 = E.vpBuildVectors({ a_mag: 2.5, b_mag: 2.0, theta_deg: 90 });
    const camPos = camPosFromAzEl(35, 30, 9);
    const vecs = [
      { id: "a", origin: [0, 0, 0], tip: vec90.a },
      { id: "b", origin: [0, 0, 0], tip: vec90.b },
    ];
    const pairs = E.vpPairwiseScreenSeparationDeg(camPos, TARGET, UP, FOV, ASPECT, vecs);
    check("exactly 1 pair for 2 vectors (C(2,2)=1)", pairs.length, 1, 0);
    assertTrue(`az=35/el=30: true 90-degree (a,b) angle projects to a DIFFERENT on-screen separation (got ${pairs[0].sepDeg.toFixed(1)} degrees) — the metric is sensitive to foreshortening`,
      Math.abs(pairs[0].sepDeg - 90) > 1);
  }

  // The founder's own repro #2: at theta=35 (a,b angle), b and a x b are
  // PERPENDICULAR in true 3D (any two orthogonal vectors are), but at az=35/
  // el=30 project onto the SAME screen line. This is the literal defect the
  // pairwise metric is built to catch — assert sepDeg is small (near-
  // collinear) at the reported pose.
  {
    const vec35 = E.vpBuildVectors({ a_mag: 2.5, b_mag: 2.0, theta_deg: 35 });
    const axb = E.vpCrossVec(vec35.a, vec35.b);
    // b and a x b ARE perpendicular in true 3D — sanity-check the fixture itself.
    check("fixture sanity: b . (a x b) == 0 (true 3D perpendicularity)", E.vpDotVec(vec35.b, axb), 0, 1e-9);

    const camPos = camPosFromAzEl(35, 30, 9);
    const vecs = [
      { id: "b", origin: [0, 0, 0], tip: vec35.b },
      { id: "axb", origin: [0, 0, 0], tip: axb },
    ];
    const pairs = E.vpPairwiseScreenSeparationDeg(camPos, TARGET, UP, FOV, ASPECT, vecs);
    assertTrue(`az=35/el=30, theta=35: b and a x b (perpendicular in 3D) collapse toward the SAME screen line (sepDeg=${pairs[0].sepDeg.toFixed(2)}, expected small)`,
      pairs[0].sepDeg < 15);

    // A DIFFERENT pose must NOT reproduce the same defect — proves the
    // metric can also PASS a genuinely good pose, not just fail on demand.
    const goodCamPos = camPosFromAzEl(70, 55, 9);
    const goodPairs = E.vpPairwiseScreenSeparationDeg(goodCamPos, TARGET, UP, FOV, ASPECT, vecs);
    assertTrue(`az=70/el=55, theta=35: b and a x b are well-separated on screen (sepDeg=${goodPairs[0].sepDeg.toFixed(2)}, expected > 30)`,
      goodPairs[0].sepDeg > 30);
  }

  // PAIRWISE, not per-object — every unique pair among N rendered vectors is
  // checked (C(4,2)=6 for a, b, c, a x b), never just adjacent ones.
  {
    const vec = E.vpBuildVectors({ a_mag: 2.5, b_mag: 2.0, theta_deg: 60, c_mag: 1.8, c_theta_deg: 55, c_phi_deg: 200 });
    const axb = E.vpCrossVec(vec.a, vec.b);
    const vecs = [
      { id: "a", origin: [0, 0, 0], tip: vec.a }, { id: "b", origin: [0, 0, 0], tip: vec.b },
      { id: "c", origin: [0, 0, 0], tip: vec.c }, { id: "axb", origin: [0, 0, 0], tip: axb },
    ];
    const camPos = camPosFromAzEl(50, 40, 9);
    const pairs = E.vpPairwiseScreenSeparationDeg(camPos, TARGET, UP, FOV, ASPECT, vecs);
    check("4 vectors -> exactly C(4,2)=6 pairs checked", pairs.length, 6, 0);
    const seenIds = new Set<string>();
    pairs.forEach((p: { pair: string }) => p.pair.split("|").forEach((id) => seenIds.add(id)));
    check("every one of the 4 vectors appears in at least one pair", seenIds.size, 4, 0);
  }

  // NEGATIVE CONTROL — the exact scar this metric retires: a PER-OBJECT
  // foreshortening margin (each vector's OWN drawn screen length vs a
  // minimum-pixels threshold), which is what a naive check would use
  // instead. Demonstrate it passes VACUOUSLY on the theta=35/az=35/el=30
  // collinearity defect above (both b and a x b individually have plenty of
  // on-screen length — the defect is entirely in their RELATIVE direction,
  // which a per-object check never looks at).
  {
    const vec35 = E.vpBuildVectors({ a_mag: 2.5, b_mag: 2.0, theta_deg: 35 });
    const axb = E.vpCrossVec(vec35.a, vec35.b);
    const camPos = camPosFromAzEl(35, 30, 9);
    function perObjectScreenLen(tip: V3): number {
      const pO = E.vpProjectPoint(camPos, TARGET, UP, FOV, ASPECT, [0, 0, 0]);
      const pT = E.vpProjectPoint(camPos, TARGET, UP, FOV, ASPECT, tip);
      if (!pO || !pT) return 0;
      return Math.sqrt((pT.x - pO.x) ** 2 + (pT.y - pO.y) ** 2);
    }
    const lenB = perObjectScreenLen(vec35.b);
    const lenAxb = perObjectScreenLen(axb);
    const MIN_SCREEN_LEN = 0.05; // a plausible "foreshortening margin" threshold
    const perObjectPasses = lenB > MIN_SCREEN_LEN && lenAxb > MIN_SCREEN_LEN;
    // ok = "did the per-object check correctly CATCH the defect (i.e. NOT
    // vacuously pass)" — it is expected to be FALSE (the whole point of this
    // negative control), so expectFail should report PASS (caught the
    // intended failure mode) exactly when perObjectPasses is true.
    expectFail("a per-object foreshortening margin (each vector's own screen length > threshold) catches the b/(a x b) collinearity defect",
      !perObjectPasses);
    // The pairwise metric, run on the SAME configuration, DOES catch it (already shown above) —
    // re-assert here for direct side-by-side contrast in the log.
    const pairs = E.vpPairwiseScreenSeparationDeg(camPos, TARGET, UP, FOV, ASPECT, [
      { id: "b", origin: [0, 0, 0], tip: vec35.b }, { id: "axb", origin: [0, 0, 0], tip: axb },
    ]);
    assertTrue(`the PAIRWISE metric on the same configuration correctly flags it (sepDeg=${pairs[0].sepDeg.toFixed(2)} < 15)`, pairs[0].sepDeg < 15);
  }

  // Degenerate handling — a zero-length vector (origin == tip) is reported
  // as degenerate, never silently given a fake angle.
  {
    const camPos = camPosFromAzEl(40, 40, 9);
    const pairs = E.vpPairwiseScreenSeparationDeg(camPos, TARGET, UP, FOV, ASPECT, [
      { id: "zero", origin: [0, 0, 0], tip: [0, 0, 0] }, { id: "a", origin: [0, 0, 0], tip: [2.5, 0, 0] },
    ]);
    assertTrue("a zero-length vector pair is flagged degenerate, not given a fabricated separation", pairs[0].degenerate === true);
  }
}

console.log(`\n${failures === 0 ? "ALL SECTIONS PASSED" : `${failures} ASSERTION(S) FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
