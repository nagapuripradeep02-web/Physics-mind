-- ============================================================================
-- 2026-06-10: engine_bug_queue visual-upgrades migration
-- ----------------------------------------------------------------------------
-- Supports the Visual Validator advanced-level upgrade (FULL BUILD plan,
-- founder-approved 2026-06-10):
--   * Widens visual_category CHECK from A-G to A-I:
--       H = deterministic non-vision checks (template leak H1 existed without
--           a category letter in the column; new H2 = regression baseline)
--       I = TTS<->visual semantic sync (new vision category)
--   * Seeds 6 new bug_class rows:
--       D5 ANIMATION_NO_MOTION        (dense adjacent-frame diff, pixel)
--       D6 ANIMATION_TELEPORT_PIXEL   (dense adjacent-frame diff, pixel)
--       D7 ANIMATION_STUCK_TAIL       (dense adjacent-frame diff, pixel)
--       H2 VISUAL_REGRESSION          (baseline pixelmatch, pixel)
--       I1 TTS_GLOW_TARGET_MISSING    (vision)
--       I2 TTS_MATH_NOT_RENDERED      (vision)
--
-- Probe-type policy: D5/D6/D7/H2 are deterministic pixel checks -> 'js_eval'
-- (same policy as F1/F4: not vision-resolvable). I1/I2 -> 'vision_model'.
--
-- Threshold calibration (2026-06-10, first real run on magnetic_force_moving_charge):
-- frozen canvas diffs ~0.00-0.05%/s; small orbiting particle on a static 3D
-- scene diffs 0.23-0.61%/s -> motion epsilon = 0.1% (0.001), not the original
-- 0.5% guess. D1p additionally gets a cyclic-path correction in pixelGate
-- (dense motion evidence overrides a first-vs-last "static" verdict).
--
-- Idempotent: constraint drop+recreate, INSERT ... ON CONFLICT (bug_class)
-- DO NOTHING so re-running the migration is a no-op.
--
-- See plan: ~/.claude/plans/federated-tickling-hamming.md (Step 0)
-- See spec: src/lib/validators/visual/spec.ts
-- See doc:  docs/VISUAL_VALIDATOR_SPEC.md
-- ============================================================================

-- ── Step 1: widen visual_category CHECK to allow 'H' and 'I' ─────────────────
ALTER TABLE engine_bug_queue
    DROP CONSTRAINT IF EXISTS engine_bug_queue_visual_category_check;

ALTER TABLE engine_bug_queue
    ADD CONSTRAINT engine_bug_queue_visual_category_check
        CHECK (visual_category IN ('A','B','C','D','E','F','G','H','I') OR visual_category IS NULL);

-- ── Step 2: seed the 6 new bug classes ────────────────────────────────────────

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, visual_category, discovered_in_session
) VALUES

-- ── Category D — dense adjacent-frame motion checks (deterministic) ────────
('ANIMATION_NO_MOTION',
 'State declares motion but dense adjacent-frame diffs show none',
 'MAJOR', 'peter_parker:visual_validator',
 'Renderer animation loop silently not driving the declared trajectory (slider not wired, trajectory_mode ignored, RAF stalled) — invisible to 5-keyframe capture when first/last frames coincide on a cyclic path.',
 'Every state whose config declares motion (field_3d trajectory_mode != static, or advance_mode auto_after_animation) must show >= 0.1% pixel change across at least one adjacent dense-frame pair. Run npm run visual:eyes before founder review.',
 'js_eval',
 'D5 — pixelGate diffs adjacent dense frames (~1s apart) per state; fails when expectsMotion=true and max(adjacent diff ratio) < 0.001.',
 'OPEN', 'D', 'session_2026_06_10'),

('ANIMATION_TELEPORT_PIXEL',
 'Mid-state pixel teleport — one adjacent-frame diff massively exceeds the median',
 'MAJOR', 'peter_parker:visual_validator',
 'Trajectory discontinuity inside a state: parameter snap, trail reset mid-cycle, camera jump, or interpolation bug between dense frames — between-keyframe motion invisible to the 5-keyframe capture.',
 'Within a state, adjacent dense-frame diffs must stay below max(20%, 8x median pair diff). Declared transitions belong BETWEEN states, never mid-state.',
 'js_eval',
 'D6 — pixelGate computes adjacent dense-frame diff ratios per state; fails when any pair > max(0.20, 8 * median) with median > 0.001.',
 'OPEN', 'D', 'session_2026_06_10'),

