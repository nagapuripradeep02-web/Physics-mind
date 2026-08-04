# founder-proxy — Checkpoint A (DESIGN GATE) · `angular_momentum` · fix cycle 0

**Target:** `C:\Tutor\physics-mind-rotmech-c\docs\loop_runs\rotmech\angular_momentum\skeleton.md`
**Desk:** C (`feat/rotmech-c`) · Class 11 Ch.7 concept #9 · rbr scenario, already merged

> Persisted verbatim by the dispatching session — founder-proxy is report-only and writes no repo file.

## 1 · VERDICT — `DESIGN_FIX` (fix cycle 1 of a maximum 2; all findings → `alex:architect`)

This is a strong, unusually well-evidenced skeleton. I spot-checked all twenty rows of the ENGINE-REALITY WALK against the cited `field_3d_renderer.ts` lines and **every declaration/reader pair is correct** — including the hard ones (`trusted_drag_seizes` has no rbr reader; `flip_spin` defaults TRUE at `:50548`; ramp/sweep are r-only at `:49852`/`:49858`; `RBR_RO_META` is closed and skips silently at `:50162`; `deriveStateMeta.ts:496/787/3127/3927` all present). I re-derived every number in §3 from the engine's own closed forms and they are exact, including the 4.59 → 1.53 decay landing on its chip and the 0.99 re-seed. The r-exclusion ruling, the `flip_spin: false` catch, the L-vs-I 3.06 crossing catch, and the prerequisite honesty are all founder-grade judgment.

It does not pass, for five reasons that are not matters of taste. **The state timing plan is arithmetically impossible against its own narration budget** — S1 schedules four defining sentences inside 3.6 s and authors an 8 s state for 35–50 words that need ~14–20 s; the same failure repeats in S2, S3 and S4. **The primary aha has no on-screen baseline** — S3's whole payload is 4.59 → 0.99 at one speed, and only the unchanging half (ω) gets a chip. **`glow_focal: 'rbr_spin'` is a silent no-op** that dims the entire apparatus in S1 and in S3's relaunch. **The explore state's stated behaviour is contradicted by the engine** — the readouts blank for the whole duration of any slider drag, and the L arrow saturates over the top of its own slider range. And **the definition state carries neither the equation it defines nor the concept's registered headline visual**, which is also what breaks the `core_only` ring cut.

These are cheap to fix now and expensive after json-author — S1's re-timing alone moves every `at_ms` in the concept.

**Not an ESCALATE.** No physics-correctness doubt: I re-derived the S3 device against the code and it is honest (details in §4). Fix-cycle budget not exceeded.

---

## 2 · PER-STATE TABLE

Checkpoint-A form (no frames exist; `reads_with_sound_off` is judged from the authored visual plan).

| State | correct_YN | order_ok_YN | labels_present_YN | reads_with_sound_off_YN | clearly_different_YN | how_i_would_use | problem_or_missing | P |
|---|---|---|---|---|---|---|---|---|
| **S1** "A spinning body carries angular momentum" | Y | Y | Y (HUD I/ω/L, all defined before print) | **N** | Y (reveal-build; only staged-readout state) | "Watch the three numbers appear — the third one is the product of the first two." | Reveal schedule impossible vs its own 35–50 words (A1); no formula and no L arrow, so the defining relation and the registered headline visual are both absent from the definition beat (A5); `glow_focal: 'rbr_spin'` dims everything (A3) | **P1** |
| **S2** "Slower spin, smaller L" | Y | Y | Y (chip, pad label, HUD) | Y | Y (only decay-track; only hold_glow state) | "Point at I holding still while L and ω fall together — then at the live number landing on the chip we printed before it happened." | Prediction sentence must finish before the chip at 2000 ms ≈ 5 words (A1); thin information gain — 1.53 is arithmetic on S1's own numbers; near-identical picture to the sibling's approved S5 with no rendered differentiator named (A7); L arrow ends at 0.306 world units, just above the 0.22 floor | **P1** (timing) |
| **S3** "Same spin speed, smaller L" — PRIMARY AHA | Y (verified against `rbrLAt`/`rbrAnchor`) | Y | Partial — the ω chip is present, the L baseline is not | **N** | Y (only stop-and-reconfigure) | "Stop it, slide the masses in, spin it back to exactly the same speed — and read L." | The contrast's "before" (4.59) exists only in memory (A2); three motions and four narration beats in one state at 40–55 words (A9); relaunch phase focal is the no-op `rbr_spin` (A3) | **P1** |
| **S4** "L points along the axis" | Y (flip verified `:50750`, signed U+2212 `:49817`) | Y | Y (L sprite, sign colours) | Y | Y (only cycle-compare; only signed state) | "Curl your right hand with the rim — thumb up. Now the other way — thumb down, same line." | Near-verbatim duplicate of the sibling's DESIGN_OK'd S6, which is scope creep on *its* side, not this one's (§4.3); no dual-label anywhere for cross-board dialect (A11) | P3 |
| **S5** "Try it yourself" (explore) | **N as stated** | Y | Y | N during the interaction | Y | "Drag the mass, watch L re-pin from the new product." | Readouts blank for the entire drag; L arrow saturates above \|L\| = 9.00 while the slider reaches 20.7; `m` moves nothing on the apparatus (A4, A8) | **P1** |

---

## 3 · FINDINGS

### P1 — block `DESIGN_OK`

**A1 · Every guided state's timing plan is arithmetically impossible against its own word budget.** `[owner: alex:architect]`

Rule 31's own conversion is 25–55 EN words ≈ 10–20 s (≈2.6 words/s); `EXEMPLAR_RUBRIC.md` §1 measures the three exemplars at 3 narration sentences per state.

