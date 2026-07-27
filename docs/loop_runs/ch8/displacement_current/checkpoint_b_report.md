# Checkpoint B (build gate) — founder-proxy — `displacement_current`

**VERDICT: FIX(engine, blocking)** (2026-07-24, cycle 1). Finding #2 blocks → ONE scoped renderer fix (render the S5 wrong-expectation ghost tag) + re-review of STATE_5__frozen.png, then APPROVE with Finding #1 riding along. No ESCALATE (physics correct throughout); no authoring FIX (neither finding has a clean authoring channel).

## Per-finding rulings
- **P1 · S5 · Finding #2 · FIX(engine, BLOCKING) → peter_parker:renderer_primitives.** The central Rule-16a confrontation: probe reads B=2.4µT / B_gap=B_wire correctly, but the authored "no current here → B should be 0" wrong-expectation cue (s5_ghost_label, misconception_watch.visual_counter, ghost_tag_at_ms:0) renders on ZERO frames (the fleet-wide scene_composition-annotation silent no-op). Sound-off (Rule 24 default) the caption "The probe says otherwise" has no visible antecedent — the misconception setup is narration-only. No clean authoring fix (caption = locked ≤5-word delta cue Rule 34a; formula surface = one formula Rule 34b; HUD = value-only Rule 33d). Fix = scoped renderer ghost-tag element for mode b_lives_in_the_gap wired to the existing ghost_tag_at_ms:0 hook, no JSON edit (mirror the in-build S5 sustained-charge precedent). Re-review STATE_5__frozen.png before APPROVE.
  - **Degrade path:** near P1/P2 line — narrated beat complete + sound-off shows only TRUE physics. If the fix exceeds the 2-attempt engine budget → degrades to ride-along; concept approves on narrated-teaching merits, sound-off gap → founder chapter-end engine queue.
- **P2 · S4 · Finding #1 · FIX(engine, RIDE-ALONG) → peter_parker:renderer_primitives.** One-frame non-monotonic pop of the new dc_surface vertex-morph at the morph_start_at_ms:2000 boundary. founder-proxy could NOT reproduce the "full balloon" in STATE_4__dense_t02000.png or founder_drive S4_mid.png (both read flat) → bounded to a transient boundary artifact, not persistent wrong geometry; endpoints + I_enc readout correct. Warrants a monotonicity guard (S9 + future scenarios reuse dc_surface). Runs via §3b AFTER the approve commit.

