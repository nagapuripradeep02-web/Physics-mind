# FOUNDER_PROXY — CHECKPOINT A — `potential_energy_definition` — cycle 2 (final)

> Persisted verbatim by the dispatching session; founder-proxy is report-only.

## VERDICT: `DESIGN_OK` → `alex:physics_author`

**Physics-author may proceed without a further founder-proxy re-review** (the #1 precedent), provided the three BINDING HAND-DOWNS in §D are carried into its dispatch prompt. Nothing outstanding changes a state, a number, a control, a ring, a scale, or a line of §Arithmetic.

Route (a) is genuinely implemented, not annotated: `h_ref_m = −3.05` appears in ten places across §3, DoD (b), the ENGINE FIT CHECK and the handoff, with no residual `−1.8` anywhere in the file. I re-derived the whole arithmetic table independently and it is correct — including both of my cycle-0 corrections, which the architect reproduced rather than transcribed (§B.1). P1-3 and P2-4 both dissolve on their own evidence, not by assertion. P1-2's one-clause lift is the right call. P2-6's refile is honest and the μ-cap arithmetic checks out. **And I resolved the ASSUMPTION flag myself rather than letting it travel: the foot-of-ramp `U = 0` line lands at vertical NDC −0.27 on the `block_on_incline` framing — comfortably in frame on every camera and every reflow rung I tested (§B.3). It should not have been a flag, and it is no longer one.**

One new defect was introduced by the revision, and it is a word, not a design: route (a) raised U's floor from 0 to 49.0 J, but six places in the skeleton still say the U bar **"empties"** on the descent — including the S1 narration duty and the (f-2) *allowed-verb list*, which actively licenses it. It is a narration↔canvas mismatch on the PRIMARY aha state, in the exact class the skeleton claims AVOIDED under `teach_visual_must_match_narration`. I am calling it **P2 with a binding hand-down and a Checkpoint-B escalation clause**, not a P1 — and I want the reasoning on the record so it is not read as grade drift: the failing artifact is a *string that does not exist yet*, its owner is the very next agent in the pipeline, nothing in the design forbids the fix (unlike cycle-0's P1-2, where the design's own ban blocked its own correction), and I can gate it against rendered pixels at Checkpoint B. **If the word "empties" (or "empty") reaches any rendered string describing the U bar, that is a Checkpoint-B P1.**

**Not `ESCALATE`:** the reference question was adjudicated and the ruling is implemented on its own terms. **Not `DESIGN_FIX`:** spending the last architect cycle on one verb and three P3s would be a worse use of the gate than handing them down with named owners. **No `FIX(engine)`:** still zero renderer edits; every citation I re-checked on the current tree is accurate (§B.4).

---

## A. The nine verification items, answered

**1 · Route (a) implemented, and the re-derivation claim spot-checked.** TRUE on both counts.

`U = 19.6·(s + 6.1)`; `U₀ = 19.6·2.5 = 49.0` exactly; `U − 49.0 = −19.6(s + 3.6) = −W_gravity` identically — the Δ-form holds at every frame and the level equals −W nowhere. All requested stamps re-derived from scratch:

| asked | my independent value | skeleton | ✓ |
|---|---|---|---|
| S3 stamp A | `U = 19.6·(−1.6+6.1) = 88.20` · `W = −19.6·2.0 = −39.20` | 88.2 / −39.2 | ✔ exact |
| S3 stamp B | `U = 19.6·(0.4+6.1) = 127.40` · `W = −19.6·4.0 = −78.40` | 127.4 / −78.4 | ✔ exact |
| S1 pin 1890 | `s = 2.7684`, `U = 173.82`, `W = −124.82`, `ΔU = 124.82` | 173.8 / −124.8 / 124.8 | ✔ |
| S2 pin 1770 | `s = −0.08201`, `U = 117.95`, `W_grav = −68.95`, `W_fric = −54.82` | 118.0 / −69.0 / −54.8 | ✔ (−68.95 → `toFixed(1)` = −69.0) |

**Both cycle-0 corrections independently reproduced.** S1: `s(3150) = −2.71007`, `U = 66.44 → 66.4`, `ΔU = 17.44 → 17.4` — the cycle-0 `17.6` is gone and the change log names the correction. S2: the R column now carries `s(2950) = −3.14073` with `W_fric` computed from the **same instant's** path length `4.06581 + 3.60654 = 7.67235 → −91.16`, and the old `−3.330` has moved to the R+50 column where it belongs (`s(3000) = −3.32991` — I get the identical value). That is a genuine re-derivation, not a patch: the R+50 column is populated for all four states and every one of its values reproduces.

Every other cell I checked also holds: apexes (S1 1632.7 ms / U 177.0 / W −128.0; S2 1016.5 / 128.69 / −79.69 / −48.31; S3 1428.6 / 147.0), crossings (A 321.996 ms v 5.4222; B 789.695 ms v 3.1305), dwell clock (T_B = 2789.7, hold 4789.7, R 6600 ≥ 5289.7, `eye_capture_ms` = 3789.7 → 3790, margins 1000/1000), scale headroom (177.0 ≤ 261; 128.0 ≤ 130.5; 91.2 ≤ 130.5), and the pixel-change check (39.2/290 = 13.52 % ≡ 39.2/145 = 27.03 % of the half-track = 13.52 % of full).

**2 · Does P2-4 dissolve?** Yes, and for the right reason. On S3's latched record the levels now *visibly* fail — `U = 88.2` beside `W = −39.2`, `U = 127.4` beside `W = −78.4` — and the only relation that survives is `127.4 − 88.2 = 39.2 = −(−78.4 − (−39.2))`. That is a fact no other state in the concept can display: S1 and S2 show the lock-step *motion*, S3 is the only place the two quantities are held still, side by side, as numbers. Cut S3 and the student loses the two-place arithmetic form entirely. S3 is load-bearing.

**M-3 measures the right thing.** It asserts the *difference identity* off the two latched stamps at display precision — not a level, not a pixel, the actual Δ-law. One residual weakness inside it, which is mine and which I file below as P3-b: A and B are equally spaced from home (+2.0, +4.0), so `ΔW(A→B) = −39.2` is numerically *identical* to `W(A) = −39.2`. The subtraction the state teaches can therefore be mis-read off the screen as "ΔU = −W at A". M-3 still passes; the student's read is the exposed part.

**3 · Does P1-3 dissolve?** Yes, by construction rather than by patch. One `h_ref_m` in all four states means the dashed line and the U level are continuous across the click into explore: S4 opens at the same `s = −3.6` with the same `U = 49.0` and the same drawn line. There is no reference to teleport.

**Ring-cut, both directions, verified.** Cut 1 (hide advanced) is the identity — there is no advanced ring. Cut 2 (hide advanced + extended → S1, S2, S4): forward direction, no surviving state references points A/B, the two-point form or S3's formula surface. **Reverse direction — the one cycle 0 caught missing — also holds:** the reference is identical in all four states and is *named in S1*, which survives every cut, so no surviving state depends on a cut state for its only explanation. The `(i-1)` block states the S4-narration constraint ("must not say 'between two points' or reference A/B") explicitly, which is the correct residual guard. Worth recording as a *positive*: the #7 forward-bridge sentence dies under `intro`, but the coordinated ruling put a bridging clause on #7's side too, so the cross-concept handoff survives #6's own preset cut. That is the ruling paying off.

**4 · P1-2's fix.** Sound. *"Friction's joules leave the block as heat — a later lesson tracks them."* names the destination in five words and withholds every gram of #10's accounting — no `E_dissipated` bar, no ΔT, no surface/block split, no "energy is conserved". The lift is scoped to exactly one clause in (f-2) and nowhere else.

The re-worded counter no longer implies absence: *"…friction's bar falls on both legs and NO bar rises to meet it — friction's joules leave the block as heat, not into any stored-by-position number."* The screen-fact is now immediately followed by the destination, so the inference "therefore destroyed" is closed off in the same breath. Cycle-0's "have no store anywhere on screen" is retired.

One wording correction, P3-c below, and it is my fault: *"leave the block"* is the locative I wrote in cycle 0, and it is the one part of the clause that is not true.

**5 · P2-6.** The refile is honest and the arithmetic is right.

- μ-cap: `tan 30° = 0.57735`; both sliders capped at 0.50 < 0.57735, so the block cannot rest anywhere on the incline at any slider setting — every corner is free-running. The cycle-0 monotonicity argument is corrected in the text, not quietly dropped.
- Free-running **AVOIDED**: `f(μ=0.5) = 0.5 × 39.2 × cos30° = 16.974 N`; `× 12 m = 203.7 J ≤ 0.9 × 280 = 252` ✔. And 12 m is a genuine bound — the longest free-running path between wraps is the full-span descent (`+6 → −6`), because a launch from a wrap runs up ≤ 3.5 m at μ = 0.5 and returns ≈ 7 m. `W_grav` is displacement-only, `|Δs| ≤ 12 → 235.2 ≤ 252` ✔.
- Teacher drag **ACCEPTED-with-bounded-exposure**: `280 / 16.974 = 16.49 m` — the stated 16.5 m clamp distance is exact. Bounds stated correctly (numerals stay right, the clamp is bar saturation; one `[PM_NLB_ENERGY_SCALE]` warn; THE EYE fires no trusted drags so there is no H4 path).

The split is the honest one: two cases with genuinely different dispositions, said so rather than averaged into one comfortable word. The cycle-0 "AVOIDED" filing is named as wrong in the text.

**6 · The §Arithmetic table.** Re-derived correctly. Every column is labelled by its instant, and the worst-folded R+50 column is retained and populated for all four states. **One slip, P3-a:** the guard sentence claims *"margin ≥ 0.98 J at the physical bound"*. Correct value: `U(s = −6) = 19.6 × 0.1 = 1.96 J` — the text applied the 19.6 N/m along-slope rate to the 0.05 m *height* margin instead of the 0.1 m *track* margin. Safe direction (understates by 2×), and the reachable bound is the drag inset anyway (`s_min = −5.45 → U_min = 12.74 J`, which the table gets right).

**7 · The ASSUMPTION flag — resolved, not carried.** A flag was the wrong disposition, because the question is pure arithmetic over three constants already in the skeleton. If the line had been off-frame the fix would be a camera change — a design decision — discovered at Checkpoint B on the state whose entire pixel-anchor story depends on it. So I computed it.

`marker_h_ref` is added to `world` — the **un-rotated** `nlb_world_group` (`field_3d_renderer.ts:49388`), not the θ-rotated surface group — so it draws horizontal at world `y = h_ref_m × NLB_WORLD_PER_M = −3.05 × 0.5 = −1.525`, spanning `x ∈ [−3, +3]`, label at `x = 3.42` (`nlbUpdateMarkers` L49888–49897). Camera is `PerspectiveCamera(60, …)` (L3986) looking at the origin; guided framing `[0, 1.87, 9.1]` (`block_on_incline.json:532`, `conservative_vs_nonconservative_forces.json:664`). Projecting:

| point | NDC x | NDC y | in frame? |
|---|---|---|---|
| `U = 0` line, left end (−3, −1.525) | −0.305 | **−0.270** | ✔ |
| `U = 0` line, right end (+3, −1.525) | +0.305 | −0.270 | ✔ |
| `"U = 0"` label (3.42, −1.525) | +0.347 | −0.270 | ✔ |
| ramp foot, s = −6, θ = 30° | −0.264 | −0.265 | ✔ |
| block home, s = −3.6 | −0.160 | −0.161 | ✔ |

The vertical FOV is fixed, so **NDC y is invariant across every reflow rung** — the line sits at −0.270 on the EYE's 720 px capture and on the 551 px teacher rung alike; only NDC x shrinks toward centre at wider aspect (0.305 → 0.284 at 1052×551). On the plausible sandbox camera `[0, 2.3, 10.6]` it moves to −0.231. **The line is in frame with ~73 % of the lower half to spare, on every camera and every rung.**

Two geometry notes for eye-walker rather than the architect. (i) The line's screen y (≈457 px of 720) sits **~2 px below the ramp's foot vertex** (≈455 px) — visually coincident at the foot, which is the intended picture, but the leftmost ≈20 px of the dashed line overlays the slab's lower-left tip and will be visible (`depthTest: false` + `renderOrder = NLB_MK_RENDER_ORDER`, L49384–49385). Confirm it reads as a dashed line and not as slab edging. (ii) The block's home pose sits ≈39 px above the line — a modest but readable gap for the narrated 1.25 m.

**8 · The adjacent-numeral declaration.** Holds, with more margin than claimed. S1's 128.0 is the gravity ledger at its apex (t = 1632.7 ms); S2's 128.7 is the U level at its apex (t = 1016.5 ms) — different states, never co-rendered. Neither number is on a **frozen pin**: S1 pins at 1890 ms showing {173.8, −124.8}, S2 at 1770 ms showing {118.0, −69.0, −54.8}. The adjacent pair exists only as a live transient in two different states, and no baseline frame contains either number.

**9 · The remaining fixes — done, not promised.**

| finding | status | evidence |
|---|---|---|
| **P2-7** | ✔ done | q2 re-designed as a sign-of-change question `(f)`; the `(f-3)` duty adds the S1 descent clause. No state added. Re-confirmed the constraint is unchanged by route (a): W is `h_ref`-independent, so the ledger still rises −128.0 → −17.4 without crossing zero. |
| **P3-8** | ✔ done | §0.A row 4 now quotes `nlbBodyLaneZ` L44503–44508, `if (lanes.length < 2) return 0` — re-read on the current tree, citation exact. The claimed re-audit is substantive: it partitions other N/As into "quotes a reader" (drift-guard L48998–49001, `h_ref` truthiness L50937–50938, `controls_visible` closed enum L1819) and "rests on config ABSENCE, which has no reader to quote". No third instance of the substitution. |
| **P3-9** | ✔ done | Dispositioned in §0.B with the measurement, the precedent, and an eye-walker duty; the S3 pin picture in `(d)` also carries the ~37 px note. |
| **P3-10** | ✔ done | S1 title → "Negative work becomes stored energy". S2 cue → "No store for friction". |
| **P3-11** | ✔ done | Pumped-storage PRIMARY and named as the 38f widest-overlap device; rooftop tank secondary, universality claim dropped. |

---

## B. Verified sound this cycle (do not re-litigate)

**B.1** §Arithmetic re-derivation is genuine — every value in items 1 and 5 reproduces independently, including both cycle-0 corrections and the full R+50 column.
**B.2** The `bar_max_J = 2 × work_scale_J` invariant survives its restatement as a *change* claim: `nlbFitEnergyPanel` L48859–48882 still writes one `S.trk` height to every `.nlb_en_trk` in a single loop, so equal joule *deltas* move equal pixels on every rung. M-1/M-2/M-3 all measure the change, never the level.
**B.3** The `U = 0` line is in frame — measured, above.
**B.4** Load-bearing citations re-read on the current tree, all exact: `bars` enum L1941 · `h_ref_m` L1967 · `dwell_ms` L2110 · `dwell_from_pass` L2115–2117 · `marker` L2137 · `controls_visible` closed string enum L1817–1820 · `nlbHeightM` L48240–48243 · `b.U_grav_J` L48288–48290 · negative-U guard L48951–48955 · `nlbBodyLaneZ` L44503–44508 · `nlbUpdateMarkers` h_ref draw L49888–49897.
**B.5** The H4 premise is real: commit `bb32001` landed the console-warning capture that was previously filtered to `type() === 'error'`, so `[PM_NLB_ENERGY_SCALE]` now genuinely reaches a gate. The negative-U guard is therefore a real EYE FAIL, which is why §Arithmetic's guard column matters (P3-a).
**B.6** μ-slider range 0–0.5 is authorable — `slider_controls.mu_s/mu_k` with min/max/step is the shipped shape (`conservative_vs_nonconservative_forces.json:656–657`).

**Pass-1 recurrence check — classes actually checked:** the five cycle-0 candidate classes — first three now **structurally impossible** in this design, fourth **refiled correctly**, fifth **dispositioned**; `state_end_of_loop_energy_numbers_derived_at_a_different_t` — **not recurring**, every column instant-labelled; `quantitative_check_state_reuses_the_exact_numbers` — **not recurring**; `one_measured_viewport_recorded_as_the_invariant` — **not recurring**; `nlb_motion_archetype_declared_from_a_between_state_delta` — **not recurring**. One **near-recurrence** (arithmetic slip in the guard artifact, safe direction) → P3-a.

---

## C. Per-state design table (Checkpoint A form)

| # | Ring | Distinct IDEA | Derivable from predecessor? | Delta visible? | Rule 41 | Design verdict |
|---|---|---|---|---|---|---|
| S1 | core | The change-mirror exists, both directions: U rises by exactly the joules gravity's ledger falls | no (first) | yes — a second bar appears and moves in equal-pixel lock-step | title now result-first ✔; **"empties" is wrong under route (a)** | **OK** — P2-1 hand-down |
| S2 | core | The mirror does **not** extend to a non-conservative force — a third bar with no partner, and its joules have a named destination | **no** — a picture S1 cannot draw | yes — third bar, no mirror | cue "No store for friction" ✔ | **OK** — P3-c wording |
| S3 | extended | The two-place arithmetic form **and** the display that the LEVELS differ where the DIFFERENCES match — the only latched co-reading of U and W in the concept | **no** (P2-4 resolved) | yes — latched two-line record under two physics-freezing holds | title is a topic label, not a result | **OK** — P3-b, D9 note |
| S4 | core (explore) | Sandbox; the Δ-definition survives every motion, with no reference discontinuity at entry | n/a | yes — opens continuous at 49.0 J, same dashed line | ✔ | **OK** — residual drag-clamp exposure declared |

---

## D. Findings

### BINDING HAND-DOWNS (carry into the physics-author dispatch prompt)

#### P2-1 · Route (a) raised U's floor to 49.0 J, but six places still say the U bar "empties" · `alex:physics_author`

Under route (a) the U bar runs `49.0 → 177.0 → 66.4 J` against a 290 J track — **17 % → 61 % → 23 % of the track height. It never empties, and a teacher watching it will see that it does not.** Six occurrences, the last being the mechanism that would push the word into shipped narration:

- `skeleton.md:138` (S1 purpose) · `:151` (S1 choreography) · `:166` (S1 `visual_counter`) · `:292` (PRIMARY aha)
- `skeleton.md:244` **(f-3), the binding narration duty** — "…climbs back toward zero as U empties"
- `skeleton.md:243` **(f-2) allowed-verb list** — "Plain verbs allowed: stored, returned, rises, **empties**, counts, matches, leaves"

A leftover, not a considered choice, and the skeleton proves it against itself: **S2's parallel sentence already says the right thing** (`:152` "on the descent U falls and gravity climbs by the same amount") and `:55` says "returning U **toward** its 49.0 J opening". S1 kept cycle-0's verb, accurate when U's floor was 0 and not now.

**The hand-down:** strike `empties` from (f-2)'s allowed-verb list; use "falls back" / "drops back" / "returns". The S1 descent duty should read *"on the way down gravity's work is positive — its total climbs back toward zero as U falls back by the same joules."* **If "empties" or "empty" reaches any rendered string describing the U bar, that is a Checkpoint-B P1.**

#### P3-c · "leave the block as heat" is the one false clause in an otherwise correct fix · `alex:physics_author`

`skeleton.md:167,169,243`. Friction's dissipated joules become internal energy **of the block and the ramp** — the block warms; it does not shed the energy. **This is my wording from cycle 0**, so the architect adopting it verbatim is correct behaviour and the correction is mine to make. Use *"Friction's joules become heat — a later lesson tracks them."* — one word shorter, no locative claim, same boundary. Adjust the `visual_counter` and `one_line_fix` to match.

### Findings the architect may take or defer

#### P3-a · §Arithmetic understates the negative-U guard margin by 2×

`skeleton.md:300` — *"margin ≥ 0.98 J at the physical bound"*. Correct: `U(s = −6) = 19.6 × (−6 + 6.1) = 1.96 J`. The same line's drag-inset figure (`19.6 × 0.65 = 12.74`) uses the right formula, so the row is internally inconsistent in exactly the way cycle-0's S2 row was. Safe direction; flagged because §Arithmetic is the artifact the H4 guard rests on and this is the second cycle in which its guard column has carried a slip.

#### P3-b · S3's two flags are equally spaced, so the difference the state teaches equals the first stamp's own reading

A at `s = −3.6 + 2.0`, B at `s = −3.6 + 4.0` (`skeleton.md:234`). Both intervals are 2.0 m, so on screen:

```
point A:  U =  88.2 J  ·  W gravity = −39.2 J
point B:  U = 127.4 J  ·  W gravity = −78.4 J
```

`ΔW(A→B) = −78.4 − (−39.2) = −39.2` — **numerically identical to `W(A) = −39.2`, printed one line above.** The state whose whole job (post-route-(a)) is "you must subtract both columns" contains a coincidence that lets a student read "ΔU = −W at A" and get the right answer.

**This is a finding I could have raised in cycle 0 and did not** — worse, cycle-0's P2-4 quoted these exact four numbers as the argument for route (a) without noticing. Per the standing rule it is not a legitimate `DESIGN_FIX`, and I am not treating it as one.

Cheapest fix (A untouched, so T_A, its dwell and residual are unchanged): move **B to `s_m = −3.6 + 4.4 = +0.8`** → `U(B) = 19.6 × 6.9 = 135.2`, `W(B) = −19.6 × 4.4 = −86.2`, `ΔU = 47.0`, `ΔW = −47.0`; crossing `T_B` = 933.7 ms physics → 2933.7 ms clock, hold → 4933.7, `R = 6600 ≥ 5433.7` ✔, **`eye_capture_ms` becomes 3934**, and B's freeze residual *improves* to `19.6 × 2.425/60 = 0.79 J`. Three numbers move; the rendered set {88.2, −39.2, 135.2, −86.2} collides with nothing. B stays below the S3 apex (`s = 1.4`) so the crossing exists.

#### Watch item for Checkpoint B (no owner, no action now)

The coordinated ruling observes that #7-S5's fix — *"latch U₀ on screen"* — is "the same fix #6-S3 needs". #6 implements no U₀ latch, and I am **not** requiring one: S3's subtraction is `U(B) − U(A)`, not `U − U₀`; S1's claim is a motion read backed by the equal-pixel invariant, and adding a constant to the HUD would push it past Rule 34's ≤2-readout budget on speculation. But S1 *is* the state where the two numerals no longer match and the only numeric route to the claim runs through a remembered 49.0. **Checkpoint B should judge from pixels whether S1's change-mirror reads without a latched U₀**, and if it does not, the fix is a small overlay then — with frames to justify it.

---

## E. `engine_queue`

**Empty.** No `FIX(engine)`. Zero renderer edits, no `deriveStateMeta` co-edit; load-bearing readers re-verified on the current tree (§B.4). The Phase-0 alarm-rule claim remains TRUE.

Cycle-0's near-miss stands and is still **not routed**: the unsigned `U_grav` stack cannot draw `U < 0`, which is what forces `h_ref` below the lowest reachable point. Route (a) does not remove that constraint — it accepts it and pays the 49.0 J offset, which is precisely the cost the ruling weighed. #7 and #9 will meet the same wall. Worth pricing once at chapter end as one signed-`U_grav` ask serving #6/#7/#9, owner `peter_parker:field3d_surgeon`.

---

## F. Candidate scar rows

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause,
  prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type) VALUES

