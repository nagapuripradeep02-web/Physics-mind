# FOUNDER_PROXY — Checkpoint B, cycle 1 — `potential_energy_definition`

> Persisted by the dispatching session; founder-proxy is report-only.

## 1. Verdict: `APPROVE`

**Authoring sign-off ONLY. Not shipping approval.** `visual:approve`, `PILOT_CONCEPTS`, TTS and deploy remain the founder's alone (Rule 17).

The blocking `FIX(engine)` from cycle 0 is **closed and verified by measurement, not by report**. The relaunch is not "approximately" energy-neutral — it is neutral to machine epsilon: total mechanical energy reads **177.000000000 J across all 573 sampled frames of a 14 s drive, spread 1.99 × 10⁻¹³ J**, including all three bound crossings. The block re-enters at exactly `s₀ = −3.600 m`, `v₀ = +8.000 m/s`, and **U re-anchors to exactly 49.000 J — the number the narration says out loud in s1_2**. `ΔU = −W_gravity` measured from that reference holds at **0 violations in 572 frame pairs at a 10⁻⁶ J threshold**.

Accepted: the surgeon's two corrections to my cycle-0 brief. Gating on **live θ** is right and I was wrong to scope it to authored values. Finding **four** inclined sandboxes rather than my two is a straight improvement on my own survey. Also accepted: the dispatching session's correction to my `eye_capture_ms` bucket report — see §3.

---

## 2. The four gates I said I would check

### Gate 1 — the wrap seam. **PASS.**

Live probe against the built review page, sampling `PM_nlbEngine.bodies.block` and `PM_nlbWork` every frame for 14 s on STATE_4 at authored defaults:

```
 seam ts=3552  PRE  s=-5.9451 v=-9.3264 U= 3.037 K=173.963 E=177.000  Wg=+45.96
               POST s=-3.6000 v=+8.0000 U=49.000 K=128.000 E=177.000  Wg=  0.00   dE=-1.7e-13 J
 seam ts=7104  ... identical ... dE=-8.5e-14 J
 seam ts=10656 ... identical ... dE=-1.1e-13 J
 E over 573 frames:  min 177.000000000   max 177.000000000   spread 1.99e-13 J
 frames where |(U - 49.0) + W_gravity| > 1e-6 J :  0 of 572
 s range over the run: -5.9451 .. +2.9306   (track bounds ±6 — the top bound is never reached)
```

Relaunch period 3552 ms matches closed form (apex 8/4.9 = 1.633 s, `s_apex` = 2.931 m, return 1.909 s → 3.542 s).

Frames: **old** `20260810-005403/STATE_4__dense_t04000.png` — `U = 158.6 J`, `v = −10.12 m/s`, gravity **+76.7 J green**, high on the ramp. **New** `20260810-112301/STATE_4__dense_t04000.png` — `U = 105.9 J`, `v = +5.96 m/s` climbing, gravity **−56.9 J red**.

Driven at the teacher's own control extremes:

| drive | result |
|---|---|
| `v₀ = 9` (new max), clean lap | apex `s = 4.665 < 6` — **no top-bound wrap introduced**; seam dE = **−0.000 J** |
| `v₀ = 9` set **mid-flight** | one transient seam at dE = −79 J, then exactly neutral. The teacher's own energy injection discharged by a restart; reachable at `v₀ = 8` too — pre-existing, not created by 8→9 |
| `μₛ = μₖ = 0.5` | seam dE = **+154.5 J**, ledgers zero, block returns home. The honest "restart" — identical in kind to the `loop_reset_ms` the teacher has watched three times in S1–S3 |
| `v₀ = 0` | releases from rest, wraps every ~1008 ms, seam dE = **0.000 J** exactly |

Unplanned positive: the fix makes **s4_4's wording true**. "Relaunch faster" was false under the old remap (the body re-entered at the opposite bound with a mirrored `v₀`). Post-fix, changing `v₀` mid-run and waiting one lap gives exactly `s = −3.600, v = +9.000`. The engine fix retroactively earned the narration's verb.

### Gate 2 — `v₀` travel in the narrated direction. **PASS.**

Read off the **rendered** DOM: `nlb_v0_slider` → `min="0" max="9" step="0.5" value="8"`, row label `v₀ = 8.0 m/s`, visible only in STATE_4. Handle at 88.9% of travel with **1.0 m/s (two steps) of headroom right**, visibly off the stop versus hard against it in the cycle-0 frame. The fix landed in the block that renders (`field_3d_config.slider_controls`) *and* in `physics_engine_config.variables`.

