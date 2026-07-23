/**
 * engine_bug_queue rows for WP-R4 (PCPL hardening plan, D4 — literal-{x,y}
 * force_arrow origin fix) plus TWO newly-discovered, UNRELATED defects
 * surfaced by the before/after audit (both left OPEN — out of WP-R4's scope,
 * neither touched):
 *
 *   1. force_arrow_literal_from_coords_silently_ignored — FIXED this session.
 *      PM_resolveForceOrigin only parsed spec.from when it was a compound
 *      anchor STRING; a literal {x,y} object was silently discarded and the
 *      arrow fell through to the first-registered-body / hardcoded-{380,350}
 *      fallback. Audit found 55 such arrows across 7 PCPL concepts.
 *
 *   2. direction_of_resultant_resultant_formula_missing_physics_engine — NEW,
 *      CRITICAL, OPEN. Neither concept has an ENGINES entry in
 *      src/lib/physicsEngine/index.ts NOR a computePhysics_<id> branch in
 *      parametric_renderer.ts's inline iframe fallback, so PM_physics stays
 *      null and draw() early-returns "Unknown concept: <id>" — both concepts
 *      render NOTHING today, in production, unrelated to the literal-from fix
 *      (Pass 2's force-arrow code is never reached). Discovered via the WP-R4
 *      before/after screenshot diff (identical red-error-screen hash across
 *      ALL states, before AND after the D4 fix).
 *
 *   3. force_arrow_to_field_never_read_collapses_arrows — NEW, MODERATE, OPEN.
 *      drawForceArrow() never reads spec.to / spec.to_expr — only
 *      magnitude(_expr)/direction_deg(_expr) or a physics.forces id match
 *      drive the tip. contact_forces STATE_4's N_component/f_component/
 *      F_resultant arrows author only `to` (no magnitude/direction_deg) and
 *      none of their ids match a real physics.forces id, so ALL THREE
 *      silently collapse onto physics.forces[0]'s vector and render as ONE
 *      arrow. Confirmed via before/after screenshot (identical in both,
 *      i.e. NOT introduced by WP-R4 — a pre-existing, separate defect).
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_wpr4_literal_from.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-23_wpr4_literal_from_force_origin_fix';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const RENDERER = 'src/lib/renderers/parametric_renderer.ts';

const AUDITED_7 = [
  'contact_forces', 'current_not_vector', 'direction_of_resultant',
  'hinge_force', 'pressure_scalar', 'resultant_formula', 'tension_in_string',
];

const rows: Row[] = [
  {
    bug_class: 'force_arrow_literal_from_coords_silently_ignored',
    title: 'PM_resolveForceOrigin dropped literal {x,y} spec.from — arrows fell to first-registered-body / hardcoded-{380,350} fallback',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'FIXED 2026-07-23 (WP-R4, plan design decision D4). PM_resolveForceOrigin only parsed spec.from when typeof spec.from === "string" (the compound-anchor form like "block_top_center"). A literal coordinate object from:{x,y} was never read, so with no body_id/origin_body_id present the arrow silently fell through to either the first body in PM_bodyRegistry or the hardcoded {x:380,y:350} fallback. Read-only audit (audit_literal_from_arrows.ts) found 55 such arrows across 7 PCPL concepts (contact_forces, current_not_vector, direction_of_resultant, hinge_force, pressure_scalar, resultant_formula, tension_in_string) — none in PILOT_CONCEPTS. Founder-approved the full 7-concept scope after the audit traced each concept\'s CURRENT (pre-fix) resolution and confirmed every one was already broken (stacked/wrong-anchor), not a case where the fallback happened to be correct. Before/after Playwright evidence: current_not_vector STATE_1 wires went from a collapsed single line to the correct crossing-at-junction-O diagram; hinge_force STATE_3/5 went from all 5 arrows piled at the hinge to the correct free-body diagram (H/V/F_hinge at the hinge, W at rod centre, F_ext at the rod\'s far end); tension_in_string STATE_3\'s F_applied arrow went from floating disconnected above the rig to correctly anchoring at block m\'s right edge in line with the tension/acceleration arrows. contact_forces STATE_4/STATE_6 were confirmed BYTE-IDENTICAL before/after (a genuine coincidence: the real TS physics engine\'s forces all carry draw_from:"body_bottom", and since each of those scenes registers exactly one body, the pre-fix first-registered-body+body_bottom-offset fallback already numerically equalled the authored literal coordinate). pressure_scalar STATE_1/STATE_3 DID move but landed on a NOT-obviously-correct point (see the separate JSON-authoring handoff note in PROGRESS.md — literal from appears to be an accidental copy of the raw body position field, not a deliberately chosen point; NOT fixed here per this WP\'s no-JSON-edits scope). direction_of_resultant and resultant_formula showed zero render change in either direction because both concepts have NO physics-engine registration at all (see the separate bug_class direction_of_resultant_resultant_formula_missing_physics_engine below) — Pass 2 (where this fix lives) is never reached.',
    prevention_rule:
      'PM_resolveForceOrigin\'s precedence is: (1) string spec.from compound-anchor parse, (2) body_id/origin_body_id registry lookup, (3) literal object spec.from {x,y} — ONLY reached when (1)/(2) resolved no body, (4) first-registered-body fallback, (5) hardcoded {380,350}. Any NEW force_arrow authoring path that adds a from-like field must insert into this exact chain at step 3, never earlier (would silently override origin_body_id — regression risk) nor only at the fallback tail (would keep being silently dropped).',
    probe_type: 'js_eval',
    probe_logic:
      'For a force_arrow primitive with an object-valued `from` and no body_id/origin_body_id, render the state and assert the drawn arrow\'s origin pixel equals spec.from (±2px). Reference regression check: current_not_vector STATE_1 wire_1 origin must land at (160,260), wire_2 at (160,360) — not stacked at a single shared point.',
    status: 'FIXED',
    concepts_affected: AUDITED_7,
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'direction_of_resultant_resultant_formula_missing_physics_engine',
    title: 'direction_of_resultant + resultant_formula render NOTHING — no physics-engine registration at all, "Unknown concept" error screen',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:runtime_generation',
    root_cause:
      'NEW, OPEN — discovered 2026-07-23 as a side effect of the WP-R4 before/after audit (unrelated to the literal-from fix). Neither direction_of_resultant nor resultant_formula has an entry in the ENGINES map in src/lib/physicsEngine/index.ts, NOR a computePhysics_<id> branch in parametric_renderer.ts\'s inline iframe-side dispatcher (~line 949-964). assembleParametricHtml() always calls the real server-side computePhysics(concept_id, default_variables) (line ~3029) to populate window.PM_PRECOMPUTED_PHYSICS regardless of what the caller passes — for these two concepts that call returns null (no ENGINES entry), and the iframe-side computePhysics() fallback (setup(), line ~2628) ALSO returns null (no dispatcher branch). PM_physics stays null and draw() early-returns a red "Unknown concept: <id>" error screen (line ~2669-2673) BEFORE Pass 2 (force-arrow drawing, where the literal-from fix lives) ever runs. Confirmed visually: every state of both concepts, before AND after the WP-R4 fix, produces byte-identical screenshots of ONLY the red error text — the literal-from fix is completely inert for these two concepts until this registration gap is closed.',
    prevention_rule:
      'Every concept in PCPL_CONCEPTS (aiSimulationGenerator.ts) that authors force_arrow primitives referencing physics.forces (by force_id/id match) or computed_outputs (via *_expr fields) MUST have a matching entry in BOTH src/lib/physicsEngine/index.ts\'s ENGINES map (server-side precompute) AND parametric_renderer.ts\'s inline computePhysics() dispatcher (iframe-side fallback) — missing either one degrades gracefully for concepts with forces:[]/no-expr-fields (current_not_vector, pressure_scalar both already handle this) but is a full "Unknown concept" render failure for concepts whose force_arrows depend on ANY physics.forces lookup. Add a Gate to quality_auditor / validate-concepts.ts that flags any PCPL_CONCEPTS entry with force_arrow primitives (or *_expr fields) but no matching ENGINES + dispatcher registration.',
    probe_type: 'manual',
    probe_logic:
      'Render each PCPL_CONCEPTS entry\'s first state and assert the canvas does NOT show the literal text "Unknown concept:" — a simple Playwright innerText/canvas-OCR-free check is to grep the assembled HTML\'s injected window.PM_PRECOMPUTED_PHYSICS for `null` combined with a missing computePhysics_<id> function name in the same PARAMETRIC_RENDERER_CODE body.',
    status: 'OPEN',
    concepts_affected: ['direction_of_resultant', 'resultant_formula'],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'force_arrow_to_field_never_read_collapses_arrows',
    title: 'drawForceArrow never reads spec.to/to_expr — arrows without magnitude/direction_deg silently collapse onto physics.forces[0]',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'NEW, OPEN — discovered 2026-07-23 as a side effect of the WP-R4 before/after audit (unrelated to the literal-from fix, pre-existing both before and after). drawForceArrow() (parametric_renderer.ts ~line 1334) only ever computes the arrow tip from (a) a physics.forces entry matched by force_id/id, or (b) spec.magnitude/magnitude_expr + spec.direction_deg/direction_deg_expr synthesized into a self-contained force. It never reads spec.to or spec.to_expr at all. contact_forces STATE_4\'s N_component/f_component/F_resultant primitives author ONLY `to` (literal {x,y} endpoints, no magnitude/direction_deg) and none of their ids match a real physics.forces entry (the real TS engine\'s ids are normal/friction/resultant, not N_component/f_component/F_resultant) — so all three fall to the `if (!force && physics.forces.length>0) force = physics.forces[0]` legacy-compat branch and render using the SAME vector, visually collapsing into one arrow (confirmed via screenshot: only one visible arrow + label in STATE_4, identical before and after the WP-R4 fix).',
    prevention_rule:
      'Any force_arrow authored with a `to`/`to_expr` field and no magnitude/direction_deg/matching-force-id needs either (a) drawForceArrow gaining a `to`-endpoint draw path (compute magnitude/angle from origin->to, mirroring PM_drawSubScene\'s existing to/to_expr-agnostic handling), or (b) the JSON re-authored to use magnitude+direction_deg instead of to/to_expr (matching the sibling STATE_6 pattern in the SAME concept, which already renders correctly). Do not author new force_arrow primitives with only a `to` field until one of these lands.',
    probe_type: 'manual',
    probe_logic:
      'For a force_arrow primitive with `to`/`to_expr` set and no magnitude/magnitude_expr/direction_deg/direction_deg_expr, render its state and assert distinct arrows (differing tip position) for every such primitive in the scene sharing an origin — contact_forces STATE_4 is the reference repro (N_component/f_component/F_resultant currently all render as one arrow).',
    status: 'OPEN',
    concepts_affected: ['contact_forces'],
    fixed_in_files: [],
    row_type: 'incident',
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
  return `-- 2026-07-23: WP-R4 (PCPL hardening plan, D4) literal-from force-origin fix +\n` +
    `-- 2 newly-discovered unrelated defects (direction_of_resultant/resultant_formula missing\n` +
    `-- physics engine; contact_forces' to/to_expr dead field). Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_wpr4_literal_from.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = now();\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-23_seed_engine_bug_queue_wpr4_literal_from_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted (1 FIXED, 2 OPEN)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
