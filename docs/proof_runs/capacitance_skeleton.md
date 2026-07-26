# ARCHITECT SKELETON — `capacitance`

> Doctrine proof-run for the SEVEN international-curriculum guidelines (worktree
> `physics-mind-curriculum`, branch `feat/curriculum-flex-pilot`, 2026-07-21).
> Extras (a)–(d) after §10 are the proof-run deliverables; extra (d) — the
> GUIDELINE FRICTION REPORT — is what decides whether these become permanent rules.

**Chapter:** Class 12, Ch.2 Electrostatic Potential & Capacitance — NCERT §2.11 (Capacitors and Capacitance) + §2.12 (The Parallel Plate Capacitor, capacitance half). Proposed `concept_id: capacitance`.
**Renderer:** `field_3d` — NEW `scenario_type: "capacitance"` cloning the shipped `parallel_plates` structural pattern (see §0b — a `peter_parker:renderer_primitives` delta is unavoidable and is declared FIRST, Class-B rule).
**Position:** 9th Ch.2 diamond, after `parallel_plate_capacitor_field` (shipped, baseline-locked) — this diamond OPENS on that diamond's apparatus and teaches what it deliberately STOPPED SHORT of (its own scope note names "capacitance C = ε₀A/d" as excluded).

---

## 0a. Engine bug queue consultation (pre-authoring)

Live SQL not executable from the architect dispatch (no Bash/DB tool). Consulted the canonical read-only mirror `docs/FIELD3D_SCENARIO_CHECKLIST.md` in full. **FLAG to quality_auditor: re-run `query_engine_bug_queue.ts capacitance` + `--field3d --open` at Gate 8.** Prevention rules applied:

| Scar / prevention rule (mirror) | How this skeleton satisfies it |
|---|---|
| Concrete before abstract | S1 is pure phenomenon (charge flows on, stays — no formula surface); the ratio law lands S2, the name lands S3, geometry S4–S5, derivation dead last (S6) |
| Reveal synced to narration | Cue plan in §3 — each one-shot lands on its narrating sentence; `at_ms` kept as THE EYE fallback |
| Coordinate sim + graph — ONE live parameter moves both | S3/S7: the SAME V drives plate charge-dots, HUD Q, and the graph trace dot together; never a static curve |
| Show a quantity live when it's named | Q counter climbs when "charge" is first said (S1); ratio readout appears on the sentence naming the ratio (S2); slope tag lands as "capacitance" is named (S3) |
| Don't pre-spoil a later reveal | No formula in S1; C not NAMED until S3 (S2 reads `Q/V = 0.0885 nC per volt`, deliberately not pF); **ε₀ first appears in S5**; σ/E only in S6 |
| Visual must match narration | "no charge crosses the gap" = beads visibly stopping at the plate faces; "charge drains" = beads flowing backward to the battery (S5) |
| Distinct reference lines | Inherited gap ruler `d` and the new plate-edge tag `A` are separate labelled primitives — never conflated |
| Colour by sign/identity | + dots warm / − dots cool on their plates; aggregate readouts neutral |
| Register the NEW scenario in `deriveStateMeta.ts` in the SAME change | §0b requirement 5 — per-state reveal/settle pins for all one-shots, or THE EYE false-fails D7/D1p at the 1500 ms default |
| No frozen tail / one-shots hold end pose | Every morph and the chain-build hold their end pose; field-line shimmer + graph-dot breathing sustain motion |
| Explorers must move | S7 ships an idle V auto-sweep (teacher-seizable) so the headless harness sees motion |
| Don't gate visuals on the clock in slider states | S7 renders at full immediately; slider-driven, no emergence ramp |
| Interactivity in the LAST state only | Sliders contextual per Rule 31c (S2/S3 V, S4 A, S5 d); full sandbox only S7 |
| Specific `visible_elements` tokens | `cap_beads`, `cap_dots_pos`, `cap_dots_neg`, `qv_graph`, `plate_area_tag` — no generic substrings |

**DC Pandey check:** table of contents consulted for SCOPE only — capacitance, parallel-plate capacitor, combinations, and dielectrics sit as separate sections, supporting the atomic split in §1. No teaching sequence, example, or figure imported.

---

## 0b. Engine ask — `peter_parker:renderer_primitives` delta, declared FIRST (Class-B triage)