### Gate 3 — `s1_3`'s focal. **PASS**, and it dodges two open engine bugs.

`energy_panel` is a first-class glow key (`NLB_EN_PANEL_GLOW`, `field_3d_renderer.ts:48610`). Probed live with `SET_GLOW`:
- `energy_panel` → every panel slot gets `box-shadow: 0 0 9px 2px rgba(255,255,255,0.55)`, **including `energy_bar_U_grav` and `work_bar_gravity`** — the two surfaces holding the sentence's numbers.
- `nlb_arrow_block_weight` (the old target) → every slot `box-shadow: none`. The panel was untouched; emphasis sat on the one element that never moves.

Measured live on STATE_1: `W_gravity` reaches exactly **−128.0 J**, `U` runs **49.0 → 177.0 J**.

Two open scar classes checked, neither bites: `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state` — **no state authors `glow_focal`**, so all sentence glows are live. `nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate` — the `isEn` gate accepts only `energy_bar_*`, `energy_seg_*`, `energy_col_E`, `energy_panel`; had the author targeted `work_bar_gravity` directly the fix would have been a **silent no-op**. Right answer, and the near-miss was one identifier wide.

For the record: THE EYE cannot see this fix — it never sends `SET_GLOW`, which is why S1's frames are byte-identical before and after. The player *does* drive it (`applyReveal()` → `sendGlow(s.glow)` off the state clock, `build_review_site.ts:1206`), independent of audio, so the fix is live with narration muted — the default teaching mode.

### Gate 4 — 20/20 unchanged, nothing in S1–S3 moved. **PASS**, reasoning made explicit because the raw pixel diff looks alarming and is not.

New run `20260810-112301`: **20/20**, `warnings: []`, `diagnostic_warnings: []`, H4 zero self-diagnostics, H3 zero console errors. H2 skipped — no approved baseline.

1. **Structural.** The edited region sits inside `if (nlbSandboxWrap())`, i.e. `nn.mode === "sandbox"`. S1/S2/S3 are `incline_slide`. The branch is unreachable from them.
2. **Deterministic frames.** Every `STATE_1/2/3__frozen.png` and `__panel_a.png` is **byte-identical (0.000%)** across all three runs — 005403, 025046, 112301.
3. **Dense-frame deltas are capture-phase jitter, proved with a control.** Run `20260810-025046` sits *between* the commits (same engine as cycle 0, new JSON). S2 drifts by the same signature in the *engine-unchanged* pair as in the engine-changed pair; S3 drifts in the second pair but was byte-identical in the first. A real engine effect cannot appear where the engine did not change nor be absent where it did. Cropping confirms: the block sits ~2 px further along its own trajectory at unchanged readouts.

---

## 3. On the correction to my cycle-0 report

Accepted — I had the buckets the wrong way round; the duplicate that had to go was the **winner** (`epic_l_path`), not the loser. Worth adding, because it makes the fix independently checkable: **both copies carried the same value, 3934**. Surviving values are `1890 / 1770 / 3934`, all in `field_3d_config`. The deletion changed no captured frame — and `STATE_3__frozen.png` is byte-identical across all three runs, which confirms it without anyone trusting either account of which bucket won.

---

## 4. Per-state review table

| state | correct | order | labels | sound-off | clearly diff | how I would use it | problem | P |
|---|---|---|---|---|---|---|---|---|
| **S1** Negative work becomes stored energy | **Y** — `W_g` 0 → −128.0 J, `U` 49.0 → 177.0 J, \|ΔU + ΔW\| < 2e-13 J | Y | Y | Y | Y | "Same joules, opposite directions, every frame" | s1_1's "pumped-storage plant" is unfamiliar ESL vocabulary (41c) — anchor closed at Checkpoint A, noted not routed | P3 |
| **S2** Friction has no potential energy | **Y** — apex t=1024 ms, `W_f = −48.3 J`, matches the authored label to the decimal | Y | Y | Y | Y — third bar is the one new thing | "Watch which bar has a partner and which doesn't" | Narration register: "a third bar **joins**", "no **partner rises to meet it**", "keeps its joule-for-joule **lock**" — Rule 41a | **P2** |
| **S3** Only the change in U matches | **Y** — apex `U = 147.0`, `W_g = −98.0`; stamps 88.2/135.2 → Δ 47.0 against −39.2 → −86.2 | Y | Y | Y | Y — only state with stamps + freeze | "The levels differ, the change does not" | only `extended` state; cutting it leaves S1/S2/S4 coherent (verified) | — |
| **S4** Explore | **Y** — E conserved to 2e-13 J across 3 relaunches, correct at all four slider extremes | Y | Y | Y | Y | "Change one dial, watch which bar answers" | **U bar uses only 8.75%–31.6% of its track** vs 16.9%–61% in S1–S3 | **P2** (rides) |

