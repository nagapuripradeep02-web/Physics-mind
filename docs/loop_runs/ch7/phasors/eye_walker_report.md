# THE EYE report — `phasors` (Ch.4 #4, `ac_phasor`)

> Persisted by the loop session from the eye-walker dispatch (ran ∥ quality-auditor). Curates, does not approve.

**Run read:** `.visual_runs/phasors/20260723-203921/` (all 8 states — contact sheets, `__frozen`, dense series, `KEYFRAMES_STATE_8`). Also re-ran `npm run visual:eyes -- phasors` (new run dir `.visual_runs/phasors/20260723-205240/` — functionally identical, deterministic gates only).

**Deterministic gate summary (verbatim):**
```
📊 35 deterministic checks · 35 passed · 0 failed · $0.00 · 279574ms
✅ Deterministic gates clean. Now Read the frames — the eye is the gate the machine cannot replace.
```

**Engine bug queue pre-walk:** `query_engine_bug_queue.ts phasors --field3d --open` → no matching rows.

---

### Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| S1 spin-draws-wave | ✓ | ✓ | ✓ | ✓ | disc rotates at constant 90°/s (T=4s); t=1000/5000 samples looked identical at first glance — that's period-aliasing at 1s cadence, not a freeze (verified with t=2000/3000/4000/8000) |
| S2 arrow-vs-shadow | ✓ | ✓ | ✓ | ✓ | readout box + slider land correctly; arrow decelerates and locks with "shadow = 0.0 V (arrow still 10.0 V long)" caption — misconception pivot lands as designed |
| S3 two-arrows-one-clock | ✓ | ✓ | ✓ | ✓ | i/φ readout, φ=0° in-phase, amber current + cyan voltage overlap correctly |
| S4 lag-becomes-angle (PRIMARY aha) | ✓ | ✓ | ✓ | ✓ | inductor coil, pink φ-arc opens to 90°, "i behind v" — clean |
| S5 lead-is-the-mirror | **✗** | ✓ | ✓ | partial | **FINDING 1** — frozen/H2 pin shows φ=15.0° in both the readout box AND the on-canvas mini-caption, while the static formula overlay says "φ = 90° — i ahead of v" and EVERY dense sample (t=0…14000) shows φ=90.0°. The H2 pin landed mid-ramp; only S5's baseline is affected (S4's frozen correctly shows 90°) |
| S6 read-the-frozen-diagram | ✓ | ✓ | ✓ | ✓ | finish-line + derived timestamps ("i first — t=1.0s", "v — t=2.0s (Δt=1.0s)") match the F2 spec exactly (first crossing ≈1.0s, gap 1.0s); three-cell scoreboard spans full band width, legible, ANGLE-only labels (R:φ=0°, L:i 90° behind, C:i 90° ahead) — zero X_L/X_C/Ω reactance numerals anywhere. The transient crossing-FLASH pulse itself wasn't independently caught at 1s sampling cadence (ambiguous — ok per false-positive class, verified functionally via the derived timestamps instead) |
| S7 angle-is-ωt (derivation) | **✗** | ✓ | ✓ | partial | **FINDING 2** — the circuit's R/L/C element box is COMPLETELY ABSENT throughout the entire state (t=0, t=10000, and the FROZEN pin all show an open wire gap, not a dimmed element) while i/v are still shown flowing — a visibly broken/open circuit. 4-line derivation formula chain + radian θ-readout are correct |
| S8 explore (sandbox) | ✓ | ✓ | ✓ | ✓ | apparatus reached through S7 ships BRIGHT (resistor box full brightness, confirmed via `KEYFRAMES_STATE_8`), continuous non-frozen motion (Rule 37), all 4 F8 controls present. "Resistance R: 5.0 Ω" is the legitimate element-value slider — NOT an F4 violation (F4 bans `X_L`/`X_C` reactance symbols specifically; none observed anywhere in the fleet) |

