/**
 * Seed engine_bug_queue with the 2 PRE-EXISTING legibility gaps in
 * `current_loop_acts_as_dipole` surfaced by eye-walker after the 2026-07-08
 * Rule-31 JSON reconstruction (THE EYE run .visual_runs/current_loop_acts_as_dipole/20260710-001743,
 * 38/38 deterministic checks PASS — physically correct; these are polish, not blockers).
 *
 * NOT regressions from the reconstruction (JSON-only; field_3d_config untouched).
 * Both MODERATE; neither blocks a ship on its own. Full context:
 * docs/notes/biot_savart_law-engine-fix-spec.md (§current_loop).
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_current_loop_defects.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-09_current_loop_acts_as_dipole_legibility_from_eye_walk';

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

const rows: Row[] = [
  {
    bug_class: 'loop_dipole_couple_simultaneous_reveal',
    title: 'current_loop_acts_as_dipole STATE_6 shows external B, the force couple, and τ all at once — no cause-before-effect beat (Rule 32a); force_vectors/mu_vector/tau_vector extras have no reveal_at_ms hook',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause: 'STATE_6 caption narrates three sequential clauses ("Uniform B switched on. Opposite sides feel opposite forces — a couple. τ = m × B appears.") but B, the two force arrows, and τ are all fully rendered at dense_t00000. In the renderer, setVisibleWithFade sets fadeStartTime = state entry for f_left/f_right/mu_arrow/tau_arrow with no stagger, and the mu_vector/tau_vector/force_vectors extras carry no reveal_at_ms field, so cause (B) and effect (forces→torque) appear simultaneously with no readable beat.',
    prevention_rule: 'The loop-in-field couple/torque extras (force_vectors, mu_vector, tau_vector) need an authorable reveal_at_ms/stagger hook so the cause (external B on) can visibly precede the effect (opposite forces → τ) by a readable beat (Rule 32a). Applies to any concept on this couple-rendering path (current_loop_acts_as_dipole; check torque_on_current_loop_in_field siblings). Fixed-identity vector colours (m yellow, τ magenta, B blue) are an acceptable alternate to brighten/dim single-focal — 32e is not the issue here; the sequencing is.',
    probe_type: 'vision_model',
    probe_logic: 'eye-walker pixel-diff of STATE_6 dense frames (run 20260710-001743): B/forces/τ pixel-identical from t=0 to t=20000; all change confined to the loop current-dot flow, never touching the B-arrow or vector-label regions. Post-fix: B appears first, then after a beat the force pair + τ fade in.',
    status: 'OPEN',
    concepts_affected: ['current_loop_acts_as_dipole'],
    fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
    row_type: 'incident',
  },
  {
    bug_class: 'loop_dipole_micro_claim_without_micro_visual',
    title: 'current_loop_acts_as_dipole STATE_8 narrates the atomic/electron origin of magnetism but the frame reuses the macro-loop pose from STATE_2/3 pixel-for-pixel — no micro visual (Rule 32c delta / Rule 33 spirit)',
    severity: 'MODERATE',
    owner_cluster: 'ambiguous',
    root_cause: 'STATE_8 caption ("Electrons orbiting in atoms are tiny current loops. All magnetism is built from loops like this one.") promises a scale shift to the microscopic, but field_3d_config STATE_8 reuses the same loop+field-line extras as STATE_2/STATE_3 — the rendered frame is visually indistinguishable (masked pixel-diff vs STATE_2 ≈ current-dot-phase difference only). No atom/electron/lattice visual, no zoom-lens connector.',
    prevention_rule: 'When a state caption references a microscopic mechanism (electrons/atoms), the rendered frame must show a micro-scale visual distinct from the macro apparatus already on screen (Rule 32c delta cue must be met by the picture; Rule 33 dual-level spirit). Two fix paths: (json_author) give STATE_8 a distinct field_3d_config visual/camera so it is not a pixel-repeat of STATE_2/3; or (renderer_primitives) add a small atom/orbiting-electron micro primitive with a zoom-lens link. Never let the "origin" state silently reuse an earlier frozen pose.',
    probe_type: 'vision_model',
    probe_logic: 'eye-walker: STATE_8__frozen.png vs STATE_2__frozen.png near-identical (run 20260710-001743). Post-fix: STATE_8 shows a micro-scale (atom/electron-loop) visual distinct from the macro loop.',
    status: 'OPEN',
    concepts_affected: ['current_loop_acts_as_dipole'],
    fixed_in_files: [],
    row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string {
  if (a.length === 0) return `ARRAY[]::text[]`;
  return `ARRAY[${a.map(sqlStr).join(', ')}]`;
}

function toSql(r: Row): string {
  return `INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, row_type)
VALUES (${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(r.row_type)})
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,
  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,
  probe_type = EXCLUDED.probe_type, probe_logic = EXCLUDED.probe_logic, status = EXCLUDED.status,
  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files, row_type = EXCLUDED.row_type;`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', `supabase_2026-07-09_seed_current_loop_defects.sql`);
  writeFileSync(sqlPath, `-- ${SESSION}\n-- current_loop_acts_as_dipole legibility gaps surfaced by eye-walker (run 20260710-001743).\n-- Full context: docs/notes/biot_savart_law-engine-fix-spec.md\n\n${rows.map(toSql).join('\n\n')}\n`, 'utf-8');
  console.log(`📝 wrote archival SQL: ${sqlPath}`);

  let ok = 0;
  for (const r of rows) {
    let done = false;
    for (let attempt = 1; attempt <= 8 && !done; attempt++) {
      const res = await supabaseAdmin.from('engine_bug_queue').upsert(r, { onConflict: 'bug_class' });
      if (!res.error) { done = true; ok++; console.log(`  ✅ ${r.bug_class}`); }
      else { console.log(`  … ${r.bug_class} attempt ${attempt} failed: ${res.error.message}`); await new Promise((s) => setTimeout(s, 4000)); }
    }
    if (!done) console.log(`  ❌ GAVE UP on ${r.bug_class}`);
  }
  console.log(ok === rows.length ? `✅ Seeded all ${ok}/${rows.length} rows` : `⚠ Seeded ${ok}/${rows.length} rows — re-run when Supabase is stable (idempotent upsert)`);
  if (ok !== rows.length) process.exit(1);
}

main().catch((err) => {
  console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