## Per-state review (Pass 4)
S1–S3 correct/clean (P3: dead annotations only). S4 correct, P2 morph pop. **S5 correct physics but reads_sound_off = N (Finding #2, P1).** S6 correct (throttle-off I_c=I_d=0.00 die together, Q/Φ_E frozen — the only-while-changing distinction). S7 correct (4.0µT peak@R=6cm, 1.8µT@13cm 1/r). S8 correct (chain closes 1.2A). S9 correct (ledger sum frozen μ₀×1.20A while terms trade — S4↔S9 pair lands; P3 per-term label μ₀·I_c(1−s)=0.16A dimensionally loose). S10 alive (Rule 37, all 3 sliders moved).

## Founder-packet notes (non-blocking P3 — NOT dispatched, founder rules at chapter end)
- S9 ledger per-term label `μ₀·I_c(1−s) = 0.16 A` is dimensionally loose (μ₀·I = T·m, not A); tidy to `I_c(1−s) = 0.16 A`, keep μ₀ only in the sum chip.
- S7 R/r/peak tags stack tightly near the plate top-edge (legible, overlayCollisions=[]).
- Fleet-wide: 27 authored scene_composition annotation ids silently no-op (harmless on 9/10 states; only S5 pedagogically dependent → Finding #2). Fleet-wide render is out of loop scope.

## Confirmations
- Physics correct on built sim (on-pixel spot-check S5/S6/S7/S8/S9). No physics-doubt ESCALATE.
- S4↔S9 contrast pair reads on screen (identical morph; S4 flips "1.2 A ?", S9 sum frozen). Best decision in the design, executed well.
- No Rule 35 culture leak (anchors narration-only, nothing device-shaped drawn, plain English).
- **Highest-value sentence (provisional, pending fix):** "displacement_current is one scoped renderer fix short of the highest-value version achievable in-loop — the physics, the crisis→fix arc, and the S4↔S9 morph pair are all excellent and truthful; the only gap is that S5's central 'you'd expect zero' misconception cue renders nowhere on-canvas (Rule 24 sound-off), which the blocking ghost-tag fix closes; Finding #1's morph-monotonicity guard rides along after."

## Grade-drift self-check
Moved reject-ward: RAISED eye-walker Finding #2 from MODERATE/non-blocking to P1/blocking; held Finding #1 as a routed guard despite non-reproduction. No P1 lowered to reach APPROVE. Borderline call (block-vs-ride on #2) flagged explicitly with a clean degrade path.

## Key frames
1. STATE_5__frozen.png — the blocker (B=2.4µT present, ghost tag absent).
2. STATE_4__dense_t02000.png — reads flat (Finding #1 transient, not persistent).
3. STATE_4__dense_t08000.png — real s=1.00 funnel (calibration).
4. .founder_runs/…/S9_late.png — ledger invariant truthful (0.16+1.04=1.20 frozen).
5. .founder_runs/…/S6_late.png — throttle-off I_c=I_d=0.00 die together, Q/Φ_E frozen.

---

## Checkpoint B re-gate (cycle 2 of 3) — VERDICT: APPROVE (2026-07-24)

Blocking Finding #2 RESOLVED + re-verified on pixels (`.visual_runs/displacement_current/20260724-202229/STATE_5__frozen.png`): the ghosted `✗ Expected: no current → B̶=̶0̶` cue renders bottom-centre (dimmest text on frame, #90A4AE @0.6, italic — subordinate per Rule 29; single glow focal stays the probe, Rule 32e), B=2.4µT still reads in HUD + probe label, no collision (overlayCollisions=[], Rule 34d), real Unicode. S5 now carries the full Rule-16a confrontation sound-off. Regression scan clean across 7/10 frozen frames — tag on S5 ONLY (mode-gated to b_lives_in_the_gap), no state disturbed. founder_drive re-run (2026-07-24T18-42-47-703Z): states=10, collisions=0, flags=0, consoleErrors=0, S10 alive (motionProbe bytesEqual=false). Closure at cycle 2 of 3 on genuine evidence (founder-proxy read the frame directly + ran its own leak scan, did not trust the engine self-report). No grade drift.

**Finding #1 (S4 vertex-morph pop) — stays RIDE-ALONG, unchanged** (E2 didn't touch the morph; S4 frozen reads flat/clean, confirming transient boundary artifact). Runs via §3b after the approve.

**Complete carry-forward list:** (1) Finding #1 P2 engine ride-along (morph monotonicity guard); (2) P3 founder-packet notes — S9 per-term label `μ₀·I_c(1−s)=0.16 A` dimensionally loose (μ₀·I=T·m not A) → tidy to `I_c(1−s)`; S7 R/r/peak tag crowding (legible, no collision); fleet-wide scene_composition-annotation silent no-op (only S5's was pedagogically dependent, now closed). No new cycle-2 items.

**Final highest-value sentence (founder packet):** "displacement_current is the highest-value version achievable within loop authority: the physics is correct throughout, the crisis→resolution arc (S4 `I_enc = 0.0 A ?` → S5 probe refutation → S6 `I_d = I_c` → S9 frozen ledger) is excellent and truthful, the S4↔S9 morph-pair contrast reads on screen, and S5's central 'you'd expect zero' misconception now confronts sound-off via the ghosted `✗ Expected: no current → B̶=̶0̶` cue against the measured B=2.4µT — the last blocker, now closed; the only carry-forwards are a cosmetic S4 morph-monotonicity guard (P2, runs post-commit) and three P3 polish notes for founder discretion."
