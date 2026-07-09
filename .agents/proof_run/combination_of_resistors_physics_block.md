# PHYSICS BLOCK — `combination_of_resistors`
**Appended to:** `.agents/proof_run/combination_of_resistors_skeleton.md` (9-state EPIC-L skeleton, PRIMARY aha S5)
**Author:** physics_author (Sonnet 5, model-pinned 2026-07-04)
**Engine dependency:** this block specifies the physics for a NEW `particle_field` `scenario_type: "combination_of_resistors"`. Per the architect's "Engine delta flags," renderer_primitives must build the scenario BEFORE json_author ships. Every number below is pre-verified so the engine build has an exact target.

---

## 0. Engine bug-queue consultation (pre-authoring — completed)

Ran `npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts` live against Supabase (`engine_bug_queue`), owner `alex:physics_author` (6 rows), `alex:json_author` (53 rows), `peter_parker:runtime_generation` (16 rows), plus concept-scoped queries for `ohms_law`, `resistivity`, `drift_velocity` (all **zero rows** — the Ch.3 particle_field family ships clean so far).

Prevention rules that bind this block:
- **`default_variables_only_first_var_merged`** (CRITICAL/FIXED, peter_parker:runtime_generation) — "only m.default merged, all other declared variables fall back to 1." Every one of my 5 sliders (V, R1, R2, topology, switch) is explicitly declared with its own `default` below — none may silently inherit 1.
- **`PEDAGOGY_NO_FOCAL`** / **`PEDAGOGY_FORMULA_MISSING`** / **`TTS_GLOW_TARGET_MISSING`** (generic, alex:json_author) — every state below declares exactly one `focal_primitive_id`/glow target that is a real primitive the engine will build (the 7 new keys + reused `formula`), and every narrated formula gets an on-canvas formula overlay (§ symbol-label table in the skeleton DoD already covers this — I did not duplicate it, just satisfy it).
- **`field3d_states_share_identical_visible_elements_no_distinct_picture`** — this is a field_3d-specific bug but the underlying lesson (no two states pixel-identical) is exactly Rule 31's no-repeat audit the skeleton already ran; I re-verify it against my own timeline in §3.
- **`guided_state_overruns_pacing_target`** / word-count directives — respected: every guided state's `text_en` is word-counted below (25–55 band, verified programmatically, not eyeballed).
- No `pause_after_ms` / `wait_for_answer` anywhere (S1–S8 `manual_click`, S9 `interaction_complete` — matches skeleton).