Word budget 55 / 50 / 54 / 37 — all inside 25–55. Archetypes `cycle-compare`, `cycle-compare`, `reveal-build`, `drag-sandbox`; the S1/S2 repeat is a genuine declared contrast pair, the permitted exception. Rule 37 verified over 14 s and three relaunch cycles; `[D7]` finds no frozen tail.

Rule 38 checked in full: **38a** rings core/core/extended/core, extended contiguous before explore, cut leaves a coherent lesson with no surviving reference to checkpoint content ✔ · **38b** explore is core-ring with the core formula surface ✔ · **38c** algebra only throughout (no advanced ring authored at all) ✔ · **38d** dialect neutral ✔ · **38f/35** pumped-storage anchor, no country/currency/brand/festival/name in any rendered or narrated string ✔ · **38g** CBSE `verified: true` (chapter convention across all four other Ch.6 concepts), IB/AP/A-Level all `needs_teacher_verification: true` ✔.

Rule 34: one formula surface per state, captions 5/4/4/2-word delta cues, HUD value-only, all math Unicode, HUD clears the review-chrome corner ✔.

---

## 5. The unresolved ride-along, P2-4 — **it still rides. It does not block. It is now on a deadline.**

**Rides**, for three verified reasons:

1. **No state's claim is contradicted.** Within STATE_4 the scale is constant, so `ΔU = −W_gravity` reads exactly (0 violations in 572 frames). The bar is a magnitude cue with the live number printed beside it (Rule 33d satisfied). Only a teacher reading the bar's *height* across the S3→S4 click is misled, and only about magnitude — never sign or direction.
2. **I checked whether the author was lazy. They were not.** `bar_max_J = 2 × work_scale_J` is the within-state equal-pixel invariant the mirror claim depends on. And `work_scale_J = 280` is genuinely forced: driving the sandbox to its own slider bounds I measured `max|W_gravity| = 186.3 J` (at `v₀ = 9`) and `max|W_friction| = 159.1 J` (at `μ = 0.5`) — **both above the guided states' 145 J scale**, so 145 would clip a teacher-reachable ledger. Dropping S4 to 290 J is not available.
3. **The correct remedy is engine-side and is exactly what the bug_class names.** Render the ceiling and the scale change becomes legible instead of silent. Per the PRIME DIRECTIVE I am not routing a content workaround that would be worse.

**The hard line.** This row is on its **second filing, third concept in this chapter carrying `U_grav` bars, and zero dispatches.** My own contract says a ride-along's fix runs *after* the concept approves and *before the next concept starts*. That did not happen after concept #2, and concept #6 inherited it. I am not converting a non-contradicting defect into a blocker to punish a process failure — that would be grade drift in the other direction. But stated plainly for the founder's packet: **the next Ch.6 concept that carries `U_grav` bars should not clear Checkpoint B until `energy_bar_track_renders_no_scale_ceiling…` has been dispatched.** A ride-along that is never dispatched is not a ride-along; it is a decision to ship the defect, taken by nobody.

---

## 6. Findings

**Zero P1s, zero unresolved recurrences, zero unresolved blocking engine findings.**