('design_revision_moves_an_instruments_zero_and_leaves_the_verbs_describing_the_old_range',
 'A review-ordered reference change re-derives every number and leaves the narration verbs describing the instrument''s OLD range',
 'MAJOR', 'alex:architect',
 'potential_energy_definition cycle 1 moved energy_layer.h_ref_m from the home pose to the ramp foot, raising the U bar''s floor from 0 to 49.0 J (17 percent of a 290 J track). Every numeric in the skeleton was correctly re-derived, but six places still said the U bar "empties" on the descent - including the (f-3) narration duty and, decisively, the (f-2) ALLOWED-VERB list, which licenses the word for the physics-author who writes the shipped string. The skeleton contradicted itself: S2''s parallel sentence already said "U falls". The revision''s own change log listed the arithmetic re-derivation and did not list a verb audit.',
 'A revision that changes what an instrument MEASURES FROM (a reference, a zero line, an origin, a scale floor) changes the instrument''s visible RANGE, not just its numbers. The re-derivation must include a verb sweep over every reader-facing string describing that instrument''s motion (empties, fills, zeroes, bottoms out, maxes out, returns to zero) and must re-audit any allowed-verb or banned-verb list that licenses them. Numbers and verbs are one artifact.',
 'manual',
 'After any skeleton revision that changes a reference/zero/scale field, grep the skeleton for range verbs (empt, fill, zero, bottom, max out, drain) and check each against the revised min/max of the instrument in the arithmetic table. Also grep the allowed-verb list itself.',
 'OPEN', ARRAY['potential_energy_definition']::text[], ARRAY[]::text[],
 'ch6-concept-6 checkpoint A cycle 2 2026-08-09', 'incident'),

