# Pass-2 four-question lens — motional_emf

Renderer family: **field_3d** (scenario `motional_emf_rod`, NEW this session). Rule 31 concept — no
`pause_after_ms`, no `wait_for_answer`, no predict-pause. Q3 motion is authored in
`field_3d_config.states.STATE_N.motional_emf_rod.*` (mode-driven, exactly like `faraday.mode` /
`mag.mode`); the per-state block also drives control-row visibility (Rule 31c, `visible_controls`). Q2's
"feel the confusion before resolving it" is delivered by the MOTION itself (the surprising picture plays
for a few seconds before the resolving beat), not by a prediction question.

Re-entry rule check: every state's first 2–5s re-establishes the full picture (rails, resistor, rod, B
lattice, live eps/needle readout) before any state-specific reveal — S2's charge-separation zoom recaps
the slide for 0–3s before cutting in; S3's RHR hand is hidden 0–2s (a deliberate short delay, well under
the 2000ms re-entry-window threshold) while the frozen rod + charge markers from S2 are already on screen.

---

## STATE_1 — Two ways to get the same number: flux rate and Bvl

1. **Not known yet:** that the flux-rate route (dΦ/dt, from faraday_law_induction) and the direct Bvl
   formula are the SAME physics, not two different rules to memorize separately.
2. **Feel the confusion/surprise:** the rod is held motionless for 4s FIRST — both readouts pinned at
   exactly 0 despite sitting inside a real field — before any motion; this is the visual counter to
   "a field alone gives an EMF," played BEFORE the resolving slide, no question asked.
3. **Moves/appears:** the rod slides continuously 4–32s (`memRodX` linear ramp = constant v); the eps
   readout (computed live from B·l·v) and the needle deflection track together every frame — literally
   two numbers climbing in lockstep on screen, not narrated as "trust me, they match."
4. **Eye goes:** the readout panel (top-right, live) and the needle — `focal_primitive_id` =
   `flux_formula_label`, the formula that names what's climbing, co-located with the readout.

## STATE_2 — Why there's an EMF at all: q v×B separates the carriers (SUPPORTING aha)

1. **Not known yet:** that the EMF has a microscopic CAUSE — every free charge in the moving rod feels
   its own q v×B force; the rod isn't just "an EMF source," it's charges physically pushed apart.
2. **Feel the confusion/surprise:** the camera cuts from the wide slide (0–3s) into a close-up INSIDE the
   rod (3–5s) — the zoom itself signals "look closer, there's a mechanism here you haven't seen."
3. **Moves/appears:** the +/− charge markers settle onto the rod's ends via an asymptotic smoothstep
   (never linear) 5–14s, and the internal E arrow (E_internal = vB) grows in and holds 14–30s — the
   separation is SEEN happening, then seen to stop (equilibrium), not asserted.
4. **Eye goes:** the drifting charge markers and the settling internal-E arrow — `focal_primitive_id` =
   `force_label` (the F = q v×B formula the markers are obeying). Drill-downs: `why_charges_separate_in_rod`,
   `equilibrium_stops_further_separation`, `is_this_the_same_as_a_battery`.

## STATE_3 — Which end is positive — and it's not arbitrary

1. **Not known yet:** which end is + is DETERMINED (by v and B), not a coin-flip or a convention the
   student must memorize per-diagram.
2. **Feel the confusion/surprise:** the rod sits frozen (carried from S2) for 2s with NO hand yet — a
   held pause on the unresolved rod before the rule arrives — then the hand performs the RHR gesture
   itself (fingers-v → curl-B → thumb-F, 2–10s) and the polarity labels SNAP onto the ends matching the
   thumb (10–14s): the rule's OUTPUT is watched landing on the rod, not just described.
3. **Moves/appears:** teacher flips `v_dir` (14–24s) and the hand RE-RUNS the rule live — the polarity
   visibly re-flips in real time, the strongest possible demonstration that it's rule-determined, not
   arbitrary.
4. **Eye/hand goes:** the student's own hand wants to point-fingers-and-curl; the on-screen articulated
   hand (reused `createLorentzHand` + `rhrFingerJoints`, oriented via a properly-derived det=+1 basis so
   it is never mirrored) mirrors that exact gesture — gesture-mirror primitive present, Pass-2 Q4
   satisfied. `focal_primitive_id` = `rhr_label`. Drill-downs: `which_end_is_positive`,
   `polarity_flips_with_direction`, `fingers_curl_confusion`.

## STATE_4 — EMF exists without a closed circuit — current does not

1. **Not known yet:** that EMF and current are DIFFERENT things — a real, nonzero EMF can coexist with
   exactly zero current if the circuit is open.
2. **Feel the confusion/surprise:** the open gap/switch is shown FIRST (0–3s) so the student registers
   "nothing can flow here" before the rod even starts sliding — the surprise (a real voltmeter deflection
   with zero current) then plays out live as the rod moves.
3. **Moves/appears:** the rod slides continuously (live-v-driven oscillation) 3–24s; the needle deflects
   ∝ Bvl in real time while the readout's `I` line is pinned at exactly `0.00 A (circuit open)` the ENTIRE
   time — the contrast (moving needle, dead current line) is on screen simultaneously, every frame.
4. **Eye goes:** the readout panel's two lines side by side (eps climbing, I frozen at 0) —
   `focal_primitive_id` = `open_label`.

## STATE_5 — Close the loop: current flows, and a retarding force appears

1. **Not known yet:** that Lenz's opposition (`F_retard = BIl`) applies to a BARE rod, not only to a
   coil/loop — the student's only prior exposure (faraday_law_induction) was coil-shaped.
2. **Feel the confusion/surprise:** the switch SNAPS closed as a one-shot bound to its narrating sentence
   (`scenario_cue: "switch_close"`, not a hardcoded ms) — current beads immediately start visibly
   flowing the full loop where a moment ago nothing moved.