| # | sev | state | the founder's words | evidence | owner |
|---|---|---|---|---|---|
| **P2-4** | P2 | S4 vs S1–S3 | "Why did the bar shrink when the number didn't?" | `bar_max_J` 290 vs **560**, `work_scale_J` 145 vs 280, read live. 49.0 J draws at 16.9% in S1, 8.75% in S4. Remedy blocked in authoring: measured `max\|W_g\| = 186.3 J`, `max\|W_f\| = 159.1 J` at slider bounds, both > 145 | `FIX(engine)` **ride-along** → `peter_parker:field3d_surgeon`, existing OPEN class — **extend, do not re-mint** |
| **P2-5** | P2 | S2, S4 | "Bars don't have partners and don't rise to meet each other." | s2_2 "a third bar **joins**", s2_3 "**no partner rises to meet it**", s2_4 "joule-for-joule **lock**", s4_3 "with no **partner**" — Rule 41a. **NEW at cycle 1; I missed it at cycle 0.** Rides because every *on-canvas* string is clean literal English and narration is off by default (Rule 24) | `FIX` → `alex:physics_author` |
| **P3-6** | P3 | cross-concept | "You told me the shipped sim is fine because H2 was 0.00%. H2 can't see the part you changed." | `conservative_vs_nonconservative_forces` STATE_5 authors **no `eye_capture_ms`**; matching its frozen frame against its own dense series puts the pin nearest **t = 1000 ms** (0.248%, vs 0.85% at t=0 and 0.93% at t=4000), while the wrap is at ≈4.3 s. The ten 0.00% H2 results are **true and not load-bearing** — the same blind spot that hid the original bug. That concept's post-1.5 s behaviour rests on the surgeon's single `−92.2 J` measurement, which I did not independently reproduce | Checkpoint C item + scar row below. **Not a defect in this concept** |
| **P3-7** | P3 | S1 | "Would a Class-11 ESL student know what a pumped-storage plant is?" | s1_1. Universal and Rule-35 clean but not a physics term (41c). Anchor closed at Checkpoint A — **noted, not routed** | none |

---

## 7. `engine_queue`

| finding | tag | owner | what the agent needs |
|---|---|---|---|
| **P2-4** U-bar scale ceiling | **ride-along** | `peter_parker:field3d_surgeon` | `field_3d_renderer.ts`, energy-panel draw around `NLB_EN_STEPS` / `nlbEnBars` (~48610–48700). The track renders its own ceiling so a scale difference is readable rather than silent. **Constraint: `bar_max_J = 2 × work_scale_J` is load-bearing for the within-state mirror — do NOT "fix" this by normalising scales.** Probe: render S1 and S4 at `U = 49.0 J`, assert the ceiling text differs (290 vs 560) and is legible at both reflow steps. Do not close the row for the flat case |
| **P3-6** frozen-pin blind spot | **ride-along** (verification, not behaviour) | probe definition, no code owner yet | All four inclined sandboxes either author no `eye_capture_ms` on the sandbox state or pin before the first bound crossing. **No baseline in the fleet exercises the relaunch branch** |

Neither is blocking.

---

## 8. Candidate scar rows

**(a) EXTENSION, not a new row.** `energy_bar_track_renders_no_scale_ceiling_so_two_states_draw_one_value_at_two_heights` already exists OPEN and already carries this concept (applied in `467c3d2`). **Do not re-mint and do not re-apply the upsert** — its `ON CONFLICT … SET status = EXCLUDED.status` branch would rewrite it. Append only:

```
 THIRD-CONCEPT CONFIRMATION (potential_energy_definition, Checkpoint B cycle 1, 2026-08-10):
 the author's constraint is now MEASURED, not asserted. Driving STATE_4 to its own slider
 bounds gives max|W_gravity| = 186.3 J (v0 = 9) and max|W_friction| = 159.1 J (mu = 0.5),
 both ABOVE the guided states' work_scale_J of 145 J -- so lowering the sandbox to 290 J
 would clip a teacher-reachable ledger, and bar_max_J = 2 x work_scale_J is the within-state
 equal-pixel invariant the concept's mirror claim rests on. The remedy is therefore the
 rendered ceiling this bug_class names, NOT a scale normalisation. Filed twice, dispatched
 zero times, third concept affected.
```

