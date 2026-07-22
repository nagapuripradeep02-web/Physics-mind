# FOUNDER-PROXY — CHECKPOINT A (DESIGN GATE) — `ac_voltage_resistor`

**Trial:** CHAPTER_LOOP Stage 1b · Ch.7 concept 1/8 · Checkpoint A · fix cycle 0 (first review)
**Skeleton reviewed:** `C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7\ac_voltage_resistor\skeleton.md`
**Renderer proposal:** `field_3d`, NEW `scenario_type: "ac_resistor"` (Class-B triage; §0b engine delta declared FIRST, to run in-loop via CHAPTER_LOOP §3b before physics_author/json_author start)

---

## 1 · VERDICT — `DESIGN_FIX` → routed to `alex:architect` (2-cycle budget, this is cycle 0)

This is one of the strongest skeletons in the corpus, and I want that on the record before the fix list: the **core design is APPROVED and must NOT be reopened.** The state arc, ring plan, archetype set, macro↔micro stories, universal anchor, three-pivot misconception plan, renderer decision, and — critically — the self-flagged Rule-32a in-phase caution are all correct, and several are exemplary. The physics checks out end-to-end (no ESCALATE trigger; worked below).

I am nonetheless returning `DESIGN_FIX`, for one reason the dispatch names explicitly: **"if you find the … engine ask under-specified … that's a DESIGN_FIX routed to alex:architect."** The §0b engine ask — the load-bearing artifact that the §3b engine dispatch will execute *without a founder in the room* — has four genuine precision gaps, two of which would let the downstream engine build **re-create a known, already-scarred defect class** or **build a physics-wrong morph.** Catching these in the ask (a cheap wording tighten to §0b/§3, no arc rework) is exactly the "mediocre spec caught here saves a 2-hour build of the wrong sim" case my role exists for. Per the PRIME DIRECTIVE, tightening the ask now is the higher-quality path even though it costs a design cycle.

**The fix is bounded and surgical:** amend §0b (the engine ask) and two cells of the §3 table. Do not touch the arc, rings, anchor, misconception pivots, or renderer choice — all APPROVED.

**Not an ESCALATE:** no physics-correctness doubt (all numbers reconcile — see §5), and this is cycle 0 (no budget pressure).

---

## 2 · Pass-1 scar ratchet — what I checked (ran, not asserted)

Queried the live `engine_bug_queue` via `src/scripts/query_engine_bug_queue.ts` (`--field3d --open`, and `ac_generator` — the named clone source), plus read all five Stage-1a `scar_candidates.sql` blocks and `ch7_engine_log.md`.

**FIXED classes on the clone source (`ac_generator`) — must be preserved by the clone-and-retint, NOT silently dropped:**
- `bulb_glow_not_modulating` (FIXED) — a live-quantity-driven emissive must drive its emissive every frame AND be **exempted from `applyGlowEmphasis`**, or the glow system's frame-0 restore clobbers the modulation. **Directly at risk here** → Finding F3.
- `graph_marker_label_clipped` (FIXED) — graph-annotation labels must be clamped into the panel rect. This scenario has ≥4 named graph annotations (vₘ line, Vᵣₘₛ line, ⟨p⟩ line, iₘ marker, zero baseline) → Finding F6 (verify-inherited).
- `label_sprite_wide_string_clipped` (FIXED) — `createLabelSprite` must size to measured glyph width. S7's chained formula surface is a wide string → Finding F6.

**OPEN classes that this design touches:**
- `field3d_sliders_panel_top12_vs_fsbtn_top10` (OPEN) + `cyclotron_timers_sliders_fullscreen_button_corner_collision` (OPEN) — the Rule-34d chrome collision. **The skeleton handles this well** (§0a last row, §0b req 7, §10h zone map all specify `top:52px+`). No finding — correctly ratcheted.
- `ghost_compare_cause_invisible_slider_frozen` (OPEN) — a scripted variable-sweep that drives a slider-backed variable must move the DOM thumb + numeric label in lockstep (Rule 32a). **Directly at risk on S6's scripted "dial winds down."** → Finding F1.
- `field3d_formula_overlay_generic_not_cambria_math` (OPEN) — the generic `#formula_overlay` still renders 13px monospace, violating Rule 34b. If the new scenario reuses it, it inherits an OPEN violation → Finding F4.

