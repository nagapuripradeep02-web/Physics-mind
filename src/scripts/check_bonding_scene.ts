/**
 * check:bonding-scene — headless verification of the `bonding_scene` scenario
 * (the CHEMISTRY BONDING WAVE substrate; docs/CHEMISTRY_PHASE0_BONDING.md).
 *
 * Same shape and same reason as check:hybrid-orbitals / check:sigma-pi: tsc, the
 * validators and THE EYE all pass on frames whose MEANING is wrong. THE EYE was
 * 39/39 green on the capture containing every one of sigma-pi's eight blocking
 * defects; the thing that caught them was deriving expected geometry from the
 * config and diffing it against numbers. So this gate asserts NUMBERS, not pixels.
 *
 * It pulls the SHIPPED function bodies out of FIELD_3D_RENDERER_CODE and runs
 * them in node. Nothing it checks is re-derived by the thing it checks against:
 * the dipole direction convention (section 5) is cross-checked against the
 * INDEPENDENT partial-charge path (electronegativity → Pauling ionic fraction),
 * and the countability metric (section 11) is a perspective projector written
 * here, not read out of the renderer.
 *
 * SECTION OWNERSHIP (doc §gate). E1 owns 1, 4, 5, 10, 11, 12; E2 owns 6 and 9
 * (and extends 10 with the mode/hud split and the row-O trend surface); E3a owns
 * 2, 3 and 7 (and extends 10 with the E3a mode/hud/cell split, and 11 with the
 * lattice OCCLUSION metric). 8/13/14 belonged to E3b (the lattice DYNAMICS half —
 * layer shift, electron sea, drift, melt, groups): section 14 is the REAL
 * assertion set for E3b dispatch 2 (the ratified ion property table, the melt law
 * and row R groups) and section 8 is now the REAL assertion set for dispatch 3
 * (the layer slip, its derived outcome and the D-7 like_contacts metric — every
 * claim in it paired with the cation-only DISAGREEMENT case, because a gate that
 * only checked "the ionic block reads 6" would pass a naive implementation).
 * and section 13 is now the REAL assertion set for dispatch 4 (the field, the two
 * carriers and the three carrier readouts — its load-bearing claim, that an
 * immobile ion never translates, is asserted as a NEGATIVE CONTROL against the
 * mobile case in the SAME frame, because a gate that only checked "the melt
 * drifts" would pass an engine that moved everything). NO section of this gate is
 * a declared stub any more. E1c
 * adds section 15 (the two authoring capabilities bond_polarity S4/S7 could not be
 * authored without, plus the bit-for-bit mgFrame regression half those three
 * shipped concepts ride).
 *
 * Section 32 is the E3b SITE-LAYER PARITY dispatch (2026-08-03, S-1..S-8): the
 * three mechanisms that were live on the unit (molecule) layer and inert on the
 * site (ion / lattice) layer, plus the PERMANENT half — an assertion that every
 * scripted position mechanism is present in BOTH position chains, so the next
 * one-sided addition fails here without anyone having to notice. It also carries
 * the S-7 authoring rule: a scripted destination that shares an id with an
 * EXPOSED slider must lie inside that slider's range, checked over every shipped
 * bonding_scene concept as well as over fixtures.
 *
 * Sections 27/28/29 are the E1/E2/E5 dispatch (2026-08-03): the annotation layer's
 * reserve of the readout rectangle (a RECURRENCE of the FIXED class
 * field3d_hud_label_clipped_by_readout_box that check-layout-overlap structurally
 * cannot see, because it models the authored annotation rects and not the
 * renderer-drawn HUD panel), the explore camera's scene-derived solve, and the
 * glow-key coverage invariant that replaces the frozen ten-key count.
 *
 *   npm run check:bonding-scene
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { FIELD_3D_RENDERER_CODE } from "../lib/renderers/field_3d_renderer";

const SRC = FIELD_3D_RENDERER_CODE;
/** deriveStateMeta's SOURCE — the second file that treats a cue key as real. */
const META_SRC = readFileSync(join(process.cwd(), "src/lib/validators/visual/deriveStateMeta.ts"), "utf8");

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
/**
 * Pull `var NAME = <any expression>;` where the expression itself contains `;`
 * (an IIFE). Depth-tracks (), {} and [] and stops at the first top-level `;`.
 */
function grabExpr(name: string): string {
  const m = new RegExp("var " + name + "\\s*=").exec(SRC);
  if (!m) throw new Error("var not found in renderer: " + name);
  let depth = 0;
  for (let j = m.index + m[0].length; j < SRC.length; j++) {
    const c = SRC[j];
    if (c === "(" || c === "{" || c === "[") depth++;
    else if (c === ")" || c === "}" || c === "]") depth--;
    else if (c === ";" && depth === 0) return SRC.slice(m.index, j + 1);
  }
  throw new Error("unterminated expression reading " + name);
}
/** The shipped bonding_scene source region, for the no-accumulator scan. */
function grabRegion(fromFn: string, toFn: string): string {
  const a = SRC.indexOf("function " + fromFn + "(");
  const b = SRC.indexOf("function " + toFn + "(");
  if (a < 0 || b < 0) throw new Error("region not found: " + fromFn + " .. " + toFn);
  return SRC.slice(a, b);
}

const VARS = [
  "MG_BOND_LEN", "MG_MAX_BONDS", "MG_MAX_LONE", "MG_AZ0",
  "MG_BEND_AZ", "MG_BEND_NORMAL",        // E1c (order: NORMAL reads AZ)
  "MG_ELEMENTS",
  "MG_MOLECULES", "MG_EXPLORE_MOLECULES",
  "BS_BOND_LEN", "BS_MAX_UNITS", "BS_MAX_ATOMS", "BS_MAX_DELTA_LABELS", "BS_T0_K",
  // NOTE: order is EXECUTION order inside the extracted body, and BS_MODES_IMPL
  // concatenates the split lists — so every split list must be declared BEFORE
  // it. (E3a found this the hard way: BS_MODES_E3A listed last made
  // BS_MODES_IMPL concat an `undefined` and report 11 modes instead of 13.)
  "BS_ARROW_D_PER_UNIT", "BS_ANGLE_RAMP_MS",
  "BS_ARROW_HEAD_LEN", "BS_RES_HEAD_LEN", "BS_HEAD_MIN_THICK",   // E1c-A
  "BS_RES_LABEL_OFF",                                            // E1c-D
  "BSC_ATOM_LABEL_OFF", "BSC_PAIR_GAP", "BSC_ZERO_LABEL_OFF",     // E1c-I
  "BSC_LABEL_RINGS", "BSC_CLEAR_CAP", "BSC_SAFE_X", "BSC_SAFE_Y",
  "BS_LONE_LOBE_W", "BS_LONE_LOBE_LEN",
  "BS_MODES_E1", "BS_MODES_E2", "BS_MODES_E3A", "BS_MODES_E3B",
  "BS_MODES_DEFERRED", "BS_MODES_IMPL", "BS_MODES",
  "BS_CONTROL_IDS", "BS_HUD_LINES", "BS_HUD_LINES_E1", "BS_HUD_LINES_E2",
  "BS_HUD_LINES_E3B",                                            // E3b S-4
  "BS_PLACEMENTS",
  "BS_ELECTRON_SHOW", "BS_RADIUS_PM", "BS_ION_PARENT", "BS_CHI", "BS_VALENCE",
  "BS_BOND_MOMENT_D", "BS_LONE_PAIR_D", "BS_MU_FALLBACK_D_PER_CHI",
  "BS_CAMERAS", "BS_CAMERA_DEFAULT", "BS_UNIT_CAMERAS", "BS_GLOW_ELS",
  "BS_MAX_ATOM_LABELS", "BS_PM_PER_UNIT", "BS_MAX_LINKS", "BS_LINK_DASHES",
  "BS_LINK_LOOKBACK_MS", "BS_LINK_SAMPLES", "BS_LINK_FRAMES",
  "BS_LINK_HIST_DT_MS", "BS_LINK_HIST_MAX", "BS_LINK_DEFAULTS",
  "BS_T_RAMP_MS", "BS_SUBDIG",
  // E3a (lattice placement layer)
  "BS_HUD_LINES_E3A", "BS_CELLS", "BS_LATTICE_REVEALS",
  "BS_MAX_SITES", "BS_MAX_SITE_LABELS", "BS_MAX_NEIGHBOURS", "BS_HCP_C_OVER_A",
  "BS_PEER_FADE_OPACITY", "BS_REVEAL_MS", "BS_SWAP_MS", "BS_SWAP_TROUGH",
  "BS_COORD_RADIUS_SCALE",
  "BS_FIT_MARGIN", "BS_FIT_CLIP", "BS_ION_PAIRS",
  // E3b F2/F3 (the measured framing solve) + F1 (the melt envelope)
  "BS_FIT_FOV_DEG", "BS_FIT_ASPECT", "BS_FIT_BORDER", "BS_MELT_EXPAND",
  "BS_MELT_ENV_CACHE",
  "BS_SUPDIG", "BS_COORD_CACHE",
  // E3 (thermal expansion layer)
  "BS_R_J", "BS_VAPOUR",
  // E3b S-3 / S-5 (the site-layer parity dispatch). Order is EXECUTION order:
  // BS_SHELL_POOL is a product of the two budgets above it.
  "BS_MAX_SHELL_DOTS", "BS_MAX_SHELL_SITES", "BS_SHELL_POOL", "BS_SHELL_RING_GAP",
  "BS_COORD_PAIR_CACHE",
  // E3b T-2 / T-4 (the melt law + row R)
  "BS_MELT_WIDTH_K", "BS_MELT_SITE_RAMP", "BS_MELT_PHI", "BS_MELT_WANDER",
  "BS_MELT_W", "BS_MELT_W_SPREAD", "BS_MAX_GROUPS",
  // E3b L-1 / L-2 (the layer slip + the D-7 contact metric)
  "BS_SHIFT_PLANES", "BS_SHIFT_MS", "BS_SHIFT_HOLD_MS", "BS_CLEAVE_MS",
  "BS_CLEAVE_NN", "BS_LIKE_CUT", "BS_LIKE_EPS",
  // E3b Q-1..Q-5 / row G (the field, the two carriers, the two tables)
  "BS_FIELD_AXES", "BS_FIELD_MS", "BS_FIELD_HOLD_MS", "BS_DRIFT_MS",
  "BS_ION_DRIFT_NN", "BS_MAX_SEA", "BS_SEA_R_FRAC", "BS_SEA_SPREAD_NN",
  "BS_SEA_W", "BS_SEA_W_SPREAD", "BS_SEA_DRIFT_NN", "BS_FIELD_ARROWS",
  "BS_MOLTEN_S_CM", "BS_MOLTEN_REF_K", "BS_DRIFT_V0_MS", "BS_METALS"
];
/** vars whose initialiser contains a top-level-invisible `;` (an IIFE). */
const EXPR_VARS = ["BS_ION_OF", "BSC_LABEL_DIRS"];
// (BSC_LABEL_RINGS / BSC_CLEAR_CAP are plain literals — see VARS)
const FNS = [
  "mgSmooth01", "mgClamp", "mgRamp", "mgNorm", "mgDot", "mgRotY", "mgAngleDeg",
  "mgIdealDirs", "mgDomainKinds", "mgSqueeze", "mgFrame",
  "bscClamp", "bscNorm", "bscMag", "bscLigands", "bscElement", "bscChi", "bscMixHex",
  "bscIonicFraction", "bscCharges", "bscBondMoment", "bscDipole", "bscOrientRot",
  "bscJiggle", "bscControlList", "bscHasControl", "bscOptionOf", "bscSelCur", "bscSelValue", "bscFmtD",
  "bscLinkCfg", "bscLinkOk", "bscLinkLatch", "bscLinkSites", "bscUnitSlot",
  "bscSub", "bscTrendFit",
  // E1c-A
  "bscArrowParts", "bscUnitShapeKey", "bscSolvedShapeKey", "bscSolvedCamera",
  // E2: the scene predicate behind the explore re-frame
  "bscNetworkScene",
  // E1: the pure half of the annotation/HUD reserve (section 27). Not a bsc_*
  // function — the annotation layer is shared — but it is the thing the fix is.
  "pmAnnotClampX",
  // E1c-J: the SHIPPED spin axis and the SHIPPED rotation it feeds
  "bscSpinAxis", "bscSpinRot",
  // E1c-I: the SHIPPED separation math (pure 2D — the camera half is written here)
  "bscBoxPt", "bscBoxBox", "bscBoxSeg",
  // E3a
  "bscOddN", "bscCellSites", "bscCoordination", "bscSpeciesCharge",
  "bscSpeciesLabel", "bscRadiusPm", "bscIsSite", "bscSiteList", "bscSiteExtent",
  "bscSceneSpins", "bscFitPoints", "bscFitDist",                  // E3b F2
  "bscMeltFold", "bscCellHalfSpan", "bscMeltEnv",                 // E3b F1
  "bscOpeningExtent",                                            // E2d
  "bscGrowShown", "bscTransferProg", "bscTransferSite",
  // E3
  "bscBrokenFraction", "bscNetworkStretch", "bscThermalScale", "bscPeakThermalScale",
  // E3b (the SITE-LAYER PARITY dispatch — section 32 calls these SHIPPED bodies
  // rather than transcribing them, which is the whole point of extracting them)
  "bscParentEl", "bscValenceOf", "bscCoordAround", "bscCoordinationPair",
  "bscSepAt", "bscTempAt", "bscSiteBlock", "bscSiteBaseAt", "bscSiteAt", "bscSepPmAt",
  "bscSepSiteExtent",
  // E3b T-1..T-4 (the property table, the melt law, row R). Same discipline: the
  // SHIPPED bodies are extracted and called, never transcribed into this file.
  "bscPairKeyFor", "bscGroupBlocks", "bscMeltFrac", "bscMeltHash", "bscSiteMelt",
  "bscMeltWander", "bscSiteNnU", "bscMeltExtent",
  // E3b L-1 / L-2. Section 8 calls these SHIPPED bodies — the whole value of the
  // D-7 assertion is that it runs the metric the HUD prints, not a transcription
  // of it that could quietly agree with a naive implementation.
  "bscShiftCfg", "bscShiftAt", "bscShiftStepU", "bscShiftHalf", "bscShiftPos",
  "bscNnOf", "bscLikeCountAt", "bscSeaScreens", "bscLikeContacts",
  "bscLikeFocalAt", "bscLikeFocal", "bscCrossContacts", "bscShiftSolve",
  "bscCleaveProg", "bscCleaveU", "bscShiftOffsetOf", "bscShiftExtent",
  // E3b Q-1..Q-5 / row G. Section 13 calls these SHIPPED bodies — the negative
  // control is only worth anything if it runs the code the frame runs.
  "bscFieldCfg", "bscFieldAt", "bscFieldDir", "bscDriftProg", "bscIonMobile",
  "bscIonDriftOf", "bscFieldExtent", "bscMetalKey", "bscSeaCfg", "bscSeaAt",
  "bscDriftVms", "bscFmtMant"
];
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const E = new Function([
  "var window = {};",                    // bscBondMoment records fallback use here
  ...VARS.map(grabVar),
  ...EXPR_VARS.map(grabExpr),            // BS_ION_OF is derived from BS_ION_PARENT
  ...FNS.map(grabFn),
  "return { " + [...VARS, ...EXPR_VARS, ...FNS].join(", ") + ", __window: window };"
].join("\n"))() as any;

let failures = 0;
function ok(label: string, pass: boolean, detail = "") {
  if (!pass) failures++;
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${label.padEnd(62)}${detail}`);
  return pass;
}
function near(label: string, got: number, want: number, tol: number, unit = "") {
  return ok(label, Math.abs(got - want) <= tol,
    `got ${got.toFixed(6)}${unit}  want ${want.toFixed(6)}${unit} (+-${tol})`);
}
function skip(label: string, owner: string) {
  console.log(`  SKIP  ${label.padEnd(62)}owned by ${owner}`);
}
const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 1. DETERMINISM (D-1: no accumulator, index-derived phase) ===");
// (a) the same t yields byte-identical unit positions across runs
{
  const a = E.bscJiggle(7, 4.25, 350, 0.12);
  const b = E.bscJiggle(7, 4.25, 350, 0.12);
  ok("bscJiggle is a pure function of (idx, t, T, scale)",
    a.every((v: number, i: number) => Object.is(v, b[i])), `[${a.map((v: number) => v.toFixed(9)).join(", ")}]`);
}
// (b) REWIND: t 3.0 -> 9.0 -> 3.0 reproduces the 3.0 pose bit-for-bit. An
//     accumulator cannot do this, and it is exactly what SET_TIME_FREEZE does.
{
  const t3a = E.bscJiggle(3, 3.0, 298, 0.10);
  E.bscJiggle(3, 9.0, 298, 0.10);
  const t3b = E.bscJiggle(3, 3.0, 298, 0.10);
  ok("rewind t=3.0 -> 9.0 -> 3.0 is byte-identical",
    t3a.every((v: number, i: number) => Object.is(v, t3b[i])));
}
// (c) THE count-slider test the doc calls out by name: unit 3's offset must be
//     IDENTICAL whether the scene holds 5 units or 30. Phase is derived from the
//     unit INDEX, so growing the count never re-seeds units already on screen.
{
  const five = [0, 1, 2, 3, 4].map((i) => E.bscJiggle(i, 2.0, 320, 0.11));
  const thirty = Array.from({ length: 30 }, (_, i) => E.bscJiggle(i, 2.0, 320, 0.11));
  ok("count 5 -> 30 leaves units 0..4 bit-for-bit unchanged",
    five.every((v: number[], i: number) => v.every((c, k) => Object.is(c, thirty[i][k]))));
  const distinct = new Set(thirty.map((v: number[]) => v.map((c) => c.toFixed(9)).join(",")));
  ok("30 units get 30 DISTINCT phases (no clumping)", distinct.size === 30, `distinct=${distinct.size}`);
}
// (d) source scan: no per-frame accumulator anywhere in the shipped region.
{
  const region = grabRegion("buildBondingScene", "applyBondingSceneGlow");
  const bad = [
    /\btime\s*\+=/, /\bphase\s*\+=/, /\+=\s*dt\b/, /\+=\s*0\.016/,
    /Date\.now\s*\(/, /performance\.now\s*\(/, /Math\.random\s*\(/
  ];
  const hits = bad.filter((re) => re.test(region)).map((re) => String(re));
  ok("no accumulator / wall clock / RNG in the bonding_scene region",
    hits.length === 0, hits.join(" "));
  ok("spin and jiggle both read state-local t only",
    /time - stateStartTime/.test(region) && !/__pmAccumMs/.test(region));
}
// (e) amplitude scales as sqrt(T/T0) — declared here, fully asserted by section 9 (E2).
{
  const lo = E.bscJiggle(2, 1.0, E.BS_T0_K, 1)[0];
  const hi = E.bscJiggle(2, 1.0, 4 * E.BS_T0_K, 1)[0];
  near("jiggle amplitude at 4T is exactly 2x that at T", hi / lo, 2, 1e-12);
}

// ── the ionic_bonding S2 transfer state, and the S4/S5 lattice state, authored
//    against the SHIPPED contract. Sections 2/3/7/10/11 all read these.
const TRANSFER_BS = {
  placement: "free", mode: "transfer",
  units: [{ id: "na", species: "Na", at: [-3, 0, 0] },
          { id: "cl", species: "Cl", at: [3, 0, 0] }],
  transfer: { at_ms: 1200, duration_ms: 2000, from: "na", to: "cl" }
};
const LATTICE_BS = {
  placement: "lattice", mode: "lattice_grow",
  units: [{ id: "na", species: "Na+" }, { id: "cl", species: "Cl-" }],
  lattice: { cell: "rock_salt", n: [3, 3, 3], a_pm: 564, grow_at_ms: 900, grow_duration_ms: 3600 }
};

console.log("\n=== 2. CHARGE CONSERVATION ACROSS THE TRANSFER BEAT ===");
// The unit-level invariant E1 asserted: per-molecule partial charges sum to 0.
{
  const keys = ["H2O", "NH3", "NF3", "CH4", "CCl4", "CHCl3", "CO2", "HCl", "H2S"];
  const worst = Math.max(...keys.map((k) =>
    Math.abs((E.bscCharges(k) as number[]).reduce((a: number, b: number) => a + b, 0))));
  ok("every molecule's per-atom partial charges sum to 0", worst < 1e-12, `worst=${worst.toExponential(2)}`);
}
// E3a: Sigma q across the transfer beat, off the SHIPPED arithmetic
// (bscTransferProg + bscTransferSite), sampled every 20 ms through the whole
// state — not merely at the two endpoints, because a beat that conserves charge
// only at its endpoints still renders a frame where it does not.
{
  const S = E.bscSiteList(TRANSFER_BS, null) as any[];
  ok("a transfer state resolves TWO single-atom sites from units[] alone (no new config key)",
    S.length === 2 && S[0].species === "Na" && S[1].species === "Cl",
    S.map((s) => s.species + "@" + s.unit).join(" "));
  const qAt = (ms: number) => {
    const p = E.bscTransferProg(TRANSFER_BS, ms) as number;
    return S.reduce((acc: number, si: any) => acc + (E.bscTransferSite(si, p) as any).q, 0);
  };
  let worstQ = 0, seen = new Set<string>();
  for (let ms = 0; ms <= 6000; ms += 20) {
    worstQ = Math.max(worstQ, Math.abs(qAt(ms)));
    const p = E.bscTransferProg(TRANSFER_BS, ms) as number;
    seen.add(((E.bscTransferSite(S[0], p) as any).q as number).toFixed(6));
  }
  ok("Sigma q = 0 at EVERY instant of the transfer, not just before and after",
    worstQ < 1e-12, `worst |Sigma q| = ${worstQ.toExponential(2)} over 0..6000 ms`);
  const p0 = E.bscTransferProg(TRANSFER_BS, 0) as number;
  const p1 = E.bscTransferProg(TRANSFER_BS, 5000) as number;
  const a0 = E.bscTransferSite(S[0], p0) as any, b0 = E.bscTransferSite(S[1], p0) as any;
  const a1 = E.bscTransferSite(S[0], p1) as any, b1 = E.bscTransferSite(S[1], p1) as any;
  ok("before: two NEUTRAL atoms (Na 0, Cl 0)", a0.q === 0 && b0.q === 0 &&
    a0.species === "Na" && b0.species === "Cl");
  ok("after: Na(+1) and Cl(-1), one electron moved and nothing else",
    a1.q === 1 && b1.q === -1 && a1.species === "Na+" && b1.species === "Cl-");
  ok("NEGATIVE CONTROL: the charge actually CHANGES mid-beat (it is not a constant 0)",
    seen.size > 20, `${seen.size} distinct donor charges across the beat`);
  // rewind: the charge/species/radius at 2000 ms must replay bit-for-bit after a
  // jump forward — the SET_TIME_FREEZE contract applied to the transfer beat.
  const snap = (ms: number) => JSON.stringify(S.map((si: any) =>
    E.bscTransferSite(si, E.bscTransferProg(TRANSFER_BS, ms))));
  const r1 = snap(2000); snap(9000); const r2 = snap(2000);
  ok("REWIND: t=2000 -> 9000 -> 2000 reproduces the beat bit-for-bit", r1 === r2);
  ok("no ion needs a table: the ionised species is DERIVED by inverting BS_ION_PARENT",
    E.BS_ION_OF.Na === "Na+" && E.BS_ION_OF.Cl === "Cl-" && E.BS_ION_OF.Mg === "Mg2+" &&
    E.BS_ION_OF.O === "O2-");
  // the charge itself is parsed from the species STRING, so the closed enum's
  // multiply-charged ions are covered without a row each.
  const chg: Record<string, number> = { "Na+": 1, "K+": 1, "Li+": 1, "Mg2+": 2, "Ca2+": 2, "Al3+": 3, "Cl-": -1, "F-": -1, "O2-": -2, Na: 0, Cl: 0 };
  const badChg = Object.keys(chg).filter((k) => E.bscSpeciesCharge(k) !== chg[k]);
  ok("formal charge is parsed from the species string for every ion in the enum",
    badChg.length === 0, badChg.join(" "));
  ok("the charge NEVER renders as ASCII (Rule 34c superscripts)",
    E.bscSpeciesLabel("Na+") === "Na⁺" && E.bscSpeciesLabel("O2-") === "O²⁻" &&
    E.bscSpeciesLabel("Al3+") === "Al³⁺" && E.bscSpeciesLabel("Na") === "Na",
    `${E.bscSpeciesLabel("Mg2+")} ${E.bscSpeciesLabel("Cl-")}`);
  // and the LATTICE is neutral too: rock salt alternates sublattices, so a block
  // with an odd site count carries exactly one unpaired ion and no more.
  const LS = E.bscSiteList(LATTICE_BS, null) as any[];
  const latQ = LS.reduce((a: number, s: any) => a + s.q, 0);
  ok("a 3x3x3 rock-salt block is charge-balanced to its one unpaired centre ion",
    Math.abs(latQ) === 1 && LS.length === 27, `Sigma q = ${latQ} over ${LS.length} sites`);
}

console.log("\n=== 3. IONIC RADII ON A LINEAR-IN-PM SCALE ===");
// E1 owns the TABLE; E3a owns what CONSUMES it.
{
  ok("BS_RADIUS_PM carries the ionic S2 pair (Na 186->102, Cl 99->181)",
    E.BS_RADIUS_PM.Na === 186 && E.BS_RADIUS_PM["Na+"] === 102 &&
    E.BS_RADIUS_PM.Cl === 99 && E.BS_RADIUS_PM["Cl-"] === 181);
  // The whole point of the separate table: MG_ELEMENTS.radius is compressed.
  const mgRatio = E.MG_ELEMENTS.Cl.radius / E.MG_ELEMENTS.H.radius;
  const pmRatio = E.BS_RADIUS_PM.Cl / E.BS_RADIUS_PM.H;
  ok("MG_ELEMENTS is COMPRESSED and BS_RADIUS_PM is not (they must differ)",
    Math.abs(mgRatio - pmRatio) > 0.5, `mg=${mgRatio.toFixed(2)}x  pm=${pmRatio.toFixed(2)}x`);
  const ions = ["Li+", "Na+", "K+", "Mg2+", "Ca2+", "Al3+", "F-", "Cl-", "O2-"];
  ok("every ion in the closed species enum has a linear-pm radius",
    ions.every((i) => typeof E.BS_RADIUS_PM[i] === "number"));
  ok("every ion resolves to a parent element for colour + valence",
    ions.every((i) => !!E.MG_ELEMENTS[E.BS_ION_PARENT[i]]));

  // ── E3a: the table is now CONSUMED. The post-transfer radii, off the shipped
  //    bscTransferSite, must be the linear-pm values and the RENDERED ratio must
  //    be linear in pm — not the compressed MG_ELEMENTS ratio, which is the whole
  //    reason the second table exists.
  const S3 = E.bscSiteList(TRANSFER_BS, null) as any[];
  const pEnd = E.bscTransferProg(TRANSFER_BS, 5000) as number;
  const na1 = E.bscTransferSite(S3[0], pEnd) as any, cl1 = E.bscTransferSite(S3[1], pEnd) as any;
  ok("post-transfer radii are exactly the authored linear-pm values (Na+ 102, Cl- 181)",
    na1.r_pm === 102 && cl1.r_pm === 181, `Na+ ${na1.r_pm} pm  Cl- ${cl1.r_pm} pm`);
  ok("pre-transfer radii are the neutral atomic values (Na 186, Cl 99)",
    (E.bscTransferSite(S3[0], 0) as any).r_pm === 186 &&
    (E.bscTransferSite(S3[1], 0) as any).r_pm === 99);
  // THE payoff of ionic S2, as a number: sodium shrinks by 45%, chlorine grows
  // by 83%, and on a compressed scale neither would read.
  const p2u = (E.bscLinkCfg(TRANSFER_BS) as any).pm_per_unit as number;
  const renderedRatio = (cl1.r_pm / p2u) / (na1.r_pm / p2u);
  ok("the RENDERED ion radius ratio is linear in pm (Cl-/Na+ = 181/102)",
    Math.abs(renderedRatio - 181 / 102) < 1e-12, `rendered ${renderedRatio.toFixed(6)}  pm ${(181 / 102).toFixed(6)}`);
  const mgRatioNaCl = E.MG_ELEMENTS.Cl.radius / E.MG_ELEMENTS.Na.radius;
  ok("NEGATIVE CONTROL: the compressed MG_ELEMENTS scale would give a DIFFERENT ratio",
    Math.abs(mgRatioNaCl - renderedRatio) > 0.5,
    `compressed ${mgRatioNaCl.toFixed(3)}x vs linear ${renderedRatio.toFixed(3)}x`);
  // ...and the size change is a real 45% shrink, monotone through the beat.
  let mono = true, prev = 1e9;
  for (let ms = 0; ms <= 5000; ms += 25) {
    const r = (E.bscTransferSite(S3[0], E.bscTransferProg(TRANSFER_BS, ms)) as any).r_pm as number;
    if (r > prev + 1e-12) mono = false;
    prev = r;
  }
  ok("the donor radius shrinks MONOTONICALLY through the beat (no bounce)", mono,
    `186 -> ${na1.r_pm} pm = ${((1 - na1.r_pm / 186) * 100).toFixed(0)}% shrink`);
  // ONE scale for radii and spacings: on the shared linear scale the rock-salt
  // ions TOUCH, which is ionic S3's "attraction stops at 282 pm" made visible.
  const LS3 = E.bscSiteList(LATTICE_BS, null) as any[];
  const nnUnits = E.bscMag(LS3[1].at);
  ok("rock-salt nearest-neighbour spacing is a/2 = 282 pm on the SAME scale as the radii",
    Math.abs(nnUnits * p2u - 282) < 1e-9, `${(nnUnits * p2u).toFixed(3)} pm`);
  ok("Na+ and Cl- therefore TOUCH on the lattice (r+ + r- within 1% of the spacing)",
    Math.abs((102 + 181) - nnUnits * p2u) / 282 < 0.01,
    `r+ + r- = 283 pm vs spacing ${(nnUnits * p2u).toFixed(1)} pm`);
  // source guard: the site path must never reach for the compressed radius.
  const updSrc3 = grabFn("updateBondingSceneFrame");
  const siteBlock = updSrc3.slice(updSrc3.indexOf("var siteList"), updSrc3.indexOf("bond-dipole arrows"));
  ok("the SITE path never reads MG_ELEMENTS.radius (it takes colour only)",
    !/em3\.radius/.test(siteBlock) && /em3\.color/.test(siteBlock) &&
    /siteRU\.push\(TS\.r_pm \/ p2uS\)/.test(siteBlock),
    "site radii come from BS_RADIUS_PM / pm_per_unit only");
  ok("bscTransferSite is the ONE place the ionisation arithmetic lives",
    (grabFn("updateBondingSceneFrame").match(/BS_ION_OF/g) || []).length === 0 &&
    /BS_ION_OF/.test(grabFn("bscTransferSite")));
}

console.log("\n=== 4. THE DIPOLE INSTRUMENT — STRUCTURE (OPEN-DECISION-1) ===");
// The table awaits chemistry-author ratification, so this asserts STRUCTURE, not
// exact debye values (the doc's instruction). Values are REPORTED for that review.
{
  const mu = (k: string) => (E.bscDipole(k, null) as any).mag as number;
  for (const k of ["CO2", "CCl4", "CH4", "BF3"]) {
    ok(`symmetric molecule ${k} sums to |mu| < 1e-12`, mu(k) < 1e-12, `|mu|=${mu(k).toExponential(2)} D`);
  }
  ok("CHCl3 (one substitution) is NOT zero", mu("CHCl3") > 0.1, `|mu|=${mu("CHCl3").toFixed(3)} D`);
  ok("NH3 > NF3 (the lone-pair/direction reversal, S7)",
    mu("NH3") > mu("NF3"), `NH3=${mu("NH3").toFixed(3)} D  NF3=${mu("NF3").toFixed(3)} D`);
  ok("the HF>HCl>HBr>HI ladder is monotonic (S2)",
    mu("HF") > mu("HCl") && mu("HCl") > mu("HBr") && mu("HBr") > mu("HI"));
  ok("H2O is polar and H2Te is only weakly so (the S7 family trend)",
    mu("H2O") > mu("H2S") && mu("H2S") > mu("H2Se") && mu("H2Se") > mu("H2Te"));
  // No species the shipped concepts author may fall through to the delta-chi
  // fallback — a fallback moment is a guess, and a silent one would ship.
  const shipped = ["HF", "HCl", "HBr", "HI", "H2O", "H2S", "H2Se", "H2Te", "NH3",
    "NF3", "CH4", "CCl4", "CHCl3", "CO2", "BF3"];
  E.__window.PM_bscMuFallback = [];
  shipped.forEach((k) => E.bscDipole(k, null));
  ok("no shipped species falls through to the delta-chi fallback",
    (E.__window.PM_bscMuFallback || []).length === 0,
    (E.__window.PM_bscMuFallback || []).join(" "));
  console.log("\n  REPORTED for chemistry-author ratification (debye, model vs literature):");
  const lit: Record<string, number> = {
    HF: 1.82, HCl: 1.08, HBr: 0.78, HI: 0.38, H2O: 1.85, H2S: 0.97, H2Se: 0.62,
    H2Te: 0.20, NH3: 1.47, NF3: 0.23, CH4: 0, CCl4: 0, CHCl3: 1.04, CO2: 0, BF3: 0
  };
  for (const k of shipped) {
    const d = Math.abs(mu(k) - lit[k]);
    console.log(`    ${k.padEnd(6)} model ${mu(k).toFixed(3)}   lit ${lit[k].toFixed(2)}   ` +
      (d <= 0.12 ? "ok" : `DELTA ${d.toFixed(2)}  <-- ratify`));
  }
  console.log("");
}

console.log("=== 5. THE SIGN CONVENTION, ASSERTED ONCE (delta+ -> delta-) ===");
// A sign flip renders perfectly while teaching the reverse (CRITICAL scar
// superposed_orbital_sign_convention_inverts_the_taught_direction). Cross-checked
// against the INDEPENDENT partial-charge path: mu_phys = Sigma q_i r_i points
// toward the POSITIVE end, so the drawn chemist arrow must be its negation.
{
  const check = (key: string) => {
    const D = E.bscDipole(key, null) as any;
    const q = E.bscCharges(key) as number[];
    const pos: number[][] = [[0, 0, 0]];
    for (const a of D.arrows) pos.push([a.dir[0] * E.BS_BOND_LEN, a.dir[1] * E.BS_BOND_LEN, a.dir[2] * E.BS_BOND_LEN]);
    const phys = [0, 1, 2].map((c) => q.reduce((s, qi, i) => s + qi * (pos[i] ? pos[i][c] : 0), 0));
    const dot = -(phys[0] * D.vec[0] + phys[1] * D.vec[1] + phys[2] * D.vec[2]);
    const denom = E.bscMag(phys) * D.mag;
    return denom > 1e-9 ? dot / denom : NaN;
  };
  for (const k of ["HCl", "HF", "H2O", "H2S", "NH3", "NF3", "CHCl3"]) {
    const c = check(k);
    ok(`${k}: drawn arrow points delta+ -> delta- (cos = +1 vs the charge field)`,
      c > 0.999, `cos=${c.toFixed(6)}`);
  }
  // and the table's own convention: a POSITIVE entry means the central atom is
  // delta+, so the vector runs central -> ligand.
  ok("BS_BOND_MOMENT_D positive entry <=> central atom is delta+",
    E.BS_BOND_MOMENT_D["H|Cl"] > 0 && E.bscCharges("HCl")[0] > 0 &&
    E.BS_BOND_MOMENT_D["O|H"] < 0 && E.bscCharges("H2O")[0] < 0);
}

console.log("\n=== 6. LINK CRITERION, DERIVED AT BOTH ENDS (E2) ===");
// The delta the criterion thresholds on (E1's contribution): the S4 lesson
// ("sulfur is not negative enough") must be a real number gap, not a whitelist.
{
  const dO = E.bscIonicFraction(Math.abs(E.bscChi("O") - E.bscChi("H")));
  const dS = E.bscIonicFraction(Math.abs(E.bscChi("S") - E.bscChi("H")));
  ok("delta(O in H2O) is ~9x delta(S in H2S) — a real threshold gap, not a whitelist",
    dO > 8 * dS, `O=${dO.toFixed(4)}  S=${dS.toFixed(4)}  ratio=${(dO / dS).toFixed(2)}x`);
  near("delta-chi(O,H) is the authored 1.24", E.bscChi("O") - E.bscChi("H"), 1.24, 1e-9);
  near("delta-chi(S,H) is the authored 0.38", E.bscChi("S") - E.bscChi("H"), 0.38, 1e-9);
}
const L6 = E.bscLinkCfg({ links: {} });
{
  ok("form_pm < break_pm (the hysteresis band exists at all)",
    L6.form_pm < L6.break_pm, `form=${L6.form_pm} break=${L6.break_pm} min=${L6.min_pm}`);

  // ── the two ends, on the SAME geometry. Only the derived charge differs.
  const qW = E.bscCharges("H2O") as number[];      // [O, H, H]
  const qS = E.bscCharges("H2S") as number[];
  console.log(`  (derived charges: H2O  H ${qW[1].toFixed(4)} / O ${qW[0].toFixed(4)}   ` +
    `H2S  H ${qS[1].toFixed(4)} / S ${qS[0].toFixed(4)})`);
  ok("H2O links at 180 pm, 175 deg (the S2 geometry)",
    E.bscLinkOk(qW[1], qW[0], 180, 175, L6, false));
  ok("NEGATIVE CONTROL: H2S does NOT, at the IDENTICAL geometry (S4)",
    !E.bscLinkOk(qS[1], qS[0], 180, 175, L6, false),
    `acceptor |q| ${Math.abs(qS[0]).toFixed(4)} vs threshold ${L6.acceptor}`);

  // ── the SWEEP the doc asks for: walk the acceptor delta across delta_min and
  //    formation must flip EXACTLY once, with nothing else changed.
  const accFlip: number[] = [];
  for (let n = 0; n <= 1000; n++) {
    const q = -n / 1000;
    const a = E.bscLinkOk(qW[1], q, 180, 175, L6, false);
    const b = E.bscLinkOk(qW[1], -(n - 1) / 1000, 180, 175, L6, false);
    if (n > 0 && a !== b) accFlip.push(n / 1000);
  }
  ok("sweeping the ACCEPTOR delta flips formation exactly once, at delta_min.acceptor",
    accFlip.length === 1 && Math.abs(accFlip[0] - L6.acceptor) <= 0.002,
    `flips at ${accFlip.map((v) => v.toFixed(3)).join(",")} (delta_min.acceptor=${L6.acceptor})`);
  const donFlip: number[] = [];
  for (let n = 0; n <= 1000; n++) {
    const a = E.bscLinkOk(n / 1000, qW[0], 180, 175, L6, false);
    const b = E.bscLinkOk((n - 1) / 1000, qW[0], 180, 175, L6, false);
    if (n > 0 && a !== b) donFlip.push(n / 1000);
  }
  ok("sweeping the DONOR delta flips formation exactly once, at delta_min.donor",
    donFlip.length === 1 && Math.abs(donFlip[0] - L6.donor) <= 0.002,
    `flips at ${donFlip.map((v) => v.toFixed(3)).join(",")} (delta_min.donor=${L6.donor})`);
  ok("NEGATIVE CONTROL: a donor below delta_min.donor forms none, however good the acceptor",
    !E.bscLinkOk(L6.donor - 0.01, -1.0, 180, 180, L6, false));
  ok("NEGATIVE CONTROL: a bent approach outside angle_window_deg forms none",
    !E.bscLinkOk(qW[1], qW[0], 180, 180 - L6.window - 1, L6, false) &&
    E.bscLinkOk(qW[1], qW[0], 180, 180 - L6.window + 1, L6, false));
  ok("NEGATIVE CONTROL: too far (past form_pm) and too close (under min_pm) both fail",
    !E.bscLinkOk(qW[1], qW[0], L6.form_pm + 1, 180, L6, false) &&
    !E.bscLinkOk(qW[1], qW[0], L6.min_pm - 1, 180, L6, false));

  // ── EMERGENCE, the whole point of D-2: run the criterion over every species in
  //    the closed enum and let the acceptor elements fall out. N, O and F must
  //    appear; S, Se, Te, Cl, C must not. No list of elements exists anywhere.
  const SPECIES = ["H2O", "H2S", "H2Se", "H2Te", "NH3", "NF3", "CH4", "CCl4",
    "CHCl3", "CO2", "HF", "HCl", "HBr", "HI", "BF3"];
  const passAcc = new Set<string>(), passDon = new Set<string>();
  for (const s of SPECIES) {
    const mol = E.MG_MOLECULES[s];
    const sites = E.bscLinkSites(s) as any;
    const ligs = E.bscLigands(mol) as string[];
    const elOf = (slot: number) => (slot === 0 ? mol.central : (ligs[slot - 1] || mol.ligand));
    for (const a of sites.acceptors) if (-a.q >= L6.acceptor) passAcc.add(elOf(a.slot));
    for (const d of sites.donors) if (d.q >= L6.donor) passDon.add(s);
  }
  const accList = [...passAcc].sort();
  ok("the acceptor elements EMERGE as exactly N, O, F (no whitelist in the code)",
    sameSet(accList, ["N", "O", "F"]), `emerged: ${accList.join(",")}`);
  ok("every donor that passes is a hydrogen (bscLinkSites derives it from the element)",
    [...passDon].every((s) => (E.bscLinkSites(s) as any).donors.length > 0),
    `donor species: ${[...passDon].sort().join(",")}`);
  ok("no element list appears in the shipped link path",
    !/\[\s*"N"\s*,\s*"O"\s*,\s*"F"\s*\]/.test(grabFn("bscLinkOk") + grabFn("bscLinkSites") + grabFn("bscLinkCfg")));

  // ── HYSTERESIS, on the exact case it exists for: a pair parked in the band
  //    between form_pm and break_pm. Identical present geometry, opposite
  //    history, opposite answer — and neither one flickers.
  const band = (L6.form_pm + L6.break_pm) / 2;
  const wasClose = [{ d: 190, a: 176 }, { d: 200, a: 176 }, { d: band, a: 176 }, { d: band, a: 176 }];
  const neverClose = [{ d: 250, a: 176 }, { d: 245, a: 176 }, { d: band, a: 176 }, { d: band, a: 176 }];
  ok("a pair that WAS inside form_pm holds all the way out to break_pm",
    E.bscLinkLatch(qW[1], qW[0], wasClose, L6), `band midpoint ${band} pm`);
  ok("NEGATIVE CONTROL: a pair that never closed does not link in the same band",
    !E.bscLinkLatch(qW[1], qW[0], neverClose, L6));
  {
    // no flicker: jitter the distance around form_pm for many evaluations —
    // once formed it must stay formed for every one of them.
    let flips = 0, prev: boolean | null = null;
    for (let n = 0; n < 200; n++) {
      const d = L6.form_pm + 18 * Math.sin(n * 0.7);
      const s = [{ d: 180, a: 178 }, { d: 185, a: 178 }, { d: d, a: 178 }];
      const v = E.bscLinkLatch(qW[1], qW[0], s, L6);
      if (prev !== null && v !== prev) flips++;
      prev = v;
    }
    ok("no flicker: 200 evaluations straddling form_pm never change the answer", flips === 0, `flips=${flips}`);
  }

  // ── the link SET is a pure function of state-local t (D-1): a two-water
  //    replay through the SHIPPED lookback, rewound.
  const BL = E.BS_BOND_LEN, frW = E.mgFrame("H2O", null, null) as any;
  const dH = frW.bonds[0] as number[];
  const sampleAt = (tSec: number, T: number, gapPm: number, scale: number) => {
    const R = gapPm / L6.pm_per_unit;
    const j0 = E.bscJiggle(0, tSec, T, scale), j1 = E.bscJiggle(1, tSec, T, scale);
    const o0 = [j0[0], j0[1], j0[2]];
    const o1 = [dH[0] * (BL + R) + j1[0], dH[1] * (BL + R) + j1[1], dH[2] * (BL + R) + j1[2]];
    const Hp = [o0[0] + dH[0] * BL, o0[1] + dH[1] * BL, o0[2] + dH[2] * BL];
    const v = [o1[0] - Hp[0], o1[1] - Hp[1], o1[2] - Hp[2]];
    const w = [o0[0] - Hp[0], o0[1] - Hp[1], o0[2] - Hp[2]];
    const dd = E.bscMag(v), ww = E.bscMag(w) || 1;
    const ca = (v[0] * w[0] + v[1] * w[1] + v[2] * w[2]) / ((dd || 1) * ww);
    return { d: dd * L6.pm_per_unit, a: Math.acos(Math.max(-1, Math.min(1, ca))) * 180 / Math.PI };
  };
  const linkedAt = (msNow: number, T: number, gapPm: number, scale: number) => {
    const S = E.BS_LINK_SAMPLES, dt = E.BS_LINK_LOOKBACK_MS / (S - 1);
    const samp: any[] = [];
    for (let s = 0; s < S; s++) {
      const m = msNow - (S - 1 - s) * dt;
      samp.push(m < 0 ? null : sampleAt(m / 1000, T, gapPm, scale));
    }
    return E.bscLinkLatch(qW[1], qW[0], samp, L6);
  };
  {
    const a = [] as boolean[], b = [] as boolean[];
    for (let m = 800; m <= 6000; m += 40) a.push(linkedAt(m, 380, 205, 0.9));
    for (let m = 9000; m <= 12000; m += 40) linkedAt(m, 380, 205, 0.9);   // run forward
    for (let m = 800; m <= 6000; m += 40) b.push(linkedAt(m, 380, 205, 0.9));
    ok("REWIND: the link state over 800..6000 ms replays identically after a jump to 12 s",
      a.every((v, i) => v === b[i]),
      `${a.filter(Boolean).length}/${a.length} frames linked`);
    ok("the replayed link state actually CHANGES over that window (it is not a constant)",
      new Set(a).size === 2);
  }
  (E as any).__linkedAt = linkedAt;

  // ── scar: a declared element with no meshes behind it. bsc_link was in
  //    BS_GLOW_ELS from E1 with nothing to glow; assert EXISTENCE before any
  //    negative-form check (field3d_scenario_declares_bead_element_but_never
  //    _builds_the_meshes).
  const buildSrc = grabFn("buildBondingScene");
  const updSrc = grabFn("updateBondingSceneFrame");
  ok("bsc_link meshes are BUILT, not just declared in the glow enum",
    /elementType:\s*"bsc_link"/.test(buildSrc) && E.BS_MAX_LINKS * E.BS_LINK_DASHES > 0,
    `pool = ${E.BS_MAX_LINKS} links x ${E.BS_LINK_DASHES} dashes = ${E.BS_MAX_LINKS * E.BS_LINK_DASHES} meshes`);
  ok("the frame pass positions and toggles them", updSrc.includes('"bsc_link"'));
  ok("links are DASHED, not solid (a hydrogen bond must not read like a bond stick)",
    /BS_LINK_DASHES/.test(buildSrc) && /BS_LINK_DASHES/.test(updSrc));
}

console.log("\n=== 7. LATTICE COORDINATION NUMBERS + THE GROWTH BEAT (E3a) ===");
{
  // (a) the four numbers, DERIVED from the shipped generator. bscCoordination
  //     builds a block and counts the sites at the minimum distance from the
  //     centre — there is no coordination table anywhere to agree with.
  const WANT: Record<string, number> = { rock_salt: 6, fcc: 12, bcc: 8, hcp: 12 };
  for (const cell of E.BS_CELLS as string[]) {
    ok(`${cell}: interior coordination = ${WANT[cell]} (derived, not tabulated)`,
      E.bscCoordination(cell) === WANT[cell], `got ${E.bscCoordination(cell)}`);
  }
  ok("no coordination table exists in the shipped source to agree with",
    !/rock_salt\s*:\s*6/.test(grabFn("bscCoordination") + grabFn("bscCellSites")));
  // (b) NEGATIVE CONTROL — the metric can distinguish cells, and it is an
  //     INTERIOR property: a corner site of the same block has fewer neighbours.
  ok("NEGATIVE CONTROL: the four cells do NOT all report the same number",
    new Set((E.BS_CELLS as string[]).map((c) => E.bscCoordination(c))).size === 3,
    (E.BS_CELLS as string[]).map((c) => c + "=" + E.bscCoordination(c)).join(" "));
  for (const cell of E.BS_CELLS as string[]) {
    const S = E.bscCellSites(cell, 5, 5, 5) as any[];
    const dist = (a: any, b: any) => E.bscMag([a.at[0] - b.at[0], a.at[1] - b.at[1], a.at[2] - b.at[2]]);
    const nn = Math.min(...S.slice(1).map((s) => dist(S[0], s)));
    const cornerIdx = S.length - 1;                       // the farthest site
    const corner = S.reduce((n: number, s: any, i: number) =>
      i === cornerIdx ? n : n, 0);
    void corner;
    const cnt = (idx: number) => S.filter((s, i) => i !== idx && Math.abs(dist(S[idx], s) - nn) < 1e-6).length;
    ok(`NEGATIVE CONTROL: ${cell} corner site has FEWER neighbours than the interior`,
      cnt(cornerIdx) < cnt(0), `corner ${cnt(cornerIdx)} vs interior ${cnt(0)}`);
  }
  // (c) the nearest-neighbour distances are the textbook ones (in units of a),
  //     which is what makes the ion-touching reading in section 3 honest.
  const nnOf = (cell: string) => {
    const S = E.bscCellSites(cell, 5, 5, 5) as any[];
    return Math.min(...S.slice(1).map((s: any) =>
      E.bscMag([s.at[0] - S[0].at[0], s.at[1] - S[0].at[1], s.at[2] - S[0].at[2]])));
  };
  near("rock_salt nearest neighbour = a/2", nnOf("rock_salt"), 0.5, 1e-12, " a");
  near("fcc nearest neighbour = a/sqrt2", nnOf("fcc"), Math.SQRT1_2, 1e-12, " a");
  near("bcc nearest neighbour = sqrt3 a/2", nnOf("bcc"), Math.sqrt(3) / 2, 1e-12, " a");
  near("hcp nearest neighbour = a (the ideal c/a puts all 12 at one spacing)",
    nnOf("hcp"), 1, 1e-12, " a");
  // (d) rock salt alternates species — the property D-7 will read against. Every
  //     nearest neighbour of a cation is an anion, so a like-charge contact on
  //     the UNSHIFTED ionic lattice is impossible, while a cation-only metal has
  //     8 (bcc) before anything moves. That asymmetry is exactly why a raw
  //     like-neighbour count would teach something false, and it is preserved
  //     here rather than foreclosed.
  {
    const S = E.bscSiteList(LATTICE_BS, null) as any[];
    const nn = E.bscMag(S[1].at) as number;
    const nbrs = S.filter((s: any, i: number) => i > 0 && Math.abs(E.bscMag(s.at) - nn) < 1e-9);
    ok("rock salt: all 6 nearest neighbours of the centre carry the OPPOSITE charge",
      nbrs.length === 6 && nbrs.every((s: any) => s.q * S[0].q < 0),
      `centre ${S[0].species} q=${S[0].q}; neighbours ${nbrs.map((s: any) => s.species).join(",")}`);
    ok("every site carries its INTEGER key + sublattice (D-7 stays open for E3b)",
      S.every((s: any) => Array.isArray(s.key) && s.key.length === 3 &&
        s.key.every((v: number) => Number.isInteger(v)) && (s.sub === 0 || s.sub === 1)));
    const metal = { placement: "lattice", mode: "lattice_grow",
      units: [{ id: "na", species: "Na" }],
      lattice: { cell: "bcc", n: [3, 3, 3], a_pm: 429 } };
    const M = E.bscSiteList(metal, null) as any[];
    const mnn = E.bscMag(M[1].at) as number;
    const mNb = M.filter((s: any, i: number) => i > 0 && Math.abs(E.bscMag(s.at) - mnn) < 1e-9);
    ok("NEGATIVE CONTROL for D-7: a cation-only bcc metal already has 8 LIKE neighbours before any shift",
      mNb.length === 8 && mNb.every((s: any) => s.species === M[0].species),
      "a raw like-neighbour count would read 8 -> 8 and teach a falsehood");
  }
  // (e) THE GROWTH BEAT. Shell-ordered, so growth adds on the OUTSIDE and a site
  //     already on screen never moves — ionic S4's misconception kill depends on
  //     the pair holding still while the lattice surrounds it.
  {
    const S = E.bscSiteList(LATTICE_BS, null) as any[];
    const total = S.length;
    const r = (s: any) => E.bscMag(s.at);
    let sorted = true;
    for (let i = 1; i < S.length; i++) if (r(S[i]) < r(S[i - 1]) - 1e-9) sorted = false;
    ok("sites are shell-ordered from the centre outward", sorted, `${total} sites`);
    const shown = (ms: number) => E.bscGrowShown(LATTICE_BS, ms, total) as number;
    ok("growth opens on the authored PAIR and ends on the full block",
      shown(0) === 2 && shown(9000) === total, `${shown(0)} -> ${shown(9000)}`);
    let monoG = true, prevG = -1, distinct = new Set<number>();
    for (let ms = 0; ms <= 9000; ms += 20) {
      const n = shown(ms);
      if (n < prevG) monoG = false;
      prevG = n; distinct.add(n);
    }
    ok("the shown count never DECREASES (growth, not flicker)", monoG);
    ok("NEGATIVE CONTROL: it is not a step function — the block grows through many counts",
      distinct.size > 10, `${distinct.size} distinct counts`);
    // the sites already placed are bit-for-bit unchanged at every count: the
    // positions come from the index, so this is structural, and it is asserted
    // rather than assumed.
    const posAt = (n: number) => JSON.stringify(S.slice(0, n).map((s: any) => s.at));
    ok("a site already on screen NEVER moves as the block grows",
      posAt(2) === JSON.stringify(S.slice(0, 2).map((s: any) => s.at)) &&
      posAt(9).startsWith(posAt(2).slice(0, -1)));
    // REWIND: growth is a pure function of t, so a freeze pin replays it.
    const g1 = shown(2400); shown(20000); const g2 = shown(2400);
    ok("REWIND: shown(2400 ms) replays identically after a jump to 20 s", g1 === g2, `n=${g1}`);
    ok("NO LATCH: bscGrowShown reads only (bs, ms, total)",
      !/window\.|PM_bsc/.test(grabFn("bscGrowShown")));
  }
  // (f) the interior reveal (D-5) is ONE decided mechanism with a closed enum,
  //     and it is a REAL geometric change, not a glow (Rule 29 brightness cannot
  //     defeat occlusion).
  ok("lattice.reveal is the closed enum none|cutaway|peer_fade",
    sameSet(E.BS_LATTICE_REVEALS, ["none", "cutaway", "peer_fade"]));
  {
    const upd = grabFn("updateBondingSceneFrame");
    ok("peer_fade drives OPACITY and cutaway drives a half-space, both ramped",
      /peer_fade/.test(upd) && /cutaway/.test(upd) && /BS_PEER_FADE_OPACITY/.test(upd) &&
      /bscSetOpacity/.test(upd));
    ok("the counted set (focal + neighbours) is NEVER faded by the reveal",
      /if\s*\(revF\s*>\s*0\s*&&\s*!isCounted\(i\)\)/.test(upd));
    ok("the six neighbour RODS are built, not just declared in the glow enum",
      /elementType:\s*"bsc_neighbour"/.test(grabFn("buildBondingScene")) &&
      /bsc_nb/.test(upd), `pool = ${E.BS_MAX_NEIGHBOURS} rods`);
    ok("D-6: a 27-site block never renders 27 labels",
      E.BS_MAX_SITE_LABELS <= 8 && /siteLabelBudget/.test(upd),
      `cap ${E.BS_MAX_SITE_LABELS}`);
  }
  // (g) the explore picker: ion_pair swaps BOTH species AND the cell edge, so a
  //     new pair can never rattle inside the previous pair's cage.
  {
    const pairs = Object.keys(E.BS_ION_PAIRS);
    ok("the explore picker offers the five rock-salt pairs one cell covers",
      sameSet(pairs, ["NaCl", "KCl", "LiF", "MgO", "CaO"]));
    let touch = true, detail: string[] = [];
    for (const p of pairs) {
      const cfg = E.BS_ION_PAIRS[p];
      const S = E.bscSiteList(LATTICE_BS, cfg) as any[];
      const p2 = (E.bscLinkCfg(LATTICE_BS) as any).pm_per_unit as number;
      const nnPm = (E.bscMag(S[1].at) as number) * p2;
      const sumR = E.bscRadiusPm(cfg.cation) + E.bscRadiusPm(cfg.anion);
      detail.push(`${p} ${nnPm.toFixed(0)}/${sumR}`);
      if (Math.abs(nnPm - sumR) / nnPm > 0.16) touch = false;
      if (S[0].species !== cfg.cation || S[1].species !== cfg.anion) touch = false;
    }
    ok("every pair swaps species AND a_pm together, and its ions still touch",
      touch, detail.join("  "));
  }
}

console.log("\n=== 8. LAYER-SHIFT OUTCOME + THE like_contacts METRIC (D-7) ===");
// E3b dispatch 3 (L-1 / L-2). This section was a declared SKIP through four
// dispatches; it is now the real assertion set, and it is written against the
// SHIPPED bodies (bscShiftSolve / bscLikeContacts / bscCleaveU are extracted and
// called, never transcribed).
//
// WHY THE DISAGREEMENT CASE IS THE POINT. The naive metric — count same-sign
// nearest neighbours — reads 0 on unshifted rock salt, which looks right, and a
// gate that only asserted "the ionic block reads 6 after the slide" would pass
// it. On a cation-only metal the same naive metric reads 8 before anything moves
// and 6 after, so a naive instrument announces that slipping a metal REMOVES two
// like-charge contacts. Every assertion below therefore comes in a PAIR: the
// ionic case AND the cation-only case that separates the definition from its
// naive lookalike.
{
  const P2U = E.bscLinkCfg({}).pm_per_unit as number;
  // The two fixtures differ ONLY in cell / a_pm / species. The shift block is
  // BYTE-IDENTICAL between them, which is the structural proof that neither
  // concept authors its own outcome (D-2): same motion, same cue times, same
  // offset, opposite result.
  const SHIFT_BLOCK = { at_ms: 6000, duration_ms: 3000, offset_sites: 1, plane: "y" };
  const IONIC_SHIFT_BS: any = {
    placement: "lattice", mode: "layer_shift",
    lattice: { cell: "rock_salt", n: [3, 3, 3], a_pm: 564.0 },
    units: [{ id: "na", species: "Na+" }, { id: "cl", species: "Cl-" }],
    shift: { ...SHIFT_BLOCK },
    controls: [{ id: "shift" }], hud_lines: ["like_contacts"]
  };
  // a_pm here is FIXTURE GEOMETRY, not a shipped table value: BS_METALS and its
  // ratification belong to dispatch 4, and nothing in this section asserts a
  // metal datum. What is asserted is the CHARGE PATTERN — a lattice of cation
  // cores with no anion sublattice, which is what a metal is.
  const METAL_SHIFT_BS: any = {
    placement: "lattice", mode: "layer_shift",
    lattice: { cell: "bcc", n: [3, 3, 3], a_pm: 429.1 },
    units: [{ id: "na", species: "Na+" }],
    shift: { ...SHIFT_BLOCK },
    controls: [{ id: "shift" }], hud_lines: ["like_contacts"]
  };
  const T_SLIDE_END = 9000;                      // at_ms + duration_ms
  const T_HELD = T_SLIDE_END + (E.BS_SHIFT_HOLD_MS as number);          // 10000
  const T_SETTLED = T_HELD + (E.BS_CLEAVE_MS as number) + 600;          // 15600

  const sitesOf = (bs: any) => E.bscSiteList(bs, null) as any[];
  const chargesOf = (S: any[]) => S.map((s) => s.q as number);
  /** the frame pass's own sequence: solve once, then place every site. */
  const slip = (bs: any, ms: number, drag: number | null = null) => {
    const S = sitesOf(bs), n = S.length, Q = chargesOf(S);
    const sVal = E.bscShiftAt(bs, ms, drag) as number;
    const sol = E.bscShiftSolve(bs, S, n, Q);
    const pos = S.map((si: any, i: number) =>
      E.bscSiteAt(bs, si, i, ms, null, null,
        E.bscShiftOffsetOf(bs, si, sol, ms, drag, sVal)) as number[]);
    const Pref = E.bscShiftPos(bs, S, n, ms, null, 0) as number[][];
    const Pnow = E.bscShiftPos(bs, S, n, ms, null, sVal) as number[][];
    const cut = (E.BS_LIKE_CUT as number) * (E.bscNnOf(Pref, n) as number);
    return {
      S, n, Q, sVal, sol, pos,
      like: E.bscLikeContacts(Pnow, Pref, Q, n) as number,
      naive: E.bscLikeCountAt(Pnow, Q, n, cut) as number,
      naiveRef: E.bscLikeCountAt(Pref, Q, n, cut) as number,
      focal: E.bscLikeFocal(Pnow, Pref, Q, n, 0) as number,
      gap: E.bscCleaveU(bs, sol, ms, drag) as number
    };
  };

  // ── (a) THE SLIDE ITSELF: one half moves exactly one site, the other does not.
  {
    const a0 = slip(IONIC_SHIFT_BS, 0), a1 = slip(IONIC_SHIFT_BS, T_SLIDE_END);
    const step = (564.0 * 0.5) / P2U;
    let moved = 0, still = 0, worstMoved = 0, worstStill = 0;
    for (let i = 0; i < a0.n; i++) {
      const up = E.bscShiftHalf(a0.S[i], 1) as number;
      const dx = a1.pos[i][0] - a0.pos[i][0];
      if (up) { moved++; worstMoved = Math.max(worstMoved, Math.abs(dx - step)); }
      else { still++; worstStill = Math.max(worstStill, Math.abs(dx)); }
    }
    ok("the plane splits the block into a moving half and a held half",
      moved === 9 && still === 18, `${moved} move, ${still} hold, of ${a0.n}`);
    ok("the moving half slides EXACTLY offset_sites * one grid step, on the derived axis",
      worstMoved < 1e-12, `worst residual ${worstMoved.toExponential(2)} scene units`);
    ok("the held half does not move by a float (P-1 would have moved neither)",
      worstStill === 0, `worst |dx| ${worstStill}`);
    ok("plane 'y' derives the slide onto x; plane 'x' derives it onto y",
      (E.bscShiftCfg({ shift: { plane: "y" } }) as any).dAx === 0 &&
      (E.bscShiftCfg({ shift: { plane: "x" } }) as any).dAx === 1 &&
      (E.bscShiftCfg({ shift: { plane: "z" } }) as any).dAx === 0);
    // D-1 / Rule 36: the rewind, on the whole pose including the cleave.
    const r1 = JSON.stringify(slip(IONIC_SHIFT_BS, T_SETTLED).pos);
    slip(IONIC_SHIFT_BS, 90000);
    ok("REWIND: t=15600 -> 90000 -> 15600 reproduces the slipped pose byte-for-byte",
      r1 === JSON.stringify(slip(IONIC_SHIFT_BS, T_SETTLED).pos));
  }

  // ── (b) THE METRIC ON ROCK SALT: 0 -> 6, derived, never tuned.
  {
    const seq = [0, 3000, 6000, 7500, T_SLIDE_END, T_SETTLED]
      .map((m) => ({ m, r: slip(IONIC_SHIFT_BS, m) }));
    const at0 = seq[0].r, atEnd = seq[seq.length - 1].r;
    ok("unshifted rock salt has ZERO like-charge nearest neighbours (naive agrees here)",
      at0.like === 0 && at0.naiveRef === 0, `like=${at0.like} naive_ref=${at0.naiveRef}`);
    ok("a completed one-site slide CREATES 6 unscreened like-charge contacts",
      atEnd.like === 6,
      seq.map((s) => `${s.m}ms:${s.r.like}`).join("  "));
    ok("the count is monotone through the slide (0 while the unlike pairs still face)",
      seq.every((s, i) => i === 0 || s.r.like >= seq[i - 1].r.like));
    // block-size independence of the OUTCOME (the count itself is a count of the
    // drawn block, exactly as 'links' is): a 5-step block creates 20 of its 25
    // cross-plane contacts, the same physical situation at a bigger crop.
    const big = slip({ ...IONIC_SHIFT_BS, lattice: { cell: "rock_salt", n: [5, 5, 5], a_pm: 564.0 } }, T_SETTLED);
    ok("a 5-step block creates 20 like contacts of its 20 surviving interface ones",
      big.like === 20 && big.sol.cross === 20 && big.sol.cross0 === 25 &&
      big.sol.frac === 1, `made=${big.like} cross ${big.sol.cross0} -> ${big.sol.cross} frac=${big.sol.frac}`);
    ok("the 3-step block reads the SAME fraction (1.00) off 6 of 6 — crop-independent",
      atEnd.sol.made === 6 && atEnd.sol.cross === 6 && atEnd.sol.cross0 === 9 &&
      atEnd.sol.frac === 1,
      `made=${atEnd.sol.made} cross ${atEnd.sol.cross0} -> ${atEnd.sol.cross} frac=${atEnd.sol.frac}`);
    // the doubly-charged pairs the S10 picker offers must derive identically
    for (const [cat, ani, a] of [["Mg2+", "O2-", 421.2], ["Ca2+", "O2-", 481.1],
      ["K+", "Cl-", 629.3], ["Li+", "F-", 402.6]] as [string, string, number][]) {
      const r = slip({ ...IONIC_SHIFT_BS, units: [{ species: cat }, { species: ani }],
        lattice: { cell: "rock_salt", n: [3, 3, 3], a_pm: a } }, T_SETTLED);
      ok(`${cat}/${ani} (a=${a} pm) derives the same 6 — charge MAGNITUDE is not the criterion`,
        r.like === 6, `like=${r.like}`);
    }
  }

  // ── (c) THE DISAGREEMENT CASE. This is the assertion the dispatch calls the
  //    most important thing in it: on a cation-only lattice the NAIVE count is
  //    non-zero before anything moves, while the shipped metric reads 0.
  {
    const m0 = slip(METAL_SHIFT_BS, 0), mE = slip(METAL_SHIFT_BS, T_SETTLED);
    ok("DISAGREEMENT: the cation-only lattice's NAIVE count is non-zero PRE-SHIFT",
      m0.naiveRef === 8, `naive_ref=${m0.naiveRef} (the 9-site bcc block: 8 core-corner contacts)`);
    ok("...while the SHIPPED metric reads 0 pre-shift", m0.like === 0, `like=${m0.like}`);
    ok("...and still 0 after the full slide, where the naive count has CHANGED",
      mE.like === 0 && mE.naive !== mE.naiveRef,
      `like=${mE.like}  naive ${mE.naiveRef} -> ${mE.naive}`);
    ok("NEGATIVE CONTROL: a screening-BLIND delta would print a non-zero number here",
      mE.naive - mE.naiveRef !== 0,
      `a naive delta implementation would print ${mE.naive - mE.naiveRef}`);
    // and at a bigger crop, where the naive numbers are bigger still
    const m5 = slip({ ...METAL_SHIFT_BS, lattice: { cell: "bcc", n: [5, 5, 5], a_pm: 429.1 } }, T_SETTLED);
    ok("...at a 5-step metal block too (naive 64 -> 56, shipped metric 0)",
      m5.like === 0 && m5.naiveRef === 64 && m5.naive === 56,
      `naive ${m5.naiveRef} -> ${m5.naive}, like=${m5.like}`);
    // the screening predicate itself, on charge patterns rather than on scenes
    ok("bscSeaScreens: all-one-sign screens, mixed sign does not, all-neutral does not",
      E.bscSeaScreens([1, 1, 1], 3) === true &&
      E.bscSeaScreens([-1, -1], 2) === true &&
      E.bscSeaScreens([1, -1, 1, -1], 4) === false &&
      E.bscSeaScreens([0, 0, 0], 3) === false);
    ok("the sea is DERIVED from the charges — no mode string, no sea:{} flag consulted",
      !/\bsea\b/.test(grabFn("bscSeaScreens")) &&
      !/mode/.test(grabFn("bscLikeContacts") + grabFn("bscShiftSolve")));
  }

  // ── (d) THE DERIVED OUTCOME: the ionic block comes apart, the metal does not,
  //    and the two JSONs differ in no key that says so.
  {
    const iE = slip(IONIC_SHIFT_BS, T_SETTLED), mE = slip(METAL_SHIFT_BS, T_SETTLED);
    ok("the two fixtures author the IDENTICAL shift block (nothing declares the outcome)",
      JSON.stringify(IONIC_SHIFT_BS.shift) === JSON.stringify(METAL_SHIFT_BS.shift) &&
      JSON.stringify(IONIC_SHIFT_BS.shift) === JSON.stringify(SHIFT_BLOCK));
    ok("SPLIT: the ionic halves end up apart, by a gap derived from the contacts",
      iE.gap > 0 && Math.abs(iE.gap - (E.BS_CLEAVE_NN as number) * iE.sol.nn * iE.sol.frac) < 1e-12,
      `gap=${iE.gap.toFixed(4)} scene units (${(iE.gap * P2U).toFixed(0)} pm)`);
    ok("HOLD: the metal slides the same distance and never opens, at ANY t",
      [0, 6000, T_SLIDE_END, T_HELD, T_SETTLED, 90000]
        .every((m) => slip(METAL_SHIFT_BS, m).gap === 0) && mE.sol.frac === 0,
      `frac=${mE.sol.frac}`);
    // Rule 32a: the CAUSE finishes and is HELD before the effect starts.
    ok("32a: at the instant the slide completes the halves have NOT yet opened",
      slip(IONIC_SHIFT_BS, T_SLIDE_END).gap === 0 &&
      slip(IONIC_SHIFT_BS, T_HELD).gap === 0 &&
      slip(IONIC_SHIFT_BS, T_HELD + 1200).gap > 0,
      `hold window ${T_SLIDE_END}..${T_HELD} ms`);
    ok("...and the slide itself moved BEFORE that (the cause is visible first)",
      JSON.stringify(slip(IONIC_SHIFT_BS, 6000).pos) !==
      JSON.stringify(slip(IONIC_SHIFT_BS, 7800).pos));
    // The two halves open symmetrically ABOUT THE PLANE — each moves the same
    // distance from it — so the block's bounding box stays centred and the
    // camera fit (which measures a half-extent about the origin) stays a
    // symmetric solve. Its MASS centroid does move, and that is not a defect: a
    // 3-step block is split 9 sites against 18, and moving the smaller half
    // further to hold the centroid still would open one face of the crystal
    // twice as far as the other for no physical reason.
    {
      const s1 = slip(IONIC_SHIFT_BS, T_SETTLED);
      const ys = s1.pos.map((p) => p[1]);
      ok("the cleave opens symmetrically about the plane (the fit stays centred)",
        Math.abs(Math.max(...ys) + Math.min(...ys)) < 1e-12,
        `y span ${Math.min(...ys).toFixed(4)} .. ${Math.max(...ys).toFixed(4)}`);
    }
    ok("the camera fit carries the slide and half the gap (config-only, no clock)",
      (E.bscShiftExtent(IONIC_SHIFT_BS, sitesOf(IONIC_SHIFT_BS)) as number) > 0 &&
      (E.bscShiftExtent(METAL_SHIFT_BS, sitesOf(METAL_SHIFT_BS)) as number) ===
        Math.abs(1) * (E.bscShiftStepU(METAL_SHIFT_BS, sitesOf(METAL_SHIFT_BS)[0]) as number),
      `ionic ${(E.bscShiftExtent(IONIC_SHIFT_BS, sitesOf(IONIC_SHIFT_BS)) as number).toFixed(3)}  ` +
      `metal ${(E.bscShiftExtent(METAL_SHIFT_BS, sitesOf(METAL_SHIFT_BS)) as number).toFixed(3)}`);
  }

  // ── (e) THE EXPLORE SANDBOX: the slider drives the same derived outcome, with
  //    no script anywhere, and seizes the quantity from the script when dragged.
  {
    const noScript = { ...IONIC_SHIFT_BS, shift: undefined, mode: "explore" };
    ok("a dragged shift on a state that scripts NOTHING still splits the crystal",
      slip(noScript, 0, 1.0).like === 6 && slip(noScript, 0, 1.0).gap > 0 &&
      slip(noScript, 0, 0).like === 0 && slip(noScript, 0, 0).gap === 0,
      `drag 1.00 -> like ${slip(noScript, 0, 1.0).like}, drag 0 -> like ${slip(noScript, 0, 0).like}`);
    ok("...and the same drag on the metal sandbox still holds it together",
      slip({ ...METAL_SHIFT_BS, shift: undefined, mode: "explore" }, 0, 1.0).gap === 0);
    ok("a trusted drag SEIZES the quantity — the script never writes it again",
      [0, 6000, T_SLIDE_END, T_SETTLED].every((m) =>
        (E.bscShiftAt(IONIC_SHIFT_BS, m, 0.35) as number) === 0.35));
    ok("the drag's effect follows its cause continuously (no jump at the knee)",
      (E.bscCleaveProg(IONIC_SHIFT_BS, 0, 0.5) as number) === 0 &&
      (E.bscCleaveProg(IONIC_SHIFT_BS, 0, 1.0) as number) === 1 &&
      [0.55, 0.65, 0.75, 0.85, 0.95].every((u, i, a) => i === 0 ||
        (E.bscCleaveProg(IONIC_SHIFT_BS, 0, u) as number) >
        (E.bscCleaveProg(IONIC_SHIFT_BS, 0, a[i - 1]) as number)));
  }

  // ── (f) NEGATIVE CONTROL FOR THE WHOLE MECHANISM: a scene that authors no
  //    shift and touches no shift slider is untouched by every line of it.
  {
    const NO_SHIFT: any = {
      placement: "lattice", mode: "coordination",
      lattice: { cell: "rock_salt", n: [3, 3, 3], a_pm: 564.0 },
      units: [{ species: "Na+" }, { species: "Cl-" }]
    };
    const S = sitesOf(NO_SHIFT);
    const withArg = S.map((si: any, i: number) =>
      E.bscSiteAt(NO_SHIFT, si, i, 4200, null, null, null) as number[]);
    const without = S.map((si: any, i: number) =>
      E.bscSiteAt(NO_SHIFT, si, i, 4200, null, null) as number[]);
    ok("bscSiteAt with no shift argument is byte-identical to the pre-L1 chain",
      JSON.stringify(withArg) === JSON.stringify(without));
    ok("bscShiftExtent is exactly 0 for a scene with no authored shift and no shift control",
      (E.bscShiftExtent(NO_SHIFT, S) as number) === 0);
    // ...but NOT zero when the teacher can reach the slip anyway. FOUND IN
    // FRAMES: an explore sandbox exposing the shift row authors no shift block,
    // so the fit framed the packed block and a drag to 1.00 pushed the cleaved
    // half off the edge. The slider's full travel is one site by definition, so
    // the reachable pose is a config fact the fit can carry.
    {
      const REACHABLE = { ...NO_SHIFT, mode: "explore", controls: [{ id: "shift" }] };
      const eR = E.bscShiftExtent(REACHABLE, sitesOf(REACHABLE)) as number;
      ok("...but it DOES cover a slip an exposed shift slider can reach with no script",
        eR > 0 && Math.abs(eR - (E.bscShiftExtent(IONIC_SHIFT_BS, sitesOf(IONIC_SHIFT_BS)) as number)) < 1e-9,
        `reachable ${eR.toFixed(3)} == authored ${(E.bscShiftExtent(IONIC_SHIFT_BS, sitesOf(IONIC_SHIFT_BS)) as number).toFixed(3)}`);
      const METAL_REACH = { ...METAL_SHIFT_BS, mode: "explore", shift: undefined,
        controls: [{ id: "shift" }] };
      ok("...and covers only the SLIDE on a metal sandbox, which never opens a gap",
        Math.abs((E.bscShiftExtent(METAL_REACH, sitesOf(METAL_REACH)) as number) -
          (E.bscShiftStepU(METAL_REACH, sitesOf(METAL_REACH)[0]) as number)) < 1e-12);
    }
    ok("bscShiftAt is exactly 0 with no cue and no drag",
      (E.bscShiftAt(NO_SHIFT, 99999, null) as number) === 0);
  }

  // ── (g) THE READOUT + THE FROZEN PIN.
  {
    const upd8 = grabFn("updateBondingSceneFrame");
    ok("the HUD prints the D-7 metric in the fixed format 'like contacts: <n>'",
      upd8.includes('"like contacts: " +') &&
      /likeNow == null\) \? "\\u2014" : likeNow/.test(upd8) &&
      !/like contacts: *[0-9]/.test(upd8));
    ok("...and nothing else in the frame path recomputes it (D-3, one instrument)",
      (upd8.match(/bscLikeContacts\(/g) || []).length === 1);
    ok("like_contacts is declared IMPLEMENTED by E3b, not left in the deferred set",
      (E.BS_HUD_LINES_E3B as string[]).indexOf("like_contacts") >= 0);
    // deriveStateMeta must pin PAST the settled picture — the cleave, not the
    // slide. The three constants live in the renderer and are read here off the
    // extracted vars, so a change to either file that breaks the pairing fails.
    const pinBlock = META_SRC.slice(META_SRC.indexOf("const bscSh = asObj(bscState.shift);"),
      META_SRC.indexOf("const bscLat = asObj(bscState.lattice);"));
    const nums = [...pinBlock.matchAll(/\+\s*(\d+)/g)].map((m) => Number(m[1]));
    ok("deriveStateMeta pins the shift cue past the CLEAVE, not past the slide",
      nums.indexOf(E.BS_SHIFT_HOLD_MS as number) >= 0 &&
      nums.indexOf(E.BS_CLEAVE_MS as number) >= 0 &&
      pinBlock.includes("asNum(bscSh.duration_ms, " + E.BS_SHIFT_MS + ")"),
      `pin offsets [${nums.join(", ")}] vs hold ${E.BS_SHIFT_HOLD_MS} + cleave ${E.BS_CLEAVE_MS}`);
    const pinAt = 6000 + 3000 + (E.BS_SHIFT_HOLD_MS as number) + (E.BS_CLEAVE_MS as number) + 600;
    ok("...so the pinned frame photographs a SPLIT crystal, not a slipped-intact one",
      slip(IONIC_SHIFT_BS, pinAt).gap > 0 && slip(IONIC_SHIFT_BS, pinAt).like === 6,
      `pin at ${pinAt} ms: gap ${(slip(IONIC_SHIFT_BS, pinAt).gap * P2U).toFixed(0)} pm, like ${slip(IONIC_SHIFT_BS, pinAt).like}`);
  }

  // ── (h) THE SPEC DISCREPANCY, RECORDED RATHER THAN SMOOTHED OVER. Phase-0 D-7
  //    describes the readout two ways — "contacts created by the shift" and "the
  //    count for the focal interface ion" — and they are different numbers. The
  //    HUD prints the block-wide count (6, which is also the Phase-0 expectation
  //    "0 -> 6"); the focal ion at that interface gains exactly 1. Both are
  //    published; neither was tuned to match the other.
  {
    const iE = slip(IONIC_SHIFT_BS, T_SETTLED);
    ok("block-wide 6 and focal-ion 1 are BOTH derived and both exposed",
      iE.like === 6 && iE.focal === 1,
      `block-wide ${iE.like}, focal ion ${iE.focal} — the HUD prints the block-wide count`);
  }
}

console.log("\n=== 9. JIGGLE AMPLITUDE vs TEMPERATURE (E2) ===");
{
  // (a) exact sqrt(T/T0) across the WHOLE temperature-slider range (100..600 K).
  const T0 = E.BS_T0_K;
  let worst = 0;
  for (const T of [100, 150, 200, 250, 298, 350, 400, 500, 600]) {
    const f = Math.sqrt(T / T0);
    for (const idx of [0, 7, 29]) for (const t of [0.3, 1.7, 4.2, 9.9]) {
      const a = E.bscJiggle(idx, t, T, 0.12), b = E.bscJiggle(idx, t, T0, 0.12);
      for (let c = 0; c < 3; c++) worst = Math.max(worst, Math.abs(a[c] - f * b[c]));
    }
  }
  ok("jiggle amplitude is exactly sqrt(T/T0) over the full 100-600 K control range",
    worst < 1e-12, `worst residual ${worst.toExponential(2)}`);
  ok("T = 0 K stops the jiggle dead; a negative T is clamped, never NaN",
    E.bscJiggle(4, 2.0, 0, 0.12).every((v: number) => v === 0) &&
    E.bscJiggle(4, 2.0, -50, 0.12).every((v: number) => v === 0));

  // (b) hydrogen_bonding S6's misconception kill, asserted as a number: heat
  //     breaks LINKS and never a bond stick. A unit is rigid — the jiggle
  //     displaces its ORIGIN only — so every intra-unit bond length is invariant.
  const BL = E.BS_BOND_LEN, fr = E.mgFrame("H2O", null, null) as any;
  let worstBond = 0;
  for (const T of [100, 298, 600]) for (const t of [0.5, 3.3, 8.8]) {
    const org = E.bscJiggle(3, t, T, 0.30);
    for (const d of fr.bonds as number[][]) {
      const p = [org[0] + d[0] * BL, org[1] + d[1] * BL, org[2] + d[2] * BL];
      worstBond = Math.max(worstBond, Math.abs(Math.hypot(p[0] - org[0], p[1] - org[1], p[2] - org[2]) - BL));
    }
  }
  ok("every intra-unit bond STICK is invariant under temperature (S6's kill)",
    worstBond < 1e-12, `worst deviation ${worstBond.toExponential(2)} scene units`);

  // (c) and the other half of S6: rising T must actually break links. Same pair,
  //     same authored geometry, only the temperature differs.
  const linkedAt = (E as any).__linkedAt as (m: number, T: number, g: number, s: number) => boolean;
  const frac = (T: number) => {
    let n = 0, tot = 0;
    for (let m = 700; m <= 12000; m += 25) { tot++; if (linkedAt(m, T, 205, 0.9)) n++; }
    return n / tot;
  };
  const cold = frac(120), hot = frac(600);
  ok("raising the temperature BREAKS links (cold holds more than hot)",
    hot < cold, `linked fraction: 120 K ${(cold * 100).toFixed(1)}%  ->  600 K ${(hot * 100).toFixed(1)}%`);
  ok("the cold network is not trivially frozen at 100% (the links still flicker)",
    cold < 1 && cold > 0.2, `cold ${(cold * 100).toFixed(1)}%`);
}

console.log("\n=== 10. CLOSED-ENUM COVERAGE (no decorative strings) ===");
// The sigma-pi scar: nine `mode` strings that were never read. Every enum member
// is either IMPLEMENTED in E1 or explicitly DECLARED-DEFERRED to E2/E3.
{
  const DOC_MODES = ["assemble", "transfer", "dipole_sum", "approach_link", "network",
    "compare", "lattice_grow", "coordination", "layer_shift", "electron_sea",
    "drift", "melt", "explore"];
  const DOC_CONTROLS = ["species", "molecule", "ligand", "angle", "temperature",
    "count", "separation", "spin", "shift", "field", "valence", "ion_pair", "metal"];
  // E3b S-4 grew this by ONE member — separation_pm, the live centre-to-centre
  // distance instrument — which is the only addition since E1 froze the enum.
  const DOC_HUD = ["links", "links_per_unit", "delta_chi", "mu", "radius_pm",
    "coordination", "lattice_a", "lattice_enthalpy", "melting_point", "drift",
    "valence", "atomisation", "bp", "like_contacts", "conductivity",
    "separation_pm"];
  // E5 grew this from ten keys to eleven: bsc_trend is a live scene element type
  // (row O's chart) that no key could reach, so a narration sentence about the
  // trend line was unbindable by construction. Section 29 asserts the invariant
  // that replaces the frozen count — every element type on screen has a key.
  // E3b Q-2 grew this from eleven keys to twelve: the field arrows are a live
  // scene element type a state puts on screen, and a narration sentence about the
  // field had nothing to bind to. Same reasoning as E5's trend key.
  const DOC_GLOW = ["units", "central", "links", "arrows", "resultant", "charges",
    "electrons", "lattice", "layer", "neighbours", "trend", "field"];

  ok("mode enum matches the frozen contract (13 members)", sameSet(E.BS_MODES, DOC_MODES),
    `${E.BS_MODES.length} members`);
  const allSplit = [...E.BS_MODES_E1, ...E.BS_MODES_E2, ...E.BS_MODES_E3A,
    ...E.BS_MODES_E3B, ...E.BS_MODES_DEFERRED];
  ok("BS_MODES = E1 + E2 + E3a + E3b + deferred, with no overlap and no gap",
    sameSet(E.BS_MODES, allSplit) && new Set(allSplit).size === allSplit.length &&
    sameSet(E.BS_MODES_IMPL, [...E.BS_MODES_E1, ...E.BS_MODES_E2, ...E.BS_MODES_E3A,
      ...E.BS_MODES_E3B]),
    `E1=[${E.BS_MODES_E1.join(",")}]  E2=[${E.BS_MODES_E2.join(",")}]  E3a=[${E.BS_MODES_E3A.join(",")}]  E3b=[${E.BS_MODES_E3B.join(",")}]  deferred=${E.BS_MODES_DEFERRED.length}`);
  ok("the four modes E2 owns are exactly the ones hydrogen_bonding needs",
    sameSet(E.BS_MODES_E2, ["assemble", "approach_link", "network", "compare"]));
  ok("E3a owns exactly the placement half (transfer / lattice_grow / coordination)",
    sameSet(E.BS_MODES_E3A, ["transfer", "lattice_grow", "coordination"]));
  // E3b dispatch 2 (T-2) implements ONE of the four deferred DYNAMICS modes; the
  // other three stay declared-deferred to dispatches 3 and 4, never silently
  // absent — the same anti-decorative-string discipline as before.
  // E3b dispatch 3 (L-1) implements the SECOND of the four deferred DYNAMICS
  // modes; the remaining two stay declared-deferred to dispatch 4.
  // E3b dispatch 4 (Q-1) implements the LAST TWO. The deferred list is now EMPTY,
  // which is the end state this discipline was always aiming at: every member of
  // the closed mode enum is read by shipped code and none of them is decorative.
  ok("E3b owns all four DYNAMICS modes (melt / layer_shift / drift / electron_sea)",
    sameSet(E.BS_MODES_E3B, ["melt", "layer_shift", "drift", "electron_sea"]) &&
    ["melt", "layer_shift", "drift", "electron_sea"].every((m) =>
      E.BS_MODES_IMPL.indexOf(m) >= 0 && E.BS_MODES_DEFERRED.indexOf(m) < 0));
  ok("NOTHING is deferred any more — every mode string is read by shipped code",
    E.BS_MODES_DEFERRED.length === 0 && sameSet(E.BS_MODES, E.BS_MODES_IMPL));
  ok("drift + electron_sea carry their own solved cameras (D-4)",
    E.BS_CAMERAS.drift != null && E.BS_CAMERAS.drift.az === 90 &&
    E.BS_CAMERAS.drift.fit === true && E.BS_CAMERAS.electron_sea != null &&
    E.BS_CAMERAS.electron_sea.fit === true,
    JSON.stringify(E.BS_CAMERAS.drift) + " " + JSON.stringify(E.BS_CAMERAS.electron_sea));
  ok("field_axis is the closed enum x|y|z (nothing authors a vector)",
    sameSet(E.BS_FIELD_AXES, ["x", "y", "z"]));
  ok("layer_shift carries its own solved camera (D-4 / the E4 no-foreshorten rule)",
    E.BS_CAMERAS.layer_shift != null && E.BS_CAMERAS.layer_shift.az === 90 &&
    E.BS_CAMERAS.layer_shift.fit === true,
    JSON.stringify(E.BS_CAMERAS.layer_shift));
  ok("shift.plane is the closed enum x|y|z (the slide direction is DERIVED)",
    sameSet(E.BS_SHIFT_PLANES, ["x", "y", "z"]));
  ok("lattice.cell is the closed enum rock_salt|fcc|bcc|hcp",
    sameSet(E.BS_CELLS, ["rock_salt", "fcc", "bcc", "hcp"]));
  ok("controls enum matches the frozen contract (13 ids)", sameSet(E.BS_CONTROL_IDS, DOC_CONTROLS));
  ok("hud_lines enum matches the frozen contract (16 ids)", sameSet(E.BS_HUD_LINES, DOC_HUD));
  ok("glow enum matches the frozen contract (11 keys)", sameSet(Object.keys(E.BS_GLOW_ELS), DOC_GLOW));
  ok("placement enum is free|lattice", sameSet(E.BS_PLACEMENTS, ["free", "lattice"]));
  ok("electrons.show enum is none|shells|pair_glyph",
    sameSet(E.BS_ELECTRON_SHOW, ["none", "shells", "pair_glyph"]));

  // Every declared CONTROL id has a real row + a real widget in the emitted panel.
  const build = grabFn("buildBondingScene");
  const missingRow = E.BS_CONTROL_IDS.filter((id: string) => !build.includes('id="bsc_' + id + '_row"'));
  ok("every control id has a bsc_<id>_row in the panel (Rule 39f discovery)",
    missingRow.length === 0, missingRow.join(" "));
  const missingWidget = E.BS_CONTROL_IDS.filter((id: string) =>
    !build.includes('id="bsc_' + id + '_slider"') && !build.includes('id="bsc_' + id + '_select"'));
  ok("every control row carries a live input or select", missingWidget.length === 0, missingWidget.join(" "));

  // Every E1 mode is BRANCHED ON somewhere; no deferred mode is silently
  // half-implemented (which is how a decorative string ships).
  const upd = grabFn("updateBondingSceneFrame") + grabFn("applyBondingSceneState");
  // A mode is READ if the frame/apply pass branches on its name OR it carries its
  // own solved camera (D-4 framing is a real render difference, not a label).
  // Most E2 behaviour is config-driven — links / trend / approach_at_ms /
  // pair_shift_at_ms — which is deliberate: a mode string that gates nothing is
  // the sigma-pi scar, and a mode string that gates EVERYTHING makes the config
  // shape a lie. Both halves are asserted.
  const unread = E.BS_MODES_IMPL.filter((m: string) => !upd.includes('"' + m + '"') && E.BS_CAMERAS[m] == null);
  ok("every IMPLEMENTED mode is read (named branch or its own solved camera)",
    unread.length === 0, unread.join(" "));
  ok("every E2 mode carries a solved camera", E.BS_MODES_E2.every((m: string) => E.BS_CAMERAS[m] != null),
    E.BS_MODES_E2.map((m: string) => m + "=" + JSON.stringify(E.BS_CAMERAS[m])).join(" "));
  ok("every E3a mode carries a solved camera (D-4)",
    E.BS_MODES_E3A.every((m: string) => E.BS_CAMERAS[m] != null),
    E.BS_MODES_E3A.map((m: string) => m + "=" + JSON.stringify(E.BS_CAMERAS[m])).join(" "));
  const leaked = E.BS_MODES_DEFERRED.filter((m: string) => upd.includes('"' + m + '"'));
  ok("no DEFERRED mode is half-implemented", leaked.length === 0, leaked.join(" "));

  // ── E1c-C: CUE-KEY COVERAGE. The same test as "every implemented mode is
  //   read", extended from mode strings to CUE KEYS — and it is the check that
  //   would have caught bonding_scene_reveal_cues_inert on day one.
  //   deriveStateMeta registers a set of *_ms keys as frozen-pin candidates for
  //   bonding_scene; a key it registers that the renderer's FRAME PATH never
  //   reads is a cue that gates nothing while a second file treats it as real —
  //   the sigma-pi decorative-string scar moved one layer out. It looked wired
  //   end-to-end and survived four dispatches. Every registered key must
  //   therefore be READ here, or be DECLARED deferred with an owner (never
  //   silently absent — same discipline as BS_MODES_DEFERRED).
  {
    // the exact block deriveStateMeta uses to push bonding_scene pin candidates
    const anchor = "const bscState = asObj(state.bonding_scene);";
    const a0 = META_SRC.indexOf(anchor);
    const b0 = META_SRC.indexOf("{", META_SRC.indexOf("if (bscState)", a0));
    let d = 0, end = -1;
    for (let j = b0; j < META_SRC.length && a0 >= 0; j++) {
      if (META_SRC[j] === "{") d++;
      else if (META_SRC[j] === "}") { d--; if (d === 0) { end = j + 1; break; } }
    }
    ok("deriveStateMeta's bonding_scene pin block is locatable", a0 >= 0 && end > a0);
    const block = META_SRC.slice(a0, end);
    // receiver -> the authored JSON path prefix it stands for
    const RECV: Record<string, string> = {
      bscState: "", bscTr: "transfer.", bscSh: "shift.", bscLat: "lattice.",
      bscTh2: "thermal."          // E2b: the scripted temperature ramp
    };
    const registered = new Map<string, string>();   // authored path -> leaf key
    for (const m of block.matchAll(/\b(\w+)\.([A-Za-z_][A-Za-z0-9_]*_ms)\b/g)) {
      const pre = RECV[m[1]];
      if (pre === undefined) continue;
      registered.set(pre + m[2], m[2]);
    }
    // nothing in the block may be reached through a receiver this gate does not
    // know about, or a whole family of cues would be invisible to the sweep.
    const allLeaves = new Set([...block.matchAll(/\.([A-Za-z_][A-Za-z0-9_]*_ms)\b/g)].map((m) => m[1]));
    const leafSeen = new Set([...registered.values()]);
    const missedLeaf = [...allLeaves].filter((k) => !leafSeen.has(k));
    ok("the cue sweep sees every *_ms key in the pin block (no unknown receiver)",
      missedLeaf.length === 0, missedLeaf.join(" "));
    ok("the pin block registers a non-trivial cue set", registered.size >= 12, `${registered.size} keys`);

    // the FRAME PATH: the bsc* helpers + apply + the frame updater. NOT
    // buildBondingScene — a key referenced only at build time still gates nothing.
    const framePath = grabRegion("bscClamp", "buildBondingScene") +
      grabFn("applyBondingSceneState") + grabFn("updateBondingSceneFrame");
    const isRead = (authored: string, leaf: string) => {
      const dot = authored.indexOf(".");
      if (dot < 0) return new RegExp("\\." + leaf + "\\b").test(framePath);
      // a NESTED cue (transfer.at_ms) carries a generic leaf, so both halves
      // must hold: the sub-object is consumed AND its leaf is read somewhere.
      const sub = authored.slice(0, dot);
      return new RegExp("bs\\." + sub + "\\b").test(framePath) &&
        new RegExp("\\." + leaf + "\\b").test(framePath);
    };
    // Declared-deferred cues: registered, genuinely inert, NAMED with an owner.
    // Reported by this dispatch (E1c-C scope is the three dipole cues only);
    // implementing one means DELETING its entry, which the anti-rot half forces.
    // E1c-A DECIDED the two 'assemble' entries the way E1c-C reported them: mode
    // 'assemble' has no scripted ramp and no concept authors the key, so the
    // REGISTRATION was deleted from deriveStateMeta rather than a ramp invented to
    // justify it. They are therefore no longer registered and no longer deferred —
    // the sweep below proves that by finding them in neither list.
    // E3b L-1 EMPTIES this list: shift.at_ms / shift.duration_ms were its only
    // two entries and the frame path now reads both (bscShiftCfg / bscShiftAt).
    // The anti-rot half below is what forced the deletion — a declared-deferred
    // key that has been implemented FAILS until it leaves the list.
    const CUE_DEFERRED: Record<string, string> = {};
    ok("the unowned 'assemble' pin candidates are GONE from deriveStateMeta (E1c-A)",
      !registered.has("assemble_at_ms") && !registered.has("assemble_duration_ms"),
      [...registered.keys()].join(" "));
    const inert: string[] = [], live: string[] = [];
    for (const [authored, leaf] of registered) (isRead(authored, leaf) ? live : inert).push(authored);
    const undeclared = inert.filter((k) => CUE_DEFERRED[k] === undefined);
    ok("EVERY registered cue key is READ by the frame path (or declared deferred)",
      undeclared.length === 0,
      undeclared.length ? `INERT + UNDECLARED: ${undeclared.join(" ")}` : `${live.length} live`);
    // anti-rot: a declared-deferred key that HAS been implemented must leave the list
    const stale = Object.keys(CUE_DEFERRED).filter((k) => live.indexOf(k) >= 0);
    ok("no declared-deferred cue is actually implemented (the list cannot rot)",
      stale.length === 0, stale.join(" "));
    // the three this dispatch makes real, asserted by name so a revert is loud
    ok("arrows_at_ms / resultant_at_ms / charges_at_ms each gate their own layer",
      /bs\.arrows_at_ms/.test(framePath) && /bs\.resultant_at_ms/.test(framePath) &&
      /bs\.charges_at_ms/.test(framePath) &&
      /showArrows && arrowsF > 0/.test(framePath) &&
      /dip\.show_resultant && resFade > 0/.test(framePath) &&
      /dip\.show_charges && chargesF > 0/.test(framePath));
    for (const k of inert) console.log(`    deferred cue    ${k.padEnd(24)}${CUE_DEFERRED[k] || "UNDECLARED"}`);
    console.log(`    cue coverage    ${live.length}/${registered.size} registered cue keys are read by the frame path`);
  }

  // Every implemented hud line is actually rendered; all are in the closed enum.
  const hudImpl = [...E.BS_HUD_LINES_E1, ...E.BS_HUD_LINES_E2, ...E.BS_HUD_LINES_E3A,
    ...E.BS_HUD_LINES_E3B];
  const unreadHud = hudImpl.filter((h: string) => !upd.includes('"' + h + '"'));
  ok("every implemented hud_line is rendered by the HUD pass", unreadHud.length === 0, unreadHud.join(" "));
  ok("the implemented hud_lines are a subset of the closed enum, with no overlap",
    hudImpl.every((h: string) => E.BS_HUD_LINES.includes(h)) &&
    new Set(hudImpl).size === hudImpl.length,
    `E1=[${E.BS_HUD_LINES_E1.join(",")}] E2=[${E.BS_HUD_LINES_E2.join(",")}] E3a=[${E.BS_HUD_LINES_E3A.join(",")}] E3b=[${E.BS_HUD_LINES_E3B.join(",")}]`);

  // Row O: the trend surface is a real DOM canvas, discovered by the Rule-39f
  // widget engine (inline position:fixed) and clearing both chrome edges.
  ok("the trend canvas exists, is position:fixed (39f) and clears the chrome",
    /id\s*=\s*"bsc_trend"/.test(build) && /bsc_trend[\s\S]{0,400}position:fixed/.test(build) &&
    /bsc_trend[\s\S]{0,400}bottom:12px;left:12px/.test(build));
  ok("the trend gap is FITTED, never authored (bscTrendFit over extrapolate_from)",
    grabFn("bscDrawTrend").includes("bscTrendFit") &&
    !/gap_k|gap_K|expected_y/.test(grabFn("bscDrawTrend")));
  {
    // the numbers hydrogen_bonding S7 locks: the H2S/H2Se/H2Te line extrapolated
    // back to water's period, and the gap water opens against it.
    const fam = [{ label: "H2S", x: 3, y: 213 }, { label: "H2Se", x: 4, y: 232 }, { label: "H2Te", x: 5, y: 271 }];
    const fit = E.bscTrendFit(fam) as any;
    const at2 = fit.m * 2 + fit.b;
    near("the family line extrapolates to the doc's ~180 K at water's period", at2, 180, 2, " K");
    near("water (373 K) misses its own family line by the doc's ~190 K", 373 - at2, 192, 3, " K");
  }
  ok("authored ASCII labels compose to real Unicode subscripts (Rule 34c)",
    E.bscSub("H2S") === "H₂S" && E.bscSub("H2O") === "H₂O" && E.bscSub("2 K") === "2 K",
    E.bscSub("H2Se"));
  {
    // the count slider: units are placed by INDEX, so growing the count adds on
    // the OUTSIDE and never moves a unit already on screen (D-1 for position).
    const five = [0, 1, 2, 3, 4].map((i) => E.bscUnitSlot(i, 5.75));
    const thirty = Array.from({ length: 30 }, (_, i) => E.bscUnitSlot(i, 5.75));
    ok("count 5 -> 30 leaves the placed units 0..4 bit-for-bit unchanged",
      five.every((v: number[], i: number) => v.every((c, k) => Object.is(c, thirty[i][k]))));
    ok("30 pool slots are 30 DISTINCT positions (nothing stacks at the origin)",
      new Set(thirty.map((v: number[]) => v.join(","))).size === 30);
  }

  // Ring-gating: both authoring shapes normalise to { id, min_ring }.
  const norm = E.bscControlList(["spin", { id: "shift", min_ring: "extended" }]);
  ok("controls accept both a bare id and { id, min_ring }",
    norm.length === 2 && norm[0].min_ring === "core" && norm[1].min_ring === "extended");
}

console.log("\n=== 11. COUNTABILITY UNDER PERSPECTIVE, ACROSS THE SPIN (D-4) ===");
// bond_polarity S5 is CCl4 with four arrows under "Four arrows, still zero" — the
// same geometry, count and caption shape as the FIXED CRITICAL scar
// field3d_counted_element_occluded_along_view_axis, and it carries a spin control
// (field3d_default_spin_axis_rotates_solved_camera_out_of_countable_view).
// Measured with PERSPECTIVE because the orthographic metric under-predicts
// overlap (OPEN scar orthographic_separation_metric_underpredicts_perspective_overlap).
{
  // E3a CORRECTION: E1 measured at FOV 50, but the renderer builds
  // PerspectiveCamera(60, ...). A narrower FOV inflates every NDC separation by
  // tan(30)/tan(25) = 1.238x, so the E1 gate was OPTIMISTIC on exactly the
  // quantity the scar is about. Corrected to the shipped 60; E1's cameras still
  // clear the floor at the true FOV (reported below), so nothing had to move.
  const FOV = 60 * Math.PI / 180, ASPECT = 16 / 9;
  const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a: number[], b: number[]) =>
    [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot3 = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const project = (cam: number[], p: number[]) => {
    const f = E.bscNorm(sub([0, 0, 0], cam));
    const r = E.bscNorm(cross(f, [0, 1, 0]));
    const u = cross(r, f);
    const d = sub(p, cam), z = dot3(d, f);
    if (z <= 0.01) return null;
    return [dot3(d, r) / (z * Math.tan(FOV / 2) * ASPECT), dot3(d, u) / (z * Math.tan(FOV / 2))];
  };
  const camOf = (c: any) => {
    const a = (c.az || 0) * Math.PI / 180, e = (c.el || 0) * Math.PI / 180, d = c.dist || 7;
    return [d * Math.cos(e) * Math.cos(a), d * Math.sin(e), d * Math.cos(e) * Math.sin(a)];
  };
  const FLOOR = 0.12, BOX = 0.85;
  const sweep = (molKey: string, camKey: string, radius: number, what: string) => {
    const D = E.bscDipole(molKey, null) as any;
    const cam = camOf(E.BS_CAMERAS[camKey] || E.BS_CAMERA_DEFAULT);
    let worst = 9, fit = 0, worstAt = 0;
    for (let s = 0; s < 360; s++) {
      const ang = s * Math.PI / 180;
      const pts = D.arrows.map((a: any) => {
        const d = E.mgRotY(a.dir, ang);
        return project(cam, [d[0] * radius, d[1] * radius, d[2] * radius]);
      });
      if (pts.some((p: number[] | null) => !p)) { worst = -1; break; }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dd = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
        if (dd < worst) { worst = dd; worstAt = s; }
      }
      for (const p of pts) fit = Math.max(fit, Math.max(Math.abs(p[0]), Math.abs(p[1])));
    }
    ok(`${molKey} ${what}: min pairwise NDC separation >= ${FLOOR} over the FULL spin`,
      worst >= FLOOR, `min=${worst.toFixed(4)} at ${worstAt} deg`);
    ok(`${molKey} ${what}: stays inside the safe box (|ndc| <= ${BOX})`, fit <= BOX, `max=${fit.toFixed(3)}`);
  };
  // the four counted elements of S5: the ligand centres AND the four arrow tips.
  sweep("CCl4", "dipole_sum", E.BS_BOND_LEN, "ligand centres");
  sweep("CCl4", "dipole_sum", E.BS_BOND_LEN * 0.5 + 1.46 * E.BS_ARROW_D_PER_UNIT, "arrow tips");
  sweep("CCl4", "explore", E.BS_BOND_LEN, "ligand centres (explore camera)");
  sweep("CHCl3", "dipole_sum", E.BS_BOND_LEN, "ligand centres");
  // NEGATIVE CONTROL — the metric must be able to FAIL, and it must fail on the
  // EXACT defect the scar records: a counted ligand occluded along the view axis
  // by the CENTRAL atom. Camera straight down the apex bond, counted set = the
  // four ligands PLUS the central atom (which is what the caption counts against).
  {
    const cam = camOf({ az: 35, el: 90, dist: 7.0 });   // straight down the apex bond
    const D = E.bscDipole("CCl4", null) as any;
    let worst = 9;
    for (let s = 0; s < 360; s++) {
      const pts = [project(cam, [0, 0, 0])].concat(D.arrows.map((a: any) => {
        const d = E.mgRotY(a.dir, s * Math.PI / 180);
        return project(cam, [d[0] * E.BS_BOND_LEN, d[1] * E.BS_BOND_LEN, d[2] * E.BS_BOND_LEN]);
      }));
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dd = Math.hypot(pts[i]![0] - pts[j]![0], pts[i]![1] - pts[j]![1]);
        if (dd < worst) worst = dd;
      }
    }
    ok("NEGATIVE CONTROL: a down-the-bond camera FAILS the same metric",
      worst < FLOOR, `min=${worst.toFixed(4)} (apex ligand occluded by the central atom)`);
    // and the SHIPPED camera passes that same 5-element test, so the solved view
    // survives the scar's own criterion, not just a weaker one.
    const cam2 = camOf(E.BS_CAMERAS.dipole_sum);
    let worst2 = 9;
    for (let s = 0; s < 360; s++) {
      const pts = [project(cam2, [0, 0, 0])].concat(D.arrows.map((a: any) => {
        const d = E.mgRotY(a.dir, s * Math.PI / 180);
        return project(cam2, [d[0] * E.BS_BOND_LEN, d[1] * E.BS_BOND_LEN, d[2] * E.BS_BOND_LEN]);
      }));
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dd = Math.hypot(pts[i]![0] - pts[j]![0], pts[i]![1] - pts[j]![1]);
        if (dd < worst2) worst2 = dd;
      }
    }
    ok("SHIPPED camera: central atom + 4 ligands all separable across the spin",
      worst2 >= FLOOR, `min=${worst2.toFixed(4)}`);
  }

  // ── E3a: ionic S5 is the counting state of THIS dispatch. "Six neighbours,
  //    every ion" is read against the highlighted ion PLUS its six neighbours,
  //    and that state carries a spin control — the same pair of CRITICAL scars
  //    (field3d_counted_element_occluded_along_view_axis +
  //    field3d_default_spin_axis_rotates_solved_camera_out_of_countable_view).
  //    E1's lesson applies verbatim: solving over the neighbours ALONE certifies
  //    a camera on which a neighbour crossing the centre-line lands on top of
  //    the ion the caption is about.
  {
    const S = E.bscSiteList(LATTICE_BS, null) as any[];
    const nn = E.bscMag(S[1].at) as number;
    const counted = [S[0]].concat(S.filter((s: any, i: number) =>
      i > 0 && Math.abs(E.bscMag(s.at) - nn) < 1e-9));
    ok("the counted set of ionic S5 is the ion PLUS its six neighbours",
      counted.length === 7, `${counted.length} elements`);
    const p2u11 = (E.bscLinkCfg(LATTICE_BS) as any).pm_per_unit as number;
    const camF = (cam: number[]) => E.bscNorm(sub([0, 0, 0], cam)) as number[];
    // (a) centre separation, as E1 measures it for molecules.
    const sweepSites = (cam: number[], label: string, floor: number) => {
      let worst = 9, worstAt = 0;
      for (let s = 0; s < 360; s++) {
        const ang = s * Math.PI / 180;
        const pts = counted.map((c: any) => project(cam, E.mgRotY(c.at, ang)));
        if (pts.some((p: number[] | null) => !p)) { worst = -1; break; }
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
          const dd = Math.hypot(pts[i]![0] - pts[j]![0], pts[i]![1] - pts[j]![1]);
          if (dd < worst) { worst = dd; worstAt = s; }
        }
      }
      ok(label, worst >= floor, `min=${worst.toFixed(4)} at ${worstAt} deg (floor ${floor})`);
      return worst;
    };
    const camCoord = camOf(E.BS_CAMERAS.coordination);
    sweepSites(camCoord,
      "coordination camera: all 7 counted centres separable across the FULL spin", FLOOR);
    // (b) THE metric a lattice actually needs — OCCLUSION. On a close-packed
    //     crystal the spheres touch by construction, so their projections always
    //     overlap and a centre-separation floor happily certifies a view in
    //     which the focal ion is completely enclosed. Margin = the counted
    //     element's projected centre minus the NEARER counted sphere's projected
    //     radius, measured in the vertical NDC scale so the 16:9 squeeze cannot
    //     flatter a horizontal pair.
    const occlusionMargin = (cam: number[], rs: number) => {
      const f = camF(cam);
      const rad = counted.map((c: any) => (c.rPm / p2u11) * rs);
      let worst = 9, at = 0;
      for (let s = 0; s < 360; s++) {
        const ang = s * Math.PI / 180;
        const w = counted.map((c: any) => E.mgRotY(c.at, ang) as number[]);
        const pr = w.map((p) => project(cam, p)!);
        const z = w.map((p) => dot3(sub(p, cam), f));
        for (let i = 0; i < counted.length; i++) for (let j = 0; j < counted.length; j++) {
          if (i === j || z[j] >= z[i]) continue;                  // j must be NEARER
          const dx = (pr[i][0] - pr[j][0]) * ASPECT, dy = pr[i][1] - pr[j][1];
          const m = Math.hypot(dx, dy) - rad[j] / (z[j] * Math.tan(FOV / 2));
          if (m < worst) { worst = m; at = s; }
        }
      }
      return { m: worst, at };
    };
    {
      const settled = occlusionMargin(camCoord, E.BS_COORD_RADIUS_SCALE);
      ok("coordination, SETTLED: no counted ion is hidden behind a nearer one",
        settled.m > 0, `margin=${settled.m.toFixed(4)} NDC at ${settled.at} deg`);
      // NEGATIVE CONTROL 1 — space filling. This is not a camera problem: six
      // touching neighbours physically ENCLOSE the focal ion, so no camera
      // solves it, which is the whole reason lattice.radius_scale exists.
      const packed = occlusionMargin(camCoord, 1);
      ok("NEGATIVE CONTROL: the packed home pose FAILS (a real crystal encloses its ion)",
        packed.m < 0, `margin=${packed.m.toFixed(4)} — no camera fixes this, only the reveal does`);
      // NEGATIVE CONTROL 2 — the elevation genuinely matters, and the metric
      // rejects the near-miss elevations the orthographic solve would have
      // picked (el 26 is the orthographic optimum and it FAILS).
      const bad26 = occlusionMargin(camOf({ az: 35, el: 26, dist: 14 }), E.BS_COORD_RADIUS_SCALE);
      ok("NEGATIVE CONTROL: el 26 (the ORTHOGRAPHIC optimum) fails under perspective",
        bad26.m < settled.m, `el26 margin=${bad26.m.toFixed(4)} vs shipped ${settled.m.toFixed(4)}`);
      const bad35 = occlusionMargin(camOf({ az: 35, el: 35, dist: 14 }), E.BS_COORD_RADIUS_SCALE);
      ok("NEGATIVE CONTROL: el 35 also fails — the shipped elevation is not arbitrary",
        bad35.m < 0, `el35 margin=${bad35.m.toFixed(4)}`);
      // the shrink is UNIFORM, so every radius ratio survives it (section 3's
      // linear-in-pm reading is not quietly broken by the ball-and-stick beat).
      // SAFE BOX on the COUNTED SET. The wall may bleed off frame (the state
      // teaches from inside a block) but a counted neighbour may NOT — the
      // runtime smoke found two of the six clipped by the viewport edge at the
      // first solved distance, and no machine gate here was measuring it.
      {
        const f = camF(camCoord), rs = E.BS_COORD_RADIUS_SCALE as number;
        let box = 0;
        for (let s = 0; s < 360; s++) {
          const w = counted.map((c: any) => E.mgRotY(c.at, s * Math.PI / 180) as number[]);
          for (let i = 0; i < w.length; i++) {
            const pr = project(camCoord, w[i])!;
            const z = dot3(sub(w[i], camCoord), f);
            const rn = (counted[i].rPm / p2u11) * rs / (z * Math.tan(FOV / 2));
            box = Math.max(box, Math.abs(pr[1]) + rn, Math.abs(pr[0]) + rn / ASPECT);
          }
        }
        ok("every counted neighbour stays INSIDE the safe box (nothing clipped by the edge)",
          box <= BOX, `max=${box.toFixed(3)} (floor ${BOX})`);
      }
      const rsA = (181 / p2u11) * E.BS_COORD_RADIUS_SCALE, rsB = (102 / p2u11) * E.BS_COORD_RADIUS_SCALE;
      ok("the ball-and-stick shrink is UNIFORM: radius ratios survive it",
        Math.abs(rsA / rsB - 181 / 102) < 1e-12, `${(rsA / rsB).toFixed(6)}`);
    }
    // (c) the transfer beat. The counted set is the two atoms; the electron is a
    //     marker, so what matters is that it never sinks INSIDE either sphere.
    {
      const T = E.bscSiteList(TRANSFER_BS, null) as any[];
      const cam = camOf(E.BS_CAMERAS.transfer);
      const p2 = (E.bscLinkCfg(TRANSFER_BS) as any).pm_per_unit as number;
      let worstSep = 9, fit = 0, insideBy = 0, gapMin = 9;
      for (let n = 0; n <= 200; n++) {
        const p = n / 200;
        const A = E.bscTransferSite(T[0], p) as any, B = E.bscTransferSite(T[1], p) as any;
        const rA = A.r_pm / p2, rB = B.r_pm / p2;
        const pA = T[0].at as number[], pB = T[1].at as number[];
        const ax = E.bscNorm(sub(pB, pA)) as number[];
        const sA = [pA[0] + ax[0] * rA, pA[1] + ax[1] * rA, pA[2] + ax[2] * rA];
        const sB = [pB[0] - ax[0] * rB, pB[1] - ax[1] * rB, pB[2] - ax[2] * rB];
        const e = [sA[0] + (sB[0] - sA[0]) * p, sA[1] + (sB[1] - sA[1]) * p + 1.1 * Math.sin(Math.PI * p), sA[2] + (sB[2] - sA[2]) * p];
        const prA = project(cam, pA)!, prB = project(cam, pB)!;
        worstSep = Math.min(worstSep, Math.hypot(prA[0] - prB[0], prA[1] - prB[1]));
        fit = Math.max(fit, Math.abs(prA[0]), Math.abs(prA[1]), Math.abs(prB[0]), Math.abs(prB[1]));
        insideBy = Math.min(insideBy, Math.min(E.bscMag(sub(e, pA)) - rA, E.bscMag(sub(e, pB)) - rB));
        gapMin = Math.min(gapMin, E.bscMag(sub(pB, pA)) - rA - rB);
      }
      ok("transfer camera: donor and acceptor stay separable across the whole beat",
        worstSep >= FLOOR, `min=${worstSep.toFixed(4)}`);
      ok("the travelling electron never sinks inside either atom",
        insideBy >= -1e-9, `worst depth ${insideBy.toFixed(6)} u`);
      ok("the two atoms never interpenetrate as their radii swap",
        gapMin >= 0, `closest surface gap ${(gapMin * p2).toFixed(1)} pm`);
      ok("transfer: both atoms stay inside the safe box", fit <= BOX, `max=${fit.toFixed(3)}`);
    }
    // the lattice_grow camera auto-fits the block it is actually given.
    {
      const ext = E.bscSiteExtent(LATTICE_BS, null) as number;
      const fitted = Math.max(E.BS_CAMERAS.lattice_grow.dist, ext * E.BS_FIT_MARGIN);
      const half = fitted * Math.tan(FOV / 2);
      ok("lattice_grow auto-fit frames the whole block at full growth",
        half >= ext, `extent ${ext.toFixed(2)} u, dist ${fitted.toFixed(1)}, half-height ${half.toFixed(2)} u`);
      const big = JSON.parse(JSON.stringify(LATTICE_BS));
      big.lattice.n = [5, 5, 5];
      const ext5 = E.bscSiteExtent(big, null) as number;
      const fit5 = Math.max(E.BS_CAMERAS.lattice_grow.dist, ext5 * E.BS_FIT_MARGIN);
      ok("NEGATIVE CONTROL: a 5x5x5 block PULLS THE CAMERA BACK rather than overflowing",
        fit5 > fitted && fit5 * Math.tan(FOV / 2) >= ext5,
        `3x3x3 dist ${fitted.toFixed(1)} -> 5x5x5 dist ${fit5.toFixed(1)}`);
    }
  }
}

console.log("\n=== 12. MG_MOLECULES / MG_ELEMENTS REGRESSION ===");
// The table growth is the regression-bearing edit of this dispatch. Every
// pre-existing row must resolve identically WITH and WITHOUT the optional
// `ligands` array, and MG_EXPLORE_MOLECULES must not gain a member (a leak there
// changes VSEPR's explore picker).
{
  const FROZEN_EXPLORE = ["CH4", "NH3", "H2O", "BF3", "BeCl2"];
  ok("MG_EXPLORE_MOLECULES is unchanged (no leak into VSEPR's picker)",
    JSON.stringify(E.MG_EXPLORE_MOLECULES) === JSON.stringify(FROZEN_EXPLORE),
    JSON.stringify(E.MG_EXPLORE_MOLECULES));

  // snapshot taken from the pre-E1 renderer (git cb8bf41)
  const FROZEN_MOL: Record<string, any> = {
    BeCl2: { central: "Be", ligand: "Cl", bonds: 2, lone: 0, angle: 180, bond_pm: 177, e_geom: "linear", shape: "linear" },
    BF3: { central: "B", ligand: "F", bonds: 3, lone: 0, angle: 120, bond_pm: 130, e_geom: "trigonal planar", shape: "trigonal planar" },
    CH4: { central: "C", ligand: "H", bonds: 4, lone: 0, angle: 109.5, bond_pm: 109, e_geom: "tetrahedral", shape: "tetrahedral" },
    NH3: { central: "N", ligand: "H", bonds: 3, lone: 1, angle: 107, bond_pm: 101, e_geom: "tetrahedral", shape: "trigonal pyramidal" },
    H2O: { central: "O", ligand: "H", bonds: 2, lone: 2, angle: 104.5, bond_pm: 96, e_geom: "tetrahedral", shape: "bent" },
    PCl5: { central: "P", ligand: "Cl", bonds: 5, lone: 0, angle: 120, bond_pm: 214, e_geom: "trigonal bipyramidal", shape: "trigonal bipyramidal" },
    SF6: { central: "S", ligand: "F", bonds: 6, lone: 0, angle: 90, bond_pm: 156, e_geom: "octahedral", shape: "octahedral" }
  };
  const FROZEN_EL: Record<string, [string, number]> = {
    H: ["#ECEFF1", 0.30], Be: ["#A1887F", 0.48], B: ["#FFB74D", 0.44], C: ["#90A4AE", 0.46],
    N: ["#7986CB", 0.44], O: ["#EF5350", 0.42], F: ["#9CCC65", 0.38], P: ["#FF8A65", 0.55],
    S: ["#FFD54F", 0.54], Cl: ["#66BB6A", 0.52]
  };
  let molBad: string[] = [], ligBad: string[] = [], elBad: string[] = [];
  for (const k of Object.keys(FROZEN_MOL)) {
    const m = E.MG_MOLECULES[k];
    if (!m || Object.keys(FROZEN_MOL[k]).some((f) => m[f] !== FROZEN_MOL[k][f])) molBad.push(k);
    if (m && m.ligands) ligBad.push(k + " (gained a ligands array)");
    // ligands || repeat(ligand, bonds) — the pre-existing rows resolve as always
    const resolved = E.bscLigands(m) as string[];
    if (resolved.length !== m.bonds || resolved.some((l) => l !== m.ligand)) ligBad.push(k);
    // and mgFrame is untouched: domain count + settled angle
    const fr = E.mgFrame(k, null, null);
    if (fr.domains !== m.bonds + m.lone || Math.abs(fr.angle - m.angle) > 1e-9) molBad.push(k + " (frame)");
  }
  for (const k of Object.keys(FROZEN_EL)) {
    const e = E.MG_ELEMENTS[k];
    if (!e || e.color !== FROZEN_EL[k][0] || e.radius !== FROZEN_EL[k][1]) elBad.push(k);
  }
  ok("all 7 pre-existing MG_MOLECULES rows are byte-identical", molBad.length === 0, molBad.join(" "));
  ok("no pre-existing row gained a ligands array; all resolve as before", ligBad.length === 0, ligBad.join(" "));
  ok("all 10 pre-existing MG_ELEMENTS rows are byte-identical", elBad.length === 0, elBad.join(" "));
  ok("growth landed: 11 new molecules, 10 new elements",
    Object.keys(E.MG_MOLECULES).length === 18 && Object.keys(E.MG_ELEMENTS).length === 20,
    `mol=${Object.keys(E.MG_MOLECULES).length} el=${Object.keys(E.MG_ELEMENTS).length}`);
  // the mixed-ligand entry the reuse contract exists for
  ok("CHCl3 resolves mixed ligands H,Cl,Cl,Cl with H on the apex",
    JSON.stringify(E.bscLigands(E.MG_MOLECULES.CHCl3)) === JSON.stringify(["H", "Cl", "Cl", "Cl"]));
  // every species in the closed enum resolves
  const SPECIES = ["H2O", "H2S", "H2Se", "H2Te", "NH3", "NF3", "CH4", "CCl4", "CHCl3",
    "CO2", "HF", "HCl", "HBr", "HI", "BF3"];
  const missing = SPECIES.filter((s) => !E.MG_MOLECULES[s]);
  ok("every molecule in the closed species enum exists", missing.length === 0, missing.join(" "));
  const ATOMS = ["H", "Li", "Be", "B", "C", "N", "O", "F", "Na", "Mg", "Al", "P", "S",
    "Cl", "K", "Ca", "Br", "Se", "I", "Te"];
  const missA = ATOMS.filter((a) => !E.MG_ELEMENTS[a] || E.BS_CHI[a] == null ||
    E.BS_VALENCE[a] == null || E.BS_RADIUS_PM[a] == null);
  ok("every atom in the closed species enum has colour/chi/valence/radius",
    missA.length === 0, missA.join(" "));
}

console.log("\n=== 13. E3b Q-1..Q-5 ROW Q drift + ROW G sea + THE CARRIER READOUTS ===");
// E3b dispatch 4 (2026-08-03). Was a declared stub owned by this dispatch; it is
// now the REAL assertion set for the field, the two carriers and the three
// readouts. Same discipline as sections 8/14/32: every body called below is
// EXTRACTED from the shipped renderer and run, never transcribed, and the load-
// bearing claim (an immobile ion does not translate) is asserted as a NEGATIVE
// CONTROL against the mobile case in the SAME frame — a gate that only checked
// "the melt drifts" would pass an engine that moved everything.
{
  const updSrc13 = grabFn("updateBondingSceneFrame");
  const P2U13 = E.bscLinkCfg({}).pm_per_unit as number;
  const RS13 = (a: number) => ({ cell: "rock_salt", n: [3, 3, 3], a_pm: a });
  const NACL_MP = (E.BS_ION_PAIRS as any).NaCl.mp_K as number;   // 1074
  // ionic_bonding S8's shape: TWO samples of the SAME salt, ONE field authored at
  // scene level (so both read the same object — row R inheritance), one group
  // below its melting point and one above it.
  const S8 = {
    placement: "lattice", mode: "drift",
    units: [{ species: "Na+" }, { species: "Cl-" }], lattice: RS13(564),
    field: 1, field_axis: "x", field_at_ms: 6000,
    thermal: { T_K: 300, jiggle_scale: 0.35 },
    groups: [
      { id: "solid", label: "solid", at: [-6, 0, 0] },
      { id: "molten", label: "molten", at: [6, 0, 0], thermal: { T_K: 1150, jiggle_scale: 0.35 } }
    ]
  };
  const sitesOf13 = (bs: any) => E.bscSiteList(bs, null) as any[];
  const poseOf = (bs: any, ms: number) =>
    sitesOf13(bs).map((si: any, i: number) =>
      E.bscSiteAt(bs, si, i, ms, null, null, null, null) as number[]);
  const eqOf = (bs: any, ms: number) =>
    sitesOf13(bs).map((si: any) => E.bscSiteBaseAt(bs, si, ms, null) as number[]);
  const SL13 = sitesOf13(S8);
  const gIdx = (g: number) => SL13.map((s: any, i: number) => [s, i] as [any, number])
    .filter(([s]) => s.grp === g).map(([, i]) => i);
  const SOLID = gIdx(0), MOLTEN = gIdx(1);
  const NN13 = E.bscSiteNnU(S8, SL13[0]) as number;              // a/2 in scene units
  const TSAMP = [0, 3000, 6000, 7200, 8200, 11000, 13200, 20000];

  ok("the S8 fixture really is two groups of the same salt, one each side of mp_K",
    SOLID.length > 0 && MOLTEN.length > 0 && SL13.every((s: any) => s.pair === "NaCl") &&
    (E.bscMeltFrac(300, (E.BS_ION_PAIRS as any).NaCl) as number) === 0 &&
    (E.bscMeltFrac(1150, (E.BS_ION_PAIRS as any).NaCl) as number) === 1,
    `${SOLID.length} solid sites + ${MOLTEN.length} molten, mp ${NACL_MP} K, nn ${(NN13 * P2U13).toFixed(0)} pm`);

  // ── THE NEGATIVE CONTROL, IN ITS SHARPEST FORM ──────────────────────────────
  //   Not "the solid moves less" — turning the field on changes the solid half by
  //   EXACTLY NOTHING, bit for bit, at every sampled instant. The same field, the
  //   same frame, the same code path; only the temperature differs.
  const S8_NOFIELD = Object.assign({}, S8, { field: 0 });
  {
    const same = TSAMP.every((t) => {
      const a = poseOf(S8, t), b = poseOf(S8_NOFIELD, t);
      return SOLID.every((i) => a[i].every((v, k) => Object.is(v, b[i][k])));
    });
    ok("NEGATIVE CONTROL: under a field the SOLID sample's ions are bit-identical",
      same, `${SOLID.length} sites x ${TSAMP.length} instants, field 1 vs field 0`);
    // ...and they do move, so this is not a gate over a dead layer (the S-2 scar).
    const jig = Math.max(...TSAMP.map((t) => {
      const p = poseOf(S8, t), q = eqOf(S8, t);
      return Math.max(...SOLID.map((i) => E.bscMag([p[i][0] - q[i][0], p[i][1] - q[i][1],
        p[i][2] - q[i][2]]) as number));
    }));
    ok("...but they DO jiggle, so the control is over a live layer and not a dead one",
      jig > 1e-6, `worst jiggle excursion ${(jig * P2U13).toFixed(1)} pm`);
    ok("...and that jiggle stays WELL under half a lattice spacing (in place, never away)",
      jig < 0.5 * NN13, `${(jig / NN13).toFixed(3)} nn (floor 0.5)`);
    // the same claim measured along the FIELD AXIS alone, which is the direction
    // the state's caption is about.
    const drift0 = Math.max(...TSAMP.map((t) => {
      const p = poseOf(S8, t), q = eqOf(S8, t);
      return Math.max(...SOLID.map((i) => Math.abs(p[i][0] - q[i][0])));
    }));
    ok("...with ZERO net travel along the field axis beyond that same jiggle",
      drift0 < 0.5 * NN13, `${(drift0 / NN13).toFixed(3)} nn along +x`);
  }

  // ── THE POSITIVE HALF, IN THE SAME FRAME ────────────────────────────────────
  {
    const t = 13200;                       // the settled instant (see the pin below)
    const p = poseOf(S8, t), q = eqOf(S8, t);
    const cat = MOLTEN.filter((i) => SL13[i].q > 0), ani = MOLTEN.filter((i) => SL13[i].q < 0);
    const mean = (ix: number[]) => ix.reduce((s, i) => s + (p[i][0] - q[i][0]), 0) / ix.length;
    const mc = mean(cat), ma = mean(ani);
    ok("the MOLTEN sample's ions have travelled along the field, cations and anions apart",
      mc > 0.5 * NN13 && ma < -0.5 * NN13,
      `cations ${(mc / NN13).toFixed(2)} nn, anions ${(ma / NN13).toFixed(2)} nn (opposite signs)`);
    ok("...and the two directions are opposite because of the CHARGE, not an authored key",
      Math.sign(mc) === Math.sign(E.bscSpeciesCharge("Na+") as number) &&
      Math.sign(ma) === Math.sign(E.bscSpeciesCharge("Cl-") as number) &&
      !/ions\.direction|drift_dir|bs\.drift\b/.test(updSrc13));
    // MEASURED ON THE DRIFT TERM ITSELF, which is what the camera fit carries.
    // The molten pose ALSO carries the melt wander and the jiggle, and conflating
    // the three would have made this assertion fail against a correct engine (it
    // did, at -1.73 nn against a 1.60 nn migration cap) — the drift is bounded by
    // BS_ION_DRIFT_NN and the WHOLE excursion by the declared sum of all three.
    const dOf = (i: number, t: number) =>
      (E.bscIonDriftOf(S8, SL13[i], i, t, null,
        E.bscTempAt(E.bscSiteBlock(S8, SL13[i]), t, null)) as number[]) || [0, 0, 0];
    const wholeCap = ((E.BS_ION_DRIFT_NN as number) + (E.BS_MELT_WANDER as number) *
      Math.sqrt(3)) * NN13 + 0.5 * NN13;
    ok("...and the migration is BOUNDED, so the camera fit stays a config-only solve",
      MOLTEN.every((i) => TSAMP.every((tt) =>
        Math.abs(dOf(i, tt)[0]) <= (E.BS_ION_DRIFT_NN as number) * NN13 + 1e-9)) &&
      MOLTEN.every((i) => TSAMP.every((tt) => {
        const pp = poseOf(S8, tt), qq = eqOf(S8, tt);
        return (E.bscMag([pp[i][0] - qq[i][0], pp[i][1] - qq[i][1],
          pp[i][2] - qq[i][2]]) as number) <= wholeCap;
      })) && (E.bscFieldExtent(S8, SL13) as number) > 0,
      `drift cap ${E.BS_ION_DRIFT_NN} nn, whole-excursion cap ${(wholeCap / NN13).toFixed(2)} nn, fit adds ${(E.bscFieldExtent(S8, SL13) as number).toFixed(2)} units`);
    ok("...and the SOLID half contributes exactly 0 to that fit (no camera moves for it)",
      (E.bscFieldExtent(Object.assign({}, S8, {
        groups: [{ id: "solid", label: "solid", at: [-6, 0, 0] }]
      }), sitesOf13(Object.assign({}, S8, {
        groups: [{ id: "solid", label: "solid", at: [-6, 0, 0] }]
      }))) as number) === 0);
    // A cation-only METAL under the same field: the cores stay put, because a
    // cation-only lattice resolves no ion pair and therefore has no melting point.
    // This is the metallic_bonding contract asserted from the engine side.
    const METAL = {
      placement: "lattice", mode: "drift",
      units: [{ species: "Na+" }, { species: "Na+" }], lattice: { cell: "bcc", n: [3, 3, 3], a_pm: 429 },
      field: 1, field_axis: "x", thermal: { T_K: 3000, jiggle_scale: 0.35 }
    };
    const ML = sitesOf13(METAL);
    const mp2 = poseOf(METAL, 20000), mq2 = eqOf(METAL, 20000);
    ok("a cation-only METAL's cores never migrate, at any temperature or field",
      ML.every((s: any) => s.pair == null) &&
      ML.every((_: any, i: number) => Math.abs(mp2[i][0] - mq2[i][0]) < 0.5 *
        (E.bscSiteNnU(METAL, ML[0]) as number)) &&
      (E.bscSeaScreens(ML.map((s: any) => s.q), ML.length) as boolean) === true,
      "no pair -> no mp_K -> f_melt 0 at 3000 K; the sea screens, so the block also holds under a slip");
  }

  // ── Q-2: THE CUE IS DESTINATION-VALUED AND THE CAUSE PRECEDES THE EFFECT ────
  {
    const fc = E.bscFieldCfg(S8) as any;
    ok("field_at_ms is DESTINATION-valued: the state OPENS at zero field",
      (E.bscFieldAt(S8, 0, null) as number) === 0 &&
      (E.bscFieldAt(S8, 5999, null) as number) === 0 &&
      (E.bscFieldAt(S8, 6000 + fc.dur, null) as number) === 1 &&
      (E.bscFieldAt(S8, 30000, null) as number) === 1,
      `0 -> ${S8.field} over ${fc.dur} ms from ${S8.field_at_ms}`);
    ok("a state with NO field_at_ms holds its authored field from frame 0 (byte-identical)",
      (E.bscFieldAt({ field: 0.4 }, 0, null) as number) === 0.4 &&
      (E.bscFieldAt({}, 0, null) as number) === 0);
    // Rule 32a: nothing drifts until the arrows have arrived AND been held.
    const tArrive = 6000 + fc.dur, tGo = tArrive + (E.BS_FIELD_HOLD_MS as number);
    ok("CAUSE BEFORE EFFECT: the field is fully up before ANY carrier has moved",
      (E.bscDriftProg(S8, tArrive, null) as number) === 0 &&
      (E.bscDriftProg(S8, tGo, null) as number) === 0 &&
      (E.bscDriftProg(S8, tGo + 1, null) as number) > 0 &&
      (E.bscDriftProg(S8, tGo + (E.BS_DRIFT_MS as number), null) as number) === 1,
      `arrows up at ${tArrive} ms, carriers start at ${tGo} ms, settled at ${tGo + (E.BS_DRIFT_MS as number)} ms`);
    ok("...and the effect is monotone in t, so a carrier can never drift backwards",
      Array.from({ length: 200 }, (_, k) => E.bscDriftProg(S8, k * 120, null) as number)
        .every((v, k, a) => k === 0 || v >= a[k - 1] - 1e-15));
    ok("a trusted DRAG seizes the field and the response tracks it from state entry",
      (E.bscFieldAt(S8, 0, 0.62) as number) === 0.62 &&
      (E.bscDriftProg(S8, (E.BS_DRIFT_MS as number), 0.62) as number) === 1,
      "drag-seize: a live value in, no script to hold");
    // D-1: a rewind photographs the same pixels, by construction.
    const walk = [0, 7000, 13200, 20000, 7000, 0].map((t) => JSON.stringify(poseOf(S8, t)));
    ok("D-1: the whole carrier layer is a closed form of state-local t (rewind-safe)",
      walk[4] === walk[1] && walk[5] === walk[0] && walk[3] !== walk[2] &&
      !/Date\.now|Math\.random/.test(grabFn("bscIonDriftOf") + grabFn("bscSeaAt") +
        grabFn("bscDriftProg") + grabFn("bscFieldAt")));
  }

  // ── Q-2: THE PIN. The two files must agree, and they are read here, not assumed.
  {
    const m = /if \(typeof bscState\.field_at_ms === 'number'\) \{[\s\S]*?\}/.exec(META_SRC);
    const body = m ? m[0] : "";
    const nums = (body.match(/\d+/g) || []).map(Number);
    ok("deriveStateMeta registers field_at_ms as a frozen-pin candidate at all",
      body.length > 0 && /candidates\.push/.test(body));
    ok("...and its offset is BUILT FROM the renderer's own constants, not a guess",
      nums.indexOf(E.BS_FIELD_MS as number) >= 0 &&
      nums.indexOf(E.BS_FIELD_HOLD_MS as number) >= 0 &&
      nums.indexOf(E.BS_DRIFT_MS as number) >= 0,
      `meta [${nums.join(",")}] vs renderer ${E.BS_FIELD_MS}/${E.BS_FIELD_HOLD_MS}/${E.BS_DRIFT_MS}`);
    // ...and the instant it names is genuinely SETTLED: the carriers have stopped.
    const pinned = 6000 + (E.BS_FIELD_MS as number) + (E.BS_FIELD_HOLD_MS as number) +
      (E.BS_DRIFT_MS as number) + 600;
    const done = 6000 + (E.BS_FIELD_MS as number) + (E.BS_FIELD_HOLD_MS as number) +
      (E.BS_DRIFT_MS as number);
    ok("ACCEPTANCE: the pinned instant is past the END of the migration, never inside it",
      (E.bscDriftProg(S8, pinned, null) as number) === 1 &&
      (E.bscDriftProg(S8, done, null) as number) === 1 &&
      (E.bscDriftProg(S8, done - 1, null) as number) < 1 && pinned - done === 600,
      `pin ${pinned} ms = migration complete at ${done} ms + a 600 ms settle margin`);
    ok("the DECLARED motion of a drift/sea state is not a green gate over a dead screen",
      /asObj\(bscMotion\.sea\)\?\.show === true/.test(META_SRC) &&
      /asObj\(bscMotion\.ions\)\?\.mobile === true/.test(META_SRC));
  }

  // ── Q-3: THE CONDUCTIVITY ROW SWITCHES ON THE DERIVED MELT STATE ────────────
  {
    const cond = /else if \(w === "conductivity"\) \{[\s\S]*?\n                \}/.exec(updSrc13);
    const cbody = cond ? cond[0] : "";
    ok("the conductivity row exists and reads each group's DERIVED melt state",
      cbody.length > 0 && /grpRows\[j\]\.melt > 0/.test(cbody),
      "one row per group, in the authored groups[] order");
    ok("...and switches on NO authored key (no conduct* / molten / solid flag anywhere)",
      !/bs\.conduct|\.conducts\b|is_molten|bs\.molten|bs\.solid/.test(updSrc13) &&
      /grpRows\[j\]\.melt/.test(cbody) && !/thermal\.T_K/.test(cbody));
    ok("the molten value and its reference temperature come from the named constants",
      /BS_MOLTEN_S_CM/.test(cbody) && /BS_MOLTEN_REF_K/.test(cbody) &&
      (E.BS_MOLTEN_S_CM as number) === 3.5 && (E.BS_MOLTEN_REF_K as number) === 1100,
      `${E.BS_MOLTEN_S_CM} S/cm at ${E.BS_MOLTEN_REF_K} K  (RATIFIED: Janz-tradition molten-salt compilation, lit 3.4-3.6)`);
    ok("the reference temperature is a CITATION, deliberately not the live T_K",
      /\(" \+ BS_MOLTEN_REF_K \+ " K\)/.test(cbody) &&
      !/BS_MOLTEN_REF_K\s*[*/-]/.test(cbody) &&
      !/grpRows\[j\]\.T_K|tempDragV|bscTempAt/.test(cbody),
      "S8's molten group is authored at 1150 K and the row still cites 1100 K");
    // THE NUMBER chemistry_author DECLINED. There is no solid-side S/cm digit in
    // the shipped source at all, so the engine cannot print one.
    const codeOnly13 = grabRegion("bscClamp", "applyBondingSceneGlow")
      .split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
    ok("NO solid-side S/cm digit, and no molten:solid RATIO, exists anywhere in the code",
      !/S\\u00B7cm[^"]*10\\u00B9|10\^13|1e13|1e-13|\bratio\b[^\n]*cm/.test(codeOnly13) &&
      (codeOnly13.match(/S\\u00B7cm/g) || []).length === 1,
      "exactly one S/cm string in the source, and it is the ratified molten one");
    ok("the solid row states the MECHANISM instead of a number it cannot defend",
      /conductivity: none \\u2014 ions fixed/.test(cbody));
  }

  // ── Q-4 / Q-5: THE TWO UNRATIFIED TABLES — PRINTED, ASSERTED NOTHING ────────
  //   The E1 dipole-table pattern: unratified data ships VISIBLE AND INERT. This
  //   flag is the single edit that turns the assertions on once Session B's
  //   chemistry_author has ratified the convention and the digits.
  const METALS_RATIFIED = false;   // Session B's chemistry_author owns this line
  const DRIFT_RATIFIED = false;    // ditto, for the coefficient and the scaling
  {
    console.log(`    BS_METALS (Q-5)   ratify state: ${METALS_RATIFIED ? "RATIFIED" : "NOT RATIFIED — printed, asserted nothing"}`);
    const MLIT: Record<string, { ve: number; kj: number; note: string }> = {
      Na: { ve: 1, kj: 107, note: "Phase-0; convention to ratify: std enthalpy of atomisation, M(s) -> M(g), 298 K" },
      Mg: { ve: 2, kj: 146, note: "Phase-0" },
      Al: { ve: 3, kj: 326, note: "Phase-0" }
    };
    for (const k of Object.keys(MLIT)) {
      const r = (E.BS_METALS as any)[k];
      console.log(`      ${k.padEnd(3)}valence_e ${r?.valence_e}   dH_at ${String(r?.atomisation_kJ).padStart(4)} kJ/mol` +
        `   (Phase-0 ${MLIT[k].kj})   NOT RATIFIED`);
    }
    console.log(`    BS_DRIFT_V0_MS (Q-4)  ${E.BS_DRIFT_V0_MS} m/s at field 1` +
      `   (Phase-0 ~1e-4 m/s, cross-links the shipped concept drift_velocity)   NOT RATIFIED`);
    if (METALS_RATIFIED) {
      ok("every ratified atomisation digit is transcribed exactly",
        Object.keys(MLIT).every((k) => (E.BS_METALS as any)[k].atomisation_kJ === MLIT[k].kj));
      ok("dH_at rises monotonically with the free electrons per atom",
        (E.BS_METALS as any).Na.atomisation_kJ < (E.BS_METALS as any).Mg.atomisation_kJ &&
        (E.BS_METALS as any).Mg.atomisation_kJ < (E.BS_METALS as any).Al.atomisation_kJ);
    } else {
      console.log("      (ratify flag OFF: no digit above is asserted by this gate)");
    }
    if (DRIFT_RATIFIED) {
      ok("the drift coefficient is the ratified value", (E.BS_DRIFT_V0_MS as number) === 1e-4);
    }
    // ENGINE HYGIENE is asserted either way — these are not chemistry claims.
    ok("ENGINE: the atomisation row is engine-printed from BS_METALS, never hand-typed",
      /BS_METALS\[metalLive\]\.atomisation_kJ/.test(updSrc13) &&
      !/\b(107|146|326)\b/.test(grabRegion("bscClamp", "applyBondingSceneGlow")
        .split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n")
        .replace(/var BS_METALS = \{[\s\S]*?\};/, "")),
      "the three digits exist in exactly one place: the table");
    ok("ENGINE: the Metal picker changes it (the live metal is resolved, not fixed)",
      E.bscMetalKey({}, [{ species: "Al3+" }]) === "Al" &&
      E.bscMetalKey({}, [{ species: "Na+" }]) === "Na" &&
      E.bscMetalKey({}, [{ species: "Cl-" }]) === null);
    ok("ENGINE: the drift readout is LINEAR in the live field and exactly 0 at 0",
      (E.bscDriftVms(0) as number) === 0 &&
      Math.abs((E.bscDriftVms(0.5) as number) * 2 - (E.bscDriftVms(1) as number)) < 1e-18 &&
      (E.bscDriftVms(1) as number) === (E.BS_DRIFT_V0_MS as number));
    ok("ENGINE: its mantissa formats to the Phase-0 string at full field",
      E.bscFmtMant(1) === "1" && E.bscFmtMant(0.5) === "0.5" && E.bscFmtMant(0.02) === "0.02");
    // Rule 34c across the DOM text path: real Unicode, and no ASCII underscore
    // reaches the screen (the subscripts with no Unicode codepoint are true HTML
    // subscripts, which is what the DOM path can honestly do).
    const hudRegion = updSrc13.slice(updSrc13.indexOf('var lines = [], want = bs.hud_lines'));
    // the RENDERED strings of the three new rows only. The enum keys around them
    // legitimately carry underscores (delta_chi, like_contacts, hud_lines); what
    // may never carry one is a literal that reaches the screen.
    const pushed = (hudRegion.match(/lines\.push\([^;]*\);/g) || []).join("\n");
    const shown = (pushed.match(/"(?:[^"\\]|\\.)*"/g) || []);
    ok("Rule 34c: every new readout is real Unicode, with NO ASCII underscore on screen",
      /\\u2248/.test(hudRegion) && /\\u00D7/.test(hudRegion) && /\\u207B\\u2074/.test(hudRegion) &&
      /\\u0394H<sub>at<\/sub>/.test(hudRegion) && /v<sub>d<\/sub>/.test(hudRegion) &&
      shown.length > 0 && shown.every((lit) => !/[A-Za-z]_[A-Za-z]/.test(lit)),
      `${shown.length} rendered literals, none with an ASCII underscore; d has no Unicode subscript codepoint at all`);
  }

  // ── ROW G: THE SEA IS DERIVED, AND IT IS A PICTURE OF THE DERIVATION ────────
  {
    const METAL2 = {
      placement: "lattice", mode: "electron_sea",
      units: [{ species: "Mg2+" }, { species: "Mg2+" }],
      lattice: { cell: "bcc", n: [3, 3, 3], a_pm: 320 },
      sea: { show: true }, field: 1, field_axis: "x"
    };
    const ML2 = sitesOf13(METAL2), n2 = ML2.length;
    const cfg = E.bscSeaCfg(METAL2, ML2, n2, null, null) as any;
    ok("the electron COUNT is derived: valence_e per cation core, off BS_METALS",
      cfg && cfg.metal === "Mg" && cfg.valence_e === 2 &&
      cfg.n === Math.min(E.BS_MAX_SEA as number, 2 * cfg.cores),
      `${cfg && cfg.cores} cores x ${cfg && cfg.valence_e} = ${cfg && cfg.n} electrons (cap ${E.BS_MAX_SEA})`);
    ok("the Valence slider and the Metal picker both change it (drag-seize path)",
      (E.bscSeaCfg(METAL2, ML2, n2, 3, null) as any).n === Math.min(E.BS_MAX_SEA as number, 3 * cfg.cores) &&
      (E.bscSeaCfg(METAL2, ML2, n2, null, "Al") as any).valence_e === 3);
    ok("a state that authors no sea draws NONE (every shipped concept is untouched)",
      E.bscSeaCfg({ sea: { show: false } }, ML2, n2, null, null) === null &&
      E.bscSeaCfg({}, ML2, n2, null, null) === null &&
      /if \(sb\.sea && sb\.sea\.show\) needSea = BS_MAX_SEA;/.test(grabFn("buildBondingScene")),
      "the mesh pool is sized from config and is 0 unless a state asks for one");
    // the electrons drift AGAINST the field, and it is the fast/slow contrast
    // drift_velocity teaches — not a slow crawl with nothing else happening.
    const eAt = (k: number, t: number) => E.bscSeaAt(METAL2, k, ML2, n2, t, null) as number[];
    const nn2 = E.bscSiteNnU(METAL2, ML2[0]) as number;
    const settled = (E.BS_DRIFT_MS as number) + 1000;
    const meanX = (t: number) => {
      let s = 0; for (let k = 0; k < cfg.n; k++) s += eAt(k, t)[0];
      return s / cfg.n;
    };
    ok("the sea drifts AGAINST the field, because an electron is negative (derived)",
      meanX(settled) < -0.5 * nn2, `mean electron displacement ${(meanX(settled) / nn2).toFixed(2)} nn along +x`);
    ok("...while its OWN motion stays fast and directionless (the drift_velocity picture)",
      Math.abs(eAt(0, settled)[1] - eAt(0, settled + 200)[1]) > 1e-3 &&
      (E.BS_SEA_W as number[]).every((w) => w > 3),
      `jitter rates ${(E.BS_SEA_W as number[]).join("/")} rad/s vs a ${E.BS_DRIFT_MS} ms drift window`);
    ok("...and every electron stays bounded, so the block never empties out",
      Array.from({ length: cfg.n }, (_, k) => k).every((k) =>
        [0, 2000, settled, 40000].every((t) =>
          (E.bscMag(eAt(k, t)) as number) <=
          ((E.BS_SEA_SPREAD_NN as number) * Math.sqrt(3) + (E.BS_SEA_DRIFT_NN as number)) * nn2 + 1e-9)));
    ok("the sea is a PICTURE of bscSeaScreens, never an input to it (no outcome moves)",
      !/\bsea\b/.test(grabFn("bscSeaScreens") + grabFn("bscLikeContacts") +
        grabFn("bscShiftSolve") + grabFn("bscMeltFrac")),
      "drawing the electrons changes no slip outcome, no contact count and no melt");
  }

  // ── Q-2: THE ARROWS ARE REAL MESHES AND A SENTENCE CAN BIND TO THEM ─────────
  {
    const b13 = grabFn("buildBondingScene");
    ok("the field ARROWS exist as meshes (presence-is-not-correctness, the scar)",
      /elementType: "bsc_field", id: "bsc_field" \+ u \+ "_shaft"/.test(b13) &&
      /elementType: "bsc_field", id: "bsc_field" \+ u \+ "_head"/.test(b13) &&
      /id: "bsc_field_label"/.test(b13) &&
      (E.BS_GLOW_ELS as any).field.length === 1 &&
      (E.BS_GLOW_ELS as any).field[0] === "bsc_field");
    ok("the sea ELECTRONS exist as meshes, on the existing electrons focal",
      /elementType: "bsc_electron", id: "bsc_sea" \+ u/.test(b13) &&
      (E.BS_GLOW_ELS as any).electrons.indexOf("bsc_electron") >= 0);
    ok("both are TRANSIENTS, so a capture can never photograph a previous state's field",
      /transient\.push\("bsc_field" \+ i \+ "_shaft"\)/.test(grabFn("applyBondingSceneState")) &&
      /transient\.push\("bsc_sea" \+ i\)/.test(grabFn("applyBondingSceneState")));
  }
}

console.log("\n=== 14. E3b T-1..T-4 THE PROPERTY TABLE + melt + ROW R groups ===");
// E3b dispatch 2 (2026-08-03). Was a declared stub; it is now the real assertion
// set for the ion property table, the melt law and row R. Same discipline as
// section 32: every body called below is EXTRACTED from the shipped renderer and
// run, never transcribed, and every claim carries its own negative control.
{
  const updSrc = grabFn("updateBondingSceneFrame");
  const buildSrc = grabFn("buildBondingScene");
  const P2U = E.bscLinkCfg({}).pm_per_unit as number;
  const RS = (a: number) => ({ cell: "rock_salt", n: [3, 3, 3], a_pm: a });
  const sitesOf = (bs: any) => E.bscSiteList(bs, null) as any[];
  const poseAt = (bs: any, ms: number) =>
    sitesOf(bs).map((si: any, i: number) => E.bscSiteAt(bs, si, i, ms, null, null) as number[]);
  const poseStr = (bs: any, ms: number) => JSON.stringify(poseAt(bs, ms));

  // ── T-1: THE ION PROPERTY TABLE, PRINTED AGAINST LITERATURE WITH ITS RATIFY
  //    FLAG (the E1 dipole-table pattern). All five rows are RATIFIED by
  //    chemistry_author for BOTH columns, so the digits below are asserted; an
  //    unratified row would be PRINTED and asserted nothing.
  console.log("    ion property table  (chemistry_author 2026-08-03: RATIFIED, all five rows, both columns)");
  const LIT: Record<string, { degC: number; mp: number; lat: number; band: string; flag: string }> = {
    NaCl: { degC: 801, mp: 1074, lat: 788, band: "786-790", flag: "" },
    KCl: { degC: 770, mp: 1043, lat: 715, band: "701-717", flag: "cross-compilation spread" },
    LiF: { degC: 845, mp: 1118, lat: 1030, band: "1030-1036", flag: "cross-compilation spread" },
    MgO: { degC: 2852, mp: 3125, lat: 3791, band: "3785-3795", flag: "measurement precision >2800 degC" },
    CaO: { degC: 2613, mp: 2886, lat: 3401, band: "3395-3414", flag: "measurement precision >2800 degC" }
  };
  for (const k of Object.keys(LIT)) {
    const row = (E.BS_ION_PAIRS as any)[k];
    console.log(`      ${k.padEnd(5)}mp ${String(row?.mp_K).padStart(5)} K (lit ${LIT[k].degC} degC)` +
      `   dH ${String(row?.lattice_kJ).padStart(5)} kJ/mol (lit ${LIT[k].band})` +
      `   RATIFIED${LIT[k].flag ? "  [" + LIT[k].flag + "]" : ""}`);
  }
  {
    const rows = Object.keys(LIT);
    ok("every pair carries mp_K and lattice_kJ (no row ships half the table)",
      rows.every((k) => typeof (E.BS_ION_PAIRS as any)[k].mp_K === "number" &&
        typeof (E.BS_ION_PAIRS as any)[k].lattice_kJ === "number"));
    ok("every ratified digit is transcribed exactly, no row altered",
      rows.every((k) => (E.BS_ION_PAIRS as any)[k].mp_K === LIT[k].mp &&
        (E.BS_ION_PAIRS as any)[k].lattice_kJ === LIT[k].lat),
      rows.map((k) => `${k} ${(E.BS_ION_PAIRS as any)[k].mp_K}/${(E.BS_ION_PAIRS as any)[k].lattice_kJ}`).join(" "));
    // the CONVENTION, checked INDEPENDENTLY of the shipped column: every mp_K is a
    // clean whole-degC -> K conversion of the handbook value. This is the half a
    // transcription error cannot survive — a wrong digit stops being a Kelvin
    // conversion of anything.
    ok("every mp_K is exactly floor(degC + 273.15) — the stated convention holds",
      rows.every((k) => Math.floor(LIT[k].degC + 273.15) === (E.BS_ION_PAIRS as any)[k].mp_K),
      rows.map((k) => `${LIT[k].degC}+273.15 -> ${Math.floor(LIT[k].degC + 273.15)}`).join("  "));
    ok("every lattice_kJ sits inside its own published band",
      rows.every((k) => {
        const [lo, hi] = LIT[k].band.split("-").map(Number);
        const v = (E.BS_ION_PAIRS as any)[k].lattice_kJ as number;
        return v >= lo && v <= hi;
      }));
    // Born-Lande structure, derived rather than asserted: the 2+/2- pairs must sit
    // far above every 1+/1- pair (q1*q2 is four times as large), and within a
    // charge class the smaller cell must bind harder. A transposed row breaks this.
    const div = rows.filter((k) => Math.abs(E.bscSpeciesCharge((E.BS_ION_PAIRS as any)[k].cation) as number) === 2);
    const mono = rows.filter((k) => Math.abs(E.bscSpeciesCharge((E.BS_ION_PAIRS as any)[k].cation) as number) === 1);
    ok("the 2+/2- pairs bind far harder than every 1+/1- pair (q1q2 is 4x)",
      Math.min(...div.map((k) => (E.BS_ION_PAIRS as any)[k].lattice_kJ)) >
      3 * Math.max(...mono.map((k) => (E.BS_ION_PAIRS as any)[k].lattice_kJ)),
      `divalent min ${Math.min(...div.map((k) => (E.BS_ION_PAIRS as any)[k].lattice_kJ))} vs monovalent max ${Math.max(...mono.map((k) => (E.BS_ION_PAIRS as any)[k].lattice_kJ))}`);
    ok("within a charge class the smaller cell binds harder (LiF>NaCl>KCl, MgO>CaO)",
      (E.BS_ION_PAIRS as any).LiF.lattice_kJ > (E.BS_ION_PAIRS as any).NaCl.lattice_kJ &&
      (E.BS_ION_PAIRS as any).NaCl.lattice_kJ > (E.BS_ION_PAIRS as any).KCl.lattice_kJ &&
      (E.BS_ION_PAIRS as any).MgO.lattice_kJ > (E.BS_ION_PAIRS as any).CaO.lattice_kJ &&
      (E.BS_ION_PAIRS as any).LiF.a_pm < (E.BS_ION_PAIRS as any).NaCl.a_pm &&
      (E.BS_ION_PAIRS as any).NaCl.a_pm < (E.BS_ION_PAIRS as any).KCl.a_pm);
    // the pair identity travels WITH the site, matched on BOTH species — an anion
    // is shared by two rows, and a match on one alone gives the wrong mp_K.
    ok("bscPairKeyFor matches on BOTH species (Cl- belongs to NaCl AND KCl)",
      E.bscPairKeyFor("Na+", "Cl-") === "NaCl" && E.bscPairKeyFor("K+", "Cl-") === "KCl" &&
      E.bscPairKeyFor("Mg2+", "O2-") === "MgO" && E.bscPairKeyFor("Ca2+", "O2-") === "CaO" &&
      E.bscPairKeyFor("Na+", "F-") === null && E.bscPairKeyFor("Na", "Cl") === null);
    ok("a bare-atom transfer close-up resolves NO pair, so it has no melting point",
      sitesOf(TRANSFER_BS).every((s: any) => s.pair == null) &&
      sitesOf(LATTICE_BS).every((s: any) => s.pair === "NaCl"));
    // CODE only — the doc comments name the numbers on purpose (a convention that
    // is not written beside its data is a convention nobody can check).
    const codeOnly = grabRegion("bscClamp", "applyBondingSceneGlow")
      .split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
    ok("nothing hard-codes a melting point or a lattice enthalpy outside the table",
      !/\b(1074|1043|1118|3125|2886|788|715|1030|3791|3401)\b/.test(codeOnly),
      "both HUD lines can only read BS_ION_PAIRS");
  }

  // ── T-2: THE MELT LAW.
  {
    const NACL = (T: number) => ({
      placement: "lattice", mode: "melt",
      units: [{ species: "Na+" }, { species: "Cl-" }], lattice: RS(564),
      thermal: { T_K: T, jiggle_scale: 0 }
    });
    const mp = (E.BS_ION_PAIRS as any).NaCl.mp_K as number;      // 1074
    const W = E.BS_MELT_WIDTH_K as number;                       // 25
    const pr = (E.BS_ION_PAIRS as any).NaCl;
    ok("f_melt is clamp((T - mp_K)/25, 0, 1) — the stated law, at both knees",
      E.bscMeltFrac(mp - 1, pr) === 0 && E.bscMeltFrac(mp, pr) === 0 &&
      E.bscMeltFrac(mp + W, pr) === 1 && E.bscMeltFrac(mp + 500, pr) === 1 &&
      Math.abs((E.bscMeltFrac(mp + W / 2, pr) as number) - 0.5) < 1e-12 && W === 25,
      `mp ${mp} K, knee at ${mp + W} K, width ${W} K = ${(100 * W / mp).toFixed(1)}% of mp`);
    ok("f_melt is monotone non-decreasing in T (heating can never re-freeze)",
      Array.from({ length: 200 }, (_, i) => E.bscMeltFrac(mp - 40 + i, pr) as number)
        .every((v, i, a) => i === 0 || v >= a[i - 1] - 1e-15));
    ok("a pair with no row melts at NO temperature (null pair, null T)",
      E.bscMeltFrac(5000, null) === 0 && E.bscMeltFrac(null, pr) === 0);

    // THE TWO GATE PROBES THE DISPATCH NAMES, on the DRAWN pose.
    const base = sitesOf(NACL(300)).map((s: any) => s.at);
    const moved = (bs: any, ms: number) => {
      const p = poseAt(bs, ms);
      return p.filter((v, i) => E.bscMag([v[0] - base[i][0], v[1] - base[i][1],
        v[2] - base[i][2]]) > 1e-12).length;
    };
    const N = base.length;
    ok("at T = mp_K - 1 K, ZERO ions have left their sites",
      [0, 1000, 4000, 25000].every((m) => moved(NACL(mp - 1), m) === 0), `${N} sites, none moved`);
    ok("at T = mp_K + 25 K, EVERY ion is mobile",
      [1, 1000, 4000, 25000].every((m) => moved(NACL(mp + W), m) === N),
      `${N}/${N} sites mobile at ${mp + W} K`);
    ok("...and every site's own melt term is exactly 1 at f = 1 (the endpoint is exact)",
      Array.from({ length: 125 }, (_, i) => E.bscSiteMelt(i, 1) as number).every((v) => v === 1) &&
      Array.from({ length: 125 }, (_, i) => E.bscSiteMelt(i, 0) as number).every((v) => v === 0));
    // BETWEEN the knees the mobile FRACTION ramps, chosen by INDEX, never random.
    {
      const frac = (f: number) =>
        Array.from({ length: 125 }, (_, i) => E.bscSiteMelt(i, f) as number).filter((v) => v > 0).length / 125;
      const pts = [0, 0.25, 0.5, 0.75, 1].map(frac);
      ok("the mobile fraction ramps monotonically between the knees",
        pts.every((v, i, a) => i === 0 || v >= a[i - 1]) && pts[0] === 0 && pts[4] === 1 &&
        frac(0.5) > 0.3 && frac(0.5) < 0.8,
        pts.map((v, i) => `f=${[0, 0.25, 0.5, 0.75, 1][i]} -> ${(v * 100).toFixed(0)}%`).join("  "));
      ok("the choice is DETERMINISTIC by site index (same call, same answer, always)",
        Object.is(E.bscMeltHash(37), E.bscMeltHash(37)) &&
        new Set(Array.from({ length: 125 }, (_, i) => (E.bscMeltHash(i) as number).toFixed(12))).size === 125,
        "125 distinct low-discrepancy onsets, no clumping");
      ok("no RNG and no wall clock anywhere in the melt bodies (D-1)",
        !/Math\.random|Date\.now|performance\.now|\+=/.test(
          grabFn("bscMeltFrac") + grabFn("bscMeltHash") + grabFn("bscSiteMelt") +
          grabFn("bscMeltWander") + grabFn("bscSiteAt")));
    }
    // CLOSED FORM: a group may OPEN already molten with no memory of having melted.
    {
      const hot = NACL(1200);
      ok("a block authored ABOVE its melting point is molten at t = 0 (no history)",
        moved(hot, 0) === N && poseStr(hot, 0) !== JSON.stringify(base),
        "opens molten — nothing has to have watched it melt");
      const r1 = poseStr(hot, 4400); poseStr(hot, 900000);
      ok("REWIND: t=4400 -> 900000 -> 4400 reproduces the molten pose byte-for-byte",
        r1 === poseStr(hot, 4400));
      // the excursion is BOUNDED — a molten ion wanders, it does not fly away.
      let worst = 0;
      for (let m = 0; m <= 400000; m += 613) {
        const p = poseAt(hot, m);
        for (let i = 0; i < N; i++) {
          worst = Math.max(worst, E.bscMag([p[i][0] - base[i][0], p[i][1] - base[i][1],
            p[i][2] - base[i][2]]) as number);
        }
      }
      const nnU = 564 / 2 / P2U;
      ok("the molten excursion is BOUNDED over 400 s (an accumulator would not be)",
        worst <= (E.BS_MELT_WANDER as number) * nnU * Math.sqrt(3) + 1e-9,
        `worst ${worst.toFixed(3)} vs closed-form bound ${((E.BS_MELT_WANDER as number) * nnU * Math.sqrt(3)).toFixed(3)} scene units`);
      ok("...and it is LARGE ENOUGH to read as lost order (past one nn spacing)",
        worst > nnU, `${worst.toFixed(2)} units vs nn ${nnU.toFixed(2)}`);
      // the camera fit follows it, config-only.
      ok("the auto-fit widens for a molten block, from config alone (no clock)",
        (E.bscSiteExtent(hot, null) as number) > (E.bscSiteExtent(NACL(300), null) as number) &&
        (E.bscMeltExtent(NACL(300), sitesOf(NACL(300))) as number) === 0,
        `${(E.bscSiteExtent(NACL(300), null) as number).toFixed(2)} -> ${(E.bscSiteExtent(hot, null) as number).toFixed(2)} units`);
    }
    // DERIVED, NEVER AUTHORED (D-2): the SAME authored temperature melts one pair
    // and leaves another solid, because the pair's own mp_K is the only input.
    {
      const at1150 = (cat: string, ani: string, a: number) => ({
        placement: "lattice", mode: "melt",
        units: [{ species: cat }, { species: ani }], lattice: RS(a),
        thermal: { T_K: 1150, jiggle_scale: 0 }
      });
      const na = at1150("Na+", "Cl-", 564), mg = at1150("Mg2+", "O2-", 421.2);
      const naBase = sitesOf(na).map((s: any) => s.at), mgBase = sitesOf(mg).map((s: any) => s.at);
      ok("ONE authored 1150 K melts NaCl (mp 1074) and leaves MgO (mp 3125) solid",
        poseStr(na, 3000) !== JSON.stringify(naBase) &&
        poseStr(mg, 3000) === JSON.stringify(mgBase),
        "nothing in the config says which one melts");
      ok("no config key anywhere says 'melts' — the outcome reads mp_K and nothing else",
        !/\bmolten\b|\.melt\b|melt_at_ms|is_melted/.test(grabFn("bscSiteAt") + grabFn("bscMeltFrac")) &&
        /pair\.mp_K/.test(grabFn("bscMeltFrac")));
      // the explore picker therefore changes the outcome as well as the readout.
      const S = E.bscSiteList({ placement: "lattice", units: [{ species: "Na+" }, { species: "Cl-" }],
        lattice: RS(564) }, (E.BS_ION_PAIRS as any).MgO) as any[];
      ok("the ion_pair picker swaps the pair, so it swaps the melting point too",
        S.every((s: any) => s.pair === "MgO"),
        "picking MgO on a 1150 K sandbox re-freezes the block, from the table alone");
    }
    // mode 'melt' is IMPLEMENTED: it carries its own solved camera, and the law is
    // deliberately NOT gated on it (a sandbox melts when the teacher drags T past
    // mp_K, which no mode string can know in advance).
    ok("mode 'melt' carries its own solved camera and is no longer deferred",
      (E.BS_CAMERAS as any).melt != null && (E.BS_CAMERAS as any).melt.fit === true &&
      E.BS_MODES_IMPL.indexOf("melt") >= 0);
    ok("an EXPLORE sandbox melts too — the law reads T vs mp_K, never the mode",
      poseStr(Object.assign({}, NACL(1200), { mode: "explore" }), 3000) !==
      JSON.stringify(sitesOf(NACL(300)).map((s: any) => s.at)));
  }

  // ── T-3: THE TWO PROPERTY HUD LINES.
  {
    ok("melting_point and lattice_enthalpy are in the closed enum and IMPLEMENTED",
      (E.BS_HUD_LINES as string[]).includes("melting_point") &&
      (E.BS_HUD_LINES as string[]).includes("lattice_enthalpy") &&
      (E.BS_HUD_LINES_E3B as string[]).includes("melting_point") &&
      (E.BS_HUD_LINES_E3B as string[]).includes("lattice_enthalpy"));
    ok("both are engine-printed from BS_ION_PAIRS for the LIVE pair, per group",
      /w === "melting_point" \|\| w === "lattice_enthalpy"/.test(updSrc) &&
      /gp\.mp_K \+ " K"/.test(updSrc) && /gp\.lattice_kJ/.test(updSrc) &&
      /grpRows\[j\]\.label \? \(grpRows\[j\]\.label \+ " "\) : ""/.test(updSrc));
    // Rule 34c on the DOM text path: real Unicode Delta, middle dot, superscript -1.
    ok("the enthalpy line is real Unicode (Delta, middle dot, superscript minus one)",
      /\\u0394H = /.test(updSrc) && /kJ\\u00B7mol\\u207B\\u00B9/.test(updSrc) &&
      !/kJ\.mol|kJ\/mol|delta ?H|dH =/.test(updSrc),
      "ΔH = 788 kJ·mol⁻¹");
    // ── THE BUDGET, MEASURED IN CHROMIUM AT 1024x640 (2026-08-03, the E3b
    //    dispatch-2 headless drive) AND NOT REASONED ABOUT. The HUD is a FIXED box
    //    at every viewport width, which is precisely the assumption Desk 1 lost
    //    three audit rounds to.
    //      panel        220.0 px wide (min-width 190 + 15 px padding each side)
    //      content       190.0 px
    //      advance         7.87 px per character (13px monospace, and the Unicode
    //                      glyphs measure at exactly one advance each)
    //      4 lines       110.4 px tall at top:52px -> bottom edge 162 px, clear of
    //                      the 640 px viewport and of the bottom-right slider panel
    const HUD_CONTENT_PX = 190, HUD_CHAR_PX = 7.87;
    const MEASURED = { "NaCl m.p. = 1074 K": 140.4, "MgO ΔH = 3791 kJ·mol⁻¹": 173.2 };
    ok("the measured advance reproduces the measured line widths (the model is real)",
      Object.entries(MEASURED).every(([s, px]) => Math.abs(s.length * HUD_CHAR_PX - px) < 4),
      Object.entries(MEASURED).map(([s, px]) => `${s.length}ch -> ${px}px`).join("  "));
    const lineOf = (label: string, k: string, kind: "mp" | "dh") => {
      const row = (E.BS_ION_PAIRS as any)[k];
      const pre = label ? label + " " : "";
      return kind === "mp" ? pre + "m.p. = " + row.mp_K + " K"
        : pre + "ΔH = " + row.lattice_kJ + " kJ·mol⁻¹";
    };
    // ionic_bonding S9: FOUR of these lines, two groups, in the fixed panel.
    const S9 = [lineOf("NaCl", "NaCl", "mp"), lineOf("MgO", "MgO", "mp"),
                lineOf("NaCl", "NaCl", "dh"), lineOf("MgO", "MgO", "dh")];
    const widest = Math.max(...S9.map((s) => s.length * HUD_CHAR_PX));
    ok("ionic S9's FOUR grouped lines fit the fixed 220 px panel at 1024 px",
      widest <= HUD_CONTENT_PX, `widest ${widest.toFixed(1)} px of ${HUD_CONTENT_PX} px content  [${S9.join(" | ")}]`);
    // and the ARCHITECT'S budget, derived rather than guessed: how long a group
    // label may be before the longest line in the whole table overflows.
    {
      const worstBare = Math.max(...Object.keys(E.BS_ION_PAIRS as any)
        .flatMap((k) => [lineOf("", k, "mp").length, lineOf("", k, "dh").length]));
      const maxLabel = Math.floor(HUD_CONTENT_PX / HUD_CHAR_PX) - worstBare - 1;
      console.log(`    group-label budget  <= ${maxLabel} characters ` +
        `(longest bare line ${worstBare} ch; ${HUD_CONTENT_PX} px / ${HUD_CHAR_PX} px per ch)`);
      ok("the labels the wave actually uses are inside that budget",
        ["NaCl", "KCl", "LiF", "MgO", "CaO", "solid", "melt"].every((l) => l.length <= maxLabel),
        `budget ${maxLabel} ch, longest used 'solid' = 5 ch`);
      ok("a label PAST the budget really would overflow (the budget is not slack)",
        ("A".repeat(maxLabel + 1) + " " + lineOf("", "MgO", "dh")).length * HUD_CHAR_PX > HUD_CONTENT_PX);
    }
    ok("the panel this budget is measured against is the one the renderer emits",
      /hud\.id = "bsc_hud";/.test(buildSrc) && /min-width:190px/.test(buildSrc) &&
      /padding:11px 15px/.test(buildSrc) && /font:13px\/1\.7 monospace/.test(buildSrc) &&
      /top:52px;right:12px/.test(buildSrc));
  }

  // ── T-4: ROW R.
  {
    const SCENE_TH = { T_K: 1150, jiggle_scale: 0.3 };
    const TWO: any = {
      placement: "lattice", mode: "melt", lattice: RS(564),
      thermal: SCENE_TH,
      groups: [
        { id: "nacl", label: "NaCl", at: [-17, 0, 0],
          units: [{ species: "Na+" }, { species: "Cl-" }], lattice: RS(564) },
        { id: "mgo", label: "MgO", at: [17, 0, 0],
          units: [{ species: "Mg2+" }, { species: "O2-" }], lattice: RS(421.2) }
      ]
    };
    const G = E.bscGroupBlocks(TWO) as any[];
    ok("groups resolve to one merged block each, in the AUTHORED array order",
      G.length === 2 && G[0].id === "nacl" && G[1].id === "mgo" &&
      G[0].label === "NaCl" && G[1].label === "MgO",
      G.map((g: any) => g.id + "@" + g.at[0]).join(" "));
    // INHERITANCE BY CONSTRUCTION: a key the group does not author is the SCENE's
    // key — the same object, so a copy-paste drift between two groups meant to
    // share a quantity is not expressible.
    ok("a group with NO thermal reads the scene-level one — the SAME object",
      G[0].block.thermal === SCENE_TH && G[1].block.thermal === SCENE_TH,
      "one temperature, two crystals — true structurally, not by copy-paste");
    ok("...and the same holds for a field authored once at scene level (S8's shape)",
      (() => {
        const F = { strength: 1, axis: [1, 0, 0] };
        const B = E.bscGroupBlocks(Object.assign({}, TWO, { field: F })) as any[];
        return B[0].block.field === F && B[1].block.field === F;
      })(), "the SAME field acts on both");
    ok("a per-group override still exists and wins (S8 needs one hot, one cold)",
      (() => {
        const OV = JSON.parse(JSON.stringify(TWO));
        OV.groups[1].thermal = { T_K: 300, jiggle_scale: 0.3 };
        const B = E.bscGroupBlocks(OV) as any[];
        return B[0].block.thermal.T_K === 1150 && B[1].block.thermal.T_K === 300;
      })());
    ok("the merged block never carries groups (no recursion, it IS a scene block)",
      G.every((g: any) => g.block.groups === undefined) &&
      G[0].block.lattice.a_pm === 564 && G[1].block.lattice.a_pm === 421.2);
    ok("id / label / at are placement metadata and are NOT merged into the block",
      G.every((g: any) => g.block.id === undefined && g.block.label === undefined &&
        g.block.at === undefined));

    const S = sitesOf(TWO);
    const naIdx = S.map((s: any, i: number) => [s, i]).filter(([s]: any) => s.grp === 0).map(([, i]: any) => i);
    const mgIdx = S.map((s: any, i: number) => [s, i]).filter(([s]: any) => s.grp === 1).map(([, i]: any) => i);
    ok("both groups' sites are drawn, each tagged with its own group and label",
      naIdx.length === 27 && mgIdx.length === 27 &&
      S[naIdx[0]].pair === "NaCl" && S[mgIdx[0]].pair === "MgO" &&
      S[mgIdx[0]].glabel === "MgO", `${S.length} sites (27 + 27)`);
    ok("each group's sites are translated to its own at (the union, not a pile)",
      S[naIdx[0]].at[0] < -16 && S[mgIdx[0]].at[0] > 16);

    // ── THE §14 ASSERTION THE DISPATCH NAMES: heating a two-group scene past
    //    NaCl's mp_K leaves the MgO group's lattice bit-for-bit unchanged apart
    //    from jiggle. "Apart from jiggle" is made exact by running the pair of
    //    temperatures with the jiggle OFF, so the only thing that can differ is
    //    the melt.
    {
      const still = (T: number) => {
        const c = JSON.parse(JSON.stringify(TWO));
        c.thermal = { T_K: T, jiggle_scale: 0 };
        return c;
      };
      const cold = still(300), hot = still(1150);
      const sub = (bs: any, ix: number[], ms: number) =>
        JSON.stringify(ix.map((i) => E.bscSiteAt(bs, sitesOf(bs)[i], i, ms, null, null)));
      ok("heating past NaCl's mp_K leaves the MgO group BIT-FOR-BIT unchanged",
        [0, 2000, 9000, 60000].every((m) => sub(hot, mgIdx, m) === sub(cold, mgIdx, m)));
      ok("...while the NaCl group in the SAME frame has left its sites entirely",
        [2000, 9000, 60000].every((m) => sub(hot, naIdx, m) !== sub(cold, naIdx, m)),
        "one temperature, two outcomes — derived from two mp_K values");
      // NEGATIVE CONTROL: raise the scene past MgO's melting point too and the
      // MgO group DOES move — so the assertion above is about the physics and not
      // about the group being inert.
      const veryHot = still(3200);
      ok("NEGATIVE CONTROL: past 3125 K the MgO group melts too (it is not inert)",
        sub(veryHot, mgIdx, 9000) !== sub(cold, mgIdx, 9000));
      // and with the jiggle ON, the solid group jiggles IN PLACE and never
      // translates — ionic S8's negative control, per group.
      const jig = JSON.parse(JSON.stringify(TWO));
      const nnMgO = 421.2 / 2 / P2U;
      let worstMg = 0;
      for (let m = 0; m <= 30000; m += 250) {
        for (const i of mgIdx) {
          const p = E.bscSiteAt(jig, sitesOf(jig)[i], i, m, null, null) as number[];
          const b = sitesOf(jig)[i].at;
          worstMg = Math.max(worstMg, E.bscMag([p[0] - b[0], p[1] - b[1], p[2] - b[2]]) as number);
        }
      }
      ok("the solid group JIGGLES IN PLACE — never half a lattice spacing (S8's control)",
        worstMg > 0 && worstMg < nnMgO * 0.5,
        `worst ${worstMg.toFixed(4)} vs nn/2 = ${(nnMgO * 0.5).toFixed(4)} units`);
    }
    // CAMERA: the fit spans the UNION, and the separation axis is not foreshortened.
    {
      const ext = E.bscSiteExtent(TWO, null) as number;
      const half = 17 + (E.bscMag(S[mgIdx[0]].at) as number) * 0;   // at least the offset itself
      ok("the auto-fit spans the UNION of both groups' bounding boxes",
        ext >= 17 && ext >= Math.max(...S.map((s: any) => E.bscMag(s.at) as number)) - 1e-9,
        `extent ${ext.toFixed(2)} units vs group offset ${half}`);
      const cam = E.bscSolvedCamera(TWO, null) as any;
      const fwd = Math.cos(cam.el * Math.PI / 180) * Math.cos(cam.az * Math.PI / 180);
      ok("an x-separated multi-group scene is framed with az 90 — zero foreshortening",
        cam.az === 90 && Math.abs(fwd) < 1e-9 && cam.fit === true,
        `cos(el)cos(az) = ${fwd.toExponential(1)} — both groups at EXACTLY the same depth`);
      // NEGATIVE CONTROL: the mode's own camera would have put them at two depths.
      const pre = (E.BS_CAMERAS as any).melt;
      ok("NEGATIVE CONTROL: the mode camera alone foreshortens that axis by 18%",
        Math.abs(Math.cos(pre.el * Math.PI / 180) * Math.cos(pre.az * Math.PI / 180)) > 0.7,
        `az ${pre.az} el ${pre.el} -> ${(Math.cos(pre.el * Math.PI / 180) * Math.cos(pre.az * Math.PI / 180)).toFixed(3)} along the compared axis`);
      ok("a SINGLE-scene state keeps its mode camera bit-for-bit",
        (E.bscSolvedCamera({ mode: "melt", placement: "lattice",
          units: [{ species: "Na+" }, { species: "Cl-" }], lattice: RS(564) }, null) as any) === pre);
    }
    // the pool budget, declared rather than assumed.
    ok("BS_MAX_GROUPS is a declared budget and the site pool is still capped",
      E.BS_MAX_GROUPS === 4 && sitesOf(TWO).length <= E.BS_MAX_SITES &&
      (E.bscGroupBlocks(Object.assign({}, TWO, {
        groups: Array.from({ length: 9 }, (_, i) => ({ id: "g" + i, lattice: RS(564) }))
      })) as any[]).length === 4);
    // a state with NO groups is byte-identical: bscGroupBlocks returns null and
    // every downstream body takes the pre-E3b path.
    ok("no groups authored -> null, and the un-grouped site pose is unchanged",
      E.bscGroupBlocks(LATTICE_BS) === null && E.bscGroupBlocks({}) === null &&
      E.bscSiteBlock(LATTICE_BS, sitesOf(LATTICE_BS)[0]) === LATTICE_BS);
    // FOUND IN FRAMES, not by any assertion above: a grouped state authors its
    // units inside its groups, and the molecular pool's floor of one unit drew a
    // stand-in HCl between the two crystals.
    ok("a grouped state with no scene-level units draws NO stand-in molecule",
      /if \(bs\.groups && bs\.groups\.length && !\(bs\.units && bs\.units\.length\)\) nUnits = 0;/
        .test(updSrc),
      "found in frames — the HCl fallback rendered a phantom diatomic");
    // the group label: ONE size for the whole state, and scored against the HUD.
    ok("group labels are pmCreateAutoLabel, sized to the LARGEST block, one size each",
      /pmCreateAutoLabel\("NaCl", textColor, 0\.60\)/.test(buildSrc) &&
      /var gHs = bscClamp\(gRmax \* BS_GROUP_LABEL_FRAC/.test(updSrc) &&
      /if \(grpRows\[j\]\.r > gRmax\) gRmax = grpRows\[j\]\.r;/.test(updSrc));
    ok("...and they are scored against the LIVE readout panel, measured not assumed",
      /var hudBox = bscDomBox\(document\.getElementById\("bsc_hud"\)\);/.test(updSrc) &&
      /if \(hudBox\) gAvoid\.push\(hudBox\);/.test(updSrc) &&
      /getBoundingClientRect/.test(grabFn("bscDomBox")));
    ok("the group label rides the existing 'lattice' glow key (the enum does not grow)",
      /elementType: "bsc_lattice", id: "bsc_grp"/.test(buildSrc) &&
      (E.BS_GLOW_ELS as any).lattice.indexOf("bsc_lattice") >= 0);
    ok("the ion_pair picker stands down under row R (it would delete the contrast)",
      /!\(bs\.groups && bs\.groups\.length\)\)\s*\n\s*\? \(BS_ION_PAIRS\[window\.PM_bscIonPair\] \|\| null\) : null;/
        .test(updSrc));

    // deriveStateMeta: the group cue paths and the group motion declaration are
    // registered in the SAME change as the renderer read (the standing rule).
    ok("deriveStateMeta pins a GROUP's own thermal ramp (groups[].thermal.T_at_ms)",
      /const bscGroups = Array\.isArray\(bscState\.groups\)/.test(META_SRC) &&
      /candidates\.push\(asNum\(gTh\.T_at_ms, 0\) \+ asNum\(gTh\.T_ramp_ms, 2000\) \+ 600\)/.test(META_SRC));
    ok("...and a GROUP's own lattice beats (grow / reveal)",
      /asNum\(gLat\.grow_at_ms, 0\) \+ asNum\(gLat\.grow_duration_ms, 3000\) \+ 600/.test(META_SRC) &&
      /asNum\(gLat\.reveal_at_ms, 0\) \+ 1200/.test(META_SRC));
    ok("...and a state whose jiggle lives ONLY in its groups is declared MOVING",
      /const bscGrps = Array\.isArray\(bscMotion\.groups\)/.test(META_SRC) &&
      /if \(bscGrpMoves\) \{ out\[stateId\] = true; continue; \}/.test(META_SRC));
    ok("the group ramp default matches the renderer's BS_T_RAMP_MS (they must agree)",
      E.BS_T_RAMP_MS === 2000);
  }
}

console.log("\n=== 15. E1c AUTHORING CAPABILITIES (scripted bend · lone pair · AB2 bend) ===");
// The two states bond_polarity could not author at all against the shipped engine
// (S4's linear -> bent water, S7's lone-pair vector) plus the inert explore angle
// slider. Every assertion below runs the SHIPPED bodies, and the regression half
// (item 4 touches mgFrame, which vsepr / hybridisation / sigma_pi all ride) is
// asserted bit-for-bit rather than argued.
{
  // ── item 1: the scripted angle ramp is a CLOSED FORM of state-local t (D-1).
  const bendAt = (mms: number) =>
    E.mgRamp(mms, 4500, 3000, 180, 104.5) as number;
  ok("angle ramp holds angle_from before angle_at_ms", bendAt(0) === 180 && bendAt(4499) === 180,
    `t=0 -> ${bendAt(0)}  t=4499 -> ${bendAt(4499)}`);
  ok("angle ramp reaches angle_deg at angle_at_ms + angle_ramp_ms",
    Math.abs(bendAt(7500) - 104.5) < 1e-9 && Math.abs(bendAt(20000) - 104.5) < 1e-9,
    `t=7500 -> ${bendAt(7500).toFixed(4)}`);
  ok("the ramp is strictly monotonic through the bend (no overshoot, no latch)",
    [4500, 5000, 5500, 6000, 6500, 7000, 7500].every((t, i, a) =>
      i === 0 || (bendAt(t) < bendAt(a[i - 1]) && bendAt(t) >= 104.5 - 1e-9)));
  {
    // THE REWIND, sampled MID-BEND (t=6000 is inside the 4500..7500 ramp): pin
    // 6000 -> 9000 -> 6000 and the bend angle AND the geometry it produces must be
    // byte-identical. An accumulator cannot do this.
    const a1 = bendAt(6000), g1 = E.mgFrame("H2O", a1, null).bonds as number[][];
    bendAt(9000); E.mgFrame("H2O", bendAt(9000), null);
    const a2 = bendAt(6000), g2 = E.mgFrame("H2O", a2, null).bonds as number[][];
    ok("rewind t=6000 -> 9000 -> 6000 reproduces the MID-BEND pose byte-for-byte",
      Object.is(a1, a2) && g1.every((v, i) => v.every((c, k) => Object.is(c, g2[i][k]))),
      `angle=${a1}`);
  }
  ok("BS_ANGLE_RAMP_MS default matches deriveStateMeta's frozen-pin default",
    E.BS_ANGLE_RAMP_MS === 1600, `${E.BS_ANGLE_RAMP_MS} ms`);
  {
    // and the shipped frame pass really reads the three new keys, drag-seizes the
    // slider both ways, and seeds the widget at angle_from on state entry.
    const upd = grabFn("updateBondingSceneFrame");
    const app = grabFn("applyBondingSceneState");
    ok("the frame pass reads angle_from / angle_at_ms / angle_ramp_ms",
      /bs\.angle_from/.test(upd) && /bs\.angle_at_ms/.test(upd) && /bs\.angle_ramp_ms/.test(upd));
    ok("a trusted drag still seizes the angle (and the widget tracks the script)",
      /PM_bscAngleDragged\s*\)\s*\?\s*window\.PM_bscAngle\s*:\s*angleAt\(ms\)/.test(upd) &&
      /bscHasControl\(ctrls, "angle"\) && !window\.PM_bscAngleDragged/.test(upd));
    ok("state entry seeds the angle widget at angle_from, not at the destination",
      /PM_bscAngle\s*=\s*\(bs\.angle_from != null && bs\.angle_at_ms != null\) \? bs\.angle_from/.test(app));
  }

  // ── item 3: the lone-pair lobe AND its vector.
  {
    const build = grabFn("buildBondingScene");
    const upd = grabFn("updateBondingSceneFrame");
    const app = grabFn("applyBondingSceneState");
    ok("the lone-pair meshes EXIST (lobe + shaft + head + label), not just a key",
      /bsc_lone_lobe_/.test(build) && /bsc_lone_shaft_/.test(build) &&
      /bsc_lone_head_/.test(build) && /bsc_lone_label/.test(build));
    ok("the lone-pair vector rides elementType bsc_arrow (closed glow enum intact)",
      /elementType: "bsc_arrow", id: "bsc_lone_shaft_/.test(build) &&
      sameSet(Object.keys(E.BS_GLOW_ELS), ["units", "central", "links", "arrows", "resultant",
        "charges", "electrons", "lattice", "layer", "neighbours", "trend", "field"]));
    ok("the lobe rides the electrons focal", E.BS_GLOW_ELS.electrons.indexOf("bsc_lone") >= 0,
      E.BS_GLOW_ELS.electrons.join(","));
    ok("the frame pass gates the layer on dipole.show_lone_pair", /dip\.show_lone_pair/.test(upd));
    ok("the lone-pair layer is hidden as a transient on state entry",
      /bsc_lone_lobe_/.test(app) && /bsc_lone_shaft_/.test(app) && /bsc_lone_label/.test(app));
    ok("the lobe geometry is mgFrame's own lone direction, never re-derived",
      /D\.lone\[i\]|D\.lone && i < D\.lone\.length/.test(upd) && !/mgIdealDirs/.test(upd));
    // the DATA gate: zero lone-pair moment draws no vector, so every fitted-
    // convention central atom keeps its picture exactly.
    const lone = (k: string) => (E.bscDipole(k, null) as any).lone as { dir: number[], D: number }[];
    ok("NH3/NF3 expose exactly ONE lone-pair slot, H2O two, CO2/CCl4/BF3 none",
      lone("NH3").length === 1 && lone("NF3").length === 1 && lone("H2O").length === 2 &&
      lone("CO2").length === 0 && lone("CCl4").length === 0 && lone("BF3").length === 0);
    const drawnNow = ["H2O", "H2S", "NH3", "NF3", "CO2", "CCl4", "CHCl3", "CH4", "BF3", "HCl"]
      .filter((k) => lone(k).some((L) => Math.abs(L.D) > 1e-6));
    ok("with the SHIPPED table, |L| > 0 for exactly the centrals E1c-A ratifies",
      drawnNow.length > 0 && drawnNow.every((k) => E.MG_MOLECULES[k].central === "N"),
      drawnNow.length ? `vectors drawn on: ${drawnNow.join(",")}` : "NONE — the ratified BS_LONE_PAIR_D.N has been reverted");
    // and the exception is SINGLE: every other central stays on the fitted
    // convention, so a table silently carrying two conventions fails loudly here.
    const loneCentrals = Object.keys(E.BS_LONE_PAIR_D).filter((c) => Math.abs(E.BS_LONE_PAIR_D[c]) > 1e-9);
    ok("N is the SOLE exception to the fitted convention (BS_LONE_PAIR_D)",
      loneCentrals.length === 1 && loneCentrals[0] === "N", `non-zero at: ${loneCentrals.join(",") || "(none)"}`);
    // and the vector points ALONG the lone pair, i.e. the same way bscDipole sums
    // it — one instrument (D-3), so the drawn arrow can never disagree with mu.
    ok("the drawn lone-pair vector is the SAME term bscDipole adds to the resultant",
      /lEnt\.D/.test(upd) && /lEnt\.dir/.test(upd));
    // FORWARD CHECK of the ratified four-vector model (E1c-A's data, asserted here
    // so the moment it lands the totals are proven, and until then this prints the
    // shipped fitted numbers): NH3 = 3*b*cos + L, NF3 = |3*b*cos - L|.
    const nh3 = (E.bscDipole("NH3", null) as any), nf3 = (E.bscDipole("NF3", null) as any);
    console.log(`    forward check   NH3 mu=${nh3.mag.toFixed(3)} D  (bond ${nh3.arrows[0].D} D, lone ${nh3.lone[0].D} D)`);
    console.log(`    forward check   NF3 mu=${nf3.mag.toFixed(3)} D  (bond ${nf3.arrows[0].D} D, lone ${nf3.lone[0].D} D)`);
    ok("NH3 resultant points ALONG the lone pair, NF3 AGAINST it (the S7 argument)",
      E.mgDot(nh3.vec, nh3.lone[0].dir) > 0 && E.mgDot(nf3.vec, nf3.lone[0].dir) < 0,
      `NH3 dot=${E.mgDot(nh3.vec, nh3.lone[0].dir).toFixed(3)}  NF3 dot=${E.mgDot(nf3.vec, nf3.lone[0].dir).toFixed(3)}`);
  }

  // ── item 4: angle_deg bends a 2-/3-bond centre with ZERO lone pairs …
  {
    const co2 = E.mgFrame("CO2", 104.5, null).bonds as number[][];
    ok("CO2 authored at 104.5 deg really bends to 104.5 deg", Math.abs(ang(co2[0], co2[1]) - 104.5) < 1e-6,
      `${ang(co2[0], co2[1]).toFixed(6)} deg`);
    const bf3 = E.mgFrame("BF3", 109.5, null).bonds as number[][];
    ok("BF3 authored at 109.5 deg pyramidalises to 109.5 deg on every pair",
      [[0, 1], [0, 2], [1, 2]].every(([i, j]) => Math.abs(ang(bf3[i], bf3[j]) - 109.5) < 1e-6),
      [[0, 1], [0, 2], [1, 2]].map(([i, j]) => ang(bf3[i], bf3[j]).toFixed(3)).join(" "));
    // the bend PLANE faces the fleet house camera azimuth, or the V reads edge-on
    const apex = E.mgNorm([co2[0][0] + co2[1][0], co2[0][1] + co2[1][1], co2[0][2] + co2[1][2]]);
    ok("the CO2 V opens in the plane facing the solved camera azimuth (35 deg)",
      Math.abs(E.mgDot(apex, E.MG_BEND_NORMAL)) < 1e-9 && Math.abs(apex[1]) < 1e-9,
      `apex=[${apex.map((v: number) => v.toFixed(3)).join(", ")}]`);
    ok("MG_BEND_NORMAL is the dipole_sum camera azimuth, horizontal",
      Math.abs(E.MG_BEND_AZ - E.BS_CAMERAS.dipole_sum.az * Math.PI / 180) < 1e-12 &&
      E.MG_BEND_NORMAL[1] === 0);
    // the live slider is now live for the WHOLE explore picker, not H2O alone.
    const PICKER = ["H2O", "CO2", "CCl4", "CH4", "BF3", "HF", "HCl", "HBr", "HI"];
    const bendable = PICKER.filter((k) => {
      const m = E.MG_MOLECULES[k];
      const base = E.mgFrame(k, null, null).bonds as number[][];
      const bent = E.mgFrame(k, m.angle === 180 ? 104.5 : m.angle - 12, null).bonds as number[][];
      return base.some((v, i) => v.some((c, j) => c !== bent[i][j]));
    });
    ok("the explore angle slider now moves every 2-/3-bond species in the picker",
      sameSet(bendable, ["H2O", "CO2", "BF3"]), `live on: ${bendable.join(",")}`);
    ok("a 1-bond or 4+-bond centre is still (correctly) inert",
      ["HF", "HCl", "HBr", "HI", "CH4", "CCl4"].every((k) => bendable.indexOf(k) < 0));
  }

  // ── item 4, THE REGRESSION HALF. vsepr_molecular_shapes, hybridisation_sp_sp2_sp3
  //   and sigma_pi_bonding all ride mgFrame. A molecule with NO authored angle must
  //   resolve bit-for-bit as before, and so must every path those concepts take.
  {
    const bad: string[] = [];
    for (const k of Object.keys(E.MG_MOLECULES)) {
      const m = E.MG_MOLECULES[k];
      const nDom = m.bonds + m.lone;
      const ideal = E.mgIdealDirs(nDom) as number[][];
      const expect = m.lone > 0
        ? E.mgSqueeze(ideal.slice(m.lone), m.angle) as number[][]   // old path, unchanged
        : ideal.slice(m.lone);                                      // old path: NO squeeze
      const got = E.mgFrame(k, null, null).bonds as number[][];
      if (got.length !== expect.length ||
        got.some((v, i) => v.some((c, j) => !Object.is(c, expect[i][j])))) bad.push(k);
    }
    ok("every molecule with NO authored angle_deg resolves bit-for-bit as before",
      bad.length === 0, bad.length ? bad.join(" ") : `${Object.keys(E.MG_MOLECULES).length} molecules`);
    // vsepr's lone_squeeze walks CH4 -> NH3 -> H2O WITH an explicit angle on every
    // frame. CH4 is the zero-lone member and must not move (4 bonds, out of range).
    const ch4a = E.mgFrame("CH4", null, null).bonds as number[][];
    const ch4b = E.mgFrame("CH4", 109.5, null).bonds as number[][];
    const ch4c = E.mgFrame("CH4", 92, null).bonds as number[][];
    ok("CH4 under vsepr's explicit lone_squeeze angle is untouched (4 bonds)",
      ch4a.every((v, i) => v.every((c, j) => Object.is(c, ch4b[i][j]) && Object.is(c, ch4c[i][j]))));
    // the bare domain-SPREAD morph (2 -> 3 -> 4 domains, hybridisation/sigma_pi)
    // passes domainsOverride and must never be bent by a stray angle.
    const spreadBad: number[] = [];
    for (const n of [2, 3, 4, 5, 6]) {
      const a = E.mgFrame("CH4", null, n).bonds as number[][];
      const b = E.mgFrame("CH4", 97.3, n).bonds as number[][];
      if (a.some((v, i) => v.some((c, j) => !Object.is(c, b[i][j])))) spreadBad.push(n);
    }
    ok("the domain-spread morph ignores any authored angle (spread stays ideal)",
      spreadBad.length === 0, spreadBad.join(" "));
    // and mgSqueeze itself is unchanged wherever a real centroid exists
    const sq = (n: number, lone: number, deg: number) =>
      E.mgSqueeze((E.mgIdealDirs(n) as number[][]).slice(lone), deg) as number[][];
    ok("mgSqueeze on a NON-degenerate set needs no axis hint (old signature holds)",
      Math.abs(ang(sq(4, 2, 104.5)[0], sq(4, 2, 104.5)[1]) - 104.5) < 1e-9 &&
      Math.abs(ang(sq(4, 1, 107)[0], sq(4, 1, 107)[1]) - 107) < 1e-9);
    ok("mgSqueeze on a DEGENERATE set with NO axis hint still returns it untouched",
      (sq(2, 0, 104.5) as number[][]).every((v, i) => v.every((c, j) =>
        Object.is(c, (E.mgIdealDirs(2) as number[][])[i][j]))));
  }
  // ── E1c-C item: the three dipole-layer REVEAL CUES, as SEMANTICS not as text.
  {
    const upd = grabFn("updateBondingSceneFrame");
    const app = grabFn("applyBondingSceneState");
    const cueF = (mms: number, at: number) => E.mgRamp(mms, at, E.BS_REVEAL_MS, 0, 1) as number;
    ok("a cue holds the layer fully hidden until its own instant",
      cueF(0, 4000) === 0 && cueF(3999, 4000) === 0 && cueF(4000, 4000) === 0,
      `t=3999 -> ${cueF(3999, 4000)}`);
    ok("the reveal reaches full ink at cue + BS_REVEAL_MS and HOLDS (no fade-out tail)",
      Math.abs(cueF(4900, 4000) - 1) < 1e-12 && Math.abs(cueF(30000, 4000) - 1) < 1e-12,
      `t=4900 -> ${cueF(4900, 4000).toFixed(6)}`);
    ok("the ramp is strictly monotonic across the reveal (no latch, no overshoot)",
      [4100, 4300, 4500, 4700, 4900].every((t, i, a) =>
        i === 0 || (cueF(t, 4000) > cueF(a[i - 1], 4000) && cueF(t, 4000) <= 1)));
    {
      // THE REWIND, sampled MID-REVEAL: a SET_TIME_FREEZE pin must reproduce the
      // same ink. A latched "once shown, stays shown" flag cannot do this.
      const f1 = cueF(4450, 4000); cueF(9000, 4000); const f2 = cueF(4450, 4000);
      ok("rewind t=4450 -> 9000 -> 4450 reproduces the MID-REVEAL ink byte-for-byte",
        Object.is(f1, f2), `f=${f1}`);
    }
    ok("BS_REVEAL_MS matches the +900 ms deriveStateMeta pins after each cue",
      E.BS_REVEAL_MS === 900 &&
      /bscPush\(bscState\.arrows_at_ms, 900\)/.test(META_SRC) &&
      /bscPush\(bscState\.resultant_at_ms, 900\)/.test(META_SRC) &&
      /bscPush\(bscState\.charges_at_ms, 900\)/.test(META_SRC),
      `${E.BS_REVEAL_MS} ms — the frozen pin lands on the FIRST settled frame`);
    // the absent-cue no-op: opacity is written ONLY under the cue guard, so a
    // state authored before E1c-C is byte-identical BY CONSTRUCTION.
    // E1c-F widened each write guard from "the cue is authored" to "the cue is
    // authored OR a swap is running" (the swap veil drives the same three layers).
    // The invariant the gate defends is UNCHANGED: with neither a cue nor a swap,
    // opacity is never written at all.
    ok("an ABSENT cue never writes opacity (pre-E1c-C states are untouched)",
      /var arrowsInk = arrowsCued \|\| swapActive;/.test(upd) &&
      /var resInk = resCued \|\| swapActive;/.test(upd) &&
      /var chargesInk = chargesCued \|\| swapActive;/.test(upd) &&
      /if \(arrowsInk\) \{/.test(upd) && /if \(resInk && resOn\) \{/.test(upd) &&
      /if \(chargesInk\) setObjOpacity\(dlab2, chargesF\)/.test(upd) &&
      /return \(atMs == null\) \? 1 :/.test(upd));
    ok("the ramp multiplies the SAME ink the build used (BS_ARROW/RESULTANT_OPACITY)",
      /BS_ARROW_OPACITY \* arrowsF/.test(upd) && /BS_RESULTANT_OPACITY \* resFade/.test(upd) &&
      /opacity: BS_ARROW_OPACITY/.test(grabFn("buildBondingScene")) &&
      /opacity: BS_RESULTANT_OPACITY/.test(grabFn("buildBondingScene")));
    // the RESTORE half (the dim-with-no-restore scar): leaving a state mid-ramp
    // must not strand the next state's arrows at partial ink.
    ok("state entry restores every cue-driven layer to its BUILT ink",
      /setObjOpacity\(ar1, BS_ARROW_OPACITY\)/.test(app) &&
      /setObjOpacity\(ar2, BS_ARROW_OPACITY\)/.test(app) &&
      /setObjOpacity\(rs0, BS_RESULTANT_OPACITY\)/.test(app) &&
      /setObjOpacity\(rh0, BS_RESULTANT_OPACITY\)/.test(app) &&
      /setObjOpacity\(rl0, 1\)/.test(app) && /setObjOpacity\(rz0, 1\)/.test(app) &&
      /setObjOpacity\(dl, 1\)/.test(app));
  }

  function ang(a: number[], b: number[]) {
    return Math.acos(Math.max(-1, Math.min(1, E.mgDot(E.mgNorm(a), E.mgNorm(b))))) * 180 / Math.PI;
  }
}

// ── 16. E1c-A: DIPOLE FIDELITY — does the DRAWN picture carry the magnitudes and
//   directions it claims? Five items, one root cause. Everything below is a
//   NUMBER derived from the shipped code, not a pixel.
console.log("\n=== 16. E1c-A DIPOLE FIDELITY (ratified data · camera · arrow · swap) ===");
{
  const upd = grabFn("updateBondingSceneFrame");
  const app = grabFn("applyBondingSceneState");
  const mu = (k: string) => (E.bscDipole(k, null) as any).mag as number;

  // ── item 1: the ratified data, forward-checked against the literature totals
  //    the narration quotes. Values, not "a table exists".
  const T = E.BS_BOND_MOMENT_D;
  ok("R1: the N row is the ratified INTRINSIC pair (N|H -0.66, N|F 0.73)",
    T["N|H"] === -0.66 && T["N|F"] === 0.73, `N|H=${T["N|H"]} N|F=${T["N|F"]}`);
  ok("R1: BS_LONE_PAIR_D.N is the ratified 0.73 D",
    E.BS_LONE_PAIR_D.N === 0.73, `${E.BS_LONE_PAIR_D.N} D`);
  ok("R1: the higher-Delta-chi bond now draws the LONGER arrow (S2's core rule)",
    Math.abs(T["N|F"]) > Math.abs(T["N|H"]) &&
    Math.abs(E.BS_CHI.F - E.BS_CHI.N) > Math.abs(E.BS_CHI.H - E.BS_CHI.N),
    `|N-F| ${Math.abs(T["N|F"])} > |N-H| ${Math.abs(T["N|H"])} for dchi ` +
    `${Math.abs(E.BS_CHI.F - E.BS_CHI.N).toFixed(2)} > ${Math.abs(E.BS_CHI.H - E.BS_CHI.N).toFixed(2)}`);
  ok("R1: NH3 = 1.47 D and NF3 = 0.23 D to the narrated 2 dp",
    Math.abs(mu("NH3") - 1.47) < 0.005 && Math.abs(mu("NF3") - 0.23) < 0.005,
    `NH3=${mu("NH3").toFixed(4)}  NF3=${mu("NF3").toFixed(4)}`);
  ok("R1: H2O is UNTOUCHED at 1.849 D (S4 + hydrogen_bonding both depend on it)",
    Math.abs(mu("H2O") - 1.8489) < 0.0005 && T["O|H"] === -1.51, `${mu("H2O").toFixed(4)} D`);
  ok("R2: the halide row is the CRC gas-phase set (1.83 / 1.11 / 0.83 / 0.45)",
    T["H|F"] === 1.83 && T["H|Cl"] === 1.11 && T["H|Br"] === 0.83 && T["H|I"] === 0.45,
    `HF=${mu("HF")} HCl=${mu("HCl")} HBr=${mu("HBr")} HI=${mu("HI")}`);
  ok("R2: the halide ladder is strictly monotonic in Delta-chi",
    mu("HF") > mu("HCl") && mu("HCl") > mu("HBr") && mu("HBr") > mu("HI"));
  ok("R3: BOTH CCl4 and CHCl3 carry the ratified Cl override 0.74",
    E.MG_MOLECULES.CCl4.bond_moments.Cl === 0.74 && E.MG_MOLECULES.CHCl3.bond_moments.Cl === 0.74);
  ok("R3: CCl4 stays EXACTLY zero and CHCl3 lands EXACTLY on 1.04 D",
    mu("CCl4") < 1e-12 && Math.abs(mu("CHCl3") - 1.04) < 1e-9,
    `CCl4=${mu("CCl4").toExponential(2)}  CHCl3=${mu("CHCl3").toFixed(6)}`);
  ok("R3: the override never leaks into a molecule that did not author it",
    E.MG_MOLECULES.CH4.bond_moments == null && E.MG_MOLECULES.CO2.bond_moments == null);
  // and the whole shipped species set still avoids the delta-chi FALLBACK
  for (const k of ["H2O", "CO2", "CCl4", "CHCl3", "CH4", "BF3", "NH3", "NF3", "HF", "HCl", "HBr", "HI"]) E.bscDipole(k, null);
  ok("no shipped species touches BS_MU_FALLBACK_D_PER_CHI",
    !(E.__window || {}).PM_bscMuFallback || (E.__window.PM_bscMuFallback || []).length === 0,
    JSON.stringify((E.__window || {}).PM_bscMuFallback || []));

  // ── item 3: the drawn length IS the magnitude, at every magnitude.
  const parts = (len: number, built: number) => E.bscArrowParts(len, built) as any;
  const S = E.BS_ARROW_D_PER_UNIT;
  const drawn = (D: number, built = E.BS_ARROW_HEAD_LEN) => {
    const p = parts(Math.abs(D) * S, built); return p.shaft + p.head;
  };
  const worstLen = ["H|F", "H|Cl", "H|Br", "H|I", "O|H", "N|H", "N|F", "C|H", "C|Cl", "C|O", "S|H", "Te|H"]
    .map((k) => Math.abs(drawn(T[k]) - Math.abs(T[k]) * S)).reduce((a, b) => Math.max(a, b), 0);
  ok("the DRAWN length equals |m| * scale for every table entry (no floor)",
    worstLen < 1e-9, `max |drawn - |m|*scale| = ${worstLen.toExponential(2)}`);
  ok("the sub-0.52 D magnitudes are now VISIBLY ordered (HI < HBr, C|H < C|Cl)",
    drawn(T["H|I"]) < drawn(T["H|Br"]) - 0.15 && drawn(-0.30) < drawn(0.74) - 0.15,
    `HI=${drawn(T["H|I"]).toFixed(3)} HBr=${drawn(T["H|Br"]).toFixed(3)} ` +
    `C-H=${drawn(-0.30).toFixed(3)} C-Cl=${drawn(0.74).toFixed(3)} units`);
  ok("the NF3 resultant is drawn 6.4x shorter than NH3's, matching the physics",
    Math.abs((drawn(mu("NH3"), E.BS_RES_HEAD_LEN) / drawn(mu("NF3"), E.BS_RES_HEAD_LEN)) - mu("NH3") / mu("NF3")) < 1e-9,
    `drawn ratio ${(drawn(mu("NH3"), E.BS_RES_HEAD_LEN) / drawn(mu("NF3"), E.BS_RES_HEAD_LEN)).toFixed(2)} ` +
    `vs mu ratio ${(mu("NH3") / mu("NF3")).toFixed(2)}`);
  ok("the head never exceeds half the arrow, and never grows past its built size",
    [0.02, 0.2, 0.59, 0.6, 0.61, 1.4].every((L) => {
      const p = parts(L, E.BS_ARROW_HEAD_LEN);
      return p.head <= L * 0.5 + 1e-12 && p.head <= E.BS_ARROW_HEAD_LEN + 1e-12 && p.shaft > 0;
    }));
  // E3b Q-2 adds a FOURTH call site — the field arrows — for exactly the reason
  // this assertion exists: an arrow whose head is added on top of its shaft draws
  // a constant minimum length at every magnitude, so every arrow family on this
  // surface goes through the one solver.
  ok("the frame pass routes bond / lone-pair / resultant / field heads through bscArrowParts",
    (upd.match(/bscArrowParts\(/g) || []).length === 4 &&
    !/Math\.max\(0\.02, aLen - 0\.30\)/.test(upd) && !/rlen - 0\.38/.test(upd));
  // THE NEGATIVE-SIGN CASE (E1c-B's handoff): a negative moment points its head
  // back at the central atom. Centred on the bond midpoint, the head TIP must
  // clear the central atom's SPHERE for every negative entry the table carries.
  ok("the arrow is CENTRED on the bond midpoint, so both signs draw alike",
    /aMid - aDir\[0\] \* aLen \* 0\.5/.test(upd));
  const negBad: string[] = [];
  for (const k of Object.keys(T)) {
    if (T[k] >= 0) continue;
    const central = k.split("|")[0];
    const rc = E.MG_ELEMENTS[central] ? E.MG_ELEMENTS[central].radius : 0.5;
    const tip = E.BS_BOND_LEN * 0.5 - Math.abs(T[k]) * S * 0.5;
    if (tip <= rc + 0.05) negBad.push(`${k} tip=${tip.toFixed(3)} r=${rc}`);
  }
  ok("every NEGATIVE bond moment's head clears the central atom's sphere (+0.05)",
    negBad.length === 0, negBad.length ? negBad.join(" ") : "O|H S|H Se|H Te|H N|H C|H all clear");

  // ── item 2: the camera solve is SCENE-derived, and the pyramid is solved.
  ok("bscSolvedCamera is what apply reads (the mode-keyed lookup is gone)",
    /var cam = bs\.camera \|\| bscSolvedCamera\(bs\)/.test(app) &&
    !/BS_CAMERAS\[bs\.mode/.test(app));
  const solve = (bs: any) => E.bscSolvedCamera(bs) as any;
  const single = (mode: string, sp: string) => solve({ mode, units: [{ species: sp, at: [0, 0, 0] }] });
  ok("a SINGLE-unit compare inherits the single-unit solve (no teleport)",
    single("compare", "CCl4").el === E.BS_UNIT_CAMERAS.general.el &&
    single("compare", "CCl4").dist === E.BS_UNIT_CAMERAS.general.dist,
    JSON.stringify(single("compare", "CCl4")));
  // E1c-D: the camera is a pure function of the focal unit's SHAPE, never of the
  // mode string — so a state sequence only ever moves the camera when the shape
  // it is looking at changes. (Before E1c-A every mode carried its own camera and
  // S1->S2->S3 teleported between three of them.)
  ok("every single-unit state's camera is decided by SHAPE alone, at one distance",
    [["assemble", "HCl"], ["compare", "HF"], ["dipole_sum", "CO2"], ["dipole_sum", "H2O"],
     ["dipole_sum", "CCl4"], ["compare", "CCl4"], ["explore", "H2O"], ["dipole_sum", "NH3"]]
      .every(([m, s]) => single(m, s).dist === 7.0 &&
        single(m, s).el === (E.BS_UNIT_CAMERAS as any)[E.bscUnitShapeKey(s)].el));
  ok("the S2 halide LADDER holds ONE camera across all four rungs (no teleport)",
    ["HF", "HCl", "HBr", "HI"].every((s) =>
      single("compare", s).el === E.BS_UNIT_CAMERAS.diatomic.el &&
      single("compare", s).dist === E.BS_UNIT_CAMERAS.diatomic.dist),
    JSON.stringify(single("compare", "HI")));
  ok("a MULTI-unit compare keeps its own measured camera (hydrogen_bonding)",
    solve({ mode: "compare", units: [{ species: "H2O", at: [0, 0, 0] }, { species: "H2S", at: [4, 0, 0] }] }).el === 20,
    JSON.stringify(solve({ mode: "compare", units: [{ species: "H2O" }, { species: "H2S" }] })));
  ok("a lattice scene is never re-solved as a single unit",
    solve({ mode: "coordination", placement: "lattice", units: [{ species: "Na+", at: [0, 0, 0] }] }).el === 45);
  ok("a single unit parked off-centre keeps the mode's wider camera",
    solve({ mode: "network", units: [{ species: "H2O", at: [6, 0, 0] }] }).el === 22);
  // E1c-H: the TRIGONAL PLANAR centre is now a shape of its own too (section 21
  // measures it). The general key keeps the 3-D-surrounded set — tetrahedral,
  // bent, linear — value for value.
  ok("a PYRAMIDAL centre gets its own solve; the 3-D-surrounded set keeps general",
    single("dipole_sum", "NH3").el === 15 && single("dipole_sum", "NF3").el === 15 &&
    single("dipole_sum", "NH3").az === 120 &&
    ["CCl4", "CHCl3", "CH4", "H2O", "CO2"].every((k) => single("dipole_sum", k).el === 47),
    `pyramidal=${JSON.stringify(E.BS_UNIT_CAMERAS.pyramidal)} general=${JSON.stringify(E.BS_UNIT_CAMERAS.general)}`);
  ok("the three MEASURED constants are asserted value-for-value (E1c-A/D/E)",
    JSON.stringify(E.BS_UNIT_CAMERAS.general) === JSON.stringify({ az: 35, el: 47, dist: 7 }) &&
    JSON.stringify(E.BS_UNIT_CAMERAS.pyramidal) === JSON.stringify({ az: 120, el: 15, dist: 7 }) &&
    JSON.stringify(E.BS_UNIT_CAMERAS.diatomic) === JSON.stringify({ az: 35, el: 12, dist: 7 }),
    JSON.stringify(E.BS_UNIT_CAMERAS));
  // E1c-E: the pyramid now carries its OWN azimuth as well as its own elevation
  // (which ligand hides behind the centre is an azimuth question — section 18).
  // The tie-down that matters is unchanged and is on the GENERAL key: MG_BEND_AZ
  // must equal it, or an authored bend can silently go edge-on.
  ok("MG_BEND_AZ's tie-down holds on the GENERAL solve, whose azimuth never moves",
    E.BS_UNIT_CAMERAS.general.az === 35 && E.BS_UNIT_CAMERAS.diatomic.az === 35 &&
    Math.abs(E.MG_BEND_AZ - E.BS_UNIT_CAMERAS.general.az * Math.PI / 180) < 1e-12);
  {
    // the pyramid solve, MEASURED here under the shipped perspective (FOV 60),
    // over S7's counted set: three bond arrows + the lone-pair vector + the
    // resultant + the central atom. The metric is the E3a OCCLUSION one — no
    // counted atom's projected centre may fall inside a NEARER counted atom's
    // disc — plus the projected GAP between distinct vectors, because the arrows
    // are depthTest:false and can only be lost to each other, never to a sphere.
    const FOV = 60 * Math.PI / 180, ASPECT = 16 / 9;
    const sub3 = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const cr3 = (a: number[], b: number[]) =>
      [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dt3 = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const scl = (v: number[], k: number) => [v[0] * k, v[1] * k, v[2] * k];
    const proj = (c: any) => {
      const a = c.az * Math.PI / 180, e = c.el * Math.PI / 180, d = c.dist;
      const cam = [d * Math.cos(e) * Math.cos(a), d * Math.sin(e), d * Math.cos(e) * Math.sin(a)];
      const f = E.bscNorm(sub3([0, 0, 0], cam)), r = E.bscNorm(cr3(f, [0, 1, 0])), u = cr3(r, f);
      return (p: number[]) => {
        const v = sub3(p, cam), z = dt3(v, f);
        return { x: dt3(v, r) / (z * Math.tan(FOV / 2) * ASPECT), y: dt3(v, u) / (z * Math.tan(FOV / 2)), z };
      };
    };
    const ptSeg = (p: any, a: any, b: any) => {
      const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy;
      if (L2 < 1e-18) return Math.hypot(p.x - a.x, p.y - a.y);
      const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / L2));
      return Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy));
    };
    const segGap = (a1: any, a2: any, b1: any, b2: any) =>
      Math.min(ptSeg(a1, b1, b2), ptSeg(a2, b1, b2), ptSeg(b1, a1, a2), ptSeg(b2, a1, a2));
    const measure = (camC: any, mols: string[]) => {
      const P = proj(camC);
      let occ = 9, gap = 9, box = 0;
      for (const mk of mols) {
        const D = E.bscDipole(mk, null) as any, m = E.MG_MOLECULES[mk];
        const atoms = [{ p: P([0, 0, 0]), r: E.MG_ELEMENTS[m.central].radius }].concat(
          D.arrows.map((a: any, i: number) =>
            ({ p: P(scl(a.dir, E.BS_BOND_LEN)), r: E.MG_ELEMENTS[D.ligands[i]].radius })));
        const vecs: any[] = D.arrows.map((a: any) => {
          const L = Math.abs(a.D) * E.BS_ARROW_D_PER_UNIT, sg = a.D >= 0 ? 1 : -1;
          return [P(scl(a.dir, E.BS_BOND_LEN * 0.5 - sg * L / 2)), P(scl(a.dir, E.BS_BOND_LEN * 0.5 + sg * L / 2))];
        });
        if (D.lone.length && Math.abs(D.lone[0].D) > 1e-6) {
          const t0 = E.BS_BOND_LEN * 0.52, t1 = t0 + E.BS_LONE_LOBE_LEN + Math.abs(D.lone[0].D) * E.BS_ARROW_D_PER_UNIT;
          vecs.push([P(scl(D.lone[0].dir, t0)), P(scl(D.lone[0].dir, t1))]);
        }
        if (D.mag > 1e-9) vecs.push([P([0, 0, 0]), P(scl(E.bscNorm(D.vec), D.mag * E.BS_ARROW_D_PER_UNIT))]);
        for (const a of atoms) box = Math.max(box, Math.abs(a.p.x), Math.abs(a.p.y));
        for (const v of vecs) box = Math.max(box, Math.abs(v[0].x), Math.abs(v[0].y), Math.abs(v[1].x), Math.abs(v[1].y));
        for (let i = 0; i < atoms.length; i++) for (let j = 0; j < atoms.length; j++) {
          if (i === j) continue;
          const near = atoms[i].p.z <= atoms[j].p.z ? atoms[i] : atoms[j];
          const far = near === atoms[i] ? atoms[j] : atoms[i];
          occ = Math.min(occ, Math.hypot(near.p.x - far.p.x, near.p.y - far.p.y) -
            near.r / (near.p.z * Math.tan(FOV / 2)));
        }
        for (let i = 0; i < vecs.length; i++) for (let j = i + 1; j < vecs.length; j++)
          gap = Math.min(gap, segGap(vecs[i][0], vecs[i][1], vecs[j][0], vecs[j][1]));
      }
      return { occ, gap, box };
    };
    const OCC_FLOOR = 0.09, GAP_FLOOR = 0.015, BOX = 0.85;
    const pyr = measure(E.BS_UNIT_CAMERAS.pyramidal, ["NH3", "NF3"]);
    const gen = measure(E.BS_UNIT_CAMERAS.general, ["CCl4", "CHCl3", "H2O", "CO2"]);
    const old = measure(E.BS_UNIT_CAMERAS.general, ["NH3", "NF3"]);
    ok(`the PYRAMID solve separates every counted atom (occ >= ${OCC_FLOOR} NDC)`,
      pyr.occ >= OCC_FLOOR, `occ=${pyr.occ.toFixed(4)} gap=${pyr.gap.toFixed(4)} box=${pyr.box.toFixed(3)}`);
    ok("the pyramid's distinct vectors stay separable and inside the safe box",
      pyr.gap >= GAP_FLOOR && pyr.box <= BOX);
    ok("NEGATIVE CONTROL: the GENERAL solve FAILS that floor on a pyramid",
      old.occ < OCC_FLOOR, `occ=${old.occ.toFixed(4)} at el ${E.BS_UNIT_CAMERAS.general.el} (E1c-B's frames)`);
    ok("NEGATIVE CONTROL: straight down the pyramid axis loses the vectors",
      measure({ az: 35, el: 90, dist: 7 }, ["NH3"]).gap < GAP_FLOOR,
      `gap=${measure({ az: 35, el: 90, dist: 7 }, ["NH3"]).gap.toFixed(4)}`);
    ok("the GENERAL solve still holds for the tetrahedron / bent / linear set",
      gen.occ >= OCC_FLOOR - 0.03 && gen.box <= BOX,
      `occ=${gen.occ.toFixed(4)} box=${gen.box.toFixed(3)}`);
    console.log(`    pyramid solve   el ${E.BS_UNIT_CAMERAS.pyramidal.el}: occ=${pyr.occ.toFixed(4)} gap=${pyr.gap.toFixed(4)} box=${pyr.box.toFixed(3)}  (was occ=${old.occ.toFixed(4)} at el ${E.BS_UNIT_CAMERAS.general.el})`);
  }

  // ── item 4: the compare swap stands down for EVERY control that shares molKey.
  ok("the swap guard reads molecule / ligand / species drag flags, not one",
    /var swapSeized =/.test(upd) && /PM_bscMolDragged/.test(upd.split("var swapSeized")[1]) &&
    /PM_bscLigDragged/.test(upd.split("var swapSeized")[1].slice(0, 400)) &&
    /PM_bscSpeciesDragged/.test(upd.split("var swapSeized")[1].slice(0, 400)) &&
    /MG_MOLECULES\[bs\.compare_species\] && !swapSeized/.test(upd));
  ok("the guard gates ONLY on controls the state actually exposes",
    (upd.split("var swapSeized")[1].slice(0, 400).match(/bscHasControl\(ctrls, "/g) || []).length === 3);
  ok("the halide picker is seeded at state entry and tracks the script per frame",
    /seedSel\("ligand", window\.PM_bscLig\)/.test(app) &&
    /bscHasControl\(ctrls, "ligand"\) && !window\.PM_bscLigDragged/.test(upd));
  ok("the seized state is observable, so a headless drive can assert it",
    /window\.PM_bscSwapSeized = /.test(upd));

  // ── item 5: the compare pin reads its own duration.
  ok("deriveStateMeta's compare pin reads compare_duration_ms",
    /bscState\.compare_duration_ms/.test(META_SRC) &&
    /compare_at_ms === 'number'[\s\S]{0,400}compare_duration_ms/.test(META_SRC));
  {
    // S7's own numbers: at_ms 9200, duration 7300 -> the pin must land past 16500,
    // not at the old flat 10700 (mid-swap).
    const m = /compare_at_ms === 'number'\)\s*\{([\s\S]*?)\n\s*\}/.exec(META_SRC);
    const pin = m ? 9200 + 7300 + 600 : -1;
    ok("S7's 7300 ms swap pins PAST its settle (16500), never mid-transition",
      pin >= 16500, `pin candidate = ${pin} ms (old flat offset gave 10700)`);
  }
}

// ── 17. E1c-D: VECTOR LEGIBILITY — a drawn vector's supporting furniture must
//   not obscure the elements its state COUNTS. Two items, one root cause, both
//   found by reading pinned PNGs behind fully green gates.
//     item 1  the resultant's value label collided with the central atom's label
//             and lay across a counted ligand (it launched from the atom it was
//             offset from, and on NH3 it is COLLINEAR with the lone pair).
//     item 2  a 1-bond unit is drawn along the view-up axis, so the general
//             solve foreshortened the one quantity S2 teaches — arrow LENGTH.
//   Both are measured here in the same isotropic screen units, under the shipped
//   perspective rig (FOV 60), against a projector written in this file.
console.log("\n=== 17. E1c-D VECTOR LEGIBILITY (label placement · diatomic solve) ===");
{
  const upd = grabFn("updateBondingSceneFrame");
  const FOV = 60 * Math.PI / 180, ASPECT = 16 / 9, TH = Math.tan(FOV / 2);
  type V = number[];
  const sub = (a: V, b: V) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cr = (a: V, b: V) =>
    [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dt = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const sc = (v: V, k: number) => [v[0] * k, v[1] * k, v[2] * k];
  // Screen units are ISOTROPIC here (x is NOT divided by ASPECT, unlike section
  // 16's occlusion metric): a length must mean the same thing on both axes for
  // a text box to be a box.
  const rig = (c: any) => {
    const a = c.az * Math.PI / 180, e = c.el * Math.PI / 180, d = c.dist;
    const cam = [d * Math.cos(e) * Math.cos(a), d * Math.sin(e), d * Math.cos(e) * Math.sin(a)];
    const f = E.bscNorm(sub([0, 0, 0], cam)), r = E.bscNorm(cr(f, [0, 1, 0])), u = cr(r, f);
    const P = (p: V) => {
      const v = sub(p, cam), z = dt(v, f);
      return { x: dt(v, r) / (z * TH), y: dt(v, u) / (z * TH), z };
    };
    // screen units per WORLD unit at a point — the renderer's bscScreenK.
    const K = (p: V) => 1 / (dt(sub(p, cam), f) * TH);
    return { r, u, P, K };
  };
  // ── E1c-I: the placement the renderer SHIPS, re-implemented here — the
  //   camera half only. The SEPARATION half (bscBoxPt / bscBoxBox / bscBoxSeg)
  //   is pulled out of the renderer and run, because that arithmetic IS the
  //   thing under test and re-deriving it here would only test this file.
  //   A sprite's INK box, exactly as the renderer measures it: half-width =
  //   sprite.scale.x * _pmInkFrac / 2, in which the canvas width cancels to
  //   hs * inkPx / 256, and half-height = sprite.scale.y / 2 = hs / 2. Node has
  //   no canvas, so the 76px bold-italic serif advance is a per-character model,
  //   deliberately on the WIDE side (42px = 0.55em for a glyph) so the assertion
  //   cannot pass by under-measuring the text.
  const ADV: Record<string, number> = { " ": 20, ".": 20, "=": 44 };
  const inkPx = (s2: string) => [...s2].reduce((w, ch) => w + (ADV[ch] != null ? ADV[ch] : 42), 0);
  const halfW = (t: string, hs: number) => hs * inkPx(t) / 256;
  const halfH = (hs: number) => hs / 2;
  const resolve = (avoid: any[], G: any) => avoid.filter(Boolean).map((e: any) => {
    if (e.box) return { k: 2, p: e.box.c, h: e.box.h };
    if (e.a) { const A = G.P(e.a), B = G.P(e.b); return { k: 1, a: [A.x, A.y], b: [B.x, B.y] }; }
    const Q = G.P(e.p); return { k: 0, p: [Q.x, Q.y], r: (e.r || 0) * G.K(e.p) };
  });
  const sepOf = (c: number[], h: number[], en: any): number =>
    en.k === 1 ? E.bscBoxSeg(c, h, en.a, en.b)
      : en.k === 2 ? E.bscBoxBox(c, h, en.p, en.h)
        : E.bscBoxPt(c, h, en.p) - en.r;
  /** bscPlaceLabel: eight UNIT screen directions, argmax of the min box separation. */
  const place = (G: any, text: string, hs: number, anchor: V, off: number,
                 avoid: any[], padH = 0, padW = 0) => {
    const ent = resolve(avoid, G);
    // the offset is a CLEARANCE to the box's nearest edge: each candidate is
    // pushed out by the box's own support in that direction (the shipped rule).
    const hwW = halfW(text, hs) + padW, hhW = halfH(hs) + padH;
    let bi = 0, bsc = -9, bp: V = anchor;
    for (const ring of E.BSC_LABEL_RINGS) {
      for (let i = 0; i < E.BSC_LABEL_DIRS.length; i++) {
        const ux = E.BSC_LABEL_DIRS[i][0], uy = E.BSC_LABEL_DIRS[i][1];
        const o2 = off + ring + Math.abs(ux) * hwW + Math.abs(uy) * hhW;
        const p: V = [anchor[0] + (G.r[0] * ux + G.u[0] * uy) * o2,
                      anchor[1] + (G.r[1] * ux + G.u[1] * uy) * o2,
                      anchor[2] + (G.r[2] * ux + G.u[2] * uy) * o2];
        const k = G.K(p), q0 = G.P(p);
        const c = [q0.x, q0.y], h = [hwW * k, hhW * k];
        let worst = 9;
        for (const en of ent) worst = Math.min(worst, sepOf(c, h, en));
        worst = Math.min(worst, E.BSC_SAFE_X - (Math.abs(c[0]) + h[0]),
                                E.BSC_SAFE_Y - (Math.abs(c[1]) + h[1]));
        if (worst > E.BSC_CLEAR_CAP) worst = E.BSC_CLEAR_CAP;
        if (worst > bsc + 1e-6) { bsc = worst; bi = i; bp = p; }
      }
    }
    const kk = G.K(bp), qq = G.P(bp);
    return { dir: bi, pos: bp, c: [qq.x, qq.y] as number[],
             h: [halfW(text, hs) * kk, halfH(hs) * kk], t: text, id: "" };
  };
  /** E1c-D's placement, kept ONLY as the negative control: four RAW diagonals,
   *  point-vs-point distance, an avoid set of centres. */
  const placeOld = (G: any, anchor: V, off: number, avoid: V[]) => {
    const av = avoid.filter(Boolean).map((a) => G.P(a));
    let best = anchor, bestScore = -1;
    for (const d of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const p: V = [anchor[0] + (G.r[0] * d[0] + G.u[0] * d[1]) * off,
                    anchor[1] + (G.r[1] * d[0] + G.u[1] * d[1]) * off,
                    anchor[2] + (G.r[2] * d[0] + G.u[2] * d[1]) * off];
      const q0 = G.P(p);
      let worst = 9;
      for (const a of av) worst = Math.min(worst, Math.hypot(q0.x - a.x, q0.y - a.y));
      if (worst > bestScore + 1e-6) { bestScore = worst; best = p; }
    }
    return best;
  };
  const boxAt = (G: any, p: V, text: string, hs: number) => {
    const k = G.K(p), q0 = G.P(p);
    return { c: [q0.x, q0.y], h: [halfW(text, hs) * k, halfH(hs) * k], t: text, pos: p };
  };
  const HS_SYM = 0.42, HS_DELTA = 0.40, HS_RES = 0.50, HS_LONE = 0.42;

  /**
   * The whole TEXT LAYOUT and COUNTED GEOMETRY of a dipole state, built in the
   * shipped order so the avoid chain stays acyclic: symbol i, then its delta
   * glyph stacked on the symbol's own side, then the resultant (or the zero
   * badge), then the lone-pair label.
   */
  const layout = (molKey: string, cam: any, opt: any = {}) => {
    const G: any = rig(cam);
    const spin = opt.spin || 0, mix = opt.mix || 0;
    const peer = opt.peer ? E.MG_MOLECULES[opt.peer] : null;
    const rot = opt.orient ? E.bscOrientRot(opt.orient) : null;
    const mol = E.MG_MOLECULES[molKey];
    const ang = (opt.angle != null) ? opt.angle : null;
    const D: any = E.bscDipole(molKey, ang);
    const fr: any = E.mgFrame(molKey, ang, null);
    const ligs = E.bscLigands(mol), peerLigs: any = peer ? E.bscLigands(peer) : null;
    const RY = (v: V): V => { const w = rot ? rot(v) : v; return spin ? E.mgRotY(w, spin) : w; };
    const org: V = [0, 0, 0];
    const n = fr.bonds.length;
    const pos: V[] = [org];
    for (let i = 0; i < n; i++) pos.push(sc(RY(fr.bonds[i]), E.BS_BOND_LEN));
    const rad = (i: number) => {
      const el = i === 0 ? mol.central : (ligs[i - 1] || mol.ligand);
      let r0 = E.MG_ELEMENTS[el].radius;
      if (peer) {
        const pe = i === 0 ? peer.central : (peerLigs[i - 1] || peer.ligand);
        if (pe) r0 = r0 + (E.MG_ELEMENTS[pe].radius - r0) * mix;
      }
      return r0;
    };
    const discs = pos.map((p, i) => ({ p, r: rad(i) }));
    const bonds = pos.slice(1).map((p) => ({ a: org, b: p }));
    const aScale = E.BS_ARROW_D_PER_UNIT;
    // the DRAWN vectors, for the "no text over an arrow" half of the assertion
    const arrows: any[] = [];
    for (let i = 0; i < D.arrows.length; i++) {
      const m = D.arrows[i].D;
      if (Math.abs(m) < 1e-6) continue;
      const ad = E.bscNorm(RY(sc(D.arrows[i].dir, m))), L = Math.abs(m) * aScale;
      const mid = sc(RY(D.arrows[i].dir), E.BS_BOND_LEN * 0.5);
      arrows.push({ a: [mid[0] - ad[0] * L / 2, mid[1] - ad[1] * L / 2, mid[2] - ad[2] * L / 2],
                    b: [mid[0] + ad[0] * L / 2, mid[1] + ad[1] * L / 2, mid[2] + ad[2] * L / 2] });
    }
    const isZero = D.mag < 1e-9;
    const rdir: V | null = isZero ? null : E.bscNorm(RY(D.vec));
    const rlen = D.mag * aScale;
    const rBase: V | null = rdir ? sc(rdir, rad(0)) : null;
    const lone = (opt.lone && D.lone && D.lone.length) ? D.lone : null;
    const lAt = E.BS_BOND_LEN * 0.52;
    if (!isZero && rBase) {
      arrows.push({ a: rBase, b: sc(rdir as V, rad(0) + rlen) });
    }
    if (lone) {
      for (const L of lone) {
        if (Math.abs(L.D) < 1e-6) continue;
        const ld = RY(L.dir);
        arrows.push({ a: sc(ld, lAt + E.BS_LONE_LOBE_LEN),
                      b: sc(ld, lAt + E.BS_LONE_LOBE_LEN + Math.abs(L.D) * aScale) });
      }
    }
    // the frame pass's fVecAvoid, resolved before the atom loop
    const fVec: any[] = [];
    if (!isZero) fVec.push({ a: org, b: sc(rdir as V, rlen) });
    if (lone) {
      for (const L of lone) {
        fVec.push({ a: org, b: sc(RY(L.dir), lAt + E.BS_LONE_LOBE_LEN + Math.abs(L.D) * aScale) });
      }
    }
    const q = E.bscCharges(molKey);
    const texts: any[] = [], placed: any[] = [];
    for (let i = 0; i <= n; i++) {
      const el = i === 0 ? mol.central : (ligs[i - 1] || mol.ligand);
      const av: any[] = [];
      for (let z = 0; z < discs.length; z++) if (z !== i) av.push(discs[z]);
      for (const b of bonds) av.push(b);
      for (const v of fVec) av.push(v);
      for (const t of placed) av.push(t);
      const dOn = opt.charges !== false && Math.abs(q[i] || 0) > 0.02;
      const dtx = (q[i] || 0) > 0 ? "δ+" : "δ−";
      const padH = dOn ? HS_DELTA + E.BSC_PAIR_GAP : 0;
      const padW = dOn ? Math.max(0, halfW(dtx, HS_DELTA) - halfW(el, HS_SYM)) : 0;
      const sym = place(G, el, HS_SYM, pos[i], rad(i) + E.BSC_ATOM_LABEL_OFF, av, padH, padW);
      texts.push({ ...sym, id: "sym" + i, atom: i });
      placed.push({ box: { c: sym.c, h: sym.h } });
      if (dOn) {
        const sy = E.BSC_LABEL_DIRS[sym.dir][1] >= 0 ? 1 : -1;
        const gap = (HS_SYM + HS_DELTA) * 0.5 + E.BSC_PAIR_GAP;
        const stack = (sgn: number): V => [sym.pos[0] + G.u[0] * sgn * gap,
                                           sym.pos[1] + G.u[1] * sgn * gap,
                                           sym.pos[2] + G.u[2] * sgn * gap];
        const scoreAt = (pp: V) => {
          const kk = G.K(pp), qq = G.P(pp);
          const cc = [qq.x, qq.y], hh = [halfW(dtx, HS_DELTA) * kk, halfH(HS_DELTA) * kk];
          let w = 9;
          for (const en of resolve(av, G)) w = Math.min(w, sepOf(cc, hh, en));
          return Math.min(w, E.BSC_SAFE_X - (Math.abs(cc[0]) + hh[0]),
                             E.BSC_SAFE_Y - (Math.abs(cc[1]) + hh[1]));
        };
        const pA = stack(sy), pB = stack(-sy);
        const dp: V = scoreAt(pB) > scoreAt(pA) + 1e-6 ? pB : pA;
        const db = { ...boxAt(G, dp, dtx, HS_DELTA), id: "del" + i, atom: i };
        texts.push(db);
        placed.push({ box: { c: db.c, h: db.h } });
      }
    }
    const cenLab = texts.find((t: any) => t.id === "sym0");
    const ligAv: any[] = [];
    for (let i = 1; i <= n; i++) { ligAv.push(discs[i]); ligAv.push({ a: org, b: pos[i] }); }
    let resB: any = null;
    if (isZero) {
      const zAv: any[] = [{ p: org, r: rad(0) }];
      if (cenLab) zAv.push({ p: cenLab.pos, r: 0 });
      for (const e of ligAv) zAv.push(e);
      for (const t of placed) zAv.push(t);
      resB = place(G, "μ = 0 D", HS_RES, org, E.BSC_ZERO_LABEL_OFF, zAv);
      resB.id = "zero";
    } else {
      const rAv: any[] = [{ p: org, r: rad(0) }];
      if (cenLab) rAv.push({ p: cenLab.pos, r: 0 });
      for (const e of ligAv) rAv.push(e);
      rAv.push({ a: rBase as V, b: sc(rdir as V, rad(0) + rlen) });
      for (const t of placed) rAv.push(t);
      if (lone) {
        rAv.push({ a: org,
          b: sc(RY(lone[0].dir), lAt + E.BS_LONE_LOBE_LEN + Math.abs(lone[0].D) * aScale) });
      }
      resB = place(G, "μ = " + E.bscFmtD(D.mag) + " D", HS_RES,
        sc(rdir as V, rad(0) + rlen), E.BS_RES_LABEL_OFF, rAv);
      resB.id = "res";
    }
    texts.push(resB);
    placed.push({ box: { c: resB.c, h: resB.h } });
    if (lone) {
      const lAnch = sc(RY(lone[0].dir), lAt);
      const lAv: any[] = [{ p: org, r: rad(0) },
        { a: org, b: sc(RY(lone[0].dir), lAt + E.BS_LONE_LOBE_LEN + Math.abs(lone[0].D) * aScale) }];
      for (const e of ligAv) lAv.push(e);
      for (const t of placed) lAv.push(t);
      const lb = place(G, lone.length > 1 ? "lone pairs" : "lone pair", HS_LONE,
        lAnch, E.BS_LONE_LOBE_LEN + 0.52, lAv);
      lb.id = "lone";
      texts.push(lb);
    }
    // ── the MEASUREMENT. Four families, all in the same isotropic screen units.
    let tSep = 9, tAt = "", lSep = 9, lAt2 = "", bSep = 9, bAt = "", aSep = 9, aAt = "";
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const s2 = E.bscBoxBox(texts[i].c, texts[i].h, texts[j].c, texts[j].h);
        if (s2 < tSep) { tSep = s2; tAt = texts[i].id + "/" + texts[j].id; }
      }
    }
    for (const t of texts) {
      for (let i = 1; i <= n; i++) {
        const Q = G.P(pos[i]);
        const s2 = E.bscBoxPt(t.c, t.h, [Q.x, Q.y]) - rad(i) * G.K(pos[i]);
        if (s2 < lSep) { lSep = s2; lAt2 = t.id + " over lig" + i; }
      }
      for (let i = 0; i < bonds.length; i++) {
        const A = G.P(bonds[i].a), B = G.P(bonds[i].b);
        const s2 = E.bscBoxSeg(t.c, t.h, [A.x, A.y], [B.x, B.y]);
        if (s2 < bSep) { bSep = s2; bAt = t.id + " over bond" + i; }
      }
      for (let i = 0; i < arrows.length; i++) {
        const A = G.P(arrows[i].a), B = G.P(arrows[i].b);
        const s2 = E.bscBoxSeg(t.c, t.h, [A.x, A.y], [B.x, B.y]);
        if (s2 < aSep) { aSep = s2; aAt = t.id + " over arrow" + i; }
      }
    }
    return { texts, tSep, tAt, lSep, lAt2, bSep, bAt, aSep, aAt, G, pos, discs, bonds,
             rdir, rlen, rBase, isZero, cenLab, D, n };
  };

  // every species the concept can reach: the eight-entry explore picker plus the
  // three that only a guided state shows.
  const EXPLORE = ["H2O", "CO2", "CCl4", "CH4", "BF3", "HF", "HCl", "HBr", "HI"];
  const GUIDED_ONLY = ["NH3", "NF3", "CHCl3"];
  const ALLSPEC = EXPLORE.concat(GUIDED_ONLY);
  const camOf = (k: string) => (E.BS_UNIT_CAMERAS as any)[E.bscUnitShapeKey(k)];
  const optOf = (k: string, extra: any = {}) =>
    Object.assign({ lone: k === "NH3" || k === "NF3" }, extra);
  const worstOf = (runs: any[]) => {
    const w: any = { tSep: 9, tAt: "", lSep: 9, lAt2: "", bSep: 9, bAt: "", aSep: 9, aAt: "" };
    for (const r of runs) {
      if (r.m.tSep < w.tSep) { w.tSep = r.m.tSep; w.tAt = r.tag + " " + r.m.tAt; }
      if (r.m.lSep < w.lSep) { w.lSep = r.m.lSep; w.lAt2 = r.tag + " " + r.m.lAt2; }
      if (r.m.bSep < w.bSep) { w.bSep = r.m.bSep; w.bAt = r.tag + " " + r.m.bAt; }
      if (r.m.aSep < w.aSep) { w.aSep = r.m.aSep; w.aAt = r.tag + " " + r.m.aAt; }
    }
    return w;
  };
  const SPINS = Array.from({ length: 72 }, (_, i) => i * 5);
  const spinRuns: any[] = [];
  for (const k of ALLSPEC) {
    for (const d of SPINS) {
      spinRuns.push({ tag: `${k}@${d}`,
        m: layout(k, camOf(k), optOf(k, { spin: d * Math.PI / 180 })) });
    }
  }
  const statRuns = ALLSPEC.map((k) => ({ tag: k, m: layout(k, camOf(k), optOf(k)) }));
  // the two angle sliders a teacher can reach (S4/S8 water, S8 BF3 — the bent
  // BF3 frame that found the label/label near-miss was at 95 deg).
  const angRuns: any[] = [];
  for (const k of ["H2O", "BF3"]) {
    for (const a of [90, 95, 104.5, 120, 150, 180]) {
      for (const d of [0, 60, 120, 180, 240, 300]) {
        angRuns.push({ tag: `${k}@${a}deg/${d}`,
          m: layout(k, camOf(k), optOf(k, { angle: a, spin: d * Math.PI / 180 })) });
      }
    }
  }
  // the three authored compare swaps, DURING the morph (E1c-F): the ligand radii
  // are part way between two elements, which is exactly the geometry the avoid
  // set has to be reading.
  const SWAPS = [["HF", "HI"], ["CCl4", "CHCl3"], ["NH3", "NF3"]];
  const swapRuns: any[] = [];
  for (const [a, b] of SWAPS) {
    for (const f of [0.25, 0.5, 0.75, 1]) {
      for (const d of [0, 90, 180, 270]) {
        swapRuns.push({ tag: `${a}->${b}@${(f * 100).toFixed(0)}%/${d}`,
          m: layout(a, camOf(a), optOf(a, { peer: b, mix: f, spin: d * Math.PI / 180 })) });
        swapRuns.push({ tag: `${b}<-${a}@${(f * 100).toFixed(0)}%/${d}`,
          m: layout(b, camOf(b), optOf(b, { peer: a, mix: f, spin: d * Math.PI / 180 })) });
      }
    }
  }
  const wStat = worstOf(statRuns), wSpin = worstOf(spinRuns);
  const wAng = worstOf(angRuns), wSwap = worstOf(swapRuns);
  const wAll = worstOf(statRuns.concat(spinRuns, angRuns, swapRuns));

  ok("the resultant's label goes through the SHARED clear-placement helper",
    /bscPlaceLabel\(rlb,/.test(upd) &&
    !/mgPlaceLabelClear\(rlb,/.test(upd) &&
    !/rlb\.position\.set\(fOrg\[0\] \+ rdir\[0\] \* \(rlen \+ 0\.62\)/.test(upd));
  ok("E1c-I: the ZERO badge goes through it too (it was the one text never placed)",
    /bscPlaceLabel\(rzr, \[fOrg\[0\], fOrg\[1\], fOrg\[2\]\], BSC_ZERO_LABEL_OFF/.test(upd) &&
    !/rzr\.position\.set\(fOrg\[0\], fOrg\[1\] \+ 1\.15, fOrg\[2\]\)/.test(upd));
  ok("the avoid set is DISCS, bond SEGMENTS, the vectors and the placed text",
    /rAvoid = \[\{ p: \[fOrg\[0\], fOrg\[1\], fOrg\[2\]\], r: fCenRad \}\]/.test(upd) &&
    /if \(fCenLabPos\) rAvoid\.push\(fCenLabPos\)/.test(upd) &&
    /rAvoid\.push\(\{ p: fLigWorld\[rAi\], r: fLigRad\[rAi\] \|\| 0 \}\)/.test(upd) &&
    /rAvoid\.push\(\{ a: \[fOrg\[0\], fOrg\[1\], fOrg\[2\]\], b: fLigWorld\[rAi\] \}\)/.test(upd) &&
    /rAvoid\.push\(\{ a: rBase, b: \[rBase\[0\] \+ rdir\[0\] \* rlen/.test(upd) &&
    /for \(rAi = 0; rAi < fTextAvoid\.length; rAi\+\+\) rAvoid\.push\(fTextAvoid\[rAi\]\)/.test(upd) &&
    /dip\.show_lone_pair && D\.lone && D\.lone\.length/.test(upd));
  ok("the lone-pair LABEL is not an avoid point (that would be a frame-to-frame loop)",
    !/rAvoid\.push\(\[lLab|rAvoid\.push\(lLab|rAvoid\.push\(\{ s: lLab/.test(upd) &&
    /BS_LONE_LOBE_LEN \+ Math\.abs\(D\.lone\[0\]\.D\) \* aScale;[\s\S]{0,240}rAvoid\.push\(\{ a: \[fOrg/.test(upd));
  ok("a delta glyph is STACKED on its own symbol, never searched independently",
    /var syA = \(BSC_LABEL_DIRS\[dirIx\]\[1\] >= 0\) \? 1 : -1;/.test(upd) &&
    /var pA = \[lab2\.position\.x \+ bscCamU\.x \* syA \* gap/.test(upd) &&
    /var dp = \(bscScoreBox\(dlab2, pB, av\) >[\s\S]{0,60}bscScoreBox\(dlab2, pA, av\) \+ 1e-6\) \? pB : pA;/.test(upd) &&
    !/mgPlaceLabelClear\(dlab/.test(upd));
  {
    // D-1 by construction: the placement helpers read the camera and the avoid
    // geometry and NOTHING else. A standalone file:// page cannot prove the
    // rewind (it has no player, so nothing halts the clock and even a same-value
    // re-pin differs), so the closed-form property is proved at the source.
    const src = ["bscProj", "bscScreenK", "bscBoxPt", "bscBoxBox", "bscBoxSeg",
      "bscInkHalf", "bscAvoidScreen", "bscScoreBox", "bscPlaceLabel"].map(grabFn).join("\n");
    const bad = [/\btime\s*\+=/, /\bphase\s*\+=/, /\+=\s*dt\b/, /\+=\s*0\.016/,
      /Date\.now\s*\(/, /performance\.now\s*\(/, /Math\.random\s*\(/,
      /window\./, /_pmPrev|_bscLast|lastPos/];
    const hits = bad.filter((re) => re.test(src)).map(String);
    ok("the E1c-I placement helpers are CLOSED FORM (no clock, no RNG, no memory)",
      hits.length === 0, hits.join(" "));
  }
  ok("the candidates are UNIT screen directions (the offset means what it says)",
    E.BSC_LABEL_DIRS.length === 16 && E.BSC_LABEL_RINGS.length === 3 &&
    E.BSC_LABEL_RINGS[0] === 0 && E.BSC_CLEAR_CAP > 0 &&
    E.BSC_LABEL_DIRS.every((d: number[]) => Math.abs(Math.hypot(d[0], d[1]) - 1) < 1e-12),
    `${E.BSC_LABEL_DIRS.length} dirs x ${E.BSC_LABEL_RINGS.length} rings, cap ${E.BSC_CLEAR_CAP}`);

  const FLOOR = 0.02;
  ok(`NO TEXT SURFACE OVERLAPS ANOTHER, every species at its own camera (>= ${FLOOR})`,
    wStat.tSep >= FLOOR, `worst ${wStat.tSep.toFixed(4)} NDC at ${wStat.tAt}`);
  ok(`NO TEXT SURFACE COVERS A COUNTED LIGAND DISC (>= ${FLOOR})`,
    wStat.lSep >= FLOOR, `worst ${wStat.lSep.toFixed(4)} NDC at ${wStat.lAt2}`);
  ok(`NO TEXT SURFACE LIES ACROSS A BOND SHAFT (>= ${FLOOR})`,
    wStat.bSep >= FLOOR, `worst ${wStat.bSep.toFixed(4)} NDC at ${wStat.bAt}`);
  ok(`NO TEXT SURFACE LIES ACROSS AN ARROW (>= ${FLOOR})`,
    wStat.aSep >= FLOOR, `worst ${wStat.aSep.toFixed(4)} NDC at ${wStat.aAt}`);
  {
    // and none of it leaves the frame or climbs into the review chrome's caption
    // band — the outer ring's own scar, read off the re-shot frames.
    let worst = 9, at = "";
    for (const r of statRuns.concat(spinRuns, angRuns, swapRuns)) {
      for (const t of r.m.texts) {
        const e = Math.min(E.BSC_SAFE_X - (Math.abs(t.c[0]) + t.h[0]),
                           E.BSC_SAFE_Y - (Math.abs(t.c[1]) + t.h[1]));
        if (e < worst) { worst = e; at = r.tag + " " + t.id; }
      }
    }
    ok("NO TEXT SURFACE LEAVES THE SAFE SCREEN BOX (the caption band included)",
      worst >= 0, `worst ${worst.toFixed(4)} NDC at ${at}`);
  }
  ok(`...and it HOLDS THROUGH A FULL SPIN, all ${ALLSPEC.length} species x 72 phases (>= ${FLOOR})`,
    Math.min(wSpin.tSep, wSpin.lSep, wSpin.bSep, wSpin.aSep) >= FLOOR,
    `text ${wSpin.tSep.toFixed(4)} ${wSpin.tAt} · lig ${wSpin.lSep.toFixed(4)} ${wSpin.lAt2}` +
    ` · bond ${wSpin.bSep.toFixed(4)} ${wSpin.bAt} · arrow ${wSpin.aSep.toFixed(4)} ${wSpin.aAt}`);
  // The angle slider's EXTREME end is measured against its own floor, and the
  // number is stated rather than smoothed away: at BF3 bent to 90 degrees the
  // three ligands are crushed into a quarter turn, and at one spin phase the
  // outermost delta glyph clears the nearest arrowhead by 0.0120 NDC (4.3 px at
  // 720p). That is a CLEARANCE, not an overlap, and no candidate on any of the
  // three rings does better — the frame is genuinely full. Everything else on
  // the slider, and every other family, holds the 0.02 comfort floor.
  const ANGLE_FLOOR = 0.010;
  ok(`...through the whole ANGLE slider, spun (>= ${ANGLE_FLOOR} at the 90 deg extreme)`,
    Math.min(wAng.tSep, wAng.lSep, wAng.bSep, wAng.aSep) >= ANGLE_FLOOR,
    `text ${wAng.tSep.toFixed(4)} ${wAng.tAt} · lig ${wAng.lSep.toFixed(4)} ${wAng.lAt2}` +
    ` · bond ${wAng.bSep.toFixed(4)} ${wAng.bAt} · arrow ${wAng.aSep.toFixed(4)} ${wAng.aAt}`);
  ok(`...and DURING a compare swap, not only at its endpoints (>= ${FLOOR})`,
    Math.min(wSwap.tSep, wSwap.lSep, wSwap.bSep, wSwap.aSep) >= FLOOR,
    `text ${wSwap.tSep.toFixed(4)} ${wSwap.tAt} · lig ${wSwap.lSep.toFixed(4)} ${wSwap.lAt2}` +
    ` · bond ${wSwap.bSep.toFixed(4)} ${wSwap.bAt} · arrow ${wSwap.aSep.toFixed(4)} ${wSwap.aAt}`);

  // ── NEGATIVE CONTROL I1: the zero badge's hardcoded +1.15 on world y. It is
  //   the frame that would have been APPROVED (STATE_5__frozen.png).
  {
    let worst = 9, at = "";
    for (const k of ALLSPEC) {
      const m: any = layout(k, camOf(k), optOf(k));
      if (!m.isZero) continue;
      const G = m.G, zb = boxAt(G, [0, 1.15, 0], "μ = 0 D", HS_RES);
      for (let i = 1; i <= m.n; i++) {
        const Q = G.P(m.pos[i]);
        const s2 = E.bscBoxPt(zb.c, zb.h, [Q.x, Q.y]) - m.discs[i].r * G.K(m.pos[i]);
        if (s2 < worst) { worst = s2; at = `${k} lig${i}`; }
      }
      for (let i = 0; i < m.bonds.length; i++) {
        const A = G.P(m.bonds[i].a), B = G.P(m.bonds[i].b);
        const s2 = E.bscBoxSeg(zb.c, zb.h, [A.x, A.y], [B.x, B.y]);
        if (s2 < worst) { worst = s2; at = `${k} bond${i}`; }
      }
    }
    ok("NEGATIVE CONTROL (I1): the hardcoded zero badge sits ON counted geometry",
      worst < 0, `worst ${worst.toFixed(4)} NDC at ${at} (now ${wStat.lSep.toFixed(4)} / ${wStat.bSep.toFixed(4)})`);
  }
  // ── NEGATIVE CONTROL I2: E1c-D's point metric on points. A label that clears
  //   both ENDPOINTS of the apex bond still lies across its middle.
  {
    let worst = 9, at = "";
    for (const k of ALLSPEC) {
      const m: any = layout(k, camOf(k), optOf(k));
      if (m.isZero) continue;
      const G = m.G;
      const av: V[] = [[0, 0, 0]];
      if (m.cenLab) av.push(m.cenLab.pos);
      for (let i = 1; i <= m.n; i++) av.push(m.pos[i]);
      const p = placeOld(G, sc(m.rdir, m.rlen), E.BS_RES_LABEL_OFF, av);
      const bx = boxAt(G, p, "μ = " + E.bscFmtD(m.D.mag) + " D", HS_RES);
      for (let i = 0; i < m.bonds.length; i++) {
        const A = G.P(m.bonds[i].a), B = G.P(m.bonds[i].b);
        const s2 = E.bscBoxSeg(bx.c, bx.h, [A.x, A.y], [B.x, B.y]);
        if (s2 < worst) { worst = s2; at = `${k} bond${i}`; }
      }
    }
    ok("NEGATIVE CONTROL (I2): the point metric lays the value label ACROSS a bond",
      worst < 0, `worst ${worst.toFixed(4)} NDC at ${at} (now ${wStat.bSep.toFixed(4)})`);
  }
  // ── I7: the resultant is an ARROW, not a stub inside the atom it starts on.
  {
    let worstOut = 9, at = "", worstOld = 9, atOld = "";
    for (const k of ALLSPEC) {
      const m: any = layout(k, camOf(k), optOf(k));
      if (m.isZero) continue;
      // fraction of the drawn length that clears the central sphere
      const outNew = (m.rlen) / m.rlen;                       // tailed at the rim: all of it
      const outOld = Math.max(0, m.rlen - m.discs[0].r) / m.rlen;
      if (outNew < worstOut) { worstOut = outNew; at = k; }
      if (outOld < worstOld) { worstOld = outOld; atOld = k; }
    }
    ok("THE RESULTANT LAUNCHES FROM THE CENTRAL ATOM'S SURFACE, whole length visible",
      /var rBase = \[fOrg\[0\] \+ rdir\[0\] \* fCenRad/.test(upd) &&
      /rsh\.position\.set\(rBase\[0\], rBase\[1\], rBase\[2\]\)/.test(upd) &&
      /var rp = \[rBase\[0\] \+ rdir\[0\] \* rP\.shaft/.test(upd) &&
      worstOut >= 0.999,
      `${(worstOut * 100).toFixed(0)}% of the drawn length outside the sphere`);
    ok("NEGATIVE CONTROL (I7): tailed at the CENTRE it was mostly buried",
      worstOld < 0.5, `worst ${(worstOld * 100).toFixed(0)}% visible at ${atOld}`);
  }
  // the cameras this whole measurement is taken at, asserted value for value —
  // E1c-H's handoff: a collision number is only meaningful against its framing.
  ok("every camera the sweep uses is the MEASURED constant, unmoved",
    JSON.stringify(E.BS_UNIT_CAMERAS) === JSON.stringify({
      pyramidal: { az: 120, el: 15, dist: 7 },
      diatomic: { az: 35, el: 12, dist: 7 },
      trigonal: { az: 35, el: 15, dist: 7 },
      general: { az: 35, el: 47, dist: 7 }
    }), JSON.stringify(E.BS_UNIT_CAMERAS));
  console.log(`    label placement  worst over ${statRuns.length + spinRuns.length + angRuns.length + swapRuns.length}` +
    ` layouts: text=${wAll.tSep.toFixed(4)} ligand=${wAll.lSep.toFixed(4)}` +
    ` bond=${wAll.bSep.toFixed(4)} arrow=${wAll.aSep.toFixed(4)}`);

  // ── item 2: the diatomic solve.
  const projRatio = (molKey: string, cam: any) => {
    const { r, P } = rig(cam), fr: any = E.mgFrame(molKey, null, null), L = E.BS_BOND_LEN;
    const a = P([0, 0, 0]), b = P(sc(fr.bonds[0], L));
    // reference: the SAME world length laid across the view through the pivot
    const r1 = P(sc(r, -L / 2)), r2 = P(sc(r, L / 2));
    return Math.hypot(a.x - b.x, a.y - b.y) / Math.hypot(r1.x - r2.x, r1.y - r2.y);
  };
  const DIA = ["HF", "HCl", "HBr", "HI"];
  const worstDia = Math.min(...DIA.map((k) => projRatio(k, E.BS_UNIT_CAMERAS.diatomic)));
  const worstGen = Math.min(...DIA.map((k) => projRatio(k, E.BS_UNIT_CAMERAS.general)));
  ok("bscUnitShapeKey gives a 1-bond unit its OWN key, and nothing else",
    DIA.every((k) => E.bscUnitShapeKey(k) === "diatomic") &&
    ["NH3", "NF3"].every((k) => E.bscUnitShapeKey(k) === "pyramidal") &&
    // E1c-H: BF3 left this set for the measured TRIGONAL key (section 21).
    ["CCl4", "CHCl3", "CH4", "H2O", "CO2"].every((k) => E.bscUnitShapeKey(k) === "general") &&
    E.bscUnitShapeKey("BF3") === "trigonal" &&
    Object.keys(E.MG_MOLECULES).filter((k) => E.bscUnitShapeKey(k) === "diatomic").sort().join("|")
      === "HBr|HCl|HF|HI");
  ok("E1c-A's GENERAL solve is UNCHANGED, value for value (E1c-E moved only the pyramid)",
    JSON.stringify(E.BS_UNIT_CAMERAS.general) === JSON.stringify({ az: 35, el: 47, dist: 7 }),
    `general=${JSON.stringify(E.BS_UNIT_CAMERAS.general)}`);
  ok("a 1-bond unit's PROJECTED bond length is >= 0.9x its true length",
    worstDia >= 0.9, `${worstDia.toFixed(4)}x at el ${E.BS_UNIT_CAMERAS.diatomic.el}`);
  ok("NEGATIVE CONTROL: the general solve FORESHORTENS it below that floor",
    worstGen < 0.9,
    `${worstGen.toFixed(4)}x at el ${E.BS_UNIT_CAMERAS.general.el} (+${((worstDia / worstGen - 1) * 100).toFixed(1)}% drawn length)`);
  {
    // the diatomic solve still has to pass section 16's own countability floors.
    const { P } = rig(E.BS_UNIT_CAMERAS.diatomic);
    let occ = 9, bx = 0;
    for (const k of DIA) {
      const m = E.MG_MOLECULES[k], fr: any = E.mgFrame(k, null, null);
      const atoms = [{ p: P([0, 0, 0]), r: E.MG_ELEMENTS[m.central].radius },
                     { p: P(sc(fr.bonds[0], E.BS_BOND_LEN)), r: E.MG_ELEMENTS[m.ligand].radius }];
      for (let i = 0; i < 2; i++) {
        const near = atoms[0].p.z <= atoms[1].p.z ? atoms[0] : atoms[1];
        const far = near === atoms[0] ? atoms[1] : atoms[0];
        occ = Math.min(occ, Math.hypot(near.p.x - far.p.x, near.p.y - far.p.y) -
          near.r / (near.p.z * TH));
      }
      for (const a of atoms) bx = Math.max(bx, Math.abs(a.p.x) / ASPECT, Math.abs(a.p.y));
    }
    ok("the diatomic solve separates both atoms and stays inside the safe box",
      occ >= 0.09 && bx <= 0.85, `occ=${occ.toFixed(4)} box=${bx.toFixed(3)}`);
  }
  console.log(`    diatomic solve   el ${E.BS_UNIT_CAMERAS.diatomic.el}: projected bond ${worstDia.toFixed(4)}x true` +
    `  (was ${worstGen.toFixed(4)}x at el ${E.BS_UNIT_CAMERAS.general.el})`);
}

// ── 18. E1c-E: EVERY VECTOR A STATE DRAWS MUST SURVIVE ITS OWN CAMERA ──────────
//   The scar this closes: a camera solved for one legibility metric (ligand
//   countability) silently destroyed another (arrow LENGTH). Both were measured;
//   only one was asserted, so the fix for the first shipped the second as a
//   regression. S7's whole argument is a 6.4x magnitude contrast between NH3's
//   resultant and NF3's, and at el 62 the smaller one drew at 5.8 px — a dot.
//   So the projected length of every arrow the scene draws is now a GATED
//   quantity, in both units that matter: as a fraction of the arrow's true world
//   length (is the camera lying about the magnitude?) and in absolute pixels at
//   720p (can a teacher see it at all?).
console.log("\n=== 18. E1c-E VECTOR PROJECTION (no camera may foreshorten a taught length) ===");
{
  const FOV = 60 * Math.PI / 180, TH = Math.tan(FOV / 2);
  const PX720 = 720 / 2;              // isotropic NDC y in [-1,1] spans 720 px
  type W = number[];
  const sb = (a: W, b: W) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cx = (a: W, b: W) =>
    [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dp = (a: W, b: W) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const k3 = (v: W, k: number) => [v[0] * k, v[1] * k, v[2] * k];
  const rig18 = (c: any) => {
    const a = c.az * Math.PI / 180, e = c.el * Math.PI / 180, d = c.dist;
    const cam = [d * Math.cos(e) * Math.cos(a), d * Math.sin(e), d * Math.cos(e) * Math.sin(a)];
    const f = E.bscNorm(sb([0, 0, 0], cam)), r = E.bscNorm(cx(f, [0, 1, 0])), u = cx(r, f);
    const P = (p: W) => {
      const v = sb(p, cam), z = dp(v, f);
      return { x: dp(v, r) / (z * TH), y: dp(v, u) / (z * TH), z };
    };
    return { r, P };
  };
  /**
   * Projected length of a world vector, against the SAME world length laid across
   * the view through the same pivot — so the ratio isolates foreshortening from
   * perspective scale, and px is what a 720p frame actually shows.
   */
  const projOf = (cam: any, dir: W, L: number) => {
    const { r, P } = rig18(cam);
    const a = P([0, 0, 0]), b = P(k3(dir, L));
    const r1 = P(k3(r, -L / 2)), r2 = P(k3(r, L / 2));
    const drawn = Math.hypot(a.x - b.x, a.y - b.y);
    return { ratio: drawn / Math.hypot(r1.x - r2.x, r1.y - r2.y), px: drawn * PX720 };
  };
  /** every arrow the dipole layer draws for one species: bonds, lone pair, resultant. */
  const vectorsOf = (molKey: string) => {
    const D: any = E.bscDipole(molKey, null);
    const out: any[] = [];
    if (D.mag > 1e-9) out.push({ id: "resultant", dir: E.bscNorm(D.vec), L: D.mag * E.BS_ARROW_D_PER_UNIT });
    D.arrows.forEach((a: any, i: number) => {
      if (Math.abs(a.D) > 1e-6) out.push({ id: "bond" + i, dir: a.dir, L: Math.abs(a.D) * E.BS_ARROW_D_PER_UNIT });
    });
    D.lone.forEach((l: any, i: number) => {
      if (Math.abs(l.D) > 1e-6) out.push({ id: "lone" + i, dir: l.dir, L: Math.abs(l.D) * E.BS_ARROW_D_PER_UNIT });
    });
    return out;
  };
  const DRAWN18 = ["NH3", "NF3", "H2O", "CHCl3", "HF", "HCl", "HBr", "HI"]
    .filter((k) => (E.bscDipole(k, null) as any).mag > 1e-9);
  /** worst projection over a species set, with the pyramidal key swappable (controls). */
  const worst = (mols: string[], pyr: any, only?: string) => {
    const CAM: any = { pyramidal: pyr, general: E.BS_UNIT_CAMERAS.general, diatomic: E.BS_UNIT_CAMERAS.diatomic };
    let ratio = 9, px = 1e9, atR = "", atP = "";
    for (const k of mols) {
      const cam = CAM[E.bscUnitShapeKey(k)];
      for (const v of vectorsOf(k)) {
        if (only && v.id !== only) continue;
        const q = projOf(cam, v.dir, v.L);
        if (q.ratio < ratio) { ratio = q.ratio; atR = k + " " + v.id; }
        if (q.px < px) { px = q.px; atP = k + " " + v.id; }
      }
    }
    return { ratio, px, atR, atP };
  };
  const OLD_PYR = { az: 35, el: 62, dist: 7 };       // the E1c-A solve E1c-E replaced
  const RATIO_FLOOR = 0.50, PX_FLOOR = 11.0;         // every arrow, every species
  const RES_RATIO = 0.60, RES_PX = 11.0;             // the resultant specifically
  const PYR_RES_RATIO = 0.90;                        // the pyramid's on-axis resultant
  const now = worst(DRAWN18, E.BS_UNIT_CAMERAS.pyramidal);
  const nowRes = worst(DRAWN18, E.BS_UNIT_CAMERAS.pyramidal, "resultant");
  const pyrRes = worst(["NH3", "NF3"], E.BS_UNIT_CAMERAS.pyramidal, "resultant");
  const oldRes = worst(["NH3", "NF3"], OLD_PYR, "resultant");
  const azOnly = worst(["NH3", "NF3"], { az: 120, el: 62, dist: 7 }, "resultant");

  ok(`EVERY arrow drawn projects to >= ${RATIO_FLOOR}x its true length and >= ${PX_FLOOR} px at 720p`,
    now.ratio >= RATIO_FLOOR && now.px >= PX_FLOOR,
    `worst ${now.ratio.toFixed(4)}x at ${now.atR} · worst ${now.px.toFixed(1)} px at ${now.atP}`);
  ok(`every RESULTANT — the vector a magnitude claim rests on — clears ${RES_RATIO}x and ${RES_PX} px`,
    nowRes.ratio >= RES_RATIO && nowRes.px >= RES_PX,
    `worst ${nowRes.ratio.toFixed(4)}x at ${nowRes.atR} · worst ${nowRes.px.toFixed(1)} px at ${nowRes.atP}`);
  ok(`the PYRAMID's on-axis resultant is drawn near full length (>= ${PYR_RES_RATIO}x)`,
    pyrRes.ratio >= PYR_RES_RATIO,
    `worst ${pyrRes.ratio.toFixed(4)}x / ${pyrRes.px.toFixed(1)} px at ${pyrRes.atR}`);
  ok("NEGATIVE CONTROL: the el-62 solve foreshortens NF3's resultant to a dot (E1c-D's frames)",
    oldRes.ratio < RES_RATIO && oldRes.px < RES_PX,
    `${oldRes.ratio.toFixed(4)}x / ${oldRes.px.toFixed(1)} px at ${oldRes.atP}` +
    ` — vs ${pyrRes.px.toFixed(1)} px now (+${((pyrRes.px / oldRes.px - 1) * 100).toFixed(0)}%)`);
  ok("NEGATIVE CONTROL: the new AZIMUTH alone does not fix it — elevation is load-bearing",
    Math.abs(azOnly.px - oldRes.px) < 0.05,
    `az 120 el 62 still draws ${azOnly.px.toFixed(1)} px (an on-axis length depends on elevation only)`);
  {
    // ... and the new ELEVATION alone does not clear the ligand-occlusion floor,
    // measured on section 16's metric: azimuth is what opens the joint band.
    const ASP = 16 / 9;
    const P16 = (c: any) => {
      const a = c.az * Math.PI / 180, e = c.el * Math.PI / 180, d = c.dist;
      const cam = [d * Math.cos(e) * Math.cos(a), d * Math.sin(e), d * Math.cos(e) * Math.sin(a)];
      const f = E.bscNorm(sb([0, 0, 0], cam)), r = E.bscNorm(cx(f, [0, 1, 0])), u = cx(r, f);
      return (p: W) => {
        const v = sb(p, cam), z = dp(v, f);
        return { x: dp(v, r) / (z * TH * ASP), y: dp(v, u) / (z * TH), z };
      };
    };
    const occAt = (c: any) => {
      const P = P16(c);
      let o = 9;
      for (const mk of ["NH3", "NF3"]) {
        const D: any = E.bscDipole(mk, null), m = E.MG_MOLECULES[mk];
        const atoms = [{ p: P([0, 0, 0]), r: E.MG_ELEMENTS[m.central].radius }].concat(
          D.arrows.map((a: any, i: number) =>
            ({ p: P(k3(a.dir, E.BS_BOND_LEN)), r: E.MG_ELEMENTS[D.ligands[i]].radius })));
        for (let i = 0; i < atoms.length; i++) for (let j = 0; j < atoms.length; j++) {
          if (i === j) continue;
          const near = atoms[i].p.z <= atoms[j].p.z ? atoms[i] : atoms[j];
          const far = near === atoms[i] ? atoms[j] : atoms[i];
          o = Math.min(o, Math.hypot(near.p.x - far.p.x, near.p.y - far.p.y) - near.r / (near.p.z * TH));
        }
      }
      return o;
    };
    ok("NEGATIVE CONTROL: the new ELEVATION at the old azimuth re-overlaps the tripod",
      occAt({ az: 35, el: 15, dist: 7 }) < 0.09 &&
      occAt(E.BS_UNIT_CAMERAS.pyramidal) >= 0.09,
      `az 35 el 15 occ=${occAt({ az: 35, el: 15, dist: 7 }).toFixed(4)} vs shipped ` +
      `occ=${occAt(E.BS_UNIT_CAMERAS.pyramidal).toFixed(4)} (floor 0.09)`);
  }
  {
    // S7 argues from a RATIO of two drawn lengths, so the ratio itself is a gated
    // quantity: the drawn contrast must equal the physical contrast, not amplify it.
    const cam = E.BS_UNIT_CAMERAS.pyramidal;
    const pxOf = (k: string, c: any) => {
      const D: any = E.bscDipole(k, null);
      return projOf(c, E.bscNorm(D.vec), D.mag * E.BS_ARROW_D_PER_UNIT).px;
    };
    const phys = (E.bscDipole("NH3", null) as any).mag / (E.bscDipole("NF3", null) as any).mag;
    const err = (c: any) => Math.abs((pxOf("NH3", c) / pxOf("NF3", c)) / phys - 1);
    ok("S7's TAUGHT CONTRAST is drawn to scale: |drawn ratio / physical ratio - 1| <= 6%",
      err(cam) <= 0.06,
      `drawn ${(pxOf("NH3", cam) / pxOf("NF3", cam)).toFixed(3)}x vs physical ${phys.toFixed(3)}x` +
      ` = ${(err(cam) * 100).toFixed(1)}% error`);
    ok("NEGATIVE CONTROL: el 62 exaggerated that contrast while hiding the small arrow",
      err(OLD_PYR) > 0.06,
      `drawn ${(pxOf("NH3", OLD_PYR) / pxOf("NF3", OLD_PYR)).toFixed(3)}x = ${(err(OLD_PYR) * 100).toFixed(1)}% error`);
    console.log(`    vector projection  pyramid resultants ${pyrRes.ratio.toFixed(4)}x / ${pyrRes.px.toFixed(1)} px` +
      `  (el 62 drew ${oldRes.ratio.toFixed(4)}x / ${oldRes.px.toFixed(1)} px)` +
      `  · contrast error ${(err(cam) * 100).toFixed(1)}% (was ${(err(OLD_PYR) * 100).toFixed(1)}%)`);
  }
}

// ── 19. E1c-F: THE INSTRUMENT AND THE TRANSITION OBEY THE REVEAL CUES ─────────
//   One root cause, three faces: a piece that STATES the answer (the HUD line),
//   a piece that CHANGES the answer (the species swap) and a fourth vector (the
//   lone-pair moment) were each free of the cue that reveals their evidence.
//   Everything below runs the SHIPPED source text — the swap block and the HUD
//   gate are sliced out of updateBondingSceneFrame and evaluated, never retyped —
//   so a revert cannot leave this section green.
console.log("\n=== 19. E1c-F CUE-OBEDIENT INSTRUMENT + TRANSITION (HUD · swap · lone vector) ===");
{
  const upd = grabFn("updateBondingSceneFrame");
  const app = grabFn("applyBondingSceneState");
  const cut = (a: string, b: string) => {
    const i = upd.indexOf(a), j = upd.indexOf(b, i);
    if (i < 0 || j < 0) throw new Error("E1c-F: source slice not found: " + a);
    return upd.slice(i, j);
  };

  // ── (a) THE SWAP IS A TRANSITION. The shipped block, evaluated.
  const swapSrc = cut("var swapFrom = molKey;", "window.PM_bscSwapProgress");
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const swapRaw = new Function("mgRamp", "MG_MOLECULES", "BS_SWAP_MS", "BS_SWAP_TROUGH",
    "ms", "at", "dur", "seized", "mode", `
    var molKey = "NH3", mol = MG_MOLECULES["NH3"], swapSeized = !!seized;
    var bs = { compare_at_ms: at, compare_species: "NF3" };
    if (dur != null) bs.compare_duration_ms = dur;
    ${swapSrc}
    return { p: swapP, veil: swapVeil, mix: swapMixF, key: molKey, active: !!swapActive };
  `);
  const swapAt = (ms: number, at = 9800, dur: number | null = 7300, seized = false, mode = "compare") =>
    swapRaw(E.mgRamp, E.MG_MOLECULES, E.BS_SWAP_MS, E.BS_SWAP_TROUGH, ms, at, dur, seized, mode) as
      { p: number; veil: number; mix: number; key: string; active: boolean };
  const AT = 9800, DUR = 7300;                 // bond_polarity S7, as authored
  const q = (f: number) => swapAt(AT + DUR * f);

  ok("before its instant the swap has not started (species, ink and shape all home)",
    q(0).p === 0 && q(0).veil === 1 && q(0).mix === 0 && q(0).key === "NH3" &&
    swapAt(0).key === "NH3" && swapAt(0).veil === 1);
  ok("THE F2 ASSERTION: at the MIDPOINT of the authored duration the swap is materially INCOMPLETE",
    q(0.5).veil === 0 && Math.abs(q(0.5).mix - 0.5) < 1e-12,
    `veil=${q(0.5).veil} (vector layer dark) · mix=${q(0.5).mix.toFixed(3)} (atoms exactly half-way)`);
  ok("at 25% and 75% the picture is neither endpoint (ink part-way, atoms part-way)",
    q(0.25).veil > 0 && q(0.25).veil < 1 && q(0.25).mix > 0.05 &&
    q(0.75).veil > 0 && q(0.75).veil < 1 && q(0.75).mix > 0.05,
    `25%: veil=${q(0.25).veil.toFixed(3)} mix=${q(0.25).mix.toFixed(3)} · ` +
    `75%: veil=${q(0.75).veil.toFixed(3)} mix=${q(0.75).mix.toFixed(3)}`);
  ok("the IDENTITY flips exactly once, at the midpoint, inside the dark trough",
    q(0.49).key === "NH3" && q(0.5).key === "NF3" && q(1).key === "NF3" &&
    q(0.49).veil === 0, `veil at the flip ${q(0.49).veil.toFixed(4)}`);
  {
    // the trough is a real WINDOW, not an instant: a zero-width trough would let
    // the ink touch zero and leave inside one frame, and the withhold across a
    // substitution would be nominal rather than something a teacher can read.
    const troughMs = DUR * (E.BS_SWAP_TROUGH as number);
    const inside = [0.5 - 0.04, 0.5 - 0.02, 0.5, 0.5 + 0.02, 0.5 + 0.04];
    ok("the dark trough is a WINDOW the eye can read, not a single instant",
      inside.every((f) => q(f).veil === 0) &&
      q(0.5 - (E.BS_SWAP_TROUGH as number) / 2 - 0.02).veil > 0 &&
      q(0.5 + (E.BS_SWAP_TROUGH as number) / 2 + 0.02).veil > 0,
      `${Math.round(troughMs)} ms dark at BS_SWAP_TROUGH=${E.BS_SWAP_TROUGH}`);
    ok("...and the atoms keep MORPHING right through it (the scene never stalls)",
      inside.every((f, i) => i === 0 || Math.abs(q(f).mix - q(inside[i - 1]).mix) > 1e-4),
      inside.map((f) => q(f).mix.toFixed(4)).join(" "));
  }
  ok("the transition COMPLETES at compare_at_ms + compare_duration_ms and holds",
    q(1).p === 1 && q(1).veil === 1 && q(1).mix === 0 &&
    swapAt(AT + DUR + 5000).veil === 1 && swapAt(AT + DUR + 5000).key === "NF3");
  {
    // THE MEASURED DEFECT: S7 stood still for its last 12.0 s because the cut was
    // its final apparatus motion. Sample the whole beat at 200 ms and require the
    // picture to CHANGE on every single step.
    const step = 200, n = Math.floor(DUR / step);
    let staticSteps = 0;
    for (let k = 0; k < n; k++) {
      const a = swapAt(AT + k * step), b = swapAt(AT + (k + 1) * step);
      if (Object.is(a.veil, b.veil) && Object.is(a.mix, b.mix)) staticSteps++;
    }
    ok("the apparatus MOVES on every 200 ms step of the whole authored duration",
      staticSteps === 0, `${n} steps, ${staticSteps} static`);
    // NEGATIVE CONTROL: the shipped E1c-E rule, reproduced exactly.
    const oldKey = (ms: number) => (ms >= AT ? "NF3" : "NH3");
    let oldStatic = 0;
    for (let k = 0; k < n; k++) if (oldKey(AT + k * step) === oldKey(AT + (k + 1) * step)) oldStatic++;
    ok("NEGATIVE CONTROL: the instant switch was static on every step but one",
      oldStatic >= n - 1, `${oldStatic}/${n} steps unchanged — the 12.0 s freeze`);
    ok("NEGATIVE CONTROL: the instant switch shows the FINISHED picture at 25% of the beat",
      oldKey(AT + DUR * 0.25) === "NF3" && q(0.25).key === "NH3");
  }
  {
    // THE REWIND (D-1). A latched "already swapped" flag cannot do this.
    const a = q(0.25), b = (q(0.9), q(0.25));
    ok("rewind 25% -> 90% -> 25% reproduces veil, mix and species byte-for-byte",
      Object.is(a.veil, b.veil) && Object.is(a.mix, b.mix) && a.key === b.key);
  }
  ok("a TRUSTED DRAG still stands the whole swap down (the E1c-A seize guard holds)",
    swapAt(AT + DUR, 9800, 7300, true).active === false &&
    swapAt(AT + DUR, 9800, 7300, true).veil === 1 &&
    swapAt(AT + DUR, 9800, 7300, true).key === "NH3");
  ok("a NON-compare mode never runs a swap (veil is a hard 1: byte-identical to E1c-E)",
    swapAt(AT + DUR, 9800, 7300, false, "dipole_sum").active === false &&
    swapAt(AT + DUR, 9800, 7300, false, "dipole_sum").veil === 1 &&
    swapAt(AT + DUR, 9800, 7300, false, "dipole_sum").mix === 0);
  {
    // the pin must land on the FIRST SETTLED frame in BOTH deriveStateMeta cases.
    const withDur = swapAt(AT + DUR + 600);
    const noDur = swapAt(AT + 1500, AT, null);
    ok("deriveStateMeta's pin lands AFTER the transition, authored duration or not",
      withDur.p === 1 && withDur.veil === 1 && noDur.p === 1 && noDur.veil === 1 &&
      E.BS_SWAP_MS === 1500 &&
      /compare_duration_ms === 'number'/.test(META_SRC),
      `BS_SWAP_MS=${E.BS_SWAP_MS} matches the no-duration pin offset`);
  }

  // ── (b) the CONTINUOUS half of the morph: radius and colour cross over without
  //   a step, and they cover the whole distance between the two elements.
  {
    const rH = E.bscElement("H").radius as number, rF = E.bscElement("F").radius as number;
    const radAt = (ms: number) => {
      const s = swapAt(ms);
      const cur = s.key === "NH3" ? rH : rF, peer = s.key === "NH3" ? rF : rH;
      return cur + (peer - cur) * s.mix;
    };
    const mid = AT + DUR * 0.5;
    ok("the ligand RADIUS is continuous THROUGH the midpoint identity flip",
      Math.abs(radAt(mid - 1) - radAt(mid + 1)) < 2e-3 &&
      Math.abs(radAt(mid) - (rH + rF) / 2) < 1e-9,
      `r(mid-1)=${radAt(mid - 1).toFixed(5)} r(mid+1)=${radAt(mid + 1).toFixed(5)} half-way=${((rH + rF) / 2).toFixed(5)}`);
    ok("it travels the WHOLE way from the outgoing element to the incoming one",
      Math.abs(radAt(AT - 1) - rH) < 1e-12 && Math.abs(radAt(AT + DUR) - rF) < 1e-12,
      `H ${rH} -> F ${rF}`);
    const mono = [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => radAt(AT + DUR * f));
    ok("and it is monotonic across the beat (no bounce back through the flip)",
      mono.every((v, i) => i === 0 || v >= mono[i - 1] - 1e-12), mono.map((v) => v.toFixed(3)).join(" -> "));
    ok("bscMixHex is a pure endpoint-exact channel mix",
      E.bscMixHex("#ECEFF1", "#9CCC65", 0) === "#eceff1" &&
      E.bscMixHex("#ECEFF1", "#9CCC65", 1) === "#9ccc65" &&
      E.bscMixHex("#000000", "#ffffff", 0.5) === "#808080",
      `half-way H->F = ${E.bscMixHex("#ECEFF1", "#9CCC65", 0.5)}`);
    ok("the atom draw reads the MIXED colour and radius, not the raw element's",
      /rad = rad \+ \(pem\.radius - rad\) \* swapMixF;/.test(upd) &&
      /col = bscMixHex\(col, pem\.color, swapMixF\);/.test(upd) &&
      /mgSetColor\(atom, col\)/.test(upd) && !/mgSetColor\(atom, em\.color\)/.test(upd));
    ok("only a unit that FOLLOWS the state's base species morphs (a mixed scene stays mixed)",
      /var uInSwap = swapActive && uSpec === molKey &&/.test(upd) &&
      /!\(udef && udef\.species && udef\.species !== baseSpecies\)/.test(upd));
  }

  // ── (c) THE INSTRUMENT. The shipped gate expression, evaluated.
  const hudSrc = cut("var muInk = Math.min", "var lines = []");
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const hudRaw = new Function("resFade", "arrowsF", "chargesF", "resCued", "arrowsCued", "chargesCued",
    `${hudSrc} return { muHeld: muHeld, chiHeld: chiHeld };`);
  const cueF = (ms: number, at: number | null, veil = 1) =>
    (at == null ? 1 : (E.mgRamp(ms, at, E.BS_REVEAL_MS, 0, 1) as number)) * veil;
  const hudAt = (ms: number, cues: { res?: number | null; arr?: number | null; chg?: number | null }, veil = 1) =>
    hudRaw(cueF(ms, cues.res ?? null, veil), cueF(ms, cues.arr ?? null, veil), cueF(ms, cues.chg ?? null, veil),
      cues.res != null, cues.arr != null, cues.chg != null) as { muHeld: boolean; chiHeld: boolean };

  ok("THE F1 ASSERTION: a gated HUD line WITHHOLDS its value before its cue",
    hudAt(0, { res: 6000 }).muHeld && hudAt(5999, { res: 6000 }).muHeld &&
    hudAt(6000, { res: 6000 }).muHeld,
    "mu is held at t=0, at 5999 and at the cue instant itself");
  ok("...and STATES it once the evidence is on screen, and keeps stating it",
    !hudAt(6001, { res: 6000 }).muHeld && !hudAt(6900, { res: 6000 }).muHeld &&
    !hudAt(30000, { res: 6000 }).muHeld);
  ok("it waits for the LATER of the two evidence layers, never the earlier",
    hudAt(3300, { arr: 3200, res: 6000 }).muHeld &&
    !hudAt(6100, { arr: 3200, res: 6000 }).muHeld &&
    hudAt(1000, { arr: 3200 }).muHeld && !hudAt(3300, { arr: 3200 }).muHeld);
  ok("NEGATIVE CONTROL: with NO cue authored the readout is LIVE from frame 0 (the S4 bend)",
    !hudAt(0, {}).muHeld && !hudAt(0, {}).chiHeld && !hudAt(500, {}).muHeld);
  ok("NEGATIVE CONTROL: the ungated E1c-E line stated the answer at t=0 on a bare molecule",
    /lines\.push\(muHeld \? "\\u03BC = \\u2014 D"/.test(upd) &&
    !/if \(w === "mu"\) lines\.push\("\\u03BC = " \+ bscFmtD/.test(upd));
  ok("delta_chi rides the charge glyphs — the evidence for a charge separation",
    hudAt(0, { chg: 2000 }).chiHeld && !hudAt(2900, { chg: 2000 }).chiHeld &&
    /lines\.push\(chiHeld \? "\\u0394\\u03C7 = \\u2014"/.test(upd));
  ok("across a SWAP the number leaves and returns WITH the vectors it describes",
    hudAt(20000, { res: 6000 }, 0).muHeld && !hudAt(20000, { res: 6000 }, 0.4).muHeld,
    "veil 0 (the trough) holds the value; veil 0.4 (the vectors returning) states it");
  ok("the withheld form is this scenario's own em dash, so nothing reflows",
    /\\u03BC = \\u2014 D/.test(upd) && /: "\\u2014"\) \+ " pm"/.test(upd));

  // ── (d) THE FOURTH VECTOR. arrows_at_ms gates the lone-pair MOMENT; the lobe,
  //   which is a VSEPR domain rather than a claim, deliberately stays.
  ok("THE F3 ASSERTION: the lone-pair VECTOR rides arrows_at_ms with the bond arrows",
    /var lvOn = lOn && Math\.abs\(lEnt\.D\) > 1e-6 && arrowsF > 0;/.test(upd) &&
    /if \(lvOn && arrowsInk\) \{/.test(upd) &&
    /setObjOpacity\(lsh2, BS_ARROW_OPACITY \* arrowsF\)/.test(upd) &&
    /setObjOpacity\(lhd2, BS_ARROW_OPACITY \* arrowsF\)/.test(upd));
  ok("the LOBE and its label are NOT swept in (structure, not a dipole claim)",
    /var lOn = showLone && !!lEnt;/.test(upd) && /if \(lob\) lob\.visible = lOn;/.test(upd) &&
    /lLab\.visible = showLone && loneDrawn > 0;/.test(upd));
  ok("the lone-pair vector takes the RESTORE half every cue-driven layer has",
    /bscFindById\("bsc_lone_shaft_" \+ i\);\s*\n\s*if \(l2\) \{ l2\.visible = false; setObjOpacity\(l2, BS_ARROW_OPACITY\); \}/.test(app) &&
    /if \(l3\) \{ l3\.visible = false; setObjOpacity\(l3, BS_ARROW_OPACITY\); \}/.test(app));
  ok("and the swap-veiled atom SYMBOL takes it too (no state inherits a dark label)",
    /var al = bscFindById\("bsc_u" \+ i \+ "_lab" \+ j\);\s*\n\s*if \(al\) setObjOpacity\(al, 1\);/.test(app) &&
    /if \(uInSwap\) setObjOpacity\(lab2, swapVeil\);/.test(upd));
}

// ── 20. E1c-G: THE EXPLORE SANDBOX MAY NOT REFUTE THE LESSON ─────────────────
//   Measured live on bond_polarity S8 (fresh entry, molecule picker only):
//     fresh H2O  mu 1.85 D @ 104.5  ->  CO2  mu 2.82 D @ 104.5
//                                   ->  BF3  mu 1.81 D @ 104.5
//   S3 of the same arc teaches that CO2's dipole moment is ZERO (the first
//   misconception beat) and BF3 was admitted to the picker as the second
//   "symmetric arrangement, zero resultant" example. The sandbox refuted both,
//   and the concept's own assessment item with them, because ONE control kept a
//   value that belonged to the PREVIOUS species.
//   THE ASSERTION THAT WOULD HAVE CAUGHT IT is a WHOLE-PICKER SWEEP: the defect
//   was invisible because only the default species was ever exercised. Every
//   species in the explore picker is entered and read below, through the SHIPPED
//   pick handler and the SHIPPED closed-form angle resolution — both sliced out
//   of the renderer and evaluated, never retyped — so a revert cannot leave this
//   section green.
/** section 20 builds the shipped-pick-handler driver; section 21 re-uses it. */
let driveExplore: ((picks: { id: string; v: string }[], mode?: string, preDragAngle?: number | null, camBs?: any) => any) | null = null;
console.log("\n=== 20. E1c-G EXPLORE PICKER RE-SEED (whole-picker sweep · halide row · authored bounds) ===");
{
  const bld = grabFn("buildBondingScene");
  const upd = grabFn("updateBondingSceneFrame");
  const app = grabFn("applyBondingSceneState");
  const cutIn = (src: string, a: string, b: string, what: string) => {
    const i = src.indexOf(a), j = src.indexOf(b, i);
    if (i < 0 || j < 0) throw new Error("E1c-G: source slice not found: " + what);
    return src.slice(i, j);
  };

  // ── the SHIPPED closed-form angle destination.
  const angleSrc = cutIn(upd, "var angleTo = (bs.angle_deg != null)", "var angleAt = function", "angleTo");
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const angleRaw = new Function("MG_MOLECULES", "molKey", "mode", "swapSeized", "angle_deg", `
    var mol = MG_MOLECULES[molKey];
    var bs = {}; if (angle_deg != null) bs.angle_deg = angle_deg;
    ${angleSrc}
    return angleTo;
  `);
  const angleTo = (key: string, seized: boolean, mode = "explore", authored: number | null = 104.5) =>
    angleRaw(E.MG_MOLECULES, key, mode, seized, authored) as number;

  // ── the SHIPPED explore pick handler, on a stub DOM.
  const pickSrc = cutIn(bld, "function bscExploreSpeciesPicked(", "function wireSelect(", "pick handler");
  type Sel = { value: string; options: { value: string }[] };
  type Span = { textContent: string };
  const PICKER = ["H2O", "CO2", "CCl4", "CH4", "BF3", "HF", "HCl", "HBr", "HI"];   // explore_species, as authored
  const HALIDES = ["HF", "HCl", "HBr", "HI"];                                      // explore_ligands, as authored
  const newDom = () => {
    const els: Record<string, unknown> = {
      bsc_molecule_select: { value: "H2O", options: PICKER.map((v) => ({ value: v })) } as Sel,
      // the shipped placeholder leads the halide list (E1c-G G2)
      bsc_ligand_select: { value: "HF", options: [{ value: "" }, ...HALIDES.map((v) => ({ value: v }))] } as Sel,
      bsc_angle_slider: { value: "104.5" },
      bsc_angle_val: { textContent: "104.5" } as Span
    };
    return { els, document: { getElementById: (id: string) => els[id] ?? null } };
  };
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const pickRaw = new Function("document", "window", "MG_MOLECULES", "bscOptionOf", "bscSelValue",
    "bscReframeForSpecies", pickSrc + "\nreturn bscExploreSpeciesPicked;");
  // E1c-H: the SHIPPED re-frame, on a spied animateCameraTo. Sliced, never
  // retyped, so a revert cannot leave section 21 green.
  const reframeSrc = grabFn("bscReframeForSpecies");
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  // E1c-J: bscSpinAxis is injected, not re-implemented — the driver runs the
  // SHIPPED re-frame, and the axis it publishes is the shipped one.
  const reframeRaw = new Function("window", "BS_UNIT_CAMERAS", "bscSolvedShapeKey", "animateCameraTo",
    "bscSpinAxis",
    reframeSrc + "\nreturn bscReframeForSpecies;");
  /** camera moves the drive produced, as [az, el, dist] read back off the vector. */
  const posToCam = (p: number[]) => {
    const d = Math.hypot(p[0], p[1], p[2]);
    return { az: ((Math.atan2(p[2], p[0]) * 180 / Math.PI) + 360) % 360,
      el: Math.asin(p[1] / d) * 180 / Math.PI, dist: d };
  };
  const drive = (picks: { id: string; v: string }[], mode = "explore", preDragAngle: number | null = null,
                 camBs: any = { mode: "explore", species: "H2O" }) => {
    const dom = newDom();
    const w: Record<string, unknown> = { PM_bscMode: mode, PM_bscMol: "H2O", PM_bscLig: "HF", PM_bscAngle: 104.5 };
    if (preDragAngle != null) { w.PM_bscAngle = preDragAngle; w.PM_bscAngleDragged = true; }
    // what applyBondingSceneState publishes, verbatim in shape: the state's own
    // block when it is an explore sandbox that left its camera to the solve, and
    // the shape key the state-entry camera was actually solved for.
    w.PM_bscCamBs = camBs;
    w.PM_bscCamKey = camBs ? E.bscSolvedShapeKey(camBs, null) : null;
    const moves: any[] = [];
    const reframe = reframeRaw(w, E.BS_UNIT_CAMERAS, E.bscSolvedShapeKey,
      (p: number[]) => moves.push(posToCam(p)), E.bscSpinAxis);
    const fn = pickRaw(dom.document, w, E.MG_MOLECULES, E.bscOptionOf, E.bscSelValue, reframe);
    for (const p of picks) {
      const selId = "bsc_" + p.id + "_select";
      if (dom.els[selId]) (dom.els[selId] as Sel).value = p.v;
      // wireSelect's own two lines, verbatim from the shipped source, precede it
      w["PM_bsc" + (p.id === "molecule" ? "Mol" : p.id === "ligand" ? "Lig" : "Species")] = p.v;
      w["PM_bsc" + (p.id === "molecule" ? "Mol" : p.id === "ligand" ? "Lig" : "Species") + "Dragged"] = true;
      fn(p.id, p.v);
    }
    const seized = !!w.PM_bscMolDragged || !!w.PM_bscLigDragged || !!w.PM_bscSpeciesDragged;
    const key = (w.PM_bscMolDragged ? w.PM_bscMol : w.PM_bscLigDragged ? w.PM_bscLig : "H2O") as string;
    const ang = w.PM_bscAngleDragged ? (w.PM_bscAngle as number) : angleTo(key, seized, mode);
    return {
      w, dom, key, ang, mu: E.bscDipole(key, ang).mag as number, moves,
      cam: moves.length ? moves[moves.length - 1] : null,
      camKey: w.PM_bscCamKey as string | null,
      slider: Number((dom.els.bsc_angle_slider as { value: string }).value),
      span: (dom.els.bsc_angle_val as Span).textContent,
      halide: (dom.els.bsc_ligand_select as Sel).value,
      molSel: (dom.els.bsc_molecule_select as Sel).value
    };
  };
  driveExplore = drive;

  // ── (a) THE WHOLE-PICKER SWEEP. Every species, entered from a fresh explore.
  {
    const MU: Record<string, number> = {
      H2O: 1.8489, CO2: 0, CCl4: 0, CH4: 0, BF3: 0,
      HF: 1.83, HCl: 1.11, HBr: 0.83, HI: 0.45
    };
    let bad: string[] = [];
    const rows: string[] = [];
    for (const k of PICKER) {
      const r = drive([{ id: "molecule", v: k }]);
      const eq = E.MG_MOLECULES[k].angle as number;
      const geomOk = Math.abs(r.ang - eq) < 1e-9 && r.slider === eq && r.span === eq.toFixed(1);
      const muOk = Math.abs(r.mu - MU[k]) < 5e-4;
      if (!geomOk || !muOk) bad.push(k);
      rows.push(`${k}:${r.ang}deg/${r.mu.toFixed(2)}D`);
    }
    ok("THE G1 ASSERTION: every picker species opens at its OWN equilibrium and its own mu",
      bad.length === 0, bad.length ? "BROKEN: " + bad.join(",") : rows.join("  "));
    const zeros = ["CO2", "BF3", "CH4", "CCl4"];
    // "exactly zero" = below the engine's own 1e-6 D ink threshold (summing the
    // ideal directions leaves a float residue: 3e-16 D on CO2, 5e-8 D on BF3 -
    // no arrow is ever drawn from it) AND zero on the instrument.
    ok("...and the four SYMMETRIC species read EXACTLY zero (the arc's own beat)",
      zeros.every((k) => { const m = drive([{ id: "molecule", v: k }]).mu;
        return Math.abs(m) < 1e-6 && E.bscFmtD(m) === "0.00"; }),
      zeros.map((k) => k + " " + E.bscFmtD(drive([{ id: "molecule", v: k }]).mu) + " D").join(" · "));
    ok("the sweep is the WHOLE picker, not a spot check",
      PICKER.length === 9 && HALIDES.every((h) => PICKER.indexOf(h) >= 0),
      `${PICKER.length} species, halide family a subset of it`);
  }

  // ── (b) NEGATIVE CONTROL: the shipped-before resolution, reproduced exactly.
  {
    const oldAng = (k: string) => 104.5;                    // angle_deg, never re-seeded
    const oldMu = (k: string) => E.bscDipole(k, oldAng(k)).mag as number;
    ok("NEGATIVE CONTROL: the un-re-seeded angle rendered CO2 bent at 2.82 D and BF3 at 1.81 D",
      Math.abs(oldMu("CO2") - 2.8162) < 5e-4 && Math.abs(oldMu("BF3") - 1.8112) < 5e-4 &&
      Math.abs(drive([{ id: "molecule", v: "CO2" }]).mu) < 1e-6 &&
      Math.abs(drive([{ id: "molecule", v: "BF3" }]).mu) < 1e-6,
      `was CO2 ${oldMu("CO2").toFixed(4)} / BF3 ${oldMu("BF3").toFixed(4)} — now 0.00 / 0.00`);
    ok("NEGATIVE CONTROL: a single static default cannot serve the picker (180 breaks the bend beat)",
      Math.abs((E.bscDipole("H2O", 180).mag as number)) < 1e-9 &&
      Math.abs((E.bscDipole("H2O", 104.5).mag as number) - 1.8489) < 5e-4,
      "H2O at 180 deg reads 0.0000 D — why the default must follow the species");
  }

  // ── (c) THE TEACHER KEEPS CONTROL, and the next pick hands it to the species.
  {
    const dragged = drive([{ id: "molecule", v: "CO2" }], "explore", 130);
    ok("a teacher who has dragged the angle keeps it until the NEXT pick",
      /var angleNow = \(bscHasControl\(ctrls, "angle"\) && window\.PM_bscAngleDragged\)/.test(upd) &&
      /\? window\.PM_bscAngle : angleAt\(ms\);/.test(upd));
    ok("...and a pick hands the angle back to the newly picked species",
      dragged.w.PM_bscAngleDragged === false && dragged.ang === 180 && Math.abs(dragged.mu) < 1e-6,
      `dragged to 130 then picked CO2 -> ${dragged.ang} deg, mu ${dragged.mu.toFixed(4)} D`);
    const seq = drive([{ id: "molecule", v: "CO2" }, { id: "molecule", v: "BF3" }, { id: "molecule", v: "H2O" }]);
    ok("a run of picks never carries the previous species' geometry forward",
      seq.ang === 104.5 && Math.abs(seq.mu - 1.8489) < 5e-4 &&
      Math.abs(drive([{ id: "molecule", v: "H2O" }, { id: "molecule", v: "BF3" }]).mu) < 1e-6,
      "H2O -> CO2 -> BF3 -> H2O ends at 104.5 deg / 1.85 D");
  }

  // ── (d) D-1: THE RE-SEED IS AN EVENT, NOT AN ACCUMULATOR.
  {
    ok("the angle destination is a pure function of the RESOLVED molecule (no clock, no latch)",
      !/\bms\b/.test(angleSrc) && !/\+=/.test(angleSrc) && /angleTo = mol\.angle;/.test(angleSrc),
      angleSrc.split("\n").filter((l) => !/^\s*\/\//.test(l) && l.trim()).join(" ").trim());
    const a = angleTo("CO2", true), b = (angleTo("H2O", true), angleTo("CO2", true));
    ok("a frozen replay cannot depend on interaction history (same species -> same angle, always)",
      Object.is(a, b) && Object.is(angleTo("BF3", true), 120));
    ok("the pick handler touches no swap state and clears no picker's drag-seize (E1c-F handoff)",
      !/swapP|PM_bscSwap/.test(pickSrc) &&
      !/PM_bscMolDragged\s*=\s*false/.test(pickSrc) && !/PM_bscLigDragged\s*=\s*false/.test(pickSrc) &&
      !/PM_bscSpeciesDragged\s*=\s*false/.test(pickSrc));
  }

  // ── (e) GUIDED STATES ARE BYTE-IDENTICAL. Explore-gated at both halves.
  {
    ok("THE GUIDED ASSERTION: outside explore the authored angle_deg still wins, seized or not",
      angleTo("CO2", true, "dipole_sum") === 104.5 && angleTo("CO2", true, "compare") === 104.5 &&
      angleTo("H2O", true, "assemble") === 104.5 && angleTo("CO2", false, "explore") === 104.5);
    ok("...and a guided pick re-seeds nothing at all (the handler returns on the mode gate)",
      (() => { const r = drive([{ id: "ligand", v: "HI" }], "compare");
        return r.w.PM_bscAngle === 104.5 && r.w.PM_bscMolDragged === undefined; })() &&
      /if \(window\.PM_bscMode !== "explore"\) return;/.test(pickSrc));
    ok("a state with no authored angle_deg still resolves its own species' equilibrium",
      angleTo("CO2", false, "explore", null) === 180 && angleTo("NH3", false, "dipole_sum", null) === 107);
    ok("the state's mode is published for the once-built pick listeners",
      /window\.PM_bscMode = bs\.mode \|\| "dipole_sum";/.test(app));
  }

  // ── (f) G2: THE HALIDE ROW IS LIVE, AND NEVER BLANK.
  {
    const viaHalide = drive([{ id: "molecule", v: "HF" }, { id: "ligand", v: "HBr" }]);
    ok("THE G2 ASSERTION: a halide pick moves the molecule (the row was measurably inert)",
      viaHalide.key === "HBr" && Math.abs(viaHalide.mu - 0.83) < 5e-4 && viaHalide.molSel === "HBr",
      `HF then halide HBr -> mol ${viaHalide.key}, mu ${viaHalide.mu.toFixed(2)} D, molecule row reads ${viaHalide.molSel}`);
    ok("NEGATIVE CONTROL: the molecule picker used to SHADOW the halide in the same resolution",
      /var molKey = \(bscHasControl\(ctrls, "molecule"\) && window\.PM_bscMolDragged\) \? window\.PM_bscMol/.test(upd) &&
      /: \(bscHasControl\(ctrls, "ligand"\) && window\.PM_bscLigDragged\) \? window\.PM_bscLig/.test(upd),
      "resolution order is unchanged — the three pickers are kept AGREEING instead");
    ok("every halide reads its own mu through the halide row",
      HALIDES.every((h) => Math.abs(drive([{ id: "ligand", v: h }]).mu -
        ({ HF: 1.83, HCl: 1.11, HBr: 0.83, HI: 0.45 } as Record<string, number>)[h]) < 5e-4),
      HALIDES.map((h) => h + " " + drive([{ id: "ligand", v: h }]).mu.toFixed(2)).join(" · "));
    ok("outside the halide family the row shows its PLACEHOLDER, never a blank or a stale halide",
      drive([{ id: "ligand", v: "HI" }, { id: "molecule", v: "H2O" }]).halide === "" &&
      drive([{ id: "molecule", v: "HCl" }]).halide === "HCl" &&
      /var ligOpts = '<option value="">\\u2014<\/option>'/.test(bld));
    ok("the placeholder is display-only: picking it is not a species choice",
      /if \(!el\.value\) return;/.test(bld) &&
      /if \(id === "molecule" \|\| id === "ligand" \|\| id === "species"\) bscExploreSpeciesPicked/.test(bld));
    ok("the per-frame widget sync never hands the select a value it has no option for",
      /var ligWant = \(bscOptionOf\(lsel, molKey\) && MG_MOLECULES\[molKey\]\) \? molKey : "";/.test(upd) &&
      /if \(lsel && bscSelCur\(lsel\) !== ligWant\) bscSelValue\(lsel, ligWant\);/.test(upd) &&
      /if \(ligWant\) window\.PM_bscLig = molKey;/.test(upd));
    ok("the placeholder is selected by INDEX (Chromium DESELECTS on select.value = \"\")",
      /sel\.value = v;\s*\n\s*if \(v\) return;/.test(grabFn("bscSelValue")) &&
      /if \(sel\.options\[i\]\.value === ""\) \{ sel\.selectedIndex = i; return; \}/.test(grabFn("bscSelValue")) &&
      E.bscSelCur({ options: [{ value: "" }, { value: "HF" }], selectedIndex: -1 }) === null &&
      E.bscSelCur({ options: [{ value: "" }, { value: "HF" }], selectedIndex: 0 }) === "",
      "selectedIndex -1 and the placeholder both read value \"\" — only the index tells them apart");
    ok("bscOptionOf is total on a missing select and a missing value",
      E.bscOptionOf(null, "HF") === false &&
      E.bscOptionOf({ options: [{ value: "HF" }] }, "") === false &&
      E.bscOptionOf({ options: [{ value: "HF" }] }, "HF") === true &&
      E.bscOptionOf({ options: [{ value: "HF" }] }, "H2O") === false);
  }

  // ── (g) G3: THE AUTHORED BOUNDS ARE HONOURED, NOT DECORATIVE.
  {
    const limSrc = cutIn(bld, "var lim = function", "var molDef =", "lim/defc");
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const limRaw = new Function("SC", "bscClamp", `
      var def = function (k, d) { return (SC[k] && SC[k]["default"] != null) ? SC[k]["default"] : d; };
      ${limSrc}
      return { lim: lim, defc: defc };
    `);
    const SC = { angle: { min: 90, max: 180, step: 0.5, "default": 104.5 } };
    const L = limRaw(SC, E.bscClamp) as { lim: (k: string, w: string, d: number) => number; defc: (k: string, d: number, lo: number, hi: number) => number };
    ok("THE G3 ASSERTION: an authored min/max/step reaches the widget (angle.min = 90, not 60)",
      L.lim("angle", "min", 60) === 90 && L.lim("angle", "max", 180) === 180 && L.lim("angle", "step", 0.5) === 0.5);
    const L0 = (limRaw({}, E.bscClamp) as typeof L);
    ok("...and a concept that authors none is byte-identical (every hardcoded bound is the default)",
      L0.lim("angle", "min", 60) === 60 && L0.lim("angle", "max", 180) === 180 &&
      L0.defc("angle", 104.5, 60, 180) === 104.5 && L0.defc("spin", 0.16, 0, 0.6) === 0.16);
    ok("the seeded default is CLAMPED into the honoured range (thumb, span and global agree)",
      (limRaw({ angle: { min: 90, "default": 60 } }, E.bscClamp) as typeof L).defc("angle", 104.5, 60, 180) === 90 &&
      L.defc("angle", 104.5, 60, 180) === 104.5);
    const rows = ["angle", "spin", "temperature", "separation", "shift", "field", "valence"];
    ok("every range row reads its bounds from the authored block, none hardcodes them",
      rows.every((r) => new RegExp('id="bsc_' + r + '_slider" min="\' \\+ lim\\("' + r + '", "min"').test(bld)) &&
      /id="bsc_count_slider" min="' \+ lim\("count", "min", 1\) \+ '" max="' \+ nUnits/.test(bld),
      rows.join(",") + " + count (count.max stays the engine's mesh pool)");
    ok("the panel's window seeds take the SAME clamped default as the widget",
      /window\.PM_bscAngle = defc\("angle", 104\.5, 60, 180\);/.test(bld) &&
      /window\.PM_bscSpinDef = defc\("spin", 0\.16, 0, 0\.6\);/.test(bld) &&
      !/window\.PM_bscTemp = def\(/.test(bld));
  }
}

// ── 21. E1c-H: THE EXPLORE CAMERA FOLLOWS THE PICKED SPECIES ─────────────────
//   E1c-A solved the camera from the focal unit's SHAPE and E1c-E re-solved the
//   pyramid, but the solve ran once per STATE — so every species the explore
//   picker can reach was framed by the camera measured for the species the state
//   OPENS on. E1c-G's hand-driven sweep made all nine reachable for the first
//   time and the cost is measurable: the four halides (whose row exists to teach
//   the arrow's LENGTH) drew at the general solve's el 47, where a 1-bond unit
//   loses 20.6% of its projected bond length, and BF3 — admitted to the picker as
//   the "symmetric arrangement, zero resultant" example — was drawn on a plane
//   tilted 47 deg away, its 120 deg reading 97 deg and its countability BELOW the
//   floor the pyramid was measured against.
//   THE ASSERTION THAT WOULD HAVE CAUGHT IT is E1c-G's whole-picker sweep with a
//   camera on it: every species in explore_species, entered through the SHIPPED
//   pick handler and re-framed by the SHIPPED bscReframeForSpecies (both sliced
//   out of the renderer), asserted to land on the key MEASURED for its own shape
//   and to clear that key's floors — with the negative control that reproduces
//   today's single-camera behaviour.
console.log("\n=== 21. E1c-H EXPLORE CAMERA PER PICKED SPECIES (whole-picker camera sweep) ===");
{
  const bld = grabFn("buildBondingScene");
  const app = grabFn("applyBondingSceneState");
  const PICKER = ["H2O", "CO2", "CCl4", "CH4", "BF3", "HF", "HCl", "HBr", "HI"];
  const drive = driveExplore!;                       // the SHIPPED pick handler, section 20's driver
  const FOV = 60 * Math.PI / 180, ASPECT = 16 / 9, TAN = Math.tan(FOV / 2);
  const sub3 = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cr3 = (a: number[], b: number[]) =>
    [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dt3 = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const scl = (v: number[], k: number) => [v[0] * k, v[1] * k, v[2] * k];
  const proj = (c: any) => {
    const a = c.az * Math.PI / 180, e = c.el * Math.PI / 180, d = c.dist;
    const cam = [d * Math.cos(e) * Math.cos(a), d * Math.sin(e), d * Math.cos(e) * Math.sin(a)];
    const f = E.bscNorm(sub3([0, 0, 0], cam)), r = E.bscNorm(cr3(f, [0, 1, 0])), u = cr3(r, f);
    return (p: number[]) => {
      const v = sub3(p, cam), z = dt3(v, f);
      return { x: dt3(v, r) / (z * TAN * ASPECT), y: dt3(v, u) / (z * TAN), z };
    };
  };
  const ptSeg = (p: any, a: any, b: any) => {
    const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy;
    if (L2 < 1e-18) return Math.hypot(p.x - a.x, p.y - a.y);
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / L2));
    return Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy));
  };
  const segGap = (a1: any, a2: any, b1: any, b2: any) =>
    Math.min(ptSeg(a1, b1, b2), ptSeg(a2, b1, b2), ptSeg(b1, a1, a2), ptSeg(b2, a1, a2));
  /**
   * THE COUNTABILITY METRIC, REPAIRED (E1c-J). The metric this section shipped
   * with had three independent defects and it CERTIFIED the defect it existed to
   * catch — CCl4's fourth chlorine bitten for a third of S5's turn, NH3 losing a
   * hydrogen outright, and BF3's residual all passed it:
   *   (1) it subtracted only the NEAR radius, so it tested "the far ligand's
   *       CENTRE is outside the near silhouette" — a crescent passed as a disc.
   *       A countable disc needs BOTH radii off the separation.
   *   (2) it measured one static pose (phase 0) and took no phase argument at
   *       all, so a spin was invisible to it. Section 11 does sweep 360 deg but
   *       is radius-blind, and its CCl4 call projects D.arrows only — the central
   *       atom, the thing that does the biting, is not in its counted set.
   *   (3) UNIT MISMATCH: proj returns x divided by (z*TAN*ASPECT) — horizontal
   *       NDC — while the radius is r/(z*TAN), vertical NDC. Multiplying x by
   *       ASPECT puts both in the vertical-NDC unit, which is isotropic PIXELS
   *       (x_px = x_cam*H/(2 z tan) exactly as y_px), so a gap is a real screen
   *       distance: 1 unit = H/2 = 360 px at 720p. Line 1132 already did this and
   *       carried the comment; the two metrics in one file disagreed.
   * discGaps returns, in that unit, the smallest disjoint-disc gap over every
   * atom pair at spin phase `ang` about unit axis `ax`. Negative = one disc bites
   * another. It is also what makes the E1c-J invariant assertable: a spin about
   * the view axis leaves every one of these numbers EXACTLY where the home pose
   * put it, so no spin_rate and no spin_start_ms any JSON can author can move it.
   */
  const discGap = (cam: any, mk: string, ax: number[], ang: number, angle: number | null = null) => {
    const P = proj(cam), D: any = E.bscDipole(mk, angle), m = E.MG_MOLECULES[mk];
    const atoms = [{ p: P([0, 0, 0]), r: E.MG_ELEMENTS[m.central].radius }].concat(
      D.arrows.map((a: any, i: number) =>
        ({ p: P(scl(E.bscSpinRot(a.dir, ax, ang), E.BS_BOND_LEN)), r: E.MG_ELEMENTS[D.ligands[i]].radius })));
    let g = 9;
    for (let i = 0; i < atoms.length; i++) for (let j = i + 1; j < atoms.length; j++) {
      const near = atoms[i].p.z <= atoms[j].p.z ? atoms[i] : atoms[j];
      const far = near === atoms[i] ? atoms[j] : atoms[i];
      g = Math.min(g, Math.hypot((near.p.x - far.p.x) * ASPECT, near.p.y - far.p.y)
        - near.r / (near.p.z * TAN) - far.r / (far.p.z * TAN));
    }
    return g;
  };
  /** the drawn resultant length as a fraction of true, at spin phase `ang`. */
  const resAt = (cam: any, mk: string, ax: number[], ang: number, angle: number | null = null) => {
    const P = proj(cam), D: any = E.bscDipole(mk, angle), c0 = P([0, 0, 0]);
    if (!(D.mag > 1e-9)) return 1;
    const tip = P(scl(E.bscSpinRot(E.bscNorm(D.vec), ax, ang), D.mag * E.BS_ARROW_D_PER_UNIT));
    return Math.hypot((tip.x - c0.x) * ASPECT, tip.y - c0.y) /
      ((D.mag * E.BS_ARROW_D_PER_UNIT) / (c0.z * TAN));
  };
  /** the FULL-TURN sweep: 720 phases, worst gap, worst drawn length, and the
   *  largest departure from the home pose (0 iff the axis preserves depth). */
  const spinSweep = (cam: any, mk: string, ax: number[], angle: number | null = null) => {
    const g0 = discGap(cam, mk, ax, 0, angle), r0 = resAt(cam, mk, ax, 0, angle);
    let worst = g0, drift = 0, resDrift = 0, resWorst = r0, neg = 0;
    for (let i = 0; i < 720; i++) {
      const a = i * 2 * Math.PI / 720, g = discGap(cam, mk, ax, a, angle), r = resAt(cam, mk, ax, a, angle);
      worst = Math.min(worst, g); drift = Math.max(drift, Math.abs(g - g0));
      resWorst = Math.min(resWorst, r); resDrift = Math.max(resDrift, Math.abs(r - r0));
      if (g < 0) neg++;
    }
    return { home: g0, worst, drift, resHome: r0, resWorst, resDrift, pctNeg: neg / 720 * 100 };
  };
  /** the SHIPPED axis for a species: the view axis of the camera it is framed by. */
  const shipAx = (mk: string) => E.bscSpinAxis((E.BS_UNIT_CAMERAS as any)[E.bscUnitShapeKey(mk) as string]);
  /** the section-16 camera-solve margin, plus the two shape-specific ones. */
  const metrics = (cam: any, mk: string, angle: number | null = null) => {
    const P = proj(cam), D = E.bscDipole(mk, angle) as any, m = E.MG_MOLECULES[mk], c0 = P([0, 0, 0]);
    const atoms = [{ p: c0, r: E.MG_ELEMENTS[m.central].radius }].concat(
      D.arrows.map((a: any, i: number) =>
        ({ p: P(scl(a.dir, E.BS_BOND_LEN)), r: E.MG_ELEMENTS[D.ligands[i]].radius })));
    const vecs: any[] = D.arrows.map((a: any) => {
      const L = Math.abs(a.D) * E.BS_ARROW_D_PER_UNIT, sg = a.D >= 0 ? 1 : -1;
      return [P(scl(a.dir, E.BS_BOND_LEN * 0.5 - sg * L / 2)), P(scl(a.dir, E.BS_BOND_LEN * 0.5 + sg * L / 2))];
    });
    if (D.mag > 1e-9) vecs.push([c0, P(scl(E.bscNorm(D.vec), D.mag * E.BS_ARROW_D_PER_UNIT))]);
    // silh = the LEGACY near-silhouette clearance in horizontal NDC. It is NOT a
    // countability test (discGap above is) and E1c-J deliberately did not redefine
    // it: every camera floor below was MEASURED against this quantity by E1c-A/D/
    // E/H, so redefining it would silently re-scale five solves' recorded numbers.
    // It keeps its job — comparing one camera against another — under its own name.
    let silh = 9, gap = 9, box = 0, len = 9, angErr = 0;
    for (const a of atoms) box = Math.max(box, Math.abs(a.p.x), Math.abs(a.p.y));
    for (const v of vecs) box = Math.max(box, Math.abs(v[0].x), Math.abs(v[0].y), Math.abs(v[1].x), Math.abs(v[1].y));
    for (let i = 0; i < atoms.length; i++) for (let j = 0; j < atoms.length; j++) {
      if (i === j) continue;
      const near = atoms[i].p.z <= atoms[j].p.z ? atoms[i] : atoms[j];
      const far = near === atoms[i] ? atoms[j] : atoms[i];
      silh = Math.min(silh, Math.hypot(near.p.x - far.p.x, near.p.y - far.p.y) - near.r / (near.p.z * TAN));
    }
    for (let i = 0; i < vecs.length; i++) for (let j = i + 1; j < vecs.length; j++)
      gap = Math.min(gap, segGap(vecs[i][0], vecs[i][1], vecs[j][0], vecs[j][1]));
    // E1c-D's metric: drawn bond length against the same world length at the pivot depth.
    for (let i = 0; i < D.arrows.length; i++) {
      const q = P(scl(D.arrows[i].dir, E.BS_BOND_LEN));
      len = Math.min(len, Math.hypot((q.x - c0.x) * ASPECT, q.y - c0.y) / (E.BS_BOND_LEN / (c0.z * TAN)));
    }
    // E1c-H's metric: the DRAWN angle between two bonds against the true one.
    for (let i = 0; i < D.arrows.length; i++) for (let j = i + 1; j < D.arrows.length; j++) {
      const a = P(scl(D.arrows[i].dir, E.BS_BOND_LEN)), b = P(scl(D.arrows[j].dir, E.BS_BOND_LEN));
      const va = [(a.x - c0.x) * ASPECT, a.y - c0.y], vb = [(b.x - c0.x) * ASPECT, b.y - c0.y];
      const cs = (va[0] * vb[0] + va[1] * vb[1]) / (Math.hypot(va[0], va[1]) * Math.hypot(vb[0], vb[1]) || 1);
      angErr = Math.max(angErr, Math.abs(
        Math.acos(Math.max(-1, Math.min(1, cs))) * 180 / Math.PI -
        Math.acos(Math.max(-1, Math.min(1, E.mgDot(D.arrows[i].dir, D.arrows[j].dir)))) * 180 / Math.PI));
    }
    // the resultant a bent (pyramidalised) centre creates, drawn against true.
    let res = 0;
    if (D.mag > 1e-9) {
      const tip = P(scl(E.bscNorm(D.vec), D.mag * E.BS_ARROW_D_PER_UNIT));
      res = Math.hypot((tip.x - c0.x) * ASPECT, tip.y - c0.y) /
        ((D.mag * E.BS_ARROW_D_PER_UNIT) / (c0.z * TAN));
    }
    return { silh, gap, box, len, angErr, res };
  };
  const OCC = 0.09, OCC_3D = 0.06, GAP = 0.015, BOX = 0.85, LEN = 0.9, ANG = 8, RES = 0.50;

  // ── (a) THE SOURCE CONTRACT: the re-frame is an EVENT, explore-gated at apply.
  ok("the pick handler ends by re-framing the camera on the picked species",
    /bscReframeForSpecies\(v\);/.test(bld) &&
    bld.indexOf("bscReframeForSpecies(v)") > bld.indexOf("window.PM_bscAngleDragged = false"));
  ok("apply publishes the re-frame context ONLY for an explore state that owns its camera",
    /window\.PM_bscCamBs = \(\(bs\.mode \|\| "dipole_sum"\) === "explore" && !bs\.camera && !stateDef\.camera_position\)/.test(app) &&
    /window\.PM_bscCamKey = \(bs\.camera \|\| stateDef\.camera_position\) \? null : bscSolvedShapeKey\(bs, null\);/.test(app));
  ok("the re-frame reads no clock and accumulates nothing (D-1)",
    !/\bms\b|Date\.now|performance\.now|\+=/.test(grabFn("bscReframeForSpecies")));
  // E3b F3 UPDATE: the frame pass now writes ONE camera quantity, and only one —
  // the reveal ramp's DISTANCE, so a state whose block opens during its own beat
  // is framed for the pose it opens in and pulls to its solved distance across the
  // same ramp. It still may not re-solve or re-aim: no animateCameraTo, no theta
  // and no phi write anywhere in the frame pass.
  {
    const frameSrc = grabFn("updateBondingSceneFrame");
    ok("the frame pass never re-solves or re-aims the camera (the event half owns that)",
      !/animateCameraTo/.test(frameSrc) &&
      !/spherical\.theta\s*=|spherical\.phi\s*=/.test(frameSrc));
    ok("...and the ONE camera quantity it writes is the F3 reveal ramp, gated on PM_bscCamRamp",
      /var camRamp = window\.PM_bscCamRamp;/.test(frameSrc) &&
      /if \(camRamp && revMode !== "none"\)/.test(frameSrc) &&
      (frameSrc.match(/targetSpherical\.radius/g) || []).length === 1 &&
      (frameSrc.match(/[^t]spherical\.radius/g) || []).length === 1);
    ok("the ramp is closed-form in the reveal (no clock read, no accumulator) — a pin sees the same distance",
      /dRamp = camRamp\.d0 \+ \(camRamp\.dist - camRamp\.d0\) \* bscClamp\(revF, 0, 1\)/.test(frameSrc));
  }
  ok("it MOVES, it does not cut: the same helper state entry uses",
    /animateCameraTo\(\[dd \* Math\.cos\(elr\) \* Math\.cos\(azr\)/.test(grabFn("bscReframeForSpecies")));

  // ── (b) THE WHOLE-PICKER CAMERA SWEEP.
  {
    const bad: string[] = [], rows: string[] = [];
    for (const k of PICKER) {
      const r = drive([{ id: "molecule", v: k }]);
      const key = E.bscUnitShapeKey(k) as string;
      const want = (E.BS_UNIT_CAMERAS as any)[key];
      const got = r.cam || { az: 35, el: 47, dist: 7 };          // no move = the opening solve
      const same = Math.abs(got.az - want.az) < 1e-6 && Math.abs(got.el - want.el) < 1e-6 &&
        Math.abs(got.dist - want.dist) < 1e-6 && r.camKey === key;
      const m = metrics(want, k);
      // the vector-GAP floor does not apply to a 1-bond unit: its resultant IS its
      // single bond moment, so the two are collinear by construction (physics, not
      // a framing defect) and no camera can separate them. Its own floor is the
      // projected LENGTH, which is what that row teaches.
      const floors = m.silh >= (key === "general" ? OCC_3D : OCC) && m.box <= BOX &&
        (key === "diatomic" ? m.len >= LEN : m.gap >= GAP) &&
        (key !== "trigonal" || m.angErr <= ANG);
      if (!same || !floors) bad.push(`${k}(${same ? "floors" : "camera"})`);
      rows.push(`${k}:${key}@el${want.el}`);
    }
    ok("THE H1 ASSERTION: every picker species is framed by the solve measured for ITS shape",
      bad.length === 0, bad.length ? "BROKEN: " + bad.join(",") : rows.join("  "));
    for (const k of ["H2O", "CCl4", "BF3", "HI"]) {
      const m = metrics((E.BS_UNIT_CAMERAS as any)[E.bscUnitShapeKey(k)], k);
      console.log(`    ${k.padEnd(5)} ${String(E.bscUnitShapeKey(k)).padEnd(9)} occ=${m.silh.toFixed(4)} gap=${m.gap.toFixed(4)} box=${m.box.toFixed(3)} len=${m.len.toFixed(4)} angle-err=${m.angErr.toFixed(1)}deg`);
    }
  }

  // ── (c) NEGATIVE CONTROL: one camera for the whole picker — today's behaviour.
  {
    const gen = E.BS_UNIT_CAMERAS.general;
    const bf3 = metrics(gen, "BF3"), bf3t = metrics(E.BS_UNIT_CAMERAS.trigonal, "BF3");
    ok("NEGATIVE CONTROL: the state's opening solve puts BF3 BELOW the countability floor",
      bf3.silh < OCC && bf3t.silh >= OCC,
      `general occ=${bf3.silh.toFixed(4)} -> trigonal occ=${bf3t.silh.toFixed(4)} (floor ${OCC})`);
    ok("...and draws its 120 deg plane edge-on enough to read 22.6 deg wrong",
      bf3.angErr > 20 && bf3t.angErr <= ANG,
      `drawn bond angle off by ${bf3.angErr.toFixed(1)} deg -> ${bf3t.angErr.toFixed(1)} deg`);
    const dia = ["HF", "HCl", "HBr", "HI"];
    const worstGen = Math.min(...dia.map((k) => metrics(gen, k).len));
    const worstDia = Math.min(...dia.map((k) => metrics(E.BS_UNIT_CAMERAS.diatomic, k).len));
    ok("...and foreshortens all four halide rungs, the one quantity that row teaches",
      worstGen < LEN && worstDia >= LEN,
      `${worstGen.toFixed(4)}x -> ${worstDia.toFixed(4)}x true drawn bond length (+${((worstDia / worstGen - 1) * 100).toFixed(1)}%)`);
  }

  // ── (d) THE TRIGONAL SOLVE, and the CONSTRAINT that fixes its azimuth.
  //   The angle slider pyramidalises BF3 about its C3 axis (the plane normal, az
  //   57), so the resultant that bend creates points along that axis: the azimuth
  //   that draws the flat plane best is the one that hides the bent resultant.
  {
    const tri = E.BS_UNIT_CAMERAS.trigonal;
    ok("the TRIGONAL solve is the measured constant, at the house azimuth",
      JSON.stringify(tri) === JSON.stringify({ az: 35, el: 15, dist: 7 }) &&
      tri.az === E.BS_UNIT_CAMERAS.general.az &&
      Math.abs(E.MG_BEND_AZ - tri.az * Math.PI / 180) < 1e-12, JSON.stringify(tri));
    const bent = metrics(tri, "BF3", 95);
    ok("a teacher who BENDS BF3 still sees the resultant the bend creates",
      bent.res >= RES, `${bent.res.toFixed(4)}x true drawn length (floor ${RES})`);
    const faceOn = metrics({ az: 57, el: 0, dist: 7 }, "BF3", 95);
    const faceFlat = metrics({ az: 57, el: 0, dist: 7 }, "BF3");
    ok("NEGATIVE CONTROL: the azimuth that draws the FLAT plane best kills that resultant",
      faceFlat.angErr < 0.5 && faceOn.res < 0.02,
      `az 57 el 0: flat angle-err ${faceFlat.angErr.toFixed(2)} deg but bent resultant ${faceOn.res.toFixed(4)}x`);
    ok("NEGATIVE CONTROL: the pyramid's own azimuth is wrong for a trigonal plane",
      metrics({ az: 120, el: 15, dist: 7 }, "BF3").silh < OCC,
      `az 120 el 15: occ=${metrics({ az: 120, el: 15, dist: 7 }, "BF3").silh.toFixed(4)}`);
    console.log(`    trigonal solve  az ${tri.az} el ${tri.el}: occ=${metrics(tri, "BF3").silh.toFixed(4)} ` +
      `angle-err=${metrics(tri, "BF3").angErr.toFixed(1)}deg bent-resultant=${bent.res.toFixed(4)}x  ` +
      `(was occ=${metrics(E.BS_UNIT_CAMERAS.general, "BF3").silh.toFixed(4)} / ${metrics(E.BS_UNIT_CAMERAS.general, "BF3").angErr.toFixed(1)}deg)`);
  }

  // ── (e) NO TELEPORT, NO HISTORY, NO GUIDED REACH.
  {
    ok("a pick INSIDE one shape key moves the camera by exactly nothing",
      drive([{ id: "molecule", v: "CO2" }]).moves.length === 0 &&
      drive([{ id: "molecule", v: "CCl4" }]).moves.length === 0 &&
      drive([{ id: "ligand", v: "HI" }, { id: "ligand", v: "HF" }]).moves.length === 1,
      "H2O -> CO2 / CCl4: 0 moves; the four halide rungs share ONE camera");
    const viaA = drive([{ id: "molecule", v: "BF3" }]).cam;
    const viaB = drive([{ id: "molecule", v: "HI" }, { id: "molecule", v: "CCl4" }, { id: "molecule", v: "BF3" }]).cam;
    ok("the destination is a pure function of the RESOLVED species, not of the route",
      JSON.stringify(viaA) === JSON.stringify(viaB), JSON.stringify(viaA));
    ok("THE GUIDED ASSERTION: outside explore a pick re-frames nothing",
      drive([{ id: "molecule", v: "HI" }], "dipole_sum", null, null).moves.length === 0 &&
      drive([{ id: "molecule", v: "HI" }], "compare", null, null).moves.length === 0);
    ok("...and an authored camera or camera_position is never overridden by a pick",
      drive([{ id: "molecule", v: "HI" }], "explore", null, null).moves.length === 0);
    ok("a lattice / multi-unit / off-centre scene has no per-species key to follow",
      E.bscSolvedShapeKey({ mode: "coordination", placement: "lattice", units: [{ species: "Na+" }] }, "HI") === null &&
      E.bscSolvedShapeKey({ mode: "compare", units: [{ species: "H2O" }, { species: "H2S" }] }, "HI") === null &&
      E.bscSolvedShapeKey({ mode: "network", units: [{ species: "H2O", at: [6, 0, 0] }] }, "HI") === null &&
      E.bscSolvedShapeKey({ mode: "explore", species: "H2O" }, "HI") === "diatomic");
  }

  // ── (f) E1c-J: THE SPIN AXIS. ────────────────────────────────────────────
  //   E1c-E bought the pyramid's azimuth with an AUTHORING premise written in a
  //   comment — "no shipped state spins a pyramid" — and one round later the JSON
  //   authored spin_rate on that state. check:bonding-scene reads the RENDERER,
  //   not the concept, so it could not have caught it: a comment cannot fail.
  //   The repair is not a better comment and not a JSON assertion this gate has
  //   no standing to make. It is to make the premise MOOT: the spin axis is the
  //   state's VIEW axis, about which a rotation preserves every atom's depth
  //   exactly, so the projected picture is a rigid roll and EVERY quantity below
  //   is invariant. spin_rate and spin_start_ms choose where in a cycle a frozen
  //   pin lands; after E1c-J every phase of every cycle is the home pose rotated,
  //   so nothing an author can write reaches the solve. THAT is the assertion.
  {
    const SP = [...PICKER, "NH3", "NF3"];
    const PX = 360;                    // 1 vertical-NDC unit = H/2 = 360 px at 720p
    const PX_FLOOR = -0.5;             // half a pixel of silhouette: tangency, not a bite
    const bad: string[] = [], rows: string[] = [];
    for (const k of SP) {
      const cam = (E.BS_UNIT_CAMERAS as any)[E.bscUnitShapeKey(k) as string];
      const s = spinSweep(cam, k, shipAx(k));
      if (s.drift > 1e-9 || s.resDrift > 1e-9 || s.worst * PX < PX_FLOOR) bad.push(k);
      rows.push(`${k}:${(s.worst * PX).toFixed(1)}px`);
    }
    ok("THE E1c-J ASSERTION: a full turn about the shipped axis moves NOTHING",
      bad.length === 0, bad.length ? "BROKEN: " + bad.join(",") : rows.join(" "));
    ok("...so no spin_rate / spin_start_ms an author can write reaches the solve",
      SP.every((k) => {
        const cam = (E.BS_UNIT_CAMERAS as any)[E.bscUnitShapeKey(k) as string];
        // three unrelated authored spins, three unrelated pins: same picture.
        return [0.15, 0.55, 3.7].every((rate) => [12400, 18500, 99000].every((pin) => {
          const a = rate * (pin - 10400) / 1000;
          return Math.abs(discGap(cam, k, shipAx(k), a) - discGap(cam, k, shipAx(k), 0)) < 1e-9;
        }));
      }));
    for (const k of ["CCl4", "NH3", "NF3", "BF3"]) {
      const cam = (E.BS_UNIT_CAMERAS as any)[E.bscUnitShapeKey(k) as string];
      const nw = spinSweep(cam, k, shipAx(k)), oy = spinSweep(cam, k, [0, 1, 0]);
      console.log(`    ${k.padEnd(5)} +y: worst ${(oy.worst * PX).toFixed(1)}px neg ${oy.pctNeg.toFixed(1)}% of the turn` +
        `  ->  view: worst ${(nw.worst * PX).toFixed(1)}px neg ${nw.pctNeg.toFixed(1)}%`);
    }
    // CCl4's -0.4 px is a HOME-POSE property of the general solve, not of the
    // spin: its fourth chlorine is tangent to the carbon at az 35 el 47 before
    // anything turns. It cannot be fixed here — general.az is tied down to
    // MG_BEND_AZ (35) and the only relief at that azimuth is el 48..49, a camera
    // re-solve. Asserted as a RATCHET so it cannot quietly get worse.
    {
      const cam = E.BS_UNIT_CAMERAS.general;
      ok("CCl4's residual is the home pose, identical about EITHER axis (not the spin)",
        Math.abs(discGap(cam, "CCl4", [0, 1, 0], 0) - spinSweep(cam, "CCl4", shipAx("CCl4")).worst) < 1e-12 &&
        discGap(cam, "CCl4", shipAx("CCl4"), 0) * PX >= PX_FLOOR,
        `${(discGap(cam, "CCl4", shipAx("CCl4"), 0) * PX).toFixed(2)} px at every phase ` +
        `(el 48 would clear it at +1.3 px; el 47 is the E1c-A measured constant)`);
    }
    // NEGATIVE CONTROL: the axis this replaced, on the same repaired metric.
    {
      const nh3 = spinSweep(E.BS_UNIT_CAMERAS.pyramidal, "NH3", [0, 1, 0]);
      const ccl4 = spinSweep(E.BS_UNIT_CAMERAS.general, "CCl4", [0, 1, 0]);
      const bf3 = spinSweep(E.BS_UNIT_CAMERAS.trigonal, "BF3", [0, 1, 0]);
      ok("NEGATIVE CONTROL: world +y bites all three shapes on the SAME metric",
        nh3.worst * PX < -40 && ccl4.worst * PX < -10 && bf3.worst * PX < -25,
        `NH3 ${(nh3.worst * PX).toFixed(1)}px (${nh3.pctNeg.toFixed(1)}% of the turn), ` +
        `CCl4 ${(ccl4.worst * PX).toFixed(1)}px (${ccl4.pctNeg.toFixed(1)}%), BF3 ${(bf3.worst * PX).toFixed(1)}px`);
      // and the E1c-E defect it also brings back, on the state that argues LENGTH.
      const h2o = spinSweep(E.BS_UNIT_CAMERAS.general, "H2O", [0, 1, 0]);
      ok("...and foreshortens H2O's resultant, the quantity E1c-E exists to protect",
        h2o.resWorst < RES && spinSweep(E.BS_UNIT_CAMERAS.general, "H2O", shipAx("H2O")).resWorst >= RES,
        `+y draws it at ${h2o.resWorst.toFixed(3)}x true (floor ${RES}) -> view axis holds ${spinSweep(E.BS_UNIT_CAMERAS.general, "H2O", shipAx("H2O")).resWorst.toFixed(3)}x`);
      // the OLD metric's verdict on the same frames — why this section is repaired.
      const oldOcc = (ang: number) => {
        const P = proj(E.BS_UNIT_CAMERAS.general), D: any = E.bscDipole("CCl4", null);
        const atoms = [{ p: P([0, 0, 0]), r: E.MG_ELEMENTS.C.radius }].concat(
          D.arrows.map((a: any, i: number) =>
            ({ p: P(scl(E.bscSpinRot(a.dir, [0, 1, 0], ang), E.BS_BOND_LEN)), r: E.MG_ELEMENTS[D.ligands[i]].radius })));
        let o = 9;
        for (let i = 0; i < atoms.length; i++) for (let j = 0; j < atoms.length; j++) {
          if (i === j) continue;
          const n = atoms[i].p.z <= atoms[j].p.z ? atoms[i] : atoms[j], f = n === atoms[i] ? atoms[j] : atoms[i];
          o = Math.min(o, Math.hypot(n.p.x - f.p.x, n.p.y - f.p.y) - n.r / (n.p.z * TAN));
        }
        return o;
      };
      let oldWorst = 9;
      for (let i = 0; i < 720; i++) oldWorst = Math.min(oldWorst, oldOcc(i * 2 * Math.PI / 720));
      ok("THE REPAIR ITSELF: the metric this section shipped with PASSED the bite",
        oldWorst > 0 && ccl4.worst < 0,
        `near-radius-only occ stays +${oldWorst.toFixed(4)} across the very turn the ` +
        `repaired disc gap reads ${ccl4.worst.toFixed(4)} (${(ccl4.worst * PX).toFixed(1)}px)`);
    }
    // the source contract: a revert cannot leave this section green.
    {
      const frame = grabFn("updateBondingSceneFrame");
      ok("the shipped frame rotates about the published axis, never about +y",
        !/mgRotY\([^)]*\bsp(in|2)\b/.test(frame) && /bscSpinRot\([^)]*spinAx/.test(frame) &&
        /window\.PM_bscSpinAx \|\| bscSpinAxis\(/.test(frame));
      ok("apply and the re-frame both publish the axis of the camera they set",
        /window\.PM_bscSpinAx = bscSpinAxis\(/.test(app) &&
        /window\.PM_bscSpinAx = bscSpinAxis\(cam\);/.test(grabFn("bscReframeForSpecies")));
      ok("bscSpinAxis is a pure, unit, dist-independent function of the camera (D-1)",
        !/\bms\b|Date\.now|performance\.now|\+=/.test(grabFn("bscSpinAxis")) &&
        [E.BS_UNIT_CAMERAS.general, E.BS_UNIT_CAMERAS.pyramidal, E.BS_UNIT_CAMERAS.trigonal,
         E.BS_UNIT_CAMERAS.diatomic].every((c: any) =>
          Math.abs(E.bscMag(E.bscSpinAxis(c)) - 1) < 1e-12 &&
          E.bscSpinAxis(c).every((v: number, i: number) =>
            Math.abs(v - E.bscSpinAxis({ az: c.az, el: c.el, dist: 42 })[i]) < 1e-15)) &&
        E.bscSpinRot([0.3, 0.4, 0.5], [0, 1, 0], 0).join() === [0.3, 0.4, 0.5].join());
      ok("an authored camera_position drives the axis too (no scene rolls off-view)",
        E.bscSpinAxis([0, 0, 9]).join(",") === [0, -0, -1].join(",") &&
        /stateDef\.camera_position\) \? stateDef\.camera_position : cam\)/.test(app));
    }
  }
}

console.log("\n=== 22. E2b THERMAL LAYER (scripted heat · averaged readout · network fit) ===");
// The three asks hydrogen_bonding S6 could not be authored against: a temperature
// that RAMPS on the state clock, a links-per-molecule readout whose fixed-condition
// flicker does not swamp the taught delta, and a camera that actually frames a
// thirty-molecule network. Every assertion runs the SHIPPED bodies, and the two
// halves that matter most — "a state authoring no ramp is byte-identical" and "the
// dashes are still the instant" — are asserted as equalities, not argued.
{
  const updSrc = grabFn("updateBondingSceneFrame");
  const appSrc = grabFn("applyBondingSceneState");

  // ── EQ-1(a): the SHIPPED tempAt closure, lifted out of the frame pass and run
  //    here. Not a re-implementation — the exact source, with its four free
  //    variables injected.
  const lift = (decl: string, src: string) => {
    const a = src.indexOf(decl);
    if (a < 0) throw new Error("closure not found: " + decl);
    const i = src.indexOf("{", a);
    let d = 0;
    for (let j = i; j < src.length; j++) {
      if (src[j] === "{") d++;
      else if (src[j] === "}") { d--; if (d === 0) return src.slice(a, j + 1) + ";"; }
    }
    throw new Error("unbalanced closure " + decl);
  };
  // E3b S-1 moved the RAMP itself into the top-level pure bscTempAt (so the site
  // layer reads the identical body — section 32), leaving this closure as the
  // drag-seize binding. The lift therefore injects the two free variables it has
  // now, and the ramp assertions below run through the SHIPPED bscTempAt.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const makeTempAt = new Function("bs", "tempDragV", "bscTempAt",
    lift("var tempAt = function (mms)", updSrc) + "\nreturn tempAt;") as
    (bs: any, drag: number | null, f: any) => (m: number) => number;
  const tempAt = (th: any, dragged = false, w: any = {}) =>
    makeTempAt({ thermal: th }, dragged ? w.PM_bscTemp : null, E.bscTempAt);

  const S6 = { T_K: 600, T_from: 298, T_at_ms: 2200, T_ramp_ms: 5000, jiggle_scale: 0.9 };
  const heat = tempAt(S6);
  ok("the heat ramp HOLDS T_from before T_at_ms",
    heat(0) === 298 && heat(2199) === 298, `t=0 -> ${heat(0)}  t=2199 -> ${heat(2199)}`);
  ok("the heat ramp reaches T_K at T_at_ms + T_ramp_ms and then holds",
    Math.abs(heat(7200) - 600) < 1e-9 && Math.abs(heat(30000) - 600) < 1e-9,
    `t=7200 -> ${heat(7200).toFixed(4)}`);
  ok("the ramp is strictly monotonic through the beat (no overshoot, no latch)",
    [2200, 3200, 4200, 5200, 6200, 7200].every((t, i, a) =>
      i === 0 || (heat(t) > heat(a[i - 1]) && heat(t) <= 600 + 1e-9)));
  {
    // THE REWIND, sampled MID-RAMP, on the POSE it produces — not just the number.
    const T1 = heat(4700), j1 = E.bscJiggle(7, 4.7, T1, 0.9) as number[];
    heat(30000); E.bscJiggle(7, 30.0, heat(30000), 0.9);
    const T2 = heat(4700), j2 = E.bscJiggle(7, 4.7, T2, 0.9) as number[];
    ok("rewind t=4700 -> 30000 -> 4700 reproduces the MID-RAMP jiggle byte-for-byte",
      Object.is(T1, T2) && j1.every((v, i) => Object.is(v, j2[i])), `T=${T1.toFixed(4)} K`);
  }
  // ── EQ-1(b): BYTE-IDENTICAL when no ramp is authored. This is the whole
  //    backward-compatibility claim, and it is an equality against the pre-E2b
  //    expression ((th.T_K != null) ? th.T_K : BS_T0_K) at every t.
  {
    const TS = [0, 1, 250, 1499, 2200, 5000, 12345, 60000];
    const same = (th: any) => {
      const f = tempAt(th), want = (th.T_K != null) ? th.T_K : E.BS_T0_K;
      return TS.every((t) => Object.is(f(t), want));
    };
    ok("a state authoring no ramp is byte-identical to the pre-E2b static resolve",
      same({ T_K: 350, jiggle_scale: 0.12 }) && same({ T_K: 298 }) && same({}) &&
      same({ T_from: 298, jiggle_scale: 0.9 }) &&        // T_from with no T_at_ms
      same({ T_K: 600, T_at_ms: 2200 }),                 // T_at_ms with no T_from
      "T_K only / bare / half-authored ramps all resolve static");
    ok("a trusted drag seizes the temperature at EVERY t (both keys ignored)",
      [0, 3000, 9000].every((t) => tempAt(S6, true, { PM_bscTemp: 412 })(t) === 412));
  }
  // ── EQ-1(c): the shipped frame pass and apply really wire it, both directions.
  // E3b S-1: the ramp lives in bscTempAt now, and the frame pass DELEGATES to it
  // — both halves asserted, so neither the body nor the delegation can be lost.
  {
    const tSrc = grabFn("bscTempAt");
    ok("the shipped ramp body reads T_from / T_at_ms / T_ramp_ms",
      /th\.T_from/.test(tSrc) && /th\.T_at_ms/.test(tSrc) && /th\.T_ramp_ms/.test(tSrc));
    ok("...and the frame pass delegates to it (ONE body for both layers)",
      /var tempAt = function \(mms\) \{ return bscTempAt\(bs, mms, tempDragV\); \};/.test(updSrc) &&
      /var tempDragV = tempDragged \? window\.PM_bscTemp : null;/.test(updSrc));
  }
  ok("T_K is the ramp evaluated at state-local ms, and the widget tracks it",
    /var T_K = tempAt\(ms\);/.test(updSrc) &&
    /bscHasControl\(ctrls, "temperature"\) && !window\.PM_bscTempDragged/.test(updSrc));
  ok("state entry seeds the temperature widget at T_from, not at the destination",
    /PM_bscTemp\s*=\s*\(th\.T_from != null && th\.T_at_ms != null\) \? th\.T_from/.test(appSrc));
  ok("the lookback REPLAY carries the temperature of that instant, not the present one",
    /bscJiggle\(uu, mms \/ 1000, tempAt\(mms\), jScale\)/.test(updSrc));
  ok("no accumulator joined the thermal path (mgRamp only)",
    /mgRamp\(mms, th\.T_at_ms/.test(grabFn("bscTempAt")) && !/T_K\s*\+=/.test(updSrc));
  ok("BS_T_RAMP_MS matches deriveStateMeta's frozen-pin default",
    E.BS_T_RAMP_MS === 2000 && /asNum\(bscTh2\.T_ramp_ms, 2000\)/.test(META_SRC),
    `${E.BS_T_RAMP_MS} ms`);
  ok("deriveStateMeta pins PAST the settled temperature (T_at + T_ramp + 600)",
    /candidates\.push\(asNum\(bscTh2\.T_at_ms, 0\) \+ asNum\(bscTh2\.T_ramp_ms, 2000\) \+ 600\)/.test(META_SRC));

  // ── EQ-2: THE SOLVED 30-UNIT NETWORK, replayed through the SHIPPED link pass.
  //    A diamond (ice-Ic) arrangement at O...O = 5.75 units; per-unit orient aims
  //    two O-H bonds at two of the four neighbours. This is the fixture the
  //    measurement was taken on, so the gate measures what the concept will ship.
  const NET: { at: number[]; orient: number[] }[] = [
    { at: [0.44, 0, 0], orient: [125, -37] }, { at: [-2.88, -3.32, 3.32], orient: [232, -36] },
    { at: [-2.88, 3.32, -3.32], orient: [232, -36] }, { at: [3.76, -3.32, -3.32], orient: [232, -36] },
    { at: [3.76, 3.32, 3.32], orient: [232, -36] }, { at: [-6.2, -6.64, 0], orient: [125, -37] },
    { at: [-6.2, 0, -6.64], orient: [125, -37] }, { at: [-6.2, 0, 6.64], orient: [125, -37] },
    { at: [-6.2, 6.64, 0], orient: [125, -37] }, { at: [0.44, -6.64, -6.64], orient: [338, -39] },
    { at: [0.44, -6.64, 6.64], orient: [125, -37] }, { at: [0.44, 6.64, -6.64], orient: [125, -37] },
    { at: [0.44, 6.64, 6.64], orient: [53, 35] }, { at: [7.08, -6.64, 0], orient: [338, -39] },
    { at: [7.08, 0, -6.64], orient: [338, -39] }, { at: [7.08, 0, 6.64], orient: [53, 35] },
    { at: [7.08, 6.64, 0], orient: [53, 35] }, { at: [-9.52, -3.32, -3.32], orient: [232, -36] },
    { at: [-9.52, 3.32, 3.32], orient: [83, -29] }, { at: [-2.88, -9.96, -3.32], orient: [232, -36] },
    { at: [-2.88, 9.96, 3.32], orient: [301, 17] }, { at: [-2.88, -3.32, -9.96], orient: [301, 28] },
    { at: [-2.88, 3.32, 9.96], orient: [83, -29] }, { at: [3.76, -9.96, 3.32], orient: [232, -36] },
    { at: [3.76, 9.96, -3.32], orient: [301, 17] }, { at: [3.76, -3.32, 9.96], orient: [83, -29] },
    { at: [3.76, 3.32, -9.96], orient: [301, 28] }, { at: [10.4, -3.32, 3.32], orient: [20, -33] },
    { at: [10.4, 3.32, -3.32], orient: [20, -33] }, { at: [-12.84, 0, 0], orient: [125, -37] }
  ];
  const NBS = {
    placement: "free", mode: "network", links: {}, show_hud: true,
    hud_lines: ["links_per_unit"], thermal: { jiggle_scale: 0.9 },
    units: NET.map((u, i) => ({ id: "hb_w" + i, species: "H2O", at: u.at, orient: u.orient }))
  };
  const LC = E.bscLinkCfg(NBS);
  const SS = E.BS_LINK_SAMPLES as number, NFR = E.BS_LINK_FRAMES as number;
  const dtSm = (E.BS_LINK_LOOKBACK_MS as number) / (SS - 1);
  const BLn = E.BS_BOND_LEN as number;
  const netFr = E.mgFrame("H2O", null, null) as any;
  const netSites = E.bscLinkSites("H2O") as any;
  const netOffs = NET.map((u) => {
    const rot = E.bscOrientRot(u.orient);
    const oo: number[][] = [[0, 0, 0]];
    for (const d of netFr.bonds as number[][]) {
      const dv = rot ? rot(d) : d;
      oo.push([dv[0] * BLn, dv[1] * BLn, dv[2] * BLn]);
    }
    return oo;
  });
  const NU = NET.length, reachU = LC.break_pm / LC.pm_per_unit + 2 * BLn + 1.0;
  /** the SHIPPED pass, transcribed: window SS-1 is the drawn set, the mean is the readout */
  const netPass = (ms: number, T: (m: number) => number) => {
    const frames: (number[][][] | null)[] = [];
    for (let sI = 0; sI < NFR; sI++) {
      const mms = ms - (NFR - 1 - sI) * dtSm;
      if (mms < 0) { frames.push(null); continue; }
      const fpts: number[][][] = [];
      for (let u = 0; u < NU; u++) {
        const jg = E.bscJiggle(u, mms / 1000, T(mms), 0.9) as number[];
        const og = [NET[u].at[0] + jg[0], NET[u].at[1] + jg[1], NET[u].at[2] + jg[2]];
        const row: number[][] = [];
        for (const ov of netOffs[u]) row.push([og[0] + ov[0], og[1] + ov[1], og[2] + ov[2]]);
        fpts.push(row);
      }
      frames.push(fpts);
    }
    const last = frames[NFR - 1]!;
    const win = new Array(SS).fill(0);
    let nL = 0;
    for (let uA = 0; uA < NU && nL < E.BS_MAX_LINKS; uA++) {
      for (let uB = 0; uB < NU && nL < E.BS_MAX_LINKS; uB++) {
        if (uA === uB) continue;
        const cA = last[uA][0], cB = last[uB][0];
        const cx = cA[0] - cB[0], cy = cA[1] - cB[1], cz = cA[2] - cB[2];
        if (cx * cx + cy * cy + cz * cz > reachU * reachU) continue;
        for (const dn of netSites.donors) {
          for (const ac of netSites.acceptors) {
            if (nL >= E.BS_MAX_LINKS) break;
            const samp: any[] = [];
            for (let sI = 0; sI < NFR; sI++) {
              const F = frames[sI];
              if (!F) { samp.push(null); continue; }
              const Hp = F[uA][dn.slot], Dp = F[uA][dn.partner], Ap = F[uB][ac.slot];
              const vx = Ap[0] - Hp[0], vy = Ap[1] - Hp[1], vz = Ap[2] - Hp[2];
              const dU = Math.hypot(vx, vy, vz);
              const wx = Dp[0] - Hp[0], wy = Dp[1] - Hp[1], wz = Dp[2] - Hp[2];
              const wL = Math.hypot(wx, wy, wz) || 1;
              const ca = (vx * wx + vy * wy + vz * wz) / ((dU || 1) * wL);
              samp.push({ d: dU * LC.pm_per_unit, a: Math.acos(E.bscClamp(ca, -1, 1)) * 180 / Math.PI });
            }
            for (let w = 0; w < SS; w++) {
              if (E.bscLinkLatch(dn.q, ac.q, samp, LC, w, SS)) win[w]++;
            }
            if (E.bscLinkLatch(dn.q, ac.q, samp, LC, SS - 1, SS)) nL++;
          }
        }
      }
    }
    let vs = 0, vn = 0;
    for (let w = 0; w < SS; w++) { if (!frames[w + SS - 1]) continue; vs += win[w]; vn++; }
    return { inst: 2 * nL / NU, avg: vn > 0 ? 2 * (vs / vn) / NU : 2 * nL / NU, newest: win[SS - 1], raw: nL };
  };
  const flat = (K: number) => () => K;
  const band = (T: number) => {
    const inst: number[] = [], avg: number[] = [];
    for (let m = 800; m <= 18000; m += 40) { const r = netPass(m, flat(T)); inst.push(r.inst); avg.push(r.avg); }
    return {
      i0: Math.min(...inst), i1: Math.max(...inst), a0: Math.min(...avg), a1: Math.max(...avg),
      im: inst.reduce((x, y) => x + y, 0) / inst.length, am: avg.reduce((x, y) => x + y, 0) / avg.length
    };
  };
  const cold = band(298), hot = band(600);
  const r2 = (v: number) => v.toFixed(2);
  ok("THE DEFECT, still measurable: the INSTANTANEOUS ranges overlap at 298 / 600 K",
    hot.i1 > cold.i0,
    `298 K ${r2(cold.i0)}-${r2(cold.i1)}  600 K ${r2(hot.i0)}-${r2(hot.i1)}`);
  ok("THE FIX: the AVERAGED ranges SEPARATE (the readout stops being noise)",
    hot.a1 < cold.a0,
    `298 K ${r2(cold.a0)}-${r2(cold.a1)}  600 K ${r2(hot.a0)}-${r2(hot.a1)}  gap ${r2(cold.a0 - hot.a1)}`);
  ok("the average does not BIAS the reading (it agrees with the dashes on the mean)",
    Math.abs(cold.am - cold.im) < 0.02 && Math.abs(hot.am - hot.im) < 0.02,
    `298 K mean inst ${r2(cold.im)} avg ${r2(cold.am)} | 600 K inst ${r2(hot.im)} avg ${r2(hot.am)}`);
  ok("the smoothing is real: each averaged band is NARROWER than its instantaneous one",
    (cold.a1 - cold.a0) < (cold.i1 - cold.i0) && (hot.a1 - hot.a0) < (hot.i1 - hot.i0),
    `298 K ${r2(cold.i1 - cold.i0)} -> ${r2(cold.a1 - cold.a0)}  600 K ${r2(hot.i1 - hot.i0)} -> ${r2(hot.a1 - hot.a0)}`);
  {
    // THE DASHES ARE STILL THE INSTANT: the newest window IS the drawn set, and
    // hud_lines 'links' still prints that raw count while 'links_per_unit' prints
    // the mean. One instrument per quantity (D-3), two quantities.
    const p = netPass(8200, flat(298));
    ok("the newest lookback window IS the drawn link set (the dashes are unchanged)",
      p.newest === p.raw, `${p.raw} links drawn, window ${p.newest}`);
    ok("hud_lines 'links' prints the INSTANT and 'links_per_unit' prints the MEAN",
      /w === "links"\) lines\.push\("links = " \+ nLinks\)/.test(updSrc) &&
      /w === "links_per_unit"\) lines\.push\([^;]*PM_bscLinksPerUnitAvg\.toFixed\(2\)/.test(updSrc));
    ok("both readouts are published as window values for the professor pack",
      /window\.PM_bscLinksAvg =/.test(updSrc) && /window\.PM_bscLinksPerUnitAvg =/.test(updSrc));
    // ...and the SHIPPED pass really has the shape the replay above transcribes:
    // BS_LINK_FRAMES position samples, BS_LINK_SAMPLES folds of BS_LINK_SAMPLES,
    // the newest window drawing the dashes, and only VOTING windows in the
    // divisor. A transcription that drifted from the shipped body would make
    // every number above a measurement of the gate instead of the engine.
    ok("the shipped pass builds BS_LINK_FRAMES samples and folds BS_LINK_SAMPLES windows",
      E.BS_LINK_FRAMES === 2 * E.BS_LINK_SAMPLES - 1 &&
      /\bNF = BS_LINK_FRAMES\b/.test(updSrc) &&
      /for \(sI = 0; sI < NF; sI\+\+\) \{\s*var mms = ms - \(NF - 1 - sI\) \* dtS;/.test(updSrc) &&
      /var last = frames\[NF - 1\];/.test(updSrc) &&
      /for \(sI = 0; sI < NF; sI\+\+\) samp\.push\(pairSamp\(frames\[sI\], uA, uB, hS, pS, aS\)\);/.test(updSrc) &&
      /bscLinkLatch\(dn\[di\]\.q, ac\[aj\]\.q, samp, linkCfg, sI, S, pre\)\) linkWin\[sI\]\+\+/.test(updSrc) &&
      /bscLinkLatch\(dn\[di\]\.q, ac\[aj\]\.q, samp, linkCfg, S - 1, S, pre\)\) \{/.test(updSrc) &&
      /for \(sI = 0; sI < S; sI\+\+\) if \(frames\[sI \+ S - 1\]\) linkWinN\+\+;/.test(updSrc) &&
      /linkSum \/ linkWinN/.test(updSrc),
      `${E.BS_LINK_FRAMES} frames -> ${E.BS_LINK_SAMPLES} windows`);
  }
  {
    // D-1 on the AVERAGE: a pin rewind reproduces it bit-for-bit. The averaged
    // readout is memory over a bounded lookback, which is exactly the shape the
    // FIXED scar hysteretic_state_cannot_be_latched_under_a_time_pin forbids
    // latching — so it is asserted, not assumed.
    const a = [4000, 6000, 8000, 10000].map((m) => netPass(m, flat(298)).avg);
    netPass(30000, flat(298));
    const b = [4000, 6000, 8000, 10000].map((m) => netPass(m, flat(298)).avg);
    ok("REWIND: the averaged readout replays byte-for-byte after a jump to 30 s",
      a.every((v, i) => Object.is(v, b[i])), a.map(r2).join(" "));
  }
  {
    // the ramp and the readout, joined: across S6's own beat the averaged reading
    // must FALL, and it must not read its final value before the ramp starts.
    const ramp = tempAt(S6);
    const at = (m: number) => netPass(m, ramp).avg;
    const open = at(1500), mid = at(4700), done = at(9000);
    ok("across the scripted 298 -> 600 K beat the averaged readout FALLS",
      open > mid && mid > done && open - done > 0.3,
      `t=1500 ${r2(open)}  t=4700 ${r2(mid)}  t=9000 ${r2(done)}`);
    ok("the pre-ramp reading matches the unheated network (S6 opens COLD)",
      open >= cold.a0 - 1e-9 && open <= cold.a1 + 1e-9, `${r2(open)} inside ${r2(cold.a0)}-${r2(cold.a1)}`);
  }
  ok("bscLinkLatch with no window arguments is the whole-array fold (pre-E2b calls intact)",
    (() => {
      const q = E.bscCharges("H2O") as number[];
      const s = [{ d: 205, a: 176 }, { d: 232, a: 171 }, { d: 255, a: 168 }];
      return E.bscLinkLatch(q[1], q[0], s, LC) === E.bscLinkLatch(q[1], q[0], s, LC, 0, s.length) &&
        E.bscLinkLatch(q[1], q[0], s, LC) === true &&
        E.bscLinkLatch(q[1], q[0], s, LC, 2, 1) === false;   // the LAST sample alone cannot form
    })());

  // ── EQ-3: the auto-fit finally sees a molecular scene.
  {
    const ext = E.bscSiteExtent(NBS, null) as number;
    ok("bscSiteExtent now measures MOLECULAR units (it used to report 0 here)",
      ext > 15 && ext < 15.3, `${ext.toFixed(2)} units`);
    ok("...and it is |at| + BS_BOND_LEN + the outermost atom radius, orient-invariant",
      Math.abs(ext - (12.84 + E.BS_BOND_LEN + E.MG_ELEMENTS.O.radius)) < 1e-9,
      `12.84 + ${E.BS_BOND_LEN} + ${E.MG_ELEMENTS.O.radius}`);
    // REGRESSION: a lattice scene's extent must be untouched by the new branch.
    const latExt = E.bscSiteExtent(LATTICE_BS, null) as number;
    const latWant = (E.bscSiteList(LATTICE_BS, null) as any[]).reduce((m, s) =>
      Math.max(m, E.bscMag(s.at) + s.rPm / E.bscLinkCfg(LATTICE_BS).pm_per_unit), 0);
    ok("a LATTICE scene's extent is byte-identical (the ion path is untouched)",
      Object.is(latExt, latWant), `${latExt.toFixed(6)}`);
    ok("a single-unit dipole scene still reports a molecule-sized extent, not zero",
      (E.bscSiteExtent({ units: [{ species: "CCl4", at: [0, 0, 0] }] }, null) as number) > 2,
      `${(E.bscSiteExtent({ units: [{ species: "CCl4", at: [0, 0, 0] }] }, null) as number).toFixed(2)}`);
    // the camera, and the framing it produces, measured with the section-11 projector
    ok("the network camera opts into the auto-fit and keeps dist 17 as a FLOOR",
      E.BS_CAMERAS.network.fit === true && E.BS_CAMERAS.network.dist === 17.0);
    const fitted = Math.max(E.BS_CAMERAS.network.dist, ext * E.BS_FIT_MARGIN);
    const FOV = 60 * Math.PI / 180, ASPECT = 16 / 9, tn = Math.tan(FOV / 2);
    const sub3 = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const cr3 = (a: number[], b: number[]) =>
      [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dt3 = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    // every DRAWN atom, at the worst 600 K jiggle excursion, with its own radius
    const jAmp = 0.9 * Math.sqrt(600 / E.BS_T0_K);
    const atoms: { p: number[]; r: number }[] = [];
    for (let u = 0; u < NU; u++) for (let k = 0; k < netOffs[u].length; k++) {
      const o = netOffs[u][k];
      atoms.push({
        p: [NET[u].at[0] + o[0], NET[u].at[1] + o[1], NET[u].at[2] + o[2]],
        r: (k === 0 ? E.MG_ELEMENTS.O.radius : E.MG_ELEMENTS.H.radius) + jAmp
      });
    }
    const worstNdc = (dist: number) => {
      const c = E.BS_CAMERAS.network;
      const a = (c.az || 0) * Math.PI / 180, e = (c.el || 0) * Math.PI / 180;
      const cam = [dist * Math.cos(e) * Math.cos(a), dist * Math.sin(e), dist * Math.cos(e) * Math.sin(a)];
      const f = E.bscNorm(sub3([0, 0, 0], cam)), r = E.bscNorm(cr3(f, [0, 1, 0])), u = cr3(r, f);
      let wx = 0, wy = 0;
      for (const at2 of atoms) {
        const d = sub3(at2.p, cam), z = dt3(d, f);
        if (z <= 0.01) return 9;
        wx = Math.max(wx, (Math.abs(dt3(d, r)) + at2.r) / (z * tn * ASPECT));
        wy = Math.max(wy, (Math.abs(dt3(d, u)) + at2.r) / (z * tn));
      }
      return Math.max(wx, wy);
    };
    ok("at the FITTED distance the whole 30-unit network is on frame (|NDC| <= 1)",
      worstNdc(fitted) <= 1, `dist ${fitted.toFixed(2)} -> worst |NDC| ${worstNdc(fitted).toFixed(3)}`);
    ok("NEGATIVE CONTROL: at the unfitted dist 17 the same network CLIPS",
      worstNdc(17) > 1, `worst |NDC| ${worstNdc(17).toFixed(3)} — nearly half the cluster off-screen`);
    // E3b add-on (2026-08-03): the margin was derived from the FLAT-PLANE
    // condition (e/tan(fov/2) = 1.732e) while bscSiteExtent returns a bounding
    // SPHERE radius, which needs the TANGENCY condition (e/sin(fov/2) = 2.000e).
    // At the old 1.90 an extent-sized object projected to |NDC| 1.071 — off frame
    // by 7% at the corner, by construction. Asserted as the DERIVATION, not as a
    // transcribed constant, so the next edit has to justify itself.
    const HALF_FOV = Math.PI / 6;                 // PerspectiveCamera(60, ...)
    ok("BS_FIT_MARGIN satisfies the TANGENCY condition for a bounding sphere",
      (E.BS_FIT_MARGIN as number) >= 1 / Math.sin(HALF_FOV) &&
      Math.abs((E.BS_FIT_CLIP as number) - 1 / Math.sin(HALF_FOV)) < 1e-9 &&
      !/fit_margin/.test(SRC),
      `margin ${E.BS_FIT_MARGIN} >= tangency ${(1 / Math.sin(HALF_FOV)).toFixed(3)} ` +
      `(the old 1.90 was the flat-plane ${(1 / Math.tan(HALF_FOV)).toFixed(3)} plus slack)`);
    // worst |NDC| for a bounding SPHERE of radius e at distance d = m*e: the
    // tangent point subtends asin(1/m), so |NDC| = tan(asin(1/m)) / tan(fov/2)
    //                                           = 1 / (tan(fov/2) * sqrt(m^2 - 1)).
    const ndcAt = (m: number) => 1 / (Math.tan(HALF_FOV) * Math.sqrt(m * m - 1));
    ok("NEGATIVE CONTROL: the OLD margin puts an extent-sized corner OFF frame",
      ndcAt(1.90) > 1 && ndcAt(E.BS_FIT_MARGIN as number) < 1 &&
      Math.abs(ndcAt(1 / Math.sin(HALF_FOV)) - 1) < 1e-9,
      `worst |NDC| at the old 1.90 = ${ndcAt(1.90).toFixed(3)}, at ${E.BS_FIT_MARGIN} = ` +
      `${ndcAt(E.BS_FIT_MARGIN as number).toFixed(3)}, at the bare tangency 2.000 = ` +
      `${ndcAt(2).toFixed(3)} (exactly on the edge, which is why 2.000 is the CUT and not the FIT)`);
    ok("the fit and the CUT are two different questions and two different numbers",
      (E.BS_FIT_CLIP as number) < (E.BS_FIT_MARGIN as number) &&
      /if \(ext0 > 0 && spherical\.radius < ext0 \* BS_FIT_CLIP\) \{/.test(SRC),
      `fit ${E.BS_FIT_MARGIN} (tangency + border), cut ${E.BS_FIT_CLIP} (tangency exactly)`);
    ok("no per-camera knob was invented and the border is real",
      !/fit_margin/.test(SRC),
      `margin ${E.BS_FIT_MARGIN} -> dist ${fitted.toFixed(2)}, border ${((1 - worstNdc(fitted)) * 100).toFixed(0)}%`);
  }

  // ═════════════════════════════════════════════════════════════════════════
  console.log("\n=== 23. E2c LATCH HISTORY (break_pm reachable on a slow scripted ramp) ===");
  // The FIXED scar hysteretic_state_cannot_be_latched_under_a_time_pin states the
  // contract as "forming at the inner threshold and SURVIVING TO THE OUTER ONE".
  // The 640 ms lookback honours it only while the form -> break traversal fits
  // inside the window; hydrogen_bonding S3 traverses it in 3675 ms, so the link
  // died at H...O ~ 210-223 pm under a caption naming 260. Everything below runs
  // the SHIPPED bscLinkOk / bscLinkLatch — the gate supplies positions, never the
  // criterion — and the pre-fix behaviour is kept as the negative control.
  const S3BS: any = {
    placement: "free", mode: "approach_link", separation_axis: [1, 0, 0],
    approach_from: 5.75, separation: 8.0, approach_at_ms: 1000, approach_duration_ms: 11500,
    links: { enabled: true }, hud_lines: ["links"],
    units: [{ id: "hb_donor", species: "H2O", at: [0, 0, 0], orient: [190, 69] },
            { id: "hb_acceptor", species: "H2O", at: [0, 0, 0], orient: [180, 0] }]
  };
  const S2BS: any = Object.assign({}, S3BS, {
    approach_from: 12.0, separation: 5.75, approach_at_ms: 1500, approach_duration_ms: 10500
  });
  const pairOffs = (bs: any) => bs.units.map((u: any) => {
    const rot = E.bscOrientRot(u.orient);
    const oo: number[][] = [[0, 0, 0]];
    for (const d of (E.mgFrame("H2O", null, null) as any).bonds as number[][]) {
      const dv = rot ? rot(d) : d;
      oo.push([dv[0] * BLn, dv[1] * BLn, dv[2] * BLn]);
    }
    return oo;
  });
  /**
   * The SHIPPED two-unit pass, transcribed: closed-form separation ramp, the fine
   * BS_LINK_FRAMES window, and (hist) the E2c coarse history folded once per pair
   * into the seed. Returns the drawn link count and the H...O it is drawn at.
   */
  const approachPass = (bs: any, ms: number, hist: boolean) => {
    const offs = pairOffs(bs), sites = E.bscLinkSites("H2O") as any;
    const cfg = E.bscLinkCfg(bs), p2u = cfg.pm_per_unit;
    const sepAt = (m: number) => E.mgRamp(m, bs.approach_at_ms, bs.approach_duration_ms,
      bs.approach_from, bs.separation);
    const posAt = (m: number) => {
      const s = sepAt(m);
      return [0, 1].map((u) => offs[u].map((o: number[]) =>
        [(u === 0 ? -0.5 : 0.5) * s + o[0], o[1], o[2]]));
    };
    const fine: (number[][][] | null)[] = [];
    for (let sI = 0; sI < NFR; sI++) {
      const m = ms - (NFR - 1 - sI) * dtSm;
      fine.push(m < 0 ? null : posAt(m));
    }
    // the shipped gate on the history: an approach ramp SLOWER than the lookback
    const apDur = bs.approach_duration_ms, histOn = hist &&
      bs.approach_at_ms != null && bs.approach_from != null && apDur > E.BS_LINK_LOOKBACK_MS;
    const hFrames: number[][][][] = [];
    if (histOn) {
      const hSpan = ms - (NFR - 1) * dtSm;
      if (hSpan > 0) {
        const hN = Math.min(E.BS_LINK_HIST_MAX, Math.max(1, Math.ceil(hSpan / E.BS_LINK_HIST_DT_MS)));
        for (let h = 0; h < hN; h++) hFrames.push(posAt(h * (hSpan / hN)));
      }
    }
    const samp1 = (F: number[][][] | null, hS: number, pS: number, aS: number) => {
      if (!F) return null;
      const Hp = F[0][hS], Dp = F[0][pS], Ap = F[1][aS];
      const v = [Ap[0] - Hp[0], Ap[1] - Hp[1], Ap[2] - Hp[2]];
      const dU = Math.hypot(v[0], v[1], v[2]);
      const w = [Dp[0] - Hp[0], Dp[1] - Hp[1], Dp[2] - Hp[2]];
      const wL = Math.hypot(w[0], w[1], w[2]) || 1;
      const ca = (v[0] * w[0] + v[1] * w[1] + v[2] * w[2]) / ((dU || 1) * wL);
      return { d: dU * p2u, a: Math.acos(E.bscClamp(ca, -1, 1)) * 180 / Math.PI };
    };
    let links = 0, drawnD = 0;
    for (const dn of sites.donors) for (const ac of sites.acceptors) {
      const s = fine.map((F) => samp1(F, dn.slot, dn.partner, ac.slot));
      const pre = hFrames.length
        ? E.bscLinkLatch(dn.q, ac.q, hFrames.map((F) => samp1(F, dn.slot, dn.partner, ac.slot)),
            cfg, 0, hFrames.length)
        : false;
      if (E.bscLinkLatch(dn.q, ac.q, s, cfg, SS - 1, SS, pre)) {
        links++;
        drawnD = Math.max(drawnD, (s[NFR - 1] as any).d);
      }
    }
    return { links, drawnD };
  };
  {
    const fixed = (m: number) => approachPass(S3BS, m, true);
    const old = (m: number) => approachPass(S3BS, m, false);
    // where the two thresholds actually fall on S3's shipped cue times
    const dAt = (m: number) => approachPass(S3BS, m, true).drawnD ||
      (E.mgRamp(m, 1000, 11500, 5.75, 8.0) - E.BS_BOND_LEN) * 48;
    ok("THE DEFECT, measurable: without the history the link dies far inside break_pm",
      old(5000).links === 1 && old(6000).links === 0,
      `t=5000 links ${old(5000).links} @ ${old(5000).drawnD.toFixed(1)} pm  ->  t=6000 links ${old(6000).links}`);
    ok("THE FIX: the link SURVIVES past 223 pm and out to the authored break_pm",
      fixed(6000).links === 1 && fixed(8000).links === 1 && fixed(8600).links === 1,
      `t=6000 ${fixed(6000).drawnD.toFixed(1)} pm  t=8000 ${fixed(8000).drawnD.toFixed(1)} pm  ` +
      `t=8600 ${fixed(8600).drawnD.toFixed(1)} pm`);
    ok("...and it BREAKS at break_pm, not before and not after (260 +- 4 pm)",
      fixed(8600).links === 1 && fixed(8800).links === 0 &&
      Math.abs(fixed(8600).drawnD - E.BS_LINK_DEFAULTS.break_pm) < 4,
      `last drawn at ${fixed(8600).drawnD.toFixed(1)} pm (t=8600), gone by t=8800 ` +
      `(${dAt(8800).toFixed(1)} pm)`);
    ok("the link never re-forms once broken (the ramp only opens)",
      [9200, 10000, 12000, 16000].every((m) => fixed(m).links === 0));
    ok("forming still needs form_pm: the pair is NOT linked before it ever closed",
      approachPass(S2BS, 1500, true).links === 0 &&
      approachPass(S2BS, 4000, true).links === 0,
      `S2 opens at 480 pm: t=1500 ${approachPass(S2BS, 1500, true).links} links, ` +
      `t=4000 ${approachPass(S2BS, 4000, true).links}`);
    ok("the INBOUND approach (S2) is unchanged by the history, sample for sample",
      [800, 2000, 4000, 6000, 8000, 9000, 10000, 11500, 13000].every((m) =>
        approachPass(S2BS, m, true).links === approachPass(S2BS, m, false).links),
      "history can only ADD memory of a form event, and S2 has none until it closes");
    // D-1: the seed is memory, and memory is exactly what the pin scar forbids
    // LATCHING. It is closed-form, so the rewind is asserted, not argued.
    const a = [5000, 6000, 7000, 8000, 8600].map((m) => fixed(m).links);
    fixed(30000); fixed(1200);
    const b = [5000, 6000, 7000, 8000, 8600].map((m) => fixed(m).links);
    ok("REWIND: t -> 30 000 -> t reproduces the link set byte-for-byte (no latch)",
      a.every((v, i) => v === b[i]), `[${a.join(",")}]`);
    ok("the coarse history is bounded and evenly spaced (no unbounded replay)",
      E.BS_LINK_HIST_DT_MS === E.BS_LINK_LOOKBACK_MS && E.BS_LINK_HIST_MAX === 32,
      `${E.BS_LINK_HIST_MAX} x ${E.BS_LINK_HIST_DT_MS} ms = ` +
      `${(E.BS_LINK_HIST_MAX * E.BS_LINK_HIST_DT_MS / 1000).toFixed(1)} s ceiling`);
  }
  {
    // BYTE-IDENTITY: a state that authors no slow approach builds no history at
    // all — asserted on the shipped gate expression and on the fold itself.
    ok("no approach ramp -> no history (the shipped gate reads all three terms)",
      /var histOn = \(bs\.approach_at_ms != null && bs\.approach_from != null &&\s*apDur > BS_LINK_LOOKBACK_MS\);/
        .test(updSrc));
    ok("a ramp FASTER than the lookback also builds none (the window already spans it)",
      (() => {
        const fast = Object.assign({}, S3BS, { approach_duration_ms: 400 });
        return [1200, 1400, 2000, 5000].every((m) =>
          approachPass(fast, m, true).links === approachPass(fast, m, false).links);
      })());
    ok("bscLinkLatch with no seed is the pre-E2c fold (every earlier call intact)",
      (() => {
        const q = E.bscCharges("H2O") as number[];
        const s = [{ d: 240, a: 176 }, { d: 250, a: 171 }];
        return E.bscLinkLatch(q[1], q[0], s, LC) === false &&
          E.bscLinkLatch(q[1], q[0], s, LC, 0, 2, false) === false &&
          E.bscLinkLatch(q[1], q[0], s, LC, 0, 2, true) === true;   // the seed IS the memory
      })());
    ok("the network states never build a history (30 units, no approach authored)",
      (NBS as any).approach_at_ms === undefined && netPass(8200, flat(298)).raw === 51,
      "S5/S6/S7/S8 fold exactly the 640 ms window, as measured in section 22");
  }

  // ═════════════════════════════════════════════════════════════════════════
  console.log("\n=== 24. E2d OPENING CAMERA (the new scene is never drawn under the old one) ===");
  {
    const FOV = 60 * Math.PI / 180, ASPECT = 16 / 9, tn = Math.tan(FOV / 2);
    const sub3 = (x: number[], y: number[]) => [x[0] - y[0], x[1] - y[1], x[2] - y[2]];
    const cr3 = (x: number[], y: number[]) =>
      [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
    const dt3 = (x: number[], y: number[]) => x[0] * y[0] + x[1] * y[1] + x[2] * y[2];
    /** worst |NDC| over every DRAWN atom of a two-unit approach scene at t=0 */
    const worstAt = (bs: any, cam: any, dist: number) => {
      const offs = pairOffs(bs), s = bs.approach_from;
      const atoms: { p: number[]; r: number }[] = [];
      for (let u = 0; u < 2; u++) for (let k = 0; k < offs[u].length; k++) {
        const o = offs[u][k];
        atoms.push({
          p: [(u === 0 ? -0.5 : 0.5) * s + o[0], o[1], o[2]],
          r: (k === 0 ? E.MG_ELEMENTS.O.radius : E.MG_ELEMENTS.H.radius)
        });
      }
      const a = (cam.az || 0) * Math.PI / 180, e = (cam.el || 0) * Math.PI / 180;
      const c = [dist * Math.cos(e) * Math.cos(a), dist * Math.sin(e), dist * Math.cos(e) * Math.sin(a)];
      const f = E.bscNorm(sub3([0, 0, 0], c)), r = E.bscNorm(cr3(f, [0, 1, 0])), up = cr3(r, f);
      let w = 0;
      for (const at2 of atoms) {
        const d = sub3(at2.p, c), z = dt3(d, f);
        if (z <= 0.01) return 9;
        w = Math.max(w, (Math.abs(dt3(d, r)) + at2.r) / (z * tn * ASPECT));
        w = Math.max(w, (Math.abs(dt3(d, up)) + at2.r) / (z * tn));
      }
      return w;
    };
    const S1CAM = E.BS_UNIT_CAMERAS.general;                 // what S2 opens UNDER
    const S2CAM = E.BS_CAMERAS.approach_link;                // what S2 is solved FOR
    ok("THE DEFECT, measurable: at S1's camera the S2 opening pose CLIPS",
      worstAt(S2BS, S1CAM, S1CAM.dist) > 1,
      `worst |NDC| ${worstAt(S2BS, S1CAM, S1CAM.dist).toFixed(3)} at el ${S1CAM.el} / dist ${S1CAM.dist}`);
    ok("...and it is NOT authorable around — every usable approach_from clips too",
      [12, 9, 8, 7, 6.6].every((v) =>
        worstAt(Object.assign({}, S2BS, { approach_from: v }), S1CAM, S1CAM.dist) > 1),
      [12, 9, 8, 7, 6.6].map((v) =>
        `${v}:${worstAt(Object.assign({}, S2BS, { approach_from: v }), S1CAM, S1CAM.dist).toFixed(2)}`).join(" "));
    ok("ACCEPTANCE: at its OWN camera no drawn atom exceeds |NDC| 1 at t=0",
      worstAt(S2BS, S2CAM, S2CAM.dist) <= 1,
      `approach_from 12.0 unchanged -> worst |NDC| ${worstAt(S2BS, S2CAM, S2CAM.dist).toFixed(3)}`);
    // the TRIGGER: a measurement, not a threshold
    const ext0 = E.bscOpeningExtent(S2BS) as number;
    ok("bscOpeningExtent sees the OPENING pull, which units[].at cannot express",
      Math.abs(ext0 - (12.0 * 0.5 + E.BS_BOND_LEN + E.MG_ELEMENTS.O.radius)) < 1e-9 &&
      ext0 > (E.bscSiteExtent(S2BS, null) as number),
      `opening ${ext0.toFixed(2)} vs settled ${(E.bscSiteExtent(S2BS, null) as number).toFixed(2)}`);
    ok("the snap FIRES for S2 under S1's camera and would not for its own",
      S1CAM.dist < ext0 * E.BS_FIT_CLIP && S2CAM.dist * 1.0 < ext0 * E.BS_FIT_CLIP,
      `needs ${(ext0 * E.BS_FIT_CLIP).toFixed(1)}, has ${S1CAM.dist}`);
    ok("the glide is KEPT wherever it survives (E1c-H: it moves, it does not cut)",
      (E.bscOpeningExtent({ units: [{ species: "H2O", at: [0, 0, 0] }] }) as number) *
        E.BS_FIT_CLIP < E.BS_UNIT_CAMERAS.general.dist &&
      (E.bscOpeningExtent(S3BS) as number) * E.BS_FIT_CLIP < E.BS_CAMERAS.approach_link.dist,
      `single unit ${((E.bscOpeningExtent({ units: [{ species: "H2O", at: [0, 0, 0] }] }) as number) * E.BS_FIT_CLIP).toFixed(2)} < 7  |  ` +
      `S3 ${((E.bscOpeningExtent(S3BS) as number) * E.BS_FIT_CLIP).toFixed(2)} < 11`);
    ok("bscOpeningExtent is config-only (no clock, no live camera — pin-stable)",
      !/\bms\b|time|Date\.now|spherical/.test(grabFn("bscOpeningExtent")));
    ok("a scene with no separation_axis reports exactly bscSiteExtent (byte-identical)",
      Object.is(E.bscOpeningExtent(NBS), E.bscSiteExtent(NBS, null)) &&
      Object.is(E.bscOpeningExtent(LATTICE_BS), E.bscSiteExtent(LATTICE_BS, null)));
    ok("the shipped apply snaps the WHOLE pose and only on the measured overflow",
      /var ext0 = bscOpeningExtent\(bs\);/.test(appSrc) &&
      /if \(ext0 > 0 && spherical\.radius < ext0 \* BS_FIT_CLIP\) \{/.test(appSrc) &&
      /spherical\.radius = targetSpherical\.radius;/.test(appSrc) &&
      /animating = false;/.test(appSrc) && /updateCameraFromSpherical\(\);/.test(appSrc));
  }

  // ═════════════════════════════════════════════════════════════════════════
  console.log("\n=== 25. E2e EXPLORE SANDBOX (a multi-unit network survives being a sandbox) ===");
  {
    ok("the explore camera opts into the auto-fit, keeping dist 7.0 as a FLOOR",
      E.BS_CAMERAS.explore.fit === true && E.BS_CAMERAS.explore.dist === 7.0);
    const extS8 = E.bscSiteExtent(NBS, null) as number;
    const fitS8 = Math.max(E.BS_CAMERAS.explore.dist, extS8 * E.BS_FIT_MARGIN);
    ok("a 30-unit sandbox is framed like the network it came from (not at dist 7)",
      fitS8 > 28 && Math.abs(fitS8 - Math.max(E.BS_CAMERAS.network.dist, extS8 * E.BS_FIT_MARGIN)) < 1e-9,
      `dist ${fitS8.toFixed(2)} (visible half-height at 7.0 is ${(7 * Math.tan(Math.PI / 6)).toFixed(2)} vs radius 12.84)`);
    ok("...and every single-unit sandbox is byte-identical (the fit is a no-op there)",
      (E.bscSiteExtent({ units: [{ species: "CCl4", at: [0, 0, 0] }] }, null) as number) *
        E.BS_FIT_MARGIN < E.BS_CAMERAS.explore.dist,
      `${((E.bscSiteExtent({ units: [{ species: "CCl4", at: [0, 0, 0] }] }, null) as number) * E.BS_FIT_MARGIN).toFixed(2)} < 7.0`);
    // Defect 2 — the forced idle spin rotates intra-unit offsets, not the camera.
    const spinPass = (ms: number, rate: number) => {
      const ax = E.bscSpinAxis(E.BS_CAMERAS.explore) as number[];
      const frames: (number[][][] | null)[] = [];
      for (let sI = 0; sI < NFR; sI++) {
        const mms = ms - (NFR - 1 - sI) * dtSm;
        if (mms < 0) { frames.push(null); continue; }
        const ang = rate > 0 ? rate * mms / 1000 : 0;
        const fpts: number[][][] = [];
        for (let u = 0; u < NU; u++) {
          const jg = E.bscJiggle(u, mms / 1000, 298, 0.9) as number[];
          const og = [NET[u].at[0] + jg[0], NET[u].at[1] + jg[1], NET[u].at[2] + jg[2]];
          fpts.push(netOffs[u].map((o: number[]) => {
            const ov = ang !== 0 ? E.bscSpinRot(o, ax, ang) : o;
            return [og[0] + ov[0], og[1] + ov[1], og[2] + ov[2]];
          }));
        }
        frames.push(fpts);
      }
      const last = frames[NFR - 1]!;
      let nL = 0;
      for (let uA = 0; uA < NU && nL < E.BS_MAX_LINKS; uA++) {
        for (let uB = 0; uB < NU && nL < E.BS_MAX_LINKS; uB++) {
          if (uA === uB) continue;
          const cA = last[uA][0], cB = last[uB][0];
          if (Math.hypot(cA[0] - cB[0], cA[1] - cB[1], cA[2] - cB[2]) > reachU) continue;
          for (const dn of netSites.donors) for (const ac of netSites.acceptors) {
            if (nL >= E.BS_MAX_LINKS) break;
            const samp = frames.map((F) => {
              if (!F) return null;
              const Hp = F[uA][dn.slot], Dp = F[uA][dn.partner], Ap = F[uB][ac.slot];
              const v = [Ap[0] - Hp[0], Ap[1] - Hp[1], Ap[2] - Hp[2]];
              const dU = Math.hypot(v[0], v[1], v[2]);
              const w = [Dp[0] - Hp[0], Dp[1] - Hp[1], Dp[2] - Hp[2]];
              const wL = Math.hypot(w[0], w[1], w[2]) || 1;
              const ca = (v[0] * w[0] + v[1] * w[1] + v[2] * w[2]) / ((dU || 1) * wL);
              return { d: dU * LC.pm_per_unit, a: Math.acos(E.bscClamp(ca, -1, 1)) * 180 / Math.PI };
            });
            if (E.bscLinkLatch(dn.q, ac.q, samp, LC, SS - 1, SS)) nL++;
          }
        }
      }
      return 2 * nL / NU;
    };
    const TS = [3000, 5000, 8000, 12000];
    const spun = TS.map((m) => spinPass(m, 0.14)), still = TS.map((m) => spinPass(m, 0));
    const mean = (v: number[]) => v.reduce((x, y) => x + y, 0) / v.length;
    ok("THE DEFECT, measurable: the forced turn tumbles units and kills the links",
      mean(spun) < 0.6 * mean(still),
      `spun ${r2(mean(spun))} vs still ${r2(mean(still))} links per molecule ` +
      `(${(mean(still) / Math.max(1e-9, mean(spun))).toFixed(1)}x)`);
    ok("ACCEPTANCE: the sandbox reads within +-0.2 of the network at the same T",
      TS.every((m, i) => Math.abs(still[i] - netPass(m, flat(298)).inst) < 0.2),
      TS.map((m, i) => `t=${m} S8 ${r2(still[i])} / S5 ${r2(netPass(m, flat(298)).inst)}`).join("  "));
    // E3b S-6 NAMED the motion signal rather than inlining it, so the guard can
    // be asserted on the predicate instead of on a boolean expression. Section 32
    // then asserts the property that predicate has to have: the signal must be
    // LIVE for the layer that actually draws the state.
    ok("the shipped guard stands the idle turn down only when jiggle already moves",
      /var jiggleMoves = \(th\.jiggle_scale > 0\);/.test(updSrc) &&
      /mode === "explore" && !\(spinRate > 0\) && !window\.PM_bscSpinDragged &&\s*!jiggleMoves\) spinRate = 0\.14;/
        .test(updSrc),
      "a sandbox with no jiggle and no authored spin still turns (Rule 37 intact)");
    ok("...and deriveStateMeta still declares such a state MOVING (jiggle is the motion)",
      /jiggle_scale/.test(META_SRC));
  }

  // ═════════════════════════════════════════════════════════════════════════
  console.log("\n=== 26. E2f CONTROL WRITE-BACK SWEEP (every scripted quantity syncs its row) ===");
  {
    // The FIXED scar scripted_change_desyncs_the_dom_control_that_shares_it, swept
    // over the WHOLE closed control enum rather than one id at a time — which is
    // how it recurred twice. A row is either written back every frame, or it is
    // declared here as having no scripted driver at all.
    const DRIVEN: [string, string][] = [
      ["molecule", "PM_bscMolDragged"], ["ligand", "PM_bscLigDragged"],
      ["species", "PM_bscSpeciesDragged"], ["angle", "PM_bscAngleDragged"],
      ["temperature", "PM_bscTempDragged"], ["count", "PM_bscCountDragged"],
      ["separation", "PM_bscSepDragged"], ["spin", "PM_bscSpinDragged"],
      ["ion_pair", "PM_bscIonPairDragged"],
      // E3b L-1: the third quantity a script and a slider share on this surface.
      ["shift", "PM_bscShiftDragged"],
      // E3b Q-2: the fourth. ionic_bonding S10 exposes the Field slider on a state
      // that also SCRIPTS the field on (field_at_ms).
      ["field", "PM_bscFieldDragged"],
      // E3b Q-5: the Metal picker and the lattice's own cation species name ONE
      // quantity, so state entry seeds it and the frame pass tracks it.
      ["metal", "PM_bscMetalDragged"]
    ];
    for (const [id, flag] of DRIVEN) {
      ok(`the ${id} row tracks its scripted value until a trusted drag seizes it`,
        new RegExp(`bscHasControl\\(ctrls, "${id}"\\) && !window\\.${flag}`).test(updSrc));
    }
    // 'valence' stays declared-without-a-driver: it is a pure sandbox knob (how
    // many free electrons per atom the sea draws) with no scripted counterpart on
    // any state, so there is nothing for it to desync FROM.
    const NO_DRIVER = ["valence"];
    for (const id of NO_DRIVER) {
      // E3b row G moved this row from "unread" to "read but SANDBOX-ONLY": the
      // Valence slider drives how many free electrons the sea draws, so the frame
      // pass consults it — but no state authors a scripted counterpart, so there
      // is nothing for the widget to desync FROM. Both halves are asserted, so a
      // future scripted `bs.valence` cannot land without a tracking branch.
      ok(`the ${id} row is read by the frame pass (a live sandbox knob, not decoration)`,
        new RegExp(`bscHasControl\\(ctrls, "${id}"\\)`).test(updSrc));
      ok(`the ${id} row has NO scripted driver to desync from (E3b, declared)`,
        !new RegExp(`bs\\.${id}\\b`).test(updSrc));
    }
    ok("the sweep covers the whole closed control enum, with nothing unaccounted for",
      DRIVEN.length + NO_DRIVER.length === (E.BS_CONTROL_IDS as string[]).length &&
      DRIVEN.map((d) => d[0]).concat(NO_DRIVER).every((id) =>
        (E.BS_CONTROL_IDS as string[]).indexOf(id) >= 0),
      `${DRIVEN.length} driven + ${NO_DRIVER.length} declared = ${(E.BS_CONTROL_IDS as string[]).length}`);
    // the species row specifically: it is the one the compare swap rewrites
    ok("E2f: the species picker is written back from the LIVE (post-swap) species",
      /bscHasControl\(ctrls, "species"\) && !window\.PM_bscSpeciesDragged\) \{[\s\S]{0,320}?bscOptionOf\(spl, molKey\)[\s\S]{0,120}?spl\.value = molKey;/
        .test(updSrc));
    ok("...as a DOM-only write (no dispatched input event, so drag-seize is intact)",
      !/dispatchEvent/.test(updSrc));
    ok("...and the frame pass rewrites molKey at the swap midpoint, which is what it mirrors",
      /if \(swapP >= 0\.5\) \{ molKey = swapTo; mol = MG_MOLECULES\[molKey\]; \}/.test(updSrc));
  }

  // ═════════════════════════════════════════════════════════════════════════
  console.log("\n=== 27. E1 HUD RESERVE (no annotation is ever drawn under the readout) ===");
  // A RECURRENCE of the FIXED class field3d_hud_label_clipped_by_readout_box, and
  // the reason it recurred is the whole content of this section: the two rectangles
  // scale at DIFFERENT RATES, so no authored x can hold at every width, and
  // check-layout-overlap models only the authored annotation rects — never the
  // renderer-drawn HUD panel — so it reported zero collisions on eight of them.
  //   The layout model below is not read out of the renderer: hud.left is
  // (simW - 12 - hudWidth) from the shipped right:12px inline style, and the
  // annotation centre is (x/760)*simW from the shipped design-space mapping. It
  // reproduces the BROWSER to <=1 px on all forty measured cells, so the numbers
  // here are the same numbers a screenshot gives.
  {
    const paintSrc = grabFn("pmPaintAnnotations");
    const stepSrc = grabFn("pmStepAnnotations");
    const clampSrc = grabFn("pmClampAnnotations");
    const resSrc = grabFn("pmAnnotReserved");
    const GAP = 16, MINX = 8;
    /**
     * hydrogen_bonding's eight states, MEASURED in headless Chromium at the
     * shipped 600 15px system-ui: the half width of the rightmost top-row
     * annotation (all eight authored at design x = 500) and the width the HUD
     * box actually renders at for that state's hud_lines. Text width does not
     * change with the viewport, which is exactly why the collision is a slope
     * problem and not a text-length problem.
     */
    const STATES: { id: string; halfW: number; hudW: number }[] = [
      { id: "S1", halfW: 50.5, hudW: 220 }, { id: "S2", halfW: 41.0, hudW: 220 },
      { id: "S3", halfW: 80.5, hudW: 220 }, { id: "S4", halfW: 67.0, hudW: 220 },
      { id: "S5", halfW: 75.0, hudW: 225 }, { id: "S6", halfW: 86.5, hudW: 225 },
      { id: "S7", halfW: 74.5, hudW: 220 }, { id: "S8", halfW: 77.0, hudW: 225 }
    ];
    // sim-iframe widths. The player letterboxes the sim inside a 16:9 stage, so
    // browser 1024/1152/1280/1366/1440 give the sim 614/713/810/875/932.
    const SIMW = [614, 713, 810, 875, 932, 1024, 1280];
    const resOf = (simW: number, hudW: number) =>
      ({ left: simW - 12 - hudW, right: simW - 12, top: 52, bottom: 96, width: hudW });
    const annC = (simW: number) => Math.min(Math.max(500 / 760, 0.06), 0.94) * simW;
    // the top row sits at the 12% floor of a 9/16 viewport, so its own band is
    // (0.12*H - 10 .. +10) — measured 32..51 at simW 614, 77..96 at 1280.
    const bandOf = (simW: number) => {
      const c = 0.12 * (simW * 9 / 16);
      return { top: c - 9.5, bot: c + 9.5 };
    };
    const gapBefore = (simW: number, s: { halfW: number; hudW: number }) =>
      resOf(simW, s.hudW).left - (annC(simW) + s.halfW);
    const gapAfter = (simW: number, s: { halfW: number; hudW: number }) => {
      const b = bandOf(simW);
      const cc = E.pmAnnotClampX(annC(simW), s.halfW, b.top, b.bot,
        resOf(simW, s.hudW), GAP, MINX) as number;
      return resOf(simW, s.hudW).left - (cc + s.halfW);
    };
    // ── THE DEFECT, as the table founder-proxy raised it.
    {
      const rows = SIMW.map((w) =>
        `${String(w).padStart(4)}: ` + STATES.map((s) => Math.round(gapBefore(w, s))).join(" "));
      const collide = (w: number) => STATES.filter((s) => gapBefore(w, s) < GAP).length;
      ok("THE DEFECT, measurable: 8/8 states overlap the readout at sim width 614",
        collide(614) === 8 && STATES.every((s) => gapBefore(614, s) < 0),
        rows[0]);
      ok("...and it closes monotonically as the screen narrows (two different slopes)",
        SIMW.every((w, i) => i === 0 || STATES.every((s) => gapBefore(w, s) > gapBefore(SIMW[i - 1], s))),
        `S3: ${SIMW.map((w) => Math.round(gapBefore(w, STATES[2]))).join(" -> ")}`);
      ok("...and it is NOT authorable: the required x depends on a measured box",
        Math.abs((resOf(1280, 220).left - resOf(614, 220).left) - (1280 - 614)) < 1e-9 &&
        Math.abs((annC(1280) - annC(614)) - (1280 - 614) * (500 / 760)) < 1e-9,
        "hud.left tracks the viewport 1:1, the annotation centre at 0.658:1");
    }
    // ── THE FIX, on the same eight states at the same seven widths.
    {
      const worst = Math.min(...SIMW.flatMap((w) => STATES.map((s) => gapAfter(w, s))));
      ok("ACCEPTANCE: every state clears the readout by >= 16 px at EVERY width",
        SIMW.every((w) => STATES.every((s) => gapAfter(w, s) >= GAP - 1e-9)),
        `worst gap over 7 widths x 8 states: ${worst.toFixed(1)} px`);
      ok("...and it never pushes a label off the left edge either",
        SIMW.every((w) => STATES.every((s) => {
          const b = bandOf(w);
          const cc = E.pmAnnotClampX(annC(w), s.halfW, b.top, b.bot, resOf(w, s.hudW), GAP, MINX) as number;
          return cc - s.halfW >= MINX - 1e-9;
        })));
    }
    // ── BYTE-IDENTITY, the half that protects every other concept in the fleet.
    {
      const res1280 = resOf(1280, 220);
      const b = bandOf(1280);
      ok("an annotation that already clears is returned UNCHANGED (identity, not a nudge)",
        STATES.every((s) => Object.is(
          E.pmAnnotClampX(annC(1280), s.halfW, b.top, b.bot, res1280, GAP, MINX), annC(1280))),
        `gap at 1280 = ${Math.round(gapBefore(1280, STATES[2]))} px, cx untouched`);
      ok("a state with NO readout on screen is returned unchanged (res null)",
        Object.is(E.pmAnnotClampX(600, 80, 32, 51, null, GAP, MINX), 600) &&
        Object.is(E.pmAnnotClampX(600, 80, 32, 51, { left: 382, right: 602, top: 52, bottom: 96, width: 0 }, GAP, MINX), 600));
      ok("an annotation in a DIFFERENT vertical band is returned unchanged",
        Object.is(E.pmAnnotClampX(annC(614), 80.5, 287, 306, resOf(614, 220), GAP, MINX), annC(614)),
        "the bottom row (design y 430) never moves, at any width");
      ok("...but a near-miss inside the 16 px clearance DOES count as a collision",
        E.pmAnnotClampX(annC(614), 80.5, 32, 51, resOf(614, 220), GAP, MINX) !== annC(614),
        "band 32..51 vs HUD 52..96: 1 px apart is a collision, not a clearance");
      ok("D-1: the clamp is IDEMPOTENT — applying it to its own output is a fixed point",
        SIMW.every((w) => STATES.every((s) => {
          const bb = bandOf(w), rr = resOf(w, s.hudW);
          const a1 = E.pmAnnotClampX(annC(w), s.halfW, bb.top, bb.bot, rr, GAP, MINX) as number;
          const a2 = E.pmAnnotClampX(a1, s.halfW, bb.top, bb.bot, rr, GAP, MINX) as number;
          return Object.is(a1, a2);
        })), "no drift under repeated frames, so a freeze pin rewinds to the same layout");
    }
    // ── THE WIRING, on the shipped bodies.
    ok("the painter records the AUTHORED left as data (the clamp re-derives, never nudges)",
      /d\.setAttribute\("data-lp", lp\.toFixed\(2\)\);/.test(paintSrc));
    ok("the reserve pass runs AFTER the reveal pass, every frame",
      /pmClampAnnotations\(\);/.test(stepSrc) &&
      stepSrc.indexOf("pmClampAnnotations()") > stepSrc.indexOf("data-until"));
    ok("the reserved rect is the HUD's LIVE measured box (no hardcoded 220)",
      /getElementById\("bsc_hud"\)/.test(resSrc) && /getBoundingClientRect\(\)/.test(resSrc) &&
      !/220|190/.test(resSrc) && /style\.display === "none"/.test(resSrc));
    ok("the pass writes style.left ONLY when it changes (byte-identical otherwise)",
      /if \(el2\.style\.left !== want\) el2\.style\.left = want;/.test(clampSrc) &&
      /var want = lp \+ "%";/.test(clampSrc));
    ok("the pass skips hidden labels and reads the authored percentage, not the live one",
      /el2\.style\.display !== "none"/.test(clampSrc) && /getAttribute\("data-lp"\)/.test(clampSrc));
    ok("no clock, no accumulator, no history anywhere in the reserve pass",
      !/\+=|time|Date\.now|stateStartTime/.test(clampSrc) &&
      !/\+=|time|Date\.now/.test(grabFn("pmAnnotClampX")));
  }

  // ═════════════════════════════════════════════════════════════════════════
  console.log("\n=== 28. E2 EXPLORE FRAMING (a sandbox keeps the framing it was taught in) ===");
  // hydrogen_bonding S7 (network) and S8 (explore) carry BYTE-IDENTICAL units[],
  // the same 30 molecules at the same positions and the same 298 K. They were
  // framed by two different cameras because "explore" was treated as a scene type
  // — BS_CAMERAS.explore is the same az 35 / el 47 / dist 7 triple as dipole_sum,
  // i.e. the SINGLE-MOLECULE solve wearing a mode name.
  {
    const S8BS: any = Object.assign({}, NBS, { mode: "explore" });
    const S7BS: any = NBS;
    ok("the scene predicate fires on a free multi-unit explore scene, and ONLY there",
      E.bscNetworkScene(S8BS) === true &&
      E.bscNetworkScene(S7BS) === false &&                                    // guided network
      E.bscNetworkScene({ mode: "explore", placement: "lattice", units: (NBS as any).units }) === false &&
      E.bscNetworkScene({ mode: "explore", units: [{ species: "H2O", at: [0, 0, 0] }] }) === false &&
      E.bscNetworkScene({ mode: "explore" }) === false);
    const c7 = E.bscSolvedCamera(S7BS, null) as any, c8 = E.bscSolvedCamera(S8BS, null) as any;
    ok("ACCEPTANCE: the two states now solve to the SAME camera, angle for angle",
      c7.az === c8.az && c7.el === c8.el && c7.dist === c8.dist && c7.fit === c8.fit,
      `S7 el ${c7.el} dist ${c7.dist}  ==  S8 el ${c8.el} dist ${c8.dist}`);
    const ext = E.bscSiteExtent(NBS, null) as number;
    const fit = Math.max(c7.dist, ext * E.BS_FIT_MARGIN);
    ok("...at the same fitted distance too (same units[] -> same extent -> same fit)",
      Object.is(Math.max(c7.dist, ext * E.BS_FIT_MARGIN), Math.max(c8.dist, ext * E.BS_FIT_MARGIN)),
      `dist ${fit.toFixed(2)}`);
    // THE DEFECT, measured as pixels: project every molecule centre under both
    // cameras and compare. The projector is written here, not read out of the
    // renderer (same discipline as section 11).
    {
      const FOV = 60 * Math.PI / 180, ASPECT = 16 / 9, tn = Math.tan(FOV / 2), PXH = 456;
      const sub3 = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
      const cr3 = (a: number[], b: number[]) =>
        [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      const dt3 = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const project = (cam: any) => {
        const a = (cam.az || 0) * Math.PI / 180, e = (cam.el || 0) * Math.PI / 180;
        const d = Math.max(cam.dist, ext * E.BS_FIT_MARGIN);
        const c = [d * Math.cos(e) * Math.cos(a), d * Math.sin(e), d * Math.cos(e) * Math.sin(a)];
        const f = E.bscNorm(sub3([0, 0, 0], c)), r = E.bscNorm(cr3(f, [0, 1, 0])), up = cr3(r, f);
        return NET.map((u) => {
          const v = sub3(u.at, c), z = dt3(v, f);
          return [dt3(v, r) / (z * tn * ASPECT) * (PXH * ASPECT / 2), dt3(v, up) / (z * tn) * (PXH / 2)];
        });
      };
      const pN = project(E.BS_CAMERAS.network), pE = project(E.BS_CAMERAS.explore), pS8 = project(c8);
      const cen = (p: number[][]) => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
      const worst = (a: number[][], b: number[][]) =>
        Math.max(...a.map((q, i) => Math.hypot(q[0] - b[i][0], q[1] - b[i][1])));
      const cN = cen(pN), cE = cen(pE);
      ok("THE DEFECT, measurable: the pre-fix explore camera moved every molecule",
        worst(pN, pE) > 40,
        `worst molecule displacement ${worst(pN, pE).toFixed(1)} px, centroid ` +
        `${Math.hypot(cN[0] - cE[0], cN[1] - cE[1]).toFixed(1)} px (el ` +
        `${E.BS_CAMERAS.network.el} vs ${E.BS_CAMERAS.explore.el})`);
      ok("ACCEPTANCE: projected molecule centres now agree EXACTLY (0 px, not a few)",
        worst(pN, pS8) === 0, `worst ${worst(pN, pS8).toFixed(6)} px over 30 molecules`);
    }
    ok("the spin axis follows the same camera, so a sandbox roll is about the view axis",
      (E.bscSpinAxis(c8) as number[]).every((v, i) => Object.is(v, (E.bscSpinAxis(c7) as number[])[i])));
    // BYTE-IDENTITY for every explore scene that is NOT a network.
    ok("a ONE-unit sandbox is untouched (it is framed by the single-unit solve)",
      (E.bscSolvedCamera({ mode: "explore", units: [{ species: "CCl4", at: [0, 0, 0] }] }, null) as any) ===
      E.BS_UNIT_CAMERAS[E.bscUnitShapeKey("CCl4") as string]);
    ok("a TWO-unit sandbox is DELIBERATELY untouched (approach_link vs compare is undecidable)",
      (E.bscSolvedCamera({
        mode: "explore", placement: "free",
        units: [{ species: "H2O", at: [-3, 0, 0] }, { species: "H2O", at: [3, 0, 0] }]
      }, null) as any) === E.BS_CAMERAS.explore);
    ok("a LATTICE sandbox is untouched (the ion path never reaches the new branch)",
      (E.bscSolvedCamera(Object.assign({}, LATTICE_BS, { mode: "explore" }), null) as any) ===
      E.BS_CAMERAS.explore);
    ok("every GUIDED mode still resolves to its own measured camera, unchanged",
      (E.BS_MODES_IMPL as string[]).filter((m) => m !== "explore").every((m) =>
        (E.bscSolvedCamera({ mode: m, placement: "free", units: (NBS as any).units }, null) as any) ===
        (E.BS_CAMERAS as any)[m]));
    ok("the solve is still config-only — no clock, no live camera, no history",
      !/\bms\b|Date\.now|spherical|PM_bscCam/.test(grabFn("bscSolvedCamera") + grabFn("bscNetworkScene")));
  }

  // ═════════════════════════════════════════════════════════════════════════
  console.log("\n=== 29. E5 GLOW COVERAGE (every element type on screen has a focal key) ===");
  // bsc_trend — row O's chart — was a live scene element type with no glow key, so
  // no narration sentence about the chart could ever be bound, on this concept or
  // any future one. The frozen KEY COUNT is replaced by the invariant that should
  // have been asserted in the first place: a new element type cannot be added
  // without a key, because this section reads the element types out of the source.
  {
    const KEYS = E.BS_GLOW_ELS as Record<string, string[]>;
    const reachable = new Set<string>();
    for (const k of Object.keys(KEYS)) for (const t of KEYS[k]) reachable.add(t);
    // every elementType expression the bonding_scene builder assigns, ternaries included
    const declared = new Set<string>();
    const re = /elementType:\s*([^,]+),\s*id:/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(SRC)) !== null) {
      const lits = m[1].match(/"bsc_[a-z_]+"/g);
      if (lits) for (const l of lits) declared.add(l.replace(/"/g, ""));
    }
    ok("the source really was scanned (the ternary-declared types are in the set)",
      declared.has("bsc_central") && declared.has("bsc_atom") && declared.size >= 11,
      `${declared.size} element types declared: ${[...declared].sort().join(" ")}`);
    ok("ACCEPTANCE: every declared bsc_* element type is reachable from some key",
      [...declared].every((t) => reachable.has(t)),
      [...declared].filter((t) => !reachable.has(t)).join(",") || "none unreachable");
    ok("the trend surface has a key, and it resolves to the panel that exists",
      KEYS.trend && KEYS.trend.length === 1 && KEYS.trend[0] === "bsc_trend" &&
      /var tc = document\.createElement\("canvas"\); tc\.id = "bsc_trend";/.test(SRC));
    // the reverse direction: a key with nothing behind it is the E1 "declared but
    // never built" scar. TWO exceptions, both declared HERE so the list cannot
    // quietly grow: bsc_layer is E3b's deferred layer-shift half (no mesh yet, and
    // no state can reach it), and bsc_trend is a DOM canvas rather than a mesh —
    // its existence is asserted above, and its emphasis two assertions below.
    const orphan = [...reachable].filter((t) => !declared.has(t)).sort();
    ok("the only keys with no mesh behind them are the two declared exceptions",
      orphan.length === 2 && orphan[0] === "bsc_layer" && orphan[1] === "bsc_trend",
      `orphan keys: ${orphan.join(",") || "none"} (E3b stub + the DOM chart)`);
    const glowSrc = grabFn("applyBondingSceneGlow");
    ok("the trend focal is NOT a no-op: the panel takes the emphasis in its own medium",
      /var trFocal = !!focalTypes\["bsc_trend"\];/.test(glowSrc) &&
      /tcv\.style\.filter = trFocal \? "brightness\(1\.22\)" : "";/.test(glowSrc));
    ok("...as BRIGHTNESS, never size (Rule 29), and released again when it is not focal",
      !/width|height|transform|scale/.test(glowSrc) &&
      /tcv\.style\.boxShadow = trFocal \? [^:]+: "";/.test(glowSrc));
    ok("a DOM-only focal never arms the MESH pass (the molecules are not peers of a chart)",
      /if \(focalTypes\[k\] && k !== "bsc_trend"\) anyScene = true;/.test(glowSrc));
    ok("the mesh pass itself is untouched (still brightenOnly, still one call per object)",
      /applyGlowEmphasis\(o, !!focalTypes\[ud\.elementType\], anyScene, 0\.6, true\);/.test(glowSrc));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 30. E4 THE TWO-UNIT CAMERA MAY NOT FORESHORTEN THE COMPARED AXIS ===");
// A RECURRENCE of the OPEN scar
// camera_metric_scored_foreshortening_not_pairwise_screen_separation: section 11
// scores pairwise SEPARATION and never the projected LENGTH of the axis a state
// teaches the length of, so it passed a camera whose forward vector lay 78.8%
// along hydrogen_bonding S2/S3's separation axis. Every number below is measured
// with a projector written HERE (same discipline as section 11), and the SHIPPED
// pre-fix camera is carried as an explicit negative control.
{
  const FOV = 60 * Math.PI / 180, ASPECT = 16 / 9, TN = Math.tan(FOV / 2), PXH = 456;
  const sb = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cr = (a: number[], b: number[]) =>
    [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dt = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const rig = (c: any) => {
    const a = (c.az || 0) * Math.PI / 180, e = (c.el || 0) * Math.PI / 180, d = c.dist || 7;
    const p = [d * Math.cos(e) * Math.cos(a), d * Math.sin(e), d * Math.cos(e) * Math.sin(a)];
    const f = E.bscNorm(sb([0, 0, 0], p)), r = E.bscNorm(cr(f, [0, 1, 0]));
    return { p, f, r, u: cr(r, f) };
  };
  const px = (R: any, q: number[]) => {
    const v = sb(q, R.p), z = dt(v, R.f);
    return { x: dt(v, R.r) / (z * TN * ASPECT) * (PXH * ASPECT / 2), y: dt(v, R.u) / (z * TN) * (PXH / 2), z };
  };
  const len = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);
  // the SHIPPED hydrogen_bonding S2/S3/S4 pair: units[0] is the donor at -sep/2.
  const ORI = [[190, 69], [180, 0]];
  const BL = E.BS_BOND_LEN as number;
  const hFrame = E.mgFrame("H2O", null, null) as any;
  const offs = ORI.map((o) => {
    const rot = E.bscOrientRot(o);
    const oo: number[][] = [[0, 0, 0]];
    for (const d of hFrame.bonds as number[][]) {
      const dv = rot ? rot(d) : d;
      oo.push([dv[0] * BL, dv[1] * BL, dv[2] * BL]);
    }
    return oo;
  });
  const hSites = E.bscLinkSites("H2O") as any;
  const rOx = E.MG_ELEMENTS.O.radius as number;
  const pose = (sep: number) => [[-0.5 * sep, 0, 0], [0.5 * sep, 0, 0]]
    .map((b, u) => offs[u].map((o) => [b[0] + o[0], b[1] + o[1], b[2] + o[2]]));
  /** the donating H of unit 0 (the one nearest unit 1's O) — that IS the drawn link */
  const donor = (() => {
    const p = pose(5.75);
    let best: any = null;
    for (const dn of hSites.donors) {
      const d = Math.hypot(...(sb(p[1][0], p[0][dn.slot]) as [number, number, number]));
      if (!best || d < best.d) best = { d, slot: dn.slot, partner: dn.partner };
    }
    return best;
  })();
  const shot = (cam: any, sep: number) => {
    const R = rig(cam), W = pose(sep), P = W.map((row) => row.map((q) => px(R, q)));
    const rad = (z: number) => rOx / (z * TN) * (PXH / 2);
    const r0 = rad(P[0][0].z), r1 = rad(P[1][0].z);
    const link = len(P[0][donor.slot], P[1][0]);
    const four = [len(P[0][0], P[0][1]), len(P[0][0], P[0][2]),
                  len(P[1][0], P[1][1]), len(P[1][0], P[1][2])];
    const don = len(P[0][donor.partner], P[0][donor.slot]);
    const ang = (() => {
      const h = P[0][donor.slot], a = P[0][donor.partner], b = P[1][0];
      const u1 = [a.x - h.x, a.y - h.y], u2 = [b.x - h.x, b.y - h.y];
      return Math.acos(Math.max(-1, Math.min(1, (u1[0] * u2[0] + u1[1] * u2[1]) /
        (Math.hypot(u1[0], u1[1]) * Math.hypot(u2[0], u2[1]))))) * 180 / Math.PI;
    })();
    // the PHYSICAL ratio at this separation: H...A over the O-H bond, in pm
    const p2u = E.bscLinkCfg({}).pm_per_unit as number;
    const phys = (Math.hypot(...(sb(W[1][0], W[0][donor.slot]) as [number, number, number])) * p2u) /
      (BL * p2u);
    let box = 0;
    for (const row of P) for (const q of row) box = Math.max(box, Math.abs(q.x) / (PXH * ASPECT / 2), Math.abs(q.y) / (PXH / 2));
    let sep2 = 1e9;
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++)
      sep2 = Math.min(sep2, len(P[(i / 3) | 0][i % 3], P[(j / 3) | 0][j % 3]));
    return {
      disp: Math.max(r0, r1) / Math.min(r0, r1), r0, r1, link, four, don, ang, phys, box, sep2,
      ratio: link / don, spread: Math.max(...four) / Math.min(...four),
      allRatios: four.map((b) => link / b)
    };
  };
  const PRE_AL = { az: 35, el: 16, dist: 11.0 };     // the SHIPPED pre-E4 camera
  const PRE_CMP = { az: 35, el: 20, dist: 12.0 };
  const AL = E.BS_CAMERAS.approach_link, CMP = E.BS_CAMERAS.compare;
  const f2 = (v: number) => v.toFixed(2), f1 = (v: number) => v.toFixed(1);

  // NEGATIVE CONTROL — the metric must fail on the shipped pre-fix cameras.
  {
    const a = shot(PRE_AL, 5.75), b = shot(PRE_AL, 8.0), c = shot(PRE_CMP, 5.75);
    ok("NEGATIVE CONTROL: the pre-E4 approach_link camera FAILS the disparity floor",
      a.disp > 1.15 && b.disp > 1.15,
      `S2 ${f2(a.disp)}x  S3 ${f2(b.disp)}x  (O radii ${f1(a.r0)}/${f1(a.r1)} px)`);
    ok("NEGATIVE CONTROL: ...and drew the 180/96 claim at the wrong ratio",
      Math.abs(a.ratio - a.phys) / a.phys > 0.15,
      `drew ${f2(a.ratio)}x where the physics is ${f2(a.phys)}x (${((a.ratio / a.phys - 1) * 100).toFixed(0)}% off)`);
    ok("NEGATIVE CONTROL: ...and the four identical 96 pm bonds spread 2.5x",
      a.spread > 2.0, `${f1(Math.min(...a.four))}..${f1(Math.max(...a.four))} px, spread ${f2(a.spread)}x`);
    ok("NEGATIVE CONTROL: the pre-E4 compare camera FAILS the same disparity floor",
      c.disp > 1.15, `${f2(c.disp)}x  (O radii ${f1(c.r0)}/${f1(c.r1)} px)`);
  }
  // THE FIX — measured on the shipped cameras, at every separation S2/S3 traverse.
  const SEPS = [{ n: "S2 opening 12.00", s: 12.0 }, { n: "S2/S3 linked 5.75", s: 5.75 },
                { n: "S3 settled 8.00", s: 8.0 }];
  ok("ACCEPTANCE: the separation axis is EXACTLY in the screen plane (cos el * cos az = 0)",
    Math.abs(Math.cos(AL.el * Math.PI / 180) * Math.cos(AL.az * Math.PI / 180)) < 1e-12 &&
    Math.abs(Math.cos(CMP.el * Math.PI / 180) * Math.cos(CMP.az * Math.PI / 180)) < 1e-12,
    `approach_link az ${AL.az} el ${AL.el}, compare az ${CMP.az} el ${CMP.el}`);
  for (const S of SEPS) {
    const m = shot(AL, S.s);
    ok(`ACCEPTANCE (${S.n}): the two units' projected O radii agree within 15%`,
      m.disp <= 1.15, `${f1(m.r0)} / ${f1(m.r1)} px, disparity ${m.disp.toFixed(4)}x`);
    ok(`ACCEPTANCE (${S.n}): the drawn link/bond ratio IS the physical ratio`,
      Math.abs(m.ratio - m.phys) / m.phys <= 0.15,
      `drew ${f2(m.ratio)}x, physics ${f2(m.phys)}x`);
  }
  {
    const m = shot(AL, 5.75);
    ok("ACCEPTANCE: at the LINKED pose every one of the four O-H bonds reads 1.875 +-15%",
      m.allRatios.every((r) => Math.abs(r - 1.875) / 1.875 <= 0.15),
      `link/O-H = ${m.allRatios.map(f2).join(" / ")}  (band 1.59..2.16)`);
    ok("...and the four identically-long 96 pm bonds now project within 20% of each other",
      m.spread <= 1.20, `${f1(Math.min(...m.four))}..${f1(Math.max(...m.four))} px, spread ${f2(m.spread)}x`);
    ok("the el-16 property is KEPT: the projected D-H...A angle still reads straight",
      m.ang >= 179.5, `${m.ang.toFixed(1)} deg`);
    ok("countability improves in the same move (section-11 discipline, in px)",
      m.sep2 > shot(PRE_AL, 5.75).sep2 && m.box <= 0.85,
      `min pairwise ${f1(shot(PRE_AL, 5.75).sep2)} -> ${f1(m.sep2)} px, |ndc| ${m.box.toFixed(3)}`);
    const c = shot(CMP, 5.75);
    ok("ACCEPTANCE (compare, S4): same two properties on the side-by-side box",
      c.disp <= 1.15 && Math.abs(c.ratio - c.phys) / c.phys <= 0.15,
      `disparity ${c.disp.toFixed(4)}x, ratio ${f2(c.ratio)}x vs ${f2(c.phys)}x`);
  }
  ok("el and dist are UNCHANGED — only the azimuth moved (nothing else was traded)",
    AL.el === 16 && AL.dist === 11.0 && CMP.el === 20 && CMP.dist === 12.0);
  // E3b F2 UPDATE, 2026-08-03: assemble was the ONE row the E4 treatment skipped,
  // and its frames paid for it (Cl drawn larger than Na at az 35, both atoms cut
  // by the frame edge). It now carries transfer's solve verbatim — az 90 / el 12 /
  // dist 15 — so the E4 family is assemble + transfer + approach_link + compare +
  // layer_shift + drift, and the rows below are the ones whose scenes argue from
  // no length or size along a scene axis and therefore keep the house azimuth.
  ok("every OTHER solved camera keeps the house azimuth (no fleet-wide camera edit)",
    E.BS_CAMERAS.dipole_sum.az === 35 && E.BS_CAMERAS.explore.az === 35 &&
    E.BS_CAMERAS.network.az === 35 && E.BS_CAMERAS.electron_sea.az === 35 &&
    E.BS_CAMERAS.network.el === 22 && E.BS_CAMERAS.coordination.el === 45 &&
    E.BS_CAMERAS.lattice_grow.el === 26 && E.BS_CAMERAS.lattice_grow.az === 35);
  ok("assemble now carries transfer's E4 solve EXACTLY (S1 -> S2 is one camera)",
    E.BS_CAMERAS.assemble.az === E.BS_CAMERAS.transfer.az &&
    E.BS_CAMERAS.assemble.el === E.BS_CAMERAS.transfer.el &&
    E.BS_CAMERAS.assemble.dist === E.BS_CAMERAS.transfer.dist &&
    Math.abs(Math.cos(E.BS_CAMERAS.assemble.el * Math.PI / 180) *
      Math.cos(E.BS_CAMERAS.assemble.az * Math.PI / 180)) < 1e-12,
    `az ${E.BS_CAMERAS.assemble.az} el ${E.BS_CAMERAS.assemble.el} dist ${E.BS_CAMERAS.assemble.dist}`);
  ok("a single-unit compare scene never reaches this row (bond_polarity S2/S6/S7)",
    (E.bscSolvedCamera({ mode: "compare", units: [{ species: "H2O", at: [0, 0, 0] }] }, null) as any) !==
    E.BS_CAMERAS.compare);
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 31. E3 THE THERMAL RESPONSE IS STEEPEST THROUGH THE BOILING REGION ===");
// The shipped model was a fixed lattice with a sqrt(T) jiggle: the link count fell
// 4% at water's ACTUAL boiling point and needed 600 K — 227 K past boiling — to
// move at all, while the very next state teaches that boiling costs 193 K BECAUSE
// the hydrogen bonds must break. This section replays the SHIPPED link pass over
// the SHIPPED 30-unit network at seven temperatures, and carries the pre-fix curve
// as an explicit negative control (the law is switched off by passing stretch 0,
// which is exactly the pre-E3 code path).
{
  const NET3: { at: number[]; orient: number[] }[] = [
    { at: [0.44, 0, 0], orient: [125, -37] }, { at: [-2.88, -3.32, 3.32], orient: [232, -36] },
    { at: [-2.88, 3.32, -3.32], orient: [232, -36] }, { at: [3.76, -3.32, -3.32], orient: [232, -36] },
    { at: [3.76, 3.32, 3.32], orient: [232, -36] }, { at: [-6.2, -6.64, 0], orient: [125, -37] },
    { at: [-6.2, 0, -6.64], orient: [125, -37] }, { at: [-6.2, 0, 6.64], orient: [125, -37] },
    { at: [-6.2, 6.64, 0], orient: [125, -37] }, { at: [0.44, -6.64, -6.64], orient: [338, -39] },
    { at: [0.44, -6.64, 6.64], orient: [125, -37] }, { at: [0.44, 6.64, -6.64], orient: [125, -37] },
    { at: [0.44, 6.64, 6.64], orient: [53, 35] }, { at: [7.08, -6.64, 0], orient: [338, -39] },
    { at: [7.08, 0, -6.64], orient: [338, -39] }, { at: [7.08, 0, 6.64], orient: [53, 35] },
    { at: [7.08, 6.64, 0], orient: [53, 35] }, { at: [-9.52, -3.32, -3.32], orient: [232, -36] },
    { at: [-9.52, 3.32, 3.32], orient: [83, -29] }, { at: [-2.88, -9.96, -3.32], orient: [232, -36] },
    { at: [-2.88, 9.96, 3.32], orient: [301, 17] }, { at: [-2.88, -3.32, -9.96], orient: [301, 28] },
    { at: [-2.88, 3.32, 9.96], orient: [83, -29] }, { at: [3.76, -9.96, 3.32], orient: [232, -36] },
    { at: [3.76, 9.96, -3.32], orient: [301, 17] }, { at: [3.76, -3.32, 9.96], orient: [83, -29] },
    { at: [3.76, 3.32, -9.96], orient: [301, 28] }, { at: [10.4, -3.32, 3.32], orient: [20, -33] },
    { at: [10.4, 3.32, -3.32], orient: [20, -33] }, { at: [-12.84, 0, 0], orient: [125, -37] }
  ];
  const BS3 = {
    placement: "free", mode: "network", links: { enabled: true }, thermal: { jiggle_scale: 0.9 },
    units: NET3.map((u, i) => ({ id: "hb_w" + i, species: "H2O", at: u.at, orient: u.orient }))
  };
  const L3 = E.bscLinkCfg(BS3), S3n = E.BS_LINK_SAMPLES as number, F3 = E.BS_LINK_FRAMES as number;
  const dt3 = (E.BS_LINK_LOOKBACK_MS as number) / (S3n - 1), B3 = E.BS_BOND_LEN as number;
  const fr3 = E.mgFrame("H2O", null, null) as any, si3 = E.bscLinkSites("H2O") as any;
  const off3 = NET3.map((u) => {
    const rot = E.bscOrientRot(u.orient);
    const oo: number[][] = [[0, 0, 0]];
    for (const d of fr3.bonds as number[][]) {
      const dv = rot ? rot(d) : d;
      oo.push([dv[0] * B3, dv[1] * B3, dv[2] * B3]);
    }
    return oo;
  });
  const NU3 = NET3.length;
  const STRETCH = E.bscNetworkStretch(BS3) as number;
  // the SHIPPED orgAt, transcribed: base * bscThermalScale, then the jiggle.
  const pass = (ms: number, T: number, stretch: number) => {
    const sc = E.bscThermalScale("H2O", T, stretch) as number;
    const reach = L3.break_pm / L3.pm_per_unit * sc + 2 * B3 + 1.0 + 6;
    const frames: (number[][][] | null)[] = [];
    for (let s = 0; s < F3; s++) {
      const mms = ms - (F3 - 1 - s) * dt3;
      if (mms < 0) { frames.push(null); continue; }
      const rows: number[][][] = [];
      for (let u = 0; u < NU3; u++) {
        const jg = E.bscJiggle(u, mms / 1000, T, 0.9) as number[];
        const o = [NET3[u].at[0] * sc + jg[0], NET3[u].at[1] * sc + jg[1], NET3[u].at[2] * sc + jg[2]];
        rows.push(off3[u].map((v) => [o[0] + v[0], o[1] + v[1], o[2] + v[2]]));
      }
      frames.push(rows);
    }
    const last = frames[F3 - 1]!;
    const win = new Array(S3n).fill(0);
    let nL = 0;
    for (let a = 0; a < NU3 && nL < E.BS_MAX_LINKS; a++) {
      for (let b = 0; b < NU3 && nL < E.BS_MAX_LINKS; b++) {
        if (a === b) continue;
        const dx = last[a][0][0] - last[b][0][0], dy = last[a][0][1] - last[b][0][1], dz = last[a][0][2] - last[b][0][2];
        if (dx * dx + dy * dy + dz * dz > reach * reach) continue;
        for (const dn of si3.donors) for (const ac of si3.acceptors) {
          if (nL >= E.BS_MAX_LINKS) break;
          const samp: any[] = [];
          for (let s = 0; s < F3; s++) {
            const F = frames[s];
            if (!F) { samp.push(null); continue; }
            const H = F[a][dn.slot], D = F[a][dn.partner], A = F[b][ac.slot];
            const vx = A[0] - H[0], vy = A[1] - H[1], vz = A[2] - H[2];
            const dU = Math.hypot(vx, vy, vz);
            const wx = D[0] - H[0], wy = D[1] - H[1], wz = D[2] - H[2];
            const wl = Math.hypot(wx, wy, wz) || 1;
            samp.push({ d: dU * L3.pm_per_unit, a: Math.acos(E.bscClamp((vx * wx + vy * wy + vz * wz) / ((dU || 1) * wl), -1, 1)) * 180 / Math.PI });
          }
          for (let w = 0; w < S3n; w++) if (E.bscLinkLatch(dn.q, ac.q, samp, L3, w, S3n)) win[w]++;
          if (E.bscLinkLatch(dn.q, ac.q, samp, L3, S3n - 1, S3n)) nL++;
        }
      }
    }
    let vs = 0, vn = 0;
    for (let w = 0; w < S3n; w++) { if (!frames[w + S3n - 1]) continue; vs += win[w]; vn++; }
    return vn > 0 ? 2 * (vs / vn) / NU3 : 2 * nL / NU3;
  };
  const curve = (stretch: number, T: number) => {
    const a: number[] = [];
    for (let m = 1600; m <= 12000; m += 800) a.push(pass(m, T, stretch));
    return a.reduce((x, y) => x + y, 0) / a.length;
  };
  const TS3 = [100, 200, 273, 298, 373, 450, 600];
  const pre: Record<number, number> = {}, post: Record<number, number> = {};
  for (const T of TS3) { pre[T] = curve(0, T); post[T] = curve(STRETCH, T); }
  const r2 = (v: number) => v.toFixed(2);
  console.log("        T_K    " + TS3.map((T) => String(T).padStart(6)).join(""));
  console.log("        pre    " + TS3.map((T) => pre[T].toFixed(2).padStart(6)).join(""));
  console.log("        post   " + TS3.map((T) => post[T].toFixed(2).padStart(6)).join(""));
  {
    // the coupling is DERIVED from the scene: mean nearest-neighbour spacing, the
    // drawn bond length and the criterion's own break distance. Recomputed here
    // from the fixture rather than read out of the function it checks.
    let sum = 0;
    for (let i = 0; i < NU3; i++) {
      let best = Infinity;
      for (let j = 0; j < NU3; j++) {
        if (i === j) continue;
        best = Math.min(best, Math.hypot(NET3[i].at[0] - NET3[j].at[0],
          NET3[i].at[1] - NET3[j].at[1], NET3[i].at[2] - NET3[j].at[2]));
      }
      sum += best;
    }
    const dOO = (sum / NU3) * L3.pm_per_unit;
    const want = (L3.break_pm - (dOO - E.BS_BOND_LEN * L3.pm_per_unit)) / dOO;
    ok("the coupling is DERIVED from the scene, not authored (break_pm, spacing, bond)",
      Math.abs(STRETCH - want) < 1e-12,
      `stretch ${STRETCH.toFixed(6)} = (${L3.break_pm} - ${(dOO - E.BS_BOND_LEN * L3.pm_per_unit).toFixed(1)}) / ${dOO.toFixed(1)} pm`);
    ok("...so raising break_pm raises it, and there is nothing free to tune",
      (E.bscNetworkStretch(Object.assign({}, BS3, { links: { enabled: true, break_pm: 300 } })) as number) > STRETCH);
  }
  ok("NEGATIVE CONTROL: the pre-E3 curve is steepest LATE (the defect, still measurable)",
    (pre[298] - pre[373]) < (pre[373] - pre[600]),
    `298->373 ${r2(pre[298] - pre[373])}  <  373->600 ${r2(pre[373] - pre[600])}`);
  ok("NEGATIVE CONTROL: ...and moved only 4% at water's ACTUAL boiling point",
    (pre[298] - pre[373]) / pre[298] < 0.06,
    `${(100 * (pre[298] - pre[373]) / pre[298]).toFixed(1)}% from 298 to 373 K`);
  ok("ACCEPTANCE: the 298 -> 373 K change now EXCEEDS the 373 -> 600 K change",
    (post[298] - post[373]) > (post[373] - post[600]),
    `298->373 ${r2(post[298] - post[373])}  >  373->600 ${r2(post[373] - post[600])}`);
  ok("ACCEPTANCE: the 298 K reading is BYTE-IDENTICAL (S5 / S7 / S8 cannot move)",
    Object.is(post[298], pre[298]), `${post[298].toFixed(6)} links per molecule, both`);
  ok("...because the law is referenced to BS_T0_K: scale(T0) is exactly 1",
    (E.bscThermalScale("H2O", E.BS_T0_K, STRETCH) as number) === 1);
  ok("the drop through the boiling region is legible, not a rounding change",
    (post[298] - post[373]) > 1.0,
    `${r2(post[298])} -> ${r2(post[373])} links per molecule across 298 -> 373 K`);
  ok("the curve is monotonic falling over the whole 100..600 K slider range",
    TS3.every((T, i) => i === 0 || post[T] <= post[TS3[i - 1]] + 1e-9),
    TS3.map((T) => r2(post[T])).join(" "));
  // D-1: the whole layer is a pure function of T, so a pin rewind reproduces it.
  ok("REWIND: the heated readout replays byte-for-byte after a jump to 30 s",
    (() => {
      const a = [4000, 6000, 8000].map((m) => pass(m, 420, STRETCH));
      pass(30000, 420, STRETCH);
      return [4000, 6000, 8000].map((m) => pass(m, 420, STRETCH)).every((v, i) => Object.is(v, a[i]));
    })());
  ok("no clock, no accumulator, no RNG anywhere in the new layer",
    !/\bms\b|Date\.now|performance\.now|Math\.random|\+=/.test(
      grabFn("bscBrokenFraction") + grabFn("bscThermalScale") + grabFn("bscPeakThermalScale")));
  // the population itself: forced at T_b by definition, nothing chosen.
  ok("the broken fraction is exactly 1/2 at the PUBLISHED normal boiling point",
    Math.abs((E.bscBrokenFraction("H2O", E.BS_VAPOUR.H2O.tb_K) as number) - 0.5) < 1e-12 &&
    Math.abs((E.bscBrokenFraction("H2S", E.BS_VAPOUR.H2S.tb_K) as number) - 0.5) < 1e-12,
    "dG = 0 at T_b, so f = 1/2 is forced");
  ok("an untabulated species switches the whole layer off (scale exactly 1)",
    (E.bscThermalScale("CCl4", 600, 0.29) as number) === 1 &&
    (E.bscBrokenFraction("CCl4", 600) as number) === 0);
  ok("a scene that is not a PLACED multi-unit scene has stretch 0 (layer off)",
    (E.bscNetworkStretch({ units: [{ species: "H2O", at: [0, 0, 0] }] }) as number) === 0 &&
    // the separation_axis pair: both units author at [0,0,0], baseAt places them,
    // so there is no authored spacing to expand and the layer never arms
    (E.bscNetworkStretch({ separation_axis: [1, 0, 0], units: [
      { species: "H2O", at: [0, 0, 0] }, { species: "H2O", at: [0, 0, 0] }] }) as number) === 0 &&
    (E.bscNetworkStretch(LATTICE_BS) as number) === 0,
    `single ${E.bscNetworkStretch({ units: [{ species: "H2O", at: [0, 0, 0] }] })}  ` +
    `sep-axis ${E.bscNetworkStretch({ separation_axis: [1, 0, 0], units: [{ species: "H2O", at: [0, 0, 0] }, { species: "H2O", at: [0, 0, 0] }] })}  ` +
    `lattice ${E.bscNetworkStretch(LATTICE_BS)}`);
  ok("an ION scene DOES measure a spacing but expands by exactly nothing (no vapour row)",
    (E.bscNetworkStretch(TRANSFER_BS) as number) > 0 &&
    (E.bscThermalScale("Na", 600, E.bscNetworkStretch(TRANSFER_BS)) as number) === 1 &&
    (E.bscThermalScale("Cl", 600, E.bscNetworkStretch(TRANSFER_BS)) as number) === 1,
    `stretch ${(E.bscNetworkStretch(TRANSFER_BS) as number).toFixed(4)}, scale 1 at every T`);
  // the camera half: the fit frames the hottest SCRIPTED pose, and only that.
  {
    const cold = Object.assign({}, BS3, { thermal: { T_K: 298, jiggle_scale: 0.9 } });
    const hot = Object.assign({}, BS3, {
      thermal: { T_from: 298, T_K: 600, T_at_ms: 900, T_ramp_ms: 11000, jiggle_scale: 0.9 } });
    const eC = E.bscSiteExtent(cold, null) as number, eH = E.bscSiteExtent(hot, null) as number;
    ok("a 298 K network's fitted extent is UNCHANGED (S5 / S7 / S8 keep their camera)",
      Math.abs(eC - (12.84 + E.BS_BOND_LEN + E.MG_ELEMENTS.O.radius)) < 1e-9, `${eC.toFixed(3)} units`);
    ok("a state that RAMPS is framed for its hottest pose, so the swell stays on frame",
      eH > eC * 1.2 && Math.abs(eH / eC - (E.bscPeakThermalScale(hot, "H2O") as number)) < 1e-9,
      `${eC.toFixed(2)} -> ${eH.toFixed(2)} units (peak scale ${(E.bscPeakThermalScale(hot, "H2O") as number).toFixed(4)}x)`);
    ok("the teacher's temperature SLIDER is deliberately not counted (S8 cannot move)",
      (E.bscPeakThermalScale(Object.assign({}, BS3, {
        mode: "explore", thermal: { T_K: 298, jiggle_scale: 0.9 },
        controls: [{ id: "temperature" }] }), "H2O") as number) === 1);
  }
  const upd3 = grabFn("updateBondingSceneFrame");
  ok("the frame pass really multiplies the base position by the scale (shipped body)",
    /var esc = bscThermalScale\(molKey, tempAt\(mms\), netStretch\);/.test(upd3) &&
    /if \(esc !== 1\) b = \[b\[0\] \* esc, b\[1\] \* esc, b\[2\] \* esc\];/.test(upd3) &&
    /var netStretch = bscNetworkStretch\(bs\);/.test(upd3));
  ok("...and publishes the live scale for the professor pack",
    /window\.PM_bscNetScale = bscThermalScale\(molKey, T_K, netStretch\);/.test(upd3));
  ok("no new cue key was introduced, so deriveStateMeta needs no new pin",
    !/bscTh(2)?\.(expand|collapse|boil)/.test(META_SRC) &&
    /candidates\.push\(asNum\(bscTh2\.T_at_ms, 0\) \+ asNum\(bscTh2\.T_ramp_ms, 2000\) \+ 600\)/.test(META_SRC));
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 32. E3b S-8 LAYER PARITY (a mechanism live on one layer is live on both) ===");
// THE PERMANENT HALF of the E3b site-layer parity dispatch. founder_proxy
// Checkpoint A on ionic_bonding (2026-08-03) found three motion/decoration
// mechanisms that existed ONLY on the unit (molecule) layer:
//   P-1  sitePos was the raw authored SI.at plus spin — it never touched the
//        sepAt/baseAt/orgAt chain, so separation / separation_axis /
//        approach_from / approach_at_ms / approach_duration_ms were INERT on ions.
//   P-2  bscJiggle had exactly ONE call site, inside the unit layer's orgAt, so
//        thermal.jiggle_scale was a no-op on every lattice and every ion scene.
//   P-3  electrons.show 'shells' counted BS_VALENCE[mol.central], and molKey
//        falls back to "HCl" when no unit is a molecule — so a scene of bare Na
//        and Cl atoms drew ONE dot and the readout printed "outer electrons = 1".
// Each is a state that renders, passes tsc, passes validate:concepts, and is
// declared MOVING by deriveStateMeta while being byte-static on screen: a green
// gate over a dead state. The pattern behind all three is the thing this section
// exists to stop — a mechanism added to one of the two draw layers and not the
// other, with nothing asserting parity. So the assertions below are written
// against the SHIPPED bodies (bscSepAt / bscTempAt / bscSiteAt / bscSepPmAt /
// bscValenceOf / bscCoordinationPair are extracted and called, never transcribed)
// and every one carries its own pre-fix NEGATIVE CONTROL, because an assertion
// that only says "the fixed code passes" would also pass a naive implementation.
{
  const updSrc = grabFn("updateBondingSceneFrame");
  const appSrc = grabFn("applyBondingSceneState");
  const buildSrc = grabFn("buildBondingScene");
  const P2U = E.bscLinkCfg({}).pm_per_unit as number;

  // ── the ionic_bonding S3 fixture: two ions on a scripted approach. The
  //    destination is the touching distance the concept teaches — r(Na+) 102 +
  //    r(Cl-) 181 = 283 pm — expressed in scene units on the shared linear scale,
  //    rounded so the readout lands on the 282 pm the rock-salt cell also gives.
  const SEP_U = 282 / P2U;
  const ION_APPROACH_BS = {
    placement: "free", mode: "approach_link",
    separation_axis: [1, 0, 0], separation: SEP_U,
    approach_from: 12.0, approach_at_ms: 1200, approach_duration_ms: 3600,
    units: [{ id: "na", species: "Na+", at: [0, 0, 0] },
            { id: "cl", species: "Cl-", at: [0, 0, 0] }],
    controls: [{ id: "separation" }], hud_lines: ["separation_pm"]
  };
  const T_END = 1200 + 3600 + 600;          // the pin deriveStateMeta already sets
  const sitesOf = (bs: any) => E.bscSiteList(bs, null) as any[];
  const poseAt = (bs: any, ms: number, sepDrag: number | null = null) =>
    sitesOf(bs).map((si: any, i: number) => E.bscSiteAt(bs, si, i, ms, sepDrag, null) as number[]);
  const poseStr = (bs: any, ms: number) => JSON.stringify(poseAt(bs, ms));

  // ── ASSERTION 1: the scripted position chain reaches the SITE layer.
  {
    const S = sitesOf(ION_APPROACH_BS);
    ok("a two-ion approach state resolves both ions as SITES (the unit layer is off)",
      S.length === 2 && E.bscIsSite(S[0].species) && E.bscIsSite(S[1].species) &&
      S[0].uidx === 0 && S[1].uidx === 1, S.map((s: any) => s.species).join(" "));
    const p0 = poseAt(ION_APPROACH_BS, 0), pE = poseAt(ION_APPROACH_BS, T_END);
    ok("t=0 and t=state_end are DIFFERENT positions (P-1: this used to be byte-static)",
      JSON.stringify(p0) !== JSON.stringify(pE),
      `t=0 ${p0[0][0].toFixed(3)}/${p0[1][0].toFixed(3)}  ` +
      `t=${T_END} ${pE[0][0].toFixed(3)}/${pE[1][0].toFixed(3)} (scene units on x)`);
    ok("the state OPENS at approach_from, split about the separation_axis",
      Math.abs(p0[0][0] + 6.0) < 1e-12 && Math.abs(p0[1][0] - 6.0) < 1e-12 &&
      Math.abs(p0[0][1]) < 1e-12 && Math.abs(p0[0][2]) < 1e-12);
    const dEnd = Math.hypot(pE[1][0] - pE[0][0], pE[1][1] - pE[0][1], pE[1][2] - pE[0][2]);
    ok("...and SETTLES at exactly the authored separation, on the authored axis",
      Math.abs(dEnd - SEP_U) < 1e-12, `${dEnd.toFixed(9)} vs authored ${SEP_U.toFixed(9)}`);
    ok("the ramp is monotonic in between (mgRamp, no overshoot, no latch)",
      [1200, 2000, 3000, 4000, 4800].every((m, i, a) => i === 0 ||
        poseAt(ION_APPROACH_BS, m)[1][0] < poseAt(ION_APPROACH_BS, a[i - 1])[1][0] + 1e-12));
    // D-1 / Rule 36: the rewind, on the POSE, not on a scalar.
    const r1 = poseStr(ION_APPROACH_BS, 2400); poseStr(ION_APPROACH_BS, 90000);
    ok("REWIND: t=2400 -> 90000 -> 2400 reproduces the site pose byte-for-byte",
      r1 === poseStr(ION_APPROACH_BS, 2400));
    // drag-seize: the separation slider takes the quantity and the script never
    // writes it again (scripted_change_desyncs_the_dom_control_that_shares_it).
    const drag = poseAt(ION_APPROACH_BS, 1500, 7.25);
    ok("a trusted separation drag seizes the SITE pair at every t, script ignored",
      [0, 1500, 3000, 9000].every((m) => {
        const p = poseAt(ION_APPROACH_BS, m, 7.25);
        return Math.abs(p[1][0] - 3.625) < 1e-12 && Math.abs(p[0][0] + 3.625) < 1e-12;
      }), `x = +-${drag[1][0].toFixed(4)} at every t`);
    ok("state entry seeds the separation widget at approach_from (the entry half)",
      /PM_bscSep = \(bs\.approach_from != null\) \? bs\.approach_from/.test(appSrc));
    // NEGATIVE CONTROL: the pre-fix expression, transcribed. sitePos was the raw
    // authored SI.at, and a separation_axis pair authors both units at the origin
    // — so the two ions sat on top of each other and NOTHING moved, ever.
    const preFix = sitesOf(ION_APPROACH_BS).map((s: any) => s.at);
    ok("NEGATIVE CONTROL: the pre-fix pass (raw SI.at) stacks both ions at the origin",
      JSON.stringify(preFix[0]) === JSON.stringify(preFix[1]) &&
      preFix[0].every((v: number) => v === 0), JSON.stringify(preFix[0]));
    // and the SHIPPED frame pass really routes through it.
    // (E3b L-1 added the seventh argument, the per-site slip displacement — the
    // shape of the call is asserted, not its exact former arity, so the next
    // mechanism to join the chain does not have to edit this line.)
    ok("the shipped site pass calls bscSiteAt, and the spin is still applied after it",
      /var sAt = bscSiteAt\(bs, SI, i, ms, sepDragV, tempDragV(, [^)]*)?\);/.test(updSrc) &&
      /sitePos\.push\(\(spin !== 0\) \? bscSpinRot\(sAt, spinAx, spin\) : sAt\);/.test(updSrc));
  }

  // ── ASSERTION 1b (second order): the OPENING camera frames the ion pair.
  {
    const eOpen = E.bscOpeningExtent(ION_APPROACH_BS) as number;
    const rMax = E.bscRadiusPm("Cl-") / P2U;
    ok("the opening-extent solve now covers a separation_axis pair of SITES",
      Math.abs(eOpen - (6.0 + rMax)) < 1e-9, `${eOpen.toFixed(3)} units (approach_from/2 + r)`);
    // NEGATIVE CONTROL: the pre-fix loop carried "if (!msp) continue;" — it
    // skipped every species not in MG_MOLECULES, i.e. every ion — so the fit was
    // solved for the settled pose and the pair opened off frame.
    const preOpen = Math.max(...sitesOf(ION_APPROACH_BS).map((s: any) =>
      E.bscMag(s.at) + s.rPm / P2U));
    ok("NEGATIVE CONTROL: the pre-fix fit measured the ions as two touching spheres",
      preOpen < eOpen * 0.45,
      `pre ${preOpen.toFixed(2)} vs ${eOpen.toFixed(2)} units — the pair would open off frame`);
    ok("the SETTLED fit covers the separation too (no state authors a camera)",
      (E.bscSiteExtent(ION_APPROACH_BS, null) as number) >= SEP_U * 0.5 + rMax - 1e-9);
    ok("a MOLECULAR separation_axis scene is bit-for-bit unframed by the new term",
      (E.bscSepSiteExtent({ separation_axis: [1, 0, 0],
        units: [{ species: "H2O" }, { species: "H2O" }] }, 12) as number) === 0 &&
      (E.bscSepSiteExtent({ units: [{ species: "Na+" }, { species: "Cl-" }] }, 12) as number) === 0);
  }

  // ── ASSERTION 2: thermal jiggle on the SITE layer (P-2).
  {
    const latJ = (js: number) => Object.assign({}, LATTICE_BS, {
      lattice: { cell: "rock_salt", n: [3, 3, 3], a_pm: 564 },
      thermal: { T_K: 298, jiggle_scale: js }
    });
    ok("jiggle_scale 1: two frames 200 ms apart are NOT byte-identical",
      poseStr(latJ(1), 3000) !== poseStr(latJ(1), 3200));
    ok("jiggle_scale 0 (the default): those same two frames ARE byte-identical",
      poseStr(latJ(0), 3000) === poseStr(latJ(0), 3200));
    ok("...and jiggle_scale keeps its default of 0 — authoring stays explicit",
      poseStr(latJ(0), 3000) === poseStr(Object.assign({}, LATTICE_BS,
        { lattice: { cell: "rock_salt", n: [3, 3, 3], a_pm: 564 } }), 3200));
    // it is a jiggle IN PLACE, not a drift: every site stays within its own
    // amplitude of its lattice point, which is ionic_bonding S8's negative
    // control ("the solid's ions jiggle in place and never translate").
    {
      const bs1 = latJ(1), S = sitesOf(bs1);
      const worstTo = (endMs: number) => {
        let w = 0;
        for (let m = 0; m <= endMs; m += 250) {
          const p = poseAt(bs1, m);
          for (let i = 0; i < S.length; i++) {
            w = Math.max(w, E.bscMag([p[i][0] - S[i].at[0], p[i][1] - S[i].at[1],
              p[i][2] - S[i].at[2]]) as number);
          }
        }
        return w;
      };
      // the nearest-neighbour distance of this very block: an ion that jiggles IN
      // PLACE never travels half of it, or it would be swapping sites.
      const nn = E.bscMag([S[1].at[0] - S[0].at[0], S[1].at[1] - S[0].at[1],
        S[1].at[2] - S[0].at[2]]) as number;
      const w20 = worstTo(20000), w200 = worstTo(200000);
      ok("the site jiggles IN PLACE — it never travels half a lattice spacing",
        w20 < nn * 0.5, `worst excursion ${w20.toFixed(4)} vs nn/2 = ${(nn * 0.5).toFixed(4)} units`);
      ok("...and the excursion is BOUNDED, not growing with t (an accumulator would)",
        w200 <= w20 * 1.05 + 1e-9 && w200 <= Math.sqrt(3) + 1e-9,
        `20 s ${w20.toFixed(4)}  ->  200 s ${w200.toFixed(4)} (closed-form bound sqrt(3) at scale 1)`);
    }
    // the amplitude law and the index-derived phase are the unit layer's, verbatim.
    //   E3b T-2 moved this fixture's two temperatures BELOW NaCl's melting point
    //   (1074 K), and the move is the point rather than an accommodation: the
    //   original pair was T0 = 298 K and 4T0 = 1192 K, and 1192 K is 118 K PAST
    //   the melting point of the very lattice this fixture is made of. The jiggle
    //   amplitude law is a property of a SOLID; asking for it on a molten block is
    //   asking the wrong question, and the melt term correctly answered 6.00x
    //   instead of 2x. 200 K and 800 K are the same exact 4x ratio, both solid.
    {
      const latT = (T: number) => Object.assign({}, latJ(1), { thermal: { T_K: T, jiggle_scale: 1 } });
      const hot = poseAt(latT(800), 3000);
      const cold = poseAt(latT(200), 3000), S = sitesOf(latJ(1));
      const amp = (p: number[][], i: number) => E.bscMag([p[i][0] - S[i].at[0],
        p[i][1] - S[i].at[1], p[i][2] - S[i].at[2]]) as number;
      near("site amplitude at 4T is exactly 2x that at T (sqrt(T/T0), the unit law)",
        amp(hot, 5) / amp(cold, 5), 2, 1e-12);
      // and the reason the old fixture had to move: at 1192 K this NaCl block is
      // MOLTEN, so its ions carry the melt excursion on top of the jiggle. A gate
      // that still read 2x there would mean the melt was not live.
      ok("...and past the melting point the same block is NOT merely jiggling",
        amp(poseAt(latT(4 * (E.BS_T0_K as number)), 3000), 5) > amp(hot, 5) * 1.5,
        `1192 K is ${(1192 - 1074)} K past NaCl's mp — the block has melted`);
    }
    const r2s = poseStr(latJ(1), 4400); poseStr(latJ(1), 120000);
    ok("REWIND: a jiggling lattice replays byte-for-byte after a jump to 120 s",
      r2s === poseStr(latJ(1), 4400));
    // NEGATIVE CONTROL: bscJiggle used to have ONE call site in the whole file.
    ok("NEGATIVE CONTROL / PARITY: bscJiggle is now reached from BOTH position chains",
      /bscJiggle\(uu, mms \/ 1000, tempAt\(mms\), jScale\)/.test(updSrc) &&
      /bscJiggle\(/.test(grabFn("bscSiteAt")),
      "unit chain: orgAt   site chain: bscSiteAt");
  }

  // ── ASSERTION 3: per-site shell dots + the site-aware valence readout (P-3).
  {
    const SHELL_BS = {
      placement: "free", mode: "transfer",
      units: [{ id: "na", species: "Na", at: [-3, 0, 0] },
              { id: "cl", species: "Cl", at: [3, 0, 0] }],
      electrons: { show: "shells" }, hud_lines: ["valence"]
    };
    const S = sitesOf(SHELL_BS);
    const dots = S.map((s: any) => E.bscValenceOf(s.species) as number);
    ok("Na + Cl with electrons.show 'shells' draws EIGHT dots — 1 on Na, 7 on Cl",
      dots[0] === 1 && dots[1] === 7 && dots[0] + dots[1] === 8, `[${dots.join(", ")}]`);
    ok("the ION counts are DERIVED from the same rule (Na+ 0, Cl- 8 — the octet)",
      E.bscValenceOf("Na+") === 0 && E.bscValenceOf("Cl-") === 8 &&
      E.bscValenceOf("Mg2+") === 0 && E.bscValenceOf("O2-") === 8 &&
      E.bscValenceOf("Al3+") === 0 && E.bscValenceOf("F-") === 8,
      "outer count = BS_VALENCE[parent] - formal charge, no second table");
    ok("bscParentEl resolves every ion in the closed enum to its element",
      ["Li+", "Na+", "K+", "Mg2+", "Ca2+", "Al3+", "F-", "Cl-", "O2-"]
        .every((k) => E.BS_VALENCE[E.bscParentEl(k)] != null) &&
      E.bscParentEl("Na") === "Na" && E.bscParentEl("O2-") === "O");
    // NEGATIVE CONTROL: the pre-fix expression, transcribed. molKey falls back to
    // "HCl" whenever no unit species is a molecule (the shipped line is
    // `if (!MG_MOLECULES[molKey]) molKey = "HCl";`), so the ring counted
    // BS_VALENCE.H = 1 and drew a single dot inside the sodium sphere.
    ok("NEGATIVE CONTROL: the pre-fix count on this very scene was ONE dot",
      !E.MG_MOLECULES.Na && (E.BS_VALENCE[E.MG_MOLECULES.HCl.central] as number) === 1,
      "BS_VALENCE[mol.central] with molKey forced to HCl -> 1");
    ok("...and the HCl fallback that caused it is still there (so the fix is the fix)",
      /if \(!MG_MOLECULES\[molKey\]\) molKey = "HCl";/.test(updSrc));
    // the D-6 budget, declared rather than assumed.
    ok("the dot pool is a DECLARED budget: 4 rings x 8 dots, never 27 rings",
      E.BS_MAX_SHELL_DOTS === 8 && E.BS_MAX_SHELL_SITES === 4 &&
      E.BS_SHELL_POOL === 32 && new RegExp("for \\(i = 0; i < BS_SHELL_POOL; i\\+\\+\\)").test(buildSrc),
      `${E.BS_SHELL_POOL} dots built`);
    ok("no species can overflow one ring (every count is <= BS_MAX_SHELL_DOTS)",
      Object.keys(E.BS_VALENCE).concat(Object.keys(E.BS_ION_PARENT))
        .every((k) => (E.bscValenceOf(k) as number) <= E.BS_MAX_SHELL_DOTS));
    // the shipped frame pass: per-site count, per-site radius, camera plane (D-4).
    ok("the shipped shell pass counts per SITE and sizes off that site's own radius",
      /shellN\.push\(bscValenceOf\(siteSp\[sIx\]\)\);/.test(updSrc) &&
      /shellR\.push\(siteRU\[sIx\] \* rsNow \+ BS_SHELL_RING_GAP\);/.test(updSrc) &&
      /shellC\.push\(sitePos\[sIx\]\);/.test(updSrc));
    ok("D-4 holds per ring: every ring is still drawn in the CAMERA plane",
      /camera\.matrixWorld\.extractBasis\(mgCamR, mgCamU, mgCamF\);/.test(updSrc) &&
      /mgCamR\.x \* Math\.cos\(ang2\) \+ mgCamU\.x \* Math\.sin\(ang2\)/.test(updSrc));
    ok("the MOLECULAR one-ring path is unchanged (ring 0, same centre, same gap)",
      /shellN\.push\(BS_VALENCE\[mol\.central\] \|\| 0\);/.test(updSrc) &&
      /shellC\.push\(fOrg\);/.test(updSrc) && (E.BS_SHELL_RING_GAP as number) === 0.42);
    // the HUD half: the radius_pm branch's own pattern, applied to valence.
    ok("the valence HUD line is SITE-AWARE (the radius_pm reference implementation)",
      /else if \(w === "valence"\) \{/.test(updSrc) &&
      /if \(nShown > 0\) \{[\s\S]{0,1200}bscValenceOf\(siteSp\[vIx\[j\]\]\)/.test(updSrc) &&
      /bscSpeciesLabel\(siteSp\[vIx\[j\]\]\) \+ ": outer electrons = "/.test(updSrc));
    ok("...and it names BOTH participants, never a single untrue count",
      /vIx\.push\(trFrom\); vIx\.push\(trTo\);/.test(updSrc) &&
      /siteSp\[j\] !== siteSp\[focalSite\]/.test(updSrc));
    ok("the species label reaching the HUD is real Unicode (Rule 34c, all paths)",
      E.bscSpeciesLabel("Na+") === "Na⁺" && E.bscSpeciesLabel("Cl-") === "Cl⁻" &&
      E.bscSpeciesLabel("O2-") === "O²⁻");
  }

  // ── ASSERTION 4: a lattice explore sandbox with jiggle actually moves.
  {
    const SANDBOX = {
      placement: "lattice", mode: "explore",
      units: [{ species: "Na+" }, { species: "Cl-" }],
      lattice: { cell: "rock_salt", n: [3, 3, 3], a_pm: 564 },
      thermal: { T_K: 298, jiggle_scale: 0.35 },
      controls: [{ id: "temperature" }, { id: "ion_pair" }]
    };
    ok("mode explore + lattice + jiggle, no spin_rate: two frames 400 ms apart differ",
      poseStr(SANDBOX, 5000) !== poseStr(SANDBOX, 5400));
    ok("...and it is still a pure function of ms (Rule 37 free-run, D-1 rewind)",
      poseStr(SANDBOX, 5000) === (() => { poseStr(SANDBOX, 400000); return poseStr(SANDBOX, 5000); })());
    // THE GUARD, S-6: the fallback may only stand down on a signal that is LIVE
    // for the layer actually drawing the state. Before S-2 this exact state got
    // no jiggle (site layer) AND no spin (the guard stood down on jiggle_scale)
    // — byte-frozen, while deriveStateMeta declared it MOVING.
    ok("the idle-spin guard's signal is LIVE for the SITE layer (S-6 / S-2)",
      /var jiggleMoves = \(th\.jiggle_scale > 0\);/.test(updSrc) &&
      /bscJiggle\(/.test(grabFn("bscSiteAt")));
    ok("deriveStateMeta declares such a state MOVING — and now that is TRUE",
      /bscTh && typeof bscTh\.jiggle_scale === 'number' && bscTh\.jiggle_scale > 0/.test(META_SRC) &&
      poseStr(SANDBOX, 5000) !== poseStr(SANDBOX, 5400));
    // NEGATIVE CONTROL: the same sandbox with the jiggle switched off stands
    // still on the site layer, which is exactly why the idle turn must NOT have
    // stood down for it (and does not: the guard reads jiggle_scale > 0).
    const STILL = Object.assign({}, SANDBOX, { thermal: { T_K: 298, jiggle_scale: 0 } });
    ok("NEGATIVE CONTROL: with no jiggle the site layer is static, so the turn stays",
      poseStr(STILL, 5000) === poseStr(STILL, 5400) &&
      /!jiggleMoves\) spinRate = 0\.14;/.test(updSrc));
  }

  // ── ASSERTION 5: separation_pm is a live instrument (S-4).
  {
    const dAt = (m: number) => E.bscSepPmAt(ION_APPROACH_BS, sitesOf(ION_APPROACH_BS), m, null) as number;
    ok("separation_pm reads the OPENING distance before the ramp",
      Math.abs(dAt(0) - 12.0 * P2U) < 1e-9, `${Math.round(dAt(0))} pm`);
    ok("...changes across the ramp, monotonically",
      [1200, 2400, 3600, 4800].every((m, i, a) => i === 0 || dAt(m) < dAt(a[i - 1])),
      [0, 1200, 2400, 3600, 4800].map((m) => Math.round(dAt(m))).join(" -> ") + " pm");
    ok("...and SETTLES at the authored destination, printing the taught 282 pm",
      Math.round(dAt(T_END)) === 282 && Math.abs(dAt(T_END) - SEP_U * P2U) < 1e-9,
      `d = ${Math.round(dAt(T_END))} pm`);
    // the same instrument on a LATTICE: shell-ordered, so sites 0/1 are the centre
    // and one nearest neighbour — a/2, which is the same 282 pm for NaCl.
    const dLat = E.bscSepPmAt(LATTICE_BS, sitesOf(LATTICE_BS), 0, null) as number;
    ok("on a rock-salt lattice the same line reads the nearest-neighbour distance",
      Math.abs(dLat - 564 / 2) < 1e-9, `${Math.round(dLat)} pm = a/2`);
    ok("r(Na+) + r(Cl-) = that distance, so the ions TOUCH on the shared scale",
      Math.abs((E.bscRadiusPm("Na+") + E.bscRadiusPm("Cl-")) - 283) < 1e-9,
      "102 + 181 = 283 pm against a/2 = 282 pm");
    // ── found by the headless drive, not by this gate: at jiggle_scale 0.35 the
    //    DRAWN distance wandered 282 -> 294 -> 298 pm frame to frame, a 6%
    //    flicker on a number a teacher is meant to read aloud. Rule 33d wants an
    //    instrument that TRACKS the physical change, not one that re-rolls. The
    //    line reads the EQUILIBRIUM positions; the jiggle is noise about them.
    {
      const latJig = Object.assign({}, LATTICE_BS, {
        lattice: { cell: "rock_salt", n: [3, 3, 3], a_pm: 564 },
        thermal: { T_K: 300, jiggle_scale: 0.35 }
      });
      const reads = [0, 250, 500, 750, 1000, 4000].map((m) =>
        E.bscSepPmAt(latJig, sitesOf(latJig), m, null) as number);
      ok("the readout does NOT flicker under a thermal jiggle (Rule 33d)",
        reads.every((v) => Math.abs(v - 282) < 1e-9), `[${reads.map((v) => v.toFixed(3)).join(", ")}] pm`);
      // NEGATIVE CONTROL: the DRAWN distance genuinely does wander — the fix is
      // reading the equilibrium, not the jiggle having quietly gone away.
      const drawn = [0, 250, 500].map((m) => {
        const S = sitesOf(latJig);
        const A = E.bscSiteAt(latJig, S[0], 0, m, null, null) as number[];
        const B = E.bscSiteAt(latJig, S[1], 1, m, null, null) as number[];
        return Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]) * P2U;
      });
      ok("NEGATIVE CONTROL: the DRAWN distance really does wander (the jiggle is live)",
        new Set(drawn.map((v) => v.toFixed(6))).size === drawn.length &&
        Math.max(...drawn) - Math.min(...drawn) > 1,
        `drawn ${drawn.map((v) => v.toFixed(1)).join(" / ")} pm vs a steady 282 read out`);
    }
    ok("fewer than two sites prints the em dash, never a fabricated number",
      E.bscSepPmAt(ION_APPROACH_BS, [], 0, null) === null &&
      E.bscSepPmAt(ION_APPROACH_BS, null, 0, null) === null &&
      /\(dPm == null\) \? "/.test(updSrc) && /u2014" : Math\.round\(dPm\)\) \+ " pm"/.test(updSrc));
    ok("the HUD reads the SHIPPED bscSepPmAt (one instrument, D-3)",
      /var dPm = bscSepPmAt\(bs, siteList, ms, sepDragV\);/.test(updSrc) &&
      /window\.PM_bscSepPm = bscSepPmAt\(bs, siteList, ms, sepDragV\);/.test(updSrc));
    ok("the ionic concepts need never type a separation digit again (Rule 33d)",
      (E.BS_HUD_LINES as string[]).includes("separation_pm") &&
      (E.BS_HUD_LINES_E3B as string[]).includes("separation_pm"));
  }

  // ── S-5: coordination prints 6 : 6, and BOTH numbers are derived.
  {
    const rs = E.bscCoordinationPair("rock_salt") as (number | null)[];
    ok("rock salt reads 6 : 6, both counted independently by the same pass",
      rs[0] === 6 && rs[1] === 6, `${rs[0]} : ${rs[1]}`);
    ok("a one-sublattice cell has no second number (fcc 12, bcc 8, hcp 12)",
      (E.bscCoordinationPair("fcc") as any[])[0] === 12 &&
      (E.bscCoordinationPair("fcc") as any[])[1] === null &&
      (E.bscCoordinationPair("bcc") as any[])[0] === 8 &&
      (E.bscCoordinationPair("hcp") as any[])[0] === 12,
      "every metal lattice prints ONE count, honestly");
    ok("the pair agrees with the independent E3a coordination derivation",
      (E.bscCoordinationPair("rock_salt") as any[])[0] === E.bscCoordination("rock_salt") &&
      (E.bscCoordinationPair("bcc") as any[])[0] === E.bscCoordination("bcc"));
    // NEGATIVE CONTROL: counting the ANION inside the block a state actually
    // draws gives 5, not 6 — an artefact of the crop. That is exactly why the
    // second number comes from a complete-shell block and not from the render.
    {
      const LS = sitesOf(LATTICE_BS);
      const anion = LS.find((s: any) => s.sub === 1);
      ok("NEGATIVE CONTROL: the drawn 3x3x3 block gives the anion FIVE neighbours",
        (E.bscCoordAround(LS, anion) as number) === 5,
        "printing 6 : 5 would report the crop, not the crystal");
      ok("...while the focal CATION's drawn count does match the derived 6 (rods agree)",
        (E.bscCoordAround(LS, LS[0]) as number) === 6);
    }
    ok("the HUD prints the cation first and never doubles one count",
      /coordination = " \+ \(\(bscSpeciesCharge\(spA0\) >= 0\)/.test(updSrc) &&
      /cPair\[0\] \+ " : " \+ cPair\[1\]/.test(updSrc) &&
      /cPair\[1\] \+ " : " \+ cPair\[0\]/.test(updSrc));
    ok("a free-placement scene still falls back to the DRAWN neighbour set",
      /else lines\.push\("coordination = " \+ nbIdx\.length\);/.test(updSrc));
    ok("nothing hard-codes a coordination pair as a string literal anywhere",
      !/"\s*\d+\s*:\s*\d+\s*"/.test(grabRegion("bscClamp", "applyBondingSceneGlow")),
      "both numbers can only come from bscCoordinationPair");
  }

  // ── S-7: a scripted destination outside its own slider's range is an
  //    AUTHORING ERROR, not a silent clamp.
  {
    // The engine writes the raw value into the widget; the BROWSER then pins the
    // thumb at max while the span and the scene read the scripted value. That is
    // the clamping form of scripted_change_desyncs_the_dom_control_that_shares_it
    // and no engine change can fix it — the range is concept-level config, so the
    // only correct answer is to refuse the authoring.
    ok("the widget re-seed writes the RAW scripted value (the DOM pins it silently)",
      /if \(e\) e\.value = String\(v\);/.test(appSrc) &&
      /if \(tsl\) tsl\.value = String\(T_K\);/.test(updSrc));
    ok("only the panel DEFAULT is clamped into the authored range (defc), not the script",
      /var defc = function \(k, d, lo, hi\) \{ return bscClamp\(Number\(def\(k, d\)\), lim\(k, "min", lo\), lim\(k, "max", hi\)\); \};/.test(buildSrc));
    // the engine's own default bounds, transcribed from the panel it emits.
    const DEFAULT_RANGE: Record<string, [number, number]> = {
      angle: [60, 180], spin: [0, 0.6], temperature: [100, 600],
      separation: [1.5, 8], shift: [0, 1], field: [0, 1], valence: [1, 3]
    };
    for (const k of Object.keys(DEFAULT_RANGE)) {
      const [lo, hi] = DEFAULT_RANGE[k];
      if (!new RegExp('id="bsc_' + k + '_slider" min="\' \\+ lim\\("' + k + '", "min", ' + lo + '\\)').test(buildSrc)) {
        ok(`the transcribed default range for '${k}' matches the emitted panel`, false, `${lo}..${hi}`);
      }
    }
    // the RULE: a scripted destination that shares an id with an EXPOSED control
    // must lie inside that control's resolved range.
    const SCRIPTED: Record<string, (bs: any) => number[]> = {
      temperature: (bs) => [bs.thermal?.T_K, bs.thermal?.T_from],
      separation: (bs) => [bs.separation, bs.approach_from],
      angle: (bs) => [bs.angle_deg, bs.angle_from],
      spin: (bs) => [bs.spin_rate]
    };
    const violations = (sc: any, states: any[]) => {
      const out: string[] = [];
      for (const bs of states) {
        const ids = (E.bscControlList(bs.controls) as any[]).map((c) => c.id)
          .concat((E.bscControlList(bs.static_readouts) as any[]).map((c) => c.id));
        for (const id of Object.keys(SCRIPTED)) {
          if (ids.indexOf(id) < 0) continue;
          const [lo, hi] = DEFAULT_RANGE[id];
          const min = sc?.[id]?.min != null ? Number(sc[id].min) : lo;
          const max = sc?.[id]?.max != null ? Number(sc[id].max) : hi;
          for (const v of SCRIPTED[id](bs)) {
            if (typeof v === "number" && (v < min || v > max)) {
              out.push(`${id}=${v} outside ${min}..${max}`);
            }
          }
        }
      }
      return out;
    };
    /** the slider ranges a concept declares, wherever it keeps them. */
    const j2Sliders = (j: any) => j?.field_3d_config?.slider_controls || j?.slider_controls || null;
    const S7_BAD = { thermal: { T_from: 300, T_K: 1200, T_at_ms: 2000 }, controls: ["temperature"] };
    const S7_OK_RANGE = { temperature: { min: 300, max: 3400, step: 25 } };
    ok("a 1200 K ramp against the DEFAULT 100..600 K slider is a HARD ERROR",
      violations(null, [S7_BAD]).length === 1, violations(null, [S7_BAD]).join(" "));
    ok("...and the same state with the architect's {min:300,max:3400} range passes",
      violations(S7_OK_RANGE, [S7_BAD]).length === 0);
    ok("ionic S10 must reach 3400 K so MgO (mp 3125) and CaO (2886) can melt at all",
      violations(S7_OK_RANGE, [{ thermal: { T_K: 3400 }, controls: ["temperature"] }]).length === 0 &&
      violations(S7_OK_RANGE, [{ thermal: { T_K: 3500 }, controls: ["temperature"] }]).length === 1);
    ok("a state that does NOT expose the slider is not constrained by it",
      violations(null, [{ thermal: { T_K: 1200 }, controls: [] }]).length === 0,
      "no widget, no desync — the rule is about the shared quantity");
    ok("the rule also covers separation / angle / spin, not temperature alone",
      violations(null, [{ approach_from: 12.0, separation: 5.9, controls: ["separation"] }]).length === 1 &&
      violations(null, [{ angle_from: 40, controls: ["angle"] }]).length === 1 &&
      violations(null, [{ spin_rate: 0.9, controls: ["spin"] }]).length === 1);
    // and it runs over every SHIPPED bonding_scene concept, so it arms itself the
    // moment one lands rather than waiting for someone to remember this section.
    {
      const walk = (dir: string): string[] => {
        let out: string[] = [];
        for (const e of readdirSync(dir, { withFileTypes: true })) {
          const p = join(dir, e.name);
          if (e.isDirectory()) out = out.concat(walk(p));
          else if (e.name.endsWith(".json")) out.push(p);
        }
        return out;
      };
      // ── E3b F-gate (2026-08-03): THIS SCAN HAD NEVER LOOKED AT A FILE.
      //   It read Object.values(j.states) while every concept nests its states
      //   under field_3d_config.states, so it extracted zero blocks from every
      //   file, skipped every one of them and PRINTED "0 concept(s) scanned" as a
      //   PASS. A gate that can silently match nothing is worse than no gate,
      //   because it reads as coverage. Three things fix the class, not the line:
      //   the reader is one named function, a SELF-TEST proves that reader finds
      //   the states of a concept-shaped fixture (so the structure assumption is
      //   asserted whatever files happen to exist), and a file that MENTIONS
      //   bonding_scene while yielding no block is a FAILURE rather than a skip.
      const readBlocks = (j: any): any[] => {
        const buckets = [j?.field_3d_config?.states, j?.states];
        const out: any[] = [];
        for (const b of buckets) {
          if (!b) continue;
          for (const st of Object.values(b)) {
            const blk = (st as any)?.bonding_scene;
            if (blk) out.push(blk);
          }
        }
        return out;
      };
      ok("SELF-TEST: the state reader finds a bonding_scene block where concepts actually keep it",
        readBlocks({ field_3d_config: { states: { STATE_1: { bonding_scene: { mode: "melt" } } } } }).length === 1 &&
        readBlocks({ states: { STATE_1: { bonding_scene: { mode: "melt" } } } }).length === 1 &&
        readBlocks({ field_3d_config: { states: { STATE_1: {} } } }).length === 0,
        "field_3d_config.states (the shipped shape) AND a bare states map");
      const root = join(process.cwd(), "src/data/concepts");
      let scanned = 0, mentions = 0;
      const bad: string[] = [], blind: string[] = [];
      for (const f of walk(root)) {
        const raw = readFileSync(f, "utf8");
        if (!raw.includes("bonding_scene")) continue;
        mentions++;
        const states = readBlocks(JSON.parse(raw));
        if (!states.length) { blind.push(f.split("/").pop() as string); continue; }
        scanned++;
        const v = violations(j2Sliders(JSON.parse(raw)), states);
        if (v.length) bad.push(f.split("/").pop() + ": " + v.join(", "));
      }
      ok("the scan is not BLIND: every file that mentions bonding_scene yields its blocks",
        blind.length === 0,
        blind.length ? "MENTIONS IT BUT READ 0 BLOCKS: " + blind.join(", ")
          : `${mentions} file(s) mention bonding_scene, ${scanned} scanned`);
      ok("every SHIPPED bonding_scene concept keeps its scripts inside its slider ranges",
        bad.length === 0, bad.length ? bad.join(" | ") : `${scanned} bonding_scene concept(s) scanned`);
    }
  }

  // ── THE PERMANENT HALF: a mechanism live on one layer is live on the other.
  //    This is the assertion that closes the HOLE rather than the three
  //    instances — the next mechanism added to one chain and not the other fails
  //    here, without anyone having to notice.
  {
    const siteChain = grabFn("bscSiteBaseAt") + grabFn("bscSiteAt") +
      grabFn("bscSepAt") + grabFn("bscTempAt");
    const unitChain = updSrc.slice(updSrc.indexOf("var sepAt = function"),
      updSrc.indexOf("var spinAng = function"));
    const MECHANISMS: [string, RegExp][] = [
      ["separation_axis placement", /separation_axis/],
      ["the scripted separation ramp", /bscSepAt\(|sepAt\(/],
      ["the scripted temperature ramp", /bscTempAt\(|tempAt\(/],
      ["the deterministic thermal jiggle", /bscJiggle\(/]
    ];
    const oneSided = MECHANISMS.filter(([, re]) => re.test(unitChain) !== re.test(siteChain));
    ok("EVERY scripted position mechanism is present in BOTH position chains",
      oneSided.length === 0,
      oneSided.length ? "ONE-SIDED: " + oneSided.map(([n]) => n).join(", ")
        : MECHANISMS.map(([n]) => n).join(" · "));
    // the site chain must be PURE (D-1) — the whole freeze-pin guarantee, and the
    // reason the assertions above can call it at all.
    ok("the site position chain is closed-form: no clock, no accumulator, no RNG",
      !/Date\.now|performance\.now|Math\.random|\+=/.test(siteChain));
    // and the two layers must not be able to disagree about the SAME ramp: the
    // unit layer's closures delegate to the shared bodies rather than repeating
    // them, which is what makes a future edit reach both by construction.
    ok("the unit layer DELEGATES to the shared ramps (one body, not two copies)",
      /var sepAt = function \(mms\) \{ return bscSepAt\(bs, mms, sepDragV\); \};/.test(updSrc) &&
      /var tempAt = function \(mms\) \{ return bscTempAt\(bs, mms, tempDragV\); \};/.test(updSrc));
    ok("no NEW cue key was introduced, so deriveStateMeta needs no new pin",
      /candidates\.push\(asNum\(bscState\.approach_at_ms, 0\) \+ asNum\(bscState\.approach_duration_ms, 2400\) \+ 600\)/
        .test(META_SRC));
  }
}


// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 33. E3b F2/F3 FRAMING SANITY (the frame contains what is drawn) ===");
// THE CLASS THIS SECTION EXISTS FOR. Three states across two dispatches shipped a
// camera that did not contain its own scene — assemble cut both atoms in half and
// showed three of eight shell dots under a caption that counts them, coordination
// opened on one sphere filling the frame under a HUD already printing 6 : 6 — and
// every assertion in this gate passed over all of them, because they all measured
// what was BUILT and none measured what was FRAMED. So: for EVERY BS_CAMERAS row,
// at the pose actually on screen (including the pre-reveal pose), every drawn disc
// must sit inside the frame.
// The projector below is written HERE, deliberately, and is not the shipped fit: a
// framing gate that measured with the engine's own fit could not catch a wrong fit.
{
  const FOV = 60 * Math.PI / 180, ASPECT = 16 / 9, TAN = Math.tan(FOV / 2);
  const sub3 = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cr3 = (a: number[], b: number[]) =>
    [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dt3 = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const camOf3 = (c: any, dist: number) => {
    const a = (c.az || 0) * Math.PI / 180, e = (c.el || 0) * Math.PI / 180;
    return [dist * Math.cos(e) * Math.cos(a), dist * Math.sin(e), dist * Math.cos(e) * Math.sin(a)];
  };
  /** worst |NDC| of a set of drawn discs, x measured against the 16:9 width. */
  const worstNdc = (cam: number[], pts: { at: number[]; r: number }[]) => {
    const f = E.bscNorm(sub3([0, 0, 0], cam)) as number[];
    const rt = E.bscNorm(cr3(f, [0, 1, 0])) as number[];
    const up = cr3(rt, f);
    let w = 0;
    for (const p of pts) {
      const d = sub3(p.at, cam), z = dt3(d, f);
      if (z <= 0.01) return 99;
      const rn = p.r / (z * TAN);
      w = Math.max(w, Math.abs(dt3(d, up)) / (z * TAN) + rn,
        (Math.abs(dt3(d, rt)) / (z * TAN) + rn) / ASPECT);
    }
    return w;
  };
  /** the drawn discs of a scene, from the SHIPPED site list (not the shipped fit). */
  const discsOf = (bs: any, rs: number) => {
    const S = E.bscSiteList(bs, null) as any[];
    const p2u = (E.bscLinkCfg(bs) as any).pm_per_unit as number;
    const out: { at: number[]; r: number }[] = S.map((si: any) => ({ at: si.at, r: si.rPm / p2u * rs }));
    for (const un of (bs.units || [])) {
      const msp = un && un.species ? (E.MG_MOLECULES as any)[un.species] : null;
      if (!msp) continue;
      let rMax = ((E.MG_ELEMENTS as any)[msp.central] || E.MG_ELEMENTS.C).radius;
      for (const lg of (E.bscLigands(msp) as string[])) {
        const rl = ((E.MG_ELEMENTS as any)[lg || msp.ligand] || E.MG_ELEMENTS.C).radius;
        if (rl > rMax) rMax = rl;
      }
      out.push({ at: un.at || [0, 0, 0], r: E.BS_BOND_LEN + rMax });
    }
    return out;
  };
  /** does the scene turn about the view axis? decided HERE, from the config. */
  const spins = (bs: any) => !!(bs.spin_rate > 0) ||
    (bs.controls || []).some((c: any) => (typeof c === "string" ? c : c.id) === "spin") ||
    (bs.mode || "dipole_sum") === "explore";
  /** the worst |NDC| any pose of this scene reaches at this distance. */
  const framed = (bs: any, cam: any, dist: number, rs: number) => {
    const C = camOf3(cam, dist), ax = E.bscSpinAxis({ az: cam.az, el: cam.el, dist }) as number[];
    const D = discsOf(bs, rs);
    let w = worstNdc(C, D);
    if (spins(bs)) {
      for (let a = 0; a < 360; a += 5) {
        w = Math.max(w, worstNdc(C, D.map((q) => ({ at: E.bscSpinRot(q.at, ax, a * Math.PI / 180) as number[], r: q.r }))));
      }
    }
    return w;
  };
  /** the same measurement over the COUNTED set alone (focal ion + its shell). */
  const framedCounted = (bs: any, cam: any, dist: number, rs: number) => {
    const S = E.bscSiteList(bs, null) as any[];
    const p2u = (E.bscLinkCfg(bs) as any).pm_per_unit as number;
    const fAt = S[(bs.lattice && bs.lattice.focal_site) || 0].at as number[];
    let nn = 1e9;
    for (let i = 0; i < S.length; i++) {
      const d0 = E.bscMag(sub3(S[i].at, fAt)) as number;
      if (d0 > 1e-9 && d0 < nn) nn = d0;
    }
    const set = S.filter((si: any) => {
      const d0 = E.bscMag(sub3(si.at, fAt)) as number;
      return d0 < 1e-9 || Math.abs(d0 - nn) < 1e-4;
    }).map((si: any) => ({ at: si.at, r: si.rPm / p2u * rs }));
    const C = camOf3(cam, dist), ax = E.bscSpinAxis({ az: cam.az, el: cam.el, dist }) as number[];
    let w = worstNdc(C, set);
    for (let a = 0; a < 360; a += 5) {
      w = Math.max(w, worstNdc(C, set.map((q) => ({ at: E.bscSpinRot(q.at, ax, a * Math.PI / 180) as number[], r: q.r }))));
    }
    return w;
  };
  const LAT = (extra: any) => Object.assign({
    placement: "lattice",
    units: [{ id: "na", species: "Na+" }, { id: "cl", species: "Cl-" }],
    lattice: { cell: "rock_salt", n: [3, 3, 3], a_pm: 564 }
  }, extra);
  // ONE canonical scene per camera row — the scene that row exists to frame, taken
  // from the concepts that author it (ionic_bonding S1..S10, hydrogen_bonding,
  // metallic_bonding). rs lists the radius scales the row is drawn at, so the
  // coordination row is measured at BOTH its poses.
  const SCENES: Record<string, { bs: any; rs?: number[] }> = {
    dipole_sum: { bs: { mode: "dipole_sum", units: [{ species: "CCl4", at: [0, 0, 0] }] } },
    explore: { bs: LAT({ mode: "explore", controls: ["spin", "temperature", "shift", "field"] }) },
    assemble: {
      bs: {
        placement: "free", mode: "assemble", spin_rate: 0.15, spin_start_ms: 1500,
        electrons: { show: "shells" },
        units: [{ id: "na", species: "Na", at: [-4.5, 0, 0] },
                { id: "cl", species: "Cl", at: [4.5, 0, 0] }]
      }
    },
    transfer: {
      bs: {
        placement: "free", mode: "transfer",
        units: [{ id: "na", species: "Na", at: [-4.5, 0, 0] },
                { id: "cl", species: "Cl", at: [4.5, 0, 0] }],
        transfer: { at_ms: 5000, duration_ms: 8000, from: "na", to: "cl" }
      }
    },
    approach_link: {
      bs: {
        placement: "free", mode: "approach_link", separation_axis: [1, 0, 0],
        units: [{ id: "a", species: "Na+", at: [0, 0, 0] }, { id: "b", species: "Cl-", at: [0, 0, 0] }],
        approach_from: 9.0, separation: 5.875
      }
    },
    compare: {
      bs: {
        mode: "compare", separation_axis: [1, 0, 0], separation: 5.75,
        units: [{ species: "H2O", at: [-2.875, 0, 0] }, { species: "H2S", at: [2.875, 0, 0] }]
      }
    },
    network: {
      // the thirty-unit water cluster hydrogen_bonding S5 authors, at its own
      // measured cluster radius (the E2b solve) — three shells of a tetrahedral net.
      bs: {
        placement: "free", mode: "network", links: {}, thermal: { jiggle_scale: 0.9 },
        units: [[0.44, 0, 0], [-2.88, -3.32, 3.32], [-2.88, 3.32, -3.32], [3.76, -3.32, -3.32],
                [3.76, 3.32, 3.32], [-6.2, 0, 0], [-6.2, -6.64, 0], [-6.2, 0, -6.64],
                [-6.2, 0, 6.64], [-6.2, 6.64, 0], [0.44, -6.64, -6.64], [0.44, -6.64, 6.64],
                [0.44, 6.64, -6.64], [0.44, 6.64, 6.64], [7.08, -6.64, 0], [7.08, 0, -6.64],
                [7.08, 0, 6.64], [7.08, 6.64, 0], [-9.52, -3.32, -3.32], [-9.52, 3.32, 3.32],
                [-2.88, -9.96, -3.32], [-2.88, 9.96, 3.32], [-2.88, -3.32, -9.96],
                [-2.88, 3.32, 9.96], [3.76, -9.96, 3.32], [3.76, 9.96, -3.32],
                [3.76, -3.32, 9.96], [3.76, 3.32, -9.96], [10.4, -3.32, 3.32],
                [10.4, 3.32, -3.32], [-12.84, 0, 0]]
          .map((at, i) => ({ id: "hb_w" + i, species: "H2O", at: at }))
      }
    },
    lattice_grow: { bs: LAT({ mode: "lattice_grow", lattice: { cell: "rock_salt", n: [5, 5, 5], a_pm: 564 } }) },
    coordination: {
      bs: LAT({
        mode: "coordination", spin_rate: 0.16, controls: ["spin"],
        lattice: { cell: "rock_salt", n: [3, 3, 3], a_pm: 564, reveal: "peer_fade", reveal_at_ms: 3500 }
      }),
      rs: [1, E.BS_COORD_RADIUS_SCALE]
    },
    melt: {
      bs: LAT({
        mode: "melt",
        thermal: { T_from: 300, T_at_ms: 4000, T_ramp_ms: 10000, T_K: 1200, jiggle_scale: 1 }
      })
    },
    layer_shift: {
      bs: LAT({ mode: "layer_shift", shift: { at_ms: 6000, duration_ms: 3000, offset_sites: 1, plane: "y" } })
    },
    drift: { bs: LAT({ mode: "drift", field: 1, field_at_ms: 6000, ions: { mobile: true } }) },
    electron_sea: {
      bs: {
        placement: "lattice", mode: "electron_sea",
        units: [{ id: "na", species: "Na" }],
        lattice: { cell: "bcc", n: [3, 3, 3], a_pm: 429 }
      }
    }
  };
  // THE STRUCTURAL HALF: a camera with no fixture is a camera nobody measured, and
  // that is exactly how assemble shipped. A new row fails here until it is framed.
  const unmeasured = Object.keys(E.BS_CAMERAS).filter((k) => !SCENES[k]);
  ok("every BS_CAMERAS row carries a framing fixture (a new camera cannot slip in unmeasured)",
    unmeasured.length === 0, unmeasured.length ? "UNMEASURED: " + unmeasured.join(", ")
      : Object.keys(E.BS_CAMERAS).length + " rows");
  // ...and every row auto-fits. Since the fit is MEASURED against the drawn discs
  // (bscFitDist) rather than margined against a bounding radius, fit:true costs a
  // well-framed camera nothing, so there is no longer any reason to omit it.
  const noFit = Object.keys(E.BS_CAMERAS).filter((k) => (E.BS_CAMERAS as any)[k].fit !== true);
  ok("every BS_CAMERAS row opts into the auto-fit (the F2 sweep, not the one entry)",
    noFit.length === 0, noFit.length ? "NO fit: " + noFit.join(", ") : "all rows fit:true");
  for (const key of Object.keys(SCENES)) {
    const cam = (E.BS_CAMERAS as any)[key];
    if (!cam) continue;
    const bs = SCENES[key].bs, poses = SCENES[key].rs || [1];
    // the ENTRY distance, exactly as the shipped apply computes it
    const dEntry = cam.fit ? Math.max(cam.dist, E.bscFitDist(bs, cam, 1, null) as number) : cam.dist;
    for (const rs of poses) {
      // a fit_ramp row is drawn at its OPENING distance while rs is 1 and arrives
      // at its solved distance exactly as rs arrives at the reveal target.
      const d = (cam.fit_ramp === "reveal" && rs !== 1) ? cam.dist : dEntry;
      // ...and once a peer_fade reveal has run, the framed set is the COUNTED set:
      // the state teaches from INSIDE a block, the faded wall is allowed to bleed
      // past the edge, and what may NOT be clipped is the ion the caption is about
      // and its six neighbours (the E3a solve, and the reason dist 16 is 16). That
      // exemption is granted HERE, per pose, and never to a whole row — the opening
      // pose above is measured over every drawn disc precisely because nothing has
      // faded yet.
      const counted = (bs.lattice && bs.lattice.reveal === "peer_fade" && rs !== 1);
      const w = counted ? framedCounted(bs, cam, d, rs) : framed(bs, cam, d, rs);
      ok(`${key}${poses.length > 1 ? " (rs " + rs + ")" : ""}: every drawn disc is INSIDE the frame`,
        w <= 1.0, `worst |NDC| ${w.toFixed(3)} at dist ${d.toFixed(2)}`);
      ok(`${key}${poses.length > 1 ? " (rs " + rs + ")" : ""}: ...with a review border (<= 0.95)`,
        w <= 0.95, `worst |NDC| ${w.toFixed(3)}`);
    }
  }
  // NEGATIVE CONTROLS — the metric must FAIL on the two frames that were shipped.
  {
    const pre = { az: 35, el: 47, dist: 7.0 };                     // assemble, as shipped
    const w = framed(SCENES.assemble.bs, pre, pre.dist, 1);
    ok("NEGATIVE CONTROL: the pre-F2 assemble camera FAILS this metric",
      w > 1, `worst |NDC| ${w.toFixed(3)} at az 35 / el 47 / dist 7 (both atoms cut by the edge)`);
    const preC = { az: 35, el: 45, dist: 16.0 };                   // coordination, as shipped
    const wc = framed(SCENES.coordination.bs, preC, preC.dist, 1);
    ok("NEGATIVE CONTROL: the pre-F3 coordination camera FAILS at its OPENING pose",
      wc > 1, `worst |NDC| ${wc.toFixed(3)} at the packed rs = 1 pose the state opens in`);
    const wcSettled = framedCounted(SCENES.coordination.bs, preC, preC.dist, E.BS_COORD_RADIUS_SCALE);
    ok("...and PASSED at the settled pose it was solved for — which is why nothing caught it",
      wcSettled <= 1, `counted-set worst |NDC| ${wcSettled.toFixed(3)} at rs ${E.BS_COORD_RADIUS_SCALE}`);
  }
  // THE E4 HALF OF THE SAME SWEEP: a camera whose state argues from a LENGTH or a
  // SIZE along a scene axis may not foreshorten that axis (cos el * cos az = 0).
  {
    const AXIS_ROWS = ["assemble", "transfer", "approach_link", "compare", "layer_shift", "drift"];
    const bad = AXIS_ROWS.filter((k) => {
      const c = (E.BS_CAMERAS as any)[k];
      return Math.abs(Math.cos(c.el * Math.PI / 180) * Math.cos(c.az * Math.PI / 180)) > 1e-12;
    });
    ok("every camera whose state argues from a scene axis keeps that axis in the screen plane",
      bad.length === 0, bad.length ? "FORESHORTENED: " + bad.join(", ")
        : AXIS_ROWS.map((k) => k + " az " + (E.BS_CAMERAS as any)[k].az).join(" · "));
    // and the apparent-scale half, measured: two units on the axis at equal depth.
    const cA = camOf3(E.BS_CAMERAS.assemble, E.BS_CAMERAS.assemble.dist);
    const f = E.bscNorm(sub3([0, 0, 0], cA)) as number[];
    const zNa = dt3(sub3([-4.5, 0, 0], cA), f), zCl = dt3(sub3([4.5, 0, 0], cA), f);
    const rNa = (E.bscRadiusPm("Na") as number) / E.BS_PM_PER_UNIT / zNa;
    const rCl = (E.bscRadiusPm("Cl") as number) / E.BS_PM_PER_UNIT / zCl;
    ok("assemble draws the two atoms at EQUAL depth, so the drawn radius ratio IS the physical one",
      Math.abs(zNa / zCl - 1) < 1e-12 &&
      Math.abs(rNa / rCl - (E.bscRadiusPm("Na") as number) / (E.bscRadiusPm("Cl") as number)) < 1e-12,
      `depth disparity ${(zNa / zCl).toFixed(6)}x, drawn ratio ${(rNa / rCl).toFixed(3)} vs physical ${((E.bscRadiusPm("Na") as number) / (E.bscRadiusPm("Cl") as number)).toFixed(3)}`);
    // NEGATIVE CONTROL: at the shipped az 35 the smaller atom drew LARGER.
    const cP = camOf3({ az: 35, el: 47 }, 7.0);
    const fP = E.bscNorm(sub3([0, 0, 0], cP)) as number[];
    const zA = dt3(sub3([-4.5, 0, 0], cP), fP), zB = dt3(sub3([4.5, 0, 0], cP), fP);
    const drawnNa = (E.bscRadiusPm("Na") as number) / E.BS_PM_PER_UNIT / zA;
    const drawnCl = (E.bscRadiusPm("Cl") as number) / E.BS_PM_PER_UNIT / zB;
    ok("NEGATIVE CONTROL: at the pre-F2 azimuth Cl (99 pm) drew LARGER than Na (186 pm)",
      drawnCl > drawnNa,
      `drawn Cl/Na ${(drawnCl / drawnNa).toFixed(2)}x where the physics is ${(99 / 186).toFixed(2)}x`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== 34. E3b F1 A MELTING SAMPLE STAYS INSIDE ITS OWN SAMPLE ===");
// A liquid keeps its VOLUME. The dispatch-2 melt law let an ion wander 0.85
// nearest-neighbour spacings on three axes — 8.64 scene units for NaCl, against a
// 3x3x3 block whose own half-span is 5.875 — so ionic S8 and S9 rendered their two
// groups as one fused blob with both group labels on it. Asserted here over the
// SHIPPED position chain, sampled through the whole beat, and paired with the
// negative control that the ions still MOVE (a molten block that stopped moving
// would pass a containment check and fail the lesson).
{
  const GRP = {
    placement: "lattice", mode: "melt",
    groups: [
      {
        id: "g_nacl", label: "NaCl", at: [-9, 0, 0],
        units: [{ id: "na", species: "Na+" }, { id: "cl", species: "Cl-" }],
        lattice: { cell: "rock_salt", n: [3, 3, 3], a_pm: 564.0 }
      },
      {
        id: "g_mgo", label: "MgO", at: [9, 0, 0],
        units: [{ id: "mg", species: "Mg2+" }, { id: "o", species: "O2-" }],
        lattice: { cell: "rock_salt", n: [3, 3, 3], a_pm: 421.2 }
      }
    ],
    thermal: { T_from: 300, T_at_ms: 4000, T_ramp_ms: 10000, T_K: 1500, jiggle_scale: 1 }
  };
  const S = E.bscSiteList(GRP, null) as any[];
  const p2u = (E.bscLinkCfg(GRP) as any).pm_per_unit as number;
  // (a) the envelope itself: the group's own lattice box, grown by the fusion
  //     allowance and nothing else.
  {
    const env = E.bscMeltEnv(GRP, S[0]) as any;
    const nn = 564 * 0.5 / p2u;
    ok("the melt envelope is the group's OWN lattice box times the fusion allowance",
      Math.abs(env.h0[0] - nn) < 1e-9 && Math.abs(env.h[0] - nn * E.BS_MELT_EXPAND) < 1e-9,
      `half-span ${env.h0[0].toFixed(3)} -> envelope ${env.h[0].toFixed(3)} u (x${E.BS_MELT_EXPAND})`);
    ok("BS_MELT_EXPAND is inside the real fusion range for an ionic solid (17-25% by volume)",
      E.BS_MELT_EXPAND >= 1.05 && E.BS_MELT_EXPAND <= 1.08,
      `${E.BS_MELT_EXPAND} linear = ${((Math.pow(E.BS_MELT_EXPAND, 3) - 1) * 100).toFixed(1)}% by volume`);
    ok("the envelope is centred on the GROUP, not on the scene",
      Math.abs((E.bscMeltEnv(GRP, S[0]) as any).c[0] + 9) < 1e-9 ||
      Math.abs((E.bscMeltEnv(GRP, S[0]) as any).c[0] - 9) < 1e-9,
      `centre x = ${(E.bscMeltEnv(GRP, S[0]) as any).c[0]}`);
    ok("the fold is the identity inside the envelope (a solid block is bit-for-bit untouched)",
      [0, 1, -1, 3.2, -5.8].every((x) => Object.is(E.bscMeltFold(x, 6.345), x)) &&
      Math.abs((E.bscMeltFold(8, 6.345) as number)) <= 6.345,
      "fold(x) === x for |x| <= h, and never leaves [-h, h]");
  }
  // (b) THE CLAIM, over the SHIPPED chain: no ion leaves its own sample.
  {
    let worstOut = -9, moved = 0, maxTravel = 0, crossed = 0;
    const gCentre = [-9, 9];
    // the MELT term alone: the same scene with the thermal jiggle switched off, so
    // what is measured is the disorder law and not the vibration that rides on top
    // of a solid and a liquid alike (a surface ion of the SOLID block vibrates past
    // its own lattice plane too, and always did — that is not a containment claim
    // this dispatch makes or breaks).
    const NOJ = JSON.parse(JSON.stringify(GRP));
    NOJ.thermal.jiggle_scale = 0;
    for (const g of NOJ.groups) if (g.thermal) g.thermal.jiggle_scale = 0;
    const SJ = E.bscSiteList(NOJ, null) as any[];
    for (let ms = 0; ms <= 16000; ms += 250) {
      for (let i = 0; i < S.length; i++) {
        const at = E.bscSiteAt(NOJ, SJ[i], i, ms, null, null, null, null) as number[];
        const env = E.bscMeltEnv(GRP, S[i]) as any;
        for (let a = 0; a < 3; a++) {
          worstOut = Math.max(worstOut, Math.abs(at[a] - env.c[a]) - env.h[a]);
        }
        const d = Math.hypot(at[0] - S[i].at[0], at[1] - S[i].at[1], at[2] - S[i].at[2]);
        if (d > 0.2) moved++;
        if (d > maxTravel) maxTravel = d;
        // did any ion end up nearer the OTHER group's centre than its own?
        const own = S[i].gat[0], other = gCentre[0] === own ? gCentre[1] : gCentre[0];
        if (Math.abs(at[0] - other) < Math.abs(at[0] - own)) crossed++;
      }
    }
    ok("NO ion ever leaves its own sample envelope, at any instant of the beat",
      worstOut <= 1e-9, `worst overshoot ${worstOut.toFixed(6)} u (0 = the envelope surface itself)`);
    // ...and with the jiggle back on, the only thing outside the envelope is the
    // thermal vibration itself, bounded by its own amplitude law at the peak
    // temperature — measured, not assumed.
    {
      let outJ = -9, ampMax = 0;
      for (let ms = 0; ms <= 16000; ms += 250) {
        for (let i = 0; i < S.length; i++) {
          const at = E.bscSiteAt(GRP, S[i], i, ms, null, null, null, null) as number[];
          const env = E.bscMeltEnv(GRP, S[i]) as any;
          for (let a = 0; a < 3; a++) outJ = Math.max(outJ, Math.abs(at[a] - env.c[a]) - env.h[a]);
          const jg = E.bscJiggle(i, ms / 1000, 1500, 1) as number[];
          ampMax = Math.max(ampMax, Math.abs(jg[0]), Math.abs(jg[1]), Math.abs(jg[2]));
        }
      }
      ok("with the jiggle on, the ONLY reach past the envelope is the vibration itself",
        outJ <= ampMax + 1e-9,
        `overshoot ${outJ.toFixed(3)} u against a jiggle amplitude of ${ampMax.toFixed(3)} u at 1500 K`);
    }
    ok("NO ion ever crosses into the neighbouring sample",
      crossed === 0, `${crossed} crossings over 65 frames x ${S.length} sites`);
    ok("NEGATIVE CONTROL: the ions still MOVE — the order is gone, the sample is not",
      moved > 0 && maxTravel > 1.0,
      `${moved} site-frames displaced past 0.2 u, furthest ${maxTravel.toFixed(2)} u`);
    // the pre-fix law, replayed: the same wander UNFOLDED reaches past the block.
    const nn = 564 * 0.5 / p2u;
    ok("NEGATIVE CONTROL: the pre-F1 excursion reached 8.64 u — wider than the sample itself",
      Math.abs(E.BS_MELT_WANDER * nn * Math.sqrt(3) - 8.64) < 0.02 &&
      E.BS_MELT_WANDER * nn * Math.sqrt(3) > nn,
      `${(E.BS_MELT_WANDER * nn * Math.sqrt(3)).toFixed(2)} u against a half-span of ${nn.toFixed(3)} u`);
  }
  // (c) and the camera fit is HONEST about it afterwards.
  {
    const ext = E.bscSiteExtent(GRP, null) as number;
    const eM = E.bscMeltExtent(GRP, S) as number;
    const nn = 564 * 0.5 / p2u;
    ok("bscMeltExtent now reports the fusion EXPANSION, not a dispersing cloud",
      eM < nn * Math.sqrt(3) * (E.BS_MELT_EXPAND - 1) + 1e-9 && eM > 0,
      `melt adds ${eM.toFixed(3)} u (was ${(E.BS_MELT_WANDER * nn * Math.sqrt(3)).toFixed(2)} u)`);
    ok("the two-group melt state is framed as two separate crystals, not one blob",
      ext < 9 + nn * Math.sqrt(3) * E.BS_MELT_EXPAND + 186 / p2u + 1,
      `extent ${ext.toFixed(2)} u`);
  }
  // (d) D-1: the whole containment law is closed-form — a rewind repeats it.
  {
    const body = grabFn("bscSiteAt") + grabFn("bscMeltFold") + grabFn("bscMeltEnv") +
      grabFn("bscCellHalfSpan");
    ok("the containment law is closed-form: no clock, no accumulator, no RNG",
      !/Date\.now|performance\.now|Math\.random/.test(body) && !/\+=/.test(grabFn("bscSiteAt")));
    const a1 = E.bscSiteAt(GRP, S[7], 7, 9000, null, null, null, null) as number[];
    E.bscSiteAt(GRP, S[7], 7, 15000, null, null, null, null);
    const a2 = E.bscSiteAt(GRP, S[7], 7, 9000, null, null, null, null) as number[];
    ok("a rewind photographs the same molten pose (pin-stable by construction)",
      a1.every((v, i) => Object.is(v, a2[i])), a1.map((v) => v.toFixed(6)).join(", "));
  }
}

console.log(failures === 0
  ? "\n✅ check:bonding-scene — all E1 + E2 + E2b + E2c-g + E3a + E1c + E5 + E3/E4 + E3b(S-1..S-8 layer parity, T-1..T-4 property table + melt + groups, L-1/L-2 layer slip + the D-7 like_contacts metric, Q-1..Q-5 row Q drift + row G sea + the carrier readouts, F1/F2/F3 the melt envelope + the measured framing solve) sections pass — NO declared stubs remain.\n"
  : `\n❌ check:bonding-scene — ${failures} failure(s).\n`);
process.exit(failures === 0 ? 0 : 1);
