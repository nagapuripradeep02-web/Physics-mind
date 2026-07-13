# PHYSICS BLOCK — `potentiometer`

*(companion to `potentiometer-architect.md`; json_author reads BOTH files. Design/arc are LOCKED — this block adds rigor/declarations/timelines/constraints only.)*

## 0. Engine bug queue consultation

- `potentiometer` / `wheatstone` / `jockey` — zero concept-specific rows.
- `default_variables_only_first_var_merged` (CRITICAL/FIXED) → every declared variable (E, ε_d, l, L, R_wire, r, R_v) carries an explicit `default`/`constant` (§1).
- `aha_statement_exceeds_15_words` (14 tokens, verified), `guided_state_overruns_pacing_target`/duration-sizing (durations off FULL choreography, §4), `label_occluded_and_offcanvas_circuit` (densest family layout — S2/S4 frozen-frame occlusion check flagged), `teach_reveal_synced_to_narration`/`teach_show_quantity_live_when_named`/`teach_do_not_prespoil_a_later_reveal` (S1 shows null quiet/uncommented, no k·l/i=0 label).

**Rigor point (physics_author addition, same class as the bridge's i_g note):** the tap-branch current is **exactly zero at balance for ANY galvanometer/tap-branch resistance** — k·l = E ⇒ zero PD across the tap branch ⇒ zero current by Ohm's law regardless of resistance. The high-G idealization is load-bearing only **away from balance** (lets tap beads/needle carry a qualitative imbalance without a full network solve). Governs what may be printed as literal `i = 0` (S3 only) vs kept qualitative (S2, S5 off-null).

## 1. Verified numbers (checked — no deviation from architect/spec)

| Quantity | Formula | S1 (l=0.5) | S2 (l=0.7) | S3 end (l=0.5) | S4 (l=0.5, pinned) |
|---|---|---|---|---|---|
| k | ε_d / L | 3.00 V/m | 3.00 V/m | 3.00 V/m | 3.00 V/m |
| k·l | k × l | 1.50 V | **2.10 V** | 1.50 V | 1.50 V |
| E | — | 1.50 V | 1.50 V | 1.50 V | 1.50 V |
| k·l − E | — | 0 | **+0.60 V** | 0 | 0 |
| needle_deg (K=60°/V, ±60°) | clamp(60·(k·l−E)) | 0° | **+36°** | 0° | 0° |
| i_tap | Ohm across tap branch | 0 (exact) | qualitative (>0, +) | 0 (exact) | 0 (exact) |
| i_wire (driver, R_wire=3Ω) | ε_d / R_wire | 1.00 A | 1.00 A | 1.00 A | 1.00 A |

S4 voltmeter contrast (r=1Ω, R_v=9Ω): I_meter = E/(r+R_v) = 1.5/10 = **0.15 A**; V_meter = E − I_meter·r = 1.5 − 0.15 = **1.35 V**. Assessment (4 V / 1 m wire, balance 35 cm): E = k·l = 4 × 0.35 = **1.40 V**; tap current = 0; voltmeter reads less.

## 2. `physics_engine_config` (documentation for json_author — particle_field computes natively)

```json
{
  "physics_engine_config": {
    "variables": {
      "E": { "name": "Tested cell EMF", "unit": "V", "min": 0.5, "max": 2.5, "step": 0.1, "default": 1.5,
        "role": "FIXED 1.50V on S1–S4 (the constant the jockey must find); live S5 explore" },
      "eps_d": { "name": "Driver cell EMF (ε_d)", "unit": "V", "min": 2, "max": 5, "step": 0.5, "default": 3,
        "role": "FIXED 3.0V on S1–S4 (sets k = ε_d/L); live S5 — lowering below E makes the null unreachable (honest sandbox)" },
      "l": { "name": "Jockey position from A", "unit": "m", "min": 0.05, "max": 0.95, "step": 0.01, "default": 0.5,
        "role": "the ONE taught control on S2/S3 — S1 home 0.5 (balanced quiet uncommented), S2 entry 0.5→slide 0.7, S3 entry 0.7→sweep 0.5, S4 pinned 0.5, live S5" },
      "L": { "name": "Wire length", "unit": "m", "constant": 1, "role": "fixed geometry; sets k = ε_d/L" },
      "R_wire": { "name": "Wire resistance", "unit": "Ω", "constant": 3,
        "role": "fixed; driver bead density i_wire = ε_d/R_wire = 1.00A, INVARIANT S1–S4 (does NOT affect k — the driver-loop idealization puts the full ε_d across the wire)" },
      "r": { "name": "Tested cell internal resistance", "unit": "Ω", "constant": 1, "role": "S4-only; the loss the voltmeter exposes and the null hides" },
      "Rv": { "name": "Voltmeter resistance", "unit": "Ω", "constant": 9, "role": "S4-only; with r gives a legible ~1.35V droop (I=0.15A)" },
      "k": { "name": "Potential gradient", "unit": "V/m", "derived": "eps_d / L", "role": "live readout, first shown S1" },
      "kl": { "name": "Tapped drop A→J", "unit": "V", "derived": "k * l", "role": "live readout, first shown S2; ticks 2.10→1.50V across S3" },
      "tap_gap": { "name": "Balance mismatch", "unit": "V", "derived": "kl - E", "role": "drives needle_deg + tap-bead direction/density (qualitative away from balance)" },
      "needle_deg": { "name": "Galvanometer needle angle", "unit": "degrees", "derived": "clamp(K_NEEDLE*(kl-E), -NEEDLE_MAX_DEG, +NEEDLE_MAX_DEG)",
        "role": "live tracking indicator (33d); K_NEEDLE=60 °/V, NEEDLE_MAX_DEG=60°; checkpoints S2→+36°, S3/S4→0°" },
      "i_wire": { "name": "Driver-loop current", "unit": "A", "derived": "eps_d / R_wire", "role": "driver-bead-density; INVARIANT 1.00A S1–S4; flows in EVERY state incl. balance" },
      "I_meter": { "name": "S4 voltmeter current", "unit": "A", "derived": "E / (r + Rv)", "role": "S4-only; drives cell-branch beads + dial droop" },
      "V_meter": { "name": "Voltmeter reading", "unit": "V", "derived": "E - I_meter * r", "role": "S4-only compare readout, 1.35V vs pinned E=1.50V null" }
    },
    "formulas": {
      "k": "eps_d / L",
      "kl": "k * l",
      "balance_condition": "kl === E  <=>  i_tap = 0 (exact, for ANY galvanometer/tap-branch resistance)",
      "needle_deg": "clamp(60 * (kl - E), -60, 60)",
      "I_meter": "E / (r + Rv)",
      "V_meter": "E - I_meter * r"
    },
    "constraints": [
      "tap_current_zero_at_balance_exact_for_any_G — i_tap = 0 EXACTLY at kl = E, ANY finite tap-branch resistance (not merely high-R idealization)",
      "potential_drops_uniformly_along_wire — k = ε_d/L constant per unit length; equal current × equal resistance-per-length ⇒ exactly linear ramp",
      "driver_beads_flow_always — i_wire = 1.00A in EVERY state incl. balance; only the TAP-branch current is ever zero",
      "needle_centre_zero — needle_deg = 0 is the null; sign flips either side",
      "balance_length_proportional_to_emf — l = E/k at fixed k",
      "null_reads_true_emf_voltmeter_reads_less — at balance i_tap=0 so no Ir loss (true EMF exact); voltmeter draws I=E/(r+Rv)>0, reads E−Ir < E",
      "explore_null_unreachable_when_driver_below_tested — eps_d < E ⇒ k·L < E ∀l ⇒ no null — EXPECTED honest lab behavior, never a forced false null",
      "no_region_dependent_constant_asserted — E, ε_d are sliders (Rule 35)",
      "i_wire_invariant_S1_to_S4 — i_wire = 1.00A identically S1–S4 — DELIBERATE",
      "no_divide_by_zero — L, R_wire, r+Rv > 0; l floored 0.05"
    ]
  }
}
```

## 3. Per-state `variable_overrides` (Rule 25d)

- **S1** `{E:1.5, eps_d:3, l:0.5}` — balanced home pose; needle TRUE 0° but `k·l`/`i=0` labels OFF (no pre-spoil). Only `k = 3.00 V/m` composes.
- **S2** `{E:1.5, eps_d:3, l:0.5}` entry → `jockey_sweep` to `l:0.7` (800 ms, <1500 floor); holds 0.7. `l` live after slide.
- **S3** `{E:1.5, eps_d:3, l:0.7}` entry → `jockey_sweep` to `l:0.5` in **1400 ms** (<1500 + pfRevealMs whitelist); holds 0.5. `l` live after sweep.
- **S4** `{E:1.5, eps_d:3, l:0.5, r:1, Rv:9}` — jockey PINNED at null; voltmeter-compare toggle fires connect beat, then live.
- **S5** none — defaults (`E:1.5, eps_d:3, l:0.5`); E, eps_d, l live via `show_sliders: true`.

## 4. Within-state motion timeline (Rule 31/32 — pure fn of state clock, cause-before-effect)

| State | t-window | What animates | Driven by | Live controls |
|---|---|---|---|---|
| **S1** | 0–900 ms | driver beads flow A→C (home-pose baseline, moves from t=0); jockey parked 0.5, needle quiet 0° | i_wire(t) | none |
| S1 | 900–2200 ms | potential-gradient ramp fills left→right (3.0V at A → 0 at C) | k(t) compose | none |
| S1 | 2200–3000 ms | `k = 3.00 V/m` composes | k | none |
| S1 | 3000 ms+ | hold to ~14 s; beads circulate; no tap readouts yet | — | none |
| **S2** | 0–800 ms | home-pose hold (l=0.5, needle 0°) | — | none |
| S2 | 800–1600 ms | **CAUSE**: jockey glides 0.5→0.7 m (`jockey_sweep` 800 ms) | l(t) | none |
| S2 | 1600–2400 ms | readable beat | — | none |
| S2 | 2400–3200 ms | **EFFECT**: `l = 0.70 m` + `k·l = 2.10 V` compose beside `E = 1.50 V` | l, kl | none |
| S2 | 3200–4000 ms | tap-branch beads appear (dir = sign(k·l−E) = +) | sign(tap_gap) | none |
| S2 | 4000–4800 ms | needle swings 0°→+36° | needle_deg(t) | none |
| S2 | 4800 ms+ | hold to ~15 s; **jockey live** | — | l |
| **S3** | 0–900 ms | home-pose hold (l=0.7, needle +36°, tap beads flowing, k·l=2.10V) | — | none |
| S3 | 900–2300 ms | **CAUSE**: jockey sweep 0.7→0.5 m, **1400 ms**; k·l ticks 2.10→1.50V; tap beads drain; needle +36°→0° | l(t) | none |
| S3 | 2300–2600 ms | needle **settles dead 0° and stops**; tap beads NONE — PRIMARY aha (beat #1) | — | none |
| S3 | 2600–3400 ms | `E = k·l = 1.50 V` formula + `i = 0` label (inside tolerance, never fabricated) | tap_gap≈0 | none |
| S3 | 3400 ms+ | hold to ~18 s; **jockey live**; driver beads flow throughout | — | l |
| **S4** | 0–900 ms | home hold: jockey pinned 0.5, needle 0°, `E = k·l = 1.50 V`, voltmeter disconnected | — | none |
| S4 | 900–1700 ms | **CAUSE**: voltmeter V connects across the cell (toggle) | toggle(t) | none |
| S4 | 1700–2500 ms | readable beat | — | none |
| S4 | 2500–3300 ms | cell-branch beads flow through cell + voltmeter (cell now draws current) | I_meter | none |
| S4 | 3300–3500 ms | internal `r` label lights inside the cell | — | none |
| S4 | 3500–4300 ms | V dial droops to `1.35 V` | V_meter(t) | none |
| S4 | 4300–5100 ms | compare readout `V_meter = 1.35 V vs E = 1.50 V`; the null side never moves (beat #2) | — | none |
| S4 | 5100 ms+ | hold to ~16 s; **compare toggle live** | — | compare toggle |
| **S5** | open, continuous, never auto-freezes (Rule 37) | needle/ramp-slope/k/k·l/l/balance track continuously; needle reverses across null | all formulas | E, eps_d, l (`show_sliders:true`) |

**advance_mode:** `manual_click` ×4 + `interaction_complete`. **Durations:** `14 / 15 / 18 / 16` s S1–S4, `0`/open S5.

## 5. Formula/HUD surfaces (Rule 34 — ONE math-serif Unicode formula surface per state)

| State | `formula_overlay` |
|---|---|
| S1 | `k = ε_d / L` |
| S2 | `V_AJ = k · l` |
| S3 | `E = k · l` |
| S4 | `V = E − I · r < E` |
| S5 | `E = k · l` |

Value-only zones (never collide): `k = 3.00 V/m` (S1+), `l = 0.50 m` / `k·l = …V` (S2+), `i = 0` **only at genuine balance** (S3 + genuinely-nulled S5), `V_meter = 1.35 V vs E = 1.50 V` (S4). All Unicode (`ε · Ω ⇒ − ✓`), DOM + canvas paths.

**Idealization boundary:** at balance i_tap=0 EXACT (any tap resistance) → `i = 0` hard claim at S3/nulled-S5. Away from balance the tap beads/needle are qualitative → **never print a fabricated off-balance `i = 0.0xx A`**.

## 6. Physical constraints — see §2 (10 assertions) + §5 boundary.

**Build-verification flag (`label_occluded_and_offcanvas_circuit`):** densest family layout — wire + ramp + jockey + tap branch/galvanometer + driver loop + S4 voltmeter + 4 readouts + formula, single frame. Verify via THE EYE frozen frame that all labels clear the canvas edge and none overlap (Rule 34d), especially S2 (jockey mid-slide + first readouts) and S4 (voltmeter + compare on top of the pinned null).

## 7. Drill-down cluster trigger phrases (migration file only — N/A-DORMANT)

**null_method_draws_no_current:** "the galvanometer has to draw some current to give a reading" / "at balance the meter must still be measuring something" / "how can it read zero and still tell you the emf" / "doesnt zero deflection just mean tiny not none" / "if no current flows how does the needle even move to show balance"

**voltmeter_reads_true_emf:** "just put a voltmeter across the cell it reads the emf directly" / "why not skip the wire and jockey and use a voltmeter" / "isnt a voltmeter reading close enough to the real emf" / "whats wrong with reading voltage straight off a meter" / "why does the voltmeter number come out lower than the actual emf"

**driver_cell_role_confused:** "why do you need a second battery" / "cant the tested cell just drive the wire itself" / "whats the driver cell even for" / "what happens if the driver voltage is smaller than the cells emf" / "why does the balance point disappear when i turn the driver voltage down"

## 8. Board mark scheme — N/A (Rule 20 dormant, conceptual-only). `epic_l_path` + `particle_field_config` ONLY.

## Proposed `aha_moment` (Gate 2, ≤15 words)

```
"aha_moment": { "state_id": "STATE_3", "statement": "The needle reads nothing — and that nothing is the cell's true, unloaded EMF." }
```
14 tokens. Physics TRUE: at l=0.5, tap_gap=0 exactly, needle_deg=0, i_tap=0 exact for any resistance, driver beads flow (i_wire=1.00A).

## `misconception_watch` physics check (Rule 16a, two pivots)

1. **STATE_3** — "the jockey/galvanometer draws current from the cell" vs tap beads draining to NONE + `i=0` while driver beads stream past. Verified true.
2. **STATE_4** — "a voltmeter reads the true EMF" vs the dial drooping to 1.35V (0.15A through r=1Ω) while the null holds 1.50V. Verified true.

## FLAGS to json_author / quality_auditor

1. **Declare E, eps_d, l with explicit `default`; L, R_wire, r, Rv with explicit `constant`** (Bug #1 prevention).
2. **NEW engine capability, gated behind `topology:"wire"`, routed via auditor FAIL → `peter_parker:renderer_primitives`:** wire+jockey+ramp geometry, sliding jockey (`jockey_pos`/`jockey_sweep*`), `drawGalvanometerC` REUSED with this concept's `potentiometer_calibration` (K_NEEDLE=60, MAX=60), gradient-ramp readout, S4 voltmeter-compare surface.
3. **S3 sweep MUST land <1500 ms** (1400 ms) + whitelist `jockey_sweep`/`_to`/`_start_ms`/`_duration_ms` in `pfRevealMs` (the `bridge_r_sweep` sibling).
4. **Never fabricate a numeric off-balance tap current** — only S3 balance (+ genuinely-nulled S5) gets literal `i = 0`.
5. **Glow:** reuse `galvanometer` (c20) S2/S3; `formula` S4; `gradient` key trivial in-engine only if `electrons` can't be re-pointed for S1.
6. Verify no label collision/clipping in S2/S4 (§6).
7. quality_auditor: re-run `engine_bug_queue` live; the `wire`/jockey/`drawGalvanometerC`-reuse/voltmeter-compare items are the declared engine-risk exceptions requiring FAIL-routing. Gate-8 cluster probe = N/A-DORMANT.

## DC Pandey check

No formula/explanation/derivation/example imported. Gradient (k=V/L), balance (E=k·l), exact-vs-idealized tap-current boundary, needle calibration, all phrasing derived from Ohm's law + circuit reasoning. DCP consulted for chapter SCOPE only.
