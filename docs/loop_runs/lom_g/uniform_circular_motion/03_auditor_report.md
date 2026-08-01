# QUALITY AUDITOR REPORT — `uniform_circular_motion`

**date:** 2026-08-01 · **worktree:** `C:\Tutor\physics-mind-lom-g` (`feat/lom-g-offaxis`)
**artifact:** `src/data/concepts/uniform_circular_motion.json` — 7 states, field_3d / `force_rig` / `apparatus: "whirl"`
**surfaces used:** THE EYE dump `.visual_runs\uniform_circular_motion\20260801-022955\` (162 files, frames read directly) · live review site `http://localhost:8093/uniform_circular_motion/` (HTTP 200) · the built `sim.html` · the `engine_bug_queue` headless reader.
**not used:** dev server on :3000 (unavailable in this worktree, per orchestrator) · `smoke:visual-validator` (paid, not run) · no DB write of any kind.

---

## VERDICT — **FAIL**

Two ACTIVE hard gates fail. Both are one-key / one-number fixes on an otherwise unusually
strong concept: the physics is exact, the PRIMARY AHA is the cleanest cut-the-string beat
this fleet has shipped, and the load-bearing claim survives every probe I could construct.

**Route to: `alex:architect` — `[reason: pass-1]`** (dual-failure rule: upstream wins; the
Pass-2 finding is re-audited only after the Pass-1 fix lands).

| # | Finding | Sev | Gate | Owner tag | Route |
|---|---|---|---|---|---|
| **F1** | STATE_7 formula surface asserts a relation no state derives, and contradicts its own on-screen readouts | **MEDIUM — FAIL** | 3h.1 / Rule 38b | `alex:architect` | **alex:architect** `[reason: pass-1]` |
| **F2** | STATE_6 is a byte-identical frozen frame for 12 of its 20 s; narration outruns motion by ~10 s | **MEDIUM — FAIL** | 3e / 3f / Rule 31 | `alex:physics_author` | alex:physics_author `[reason: pass-2]`, after F1 |
| **F3** | STATE_1 narration names "the balanced ring", an apparatus not on screen; "zero sum" reads as the idiom | LOW | 11 / Rules 25, 41a | `alex:physics_author` | fold into the F2 pass |
| **F4** | "Gravity joins the picture" and label "Gravity joins:" — personification plus metaphor | LOW | Rule 41a | `alex:physics_author` | fold into the F2 pass |
| **F5** | `release` widens the ground plane per-state, so the apparatus visibly jumps ~2.2x entering STATE_3 | LOW | 3f#6 / Rule 32d | `peter_parker:field3d_surgeon` | non-blocking, log only |
| **F6** | two OPEN queue rows with a `field_3d_renderer.ts` root cause are tagged `renderer_primitives` (= pcpl-surgeon, would reject scope) | LOW | 8 (process) | `peter_parker:field3d_surgeon` | retag SQL supplied |

bug_class strings for F1–F5 are in
`docs/loop_runs/lom_g/uniform_circular_motion/scar_candidates.sql`
(4 INSERT + 2 UPDATE, **SQL TEXT ONLY — no database write was performed**).

---

## THE THREE CLAIMS I WAS ASKED TO SETTLE

### 1. "No outward force exists anywhere, at any time, in any state" — **CLAIM SURVIVES**

This is the strongest result in the audit, and I established it from evidence rather than
from the assertion the physics block cites. Note first that the "harness S8" proof quoted
in the physics block (§1 constraints, §8, §13) is backed by a **source grep** that is
itself the subject of an OPEN queue row —
`harness_source_grep_comment_strip_defeated_by_crlf_line_endings` — whose whole point is
that on a CRLF working tree the comment strip silently strips nothing. That proof is
therefore weaker than quoted. I re-established the claim two ways that do not depend on it.

**(a) Every rendered string, exhaustively.** Machine scan over all 7 states of `title`,
`delta_cue`, `label`, `caption`, `formula_overlay`, arrow `labels`, every annotation
`text`, and every `tts_sentences[].text_en`, for
`/centrifugal|outward|flung|fly (out|away)|thrown out|pushes out|away from the cent/i`:

```
HIT STATE_3.anno.counter_note :: after the cut: v still 1.80 m/s, T = 0 N - straight trail, no outward push
HIT STATE_3.tts.s3_4         :: No force pushes the ball outward, because none exists.
HIT STATE_3.label            :: Cut the string: the ball departs straight, tangent, at unchanged speed - no outward force exists
```

Three hits, **all negations**. Zero occurrences of `centrifugal` anywhere in the file. The
only affirmative "flung outward" in the artifact is inside
`STATE_3.misconception_watch[0].belief` — the belief being confronted, exactly where Rule
16a requires it, and unrendered metadata.

