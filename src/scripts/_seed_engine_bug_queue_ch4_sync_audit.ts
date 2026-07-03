/**
 * Seed engine_bug_queue with the scar list from the founder's synchronisation
 * review of the Ch.4 magnetic-force batch-1 sims (recording 02.07.2026 + the
 * 5-agent TTS↔animation sync audit that followed). The founder asked whether the
 * TTS, the voice, and the animation choreography line up across the four Rule-31
 * sims — the audit found one systemic bug class plus several per-sim gaps.
 *
 * Root class (FIXED this session): every scenario ONE-SHOT (current flip, glyph
 * ⊗→⊙ toggle, velocity compass, split-screen electric→magnetic switch, camera
 * tilt, F-appear pop-in) fired at a HARDCODED state-local *_at_ms guess, decoupled
 * from the narration — so after the Rule-31 pacing trims every big event landed
 * 7–31s BEFORE the sentence describing it ("watch it flip" over an already-flipped
 * wire). Fixed by a generic per-sentence cue channel: the concept JSON tags the
 * narrating sentence with `scenario_cue`, the review player posts SET_CUE_TIME with
 * that sentence's (per-language) start, and field_3d_renderer's cueTriggerMs()
 * overrides the *_at_ms fallback — so the event fires on the narrated beat in EN /
 * HI / TE alike. THE EYE sends no cue times, so its deterministic *_at_ms capture
 * is unchanged.
 *
 * Fix #2 part 1 (2026-07-03, same session) closed two more: the duration-field
 * clamp that blinds THE EYE (real durations authored + the three capture caps
 * raised to 60s/61 frames) and the fcw hand that stayed stale after the flip
 * (per-frame slerp re-orient, pure function of the state clock).
 *
 * Fix #2 part 2 (2026-07-03, same session) closed the remaining six: the
 * moving_charge v-decomposition re-enabled (extras.vector_decomposition.show +
 * s4_3 glow retargeted to the arrows), real equally-spaced trail dots (ported the
 * no_work equal-time marker pool into the lorentz trail, honouring the previously
 * dead extras.particle_trail.equal_arc flag), rhr glow tags authored on all 21
 * epic_l sentences, the fcw STATE_2 static answer card removed (the TTS-synced
 * equation_panel carries the derivation), the mfmc s1_2c glow target corrected
 * trail→sliders, and the 8 stale dead field_3d_config teacher_script mirrors
 * deleted from rhr + no_work (epic_l_path is the single narration source).
 * All 9 rows now FIXED.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_ch4_sync_audit.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-03_ch4_sync_audit';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const RP: Owner = 'peter_parker:renderer_primitives';
const JA: Owner = 'alex:json_author';
const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const PLAYER = 'src/scripts/build_review_site.ts';
const ALL4 = [
  'magnetic_force_moving_charge',
  'magnetic_force_direction_right_hand_rule',
  'magnetic_force_perpendicular_no_work',
  'force_on_current_carrying_wire',
];

const incidents: Row[] = [
  {
    bug_class: 'field3d_timed_oneshot_reveal_unbound_to_narration',
    title: 'field_3d scenario one-shots (current flip / glyph ⊗→⊙ / velocity compass / split-screen switch / camera tilt / F-appear) fired at a hardcoded *_at_ms guess, 7–31s off the sentence that narrates them (worse after the Rule-31 pacing trims)',
    severity: 'MAJOR',
    owner_cluster: RP,
    root_cause:
      'Every field_3d scenario one-shot was gated on a hand-picked state-local millisecond constant (fcw current_flip.reverse_at_ms=20000; rhr glyph_toggle_at_ms=5000 + camera_orbit from t=0; no_work split_compare.sequential_delay_ms=7000 + velocity_compass_at_ms=18000 + f_appear). These constants were never tuned against the narration timeline, and the Rule-31 pacing pass changed the narration lengths without touching them, so each event landed far from its line: fcw STATE_1 flipped at 20s but "Watch the current flip" is spoken at ~41s; no_work STATE_3 froze the electric side + revealed the magnetic charge at exactly 7s, the instant the voice says "watch the speed meter climb"; rhr STATE_3 flipped the cross→dot at 5s but "watch what happens if I flip it" plays at ~27s. Reveals ride the sim clock while audio is a passenger (Rule 26), which is correct for per-sentence glow/math/hand cues (those ARE sentence-bound), but the scenario one-shots had no equivalent binding — they were pure fixed-time. Telugu (~1.2–1.3x longer) shifted the sentences further from the fixed reveals.',
    prevention_rule:
      'A scenario one-shot that a sentence NARRATES ("watch it flip / tilt / drop in") must be BOUND to that sentence, not a hardcoded *_at_ms. Tag the narrating tts_sentence with `scenario_cue` (current_flip | glyph_toggle | velocity_compass | split_switch | camera_orbit | f_appear); the review player posts SET_CUE_TIME with that sentence\\u0027s per-language start and field_3d_renderer.cueTriggerMs(name, fallback) overrides the *_at_ms. Keep the *_at_ms as the THE-EYE / no-cue fallback (deterministic gate sends no cues). Never leave a narrated event on a bare fixed-ms trigger.',
    probe_type: 'manual',
    probe_logic:
      'Play each guided state with narration on: the sentence that says "watch the X" must coincide (\\u00b12s) with X actually happening on screen — the flip/glyph/compass/split-switch/tilt fires as the line is spoken, never seconds before or after. Switch language to Telugu and re-check: the event must still land on its (now longer) sentence, proving the trigger follows narration not a fixed clock. A one-shot that fires at a constant sim time regardless of which sentence is playing is the regression.',
    status: 'FIXED',
    concepts_affected: ALL4,
    fixed_in_files: [
      RENDERER, PLAYER,
      'src/data/concepts/force_on_current_carrying_wire.json',
      'src/data/concepts/magnetic_force_direction_right_hand_rule.json',
      'src/data/concepts/magnetic_force_perpendicular_no_work.json',
    ],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_state_duration_field_clamps_eye_capture_window',
    title: 'The per-state `duration` field (24–30s) understates real narration (37–51s), and deriveStateMeta clamps THE EYE dense-capture to it — so the frames where the sync desyncs live were never photographed',
    severity: 'MAJOR',
    owner_cluster: JA,
    root_cause:
      'deriveStateDurationsMs() in deriveStateMeta.ts reads each state\\u0027s authored `duration` (seconds), converts to ms and clamps to [3000, 30000]; that window is what THE EYE / smoke:visual-validator --dense captures. Every batch-1 state declared a duration well under its real narration length (e.g. fcw STATE_1 declares 30 but runs ~51s, rhr STATE_2 declares 30 but ~46s EN / ~59s TE). So the payoff sentences — and the one-shot desyncs they expose — fall OUTSIDE THE EYE\\u0027s own capture window. This is why the mandatory visual gate (CLAUDE.md \\u00a75\\u2462) never caught the timing bug. The live player is unaffected (it paces off the real per-sentence timeline, not `duration`).',
    prevention_rule:
      'Author each state\\u0027s `duration` to at least its real narration length (estimate words/2.5 + sentences, or read the rendered clip totals once TTS exists) so THE EYE dense-capture spans the FULL spoken window including the closing/payoff sentence. A `duration` shorter than the narration silently blinds the visual gate — treat duration as the capture-window contract, not a cosmetic label. Consider raising DURATION_MAX_MS or driving the capture window off the narration timeline.',
    probe_type: 'js_eval',
    probe_logic:
      'For each state, assert authored duration_ms >= estimated narration ms (words/2.5 + sentences, \\u00d70.82) so the dense-capture window covers the last sentence. Flag any state whose declared duration is < 0.8\\u00d7 its narration length as an EYE blind spot.',
    status: 'FIXED',
    concepts_affected: ALL4,
    fixed_in_files: [
      'src/lib/validators/visual/deriveStateMeta.ts',
      'src/lib/validators/visual/screenshotter.ts',
      'src/data/concepts/magnetic_force_moving_charge.json',
      'src/data/concepts/magnetic_force_direction_right_hand_rule.json',
      'src/data/concepts/magnetic_force_perpendicular_no_work.json',
      'src/data/concepts/force_on_current_carrying_wire.json',
    ],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_fcw_rhr_hand_static_after_current_flip',
    title: 'force_on_current_wire STATE_1 3D right-hand is oriented ONCE at state entry and never re-computed, so after the current flip the thumb points the OLD (now wrong) way while the voice says "your thumb points along F"',
    severity: 'MAJOR',
    owner_cluster: RP,
    root_cause:
      'In applyForceWireState the fcw hand (fcw_hand) has its forward direction baked once (lU=+x, fU=lU\\u00d7bU); the per-frame block updates fcw_current_arrow / fcw_F_net / fcw_carrier(_force) but never fcw_hand. After the current reverses, the current cones and green F-arrow flip but the static hand\\u0027s thumb keeps pointing the original direction — a visible physics contradiction during the RHR walkthrough narration. (Binding the flip to its sentence via the new cue channel moves the flip to ~41s AFTER the walkthrough, so the hand is correct DURING s1_5\\u2013s1_7; the residual is the ~10s after s1_8\\u2019s flip.)',
    prevention_rule:
      'A static right-hand prop on a state that can reverse its current/field must re-orient (or hide/dim) when the direction flips — recompute the thumb from the LIVE current direction each frame (like lorentz_hand), or fade the hand out at the flip. Never leave a baked hand pointing a direction the scene has since reversed.',
    probe_type: 'manual',
    probe_logic:
      'On fcw STATE_1, let the current flip: the 3D hand\\u2019s thumb must track the NEW force direction (or the hand must fade) — a thumb still pointing the pre-flip way while the green F-arrow points the other way is the bug.',
    status: 'FIXED',
    concepts_affected: ['force_on_current_carrying_wire'],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_moving_charge_velocity_decomposition_never_enabled',
    title: 'magnetic_force_moving_charge STATE_4 narrates the v-parallel/v-perp split ("part of v drifts along B, the rest circles") but the pre-built decomposition arrows are never switched on — a regression from the 8\\u21924 Rule-31 restructure',
    severity: 'MAJOR',
    owner_cluster: JA,
    root_cause:
      'The renderer builds vParArrow/vPerpArrow + "v cos \\u03b8"/"v sin \\u03b8" labels for the helix decomposition, shown only when extras.vector_decomposition.show is true. STATE_4\\u2019s extras (velocity_vector / force_vector / particle_trail) never declare vector_decomposition, so the arrows stay hidden while s4_3 explains exactly that split. The decomposition visual was wired to the old standalone STATE_3 and lost when 8 states collapsed to 4.',
    prevention_rule:
      'When a state\\u2019s narration names a decomposition/vector that a pre-built primitive exists for, the state extras MUST enable it (or the sentence must be cut). After any state-count restructure, re-check every narrated visual promise against the state\\u2019s enabled primitives — a sentence with no on-screen counterpart is a regression.',
    probe_type: 'manual',
    probe_logic:
      'On moving_charge STATE_4, when s4_3 says "part of v drifts along B, the rest circles" the v-parallel and v-perpendicular arrows must be visible on the helix. If nothing decomposes on screen, the promise is unshown.',
    status: 'FIXED',
    concepts_affected: ['magnetic_force_moving_charge'],
    fixed_in_files: ['src/data/concepts/magnetic_force_moving_charge.json'],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_lorentz_trail_dots_narrated_as_continuous_line',
    title: 'magnetic_force_moving_charge STATE_2 narrates "watch the trail dots — equally spaced" but the lorentz trail renders as a smooth continuous line (no dot markers), so the visual cannot demonstrate the constant-speed claim',
    severity: 'MODERATE',
    owner_cluster: RP,
    root_cause:
      'The lorentz_force_uniform_field trail is a single THREE.Line; there are no discrete equally-spaced point markers in this scenario (extras.particle_trail.equal_arc is read only by magnetic_no_work\\u2019s nwUpdateTrail, not by the lorentz path). A smooth line looks identical whether or not the speed is constant, so "equally spaced dots" has nothing to point at. The sibling no_work scenario has a purpose-built velocity-compass for this proof; lorentz has no equivalent.',
    prevention_rule:
      'If a sentence points at "dots / equally-spaced markers" as proof, the scenario must actually render discrete equal-arc/equal-time markers — reuse the no_work equal-time marker device, or reword the narration to describe the smooth circle. Do not narrate a discrete visual the renderer draws as continuous.',
    probe_type: 'manual',
    probe_logic:
      'On moving_charge STATE_2, "watch the trail dots — equally spaced" must have visible discrete equally-spaced markers on the orbit. A smooth unbroken trail line under that line is the mismatch.',
    status: 'FIXED',
    concepts_affected: ['magnetic_force_moving_charge'],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_rhr_missing_glow_tags_no_narration_emphasis',
    title: 'magnetic_force_direction_right_hand_rule has ZERO `glow` tags across all states — nothing brightens when the narration names velocity v / magnetic field B / force F, so the eye is never directed (the renderer\\u2019s per-vector glow machinery is never invoked)',
    severity: 'MODERATE',
    owner_cluster: JA,
    root_cause:
      'applyRhrForceDirectionGlow() reads glowTargets to brighten the focal v/f/b/hand element (Rule 29), but no tts_sentence in the concept carries a `glow` field. The sibling magnetic_force_moving_charge uses glow throughout its RHR beat. So across the rhr sim, when the voice says "point your fingers along velocity v" / "curl toward magnetic field B" / "the thumb gives F", nothing on screen lifts to match — a systemic narration\\u2194emphasis gap, not a timing slip.',
    prevention_rule:
      'Every RHR/cross-product state must glow the focal vector on the sentence that names it (glow: "v"/"b"/"f"/"hand" per Rule 29), mirroring magnetic_force_moving_charge. A concept teaching directions with no glow tags fails the emphasis-tracks-narration check.',
    probe_type: 'manual',
    probe_logic:
      'Scrub rhr states: as each sentence names v, B, F or the hand, the matching scene element must brighten while peers dim. If nothing ever glows across the whole concept, the glow tags are missing.',
    status: 'FIXED',
    concepts_affected: ['magnetic_force_direction_right_hand_rule'],
    fixed_in_files: ['src/data/concepts/magnetic_force_direction_right_hand_rule.json'],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_fcw_static_formula_overlay_spoils_derivation',
    title: 'force_on_current_wire STATE_2 shows the fully-collapsed answer card F=(nAL)(qv_dB)=(nAqv_d)(LB)=ILB from t=0 in one corner, while the equation_panel spends ~22s "deriving" the same result the student can already read',
    severity: 'MODERATE',
    owner_cluster: JA,
    root_cause:
      'The renderer sets stateDef.formula_overlay unconditionally on state entry (static bottom-right card), but STATE_2\\u2019s designed aha is the progressive SET_MATH build of the same collapse in the bottom-left equation_panel. Showing the final F=ILB from the first frame undercuts the "the messy carrier picture collapses into one clean law" moment.',
    prevention_rule:
      'Do not show a static formula_overlay of the FINAL result on a state whose aha is deriving that result. Either drop the overlay and rely on the TTS-synced equation_panel, or gate the overlay to appear only after the last derivation step is spoken.',
    probe_type: 'manual',
    probe_logic:
      'On fcw STATE_2, the fully-collapsed F=ILB must NOT be visible before the derivation narration reaches it. A final-answer card present from t=0 while the equation_panel is still building is the spoiler.',
    status: 'FIXED',
    concepts_affected: ['force_on_current_carrying_wire'],
    fixed_in_files: ['src/data/concepts/force_on_current_carrying_wire.json'],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_glow_target_wrong_trail_vs_sliders',
    title: 'magnetic_force_moving_charge STATE_1 CTA "drag the angle slider" glows "trail" instead of "sliders" — the trail line pulses while the teacher is told to touch the control panel',
    severity: 'MODERATE',
    owner_cluster: JA,
    root_cause:
      'The slider-CTA sentence (s1_2c) carries glow:"trail"; the structurally identical CTAs in STATE_2 (s2_6) and STATE_4 (s4_4) correctly glow "sliders" (a real target that pulses the #sliders panel). So the wrong element is emphasised on the "drag the slider" beat.',
    prevention_rule:
      'A "drag/adjust the <control>" sentence must glow "sliders" (the control panel), not the resulting visual. Keep glow targets consistent across the same CTA pattern within a concept.',
    probe_type: 'manual',
    probe_logic:
      'On moving_charge STATE_1, the "drag the angle slider" line must pulse the slider panel, not the trail. A pulsing trail on a control CTA is the wrong target.',
    status: 'FIXED',
    concepts_affected: ['magnetic_force_moving_charge'],
    fixed_in_files: ['src/data/concepts/magnetic_force_moving_charge.json'],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_teacher_script_mirror_stale_deadcode',
    title: 'field_3d_config.states[*].teacher_script mirror copies are dead code (read by neither the player nor the renderer) yet drifted from the authoritative epic_l_path — missing Rule 30 bare-symbol expansion in several sentences',
    severity: 'MODERATE',
    owner_cluster: JA,
    root_cause:
      'Both the review player (build_review_site.ts) and field_3d_renderer.ts read narration ONLY from epic_l_path.states[*].teacher_script; the field_3d_config mirror is never consumed. In rhr and no_work the mirror has drifted (8/21 rhr sentences differ; no_work s4_2), keeping "along v" / "toward B" instead of the epic_l "along velocity v" / "toward magnetic field B" (Rule 30). Harmless today (dead), but a future reader/consumer would be misled.',
    prevention_rule:
      'Do not keep a second copy of the narration that nothing reads. Either delete field_3d_config.states[*].teacher_script or keep it byte-identical to epic_l_path. One source of truth for narration (epic_l_path).',
    probe_type: 'js_eval',
    probe_logic:
      'For each concept, assert field_3d_config.states[*].teacher_script (if present) matches epic_l_path.states[*].teacher_script sentence-for-sentence, or is absent. Any divergence is stale dead narration.',
    status: 'FIXED',
    concepts_affected: [
      'magnetic_force_direction_right_hand_rule',
      'magnetic_force_perpendicular_no_work',
    ],
    fixed_in_files: [
      'src/data/concepts/magnetic_force_direction_right_hand_rule.json',
      'src/data/concepts/magnetic_force_perpendicular_no_work.json',
    ],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_dense_capture_freeruns_lags_eye',
    title: 'THE EYE dense capture free-ran the sim on a WALL-clock cadence, so sim-time lagged ~0.6x (each screenshot stalls rAF) and the narration tail was never photographed — late one-shots (fcw flip at sim-20s, no_work compass at sim-18s) fell outside every dense frame',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      'captureDenseSeries (src/lib/validators/visual/screenshotter.ts) advanced between dense frames with page.waitForTimeout at WALL-clock intervals while the sim free-ran; each Playwright locator.screenshot stalls the page rAF loop, so the renderer frame-count clock (time += 0.016/frame) advanced only ~0.6x wall-clock. A state whose narration runs ~50s therefore only reached ~30s of SIM-time inside its dense window, so late narration beats were never captured. Raising the duration caps (the …duration_field_clamps… fix) widened the wall-clock window but not the sim-time reached, so it was necessary-but-not-sufficient. This is why the fcw-hand-flip and no_work-split scars carried manual probes: THE EYE structurally could not see the beat.',
    prevention_rule:
      'Dense frames on a renderer with a sim-clock (field_3d, window.PM_simTimeMs) must be PINNED to evenly spaced SIM-time targets — crawl-and-fill via SET_TIME_FREEZE + pollSimTimeReached (the same pin+poll the frozen frame uses), never wall-clock free-run. SET_TIME_FREEZE advances one rAF frame at a time so per-frame accumulators (trail, equal-arc dots, current drift) fill deterministically; SET_TIME_JUMP must NOT be used (it does not accumulate). Renderers without PM_simTimeMs keep the wall-clock fallback so they never burn a poll cap. Dense is never baselined, so re-timing needs no baseline re-approval.',
    probe_type: 'manual',
    probe_logic:
      'Run visual:eyes on a concept with a late one-shot (fcw current_flip fallback reverse_at_ms=20000): the dense frames near sim-20s MUST show the flipped state (cones + F + hand reversed). If no dense frame ever reaches the authored sim-time of the late beat, dense is free-running/lagging again.',
    status: 'FIXED',
    concepts_affected: ALL4,
    fixed_in_files: ['src/lib/validators/visual/screenshotter.ts'],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_stored_tts_clip_stale_after_text_rewrite_same_id',
    title: 'Stored Sarvam mp3s keyed by sentence id survive a text rewrite — the retrofitted sims SPEAK the old Socratic script while the captions + choreography follow the new JSON (fcw STATE_5 narrates the bent/zigzag wire, the last state narrates closing the loop)',
    severity: 'CRITICAL',
    owner_cluster: RP,
    root_cause:
      'generate_tts_audio.ts skipped a clip whenever its mp3 already existed on disk (existsSync(abs) && !force) — identity was the FILENAME (sentenceId_lang.mp3), never the text. The Socratic\\u2192straightforward retrofit rewrote every sentence under the SAME ids (s1_1, s5_2, \\u2026) and compressed fcw from 7 states to 6 (content shifted up one slot), so the old recordings matched the new keys positionally and kept playing: audio = old script, captions = new JSON text, choreography = new cues. build_review_site.ts compounded it by wiring any manifest clip without checking it against the current sentence text, and warning only when the manifest was entirely MISSING, never when stale. Even re-running tts:generate was a no-op without --force (and would have overwritten the manifest chars with the new lengths, destroying the staleness evidence). 27/31 fcw EN sentences were stale + 3 unvoiced + 19 orphans (incl. all s*_pred Socratic clips and old STATE_7); rhr 17 stale, mfmc 9 stale + 8 unvoiced, no_work 13 stale; electric_dipole_in_field had 2 latent stale clips from the live-instrument conversion.',
    prevention_rule:
      'A stored narration clip\\u0027s identity is its TEXT, not its filename. generate_tts_audio.ts now records sha1 text_hash per clip in the manifest and re-fetches whenever the current sentence text no longer hashes to it (chars-length fallback for pre-hash manifests), and prunes orphan mp3s whose sentence ids left the JSON. build_review_site.ts refuses to wire a clip whose recorded text no longer matches the JSON — stale clips are MUTED with a loud per-concept warning naming them (silence under a correct caption beats the wrong voice). After ANY teacher_script text edit, re-run npm run tts:generate <id> before handoff.',
    probe_type: 'js_eval',
    probe_logic:
      'For every tts_sentence \\u00d7 lang with an available manifest clip, assert sha1(trim(text_lang)) === clip.text_hash (fallback: trim-length === clip.chars). Any mismatch = the sim speaks a different script than it captions. Also assert no mp3 in review-site/<id>/audio/ lacks a matching sentence id in the concept JSON.',
    // FIXED 2026-07-03 (same session): all 5 concepts re-voiced EN+TE via the now
    // hash-aware tts:generate (fcw 60, rhr 40, mfmc 34, no_work 36, dipole 4 clips
    // written; 285 orphan mp3s pruned; 0 Sarvam failures); pages rebuilt with 0
    // stale warnings and every EN/TE clip hash-verified against the JSON.
    status: 'FIXED',
    concepts_affected: [...ALL4, 'electric_dipole_in_field'],
    fixed_in_files: ['src/scripts/generate_tts_audio.ts', PLAYER],
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
  return `-- 2026-07-03: engine_bug_queue scar list from the founder sync review of the Ch.4\n` +
    `-- magnetic-force batch-1 sims + the 5-agent TTS<->animation sync audit.\n` +
    `-- One FIXED class (per-sentence scenario_cue channel) + OPEN follow-ups (fix #2).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_ch4_sync_audit.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_2026-07-03_seed_engine_bug_queue_ch4_sync_audit_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident rows)`);

  const payload = incidents.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} scar row(s) upserted`);

  const { data, error: qErr } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class, status, severity')
    .eq('discovered_in_session', SESSION);
  if (qErr) { console.error('verify query failed:', qErr.message); return; }
  console.log(`In engine_bug_queue for this session: ${(data ?? []).length} rows`);
  for (const row of data ?? []) console.log(`  [${row.severity}] ${row.status}  ${row.bug_class}`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
