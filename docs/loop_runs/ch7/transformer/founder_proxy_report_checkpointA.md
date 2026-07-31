# Checkpoint A — founder-proxy report — `transformer` (Ch.7 #8/8, NCERT §7.9)

VERDICT: **DESIGN_FIX** (cycle 0 → `alex:architect`; one required change, S3; max 2 cycles)

This is, by a wide margin, the strongest skeleton of the Ch.7 run — the number block is exact and self-consistent at every declared precision, the misconception design is textbook-correct, the ring-cut coherence check is done properly, and every fresh scar class (lc F1–F6 + the earlier field_3d classes) is explicitly disarmed. All verified independently, not on the skeleton's word. Returned DESIGN_FIX for **one** reason: **State 3's choreography is internally physically contradictory** — the skeleton shows the DC core flux "frozen at FULL density" while simultaneously stopping the primary beads and reading "all meters 0.00." A steady full-density flux in a soft-iron core is *sustained by* a steady primary current (Φ = Nₚ·Iₚ/ℛ); it cannot coexist with zero primary current. As written, S3 either teaches the wrong lesson ("DC doesn't flow") or renders visibly contradictory physics — on a 16a pivot state. DESIGN_FIX not ESCALATE because the correct physics is unambiguous and the fix is a surgical architect revision.

## Per-gate evidence

**Gate 1 — Physics correctness: PASS (independently recomputed, all exact).**
- Per-turn Vₚ/Nₚ = 10.0/100 = 0.100 V ✓; 100×0.100 = 10.0 V, 200×0.100 = 20.0 V ✓.
- Ratio 1 (Nₛ=100, R=25.0): Iₛ = 0.40 A, P = 4.0 W, Iₚ = 0.40 A ✓.
- Ratio 2 (Nₛ=200): Iₛ = 0.80 A, Pₛ = 16.0 W, Iₚ = 1.60 A; Iₚ/Iₛ = 2.00 = Nₛ/Nₚ ✓; chip 10.0×1.60 = 20.0×0.80 = 16.0 ✓ exact.
- Φₘ = √2·Vₚ/(Nₚω) = 14.142/157.08 = 0.09004 → 0.090 Wb ✓ (independent of Nₛ/load — S5 invariant correct).
- Losses 0.4+0.2+0.1+0.1 = 0.8; Pₚ = 16.8; η = 16.0/16.8 = 0.95238 → 95% ✓.
- Transmission: 0.800²×5.0 = 3.200 W; 0.0800²×5.0 = 0.032 W; ratio = 100.0 exact ✓ (loss ∝ 1/V²).
- Explore extremes verified (Nₛ=400@Vₚ=20 → Vₛ=80.0, P=256; Nₛ=50 → step-down inverted current; f=1.00 → Φₘ=0.023 Wb) ✓.
- Flux/voltage phase self-consistency: Nₚ·dΦ/dt = 14.137·sin(ωt) ≈ v(t) ✓. AC-only/DC-dead/lamination/hysteresis/hum physics all correct.

**Gate 2 — Rule 16a: PASS (strong).** PRIMARY = S6 "step-up = free power" (earned by S2 wonder + S5 brightening lamp; contrast beat wrong-consequence-first, not Socratic). SECOND = S3 "works on DC" killed by null-result beat. Third ("more turns squeeze more flux") demoted to S5 invariant. misconception_watch at S3, S6.

**Gate 3 — Rule 31: PASS (two downstream budget watches, not fixes).** 11-row control table complete; 11 distinct archetypes, no repeat; explore = interaction_complete with ALL four sliders; Δ cues all ≤5 words; control gating correct. **Budget watch for physics_author:** S3 (40–55) and S8 (45–55) are the ≤55-word pressure points — hold the line hardest there.

**Gate 4 — Rule 32/33/34: PASS.** cause-first per state; single glow focal from a CLOSED enum, F5 pane-level per pane; apparatus IS mechanism except S9 zoom-lens cutaway; four live needle+numeral meters; ONE formula surface with four deliberate NONEs justified; letter-subscript Unicode on all three text paths (flagged for live verify); zone map cites CSS read this dispatch + top:52px clearance + #formula_overlay suppression (disarms lc F3).