**(b) genuine INSERT.** Dedup-checked against all 15 candidate files in this chapter run; the dispatcher must still `SELECT` the live table before applying.

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('sandbox_frozen_pin_lands_before_the_first_bound_crossing_so_h2_is_blind_to_the_wrap_branch',
 'Every inclined sandbox pins its frozen baseline before its first wrap, so an H2 result of 0.00 percent is true and proves nothing about the branch a wrap fix changes',
 'MAJOR', 'peter_parker:field3d_surgeon',
 'A sandbox state either authors no eye_capture_ms or authors one earlier than its first bound crossing, so the SET_TIME_FREEZE capture -- the only deterministic frame H2 compares -- never reaches the wrap. Measured on conservative_vs_nonconservative_forces STATE_5 (theta 25, mu 0.3, no eye_capture_ms authored): matching its STATE_5__frozen.png against its own dense series puts the pin nearest t = 1000 ms (0.248 percent, against 0.854 percent at t = 0 and 0.933 percent at t = 4000), while its first wrap is at t = 4.28 s. The relaunch fix changed that state from a repeated top-to-bottom run into a genuine round trip, and its ten H2 comparisons still read 0.00 percent -- a correct result that carries no information about the change. This is the SAME blind spot that let the original bound-to-bound remap ship: the wrap re-anchors the ledgers and the potential reference in one frame, and the baseline never looks after it.',
 'A regression baseline is evidence only about the instant it captures. When a fix changes behaviour that begins at time T within a state, the state must carry a frozen pin AFTER T before an H2 result may be cited as evidence that the fix is safe -- and a reviewer must state which instant the pin captures rather than quoting the percentage. For sandbox states specifically: author eye_capture_ms past the first bound crossing, or record explicitly that the state has no baseline coverage of its wrap branch.',
 'js_eval',
 'For every field_3d state with newtons_laws_body.mode = "sandbox", compute the first bound-crossing time by driving the state and watching for a discontinuity in bodies[].s. Assert the state authors an eye_capture_ms strictly greater than that time. Report any state where the frozen pin precedes the first crossing, and mark that state''s H2 result as non-evidential for any change to the wrap branch.',
 'OPEN', ARRAY['conservative_vs_nonconservative_forces','block_on_incline','gravitational_potential_energy','potential_energy_definition']::text[],
 ARRAY[]::text[],
 'ch6-concept6-founder_proxy_checkpoint_b_cycle1-2026-08-10', 'probe_definition')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  concepts_affected = EXCLUDED.concepts_affected;
```

Note the deliberate omission of `status = EXCLUDED.status` — the chapter's recorded scar-apply hazard.

P2-5 is **not** offered as a scar row: Rule 41 is human-enforced by design, and minting a near-duplicate of an existing plain-language class is worse than not filing.

---

## 9. Five images, in order

1. `.visual_runs/potential_energy_definition/20260810-005403/STATE_4__dense_t04000.png` — the defect as it was: `U = 158.6 J`, `v = −10.12 m/s`, **green +76.7 J** ledger, high on a frictionless ramp.
2. `.visual_runs/potential_energy_definition/20260810-112301/STATE_4__dense_t04000.png` — same instant, fixed: climbing at `+5.96 m/s`, ledger **−56.9 J red**. Also the clearest view of the `v₀` handle off its stop.
3. `…/20260810-112301/STATE_4__contact_sheet.png` — eleven frames of the sandbox lap; gravity bar red on every climb, block never high while descending.
4. `…/20260810-112301/STATE_4__dense_t00000.png` — P2-4 in one frame: `U = 49.0 J` as a sliver at 8.75% of a 560 J track.
5. `…/20260810-112301/STATE_3__frozen.png` — the frame immediately before it: `U = 135.6 J` at 46.8% of a 290 J track. Look at 4 and 5 back to back and you see what a teacher sees at the S3→S4 click.

---

```
RUBRIC (advisory, unratified; did not affect the verdict)
  D1 2 · D2 2 · D3 1 · D4 2 · D5 1 · D6 2 · D7 2 · D8 1 · D9 1 · D10 2   = 16/20
  weakest: D5 instrument quality — the U bar spends the whole explore state in the bottom
           third of its own track (8.75%→31.6% on a 560 J ceiling) against 16.9%→61% in
           S1–S3 on 290 J. This is P2-4's visual cost.
           D9 plain language — four figurative narration phrases (s2_2/s2_3/s2_4/s4_3);
           all on-canvas strings are clean.
  also 1: D3 narration→canvas binding (4 of 18 unbound, all in explore, defensible);
          D8 curriculum flex (no advanced ring authored, so the notation ladder has no
          top rung — U = −∫F·ds is absent).
  No P1 was lowered to reach APPROVE — there were none to lower; the one blocking finding
  was fixed and re-measured, and a P2 was ADDED at cycle 1 rather than removed.
```
