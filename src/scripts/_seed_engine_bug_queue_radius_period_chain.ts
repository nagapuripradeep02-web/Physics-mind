/**
 * Seed engine_bug_queue with the NET-NEW scars from the radius→period chain
 * authoring run (concept #4 circular_motion_charge_in_uniform_B +
 * concept #5 cyclotron_period_independent_of_speed). Mirrors
 * _seed_engine_bug_queue_field3d.ts; ADD-ONLY (does not disturb existing rows).
 *
 * Already in the table (from session_2026-06-25_field3d_diamonds) — NOT re-added:
 *   field3d_orbit_spiral_on_radius_ramp, classifier_capital_B_suffix_truncation,
 *   crossagent_jsonauthor_drops_pause_after_ms_cloning_electric_flux, etc.
 *
 * This script:
 *   1. INSERTs net-new INCIDENT rows (land headlessly now).
 *   2. Records net-new DIRECTIVE rows in the array + archival SQL; they land via
 *      upsert ONLY after supabase_2026-06-25_engine_bug_queue_directive_rowtype_migration.sql
 *      (the row_type='directive' ALTER) is applied in the Supabase SQL editor —
 *      same constraint the field3d directives wait on (verified: zero directive rows live).
 *   3. MERGES concept #5 into the existing field3d_orbit_spiral_on_radius_ramp row's
 *      concepts_affected (targeted union UPDATE — preserves its provenance/session).
 *
 * Idempotent. Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_radius_period_chain.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-25_radius_period_chain';

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
const JA = 'alex:json_author';
const VV = 'peter_parker:visual_validator';
const AR = 'alex:architect';
const CM = 'circular_motion_charge_in_uniform_B';
const CY = 'cyclotron_period_independent_of_speed';

// ── Net-new INCIDENT rows (land headlessly now) ─────────────────────────────
const incidents: Row[] = [
  { bug_class: 'aha_statement_exceeds_15_words', title: 'aha_moment.statement authored >15 words; the validator rejects it (Gate 2)', severity: 'MODERATE', owner_cluster: JA,
    root_cause: 'json_author wrote the aha as a full sentence; both circular_motion_charge_in_uniform_B and cyclotron_period_independent_of_speed first tripped the conceptJson.ts >15-word cap and had to be trimmed.',
    prevention_rule: 'Author aha_moment.statement at <=15 words on the FIRST pass — it is a headline, not a sentence; the em-dash counts as its own token. Count words before emitting.',
    probe_type: 'manual', probe_logic: 'npm run validate:concepts (conceptJson.ts superRefine ~L410) rejects an aha_moment.statement with >15 whitespace tokens.', status: 'FIXED', concepts_affected: [CM, CY], fixed_in_files: ['src/data/concepts/circular_motion_charge_in_uniform_B.json', 'src/data/concepts/cyclotron_period_independent_of_speed.json'], row_type: 'incident' },

  { bug_class: 'cyclotron_start_marker_glyph_orphaned_from_orbit', title: 'STATE_2 same_start_marker yellow ring reads as an orphaned glyph near the slow/fast labels, not ON the orbit start point', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'The same_start_marker ring is drawn near the slow/fast text labels rather than sitting clearly ON the shared start point of the two orbits, so it reads as a stray decorative glyph (founder + auditor flagged it as a cosmetic on cyclotron_period STATE_2). RESOLVED (2026-07-04, during the Rule 31 cyclotron_period retrofit audit): the marker was redesigned from a floating ring into a dim RADIAL START/FINISH line. See field_3d_renderer.ts build comment L25424-25429 ("a dim RADIAL line along +u1 from the centre out past the outer orbit ... so it sits ON both start points + through the centre, not a floating glyph") and the per-frame impl L25814-25828 (dual mode + same_start_marker: lo.visible=true, endpoints origin [0,0,0] -> u1*(rOuter+0.3), opacity 0.45, a dim non-focal reference per Rule 29). Both charges launch at phase=0 (the +u1 point of their own ring) and share omega, so the line passes through the centre AND through both start points and both charges cross it together every lap — it can no longer read as an orphaned glyph adrift near text (the slow/fast role labels were also moved OFF the +u1 start axis onto +u2, L25763-25772). Fixed in code during the 2026-06-25 field3d work; the row was simply never flipped from OPEN.',
    prevention_rule: 'A decorative reference marker (start marker, tie marker) must sit ON its referent (the start point on the orbit ring), not float near text labels; co-locate it with the geometry it annotates. VERIFIED FIXED (2026-07-04): the quality-auditor read all four STATE_2 frames (t=0 / t=2000 / t=8000 / frozen) during the Rule 31 cyclotron_period retrofit audit and confirmed NO orphaned glyph anywhere; the STATE_2 tie money-beat reads correctly — both lap-timer bars fill simultaneously and the "= same T" tie badge writes at t=8000, all independent of this dim radial reference line.',
    probe_type: 'manual', probe_logic: 'Inspect cyclotron_period STATE_2: the start marker is a dim radial line from the centre out through both orbit start points (along +u1), NOT a floating ring adrift near the slow/fast labels.', status: 'FIXED', concepts_affected: [CY], fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'], row_type: 'incident' },
];

// ── Net-new DIRECTIVE rows (land only after the row_type='directive' ALTER) ──
const directives: Row[] = [
  { bug_class: 'teach_read_dense_ramp_frames_not_just_frozen', title: 'THE EYE / reviewer must read DENSE frames across an in-state animation, not only the frozen end-state', severity: 'MODERATE', owner_cluster: VV,
    root_cause: 'The circular_motion ghost-compare spiral passed THE EYE deterministic gates, the frozen-frame review, AND the AI auditor — all three inspected only the END state; the live ramp was broken and only the founder watching the live sim caught it.',
    prevention_rule: 'When a state animates within itself (ghost_compare ramp, sliders, equation_build, dual_orbit), read the DENSE frames across the transition window — a clean frozen end-state can hide a broken mid-transition.',
    probe_type: 'manual', probe_logic: 'Visual-validator/reviewer: for any state with an in-state reveal/ramp, dense frames through the transition are read, not just the frozen frame.', status: 'OPEN', concepts_affected: [CM, CY], fixed_in_files: [], row_type: 'directive' },

  { bug_class: 'teach_inverted_scenario_inverts_cutline_flags', title: 'A new field_3d scenario that inverts a sibling must also invert its cut-line flags (never inherit the suppression of the quantity the new atom owns)', severity: 'MODERATE', owner_cluster: AR,
    root_cause: 'cyclotron_period inverts radius_in_uniform_field: #4 holds arc-speed constant and SUPPRESSES the period (hide_period_readout:true); #5 holds the period constant and must SURFACE it (show_period_readout:true). Blind-cloning the sibling would have inherited the suppression of the very quantity #5 teaches.',
    prevention_rule: 'When a new field_3d scenario inverts what a sibling teaches, invert its cut-line flags too — surface the quantity the new atom owns; never inherit the sibling suppression flag.',
    probe_type: 'manual', probe_logic: 'Architect/renderer: an inverted-sibling scenario flips the relevant hide_*/show_* cut-line flag for the quantity it now teaches.', status: 'OPEN', concepts_affected: [CY], fixed_in_files: [], row_type: 'directive' },

  { bug_class: 'teach_auditor_reads_field3d_sliders_from_config_not_scene_composition', title: 'For field_3d concepts the auditor must read the interactive control surface from field_3d_config / rendered frames, not from scene_composition placeholders', severity: 'MODERATE', owner_cluster: VV,
    root_cause: 'The quality-auditor nearly false-flagged cyclotron_period STATE_4 as having only a combined "m,q,B" slider by reading the JSON scene_composition placeholder primitives; the rendered reality is 4 independent cyc_* sliders driven by field_3d_config.',
    prevention_rule: 'For field_3d concepts, judge the interactive control surface (sliders/knobs) from field_3d_config and the rendered frames, not from scene_composition placeholder primitives (which field_3d does not use for the actual controls).',
    probe_type: 'manual', probe_logic: 'Auditor: slider/control claims for a field_3d state are sourced from field_3d_config + rendered frames, not scene_composition.', status: 'OPEN', concepts_affected: [CY], fixed_in_files: [], row_type: 'directive' },
];

