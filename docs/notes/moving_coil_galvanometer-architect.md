# ARCHITECT SKELETON — `moving_coil_galvanometer`

> Stage 1 of the Alex pipeline (architect → physics_author → json_author → quality_auditor).
> Concept: **The moving-coil galvanometer mechanism** · Chapter 4 (Moving Charges and Magnetism) · §4.10 · class_level 12 · renderer **field_3d** (NEW scenario `moving_coil_galvanometer`).
> Conceptual-only ship (Rule 20 suspended → NO `mode_overrides`). EPIC-L-first (Rule 16a; **zero `epic_c_branches`**). Archetype **C** (closed-loop rotational dynamics — the coil-in-field couple machinery from Diamond #3 `torque_on_current_loop_in_field`, plus four NEW device primitives).
> **Scope decision (founder-approved, do not re-litigate):** teach the **mechanism only**. Ammeter / voltmeter conversion (shunt / series-resistance) is DEFERRED to a separate future concept `galvanometer_to_ammeter_voltmeter` — noted as downstream in §1 mastery_definition. Voltage sensitivity (φ/V = NAB/kR) is likewise downstream.

---

## Pre-flight: engine_bug_queue consultation

Consulted the canonical scar content. The high-impact field_3d rules for an archetype-C device sim, all satisfied or FLAGged below:

- `field3d_scene_background_white_when_pvl_colors_lacks_background` — if the JSON sets `pvl_colors`, it **must** include `"background": "#0A0A1A"`. (FLAG to json_author.)
- `field3d_rhr_hand_static_no_curl_choreography` — the S2 force-direction rule must be **performed** after a prediction beat, not a static decoration. Reuse the archetype-C **`rhr-ibf-triad`** world-space guide (I/B/F arrow triad + sequence: dots → predict → 3 s pause → guide appears → force arrow confirms), NOT a frozen mesh.
- `field3d_visible_elements_substring_match_greedy` — use **full `mcg_*` element ids** as `visible_elements` tokens; never a bare prefix. **Substring hazards in this concept** (call them out to json_author): `mcg_scale` would greedily match BOTH `mcg_scale_uniform` + `mcg_scale_crowded`; `mcg_tau` matches BOTH `mcg_tau_deflect` + `mcg_tau_spring`; `mcg_pole` matches BOTH `mcg_pole_n` + `mcg_pole_s`; `mcg_force` matches BOTH `mcg_force_left` + `mcg_force_right`; and **never use `mcg_co`** (matches `mcg_core` AND `mcg_coil`). Always list the full id.
- `field3d_scenario_missing_devstatemeta_recognition` — register `moving_coil_galvanometer` in `src/lib/validators/visual/deriveStateMeta.ts` in the SAME change as the renderer, with per-state reveal/hold/motion recognition for the four NEW choreographies (`radial_morph`, `spring`, `settle_phi`, `current_step`).
- `directive` pedagogy rows applied per-state: **concrete-before-abstract** (S3 shows the *broken* crowded-scale case concretely before S4 fixes it), **reveal-synced-to-narration**, **show-a-quantity-live-when-named**, **don't-pre-spoil** (radial field gated to S4 — S1–S3 keep flat poles + straight field; φ = (NAB/k)·I gated to S7; sensitivity gated to S8; the uniform scale never appears before S7), **colour each element by its identity**.

---

## 1. Atomic claim

A moving-coil galvanometer reads current because the BIL force **couple** on the coil's two vertical sides gives a deflecting torque **τ = NIAB** with **ΣF = 0** (pure rotation, no slide); a **radial field** (concave pole faces + a soft-iron core) keeps the coil plane always parallel to B so the sides stay perpendicular to B at *every* deflection — making τ stay **NIAB with no sinθ fade**; a hairspring supplies a restoring torque **τ = kφ**; and at equilibrium **NIAB = kφ → φ = (NAB/k)·I**, so the deflection is **linear in current** (a **uniform scale**) and the current sensitivity **φ/I = NAB/k** is a fixed device constant — the radial field is the whole point, because without it the scale would be crowded (τ ∝ sinθ).

**mastery_definition / cut-line:** This concept teaches the galvanometer *mechanism* and ONLY that. It does **not** cover converting a galvanometer into an ammeter (shunt resistance) or a voltmeter (series resistance) — deferred to a future atomic `galvanometer_to_ammeter_voltmeter`. It does not cover voltage sensitivity φ/V = NAB/kR (downstream). It assumes the couple τ = NIAB on a loop (prerequisite `torque_on_current_loop_in_field`) and the force F = BIL on a current-carrying side (prerequisite `force_on_current_carrying_wire`) — it re-uses, not re-derives, them.

---

## 2. State count + arc (9 EPIC-L states — complexity-driven, Rule 11)

| State | Purpose (one line) | `teaching_method` | `advance_mode` |
|---|---|---|---|
| **STATE_1** | Hook + setup: an N-turn coil hangs between magnet poles, current flows, pointer reads zero — *how does this become a current meter?* | `narrative_socratic` | `auto_after_tts` |
| **STATE_2** | The couple: BIL force on each vertical side, equal-opposite on different lines → **τ = NIAB**, **ΣF = 0** (reuse force-pair + ΣF=0 badge). | `narrative_socratic` | `manual_click` |
| **STATE_3** | The sinθ trap: IF the field were uniform, **τ = NIAB·sinθ** → equal current steps give unequal swings → **crowded scale** (plants the problem). | `narrative_socratic` | `wait_for_answer` |
| **STATE_4** | **PRIMARY AHA** — the radial field: concave poles + soft-iron core bend B radially → coil plane always ∥ B → **τ = NIAB at every angle** (straight field arrows morph → radial; force arrows stay full length as the coil turns). | `narrative_socratic` | `wait_for_answer` |
| **STATE_5** | The restoring spring: a hairspring winds up as the coil turns → restoring **τ = kφ** grows opposite the deflecting torque. | `narrative_socratic` | `manual_click` |
| **STATE_6** | Equilibrium: the coil settles where **NIAB = kφ**; the pointer lands on a reading. | `narrative_socratic` | `wait_for_answer` |
| **STATE_7** | **SUPPORTING AHA** — linear scale: **φ = (NAB/k)·I**; constant torque → φ ∝ I → **uniform scale** (pointer steps equally as I steps; direct contrast with STATE_3). | `narrative_socratic` | `manual_click` |
| **STATE_8** | Current sensitivity: **φ/I = NAB/k**; raise N, A, B or soften k; a fixed device constant, independent of the current measured. | `narrative_socratic` | `manual_click` |
| **STATE_9** | Explore: sliders **I, N, B, A, k** with a live φ_deg + sensitivity readout on a uniform calibrated scale. | `exploration_sliders` | `interaction_complete` |

`advance_mode` = 4 distinct → Rule 15 ✓. `has_prebuilt_deep_dive: true` on **STATE_4** + **STATE_7** (cache hint only; ships zero authored); all others `false`.

---

## 3. Within-state choreography (Socratic-reveal timelines)

All motion runs on the state clock (Rule 26). json_author **MUST carry every `pause_after_ms`**.

### STATE_2 — introduces force **F = NBIL**, deflecting torque **τ = NIAB**, **ΣF = 0**
- **t=0 visible:** coil + poles + core; `mcg_current_dot` marching up the left side, down the right side; `mcg_pointer` at zero; flat poles + straight `mcg_field_arrow`.
- **Prediction (s2_2):** "The field pushes on a current. Which way does each side get pushed — and does the coil slide across, or turn in place?" — `pause_after_ms: 3000`.
- **Reveal (at s2_3):** `mcg_rhr_guide` triad appears (I up, B across, F = I×B), THEN `mcg_force_left` grows **into the page** and `mcg_force_right` grows **out of the page**; `mcg_sigma_f_zero` badge writes "ΣF = 0".
- **Reveal (at s2_4):** `mcg_tau_deflect` grows along the suspension axis; panel writes `F = NBIL`, then `τ = NIAB`. The coil makes a small turn so the couple→rotation is *seen*.
- **Explanation (s2_5):** equal-opposite forces on different lines = a couple → zero net force (no slide), pure turning effect τ = NIAB.

### STATE_3 — introduces the uniform-field torque **τ = NIAB·sinθ** + the **crowded scale**
- **t=0 visible:** same coil; straight uniform `mcg_field_arrow` (flat poles emphasised); `mcg_scale_crowded` hidden.
- **Prediction (s3_2):** "Suppose the field is uniform — straight, between two flat poles. Step the current up in equal jumps. Will the pointer move in equal steps?" — `pause_after_ms: 3500`, `wait_for_answer`.
- **Reveal (at s3_3):** the coil deflects; as it turns, its sides tilt away from square-to-B, so `mcg_force_left/right` shrink and `mcg_tau_deflect` shrinks with **sinθ**; `extras.crowded_scale` reveals `mcg_scale_crowded` with ticks that bunch at large deflection; `extras.current_step` steps the current in equal jumps and the pointer's swing shrinks each step.
- **Explanation (s3_4):** equal current steps → unequal swings → a crowded, hard-to-read scale. Panel: `τ = NIAB·sinθ`.

### STATE_4 — introduces the **radial field** (PRIMARY AHA); τ = NIAB at every angle
- **t=0 visible:** straight field arrows + flat poles carried over from STATE_3 (so the morph reads as a change).
- **Prediction (s4_2):** "Now curve the pole faces and slip a soft-iron cylinder inside the coil. What happens to the field lines in the gap — and to the angle the coil's sides make with the field?" — `pause_after_ms: 3500`, `wait_for_answer`.
- **Reveal (at s4_3):** `extras.radial_morph` — `mcg_field_arrow` morph from straight → **radial**; `mcg_pole_n`/`mcg_pole_s` reshape to **concave** faces; `mcg_core` brightens (Rule 29 brightness only).
- **Reveal (at s4_4):** the coil rotates through a range, and `mcg_force_left/right` **stay full length** the whole time (the load-bearing visual); `mcg_tau_deflect` stays constant length.
- **Explanation (s4_5):** the field is radial → the coil plane always lines up with B → sides stay square to B at every deflection → **τ stays NIAB, no sinθ, no fade**. Panel: `τ = NIAB` (beside the dimmed STATE_3 `τ = NIAB·sinθ`).

### STATE_5 — introduces the restoring spring torque **τ = kφ**
- **t=0 visible:** coil mid-deflection in the radial field; `mcg_spring` hidden.
- **Prediction (s5_2):** "A fine hairspring is attached to the coil's shaft. As the coil turns, what does the spring do?" — `pause_after_ms: 3000`.
- **Reveal (at s5_3):** `extras.spring` — `mcg_spring` appears and **winds up** as the coil turns; `mcg_tau_spring` grows *opposite* to `mcg_tau_deflect`, its length ∝ φ.
- **Explanation (s5_4):** the spring resists turning with a restoring torque proportional to how far it has wound — `τ_spring = kφ`.

### STATE_6 — introduces **equilibrium NIAB = kφ**
- **t=0 visible:** both torque vectors present; coil mid-swing; pointer not yet settled.
- **Prediction (s6_2):** "Two torques now act — the deflecting NIAB and the restoring kφ. Where does the coil stop?" — `pause_after_ms: 3000`, `wait_for_answer`.
- **Reveal (at s6_3):** `extras.settle_phi` — the coil **damped-settles** to φ_eq; `mcg_tau_deflect` and `mcg_tau_spring` become equal length; `mcg_pointer` lands on a tick.
- **Explanation (s6_4):** it rests where the two balance — `NIAB = kφ`. Panel: `NIAB = kφ → φ = (NAB/k)·I`.

### STATE_7 — introduces **φ = (NAB/k)·I → uniform scale** (SUPPORTING AHA)
- **t=0 visible:** coil at equilibrium reading; `mcg_scale_uniform` shown; the STATE_3 `mcg_scale_crowded` recalled small beside it for contrast.
- **Prediction (s7_2):** "Step the current up in equal jumps again — but now in the radial field. Equal steps on the scale, or crowded like before?" — `pause_after_ms: 3000`.
- **Reveal (at s7_3):** `extras.current_step` on `mcg_scale_uniform` — the pointer steps in **equal angular increments** as I steps equally; juxtapose with the crowded STATE_3 stepping.
- **Explanation (s7_4):** because the torque was constant, φ is exactly proportional to I → equal steps → an evenly-spaced **uniform scale**. Panel: `φ = (NAB/k)·I`.

### STATE_8 — introduces **current sensitivity φ/I = NAB/k**
- **t=0 visible:** uniform scale + equilibrium reading.
- **Prediction (s8_2):** "How much swing do you get per unit current? To make the meter detect a *tinier* current, what would you change?" — `pause_after_ms: 3000`.
- **Reveal (at s8_3):** raise N / A / B or soften k → the pointer swings further for the *same* current.
- **Explanation (s8_4):** current sensitivity `φ/I = NAB/k` — more turns, bigger area, stronger field, or a softer spring each raise it; it depends only on the device. Panel: `S_I = φ/I = NAB/k`.

(STATE_1 = hook, STATE_9 = sandbox — no Socratic reveal; the student drives STATE_9.)

---

## 4. Misconception confrontation (EPIC-L-first, Rule 16a — NO `epic_c_branches`)

| # | Wrong belief | EPIC-L state | Visual counter (`visual_counter`) | `one_line_fix` |
|---|---|---|---|---|
| M1 | "The coil slides/translates across the gap when current flows." | **STATE_2** | `mcg_force_left` (into page) + `mcg_force_right` (out of page) draw, then `mcg_sigma_f_zero` badge appears while the coil *turns in place*. | Equal-opposite forces on different lines = a couple: ΣF = 0 (no slide), only torque τ = NIAB. |
| M2 | "Any magnetic field gives a proportional reading — the scale is whatever it is." | **STATE_3** | Straight uniform field; coil deflects; `mcg_tau_deflect` shrinks with sinθ; `mcg_scale_crowded` ticks bunch as current steps equally. | In a uniform field τ = NIAB·sinθ, so equal current steps give unequal swings — a crowded, non-linear scale. |
| M3 | "The field between the flat magnet poles is uniform / straight." | **STATE_4** | `radial_morph`: straight `mcg_field_arrow` bend to radial; `mcg_pole_n/s` reshape concave; `mcg_core` brightens. | Concave poles + a soft-iron core make the gap field *radial* — always along the core's radius, never straight. |
| M4 | "Nothing stops the coil — it just keeps turning / spins freely." | **STATE_5** | `mcg_spring` winds up as the coil turns; `mcg_tau_spring` grows opposite `mcg_tau_deflect`. | A hairspring supplies a restoring torque τ = kφ that grows with deflection and opposes the turn. |
| M5 | "The coil rotates all the way to 90° (until μ aligns with B)." | **STATE_6** | `settle_phi`: coil damped-settles at φ_eq where the two torque arrows become equal; pointer lands on a tick — well short of 90°. | The coil stops at equilibrium NIAB = kφ, a small reading angle — not at full alignment. |
| M6 | "The scale is crowded / non-uniform, like the uniform-field case." | **STATE_7** | `current_step` on `mcg_scale_uniform`: pointer steps in equal increments, shown beside the recalled crowded STATE_3 scale. | Radial field → constant torque → φ ∝ I exactly → an evenly-spaced uniform scale. |
| M7 | "Sensitivity depends on how big a current you measure." | **STATE_8** | Vary N/A/B/k → deflection-per-unit-current changes; vary I alone → the *ratio* φ/I does not. | Current sensitivity φ/I = NAB/k is a fixed device constant — it depends on N, A, B, k, never on the current. |

---

## 5. `has_prebuilt_deep_dive` states (cache hint, NOT a gate; ships zero authored)
- **STATE_4** — the radial-field trick (PRIMARY aha).
- **STATE_7** — the linear-scale payoff (SUPPORTING aha).

## 6. Drill-down clusters (3 candidate cluster_ids each)
- **STATE_4:** `why_radial_not_uniform` · `what_does_the_soft_iron_do` · `why_sides_stay_perpendicular`.
- **STATE_7:** `why_galvanometer_scale_is_uniform` · `where_did_the_sin_theta_go` · `phi_proportional_to_current`.

## 7. `entry_state_map`
```
foundational: STATE_1 → STATE_7    # the mechanism (BOTH ahas inside)
sensitivity:  STATE_8              # "how to make it more sensitive" (φ/I = NAB/k)
explore:      STATE_9              # sandbox sliders
```
Both ahas live inside `foundational` → Foundational-coverage rule ✓. End-of-foundational pills: "Make it more sensitive? →" → sensitivity; "Play with I, N, B, A, k →" → explore. Default aspect = `foundational`.

## 8. Prerequisites (advisory, Rule 23)
`[torque_on_current_loop_in_field, force_on_current_carrying_wire]` — both shipped. Supplies the couple τ = NIAB + ΣF = 0 (STATE_2) and the single-side force F = BIL (STATE_2). Advisory only.

## 9. Real-world anchor (Indian context, plain English, physics-true)
**Primary — the analog galvanometer in your school / college physics lab.** The brass-cased instrument with a thin pointer that flicks across a paper scale when current flows. Inside is exactly this: an N-turn coil wound on a soft-iron core, hung by a hairspring between two curved magnet poles. Students physically use this device in practical exams and have read its scale without ever knowing why the scale is uniform — that gap is the hook.
**Secondary — the older analog needle meters / an electrician's non-digital multimeter.** The same moving coil, the same swinging needle against an evenly-spaced scale.

(Plain English throughout; no Hinglish. No DC Pandey example, figure, sequence, or phrasing imported.)

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 9 states of §2 (STATE_1 … STATE_9).

**(b) Symbol-label table** — every element the narration names. Full element id = the `visible_elements` token. Label id convention = `<element_id>_label`. Non-ASCII glyphs emitted as `\uXXXX` in renderer source (φ = `φ`, τ = `τ`, θ = `θ`).

| Quantity / element | Label | Host element id | Unit | Expression / behaviour |
|---|---|---|---|---|
| North pole piece (concave) | `N` | `mcg_pole_n` | — | static; reshapes flat→concave at STATE_4 |
| South pole piece (concave) | `S` | `mcg_pole_s` | — | static; reshapes flat→concave at STATE_4 |
| Soft-iron core | "soft iron" | `mcg_core` | — | static cylinder; brightens at STATE_4 (no size change) |
| The N-turn coil | `N turns` | `mcg_coil` | — | rotates by φ about the suspension axis |
| Current-flow dots | `I` | `mcg_current_dot` | A | dot speed ∝ I; up left, down right |
| Hairspring | `k` | `mcg_spring` | N·m/rad | winds by φ from STATE_5 |
| Pointer / needle | `φ` | `mcg_pointer` | deg | angle = φ_deg |
| Uniform calibrated scale | (evenly-spaced ticks) | `mcg_scale_uniform` | — | linear ticks; STATE_7+ only |
| Crowded scale | (bunched ticks) | `mcg_scale_crowded` | — | sinθ-spaced ticks; STATE_3 (+ small recall S7) |
| Gap field arrows | `B` | `mcg_field_arrow` | T | straight (S1–S3) → radial (S4+); length ∝ B |
| Force on left side | `F` | `mcg_force_left` | N | length ∝ F = NBIL; into page; STATE_2+ |
| Force on right side | `F` | `mcg_force_right` | N | length ∝ F = NBIL; out of page; STATE_2+ |
| Deflecting torque | `τ = NIAB` | `mcg_tau_deflect` | N·m | length ∝ NIAB (S3: ∝ NIAB·sinθ); suspension axis |
| Restoring spring torque | `τ = kφ` | `mcg_tau_spring` | N·m | length ∝ kφ; opposite `mcg_tau_deflect`; S5+ |
| ΣF = 0 badge | `ΣF = 0` | `mcg_sigma_f_zero` | — | text sprite; STATE_2 |
| Force RHR triad | I / B / F | `mcg_rhr_guide` | — | world-space I/B/F arrow triad; STATE_2 only |

**On-canvas equations (gated to state — do NOT pre-spoil):** S2 `F = NBIL`, `τ = NIAB`, `ΣF = 0` · S3 `τ = NIAB·sinθ` · S4 `τ = NIAB` (beside dimmed S3 form) · S5 `τ_spring = kφ` · S6 `NIAB = kφ` · S7 `φ = (NAB/k)·I` · S8 `φ/I = NAB/k`.

**(c) RHR / force plan:** ONE direction-teaching site — **STATE_2, the BIL force couple**. Current up left (I = +ŷ), radial field across the gap (B = +x̂ toward core) → `F = I L × B` = into page (−ẑ); right side current down (I = −ŷ) → F out of page (+ẑ); the two form the couple. det = +1. Via the `rhr-ibf-triad` (left + right), shown AFTER the predict pause, force arrow fading in as *confirmation*.

**(d) Motion plan** (every state moves):
- **S1:** `mcg_current_dot` march; pointer at zero; otherwise static.
- **S2:** dots flow; `mcg_force_left/right` grow; `mcg_sigma_f_zero` badge; `mcg_tau_deflect` grows; coil makes a small turn.
- **S3:** coil deflects under uniform field; forces + `mcg_tau_deflect` shrink with sinθ; `crowded_scale` reveals `mcg_scale_crowded`; `current_step` steps I equally → unequal swings.
- **S4:** `radial_morph` (straight → radial, ~1.2 s); poles reshape concave; core brightens; coil rotates with force arrows holding full length; `mcg_tau_deflect` constant. reveal_hold end pose.
- **S5:** `spring` — `mcg_spring` winds; `mcg_tau_spring` grows ∝ φ.
- **S6:** `settle_phi` — coil damped-settles to φ_eq (~1.5–2 s); torque arrows equalise; pointer lands on a tick.
- **S7:** `current_step` on `mcg_scale_uniform` — pointer steps in EQUAL increments; contrast with recalled crowded scale.
- **S8:** sensitivity sweep — vary N/A/B/k; pointer swings further/shorter for the same I.
- **S9:** sliders live (I, N, B, A, k); **idle auto-sweep on I** so the headless EYE frame isn't static; render full immediately, track sliders live.

**(e) Modes:** Conceptual ONLY. No `mode_overrides`, no `epic_c_branches`, no authored deep-dive child sims.

**(f) Assessment (6 Q) + coverage_map + per-state `misconception_watch`:**

| q_id | Tested idea | Correct answer | `teaches_state` | difficulty |
|---|---|---|---|---|
| Q1 | Net force vs torque on the coil | ΣF = 0, but τ = NIAB (a couple — turns, does not slide) | STATE_2 | core |
| Q2 | Why is a *uniform*-field meter's scale non-uniform? | τ = NIAB·sinθ → equal steps give unequal swings | STATE_3 | core |
| Q3 | What does the radial field achieve? | Sides stay ⊥ B at every angle → τ = NIAB, independent of deflection | STATE_4 | core (aha) |
| Q4 | At what deflection does the coil rest? | Where NIAB = kφ | STATE_6 | core |
| Q5 | Deflection vs current → why uniform scale | φ = (NAB/k)·I — linear, evenly spaced | STATE_7 | core (aha) |
| Q6 | Current sensitivity & how to increase it | φ/I = NAB/k; raise N, A, B, or lower k | STATE_8 | stretch |

`coverage_map.by_state`: `{STATE_2:[Q1], STATE_3:[Q2], STATE_4:[Q3], STATE_6:[Q4], STATE_7:[Q5], STATE_8:[Q6]}`. `non_assessed_states`: `[STATE_1, STATE_5, STATE_9]`. ≥1 question hits each aha state (Q3 → S4, Q5 → S7) ✓.

---

## Block 1 — Pass-1 strategic checklist

1. **Prerequisite cliffs.** Both at STATE_2: `torque_on_current_loop_in_field` (why two forces produce a turn with no slide — patch: *"Two equal-opposite forces on different lines form a couple — zero net force, pure torque τ = NIAB"*) and `force_on_current_carrying_wire` (each side feels F = BIL — patch: *"Each side carries current I across the field; force on length L is F = BIL, with N turns F = NBIL"*). Both patches sit inside STATE_2.
2. **JEE/NEET-backwards trace.** *"N = 50 turns, A = 2×10⁻⁴ m², radial B = 0.2 T, k = 4×10⁻⁷ N·m/rad. (i) current sensitivity? (ii) why linear scale? (iii) how to double sensitivity?"* → τ = NIAB (S2/S4), radial removes angle dependence (S4), restoring kφ (S5), equilibrium (S6), sensitivity NAB/k (S8), linear scale (S7), "double it" (S8). Every piece delivered.
3. **Misconception entry mapping.** M1→S2, M2→S3, M3→S4, M4→S5, M5→S6, M6→S7, M7→S8. **Planting points:** STATE_3 plants "any field gives a proportional reading / the scale is just crowded" (M2/M6); STATE_4 breaks it; STATE_7 pays it off. No EPIC-C branch.

---

## Block 2 — Aha designation

- **PRIMARY — STATE_4:** *"A radial field keeps the coil's sides square to B at every angle, so the torque never fades — it stays NIAB."* Inside `foundational` (S1→S7) → ✓.
- **SUPPORTING — STATE_7:** *"Constant torque makes deflection exactly proportional to current — that is why the scale is uniform."* The direct receipt of S4's constant torque.
- **Cohesion:** S7 is the consequence of S4 — cohesive (no third aha).
- **Wrong-belief setup states:** STATE_3 (the sinθ trap + crowded scale) earns both ahas; STATE_2 (the couple) is the secondary setup feeding S4.

---

## 12. Renderer-primitives FLAGs (engine work — founder-sanctioned, BEFORE json_author)

NEW field_3d scenario `moving_coil_galvanometer` (archetype C extension). Build to this list:

1. **New scenario dispatch** — `buildMovingCoilGalvanometer()` builder (analogue of `buildTorqueLoopInField`), `applyMovingCoilGalvanometerState(stateDef)`, `updateMovingCoilGalvanometerFrame(dt)`, `applyMovingCoilGalvanometerGlow()`. Reuse from archetype C: coil group + current-flow dots (`mcg_current_dot`), force-pair arrows (`mcg_force_left/right`), the `rhr-ibf-triad` (`mcg_rhr_guide`), the ΣF=0 sprite (`mcg_sigma_f_zero`), the world-frame torque vector (`mcg_tau_deflect`).
2. **New device primitives:** `mcg_pole_n`/`mcg_pole_s` (flat→concave reshape), `mcg_core` (soft-iron cylinder inside coil), `mcg_spring` (hairspring that winds), `mcg_pointer` + `mcg_scale_uniform` + `mcg_scale_crowded`, `mcg_field_arrow` (straight↔radial morph), `mcg_tau_spring` (opposing torque vector).
3. **Four NEW `extras` choreographies** (JSON-declared, renderer-implemented, `deriveStateMeta`-recognised): `radial_morph` (S4, reveal_hold), `spring` (S5), `settle_phi` (S6, damped settle to φ_eq), `crowded_scale` (S3) + `current_step` (S3 + S7).
4. **Slider postMessage** — S9 sliders for I, N, B, A, k drive a live `φ_deg = (NAB/k)·I` + `S_I = NAB/k` readout; explorer pattern (Rule 27); idle auto-sweep on I; render full immediately, track sliders live.
5. **`deriveStateMeta.ts` registration in the SAME change.**
6. **`pvl_colors` MUST include `"background": "#0A0A1A"`.** Colours: N pole `#EF4444`, S pole `#3B82F6`, coil `#FFD54F`, current dots `#FFAB40`, forces `#66BB6A`, `mcg_tau_deflect` `#E879F9`, `mcg_tau_spring` `#34D399`, field arrows `#42A5F5`, core grey `#9CA3AF`.
7. **Rule 29** — emphasis is brightness only; `mcg_core` brightens at S4 but does NOT scale; `mcg_force_*` hold full length through S4's rotation (magnitude constant), shrink in S3 (magnitude really falls with sinθ).
8. **Eight registration sites** (root §6); route via `assembleField3DHtml` (engine `threejs`). PCPL_CONCEPTS = N/A.

---

## Open issues for physics_author

1. **Verified numeric defaults/ranges** so default deflection lands readable (~20–40°). Suggested (verify): N=100 (20–300), A=2×10⁻⁴ m², B=0.2 T (0.05–0.5), k=4×10⁻⁷ N·m/rad, I in **µA** (default ~50 µA, full-scale ~100 µA → φ ≈ 0.5 rad ≈ 28°).
2. **Expose `A` directly as a slider** (recommend A as one area knob; mention A=L·b in narration only).
3. **Define the S3 uniform-field angle convention** so the crowded-scale tick spacing is a real non-linear mapping (give tick positions).
4. **Damping spec for `settle_phi` (S6):** ~1.5–2 s visual settle to φ_eq = (NAB/k)·I (no real ODE needed).
5. **TTS v3 standalone-symbol formatting** + confirm every `pause_after_ms` (S2:3000, S3:3500, S4:3500, S5:3000, S6:3000, S7:3000, S8:3000) carried into the reveal timeline.
