# PHYSICS BLOCK — `wheatstone_bridge`

*(companion to `wheatstone_bridge-architect.md`; json_author reads BOTH files. Design/arc are LOCKED — this block adds rigor/declarations/timelines/constraints only.)*

## 0. Engine bug queue consultation (ran live before authoring)

- `wheatstone_bridge`, `kirchhoff_junction_rule_KCL`, `kirchhoff_loop_rule_KVL`, `combination_of_resistors` — **zero** concept-specific rows.
- `--owner peter_parker:runtime_generation` → **`default_variables_only_first_var_merged`** (CRITICAL/FIXED). Prevention: **every** declared variable (P, Q, R, S, emf) carries an explicit `default` in §1.
- `--owner alex:physics_author` → `teach_reveal_synced_to_narration`, `teach_show_quantity_live_when_named` (V_B/V_D/ratio HUD/needle reveal live on the sentence that first names them — §4), `teach_color_each_element_by_its_own_sign` (N/A — no signed charges).
- `--owner alex:json_author` → `aha_statement_exceeds_15_words` (aha statement below is 14 words), `guided_state_overruns_pacing_target` / `field3d_state_duration_field_clamps_eye_capture_window` (size `duration` off the FULL choreography window — §4), `label_occluded_and_offcanvas_circuit` (ac_generator scar — this dense diamond+needle+2 readouts+ratio-HUD+formula layout needs a frozen-frame occlusion check — §6).

## 1. Verified numbers (node-checked — no deviation from architect/spec)

| Quantity | Formula | S1 (R=3) | S2 (R=6) | S3 end (R=3) | S4 start (ε=3) | S4 end (ε=10) |
|---|---|---|---|---|---|---|
| V_B | ε·Q/(P+Q) | 4.0 V | 4.0 V | 4.0 V | 2.0 V | 6.667 V |
| V_D | ε·S/(R+S) | 4.0 V | 3.0 V | 4.0 V | 2.0 V | 6.667 V |
| V_D − V_B | — | 0 | **−1.0 V** | 0 | 0 | 0 |
| i₁ (P→Q path) | ε/(P+Q) | 0.2 A | 0.2 A | 0.2 A | 0.1 A | 0.333 A |
| i₂ (R→S path) | ε/(R+S) | 0.667 A | 0.5 A | 0.667 A | 0.333 A | 1.111 A |
| P/Q vs R/S | — | 0.5 = 0.5 ✓ | 0.5 vs 1.0 ✗ | 0.5 = 0.5 ✓ | 0.5 = 0.5 ✓ | 0.5 = 0.5 ✓ |
| S = R·(Q/P) | — | 6 Ω | — | **6 Ω ✓** | — | 6 Ω (ε-independent) |

(2/3)ε invariant exact at every ε (verified ε=3,6,10 → 2.0/4.0/6.667). Assessment stem (P=100Ω,Q=10Ω,R=153Ω) → S = 15.3 Ω, confirmed.

**Rigor point (physics_author addition):** i_g = 0 **at balance is EXACT for ANY galvanometer resistance** — V_B=V_D means zero PD across whatever sits between B and D, so Ohm's law forces zero current regardless of its value. The high-R idealization is only load-bearing **away from balance**, where it lets us use the simple open-circuit divider formulas for i₁/i₂ instead of a full network solve. This governs what is labeled `i_g = 0` vs left unlabeled — §4/§5.

## 2. `physics_engine_config` (documentation for json_author — particle_field computes natively, per KCL/KVL precedent)

