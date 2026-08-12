# Quality audit — `conservative_vs_nonconservative_forces` (concept #5) — 2026-08-07

## VERDICT: **FAIL** — route to ONE owner: **`peter_parker:field3d_surgeon`** `[reason: bug-class]`

Two rendering defects land on the two states the design was built around — the PRIMARY aha (S2) and
S3's one new thing. Both are invisible to every automated gate; that is *why* THE EYE said 23/23.

**Everything the authoring fleet controls is clean.** The physics is right, the numerals are right, the
pacing is right, and **the latched stamp does deliver its claim** — it was driven and watched firing.

---

## The concept's core claim is PROVEN, at 60 fps

`SET_TIME_FREEZE` does not re-integrate, so the auditor recorded the free-running sim with an in-page
rAF loop reading `#nlb_formula` every frame. 493 frames / 8.2 s on S1, 457 / 7.6 s on S2, ~60.1 fps.

**STATE_2 — 4 fires, one per cycle, exactly the asserted string:**
```
w 1155-1371 (216ms, 14f) "W(up) + W(down) < 0
                          at the flag (pass 2): W gravity = -4.9 J · W friction = -24.8 J
                          back at the start: W gravity = 0.0 J · W friction = -27.4 J"
w 2922-3138 (216ms,14f) · w 4688-4904 (216ms,14f) · w 6455-6670 (215ms,14f)
```
**All three CF-1 substitute conditions hold live:** fires exactly once per cycle (intervals S1
1917/1933/1917 ms, S2 1767/1766/1767 ms — never twice); holds ≥174 ms net (S1 200–217 ms, S2
215–216 ms = **13–14 consecutive frames**, clearing the 10-frame floor); re-arms every reset (full
wipe→re-arm sequence observed).

**CF-1's exemption is present and ADEQUATE** — named rule + scope (`skeleton.md:217`), impossibility
proof (`:84`), all three substitutes with arithmetic (DoD (d) `:155`/`:157`), and confirmation that the
0.55R clause still binds the four `'every'` flags (52.6 < 935 · 282.1 < 770 · 128.0 and 277.8 < 1155).

**Nine load-bearing numerals re-derived by hand — all correct**, including an independent energy-route
cross-check: `½·5·(2.2489²−16) = −27.36` against the force×distance `−12.7306 × 2.14874 = −27.355`.

---

## FINDINGS

### F1 · BLOCKING · S2's two checkpoint labels overprint into illegibility, at the PRIMARY aha instant
`"at the flag"` and `"back at the start"` draw at the same billboard height ~90% overlapped, rendering
as `back at the flag rt` — **both mutually unreadable** — with the block's `m = 5 kg` billboard drawn
through them. Visible in the H2 frozen frame too.

Cause: the checkpoints sit **0.2 m apart** (`s_m` −3.4 / −3.6). The label-dodge pass has budget for
S4's 0.6 m separation (which reads correctly) but not 0.2 m — checkpoint label sprites are evidently
not in each other's obstacle set.

**This is not an authoring fix.** The +0.2 m flag is load-bearing: its four DoD-asserted numerals
(−4.9 / −2.5 / −24.8 and the 52.6 ms crossing) all move if it moves.

### F2 · BLOCKING · S3's focal element renders DARKER than its own base colour
`NLB_ARROW_COLORS.friction = "#F06292"` (bright pink, L40423-25). S3 authors
`glow_focal: "nlb_arrow_block_friction"`, and that id **is correct** (`id = "nlb_arrow_" + bodyId + "_" + kind`,
L42273). Under Rule 29 the focal should lerp *toward white*.

It renders **dark maroon, near-black** against a mid-grey slope, while the *non-focal* `mg` arrow blazes
bright yellow `#FFD54F`. **The state's one new thing is the least legible object in the frame**, and its
`fₖ` label is a ~6 px dark glyph. eye-walker measured the same arrow at **1.04:1** against the canvas.

**Mechanism identified (dispatching session):** SEAM Q's `nlbInkPass` *deepens* ink drawn over the slab
and lifts it over the page — see the OPEN row `nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix`.
The deepening is applied **even when the arrow is the glow focal**, so emphasis is inverted. Distinct
from that row's first-frame-bypass manifestation, same family.

*The physics underneath is correct*: at `v = +1.21 m/s` the arrow points down-slope; at `v = −1.08 m/s`
up-slope. The flip is real. It is only unreadable.

### F3 · RIDE-ALONG · S2's formula surface renders 5 wrapped lines at the latch
Live `getBoundingClientRect()`: S1 `height 63.78` (2 lines) vs **S2 `159.45`** — 5 display lines. The
wrap breaks `W gravity =` from its value and orphans the `·` to the start of a line. Violates the
existing Gate-8 row's own "at most 2 lines" clause, which **no two-checkpoint two-accumulator state can
satisfy**.

