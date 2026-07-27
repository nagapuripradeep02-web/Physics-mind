// TEMP scratchpad — PARALLEL-SAFE cache clear (Amendment 5, 2026-07-24).
//
// The unconditional _scratch_cache_clear_4tables.mjs wipes ALL of simulation_cache — unsafe when a
// SECOND chapter loop runs against the same dev Supabase (it clobbers the sibling's freshly-seeded
// concept mid-EYE → false visual-gate FAIL). This variant scopes the wipe to ONE concept_key, so two
// loops authoring different concepts never touch each other's cache rows.
//
// Only simulation_cache matters to THE EYE (it reads cached HTML). The serving-path tables
// (lesson_cache / response_cache / session_context) are NOT read by the visual gate, so this helper
// deliberately leaves them alone — the loop's authoring path doesn't need them cleared.
//
// Run: node src/scripts/_scratch_cache_clear_scoped.mjs <concept_id>
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const conceptId = process.argv[2];
if (!conceptId) {
  console.error('ERROR: concept_id argument required. Usage: node _scratch_cache_clear_scoped.mjs <concept_id>');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// simulation_cache is keyed by concept_key; some rows also carry a fingerprint_key embedding the id.
// Two scoped deletes mirror the _seed_<id>_cache.ts convention exactly.
const { error: e1, count: c1 } = await supabase
  .from('simulation_cache').delete({ count: 'exact' }).eq('concept_key', conceptId);
if (e1) throw new Error(`concept_key delete failed: ${e1.message}`);

const { error: e2, count: c2 } = await supabase
  .from('simulation_cache').delete({ count: 'exact' }).like('fingerprint_key', `%${conceptId}%`);
if (e2) throw new Error(`fingerprint_key delete failed: ${e2.message}`);

console.log(`simulation_cache | concept_key=${conceptId} deleted=${c1 ?? 0} | fingerprint_key~${conceptId} deleted=${c2 ?? 0}`);
console.log('SCOPED_CACHE_CLEAR_DONE');
