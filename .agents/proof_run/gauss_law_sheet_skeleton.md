# Architect skeleton — `gauss_law_sheet`

> **[VINTAGE — pre-Rule-31/35 architecture (Socratic beats, Indian anchors, EPIC-C). Historical record only — never clone.]**

> **[OLD MODEL — superseded by Rule 31, 2026-07-02.]** This exemplar predates the straightforward +
> per-state-contextual-controls doctrine: it uses Socratic predict→reveal pacing, `wait_for_answer` /
> `pause_after_ms` beats, and/or "sliders in the last state only". Do NOT clone its pacing or control
> placement for new concepts — clone `faraday_law_induction_skeleton.md` instead. Physics content and
> structure remain valid reference.

**Concept:** Gauss's Law — Infinite Charged Sheet · **chapter:** Class 12, Electric Charges & Fields (Ch.1) §1.15 · **renderer:** `field_3d` (new `gauss_law_sheet` scenario, ~88% copy-adapt of `gauss_law_line`) · **schema:** v2.3 · Authored 2026-06-26.

**Status:** Pass-1 v2.3 skeleton. CONCEPTUAL-ONLY (Rule 20 — no `mode_overrides`). EPIC-L-first (no `epic_c_branches`; Rule 16a). Fourth Gauss-application sibling after `gauss_law_sphere` (1/r²), `gauss_law_solid_sphere` (ramp) and `gauss_law_line` (cylindrical / 1/r); this is the **planar-symmetry / CONSTANT-field** member. It is the deliberate planar counterpart of `gauss_law_line`: the flux is **INVERTED** (caps carry it, wall is zero) and the field is **CONSTANT** (no falloff — the trilogy payoff against 1/r and 1/r²).

**Load-bearing scar:** `teach_inverted_scenario_inverts_cutline_flags` — because the sheet INVERTS the line, the renderer must invert the line's cut-line flags: a **flat** E-vs-distance plot (not a 1/r curve), **caps** flagged flux-bearing (not the wall), a `show_constant_field` framing. Blind-cloning `gauss_law_line` would draw a falling curve + a flux-bearing wall — both wrong. Also flagged: amperes-review classes (STATE_7 must move geometry not just a readout; STATE_5/6/7 must not occlude the pillbox).

---

## 1. Atomic claim

For an infinite plane of uniform surface charge density σ, planar symmetry + a Gaussian **pillbox** (a short cylinder piercing the sheet, caps parallel to the sheet on each side) give Φ = E·A + E·A = 2EA = σA/ε₀ ⇒ **E = σ/(2ε₀)** — perpendicular to the sheet, pointing away on BOTH sides, equal everywhere, and **independent of distance (constant)**; the ½ comes from flux leaving through BOTH caps. Does NOT cover: the Gauss statement (`gauss_law`), flux def (`electric_flux`), σ itself (`charge_distribution`), the line/sphere cases, or the σ/ε₀ conductor-surface / between-two-plates case (the NEXT concept), edge effects, or potential.

Student question: *"How does the field of a big charged flat sheet change as you walk away — and why doesn't it weaken like a point charge or a wire?"*

---

## 2. State count + arc

**State count: 7.**

