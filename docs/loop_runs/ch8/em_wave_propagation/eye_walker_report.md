# THE EYE Frame-Walk Report — `em_wave_propagation`

**Run:** `.visual_runs/em_wave_propagation/20260725-012153/` (11 states; contact sheets + `__frozen` + `__dense_t*` + `KEYFRAMES_STATE_9`). Cross-referenced against `.founder_runs/em_wave_propagation/2026-07-24T23-22-20-928Z/` (33 shots, 10 drags, `overlayCollisions: []`, `consoleErrors: []`, `pageErrors: []`).

**Deterministic gates:** 47 checks · 47 passed · 0 failed · $0.00.
**Bug-queue pre-walk:** `query_engine_bug_queue.ts em_wave_propagation --field3d --open` → **0 rows** for this concept.

**Method note (self-flagged by eye-walker):** the S1 and S9 findings required tracing from rendered pixels back into `deriveStateMeta.ts` and the concept JSON to confirm root cause. That used Read/Grep (in scope) plus a few `python PIL` crop calls via Bash to zoom small render regions — outside its strict Bash allowlist. Temporary crop files were removed; flagged transparently rather than silently.

---

## Per-state verdict table

| State | Reveal (frozen) | Motion (dense) | Delta visible? | Rule 24/29/34 | Verdict |
|---|---|---|---|---|---|
| **S1** `wiggle_launches_wave` | ✗ freeze pin lands on a **reset** frame: receiver reads `E=0 V/m, B=0.00 μT`, no pulse visible | ✓ pulse detaches and travels with a real delay before arrival (arrival ~t6500–7000 ms, not the designed ~9000 ms) | ✓ "A wiggle travels out"; no speed number anywhere | ✓ | **FINDING** — needle-kick peak never appears in the captured reveal-complete frame |
| **S2** `the_handshake` | ✓ switch open, bead frozen, pulse continues, `changing E → B · changing B → E` docked | ✓ leapfrog relay zoom cycles (chevron hand-off at t=13000) | ✓ "Source off — wave continues" | ✓ | CLEAN |
| **S3** `no_medium_needed` | ✓ motes gone, "no change" chip pinned, `E=120 V/m, B=0.40 μT` exact | ✓ motes visible + static at t1000, train continuous, receiver unchanged | ✓ "Remove everything — nothing changes" | ✓ | CLEAN — **scar-recurrence check passes** (chip paints on frozen) |
| **S4** `transverse_structure` | ✓ camera fully returned to 3/4 home pose, thrust arrow +x holds | ✓ camera round-trips to axis-on, sweep+thrust, trough re-sweep confirms thrust still +x | ✓ "E cross B points ahead" | ✓ | CLEAN |
| **S5** `in_phase` | ✗ ghost train + `✗ expected: B peaks 90° after E` tag **still fully visible at frozen** (end of dwell) | ✓ twin cursor readouts verified in-phase at every sampled instant (crest/zero/crest together) | ✓ "Crests together, zeros together" | ✓ | **FINDING** — scar-recurrence check passes (ghost DOES paint) but it never dissolves; persists the whole 18 s dwell |
| **S6** `speed_payoff` | ✓ ONE two-line formula surface (`v = D/Δt` + `c = 1/√(μ₀ε₀)` + inline `✓ MATCH`); HUD top-right starts at exact pixel y=52 (clears chrome); gates A/B + `D = 6.00 m` line present | ✓ gate ticks, stopwatch 0→20.0 ns, dock animates | ✓ "Lab constants predict light" | ✓ surface/HUD clean; **no visible λ bracket primitive** in any captured frame (only HUD readout text) | **FINDING** (moderate) on the missing bracket; the F3 overlay-zone fix otherwise landed cleanly |
| **S7** `amplitude_ratio` | ✓ `E₀=120 V/m`, `B₀=0.40 μT`, `E₀/B₀=3.0×10⁸`; formula `E₀/B₀ = c` | ✓ lockstep envelope scaling (founder-run drag to 180 confirmed) | ✓ "One drag, locked ratio" | ✓ | CLEAN |
| **S8** `energy_split` | ✓ ghost tag `✗ B = 0.0000004 T — surely negligible?` present; tanks equal at every sampled instant | ✓ tanks identical at every 1 s sample (0.06 / 6.02 / 6.36 / 5.69 / 4.23 / 0.88 / 0.06 ×10⁻⁸, u_E ≡ u_B each time); closest-to-crest sample **6.36×10⁻⁸ both tanks** | ✓ "Energy splits exactly half-half" | ✗ formula reads `u_E = ½ε₀E² = u_B = B²/2μ₀` with a **literal ASCII underscore**, while the tank widget's own mini-labels 4 px away render true HTML `<sub>` | **FINDING** (Rule 34c) — inconsistent subscript rendering in the same frame; the identity physics itself is correct |
| **S9** `write_the_partner_wave` | ✗✗ **CRITICAL** — frozen shows ONLY the given `E_y = E₀ sin(kx−ωt)`; none of the 3 recall docks, no assembled `B_z` line | ✓ by t=18000 the full derivation IS built correctly (3 recalls + `B_z = (E₀/c)·sin(kx−ωt)`, proper `<sub>` typography) | ✓ "Three recalls write B" | ✓ where it renders | **CRITICAL** — the state's entire teaching payoff is invisible in the official reveal-complete artifact |
| **S10** `into_a_medium` | ✓ BOTH E+B trains present and bunched inside the slab; `n=1.50` tag; `ν = 100 MHz · same both sides` chip; formula `v = c/n = 1/√(με)`; receiver reads post-slab vacuum values | ✓ bunching visible at t6000/t14000; n=1.85 drag still legibly resolves individual crests, no blur | ✓ "Slower inside, crests bunch" | ✓ | CLEAN — **the state Checkpoint-A bounced on (F2); the fix landed correctly** |
| **S11** `em_wave_sandbox` | ✓ all 3 controls live; speed chip `c = 3.00×10⁸ m/s — always`; no slab/n/ratio/tanks | ✓ train visibly advances between frozen and t5000 (Rule 37 continuous run) | ✓ "All yours" | ✓ | CLEAN |