**Stage-1a `scar_candidates.sql` (this run's accumulated files):** all five blocks are `particle_field`-specific (the chrome-collision engine fix). As the dispatch notes, the **Rule-34d top-anchor PATTERN** carries over to every new field_3d overlay this skeleton adds — and the skeleton has already ratcheted it (`top:52px+`, §10h). No recurrence.

**Stage-0 calibration cross-check (the founder-taste corpus):** the single highest-value Stage-0 catch was the **dead-guided-slider class** (`capacitance` S2–S5 sliders clobbered by the scripted ramp — "exceeded the founder's own report"). This skeleton has **three** guided states with live controls (S1 `f`, S2 `R`, S6 `V_dc`) — a larger guided-control surface than `capacitance` had — and the engine ask does not name the drag-seize guard. That is exactly the gap that slipped every gate until `founder_drive` was extended. → Finding F1 (this is the load-bearing one).

---

## 3 · Design-level per-state assessment (Checkpoint-A substitute for the Pass-4 table — no built frames exist yet)

| State | ring | Teaches (one idea) | Archetype (distinct?) | Non-static? | Misconception pivot | Design verdict |
|---|---|---|---|---|---|---|
| S1 `ac_swings_both_ways` | core | AC = magnitude AND direction both vary | `oscillate/track` ✓ | beads rock + arrow flips + v-trace draws ✓ | — (plants "peak=THE number", intentional, §Block2) | **OK.** `f` is the right safe control (leaves the deliberate vₘ plant + amplitude story undisturbed). |
| S2 `ohm_at_every_instant` | core | i = v/R every instant → in phase | `reveal-build` ✓ | drag R → i shrinks, v untouched ✓ | — (Ohm-is-DC-only handled straightforwardly, correct) | **OK — with F1 (drag-seize on R) + verify 32a handling (see §4).** |
| S3 `both_halves_heat` | core | reversed half heats equally | `cycle-compare` ✓ | E climbs through both halves ✓ | **Pivot 1** ("reversal undoes") — contrast beat ✓ | **OK.** `heater` as glow_focal collides with its p(t) emissive → F3. |
| S4 `power_never_negative` | core | p = v·i ≥ 0 always (L/C baseline) | `trace-product` (coin) ✓ | product-walk, p-bar rises even at (−)×(−) ✓ | — (SUPPORTING AHA) | **OK.** Coin justified. Foreshadow clause routes to LATER concepts, not hidden states (ring-cut safe). |
| S5 `the_zero_average_paradox` | extended | ⟨i⟩ = 0 exactly | `null-result-hold` (coin) ✓ | needle dead BUT beads/glow/E live ✓ | **Pivot 2** ("average rates AC") ✓ | **OK.** The "static focal, live background" is correctly handled (§0a). |
| S6 `rms_the_dc_equivalent` | extended | **PRIMARY AHA** — rating = 0.707vₘ | `twin-compare` (coin) ✓ | dial winds down, glows lock ✓ | **Pivot 3 (PRIMARY)** — dial starts at wrong answer ✓ | **OK design — but F1 (dial must move DOM thumb in lockstep + seize on teacher drag).** |
| S7 `square_mean_root` | extended | square→mean→root; Iᵣₘₛ=iₘ/√2 | `fold-and-settle` (coin) ✓ | lobes transform, mean settles ✓ | — | **F2: "fold up into i²" is geometrically wrong** (fold gives \|i\|, not i²). Intent (square, meter A²) is clear elsewhere — tighten the verb. |
| S8 `why_half` | advanced | ⟨sin²⟩ = ½ (geometry + identity) | `chain-link-derivation` (fleet reuse) ✓ | chop-flip morph, apparatus dimmed ✓ | — | **OK — genuinely elegant.** chop-above-½/fill-below-½ is geometrically exact (§5). Contiguous advanced ring before explore ✓. |
| S9 `ac_resistor_sandbox` | core (ring-neutral) | synthesis | `drag-sandbox` ✓ | free-runs (Rule 37) ✓ | — | **OK.** Explore = core-only (`i=v/R`, live v/i/p); rms deliberately excluded (strict 38b) ✓. F1 also applies (all sliders live). |

**Rubric sweep (design-level):** depth rings + BOTH ring-cuts coherent (38a) ✓ · 9 distinct archetypes, none static, per-state control table complete (31) ✓ · macro↔micro plan per-state-distinct with real numbers (33) ✓ · universal widest-overlap anchor, mains neutral (35/38f) ✓ · exactly 3 genuine misconception pivots, contrast beats, no per-state tic (16a) ✓ · notation ladder clean — **no calculus anywhere**, ⟨sin²⟩ proved geometrically not by ∫ (38c) ✓ · cross-board dialect dual-labelled, NCERT lowercase-v/i convention matched (38d) ✓.

---

## 4 · Findings (each: severity, evidence = skeleton section + quote, routed owner)

All findings route to **`alex:architect`** (Checkpoint A). The engine-side items are precision-of-the-ASK corrections to §0b, NOT `FIX(engine)` — that verdict only exists at Checkpoint B, after something is built. The point is to make the §3b engine dispatch executable without re-litigating architecture.

### F1 — P1 — Engine ask omits the drag-seize guard for THREE guided-state live controls (recurrence risk of the Stage-0 dead-slider class + OPEN `ghost_compare_cause_invisible_slider_frozen`)
**Evidence:** §3 table declares live controls in guided states — S1 `f`, S2 `R` ("Dragging R live: i-trace amplitude shrinks/grows"), S6 `V_dc` ("The dial winds down …"). §0b req 7 names only "Rule 27 explorer pattern — stable IDs + params" and the `#sliders` exclusion chain. **Neither §0b nor §3 requires (a) that a teacher drag SEIZES control from the state's scripted animation, nor (b) that S6's scripted `dial winds down` move the DOM slider thumb + numeric label in lockstep.**
**Why it's P1:** This is the exact class the founder personally caught on `capacitance` (Stage-0 §2: "guided-state sliders (S2–S5) dead on drag — scripted ramp clobbers the dragged value"), and S6's scripted dial-sweep is the exact `ghost_compare_cause_invisible_slider_frozen` OPEN scar (scripted sweep must move the thumb in lockstep). `founder_drive` now drives guided-state sliders specifically because of this class — so a build without the guard fails at Checkpoint B and burns an engine cycle. The engine dispatch runs autonomously; if the ask is silent, the guard won't be built.
**Fix (route to architect):** add to §0b (and cross-reference the S1/S2/S6 rows of §3): "every guided-state live control (`f` S1, `R` S2, `V_dc` S6) implements the drag-seize guard — a `PM_*Dragged` flag that halts the scripted animation for that variable on user input, per the `capacitance` fix pattern; and S6's scripted dial-wind-down updates the `V_dc` slider thumb position + numeric label in lockstep with the scripted value (Rule 32a; OPEN scar `ghost_compare_cause_invisible_slider_frozen`)."

### F2 — P2 — S7 morph geometry is self-contradictory: "fold up into i²" describes rectification (|i|), not squaring (i²)
**Evidence:** §0b req 6: *"S7: i-trace's negative lobes fold up into i²."* §3 S7 row: *"the i-trace's negative lobes fold UP into the all-positive i² curve; the meter … settles at iₘ²/2 = 2.0 A²."*
**Why it's real:** Reflecting a sine's negative lobes about the x-axis yields **|i|** — pointed cusps, peak iₘ (=2), mean 2iₘ/π (≈1.27). **i²** yields rounded humps, peak iₘ² (=4, units A²), mean iₘ²/2 (=2.0 A²). They are visibly different curves with different means. The meter reading "iₘ²/2 = 2.0 A²" and the units (A²) pin the intent to **squaring**, but the animation verb "fold" would build a rectification — from which the √ step (`rms line lands at 1.41 A`) cannot be read (√1.27 ≠ 1.41). Left as-is, the engine could build a physics-wrong S7 needing a Checkpoint-B fix.
**Fix (route to architect):** replace "fold up into i²" with an explicit operation, e.g. "each trace point is **squared** (y → y², rescaling the vertical axis to A²), which also carries the negative lobes positive"; keep the meter/√ steps as written.

### F3 — P2 — Heater is both a p(t)-driven emissive AND a glow_focal (S3); the ask must preserve the `applyGlowEmphasis` exemption (FIXED scar `bulb_glow_not_modulating`)
**Evidence:** §0b req 1: heater "glows with p(t) — clone of `acg_bulb` brightness machinery." §3 S3 row lists `glow_focal = heater`; the CLOSED glow enum (§0b req 7) includes `heater`.
**Why it's real:** `acg_bulb` was fixed by **exempting** the live-driven emissive from the Rule-29 glow loop (FIXED scar: the loop's "frame-0 baseline restore clobbers the modulation every frame"). But `acg_bulb` is never *also* a glow_focal — making the heater a focal in S3 re-introduces exactly the clobber the fix removed, in a way the clone doesn't automatically cover. This is a new wrinkle, not inherited-safe.
**Fix (route to architect):** §0b req 1 must state: "the heater emissive is driven by p(t) every frame and **exempted from `applyGlowEmphasis`** (per FIXED scar `bulb_glow_not_modulating`); when `heater` is the S3 glow_focal, emphasis is expressed on peers (dimming) without overwriting the heater's live emissive."

