# Checkpoint B fix round — `work_done_by_constant_force` (cycle 1 of 3)

> Routed outputs from the Checkpoint B `FIX` verdict. json-author applies these to
> `src/data/concepts/work_done_by_constant_force.json`.

## F1 — S6 `work_scale_J` · APPLIED by the dispatching session (`4fdfbcd`)

`240 → 792`. Physics ceiling, every term from the authored config:
`F_along max = F_max × cos(θ_min) = 60 × cos 0° = 60 N`; post-wrap lap `= 2 × length_m = 12 m`;
peak `= 720 J`; scar formula's 1.1 headroom `= 792 J`.

**This reverses the Checkpoint A cycle-2 ruling (Patch 8)**, which specified 240 and explicitly
accepted the clamp as *"the correct trade."* Founder re-ruled after Checkpoint B drove the sliders
with real mouse input for the first time and measured the ledger at 532–635 J with the bar pinned
and the engine printing `raise work_scale_J`.

**The deciding argument was what the state is FOR.** Dragging force from default to max is the one
gesture a teacher will actually make: at 240 that reads 47.5% → **PINNED**, destroying the
comparison exactly where it is most dramatic; at 792 it reads 14.4% → **90.9%**, a legible sweep
across nearly the whole bar. The "flat instrument at defaults" objection assumes the sliders stay
where they were found — the one thing a sandbox exists to prevent.

Verified: tsc 0 · validate 149 PASS/0 FAIL, zero WARN on this concept, fleet profile unchanged ·
EYE 27/27, zero console errors, **no `[PM_NLB_ENERGY_SCALE]`** (the guard was firing before).

## F2 — S4 narration · physics-author, READY TO APPLY

**The defect:** the state's claim (*two independent numbers agree*) was asserted in narration but
never shown as two numbers. The stamp latches 40.0 J at the crossing (t = 1000 ms) and holds until
the loop reset (2000 ms) while the live bar keeps climbing — 57.6 J at the frozen pin, 121.7 J at
t = 1744 ms — so for the entire post-crossing second the screen carried two contradicting values of
an identically-labelled quantity. Both values are physically correct; the wording was not.

**Direction taken: narrate the SEQUENCE, not the simultaneity** — true at every frame of the loop,
pre-explains the divergence a teacher sees at any pause point, and needs no change to the pin, the
numbers, or the engine.

Revised `text_en` (**54 words**, unchanged from the ceiling, ≤55):

| id | text | words |
|---|---|---|
| `s4_1` | "A forty newton pull acts at sixty degrees on the same frictionless floor." | 13 |
| `s4_2` | "The formula predicts forty joules of work by the flag, two metres along." | 13 |
| `s4_3` | "The meter reads that same forty joules the instant it crosses the flag, and a stamp holds that reading." | 19 |
| `s4_4` | "The meter keeps climbing afterward; the stamp does not." | 9 |

