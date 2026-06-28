/**
 * Seed engine_bug_queue with the renderer-side defect fixes surfaced while
 * wiring the equipotential_surfaces field_3d capabilities (the three new optional
 * per-state `potential.*` flags: slide_along_shell, show_field_lines_cross_shells,
 * shells_override) into field_3d_renderer.ts + deriveStateMeta.ts.
 *
 * These are FIXED defects (caught by quality-auditor running THE EYE), each with a
 * durable prevention rule so the next field_3d build inherits the lesson.
 *
 * The headline scar (bug #2) is a re-occurrence of the existing
 * `field3d_scenario_missing_devstatemeta_recognition` class: a NEW timed reveal
 * cue (show_field_lines_cross_shells.at_ms) was added to the renderer but NOT to
 * deriveStateMeta's maxReveal derivation, so THE EYE pinned PM_simTimeMs BEFORE the
 * reveal and photographed an empty frame — a false negative that tsc + validate
 * could never catch. The fix registered both new cues (cross-shells + slide-along-
 * shell) in deriveStateMeta in the SAME change. This row REINFORCES that scar with
 * the concrete recurrence so future cue-adding sessions remember.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_equipotential_surfaces_fixes.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-28_equipotential_surfaces_fixes';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
  bug_class: string;
  title: string;
  severity: Severity;
  owner_cluster: Owner;
  root_cause: string;
  prevention_rule: string;
  probe_type: ProbeType;
  probe_logic: string;
  status: Status;
  concepts_affected: string[];
  fixed_in_files: string[];
  row_type: RowType;
}

const R: Owner = 'peter_parker:renderer_primitives';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];
const BOTH = ['src/lib/renderers/field_3d_renderer.ts', 'src/lib/validators/visual/deriveStateMeta.ts'];
const AFFECTED = ['equipotential_surfaces'];

const rows: Row[] = [
  {
    bug_class: 'field3d_new_reveal_cue_missing_from_devstatemeta_maxreveal',
    title: 'A new timed reveal cue (potential.show_field_lines_cross_shells.at_ms) was added to the renderer but not to deriveStateMeta.maxRevealForField3dState, so THE EYE pinned PM_simTimeMs before the reveal and photographed an empty STATE_4 — the field lines (the PRIMARY aha) never appeared in the frozen frame though the renderer code was correct',
    severity: 'CRITICAL',
    owner_cluster: R,
    root_cause: 'maxRevealForField3dState derives the frozen-frame pin time only from known *_at_ms cues; an unrecognised new cue leaves the pin at DEFAULT_REVEAL_MS (1500), before the reveal (at_ms 9500). The renderer fade fcF=(ms-at_ms)/700 stays 0 -> opacity 0 -> invisible. tsc + validate:concepts pass; only THE EYE frozen frame reveals it.',
    prevention_rule: 'Every new field_3d timed reveal cue (any *_at_ms / *_duration_ms the renderer animates on PM_simTimeMs) MUST be registered in deriveStateMeta.maxRevealForField3dState (and classified in deriveHoldExpectations) in the SAME change, or THE EYE pins the frozen frame before the payoff and false-negatives the reveal.',
    probe_type: 'manual',
    probe_logic: 'Read STATE_N__frozen.png for any state declaring a new *_at_ms reveal cue; confirm the revealed element is visibly rendered. The frozen frame is pinned to maxRevealForField3dState(state) — if the element is absent, the cue is not registered there.',
    status: 'FIXED',
    concepts_affected: AFFECTED,
    fixed_in_files: BOTH,
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_pool_element_visibility_must_match_visible_elements_token',
    title: 'A per-frame-driven pool of objects (the cross-shell field-line ArrowHelpers) tagged with a private elementType the state-apply matcher could not substring-match against the visible_elements token, so the generic matcher set visible=false on entry and the frame loop fought it',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'The generic visible_elements matcher in applyState substring-matches userData.elementType/id against the state tokens. elementType "pm_cross_line" never matched the JSON token "field_lines_cross_shells", so on entry the matcher forced visible=false.',
    prevention_rule: 'A field_3d pool whose visibility is owned by a per-state apply/frame function must EITHER carry an elementType that substring-matches the JSON visible_elements token, OR be fully driven (visible writes) by the authoritative apply+frame functions that run after the generic matcher. Prefer matching the token so the two agree.',
    probe_type: 'manual',
    probe_logic: 'For any pool element gated on a visible_elements token, confirm its userData.elementType (or id) substring-contains that token; otherwise the generic matcher hides it on state entry.',
    status: 'FIXED',
    concepts_affected: AFFECTED,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_per_state_override_must_drive_both_apply_and_frame_loops',
    title: 'A per-state shells_override that toggled which shell spheres show but left the global V-label sprites in place — the STATE_6 frame loop re-revealed every isPmShell label every frame, leaking the global V=12/8/6/4 over the override values',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause: 'The override was honoured in applyPotentialMeaningState but the per-frame STATE_6 shells block iterated all isPmShell objects setting visible=true unconditionally, re-showing the global labels the apply step had hidden.',
    prevention_rule: 'A per-state config override that changes element visibility/text MUST be applied in BOTH the per-state apply function AND every per-frame loop that touches the same elements; a frame loop that unconditionally re-reveals a shared pool defeats the apply-step override. Null/absent override path must reproduce the original behaviour byte-for-byte.',
    probe_type: 'manual',
    probe_logic: 'Read STATE_N__frozen.png for a state with a shells_override; confirm only the override labels/radii render (no stale global labels). Read a state WITHOUT override; confirm the global shells render unchanged.',
    status: 'FIXED',
    concepts_affected: AFFECTED,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_sign_flip_must_not_be_gated_on_formula_sibling_flag',
    title: 'The potential sign-flip block was gated on isFormulaPC (config.v_vs_r_curve present), so a sign_flip-using concept WITHOUT a v_vs_r_curve (equipotential_surfaces) never recolored shells / prepended negative V labels in STATE_6',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'if (isFormulaPC && p.show_sign_flip) — isFormulaPC is false for a concept with no v_vs_r_curve, so the block was skipped even though the state set show_sign_flip.',
    prevention_rule: 'A per-state behaviour gate must key on the per-state flag that requests it (p.show_sign_flip), never on a sibling-concept config marker (isFormulaPC). For concepts that DO carry the marker the change must be a no-op (verify the sibling unchanged).',
    probe_type: 'manual',
    probe_logic: 'Read STATE_N__frozen.png for a state with show_sign_flip + sign_flip_at_ms; confirm shells recolor and V labels read negative. Confirm the v_vs_r_curve sibling (electric_potential_point_charge) STATE_5 sign-flip is unchanged.',
    status: 'FIXED',
    concepts_affected: AFFECTED,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string {
  if (a.length === 0) return `ARRAY[]::text[]`;
  return `ARRAY[${a.map(sqlStr).join(', ')}]`;
}
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- ============================================================================
-- 2026-06-28: seed engine_bug_queue with the renderer-side defect fixes from
-- wiring equipotential_surfaces field_3d capabilities. Generated by
-- src/scripts/_seed_engine_bug_queue_equipotential_surfaces_fixes.ts — idempotent.
-- ============================================================================

INSERT INTO engine_bug_queue (${cols}) VALUES
${all.map(sqlRow).join(',\n')}
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,
  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,
  probe_type = EXCLUDED.probe_type, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected,
  fixed_in_files = EXCLUDED.fixed_in_files, row_type = EXCLUDED.row_type;
`;
}

async function upsertBatch(rowsIn: Row[], label: string): Promise<boolean> {
  const payload = rowsIn.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue')
    .upsert(payload, { onConflict: 'bug_class' });
  if (error) {
    console.error(`  x ${label} upsert failed: ${error.message}`);
    return false;
  }
  console.log(`  ok ${label}: ${rowsIn.length} rows upserted`);
  return true;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_2026-06-28_seed_engine_bug_queue_equipotential_surfaces_fixes_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  console.log('Upserting equipotential_surfaces fix rows...');
  await upsertBatch(rows, 'equipotential_surfaces_fixes');

  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class, status')
    .eq('discovered_in_session', SESSION);
  if (error) { console.error('verify query failed:', error.message); return; }
  console.log('In engine_bug_queue for this session:');
  for (const row of data ?? []) console.log(`  [${row.status}] ${row.bug_class}`);
}

main().catch((err) => {
  console.error('seed failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
