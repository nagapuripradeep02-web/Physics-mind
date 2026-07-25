# CHECKPOINT A (design gate) — founder-proxy — `em_wave_propagation`

> Ch.8 chapter loop, `docs/CHAPTER_LOOP.md` §3 step 2. Reviewed artifact:
> `docs/loop_runs/ch8/em_wave_propagation/skeleton.md` (architect, cycle 1).
> Date: 2026-07-24. Branch `feat/ch8-em-waves`.

**VERDICT: `DESIGN_FIX`** (cycle 1 of 2) → routed to **`alex:architect`**.

One design-level defect drives the bounce (**F2 — the S10 "hide the B train in the slab" decision paints a false "B disappears in a medium" picture sound-off**). Because the architect is re-emitting anyway, three cheaper improvements fold into the same cycle (F1 core-object annotation + surgeon-staging routing note, F3 S6 overlay-zone declaration, FL1–FL5 downstream constraints). **No `ESCALATE`:** every locked physics number checks out (escalation trigger #1 does not fire) and we are inside the 2-cycle Checkpoint-A budget (trigger #2 does not fire).

This skeleton is genuinely strong — thorough, ring-structured, physics-correct, tightly continued from `displacement_current`, with carefully-guarded misconceptions. The bounce is not a rejection of the design; it is one design correction the *skeleton itself* must carry (the skeleton is the spec every downstream agent builds from, and it currently instructs "hide B" in two places), plus riders that are strictly cheaper to lock now than to catch at Checkpoint B.

---

## 1. Physics verification — ALL locked numbers correct (escalation #1 cleared)

Every number in §2 and §0b recomputed independently:

| Claim | Check | Verdict |
|---|---|---|
| ν=100 MHz → T=10.0 ns | 1/10⁸ = 10 ns | ✓ |
| λ=3.00 m (vacuum) | c/ν = 2.998×10⁸/10⁸ = 2.998 m ≈ 3.00 | ✓ |
| B₀ = E₀/c = 0.40 μT at E₀=120 | 120/2.998×10⁸ = 4.003×10⁻⁷ T | ✓ |
| c = 1/√(μ₀ε₀) | 1/√(1.2566×10⁻⁶·8.8542×10⁻¹²) = 2.998×10⁸ | ✓ |
| gates D=6.00 m, Δt=20.0 ns → v=3.0×10⁸ | 6.00/2.998×10⁸ = 20.01 ns | ✓ |
| u_E = ½ε₀E₀² = u_B = B₀²/2μ₀ | ½·8.854×10⁻¹²·14400 = 6.375×10⁻⁸ J/m³; **u_E=u_B is an exact identity** (u_B = E₀²/(c²·2μ₀) = ½ε₀E₀²) | ✓ |
| S9: k=2.09 rad/m, ω=6.28×10⁸, ω/k=3.00×10⁸ | 2π/3=2.094, 2π×10⁸=6.283×10⁸, ratio 3.00×10⁸ | ✓ |
| S10 n=1.5: v=2.00×10⁸, λ_med=2.00 m, ν held | c/1.5=1.999×10⁸; v/ν=2.00 m; ν continuous across a boundary | ✓ |

Two claims specifically vetted:
- **S4 "E×B points ahead, crest or trough alike"**: at a trough both fields flip, (−E)×(−B)=E×B, still +x̂. Correct — and it pre-empts the real "wave reverses at a trough" misconception.
- **u_E = u_B** is not a coincidence to be engineered; it is an identity for a vacuum plane wave. "Computed from UNROUNDED internals" is the right instruction — the two tanks read equal by construction.

**One physics_author lock (P3, non-blocking):** the displayed crest energy is 6.375×10⁻⁸ (rounds to 6.37 or 6.38 depending on convention/ε₀ digits). Lock ONE displayed figure; both tanks must show the *identical* value from unrounded internals.

**Conclusion:** no physics-correctness doubt anywhere. The concept is safe to build once the design corrections land.

---

## 2. Finding that drives the bounce

### F2 · S10 · P2 · DESIGN_FIX → `alex:architect` — do NOT hide the B train inside the slab

**Evidence:** skeleton §3 S10 row: *"B train hidden inside the slab — vacuum-ratio only, declared scope cut"*; §0b: *"E/v in medium is NOT shown … B train hidden inside the slab"*; Escalation #3: *"S10's B-train-hidden-in-slab scope cut gets one unnarrated visual treatment."*

**What the founder would see sound-off (Rule 24, TTS off by default):** the blue B wave travels down the axis, then **vanishes the moment it enters the glass**, then reappears on exit. That reads as a physical claim — *"the magnetic half of the wave disappears in a medium"* — which is flatly false. This is the sim asserting wrong physics with pixels, on the exact chapter (EM waves) where B-in-matter is load-bearing.

**Why "hide" is the wrong call — it solves a phantom and creates a real error.** The architect hid B to avoid displaying the wrong amplitude ratio (E/B = c inside the slab, when it should be v). But **S10 surfaces no ratio at all** — the ratio chip and tanks are extended-ring and are already absent from this advanced-ring state (§3 S10 controls = `n` only; §10(i-2) explore excludes the ratio chip). So there is nothing to mislead: hiding B suppresses a non-existent readout while destroying three *true* facts the state should show.

**The correct design (keep B present):** inside the slab, keep BOTH trains drawn, both phase-advancing at v=c/n, both bunching to λ_med=2.00 m, ν continuous across the boundary. Surface no E/B amplitude ratio on S10 (already the case). This preserves the truths — *B is present in matter · B bunches with the same λ_med as E · ν is continuous* — and stylizes only the amplitude, which the time-scaling license already stylizes everywhere. Optional fuller fix (heavier, architect/surgeon discretion): compute in-medium B = nE/c so the amplitude is also exact; not required since S10's taught variable is speed/wavelength, not amplitude.

**Prime-directive tie-in:** "hide B" is the fast content workaround; "keep B present + bunching" is the slightly-heavier truthful fix. The prime directive forbids accepting the lower-quality workaround to save time.

**Why this bounces rather than rides forward:** the skeleton instructs "hide" in §3 AND Escalation #3, so it *will* be built as hide unless the skeleton changes; a proxy side-note is weaker than the explicit spec. Caught here it is one cheap re-emit; caught at Checkpoint B it is a `FIX(engine)` S10 rebuild.

---

## 3. Riders folded into the same re-emission

### F1 · §0b · engine-build staging — routing note to the loop + a one-line architect rider
Not the bounce driver (build sequencing is largely the `field3d-surgeon`'s job), but:

- **To the loop (engine dispatch):** §0b is a large monolithic new-scenario ask (the deterministic dual-sinusoid vector train + leapfrog-relay chevron choreography + medium slab are three distinct hard builds, on top of ~11 objects and 4 slider rows). Precedent: `displacement_current`'s comparably-complex scenario needed **3 engine commits**, and this is the **second consecutive** new scenario in a token-disciplined chapter (Amendment 4). The `field3d-surgeon` dispatch should explicitly instruct **core-first staging** (build the renderable spine — `emw_source`, `emw_axis`, `emw_e_train`, `emw_b_train`, `emw_receiver`, pulse/train mode — so S1–S3 render; then layer per-state features: relay S2, triad S4, ghost S5, cursor+tanks S8, gates S6, slab S10) and the **Amendment-4 handoff-note-at-ceiling discipline**.
- **To the architect (cheap rider):** annotate the §0b object table with which objects are the **load-bearing core** vs per-state add-ons, so the surgeon's first increment has a bounded, coherent target.

### F3 · S6 · declare the overlay zones (Rule 34d pre-check)
S6 is by far the densest state — at end pose it holds the E+B trains, receiver gauges, gate A/B markers, D=6.00 m line, Δt stopwatch, `v=D/Δt` dock, the c-formula surface, the MATCH chip, λ bracket, ν readout, and the ν slider row (~6–7 persistent overlays + the sliding constant chips). §10(h) gives only the generic "distinct corners, top:52px+" note. Since S6 is the PRIMARY aha and the most collision-prone state, **pre-declare S6's overlay zones**. Also confirm the "two constant chips slide into `c=1/√(μ₀ε₀)`" resolves to **one** formula surface at end pose, not two (Rule 34b). Verify at Checkpoint B via THE EYE `overlayCollisions`.

---

## 4. Carry-forward constraints (fold into the re-emission; verify at Checkpoint B)

- **FL1 · S10 n-drag must drive continuous motion.** The 31c/38b reconciliation note claims "the teacher gets the medium sandbox by staying on S10, whose n row is live and seizable." But S10 is `manual_click`, so Rule 37 does **not** free-run it — its clock pins at timeline end. For the n-drag to produce live crest-bunching (not a static re-render), the trusted-drag seize must **un-pin the clock** on S10 (the S7/S8 seize pattern). Bind this explicitly, else the claimed "medium sandbox" is a frozen picture.
- **FL2 · S6 narration precision (physics_author).** The gate timing is derived from v=c internally, so "measured" and "predicted" are the same number by construction (correct physics — c *is* 1/√(μ₀ε₀)). Narration must frame it as the historical identity ("the wave's speed timed here is the same 3×10⁸ that 1/√(μ₀ε₀) gives — the measured speed of light"), **not** as an independent measurement that coincidentally matches.
- **FL3 · rename the internal "time-dilation license"** to "time-scaling license" (internal doc only; it is time-*scaling*, not relativistic dilation — a confusing label in a chapter adjacent to relativity). The on-canvas "the clock here counts nanoseconds" clause + real SI readouts are the actual honesty guard and are correct — keep them. P3.
- **FL4 · u_E=u_B display value lock** (physics_author, from §1 above).
- **FL5 · S10 boundary continuity.** With F2 applied (B kept present), lock ν-continuity across the slab boundary for BOTH trains.

---

## 5. Confirmations — what is RIGHT (do not re-litigate on re-review)

- **11 states — justified, not bloated.** The atomic claim is one object (a self-propagating transverse wave) with its properties; the founder's chapter_map (`ch8_state.md`) has exactly three Ch.8 concepts, so the nature+propagation+speed merge is **founder-approved**, not an architect invention — the absorbed `em_wave_nature`/`speed_of_em_waves` were speculative seeds, never approved concepts. Ring structure (core S1–S6+S11=7, +extended S7–S9, +advanced S10) means no preset ever shows a bloated diamond. Every state earns its place; S1↔S6 is a legitimate single declared contrast pair, not redundancy.
- **Both preset cuts VERIFIED coherent** (§10 i-1). Cut 1 (hide S10 → S1–S9+S11): no survivor references slab/n/medium; S6 says "in vacuum," never "unlike in a medium." Cut 2 (hide S7–S10 → S1–S6+S11): every caption and every §10(h) formula checked — none references E₀/B₀ notation, energy, k/ω, or medium; the S1 receiver gauge showing live 120 V/m and 0.40 μT is an *instantaneous reading*, not a forward-referenced amplitude claim; λ/ν are Class-11 prerequisite symbols (correctly not counted as hidden-ring). Advanced ring (S10) is contiguous immediately before explore (38a). **Claim holds.**
- **31c/38b reconciliation (explore excludes n) — right call, coherently argued.** Rule 38b (newer, ring-specific) supersedes Rule 31's "all sliders" for ring purposes; surfacing n in a core-ring sandbox would break coherence under reduced presets; the `displacement_current` S10 precedent is consistent.
- **Three misconception pivots + the S7→S8 planting — sound pedagogy, not a trick.** All three (medium S3, in-phase S5, B-negligible S8) are genuine documented misconceptions. The 0.40 μT that plants "B is negligible" is the *real* number S7 legitimately produces (not manufactured), and S8 breaks it with the real physics (u_E=u_B) — the classic "tiny-B paradox." The §4 guard that S2 must never say "E turns into B" is exactly the right guardrail.
- **The "light"-ban before S6 — serves the payoff, does not withhold orientation.** Orientation is supplied by the phone/radio anchor from S1; only the *speed-identity* is withheld until it is measured and matched at S6. The ban is on the word "light," not "electromagnetic wave"/"fields," so the student is never ungrounded.
- **Time-scaling honesty — honest and teachable.** All ratios (λ/T=v, D/Δt=v) are preserved; only wall-clock playback rate is stylized; real SI readouts + the one "counts nanoseconds" clause are the guard. Same license `displacement_current` used. (Rename per FL3.)
- **Chapter continuity with `displacement_current` — strong and deliberate.** Colour convention identical (E green / B blue), ghost-tag pattern reused (commit `aa724f8`), left→right apparatus grammar + 3/4 camera consistent, μ₀/ε₀ callback to last chapter's lab, S2 cashes displacement_current's exact S9/S10 forward hook, no redundant re-teaching of I_d. Nothing contradicts the sealed sim.
- **Synonyms — harmless + mildly useful; correct call.** Adding `em_wave_nature` → and `speed_of_em_waves` → `em_wave_propagation` in `CONCEPT_SYNONYMS` is forward-insurance + documents the absorption. **One guardrail to state in the skeleton:** redirect-only — never add these two ids to `VALID_CONCEPT_IDS` or `CLASSIFIER_PROMPT` (they are not real concepts).

**Scar pre-read (Pass-1 applied to this design):** both accumulated ch8 scar rows hold. `field3d_charge_hold_reveal_pin_lands_in_zero_window` (FIXED) — this design has NO on/off charge-hold loop on a field-readout state (the trains are "perpetual by construction"), so the class cannot recur here. `field3d_scene_composition_annotation_silent_noop` (still OPEN, fleet-wide) — **directly relevant**: S3/S5/S8 are Rule-16a states whose wrong-expectation cues must render on-canvas, not via scene_composition/epic_l annotations. The architect has correctly routed these through *scenario elements* (`emw_ghostb` for S5, the "no change" chip for S3, the S8 ghost tag) rather than annotations — so the design does not repeat displacement_current's S5 defect. **Carry to Checkpoint B:** THE EYE must confirm the S3/S5/S8 wrong-expectation cues paint on the `__frozen.png`.

---

## 6. What a `DESIGN_OK` re-review needs (cycle-2 exit criteria)

1. **F2 resolved in the skeleton:** §3 S10 row + Escalation #3 changed from "hide the B train" to "keep both trains present + bunching (v=c/n) inside the slab, ν continuous, no E/B ratio surfaced."
2. **F3:** S6 overlay-zone declaration added; confirm one formula surface at end pose.
3. **F1 rider:** §0b object table annotated with the load-bearing core vs per-state add-ons.
4. **FL1–FL5 + the synonym redirect-only guardrail** written into the skeleton's downstream-FLAG section so physics_author / json_author / field3d-surgeon build them and Checkpoint B verifies them.

Everything else is approved as designed. Cycle 1 of 2; a clean `DESIGN_OK` is expected on the re-emission.

**Route:** `DESIGN_FIX` → `alex:architect` (the loop dispatches).

---
---

# CHECKPOINT A — cycle 2 re-review — founder-proxy — `em_wave_propagation`

**VERDICT: `DESIGN_OK`** → physics-author proceeds.

All four exit criteria from the cycle-1 report landed, verified against the file (not the loop's summary). No drift in the approved body. The F2 decline is well-reasoned and accepted. The FL4 figure is correct. This design is cleared to build.

## Exit criteria — each verified against the file

**1. F2 (bounce driver) — RESOLVED in all four places; the "hide" language is gone everywhere.**
- §0b `emw_slab` row (L57): "inside it BOTH trains stay drawn and visibly slow, their crests bunching (λ/n) together; boundary continuity of ν enforced for BOTH trains." ✓
- §0b physics-computes (L64): "BOTH trains stay drawn inside the slab — both phase-advance at v = c/n, both bunch to λ_med = 2.00 m … ν continuous … for BOTH trains." ✓
- §3 S10 row (L117): "BOTH trains stay drawn inside the slab — green and blue slow and bunch TOGETHER at v = c/n, ν continuous for both; no E/B amplitude ratio is surfaced anywhere on this state." ✓
- Escalation #3 (L272): same, "never a spoken caveat." ✓

The sound-off "B disappears in glass" false picture is designed out. All three teaching truths are preserved on screen (B present in matter · B bunches with the same λ_med · ν continuous).

**2. F2 optional-path DECLINE — accepted, and the Rule-32b rationale is correct.**
The architect keeps in-slab B at the vacuum ratio E/c and declines the exact n·E/c amplitude (L64). That path was marked optional, so the decline is within the granted latitude — and the reasoning is actually *better* than the original optional suggestion: if B amplitude grew on slab entry, that would be a **second visible non-taught-variable change** (B arrows lengthening) directly against Rule 32b, whose one-variable-per-state law says only the crest *spacing* should change on S10. Keeping B amplitude constant is the 32b-cleaner design. The residual — a quantitatively-stylized in-slab B amplitude — surfaces **no wrong number** (no E/B ratio or B-amplitude readout exists on S10, confirmed L117; amplitude is already stylized fleet-wide). **Decline accepted, rationale endorsed.**

**3. F3 (S6 overlay zones) — landed with explicit zoning + the one-surface confirmation.**
L223: distinct zones assigned (in-scene billboards ride geometry; screen-fixed caption top-center, HUD top-right below top:52px, `emw_formula` bottom-center-left, ν row bottom-right, MATCH chip pinned to the formula block). The Rule-34b one-surface-at-end-pose is now explicit: "v = D/Δt docks first INTO `emw_formula`; the two constant chips then slide INTO THE SAME surface … one two-line surface, not two docks." No two overlays share a zone by design; mechanically verified at Checkpoint B via `overlayCollisions` (correctly deferred). ✓

**4. F1 (build staging) — landed and improved.**
L60: load-bearing core built first (`emw_source · emw_axis · emw_e_train · emw_b_train · emw_receiver · wave_mode`), and the architect correctly **pulled `emw_motes` into the core increment** because S3's null-result beat can't render without them — so the first increment renders S1–S3 end-to-end (a coherent, testable milestone, better than the gate's spine-only list). Per-state add-ons layered in state order; Amendment-4 handoff-note-at-ceiling discipline stated. ✓

**FL1–FL5 + guardrails — all bound as downstream FLAGs.**
FL1 (S10 seize un-pins the clock) bound in THREE places (§0b req 2 L66, reconciliation note L122, Escalation #1 L270) ✓ · FL2 (S6 historical-identity narration) Escalation #3 ✓ · FL3 (time-scaling rename) L40 + Escalation #6 ✓ · FL4 propagated to all five places (§2 L96, §3 S8 L115, §4 pivot 3 L138, §10b L207, Escalation #3 L272) ✓ · FL5 (ν-continuity both trains) folded with F2 ✓ · synonym redirect-only guardrail Escalation #4 L273 ✓ · OPEN-scar frozen-png recurrence check Escalation #2 L271 ✓.

## FL4 rounding — confirmed 6.38×10⁻⁸, and a correction to the flagged premise

Re-derived. With the skeleton's own ε₀ = 8.8542×10⁻¹²: u_E = ½ε₀E₀² = 0.5 × 8.8542×10⁻¹² × 14400 = **6.375024×10⁻⁸ J/m³**. This is **strictly greater than 6.375**, so it rounds to **6.38 under every convention** — it isn't a genuine tie (the "6.375" is a truncated intermediate). Cross-check with CODATA ε₀ = 8.854188×10⁻¹²: 6.375015×10⁻⁸ → still 6.38.

The loop's note that "6.375 rounds to 6.37 under banker's rounding" is a mis-premise on two counts: (a) the true value 6.375024 isn't halfway, so banker's never engages; (b) even for an exact 6.375, round-half-to-even picks the **even** neighbor — 6.3**8** (last digit even), not 6.37 — so banker's also yields 6.38. **The locked 6.38 is correct.** Since u_B = u_E is an exact identity, both tanks render the identical 6.38 string from unrounded internals (FL4 satisfied). No change needed.

## No drift in the approved body

Spot-checked the cycle-1-approved regions: §1 atomic claim (L72), §2 arc (L82–92), §3 archetypes + no-repeat audit (L102–120 except the two touched rows), the three pivots + planting guard (§4), deep-dive picks (§5), light-ban anchor (§9), both coherence cuts (§10 i-1/i-2), and the displacement_current continuity (colour/ghost/apparatus grammar, §0a L23) — **all intact.** The F2 edit to S10 is internal to that state and introduces no forward-reference, so the §10(i-1) "hide S10 → coherent" claim still holds. The surgical-replacement approach did what it was meant to.

## Checkpoint-B watch list (now carried in the skeleton's escalations)

1. S3/S5/S8 wrong-expectation cues must PAINT on the `__frozen.png` — recurrence check for the still-OPEN `field3d_scene_composition_annotation_silent_noop` scar (Esc #2).
2. S6 `overlayCollisions = []` at end pose (F3).
3. FL1 — founder hand-test that S10's n-drag drives live continuous bunching, not a frozen re-render.
4. Both tanks render the identical 6.38 string (FL4).
5. F2 — both trains visibly present and bunching inside the slab.

**Route:** `DESIGN_OK`. Cycle 1 of the 2-cycle Checkpoint-A budget was spent and closed; budget not exhausted.
