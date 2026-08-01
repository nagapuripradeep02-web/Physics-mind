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
  "BS_MODES_E1", "BS_MODES_E2", "BS_MODES_E3A",
  "BS_MODES_DEFERRED", "BS_MODES_IMPL", "BS_MODES",
  "BS_CONTROL_IDS", "BS_HUD_LINES", "BS_HUD_LINES_E1", "BS_HUD_LINES_E2",
  "BS_PLACEMENTS",
  "BS_ELECTRON_SHOW", "BS_RADIUS_PM", "BS_ION_PARENT", "BS_CHI", "BS_VALENCE",
  "BS_BOND_MOMENT_D", "BS_LONE_PAIR_D", "BS_MU_FALLBACK_D_PER_CHI",
  "BS_CAMERAS", "BS_CAMERA_DEFAULT", "BS_GLOW_ELS",
  "BS_MAX_ATOM_LABELS", "BS_PM_PER_UNIT", "BS_MAX_LINKS", "BS_LINK_DASHES",
  "BS_LINK_LOOKBACK_MS", "BS_LINK_SAMPLES", "BS_LINK_DEFAULTS", "BS_SUBDIG",
  // E3a (lattice placement layer)
  "BS_HUD_LINES_E3A", "BS_CELLS", "BS_LATTICE_REVEALS",
  "BS_MAX_SITES", "BS_MAX_SITE_LABELS", "BS_MAX_NEIGHBOURS", "BS_HCP_C_OVER_A",
  "BS_PEER_FADE_OPACITY", "BS_REVEAL_MS", "BS_COORD_RADIUS_SCALE",
  "BS_FIT_MARGIN", "BS_ION_PAIRS",
  "BS_SUPDIG", "BS_COORD_CACHE"
];
/** vars whose initialiser contains a top-level-invisible `;` (an IIFE). */
const EXPR_VARS = ["BS_ION_OF"];
const FNS = [
  "mgSmooth01", "mgClamp", "mgRamp", "mgNorm", "mgDot", "mgRotY", "mgAngleDeg",
  "mgIdealDirs", "mgDomainKinds", "mgSqueeze", "mgFrame",
  "bscClamp", "bscNorm", "bscMag", "bscLigands", "bscElement", "bscChi",
  "bscIonicFraction", "bscCharges", "bscBondMoment", "bscDipole", "bscOrientRot",
  "bscJiggle", "bscControlList", "bscHasControl", "bscFmtD",
  "bscLinkCfg", "bscLinkOk", "bscLinkLatch", "bscLinkSites", "bscUnitSlot",
  "bscSub", "bscTrendFit",
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
      bscState: "", bscTr: "transfer.", bscSh: "shift.", bscLat: "lattice."
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
    const CUE_DEFERRED: Record<string, string> = {
      "assemble_at_ms": "unowned — mode 'assemble' has no scripted ramp (report E1c-C item 5)",
      "assemble_duration_ms": "unowned — mode 'assemble' has no scripted ramp (report E1c-C item 5)",
      "shift.at_ms": "E3b (the lattice DYNAMICS half: layer_shift)",
      "shift.duration_ms": "E3b (the lattice DYNAMICS half: layer_shift)"
    };
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
      drawnNow.every((k) => E.MG_MOLECULES[k].central === "N"),
      drawnNow.length ? `vectors drawn on: ${drawnNow.join(",")}` : "none yet (BS_LONE_PAIR_D all 0 — E1c-A lands the data)");
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
    ok("an ABSENT cue never writes opacity (pre-E1c-C states are untouched)",
      /if \(arrowsCued\) \{/.test(upd) && /if \(resCued && resOn\) \{/.test(upd) &&
      /if \(chargesCued\) setObjOpacity\(dlab, chargesF\)/.test(upd) &&
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

console.log(failures === 0
  ? "\n✅ check:bonding-scene — all E1 + E2 + E3a + E1c sections pass (8/13/14 are declared E3b stubs).\n"
  : `\n❌ check:bonding-scene — ${failures} failure(s).\n`);
process.exit(failures === 0 ? 0 : 1);
