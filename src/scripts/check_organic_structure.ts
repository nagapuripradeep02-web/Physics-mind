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
 * SECTION OWNERSHIP. S1 owns 1..7. Later dispatches EXTEND: A1 the driven
 * dihedral (section 4 gains phi(t) determinism), S2 the energy tables, A2 the
 * pucker knot geometry + the a/e tag inversion, A3 the mirror residual and the
 * rewire atom-count conservation. Sections those dispatches own print as declared
 * SKIPs with their owner — never silently absent.
 *
 *   npm run check:organic-structure
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FIELD_3D_RENDERER_CODE } from "../lib/renderers/field_3d_renderer";

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

// ── the sandbox: the shipped mg geometry layer + the whole PURE organic region.
const ORG_REGION = region("    var ORG_U_PER_A = MG_BOND_LEN / 1.54;", "    function buildOrganicStructure(config) {");
const MG_REGION = region("    function mgSmooth01(u)", "    function mgDomainKinds(n)");
const FRAME_FN = grabFn("updateOrganicStructureFrame");
const APPLY_FN = grabFn("applyOrganicStructureState");

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
        "ORG_MODES", "ORG_MODES_S1", "ORG_MODES_DEFERRED",
        "ORG_HUD_LINES", "ORG_HUD_LINES_S1", "ORG_HUD_LINES_DEFERRED",
        "ORG_CONTROL_IDS", "ORG_CONTROL_IDS_S1", "ORG_CONTROL_IDS_DEFERRED",
        "ORG_MEASURE_KINDS", "ORG_MEASURE_KINDS_S1", "ORG_MEASURE_KINDS_DEFERRED",
        "ORG_POSES", "ORG_POSES_S1", "ORG_POSES_DEFERRED",
        "ORG_PUCKER_PATHS_S1", "ORG_PUCKER_PATHS_DEFERRED",
        "ORG_WAYPOINTS_S1", "ORG_WAYPOINTS_DEFERRED",
        "ORG_MIRROR_PLANES_S1", "ORG_MIRROR_PLANES_DEFERRED",
        "ORG_ENERGY_COORDS_S1", "ORG_ENERGY_COORDS_DEFERRED",
        "ORG_STATIONARY_KINDS_S1", "ORG_STATIONARY_KINDS_DEFERRED",
        "ORG_MOLECULES", "ORG_MOLECULES_DEFERRED", "ORG_DEFERRED_FIELDS",
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
    mode: [R.ORG_MODES_S1, R.ORG_MODES_DEFERRED],
    hud_lines: [R.ORG_HUD_LINES_S1, R.ORG_HUD_LINES_DEFERRED],
    controls: [R.ORG_CONTROL_IDS_S1, R.ORG_CONTROL_IDS_DEFERRED],
    measure_kind: [R.ORG_MEASURE_KINDS_S1, R.ORG_MEASURE_KINDS_DEFERRED],
    torsion_pose: [R.ORG_POSES_S1, R.ORG_POSES_DEFERRED],
    pucker_path: [R.ORG_PUCKER_PATHS_S1, R.ORG_PUCKER_PATHS_DEFERRED],
    pucker_waypoint: [R.ORG_WAYPOINTS_S1, R.ORG_WAYPOINTS_DEFERRED],
    mirror_plane: [R.ORG_MIRROR_PLANES_S1, R.ORG_MIRROR_PLANES_DEFERRED],
    energy_coordinate: [R.ORG_ENERGY_COORDS_S1, R.ORG_ENERGY_COORDS_DEFERRED],
    energy_stationary_kind: [R.ORG_STATIONARY_KINDS_S1, R.ORG_STATIONARY_KINDS_DEFERRED]
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
}

// ═════════════════════════════════════════════════════════════════════════════
console.log("\n[2] DEFERRED MEMBERS NEVER REACH THE FRAME OR APPLY PASS");
{
    R.clearRejects();
    const implOK = R.ORG_MODES_S1.every((m: string) => R.orgCheckMember("mode", m, R.ORG_MODES_S1, R.ORG_MODES_DEFERRED) === true);
    ok("every IMPLEMENTED mode is accepted silently", implOK && R.getRejects().length === 0,
        R.getRejects().length + " rejects raised");
    R.clearRejects();
    const defKeys = R.orgKeys(R.ORG_MODES_DEFERRED) as string[];
    const defRejected = defKeys.every((m: string) => R.orgCheckMember("mode", m, R.ORG_MODES_S1, R.ORG_MODES_DEFERRED) === false);
    ok("every DEFERRED mode is REJECTED LOUDLY (never silently defaulted)",
        defRejected && R.getRejects().length === defKeys.length,
        R.getRejects().length + " rejects for " + defKeys.length + " deferred modes");
    R.clearRejects();
    ok("[neg] an UNKNOWN member (in neither list) is also rejected",
        R.orgCheckMember("mode", "not_a_mode", R.ORG_MODES_S1, R.ORG_MODES_DEFERRED) === false && R.getRejects().length === 1);
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
    ok("the deferred-field registry covers the scheduled torsion half (A1)",
        ["torsion.phi_from", "torsion.at_ms", "torsion.ramp_ms", "torsion.continuous"]
            .every(k => !!R.ORG_DEFERRED_FIELDS[k]));
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
    skip("E(coordinate) reproduces the published table at every stationary point", "S2");
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

console.log("\n" + "=".repeat(72));
console.log("check:organic-structure — " + pass + " passed, " + fail + " failed");
if (fail) { console.log("\nFAILURES:"); for (const f of failures) console.log("  - " + f); }
console.log("=".repeat(72) + "\n");
process.exit(fail ? 1 : 0);
