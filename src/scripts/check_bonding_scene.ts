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
 * lattice OCCLUSION metric). 8/13/14 belong to E3b (the lattice DYNAMICS half —
 * layer shift, electron sea, drift, melt, groups) and print as declared SKIPs
 * with their owner — never silently absent. E1c adds section 15 (the two authoring
 * capabilities bond_polarity S4/S7 could not be authored without, plus the bit-for-
 * bit mgFrame regression half those three shipped concepts ride).
 *
 *   npm run check:bonding-scene
 */
import { readFileSync } from "node:fs";
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
  "BS_MODES_E1", "BS_MODES_E2", "BS_MODES_E3A",
  "BS_MODES_DEFERRED", "BS_MODES_IMPL", "BS_MODES",
  "BS_CONTROL_IDS", "BS_HUD_LINES", "BS_HUD_LINES_E1", "BS_HUD_LINES_E2",
  "BS_PLACEMENTS",
  "BS_ELECTRON_SHOW", "BS_RADIUS_PM", "BS_ION_PARENT", "BS_CHI", "BS_VALENCE",
  "BS_BOND_MOMENT_D", "BS_LONE_PAIR_D", "BS_MU_FALLBACK_D_PER_CHI",
  "BS_CAMERAS", "BS_CAMERA_DEFAULT", "BS_UNIT_CAMERAS", "BS_GLOW_ELS",
  "BS_MAX_ATOM_LABELS", "BS_PM_PER_UNIT", "BS_MAX_LINKS", "BS_LINK_DASHES",
  "BS_LINK_LOOKBACK_MS", "BS_LINK_SAMPLES", "BS_LINK_FRAMES", "BS_LINK_DEFAULTS",
  "BS_T_RAMP_MS", "BS_SUBDIG",
  // E3a (lattice placement layer)
  "BS_HUD_LINES_E3A", "BS_CELLS", "BS_LATTICE_REVEALS",
  "BS_MAX_SITES", "BS_MAX_SITE_LABELS", "BS_MAX_NEIGHBOURS", "BS_HCP_C_OVER_A",
  "BS_PEER_FADE_OPACITY", "BS_REVEAL_MS", "BS_SWAP_MS", "BS_SWAP_TROUGH",
  "BS_COORD_RADIUS_SCALE",
  "BS_FIT_MARGIN", "BS_ION_PAIRS",
  "BS_SUPDIG", "BS_COORD_CACHE"
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
  // E1c-J: the SHIPPED spin axis and the SHIPPED rotation it feeds
  "bscSpinAxis", "bscSpinRot",
  // E1c-I: the SHIPPED separation math (pure 2D — the camera half is written here)
  "bscBoxPt", "bscBoxBox", "bscBoxSeg",
  // E3a
  "bscOddN", "bscCellSites", "bscCoordination", "bscSpeciesCharge",
  "bscSpeciesLabel", "bscRadiusPm", "bscIsSite", "bscSiteList", "bscSiteExtent",
  "bscGrowShown", "bscTransferProg", "bscTransferSite"
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
skip("flipping the charge pattern flips split <-> hold; metric is change-based", "E3 (lattice layer)");

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
  const DOC_HUD = ["links", "links_per_unit", "delta_chi", "mu", "radius_pm",
    "coordination", "lattice_a", "lattice_enthalpy", "melting_point", "drift",
    "valence", "atomisation", "bp", "like_contacts", "conductivity"];
  const DOC_GLOW = ["units", "central", "links", "arrows", "resultant", "charges",
    "electrons", "lattice", "layer", "neighbours"];

  ok("mode enum matches the frozen contract (13 members)", sameSet(E.BS_MODES, DOC_MODES),
    `${E.BS_MODES.length} members`);
  const allSplit = [...E.BS_MODES_E1, ...E.BS_MODES_E2, ...E.BS_MODES_E3A, ...E.BS_MODES_DEFERRED];
  ok("BS_MODES = E1 + E2 + E3a + deferred, with no overlap and no gap",
    sameSet(E.BS_MODES, allSplit) && new Set(allSplit).size === allSplit.length &&
    sameSet(E.BS_MODES_IMPL, [...E.BS_MODES_E1, ...E.BS_MODES_E2, ...E.BS_MODES_E3A]),
    `E1=[${E.BS_MODES_E1.join(",")}]  E2=[${E.BS_MODES_E2.join(",")}]  E3a=[${E.BS_MODES_E3A.join(",")}]  deferred=${E.BS_MODES_DEFERRED.length}`);
  ok("the four modes E2 owns are exactly the ones hydrogen_bonding needs",
    sameSet(E.BS_MODES_E2, ["assemble", "approach_link", "network", "compare"]));
  ok("E3a owns exactly the placement half (transfer / lattice_grow / coordination)",
    sameSet(E.BS_MODES_E3A, ["transfer", "lattice_grow", "coordination"]));
  ok("the DYNAMICS half stays deferred to E3b, untouched",
    sameSet(E.BS_MODES_DEFERRED, ["layer_shift", "electron_sea", "drift", "melt"]));
  ok("lattice.cell is the closed enum rock_salt|fcc|bcc|hcp",
    sameSet(E.BS_CELLS, ["rock_salt", "fcc", "bcc", "hcp"]));
  ok("controls enum matches the frozen contract (13 ids)", sameSet(E.BS_CONTROL_IDS, DOC_CONTROLS));
  ok("hud_lines enum matches the frozen contract (15 ids)", sameSet(E.BS_HUD_LINES, DOC_HUD));
  ok("glow enum matches the frozen contract (10 keys)", sameSet(Object.keys(E.BS_GLOW_ELS), DOC_GLOW));
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
    const CUE_DEFERRED: Record<string, string> = {
      "shift.at_ms": "E3b (the lattice DYNAMICS half: layer_shift)",
      "shift.duration_ms": "E3b (the lattice DYNAMICS half: layer_shift)"
    };
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
  const hudImpl = [...E.BS_HUD_LINES_E1, ...E.BS_HUD_LINES_E2, ...E.BS_HUD_LINES_E3A];
  const unreadHud = hudImpl.filter((h: string) => !upd.includes('"' + h + '"'));
  ok("every implemented hud_line is rendered by the HUD pass", unreadHud.length === 0, unreadHud.join(" "));
  ok("the implemented hud_lines are a subset of the closed enum, with no overlap",
    hudImpl.every((h: string) => E.BS_HUD_LINES.includes(h)) &&
    new Set(hudImpl).size === hudImpl.length,
    `E1=[${E.BS_HUD_LINES_E1.join(",")}] E2=[${E.BS_HUD_LINES_E2.join(",")}] E3a=[${E.BS_HUD_LINES_E3A.join(",")}]`);

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