// The concept #5 to merge into the existing spiral row's concepts_affected.
const SPIRAL_BUG_CLASS = 'field3d_orbit_spiral_on_radius_ramp';
const SPIRAL_MERGE_CONCEPT = CY;

// ── SQL emit (archival migration record) ────────────────────────────────────
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
-- 2026-06-25: seed engine_bug_queue with the NET-NEW scars from the radius->period
-- chain (concept #4 circular_motion_charge_in_uniform_B + #5
-- cyclotron_period_independent_of_speed). ADD-ONLY; does not disturb existing rows.
-- Directive rows REQUIRE supabase_2026-06-25_engine_bug_queue_directive_rowtype_migration.sql
-- (the row_type='directive' ALTER) applied first. Generated by
-- src/scripts/_seed_engine_bug_queue_radius_period_chain.ts — idempotent.
-- ============================================================================

INSERT INTO engine_bug_queue (${cols}) VALUES
${all.map(sqlRow).join(',\n')}
ON CONFLICT (bug_class) DO UPDATE SET
  status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, fixed_in_files = EXCLUDED.fixed_in_files,
  probe_logic = EXCLUDED.probe_logic, title = EXCLUDED.title, severity = EXCLUDED.severity;

-- Merge concept #5 into the existing spiral row's concepts_affected (idempotent union):
UPDATE engine_bug_queue
SET concepts_affected = (
      SELECT ARRAY(SELECT DISTINCT unnest(concepts_affected || ${sqlArr([SPIRAL_MERGE_CONCEPT])}))
    ),
    updated_at = now()
