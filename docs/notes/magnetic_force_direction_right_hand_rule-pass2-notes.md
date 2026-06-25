# Pass-2 four-question lens — magnetic_force_direction_right_hand_rule

Renderer family: **field_3d** (scenario `rhr_force_direction`). Q3 motion is authored in
`field_3d_config.states.STATE_N.rhr.*` / `extras.palm_rule` via state-clock ms; Q2 pause is
`pause_after_ms` on the prediction `tts_sentence`. No `teaching_method` / `reveal_at_tts_id` /
`animate_in` (those drive only the PCPL/parametric family). `hand_phase` / `freeze_proton` on
tts_sentences drive the shared 3D right-hand mesh on the state clock.

Re-entry rule check: STATE_5's first reveal is the `glyph_toggle_at_ms: 5000` flip, NOT the first
visible content — the ⊗ grid, v arrow, F arrow, and 3D hand are all visible at state entry, so the
orientation window has the full picture; only the cross→dot SWAP lands at 5 s. No state leaves a bare
object on screen during the first 5 s.

---

## STATE_1 — The sideways shove, which way?

1. **Not known yet:** that the force is *sideways* — across the motion, not along it. The student's
   default mental model is "a push speeds you up / pushes you forward." The across-the-motion direction
   of a magnetic force is genuinely invisible until the F arrow pops out perpendicular.
2. **Feel the confusion:** s1_2 asks "which way will the push point?" with `pause_after_ms: 2500`. The
   charge is already drifting and bending; the student sits 2.5 s watching it deflect with no F arrow
   yet — "something is bending it and I don't know where the push is."
3. **Moves/appears:** `trajectory_mode: "straight"` drift, then `rhr.f_appear_at_ms: 6000` pops the F
   arrow in sideways (⊥ to v and B) — the force APPEARS on screen before s1_3 names it.
4. **Eye goes:** to the deflecting particle and the popping F arrow. `focal_primitive_id` =
   `force_reveal_label` (the bottom green "a sideways force appears" line), co-located with the reveal —
   not the top setup label.

## STATE_2 — The rule: fingers v, curl to B, thumb F

1. **Not known yet:** the *procedure* that turns v and B into a force direction. The student has seen F
   appear (STATE_1) but has no tool to predict it themselves.
2. **Feel the confusion:** s2_3 "which way is your thumb pointing?" with `pause_after_ms: 3000` — the
   student must physically run the gesture and commit before the reveal.
3. **Moves/appears:** the 3D right-hand mesh (`extras.palm_rule.show_3d_hand`) curls through its phases
   driven by `hand_phase: "v"` → `"b"` → `"f"` on s2_1/s2_2/s2_4, then the charge is released
   (`freeze_proton: false`) and shoots the way the thumb showed. The hand MOVES; the words follow.
4. **Eye/hand goes:** the student's own right hand wants to point-and-curl. The on-screen 3D hand
   mirrors that exact gesture (gesture-mirror primitive present — Rule 16a / Pass-2 Q4 satisfied for a
   gesture state). `focal_primitive_id` = `rule_label` ("thumb points where the FORCE points").

## STATE_3 — Square to BOTH (PRIMARY aha)

1. **Not known yet:** that F is perpendicular to v AND to B *simultaneously* — it stands out of their
   plane, it doesn't lean between them.
2. **Feel the confusion:** s3_1 "what angle is between them?" with `pause_after_ms: 2500` — the student
   estimates the v–F angle before the right-angle mark is drawn.
3. **Moves/appears:** `rhr.show_right_angle_marks: true` draws the ⊥ marks on both v and B; then
   `camera_orbit_deg: 30` over 4000 ms tilts the view so F is SEEN standing out of the flat v–B sheet —
   the perpendicularity is shown by the camera move, not asserted in words.
4. **Eye goes:** to the right-angle marks and the orbiting F arrow lifting off the plane.
   `focal_primitive_id` = `perp_label` ("right angle to v AND right angle to B"). This is the PRIMARY
   aha state and sits inside `entry_state_map.foundational` (STATE_1–6) and `the_rule` (STATE_1–3).

