# FOUNDER_PROXY — Checkpoint B (BUILD GATE) — `lc_oscillations` — fix cycle 0

## 1. Verdict: `FIX(engine)` — TWO BLOCKING + FOUR RIDE-ALONG engine findings. No authoring (alex:*) findings. No ESCALATE.

The build is substantially excellent — physics block rigorous (KVL → Convention B matching S8; live-sum boundary trap found, extending CpA F1; |i| display; every number node-verified), the E_total pin from CpA F1 **held** (6.36 J on every surface, zero seam on the total line, confirmed S5/S7/S9 HUDs), tsc/validator/console clean, S1/S2/S8 clean, free-circuit front door delivered as designed. But two blocking defects contradict a state's core claim on screen: **S7's entire lesson never renders** (scripted damping absent) and **the PRIMARY AHA's settled/frozen still shows the opposite of its caption** (off-phase pin). CpA F2 glow prediction **partially materialized** — bead/coil focal multiplier works, gauge-pane (S5) + inset (S6) focal channels have no brightness emphasis (ride-along). Every agent divergence resolved by opening the frames: eye-walker's observations were real, auditor missed/mis-attributed them — but eye-walker's *owner* on the S3 frozen-frame finding is wrong (deriveStateMeta pin, not json_author reveal_hold), corrected from source.

## 2. Per-state review table