('checkpoint_flags_at_equal_spacing_make_the_between_flag_difference_equal_the_first_flag_reading',
 'Two checkpoint flags spaced equally from the home pose make the A-to-B difference numerically identical to the stamp at A, so the subtraction the state teaches can be mis-read off one line',
 'MODERATE', 'alex:architect',
 'potential_energy_definition S3 places flags at home + 2.0 m and home + 4.0 m under a constant force (mg sin theta = 19.6 N/m). The latched record reads "point A: U = 88.2 J, W gravity = -39.2 J" and "point B: U = 127.4 J, W gravity = -78.4 J". The state exists to show that only the DIFFERENCE mirrors, but delta-W(A to B) = -39.2 J is the same numeral as W(A) = -39.2 J printed on the line above, so a student can read the correct answer without ever subtracting. The degeneracy is a pure consequence of equal spacing under a constant force and is invisible to every gate: both stamps are exact, the measurement duty passes, and the arithmetic table is correct.',
 'When a state teaches a DIFFERENCE between two marked points under a constant force, the two intervals (home to A, A to B) must be UNEQUAL, so that no displayed stamp equals the difference the state is asking the student to compute. Check the degeneracy explicitly in the arithmetic table: assert delta-Q(A to B) is distinct at display precision from every other numeral rendered in the state.',
 'manual',
 'For any state authoring two or more checkpoints with capture values, compute the pairwise differences of each captured quantity and compare them against the full set of rendered numerals in that state. Flag any difference that collides with a displayed stamp value at display precision.',
 'OPEN', ARRAY['potential_energy_definition']::text[], ARRAY[]::text[],
 'ch6-concept-6 checkpoint A cycle 2 2026-08-09', 'incident'),