Colour law (cyan=voltage, amber=current) verified consistent S2–S8. No ASCII math (`Phi`/`omega`/`->`) observed anywhere — all Unicode (φ ω θ π ° ∠). No zoom/size-based emphasis observed.

---

### Frames for founder eyes (4)

1. `.visual_runs\phasors\20260723-203921\STATE_5__frozen.png` — the φ=15° vs "φ=90°" contradiction baked into the H2 baseline.
2. `.visual_runs\phasors\20260723-203921\STATE_5__dense_t00000.png` — contrast reference: same state, φ correctly reads 90° everywhere else, confirming this is a pin-timing artifact not a physics bug.
3. `.visual_runs\phasors\20260723-203921\STATE_7__frozen.png` — the open/missing circuit element at the H2 pin.
4. `.visual_runs\phasors\20260723-203921\STATE_7__dense_t10000.png` — confirms the element is missing throughout the state, not just at the freeze instant.

---

### Candidate `engine_bug_queue` rows (report only — not inserted)

**Row 1**
- `bug_class`: `field3d_h2_freeze_pin_predates_ramp_completion`
- `severity`: MAJOR
- `owner_cluster`: **ambiguous** — `peter_parker:runtime_generation` (deriveStateMeta/reveal_hold pin-ms calc for STATE_5) vs `peter_parker:renderer_primitives` (the φ-ramp choreography timing itself) — need source access to tell which one is early
- `prevention_rule`: a state with a ramp-then-hold phase/angle choreography must have its H2 `SET_TIME_FREEZE` pin ms set AFTER the ramp settles to steady value — assert pin_ms ≥ ramp_complete_ms before sealing.

**Row 2**
- `bug_class`: `field3d_circuit_element_missing_open_loop_derivation_state`
- `severity`: CRITICAL (reads as a rendering bug — an open circuit with current still flowing is physically nonsensical, and it breaks Rule 32d apparatus-continuity in the concept's own derivation state)
- `owner_cluster`: **ambiguous** — `peter_parker:renderer_primitives` (if the element mesh got opacity 0 instead of the skeleton's intended "dim" E4 pattern) vs `alex:json_author` (if STATE_7's `scene_composition` simply never declared the element primitive at all)
- `prevention_rule`: any guided state that keeps current/voltage visibly flowing must keep the active circuit element rendered (dimmed if the state calls for an E4 apparatus-dim, but never omitted/left as an open wire gap).

---

### Disagreements for Checkpoint B to adjudicate

1. **STATE_5 φ mismatch** — is the 15°/90° discrepancy a genuine defect (my read) or an accepted "H2 pins mid-transition, live readout ramps, static formula label always shows the target" design pattern used elsewhere in the fleet? I found no precedent for two live numbers of the same symbol (φ) disagreeing on-screen simultaneously, so I'm treating it as a defect, but Checkpoint B should confirm against the physics_block/skeleton's own SET_TIME_FREEZE contract.
2. **STATE_7 missing element** — skeleton line 42/438 explicitly anticipates S7 "dims the apparatus" (E4 pattern) for its derivation hold. What I observed is not dimming, it's absence (a literal gap in the wire loop). Founder/Checkpoint B with source access should confirm whether this is the E4 pattern gone wrong (opacity→0) or an authoring omission.
3. **S6 crossing-flash pulse** — not independently confirmed frame-by-frame (1s dense cadence may simply miss a sub-second flash); the design's own founder:drive cropped-frame collision probe is specced as the correct instrument for this, not THE EYE's sampling. Not flagged as a fail, but noted for Checkpoint B's planned artifact.

---

### Overall read: **FINDINGS (2)**

Both findings are localized (S5 baseline-pin timing; S7 missing circuit element) — the other 6 states are clean. Neither is a fleet-wide/renderer-level regression signature (S4's φ-ramp and S8's post-S7 brightness both check out correctly), so I'd scope any fix to STATE_5 and STATE_7 specifically rather than a broader `ac_phasor` scenario sweep.