## STATE_4 — Flip the sign (negative charge)

1. **Not known yet:** that the sign of the charge alone reverses F by 180°, with the SAME hand gesture.
   The student over-generalizes "the right-hand rule gives the force" and forgets the q factor.
2. **Feel the confusion:** s4_2 "same way, or opposite?" with `pause_after_ms: 3000` — student predicts
   after being told only the charge changed.
3. **Moves/appears:** `rhr.show_ghost_f: true` leaves a fading ghost of the old +q force arrow
   (`ghost_f_fade_ms: 1400`) while the new F snaps to the opposite side — the 180° flip is a visible
   motion against the ghost, not a sentence.
4. **Eye goes:** to the flipped F arrow vs the fading ghost. `focal_primitive_id` = `flip_label`
   ("opposite — a negative charge flips F a full 180°"). `allow_deep_dive: true` (hard state).

## STATE_5 — Into the page (⊗/⊙ ↔ the hand)

1. **Not known yet:** how a flat ⊗/⊙ textbook diagram connects to the 3D hand — the student treats the
   symbols as decoration and freezes on exam diagrams.
2. **Feel the confusion:** s5_4 "watch what happens if I flip the cross to a dot" sets up the
   `glyph_toggle_at_ms: 5000` swap — the student anticipates the consequence before it happens.
3. **Moves/appears:** `rhr.view: "page_view"` + `show_page_glyphs` renders the ⊗ grid + legend; the
   `ambient_field.direction: [0,0,-1]` per-state override puts B into the page; at 5000 ms the ⊗ toggles
   to ⊙ and the F arrow swings the other way — and the 3D hand re-orients its fingers into the page so
   the 2D and 3D answers agree on screen.
4. **Eye/hand goes:** to the glyph grid and the swinging F, with the 3D hand mirroring "fingers into the
   page." Gesture-mirror primitive present. `focal_primitive_id` = `page_glyph_label`. `allow_deep_dive:
   true` (hard state).

## STATE_6 — Along the field → no shove, then explore

1. **Not known yet:** that a magnetic force is NOT always present — when v ∥ B it vanishes; only the part
   of v across the field is pushed.
2. **Feel the confusion:** s6_2 "what force do you expect?" with `pause_after_ms: 3000`, after pointing
   out "there's nothing to curl through" — the student predicts zero (or wrongly predicts a force).
3. **Moves/appears:** `theta_deg: 0` (v∥B) so the F arrow is HIDDEN (never a zero stub); then
   `show_sliders: true` lets the student swing θ and watch F grow as v tilts across B and shrink to
   nothing as it lines back up. The explore is interactive motion, not narration.
4. **Eye/hand goes:** to the sliders and the appearing/vanishing F arrow. `focal_primitive_id` =
   `explore_label`. Interactivity (sliders) is in the LAST state only, per the interactivity rule.

---

## Cut-line / discipline self-checks

- **Direction only:** every state sets `hide_magnitude_readout: true`; no annotation, teacher_script
  sentence, or formula prints F = qvB sinθ, r = mv/qB, a period, or any Newton/Tesla number. Verified by
  Gate 5 plain-English (no `\\vec{` / `\\hat{` / `F_vec` / `n_hat`) and by hand-review of all 30 tts
  sentences + 18 annotations.
- **Thumb = pointer, never throttle:** STATE_2 misconception_watch confronts "the thumb shows how fast";
  all wording is on DIRECTION ("which way", "points where"), never speed/faster/harder.
- **Visual continuity:** the same moving charge + ambient B grid + 3D right hand carry STATE_1→6; the
  only deliberate switch is STATE_5's page-on view (motivated by the exam-diagram aspect), then STATE_6
  returns to space_view.
- **Carried-forward pauses (Diamond #4 regression guard):** every physics-block `pause_after_ms`
  (s1_2=2500, s2_3=3000, s3_1=2500, s4_2=3000, s6_2=3000) is present verbatim in BOTH the
  `epic_l_path` teacher_script and the mirrored `field_3d_config.states.*.teacher_script`.
