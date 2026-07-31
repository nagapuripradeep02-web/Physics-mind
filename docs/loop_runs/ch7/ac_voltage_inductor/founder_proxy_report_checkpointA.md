I now have everything I need. I verified the two load-bearing engine claims directly in the ch7-branch renderer:

- **Gap #1 (phase) confirmed structural:** `field_3d_renderer.ts:24105` header + `:35094` both hardcode "i = v/R IN PHASE"; the p-computation at `:24670` is `pPeak * sin(phase) * sin(phase)` (= vₘiₘsin²ωt, in-phase by construction). No phase-shift config key exists.
- **Gap #2 (signed power) confirmed structural:** `acrDrawPGraph` (`:24646`) maps `yP(val) = baseY − (val/pAxis)*plotH` with `baseY` at the plot **bottom** and `pAxis = max(pPeak*1.15, 0.01)` — the zero baseline is pinned to the floor and there is no negative range. The label literally reads "p = v·i vs t (≥ 0 always)" (`:24704`). The inductor's ±10 W symmetric swing cannot render here without an engine change.

Both most-load-bearing gaps are real, not overclaimed. Physics all verified by hand. Here is my complete report.

---

VERDICT: DESIGN_FIX

# FOUNDER-PROXY — CHECKPOINT A (DESIGN GATE) — `ac_voltage_inductor`

**Trial:** CHAPTER_LOOP Ch.7 concept 2/8 · Checkpoint A · fix cycle 0 (first review) · branch `feat/ch7-alternating-current`
**Skeleton reviewed:** `C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7\ac_voltage_inductor\skeleton.md`
**Renderer proposal:** `field_3d`, NEW `scenario_type: "ac_inductor"` (Class-B triage; §0b engine delta declared FIRST, to run in-loop via CHAPTER_LOOP §3b before physics_author/json_author start)

---

## 1 · VERDICT — `DESIGN_FIX` → routed to `alex:architect` (cycle 0 of 2)

Let me put the strength on the record first, because it must not be reopened: **this is the strongest skeleton in the Ch.7 corpus so far, and materially stronger than its own sibling's cycle-0 draft.** The physics is bulletproof (every locked number reconciles exactly — §3 below, done by hand, not trusted). The state arc, depth rings + both ring-cuts, the nine distinct archetypes, the per-state macro↔micro stories with exact numbers, the loudspeaker-crossover anchor, the three-pivot misconception plan, and the no-phasor discipline are all correct and several are exemplary. Critically, **all four precision-checklist items that sent the sibling back for a cycle (drag-seize/lockstep, exact morph operation, glow-emphasis exemption, dedicated Cambria-Math panel) are PRE-CLOSED in this §0a/§0b** — the scar ratchet is working exactly as designed. The physics, arc, rings, archetypes, anchor, and misconception pivots are **APPROVED and must NOT be reopened.**