| # | state_id | Title | Purpose | `teaching_method` | `advance_mode` |
|---|---|---|---|---|---|
| 1 | STATE_1 | "A big charged sheet — how does E change as you walk away?" | Hook + plant the falloff instinct. Sheet + σ markers alone. ∝ form ONLY — no ε₀. | `narrative_socratic` | `wait_for_answer` |
| 2 | STATE_2 | "Straight out on BOTH sides: perpendicular and uniform" | Planar symmetry → E ⊥ sheet, away both sides, same everywhere. Confronts "points along the sheet." | `narrative_socratic` | `auto_after_tts` |
| 3 | STATE_3 | "Choose a Gaussian PILLBOX piercing the sheet" | Caps ∥ sheet (⊥ E), wall ⊥ sheet (∥ E). Why a pillbox matches planar symmetry. | `derivation_first_principles` | `manual_click` |
| 4 | STATE_4 | "The curved WALL carries ZERO flux — only the two CAPS" | E grazes the wall; only caps pierced. Predict→reveal. SUPPORTING aha. INVERSE of the line. | `narrative_socratic` | `wait_for_answer` |
| 5 | STATE_5 | "Φ = 2EA = σA/ε₀ ⇒ E = σ/(2ε₀); A cancels, ½ = two caps" | Derivation; A cancels; the ½ flagged (σ/2ε₀ ≠ σ/ε₀). | `derivation_first_principles` | `manual_click` |
| 6 | STATE_6 | "CONSTANT: the field that never dies — flat line vs 1/r & 1/r² ghosts" | PRIMARY aha. Flat E-line above falling ghosts. Confronts "weakens with distance." | `compare_contrast` | `manual_click` |
| 7 | STATE_7 | "Explore: tune σ and distance — watch E stay constant" | σ + distance sliders; move field point away, E + arrows STAY CONSTANT; σ scales them. | `exploration_sliders` | `interaction_complete` |

**advance_mode variety (Rule 15):** 4 distinct — wait_for_answer (1,4), auto_after_tts (2), manual_click (3,5,6), interaction_complete (7). PASS. **Primitives ≥3/state. Sliders only in STATE_7.**

### Engine-scar conformance
- `teach_concrete_before_abstract_compare`: STATE_6 draws the known 1/r² + 1/r ghosts first/faint, then the sheet's flat line above.
- `teach_coordinate_sim_with_graph`: STATE_6 drives ONE distance d through both the 3D arrow position AND the plot dot; sheet dot rides flat while ghosts fall; arrow length holds constant.
- `teach_distinct_reference_lines_for_two_radii`: `d` (perpendicular distance) vs the pillbox half-height — two distinct labelled lines; area A labelled on the cap, never confused with a distance.
- `teach_visual_must_match_narration`: both-sides equal arrows (S2); grazing wall + "Φ=0" vs piercing caps (S4); A struck (S5); flat line holds while ghosts fall (S6); arrows DON'T shrink as d slides (S7).
- `teach_do_not_prespoil_a_later_reveal`: ∝ form only in S1; ε₀ + formula first at S5; "constant/no falloff" verdict at S6.
- `teach_show_quantity_live_when_named`: `d` line grows when "distance" said (S2); `A` label writes when "area A" said (S3); ε₀ only on its beat (S5).
- `teach_color_each_element_by_its_own_sign`: arrows/markers by σ's sign; only the readout follows the net.
- **`teach_inverted_scenario_inverts_cutline_flags` (MOST LOAD-BEARING):** invert the line — (a) flux wall↔caps swap; (b) falloff "constant" not "1/r." Flat plot, caps flux-bearing, `show_constant_field`.
- `teach_dense_frames_for_in_state_ramp`: S6 sweep + S7 slider read at DENSE frames (a frozen end-frame would hide a sheet curve that wrongly droops).

---

## 3. Within-state choreography (Socratic reveal)

**STATE_1 — Hook:** sheet + "+" σ grid at t=0; s1_1 intro (xerox-drum anchor); s1_2 planted question "walk straight out — how does E change? first guess?" (∝/guess only, NO ε₀); `pause_after_ms ≈ 2600`. No reveal — resolution withheld to S5/S6.

**STATE_2 — perpendicular-both-sides:** field point P off one face at distance d. s2_1 prediction "along the surface, slanting toward nearest charge, or straight out?"; pause; reveal (s2_2) equal-length arrows straight out (⊥) on BOTH faces + `d`⊥ line grows when "distance" said; s2_3 infinite + symmetric ⇒ ⊥, both sides, equal everywhere.

**STATE_3 — Gaussian pillbox:** s3_1 "sphere, cylinder-along, or a flat pillbox — which matches?"; pause; reveal (s3_2) pillbox fades in (caps ∥ sheet each side, wall ⊥) + cap area `A` label writes when "area A" said; s3_3 pillbox matches planar symmetry (caps poked straight through, wall grazed); Gauss replaces patch-by-patch Coulomb.

