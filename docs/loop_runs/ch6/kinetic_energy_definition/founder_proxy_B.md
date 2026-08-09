# FOUNDER_PROXY — CHECKPOINT B (build gate) · `kinetic_energy_definition`

## VERDICT: `APPROVE`

Authoring sign-off only. **Not shipping authorisation** — Rule 17 untouched; `visual:approve`, TTS,
`PILOT_CONCEPTS` and deploy remain founder-only and none were run.

Fix budget: 2 of 2 cycles spent (founder cap this session). No P1 findings. All six findings are
P2/P3, every one engine-owned with **no JSON-only remedy** — none was fixable by the spent budget.

**Justification.** Drove all six states at `http://localhost:8094/kinetic_energy_definition/` and
measured rather than read reports. Every item sealed at Checkpoint A is in the build, and the three
that carried the concept are exact:

- S2 fills `22.222%` / `88.889%` — the load-bearing RISK-2 assertion on which the whole D3 ruling rested
- S3's ramp climbs monotonically `2.516 → 4.000 kg` across **four** loop resets, no snap-back — RISK-3
  closed on live evidence, not on a source reading
- S5 settles on exactly `0.0 J`; stamp `flag: v = 4.00 m/s · K = 24.0 J` renders in 2 lines at
  **284.8 px** against the 340 px cap — RISK-4 and F13 both discharged

Zero console errors and **zero** `[PM_NLB_ENERGY_SCALE|CLAMP|DRIFT]` lines across the whole walk
including nine ramp samples and four slider drives — RISK-1 closed. 23/23 narration sentences carry a
`glow`. Every rendered number is physically right. **No state misleads a teacher, and no state is
derivable from its predecessor.**

Both engine fixes verified independently of the surgeon's census: S3's `mg` shaft measures **13.89:1**
below the slab (SEAM Q), and its ink runs **53 px at m = 2 → 107 px at m = 4**, a **2.02×** matching
`ink = 27.06·m − 0.09` to within a pixel (SEAM R).

---

## Per-state review

| state | correct | order_ok | labels | sound_off | distinct | problem_or_missing | pri |
|---|---|---|---|---|---|---|---|
| S1 `moving_body_has_energy` | Y | Y | Y | Y | Y | Apparatus floats; cart is a ~35 px cube in a 1052 px frame. Fleet-standard camera | P3 |
| S2 `speed_counts_twice` (PRIMARY) | Y | Y | Y | Y | Y | HUD reprints each cart's mass already on its billboard: 4 extra lines beside the aha | P3 |
| S3 `mass_counts_once` | Y | Y | Y | Y | Y | Ramp ends at 7.2 s of a ~20 s state; `mg` label ink 13×6 px; arrow spears the floor | P2 |
| S4 `never_negative` | Y | Y | Y | Y | Y (declared pair w/ S2) | Sentence 1 says "these two carts" but glows only `cart_a` | P3 |
| S5 `falls_to_zero` | Y | Y | Y | Y | Y | Flag pole strikes the `cart = 3 kg` billboard ~400 ms/loop; friction 1.67:1 for 49 px at loop start | P2 |
| S6 `explore` | Y | Y | Y | Y | Y | Same 40.0 J draws 165 px in S1 and 93 px here (scale 45→80, no label) | P2 |

---

## Findings

**F1 (P2) — S6's bar scale changes silently.** `bar_max_J` 45 on S1–S5, 80 on S6, no scale label.
S1 renders `40.0 J` at 165.3 px (88.889%); S6's default pose — same 5 kg, same 4 m/s, same numeral —
at 93.0 px (50%). *Not fixable in JSON:* S6's sandbox peaks at 75.0 J (verified live at
`v0 = −5, m = 6`), so 45 would overflow and peg. Mitigating: the numeral is identical in both, no
adjacent state pair shows one value at two sizes (S5 ends empty), and all 66 rendered strings honour
the §10(f-2) ban on cross-state height comparison. → engine_queue E1.