3. **Moves/appears:** current beads flow continuously round the rod→rail→resistor→rail loop (3–8s); the
   F_retard arrow on the rod grows/shrinks LIVE as R is dragged (8–20s), on a single consistent
   px-per-newton scale carried into S6/S7 (Rule 29 — the length changes only because the real magnitude
   changed).
4. **Eye goes:** the flowing beads and the F_retard arrow drawn ON the bare rod (no drawn "loop" element
   doing the opposing) — `focal_primitive_id` = `close_label`.

## STATE_6 — No work on a charge, yet the resistor gets hot (PRIMARY aha)

1. **Not known yet:** that "zero work on any single charge" (from magnetic_force_perpendicular_no_work)
   does NOT mean "zero mechanical effort on the rod" — these feel like the same claim but aren't.
2. **Feel the confusion/surprise:** the puzzle is posed explicitly (`puzzle_label`: "B does zero work on
   any single charge — so why push?") right as F_ext appears alongside the already-familiar F_retard —
   the tension is visible (two equal, opposite arrows) before the resolving numbers land.
3. **Moves/appears:** F_ext (new) and F_retard (carried from S5) sit equal-and-opposite on the rod
   (3–14s); the twin power readouts (P_mech = F_ext·v, P_elec = I²R) count up in LOCKSTEP to the identical
   number (14–24s); dragging v live (24–33s) keeps both numbers rising/falling together — the convergence
   is watched happening repeatedly, not stated once.
4. **Eye goes:** the two force arrows balancing and the two power numbers converging —
   `focal_primitive_id` = `energy_label`. This is the PRIMARY aha and sits inside
   `entry_state_map.foundational` (STATE_1–6). `aha_moment.statement` (14 words, exact): "B never pushes a
   single charge — yet pushing the rod becomes the resistor's heat." Drill-downs:
   `if_no_work_then_why_effort`, `where_does_electrical_energy_come_from`, `does_heavier_rod_need_more_push`.

## STATE_7 — Explore: B, l, v, R, and the direction of v

1. **Not known yet:** N/A — this is the open explorer; the "not known yet" question was answered across
   S1–6, and this state is the student's own sandbox to re-verify every relation live.
2. **Feel the confusion/surprise:** N/A (explore state) — the idle continuous rod oscillation (paced off
   the live v slider) satisfies the "explorers must move" contract even before the teacher touches
   anything.
3. **Moves/appears:** every quantity (Φ, eps via both routes, I, F_retard, F_ext, P) recomputes live off
   ALL five sliders (B, l, v, R, v_dir) simultaneously; current beads + both force arrows are all live.
4. **Eye/hand goes:** the slider panel (bottom-right, all five rows shown) and the readout panel
   (top-right, all lines shown) — `focal_primitive_id` = `explore_label`.

---

## Cut-line / discipline self-checks

- **Renderer-family note honored:** this is a field_3d concept — Q3 motion lives in
  `field_3d_config.states.STATE_N.motional_emf_rod` (mode-driven), never in `scene_composition`'s
  `reveal_at_tts_id` / `animate_in` (those drive only the PCPL/parametric_renderer family). No
  `pause_after_ms` anywhere in the teacher_script (Rule 31 — new concept, no legacy pauses to carry).
- **Straightforward + per-state contextual controls (Rule 31):** every state sets `show_sliders: true`
  structurally, but the ACTUAL panel + row visibility is mode-gated in `applyMotionalEmfRodState` —
  S1/S2 show no controls at all (a watch-this beat), S3 shows only `v_dir`, S4 only `v`, S5 only `R`, S6
  only `v`, S7 shows all five. The control panel is built ONCE in `buildMotionalEmfRod`; rows are
  shown/hidden per state, never rebuilt — a shared slider (e.g. `v`, appearing in S4/S6/S7) keeps the
  same screen position across states.
- **No two states alike in motion:** S1 (linear slide, hold-then-move), S2 (recap-slide-then-hold +
  charge settle), S3 (frozen rod + hand curl + a live re-flip), S4 (continuous v-driven oscillation +
  pinned-zero current), S5 (switch-snap one-shot + continuous bead flow + live F_retard), S6 (twin
  power-readout convergence + live v-drag), S7 (idle continuous oscillation, fully user-driven) — seven
  genuinely distinct motion pictures.
- **Gesture-mirror primitive (RHR, Q4):** S3 reuses `createLorentzHand` (the existing articulated hand +
  `rhrFingerJoints` per-frame finger regeneration) rather than inventing a new mesh. Orientation is
  computed via a proper orthonormal world-frame basis (`memHandQuatForVDir`: columns are mutually
  orthogonal unit vectors along world B/F/v axes) fed through `THREE.Matrix4.makeBasis` +
  `Quaternion.setFromRotationMatrix` — verified algebraically to have det = +1 for both signs of `v_dir`
  (the rotation is never a reflection, so the hand can never teach a mirrored/wrong polarity).
- **Plain English / Gate 5:** no `n_hat`, `F_vec`, `\hat{`, `\vec{` anywhere in `epic_l_path` (checked by
  grep before handoff); on-canvas annotations use Unicode Greek (Φ, ε) and plain words, never LaTeX-style
  vector notation. `mode_overrides` omitted entirely (conceptual-only directive).
- **Numerical self-check (physics_author's verified case, reproduced live in THE EYE frames):** defaults
  B=0.5, l=0.5, v=2, R=5 → eps=0.50V, I=0.10A, F_retard=0.025N, F_ext=0.025N, P=0.050W=I²R — confirmed
  exactly in the STATE_5/6/7 readout panel captures (`.visual_runs/motional_emf/20260703-225858/`).
