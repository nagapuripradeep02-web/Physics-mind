# SKELETON — `law_of_conservation_of_mass` (CHEMISTRY)

**Concept:** Law of Conservation of Mass · Class 11 · NCERT Chemistry Ch.1 "Some Basic Concepts of Chemistry", §1.3 Laws of Chemical Combination
**Pipeline:** architect → **chemistry_author** → json_author → quality_auditor
**Renderer:** `renderer_pair.panel_a: "parametric"` (PCPL), archetype **O — Reaction ledger** `[LIVE — composition only]`. Canvas 760×500. **`smooth_camera` is OMITTED for the whole concept** (recorded scar: whole-draw-pass zoom clipped Bohr S2).
**Structural precedent:** `src/data/concepts/chemistry/bohr_model_energy_levels.json` (states under `epic_l_path.states` keyed `STATE_1..N`; flat `scene_composition` array).
**Selection rationale (founder rule, 2026-07-27):** NCERT chapter order weighted by international-curriculum coverage. Ch.1 is the earliest NCERT chapter AND the highest-overlap chemistry content across CBSE/JEE · Cambridge IGCSE · IB DP · AP Chemistry · A-level — and the only top-weighted chapter needing zero new engine code.

---

## Engine bug queue consultation

The architect could not execute the SQL step (no DB tool in that dispatch). **The orchestrator ran it instead — results in the appendix at the bottom of this file. Four OPEN scars bind this build; chemistry_author and json_author must both read the appendix.**

The two parametric-class scars recorded in `docs/patterns/chemistry.md` are designed around explicitly:
1. **GAP 2** — parametric binds only TEXT (`label_expr`/`text_expr`) to live variables; `body`/`animated_path` positions are static per state. Every slider in this skeleton drives NUMBERS (readouts, ledger sums, balance reading), never glyph motion. All motion is guided one-shot (`appear_at_ms`/`animate_in_ms` staging + `animated_path` lerps), which GAP 2 does not affect.
2. **`smooth_camera` clips a full canvas** — omitted.

---

## 1. Atomic claim

This concept teaches ONE idea: in a chemical reaction inside a closed system, the total mass is unchanged because atoms are only rearranged, never created or destroyed. It does NOT cover balancing symbol equations with coefficients (deferred to `balancing_chemical_equations`), the law of definite/multiple proportions (deferred to `law_of_definite_proportions`), or mole/stoichiometry calculations (deferred to `mole_concept`).

## 2. State count + arc — 7 states (justified)

The §5 calibration table puts a simple-medium concept at 3–6 states. This lands at **7** because the concept carries a TWIN misconception (mass apparently *destroyed* by burning AND apparently *created* by rusting — both NCERT-Exemplar-class beliefs, each needing its own contrast beat) plus a mandatory Rule 33 macro↔micro pair. Removing any state breaks either a misconception kill or the macro/micro link; the concept is genuinely two-sided.

Arc (qualitative → quantitative → derivation → explore; the hook MOVES):