('skeleton_defers_an_in_frame_visibility_question_that_camera_arithmetic_settles_at_design_time',
 'A skeleton files "is this new overlay inside the camera frame" as a probe-at-first-EYE flag when the projection is computable from constants already in the skeleton',
 'MODERATE', 'alex:architect',
 'potential_energy_definition cycle 1 flagged the foot-of-ramp U = 0 dashed line as an ASSUMPTION - probe-before-authoring, on the grounds that no frame had yet proven the line sits inside the guided block_on_incline camera frame. Every input was already in the skeleton or one grep away: marker_h_ref is added to the UN-rotated world group (field_3d_renderer.ts L49388) at y = h_ref_m * NLB_WORLD_PER_M (L49891), the camera is PerspectiveCamera(60, ...) (L3986) looking at the origin, and the shipped guided framing is [0, 1.87, 9.1]. founder-proxy computed NDC y = -0.270, comfortably in frame on both cameras and both aspect rungs, in one pass. Had it been off-frame the fix would have been a CAMERA change - a design decision - discovered at Checkpoint B on the state whose entire pixel anchor depends on it.',
 'A geometric visibility question (is element X inside the frame) is a DESIGN-TIME computation, not a probe-later flag, whenever the world position and the camera are both known: project the point through the documented fov/aspect and report the NDC. Defer to a probe only when the position depends on a runtime layout the skeleton cannot resolve. Note that a vertical-fov camera makes NDC y invariant across reflow rungs, so one computation settles every viewport.',
 'js_eval',
 'Given camera_position C, target origin, fov 60 and the world point P, compute NDC = (dot(P-C, right)/(z*tan30*aspect), dot(P-C, camUp)/(z*tan30)) where z = dot(P-C, forward); assert both components are within [-1, 1] with margin. Run at design time from the skeleton, not from a frame.',
 'OPEN', ARRAY['potential_energy_definition']::text[], ARRAY[]::text[],
 'ch6-concept-6 checkpoint A cycle 2 2026-08-09', 'directive');