WHERE bug_class = ${sqlStr(SPIRAL_BUG_CLASS)};
`;
}

async function upsertBatch(rows: Row[], label: string): Promise<boolean> {
  const payload = rows.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue')
    .upsert(payload, { onConflict: 'bug_class' });
  if (error) {
    console.error(`  x ${label} upsert failed: ${error.message}`);
    return false;
  }
  console.log(`  ok ${label}: ${rows.length} rows upserted`);
  return true;
}

async function mergeSpiralConcept(): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('concepts_affected')
    .eq('bug_class', SPIRAL_BUG_CLASS)
    .maybeSingle();
  if (error) { console.error(`  x spiral read failed: ${error.message}`); return; }
  if (!data) { console.log(`  - spiral row ${SPIRAL_BUG_CLASS} not present; skipping merge`); return; }
  const existing: string[] = data.concepts_affected ?? [];
  if (existing.includes(SPIRAL_MERGE_CONCEPT)) {
    console.log(`  ok spiral row already includes ${SPIRAL_MERGE_CONCEPT}`);
    return;
  }
  const merged = Array.from(new Set([...existing, SPIRAL_MERGE_CONCEPT]));
  const upd = await supabaseAdmin
    .from('engine_bug_queue')
    .update({ concepts_affected: merged })
    .eq('bug_class', SPIRAL_BUG_CLASS);
  if (upd.error) { console.error(`  x spiral merge failed: ${upd.error.message}`); return; }
  console.log(`  ok spiral row concepts_affected -> [${merged.join(', ')}]`);
}

async function main(): Promise<void> {
  // 1. Emit the archival SQL migration.
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-06-25_seed_engine_bug_queue_radius_period_chain_migration.sql');
  writeFileSync(sqlPath, emitSql([...incidents, ...directives]), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident + ${directives.length} directive rows)`);

  // 2. Land incident rows headlessly.
  console.log('Upserting incident rows...');
  await upsertBatch(incidents, 'incidents');

  // 3. Land directive rows (needs the row_type='directive' ALTER applied first).
  console.log('Upserting directive rows (needs the directive row_type ALTER)...');
  const ok = await upsertBatch(directives, 'directives');
  if (!ok) {
    console.log('  -> Run supabase_2026-06-25_engine_bug_queue_directive_rowtype_migration.sql in the');
    console.log('     Supabase SQL editor, then re-run this script to land the directive rows.');
  }

  // 4. Merge concept #5 into the existing spiral row.
  console.log('Merging concept #5 into the spiral row...');
  await mergeSpiralConcept();

  // 5. Verify.
  const newClasses = [...incidents, ...directives].map((r) => r.bug_class);
  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class, row_type, status, concepts_affected')
    .in('bug_class', [...newClasses, SPIRAL_BUG_CLASS]);
  if (error) { console.error('verify query failed:', error.message); return; }
  console.log('\nVerify — rows now present:');
  for (const row of data ?? []) {
    console.log(`  [${row.row_type}/${row.status}] ${row.bug_class} -> [${(row.concepts_affected ?? []).join(', ')}]`);
  }
  const landed = new Set((data ?? []).map((r) => r.bug_class));
  const missingDirectives = directives.filter((d) => !landed.has(d.bug_class)).map((d) => d.bug_class);
  if (missingDirectives.length) {
    console.log(`\nNOT yet landed (need the directive ALTER): ${missingDirectives.join(', ')}`);
  }
}

main().catch((err) => {
  console.error('seed failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