### F4 · NON-BLOCKING · S3's `text_hi` is missing entirely — `alex:json_author` `[reason: dod]`
`STATE_1 4/4 · STATE_2 4/4 · STATE_3 **0/4** · STATE_4 4/4 · STATE_5 3/3`. The Hindi was authored
(`physics_block.md:559` carries a clean four-`।` paragraph for s3_1–s3_4) and was dropped in
transcription. Non-blocking under Rule 30i (Hindi is authored-but-never-voiced, `lang` pinned `'en'`),
but it is an unmet DoD line. **Fix on next touch; do not re-dispatch for it alone.**

### F5 · CONCERN (founder / Checkpoint-B taste, NOT a gate FAIL)
At the S1 latch the gravity bar reads **+11.7 J, green**, while the stamp beside it reads
`W gravity = 0.0 J` and the narration says *"total work by gravity, zero joules"*. This is the declared,
bounded loop tail (+24.1 J = 34% of scale, no overflow) and it is honest physics — but **a teacher will
be asked why two instruments disagree at the moment one is being read aloud.** CF-2's lever (S1 R→1950)
lengthens the dwell but makes the green *louder* (+37.1 J). Flagged with pixels so the call is made on
evidence.

### F6 · NOTE · engine stamp numerals use ASCII hyphen
Codepoint scan of the live S2 latch line: U+002D at offsets 54/76/136, while the authored base uses
U+2212. Rule 34c violation in `nlbEnFx`. Fleet-wide, declared as a ride-along in DoD (b) but never filed
— now filed.

---

## THE CALCULATOR — the residual is GENUINE, but "6 passed" is not what it looks like

`readings.json` encodes a skip as `passed: true` with `evidence` starting `"Skipped — "`. Decomposed:
```
total=119  skipped=113  real=6   real FAILED=0  real PASSED=6
PASS [N0_readings_present] STATE_1..5   (5 — "numbers are painted")
PASS [N2_constant_stable]  ALL_STATES   (1 — m=5 kg identical)
```
**Not one `N1_readout_matches_formula` executed. Zero relationships verified.**

**The declared residual is real** — S2's harvest paints the symbol `gravity` **three times with three
different values in one frame** (bar "now" vs stamp "at the last crossing"): `gravity=0`, `-4.9`,
`-19.5`. A symbol-keyed check genuinely cannot disambiguate. Not an excuse.

**But it is not what produced 113.** The dominant driver is self-inflicted: **13 documentation-only
constants** in `computed_outputs` (`S1_apex_W_gravity_J: "-40.0"`, …), each tested against all 5 states
and skipping every time — **65 of the 113 skips, guaranteed by construction.** Only 10 are the `d`/`s`
residual and 10 the `gravity_J`/`friction_J` residual.

---

## Gate table (abridged — full detail in the agent transcript)

All gates PASS except **Gate 4** (visual walk → F1/F2/F3) and **Gate 8** (the "at most 2 lines" clause).

- **Gate 2**: PASS, **zero warnings of any kind** on the target, against a fleet where 104 files carry
  word-budget warnings.
- **Gate 3f** Rule 32: word budget **54 / 55 / 51 / 54 / 34**, all inside 25–55.
- **Gate 3h** Rule 38: rings core/core/core/**extended**/core, sole extended state contiguous before
  explore; both cuts coherent; 38b explore surface core-only.
- **Gate 8**, 7 OPEN rows disposed: the CRITICAL unwind row is **vacuously N/A** (zero `applied_force`
  in the file, grep 0); `angle_arc` row vacuous (zero `angle_arc`); the zero-crossing row's **DO clause
  IS the adopted design** and was verified live; CF-1 exemption honoured.
- **Rule 41**: 69 rendered strings swept, **0 hits** on the banned register.
- **Rule 35**: anchors "a heavy bag lifted onto a shelf", "sliding a box across the floor to a door" —
  universal.

## THE EYE's 23/23 — 6 of 23 are skips counted as passes
`D5` × 5 (*motion expectation unknown*) + `H2` × 1 (*no approved baseline*). The 17 real checks are
coarse frame-delta and text-leak checks. **Not one looks at label legibility, arrow contrast, formula
wrapping, or numeric correctness — precisely where all three findings live.**
`diagnostic_warnings: []` is real and meaningful, re-confirmed live: zero console errors, zero
`[PM_NLB_ENERGY_CLAMP]`, zero `NLB_ENERGY_SCALE_WARN` across 4 states × ~7 s.
