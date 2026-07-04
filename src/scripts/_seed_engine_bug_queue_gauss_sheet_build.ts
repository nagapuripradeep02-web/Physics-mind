/**
 * Seed engine_bug_queue with the renderer-side prevention rules surfaced while
 * BUILDING the gauss_law_sheet field_3d scenario (the PLANAR / CONSTANT-field
 * INVERSE of gauss_law_line). This is a NEW-scenario build, not a defect fix:
 * the rows below are engine PREVENTION rules (FIXED — the recipe is in the
 * renderer) so the NEXT inverted-sibling build (e.g. the conductor-surface
 * σ/ε₀ case, or any future field_3d sibling that inverts an existing one) has
 * the engine mechanics in the durable queue, not only in the spec catalog.
 *
 * Conformed-to existing scars (not re-seeded — already in the queue):
 *   • field3d_scenario_missing_devstatemeta_recognition  (R)  — added the
 *     gauss_sheet block to deriveStateMeta in the SAME change.
 *   • acl_state8_sliders_update_readout_not_geometry      (R)  — STATE_7 d
 *     slider MOVES the field-point/pillbox geometry while the cap-arrow length
 *     HOLDS constant.
 *   • teach_inverted_scenario_inverts_cutline_flags       (AR) — DIRECTIVE row,
 *     owned by alex:architect; left OPEN (standing pedagogy rule). The renderer
 *     conforms: FLAT plot + falling 1/r & 1/r² ghosts, caps flux-bearing.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_gauss_sheet_build.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-26_gauss_sheet_build';

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

const R = 'peter_parker:renderer_primitives';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];
const META = ['src/lib/validators/visual/deriveStateMeta.ts'];

const rows: Row[] = [
  {
    bug_class: 'gss_constant_field_arrow_must_not_shrink_with_distance',
    title: 'Cap E-arrow length must be CONSTANT in d for an infinite sheet — blind-cloning the line\'s 1/r arrow makes it shrink as the field point moves away (wrong physics shown faithfully)',
    severity: 'CRITICAL',
    owner_cluster: R,
    root_cause: 'gauss_law_line\'s ring-arrow length is glnArrowLen(λ, r) = 1/r. The sheet\'s field is E = σ/(2ε₀) — CONSTANT, independent of distance — so cloning the line\'s arrow-length law would make the cap arrows shrink as d grows, contradicting the whole lesson (the field that never dies). Rule 29: a length tracks the REAL magnitude, which here depends only on |σ|.',
    prevention_rule: 'For the sheet, the cap-arrow length is gssArrowLen(σ) = demo·|σ| with NO distance term; it must be byte-identical at every d. The coordinated d-sweep + STATE_7 d-slider MOVE the field-point/pillbox geometry while the cap-arrow length HOLDS. Never reuse the line\'s 1/r (or the sphere\'s 1/r²) arrow law for a planar/constant-field sibling.',
    probe_type: 'manual',
    probe_logic: 'Open STATE_6 (coordinated sweep) or STATE_7 and slide d from near to far; the cap arrows must keep IDENTICAL length while their anchor (the pillbox cap / field point P) slides away. Only σ changes the arrow length.',
    status: 'FIXED',
    concepts_affected: ['gauss_law_sheet'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'gss_flux_roles_inverted_caps_pierce_wall_grazes',
    title: 'Pillbox flux roles are the INVERSE of the line: the two CAPS carry all the flux (pierced ⊥), the curved WALL is zero-flux (grazed ∥) + "Φ=0" — cloning the line puts the flux on the wrong face',
    severity: 'CRITICAL',
    owner_cluster: R,
    root_cause: 'In gauss_law_line the WALL pierces (the flux-bearing ring) and the CAPS graze (Φ=0). For the planar pillbox the geometry inverts: the caps are parallel to the sheet and pierced ⊥ by E (flux-bearing, constant-length arrows both sides), and the curved wall is perpendicular to the sheet and grazed ∥ by E (zero flux). A blind clone would draw the flux-bearing arrows on the wall and the Φ=0 tag on the caps — exactly wrong.',
    prevention_rule: 'gss draws CONSTANT-length pierce arrows along ±X on each cap (gss_cap_arrow, show_cap_arrows) and BRIGHT-yellow grazing arrows along ±X lying ON the curved wall (gss_wall_graze_arrow) + the single "Φ=0" wall tag (show_caps_flux). The pierce-vs-graze contrast is the SUPPORTING aha and the explicit inverse of the line — verify it reads as caps-pierce / wall-graze, never the reverse.',
    probe_type: 'manual',
    probe_logic: 'Open STATE_4 (wall-zero-flux beat); the two flat caps must show green arrows piercing straight out ⊥ (away from the sheet on both sides), and the curved wall must show yellow arrows lying along the wall surface (axial, grazing) with the "Φ=0" tag — the inverse of the line.',
    status: 'FIXED',
    concepts_affected: ['gauss_law_sheet'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'gss_plot_is_flat_line_above_falling_ghosts_not_a_falling_curve',
    title: 'E-vs-distance plot must be a FLAT horizontal sheet line above FALLING 1/r & 1/r² ghosts — inheriting the line\'s falling 1/r curve is the load-bearing cut-line inversion bug',
    severity: 'CRITICAL',
    owner_cluster: R,
    root_cause: 'gauss_law_line\'s plot draws a falling green 1/r curve with a faint 1/r² ghost. The sheet inverts the cut-line (scar teach_inverted_scenario_inverts_cutline_flags): the sheet field is CONSTANT, so the green curve must be a FLAT horizontal line, with the 1/r (line) and 1/r² (point) curves drawn as FAINT FALLING GHOSTS beneath it. Blind-cloning the line\'s plot draws a falling sheet curve — the single most load-bearing inversion to get wrong.',
    prevention_rule: 'gss_plot draws a flat green line at σ/2ε₀ (constant, independent of d) ABOVE two faint dashed falling ghosts (1/r orange line-ghost, 1/r² grey point-ghost) normalised to coincide at d0; the tracking dot rides the flat line — slides RIGHT, holds the SAME height. Surface show_constant_field framing. Never reuse the falling-curve plot from a 1/r or 1/r² sibling.',
    probe_type: 'manual',
    probe_logic: 'Open STATE_6 and watch the sweep; the green sheet line must stay FLAT (horizontal) while the dashed ghosts fall, and the glowing dot must slide horizontally along the flat line at constant height — never trace a descending curve.',
    status: 'FIXED',
    concepts_affected: ['gauss_law_sheet'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'gss_two_distinct_reference_lines_d_billboarded_H_axial',
    title: 'd (perpendicular distance, billboarded) and H (pillbox half-height, axial) must read as two DISTINCT labelled lines — both lie along the sheet normal and conflate if drawn alike',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'Unlike the line (where r was radial and L was axial — naturally perpendicular), the sheet\'s d (sheet→field-point) and H (pillbox half-height) BOTH lie along the sheet normal (±X), so they conflate if drawn the same way. The area A is on the cap and must never read as a distance.',
    prevention_rule: 'gss draws d as a camera-right-billboarded distance ruler from the sheet to P (gss_dist_vector, kind "d", with the P tip), and H as a genuinely axial +X ruler offset to the +Y side of the pillbox (gss_half_vector, kind "H"); A is a cap-face label (gss_cap_area_label), never a line. The H line is gated on the pillbox beat (show_pillbox / emerge_H_at_ms / sliders), never on show_reference_lines alone, so STATE_2 teaches d before the pillbox exists.',
    probe_type: 'manual',
    probe_logic: 'Open STATE_3+; d must be a clearly horizontal ruler ending in the P dot at the field point, H a separate axial ruler beside the pillbox, and A a label on the cap face — three distinct readings, never one merged line.',
    status: 'FIXED',
    concepts_affected: ['gauss_law_sheet'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'gss_devstatemeta_block_registered_same_change',
    title: 'gauss_law_sheet per-state keys registered in deriveStateMeta in the SAME change (else THE EYE mis-classifies every state at the 1500ms default)',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'A new field_3d scenario whose per-state gauss_sheet keys (cap_arrow_at_ms, caps_reveal_at_ms, derivation_at_ms, emerge_d/H_at_ms, area_label_at_ms, sweep_end_at_ms, plot_draw_at_ms, gaussian_fade_at_ms, sliders) are not recognised by maxRevealForField3dState/deriveHoldExpectations classifies at the 1500ms default and false-fails D7/D1p (the field3d_scenario_missing_devstatemeta_recognition scar).',
    prevention_rule: 'The gauss_sheet reveal block (maxRevealForField3dState) + the sliders→interactive hold classification (deriveHoldExpectations) ship in the SAME change as the renderer scenario. Guided STATE_2–6 must classify reveal_hold (maxReveal > 1500ms); the STATE_7 slider state must classify interactive.',
    probe_type: 'manual',
    probe_logic: 'Run visual:eyes on a gauss_law_sheet concept; guided states must classify reveal_hold and the explore state interactive in the Reveal/Hold map — none at the bare 1500ms default.',
    status: 'FIXED',
    concepts_affected: ['gauss_law_sheet'],
    fixed_in_files: META,
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
-- 2026-06-26: seed engine_bug_queue with the renderer-side prevention rules from
-- BUILDING the gauss_law_sheet field_3d scenario (the planar/constant-field
-- INVERSE of gauss_law_line). Generated by
-- src/scripts/_seed_engine_bug_queue_gauss_sheet_build.ts — idempotent.
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
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-06-26_seed_engine_bug_queue_gauss_sheet_build_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  console.log('Upserting gauss_sheet build rows...');
  await upsertBatch(rows, 'gauss_sheet_build');

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