**(b) Every arrow, across both geometries and many azimuths.** I read frames covering flat
and conical, both ends of every ramp, pre- and post-cut, and bob azimuths right round the
revolution. In every frame the drawn set is exactly: `T` from the bob **toward the
anchor**; `W` straight **down**; `v` **tangent**; `ΣF` **horizontal, toward the axis**. No
arrow with a positive outward radial component appears in any frame I read.
Config-level confirmation: `centripetal` is authored **nowhere**; `resultant` appears only
on STATE_4 (conical) and never on a `flat` state.

### 2. STATE_3, the PRIMARY AHA cut — **CLEAN, all sub-claims verified**

Evidence: `STATE_3__dense_t19000.png` (pre-cut) → `t20000` → `t21000` (the frozen instant).

| sub-claim | evidence |
|---|---|
| departs along the TANGENT, not the radius | `t21000`: the straight trail leaves the ghost circle near its upper-left and runs to the **upper-right**. A radial departure from the ring centre through that point would continue upper-**left**. Unambiguously not radial. |
| dead straight | `t21000`: one unbroken straight segment, no curvature. It is the integrator output (the constraint is deleted), not a scripted path. |
| speed unchanged | HUD `v = 1.80 m/s` at `t19000` (pre-cut), and `v = 1.80 m/s` at both `t20000` and `t21000`. Identical to 2 dp. |
| `T` drops to 0 | HUD `T = 12.96 N` at `t19000` → `T = 0.00 N` at `t20000` and `t21000`. |
| ghost circle still visible, so the departure is legibly NOT the abandoned circle | the cyan ellipse is present and dim in `t20000` and `t21000`, with the bright straight trail crossing away from it. Contrast reads correctly. |
| bob stays ON the plane and IN frame for the whole flight | at `t21000` the bob sits at roughly (740, 255) in the 1280x720 frame, with the widened plane extending past both frame edges. Comfortably contained. |

**Authored flight window vs the measured boundary.** The physics block measured the plane
edge crossing at **t ≈ 1.52 s** post-cut and bound the author to ≤ 1.5 s. Authored:
`release.at_ms = 19600`, `duration = 21000` → flight window **1400 ms**, inside the
boundary with 6.9% margin. Reveal pin `at_ms + 1200 = 20800 ≤ 21000` holds, 200 ms spare.
**Compliant.**

### 3. Rule 38 i-1, the conical explore under the `core_only` cut — **RULING**

The architect asked for an explicit ruling and offered a one-key fallback
(`geometry: "flat"` on STATE_7). My ruling has two halves, and the half that fails is
**not** the half the architect flagged.

**(a) The conical PICTURE under `core_only` (S1, S2, S3, S7): ACCEPTED — do NOT take the
flat fallback.** The architect's defence holds. A whirled ball riding below the hand is
this concept's own anchor; the tilt is self-evident rather than untaught; the `W` arrow is
the single most intuitive force a Class-11 student owns; and `theta` was correctly dropped
from the readouts so no untaught symbol reaches the screen. Taking the flat fallback would
cost the **founder-named clamp-at-the-slider beat**, which is the explore state's only
genuinely distinct behavior — a bad trade for a picture that reads fine.

**(b) The explore state's FORMULA SURFACE: FAILS.** That is F1 below. Its fix is a
different one key, and it **preserves** the conical geometry and the clamp beat.

---

## F1 (FAIL) — STATE_7's formula surface asserts a relation no state derives

`field_3d_config.states.STATE_7.formula_overlay = "T = m ω² L"`.

The only other T-form the concept ever puts on screen is
`STATE_2.formula_overlay = "T = m ω² r"`. Both are correct physics — `T = mω²L` is exact
on the cone, `T = mω²r` is exact on the flat plane where `r = L` — but **no state states,
shows or narrates the bridge**, and on STATE_7 the two forms are visibly inconsistent with
that state's own instruments.

Evidence, `STATE_7__dense_t05000.png`, one frame, three surfaces:

```
formula surface (left):    T = m ω² L
HUD (top right):           T = 24.00 N · v = 3.16 m/s · ω = 4.00 rad/s · r = 0.790 m
slider panel (bottom rt):  ω = 4.0 rad/s · L = 1.00 m · m = 1.5 kg
```

