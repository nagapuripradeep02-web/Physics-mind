/**
 * engine_bug_queue row for the NEW vector_products_in_space scenario_type built
 * for the not-yet-authored vector_products_in_space (MATHEMATICS — dot & cross
 * product in 3D) concept — a Rule-40 platform dispatch, founder-cleared
 * 2026-08-08. This is a 'directive' row (an engine delta, not a reported
 * bug): it records the config-key contract json_author must follow and the
 * generic camera mechanism this build deliberately did NOT reinvent, per the
 * peter_parker:field3d_surgeon spec's "Engine bug queue update (post-fix)"
 * step.
 *
 * NOT RUN in the authoring session (2026-08-08): this desk had no
 * .env.local / Supabase credentials available (`npx tsx
 * src/lib/supabaseAdmin.ts` throws "Missing Supabase env vars"), so the
 * upsert below could not be executed here. The archival SQL this script
 * emits is reproduced verbatim in the dispatch report for the founder/
 * dispatching session to apply from an environment with DB access — run
 * this script there instead of hand-copying the SQL, so the upsert-by-
 * bug_class contract is honoured exactly.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_vector_products_in_space_scenario.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-08_vector_products_in_space_scenario_build';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:field3d_surgeon' | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const DERIVE = 'src/lib/validators/visual/deriveStateMeta.ts';
const GATE = 'src/scripts/check_vector_products.ts';

const rows: Row[] = [
  {
    bug_class: 'field3d_no_generic_two_vector_scenario',
    title: 'NEW scenario_type vector_products_in_space built for the not-yet-authored vector_products_in_space (MATHEMATICS, dot & cross product in 3D) concept — no existing scenario_type carried two arbitrary vectors + a live parallelogram/parallelepiped mesh',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      `Not a bug — an engine delta. Re-measured independently against ${RENDERER} before building: 234 hard-coded scenario_type dispatch branches, 0 hits for "parallelogram", 0 hits for "parallelepiped" (confirmed 0/0), 215 hits for crossProduct/ArrowHelper/PlaneGeometry (close to the dispatch's claimed 217 — confirms the vector maths is genuinely reusable, existing PlaneGeometry uses are fixed axis-aligned rectangles, not reusable for E2), 40 live BufferGeometry.setFromPoints sites (confirms the per-frame-rewritten-geometry technique has precedent). Built vector_products_in_space in ${RENDERER}: pure, THREE-free geometry/projection helpers (vpBuildVectors — a always [a_mag,0,0], b in the xy-plane at theta_deg, c via its own spherical angles c_theta_deg/c_phi_deg so it is a genuine 3D vector; vpCrossVec/vpDotVec/vpParallelogramVerts — E2's [O,a,a+b,b] quad whose area is |a x b|; vpParallelepipedFaces — E3's 6-faces-of-4-verts solid built from the SAME 8 corner formulas so adjacent faces share edge vertices exactly, closing with no gaps by construction; vpProjectPoint/vpPairwiseScreenSeparationDeg — the scar-mandated PAIRWISE screen-separation metric), plus buildVectorProductsInSpace/applyVectorProductsInSpaceState/updateVectorProductsInSpaceFrame/applyVectorProductsInSpaceGlow (THREE.js consumers of the pure helpers; every reveal is a closed form of state-local ms per Rule 36 — a grow-in ease with no accumulator) and buildVectorProductsSliders (a dynamically-created inline position:fixed #vp_sliders panel, Rule 39g auto-discovery, a_mag/b_mag/theta_deg/c_mag/c_theta_deg/c_phi_deg rows). CAMERA — deliberately did NOT build a new mechanism: rides the EXISTING generic per-state camera_position -> animateCameraTo()/lerpSpherical() path already used by many other scenarios (confirmed via a brace-depth static analysis in the gate: the camera_position block in applyState() sits at depth 1, a top-level sibling statement, never gated behind any scenario_type check), which already gives every state its own pose with a smooth eased transition (never a teleport, Rule 32d) — a founder_proxy review found NO single fixed pose satisfies every one of this concept's own claims (a true 90 degrees measured 125.2 degrees at one fixed pose; at theta=35 degrees, b and a x b project onto the same screen line at another), so every authored state MUST set its own camera_position; this build owns only the mechanism, the architect owns the pose values. Config-key contract for json_author: per-state field_3d_config.states.<id>.vp = { mode?: 'dot'|'cross'|'triple', a_mag?, b_mag?, theta_deg?, c_mag?, c_theta_deg?, c_phi_deg?, show_c?, show_cross_vector?, show_angle_arc?, show_parallelogram?, show_parallelepiped?, reveal_ms?, controls?: string[], static_readouts?: string[] } PLUS the shared top-level camera_position:[x,y,z] on EVERY state (non-negotiable per the founder_proxy finding above). Top-level config.slider_controls.a_mag/.b_mag/.c_mag/.c_theta_deg/.c_phi_deg carry min/max/step/default (newly added to the Field3DConfig type; .theta_deg was already shared). Verified: npx tsc --noEmit clean; npm run check:renderer-syntax and check:renderer-backticks clean (a backtick literal was found and removed from 4 doc comments inside the template-literal body during this build — the exact filed scar class the prompt named); the new npm run check:vector-products gate (64 assertions across 6 sections, 8 negative controls, all negative controls demonstrated to fail their target defect FIRST) proves E2's area tracks |a x b| monotonically across the |b| slider range, E3's solid closes (12 shared-edge face pairs, the closed-hexahedron signature) across an authored c sweep and its volume matches |a.(b x c)|, the camera mechanism is generic (never scenario-gated), and the pairwise screen-separation metric reproduces both founder-reported defects (b/(a x b) collinearity at theta=35/az=35/el=30, sepDeg=0.51) while a per-object foreshortening-margin stand-in (the retired metric shape) passes vacuously on the SAME configuration.`,
    prevention_rule:
      'A NEW field_3d scenario_type that introduces per-state camera framing must NOT build a bespoke camera mechanism — check for and reuse the existing generic camera_position -> animateCameraTo()/lerpSpherical() path first (git log --all -S "animateCameraTo" per Rule 40a). A NEW scenario with a camera-sensitivity claim (an angle/perpendicularity the concept teaches) needs a PAIRWISE screen-separation check over every rendered vector/element pair, never a per-object foreshortening margin — the latter is scored per-object and provably passes vacuously exactly when two elements collapse onto the same screen line (bug_class camera_metric_scored_foreshortening_not_pairwise_screen_separation). A NEW scenario must land its deriveStateMeta.ts F3D_REVEAL_KEYS entry + maxRevealForField3dState reveal-pin candidate + the explicit reveal_hold-vs-interactive split in the SAME change as the renderer scenario code, or THE EYE false-fails/mints a self-contradictory baseline on the first concept authored against it. No literal backtick characters (even inside a // comment) may appear anywhere inside a template-literal-embedded renderer body — run npm run check:renderer-backticks (not just tsc) before declaring a new scenario done.',
    probe_type: 'js_eval',
    probe_logic:
      'npm run check:vector-products (64 assertions, 8 negative controls, all green as of this dispatch) is the standing regression gate for this scenario_type\'s pure geometry/camera-mechanism claims — run it on every future edit to vpBuildVectors/vpParallelogramVerts/vpParallelepipedFaces/vpProjectPoint/vpPairwiseScreenSeparationDeg or to the applyState() camera_position block. Once vector_products_in_space (concept JSON) exists: npm run visual:eyes -- vector_products_in_space and confirm every guided state classifies reveal_hold (not a false-fail static tail) and the explore state (show_sliders:true) classifies interactive; confirm no #sliders panel bleed-through on any state (the isVecProd NOT-list entry); confirm each state\'s authored camera_position differs from its predecessor\'s and the transition is smooth (never a same-frame jump) across a SET_TIME_FREEZE pin sequence.',
    status: 'FIXED',
    concepts_affected: ['vector_products_in_space'],
    fixed_in_files: [RENDERER, DERIVE, GATE],
    row_type: 'directive',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${a.map(sqlStr).join(', ')}]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-08-08: NEW vector_products_in_space scenario_type engine delta (MATHEMATICS, dot & cross product in 3D).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_vector_products_in_space_scenario.ts — idempotent.\n` +
    `-- NOT YET APPLIED: authoring desk had no Supabase credentials (see file header).\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-08-08_seed_engine_bug_queue_vector_products_in_space_scenario_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s)`);
}

main();