**FLAG to quality_auditor (repeating architect's flag):** re-run this SQL live at Gate 8 — a new row could land between this dispatch and audit.

**DC Pandey check:** No content imported. The series/parallel derivations in §1 are derived here from first principles (charge conservation = Kirchhoff's junction rule, energy conservation around a loop = Kirchhoff's voltage rule) — not copied from any textbook's phrasing or worked example. DC Pandey's ToC was not re-consulted (architect already did the scope check); I only used it to confirm the standard JEE-style checkpoint numbers (6 Ω, 12 Ω, 6 V) are conventional, not to copy any specific problem.

---

## 1. Circuit physics — exact numbers (verified via Python arithmetic this session)

Every reading below was computed and cross-checked with `python3` (not hand-arithmetic):

```
--- SERIES (R_eq = R1 + R2) ---
R2=6 Ω:  R_eq=12 Ω, i=0.5000 A, V1=3.0000 V, V2=3.0000 V, V1+V2=6.0000 V (check)
R2=12 Ω: R_eq=18 Ω, i=0.3333 A, V1=2.0000 V, V2=4.0000 V, V1+V2=6.0000 V (check)

--- PARALLEL (1/R_eq = 1/R1 + 1/R2) ---
R2=6 Ω:  R_eq=3.0000 Ω, i_total=2.0000 A, i1=1.0000 A, i2=1.0000 A, i1+i2=2.0000 A (check), i1/i2=1.0000=R2/R1 (check)
R2=12 Ω: R_eq=4.0000 Ω, i_total=1.5000 A, i1=1.0000 A, i2=0.5000 A, i1+i2=1.5000 A (check), i1/i2=2.0000=R2/R1 (check)

--- S8 branch-independence (R1=R2=6 Ω, symmetric) ---
parallel, switch closed:  i1=1.00 A, i2=1.00 A, i_total=2.00 A
parallel, switch OPEN:    i1=1.00 A (UNCHANGED), i2=0 A, i_total=1.00 A
series, switch closed:    R_eq=12 Ω, i=0.50 A (uniform)
series, switch OPEN:      i=0 A everywhere -- the entire 6 V now appears across the open switch gap (i.R1=i.R2=0, so V1=V2=0; KVL still balances: 6 V = 0 + 0 + V_switch_gap)

--- R_eq(parallel) bound check: as R2 -> infinity, R_eq -> R1 from BELOW, never reaches or exceeds it ---
R2=12:   R_eq=4.000000
R2=50:   R_eq=5.357143
R2=1000: R_eq=5.964215
R2=1e9:  R_eq=6.000000 (limit, never attained)
```

**Junction/ratio identities confirmed:** i1/i2 = R2/R1 (inverse-ratio -- the trap named in cluster `current_division_ratio`) and i_total = i1 + i2 exactly at both checkpoints (KCL).

**Calibration decision -- NO hidden constant needed.** Unlike `resistivity` (real copper at 1 m/1 mm2 gives R = 0.017 Ω, which cannot honestly drive a demo meter off a visible supply, forcing a hidden `V_supply = 0.0204 V` fudge), this concept treats R1/R2 as **discrete component-scale resistors** (Ω-scale by construction, like real resistor decade boxes), and V is a normal battery-scale voltage (0-12 V). i = V/R_eq lands directly in a legible 0.05-12 A range across the full slider space with zero adapter tricks. `formula_anchor.constants` for this concept is therefore **empty** -- there is nothing to hide.

**Microscopic-chain scope decision.** `drift_velocity`/`ohms_law`/`resistivity` derive i from n, e, m_e, tau (the microscopic drift chain). This concept's atomic claim (§1 of the skeleton) is explicitly macroscopic combination laws only -- resistors here are black boxes, not stretchable wires with L/A. I am **not** re-deriving tau per resistor. Bead-stream **speed is a rendering convention**, directly proportional to the LOCAL current through that wire segment (see §6 constraint callouts for the scaling constant) -- visually continuous with the drift_velocity/ohms_law "faster stream = more current" language the student already has, but with no new microscopic physics claimed.

**First-principles derivation (Kirchhoff's laws from conservation, not copied from any book):**
- **Series:** no junction exists on a single conducting path so charge conservation (continuity) forces the *same* current i through every element in steady state. Energy conservation around the loop (sum of potential rises = sum of drops): V = i.R1 + i.R2 = i.(R1+R2). Defining R_eq = V/i gives **R_eq = R1 + R2**, which generalizes to R_eq = sum(Rk) by treating any two combined resistors as one and repeating.
- **Parallel:** both branches connect directly across the same two nodes (ideal, zero-resistance wires) so potential is single-valued at a node, and both branches see the *identical* V. Ohm's law per branch: i1 = V/R1, i2 = V/R2. Charge conservation at the junction (no accumulation in steady state): i_total = i1 + i2 = V(1/R1 + 1/R2). Defining R_eq = V/i_total gives **1/R_eq = 1/R1 + 1/R2**, generalizing to 1/R_eq = sum(1/Rk).

---

## 2. `physics_engine_config` (documentary -- renderer computes natively, per sibling precedent)

**Important distinction from my role's default PM_interpolate contract:** PM_interpolate (`parametric_renderer.ts:398`) is the PCPL/2D-mechanics renderer's evaluator (used by `normal_reaction`, `hinge_force`, etc.). `particle_field_renderer.ts` -- this concept's renderer -- does **not** use PM_interpolate at all. Exactly like `resistivity.json` and `ohms_law.json`, `physics_engine_config` here is authored **as documentation to satisfy the Zod schema requirement**; the actual live computation must be implemented natively in engine JS by renderer_primitives during the mandatory scenario build (following the existing "ohms_law adapter" / "resistivity adapter" comment-block pattern already in the renderer file, `particle_field_renderer.ts:144-150`). The `formulas` block below is still written in evaluable JS-expression form so the engine implementation has an unambiguous, pre-verified target.

```json
{
  "physics_engine_config": {
    "variables": {
      "V": {
        "name": "Battery voltage",
        "unit": "V",
        "min": 0,
        "max": 12,
        "default": 6,
        "role": "slider -- S9 only; locked to 6 via variable_overrides on S1-S8 (never shown as adjustable until explore)"
      },
      "R1": {
        "name": "Resistor 1",
        "unit": "Ω",
        "min": 1,
        "max": 20,
        "default": 6,
        "role": "slider -- S9 only; locked to 6 via variable_overrides on S1-S8 (R1 never moves in any guided state -- it is the fixed reference the student measures every other change against)"
      },
      "R2": {
        "name": "Resistor 2",
        "unit": "Ω",
        "min": 1,
        "max": 20,
        "default": 6,
        "role": "slider -- live from S2 (S2/S4/S6/S7/S9); locked via variable_overrides on S1/S3/S5/S8 (see §3 per-state table -- every guided-state entry RESETS R2, live drags never leak into the next state, Rule 25d self-containment)"
      },
      "topology": {
        "name": "Circuit topology (0=series, 1=parallel)",
        "unit": "dimensionless (enum)",
        "min": 0,
        "max": 1,
        "default": 0,
        "role": "slider (discrete 2-state toggle) -- live ONLY in S9; every guided state (S2-S8) drives it via variable_overrides or scripted one-shot cues, never a direct drag. NEVER displayed to the student as a raw 0/1 -- engine renders the label text 'Series'/'Parallel'."
      },
      "switch": {
        "name": "Branch-2 switch (0=open, 1=closed)",
        "unit": "dimensionless (enum)",
        "min": 0,
        "max": 1,
        "default": 1,
        "role": "slider (discrete 2-state toggle) -- live ONLY in S8 and S9; the switch element does not exist on screen before S8 (Rule 32d: 'S8 adds only a switch to the existing branch'). NEVER displayed as raw 0/1 -- engine renders 'OPEN'/'CLOSED'."
      },
      "R_eq": {
        "name": "Equivalent resistance",
        "unit": "Ω",
        "derived": "topology===0 ? (R1+R2) : (R1*R2)/(R1+R2)",
        "role": "live readout -- the S2 overlay (series) and S7 req_box (parallel)"
      },
      "i_total": {
        "name": "Total (battery) current",
        "unit": "A",
        "derived": "V / R_eq",
        "role": "live readout -- the main ammeter every state reads"
      },
      "i1": {
        "name": "Branch 1 / series current",
        "unit": "A",
        "derived": "topology===0 ? i_total : V/R1",
        "role": "live readout -- in series this equals i_total exactly (S3's three matched ammeters); in parallel it is R1's own branch current (S6/S8)"
      },
      "i2": {
        "name": "Branch 2 current (switch-gated)",
        "unit": "A",
        "derived": "switch===0 ? 0 : (topology===0 ? i_total : V/R2)",
        "role": "live readout -- drives branch-2 bead speed; forced to exactly 0 the instant switch opens (S8), never a decaying tail"
      },
      "V1": {
        "name": "Voltage across R1 (series)",
        "unit": "V",
        "derived": "i_total * R1",
        "role": "live readout -- S4's first staircase step; meaningless/unused outside series states"
      },
      "V2": {
        "name": "Voltage across R2 (series)",
        "unit": "V",
        "derived": "i_total * R2",
        "role": "live readout -- S4's second staircase step"
      },
      "V_branch": {
        "name": "Voltage across EITHER parallel branch",
        "unit": "V",
        "derived": "V (identically, both branches always read the full battery voltage)",
        "role": "live readout -- S6's 'both branches labelled 6.0 V'; trivial but must be computed, not hardcoded, so it tracks a dragged V in S9"
      }
    },
    "formulas": {
      "R_eq": "topology === 0 ? (R1 + R2) : (R1 * R2) / (R1 + R2)",
      "i_total": "V / (topology === 0 ? (R1 + R2) : (R1 * R2) / (R1 + R2))",
      "i1": "topology === 0 ? (V / (R1 + R2)) : (V / R1)",
      "i2": "switch === 0 ? 0 : (topology === 0 ? (V / (R1 + R2)) : (V / R2))",
      "V1_series": "(V / (R1 + R2)) * R1",
      "V2_series": "(V / (R1 + R2)) * R2",
      "current_division_ratio": "i1 / i2 == R2 / R1 -- the inverse-resistance ratio, exact at every (R1,R2) in parallel mode"
    },
    "computed_outputs": {
      "R_eq_display": "R_eq rounded to 1 decimal (Ω) -- whole-ohm at both authored checkpoints (12, 18, 3, 4)",
      "i_display": "i rounded to 2 decimals (A) -- matches sibling convention (1.00 A, 0.50 A, 0.33 A)",
      "v_display": "V1/V2 rounded to 1 decimal (V) -- whole-volt at both authored checkpoints (3.0/3.0, 2.0/4.0)"
    },
    "constraints": [
      "i_total = V / R_eq exactly at every (V,R1,R2,topology) combination -- Ohm's law applied to the equivalent resistance",
      "Series: R_eq = R1 + R2 ALWAYS >= max(R1,R2) -- adding a series resistor NEVER lowers R_eq or raises current",
      "Parallel: 1/R_eq = 1/R1 + 1/R2, so R_eq ALWAYS < min(R1,R2) -- adding a parallel branch NEVER raises R_eq (strictly lowers it); as R2 -> infinity, R_eq -> R1 from below, never reaching or exceeding it",
      "Junction current conservation (KCL): i_total = i1 + i2 at every instant in parallel mode; series mode has i uniform everywhere (no junction, i1=i2=i_total trivially)",
      "Current-division ratio: i1/i2 = R2/R1 in parallel mode (the INVERSE resistance ratio -- bigger resistor gets LESS current, opposite of the naive R1/R2 guess)",
      "Series voltage division: V1+V2 = V always, with V1/V2 = R1/R2 (the DIRECT resistance ratio -- bigger resistor takes the BIGGER voltage share, opposite sense from current division)",
      "Both parallel branches see the identical voltage V, independent of the OTHER branch's resistance value",
      "All currents >= 0 always; switch=0 forces the gated current to EXACTLY 0, never a decaying/negative artifact",
      "Every derived quantity (R_eq, i_total, i1, i2, V1, V2) is a PURE function of (V,R1,R2,topology,switch) with no hidden internal state -- required for THE EYE's SET_TIME_FREEZE deterministic re-sim",
      "No hidden calibration constant (no V_supply-style fudge) -- see §1 calibration decision"
    ]
  }
}
```

---

## 3. Per-state `variable_overrides` (Gate: every guided state entry is self-contained, Rule 25d)

**General rule (stated once, applies to every row below):** on `SET_STATE`, every guided state (S1-S8) RESETS its variables via `variable_overrides` -- a teacher who drags R2 in S2 and then clicks S3 on the state rail sees R2 snap back to S3's own authored value, not the leftover drag. Only S9 (explore) has no overrides -- it inherits the plain schema defaults. **V and R1 are locked at 6 V / 6 Ω on every state from S1-S8** -- they are never live outside S9, so their override is trivially "always 6."

| State | `variable_overrides` | Why (justification, per the hinge_force/field_forces defensive-lock pattern) |
|---|---|---|
| S1 | `{ V:6, R1:6, circuit_mode:"baseline_single" }` | R2 is not yet wired into the circuit at all -- a scene-level flag, not a `variables` entry (see §6). Only R1 conducts; `topology`/`R2`/`switch` are undefined/inert this state. |
| S2 | `{ V:6, R1:6, R2:6, topology:0, switch:1 }` | Entry pose must be the clean series baseline (R_eq=12, i=0.50) even if a teacher never visited S1, or jumps here directly via the state rail. R2 becomes live AFTER entry. |
| S3 | `{ V:6, R1:6, R2:6, topology:0, switch:1 }` | **Locked, no live control.** If R2 were left at whatever S2's drag ended on, the "three matched ammeters" narration (which states "0.50 A") could visually contradict the spoken number. Locking R2=6 guarantees the exact reading matches every time, regardless of entry path. |
| S4 | `{ V:6, R1:6, R2:6, topology:0, switch:1 }` | Same defensive lock as S3 -- entry pose is always the clean 3 V/3 V split; R2 becomes live for the drag-to-12 demonstration AFTER entry. |
| S5 | `{ V:6, R1:6, R2:6, topology:0(entry)->1(exit), switch:1 }` | **PRIMARY AHA -- no live control ("the aha lands clean").** Entry pose MUST be series/in-line (topology:0) regardless of arrival path, because the `lift_out`/`land_across` cue pair is choreographed FROM that exact starting pose. Exit pose (topology:1, parallel) is what S6/S7 assume as THEIR entry baseline reasoning, though S6/S7 still declare their own explicit locks below rather than trusting inheritance. |
| S6 | `{ V:6, R1:6, R2:6(entry)->12(exit via r2_grow cue), topology:1, switch:1 }` | Entry R2 is locked to 6 (NOT inherited from S5's exit value, even though they happen to match) so a direct state-rail jump into S6 still shows the full clean 6->12 sweep, not a truncated one. |
| S7 | `{ V:6, R1:6, R2:12, topology:1, switch:1 }` | **Exception to the "reset-to-6" pattern -- deliberate.** S7's own narrative requires R_eq=4 Ω / i_total=1.50 A, which only holds at R2=12. This is the textbook `variable_overrides` case from the role spec: "the state's narrative requires a specific value different from `default_variables`." A teacher who jumps directly to S7 (skipping S6's sweep) must still see R2=12, R_eq=4 Ω, not R2=6. |
| S8 | `{ V:6, R1:6, R2:6, topology:1(entry), switch:1(entry) }` | **Locked to the clean symmetric case (R1=R2=6 Ω), not inherited from S7's R2=12.** The branch-independence teaching point needs "branch 1 pinned at exactly 1.00 A" to read cleanly -- that only holds at R1=6 regardless of R2, but the *parallel-closed* baseline (i1=i2=1.00 A each) is clearest when R1=R2. Topology/switch then cycle through all 4 phases via the `switch_cycle` cue (see §4). |
| S9 | *(none -- plain schema defaults: V=6, R1=6, R2=6, topology=0, switch=1)* | Explore state, no override needed; matches the `ohms_law`/`resistivity` explore-state precedent (no special entry pose beyond the schema default). |

---

## 4. Within-state motion timeline + control plan (Rule 31 REQUIRED table, Rule 32 legibility verified)

All cue `at_ms` values below are the THE-EYE-fallback timing; production timing is re-anchored to the narrating sentence via `scenario_cue` + `SET_CUE_TIME` per the skeleton's cue plan (Rule 32a: cause completes, THEN a readable >=0.6s beat, THEN the effect starts).

| State | t-window | What animates (pure fn of state clock) | Driven by | Live control(s) | `duration` |
|---|---|---|---|---|---|
| **S1** | 0-800ms | Static home pose: battery, R1, unwired R2 box off to the side | none | none | 14s |
| S1 | cue `battery_on` @800ms | Electron beads begin streaming single-file around the loop (ramp 800-1600ms) | `battery_on` cue | | |
| S1 | 1600-2400ms | Ammeter needle climbs 0->1.00 A, settles | `i_total` (computed) | | |
| S1 | 2400-14000ms | Beads + needle hold steady at 1.00 A | `i_total` (static value, beads keep flowing -- motion never stops) | | |
| **S2** | 0-1500ms | Home pose: S1's settled loop (1.00 A) | | R2 | 17s |
| S2 | cue `splice_in` @1500ms | R2 box slides in-line and splices in (1500-2300ms, 800ms one-shot) | `splice_in` cue | | |
| S2 | 2300-3000ms | **Readable beat (Rule 32a, 700ms gap)** -- nothing changes yet | | | |
| S2 | 3000-4200ms | EVERY bead in the loop slows together (32b: one variable, but its effect is loop-wide by physics, not a violation -- the "variable" is R2, the WHOLE loop's speed is its one physical consequence); needle sinks 1.00->0.50 A | `i_total` (recomputed from `R_eq`) | | |
| S2 | 4200-17000ms | Holds at 0.50 A; formula overlay `R_eq = R1+R2 = 12 Ω` stamps in; dragging R2 live re-sinks further | R2 (live) | R2 | |
| **S3** | 0-500ms | Home pose: three ammeter primitives fade in at their fixed loop positions | | none | 15s |
| S3 | 500-15000ms | Per-second crossing tallies increment continuously on all three (this IS the motion -- "null-result-hold" is never a static frame); all three needles pinned at 0.50 A the entire dwell | `i1` (computed, constant across the state since R2 is locked) | | |
| **S4** | 0-500ms | Home pose: probe appears at the battery terminal | | R2 | 17s |
| S4 | continuous, ~4500ms/loop | Probe rides the loop continuously (oscillate/track -- no discrete cue); potential readout staircases: flat 6V wire -> drops 3V across R1 -> flat -> drops 3V across R2 -> 0V at return | `V1`,`V2` (computed) | | |
| S4 | any time (drag) | Dragging R2 -> 12 re-proportions the staircase live to 2V/4V | R2 (live) | R2 | |
| **S5** | 0-1000ms | Home pose: S4's end pose (series, 0.50 A, R2 in-line) | | none | 19s |
| S5 | cue `lift_out` @1000ms | R2 slides OUT of line (1000-1800ms, 800ms one-shot) -- loop heals to single-resistor | `lift_out` cue | | |
| S5 | 1800-2600ms | **Readable beat** -- needle recovers 0.50->1.00 A (re-anchors the S1 baseline) | `i_total` | | |
| S5 | 2600-4500ms | Hold at 1.00 A (this pause IS the setup -- the student re-confirms baseline before the flip) | | | |
| S5 | cue `land_across` @4500ms | The SAME R2 box re-lands ACROSS R1 (4500-5300ms, 800ms one-shot); junction node blooms | `land_across` cue | | |
| S5 | 5300-6000ms | **Readable beat (32a)** | | | |
| S5 | 6000-7000ms | Needle LEAPS 1.00->2.00 A; `R_eq < R1` overlay stamps in | `i_total` (recomputed, topology now 1) | | |
| S5 | 7000-19000ms | Hold at 2.00 A, junction visible, both branches streaming | | | |
| **S6** | 0-1500ms | Home pose: S5's end pose (parallel, R2=6, both branches 1.00 A) | | R2 | 17s |
| S6 | cue `r2_grow` @1500ms | R2 animates 6->12 continuously (1500-4500ms, 3000ms ramp) -- junction split visibly re-proportions LIVE during the ramp, not a single jump | `r2_grow` cue -> `R2(t)` | | |
| S6 | throughout ramp | Branch-1 stream/meter HOLD PINNED at 1.00 A the entire time (32b: only R2's branch changes); branch-2 stream visibly thins as its meter falls 1.00->0.50 A | `i1` (constant), `i2` (falling) | | |
| S6 | 4500-17000ms | Hold at final split (1.00/0.50); dragging R2 live re-proportions further | R2 (live) | R2 | |
| **S7** | 0-2000ms | Home pose: two branch boxes (6 Ω / 12 Ω), locked entry (R2=12, see §3) | | R2 | 19s |
| S7 | cue `collapse_eq` @2000ms | The two boxes glide together and morph into ONE box (2000-3200ms, 1200ms one-shot); junction fades | `collapse_eq` cue | | |
| S7 | throughout the morph | Total ammeter HOLDS STEADY at 1.50 A (equivalence proven by the unmoved needle -- the whole teaching point) | `i_total` (constant across the morph -- deliberately never changes) | | |
| S7 | 3200ms | `R_eq = 4 Ω` label stamps on the merged box | | | |
| S7 | 3200-19000ms | Hold; dragging R2 live re-reads `R_eq` (which never exceeds 6 Ω -- see §1 bound check) | R2 (live) | R2 | |
| **S8** | 0-1000ms | Home pose: S7's apparatus + a NEW switch element added on branch 2 (32d: "adds only a switch to the existing branch") | | switch | 19s |
| S8 | cue `switch_cycle` @1000ms (phase 1->2) | Switch opens (parallel mode): branch-2 beads halt instantly, branch-1 UNCHANGED at 1.00 A | `switch_cycle` cue | | |
| S8 | ~1000-5500ms | Hold phase 2 (parallel-open: i1=1.00, i2=0, i_total=1.00) | | | |
| S8 | cue `switch_cycle` @5500ms (phase 2->3) | Topology flips to series (switch re-closes as part of the flip -- same physical wire now the only path); needle settles at 0.50 A uniform | `switch_cycle` cue | | |
| S8 | ~5500-10000ms | Hold phase 3 (series-closed: i=0.50 A everywhere) | | | |
| S8 | cue `switch_cycle` @10000ms (phase 3->4) | Switch opens again (now in series): the ONE loop breaks, ALL beads halt, EVERY meter dies to 0 | `switch_cycle` cue | | |
| S8 | ~10000-14500ms | Hold phase 4 (series-open: i=0 everywhere) | | | |
| S8 | @14500ms | Cycle repeats from phase 1 (parallel-closed) | | switch (live, teacher may seize any phase manually) | |
| **S9** | 0-open | Continuous demo motion (topology gently cycling, meters live) until a trusted drag (`ev.isTrusted`) seizes any control; then all readouts recompute live off the dragged variable | ALL 5 sliders | V, R1, R2, topology, switch | 0 (open) |

**No-repeat re-audit (cross-check vs skeleton §3):** every state above has a DISTINCT motion signature -- S1 settle-in, S2 splice+loop-slow, S3 tally-hold, S4 continuous probe-cycle, S5 lift+re-land (2 one-shots), S6 continuous grow+split, S7 morph-collapse, S8 4-phase cycle, S9 free drag. Matches the architect's declared archetypes exactly; no state is static (S3's "nothing changes" reading is itself produced by continuously incrementing tally counters, never a frozen frame).

---

## 5. Board-mode mark scheme -- SKIPPED

Per Rule 20 (conceptual-only directive, active) and the skeleton's own DoD §10(e): **no `mode_overrides`, no board mark scheme, no derivation_sequence authored.** This section is intentionally empty for this phase. If/when Rule 20 lifts, physics_author will return to author 1-mark-per-state (S1-S8 = 8 marks minimum) keyed to: baseline Ohm's law (S1), series addition (S2), current uniformity (S3), voltage division (S4), the parallel aha (S5), current division (S6), the reciprocal formula (S7), branch independence (S8).

---

## 6. Drill-down cluster phrasings (9 clusters x 5 real-student phrases)

**S5 -- `why_more_paths_less_resistance`:**
- "how does adding a resistor decrease the resistance"
- "more resistors should mean more resistance na"
- "why did the current increase when I added another resistor"
- "adding resistance should reduce current not increase it"
- "this makes no sense more parts more resistance right"

**S5 -- `parallel_req_below_smallest`:**
- "why is req smaller than the smallest resistor"
- "how can equivalent resistance be less than 6 ohms when both resistors are 6 and 12"
- "req is less than even the smaller resistor how"
- "shouldnt equivalent resistance be somewhere between the two values"
- "why does parallel resistance go below both resistors"

**S5 -- `battery_supplies_more_current`:**
- "where does the extra current come from"
- "does the battery drain faster in parallel"
- "battery is giving more current suddenly how"
- "is the battery working harder in a parallel circuit"
- "more current means battery dies faster right"

**S6 -- `current_division_ratio`:**
- "how much current goes through each branch"
- "why does the smaller resistor get more current"
- "i did r1/r2 for the ratio is that wrong"
- "how to find current in each branch of parallel"
- "which branch gets more current the bigger or smaller resistor"

**S6 -- `same_voltage_across_branches`:**
- "why do both branches get the full battery voltage"
- "shouldnt voltage split in parallel like it does in series"
- "why is voltage same across both resistors here"
- "each branch has different resistance so why same voltage"
- "does voltage divide in parallel circuits or not"

**S6 -- `junction_current_conservation`:**
- "why is total current equal to i1 plus i2"
- "at the junction where does the current go"
- "how do you know current splits and doesnt get used up"
- "is current conserved at the junction point"
- "why does current entering the junction equal current leaving"

**S7 -- `reciprocal_invert_slip`:**
- "i added 1/6 plus 1/12 and got 1/4 is that the answer"
- "do i need to invert after adding the reciprocals"
- "why is req not 0.25 ohms"
- "i keep forgetting to flip the fraction at the end"
- "1 over req is 0.25 so req is 0.25 right"

**S7 -- `product_over_sum_shortcut`:**
- "when can i use r1r2 over r1 plus r2"
- "does the product over sum trick work for three resistors"
- "is r1r2 over r1 plus r2 only for two resistors"
- "can i chain the shortcut formula for more resistors"
- "why does this shortcut only work for two at a time"

**S7 -- `n_equal_resistors_pattern`:**
- "for n equal resistors why is series parallel ratio n squared"
- "if all resistors are equal is there a shortcut formula"
- "n resistors in series vs n in parallel what is the ratio"
- "why is it nR for series and R/n for parallel"
- "is there a pattern when all the resistors are the same value"

---

## 7. Narration -- `text_en` per state (word-counted programmatically, not eyeballed)

Every count below was verified with a Python word-split script, not hand-counted. Rule 30 symbol expansion applied on first mention (voltage V, current I, resistance R); subscripted symbols (R1, R2, V1, V2, i1, i2, R_eq) are written as spoken words -- **"R one" / "R two" / "V one" / "V two" / "R eq"** -- never unicode subscripts in `text_en` (on-canvas labels stay symbolic per Rule 24: R1, R2, V1, V2, R_eq). This is a deliberate authoring decision flagged explicitly since no particle_field sibling has subscripted narration yet -- **FLAG to json_author + quality_auditor to confirm Sarvam bulbul:v3 pronounces "R one"/"R eq" cleanly** (no prior precedent to clone from).

### STATE_1 -- Baseline (44 words)
| id | text_en | glow | cue |
|---|---|---|---|
| s1_1 | "Six volts from the battery push current through one resistor of six ohms." | `resistors` | `battery_on` |
| s1_2 | "Watch the ammeter needle climb from zero and settle at one ampere." | `ammeter_total` | |
| s1_3 | "One ampere -- current I equals voltage V over resistance R -- is our reference for every state ahead." | `ammeter_total` | |

### STATE_2 -- Series build (55 words)
| id | text_en | glow | cue |
|---|---|---|---|
| s2_1 | "A second resistor, R two, slides in line and splices into the loop." | `resistors` | `splice_in` |
| s2_2 | "After a beat, every electron everywhere in the loop slows together, and the needle sinks from one ampere to zero point five." | `ammeter_total` | |
| s2_3 | "Resistances simply add in series: the equivalent resistance, R eq, equals R one plus R two -- twelve ohms here." | `formula` | |

### STATE_3 -- Current is uniform (53 words) -- misconception pivot (a)
| id | text_en | glow | cue |
|---|---|---|---|
| s3_1 | "Three ammeters watch this loop: before the first resistor, between the two, and after the second." | `ammeter_branches` | |
| s3_2 | "If current I were used up crossing a resistor, later meters should read less -- watch all three." | `ammeter_branches` | |
| s3_3 | "All three stay pinned at zero point five ampere the whole time: resistors spend voltage V, never current I." | `ammeter_branches` | |

### STATE_4 -- Voltage division (53 words)
| id | text_en | glow | cue |
|---|---|---|---|
| s4_1 | "A glowing probe rides the loop: three volts vanish crossing R one, three more crossing R two -- voltage V one plus voltage V two equals six volts." | `volt_probe` | |
| s4_2 | "Drag R two to twelve ohms and the steps reshape live -- two volts, then four: the bigger resistance always takes the bigger voltage share." | `volt_probe` | |

### STATE_5 -- PRIMARY AHA (54 words) -- misconception pivot (c)
| id | text_en | glow | cue |
|---|---|---|---|
| s5_1 | "R two lifts out of line -- the loop heals, needle back to one ampere." | `resistors` | `lift_out` |
| s5_2 | "That same resistor lands ACROSS R one -- a junction blooms, and the needle LEAPS to two amperes." | `junction` | `land_across` |
| s5_3 | "A new path means room for more current, not more obstacle -- resistance drops to three ohms, below either resistor alone." | `ammeter_total` | |

### STATE_6 -- Current division (55 words) -- misconception pivot (b)
| id | text_en | glow | cue |
|---|---|---|---|
| s6_1 | "R two grows from six ohms to twelve -- watch the stream split at junction." | `junction` | `r2_grow` |
| s6_2 | "Branch one stays pinned at one ampere; branch two thins to zero point five ampere." | `ammeter_branches` | |
| s6_3 | "Both branches read the full six volts -- they share voltage equally, never current." | `ammeter_branches` | |
| s6_4 | "Current I splits by ease of path -- not by half." | `ammeter_branches` | |

### STATE_7 -- R_eq quantified (54 words)
| id | text_en | glow | cue |
|---|---|---|---|
| s7_1 | "Branch one at six ohms, branch two at twelve, about to collapse into one box." | `resistors` | |
| s7_2 | "Watch them merge: one over R eq equals one over R one plus one over R two." | `req_box` | `collapse_eq` |
| s7_3 | "That box reads four ohms -- less than the smallest branch -- while the ammeter holds steady at one point five amperes." | `req_box` | |

### STATE_8 -- Branch independence (55 words)
| id | text_en | glow | cue |
|---|---|---|---|
| s8_1 | "One switch sits on branch two: open it in parallel mode." | `switch` | `switch_cycle` |
| s8_2 | "Branch one keeps flowing at one ampere, completely unaffected -- only branch two goes dark." | `ammeter_branches` | |
| s8_3 | "Flip to series and open the same switch: now the one loop breaks and every meter falls to zero." | `ammeter_total` | |
| s8_4 | "That is why every home wires its appliances in parallel." | `switch` | |

### STATE_9 -- Explore (20 words, <=20 cap satisfied)
| id | text_en | glow | cue |
|---|---|---|---|
| s9_1 | "Every dial is yours: voltage V, both resistors, series or parallel, and the switch -- watch every meter respond live." | `formula` | |

**Word-budget audit (Rule 31a, all verified programmatically):** S1=44, S2=55, S3=53, S4=53, S5=54, S6=55, S7=54, S8=55, S9=20. All within the 25-55 band (S2/S6/S8 sit exactly at the 55 ceiling -- trimmed to the word, not padded). S9 within the <=20 explore cap.

---

## 8. Constraint callouts (special-case algebra json_author must encode)

- **No angle/radians conversion anywhere in this concept** -- zero angular quantities (first particle_field concept in the family with this property). Explicitly N/A, not an omission.
- **Rounding/display convention:** currents display at 2 decimals ("1.00 A", "0.50 A", "0.33 A" -- note 0.333... genuinely truncates for display; the underlying `i_total` value stays exact float, only the on-screen string rounds). Voltages (V1/V2) display at 1 decimal ("3.0 V", "2.0 V", "4.0 V"). R_eq displays at 1 decimal, reads as whole ohms at every authored checkpoint (12.0, 18.0, 3.0, 4.0).
- **`topology` and `switch` are NEVER shown as raw 0/1 to the student** -- engine renders text labels ("Series"/"Parallel", "OPEN"/"CLOSED"). The underlying numeric encoding is an internal convention only, safe to keep as `physics_engine_config.variables` for the formula plumbing.
- **Open-switch voltage behavior (engine correctness, beyond the named misconception clusters but physically required):** when `switch===0`, the ENTIRE potential difference the gated segment would have carried appears across the switch's own gap, not across R1/R2 (V1=V2=0 exactly, since i=0 in series-open; the branch's own R2 also sees 0 A but its two end-nodes are still nominally V apart in parallel-open -- the gap "absorbs" it). This must NOT be rendered as current leaking through the open contact.
- **Bead/current visual speed scaling** (rendering-only, no new microscopic physics -- see §1 scope decision): `drift_speed_segment = k * abs(local_current_in_that_segment)` with **k = 0.35**, calibrated so i=1.00 A reads as `drift_speed=0.35` -- the EXACT convention already used by `resistivity.json`/`ohms_law.json` (`"drift_speed": 0.35` at their i~1A/1.2A baselines). Verified range: i=0.33A->0.115, i=0.50A->0.175, i=1.00A->0.350, i=2.00A->0.700. **Must cap at 1.2 px/frame** for the S9 explore extremes (i can reach 12 A at V=12,R=1, which would compute 4.2 px/frame uncapped -- motion-blur territory, clamp it).
- **R2 slider step = 1 Ω** (not a decimal step like resistivity's L/A sliders) -- deliberate choice: resistors in this concept are discrete "resistor-box" components, not continuously-stretched wires, so an integer-Ω step is both more physically authentic (real decade resistance boxes step in whole/decade ohms) and guarantees the two authored checkpoints (6, 12) are always exactly reachable by drag, never approximated.
- **`circuit_mode:"baseline_single"` (S1 only)** is a scene/extras flag, not a `physics_engine_config.variables` entry -- R2/topology/switch are simply undefined/inert in S1 since R2 is not yet wired into the circuit at all (sitting visibly off to the side, unconnected). Engine must not attempt to compute `R_eq`/`i2` in this state.
- **Switch element does not exist before S8** -- S1-S7 must not render a switch primitive at all (Rule 32d home-pose continuity: "S8 adds only a switch to the existing branch"). `switch` variable is inert/unused prior to S8.

---

## Self-review checklist

- [x] Every symbol in the skeleton's state narratives (V, R1, R2, R_eq, i, i1, i2, V1, V2, topology, switch) appears in `variables`.
- [x] No angle/radians conversion needed anywhere -- explicitly stated N/A, not omitted.
- [x] Every state's live control(s) match the architect's control table exactly (S1/S3/S5 none; S2/S4/S6/S7 R2; S8 switch; S9 ALL).
- [x] `variable_overrides` documented for every state, each justified with a one-liner (§3); S7's R2=12 exception explicitly flagged as the deliberate hinge_force/field_forces-pattern case.
- [x] Board mark scheme -- explicitly SKIPPED per Rule 20, not silently omitted (§5).
- [x] Drill-down phrasings -- 5 per cluster x 9 clusters = 45 phrases, real-student register verified against the "good vs bad" examples in my role spec (informal, "na"/"right"/"i did" -- never textbook prose).
- [x] `constraints` block -- 10 assertions (slightly over the 4-6 guideline; justified by the higher branch/topology complexity vs a single-formula concept -- every one is short and factual, not padded).
- [x] Numerical sanity check run via Python (not by hand) -- every checkpoint in §1 cross-verified: series 6+6=12Ω/0.50A, 6+12=18Ω/0.33A; parallel 6||6=3Ω/2.00A, 6||12=4Ω/1.50A split 1.00/0.50; S8 symmetric-case 4-phase cycle.
- [x] Within-state motion timeline for all 9 states (§4); Rule 26 pure-function-of-state-clock respected throughout (every t-window keyed off state-entry, no TTS-gated motion).
- [x] Rule 32 sequencing verified per state: every one-shot cue completes before its readable-beat gap (>=600-700ms) before the effect begins (S2 splice->slow, S5 lift/land->needle response, S6 grow->split, S7 collapse->(no gap needed, equivalence IS simultaneous by design, holds through the morph), S8 switch->bead halt).
- [x] Word budget (Rule 31a) -- verified programmatically for all 9 states (§7): 44/55/53/53/54/55/54/55/20, all within 25-55 (S9 <=20).
- [x] Engine bug queue consulted live via Supabase this session (§0); `default_variables_only_first_var_merged` explicitly satisfied (all 5 sliders individually declared).
- [x] DC Pandey check: series/parallel derivations are first-principles (Kirchhoff's laws from charge/energy conservation), not imported from any textbook phrasing or worked example; only the conventional checkpoint numbers (6Ω/12Ω/6V) were cross-referenced as standard, not copied.
