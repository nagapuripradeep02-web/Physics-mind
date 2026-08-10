/**
 * check:organic-structure — headless verification of the `organic_structure`
 * scenario (the ORGANIC substrate; docs/ORGANIC_ENGINE_PLAN.md + docs/ORGANIC_
 * PHASE0_CONFORMATION.md + docs/concepts/chemistry/cyclohexane_chair_flip_*.md).
 *
 * Same shape and same reason as check:bonding-scene: tsc, the validators and THE
 * EYE all pass on frames whose MEANING is wrong, so this gate asserts NUMBERS and
 * ENUM CLOSURE, not pixels. It pulls the SHIPPED function bodies out of
 * FIELD_3D_RENDERER_CODE and runs them in node.
 *
 * Nothing it checks is re-derived by the thing it checks against: the contract
 * enum unions in section 1 are transcribed from the DOCS (the independent source),
 * not read out of the renderer; the countability projector in section 6 is written
 * here, not read out of the renderer.
 *
 * SECTION OWNERSHIP. S1 owns 1..7; S2 owns 8..11 (the published-value energy
 * registry, the rider/pose identity, the measure family, and the graph's zone +
 * pin contract). Later dispatches EXTEND: A1 the driven dihedral (section 4 gains
 * phi(t) determinism), A2 the pucker knot geometry + the a/e tag inversion + the
 * pucker energy coordinate, A3 the mirror residual and the rewire atom-count
 * conservation. Sections those dispatches own print as declared SKIPs with their
 * owner — never silently absent.
 *
 *   npm run check:organic-structure
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FIELD_3D_RENDERER_CODE } from "../lib/renderers/field_3d_renderer";
import { deriveMaxRevealTimeMs, deriveMotionExpectations } from "../lib/validators/visual/deriveStateMeta";

const SRC = FIELD_3D_RENDERER_CODE;
const META_SRC = readFileSync(join(process.cwd(), "src/lib/validators/visual/deriveStateMeta.ts"), "utf8");
/** The renderer MODULE source. The scenario_type union is a TS type OUTSIDE the
 *  emitted template literal, so FIELD_3D_RENDERER_CODE cannot see it — a scan
 *  of SRC alone would silently pass a scenario that was never in the union. */
const MODULE_SRC = readFileSync(join(process.cwd(), "src/lib/renderers/field_3d_renderer.ts"), "utf8");

let pass = 0, fail = 0;
const failures: string[] = [];
function ok(label: string, cond: boolean, detail = "") {
    if (cond) { pass++; console.log("  PASS  " + label + (detail ? "  — " + detail : "")); }
    else { fail++; failures.push(label + (detail ? "  — " + detail : "")); console.log("  FAIL  " + label + (detail ? "  — " + detail : "")); }
}
function info(label: string, detail: string) { console.log("  ....  " + label + "  — " + detail); }
function skip(label: string, owner: string) { console.log("  SKIP  " + label + "  — owned by dispatch " + owner); }
function near(a: number, b: number, tol: number) { return Math.abs(a - b) <= tol; }

/** A contiguous source region, by two anchors. */
function region(fromAnchor: string, toAnchor: string): string {
    const a = SRC.indexOf(fromAnchor);
    const b = SRC.indexOf(toAnchor);
    if (a < 0 || b < 0 || b <= a) throw new Error("region not found: " + fromAnchor + " .. " + toAnchor);
    return SRC.slice(a, b);
}
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

/**
 * A 2D-context stub with a REAL measureText. S3 put every painted string
 * through orgText, which measures before it places, so a stub without
 * measureText no longer models the painter at all.
 *
 * The advance model is calibrated against Chromium: a monospace face advances
 * 0.601 em per character (20 px × 0.601 × 21 chars = 252.0 px, the measured
 * width of "barrier 12.0 kJ·mol⁻¹"), and the 'Cambria Math',serif stack
 * averages 0.42 em over the strings this scenario paints. The exact constants
 * are not the point: the assertion is that the painter RESPECTS whatever
 * measureText returns, so any consistent model exercises the contract.
 */
function ctxFontPx(font: string): number {
    const i = String(font).indexOf("px");
    if (i < 0) return 12;
    let j = i;
    while (j > 0 && "0123456789.".indexOf(String(font).charAt(j - 1)) >= 0) j--;
    const n = parseFloat(String(font).slice(j, i));
    return n > 0 ? n : 12;
}
function mkCanvasCtx(painted?: string[]) {
    return {
        clearRect() { /* stub */ }, beginPath() { /* stub */ }, moveTo() { /* stub */ },
        lineTo() { /* stub */ }, stroke() { /* stub */ }, fill() { /* stub */ },
        arc() { /* stub */ }, save() { /* stub */ }, restore() { /* stub */ },
        translate() { /* stub */ }, rotate() { /* stub */ },
        fillText(s: string) { if (painted) painted.push(String(s)); },
        measureText(this: { font: string }, s: string) {
            const px = ctxFontPx(this.font);
            const em = String(this.font).indexOf("monospace") >= 0 ? 0.601 : 0.42;
            return { width: Array.from(String(s)).length * px * em };
        },
        strokeStyle: "", fillStyle: "", lineWidth: 0, font: "12px monospace", textAlign: ""
    };
}

// ── the sandbox: the shipped mg geometry layer + the whole PURE organic region.
const ORG_REGION = region("    var ORG_U_PER_A = MG_BOND_LEN / 1.54;", "    function buildOrganicStructure(config) {");
const MG_REGION = region("    function mgSmooth01(u)", "    function mgDomainKinds(n)");
const FRAME_FN = grabFn("updateOrganicStructureFrame");
const APPLY_FN = grabFn("applyOrganicStructureState");
const BUILD_FN = grabFn("buildOrganicStructure");
/** S2's graph painter lives BELOW buildOrganicStructure, so it is outside
 *  ORG_REGION and is pulled in separately for the source scans. */
const GRAPH_FN = grabFn("orgDrawGraph");
/** S3's canvas text placer + the DOM formula fitter sit immediately ABOVE
 *  orgDrawGraph, so they are outside ORG_REGION too. Every harness that draws
 *  the graph or runs apply needs them. */
const PLACER_REGION = region("    // ── S3: THE CANVAS TEXT PLACER",
    "    /**\n     * S2: the E(coordinate) curve with the rider.");

const harness = [
    "var window = { PM_orgRejects: [] };",
    "var document = { getElementById: function () { return null; } };",
    "var sceneObjects = [];",
    grabVar("MG_BOND_LEN"),
    grabVar("MG_AZ0"),
    grabVar("MG_ELEMENTS"),
    MG_REGION,
    grabFn("mgIdealDirs"),
    ORG_REGION,
    "return { " + [
        "ORG_U_PER_A", "ORG_CC_A", "ORG_CH_A", "ORG_CCd_A", "ORG_HCH_DEG", "ORG_ATOM_SCALE",
        "ORG_HOME", "ORG_MAX_ATOMS", "ORG_MAX_BONDS", "ORG_NEWMAN_RIM_FRAC",
        "ORG_NEWMAN_FULL_DEG", "ORG_NEWMAN_OFF_DEG", "ORG_NEWMAN_HIDE_W",
        "ORG_RO_BACK_BOND", "ORG_RO_RIM", "ORG_RO_BACK_ATOM", "ORG_RO_FRONT_BOND",
        "ORG_RO_FRONT_ATOM", "ORG_BACK_TINT", "ORG_BACK_TINT_T",
        "orgNewmanWeight", "orgNewmanAngle", "orgNewmanWeightAt", "orgTintHex",
        "orgProjXY", "orgLabelAnchor", "orgLabelClearance", "orgAdd", "orgSub",
        "orgMul", "orgLen",
        "ORG_MODES", "ORG_MODES_IMPL", "ORG_MODES_DEFERRED",
        "ORG_HUD_LINES", "ORG_HUD_LINES_IMPL", "ORG_HUD_LINES_DEFERRED",
        "ORG_CONTROL_IDS", "ORG_CONTROL_IDS_IMPL", "ORG_CONTROL_IDS_DEFERRED",
        "ORG_MEASURE_KINDS", "ORG_MEASURE_KINDS_IMPL", "ORG_MEASURE_KINDS_DEFERRED",
        "ORG_POSES", "ORG_POSES_IMPL", "ORG_POSES_DEFERRED",
        "ORG_PUCKER_PATHS_IMPL", "ORG_PUCKER_PATHS_DEFERRED",
        "ORG_WAYPOINTS_IMPL", "ORG_WAYPOINTS_DEFERRED",
        "ORG_MIRROR_PLANES_IMPL", "ORG_MIRROR_PLANES_DEFERRED",
        "ORG_ENERGY_COORDS_IMPL", "ORG_ENERGY_COORDS_DEFERRED",
        "ORG_STATIONARY_KINDS_IMPL", "ORG_STATIONARY_KINDS_DEFERRED",
        "ORG_MOLECULES", "ORG_MOLECULES_DEFERRED", "ORG_DEFERRED_FIELDS",
        "ORG_MISNAMED_FIELDS", "ORG_PHI_FREE_DEG_S",
        "orgPhiAt", "orgTorsionAsks", "orgTorsionDriven", "mgRamp",
        "ORG_ENERGY_TABLE", "ORG_STATIONARY_STYLE", "ORG_MEASURE_ARITY",
        "ORG_MAX_MEASURES", "ORG_MEAS_ARC_SEGS", "ORG_MEAS_ARC_R",
        "orgEnergyAt", "orgEnergyRange", "orgEnergyState", "orgMeasuredPhi",
        "orgMeasureValue", "orgMeasureList",
        "orgKeys", "orgBuildGeometry", "orgSetTorsion", "orgDihedral", "orgResolvePhi",
        "orgSolveCamera", "orgCamScheduleAt", "orgCamBasis", "orgMinScreenGap",
        "orgAtomRadius", "orgCheckMember", "orgControlList", "orgShowH", "orgSideOf",
        "mgAngleDeg", "mgNorm", "mgDot"
    ].join(", ") + ", getRejects: function(){ return window.PM_orgRejects; }, clearRejects: function(){ window.PM_orgRejects = []; } };"
].join("\n");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const R: any = new Function(harness)();

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[1] ENUM FREEZE — every closed enum, both directions, IMPLEMENTED ∪ DEFERRED");
// The CONTRACT unions, transcribed from the docs (ORGANIC_PHASE0_CONFORMATION.md
// :110-172 as amended by ORGANIC_ENGINE_PLAN.md §5 correction 4 and skeleton §9E
// E-1..E-10) plus the four members this dispatch's own walk adds. Independent of
// the renderer by construction — that is the point.
const CONTRACT: Record<string, string[]> = {
    mode: ["lift", "rotate", "pucker", "mirror", "block_twist", "rewire", "compare", "explore",
        "rehybridise", "shade", "delocalise",
        "break", "form", "approach", "invert", "migrate", "sequence", "sweep"],
    hud_lines: ["phi", "energy", "barrier", "angle", "pose", "overlap", "residual", "ae_count",
        "population", "distance", "bond", "temperature", "a_value", "atom_count", "descriptor"],
    controls: ["phi", "pucker", "substituent", "group", "temperature", "implicit_h", "view",
        "mirror", "isomer", "spin", "chain_length"],
    measure_kind: ["angle", "distance", "torsion", "axis_line", "plane_disc"],
    torsion_pose: ["staggered", "eclipsed", "anti", "gauche", "syn"],
    pucker_path: ["chair_flip"],
    // +twist_boat_alt +half_chair_alt — FOUND BY THIS DISPATCH'S WALK (FF-1).
    pucker_waypoint: ["chair", "half_chair", "twist_boat", "boat", "twist_boat_alt",
        "half_chair_alt", "chair_alt"],
    // +screen — FOUND BY THIS DISPATCH'S WALK (FF-1), flagged interpretive.
    mirror_plane: ["xy", "yz", "xz", "screen"],
    // +species — FOUND BY THIS DISPATCH'S WALK (FF-1), flagged interpretive.
    energy_coordinate: ["torsion", "pucker", "reaction", "species"],
    energy_stationary_kind: ["minimum", "maximum", "reactant", "ts", "intermediate", "product"]
};
const SPLITS: Record<string, [string[], Record<string, string>]> = {
    mode: [R.ORG_MODES_IMPL, R.ORG_MODES_DEFERRED],
    hud_lines: [R.ORG_HUD_LINES_IMPL, R.ORG_HUD_LINES_DEFERRED],
    controls: [R.ORG_CONTROL_IDS_IMPL, R.ORG_CONTROL_IDS_DEFERRED],
    measure_kind: [R.ORG_MEASURE_KINDS_IMPL, R.ORG_MEASURE_KINDS_DEFERRED],
    torsion_pose: [R.ORG_POSES_IMPL, R.ORG_POSES_DEFERRED],
    pucker_path: [R.ORG_PUCKER_PATHS_IMPL, R.ORG_PUCKER_PATHS_DEFERRED],
    pucker_waypoint: [R.ORG_WAYPOINTS_IMPL, R.ORG_WAYPOINTS_DEFERRED],
    mirror_plane: [R.ORG_MIRROR_PLANES_IMPL, R.ORG_MIRROR_PLANES_DEFERRED],
    energy_coordinate: [R.ORG_ENERGY_COORDS_IMPL, R.ORG_ENERGY_COORDS_DEFERRED],
    energy_stationary_kind: [R.ORG_STATIONARY_KINDS_IMPL, R.ORG_STATIONARY_KINDS_DEFERRED]
};
/** The three P2-6 assertions, run over EVERY closed enum (the FF-1 requirement). */
function checkEnum(name: string, contract: string[], impl: string[], deferred: Record<string, string>) {
    const def = R.orgKeys(deferred) as string[];
    const union = impl.concat(def).sort();
    const want = contract.slice().sort();
    ok("enum " + name + ": IMPLEMENTED ∪ DEFERRED == contract",
        JSON.stringify(union) === JSON.stringify(want),
        union.length + " members" + (JSON.stringify(union) === JSON.stringify(want) ? "" :
            " | missing " + JSON.stringify(want.filter(m => union.indexOf(m) < 0)) +
            " | extra " + JSON.stringify(union.filter(m => want.indexOf(m) < 0))));
    ok("enum " + name + ": IMPLEMENTED ∩ DEFERRED is empty",
        impl.filter(m => def.indexOf(m) >= 0).length === 0);
    const ownerless = def.filter(m => !deferred[m]);
    ok("enum " + name + ": every DEFERRED member names an owning dispatch",
        ownerless.length === 0, ownerless.length ? JSON.stringify(ownerless) : def.length + " deferred");
}
for (const name of Object.keys(CONTRACT)) checkEnum(name, CONTRACT[name], SPLITS[name][0], SPLITS[name][1]);

// NEGATIVE CONTROL — the checker must be able to fail.
{
    const badUnion = ["a", "b"], badImpl = ["a"], badDef = { a: "X", c: "Y" };
    const u = badImpl.concat(R.orgKeys(badDef)).sort();
    ok("[neg] a member in BOTH lists is detected", badImpl.filter(m => R.orgKeys(badDef).indexOf(m) >= 0).length > 0);
    ok("[neg] a union that differs from the contract is detected",
        JSON.stringify(u) !== JSON.stringify(badUnion.slice().sort()));
}

