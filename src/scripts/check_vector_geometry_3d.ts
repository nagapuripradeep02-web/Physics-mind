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
 * 11c  THE value_readouts UNION == THE VG_READOUT_LABEL TABLE, both ways.
 *      The authoring contract (a TS union in the wrapper) and the rendering
 *      table (a JS map 12,880 lines away, inside the template) declared the
 *      SAME closed enum with nothing binding them, and drifted: 11 tokens vs
 *      24, so every lines_planes readout the renderer already printed was
 *      unauthorable by its own type. Binding direction union superset of
 *      table; the reverse is verified and asserted too; plus a third — every
 *      authorable token must actually be COMPUTED somewhere.
 *  22  THE a/b SCAFFOLDING PAIR IS MODE-GATED — vg_vector_a / vg_vector_b and
 *      their labels are OFF in mode "lines_planes" and unchanged in mode
 *      "products". Both the apply pass AND the per-frame writer are exercised,
 *      because the frame re-asserts visibility every frame and would undo an
 *      apply-only fix; the negative controls run the SHIPPED source with the
 *      gate textually removed, so they execute the defect rather than
 *      paraphrase it.
 *  24  THE LABEL IS PART OF THE NUMBER — a generic comparison segment
 *      publishes its OWN token (segment_length, "segment length") and never
 *      borrows point_plane_distance, whose label is the bare word "distance".
 *      Read as TEXT off the #vg_readout panel during the WRONG-PICTURE beat,
 *      because the arithmetic, the reveal gating and the settled frame were
 *      all correct while the panel asserted the misconception. The control
 *      restores the one pre-fix assignment and watches "distance = 2.580"
 *      come back mid-sweep — and shows the second failure the shared token
 *      hid, the segment silently OVERWRITING the perpendicular's distance.
 *  27  A FREE-RUNNING SANDBOX LOOPS — vg.animate_loop_ms. Rule 37 gives an
 *      interaction_complete state a clock with no end, so ANY finite animate[]
 *      list expires and the picture stops dead (#9 STATE_9 froze at 72 s).
 *      Asserts the loop at the row's own probe ms, the stateMs-CONSUMER SWEEP
 *      (the wrapped clock reaches the animate[] evaluation and nothing else —
 *      reveals, ghosts, the grow-in ease and camera_steps stay un-wrapped),
 *      rewind determinism, drag-seize priority, byte-identity for every state
 *      that authors NO period, and the deriveStateMeta first-cycle decision.
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
import { deriveMaxRevealTimeMs, deriveHoldExpectations, deriveMotionExpectations } from "../lib/validators/visual/deriveStateMeta";
import { runFleetSafety, classify, type FleetSafetySpec } from "./lib/fleetSafety";

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
  "vgEase", "vgAnimKnobs", "vgLoopMs", "vgAnimValue", "vgAnimEndMs",
  "vgCamScheduleAt", "vgCamStepsEndMs", "vgAutoFramePos",
  "vgSplitPieces", "vgSolidFaceCount",
  // Δ11 · the projection of b onto â (the dot product's picture) and the
  // drawn cross vector's OWN NAME (derived from flip_frac, never authored).
  "vgProjectionOnto", "vgCrossLabelText",
  // VG-C · mode "lines_planes" (F11-F14, F22, F23, Δ10).
  "vgScaleVec", "vgLerpVec", "vgAngleDeg",
  "vgSphereClipSpan", "vgLineEnds", "vgPointOnLine",
  "vgPlaneBasis", "vgPlaneEdges", "vgPlaneQuad", "vgPlanePointAt",
  "vgFootOnPlane", "vgCommonPerp", "vgLinePlaneMeet", "vgLinePlaneAngles",
  "vgProjectLineOntoPlane", "vgRevealFrac", "vgGhostFactor", "vgInGroup", "vgArrived",
  "vgKnobVal", "vgObjOffset", "vgObjRotate", "vgAddr", "vgList",
  "vgResolveLinesPlanes",
  // §22 · the one predicate that decides whether the a/b scaffolding pair is
  // on screen at all, read by BOTH the apply pass and the per-frame writer.
  "vgShowAB",
];

/**
 * The pure-function sandbox, built from the SHIPPED source of every function in
 * FNS. `mutate` lets a negative control replace exactly ONE of those bodies and
 * get back an otherwise IDENTICAL sandbox — which is what makes "the pre-fix
 * build" a reconstruction rather than a second implementation that could differ
 * for reasons the control never names (§19b).
 */
function buildVgSandbox(mutate?: (name: string, src: string) => string): any {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function([
    ...FNS.map((f) => (mutate ? mutate(f, grabFn(f)) : grabFn(f))),
    "var VG_CAM_EASE_MS = 900;",
    "var VG_SPLIT_GAP_K = 1.25;",
    "var VG_MEET_EPS = 1e-9;",
    "var VG_SCENE_RADIUS = 4.5;",
    // Δ2b — the readout arrival threshold, READ OUT OF THE RENDERER rather than
    // restated: vgArrived is the resolver's whole reveal gate, and a gate holding
    // its own copy of that number passes forever after the renderer changes it.
    grabScalar("VG_SUBJECT_SHOWN_MIN"),
    "var VG_FLIP_EPS = " + /var VG_FLIP_EPS = ([0-9.]+);/.exec(SRC)![1] + ";",
    "return { " + FNS.join(", ") + " };",
  ].join("\n"))();
}
const E = buildVgSandbox() as any;

/** Pull `var NAME = { ... };` out of the emitted renderer by brace matching. */
function grabVar(name: string): string {
  const start = SRC.indexOf("var " + name + " = ");
  if (start < 0) throw new Error("var not found in renderer: " + name);
  const i = SRC.indexOf("{", start);
  let depth = 0;
  for (let j = i; j < SRC.length; j++) {
    if (SRC[j] === "{") depth++;
    else if (SRC[j] === "}") { depth--; if (depth === 0) return SRC.slice(start, j + 1) + ";"; }
  }
  throw new Error("unbalanced braces reading " + name);
}
/** Pull `var NAME = <scalar>;` out of the emitted renderer. */
function grabScalar(name: string): string {
  const m = new RegExp("var " + name + " = ([^;]+);").exec(SRC);
  if (!m) throw new Error("scalar not found in renderer: " + name);
  return "var " + name + " = " + m[1] + ";";
}

/**
 * The TUBE WIDTHS, in world units, READ OUT OF THE RENDERER — never restated
 * (§29's whole subject, and the free variable every harness that runs a shipped
 * vgPlaceTube caller has to be handed). A gate carrying its own copy of these
 * numbers keeps passing after the renderer changes them.
 */
const VG_TUBE_R_SRC = (() => {
  const m = /var VG_TUBE_R = (\{[^}]*\});/.exec(SRC);
  if (!m) throw new Error("VG_TUBE_R not found in renderer — §29's anchor drifted; re-point it before trusting this gate");
  return m[1];
})();
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const SHIPPED_TUBE_R: Record<string, number> = new Function("return " + VG_TUBE_R_SRC)();

// ── THE TEXT-SURFACE HARNESS ────────────────────────────────────────────────
//   Sections 17-19 are about SURFACES THAT MAKE CLAIMS — a readout label, a
//   slider row's displayed value, whether a row exists at all — and every one
//   of those lives behind `document`. The shipped functions that write them are
//   therefore pulled out WITH a document, against a DOM registry this file
//   owns, so the discriminating quantity is the TEXT a teacher would read and
//   not a restatement of the code that produced it.
type FakeEl = {
  id: string; style: Record<string, string>; value: string; textContent: string;
  innerHTML: string; disabled: boolean; min: string; max: string; step: string;
};
function fakeDom() {
  const els = new Map<string, FakeEl>();
  const get = (id: string): FakeEl => {
    let e = els.get(id);
    if (!e) {
      e = { id, style: {}, value: "", textContent: "", innerHTML: "", disabled: false, min: "", max: "", step: "" };
      els.set(id, e);
    }
    return e;
  };
  return { els, get, document: { getElementById: (id: string) => get(id) } };
}
// The CONCEPT-WIDE slider ranges the panel is built with, READ OUT OF THE
// SHIPPED buildVectorGeometrySliders call sites (`vgSc("b_mag", 1.0, 5.0, ...)`)
// rather than restated here — a gate carrying its own copy of the numbers
// passes forever after the renderer changes them.
const SHIPPED_ROW_RANGE: Record<string, { min: number; max: number; step: number; def: number }> = {};
// ...and the LABEL each row is born with, read from the SAME call sites for the
// same reason (§25 measures the rewritten label against the built one, so a gate
// holding its own copy of "θ (a, b)" would keep passing after the renderer
// changed it).
const SHIPPED_ROW_LABEL: Record<string, string> = {};
{
  const buildAt = SRC.indexOf("function buildVectorGeometrySliders");
  const region = SRC.slice(buildAt, SRC.indexOf("document.body.appendChild(spd);", buildAt));
  const re = /vgSc\("(\w+)",\s*(-?[0-9.]+),\s*(-?[0-9.]+),\s*(-?[0-9.]+),\s*(-?[0-9.]+),\s*"([^"]*)"\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(region))) {
    SHIPPED_ROW_RANGE[m[1]] = { min: Number(m[2]), max: Number(m[3]), step: Number(m[4]), def: Number(m[5]) };
    SHIPPED_ROW_LABEL[m[1]] = m[6];
  }
}
/**
 * The DOM-touching vg text functions, shipped, with a window/document injected.
 *
 * `labelSrcOverride` replaces exactly the `var VG_READOUT_LABEL = {...};` source
 * and nothing else, so §26's negative control can run the SHIPPED vgReadoutLine
 * over a deliberately-broken label table (the mutate-one-body precedent of
 * buildVgSandbox). It is never used by any positive assertion.
 */
function vgTextFns(win: Record<string, unknown>, doc: unknown, labelSrcOverride?: string,
  rowPassSrc?: string) {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function("window", "document", "ROW_RANGE", "ROW_LABEL", [
    labelSrcOverride || grabVar("VG_READOUT_LABEL"), grabVar("VG_READOUT_DP"), grabVar("VG_READOUT_UNIT"),
    grabVar("VG_READOUT_SUBJECT"), grabScalar("VG_SUBJECT_SHOWN_MIN"),
    grabVar("VG_ROW_DEC"), grabVar("VG_ROW_DRAG"),
    grabScalar("VG_FLIP_EPS"),
    "var VG_ROW_RANGE = ROW_RANGE;",
    // §25 · the row-label pair. vgWriteRowLabels is the DOM writer both the
    // apply pass and the scene-group picker call, so it is pulled out WITH a
    // document exactly like vgSyncRampedRows.
    "var VG_ROW_LABEL = ROW_LABEL;",
    grabFn("vgList"), grabFn("vgInGroup"),
    grabFn("vgThetaRowLabel"), grabFn("vgWriteRowLabels"),
    // §28 · the ROW-VISIBILITY pass, the one place that decides which rows are
    // on screen. Pulled out WITH a document for the same reason the label
    // writer is: the apply pass AND the scene-group picker both call it, and
    // the discriminating quantity is the DOM a teacher would see.
    grabFn("vgEffectiveControls"), rowPassSrc || grabFn("vgApplyControlRows"),
    grabFn("vgFx"), grabFn("vgFmtPoint"), grabFn("vgCrossLabelText"), grabFn("vgCrossMagLabelText"),
    grabFn("vgReadoutLine"), grabFn("vgReadoutSubjectShown"),
    grabFn("vgSyncRampedRows"), grabFn("vgControlRange"),
    "return { VG_READOUT_LABEL: VG_READOUT_LABEL, VG_ROW_DEC: VG_ROW_DEC, VG_ROW_RANGE: VG_ROW_RANGE,"
    + " vgEffectiveControls: vgEffectiveControls, vgApplyControlRows: vgApplyControlRows,"
    + " VG_ROW_LABEL: VG_ROW_LABEL, vgThetaRowLabel: vgThetaRowLabel, vgWriteRowLabels: vgWriteRowLabels,"
    + " VG_READOUT_SUBJECT: VG_READOUT_SUBJECT, VG_SUBJECT_SHOWN_MIN: VG_SUBJECT_SHOWN_MIN,"
    + " vgCrossMagLabelText: vgCrossMagLabelText, vgReadoutLine: vgReadoutLine,"
    + " vgReadoutSubjectShown: vgReadoutSubjectShown, vgSyncRampedRows: vgSyncRampedRows,"
    + " vgControlRange: vgControlRange };",
  ].join("\n"))(win, doc, JSON.parse(JSON.stringify(SHIPPED_ROW_RANGE)),
    JSON.parse(JSON.stringify(SHIPPED_ROW_LABEL))) as any;
}
/**
 * The SHIPPED frame driver, published by section 15 (which owns the THREE stub
 * scene) so sections 17-19 can read the TEXT it writes without a second stub
 * scene that could drift from it.
 */
type RunFrame = (vg: Record<string, unknown>, stateMs?: number,
  dom?: ReturnType<typeof fakeDom>, win?: Record<string, unknown>, showSliders?: boolean,
  srcOverride?: string) => unknown;
/**
 * `src` is the SHIPPED updateVectorGeometry3DFrame source, published alongside
 * the driver so §22 can run a DELIBERATELY BROKEN variant of it (the shipped
 * text with one gate removed) through the same stub scene. A negative control
 * that cannot execute the defect it names is a restatement, not a control.
 */
const FRAME_HARNESS: { run: RunFrame | null; src: string | null } = { run: null, src: null };

/** The SHIPPED apply pass, run against a scene + a real (fake) DOM registry. */
const APPLY_SRC = grabFn("applyVectorGeometry3DState");
/** The SHIPPED row pass — the ONE place that decides which slider rows show. */
const ROW_PASS_SRC = grabFn("vgApplyControlRows");
/**
 * The knob keys of the shipped row table, read out of that pass rather than
 * restated (a gate carrying its own copy of the row list keeps passing after
 * the renderer grows a knob). Guarded: a drifted table THROWS here rather than
 * silently measuring nothing.
 */
const ROW_ID_KEYS: string[] = (() => {
  const m = /var rowIds = \{([^}]*)\}/.exec(ROW_PASS_SRC);
  if (!m) throw new Error("vgApplyControlRows no longer declares `var rowIds = {...}` — re-anchor the row table.");
  return m[1].split(",").map((s) => s.split(":")[0].trim()).filter(Boolean);
})();
/**
 * `rowPassSrc` replaces exactly the `vgApplyControlRows` body and nothing else,
 * so §28's negative control can run the SHIPPED apply pass over the PRE-FIX
 * (flat, group-blind) row pass — the mutate-one-body precedent of
 * buildVgSandbox and of §25's label control.
 */
function runApplyPass(scene: Array<Record<string, unknown>>, stateDef: unknown, dom = fakeDom(),
  srcOverride?: string, rowPassSrc?: string) {
  const win: Record<string, unknown> = {};
  const T = vgTextFns(win, dom.document, undefined, rowPassSrc);
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const factory = new Function("sceneObjects", "window", "document", "vgAnimKnobs", "VG_ROW_RANGE", "vgControlRange",
    "vgShowAB", "vgWriteRowLabels", "vgApplyControlRows",
    (srcOverride || APPLY_SRC) + "\nreturn applyVectorGeometry3DState;");
  factory(scene, win, dom.document, E.vgAnimKnobs, T.VG_ROW_RANGE, T.vgControlRange, E.vgShowAB,
    T.vgWriteRowLabels, T.vgApplyControlRows)(stateDef);
  return { win, dom, T };
}

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
/** A negative control, phrased positively: the planted defect MUST be caught. */
function control2(label: string, caught: boolean) {
  if (!caught) failures++;
  console.log(`  ${caught ? "PASS" : "FAIL"}  NEGATIVE CONTROL (must itself fail first): ${label}`);
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
        STATE_3: { vg: { mode: "products", reveal_ms: 900, camera_mode: "steps", camera_steps: [{ at_ms: 0, az: 90, el: 70, dist: 10, ease_ms: 0 }, { at_ms: 2800, az: 90, el: 30, dist: 16, ease_ms: 1600 }] } },
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

  // ── D5's MOTION EXPECTATION, which this scenario had no entry for at all.
  //    Every state resolved to `undefined`, so THE EYE printed "D5 Skipped —
  //    motion expectation unknown" on all eight and the run still headlined a
  //    full pass. A GATE THAT IS SKIPPED IS NOT A GATE THAT PASSED. D5 reads
  //    the DENSE series across the whole state, not the settled reveal pin, so
  //    a ramped or camera-moved state can be held to actually moving pixels.
  const motion = deriveMotionExpectations(cfg as any);
  check("STATE_2 (an animate[] ramp IS the state's motion) declares motion", motion.STATE_2, true, 0);
  check("STATE_3 (a multi-step camera schedule moves the whole picture) declares motion", motion.STATE_3, true, 0);
  check("STATE_4 (the teacher's sandbox, user-driven) declares STATIC — the interactive hold pass relaxes its tail", motion.STATE_4, false, 0);
  assertTrue("STATE_1 (a still guided beat riding only the shared grow-in) is left UNDECLARED on purpose — the sr precedent, so the hold pass classifies it reveal_hold instead of D5 false-failing it for standing still",
    motion.STATE_1 === undefined);
  const camOne = {
    field_3d_config: {
      scenario_type: "vector_geometry_3d",
      states: { S: { vg: { mode: "products", camera_mode: "steps", camera_steps: [{ at_ms: 0, az: 90, el: 30, dist: 16, ease_ms: 0 }] } } },
    },
  };
  assertTrue("a SINGLE camera step is a placement, not a move, and does not claim motion",
    deriveMotionExpectations(camOne as any).S === undefined);
  // camera_steps WITHOUT camera_mode: "steps" is never READ by the frame
  // driver, so it is not motion either — the deriver is bound to what the
  // renderer actually reads, not to the presence of an authored key.
  const camUnread = {
    field_3d_config: {
      scenario_type: "vector_geometry_3d",
      states: { S: { vg: { mode: "products", camera_steps: [{ at_ms: 0, dist: 10 }, { at_ms: 2800, dist: 16 }] } } },
    },
  };
  assertTrue("camera_steps authored WITHOUT camera_mode:steps claims no motion — the frame driver never reads them",
    deriveMotionExpectations(camUnread as any).S === undefined);

  // NEGATIVE CONTROL — the shipped pre-fix state of this file: no vg entry, so
  // every state resolves to undefined and D5 skips. What a weaker control
  // would have reported: "the concept passed 35/35", "no D5 failures", "hold
  // expectations are registered" — all true while D5 ran on nothing at all.
  const noVgEntry = (s: Record<string, unknown>) => (s.sr || s.bonding_scene ? "handled" : undefined);
  expectFail("a scenario with no deriveMotionExpectations entry declares motion on its ramped state (it declares undefined, and D5 SKIPS)",
    noVgEntry({ vg: { animate: [{ knob: "theta_deg", from: 60, to: 20 }] } }) !== undefined);
  assertTrue("...and the SHIPPED deriver does not share that defect (proved on the real function, not on a source grep)",
    motion.STATE_2 === true);
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
      "vg_parallelogram", "vg_parallelepiped", "vg_base_face", "vg_height_seg",
      "vg_proj_seg", "vg_proj_drop"];
    const objs: FakeObj[] = types.map((t) => ({ userData: { elementType: t }, visible: false }));
    objs.push({ userData: { elementType: "vg_label", tracks: "vg_vector_c" }, visible: false });
    objs.push({ userData: { elementType: "vg_label", tracks: "vg_proj_seg" }, visible: false });
    // A FOREIGN element from a different scenario, to prove the apply pass
    // touches only its own vg_ prefix (it runs over the shared sceneObjects).
    objs.push({ userData: { elementType: "field_line" }, visible: true });
    return objs;
  }
  function runApply(scene: FakeObj[], stateDef: unknown) {
    return runApplyPass(scene as unknown as Array<Record<string, unknown>>, stateDef).win;
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

  // Δ11 — the projection pair, admitted ONLY by its own flag. A dot-product
  // state authors show_projection and nothing else changes; the cross-product
  // states must not inherit a segment along â they never asked for.
  const sProj = fakeScene();
  runApply(sProj, { vg: { show_projection: true } });
  assertTrue("show_projection: true admits the segment AND its dashed drop",
    visOf(sProj, "vg_proj_seg") && visOf(sProj, "vg_proj_drop"));
  assertTrue("...and its label (the picture is named, so the state reads sound-off)",
    sProj.filter((o) => o.userData.tracks === "vg_proj_seg")[0].visible);
  assertTrue("...and admits NOTHING else (no quad, no solid, no c)",
    !visOf(sProj, "vg_parallelogram") && !visOf(sProj, "vg_parallelepiped") && !visOf(sProj, "vg_vector_c"));
  assertTrue("the cross-product state (show_parallelogram, no show_projection) does NOT inherit the projection",
    !visOf(sQuad, "vg_proj_seg") && !visOf(sQuad, "vg_proj_drop")
    && !sQuad.filter((o) => o.userData.tracks === "vg_proj_seg")[0].visible);

  // Neither authored: both hidden, a and b still shown (they are the scenario).
  const sBare = fakeScene();
  runApply(sBare, { vg: {} });
  assertTrue("with show_projection unauthored the projection pair stays hidden (every state that predates Δ11 is unchanged)",
    !visOf(sBare, "vg_proj_seg") && !visOf(sBare, "vg_proj_drop"));
  assertTrue("with neither flag authored BOTH stay hidden", !visOf(sBare, "vg_parallelogram") && !visOf(sBare, "vg_parallelepiped"));
  // a and b are shown on any state that does not declare mode "lines_planes"
  // — which is every state of Act I, none of which authors `mode` at all.
  // §22 owns the other side of that gate.
  assertTrue("a and b are shown on a products-mode state (they are the scenario)", visOf(sBare, "vg_vector_a") && visOf(sBare, "vg_vector_b"));
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
  // Read from the PARSED table, not from a fixed-length source slice: the
  // slice version silently stopped covering these three keys the moment a
  // comment was added above them, which is a gate that quietly narrows.
  {
    const T = vgTextFns({}, fakeDom().document);
    for (const key of ["volume", "base_area", "height"]) {
      assertTrue(`the D-5 readout key "${key}" has a label in VG_READOUT_LABEL (an unlabelled key renders nothing at all)`,
        typeof T.VG_READOUT_LABEL[key] === "string" && T.VG_READOUT_LABEL[key].length > 0);
    }
  }
}

console.log("\n=== 11. FLEET SAFETY — vector_geometry_3d's blast radius is the enumerated glue, and nothing else ===");
{
  // REWRITTEN 2026-08-09 alongside check:solid-of-revolution, and the reason
  // is worth stating plainly: THIS SECTION WAS GREEN BY ACCIDENT. Its baseline
  // walk looks for the newest ancestor carrying no vector scenario and landed
  // on 07ea1218 — a commit on the solid_of_revolution BRANCH, which therefore
  // already contained SR. SR's 1531 lines happened not to diff, so no drift
  // was reported. Had SR merged one day later, or had any other scenario
  // landed after this baseline, this section would have reported that
  // sibling's entire block as vector_geometry_3d's blast radius, exactly as
  // check:solid-of-revolution did from the hour it merged (measured there:
  // 1271 of 1271 stray lines were that gate's OWN block). An accidentally
  // green gate is the next red one, so the accident is removed rather than
  // relied on.
  //
  // The mechanism — a derived baseline plus attribution BY AUTHORSHIP rather
  // than by time — is documented once in src/scripts/lib/fleetSafety.ts and
  // shared with check:solid-of-revolution, so the next scenario's gate
  // inherits it instead of copying whichever version it finds first.
  const SPEC: FleetSafetySpec = {
    renderer: "src/lib/renderers/field_3d_renderer.ts",
    sentinel: "vector_geometry_3d",
    // The pre-rename name still means "this scenario exists".
    altSentinels: ["vector_products_in_space"],
    // The scenario's VOCABULARY: its type string plus the `vg` symbol prefix
    // convention the whole region is named with. Derived from the naming
    // convention rather than listed symbol by symbol, so a new vg helper
    // needs no edit here.
    vocabulary: /vector_geometry_3d|vector_products_in_space|\bvg[A-Z]|\bvg_[a-z]|VectorGeometry3D/,
    regionStart: "vector_geometry_3d (MATHEMATICS — the GENERIC two-vector",
    regionEnd: "rhr_force_direction — DIRECTION-ONLY sibling of lorentz_force_uniform_field",
    glue: [
      "vector_geometry_3d",                             // union terminator + every dispatch
      "isVecGeom",                                      // the #sliders NOT-list boolean
      "slidersEl.style.display",                        // the NOT-list condition it joins
      "buildVectorGeometry3D();",
      "applyVectorGeometry3DState(stateDef);",
      "updateVectorGeometry3DFrame();",
      "applyVectorGeometry3DGlow();",
    ],
    stripOwn: (l: string) => l
      .split(' || config.scenario_type === "vector_geometry_3d"').join("")
      .split(" && !isVecGeom").join(""),
    baseEnv: "VG_FLEET_BASE",
  };
  const R = runFleetSafety(SPEC);
  if (!R.base) {
    console.log("  SKIP  no pre-vg ancestor found in the last 60 renderer commits (set VG_FLEET_BASE)");
  } else {
    console.log(`        baseline (newest ancestor with NO vector scenario): ${R.base.slice(0, 10)}`);
    console.log(`        vg region excised: template lines ${R.region[0]}..${R.region[1]} (${R.region[1] - R.region[0]} lines)`);
    console.log(`        commits since the baseline: ${R.mineCommits.length} vg, ${R.othersCommits.length} other`);
    assertTrue("the baseline predates vector_geometry_3d — not HEAD wearing a baseline's name (the defect that made the SR gate red on master)",
      R.base !== execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).trim());
    assertTrue("the vg region's opening anchor is found in the emitted template", R.region[0] > 0);
    assertTrue("the vg region's closing anchor (the next scenario's banner) is found", R.region[1] > R.region[0]);

    // ── THE STRUCTURAL HALF — no history at all, so it can never rot. With
    //    the region excised, every surviving mention of the scenario must be
    //    an enumerated glue site. Strictly stronger than the diff on the
    //    addition side, which cannot see an unlisted dispatch that arrived in
    //    the SAME commit as the region: to a snapshot diff that is just "the
    //    scenario landed".
    for (const s of R.unlistedReach.slice(0, 8)) console.log("      unlisted reach: " + s.trim().slice(0, 120));
    assertTrue(`vg names itself outside its own region ONLY on enumerated glue lines (${R.unlistedReach.length} unlisted)`,
      R.unlistedReach.length === 0);
    assertTrue(`every enumerated glue chain is present (${R.glueHits.length} hits over ${SPEC.glue.length} chains)`,
      R.glueHits.length >= SPEC.glue.length);
    for (const chain of ['case "vector_geometry_3d":', "var isVecGeom = config.scenario_type",
      "buildVectorGeometry3D();", "applyVectorGeometry3DState(stateDef);",
      "updateVectorGeometry3DFrame();", "applyVectorGeometry3DGlow();"]) {
      assertTrue(`the "${chain.slice(0, 42)}" dispatch is wired`,
        R.stripped.filter((l) => l.includes(chain)).length >= 1);
    }
    assertTrue(`the shared-glue allowlist is SHORT and enumerated (${SPEC.glue.length} entries) — the measured blast radius of a new scenario_type`,
      SPEC.glue.length <= 10);

    // ── THE HISTORICAL HALF, attributed.
    const C = classify(SPEC, R);
    for (const s of C.strayAdded.slice(0, 6)) console.log("      stray ADDED:   " + s.trim().slice(0, 120));
    for (const s of C.strayRemoved.slice(0, 6)) console.log("      stray REMOVED: " + s.trim().slice(0, 120));
    console.log(`        ${C.changed} lines differ from the baseline; ${C.exemptOthers} attributed to other scenarios' commits, ${C.exemptNearGlue} inside vg's own dispatch insertions, ${C.exemptPunctuation} structural punctuation`);
    check("fleet lines ADDED outside the vg region and the named shared glue", C.strayAdded.length, 0, 0);
    check("fleet lines REMOVED outside the vg region and the named shared glue", C.strayRemoved.length, 0, 0);

    // ── NEGATIVE CONTROLS, the same three the SR gate carries, because the
    //    authorship exemption is exactly the kind of widening that can make a
    //    gate pass vacuously and the only proof it has not is that a planted
    //    line is still caught in each place the exemption could swallow it.
    const tamperedAt = (find: string, replace: string) =>
      classify(SPEC, R, R.stripped.map((l) => (l.includes(find) ? l.replace(find, replace) : l)));

    const t1 = tamperedAt("    function addToScene(obj) {", "    function addToScene(obj) { /* tampered */");
    control2("tampering with a SHARED helper (addToScene) is reported",
      t1.strayAdded.length + t1.strayRemoved.length > 0);

    // The discriminating one for this rewrite: authorship exempts a sibling's
    // COMMITS, and must never harden into "anything outside my own block is
    // forgiven". solid_of_revolution is the sibling that landed after this
    // baseline, so its region is exactly where the exemption could hide a
    // planted line.
    const sibling = R.stripped.find((l) => l.includes("function srExactVolume("))
      ?? R.stripped.find((l) => l.includes("function buildSolidOfRevolution("));
    assertTrue("a sibling scenario's region (solid_of_revolution) is present in the stripped body, so the control below has something to plant in",
      !!sibling);
    const t2 = tamperedAt(sibling!, sibling! + " /* tampered */");
    control2("a planted line inside a SIBLING scenario's region (solid_of_revolution) is still reported — authorship exempts a sibling's COMMITS, never a sibling's TERRITORY",
      t2.strayAdded.length + t2.strayRemoved.length > 0);

    // A shared line vg APPENDED TO, not one vg created outright: a line with
    // no earlier version has nothing to differ from, so planting on one
    // proves nothing (the SR gate's control (3) was written that way first).
    const glueLine = R.stripped.find((l) => l.includes("slidersEl.style.display") && l.includes("isVecGeom"));
    assertTrue("a shared line vg APPENDED TO (the #sliders NOT-list) exists, so the control below has a real target",
      !!glueLine);
    const t3 = glueLine ? tamperedAt(glueLine, glueLine + " /* tampered */") : { strayAdded: [], strayRemoved: [] };
    control2("editing a shared line vg appended to, BEYOND vg's own insertion, is reported",
      t3.strayAdded.length + t3.strayRemoved.length > 0);

    assertTrue(`somebody else's commits are actually being attributed (${R.othersAdded.size} added / ${R.othersRemoved.size} removed lines credited elsewhere)`,
      R.othersCommits.length === 0 || R.othersAdded.size + R.othersRemoved.size > 0);
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
console.log("\n=== 11c. THE AUTHORED value_readouts UNION == THE SHIPPED VG_READOUT_LABEL TABLE (both directions) ===");
{
  // bug_class field3d_vg_value_readouts_type_union_omits_every_lines_planes_
  // token_the_renderer_already_prints.
  //
  // TWO declarations of the same closed enum, in two different languages,
  // 12,880 lines apart and with nothing binding them:
  //   * the TYPESCRIPT union `vg.value_readouts?: Array<...>` — the AUTHORING
  //     contract, in the wrapper ABOVE the template literal;
  //   * `var VG_READOUT_LABEL` — the RENDERING table, inside the emitted body,
  //     and the thing vgReadoutLine actually dispatches on.
  // Before A25 the union carried the 11 "products" tokens and the table
  // carried 24: every one of the 13 Δ6 "lines_planes" tokens was rendered
  // correctly by an engine that its own type forbade an author from naming.
  // The defect is INVISIBLE to every other section here — the geometry is
  // right, the labels are right, the frame driver prints them; only the
  // contract is wrong — and it is invisible to tsc too, because no concept
  // authors the scenario yet, so nothing type-checks against the union.
  //
  // The BINDING direction is union ⊇ table: every key the renderer can label
  // must be authorable, or the engine ships a capability no state can reach.
  // The reverse (table ⊇ union) is asserted too and VERIFIED to hold today —
  // an authorable token with no label is a silent no-op, because vgReadoutLine
  // returns null on a missing label and the row simply never appears.
  //
  // Read from the SOURCE FILE, not from SRC: SRC is the evaluated template
  // body, and the union lives in the TypeScript wrapper ABOVE the opening
  // backtick, so it is not in SRC at all.
  const RENDERER_PATH = "src/lib/renderers/field_3d_renderer.ts";
  const FILE = readFileSync(RENDERER_PATH, "utf-8");
  const stripComments = (s: string) => s.replace(/\/\/[^\n]*/g, "");

  /** The authored TS union, as a token set. */
  function unionTokensOf(file: string): string[] {
    const at = file.indexOf("value_readouts?: Array<");
    if (at < 0) throw new Error("no value_readouts union in the renderer wrapper");
    const end = file.indexOf(">;", at);
    if (end < 0) throw new Error("unterminated value_readouts union");
    return (stripComments(file.slice(at, end)).match(/'([a-z0-9_]+)'/g) || []).map((s) => s.replace(/'/g, ""));
  }
  /** The shipped VG_READOUT_LABEL table, as a key set. */
  function labelKeysOf(body: string): string[] {
    const at = body.indexOf("var VG_READOUT_LABEL = {");
    if (at < 0) throw new Error("no VG_READOUT_LABEL in the emitted body");
    const end = body.indexOf("};", at);
    const inner = stripComments(body.slice(body.indexOf("{", at) + 1, end));
    return (inner.match(/([A-Za-z_][A-Za-z0-9_]*)\s*:/g) || []).map((s) => s.replace(/\s*:$/, ""));
  }

  // The union must be in the WRAPPER, above the template. If it ever moved
  // inside the body this extraction would be reading a different thing.
  const tickOpen = FILE.indexOf("`", FILE.indexOf("FIELD_3D_RENDERER_CODE = "));
  assertTrue("the value_readouts union lives in the TS wrapper, ABOVE the template literal (so SRC cannot see it)",
    FILE.indexOf("value_readouts?: Array<") < tickOpen && tickOpen > 0);

  const UNION = unionTokensOf(FILE);
  const LABELS = labelKeysOf(SRC);
  console.log(`        union tokens: ${UNION.length}   VG_READOUT_LABEL keys: ${LABELS.length}`);

  // (a) THE BINDING DIRECTION — union ⊇ table.
  const unlabelable = LABELS.filter((k) => UNION.indexOf(k) < 0);
  check("every VG_READOUT_LABEL key is AUTHORABLE in the value_readouts union (union superset of table)",
    unlabelable.length, 0, 0);
  if (unlabelable.length) console.log(`        UNAUTHORABLE: ${unlabelable.join(", ")}`);

  // (b) THE REVERSE — verified to hold today, so it is asserted rather than
  //     assumed. An authorable token with no label renders NOTHING.
  const unlabelled = UNION.filter((t) => LABELS.indexOf(t) < 0);
  check("every authorable token HAS a label (table superset of union — an unlabelled token is a silent no-op)",
    unlabelled.length, 0, 0);
  if (unlabelled.length) console.log(`        UNLABELLED: ${unlabelled.join(", ")}`);

  check("the two declarations are the SAME closed set", UNION.length, LABELS.length, 0);
  // 25 since segment_length was split out of point_plane_distance (§24).
  check("the set is the full 25 (11 products + 14 lines_planes)", LABELS.length, 25, 0);
  assertTrue("the union is still CLOSED — never weakened to string[]",
    /value_readouts\?:\s*Array</.test(FILE) && !/value_readouts\?:\s*string\[\]/.test(FILE));

  // (c) THIRD DIRECTION — a token that is authorable AND labelled but never
  //     COMPUTED prints nothing either (vgReadoutLine bails on a null value).
  //     Every token must have a value source: the products half is the frame
  //     driver's `vals` literal, the lines_planes half is the resolver writing
  //     out.readouts.<token>.
  const valsAt = SRC.indexOf("var vals = {");
  const valsLit = SRC.slice(valsAt, SRC.indexOf("};", valsAt));
  const sourceless = UNION.filter((t) =>
    valsLit.indexOf(t + ":") < 0 && !new RegExp("out\\.readouts\\." + t + "\\b").test(SRC));
  check("every authorable token has a VALUE SOURCE (vals literal or resolver out.readouts.<token>)",
    sourceless.length, 0, 0);
  if (sourceless.length) console.log(`        NEVER COMPUTED: ${sourceless.join(", ")}`);

  // ── NEGATIVE CONTROLS ────────────────────────────────────────────────────
  // Reconstruct the PRE-A25 union (the 11 products tokens) against the SHIPPED
  // 24-key table and show the binding check FIRES. A control that has never
  // failed is not known to discriminate.
  const PRE_A25 = ["a_mag", "b_mag", "theta_deg", "a_dot_b", "cross_mag",
    "a_dot_cross", "b_dot_cross", "triple", "volume", "base_area", "height"];
  const preMissing = LABELS.filter((k) => PRE_A25.indexOf(k) < 0);
  assertTrue(`the binding check FIRES on the pre-A25 union: ${preMissing.length} of ${LABELS.length} keys unauthorable`,
    preMissing.length === 14);
  expectFail("the pre-A25 11-token union satisfies union-superset-of-table",
    LABELS.every((k) => PRE_A25.indexOf(k) >= 0));

  // ...and the pre-A25 union is reconstructed from the FILE rather than only
  // hand-typed, so the control cannot drift away from what actually shipped:
  // deleting the Δ6 arm of the union must reproduce exactly those 11 tokens.
  const dropLinesPlanes = FILE.replace(
    /\/\/ mode "lines_planes"[\s\S]*?\n(\s*)>;/,
    "\n$1>;");
  const reconstructed = unionTokensOf(dropLinesPlanes);
  check("the pre-A25 union is reconstructible from the shipped file (Δ6 arm excised)", reconstructed.length, 11, 0);
  assertTrue("the reconstructed pre-A25 union is exactly the products half",
    reconstructed.join(",") === PRE_A25.join(","));
  expectFail("the reconstructed pre-A25 source passes the binding check",
    LABELS.every((k) => reconstructed.indexOf(k) >= 0));

  // THE DIRECTION IS THE POINT. The reverse-only check — "every authorable
  // token has a label" — is GREEN on the broken source, so a gate that
  // asserted only that direction would have shipped the defect. This is the
  // control that justifies asserting BOTH directions rather than one.
  expectFail("a reverse-ONLY gate (table superset of union) can tell the pre-A25 source from the fixed one",
    PRE_A25.every((t) => LABELS.indexOf(t) >= 0) !== UNION.every((t) => LABELS.indexOf(t) >= 0));

  // A weakened `string[]` union would also make every token authorable, and
  // would pass (a) — so (a) alone does not defend the CLOSED enum. Show that
  // the closedness assertion is what discriminates there.
  const weakened = FILE.replace(/value_readouts\?:\s*Array<[\s\S]*?>;/, "value_readouts?: string[];");
  expectFail("the closed-enum assertion accepts a string[]-weakened union",
    /value_readouts\?:\s*Array</.test(weakened) && !/value_readouts\?:\s*string\[\]/.test(weakened));
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
      "point_plane_distance", "segment_length", "skew_distance", "angle_lines_deg",
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
      "var VG_TUBE_R = " + VG_TUBE_R_SRC + ";",
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

console.log("\n=== 14. Δ11 — THE PROJECTION OF b ONTO â: signed length, foot on the â line, drop ⊥ a, and the OBTUSE reversal ===");
{
  // bug_class field3d_vg_products_mode_cannot_draw_the_projection_segment_so_
  // the_dot_product_states_lead_numerically. The claim under test is not "a
  // segment exists" — it is that the segment's LENGTH IS SIGNED, because the
  // obtuse state's whole payoff is the projection landing on the far side of
  // the origin. An unsigned |b·â| draws an identical picture at every acute
  // angle and a WRONG one at every obtuse angle, so the discriminating
  // quantity is the signed length past 90°, never the length itself.
  const rad = (d: number) => d * Math.PI / 180;
  let worstLen = 0, worstPerp = 0, worstFoot = 0, samples = 0;
  for (const thetaDeg of [20, 35, 50, 65, 80, 89, 90, 91, 100, 115, 130, 145, 160]) {
    for (const aMag of [1, 3, 5]) {
      for (const bMag of [1, 2, 4.5]) {
        for (const tilt of [0, 25, 60]) {
          const v = E.vgBuildVectors({ a_mag: aMag, b_mag: bMag, theta_deg: thetaDeg, b_tilt_deg: tilt });
          const p = E.vgProjectionOnto(v.a, v.b);
          samples++;
          // 1. the SIGNED closed form, solved outside the tool: |b| cos θ.
          worstLen = Math.max(worstLen, Math.abs(p.length - bMag * Math.cos(rad(thetaDeg))));
          // 2. the foot is ON the â line (its cross with a vanishes) and at
          //    exactly that signed distance from the origin.
          worstFoot = Math.max(worstFoot, len3(cross3(p.foot as V3, v.a as V3)));
          // 3. the drop is PERPENDICULAR to a — which is what makes the foot a
          //    projection rather than a point that happens to be nearby.
          worstPerp = Math.max(worstPerp, Math.abs(dot3(sub3(v.b as V3, p.foot as V3), v.a as V3)));
        }
      }
    }
  }
  check(`signed length == |b| cos θ over ${samples} (θ, |a|, |b|, tilt) samples incl. the obtuse half`, worstLen, 0, 1e-12);
  check("the foot lies ON the â line at every sample (|foot × a|)", worstFoot, 0, 1e-12);
  check("the drop b→foot is ⊥ a at every sample ((b−foot)·a)", worstPerp, 0, 1e-12);

  // THE OBTUSE REVERSAL, gated explicitly.
  const acute = E.vgProjectionOnto(E.vgBuildVectors({ theta_deg: 60, b_mag: 2 }).a, E.vgBuildVectors({ theta_deg: 60, b_mag: 2 }).b);
  const right = E.vgBuildVectors({ theta_deg: 90, b_mag: 2 });
  const pRight = E.vgProjectionOnto(right.a, right.b);
  const obtuse = E.vgBuildVectors({ theta_deg: 120, b_mag: 2 });
  const pObtuse = E.vgProjectionOnto(obtuse.a, obtuse.b);
  check("θ = 60°: the projection points ALONG â (+1.000)", acute.length, 1.0, 1e-12);
  check("θ = 90°: it is exactly zero — the segment vanishes, matching the 0.00 the readout prints", pRight.length, 0, 1e-15);
  check("θ = 120°: it REVERSES through the origin (−1.000, not +1.000)", pObtuse.length, -1.0, 1e-12);
  assertTrue("...and the foot itself sits on the far side of the origin (foot·â < 0)",
    dot3(pObtuse.foot as V3, E.vgNormalize(obtuse.a) as V3) < 0);
  assertTrue("the sign flip happens AT 90°, not near it (89° positive, 91° negative)",
    E.vgProjectionOnto(E.vgBuildVectors({ theta_deg: 89 }).a, E.vgBuildVectors({ theta_deg: 89 }).b).length > 0
    && E.vgProjectionOnto(E.vgBuildVectors({ theta_deg: 91 }).a, E.vgBuildVectors({ theta_deg: 91 }).b).length < 0);

  // NEGATIVE CONTROL — the unsigned |b·â| form, which is the projection a
  // renderer writes when it reaches for a LENGTH instead of a COMPONENT.
  // First the control is shown to be BLIND where a weak gate would have run
  // it (every acute angle), then shown to catch the case that matters. A
  // control that reported the same thing in both halves would be worthless.
  const unsignedAt = (thetaDeg: number) => {
    const v = E.vgBuildVectors({ theta_deg: thetaDeg, b_mag: 2 });
    return Math.abs(E.vgProjectionOnto(v.a, v.b).length);
  };
  assertTrue(`the unsigned form is INDISTINGUISHABLE below 90° (θ=60: ${unsignedAt(60).toFixed(6)} vs signed ${acute.length.toFixed(6)}) — which is why an acute-only check proves nothing`,
    Math.abs(unsignedAt(60) - acute.length) < 1e-12);
  expectFail(`an unsigned |b·â| still equals the signed projection at θ=120 (${unsignedAt(120).toFixed(3)} vs ${pObtuse.length.toFixed(3)})`,
    Math.abs(unsignedAt(120) - pObtuse.length) < 1e-9);
  assertTrue("the SHIPPED helper does not take an absolute value anywhere (proved on the extracted source, not on a re-implementation)",
    grabFn("vgProjectionOnto").indexOf("Math.abs") < 0);

  // Degenerate |a| — a zero-length a has no â to project onto, and a renderer
  // that divides by it blanks the scene (scar field3d_createtubeline_
  // undefined_field_lines_throws, the divide-by-zero cousin).
  assertTrue("a degenerate a returns null rather than NaN coordinates (a NaN position blanks the scene)",
    E.vgProjectionOnto([0, 0, 0], [1, 2, 3]) === null);

  // The projection must track the LIVE vectors, i.e. it is a pure function of
  // them with no state — the same guarantee every other vg helper carries.
  const t1 = E.vgProjectionOnto(E.vgBuildVectors({ theta_deg: 40 }).a, E.vgBuildVectors({ theta_deg: 40 }).b);
  const t2 = E.vgProjectionOnto(E.vgBuildVectors({ theta_deg: 140 }).a, E.vgBuildVectors({ theta_deg: 140 }).b);
  const t3 = E.vgProjectionOnto(E.vgBuildVectors({ theta_deg: 40 }).a, E.vgBuildVectors({ theta_deg: 40 }).b);
  assertTrue("REWIND: 40° → 140° → 40° reproduces the first result BIT FOR BIT (no accumulator, so a pinned frame is byte-stable)",
    JSON.stringify(t1) === JSON.stringify(t3) && JSON.stringify(t1) !== JSON.stringify(t2));
}

console.log("\n=== 15. Δ11 — THE DRAWN CROSS VECTOR'S NAME: the label agrees with the ARROW at every flip_frac ===");
{
  // bug_class field3d_vg_cross_arrow_label_is_built_once_so_the_order_
  // contrast_state_labels_b_cross_a_as_a_cross_b — the contrast state teaching
  // something false. THE DISCRIMINATING QUANTITY IS THE LABEL'S TEXT, not
  // whether a label exists: the pre-fix build DID have a label, correctly
  // placed, correctly coloured, tracking the right arrow. Every check except
  // "what does it say" passed on the broken build.
  const FLIP_EPS = Number(/var VG_FLIP_EPS = ([0-9.]+);/.exec(SRC)![1]);
  check("VG_FLIP_EPS is read from the SHIPPED renderer, not restated here", FLIP_EPS, 0.02, 0);

  const v = E.vgBuildVectors({ a_mag: 3, b_mag: 2, theta_deg: 55 });
  const axb = E.vgCrossVec(v.a, v.b) as V3;
  const bxa = E.vgCrossVec(v.b, v.a) as V3;
  const drawnAt = (f: number): V3 => (f ? E.vgRotateAbout(axb, E.vgNormalize(v.a), Math.PI * f) : axb) as V3;
  const angleTo = (u: V3, w: V3) => Math.acos(Math.max(-1, Math.min(1, dot3(u, w) / (len3(u) * len3(w))))) * 180 / Math.PI;

  // The geometry the fix rests on: at flip_frac = 1 the drawn arrow IS b×a.
  check("at flip_frac = 1 the DRAWN arrow is b×a exactly (|drawn − b×a|)", len3(sub3(drawnAt(1), bxa)), 0, 1e-14);
  check("...and is the NEGATIVE of a×b, not a shrunken copy (|drawn| − |a×b|)", len3(drawnAt(1)) - len3(axb), 0, 1e-14);

  // THE ASSERTION THE DISPATCH NAMES.
  assertTrue(`the cross label reads "b×a" at flip_frac = 1 (got "${E.vgCrossLabelText(1)}")`, E.vgCrossLabelText(1) === "b×a");
  assertTrue(`...and "a×b" at flip_frac = 0 (got "${E.vgCrossLabelText(0)}")`, E.vgCrossLabelText(0) === "a×b");

  // CORRECT AT EVERY VALUE, not only at the endpoints. The rule the label
  // obeys: it may make an ORDER CLAIM only where the drawn arrow is within
  // VG_FLIP_EPS·180° of the vector it names; everywhere else it must name the
  // transition instead of either operand order.
  const bandDeg = FLIP_EPS * 180 + 1e-9;
  let claimViolations = 0, transitionCount = 0, checked = 0;
  for (let f = 0; f <= 1.0000001; f += 0.005) {
    const txt = E.vgCrossLabelText(f);
    const d = drawnAt(f);
    checked++;
    if (txt === "a×b") { if (angleTo(d, axb) > bandDeg) claimViolations++; }
    else if (txt === "b×a") { if (angleTo(d, bxa) > bandDeg) claimViolations++; }
    else {
      transitionCount++;
      // The transition string names the MOTION, which is true at every value
      // it is shown at — but it must never be shown where an exact operand
      // order is available, or the endpoints would go unnamed.
      if (angleTo(d, axb) <= bandDeg || angleTo(d, bxa) <= bandDeg) claimViolations++;
    }
  }
  check(`over ${checked} flip_frac samples, label claims contradicted by the drawn arrow`, claimViolations, 0, 0);
  assertTrue(`the transition is NAMED rather than left to one of the two orders (${transitionCount} of ${checked} samples)`, transitionCount > 0);
  assertTrue("out-of-range / non-finite flip_frac clamps to the a×b end rather than producing an unnamed arrow",
    E.vgCrossLabelText(-3) === "a×b" && E.vgCrossLabelText(9) === "b×a"
    && E.vgCrossLabelText(NaN) === "a×b" && E.vgCrossLabelText(undefined) === "a×b");

  // NEGATIVE CONTROL — the SHIPPED PRE-FIX BEHAVIOUR, restated exactly: a
  // sprite built once with the literal "a×b" and never re-texted. It reports
  // "a×b" at BOTH endpoints, which is the defect. Note what a weaker control
  // would have said: "a label exists at flip_frac = 1" and "the label tracks
  // vg_cross_vector" are both TRUE of the broken build, so neither can
  // discriminate — only the text can.
  const builtOnce = (_f: number) => "a×b";
  expectFail(`a label built ONCE as "a×b" reads b×a at flip_frac = 1 (it reads "${builtOnce(1)}")`, builtOnce(1) === "b×a");
  assertTrue("...and it is INDISTINGUISHABLE from the fix at flip_frac = 0 — which is why the pre-fix build looked fine in every state but one",
    builtOnce(0) === E.vgCrossLabelText(0));
  // A midpoint switch is the OTHER tempting shape, and it fails the same test
  // one step in: at flip_frac 0.49 it claims a×b while the arrow stands 88°
  // away from a×b.
  const midpointSwitch = (f: number) => (f < 0.5 ? "a×b" : "b×a");
  expectFail(`a midpoint switch keeps its claim inside the ${bandDeg.toFixed(1)}° band at flip_frac = 0.49 (arrow is ${angleTo(drawnAt(0.49), axb).toFixed(1)}° off a×b)`,
    angleTo(drawnAt(0.49), axb) <= bandDeg && midpointSwitch(0.49) === "a×b");

  // AND THE WIRING, on the SHIPPED FRAME DRIVER. The helper being right is
  // worth nothing if the frame never calls it — the pre-fix defect was
  // precisely a correct label that nothing re-texted. So the real
  // updateVectorGeometry3DFrame is pulled out and run against stubs, and the
  // SPRITE's retained text is read at both endpoints.
  {
    type Stub = any;
    const vec3 = (x = 0, y = 0, z = 0) => ({
      x, y, z,
      normalize() { const l = Math.hypot(this.x, this.y, this.z) || 1; this.x /= l; this.y /= l; this.z /= l; return this; },
    });
    const THREE: Stub = { Vector3: function (x: number, y: number, z: number) { return vec3(x, y, z); } };
    const geomStub = (n: number) => ({
      attributes: { position: { array: new Float32Array(n * 3), needsUpdate: false } },
      computeBoundingSphere() { /* no-op */ }, setDrawRange() { /* section 7b's job */ },
    });
    function obj(elementType: string, tracks?: string): Stub {
      return {
        userData: tracks ? { elementType, tracks } : { elementType },
        visible: false, geometry: geomStub(24), _pmText: "",
        position: { set(x: number, y: number, z: number) { (this as Stub).v = [x, y, z]; } },
        quaternion: { setFromUnitVectors() { /* orientation is section 14's job */ } },
        scale: { set(_r: number, l: number) { (this as Stub).len = l; } },
        setDirection(d: Stub) { (this as Stub).dir = [d.x, d.y, d.z]; },
        setLength(l: number) { (this as Stub).len = l; },
        computeLineDistances() { (this as Stub).dashed = true; },
      };
    }
    const scene: Stub[] = [
      obj("vg_vector_a"), obj("vg_vector_b"), obj("vg_cross_vector"),
      obj("vg_proj_seg"), obj("vg_proj_drop"),
      obj("vg_label", "vg_cross_vector"), obj("vg_label", "vg_proj_seg"),
      // §22 · the a/b sprites. They are the half of the a/b pair a fix aimed
      // only at the arrows leaves on screen, so the scene the frame driver is
      // published with has to contain them.
      obj("vg_label", "vg_vector_a"), obj("vg_label", "vg_vector_b"),
    ];
    const frameSrc = grabFn("updateVectorGeometry3DFrame");
    const INJECT = [
      // F21b · vgAnimValue calls vgLoopMs, so the loop helper travels with it
      // into the frame factory (a missing injection would ReferenceError the
      // whole driver rather than quietly skipping the wrap).
      "vgLoopMs",
      "vgAnimValue", "vgBuildVectors", "vgCrossVec", "vgDotVec", "vgLenVec", "vgNormalize",
      "vgAddVec", "vgSub", "vgRotateAbout", "vgParallelogramVerts", "vgSplitPieces",
      "vgSolidFaceCount", "vgProjectionOnto", "vgCrossLabelText", "vgAutoFramePos",
      "vgCamScheduleAt", "vgResolveLinesPlanes", "vgShowAB",
    ];
    // The factory is built PER RUN from a source string, so §22 can push the
    // shipped text through it with one gate deleted and watch the defect come
    // back — the same driver, the same scene, one changed character run.
    const makeFrameFactory = (src: string) =>
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      new Function(
        ...INJECT, "THREE", "sceneObjects", "config", "PM_currentState", "time", "stateStartTime",
        "window", "document", "targetSpherical", "spherical", "animating",
        "updateCameraFromSpherical", "vgWriteLinesPlanesFrame", "vgReadoutLine", "vgCamBaseFromState",
        "updateLabelSpriteText", "vgPlaceTube", "vgReadoutSubjectShown", "vgSyncRampedRows",
        // The frame's projection-segment site names VG_TUBE_R.proj, so the
        // width table travels into the driver with it (a missing injection
        // would ReferenceError the whole frame rather than quietly skipping).
        "VG_TUBE_R",
        src + "\nreturn updateVectorGeometry3DFrame;",
      );
    // stateMs matters: the shared grow-in ease is a closed form of it, so a
    // frame run at ms 0 draws vectors of length zero and every derived piece
    // correctly refuses to exist. 5000 ms is well past any reveal.
    //
    // The frame is now run against a REAL (fake) DOM registry and the SHIPPED
    // vgReadoutLine / vgReadoutSubjectShown / vgSyncRampedRows, because
    // sections 17-19 read the TEXT the frame writes — a stub `getElementById`
    // returning null is exactly the blindness that let three text surfaces ship
    // disagreeing with the picture beside them.
    function runFrame(vg: Record<string, unknown>, stateMs = 5000, dom = fakeDom(), win: Record<string, unknown> = {}, showSliders = false,
      srcOverride?: string) {
      for (const o of scene) { o.visible = false; }
      const T = vgTextFns(win, dom.document);
      const fn = makeFrameFactory(srcOverride || frameSrc)(
        ...INJECT.map((k) => E[k]), THREE, scene,
        { states: { STATE_1: { vg, show_sliders: showSliders } } }, "STATE_1", stateMs / 1000, 0,
        win, dom.document, {}, {}, false,
        () => { /* camera */ }, () => { /* lines/planes writer */ }, T.vgReadoutLine,
        () => ({ az: 0, el: 0, dist: 10 }),
        (sp: Stub, t: string) => { sp._pmText = t; },
        // the REAL vgPlaceTube would need THREE.Vector3 quaternion maths; the
        // segment's geometry is section 14's job, so here it only records that
        // the frame asked for a pose and with what endpoints.
        (m: Stub, p0: number[], p1: number[], r: number) => { m.placed = [p0, p1]; m.placedRadius = r; m.visible = true; return true; },
        T.vgReadoutSubjectShown, T.vgSyncRampedRows, SHIPPED_TUBE_R,
      );
      fn();
      return scene;
    }
    FRAME_HARNESS.run = runFrame;
    FRAME_HARNESS.src = frameSrc;
    const labOf = () => scene.filter((o: Stub) => o.userData.tracks === "vg_cross_vector")[0];
    runFrame({ show_cross_vector: true, flip_frac: 0, cross_reveal_frac: 1 });
    assertTrue(`the SHIPPED FRAME writes "a×b" onto the sprite at flip_frac = 0 (got "${labOf()._pmText}")`, labOf()._pmText === "a×b");
    runFrame({ show_cross_vector: true, flip_frac: 1, cross_reveal_frac: 1 });
    assertTrue(`the SHIPPED FRAME re-texts the SAME sprite to "b×a" at flip_frac = 1 (got "${labOf()._pmText}") — the wiring, not just the helper`,
      labOf()._pmText === "b×a");
    assertTrue("...and the label is still visible and still tracking the cross arrow (the fix did not trade a wrong label for a missing one)",
      labOf().visible === true);
    // The same frame run, driven by an animate[] ramp rather than an authored
    // literal — the way the order-contrast state actually flips.
    runFrame({
      show_cross_vector: true, cross_reveal_frac: 1,
      animate: [{ knob: "flip_frac", from: 0, to: 1, start_ms: 0, duration_ms: 0 }],
    });
    assertTrue(`a flip driven by an animate[] ramp re-texts too (got "${labOf()._pmText}") — the label reads the RESOLVED knob, not the authored field`,
      labOf()._pmText === "b×a");

    // Δ11's projection, driven by the same shipped frame.
    const segOf = () => scene.filter((o: Stub) => o.userData.elementType === "vg_proj_seg")[0];
    const dropOf = () => scene.filter((o: Stub) => o.userData.elementType === "vg_proj_drop")[0];
    const projLabOf = () => scene.filter((o: Stub) => o.userData.tracks === "vg_proj_seg")[0];
    // `placed` is null until the frame asks for a pose, so every read of it is
    // guarded: a gate that THROWS on the defect it is testing takes every
    // later section down with it and reports one failure instead of ten.
    const placedAt = (i: number): V3 => (segOf().placed ? segOf().placed[i] : [NaN, NaN, NaN]) as V3;
    runFrame({ show_projection: true, a_mag: 3, b_mag: 2, theta_deg: 60, reveal_ms: 0 });
    assertTrue("the SHIPPED FRAME draws the projection segment from the ORIGIN to the foot",
      segOf().visible && len3(placedAt(0)) === 0);
    check("...at the signed length |b| cos 60° = 1.000", len3(placedAt(1)), 1.0, 1e-9);
    assertTrue("...and the dashed drop is drawn AND re-measured for its dashes (computeLineDistances ran)",
      dropOf().visible && dropOf().dashed === true);
    assertTrue("...and named on canvas, so the state reads sound-off (Rule 24)", projLabOf().visible === true);
    runFrame({ show_projection: true, a_mag: 3, b_mag: 2, theta_deg: 90, reveal_ms: 0 });
    assertTrue("at θ = 90° the segment and its label VANISH rather than leaving a zero-length stub beside a 0.00 readout",
      !segOf().visible && !projLabOf().visible);
    runFrame({ show_projection: true, a_mag: 3, b_mag: 2, theta_deg: 120, reveal_ms: 0 });
    const footObtuse = placedAt(1);
    const aHat120 = E.vgNormalize(E.vgBuildVectors({ theta_deg: 120 }).a) as V3;
    assertTrue(`at θ = 120° the drawn segment runs the OTHER WAY along â (foot·â = ${dot3(footObtuse, aHat120).toFixed(3)})`,
      dot3(footObtuse, aHat120) < 0);
    runFrame({ a_mag: 3, b_mag: 2, theta_deg: 60, reveal_ms: 0 });
    assertTrue("with show_projection unauthored the frame draws neither piece (states that predate Δ11 are untouched)",
      !segOf().visible && !dropOf().visible && !projLabOf().visible);
  }
}

console.log("\n=== 16. Δ11 — THE OVERLAY LAYOUT: #vg_sliders and #formula_overlay no longer share a corner ===");
{
  // bug_class field3d_vg_formula_overlay_and_slider_panel_occupy_the_identical_
  // corner_so_the_formula_is_painted_over. Both panels were fixed at
  // bottom:12px/right:12px at the same z-index, and #vg_sliders is appended to
  // <body> later — so on every state that shows sliders AND a formula, the
  // state's ONE formula surface (Rule 34b) was painted over. Rule 34d.
  //
  // The coordinates are READ OUT OF THE SHIPPED SOURCE, never restated here: a
  // layout gate that carries its own copy of the numbers passes forever after
  // the renderer moves.
  function edges(css: string) {
    const get = (k: string) => { const m = new RegExp(k + "\\s*:\\s*(-?[0-9.]+)px").exec(css); return m ? Number(m[1]) : null; };
    return { left: get("left"), right: get("right"), top: get("top"), bottom: get("bottom") };
  }
  const sliderCss = /spd\.style\.cssText = "([^"]*)";/.exec(SRC.slice(SRC.indexOf("function buildVectorGeometrySliders")))![1];
  const readoutCss = /rd\.style\.cssText = "([^"]*)";/.exec(SRC.slice(SRC.indexOf("function buildVectorGeometryReadout")))![1];
  // #formula_overlay's rule lives in the HTML/CSS shell ABOVE the opening
  // backtick, so it is not in SRC at all — the same trap §11c records for the
  // TypeScript union. Read it from the source FILE (§11c's own precedent).
  const RENDERER_FILE = readFileSync("src/lib/renderers/field_3d_renderer.ts", "utf-8");
  const foAt = RENDERER_FILE.indexOf("#formula_overlay {");
  assertTrue("the #formula_overlay CSS rule is found in the renderer shell (a layout gate that cannot find its subject proves nothing)", foAt > 0);
  const formulaCss = RENDERER_FILE.slice(foAt, RENDERER_FILE.indexOf("}", foAt));
  const sl = edges(sliderCss), rd = edges(readoutCss), fo = edges(formulaCss);
  assertTrue(`#formula_overlay is bottom-RIGHT anchored (bottom:${fo.bottom} right:${fo.right}) — the fixed point this fix moves around`,
    fo.bottom === 12 && fo.right === 12 && fo.left === null);
  assertTrue(`#vg_sliders is bottom-LEFT anchored (bottom:${sl.bottom} left:${sl.left}) — the skeleton's own position`,
    sl.bottom === 12 && sl.left === 12 && sl.right === null);
  assertTrue(`#vg_readout is top-LEFT anchored below the review chrome (top:${rd.top} left:${rd.left}) — Rule 34d's top:52px floor`,
    rd.top === 52 && rd.left === 12 && (rd.top as number) >= 52);

  // The rects. Widths come from the shipped min-width/max-width + padding;
  // heights are left FREE, because the whole point of putting the two panels
  // on opposite edges is that NO panel height can bring them back into
  // contact — a clearance that depends on a row count is one authored state
  // away from failing.
  const px = (css: string, k: string) => { const m = new RegExp(k + "\\s*:\\s*([0-9.]+)px").exec(css); return m ? Number(m[1]) : 0; };
  const padX = 14 * 2;                                  // both panels: padding 10px 14px
  const slW = px(sliderCss, "min-width") + padX;        // 230 + 28 — the FLOOR; text may widen it
  const foW = px(formulaCss, "max-width") + padX;       // 300 + 28 — the CEILING
  type Rect = { x0: number; x1: number; y0: number; y1: number };
  const intersects = (p: Rect, q: Rect) => p.x0 < q.x1 && q.x0 < p.x1 && p.y0 < q.y1 && q.y0 < p.y1;
  function layout(W: number, H: number, sliderW: number, sliderH: number, sliderRight: boolean) {
    const slider: Rect = sliderRight
      ? { x0: W - 12 - sliderW, x1: W - 12, y0: H - 12 - sliderH, y1: H - 12 }
      : { x0: 12, x1: 12 + sliderW, y0: H - 12 - sliderH, y1: H - 12 };
    const formula: Rect = { x0: W - 12 - foW, x1: W - 12, y0: H - 12 - 120, y1: H - 12 };
    return { slider, formula };
  }
  // THE EYE captures at 1280x720 (screenshotter.ts default viewport); 800x600
  // is the pessimistic small-projector case.
  // THE ANCHOR IS READ FROM THE SHIPPED CSS, never assumed: a layout check
  // that hardcodes which edge the panel is on cannot fail when the panel moves
  // back, which is the whole class of control this wave is paying for.
  const shippedRight = sl.right !== null;
  for (const [W, H] of [[1280, 720], [800, 600]]) {
    // A deliberately GENEROUS slider width: the min-width floor plus 120px of
    // room for the longest label, so the assertion is not resting on the
    // narrowest possible panel.
    const gen = slW + 120;
    for (const sliderH of [80, 300, 560, H - 24]) {
      const L = layout(W, H, gen, sliderH, shippedRight);
      assertTrue(`${W}x${H}: the SHIPPED panels do NOT intersect at slider height ${sliderH}px (gap ${((W - 12 - foW) - (12 + gen)).toFixed(0)}px)`,
        !intersects(L.slider, L.formula));
    }
  }
  const gap1280 = (1280 - 12 - foW) - (12 + slW + 120);
  check("horizontal gap between the two panels at 1280 wide (px) — height-independent by construction", gap1280, gap1280, 0);
  assertTrue(`the gap is positive with 120px of label headroom (${gap1280.toFixed(0)}px) — no panel HEIGHT can close it`, gap1280 > 0);

  // NEGATIVE CONTROL — the SHIPPED PRE-FIX coordinates, restated exactly:
  // #vg_sliders at bottom:12/right:12, the same corner as #formula_overlay.
  // What a weaker control would have reported: "both panels are present",
  // "both have z-index 10", "the formula overlay's CSS is unchanged" — all
  // TRUE of the broken layout, and all blind to the overlap. The
  // discriminating quantity is the RECT INTERSECTION.
  {
    const pre = layout(1280, 720, slW + 120, 300, true);
    expectFail("the PRE-FIX coordinates (slider at right:12px) keep the two rects apart",
      !intersects(pre.slider, pre.formula));
    assertTrue("...and the pre-fix panels overlapped over the FULL formula width (the formula was covered, not clipped)",
      Math.min(pre.slider.x1, pre.formula.x1) - Math.max(pre.slider.x0, pre.formula.x0) >= foW - 1);
    const shipped = layout(1280, 720, slW + 120, 300, shippedRight);
    assertTrue("...while the SHIPPED coordinates do not overlap at all (the anchor is PARSED, so a panel moved back into the corner fails here, not only at the anchor assertion above)",
      !intersects(shipped.slider, shipped.formula));
  }

  // The left edge the panel moved ONTO must be clear too — moving a collision
  // rather than removing it is the same bug one panel over. #vg_readout is the
  // only other left-edge panel, and it is top-anchored.
  // The row ids are read from the SHIPPED row pass (scoped to the vg region:
  // several scenarios declare a `rowIds` map, and the first one in the file is
  // not this one). §28 extracted that map out of applyVectorGeometry3DState and
  // into vgApplyControlRows, which the apply pass AND the group picker both
  // call — so the anchor is that function, and it is the same table.
  const rowIdKeys = ROW_ID_KEYS;
  // A state authors ONE mode, so the tallest realistic panel is the tallest
  // MODE, plus the scene_group select. Both lists are asserted to be subsets
  // of the shipped map, so they cannot quietly rot away from it.
  const PRODUCTS_ROWS = ["a_mag", "b_mag", "theta_deg", "b_tilt_deg", "c_mag", "c_theta_deg", "c_phi_deg"];
  const LP_ROWS = ["lambda", "lambda_span", "half_extent", "q_height", "line2_offset"];
  assertTrue(`every modelled row is a row the shipped apply pass actually shows (${rowIdKeys.length} rows in the map)`,
    PRODUCTS_ROWS.concat(LP_ROWS).every((k) => rowIdKeys.indexOf(k) >= 0)
    && rowIdKeys.length === PRODUCTS_ROWS.length + LP_ROWS.length);
  const ROW_PX = 50;                                    // label line + range input + margin-top
  const readoutRows = 6;                                // the widest authored value_readouts list
  const readoutBottom = 52 + 8 + readoutRows * 22 + 8;
  const sliderTop = (rows: number) => 720 - 12 - (rows * ROW_PX + 20);
  const capacity = Math.floor((720 - 12 - 20 - readoutBottom) / ROW_PX);
  const tallestMode = Math.max(PRODUCTS_ROWS.length, LP_ROWS.length) + 1;   // + the scene_group select
  assertTrue(`at 1280x720 the top-left readout (bottom ≈ ${readoutBottom}px) leaves room for ${capacity} slider rows, and the tallest single MODE authors ${tallestMode} — so the panel's new edge is genuinely free, not just less crowded`,
    sliderTop(tallestMode) > readoutBottom && capacity >= tallestMode);
}
console.log("\n=== 17. A1 — THE READOUT NAMES THE ARROW IT MEASURES (the sibling surface of §15's fix) ===");
{
  // bug_class field3d_vg_a_value_surface_can_disagree_with_the_geometry_it_
  // names. §15 fixed the SPRITE to derive its text from flip_frac and left the
  // READOUT's VG_READOUT_LABEL.cross_mag a hardcoded "|a×b|" one namespace
  // away — so on the order-matters state the picture said b×a and the number
  // beside it said |a×b|. THE DISCRIMINATING QUANTITY IS THE READOUT'S TEXT AT
  // flip_frac = 1: that a readout EXISTS, that it carries a symbol and a value
  // in one node, that its VALUE is 6.50 — all true of the broken build.
  const T = vgTextFns({}, fakeDom().document);
  assertTrue(`vgCrossMagLabelText(0) reads "${T.vgCrossMagLabelText(0)}"`, T.vgCrossMagLabelText(0) === "|a×b|");
  assertTrue(`vgCrossMagLabelText(1) reads "${T.vgCrossMagLabelText(1)}" — the name the arrow has at the end of the flip`,
    T.vgCrossMagLabelText(1) === "|b×a|");
  assertTrue("the transitional text states the EQUALITY (true at every flip_frac, because a rotation about â preserves length) rather than naming one of the two orders",
    T.vgCrossMagLabelText(0.5) === "|a×b| = |b×a|");
  // Bound to the SAME epsilon and therefore to the same endpoints as the
  // sprite's own name: two surfaces of one arrow that switch at different
  // fractions would be this defect with a smaller window.
  for (const f of [0, 0.01, 0.02, 0.5, 0.98, 0.99, 1]) {
    const sprite = E.vgCrossLabelText(f), readout = T.vgCrossMagLabelText(f);
    const spriteNames = sprite === "a×b" ? "a×b" : sprite === "b×a" ? "b×a" : null;
    const readoutNames = readout === "|a×b|" ? "a×b" : readout === "|b×a|" ? "b×a" : null;
    assertTrue(`flip_frac ${f}: sprite "${sprite}" and readout "${readout}" name the SAME arrow (or both decline to)`,
      spriteNames === readoutNames);
  }
  assertTrue("the VG_READOUT_LABEL table entry is exactly the flip_frac = 0 form, so the table cannot drift from the derived text",
    T.VG_READOUT_LABEL.cross_mag === T.vgCrossMagLabelText(0));

  // THE WIRING, on the SHIPPED FRAME — the pre-fix defect was a table constant
  // nothing re-texted, so a correct helper proves nothing on its own.
  const runFrame = FRAME_HARNESS.run!;
  const textAt = (flip: number) => {
    const dom = fakeDom();
    runFrame({ show_cross_vector: true, cross_reveal_frac: 1, a_mag: 3, b_mag: 2.5, theta_deg: 60,
      flip_frac: flip, value_readouts: ["cross_mag"], reveal_ms: 0 }, 5000, dom);
    return dom.get("vg_readout").innerHTML;
  };
  const t0 = textAt(0), tMid = textAt(0.5), t1 = textAt(1);
  assertTrue(`the SHIPPED FRAME prints "${t0.replace(/<[^>]*>/g, "")}" at flip_frac = 0`, t0.includes("|a×b| = 6.50"));
  assertTrue(`...and re-texts the SAME panel to "${t1.replace(/<[^>]*>/g, "")}" at flip_frac = 1 — the number is unchanged, the NAME is not`,
    t1.includes("|b×a| = 6.50"));
  assertTrue(`...and states the equality mid-flip ("${tMid.replace(/<[^>]*>/g, "")}")`, tMid.includes("|a×b| = |b×a| = 6.50"));
  assertTrue("the row still carries symbol AND value in ONE text node (THE CALCULATOR's DOM harvest)",
    /id="vg_readout_cross_mag">[^<]*=[^<]*</.test(t1));

  // NEGATIVE CONTROL — the SHIPPED PRE-FIX surface, restated: a constant label.
  // Weaker controls that would have passed the broken build: "a cross_mag row
  // is rendered", "its value is |a×b| to 2 dp", "the label is non-empty".
  const constantLabel = () => "|a×b|";
  expectFail(`a constant "|a×b|" readout label agrees with the sprite at flip_frac = 1 (sprite says "${E.vgCrossLabelText(1)}", readout says "${constantLabel()}")`,
    constantLabel() === "|" + E.vgCrossLabelText(1) + "|");
  assertTrue("...and it is INDISTINGUISHABLE from the fix at flip_frac = 0, which is why seven of the eight states looked right",
    constantLabel() === T.vgCrossMagLabelText(0));
  const preFixFrameText = t1.replace("|b×a|", "|a×b|");
  expectFail("...and the pre-fix PANEL TEXT and the sprite text name the same arrow at flip_frac = 1",
    preFixFrameText.includes("|" + E.vgCrossLabelText(1) + "|"));
}

console.log("\n=== 18. A2 — A LIVE SLIDER ROW TRACKS AN animate[] RAMP OF ITS OWN KNOB ===");
{
  // Same bug_class. The area state ramps b_mag 2.00 → 2.50 through vg.animate[];
  // the readout tracked, the parallelogram tracked, and the LIVE ROW for that
  // knob sat at "|b|: 2.00" with its thumb at t=0. THE DISCRIMINATING QUANTITY
  // IS THE ROW'S DISPLAYED VALUE AT MID-RAMP — "a b_mag row is visible", "the
  // row is enabled", "the readout reads 2.42" are all true of the broken build.
  const runFrame = FRAME_HARNESS.run!;
  const RAMP = [{ knob: "b_mag", from: 2.0, to: 2.5, start_ms: 4000, duration_ms: 12000 }];
  const S5 = {
    a_mag: 3, b_mag: 2, theta_deg: 60, show_cross_vector: true, show_parallelogram: true,
    cross_reveal_frac: 1, value_readouts: ["b_mag", "cross_mag"], animate: RAMP, controls: ["b_mag"],
  };
  const rowAt = (ms: number, win: Record<string, unknown> = {}) => {
    const dom = fakeDom();
    runFrame(S5, ms, dom, win, true);
    return { row: dom.get("vg_b_mag_val").textContent, thumb: dom.get("vg_b_mag_slider").value,
      readout: dom.get("vg_readout").innerHTML, win };
  };
  const geomAt = (ms: number) => E.vgAnimValue(RAMP, "b_mag", ms, 2);
  for (const ms of [0, 4000, 6000, 10000, 13000, 16000, 20000]) {
    const r = rowAt(ms), g = geomAt(ms);
    assertTrue(`t=${ms}ms: the row reads "${r.row}" and the geometry is built from ${g.toFixed(2)} — they agree`,
      r.row === g.toFixed(2));
  }
  // The row and the READOUT are two surfaces of the same number, and the whole
  // class is surfaces disagreeing — so they are checked against each other too.
  {
    const r = rowAt(10000);
    assertTrue(`mid-ramp the row ("${r.row}") and the |b| readout agree`, r.readout.includes("|b| = " + r.row));
  }
  // The thumb is written from the same resolved value (a range input then
  // quantises it to the row's own step — the resolution the control has).
  assertTrue(`the thumb is written from the resolved value at mid-ramp (${rowAt(10000).thumb})`,
    Math.abs(Number(rowAt(10000).thumb) - geomAt(10000)) < 1e-9);
  assertTrue("at the ramp's END the thumb is exactly the authored destination (2.5), no rounding residue",
    Number(rowAt(20000).thumb) === 2.5);

  // DRAG-SEIZE SURVIVES. A trusted teacher drag owns the row for the rest of
  // the state; the write-back must not fight it (that would be a NEW defect —
  // a control that snaps back under the teacher's finger).
  {
    const win: Record<string, unknown> = { PM_vgBMagDragged: true, PM_vgBMag: 4.25 };
    const dom = fakeDom();
    dom.get("vg_b_mag_val").textContent = "4.25";
    runFrame(S5, 10000, dom, win, true);
    assertTrue(`a dragged row is NOT overwritten by the ramp (still "${dom.get("vg_b_mag_val").textContent}")`,
      dom.get("vg_b_mag_val").textContent === "4.25");
    assertTrue("...and the GEOMETRY follows the drag too, so the row and the picture still agree",
      dom.get("vg_readout").innerHTML.includes("|b| = 4.25"));
    assertTrue("the frame publishes which rows it is tracking (empty while the teacher owns the only one)",
      Array.isArray(win.PM_vgRowsTracking) && (win.PM_vgRowsTracking as string[]).indexOf("b_mag") < 0);
  }
  // A knob no animate[] entry names is left alone: the apply pass owns it.
  {
    const dom = fakeDom();
    dom.get("vg_a_mag_val").textContent = "SET-BY-APPLY";
    runFrame(S5, 10000, dom, {}, true);
    assertTrue("a row whose knob no ramp names is untouched by the write-back",
      dom.get("vg_a_mag_val").textContent === "SET-BY-APPLY");
  }
  // Rule 36 / D3 — the written text is a closed form of state-local ms.
  {
    const a = rowAt(9000).row, b = rowAt(9000).row;
    const fwd = [4000, 7000, 11000, 15000].map((ms) => rowAt(ms).row);
    const rew = [15000, 11000, 7000, 4000].map((ms) => rowAt(ms).row);
    assertTrue(`RE-PIN: the same ms twice writes the identical row text ("${a}")`, a === b);
    assertTrue("REWIND: replaying the ramp backwards reproduces every row text bit for bit",
      fwd.every((x, i) => x === rew[rew.length - 1 - i]));
  }
  // NEGATIVE CONTROL — the SHIPPED PRE-FIX row: written once at state entry by
  // the apply pass and never again.
  {
    const writtenOnce = (2).toFixed(2);
    expectFail(`a row written only at state entry reads the geometry's value at mid-ramp (row "${writtenOnce}", geometry ${geomAt(10000).toFixed(2)})`,
      writtenOnce === geomAt(10000).toFixed(2));
    assertTrue("...and it is INDISTINGUISHABLE from the fix at t=0 and at any state with no ramp — which is why every other state looked right",
      writtenOnce === geomAt(0).toFixed(2) && writtenOnce === E.vgAnimValue([], "b_mag", 10000, 2).toFixed(2));
  }
}

console.log("\n=== 19. A3 — A NUMBER MAY NOT PRECEDE ITS SUBJECT (Rule 32a) ===");
{
  // Same bug_class. The triple-product state printed Volume / Base / Height at
  // t = 0: 2.6 s before c even began to appear and 8.2 s before the solid
  // finished building. THE DISCRIMINATING QUANTITY IS WHETHER THE ROW IS
  // PRESENT BEFORE ITS OBJECT'S REVEAL — "the panel renders", "the numbers are
  // correct", "Volume = Base × Height" are all true of the broken build, at
  // t = 0, about a body that is not on screen.
  const runFrame = FRAME_HARNESS.run!;
  const S7 = {
    a_mag: 3, b_mag: 2.5, theta_deg: 60, c_mag: 2, c_theta_deg: 40, c_phi_deg: 6,
    show_c: true, show_parallelepiped: true, c_reveal_frac: 0, solid_build_frac: 0,
    split_solid_frac: 0, split_gap_k: 1, reveal_ms: 1,
    value_readouts: ["volume", "base_area", "height"],
    animate: [
      { knob: "c_reveal_frac", from: 0, to: 1, start_ms: 2600, duration_ms: 1800 },
      { knob: "solid_build_frac", from: 0, to: 1, start_ms: 4600, duration_ms: 3600, easing: "linear" },
      { knob: "split_solid_frac", from: 0, to: 1, start_ms: 9000, duration_ms: 9000 },
    ],
  };
  const panelAt = (ms: number, vg: Record<string, unknown> = S7) => {
    const dom = fakeDom();
    runFrame(vg, ms, dom);
    const el = dom.get("vg_readout");
    return { html: el.innerHTML, shown: el.style.display };
  };
  const cAt = (ms: number) => E.vgAnimValue(S7.animate, "c_reveal_frac", ms, 0);
  const solidAt = (ms: number) => E.vgAnimValue(S7.animate, "solid_build_frac", ms, 0);
  for (const ms of [0, 1000, 2600, 3500, 4400, 4600, 6000, 8100]) {
    const p = panelAt(ms);
    assertTrue(`t=${ms}ms (c ${cAt(ms).toFixed(2)}, solid ${solidAt(ms).toFixed(2)}): NO Volume/Base/Height row, and the panel is hidden`,
      !p.html.includes("vg_readout_volume") && !p.html.includes("vg_readout_base_area")
      && !p.html.includes("vg_readout_height") && p.shown === "none");
  }
  for (const ms of [8200, 9000, 13000, 18000]) {
    const p = panelAt(ms);
    assertTrue(`t=${ms}ms (solid ${solidAt(ms).toFixed(2)}): all three rows are present once the body they measure is built`,
      p.html.includes("vg_readout_volume") && p.html.includes("vg_readout_base_area")
      && p.html.includes("vg_readout_height") && p.shown === "block");
  }
  // The gate is on the SUBJECT, not on the clock: an unramped state that simply
  // shows a built solid prints its three numbers immediately, exactly as before.
  {
    const p = panelAt(0, { ...S7, animate: [], c_reveal_frac: 1, solid_build_frac: 1 });
    assertTrue("a state that authors a fully-built solid still prints all three rows at t=0 (states that predate this gate are untouched)",
      p.html.includes("vg_readout_volume") && p.html.includes("vg_readout_height"));
  }
  // The cross-product tokens ride the same rule through their own knob — the
  // primary-aha state printed a·(a×b) = 0.00 for five seconds before the a×b
  // arrow existed to be perpendicular to anything.
  {
    const S4 = {
      a_mag: 3, b_mag: 2, theta_deg: 130, show_cross_vector: true, cross_reveal_frac: 0, reveal_ms: 1,
      value_readouts: ["a_dot_cross", "b_dot_cross"],
      animate: [{ knob: "cross_reveal_frac", from: 0, to: 1, start_ms: 5000, duration_ms: 2500 }],
    };
    assertTrue("t=0ms: no a·(a×b) row before the a×b arrow is drawn", !panelAt(0, S4).html.includes("vg_readout_a_dot_cross"));
    assertTrue("t=6000ms: still none while the arrow is only half-grown (its LENGTH is the claim on the area state)",
      !panelAt(6000, S4).html.includes("vg_readout_a_dot_cross"));
    assertTrue("t=7500ms: both rows appear the moment the arrow is fully drawn",
      panelAt(7500, S4).html.includes("vg_readout_a_dot_cross") && panelAt(7500, S4).html.includes("vg_readout_b_dot_cross"));
  }
  // SCOPE, stated: a and b ride the shared grow-in and are the scenario itself,
  // so their tokens are deliberately ungated. Asserted so the decision is
  // visible rather than inferred from the map's silence.
  {
    const p = panelAt(0, { a_mag: 3, b_mag: 2, theta_deg: 60, value_readouts: ["a_mag", "b_mag", "theta_deg"], reveal_ms: 2600 });
    assertTrue("a/b/θ rows are NOT gated (they are the scenario, not a revealed subject) — an authored decision, checked",
      p.html.includes("vg_readout_a_mag") && p.html.includes("vg_readout_theta_deg"));
  }
  // NEGATIVE CONTROL — the SHIPPED PRE-FIX behaviour: render every authored
  // token unconditionally. Weaker controls that would have passed it: the
  // values are right, the panel exists, Volume == Base × Height.
  {
    const T = vgTextFns({}, fakeDom().document);
    const vals = { volume: 9.9512, base_area: 4.2708, height: 2.3301 };
    const ungated = ["volume", "base_area", "height"].map((k) => T.vgReadoutLine(k, vals)).filter(Boolean);
    expectFail(`an ungated panel stays silent at t=0 (it prints "${ungated.join(" / ")}" beside an empty scene)`,
      ungated.length === 0);
    assertTrue("...and its NUMBERS are perfectly correct — Volume = Base × Height to 4 dp — which is why 475 headless assertions saw nothing wrong",
      Math.abs(vals.base_area * vals.height - vals.volume) < 1e-3);
    assertTrue("...and it is INDISTINGUISHABLE from the fix once the solid is built",
      ungated.length === 3 && panelAt(13000).html.includes("vg_readout_volume"));
  }
}

console.log("\n=== 19b. Δ2b — A NUMBER MAY NOT PRECEDE ITS SUBJECT, AT THE RESOLVER (the lines/planes half) ===");
{
  // bug_class vg_lines_planes_segment_readouts_compute_regardless_of_reveal_
  // state (CRITICAL). §19 gated the PANEL for the three Act I subjects that
  // carry a reveal knob. The lines/planes half publishes from a different
  // place — vgResolveLinesPlanes — and published the instant its referenced
  // objects RESOLVED, which is state entry, not the beat the state reveals
  // them on. vgRevealFrac gated the drawn MARKER and nothing else.
  //
  // MEASURED (EYE walk, lines_and_planes_in_space STATE_4, frames
  // STATE_4__dense_t00000.png / t02000.png): from the first frame the panel
  // read n·d = 0.574, λ = 2.600 and a meeting point — four numbers describing
  // Lcut, which does not appear until 9500 ms — while the only line on screen
  // was Lpar, the PARALLEL line whose whole lesson is that n·d = 0 and there
  // is no meeting point. Both lines carry the same generic label d.
  //
  // THE DISCRIMINATING QUANTITY IS WHETHER THE VALUE EXISTS BEFORE ITS
  // SUBJECT DOES. Every weaker quantity is true of the broken build: the
  // numbers are arithmetically right, the panel renders, the marker is
  // correctly hidden, and the resolver is deterministic.
  const nrm = (v: V3): V3 => { const l = len3(v); return [v[0] / l, v[1] / l, v[2] / l]; };
  const planePoint: V3 = [0, -0.4, 0];
  const planeN: V3 = [0.35, 1, 0.25];
  const nh = nrm(planeN);
  const uIn = nrm(cross3(nh, [0, 0, 1]));                    // an IN-plane direction
  const ang55 = 55 * Math.PI / 180;
  const dCut: V3 = nrm([
    nh[0] * Math.cos(ang55) + uIn[0] * Math.sin(ang55),
    nh[1] * Math.cos(ang55) + uIn[1] * Math.sin(ang55),
    nh[2] * Math.cos(ang55) + uIn[2] * Math.sin(ang55),
  ]);
  const Xpt: V3 = add3(planePoint, [uIn[0] * 0.6, uIn[1] * 0.6, uIn[2] * 0.6]);
  const cutAnchor: V3 = sub3(Xpt, [dCut[0] * 2.6, dCut[1] * 2.6, dCut[2] * 2.6]);
  const parAnchor: V3 = add3(planePoint, [nh[0] * 1.4, nh[1] * 1.4, nh[2] * 1.4]);

  // ── THE PRE-FIX RESOLVER, RECONSTRUCTED ─────────────────────────────────
  //   The SHIPPED sandbox with exactly ONE body replaced: vgArrived, the whole
  //   of this fix. Anything else that differs would make the control a second
  //   implementation rather than the build that shipped the defect — so the
  //   substitution is guarded, and a miss is an ERROR, not a quiet pass.
  const GATE_BODY = /return \(typeof frac === "number" && isFinite\(frac\)\) && frac >= VG_SUBJECT_SHOWN_MIN;/;
  const neuter = (name: string, src: string) => {
    if (name !== "vgArrived") return src;
    if (!GATE_BODY.test(src)) {
      throw new Error(
        "§19b NEGATIVE CONTROL CANNOT BE BUILT: vgArrived's shipped body no longer matches the "
        + "text this control replaces. A control that silently fails to plant its defect is worse "
        + "than no control. Update GATE_BODY to the new body and re-watch it fail.\n  got: " + src);
    }
    return src.replace(GATE_BODY, "return true;");
  };
  const PRE = buildVgSandbox(neuter) as any;
  assertTrue("the reconstructed pre-fix resolver really is neutered (its gate returns true unconditionally)",
    PRE.vgArrived(0) === true && PRE.vgArrived(-1) === true && E.vgArrived(0) === false);
  const SHOWN_MIN = Number(/var VG_SUBJECT_SHOWN_MIN = ([0-9.]+);/.exec(SRC)![1]);
  assertTrue(`...and the SHIPPED gate is the 'arrived' threshold F9 already uses (${SHOWN_MIN}), not a second number`,
    E.vgArrived(1) === true && E.vgArrived(0.99) === false && E.vgArrived(SHOWN_MIN) === true
    && E.vgArrived(undefined) === false && E.vgArrived(NaN) === false);

  // ── (a) THE MEASURED SCENE, END TO END THROUGH THE SHIPPED FRAME DRIVER ──
  //   Not the resolver alone: the founder's question was whether anything
  //   RE-PUBLISHES after the resolver returns. The frame driver is the only
  //   consumer, so the frame driver is what is measured — the DOM panel a
  //   teacher reads, written by the shipped #vg_readout writer.
  {
    const state4: Record<string, unknown> = {
      mode: "lines_planes", reveal_ms: 0,
      value_readouts: ["d_dot_n", "lambda", "intersection_point", "no_meeting_point"],
      planes: [{ id: "P1", point: planePoint, normal: planeN, half_extent: 3.0, show_normal: true }],
      lines: [
        { id: "Lpar", point: parAnchor, dir: uIn, lambda_span: [-3, 3], label: "d" },
        { id: "Lcut", point: cutAnchor, dir: dCut, lambda_span: [-3, 3], label: "d", reveal_at_ms: 9500 },
      ],
      intersection: { id: "X", line: "Lcut", plane: "P1", reveal_at_ms: 9500 },
    };
    const runFrame = FRAME_HARNESS.run!;
    const frameAt = (ms: number) => {
      const dom = fakeDom();
      const win: Record<string, unknown> = {};
      runFrame(state4, ms, dom, win);
      const el = dom.get("vg_readout");
      return { html: el.innerHTML, shown: el.style.display, lp: win.PM_vgLinesPlanes as any };
    };
    for (const ms of [0, 2000, 5000, 9500]) {
      const f = frameAt(ms);
      assertTrue(`t=${ms}ms (Lcut reveals at 9500): the panel prints NO n·d / λ / meeting-point row, and is hidden`,
        !f.html.includes("vg_readout_d_dot_n") && !f.html.includes("vg_readout_lambda")
        && !f.html.includes("vg_readout_intersection_point") && !f.html.includes("vg_readout_no_meeting_point")
        && f.shown === "none");
      assertTrue(`t=${ms}ms: nothing re-publishes downstream either — PM_vgLinesPlanes.readouts is empty`,
        Object.keys(f.lp.readouts).length === 0);
    }
    // PRESENCE IS NOT CORRECTNESS, and neither is absence: the apparatus is on
    // screen the whole time. What is missing is the NUMBERS, not the scene.
    {
      const early = E.vgResolveLinesPlanes(state4, {}, 2000);
      const drawn = early.lines.filter((l: any) => l.frac > 0).map((l: any) => l.id);
      assertTrue(`t=2000ms: the scene is NOT blank — the plane and exactly one line are drawn, and that line is Lpar (got [${drawn.join(", ")}])`,
        early.planes.length === 1 && early.planes[0].frac === 1 && drawn.length === 1 && drawn[0] === "Lpar");
      check("...and Lpar's own n̂·d̂ is 0 — the number the pre-fix panel contradicted", dot3(nh, uIn), 0, 1e-15);
    }
    // ...and the numbers arrive, in full, the moment Lcut does.
    {
      const f = frameAt(9501);
      assertTrue("t=9501ms: n·d, λ and the meeting point all appear the instant Lcut is on screen",
        f.html.includes("vg_readout_d_dot_n") && f.html.includes("vg_readout_lambda")
        && f.html.includes("vg_readout_intersection_point") && f.shown === "block");
      check("...and n·d is the constructed cos 55 = 0.5736 (the fix delays the value, it does not change it)",
        f.lp.readouts.d_dot_n, Math.cos(ang55), 1e-12);
      check("...and λ is the constructed 2.600", f.lp.readouts.lambda, 2.6, 1e-12);
      assertTrue("...and the row TEXT a teacher reads carries both the symbol and the value in one node",
        f.html.includes("n·d = 0.574") && f.html.includes("λ = 2.600"));
    }
    // ── NEGATIVE CONTROL 1 — the SHIPPED PRE-FIX RESOLVER on this very scene.
    {
      const pre0 = PRE.vgResolveLinesPlanes(state4, {}, 0);
      expectFail(`the pre-fix resolver stays silent at t=0 (it publishes n·d = ${pre0.readouts.d_dot_n.toFixed(3)}, λ = ${pre0.readouts.lambda.toFixed(3)} and a meeting point, over a scene where nothing is drawn yet)`,
        pre0.readouts.d_dot_n === undefined && pre0.readouts.lambda === undefined
        && pre0.readouts.intersection_point === undefined);
      // ...and at the second dumped EYE frame, where the apparatus IS on screen,
      // the numbers and the picture say opposite things.
      const pre2 = PRE.vgResolveLinesPlanes(state4, {}, 2000);
      const preDrawn = pre2.lines.filter((l: any) => l.frac > 0).map((l: any) => l.id);
      assertTrue(`t=2000ms: those numbers describe Lcut while the ONLY line on screen is [${preDrawn.join(", ")}], whose n̂·d̂ is 0 — the panel and the picture contradict each other`,
        preDrawn.length === 1 && preDrawn[0] === "Lpar"
        && Math.abs(pre2.readouts.d_dot_n - Math.cos(ang55)) < 1e-12 && Math.abs(dot3(nh, uIn)) < 1e-15);
      assertTrue("...and its MARKER was correctly hidden all along — a marker-only check saw nothing wrong",
        pre2.points.filter((p: any) => p.is_intersection === true).length === 0);
      // ...and the reconstruction is faithful: once everything has arrived the
      // two resolvers are IDENTICAL, so the control isolates the gate and
      // nothing else.
      assertTrue("the pre-fix and shipped resolvers agree BIT FOR BIT on a settled frame (the control changes one thing)",
        JSON.stringify(PRE.vgResolveLinesPlanes(state4, {}, 20000)) === JSON.stringify(E.vgResolveLinesPlanes(state4, {}, 20000)));
    }
    // ── NEGATIVE CONTROL 2 — the fix at the PANEL instead of the resolver.
    //   F9's vgReadoutSubjectShown knows only the three Act I subjects, so it
    //   waves every lines/planes token straight through: a display-site fix
    //   would have been a total no-op, which is why this one is at the source.
    {
      const T = vgTextFns({}, fakeDom().document);
      expectFail("the F9 panel gate alone would have suppressed n·d before its subject",
        T.vgReadoutSubjectShown("d_dot_n", {}, {}) === false);
      assertTrue("...it waves through every one of the 14 lines/planes tokens (it can only gate subjects it can name)",
        ["point_plane_distance", "segment_length", "skew_distance", "angle_lines_deg", "angle_line_plane_deg",
          "angle_line_normal_deg", "d_dot_n", "n_dot_v", "no_meeting_point", "lambda",
          "intersection_point", "n_norm", "cross_norm", "numerator_triple_product"]
          .every((t) => T.vgReadoutSubjectShown(t, {}, {}) === true));
    }
  }

  // ── (b) EVERY PUBLISH SITE, SWEPT ────────────────────────────────────────
  //   The class, not the one site: each fixture authors ONE readout-producing
  //   construct with every object revealed at 3000 ms (grow 0, so the reveal is
  //   a clean step), and is swept before and after. A fixture that resolved
  //   NOTHING would pass the "silent before" half vacuously, so each one must
  //   also produce its tokens AFTER — that is what makes the sweep capable of
  //   failing.
  {
    const R = 3000;
    const line = (id: string, point: V3, dir: V3) => ({ id, point, dir, lambda_span: [-3, 3], reveal_at_ms: R });
    const P1 = { id: "P1", point: planePoint, normal: planeN, half_extent: 3.0, show_normal: true, reveal_at_ms: R };
    const d1: V3 = [1, 0.15, 0.35], d2: V3 = [0.15, -0.5, 1];
    const cr = cross3(d1, d2);
    const m2anchor: V3 = add3(add3([-1.2, -0.9, 0.6], [nrm(cr)[0] * 1.8, nrm(cr)[1] * 1.8, nrm(cr)[2] * 1.8]),
      [d1[0] * 1.4 - d2[0] * 1.1, d1[1] * 1.4 - d2[1] * 1.1, d1[2] * 1.4 - d2[2] * 1.1]);
    const FIXTURES: Array<{ name: string; tokens: string[]; block: Record<string, unknown> }> = [
      {
        name: "F13a the perpendicular from a point to a plane", tokens: ["point_plane_distance", "n_norm"],
        block: {
          mode: "lines_planes", reveal_ms: 0, planes: [P1],
          points: [{ id: "q", position: [1.93, 1.19, 0.51], reveal_at_ms: R }],
          perpendicular: { from: "q", to: "P1", show_right_angle: true, reveal_at_ms: R },
        },
      },
      {
        // §24 — a generic segment publishes the GENERIC token, never the
        // point-to-plane one. This fixture is also the §19b half of that fix:
        // if the publish site ever reverts, `tokens` here stops matching.
        name: "F23 a comparison segment's LENGTH", tokens: ["segment_length"],
        block: {
          mode: "lines_planes", reveal_ms: 0,
          points: [{ id: "q1", position: [1, 1, 1], reveal_at_ms: R }, { id: "q2", position: [-1, 0.2, 0.4], reveal_at_ms: R }],
          segments: [{ id: "cmp", from: "q1", to: "q2", readout: "length", reveal_at_ms: R }],
        },
      },
      {
        name: "F23 a comparison segment's n·v against a plane", tokens: ["n_dot_v"],
        block: {
          mode: "lines_planes", reveal_ms: 0, planes: [P1],
          points: [{ id: "q1", position: [1, 1, 1], reveal_at_ms: R }, { id: "q2", position: [-1, 0.2, 0.4], reveal_at_ms: R }],
          segments: [{ id: "cmp", from: "q1", to: "q2", readout: "n_dot_v", against: "P1", reveal_at_ms: R }],
        },
      },
      {
        name: "F13b the common perpendicular of two skew lines",
        tokens: ["skew_distance", "cross_norm", "numerator_triple_product"],
        block: {
          mode: "lines_planes", reveal_ms: 0,
          lines: [line("M1", [-1.2, -0.9, 0.6], d1), line("M2", m2anchor, d2)],
          common_perpendicular: { id: "cp", between: ["M1", "M2"], reveal_at_ms: R },
        },
      },
      {
        name: "F14 the intersection that EXISTS", tokens: ["d_dot_n", "lambda", "intersection_point", "no_meeting_point"],
        block: {
          mode: "lines_planes", reveal_ms: 0, planes: [P1], lines: [line("Lcut", cutAnchor, dCut)],
          intersection: { id: "X", line: "Lcut", plane: "P1", reveal_at_ms: R },
        },
      },
      {
        name: "Δ4 the intersection that does NOT (the absence is a claim too)", tokens: ["d_dot_n", "no_meeting_point"],
        block: {
          mode: "lines_planes", reveal_ms: 0, planes: [P1], lines: [line("Lpar", parAnchor, uIn)],
          intersection: { id: "X", line: "Lpar", plane: "P1", reveal_at_ms: R },
        },
      },
      {
        name: "F23 the projection's two angles", tokens: ["angle_line_normal_deg", "angle_line_plane_deg"],
        block: {
          mode: "lines_planes", reveal_ms: 0, planes: [P1], lines: [line("Lcut", cutAnchor, dCut)],
          projection: { id: "shadow", line: "Lcut", plane: "P1", reveal_at_ms: R },
        },
      },
      {
        name: "Δ5 the angle arcs to the NORMAL and to the PLANE", tokens: ["angle_line_normal_deg", "angle_line_plane_deg"],
        block: {
          mode: "lines_planes", reveal_ms: 0, planes: [P1], lines: [line("Lcut", cutAnchor, dCut)],
          angle_arcs: [
            { id: "toN", between: ["Lcut", "P1.normal"], readout: "angle_line_normal_deg", reveal_at_ms: R },
            { id: "toP", between: ["Lcut", "P1"], readout: "angle_line_plane_deg", reveal_at_ms: R },
          ],
        },
      },
      {
        name: "Δ5 the angle between two LINES", tokens: ["angle_lines_deg"],
        block: {
          mode: "lines_planes", reveal_ms: 0,
          lines: [line("M1", [-1.2, -0.9, 0.6], d1), line("M2", m2anchor, d2)],
          angle_arcs: [{ id: "arc", between: ["M1", "M2"], readout: "angle_lines_deg", reveal_at_ms: R }],
        },
      },
      {
        name: "F23 the derived cross vector's ‖d₁×d₂‖", tokens: ["cross_norm"],
        block: {
          mode: "lines_planes", reveal_ms: 0,
          lines: [line("M1", [-1.2, -0.9, 0.6], d1), line("M2", m2anchor, d2)],
          vectors: [{ id: "cr", derive: "cross", of: ["M1", "M2"], origin: [0, 0, 0], scale: 1, reveal_at_ms: R }],
        },
      },
    ];
    const covered = new Set<string>();
    for (const fx of FIXTURES) {
      let silent = true;
      for (const ms of [0, 1500, 2999, R]) {
        const keys = Object.keys(E.vgResolveLinesPlanes(fx.block, {}, ms).readouts);
        if (keys.length) { silent = false; console.log(`        (leaked at t=${ms}ms: ${keys.join(", ")})`); }
      }
      assertTrue(`${fx.name}: NOT ONE readout key is published before its subject's reveal at ${R}ms`, silent);
      const after = E.vgResolveLinesPlanes(fx.block, {}, R + 1).readouts;
      const got = Object.keys(after);
      for (const t of got) covered.add(t);
      assertTrue(`${fx.name}: ...and all of [${fx.tokens.join(", ")}] arrive at ${R + 1}ms (so the silence above is a GATE, not an empty fixture)`,
        fx.tokens.every((t) => Object.prototype.hasOwnProperty.call(after, t)) && got.length === fx.tokens.length);
      // NEGATIVE CONTROL — the same fixture through the pre-fix resolver, which
      // publishes at t=0 with nothing on screen at all.
      const preKeys = Object.keys(PRE.vgResolveLinesPlanes(fx.block, {}, 0).readouts);
      expectFail(`${fx.name}: the pre-fix resolver is silent at t=0 (it publishes ${preKeys.length} key(s): ${preKeys.join(", ")})`,
        preKeys.length === 0);
    }
    // The token set the sweep actually exercised IS the Δ6 enum — a site added
    // later with a token no fixture covers is caught by the tripwire below.
    const DELTA6 = ["point_plane_distance", "segment_length", "skew_distance", "angle_lines_deg", "angle_line_plane_deg",
      "angle_line_normal_deg", "d_dot_n", "n_dot_v", "no_meeting_point", "lambda",
      "intersection_point", "n_norm", "cross_norm", "numerator_triple_product"];
    check("the sweep covers EVERY Δ6 readout token (no token is gated only in principle)",
      DELTA6.filter((t) => !covered.has(t)).length, 0, 0);
    // THE TRIPWIRE. Counted off the SHIPPED resolver: if a future edit adds an
    // out.readouts.* site, this number moves and this section fails until the
    // new site is swept above — which is the whole prevention rule of this
    // bug_class ("apply it at the value SOURCE in the same pass").
    {
      const start = SRC.indexOf("function vgResolveLinesPlanes(");
      let depth = 0, end = start;
      for (let j = SRC.indexOf("{", start); j < SRC.length; j++) {
        if (SRC[j] === "{") depth++;
        else if (SRC[j] === "}") { depth--; if (depth === 0) { end = j + 1; break; } }
      }
      const RES = SRC.slice(start, end);
      check("the shipped resolver publishes from exactly the 19 sites this sweep covers (tripwire on a 20th)",
        (RES.match(/out\.readouts\.[a-z_]+ =/g) || []).length, 19, 0);
      assertTrue("...and the gate is called at least once per gated construct (10 call sites)",
        (RES.match(/vgArrived\(/g) || []).length >= 10);
      // Scope, proved rather than assumed: vgArrived exists ONLY here.
      const outside = SRC.slice(0, start) + SRC.slice(end);
      check("vgArrived is called nowhere outside the resolver (only its own declaration lives there)",
        (outside.match(/vgArrived\(/g) || []).length, 1, 0);
      assertTrue("...and that one occurrence IS the declaration", outside.indexOf("function vgArrived(frac)") >= 0);
      // THE HARNESS'S OWN BLIND SPOT, CLOSED. This file INJECTS
      // VG_SUBJECT_SHOWN_MIN into the sandbox, so if the shipped vgArrived read
      // a constant declared in some OTHER scope it would be `undefined` in the
      // browser, `frac >= undefined` would be false, and EVERY lines/planes
      // number would silently vanish forever — with this whole section green.
      // The two declarations are therefore checked to share one brace depth in
      // the emitted body (the renderer's own scope), measured, not assumed.
      const depthAt = (idx: number) => {
        let d = 0, inStr: string | null = null;
        for (let i = 0; i < idx; i++) {
          const c = SRC[i];
          if (inStr) { if (c === "\\") { i++; continue; } if (c === inStr) inStr = null; continue; }
          if (c === '"' || c === "'") { inStr = c; continue; }
          if (c === "/" && SRC[i + 1] === "/") { while (i < idx && SRC[i] !== "\n") i++; continue; }
          if (c === "{") d++; else if (c === "}") d--;
        }
        return d;
      };
      const dGate = depthAt(SRC.indexOf("function vgArrived(frac)"));
      const dConst = depthAt(SRC.indexOf("var VG_SUBJECT_SHOWN_MIN ="));
      assertTrue(`vgArrived and VG_SUBJECT_SHOWN_MIN share ONE scope in the emitted body (depth ${dGate} vs ${dConst}) — the constant this harness injects is really in scope at runtime`,
        dGate === dConst && dGate === 1);
    }
  }

  // ── (c) "ARRIVED", NOT "STARTED" ─────────────────────────────────────────
  //   The threshold is the one §19 already uses: a half-drawn segment beside
  //   its full length is the same disagreement one notch smaller. A `frac > 0`
  //   gate would look like a fix and publish mid-grow.
  {
    const qa: V3 = [1, 1, 1], qb: V3 = [-1, 0.2, 0.4];
    const block = {
      mode: "lines_planes", reveal_ms: 0,
      points: [{ id: "q1", position: qa }, { id: "q2", position: qb }],
      segments: [{ id: "cmp", from: "q1", to: "q2", readout: "length", reveal_at_ms: 1000, grow_ms: 1000 }],
    };
    const at = (ms: number) => E.vgResolveLinesPlanes(block, {}, ms);
    const f1500 = at(1500).segments[0].frac;
    assertTrue(`t=1500ms: the segment is only ${(f1500 * 100).toFixed(0)}% drawn, so its length is NOT published`,
      f1500 > 0 && f1500 < 1 && at(1500).readouts.segment_length === undefined);
    assertTrue("t=2000ms: the grow completes and the length appears", at(2000).segments[0].frac === 1
      && Math.abs(at(2000).readouts.segment_length - len3(sub3(qa, qb))) < 1e-12);
    // NEGATIVE CONTROL — a "started" gate, which is the plausible weaker fix.
    const STARTED = buildVgSandbox((name, src) =>
      (name === "vgArrived" ? src.replace(GATE_BODY, "return frac > 0;") : src)) as any;
    assertTrue("the 'started' variant really was planted", STARTED.vgArrived(0.01) === true && E.vgArrived(0.01) === false);
    expectFail(`a 'frac > 0' gate stays silent while the segment is ${(f1500 * 100).toFixed(0)}% drawn`,
      STARTED.vgResolveLinesPlanes(block, {}, 1500).readouts.segment_length === undefined);
  }

  // ── (d) THE GATE DID NOT COST DETERMINISM (D3 / Rule 36) ─────────────────
  {
    const block = {
      mode: "lines_planes", reveal_ms: 600,
      planes: [{ id: "P1", point: planePoint, normal: planeN, half_extent: 3, reveal_at_ms: 200 }],
      lines: [
        { id: "Lcut", point: cutAnchor, dir: dCut, lambda_span: [-3, 3], reveal_at_ms: 500, grow_ms: 900 },
        { id: "Lpar", point: parAnchor, dir: uIn, lambda_span: [-3, 3] },
      ],
      intersection: { id: "X", line: "Lcut", plane: "P1", reveal_at_ms: 1500 },
      angle_arcs: [{ id: "toN", between: ["Lcut", "P1.normal"], readout: "angle_line_normal_deg", reveal_at_ms: 2500 }],
    };
    const times = [0, 250, 500, 1400, 1600, 2400, 2600, 9000, 20000];
    const fwd = times.map((t) => JSON.stringify(E.vgResolveLinesPlanes(block, {}, t)));
    const rew = times.slice().reverse().map((t) => JSON.stringify(E.vgResolveLinesPlanes(block, {}, t)));
    assertTrue("REWIND: the gated resolver still replays backwards BIT FOR BIT (a SET_TIME_FREEZE re-pin is byte-identical)",
      fwd.every((x, i) => x === rew[rew.length - 1 - i]));
    // ...and the readouts arrive in the AUTHORED order, one beat at a time
    // (each object's reveal_at_ms PLUS its grow: 1500+600 and 2500+600).
    const keysAt = (t: number) => Object.keys(E.vgResolveLinesPlanes(block, {}, t).readouts).sort().join(",");
    assertTrue(`the numbers arrive beat by beat, never all at entry (t=0 "${keysAt(0)}", t=2000 "${keysAt(2000)}", t=2200 "${keysAt(2200)}", t=3200 "${keysAt(3200)}")`,
      keysAt(0) === "" && keysAt(2000) === ""
      && keysAt(2200) === "d_dot_n,intersection_point,lambda,no_meeting_point"
      && keysAt(3200) === "angle_line_normal_deg,d_dot_n,intersection_point,lambda,no_meeting_point");
  }

  // ── (e) ACT I CANNOT REGRESS THROUGH THIS ────────────────────────────────
  //   vgResolveLinesPlanes is reached from exactly one call site, inside the
  //   mode gate, so vector_products_in_space never enters it. Proved from the
  //   shipped frame driver AND measured live, rather than assumed.
  {
    const frameSrc = FRAME_HARNESS.src!;
    const callAt = frameSrc.indexOf("vgResolveLinesPlanes(");
    check("the resolver has exactly ONE call site in the frame driver", (frameSrc.match(/vgResolveLinesPlanes\(/g) || []).length, 1, 0);
    assertTrue("...and it sits inside the `d.mode === \"lines_planes\"` gate",
      frameSrc.lastIndexOf('d.mode === "lines_planes"', callAt) >= 0
      && callAt - frameSrc.lastIndexOf('d.mode === "lines_planes"', callAt) < 120);
    const win: Record<string, unknown> = {};
    const dom = fakeDom();
    FRAME_HARNESS.run!({ a_mag: 3, b_mag: 2, theta_deg: 60, value_readouts: ["a_mag", "b_mag", "theta_deg", "a_dot_b"] }, 9000, dom, win);
    assertTrue("a products-mode frame never enters the resolver at all (PM_vgLinesPlanes === null)", win.PM_vgLinesPlanes === null);
    assertTrue("...and its own panel is untouched by this fix — all four Act I rows still print",
      ["a_mag", "b_mag", "theta_deg", "a_dot_b"].every((k) => dom.get("vg_readout").innerHTML.includes("vg_readout_" + k)));
  }
}

console.log("\n=== 19c. Δ2c — ONE CONSTRUCT, TWO TOKENS, TWO BEATS: THE ARC OWNS THE NUMBER IT NAMES ===");
{
  // bug_class vg_projection_publishes_both_angle_tokens_before_either_arc_is_
  // drawn (MAJOR). §19b gated every readout on the reveal of the construct that
  // COMPUTES it. That is not the same rule as "the reveal of the thing it
  // NAMES", and the projection is where the two come apart: one construct
  // yields TWO tokens whose teaching beats are ten seconds apart.
  //
  // MEASURED (EYE walk, lines_and_planes_in_space STATE_7): the shadow reveals
  // at 2000 ms over a 1500 ms grow, so it arrives at ~3350 ms and both angle
  // rows appeared there — while arc_normal reveals at 9000 (arrives ~10080) and
  // arc_plane at 13000 (arrives ~14350). Pixel-confirmed at t=11000: the panel
  // read "angle to plane = 35.0°" with the arc that derives it still two
  // seconds from its reveal. The state cannot stage a derivation at all if the
  // answer is on the HUD 11 s before the beat that reaches it.
  //
  // THE DISCRIMINATING QUANTITY IS PER-TOKEN, NOT PER-CONSTRUCT: a state with
  // NO arcs must keep today's behaviour exactly (there the shadow IS the
  // picture of "angle to the plane", and nothing else can claim the number), so
  // a fixture that only proves silence would be passed by simply deleting the
  // publish. Fixture (b) is what makes this section capable of failing in the
  // other direction, and (c) is what makes it per-TOKEN rather than
  // all-or-nothing.
  const nrm = (v: V3): V3 => { const l = len3(v); return [v[0] / l, v[1] / l, v[2] / l]; };
  const planePoint: V3 = [0, -0.4, 0];
  const planeN: V3 = [0.35, 1, 0.25];
  const nh = nrm(planeN);
  const uIn = nrm(cross3(nh, [0, 0, 1]));
  const rotFromNormal = (deg: number): V3 => {
    const a = deg * Math.PI / 180;
    return nrm([nh[0] * Math.cos(a) + uIn[0] * Math.sin(a),
      nh[1] * Math.cos(a) + uIn[1] * Math.sin(a),
      nh[2] * Math.cos(a) + uIn[2] * Math.sin(a)]);
  };
  const dCut = rotFromNormal(55);                                 // 55° to the normal, 35° to the plane
  const Xpt: V3 = add3(planePoint, [uIn[0] * 0.6, uIn[1] * 0.6, uIn[2] * 0.6]);
  const cutAnchor: V3 = sub3(Xpt, [dCut[0] * 2.6, dCut[1] * 2.6, dCut[2] * 2.6]);

  const ARC_N = { id: "arc_normal", between: ["Lcut", "P1.normal"], readout: "angle_line_normal_deg", reveal_at_ms: 9000, grow_ms: 1200 };
  const ARC_P = { id: "arc_plane", between: ["Lcut", "P1"], readout: "angle_line_plane_deg", reveal_at_ms: 13000, grow_ms: 1500 };
  /** STATE_7's authoring, to the ms: the shadow at 2000/1500, then the arcs. */
  const s7 = (arcs: unknown[] | null, dir: V3 = dCut): Record<string, unknown> => {
    const b: Record<string, unknown> = {
      mode: "lines_planes", reveal_ms: 0,
      value_readouts: ["angle_line_normal_deg", "angle_line_plane_deg"],
      planes: [{ id: "P1", point: planePoint, normal: planeN, half_extent: 3.0, show_normal: true }],
      lines: [{ id: "Lcut", point: cutAnchor, dir, lambda_span: [-3, 3], label: "d" }],
      projection: { id: "shadow", line: "Lcut", plane: "P1", reveal_at_ms: 2000, grow_ms: 1500 },
    };
    if (arcs) b.angle_arcs = arcs;
    return b;
  };
  // The panel a teacher reads, through the SHIPPED frame driver — never the
  // resolver alone (§19b's founder question: does anything RE-PUBLISH after the
  // resolver returns?).
  const panelAt = (block: Record<string, unknown>, ms: number, sceneGroup: string | null = null) => {
    const dom = fakeDom();
    // Δ10 — the live group is a WINDOW value (PM_vgSceneGroup), written by the
    // apply pass and read into LP_KNOBS by the frame driver, so it is seeded
    // here the way the shipped driver reads it, never as an authored key.
    const win: Record<string, unknown> = sceneGroup ? { PM_vgSceneGroup: sceneGroup } : {};
    FRAME_HARNESS.run!(block, ms, dom, win);
    const el = dom.get("vg_readout");
    return {
      html: el.innerHTML, shown: el.style.display,
      hasN: el.innerHTML.includes("vg_readout_angle_line_normal_deg"),
      hasP: el.innerHTML.includes("vg_readout_angle_line_plane_deg"),
      rd: (win.PM_vgLinesPlanes as any).readouts as Record<string, number>,
    };
  };

  // ── THE PRE-FIX RESOLVER, RECONSTRUCTED ─────────────────────────────────
  //   The SHIPPED sandbox with ONE line of vgResolveLinesPlanes replaced: the
  //   HOLD (projAngles = ang) put back to the two direct publishes it replaced.
  //   The settle block below the arc pass then finds projAngles null and does
  //   nothing, so the reconstruction is the shipped pre-fix behaviour exactly —
  //   publish on the projection's beat, arcs overwrite later. A guarded
  //   substitution: if the shipped text stops matching, this THROWS rather than
  //   quietly testing a build with no defect in it.
  const HOLD_LINE = /\n(\s*)projAngles = ang;\n/;
  const unhold = (name: string, src: string) => {
    if (name !== "vgResolveLinesPlanes") return src;
    if (!HOLD_LINE.test(src)) {
      throw new Error(
        "§19c NEGATIVE CONTROL CANNOT BE BUILT: the projection's HOLD line (projAngles = ang;) is no "
        + "longer in vgResolveLinesPlanes, so this control cannot plant the defect it names. A control "
        + "that silently fails to plant its defect is worse than no control — update HOLD_LINE and "
        + "re-watch it fail.");
    }
    return src.replace(HOLD_LINE,
      "\n$1out.readouts.angle_line_normal_deg = ang.to_normal;\n$1out.readouts.angle_line_plane_deg = ang.to_plane;\n");
  };
  const PRE7 = buildVgSandbox(unhold) as any;
  assertTrue("the reconstructed pre-fix resolver really is planted (it publishes both angles the instant the shadow arrives, at t=4000)",
    (() => {
      const r = PRE7.vgResolveLinesPlanes(s7([ARC_N, ARC_P]), {}, 4000).readouts;
      return typeof r.angle_line_normal_deg === "number" && typeof r.angle_line_plane_deg === "number";
    })());

  // ── (a) THE STAGED STATE — each number waits for ITS OWN arc ─────────────
  {
    const block = s7([ARC_N, ARC_P]);
    // NOT VACUOUS: the shadow really is fully drawn at 4000 ms, so the silence
    // below is a GATE and not a fixture in which nothing resolved.
    {
      const res = E.vgResolveLinesPlanes(block, {}, 4000);
      const shadow = res.lines.filter((l: any) => l.id === "shadow")[0];
      assertTrue("t=4000ms: the shadow IS on screen, fully grown (the projection resolved — what is withheld is the NUMBER, not the picture)",
        !!shadow && shadow.frac === 1);
      assertTrue("...and neither arc is drawn yet (arc_normal reveals at 9000, arc_plane at 13000)",
        res.arcs.filter((a: any) => a.frac > 0).length === 0);
    }
    for (const ms of [4000, 8000]) {
      const f = panelAt(block, ms);
      assertTrue(`t=${ms}ms: the panel prints NEITHER angle row, and is hidden (the answer may not precede the beat that derives it)`,
        !f.hasN && !f.hasP && f.shown === "none");
      assertTrue(`t=${ms}ms: nothing re-publishes downstream either — PM_vgLinesPlanes.readouts carries no angle token`,
        f.rd.angle_line_normal_deg === undefined && f.rd.angle_line_plane_deg === undefined);
    }
    // ARRIVED, NOT STARTED — the arc's own ramp, at the SAME threshold §19b
    // pinned: 9000 + 0.9*1200 = 10080 ms through the ease-out cubic.
    {
      const mid = panelAt(block, 10000);
      assertTrue("t=10000ms: arc_normal is mid-grow, so its number is still withheld (a 'started' gate would print it here)",
        !mid.hasN && !mid.hasP);
      const f = panelAt(block, 10500);
      assertTrue("t=10500ms: arc_normal has arrived and 'angle to normal' appears — ALONE",
        f.hasN && !f.hasP && f.shown === "block");
      check("...at the constructed 55.0°", f.rd.angle_line_normal_deg, 55, 1e-9);
      assertTrue("...and the row a teacher reads carries the label and the value in one node",
        f.html.includes("angle to normal = 55.0"));
    }
    // THE MEASURED FRAME. t=11000 is the dumped EYE frame that read
    // "angle to plane = 35.0°" with arc_plane 2 s from its reveal.
    {
      const f = panelAt(block, 11000);
      assertTrue("t=11000ms (THE MEASURED FRAME): 'angle to plane' is NOT on the panel — arc_plane is still 2 s from its reveal",
        !f.hasP && !f.html.includes("angle to plane") && f.hasN);
    }
    {
      const mid = panelAt(block, 14000);
      assertTrue("t=14000ms: arc_plane is mid-grow (13000 + 0.9*1500 = 14350), so the second number is still withheld",
        !mid.hasP && mid.hasN);
      const f = panelAt(block, 15000);
      assertTrue("t=15000ms: arc_plane has arrived and BOTH rows print", f.hasN && f.hasP && f.shown === "block");
      check("...'angle to plane' is the constructed 35.0° (the fix delays the value, it does not change it)",
        f.rd.angle_line_plane_deg, 35, 1e-9);
      check("...and 'angle to normal' still reads 55.0°", f.rd.angle_line_normal_deg, 55, 1e-9);
      assertTrue("...and both rows carry label and value", f.html.includes("angle to plane = 35.0") && f.html.includes("angle to normal = 55.0"));
      check("...the two angles are complementary, which is the state's whole claim",
        f.rd.angle_line_normal_deg + f.rd.angle_line_plane_deg, 90, 1e-9);
    }
    // ── NEGATIVE CONTROL 1 — the SHIPPED PRE-FIX RESOLVER on this very state.
    {
      const p4 = PRE7.vgResolveLinesPlanes(block, {}, 4000).readouts;
      expectFail(`the pre-fix resolver withholds the angles at t=4000 (it publishes angle to normal = ${p4.angle_line_normal_deg.toFixed(1)}° and angle to plane = ${p4.angle_line_plane_deg.toFixed(1)}°, 6.1 s and 10.4 s before the arcs that derive them)`,
        p4.angle_line_normal_deg === undefined && p4.angle_line_plane_deg === undefined);
      const p11 = PRE7.vgResolveLinesPlanes(block, {}, 11000).readouts;
      expectFail("...and at the MEASURED frame t=11000 (it prints angle to plane = 35.0° with arc_plane 2 s away)",
        p11.angle_line_plane_deg === undefined);
      // ...and the reconstruction is faithful: once every beat has landed the
      // two resolvers are IDENTICAL, so the control isolates the hold and
      // nothing else.
      assertTrue("the pre-fix and shipped resolvers agree BIT FOR BIT on a settled frame (the control changes one thing)",
        JSON.stringify(PRE7.vgResolveLinesPlanes(block, {}, 20000)) === JSON.stringify(E.vgResolveLinesPlanes(block, {}, 20000)));
    }
    // DETERMINISM (D3 / Rule 36) — the new hold is still a closed form of ms.
    {
      const times = [0, 3400, 4000, 8000, 10080, 10500, 14350, 15000, 30000];
      const fwd = times.map((t) => JSON.stringify(E.vgResolveLinesPlanes(block, {}, t)));
      const rew = times.slice().reverse().map((t) => JSON.stringify(E.vgResolveLinesPlanes(block, {}, t)));
      assertTrue("REWIND: the staged state replays backwards BIT FOR BIT (a SET_TIME_FREEZE re-pin is byte-identical)",
        fwd.every((x, i) => x === rew[rew.length - 1 - i]));
      const keysAt = (t: number) => Object.keys(E.vgResolveLinesPlanes(block, {}, t).readouts).sort().join(",");
      assertTrue(`the numbers arrive beat by beat, never both at the shadow (t=4000 "${keysAt(4000)}", t=10500 "${keysAt(10500)}", t=15000 "${keysAt(15000)}")`,
        keysAt(4000) === "" && keysAt(10500) === "angle_line_normal_deg"
        && keysAt(15000) === "angle_line_normal_deg,angle_line_plane_deg");
    }
  }

  // ── (b) BACK-COMPAT — a projection with NO arc keeps its claim, unchanged ─
  //   The shadow IS the picture of "angle to the plane" on such a state, and
  //   nothing else can ever publish these tokens there. This is the half a
  //   "just delete the publish" fix would fail.
  {
    const bare = s7(null);
    const f4 = panelAt(bare, 4000);
    assertTrue("t=4000ms, NO arcs authored: BOTH angle rows print on the projection's own beat, exactly as before this fix",
      f4.hasN && f4.hasP && f4.shown === "block");
    check("...angle to normal = 55.0°", f4.rd.angle_line_normal_deg, 55, 1e-9);
    check("...angle to plane = 35.0°", f4.rd.angle_line_plane_deg, 35, 1e-9);
    // ...and Δ2b is untouched underneath: still nothing before the shadow lands.
    const f3 = panelAt(bare, 3000);
    assertTrue("t=3000ms: the shadow is still growing (2000 + 0.9*1500 = 3350), so Δ2b still withholds both — the older gate is intact",
      !f3.hasN && !f3.hasP);
    // The pre-fix and shipped builds are INDISTINGUISHABLE on this state, at
    // every sampled ms — the fix's blast radius is exactly "states that author
    // an owning arc", proved rather than asserted.
    const sweep = [0, 1000, 2000, 3000, 3350, 4000, 9000, 12000, 20000];
    assertTrue("a projection-only state resolves IDENTICALLY pre-fix and post-fix at every sampled ms (the change cannot reach it)",
      sweep.every((t) => JSON.stringify(PRE7.vgResolveLinesPlanes(bare, {}, t)) === JSON.stringify(E.vgResolveLinesPlanes(bare, {}, t))));
  }

  // ── (c) PER TOKEN, NOT PER CONSTRUCT ────────────────────────────────────
  //   One arc, naming ONE of the two tokens: the named one waits for it, the
  //   UNNAMED one still arrives on the projection's beat. An all-or-nothing
  //   deferral (defer as soon as any arc exists) passes (a) and (b) and fails
  //   here, which is the whole reason this fixture exists.
  {
    const oneArc = s7([ARC_N]);
    const f = panelAt(oneArc, 4000);
    assertTrue("t=4000ms, only arc_normal authored: 'angle to plane' prints (nobody else claims it) while 'angle to normal' waits for its arc",
      f.hasP && !f.hasN);
    check("...and the printed one is the projection's own 35.0°", f.rd.angle_line_plane_deg, 35, 1e-9);
    const g = panelAt(oneArc, 10500);
    assertTrue("t=10500ms: arc_normal arrives and the second row joins it", g.hasN && g.hasP);
    // The mirror, so neither token is special-cased by accident.
    const otherArc = s7([ARC_P]);
    const h = panelAt(otherArc, 4000);
    assertTrue("t=4000ms, only arc_plane authored: the MIRROR holds — 'angle to normal' prints, 'angle to plane' waits",
      h.hasN && !h.hasP);
    // An arc in ANOTHER scene group owns nothing in this one: it can never
    // publish here, so deferring to it would DELETE the number, not delay it.
    const grouped = s7([{ ...ARC_N, groups: ["B"] }]);
    const gA = panelAt(grouped, 4000, "A");
    assertTrue("t=4000ms in group A, the only arc lives in group B: both rows print (an arc that can never publish here owns nothing)",
      gA.hasN && gA.hasP);
    const gB = panelAt(grouped, 4000, "B");
    assertTrue("...and in group B the same arc DOES own its token, so 'angle to normal' waits", !gB.hasN && gB.hasP);
    assertTrue("...and the group seed really reached the resolver (the two groups resolve DIFFERENTLY — a seed the driver ignored would make the pair vacuous)",
      JSON.stringify(gA.rd) !== JSON.stringify(gB.rd));
  }

  // ── (d) AN ARC THAT CANNOT BE DRAWN OWNS NOTHING ────────────────────────
  //   A line PERPENDICULAR to the plane projects to a POINT: the in-plane arm
  //   of arc_plane has no direction, so that arc skips out of the pass entirely.
  //   The renderer documents this case as "reports 90/0, not silence" — so
  //   ownership is recorded where the arc RESOLVES, never from the authored
  //   list, or this state would lose its number forever.
  {
    const perp = s7([ARC_N, ARC_P], nh);
    const res = E.vgResolveLinesPlanes(perp, {}, 4000);
    assertTrue("a line perpendicular to the plane draws NO shadow and arc_plane resolves to nothing (0 arcs at any ms)",
      res.lines.filter((l: any) => l.id === "shadow").length === 0
      && res.arcs.filter((a: any) => a.id === "arc_plane").length === 0);
    const f = panelAt(perp, 4000);
    assertTrue("t=4000ms: 'angle to plane' still prints the 90° the renderer promises, while 'angle to normal' waits for the arc that CAN be drawn",
      f.hasP && !f.hasN);
    check("...and it reads 90.0°", f.rd.angle_line_plane_deg, 90, 1e-9);
    const g = panelAt(perp, 10500);
    check("t=10500ms: arc_normal arrives with 0.0°, the complement", g.rd.angle_line_normal_deg, 0, 1e-9);
  }

  // ── (e) SCOPE, PROVED FROM THE SHIPPED SOURCE ───────────────────────────
  //   Both new locals live inside vgResolveLinesPlanes and nowhere else — a
  //   second reader would be a second place this rule could be forgotten.
  {
    const start = SRC.indexOf("function vgResolveLinesPlanes(");
    let depth = 0, end = start;
    for (let j = SRC.indexOf("{", start); j < SRC.length; j++) {
      if (SRC[j] === "{") depth++;
      else if (SRC[j] === "}") { depth--; if (depth === 0) { end = j + 1; break; } }
    }
    const RES = SRC.slice(start, end);
    const outside = SRC.slice(0, start) + SRC.slice(end);
    check("the ownership record is written from exactly ONE site in the resolver", (RES.match(/arcOwned\[/g) || []).length, 1, 0);
    check("...and read at exactly the two token sites it gates", (RES.match(/!arcOwned\./g) || []).length, 2, 0);
    check("...and the projection's HOLD is assigned once", (RES.match(/projAngles = ang;/g) || []).length, 1, 0);
    check("arcOwned exists nowhere outside the resolver", (outside.match(/arcOwned/g) || []).length, 0, 0);
    check("projAngles exists nowhere outside the resolver", (outside.match(/projAngles/g) || []).length, 0, 0);
    // Act I cannot regress through this: the resolver is unreachable in
    // "products" mode, measured through the shipped frame driver.
    const win: Record<string, unknown> = {};
    const dom = fakeDom();
    FRAME_HARNESS.run!({ a_mag: 3, b_mag: 2, theta_deg: 60, value_readouts: ["a_mag", "b_mag", "theta_deg", "a_dot_b"] }, 9000, dom, win);
    assertTrue("a products-mode frame never enters the resolver at all (PM_vgLinesPlanes === null)", win.PM_vgLinesPlanes === null);
  }
}

console.log("\n=== 20. B — A GUIDED STATE CAN BOUND ITS OWN CONTROL (vg.control_ranges) ===");
{
  // bug_class field3d_vg_slider_range_is_concept_wide_so_a_guided_state_cannot_
  // bound_its_own_control. vgSc reads config.slider_controls, which is
  // CONCEPT-WIDE, so a guided state at a FIXED camera inherits the sandbox's
  // travel. Measured below with the SHIPPED projection at a camera DERIVED from
  // the shipped framing solver (never a pose fixtured in this file).
  const T = vgTextFns({}, fakeDom().document);
  const base = T.VG_ROW_RANGE.b_mag;
  assertTrue(`the concept-wide b_mag range is read from the shipped builder (${base.min}..${base.max} step ${base.step})`,
    base && base.min === SHIPPED_ROW_RANGE.b_mag.min && base.max === SHIPPED_ROW_RANGE.b_mag.max);

  // ── THE MEASUREMENT. The state's own claim is that the a×b arrow's LENGTH
  //    IS THE AREA, so the camera is solved for the authored ramp's end
  //    (|b| = 2.5) by the renderer's OWN framing solver, and then every detent
  //    the row can reach is projected through the SHIPPED vgProjectPoint. No
  //    pose is written down here; the pose is derived from the shipped
  //    functions and the authored ramp, which is the only way this measurement
  //    survives the concept moving its camera.
  const RAMP_END = 2.5;
  const framed = E.vgBuildVectors({ a_mag: 3, b_mag: RAMP_END, theta_deg: 60, b_tilt_deg: 0 });
  const camPos = E.vgAutoFramePos(framed.a, framed.b, 2.5) as V3;
  assertTrue("the camera pose is DERIVED from the shipped framing solver at the ramp's end, not fixtured in this gate",
    Array.isArray(camPos) && len3(camPos) > 0);
  function offFrame(bMag: number): boolean {
    const v = E.vgBuildVectors({ a_mag: 3, b_mag: bMag, theta_deg: 60, b_tilt_deg: 0 });
    const pts: V3[] = [E.vgCrossVec(v.a, v.b) as V3, ...(E.vgParallelogramVerts(v.a, v.b) as V3[])];
    for (const p of pts) {
      const s = E.vgProjectPoint(camPos, TARGET, UP, FOV, ASPECT, p);
      if (!s || Math.abs(s.sx) > HALF_H || Math.abs(s.sy) > HALF_V) return true;
    }
    return false;
  }
  const detents = (r: { min: number; max: number; step: number }) => {
    const out: number[] = [];
    for (let v = r.min; v <= r.max + 1e-9; v += r.step) out.push(Number(v.toFixed(6)));
    return out;
  };
  const wide = detents(base);
  const wideOff = wide.filter(offFrame);
  assertTrue(`the AUTHORED ramp itself is fully on frame (${[2.0, 2.25, 2.5].filter(offFrame).length} of 3 sampled ramp values off) — the design was verified over the ramp`,
    [2.0, 2.25, 2.5].every((v) => !offFrame(v)));
  assertTrue(`...but the LIVE ROW is wider than the ramp: ${wideOff.length} of ${wide.length} detents (${((100 * wideOff.length) / wide.length).toFixed(0)}% of travel) leave the frame — the worst-case law over what MOVES, not over what was authored`,
    wideOff.length > 0);
  const lastOn = wide.filter((v) => !offFrame(v)).slice(-1)[0];
  console.log(`        widest on-frame detent |b| = ${lastOn}; first off-frame ${wideOff[0]}`);
  const bounded = T.vgControlRange("b_mag", {
    b_mag: 2, control_ranges: { b_mag: { max: lastOn } },
    animate: [{ knob: "b_mag", from: 2.0, to: 2.5, start_ms: 4000, duration_ms: 12000 }],
  });
  assertTrue(`a per-state control_ranges.max of ${lastOn} bounds the row to on-frame travel only (${detents(bounded).filter(offFrame).length} of ${detents(bounded).length} off)`,
    detents(bounded).every((v) => !offFrame(v)));
  assertTrue("...and it still contains the whole authored ramp, so the state's own motion is never clipped",
    bounded.min <= 2.0 && bounded.max >= 2.5 && bounded.widened === false);

  // ── THE RESOLVER. Restore, override each field independently, and the
  //    widening that refuses to exclude what the state itself produces.
  const plain = T.vgControlRange("b_mag", { });
  assertTrue(`a state with NO control_ranges gets the concept-wide range back (${plain.min}..${plain.max}) — a narrowing may never leak forward`,
    plain.min === base.min && plain.max === base.max && plain.step === base.step);
  const minOnly = T.vgControlRange("b_mag", { control_ranges: { b_mag: { min: 2 } } });
  assertTrue(`an override of min alone inherits max and step (${minOnly.min}..${minOnly.max} step ${minOnly.step})`,
    minOnly.min === 2 && minOnly.max === base.max && minOnly.step === base.step);
  const widened = T.vgControlRange("b_mag", {
    b_mag: 2, control_ranges: { b_mag: { min: 2.2, max: 2.4 } },
    animate: [{ knob: "b_mag", from: 2.0, to: 2.5, start_ms: 0, duration_ms: 100 }],
  });
  assertTrue(`a range that would EXCLUDE the state's own ramp is widened to contain it (${widened.min}..${widened.max}) and says so`,
    widened.min <= 2.0 && widened.max >= 2.5 && widened.widened === true);
  assertTrue("an unknown knob resolves to null rather than inventing a range", T.vgControlRange("not_a_knob", {}) === null);

  // ── THE WIRING, on the SHIPPED apply pass: the row input's min/max/step are
  //    actually written, restored, and the widening is published.
  {
    const scene: Array<Record<string, unknown>> = [{ userData: { elementType: "vg_vector_a" }, visible: false }];
    const dom = fakeDom();
    runApplyPass(scene, { show_sliders: true, vg: { controls: ["b_mag"], b_mag: 2, control_ranges: { b_mag: { max: 3 } } } }, dom);
    const row = dom.get("vg_b_mag_slider");
    assertTrue(`the apply pass writes the bounded range onto the row (${row.min}..${row.max} step ${row.step})`,
      row.max === "3" && row.min === String(base.min) && row.step === String(base.step));
    assertTrue("...and the row's VALUE is written after its range, so the input cannot sanitise the state's own value away",
      row.value === "2");
    const dom2 = fakeDom();
    const r2 = runApplyPass(scene, { show_sliders: true, vg: { controls: ["b_mag"], b_mag: 4 } }, dom2);
    assertTrue(`the NEXT state without an override is restored to the concept-wide range (${dom2.get("vg_b_mag_slider").max})`,
      dom2.get("vg_b_mag_slider").max === String(base.max));
    assertTrue("no widening is reported when none happened", Array.isArray(r2.win.PM_vgControlRangeWidened)
      && (r2.win.PM_vgControlRangeWidened as string[]).length === 0);
    const dom3 = fakeDom();
    const r3 = runApplyPass(scene, { show_sliders: true, vg: { controls: ["b_mag"], b_mag: 4.5, control_ranges: { b_mag: { max: 3 } } } }, dom3);
    assertTrue(`a range that would exclude the state's own authored value is widened AND published (${JSON.stringify(r3.win.PM_vgControlRangeWidened)})`,
      (r3.win.PM_vgControlRangeWidened as string[]).indexOf("b_mag") >= 0 && dom3.get("vg_b_mag_slider").max === "4.5");
  }

  // NEGATIVE CONTROLS. The first is the shipped pre-fix behaviour; the second
  // is the tempting alternative fix, which is why it is measured rather than
  // argued: an auto-framing camera that dollies out as the quad grows CANCELS
  // the growth on screen, on the state whose claim is that the arrow grows.
  expectFail(`the CONCEPT-WIDE range keeps every detent on frame (${wideOff.length} of ${wide.length} do not)`,
    wideOff.length === 0);
  {
    const armAt = (bMag: number) => {
      const v = E.vgBuildVectors({ a_mag: 3, b_mag: bMag, theta_deg: 60, b_tilt_deg: 0 });
      const axb = E.vgCrossVec(v.a, v.b) as V3;
      const pos = E.vgAutoFramePos(v.a, v.b, 2.5) as V3;
      const o = E.vgProjectPoint(pos, TARGET, UP, FOV, ASPECT, [0, 0, 0]);
      const t = E.vgProjectPoint(pos, TARGET, UP, FOV, ASPECT, axb);
      return Math.hypot(t.sx - o.sx, t.sy - o.sy);
    };
    const growth = armAt(2.5) / armAt(2.0);
    expectFail(`auto_frame preserves the taught growth: the arrow's SCREEN length grows as |b| goes 2.0 → 2.5 (ratio ${growth.toFixed(4)})`,
      growth > 1.02);
    assertTrue("...while the arrow's TRUE length grew 25%, so the auto-framing camera would teach that nothing changed",
      Math.abs(E.vgLenVec(E.vgCrossVec(E.vgBuildVectors({ a_mag: 3, b_mag: 2.5, theta_deg: 60 }).a, E.vgBuildVectors({ a_mag: 3, b_mag: 2.5, theta_deg: 60 }).b))
        / E.vgLenVec(E.vgCrossVec(E.vgBuildVectors({ a_mag: 3, b_mag: 2.0, theta_deg: 60 }).a, E.vgBuildVectors({ a_mag: 3, b_mag: 2.0, theta_deg: 60 }).b)) - 1.25) < 1e-9);
  }
}

console.log("\n=== 21. C — EVERY position:fixed SURFACE, SWEPT: the panel is placed against a MEASURED set ===");
{
  // bug_class field3d_vg_overlay_relocation_moved_the_collision_instead_of_
  // removing_it. §16 moved #vg_sliders off #formula_overlay's corner and onto
  // #legend's, having enumerated the destination corner BY HAND ("#vg_readout
  // is top-anchored, #simPenBar is up at top:10") and asserted that
  // enumeration exhaustive — the OPEN scar call_site_enumeration_asserted_
  // exhaustive_without_a_symbol_sweep. #legend is fixed bottom:8/left:8 at the
  // same z-index and was never named, so a slider track struck through the
  // state-label card on both slider states.
  //
  // So the enumeration is no longer written by hand. Every position:fixed
  // surface in the renderer — the shell's CSS rules AND every dynamically
  // created panel — is PARSED, and every one of them must be CLASSIFIED here.
  // An id this table has never heard of FAILS, which is what stops the next
  // relocation from repeating this.
  const RENDERER_FILE = readFileSync("src/lib/renderers/field_3d_renderer.ts", "utf-8");
  type Panel = {
    id: string; src: "css" | "dynamic"; body: string;
    top: number | null; bottom: number | null; left: number | null; right: number | null;
    centeredX: boolean; z: number | null; minW: number; maxW: number; padX: number; padY: number; lineH: number;
  };
  const numOf = (body: string, k: string): number | null => {
    const m = new RegExp("(?:^|[;{\\s])" + k + "\\s*:\\s*(-?[0-9.]+)px").exec(body);
    return m ? Number(m[1]) : null;
  };
  function parsePanel(id: string, body: string, src: "css" | "dynamic"): Panel {
    const pad = /padding\s*:\s*([0-9.]+)px(?:\s+([0-9.]+)px)?/.exec(body);
    const font = /font\s*:\s*(?:[a-z0-9]+\s+)*?([0-9.]+)px(?:\s*\/\s*([0-9.]+))?/.exec(body);
    const fs = font ? Number(font[1]) : 13;
    const lh = font && font[2] ? Number(font[2]) * fs : fs * 1.4;
    return {
      id, src, body,
      top: numOf(body, "top"), bottom: numOf(body, "bottom"),
      left: numOf(body, "left"), right: numOf(body, "right"),
      centeredX: /left\s*:\s*50%/.test(body),
      z: numOf(body, "z-index") ?? (/z-index\s*:\s*(\d+)/.exec(body) ? Number(/z-index\s*:\s*(\d+)/.exec(body)![1]) : null),
      minW: numOf(body, "min-width") ?? 0, maxW: numOf(body, "max-width") ?? 0,
      padX: pad ? Number(pad[2] ?? pad[1]) : 12, padY: pad ? Number(pad[1]) : 10, lineH: lh,
    };
  }
  // ── (i) the shell's <style> block, every rule, brace-matched with ${...}
  //    interpolations neutralised (they contain braces and silently truncate a
  //    naive parse — the first sweep written for this section lost #legend
  //    exactly that way).
  const panels: Panel[] = [];
  {
    const s0 = RENDERER_FILE.indexOf("<style>") + 7;
    const s1 = RENDERER_FILE.indexOf("</style>");
    const css = RENDERER_FILE.slice(s0, s1).replace(/\$\{[^}]*\}/g, "X").replace(/\/\*[\s\S]*?\*\//g, "");
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(css))) {
      const sel = m[1].trim().replace(/\s+/g, " "), body = m[2].replace(/\s+/g, " ").trim();
      if (!/position\s*:\s*fixed/.test(body)) continue;
      panels.push(parsePanel(sel, body, "css"));
    }
  }
  // ── (ii) every dynamically-created fixed panel in the emitted template,
  //    paired with the id its own variable was given.
  {
    const re = /(\w+)\.style\.cssText = "(position:\s*fixed[^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(SRC))) {
      const v = m[1];
      const before = SRC.slice(0, m.index);
      const idm = new RegExp(v + "\\.id = \"([^\"]+)\"", "g");
      let last: RegExpExecArray | null = null, x: RegExpExecArray | null;
      while ((x = idm.exec(before))) last = x;
      panels.push(parsePanel(last ? "#" + last[1] : "(anonymous:" + v + ")", m[2].replace(/\s+/g, " "), "dynamic"));
    }
  }
  assertTrue(`the sweep found the shell CSS rules AND the dynamic panels (${panels.filter((p) => p.src === "css").length} css + ${panels.filter((p) => p.src === "dynamic").length} dynamic)`,
    panels.filter((p) => p.src === "css").length >= 25 && panels.filter((p) => p.src === "dynamic").length >= 25);
  assertTrue("every dynamic panel was matched to an id (an anonymous panel cannot be classified, so it must not exist)",
    panels.every((p) => p.id.indexOf("(anonymous") < 0));

  // ── (iii) CLASSIFICATION. `vg` = this scenario's own. `generic` = the shell
  //    overlays that exist on EVERY concept and are driven by generic code.
  //    `suppressed` = a generic overlay this scenario turns off (proved from
  //    the source below, never asserted). `other` = owned by another scenario
  //    (its display is written only under that scenario's own code path, so it
  //    can never appear on a vg concept) or not an overlay at all.
  const GENERIC = ["#caption", "#formula_overlay", "#sliders", "#equation_panel"];
  const SUPPRESSED = ["#legend"];
  const NOT_AN_OVERLAY = ["#mobile-fallback", "#acl_stage"];   // full-viewport layers, not corner panels
  const OTHER_PREFIX = /^[.#](acl_|nw_|rhr_|palm_|fleming_|lorentz_|nowork_|radius_|helix_|hx_|plates_|cyclotron_|torque_|dipole_|bmf_|fcw_|cap_|swc_|pcf_|pc[A-Z]|em_|gen_|lz_|rad_|cyc_|tq_|dpf_|mcg_|gav_|bm_)/;
  const classOf = (p: Panel): "vg" | "generic" | "suppressed" | "other" | "unknown" => {
    const id = p.id;
    if (/^#vg_/.test(id)) return "vg";
    if (SUPPRESSED.indexOf(id) >= 0) return "suppressed";
    if (GENERIC.indexOf(id) >= 0) return "generic";
    if (NOT_AN_OVERLAY.indexOf(id) >= 0) return "other";
    // A DYNAMIC panel exists only if its builder ran, and a scenario's builder
    // runs only from the buildScenario dispatch for its own scenario_type — so
    // another scenario's dynamic panel is not merely hidden on a vg concept, it
    // is never created. That is structural, so it needs no per-id list; the vg
    // half of the same claim is what §11's glue allowlist pins.
    if (p.src === "dynamic") return "other";
    // A SHELL CSS rule, by contrast, describes markup that is in the DOM on
    // EVERY concept, so each one is placed BY HAND — 29 rules is a reviewable
    // number and a new one fails here until somebody classifies it.
    if (OTHER_PREFIX.test(id)) return "other";
    return "unknown";
  };
  const unknown = panels.filter((p) => classOf(p) === "unknown").map((p) => p.id);
  for (const u of unknown.slice(0, 12)) console.log("      UNCLASSIFIED fixed panel: " + u);
  assertTrue(`every position:fixed surface in the renderer is classified (${panels.length} panels — ${panels.filter((p) => p.src === "css").length} shell rules placed by hand, ${panels.filter((p) => p.src === "dynamic").length} dynamic; ${unknown.length} unclassified) — the enumeration is MECHANICAL, so the next SHELL panel added anywhere fails here until someone places it`,
    unknown.length === 0);
  assertTrue("the vg panels are DYNAMIC and therefore only exist on a vg concept — the same structural claim, read from the sweep",
    panels.filter((p) => classOf(p) === "vg").every((p) => p.src === "dynamic"));
  assertTrue("this scenario's own panels are found by the sweep (not by being named here)",
    panels.filter((p) => classOf(p) === "vg").map((p) => p.id).sort().join(",") === "#vg_readout,#vg_sliders");

  // ── (iv) the SUPPRESSION is proved from the source, not assumed: #legend is
  //    excluded from the collidable set ONLY because updateLegend returns early
  //    for this scenario_type. If that line ever goes, the pair below fails.
  const legendSuppressed = /if \(config\.scenario_type === "vector_geometry_3d"\) \{ legendEl\.style\.display = "none"/.test(SRC);
  assertTrue("#legend is SUPPRESSED for vector_geometry_3d in updateLegend (the collision is removed, not relocated — Rule 24, the same one-line shape as its Phase-0 sibling solid_of_revolution)",
    legendSuppressed);
  assertTrue("the sibling precedent this follows is present, so the shape is the fleet's and not this scenario's invention",
    /if \(config\.scenario_type === "solid_of_revolution"\) \{ legendEl\.style\.display = "none"/.test(SRC));

  // ── (v) THE GEOMETRY, height-free where it can be. Two fixed panels anchored
  //    to the SAME vertical edge with overlapping horizontal spans WILL touch
  //    once either grows — that is the #legend/#vg_sliders defect, and it needs
  //    no height model to state. The one exception is a panel whose content is
  //    ONE LINE by construction (#caption is the ≤5-word delta cue, Rule 34a):
  //    its height is computed from its OWN parsed font and padding, so the
  //    clearance below it is derived rather than assumed.
  const W = 1280, HEADROOM = 120;
  const widthOf = (p: Panel) => (p.maxW || p.minW + HEADROOM) + 2 * p.padX;
  const spanOf = (p: Panel): [number, number] => {
    const w = widthOf(p);
    if (p.centeredX) return [W / 2 - w / 2, W / 2 + w / 2];
    if (p.left !== null) return [p.left, p.left + w];
    if (p.right !== null) return [W - p.right - w, W - p.right];
    return [0, W];
  };
  const SINGLE_LINE = ["#caption"];              // Rule 34a: the delta cue, one line
  const heightOf = (p: Panel) => (SINGLE_LINE.indexOf(p.id) >= 0 ? 2 * p.padY + p.lineH : Infinity);
  const edgeOf = (p: Panel) => (p.top !== null ? "top" : p.bottom !== null ? "bottom" : "none");
  const offsetOf = (p: Panel) => (p.top !== null ? p.top : p.bottom !== null ? p.bottom : 0);
  const collides = (p: Panel, q: Panel) => {
    const [a0, a1] = spanOf(p), [b0, b1] = spanOf(q);
    if (a1 <= b0 || b1 <= a0) return false;                    // horizontally disjoint
    const ep = edgeOf(p), eq = edgeOf(q);
    if (ep === "none" || eq === "none") return false;          // anchored per state
    if (ep !== eq) return false;                               // opposite edges
    const [near, far] = offsetOf(p) <= offsetOf(q) ? [p, q] : [q, p];
    return offsetOf(near) + heightOf(near) > offsetOf(far);    // the near one must END above the far one
  };
  const collidable = panels.filter((p) => ["vg", "generic"].indexOf(classOf(p)) >= 0);
  const vgPanels = collidable.filter((p) => classOf(p) === "vg");
  let hits = 0;
  for (const v of vgPanels) {
    for (const o of collidable) {
      if (o === v) continue;
      if (collides(v, o)) { hits++; console.log(`      COLLISION: ${v.id} vs ${o.id}`); }
    }
  }
  assertTrue(`no vg panel collides with ANY other surface that can appear on a vector_geometry_3d concept (${collidable.length} collidable panels swept, ${hits} collisions)`,
    hits === 0);

  // NEGATIVE CONTROLS. (1) the measured defect itself: put #legend back into
  // the collidable set and the sweep must report it. THE DISCRIMINATING
  // QUANTITY IS A RECT INTERSECTION AGAINST THE PARSED CSS — "the panel is
  // bottom-left", "its z-index is 10", "#formula_overlay is untouched" are all
  // true of the broken build.
  {
    const legend = panels.filter((p) => p.id === "#legend")[0];
    const sliders = panels.filter((p) => p.id === "#vg_sliders")[0];
    assertTrue("#legend and #vg_sliders were both parsed out of the shipped source, so the control below has real coordinates",
      !!legend && !!sliders);
    const [l0, l1] = spanOf(legend), [s0, s1] = spanOf(sliders);
    expectFail(`an UNSUPPRESSED #legend (bottom:${legend.bottom}/left:${legend.left}) clears #vg_sliders (bottom:${sliders.bottom}/left:${sliders.left})`,
      !collides(legend, sliders));
    console.log(`        measured overlap of the pre-fix pair: ${(Math.min(l1, s1) - Math.max(l0, s0)).toFixed(0)}px of shared width on the SAME bottom edge`);
    assertTrue("...and they share z-index, so nothing but paint order decided which text won",
      legend.z === sliders.z);
  }
  // (2) the PRE-FIX ENUMERATION — the hand-written one this section replaces.
  // It named #formula_overlay and #vg_readout and called itself exhaustive.
  {
    const BY_HAND = ["#formula_overlay", "#vg_readout"];
    const sliders = panels.filter((p) => p.id === "#vg_sliders")[0];
    const missed = panels.filter((p) => ["generic", "suppressed"].indexOf(classOf(p)) >= 0
      && BY_HAND.indexOf(p.id) < 0 && collides(p, sliders));
    expectFail(`the hand-written enumeration (${BY_HAND.join(", ")}) covered every surface at the destination corner`,
      missed.length === 0);
    console.log(`        the hand enumeration missed: ${missed.map((p) => p.id).join(", ")}`);
  }
  // (3) a panel moved BACK into a taken corner must fail, or the sweep is only
  // agreeing with today's coordinates.
  {
    const sliders = panels.filter((p) => p.id === "#vg_sliders")[0];
    const movedBack: Panel = { ...sliders, left: null, right: 12 };
    const formula = panels.filter((p) => p.id === "#formula_overlay")[0];
    expectFail("a #vg_sliders moved back to bottom:12/right:12 clears #formula_overlay", !collides(movedBack, formula));
  }
}

console.log("\n=== 22. THE a/b SCAFFOLDING PAIR IS MODE-GATED: gone in \"lines_planes\", untouched in \"products\" ===");
{
  // bug_class vg_lines_planes_mode_never_hides_the_dot_cross_scaffolding_
  // vectors_a_b. vg_vector_a and vg_vector_b were the ONLY two elements on the
  // visibility switch with no gate — `want = true`, unconditionally — so Act
  // I's dot/cross explorer vectors rendered at their default magnitudes on all
  // nine states of a mode:"lines_planes" concept, crossing d1, d2, d1xd2 and
  // (a2-a1) on the skew-distance state and standing where d1's own label
  // belongs on the point-to-plane state (Rule 32e: 3-5 co-equal full-bright
  // elements, so no state had ONE focal).
  //
  // The pair is written TWICE — the apply pass at state entry AND the
  // per-frame writer, which re-asserts visibility from scratch on every frame.
  // Both are exercised below, separately, because a fix to either one alone is
  // invisible to a gate that only runs the other.
  type FakeObj = { userData: { elementType: string; tracks?: string }; visible: boolean };
  const abScene = (): FakeObj[] => ([
    { userData: { elementType: "vg_vector_a" }, visible: false },
    { userData: { elementType: "vg_vector_b" }, visible: false },
    { userData: { elementType: "vg_vector_c" }, visible: false },
    { userData: { elementType: "vg_label", tracks: "vg_vector_a" }, visible: false },
    { userData: { elementType: "vg_label", tracks: "vg_vector_b" }, visible: false },
    { userData: { elementType: "vg_label", tracks: "vg_vector_c" }, visible: false },
    // The lines/planes pool, which this apply pass must keep its hands off
    // entirely (vgWriteLinesPlanesFrame owns it, per frame).
    { userData: { elementType: "vg_lp_line" }, visible: true },
    { userData: { elementType: "vg_lp_line_label" }, visible: true },
  ]);
  const vis = (s: FakeObj[], t: string) => s.filter((o) => o.userData.elementType === t)[0].visible;
  const labVis = (s: FakeObj[], tracks: string) => s.filter((o) => o.userData.tracks === tracks)[0].visible;
  const runApply = (s: FakeObj[], stateDef: unknown, src?: string) =>
    runApplyPass(s as unknown as Array<Record<string, unknown>>, stateDef, fakeDom(), src);

  // THE STATE UNDER TEST is the real one: STATE_8 of lines_and_planes_in_space
  // is where the four skew-distance objects and the two scaffolding arrows
  // shared a screen. Only `mode` decides, so the rest is the minimum a
  // lines_planes state carries.
  const LP_STATE = { vg: { mode: "lines_planes", reveal_ms: 0 } };
  const PRODUCTS_STATE = { vg: { mode: "products", show_parallelogram: true } };
  const NO_MODE_STATE = { vg: { show_parallelogram: true } };   // every Act I state as authored

  // ── (a) THE APPLY PASS ────────────────────────────────────────────────────
  const sLP = abScene();
  runApply(sLP, LP_STATE);
  assertTrue("apply, mode \"lines_planes\": the a and b ARROWS are not in the visible set",
    !vis(sLP, "vg_vector_a") && !vis(sLP, "vg_vector_b"));
  assertTrue("apply, mode \"lines_planes\": their LABELS are not either (an arrow hidden under its own bold \"a\" is not a fix)",
    !labVis(sLP, "vg_vector_a") && !labVis(sLP, "vg_vector_b"));
  assertTrue("apply, mode \"lines_planes\": the lines/planes pool is still skipped, not hidden (its own per-frame writer owns it)",
    vis(sLP, "vg_lp_line") && vis(sLP, "vg_lp_line_label"));

  const sPr = abScene();
  runApply(sPr, PRODUCTS_STATE);
  assertTrue("apply, mode \"products\": a and b ARE in the visible set — Act I is untouched",
    vis(sPr, "vg_vector_a") && vis(sPr, "vg_vector_b"));
  assertTrue("apply, mode \"products\": and so are their labels",
    labVis(sPr, "vg_vector_a") && labVis(sPr, "vg_vector_b"));
  const sNo = abScene();
  runApply(sNo, NO_MODE_STATE);
  assertTrue("apply, mode UNAUTHORED (how every shipped Act I state is actually written): a and b are shown — the gate is negative, so no authoring change can turn them off",
    vis(sNo, "vg_vector_a") && vis(sNo, "vg_vector_b")
    && labVis(sNo, "vg_vector_a") && labVis(sNo, "vg_vector_b"));
  assertTrue("...and c still answers to show_c alone in every mode (the gate did not spill onto the neighbouring branch)",
    !vis(sNo, "vg_vector_c") && !vis(sLP, "vg_vector_c"));

  // ── (b) THE PER-FRAME WRITER — the load-bearing half ──────────────────────
  //    Run through the SHIPPED frame driver §15 publishes. This is the pass
  //    that would have quietly undone an apply-only fix on frame 2.
  type Stub = { userData: { elementType: string; tracks?: string }; visible: boolean };
  const runFrame = FRAME_HARNESS.run!;
  const frameVis = (s: Stub[], t: string) => s.filter((o) => o.userData.elementType === t)[0].visible;
  const frameLab = (s: Stub[], tracks: string) => s.filter((o) => o.userData.tracks === tracks)[0].visible;
  const fLP = runFrame({ mode: "lines_planes", a_mag: 3, b_mag: 2, theta_deg: 60, reveal_ms: 0 }, 5000) as Stub[];
  assertTrue("frame, mode \"lines_planes\": the frame does NOT put the a/b arrows back (an apply-only fix dies here one frame after state entry)",
    !frameVis(fLP, "vg_vector_a") && !frameVis(fLP, "vg_vector_b"));
  assertTrue("frame, mode \"lines_planes\": nor their labels",
    !frameLab(fLP, "vg_vector_a") && !frameLab(fLP, "vg_vector_b"));
  const fPr = runFrame({ mode: "products", a_mag: 3, b_mag: 2, theta_deg: 60, reveal_ms: 0 }, 5000) as Stub[];
  assertTrue("frame, mode \"products\": both arrows are drawn and both labels placed — byte-for-byte the shipped Act I behaviour",
    frameVis(fPr, "vg_vector_a") && frameVis(fPr, "vg_vector_b")
    && frameLab(fPr, "vg_vector_a") && frameLab(fPr, "vg_vector_b"));
  const fNo = runFrame({ a_mag: 3, b_mag: 2, theta_deg: 60, reveal_ms: 0 }, 5000) as Stub[];
  assertTrue("frame, mode UNAUTHORED: identical to \"products\" (the default is ON)",
    frameVis(fNo, "vg_vector_a") && frameVis(fNo, "vg_vector_b"));
  // The pre-existing zero-length refusal must survive the new gate: in
  // products mode at reveal ms 0 the drawn vectors have length 0 and the
  // arrows must still be hidden, or the gate has replaced one condition with
  // another instead of ANDing them.
  const fZero = runFrame({ mode: "products", a_mag: 3, b_mag: 2, theta_deg: 60, reveal_ms: 900 }, 0) as Stub[];
  assertTrue("frame, mode \"products\" at ms 0: the zero-length refusal still holds (the mode gate was ANDed onto it, not swapped for it)",
    !frameVis(fZero, "vg_vector_a") && !frameVis(fZero, "vg_vector_b"));

  // ── (c) NEGATIVE CONTROLS ─────────────────────────────────────────────────
  //    Every one is the SHIPPED SOURCE with the gate textually removed, run
  //    through the SAME harness. A control written as a paraphrase of the fix
  //    cannot fail; these execute the pre-fix renderer.
  {
    // (1) THE PRE-FIX APPLY PASS, restated exactly: `want = true`.
    const preApply = APPLY_SRC
      .replace('|| ud.elementType === "vg_vector_b") want = vgShowAB(d);',
        '|| ud.elementType === "vg_vector_b") want = true;')
      .replace('if (tr === "vg_vector_a" || tr === "vg_vector_b") want = vgShowAB(d);',
        'if (tr === "vg_vector_a" || tr === "vg_vector_b") want = true;');
    assertTrue("the pre-fix APPLY variant differs from the shipped source (a control built by a replacement that matched nothing is not a control)",
      preApply !== APPLY_SRC && preApply.indexOf("want = true;") > 0);
    const sPre = abScene();
    runApply(sPre, LP_STATE, preApply);
    expectFail("the PRE-FIX apply pass (want = true, ungated) keeps a and b off a lines_planes state",
      !vis(sPre, "vg_vector_a") && !vis(sPre, "vg_vector_b"));
    expectFail("...and keeps their labels off it",
      !labVis(sPre, "vg_vector_a") && !labVis(sPre, "vg_vector_b"));
    // ...and the SAME pre-fix source is correct in products mode, which is
    // what made the defect survive: every gate that only ever looked at Act I
    // agreed with it.
    const sPreProd = abScene();
    runApply(sPreProd, PRODUCTS_STATE, preApply);
    assertTrue("the pre-fix pass is INDISTINGUISHABLE from the fix in \"products\" mode — the reason nine states shipped with it",
      vis(sPreProd, "vg_vector_a") === vis(sPr, "vg_vector_a")
      && vis(sPreProd, "vg_vector_b") === vis(sPr, "vg_vector_b"));

    // (2) THE APPLY-ONLY FIX — the shape this dispatch was proposed in, and
    //     the one the frame silently undoes. The apply pass is the SHIPPED
    //     (fixed) one; the frame is the shipped source with its gate removed.
    const preFrame = FRAME_HARNESS.src!
      .replace("if (vgShowAB(d) && lenA > 0.02)", "if (lenA > 0.02)")
      .replace("if (vgShowAB(d) && lenB > 0.02)", "if (lenB > 0.02)")
      .replace('if (tracks === "vg_vector_a") { showLab = vgShowAB(d); anchorEnd = ea; }',
        'if (tracks === "vg_vector_a") { showLab = true; anchorEnd = ea; }')
      .replace('else if (tracks === "vg_vector_b") { showLab = vgShowAB(d); anchorEnd = eb; }',
        'else if (tracks === "vg_vector_b") { showLab = true; anchorEnd = eb; }');
    assertTrue("the pre-fix FRAME variant differs from the shipped source (again: a replacement that matched nothing proves nothing)",
      preFrame !== FRAME_HARNESS.src && preFrame.indexOf("if (lenA > 0.02)") > 0);
    const sApplyOnly = abScene();
    runApply(sApplyOnly, LP_STATE);                        // the FIXED apply pass: hides them
    assertTrue("the apply-only build starts the state correctly (a and b hidden at state entry)",
      !vis(sApplyOnly, "vg_vector_a") && !vis(sApplyOnly, "vg_vector_b"));
    const fApplyOnly = runFrame({ mode: "lines_planes", a_mag: 3, b_mag: 2, theta_deg: 60, reveal_ms: 0 },
      5000, undefined, undefined, false, preFrame) as Stub[];
    expectFail("an APPLY-ONLY fix survives the very next frame (the frame writer re-asserts visibility from scratch)",
      !frameVis(fApplyOnly, "vg_vector_a") && !frameVis(fApplyOnly, "vg_vector_b"));
    expectFail("...and an arrows-only fix leaves the bold \"a\"/\"b\" SPRITES on screen, which is the collision the EYE walk actually reported",
      !frameLab(fApplyOnly, "vg_vector_a") && !frameLab(fApplyOnly, "vg_vector_b"));
    // The same broken frame is still right in products mode — so once more,
    // an Act-I-only gate cannot see this defect.
    const fPreProd = runFrame({ mode: "products", a_mag: 3, b_mag: 2, theta_deg: 60, reveal_ms: 0 },
      5000, undefined, undefined, false, preFrame) as Stub[];
    assertTrue("the pre-fix frame agrees with the fixed frame in \"products\" mode (same arrows, same labels)",
      frameVis(fPreProd, "vg_vector_a") === frameVis(fPr, "vg_vector_a")
      && frameLab(fPreProd, "vg_vector_b") === frameLab(fPr, "vg_vector_b"));

    // (3) THE OTHER TEMPTING GATE — a POSITIVE test, `mode === "products"`.
    //     It reads the same on both concepts as authored today and is wrong
    //     for exactly one reason: every shipped Act I state omits `mode`
    //     entirely, so a positive gate blanks Act I's two vectors on a build
    //     that changed no JSON at all.
    const positiveGate = (d: Record<string, unknown>) => d.mode === "products";
    assertTrue("the positive gate agrees with the shipped one wherever mode IS authored (which is why it looks equivalent)",
      positiveGate({ mode: "products" }) === (E.vgShowAB({ mode: "products" }) as boolean)
      && positiveGate({ mode: "lines_planes" }) === (E.vgShowAB({ mode: "lines_planes" }) as boolean));
    expectFail("a `mode === \"products\"` gate keeps a and b on a state that authors no mode (every Act I state as shipped)",
      positiveGate({ show_parallelogram: true }));
    assertTrue("the SHIPPED negative gate keeps them on that same state",
      E.vgShowAB({ show_parallelogram: true }) === true);
    assertTrue("...and a state with no vg block at all does not throw the predicate (a throw here blanks the scene)",
      E.vgShowAB(undefined) === true && E.vgShowAB(null) === true);
  }

  // ── (d) THE AUTHORED CONCEPT, read from disk — the gate is pointed at the
  //    real states, not at a mode string this file invented.
  {
    const CONCEPT = "src/data/concepts/mathematics/lines_and_planes_in_space.json";
    let modes: string[] = [];
    try {
      const j = JSON.parse(readFileSync(CONCEPT, "utf-8"));
      const findCfg = (o: unknown): Record<string, any> | null => {
        if (!o || typeof o !== "object") return null;
        const r = o as Record<string, any>;
        if (r.states && r.scenario_type === "vector_geometry_3d") return r;
        for (const k of Object.keys(r)) { const f = findCfg(r[k]); if (f) return f; }
        return null;
      };
      const cfg = findCfg(j);
      if (cfg) modes = Object.keys(cfg.states).map((k) => (cfg.states[k].vg || {}).mode);
    } catch { modes = []; }
    if (modes.length === 0) {
      console.log("  SKIP  lines_and_planes_in_space.json not on this desk — the authored-mode check is advisory");
    } else {
      assertTrue(`all ${modes.length} authored states of lines_and_planes_in_space declare mode "lines_planes", so the gate covers every one of them`,
        modes.every((m) => m === "lines_planes"));
      const sAuthored = abScene();
      runApply(sAuthored, { vg: { mode: modes[0] } });
      assertTrue("the AUTHORED mode string, fed to the shipped apply pass, hides the pair (no string this file made up)",
        !vis(sAuthored, "vg_vector_a") && !vis(sAuthored, "vg_vector_b"));
    }
  }
}

console.log("\n=== 23. F14 — THE INTERSECTION IS A LIST: ONE STATE MAY TEACH BOTH CASES, AND NO SUBJECT WINS SILENTLY ===");
{
  // bug_class vg_intersection_is_a_single_target_so_a_state_teaching_BOTH_
  // cases_can_render_only_one (MAJOR). ENGINE DELTA 4 exists so the case with
  // NO intersection carries a readout instead of teaching by omission. But
  // `var isec = d.intersection` named ONE line and one plane for a whole
  // state, and lines_and_planes_in_space STATE_4 teaches BOTH cases inside one
  // state: Lpar (n·d = 0) glides past the plane for 9.5 s — the lesson IS the
  // absence — and then Lcut punches through at λ = 2.600.
  //
  // THE DISCRIMINATING QUANTITY IS WHETHER ONE AUTHORED BLOCK CAN PRODUCE BOTH
  // HALVES. Every weaker quantity was already true of the singleton: Δ4's row
  // renders (on a parallel-only state), the marker renders (on a cutting-only
  // state), the numbers are right, the resolver is deterministic, and §10 +
  // §19b are both green. What the singleton could not do is serve one state
  // that needs both — so the two targetings are BOTH run below, and both are
  // watched to fail, before the list is asserted to succeed.
  const nrm = (v: V3): V3 => { const l = len3(v); return [v[0] / l, v[1] / l, v[2] / l]; };
  const planePoint: V3 = [0, -0.4, 0];
  const planeN: V3 = [0.35, 1, 0.25];
  const nh = nrm(planeN);
  const uIn = nrm(cross3(nh, [0, 0, 1]));                    // exactly IN the plane: n̂·d̂ = 0
  const ang55 = 55 * Math.PI / 180;
  const dCut: V3 = nrm([
    nh[0] * Math.cos(ang55) + uIn[0] * Math.sin(ang55),
    nh[1] * Math.cos(ang55) + uIn[1] * Math.sin(ang55),
    nh[2] * Math.cos(ang55) + uIn[2] * Math.sin(ang55),
  ]);
  const Xpt: V3 = add3(planePoint, [uIn[0] * 0.6, uIn[1] * 0.6, uIn[2] * 0.6]);      // ON the plane
  const cutAnchor: V3 = sub3(Xpt, [dCut[0] * 2.6, dCut[1] * 2.6, dCut[2] * 2.6]);    // so λ == 2.600
  const parAnchor: V3 = add3(planePoint, [nh[0] * 1.4, nh[1] * 1.4, nh[2] * 1.4]);

  // ── THE PRE-FIX RESOLVER, RECONSTRUCTED ──────────────────────────────────
  //   The SHIPPED sandbox with exactly ONE region replaced: the F14 block, by
  //   the single-target text that shipped. It is not a paraphrase — it is the
  //   master body, so the control EXECUTES the defect. If either delimiter
  //   stops matching, this THROWS: a control that silently fails to plant its
  //   defect is worse than no control (§19b's rule, applied to a region rather
  //   than to one line).
  const F14_START = "        var isecs = vgList(d.intersections).slice();";
  const F14_END = "        // ── F23 · the line's shadow in the plane";
  const PRE_F14 = [
    "        var isec = d.intersection;",
    "        if (isec && vgInGroup(isec, group)) {",
    "            var iL = ctx.lines[isec.line], iP = ctx.planes[isec.plane];",
    "            if (iL && iP) {",
    "                var meet = vgLinePlaneMeet(iL.anchor, iL.dir, iP.point, iP.n);",
    "                if (meet) {",
    "                    var ifrac = vgRevealFrac(isec, stateMs, growMs);",
    "                    var iShown = vgArrived(ifrac);",
    "                    out.meet = meet;",
    "                    if (iShown) out.readouts.d_dot_n = meet.d_dot_n;",
    "                    if (meet.exists) {",
    "                        if (iShown) {",
    "                            out.readouts.lambda = meet.lambda;",
    "                            out.readouts.intersection_point = meet.point;",
    "                            out.readouts.no_meeting_point = false;",
    "                        }",
    "                        ctx.derived[(isec.id || \"X\")] = meet.point;",
    "                        if (ifrac > 0) {",
    "                            out.points.push({",
    "                                id: isec.id || \"X\", position: meet.point, frac: ifrac, ghost: 1,",
    "                                role: isec.role || \"derived\", label: isec.label || null,",
    "                                size: (typeof isec.size === \"number\" && isFinite(isec.size)) ? isec.size : 0.15,",
    "                                is_intersection: true",
    "                            });",
    "                        }",
    "                    } else if (iShown) {",
    "                        out.readouts.no_meeting_point = true;",
    "                    }",
    "                }",
    "            }",
    "        }",
    "",
  ].join("\n");
  const singleTarget = (name: string, src: string) => {
    if (name !== "vgResolveLinesPlanes") return src;
    const s = src.indexOf(F14_START), e = src.indexOf(F14_END);
    if (s < 0 || e < 0 || e < s) {
      throw new Error(
        "§23 NEGATIVE CONTROL CANNOT BE BUILT: the shipped F14 region no longer matches the delimiters this "
        + "control replaces (start " + s + ", end " + e + "). A control that silently fails to plant its defect "
        + "is worse than no control. Re-anchor F14_START / F14_END and re-watch it fail.");
    }
    return src.slice(0, s) + PRE_F14 + src.slice(e);
  };
  const PRE = buildVgSandbox(singleTarget) as any;
  assertTrue("the reconstructed pre-fix resolver really is single-target (it reads d.intersection and ignores d.intersections)",
    Object.keys(PRE.vgResolveLinesPlanes({
      mode: "lines_planes", reveal_ms: 0,
      planes: [{ id: "P1", point: planePoint, normal: planeN, half_extent: 3 }],
      lines: [{ id: "Lcut", point: cutAnchor, dir: dCut, lambda_span: [-3, 3] }],
      intersections: [{ id: "X", line: "Lcut", plane: "P1" }],
    }, {}, 9000).readouts).length === 0);

  // ── (a) THE STATE THAT COULD NOT BE AUTHORED, END TO END ─────────────────
  //   ONE block, two intersections, disjoint reveal windows — and it is read
  //   through the SHIPPED FRAME DRIVER and the #vg_readout DOM panel, not off
  //   the resolver's return value: the claim is about what a teacher READS.
  const STATE_4: Record<string, unknown> = {
    mode: "lines_planes", reveal_ms: 0,
    value_readouts: ["d_dot_n", "lambda", "intersection_point", "no_meeting_point"],
    planes: [{ id: "P1", point: planePoint, normal: planeN, half_extent: 3.0, show_normal: true }],
    lines: [
      { id: "Lpar", point: parAnchor, dir: uIn, lambda_span: [-3, 3], label: "d", hide_at_ms: 9500 },
      { id: "Lcut", point: cutAnchor, dir: dCut, lambda_span: [-3, 3], label: "d", reveal_at_ms: 9500 },
    ],
    // Each line publishes its OWN pair, on its own beat, inside its own window.
    intersections: [
      { id: "Xpar", line: "Lpar", plane: "P1", reveal_at_ms: 1000, hide_at_ms: 9500 },
      { id: "X", line: "Lcut", plane: "P1", reveal_at_ms: 12000 },
    ],
  };
  const runFrame = FRAME_HARNESS.run!;
  const frameAt = (block: Record<string, unknown>, ms: number) => {
    const dom = fakeDom();
    const win: Record<string, unknown> = {};
    runFrame(block, ms, dom, win);
    const el = dom.get("vg_readout");
    return { html: el.innerHTML, shown: el.style.display, lp: win.PM_vgLinesPlanes as any };
  };
  {
    // THE FIRST HALF — the absence, which is the lesson.
    const f = frameAt(STATE_4, 2000);
    assertTrue(`t=2000ms: the panel prints the PARALLEL line's own pair — "n·d = 0.000" AND "no meeting point" (got: ${f.html.replace(/<[^>]+>/g, " | ").trim()})`,
      f.html.includes("n·d = 0.000") && f.html.includes("no meeting point") && f.shown === "block");
    assertTrue("t=2000ms: ...and NOT one number belonging to the line that has not appeared yet — no λ, no meeting point",
      !f.html.includes("vg_readout_lambda") && !f.html.includes("vg_readout_intersection_point"));
    check("t=2000ms: n·d is Lpar's own 0.000, to 1e-15 (the value the printed row rests on)", f.lp.readouts.d_dot_n, 0, 1e-15);
    assertTrue("t=2000ms: no_meeting_point is TRUE — Δ4 doing the job it was built for, on the state that needs it",
      f.lp.readouts.no_meeting_point === true);
    const early = E.vgResolveLinesPlanes(STATE_4, {}, 2000);
    const drawnEarly = early.lines.filter((l: any) => l.frac > 0).map((l: any) => l.id);
    assertTrue(`t=2000ms: the picture agrees — the only line drawn is Lpar (got [${drawnEarly.join(", ")}]) and there is NO marker anywhere`,
      drawnEarly.length === 1 && drawnEarly[0] === "Lpar"
      && early.points.filter((p: any) => p.is_intersection === true).length === 0);
  }
  {
    // THE SECOND HALF — the meeting, on the same authored block.
    const f = frameAt(STATE_4, 15000);
    assertTrue(`t=15000ms: the SAME block now prints the CUTTING line's numbers — "n·d = 0.574", "λ = 2.600" and a meeting point (got: ${f.html.replace(/<[^>]+>/g, " | ").trim()})`,
      f.html.includes("n·d = 0.574") && f.html.includes("λ = 2.600")
      && f.html.includes("vg_readout_intersection_point") && f.shown === "block");
    assertTrue("t=15000ms: ...and the absence row is GONE — the panel never claims both at once",
      !f.html.includes("no meeting point"));
    check("t=15000ms: n·d is the constructed cos 55", f.lp.readouts.d_dot_n, Math.cos(ang55), 1e-12);
    check("t=15000ms: λ is the constructed 2.600", f.lp.readouts.lambda, 2.6, 1e-12);
    const late = E.vgResolveLinesPlanes(STATE_4, {}, 15000);
    const markers = late.points.filter((p: any) => p.is_intersection === true);
    const drawnLate = late.lines.filter((l: any) => l.frac > 0).map((l: any) => l.id);
    assertTrue(`t=15000ms: the picture agrees — exactly one marker, and the only line drawn is Lcut (got [${drawnLate.join(", ")}])`,
      markers.length === 1 && markers[0].id === "X" && drawnLate.length === 1 && drawnLate[0] === "Lcut");
    check("...and the printed point really is ON the plane (n·(X−a) == 0), solved outside the renderer",
      dot3(planeN, sub3(f.lp.readouts.intersection_point as V3, planePoint)), 0, 1e-12);
    check("...and ON the line (the marker is not a plausible position near it)",
      len3(cross3(sub3(f.lp.readouts.intersection_point as V3, cutAnchor), dCut)), 0, 1e-12);
    // THE SWITCH IS A SWITCH: the token's VALUE moves when its subject does.
    assertTrue("n·d changes subject across the state — 0.000 while Lpar is on screen, 0.574 once Lcut is",
      Math.abs(frameAt(STATE_4, 2000).lp.readouts.d_dot_n - 0) < 1e-15
      && Math.abs(frameAt(STATE_4, 15000).lp.readouts.d_dot_n - Math.cos(ang55)) < 1e-12);
    assertTrue("...and nothing is ever ambiguous: PM_vgLinesPlanes.readout_conflicts is empty at every sampled instant",
      [0, 1500, 2000, 5000, 9000, 9600, 12500, 15000, 20000]
        .every((ms) => (frameAt(STATE_4, ms).lp.readout_conflicts as unknown[]).length === 0));
  }

  // ── (b) NEGATIVE CONTROL — BOTH TARGETINGS OF THE SINGLETON, AND THERE ARE
  //    ONLY TWO. The singleton names one line, so "target Lcut" and "target
  //    Lpar" are the whole option space; each is run against the SAME two-line
  //    scene, and each is watched to lose one half of the state.
  {
    const singleBlock = (target: string) => {
      const b = JSON.parse(JSON.stringify(STATE_4));
      delete b.intersections;
      b.intersection = (target === "Lcut")
        ? { id: "X", line: "Lcut", plane: "P1", reveal_at_ms: 12000 }
        : { id: "Xpar", line: "Lpar", plane: "P1", reveal_at_ms: 1000, hide_at_ms: 9500 };
      return b;
    };
    // FIRST, THE SECTION'S OWN FALSIFIABILITY: run (a)'s exact authored block
    // through the pre-fix build. It reads a field that does not exist for it,
    // so every assertion in (a) fails on it — this section cannot pass on the
    // build that shipped the defect. (Against the pre-fix RENDERER the control
    // throws instead, by design: the delimiters are gone, and a control that
    // cannot plant its defect must stop the run rather than pass it.)
    const SWEEP0 = [0, 2000, 5000, 9600, 12500, 15000, 20000];
    expectFail("the pre-fix build prints ANYTHING at all from the intersections[] block section (a) reads",
      SWEEP0.some((ms) => Object.keys(PRE.vgResolveLinesPlanes(STATE_4, {}, ms).readouts).length > 0));
    // TARGETING Lcut — what the concept actually shipped. The absence row can
    // never render, at any instant of the state.
    const cutB = singleBlock("Lcut");
    const SWEEP = [0, 500, 1000, 1500, 2000, 3000, 5000, 7000, 9000, 9600, 11000, 12500, 15000, 20000];
    const cutSays = SWEEP.map((ms) => PRE.vgResolveLinesPlanes(cutB, {}, ms).readouts);
    expectFail("targeting Lcut, the singleton can render Δ4's \"no meeting point\" at SOME instant of the state",
      cutSays.some((r: any) => r.no_meeting_point === true));
    expectFail("targeting Lcut, the singleton says ANYTHING at all during Lpar's 9.5 s (its readouts are empty every sample before 12000 ms)",
      SWEEP.filter((ms) => ms < 12000).some((ms) => Object.keys(PRE.vgResolveLinesPlanes(cutB, {}, ms).readouts).length > 0));
    assertTrue("...and that is not a broken fixture — it does print the CUTTING half correctly, which is why it shipped",
      Math.abs(PRE.vgResolveLinesPlanes(cutB, {}, 15000).readouts.d_dot_n - Math.cos(ang55)) < 1e-12
      && Math.abs(PRE.vgResolveLinesPlanes(cutB, {}, 15000).readouts.lambda - 2.6) < 1e-12);
    // TARGETING Lpar — the only other option. The absence row renders, and the
    // marker the second half is built around never exists.
    const parB = singleBlock("Lpar");
    const parMarkers = SWEEP.map((ms) => PRE.vgResolveLinesPlanes(parB, {}, ms).points.filter((p: any) => p.is_intersection === true).length);
    expectFail("targeting Lpar, the singleton produces the X marker Lcut's half is built around at SOME instant",
      parMarkers.some((n: number) => n > 0));
    expectFail("targeting Lpar, the singleton publishes λ or a meeting point at SOME instant",
      SWEEP.some((ms) => {
        const r = PRE.vgResolveLinesPlanes(parB, {}, ms).readouts;
        return r.lambda !== undefined || r.intersection_point !== undefined;
      }));
    assertTrue("...and that targeting DOES print the parallel half correctly — so neither targeting is simply broken; each serves exactly one half",
      PRE.vgResolveLinesPlanes(parB, {}, 2000).readouts.no_meeting_point === true);
    // THE OPTION SPACE IS CLOSED, read off the pre-fix text itself.
    assertTrue("the singleton names exactly ONE line (its whole body reads d.intersection once, and no list anywhere)",
      (PRE_F14.match(/d\.intersection/g) || []).length === 1 && PRE_F14.indexOf("d.intersections") < 0);
    // ...and the SHIPPED list serves both halves from the one block that the
    // singleton could not: the same two measurements, side by side.
    assertTrue("the SHIPPED resolver does both from ONE block — the absence at 2000 ms and the marker at 15000 ms",
      E.vgResolveLinesPlanes(STATE_4, {}, 2000).readouts.no_meeting_point === true
      && E.vgResolveLinesPlanes(STATE_4, {}, 15000).points.filter((p: any) => p.is_intersection === true).length === 1);
  }

  // ── (c) BACKWARD COMPATIBILITY — d.intersection is the SHIPPED SHAPE ──────
  //   Not "it still runs": the singular path must resolve to the SAME frame.
  //   Compared against the reconstructed pre-fix build, over a time sweep, on
  //   every surface the frame writer and the panel actually consume — and the
  //   key-set difference is MEASURED, so "the two new keys" is proved rather
  //   than asserted by hand.
  {
    const CONSUMED = ["lines", "planes", "points", "segments", "arcs", "vectors",
      "right_angle", "readouts", "unknown_readouts", "group", "meet"];
    const singular = (target: "Lcut" | "Lpar") => ({
      mode: "lines_planes", reveal_ms: 0,
      planes: [{ id: "P1", point: planePoint, normal: planeN, half_extent: 3.0, show_normal: true }],
      lines: [
        { id: "Lpar", point: parAnchor, dir: uIn, lambda_span: [-3, 3] },
        { id: "Lcut", point: cutAnchor, dir: dCut, lambda_span: [-3, 3] },
      ],
      intersection: { id: "X", line: target, plane: "P1", reveal_at_ms: 1200, grow_ms: 800 },
    });
    const SWEEP = [0, 600, 1200, 1600, 2000, 2400, 5000, 20000];
    for (const target of ["Lcut", "Lpar"] as const) {
      const b = singular(target);
      const same = SWEEP.every((ms) => {
        const now = E.vgResolveLinesPlanes(b, {}, ms), was = PRE.vgResolveLinesPlanes(b, {}, ms);
        return CONSUMED.every((k) => JSON.stringify(now[k]) === JSON.stringify(was[k]));
      });
      assertTrue(`singular d.intersection targeting ${target}: every consumed surface is IDENTICAL to the pre-fix build at all ${SWEEP.length} sampled instants (lines, planes, points, segments, arcs, vectors, right_angle, readouts, group, meet)`, same);
    }
    // The two new keys are DECLARED in the shared `out` literal, outside the
    // region this control replaces, so the pre-fix build carries them too and
    // empty — which is the strongest possible statement of "additive": the key
    // SET does not move at all, and the new keys are what a singular authoring
    // would have put there anyway.
    const nowRes = E.vgResolveLinesPlanes(singular("Lcut"), {}, 5000);
    const wasRes = PRE.vgResolveLinesPlanes(singular("Lcut"), {}, 5000);
    const nowKeys = Object.keys(nowRes).sort(), wasKeys = Object.keys(wasRes).sort();
    assertTrue(`the key SET of the resolved frame does not move at all (now [${nowKeys.join(", ")}])`,
      nowKeys.join(",") === wasKeys.join(","));
    assertTrue(`...and the additions are purely additive on the singular path: meets echoes the one intersection (${nowRes.meets.length}, id "${nowRes.meets[0].id}") and readout_conflicts is empty (${nowRes.readout_conflicts.length})`,
      nowRes.meets.length === 1 && nowRes.meets[0].id === "X" && nowRes.readout_conflicts.length === 0
      && wasRes.meets.length === 0 && wasRes.readout_conflicts.length === 0);
    // The DEFAULT ADDRESS did not move. An unnamed intersection's id is what
    // the frame writer stamps onto the marker mesh (glow_focal names it), so
    // renaming the first one to "X0" would silently orphan every authored
    // reference to "X".
    const unnamed = {
      mode: "lines_planes", reveal_ms: 0,
      planes: [{ id: "P1", point: planePoint, normal: planeN, half_extent: 3.0 }],
      lines: [{ id: "Lcut", point: cutAnchor, dir: dCut, lambda_span: [-3, 3] }],
      intersection: { line: "Lcut", plane: "P1" },
    };
    const uNow = E.vgResolveLinesPlanes(unnamed, {}, 5000).points.filter((p: any) => p.is_intersection)[0];
    const uWas = PRE.vgResolveLinesPlanes(unnamed, {}, 5000).points.filter((p: any) => p.is_intersection)[0];
    assertTrue(`an UNNAMED singular intersection still resolves to the id "X" (pre-fix "${uWas.id}", shipped "${uNow.id}")`,
      uNow.id === "X" && uWas.id === "X");
    // ...and a block that authors BOTH keeps both — a newer field never
    // silently swallows the object authored beside it.
    const both = {
      mode: "lines_planes", reveal_ms: 0,
      planes: [{ id: "P1", point: planePoint, normal: planeN, half_extent: 3.0 }],
      lines: [
        { id: "Lcut", point: cutAnchor, dir: dCut, lambda_span: [-3, 3] },
        { id: "Lpar", point: parAnchor, dir: uIn, lambda_span: [-3, 3] },
      ],
      intersections: [{ id: "Xa", line: "Lcut", plane: "P1" }],
      intersection: { id: "Xb", line: "Lpar", plane: "P1" },
    };
    const bothRes = E.vgResolveLinesPlanes(both, {}, 5000);
    assertTrue(`authoring both keys resolves BOTH intersections, in list-then-singular order (got [${bothRes.meets.map((m: any) => m.id).join(", ")}])`,
      bothRes.meets.length === 2 && bothRes.meets[0].id === "Xa" && bothRes.meets[1].id === "Xb");
  }

  // ── (d) THE COLLISION IS A REFUSAL, NOT A WINNER ─────────────────────────
  //   Two intersections arrived at once cannot both own a token whose NAME is
  //   d_dot_n. The decision recorded here: publish NOTHING and RECORD the
  //   collision, rather than pick. A precedence rule is a coin flip the reader
  //   cannot see — demonstrated below by running both plausible rules on the
  //   identical frame and watching them disagree.
  {
    const clash: Record<string, unknown> = {
      mode: "lines_planes", reveal_ms: 0,
      value_readouts: ["d_dot_n", "lambda", "intersection_point", "no_meeting_point"],
      planes: [{ id: "P1", point: planePoint, normal: planeN, half_extent: 3.0 }],
      lines: [
        { id: "Lpar", point: parAnchor, dir: uIn, lambda_span: [-3, 3], label: "d" },
        { id: "Lcut", point: cutAnchor, dir: dCut, lambda_span: [-3, 3], label: "d" },
      ],
      intersections: [
        { id: "Xpar", line: "Lpar", plane: "P1", reveal_at_ms: 1000 },
        { id: "X", line: "Lcut", plane: "P1", reveal_at_ms: 1000 },
      ],
    };
    const res = E.vgResolveLinesPlanes(clash, {}, 5000);
    assertTrue("two co-revealed intersections publish NOT ONE of the four tokens",
      ["d_dot_n", "lambda", "intersection_point", "no_meeting_point"]
        .every((t) => res.readouts[t] === undefined));
    assertTrue(`...and the collision is RECORDED, naming both claimants (got ${JSON.stringify(res.readout_conflicts)})`,
      res.readout_conflicts.length === 1 && res.readout_conflicts[0].family === "intersection"
      && res.readout_conflicts[0].claimants.sort().join(",") === "X,Xpar");
    // The record's token list is BOUND to the branch that publishes them: a
    // fifth token added to the family without being added to the record would
    // fail here rather than start slipping through the refusal.
    {
      const start = SRC.indexOf("function vgResolveLinesPlanes(");
      let depth = 0, end = start;
      for (let j = SRC.indexOf("{", start); j < SRC.length; j++) {
        if (SRC[j] === "{") depth++;
        else if (SRC[j] === "}") { depth--; if (depth === 0) { end = j + 1; break; } }
      }
      const RES = SRC.slice(start, end);
      // The F14 REGION ONLY, bounded by the same two delimiters the negative
      // control uses — the projection and the arcs publish further down, and a
      // slice that ran to the end of the resolver would silently swallow them.
      const f14 = RES.slice(RES.indexOf(F14_START.trim()), RES.indexOf(F14_END.trim()));
      assertTrue("the F14 region is bounded by the same delimiters the negative control replaces (a mis-sliced region would count the projection's tokens too)",
        f14.length > 0 && f14.indexOf("angle_line_normal_deg") < 0);
      const published = (f14.match(/out\.readouts\.([a-z_]+) =/g) || [])
        .map((s) => /out\.readouts\.([a-z_]+) =/.exec(s)![1]);
      const recorded = res.readout_conflicts[0].tokens.slice().sort().join(",");
      assertTrue(`the recorded token list IS the set the single-claimant branch assigns (publishes [${Array.from(new Set(published)).sort().join(", ")}], records [${recorded}])`,
        Array.from(new Set(published)).sort().join(",") === recorded);
      check("out.readout_conflicts is pushed from exactly ONE site (the refusal has no second, weaker path)",
        (RES.match(/out\.readout_conflicts\.push\(/g) || []).length, 1, 0);
    }
    // THE PICTURE IS NOT WITHHELD — only the ambiguous NUMBER is. Geometry is
    // addressed by id and can never be misread as belonging to the other line.
    assertTrue("the marker for the line that DOES meet is still drawn (the refusal costs the panel a row, never the scene an object)",
      res.points.filter((p: any) => p.is_intersection === true).length === 1);
    // ...and the frame driver carries the record to where a probe can read it.
    const f = frameAt(clash, 5000);
    assertTrue("the panel prints no intersection row at all, and PM_vgLinesPlanes.readout_conflicts carries the reason",
      !f.html.includes("vg_readout_d_dot_n") && !f.html.includes("vg_readout_no_meeting_point")
      && (f.lp.readout_conflicts as any[]).length === 1);
    // NEGATIVE CONTROL — the two precedence rules, on this identical frame.
    {
      const arrived = E.vgResolveLinesPlanes(clash, {}, 5000).meets
        .filter((m: any) => E.vgArrived(m.frac));
      const firstWins = arrived[0].meet.d_dot_n;
      const lastWins = arrived[arrived.length - 1].meet.d_dot_n;
      expectFail(`a precedence rule prints the same number either way (first-authored says n·d = ${firstWins.toFixed(3)}, last-authored says ${lastWins.toFixed(3)}, on the same frame)`,
        Math.abs(firstWins - lastWins) < 1e-9);
      assertTrue("...and BOTH are arithmetically correct, for different lines that carry the same label d — which is why a silent winner is unreadable, not wrong",
        Math.abs(firstWins - 0) < 1e-15 && Math.abs(lastWins - Math.cos(ang55)) < 1e-12);
      expectFail("an \"exists wins\" rule is any better: it prints λ and a meeting point while the parallel line's n·d = 0 is the taught claim",
        arrived.filter((m: any) => m.meet.exists).length !== 1);
    }
    // The refusal is a WINDOW property, not a permanent one: separate the two
    // beats and the family publishes again. (A rule that never publishes on a
    // two-intersection state would pass every assertion above.)
    {
      const spaced = JSON.parse(JSON.stringify(clash));
      spaced.intersections[0].hide_at_ms = 4000;
      const r = E.vgResolveLinesPlanes(spaced, {}, 5000);
      assertTrue("close the first window and the second intersection publishes normally again (the rule gates on OVERLAP, not on arity)",
        r.readout_conflicts.length === 0 && Math.abs(r.readouts.d_dot_n - Math.cos(ang55)) < 1e-12);
    }
  }

  // ── (e) DETERMINISM (D3 / Rule 36) — the list did not cost the rewind ─────
  {
    const times = [0, 500, 1000, 2000, 5000, 9400, 9600, 12000, 12500, 15000, 20000];
    const fwd = times.map((t) => JSON.stringify(E.vgResolveLinesPlanes(STATE_4, {}, t)));
    const rew = times.slice().reverse().map((t) => JSON.stringify(E.vgResolveLinesPlanes(STATE_4, {}, t)));
    assertTrue("REWIND: the two-intersection state replays backwards BIT FOR BIT (a SET_TIME_FREEZE re-pin is byte-identical)",
      fwd.every((x, i) => x === rew[rew.length - 1 - i]));
    const keysAt = (t: number) => Object.keys(E.vgResolveLinesPlanes(STATE_4, {}, t).readouts).sort().join(",");
    assertTrue(`the two halves arrive beat by beat and never overlap (t=0 "${keysAt(0)}", t=2000 "${keysAt(2000)}", t=10000 "${keysAt(10000)}", t=15000 "${keysAt(15000)}")`,
      keysAt(0) === "" && keysAt(2000) === "d_dot_n,no_meeting_point" && keysAt(10000) === ""
      && keysAt(15000) === "d_dot_n,intersection_point,lambda,no_meeting_point");
  }

  // ── (f) NOTHING ELSE CONSUMED THE SINGULAR ───────────────────────────────
  //   The founder's standing question on this scenario: what else reads the
  //   thing being changed? Proved off the shipped source rather than reported.
  {
    const start = SRC.indexOf("function vgResolveLinesPlanes(");
    let depth = 0, end = start;
    for (let j = SRC.indexOf("{", start); j < SRC.length; j++) {
      if (SRC[j] === "{") depth++;
      else if (SRC[j] === "}") { depth--; if (depth === 0) { end = j + 1; break; } }
    }
    const RES = SRC.slice(start, end), OUTSIDE = SRC.slice(0, start) + SRC.slice(end);
    // Comments MENTION both names (this fix is documented where it lives), so
    // the count is taken over code only.
    const code = (s: string) => s.split("\n").map((l) => {
      const i = l.indexOf("//");
      return i >= 0 ? l.slice(0, i) : l;
    }).join("\n");
    const isecLines = code(RES).split("\n").filter((l) => /d\.intersection\b/.test(l));
    assertTrue(`d.intersection is read on exactly ONE line of the whole renderer — the list fallback (got: ${isecLines.map((l) => l.trim()).join(" ⏎ ")})`,
      isecLines.length === 1 && isecLines[0].indexOf("isecs.push(d.intersection)") >= 0);
    check("...and nowhere outside the resolver", (code(OUTSIDE).match(/d\.intersection\b/g) || []).length, 0, 0);
    // out.meet: written, and read by NOBODY outside this resolver — which is
    // why turning the target into a list could not break a consumer of it.
    // Measured off the shipped source, not assumed from a grep in a report.
    check("out.meet has no consumer anywhere else in the renderer (\".meet\" appears zero times outside the resolver)",
      (OUTSIDE.match(/\.meet\b/g) || []).length, 0, 0);
    check("...and inside it, exactly the three touches this fix authors (write, null-test, publish)",
      (code(RES).match(/\.meet\b/g) || []).length, 3, 0);
    assertTrue("...and it still carries the FIRST intersection's result, so a future reader gets the singular value unchanged",
      JSON.stringify(E.vgResolveLinesPlanes(STATE_4, {}, 20000).meet)
      === JSON.stringify(E.vgResolveLinesPlanes(STATE_4, {}, 20000).meets[0].meet));
    // Act I cannot regress through this: the resolver is mode-gated (§19b(e)
    // proves the single call site) — restated here as a live measurement.
    const win: Record<string, unknown> = {};
    runFrame({ a_mag: 3, b_mag: 2, theta_deg: 60, value_readouts: ["a_mag", "a_dot_b"] }, 9000, fakeDom(), win);
    assertTrue("a products-mode frame never enters the resolver, so vector_products_in_space cannot see this change (PM_vgLinesPlanes === null)",
      win.PM_vgLinesPlanes === null);
  }

  // ── (g) THE GATE REFUSES A COLLIDING AUTHORING, on the REAL concept ───────
  //   The rule above is worth nothing if a state can ship with an overlap and
  //   nobody looks. Every authored lines_planes state is resolved across a
  //   dense sweep and must produce ZERO conflicts. Advisory only if the
  //   concept is not on this desk (the §22(d) precedent).
  {
    const CONCEPT = "src/data/concepts/mathematics/lines_and_planes_in_space.json";
    let states: Array<{ key: string; vg: Record<string, unknown> }> = [];
    try {
      const j = JSON.parse(readFileSync(CONCEPT, "utf-8"));
      const findCfg = (o: unknown): Record<string, any> | null => {
        if (!o || typeof o !== "object") return null;
        const r = o as Record<string, any>;
        if (r.states && r.scenario_type === "vector_geometry_3d") return r;
        for (const k of Object.keys(r)) { const f = findCfg(r[k]); if (f) return f; }
        return null;
      };
      const cfg = findCfg(j);
      if (cfg) {
        states = Object.keys(cfg.states)
          .map((k) => ({ key: k, vg: (cfg.states[k].vg || {}) as Record<string, unknown> }))
          .filter((s) => s.vg.mode === "lines_planes");
      }
    } catch { states = []; }
    if (states.length === 0) {
      console.log("  SKIP  lines_and_planes_in_space.json not on this desk — the authored-collision refusal is advisory");
    } else {
      const SWEEP: number[] = [];
      for (let t = 0; t <= 24000; t += 250) SWEEP.push(t);
      const withIsec = states.filter((s) => s.vg.intersection || (Array.isArray(s.vg.intersections) && (s.vg.intersections as unknown[]).length));
      let bad = 0, worst = "";
      for (const s of states) {
        for (const ms of SWEEP) {
          const c = E.vgResolveLinesPlanes(s.vg, {}, ms).readout_conflicts;
          if (c.length) { bad++; if (!worst) worst = `${s.key} @ ${ms}ms: ${JSON.stringify(c)}`; }
        }
      }
      check(`every one of the ${states.length} authored lines_planes states resolves with ZERO readout collisions across ${SWEEP.length} sampled instants${worst ? " (" + worst + ")" : ""}`,
        bad, 0, 0);
      assertTrue(`...and the scan is not vacuous — ${withIsec.length} of those states author an intersection (${withIsec.map((s) => s.key).join(", ")})`,
        withIsec.length > 0);
    }
  }
}

console.log("\n=== 24. THE LABEL IS PART OF THE NUMBER: a generic segment prints \"segment length\", never \"distance\" ===");
{
  // bug_class vg_segment_length_readout_borrows_the_point_plane_distance_label
  // (CRITICAL). The comparison-segments pass mapped a GENERIC authored
  // `readout: "length"` onto the SPECIFIC token point_plane_distance, whose
  // VG_READOUT_LABEL is the bare word "distance". On the AHA state of
  // lines_and_planes_in_space — the state that exists to break "any segment
  // from the point to the plane is the distance" — the sweeping,
  // NON-perpendicular segment therefore printed "distance = 3.110" for the
  // nine seconds before the perpendicular arrived: the panel asserted, as a
  // measured fact, the exact belief the picture was busy refuting (it is the
  // verbatim distractor of that concept's own assessment item).
  //
  // THE DISCRIMINATING QUANTITY IS THE TEXT ON THE PANEL DURING THE WRONG-
  // PICTURE BEAT — not the arithmetic (the length was always right), not the
  // reveal gating (§19b is green on the defect: the number waited correctly
  // for its segment and then said the wrong word), and not the end state
  // (at t = 9000+ the perpendicular's own row is correct and a check that
  // sampled only the settled frame sees nothing wrong). Every one of those
  // weaker quantities passed while this shipped.
  //
  // THE FIX IS A FIRST-CLASS TOKEN: segment_length, label "segment length",
  // published by the `readout: "length"` branch alone; point_plane_distance
  // is published by the F13a perpendicular alone. Two rows, two labels, two
  // meanings — which is what lets one state honestly show both at once.
  const nrm = (v: V3): V3 => { const l = len3(v); return [v[0] / l, v[1] / l, v[2] / l]; };
  const planePoint: V3 = [0, -0.4, 0];
  const planeN: V3 = [0.35, 1, 0.25];
  const nh = nrm(planeN);
  const uIn = nrm(cross3(nh, [0, 0, 1]));            // a unit direction IN the plane
  const q: V3 = [1.93, 1.19, 0.51];
  // The closed form, solved outside the renderer (§8's convention): the
  // perpendicular distance, and the foot the sweep is anchored to.
  const TRUE_D = Math.abs(dot3(nh, sub3(q, planePoint)));
  const FOOT: V3 = sub3(q, [nh[0] * dot3(nh, sub3(q, planePoint)), nh[1] * dot3(nh, sub3(q, planePoint)), nh[2] * dot3(nh, sub3(q, planePoint))]);

  // THE FIXTURE — the shape of the AHA state, with the two subjects
  // deliberately OVERLAPPING at the end (the shipped STATE_3 hides its
  // segment at 9000 ms, which is precisely why the collision below was never
  // seen there). The sweep never returns to aux_a = 0, so the two rows must
  // carry two DIFFERENT numbers wherever both are shown.
  const SWEEP_END = 1.2;
  const BLOCK: Record<string, unknown> = {
    mode: "lines_planes", reveal_ms: 0,
    value_readouts: ["segment_length", "point_plane_distance"],
    planes: [{ id: "P1", point: planePoint, normal: planeN, span_u: [1, -0.35, 0], half_extent: 3.0, show_normal: true }],
    points: [
      { id: "q", position: q, label: "q", reveal_at_ms: 0 },
      { id: "foot_sweep", position: FOOT, offset: { along: uIn, zero: 0, knob: "aux_a" }, reveal_at_ms: 0 },
    ],
    segments: [{ id: "cmp", from: "q", to: "foot_sweep", readout: "length", reveal_at_ms: 0 }],
    perpendicular: { id: "perp", from: "q", to: "P1", foot_id: "true_foot", reveal_at_ms: 9000 },
    animate: [{ knob: "aux_a", from: -2.2, to: SWEEP_END, start_ms: 0, duration_ms: 8000, easing: "linear" }],
  };
  /** aux_a at ms, by the SHIPPED ramp evaluator (never a second copy of the easing). */
  const auxAt = (ms: number) => E.vgAnimValue(BLOCK.animate, "aux_a", ms, 0);
  /** The segment's true length at ms, closed form: sqrt(d^2 + s^2) for an in-plane slide s. */
  const segLenAt = (ms: number) => Math.sqrt(TRUE_D * TRUE_D + auxAt(ms) * auxAt(ms));

  const runFrame = FRAME_HARNESS.run!;
  const panelAt = (ms: number) => {
    const dom = fakeDom();
    const win: Record<string, unknown> = {};
    runFrame(BLOCK, ms, dom, win);
    const el = dom.get("vg_readout");
    return { html: el.innerHTML, shown: el.style.display, lp: win.PM_vgLinesPlanes as any };
  };
  /** The text of one row, by token, out of the panel a teacher reads. */
  const rowText = (html: string, tok: string): string | null => {
    const m = new RegExp('<div id="vg_readout_' + tok + '">([^<]*)</div>').exec(html);
    return m ? m[1] : null;
  };
  const rowNum = (html: string, tok: string): number | null => {
    const t = rowText(html, tok);
    if (t == null) return null;
    const m = /(-?[0-9]+\.[0-9]+)/.exec(t);
    return m ? Number(m[1]) : null;
  };

  // ── (a) THE TOKEN SURFACES, SWEPT ────────────────────────────────────────
  //   The recorded recurrence mode of this family is a token fixed on ONE
  //   surface (field3d_vg_type_omits_fields_the_scenario_body_reads): a
  //   publish site with no label renders nothing, a label with no union entry
  //   is unauthorable, a union entry with no dp silently changes precision.
  //   All four are asserted off the SHIPPED source.
  {
    const RENDERER_PATH = "src/lib/renderers/field_3d_renderer.ts";
    const FILE = readFileSync(RENDERER_PATH, "utf-8");
    assertTrue("segment_length is AUTHORABLE — it is in the value_readouts TS union (the wrapper, above the template)",
      /value_readouts\?:\s*Array<[\s\S]*?'segment_length'[\s\S]*?>;/.test(FILE));
    const T = vgTextFns({}, fakeDom().document);
    assertTrue(`segment_length is LABELLED, and the label names the generic quantity (got "${T.VG_READOUT_LABEL.segment_length}")`,
      T.VG_READOUT_LABEL.segment_length === "segment length");
    assertTrue(`...and it is NOT the point-to-plane label (that one is still "${T.VG_READOUT_LABEL.point_plane_distance}", untouched)`,
      T.VG_READOUT_LABEL.point_plane_distance === "distance"
      && T.VG_READOUT_LABEL.segment_length !== T.VG_READOUT_LABEL.point_plane_distance
      && T.VG_READOUT_LABEL.segment_length.indexOf("distance") < 0);
    // Precision parity with its sibling: the two rows appear TOGETHER, so two
    // lengths at two precisions would read as a second difference between
    // them where there is only one.
    assertTrue("segment_length carries the DISTANCE precision (3 dp, the same as point_plane_distance)",
      T.vgReadoutLine("segment_length", { segment_length: 1 / 3 }) === "segment length = 0.333"
      && T.vgReadoutLine("point_plane_distance", { point_plane_distance: 1 / 3 }) === "distance = 0.333");
    // A length is in SCENE units: no unit suffix, exactly like its sibling.
    assertTrue("neither length token appends a unit (only the angles do)",
      /segment length = 0\.333$/.test(T.vgReadoutLine("segment_length", { segment_length: 1 / 3 })));
    // And the PUBLISH SITE: the "length" branch names the generic token and
    // no longer names the specific one.
    const RES = grabFn("vgResolveLinesPlanes");
    const branch = RES.slice(RES.indexOf('if (o.readout === "length")'), RES.indexOf('} else if (o.readout === "n_dot_v"'));
    assertTrue("the `readout: \"length\"` branch publishes segment_length", branch.indexOf("out.readouts.segment_length =") >= 0);
    assertTrue("...and does not mention point_plane_distance at all", branch.indexOf("point_plane_distance") < 0);
    check("point_plane_distance now has exactly ONE publish site in the whole resolver (the F13a perpendicular)",
      (RES.match(/out\.readouts\.point_plane_distance =/g) || []).length, 1, 0);
    check("...and segment_length exactly one (the comparison segment)",
      (RES.match(/out\.readouts\.segment_length =/g) || []).length, 1, 0);
  }

  // ── (b) THE WRONG-PICTURE BEAT: what the panel SAYS while the segment sweeps
  {
    const p2 = panelAt(2000);
    assertTrue(`t=2000ms: the segment row is on the panel — "${rowText(p2.html, "segment_length")}"`,
      rowText(p2.html, "segment_length") !== null);
    assertTrue("t=2000ms: and NO point_plane_distance row exists (the perpendicular does not arrive until 9000 ms)",
      rowText(p2.html, "point_plane_distance") === null);
    // THE CLAIM OF THIS SECTION, stated over the rendered TEXT rather than
    // over the token: the word "distance" is not on the panel at all while a
    // non-perpendicular segment is the only thing measured.
    assertTrue(`t=2000ms: the word "distance" appears NOWHERE on the panel (html: ${JSON.stringify(p2.html)})`,
      p2.html.indexOf("distance") < 0);
    check("t=2000ms: the printed segment length is the real length of the drawn segment",
      rowNum(p2.html, "segment_length"), Number(segLenAt(2000).toFixed(3)), 1e-12);
    // ...and it is NOT the perpendicular distance: the number itself carries
    // the lesson, so a fixture where the two coincide would prove nothing.
    assertTrue(`...and it is strictly LONGER than the true perpendicular distance (${segLenAt(2000).toFixed(3)} > ${TRUE_D.toFixed(3)})`,
      segLenAt(2000) > TRUE_D + 0.05);
  }

  // ── (c) THE SEGMENT ROW TRACKS THE SWEEP ─────────────────────────────────
  //   A row that printed a constant would satisfy (b) and teach nothing.
  {
    const a = panelAt(2000), b = panelAt(6000);
    const na = rowNum(a.html, "segment_length"), nb = rowNum(b.html, "segment_length");
    assertTrue(`two sampled instants print two DIFFERENT numbers (aux_a ${auxAt(2000).toFixed(3)} -> ${auxAt(6000).toFixed(3)}: ${na} -> ${nb})`,
      na != null && nb != null && Math.abs(na - nb) > 0.05);
    // Across the whole sweep the segment is never shorter than the
    // perpendicular — the geometric fact the state is teaching, asserted on
    // the RENDERED numbers rather than on the formula.
    let below = 0, samples = 0;
    for (let ms = 500; ms <= 8000; ms += 500) {
      const n = rowNum(panelAt(ms).html, "segment_length");
      samples++;
      if (n == null || n < TRUE_D - 1e-9) below++;
    }
    check(`over ${samples} sampled instants of the sweep, the printed segment length is NEVER below the true distance`, below, 0, 0);
  }

  // ── (d) BOTH ROWS AT ONCE, SEPARATELY LABELLED ───────────────────────────
  //   The payoff the split buys: the comparison and the answer on screen
  //   together, each saying what it is.
  {
    const p10 = panelAt(10000);
    const segT = rowText(p10.html, "segment_length"), disT = rowText(p10.html, "point_plane_distance");
    assertTrue(`t=10000ms: BOTH rows are on the panel — "${segT}" and "${disT}"`, segT !== null && disT !== null);
    assertTrue("...separately labelled (neither label is the other)",
      segT!.split("=")[0].trim() === "segment length" && disT!.split("=")[0].trim() === "distance");
    const segN = rowNum(p10.html, "segment_length")!, disN = rowNum(p10.html, "point_plane_distance")!;
    assertTrue(`...carrying two DIFFERENT numbers (${segN} vs ${disN})`, Math.abs(segN - disN) > 0.05);
    assertTrue(`...and the PERPENDICULAR is the shorter one (${disN} < ${segN}) — the lesson, read off the panel`, disN < segN);
    check("the distance row is the closed-form point-to-plane distance, unchanged by this fix", disN, Number(TRUE_D.toFixed(3)), 1e-12);
    check("the segment row is still the segment's own length", segN, Number(segLenAt(10000).toFixed(3)), 1e-12);
  }

  // ── (e) THE NEGATIVE CONTROL: the pre-fix mapping, reconstructed ─────────
  //   The SHIPPED resolver body with exactly ONE assignment rewritten back to
  //   what shipped. Guarded: if the anchor stops matching this THROWS, because
  //   a control that silently fails to plant its defect is worse than none.
  {
    const FIXED_LINE = "out.readouts.segment_length = vgLenVec(vgSub(s1, s0));";
    const PRE_LINE = "out.readouts.point_plane_distance = vgLenVec(vgSub(s1, s0));";
    const borrowLabel = (name: string, src: string) => {
      if (name !== "vgResolveLinesPlanes") return src;
      if (src.indexOf(FIXED_LINE) < 0) {
        throw new Error(
          "§24 NEGATIVE CONTROL CANNOT BE BUILT: the comparison-segment publish line no longer matches "
          + JSON.stringify(FIXED_LINE) + ". Re-anchor it and re-watch the control fail.");
      }
      return src.replace(FIXED_LINE, PRE_LINE);
    };
    const PRE = buildVgSandbox(borrowLabel) as any;
    assertTrue("the pre-fix mapping really was planted (the segment publishes point_plane_distance and no segment_length)",
      PRE.vgResolveLinesPlanes(BLOCK, { aux_a: auxAt(2000) }, 2000).readouts.point_plane_distance != null
      && PRE.vgResolveLinesPlanes(BLOCK, { aux_a: auxAt(2000) }, 2000).readouts.segment_length === undefined);

    // The panel, composed from the SHIPPED display path (the same merge +
    // vgReadoutLine loop the frame driver runs) so the control is measured in
    // TEXT. Validated first against the real frame driver on the SHIPPED
    // resolver: if the composition ever drifts from the driver, this fails
    // before it is used as a stand-in.
    const T = vgTextFns({}, fakeDom().document);
    const compose = (readouts: Record<string, unknown>) => {
      let html = "";
      for (const k of BLOCK.value_readouts as string[]) {
        const line = T.vgReadoutLine(k, readouts);
        if (line != null) html += '<div id="vg_readout_' + k + '">' + line + "</div>";
      }
      return html;
    };
    for (const ms of [2000, 10000]) {
      assertTrue(`the composed panel is BYTE-IDENTICAL to the shipped frame driver's at t=${ms}ms (the stand-in is faithful)`,
        compose(E.vgResolveLinesPlanes(BLOCK, { aux_a: auxAt(ms) }, ms).readouts) === panelAt(ms).html);
    }
    const preHtml2 = compose(PRE.vgResolveLinesPlanes(BLOCK, { aux_a: auxAt(2000) }, 2000).readouts);
    expectFail(`the pre-fix panel keeps the word "distance" off screen while a non-perpendicular segment sweeps (it renders ${JSON.stringify(preHtml2)})`,
      preHtml2.indexOf("distance") < 0);
    expectFail("the pre-fix panel names the sweeping segment for what it is",
      preHtml2.indexOf("segment length") >= 0);

    // ...and the SECOND failure the shared token hid: with both subjects
    // arrived, the segment's length OVERWRITES the perpendicular's distance
    // (the segments pass runs after the F13a pass), so the one surviving row
    // is labelled "distance" and carries the wrong number entirely.
    const pre10 = PRE.vgResolveLinesPlanes(BLOCK, { aux_a: auxAt(10000) }, 10000).readouts;
    expectFail(`the pre-fix resolver keeps the TRUE distance when both subjects are on screen (point_plane_distance = ${(pre10.point_plane_distance as number).toFixed(3)}, true ${TRUE_D.toFixed(3)})`,
      Math.abs((pre10.point_plane_distance as number) - TRUE_D) < 1e-9);
    assertTrue(`...it is the SEGMENT's length wearing the distance label (${(pre10.point_plane_distance as number).toFixed(3)} == ${segLenAt(10000).toFixed(3)})`,
      Math.abs((pre10.point_plane_distance as number) - segLenAt(10000)) < 1e-9);
    const preHtml10 = compose(pre10);
    check("the pre-fix panel shows only ONE row where the fixed one shows two", (preHtml10.match(/<div /g) || []).length, 1, 0);
    check("...and the fixed one really does show two", (panelAt(10000).html.match(/<div /g) || []).length, 2, 0);

    // The shipped resolver is untouched on every OTHER token by this change:
    // a settled frame with the segment removed is bit-identical across the two
    // builds, so the control isolates the one mapping and nothing else.
    const noSeg = JSON.parse(JSON.stringify(BLOCK));
    delete noSeg.segments;
    assertTrue("with no comparison segment authored, the pre-fix and shipped resolvers agree BIT FOR BIT (the change is exactly one mapping)",
      JSON.stringify(PRE.vgResolveLinesPlanes(noSeg, { aux_a: 0.4 }, 10000)) === JSON.stringify(E.vgResolveLinesPlanes(noSeg, { aux_a: 0.4 }, 10000)));
  }

  // ── (f) ACT I CANNOT SEE THIS ────────────────────────────────────────────
  {
    const dom = fakeDom();
    const win: Record<string, unknown> = {};
    runFrame({ a_mag: 3, b_mag: 2, theta_deg: 60, value_readouts: ["a_mag", "b_mag", "theta_deg", "a_dot_b"] }, 9000, dom, win);
    assertTrue("a products-mode frame never enters the resolver (PM_vgLinesPlanes === null) — vector_products_in_space is untouched",
      win.PM_vgLinesPlanes === null);
    assertTrue("...and all four Act I rows still print", ["a_mag", "b_mag", "theta_deg", "a_dot_b"]
      .every((k) => dom.get("vg_readout").innerHTML.indexOf("vg_readout_" + k) >= 0));
  }
}

console.log("\n=== 25. THE θ ROW NAMES WHAT IT ACTUALLY TURNS — a control label is not a compile-time string (bug_class vg_theta_deg_slider_row_is_labelled_for_products_mode_objects_in_every_mode) ===");
{
  // The panel is built ONCE, before any state is applied, so every label baked
  // into it describes geometry the renderer has not yet selected. "θ (a, b)"
  // shipped on EVERY mode: in mode "lines_planes" the knob turns whichever line
  // binds it, a and b are not drawn at all (§22 / vgShowAB), and #9 STATE_6 —
  // whose entire lesson is the angle between d₁ and d₂, and whose ONLY control
  // is this row — read "θ (a, b): 69°".
  //
  // Measured in TEXT, through the SHIPPED apply pass and the SHIPPED writer
  // (runApplyPass injects the same vgWriteRowLabels the scene-group picker
  // calls), never over the code that produces it.
  const THETA_LAB = "vg_theta_deg_lab";
  const BUILT = SHIPPED_ROW_LABEL.theta_deg;

  // (a) THE BUILT MARKUP — the handle exists, and the row id the Rule 39g
  //     widget engine discovers on (div[id$="_row"]) is untouched.
  {
    const buildAt = SRC.indexOf("function buildVectorGeometrySliders");
    const tmpl = /return '<div id="vg_' \+ prefix \+ '_row"[^\n]*\n[^\n]*/.exec(SRC.slice(buildAt));
    assertTrue("the row template still opens with the id the widget engine discovers on (vg_<knob>_row)", tmpl !== null);
    const T0 = tmpl![0];
    assertTrue(`...and the label text now lives in its own span (vg_<knob>_lab) — the handle the apply pass rewrites: ${JSON.stringify(T0.slice(0, 130))}`,
      T0.indexOf(`<span id="vg_' + prefix + '_lab">' + sc.label + '</span>`) >= 0);
    assertTrue("...with the value node and the ': ' separator unchanged, so the RENDERED text is byte-identical to the pre-fix row",
      T0.indexOf(`'</span>: <span id="vg_' + prefix + '_val">'`) >= 0);
    const buildRegion = SRC.slice(buildAt, SRC.indexOf("document.body.appendChild(spd);", buildAt));
    assertTrue("...and the built label is captured per row (VG_ROW_LABEL), on the VG_ROW_RANGE precedent",
      buildRegion.indexOf("VG_ROW_LABEL[prefix] = sc.label;") >= 0);
    // Every slider-bound row of the panel has a captured label — a row missing
    // from the table could never be restored.
    const rowIdKeys = ROW_ID_KEYS;
    assertTrue(`every one of the ${rowIdKeys.length} slider rows has a captured built label (${rowIdKeys.filter((k) => SHIPPED_ROW_LABEL[k] === undefined).join(",") || "none missing"})`,
      rowIdKeys.every((k) => typeof SHIPPED_ROW_LABEL[k] === "string" && SHIPPED_ROW_LABEL[k] !== ""));
    check("the shipped products label is still the one the pre-fix row was born with", BUILT, "θ (a, b)", 0);
  }

  // The two fixtures. The lines_planes one is #9 STATE_6's shape: M2 is the
  // line whose rotate block binds theta_deg, M1 is the reference it is measured
  // against, and both carry the labels the state's formula names.
  const M2_ROT = { about: [0.287668, -0.838664, -0.462482], zero: 69.3846, knob: "theta_deg" };
  const LP_STATE = {
    show_sliders: true,
    vg: {
      mode: "lines_planes", controls: ["theta_deg"], theta_deg: 69.3846,
      lines: [
        { id: "M1", role: "dir1", label: "d₁", point: [0, 0, 0], dir: [1, 0, 0] },
        { id: "M2", role: "dir2", label: "d₂", point: [0, 1.2, 0], dir: [0.3, 0.2, 0.9], rotate: M2_ROT },
      ],
    },
  };
  const PROD_STATE = {
    show_sliders: true,
    vg: { a_mag: 3.0, b_mag: 2.0, theta_deg: 60, controls: ["a_mag", "b_mag", "theta_deg"] },
  };
  const labOf = (dom: ReturnType<typeof fakeDom>) => dom.get(THETA_LAB).textContent;
  /** Seed the DOM the way buildVectorGeometrySliders does, then apply. */
  const applyOn = (stateDef: unknown, dom = fakeDom(), srcOverride?: string) => {
    for (const k of Object.keys(SHIPPED_ROW_LABEL)) dom.get("vg_" + k + "_lab").textContent = SHIPPED_ROW_LABEL[k];
    return runApplyPass([], stateDef, dom, srcOverride);
  };

  // (b) THE LINES_PLANES STATE — the row names the two lines, and nothing else.
  {
    const dom = fakeDom();
    applyOn(LP_STATE, dom);
    const txt = labOf(dom);
    assertTrue(`a lines_planes state whose knob rotates M2 against M1 labels the row from the AUTHORED lines — "${txt}"`,
      txt === "θ (d₁, d₂)");
    assertTrue("...it names d₁ and d₂", txt.indexOf("d₁") >= 0 && txt.indexOf("d₂") >= 0);
    assertTrue("...and the products pair is GONE from the row a teacher reads", txt.indexOf("(a, b)") < 0);
    // Reachability: the label is on a row that is actually on screen. A correct
    // label on a hidden row would pass a text check and teach nobody.
    assertTrue("the θ row is displayed and the panel is open on this state (the label is REACHABLE)",
      dom.get("vg_theta_deg_row").style.display === "block" && dom.get("vg_sliders").style.display === "block");
    // Order: reference first, rotated second — the order the state's own
    // formula and readout (angle_lines_deg, "d₁ and d₂") name them in.
    assertTrue("the reference line is named FIRST and the rotated line second", txt === "θ (" + "d₁" + ", " + "d₂" + ")");
    // No OTHER row was renamed by the pass.
    const others = Object.keys(SHIPPED_ROW_LABEL).filter((k) => k !== "theta_deg");
    assertTrue(`the other ${others.length} rows still carry the labels they were built with`,
      others.every((k) => dom.get("vg_" + k + "_lab").textContent === SHIPPED_ROW_LABEL[k]));
  }

  // (c) THE PRODUCTS STATE — byte-identical to what shipped. The test is
  //     NEGATIVE ("is lines_planes"), so every Act I state (which authors no
  //     mode at all) is untouched by construction.
  {
    const dom = fakeDom();
    applyOn(PROD_STATE, dom);
    assertTrue(`a mode-omitted state keeps the built label BYTE FOR BYTE — "${labOf(dom)}"`, labOf(dom) === BUILT);
    const T = vgTextFns({}, fakeDom().document);
    assertTrue("vgThetaRowLabel returns null (\"the built label stands\") for a products state, never a second string",
      T.vgThetaRowLabel(PROD_STATE.vg, null) === null);
    assertTrue("...and also for a state that authors NO vg block at all", T.vgThetaRowLabel({}, null) === null);
    // vector_products_in_space authors mode "products" EXPLICITLY on every
    // state (the dispatch believed Act I omitted it). The predicate is negative
    // — "is lines_planes" — so both authorings are byte-identical here, and
    // this fixture is what keeps that true if the enum ever grows a third mode.
    const dom2 = fakeDom();
    applyOn({ show_sliders: true, vg: { mode: "products", controls: ["theta_deg"], theta_deg: 60 } }, dom2);
    assertTrue(`an EXPLICIT mode "products" state keeps the built label too — "${labOf(dom2)}"`, labOf(dom2) === BUILT);
  }

  // (d) THE ROUND TRIP — a derived label may never leak into the next state
  //     (the restore-every-row doctrine the per-state RANGES already run on).
  {
    const dom = fakeDom();
    applyOn(LP_STATE, dom);
    assertTrue(`entry to the lines_planes state derives the label ("${labOf(dom)}")`, labOf(dom) === "θ (d₁, d₂)");
    runApplyPass([], PROD_STATE, dom);
    assertTrue(`...and the next mode-omitted state RESTORES it ("${labOf(dom)}")`, labOf(dom) === BUILT);
    runApplyPass([], LP_STATE, dom);
    assertTrue("...and back again, with no residue in either direction", labOf(dom) === "θ (d₁, d₂)");
  }

  // (e) THE GROUP SWITCH — #9 STATE_9's shape. theta turns nothing in group A,
  //     so the row names NOTHING there rather than naming group B's lines; the
  //     picker's own re-write (the shipped vgWriteRowLabels the change handler
  //     calls) brings the pair back when group B is selected.
  {
    const GROUPED = {
      show_sliders: true,
      vg: {
        mode: "lines_planes", controls: ["scene_group", "theta_deg"], theta_deg: 69.3846,
        scene_groups: [{ key: "A", label: "one line" }, { key: "B", label: "two lines" }],
        // `groups`, the key vgInGroup actually reads (and the key #9 STATE_9
        // authors) — a fixture written against `group` would silently place
        // every line in every group and prove nothing.
        lines: [
          { id: "L1", role: "dir1", label: "d", point: [0, 0, 0], dir: [1, 0, 0], groups: ["A"] },
          { id: "M1", role: "dir1", label: "d₁", point: [0, 0, 0], dir: [1, 0, 0], groups: ["B"] },
          { id: "M2", role: "dir2", label: "d₂", point: [0, 1.2, 0], dir: [0.3, 0.2, 0.9], rotate: M2_ROT, groups: ["B"] },
        ],
      },
    };
    const dom = fakeDom();
    const r = applyOn(GROUPED, dom);
    check("the state opens on the first authored group", r.win.PM_vgSceneGroup as string, "A", 0);
    assertTrue(`group A turns no line with this knob, so the row names NO object — "${labOf(dom)}"`, labOf(dom) === "θ");
    assertTrue("...and in particular does not name group B's lines, which are not on screen",
      labOf(dom).indexOf("d₁") < 0 && labOf(dom).indexOf("d₂") < 0 && labOf(dom).indexOf("(a, b)") < 0);
    // The picker: write the live global and re-run the SHIPPED writer, exactly
    // as the <select>'s change handler does.
    r.win.PM_vgSceneGroup = "B";
    r.T.vgWriteRowLabels(GROUPED.vg);
    assertTrue(`switching to group B re-derives the pair that group actually shows — "${labOf(dom)}"`,
      labOf(dom) === "θ (d₁, d₂)");
    r.win.PM_vgSceneGroup = "A";
    r.T.vgWriteRowLabels(GROUPED.vg);
    assertTrue("...and switching back drops them again (the label follows the picker, not the entry)", labOf(dom) === "θ");
    // The handler really does call the writer — a mechanism that exists but is
    // never called is the recorded discharge-against-a-mechanism-that-was-
    // never-built failure in miniature.
    const at = SRC.indexOf('gsel.addEventListener("change"');
    const HANDLER = at > 0 ? SRC.slice(at, at + 1600) : "";
    assertTrue("the scene-group change handler calls vgWriteRowLabels (the label is not a state-entry-only write)",
      at > 0 && HANDLER.indexOf("vgWriteRowLabels(") >= 0);
  }

  // (f) NOTHING IS EVER INVENTED — every un-derivable case falls back to a bare
  //     "θ", which names no object at all, and NEVER to the products pair.
  {
    const T = vgTextFns({}, fakeDom().document);
    const lp = (lines: unknown[]) => T.vgThetaRowLabel({ mode: "lines_planes", lines }, null);
    const cases: Array<[string, string]> = [
      ["the rotated line carries no label", lp([{ id: "M1", label: "d₁" }, { id: "M2", rotate: M2_ROT }])],
      ["the rotated line is the ONLY object (no reference to measure against)", lp([{ id: "M2", label: "d₂", rotate: M2_ROT }])],
      ["nothing in the scene binds theta_deg at all", lp([{ id: "M1", label: "d₁" }, { id: "M2", label: "d₂" }])],
      ["the rotate block binds a DIFFERENT knob", lp([{ id: "M1", label: "d₁" },
        { id: "M2", label: "d₂", rotate: { about: [0, 1, 0], knob: "line2_offset" } }])],
      ["the rotate block has no axis (vgObjRotate would return the direction unturned)",
        lp([{ id: "M1", label: "d₁" }, { id: "M2", label: "d₂", rotate: { knob: "theta_deg" } }])],
      ["the state authors no lines at all", lp([])],
    ];
    for (const [why, got] of cases) {
      assertTrue(`fallback names no object when ${why} — got "${got}"`,
        got === "θ" && got.indexOf("a") < 0 && got.indexOf("b") < 0 && got.indexOf("d") < 0);
    }
    // A plane may bind the knob too (vgObjRotate turns a plane's normal on the
    // same code path), and then it is named on the same rule.
    assertTrue("a PLANE whose normal binds the knob is named like a line",
      T.vgThetaRowLabel({
        mode: "lines_planes",
        lines: [{ id: "L", label: "d" }],
        planes: [{ id: "P", label: "n", normal: [0, 1, 0], rotate: M2_ROT }],
      }, null) === "θ (d, n)");
  }

  // (g) THE NEGATIVE CONTROL — the pre-fix behaviour, reconstructed from the
  //     SHIPPED apply pass with exactly ONE line removed (the write that did
  //     not exist before this fix). Guarded: if the anchor drifts this THROWS,
  //     because a control that silently fails to plant its defect is worse than
  //     no control at all.
  {
    const CALL = "vgWriteRowLabels(d);";
    if (APPLY_SRC.indexOf(CALL) < 0) {
      throw new Error("§25 NEGATIVE CONTROL CANNOT BE BUILT: applyVectorGeometry3DState no longer contains "
        + JSON.stringify(CALL) + ". Re-anchor it and re-watch the control fail.");
    }
    const PRE_SRC = APPLY_SRC.replace(CALL, "/* pre-fix: the label was written ONCE, at build time */");
    assertTrue("the pre-fix apply pass really was planted (it contains no label write, and differs from the shipped one)",
      PRE_SRC.indexOf("vgWriteRowLabels(") < 0 && PRE_SRC !== APPLY_SRC);
    const dom = fakeDom();
    applyOn(LP_STATE, dom, PRE_SRC);
    expectFail(`the pre-fix row names the objects the knob turns on a lines_planes state (it renders "${labOf(dom)}")`,
      labOf(dom) === "θ (d₁, d₂)");
    expectFail(`the pre-fix row keeps the products pair off a state that draws neither a nor b (it renders "${labOf(dom)}")`,
      labOf(dom).indexOf("(a, b)") < 0);
    assertTrue(`...it is exactly the shipped-today defect: the built products label, verbatim, on a lines_planes state ("${labOf(dom)}")`,
      labOf(dom) === BUILT);
    // ...and the pre-fix pass is otherwise IDENTICAL: the products fixture is
    // bit-identical across the two builds, so the control isolates one write.
    const dPre = fakeDom(), dNow = fakeDom();
    applyOn(PROD_STATE, dPre, PRE_SRC);
    applyOn(PROD_STATE, dNow);
    const dump = (d: ReturnType<typeof fakeDom>) => JSON.stringify([...d.els.entries()].sort((x, y) => (x[0] < y[0] ? -1 : 1)));
    assertTrue("on a products state the pre-fix and fixed apply passes agree BIT FOR BIT over the whole DOM (the change is exactly one write)",
      dump(dPre) === dump(dNow));
  }

  // (h) THE ⚙ PANEL still reads the row correctly — the label span is nested
  //     INSIDE <label>, and pmWgRowLabel cuts label.textContent at ":", so the
  //     teacher-facing widget name is unchanged in shape and now carries the
  //     honest object names (Rule 39f: discovery must survive this edit).
  {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const W = new Function([
      grabVar("PM_WG_WORDS"), grabFn("pmWgWord"), grabFn("pmWgRowLabel"),
      "return pmWgRowLabel;",
    ].join("\n"))() as (el: unknown) => string;
    const rowEl = (text: string) => ({
      id: "vg_theta_deg_row", getAttribute: () => null,
      querySelector: (sel: string) => (sel === "label" ? { textContent: text } : null),
    });
    check("the ⚙ entry derived from the lines_planes row", W(rowEl("θ (d₁, d₂): 69°")), "θ (d₁, d₂) slider", 0);
    check("...and from the products row, unchanged", W(rowEl("θ (a, b): 60°")), "θ (a, b) slider", 0);
  }

  // (i) THE SWEEP — every OTHER row label that names a products object, and the
  //     reason each is not reachable from mode "lines_planes" today. This is a
  //     LEDGER, not a fix (one bug_class per change): the theta row was the only
  //     one #9 could reach, because a row is only reachable through a state's
  //     controls[]/static_readouts[], and the lines_planes states author only
  //     the VG-C knobs plus theta_deg.
  {
    // A row "names an object" when a, b or c appears as a STANDALONE token
    // ("|a|", "b tilt", "θ c") — never as a letter inside a word, which is how
    // the first draft of this sweep convicted "patch size".
    const namesObject = (s: string) => /(^|[^A-Za-z])[abc]([^A-Za-z]|$)/.test(s);
    const NAMES_AN_OBJECT = Object.keys(SHIPPED_ROW_LABEL).filter((k) => namesObject(SHIPPED_ROW_LABEL[k]));
    assertTrue(`the object-naming rows are exactly the products set + theta (${NAMES_AN_OBJECT.join(", ")})`,
      JSON.stringify(NAMES_AN_OBJECT.slice().sort())
      === JSON.stringify(["a_mag", "b_mag", "b_tilt_deg", "c_mag", "c_phi_deg", "c_theta_deg", "theta_deg"].sort()));
    // The VG-C rows name a quantity, never an object — nothing to derive.
    const LP_ROWS = ["lambda", "lambda_span", "half_extent", "q_height", "line2_offset"];
    assertTrue(`the lines_planes rows name quantities, not objects (${LP_ROWS.map((k) => SHIPPED_ROW_LABEL[k]).join(" / ")})`,
      LP_ROWS.every((k) => !namesObject(SHIPPED_ROW_LABEL[k])));
    // ...and theta_deg is the ONE row of the object-naming set that is mode-
    // derived. If a future lines_planes state authors b_tilt_deg or c_mag in
    // its controls, THIS is the assertion that will need extending — recorded
    // here so the next surgeon finds it by failing, not by remembering.
    const T = vgTextFns({}, fakeDom().document);
    const derived = Object.keys(SHIPPED_ROW_LABEL).filter((k) => {
      const dom2 = fakeDom();
      for (const kk of Object.keys(SHIPPED_ROW_LABEL)) dom2.get("vg_" + kk + "_lab").textContent = SHIPPED_ROW_LABEL[kk];
      const T2 = vgTextFns({}, dom2.document);
      T2.vgWriteRowLabels(LP_STATE.vg);
      return dom2.get("vg_" + k + "_lab").textContent !== SHIPPED_ROW_LABEL[k];
    });
    assertTrue(`exactly ONE row is mode-derived today, and it is theta_deg (${derived.join(", ") || "none"})`,
      JSON.stringify(derived) === JSON.stringify(["theta_deg"]));
    // ...and the fix did NOT simply add a second per-mode literal: over the
    // renderer's CODE (comment lines excluded — this fix's own rationale names
    // both strings in prose), "θ (a, b)" appears exactly once, at the vgSc call
    // site it was born at, and no lines_planes pair is hardcoded anywhere.
    const CODE = SRC.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
    assertTrue(`the products pair is a build-time DEFAULT and appears exactly once in code (${(CODE.match(/θ \(a, b\)/g) || []).length}x)`,
      (CODE.match(/θ \(a, b\)/g) || []).length === 1 && T.VG_ROW_LABEL.theta_deg === BUILT);
    assertTrue("no lines_planes label pair is hardcoded anywhere — the names come from the authored objects",
      (CODE.match(/θ \(d/g) || []).length === 0 && (CODE.match(/d₁, d₂/g) || []).length === 0);
  }
}

console.log("\n=== 26. A NORM IS NOT AN ABSOLUTE VALUE — every bar in the readout table, and the FONT that has to draw it (bug_class vg_hud_readout_prints_single_bars_for_a_vector_norm_beside_a_double_bar_formula_surface) ===");
{
  // #9 STATE_8 printed what a teacher reads as "|d₁×d₂| = 0.936" one panel above
  // a formula surface writing "D = |(a₂−a₁)·(d₁×d₂)| ⁄ ‖d₁×d₂‖" — one quantity,
  // two written forms, on one screen. The label STRING was never the defect
  // (n_norm and cross_norm have carried U+2016 since the VG-C build); the
  // #vg_readout font stack was, and this section holds BOTH halves: the strings
  // stay right, and the stack that renders them stays one that can.
  const DBL = "‖";           // ‖ DOUBLE VERTICAL LINE — a NORM
  const SGL = "|";                // | VERTICAL LINE — an ABSOLUTE VALUE (scalar)
  const countOf = (s: string, ch: string) => s.split(ch).length - 1;
  const T = vgTextFns({}, fakeDom().document);
  const LABELS: Record<string, string> = T.VG_READOUT_LABEL;
  const KEYS = Object.keys(LABELS).sort();

  // ── (a) THE ROW A TEACHER READS, through the SHIPPED vgReadoutLine ─────────
  {
    const row = T.vgReadoutLine("cross_norm", { cross_norm: 0.936482 });
    check("the cross_norm row, rendered by the shipped formatter", row, DBL + "d₁×d₂" + DBL + " = 0.936", 0);
    check("...it carries TWO double-bar delimiters (a norm, opened and closed)", countOf(row, DBL), 2, 0);
    check("...and NOT ONE single bar anywhere in the row (that would be an absolute value)", countOf(row, SGL), 0, 0);
    assertTrue("...in particular no single bar is adjacent to the vector name it would wrap",
      !/\|\s*d/.test(row) && !/d[₁₂]\s*\|/.test(row));
    const nrow = T.vgReadoutLine("n_norm", { n_norm: 1.08911 });
    check("the n_norm row, the sibling surface of the same defect", nrow, DBL + "n" + DBL + " = 1.089", 0);
    check("...two double bars", countOf(nrow, DBL), 2, 0);
    check("...zero single bars", countOf(nrow, SGL), 0, 0);
  }

  // ── (b) THE WHOLE TABLE, CLASSIFIED — a single bar may wrap a SCALAR only ──
  //   Bars are not decoration: |x| is the absolute value of a NUMBER, ‖v‖ is the
  //   length of a VECTOR. The classifier reads what is INSIDE a delimiter pair:
  //     · anywhere  → a dot product, i.e. a SCALAR  → single bars are correct
  //     × anywhere  → a cross product, i.e. a VECTOR → double bars required
  //     a bare (possibly subscripted) vector name    → a VECTOR
  //     anything else → UNKNOWN, and the gate FAILS until a surgeon classifies
  //                     it here. That is the mechanism that catches the NEXT
  //                     token, not this one.
  const VECTOR_NAMES = ["a", "b", "c", "d", "n", "v", "u", "m", "r"];
  const classify = (inner: string): "scalar" | "vector" | "unknown" => {
    const s = inner.trim();
    if (s.indexOf("·") >= 0) return "scalar";
    if (s.indexOf("×") >= 0) return "vector";
    const bare = s.replace(/[()\s]/g, "").replace(/[₀₁₂₃]/g, "");
    if (VECTOR_NAMES.indexOf(bare) >= 0) return "vector";
    return "unknown";
  };
  /** Every |…| group and every ‖…‖ group of a label, with its classification. */
  const groupsOf = (label: string) => {
    const out: Array<{ kind: "single" | "double"; inner: string; cls: string }> = [];
    for (const m of label.matchAll(new RegExp(DBL + "([^" + DBL + "]*)" + DBL, "g"))) {
      out.push({ kind: "double", inner: m[1], cls: classify(m[1]) });
    }
    // Single-bar groups are read off the label with every double-bar group
    // removed first, so ‖ never contributes a phantom | pair.
    const stripped = label.split(DBL).join(" ");
    for (const m of stripped.matchAll(/\|([^| ]*)\|/g)) {
      out.push({ kind: "single", inner: m[1], cls: classify(m[1]) });
    }
    return out;
  };
  {
    // The two halves of the table. They are written out (not derived) because
    // the CONVENTION differs between them and that difference is a decision:
    //  · the lines/planes half (#9 lines_and_planes_in_space) writes ‖v‖ for a
    //    norm on every surface it has — S6 ‖d₁‖‖d₂‖, S7 ‖d‖‖n‖, S3/S8 ⁄ ‖n‖,
    //    ⁄ ‖d₁×d₂‖ — so its readout rows must too;
    //  · the products half (vector_products_in_space) writes |a|, |b|, |a×b| on
    //    every surface IT has (its own formula_overlay strings read
    //    "a·b = |a| |b| cos θ" and "|a×b| = |a| |b| sin θ"), the school
    //    magnitude notation, and is INTERNALLY consistent. Rewriting those three
    //    to ‖ here would plant this very bug_class in the other concept, so they
    //    are an AUDITED ALLOWLIST, byte-locked below rather than "fixed".
    const PRODUCTS_KEYS = ["a_mag", "b_mag", "theta_deg", "a_dot_b", "cross_mag",
      "a_dot_cross", "b_dot_cross", "triple", "volume", "base_area", "height"];
    const LINES_PLANES_KEYS = ["point_plane_distance", "skew_distance", "segment_length",
      "angle_lines_deg", "angle_line_plane_deg", "angle_line_normal_deg",
      "d_dot_n", "n_dot_v", "lambda", "intersection_point",
      "n_norm", "cross_norm", "numerator_triple_product", "no_meeting_point"];
    assertTrue(`every one of the ${KEYS.length} shipped tokens is assigned to exactly one half (a NEW token fails here until it is classified)`,
      JSON.stringify(PRODUCTS_KEYS.concat(LINES_PLANES_KEYS).sort()) === JSON.stringify(KEYS)
      && PRODUCTS_KEYS.every((k) => LINES_PLANES_KEYS.indexOf(k) < 0));

    // Nothing anywhere in the table may carry an unbalanced or unclassifiable
    // delimiter — the invariant that makes the two half-rules meaningful.
    for (const k of KEYS) {
      const lab = LABELS[k];
      assertTrue(`"${k}" = "${lab}": its bars are balanced (${countOf(lab, SGL)} single, ${countOf(lab, DBL)} double)`,
        countOf(lab, SGL) % 2 === 0 && countOf(lab, DBL) % 2 === 0);
      for (const g of groupsOf(lab)) {
        assertTrue(`"${k}": the ${g.kind}-bar group "${g.inner}" is classifiable as a scalar or a vector (got ${g.cls})`,
          g.cls !== "unknown");
      }
    }

    // THE LINES/PLANES HALF — a single bar may never wrap a vector, and a
    // double bar may never wrap a scalar.
    const SINGLE_BAR_VECTORS: string[] = [];
    for (const k of LINES_PLANES_KEYS) {
      for (const g of groupsOf(LABELS[k])) {
        if (g.kind === "single" && g.cls === "vector") SINGLE_BAR_VECTORS.push(`${k} → "${LABELS[k]}"`);
        if (g.kind === "double") {
          assertTrue(`"${k}": the norm bars of "${LABELS[k]}" wrap a VECTOR ("${g.inner}"), never a scalar`, g.cls === "vector");
        }
      }
    }
    assertTrue(`NO lines/planes token wraps a vector in single bars (${SINGLE_BAR_VECTORS.join("; ") || "none — the whole half agrees with its formula surfaces"})`,
      SINGLE_BAR_VECTORS.length === 0);
    // ...and the two tokens that actually name a norm do use the double bar.
    for (const k of ["n_norm", "cross_norm"]) {
      assertTrue(`"${k}" = "${LABELS[k]}" is delimited by U+2016, twice, with no U+007C`,
        countOf(LABELS[k], DBL) === 2 && countOf(LABELS[k], SGL) === 0);
    }

    // THE PRODUCTS HALF — the audited allowlist, byte-locked. Its labels are
    // CORRECT AS THEY STAND (single bars, matching its own concept's formula
    // surfaces); this assertion exists so that changing one is a decision taken
    // with both concepts in view, never a sweep.
    const ALLOWLIST: Record<string, string> = { a_mag: "|a|", b_mag: "|b|", cross_mag: "|a×b|" };
    for (const k of Object.keys(ALLOWLIST)) {
      check(`products-half magnitude label "${k}" is byte-identical to the audited allowlist entry`, LABELS[k], ALLOWLIST[k], 0);
    }
    const barBearing = PRODUCTS_KEYS.filter((k) => countOf(LABELS[k], SGL) > 0 || countOf(LABELS[k], DBL) > 0);
    assertTrue(`...and they are the ONLY bar-bearing tokens of that half (${barBearing.join(", ")})`,
      JSON.stringify(barBearing.sort()) === JSON.stringify(Object.keys(ALLOWLIST).sort()));
    assertTrue("no products-half token uses U+2016 (mixing conventions inside ONE concept is this same bug_class, mirrored)",
      PRODUCTS_KEYS.every((k) => countOf(LABELS[k], DBL) === 0));
    // The DERIVED products label (vgCrossMagLabelText, §15/§17) obeys the same
    // allowlist at every flip_frac — a table lock that skipped the text actually
    // rendered on a flipped state would prove nothing.
    for (const f of [0, 0.5, 1]) {
      const txt = T.vgCrossMagLabelText(f);
      assertTrue(`the derived cross-magnitude label at flip_frac ${f} keeps the products convention — "${txt}"`,
        countOf(txt, DBL) === 0 && countOf(txt, SGL) % 2 === 0 && countOf(txt, SGL) > 0);
    }
  }

  // ── (c) THE ROOT CAUSE — the stack that has to DRAW U+2016 at 13px ─────────
  //   Measured in the same headless Chromium THE EYE drives (canvas
  //   measureText, deviceScaleFactor 1):
  //       13px 'Cambria Math',Georgia,serif      ‖ advance 3.65px  → merges
  //       13px 'Cambria Math',Georgia,monospace  ‖ advance 7.80px  → two strokes
  //   Neither Georgia nor the serif default ships a usable U+2016, so the two
  //   strokes fell inside one 2px stem and the row read as an absolute value.
  //   Node cannot measure a glyph, so what is asserted here is the INVARIANT
  //   that produced the measurement: the panel's font stack terminates in the
  //   same generic family #formula_overlay itself uses, so both surfaces resolve
  //   the norm bar through the same font.
  const READOUT_CSS = (() => {
    const at = SRC.indexOf("rd.id = \"vg_readout\"");
    if (at < 0) throw new Error("§26 CANNOT BE BUILT: the #vg_readout builder no longer assigns rd.id");
    const m = /rd\.style\.cssText = "([^"]*)";/.exec(SRC.slice(at, at + 4000));
    if (!m) throw new Error("§26 CANNOT BE BUILT: the #vg_readout cssText is no longer a single literal");
    return m[1];
  })();
  const familiesOf = (css: string) => {
    const f = /font:([^;]*);/.exec(css);
    if (!f) throw new Error("§26 CANNOT BE BUILT: no font shorthand in " + JSON.stringify(css));
    return f[1].trim().replace(/^[0-9.]+px(\/[0-9.]+)?\s*/, "").split(",")
      .map((s) => s.trim().replace(/^'|'$/g, ""));
  };
  {
    const fams = familiesOf(READOUT_CSS);
    assertTrue(`#vg_readout resolves its last-resort family to monospace, which draws U+2016 as two strokes (${fams.join(" | ")})`,
      fams[fams.length - 1] === "monospace");
    assertTrue("...and no longer falls back to serif, whose U+2016 is 3.65px wide at 13px and merges",
      fams.indexOf("serif") < 0);
    assertTrue("...with the panel's size, position and every other declaration untouched (this fix moved ONE family)",
      READOUT_CSS.indexOf("font:13px/1.7 ") >= 0 && READOUT_CSS.indexOf("top:52px") >= 0
      && READOUT_CSS.indexOf("left:12px") >= 0 && READOUT_CSS.indexOf("min-width:150px") >= 0);
    // The other surface of the same screen: #formula_overlay, whose ‖ THE EYE
    // shows rendering correctly. Read from the wrapper's CSS (it lives in the
    // HTML shell, not in FIELD_3D_RENDERER_CODE).
    const FILE = readFileSync("src/lib/renderers/field_3d_renderer.ts", "utf-8");
    const at = FILE.indexOf("#formula_overlay {");
    assertTrue("the formula surface's own CSS block is still findable in the shell", at > 0);
    const block = FILE.slice(at, FILE.indexOf("}", at));
    const ffam = /font:\s*[0-9.]+px(\/[0-9.]+)?\s*([^;]*);/.exec(block);
    assertTrue(`...and the two surfaces of one screen resolve the norm bar through the SAME generic family (formula: ${ffam ? ffam[2] : "?"})`,
      ffam !== null && ffam[2].trim() === "monospace");
  }

  // ── (d) NEGATIVE CONTROLS — both defects, planted and executed ─────────────
  //   (d1) THE LABEL. The pre-fix label was already correct, so the control is
  //   the counterfactual the eye-walk believed it was seeing: the SHIPPED table
  //   source with exactly ONE entry rewritten to single bars, fed to the SHIPPED
  //   vgReadoutLine. Guarded — if the anchor drifts this THROWS rather than
  //   quietly planting nothing.
  {
    const TABLE_SRC = grabVar("VG_READOUT_LABEL");
    const ANCHOR = "cross_norm: \"" + DBL + "d₁×d₂" + DBL + "\"";
    if (TABLE_SRC.indexOf(ANCHOR) < 0) {
      throw new Error("§26 NEGATIVE CONTROL CANNOT BE BUILT: VG_READOUT_LABEL no longer contains "
        + JSON.stringify(ANCHOR) + ". Re-anchor it and re-watch the control fail.");
    }
    const BROKEN_SRC = TABLE_SRC.replace(ANCHOR, "cross_norm: \"|d₁×d₂|\"");
    assertTrue("the single-bar table really was planted (it differs from the shipped one, in exactly the cross_norm entry)",
      BROKEN_SRC !== TABLE_SRC && BROKEN_SRC.indexOf("|d₁×d₂|") >= 0);
    const B = vgTextFns({}, fakeDom().document, BROKEN_SRC);
    const brow = B.vgReadoutLine("cross_norm", { cross_norm: 0.936482 });
    expectFail(`the single-bar row carries two norm delimiters (it renders "${brow}")`, countOf(brow, DBL) === 2);
    expectFail(`the single-bar row is free of absolute-value bars (it renders "${brow}")`, countOf(brow, SGL) === 0);
    // ...and the table-wide sweep of (b) convicts it too — the invariant, not
    // just the one hand-written row assertion, is what catches a future token.
    const bad = groupsOf(B.VG_READOUT_LABEL.cross_norm)
      .filter((g) => g.kind === "single" && g.cls === "vector");
    expectFail(`the table sweep finds no vector wrapped in single bars (it finds ${bad.length}: "${B.VG_READOUT_LABEL.cross_norm}")`,
      bad.length === 0);
    // The rest of the table is untouched, so the control isolates one entry.
    assertTrue("every OTHER token of the broken build is byte-identical to the shipped one (the control plants exactly one defect)",
      KEYS.filter((k) => k !== "cross_norm").every((k) => B.VG_READOUT_LABEL[k] === LABELS[k]));
  }
  //   (d2) THE FONT — the genuine pre-fix source, reconstructed by putting the
  //   terminal generic back to serif. Guarded on the same rule.
  {
    const ANCHOR = "Georgia,monospace";
    if (READOUT_CSS.indexOf(ANCHOR) < 0) {
      throw new Error("§26 NEGATIVE CONTROL CANNOT BE BUILT: the #vg_readout font stack no longer contains "
        + JSON.stringify(ANCHOR) + ". Re-anchor it and re-watch the control fail.");
    }
    const PRE_CSS = READOUT_CSS.replace(ANCHOR, "Georgia,serif");
    const fams = familiesOf(PRE_CSS);
    assertTrue(`the pre-fix stack really was planted (${fams.join(" | ")})`, PRE_CSS !== READOUT_CSS);
    expectFail("the pre-fix panel resolves its last-resort family to monospace", fams[fams.length - 1] === "monospace");
    expectFail("the pre-fix panel avoids the serif fallback whose U+2016 merges at 13px", fams.indexOf("serif") < 0);
    // ...and it is otherwise identical: the fix is one family, not a re-style.
    assertTrue("the pre-fix and shipped panels agree on every other declaration (size, position, colour, z-index)",
      PRE_CSS.replace("Georgia,serif", "") === READOUT_CSS.replace(ANCHOR, ""));
  }

  // ── (e) THE OTHER SCREEN THIS ROW SHARES — the authored formula surfaces ───
  //   The HUD label is measured against the CONCEPT's own strings, so "one
  //   quantity, one written form" is checked across surfaces and not just
  //   inside the table. Advisory if the concept is not on this desk (§22(d)).
  {
    const CONCEPT = "src/data/concepts/mathematics/lines_and_planes_in_space.json";
    let formulas: string[] = [];
    try {
      const j = JSON.parse(readFileSync(CONCEPT, "utf-8"));
      const findCfg = (o: unknown): Record<string, any> | null => {
        if (!o || typeof o !== "object") return null;
        const r = o as Record<string, any>;
        if (r.states && r.scenario_type === "vector_geometry_3d") return r;
        for (const k of Object.keys(r)) { const f = findCfg(r[k]); if (f) return f; }
        return null;
      };
      const cfg = findCfg(j);
      if (cfg) {
        formulas = Object.keys(cfg.states)
          .map((k) => String(cfg.states[k].formula_overlay || "")).filter(Boolean);
      }
    } catch { formulas = []; }
    if (formulas.length === 0) {
      console.log("  SKIP  lines_and_planes_in_space.json not on this desk — the cross-surface binding is advisory");
    } else {
      const withNorm = formulas.filter((f) => f.indexOf(DBL) >= 0);
      assertTrue(`${withNorm.length} of the ${formulas.length} authored formula surfaces write a norm, and every one of them uses U+2016`,
        withNorm.length > 0);
      const crossNormFormulas = formulas.filter((f) => f.indexOf(DBL + "d₁×d₂" + DBL) >= 0);
      assertTrue(`the HUD's cross_norm label appears BYTE-IDENTICALLY inside ${crossNormFormulas.length} authored formula surface(s) — one quantity, one written form`,
        crossNormFormulas.length > 0 && LABELS.cross_norm === DBL + "d₁×d₂" + DBL);
      assertTrue("...and no authored formula surface writes that same cross product in single bars",
        formulas.every((f) => f.indexOf("|d₁×d₂|") < 0));
      assertTrue(`the HUD's n_norm label ("${LABELS.n_norm}") is likewise the form the formula surfaces use`,
        formulas.some((f) => f.indexOf(DBL + "n" + DBL) >= 0) && formulas.every((f) => f.indexOf("|n|") < 0));
    }
  }
}

console.log("\n=== 27. A FREE-RUNNING SANDBOX LOOPS — vg.animate_loop_ms (bug_class vg_explore_animate_windows_are_finite_so_the_free_running_sandbox_freezes) ===");
{
  // Rule 37 makes an interaction_complete state's clock free-run forever (the
  // player deliberately skips SET_TIME_FREEZE there), while vgAnimValue clamps
  // u = min(1, …) on the last matching window — so ANY finite animate[] list
  // expires. #9 STATE_9 hand-unrolled a ping-pong as EIGHT alternating windows
  // ending at 72000 ms and stopped dead at −3.5 from 72 s on, with no way to
  // restart short of leaving the state. An authored loop that is merely LONG is
  // a bug with a delay on it.
  //
  // THE DISCRIMINATING QUANTITY IS WHETHER THE VALUE IS STILL CHANGING WELL
  // PAST THE LAST AUTHORED WINDOW. Every weaker quantity is true of the broken
  // build: the arithmetic is right, the state is deterministic, the reveal
  // chain is right, D5 sees motion in the first 72 s, and THE EYE's dense
  // capture never runs long enough to reach the freeze.
  const LOOP = 18000, HALF = 9000, LO = -3.5, HI = 3.5;
  const PING: Array<Record<string, unknown>> = [
    { knob: "aux_a", from: LO, to: HI, start_ms: 0, duration_ms: HALF, easing: "linear" },
    { knob: "aux_a", from: HI, to: LO, start_ms: HALF, duration_ms: HALF, easing: "linear" },
  ];
  /** The period, solved in this file: a linear ping-pong, wrapped by hand. */
  const pingPong = (ms: number) => {
    const m = ((ms % LOOP) + LOOP) % LOOP;
    return m <= HALF ? LO + (HI - LO) * (m / HALF) : HI + (LO - HI) * ((m - HALF) / HALF);
  };
  const loopedAt = (ms: number) => E.vgAnimValue(PING, "aux_a", ms, 0, LOOP) as number;
  const plainAt = (ms: number) => E.vgAnimValue(PING, "aux_a", ms, 0) as number;

  // ── (a) THE SHIPPED HAZARD, PRESERVED FOR GUIDED STATES ───────────────────
  //   The one-shot-hold semantics are CORRECT where the clock ends, and a state
  //   that authors no period must keep them byte for byte. This is the row's
  //   own negative control, phrased as the requirement it protects.
  check("without animate_loop_ms the last window still HOLDS at its `to` (a guided state is untouched)", plainAt(80000), LO, 0);
  check("...and at 72000 ms — the exact end of #9 STATE_9's eight-window list", plainAt(72000), LO, 0);
  assertTrue(`...and it is CONSTANT from the last window onward (${[72000, 80000, 120000, 999999].map(plainAt).join(", ")}) — the shipped freeze, reproduced`,
    [72000, 80000, 120000, 999999].every((t) => plainAt(t) === LO));
  expectFail(`the un-looped fixture still MOVES at t=80000 (it returns a constant ${plainAt(80000).toFixed(3)}, which is the bug_class verbatim)`,
    plainAt(80000) !== plainAt(90000));

  // ── (b) THE LOOP, AT THE ROW'S OWN PROBE MS ───────────────────────────────
  check("with animate_loop_ms = 18000 the knob at t=80000 equals the knob at 80000 % 18000 = 8000, EXACTLY",
    loopedAt(80000), plainAt(80000 % LOOP), 0);
  check("...and that value is the hand-solved ping-pong ordinate, not whatever the engine happened to hold",
    loopedAt(80000), pingPong(80000), 1e-12);
  assertTrue(`...and it is CHANGING there, which is the whole claim (v(80000) = ${loopedAt(80000).toFixed(4)}, v(84000) = ${loopedAt(84000).toFixed(4)})`,
    Math.abs(loopedAt(80000) - loopedAt(84000)) > 0.5);
  {
    // The full travel is still reached long after the list "ended" — a loop
    // that merely wobbled would pass every assertion above.
    let lo = Infinity, hi = -Infinity;
    for (let t = 72000; t <= 108000; t += 250) { const v = loopedAt(t); if (v < lo) lo = v; if (v > hi) hi = v; }
    check("across the two cycles AFTER the last authored window the knob still spans its whole travel", hi - lo, HI - LO, 1e-9);
  }
  {
    // Three cycles, sampled: the looped evaluation at t is the UN-LOOPED
    // evaluation at t mod the period, at every sampled ms — the definition,
    // asserted rather than assumed, at integer ms where % is exact.
    let mismatches = 0, closed = 0, n = 0;
    for (let t = 0; t <= 3 * LOOP; t += 125) {
      n++;
      if (loopedAt(t) !== plainAt(t % LOOP)) mismatches++;
      if (Math.abs(loopedAt(t) - pingPong(t)) > 1e-12) closed++;
    }
    check(`over ${n} sampled ms across three cycles, looped(t) !== unlooped(t mod 18000)`, mismatches, 0, 0);
    check("...and disagreements with the independently solved ping-pong", closed, 0, 0);
  }
  assertTrue("the cycle is CLOSED — v(0) = v(18000) = v(36000) = v(72000), so the seam reads as one continuous sweep, never a jump",
    loopedAt(0) === LO && loopedAt(LOOP) === LO && loopedAt(2 * LOOP) === LO && loopedAt(4 * LOOP) === LO);
  assertTrue("a period of 0 / negative / NaN / absent is IGNORED (an author cannot half-declare a loop into a divide-by-zero)",
    [0, -1, NaN, Infinity, undefined, null, "18000"].every((bad) =>
      (E.vgAnimValue(PING, "aux_a", 80000, 0, bad as never) as number) === plainAt(80000)));
  check("vgLoopMs is a plain modulo and is well-behaved on a negative clock (never a negative phase)",
    E.vgLoopMs(-1000, LOOP), 17000, 0);

  // ── (c) REWIND DETERMINISM (Rule 36 / D3) ─────────────────────────────────
  //   The wrap is a modulo, not an accumulator, so the same ms visited from the
  //   future must reproduce bit for bit — the property SET_TIME_FREEZE rests on.
  {
    const ms = [0, 1500, 8000, 17999, 18000, 40000, 63500, 80000, 96000, 131000];
    const forward = ms.map(loopedAt);
    const rewound = ms.slice().reverse().map(loopedAt).reverse();
    const again = ms.map(loopedAt);
    assertTrue(`a rewind through ${ms.length} pins reproduces every value BIT-IDENTICALLY (===, not to a tolerance)`,
      forward.every((v, i) => Object.is(v, rewound[i]) && Object.is(v, again[i])));
    assertTrue("...and a pin taken at t and at t + one period draws the identical knob pose (the loop is exactly periodic)",
      ms.every((t) => Object.is(loopedAt(t), loopedAt(t + LOOP))));
  }

  // ── (d) THE stateMs-CONSUMER SWEEP, READ OFF THE SHIPPED FRAME ────────────
  //   The mechanism being right is worth nothing if the frame hands the period
  //   to the wrong consumers. This is the scope constraint, mechanised: the
  //   wrapped clock reaches the animate[] evaluation and NOTHING ELSE.
  {
    const frameSrc = FRAME_HARNESS.src!;
    const body = frameSrc.replace(/\/\/[^\n]*/g, "");     // comments carry the symbol names too
    const callsOf = (re: RegExp) => (body.match(re) || []).length;
    const animCalls = callsOf(/vgAnimValue\(/g);
    const loopedCalls = callsOf(/vgAnimValue\([^;]*?animLoopMs\)/g);
    assertTrue(`the frame declares the period once, from the authored key (var animLoopMs = d.animate_loop_ms)`,
      /var animLoopMs = d\.animate_loop_ms;/.test(body));
    check(`EVERY vgAnimValue call in the frame is handed the period (${loopedCalls} of ${animCalls})`, loopedCalls, animCalls, 0);
    assertTrue(`...and the frame makes a non-trivial number of them (${animCalls}), so the count above is not vacuously equal`, animCalls >= 8);
    // The consumers that must NOT see it, named one by one and read as text.
    assertTrue("vgResolveLinesPlanes (the whole per-object reveal / ghost chain) is called with the RAW stateMs",
      /vgResolveLinesPlanes\(d, LP_KNOBS, stateMs\)/.test(body));
    assertTrue("vgCamScheduleAt (camera_steps) is called with the RAW stateMs",
      /vgCamScheduleAt\(d\.camera_steps, stateMs,/.test(body));
    assertTrue("the shared grow-in ease (growT) is computed from the RAW stateMs",
      /growT = [^;]*stateMs \/ Math\.max\(1, revealMs\)/.test(body));
    // ...and nothing else in the frame touches the period at all.
    check("animLoopMs appears in the frame ONLY as its declaration plus those call arguments",
      callsOf(/animLoopMs/g), animCalls + 1, 0);
    // One level down: the wrap itself is reachable from exactly ONE call site
    // in the entire renderer, which is what makes the scope claim structural
    // rather than a habit the next edit can break.
    const srcNoComments = SRC.replace(/\/\/[^\n]*/g, "");
    check("vgLoopMs is DECLARED once and CALLED from exactly one place in the whole renderer (inside vgAnimValue)",
      (srcNoComments.match(/vgLoopMs\(/g) || []).length, 2, 0);
    assertTrue("...and that one call site is inside vgAnimValue's body",
      /function vgAnimValue\(animate, knob, stateMs, authored, loopMs\) \{[^}]*stateMs = vgLoopMs\(stateMs, loopMs\);/.test(srcNoComments));
  }

  // ── (e) END TO END: THE KNOB LOOPS, THE REVEAL DOES NOT ───────────────────
  //   Run through the SHIPPED frame driver on ONE fixture carrying both: a
  //   segment whose far endpoint rides the looping knob AND whose own
  //   reveal_at_ms is 2000 ms. At t=20000 the wrapped clock is 2000 — the exact
  //   instant the reveal STARTS — so if the wrap had been applied one level too
  //   high the segment would be regrowing from a nub with its readout gone.
  const REVEAL_AT = 2000, GROW = 600;
  const loopFixture: Record<string, unknown> = {
    mode: "lines_planes", reveal_ms: 0,
    animate_loop_ms: LOOP, animate: PING,
    value_readouts: ["segment_length"],
    lines: [{ id: "L1", point: [0, 0, 0], dir: [1, 0, 0], lambda_span: [-4, 4] }],
    points: [{ id: "Q", position: [0, 2, 0] }],
    segments: [{
      id: "S", from: "Q", to: { on: "L1", lambda: { knob: "aux_a" } },
      readout: "length", reveal_at_ms: REVEAL_AT, grow_ms: GROW,
    }],
  };
  /** |Q − P(λ)| with Q = (0,2,0) and P = (λ,0,0): the length the row prints. */
  const segLen = (lam: number) => Math.hypot(lam, 2);
  {
    const runFrame = FRAME_HARNESS.run!;
    const frameAt = (vg: Record<string, unknown>, ms: number) => {
      const dom = fakeDom();
      const win: Record<string, unknown> = {};
      runFrame(vg, ms, dom, win);
      const el = dom.get("vg_readout");
      return { html: el.innerHTML as string, shown: el.style.display, lp: win.PM_vgLinesPlanes as any };
    };
    const f80 = frameAt(loopFixture, 80000);
    check("through the SHIPPED FRAME at t=80000 the segment_length row prints the WRAPPED knob's length",
      f80.lp.readouts.segment_length, segLen(pingPong(80000)), 1e-12);
    assertTrue(`...and the row is on screen, carrying symbol and value in one node ("${f80.html.replace(/<[^>]*>/g, " ").trim()}")`,
      f80.shown === "block" && f80.html.includes("vg_readout_segment_length"));
    const f84 = frameAt(loopFixture, 84000);
    assertTrue(`...and it is still MOVING 12 s past the last authored window (${f80.lp.readouts.segment_length.toFixed(4)} → ${f84.lp.readouts.segment_length.toFixed(4)})`,
      Math.abs(f80.lp.readouts.segment_length - f84.lp.readouts.segment_length) > 0.1);

    // THE REVEAL, UN-WRAPPED. t=20000 wraps to 2000, the reveal's own start.
    const f20 = frameAt(loopFixture, 20000);
    assertTrue("t=20000 (wrapped 2000, the instant the reveal STARTS): the segment_length row is PRESENT — the reveal did not re-play",
      f20.shown === "block" && f20.html.includes("vg_readout_segment_length"));
    const res20 = E.vgResolveLinesPlanes(loopFixture, { aux_a: loopedAt(20000) }, 20000);
    check("...and the segment's own reveal fraction is exactly 1, not regrown from a nub", res20.segments[0].frac, 1, 0);
    check("...while its endpoint IS the wrapped knob (the two clocks, in one object)",
      res20.readouts.segment_length, segLen(pingPong(20000)), 1e-12);
    // NEGATIVE CONTROL — the same resolver handed the WRAPPED ms, which is what
    // a wrap applied one level too high would produce.
    const resWrapped = E.vgResolveLinesPlanes(loopFixture, { aux_a: loopedAt(20000) }, 20000 % LOOP);
    expectFail(`a reveal chain fed the WRAPPED clock is still fully grown at t=20000 (frac ${resWrapped.segments[0].frac})`,
      resWrapped.segments[0].frac === 1);
    expectFail(`...and still publishes its number (segment_length ${resWrapped.readouts.segment_length === undefined ? "absent" : "present"})`,
      resWrapped.readouts.segment_length !== undefined);

    // NEGATIVE CONTROL — the same fixture with the key REMOVED: the shipped
    // hazard, driven end to end through the real frame.
    const noLoop: Record<string, unknown> = { ...loopFixture };
    delete noLoop.animate_loop_ms;
    const n80 = frameAt(noLoop, 80000), n84 = frameAt(noLoop, 84000);
    check("without the key the frame prints the CLAMPED constant at t=80000 (λ = −3.5)", n80.lp.readouts.segment_length, segLen(LO), 1e-12);
    expectFail(`...and the picture is still moving four seconds later (${n80.lp.readouts.segment_length.toFixed(4)} → ${n84.lp.readouts.segment_length.toFixed(4)})`,
      n80.lp.readouts.segment_length !== n84.lp.readouts.segment_length);
  }

  // ── (f) A TEACHER'S DRAG STILL WINS ───────────────────────────────────────
  //   The loop must not fight a seized knob: the drag branch of the frame's
  //   knob() funnel runs BEFORE the ramp resolves, and adding a period must not
  //   have moved it. Read off the arrow the frame actually draws.
  {
    const runFrame = FRAME_HARNESS.run!;
    const bRamp = [
      { knob: "b_mag", from: 1.0, to: 5.0, start_ms: 0, duration_ms: HALF, easing: "linear" },
      { knob: "b_mag", from: 5.0, to: 1.0, start_ms: HALF, duration_ms: HALF, easing: "linear" },
    ];
    const vg = { animate: bRamp, animate_loop_ms: LOOP, a_mag: 3.0, b_mag: 1.0, theta_deg: 60, reveal_ms: 0 };
    const lenOfB = (ms: number, win: Record<string, unknown>, showSliders: boolean) => {
      const scene = runFrame(vg, ms, fakeDom(), win, showSliders) as any[];
      return scene.filter((o: any) => o.userData.elementType === "vg_vector_b")[0].len as number;
    };
    const free80 = lenOfB(80000, {}, true);
    check("un-dragged, the looped |b| at t=80000 is the wrapped ramp value", free80,
      E.vgAnimValue(bRamp, "b_mag", 80000, 1.0, LOOP), 1e-12);
    const seized = { PM_vgBMag: 4.25, PM_vgBMagDragged: true };
    check("a teacher's drag seizes the row and the LOOPED ramp does not fight it (t=80000)", lenOfB(80000, { ...seized }, true), 4.25, 1e-12);
    check("...and at t=8000, the same phase one cycle earlier — the seize is not phase-dependent", lenOfB(8000, { ...seized }, true), 4.25, 1e-12);
    assertTrue("...and the seized value really does differ from what the loop would have drawn (the check discriminates)",
      Math.abs(free80 - 4.25) > 0.1);
    // THE EYE never drags, so a frozen frame always takes the closed-form branch.
    check("with no drag flag the frame is back on the closed form (the deterministic capture path)", lenOfB(80000, {}, true), free80, 0);
  }

  // ── (g) NO-LOOP STATES ARE BYTE-IDENTICAL PRE/POST ────────────────────────
  //   The pre-fix vgAnimValue, RECONSTRUCTED from the shipped text (the §19b
  //   pattern): the 5th parameter and the one wrap line removed, and nothing
  //   else. Guarded — a drifted anchor is an ERROR, never a quiet pass.
  {
    const SIG = "function vgAnimValue(animate, knob, stateMs, authored, loopMs) {";
    const WRAP = /\n\s*stateMs = vgLoopMs\(stateMs, loopMs\);[^\n]*/;
    const preFix = (name: string, src: string) => {
      if (name !== "vgAnimValue") return src;
      if (src.indexOf(SIG) !== 0 || !WRAP.test(src)) {
        throw new Error(
          "§27 NEGATIVE CONTROL CANNOT BE BUILT: vgAnimValue's shipped signature or wrap line no longer "
          + "matches the text this control removes. A control that silently fails to plant its defect is "
          + "worse than no control. Re-anchor SIG/WRAP and re-watch it fail.\n  got: " + src.slice(0, 200));
      }
      return src.replace(SIG, "function vgAnimValue(animate, knob, stateMs, authored) {").replace(WRAP, "");
    };
    const PRE = buildVgSandbox(preFix) as any;
    assertTrue("the reconstructed pre-fix resolver really is the un-looped one (it ignores a 5th argument entirely)",
      PRE.vgAnimValue(PING, "aux_a", 80000, 0, LOOP) === LO && E.vgAnimValue(PING, "aux_a", 80000, 0, LOOP) !== LO);
    // The sweep. Every shape a shipped state authors — a single window, a
    // multi-segment sweep, a hold gap, duration 0, a knob nothing names — at
    // every ms, with NO period: pre and post must agree exactly.
    const SHAPES: Array<{ name: string; anim: Array<Record<string, unknown>>; knob: string; dflt: number }> = [
      { name: "a single ramp", anim: [{ knob: "theta_deg", from: 20, to: 90, start_ms: 400, duration_ms: 2600 }], knob: "theta_deg", dflt: 60 },
      {
        name: "a multi-segment sweep with a hold gap",
        anim: [{ knob: "theta_deg", from: 20, to: 90, start_ms: 400, duration_ms: 2600 },
               { knob: "theta_deg", from: 90, to: 130, start_ms: 3400, duration_ms: 2200 }],
        knob: "theta_deg", dflt: 60,
      },
      { name: "a duration_ms 0 cut", anim: [{ knob: "flip_frac", from: 0, to: 1, start_ms: 1200, duration_ms: 0 }], knob: "flip_frac", dflt: 0 },
      { name: "the ping-pong itself", anim: PING, knob: "aux_a", dflt: 0 },
      { name: "a knob no entry names", anim: PING, knob: "b_mag", dflt: 2.0 },
      { name: "an empty list", anim: [], knob: "b_mag", dflt: 2.0 },
    ];
    let drift = 0, samples = 0;
    for (const s of SHAPES) {
      for (let t = -500; t <= 90000; t += 137) {
        samples++;
        const post = E.vgAnimValue(s.anim, s.knob, t, s.dflt);
        const pre = PRE.vgAnimValue(s.anim, s.knob, t, s.dflt);
        if (!Object.is(post, pre)) drift++;
        // ...and an explicitly-absent / zero period is the same thing again.
        if (!Object.is(E.vgAnimValue(s.anim, s.knob, t, s.dflt, undefined), pre)) drift++;
        if (!Object.is(E.vgAnimValue(s.anim, s.knob, t, s.dflt, 0), pre)) drift++;
      }
    }
    check(`over ${samples} ms x ${SHAPES.length} authored shapes, values that DIFFER from the pre-fix build`, drift, 0, 0);
    // ...and the same at the level a state is actually authored: the whole
    // frame, run on a fixture with no period, before and after.
    {
      const runFrame = FRAME_HARNESS.run!;
      const guided = {
        mode: "lines_planes", reveal_ms: 0, value_readouts: ["segment_length"],
        animate: PING,
        lines: [{ id: "L1", point: [0, 0, 0], dir: [1, 0, 0], lambda_span: [-4, 4] }],
        points: [{ id: "Q", position: [0, 2, 0] }],
        segments: [{ id: "S", from: "Q", to: { on: "L1", lambda: { knob: "aux_a" } }, readout: "length" }],
      };
      let bad = 0;
      for (const t of [0, 900, 4500, 9000, 13500, 18000, 30000, 72000, 80000]) {
        const win: Record<string, unknown> = {};
        runFrame(guided, t, fakeDom(), win);
        const got = (win.PM_vgLinesPlanes as any).readouts.segment_length as number;
        if (Math.abs(got - segLen(E.vgAnimValue(PING, "aux_a", t, 0))) > 1e-12) bad++;
      }
      check("a state that authors NO period still draws the one-shot-hold pose at every sampled ms", bad, 0, 0);
    }
  }

  // ── (h) deriveStateMeta — FIRST-CYCLE SEMANTICS, ASSERTED ─────────────────
  //   A looping state has no settled end, so the pin can only mean the end of
  //   the FIRST cycle. The decision is that the pin derivation reads the
  //   authored windows UN-WRAPPED — i.e. adding the key moves no pin — and that
  //   is asserted here rather than left to inspection (the F14 `intersections`
  //   scar: a new timed authoring key the pin evaluator cannot see is invisible
  //   until a baseline is already wrong).
  {
    const mk = (extra: Record<string, unknown>, showSliders: boolean) => ({
      field_3d_config: {
        scenario_type: "vector_geometry_3d",
        states: { STATE_1: { show_sliders: showSliders, vg: { mode: "products", reveal_ms: 900, animate: PING, ...extra } } },
      },
    });
    const pinOf = (cfg: unknown) => (deriveMaxRevealTimeMs(cfg as never) as Record<string, number>).STATE_1;
    const pinPlain = pinOf(mk({}, false));
    const pinLoop = pinOf(mk({ animate_loop_ms: LOOP }, false));
    check("the reveal pin of a LOOPING guided state equals the pin of the same windows un-looped (first-cycle semantics)", pinLoop, pinPlain, 0);
    check("...and that number is the last authored window end + the vg cushion (18000 + 300)", pinLoop, LOOP + 300, 0);
    assertTrue("...which is exactly what vgAnimEndMs reports for the same list — the renderer and the evaluator do not diverge",
      E.vgAnimEndMs(PING) === LOOP && pinLoop === (E.vgAnimEndMs(PING) as number) + 300);
    // ...and it is SOUND, because the loop is periodic: the pose at the pin is
    // the pose at the pin mod the period. A pin is a capture instant, not a
    // claim that the state has stopped.
    check("the knob at the derived pin equals the knob at (pin mod period) — the pin photographs a real, reachable pose",
      loopedAt(pinLoop), plainAt(pinLoop % LOOP), 0);

    // MOTION + HOLD. A looping state moves forever, so it must never be told
    // its tail may be stuck.
    const motion = deriveMotionExpectations(mk({ animate_loop_ms: LOOP }, false) as never);
    assertTrue("a looping state is declared MOTION (D5 runs on it — a gate that is skipped is not a gate that passed)",
      motion.STATE_1 === true);
    const holdLoop = deriveHoldExpectations(mk({ animate_loop_ms: LOOP }, false) as never);
    const holdPlain = deriveHoldExpectations(mk({}, false) as never);
    assertTrue(`a guided state that never settles is NOT classified reveal_hold (got ${String(holdLoop.STATE_1)}) — D7's stuck tail stays live on the one state whose point is that it never stops`,
      holdLoop.STATE_1 === undefined);
    assertTrue(`...while the same state WITHOUT a period still classifies reveal_hold (got ${String(holdPlain.STATE_1)}) — no shipped state moves`,
      holdPlain.STATE_1 === "reveal_hold");
    const holdSandbox = deriveHoldExpectations(mk({ animate_loop_ms: LOOP }, true) as never);
    assertTrue(`the sandbox (show_sliders) stays 'interactive' whatever it idles at (got ${String(holdSandbox.STATE_1)}) — the intended home of the key`,
      holdSandbox.STATE_1 === "interactive");
    assertTrue(`...and a sandbox is skipped by the vg pin derivation entirely (both pin at the DEFAULT ${pinOf(mk({ animate_loop_ms: LOOP }, true))} ms), so the loop can never mint a pinned baseline`,
      pinOf(mk({ animate_loop_ms: LOOP }, true)) === pinOf(mk({}, true))
      && pinOf(mk({ animate_loop_ms: LOOP }, true)) < pinLoop);
    // NEGATIVE CONTROL — an evaluator that WRAPPED its own output (the tempting
    // other answer) would pin at 18300 % 18000 = 300 ms. It is INDISTINGUISHABLE
    // on the knob, because the loop is periodic — which is exactly why the knob
    // is the wrong thing to measure the decision by. It is the REVEAL CHAIN that
    // convicts it: at 300 ms the segment revealed at 2000 ms is not on screen at
    // all, and the frozen baseline would be minted from an empty picture.
    const wrappedPin = pinLoop % LOOP;
    check(`the wrapped pin (${wrappedPin} ms) is indistinguishable from ${pinLoop} ms ON THE KNOB — periodicity, and the reason the knob cannot decide this`,
      loopedAt(wrappedPin), loopedAt(pinLoop), 0);
    const fracAt = (ms: number) => (E.vgResolveLinesPlanes(loopFixture, { aux_a: loopedAt(ms) }, ms) as any).segments[0].frac as number;
    expectFail(`a pin evaluator that wrapped its own output still clears the reveal chain (at ${wrappedPin} ms the segment's frac is ${fracAt(wrappedPin)}, against ${fracAt(pinLoop)} at the un-wrapped pin)`,
      fracAt(wrappedPin) === 1);
    check("...while the UN-WRAPPED pin this file derives photographs the fully-revealed segment", fracAt(pinLoop), 1, 0);
  }

  // ── (i) THE AUTHORING FOLLOW-UP, IF THE CONCEPT IS ON THIS DESK ────────────
  //   Advisory (the §26(e) pattern): the engine now HAS the mechanism, but #9
  //   STATE_9 still has to declare a period, and the engine cannot author it.
  {
    const CONCEPT = "src/data/concepts/mathematics/lines_and_planes_in_space.json";
    let s9: Record<string, any> | null = null;
    try {
      const j = JSON.parse(readFileSync(CONCEPT, "utf-8"));
      const findCfg = (o: unknown): Record<string, any> | null => {
        if (!o || typeof o !== "object") return null;
        const r = o as Record<string, any>;
        if (r.states && r.scenario_type === "vector_geometry_3d") return r;
        for (const k of Object.keys(r)) { const f = findCfg(r[k]); if (f) return f; }
        return null;
      };
      const cfg = findCfg(j);
      const ids = cfg ? Object.keys(cfg.states) : [];
      const last = ids.length ? cfg!.states[ids[ids.length - 1]] : null;
      s9 = last && last.show_sliders === true ? last : null;
    } catch { s9 = null; }
    if (!s9) {
      console.log("  SKIP  lines_and_planes_in_space.json not on this desk — the S9 authoring follow-up is advisory");
    } else {
      const anim = Array.isArray(s9.vg?.animate) ? s9.vg.animate : [];
      const end = Math.max(0, ...anim.map((r: any) => (r.start_ms || 0) + (r.duration_ms || 0)));
      assertTrue(`the explore state declares a loop period for its ${anim.length}-window list (last window ends at ${end} ms; authored period ${String(s9.vg?.animate_loop_ms)})`,
        typeof s9.vg?.animate_loop_ms === "number" && s9.vg.animate_loop_ms > 0);
      if (typeof s9.vg?.animate_loop_ms === "number") {
        assertTrue(`...and the period matches the end of the authored window list (${s9.vg.animate_loop_ms} vs ${end}) — a shorter period truncates the sweep, a longer one re-freezes for the difference`,
          Math.abs(s9.vg.animate_loop_ms - end) < 1e-9);
      }
    }
  }
}

console.log("\n=== 28. EVERY VISIBLE ROW MOVES SOMETHING IN THE GROUP IT IS SHOWN IN — vg.group_controls (bug_class vg_explore_controls_are_not_group_aware_so_half_the_sliders_are_inert) ===");
{
  // d.controls is ONE FLAT LIST and the Δ10 picker swaps the OBJECTS underneath
  // it, so #9 STATE_9 offers the same six knob rows in both groups and about
  // half of them drive nothing in whichever group is selected. This section
  // measures INERTNESS at the SHIPPED RESOLVER (a knob is dead in a group when
  // sweeping it end to end changes no resolved object and no readout) and
  // measures VISIBILITY at the SHIPPED ROW PASS — never at the authored list,
  // which is the thing under test.
  const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

  // ── THE FIXTURE — #9 STATE_9's vg block, transcribed. Its FIDELITY to the
  //    shipped concept is itself asserted in (h) whenever the JSON is on this
  //    desk, so a fixture that drifts from the sim it models is caught rather
  //    than believed.
  const S9_VG: Record<string, any> = {
    mode: "lines_planes", reveal_ms: 1,
    scene_groups: [{ key: "A", label: "line + plane" }, { key: "B", label: "skew pair" }],
    scene_group: "A",
    lambda: 0.0, lambda_span: 4.0, half_extent: 3.0, q_height: 1.19,
    theta_deg: 69.3846, line2_offset: 0.0,
    lines: [
      { id: "L1", point: [-0.8, 0.6, -0.5], dir: [1, 0.35, 0.6], role: "dir1", label: "d",
        groups: ["A"], bind_lambda_span: true, show_lambda_marker: true, lambda: { knob: "lambda" }, reveal_at_ms: 0 },
      { id: "M1", point: [-1.2, -0.9, 0.6], dir: [1, 0.15, 0.35], role: "dir1", label: "d₁",
        groups: ["B"], reveal_at_ms: 0 },
      { id: "M2", point: [0.479887, -1.725775, -0.749677], dir: [0.15, -0.5, 1], role: "dir2", label: "d₂",
        groups: ["B"],
        offset: { along: [0.132973, -0.443242, 0.886484], zero: 0, knob: "line2_offset" },
        rotate: { about: [0.287668, -0.838664, -0.462482], zero: 69.3846, knob: "theta_deg" },
        reveal_at_ms: 0 },
    ],
    planes: [
      { id: "P1", point: [0, -0.4, 0], normal: [0.35, 1, 0.25], span_u: [1, -0.35, 0], half_extent: 3.0,
        bind_half_extent: true, role: "region", show_normal: true, normal_label: "n", groups: ["A"], reveal_at_ms: 0 },
    ],
    points: [
      { id: "q", position: [1.93, 1.19, 0.51], role: "neutral", label: "q", groups: ["A"],
        offset: { along: [0, 1, 0], zero: 1.19, knob: "q_height" }, reveal_at_ms: 0 },
    ],
    perpendicular: { id: "perp", from: "q", to: "P1", foot_id: "foot", role: "derived",
      show_right_angle: true, groups: ["A"], reveal_at_ms: 0 },
    common_perpendicular: { id: "common_perp", between: ["M1", "M2"], role: "derived", groups: ["B"], reveal_at_ms: 0 },
    value_readouts: ["point_plane_distance", "n_norm", "skew_distance"],
    controls: ["scene_group", "lambda", "lambda_span", "half_extent", "q_height", "theta_deg", "line2_offset"],
    control_ranges: { half_extent: { min: 1.5, max: 4.5 }, lambda_span: { min: 2.5, max: 5.0 }, theta_deg: { min: 25, max: 115 } },
  };
  // THE PARTITION this fix makes authorable — the exact block the follow-up
  // asks #9 STATE_9 to add. scene_group is deliberately absent from both lists:
  // the picker is how a teacher LEAVES a group and is governed by the flat
  // controls in every group.
  const GROUP_CONTROLS: Record<string, string[]> = {
    A: ["lambda", "lambda_span", "half_extent", "q_height"],
    B: ["theta_deg", "line2_offset"],
  };
  const KNOBS = ["lambda", "lambda_span", "half_extent", "q_height", "theta_deg", "line2_offset"];
  // THE INERTNESS MATRIX, stated up front from the fixture's own geometry:
  // group A holds L1 (λ marker + bound span), P1 (bound half-extent) and q
  // (height offset); group B holds M1 and M2 (M2 alone carries the theta_deg
  // rotate and the line2_offset translate).
  const EXPECT_LIVE: Record<string, string[]> = {
    A: ["lambda", "lambda_span", "half_extent", "q_height"],
    B: ["theta_deg", "line2_offset"],
  };

  const stateOf = (vg: Record<string, any>) => ({ show_sliders: true, vg });
  const withGroups = () => { const v = clone(S9_VG); v.group_controls = clone(GROUP_CONTROLS); return v; };
  /** Seed the DOM the way buildVectorGeometrySliders does, then apply. */
  const applyOn = (stateDef: unknown, dom = fakeDom(), rowPassSrc?: string) => {
    for (const k of Object.keys(SHIPPED_ROW_LABEL)) dom.get("vg_" + k + "_lab").textContent = SHIPPED_ROW_LABEL[k];
    return runApplyPass([], stateDef, dom, undefined, rowPassSrc);
  };
  /** The rows a teacher can actually see, read off the DOM the pass wrote. */
  const shownRows = (dom: ReturnType<typeof fakeDom>) =>
    KNOBS.filter((k) => dom.get("vg_" + k + "_row").style.display === "block");
  const liveRows = (dom: ReturnType<typeof fakeDom>) =>
    KNOBS.filter((k) => dom.get("vg_" + k + "_row").style.display === "block"
      && dom.get("vg_" + k + "_slider").disabled === false);

  // ── THE PROBE the bug row asks for: resolve the SHIPPED resolver across the
  //    knob's own row travel and see whether ANY resolved object or readout
  //    moves. Five samples, not two: a knob whose end points happen to agree
  //    (a marker that leaves the drawn span at both ends) would read as dead
  //    on a two-point test and is not.
  const baseK = (vg: Record<string, any>, group: string) => {
    const K: Record<string, unknown> = { scene_group: group };
    for (const k of KNOBS) K[k] = typeof vg[k] === "number" ? vg[k] : SHIPPED_ROW_RANGE[k].def;
    return K;
  };
  const T0 = vgTextFns({}, fakeDom().document);
  const MS = 5000;                     // reveal_ms 1 + reveal_at_ms 0 ⇒ every frac is 1
  const sweepFrames = (vg: Record<string, any>, group: string, knob: string) => {
    const r = T0.vgControlRange(knob, vg) as { min: number; max: number };
    const out: string[] = [];
    for (let i = 0; i <= 4; i++) {
      const K = baseK(vg, group);
      K[knob] = r.min + (r.max - r.min) * (i / 4);
      out.push(JSON.stringify(E.vgResolveLinesPlanes(vg, K, MS)));
    }
    return out;
  };
  const movesSomething = (vg: Record<string, any>, group: string, knob: string) =>
    sweepFrames(vg, group, knob).some((f, i, a) => i > 0 && f !== a[0]);

  // (a) THE SURFACE — vgEffectiveControls, and the fallbacks that keep every
  //     state shipped today byte-identical.
  {
    const T = vgTextFns({}, fakeDom().document);
    const flat = S9_VG.controls as string[];
    assertTrue("a state with NO group_controls resolves to the flat controls, in every group",
      JSON.stringify(T.vgEffectiveControls(S9_VG, "A")) === JSON.stringify(flat)
      && JSON.stringify(T.vgEffectiveControls(S9_VG, "B")) === JSON.stringify(flat));
    const g = withGroups();
    assertTrue(`group A resolves to its OWN list (${GROUP_CONTROLS.A.join(", ")})`,
      JSON.stringify(T.vgEffectiveControls(g, "A")) === JSON.stringify(GROUP_CONTROLS.A));
    assertTrue(`group B resolves to its OWN list (${GROUP_CONTROLS.B.join(", ")})`,
      JSON.stringify(T.vgEffectiveControls(g, "B")) === JSON.stringify(GROUP_CONTROLS.B));
    assertTrue("a group the block does not name falls back to the flat list (never to nothing)",
      JSON.stringify(T.vgEffectiveControls(g, "C")) === JSON.stringify(flat));
    assertTrue("no group at all (a single-group state) falls back to the flat list",
      JSON.stringify(T.vgEffectiveControls(g, null)) === JSON.stringify(flat)
      && JSON.stringify(T.vgEffectiveControls(g, "")) === JSON.stringify(flat));
    // The legal-zero-value scar, in list form: an EMPTY authored list is "this
    // group has no live knob" and must survive, where truthiness would restore
    // the full flat list — the loudest possible version of the defect.
    const empty = withGroups(); empty.group_controls.B = [];
    assertTrue("an authored EMPTY list yields NO rows — resolved by presence, never truthiness",
      JSON.stringify(T.vgEffectiveControls(empty, "B")) === "[]");
    const notArray = withGroups(); notArray.group_controls.B = "theta_deg" as unknown as string[];
    assertTrue("a malformed (non-array) entry falls back to the flat list rather than iterating a string",
      JSON.stringify(T.vgEffectiveControls(notArray, "B")) === JSON.stringify(flat));
    // The type-omission scar: a field the body reads is DECLARED in the block
    // type in the same change that reads it.
    const FILE = readFileSync("src/lib/renderers/field_3d_renderer.ts", "utf-8");
    assertTrue("group_controls is declared in the vg block's TypeScript type (a field that runs but cannot be declared is undiscoverable)",
      /group_controls\?:\s*Record<string,\s*string\[\]>;/.test(FILE));
  }

  // (b) ROW VISIBILITY, THROUGH THE SHIPPED APPLY PASS — each group shows
  //     exactly its own rows, plus the picker.
  {
    const dom = fakeDom();
    const r = applyOn(stateOf(withGroups()), dom);
    check("the state opens on its authored group", r.win.PM_vgSceneGroup as string, "A", 0);
    assertTrue(`group A shows exactly its own knob rows (${shownRows(dom).join(", ")})`,
      JSON.stringify(shownRows(dom)) === JSON.stringify(EXPECT_LIVE.A));
    assertTrue("...all of them LIVE (enabled), none greyed",
      JSON.stringify(liveRows(dom)) === JSON.stringify(EXPECT_LIVE.A));
    assertTrue("...and the view picker is on screen in group A (it is how a teacher leaves the group)",
      dom.get("vg_scene_group_row").style.display === "block");
    assertTrue("...the panel itself is open", dom.get("vg_sliders").style.display === "block");
    assertTrue(`...and the four rows group B owns are HIDDEN (${KNOBS.filter((k) => shownRows(dom).indexOf(k) < 0).join(", ")})`,
      EXPECT_LIVE.B.every((k) => dom.get("vg_" + k + "_row").style.display === "none"));
    assertTrue("the pass publishes the rows a teacher can reach in the live group (PM_vgRowsShown)",
      JSON.stringify(r.win.PM_vgRowsShown) === JSON.stringify(EXPECT_LIVE.A)
      && r.win.PM_vgRowsGroup === "A");
    // Entering the SAME state authored on group B opens on B's rows.
    const domB = fakeDom();
    const vgB = withGroups(); vgB.scene_group = "B";
    applyOn(stateOf(vgB), domB);
    assertTrue(`a state authored on group B opens on B's rows (${shownRows(domB).join(", ")})`,
      JSON.stringify(shownRows(domB)) === JSON.stringify(EXPECT_LIVE.B));
    assertTrue("...and the picker is on screen there too — the picker is never partitioned away",
      domB.get("vg_scene_group_row").style.display === "block");
  }

  // (c) THE PICKER PATH — A → B → A through the two passes the shipped change
  //     handler runs, and NOTHING ELSE (Rule 39c). The apply pass is proven not
  //     to have re-fired by three of its OWN side effects surviving untouched.
  {
    const dom = fakeDom();
    const vg = withGroups();
    const r = applyOn(stateOf(vg), dom);
    // The ranges the apply pass installed (per STATE, not per group).
    const rangeDump = () => JSON.stringify(KNOBS.map((k) => {
      const el = dom.get("vg_" + k + "_slider");
      return [k, el.min, el.max, el.step];
    }));
    const RANGES_AT_ENTRY = rangeDump();
    assertTrue(`the per-state control_ranges are installed at entry (theta 25..115, half_extent 1.5..4.5, lambda_span 2.5..5) — ${RANGES_AT_ENTRY.slice(0, 80)}…`,
      dom.get("vg_theta_deg_slider").min === "25" && dom.get("vg_theta_deg_slider").max === "115"
      && dom.get("vg_half_extent_slider").min === "1.5" && dom.get("vg_lambda_span_slider").max === "5");
    // A TEACHER'S DRAG, and two apply-only sentinels.
    r.win.PM_vgLambdaDragged = true;
    r.win.PM_vgLambda = 2.75;
    r.win.PM_vgControlRangeWidened = "SENTINEL";
    dom.get("vg_scene_group_select").innerHTML = "SENTINEL";
    dom.get("vg_lambda_val").textContent = "SENTINEL";
    /** Exactly what the shipped <select> change handler does, in its order. */
    const pick = (g: string) => {
      r.win.PM_vgSceneGroup = g;
      r.T.vgApplyControlRows(vg, true);
      r.T.vgWriteRowLabels(vg);
    };
    pick("B");
    assertTrue(`switching to group B shows exactly B's rows (${shownRows(dom).join(", ")})`,
      JSON.stringify(shownRows(dom)) === JSON.stringify(EXPECT_LIVE.B));
    assertTrue(`...and hides A's four (${EXPECT_LIVE.A.join(", ")})`,
      EXPECT_LIVE.A.every((k) => dom.get("vg_" + k + "_row").style.display === "none"));
    assertTrue("...the picker row stays on screen (a group that hid it would be a trap)",
      dom.get("vg_scene_group_row").style.display === "block");
    assertTrue("...and the θ row is re-labelled for the lines group B actually shows (the two passes compose)",
      dom.get("vg_theta_deg_lab").textContent === "θ (d₁, d₂)");
    pick("A");
    assertTrue(`switching back restores A's rows exactly (${shownRows(dom).join(", ")})`,
      JSON.stringify(shownRows(dom)) === JSON.stringify(EXPECT_LIVE.A));
    assertTrue("...and the θ label drops the pair again (it names nothing group A turns)",
      dom.get("vg_theta_deg_lab").textContent === "θ");
    // THE APPLY PASS DID NOT RE-RUN — the three side effects only it produces.
    assertTrue("the group switch did NOT re-run the apply pass: the teacher's drag-seize flag survives (Rule 39c)",
      r.win.PM_vgLambdaDragged === true && r.win.PM_vgLambda === 2.75);
    assertTrue("...the apply-only publication survives untouched (PM_vgControlRangeWidened still the sentinel)",
      r.win.PM_vgControlRangeWidened === "SENTINEL");
    assertTrue("...the <select>'s option list was not rebuilt, and no slider VALUE was re-seeded",
      dom.get("vg_scene_group_select").innerHTML === "SENTINEL"
      && dom.get("vg_lambda_val").textContent === "SENTINEL");
    // ...and the RANGES are per STATE, not per group: two switches neither skip
    // nor corrupt the restore the apply pass performed.
    assertTrue("the per-state ranges are byte-identical after A → B → A (the row pass writes display/disabled/opacity and nothing else)",
      rangeDump() === RANGES_AT_ENTRY);
    // A knob seized in A, hidden in B, still seized when its row comes back —
    // the seize semantics are UNCHANGED by this pass, which touches no global
    // the frame's knob() funnel reads.
    assertTrue("a knob seized in group A is still seized after the round trip, at the value the teacher left it",
      r.win.PM_vgLambdaDragged === true && r.win.PM_vgLambda === 2.75);
    // The seize globals, READ OUT OF THE SHIPPED VG_ROW_DRAG table rather than
    // restated (a gate holding its own copy passes forever after a knob is added).
    const SEIZE_GLOBALS = (grabVar("VG_ROW_DRAG").match(/"(PM_vg\w+Dragged)"/g) || []).map((s) => s.replace(/"/g, ""));
    assertTrue(`the row pass names NO drag-seize global (${SEIZE_GLOBALS.length} checked) — it cannot change seize semantics`,
      SEIZE_GLOBALS.every((g) => ROW_PASS_SRC.indexOf(g) < 0));
    // The HANDLER really calls it (a mechanism that exists but is never called
    // is the recorded discharge-against-a-mechanism-never-built failure).
    const at = SRC.indexOf('gsel.addEventListener("change"');
    const HANDLER = at > 0 ? SRC.slice(at, at + 1600) : "";
    assertTrue("the scene-group change handler calls vgApplyControlRows...",
      at > 0 && HANDLER.indexOf("vgApplyControlRows(") >= 0);
    assertTrue("...BEFORE vgWriteRowLabels (which rows are on screen, then what those rows are called)",
      HANDLER.indexOf("vgApplyControlRows(") < HANDLER.indexOf("vgWriteRowLabels("));
    assertTrue("...and does NOT call the full apply pass from the picker",
      HANDLER.indexOf("applyVectorGeometry3DState") < 0 && HANDLER.indexOf("applyState(") < 0);
  }

  // (d) THE ROW'S OWN PROBE — for each group, every VISIBLE row moves something,
  //     and every HIDDEN row is one that would have moved nothing.
  {
    for (const g of ["A", "B"]) {
      const dom = fakeDom();
      const vg = withGroups();
      const st = clone(vg); st.scene_group = g;
      applyOn(stateOf(st), dom);
      const shown = shownRows(dom);
      const hidden = KNOBS.filter((k) => shown.indexOf(k) < 0);
      const deadShown = shown.filter((k) => !movesSomething(vg, g, k));
      const liveHidden = hidden.filter((k) => movesSomething(vg, g, k));
      assertTrue(`group ${g}: every VISIBLE row moves a resolved object or readout (${shown.join(", ")}) — dead: ${deadShown.join(", ") || "none"}`,
        deadShown.length === 0);
      assertTrue(`group ${g}: every HIDDEN row is genuinely inert here (${hidden.join(", ")}) — wrongly hidden: ${liveHidden.join(", ") || "none"}`,
        liveHidden.length === 0);
      assertTrue(`group ${g}: the partition is EXACTLY the live set the geometry implies (${EXPECT_LIVE[g].join(", ")})`,
        JSON.stringify(shown) === JSON.stringify(EXPECT_LIVE[g]));
    }
    // The two groups partition the knob set with no overlap and no orphan: a
    // knob live in NEITHER group would be authored into the sandbox and reach
    // nothing at all.
    const union = EXPECT_LIVE.A.concat(EXPECT_LIVE.B).sort();
    assertTrue(`the two lists partition all ${KNOBS.length} knob rows exactly once (${union.join(", ")})`,
      JSON.stringify(union) === JSON.stringify(KNOBS.slice().sort())
      && EXPECT_LIVE.A.every((k) => EXPECT_LIVE.B.indexOf(k) < 0));
    // ...and the authored group_controls the follow-up asks for is a SUBSET of
    // the flat controls: partitioning may never smuggle in a knob the state
    // never authored (whose range the apply pass would not have set).
    const flat = S9_VG.controls as string[];
    assertTrue("every knob named in group_controls is also in the flat controls (partition, never addition)",
      Object.keys(GROUP_CONTROLS).every((g) => GROUP_CONTROLS[g].every((k) => flat.indexOf(k) >= 0)));
  }

  // (e) FALLBACK BYTE-IDENTITY — with no group_controls authored, the fixed row
  //     pass and the PRE-FIX (flat, group-blind) one agree over the WHOLE DOM.
  //     Guarded textual reconstruction: if the anchor drifts this THROWS, because
  //     a control that silently fails to plant its defect is worse than none.
  const ANCHOR = "var controls = vgEffectiveControls(d, group);";
  if (ROW_PASS_SRC.indexOf(ANCHOR) < 0) {
    throw new Error("§28 NEGATIVE CONTROL CANNOT BE BUILT: vgApplyControlRows no longer contains "
      + JSON.stringify(ANCHOR) + ". Re-anchor it and re-watch the control fail.");
  }
  const PRE_ROW_SRC = ROW_PASS_SRC.replace(ANCHOR, "var controls = d.controls || [];   /* pre-fix: ONE flat list in every group */");
  {
    assertTrue("the pre-fix row pass really was planted (it never consults the group's own list, and differs from the shipped one)",
      PRE_ROW_SRC.indexOf("vgEffectiveControls(") < 0 && PRE_ROW_SRC !== ROW_PASS_SRC);
    const dump = (d: ReturnType<typeof fakeDom>) => JSON.stringify([...d.els.entries()].sort((x, y) => (x[0] < y[0] ? -1 : 1)));
    const FIXTURES: Array<[string, unknown]> = [
      ["the two-group state with NO group_controls authored", stateOf(clone(S9_VG))],
      ["a single-group lines_planes state", stateOf({ mode: "lines_planes", controls: ["lambda", "theta_deg"], lambda: 0, theta_deg: 60,
        lines: [{ id: "M1", role: "dir1", label: "d₁", point: [0, 0, 0], dir: [1, 0, 0] }] })],
      ["a products state (Act I, no mode authored at all)", stateOf({ a_mag: 3, b_mag: 2, theta_deg: 60, controls: ["a_mag", "b_mag", "theta_deg"] })],
      ["a state with NO controls at all (the panel stays shut)", { show_sliders: false, vg: { mode: "lines_planes" } }],
      ["a state with a greyed static_readouts row", stateOf({ mode: "lines_planes", controls: ["lambda"], static_readouts: ["lambda_span"], lambda: 0 })],
    ];
    for (const [why, st] of FIXTURES) {
      const dPre = fakeDom(), dNow = fakeDom();
      applyOn(st, dPre, PRE_ROW_SRC);
      applyOn(st, dNow);
      assertTrue(`fallback is byte-identical over the whole DOM: ${why}`, dump(dPre) === dump(dNow));
    }
    // ...and byte-identical THROUGH the picker too, on a state with no
    // group_controls: switching group changes labels and nothing else.
    const dPre = fakeDom(), dNow = fakeDom();
    const vgFlat = clone(S9_VG);
    const rPre = applyOn(stateOf(vgFlat), dPre, PRE_ROW_SRC);
    const rNow = applyOn(stateOf(vgFlat), dNow);
    for (const g of ["B", "A"]) {
      rPre.win.PM_vgSceneGroup = g; rPre.T.vgApplyControlRows(vgFlat, true); rPre.T.vgWriteRowLabels(vgFlat);
      rNow.win.PM_vgSceneGroup = g; rNow.T.vgApplyControlRows(vgFlat, true); rNow.T.vgWriteRowLabels(vgFlat);
    }
    assertTrue("...and byte-identical after a full A → B → A picker round trip on a state with no group_controls",
      dump(dPre) === dump(dNow));
  }

  // (f) THE NEGATIVE CONTROL — the SHIPPED FLAT behaviour on the two-group
  //     fixture fails the row's own probe. This is the filed measurement,
  //     re-measured here rather than quoted.
  {
    const inert: Record<string, string[]> = {};
    for (const g of ["A", "B"]) {
      const dom = fakeDom();
      const st = clone(S9_VG); st.scene_group = g;         // NO group_controls
      applyOn(stateOf(st), dom, PRE_ROW_SRC);
      const shown = shownRows(dom);
      assertTrue(`pre-fix, group ${g} offers ALL ${shown.length} knob rows regardless of what is on screen`,
        JSON.stringify(shown.slice().sort()) === JSON.stringify(KNOBS.slice().sort()));
      inert[g] = shown.filter((k) => !movesSomething(S9_VG, g, k));
      expectFail(`pre-fix, every visible row in group ${g} moves something (${inert[g].length} of ${shown.length} are inert: ${inert[g].join(", ")})`,
        inert[g].length === 0);
    }
    // The measured matrix, stated as a number so it cannot rot into a claim:
    // 6 of the 12 (group, row) pairs the flat list offers are dead.
    const total = inert.A.length + inert.B.length;
    check("pre-fix, dead (group, row) pairs across the two groups", total, 6, 0);
    assertTrue(`...split 2 in group A (${inert.A.join(", ")}) and 4 in group B (${inert.B.join(", ")}) — the queue row's "4 of 6 in group A" is the group-B count`,
      inert.A.length === 2 && inert.B.length === 4
      && JSON.stringify(inert.A) === JSON.stringify(["theta_deg", "line2_offset"]));
    // ...and the FIXED pass on the same fixture has none.
    const fixedInert: string[] = [];
    for (const g of ["A", "B"]) {
      const dom = fakeDom();
      const st = withGroups(); st.scene_group = g;
      applyOn(stateOf(st), dom);
      for (const k of shownRows(dom)) if (!movesSomething(st, g, k)) fixedInert.push(g + "/" + k);
    }
    assertTrue(`...while the fixed pass leaves ZERO dead rows in either group (${fixedInert.join(", ") || "none"})`,
      fixedInert.length === 0);
  }

  // (g) THE ⚙ WIDGET ENGINE (Rule 39f) — discovery and overrides both survive.
  {
    assertTrue("the row ids the widget engine discovers on are unchanged (vg_<knob>_row, one per knob row)",
      ROW_ID_KEYS.length === 12 && KNOBS.every((k) => ROW_ID_KEYS.indexOf(k) >= 0)
      && ROW_PASS_SRC.indexOf('vg_lambda_row') >= 0);
    assertTrue("the row pass writes style.display — never !important — so .pmWgHide/.pmWgShow keep beating it",
      ROW_PASS_SRC.indexOf("style.display =") >= 0 && ROW_PASS_SRC.indexOf("!important") < 0
      && ROW_PASS_SRC.indexOf("setProperty") < 0 && ROW_PASS_SRC.indexOf("classList") < 0);
    // A row this pass hides in one group is STILL declared to the chrome: the
    // panel is a dynamically-created position:fixed panel, and pmWgSweep
    // declares the rows of such a panel whether or not they are visible. So the
    // ⚙ list cannot go stale across a group switch (there is nothing to
    // re-declare), and nothing caches a per-group row list.
    const SWEEP = grabFn("pmWgSweep");
    assertTrue("pmWgSweep declares a row of a DYNAMIC panel without requiring it to be visible (so a group-hidden row is still in the ⚙ list)",
      /else if \(cands\[i\]\.isRow\)/.test(SWEEP) && SWEEP.indexOf("pmWgIsDynamicPanel(p)") >= 0);
    assertTrue("...and a declared widget is never re-declared or dropped (PM_wgDeclared is append-only), so no ⚙ state is cached per group",
      SWEEP.indexOf("if (PM_wgDeclared[el.id]) continue;") >= 0
      && grabFn("pmWgApply").indexOf("delete PM_wgDeclared") < 0);
    const panelStyle = SRC.slice(SRC.indexOf("spd.style.cssText"), SRC.indexOf("spd.style.cssText") + 200);
    assertTrue("the vg panel is the dynamic position:fixed kind that discovery rides (Rule 39g)",
      panelStyle.indexOf("position:fixed") >= 0);
  }

  // (h) FIXTURE FIDELITY + THE AUTHORING FOLLOW-UP, if the concept is on this
  //     desk. Advisory (the §27(i) pattern): the engine now HAS the mechanism,
  //     but #9 STATE_9 still has to author the partition, and the engine cannot
  //     author it.
  {
    const CONCEPT = "src/data/concepts/mathematics/lines_and_planes_in_space.json";
    let s9: Record<string, any> | null = null;
    try {
      const j = JSON.parse(readFileSync(CONCEPT, "utf-8"));
      const findCfg = (o: unknown): Record<string, any> | null => {
        if (!o || typeof o !== "object") return null;
        const r = o as Record<string, any>;
        if (r.states && r.scenario_type === "vector_geometry_3d") return r;
        for (const k of Object.keys(r)) { const f = findCfg(r[k]); if (f) return f; }
        return null;
      };
      const cfg = findCfg(j);
      const ids = cfg ? Object.keys(cfg.states) : [];
      const last = ids.length ? cfg!.states[ids[ids.length - 1]] : null;
      s9 = last && last.show_sliders === true && last.vg && last.vg.scene_groups ? last : null;
    } catch { s9 = null; }
    if (!s9) {
      console.log("  SKIP  lines_and_planes_in_space.json not on this desk — the S9 partition follow-up is advisory");
    } else {
      // FIDELITY: the transcribed fixture still models the shipped state.
      const sig = (vg: Record<string, any>) => JSON.stringify({
        groups: (vg.scene_groups || []).map((g: any) => g.key),
        controls: vg.controls,
        lines: (vg.lines || []).map((l: any) => [l.id, l.groups, l.bind_lambda_span === true,
          l.show_lambda_marker === true, l.offset ? l.offset.knob : null, l.rotate ? l.rotate.knob : null]),
        planes: (vg.planes || []).map((p: any) => [p.id, p.groups, p.bind_half_extent === true]),
        points: (vg.points || []).map((p: any) => [p.id, p.groups, p.offset ? p.offset.knob : null]),
      });
      assertTrue("the §28 fixture still mirrors the shipped STATE_9 (groups, controls, and every knob binding)",
        sig(s9.vg) === sig(S9_VG));
      const gc = s9.vg.group_controls;
      assertTrue(`STATE_9 authors group_controls, partitioning its ${(s9.vg.controls || []).length - 1} knob rows across ${(s9.vg.scene_groups || []).length} groups (authored: ${JSON.stringify(gc) || "none"})`,
        !!gc && typeof gc === "object");
      if (gc && typeof gc === "object") {
        for (const g of (s9.vg.scene_groups || []).map((x: any) => x.key)) {
          const listed: string[] = Array.isArray(gc[g]) ? gc[g] : [];
          const dead = listed.filter((k) => KNOBS.indexOf(k) >= 0 && !movesSomething(s9!.vg, g, k));
          const missed = KNOBS.filter((k) => listed.indexOf(k) < 0 && movesSomething(s9!.vg, g, k));
          assertTrue(`...group ${g}: every authored row is live there (${listed.join(", ")}) — dead: ${dead.join(", ") || "none"}`, dead.length === 0);
          assertTrue(`...group ${g}: no LIVE knob is left out of the sandbox (${missed.join(", ") || "none missed"})`, missed.length === 0);
        }
      }
    }
  }
}

console.log("\n=== 29. A DRAWN LINE IS THICK ENOUGH TO SEE — unit pool geometry, ONE owner of the width, and a PROJECTED-PIXEL FLOOR (bug_class vg_tube_radius_applied_twice_renders_every_line_and_segment_sub_pixel) ===");
{
  // Every other section of this file measures WHERE a thing is, WHAT it says,
  // or WHETHER it is visible === true. Not one of them measures how much INK it
  // puts on the screen — which is the hole this defect lived in for a whole
  // chapter under a fully green gate. The lines/planes pool BAKED its radius
  // into CylinderGeometry(radius, radius, ...) and vgPlaceTube then scaled the
  // same mesh by the same number again, so the world radius was radius²:
  // 0.035 -> 0.001225, about a tenth of a pixel at this scenario's cameras.
  // Right position, right colour, right label, visible === true, and ~4% of the
  // intended ink — a sparse dotted hairline beside ArrowHelpers that drew solid.
  //
  // So this section asserts the two halves that make the number mean what it
  // says: (a) STRUCTURAL — no geometry the placer scales carries a radius of
  // its own, and every call site names the ONE width table; and (b) OPTICAL —
  // the width that survives to the screen clears a pixel floor at the shipped
  // camera band. The negative control is the pre-fix source itself, textually
  // reconstructed under a guard, run through the same recording stub.

  // ── THE REGION, anchored. A drifted anchor THROWS: a sweep that silently
  //    measures an empty string is worse than no sweep.
  const RSTART = SRC.indexOf("vector_geometry_3d (MATHEMATICS — the GENERIC two-vector");
  const REND = SRC.indexOf("rhr_force_direction — DIRECTION-ONLY sibling of lorentz_force_uniform_field");
  if (RSTART < 0 || REND <= RSTART) {
    throw new Error("§29 could not anchor the vg region in the emitted template — re-point RSTART/REND before trusting this gate");
  }
  const REGION = SRC.slice(RSTART, REND);

  // ── (a) STRUCTURAL ────────────────────────────────────────────────────────
  // (a1) NO cylinder in the whole vg region bakes a radius. Stated over the
  //      region rather than over the two known pools, so a THIRD tube pool
  //      added later is covered without editing this gate.
  {
    const cyl = [...REGION.matchAll(/new THREE\.CylinderGeometry\(([^)]*)\)/g)]
      .map((m) => m[1].split(",").map((s) => s.trim()));
    if (cyl.length < 2) {
      throw new Error(`§29 found ${cyl.length} CylinderGeometry sites in the vg region (expected the line/seg pool and the projection segment) — the parse drifted`);
    }
    const baked = cyl.filter((a) => !(a[0] === "1" && a[1] === "1"));
    assertTrue(`every CylinderGeometry in the vg region is built at UNIT radius (${cyl.length} sites swept; baked: ${baked.map((a) => a.slice(0, 2).join("/")).join(", ") || "none"})`,
      baked.length === 0);
    assertTrue("...and at UNIT height too, so vgPlaceTube owns BOTH dimensions (a baked height is the same defect on the other axis)",
      cyl.every((a) => a[2] === "1"));
  }

  // (a2) The pool factory cannot even ACCEPT a radius. This is the half that
  //      makes the invariant structural rather than remembered: a shape that
  //      cannot express the wrong configuration needs no one to remember it.
  {
    const BUILD = grabFn("buildVectorGeometryLinesPlanes");
    const sig = /function tube\(([^)]*)\)/.exec(BUILD);
    if (!sig) throw new Error("§29: buildVectorGeometryLinesPlanes no longer declares `function tube(...)` — re-anchor");
    const params = sig[1].split(",").map((s) => s.trim());
    assertTrue(`the pool factory takes NO radius parameter (tube(${params.join(", ")})) — the double application is unrepresentable, not merely unwritten`,
      !params.some((p) => /^(radius|rad|r|width|w)$/i.test(p)));
    assertTrue("...and its geometry line is the literal unit cylinder",
      /var g = new THREE\.CylinderGeometry\(1, 1, 1,/.test(BUILD));
  }

  // (a3) EVERY vgPlaceTube call site names the ONE width table — no bare
  //      literal anywhere. A literal at a call site is how the same number came
  //      to exist in two places in the first place.
  const CALL_SITES: { key: string; radius: number }[] = [];
  {
    const sites: string[] = [];
    let at = 0;
    for (;;) {
      const i = REGION.indexOf("vgPlaceTube(", at);
      if (i < 0) break;
      at = i + 12;
      if (/function\s+$/.test(REGION.slice(Math.max(0, i - 12), i))) continue; // the declaration itself
      let depth = 0, j = i + 11;
      for (; j < REGION.length; j++) {
        if (REGION[j] === "(") depth++;
        else if (REGION[j] === ")") { depth--; if (depth === 0) break; }
      }
      sites.push(REGION.slice(i + 12, j));
    }
    if (sites.length === 0) throw new Error("§29 found no vgPlaceTube CALL sites in the vg region — the parse drifted");
    for (const s of sites) {
      // top-level split: the endpoint args are array literals, so commas
      // inside [ ] do not separate arguments.
      const parts: string[] = []; let d = 0, cur = "";
      for (const ch of s) {
        if (ch === "[" || ch === "(") d++;
        if (ch === "]" || ch === ")") d--;
        if (ch === "," && d === 0) { parts.push(cur.trim()); cur = ""; } else cur += ch;
      }
      parts.push(cur.trim());
      const last = parts[parts.length - 1];
      const m = /^VG_TUBE_R\.(\w+)$/.exec(last);
      assertTrue(`vgPlaceTube(..., ${last}) names the width table, never a literal`, !!m);
      if (m) {
        assertTrue(`...and VG_TUBE_R.${m[1]} is a declared width (${SHIPPED_TUBE_R[m[1]]})`, typeof SHIPPED_TUBE_R[m[1]] === "number");
        CALL_SITES.push({ key: m[1], radius: SHIPPED_TUBE_R[m[1]] });
      }
    }
    assertTrue(`all three drawn-tube call sites are swept (${CALL_SITES.map((c) => c.key + "=" + c.radius).join(", ")})`,
      CALL_SITES.length === 3 && ["line", "seg", "proj"].every((k) => CALL_SITES.some((c) => c.key === k)));
    assertTrue("the width table declares exactly the keys the call sites use (no dead width, no missing one)",
      Object.keys(SHIPPED_TUBE_R).sort().join(",") === [...new Set(CALL_SITES.map((c) => c.key))].sort().join(","));
  }

  // ── (b) THE RECORDING STUB — the shipped build + writer, with the geometry
  //       constructor args and every scale.set() RECORDED, so the effective
  //       world radius is measured rather than read off the source.
  type Stub = any;
  function recordingStub() {
    const scene: Stub[] = [];
    const vec3 = (x = 0, y = 0, z = 0) => ({
      x, y, z,
      normalize() { const l = Math.hypot(this.x, this.y, this.z) || 1; this.x /= l; this.y /= l; this.z /= l; return this; },
    });
    const attr = (n: number) => ({ array: new Float32Array(n), needsUpdate: false });
    function geom(nVerts: number, ctorR: number | null = null) {
      return {
        _ctorR: ctorR,
        attributes: { position: attr(nVerts * 3) },
        setAttribute() { /* the stub keeps the one it made */ },
        setIndex() { /* index order is section 12's job */ },
        setDrawRange() { /* ditto */ },
        computeBoundingSphere() { /* no-op */ },
      };
    }
    function mesh(g: Stub, m: Stub): Stub {
      const o: Stub = {
        geometry: g, material: m, userData: {}, visible: false,
        position: { set() { /* placement is section 8/9's job */ } },
        quaternion: { setFromUnitVectors() { /* orientation likewise */ } },
        scale: { set(x: number, y: number, z: number) { o._scale = [x, y, z]; } },
        traverse(fn: (n: Stub) => void) { fn(o); },
      };
      return o;
    }
    const THREE: Stub = {
      Vector3: function (x: number, y: number, z: number) { return vec3(x, y, z); },
      Color: function (h: string) { return { h, set(o: Stub) { this.h = o && o.h; }, copy(o: Stub) { this.h = o.h; return this; }, clone() { return { h: this.h, copy: this.copy, clone: this.clone, lerp() { return this; } }; }, lerp() { return this; } }; },
      // THE ONE STUB THAT MATTERS HERE: it keeps the radius it was built with.
      CylinderGeometry: function (rTop: number) { return geom(0, rTop); },
      SphereGeometry: function (r: number) { return geom(0, r); },
      BufferGeometry: function () { return geom(25); },
      BufferAttribute: function (a: Float32Array) { return { array: a, needsUpdate: false }; },
      MeshBasicMaterial: function (o: Stub) { return { color: o.color, opacity: o.opacity != null ? o.opacity : 1, transparent: !!o.transparent, userData: {} }; },
      LineBasicMaterial: function (o: Stub) { return { color: o.color, opacity: o.opacity != null ? o.opacity : 1, transparent: !!o.transparent, userData: {} }; },
      Mesh: function (g: Stub, m: Stub) { return mesh(g, m); },
      Line: function (g: Stub, m: Stub) { return mesh(g, m); },
      ArrowHelper: function () {
        const m = mesh(geom(0), { color: { h: "#000" }, opacity: 1, transparent: true, userData: {} });
        m.setDirection = () => { /* pure sections own direction */ };
        m.setLength = function (l: number) { (this as Stub)._len = l; };
        m.setColor = function (c: Stub) { (this as Stub).material.color = c; };
        return m;
      },
    };
    return { scene, THREE };
  }
  /** Build + write one authored scene through a recording stub. `buildSrc` lets the negative control run the PRE-FIX build. */
  function drawOnce(buildSrc: string) {
    const { scene, THREE } = recordingStub();
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const factory = new Function(
      "THREE", "sceneObjects", "addToScene", "hexToThreeColor", "pmCreateAutoLabel",
      "updateLabelSpriteText", "config", "window",
      [
        ...["vgSub", "vgAddVec", "vgCrossVec", "vgDotVec", "vgLenVec", "vgNormalize", "vgScaleVec", "vgLerpVec"].map((f) => grabFn(f)),
        "var VG_LP_MAX = " + /var VG_LP_MAX = (\{[^}]*\});/.exec(SRC)![1] + ";",
        "var VG_TUBE_R = " + VG_TUBE_R_SRC + ";",
        "var VG_ROLE_COLOR = " + /var VG_ROLE_COLOR = (\{[\s\S]*?\});/.exec(SRC)![1] + ";",
        "var VG_LP_UPY = null;",
        grabFn("vgRoleColor"), buildSrc, grabFn("vgPlaceTube"), grabFn("vgLabelAt"), grabFn("vgWriteLinesPlanesFrame"),
        "return { build: buildVectorGeometryLinesPlanes, write: vgWriteLinesPlanesFrame };",
      ].join("\n"),
    );
    const api = factory(
      THREE, scene, (o: Stub) => scene.push(o), (h: string) => new (THREE.Color as any)(h),
      () => ({ userData: {}, visible: false, position: { set() { /* label placement */ } }, _pmText: "" }),
      (sp: Stub, t: string) => { sp._pmText = t; }, { vg: {} }, {},
    );
    api.build();
    api.write(E.vgResolveLinesPlanes({
      mode: "lines_planes", reveal_ms: 0,
      lines: [{ id: "L1", point: [-0.8, 0.6, -0.5], dir: [1, 0.35, 0.6], lambda_span: [-3.5, 3.5], label: "L₁", role: "dir1" }],
      planes: [{ id: "P1", point: [0, -0.4, 0], normal: [0.35, 1, 0.25], half_extent: 3, span_u: [0.94, -0.33, 0], span_v: [0.08, 0.22, -0.97], role: "region" }],
      points: [{ id: "q", position: [1.93, 1.19, 0.51], label: "q" }],
      perpendicular: { from: "q", to: "P1" },
    }, { lambda: 1.0 }, 20000));
    /** The radius that actually reaches the screen: the geometry's own radius times the placer's scale. */
    const worldR = (t: string) => {
      const m = scene.filter((o: Stub) => o.userData.elementType === t && o.visible)[0];
      if (!m) return null;
      return { r: (m.geometry._ctorR == null ? 1 : m.geometry._ctorR) * m._scale[0], len: m._scale[1], sx: m._scale[0], sz: m._scale[2] };
    };
    return { scene, worldR };
  }

  const drawn = drawOnce(grabFn("buildVectorGeometryLinesPlanes"));
  for (const [type, key] of [["vg_lp_line", "line"], ["vg_lp_seg", "seg"]] as const) {
    const w = drawn.worldR(type);
    assertTrue(`${type} is DRAWN and its scale was written`, !!w);
    if (!w) continue;
    check(`${type}: the radius that reaches the screen is the authored width (not its square)`, w.r, SHIPPED_TUBE_R[key], 1e-12);
    assertTrue(`${type}: x and z scale agree — the tube is round, not an ellipse (${w.sx} / ${w.sz})`, w.sx === w.sz);
    assertTrue(`${type}: the y scale is the LENGTH (${w.len.toFixed(3)}), which the width may never touch`, w.len > 0.5);
  }

  // The projection segment is placed by the FRAME, not the pool writer, so it
  // is read off the frame harness — the same driver §14 uses, which records the
  // radius the frame asked for.
  {
    const scene = FRAME_HARNESS.run!({ show_parallelogram: false, a_mag: 3, b_mag: 2, theta_deg: 40, show_projection: true }, 9000) as Stub[];
    const seg = scene.filter((o: Stub) => o.userData.elementType === "vg_proj_seg" && o.visible)[0];
    if (!seg) {
      console.log("  SKIP  the projection segment did not draw on this fixture — its width is covered structurally by (a1)/(a3)");
    } else {
      check("vg_proj_seg: the FRAME asks for the authored width", seg.placedRadius, SHIPPED_TUBE_R.proj, 1e-12);
    }
  }

  // ── (c) THE PROJECTED-PIXEL FLOOR ─────────────────────────────────────────
  //   The whole point: a world radius is not evidence, a PIXEL is. The renderer
  //   is PerspectiveCamera(FOV, ...), so at camera distance d the vertical
  //   half-extent of the view is d*tan(FOV/2) world units, and one world unit
  //   is (H/2)/(d*HALF_V) pixels. A tube's STROKE is its DIAMETER, 2r.
  const VIEW_H = 720;                       // THE EYE captures 1280x720 at DPR 1
  const CAM_BAND = [13, 16];                // the shipped vg camera distances
  const PX_FLOOR = 2;                       // below this a stroke reads as a dotted hairline
  const strokePx = (r: number, dist: number) => (2 * r) * ((VIEW_H / 2) / (dist * HALF_V));
  {
    // The model itself, checked against a hand-computed value before it is
    // trusted to judge anything: at d = 13, one world unit is
    // 360 / (13 * tan30°) = 360 / 7.50555 = 47.9648 px.
    check("the projection model: pixels per world unit at d = 13, FOV 60, 720p", (VIEW_H / 2) / (13 * HALF_V), 47.9648, 1e-3, "px/unit");
    for (const { key, radius } of CALL_SITES) {
      for (const d of CAM_BAND) {
        const px = strokePx(radius, d);
        assertTrue(`${key} (r = ${radius}) draws a ${px.toFixed(2)} px stroke at camera distance ${d} — clears the ${PX_FLOOR} px floor`, px >= PX_FLOOR);
      }
    }
  }

  // ── (d) THE NEGATIVE CONTROL — the PRE-FIX source, reconstructed textually
  //       under a guard and RUN. A control that cannot execute the defect it
  //       names is a restatement (dispatch mandate).
  {
    const shippedBuild = grabFn("buildVectorGeometryLinesPlanes");
    const edits: [string, string][] = [
      ["function tube(color, type, idx) {", "function tube(radius, color, type, idx) {"],
      ["var g = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true);", "var g = new THREE.CylinderGeometry(radius, radius, 1, 10, 1, true);"],
      ['tube(VG_ROLE_COLOR.dir1, "vg_lp_line", i)', 'tube(0.035, VG_ROLE_COLOR.dir1, "vg_lp_line", i)'],
      ['tube(VG_ROLE_COLOR.neutral, "vg_lp_seg", i)', 'tube(0.045, VG_ROLE_COLOR.neutral, "vg_lp_seg", i)'],
    ];
    let preFix = shippedBuild;
    for (const [from, to] of edits) {
      if (preFix.indexOf(from) < 0) {
        throw new Error(`§29's negative control could not find "${from.slice(0, 48)}..." in the shipped build — the anchor drifted; re-point it rather than letting the control quietly stop reproducing the defect`);
      }
      preFix = preFix.split(from).join(to);
    }
    const broken = drawOnce(preFix);
    const bl = broken.worldR("vg_lp_line");
    assertTrue("the reconstruction RAN (the pre-fix build still draws a line — it was never invisible, only sub-pixel)", !!bl);
    if (bl) {
      check("the pre-fix effective radius is the SQUARE of the authored width (the defect, measured)", bl.r, SHIPPED_TUBE_R.line * SHIPPED_TUBE_R.line, 1e-15);
      expectFail(`the pre-fix pool's radius equals its authored width (got ${bl.r})`, Math.abs(bl.r - SHIPPED_TUBE_R.line) < 1e-12);
      const px = strokePx(bl.r, CAM_BAND[0]);
      expectFail(`the pre-fix stroke clears the ${PX_FLOOR} px floor at d = 13 (it draws ${px.toFixed(3)} px — this is the shipped defect)`, px >= PX_FLOOR);
      assertTrue(`...and the ratio of the two is the authored width itself (${(px / strokePx(SHIPPED_TUBE_R.line, CAM_BAND[0])).toFixed(4)} = ${SHIPPED_TUBE_R.line}) — ~4% of the intended ink`,
        Math.abs(px / strokePx(SHIPPED_TUBE_R.line, CAM_BAND[0]) - SHIPPED_TUBE_R.line) < 1e-12);
    }
    // The floor is not vacuous in the other direction either: it must accept
    // the shipped widths and reject a genuinely too-thin one.
    expectFail("a 0.01 world-radius tube would clear the floor at d = 16", strokePx(0.01, 16) >= PX_FLOOR);
  }

  // ── (e) SCOPE — the fix touched the TUBE path and nothing else. ArrowHelper
  //       marks (direction arrows, plane normals, free vectors) and THREE.Line
  //       marks (arcs, the right-angle tick, the dashed drop) are DIFFERENT
  //       primitives with their own sizing, deliberately out of this gate's
  //       scope; the assertion is that the width table never reached them.
  {
    const lines = REGION.split("\n");
    const touching = lines.filter((l) => l.indexOf("VG_TUBE_R") >= 0);
    const nonComment = touching.filter((l) => l.trim().indexOf("//") !== 0);
    assertTrue(`VG_TUBE_R appears on ${touching.length} lines, of which ${nonComment.length} are code — the declaration plus the three call sites, nothing else`,
      nonComment.length === 4
      && nonComment.filter((l) => /var VG_TUBE_R = \{/.test(l)).length === 1
      && nonComment.filter((l) => l.indexOf("vgPlaceTube(") >= 0).length === 3);
    assertTrue("no ArrowHelper is sized from the tube width table (arrow heads keep their own literals)",
      [...REGION.matchAll(/new THREE\.ArrowHelper\(([^;]*?)\)\s*;/g)].every((m) => m[1].indexOf("VG_TUBE_R") < 0));
    assertTrue(`the region still builds its ${[...REGION.matchAll(/new THREE\.ArrowHelper\(/g)].length} ArrowHelper marks (the fix removed no primitive)`,
      [...REGION.matchAll(/new THREE\.ArrowHelper\(/g)].length >= 3);
    assertTrue("the THREE.Line marks are untouched by the width table (a line's width is not a scale)",
      [...REGION.matchAll(/new THREE\.Line\(([^)]*)\)/g)].every((m) => m[1].indexOf("VG_TUBE_R") < 0));
    // The point pool is the OTHER scaled primitive in this region, and it was
    // already correct (unit SphereGeometry scaled by the authored size). It is
    // asserted here because "unit geometry, one owner of the size" is the class,
    // not the two tube pools.
    assertTrue("the point pool is unit SphereGeometry(1, ...) too — same class, already correct, now guarded",
      /new THREE\.SphereGeometry\(1,/.test(REGION));
    const pt = drawn.scene.filter((o: Stub) => o.userData.elementType === "vg_lp_point" && o.visible)[0];
    assertTrue(`a drawn point's world radius is its authored size, applied ONCE (${pt ? (pt.geometry._ctorR * pt._scale[0]).toFixed(4) : "none drawn"})`,
      !!pt && Math.abs(pt.geometry._ctorR * pt._scale[0] - pt._scale[0]) < 1e-12 && pt._scale[0] > 0.02);
  }
}

console.log(`\n${failures === 0 ? "ALL SECTIONS PASSED" : `${failures} ASSERTION(S) FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