The shipped `parallel_plates` scenario is a **static-field instrument**: it shows the field pattern, morphs the gap, reads E — it has **no way to show charge arriving, accumulating, or draining**, and stored charge Q is THIS concept's taught variable. JSON alone cannot add motion the scenario can't render, so a new `scenario_type: "capacitance"` must be built first, **cloning existing patterns — no novel engine idea**:

1. **Charging circuit + bead flow** — battery + wires + charge beads streaming onto the plates, self-stopping when the gap p.d. reaches V, reversible (drain). Clone of the faraday induced-current-bead machinery.
2. **Plate-face charge-dot accumulation** — ± dot pools whose count tracks Q live (the Rule 33 micro layer). New primitive, simple instanced sprites.
3. **Plate-area morph** — mesh scale on the two plates (the d/gap-widen morph already exists and is reused as-is).
4. **Q–V graph pane** with live trace dot + **axis-swap toggle** (Q–V ↔ V–Q) — clone of the existing field_3d graph-pane pattern; the toggle is the one NEW surface, added solely for guideline 4.
5. **Live Q / C value readouts** — clone of the shipped live E readout; plus **`deriveStateMeta.ts` registration + settle pins in the SAME change** (scar), S7 idle auto-sweep (scar), glow-key enum proposed CLOSED: `beads · plate_dots · ratio_readout · graph · plates · gap · formula · battery`.

Shipped-sibling regression is part of this concept's DoD: `parallel_plate_capacitor_field`'s locked baselines must stay pixel-identical after any shared-primitive work.

---

## 1. Atomic claim

A capacitor's charge and voltage always move in lockstep so their ratio **C = Q/V is a fixed property of the device — set by geometry alone, C = ε₀A/d — not by how much charge or voltage you give it.**

Out of scope (deferred to named siblings): energy stored ½CV² (`capacitor_energy_storage`), dielectrics κ (`dielectric_in_capacitor`), combinations (`combination_of_capacitors`), RC charging (where i = C·dV/dt and all calculus lives), and the uniform field E = V/d = σ/ε₀ (prerequisite `parallel_plate_capacitor_field`, shipped).

**Scope decision:** energy-stored and dielectrics are **deferred to siblings, NOT authored as an advanced tail here** — each carries its own PRIMARY aha and misconception set; folding either in would break the atomic claim and double the state count. The advanced-tail slot (guideline 1) is used instead by the **derivation of C = ε₀A/d**, which belongs to this atomic and which the CBSE/JEE lesson wants anyway.

---

## 2. State count + arc

**7 states** — four ideas (storage, the frozen ratio, area, gap) + the graph that names C + a one-state derivation tail + explore. The +1 over the medium band is the `advanced`-ring derivation state (S6), which a pure-core lesson hides cleanly (guideline 1). The hook MOVES from t=0; no static setup state.

| State | Purpose (one line) |
|---|---|
| S1 `charge_and_hold` | Connect a battery — charge streams onto the plates, none crosses the gap, and it STAYS: a capacitor stores charge |
| S2 `the_frozen_ratio` | **PRIMARY AHA** — V steps up and down, Q mirrors it exactly, and the ratio readout Q/V never ticks |
| S3 `name_the_slope` | The Q–V graph traces a straight line through the origin; the slope IS the capacitance — C = Q/V, the farad |
| S4 `more_area_more_charge` | Double the plate area at fixed V → same dot density over twice the floor → Q and C double |
| S5 `the_gap_paradox` | Widen the gap at fixed V → charge visibly DRAINS back off the plates → C = ε₀A/d |
| S6 `why_epsilon_a_over_d` | ADVANCED TAIL — three links light in turn (σ = Q/A → E = σ/ε₀ → V = E·d) docking into C = Q/V = ε₀A/d |
| S7 `capacitance_sandbox` | Explore — V, A, d live, graph re-tracing, axis-swap toggle |

**Locked physics numbers:** ε₀ = 8.854×10⁻¹² F/m; defaults **A = 0.01 m²**, **d = 1.0 mm**, **V = 12 V** → **C = 88.5 pF**, **Q = 1.06 nC**. S2 steps V = 6 → 12 → 24 → 12: Q = 0.53 → 1.06 → 2.12 → 1.06 nC, ratio frozen at **0.0885 nC per volt**. S4: A → 0.02 m² → C = 177 pF, Q = 2.12 nC. S5: d → 2.0 mm → C = 44.3 pF, Q = 0.53 nC. S6 chain closes at defaults: σ = 1.06×10⁻⁷ C/m² → E = 1.2×10⁴ V/m → V = 12 V ✓.