### F4 — P2 — Formula surface must be a dedicated Cambria-Math panel, not the generic `#formula_overlay` (OPEN scar `field3d_formula_overlay_generic_not_cambria_math`)
**Evidence:** §10b/§10h require "math-serif Unicode font, e.g. 'Cambria Math'" per Rule 34b. The OPEN scar records that the shared `#formula_overlay` "renders 13px monospace, not the Cambria-Math serif Rule 34b requires."
**Why it's real:** If the new scenario routes its per-state formula surfaces through the generic overlay, it ships an OPEN Rule-34b violation on every state's equation.
**Fix (route to architect):** §0b must specify a **dedicated** Cambria-Math formula panel for `ac_resistor` (the special-cased pattern), explicitly not the generic `#formula_overlay`.

### F5 — P3 — S6 dual-circuit framing: verify the full current path of BOTH circuits stays on-canvas (FIXED scar `label_occluded_and_offcanvas_circuit`)
**Evidence:** §3 S6: "Camera widens; a twin heater on a DC supply docks beside." §0b req 5 cites `split_ring_contrast` precedent and "respect the compare-offsets scar (offsets > object extent, camera pulls back)."
**Why it's a note:** the skeleton already cites the compare-offset scar; this is a ride-along verification (that both circuits + both energy counters stay inside the canvas at the widened framing), inheritable from the cited precedent. No design change needed — flag for the Checkpoint-B frame read.

