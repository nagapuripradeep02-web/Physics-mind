/**
 * engine_bug_queue rows from the Ch.6 concept #2 (`positive_negative_zero_work`) review chain,
 * 2026-08-02 — founder-proxy Checkpoint A (3 rows) + Checkpoint B (6 rows) = 9 candidates.
 *
 * EIGHT rows are seeded here. The ninth,
 *   `nlb_work_bar_tracks_misalign_when_one_caption_wraps_to_more_lines_than_its_neighbours`,
 * is DELIBERATELY EXCLUDED: field3d-surgeon already filed it as **FIXED** when it landed the
 * engine fix (`_seed_engine_bug_queue_nlb_work_bar_track_alignment.ts`, verified live 2026-08-02).
 * The Checkpoint-B candidate file carries it with `status: 'OPEN'` because the reviewer wrote it
 * before the fix existed, and every upsert in this contract does
 * `ON CONFLICT ... DO UPDATE SET status = EXCLUDED.status` — so applying it verbatim would have
 * silently REOPENED a closed row and discarded its `fixed_at` and `fixed_in_files`. Ordering is
 * load-bearing in this table (see the 2026-07-31 lom-g apply, where a row's UPDATE reopening an
 * earlier one as a recurrence had to run in sequence); an accidental reopen is the same hazard
 * with the sign flipped.
 *
 * Sources (SQL text, kept as the human-readable record):
 *   docs/loop_runs/ch6/positive_negative_zero_work/scar_candidates_checkpointA.sql   (3)
 *   docs/loop_runs/ch6/positive_negative_zero_work/scar_candidates_checkpointB.sql   (6, one skipped)
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_ch6_c2_review_scars.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-02_ch6_c2_positive_negative_zero_work_review_chain';

const ALREADY_FILED_FIXED_DO_NOT_REOPEN =
  'nlb_work_bar_tracks_misalign_when_one_caption_wraps_to_more_lines_than_its_neighbours';

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
  // ── Checkpoint A (design gate) ────────────────────────────────────────────────
  {
    bug_class: 'nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger',
    title: 'A frictionless state whose applied force opposes the motion can never come to rest: it reverses at v=0 and the constant-force ledger climbs back to zero, erasing the sign the state teaches',
    severity: 'CRITICAL',
    owner_cluster: 'alex:architect',
    root_cause:
      'The static hold requires |drive| <= maxStat with maxStat = b.mu_s * N (L45471, L45491), and surface.frictionless hard-zeroes mu_s and mu_k (L44685-86), so maxStat = 0. A state authoring frictionless: true together with a nonzero backward along-component (applied_force at an obtuse angle, nlbForceAlong) therefore satisfies neither the stuck test nor the sign-flip rest clamp at L45506, and the body reverses. Because W = F_along * (s - s0) for a constant force (L44209-10), the displayed ledger unwinds to exactly 0 as the body returns to its release point and then changes sign, while angle_arc {applied -> displacement} keeps reading the authored obtuse angle throughout (nlbFangDir reads NET displacement, L43989). loop_reset_ms conceals this only until the first trusted slider input, which latches PM_nlbSweepSeized (L42171) and makes nlbRunLoopReset return early for the rest of the visit (L43022) - i.e. it is concealed everywhere EXCEPT the interaction the state exists for. CAUGHT AT DESIGN TIME on positive_negative_zero_work S5 and never built; the shipped state authors mu_s = mu_k = 0.65 and v0 = 8, verified live (W held at -68.63 J across 11 samples over 12 s after a trusted theta drag, no reversal).',
    prevention_rule:
      'A guided state whose claim is the SIGN of a constant force\'s work must be able to END, and must stay ended for every value its own sliders can reach. If the along-component opposes the motion, either the surface supplies static friction able to hold it across the whole slider range (mu_s * N(theta) >= |F cos theta| for every reachable theta - compute the ENVELOPE, not the authored point: for F=25 N on 5 kg the binding value is mu_s = 0.5932 at theta = 149.3 deg, not the 0.457 the authored 120 deg suggests), or the state authors no slider that outlives its loop. Note the envelope is a SYMMETRIC PAIR (theta = 30.68 deg and 149.32 deg both require 0.5932, since N(theta) and |cos theta| are each symmetric about 90 deg), so a one-sided check is not a check. Never state a seized-run consequence for one state by analogy to another whose drive is different: a zero-drive coast arrests forward at the bound, a backward-drive coast reverses.',
    probe_type: 'js_eval',
    probe_logic:
      'For each state authoring work_accumulators with a non-empty controls_visible: drive the state, fire ONE trusted slider input to seize the loop, run 20 s. Assert that with the slider value unchanged from its authored value, the sign of every rendered work bar never changes and |W_rendered| never falls below 60 percent of its authored peak. Independently assert the body velocity never changes sign while the authored along-force is nonzero and constant.',
    status: 'OPEN',
    concepts_affected: ['positive_negative_zero_work', 'conservative_vs_nonconservative_forces', 'mechanical_energy_loss_with_friction'],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control',
    title: 'A state declares a motion archetype naming a between-state difference or a slider the teacher must drag, so its authored beat silently repeats a sibling',
    severity: 'MAJOR',
    owner_cluster: 'alex:architect',
    root_cause:
      'Rule 31 requires a distinct WITHIN-STATE authored motion, but nothing machine-checks the declaration against the produced pixels. When the engine cannot author the transition the state wants (param_ramp.param is the closed enum theta|F|mu_s|mu_k|m, L1576-1582 - there is no F_ang member, so an in-state angle sweep is unauthorable), an architect can still satisfy the declaration on paper by naming the difference from the PREVIOUS state (which is the delta cue, not the archetype) or the live slider (which is a Rule-31 addition, not the authored beat). Gate 3e/3f, eye_walker and quality_auditor all read the declared label. THIRD occurrence in one chapter: work_done_by_constant_force Checkpoint A F4 (declared delta was a verified pixel no-op), its Checkpoint B S5 (declared reveal-build with no time-varying mechanism - a third undeclared pure-translate, rebuilt), and positive_negative_zero_work S5 (declared rotate/flip on a beat where the only motion is a crate decelerating to a stop, i.e. S2\'s beat with a different force name). Caught at design time and resolved by re-declaring S2/S5 as the one contrast pair under a coined decay-to-rest archetype, leaving S1 the sole translate-through.',
    prevention_rule:
      'A motion archetype names a motion the AUTHORED beat produces with NO teacher input, inside the state, between t=0 and the loop reset. A between-state difference is the DELTA CUE. A live slider is a Rule-31 contextual control and is required, but it never discharges the archetype. If the engine cannot author the transition the idea wants, the state needs a genuinely different motion - not a renamed one, and not an engine extension whose output would contradict the state\'s own formula surface (a ramping theta accumulates the integral of F cos theta ds, which does not equal F*d*cos theta).',
    probe_type: 'manual',
    probe_logic:
      'For each guided state, write one sentence describing the motion visible from t=0 to the loop reset with every control untouched. Two states whose sentences are the same with different nouns are the same archetype, whatever they declare. Run this before the archetype audit, not after.',
    status: 'OPEN',
    concepts_affected: ['positive_negative_zero_work', 'work_done_by_constant_force', 'work_energy_theorem'],
    fixed_in_files: [],
    row_type: 'directive',
  },
  {
    bug_class: 'nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows',
    title: 'A DoD asserts what the frozen frame shows, and the asserted event precedes the pin by less than one frame',
    severity: 'MODERATE',
    owner_cluster: 'alex:architect',
    root_cause:
      'A loop_reset_ms state pins at cycle*R + clamp(0.60*R, 150, R-150) (deriveStateMeta L2931-2943). Authoring R so that 0.60*R only just exceeds the physical event the DoD names - a stop, an arrow hiding, a crossing - leaves a sub-frame margin, and the H2 baseline is minted on it. Measured on positive_negative_zero_work S2 at design time: R = 2600 gives a pin at 1560 ms; the friction arrow hides only once the static branch reports f = 0 (stuck requires |v| < NLB_STOP_EPS_V = 0.01, L39590/L45491), which at a = -3.92 first happens at frame 93, t = 1550 ms. Margin 10 ms = 0.6 frames, on a DoD that names that frame the state\'s best single picture. Any later change to mu, m, g or R silently re-photographs the baseline on the wrong side of the event, and no gate compares the baseline to the DoD sentence. Resolved before build by raising R to 3000 (pin 1800 ms, margin 250 ms = 15 frames).',
    prevention_rule:
      'When a DoD asserts what the frozen frame shows, state the margin in milliseconds between the asserted event and clamp(0.60*R, 150, R-150), and require at least 10 frames (167 ms). Compute the event time from the authored physics at the engine\'s own step size, not from the continuum solution - the discrete stop lands up to two steps after the analytic one because the rest clamp fires on a sign flip and the frame that fires it still reports the sliding value.',
    probe_type: 'js_eval',
    probe_logic:
      'For each loop_reset_ms state whose DoD asserts a discrete event (a stop, an arrow hiding, a crossing): integrate the authored physics at h = 1/60 to the first frame the event actually holds, and assert clamp(0.60*R, 150, R-150) minus that time >= 167 ms. Independently, pin at the contracted instant and assert the asserted element\'s rendered visibility matches the DoD sentence.',
    status: 'OPEN',
    concepts_affected: ['positive_negative_zero_work', 'work_done_by_constant_force', 'work_energy_theorem', 'conservation_of_mechanical_energy'],
    fixed_in_files: [],
    row_type: 'directive',
  },

  // ── Checkpoint B (build gate) ─────────────────────────────────────────────────
  {
    bug_class: 'state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach',
    title: 'A state whose claim is the relation between two overlays authors a focal on one of them, dropping the other below the contrast floor and destroying the comparison',
    severity: 'MAJOR',
    owner_cluster: 'alex:json_author',
    root_cause:
      'nlbApplyGlow sets glowActive whenever a focal string is present, so EVERY non-focal overlay goes to GLOW_DIM_OPACITY = 0.4 while solid apparatus takes the brighten-only carve-out. That is correct behaviour for a state teaching ONE object. It is wrong for a state teaching a RELATION between two overlays - force-along-displacement, or an arc measuring the angle between an arrow and a displacement - because half the comparison drops out. Measured on positive_negative_zero_work: STATE_1 (focal displacement_vector) rendered the applied arrow ink at 2.49:1 against the #0A0A1A background and its "F" label at 1.52:1; STATE_5 (focal angle_arc) rendered 2.45:1 and 1.93:1 while the arc itself sat at 10.76:1. The same arrow on STATE_4, which authors NO glow_focal, measures 9.74:1. WCAG floors are 3:1 for a meaningful graphical object and 4.5:1 for text. PARTIAL FIX 2026-08-02: glow_focal removed from positive_negative_zero_work STATE_1/STATE_5/STATE_6. Row stays OPEN because work_done_by_constant_force is still affected and untouched.',
    prevention_rule:
      'Rule 32e caps the focal count at one; it does NOT require one. Before authoring glow_focal, name the state\'s claim: if it is a property of a single object, a focal is right; if it is a RELATION between two overlays, author no glow_focal - glowActive stays false, nothing dims, and any per-sentence glow bindings then drive the emphasis in narration order, which is usually what the author already wrote. Verify by measurement, never by eye: sample the taught overlay\'s stroke-centre contrast in the frozen frame.',
    probe_type: 'js_eval',
    probe_logic:
      'For each state authoring a glow_focal, identify the overlays named in that state\'s formula_overlay, delta cue and tts_sentences. Sample each named overlay\'s ink in the frozen frame, hue-gated to its authored colour, take the mean relative luminance of the top 8 pixels, and assert contrast versus the local backdrop is at least 3:1 for a graphical object and 4.5:1 for text. FAIL when a named overlay is a dimmed peer and falls under the floor.',
    status: 'OPEN',
    concepts_affected: ['positive_negative_zero_work', 'work_done_by_constant_force'],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state',
    title: 'A state-level glow_focal outranks the per-sentence SET_GLOW channel for the whole state, so narration glow bindings can be 100 percent authored and 100 percent inert',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The review player posts SET_GLOW per sentence on the state clock (build_review_site.ts applyReveal -> sendGlow, Rule 26, independent of mute), and the renderer stores it in glowTargets. But nlbApplyGlow resolves focal = (eng.glow_focal) || nlb.glow_focal || glowTargets[0] - the narration channel is the LAST fallback, so any authored glow_focal wins for every frame of the state. Live-probed on positive_negative_zero_work STATE_1: PM_nlbEngine.glow_focal read "displacement_vector" unchanged across six samples spanning the state\'s full 12.5 s reveal timeline, while s1_1 binds nlb_arrow_crate_applied. 12 of the concept\'s 14 authored bindings were inert; only STATE_4, which authors no focal, could fire. This defeats the OPEN ratchet concept_ships_zero_narration_glow_bindings, whose probe asserts only the RATIO of bound sentences and therefore returns 1.0 on a concept where every binding is dead.',
    prevention_rule:
      'A declared authoring channel must be observable, not merely accepted. Either the per-sentence channel outranks the state default (a static focal is a DEFAULT, a narrated focal is an EVENT), or the precedence is documented at the authoring surface and a probe asserts that any state authoring both is authoring the static one deliberately. Until a founder ruling settles the precedence, treat an authored glow_focal as a declaration that this state opts OUT of narration-driven emphasis. Do NOT change the precedence from a chapter branch: it alters live behaviour on every field_3d concept that authors both, and THE EYE cannot see it because THE EYE never sends SET_GLOW. FOUNDER DECISION PENDING.',
    probe_type: 'js_eval',
    probe_logic:
      'For each state with at least one tts_sentences[].glow: drive the state on the built review page, step the clock through each sentence window, and read the effective focal each time. Assert the effective focal equals the sentence\'s authored glow for every sentence. Report any state where the effective focal is constant across all sentence windows while the authored bindings differ.',
    status: 'OPEN',
    concepts_affected: ['positive_negative_zero_work', 'work_done_by_constant_force'],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations',
    title: 'The explore state\'s named teaching prompts live only in scene_composition annotations, which field_3d never paints, so the assessment tests a demonstration the sim never proposes',
    severity: 'MAJOR',
    owner_cluster: 'alex:json_author',
    root_cause:
      'field_3d paints scene_composition annotations only under render_annotations, which conceptual field_3d concepts do not set; the standing directive from the biot incident already states that a teaching beat may never depend on annotations for its core payload. positive_negative_zero_work authors 18 annotations across six states. For STATE_1 to STATE_5 the text is fully duplicated by the narration and the state label, so nothing is lost - but STATE_6 authored two discoverables that existed NOWHERE else (the below-maximum-static-friction hold, and the theta=90 bar-freeze case), against a single-sentence explore narration. Verified absent three ways: zero annotation text across 169 EYE frames, zero in the live DOM, zero in sprite _pmText. q6_sandbox_class_transfer examines the first discoverable verbatim. SECOND-ORDER FINDING, still unaddressed: Rule 19\'s "at least 3 primitives per state" is satisfied here entirely by objects that are never drawn, so the gate that exists to guarantee visual richness cannot tell. PARTIAL FIX 2026-08-02: the two STATE_6 discoverables were moved into tts_sentences (s6_2, s6_3). Row stays OPEN for the Rule-19 blind spot and the 18 still-unrendered annotations.',
    prevention_rule:
      'Every teaching string must live on a path that renders: the state label, formula_overlay, caption, a tts_sentences entry, or a real primitive. scene_composition annotations are design notes on a field_3d concept, never delivery. Before an explore state ships, check its named discoverables against the rendered text paths, and check that every assessment question whose teaches_state is the explore state is answerable from something the sim actually shows. Never discharge this by setting render_annotations on a concept authored for clean mode - it paints every annotation in every state and breaks Rule 34.',
    probe_type: 'js_eval',
    probe_logic:
      'For each field_3d concept without render_annotations: collect every scene_composition entry of type annotation, and for each assert its text is substring-covered by that state\'s label, caption, formula_overlay or any tts_sentences text_en. Report any annotation carrying unique content. Separately assert that the count of RENDERED primitives per state (excluding unrendered annotations) is at least 3, so Rule 19 is measured against what is drawn.',
    status: 'OPEN',
    concepts_affected: ['positive_negative_zero_work'],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'nlb_arrow_and_arc_labels_never_received_the_force_rig_label_legibility_floor',
    title: 'The newtons_laws_body scenario draws arrow and arc labels in raw identity colour and dims them with the arrow, so a peer label reads at 1.5:1 and even a focal-state label reads at 3.5:1',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'force_rig_arrow_label_ink_too_dark_to_read_against_the_apparatus is FIXED, and its prevention rule mandates (a) a hue-preserving luminance lift on label ink and (c) a text carve-out from the glow pass whose recede is 0.85, not 0.40, so the arrow dims and its identifier stays readable. Its clause (f) correctly confined the change to the force_rig scenario\'s own region, so newtons_laws_body never received either half: its labels take the raw authored identity colour AND the peer dim. Measured on positive_negative_zero_work frozen frames, stroke-centre mean of the top 8 hue-gated ink pixels against #0A0A1A - STATE_1 "F" 1.52:1, STATE_5 "F" 1.93:1, STATE_3 arc label 2.72:1, and STATE_4 "F" 3.53:1 with nothing dimming at all. The FIXED row\'s own probe asserts at least 4.5:1 for every label in every state in both the focal and the dimmed-peer case.',
    prevention_rule:
      'When a scar is closed in one scenario\'s region for Rule-40 reasons, the row must enumerate the sibling scenarios that share the defect and remain OPEN against them, or a second row must be filed per sibling. A closed row whose fix reaches one of five scenarios is a closed row that will recur four more times. For newtons_laws_body specifically: port the ink helper and the text recede value; do not hand-pick per-concept hex values and do not touch the shared sprite helper from a chapter branch.',
    probe_type: 'js_eval',
    probe_logic:
      'Reuse the force_rig probe verbatim against newtons_laws_body: for each arrow, arc and displacement label, take a tight glyph box, gate to pixels within 40 degrees of the label\'s authored hue with real chroma, and assert (L_hi + 0.05)/(L_lo + 0.05) is at least 4.5 against the median box-border luminance - in every state, in both the focal and the dimmed-peer case, and assert the measured hue is still within 5 degrees of the arrow\'s authored hue.',
    status: 'OPEN',
    concepts_affected: ['positive_negative_zero_work', 'work_done_by_constant_force', 'connected_bodies'],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'f3d_widget_autolabel_contradicts_the_panel_header_it_toggles',
    title: 'The Rule-39g auto-discovered widget list labels the work-bar panel "Energy" while the panel header reads "Work done", on a concept that bans the word energy from reader-facing strings',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The generic widget engine derives a teacher-facing label from the discovered element id (nlb_energy -> "Energy", f3d_annots -> "Annots"), which is correct for ids named after what they show and wrong for ids that outlived their contents. SEAM M reused the SEAM L energy panel to carry the signed WORK ledgers, so the panel now renders the header "Work done" while its id still says energy. Captured live from WIDGET_DECLARE on positive_negative_zero_work. The gear list is teacher-facing, so this violates the concept\'s own boundary with work_energy_theorem and, separately, Rule 41 ("Annots" is not plain English).',
    prevention_rule:
      'A discovered widget must be able to declare its own teacher-facing label without opting into the full curated 39a path - for example a data-wg-label attribute on the discovered node, read in preference to the id-derived string. An id-derived label is a fallback, never a guarantee, and it silently rots the moment a panel is reused for new content.',
    probe_type: 'js_eval',
    probe_logic:
      'Capture the WIDGET_DECLARE payload on the built review page. For each entry, if the widget has a visible header or caption element, assert the declared label shares a stem with that header text. Independently assert every declared label is a whole English word (no truncated forms such as "Annots") and appears in no concept\'s banned-word list.',
    status: 'OPEN',
    concepts_affected: ['positive_negative_zero_work', 'work_done_by_constant_force'],
    fixed_in_files: [],
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
  return `-- 2026-08-02: Ch.6 concept #2 review-chain scars (founder-proxy Checkpoint A + B).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_ch6_c2_review_scars.ts — idempotent.\n` +
    `-- EXCLUDES ${ALREADY_FILED_FIXED_DO_NOT_REOPEN}, already filed FIXED by field3d-surgeon.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

async function main(): Promise<void> {
  // Guard: this script must never carry the already-FIXED row.
  const offender = rows.find((r) => r.bug_class === ALREADY_FILED_FIXED_DO_NOT_REOPEN);
  if (offender) {
    console.error(`✗ refusing to run: ${ALREADY_FILED_FIXED_DO_NOT_REOPEN} is already FIXED and this payload would reopen it`);
    process.exit(1);
  }

  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-02_seed_engine_bug_queue_ch6_c2_review_scars_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted (all OPEN)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