**STATE_4 — wall-zero-flux (SUPPORTING aha; INVERSE of line):** s4_1 "three pieces — wall + two caps. Which does the field pierce?"; `pause_after_ms ≈ 2800`; reveal (s4_2) grazing arrows + "Φ=0" on the wall, piercing arrows on the two caps + explicit callback "with the wire it was the opposite"; s4_3 E ⊥ sheet grazes the wall ⇒ Φ_wall=0; Φ_total = E·A + E·A = 2EA.

**STATE_5 — derivation (confront σ/ε₀ vs σ/2ε₀):** s5_1 q_enc = σA ⇒ Φ = σA/ε₀ (ε₀ FIRST here); s5_2 prediction "set equal, watch A — and where the factor of two lands"; `pause_after_ms ≈ 2500`; reveal (s5_3) write 2EA = σA/ε₀, A visibly cancels, ⇒ E = σ/(2ε₀) with ½ highlighted "two caps"; s5_4 A never mattered; the 2 is real (both caps); single sheet = σ/2ε₀ not σ/ε₀.

**STATE_6 — PRIMARY aha (never dies):** s6_1 concrete-first "point fades 1/r², wire 1/r — here faint" (ghosts draw falling); s6_2 "you guessed the sheet fades too. Does it? Watch as you walk away"; `pause_after_ms ≈ 2800`; reveal (s6_3) flat sheet line draws ABOVE the falling ghosts + `coordinated_sweep` (d grows → arrow length CONSTANT, sheet dot rides flat, ghost dots fall); s6_4 the pillbox encloses the same σA patch however far the caps sit, while a sphere/cylinder keeps growing — the field that never dies.

**STATE_7 — Exploration:** σ slider + distance slider + live E readout + flat plot. s7_1 "push σ — every arrow grows, readout climbs"; s7_2 "drag the field point away — arrows do NOT shrink, readout does NOT move. Constant"; s7_3 "depends only on σ, never on distance." Renders at full immediately; distance slider physically moves the field-point/arrow position; constancy shown by arrow length NOT changing while position does (scar `acl_state8_…`).

---

## 4. Misconception confrontation (Rule 16a)

| # | Wrong belief | State | visual_counter | Predict→reveal |
|---|---|---|---|---|
| 1 | "Field weakens with distance (point 1/r², wire 1/r)." (PRIMARY) | STATE_6 | Flat line holds above falling ghosts; 3D arrow doesn't shrink as d grows. | s6_2 recall S1 guess; s6_3 flat line + falling ghosts. |
| 2 | "The curved wall carries flux too." | STATE_4 | Grazing + "Φ=0" on wall vs piercing caps; wire was the inverse. | s4_1 "which pieces pierced?"; s4_2 grazing wall + piercing caps. |
| 3 | "E = σ/ε₀." (½ dropped) | STATE_5 | 2EA = σA/ε₀ with the 2 = "two caps"; solved σ/(2ε₀); tag σ/ε₀ = conductor/two-plate. | s5_2 "where the factor of two lands"; s5_3 lands the ½. |
| 4 | "Field points along the sheet / toward nearest charge." | STATE_2 | Equal-length arrows straight out, ⊥, both faces. | s2_1 "along, toward, or straight out?"; s2_2 perpendicular both sides. |

**Planting check:** S1 deliberately plants #1 (earned, resolved S6). #3 not planted earlier (no prefactor before S5). #2/#4 not planted (S3 defers wall-flux claim).

---

## 5. `has_prebuilt_deep_dive` (cache hint, Rule 18)
1. **STATE_4** — wall-zero-flux (inverse-of-line beat). 2. **STATE_5** — A-cancel + the ½ ("why not σ/ε₀?"). 3. **STATE_6** — constant field ("surely it weakens eventually?"). All `false`-routing for V1.

---

## 6. Drill-down clusters
- **STATE_4:** `why_wall_zero_flux`, `e_grazes_curved_wall`, `inverse_of_the_wire_caps`
- **STATE_5:** `why_one_half_not_sigma_over_eps0`, `where_did_area_A_go`, `sigma_over_eps0_is_the_conductor_case`
- **STATE_6:** `why_field_is_constant_with_distance`, `same_q_enc_at_any_distance`, `sheet_vs_line_vs_point_falloff`