### F6 — P3 — Graph-annotation and wide-label clipping: verify inherited from the `ac_generator` clone (FIXED scars `graph_marker_label_clipped`, `label_sprite_wide_string_clipped`)
**Evidence:** §0a "Distinct reference lines" specs three separately-labelled dashed lines (vₘ peak, Vᵣₘₛ level, ⟨p⟩ mean) + iₘ marker + p-strip zero baseline label. S7's chained formula surface is a wide string.
**Why it's a note:** cloning `ac_generator`'s (post-fix) graph + label machinery inherits both clamps, and the skeleton already flagged the related ᵣₘₛ-subscript glyph risk (§10b). Ride-along: confirm at Checkpoint B that annotation labels clamp into the graph rect and the three level-line labels get vertical separation (OPEN `field3d_label_sprite_overlap`).

**Verified GOOD — the Rule-32a self-flagged risk IS handled by choreography, not merely asserted (dispatch asked me to confirm):** §3 S2 provides the cause-first beat via the **sampling cursor** ("reads v, divides by R, plants the i-dot after a readable beat") and via **slider causation** ("Dragging R live: i-trace amplitude shrinks/grows while v is untouched") — NOT via any temporal phase offset in the running traces. §3 makes it binding: *"legibility must come from the sampling/dial choreography and from slider-cause→trace-effect, NEVER from a time lag between the running v and i traces — an injected v→i delay would draw an inductor."* This is the correct mechanism and the architect anticipated the trap. Confirmed handled.

---