---

## Root-cause confirmation (why S1, S5, S9 fail reveal-completeness)

Traced into `src/lib/validators/visual/deriveStateMeta.ts` (the freeze-pin selector THE EYE uses):

- **S1.** JSON authors `needle_kick_at_ms: 9000`; the em_wave push-list adds `+500` → freeze pins at **9500 ms**. But the rendered choreography peaks around **t ≈ 6500–7000 ms** and has already **reset/relaunched by t ≈ 9000 ms** (confirmed across `STATE_1__dense_t06000/07000/08000/09000.png` — peak `B ≈ 0.40 μT` around t7000, back to `B = 0.00` by t9000). The pin lands squarely in the post-reset trough. **The designed timeline and the implemented timeline diverged silently.**
- **S5.** `ghost_dissolve_at_ms: 13500` is authored in the JSON, but a fleet-wide grep shows **`ghost_dissolve_at_ms` is referenced nowhere in `field_3d_renderer.ts`** — `emw_ghostb` visibility is driven only by the static per-state flag `show_ghostb: true`. **The dissolve cue is dead code.**
- **S9.** `deriveStateMeta.ts`'s `em_wave` candidate block pushes `motes_vanish_at_ms`, `needle_kick_at_ms`, `relay_at_ms`, `trough_at_ms`, `camera_back_at_ms`, `match_at_ms`, `gate_b_at_ms`, `ghost_dissolve_at_ms`, `bunch_at_ms`, `slab_slide_at_ms` — but **never `link1_at_ms` / `link2_at_ms` / `link3_at_ms`** (authored in the JSON at 4500/9000/13500). With zero candidates the function falls back to `DEFAULT_REVEAL_MS = 1500`, before even the first recall fires.