I am nonetheless returning `DESIGN_FIX` for **one blocking issue the dispatch itself flagged** (question 5): the §0b **reuse-manifest over-reach.** The skeleton declares "the reuse intent is **binding**" and directs the autonomous engine to "**FACTOR the shared machinery into helpers rather than copy-paste**" because four not-yet-designed concepts "all reuse this same family." That instruction — executed by an autonomous §3b engine dispatch with no founder in the room — risks a **speculative refactor of the SEALED, shipped `ac_resistor` scenario** (commit `72910d1`, the chapter's foundation) and a premature abstraction locked to guessed future needs. That is precisely the over-broad engine shape the founder rejected twice already this trial (Stage 1a hardcode; the createTubeLine scope call). It is a cheap, surgical fix to one paragraph of §0b — and correcting the authoritative ask now is the higher-quality path (PRIME DIRECTIVE: prefer the slower-but-right engine scope over the fast-but-riskier one).

**Not an ESCALATE:** no physics doubt anywhere (§3), and this is cycle 0 (no budget pressure).

**The fix is bounded and surgical:** amend the §0b reuse paragraph (DF1). One P3 consideration (DF2, S4 control) rides along for the architect to address-or-defend in the same cycle. Do not touch the arc, rings, physics numbers, anchor, misconception pivots, or renderer choice — all APPROVED.

---

## 2 · Direct answers to the five load-bearing questions the dispatch flagged

**Q1 — Is the physics actually right?** **Yes, every number, verified independently by hand (full working in §3).** ω = 2π(0.25) = π/2 ✓. Xₗ = ωL = (π/2)(10/π) = 5.00 Ω exactly ✓. iₘ = 10/5 = 2.00 A ✓. U_max = ½Liₘ² = ½(10/π)(4) = 20/π = 6.366 J ✓. The S5 sweep (Xₗ = 20f) and the 5× collapse ✓. The S8 closed form i = −(vₘ/ωL)cos ωt = iₘsin(ωt−π/2) and p = −(vₘiₘ/2)sin 2ωt ✓, ⟨p⟩ = 0 ✓. The skeleton's own lobe-integral check `(10/π)(cos 2π − cos π) = 20/π` is **exactly correct** — I reproduced it: ∫₁²(−10 sin πt)dt = (10/π)[cos 2π − cos π] = 20/π = ΔU over the storing quarter. Even the incidental micro-numbers are exact (S1 beads pause at v-peak because i = −iₘcos ωt = 0 there; field brightest at v-zero because |i| peaks there; S4 tangent slope v/L = π = 3.14 A/s at the v-peak; S5 excursion ∝ 1/ω²). This is the most physically rigorous skeleton I have reviewed. No ESCALATE.

**Q2 — Is the Class-B triage (new "ac_inductor" scenario, not a pure-JSON extension of "ac_resistor") justified, or overclaimed engine work?** **Justified — verified in the actual renderer code, not accepted on assertion.** The two most load-bearing of the five named gaps are genuinely structural in the shipped `ac_resistor` scenario: (gap #1) the current is hardcoded in-phase — the p-strip is computed as `pPeak * Math.sin(phase) * Math.sin(phase)` at `field_3d_renderer.ts:24670`, i.e. vₘiₘsin²ωt, with no phase-shift parameter anywhere; producing a lagging current is impossible via JSON config. (gap #2) the p-graph `acrDrawPGraph` (`:24646–24657`) pins the zero baseline to the plot **floor** (`baseY = padT + plotH`) with axis `max(pPeak*1.15, 0.01)` and no negative range — it structurally cannot draw the inductor's ±10 W symmetric swing; the on-canvas label even reads "(≥ 0 always)". The remaining three gaps (monotone energy counter vs a breathing U-gauge; heater vs coil/field-loops/back-emf geometry; no ghost/lag-bracket/tangent machinery) are real and additive. **Class-B new-sibling is the correct call, not overclaimed.** The sub-decision to build a NEW scenario rather than bolt modes onto the SEALED `ac_resistor` is also sound (resistor-specific mode enum, one-scenario-per-family convention).

**Q3 — Is "f locked until S5" a real pedagogical need or authoring convenience?** **Real, and correctly reasoned.** For a resistor iₘ = vₘ/R is frequency-blind, so the sibling could safely expose f in S1. Here iₘ = vₘ/(ωL), so dragging f before S5 literally pre-executes S5's entire reveal (frequency makes the opposition) and pre-spoils 16a pivot #2. Locking f until S5 is not a convenience dressed up — it is **exactly Rule 31's contextual-controls principle** (expose the taught variable's slider in the state that teaches it), and it is the concept's shape (frequency is the star that earns its own state). The f-lock itself is APPROVED. (The *broader* control-minimalism it produces is a separate, softer point — DF2.)

**Q4 — Do the S2/S5/S7 misconceptions confront genuine wrong beliefs a student holds right after finishing `ac_voltage_resistor`?** **Yes — all three are specific, freshly-installed, and non-generic; this is the sharpest part of the design.** S2 confronts "voltage and current always move together — Ohm's rhythm is universal," which is *literally the prior the sibling just installed* — and it does so by docking the sibling's own literal 2.00 A in-phase trace as the dashed ghost, then having the beads disobey it. S5 confronts "opposition is a fixed property like resistance" (the student just learned R is fixed). S7 confronts "fighting the current all cycle must burn energy" (built by S3, surprised by S6, killed by the dead wattmeter at S7). Each is a belief the student holds *because of* the resistor lesson or this concept's own build, each drawn wrong-first. No finding.

**Q5 — Is the reuse-manifest binding claim realistic, or over-committing the engine?** **Over-committing — this is DF1, the blocking finding.** The reuse *manifest itself* (a clone-source list of what exists in `ac_resistor`) is useful and accurate. But making "factor shared machinery into helpers" **binding**, and naming four undesigned concepts as reuse-committed, over-scopes THIS build: the only way to "factor shared helpers" at concept #2 is to either refactor the SEALED `ac_resistor` code (regression blast radius on a shipped concept) or pre-abstract `ac_inductor` against guessed needs (the capacitor mirrors but isn't identical; LCR/power_factor/lc_oscillations diverge more). You factor when ≥2 real reusers exist and the true shared surface is known — not speculatively. Detail + fix in §5.

---

## 3 · Physics verification (independent — every locked number reproduced)

Defaults vₘ = 10.0 V, f = 0.25 Hz (T = 4 s), L = 10/π ≈ 3.183 H.

- **ω** = 2πf = π/2 rad/s ✓ · **Xₗ** = ωL = (π/2)(10/π) = **5.00 Ω exactly** ✓ (the deliberate echo of R = 5.0 Ω) · **iₘ** = vₘ/Xₗ = **2.00 A** ✓ (so the S2 ghost = the sibling's literal current trace — a genuinely beautiful continuity choice).
- **Phase:** v = L di/dt ⇒ i = −(vₘ/ωL)cos ωt = iₘ sin(ωt − π/2). Lag = π/2 = 90° = T/4 = **1.0 s** ✓.
- **Power:** p = vₘsin(ωt)·iₘsin(ωt−π/2) = −(vₘiₘ/2)sin 2ωt. Amplitude = vₘiₘ/2 = **±10.0 W** ✓; ⟨p⟩ = 0 (⟨sin 2ωt⟩ = 0) ✓.
- **Stored energy:** U(t) = ½L iₘ²cos²ωt = (20/π)cos²ωt, breathing 0 ↔ **20/π = 6.37 J** twice per cycle ✓. Store-quarter ∫p dt = ΔU: on t∈[1,2], p = −10 sin πt > 0, ∫₁²(−10 sin πt)dt = (10/π)[cos 2π − cos π] = **20/π = 6.37 J** ✓ — the skeleton's own check is exact.
- **S5 sweep:** Xₗ = ωL = 2πf(10/π) = **20f** ✓ → f=0.1→Xₗ=2.0Ω, iₘ=5.0A; f=0.5→Xₗ=10.0Ω, iₘ=1.0A (**exactly 5×**) ✓; ramp Xₗ 5→10→2→5 Ω ✓.
- **S4 tangent stops:** t=1.0s (ωt=π/2): v=+10 peak, i=0, di/dt=π=**3.14 A/s** steepest ✓; t=2.0s (ωt=π): v=0, i=+2.00 crest, di/dt=0 flat ✓; t=3.0s (ωt=3π/2): v=−10, di/dt=−π steepest fall ✓.
- **S1 plants:** beads pause at v-peak (i=−iₘcos ωt = 0 there) ✓; field brightest at v-zero (|i| max there) ✓ — both physically exact, both correctly left unnamed until S2/S4.
- **S3 HUD:** ε_back = −v at every instant for an ideal inductor ✓ (7.1 V = vₘ/√2, a representative instantaneous value — fine).
- **Edge-corner flag** (vₘ=20, f=0.1, L=1.0 → iₘ = 31.8 A) reproduced ✓ — correctly flagged to physics_author for graph auto-scale / bead clamp.

No physics-correctness doubt anywhere → escalation trigger 1 does not fire. Cycle 0 → trigger 2 does not fire.

---

## 4 · Pass-1 scar ratchet — what I checked (ran, not asserted)

Read the full `docs/loop_runs/ch7/_engine/scar_candidates.sql` (9 blocks) + `ch7_engine_log.md` (all 6 entries) + both sibling Checkpoint-A reports before reading the skeleton's claims.

**Accuracy of the skeleton's scar claims — verified, not aspirational:**
- `field3d_new_scenario_engine_ask_precision_checklist` (OPEN directive) — the skeleton's §0a claims to have read this. The engine log warned it had *not* been copied into `scar_candidates.sql`; I confirmed it **is now in the file** (row 6, copied in by the orchestrator per the action item), so the skeleton's claim is accurate. Its four items are the sibling's F1–F4, and **the skeleton pre-closes all four** in §0a/§0b (S5 f_demo drag-seize+lockstep; trace ops named arithmetically; coil-field `applyGlowEmphasis` exemption; dedicated Cambria-Math panel). Real ratchet, correctly applied.
- `field3d_createtubeline_undefined_field_lines_throws` (FIXED, `d26d139`) — this scenario draws coil flux loops, so it re-enters the fixed class; §0b req 1 + §10h correctly require an authored `field_lines` block rather than leaning on the 0.8 fallback. Correct.
- `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (FIXED, `ad7975b`) — S5's scripted f-ramp re-hits this exact class; §0b req 3 correctly requires the closed-form ∫ω dτ (pure-t, rewindable under the time-pin) + the B1 baseline-triple only on genuine drag. Correct and specific.
- `field3d_rms_subscript_ascii_in_renderer_text_paths` (FIXED, `4dc1c76`) — the new subscript glyph `ₗ` (Xₗ) re-enters the Rule-34c three-text-path sweep; §10b correctly flags all three paths + the 9px canvas Cambria-Math swap the B2 fix established. Correct.
- **B2 process correction inherited correctly:** the skeleton uses `capacitance` (44/44, H2 0.00%) as the field_3d regression sample and explicitly rejects `faraday_law_induction` (no committed baseline) — exactly the correction the B2 dispatch filed. Strong sign the skeleton is built on the real engine history, not an idealized one.

**No recurrence of any prior finding.** The classes checked: the four precision-checklist items, createTubeLine, dt-accumulator-vs-time-pin, ᵣₘₛ/ₗ subscript sweep, the Rule-34d chrome-collision top:52px pattern, `ghost_compare_cause_invisible_slider_frozen`, `bulb_glow_not_modulating`, `field3d_formula_overlay_generic_not_cambria_math`. Each is either satisfied or correctly flagged forward. One minor cosmetic slip: §0a says "all 8 candidate rows read" but the file now has 9 bug_classes — immaterial (the checklist directive it needed IS among them).

---

## 5 · Findings

### DF1 — P2 (blocking at Checkpoint A) — §0b reuse-manifest over-reach: an autonomously-executed "binding factor / refactor" directive that risks the SEALED `ac_resistor` scenario. Routed to `alex:architect`.

**Evidence (skeleton §0b, "Decision" paragraph):** *"Direction to the engine dispatch: **FACTOR the shared machinery into helpers rather than copy-paste** — `ac_voltage_capacitor`, `series_lcr_circuit`, `ac_power_factor`, and `lc_oscillations` all reuse this same family … a 5× copy-paste is a maintenance scar in waiting. Internal factoring is renderer_primitives' call; **the reuse intent is binding.**"* Restated in §Escalation 1 ("shared helpers, not copy-paste — four more Ch.7 concepts reuse this family").

**Why it's blocking (not a note):** The §0b ask is the artifact the §3b engine dispatch executes autonomously — my report flags do not travel into it (the engine builds against the skeleton/log, per the Stage-1b precedent). "The reuse intent is binding" + "factor shared machinery into helpers" is ambiguous in exactly the dangerous direction: at concept #2 the only ways to "factor shared helpers" are (a) **refactor the SEALED, shipped `ac_resistor` scenario** to extract them — regression blast radius on the chapter's foundation concept (`72910d1`), the highest-stakes place to get scope wrong — or (b) pre-abstract `ac_inductor` against four **undesigned** concepts whose real shared surface is unknown (the capacitor mirrors but is not identical; LCR/power_factor/lc_oscillations diverge). Both are the premature-abstraction / over-broad-engine-shape the founder explicitly rejected in Stage 1a (the hardcode) and scoped-around in the createTubeLine fix. It is also the exact concern the dispatch's own question 5 raises ("committing the engine to a refactor scope beyond what THIS concept's build should decide").

**Fix (route to architect — surgical, one paragraph):** Reframe §0b's reuse block so that:
1. the reuse **manifest** stays as an advisory forward-looking **clone-source NOTE** (what exists in `ac_resistor` to clone — keep it verbatim; it's useful);
2. the engine is instructed to **build `ac_inductor` as a clean standalone sibling and NOT to refactor the SEALED `ac_resistor` scenario** as part of this build;
3. any shared-helper factoring is **explicitly deferred** to a deliberate decision when ≥2 real reusers exist and the true shared surface is known (i.e. the engine may factor *later*, on its own judgment, not on this concept's authority);
4. delete "the reuse intent is binding" (or downgrade to "the reuse note is informational; the build scope is `ac_inductor` only").

This keeps the DRY intent alive as a note without letting an autonomous dispatch churn sealed code or bake a wrong abstraction. Regression duty (§0b req 9: `capacitance` 44/44 + `ac_resistor` 39/39) stays as-is — it now protects a clean-sibling build rather than papering over a speculative refactor.

### DF2 — P3 (non-blocking consideration; address-or-defend in the same cycle) — the concept has only ONE guided state with a live control (S5); consider one live manipulation before S5. Routed to `alex:architect`.

**Evidence (skeleton §3 table):** live controls appear only in S5 (`f_demo`) and S9 (all). S1–S4, S6, S7, S8 are entirely control-less — S1–S4 are four consecutive click-through states, including **S4, the PRIMARY AHA.** By contrast the sibling carried live controls in three guided states (S1 f, S2 R, S6 V_dc).

**Why it's worth raising (but only P3):** The founder's live-instrument pivot (2026-06-30) is that a field_3d sim is a teacher-driven instrument. S4 ("voltage sets the slope") is the money state, and a live `vₘ` slider — drag-seize guarded exactly like S5's f_demo — would let a teacher *drag the voltage and watch the tangent steepen on demand*, demonstrating the taught causation live, **without spoiling S5** (vₘ is frequency-independent; it touches amplitude/slope magnitude, not the reactance story or the 90° phase). That is the live-instrument vision applied to the concept's most important beat.

**Why only P3 (I will not inflate it):** zero-control guided states violate no rule — Rule 31 *permits* them, and the sibling sealed with five of them under founder approval. And there's a genuine counter the architect may invoke: S4's insight is about *timing/geometry* (the crest sits where v vanishes), which is vₘ-**independent**, so a live vₘ could be argued to distract from "when" by foregrounding "how big." I find the live-demo value stronger than that counter, but it is a legitimate design judgment. **Ask (either is acceptable):** add a drag-seize-guarded `vₘ` control to S4 (and update §0b req 3, which currently names only S5's f_demo, to include it); **or** keep S4 scripted and add one line to §3 justifying the S1–S4 control-minimalism against the live-instrument model. Do **not** manufacture controls into every state — this is specifically about giving the teacher one live manipulation at the PRIMARY AHA.

**No other findings.** Ring-cut coherence (both cuts, incl. the S9-exposes-f-under-the-reduced-preset subtlety, which the skeleton handles explicitly as "explorable phenomenon"), 38b explore core-only (p-strip/Xₗ/U-gauge correctly absent from S9), the notation ladder (calculus + π/2 radians confined to S8), the dialect table, the anchor, and the archetype set are all clean. The one cosmetic note — §0a "8 rows" vs the file's 9 — needs no action.

---

## 6 · Design-level per-state assessment (Checkpoint-A substitute for the Pass-4 table — no built frames exist yet)

| State | ring | Teaches (one idea) | Archetype (distinct?) | Non-static? | Misconception | Design verdict |
|---|---|---|---|---|---|---|
| S1 `coil_joins_the_circuit` | core | swap heater→ideal coil; still oscillates | `oscillate/track` ✓ | beads/arrow/field breathe from t=0 ✓ | — (plants beads-pause-at-v-peak + field-at-v-zero, both physically exact) | **OK.** Two plants correct; coil reads cold by design. |
| S2 `current_lags_quarter_cycle` | core | current peaks ¼ cycle late | `ghost-overlay-compare` (coin) ✓ | ghost docks → beads disobey → real trace sweeps ✓ | **Pivot 1** — sibling's literal trace as the dashed ghost ✓ | **OK — exemplary.** The freshly-installed prior confronted with its own artifact. |
| S3 `coil_fights_change` | core | changing i → back-emf opposing the change | `cycle-compare` ✓ | A→B→A′ flux loop, arrow flips ✓ | — (re-encounter, not a new pivot — correct) | **OK.** ε_back = −v mirror is the exact Rule-33c number. |
| S4 `voltage_sets_the_slope` | core | **PRIMARY AHA** — v = L·(slope of i) | `tangent-walk` (coin) ✓ | tangent cursor, 3 cue-gated stops ✓ | — | **OK design — DF2 (consider a live vₘ here).** Slope numbers exact (3.14 A/s). |
| S5 `reactance_grows_with_frequency` | extended | Xₗ = ωL; iₘ = vₘ/Xₗ | `ramp-response` (coin) ✓ | scripted f-ramp, envelope collapses 5× ✓ | **Pivot 2** — same coil, opposition quintuples ✓ | **OK.** f-lock-until-here justified; B1 closed-form phase correctly required. |
| S6 `power_swings_both_ways` | extended | p = v·i goes negative; store↔return | `trace-product` (fleet) ✓ | signed bars cross zero, U-gauge fills/drains ✓ | — | **OK.** Signed p-strip is a real engine gap (verified) — correctly asked. |
| S7 `nothing_consumed` | extended | ⟨p⟩ = 0 exactly (anti-resistor) | `null-result-hold` ✓ | dead needle BUT field/beads/gauge alive ✓ | **Pivot 3** — dead wattmeter vs the heater's 10 W ✓ | **OK.** SUPPORTING AHA; the paradox made visible around a live scene. |
| S8 `one_integral_both_results` | advanced | ∫ once → −cos (lag) + 1/ωL (Xₗ); p lobes cancel | `chain-link-derivation` (fleet) ✓ | 180° point-rotation congruence, apparatus dimmed-hold ✓ | — | **OK.** Lobe cancellation is exact point-symmetry (verified). Advanced ring contiguous before explore ✓. |
| S9 `ac_inductor_sandbox` | core (ring-neutral) | synthesis | `drag-sandbox` ✓ | free-runs (Rule 37) ✓ | — | **OK.** Explore = strict core-only (Xₗ/p/U deliberately absent) ✓; all sliders live. |

**Rubric sweep (design-level):** depth rings + BOTH ring-cuts coherent, no surviving forward-reference (38a) ✓ · 9 distinct archetypes, none static, per-state control table complete (31) ✓ · macro↔micro per-state-distinct with real numbers (33) ✓ · universal widest-overlap anchor, mains neutral (35/38f) ✓ · exactly 3 genuine misconception pivots, contrast beats, no per-state tic (16a) ✓ · notation ladder clean — calculus + radians confined to S8 (38c) ✓ · cross-board dialect dual-labelled, NCERT time-domain convention (38d/38e) ✓ · no-phasor discipline held (the "¼ cycle = 90°" bracket seeds `phasors`) ✓.

---

## 7 · Candidate scar row (extend the existing directive — do NOT mint a duplicate `bug_class`)

At Checkpoint A nothing is rendered, so there is no `incident`. DF1's pattern **will recur** across the remaining scope-pane concepts (the capacitor is explicitly a mirror-sibling; LCR/power_factor/lc_oscillations all reuse the family), so it is ratchet-worthy — but it belongs as a **fifth item on the existing `field3d_new_scenario_engine_ask_precision_checklist` directive** (same owner `alex:architect`, same engine-ask-precision scope), not a new row. Per schema discipline (the `bug_class` upsert key already exists in `scar_candidates.sql` row 6), I propose amending that row rather than inserting a collision. **Trial mode: this is a FILE amendment for the founder to rule on, never applied to the DB by me or the loop.**

Proposed append to the existing row's `title` / `prevention_rule` (orchestrator to persist into `scar_candidates.sql` block 6):

```
-- AMEND existing candidate row bug_class = 'field3d_new_scenario_engine_ask_precision_checklist'
-- (append item 5; do NOT insert a new bug_class — this is the same engine-ask-precision
--  directive, owner alex:architect). NOT APPLIED (trial: files only).
--
-- title  += "(5) the reuse manifest for a new sibling-scenario must be stated as an ADVISORY
--            clone-source NOTE, never as a BINDING mandate to 'factor shared helpers' — because
--            at the point a second family member is authored, the only ways to factor are to
--            refactor the already-SEALED sibling scenario (regression blast radius on shipped
--            code) or to pre-abstract against undesigned concepts (premature/wrong abstraction).
--            Build scope for a new-sibling ask is THAT scenario only; helper factoring is deferred
--            to a deliberate decision when >=2 real reusers exist and the shared surface is known."
--
-- prevention_rule += "A new field_3d sibling-scenario engine ask must scope the build to the ONE
--            new scenario, explicitly forbid refactoring any SEALED sibling scenario as part of the
--            build, and phrase cross-concept reuse as a forward-looking note (never 'binding')."
--
-- concepts_affected: add 'ac_voltage_inductor' to the existing ARRAY.
-- discovered_in_session: 'ch7-stage2-ac_voltage_inductor-checkpointA'
```

Schema self-check: reuses existing `bug_class` (no duplicate) ✓ · `row_type='directive'`, `probe_type='manual'`, `severity='MODERATE'` all unchanged and valid ✓ · `concepts_affected` stays a `text[]` ARRAY ✓ · dedupe note explicit (amend, not insert) ✓.

---

## 8 · `engine_queue` (FIX(engine)) — N/A at Checkpoint A

No `FIX(engine)` findings: that verdict exists only at Checkpoint B, after something is built. The `ac_inductor` scenario delta is the §0b engine ask itself, which runs via the §3b engine loop **after** DESIGN_OK, not as a founder-proxy routing. DF1 is a correction TO that ask (routed to architect), not a routing of the ask.

---

## 9 · Key sections for the founder's eventual review (read these first)

1. **`skeleton.md` §0b — the engine ask.** The one place the DESIGN_FIX lives (DF1, the reuse paragraph). It commissions a brand-new field_3d scenario autonomously; read its reuse block against the sealed-`ac_resistor` protection before the engine dispatch fires. Everything else in §0b (the four pre-closed precision items, the createTubeLine/field_lines block, the B1 closed-form S5 phase, the `capacitance` regression sample) is correct.
2. **`skeleton.md` §2 locked numbers + §3 Rule-33 block.** The physics is exact end-to-end, including L = 10/π chosen so Xₗ = 5.00 Ω mirrors the sibling's R and iₘ = 2.00 A makes the S2 ghost the sibling's literal trace — worth seeing as the model of chapter continuity for the rest of Ch.7.
3. **`skeleton.md` §4 misconception pivots + §Block 2.** The S2 confrontation (the resistor's just-installed "in-phase" prior, drawn as its own dashed ghost, disobeyed by the beads) is the strongest teaching-design move in the chapter so far.
4. **`skeleton.md` §3 row S4 (PRIMARY AHA) + control column.** DF2's single live-control question — the founder's live-instrument taste call — is entirely here.
5. **`skeleton.md` §10(i-1) both ring-cuts.** Both preset cuts leave a coherent lesson, with the S9-exposes-f-under-the-reduced-preset subtlety explicitly handled — a model for the mirror-sibling capacitor design to come.

---

**Routing summary:** `DESIGN_FIX` → `alex:architect`, cycle 1 of 2. Scope = amend the §0b reuse paragraph (DF1, blocking) + address-or-defend the S4 live-control question (DF2, P3). **Core design APPROVED — physics, arc, rings, archetypes, anchor, misconception pivots, no-phasor discipline, the f-lock, and the Class-B triage must NOT be reopened.** On re-submission I will re-review only the amended §0b reuse block and (if changed) the S4 control cell + §0b req 3. No new scenario work should be commissioned until §0b scopes the build to `ac_inductor` only and forbids refactoring the sealed `ac_resistor` scenario.
