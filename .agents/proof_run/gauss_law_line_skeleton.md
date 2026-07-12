# Architect skeleton — `gauss_law_line`

> **[VINTAGE — pre-Rule-31/35 architecture (Socratic beats, Indian anchors, EPIC-C). Historical record only — never clone.]**

> **[OLD MODEL — superseded by Rule 31, 2026-07-02.]** This exemplar predates the straightforward +
> per-state-contextual-controls doctrine: it uses Socratic predict→reveal pacing, `wait_for_answer` /
> `pause_after_ms` beats, and/or "sliders in the last state only". Do NOT clone its pacing or control
> placement for new concepts — clone `faraday_law_induction_skeleton.md` instead. Physics content and
> structure remain valid reference.

**Concept:** Gauss's Law — Infinite Line Charge · **chapter:** Class 12, Electric Charges & Fields (Ch.1) §1.15 · **renderer:** `field_3d` (new `gauss_law_line` scenario) · **schema:** v2.3 · Authored 2026-06-26.

**Status:** Pass-1 v2.3 skeleton. CONCEPTUAL-ONLY (Rule 20 suspension — no `mode_overrides`). EPIC-L-first (Rule 11 / 2026-06-10 directive — no `epic_c_branches`; misconceptions confronted inside EPIC-L via Rule 16a). Third Gauss-application sibling after `gauss_law_sphere` (1/r²) and `gauss_law_solid_sphere` (ramp-then-1/r²); this is the **cylindrical-symmetry / 1/r** member of the family.

**DC Pandey check:** Consulted Ch.1 (Electric Charges & Fields) table of contents to confirm the infinite-line-charge case sits under §1.15 "applications of Gauss's law." No teaching sequence, no example problem, no figure reference imported. All pedagogy authored from first principles. Indian anchor sourced from NCERT-context familiarity, not from any worked example.

---

## 1. Atomic claim

