# founder-proxy — Checkpoint A (design gate) — `ac_voltage_capacitor` (Ch.7 #3, cycle 0)

> **Provenance note (added at Checkpoint C, 2026-07-23).** This report was returned by the founder-proxy
> dispatch but the loop session did not persist it to disk at the time — a process miss caught by
> founder-proxy's own Checkpoint C audit (finding C3). Persisted here by the LOOP SESSION from its
> retained dispatch result, so that concept 3's design-gate reasoning exists in the handover record
> alongside concepts 1 and 2. Content is unedited; only this note was added.
>
> **Attribution (founder-proxy, Checkpoint C re-verify).** founder-proxy independently re-derived and
> confirmed the CORRECTNESS of every physics claim and every line-specific claim in this report, but
> **cannot attest to verbatim identity** across dispatches — its context does not persist between
> dispatches, so it has no memory of the Checkpoint-A dispatch itself. The loop session, which holds the
> retained dispatch result, is the party vouching for fidelity. Recorded so the file does not imply
> founder-proxy certified something it structurally cannot.

## VERDICT: `DESIGN_FIX` (1 finding, owner `alex:architect`) — fix cycle 0 → 1

The physics is independently verified correct in every locked number; the engine triage is properly
scoped and the clone manifest is sound; the 9-state arc, the three pivots, the S4 PRIMARY aha, and the
full Rule-38 curriculum-flex all hold up on their own merits, not merely as a mirror. This is strong,
careful design — the L↔C inversions were genuinely re-derived, not relabeled. **One design-precision gap
blocks DESIGN_OK:** the "no Unicode subscript c" glyph plan (§0b req 7 / §10b) prescribes a tool (the B2
auto-width + Cambria-font fallback) that *cannot produce its own stated output*, and leaves the
source-string convention undefined — so the autonomous engine dispatch would build a Checkpoint-B defect
(a visible underscore, a blob, or a side-by-side "Xc"). This is exactly the precision the OPEN directive
scar `field3d_new_scenario_engine_ask_precision_checklist` — explicitly scoped to this dispatch — exists
to force. Catching it now saves an engine cycle + re-review at Checkpoint B.

---

## Scrutiny point 1 — Physics internal consistency + derivation: VERIFIED CORRECT

Re-derived from `q = Cv → i = C dv/dt` independently (not from the sibling). Every locked number checks:

| Claim | Independent check | Verdict |
|---|---|---|
| ω = π/2 | 2πf = 2π(0.25) = π/2 | ✓ |
| X_C = 5.00 Ω exactly | 1/(ωC) = 1/((π/2)(0.4/π)) = 1/0.2 = 5.00 | ✓ exact |
| iₘ = 2.00 A | ωCvₘ = 0.2×10 = 2.00 = vₘ/X_C | ✓ |
| **Lead = 1.0 s = T/4** | i = iₘcos(ωt) crests t=0,4,8 s; v crests t=1,5 s → each i-crest precedes the next v-crest by 1.0 s | ✓ **leads, not lags** |
| Ghost is real trace exactly inverted | sin(ωt+π/2) = cos(ωt) = −sin(ωt−π/2) | ✓ identity holds |
| q_max = 1.27 C, f-independent | Cvₘ = 4/π = 1.273; check iₘ = ωq_max ✓ at all f | ✓ |
| Max v-slope → i | ωvₘ = 5π = 15.7 V/s; i = C·15.7 = 2.00 A | ✓ |
| **p = +(vₘiₘ/2)sin 2ωt (STORE-first, opposite sign to inductor)** | vₘiₘ sin(ωt)cos(ωt) = +(vₘiₘ/2)sin2ωt; at t=0⁺ v↑ & i>0 → p>0 → store quarter. Inductor gives −(vₘiₘ/2)sin2ωt | ✓ **sign correct, opposite the sibling** |
| ±10 W, ⟨p⟩ = 0 | amplitude vₘiₘ/2 = 10; symmetric | ✓ |
| U_max = 6.37 J, peaks at v-crest, echoes ½Liₘ² | ½Cvₘ² = 20/π = 6.366; ½Liₘ² = ½(10/π)(4) = 20/π | ✓ echo confirmed |
| S5 sweep X_C = 1.25/f | f=0.1→12.5Ω/0.80A; 0.25→5.00Ω/2.00A; 0.5→2.5Ω/4.00A; q_max pinned 1.27C | ✓ 5× swell, inversion of sibling's 5× collapse |
| Edge corners | hot (20,0.5,0.4)→8π=25.1A; dead (2,0.1,0.04)→0.050A; default C=0.127 ∈ [0.04,0.40] | ✓ |

