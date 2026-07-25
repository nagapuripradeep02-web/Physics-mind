-- ─────────────────────────────────────────────────────────────────────────────
-- engine_bug_queue — chemistry subject support (2026-07-24)
--
-- Context: the first chemistry concept (bohr_model_energy_levels, archetype L on
-- the parametric renderer) shipped through the full pipeline this session and
-- surfaced ~11 reusable defect CLASSES. Recording them is the whole point of the
-- scar list (root CLAUDE.md §2 — the build-side moat): every agent that authors
-- a concept queries this table for prevention_rules BEFORE authoring, so an
-- unrecorded defect is a defect the next concept repeats.
--
-- Two schema gaps this fixes:
--
--   1. `alex:chemistry_author` is MISSING from the owner_cluster CHECK. Phase 2
--      (2026-07-23) added the role to the two admin-UI enums
--      (src/app/admin/bug-queue/page.tsx + BugQueueList.tsx OWNERS) but never
--      migrated the DB constraint — so the UI offers an owner the database
--      rejects on write. Latent since Phase 2; caught 2026-07-24.
--
--   2. No `subject` dimension. With chemistry now authoring into the same queue,
--      rows must be filterable by subject so the chemistry pipeline's
--      pre-authoring query can scope to chemistry + the subject-neutral classes,
--      and so physics reporting stays unpolluted.
--
-- Safety: both changes are ADDITIVE. `subject` defaults to 'physics', so all 320
-- pre-existing rows keep their exact current meaning with zero backfill risk;
-- the owner_cluster CHECK only GAINS a value. No existing row is rewritten
-- except the explicit chemistry backfill in Step 3, which targets only rows
-- discovered in this session by name.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Step 1: allow the chemistry author as an owner cluster ───────────────────
-- Mirrors the 2026-04-27 visual_validator extension. Full list restated (a
-- CHECK cannot be extended in place) — keep in sync with the admin OWNERS array.
ALTER TABLE engine_bug_queue
    DROP CONSTRAINT IF EXISTS engine_bug_queue_owner_cluster_check;

ALTER TABLE engine_bug_queue
    ADD CONSTRAINT engine_bug_queue_owner_cluster_check
        CHECK (owner_cluster IN (
            'alex:architect',
            'alex:physics_author',
            'alex:chemistry_author',   -- added 2026-07-24 (Phase-2 role, DB gap)
            'alex:json_author',
            'peter_parker:renderer_primitives',
            'peter_parker:runtime_generation',
            'peter_parker:visual_validator',
            'ambiguous'
        ));

-- ── Step 2: subject dimension ────────────────────────────────────────────────
-- 'physics' default => every existing row keeps its meaning untouched.
-- 'subject_neutral' is deliberate and load-bearing: most defects found on the
-- chemistry run (canvas fit, annotation de-overlap, coincident text, ASCII math)
-- are RENDERER/AUTHORING classes that bind physics concepts equally. Tagging
-- them 'chemistry' would hide them from the physics pipeline's query.
ALTER TABLE engine_bug_queue
    ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT 'physics';

ALTER TABLE engine_bug_queue
    DROP CONSTRAINT IF EXISTS engine_bug_queue_subject_check;

ALTER TABLE engine_bug_queue
    ADD CONSTRAINT engine_bug_queue_subject_check
        CHECK (subject IN ('physics', 'chemistry', 'subject_neutral'));

CREATE INDEX IF NOT EXISTS idx_ebq_subject ON engine_bug_queue(subject);

COMMENT ON COLUMN engine_bug_queue.subject IS
    'Which authoring pipeline this defect class binds. physics | chemistry | subject_neutral. '
    'subject_neutral = renderer/authoring classes that bind BOTH pipelines (the majority of the '
    '2026-07-24 chemistry-run findings). Pre-authoring queries should select '
    'subject IN (<their subject>, ''subject_neutral'').';

-- ── Step 3: tag the 2026-07-24 chemistry-run findings ────────────────────────
-- Rows themselves are inserted by
-- src/scripts/_seed_engine_bug_queue_chemistry_session.ts (idempotent upsert on
-- bug_class). This backfill is a safety net so the subject is correct even if
-- the rows were inserted before this migration was applied.

-- Chemistry-pipeline-specific (bind chemistry authoring only).
UPDATE engine_bug_queue SET subject = 'chemistry'
WHERE bug_class IN (
    'archetype_live_tier_unverified_against_renderer',
    'chemistry_author_owner_cluster_missing_from_db_check'
);

-- Subject-neutral: found on the chemistry run, but these bind physics equally.
UPDATE engine_bug_queue SET subject = 'subject_neutral'
WHERE bug_class IN (
    'parametric_canvas_fixed_size_not_filling_host',
    'annotation_deoverlap_breaks_label_object_anchoring',
    'animated_path_missing_disappear_gating_labels_accumulate',
    'coincident_text_primitives_render_superimposed',
    'authored_content_collides_renderer_owned_control_zone',
    'smooth_camera_zoom_clips_content_on_full_canvas',
    'ascii_minus_in_oncanvas_math_from_tofixed',
    'review_site_missing_renderer_family_branch',
    'parametric_position_not_variable_bindable',
    'parametric_computephysics_missing_silent_template_leak'
);
