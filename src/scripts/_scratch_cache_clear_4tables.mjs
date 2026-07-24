// TEMP scratchpad — CLAUDE.md §6 cache clear (4 SEPARATE queries, never batched).
// Headless adaptation of the cache-clear skill: supabase MCP needs interactive
// OAuth, so this uses the service-role client (established ops path, ch7_state.md).
// Run: node src/scripts/_scratch_cache_clear_4tables.mjs
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const TABLES = ['simulation_cache', 'lesson_cache', 'response_cache', 'session_context'];
const PK_CANDIDATES = ['id', 'fingerprint_key', 'concept_key', 'session_id', 'cache_key'];

async function clearTable(table) {
  const { count: before, error: cErr } = await supabase
    .from(table).select('*', { count: 'exact', head: true });
  if (cErr) throw new Error(`${table} count failed: ${cErr.message}`);
  if (before === 0) return { table, deleted: 0, remaining: 0 };

  const { data: probe, error: pErr } = await supabase.from(table).select('*').limit(1);
  if (pErr) throw new Error(`${table} probe failed: ${pErr.message}`);
  const cols = Object.keys(probe[0]);
  const pk = PK_CANDIDATES.find((c) => cols.includes(c) && probe[0][c] !== null) ?? cols[0];

  const { error: dErr } = await supabase.from(table).delete().not(pk, 'is', null);
  if (dErr) throw new Error(`${table} delete failed: ${dErr.message}`);

  const { count: after, error: aErr } = await supabase
    .from(table).select('*', { count: 'exact', head: true });
  if (aErr) throw new Error(`${table} recount failed: ${aErr.message}`);
  return { table, deleted: before - after, remaining: after };
}

for (const t of TABLES) {
  const r = await clearTable(t); // sequential — one query set per table, never batched
  console.log(`${r.table} | deleted=${r.deleted} | remaining=${r.remaining}`);
}
console.log('CACHE_CLEAR_DONE');