**Gate 5 — Rule 35: PASS (exemplary).** Anchor = universal grid journey; no country/brand; "the mains voltage" neutral, never numeralized; f=0.25 Hz is the viz rate. Nothing anchor-shaped drawn.

**Gate 6 — Rule 38: PASS.** S1–S7 core, S8–S9 extended, S10 advanced (contiguous pre-explore), S11 core/ring-neutral. Both ring cuts checked coherent. Explore = core only. Calculus (ε=−N dΦ/dt) confined to S10. Dialect dual-labeled once then bare. curriculum_tags as CLAIMS with needs_teacher_verification on non-CBSE cells.

**Gate 7 — State count: PASS.** 11 states justified via JEE-backwards trace + 6-question assessment coverage. Merge-grading honest; no paddable state found.

**Gate 8 — Chapter coherence: PASS with ONE required fix (S3) + one P3 note.** Chrome CSS cloned from lco_. Compose rule-of-SIX correctly recounted (transformer = 6th) and correctly **defers promotion to founder** — endorsed (refactoring 5 sealed scenarios on the final build under locked baselines jeopardizes the chapter regression proof for zero teaching benefit).

## Scar-recurrence check (no recurrences) — F1–F6 + earlier field_3d classes all disarmed by design (F2 structurally avoided: no money-moment is a recurring instantaneous crossing; all pins are held levels).

## REQUIRED CHANGE (DESIGN_FIX cycle 0 → `alex:architect`)

**1. [P1-design, physics-consistency] State 3 (`dc_is_dead`) — reconcile the primary side with the frozen flux it sustains.**

Skeleton specifies "flux tubes stand at FULL density, frozen … beads stop; all meters read 0.00." Internally impossible: steady full-density flux is produced by steady primary MMF (Φ = Nₚ·Iₚ/ℛ). If primary beads stop and Iₚ=0, flux must be zero. Revise S3 (keep the `null-result-hold` archetype; the null result moves to the **secondary**):
- **(a)** After the switch-on blip, the **primary** carries a **steady one-way DC current** — primary beads flow steadily, **Iₚ meter reads steady nonzero DC**, sustaining the **full-density frozen (non-breathing) flux** (now correct).
- **(b)** The **secondary dies**: Iₛ=0.00, no secondary beads, lamp dark — because dΦ/dt=0.
- **(c)** Retune the fix-clause: *current is still flowing and the flux is still there — but because nothing CHANGES, the secondary gets nothing.* (Isolates *change* as the sole thing that crossed — stronger than "everything dies.") Delta cue "Steady flux — nothing crosses" survives.
- **(d)** Update §10j: "all meters read 0.00" scopes to **secondary** meters; add paired assertion Iₚ reads steady nonzero + primary beads flow one-way. Update the S3 Rule-33 per-state number.
- **(e)** Do NOT numeralize the DC steady flux as 0.090 Wb (the AC peak) — DC steady flux magnitude is unrelated. Hide the Φ HUD numeral in S3 or show a steady value with dΦ/dt=0 emphasized; flag exact treatment to physics_author.
- **(Optional):** one clause that this large steady DC current is why a real transformer on DC overheats — only if the ≤55-word budget allows.

This is the sole blocking change; everything else approved.

## Non-blocking notes for physics_author
- **[P3] rms numeral divergence — KEEP the skeleton's Vₚ=10.0 rms.** ac_power_factor.json:32 defines vm=10.0 as *peak* (meters read 7.07). Transformer declares Vₚ=10.0 *rms* (peak 14.1, never numeralized). Do NOT "fix" by switching to 7.07 rms — that gives non-terminating chips (0.0707 V/turn) and reintroduces the F6 rounding-seam class. Vₚ=10.0 rms is what makes every value exact. Mitigation: make the S1 "every meter reads rms" declaration crisp/prominent.
- **[watch] S8 and S3 word budgets** — the two ≤55-word pressure points.

## Endorsements (no action)
- Compose rule-of-six deferral to founder — correct.
- Colour green = secondary-voltage — declared; left as founder's standing colour-law open item.
- Chapter-end packet: Ch.7 closes here, no successor handoff seed. Correct.

Cycle budget: design cycle 0. On re-submission, re-review S3 only (+ regression-check archetype no-repeat audit + §10j). Max 2 DESIGN_FIX cycles before ESCALATE.