```json
{
  "physics_engine_config": {
    "variables": {
      "P": { "name": "Ratio arm P (upper-left, A–B)", "unit": "Ω", "min": 5, "max": 30, "default": 10,
        "role": "FIXED 10Ω on all guided states S1–S4 (the ratio arms establish the 1:2 asymmetry deliberately); live slider ONLY in S5 explore" },
      "Q": { "name": "Ratio arm Q (upper-right, B–C)", "unit": "Ω", "min": 5, "max": 30, "default": 20,
        "role": "FIXED 20Ω on all guided states S1–S4; live slider ONLY in S5 explore" },
      "R": { "name": "Known variable arm (lower-left, A–D)", "unit": "Ω", "min": 1, "max": 20, "step": 1, "default": 3,
        "role": "the ONE taught control on S2/S3 — S1 entry 3 (balanced home pose), S2 lands 6 (post-nudge, live), S3 entry 6 → sweep to 3 (post-reveal live), S4 fixed 3 (background), live S5. Range [1,20] matches KCL/KVL R1/R2/R3 sibling convention + S5 headroom; both integer stops (3, 6) on-grid" },
      "S": { "name": "Unknown arm (lower-right, D–C)", "unit": "Ω", "min": 2, "max": 12, "default": 6,
        "role": "FIXED 6Ω on all guided states S1–S4 (the thing R's balance recovers); live slider ONLY in S5 explore" },
      "emf": { "name": "Cell EMF (ideal, ε)", "unit": "V", "min": 3, "max": 10, "step": 0.5, "default": 6,
        "role": "locked 6V on S1–S3; the ONE taught control on S4 (entry 3 → sweep to 10, post-reveal live); live S5. Engine key 'emf' (physics symbol ε), matches KVL sibling naming; emf IS a slider from S4 on → declared min/max/default like KVL's emf, NOT KCL's permanently-locked `constant`" },
      "VB": { "name": "Potential at node B (top midpoint)", "unit": "V", "derived": "emf * Q / (P + Q)", "role": "live readout, first shown S2" },
      "VD": { "name": "Potential at node D (bottom midpoint)", "unit": "V", "derived": "emf * S / (R + S)", "role": "live readout, first shown S2" },
      "i1": { "name": "Upper-path current (P then Q)", "unit": "A", "derived": "emf / (P + Q)", "role": "arm-bead-density driver; INVARIANT 0.2A across S1–S3 (depends only on P,Q,emf) — deliberate, do not 'fix'" },
      "i2": { "name": "Lower-path current (R then S)", "unit": "A", "derived": "emf / (R + S)", "role": "arm-bead-density driver; the ONLY current that responds to R in S2/S3" },
      "ratio_gap": { "name": "Balance-ratio mismatch", "unit": "dimensionless", "derived": "(P/Q) - (R/S)", "role": "drives ratio HUD ✓/✗ — compared against RATIO_TOL, never strict equality (see §2 constraint)" },
      "needle_deg": { "name": "Galvanometer needle angle", "unit": "degrees", "derived": "clamp(K_NEEDLE * (VD - VB), -NEEDLE_MAX_DEG, +NEEDLE_MAX_DEG)", "role": "live tracking indicator (33d); calibration K_NEEDLE=25 °/V, NEEDLE_MAX_DEG=60°; checkpoints: S2 (VD-VB=-1V)→-25°, S3-end/S4 (0V)→0° dead centre. K/MAX renderer-tunable if checkpoints hold" }
    },
    "formulas": {
      "VB": "emf * Q / (P + Q)",
      "VD": "emf * S / (R + S)",
      "balance_condition": "P/Q === R/S  <=>  VB === VD  <=>  i_g = 0 (exact, for ANY galvanometer resistance — §4)",
      "S_unknown": "R * (Q / P)   — surfaced at S4; contains no emf term by construction",
      "i1": "emf / (P + Q)",
      "i2": "emf / (R + S)",
      "needle_deg": "clamp(25 * (VD - VB), -60, 60)   — suggested calibration, tunable; checkpoints above"
    },
    "constraints": [
      "current_through_galvanometer_zero_at_balance — i_g = 0 EXACTLY at P/Q = R/S, true for ANY finite galvanometer resistance (not merely the high-R idealization)",
      "bridge_arms_show_ratios — balance is a RATIO match (P/Q = R/S), never all four equal; P=10Ω ≠ Q=20Ω deliberate (cluster balance_needs_equal_resistors)",
      "both_arms_flow_always — i1, i2 > 0 in EVERY state including balance; only the BRIDGE-WIRE current is ever zero",
      "needle_centre_zero — needle_deg = 0 is the visual null; dial is centre-zero",
      "balance_is_emf_independent — VB = VD = (2/3)·emf at EVERY emf (P=10,Q=20,R=3,S=6); S = R·(Q/P) has no emf term",
      "no_region_dependent_constant_asserted — emf is a slider (Rule 35)",
      "i1_invariant_S1_to_S3 — i1 = 0.2A identically on S1/S2/S3 — DELIBERATE",
      "ratio_hud_needs_tolerance — ✓/✗ MUST use |P/Q − R/S| < RATIO_TOL (0.01), never strict equality; guided combos satisfy equality exactly, S5 explore needs the tolerance",
      "explore_null_not_always_reachable — R integer-stepped [1,20]; for arbitrary S5 P,Q,S the exact null R=S·(Q/P) may fall off-grid — EXPECTED honest sandbox behavior (real decade boxes too), never a forced false ✓",
      "no_divide_by_zero — P,Q,R,S floors keep P+Q, R+S, Q/P, S/R finite/nonzero"
    ]
  }
}
```

