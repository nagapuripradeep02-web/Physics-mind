-- 2026-06-11 harness audit batch 3: engine_bug_queue hygiene.
-- (1) Separate probe DEFINITIONS from observed INCIDENTS — the 38 vision-probe
--     taxonomy rows seeded 2026-06-10 (session_38) sat at status OPEN with
--     empty concepts_affected, drowning the 7 real open bugs and making every
--     "open rows" gate (quality_auditor Gate 8 context, HARNESS_REVIEW item 9)
--     noisy.
-- (2) Add FALSE_POSITIVE status so wrong vision-model verdicts get a real
--     disposition (today they can only be NOT_REPRODUCING), making per-gate
--     false-positive rate (HARNESS_REVIEW item 8) measurable.
--
-- Run as a single migration. Founder-approved before execution.

ALTER TABLE engine_bug_queue
  ADD COLUMN IF NOT EXISTS row_type text NOT NULL DEFAULT 'incident';

ALTER TABLE engine_bug_queue
  DROP CONSTRAINT IF EXISTS engine_bug_queue_row_type_check;
ALTER TABLE engine_bug_queue
  ADD CONSTRAINT engine_bug_queue_row_type_check
  CHECK (row_type IN ('incident', 'probe_definition'));

ALTER TABLE engine_bug_queue
  DROP CONSTRAINT IF EXISTS engine_bug_queue_status_check;
ALTER TABLE engine_bug_queue
  ADD CONSTRAINT engine_bug_queue_status_check
  CHECK (status = ANY (ARRAY['OPEN'::text, 'FIXED'::text, 'DEFERRED'::text, 'NOT_REPRODUCING'::text, 'FALSE_POSITIVE'::text]));

UPDATE engine_bug_queue
SET row_type = 'probe_definition'
WHERE probe_type = 'vision_model'
  AND status = 'OPEN'
  AND (concepts_affected IS NULL OR cardinality(concepts_affected) = 0);

-- Verification (expected after run):
--   SELECT row_type, status, count(*) FROM engine_bug_queue GROUP BY 1,2;
--   → incident: 25 FIXED, 7 OPEN, 3 DEFERRED, 2 NOT_REPRODUCING (37 total)
--   → probe_definition: 38 OPEN
