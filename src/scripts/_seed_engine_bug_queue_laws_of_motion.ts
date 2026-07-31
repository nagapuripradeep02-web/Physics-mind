/**
 * engine_bug_queue rows for the Laws of Motion chapter (2026-07-25 .. 07-30).
 *
 * Source: the scar_candidates.sql files accumulated across the lom-a / lom-b /
 * port worktrees during the newtons_laws_body engine build, the six-concept
 * authoring run, and the founder review rounds (solid apparatus, confident
 * vectors, spring push-off, slow-motion choreography, wall anchoring, mass labels).
 * Those files are REPORT-ONLY by the chapter-loop protocol — nothing was ever
 * written to the DB — so this script is the first time the chapter's scars enter
 * the moat.
 *
 * Three defects in the source files were repaired while building this set:
 *   1. UTF-8 read as cp1252 ("â€”" for an em dash) in 74 places.
 *   2. TWO pairs of statements were MERGED because the first of each pair is
 *      missing its trailing row_type value and its ');' terminator — the SQL was
 *      never executable as written. Recovered by splitting on the 25-value arity.
 *   3. Values outside the table's CHECK constraints, normalised to the nearest
 *      legal value: severity MEDIUM/LOW/MINOR -> MODERATE; probe_type
 *      dom_probe/json_probe/runtime_probe -> js_eval, static_check -> manual;
 *      row_type scar -> incident.
 *
 * Idempotent: upsert onConflict 'bug_class'.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_laws_of_motion.ts
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const rows = JSON.parse(
  readFileSync(join(process.cwd(), 'src/scripts/_lom_scars.json'), 'utf8'),
) as Record<string, unknown>[];

async function main() {
  console.log(`upserting ${rows.length} Laws of Motion scar rows...`);
  let ok = 0;
  for (const r of rows) {
    const { error } = await supabaseAdmin
      .from('engine_bug_queue')
      .upsert(r, { onConflict: 'bug_class' });
    if (error) {
      console.error(`  FAIL ${String(r.bug_class)}: ${error.message}`);
    } else {
      ok += 1;
    }
  }
  console.log(`done: ${ok}/${rows.length} upserted`);
  if (ok !== rows.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