SQL ships 1 cluster/hard-state — recommended: `inverse_of_the_wire_caps`, `why_one_half_not_sigma_over_eps0`, `why_field_is_constant_with_distance`. physics-author writes 3–5 trigger phrases each.

---

## 7. `entry_state_map`
```yaml
entry_state_map:
  foundational: [STATE_1, STATE_2, STATE_3, STATE_4, STATE_5, STATE_6]
  exploration:  [STATE_7]
```
PRIMARY aha STATE_6 ∈ foundational. Aspect vocabulary: `foundational`, `exploration`.

---

## 8. Prerequisites
```yaml
prerequisites:
  - gauss_law
  - electric_flux
  - charge_distribution   # surface charge density σ (C/m²)
```
All shipped, gold-standard. Advisory (Rule 23).

---

## 9. Real-world anchor

**Primary:** the uniformly charged flat **drum/plate of a photocopier / laser printer** (xerography) — every Indian xerox shop. The drum's surface holds uniform σ; the reason its field lays toner down **evenly** across the whole page is exactly that an infinite-sheet field is the **same strength everywhere** — it doesn't fade as the toner approaches, so every patch is pulled equally and the copy is uniform, not blotchy. **Secondary:** a large charged flat metal plate on a lab stand — hold a charged pith ball near its middle and the force points straight out and barely changes as you move closer/farther; walk twice as far and the field is essentially unchanged, nothing like a charged ball or wire.

Plain English; no Hinglish, no figures, no DC Pandey/HC Verma phrasing.

---

## 10. Definition of Done (Gate 0)

### (a) States — see §2.
### (b) Symbol-label table
| Quantity | Label | First appears |
|---|---|---|
| Surface charge density | `σ` ("+" grid) | STATE_1 |
| Perpendicular distance sheet→P | `d` (billboarded) | STATE_2 |
| Field magnitude | `E` (∝ S2, formula S5) | STATE_2 |
| Field direction | `n̂` ("E ∥ n̂, both sides") | STATE_2 |
| Pillbox cap area | `A` (on a cap face) | STATE_3 |
| Pillbox half-height | distinct extent line (≠ `d`) | STATE_3 |
| Flux through wall | `Φ = 0` (wall tag) | STATE_4 |
| Total flux | `Φ = 2EA` | STATE_4 |
| Permittivity | `ε₀` | STATE_5 (NEVER earlier) |
| Enclosed charge | `q_enc = σA` | STATE_5 |
| Factor of two | `½ = two caps` tag | STATE_5 |
| Solved field | `E = σ/(2ε₀)` | STATE_5 |
| Contrast | `1/r²` ghost, `1/r` ghost, flat `σ/2ε₀` | STATE_6 |

### (c) RHR: **N/A** — perpendicular electrostatic field; sign of σ sets direction + per-sign colour.
### (d) Motion — every state animates: S1 markers populate + question; S2 both-sides arrows + d line; S3 pillbox + A label; S4 grazing-wall vs piercing-cap contrast + inverse callback; S5 derivation + A cancels + ½ tag; S6 ghosts-then-flat-line + coordinated_sweep (arrows hold constant); S7 distance slider moves geometry while arrows hold constant. Guided states `reveal_hold`; S7 `interactive` + idle auto-sweep.
### (e) Modes: **Conceptual-only.** No `mode_overrides`.
### (f) assessment + coverage_map + misconception_watch:
- **assessment:** Q1 → E=σ/2ε₀, ⊥, both sides (`S5`); Q2 → ⊥/both sides (`S2`); Q3 → only caps carry flux, wall Φ=0 (`S4`); Q4 → **CONSTANT, no falloff — PRIMARY** (`S6`); Q5 → **E same at d and 2d (ratio 1:1)** distractor quarter/half (`S6`); Q6 → **why σ/2ε₀ not σ/ε₀** distractor σ/ε₀=conductor/two-plate (`S5`). Each with distractor_misconceptions, tested_idea, teaches_state, parallel_form_stem (xerox/plate framing), difficulty.
- **coverage_map:** by_state STATE_2/4/5/6; non_assessed [STATE_1, STATE_3, STATE_7].
- **misconception_watch:** one per STATE_1–6.

