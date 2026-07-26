# eye-walker report — `ac_voltage_capacitor` (Ch.7 #3)

Frame dump: `.visual_runs/ac_voltage_capacitor/20260723-141651/`
Design contract: `skeleton.md` §3 + `physics_block.md` §1–3. Engine bug queue: 0 rows for `ac_voltage_capacitor --field3d --open`.

## Deterministic gate summary (verbatim)

```
📊 39 deterministic checks · 39 passed · 0 failed · $0.00
```

## Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| S1 `capacitor_joins_the_circuit` | ✓ | ✓ | ✓ | ✓ | scope shows both v & i from t=0 (fleet convention, matches both sealed siblings — not a defect) |
| S2 `current_leads_quarter_cycle` | ✓ | ✓ | ✓ | ✓ | ghost is exact mathematical inversion of real trace (confirmed); lead-bracket arrow correctly forward-in-time |
| S3 `plates_fill_and_push_back` | ✓ | ✓ | ✓ | ✓ | q=Cv · v_C=v hold exactly at every sampled instant; beads never cross gap |
| S4 `current_copies_the_slope` | ✗ | ✓ | ✓ | ✓ | **CRITICAL — tangent-stop caption contradicts its own concurrent HUD numbers (Finding 1)** |
| S5 `reactance_falls_with_frequency` | ✓ | ✓ | ✓ | ✓ | X_C/subscript compose clean; 4-leg ramp runs both directions by design (not re-filing prior refuted finding) |
| S6 `power_swings_both_ways` | ✓ | ✓ | ✓ | ✓ | storing/returning label correctly tracks live p sign (unlike S4's stops) |
| S7 `nothing_consumed` | ✓ | ✓ | ✓ | ✓ | ⟨p⟩ meter held at exactly 0.00 W; plates RGB-sampled cold in every state (no warm tint anywhere) |
| S8 `one_derivative_both_results` | ✓ | ✓ | ✓ | ✓ | apparatus correctly dimmed (reveal_hold); all Unicode (π, ω, subscripts) clean, no ASCII math |
| S9 `ac_capacitor_sandbox` | ✓ | ✓ | ✓ | ✓ | **MODERATE — HUD shows only v, i; iₘ (authored in §3) absent (Finding 2). p/X_C/q/U correctly absent (38b/F3 intact)** |

## Findings

**Finding 1 — CRITICAL — S4 (PRIMARY AHA) tangent-stop captions visibly contradict their own concurrently-displayed HUD numbers.**

Root-cause evidence: sampling HUD `v`/`i` (and `q`, `p`) at each state's nominal `dense_t00000` across S1/S2/S3/S6/S9 shows the underlying phase `θ` is **not zeroed at state entry** — each state exhibits a different, unpredictable residual offset (S1≈+183°, S2≈+157°, S3≈+49°, S6≈−33°; no common constant, no monotonic accumulation across states). This does **not** break the mechanism's internal consistency (`i = C·dv/dt`, `v_C = v`, `p = v·i` all hold exactly at every sampled instant; the S2 ghost is mathematically guaranteed to stay the exact inversion of the real trace regardless of the offset — confirmed visually; `⟨p⟩` correctly holds 0.00 W). But it directly breaks S4's three cue-gated tangent stops, whose caption text is evidently triggered on a fixed wall-clock schedule while the numbers are computed from the offset-affected live `θ`:

- `STATE_4__dense_t03000.png`: caption "steepest climb → i peak" while HUD reads `v = -7.8 V`, `i = +1.24 A` (nowhere near a zero-crossing or peak).
- `STATE_4__dense_t08000.png` / `STATE_4__frozen.png`: caption "steepest fall → i trough" while HUD reads `v = +6.2..+9.1 V`, `i = +0.83..+1.57 A` (**positive** — the opposite of a trough).

A teacher would see the PRIMARY AHA's own claimed proof-numbers contradict its label, in the one state built to make `i = C × slope` visually undeniable. Contrast: S6's dynamic "storing/returning" label correctly tracks the live (offset-affected) `p` sign at every sample checked — proving the renderer *can* caption correctly from live values; S4's stop mechanism apparently does not.

**Finding 2 — MODERATE — S9 explore HUD is missing `iₘ`.**

`STATE_9__frozen.png` HUD shows only `v = +10.0 V` / `i = -0.10 A`. §3's table explicitly specs "HUD (v, i, iₘ) tracks" for S9. The Rule 38b/F3 ring-gate is otherwise working correctly — no `p`, `X_C`, `q`, or `U` leaked — this is a content gap against the authored spec, not a ring violation.

## Checked clean (no finding)

X_C/v_C/q_max styled-subscript compose routine (HUD, formula panel — zoomed pixel-level, all three text instances render a proper small lowered "C"/"max", zero literal underscores or side-by-side glyphs); beads/charge glyphs never cross the plate gap in any zoomed frame; plates RGB-sampled cold blue-gray `(~99–121, ~119–145, ~129–157)` in every state, no warm/orange channel dominance anywhere; overlay placement — HUD box top edge measured at exactly `y=52px` (matches the `top:52px+` chrome-clearance convention); no ASCII math (`Phi`/`omega`/`->`/`deg`/`pi`) in any rendered text field (only in internal, non-rendered `computed_outputs` JS formula strings); S5's 4-leg ramp correctly runs both directions (not re-filing the prior refuted finding); glow_focal reads as a single element per state in every frame checked.

## Frames for founder eyes

1. `.visual_runs\ac_voltage_capacitor\20260723-141651\STATE_4__frozen.png` — H2 baseline showing caption "steepest fall → i trough" beside `i = +0.83 A` (positive, not a trough) — primary CRITICAL evidence.
2. `.visual_runs\ac_voltage_capacitor\20260723-141651\STATE_4__dense_t03000.png` — second instance, caption "steepest climb → i peak" beside `v = -7.8 V, i = +1.24 A`.
3. `.visual_runs\ac_voltage_capacitor\20260723-141651\STATE_1__dense_t01000.png` — supporting evidence of the claimed underlying root cause: `v = -10.0 V` at nominal state-local t=1.0s, where the design requires `v = +10.0 V` (the crest).
4. `.visual_runs\ac_voltage_capacitor\20260723-141651\STATE_9__frozen.png` — MODERATE finding, HUD shows only v/i, no iₘ.

## Candidate engine_bug_queue rows (SQL TEXT ONLY — no DB writes, trial branch)

```sql
-- Finding 1 (CRITICAL)
INSERT INTO engine_bug_queue (bug_class, severity, owner_cluster, status, prevention_rule, concept_id, notes)
VALUES (
  'field3d_cue_scripted_caption_desynced_from_unreset_state_entry_theta',
  'CRITICAL',
  'peter_parker:renderer_primitives',
  'OPEN',
  'On every state entry, the live oscillation phase (theta) must be explicitly reset to its authored zero (theta = omega * t_local, t_local = 0 at STATE_REACHED) before any cue-gated caption/stop schedule is armed; a caption/label keyed to a fixed wall-clock cue offset must never assert a specific physical condition (e.g. "i peak", "steepest climb") without re-deriving it from the SAME live theta the HUD numbers use, or re-verifying the assumed theta at fire time. Verify via re-pin-to-earlier-timestamp-after-later-one test (same class as field3d_dt_accumulated_motion_invisible_to_eye_timepin).',
  'ac_voltage_capacitor',
  'Confirmed via HUD sampling at nominal state-local t=0 across S1/S2/S3/S6/S9: theta offset varies per state (~183°, ~157°, ~49°, ~-33°), not zero, not constant, not monotonic. Internal physics relations (i=C dv/dt, v_C=v, p=v*i, ghost-mirror invariance) all remain exact regardless of the offset, so most states are visually unaffected -- but S4''s three cue-gated tangent-stop captions (a fixed schedule) visibly contradict the concurrently-displayed v/i HUD at t=3000ms and t=8000ms/frozen. Worth checking whether the sealed siblings (ac_voltage_resistor, ac_voltage_inductor) carry the same latent offset in their own cue-scripted reveals -- a single spot-check on the inductor''s frozen frame showed a similar non-zero residual phase, unconfirmed at depth.'
);

-- Finding 2 (MODERATE)
INSERT INTO engine_bug_queue (bug_class, severity, owner_cluster, status, prevention_rule, concept_id, notes)
VALUES (
  'field3d_explore_core_hud_missing_authored_quantity',
  'MODERATE',
  'ambiguous',
  'OPEN',
  'When a concept authors a specific core-ring HUD quantity list for its explore state (e.g. "v, i, i_m"), the engine''s explore-state HUD renderer must surface every named quantity, not just a subset -- cross-check the rendered HUD field count against the architect §3 control-table HUD spec at Gate 8.',
  'ac_voltage_capacitor',
  'S9 (ac_capacitor_sandbox) HUD renders only v and i; i_m is absent despite being explicitly named in skeleton.md §3 ("HUD (v, i, i_m) tracks"). Correctly does NOT leak p/X_C/q/U (38b/F3 gate intact) -- this is a narrower-than-authored ring, not a ring violation, hence MODERATE not CRITICAL.'
);
```

## Overall read

**FINDINGS (2)** — 1 CRITICAL (S4, PRIMARY AHA caption/number desync), 1 MODERATE (S9 missing `iₘ`). Everything else checked (subscript compose, gap-crossing, plate-cold discipline, ghost inversion/bracket direction, overlay collision, ASCII-math sweep, S5 ramp direction) is clean. Routing candidates above are reports only — main session/founder decides FAIL-routing and any `engine_bug_queue` insert.

> **Curation note (eye-walker never approves):** these are reports for founder-proxy Checkpoint B to adjudicate against the actual frames, not verdicts.
