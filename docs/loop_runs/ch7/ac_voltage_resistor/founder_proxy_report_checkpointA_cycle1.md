# FOUNDER-PROXY — CHECKPOINT A (DESIGN GATE) — `ac_voltage_resistor` — cycle 1 of 2

**Re-review of:** architect's cycle-1 amendment (skeleton overwritten in place) against cycle-0 `DESIGN_FIX` (findings F1–F4).
**Scope of this pass:** verify F1–F4 landed *correctly* (not just "words added"); confirm no out-of-scope movement; re-verdict.

## 1 · VERDICT — `DESIGN_OK`

All four findings landed correctly and completely; several are tightened *beyond* what was asked. Nothing out-of-scope moved — the edits are confined precisely to §0b (reqs 1, 4, 6, 7) and the S1/S2/S6/S7 rows of §3, exactly the dispatched scope. The F2 correction is geometrically consistent and its settle/√ numbers reconcile to the corrected squaring operation. No new physics doubt arose, so no ESCALATE. The skeleton is **handoff-ready to physics_author.**

One P3 non-blocking residue is noted in §4 below (an out-of-scope taxonomy label the architect correctly left untouched); it does not affect the verdict.

## 2 · F1–F4 landing verification (did the fix DO what the finding asked)

**F1 — drag-seize guard on all three guided controls + S6 thumb-lockstep — LANDED (fully).**
§0b req 7 now reads: *"drag-seize guard on EVERY guided-state live control (`f` S1 · `R` S2 · `V_dc` S6): each implements a per-variable 'dragged' flag that HALTS that variable's scripted animation the moment the teacher touches its slider, per the `capacitance` fix pattern … and S6's scripted dial-wind-down drives the `V_dc` DOM slider thumb position + its numeric label in LOCKSTEP with the scripted value (Rule 32a; OPEN scar `ghost_compare_cause_invisible_slider_frozen`) — the scripted sweep and a live teacher drag must never fight, and both move the same visible thumb + label."* This is the exact behaviour F1 demanded, and the added clause "must never fight, and both move the same visible thumb + label" makes the anti-clobber contract explicit. Cross-references landed in all three rows: S1 `f (demo; drag-seize guard — §0b req 7)`; S2 `teacher drag SEIZES R from any scripted motion — drag-seize guard, §0b req 7` + control cell tag; S6 `a teacher grab of the dial SEIZES it (drag-seize guard, §0b req 7)` + control cell `V_dc (match dial; drag-seize + thumb-lockstep — §0b req 7)`. This is the load-bearing P1; it is closed.

**F2 — "fold up into i²" → explicit squaring — LANDED (fully) and geometrically consistent.**
§0b req 6 and the S7 row both now read: *"the i-trace is SQUARED point-by-point — each trace point maps y → y², the vertical axis rescaling to A² (the squaring also carries the negative lobes positive; … explicitly NOT a fold/reflection about the axis — reflecting would build |i|, peak iₘ, mean 2iₘ/π, from which the √ step cannot land at 1.41 A; squaring builds i², peak iₘ², mean iₘ²/2 = 2.0 A²)."* This is not just re-worded — it names the operation (y→y²), states the axis units change (A²), and encodes the *reason* the wrong operation is wrong. The numbers still connect to the corrected operation, exactly:
- i(t)=iₘsin ωt, iₘ = vₘ/R = 2.00 A → i² = iₘ²sin²ωt.
- mean = iₘ²·⟨sin²⟩ = 4·½ = **2.0 A²** = the meter's `iₘ²/2` settle. ✓
- √(2.0 A²) = **1.41 A** = the rms line = iₘ/√2. ✓
- ⟨p⟩ = Iᵣₘₛ²R = 1.41²·5 = **10.0 W**. ✓
- The rejected fold path (|i|: mean 2iₘ/π = 1.27, √1.27 = 1.13 ≠ 1.41) is exactly why the √ step "cannot land at 1.41 A" — the amendment states this correctly. The settle/√ chain is now logically closed *only under squaring*, which is the point of F2.

**F3 — heater applyGlowEmphasis exemption when also the S3 glow_focal — LANDED (fully).**
§0b req 1: *"The heater emissive is driven by p(t) EVERY frame and EXEMPTED from `applyGlowEmphasis` (FIXED scar `bulb_glow_not_modulating` …). This exemption is NOT inherited-safe from the clone: unlike `acg_bulb`, the heater here is ALSO a glow_focal (S3) — when `heater` is the focal, emphasis is expressed by DIMMING PEERS only, never by overwriting the heater's own live emissive."* Both halves of F3 are present — the exemption itself and the focal-collision wrinkle — plus the "NOT inherited-safe from the clone" framing that names *why* the engine can't assume the clone covers it. Closed.