```

**Two notes for whoever files these.** (i) The cycle-0 candidate `sandbox_ledger_envelope_bounded_over_the_wrap_span_while_the_state_advertises_dragging` is upsert-keyed on `bug_class`; its `root_cause` quotes the pre-fix figures (μ 0.6, f = 20.37 N, ~13.7 m). The design now caps μ at 0.5 → f = 16.97 N → 16.5 m. Update the row's numbers on upsert rather than minting a second class. (ii) The other four cycle-0 candidates should be filed unchanged and stay OPEN: they are prevention-rule rows, and three are now *demonstrably honoured* by this concept rather than obsolete — the ratchet working, not a reason to close them.

---

## G. Files to open first

1. `docs/loop_runs/ch6/potential_energy_definition/skeleton.md` — **lines 243–244**. (f-2)'s allowed-verb list and (f-3)'s S1 descent duty: the two strings that carry P2-1 into the shipped narration. The only thing in the file I would stop a build for.
2. Same file — **line 300**, the §Arithmetic guard sentence (P3-a, 0.98 → 1.96 J).
3. Same file — **line 234**, S3's flag positions (P3-b) — optional, with the +4.4 m alternative costed above.
4. `src/lib/renderers/field_3d_renderer.ts` **L49384–49397 + L49888–49897** — `marker_h_ref` on the *un-rotated* `world` group at `h_ref_m × 0.5`. The read behind the discharged ASSUMPTION; cite it instead of re-flagging.
5. `docs/loop_runs/ch6/gravitational_potential_energy/founder_proxy_A.md` — the coordinated ruling.

---

```
RUBRIC (advisory, unratified; did not affect the verdict)
  Checkpoint A subset: D1 2 · D2 2 · D8 2 · D9 1 · D10 2   = 9/10   (cycle 0: 7/10)
  weakest: D9 title as a teaching claim — three of four titles state a result in plain
           literal English after P3-10, but S3's "ΔU between two points" is a topic
           label, not a claim; the rail truncates and the student learns nothing from it
           (S3's actual result is "Only the change in U matches").
           D1 — now 2: S3 is load-bearing under route (a), the only latched co-reading of
           U and W in the concept. The point it nearly lost is P3-b.
  D2/D8/D10 are the revision's gains: ring order still the derivation with the aha in
  state 1 of 4; both misconception beats at genuine pivots with S2 naming friction's
  destination; explore lost its reference discontinuity and its stick corner.
```

**Cycle budget:** 2 of 2 spent — closed with `DESIGN_OK`, no escalation. Physics-author may proceed immediately; no further founder-proxy review before Checkpoint B. At Checkpoint B I will gate on: the rendered U-bar verbs (P2-1, P1 if unfixed), the heat clause wording, the `U = 0` line as it actually renders against the ramp foot, whether S1's change-mirror reads without a latched U₀, and the three measurement duties M-1/M-2/M-3.
