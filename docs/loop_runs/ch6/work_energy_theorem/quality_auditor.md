# Quality audit — `work_energy_theorem` (Ch.6 concept #4) — 2026-08-07

## VERDICT: **FAIL** — one finding, one owner: **`alex:physics_author`** `[reason: bug-class]`

The **simulation is sound.** All six states were driven live and the rendered instruments obey the
theorem exactly. The failure is that the concept's own machine-checkability contract is broken, so
**zero physics assertions ran** — and physics-block §9 explicitly claims otherwise. Blast radius is
`physics_engine_config` only: no re-render, no re-voice, no re-baseline.

## Gates 0–20: all PASS except Gate 8

Highlights of what passed, with evidence:
- **Gate 2** validator: `PASS work_energy_theorem.json` with **zero WARN lines**, against a fleet
  carrying 877 bounds + 400 word-budget warnings.
- **Gate 3e** Rule 31: **6/6 unique archetypes, zero repeats**; `controls_visible: []` on S1–S5.
- **Gate 3f** Rule 32: word budget **55 · 49 · 50 · 55 · 55 · 27**, all inside 25–55; **23/23** tts
  sentences carry a glow; zero `glow_focal` (settled decision honoured).
- **Gate 3h** Rule 38: rings `core·core·core·extended·advanced·core`, advanced contiguous before
  explore, **both cuts coherent**; 38b explore surfaces core-only (`Wₙₑₜ = ΔK`, no `ma·d`) — the exact
  trap the capacitance run caught.
- **Gate 11/41** plain English: 64 rendered strings swept, CLEAN.
- **Rule 35**: anchors are braking a vehicle and catching a ball — universal, country probe clean.
- **Gate 19/20** assessment: q6 verified genuinely reachable — at `m=4`, `μmg = 11.76 N`, and the F
  slider (step 5) reaches 10 N < 11.76 N, so the at-rest case is demonstrable.

### CF-2 / the §1 invariant — VERIFIED INDEPENDENTLY, PASS
Not accepted on the reported 6/6/6 or on any screen check (correctly — `nlbEnergyPanelLabel`
L44909-23 unions over all states, so a per-state omission is invisible). Re-derived by walking
`field_3d_config.states`: **states=6, energy_layer=6, work_accumulators=6.** All settled values
honoured (`work_scale_J` 55·55·110·40·55·400, `bar_max_J` 55/340, single-word captions, `v0 {min:0}`).

### The reflow fix WORKS — measured live at three viewport heights
```
=== 551 ===  STATE_1..6  trkH=[98,0]   overflow=[]
=== 720 ===  STATE_1..6  trkH=[138,0]  overflow=[]
=== 911 ===  STATE_1..6  trkH=[186,0]  overflow=[]
```
The scar row's own probe demands "the set of track heights within one viewport has size 1" — size 1 at
all three. **CF-1 discharged empirically**: zero `.nlb_en_sym` with `scrollWidth > clientWidth + 1`.

### The theorem holds live, in every state
```
STATE_1  ["K=6.9 J","net=6.9 J"]                                    ← the aha: same number
STATE_3  ["K=15.6 J","pull=42.3 J","friction=-42.3 J","net=0.0 J"]  ← exact cancellation, K flat
STATE_4  ["K=0.3 J","net=-17.7 J"]                                  ← near the turn, → −18.0
STATE_5  ["K=20.7 J","net=10.7 J"]                                  ← K₀=10.0, ΔK = 10.7 = net
STATE_6  ["K=6.6 J","pull=16.0 J","friction=-9.4 J","net=6.6 J"]    ← 16.0 − 9.4 = 6.6 = net = K
```

### Both Checkpoint-A CRITICAL rows re-derived by hand → PASS
- `nlb_sandbox_energy_envelope_…`: over the full `d = 12.0 m` wrap span at the lightest mass,
  `K = 305.44 ≤ 0.9×340 = 306` ✓, `W_pull = 360.0 ≤ 0.9×400 = 360` ✓. Discrete overshoot at
  `v = 17.48 m/s`: 1 substep → `W ≈ 368.7 / K ≈ 312.5`; 3 substeps → `W ≈ 386.2 / K ≈ 326.5`. **Both
  clear the raw scales — no clamp, no warn.**
- `state_end_of_loop_energy_numbers_…`: `s, v, K, W` re-derived at one single `t = R` per state. S4
  `v=+4.8, s=+3.94, K=46.08, W_net=+28.08`, `ΔK = 28.08` ✓. Tightest scale use S3 89.1%, S5 88.0%.

---

## THE FINDING — THE CALCULATOR, two independent root causes

`numeric:calc` → **7 passed · 0 failed · 44 skipped.** That looks clean and is not: **six of the seven
"passes" are `N0_readings_present`, a coverage COUNT.** Not one numeral was checked against the theorem
this concept exists to teach.