| State | Purpose (one line) | depth_ring |
|---|---|---|
| S1 | Hook: charcoal burns in an OPEN pan on a balance — the reading visibly FALLS. The everyday "mass vanished" experience, confirmed on screen. | core |
| S2 | **PRIMARY AHA + Rule 16a contrast:** same burn, open vs SEALED, side by side — open reading drops as gas escapes; sealed reading holds dead level. The mass went somewhere; it was never destroyed. | core |
| S3 | Micro zoom (Rule 33): inside the sealed flask, atoms MOVE between species tiles — C joins O–O to form CO₂; atom-audit table fills live; 3 atoms in, 3 atoms out. | core |
| S4 | Quantitative law: 12 g + 32 g → 44 g; the mass ledger tallies to equality; slider shows ANY amount still balances. | core |
| S5 | Twin misconception (Rule 16a #2): iron + oxygen → rust — the SOLID alone gets heavier because O atoms JOIN it; solid reading rises, gas reading falls, TOTAL holds. Gain is transfer, not creation. | extended |
| S6 | Why the law holds: total mass = Σ(count × atomic mass); counts unchanged ⇒ mass unchanged. One-line scope note: chemical reactions only (nuclear mass–energy conversion is beyond this law). | advanced |
| S7 | Explore sandbox: teacher drives m(carbon) + sealed/open toggle; all readouts, ledger, and balance reading recompute live (numbers only — GAP 2 by design). | core-content sandbox |

Rings: core S1–S4 → extended S5 → advanced S6 (contiguous block immediately before explore) → explore S7. ✔ Rule 38a ordering.

## 3. Per-state choreography + control table (Rule 31 — REQUIRED artifact)

**Archetype note (documented deviation):** the chemistry archetype catalog (K/L/M/N/O) is concept-family-grained — this entire concept is archetype **O**. Distinctness is therefore declared at the choreography-beat level (named beats below, seeding `patterns/chemistry.md` §3 per its naming convention); no two states share a beat, none is static. The one repeated-beat pair (S1/S2) is a **declared contrast pair** whose delta names the flip.

**Apparatus home pose (Rule 32d):** ONE digital balance (value-only readout, Rule 33d/34b) + a short analog needle above it, pan center-left; flask on the pan; atom-audit table docked right; equation surface bottom-center; delta-cue label top (same position as Bohr's `delta_cue`). The apparatus never teleports; states add/stage within it. **Needle mechanics under GAP 2 (note to json_author):** guided-state needle sweep = an `animated_path` marker sliding along a short arc-chord between tick marks + a `vector` needle at the end pose appearing at sweep end; readout ticking = staged `label` swaps in guided states, `label_expr` live-bound in S4/S7.

| # | Teaches | Archetype · beat | DISTINCT motion (cause→effect per 32a) | Delta (≤5-word cue) | Live controls | Narration | Ring | advance_mode |
|---|---|---|---|---|---|---|---|---|
| S1 | A reaction can LOOK like it destroys mass | O · `burn-down` (contrast pair with S2) | CAUSE: charcoal lump glows and shrinks in staged steps; ~0.7 s later EFFECT: smoke wisps rise off the pan (`animated_path`), readout ticks 50.0→49.2→48.1 g, needle sweeps down | "Burning: the reading falls" | none | 30–45 words | core | `manual_click` |
| S2 | Sealed system: nothing leaves, mass holds — the law | O · `escape-vs-seal` (declared contrast pair of S1) | `comparison_panel`: LEFT open — gas wisps exit upward past the pan edge, reading drops; RIGHT sealed — identical burn, wisps rise then stay inside the flask wall, reading holds dead level. Cause (burn) leads both; readings respond after a beat | "Sealed: reading holds level" | none | 35–55 words | core | `manual_click` |
| S3 | Atoms rearrange — moved, never made or destroyed | O · `atom-shuttle` (canonical archetype-O signature: atoms MOVE, never fade) | Zoom-link band opens from the sealed flask (Rule 33 connector); ONE C circle and an O–O pair sit in reactant tiles; `animated_path` carries the C circle across to dock between the two O circles → CO₂ tile forms from the SAME three circles; atom-audit table fills live (C 1→1, O 2→2); equation surface `C(s) + O₂(g) → CO₂(g)` appears ONLY after the shuttle completes | "Atoms move, never vanish" | none | 35–55 words | core | `manual_click` |
| S4 | m(reactants) = m(products), for ANY amount | O · `mass-ledger tally` | Mass tags stamp under each tile in sequence (12 g … 32 g … 44 g); a ledger bar sums left then right; balance needle centers on equality; then the slider goes live and every number rescales (numbers only — GAP 2) | "12 g + 32 g = 44 g" | `m_C` slider (g carbon, 1–24) | 25–45 words | core | `manual_click` |
| S5 | Apparent mass GAIN is also transfer | O · `gain-is-transfer` | Micro band: drawn O atoms detach from air-side and dock ONTO the iron surface one by one (staged); macro: solid-only readout ticks UP as gas-side readout ticks DOWN; TOTAL readout holds level. Word equation "iron + oxygen → iron oxide (rust)" — deliberately coefficient-free | "Rust gains oxygen's mass" | none | 35–55 words | extended | `manual_click` |
| S6 | WHY: mass rides on atoms; counts fixed ⇒ mass fixed | O · `count-times-mass build` | `derivation_step` lines build one by one: m_total = Σ(nᵢ × mᵢ) → counts nᵢ identical before/after (audit-table numbers fly into formula slots) → therefore m_before = m_after; staged scope note: chemical reactions only | "Mass = count × atom mass" | none | 35–55 words | advanced | `manual_click` |
| S7 | Teacher sandbox — the law under any inputs | O · `drag-sandbox` (explore only) | Sliders drive LIVE NUMBERS: all mass readouts, ledger sums, atom-scale readout, balance reading recompute on drag; sealed/open toggle switches the reading between total and total − m(CO₂). No glyph re-animation on drag (GAP 2 — authored to it) | "All yours — try breaking it" | ALL: `m_C` slider + `vessel_sealed` toggle (0/1) | 0 / open | core-content only (38b) | `interaction_complete` |

Gate 12: `manual_click` + `interaction_complete` = 2 distinct advance_modes ✔. No `wait_for_answer`, no predict-pause ✔. Rule 19: every state ≥3 primitives (each row needs 6–12) ✔. Rule 32e single focal — S1 readout, S2 sealed-side readout, S3 the shuttling C atom, S4 the equality ledger, S5 the TOTAL readout, S6 the active derivation line, S7 none/rotating with drag.

**Representation-triangle declaration (chemistry.md §0):** S1, S2 macro-led; S3 particulate-led, symbolic enters last; S4 symbolic+macro co-led; S5 macro-led with particulate support band; S6 symbolic-led — LEGAL because advanced-ring, not core (the §0 ban is on symbolic leading a *core* state); S7 macro+symbolic readouts.

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots)

Belief source: NCERT-Exemplar-class common wrong beliefs (belief only; no problem text imported). No EPIC-C branches (EPIC-L-first directive).

| # | Wrong belief | At | `misconception_watch` beat |
|---|---|---|---|
| M1 | "Burning destroys mass / the mass just disappears" | **S2** | belief: burning destroys matter · visual_counter: the SAME burn sealed — reading dead level while the open twin drops; the escaping wisps ARE the missing grams · one_line_fix: "The mass left the pan, not the universe — seal it and nothing is lost." |
| M2 | "Rusting (or burning a metal) CREATES mass out of nowhere" | **S5** | belief: the solid got heavier so mass was created · visual_counter: O atoms visibly dock onto the iron while the gas-side readout falls exactly as much as the solid rises; TOTAL flat · one_line_fix: "The gain is oxygen's own mass changing address." |
| M3 | "New substances mean new atoms — CO₂'s atoms are freshly made" | **S3** | belief: products are built from new matter · visual_counter: the CO₂ tile is assembled from the SAME three circles the reactants held · one_line_fix: "Same atoms, new partners." |

S1, S4, S6, S7 carry NO misconception_watch (straightforward teaching — founder guardrail 2026-07-04).

## 5. `has_prebuilt_deep_dive` states

- **S2** — the misconception epicenter (open-system illusion).
- **S3** — the particulate abstraction (atom accounting); where "but where did the wood GO" piles up.

(S6 considered and rejected — advanced-ring, low traffic, hidden under two of three presets.)

## 6. Drill-down clusters

**S2:** `where_did_the_ash_mass_go` · `candle_losing_weight` · `open_vs_closed_system`.
**S3:** `do_atoms_ever_get_destroyed` · `counting_atoms_both_sides` · `why_gas_has_mass`.

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:      STATE_1 → STATE_4   # contains PRIMARY aha (S2) ✔
  mass_gain_paradox: STATE_5
  why_conserved:     STATE_6
  exploration:       STATE_7
```

Foundational-coverage rule satisfied: PRIMARY aha (S2) is inside the foundational range.

## 8. Prerequisites (advisory, Rule 23)

`prerequisites: []` — syllabus concept #1 for chemistry. Assumed background "matter is made of atoms with fixed mass" is patched inline at S3 (see Pass-1 cliff).

## 9. Real-world anchor (Rule 35 / 38f — universal)

**Primary:** charcoal on a barbecue or campfire grate burns down to a handful of ash weighing almost nothing — anyone who has grilled or sat at a campfire has watched kilograms apparently vanish into the air. That lived "mass disappears" experience is exactly the belief this concept breaks. **Secondary:** cooking soda + vinegar fizzing inside a sealed plastic bag — the bag swells but a kitchen scale reads the same before and after (sanctioned anchor, home-replicable; used in S2/S7 narration). Both culture-neutral — no place, brand, festival, currency, or country phrasing. Physics-true at every depth.

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 7 states of §2, exactly as tabled in §3.

**(b) Symbol-label table:**

| Narrated quantity | On-canvas label |
|---|---|
| mass | `m` (dual-label once in S4: "mass m", then bare) |
| balance reading | value-only, e.g. `50.0 g` |
| carbon / oxygen / carbon dioxide | `C(s)` · `O₂(g)` · `CO₂(g)` |
| iron / oxygen / iron oxide (S5) | word tiles `iron (s)` · `oxygen (g)` · `iron oxide (s)` |
| reaction arrow | `→` (real Unicode) |
| total reactant / product mass | `m(reactants)` / `m(products)` |
| atom count / atomic mass (S6) | `nᵢ` / `mᵢ`; sum `Σ nᵢ·mᵢ` |
| Avogadro-scale readout (S7) | `≈ n × 6.022 × 10²³ atoms` (scale-factor label per chemistry.md §5) |

**(c) Balanced-equation ledger plan (chemistry variant — replaces the RHR plan):** S3, S4, S7 display `C(s) + O₂(g) → CO₂(g)` — coefficient-free by design (1:1:1), with state symbols, so nothing untaught appears (Rule 25). S5 displays the WORD equation `iron + oxygen → iron oxide (rust)` — the symbol form 4Fe + 3O₂ → 2Fe₂O₃ requires coefficients, which belong to `balancing_chemical_equations`; the S5 atom audit counts the DRAWN particles, conserved by count, never writing stoichiometric coefficients. No redox oxidation-number labels. Particle scale-factor label only in S7.

**(d) Motion plan:** exactly the §3 motion column. No state static; all guided motion one-shot staged (GAP 2-safe); needle sweeps via the animated_path arc-chord mechanic.

**(e) Modes:** `epic_l_path` only (Rule 20 [D] — no `mode_overrides`). Panel A `parametric`; no panel B.

**(f) Assessment + coverage_map + misconception_watch:** 6-question backward-designed quiz (Gates 19/20): ≥1 on the aha (S2 sealed-system reasoning), one on the mass-gain paradox (S5), one atom-accounting (S3), one numeric ledger (S4); each wrong option keyed to M1/M2/M3-class `distractor_misconceptions`; `coverage_map.by_state` covers S1–S6, `non_assessed_states: [STATE_7]`. `misconception_watch` exactly the three entries of §4.

**(g) Macro↔micro plan (Rule 33):**

| State | Macro visible change | Micro story (its OWN) | Real number | Instrument |
|---|---|---|---|---|
| S1 | charcoal shrinks, smoke leaves | (macro-only by design — the mystery) | 50.0 → 48.1 g | balance: readout + needle |
| S2 | open falls / sealed holds | wisps = matter with mass, trapped vs escaped | Δ −1.9 g vs 0.0 g | twin readouts + needles |
| S3 | sealed flask (zoom-link band) | C shuttles to O–O → CO₂ from the SAME atoms | audit: 3 in = 3 out | live audit table |
| S4 | balance centers at equality | mass tags per tile | 12 + 32 = 44 g | ledger bar + readout |
| S5 | solid readout up, gas down | O atoms dock onto iron, one by one | +0.6 g solid = −0.6 g gas; total 0.0 | three readouts |
| S6 | (symbolic, advanced) | audit counts feed Σnᵢmᵢ | m_before = m_after to the gram | derivation slots |
| S7 | balance reading live | atom-scale readout live | all of (j) | readout + needle |

**(h) Canvas budget (Rule 34):** per state ONE formula surface (`formula_box`, math-serif Unicode — equation in S3/S4/S7, word equation in S5, Σnᵢmᵢ in S6, NONE in S1/S2); top caption = the ≤5-word delta cue only; prose in the subtitle strip; HUD value-only; zones: cue top / audit table right / formula bottom-center / balance readout on-pan / sliders bottom-right — no collisions, all inside 760×500.

**(i) Curriculum-flex block (Rule 38):**
- **Cut 1 (hide advanced = drop S6):** S1–S5 + S7 coherent — nothing surviving references Σnᵢmᵢ or the nuclear scope note. ✔
- **Cut 2 (hide advanced + extended = drop S5, S6):** S1–S4 + S7 coherent — S4 closes the lesson quantitatively; no rust reference survives (**chemistry_author constraint: S2/S7 narration must mention rust ONLY inside S5**). ✔
- **Explore = CORE only (38b):** S7 uses only C + O₂ → CO₂, m(reactants)/m(products), and the scale-factor atom readout. ✔
- **Notation ladder (38c):** core/extended surfaces arithmetic-only; Σ-notation confined to advanced S6. ✔
- **Dialect (38d):** "mass" throughout; dual-label "reactants / products" once in S3 then bare; "sealed container (closed system)" dual-labeled once in S2 then "closed system".
- **Graph axes (38e):** N/A — no graph in this concept; recorded as a decided non-issue.
- **`curriculum_tags` (38g — CLAIMS):** CBSE/NCERT Cl.11 Ch.1 §1.3 → author-verified. Cambridge IGCSE, IB DP, AP Chemistry Unit 4, A-level AS, NGSS MS-PS1-5 → every cell `needs_teacher_verification: true`.
- **Presets (38h — hide, never reorder):** `full` = S1–S7 · `standard` = hide S6 · `intro` = hide S5 + S6.

**(j) Derived quantities `computePhysics_law_of_conservation_of_mass` must supply** (inputs: `m_C` slider 1–24 g, `vessel_sealed` 0/1; ~15 lines):
`m_O2 = m_C × 32/12` · `m_CO2 = m_C × 44/12` · `m_reactants = m_C + m_O2` · `m_products = m_CO2` · `reading = tare + (vessel_sealed ? m_reactants : m_reactants − m_CO2)` · `delta_reading = vessel_sealed ? 0 : −m_CO2` · `n_C = m_C / 12` (mol) · `atoms_scale_label = n_C`. All 1-dp gram display.

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** The only real prerequisite is the particulate nature of matter — no shipped concept covers it. The concept breaks at **S3** without it: a student who thinks matter is continuous cannot read the atom shuttle as conservation. Patch: S3's first sentence states it in one non-condescending line ("Every substance is built from atoms — tiny particles, each with its own fixed mass") before the shuttle plays.

**JEE-backwards trace.** *"In a sealed vessel, 4.0 g of carbon is burned completely in 12.0 g of oxygen. What is the total mass of the vessel's contents after the reaction…?"* Knowledge pieces → states: (1) total mass in a closed system unchanged (16.0 g) → S2 + S4; (2) the closed-system condition licenses the equality → S2; (3) mass is carried by atoms whose counts don't change, so the equality is exact → S3/S6; (4) gaseous products still count as mass → S2, reinforced by S5; (5) proportional scaling of the 12:32:44 ledger → S4's slider beat. Excess-reagent arithmetic is `mole_concept` scope — correctly outside this atomic claim.

**Misconception entry mapping.** M1 is *planted* by S1 deliberately, as the earned wrong belief, and broken one click later by S2 (the plant is the design, not a leak). M2 could be planted by S2's "mass only ever seems to LEAVE" framing — **chemistry_author must phrase S2's fix symmetrically ("leaves or arrives")**; S5 confronts it head-on. M3 risks being planted at S2 ("a new gas appeared"); S3 confronts it immediately. 16b fallback branches: none (EPIC-L-first).

## Block 2 — Aha-moment designation

- **PRIMARY aha:** *Seal the flask and the balance does not move — the "vanished" mass was in the invisible gas all along; matter is never destroyed, only rearranged.* At **S2** (inside `foundational` ✔).
- **SUPPORTING aha:** at **S3** — the product is built from the very same atoms the reactants held; "same atoms, new partners" is WHY the balance couldn't move.
- **Cohesion:** the supporting aha is the mechanism of the primary. S5's gain-paradox is a consequence-application, not a third aha. ✔
- **Wrong-belief setup:** **S1** builds the confident wrong belief (one full state of earned confidence) before S2 breaks it. For the supporting aha, S2 leaves the residue "so a new substance appeared — new stuff?" which S3 breaks.
- **Deep-dive cross-reference:** the two `has_prebuilt_deep_dive` states (S2, S3) are exactly the Pass-1 cliff/confusion states.

## Registration + validation (json_author: read verbatim)

- **Site #1 ONLY:** `src/data/concepts/chemistry/law_of_conservation_of_mass.json`.
- **FORBIDDEN (Gate 8b is all-or-nothing; the chemistry serving path does not exist yet):** no rows/edits in `concept_panel_config`, `CONCEPT_RENDERER_MAP`, `VALID_CONCEPT_IDS`, `PCPL_CONCEPTS`, `CLASSIFIER_PROMPT`.
- **Validation:** `npm run validate:chemistry` — NEVER `npm run validate:concepts`.
- `computePhysics_law_of_conservation_of_mass` (~15 lines) added iframe-side in `parametric_renderer.ts` + a TS engine in `src/lib/physicsEngine/concepts/` — the Bohr-proven additive, concept-gated pattern. This is an engine-file touch → **Rule 40: land it on master separately.**
- Languages: author `text_en` now; `text_hi` via the Rule-30g Sonnet-5 sub-agent (text-only, Rule 30i); audio on-demand only (30h).

## Architect self-review (chemistry form)

*"Consulted NCERT Chemistry chapter index to confirm scope (Class 11, Ch.1 'Some Basic Concepts of Chemistry', §1.3 Laws of Chemical Combination — conservation of mass). No teaching method, no example problem, no figure imported."* NCERT Exemplar consulted for misconception beliefs only (M1–M3), no problem text imported.

---

# APPENDIX — Gate 8 `engine_bug_queue` consultation (run by the orchestrator, 2026-07-27)

The architect flagged that it could not run this query. It was run against the dev project (`dxwpkjfypzxrzgbevfnx`). **Four OPEN scars bind this build. Both downstream agents must comply.**

| Scar (`bug_class`) | Owner | Binding constraint on THIS concept |
|---|---|---|
| `parametric_from_expr_to_expr_never_consumed` | `peter_parker:renderer_primitives` | The parametric renderer has **zero hits** for `from_expr`/`to_expr` outside comments — authoring them is a silent no-op. The S1/S2/S4 balance **needle `vector` must use literal `from`/`to`, or `magnitude_expr` + `direction_deg_expr`** — never `from_expr`/`to_expr`. |
| `pcpl_slider_label_stale_under_choreography` | `peter_parker:renderer_primitives` | Before a variable is seized, `drawCanvasSlider` reads its knob/label from `PM_sliderValues`, not the live choreographed value — so a scripted ramp on a slider-bound variable leaves the slider label **stale**. **S4 is exactly this risk** (a scripted tally beat plus a live `m_C` slider). Required: either do NOT choreograph `m_C` during S4's tally (stamp fixed mass tags, then hand the slider over live), or hide the `m_C` row for the choreographed portion. The explicit ruling: *"Do not ship a NEW PCPL concept authoring `variable_choreography` on a slider-bound variable"* without one of those. |
| `normal_reaction_state5_computed_outputs_name_mismatch` | `peter_parker:renderer_primitives` | `physics_engine_config.computed_outputs` keys and the keys `computePhysics_<id>` actually returns must be the **same set of names**. Diff `Object.keys(computed_outputs)` against the function's returned `variables` + `derived` keys and close every gap. Binds DoD (j) directly. |
| `pcpl_radians_helper_missing` | `alex:physics_author` | In PCPL/parametric expressions always convert degrees as `theta * PI / 180` — **never `radians(theta)`** (that is the field_3d dialect). Applies to every `*_expr`, `physics_engine_config.formulas`, `computed_outputs`, and inside `computePhysics_<id>` (`deg * Math.PI / 180`). Binds the needle-angle math. |

Additional relevant OPEN rows (advisory, standard authoring hygiene):

- `teach_concrete_before_abstract_compare` (`alex:architect`) — for a "this equals that" beat, stage it: simple case alone, THEN the second case beside it, THEN the match. **Binds S2:** do not render both comparison panels populated from t=0; the open pan is already on screen from S1 — bring the sealed twin in after a beat.
- `PEDAGOGY_NO_ANCHOR` (`alex:json_author`) — the real-world anchor must appear as a label/sketch/annotation in at least the first 2 states. (Its recorded examples name Indian cities and are **superseded by Rule 35**; the requirement stands, the examples do not.)
- `PEDAGOGY_INFO_OVERLOAD` (`alex:json_author`) — at most 2 new elements introduced per state.
- `PEDAGOGY_NO_FOCAL` / `ecp_glow_targets_missing_primitives` / `TTS_GLOW_TARGET_MISSING` (`alex:json_author`) — every state declares a `focal_primitive_id` matching a rendered primitive, and every `teacher_script` glow target must name a primitive the state actually builds.
- `archetype_live_tier_unverified_against_renderer` (`alex:architect`, **FIXED**) — satisfied for this build: the orchestrator verified the archetype-O primitive vocabulary (`body`, `label`, `annotation`, `comparison_panel`, `animated_path`, `glow_focus`, `formula_box`, `axes`, `vector`, `slider`, `derivation_step`) against the `parametric_renderer.ts` draw dispatch on 2026-07-27 before scheduling.
