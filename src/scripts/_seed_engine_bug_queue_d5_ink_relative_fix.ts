/**
 * engine_bug_queue: flip visual_eyes_d5_thin_primitive_undercounted_on_large_canvas
 * to FIXED (founder-approved D5 recalibration, 2026-07-23).
 *
 * Fixes pixelGate.ts's D5 dense-motion check, which used a single percentage-
 * of-full-canvas epsilon (DENSE_MOTION_EPSILON, 0.1%) calibrated against
 * field_3d content (a filled/orbiting body sweeping a large area) — it
 * structurally could not see a thin primitive (a 3-4px force_arrow, an
 * angle_arc, a traced locus) whose real, correct motion changes a large
 * fraction of its OWN ink but a tiny fraction of a mostly-empty canvas. This
 * blocked the entire Class-11 Vectors chapter (16 concepts, all thin-primitive
 * content) — verified concretely on scalar_vs_vector STATE_2 (a visually-
 * confirmed correct 360°/2800ms rotating pointer that D5 reported as "pixels
 * never move").
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_d5_ink_relative_fix.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-23_d5_ink_relative_recalibration';

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

const PIXEL_GATE = 'src/lib/validators/visual/pixelGate.ts';

const rows: Row[] = [
  {
    bug_class: 'visual_eyes_d5_thin_primitive_undercounted_on_large_canvas',
    title: 'THE EYE’s D5 dense-motion gate under-counts a thin/small moving primitive (e.g. a force_arrow line) against a large canvas, false-failing real motion',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      'FIXED 2026-07-23 (founder-approved follow-on to the PCPL hardening plan). D5 compared each adjacent dense-frame pair’s pixelmatch diffPx against DENSE_MOTION_EPSILON (0.1%) expressed as a percentage of the FULL 1280x720 CANVAS (921,600px) — a threshold calibrated on magnetic_force_moving_charge (field_3d), where motion is a filled/orbiting body sweeping a large area. A thin, correctly-animating primitive changes a large fraction of its OWN ink but a tiny fraction of a mostly-empty canvas, so the same percentage-of-canvas lens structurally cannot see it. Measured directly from real captured frames (not guessed): scalar_vs_vector STATE_2’s pointer_main force_arrow (a visually-confirmed correct 360°/2800ms rotation, matching its authored variable_choreography almost exactly) changes a stable 346-369px/pair — 0.038-0.040% of canvas, under the 0.1% floor — but 1.39-1.48% of that pair’s own ink (non-background) pixel count, stable across all 8 dense pairs. The real noise ceiling in this codebase (measured from genuinely-static dense series on BOTH renderer families: mechanics_2d/scalar_vs_vector STATE_5’s 10 pairs, all EXACTLY 0px; field_3d/faraday_law_induction STATE_1’s 30 pairs, 0-16px) sits more than 20x below both the absolute-pixel and the ink-ratio signal above — a wide, empirically-verified safety margin. This blocked the entire Class-11 Vectors chapter (16 concepts, all built from thin arrows/angle_arcs/traced loci) from ever passing D5.',
    prevention_rule:
      'D5 now passes on EITHER of two lenses computed from the SAME single pixelmatch diffPx per pair (no second diffing pass): the UNCHANGED canvas-ratio (status quo — field_3d/particle_field content D5 was originally calibrated against cannot shift) OR a new content-relative ink-ratio (diffPx against the frame’s own non-background “ink” pixel count, estimated via an 8-anchor-point background-colour sample + a fixed per-pixel channel-distance delta — deterministic, no randomness, no per-concept tuning knob), gated by an absolute floor (DENSE_MOTION_INK_EPSILON=0.5% AND ≥32px changed, only evaluated when the pair has ≥500px of ink) so a near-blank frame’s stray noise can never masquerade as a large fraction of a tiny ink count. Mirrors pixelGate.ts’s own established D1p cyclic-path/hold-intent relaxation idiom: the primary criterion stands untouched, a well-evidenced secondary signal can ADDITIONALLY qualify as motion, never the reverse — a truly frozen pair has diffPx≈0 and fails both lenses identically (proven by negative control, see probe_logic). D6 (teleport) and D7 (stuck tail) are DELIBERATELY left reading the plain, unchanged canvas-ratio series — not touched, not rescaled — so their median-relative and absolute-floor calibration on field_3d/particle_field content cannot shift. includeAA:true was evaluated and rejected (roughly doubles the deficit’s diffPx on the same scalar_vs_vector pair — 595-634px / 0.065-0.069% — but still under the OLD canvas epsilon alone, while raising sensitivity file-wide for D1p/D6/D7 too with zero field_3d noise data to bound it — an unnecessary and unverified additional risk once the ink lens already fixes the verified case). Any FUTURE Vectors-chapter concept whose motion source is thinner still (a very short angle_arc, a sparse locus) should re-measure against this same ink lens before assuming a D5 fail is a real dead animation — open 2 dense frames and check by eye first (this prevention rule supersedes the OPEN row’s prior “cross-check by eye, then consider a fix” guidance now that the fix is shipped).',
    probe_type: 'js_eval',
    probe_logic:
      'Primary repro/fix confirmation: `npx tsx --env-file=.env.local src/scripts/visual_eyes.ts scalar_vs_vector` — D5 STATE_2 now reads "OK — motion visible via ink-relative lens: t=4000ms→t=5000ms changed 369px (1.48% of that pair’s ~24909px of ink; canvas-ratio stayed 0.04%...)" and the concept clears 23/23 deterministic checks (0 failed), versus the pre-fix run’s D5 STATE_2 FAIL ("pixels never move: max adjacent diff 0.04%"). Also visually confirmed on the dense contact sheet: the pointer arrow is in a clearly different orientation in every 1s sample, matching the authored 2800ms full rotation. Negative control (proves D5 has NOT gone blind): a standalone script fed runPixelGate() (a) faraday_law_induction STATE_1’s REAL naturally-near-static dense frames (0-16px/pair measured) re-labelled with expectsMotion forced true, and (b) a byte-identical-frame series (diffPx=0 by construction) — D5 correctly FAILED both ("pixels never move... 0.00% of canvas... <0.5% of ink (or too little ink to trust)"). Fleet regression (D5’s behavior on ALREADY-PASSING content must not shift): re-ran THE EYE on 2 field_3d concepts (faraday_law_induction, bar_magnet_as_dipole) and 1 particle_field concept (drift_velocity) before and after the fix — all three produced IDENTICAL check counts pre- vs post-fix (27/27, 56/56, 44/44). Per-line byte-diff of every D/H evidence string: faraday_law_induction’s D-category lines were 100% byte-identical (its states never hit expectsMotion=true, so the new code path never engages); drift_velocity’s D5 lines were numerically byte-identical (only cosmetic "of canvas" wording added) and its D6/D7/H2 lines were 100% byte-identical; bar_magnet_as_dipole showed a <0.1-percentage-point wobble in one state’s D6/D7/H2 lines between the two independent Playwright captures (e.g. 0.48%→0.47%) — inherent run-to-run Chromium rendering variance (D6/D7 read the untouched canvas-ratio array via unmodified code, so this cannot be attributed to the fix), well within all existing tolerances and with zero effect on any pass/fail outcome. `npx tsc --noEmit` → 0 errors, both before and after.',
    status: 'FIXED',
    concepts_affected: ['scalar_vs_vector'],
    fixed_in_files: [PIXEL_GATE],
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
  return `-- 2026-07-23: THE EYE's D5 ink-relative recalibration (founder-approved\n` +
    `-- follow-on to the PCPL hardening plan) -- flips\n` +
    `-- visual_eyes_d5_thin_primitive_undercounted_on_large_canvas OPEN -> FIXED.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_d5_ink_relative_fix.ts -- idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-23_seed_engine_bug_queue_d5_ink_relative_fix_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted (1 FIXED)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
