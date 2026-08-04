-- ─────────────────────────────────────────────────────────────────────────────
-- engine_bug_queue — mathematics subject support (2026-08-04)
--
-- Context: mathematics opened as the THIRD subject this session
-- (MATHEMATICS_BUILD_PLAN.md Phase 2 — the `mathematics_author` role, the
-- pattern library, the subject plumbing and `validate:mathematics`). Every agent
-- that authors a concept queries this table for prevention_rules BEFORE
-- authoring (root CLAUDE.md §2 — the build-side moat), so the new pipeline needs
-- both a writable owner tag and a filterable subject before its first concept.
--
-- ⚠ WHY THIS FILE SHIPS IN THE SAME COMMIT AS THE ROLE.
-- Chemistry did not. Its Phase 2 (2026-07-23) added `alex:chemistry_author` to
-- the two admin-UI enums and never migrated the CHECK constraint, so the UI
-- offered an owner the database rejected on write — latent until 2026-07-24, and
-- it went on to cost a later session a WRONG diagnosis in its scar rows (the
-- 2026-07-29 collision-theory audit recorded "alex:chemistry_author is rejected
-- by the CHECK constraint" as a blocker and parked real rows for no reason; by
-- then it was false). See
-- supabase_2026-07-24_engine_bug_queue_chemistry_subject_migration.sql:13.
--
-- Safety: both changes are ADDITIVE. The owner_cluster CHECK only GAINS a value;
-- the subject CHECK only GAINS a value. No existing row is read or rewritten, and
-- there is no backfill — mathematics has authored nothing yet, which is exactly
-- why this is the cheapest possible moment to land it.
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════
-- NOT YET APPLIED. Applying is a founder action (Rule 17).
-- Target: project dxwpkjfypzxrzgbevfnx (dev). engine_bug_queue is dev-only —
-- do NOT apply to physicsmind-pilot (production).
--
-- PRE-FLIGHT before applying (both must hold, or stop):
--   SELECT DISTINCT owner_cluster FROM engine_bug_queue;
--     → every value returned must appear in the list below, or restating the
--       list will invalidate live rows.
--   SELECT DISTINCT subject FROM engine_bug_queue;
--     → must be a subset of ('physics','chemistry','subject_neutral').
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Step 1: allow the mathematics author as an owner cluster ─────────────────
-- A CHECK constraint cannot be extended in place, so the full list is restated.
--
-- ⚠ CARRIED FORWARD FROM THE 2026-07-24 FILE, because it is easy to get
-- backwards: the DB list is AUTHORITATIVE over the admin `OWNERS` array, not the
-- other way round. That array has dropped `peter_parker:visual_validator` while
-- 39 live rows still use it. Never sync this CHECK *to* the UI — syncing that
-- direction would invalidate those rows.
ALTER TABLE engine_bug_queue
    DROP CONSTRAINT IF EXISTS engine_bug_queue_owner_cluster_check;

ALTER TABLE engine_bug_queue
    ADD CONSTRAINT engine_bug_queue_owner_cluster_check
        CHECK (owner_cluster IN (
            'alex:architect',
            'alex:physics_author',
            'alex:chemistry_author',         -- added 2026-07-24 (Phase-2 role, DB gap)
            'alex:mathematics_author',       -- added 2026-08-04 (third subject; shipped WITH the role)
            'alex:json_author',
            'peter_parker:renderer_primitives',
            'peter_parker:visual_validator',  -- 39 rows depend on this; the UI array dropped it
            'peter_parker:field3d_surgeon',   -- added 2026-07-27 (active on master)
            'ambiguous'
        ));

-- ── Step 2: widen the subject dimension ──────────────────────────────────────
-- 'subject_neutral' stays load-bearing and its meaning is unchanged: renderer and
-- authoring defect classes that bind EVERY pipeline. Most of what a mathematics
-- run will surface (canvas fit, annotation de-overlap, coincident text, ASCII
-- math, frozen-pin blindness) is subject_neutral, not 'mathematics' — tagging
-- those 'mathematics' would hide them from the physics and chemistry queries.
--
-- Reserve 'mathematics' for classes that bind the mathematics pipeline only:
-- domain/interval honesty, the Rule-38c notation ladder, the pixel↔data scale
-- factor, cartesian_plane scenario defects.
ALTER TABLE engine_bug_queue
    DROP CONSTRAINT IF EXISTS engine_bug_queue_subject_check;

ALTER TABLE engine_bug_queue
    ADD CONSTRAINT engine_bug_queue_subject_check
        CHECK (subject IN ('physics', 'chemistry', 'mathematics', 'subject_neutral'));

COMMENT ON COLUMN engine_bug_queue.subject IS
    'Which authoring pipeline this defect class binds. physics | chemistry | mathematics | '
    'subject_neutral. subject_neutral = renderer/authoring classes that bind ALL pipelines (the '
    'majority of every subject-opening run''s findings). Pre-authoring queries should select '
    'subject IN (<their subject>, ''subject_neutral'').';

-- ── Step 3: no backfill ──────────────────────────────────────────────────────
-- Deliberately empty. Mathematics has authored no concept and filed no scar row,
-- so there is nothing to retag. The `subject` column default ('physics') is
-- unchanged and every existing row keeps its exact current meaning.