---

## 3. Per-state choreography + control plan (Rule 31; extended with `depth_ring` — proof-run extra (a))

**Coined archetypes:** `morph-grow` (a geometric dimension of the apparatus itself changes continuously with charge responding — distinct from the seed `densify/rarefy`, which is field-line density) · `chain-link-derivation` (already-visible scene pieces light IN TURN while their algebra lines dock into one building formula surface — distinct from `reveal-build`, which constructs NEW scene pieces).

**Declared contrast pair — S4 ↔ S5 (`morph-grow` ×2):** growing the AREA fills the plates (beads flow IN); growing the GAP drains them (beads flow OUT). Flip named in both delta lines.

| State | depth_ring | Teaches (ONE idea) | Archetype | DISTINCT motion (state clock, Rule 26) | Δ cue (≤5 words) | Live controls | glow_focal | advance_mode | Budget |
|---|---|---|---|---|---|---|---|---|---|
| S1 `charge_and_hold` | **core** | A capacitor stores charge: ±Q pile up face-to-face; nothing crosses the gap | `flow-along-path` | Home pose = shipped diamond's plates + gap ruler + docked battery. Switch closes (cause) → beads stream along wires, + dots accumulate on one plate face, − on the other, inherited field lines grow with Q → beads visibly STOP at the plate faces, gap stays bead-free → flow self-slows, HUD Q settles at 1.06 nC. Charge HOLDS | "Charge flows on, stays" | none | `plate_dots` | manual_click | 40–55 w / ~18 s |
| S2 `the_frozen_ratio` | **core** | Q and V move in lockstep — their ratio never changes | `oscillate/track` | V readout steps 6 → 12 → 24 → 12 on cue (cause); at each step beads flow and the dot pool + HUD Q mirror it after a readable beat — while the ratio readout `Q/V = 0.0885 nC per volt` sits FROZEN, glowing, never ticking | "Both double — ratio frozen" | **V** | `ratio_readout` | manual_click | 35–50 w / ~15 s |
| S3 `name_the_slope` | **core** | The fixed ratio has a name and a picture: C = Q/V — the slope; unit farad | `reveal-build` | Camera shifts right to frame the NEW graph pane. V auto-sweeps 0 → 24 (teacher-seizable): trace dot climbs, drawing a dead-straight line through the origin, plates + dots + HUD tracking the SAME V live → `slope = C` tag lands, HUD re-badges to **88.5 pF** | "Straight line — slope C" | **V** | `graph` | manual_click | 35–50 w / ~15 s |
| S4 `more_area_more_charge` | **extended** | More plate area → more room at the same packing → C ∝ A | `morph-grow` (**pair w/ S5**) | At fixed V = 12: both plates morph ×2 wider (cause) → beads flow IN again → dot pool doubles at visibly the SAME density over twice the floor → HUD C 88.5 → 177 pF, Q 1.06 → 2.12 nC. Gap, field spacing, V untouched | "Double area — double charge" | **A** | `plates` | manual_click | 30–45 w / ~13 s |
| S5 `the_gap_paradox` | **extended** | Closer plates hold MORE, not less — C = ε₀A/d | `morph-grow` (**pair w/ S4**) | At fixed V: gap morphs 1.0 → 2.0 mm (reuses shipped gap-widen morph) → beads flow BACKWARD to the battery, dot pools visibly thin → HUD C 88.5 → 44.3 pF, Q 1.06 → 0.53 nC. One clause: the battery holds V fixed here. ε₀ first appears | "Wider gap — charge drains" | **d** | `gap` | manual_click | 40–55 w / ~18 s |
| S6 `why_epsilon_a_over_d` | **advanced** | Where C = ε₀A/d comes from — three links already on screen | `chain-link-derivation` | Nothing physically moves: dot pool glows → line 1 docks `σ = Q/A`; field lines glow → line 2 docks `E = σ/ε₀`; gap ruler glows → line 3 docks `V = E·d`; the three merge into `C = Q/V = ε₀A/d`, numbers closing at 88.5 pF | "Three links — one formula" | none | `formula` | manual_click | 40–55 w / ~18 s |
| S7 `capacitance_sandbox` | **core** (ring-neutral) | Synthesis — C = ε₀A/d under the teacher's hands | `drag-sandbox` | All three sliders live (V, A, d) + the graph **axis-swap toggle** (Q–V slope = C ↔ V–Q slope = 1/C); beads, dots, field lines, trace, readouts respond continuously; idle V auto-sweep until the teacher touches anything | "All yours" | **ALL: V · A · d · axis toggle** | `formula` | interaction_complete | 0 / open (≤20 w) |

