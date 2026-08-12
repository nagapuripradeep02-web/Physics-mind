# Checkpoint B inputs — `positive_negative_zero_work` (2026-08-02)

Reviews run in PARALLEL after THE EYE's first clean run. Both agreed the concept is numerically
sound; the auditor returned FAIL on two content findings, both applied and re-verified below.

## THE EYE — run 1 `20260802-054606`
27 deterministic checks · 27 passed · 0 failed · $0.00.

**Reveal map matched the design arithmetic exactly** — the skeleton's DoD (d) predicted the pin
instants from `deriveStateMeta`'s formula before the build, and the engine reported
`STATE_1=3200ms · STATE_2=1800ms · STATE_3=3840ms · STATE_4=3200ms · STATE_5=1560ms`, all
`reveal_hold`. Nothing was tuned to fit.

**Motion map reads `STATE_1=? … STATE_6=?`** — this is the KNOWN fleet-wide D5 dormancy
(`eye_motion_map_reads_cached_physics_config_which_holds_only_epic_l_path`), not a regression of
this concept. 40 of 148 concepts are affected. It is a Rule-40 PLATFORM fix for master and remains
a founder call; deliberately not touched inside a chapter branch.

## eye-walker — verdict CLEAN, zero candidate bug rows
All six states ✓ on reveal / motion / delta-visible / Rule 24+29. Highlights it verified in pixels
rather than on report:
- **S2 (PRIMARY aha)** — friction arrow gone at rest, bar holding −90.0 J, d = 4.59 m matching the
  arithmetic to 3 s.f. The vanish-over-a-held-bar pairing is the state's whole content and it holds.
- **S4** — the four-bar sum checked at TWO independent timestamps (pin 44.9 − 29.4 + 0 = 15.5 ≈ 15.6;
  t=20000 107.5 − 70.2 = 37.3 exact).
- **S5** — bar at −66.1 J, well clear of zero: the Checkpoint-A blocker did NOT recur.
- **Rule 32e single-focal pixel audit** across four different focal configurations (including S4's
  deliberate none) — dimming behaves correctly in every one.
- Informational: S1's frozen pin lands ~15 ms past the continuum-ideal instant (d 2.96 vs 2.88 m,
  W 59.1 vs 57.6 J) — discrete-stepping artifact, self-consistent, not a contradiction.

## THE CALCULATOR (advisory, $0)
6 assertions · 6 passed · 0 failed · 71 skipped. The skips are the value-only HUD by design
(Rule 34b) — but **one skip was a real defect in disguise** and is finding F-B below. *A skip is
not a pass.*

## quality-auditor — FAIL, 2 findings, both APPLIED

### F-A `[alex:physics_author]` — S1 asserted a false force inventory
`s1_2` read *"The pull is the only force acting, and the crate speeds up."* The crate rests on a
floor: `frictionless` zeroes μ, not the contact, so weight (49 N) and the normal force (49 N) both
act and cancel. The concept **contradicts itself two clicks later** — S3 teaches "the normal force
pushes up the whole way" on the identical crate and floor, and S4 at t=0 draws three arrows
including `normal`. On a concept whose whole method is per-force work accounting, that plants the
wrong prior in state 1 of 6.
**Applied:** → *"The pull is the only **horizontal** force acting, and the crate speeds up."*
(Not a re-litigation of Checkpoint-A F3, which adjudicated the *speed correlation* — that ruling
landed correctly and the `f-4` boundary sweep is clean at 0 hits.)

### F-B `[alex:physics_author]` `[reason: dod]` — S3 instrumented the wrong force
Skeleton DoD (b) row 9 is a Gate-0 line with no TBD: *"N arrow up, HUD `N = 49.0 N` (S3, live under
the m slider)"*. `physics_block.md` §1 overrode it with *"Do NOT add `'N'` — internal-only"*, and
that claim is **wrong**: `'N'` is a fully wired token (`field_3d_renderer.ts:1336` type,
`:40095` label/unit, `:45250` written every frame).