A student carrying STATE_2's form forward computes `T = m ω² r = 1.5 × 16 × 0.790 =
18.96 N` and reads `T = 24.00 N` on the HUD. The correct value is
`m ω² L = 1.5 × 16 × 1.00 = 24.00 N`. **The screen shows `r` and `L` simultaneously with
`r ≠ L`, and offers no reason why the formula uses one and the readout the other.**

- In the **FULL** lesson the relation is *derivable* (S4's `T cos θ = mg` divided by S5's
  `cos θ = g/(ω²L)`) but is **stated nowhere**. The physics block itself flagged this
  option — "physics-author may use it in S5's narration" — and S5's narration does not.
- Under **`core_only`** (S1, S2, S3, S7) both bridging states are hidden, so the relation
  is not derivable at all. This is the Rule 38b failure, and it is precisely the class the
  `capacitance` proof-run established, where the explore state surfaced `ε₀A/d` whose
  symbols were introduced only in a hide-able state. Here the **symbols** are all
  core-established — which is why the skeleton's §12 i-2 self-check passed — while the
  **relation** is new. That is the gap in the self-check, and it is worth carrying forward.

**Cheapest correct fix — one key, preserves the conical geometry and the clamp beat:**
delete `STATE_7.formula_overlay`. A value-only sandbox is Rule-34-clean and is already
precedented inside this very concept (S1 and S3 ship formula-free by declared design).
**Alternative:** keep the formula and add a derivation clause to S5's narration — but that
pushes S5 from 50 words toward the 55 ceiling and still leaves `core_only` uncovered, so
deletion is the better trade.

**Owner.** The claim originates in the architect skeleton §9 STATE_7 sketch
(`// CORE ring only (Rule 38b) — established in STATE_2 (r = L); exact on the cone too`)
and is repeated in §12 i-2 ("formula `T = m ω² L`, readouts `T v ω r`, all
core-established ✓"). The physics block and json-author both faithfully transcribed a
design claim that is false. **Route: `alex:architect` `[reason: pass-1]`.**

---

## F2 (FAIL) — STATE_6 is frozen for 12 of its 20 seconds

**This is the finding D5's darkness exists to hide, and it is why the 31/31 means nothing
about motion.** I hashed every dense frame in the dump. Six states are distinct
frame-to-frame throughout. STATE_6 is not:

```
STATE_6__dense_t00000 .. t07000   8 distinct hashes   (the cone closes, 61.1° -> 0°)
STATE_6__dense_t08000 .. t20000   bf6e49e5059d8d4d3f76878cb544590d  x13  IDENTICAL
```

For contrast, every other state: STATE_1 16/16 distinct · STATE_2 20/20 · STATE_3 22/22 ·
STATE_4 23/23 · STATE_5 22/22 · STATE_7 11/11. **STATE_6 alone: 8 distinct out of 21.**

The frozen picture is *physically correct* — the frames show the design working exactly as
the physics block measured it:

| frame | reads |
|---|---|
| `t00000` | `θ = 61.1°`, `ω = 4.50 rad/s`, guide ring wide, bob sweeping |
| `t05000` | `θ = 41.0°`, `ω = 3.60 rad/s`, ring narrower, cone visibly closing |
| `t08000` | `θ = 0.0°`, `ω = 3.13 rad/s`, **amber `ω min = 3.13 rad/s` row present**, guide ring gone, bob hanging, slider handle snapped to 3.1 |

Below `ω_min` the bob is on the axis at `r = 0`, so there is genuinely nothing left to
move. The physics is honest. **The pacing is not.**

- authored `duration`: **20 000 ms**
- last frame-to-frame change: **~8 000 ms** (40% of the state)
- narration: 46 words ≈ **18 400 ms** at the block's own 2.5 words/s
- therefore **≈10.4 s of narration plays over a byte-identical still**, and the final
  12 s of the state — **60%** — is motionless.

Rule 31 states the constraint in exactly this direction: *"motion may outrun narration,
never the reverse."* Here narration outruns motion by ten seconds. The architect's own
control table budgeted STATE_6 at **13 s / 30–42 words**; the physics block raised it to
20 s / 46 words to fit a longer script, and that is where the dead tail came from.

**Fix:** trim STATE_6 back toward the architect's budget — duration ~13–14 s, narration
~32–36 words — so the state ends a beat after the hang is established. Do **not** change
the ramp: the architect's Finding-2 fallback (`to: 3.2`, no clamp entry) would keep motion
alive but throw away the amber-clamp payoff, which is this state's whole reason to exist
and which the frames prove works perfectly. **Route: `alex:physics_author`
`[reason: pass-2]`** — but only after F1 lands (dual-failure rule).

**Generalised as a scar.** The reusable lesson is not about this state, it is that THE EYE
already writes the pixels that answer the motion question and never compares two of them.
Candidate A in the SQL file proposes hashing the dense frames as a $0, renderer-agnostic
stand-in for D5 — three numbers per state (distinct-hash count, last-change timestamp,
that timestamp as a fraction of duration). It would have caught this in the same run that
reported 31/31, and it would have caught last session's seven dead states.

---

## F3 / F4 (LOW) — two plain-language findings, Rules 25 and 41a

**F3 — STATE_1 `s1_2`:**
> "The string pulls the ball toward the centre continuously — a nonzero force, unlike the balanced ring's zero sum."

Two problems. (i) **"the balanced ring"** is the force_table fixture of the sibling
concept `equilibrium_of_particles`. No ring exists anywhere in this concept —
`STATE_1__dense_t05000.png` shows an anchor, a string, a bob, a flat plane and an orbit
circle. Prerequisites are advisory (Rule 23), so a student may reach STATE_1 never having
seen it, and then the sentence names an object with no referent. (ii) **"zero sum"** reads
as the everyday idiom (zero-sum) rather than the physics (the forces sum to zero) —
Rule 41a. The architect's skeleton §7 phrased the same prerequisite patch as *"last time
ΣF was zero and the ring stayed put"* — the explicit time-marker is what makes it work as
recall; the compression to one clause dropped it. Suggested: *"...a nonzero force. When
the forces balanced, their sum was zero; here it is not."*

**F4 — personification, Rule 41a.** `STATE_4 s4_1`: "Now **gravity joins the picture**:
the string tilts..." and the on-canvas `STATE_4.label`: "**Gravity joins:** one tension has
two components...". Forces do not join, and "the picture" is a metaphor for the scene.
This is the exact register Rule 41a was written against after the friction/normal review.
Suggested: "Now gravity acts on the ball: the string tilts..." / label "With gravity, one
tension has two components...". Lower-grade, same family: `s5_1` "it is solved by the
physics" mildly personifies "the physics".

**Everything else in the plain-language sweep is clean.** "circles", "splits", "opens",
"hangs", "shrinks", "climbs", "swings up", "stops short of horizontal" are the literal
physical words. All 7 rail titles are short, literal and first-words-carrying (Rule 41d),
verified on the live page:

```
"The String Pulls Inward" / "Faster Spin, Larger Pull" / "Cut the String" /
"Tension's Two Components" / "Spin Faster, the Cone Opens" /
"Below Minimum Spin, No Cone" / "Explore: Spin, Length, Mass"
```

## F5 (LOW, engine, non-blocking) — the plane jumps size entering STATE_3

`STATE_2__frozen.png`: the ground plane is a contained ellipse spanning x ≈ 335..945.
`STATE_3__dense_t00000.png`: the plane overflows **both** frame edges. Cause is the
engine's build call 7 — plane radius `L × 1.30` normally, `L × 2.80` when a `release` is
authored — applied **per state**, so a concept whose release lives in one state renders two
apparatus scales across otherwise identical flat states. The widening is necessary (the
flight needs the room) and the author cannot avoid it: the plane radius is not an
authorable key. Anchor, string, bob and orbit circle are pixel-stable across the
transition, so this is cosmetic-continuity against Rule 32d, not pedagogical.
**Not blocking. `[owner: peter_parker:field3d_surgeon]`** — the fix is to compute the
dimension once per concept (max over states) rather than per state, which is the same
family as the OPEN `camera target is not authorable` row.

## F6 (LOW, process) — two OPEN queue rows are mis-tagged

Gate 8 returned three OPEN rows for this concept. Two have a `field_3d_renderer.ts` root
cause but carry `owner_cluster = peter_parker:renderer_primitives`, which maps to
**pcpl-surgeon** (parametric_renderer / PCPL primitives / particle_field) and would reject
field_3d scope — a wasted dispatch cycle, and the same mis-tag the orchestrator flagged
from last session. Retag statements are supplied as candidate E in the SQL file. The third
row (harness CRLF comment strip) is a tooling defect, not a renderer defect; its correct
owner is genuinely ambiguous and I left it for the founder.

---

## GATE TABLE (0–20)

| Gate | Verdict | Machine evidence |
|---|---|---|
| **0** DoD | ✓ | Skeleton §12 has no TBDs. All 7 state ids + rail titles match the JSON exactly (verified against the live page). Symbol table satisfied: `T` (arrow label + HUD), `W` (arrow, conical states), `ΣF` (`arrows[0].labels.resultant`, STATE_4 only), `v` (arrow + HUD), `ω`/`L` (HUD + slider rows), `θ` (HUD, **conical only** — `readouts` on S1/S2/S3 contain no `theta`), `r` (HUD S5/S7), `g` (formula surfaces only). RHR N/A as declared. Modes conceptual-only. `assessment` + `coverage_map` + 2 `misconception_watch` present as declared. Motion plan satisfied except F2. |
| **1** tsc | ✓ | 0 errors (orchestrator; no contradiction observed). |
| **2** validator | ✓ | 148 PASS / 0 FAIL, target passes with zero bounds warnings (orchestrator; no contradiction observed). |
| **3a** §6 rules | ✓ | Rule 15: `manual_click` x6 + `interaction_complete` x1 = 2 distinct. Rule 19: `scene_composition.length = 3` on all 7. Rule 23: `prerequisites` is a plain advisory array of 5. |
| **3b** mechanical half | ✓ | Spatial contiguity: `check-layout-overlap.mjs` → **0 collisions across 7 states**. Segmenting: max `scene_composition.length` = 3, far under 12. |
| **3c** Socratic | **N/A** | No state carries `teaching_method: "narrative_socratic"`. Gate does not fire (Rule 31 era). |
| **3d** E42 9-cond | ✓ | (1)(2)(4) engine-solved, not authored — the whirl integrates internally. (3) no `angle_arc` primitive exists on this engine; θ is a live HUD readout. (5) ≥3 primitives. (6) `epic_c_branches` absent, correctly optional. (7) **no cycle introduced by this concept** — it is the graph root, appears once, nothing points back to it. Ambient note, NOT a finding: the shipped Newton's-laws atomics already contain cycles among themselves (`newton_first_law → normal_reaction → newton_third_law → newton_first_law`). Pre-existing fleet debt, advisory-only per Rule 23, unrelated to this candidate. (8) only `annotation` primitives used, in the built list. (9) `mode_overrides` absent — correct under Rule 20 [D]. |
| **3e** Rule 31 | **✗ (F2)** | Control table honored exactly: `controls_visible` = `[]` x4, `["omega"]` x3 (S2/S5/S6), all three on S7. `phases[]` authored **nowhere** — the tray's named glow-only-delta trap avoided by construction. No `wait_for_answer`, no `pause_after_ms`, no `narrative_socratic`. Six of seven states carry real engine-produced motion, frame-verified. **STATE_6 stops moving at ~8 s of a 20 s state — F2.** |
| **3f** Rule 32 | ✓ (F4 low) | Word budget 38/45/51/54/50/46/19 — every guided state inside 25–55. All 7 `delta_cue`s ≤5 words; `caption === delta_cue` on all 7. Exactly one `glow_focal` per state, all from the whirl id list. Camera `[0, 3.4, 9.2]` identical on all 7. One ramped parameter or none per state. Cause-before-effect carried by the slow 8–9 s ramps. |
| **3g** Rules 33/34 | ✓ | 33a–c declared N/A (single macroscopic level), correctly. 33d: live numeric readouts track the change everywhere (S5 `T` 19.92 → 57.66 N as `θ` 42.4° → 75.2°). 34a: top caption is the delta cue only. 34b: exactly one `formula_overlay` per state, value-only HUD. 34c: **zero ASCII-math leaks** across all three text paths; the non-ASCII inventory is `ω θ ° Σ ² √ ≥ → —` only — **no subscript-Greek trap of the sibling's `ᵧ` class**. 34d: `fr_readout` is `top:52px` by construction (`field_3d_renderer.ts:45005`, comment cites Rule 34d), clearing the Full-screen button; `#fr_formula` is a separate zone and the generic `#formula_overlay` is suppressed. |
| **3h** Rules 38/39g | **✗ (F1)** | 38a: every state tagged; advanced ring = S6 alone, contiguous immediately before explore. `hide_advanced` cut **coherent** — S5 never names ω_min or √(g/L) (regex scan: NO). `core_only`: S1–S3 never reference cone/gravity/θ/weight (regex scan: NO on all three), **but 38b fails on STATE_7's formula surface — F1**. 38g: `web_search_verified: false`; only the CBSE/NCERT row is `verified: true`, the other three carry `needs_teacher_verification: true`. 39g: `fr_omega_row` / `fr_L_row` / `fr_bob_mass_row` follow the `<prefix>_<name>_row` discovery convention and the generic widget engine is present in the built sim (13 `WIDGET_DECLARE`/`pmWgHide`/`SET_WIDGET_VIS` hits) — ⚙ inherited free, nothing to author. |
| **4** visual walk | ✓ | THE EYE + review site, per renderer-family scoping. All 7 states looked at directly; 31 frames read this session covering both geometries, both ends of every ramp, and the cut. Review site `HTTP 200`. |
| **4a/4b** classifier/pill | **N/A** | Legacy retired chat stack. |
| **5** deep-dive | **N/A** | Deferred (Rule 18 [D]). |
| **6** drill-down | **N/A** | Deferred (Rule 22 [D]). The `confusion_cluster_registry` probe is N/A-DORMANT for a new conceptual-only concept — a missing registry row is NOT a failure here. |
| **7** console/logs | ✓ | No browser console without a dev server. Best available evidence: EYE `manifest.json` → `"warnings": []`, all 7 states `"timed_out": false`, `panel_a_state_reached_ms` 16.9–89.9. Limitation stated rather than claimed away. |
| **8** bug queue | ✓ (F6 process) | Detail below. |
| **9** layout overlap | ✓ | `node src/scripts/check-layout-overlap.mjs` → `✓ 0 collision(s) across 7 state(s).` |
| **10** expression resolution | ✓ | Zero `{...}` templates anywhere in the file — nothing can leak. |
| **11** plain-English | ✓ (F3/F4 low) | Zero Hinglish tokens. Zero country/culture tokens (Rule 35 scan over the whole file: NONE). Two low-grade register findings, F3 and F4. |
| **12** visual continuity | ✓ (F5 low) | Same apparatus, same camera, home pose preserved across all 7. One declared, narrated apparatus change (S3→S4). One engine-forced side effect — F5. |
| **13** animation vocabulary | ✓ | No `animation`, `animate_in`, `reveal_at_tts_id`, `reveal_at_ms` or `phases` keys anywhere. Motion is entirely engine-driven (`param_ramp` / `release` / constrained orbit) — nothing can silently no-op. |
| **14** Pass-1 | ✓ | 14a cliffs present for all 5 prerequisites with per-state break points. 14b **DORMANT**. 14c misconception-entry mapping present including two named planting risks. 14d exactly 1 PRIMARY (S3) + 1 SUPPORTING (S4), cohesion argued, wrong-belief setup states named. 14e PRIMARY aha is inside `entry_state_map.foundational` (S1→S3) — satisfied, no exit-pill needed. |
| **15** Pass-2 | ✓ (F2 adjacent) | Walked all 7, not a sample. 15a–15d pass on every state. 15e: every state establishes its apparatus at t=0 (frame-verified) — no bare-object orientation window anywhere. |
| **16–20** comprehension | ✓ | `assessment` present so these fire. Machine halves all pass: 6 unique q_ids; every `teaches_state` real; 6 distinct `tested_idea`; aha state covered by Q3; zero orphan states (`non_assessed_states: ["STATE_7"]`); zero uncovered questions; every wrong option carries a `distractor_misconception` with no correct option keyed; `parallel_form_stem` on all 6. Judgment half: every distractor encodes a real documented belief (Q1-B constant-speed-implies-zero-force, Q3-B outward-along-the-radius, Q4-C the inverted `T = mg cos θ`, Q6-B a surviving tiny cone); every keyed answer is correct and unambiguous; `mastery_definition` is honest. Gate 17 (one new variable per state) and Gate 18 (concrete first — S1 is a concrete moving picture with no formula surface, by declared design) both hold. |
| **anti-plagiarism** | ✓ | Run over ALL `text_en` plus every other rendered string, not spot-checked. No DC Pandey / HC Verma / NCERT phrasing, no textbook problem setups, no figure references. Anchors (a ball on a string, a spin dryer, a turning car) are universal — Rule 35 clean, and correctly NOT the catalog's pre-Rule-35 Indian-context anchors. |

---

## GATE 8 DETAIL — engine_bug_queue regression check

`npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts uniform_circular_motion --field3d --open`
→ **3 OPEN rows**, each re-checked against the candidate:

| row | verdict on this candidate |
|---|---|
| `explicit_linear_drag_is_unstable_at_the_damping_a_legible_settle_requires` (DIRECTIVE) | **No recurrence.** This is the force_table damped-settle path. The whirl branch integrates with velocity-Verlet + SHAKE and has no damped settle; the concept authors no `force_table` state. Rule 36 fold-exactness is exercised by the frozen-pin captures, which produced stable frames on all 7 states. |
| `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` (MAJOR, names this concept) | **No recurrence.** The failure mode is "renders entirely in the top half of the frame". Frame-measured: conical states span y ≈ 195–545 of 720 (mid-frame); flat states span y ≈ 300–550, horizontally dead-centred. The rig self-centres as the contract claims. **Advisory:** framing is loose — the apparatus subtends ~28% of frame width — because the architect deliberately declined the contract's closer conical camera to hold Rule 32d home-pose continuity absolute. That is a defensible, disclosed design call, not this row recurring. |
| `harness_source_grep_comment_strip_defeated_by_crlf_line_endings` (MODERATE, names this concept) | **Live, and it undercuts a cited proof.** The physics block leans on "harness S8: zero centrifugal terms in the renderer source" in four places. That assertion is a source grep of exactly the kind this row says silently strips nothing on a CRLF tree. I therefore did **not** accept it, and re-established the no-outward-force claim independently from rendered strings and from frames (see Claim 1). The claim holds; the cited proof does not carry it. |

**Scar candidate 1** (`field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line`) does not appear in the OPEN set for this concept but was FLAGGED to me by both the architect and physics-author as a whirl-branch recurrence risk, since the tension arrow lies along its own string in every state. **Re-verified on the WHIRL branch, and it does NOT recur.** At every geometry and magnitude I sampled — flat at T = 13.5 N (`STATE_1__dense_t05000`), flat at T = 54.0 N (`STATE_2__dense_t10000`), conical at T = 24.0 N (`STATE_4__frozen`), conical near the cap at T = 57.66 N and θ = 75.2° (`STATE_5__dense_t11000`), and hanging at θ = 0° (`STATE_6__dense_t08000`) — the tension arrow renders as a solid olive/yellow mesh shaft with a clear arrowhead, visibly thicker and differently coloured from the thin grey `fr_wstring`. The `7c6bbb3` mesh-shaft fix holds on branch B. Tip position is proportional to magnitude in-plane; apparent shortening at some azimuths is ordinary perspective foreshortening, not a scaling failure (confirmed by comparing the same magnitude at two azimuths).

---

## MOTION AUDIT — the D5 substitute (all 7 states, hashed)

D5 is dark fleet-wide, so 31/31 certifies nothing about motion. I hashed every dense frame.

| state | frames | distinct | last change | duration | verdict |
|---|---|---|---|---|---|
| STATE_1 | 16 | **16** | 15 000 ms | 15 s | ✓ continuous orbit |
| STATE_2 | 20 | **20** | 19 000 ms | 19 s | ✓ ramp + continued orbit |
| STATE_3 | 22 | **22** | 21 000 ms | 21 s | ✓ orbit → cut → flight |
| STATE_4 | 23 | **23** | 22 000 ms | 22 s | ✓ continuous conical orbit |
| STATE_5 | 22 | **22** | 21 000 ms | 21 s | ✓ cone opens + continued orbit |
| STATE_6 | 21 | **8** | **8 000 ms** | 20 s | **✗ frozen for the last 12 s — F2** |
| STATE_7 | 11 | **11** | 10 299 ms | open | ✓ never freezes (Rule 37) |

Six states are distinct frame-to-frame end to end — this concept is genuinely alive, and
it is not the sibling's seven-dead-states case. One state has a 60% frozen tail.

## PER-STATE Gate 15 NOTES (15a–15d, all seven walked)

- **S1** `orbit-steady` — 15a "constant speed is not constant velocity" named in physics terms. 15b the curiosity beat is the instrument-vs-picture tension: the `v` arrow visibly turns while the HUD holds `v = 3.00 m/s`. 15c continuous constrained revolution. 15d `glow_focal: fr_w_velocity` — the physics-bearing element, not a title.
- **S2** `spin-ramp-lengthen` — the arrow growth is dramatic and unmistakable: `T` 13.50 N (tiny, `t01000`) → 54.00 N (dominant, `t10000`), circle unchanged, slider tracking. 15d `fr_w_tension`.
- **S3** `release-tangent` — all four verified in Claim 2. 15d `fr_bob`, with the trail dim-exempt so it stays evidence-bright.
- **S4** `orbit-steady` (declared contrast pair with S1) — 15d `fr_w_resultant`, the SUPPORTING aha object. **Advisory:** the `ΣF` arrow reads perfectly when the bob is at a screen-lateral azimuth (`STATE_4__frozen.png` shows a clean white horizontal inward arrow labelled `ΣF`) but foreshortens to a nub when the bob is near or far (`t13000`, `t14000`). Inherent 3D projection over a 14-revolution state, not an authoring defect, and the frozen frame — the one a teacher pauses on — is the clean one. Not a finding.
- **S5** `cone-opening` — θ 42.4° → 75.2°, `T` 19.92 → 57.66 N, ring widening, string visibly stopping short of horizontal. Hook 2 lands in the picture, not just the words.
- **S6** `cone-collapse` (declared reversal pair with S5) — 15d `fr_guide_ring` is a genuinely clever focal: the taught object is the ring's *disappearance*. Physics exact (61.1° → 41.0° → 0.0°, ring gone, amber `ω min = 3.13 rad/s` row up, handle snapped to 3.1). F2 is a pacing defect layered on a correct beat.
- **S7** `drag-sandbox` — all three sliders live, `theta` correctly dropped from readouts, never freezes.
- **15e** every state establishes its apparatus at t = 0; no state opens on a bare object waiting for a delayed reveal.

---

## CONTRACT COMPLIANCE — every silent-violation rule, checked mechanically

The as-built contract's violations are silent, not errors, so I checked each by extraction
rather than by reading the author's own compliance table:

```
STATE_1 geom=flat    arrows=["tension"]                       readouts=["T","v"]                 glow=fr_w_velocity   ramp=none                        ctrl=[]
STATE_2 geom=flat    arrows=["tension"]                       readouts=["T","omega","v"]         glow=fr_w_tension    ramp=omega 3->6   [1200,9200]    ctrl=["omega"]
STATE_3 geom=flat    arrows=["tension"]                       readouts=["T","v"]                 glow=fr_bob          release@19600 trail+ghost        ctrl=[]
STATE_4 geom=conical arrows=["tension","weight","resultant"]  readouts=["T","theta"]             glow=fr_w_resultant  ramp=none                        ctrl=[]
STATE_5 geom=conical arrows=["tension","weight"]              readouts=["T","theta","omega","r"] glow=fr_wstring      ramp=omega 3.4->6.2 [1200,10200] ctrl=["omega"]
STATE_6 geom=conical arrows=["tension","weight"]              readouts=["theta","omega"]         glow=fr_guide_ring   ramp=omega 4.5->2.6 [1200,9200]  ctrl=["omega"]
STATE_7 geom=conical arrows=["tension","weight"]              readouts=["T","v","omega","r"]     glow=fr_bob          trusted_drag_seizes              ctrl=["omega","L","bob_mass"]
```

| rule | verdict |
|---|---|
| `theta` never on a `flat` state | ✓ S1/S2/S3 readouts are `T`,`v`,`omega` only |
| `resultant` never on a `flat` state | ✓ appears only on S4 (conical) |
| `resultant` + `centripetal` never together | ✓ `centripetal` authored **nowhere** in the file |
| `normal` | ✓ authored nowhere (deliberate, per skeleton — the screen stays one-arrow clean on flat) |
| every `param_ramp.param` is `omega` | ✓ all three ramps |
| exactly ONE `glow_focal` per state, from the whirl id list | ✓ 7/7, all valid whirl ids, none indexed |
| guided-state forces inside the arrow band (floor 11.46 N, cap 58.33 N) at BOTH ends of every ramp | ✓ S1 13.50 · S2 13.50→54.00 · S3 12.96 · S4 24.00/W 14.70 · S5 17.34→57.66 (1.2% under the cap) · S6 30.38→14.70 · all inside. Confirmed against the HUD in the frames, not just arithmetic: `T = 13.50 N`, `T = 54.00 N`, `T = 12.96 N`, `T = 24.00 N`, `T = 57.66 N` read directly off the captures. |
| `bob_mass` in band | ✓ {1.5, 4.0} ⊂ [0.8, 4.5] |
| post-cut flight ≤ 1.4 s (measured hard boundary 1.52 s) | ✓ 1400 ms exactly |
| release reveal pin `at_ms + 1200 ≤ duration` | ✓ 20 800 ≤ 21 000 |
| ramp reveal pin `end_ms + 1600 ≤ duration` | ✓ S2 10 800 ≤ 19 000 · S5 11 800 ≤ 21 000 · S6 10 800 ≤ 20 000 |
| `phases[]` authored nowhere (the tray's named Rule 31 trap) | ✓ zero occurrences |
| no `variable_overrides` | ✓ zero occurrences |

**Chapter coherence with `equilibrium_of_particles`: ✓.** Same `ΣF` notation via the same
mechanism (`arrows[0].labels.resultant = "ΣF"`), same arrow conventions, same
`formula_overlay` discipline, same camera framing family, same `label`/`caption` split.
The two concepts read as one chapter. The one deliberate and correct divergence is
pedagogical: the sibling's `ΣF` shrinks to a dot, this one's stays full size and
horizontal — which is precisely the contrast STATE_1's narration is reaching for (and
which F3 asks to phrase without naming the sibling's ring).

---

## WHAT TO FIX, IN ORDER

1. **`alex:architect` `[reason: pass-1]`** — F1. Delete `STATE_7.formula_overlay`
   (one key), or add a derivation clause to S5. Keep STATE_7 **conical**: the i-1 picture
   ruling is ACCEPT, and the flat fallback would cost the founder-named clamp beat for no
   gain. While there, correct the §12 i-2 self-check to test the *relation*, not the
   symbol alphabet — that is the gap that let this through.
2. **`alex:physics_author` `[reason: pass-2]`, after step 1** — F2 (trim STATE_6 to
   ~13–14 s / ~32–36 words; do **not** touch the ramp), plus F3 and F4 in the same pass.
3. **Non-blocking, log only** — F5 to `[owner: peter_parker:field3d_surgeon]`; F6 retag SQL
   is candidate E in the scar file.
4. **Highest-leverage item in this report, and it is not about this concept** — scar
   candidate A. THE EYE already writes every pixel needed to answer "did anything move"
   and never compares two frames. Three numbers per state (distinct-hash count,
   last-change timestamp, that timestamp over duration) would have caught F2 in the same
   run that reported 31/31, and would have caught last session's seven dead states. It is
   $0, renderer-agnostic, and cannot be defeated by the missing `field_3d_config` that
   darkened D5.

## WHAT IS ALREADY EXCELLENT (do not let the FAIL obscure it)

- **The load-bearing claim holds under adversarial probing** — not one outward arrow, not
  one outward word outside a negation or a confronted belief, `centripetal` authored
  nowhere. The claim survived even after I discarded the harness proof the physics block
  cited.
- **STATE_3 is the best cut-the-string beat this fleet has shipped.** `v` identical to
  2 dp across the cut, `T` → 0.00 N, straight trail, ghost circle held, bob in frame with
  measured margin. The straight line is integrator output, not animation.
- **STATE_6's physics is exact** and the amber-clamp payoff is fully legible — the state
  needs a trim, not a redesign.
- **Every measurement the physics block promised was actually made and actually holds**
  (V1–V4). The 1.4 s flight against a measured 1.52 s boundary is exactly the kind of
  number that usually gets guessed; here it was measured and the authored value honours it.
- **Zero Unicode debt** across all three text paths, including the sibling's `ᵧ`-class trap.
- **`phases[]` authored nowhere** — the tray's named Rule 31 trap was avoided by design,
  not by luck.
- **Zero renderer edits.** The Phase-0 success criterion is met: every finding above is a
  content edit or a non-blocking engine log. The `force_rig` whirl branch expressed this
  entire concept as pure configuration.

---

*Auditor note on evidence discipline: every verdict above cites a tool output produced in
this session — a hash list, a scan result, a script exit line, a frame filename with what
in that frame shows the fact, or a source line number. The two lines resting on model
judgment (the F1 pedagogical severity, and the i-1 picture ruling) are argued in the open
rather than asserted. Nothing in this report is recalled from memory.*