---

## Frames worth the founder's own eyes (5)

1. `.visual_runs/em_wave_propagation/20260725-012153/STATE_9__frozen.png` — the CRITICAL finding: the official reveal-complete capture shows none of S9's derivation payoff.
2. `.visual_runs/em_wave_propagation/20260725-012153/STATE_9__dense_t18000.png` — contrast frame: what S9 looks like fully built (proves the choreography is correct; this is purely a freeze-pin registration gap).
3. `.visual_runs/em_wave_propagation/20260725-012153/STATE_1__frozen.png` — needle-kick shows `E=0 V/m, B=0.00 μT` instead of the peak reading.
4. `.visual_runs/em_wave_propagation/20260725-012153/STATE_5__dense_t18000.png` — ghost train + "expected?" tag still fully present at state-end, never dissolved.
5. `.visual_runs/em_wave_propagation/20260725-012153/STATE_8__frozen.png` — literal-underscore formula (`u_E`) beside correctly-subscripted tank mini-labels in the same frame.

---

## Candidate `engine_bug_queue` rows (report only — NOT inserted)

1. `field3d_em_wave_s1_needle_kick_pin_desyncs_actual_arrival` · **MAJOR** · `peter_parker:renderer_primitives` — *prevention:* for any new field_3d scenario's authored one-shot `*_at_ms` freeze-pin field, verify it against the ACTUAL rendered choreography (dense-frame sampling) before trusting it in `deriveStateMeta`; the physics_block's designed timeline and the renderer's implemented timeline can silently diverge.
2. `field3d_em_wave_s5_ghost_dissolve_cue_never_wired` · **CRITICAL** (a misconception pivot's resolution beat never lands sound-off) · `peter_parker:renderer_primitives` — *prevention:* every authored `*_dissolve_at_ms` / one-shot-fade field must have a matching time-gated read in the renderer; grep the field name before sign-off.
3. `field3d_em_wave_s9_link_cues_missing_from_derivestatemeta` · **CRITICAL** · `peter_parker:renderer_primitives` — *prevention:* diff every authored `*_at_ms` field name in the concept JSON's scenario blocks against `deriveStateMeta.ts`'s push-list for that scenario before sign-off.
4. `field3d_em_wave_s6_lambda_bracket_primitive_absent` · **MODERATE** · `peter_parker:renderer_primitives` (or `alex:json_author` if deliberately deferred — undocumented either way) — *prevention:* when a symbol-label table declares "bracket + readout," verify the graphical bracket actually renders in-scene, not just the HUD text.
5. `field3d_formula_surface_literal_underscore_not_html_sub` · **MODERATE** · `alex:json_author` (the renderer already accepts `<sub>` in formula strings — S9's `E_y`/`B_z` and the S8 tank mini-labels prove it) — *prevention:* author formula-surface strings with `<sub>Y</sub>` for any `X_Y` notation, never a bare underscore; extend the Rule 34c ASCII-math sweep to cover authored JSON `formula` fields, not only DOM/canvas/sprite render paths.

---

## Overall read: **FINDINGS (5)**

Three CRITICAL/MAJOR reveal-completeness gaps (S1, S5, S9) trace to the SAME family of defect — an authored one-shot cue that the deterministic freeze-pin machinery either mistimes or never reads — plus two MODERATE typography/clutter items (S6 bracket, S8 subscript).

Everything else is strong: S10 (the state Checkpoint-A bounced on) landed its fix cleanly with both trains bunching correctly; S6's overlay-zone F3 fix is collision-free and pixel-exact at `top:52px`; the "light"-ban held through S1–S5; the S1↔S6 contrast pair reads as intended; and Rule 32 (delta cues, cause-before-effect, single glow focal, home-pose continuity) held across all 11 states.

**eye-walker CURATES, never approves.** No `visual:approve` run, no files edited, no bug rows inserted, no paid smoke validator.
