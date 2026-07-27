/**
 * engine_bug_queue row for the force_arrow-translate fix (2026-07-24).
 *
 * Bug dispatched by quality_auditor during the vector_addition_law audit:
 * drawForceArrow() never read spec.animation at all, so a "carry a vector
 * parallel to itself" beat (rigid translate, length/direction visibly
 * frozen mid-slide) was unbuildable in PCPL — the STATE_2 PRIMARY-aha beat
 * ("Carry B — tail on head") had to fake the carry with a
 * disappear/reappear ghost-arrow pair instead of one continuously-moving
 * arrow.
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_force_arrow_translate.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-24_force_arrow_translate_animation';

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

const rows: Row[] = [
  {
    bug_class: 'force_arrow_translate_animation_not_supported',
    title: 'drawForceArrow never read spec.animation — a "carry a vector parallel to itself" beat (rigid translate) was unbuildable in PCPL',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'FIXED 2026-07-24. drawBody() implements spec.animation.type === "translate" (a smooth one-shot slide by (dx_px, dy_px) over duration_sec + optional delay_sec, ease-out cubic, clamped at the end — parametric_renderer.ts ~line 1099), but drawForceArrow() never read spec.animation at all — authoring animation:{type:"translate",...} on a force_arrow silently no-op\'d. Surfaced by vector_addition_law STATE_2 (the PRIMARY-aha state, delta cue "Carry B — tail on head"): with no renderer support, the JSON had to fake the carry using two arrows (leg_B_ghost floating at a fixed point, disappear_at_ms 2600; leg_B_dock anchored + appear_at_ms 2600 grow-in) — sound-off the student sees a blink-out/blink-in, not a rigid parallel carry, even though "carry" is the exact word in both the delta cue and the narration.',
    prevention_rule:
      'drawForceArrow now reads spec.animation.type === "translate" with the IDENTICAL easing/delay/duration/clamp conventions as drawBody\'s translate branch (same timing vocabulary across primitive types, pure function of PM_simClockMs per Rule 36). The offset applies ONLY to the already-resolved origin (x1/y1) — the arrow\'s magnitude/direction (dx/dy, derived solely from force.vector/scale/gate.alpha) are never touched, so length and heading stay visibly frozen while the arrow rigidly slides (the entire pedagogical point of a parallel-carry beat). Because the offset is applied to the caller-resolved `origin` parameter, it composes with every existing origin-resolution path (literal from, origin_body_id, anchor_to, *_expr) without needing per-path changes. deriveStateMeta.ts\'s pcplSceneRevealMs() needed NO change — it already scans every scene_composition primitive generically for animation.delay_sec/duration_sec regardless of primitive type, so a force_arrow translate is automatically registered for reveal-hold classification the same way a body translate already is. Any FUTURE force_arrow animation type must be added the same way: read spec.animation inside drawForceArrow, offset origin only (never the force-vector-derived shaft), reuse existing timing field names — never invent a second animation vocabulary for arrows vs bodies.',
    probe_type: 'js_eval',
    probe_logic:
      'For a force_arrow spec with animation:{type:"translate", delay_sec:D, duration_sec:T, dx_px, dy_px}: at PM_simClockMs < D*1000, the drawn origin equals the pre-animation resolved origin (offset 0,0); at PM_simClockMs === (D+T/2)*1000, offset equals (dx_px,dy_px) scaled by the ease-out-cubic value at t=0.5 (1-0.5^3=0.875); at PM_simClockMs >= (D+T)*1000, offset equals exactly (dx_px,dy_px), clamped (no overshoot past). At every one of those three times, the arrow\'s length (hypot(dx,dy) of the SHAFT, i.e. tip-minus-origin) and heading (atan2(dy,dx) of the shaft) must be numerically identical — only the origin/tip pair translates, never the shaft vector. Regression guard: src/lib/renderers/__tests__/parametric_renderer.test.ts "force_arrow translate (2026-07-24)" describe block (string-presence: drawForceArrow reads spec.animation.type===translate, x1/y1 pick up arrowAnimDx/Dy, dx/dy stay derived from force.vector alone).',
    status: 'FIXED',
    concepts_affected: ['vector_addition_law'],
    fixed_in_files: [RENDERER, 'src/lib/renderers/__tests__/parametric_renderer.test.ts'],
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
  return `-- 2026-07-24: force_arrow spec.animation.type === 'translate' support (rigid\n` +
    `-- parallel-carry beat for vector_addition_law STATE_2). Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_force_arrow_translate.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = now();\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-24_seed_engine_bug_queue_force_arrow_translate_migration.sql');
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