**No-repeat audit:** `flow-along-path` ×1, `oscillate/track` ×1, `reveal-build` ×1, `morph-grow` ×2 (the ONE declared contrast pair), `chain-link-derivation` ×1, `drag-sandbox` ×1 (explore). No static state.

**Rule 32 plan:** 32a cause-first with a ~0.5–1 s beat in every state · 32b one variable per state (S1 switch, S2 V, S3 V, S4 A, S5 d, S6 nothing physical) · 32c the Δ column verbatim as caption openers · 32d ONE apparatus throughout from the shipped diamond's pose, graph pane docks at S3 and persists, camera moves once (S3) · 32e one glow focal per state from the CLOSED enum of §0b.

**Rule 33 plan:** micro layer = the **plate-face dot pool**, per-state distinct with real numbers (S1 accumulate ∝ 1.06 nC · S2 pool doubles/halves with V · S3 grows as the trace climbs · S4 same DENSITY twice the floor · S5 thins as beads drain · S6 becomes σ = Q/A). Instruments: live `Q = 1.06 nC`, `V = 12.0 V`, `C = 88.5 pF`, value-only, always tracking.

**Cue plan:** S1 switch-close ~1500 ms + flow-settle pinned · S2 three V-steps on sentences 2–3 · S3 sweep window, slope tag on the naming sentence · S4/S5 morph windows ~700–3500 ms · S6 three link-cues on sentences 2–4. All via `scenario_cue` + deriveStateMeta pins; `at_ms` fallbacks kept for THE EYE.

---

## 4. Misconception confrontation plan (Rule 16a — exactly THREE pivots)

| Genuine wrong belief | Pivot state + beat |
|---|---|
| **"The charging current flows THROUGH the capacitor, across the gap"** | **S1.** `visual_counter:` beads march along the wires and STOP dead at each plate face — the gap stays visibly bead-free while +Q and −Q pile up face to face · `one_line_fix:` "No charge ever crosses the gap — one plate fills to +Q while the other drains to −Q." |
| **"Give it more charge or more volts and you've increased its capacitance"** | **S2 (PRIMARY).** `visual_counter:` V doubles and doubles again, Q mirrors it exactly, and Q/V never ticks — you changed what it HOLDS, never what it IS · `one_line_fix:` "Q and V change together; their ratio — the capacitance — is fixed by the device." |
| **"A bigger gap means more room, so it should store more"** | **S5.** `visual_counter:` the gap doubles and charge visibly DRAINS off the plates — Q and C halve before your eyes · `one_line_fix:` "The nearby opposite plate is what holds charge in place — closer plates, bigger C: C = ε₀A/d." |

No other state carries a `misconception_watch` (founder guardrail 2026-07-04). No EPIC-C branches (EPIC-L-first directive).

---

## 5. `has_prebuilt_deep_dive` states

**S2** — the core abstraction and THE stuck point ("how can C not depend on the charge I put on it") · **S5** — the counter-intuitive geometry flip, strong surviving intuition · **S6** — the mathematical abstraction where board/JEE students fumble. Divergence from the misconception pivots at S1↔S6 is deliberate: investment follows stuck-ness, not pivot-ness.

## 6. Drill-down clusters

**S2:** `why_ratio_constant` · `what_is_a_farad` · `charge_stored_vs_capacity`
**S5:** `why_smaller_gap_bigger_c` · `where_does_drained_charge_go` · `fixed_v_vs_fixed_q` (the isolated-capacitor variant — flagged, not taught, in S5)
**S6:** `derivation_chain_confusion` · `sigma_vs_q` · `why_v_equals_ed`

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_3   # contains the PRIMARY aha (S2)
  geometry:     STATE_4 → STATE_5
  derivation:   STATE_6
  exploration:  STATE_7