('ANIMATION_STUCK_TAIL',
 'Animation freezes near the end of a state after earlier motion',
 'MAJOR', 'peter_parker:visual_validator',
 'Render loop exception or trajectory time-clamp hit mid-state: animation plays then freezes — D4 vision check can miss it when the freeze starts after the last keyframe.',
 'A state that shows motion must keep moving until state end (or declare the freeze). pixelGate dense capture must not see >= 3 trailing frozen adjacent pairs after earlier motion.',
 'js_eval',
 'D7 — pixelGate checks the last 3+ adjacent dense pairs; fails when all < 0.001 diff while an earlier pair >= 0.001.',
 'OPEN', 'D', 'session_2026_06_10'),

-- ── Category H — deterministic regression baseline ──────────────────────────
('VISUAL_REGRESSION',
 'State render drifted from the approved visual baseline',
 'MAJOR', 'peter_parker:visual_validator',
 'A renderer or JSON change silently altered an already-approved state render — nothing re-checks approved diamonds after engine edits.',
 'Approve baselines per diamond via npm run visual:approve. Every visual run pixelmatches current state PNGs against visual_baselines/<concept_id>/; investigate any diff > tolerance (default 2%) before shipping.',
 'js_eval',
 'H2 — regressionGate normalizes both PNGs to width 640 and pixelmatches; fails when diff ratio > tolerance from baselines.json (default 0.02). Skips states with no approved baseline or compare:false.',
 'OPEN', 'H', 'session_2026_06_10'),

-- ── Category I — TTS<->visual semantic sync (vision) ────────────────────────
('TTS_GLOW_TARGET_MISSING',
 'TTS sentence glow target does not correspond to an identifiable on-screen element',
 'MODERATE', 'alex:json_author',
 'teacher_script tts_sentences[].glow names a renderer element id that the state scene does not actually render (typo, renamed primitive, or narration written against a different state).',
 'Every glow target in a state must map to a visible, identifiable element in that state render. Check presence/identifiability only — never glow brightness (1.8s pulse cycles mean any instant can be mid-pulse).',
 'vision_model',
 'I1 — Vision receives the state screenshot + the state primitive legend + each sentence glow target; asks: "is the element this sentence highlights present and identifiable on screen?"',
 'OPEN', 'I', 'session_2026_06_10'),

('TTS_MATH_NOT_RENDERED',
 'TTS sentence declares math_show but the formula is not visibly rendered',
 'MODERATE', 'alex:json_author',
 'tts_sentences[].math_show declares a formula for the equation panel but the rendered state shows no such formula (panel missing, expression dropped, or math_persist chain broken).',
 'Every math_show declared in a state must be visibly rendered on screen in that state. Vacuous pass when no sentence in the state declares math_show.',
 'vision_model',
 'I2 — Vision receives the state screenshot + the declared math_show expressions; asks: "is each declared formula visibly rendered somewhere on screen?"',
 'OPEN', 'I', 'session_2026_06_10')

ON CONFLICT (bug_class) DO NOTHING;

-- ── Verification (do not execute — for documentation) ────────────────────────
-- Confirm 6 new rows:
--   SELECT bug_class, visual_category, probe_type FROM engine_bug_queue
--     WHERE bug_class IN ('ANIMATION_NO_MOTION','ANIMATION_TELEPORT_PIXEL',
--       'ANIMATION_STUCK_TAIL','VISUAL_REGRESSION',
--       'TTS_GLOW_TARGET_MISSING','TTS_MATH_NOT_RENDERED');
--     -> 6 rows: D/js_eval x3, H/js_eval, I/vision_model x2
-- Confirm the widened CHECK accepts H and I:
--   SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
--     WHERE conname = 'engine_bug_queue_visual_category_check';