**F2 (P2) — the flag pole strikes the billboard.** Confirmed on own frames: at t ≈ 400 ms the pole
crosses the word "cart" in `cart = 3 kg`, and the billboard overlaps the flag's own label. Recurrence
of the OPEN `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` — hit directly:
no `isScene` object reachable from `window`, exactly as that row documents for THREE r128. Doesn't
obscure a claim (the stamp carries the flag's measurement). → engine_queue E2.

**F3 (P2) — `mg` renders at 6 px glyph height** in the state the term ledger says *defines* `mg`.
Ink bbox **13 × 6 px** against the body billboard's **72 × 14 px** — 43% the height. **NOT the
concept-#2 label-contrast class:** contrast measures **7.29:1** (m=4) and **8.42:1** (m=2), above the
4.5:1 floor, because these labels sit against the dark background rather than the slab. A distinct
*size* class. → engine_queue E3.

**F4 (P2) — SEAM R changed the fleet's weight-arrow picture and no one has looked at it with eyes.**
S3's `mg` arrow now passes through the slab with its head ~55 px into the void below. Correct physics,
correct SEAM R behaviour. But SEAM R lifted force ink out of the depth buffer *fleet-wide*, so every
shipped concept drawing a weight arrow on a body resting on a surface now draws the sub-floor portion
that was previously occluded. `normal_force`'s 0.28–0.85% regression — the largest of the three swept
— is consistent with exactly that. **"Within the 2% tolerance" is a pixel statement, not a taste
statement.** Touches three already-shipped concepts. **The one item in this handover most wanting the
founder's eyes.** Independent of this verdict — parking #3 would not address it, the engine commit is
already made. → engine_queue E4 + founder review.

**F5 (P3) — S3's ramp is over for ~64% of its narrated state.** `end_ms = 7200` against ~20 s of
narration; after 7.2 s the picture is a static 4 kg / 32.0 J. Mitigation verified: re-clicking STATE_3
resets `t_ms` to 0 and replays the ramp (first sample after `SET_STATE` was t = 1856 ms, m = 2.516).
Carry-forward for #9/#10: don't author `end_ms` beyond ~2× the narration without deciding to.

**F6 (P3) — HUD reprints mass already on the billboard.** In S2 the mass appears twice per cart,
adding four text lines beside the PRIMARY aha. Engine behaviour (`nlb_readout` always emits the mass
row), not authorable per-state.

---

## 🔴 Correction to my own Checkpoint A record — matters for #4, #9, #10

At Checkpoint A I wrote *"THE EYE runs 1280×720 and can never see this [the reflow step-down]."*
**That was wrong.** The sim iframe is **1052 × 551**, so S2 and S4 run at `NLB_EN_STEPS[1]` (138 px
track) on *every* screen including every EYE baseline, while S1/S3/S5/S6 run at step 0 (186 px).
Measured: S1's `40.0 J` = 165.3 px, S2's fast-cart `40.0 J` = 122.7 px — same reading, **1.35×
different, at an adjacent state boundary**.

The design survives intact, and survives it *by construction*: the architect re-anchored the aha on
the reading and the fill fraction, and fill fractions are written as percentages so they are invariant
under the ladder. **That argument is the single reason I accepted the re-wording at Checkpoint A, and
it is now confirmed on live pixels.** But the scar row I filed **understates its own trigger** — it is
not a small-screen edge case, it is the default. Corrected by UPDATE in the SQL file.

---

## Rulings on the five knowingly-unresolved items

| # | Item | Ruling |
|---|---|---|
| 1 | Surgeon's 49 px / 1.67:1 residual at S5 loop start | **Carry-forward.** Transient, on an arrow that cues a narration sentence but carries no claim (the fall to zero is carried by the bar and the deceleration). The tube remedy was implemented and refuted with a byte-identical census — a closed investigation, not an open shortcut. |
| 2a | Flag/billboard collision | **Carry-forward** (F2). |
| 2b | `bar_max_J` 45 vs 80 | **Carry-forward** (F1). No JSON remedy — S6 peaks at 75.0 J. |
| 2c | Lone `mg`, re-judged on CURRENT frames | **My Checkpoint A recommendation survives, and SEAM R strengthens it.** Post-fix both arrows would be full-length and both would double (N = mg here), so adding `normal` makes the mass cue **more** ambiguous, not less — while still importing an untaught `N`. Decisively: in S3 the arrow is not a free-body diagram, it is a **mass gauge**, labelled and narrated as exactly that. S3 asserts nothing about force balance. **Do not add `normal`.** |
| 3 | CALCULATOR blind — 59 skipped | **Carry-forward; the chapter lesson holds — a skip is not a pass.** It contributed nothing here. It did not need to: I re-derived the substantive numeric content live. Fix `readoutHarvest.ts` before #4. |
| 4 | EYE "27/27" not reproducible from artifacts | **Confirmed.** The manifest holds `entries` (135) + `timings` only — no `checks` block, `warnings: []`. Did not affect the verdict because I re-derived the gate content live. |
| 5 | Rule 40 — ~475+ engine lines not on master | **The largest structural risk in this handover, and not an escalation trigger.** Repo-hygiene divergence (the exact Rule 40 origin story), not a sim defect. The founder should land PRs #18/#19 + `8bd84a2` **before** the next chapter branch opens, or the SEAM K/L/M/N layer will be rebuilt independently. |

---

## engine_queue — all ride-along, none blocking

| # | Finding | Owner |
|---|---|---|
| E1 | Energy-bar track has no scale label; `bar_max_J` differences invisible | `peter_parker:field3d_surgeon` |
| E2 | Sprite label ink box unmeasurable → flag/billboard collision ships undetected | `peter_parker:field3d_surgeon` |
| E3 | Arrow label sprites render at 6 px glyph height (NEW class — not the #2 contrast row) | `peter_parker:field3d_surgeon` |
| E4 | **SEAM R sub-surface force ink is a fleet-wide visual change, unreviewed** | `peter_parker:field3d_surgeon` + **founder eyes** |

---

## Five frames the founder should open first

1. `.visual_runs/kinetic_energy_definition/20260802-231127/STATE_2__frozen.png` — the PRIMARY aha. A
   30.7 px stub above a 122.7 px near-full track, `10.0 J` and `40.0 J`. The ten-year memory, and it lands.
2. `…/STATE_3__frozen.png` — the post-SEAM-R weight arrow. **Open this for F4**: is an arrow through
   the floor the picture you want on the whole fleet?
3. `…/STATE_3__dense_t00000.png` — the same arrow at m = 2 kg (53 px vs 107 px).
4. `…/STATE_5__frozen.png` — cart at rest, bar at exactly `0.0 J`, stamp on one clean line. The
   canonical frame lands *on* the titled claim — the inverse of rubric R4.
5. `.scratch_fp_ke/S5_t400.png` — the flag pole striking the billboard (F2), not visible in any
   committed EYE frame.

---

## Carry-forward watch list for concept #4

1. **Land the engine on master first** (PRs #18/#19 + `8bd84a2`).
2. **F4 needs a founder ruling before #4 authors force arrows on a floor.**
3. **Fix `readoutHarvest.ts`** — 59 skips is a blind gate for #4/#7/#8/#9/#10.
4. **Correct the reflow scar's trigger** before #9 authors five-slot groups — 5 slots × 2 groups at
   step 0 will overrun a 551 px iframe badly.
5. **Make THE EYE write its `checks` block into `manifest.json`** — "27/27" has no artifact behind it.
6. `presets` and `min_ring` have **no schema landing site** (`conceptJson.ts` supports `depth_ring`
   only) and are authored on no shipped concept. Rule 38h is a fleet-wide gap, not a #3 defect.
7. **#4 inherits the `W` collision risk this concept was built to avoid.** `mg` held the line here
   (`NLB_ARROW_DEFAULT_LABELS.weight = "mg"`; `work`/`W` appear only in `source_book` and
   `curriculum_tags.syllabus_unit`, never rendered). #4 authors *both* work bars and weight arrows —
   that is where the collision actually bites.

---

## Rubric (advisory, unratified — did not affect the verdict)

```
D1 2 · D2 2 · D3 2 · D4 1 · D5 1 · D6 1 · D7 1 · D8 2 · D9 2 · D10 2   = 16/20
weakest: D5 apparatus conviction — slab spans ~30% of canvas width, lower half empty,
         cart a ~35 px cube in a 1052 px frame. Fleet-standard [0,2,10] camera shared
         with shipped siblings — a platform framing question, not a #3 authoring choice.
         D6 quantity legibility — mg is a named on-canvas quantity with no number
         anywhere, label ink 13x6 px against the billboard's 72x14.
```