This concept teaches that **for an infinite line of uniform linear charge density λ, cylindrical symmetry plus a coaxial Gaussian cylinder give Φ = E·(2πrL) = λL/ε₀ ⇒ E = λ/(2πε₀r) — a field that is purely radial, perpendicular to the line, independent of position along the line, and that falls off as 1/r (slower than a point charge's 1/r²).** It does **not** cover: the Gauss *statement* Φ = q_enc/ε₀ (deferred to `gauss_law`), the open-surface flux definition Φ = E·A (deferred to `electric_flux`), the meaning of λ itself (deferred to `charge_distribution`), the spherical-shell or solid-sphere cases (`gauss_law_sphere` / `gauss_law_solid_sphere`), the infinite-plane/sheet case, finite-line end-effects, or the field of a charged conducting cylinder with a hollow interior.

One student question: *"How does the electric field around a long charged wire fall off as you walk away from it — and why isn't it 1/r² like a point charge?"*

---

## 2. State count + arc

**State count: 7** (matches the sibling `gauss_law_sphere` and the founder-locked decision). The concept carries one new derivation route (cylindrical symmetry → coaxial cylinder), two non-obvious sub-results (end-caps carry zero flux; L cancels), and one headline counter-intuitive falloff (1/r not 1/r²).

| # | state_id | Title (one-line content) | Purpose | `teaching_method` | `advance_mode` |
|---|---|---|---|---|---|
| 1 | STATE_1 | "A long charged wire — how does E fall off with r?" | **Hook + plant the 1/r² instinct.** Infinite vertical line + λ "+" markers alone. Pose the falloff question. ∝ form ONLY — no ε₀, no λ/2πε₀r. | `narrative_socratic` | `wait_for_answer` |
| 2 | STATE_2 | "Same strength all around: the field is purely radial" | Cylindrical symmetry → field is radial, ⊥ to the line, equal magnitude on a ring at distance r. Confronts "points along the wire / toward nearest point." | `narrative_socratic` | `auto_after_tts` |
| 3 | STATE_3 | "Choose a coaxial Gaussian CYLINDER (radius r, height L)" | Why a cylinder, not a sphere: it matches the symmetry — E constant & ⊥ on the curved wall. Folds in "must integrate Coulomb dE" (Gauss replaces it). | `derivation_first_principles` | `manual_click` |
| 4 | STATE_4 | "The two flat end caps carry ZERO flux" | E is parallel to the caps ⇒ E·dA = 0; only the curved side carries flux. Predict→reveal. Confronts "the end caps carry flux too." | `narrative_socratic` | `wait_for_answer` |
| 5 | STATE_5 | "Φ = E·(2πrL) = λL/ε₀ ⇒ E = λ/(2πε₀r); L cancels" | The derivation write-in; the L visibly cancels (answer is independent of the length of wire you take). | `derivation_first_principles` | `manual_click` |
| 6 | STATE_6 | "1/r, NOT 1/r²: the line falls off slower than a point charge" | **PRIMARY aha.** E-vs-r plot showing 1/r, faint 1/r² point-charge ghost for contrast. Confronts "it falls as 1/r² like a point charge." | `compare_contrast` | `manual_click` |
| 7 | STATE_7 | "Explore: tune λ and r, watch the radial arrows rescale as 1/r" | Final interactive. λ and r sliders, live E readout, ring arrows rescale as 1/r. | `exploration_sliders` | `interaction_complete` |

**advance_mode variety (Rule 15):** four distinct values — `wait_for_answer` (1,4), `auto_after_tts` (2), `manual_click` (3,5,6), `interaction_complete` (7). ≥2 required → PASS.

**Primitives per state (Rule 19, ≥3):** every state carries the line charge + λ markers + ≥1 vector/label group, most carry 4–5. Cognitive limits inherited from siblings: `max_primitives_per_state: 5`, `max_labels_per_state: 3`, `max_words_per_tts_sentence: 30`.

**Interactivity rule:** sliders / `interaction_complete` only in STATE_7 (last state). No `sliders:true` in STATE_1–6.

### Engine-scar conformance (architect-owned `directive` rows)

| `bug_class` (directive) | How this skeleton satisfies it |
|---|---|
| `teach_concrete_before_abstract_compare` | STATE_6: the point charge's **1/r² ghost** (the simpler, already-known case) is drawn first/faint, then the line's **1/r** curve is laid beside it, then the contrast is highlighted. |
| `teach_coordinate_sim_with_graph` | STATE_6 drives ONE live parameter — the cylinder/field-point radius r — that moves both the 3D ring-arrow lengths AND the tracking dot on the E-vs-r plot in lockstep (`coordinated_sweep`). |
| `teach_distinct_reference_lines_for_two_radii` | The two radius-like quantities are **r (perpendicular, line→field point)** and **L (axial, the cylinder height)**. Both drawn as separate, clearly-labelled reference lines (r billboarded camera-right; L axial). |
| `teach_visual_must_match_narration` | STATE_2 "same all around" = a full ring of equal-length arrows; STATE_4 "caps carry zero flux" = grazing cap arrows + "Φ=0" tags vs piercing wall arrows; STATE_5 "L cancels" = the L symbol visibly struck; STATE_6 "slower than 1/r²" = the two curves diverge on screen. |
| `teach_do_not_prespoil_a_later_reveal` | STATE_1 shows the **∝ form only**, NO ε₀, no λ/2πε₀r. ε₀ and the solved formula first appear in STATE_5; the 1/r verdict in STATE_6. |

---

## 3. Within-state choreography plan (Socratic reveal)

**STATE_1 — Hook:**
- t=0: infinite vertical line + a ladder of "+" λ markers along it. No field arrows, no formula.
- TTS s1_1: introduces the long charged wire (HT line anchor).
- TTS s1_2 (planted-instinct question): "As you walk away from the wire, how does the field weaken with distance r — and what's your first guess for the law?" — **the ∝ form only on canvas; NO ε₀.**
- `pause_after_ms ≈ 2600` after s1_2.
- No reveal primitive fires in STATE_1; resolution deliberately withheld to STATE_5/STATE_6.

**STATE_2 — radial-field reveal:**
- t=0: line + λ markers; one field point P marked on a ring at distance r.
- TTS s2_1 (prediction): "Point at P — which way does E point? Along the wire, toward the nearest bit of wire, or straight out from the line?"
- pause for prediction.
- **Reveal (reveal_at_tts_id = s2_2):** horizontal **ring of ~12 equal-length radial arrows** arises at distance r; the labelled `r`⊥ reference line grows in live when "distance r" is said.
- TTS s2_3 (explanation): the wire looks identical from every direction and is infinite, so E must be radial and equal in magnitude all around the ring.

**STATE_3 — Gaussian-cylinder reveal:**
- t=0: line + ring arrows (carryover, faded).
- TTS s3_1 (prediction): "Sphere, or cylinder — which one matches this shape?"
- pause.
- **Reveal (s3_2):** the **coaxial Gaussian cylinder** (wall + wireframe + two end caps in a distinct cap colour) fades in; the labelled `L`∥ axial reference line grows in when "height L" is said.
- TTS s3_3: a cylinder matches cylindrical symmetry — on the curved wall E is constant & ⊥, so flux through the wall is E times the wall area. Fold-in: Gauss + symmetry replaces the dq-by-dq Coulomb sum.

**STATE_4 — end-cap zero-flux reveal:**
- t=0: line + cylinder (wall + caps) + ring arrows.
- TTS s4_1 (prediction): "The cylinder has three pieces — the curved wall and two flat end caps. Which pieces does the field actually pierce?"
- `pause_after_ms ≈ 2800`.
- **Reveal (s4_2):** on the two end caps, arrows drawn **grazing (parallel)** + "Φ = 0" tag on each; on the curved wall, arrows **pierce** ⊥.
- TTS s4_3: E is radial, so it lies in the plane of each flat cap — E·dA = 0; only the curved side carries flux. Φ_total = Φ_wall = E·(2πrL).

**STATE_5 — derivation reveal:**
- t=0: cylinder + wall-flux expression Φ = E·(2πrL) carried from STATE_4.
- TTS s5_1: enclosed charge on length L is q_enc = λL; by Gauss, Φ = λL/ε₀. **ε₀ first appears here.**
- TTS s5_2 (prediction): "Set the two expressions for Φ equal and solve for E. Watch what happens to L."
- pause.
- **Reveal (s5_3):** write-in panel writes Φ = E·(2πrL) = λL/ε₀, then **L visibly cancels** on both sides, leaving E = λ/(2πε₀r).
- TTS s5_4: the L cancels — the answer doesn't depend on how long a piece of wire you enclosed.

**STATE_6 — PRIMARY aha:**
- t=0: E = λ/(2πε₀r) carried; cylinder small (r small); plot axes drawn, curves empty.
- TTS s6_1 (concrete-first): "You already know a point charge falls off as 1/r² — here's that curve, faint." — the **1/r² ghost** draws first, alone, faint.
- TTS s6_2 (prediction that breaks the instinct): "Back in the first state you probably guessed the wire falls off the same way. Does it? Watch as r grows."
- pause.
- **Reveal (s6_3):** the **1/r line curve** draws in beside the ghost AND the live `coordinated_sweep` begins — as r grows in 3D, ring arrows shrink as 1/r and the tracking dot rides the 1/r curve in lockstep.
- TTS s6_4: the line's curve sits *above* the point charge's — it falls off **slower**, as 1/r, because the Gaussian cylinder's area (2πrL) grows *linearly* with r, while a sphere's 4πr² grows *quadratically*.

**STATE_7 — Exploration:**
- t=0: line + ring arrows + λ slider + r slider + live E readout + the 1/r plot visible.
- TTS s7_1: "Now you drive. Push λ up — every arrow on the ring grows together."
- TTS s7_2: "Drag r out — the arrows shrink as 1/r, and the readout falls off along the curve."
- TTS s7_3: "Notice E never depends on where along the wire you stand — only on λ and your perpendicular distance r."
- Sliders render at full immediately and track live.

---

## 4. Misconception confrontation plan (Rule 16a)

EPIC-C branches **OMITTED**. All four wrong beliefs confronted proactively inside EPIC-L via per-state `misconception_watch` + predict→reveal.

| # | Wrong belief | EPIC-L state | `visual_counter` (intent) | Predict→reveal |
|---|---|---|---|---|
| 1 | **"It falls off as 1/r² like a point charge."** (PRIMARY) | **STATE_6** | The line's 1/r curve sits visibly above the point charge's 1/r² ghost — same start, slower decay. | s6_2 asks student to recall STATE_1 guess; s6_3 reveals diverging curves. |
| 2 | **"The flat end caps carry flux too."** | **STATE_4** | Grazing arrows on each cap + "Φ=0" tags, vs piercing arrows on the curved wall. | s4_1 "which pieces does the field pierce?"; s4_2 reveals grazing caps + piercing wall. |
| 3 | **"The field points along the wire / toward the nearest point."** | **STATE_2** | A full ring of equal-length arrows pointing straight out (radial, ⊥). | s2_1 "along the wire, toward the nearest bit, or straight out?"; s2_2 reveals the radial ring. |
| 4 | **"You must integrate Coulomb's dE from every dq."** | folded into **STATE_3** (setup) **+ STATE_5** (payoff) | STATE_3: one coaxial cylinder replaces the dq-by-dq sum; STATE_5: one line of algebra yields E. | STATE_3 s3_1 "wrap one surface, not sum pieces"; STATE_5 s5_2 collapses to one equation. |

**Rule 16a planting check:** STATE_1's question deliberately plants misconception #1 (the 1/r² instinct) — intended (an earned wrong belief the PRIMARY aha breaks), resolved at STATE_6. No state plants #2/#3/#4 inadvertently (STATE_3 defers any cap-flux claim to STATE_4).

---

## 5. `has_prebuilt_deep_dive` states (cache hint, NOT UI gate — Rule 18)

1. **STATE_4** — the end-cap zero-flux step (most-skipped line).
2. **STATE_5** — the derivation + L-cancellation step ("where did L go").
3. **STATE_6** — the 1/r-vs-1/r² PRIMARY-aha state.

All three remain effectively `false`-routing for V1 ship (button → feedback form).

---

## 6. Drill-down clusters

**STATE_4 (end-cap zero flux):**
- `why_caps_zero_flux`, `e_parallel_to_cap`, `only_curved_side`

**STATE_5 (derivation + L cancels):**
- `where_did_L_go`, `q_enc_is_lambda_L`, `infinite_wire_assumption`

**STATE_6 (1/r vs 1/r²):**
- `why_1_over_r_not_r_squared`, `area_grows_linearly`, `line_vs_point_falloff`

(physics-author fleshes out `trigger_examples`, 3–5 phrasings each. Clusters seeded via `supabase_2026-06-26_seed_gauss_law_line_clusters_migration.sql`. SQL ships 1 cluster per hard state — the founder-locked subset: pick the strongest cluster from STATE_4/5/6.)

---

## 7. `entry_state_map`

```yaml
entry_state_map:
  foundational: [STATE_1, STATE_2, STATE_3, STATE_4, STATE_5, STATE_6]
  exploration:  [STATE_7]
```

PRIMARY aha = STATE_6 ∈ `foundational` (no exit-pill needed). Aspect vocabulary to register: `foundational`, `exploration`.

---

## 8. Prerequisites

```yaml
prerequisites:
  - gauss_law             # the STATEMENT Φ = q_enc/ε₀
  - electric_flux         # Φ = E·A through a closed surface
  - charge_distribution   # linear charge density λ (C/m)
```

All three shipped, gold-standard field_3d siblings. Advisory only (Rule 23).

---

## 9. Real-world anchor

**Primary:** the long high-tension overhead transmission line strung between steel towers across the countryside — a single straight conductor running for kilometres. To a probe held a few metres away, that line is effectively infinitely long and uniformly charged. The reason engineers can predict the field near it with one clean formula, E = λ/(2πε₀r), is cylindrical symmetry + Gauss's law. **Secondary:** a long thin charged metal rod in the lab, or the tall charged column of a Van de Graaff generator — near the middle, away from the ends, the field points straight out and weakens as 1/r.

Plain English throughout; no Hinglish, no figure references, no DC Pandey / HC Verma phrasing.

---

## 10. Definition of Done (Gate 0)

### (a) Every EPIC-L state by id + content — see §2 table.

### (b) Symbol-label table

| Quantity | On-canvas label | First appears |
|---|---|---|
| Linear charge density | `λ` ("+" markers) | STATE_1 |
| Perpendicular distance | `r` (billboarded camera-right line) | STATE_2 |
| Field magnitude | `E` (∝ form STATE_2, formula STATE_5) | STATE_2 |
| Field direction | `r̂` ("E ∥ r̂" label) | STATE_2 |
| Cylinder axial height | `L` (axial line) | STATE_3 |
| Curved-wall area | `2πrL` | STATE_3/4 |
| Flux through caps | `Φ = 0` (cap tag) | STATE_4 |
| Permittivity | `ε₀` | STATE_5 (NEVER earlier) |
| Enclosed charge | `q_enc = λL` | STATE_5 |
| Solved field | `E = λ/(2πε₀r)` | STATE_5 |
| Contrast | `1/r²` ghost, `1/r` line | STATE_6 |

### (c) RHR plan: **N/A** — radial electrostatic field, no cross-product direction. Sign of λ sets arrow direction (outward +λ / inward −λ) + per-sign colour. Documented absence, not omission.

### (d) Motion plan — every state animates:
STATE_1 markers populate + question writes; STATE_2 ring arises + r line grows; STATE_3 cylinder fades in + L line grows; STATE_4 grazing-cap vs piercing-wall contrast animates; STATE_5 derivation writes in + L cancels; STATE_6 ghost-then-line draw + coordinated_sweep; STATE_7 slider-driven, renders at full immediately. Guided states `reveal_hold`; STATE_7 `interactive` + idle auto-sweep.

### (e) Modes: **Conceptual-only.** No `mode_overrides`.

### (f) assessment + coverage_map + misconception_watch:
- **assessment:** 6 questions. Q1 → E = λ/(2πε₀r) (`STATE_5`); Q2 → field radial/⊥ (`STATE_2`); Q3 → only curved wall / caps Φ=0 (`STATE_4`); Q4 → **1/r not 1/r² PRIMARY aha** (`STATE_6`); Q5 → force ratio 2:1 at r₁ vs 2r₁ (`STATE_6`); Q6 → L cancels / field independent of enclosed length (`STATE_5`). Each with `distractor_misconceptions`, `teaches_state`, `parallel_form_stem`, `difficulty`.
- **coverage_map:** by_state covers STATE_2, STATE_4, STATE_5, STATE_6; non_assessed_states: [STATE_1, STATE_3, STATE_7].
- **misconception_watch:** one entry per state STATE_1–STATE_6.

No TBDs.

---

## Block 2 — Aha designation

**PRIMARY aha (STATE_6):** "The field of a long charged wire falls off as 1/r, NOT 1/r² like a point charge — it dies away slower — because the Gaussian cylinder's area (2πrL) grows only linearly with r, while a sphere around a point grows as 4πr²."

**SUPPORTING aha (STATE_4):** "The end caps carry exactly zero flux — the field grazes them — so the derivation reduces to just the curved side." Causally linked: caps-zero-flux ⇒ area = 2πrL ⇒ 1/r falloff. 1 PRIMARY + 1 SUPPORTING = sweet spot.

**Wrong-belief setup states:** STATE_1 → STATE_6 (planted 1/r² guess); STATE_3 → STATE_4 ("closed surface means flux crosses all of it").

**Foundational-coverage:** STATE_6 ∈ foundational. PASS.

---

## Handoff to physics-author

- `physics_engine_config.variables`: `lambda`, `r`, `L`, `epsilon_0`, `k`, `DEMO_E_PER_NC` (mirror `gauss_law_sphere` demo-scaling).
- `computed_outputs`: `E_demo = DEMO_E_PER_NC * lambda / r` (1/r, clamp r ≥ 0.05); `E_real = (lambda*1e-9)/(2*PI*epsilon_0*r)`; `q_enc = lambda * L`; `flux_check = (lambda*1e-9*L)/epsilon_0`; `point_charge_ghost = DEMO_E_PER_NC * lambda / (r*r)` (STATE_6 contrast).
- `formulas`: gauss_law Φ = q_enc/ε₀; symmetry_reduction Φ = E·(2πrL); enclosed_charge q_enc = λL; set_equal E·(2πrL) = λL/ε₀; L_cancels E·(2πr) = λ/ε₀; solved_field E = λ/(2πε₀r); falloff E ∝ 1/r (contrast point ∝ 1/r²); direction radially outward for +λ, ⊥ to line, independent of axial position.
- `constraints`: E radial & ⊥; |E| constant on a coaxial ring; caps carry zero flux; E independent of L and axial position; E ∝ 1/r (NOT 1/r²).
- Per-state reveal timeline `at_ms` tuned to each TTS beat; per-state `misconception_watch` text (§4) + `pause_after_ms` on STATE_1 (s1_2 ≈ 2600), STATE_4 (s4_1 ≈ 2800) — **carry every pause into the JSON**.
- 6-question `assessment` + `coverage_map` per §10(f).
- Drill-down trigger phrases (3–5 each) for §6 clusters.
- `field_3d_config`: `scenario_type: "gauss_law_line"`, `explorer_id: "gauss_line_explorer"`, per-state `gauss_line` blocks, `slider_controls.lambda` + `slider_controls.r_gauss` — per the renderer design in the approved plan + `gauss-infinite-line-charge-mellow-alpaca-agent-abef94b93daf70184.md` §4.
