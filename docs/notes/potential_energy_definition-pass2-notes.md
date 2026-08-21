# Pass-2 four-question lens — `potential_energy_definition`

Authored by json_author, 2026-08-10, against the architect skeleton (cycle 1,
founder-proxy `DESIGN_OK` cycle 2) and the physics-author's block (route (a)
implemented, `h_ref_m = −3.05` in all four states).

## STATE_1 — `work_stored_as_potential_energy`

1. **What doesn't the student know yet?** That gravity's negative work is not
   destroyed — the belief carried in from #2/#4/#5 is that a falling work bar
   means energy is gone. The student does not yet know a SECOND bar exists
   that mirrors the first one exactly.
2. **Feel the confusion first:** the state opens already narrating the mirror
   (Rule 31 — no predict-pause), but the visual itself does the confronting:
   gravity's bar dives to −128.0 J while, in the SAME frames, a second bar
   climbs by the identical 128.0 J. The surprise is built into watching two
   bars move oppositely by the same amount, not into a withheld reveal.
3. **What moves/appears?** The block climbs and descends on the incline (its
   own physics, not choreographed); the U bar and the gravity work bar are
   both LIVE from state entry, no `reveal_at_ms` delay — this is a relation
   state (Rule 32e: no glow_focal), so nothing hides behind a gate.
4. **Where does the eye go?** `focal_primitive_id: "peu_s1_panel"` points at
   the energy/work bar panel — the physics-bearing element — not the title
   annotation. Per-sentence glow bindings walk the eye from the block
   (`nlb_body_block`) to the reference line (`marker_h_ref`) to the weight
   arrow (`nlb_arrow_block_weight`) to the panel (`energy_panel`) in narration
   order.

**Re-entry orientation:** first 5s shows the block already on the frictionless
slope, weight arrow visible, U bar and gravity bar both visible from t=0 (no
delayed reveal) — a returning student sees the whole apparatus immediately.

## STATE_2 — `friction_has_no_potential_energy`

1. **What doesn't the student know yet?** That the U-mirror is a PRIVILEGE of
   conservative forces only — having just seen gravity's work mirror into U,
   the natural (wrong) generalization is "any force's negative work stores."
2. **Feel the confusion first:** a THIRD bar (friction) appears and falls on
   both legs of the trip with no partner ever rising to meet it — the absence
   of a mirror is the confrontation, visible for the whole state, not a
   withheld reveal.
3. **What moves/appears?** Same block, same slope, now rough — the ONE taught
   variable change from STATE_1 (32b) is friction turning on; U and gravity's
   bar still move exactly as in STATE_1's law, and the new friction bar is
   live from entry.
4. **Where does the eye go?** `focal_primitive_id: "peu_s2_panel"`, same panel
   focus; glow walks block → panel (friction's fall) → panel (no partner) →
   U-bar (its unbroken lock with gravity) → panel (heat clause) → U-bar
   (closing scope statement).

**Re-entry orientation:** apparatus identical to STATE_1's home pose (Rule
32d — no teleport); only the surface friction and the third bar differ, both
visible immediately.

## STATE_3 — `delta_u_between_two_points`

1. **What doesn't the student know yet?** That the LEVEL of U and the LEVEL
   of W do not match anywhere (there's a 49.0 J offset baked into the chosen
   reference), yet the CHANGE between two points always does. Without this
   state a student would over-generalize STATE_1's "same number, opposite
   sign" picture to mean U literally equals −W at every instant.
2. **Feel the confusion first:** the two stamped lines are held on screen
   together (`point A: U = 88.2 J · W gravity = −39.2 J` /
   `point B: U = 135.2 J · W gravity = −86.2 J`) — a teacher can see with
   their own eyes that 88.2 and −39.2 are NOT sign-mirrors of each other,
   which is the surprise this state exists to produce, before the resolving
   subtraction (135.2 − 88.2 = 47.0 = −(−86.2−(−39.2))) is spoken.
3. **What moves/appears?** The block crosses point A (s = −1.6), the WHOLE
   scene freezes 2s (physics-freezing dwell, honesty badge `paused: point A`),
   resumes, crosses point B (s = +0.8, moved from the architect's original
   +0.4 per the founder-proxy P3-b fix so the taught subtraction is never
   degenerate with a single printed stamp), freezes again. `eye_capture_ms:
   3934` (recomputed from the flag-B move, NOT the architect's stale 3790)
   lands mid-B-dwell so both stamps are visible together in the frozen frame.
4. **Where does the eye go?** `focal_primitive_id: "peu_s3_panel"`; glow walks
   block → checkpoint_1 (point A) → checkpoint_2 (the comparison/subtraction)
   → marker_h_ref (the bridge to the next concept's movable reference).

**Re-entry orientation:** same apparatus, same home pose; the two point
markers are new but both are named on-screen ("point A"/"point B") the moment
they're crossed, no unexplained dots.

## STATE_4 — `explore`

1. **What doesn't the student know yet?** Whether the definition survives
   teacher-driven manipulation — dragging, relaunching, adding friction —
   or whether it was only true for the three staged trips just watched.
2. **Feel the confusion first:** N/A — explore states are sandbox, not
   confrontation beats (Rule 31, S3/S4 carry no `misconception_watch` per the
   founder's pivots-only guardrail).
3. **What moves/appears?** Opens ALREADY MOVING (the STATE_1 launch, μ
   defaulting to 0) with the SAME dashed U = 0 line and the SAME 49.0 J
   opening reading as STATE_1 — no reference discontinuity at the click into
   explore (the P1-3 finding this route (a) design resolves by construction).
4. **Where does the eye go?** `glow_focal: "nlb_body_block"` at the
   `newtons_laws_body` level (S4 opts out of narration glow per skeleton;
   zero per-sentence bindings, declared with reason).

**Re-entry orientation:** identical home pose/apparatus to every guided
state; the only difference is that all three sliders (`v0`, `mu_s`, `mu_k`)
and drag are now live.

## Cross-cutting notes

- **h_ref_m = −3.05 in ALL FOUR states** (one reference, no teleport at any
  transition — Rule 32d, the P1-3 finding resolved by construction).
- **Rule 32e (one glow focal at a time):** STATE_1–STATE_3 are RELATION
  states (U bar ↔ work bar) and author no `glow_focal` key, so per-sentence
  `glow` bindings on `tts_sentences` stay live and never fight a state-level
  focal for the same instant. STATE_4 is the one state with a genuine single
  object focal (`nlb_body_block`) and correspondingly carries zero narration
  glow.
- **No delayed first reveal anywhere** — every primitive (U bar, work bars,
  weight arrow, dashed reference line) is visible from state entry in every
  guided state; STATE_3's checkpoints are the only timed element, and they
  fire on crossing, not on an authored `*_at_ms` (Rule 26 — driven by the
  state's own physics clock, never narration-timed).