- **S1** authors 35–50 words *and* `readout_at_ms` I = 2000 / ω = 2800 / L = 3600, with §10(b) requiring each row printed **after** the sentence that defines it. Four sentences completing inside 3.6 s is ≈9 words total — below the 25-word floor for the entire state. The correct schedule for 35–50 words is roughly 8000 / 13000 / 18000 ms. S1's authored `R = 8 s` is shorter than its own 35-word minimum (~13 s).
- **S2** (40–55 w ≈ 15–22 s) authors `R = 13 s`, and requires the prediction sentence to complete before the chip at `at_ms 2000` — ≈5 words.
- **S3** (40–55 w) authors `R = 15 s` with four narration beats due by 8.5 s ≈ 21 words.
- **S4** (35–50 w) authors `R = 13 s` with the run-A description due before the 4.0 s cut.

This is design-level, not physics-author tuning: every `at_ms`, `engage/release_at_ms`, `param_ramp` window, `restart.at_ms` and `R` in §3 has to be re-derived from the word budget, and §3's pin table re-run afterwards. It matters more here than anywhere because the whole S1 design (A5) is justified by a sentence↔reveal ordering the schedule cannot deliver. Note this arithmetic appears to bind the sibling's approved skeleton too (rev3 S1: 30–45 words, "instruments built ~4.0 s, R ≥ 8 s") — worth one founder line at chapter level.

**A2 · The primary aha's contrast has no on-screen baseline.** `[owner: alex:architect]`

S3's payload is L = 4.59 → 0.99 at ω = 1.50 throughout. The design chips the half that does **not** change (`reference_marks` on `omega`, "same speed: 1.50") and leaves the half that carries the lesson to the student's memory of a number that left the screen ~6 s earlier and blanked to "—" across the restart (`rbrWriteReadouts` `:50243`). At the frozen pin the canvas shows L = 0.99 with nothing to compare it to; a teacher pausing there cannot point at the before-value. Rule 24 (reads sound-off) is not met for the concept's central claim.

The engine already supports the fix at zero engine cost: a second `reference_marks` entry, `surface: 'L'`, `form: 'chip'`, `value: 4.59`, `at_ms ≈ 7800`, label e.g. "before: 4.59". It cannot spuriously match-latch, because the match predicate is gated on the reveal (`if (on && !blank && …)`, `:50275`) and L is never 4.59 after the reveal instant.

The skeleton's own SCAR AUDIT #25 (`derivation_principle_applied_to_one_beat_but_not_its_sibling`) claims "the predictive-chip discipline is applied to BOTH quantitative beats (S2 L chip, S3 ω chip)" — but inside S3 the discipline is applied to the constant, not to the variable. That disposition is self-defeating as written.

**A3 · `glow_focal: 'rbr_spin'` is a silent no-op that dims the whole apparatus.** `[owner: alex:architect]`

§3's focal plan assigns `rbr_spin` to S1 and to S3's relaunch phase.

```js
// field_3d_renderer.ts :50776
rbrEach(function (o, ud) {
    if (ud.elementType === "rbr_root" || ud.elementType === "rbr_spin") return;
    var isFocal = !!focal && (ud.id === focal || ud.elementType === focal);
```

`rbr_spin` is skipped before the focal test, so nothing can ever match it — while `glowActive = !!focal` (`:50773`) is **true** because the string is non-empty. Every remaining element therefore takes the non-focal branch: S1 and S3's relaunch render with the entire apparatus dimmed and nothing bright. `rbr_spin` *is* listed in `RBR_ELEMENT_TYPES` (`:50587`), so §10(b)'s stated safeguard ("every glow target must name an element in `RBR_ELEMENT_TYPES`") does not catch it. Fix: name a real mesh (`rbr_drum_marker` is the right one for "a spinning body" — it is the stripe that makes the spin legible), or omit `glow_focal` (absent = no dimming; Rule 32e caps the focal count, it does not require one). S2 `rbr_brake_pad`, S4 `rbr_l_arrow`, S3's pad and `rbr_mass` phases, and S5's absent focal are all correct.

**A4 · S5's stated behaviour is contradicted by the engine on the numeric channel, and by the arrow map at the top of its own slider range.** `[owner: alex:architect]` (claim + mitigation) · **also engine, F-C3/F-C2ext below**

§3 S5 claims: "dragging `m` or `ω₀` fires a RESTART — L re-pins from the new I·ω₀ … so **L visibly tracks the product: exactly this concept's lesson**."

- **(i) The numbers do not track — they blank.** Every `input` event calls `rbrApplyParam` → `rbrRestartNow` (`:50074`, `:50078`), which sets `eng.evRepinT = t` (`:50058`). `rbrBlanked` (`:49899`) returns true for `blank_ms` after the **last** input, so during a continuous drag all three readouts render `"—"` (`:50243`) and the "restarting" badge sits over the HUD (`:50284`). The numbers reappear 500 ms after the teacher lets go. The L **arrow** does track live (the frame path is not blank-gated, `:50704–50718`), so half the claim survives — but the claim as written is wrong, and it is the state's only stated justification.
- **(ii) The arrow saturates inside the sandbox's own range.** `lLen = |L| · 0.20`, floored at 0.22 and **capped at 1.80** (`:49796–49797`, applied `:50705–50707`). The authored slider corners reach I = 0.50 + 2(5.0)(0.80²) = 6.90 ⇒ L = 20.7 at ω₀ = 3.0. The drawn length is faithful only over |L| ∈ [1.10, 9.00] — less than half the reachable range. **Dragging `m` from 2.0 to 5.0 at ω₀ = 3.0 takes L from 9.18 to 20.7 with zero change in the arrow**, in the one state whose declared lesson is that L tracks I·ω. The pull-arrow map in the same file was deliberately given a knee + asymptote for exactly this failure (`:49762–49794`); the L arrow never got one.

