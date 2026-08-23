# Pass-2 four-question lens — `gravitational_potential_energy`

Authored by json_author, 2026-08-10, against the architect skeleton (cycle 1,
founder-proxy `DESIGN_OK` cycle 2) and the physics-author's block (six
blocking carry-ins C-1..C-6 all disposed, one additional Error-B instance
struck at the DoD symbol table, physics block §8).

## STATE_1 — `lifting_stores_energy`

1. **What doesn't the student know yet?** That "stored energy" is a NUMBER
   that grows with height, and that number is `U = mgh` — not yet that the
   height is measured from a CHOSEN line (that arrives in STATE_3).
2. **Feel the confusion first:** N/A — straightforward beat, no
   `misconception_watch` on this state (Rule 31 founder guardrail:
   straightforward states carry none). The motion itself IS the teaching: the
   bar visibly climbs in lockstep with the cart's height, live from frame one.
3. **What moves/appears?** The cart translates up the incline at a constant
   0.8 m/s (its own physics, `v` held constant by `F = mg sinθ` balancing
   exactly); the U bar and the displacement vector both grow live from state
   entry (no `reveal_at_ms` delay). Two checkpoint stamps (point A, point B)
   fire on crossing, each held 1200 ms; the formula's second line
   (`ΔU = mgΔh = 29.4 J`) appears at 4400 ms, mid-B-dwell, the LAST asserted
   reveal in the state.
4. **Where does the eye go?** `focal_primitive_id: "gpe_s1_panel"` points at
   the U-bar/stamp panel — the physics-bearing element, not the head
   annotation. Per-sentence glow walks the eye from the bar
   (`energy_bar_U_grav`) to the point-B stamp (`checkpoint_2`) to the
   displacement vector (`displacement_vector`) — cause (climb) before effect
   (bar/stamp), Rule 32a.

**Re-entry orientation:** first 5 s shows the cart already climbing, the U
bar and the h = 0 line both visible from t = 0 — a returning student sees the
whole apparatus immediately; the first stamp (point A) does not fire until
500 ms, comfortably inside the orientation window's tolerance since the base
scene (ramp, cart, bar, line) is already legible before it fires.

## STATE_2 — `same_height_same_energy`

1. **What doesn't the student know yet?** That U belongs to the PLACE, not
   the trip — having just watched U grow monotonically in STATE_1, the
   natural (untested) assumption is that U is a running total of "how far
   travelled," not a pure function of position.
2. **Feel the confusion first:** the round trip itself is the confrontation —
   the cart rises, slows, and returns, and the home-armed flag re-stamps the
   IDENTICAL 34.3 J on the return crossing. No predict-pause; the surprise is
   built into watching the same number reappear, not into a withheld reveal.
