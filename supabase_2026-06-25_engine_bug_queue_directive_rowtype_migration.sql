-- ============================================================================
-- 2026-06-25: engine_bug_queue — add row_type 'directive'
-- ----------------------------------------------------------------------------
-- The scar list now records THREE kinds of rows (founder decision 2026-06-25):
--   * probe_definition — the reusable visual/EYE checks (Cat A–G taxonomy)
--   * incident         — a concept's real observed defect (incl. render feedback
--                        the founder caught by eye), tagged with concepts_affected
--   * directive  (NEW) — a TEACHING-methodology lesson the architect / physics_author
--                        read BEFORE authoring (no automated probe; probe_type='manual').
--                        e.g. "concrete before abstract", "reveal synced to narration".
--
-- DDL cannot run through the SELECT-only execute_sql RPC or PostgREST, so APPLY
-- THIS ONE STATEMENT IN THE SUPABASE SQL EDITOR (project dxwpkjfypzxrzgbevfnx),
-- then run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_field3d.ts
-- (the applier lands incident rows immediately; directive rows land once this ALTER
--  is applied — the upsert is idempotent, safe to re-run).
-- ============================================================================

ALTER TABLE engine_bug_queue
  DROP CONSTRAINT IF EXISTS engine_bug_queue_row_type_check;
ALTER TABLE engine_bug_queue
  ADD CONSTRAINT engine_bug_queue_row_type_check
  CHECK (row_type IN ('incident', 'probe_definition', 'directive'));

-- Verification (do not execute — documentation):
--   SELECT row_type, count(*) FROM engine_bug_queue GROUP BY row_type;
