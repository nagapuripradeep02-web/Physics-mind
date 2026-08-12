/**
 * engine_bug_queue row — SEAM Q's ink pass deepened the GLOW FOCAL, so the focal arrow rendered
 * darker than its own authored colour and darker than every non-focal peer (Rule 29 inverted).
 *
 * ONE row, upserted by bug_class (the row was already OPEN — this flips it to FIXED and records
 * the measured before/after). Routed by quality-auditor's FAIL on Ch.6 concept #5 and confirmed
 * independently on the already-baseline-locked block_on_incline.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_nlb_focal_arrow_deepened.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-07_ch6_c5_field3d_surgeon_focal_ink';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:field3d_surgeon'
  | 'peter_parker:runtime_generation' | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const rows: Row[] = [
  {
    bug_class: 'nlb_glow_focal_arrow_is_deepened_by_the_seam_q_ink_pass_so_the_focal_renders_darker_than_its_base_colour',
    title: 'SEAM Q deepened the glow focal over the lit slab, so the focal arrow rendered darker than its own authored colour and darker than every non-focal peer - Rule 29 emphasis inverted',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'nlbInkPass gives every newtons_laws_body stroke a backdrop-relative ink: lift toward white over the near-black page, deepen toward black over the lit slab. nlbInkEmphasis then generalised Rule 29 as "further from the local backdrop", so a focal over the slab was pushed DEEPER by the focal pulse. Both moves stack on the same element, and the result is that the focal is the darkest ink in the frame. MEASURED, conservative_vs_nonconservative_forces STATE_3 (whose one new thing IS the friction arrow flipping 180 degrees at turnaround, glow_focal nlb_arrow_block_friction): authored NLB_ARROW_COLORS.friction #F06292 (lum 0.293) -> slab lens #220e15 (lum 0.0070) -> focal pulse deepens a further 14-28 percent -> rendered rgb(29,12,18) at t=0/t=3000 and rgb(25,10,15) at the frozen pin, i.e. 1.04:1 against the page the arrow shaft actually hangs over. In the SAME frame the NON-focal mg arrow rendered full-bright rgb(202,169,68). The id resolved correctly and the physics was correct; only the emphasis direction was wrong. Not concept-specific: block_on_incline, already baseline-locked and shipped, rendered its focal friction arrow at rgb(29,12,18) / 1.04:1 across 278-288 pixels on STATE_2 and STATE_4. H2 is structurally blind to it - a 280-pixel arrow is 0.03 percent of a 1280x720 frame against a 2 percent tolerance, so the whole defect hides inside baseline noise.',
    prevention_rule:
      'A glow focal is DEFINED as the brightest object in the frame, so no post-pass may reduce its luminance. Any backdrop-relative ink lens must exempt the current focal from its darkening branch and instead give the focal the LIFTED ink plus a dark casing/outline, which buys contrast against a light backdrop without spending brightness. Two invariants to assert, not one: (1) the focal stroke drawn colour is strictly lighter than its authored palette entry, and (2) the focal stroke drawn colour is lighter than every non-focal stroke visible in the same frame. When generalising a rule stated in one dimension (Rule 29 = brightness) to a new situation (a light backdrop), check whether the generalisation preserves the ORDERING the rule exists to create - "further from the backdrop" preserves contrast but destroys the brightness ordering, and only the ordering is what Rule 29 means.',
    probe_type: 'js_eval',
    probe_logic:
      'For every newtons_laws_body state authoring a glow_focal that resolves to an nlb_arrow: sample the focal arrow shaft core pixels and (a) assert relative luminance strictly greater than the luminance of NLB_ARROW_COLORS[kind]; (b) sample every other visible nlb_arrow shaft in the same frame and assert the focal is the maximum. Independently assert the focal core clears 3:1 against its LOCAL backdrop (raycast the slab at the ink anchor; page otherwise), which the casing carries when the lifted core alone is marginal. FAIL on any focal whose drawn luminance is below its own base colour - that is the signature, and it is invisible to an H2 percentage because the arrow is a fraction of a percent of the frame.',
    status: 'FIXED',
    concepts_affected: [
      'conservative_vs_nonconservative_forces', 'block_on_incline', 'friction_force',
      'rolling_friction', 'newton_third_law', 'newton_first_law', 'free_body_diagram',
    ],
    fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
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
  return `-- 2026-08-07: the glow focal was deepened by the SEAM Q ink pass (Ch.6 concept #5 routing).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_nlb_focal_arrow_deepened.ts - idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-07_seed_engine_bug_queue_nlb_focal_arrow_deepened_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