**F4 — dedicated Cambria-Math formula panel, not the generic `#formula_overlay` — LANDED (fully).**
§0b req 4: *"every per-state formula surface renders on a DEDICATED Cambria-Math math-serif panel built for this scenario — explicitly NOT the shared generic `#formula_overlay`, which carries the OPEN scar `field3d_formula_overlay_generic_not_cambria_math` (still renders 13px monospace); the engine dispatch must build the dedicated panel, never default to the generic overlay."* Exactly F4, scar cited. Closed.

## 3 · Scope-creep check (did anything out-of-scope move) — CLEAN

Spot-checked every item the dispatch declared out-of-scope against the cycle-0 report's quoted/described content:

- **Arc (§2, 9 states + ids):** unchanged — S1…S9 identical. ✓
- **Rings (§3 depth_ring column):** unchanged — core×4, extended×3 (S5/S6/S7), advanced (S8), core/ring-neutral (S9). ✓
- **Archetypes (§3 + no-repeat audit line):** unchanged — nine distinct, coinage block untouched. ✓
- **Anchor (§9):** unchanged — heating element + slow-mo lamp, mains neutral. ✓
- **§4 misconception pivots:** unchanged — exactly S3/S5/S6. ✓
- **entry_state_map (§7):** unchanged — foundational S1→S4, rms S5→S7, derivation S8, exploration S9, mandatory exit-pill. ✓
- **Prerequisites (§8):** unchanged — ohms_law / electrical_power_in_resistor / ac_generator. ✓
- **Blocks 1–2:** unchanged — cliffs/JEE trace/planting audit; PRIMARY S6 / SUPPORTING S4. ✓
- **Renderer decision (§0b decision para, 4 reasons):** unchanged. ✓
- **Out-of-scope §3 rows (S3/S4/S5/S8/S9):** unchanged. Notably **S8's "chop-and-flip … flip down into the troughs" language was correctly NOT touched** — that flip IS the geometrically exact operation for sin² (symmetric about ½), a *different* operation from S7's squaring, so F2's "no fold" correction was rightly not over-applied to S8. ✓
- **S6 design content beyond F1:** the twin-compare, wrong-answer-first-at-10V, 7.1 V match, rms line — all unchanged; only the F1 lockstep clause was inserted. ✓

The edit surface is exactly §0b reqs 1/4/6/7 + rows S1/S2/S6/S7. No collateral movement.

## 4 · One P3 note (non-blocking — does NOT affect the verdict)

The S7 archetype **label** remains `fold-and-settle`, and its coinage justification still reads *"lobes fold up."* This is now mildly inconsistent with the corrected operation (squaring, not folding). It is **not** a defect and **not** scope creep: the coinage block was out-of-scope, the architect correctly left it untouched, and — critically — the *binding build instruction* (§0b req 6 + the S7 row) is now unambiguous and geometrically correct, so nothing will be mis-built from the label. Flagging only so physics_author can rename it to something like `square-and-settle` on its natural pass. Not raised to a blocker: manufacturing a cycle-2 `DESIGN_FIX` over a non-rendering taxonomy label whose build instruction is already correct would be grade-inflation-in-reverse.

## 5 · No ESCALATE

The F2 amendment resolved (did not create) the only geometry question; all numbers reconcile under squaring (§2 above). No physics-correctness doubt anywhere. Escalation trigger 1 does not fire. This is cycle 1 of 2 — trigger 2 does not fire.

## 6 · Handoff note for physics_author

> Design is sealed. Build the physics block against the **squaring** operation for S7 (i²=iₘ²sin²ωt: mean iₘ²/2 = 2.0 A², √ = Iᵣₘₛ = 1.41 A, ⟨p⟩ = 10.0 W) — never a fold/rectification — and treat the §0b req-7 drag-seize + S6 thumb-lockstep, the req-1 heater `applyGlowEmphasis` exemption, and the req-4 dedicated Cambria-Math panel as hard requirements the §3b engine dispatch must satisfy before json_author starts; the one binding physics-legibility constraint is the Rule-32a caution (no v→i time lag — in-phase IS the content). Optional tidy: rename the S7 archetype `fold-and-settle` → `square-and-settle` (label only, cosmetic).

**Files:**
- Amended skeleton (verified): `C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7\ac_voltage_resistor\skeleton.md`
- Prior cycle-0 report (findings F1–F4): `C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7\ac_voltage_resistor\founder_proxy_report_checkpointA.md`

**Verdict:** `DESIGN_OK` — skeleton handoff-ready to physics_author; F5/F6 remain Checkpoint-B verify notes (unchanged, no design action).
