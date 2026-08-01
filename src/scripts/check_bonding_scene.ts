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
 * (and extends 10 with the mode/hud split and the row-O trend surface).
 * 2/3/7/8/13/14 belong to E3 (lattice layer) and print as declared SKIPs with
 * their owner — never silently absent.
 *
 *   npm run check:bonding-scene
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
/** The shipped bonding_scene source region, for the no-accumulator scan. */
function grabRegion(fromFn: string, toFn: string): string {
  const a = SRC.indexOf("function " + fromFn + "(");
  const b = SRC.indexOf("function " + toFn + "(");
  if (a < 0 || b < 0) throw new Error("region not found: " + fromFn + " .. " + toFn);
  return SRC.slice(a, b);
}

const VARS = [
  "MG_BOND_LEN", "MG_MAX_BONDS", "MG_MAX_LONE", "MG_AZ0", "MG_ELEMENTS",
  "MG_MOLECULES", "MG_EXPLORE_MOLECULES",
  "BS_BOND_LEN", "BS_MAX_UNITS", "BS_MAX_ATOMS", "BS_MAX_DELTA_LABELS", "BS_T0_K",
  "BS_ARROW_D_PER_UNIT", "BS_MODES_E1", "BS_MODES_E2", "BS_MODES_DEFERRED",
  "BS_MODES_IMPL", "BS_MODES",
  "BS_CONTROL_IDS", "BS_HUD_LINES", "BS_HUD_LINES_E1", "BS_HUD_LINES_E2",
  "BS_PLACEMENTS",
  "BS_ELECTRON_SHOW", "BS_RADIUS_PM", "BS_ION_PARENT", "BS_CHI", "BS_VALENCE",
  "BS_BOND_MOMENT_D", "BS_LONE_PAIR_D", "BS_MU_FALLBACK_D_PER_CHI",
  "BS_CAMERAS", "BS_CAMERA_DEFAULT", "BS_GLOW_ELS",
  "BS_MAX_ATOM_LABELS", "BS_PM_PER_UNIT", "BS_MAX_LINKS", "BS_LINK_DASHES",
  "BS_LINK_LOOKBACK_MS", "BS_LINK_SAMPLES", "BS_LINK_DEFAULTS", "BS_SUBDIG"
];
const FNS = [
  "mgSmooth01", "mgClamp", "mgRamp", "mgNorm", "mgDot", "mgRotY", "mgAngleDeg",
  "mgIdealDirs", "mgDomainKinds", "mgSqueeze", "mgFrame",
  "bscClamp", "bscNorm", "bscMag", "bscLigands", "bscElement", "bscChi",
  "bscIonicFraction", "bscCharges", "bscBondMoment", "bscDipole", "bscOrientRot",
  "bscJiggle", "bscControlList", "bscHasControl", "bscFmtD",
  "bscLinkCfg", "bscLinkOk", "bscLinkLatch", "bscLinkSites", "bscUnitSlot",
  "bscSub", "bscTrendFit"
];
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const E = new Function([
  "var window = {};",                    // bscBondMoment records fallback use here
  ...VARS.map(grabVar),
  ...FNS.map(grabFn),
  "return { " + [...VARS, ...FNS].join(", ") + ", __window: window };"
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

console.log("\n=== 2. CHARGE CONSERVATION ACROSS THE TRANSFER BEAT ===");
skip("Sigma q = 0 before and after transfer", "E3 (lattice layer)");
// The unit-level invariant E1 CAN assert: per-molecule partial charges sum to 0.
{
  const keys = ["H2O", "NH3", "NF3", "CH4", "CCl4", "CHCl3", "CO2", "HCl", "H2S"];
  const worst = Math.max(...keys.map((k) =>
    Math.abs((E.bscCharges(k) as number[]).reduce((a: number, b: number) => a + b, 0))));
  ok("every molecule's per-atom partial charges sum to 0", worst < 1e-12, `worst=${worst.toExponential(2)}`);
}

console.log("\n=== 3. IONIC RADII ON A LINEAR-IN-PM SCALE ===");
skip("post-transfer radii match the linear-pm table", "E3 (lattice layer)");
// E1 owns the TABLE, so the table itself is asserted now (doc §reuse item 4).
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

console.log("\n=== 7. LATTICE COORDINATION NUMBERS ===");
skip("rock_salt 6 / fcc 12 / bcc 8 / hcp 12", "E3 (lattice layer)");

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
  const allSplit = [...E.BS_MODES_E1, ...E.BS_MODES_E2, ...E.BS_MODES_DEFERRED];
  ok("BS_MODES = E1 + E2 + deferred, with no overlap and no gap",
    sameSet(E.BS_MODES, allSplit) && new Set(allSplit).size === allSplit.length &&
    sameSet(E.BS_MODES_IMPL, [...E.BS_MODES_E1, ...E.BS_MODES_E2]),
    `E1=[${E.BS_MODES_E1.join(",")}]  E2=[${E.BS_MODES_E2.join(",")}]  deferred=${E.BS_MODES_DEFERRED.length}`);
  ok("the four modes E2 owns are exactly the ones hydrogen_bonding needs",
    sameSet(E.BS_MODES_E2, ["assemble", "approach_link", "network", "compare"]));
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
  const leaked = E.BS_MODES_DEFERRED.filter((m: string) => upd.includes('"' + m + '"'));
  ok("no DEFERRED mode is half-implemented", leaked.length === 0, leaked.join(" "));

  // Every implemented hud line is actually rendered; all are in the closed enum.
  const hudImpl = [...E.BS_HUD_LINES_E1, ...E.BS_HUD_LINES_E2];
  const unreadHud = hudImpl.filter((h: string) => !upd.includes('"' + h + '"'));
  ok("every implemented hud_line is rendered by the HUD pass", unreadHud.length === 0, unreadHud.join(" "));
  ok("the implemented hud_lines are a subset of the closed enum, with no overlap",
    hudImpl.every((h: string) => E.BS_HUD_LINES.includes(h)) &&
    new Set(hudImpl).size === hudImpl.length,
    `E1=[${E.BS_HUD_LINES_E1.join(",")}] E2=[${E.BS_HUD_LINES_E2.join(",")}]`);

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
  const FOV = 50 * Math.PI / 180, ASPECT = 16 / 9;
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

console.log(failures === 0
  ? "\n✅ check:bonding-scene — all E1 + E2 sections pass (2/3/7/8/13/14 are declared E3 stubs).\n"
  : `\n❌ check:bonding-scene — ${failures} failure(s).\n`);
process.exit(failures === 0 ? 0 : 1);