## 3. Per-state `variable_overrides` (Rule 25d)

- **S1** `{P:10, Q:20, R:3, S:6, emf:6}` — balanced home pose; i_g = 0 uncommented/unlabeled (nothing pre-spoiled).
- **S2** `{P:10, Q:20, R:3, S:6, emf:6}` entry → cue nudges R 3→6Ω within-state (§4); holds `R:6`. R live only AFTER nudge.
- **S3** `{P:10, Q:20, R:6, S:6, emf:6}` entry → cue sweeps R 6→3Ω in **1400 ms** (< 1500 `DEFAULT_REVEAL_MS`); holds `R:3` (balanced). R live only after sweep.
- **S4** `{P:10, Q:20, R:3, S:6, emf:3}` entry (fresh snap to low end) → cue sweeps emf 3→10V in ~1400 ms; holds `emf:10`. emf live only after sweep.
- **S5** none — schema defaults (`P:10, Q:20, R:3, S:6, emf:6`); all five sliders live via `show_sliders: true`.

## 4. Within-state motion timeline (Rule 31/32 — pure fn of state clock, cause-before-effect)

| State | t-window | What animates | Driven by | Live controls |
|---|---|---|---|---|
| **S1** | 0–800 ms | beads already circulating both divider paths (split at A, recombine at C) — moves from t=0 | position/phase(t) | none |
| S1 | 800–2200 ms | node dots A/B/C/D + arm boxes label in; `junction` glow on node A from ~600 ms | — | none |
| S1 | 2200 ms+ | continuous loop for ~14 s dwell (galvanometer quiet, R=3 balanced, i_g=0 uncommented) | — | none |
| **S2** | 0–900 ms | home-pose hold (R=3, needle 0°, no readouts) | — | none |
| S2 | 900–1700 ms | **CAUSE**: R box glides 3→6 Ω | R(t) | none |
| S2 | 1700–2500 ms | readable beat (Rule 32a gap) | — | none |
| S2 | 2500–3400 ms | **EFFECT**: V_B=4.0V / V_D=3.0V node readouts compose | VB, VD | none |
| S2 | 3400–4400 ms | bridge-wire beads appear, flow B→D (V_B>V_D) | sign(VB−VD) | none |
| S2 | 4400–5400 ms | needle swings 0°→−25° | needle_deg(t) | none |
| S2 | 5400–6200 ms | ratio HUD composes "P/Q = 0.5 vs R/S = 1.0 ✗" | ratio_gap | none |
| S2 | 6200 ms+ | hold to ~15 s; **R slider live** | — | R |
| **S3** | 0–900 ms | home-pose hold (R=6, needle −25°, bridge beads flowing, HUD ✗) | — | none |
| S3 | 900–2300 ms | **CAUSE**: sweep R 6→3 Ω, **1400 ms** (<1500); V_D climbs 3→4V; bridge beads thin; needle sweeps −25°→0°; i1 flat 0.2A, i2 rises 0.5→0.667A | R(t) | none |
| S3 | 2300–2600 ms | needle **settles dead 0° and stops**; bridge beads reach none — PRIMARY aha (beat #1: arms flow while bridge empties) | — | none |
| S3 | 2600–3400 ms | ratio HUD ✗→✓ ("0.5 = 0.5 ✓") | ratio_gap | none |
| S3 | 3400 ms+ | hold to ~18 s; **R slider live** | — | R |
| **S4** | 0–900 ms | home-pose hold at entry emf=3V (R=3, needle 0°, i1=0.1A, i2=0.333A, VB=VD=2.0V) | — | none |
| S4 | 900–2300 ms | **CAUSE**: emf glides 3→10V, **1400 ms**; both arm streams speed up (i1 0.1→0.333A, i2 0.333→1.111A); V_B, V_D climb LOCKSTEP (2.0→6.667V, identical); needle pinned 0° (beat #2: zero motion) | emf(t) | none |
| S4 | 2300–3100 ms | readable hold at emf=10V | — | none |
| S4 | 3100–4100 ms | formula composes "S = R·(Q/P) = 3·(20/10) = 6 Ω" — no emf term | — | none |
| S4 | 4100 ms+ | hold to ~16 s; **emf slider live** | — | emf |
| **S5** | open, continuous, never auto-freezes (Rule 37) | needle/VB/VD/ratio HUD/bead densities track continuously | all 5 formulas | P, Q, R, S, emf (`show_sliders:true`) |

**advance_mode:** `manual_click` ×4 guided + `interaction_complete` explore (Gate 12 ≥2 distinct).

**Duration-sizing flag:** size each state's `duration` off the FULL dwell (choreography-completion + narration + hold buffer), never word-count. Author `duration: 14 / 15 / 18 / 16` s for S1–S4, `0`/open for S5.

## 5. Formula/HUD surfaces (Rule 34 — ONE math-serif Unicode formula surface per state)

| State | `formula_overlay` | Zone |
|---|---|---|
| S1 | *(none)* | — |
| S2 | `i_g ∝ V_D − V_B` | formula surface |
| S3 | `P/Q = R/S ⇒ i_g = 0` | formula surface |
| S4 | `S = R·(Q/P)` (→ `= 6 Ω`, no emf) | formula surface |
| S5 | `P/Q = R/S` | formula surface |

Separate value-only zones (never collide, Rule 34b/d): V_B/V_D readouts (S2+), ratio HUD `P/Q = 0.50 vs R/S = 1.00 ✗`→`✓` (S2+), `i_g = 0` label **only at balance (S3)**. All Unicode (`Ω · ⇒ ✗ ✓ −`), DOM + canvas paths (no 3D sprite path in particle_field).

**Idealization + exact-vs-approximate boundary (load-bearing):**
- **At balance:** i_g = 0 is **exact** for *any* galvanometer resistance → `i_g = 0` may be printed as a hard numeric claim at S3.
- **Away from balance (S2):** open-circuit divider formulas for i1/i2 are exact only in the high-G limit (standard idealization). The true unbalanced bridge-wire current needs a full network solve — **deferred** to the drill-down candidate. **Constraint: never print a fabricated precise `i_g = 0.0xx A` at S2** — the needle + bead flow carry the imbalance story, no invented amperage.

## 6. Physical constraints — see §2 `constraints` (10 assertions) + §4/§5 idealization boundary.

**Build-verification flag (`label_occluded_and_offcanvas_circuit`, ac_generator scar):** densest `combination_of_resistors`-family layout yet — 4 arm boxes + 4 node dots + galvanometer dial + 2 node readouts + ratio HUD + formula surface, single frame, no split canvas. json_author/quality_auditor: verify via THE EYE frozen frame that every label clears the canvas edge and none overlap (Rule 34d corner reservation), especially S2/S3.

## 7. Drill-down cluster trigger phrases (migration file only — N/A-DORMANT this phase)

**no_current_anywhere_at_balance:** "balanced means the whole circuit is off right" / "if the needle reads zero doesnt that mean no current is flowing anywhere" / "why do the arms still show current when the bridge is balanced" / "shouldnt everything stop when its balanced" / "zero on the galvanometer so the whole bridge has zero current too"

**balance_needs_equal_resistors:** "the bridge only balances when all four resistors are equal right" / "how can it balance when P and Q are different values" / "isnt a balanced bridge just four equal resistors" / "why does it null out even though ten and twenty ohms arent the same" / "i thought balance meant every arm has the same resistance"

**battery_voltage_needed_for_measurement:** "dont i need to know the battery voltage to find the unknown resistor" / "how can you get S without measuring any current" / "shouldnt changing the battery change the answer for S" / "you must need a voltmeter reading to work out the unknown right" / "why doesnt epsilon show up anywhere in the S formula"

## 8. Board mark scheme — N/A (Rule 20 dormant, conceptual-only). `epic_l_path` + `particle_field_config` ONLY, no `mode_overrides`.

## Proposed `aha_moment` (Gate 2, ≤15 words)

```
"aha_moment": { "state_id": "STATE_3", "statement": "The needle stops at zero — a null, not a magnitude — because the ratios match." }
```
14 words. Physics TRUE against §1: at R=3, i_g=0 exactly, needle_deg=0 exactly, arms flow (0.2A/0.667A).

## `misconception_watch` physics check (Rule 16a, two pivots only)

1. **STATE_3** — "current stops everywhere at balance" vs bridge beads→none / arm beads persist (0.2A/0.667A). Verified true.
2. **STATE_4** — "you need the battery voltage / a meter reading to find S" vs VB=VD lockstep at every emf / `S=R·(Q/P)=6Ω` no emf term. Verified true (exactly emf-independent by algebra).

## FLAGS to json_author / quality_auditor

1. **Declare ALL of P, Q, R, S, emf with explicit `default`** (Bug #1 prevention).
2. **NEW engine capability, gated, routed via auditor FAIL → `peter_parker:renderer_primitives`, never cold-called:** `topology: "bridge"` (confirmed `cTopology()` currently returns `'series'|'parallel'` only); `drawGalvanometerC` (new — needle_deg formula + calibration §2); glow key **`galvanometer`** trivial (`dimFor()` is dynamically keyed off `state.glow_focal`, not a hardcoded enum — one `dimFor('galvanometer')` call inside the new function); ratio HUD + V_B/V_D readouts (`kcl_sum_readout` sibling + tolerance logic).
3. **S3 sweep MUST land <1500 ms** (1400 ms) — do NOT touch `deriveStateMeta.ts` whitelist (often raced).
4. **Ratio HUD needs numeric tolerance** (`|P/Q − R/S| < 0.01`) — required for S5 ✓.
5. **Never fabricate a numeric i_g away from balance** (S2) — only S3 balance gets a literal `i_g = 0`.
6. Verify no label collision/off-canvas clipping in the dense layout (§6).
7. quality_auditor: re-run `engine_bug_queue` live before gating — zero concept rows, but the `bridge`/`drawGalvanometerC` items are the declared engine-risk exceptions requiring FAIL-routing, not a cold call.

## DC Pandey check

No formula/explanation/derivation/example imported from DCP/HCV/NCERT. Balance derivation, exact-vs-idealized i_g boundary, needle calibration, all assessment/drill-down phrasing derived from Ohm's law + Kirchhoff directly. NCERT A/B/C/D–P/Q/R/S labeling = notation reference only.