### Cause A — declared name ≠ painted symbol
```
W_pull_J -> symbol "W_pull" | W_friction_J -> "W_friction" | W_net_J -> "W_net"
painted caption "pull" admissible? -> false   "friction" -> false   "net" -> false
```
`splitNameUnit` (`deriveAssertions.ts` L51-57) strips only a trailing unit suffix. Channel B composes
the reading correctly; `parseReadings`' `admissible` closure then discards it. Every work-bar reading
in all six states is harvested and thrown away.

### Cause B — prose in `derived` (NEW, and the larger one)
`v` and `d` are declared with English prose in their `derived` field (`physics_block.md` L95, L122,
transcribed verbatim into the JSON). `independentVars` (L225-232) excludes any variable carrying a
`derived` string, so `buildStateScope` **(a)** refuses to bind their painted values, **(b)** deletes
them, and **(c)** cannot recompute because prose is not an expression.
```
STATE_1 | painted: v=2.4 K=14.4 m=5
  scope v = undefined | d = undefined | K = undefined
    K_J SKIP (v is not defined)  W_net_J SKIP (v is not defined)
    W_pull_J SKIP (d is not defined)  W_friction_J SKIP (d is not defined)
```
Identically on all six states — all 32 `N1` skips. **The painted `v=2.4` and `K=14.4` are right there
and correct (`½·5·2.4² = 14.4`), and the gate discards the input it needs to check them.**

### The five slider skips collapse into TWO causes, not one
- **Cause A** → both `N3_slider_moves_readout` + 2 of 3 `N3_slider_direction` (F, v0).
- **Cause B** → all 32 `N1` + the third `N3_slider_direction` (**m**: `K_J` depends on m and K *is*
  painted, but the direction prediction needs `v`, which is undefined).
- `N2_ohm_closure` ×6 and `N2_constant_stable` are honest N/A.

### ⚠ ORDERING MATTERS — fixing Cause A alone MINTS FALSE FAILS
Simulated A + B together against the real harvest:
```
STATE_3 | scope v=2.5 d=3 m=5 F=19.6 | painted K = 15.6
    K_J        = 15.63   ✓ matches painted 15.6
    pull_J     = 58.80   ✓ matches §9's reference table
    friction_J =  0.00   ✗ true value −58.8  (mu_k stuck at declared default 0)
    net_J      = 15.63   ✗ true value 0      (v0 stuck at declared default 0)
```
`v0` and `mu_k` are neither painted nor picked up by `stateOverrides` from
`bodies[].initial_velocity_mps` / `bodies[].mu_k`, so they sit at declared defaults of 0.

**Recommended ordering: land Cause B FIRST** — pure gain. `K_J` then evaluates and matches the painted
K on all six states (14.40 / 0.00 / 15.63 / 5.51 / 29.58 / 75.89 vs painted 14.4 / 0 / 15.6 / 5.5 /
29.6 / 76) — **six real assertions where there are currently none** — while the work formulas stay
quietly skipped. Land Cause A **only together with** a fix that gets per-state `v0` and `mu_k` into
scope (concept-side `variable_overrides`, or teaching `stateOverrides` the body-field mapping).

### Why FAIL and not a note
`physics_block.md` L928-931 states: *"All four channel-B numerals harvest on every state that authors
them… A SKIP is not a pass: the one number this concept renders that channel B CANNOT harvest is the
S5 checkpoint stamp own text."* **Falsified** — four numerals per state are unharvested, not one. It
also regresses a live OPEN row (`calculator_dom_harvest_needs_symbol_and_value_in_ONE_text_node…`)
whose probe requires one entry per authored bar: S1 authors 2 and harvests 1; S3 authors 4 and
harvests 1.

**Owner `alex:physics_author`** — both identifier sets and the falsified §9 claim originate in the
physics block (L95, L122, L143-145, L917-937); json-author transcribed them faithfully.

---

## PROCESS FINDING — the Checkpoint A scar rows were never applied

`scar_candidates_checkpointA.sql` contains six rows including two CRITICAL incidents. A live query for
this concept returns 15 rows and **none of the six**. Gate 8 therefore ran against a queue missing the
concept's own design-time rows, and the auditor only re-derived their probes because the dispatch
prompt named them by hand. The missing set includes
`multi_word_bar_caption_is_invisible_to_the_calculator_sibling_composition_channel` — immediately
adjacent to the defect this audit failed on.

*(Dispatching session: this is mine. The rows were written to disk and not applied.)*

**Also resolved empirically:** APPLY HAZARD 2 in that file is a false alarm — owner_cluster
`peter_parker:visual_validator` IS accepted by the live CHECK constraint (an existing row uses it).

---

## Two advisory notes (not blocking)

- **THE EYE's 27/27 is thinner than it reads.** Six of the 27 are `D5 | Skipped — motion expectation
  unknown`, and `H2` is `Skipped — no approved baseline`. The load-bearing content is D6/D7, H1 × 6,
  H3, D1p. Accurate, but 27/27 is not 27 independent proofs.
- **`nlb_static_state_authored_on_the_track_bound` clears by 0.05 m.** `|−5.4| = 5.4` vs
  `length_m − 0.55 = 5.45`, on five of six states. It passes, but any future nudge of `length_m` or the
  cart half-width breaks all five at once.