**Delta cue does NOT survive — replaced.** `"The numbers agree"` → **`"Matches at the flag"`**
(4 words, ≤5 ceiling, Rule 41 plain). Reasoning worth keeping: the delta cue is a *persistent*
on-canvas caption (Rule 34a — visible for the state's whole duration), so it must be true at every
frame, not only at the crossing. For ~90% of each loop the two numbers visibly disagree, including
the one frame THE EYE and the founder actually see. Anchoring the claim to the **flag** (a fixed
location, invariantly true every cycle) rather than to the current screen state fixes it.
*(Equally valid alternative: "Agrees at the flag", if "matches" reads too close to the bar caption.)*

**What a teacher says at the pin:** point to the stamp first — it captured the meter's exact reading,
forty joules, at the instant the crate crossed the flag two metres in, matching the formula's
prediction; the bar has kept counting since, because the crate has kept moving past the flag, which
is why it now reads higher.

**Does not route back to the architect.** The physics, the pin and the numbers are all correct as
built; the defect was purely a claim worded as an evergreen simultaneity the loop mechanics cannot
sustain.

**Hygiene item for json-author (not a defect):** STATE_4's `label` field and the
`epic_l_path.STATE_4.scene_composition` annotation `wdcf_s4_stamp` both still carry the old
*"reads the same 40.0 J … at the same instant … stamp together"* phrasing. The `scene_composition`
text is a documented non-render for field_3d (epic_l_path annotations are a silent no-op), so it is
not visibly wrong — but both should be brought in line so no future audit or tooltip re-surfaces the
false claim as ground truth.

## F3 — S5 rebuilt as a two-body race · architect RULED

**Diagnosis accepted in full; Checkpoint B's suggested fix REJECTED.** S5 becomes a
**side-by-side compare**: the two pulls the student has already met — crate A at 20 N/0° (S1's
pull) and crate B at 20 N/60° (S3's pull) — released together on one track, scored by the one
vector formula. Pure JSON, existing contracts, no slider, no third translate.

**Why not the θ slider (Checkpoint B's candidate):** it relocates the defect rather than resolving
it. S3 already carries the θ slider live, so S5-with-slider becomes a second copy of S3's exact
mechanism at a different starting angle — an undeclared translate trio *of interactions*, not just
of strings. Worse, the generality demonstration would then depend on the teacher choosing to drag,
where Rule 31's default is that the choreography SHOWS its idea auto-playing.

**Why not `param_ramp` on `'theta'` (considered, rejected on physics):** sweeping θ while the crate
moves makes the force non-constant in direction, so the ledger honestly accumulates `∫F cos θ ds`,
which then does **not** equal `F·d·cos θ` at the current θ. The bar would contradict the formula
surface inside the one concept whose SEAM-N-verified invariant is that they agree to the last
printed digit — and it breaches the atomic claim ("constant force"). Physics-dishonest.

**Why not cutting S5:** the scalar-product idea is genuinely distinct (q5's dot-vs-cross confusion
is documented — the sin θ/torque carry-over), it is NCERT §6.2 and claimed coverage for JEE/IB/
A-Level, and no sibling delivers it (#2 owns the *sign* regime, not the notation). The state's IDEA
earned its place; only its PICTURE was failing.

**Revised §3 row:**

| # | Teaches | Archetype | Distinct motion | Delta | Controls | Camera | Ring | Words |
|---|---|---|---|---|---|---|---|---|
| S5 | W is a scalar product — one rule scores every pull | **`side-by-side-compare`** *(coined; no seed archetype covers simultaneous multi-body contrast, and `cycle-compare` is sequential phases of ONE apparatus)* | The two pulls already met run TOGETHER: A (20 N, 0°) and B (20 N, 60°) release side by side from the home pose; A pulls visibly ahead while both bars climb at their own slopes; arc (θ = 60°) + `d` arrow on crate B — the state's F⃗/d⃗ pair; one formula surface governs both bars live. No slider — generality is DEMONSTRATED by the authored race | "Two pulls, one formula" | none | `[0, 2.0, 10]` → both crates + both bars | advanced | 35–50 |

Archetype audit becomes `translate-through` ×2 (S1/S3, declared pair) · `null-result-hold` ·
`flow-along-path` · `side-by-side-compare` · `drag-sandbox` — no undeclared repeat, no third
translate.

**Arithmetic — independently re-verified by the dispatching session, all exact:**
a_A = 4.000, a_B = 2.000 m/s² · N_B = 31.68 N > 0 · crate A loop distance 8.00 m < 11.4 m span
(clamp never fires) · loop peaks 160 J / 40 J → shared `work_scale_J: 260` unchanged (≥1.1×160 ✓) ·
**at the frozen pin (1200 ms) the bars read 57.6 J vs 14.4 J** — visibly apart.

**⚠ Narration discipline the architect caught, and it is a real trap.** At equal *time* the work
ratio is `(cos 60°)² = ¼`, i.e. **A collects 4× B's work at the pin** — NOT the ½ that S3 claims.
The ½ is *per metre*. Re-verified: 57.6/14.4 = 4.000, while the per-metre ratio is 2.000. Narrating
"half" here would teach a contradiction against the state one click earlier. **Do not quantify the
bar ratio.** Say only: the flat crate moves farther AND collects more work per metre, both from
cos θ; one formula scores both bars to the last digit.

**Bonus:** the new title **"Two pulls, one formula"** retires FIT-CHECK item **V2's rail-glyph risk
entirely** — U+20D7 now appears ONLY on the Cambria Math formula surface, never in the review-chrome
rail font.

**ONE named verification, not designed around:** two same-`force` accumulators with distinct
`body_id`s rendering two bars is *permitted by* the SEAM M contract (1–4 entries, each with
`body_id`) but not yet *exercised* by any ch6 state. json-author asserts it at THE EYE's first run.
**If only one bar renders, that is a Phase-0 alarm routed to `peter_parker:field3d_surgeon`** — halt
and say so; do not silently fall back to the slider variant.

**Consequential edits:** §2 S5 purpose line · Rule 38 re-checked, no change (advanced ring still
contiguous before explore; both cuts still coherent; `entry_state_map.vector_form → STATE_5`, q5 and
coverage_map all unchanged) · Rule 41 title → "Two pulls, one formula" · bar labels "flat pull" /
"tilted pull" (S4 keeps its own `label: "by the pull"`, so the stamp composition is untouched) ·
glow focal stays `angle_arc` (on crate B) · DoD (b) gains crate A `#42A5F5` / crate B `#AB47BC`
(visibly distinct per the compared-bodies-must-differ lesson) · FIT CHECK S5 row rewritten to cite
multi-body `bodies[]`, per-body `applied_force`, and SEAM L's own compare-group design intent.

## P2s not yet routed (Checkpoint B F4/F5/F6)

- **F4** `alex:json_author` — the 3D body label duplicates the HUD (`crate = 5 kg` rendered twice)
  and sits in the renderer's brighten-only `solidApparatus` set, so it never dims. In 5 of 6 states
  the focal is not the applied arrow, which means **the brightest text on canvas is the one quantity
  this concept says does not appear in the formula, while the force arrow renders at 40%** — in a
  concept named *Work Done by a Constant Force*. Clean escape: omit `bodies[0].label` to fall
  through `nlbBodyLabelText`'s bare-id branch; the HUD keeps the mass.
- **F5** `alex:physics_author` — 0/18 `tts_sentences` carry a `glow` binding, against 18/18 in
  `faraday_law_induction`, 24/24 in `capacitance`, 17/17 in `newton_third_law`. Emphasis never moves
  across a 23–26 s narration.
- **F6** `alex:json_author` — S6's `glow_focal: "nlb_body_crate"` dims the three live instruments its
  own caption advertises.

## Engine ride-alongs filed, NOT routed (do not block concept #1)

- **E1** sandbox wrap remaps `b.s` but not `b.s0`, so the `d` arrow points backward while `W` climbs
  positive — 16 of 120 frames at default settings, no drag needed. **The authoring mitigation named
  in the original scar must NOT be used** (seeding at the bound trips the false-clamp scar); the
  engine fix is the only correct answer.
- **E2** `show_components` resolves mg only and hard-hides on flat ground, so a `W = F·d·cos θ`
  concept can never draw F's projection onto the direction of motion — the one picture a teacher
  draws at a whiteboard for this formula.
- **E3** label dodge ignores arc/checkpoint/arrow label rects.
- Plus: the bug-queue script's `FIELD3D` constant is stale and contains no `newtons_laws_body`
  concept, so `--field3d --open` hides every Ch.5/Ch.6 scar from future audits.