The lead-vs-lag claim, the falling reactance, and the +sin 2ωt power sign are all independently correct.
The store-quarter-first physical reasoning for the sign flip is sound.

**One minor accuracy slip (NOT blocking, flag forward to physics_author):** §2 writes the store-lobe area
as `vₘiₘ/(2ω)·(1−cos π) = 20/π`. As written the intermediate is 2× too large —
`vₘiₘ/(2ω)·(1−cos π) = (20/π)·2 = 40/π`. The correct coefficient is `vₘiₘ/(4ω)·(1−cos π)`, or cleanly
`∫₀^{1s} 10·sin(πt)dt = 20/π`. **The final answer 20/π = 6.37 J is correct** (and equals U_max, as it
must), so this is purely a shown-intermediate slip — but it must be corrected so the S8 derivation panel
and any narration don't inherit it.

---

## Scrutiny point 2 — Engine triage (§0b, Class-B): PROPERLY SCOPED, manifest sound

- **Class-A honestly rejected, both candidates:** extending `ac_inductor` pure-JSON is refuted with six
  *specific* hard gaps (phase hard-coded −π/2; no plates/E-field/charge visuals; opposite-sign HUD; U keyed
  to i not v; tangent on effect not cause; iₘ rising not falling). Extending shipped `capacitance` refuted
  (DC/electrostatics, no scope pane). These are real gaps, not pro-forma. ✓
- **Scope is correct:** NEW `scenario_type: "ac_capacitor"`, clean standalone sibling, cloning the
  **POST-FIX** ac_inductor code (35ae566 + eae16ca) — so it inherits the F1 clearRect fix, F2 label
  placement, and F3 HUD ring-gate as **binding clone duties**. Correct scar-ratchet behavior.
- **The DF1 lesson from the inductor cycle was pre-applied, not re-learned:** the skeleton explicitly
  forbids refactoring EITHER sealed sibling, flags the clone manifest as "advisory NOTE — never a
  mandate," and notes the DF1 factoring condition has now *ripened* (3 family members) but routes that
  decision to the founder at chapter end with `series_lcr_circuit` in view. Exactly right.
- **Regression duty is complete:** `capacitance` 44/44 H2 0.00% + BOTH sealed siblings re-run 39/39 + the
  zero-`acr`/`acl`-internal-lines diff grep.

Clone manifest decomposition is complete and correct; the NEW asks (charge-accumulation band, lead-phase
trace, fill/spill, tangent-on-**v**, inverted ramp iₘ=ωCvₘ, U=½Cv² keyed to voltage) are all genuinely
un-clonable-as-config. Triage sound.

---

## Scrutiny point 3 — The "no Unicode subscript c" glyph plan: **NEEDS TIGHTENING → this is the DESIGN_FIX**

The hazard is correctly identified and real. Verified against the Unicode subscript block: subscript
letters that exist are a e h i j k l m n o p r s t u v x — **there is genuinely no subscript c, b, d, f,
g, q, w, y, z anywhere in Unicode.** The inductor's `ₗ` (U+2097) and the resistor's `ᵣₘₛ` all exist;
`X_C`/`v_C` cannot be a codepoint. Confirmed: the hazard is real and harder than either sibling's.

But the *plan* is inadequate in two concrete, demonstrable ways:

**(a) The prescribed mechanism cannot produce its stated output.** The skeleton says render X_C/v_C via
"the B2 auto-width helper + Cambria-Math font". B2's fix (`pmCreateAutoLabel` + a `9px monospace →
Cambria Math` swap) *measures/fits a canvas* and *renders an existing glyph legibly* — it never
*composes* a subscript from two draws. Feed "X_C" to `pmCreateAutoLabel` + Cambria and you get "X_C" with
a visible underscore; feed "Xc" and you get "Xc" side-by-side. Neither is a styled subscript. On the DOM
path a `<sub>`/CSS span is trivial, but **on the ctx.fillText canvas path and the createLabelSprite
sprite path, a true styled subscript requires a genuinely NEW compose routine** (draw the base letter at
full size, then "c" at reduced size + lowered baseline, x-advanced by the base glyph's measured width).
That routine does not exist in the ac_inductor clone source (which passed a real `ₗ` codepoint straight
through), so calling it "the B2 fallback" mis-scopes it as a clone when it is new machinery.

**(b) The source-string convention is undefined.** Because no codepoint exists, json_author/physics_author
cannot type the intended character into `formula_text` (S5: "X_C = 1/(ωC)", "iₘ = vₘ/X_C") or the HUD
source (v_C first at **S3**, X_C readout at S5). The skeleton says "never ASCII X_C with a visible
underscore" but never states what json_author *does* write, nor that the engine must detect-and-style it.
Three roles (physics_author, json_author, engine dispatch) must agree on one convention or the build is
ambiguous.

**Why this blocks (not a ride-along note):** the OPEN directive scar
`field3d_new_scenario_engine_ask_precision_checklist` — explicitly scoped to "the remaining Ch.7
concepts, i.e. THIS dispatch" — exists precisely because "anything not named in the §0b ask is not built"
by the autonomous engine dispatch. A no-codepoint subscript compose routine + its source convention is
exactly such an unnamed precision item. Left as-is, the engine dispatch clones ac_inductor's
pass-through-Unicode approach and produces a Checkpoint-B defect. Per the PRIME DIRECTIVE, building the
routine right beats cloning-and-hoping, and Checkpoint A is the highest-ROI place to force it.

---

## Scrutiny point 4 — Pedagogy: HOLDS UP ON ITS OWN MERITS

| State | ring | Design coherence | Order OK | Distinct-Δ | Note |
|---|---|---|---|---|---|
| S1 phenomenon | core | ✓ full-flood-at-v=0 + frozen-at-crest plants, beads stop at plates | ✓ | ✓ apparatus swap | Two unnamed plants correctly seeded for S2/S4 payoff |
| S2 lead (pivot #1) | core | ✓ coil-ghost drawn first, real trace crests early, exact inversion | ✓ | ✓ i-trace + lead bracket | Confronts the freshest prior at the front door — strongest possible pivot |
| S3 fill/push-back | core | ✓ A→B→A′, v_C tracks volt-for-volt, no bead crosses gap | ✓ | ✓ charge band | v_C HUD needs the styled-c routine |
| S4 **PRIMARY** tangent-on-v | core | ✓ tangent on the CAUSE trace (inverts sibling's on-effect); 3 stops verified (+2.00/0/−2.00 A); live vₘ (DF2) | ✓ | ✓ tangent | Inside foundational → coverage rule satisfied, no exit-pill |
| S5 reactance falls (pivot #2) | extended | ✓ inverted ramp, X_C 5.0→2.5 Ω, q_max pinned | ✓ | ✓ X_C readout | The "everything runs backwards" beat; f-lock correct |
| S6 power swings | extended | ✓ signed ±p-strip, U-gauge keyed to v-crest | ✓ | ✓ p-strip | Sign/timing differ from sibling — real code change, correctly noted |
| S7 zero power (pivot #3) | extended | ✓ dead needle amid live sloshing; heater contrast | ✓ | ✓ meter | Round-two power paradox, harder than coil's |
| S8 derivation | advanced | ✓ one derivative → both results; ωC upstairs = inversion | ✓ | ✓ formula | Contiguous advanced, before explore |
| S9 explore | core | ✓ core-only (p/X_C/q/U absent, F3-gated), all sliders live | ✓ | ✓ drag-sandbox | 38b satisfied mechanically |

- **Three pivots (S2/S5/S7)** sit at genuine belief-conflict points, each a contrast beat with the wrong
  expectation drawn first; exactly three, no per-state tic (Rule 16a). The "current crosses the gap"
  misconception is correctly handled as straightforward teaching + a load-bearing visual, not inflated to
  a 4th pivot. ✓
- **PRIMARY aha S4** is well-placed and genuinely distinct from the sibling (tangent rides the cause trace
  v, i responds). Investment-follows-stuckness rationale (S4 over pivot S5) is sound. ✓
- **Chapter-scale sophistication:** the L/C-interchangeable trap is deliberately left as the tension
  `series_lcr_circuit` resolves; the X_L = X_C = 5.00 Ω shared-defaults resonance point is a deliberate
  handoff seed with the S7 "same size, opposite clock" whisper as the only permitted mention. ✓
- **Rule 38 checked in FULL:** 38a ring order + contiguous advanced + BOTH cuts coherent ✓; 38b explore
  core-only ✓; 38c notation ladder ✓; 38d dialect ✓; 38f widest-overlap anchor (crossover capacitor — the
  sibling coil's other half) ✓; 38g tags-as-claims with `needs_teacher_verification` on every non-CBSE
  cell ✓.
- **Anchor (Rule 35):** culture-neutral, universal, no country-specific content, no duplication of
  capacitance's flash anchor. ✓

No pedagogical DESIGN_FIX. The arc, pivots, aha, and curriculum-flex are sound on their own merits.

---

## Findings

**F1 — P1 (blocks DESIGN_OK) — glyph contract under-specified — owner `alex:architect`.**
Two required edits:
1. **Re-scope from "B2 fallback" to a NEW styled-subscript COMPOSE routine.** State that, because no
   subscript-c codepoint exists, the canvas (`ctx.fillText`) and sprite (`createLabelSprite`) paths must
   **compose** the subscript (base letter full-size, then "C" at reduced size + lowered baseline,
   x-advanced by the measured base-glyph width) — genuinely new machinery absent from the ac_inductor
   clone source. The DOM/HUD path may use `<sub>`/CSS.
2. **Name the source-string convention** connecting json_author/physics_author output to that rendering:
   json_author writes the ASCII tokens `X_C`/`v_C` in `formula_text` and HUD source, and the engine
   compose routine detects `_C` and styles it, **never emitting the underscore**. Pin the case (capital C
   throughout) so all three roles agree.

**F1b — P3 (bundle into the same architect cycle) — store-lobe intermediate slip.** §2's shown
intermediate `vₘiₘ/(2ω)·(1−cos π)` is 2× too large; correct is `vₘiₘ/(4ω)·(1−cos π)` (or
`∫₀^{1s}10 sin(πt)dt = 20/π`). Final 20/π = 6.37 J is correct.

Max 2 DESIGN_FIX cycles before ESCALATE; this is cycle 0→1, well within budget. No physics-correctness
doubt (physics verified) and no engine defect on screen (nothing built) → not ESCALATE, not FIX(engine).

---

## Candidate scar row (ratchet — files only, founder rules at chapter end)

This finding is an instance of the existing OPEN directive
`field3d_new_scenario_engine_ask_precision_checklist`. Rather than mint a duplicate `bug_class`, extend
that directive with a 5th precision item (upsert key is `bug_class`): for any on-canvas
subscript/superscript whose glyph has NO Unicode codepoint, the §0b ask must name a NEW styled-subscript
COMPOSE routine for the `ctx.fillText` and `createLabelSprite` paths — NOT the B2 auto-width+Cambria
fallback, which only re-fits/re-fonts an EXISTING glyph and cannot compose one — AND the source-string
convention json_author/physics_author write.

---

## What is strong (do NOT touch on the fix cycle)

The physics derivation, the Class-B triage + sealed-sibling protection + ripened-DF1 deferral, the
9-state arc, the three pivots, the S4 tangent-on-v PRIMARY aha with live vₘ (DF2), the
L/C-interchangeable-trap handling, the X_L=X_C resonance handoff seed, the full Rule-38 block, and the
crossover-capacitor anchor are all DESIGN_OK-grade and should be preserved byte-identical. The only edits
needed are F1 (§0b req 7 + §10b glyph contract) and F1b (§2 store-lobe intermediate). Re-review scope on
cycle 1: those two spots only.