| State | correct_YN | order_ok | labels | reads_sound_off | clearly_different | how_i_would_use | problem_or_missing | prio |
|---|---|---|---|---|---|---|---|---|
| S1 charge_the_plates | Y (V:0→10, E_C→6.36) | Y | Y | Y | Y | +/− glyphs pile on plates as V→10, tank fills to 6.36 J | Duplicate bottom-right formula echo (F3) | P3 |
| S2 throw_the_switch | Y (q/i/E trade) | Y | Y | Y | Y | Switch flips A→B, beads start with no source | Component seam 3.19+3.18=6.37 vs 6.36 (F6) | P2 |
| S3 empty_is_not_over **(PRIMARY AHA)** | LIVE Y / **FROZEN N** | Y | Y | **N** — settled shows q=−0.90 while caption "empty — current peaks" | Y | Pause at q=0 to show i=2.00 A — but settled lands q=−0.90/θ=225° | **BLOCKING: deriveStateMeta pin 2500ms not a crossing (F2)** | **P1** |
| S4 its_own_rhythm | Y (f₀=0.25, T₀=4.00) | Y | Top Y / bottom-right √→"V" **N** | Mostly | Y | 4.00 s crest-to-crest → f₀=0.25 Hz | Duplicate bottom-right √→"V" (F3) | P2 |
| S5 the_energy_slosh **(PIVOT #2)** | Y (antiphase, flat 6.36) | Y | Y | Y | Y | Green/violet bars trade under flat 6.36 J total | Bar-label collision garbles total (F4); 2.20+4.17=6.37 (F6); no glow differential on focal gauges (F5) | P2 |
| S6 a_block_on_a_spring | Y (analogy exact) | Y | Top ↔ Y / bottom-right dup | Y | Y | Compare q/i sine to spring-block swing | Duplicate formula (F3) + bar collision (F4) + inset no glow (F5) | P2 |
| S7 real_coils_leak | **N** — R=0.0 across 18s, decay+heat never render | Placement fine, content broken | (bar collision) | **N** — caption promises decay that never appears | **N** — near-identical to S6 undamped | Show swing decaying into heat; unusable on autoplay | **BLOCKING: scripted R ramp 0→2.0 absent (F1)** | **P1** |
| S8 the_shm_equation (advanced) | Y (derivation, clean Unicode) | Y | Y | Y | Y | Walk KVL→SHM→ω₀ vs live motion | None — clean | — |
| S9 lc_sandbox (explore) | Y (sliders live; R-drag drives decay — resolved; motionProbe≠equal) | Y (explore-last) | Core-only Y / duplicate occluded by slider panel | Y | Y | Drag L/C to move f₀, R to bring decay back | Inherits F3 (occluded) + F4; V₀ gated-on-rethrow = founder hand-test | P2 |

## 3. Findings — adjudicated, each probed against the frames

**F1 — S7 damping never engages [BLOCKING] [FIX(engine): peter_parker:renderer_primitives]**
"State 7's whole reason to exist — real coils leak, the swing dies into heat — never happens when you press play." `STATE_7__dense_t18000.png` @18000ms: `E_R=0.00 J`, `R:0.0 Ω`, full-amplitude undamped; subtitle says "watch its dial climb from zero to two ohms" while the thumb sits at 0. **Damping engine correct** — `S7_lco_R_slider_after.png` (drive dragged R→8.5) shows clean decay, `E_R=6.36 J`, ledger `0.00+0.00+6.36=6.36` (also resolves eye-walker's S9 "does R-drag drive decay?" → **yes**). Source: no scripted 0→2.0 ramp exists (`:30524/:30590/drag`); `:30303 alpha=R/2L` with `R=PM_lcoR=0`. **Fix + after-proof:** ramp effective R 0→2.0 Ω over `[r_insert_start_at_ms=0, +R_insert_deltaT=500ms]`, feed `PM_lcoR`, drive `syncThumb("R", rampedR, 1)` lockstep. After-proof: dense t=3000/6000/9000ms — amplitude shrinks in-envelope, `E_R` climbs monotonically to 6.36 (E_C+E_B+E_R=6.36), R thumb+label read 2.0. Target 2.0/dur 0.5s in physics block; json_author adds `r_insert_target: 2.0` only if renderer needs it from config.

**F2 — S3 PRIMARY-AHA settled/frozen off-phase [BLOCKING] [FIX(engine): peter_parker:renderer_primitives — deriveStateMeta.ts:1467]** (eye-walker symptom RIGHT, owner WRONG — corrected)
`STATE_3__frozen.png` shows `q=−0.90 C, i=1.41 A` under caption "Empty — current peaks"; crossing renders correctly live (`_dense_t01000/t03000`: q=0.00/i=2.00 unsigned). **Owner correction:** no authored reveal_hold; `deriveStateMeta.ts:1467` computes the `through_zero` pin as `flip_at_ms+1500 = 1000+1500 = 2500ms` = θ=225° = q=−0.90 (same class as slcr `reveal_hold_captures_transitional_r_family`), **peter_parker** not json_author. **Fix:** crossing is a recurring instantaneous event (θ=90°/270° at t=1000/3000ms) — pin ON a crossing: `strike_at_ms+2000 = 3000ms` (θ=270°, q=0.00/i=2.00, plates reversed, ghost struck). After-proof: `STATE_3__frozen` shows q=0.00/i=2.00, chip struck. Also verify the live-player Rule-37 timeline-end freeze lands on a crossing — if S3 `duration` doesn't, align to odd multiple of T₀/4 (json_author, only if live freeze off-phase).

**F3 — Duplicate bottom-right formula echo; √→"V" (S4), occluded (S9) [RIDE-ALONG, high-priority] [FIX(engine): peter_parker:renderer_primitives]** (eye-walker RIGHT, auditor WRONG)
`STATE_4__frozen`: top-right authored `lco_formula` `f₀=1/(2π√(LC))` correct (Cambria √), but a bottom-right echo renders `1/(2πV(LC))` (√ as bare "V" — 34c broken glyph, reads as a wrong formula sound-off). `STATE_9__frozen`: echo occluded behind slider panel (34d). `STATE_6__frozen`: duplicate correspondence line (34b). Auditor's "ONE Unicode formula surface/state ✓" refuted. **Fix:** remove the unauthored bottom-right echo entirely (top-right authored panel is the ONE surface — resolves 34b+34c+34d). Ride-along (correct formula present top-right).

**F4 — Energy-bar total-label ↔ last-bar-label collision [RIDE-ALONG] [FIX(engine): peter_parker:renderer_primitives]** (both agents agree)
`STATE_5__frozen`: E_B bar value label + `6.36 J` total-marker collide into "4636 J"; recurs S6/S7/S9. Canvas-internal → drive's `overlayCollisions:[]` blind (DOM-only). **Fix:** offset the total-marker label from the rightmost-bar value label in 2-bar (S5/S6) + 3-bar (S7/S9).

**F5 — Gauge/inset focal glow no-op (CpA F2 materialized) [RIDE-ALONG] [FIX(engine): peter_parker:renderer_primitives]** (eye-walker RIGHT; auditor cited wrong element)
Across `STATE_5/6/9__frozen`: E_C/E_B/E_R bars + mass-spring inset are solid identity-color fills, no brightness differential — height/marker only. Auditor's "works" (`:30882 beadFocal?1.4:1.0`) is the **bead/coil** focal, not gauge/inset — the split CpA F2 predicted. **Fix (taste nuance):** apply the focal boost at the **pane level** (whole gauge pane / inset brightens as focal, peers dim), **not** per-dominant-bar (brightening the taller bar of an antiphase trade misleads by implying one store matters more). Ride-along.

**F6 — Component-addend rounding seam vs pinned total [RIDE-ALONG, highest-priority ride-along] [FIX(engine): peter_parker:renderer_primitives]** (eye-walker RIGHT; auditor's "no seam on total" also true)
`STATE_5__frozen` HUD `E_C=2.20, E_B=4.17, E_total=6.36` (2.20+4.17=6.37); S9 `0.40+5.97=6.37`; S2 `3.19+3.18=6.37`. **Total correctly pinned to 6.36** (CpA F1 held); residual is the two independently-rounded components sum one half-LSB high, on PIVOT #2 whose lesson is "the numbers add up perfectly." **Fix:** display last component as `(pinned_total − Σ already-rounded others)` (same discipline as slcr `struck_sum_rounds_full_not_displayed_addends`). Highest-priority ride-along — on the conservation pivot, chapter has ratcheted this twice.

**No authoring findings.** FLAG 1 (sign→Convention B) + FLAG 2 (live-sum boundary→pin total) both correctly resolved, build honored them. No physics doubt → no ESCALATE.

## 4. engine_queue — §3b dispatch bundle (owner: peter_parker:renderer_primitives; field3d-surgeon)

| # | tag | file(s) | fix | after-proof |
|---|---|---|---|---|
| F1 | **BLOCKING** | field_3d_renderer.ts (`updateLcOscFrame`/`lcoQI` damped, ~30303/30590/30829) | scripted R ramp 0→2.0 over [0,500ms] → PM_lcoR + `syncThumb("R",…,1)` lockstep | S7 dense t=3000/6000/9000: amplitude shrinks in-envelope, E_R→6.36 monotonic (E_C+E_B+E_R=6.36), R thumb+label read 2.0 |
| F2 | **BLOCKING** | deriveStateMeta.ts:1467 | `through_zero` pin `flip_at_ms+1500` → `strike_at_ms+2000`=3000ms/θ=270° | STATE_3__frozen shows q=0.00/i=2.00, ghost chip struck; live settled frame on a crossing |
| F3 | ride-along | field_3d_renderer.ts (bottom-right formula echo draw) | remove the unauthored bottom-right echo (keep top-right `lco_formula`) | S4/S6/S9 frozen: exactly ONE formula surface, no √→"V", no occlusion |
| F4 | ride-along | field_3d_renderer.ts (gauge-pane label draw) | offset total-marker label from rightmost-bar value label (2-bar + 3-bar) | S5/S6/S7/S9 frozen: total J label legible, no garble |
| F5 | ride-along | field_3d_renderer.ts (`applyLcOscGlow`/gauge+inset channels) | pane-level focal multiplier on gauge pane (S5) + inset (S6); peers dim; NOT per-dominant-bar | focal vs non-focal frame: brightness delta on focal pane, none between trading bars |
| F6 | ride-along | field_3d_renderer.ts (energy HUD/gauge label compose) | last component = pinned_total − Σ rounded others | S5/S9 HUD: displayed components sum exactly to 6.36 |

Loop dispatches under §3b; the two BLOCKING must land + pass after-proofs; re-review **S3 + S7 only**. Four ride-alongs strongly recommended in the same pass (bundling free).

## 6. Founder hand-test items (post-fix, not blocking)
- **S5 half-split chip** (`3.18+3.18=6.36`, `:30755`, ~500ms): sub-second flash fell between capture frames — confirm live it's legible (consider persisting longer; PIVOT #2's on-canvas proof).
- **S9 V₀ gated-on-rethrow** (N1): thumb drags 10→18, but the "amplitude changes only on re-throw + pending-charge indicator" needs a live throw-to-A-then-B check.
- **DB (deferred to founder, trial):** auditor's `concept_panel_config` row (default_panel_count=1) + `field3d_particle_field_vestigial_dual_panel_config_gap` advisory — DB writes stay files under the trial.

## 7. ≤5 key frames
1. `.visual_runs/lc_oscillations/20260724-142012/STATE_7__dense_t18000.png` — S7 undamped @18s (F1).
2. `.founder_runs/lc_oscillations/2026-07-24T12-48-54-210Z/S7_lco_R_slider_after.png` — manual R→8.5 gives clean decay (engine correct, ramp missing).
3. `.visual_runs/lc_oscillations/20260724-142012/STATE_3__frozen.png` — PRIMARY AHA settled q=−0.90 vs caption (F2).
4. `.visual_runs/lc_oscillations/20260724-142012/STATE_4__frozen.png` — duplicate bottom-right √→"V" (F3).
5. `.visual_runs/lc_oscillations/20260724-142012/STATE_5__frozen.png` — bar collision + 2.20+4.17=6.37 + no gauge glow (F4/F6/F5).

**Verdict: FIX(engine).** Re-review: S7 (F1) + S3 (F2) blocking must land + pass after-proofs before APPROVE; F3–F6 ride-along same dispatch. No authoring routing, no ESCALATE. Fix cycle 0 of max 3.