Pixel consequence in `STATE_3__frozen.png` (run 1): the HUD read **`m = 5 kg / F = 0.00 N`** — on a
state with **no applied force at all** — while the taught force carried a bare `N` label with no
value, and the narrated "coasts at three metres per second" had no instrument either. S3's entire
m-slider beat had no number to move. Rule 33d: an instrument shows a live numeric reading, never a
decorative pointer.

Found independently three ways: the dispatching session reading the frozen frame, THE CALCULATOR's
N3 skip (*"m drives N … but none of those symbols is painted in this state"*), and the auditor.
**Applied:** `STATE_3.readouts` `["F_applied"]` → `["N", "v"]`.

### Also applied (auditor Concerns 1 and 5)
- `STATE_5.readouts` → `["F_applied", "f", "v"]`. S5 narrates "comes to rest and stays there" with no
  `v`, and its declared arrow-flip beat (friction flips forward to a static 12.5 N at rest) had no
  number — the same Rule-33d class as F-B.
- Rule 41: `q4` option C *"because friction always **wins**"* → *"because friction is always larger
  than the pull"* (`wins` is on 41a's banned list). `q6` stem ASCII `mu_s` → `μₛ`.

## Re-verification after the fixes
`tsc` **0** · `validate:concepts` **150 PASS / 0 FAIL**, target with **zero WARN lines**, fleet
warning profile **byte-identical** (400/104 · 199/40 · 13/4 · 1/1) · re-seeded · THE EYE run 2
`20260802-060719` **27/27, 0 failed** · `STATE_3__frozen.png` re-read by eye: HUD now reads
`m = 5 kg / N = 49.00 N / v = 3.00 m/s`, the `F = 0.00 N` row is gone, bar still parked at 0.0 J
under `W = N·d·cos 90° = 0`.

## Open, NOT applied — for the taste gate to rule on

1. **S5's glow focal dims the object it is teaching.** `glow_focal: "angle_arc"` sends every other
   overlay to `GLOW_DIM_OPACITY = 0.4`, including the 25 N pull arrow the arc is measuring *from*.
   In `STATE_5__frozen.png` that arrow renders as a dark stub — only the arrowhead reads — while the
   arc and its `θ = 120°` label are bright. The arrow's LENGTH is correct (~63 px head offset,
   consistent with the shared arrow scale); dimming alone is the cause. An angle arc without a
   visible arrow measures nothing, and S4 already sets the precedent for the alternative (author no
   focal → `glowActive` stays false → nothing dims, pixel-verified by eye-walker).
   **Not applied unilaterally: this is a taste call, and the auditor looked at the same frame and
   passed it on 3f/3g.** The auditor raised the identical mechanism as its Concern 4 for S1
   (`displacement_vector` focal dims the applied arrow on a state whose lesson is "the force points
   along the motion") and called it defensible either way.
2. **S6's two named teaching discoverables reach nobody** (auditor Concern 2). They were authored as
   `scene_composition` annotations, but field_3d only paints those under `render_annotations: true`,
   which this concept does not set — confirmed by zero annotation text across all 169 EYE frames.
   Turning the flag on would paint all 18 annotations across all six states and move baselines, so
   the right fix is probably folding the two discoverables into S6's TTS or label.
   `[alex:json_author]`
3. **⚙ widget row for the work panel is labelled "Energy"** (auditor Concern 3). The panel's own
   header reads `Work done`, and this concept's `f-4` boundary bans "energy" from reader-facing
   strings — the ⚙ list is teacher-facing. **Inherited from concept #1, not introduced here**;
   auto-derived by the generic widget engine (Rule 39f/g). Worth an `engine_bug_queue` row +
   a `data-wg-label` fix. `[owner: peter_parker:field3d_surgeon]` — **not** `renderer_primitives`;
   this is a `field_3d_renderer.ts` root cause, the mis-tag this chapter has now made twice.
   Ride-along only, not routed.