## 5 · Physics verification (why this is not an ESCALATE)

Every locked number reconciles, and every claim-on-screen is physically true:
- iₘ = vₘ/R = 10/5 = 2.00 A ✓ · p_peak = vₘiₘ = 20.0 W ✓ · ⟨p⟩ = ½vₘiₘ = 10.0 W ✓
- Vᵣₘₛ = 10/√2 = 7.07 V ✓ · Iᵣₘₛ = 2/√2 = 1.41 A ✓ · Vᵣₘₛ·Iᵣₘₛ = 9.97 ≈ 10 W ✓ = Iᵣₘₛ²R = 9.94 ≈ 10 ✓ = ½iₘ²R = 10 ✓
- S6 match at 0.707vₘ: V_dc²/R = Vᵣₘₛ²/R ⇒ V_dc = Vᵣₘₛ = 7.07 V ≈ "7.1 V" ✓
- p = vₘiₘsin²ωt ≥ 0 for a pure resistor (in phase) ✓ · ⟨i⟩ = 0 over a full cycle ✓ · 2f power pulse ✓
- **S8 geometry exact:** sin²ωt = ½ − (cos 2ωt)/2 is symmetric about ½, so chopping area above ½ exactly fills area below ½ → flat line at ½ (the p-strip's ½-line is 10 W of the 20 W peak). The "chop-and-flip → rectangle at ½" is a rigorous proof, not an approximation ✓.
- Bead micro-physics correct: displacement ∝ ∫i dt (90° behind current; beads fastest at i-peak, farthest at i-zero) — §3 states "displacement ∝ ∫i dt," which is right ✓. Micro-story numbers (S2 "excursion halves when R doubles" since peak displacement ∝ iₘ/ω = vₘ/(Rω); S6 "DC beads drift, AC beads rock, same E-rate") are all physically true ✓.

No physics doubt anywhere → escalation trigger 1 does not fire. Cycle 0 → trigger 2 does not fire.

---

## 6 · Candidate scar row (one directive; deliberately NOT duplicating existing rows)

At Checkpoint A nothing is rendered, so there is no `incident` to file. But F1–F4 share a **ratchet-worthy PATTERN** that the remaining seven Ch.7 concepts will hit — every one commissions a new scope-pane scenario with guided controls. One `directive` row captures it. **Trial mode: this is a FILE for the founder to rule on, never applied to the DB.**

> **Dedupe note for the founder/loop:** this directive intentionally OVERLAPS three existing rows — OPEN `ghost_compare_cause_invisible_slider_frozen` (F1's dial-lockstep half), OPEN `field3d_formula_overlay_generic_not_cambria_math` (F4), and FIXED `bulb_glow_not_modulating` (F3). It is filed as a single *architect-directed engine-ask checklist* (a different owner and lifecycle than those per-defect rows), so the founder may keep it as-is or fold it into the existing rows. I did NOT mint per-defect `incident` rows for F1/F3/F4 because their defect classes already exist in the corpus (schema discipline: check other files before minting a `bug_class`).

```sql
-- =====================================================================
-- Ch.7 Stage-1b · 2026-07-22 · founder-proxy Checkpoint A (ac_voltage_resistor)
-- DESIGN-STAGE directive (nothing built yet — this is an engine-ASK checklist,
-- not an observed sim incident). NOT APPLIED (trial: files only).
-- Overlaps existing OPEN ghost_compare_cause_invisible_slider_frozen +
-- field3d_formula_overlay_generic_not_cambria_math and FIXED
-- bulb_glow_not_modulating — founder may merge rather than insert.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'field3d_new_scenario_engine_ask_precision_checklist',
  'Every field_3d NEW-scenario engine ask (Ch.7 scope-pane family: ac_resistor and the phasors/inductor/capacitor/LCR scenarios after it) must enumerate four precision items the arch skeleton''s ask tends to omit, each of which maps to an existing scar: (1) the drag-seize guard for EVERY guided-state live control that co-exists with a scripted animation (not just the explore state) + the scripted-sweep-moves-the-DOM-thumb-in-lockstep requirement; (2) the exact morph OPERATION named (square vs rectify vs reflect), never a loose verb like "fold up into i-squared"; (3) preservation of the applyGlowEmphasis EXEMPTION for any live-quantity-driven emissive (bulb/heater) that is ALSO used as a glow_focal; (4) a DEDICATED Cambria-Math formula panel, never the generic monospace #formula_overlay.',
  'MODERATE',
  'alex:architect',
  'The §0b engine ask is what the CHAPTER_LOOP §3b engine dispatch executes autonomously; anything not named in the ask is not built. The ac_voltage_resistor ask (cycle 0) named the Rule-34d top:52px chrome clearance well but omitted the four items above — two of which (drag-seize on 3 guided controls; loose fold-vs-square morph) would rebuild a Stage-0 founder-caught class or a physics-wrong mean. The rest of Ch.7 reuses this same scope-pane family and will hit the same omissions.',
  'A field_3d new-scenario engine ask does not pass Checkpoint A until §0b/§3 explicitly state, per guided state with a live control, the drag-seize + thumb-lockstep behaviour; per morph, the arithmetic operation on trace points; per live emissive that is also a glow_focal, the applyGlowEmphasis exemption; and that formula surfaces use a dedicated Cambria-Math panel. Cross-reference the existing rows ghost_compare_cause_invisible_slider_frozen, bulb_glow_not_modulating, field3d_formula_overlay_generic_not_cambria_math so the engine dispatch inherits their fixes rather than re-deriving them.',
  'manual',
  'MANUAL (design-review gate): at Checkpoint A, grep the skeleton''s §0b + §3 for the four items; at Checkpoint B, founder_drive drags every guided-state control (harness extended post-Stage-0) and the frozen frames confirm the morph shape + heater modulation + Cambria-Math formula font.',
  'OPEN',
  ARRAY['ac_voltage_resistor']::text[],
  ARRAY[]::text[],
  'ch7-stage1b-ac_voltage_resistor-checkpointA',
  'directive'
);
```

Schema self-check: `probe_type='manual'` ✓ · `row_type='directive'` ✓ · `severity='MODERATE'` (P2) ✓ · `fixed_in_files`/`concepts_affected` are `ARRAY[…]::text[]`, non-NULL ✓ · `bug_class` is new (not in the Stage-1a candidate file, nor a live-row name) ✓.

---

## 7 · Key sections for the founder's eventual review (read these first)

1. **`skeleton.md` §0b (the engine ask)** — the artifact that will commission a brand-new field_3d scenario autonomously. This is the largest single new-scenario ask in the fleet's history; F1–F4 are all corrections *to this section*. Read it against the four checklist items above before the engine dispatch fires.
2. **`skeleton.md` §3, rows S2 / S6 / S7** — S2/S6 carry the drag-seize gap (F1); S7 carries the fold-vs-square ambiguity (F2). These three cells are the entire scope of the requested DESIGN_FIX.
3. **`skeleton.md` §10(i-1) — the both-directions ring-cut coherence check** — this is exemplary and worth the founder seeing as a model for the rest of Ch.7; both cuts (hide advanced; hide advanced+extended) leave a coherent lesson, verified against forward-references.
4. **`skeleton.md` §Block 2 (aha designation) + §4 (misconception pivots)** — the S1–S4 "peak = THE number" plant → S5 kills "average" → S6 reveals rms wrong-belief architecture is the strongest piece of teaching design in this skeleton; approved as-is.
5. **The Rule-32a in-phase caution (§3)** — confirmed genuinely handled by sampling-cursor + slider choreography, not asserted. This is the one binding physics-legibility constraint for the whole concept; the architect anticipated it correctly. Do not let any later cycle add a v→i time lag or a phasor arrow (the latter is `phasors`' reveal).

---

**Routing summary:** `DESIGN_FIX` → `alex:architect`, cycle 1 of 2. Scope = amend §0b + §3 rows S2/S6/S7 per F1–F4 (F5/F6 are Checkpoint-B verify notes, no design change). **Core design APPROVED — arc, rings, archetypes, anchor, misconception pivots, renderer decision, and 32a handling must NOT be reopened.** On re-submission I will re-review only the amended engine ask and the three table cells. No new scenario work should be commissioned until §0b names the drag-seize guard and the square (not fold) morph.