```

Default aspect = `foundational`. Cross-slice pills: "What sets the value of C?" → S4; "Where does ε₀A/d come from?" → S6.

## 8. Prerequisites (advisory only — Rule 23)

`parallel_plate_capacitor_field` (shipped) — apparatus, uniform field, E = V/d = σ/ε₀; cliff at S6/S5. · `electric_potential_meaning` (shipped) — V = W/q, what "voltage (p.d.)" measures; cliff at S1–S2.
Required-by: `capacitor_energy_storage`, `dielectric_in_capacitor`, `combination_of_capacitors`.

## 9. Real-world anchor (Rule 35 + guideline 5)

**Primary — the camera flash (S1).** A phone or camera flash cannot draw its burst straight from the battery — so a capacitor spends a second or two quietly filling with charge, holds it, then dumps it in a millisecond of light. The single most widely taught capacitor application across IGCSE, A-level, IB, AP, and CBSE alike — maximum syllabus overlap, zero cultural content.
**Secondary:** the defibrillator (S7 narration mention) and the capacitive touchscreen (S4/S5). All narration-only; nothing device-shaped is drawn (Rule 24).

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(b) Symbol-label table** (dialect per guideline 3):

| Quantity | On-canvas label | Where |
|---|---|---|
| voltage / p.d. | slider row **"Voltage V (p.d.)"** (dual-dialect label, first appearance only) + HUD `V = 12.0 V` | S1+ |
| charge stored | HUD `Q = 1.06 nC` + the ± dot pools; S1 clause fixes "Q = the charge on ONE plate" | S1+ |
| the ratio | `Q/V = 0.0885 nC per volt` (S2 only — deliberately not pF) | S2 |
| capacitance | HUD `C = 88.5 pF` | S3+ |
| farad | narration only; HUD stays pF | S3 |
| plate area | slider "Plate area A" + plate-edge tag `A` | S4+ |
| separation | inherited gap ruler `d = 1.0 mm` + slider "Separation d" | S1+ / S5+ |
| ε₀ | inside S5/S6/S7 formula surfaces ONLY | S5+ |
| σ, E | S6 chain lines only | S6 |
| graph | axes `Q (nC)` vs `V (V)`, `slope = C` tag; S7 toggle swaps to V–Q, tag `slope = 1/C` | S3+ |

**Formula surface per state (Rule 34b — ONE each; notation ladder audited: algebra-only at every ring, no calculus anywhere):** S1 none · S2 `Q/V = constant` · S3 `C = Q/V` · S4 `C ∝ A` · S5 `C = ε₀A/d` · S6 one build-in-place surface assembling `σ = Q/A → E = σ/ε₀ → V = E·d` into `C = Q/V = ε₀A/d` · S7 `C = ε₀A/d`. Real Unicode across all three text paths (34c).

**(c) RHR plan:** N/A — no magnetic directions. Direction teaching = conventional-current bead direction and its REVERSAL in S5.
**(e) Modes:** conceptual-only — NO `mode_overrides`, NO `epic_c_branches`. `renderer_pair` = field_3d/field_3d; `available_renderer_scenarios.field_3d = ["capacitance"]`.
**(f)** `misconception_watch` at exactly S1, S2, S5. **`assessment` + `coverage_map`: AUTHOR THEM** — the Ch.2 sibling ships both, so Ch.2 precedent is inclusion (unlike Ch.3).
**(h) Canvas budget:** one formula surface/state; caption = the ≤5-word Δ cue only; HUD value-only; graph pane, formula, HUD, sliders in distinct corners clearing the review-chrome button (34d).

**TTS:** author `teacher_script` EN now; `text_hi` via the Rule-30g Sonnet-5 subscription sub-agent pre-ship (30i — never `text_te`); audio on-demand EN only (30h).
**Registration (8 sites):** `capacitance.json` · `concept_panel_config` / `CONCEPT_PANEL_MAP` · `CONCEPT_RENDERER_MAP` → field_3d · `VALID_CONCEPT_IDS` · deep-dive flags · synonyms n/a · `PCPL_CONCEPTS` N/A · `CLASSIFIER_PROMPT` + the four aspects. Plus clusters migration + `_seed_capacitance_cache.ts`.
**THE EYE:** 7/7 after the §0b engine delta lands; eye-walker ∥ quality-auditor; zero new `engine_bug_queue` rows; `parallel_plate_capacitor_field` baselines re-verified pixel-identical; founder hand-tests S7 sliders + axis toggle.

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `electric_potential_meaning` breaks at S1/S2 if "voltage" is just a battery number → one S1 clause: "the voltage — the p.d. — is the energy each coulomb gains crossing the gap." `parallel_plate_capacitor_field` breaks at S6 if field lines don't read as E = σ/ε₀ → one S6 clause: "you have seen this field — uniform, set only by the charge density on the plates."

**JEE-backwards trace.** *"A parallel-plate capacitor of plate area A and separation d is connected to a battery of voltage V. (i) Define capacitance and the farad. (ii) Find Q. (iii) With the battery still connected, d is doubled — what happens to C, Q, E? (iv) Derive C = ε₀A/d."* → (i) S2/S3 · (ii) S2/S7 · (iii) S5 shows exactly this motion with exactly these numbers; E reasoning bridges to the prerequisite diamond · (iv) S6. No missing piece.

**Planting audit.** (1) "stores charge" could plant *net* charge → S1 names the ±Q pair and pins "Q = one plate's charge." (2) S2's "fixed by the device" could over-generalize past the dielectric sibling → says "fixed by the device's geometry." (3) S5's battery-connected drain could plant "moving plates always changes Q" → the clause "the battery holds V fixed here," with the isolated case parked in the S5 drill-down cluster.

## Block 2 — Aha-moment designation

- **PRIMARY (S2):** *Q and V dance together but their ratio never moves — capacitance is the device's fixed appetite, decided before you ever connect anything.*
- **SUPPORTING (S5):** *Closer plates hold MORE charge, not less.*
- **Cohesion:** S5 answers the question S2 creates ("then WHAT sets the ratio?").
- **Wrong-belief setup:** S1 builds "charging = filling it up" before S2 freezes the ratio; S2–S4 build "bigger numbers, bigger storage" three states running, so the widening gap in S5 lands against a confident wrong expectation.

---

## Proof-run extra (b) — Curriculum-tag block (guideline 6)

> Web-search budget was exhausted during this dispatch, so **zero external syllabus verification happened**. Per guideline 6's own instruction, every uncertain cell says so rather than guessing.

| Curriculum | Coverage | Syllabus unit (confidence) |
|---|---|---|
| CBSE / NCERT Class 12 (+ JEE/NEET) | **✓ full** | Ch.2 §2.11–2.12 — confident |
| Cambridge IGCSE Physics (0625) | **✗ absent** (believed) | Quantitative capacitance believed not an IGCSE topic — **needs teacher verification** |
| CAIE A-level 9702 | **◐ partial** | Topic "Capacitance" (A2) — C = Q/V, farad, Q–V ✓ (S1–S3); **C = ε₀A/d believed NOT a 9702 outcome** (9702's geometric formula is the isolated sphere) — **needs teacher verification** |
| IB DP Physics | **✗ absent** (2023 syllabus, believed) / ✓ legacy HL | Old syllabus: HL Topic 11.3 ✓; the 2023 reform believed to have **removed capacitance** — **needs teacher verification** |
| AP Physics 2 | **✓ full** | Capacitance incl. parallel-plate formula is core; **unit numbering under the 2024 CED needs verification** |
| AP Physics C: E&M | **✓ full** | "Conductors, Capacitors, Dielectrics" — confident on content; also expects the Gauss-route derivation + calculus energy (both in siblings) |
| Ontario SPH4U | **◐/✗** (believed marginal) | Fields strand covers plates/potential; capacitance as a device quantity believed not an explicit expectation — **needs teacher verification** |

**Recommendation:** ship these tags as *claims with a verification bit*; no preset goes teacher-visible until a human confirms the board's current outcome list.

## Proof-run extra (c) — Curriculum preset proposal (guideline 7)

| Preset | Visible states | Note |
|---|---|---|
| CBSE/NCERT (+JEE/NEET) | **S1–S7 (all)** | The full ring set IS the Indian lesson — no compromise |
| CAIE 9702 | S1, S2, S3, S7 | Core ring only; S4–S6 hidden pending outcome verification; energy sibling required to finish the topic |
| Cambridge IGCSE 0625 | *(none shipped)* | Believed absent; opt-in fallback S1, S7 |
| IB DP (2023) | *(none shipped)* | Believed removed; **legacy-HL** preset for retake teachers: S1–S5, S7 |
| AP Physics 2 | S1–S5, S7 | Algebra-based; S6 derivation hidden (available on unhide) |
| AP Physics C: E&M | **S1–S7 (all)** | Derivation expected |
| Ontario SPH4U | S1, S2, S3, S7 | Pending verification |

**Coherence check (guideline 1's test):** hide S6 → coherent extended lesson; hide S4–S6 → coherent core lesson ending at C = Q/V + explore. No hidden state is referenced by a surviving state's narration.

## Proof-run extra (d) — GUIDELINE FRICTION REPORT

1. **DEPTH RINGS — helpful, one real doctrine collision.** The ordering is what CBSE authoring wants anyway, so rings cost nothing. BUT "advanced material in a contiguous TAIL" collides with Rule 31's explore-last law: S7 must be final, so the advanced ring can never be strictly trailing — the cut is "hide S6," a block immediately *before* explore. Rule 31 outranked. **Proposed amendment:** "the advanced ring is a contiguous block immediately BEFORE the explore state; the explore state is ring-neutral and visible in every preset."
2. **NOTATION LADDER — free here, but only because capacitance is algebra-clean.** Its one real contribution was forcing the decision that dQ/dt belongs to the RC sibling. The genuine stress test comes at RC circuits and Gauss-route derivations — don't judge its cost from this concept.
3. **DIALECT DISCIPLINE — cheap and genuinely useful.** ≈10 minutes: one dual label ("Voltage V (p.d.)" first appearance), "battery" over "cell", "permittivity of free space" spoken. Caught a trap that would have shipped. Zero compromise to CBSE.
4. **GRAPH CONVENTION — helpful, with one real (small) cost.** Forced an explicit axis decision (Q-on-y, slope = C) serving CBSE/AP/legacy-IB; boards printing p.d.-on-y get the S7 toggle. **That toggle is the first line-item of engine work this doctrine has caused.** The deeper convention fight (area under which curve = energy) belongs to the energy sibling.
5. **UNIVERSAL APPLICATION — free, and it caught a fleet issue.** Rule 35 already forced universality. Side-catch: the shipped sibling `parallel_plate_capacitor_field` anchors on a **ceiling-fan regulator capacitor** — Rule-35-legal but regionally flavoured to UK/US teachers; recommend an anchor swap on its next touch (35e).
6. **TAG AT BIRTH — the expensive one, and the only guideline that could not be fully executed.** It demands current syllabus knowledge that authoring-time model memory cannot guarantee; the web-search budget was exhausted, so five of seven cells carry "needs teacher verification." If tags ship unverified they WILL rot. **If this becomes a rule, pair it with a verification workflow** and treat architect tags as claims, not facts.
7. **CURRICULUM PRESETS — nearly free once rings exist.** Ten minutes, pure data, no engine work. Wrinkle: presets hide *states*, not *sliders*, so a core-preset teacher still sees A/d sliders in S7 — accept as harmless enrichment rather than inventing per-preset control hiding (which would be engine work). Compatible with Rule 25d (presets hide, never reorder).

**Overall:** no guideline forced ANY compromise to the CBSE/JEE-depth lesson — the Indian lesson is the full ring set, and every ring boundary fell on a line the CBSE arc wanted anyway. Added authoring cost ≈ 45–60 min, concentrated in guideline 6 (which carries the only ongoing risk: verification debt). Guidelines 1, 3, 4 earned their keep; 2, 5, 7 were ~free; 6 needs a workflow before it becomes law.

---

## Escalations / FLAGs for downstream

1. **Engine delta first (§0b)** — json_author must NOT start until `peter_parker:renderer_primitives` lands `scenario_type: "capacitance"`. Shipped-sibling baseline regression is in the DoD.
2. **quality_auditor:** re-run the live `engine_bug_queue` SQL at Gate 8; confirm the Ch.2 assessment-inclusion precedent.
3. **Sibling queue seeded:** `capacitor_energy_storage` (needs the axis-toggle graph — area under the curve), `dielectric_in_capacitor`, `combination_of_capacitors`. The 9702/AP-C preset gaps close only when the energy sibling ships.
4. **Anchor discipline:** camera flash / defibrillator / touchscreen live in NARRATION only.
5. **Fleet note:** consider a Rule-35e anchor swap on `parallel_plate_capacitor_field` at its next touch.