3. **What moves/appears?** The cart's own launch-coast-return kinematics
   (frictionless, `v0 = 3.13 m/s`); the home-armed checkpoint stamps on
   departure (pass 1, no dwell) and re-stamps with "(pass 2)" on return
   (dwell 1400 ms — `dwell_from_pass: 2`, the FIXED contract's own use case);
   the `predicted_stop` marker tracks the live apex height throughout.
4. **Where does the eye go?** `focal_primitive_id: "gpe_s2_panel"`; glow walks
   the panel (the round-trip claim) → checkpoint_1 (departure stamp) →
   checkpoint_1 (return stamp) → the bar (the closing "place, not trip"
   statement).

**Re-entry orientation:** same apparatus and home pose as STATE_1 (Rule 32d);
the bar, the h = 0 line and the departure stamp are all visible within the
first frame (the home flag fires on departure, essentially t = 0).

## STATE_3 — `the_zero_is_your_choice` (PRIMARY aha)

1. **What doesn't the student know yet?** That the h = 0 line is a CHOICE,
   not a fact — STATE_1 and STATE_2 both used the line silently and
   confidently (never discussed), building exactly the "the ground is THE
   zero" habit this state exists to break.
2. **Feel the confusion first:** the IDENTICAL S1 climb re-runs with only the
   reference moved — the bar visibly opens EMPTY (0.0 J instead of 8.8 J) and
   every stamped number changes (5.9 J, 35.3 J instead of 14.7 J, 44.1 J).
   That visual shock — the same physical climb, completely different numbers
   — is the confrontation itself, resolved when the formula's second line
   holds the SAME 29.4 J it held in STATE_1.
3. **What moves/appears?** Byte-identical motion to STATE_1 (`s(t) = 0.6 +
   0.8·t`, same checkpoint positions); the ONLY authored change is
   `h_ref_m: 0.3` (32b — only the taught variable's rendered consequence
   changes). The formula_lines array is BYTE-IDENTICAL to STATE_1's, so the
   held second line is a genuine click-to-click comparison, not a coincidence
   of independently-typed text.
4. **Where does the eye go?** `focal_primitive_id: "gpe_s3_panel"`; glow walks
   the reference line (`marker_h_ref`, three sentences running) to the point-B
   stamp (`checkpoint_2`, the held invariant) — the eye is deliberately kept
   ON the line for most of the state, since the line's NEW position is the
   entire content of the aha.

**Re-entry orientation:** identical apparatus to STATE_1 (same ramp, same
cart, same points) — the only visible difference at entry is the line's
position and the bar's opening value, both visible from frame one.

## STATE_4 — `different_slope_same_U`

1. **What doesn't the student know yet?** That path length has NO term in
   `U = mgh` — the "pushed for longer, so stored more" intuition, built by
   every single-slope state watched so far (effort feels proportional to
   distance).
2. **Feel the confusion first:** the ramp is visibly steeper (48.6° vs 30°)
   and the displacement arrow reads a shorter `d = 1.40 m` against STATE_1's
   own `2.40 m` at the identical height — the shock is a SHORTER visible
   effort producing the SAME 44.1 J stamp, confronted directly by holding
   both numbers on screen (the d value persists from STATE_1/STATE_3's home
   picture, per the P1-2 fix, so the comparison is genuinely two rendered
   numbers, not one rendered and one remembered).
3. **What moves/appears?** The cart climbs the rotated ramp at the same
   constant 0.8 m/s; the displacement vector grows to its shorter final value
   live; ONE checkpoint (point B) stamps 44.1 J at the target height.
4. **Where does the eye go?** `focal_primitive_id: "gpe_s4_panel"`; glow walks
   the displacement vector (twice — the shrink is the whole point) to the
   point-B stamp (`checkpoint_1`, the held 44.1 J).

**Re-entry orientation:** the ramp's rotation to 48.6° IS the delta from
STATE_1's home pose (32d — a declared, on-purpose apparatus change, not a
teleport); everything else (cart, bar, line, d-vector) persists in its
familiar position and reads immediately.

## STATE_5 — `U_and_the_work_by_gravity`

1. **What doesn't the student know yet?** WHY `U = mgh` is true at all — every
   prior state ASSERTED the formula; this state DERIVES it from
   `potential_energy_definition`'s own `ΔU = −W_conservative`, applied to
   gravity, with the derivation's two halves (ΔU and −W) both latched on one
   screen.
2. **Feel the confusion first:** the state opens by naming the OFFSET problem
   directly — the prerequisite's own zero line would have this exact launch
   reading 49.0 J at the start, while THIS state's own reference reads 34.3 J
   — before resolving that neither starting number matters, only the change.
   The mirror itself (U climbs by 8.6 J as W falls by 8.6 J) is watched, not
   pre-narrated.
3. **What moves/appears?** STATE_2's exact launch, now carrying a second
   (signed) work bar; a home-armed `'first'` flag latches the start reading
   within one frame (U = 34.3 J, W = 0.0 J — the labelled zero of a two-part
   ledger, not a completed round trip); point C latches 1400 ms later further
   up the slope (U = 42.9 J, W = −8.6 J); the formula's second line
   (`ΔU = mgΔh = 8.6 J`) appears at 600 ms.