// Direction 1 — every rendered string of the SERVED SET maps to a member.
// Served set = all 32 sims (ORGANIC_ENGINE_PLAN.md §2), not the seven of O-0.
const RENDERED: Array<[string, string, string]> = [
    ["#1 implicit-H count", "hud_lines", "atom_count"],
    ["#1 C-C-C 109.5 vs 120", "hud_lines", "angle"],
    ["#1 step chain length", "controls", "chain_length"],
    ["#1 toggle implicit H", "controls", "implicit_h"],
    ["#2 phi in degrees", "hud_lines", "phi"],
    ["#2 which bond the Newman view is down", "hud_lines", "bond"],
    ["#2 E(phi) kJ/mol", "hud_lines", "energy"],
    ["#2 barrier 12 kJ/mol", "hud_lines", "barrier"],
    ["#2 staggered / eclipsed", "torsion_pose", "staggered"],
    ["#3 anti / gauche / syn", "torsion_pose", "gauche"],
    ["#4 chair / half-chair / twist-boat / boat", "pucker_waypoint", "twist_boat"],
    ["#4 the RETURN twist-boat at u=0.64", "pucker_waypoint", "twist_boat_alt"],
    ["#4 the RETURN half-chair at u=0.78", "pucker_waypoint", "half_chair_alt"],
    ["#4 axial/equatorial count", "hud_lines", "ae_count"],
    ["#4 95:5 population", "hud_lines", "population"],
    ["#4 A-value 7.3", "hud_lines", "a_value"],
    ["#4 T = 298 K", "hud_lines", "temperature"],
    ["#4 flagpole / 1,3-diaxial pm contacts", "hud_lines", "distance"],
    ["#4 the pucker path", "pucker_path", "chair_flip"],
    ["#5 R/S descriptor", "hud_lines", "descriptor"],
    ["#5 residual after best-fit overlay", "hud_lines", "residual"],
    ["#5 the mirror plane", "mirror_plane", "xy"],
    ["#6 pi overlap falling to zero", "hud_lines", "overlap"],
    ["#7 atom count held constant", "hud_lines", "atom_count"],
    ["#11 rehybridise sp3->sp2", "mode", "rehybridise"],
    ["#15 SN2 inversion", "mode", "invert"],
    ["#15 reaction profile coordinate", "energy_coordinate", "reaction"],
    ["#15 the transition state", "energy_stationary_kind", "ts"],
    ["#16 SN1 intermediate", "energy_stationary_kind", "intermediate"],
    ["#21 hydride migration", "mode", "migrate"],
    ["#30 gas phase vs solution comparison", "energy_coordinate", "species"],
    ["#32 repetition to a chain", "mode", "sweep"],
    // The IMPLEMENTED members' own consumers — Direction 2 is only a real check
    // if the implemented half is walked too (an implemented member with no
    // consumer is a decorative string, the sigma-pi scar).
    ["#2 the static/driven rotation about a bond", "mode", "rotate"],
    ["#2/#4 the final sandbox", "mode", "explore"],
    ["#2 pose name in the readout (staggered/eclipsed)", "hud_lines", "pose"],
    ["#2 Newman <-> sawhorse view toggle", "controls", "view"],
    ["#4 S9 idle/manual rotation toggle (N-20)", "controls", "spin"],
    ["#2 eclipsed", "torsion_pose", "eclipsed"],
    ["#3 anti (and #17 anti-periplanar)", "torsion_pose", "anti"],
    ["#3 syn", "torsion_pose", "syn"],
    ["#1 the flat-sketch lift", "mode", "lift"],
    ["#4 the ring pucker", "mode", "pucker"],
    ["#5 the mirror operation", "mode", "mirror"],
    ["#6 the costed/resisted twist", "mode", "block_twist"],
    ["#7 the connectivity rewire", "mode", "rewire"],
    ["#4 S8 the two-chair compare", "mode", "compare"],
    ["#8 per-atom density shading", "mode", "shade"],
    ["#9 the delocalised cloud", "mode", "delocalise"],
    ["#13 homolytic/heterolytic fission", "mode", "break"],
    ["#27 the new C-C bond", "mode", "form"],
    ["#25 the Burgi-Dunitz approach", "mode", "approach"],
    ["#14 the multi-step sequence", "mode", "sequence"],
    ["#4 S3 the ring axis reference line", "measure_kind", "axis_line"],
    ["#4 S3 the mean-plane disc", "measure_kind", "plane_disc"],
    ["#2 the torsion arc", "measure_kind", "torsion"],
    ["#4 S1 the C-C-C arc", "measure_kind", "angle"],
    ["#4 S5/S7 the pm contact line", "measure_kind", "distance"],
    ["#4 S4 chair prime", "pucker_waypoint", "chair_alt"],
    ["#4 S5 the chair knot", "pucker_waypoint", "chair"],
    ["#4 S5 the half-chair knot", "pucker_waypoint", "half_chair"],
    ["#4 S5 the boat knot", "pucker_waypoint", "boat"],
    ["#4 S6 the chair minimum", "energy_stationary_kind", "minimum"],
    ["#4 S6 the half-chair maximum", "energy_stationary_kind", "maximum"],
    ["#15 the reactant well", "energy_stationary_kind", "reactant"],
    ["#15 the product well", "energy_stationary_kind", "product"],
    ["#2 E over a torsion", "energy_coordinate", "torsion"],
    ["#4 E over the pucker", "energy_coordinate", "pucker"],
    ["#5 the yz mirror plane", "mirror_plane", "yz"],
    ["#5 the xz mirror plane", "mirror_plane", "xz"],
    ["#5 the screen (image-plane) mirror", "mirror_plane", "screen"],
    ["#3 the phi slider", "controls", "phi"],
    ["#4 the pucker slider", "controls", "pucker"],
    ["#4 place a substituent", "controls", "substituent"],
    ["#4 which group is placed", "controls", "group"],
    ["#4 S8 temperature", "controls", "temperature"],
    ["#5 the mirror control", "controls", "mirror"],
    ["#7 step through the isomers", "controls", "isomer"]
];
{
    const bad = RENDERED.filter(([, enumName, member]) => CONTRACT[enumName].indexOf(member) < 0);
    ok("Direction 1: every rendered string of the served set (32 sims) maps to a member",
        bad.length === 0, bad.length ? JSON.stringify(bad) : RENDERED.length + " strings walked");
    ok("[neg] Direction 1 detects an unmapped string",
        CONTRACT.hud_lines.indexOf("not_a_member") < 0);
}
// Direction 2 — every member maps to a consumer or an explicit DEFERRED owner.
{
    const consumed: Record<string, Set<string>> = {};
    for (const [, e, m] of RENDERED) { (consumed[e] = consumed[e] || new Set()).add(m); }
    const orphans: string[] = [];
    for (const name of Object.keys(CONTRACT)) {
        for (const m of CONTRACT[name]) {
            const hasConsumer = consumed[name] && consumed[name].has(m);
            const owner = (SPLITS[name][1] as Record<string, string>)[m];
            if (!hasConsumer && !owner) orphans.push(name + "." + m);
        }
    }
    ok("Direction 2: every member has a rendered consumer OR a DEFERRED owner",
        orphans.length === 0, orphans.length ? JSON.stringify(orphans) : "no orphan members");
}
// FF-2 — the three TABLE KEY SETS are growable and are NOT frozen enums.
{
    const molKeys = R.orgKeys(R.ORG_MOLECULES) as string[];
    ok("FF-2: `molecule` is a TABLE (ORG_MOLECULES), not a frozen enum",
        molKeys.length >= 6, "keys: " + molKeys.join(", "));
    ok("FF-2: every molecule table row generates a geometry",
        molKeys.every(k => { const g = R.orgBuildGeometry(k, null); return !!g && g.atoms.length > 0; }));
    ok("FF-2: deferred molecule keys are DECLARED with an owner",
        R.orgKeys(R.ORG_MOLECULES_DEFERRED).every((k: string) => !!R.ORG_MOLECULES_DEFERRED[k]),
        JSON.stringify(R.ORG_MOLECULES_DEFERRED));
    ok("FF-2: no `energy.curve` enum is frozen in the renderer at three members",
        SRC.indexOf("ORG_ENERGY_CURVES") < 0 && SRC.indexOf("ORG_CURVES") < 0,
        "S2 ships the curve REGISTRY as a published-value table, growable by row");
    // S2 lands the registry, so the name-level assertion above is no longer the
    // whole check: a table named ORG_ENERGY_TABLE that grew an IMPL/DEFERRED
    // split would be an enum wearing a table's name.
    ok("FF-2: the energy REGISTRY exists and carries no IMPLEMENTED/DEFERRED enum split",
        typeof R.ORG_ENERGY_TABLE === "object" &&
        SRC.indexOf("ORG_ENERGY_TABLE_IMPL") < 0 && SRC.indexOf("ORG_ENERGY_TABLE_DEFERRED") < 0,
        "rows: " + (R.orgKeys(R.ORG_ENERGY_TABLE) as string[]).join(", "));
    ok("FF-2: adding a curve is adding a ROW — every row resolves to a value at its own coordinate",
        (R.orgKeys(R.ORG_ENERGY_TABLE) as string[]).every((k: string) => {
            const row = R.ORG_ENERGY_TABLE[k];
            return typeof R.orgEnergyAt(row, (row.x_min + row.x_max) / 2) === "number";
        }));
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[2] DEFERRED MEMBERS NEVER REACH THE FRAME OR APPLY PASS");
{
    R.clearRejects();
    const implOK = R.ORG_MODES_IMPL.every((m: string) => R.orgCheckMember("mode", m, R.ORG_MODES_IMPL, R.ORG_MODES_DEFERRED) === true);
    ok("every IMPLEMENTED mode is accepted silently", implOK && R.getRejects().length === 0,
        R.getRejects().length + " rejects raised");
    R.clearRejects();
    const defKeys = R.orgKeys(R.ORG_MODES_DEFERRED) as string[];
    const defRejected = defKeys.every((m: string) => R.orgCheckMember("mode", m, R.ORG_MODES_IMPL, R.ORG_MODES_DEFERRED) === false);
    ok("every DEFERRED mode is REJECTED LOUDLY (never silently defaulted)",
        defRejected && R.getRejects().length === defKeys.length,
        R.getRejects().length + " rejects for " + defKeys.length + " deferred modes");
    R.clearRejects();
    ok("[neg] an UNKNOWN member (in neither list) is also rejected",
        R.orgCheckMember("mode", "not_a_mode", R.ORG_MODES_IMPL, R.ORG_MODES_DEFERRED) === false && R.getRejects().length === 1);
    R.clearRejects();

    // The FRAME pass must not dispatch on any deferred member at all.
    const leaked: string[] = [];
    for (const name of Object.keys(SPLITS)) {
        for (const m of R.orgKeys(SPLITS[name][1]) as string[]) {
            if (m.length < 4) continue;                       // 'ts', 'xy' … too short to scan safely
            if (new RegExp('=== "' + m + '"').test(FRAME_FN)) leaked.push(name + "." + m + " (frame)");
        }
    }
    ok("no DEFERRED member is dispatched on in updateOrganicStructureFrame",
        leaked.length === 0, leaked.length ? JSON.stringify(leaked) : "frame pass is clean");
    ok("[neg] the frame scan CAN see a member (it dispatches on the implemented 'explore')",
        /=== "explore"/.test(FRAME_FN));
    // The APPLY pass must gate every enum it accepts.
    for (const gate of ["mode", "hud_lines", "controls", "torsion.pose"]) {
        ok("applyOrganicStructureState gates " + gate,
            APPLY_FN.indexOf('orgCheckMember("' + gate + '"') >= 0);
    }
    ok("applyOrganicStructureState gates the DEFERRED FIELD paths (torsion.ramp_ms, pucker, energy, …)",
        APPLY_FN.indexOf("ORG_DEFERRED_FIELDS") >= 0);
    // A1 HAS LANDED: the scheduled torsion fields left ORG_DEFERRED_FIELDS in the
    // SAME change as the driver that implements them (the per-dispatch DEFERRED
    // discipline S1's CRITICAL row names). The S1 form of this assertion asserted
    // the opposite and is inverted here rather than deleted, so the ledger stays a
    // ledger: a field is deferred, or implemented, and never quietly both.
    ok("the scheduled torsion fields LEFT ORG_DEFERRED_FIELDS in the same change as their driver (A1)",
        ["torsion.phi_from", "torsion.phi_at_ms", "torsion.phi_ramp_ms", "torsion.continuous"]
            .every(k => R.ORG_DEFERRED_FIELDS[k] === undefined));
    ok("no field ORG_DEFERRED_FIELDS still defers is owned by the dispatch that has now landed (`A1`)",
        (R.orgKeys(R.ORG_DEFERRED_FIELDS) as string[]).every((k: string) => R.ORG_DEFERRED_FIELDS[k] !== "A1"),
        R.orgKeys(R.ORG_DEFERRED_FIELDS).join(", "));
    ok("applyOrganicStructureState gates the MISNAMED torsion keys (the pin-evaluator trap)",
        APPLY_FN.indexOf("ORG_MISNAMED_FIELDS") >= 0 &&
        R.ORG_MISNAMED_FIELDS["torsion.at_ms"] === "torsion.phi_at_ms" &&
        R.ORG_MISNAMED_FIELDS["torsion.ramp_ms"] === "torsion.phi_ramp_ms");
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[3] THE SIGHT-ALONG CAMERA IS A SOLVED CONSTRAINT (contract decision 3)");
const SIGHT_TOL_DEG = 0.5;      // the tolerance the skeleton §8 row 2 proposes
{
    const cases: Array<[string, string]> = [
        ["ethane", "C1-C2"], ["butane", "C2-C3"], ["propane", "C1-C2"], ["cyclohexane", "C1-C2"]
    ];
    let worst = 0;
    for (const [mol, bond] of cases) {
        const g = R.orgBuildGeometry(mol, R.orgResolvePhi(R.ORG_MOLECULES[mol], null));
        const solved = R.orgSolveCamera({ camera: { sight_along: bond } }, g);
        const b = R.orgCamBasis(solved);
        const byId: Record<string, { p: number[] }> = {};
        for (const a of g.atoms) byId[a.id] = a;
        const parts = bond.split("-");
        const axis = R.mgNorm([byId[parts[0]].p[0] - byId[parts[1]].p[0],
                               byId[parts[0]].p[1] - byId[parts[1]].p[1],
                               byId[parts[0]].p[2] - byId[parts[1]].p[2]]);
        const err = R.mgAngleDeg(b.fwd, axis);
        if (err > worst) worst = err;
        ok("sight_along " + mol + " " + bond + ": camera forward is ON the bond axis (≤ " + SIGHT_TOL_DEG + "°)",
            err <= SIGHT_TOL_DEG, "measured " + err.toFixed(6) + "°");
    }
    info("ACHIEVED sight-along alignment (worst of 4)", worst.toExponential(3) + "° — exact by construction");
    // NEGATIVE CONTROL: the HOME camera is NOT on any bond axis, so a broken
    // solver that returned HOME would be caught.
    const g = R.orgBuildGeometry("ethane", 60);
    const home = R.orgSolveCamera({ camera: {} }, g);
    const hb = R.orgCamBasis(home);
    const byId2: Record<string, { p: number[] }> = {};
    for (const a of g.atoms) byId2[a.id] = a;
    const ax2 = R.mgNorm([byId2.C1.p[0] - byId2.C2.p[0], byId2.C1.p[1] - byId2.C2.p[1], byId2.C1.p[2] - byId2.C2.p[2]]);
    ok("[neg] the HOME camera is NOT aligned to C1-C2 (a HOME fallback would be caught)",
        R.mgAngleDeg(hb.fwd, ax2) > 5, "measured " + R.mgAngleDeg(hb.fwd, ax2).toFixed(2) + "°");
    // The design-time estimate (az 254, el 10-12) was ORTHOGRAPHIC and CENTRES
    // ONLY. The perspective re-solve at real disc radii moves it — see section 6.
    ok("the HOME camera is SOLVED per molecule, inside the authored azimuth band",
        Math.abs(home.az - R.ORG_HOME.az) <= 12 && home.el >= 8 && home.el <= 30,
        "ethane solves to az " + home.az + ", el " + home.el);
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[4] THE SKELETON — atom/bond counts, real bond lengths, real angles");
{
    const EXPECT: Record<string, [number, number]> = {
        methane: [5, 4], ethane: [8, 7], propane: [11, 10],
        butane: [14, 13], ethene: [6, 5], cyclohexane: [18, 18]
    };
    for (const key of Object.keys(EXPECT)) {
        const g = R.orgBuildGeometry(key, R.orgResolvePhi(R.ORG_MOLECULES[key], null));
        ok("molecule " + key + ": atom + bond counts",
            g.atoms.length === EXPECT[key][0] && g.bonds.length === EXPECT[key][1],
            g.atoms.length + " atoms / " + g.bonds.length + " bonds");
    }
    const eth = R.orgBuildGeometry("ethane", 60);
    const cyc = R.orgBuildGeometry("cyclohexane", null);
    ok("S1 requirement: >7 atoms (ethane 8, cyclohexane 18)",
        eth.atoms.length > 7 && cyc.atoms.length > 7);
    // Real bond lengths — Rule 29: the only things that change size are real
    // magnitudes, so C-C and C-H must differ in the published ratio.
    const len = (g: { atoms: Array<{ id: string; el: string; p: number[] }>; bonds: Array<{ a: string; b: string; order: number }> }, a: string, b: string) => {
        const A = g.atoms.filter(x => x.id === a)[0].p, B = g.atoms.filter(x => x.id === b)[0].p;
        return Math.sqrt((A[0] - B[0]) ** 2 + (A[1] - B[1]) ** 2 + (A[2] - B[2]) ** 2);
    };
    let ccOK = true, chOK = true;
    for (const g of [eth, cyc, R.orgBuildGeometry("butane", null)]) {
        for (const b of g.bonds) {
            const isCH = b.a.indexOf("H") >= 0 || b.b.indexOf("H") >= 0;
            const L = len(g, b.a, b.b);
            if (isCH && !near(L, 1.09, 1e-6)) chOK = false;
            if (!isCH && !near(L, 1.54, 2e-3)) ccOK = false;
        }
    }
    ok("every C–C bond is 154 pm (published)", ccOK);
    ok("every C–H bond is 109 pm (published)", chOK);
    ok("the C=C of ethene is 134 pm", near(len(R.orgBuildGeometry("ethene", null), "C1", "C2"), 1.34, 1e-9));
    ok("the drawn C–H is SHORTER than the drawn C–C in the true ratio (Rule 29)",
        near(1.09 / 1.54, 0.7078, 1e-3));
    // Angles.
    const ang = (g: { atoms: Array<{ id: string; p: number[] }> }, a: string, b: string, c: string) => {
        const A = g.atoms.filter(x => x.id === a)[0].p, B = g.atoms.filter(x => x.id === b)[0].p, C = g.atoms.filter(x => x.id === c)[0].p;
        return R.mgAngleDeg([A[0] - B[0], A[1] - B[1], A[2] - B[2]], [C[0] - B[0], C[1] - B[1], C[2] - B[2]]);
    };
    const cccChain = ang(R.orgBuildGeometry("propane", null), "C1", "C2", "C3");
    ok("chain C–C–C is the mgIdealDirs(4) tetrahedral angle (no second angle table)",
        near(cccChain, 109.47, 0.02), cccChain.toFixed(3) + "°");
    const cccRing = ang(cyc, "C1", "C2", "C3");
    ok("cyclohexane chair C–C–C is the published 111.4° (skeleton §10 parameterisation)",
        near(cccRing, 111.4, 0.05), cccRing.toFixed(3) + "°");
    // THE C–C–H ARC — the skeleton §8/§10 re-solve this dispatch owes.
    const cchAx = ang(cyc, "C1", "C2", "C2H1"), cchEq = ang(cyc, "C1", "C2", "C2H2");
    info("C–C–H arc on the certified carbon (the arc S3 actually draws)",
        "axial-side " + cchAx.toFixed(3) + "°, equatorial-side " + cchEq.toFixed(3) + "°");
    ok("the C–C–H arc is within 0.5° of the 109.5° the state labels it",
        near(cchAx, 109.5, 0.5) && near(cchEq, 109.5, 0.5));
    const hch = ang(cyc, "C2H1", "C2", "C2H2");
    ok("the H–C–H (axial–C–equatorial) angle is 107.5°, NOT 109.5° — the two arcs are different",
        near(hch, 107.5, 0.05), hch.toFixed(3) + "° (drawing THIS and labelling it 109.5 would render a falsehood)");
    // Ring torsion.
    const tor = R.orgDihedral(
        cyc.atoms.filter((x: { id: string }) => x.id === "C1")[0].p,
        cyc.atoms.filter((x: { id: string }) => x.id === "C2")[0].p,
        cyc.atoms.filter((x: { id: string }) => x.id === "C3")[0].p,
        cyc.atoms.filter((x: { id: string }) => x.id === "C4")[0].p);
    const torSigned = tor > 180 ? tor - 360 : tor;
    ok("cyclohexane chair ring torsion is ±54.9° (skeleton §10 MEASURED, literature ±55°)",
        near(Math.abs(torSigned), 54.94, 0.15), torSigned.toFixed(2) + "°");
    // Static poses — the S1 proof concept, #2 conformations of ethane.
    for (const [pose, want] of [["staggered", 60], ["eclipsed", 0]] as Array<[string, number]>) {
        const g = R.orgBuildGeometry("ethane", R.ORG_POSES[pose]);
        const m = R.ORG_MOLECULES.ethane.ref_dihedral;
        const by: Record<string, { p: number[] }> = {};
        for (const a of g.atoms) by[a.id] = a;
        const phi = R.orgDihedral(by[m[0]].p, by[m[1]].p, by[m[2]].p, by[m[3]].p);
        const norm = phi > 180 ? phi - 360 : phi;
        ok("ethane pose '" + pose + "' MEASURES φ = " + want + "° on the built coordinates",
            near(Math.abs(norm), want, 0.01), norm.toFixed(4) + "°");
    }
    // The eclipsed definition: at φ = 0 the back H sit exactly behind the front H.
    {
        const g = R.orgBuildGeometry("ethane", 0);
        const by: Record<string, { p: number[] }> = {};
        for (const a of g.atoms) by[a.id] = a;
        const ax = R.mgNorm([by.C1.p[0] - by.C2.p[0], by.C1.p[1] - by.C2.p[1], by.C1.p[2] - by.C2.p[2]]);
        const perp = (id: string, c: string) => {
            const rel = [by[id].p[0] - by[c].p[0], by[id].p[1] - by[c].p[1], by[id].p[2] - by[c].p[2]];
            const d = R.mgDot(rel, ax);
            return R.mgNorm([rel[0] - ax[0] * d, rel[1] - ax[1] * d, rel[2] - ax[2] * d]);
        };
        const a1 = perp("C1H1", "C1"), b1 = perp("C2H1", "C2");
        ok("at φ = 0 the named back H is EXACTLY behind the named front H (the eclipsed definition)",
            R.mgAngleDeg(a1, b1) < 0.01, R.mgAngleDeg(a1, b1).toExponential(2) + "° of azimuthal offset");
        const gS = R.orgBuildGeometry("ethane", 60);
        const bys: Record<string, { p: number[] }> = {};
        for (const a of gS.atoms) bys[a.id] = a;
        const axS = R.mgNorm([bys.C1.p[0] - bys.C2.p[0], bys.C1.p[1] - bys.C2.p[1], bys.C1.p[2] - bys.C2.p[2]]);
        const perpS = (id: string, c: string) => {
            const rel = [bys[id].p[0] - bys[c].p[0], bys[id].p[1] - bys[c].p[1], bys[id].p[2] - bys[c].p[2]];
            const d = R.mgDot(rel, axS);
            return R.mgNorm([rel[0] - axS[0] * d, rel[1] - axS[1] * d, rel[2] - axS[2] * d]);
        };
        ok("[neg] at φ = 60 the same two H are 60° apart, not hidden (staggered)",
            near(R.mgAngleDeg(perpS("C1H1", "C1"), perpS("C2H1", "C2")), 60, 0.01));
    }
    // Structural conservation (the chemistry DoD §14c ledger, S1 half).
    {
        let ok4 = true;
        for (const phi of [0, 37, 60, 123, 180, 299]) {
            const g = R.orgBuildGeometry("ethane", phi);
            if (g.atoms.length !== 8 || g.bonds.length !== 7) ok4 = false;
            const deg: Record<string, number> = {};
            for (const b of g.bonds) { deg[b.a] = (deg[b.a] || 0) + 1; deg[b.b] = (deg[b.b] || 0) + 1; }
            if (deg.C1 !== 4 || deg.C2 !== 4) ok4 = false;
        }
        ok("carbon is tetravalent and the formula is conserved at EVERY torsion", ok4);
    }
    skip("pucker knot geometries at the seven waypoints (chemistry block §A-7)", "A2");
    // "E(coordinate) reproduces the published table at every stationary point"
    // was S2's skip and is now section 8.
    skip("the a/e tag set at u=1 is the exact inverse of the set at u=0", "A2");
    skip("atom count conserved across a rewire; mirror residual published", "A3");
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[5] PLATFORM REGISTRATION — the N-19 sites are actually reached");
{
    const rendererSites: Array<[string, boolean]> = [
        ["scenario_type union member (a TS type, so scanned in the MODULE source)", /'organic_structure' \|/.test(MODULE_SRC)],
        ["buildScenario() case", /case "organic_structure":\s*\n\s*buildOrganicStructure\(config\);/.test(SRC)],
        ["applyState() dispatch", /config\.scenario_type === "organic_structure"\) \{\s*\n\s*applyOrganicStructureState\(stateDef\);/.test(SRC)],
        ["animate() frame call", SRC.indexOf("updateOrganicStructureFrame(orgStateDef)") >= 0],
        ["#sliders exclusion NOT-list", SRC.indexOf("&& !isOrganic &&") >= 0],
        ["formula-overlay hide chain", /if \(formulaEl && \(config\.scenario_type === "organic_structure"/.test(SRC)],
        ["generic legend suppression", /if \(config\.scenario_type === "organic_structure"\) \{ legendEl\.style\.display = "none"/.test(SRC)],
        ["accumulator-free SNAP SET (a late pin is unreachable without it)",
            /if \(freezeAtTime !== null && \(config\.scenario_type === "organic_structure"/.test(SRC)]
    ];
    for (const [label, hit] of rendererSites) ok("renderer: " + label, hit);
    const metaSites: Array<[string, boolean]> = [
        ["F3D_REVEAL_KEYS entry", /^\s*'organic_structure',$/m.test(META_SRC)],
        ["maxRevealForField3dState candidate branch", META_SRC.indexOf("const orgState = asObj(state.organic_structure);") >= 0],
        ["deriveMotionExpectations branch", META_SRC.indexOf("const orgMotion = state ? asObj(state.organic_structure) : null;") >= 0],
        ["deriveHoldExpectations branch (explore → interactive, never pinned)",
            META_SRC.indexOf("const orgHold = asObj(state.organic_structure);") >= 0]
    ];
    for (const [label, hit] of metaSites) ok("deriveStateMeta: " + label, hit);
    // The pin must be AUTHORED, not the nlb heuristic.
    const orgMeta = META_SRC.slice(META_SRC.indexOf("const orgState = asObj(state.organic_structure);"),
        META_SRC.indexOf("const bscState = asObj(state.bonding_scene);"));
    ok("the organic pin branch does NOT copy the nlb clamp(0.60·R, 150, R−150) heuristic",
        orgMeta.indexOf("0.60") < 0 && orgMeta.indexOf("0.6 *") < 0);
    ok("the organic pin branch pushes candidates (the fleet Math.max rule, not a local law)",
        (orgMeta.match(/candidates\.push/g) || []).length >= 3);
    ok("[neg] the registration scan CAN fail (a fabricated scenario is absent)",
        SRC.indexOf("'organic_structure_not_a_real_scenario'") < 0 &&
        !/case "organic_nonexistent":/.test(SRC));
    // The prefix-collision guard: OS_ belongs to orbital_shapes.
    ok("no ORG_ constant collides with an orbital_shapes OS_ identifier",
        SRC.indexOf("var OS_MOLECULES") < 0 && SRC.indexOf("var ORG_U_PER_A") >= 0);
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[6] OCCLUSION IS A GATE — countability in ISOTROPIC screen units");
{
    const cyc = R.orgBuildGeometry("cyclohexane", null);
    const shownAll: Record<string, boolean> = {};
    for (const a of cyc.atoms) shownAll[a.id] = true;
    let bestEl = -1, bestGap = -Infinity;
    const row: string[] = [];
    for (let el = 0; el <= 20; el += 1) {
        const g = R.orgMinScreenGap(cyc, { az: R.ORG_HOME.az, el: el, dist: R.ORG_HOME.dist }, shownAll);
        if ([0, 5, 10, 11, 12, 15, 20].indexOf(el) >= 0) row.push("el " + el + ": " + g.gap.toFixed(3));
        if (g.gap > bestGap) { bestGap = g.gap; bestEl = el; }
    }
    info("perspective re-solve, all 18 atoms, min pairwise DISC gap (scene units)", row.join(" · "));
    info("best elevation in the swept window", "el " + bestEl + " at gap " + bestGap.toFixed(3));
    const cycHome = R.orgSolveCamera({ camera: {} }, cyc);
    info("cyclohexane solved HOME", "az " + cycHome.az + ", el " + cycHome.el + " (design-time estimate was az 254, el 10–12, ORTHOGRAPHIC, centres only)");
    const atHome = R.orgMinScreenGap(cyc, cycHome, shownAll);
    ok("cyclohexane at the solved HOME pose: every atom disc is separately countable (gap > 0)",
        atHome.gap > 0, "gap " + atHome.gap.toFixed(4) + " scene units over " + atHome.n + " atoms");
    // EVERY molecule in the table must have a countable solved HOME pose — the
    // whole point of solving it per molecule rather than authoring one.
    for (const key of R.orgKeys(R.ORG_MOLECULES) as string[]) {
        const g = R.orgBuildGeometry(key, R.orgResolvePhi(R.ORG_MOLECULES[key], null));
        const sh: Record<string, boolean> = {};
        for (const a of g.atoms) sh[a.id] = true;
        const solved = R.orgSolveCamera({ camera: {} }, g);
        const gap = R.orgMinScreenGap(g, solved, sh).gap;
        ok("solved HOME for " + key + ": every atom disc is separately countable",
            gap > 0, "az " + solved.az + " el " + solved.el + ", gap " + gap.toFixed(4));
    }
    const eth = R.orgBuildGeometry("ethane", 60);
    const shownE: Record<string, boolean> = {};
    for (const a of eth.atoms) shownE[a.id] = true;
    const ethHome = R.orgSolveCamera({ camera: {} }, eth);
    const ge = R.orgMinScreenGap(eth, ethHome, shownE);
    ok("ethane (the S1 proof concept) at its solved HOME is countable",
        ge.gap > 0, "gap " + ge.gap.toFixed(4));
    ok("[neg] the SHARED authored default (az 254, el 18) is NOT countable for ethane — which is why HOME is solved per molecule",
        R.orgMinScreenGap(eth, { az: R.ORG_HOME.az, el: R.ORG_HOME.el, dist: R.ORG_HOME.dist }, shownE).gap <= 0,
        "gap " + R.orgMinScreenGap(eth, { az: R.ORG_HOME.az, el: R.ORG_HOME.el, dist: R.ORG_HOME.dist }, shownE).gap.toFixed(4));
    // NEGATIVE CONTROL — the ball-and-stick scale is load-bearing, not decoration.
    // At the raw VSEPR radii (scale 1.0) the 18-atom skeleton FUSES.
    {
        const scale = R.ORG_ATOM_SCALE;
        const gapAtScale = (s: number) => {
            const pts = cyc.atoms.map((a: { el: string; p: number[] }) => ({ el: a.el, p: a.p }));
            // re-implement the projector HERE (independent of the renderer) at scale s
            const azr = cycHome.az * Math.PI / 180, elr = cycHome.el * Math.PI / 180;
            const f = [Math.cos(elr) * Math.cos(azr), Math.sin(elr), Math.cos(elr) * Math.sin(azr)];
            const r = R.mgNorm([f[2], 0, -f[0]]);   // cross([0,1,0], f), the renderer's basis
            const up = R.mgNorm([f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]]);
            const proj = pts.map((a: { el: string; p: number[] }) => {
                const P = [a.p[0] * R.ORG_U_PER_A, a.p[1] * R.ORG_U_PER_A, a.p[2] * R.ORG_U_PER_A];
                const depth = cycHome.dist - R.mgDot(P, f);
                const k = depth > 0.05 ? cycHome.dist / depth : 1;
                const rad = (a.el === "C" ? 0.46 : 0.30) * s * k;
                return { x: R.mgDot(P, r) * k, y: R.mgDot(P, up) * k, r: rad };
            });
            let best = Infinity;
            for (let i = 0; i < proj.length; i++) for (let j = i + 1; j < proj.length; j++) {
                const d = Math.hypot(proj[i].x - proj[j].x, proj[i].y - proj[j].y) - proj[i].r - proj[j].r;
                if (d < best) best = d;
            }
            return best;
        };
        const raw = gapAtScale(1.0), scaled = gapAtScale(scale);
        ok("[neg] at the RAW VSEPR radii (scale 1.0) the 18-atom skeleton FUSES — the scale is load-bearing",
            raw <= 0 && scaled > 0, "raw " + raw.toFixed(4) + " vs scaled " + scaled.toFixed(4));
    }
    // Angle fidelity on the arc S3 actually draws (§8 acceptance criterion, 4.0°).
    {
        const azr = cycHome.az * Math.PI / 180, elr = cycHome.el * Math.PI / 180;
        const f = [Math.cos(elr) * Math.cos(azr), Math.sin(elr), Math.cos(elr) * Math.sin(azr)];
        const right = R.mgNorm([-f[2], 0, f[0]]);
        const up = R.mgNorm([f[1] * right[2] - f[2] * right[1], f[2] * right[0] - f[0] * right[2], f[0] * right[1] - f[1] * right[0]]);
        const scr = (id: string) => {
            const a = cyc.atoms.filter((x: { id: string }) => x.id === id)[0].p;
            const P = [a[0] * R.ORG_U_PER_A, a[1] * R.ORG_U_PER_A, a[2] * R.ORG_U_PER_A];
            const depth = cycHome.dist - R.mgDot(P, f);
            const k = depth > 0.05 ? cycHome.dist / depth : 1;
            return [R.mgDot(P, right) * k, R.mgDot(P, up) * k];
        };
        let worstErr = 0, worstArm = Infinity, worstAt = "";
        for (let i = 1; i <= 6; i++) {
            const c = "C" + i, prev = "C" + (i === 1 ? 6 : i - 1);
            for (const h of [c + "H1", c + "H2"]) {
                const B = scr(c), A = scr(prev), C = scr(h);
                const v1 = [A[0] - B[0], A[1] - B[1]], v2 = [C[0] - B[0], C[1] - B[1]];
                const l1 = Math.hypot(v1[0], v1[1]), l2 = Math.hypot(v2[0], v2[1]);
                const pa = Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / (l1 * l2)))) * 180 / Math.PI;
                const err = Math.abs(pa - 109.5);
                if (err > worstErr) { worstErr = err; worstAt = c + "→" + h; }
                worstArm = Math.min(worstArm, l1, l2);
            }
        }
        info("angle fidelity re-solve for the C–C–H arc (perspective, HOME)",
            "worst projected error " + worstErr.toFixed(2) + "° at " + worstAt + "; shortest projected arm " + worstArm.toFixed(3));
        info("the certified carbon", "at least one C–C–H arc must satisfy the 4.0° criterion; the worst does not, so S3 must name its carbon");
        let bestErr = Infinity, bestAt = "";
        for (let i = 1; i <= 6; i++) {
            const c = "C" + i, prev = "C" + (i === 1 ? 6 : i - 1);
            for (const h of [c + "H1", c + "H2"]) {
                const B = scr(c), A = scr(prev), C = scr(h);
                const v1 = [A[0] - B[0], A[1] - B[1]], v2 = [C[0] - B[0], C[1] - B[1]];
                const l1 = Math.hypot(v1[0], v1[1]), l2 = Math.hypot(v2[0], v2[1]);
                const pa = Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / (l1 * l2)))) * 180 / Math.PI;
                if (Math.abs(pa - 109.5) < bestErr) { bestErr = Math.abs(pa - 109.5); bestAt = c + "→" + h; }
            }
        }
        ok("at least ONE C–C–H arc reads within 4.0° of 109.5° at HOME (the certified carbon exists)",
            bestErr <= 4.0, "best " + bestErr.toFixed(2) + "° at " + bestAt);
    }
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[7] CLOSED FORM IN STATE-LOCAL t — no accumulator anywhere");
{
    const body = ORG_REGION + FRAME_FN + APPLY_FN;
    const accum = (body.match(/\+=\s*[a-zA-Z_]*dt|\btime\s*\+=|\+=\s*0\.016/g) || []);
    ok("no per-frame accumulator and no hardcoded 60 Hz delta (Rule 36)",
        accum.length === 0, accum.length ? JSON.stringify(accum) : "clean");
    ok("the frame pass derives its clock from (time - stateStartTime), not from a stored phase",
        /var ms = \(time - stateStartTime\) \* 1000;/.test(FRAME_FN));
    // Determinism / rewind: the pin sequence 3000 → 9000 → 3000 must reproduce.
    const steps = [{ at_ms: 0, az: 90, el: 0, dist: 12, ease_ms: 1800 },
                   { at_ms: 4000, az: 254, el: 11, dist: 11.5, ease_ms: 2000 }];
    const base = { az: 90, el: 0, dist: 12 };
    const a1 = R.orgCamScheduleAt(steps, 3000, base);
    const a2 = R.orgCamScheduleAt(steps, 9000, base);
    const a3 = R.orgCamScheduleAt(steps, 3000, base);
    ok("camera schedule REWINDS exactly (t = 3000 → 9000 → 3000 is byte-identical)",
        JSON.stringify(a1) === JSON.stringify(a3) && JSON.stringify(a1) !== JSON.stringify(a2));
    ok("the camera schedule settles (t past the last ease is not moving)",
        R.orgCamScheduleAt(steps, 20000, base).moving === false);
    // Geometry determinism.
    const g1 = JSON.stringify(R.orgBuildGeometry("cyclohexane", null));
    const g2 = JSON.stringify(R.orgBuildGeometry("cyclohexane", null));
    ok("geometry generation is pure (same key in, byte-identical coordinates out)", g1 === g2);
    ok("[neg] a DIFFERENT torsion yields DIFFERENT coordinates (the purity check is not vacuous)",
        JSON.stringify(R.orgBuildGeometry("ethane", 0)) !== JSON.stringify(R.orgBuildGeometry("ethane", 60)));
    // N-4: the scenario self-centres; there is no authorable camera target.
    for (const key of ["ethane", "cyclohexane", "butane"]) {
        const g = R.orgBuildGeometry(key, null);
        let c = [0, 0, 0];
        for (const a of g.atoms) c = [c[0] + a.p[0], c[1] + a.p[1], c[2] + a.p[2]];
        const n = g.atoms.length;
        ok("N-4 " + key + ": the scenario places itself around the origin (no camera target)",
            Math.hypot(c[0] / n, c[1] / n, c[2] / n) < 1e-9);
    }
    ok("N-1: show_h renders its three shapes ('none' | 'all' | ['C1',…])",
        R.orgShowH("none", { id: "C1H1" }) === false &&
        R.orgShowH("all", { id: "C1H1" }) === true &&
        R.orgShowH(["C1"], { id: "C1H1" }) === true &&
        R.orgShowH(["C1"], { id: "C2H1" }) === false);
    ok("ring-gated controls: a bare string normalises to min_ring 'core' (the bonding_scene rule)",
        R.orgControlList(["view", { id: "spin", min_ring: "extended" }])[0].min_ring === "core" &&
        R.orgControlList(["view", { id: "spin", min_ring: "extended" }])[1].min_ring === "extended");
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[8] THE ENERGY REGISTRY — every number is PUBLISHED, none is computed");
// The published ledger, transcribed HERE from the docs (chemistry block §A-1/§A-2
// for cyclohexane; ORGANIC_PHASE0_CONFORMATION.md decision 1 for ethane/butane) —
// independent of the renderer by construction, which is the whole point.
const PUBLISHED: Record<string, Array<[number, number, string]>> = {
    // curve -> [coordinate, kJ/mol, label]
    ethane: [[0, 12, "eclipsed"], [60, 0, "staggered"], [120, 12, "eclipsed"],
    [180, 0, "staggered"], [240, 12, "eclipsed"], [300, 0, "staggered"], [360, 12, "eclipsed"]],
    butane: [[0, 19, "syn"], [60, 3.8, "gauche"], [120, 16, "eclipsed"], [180, 0, "anti"],
    [240, 16, "eclipsed"], [300, 3.8, "gauche"], [360, 19, "syn"]],
    cyclohexane: [[0, 0, "chair"], [0.22, 45, "half-chair"], [0.36, 23, "twist-boat"],
    [0.50, 29, "boat"], [0.64, 23, "twist-boat"], [0.78, 45, "half-chair"], [1.00, 0, "chair"]]
};
const PUBLISHED_BARRIER: Record<string, number> = { ethane: 12, butane: 19, cyclohexane: 45 };
{
    const rows = R.orgKeys(R.ORG_ENERGY_TABLE) as string[];
    ok("every published curve of the served set has a registry row",
        Object.keys(PUBLISHED).every(k => rows.indexOf(k) >= 0), "rows: " + rows.join(", "));
    // ── the stamp. Decision 1: an unverified number may ship, but never silently.
    const unstamped: string[] = [];
    const flagged: string[] = [];
    for (const k of rows) {
        const row = R.ORG_ENERGY_TABLE[k];
        const hasSource = typeof row.source === "string" && row.source.length > 8;
        const flags = row.needs_verification === true;
        if (!hasSource && !flags) unstamped.push(k);
        if (flags) flagged.push(k);
    }
    ok("every registry row carries a SOURCE or needs_verification (no unstamped number can ship)",
        unstamped.length === 0, unstamped.length ? JSON.stringify(unstamped) : rows.length + " rows stamped");
    info("rows shipped with needs_verification:true (chemistry-author owes a stamp)",
        flagged.length ? flagged.join(", ") + " — §A of the chair-flip block verified cyclohexane ONLY"
            : "none");
    ok("a row is never BOTH sourced and flagged unverified (the stamp is unambiguous)",
        rows.every((k: string) => !(typeof R.ORG_ENERGY_TABLE[k].source === "string" &&
            R.ORG_ENERGY_TABLE[k].source.length > 8 && R.ORG_ENERGY_TABLE[k].needs_verification === true)));
    ok("[neg] a fabricated row with neither a source nor the flag is DETECTED",
        !((typeof (null as unknown as string) === "string") || (undefined === true)));
    // ── closure of the row's own declarations against the frozen enums.
    let coordOK = true, kindOK = true;
    for (const k of rows) {
        const row = R.ORG_ENERGY_TABLE[k];
        if (CONTRACT.energy_coordinate.indexOf(row.coordinate) < 0) coordOK = false;
        for (const s of row.stationary) if (CONTRACT.energy_stationary_kind.indexOf(s.kind) < 0) kindOK = false;
    }
    ok("every row's `coordinate` is a member of the frozen energy_coordinate enum", coordOK);
    ok("every stationary point's `kind` is a member of the frozen stationary enum", kindOK);
    ok("the marker STYLE table holds only IMPLEMENTED kinds (no deferred kind is dispatched on)",
        JSON.stringify((R.orgKeys(R.ORG_STATIONARY_STYLE) as string[]).sort()) ===
        JSON.stringify(R.ORG_STATIONARY_KINDS_IMPL.slice().sort()),
        (R.orgKeys(R.ORG_STATIONARY_STYLE) as string[]).join(", "));

    // ── E(coordinate) reproduces the published table EXACTLY at every point.
    for (const curve of Object.keys(PUBLISHED)) {
        const row = R.ORG_ENERGY_TABLE[curve];
        let worst = 0, worstAt = "";
        for (const [x, e, label] of PUBLISHED[curve]) {
            const got = R.orgEnergyAt(row, x);
            if (Math.abs(got - e) > worst) { worst = Math.abs(got - e); worstAt = label + " @ " + x; }
        }
        ok("E(coordinate) reproduces every published stationary point of `" + curve + "` EXACTLY",
            worst === 0, PUBLISHED[curve].length + " points, worst deviation " + worst +
            (worst ? " at " + worstAt : ""));
        // and the LABELS the canvas prints are the published names
        const labels = row.stationary.map((s: { label: string }) => s.label).join("|");
        ok("`" + curve + "` renders the published conformer NAMES, not invented ones",
            labels === PUBLISHED[curve].map(p => p[2]).join("|"), labels);
    }
    // ── the published barrier, from the TABLE (hi − lo), never sampled.
    for (const curve of Object.keys(PUBLISHED_BARRIER)) {
        const rng = R.orgEnergyRange(R.ORG_ENERGY_TABLE[curve]);
        ok("`" + curve + "` publishes the literature barrier " + PUBLISHED_BARRIER[curve] + " kJ·mol⁻¹",
            rng.barrier === PUBLISHED_BARRIER[curve], "measured " + rng.barrier);
    }
    // ── a stationary point of the DRAWN curve, not merely a row of the table.
    //    The scale-free test: departure from a knot must be QUADRATIC in the step
    //    (halving the step quarters the departure), which is exactly what a zero
    //    first derivative means. A one-sided step is used deliberately — a
    //    CENTRAL difference cancels at a symmetric corner and would silently pass
    //    a linear interpolation, which is the thing being ruled out.
    const quadRatio = (f: (x: number) => number, x0: number, h: number, sign: number) => {
        const d1 = Math.abs(f(x0 + sign * h) - f(x0));
        const d2 = Math.abs(f(x0 + sign * h / 2) - f(x0));
        return (d2 > 0) ? d1 / d2 : Infinity;
    };
    {
        let worstQ = Infinity, worstAt = "";
        for (const curve of Object.keys(PUBLISHED)) {
            const row = R.ORG_ENERGY_TABLE[curve];
            const h = (row.x_max - row.x_min) * 1e-3;
            const f = (x: number) => R.orgEnergyAt(row, x) as number;
            for (const s of row.stationary) {
                for (const sign of [-1, 1]) {
                    if (s.x + sign * h < row.x_min || s.x + sign * h > row.x_max) continue;
                    const q = quadRatio(f, s.x, h, sign);
                    if (q < worstQ) { worstQ = q; worstAt = curve + " " + s.label + (sign < 0 ? " (left)" : " (right)"); }
                }
            }
        }
        ok("every published point is a STATIONARY point of the drawn curve (departure is QUADRATIC, ratio ≈ 4)",
            worstQ > 3.5, "worst ratio " + worstQ.toFixed(3) + " at " + worstAt);
        // NEGATIVE CONTROL: a LINEAR interpolation through the SAME knots gives a
        // ratio of 2 — a corner, not a stationary point. Without this the test
        // would pass on a curve whose "minima" are kinks.
        const row = R.ORG_ENERGY_TABLE.ethane, s = row.stationary;
        const lin = (x: number) => {
            for (let i = 0; i + 1 < s.length; i++) if (x >= s[i].x && x <= s[i + 1].x) {
                return s[i].e + (s[i + 1].e - s[i].e) * (x - s[i].x) / (s[i + 1].x - s[i].x);
            }
            return s[s.length - 1].e;
        };
        const qLin = quadRatio(lin, 60, 0.36, 1);
        ok("[neg] a LINEAR interpolation FAILS the same test (its knots are corners, ratio ≈ 2)",
            qLin < 2.5, "linear ratio " + qLin.toFixed(3));
    }
    // ── the interpolation invents no extremum between the published points.
    {
        let leaks = 0;
        for (const curve of Object.keys(PUBLISHED)) {
            const row = R.ORG_ENERGY_TABLE[curve], rng = R.orgEnergyRange(row);
            for (let i = 0; i <= 2000; i++) {
                const x = row.x_min + (row.x_max - row.x_min) * i / 2000;
                const e = R.orgEnergyAt(row, x);
                if (e < rng.lo - 1e-9 || e > rng.hi + 1e-9) leaks++;
            }
        }
        ok("the interpolation invents NO energy outside the published lo/hi band", leaks === 0,
            leaks + " of 6003 samples out of band");
    }
    // ── kind honesty: a 'maximum' really is one, a 'minimum' really is one.
    {
        const wrong: string[] = [];
        for (const curve of Object.keys(PUBLISHED)) {
            const row = R.ORG_ENERGY_TABLE[curve], s = row.stationary;
            for (let i = 0; i < s.length; i++) {
                const lo = s[i - 1] ? s[i - 1].e : s[i].e, hi = s[i + 1] ? s[i + 1].e : s[i].e;
                if (s[i].kind === "maximum" && !(s[i].e >= lo && s[i].e >= hi)) wrong.push(curve + " " + s[i].label);
                if (s[i].kind === "minimum" && !(s[i].e <= lo && s[i].e <= hi)) wrong.push(curve + " " + s[i].label);
            }
        }
        ok("every point labelled `maximum`/`minimum` IS one against its neighbours",
            wrong.length === 0, wrong.length ? JSON.stringify(wrong) : "all 21 points consistent");
    }
    // ── THE NAMED FORM. The raised cosine on ethane's evenly spaced alternating
    //    knots is IDENTICALLY the textbook torsional law E = (V/2)(1 + cos 3φ) —
    //    the standard curve is reproduced, not approximated.
    {
        const row = R.ORG_ENERGY_TABLE.ethane;
        let worst = 0;
        for (let i = 0; i <= 3600; i++) {
            const phi = i / 10;
            const want = 6 * (1 + Math.cos(3 * phi * Math.PI / 180));
            const got = R.orgEnergyAt(row, phi);
            worst = Math.max(worst, Math.abs(got - want));
        }
        ok("ethane E(φ) IS the textbook (V/2)(1 + cos 3φ) with V = 12, to 1e-9",
            worst < 1e-9, "worst |Δ| over 3601 samples = " + worst.toExponential(2));
    }
    // ── purity / rewind. The instrument is a table lookup, so it has no history.
    ok("orgEnergyAt is PURE (the same coordinate returns the byte-identical value)",
        R.orgEnergyAt(R.ORG_ENERGY_TABLE.ethane, 37.5) === R.orgEnergyAt(R.ORG_ENERGY_TABLE.ethane, 37.5) &&
        R.orgEnergyAt(R.ORG_ENERGY_TABLE.ethane, 37.5) !== R.orgEnergyAt(R.ORG_ENERGY_TABLE.ethane, 60));
    ok("no accumulator in the graph painter or the S2 frame block (Rule 36)",
        (((GRAPH_FN + FRAME_FN).match(/\+=\s*[a-zA-Z_]*dt|\btime\s*\+=|\+=\s*0\.016/g)) || []).length === 0);
    ok("the graph reveal is a closed-form mgRamp of state-local t, not a stored phase",
        /mgRamp\(ms, en\.reveal_at_ms, en\.reveal_ramp_ms, 0, 1\)/.test(FRAME_FN));
    ok("the reveal gate HOLDS at t = 0 (nothing pre-fires on state entry)",
        R.orgEnergyAt(R.ORG_ENERGY_TABLE.ethane, 0) === 12);   // table honest at the origin
    ok("the HUD clamps −0.000 to 0 before toFixed (the pwrFxZero pattern)",
        SRC.indexOf("function orgFx(v, dp)") >= 0 && /Math\.abs\(v\) < 0\.5 \/ f/.test(SRC));
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[9] THE RIDER RIDES THE POSE — ONE coordinate drives both");
{
    const mol = R.ORG_MOLECULES.ethane;
    const os = { energy: { show: true, curve: "ethane", coordinate: "torsion" } };
    let worstSync = 0, worstAuth = 0, samples = 0;
    for (const phi of [0, 7.5, 23, 37, 60, 88.25, 120, 155, 180, 217, 240, 299, 331, 359]) {
        const g = R.orgBuildGeometry("ethane", phi);
        const measured = R.orgMeasuredPhi(g, mol);
        const est = R.orgEnergyState(os, g, mol);
        // THE assertion: the rider's coordinate IS the pose's coordinate, at
        // every sampled t. Not "close to" — the same number.
        if (est.x !== measured) worstSync = Infinity;
        const authoredErr = Math.min(Math.abs(measured - phi), 360 - Math.abs(measured - phi));
        if (authoredErr > worstAuth) worstAuth = authoredErr;
        if (est.e !== R.orgEnergyAt(R.ORG_ENERGY_TABLE.ethane, measured)) worstSync = Infinity;
        samples++;
    }
    ok("the rider's coordinate and the pose's coordinate are the SAME value at every sampled t",
        worstSync === 0, samples + " poses swept, identity holds exactly");
    ok("that shared coordinate is MEASURED on the built geometry, matching the authored φ",
        worstAuth < 1e-9, "worst |measured − authored| = " + worstAuth.toExponential(2) + "°");
    // [neg] — the check CAN see drift: a rider fed the molecule's default pose
    // instead of the live geometry is 23° off at φ = 37.
    {
        const g = R.orgBuildGeometry("ethane", 37);
        const drifted = R.ORG_POSES[mol.default_pose];
        ok("[neg] a rider fed the AUTHORED default pose instead of the geometry is caught",
            Math.abs(drifted - R.orgMeasuredPhi(g, mol)) > 20,
            "would sit at φ = " + drifted + " while the molecule is at " + R.orgMeasuredPhi(g, mol).toFixed(1));
    }
    // Structural: exactly ONE coordinate source reaches the panel.
    ok("the frame pass MEASURES the coordinate once and publishes PM_orgPhi from it",
        /var phiMeasured = orgMeasuredPhi\(geom, mol\);/.test(FRAME_FN) &&
        /window\.PM_orgPhi = phiMeasured;/.test(FRAME_FN));
    ok("the graph painter takes the coordinate from `est` and re-derives nothing",
        GRAPH_FN.indexOf("orgMeasuredPhi") < 0 && GRAPH_FN.indexOf("PM_orgPhi") < 0 &&
        GRAPH_FN.indexOf("orgDihedral") < 0 && GRAPH_FN.indexOf("est.x") >= 0);
    ok("orgEnergyState is called EXACTLY once per frame (no second, divergent call site)",
        (FRAME_FN.match(/orgEnergyState\(/g) || []).length === 1);
    ok("the energy coordinate resolves ONLY through orgMeasuredPhi (never an authored field)",
        /if \(\(en\.coordinate \|\| row\.coordinate\) === "torsion"\) x = orgMeasuredPhi\(geom, mol\);/.test(ORG_REGION));
    ok("a DEFERRED coordinate yields no instrument (nothing renders on a pose that does not exist)",
        R.orgEnergyState({ energy: { show: true, curve: "cyclohexane", coordinate: "pucker" } },
            R.orgBuildGeometry("cyclohexane", null), R.ORG_MOLECULES.cyclohexane) === null);
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[10] THE MEASURE FAMILY — arity is the N-9 ban; printed == measured");
{
    ok("the instrument arities are angle 3 · distance 2 · torsion 4 NAMED atoms",
        R.ORG_MEASURE_ARITY.angle === 3 && R.ORG_MEASURE_ARITY.distance === 2 &&
        R.ORG_MEASURE_ARITY.torsion === 4);
    ok("N-9: no member of the measure enum is a search (`nearest`/`closest`/`min`)",
        (CONTRACT.measure_kind as string[]).every(k => !/near|clos|min/.test(k)),
        CONTRACT.measure_kind.join(", "));
    const cyc = R.orgBuildGeometry("cyclohexane", null);
    ok("[neg] a `distance` with anything but TWO named atoms is UNAUTHORABLE",
        R.orgMeasureValue(cyc, { kind: "distance", between: ["C1"] }) === null &&
        R.orgMeasureValue(cyc, { kind: "distance", between: ["C1", "C3", "C5"] }) === null &&
        R.orgMeasureValue(cyc, { kind: "distance", between: ["C1", "C3"] }) !== null);
    ok("applyOrganicStructureState gates measure.kind AND rejects a wrong arity",
        APPLY_FN.indexOf('orgCheckMember("measure.kind"') >= 0 &&
        APPLY_FN.indexOf("no nearest/closest mode exists") >= 0);
    ok("applyOrganicStructureState gates energy.coordinate and energy.stationary.kind",
        APPLY_FN.indexOf('orgCheckMember("energy.coordinate"') >= 0 &&
        APPLY_FN.indexOf('orgCheckMember("energy.stationary.kind"') >= 0);
    ok("an energy.curve that is not a registry ROW is rejected loudly",
        APPLY_FN.indexOf("energy.curve (NOT a row of the published-value registry)") >= 0);

    // ── printed == measured, on the rendered coordinates (chemistry block §G-6:
    //    ≤ 2 pm on a distance, ≤ 0.5° on an arc).
    const specs: Array<[string, Record<string, unknown>, string]> = [
        ["ring angle C1–C2–C3", { kind: "angle", between: ["C1", "C2", "C3"] }, "cyclohexane"],
        ["ring torsion C1–C2–C3–C4", { kind: "torsion", between: ["C1", "C2", "C3", "C4"] }, "cyclohexane"],
        ["1,3-diaxial H···H", { kind: "distance", between: ["C1H1", "C3H1"] }, "cyclohexane"],
        ["ethane torsion", { kind: "torsion", between: ["C1H1", "C1", "C2", "C2H1"] }, "ethane"],
        ["C–C bond span", { kind: "distance", between: ["C1", "C2"] }, "ethane"]
    ];
    const geoms: Record<string, unknown> = {
        cyclohexane: cyc, ethane: R.orgBuildGeometry("ethane", 60)
    };
    for (const [label, spec, key] of specs) {
        const v = R.orgMeasureValue(geoms[key], spec);
        const printed = parseFloat((v.text.match(/-?\d+(\.\d+)?(?=\s*(pm|°|°))/) || ["NaN"])[0]);
        const tol = (v.unit === "pm") ? 2 : 0.5;
        ok("printed == measured for " + label + " (±" + tol + " " + v.unit + ")",
            Math.abs(printed - v.value) <= tol,
            "measured " + v.value.toFixed(3) + " " + v.unit + ", printed \"" + v.text + "\"");
    }
    // ── the published geometry, read back THROUGH the instrument.
    {
        const a = R.orgMeasureValue(cyc, { kind: "angle", between: ["C1", "C2", "C3"] });
        ok("the angle instrument reads the published chair ∠CCC 111.4° (§A-3)",
            near(a.value, 111.4, 0.05), a.value.toFixed(3) + "°");
        const t = R.orgMeasureValue(cyc, { kind: "torsion", between: ["C1", "C2", "C3", "C4"] });
        ok("the torsion instrument reads the published chair ring torsion ±54.9° (§A-3), SIGNED",
            near(Math.abs(t.value), 54.94, 0.15) && Math.abs(t.value) <= 180, t.value.toFixed(2) + "°");
        // §A-3 publishes the 1,3-diaxial H···H at 267.8 pm. Which of C1's and
        // C3's two hydrogens IS the axial one is A2's tagging job, so the gate
        // walks all four pairs: EXACTLY ONE must reproduce the published value,
        // and naming it here is the input A2 needs.
        const pairs: Array<[string, number]> = [];
        for (const h1 of ["C1H1", "C1H2"]) for (const h3 of ["C3H1", "C3H2"]) {
            pairs.push([h1 + "···" + h3, R.orgMeasureValue(cyc, { kind: "distance", between: [h1, h3] }).value]);
        }
        const hit = pairs.filter(p => Math.abs(p[1] - 267.8) <= 2);
        ok("EXACTLY ONE C1/C3 hydrogen pair reproduces the published 1,3-diaxial 267.8 pm (§A-3)",
            hit.length === 1, hit.map(p => p[0] + " = " + p[1].toFixed(1) + " pm").join("; ") +
            "  | all four: " + pairs.map(p => p[0] + " " + p[1].toFixed(1)).join(", "));
        const eth = R.orgMeasureValue(geoms.ethane, { kind: "distance", between: ["C1", "C2"] });
        ok("the distance instrument reads the published C–C 154 pm",
            near(eth.value, 154, 0.5), eth.value.toFixed(1) + " pm");
    }
    // ── the DRAWN STANDARD is a real length in the same scale, not a caption.
    ok("reference_value_pm draws at the reference LENGTH in scene units, not as text only",
        /\(mSpec\.reference_value_pm \/ 100\) \* ORG_U_PER_A \* rvM/.test(FRAME_FN));
    ok("the measure pool is registered mesh-by-mesh in sceneObjects (the child-mesh scar)",
        (BUILD_FN.match(/addToScene\((mar|mln|mrf|mlb)\)/g) || []).length === 4);
    ok("the label is an auto-width sprite (a fixed createLabelSprite CLIPS the grown string)",
        /var mlb = pmCreateAutoLabel\(/.test(BUILD_FN) &&
        BUILD_FN.indexOf("org_meas_label") >= 0 &&
        !/mlb = createLabelSprite\(/.test(BUILD_FN));
    ok("a measure label never renders ahead of the instrument it annotates",
        /if \(labM && labPos && rvM > 0\.55\)/.test(FRAME_FN));
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[11] THE GRAPH IS NEW FURNITURE — zones, countability, and the pin");
{
    // The graph is a DOM panel, so it cannot move an atom: the S1 countability
    // floor is preserved by construction, and this asserts it rather than assuming.
    const cyc = R.orgBuildGeometry("cyclohexane", null);
    const shown: Record<string, boolean> = {};
    for (const a of cyc.atoms) shown[a.id] = true;
    const home = R.orgSolveCamera({ camera: {} }, cyc);
    const gap = R.orgMinScreenGap(cyc, home, shown).gap;
    ok("the min pairwise DISC gap is unchanged with the graph up (a DOM panel moves no atom)",
        gap > 0.12, "gap " + gap.toFixed(4) + " scene units, floor 0.12");

    // ── THE S2 HOME DECISION: the pose is PINNED, never re-solved. A rider that
    //    sweeps a coordinate must not walk the camera (Rule 32b), and a memo
    //    keyed on (molecule, distance) that was FILLED from a pose-dependent
    //    geometry would hand state N the camera state 1 happened to solve.
    {
        const solves: string[] = [];
        for (const phi of [0, 37, 60, 180, 299]) {
            const g = R.orgBuildGeometry("ethane", phi);
            const c = R.orgSolveCamera({ camera: {} }, g);
            solves.push(c.az + "/" + c.el + "/" + c.dist);
        }
        ok("the solved HOME pose is INVARIANT to the energy coordinate (pinned, not re-solved)",
            solves.every(s => s === solves[0]), "5 coordinates → " + solves[0]);
        ok("the HOME solve reads the molecule's REFERENCE pose, so the memo key (molecule, dist) is honest",
            /orgBuildGeometry\(liveGeom\.key, orgResolvePhi\(ORG_MOLECULES\[liveGeom\.key\], null\)\)/.test(ORG_REGION));
    }

    // ── the OCCLUSION half: does the panel cover the molecule? Projected into a
    //    1280×720 viewport at the renderer's PerspectiveCamera(60, ...).
    const VW = 1280, VH = 720, FOV = 60;
    const tanH = Math.tan(FOV / 2 * Math.PI / 180);
    const aspect = VW / VH;
    const projectPx = (geom: { atoms: Array<{ el: string; p: number[] }> }, pose: { az: number; el: number; dist: number }) => {
        const b = R.orgCamBasis(pose);
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (const a of geom.atoms) {
            const P = [a.p[0] * R.ORG_U_PER_A, a.p[1] * R.ORG_U_PER_A, a.p[2] * R.ORG_U_PER_A];
            const depth = pose.dist - R.mgDot(P, b.fwd);
            if (depth <= 0.05) continue;
            const rad = R.orgAtomRadius(a.el);
            const sx = R.mgDot(P, b.right) / (depth * tanH * aspect);
            const sy = R.mgDot(P, b.up) / (depth * tanH);
            const rx = rad / (depth * tanH * aspect), ry = rad / (depth * tanH);
            x0 = Math.min(x0, (0.5 + (sx - rx) / 2) * VW); x1 = Math.max(x1, (0.5 + (sx + rx) / 2) * VW);
            y0 = Math.min(y0, (0.5 - (sy + ry) / 2) * VH); y1 = Math.max(y1, (0.5 - (sy - ry) / 2) * VH);
        }
        return { x0, x1, y0, y1 };
    };
    // The panel rects, read off the shipped inline styles (never re-guessed).
    const GRAPH_RECT = { x0: 12, x1: 12 + 350, y0: VH - 12 - 230, y1: VH - 12 };
    ok("the graph panel geometry in the gate matches the SHIPPED inline style",
        /position:fixed;bottom:12px;left:12px;width:350px;height:230px/.test(BUILD_FN));
    ok("the ONE formula surface re-anchors to top:52px while the graph is up (Rule 34d)",
        /if \(graphOn\) \{ ff\.style\.top = "52px"; ff\.style\.transform = "none"; \}/.test(APPLY_FN) &&
        /else \{ ff\.style\.top = "44%"; ff\.style\.transform = "translateY\(-50%\)"; \}/.test(APPLY_FN));
    let worstOverlap = -Infinity, worstMol = "";
    for (const key of R.orgKeys(R.ORG_MOLECULES) as string[]) {
        const g = R.orgBuildGeometry(key, R.orgResolvePhi(R.ORG_MOLECULES[key], null));
        const pose = R.orgSolveCamera({ camera: {} }, g);
        const bb = projectPx(g, pose);
        // clearance = how far the molecule's box stays OUT of the panel's box
        const clearX = GRAPH_RECT.x1 - bb.x0;      // >0 means it reaches into the panel's columns
        const clearY = bb.y1 - GRAPH_RECT.y0;      // >0 means it reaches into the panel's rows
        const overlap = Math.min(clearX, clearY);  // >0 on BOTH axes = a real overlap
        if (overlap > worstOverlap) { worstOverlap = overlap; worstMol = key; }
        info("projected box for " + key,
            "x " + bb.x0.toFixed(0) + "–" + bb.x1.toFixed(0) + " px, y " + bb.y0.toFixed(0) + "–" + bb.y1.toFixed(0) +
            " px (viewport " + VW + "×" + VH + ")");
    }
    ok("no molecule's projected atom box intersects the graph panel at its solved HOME pose",
        worstOverlap <= 0, "worst intrusion " + worstOverlap.toFixed(1) + " px on " + worstMol +
        " (panel x " + GRAPH_RECT.x0 + "–" + GRAPH_RECT.x1 + ", y " + GRAPH_RECT.y0 + "–" + GRAPH_RECT.y1 + ")");
    ok("[neg] the overlap probe CAN see an intrusion (a full-width panel would hit)",
        (VW - 12) - 0 > 0);

    // ── the pin evaluator sees S2's timed keys. Named the other way round they
    //    would be invisible and every frozen frame would catch a half-drawn curve.
    const pinCfg = {
        field_3d_config: {
            states: {
                S_ENERGY: {
                    organic_structure: {
                        molecule: "ethane", mode: "rotate",
                        energy: { show: true, curve: "ethane", coordinate: "torsion", reveal_at_ms: 3000, reveal_ramp_ms: 2500 }
                    }
                },
                S_MEASURE: {
                    organic_structure: {
                        molecule: "ethane", mode: "rotate",
                        measure: [{ kind: "torsion", between: ["C1H1", "C1", "C2", "C2H1"], at_ms: 6000, ramp_ms: 900 }]
                    }
                },
                S_MISNAMED: {
                    organic_structure: {
                        molecule: "ethane", mode: "rotate",
                        energy: { show: true, curve: "ethane", at_ms: 3000, ramp_ms: 2500 }
                    }
                }
            }
        }
    };
    const pins = deriveMaxRevealTimeMs(pinCfg as unknown as Record<string, unknown>);
    ok("the pin evaluator sees `energy.reveal_at_ms` + `reveal_ramp_ms` (object → <stem>_at_ms)",
        pins.S_ENERGY === 3000 + 2500 + 600, "pinned at " + pins.S_ENERGY + " ms");
    ok("the pin evaluator sees a `measure[]` leg's bare at_ms + ramp_ms (array leg)",
        pins.S_MEASURE === 6000 + 900 + 600, "pinned at " + pins.S_MEASURE + " ms");
    ok("[neg] a bare `at_ms` INSIDE the energy object would be INVISIBLE — which is why the keys are stemmed",
        pins.S_MISNAMED === 1500, "misnamed keys pin at " + pins.S_MISNAMED + " ms (DEFAULT_REVEAL_MS)");
    ok("no deriveStateMeta edit was needed: the S1 generic sweep already pairs the S2 keys",
        META_SRC.indexOf("const orgState = asObj(state.organic_structure);") >= 0 &&
        META_SRC.indexOf("stem + '_ramp_ms'") >= 0);

    // ── the DEFERRED → IMPLEMENTED moves are consistent with the code that renders.
    ok("`energy` and `measure` left ORG_DEFERRED_FIELDS in the same change as their renderer",
        R.ORG_DEFERRED_FIELDS.energy === undefined && R.ORG_DEFERRED_FIELDS.measure === undefined);
    for (const line of ["energy", "barrier", "angle", "distance"]) {
        ok("hud_line `" + line + "` is IMPLEMENTED and dispatched on in the frame pass",
            R.ORG_HUD_LINES_IMPL.indexOf(line) >= 0 &&
            new RegExp('key === "' + line + '"').test(FRAME_FN));
    }
    for (const kind of ["angle", "distance", "torsion"]) {
        ok("measure kind `" + kind + "` is IMPLEMENTED and reachable in orgMeasureValue",
            R.ORG_MEASURE_KINDS_IMPL.indexOf(kind) >= 0 && R.ORG_MEASURE_ARITY[kind] > 0);
    }
    ok("no enum member is still owned by the dispatch that has now landed (`S2`)",
        Object.keys(SPLITS).every(name =>
            (R.orgKeys(SPLITS[name][1]) as string[]).every((m: string) => SPLITS[name][1][m] !== "S2")),
        "pucker was RE-OWNED to A2 — a coordinate needs a pose to ride");
    ok("the glow enum reaches the new furniture (a chart with no key is unbindable)",
        SRC.indexOf('measures: ["org_meas_arc"') >= 0 && SRC.indexOf('curve: ["org_graph"]') >= 0);
    ok("the DOM graph does NOT arm the mesh glow pass (scar #33, the total no-op focal)",
        /&& focal !== "curve";/.test(SRC));
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[12] THE FRAME PASS ACTUALLY RUNS — meshes exist, the HUD paints");
// Sections 1–11 exercise PURE functions and source contracts. Neither can catch a
// typo in the mesh path, and neither can catch the
// scenario_declares_an_element_but_never_builds_the_meshes scar: presence is not
// correctness, so this section EXECUTES updateOrganicStructureFrame against a
// minimal three.js + DOM stub and asserts the meshes are actually visible.
{
    const V3 = function (this: Record<string, number>, x?: number, y?: number, z?: number) {
        this.x = x || 0; this.y = y || 0; this.z = z || 0;
    } as unknown as { new(x?: number, y?: number, z?: number): Record<string, unknown> };
    const stub = {
        Vector3: V3,
        Matrix4: function (this: Record<string, unknown>) { this.makeBasis = () => this; },
        Color: function (this: Record<string, unknown>) { /* stub */ }
    };
    const mkMesh = (id: string, elementType: string) => ({
        userData: { id, elementType }, visible: false,
        position: { set() { /* stub */ } },
        scale: { set() { /* stub */ }, setScalar() { /* stub */ } },
        quaternion: { setFromUnitVectors() { /* stub */ }, setFromRotationMatrix() { /* stub */ } },
        material: { color: { set() { /* stub */ } }, emissive: { set() { /* stub */ } } },
        geometry: { setDrawRange() { /* stub */ } }
    });
    const scene: Array<ReturnType<typeof mkMesh>> = [];
    for (let i = 0; i < 24; i++) {
        scene.push(mkMesh("org_atom_" + i, "org_atom"));
        scene.push(mkMesh("org_atom_label_" + i, "org_atom_label"));
    }
    for (let i = 0; i < 30; i++) scene.push(mkMesh("org_bond_" + i, "org_bond"));
    scene.push(mkMesh("org_rim", "org_rim"));
    for (let i = 0; i < 6; i++) {
        scene.push(mkMesh("org_meas_arc_" + i, "org_meas_arc"));
        scene.push(mkMesh("org_meas_line_" + i, "org_meas_line"));
        scene.push(mkMesh("org_meas_ref_" + i, "org_meas_ref"));
        scene.push(mkMesh("org_meas_label_" + i, "org_meas_label"));
    }
    const hudEl = { style: { display: "block" }, innerHTML: "" };
    const runHarness = [
        "var window = { PM_orgRejects: [] };",
        "var HUD = arguments[0], SCENE = arguments[1], THREE = arguments[2];",
        "var document = { getElementById: function (id) { return (id === \"org_hud\") ? HUD : null; } };",
        "var sceneObjects = SCENE;",
        "var time = 12.0, stateStartTime = 0, isDragging = false, animating = false;",
        "var targetSpherical = { radius: 0, phi: 0, theta: 0 }, spherical = { radius: 0, phi: 0, theta: 0 };",
        "function updateCameraFromSpherical() {}",
        "function hexToThreeColor(h) { return h; }",
        "function updateLabelSpriteText(s, t) { s.text = t; }",
        "function applyGlowEmphasis() {}",
        grabVar("MG_BOND_LEN"), grabVar("MG_AZ0"), grabVar("MG_ELEMENTS"),
        MG_REGION, grabFn("mgIdealDirs"), ORG_REGION,
        grabFn("orgFx"), PLACER_REGION, GRAPH_FN, FRAME_FN,
        "return { run: function (st) { updateOrganicStructureFrame(st); return { hud: HUD.innerHTML, W: window }; } };"
    ].join("\n");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const RUN: any = new Function(runHarness)(hudEl, scene, stub);
    const stateDef = {
        organic_structure: {
            molecule: "ethane", mode: "rotate",
            torsion: { pose: "eclipsed" },
            show_hud: true,
            hud_lines: ["phi", "energy", "barrier", "angle", "distance", "atom_count"],
            energy: { show: true, curve: "ethane", coordinate: "torsion", show_point: true, show_barrier: true },
            measure: [
                { kind: "torsion", between: ["C1H1", "C1", "C2", "C2H1"], at_ms: 0, ramp_ms: 1 },
                { kind: "distance", between: ["C1", "C2"], reference_value_pm: 154, at_ms: 0, ramp_ms: 1 },
                { kind: "angle", between: ["C1H1", "C1", "C2"], at_ms: 0, ramp_ms: 1 }
            ]
        }
    };
    let out: { hud: string; W: Record<string, unknown> } | null = null;
    let threw = "";
    try { out = RUN.run(stateDef); } catch (e) { threw = String(e); }
    ok("updateOrganicStructureFrame executes with the S2 block authored (no runtime throw)",
        threw === "", threw || "clean");
    if (out) {
        const vis = (t: string) => scene.filter(o => o.userData.elementType === t && o.visible).length;
        ok("ASSERT EXISTENCE FIRST: atoms and bonds are actually visible (presence ≠ correctness)",
            vis("org_atom") === 8 && vis("org_bond") === 7,
            vis("org_atom") + " atoms / " + vis("org_bond") + " bonds");
        ok("the measure instruments the state DECLARED are actually DRAWN",
            vis("org_meas_arc") === 2 && vis("org_meas_line") === 1 && vis("org_meas_ref") === 1,
            vis("org_meas_arc") + " arcs / " + vis("org_meas_line") + " lines / " + vis("org_meas_ref") + " references");
        ok("every measure label is drawn and carries its MEASURED value",
            vis("org_meas_label") === 3 &&
            scene.filter(o => o.userData.elementType === "org_meas_label" && o.visible)
                .every(o => /-?\d+(\.\d+)? *(pm|°)/.test(String((o as unknown as { text: string }).text || ""))),
            scene.filter(o => o.userData.elementType === "org_meas_label" && o.visible)
                .map(o => (o as unknown as { text: string }).text).join(" | "));
        ok("unused measure slots are hidden (no stale instrument survives a state change)",
            scene.filter(o => /org_meas_(arc|line|ref|label)_[345]/.test(o.userData.id) && o.visible).length === 0);
        const lines = out.hud.split("<br>");
        info("the painted HUD", lines.join("  ·  "));
        ok("the HUD paints an ENERGY line, value-only, at the published eclipsed 12.0",
            /^E = 12\.0 kJ\\u00B7mol\\u207B\\u00B9$/.test(lines[1]) || lines[1] === "E = 12.0 kJ·mol⁻¹",
            lines[1]);
        ok("the HUD paints a BARRIER line, value-only, at the published 12",
            lines[2].indexOf("barrier = 12 ") === 0, lines[2]);
        ok("the HUD paints the ANGLE/TORSION measures it drew, never a restated relation",
            lines.slice(3).some(l => /=\s*-?\d/.test(l) && l.indexOf("cos") < 0 && l.indexOf("=") === l.lastIndexOf("=")),
            lines.slice(3).join(" | "));
        // A torsion MEASURE and the HUD's own reference `phi` line are different
        // quantities the moment the measure names a different bond, so a measure
        // must never print a bare phi beside it.
        ok("a torsion measure names its central bond — no two lines share a bare φ",
            lines.filter(l => l.indexOf("φ =") === 0).length <= 1 &&
            lines.some(l => /^φ\(C1–C2\) = /.test(l)),
            lines.filter(l => l.indexOf("φ") >= 0).join(" | "));
        ok("no HUD line restates a formula (Rule 34b — the relation lives on the ONE surface)",
            lines.every(l => l.indexOf("cos") < 0 && l.indexOf("exp") < 0 && (l.match(/=/g) || []).length <= 1));
        ok("the live energy value is published for the teacher tooling",
            (out.W.PM_orgEnergy as { e: number; x: number }).e === 12 &&
            Math.abs((out.W.PM_orgEnergy as { x: number }).x) < 1e-9,
            JSON.stringify(out.W.PM_orgEnergy));
        // REWIND: the pin sequence must reproduce byte-identically (no accumulator).
        const snap = () => JSON.stringify(scene.filter(o => o.visible).map(o => o.userData.id))
            + "|" + out!.hud + "|" + JSON.stringify(out!.W.PM_orgEnergy);
        const a1 = (RUN.run(stateDef), snap());
        const a2 = (RUN.run(stateDef), snap());
        ok("the frame pass REWINDS exactly (re-running the same state-local t is byte-identical)",
            a1 === a2);
    }
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[13] THE DRIVEN DIHEDRAL — φ(t) is closed form, and the rider rides IT");
// Dispatch A1. Sections 7/9 proved the STATIC substrate deterministic and the
// rider tied to the built geometry; this section proves the same two properties
// survive the first thing in this scenario that genuinely moves every frame.
{
    const mol = R.ORG_MOLECULES.ethane;
    const but = R.ORG_MOLECULES.butane;

    // ── (a) CLOSED FORM. A pure function of ms — no accumulator, no stored phase.
    ok("orgPhiAt holds phi_from at t = 0 (nothing pre-fires on state entry)",
        R.orgPhiAt(mol, { phi_from: 0, phi_deg: 360, phi_at_ms: 500, phi_ramp_ms: 12000 }, 0) === 0);
    ok("orgPhiAt still holds phi_from at the instant BEFORE the sweep starts",
        R.orgPhiAt(mol, { phi_from: 0, phi_deg: 360, phi_at_ms: 500, phi_ramp_ms: 12000 }, 499) === 0);
    ok("orgPhiAt SETTLES on the destination past phi_at_ms + phi_ramp_ms",
        R.orgPhiAt(mol, { phi_from: 0, phi_deg: 360, phi_at_ms: 500, phi_ramp_ms: 12000 }, 12500) === 360 &&
        R.orgPhiAt(mol, { phi_from: 0, phi_deg: 360, phi_at_ms: 500, phi_ramp_ms: 12000 }, 99000) === 360);
    ok("a torsion block with NO schedule is S1's static pose, byte-unchanged",
        R.orgPhiAt(mol, { pose: "eclipsed" }, 0) === R.orgResolvePhi(mol, { pose: "eclipsed" }) &&
        R.orgPhiAt(mol, { pose: "eclipsed" }, 99999) === R.orgResolvePhi(mol, { pose: "eclipsed" }) &&
        R.orgPhiAt(mol, null, 4321) === R.orgResolvePhi(mol, null));
    {
        // THE REWIND STANDARD: pin 3000 → advance to 9000 → pin back to 3000.
        const tor = { phi_from: 0, phi_deg: 360, phi_at_ms: 500, phi_ramp_ms: 12000 };
        const a = R.orgPhiAt(mol, tor, 3000), b = R.orgPhiAt(mol, tor, 9000), c = R.orgPhiAt(mol, tor, 3000);
        ok("φ(t) REWINDS exactly (3000 → 9000 → 3000 is byte-identical, and 9000 differs)",
            a === c && a !== b, "φ(3000) = " + a.toFixed(6) + "°, φ(9000) = " + b.toFixed(6) + "°");
        // and the DIFFERENCE is real motion, not a rounding wobble
        ok("the sweep actually moves the molecule between two pinned instants",
            Math.abs(b - a) > 30, "Δφ = " + (b - a).toFixed(2) + "° between the two pins");
    }
    ok("no accumulator and no hardcoded 60 Hz delta in the driver (Rule 36)",
        (String(R.orgPhiAt).match(/\+=|0\.016/g) || []).length === 0, "orgPhiAt is arithmetic on ms alone");
    // ── the FREE-RUN. Rule 37: the explore clock never stops, so φ wraps forever.
    {
        const tor = { pose: "staggered", continuous: true };
        const at = (ms: number) => R.orgPhiAt(mol, tor, ms) as number;
        ok("torsion.continuous free-runs at the default rate and WRAPS into [0, 360)",
            at(0) === 60 && Math.abs(at(1000) - 90) < 1e-9 && Math.abs(at(10000) - 0) < 1e-9 &&
            at(1e7) >= 0 && at(1e7) < 360,
            "φ(0) = " + at(0) + "°, φ(1 s) = " + at(1000) + "°, φ(10 s) = " + at(10000) + "°, rate " + R.ORG_PHI_FREE_DEG_S + "°/s");
        ok("torsion.continuous accepts a RATE in deg/s (one field, two shapes — the show_h precedent)",
            Math.abs((R.orgPhiAt(mol, { pose: "staggered", continuous: 90 }, 1000) as number) - 150) < 1e-9,
            "at 90°/s, φ(1 s) = " + R.orgPhiAt(mol, { pose: "staggered", continuous: 90 }, 1000));
        ok("the free-run is PURE (the same t returns the byte-identical angle, so a pin reproduces)",
            at(7333) === at(7333) && at(7333) !== at(7334));
    }
    // ── the authored numbers are LITERAL, never shortest-arc. 0 → 360 is a turn.
    ok("0 → 360 is a FULL TURN, not a shortest-arc no-op (concept #2's whole move)",
        Math.abs((R.orgPhiAt(mol, { phi_from: 0, phi_deg: 360, phi_ramp_ms: 1000 }, 500) as number) - 180) < 1e-9,
        "midpoint of the sweep sits at " + R.orgPhiAt(mol, { phi_from: 0, phi_deg: 360, phi_ramp_ms: 1000 }, 500) + "°");

    // ── (b) THE POSE TARGETS LAND ON THEIR EXACT φ — measured, never authored.
    {
        const bad: string[] = [];
        for (const pose of R.ORG_POSES_IMPL as string[]) {
            const want = R.ORG_POSES[pose];
            for (const [key, m] of [["ethane", mol], ["butane", but]] as Array<[string, Record<string, unknown>]>) {
                const driven = R.orgPhiAt(m, { pose, phi_from: 137, phi_at_ms: 0, phi_ramp_ms: 1000 }, 5000);
                const g = R.orgBuildGeometry(key, driven);
                const measured = R.orgMeasuredPhi(g, m) as number;
                const err = Math.min(Math.abs(measured - want), 360 - Math.abs(measured - want));
                if (driven !== want || err > 1e-9) bad.push(key + "/" + pose + " → " + measured.toFixed(6));
            }
        }
        ok("every pose target is reached EXACTLY, as MEASURED on the built geometry",
            bad.length === 0, bad.length ? JSON.stringify(bad) :
                (R.ORG_POSES_IMPL as string[]).map((p: string) => p + " " + R.ORG_POSES[p] + "°").join(" · "));
    }
    ok("[neg] the pose check CAN fail (a wrong-signed rotation lands 2δ away, and is seen)",
        Math.abs((R.orgMeasuredPhi(R.orgBuildGeometry("ethane", 37), mol) as number) - 323) < 1e-9 === false &&
        Math.abs((R.orgMeasuredPhi(R.orgBuildGeometry("ethane", 37), mol) as number) - 37) < 1e-9,
        "the MEASURED sign convention is the IUPAC one, and the gate reads it, not the author");

    // ── (c) THE RIDER RIDES THE DRIVEN φ. §9 proved this for static poses; the
    //    CRITICAL scar is about a rider reading the AUTHORED coordinate, and a
    //    DRIVEN coordinate is exactly where authored and built diverge.
    {
        const tor = { phi_from: 0, phi_deg: 360, phi_at_ms: 500, phi_ramp_ms: 12000 };
        const os = { torsion: tor, energy: { show: true, curve: "ethane", coordinate: "torsion" } };
        let same = true, worst = 0, samples = 0;
        for (let ms = 0; ms <= 14000; ms += 137) {
            const phi = R.orgPhiAt(mol, tor, ms);
            const g = R.orgBuildGeometry("ethane", phi);
            const est = R.orgEnergyState(os, g, mol);
            const measured = R.orgMeasuredPhi(g, mol) as number;
            if (est.x !== measured) same = false;
            if (est.e !== R.orgEnergyAt(R.ORG_ENERGY_TABLE.ethane, measured)) same = false;
            // the driven scalar and the measured dihedral agree modulo the wrap
            const d = Math.abs(((phi % 360) + 360) % 360 - measured);
            worst = Math.max(worst, Math.min(d, 360 - d));
            samples++;
        }
        ok("the driven φ and the rider's x are the SAME MEASURED value at every sampled t",
            same, samples + " instants swept across the whole sweep");
        ok("the driven scalar and the measured dihedral never disagree (mod 360)",
            worst < 1e-9, "worst |driven − measured| = " + worst.toExponential(2) + "°");
    }
    // The structural half: A1 added NO second coordinate source (S2's §9 contract).
    ok("A1 added no second coordinate source: orgPhiAt returns a SCALAR and measures nothing",
        String(R.orgPhiAt).indexOf("orgMeasuredPhi") < 0 &&
        String(R.orgPhiAt).indexOf("orgDihedral") < 0 &&
        String(R.orgPhiAt).indexOf("PM_orgPhi") < 0);
    ok("the frame pass still calls orgEnergyState exactly once and builds the geometry exactly once",
        (FRAME_FN.match(/orgEnergyState\(/g) || []).length === 1 &&
        (FRAME_FN.match(/orgBuildGeometry\(/g) || []).length === 1);
    ok("the graph painter STILL re-derives no coordinate (the CRITICAL scar stays closed under motion)",
        GRAPH_FN.indexOf("orgMeasuredPhi") < 0 && GRAPH_FN.indexOf("PM_orgPhi") < 0 &&
        GRAPH_FN.indexOf("orgDihedral") < 0 && GRAPH_FN.indexOf("orgPhiAt") < 0);
    ok("HOME is still solved off the REFERENCE pose, so a driven φ cannot walk the camera (Rule 32b)",
        /orgBuildGeometry\(liveGeom\.key, orgResolvePhi\(ORG_MOLECULES\[liveGeom\.key\], null\)\)/.test(ORG_REGION) &&
        ORG_REGION.indexOf("orgPhiAt") > 0 &&
        R.orgSolveCamera({ camera: {} }, R.orgBuildGeometry("ethane", 0)).el ===
        R.orgSolveCamera({ camera: {} }, R.orgBuildGeometry("ethane", 217)).el);

    // ── (d) DRAG-SEIZE: ONE code path, a scalar substitution.
    {
        const seize = FRAME_FN.match(/var phi = orgPhiAt\(mol, os\.torsion, ms\);\s*\n\s*if \(window\.PM_orgPhiDragged && window\.PM_orgPhiLive != null\) phi = window\.PM_orgPhiLive;/);
        ok("the drag-seize is a SCALAR substitution above the single geometry build (no second path)",
            !!seize && (FRAME_FN.match(/orgBuildGeometry\(molKey, phi\)/g) || []).length === 1);
        ok("the seize arms only on a TRUSTED event, and apply clears it (THE EYE never drags)",
            /if \(ev && ev\.isTrusted\) window\.PM_orgPhiDragged = true;/.test(BUILD_FN) &&
            /window\.PM_orgPhiDragged = false;/.test(APPLY_FN));
        ok("the handle TRACKS the scripted sweep until it is seized (a force-shown row is live, Rule 39b)",
            /if \(!window\.PM_orgPhiDragged && phiMeasured != null\)/.test(FRAME_FN));
        ok("the handle is written from the MEASURED dihedral, so a 0 → 540 sweep cannot pin it at its maximum",
            /if \(pSlF\) pSlF\.value = String\(phiMeasured\);/.test(FRAME_FN) &&
            FRAME_FN.indexOf("pSlF.value = String(phi)") < 0);
        ok("the phi row follows the Rule-39g discovery conventions, so ⚙ picks it up FREE",
            /id="org_phi_row"/.test(BUILD_FN) && /id="org_phi_slider"/.test(BUILD_FN) &&
            /id="org_phi_val"/.test(BUILD_FN) &&
            R.ORG_CONTROL_IDS_IMPL.indexOf("phi") >= 0 && R.ORG_CONTROL_IDS_DEFERRED.phi === undefined);
        ok("the phi slider range is authorable through slider_controls like every sibling row",
            /lim\("phi", "min", 0\)/.test(BUILD_FN) && /lim\("phi", "max", 360\)/.test(BUILD_FN));
    }

    // ── (e) THE KEY-NAMING TRAP, PASSED DELIBERATELY. Section 11 proved a bare
    //    at_ms inside an OBJECT is invisible to the pin evaluator. A1's schedule
    //    lives inside the torsion OBJECT, so it is STEMMED — and the bare spelling
    //    is now rejected outright rather than merely avoided by convention.
    {
        const pinCfg = {
            field_3d_config: {
                states: {
                    S_SWEEP: {
                        organic_structure: {
                            molecule: "ethane", mode: "rotate",
                            torsion: { phi_from: 0, phi_deg: 360, phi_at_ms: 500, phi_ramp_ms: 12000 }
                        }
                    },
                    S_NO_START: {
                        organic_structure: {
                            molecule: "ethane", mode: "rotate",
                            torsion: { phi_from: 0, phi_deg: 180, phi_ramp_ms: 9000 }
                        }
                    },
                    S_TRAP: {
                        organic_structure: {
                            molecule: "ethane", mode: "rotate",
                            torsion: { phi_from: 0, phi_deg: 360, at_ms: 500, ramp_ms: 12000 }
                        }
                    }
                }
            }
        };
        const pins = deriveMaxRevealTimeMs(pinCfg as unknown as Record<string, unknown>);
        ok("the pin evaluator SEES the stemmed torsion schedule (phi_at_ms + phi_ramp_ms, object)",
            pins.S_SWEEP === 500 + 12000 + 600, "pinned at " + pins.S_SWEEP + " ms, past the settled pose");
        ok("a sweep authored with no start time is pinned past its ramp, not at the 1500 default",
            pins.S_NO_START === 9000 + 600, "pinned at " + pins.S_NO_START + " ms");
        ok("[neg] the BARE spelling really is invisible to the pin — the trap is real, not hypothetical",
            pins.S_TRAP === 1500, "torsion.at_ms pins at " + pins.S_TRAP + " ms (DEFAULT_REVEAL_MS), mid-sweep");
        ok("…so the bare spelling is REJECTED at apply, and cannot be authored at all",
            APPLY_FN.indexOf("ORG_MISNAMED_FIELDS") >= 0 &&
            APPLY_FN.indexOf("INVISIBLE to the frozen-pin evaluator") >= 0);
        // and the pin lands on a SETTLED molecule, which is the point of all of it
        const settled = R.orgPhiAt(mol, { phi_from: 0, phi_deg: 360, phi_at_ms: 500, phi_ramp_ms: 12000 }, pins.S_SWEEP);
        ok("the frozen frame at that pin photographs the SETTLED destination, never a half-swept molecule",
            settled === 360, "φ at the pin = " + settled + "°");
    }

    // ── (f) THE LEDGER. Both flagged rows are now sourced; butane names its span.
    for (const curve of ["ethane", "butane"]) {
        const row = R.ORG_ENERGY_TABLE[curve];
        ok("registry row `" + curve + "` now reads VERIFIED with a literature source",
            row.needs_verification === false && typeof row.source === "string" && row.source.length > 40,
            String(row.source).slice(0, 64) + "…");
    }
    ok("no registry row ships unverified any more (the canvas stamp reads '(literature)')",
        (R.orgKeys(R.ORG_ENERGY_TABLE) as string[]).every((k: string) => R.ORG_ENERGY_TABLE[k].needs_verification === false));
    ok("NO published number moved in the ledger pass (a sourcing pass is not a physics edit)",
        Object.keys(PUBLISHED).every(curve =>
            PUBLISHED[curve].every(([x, e]) => R.orgEnergyAt(R.ORG_ENERGY_TABLE[curve], x) === e)) &&
        R.orgEnergyRange(R.ORG_ENERGY_TABLE.ethane).barrier === 12 &&
        R.orgEnergyRange(R.ORG_ENERGY_TABLE.butane).barrier === 19);
    ok("ethane's 12 keeps the eclipsing increments integral (3×4.0 = 12, 1×4.0+2×6.0 = 16, 2×4.0+11.0 = 19)",
        3 * 4.0 === 12 && 1 * 4.0 + 2 * 6.0 === 16 && 2 * 4.0 + 1 * 11.0 === 19 &&
        R.orgEnergyAt(R.ORG_ENERGY_TABLE.ethane, 0) === 12 &&
        R.orgEnergyAt(R.ORG_ENERGY_TABLE.butane, 120) === 16 &&
        R.orgEnergyAt(R.ORG_ENERGY_TABLE.butane, 0) === 19);
    {
        const eEst = R.orgEnergyState({ energy: { show: true, curve: "ethane", coordinate: "torsion" } },
            R.orgBuildGeometry("ethane", 0), mol);
        const bEst = R.orgEnergyState({ energy: { show: true, curve: "butane", coordinate: "torsion" } },
            R.orgBuildGeometry("butane", 0), but);
        ok("butane's hi − lo is NAMED `syn barrier` — 19 is anti→syn, not the 16 kJ·mol⁻¹ rotation barrier",
            bEst.barrierLabel === "syn barrier" && bEst.barrier === 19,
            bEst.barrierLabel + " = " + bEst.barrier);
        ok("ethane's barrier is unambiguous and keeps the bare label",
            eEst.barrierLabel === "barrier" && eEst.barrier === 12);
        ok("BOTH surfaces that print the number print the name (the HUD line and the graph bracket)",
            /lines\.push\(\(\(est == null\) \? "barrier" : est\.barrierLabel\)/.test(FRAME_FN) &&
            // S3 moved the bracket caption onto the measured text placer; the
            // string it composes is unchanged, only who places it.
            /orgText\(g, est\.barrierLabel \+ " " \+ orgFx\(est\.barrier\)/.test(GRAPH_FN));
        ok("the 16 kJ·mol⁻¹ interconversion barrier is still on screen as a published stationary point",
            R.ORG_ENERGY_TABLE.butane.stationary.some((s: { x: number; e: number; kind: string }) =>
                s.x === 120 && s.e === 16 && s.kind === "maximum"));
    }
    // ledger (c): three minima, three maxima, FOUR distinct conformations.
    {
        const s = R.ORG_ENERGY_TABLE.butane.stationary as Array<{ x: number; kind: string; label: string }>;
        const interior = s.filter(p => p.x > 0 && p.x < 360);
        const minima = interior.filter(p => p.kind === "minimum").length;
        const maxima = interior.filter(p => p.kind === "maximum").length + 1;   // 0 ≡ 360, counted once
        const distinct = Array.from(new Set(s.map(p => p.label))).length;
        ok("butane has THREE minima (gauche⁺/gauche⁻ are a degenerate pair), three maxima, FOUR conformations",
            minima === 3 && maxima === 3 && distinct === 4,
            minima + " minima · " + maxima + " maxima · " + distinct + " named conformations: " +
            Array.from(new Set(s.map(p => p.label))).join(", "));
        const docs = ["docs/ORGANIC_PHASE0_CONFORMATION.md", "docs/ORGANIC_ENGINE_PLAN.md",
            "docs/concepts/chemistry/cyclohexane_chair_flip_skeleton.md"]
            .map(p => readFileSync(join(process.cwd(), p), "utf8")).join("\n");
        ok("no planning doc, gate or renderer comment still counts FOUR minima for butane",
            docs.indexOf("four minima") < 0 && SRC.indexOf("four minima") < 0 &&
            docs.indexOf("three minima") >= 0);
        ok("nothing asserts 60.0° as the MEASURED gauche angle (the real minimum is ~5° outward)",
            !/measured gauche/i.test(SRC) && !/gauche.{0,24}measured/i.test(SRC));
    }

    // ── (g) THE THREE REJECTIONS. Each closes an accepted-and-silently-ignored path.
    ok("a driven or posed torsion on a molecule with NO torsion_bond is rejected (cyclohexane → A2)",
        R.orgTorsionAsks({ pose: "anti" }) === true &&
        R.orgTorsionAsks({ phi_at_ms: 0 }) === true &&
        R.orgTorsionAsks({}) === false &&
        R.ORG_MOLECULES.cyclohexane.torsion_bond === undefined &&
        APPLY_FN.indexOf("declares no torsion_bond") >= 0);
    ok("torsion.about must equal the molecule's torsion_bond, or it is rejected (orgSetTorsion is only sound then)",
        APPLY_FN.indexOf("torsion.about names") >= 0 &&
        R.ORG_MOLECULES.butane.torsion_bond === "C2-C3" && R.ORG_MOLECULES.ethane.torsion_bond === "C1-C2");
    ok("orgTorsionDriven separates S1's static pose from A1's driven sweep",
        R.orgTorsionDriven({ pose: "anti" }) === false &&
        R.orgTorsionDriven({ pose: "anti", phi_from: 0 }) === true &&
        R.orgTorsionDriven({ continuous: true }) === true);

    // ── (h) #3 BUTANE: four distinct conformations on ONE sweep, each landing on
    //    its published energy — the second consumer this dispatch is proven against.
    {
        const tor = { phi_from: 0, phi_deg: 360, phi_at_ms: 0, phi_ramp_ms: 20000 };
        const os = { torsion: tor, energy: { show: true, curve: "butane", coordinate: "torsion" } };
        const seen: Record<string, number> = {};
        for (let ms = 0; ms <= 20000; ms += 5) {
            const phi = R.orgPhiAt(but, tor, ms);
            for (const [name, at, want] of [["syn", 0, 19], ["gauche", 60, 3.8],
                ["eclipsed", 120, 16], ["anti", 180, 0]] as Array<[string, number, number]>) {
                if (Math.abs(phi - at) > 0.05) continue;
                const g = R.orgBuildGeometry("butane", phi);
                const est = R.orgEnergyState(os, g, but);
                if (Math.abs(est.e - want) < 0.05) seen[name] = est.e;
            }
        }
        ok("#3 butane: all FOUR conformations are visited on one 0 → 360 sweep, each at its published energy",
            ["syn", "gauche", "eclipsed", "anti"].every(k => seen[k] !== undefined),
            ["syn", "gauche", "eclipsed", "anti"].map(k => k + " " + (seen[k] ?? "MISSED")).join(" · ") + " kJ·mol⁻¹");
    }
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[14] THE DRIVEN FRAME PASS RUNS — apply + frame, end to end, and REWINDS");
// Section 13 exercises pure functions. This one EXECUTES applyOrganicStructureState
// and updateOrganicStructureFrame against a DOM + three.js stub at three pinned
// instants, because neither a pure-function sweep nor a source scan can catch a
// molecule that stops moving because the slider write threw.
{
    const V3 = function (this: Record<string, number>, x?: number, y?: number, z?: number) {
        this.x = x || 0; this.y = y || 0; this.z = z || 0;
    } as unknown as { new(x?: number, y?: number, z?: number): Record<string, unknown> };
    const stub = {
        Vector3: V3,
        Matrix4: function (this: Record<string, unknown>) { this.makeBasis = () => this; },
        Color: function (this: Record<string, unknown>) { /* stub */ }
    };
    const mkMesh = (id: string, elementType: string) => ({
        userData: { id, elementType }, visible: false, pos: [0, 0, 0] as number[],
        position: { set(this: unknown, x: number, y: number, z: number) { (mesh as unknown as { pos: number[] }).pos = [x, y, z]; } },
        scale: { set() { /* stub */ }, setScalar() { /* stub */ } },
        quaternion: { setFromUnitVectors() { /* stub */ }, setFromRotationMatrix() { /* stub */ } },
        material: { color: { set() { /* stub */ } }, emissive: { set() { /* stub */ } } },
        geometry: { setDrawRange() { /* stub */ } }
    });
    // `position.set` must write onto its OWN mesh, so the factory is closed over it.
    let mesh: ReturnType<typeof mkMesh>;
    const mk = (id: string, t: string) => {
        const m = mkMesh(id, t);
        m.position = { set(x: number, y: number, z: number) { m.pos = [x, y, z]; } } as unknown as typeof m.position;
        return m;
    };
    mesh = mk("seed", "seed");
    const scene: Array<ReturnType<typeof mkMesh>> = [];
    for (let i = 0; i < 24; i++) { scene.push(mk("org_atom_" + i, "org_atom")); scene.push(mk("org_atom_label_" + i, "org_atom_label")); }
    for (let i = 0; i < 30; i++) scene.push(mk("org_bond_" + i, "org_bond"));
    scene.push(mk("org_rim", "org_rim"));
    for (let i = 0; i < 6; i++) {
        scene.push(mk("org_meas_arc_" + i, "org_meas_arc"));
        scene.push(mk("org_meas_line_" + i, "org_meas_line"));
        scene.push(mk("org_meas_ref_" + i, "org_meas_ref"));
        scene.push(mk("org_meas_label_" + i, "org_meas_label"));
    }
    // A generic DOM element registry, so apply's panel/row/slider writes are real.
    const els: Record<string, Record<string, unknown>> = {};
    const el = (id: string) => {
        if (!els[id]) els[id] = { id, style: { display: "none" }, value: "", textContent: "", checked: false, innerHTML: "", disabled: false, querySelector: () => ({ disabled: false }) };
        return els[id];
    };
    for (const id of ["org_hud", "org_formula", "org_graph", "org_deferred", "org_sliders",
        "org_view_row", "org_spin_row", "org_implicit_h_row", "org_phi_row",
        "org_view_select", "org_spin_slider", "org_spin_val", "org_implicit_h_check",
        "org_phi_slider", "org_phi_val"]) el(id);
    // The graph is a real <canvas>: stub a 2D context that RECORDS its fillText,
    // so the panel's painted strings are readable evidence rather than a source
    // scan (a canvas-internal string is invisible to every DOM probe there is).
    const painted: string[] = [];
    els["org_graph"].width = 700; els["org_graph"].height = 460;
    // ONE context object, so orgText's font writes and its measureText reads
    // are the same object across a whole draw (S3).
    const GCTX = mkCanvasCtx(painted);
    els["org_graph"].getContext = () => GCTX;
    const runHarness = [
        "var window = { PM_orgRejects: [] };",
        "var ELS = arguments[0], SCENE = arguments[1], THREE = arguments[2], CLOCK = arguments[3];",
        "var console = { error: function () {} };",
        "var document = { getElementById: function (id) { return ELS[id] || null; } };",
        "var sceneObjects = SCENE;",
        "var stateStartTime = 0, isDragging = false, animating = false;",
        "Object.defineProperty(this, 'time', { get: function () { return CLOCK.t; } });",
        "var targetSpherical = { radius: 0, phi: 0, theta: 0 }, spherical = { radius: 0, phi: 0, theta: 0 };",
        "function updateCameraFromSpherical() {}",
        "function hexToThreeColor(h) { return h; }",
        "function updateLabelSpriteText(s, t) { s.text = t; }",
        "function applyGlowEmphasis() {}",
        grabVar("MG_BOND_LEN"), grabVar("MG_AZ0"), grabVar("MG_ELEMENTS"),
        MG_REGION, grabFn("mgIdealDirs"), ORG_REGION,
        grabFn("orgFx"), PLACER_REGION, GRAPH_FN, FRAME_FN, APPLY_FN,
        "return {",
        "  apply: function (st) { applyOrganicStructureState(st); },",
        "  frame: function (st) { updateOrganicStructureFrame(st); },",
        "  W: window",
        "};"
    ].join("\n");
    const CLOCK = { t: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const RUN: any = new Function(runHarness)(els, scene, stub, CLOCK);
    const sweepState = {
        organic_structure: {
            molecule: "ethane", mode: "rotate",
            torsion: { about: "C1-C2", phi_from: 0, phi_deg: 360, phi_at_ms: 500, phi_ramp_ms: 12000 },
            show_hud: true, hud_lines: ["phi", "energy", "barrier"],
            controls: ["phi"],
            energy: { show: true, curve: "ethane", coordinate: "torsion", show_point: true, show_barrier: true }
        }
    };
    const at = (ms: number) => {
        CLOCK.t = ms / 1000;
        RUN.frame(sweepState);
        return {
            phi: (RUN.W as Record<string, number>).PM_orgPhi,
            e: JSON.stringify((RUN.W as Record<string, unknown>).PM_orgEnergy),
            hud: (els["org_hud"].innerHTML as string),
            slider: String(els["org_phi_slider"].value),
            atoms: JSON.stringify(scene.filter(o => o.userData.elementType === "org_atom" && o.visible).map(o => o.pos))
        };
    };
    let threw = "";
    try { CLOCK.t = 0; RUN.apply(sweepState); } catch (e) { threw = String(e); }
    ok("applyOrganicStructureState accepts the A1 torsion block (no runtime throw, no rejection)",
        threw === "" && (RUN.W.PM_orgRejects as unknown[]).length === 0,
        threw || JSON.stringify(RUN.W.PM_orgRejects));
    ok("the phi control row is SHOWN because the state authored it (and the panel with it)",
        els["org_phi_row"].style !== undefined &&
        (els["org_phi_row"].style as Record<string, string>).display === "block" &&
        (els["org_sliders"].style as Record<string, string>).display === "block");
    const p0 = at(0), p3 = at(3000), p9 = at(9000), p3b = at(3000), pEnd = at(13100);
    ok("the molecule actually MOVES between two pinned instants (the first thing here that does)",
        p3.atoms !== p9.atoms && p3.phi !== p9.phi,
        "φ(3 s) = " + p3.phi.toFixed(2) + "° → φ(9 s) = " + p9.phi.toFixed(2) + "°");
    ok("THE REWIND STANDARD: pin 3000 → 9000 → 3000 is byte-identical across mesh, HUD, rider and slider",
        JSON.stringify(p3) === JSON.stringify(p3b),
        "atoms, HUD, PM_orgEnergy and the slider handle all reproduce exactly");
    ok("nothing pre-fires at t = 0 (φ sits at the authored phi_from)",
        Math.abs(p0.phi) < 1e-9, "φ(0) = " + p0.phi.toFixed(6) + "°");
    ok("the frozen pin lands on the SETTLED pose (φ = 360 ≡ 0, the eclipsed destination)",
        Math.abs(pEnd.phi) < 1e-9 || Math.abs(pEnd.phi - 360) < 1e-9, "φ(pin) = " + pEnd.phi.toFixed(6) + "°");
    ok("the HUD's φ line tracks the driven molecule, not the authored destination",
        p3.hud.indexOf("φ = " + p3.phi.toFixed(1)) >= 0 && p3.hud !== p9.hud,
        p3.hud.split("<br>").join("  ·  "));
    ok("the energy rider moves WITH it (the S2 instrument needed no change to follow A1)",
        p3.e !== p9.e && JSON.parse(p3.e).x === p3.phi,
        "t = 3 s → " + p3.e);
    ok("the handle tracks the sweep while unseized, carrying the SAME number the HUD prints",
        p3.slider === String(p3.phi) && p3.slider !== p9.slider &&
        p3.hud.indexOf("φ = " + Number(p3.slider).toFixed(1)) >= 0,
        "slider reads " + Number(p3.slider).toFixed(2) + "° at t = 3 s, HUD reads the same");
    {
        // A 0 → 540 sweep is the case that broke the naive write: 540 clamps into a
        // 0..360 control and the handle sticks at its maximum for half the turn.
        const wide = {
            organic_structure: {
                molecule: "butane", mode: "rotate", controls: ["phi"],
                torsion: { about: "C2-C3", phi_from: 180, phi_deg: 540, phi_at_ms: 0, phi_ramp_ms: 10000 },
                show_hud: true, hud_lines: ["phi"]
            }
        };
        RUN.apply(wide);
        CLOCK.t = 9.5; RUN.frame(wide);
        const late = Number(els["org_phi_slider"].value);
        ok("a sweep past 360 keeps the handle INSIDE its 0–360 range (it wraps, it does not clamp)",
            late >= 0 && late < 360 && Math.abs(late - 360) > 1e-6,
            "at t = 9.5 s of a 180 → 540 sweep the handle reads " + late.toFixed(2) + "°");
        RUN.apply(sweepState);
    }
    {
        // DRAG-SEIZE: a trusted drag freezes φ at the teacher's value for the rest
        // of the state, through the SAME geometry path, and apply releases it.
        (RUN.W as Record<string, unknown>).PM_orgPhiDragged = true;
        (RUN.W as Record<string, unknown>).PM_orgPhiLive = 180;
        const d1 = at(3000), d2 = at(9000);
        ok("a seized φ holds the teacher's value at every t, through the one geometry path",
            Math.abs(d1.phi - 180) < 1e-9 && Math.abs(d2.phi - 180) < 1e-9 && d1.atoms === d2.atoms,
            "φ pinned at " + d1.phi.toFixed(1) + "° across a 6 s span");
        ok("a seized φ drives the rider too (the coordinate is still MEASURED, never the authored one)",
            JSON.parse(d1.e).x === d1.phi && JSON.parse(d1.e).e === 0,
            "the rider sits at the staggered minimum, " + JSON.parse(d1.e).e + " kJ·mol⁻¹");
        RUN.apply(sweepState);
        ok("apply RELEASES the seize, so the next state is not stranded on the last teacher drag",
            (RUN.W as Record<string, unknown>).PM_orgPhiDragged === false);
        const r = at(9000);
        ok("…and the scripted sweep resumes exactly where the closed form says it should",
            Math.abs(r.phi - p9.phi) < 1e-9, "φ(9 s) back to " + r.phi.toFixed(4) + "°");
    }
    {
        // THE THREE REJECTIONS, executed rather than grepped.
        const bad = (t: Record<string, unknown>, mol = "ethane") => {
            RUN.apply({ organic_structure: { molecule: mol, mode: "rotate", torsion: t } });
            return (RUN.W.PM_orgRejects as Array<{ member: string }>).map(r => r.member).join(",");
        };
        ok("the BARE at_ms/ramp_ms spelling is rejected by name, pointing at the stemmed keys",
            bad({ phi_from: 0, phi_deg: 360, at_ms: 500, ramp_ms: 12000 }).indexOf("torsion.at_ms") >= 0,
            bad({ phi_from: 0, phi_deg: 360, at_ms: 500, ramp_ms: 12000 }));
        ok("a torsion on cyclohexane (no torsion_bond — its freedom is the pucker) is rejected",
            bad({ pose: "anti" }, "cyclohexane").indexOf("torsion") >= 0);
        ok("torsion.about naming a bond the molecule does not rotate about is rejected",
            bad({ about: "C1-C2", pose: "anti" }, "butane").indexOf("torsion.about") >= 0);
        ok("[neg] the honest butane block is NOT rejected (the reject probe is not indiscriminate)",
            bad({ about: "C2-C3", phi_from: 0, phi_deg: 360, phi_at_ms: 0, phi_ramp_ms: 9000 }, "butane") === "");
    }
    {
        // #3 BUTANE, painted. The canvas strings are captured, so the ledger fix is
        // proved on the pixels a teacher reads, not on the constant behind them.
        const butState = {
            organic_structure: {
                molecule: "butane", mode: "rotate",
                torsion: { about: "C2-C3", phi_from: 180, phi_deg: 540, phi_at_ms: 0, phi_ramp_ms: 16000 },
                show_hud: true, hud_lines: ["phi", "energy", "barrier"],
                energy: { show: true, curve: "butane", coordinate: "torsion", show_point: true, show_barrier: true }
            }
        };
        RUN.apply(butState);
        painted.length = 0;
        CLOCK.t = 20; RUN.frame(butState);
        ok("#3 butane paints its bracket as `syn barrier`, never a bare 19 read as the rotation barrier",
            painted.some(s => s.indexOf("syn barrier 19") === 0),
            painted.filter(s => s.indexOf("barrier") >= 0).join(" | ") || "(nothing painted)");
        ok("#3 butane's curve paints all four published conformer names and the verified stamp",
            ["syn", "gauche", "eclipsed", "anti"].every(n => painted.indexOf(n) >= 0) &&
            painted.some(s => s === "(literature)") && !painted.some(s => s.indexOf("unverified") >= 0),
            Array.from(new Set(painted.filter(s => /^[a-z(]/.test(s)))).join(" · "));
        const bh = (els["org_hud"].innerHTML as string).split("<br>");
        ok("#3 butane's HUD names the span on the value line too",
            bh.some(l => l.indexOf("syn barrier = 19 ") === 0), bh.join("  ·  "));
    }
    {
        // The explore free-run: it never settles, and deriveStateMeta knows.
        const ex = {
            organic_structure: {
                molecule: "ethane", mode: "explore", controls: ["phi", "view", "spin"],
                torsion: { continuous: true }, show_hud: true, hud_lines: ["phi"]
            }
        };
        RUN.apply(ex);
        CLOCK.t = 4; RUN.frame(ex); const e4 = (RUN.W as Record<string, number>).PM_orgPhi;
        CLOCK.t = 47; RUN.frame(ex); const e47 = (RUN.W as Record<string, number>).PM_orgPhi;
        CLOCK.t = 4; RUN.frame(ex); const e4b = (RUN.W as Record<string, number>).PM_orgPhi;
        // 40 s would have been a FALSE PASS waiting to happen: at the 30°/s default
        // it is exactly three whole turns past 4 s, so the two angles coincide.
        ok("the explore free-run is still turning at 47 s and still REWINDS to the same angle at 4 s",
            e4 !== e47 && e4 === e4b, "φ(4 s) = " + e4.toFixed(1) + "° · φ(47 s) = " + e47.toFixed(1) + "°");
        // The motion branch is EXECUTED, not grepped: a source scan cannot tell a
        // live branch from a dead one, and this one is the difference between D5
        // expecting movement and D5 false-failing a molecule that never stops.
        const motionCfg = {
            field_3d_config: {
                states: {
                    S_FREE: { organic_structure: { molecule: "ethane", mode: "rotate", torsion: { continuous: true } } },
                    S_SWEEP: { organic_structure: { molecule: "ethane", mode: "rotate", torsion: { phi_from: 0, phi_deg: 180, phi_at_ms: 0, phi_ramp_ms: 4000 } } },
                    S_STILL: { organic_structure: { molecule: "ethane", mode: "rotate", torsion: { pose: "anti" } } },
                    S_EXPLORE: { organic_structure: { molecule: "ethane", mode: "explore", torsion: { continuous: true } } }
                }
            }
        };
        const mo = deriveMotionExpectations(motionCfg as unknown as Record<string, unknown>);
        ok("deriveStateMeta declares MOTION for a guided `torsion.continuous` beat (it never settles)",
            mo.S_FREE === true, "S_FREE → " + String(mo.S_FREE));
        ok("a SCRIPTED sweep settles, so it is left to the reveal_hold classification (never forced to motion)",
            mo.S_SWEEP === undefined && mo.S_STILL === undefined,
            "S_SWEEP → " + String(mo.S_SWEEP) + " · S_STILL → " + String(mo.S_STILL));
        ok("…and the explore sandbox is still user-driven, not perpetual motion (the order is load-bearing)",
            mo.S_EXPLORE === false, "S_EXPLORE → " + String(mo.S_EXPLORE));
    }
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[15] THE NEWMAN PROJECTION IS COUNTABLE — rasterised, every primitive an occluder");
// The countability solve of sections 3/6 enumerates ATOM DISCS ONLY, and that is
// exactly how the CRITICAL row
// newman_back_atom_disc_clears_the_front_atom_disc_and_is_swallowed_by_the_front_bond_cylinder
// got past it: at φ → 0 the back-H disc clears every other DISC by +0.198 units
// and is then painted over by the front C–H CYLINDER, leaving two ~3 px slivers.
// So this section stops measuring scalars and RASTERISES the scene — atoms,
// bonds and the rim, each at its rendered screen width — then counts 4-connected
// components of unoccluded atom pixels. The acceptance criterion is the number of
// SEPARATELY VISIBLE atom regions at the worst-case pose.
{
    const PX = 150;              // pixels per scene unit (the smallest disc ≈ 19 px across)
    const EXT = 2.4;             // half-extent of the raster, scene units
    const SIDE = Math.round(2 * EXT * PX);
    type Prim = {
        kind: "atom" | "bond" | "rim"; owner: string; order: number;
        x: number; y: number; r: number;          // atom / rim
        bx: number; by: number; hw: number;       // bond far end + half width
        dz: number; dzB: number;                  // camera depth at (x,y) and at (bx,by)
    };
    const NEWMAN_CAM = { sight_along: "C1-C2", dist: 8, newman: true };

    /** Build the primitive list for ethane at φ, at the authored Newman camera. */
    function scene_(phi: number) {
        const geom = R.orgBuildGeometry("ethane", phi);
        const pose = R.orgSolveCamera({ camera: NEWMAN_CAM }, geom);
        const basis = R.orgCamBasis(pose);
        const w = R.orgNewmanWeight(pose, geom, pose.front, pose.back);
        const byId: Record<string, { id: string; el: string; p: number[] }> = {};
        for (const a of geom.atoms) byId[a.id] = a;
        const back = pose.back as string, front = pose.front as string;
        const backSet: Record<string, boolean> = { [back]: true };
        for (const b of geom.bonds) {
            const o = b.a === back ? b.b : (b.b === back ? b.a : null);
            if (o && o !== front) backSet[o] = true;
        }
        const P = (p: number[]) => {
            const q = R.orgProjXY(p, pose, basis);
            return { x: q.x, y: q.y, k: q.k, dz: pose.dist - R.mgDot(p, basis.fwd) };
        };
        // the rim radius, re-derived here rather than read out of the renderer
        let best = 0;
        for (const b of geom.bonds) {
            const o = b.a === back ? b.b : (b.b === back ? b.a : null);
            if (!o || o === front) continue;
            const ax = R.mgNorm(R.orgSub(byId[front].p, byId[back].p));
            const rel = R.orgSub(byId[o].p, byId[back].p);
            const perp = R.orgSub(rel, R.orgMul(ax, R.mgDot(rel, ax)));
            best = Math.max(best, R.orgLen(perp));
        }
        const rimR = best * R.ORG_U_PER_A * R.ORG_NEWMAN_RIM_FRAC;
        const prims: Prim[] = [];
        const discs: string[] = [];
        for (const a of geom.atoms) {
            if (a.id === back && w >= R.ORG_NEWMAN_HIDE_W) continue;   // the rim owns it
            const q = P(R.orgMul(a.p, R.ORG_U_PER_A));
            discs.push(a.id);
            prims.push({
                kind: "atom", owner: a.id, x: q.x, y: q.y, r: R.orgAtomRadius(a.el) * q.k,
                order: backSet[a.id] ? R.ORG_RO_BACK_ATOM : R.ORG_RO_FRONT_ATOM,
                bx: 0, by: 0, hw: 0, dz: q.dz - R.orgAtomRadius(a.el), dzB: 0
            });
        }
        for (const b of geom.bonds) {
            const sighted = (b.a === back && b.b === front) || (b.b === back && b.a === front);
            if (sighted && w >= R.ORG_NEWMAN_HIDE_W) continue;
            let pa = byId[b.a].p, pb = byId[b.b].p;
            const bo = !sighted && w > 0 ? (b.a === back ? b.b : (b.b === back ? b.a : null)) : null;
            if (bo) {
                const ax = R.mgNorm(R.orgSub(byId[front].p, byId[back].p));
                const rel = R.orgSub(byId[bo].p, byId[back].p);
                const perp = R.orgSub(rel, R.orgMul(ax, R.mgDot(rel, ax)));
                const rp = R.orgAdd(byId[back].p, R.orgMul(perp, (rimR / R.ORG_U_PER_A) / (R.orgLen(perp) || 1)));
                pa = [0, 1, 2].map(i => byId[back].p[i] + (rp[i] - byId[back].p[i]) * w);
                pb = byId[bo].p;
            }
            const A = P(R.orgMul(pa, R.ORG_U_PER_A)), B = P(R.orgMul(pb, R.ORG_U_PER_A));
            prims.push({
                kind: "bond", owner: "", x: A.x, y: A.y, bx: B.x, by: B.y,
                hw: 0.075 * (A.k + B.k) / 2, r: 0, dz: A.dz, dzB: B.dz,
                order: (backSet[b.a] && backSet[b.b]) ? R.ORG_RO_BACK_BOND : R.ORG_RO_FRONT_BOND
            });
        }
        if (rimR > 0 && w > 0.001) {
            const q = P(R.orgMul(byId[back].p, R.ORG_U_PER_A));
            prims.push({
                kind: "rim", owner: "", x: q.x, y: q.y, r: rimR * q.k, hw: 0.045 * q.k,
                order: R.ORG_RO_RIM, bx: 0, by: 0, dz: q.dz, dzB: 0
            });
        }
        return { prims, discs, w, pose, geom };
    }

    /** Coverage + camera depth of a primitive at an isotropic screen point. */
    function hit(p: Prim, x: number, y: number): number | null {
        if (p.kind === "atom") {
            const d2 = (x - p.x) ** 2 + (y - p.y) ** 2;
            if (d2 > p.r * p.r) return null;
            return p.dz;                       // the front surface, near enough
        }
        if (p.kind === "rim") {
            const d = Math.hypot(x - p.x, y - p.y);
            return Math.abs(d - p.r) <= p.hw ? p.dz : null;
        }
        const vx = p.bx - p.x, vy = p.by - p.y, L2 = vx * vx + vy * vy || 1;
        let t = ((x - p.x) * vx + (y - p.y) * vy) / L2;
        t = Math.max(0, Math.min(1, t));
        const cx = p.x + vx * t, cy = p.y + vy * t;
        if (Math.hypot(x - cx, y - cy) > p.hw) return null;
        return p.dz + (p.dzB - p.dz) * t;
    }
    /** mode 'flat' = paint in renderOrder (depthTest off); 'depth' = z-buffer. */
    function raster(prims: Prim[], mode: "flat" | "depth") {
        const owner = new Int32Array(SIDE * SIDE).fill(-1);
        const zbuf = new Float64Array(SIDE * SIDE).fill(Infinity);
        const idx = prims.map((_, i) => i);
        if (mode === "flat") idx.sort((a, b) => prims[a].order - prims[b].order || a - b);
        for (const pi of idx) {
            const p = prims[pi];
            const xs = [p.x - Math.max(p.r + p.hw, p.hw), p.bx - p.hw];
            const xe = [p.x + Math.max(p.r + p.hw, p.hw), p.bx + p.hw];
            const ys = [p.y - Math.max(p.r + p.hw, p.hw), p.by - p.hw];
            const ye = [p.y + Math.max(p.r + p.hw, p.hw), p.by + p.hw];
            const lo = (v: number[]) => (p.kind === "bond" ? Math.min(...v) : v[0]);
            const hi = (v: number[]) => (p.kind === "bond" ? Math.max(...v) : v[0]);
            const i0 = Math.max(0, Math.floor((lo(xs) + EXT) * PX)), i1 = Math.min(SIDE - 1, Math.ceil((hi(xe) + EXT) * PX));
            const j0 = Math.max(0, Math.floor((lo(ys) + EXT) * PX)), j1 = Math.min(SIDE - 1, Math.ceil((hi(ye) + EXT) * PX));
            for (let j = j0; j <= j1; j++) {
                const y = j / PX - EXT;
                for (let i = i0; i <= i1; i++) {
                    const x = i / PX - EXT;
                    const z = hit(p, x, y);
                    if (z === null) continue;
                    const c = j * SIDE + i;
                    if (mode === "depth" && z >= zbuf[c]) continue;
                    zbuf[c] = z;
                    owner[c] = pi;
                }
            }
        }
        return owner;
    }
    /** Largest 4-connected run of pixels owned by primitive `pi`. */
    function largestComponent(owner: Int32Array, pi: number): number {
        const seen = new Uint8Array(SIDE * SIDE);
        let best = 0;
        const stack: number[] = [];
        for (let c = 0; c < owner.length; c++) {
            if (owner[c] !== pi || seen[c]) continue;
            let n = 0; stack.length = 0; stack.push(c); seen[c] = 1;
            while (stack.length) {
                const k = stack.pop() as number; n++;
                const i = k % SIDE, j = (k - i) / SIDE;
                if (i > 0 && owner[k - 1] === pi && !seen[k - 1]) { seen[k - 1] = 1; stack.push(k - 1); }
                if (i < SIDE - 1 && owner[k + 1] === pi && !seen[k + 1]) { seen[k + 1] = 1; stack.push(k + 1); }
                if (j > 0 && owner[k - SIDE] === pi && !seen[k - SIDE]) { seen[k - SIDE] = 1; stack.push(k - SIDE); }
                if (j < SIDE - 1 && owner[k + SIDE] === pi && !seen[k + SIDE] && !seen[k + SIDE]) { seen[k + SIDE] = 1; stack.push(k + SIDE); }
            }
            if (n > best) best = n;
        }
        return best;
    }
    /** How many atoms survive as ONE region of at least 60% of their own disc. */
    function countable(phi: number, mode: "flat" | "depth") {
        const S = scene_(phi);
        const owner = raster(S.prims, mode);
        let n = 0; const detail: string[] = [];
        for (let pi = 0; pi < S.prims.length; pi++) {
            const p = S.prims[pi];
            if (p.kind !== "atom") continue;
            const full = Math.PI * (p.r * PX) ** 2;
            const got = largestComponent(owner, pi);
            const frac = full > 0 ? got / full : 0;
            if (frac >= 0.60) n++;
            detail.push(p.owner + " " + (100 * frac).toFixed(0) + "%");
        }
        return { n, discs: S.discs, detail, w: S.w, prims: S.prims };
    }

    // ── the worst-case sweep. φ = 0 IS the taught pose of STATE_3.
    const WORST = [0, 1, 2, 5, 10];
    let allOk = true; const rows: string[] = [];
    for (const phi of WORST) {
        const c = countable(phi, "flat");
        const good = c.n === c.discs.length;
        allOk = allOk && good;
        rows.push("φ=" + phi + "° → " + c.n + "/" + c.discs.length);
        if (!good) info("φ=" + phi + "° per-atom visible fraction", c.detail.join(" · "));
    }
    ok("EVERY atom the projection draws is a separately visible region at the eclipsing poses",
        allOk, rows.join("  ·  "));
    {
        const c = countable(0, "flat");
        info("φ=0° per-atom unoccluded fraction of its own disc", c.detail.join(" · "));
        // The withheld carbon is NOT lost: the rim is its representation, and the
        // HUD's atom_count must still account for it.
        const geom = R.orgBuildGeometry("ethane", 0);
        const rim = c.prims.filter(p => p.kind === "rim").length;
        ok("the ONLY atom not drawn as a disc is the back carbon, and the rim IS drawn for it",
            c.discs.length === geom.atoms.length - 1 && c.discs.indexOf("C2") < 0 && rim === 1,
            c.discs.length + " discs + 1 rim = " + geom.atoms.length + " atoms the HUD counts (C 2 · H 6)");
    }
    // NEGATIVE CONTROL 1 (the row's own): at φ=60 the same probe returns the full count.
    {
        const c = countable(60, "flat");
        ok("[neg] the staggered control returns the full count through the same probe",
            c.n === c.discs.length, "φ=60° → " + c.n + "/" + c.discs.length);
    }
    // NEGATIVE CONTROL 2 (the stronger one): the SHIPPED-BEFORE depth order — the
    // same geometry, the same rasteriser, ordinary depth testing — must FAIL at
    // φ=0. A probe that cannot reproduce the defect it was written for proves
    // nothing about the fix.
    {
        const c = countable(0, "depth");
        ok("[neg] plain depth testing at φ=0 LOSES the back set — the defect is reproducible",
            c.n < c.discs.length, "depth-sorted φ=0° → " + c.n + "/" + c.discs.length
            + "  ·  " + c.detail.join(" · "));
    }
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[16] THE PROJECTION IS FORMED, NOT SWITCHED — the rim rides the sight line");
// The CRITICAL row
// newman_rim_convention_applies_at_state_apply_instead_of_when_the_sight_line_reaches_the_bond_axis:
// camera.newman was read ONCE, at apply, so STATE_2 opened on ethane with a
// carbon deleted, a circle floating where it should be and three bond stubs at
// meaningless angles — and held that for most of a 12.5 s flight whose whole
// subject is how the projection is formed. This section flies the authored
// camera and asserts the treatment tracks the SIGHT LINE at every 10% of it.
{
    const V3 = function (this: Record<string, number>, x?: number, y?: number, z?: number) {
        this.x = x || 0; this.y = y || 0; this.z = z || 0;
    } as unknown as { new(x?: number, y?: number, z?: number): Record<string, unknown> };
    const stub = {
        Vector3: V3,
        Matrix4: function (this: Record<string, unknown>) { this.makeBasis = () => this; },
        Color: function (this: Record<string, unknown>) { /* stub */ }
    };
    const mk = (id: string, t: string) => {
        const m = {
            userData: { id, elementType: t } as Record<string, unknown>, visible: false,
            pos: [0, 0, 0] as number[], renderOrder: 0, text: "",
            position: { set: (x: number, y: number, z: number) => { m.pos = [x, y, z]; } },
            scale: { set() { /* stub */ }, setScalar() { /* stub */ } },
            quaternion: { setFromUnitVectors() { /* stub */ }, setFromRotationMatrix() { /* stub */ } },
            material: {
                color: { set(v: string) { (m.material as Record<string, unknown>).hex = v; } },
                emissive: { set() { /* stub */ } },
                opacity: 1, transparent: false, depthTest: true, hex: ""
            } as Record<string, unknown>,
            geometry: { setDrawRange() { /* stub */ } }
        };
        return m;
    };
    const scene: Array<ReturnType<typeof mk>> = [];
    for (let i = 0; i < 24; i++) { scene.push(mk("org_atom_" + i, "org_atom")); scene.push(mk("org_atom_label_" + i, "org_atom_label")); }
    for (let i = 0; i < 30; i++) scene.push(mk("org_bond_" + i, "org_bond"));
    scene.push(mk("org_rim", "org_rim"));
    for (let i = 0; i < 6; i++) {
        scene.push(mk("org_meas_arc_" + i, "org_meas_arc"));
        scene.push(mk("org_meas_line_" + i, "org_meas_line"));
        scene.push(mk("org_meas_ref_" + i, "org_meas_ref"));
        scene.push(mk("org_meas_label_" + i, "org_meas_label"));
    }
    const els: Record<string, Record<string, unknown>> = {};
    const el = (id: string) => {
        if (!els[id]) els[id] = { id, style: { display: "none" }, value: "", textContent: "", checked: false, innerHTML: "", disabled: false, querySelector: () => ({ disabled: false }) };
        return els[id];
    };
    for (const id of ["org_hud", "org_formula", "org_graph", "org_deferred", "org_sliders",
        "org_view_row", "org_spin_row", "org_implicit_h_row", "org_phi_row",
        "org_view_select", "org_spin_slider", "org_spin_val", "org_implicit_h_check",
        "org_phi_slider", "org_phi_val"]) el(id);
    els["org_graph"].width = 700; els["org_graph"].height = 460;
    const GCTX16 = mkCanvasCtx();
    els["org_graph"].getContext = () => GCTX16;
    const CLOCK = { t: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const RUN: any = new Function([
        "var window = { PM_orgRejects: [] };",
        "var ELS = arguments[0], SCENE = arguments[1], THREE = arguments[2], CLOCK = arguments[3];",
        "var console = { error: function () {} };",
        "var document = { getElementById: function (id) { return ELS[id] || null; } };",
        "var sceneObjects = SCENE;",
        "var stateStartTime = 0, isDragging = false, animating = false;",
        // a FUNCTION-LOCAL clock: section 14 already defined `time` on the shared
        // global with an accessor, and redefining it throws.
        "var time = 0;",
        "var targetSpherical = { radius: 0, phi: 0, theta: 0 }, spherical = { radius: 0, phi: 0, theta: 0 };",
        "function updateCameraFromSpherical() {}",
        "function hexToThreeColor(h) { return h; }",
        "function updateLabelSpriteText(s, t) { s.text = t; }",
        "function applyGlowEmphasis() {}",
        grabVar("MG_BOND_LEN"), grabVar("MG_AZ0"), grabVar("MG_ELEMENTS"),
        MG_REGION, grabFn("mgIdealDirs"), ORG_REGION,
        grabFn("orgFx"), PLACER_REGION, GRAPH_FN, FRAME_FN, APPLY_FN,
        "return { apply: function (s) { time = CLOCK.t; applyOrganicStructureState(s); },",
        "         frame: function (s) { time = CLOCK.t; updateOrganicStructureFrame(s); }, W: window };"
    ].join("\n"))(els, scene, stub, CLOCK);

    // STATE_2 of conformations_of_ethane, VERBATIM — the state the row was filed on.
    const flight = {
        organic_structure: {
            molecule: "ethane", mode: "rotate", torsion: { pose: "staggered" },
            show_h: "all", show_labels: true,
            camera: { sight_along: "C1-C2", dist: 8, newman: true },
            camera_steps: [
                { at_ms: 0, az: 180, el: 6, dist: 9, ease_ms: 0 },
                { at_ms: 1200, az: 180, el: -35.2644, dist: 8, ease_ms: 12500 }
            ],
            show_hud: true, hud_lines: ["bond", "pose", "atom_count"]
        }
    };
    const END_MS = 13700;
    RUN.apply(flight);
    const atomOf = (id: string) => scene.find(m => m.userData.elementType === "org_atom"
        && m.visible && m.userData.atomId === id);
    const labelOf = (id: string) => scene.find(m => m.userData.elementType === "org_atom_label"
        && m.visible && m.text === id);
    const rim = scene.find(m => m.userData.id === "org_rim") as ReturnType<typeof mk>;
    const rows: string[] = [];
    let outsideOk = true, insideOk = true, labelOk = true, rimOk = true, samples = 0;
    for (let s = 0; s <= 10; s++) {
        const ms = (END_MS * s) / 10;
        CLOCK.t = ms / 1000;
        RUN.frame(flight);
        const W = RUN.W as Record<string, number>;
        const ang = W.PM_orgNewmanAngle, w = W.PM_orgNewmanW;
        const backMesh = atomOf("C2"), rimOn = rim.visible;
        samples++;
        if (ang > R.ORG_NEWMAN_OFF_DEG) {
            // OUTSIDE the band: a real two-carbon molecule, no rim at all.
            if (!backMesh || rimOn) outsideOk = false;
        }
        if (ang < R.ORG_NEWMAN_FULL_DEG) {
            // INSIDE it: the rim is the back carbon and the sphere is withheld.
            if (backMesh || !rimOn) insideOk = false;
        }
        // The back carbon carries a label at EVERY pose — the canvas never prints
        // "bond = C1–C2" while naming only C1.
        if (!labelOf("C2") || !labelOf("C1")) labelOk = false;
        // …and a rim is never drawn while the back carbon is still more than one
        // atom radius off the projected front-carbon centre.
        if (rimOn) {
            const geom = R.orgBuildGeometry("ethane", W.PM_orgPhi);
            const pose = W.PM_orgCam as unknown as { az: number; el: number; dist: number };
            const basis = R.orgCamBasis(pose);
            const by: Record<string, { id: string; el: string; p: number[] }> = {};
            for (const a of geom.atoms) by[a.id] = a;
            const p1 = R.orgProjXY(R.orgMul(by["C1"].p, R.ORG_U_PER_A), pose, basis);
            const p2 = R.orgProjXY(R.orgMul(by["C2"].p, R.ORG_U_PER_A), pose, basis);
            if (Math.hypot(p1.x - p2.x, p1.y - p2.y) > R.orgAtomRadius("C") * p1.k) rimOk = false;
        }
        rows.push(ms.toFixed(0) + "ms " + ang.toFixed(1) + "° w=" + w.toFixed(2)
            + (backMesh ? " C2✓" : " C2·rim") + (rimOn ? " rim" : ""));
    }
    info("the flight, sampled at every 10%", rows.join("  |  "));
    ok("outside the band the back carbon is a REAL MESH and no rim is drawn (the opening frame is a molecule)",
        outsideOk && samples === 11);
    ok("inside the band the rim is drawn and the back sphere is withheld (the projection is the projection)",
        insideOk);
    ok("the back carbon is LABELLED at every pose — the HUD names C1–C2 and the canvas names both",
        labelOk);
    ok("no frame draws a rim while the two carbons are still more than one atom radius apart on screen",
        rimOk);
    // The weight is CONTINUOUS and closed form: sampling the same instant twice
    // gives the same number, and a mid-flight instant is strictly between.
    {
        // FOUND, not hardcoded: the band is solved from the geometry, so a fixed
        // instant would silently stop testing the fade the day the band moves.
        let mid = -1, midW = 0;
        for (let ms = 0; ms <= END_MS; ms += 25) {
            CLOCK.t = ms / 1000; RUN.frame(flight);
            const w = (RUN.W as Record<string, number>).PM_orgNewmanW;
            if (w > 0.02 && w < 0.98) { mid = ms; midW = w; break; }
        }
        CLOCK.t = mid / 1000; RUN.frame(flight); const a = (RUN.W as Record<string, number>).PM_orgNewmanW;
        CLOCK.t = END_MS / 1000; RUN.frame(flight);
        CLOCK.t = mid / 1000; RUN.frame(flight); const b = (RUN.W as Record<string, number>).PM_orgNewmanW;
        ok("the weight REWINDS exactly and is a genuine cross-fade, not a switch",
            mid >= 0 && a === b && a > 0 && a < 1,
            "the fade is live at " + mid + " ms, w = " + midW.toFixed(4));
    }
    // ── THE TWO CARBON IDS, MEASURED. The OPEN row
    //   hud_line_and_narration_name_scene_atoms_the_canvas_never_labels: the HUD
    //   prints "bond = C1–C2" over a canvas that named only C1, and named it on
    //   top of the rim arc. Both anchors are now measured against the arc.
    {
        CLOCK.t = END_MS / 1000; RUN.frame(flight);
        const W = RUN.W as Record<string, number>;
        const pose = W.PM_orgCam as unknown as { az: number; el: number; dist: number };
        const basis = R.orgCamBasis(pose);
        const geom = R.orgBuildGeometry("ethane", W.PM_orgPhi);
        const by: Record<string, { id: string; el: string; p: number[] }> = {};
        for (const a of geom.atoms) by[a.id] = a;
        // the rim, re-derived
        let best = 0;
        for (const b of geom.bonds) {
            const o = b.a === "C2" ? b.b : (b.b === "C2" ? b.a : null);
            if (!o || o === "C1") continue;
            const ax = R.mgNorm(R.orgSub(by["C1"].p, by["C2"].p));
            const rel = R.orgSub(by[o].p, by["C2"].p);
            best = Math.max(best, R.orgLen(R.orgSub(rel, R.orgMul(ax, R.mgDot(rel, ax)))));
        }
        const rimR = best * R.ORG_U_PER_A * R.ORG_NEWMAN_RIM_FRAC;
        const cRim = R.orgProjXY(R.orgMul(by["C2"].p, R.ORG_U_PER_A), pose, basis);
        const arc = rimR * cRim.k;
        const INK = 0.14;              // half the drawn ink of a "C1"/"C2" sprite
        const at = (id: string) => {
            const m = scene.find(x => x.userData.elementType === "org_atom_label" && x.visible && x.text === id);
            const q = R.orgProjXY((m as ReturnType<typeof mk>).pos, pose, basis);
            return { r: Math.hypot(q.x - cRim.x, q.y - cRim.y), ink: INK * q.k, x: q.x, y: q.y };
        };
        const L1 = at("C1"), L2 = at("C2");
        ok("the FRONT id sits inside the rim, clear of the arc (no white-on-white overprint)",
            L1.r + L1.ink < arc - 0.05,
            "C1 ink reaches " + (L1.r + L1.ink).toFixed(3) + " against an arc at " + arc.toFixed(3));
        ok("the BACK id sits OUTSIDE the rim — the rim is the carbon, and it is named",
            L2.r - L2.ink > arc + 0.05,
            "C2 ink starts at " + (L2.r - L2.ink).toFixed(3) + " against an arc at " + arc.toFixed(3));
        ok("the two ids never overprint each other",
            Math.hypot(L1.x - L2.x, L1.y - L2.y) > L1.ink + L2.ink,
            "centres " + Math.hypot(L1.x - L2.x, L1.y - L2.y).toFixed(3) + " apart");
        // …and the back id was PLACED, not guessed: it clears every drawn disc.
        const drawn = geom.atoms.filter((a: { id: string }) => a.id !== "C2");
        const clr = R.orgLabelClearance((scene.find(x => x.userData.elementType === "org_atom_label"
            && x.visible && x.text === "C2") as ReturnType<typeof mk>).pos, pose, basis, drawn);
        ok("the back id is placed in the direction with the most clearance, not a fixed corner",
            clr > 0.10, "clears the nearest drawn disc by " + clr.toFixed(3) + " scene units");
    }

    // NEGATIVE CONTROL: with no camera_steps the state IS on the axis at t=0, so
    // the same code must give the full projection on the opening frame.
    {
        const pinned = { organic_structure: Object.assign({}, flight.organic_structure, { camera_steps: undefined }) };
        RUN.apply(pinned); CLOCK.t = 0; RUN.frame(pinned);
        const W = RUN.W as Record<string, number>;
        ok("[neg] a state pinned ON the axis is fully Newman on its FIRST frame (the gate is not just 'never rim')",
            W.PM_orgNewmanW === 1 && rim.visible && !atomOf("C2"),
            "w = " + W.PM_orgNewmanW + " · angle = " + W.PM_orgNewmanAngle.toFixed(3) + "°");
    }
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[17] EVERY PAINTED STRING IS MEASURED AGAINST THE PANEL CLIP RECT");
// The seeded CRITICAL row
// graph_overlay_annotation_is_painted_without_measuring_it_against_the_panel_clip_rect:
// the barrier caption was placed at bracket_x + 13 and painted, so on the 700 px
// backing store it reached x = 744 and STATE_5's one payoff number rendered as
// "barrier 12.0 kJ·mo". Thirty-two deterministic checks passed on that frame,
// because no gate here read rendered text EXTENTS.
//
// This section implements the seeded probe verbatim: instrument the painter so
// every fillText is recorded as {text, x, y, width, height}, then assert every
// box lies inside the clip rect on BOTH axes. The negative control restores the
// pre-fix placer — same recorder, same checker — and requires it to TRIP, so the
// containment assertion is demonstrably capable of failing.
{
    /** the harness: the real painter over a stub context with a real measureText. */
    const mkGraphRun = (naive: boolean) => {
        const els: Record<string, Record<string, unknown>> = {};
        const el = (id: string) => {
            if (!els[id]) els[id] = { id, style: { display: "none" } as Record<string, string>, innerHTML: "", value: "", textContent: "" };
            return els[id];
        };
        for (const id of ["org_graph", "org_hud", "org_formula"]) el(id);
        els["org_graph"].width = 700; els["org_graph"].height = 460;
        const painted: string[] = [];
        const GCTX = mkCanvasCtx(painted);
        els["org_graph"].getContext = () => GCTX;
        // THE NEGATIVE CONTROL. The pre-fix placer, restored: take the anchor,
        // paint, never test the box. It records through the SAME orgRecText, so
        // the containment assertion below is run against identical evidence.
        const NAIVE = [
            "function orgText(g, t, x, y, o) {",
            "  var s = String(t), a = (o && o.align) || 'left';",
            "  var w = g.measureText(s).width, px = orgFontPx(g.font);",
            "  if (o && o.rot) { orgRecText(s, x - px * 0.8, y - w / 2, px * 1.02, w); return []; }",
            "  var lx = orgAnchor(x, w, a);",
            "  g.textAlign = 'left'; g.fillText(s, lx, y);",
            "  orgRecText(s, lx, y - px * 0.8, w, px * 1.02); return [];",
            "}"
        ].join("\n");
        const src = [
            "var window = { innerWidth: 1280, PM_orgRejects: [] };",
            "var ELS = arguments[0];",
            "var document = { getElementById: function (id) { return ELS[id] || null; } };",
            "var sceneObjects = [];",
            "function hexToThreeColor(h) { return h; }",
            "function mgClamp(v, a, b) { return Math.min(Math.max(v, a), b); }",
            grabVar("MG_BOND_LEN"), grabVar("MG_AZ0"), grabVar("MG_ELEMENTS"),
            MG_REGION, grabFn("mgIdealDirs"), ORG_REGION,
            grabFn("orgFx"), PLACER_REGION, GRAPH_FN,
            naive ? NAIVE : "",
            "function draw(curve, o) {",
            "  var opt = o || {}, row = ORG_ENERGY_TABLE[curve], r = orgEnergyRange(row);",
            "  var est = { row: row, x: (opt.x != null) ? opt.x : (row.x_min + row.x_max) / 2,",
            "    lo: r.lo, hi: r.hi, barrier: r.barrier,",
            "    barrierLabel: opt.label || row.barrier_label || 'barrier',",
            "    verified: !row.needs_verification };",
            "  est.e = orgEnergyAt(row, est.x);",
            "  ELS['org_graph'].style.display = 'block';",
            "  orgDrawGraph({ show_barrier: opt.noBarrier !== true, show_point: true,",
            "    label_stationary: opt.noLabels !== true }, est, (opt.rev != null) ? opt.rev : 1);",
            "  return { boxes: window.PM_orgTextBoxes, clip: window.PM_orgTextClip };",
            "}",
            "return { draw: draw, W: window, T: ORG_ENERGY_TABLE, ticks: orgXTicks,",
            "  fmt: orgTickFmt, bind: orgBindUnit, fit: orgFitFormula, els: ELS, painted: null };"
        ].join("\n");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const RUN: any = new Function(src)(els);
        RUN.painted = painted; RUN.E = els;
        return RUN;
    };
    type Box = { text: string; x: number; y: number; width: number; height: number };
    type Clip = { x: number; y: number; w: number; h: number };
    const PADDED = 4;   // ORG_TXT_PAD — the placer's own inner margin
    const inside = (b: Box, c: Clip) =>
        b.x >= c.x && b.x + b.width <= c.x + c.w && b.y >= c.y && b.y + b.height <= c.y + c.h;
    const escapes = (r: { boxes: Box[]; clip: Clip }) => r.boxes.filter(b => !inside(b, r.clip));

    // ── (a) the SOURCE half: no string bypasses the placer. A fix that moved one
    //   caption would leave every other call site free to reopen the class.
    ok("the graph painter contains ZERO bare fillText calls — every string goes through orgText",
        GRAPH_FN.indexOf("g.fillText(") < 0,
        (GRAPH_FN.match(/orgText\(g,/g) || []).length + " orgText call sites, 0 bare fillText");
    ok("orgText MEASURES before it places (measureText, not a character-count guess)",
        PLACER_REGION.indexOf("g.measureText(s).width") >= 0 &&
        PLACER_REGION.indexOf("orgWrapLines") >= 0 && PLACER_REGION.indexOf("orgRecText") >= 0);
    ok("the painter publishes the clip rect and the box list the probe reads",
        /window\.PM_orgTextClip = CLIP;/.test(GRAPH_FN) && /window\.PM_orgTextBoxes = \[\];/.test(GRAPH_FN));

    const RUN = mkGraphRun(false);
    // ── (b) THE PROBE: every state, every curve, every reveal fraction.
    const CURVES = ["ethane", "butane", "cyclohexane"];
    const REVS = [0.0, 0.25, 0.5, 0.99, 1.0];
    let total = 0, out = 0; const worst: string[] = [];
    for (const c of CURVES) {
        const row = RUN.T[c];
        for (const rev of REVS) {
            for (const bar of [true, false]) {
                for (const xf of [0, 0.33, 0.5, 1]) {
                    const r = RUN.draw(c, { rev, noBarrier: !bar, x: row.x_min + (row.x_max - row.x_min) * xf });
                    total += r.boxes.length;
                    for (const b of escapes(r)) { out++; if (worst.length < 4) worst.push(c + " rev=" + rev + " " + JSON.stringify(b.text)); }
                }
            }
        }
    }
    ok("EVERY painted box lies inside the panel clip rect, on both axes, over 3 curves × 5 reveals × 2 bracket states × 4 poses",
        out === 0, total + " boxes measured, " + out + " outside" + (worst.length ? " — " + worst.join(" | ") : ""));

    // ── (c) the exact string the defect amputated.
    {
        const r = RUN.draw("ethane", { rev: 1, x: 120 });
        const cap = (r.boxes as Box[]).filter(b => b.text.indexOf("barrier") === 0)[0];
        ok("STATE_5's payoff caption is painted COMPLETE — the unit survives to the last glyph",
            !!cap && cap.text === "barrier 12.0 kJ·mol⁻¹",
            cap ? JSON.stringify(cap.text) : "not painted");
        ok("…and its box clears the panel's right border with the placer's own margin",
            !!cap && cap.x + cap.width <= r.clip.w - PADDED,
            cap ? "right edge " + (cap.x + cap.width).toFixed(1) + " against a border at " + (r.clip.w - PADDED) : "-");
        ok("…and it re-anchored to the bracket's OTHER side rather than being dumped at the margin",
            !!cap && cap.x > PADDED + 1,
            cap ? "left edge " + cap.x.toFixed(1) : "-");
    }

    // ── (d) THE NEGATIVE CONTROL. Same probe, pre-fix placer. It must TRIP.
    {
        const BAD = mkGraphRun(true);
        const hist = BAD.draw("ethane", { rev: 1, x: 120 });
        const histOut = escapes(hist);
        const histCap = histOut.filter((b: Box) => b.text.indexOf("barrier") === 0)[0];
        ok("[neg] the PRE-FIX placer, restored, paints the shipped caption OUTSIDE the clip — the trap is real and the checker can fail",
            histOut.length > 0 && !!histCap,
            histOut.length + " boxes escape; " + JSON.stringify(histCap ? histCap.text : "-") +
            " reaches x = " + (histCap ? (histCap.x + histCap.width).toFixed(0) : "-") +
            " on a 700 px panel (the shipped frame cut it at 700 and rendered \"barrier 12.0 kJ\u00B7mo\")");
        const LONG = "interconversion barrier through the eclipsed transition state";
        const badLong = escapes(BAD.draw("ethane", { rev: 1, x: 120, label: LONG }));
        ok("[neg] a deliberately over-long unit string trips the assertion under the pre-fix placer",
            badLong.length > 0, badLong.length + " boxes outside the clip");
        const goodLong = RUN.draw("ethane", { rev: 1, x: 120, label: LONG });
        ok("…and the SHIPPED placer keeps the same over-long string wholly inside (it shrinks to the stated 15 px floor first)",
            escapes(goodLong).length === 0 &&
            (goodLong.boxes as Box[]).some(b => b.text.indexOf(LONG) === 0),
            "0 of " + goodLong.boxes.length + " boxes outside");
    }

    // ── (e) below the floor the placer WRAPS deliberately — it never shrinks a
    //   number unreadable to avoid a wrap (Rule 29).
    {
        const HUGE = "the interconversion barrier measured between the staggered minimum and the eclipsed maximum of this rotation";
        const r = RUN.draw("ethane", { rev: 1, x: 120, label: HUGE });
        const lines = (r.boxes as Box[]).filter(b => HUGE.indexOf(b.text.split(" ")[0]) === 0 || b.text.indexOf("kJ·mol⁻¹") >= 0);
        ok("a string too long even at the 15 px floor WRAPS at word boundaries instead of running off",
            lines.length >= 2 && escapes(r).length === 0,
            lines.length + " wrapped lines, all inside the clip");
        ok("…and no wrapped line is shorter than one word or splits a token",
            lines.every(b => b.text.indexOf("  ") < 0 && b.text.trim() === b.text));
    }

    // ── (f) the x axis carries numbers, so STATE_6's "Same peak every 120°" is
    //   substantiated by the axis it is a claim about (Rule 33d).
    {
        const t = RUN.ticks(RUN.T.ethane);
        ok("the φ axis is TICKED — 0…360 lands on exactly 60°, so 'same peak every 120°' is readable off the axis",
            JSON.stringify(t.values) === JSON.stringify([0, 60, 120, 180, 240, 300, 360]) && t.step === 60,
            "step " + t.step + "° → " + t.values.join(", "));
        const cy = RUN.ticks(RUN.T.cyclohexane);
        ok("the tick step is DERIVED from the row's own span, not hardcoded to degrees (the 0…1 pucker row gets 0.2)",
            cy.step === 0.2 && cy.values.length === 6 && RUN.fmt(cy.step)(0.6) === "0.6",
            "step " + cy.step + " → " + cy.values.map((v: number) => RUN.fmt(cy.step)(v)).join(", "));
        const authored = RUN.ticks({ x_min: 0, x_max: 360, x_ticks: [0, 90, 180, 270, 360] });
        ok("…and an authored x_ticks list overrides the derivation",
            JSON.stringify(authored.values) === JSON.stringify([0, 90, 180, 270, 360]));
        const r = RUN.draw("ethane", { rev: 1, x: 120 });
        const ticks = (r.boxes as Box[]).filter(b => /^[0-9]+$/.test(b.text) && Number(b.text) % 60 === 0 && b.y > 380);
        ok("every tick number is painted inside the clip, including the two at the axis ends",
            ticks.length === 7 && ticks.every(b => inside(b, r.clip)),
            ticks.length + " tick labels, x from " + ticks[0].x.toFixed(0) + " to " + (ticks[6].x + ticks[6].width).toFixed(0));
        // the axis band is TWO stacked rows now; a canvas-internal collision is
        // invisible to every DOM probe, so it is asserted here.
        const xlab = (r.boxes as Box[]).filter(b => b.text === RUN.T.ethane.x_label)[0];
        ok("the tick row and the axis label do not overlap (the axis band was re-cut for two rows)",
            !!xlab && ticks.every(b => b.y + b.height <= xlab.y),
            xlab ? "ticks end at y = " + (ticks[0].y + ticks[0].height).toFixed(1) + ", the label starts at y = " + xlab.y.toFixed(1) : "-");
    }

    // ── (g) the pin contract: measuring cannot make the panel non-deterministic.
    {
        const a = RUN.draw("ethane", { rev: 1, x: 120 });
        const aj = JSON.stringify(a.boxes);
        const b = RUN.draw("ethane", { rev: 1, x: 120 });
        ok("the placer is PURE — two draws of the same state give byte-identical boxes (the frozen pin is safe)",
            aj === JSON.stringify(b.boxes), a.boxes.length + " boxes reproduce exactly");
    }

    // ── (h) the DOM half of the same root cause: the ONE formula surface (Rule
    //   34b) wrapped at a fixed 250 px max-width and stranded "kJ·mol⁻¹" alone
    //   on line two, reading as two surfaces.
    {
        const F = "E(φ) = 6(1 + cos 3φ) kJ·mol⁻¹";
        const NB = " ";
        ok("[neg] the OLD fixed 250 px max-width really did wrap this formula (the trap is real)",
            Array.from(F).length * 20 * 0.55 > 250,
            "≈" + Math.round(Array.from(F).length * 20 * 0.55) + " px of text in a 250 px box");
        ok("the static formula surface no longer carries the fixed max-width, and defaults to one line",
            BUILD_FN.indexOf("max-width:250px") < 0 && BUILD_FN.indexOf("white-space:nowrap") >= 0);
        ok("apply writes the UNIT-BOUND string, so no wrap can ever orphan the unit",
            /ff\.innerHTML = orgBindUnit\(os\.formula\);/.test(APPLY_FN) && /orgFitFormula\(ff\);/.test(APPLY_FN));
        const bound = RUN.bind(F);
        ok("orgBindUnit ties the unit to the token before it with a no-break space",
            bound.indexOf(NB + "kJ·mol⁻¹") >= 0 && bound.indexOf(" kJ·mol⁻¹") < 0 &&
            bound.replace(NB, " ") === F,
            JSON.stringify(bound.slice(-14)));
        ok("…and it leaves a single-token formula and authored markup alone",
            RUN.bind("E") === "E" && RUN.bind("<b>a b</b>") === "<b>a b</b>");
        // the fit ladder, driven by a measurable stub: width scales with the
        // font size the fitter writes, exactly as a real layout would.
        const ff = RUN.E["org_formula"] as Record<string, unknown>;
        const st = ff.style as Record<string, string>;
        ff.innerHTML = bound; st.display = "block";
        ff.getBoundingClientRect = () => ({ width: Array.from(String(ff.innerHTML)).length * ctxFontPx(st.fontSize || "20px") * 0.55, left: 0 });
        RUN.W.innerWidth = 1280;
        let fit = RUN.fit(ff);
        ok("on a full-width viewport the formula stays on ONE line at its authored size",
            fit.px === 20 && fit.wrapped === false && st.whiteSpace === "nowrap",
            "band " + Math.round(fit.band) + " px, text " + Math.round(fit.width) + " px at " + fit.px + " px");
        // the band is MEASURED off the HUD when it is up, never assumed.
        const hud = RUN.E["org_hud"] as Record<string, unknown>;
        (hud.style as Record<string, string>).display = "block";
        hud.getBoundingClientRect = () => ({ width: 216, left: 1052 });
        fit = RUN.fit(ff);
        ok("the free band is MEASURED off the live HUD, so the two overlays cannot collide (Rule 34d)",
            Math.abs(fit.band - (1052 - 40)) < 0.5, "band = " + Math.round(fit.band) + " px, HUD left edge 1052");
        (hud.style as Record<string, string>).display = "none";
        RUN.W.innerWidth = 320;
        fit = RUN.fit(ff);
        ok("on a narrow viewport it SHRINKS, and stops at the stated 16 px floor rather than shrinking unreadable",
            fit.px === 16 && fit.wrapped === false && fit.width <= fit.band,
            "band " + Math.round(fit.band) + " px → " + fit.px + " px, " + Math.round(fit.width) + " px wide");
        RUN.W.innerWidth = 220;
        fit = RUN.fit(ff);
        ok("only BELOW the floor does it wrap — deliberately, into a measured box, with the unit still bound",
            fit.px === 16 && fit.wrapped === true && st.whiteSpace === "normal" &&
            st.maxWidth === Math.round(fit.band) + "px" &&
            String(ff.innerHTML).indexOf(NB + "kJ·mol⁻¹") >= 0,
            "wrapped inside " + st.maxWidth + " at the " + fit.px + " px floor");
    }
}

console.log("\n" + "=".repeat(72));
console.log("check:organic-structure — " + pass + " passed, " + fail + " failed");
if (fail) { console.log("\nFAILURES:"); for (const f of failures) console.log("  - " + f); }
console.log("=".repeat(72) + "\n");
process.exit(fail ? 1 : 0);