No TBDs.

---

## Block 2 — Aha designation

**PRIMARY (STATE_6):** "An infinite sheet's field is **constant** — does NOT fall off with distance (vs point 1/r², wire 1/r) — because the pillbox encloses the same σA patch however far out its caps sit, while a sphere/cylinder keeps growing." The field that never dies.

**SUPPORTING (STATE_4):** "The curved **wall** carries zero flux (E grazes it); only the two **caps** count — the exact INVERSE of the wire." Causally linked: caps-carry ⇒ Φ=2EA over fixed A (q_enc=σA over same A) ⇒ A cancels ⇒ no d ⇒ constant. 1 PRIMARY + 1 SUPPORTING = sweet spot.

**Wrong-belief setup:** S1 → S6 (falloff guess; S5 hands E=σ/2ε₀ with no d in it); S3 → S4 ("closed surface ⇒ flux on all faces"; line-veterans expect the inverse).

**Foundational-coverage:** STATE_6 ∈ foundational. PASS.

---

## Handoff to physics-author

- `variables`: `sigma`, `d`, `A`, `epsilon_0`, `k`, `DEMO_E_PER_NC` (no `r` falloff — `d` is a position, not a divisor).
- `computed_outputs`: `E_demo = DEMO_E_PER_NC * sigma` (**constant — NOT ÷ d**; clamp |σ| only); `E_real = (sigma*1e-9)/(2*epsilon_0)`; `q_enc = sigma*A`; `flux_check = (sigma*1e-9*A)/epsilon_0`; `line_ghost = DEMO_E_PER_NC*sigma/Math.max(d,0.05)`; `point_ghost = DEMO_E_PER_NC*sigma/(Math.max(d,0.05)**2)`.
- `formulas`: Φ=q_enc/ε₀; Φ=2EA (two caps); q_enc=σA; 2EA=σA/ε₀; 2E=σ/ε₀; E=σ/(2ε₀); ½ from two caps (NOT σ/ε₀); E=constant (vs line 1/r, point 1/r²); ⊥ both sides for +σ, equal everywhere.
- `constraints` (mirror line C1–C8, INVERTED): E ⊥, both sides; |E| constant (independent of d AND in-plane position); **caps** carry flux, **wall** zero (inverse of line); Φ=2EA=σA/ε₀; A cancels ⇒ σ/2ε₀; no falloff; ½ from two caps (σ/2ε₀ ≠ σ/ε₀ conductor/two-plate); arrows by sign(σ), magnitude ∝ |σ|.
- Reveal timeline `at_ms` per beat; `misconception_watch` text (§4); `pause_after_ms` on S1 (s1_2≈2600), S4 (s4_1≈2800), S5 (s5_2≈2500) — **carry every pause into JSON**.
- 6-Q `assessment` + `coverage_map` per §10(f); Q5 (1:1 ratio) + Q6 (σ/2ε₀ vs σ/ε₀) = stretch items.
- Drill phrases (3–5 each) for §6 clusters.
- `field_3d_config`: `scenario_type: "gauss_law_sheet"`, `explorer_id: "gauss_sheet_explorer"`, per-state `gauss_sheet` blocks, `slider_controls.sigma` + `slider_controls.d`. **Cut-line inversion:** FLAT plot + falling 1/r & 1/r² ghosts; caps flux-bearing, wall Φ=0; `show_constant_field`; S7 distance slider moves geometry while arrow length holds constant. Register new `gauss_sheet` keys in `deriveStateMeta.ts` SAME change (S2–6 reveal_hold, S7 interactive).
- **FLAG to quality-auditor (Gate 8):** inverted sibling of `gauss_law_line` — re-check `teach_inverted_scenario_inverts_cutline_flags` + amperes-review occlusion/indistinct classes on S5/6/7.