Authoring-side mitigation is available immediately and should be authored regardless of the engine fix: `rbrSc` reads per-concept overrides from `config.slider_controls[token]` (`:50007–50013`, schema `:2181`), so `m` and `ω₀` ranges can be narrowed to keep the reachable L inside the faithful band.

**A5 · The definition state carries neither the equation it defines nor the concept's registered headline visual — and that is what breaks the extended-ring cut.** `[owner: alex:architect]`

The pre-registered scope line this concept must obey (`src/lib/intentClassifier.ts`, rotmech block) reads:

> `angular_momentum ← L = Iω, the rotational counterpart of momentum p = mv, **drawn as a VECTOR along the rotation axis** with its direction set by the right-hand rule.`

S1 authors `show_l_arrow: false` and no `formula`. So the defining relation and the headline picture both debut in **S2** — a state about proportionality — with no narration introducing the arrow at all (S2's 40–55 words are fully committed to the prediction and the decay).

The Rule 38a consequence is concrete, not stylistic: under `core_only` (S4 cut) an unexplained axial arrow labelled `L` stands on the axle in S2 and S5 and **nothing in the surviving lesson ever introduces it**. §10(i-1) claims "the sibling's exact precedent", but the sibling's S1 explicitly draws the arrow in and narrates it as a magnitude indicator (`skeleton_rev3.md` §3 S1) — the precedent *includes* the introduction this design removes. It also breaks `APPARATUS_CONTRACT.md` §3 ("`L` is always the axial vector … identical across all eight concepts") at the exact state where a teacher first meets the machine: #10's opening pose shows the arrow, #9's does not.

The scar being served (`symbol_printed_on_canvas_before_the_lesson_defines_it`) is already discharged by the readout staging — which is the only timed channel the engine provides, and which A1 must re-time anyway. Fix: author `formula: "L = Iω"` + `show_l_arrow: true` on S1 with one clause introducing the arrow as the magnitude indicator; or write the justification for why the concept's own headline picture is absent from its definition beat.

### P2

**A6 · The pin-margin table uses a pin formula that does not govern field_3d.** `[owner: alex:architect]`
§3 states "pin = clamp(0.60R, 150, R−150)". For this renderer the frozen pin is `clampReveal(max(reveal candidates))` from `deriveStateMeta.ts:3134–3210` and `:3445` — **independent of state duration**. Recomputed actuals: S1 4800 ms (coincides), **S2 9000** (not 7800; `release_at_ms 7000 + 2000`), **S3 10000** (not 9000; `restart 8000 + blank 500 + 1500`), **S4 6000** (not 7800). All three still photograph the claim, so there is no rendered defect today — but the table is load-bearing evidence in the DoD, and A1's re-timing will be re-derived from the wrong formula unless this is corrected first. Good news for A1: because the real pin follows the reveals, lengthening the narration moves the pin automatically.

**A7 · S2 is the sibling's brake beat again, and no rendered differentiator is named.** `[owner: alex:architect]`
#10 S5 (DESIGN_OK'd) = pad translates in, L and ω decay together, release, hold. #9 S2 = pad translates in, L and ω decay together, release, hold. Same machine, same actuator, same decaying pair. τ = 0.90 here vs 0.92 there (the sibling's value is recoverable from the renderer's own callout at `:50209–50213` and the slider default at `:50000`) — a distinction no student can see, because no `tau_brake` row is ever built in either concept.

**On the substance I side with the architect: the separation is real.** The lessons differ (locked ratio vs the law's boundary condition), the on-screen endpoint numbers differ (1.53/0.50 here, ≈2.29/0.75 there), and I confirm the mechanical defense — `rbrOmegaAt` is unconditionally L/I (`:49945`) and `omega0` is a per-state constant, so a brake is genuinely the **only** implemented way to vary ω continuously at fixed I inside one state. But it is one beat of headroom, not two, and the skeleton asserts "disjoint framing and disjoint numbers" without naming a single *rendered* differentiator a reviewer could diff. The real ones exist — the prediction chip and `hold_glow: ['I']` here, the drawn `R_drum` reference line there (this concept sets `show_drum_line: false`). State them, as the chapter-coherence note Checkpoint C will check.

**A8 · S5's `m` slider has no apparatus correlate.** `[owner: alex:architect]`
The mass sphere is `new THREE.SphereGeometry(RBR_MASS_R, …)` with `RBR_MASS_R = 0.16` a constant (`:49798`, `:50357`) — deliberately mass-independent per Rule 29. Dragging `m` from 0.5 to 5.0 changes **nothing** about the drawn machine. Its only correlates are the L arrow (faithful over less than half the range — A4-ii) and the readouts (blank during the drag — A4-i). This is the direct cost of the `r` exclusion, which I otherwise endorse (§4.2), and the skeleton's disposition of `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` (#141) addresses S3's hidden arrow only and never reaches S5.

**A9 · S3 is three motions in one state.** `[owner: alex:architect]`
Rule 31 is ONE idea + ONE complete motion. S3 runs brake-in-and-stop (2.0–4.9 s), mass slide (5.6–7.6 s) and a restart (8.0–8.5 s), each with its own narration clause, at 40–55 words. The *idea* is one; the motion is three sequential ones, and A1's re-timing will make the pacing load plain. I accept the device (§4.1) — but state in the design why this is one beat rather than two, and check the split (S3a "stopped: L is zero"; S3b "masses in, restart at the same speed, L is smaller") against the 5-state budget before rejecting it.

### P3

**A10 · Rule 38g — JEE/NEET/CBSE cells asserted without `needs_teacher_verification`.** §10(i-3) marks CBSE/NCERT "verified" and gives JEE Main/Advanced and NEET rings with no flag. No real teacher of any curriculum has confirmed anything; 38g says every unverified cell ships the flag. Inherited from the sibling — chapter-wide, one founder line rather than a per-desk fix.

**A11 · Rule 38d — no dual-label anywhere.** "moment of inertia" is common to all boards but AP/IB texts also say "rotational inertia"; one dual-label-once at first use costs a clause and buys the widest read.

**A12 · The L-vs-I numeric crossing in S2 is flagged but not fenced for the 0d reader.** L sweeps 4.59 → 1.53 and passes exactly 3.06 at t ≈ 5.30 s, momentarily equal to the hold-glowed I readout. The skeleton **catches this** (§3 numeric block) and correctly hands the narration/glow constraint to physics_author — real credit; the renderer's own callout at `:50209–50213` warns about the sibling's version of it. Add one line naming it in the handoff, because THE EYE's dense window (3.6–7.0 s) will photograph it and the 0d reader will otherwise file it as a defect.

**A13 · S2 and S3 titles are rail twins.** "Slower spin, smaller L" / "Same spin speed, smaller L" occupy adjacent rail rows and truncate to near-identical strings. Rule 41d makes the first words load-bearing precisely because the rail truncates; two adjacent entries that read alike is a navigation defect for the teacher who is scrubbing between states.

---

## 4 · THE FIVE RULINGS THE DISPATCH ASKED FOR

### 4.1 · S3's central device — verified honest, and accepted

Traced against the code, not the prose:

- `release_at_ms 5200` caps `rbrBrakedSeconds` at 2.6 s, so `mag = 4.59 − 2.00·2.6 < 0` ⇒ **L is clamped to exactly 0 permanently** from the stop instant (`rbrLAt` `:49937–49943`), not merely small.
- Therefore `rbrOmegaAt` = L/I = **0 for every I(t)** during the 5.6–7.6 s slide (`:49945`), and `rbrThetaAt` accumulates nothing (`:49961`). The platform is genuinely **still**, not slow. The slide renders zero rotational dynamics, exactly as claimed.
- The restart re-seeds `L₀ = rbrIOf(rbrRAt(8500), m)·ω₀·rbrSignAt(8500)` (`rbrAnchor` `:49922`). `rbrRAt(8500)` returns the ramp's held `to = 0.20` (`:49854`) ⇒ I = 0.66; `flip_spin: false` short-circuits `rbrSignAt` (`:49908`) ⇒ sign +1. **L₀ = 0.99, ω = 1.50 exactly.** The `flip_spin: false` catch is essential and correct — the default is TRUE (`:50548`) and an unset flag would have reversed the spin silently.
- Post-restart `rbrBrakedSeconds(8500, t)` = 0 (the brake window closed at 5200), so L holds at 0.99 and the ω chip's match-latch fires and stays (`:50275`).

**Physically honest?** Yes. "Stop it, move the masses in, spin it back up to exactly the same rate, read L" is a real experiment a teacher could run on a lab turntable, and it is the honest way to put two moments of inertia at one angular speed on a single machine. It teaches no wrong picture: a still platform whose masses slide is a still platform whose masses slide, and the I readout falling as pure geometry is exactly what happens.

It is also close to forced. `omega0` is a per-state constant, so a two-speed comparison inside one guided state is impossible; and any r motion while the body spins renders the sibling's conservation aha, because ω is unconditionally L/I. The architect found the one path that teaches the I-factor without stealing #10's material, and the "r never moves while the body spins" rule is the right invariant to have written down.

**Does the re-pin blank make the discontinuity read as a restart?** Mechanically yes — the badge and the 500 ms readout blank are the engine's designed idiom for exactly this (Addendum C, `:50283`, `:49899`), and the sibling's approved S6 relies on it. One honest caveat the design should carry: the badge blanks the **readouts only** — the apparatus is not blanked, so the student watches a still turntable start spinning again with no visible agent. In the sibling that idiom sits between two symmetric runs; here it lands mid-way through a *sequential physical narrative*, which is a harder read. The §4 attribution rule ("restarted at the same speed as before, the closer-in masses carry less angular momentum") is the correct mitigation and is specified. **Accepted as designed** — but it is the one place where narration is doing structural work, which is another reason A1 must be fixed before build.

### 4.2 · The explore state — excluding `r` is right; S5 still earns its place, but not as authored

**Exclusion: correct, and I would have made the same call.** Verified: `rbrApplyParam('r', v)` clamps and returns with **no** restart (`:50068–50070`), so L holds and ω = L/I rises — literally the sibling's primary aha, reachable on the first drag of the most tempting slider in the panel. The mechanism is also right: `rbrSliderTokensUsed` builds rows only from the union of tokens named anywhere in the concept (`:50015–50025`), so the `r` row never exists rather than being hidden.

**Is the sandbox crippled?** No. With r pinned at 0.80, `m ∈ [0.5, 5.0]` gives I = 0.50 + 2m(0.64) ∈ [1.14, 6.90], and every `m` change restarts (`:50074`) so L re-pins from I·ω₀. A teacher can therefore produce "same ω, different I ⇒ different L" — **this concept's own primary aha** — from the sandbox, and vary ω independently via `ω₀`. Both factors of L = Iω stay live. Nothing pedagogical is lost.

**Does S5 earn its place?** Yes in principle — but as authored, the one interaction it exists for blanks its own instruments for the whole drag (A4-i), saturates its own vector over the top third of the range (A4-ii), and moves nothing on the machine (A8). Fix those and it is a good sandbox. Ship it as written and it is a state where a teacher drags a dial and watches three dashes.

### 4.3 · Every `[LIVE]` claim — spot-checked

I checked all twenty rows of the ENGINE-REALITY WALK against the cited declaration and reader lines. **All twenty are correct**, including the ones easiest to get wrong: `trusted_drag_seizes` declared at `:1052` with rbr readers genuinely absent (readers exist only at `:25047`, `:42953`, `:45744`, `:48645`); `flip_spin` default TRUE at `:50548`; `param_ramp`/`idle_auto_sweep` r-only at `:49852`/`:49858`; `omega0_rad_s` taking `Math.abs` at `:50497`; `release_at_ms` resolved by `typeof` at `:50523`; `RBR_RO_META` closed with the silent `continue` at `:50163`; `RBR_ALWAYS_ON` + overlays-default-OFF at `:50585`/`:50596`; the HUD at `top:52px` clearing the Full-screen button at `:50443`; and `deriveStateMeta.ts:496 / :787 / :3127 / :3927` all present with a genuine rbr reveal block (which, notably, **does** handle `readout_at_ms` at `:3189–3196`, so S1 will not pin at the 1500 ms default). The reverse walk holds too — every state consumes ≥1 implemented row and no state touches a declared-inert member. This is the most accurate engine walk I have reviewed in this chapter.

**One claim fails, and it is outside the table:** the §3 focal plan's `rbr_spin` (A3) — a token that is in `RBR_ELEMENT_TYPES` yet unreachable by the glow pass. **One is materially overstated:** S5's live-tracking claim (A4). The lesson for the next revision is that the walk covers *config fields* but not *config values*; the enum-membership check in §10(b) is not a substitute for checking that a named token is reachable by the code that consumes it.

### 4.4 · The two engine findings

**F-C1 — CONFIRMED, all four links.** `[owner: peter_parker:field3d_surgeon]`
1. `padOn = (et2.source||"brake") === "brake" && Math.abs(rbrNum(et2.tau_brake_Nm, 0)) > 0` reads the **authored** per-state config (`:50627`).
2. `rbrApplyVisibility`'s **sole call site** is `applyRigidBodyRotationState` (`:50559`) — I grepped the file; there is no other.
3. `rbrApplyParam('tau_brake', …)` (`:50079–50088`) sets `eng.evAnchorT/evAnchorL`, `eng.tau`, `eng.brakeOnMs` and never touches `eng.padEngageMs`, and never re-runs the visibility pass.
4. The pad pose is gated on `if (pad && pad.visible)` (`:50728`) and on `eMs = (eng.padEngageMs == null) ? Infinity : …` (`:50732`) — with `padEngageMs` null the pad, if visible at all, never leaves `parkZ`.

So an explore state authored with entry `tau_brake = 0` (the only sane authoring, since a nonzero entry brakes from t = 0) applies real external torque with **no rendered agent**. **It does bind `conservation_of_angular_momentum` S8**, whose approved contract reads "the brake applies live τ_ext while held > 0" (`skeleton_rev3.md` §3 S8). Desk A should either drop the live brake from S8 or hold S8 until the fix lands — this is a blocking-class defect on an already-DESIGN_OK'd design, and the finding is correct as filed.

**F-C2 — CONFIRMED but INCOMPLETE.** `RBR_L_ARROW_MIN = 0.22` (`:49797`) applied unconditionally at `:50705–50707`, and at L = 0 the sign resolves to +1 (`:50669`) so a **stopped platform renders an up-pointing 0.22 arrow beside `L = 0.00`** — a rendered lie, exactly as filed, and S3's `show_l_arrow: false` is the right local mitigation. The finding **omits the half that bites the sandbox**: `RBR_L_ARROW_MAX = 1.80` clips everything above |L| = 9.00, which S5's own sliders reach easily (A4-ii). It also omits that the fixed 0.20 scale leaves the whole guided band drawing between 0.306 and 0.918 world units against an 1.80 ceiling — the small-arrow direction of the same problem. The request should be the map the pull arrow already has (`:49762–49794`): true zero below ε, linear through a knee placed above the guided band, asymptotic above it.

**F-C3 — NEW, filed here.** `[owner: peter_parker:field3d_surgeon]` The re-pin blank fires on every `input` event (A4-i), so a continuous drag hides the HUD for its entire duration; and `rbrRestartNow` calls `rbrThetaReset()` (`:50063`) on every one of those events, which both re-accumulates the whole fixed grid from zero per event (O(n) at `:49960`, up to `RBR_GRID_MAX` 20000) and makes the drum marker stripe's angle jump on each drag tick, since θ is recomputed with the new ω back to t = 0. Suggested shape: fire the blank on `change` (or on a sign flip, or debounced) rather than on `input`, and re-anchor θ continuously instead of resetting it. Ride-along for #9; it degrades **every** rbr sandbox, including the sibling's S8.

### 4.5 · Rules 31 / 32 / 34 / 35 / 41

**Rule 31 — 5 states is lean but complete, and coverage is not being traded for tidiness.** The scoped claim needs the definition, each of the two factors, the vector nature, and a sandbox; that is what is authored. Nothing in the pre-registered scope line is unserved, and nothing is stolen from #6 (how I is computed — never touched; `show_r_line: false` keeps the `r` glyph off screen entirely), #7 (τ = Iα — the word "torque" appears in no reader-facing string, and no `tau_brake` row is ever built so the τ glyph at `:50000` never renders), #8 (KE_rot — `KE` deliberately absent from `readouts`), or #10 (r never moves while the body spins). **No state is derivable from its predecessor**, though S2 is the thin one: 1.53 is arithmetic a student can do on S1's own numbers, and S2 earns its place on the wrong-belief setup Block 2 describes rather than on new information. The 4-guided-state lesson genuinely completes L = Iω.

**Rule 32** — 32a cause-before-effect verified per state (S2's 1.1 s pad travel, S3's completed slide, S4's cut-blank). 32b holds: S3's three movers are sequential, never simultaneous. 32c: every delta cue is ≤5 words and opens its caption. 32d: home pose held everywhere, and S3 correctly authors `masses.r_m = 0.80 = ramp.from` (also enforced at `:50538`). **32e is violated by A3** in S1 and S3's relaunch.

**Rule 34** — one formula surface per state (S1/S4 none, which is legal: `:50573` hides it on an absent string); delta cue only on canvas; prose below; all math Unicode via `rbrFx`'s U+2212 (`:49817–49823`); HUD zone clears the review chrome (`:50443`). Clean.

**Rule 35 / 38f** — merry-go-round (S1) and spinning bicycle wheel held by its axle (S4). Both universal, both on the `APPARATUS_CONTRACT.md` §3 approved list, both assigned to a state with a word budget, both land on the beat they illustrate. The bicycle wheel is the widest-overlap axial-vector demo across CBSE/JEE/NEET/IB/A-level/AP. No region constants anywhere. Clean.

**Rule 41** — every reader-facing string is basic literal English: titles, delta cues, chip labels ("predicted L = 1.53", "same speed: 1.50"), and the engine's own "restarting" badge. No idiom, no metaphor, no personification. "carries angular momentum" is standard physics register, not personification. Only A13 (rail twins) applies.

### 4.6 · The term-introduction ledger and S1 · Prerequisites

**The ledger** is the right instinct and the S1 resolution is the wrong trade — see A5. The engine constraint the architect identified is real and I verified it: `#rbr_formula` is written once in `applyRigidBodyRotationState` (`:50570–50574`) and never touched per frame, and `show_l_arrow` is resolved once in `rbrApplyVisibility` (`:50609`), so neither can be revealed on a timer. The choice is genuinely binary — t = 0 or the next state. But the scar being served is already discharged by the readout staging, and the cost of the chosen branch is that the concept's *registered* headline visual and its defining equation are both missing from its definition beat, and that the `core_only` preset renders an arrow nothing explains. Take the t = 0 branch.

**Prerequisites — handled honestly, and this is the right shape.** §8 names the dangling-id problem explicitly, marks it an OPEN FOUNDER QUESTION with the desk-contract wording ("the ruling must land **before** this concept seals, not at seal"), forbids json_author from silently dropping the array or substituting ids, correctly declines to list `torque` (#5) since the concept never uses the word, and correctly refuses to name linear momentum as a prerequisite id because none is registered. No dangling id is presented as resolved. One gap worth closing in the same revision: say what happens if the ruling is *"they will not exist by seal"* — Rule 23 makes prerequisites advisory (a soft UI suggestion, never a gate), so the honest fallback is to ship the array anyway, and that should be written down rather than left to the seal session to improvise.

---

## 5 · ENGINE QUEUE

| ID | Finding | Owner | Tag |
|---|---|---|---|
| **F-C1** | Sandbox live `tau_brake` drag applies real torque with the pad invisible/parked. Chain verified: `:50627` reads authored config · `rbrApplyVisibility` sole call site `:50559` · `rbrApplyParam` `:50079–50088` never sets `padEngageMs` · pose gated `:50728`/`:50732`. Fix shape: on a live τ crossing 0 → set `padEngageMs = now` and travel in; on a return to 0 → release; make pad visibility follow `eng.tau > 0`, not only the authored config. Probe: in a sandbox state with entry `tau_brake = 0`, drag τ to 1.0, assert `rbrFindById('rbr_brake_pad').visible === true` and `position.z === drumR·1.8 + 0.09` within `pad_travel_ms`. | `peter_parker:field3d_surgeon` | **ride-along for #9** (no `tau_brake` anywhere) · **BLOCKING for `conservation_of_angular_momentum` S8** — Desk A must drop the live brake from S8 or hold |
| **F-C2 (ext)** | L-arrow map: true-zero suppression below ε **and** the missing high end. `RBR_L_ARROW_MIN 0.22` / `MAX 1.80` / `SCALE 0.20` (`:49796–49797`, applied `:50705–50707`) ⇒ faithful only on \|L\| ∈ [1.10, 9.00]; L = 0 draws a 0.22 stub; the sandbox reaches L = 20.7. Fix: the knee + asymptote map the pull arrow already has (`:49762–49794`), sized so the guided band [1.53, 4.59] is large and readable. Probe: assert `len(0) === 0`, `len(20.7) > len(9.18)`, and `len(4.59)/len(1.53) === 3.0`. | `peter_parker:field3d_surgeon` | ride-along |
| **F-C3 (new)** | Re-pin blank fires on every `input` event ⇒ HUD reads `"—"` for the whole duration of a slider drag (`:50058`, `:49899`, `:50243`); `rbrThetaReset()` per input event (`:50063`) re-accumulates the grid from zero (`:49960`) and jumps the drum marker's angle on every drag tick. Fix shape: blank on `change` / sign-flip / debounce; re-anchor θ continuously. Probe: drag `m` for 3 s, assert `rbr_ro_L_val.textContent !== "—"` on ≥90% of frames and that `PM_rbrTheta` is monotonic. | `peter_parker:field3d_surgeon` | ride-along (degrades every rbr sandbox incl. #10 S8) |

**Cross-desk note for Desk A (actionable, per the dispatch):** F-C1 is confirmed and binds your approved S8. Separately — and this is a founder/Checkpoint-C item, not a routed finding — **#9 S4 and #10 S6 are the same state**: same archetype, same two restarted opposite-spin runs, same grip hand, same arrow flip, same extended ring, same misconception family. By the atomic claims, **#9 owns it**: its registered scope line explicitly includes "drawn as a VECTOR along the rotation axis … right-hand rule", and #10's own §1 says it "does not cover what angular momentum is". A teacher running both sims back to back sees the identical beat twice. If #10 keeps a vector state, the version that would be new is the one inside *its* scope — that the **direction** of L is conserved too, not just its magnitude.

---

## 6 · CANDIDATE SCAR ROWS

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause,
  prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type) VALUES
('skeleton_reveal_schedule_incompatible_with_its_own_authored_word_budget',
 'Skeleton schedules timed reveals faster than its own narration can reach them',
 'CRITICAL','alex:architect',
 'The state timing plan (readout_at_ms, chip at_ms, engage/release, ramp, restart, R) is derived from choreography alone, while the term-introduction ledger separately asserts each reveal lands AFTER the sentence defining it. Nothing cross-checks the two: angular_momentum S1 scheduled four defining sentences inside 3600 ms (~9 words) in an 8 s state authored for 35-50 words (~14-20 s at Rule 31 pacing).',
 'Every skeleton that authors a timed reveal AND a per-state word budget must show the conversion: words / 2.6 words-per-second gives the sentence boundary each reveal must clear, and the state duration R must exceed the full narration. Do it before the pin table, which depends on it.',
 'js_eval',
 'For each guided state: words_max/2.6*1000 <= duration_ms, AND for each readout_at_ms/reference_marks.at_ms entry, the cumulative words of the sentences preceding it / 2.6 * 1000 <= at_ms.',
 'OPEN', ARRAY['angular_momentum','conservation_of_angular_momentum']::text[],
 ARRAY[]::text[], 'rotmech desk C Checkpoint A 2026-08-04', 'incident'),

('glow_focal_names_a_container_the_glow_pass_skips_so_the_whole_scene_dims',
 'A glow_focal token in the element enum but skipped by the glow pass dims everything and brightens nothing',
 'CRITICAL','alex:architect',
 'applyRigidBodyRotationGlow returns early for rbr_root and rbr_spin (field_3d_renderer.ts:50776) while glowActive is computed from the focal string being non-empty (:50773). Naming rbr_spin therefore dims every peer with no focal. rbr_spin IS listed in RBR_ELEMENT_TYPES (:50587), so the usual "focal must be in the element enum" check passes.',
 'A glow_focal must name an element the glow pass can actually match, not merely a member of the element-type enum. Group/container types are excluded by the pass; check the consumer function, not the enum. An absent glow_focal is legal (Rule 32e caps the count, it does not require one).',
 'js_eval',
 'For each state glow_focal g: assert some registered object has (userData.id === g || userData.elementType === g) AND g is not in the pass early-return list.',
 'OPEN', ARRAY['angular_momentum']::text[], ARRAY[]::text[],
 'rotmech desk C Checkpoint A 2026-08-04', 'incident'),

('contrast_state_chips_the_constant_and_leaves_the_changed_quantity_to_memory',
 'A same-X-different-Y state marks X on screen and leaves Y''s baseline off screen',
 'MAJOR','alex:architect',
 'angular_momentum S3 teaches "same omega, much smaller L" and authors a reference_marks chip on omega (the quantity that does NOT change) while L''s before-value 4.59 leaves the screen ~6 s before the after-value 0.99 appears, blanked across the restart. The state does not read sound-off, and the frozen frame cannot be pointed at.',
 'In any state whose claim is a CONTRAST, the baseline of the quantity that CHANGES must be on screen beside its new value at the pin. Chip the variable, not (only) the constant.',
 'manual',
 'For each misconception/contrast state, list the quantities the claim compares; assert the changing quantity has a rendered baseline (reference_marks, ghost, or persistent second readout) visible at the frozen pin.',
 'OPEN', ARRAY['angular_momentum']::text[], ARRAY[]::text[],
 'rotmech desk C Checkpoint A 2026-08-04', 'incident'),

('explore_slider_range_drives_the_taught_vector_past_its_own_arrow_clamp',
 'Sandbox slider corners push the taught quantity beyond the arrow map''s clamp, freezing the arrow while the number climbs',
 'MAJOR','peter_parker:field3d_surgeon',
 'RBR_L_ARROW_SCALE 0.20 with MIN 0.22 / MAX 1.80 (field_3d_renderer.ts:49796-49797, applied :50705-50707) is faithful only over |L| in [1.10, 9.00]; the authored m/omega0 slider corners reach L = 20.7. Dragging m from 2.0 to 5.0 at omega0 = 3.0 changes L 9.18 -> 20.7 with no change in the arrow, in the state whose lesson is that L tracks I*omega. The pull arrow in the same file has a knee+asymptote map for exactly this; the L arrow does not.',
 'Any arrow representing a slider-reachable quantity gets a bounded/asymptotic map sized so the GUIDED band is exactly proportional and the sandbox corners degrade instead of clipping; true zero must be drawable. Alternatively narrow the range via config.slider_controls so the reachable band stays inside the faithful window.',
 'js_eval',
 'Sweep every slider corner combination; assert arrowLen is strictly monotonic in |L| across the reachable range and arrowLen(0) === 0.',
 'OPEN', ARRAY['angular_momentum','conservation_of_angular_momentum']::text[],
 ARRAY[]::text[], 'rotmech desk C Checkpoint A 2026-08-04', 'incident'),

('repin_blank_fires_on_input_so_a_slider_drag_hides_the_readouts_it_teaches',
 'The re-pin blank re-arms on every input event, blanking the HUD for the whole duration of a drag',
 'MAJOR','peter_parker:field3d_surgeon',
 'rbrRestartNow sets eng.evRepinT = now (field_3d_renderer.ts:50058) and rbrBlanked (:49899) blanks for blank_ms after it; the m/omega0 slider handlers call it on every input event (:50074/:50078), so a continuous drag keeps the readouts at "—" (:50243) throughout. rbrThetaReset (:50063) per event also re-accumulates the fixed grid from zero (:49960) and jumps the marker stripe.',
 'A re-pin cue marks a DISCRETE restart. Fire it on change / on a sign flip / debounced, never on every input tick, and re-anchor theta continuously so a drag does not teleport the body.',
 'js_eval',
 'Drive a synthetic 3 s drag on m; assert rbr_ro_L_val.textContent !== "—" on >=90% of frames and PM_rbrTheta is monotonic throughout.',
 'OPEN', ARRAY['angular_momentum','conservation_of_angular_momentum']::text[],
 ARRAY[]::text[], 'rotmech desk C Checkpoint A 2026-08-04', 'incident'),

('skeleton_pin_table_uses_a_pin_formula_the_target_renderer_does_not_use',
 'Pin-margin table derived from 0.60*duration when the renderer pins from its reveal candidates',
 'MODERATE','alex:architect',
 'field_3d frozen pins come from clampReveal(max(reveal candidates)) in deriveStateMeta.ts:3134-3210 / :3445 and are INDEPENDENT of state duration. angular_momentum''s table asserts clamp(0.60R,150,R-150); the real pins are S2 9000 (not 7800), S3 10000 (not 9000), S4 6000 (not 7800).',
 'Compute the pin table from the renderer''s own reveal-candidate function for that scenario, not from a duration fraction. Cite the deriveStateMeta lines that produce each candidate.',
 'js_eval',
 'Run deriveMaxRevealTimeMs over the concept JSON and diff against the skeleton''s asserted pin instants.',
 'OPEN', ARRAY['angular_momentum']::text[], ARRAY[]::text[],
 'rotmech desk C Checkpoint A 2026-08-04', 'incident');
```

Checked against this run's other candidate files (`docs/loop_runs/rotmech/_engine/findings_c.md` PASS 1 + PASS 2) — no `bug_class` collision. All six use live-enum values (`probe_type` ∈ js_eval/manual; `row_type` = incident; `severity` ∈ CRITICAL/MAJOR/MODERATE; both arrays are Postgres literals, never NULL).

---

## 7 · KEY LOCATIONS (no frames exist at Checkpoint A — these are the five places to look)

1. `C:\Tutor\physics-mind-rotmech-c\src\lib\renderers\field_3d_renderer.ts:50769–50790` — `applyRigidBodyRotationGlow`; the early return on `rbr_spin` at `:50776` is A3 in three lines.
2. `…\field_3d_renderer.ts:49796–49797` + `:50704–50718` — the L-arrow scale and its two hard clamps; the whole of A4-ii and F-C2's missing half.
3. `…\field_3d_renderer.ts:50050–50089` — `rbrRestartNow` / `rbrApplyParam`; F-C1 (no `padEngageMs`, no visibility re-run) and F-C3 (`evRepinT` + `rbrThetaReset` on every input) in one screen.
4. `…\docs\loop_runs\rotmech\angular_momentum\skeleton.md` §3 S1 row + §10(b) ledger — read together, A1 and A5 are both visible on one page.
5. `C:\Tutor\physics-mind-rotmech-c\src\lib\validators\visual\deriveStateMeta.ts:3134–3210` — the real rbr pin derivation; A6, and the reassurance that A1's re-timing will move the pins automatically.

---

## 8 · RUBRIC (advisory, unratified — `docs/EXEMPLAR_RUBRIC.md`; did not affect the verdict)

Checkpoint A scores the five answerable from a skeleton. `docs/EXEMPLAR_RUBRIC.md` §3's thresholds are explicitly unratified and are not quoted or applied here; the number below carries no authority and blocked nothing. The verdict is `DESIGN_FIX` on findings A1–A5 alone and would be identical with this section deleted.

```
D1 1 · D2 1 · D8 2 · D9 2 · D10 1   = 7/10  (A-subset: D1, D2, D8, D9, D10)

weakest: D10 explore earns its place — the sandbox's one interaction blanks all three
         readouts for the whole drag (rbrBlanked :49899 re-armed per input event
         :50074), its L arrow saturates at |L| = 9.00 while its own sliders reach
         20.7 (:49797), and the m slider changes nothing on the drawn apparatus
         (RBR_MASS_R is a constant, :49798). Both dials do change L on paper.

         D1 information gain — no state is derivable from its predecessor, but S2 is
         thin: its payload L = 1.53 at omega = 0.50 is arithmetic on S1's own printed
         numbers (I = 3.06, omega = 1.50, L = 4.59). It earns its place on the
         wrong-belief setup Block 2 describes, not on new information.

         (D2 ties at 1: the arc order IS the equation being built — the product, then
         each factor, then the vector nature — but the aha lands at S3 of 5, the 60%
         mark, where the measured exemplars land theirs at 33-50%.)
```

---

*Handoff: `DESIGN_FIX`, fix cycle 1 of 2. All findings A1–A13 route to `alex:architect`. On the resubmission I will re-check A1's re-derived timing against the word budget, A2's L chip, A3's focal tokens against the glow pass, A4's corrected S5 claim plus the slider-range mitigation, and A5's S1 overlays plus the re-run 38a cut. F-C1/F-C2ext/F-C3 → `docs/loop_runs/rotmech/_engine/findings_c.md` for Desk E; none blocks this concept, but **F-C1 blocks `conservation_of_angular_momentum` S8 on Desk A**. The #9-S4 / #10-S6 duplication and the Rule-38g tag-verification pattern are chapter-level items for the founder at Checkpoint C, not desk-C fixes.*