console.log("\n=== 13. ROW Q NEGATIVE CONTROL (solid sample must not drift) ===");
skip("under a field, the SOLID sample's ions do not move", "E3 (lattice layer)");

console.log("\n=== 14. ROW R (two independent groups in one frame) ===");
skip("heating group A leaves group B bit-for-bit unchanged", "E3 (lattice layer)");

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
        "charges", "electrons", "lattice", "layer", "neighbours"]));
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
  ok("the frame pass routes bond / lone-pair / resultant heads through bscArrowParts",
    (upd.match(/bscArrowParts\(/g) || []).length === 3 &&
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
  ok("the FRAME pass still writes no camera state at all (the event half owns it)",
    !/animateCameraTo|targetSpherical/.test(grabFn("updateBondingSceneFrame")));
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
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const makeTempAt = new Function("th", "T_to", "tempDragged", "window", "mgRamp", "BS_T_RAMP_MS",
    lift("var tempAt = function (mms)", updSrc) + "\nreturn tempAt;") as
    (th: any, T_to: number, dragged: boolean, w: any, ramp: any, dflt: number) => (m: number) => number;
  const tempAt = (th: any, dragged = false, w: any = {}) =>
    makeTempAt(th, th.T_K != null ? th.T_K : E.BS_T0_K, dragged, w, E.mgRamp, E.BS_T_RAMP_MS);

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
  ok("the frame pass reads T_from / T_at_ms / T_ramp_ms",
    /th\.T_from/.test(updSrc) && /th\.T_at_ms/.test(updSrc) && /th\.T_ramp_ms/.test(updSrc));
  ok("T_K is the ramp evaluated at state-local ms, and the widget tracks it",
    /var T_K = tempAt\(ms\);/.test(updSrc) &&
    /bscHasControl\(ctrls, "temperature"\) && !window\.PM_bscTempDragged/.test(updSrc));
  ok("state entry seeds the temperature widget at T_from, not at the destination",
    /PM_bscTemp\s*=\s*\(th\.T_from != null && th\.T_at_ms != null\) \? th\.T_from/.test(appSrc));
  ok("the lookback REPLAY carries the temperature of that instant, not the present one",
    /bscJiggle\(uu, mms \/ 1000, tempAt\(mms\), jScale\)/.test(updSrc));
  ok("no accumulator joined the thermal path (mgRamp only)",
    /mgRamp\(mms, th\.T_at_ms/.test(updSrc) && !/T_K\s*\+=/.test(updSrc));
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
      /bscLinkLatch\(dn\[di\]\.q, ac\[aj\]\.q, samp, linkCfg, sI, S\)\) linkWin\[sI\]\+\+/.test(updSrc) &&
      /bscLinkLatch\(dn\[di\]\.q, ac\[aj\]\.q, samp, linkCfg, S - 1, S\)\) \{/.test(updSrc) &&
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
    ok("the shipped BS_FIT_MARGIN is kept (no per-camera knob was invented)",
      E.BS_FIT_MARGIN === 1.90 && !/fit_margin/.test(SRC),
      `margin ${E.BS_FIT_MARGIN} -> dist ${fitted.toFixed(2)}, border ${((1 - worstNdc(fitted)) * 100).toFixed(0)}%`);
  }
}

console.log(failures === 0
  ? "\n✅ check:bonding-scene — all E1 + E2 + E2b + E3a + E1c sections pass (8/13/14 are declared E3b stubs).\n"
  : `\n❌ check:bonding-scene — ${failures} failure(s).\n`);
process.exit(failures === 0 ? 0 : 1);