4. **Where does the eye go?** `focal_primitive_id: "gpe_s5_panel"`; glow walks
   checkpoint_1 (the start stamp, visited twice — once for the OLD reference's
   number, once for THIS state's own) to the panel (the "only the change
   matters" pivot) to checkpoint_2 (the closing mirror). This is a RELATION
   state (bar-pair ↔ stamp-pair), so no state-level `glow_focal` (Rule 32e) —
   per-sentence glow stays live throughout.

**Re-entry orientation:** identical apparatus and home pose to STATE_2 (Rule
32d, declared contrast pair); the start stamp fires within one frame of entry
so a returning student sees the ledger's zero immediately, before any new
content (the point-C crossing) arrives.

## STATE_6 — `explore`

1. **What doesn't the student know yet?** Whether `U = mgh` survives
   teacher-driven manipulation of BOTH variables it names — mass and height
   (via angle) — or whether it was only true for the five staged apparatus
   configurations just watched.
2. **Feel the confusion first:** N/A — explore states are sandbox, not
   confrontation beats (Rule 31; STATE_6 carries no `misconception_watch`).
3. **What moves/appears?** Opens ALREADY MOVING — the angle idle-sweeps
   30°→40°→30° (`NLB_SWEEP_MS`), visibly ROTATING the ramp with the cart
   riding it, so `h` (and therefore `U`) has a genuine moving physical
   correlate even though the body itself never translates (the P1-5 finding
   this design resolves at the root: cycle-0's "mass-only sandbox" gap is
   fixed by exposing `theta` as a live, sweeping token, not merely a static
   slider). The sweep starts at `range[0] = 30`, the state's own authored
   angle, so the first frame shows no snap.
4. **Where does the eye go?** No state-level `glow_focal` (skeleton §0B.29 —
   ZERO glow_focal anywhere in this concept); the rotating ramp itself is the
   only moving element, so the eye needs no glow cue to find it.

**Re-entry orientation:** identical apparatus (ramp, cart, bar, h = 0 line) to
every guided state; the only difference at entry is that the ramp is already
mid-sweep and both sliders (`m`, `theta`) are live.

## Cross-cutting notes

- **`bar_max_J = 60` in ALL SIX states** — the mitigation for the
  scale-ceiling scar (`energy_bar_track_renders_no_scale_ceiling…`): this
  concept's whole claim rests on equal numbers rendering as equal fills
  across states (44.1 J at S1-B and S4; 29.4 J at S1 and S3), which only
  holds under one shared scale.
- **`h_ref_m` explicit on every state, even at the default 0** (S1/S2/S4/S5/S6)
  — S3's `0.3` sits mid-list, and an explicit lock on every sibling is the
  defensive discipline against a copy-paste inheriting the wrong value (the
  bug-#1 failure mode, one field level up from a slider default).
- **Three declared contrast pairs, no undeclared archetype repeats:**
  S1↔S3 (reference flip), S1↔S4 (slope flip), S2↔S5 (instrument flip — the
  work ledger joins). Each pair's delta cue names its own flip; Rule 32b is
  satisfied because only the ONE taught variable's rendered consequence
  changes within each pair.
- **Rule 32e (one glow focal at a time):** every guided state here is a
  RELATION state (bar ↔ height, stamp ↔ stamp) and authors NO state-level
  `glow_focal`; per-sentence `glow` bindings on `tts_sentences` carry all
  emphasis, walking the eye in narration order without ever fighting a
  state-level focal for the same instant.
- **No delayed first reveal anywhere** — every primitive (U bar, h = 0 line,
  weight/applied arrows, displacement vector where authored) is visible from
  state entry in every guided state; the only timed elements are checkpoint
  stamps (fire on physics crossing, never on an authored narration-timed
  `*_at_ms`, Rule 26) and the two `formula_lines[1]` reveals (S1/S3 at
  4400 ms, S5 at 600 ms), each landing well inside its own dwell window with
  ≥ 167 ms of margin on both sides (skeleton §10d).
