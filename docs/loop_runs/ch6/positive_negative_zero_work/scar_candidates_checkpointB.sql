-- Scar candidates — positive_negative_zero_work, Checkpoint B (founder-proxy, 2026-08-02)
--
-- SQL TEXT, NOT YET APPLIED. Written to a file the moment the reviewer produced it, per the
-- 2026-08-02 standing lesson (nine rows from concept #1 existed only in agent report text).
-- Apply with the seed-script contract before this concept ships.
--
-- bug_class values checked by the reviewer against all 596 live rows and every scar_candidates*.sql
-- in this run. No collisions.

-- 1 — B1 (BLOCKING). The four-bar ledger's tracks are not collinear.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('nlb_work_bar_tracks_misalign_when_one_caption_wraps_to_more_lines_than_its_neighbours',
 'A bottom-aligned work-bar row translates a slot''s track by one caption line, so a four-bar signed ledger draws four zero lines that are not level',
 'CRITICAL', 'peter_parker:field3d_surgeon',
 'nlbBuildEnergyPanel builds #nlb_wk_bars as display:flex with align-items:flex-end, and each slot is [track][caption][value] where the caption WRAPS by design (the builder comment says so explicitly, because a force''s plain-English name cannot fit one 46px slot on one line). A caption that wraps to three lines ("by the / normal / force") makes that slot one line taller than two-line neighbours, and bottom alignment therefore pushes its TRACK - and the zero baseline drawn at top:50% inside it - UP by exactly one line height. At NLB_EN_STEPS[0] the caption font-size is 13 with line-height 1.15 = 14.95px; measured offset on positive_negative_zero_work STATE_4 and STATE_6 is 15px (zero line y=186 vs y=201 for the other three), identical on three independent frames. On STATE_4''s 180 J scale the pull bar renders 24px for 44.9 J, so 15px equals 28.1 J; on STATE_6''s 792 J scale it equals about 128 J. The bar affected is the normal-force bar, whose whole claim is that it is parked exactly on zero, and the offset displaces it in the POSITIVE direction - contradicting the state''s own lesson on screen.',
 'A multi-track instrument aligns on the TRACKS, never on the bottom of a variable-height caption. Any panel whose columns carry wrapping text must guarantee that the tracks share a top edge and therefore a baseline, independent of caption line count - by anchoring the row on the tracks, or by reserving a fixed caption height sized to the longest authored caption. Never discharge this by shortening a label: the label is content, the alignment is the instrument''s contract, and the next concept''s caption will re-break it. This is a signed-ledger correctness property, not cosmetics: a fan of signed bars is read by comparing deflections against ONE zero line.',
 'js_eval',
 'For every state rendering more than one work accumulator: apply the state, read getBoundingClientRect().top and .height for each #nlb_wk_<w>_t track element, and assert every top is equal to the pixel and every height is equal. Repeat with synthetic captions of 1, 2 and 3 wrapped lines on the same state and assert the tops still match. Separately, sample the rendered zero-line row for each visible track from the frozen frame and assert all y values are identical.',
 'OPEN',
 ARRAY['positive_negative_zero_work','work_done_by_constant_force','work_energy_theorem','conservative_vs_nonconservative_forces','mechanical_energy_loss_with_friction']::text[],
 ARRAY[]::text[],
 'ch6-checkpointB-founder_proxy-positive_negative_zero_work', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;

-- 2 — B2. A focal chosen on a relation state dims one of the two related overlays.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach',
 'A state whose claim is the relation between two overlays authors a focal on one of them, dropping the other below the contrast floor and destroying the comparison',
 'MAJOR', 'alex:json_author',
 'nlbApplyGlow sets glowActive whenever a focal string is present, so EVERY non-focal overlay goes to GLOW_DIM_OPACITY = 0.4 while solid apparatus takes the brighten-only carve-out. That is correct behaviour for a state teaching ONE object. It is wrong for a state teaching a RELATION between two overlays - force-along-displacement, or an arc measuring the angle between an arrow and a displacement - because half the comparison drops out. Measured on positive_negative_zero_work: STATE_1 (focal displacement_vector) renders the applied arrow ink at 2.49:1 against the #0A0A1A background and its "F" label at 1.52:1; STATE_5 (focal angle_arc) renders 2.45:1 and 1.93:1 while the arc itself sits at 10.76:1. The same arrow on STATE_4, which authors NO glow_focal, measures 9.74:1. WCAG floors are 3:1 for a meaningful graphical object and 4.5:1 for text.',
 'Rule 32e caps the focal count at one; it does NOT require one. Before authoring glow_focal, name the state''s claim: if it is a property of a single object, a focal is right; if it is a RELATION between two overlays, author no glow_focal - glowActive stays false, nothing dims, and any per-sentence glow bindings then drive the emphasis in narration order, which is usually what the author already wrote. Verify by measurement, never by eye: sample the taught overlay''s stroke-centre contrast in the frozen frame.',
 'js_eval',
 'For each state authoring a glow_focal, identify the overlays named in that state''s formula_overlay, delta cue and tts_sentences. Sample each named overlay''s ink in the frozen frame, hue-gated to its authored colour, take the mean relative luminance of the top 8 pixels, and assert contrast versus the local backdrop is at least 3:1 for a graphical object and 4.5:1 for text. FAIL when a named overlay is a dimmed peer and falls under the floor.',
 'OPEN',
 ARRAY['positive_negative_zero_work','work_done_by_constant_force']::text[],
 ARRAY[]::text[],
 'ch6-checkpointB-founder_proxy-positive_negative_zero_work', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;

-- 3 — B3. The binding ratchet can read 1.0 while every binding is dead. FOUNDER DECISION on precedence.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state',
 'A state-level glow_focal outranks the per-sentence SET_GLOW channel for the whole state, so narration glow bindings can be 100 percent authored and 100 percent inert',
 'MAJOR', 'peter_parker:field3d_surgeon',
 'The review player posts SET_GLOW per sentence on the state clock (build_review_site.ts applyReveal -> sendGlow, Rule 26, independent of mute), and the renderer stores it in glowTargets. But nlbApplyGlow resolves focal = (eng.glow_focal) || nlb.glow_focal || glowTargets[0] - the narration channel is the LAST fallback, so any authored glow_focal wins for every frame of the state. Live-probed on positive_negative_zero_work STATE_1: PM_nlbEngine.glow_focal read "displacement_vector" unchanged across six samples spanning the state''s full 12.5 s reveal timeline, while s1_1 binds nlb_arrow_crate_applied. 12 of the concept''s 14 authored bindings were inert; only STATE_4, which authors no focal, could fire. This defeats the OPEN ratchet concept_ships_zero_narration_glow_bindings, whose probe asserts only the RATIO of bound sentences and therefore returns 1.0 on a concept where every binding is dead.',
 'A declared authoring channel must be observable, not merely accepted. Either the per-sentence channel outranks the state default (a static focal is a DEFAULT, a narrated focal is an EVENT), or the precedence is documented at the authoring surface and a probe asserts that any state authoring both is authoring the static one deliberately. Until a founder ruling settles the precedence, treat an authored glow_focal as a declaration that this state opts OUT of narration-driven emphasis. Do NOT change the precedence from a chapter branch: it alters live behaviour on every field_3d concept that authors both, and THE EYE cannot see it because THE EYE never sends SET_GLOW.',
 'js_eval',
 'For each state with at least one tts_sentences[].glow: drive the state on the built review page, step the clock through each sentence window, and read the effective focal each time. Assert the effective focal equals the sentence''s authored glow for every sentence. Report any state where the effective focal is constant across all sentence windows while the authored bindings differ.',
 'OPEN',
 ARRAY['positive_negative_zero_work','work_done_by_constant_force']::text[],
 ARRAY[]::text[],
 'ch6-checkpointB-founder_proxy-positive_negative_zero_work', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;

-- 4 — B4. Recurrence of the biot annotation directive, plus the Rule-19 blind spot it exposes.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations',
 'The explore state''s named teaching prompts live only in scene_composition annotations, which field_3d never paints, so the assessment tests a demonstration the sim never proposes',
 'MAJOR', 'alex:json_author',
 'field_3d paints scene_composition annotations only under render_annotations, which conceptual field_3d concepts do not set; the standing directive from the biot incident already states that a teaching beat may never depend on annotations for its core payload. positive_negative_zero_work authors 18 annotations across six states. For STATE_1 to STATE_5 the text is fully duplicated by the narration and the state label, so nothing is lost - but STATE_6 authored two discoverables that existed NOWHERE else (the below-maximum-static-friction hold, and the theta=90 bar-freeze case), against a single-sentence explore narration. Verified absent three ways: zero annotation text across 169 EYE frames, zero in the live DOM, zero in sprite _pmText. q6_sandbox_class_transfer examines the first discoverable verbatim. Second-order finding: Rule 19''s "at least 3 primitives per state" is satisfied here entirely by objects that are never drawn, so the gate that exists to guarantee visual richness cannot tell.',
 'Every teaching string must live on a path that renders: the state label, formula_overlay, caption, a tts_sentences entry, or a real primitive. scene_composition annotations are design notes on a field_3d concept, never delivery. Before an explore state ships, check its named discoverables against the rendered text paths, and check that every assessment question whose teaches_state is the explore state is answerable from something the sim actually shows. Never discharge this by setting render_annotations on a concept authored for clean mode - it paints every annotation in every state and breaks Rule 34.',
 'js_eval',
 'For each field_3d concept without render_annotations: collect every scene_composition entry of type annotation, and for each assert its text is substring-covered by that state''s label, caption, formula_overlay or any tts_sentences text_en. Report any annotation carrying unique content. Separately assert that the count of RENDERED primitives per state (excluding unrendered annotations) is at least 3, so Rule 19 is measured against what is drawn.',
 'OPEN',
 ARRAY['positive_negative_zero_work']::text[],
 ARRAY[]::text[],
 'ch6-checkpointB-founder_proxy-positive_negative_zero_work', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;

-- 5 — B5. A FIXED legibility floor that never reached a sibling scenario.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('nlb_arrow_and_arc_labels_never_received_the_force_rig_label_legibility_floor',
 'The newtons_laws_body scenario draws arrow and arc labels in raw identity colour and dims them with the arrow, so a peer label reads at 1.5:1 and even a focal-state label reads at 3.5:1',
 'MAJOR', 'peter_parker:field3d_surgeon',
 'force_rig_arrow_label_ink_too_dark_to_read_against_the_apparatus is FIXED, and its prevention rule mandates (a) a hue-preserving luminance lift on label ink and (c) a text carve-out from the glow pass whose recede is 0.85, not 0.40, so the arrow dims and its identifier stays readable. Its clause (f) correctly confined the change to the force_rig scenario''s own region, so newtons_laws_body never received either half: its labels take the raw authored identity colour AND the peer dim. Measured on positive_negative_zero_work frozen frames, stroke-centre mean of the top 8 hue-gated ink pixels against #0A0A1A - STATE_1 "F" 1.52:1, STATE_5 "F" 1.93:1, STATE_3 arc label 2.72:1, and STATE_4 "F" 3.53:1 with nothing dimming at all. The FIXED row''s own probe asserts at least 4.5:1 for every label in every state in both the focal and the dimmed-peer case.',
 'When a scar is closed in one scenario''s region for Rule-40 reasons, the row must enumerate the sibling scenarios that share the defect and remain OPEN against them, or a second row must be filed per sibling. A closed row whose fix reaches one of five scenarios is a closed row that will recur four more times. For newtons_laws_body specifically: port the ink helper and the text recede value; do not hand-pick per-concept hex values and do not touch the shared sprite helper from a chapter branch.',
 'js_eval',
 'Reuse the force_rig probe verbatim against newtons_laws_body: for each arrow, arc and displacement label, take a tight glyph box, gate to pixels within 40 degrees of the label''s authored hue with real chroma, and assert (L_hi + 0.05)/(L_lo + 0.05) is at least 4.5 against the median box-border luminance - in every state, in both the focal and the dimmed-peer case, and assert the measured hue is still within 5 degrees of the arrow''s authored hue.',
 'OPEN',
 ARRAY['positive_negative_zero_work','work_done_by_constant_force','connected_bodies']::text[],
 ARRAY[]::text[],
 'ch6-checkpointB-founder_proxy-positive_negative_zero_work', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;

-- 6 — Item 3. The auto-derived widget label contradicts the panel it toggles.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('f3d_widget_autolabel_contradicts_the_panel_header_it_toggles',
 'The Rule-39g auto-discovered widget list labels the work-bar panel "Energy" while the panel header reads "Work done", on a concept that bans the word energy from reader-facing strings',
 'MODERATE', 'peter_parker:field3d_surgeon',
 'The generic widget engine derives a teacher-facing label from the discovered element id (nlb_energy -> "Energy", f3d_annots -> "Annots"), which is correct for ids named after what they show and wrong for ids that outlived their contents. SEAM M reused the SEAM L energy panel to carry the signed WORK ledgers, so the panel now renders the header "Work done" while its id still says energy. Captured live from WIDGET_DECLARE on positive_negative_zero_work. The gear list is teacher-facing, so this violates the concept''s own boundary with work_energy_theorem and, separately, Rule 41 ("Annots" is not plain English).',
 'A discovered widget must be able to declare its own teacher-facing label without opting into the full curated 39a path - for example a data-wg-label attribute on the discovered node, read in preference to the id-derived string. An id-derived label is a fallback, never a guarantee, and it silently rots the moment a panel is reused for new content.',
 'js_eval',
 'Capture the WIDGET_DECLARE payload on the built review page. For each entry, if the widget has a visible header or caption element, assert the declared label shares a stem with that header text. Independently assert every declared label is a whole English word (no truncated forms such as "Annots") and appears in no concept''s banned-word list.',
 'OPEN',
 ARRAY['positive_negative_zero_work','work_done_by_constant_force']::text[],
 ARRAY[]::text[],
 'ch6-checkpointB-founder_proxy-positive_negative_zero_work', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;
