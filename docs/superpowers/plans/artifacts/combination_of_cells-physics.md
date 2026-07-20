# PHYSICS BLOCK — `combination_of_cells`

**Author: physics_author · Input: `docs/superpowers/plans/artifacts/combination_of_cells-architect.md` (8-state skeleton) · Siblings read: `emf_definition.json`, `internal_resistance.json` (full) + `wheatstone_bridge.json`/`deriveStateMeta.ts` (one-shot timing precedent)**

## Engine bug queue consultation (done first, per contract)

Live SQL not run this dispatch (no DB access in this environment) — same declared exception the architect flagged. I re-verified the **documented mirrors** directly in code instead of trusting the skeleton's paraphrase: read `deriveStateMeta.ts` lines 442–525 myself. Confirmed prevention rules and how they bind this concept:

- `pfRevealMs` is a **closed if-ladder keyed on specific flag names** (`r2_autosweep`, `emf_autosweep`, `droop_intro`, `two_reading`, `r_reveal`, `R_autosweep_down`, `bridge_r_sweep`, `jockey_sweep`, …) with `DEFAULT_REVEAL_MS = 1500` as fallback — an unregistered new flag silently falls back to 1500ms and THE EYE photographs the PRE-payoff frame (the exact `equipotential_surfaces`/`galvanometer_to_ammeter_voltmeter` scar). This is why every NEW one-shot in this concept (`dock_cell`, `flip_cell`, `regroup`) is sized to **settle under 1500ms** (belt-and-suspenders — correct even with zero new registration), while S7's cycle-compare (which genuinely cannot fit under 1500ms) is explicitly flagged as needing a NEW `pfRevealMs` entry, mirroring the `bridge_r_sweep`/`jockey_sweep` pattern exactly (start_ms + duration_ms + 300–400ms buffer).
- `R_autosweep_down`/`R_autosweep_to` is **already registered** (`state.R_autosweep_down === true → maxMs = max(maxMs, 700+3200+400)`) — S6 reuses the flag name verbatim, so **zero new registration needed** there; I carry the exact 700/3200 timing values from `internal_resistance` rather than inventing new ones.
- Glow enum is CLOSED (ohms_law scar, confirmed in memory) — `cells` and `ammeter` are NEW keys the skeleton already flagged to `peter_parker`; I do not free-type any other key.
- `default_variables_only_first_var_merged` (bug #1 canonical) — every non-trivial-default variable below is declared explicitly with its own `default`, and every state's `variable_overrides` are written out in full rather than left to inherit.
- No rule found unsatisfiable. One EXCEPTION I'm flagging myself (new, not in the skeleton's list): **S7's `cycle_compare` mechanism has no shipped precedent** (bridge/jockey sweeps are single-phase; S7 is 3-phase). This is routed to `peter_parker:renderer_primitives` via quality_auditor's FAIL, not built by me — I specify behavior/timing only.

---

## 1. `physics_engine_config`

**Renderer-reality note (carries into json_author's `source_book`, sibling convention verbatim):** this concept does **not** drive `i`/`V_terminal`/`ε_eq`/`r_eq` via `physics_engine_config.formulas`/`PM_interpolate` — `particle_field_renderer.ts` computes them natively in engine JS via the (extended) `internal_resistance` adapter, reading `slider_controls.{emf, r, R, switch, cell_topology, cell_count, flip_cell2}`. `physics_engine_config` below is authored as **documentation** per the Zod requirement, mirroring `emf_definition`/`internal_resistance`/`combination_of_resistors`'s convention. The JS-expression strings are the exact semantics the engine implementation must match — not literal `PM_interpolate` targets.

```json
{
  "physics_engine_config": {
    "variables": {
      "emf": {
        "name": "electromotive force per cell (epsilon)",
        "unit": "V",
        "min": 1.0,
        "max": 3.0,
        "step": 0.1,
        "default": 1.5,
        "role": "slider — LOCKED to 1.5 on STATE_1–STATE_7 (every guided state assumes the c11/c12 home cell for pose continuity + checkpoint-number stability); LIVE only in STATE_8 (explore). Range kept narrower than the c11/c12 sibling's [1,12] on purpose — this diamond's payload is the GROUPING arithmetic, not chemistry diversity; a tight range keeps every derived number legible."
      },
      "r": {
        "name": "internal resistance per cell",
        "unit": "Ω",
        "min": 0.1,
        "max": 1.0,
        "step": 0.1,
        "default": 0.5,
        "role": "slider — LOCKED to 0.5 on STATE_1–STATE_7; LIVE only in STATE_8. r.min = 0.1 (never 0) preserved from internal_resistance's finite-ceiling guarantee — with n or m up to 3, r_eq can get very small; r=0 would make a series r_eq=0 possible only if r itself were 0, which the slider forbids."
      },
      "R": {
        "name": "load resistance",
        "unit": "Ω",
        "min": 0.25,
        "max": 8,
        "step": 0.25,
        "default": 4,
        "role": "slider — LOCKED to 4 (the light-load baseline) on STATE_1/STATE_2/STATE_4/STATE_5; STATE_3 stays FIXED at 4 throughout (S3's cause is the SWITCH closing, not an R sweep); STATE_6 sweeps 4→0.25 then goes LIVE post-sweep (visible_controls: ['R'], internal_resistance S3 precedent); STATE_7 is driven by its own cycle_compare phase list (0.25 then 4, NOT teacher-draggable mid-cycle, live only after the cycle completes); LIVE in STATE_8."
      },
      "switch": {
        "name": "circuit switch (0=open, 1=closed)",
        "unit": "dimensionless (enum)",
        "min": 0,
        "max": 1,
        "step": 1,
        "default": 1,
        "role": "slider (2-state toggle), rendered as text Open/Closed never raw 0/1 (sibling convention). LOCKED closed(1) on STATE_1 (hook moves from t=0, no cue needed — Rule 31 'no static setup state'), LOCKED open(0) as the ENTRY pose on STATE_2/STATE_3/STATE_5 (defensive Rule 25d locks), LOCKED closed(1) as the entry pose on STATE_4/STATE_6 (continuation locks). LIVE only in STATE_8."
      },
      "cell_topology": {
        "name": "how the cells are joined",
        "unit": "enum",
        "enum": ["single", "series", "parallel"],
        "default": "single",
        "role": "NEW variable (source-side mirror of combination_of_resistors' cTopology). LOCKED per guided state (single: S1; series: S2–S4; parallel: S5–S6; S7 CYCLES series↔parallel on its own clock, not slider-driven mid-state); LIVE in STATE_8. Rendered as text, never a raw enum index."
      },
      "cell_count": {
        "name": "number of identical cells joined — reads as n (series) or m (parallel); irrelevant (=1) when topology=single",
        "unit": "count (discrete)",
        "min": 1,
        "max": 3,
        "step": 1,
        "default": 2,
        "role": "NEW variable. LOCKED to 1 on STATE_1, LOCKED to 2 on STATE_2–STATE_7 (every guided state is the two-cell case — 3-cell rendering is EXPLORE-ONLY). LIVE (1–3) only in STATE_8."
      },
      "flip_cell2": {
        "name": "polarity of cell 2 (0 = normal, 1 = reversed end-for-end)",
        "unit": "dimensionless (enum, boolean)",
        "min": 0,
        "max": 1,
        "step": 1,
        "default": 0,
        "role": "NEW variable (source-side `cell_polarity`). LOCKED 0 on every state EXCEPT STATE_4 (locked 1 AFTER the flip_cell one-shot fires). LOCKED 0 (RESTORED) as the declared S5 entry pose. LIVE in STATE_8, but ONLY MEANINGFUL when cell_topology='series' AND cell_count≥2 — see constraints block for the out-of-scope combination (flip × parallel)."
      }
    },
    "derived_readouts": {
      "eps_eq": {
        "name": "equivalent emf of the group",
        "unit": "V",
        "derived": "topology==='series' ? emf*(cell_count - 2*flip_cell2) : emf",
        "role": "SERIES: signed sum — cell_count identical +emf terms, minus 2*emf if cell 2 is flipped (one term flips sign, net change is −2×that term). PARALLEL or SINGLE: eps_eq = emf identically (the identical-cells idealization — see constraints). flip_cell2 has NO effect when topology≠series (see constraints, out-of-scope combination)."
      },
      "r_eq": {
        "name": "equivalent internal resistance of the group",
        "unit": "Ω",
        "derived": "topology==='series' ? cell_count*r : (topology==='parallel' ? r/cell_count : r)",
        "role": "SERIES: r_eq = n·r ALWAYS — independent of flip_cell2 (the S4 checkpoint: r_eq holds 1.0Ω through the flip). PARALLEL: r_eq = r/m (identical-cells idealization)."
      },
      "i": {
        "name": "loop current",
        "unit": "A",
        "derived": "switch===0 ? 0 : eps_eq/(R+r_eq)",
        "role": "the ammeter readout — single formula covers open/closed/series/parallel uniformly (open ⇒ i=0 by the switch guard, not a separate branch)."
      },
      "V_terminal": {
        "name": "terminal voltage",
        "unit": "V",
        "derived": "eps_eq - i*r_eq",
        "role": "the voltmeter readout. Collapses correctly to V_terminal = eps_eq when switch is open (i=0 there already), so ONE formula covers every state — no separate open-circuit branch needed (simpler than internal_resistance's 3-branch V_terminal, because this diamond never charges)."
      },
      "i_through_cell": {
        "name": "current actually flowing through ONE physical cell",
        "unit": "A",
        "derived": "topology==='parallel' ? i/cell_count : i",
        "role": "SERIES/SINGLE: every cell carries the full loop current i (one path). PARALLEL: each of cell_count branches carries i/cell_count — this is the S6 'share-the-load' number (1.5 A per branch at the checkpoint)."
      },
      "internal_step_per_cell": {
        "name": "ladder's internal (i·r) step height for ONE cell",
        "unit": "V",
        "derived": "i_through_cell * r",
        "role": "SERIES: each cell draws its own full-height step (S3: 0.30 V ×2). PARALLEL: each cell draws one HALF-HEIGHT step (S6: 0.75 V, shown once since both branches are identical and symmetric — engine may draw one representative step or overlay both, physics_author has no opinion on the render choice, only the number: 0.75 V)."
      },
      "i_ceiling_stack": {
        "name": "asymptotic series ceiling as n→∞ (explore-only, informational)",
        "unit": "A",
        "derived": "emf / r",
        "role": "EXPLORE HONESTY NUMBER (STATE_8 only) — the n→∞ limit of eps_eq/(R+r_eq)=n·emf/(R+n·r), independent of R (verified numerically: R's contribution → 0 relative to n·r for ANY fixed R>0, not merely a 'tiny R' special case)."
      },
      "i_ceiling_bank": {
        "name": "asymptotic parallel ceiling as m→∞ (explore-only, informational)",
        "unit": "A",
        "derived": "emf / R",
        "role": "EXPLORE HONESTY NUMBER (STATE_8 only) — the m→∞ limit of emf/(R+r/m), independent of r, for ANY fixed R>0."
      },
      "load_glow_normalized": {
        "name": "load-box brightness, display-only",
        "unit": "dimensionless [0,1]",
        "derived": "constrain((i*i*R) / 2.25, 0, 1)",
        "role": "K=2.25 W pinned to the guided arc's power CLIMAX (S6's heavy-load parallel reading: i=3.00A, R=0.25Ω → i²R = 2.25 W exactly — also S7's opening grid cell, same value). Mirrors internal_resistance's heat_normalized convention of pinning K to a taught ceiling state. CLAMPED at 1 for STATE_8 extremes — display-only, never a claimed absolute brightness scale (constraint #6)."
      }
    },
    "formulas": {
      "eps_eq": "topology==='series' ? emf*(cell_count - 2*flip_cell2) : emf",
      "r_eq": "topology==='series' ? cell_count*r : (topology==='parallel' ? r/cell_count : r)",
      "i": "switch===0 ? 0 : eps_eq/(R+r_eq)",
      "V_terminal": "eps_eq - i*r_eq",
      "i_through_cell": "topology==='parallel' ? i/cell_count : i",
      "internal_step_per_cell": "i_through_cell * r",
      "i_ceiling_stack": "emf / r",
      "i_ceiling_bank": "emf / R"
    },
    "computed_outputs": {
      "load_glow_normalized": { "formula": "constrain((i*i*R) / 2.25, 0, 1)" }
    },
    "constraints": [
      "IDENTICAL-CELLS IDEALIZATION: eps_eq(parallel) = ε and r_eq(parallel) = r/m are exact ONLY when every cell shares the same ε and r. The general unequal-cell parallel result — ε_eq = (ε₁r₂+ε₂r₁)/(r₁+r₂) — is genuine NCERT scope but is DEFERRED to the `unequal_parallel_cells` drill-down cluster, never asserted as exact for mismatched cells; the S6 formula surface carries an 'identical cells' rider for exactly this reason.",
      "SERIES r_eq = Σr ALWAYS, independent of polarity: flipping cell 2 changes eps_eq (via the signed sum) but NEVER changes r_eq — internal resistance is a scalar property of each cell's electrolyte/electrodes, not sensitive to which way current would flow through it. This is the exact invariant S4 exists to demonstrate (r_eq chip HOLDS 1.0Ω across the flip) and is verified algebraically: r_eq = n·r has no dependence on flip_cell2 in the formula above.",
      "EXPLORE HONESTY CEILINGS (STATE_8): as cell_count→∞ in series, i → ε/r for ANY FIXED R>0 — not merely 'on a tiny R' (verified numerically: n=1000 at R=0.25 gives i=2.9985A against a ceiling of exactly 3.0A regardless of R's value, since R's contribution to R+nr vanishes as n grows). As cell_count→∞ in parallel, i → ε/R for ANY FIXED R>0, most dramatically visible on a small (heavy) R but not restricted to it. These are UNREACHABLE asymptotes at cell_count≤3 (the honest slider ceiling) — S8 never actually reaches them, it only gestures toward them.",
      "REVERSED-PAIR DEAD ZERO IS A cell_count=2 RESULT, NOT A GENERAL 'any n' RESULT: eps_eq=0 exactly requires cell_count=2 with flip_cell2=1 (ε−ε=0). At cell_count=3 with flip_cell2=1, eps_eq = ε·(3−2) = ε (one net cell's worth, NOT zero) — verified numerically (eps_eq=1.5V, r_eq=1.5Ω, i=0.857A at R=0.25, a live nonzero circuit). STATE_8's explore-honesty note should say 'dead zero at cell_count=2; at cell_count=3 one cell's worth of ε survives, r_eq stays 3r' rather than implying the zero generalizes to any n.",
      "flip_cell2 IS SCOPED TO SERIES: combining flip_cell2=1 with cell_topology='parallel' is OUT OF SCOPE for this diamond (an unequal-and-opposite parallel pair produces inter-cell circulating current — exactly the deferred `unequal_parallel_cells` territory). STATE_8's default view should never present this combination; if the slider UI technically allows it, the formulas above simply hold eps_eq=ε (parallel branch ignores flip_cell2 by the ternary), which is a defensible SIMPLIFICATION but should not be narrated or highlighted as a taught result.",
      "load_glow_normalized is DISPLAY-ONLY: it is a brightness-scale normalization (K=2.25W pinned to the S6/S7 climax reading), never a claim about actual absolute wattage shown to the student — no on-canvas number should present '2.25' as anything but the internal normalization constant (never surfaced in narration or HUD).",
      "i ≥ 0 always across every guided state (no charging branch exists in this diamond, unlike internal_resistance's S6) — the formula i = eps_eq/(R+r_eq) with switch guard never goes negative for any of the declared entry poses or the S4 flip (which lands at exactly i=0, not negative)."
    ]
  }
}
```

---

## 2. Per-state variable notes (`variable_overrides` + entry-pose locks)

Every state declares its FULL variable set explicitly, not just the deltas, so a teacher jumping directly to any state via the reorderable rail (Rule 25d) never inherits a stray value from whatever state was visited before.

| State | `variable_overrides` (locked at entry, before any in-state cue fires) | Justification |
|---|---|---|
| **S1** | `{ emf: 1.5, r: 0.5, R: 4, switch: 1, cell_topology: "single", cell_count: 1, flip_cell2: 0 }` | Hook moves from t=0 (Rule 31 — no static setup); switch is closed from the first frame, no open→close cue exists on this state. |
| **S2** | `{ emf: 1.5, r: 0.5, R: 4, switch: 0, cell_topology: "single", cell_count: 1, flip_cell2: 0 }` (pre-dock) → after `dock_cell` fires, engine transitions live state to `cell_topology: "series", cell_count: 2` | Declared skeleton pose lock: "STATE_2 opens with switch OPEN + a single cell (1.50 V)." R stays 4 (irrelevant while open) but locked anyway per bug #1 discipline. |
| **S3** | `{ emf: 1.5, r: 0.5, R: 4, switch: 0, cell_topology: "series", cell_count: 2, flip_cell2: 0 }` (pre-close) → after switch-close cue, `switch: 1` | NEW defensive lock (Rule 25d discipline): S3's OWN cause is "the switch closes," which only reads correctly if S3's entry pose is independently switch=OPEN with the series pair ALREADY docked (3.00 V showing) — a teacher landing on S3 cold must see this, not just a teacher who came from S2. |
| **S4** | `{ emf: 1.5, r: 0.5, R: 4, switch: 1, cell_topology: "series", cell_count: 2, flip_cell2: 0 }` (pre-flip, current already flowing at 0.60 A) → after `flip_cell` cue, `flip_cell2: 1` | NEW defensive lock: S4's cause is "cell 2 physically flips" — the entry pose must independently show the closed-switch, flowing (0.60 A), non-flipped series pair, so a cold-landed teacher sees the SAME "before" picture S3 ended on, not an assumed carry-over. |
| **S5** | `{ emf: 1.5, r: 0.5, R: 4, switch: 0, cell_topology: "series", cell_count: 2, flip_cell2: 0 }` (pre-regroup) → after `regroup` cue, `cell_topology: "parallel"` | Declared skeleton pose lock: "STATE_5 opens with polarity RESTORED + switch OPEN + cells still in the series line (reading 3.00 V)." `flip_cell2: 0` is the explicit "restored" instruction. |
| **S6** | `{ emf: 1.5, r: 0.5, R: 4, switch: 1, cell_topology: "parallel", cell_count: 2, flip_cell2: 0 }` (pre-sweep) → `R_autosweep_down: true, R_autosweep_to: 0.25` fires | NEW defensive lock: switch must be CLOSED at S6 entry (S5 ended OPEN) — this is a silent pose-lock change, not an animated cause (Rule 32 allows this: entry-pose changes between states are declared pose locks, not mid-state motion). The VISIBLE cause in S6 is the R sweep only. |
| **S7** | `{ emf: 1.5, r: 0.5, R: 0.25, switch: 1, cell_topology: "parallel", cell_count: 2, flip_cell2: 0 }` | Inherits S6's settled end-pose (parallel, R=0.25, i=3.00A) as its OWN independently-declared entry lock — S7's cycle then plays from here. |
| **S8** | `{ emf: 1.5, r: 0.5, R: 4, switch: 1, cell_topology: "series", cell_count: 2, flip_cell2: 0 }` — all then LIVE | Sensible, familiar starting point for explore (the light-load series baseline the arc spent 3 states building), not an arbitrary default. |

---

## 3. Within-state motion timeline + per-state control spec

**One-shot timing table:**

| one-shot | state | start_ms | duration_ms | mechanical settle | +effect lag | total settle | pfRevealMs status |
|---|---|---|---|---|---|---|---|
| `dock_cell` | S2 | 300 | 600 | 900 | +400 (ladder grow + voltmeter glide) | **1300 ms** | under 1500 floor — no new registration needed |
| (switch close) | S3 | 300 | 600 | 900 | +400 (bead densify + ladder toll compose) | **1300 ms** | under 1500 floor — no new registration needed |
| `flip_cell` | S4 | 300 | 500 | 800 | +400 (ladder invert + freeze) | **1200 ms** | under 1500 floor — no new registration needed |
| `regroup` | S5 | 300 | 700 | 1000 | +300 (voltmeter settle-and-hold) | **1300 ms** | under 1500 floor — no new registration needed |
| `R_autosweep_down`/`_to` | S6 | 700 (REUSED) | 3200 (REUSED) | 3900 | +400 | **4300 ms** | ALREADY registered generically (`R_autosweep_down===true`) — reuse the flag name verbatim, zero new work |
| `cycle_compare` (3-phase) | S7 | phase1 (topology→series) 1000/dur 500; phase2 (R→4) 2500/dur 600; phase3 (topology→parallel) 4200/dur 500 | — | ~4700 | +grid compose stagger ~300 each | **~5400 ms** | **NEW registration required** — flag `state.cycle_compare===true → maxMs=max(maxMs, cycle_compare_settle_ms??5400 + 400)`, mirrors `bridge_r_sweep`/`jockey_sweep` exactly. Route to `peter_parker:renderer_primitives` via quality_auditor FAIL. |

### S1 — flow-along-path (continuous, no cue)

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0 → continuous | sparse bead stream circulates the loop at a pace set by i=0.333A; ammeter/voltmeter already settled (0.33A / 1.33V); ladder shows ONE climb (1.5V) → ONE small internal step (0.167V) → external drop (1.333V) | `i`, `V_terminal` (both constant, pure fn of locked defaults) | none |

**Narration (text_en, glow_focal `ladder`):**
1. *(glow: ladder)* "Home cell: emf epsilon one point five volts, internal resistance r half an ohm, driving a four ohm load — switch already closed." (22w)
2. *(glow: electrons)* "Current i settles at a weak zero point three three amps — one cell alone barely pushes this load." (18w)

**Total: 40 words.**

### S2 — reveal-build

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0 → 300ms | entry-pose hold: single cell, switch open, voltmeter steady at 1.50V | locked pose | none |
| 300 → 900ms | **CAUSE**: cell 2 slides in nose-to-tail (`dock_cell`) | one-shot clock | none |
| 900 → 1300ms | **EFFECT** (readable ~600ms gap, Rule 32a): ladder grows a 2nd climb; voltmeter glides 1.50→3.00V; `ε_eq = 3.0 V` chip composes, timed to land on the sentence that first says "three volts" | `eps_eq` (topology flips to series at dock completion) | none |

**Narration (glow_focal `cells`):**
1. *(glow: voltmeter)* "Switch open, one cell alone reads one point five volts on the voltmeter." (12w)
2. *(glow: cells)* "A second identical cell docks in, nose to tail — in series, e-m-fs simply add." (14w)
3. *(glow: ladder)* "The ladder grows a second climb, and the voltmeter glides from one point five to three volts — the equivalent epsilon is epsilon-one plus epsilon-two." (24w)

**Total: 50 words.** Sentence 2 carries the required planting-prevention scoping ("in series") verbatim in intent.

### S3 — densify/rarefy

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0 → 300ms | entry-pose hold: series pair, switch open, 3.00V steady | locked pose | none |
| 300 → 900ms | **CAUSE**: switch closes (only variable that changes) | one-shot clock | none |
| 900 → 1300ms | **EFFECT**: beads visibly densify 0→0.60A; ladder composes TWO 0.30V internal steps + 2.40V external drop (audit closes at 3.00); `r_eq = 1.0 Ω` chip and compare chip `one cell gave 0.33 A` land timed to their naming sentence | `i`, `r_eq`, `internal_step_per_cell` | none |

**Narration (glow_focal `r_internal`):**
1. *(glow: switch)* "Close the switch: each cell adds its own internal resistance r, so r-equivalent is one ohm — current i climbs to zero point six amps, nearly double one cell's rate against this light load." (33w)
2. *(glow: r_internal)* "The ladder confirms it: two zero point three volt steps plus a two point four volt drop make the full three volts." (22w)

**Total: 55 words.** Carries the required "against this light load" scoping clause verbatim.

### S4 — rotate/flip

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0 → 300ms | entry-pose hold: series pair, switch closed, current flowing 0.60A (inherited-continuation lock) | locked pose | none |
| 300 → 800ms | **CAUSE**: cell 2 flips end-for-end (`flip_cell`) | one-shot clock | none |
| 800 → 1200ms | **EFFECT**: ladder's 2nd climb inverts to a descent; beads freeze mid-wire; ammeter/voltmeter die to 0.00; `r_eq` chip explicitly HOLDS `1.0 Ω` (unchanged — the visual proof) | `eps_eq→0`, `r_eq` unchanged | none |

**Narration (glow_focal `cells`, `misconception_watch` #1):**
1. *(glow: cells)* "Watch cell two flip end-for-end: its emf now subtracts, so epsilon-equivalent falls to zero — epsilon-one minus epsilon-two." (17w)
2. *(glow: ladder)* "The ladder's climb inverts into a descent, beads freeze, and current i and voltage V both die to zero." (19w)
3. *(glow: r_internal)* "Yet both r's are still in the loop — r-equivalent still holds one ohm: a dead circuit, two live cells." (19w)

**Total: 55 words.**

### S5 — null-result-hold

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0 → 300ms | entry-pose hold: polarity restored, switch open, series line reading 3.00V | locked pose | none |
| 300 → 1000ms | **CAUSE**: cells slide from the line into a side-by-side bank (`regroup`) | one-shot clock | none |
| 1000 → 1300ms | **EFFECT**: voltmeter glides 3.00→1.50V and HOLDS (the non-rise IS the effect); ghost chip `series read 3.00 V` composes | `eps_eq` (parallel, identical cells → ε) | none |

**Narration (glow_focal `voltmeter`, `misconception_watch` #2):**
1. *(glow: cells)* "Polarity restored, switch open, still in series: the voltmeter reads three volts." (12w)
2. *(glow: cells)* "Now watch the same two cells regroup side by side, into a parallel bank." (14w)
3. *(glow: voltmeter)* "The voltmeter glides back down to one point five volts and holds — two cells, one cell's voltage: epsilon-equivalent is just epsilon." (21w)

**Total: 47 words.**

### S6 — share-the-load (coinage, per architect §3)

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0 → 700ms | entry-pose hold: parallel bank, switch closed, R at its sweep start (4Ω, i≈0.353A settled) | locked pose | none |
| 700 → 3900ms | **CAUSE**: `R_autosweep_down` 4→0.25Ω (REUSED mechanism) | one-shot clock | R (post-sweep) |
| continuous through sweep | **EFFECT tracks CAUSE live** (not a separate lagged beat — current is a direct fn of R at every instant, matching internal_resistance's droop precedent): total current climbs 0.35→3.00A; bead stream visibly SPLITS into two branches, each settling at 1.5A; ladder keeps ONE half-height internal step, settling at 0.75V; compare chip `one cell alone: 2.0 A` and `r_eq = r/2` chip land timed to naming | `i`, `i_through_cell`, `r_eq` | R (visible_controls, teacher-seizable post-sweep — internal_resistance S3 precedent) |

**Narration (glow_focal `ammeter`, fallback `ladder` if the NEW key isn't landed yet):**
1. *(glow: load)* "Load R shrinks from four ohms to a heavy zero point two five — current i climbs to three amps as the stream splits, each cell carrying one point five amps." (30w)
2. *(glow: r_internal)* "Sharing halves the internal toll: r-equivalent is r over two, one half-height step of zero point seven five volts — well past one cell's two amps." (25w)

**Total: 55 words.**

### S7 — cycle-compare (declared 32b exemption: sequential single changes)

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0 → 300ms | entry-pose settle: parallel bank, R=0.25Ω, i=3.00A (inherited from S6's end); grid cell 1 `parallel @ 0.25 Ω: 3.00 A` composes | locked pose | none |
| 1000 → 1500ms | **PHASE 1 CAUSE**: topology toggles parallel→series (R stays 0.25Ω) | one-shot clock | none |
| 1500 → 1800ms | **PHASE 1 EFFECT**: ammeter FALLS 3.00→2.40A; grid cell 2 `series @ 0.25 Ω: 2.40 A` composes | `eps_eq`, `r_eq` recompute on topology flip | none |
| 2500 → 3100ms | **PHASE 2 CAUSE**: R jumps 0.25→4Ω (topology stays series) | one-shot clock | none |
| 3100 → 3400ms | **PHASE 2 EFFECT**: ammeter reads 0.60A; grid cell 3 `series @ 4 Ω: 0.60 A` composes | `i` recompute on R | none |
| 4200 → 4700ms | **PHASE 3 CAUSE**: topology toggles series→parallel (R stays 4Ω) | one-shot clock | none |
| 4700 → 5000ms | **PHASE 3 EFFECT**: ammeter falls 0.60→0.35A; grid cell 4 `parallel @ 4 Ω: 0.35 A` composes; the WINNING cell of each load-column brightens | `i` recompute on topology | none |
| post-cycle | — | — | topology toggle (live, teacher-seizable) |

**Narration (glow_focal `formula`, `misconception_watch` #3, PRIMARY aha state):**
1. *(glow: formula)* "On the heavy load, series LOSES to parallel — three amps falls to two point four when you stack. On the light load, series WINS — zero point six beats zero point three five." (32w)
2. *(glow: formula)* "Same two cells, opposite verdicts: you don't add cells for more current — you match series or parallel to the load, R against r." (23w)

**Total: 55 words.**

### S8 — drag-sandbox

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| continuous, forever (Rule 37 player invariant) | all beads/ladder/meters/chips/compare-line track every slider drag live | ALL variables | `cell_topology`, `cell_count`, `flip_cell2`, `emf`, `r`, `R`, `switch` — ALL (`show_sliders: true`) |

**Narration:** none — 0/open (`interaction_complete`), per Rule 31 explore-last.

---

## 4. Board-mode mark scheme — SKIPPED (Rule 20 [D])

Conceptual-only directive is active. No board content drafted for this concept.

---

## 5. Drill-down cluster phrasings (authored-not-applied; 5 real student-voice phrases each)

**`parallel_cells_voltage_confusion`** (→ S5/S6):
- "why doesnt the voltage go up when I add a second battery side by side"
- "two batteries in parallel still show only one batterys voltage, why"
- "shouldnt more cells always mean more volts"
- "I connected two cells side by side and the reading didnt change, is my circuit wrong"
- "why does series double the voltage but parallel doesnt"

**`more_cells_less_current`** (→ S7):
- "I added an extra cell in series and my motor got weaker, how"
- "more batteries but the bulb is not any brighter, why"
- "why did the current go down when I added a cell in series on a low resistance load"
- "isnt more cells always more current"
- "adding a cell made things worse, that doesnt make sense"

**`reversed_cell_bookkeeping`** (→ S4):
- "one of my cells is in backwards, do I just ignore it"
- "if two cells cancel out does their resistance also disappear"
- "why is the current zero but the cells are still fresh"
- "does a reversed cell still use up energy even though nothing flows"
- "how can two working batteries make a dead circuit"

**`unequal_parallel_cells`** (→ S6, deferred general NCERT case):
- "two different cells in parallel, what voltage do I even use"
- "does current flow between the two cells even with nothing else connected"
- "if one cell is stronger will it just recharge the weaker one"
- "whats the emf of the pack when the two cells arent the same"
- "can two unequal cells in parallel damage each other"

---

## 6. Constraint callouts (special-case algebra for json_author)

1. **No angle conversions needed** — this is a 2D circuit concept, no `radians()` calls anywhere.
2. **`switch`, `cell_topology`, `flip_cell2` are enums, never raw numbers on-canvas** — render `switch` as Open/Closed (sibling convention), `cell_topology` as the words single/series/parallel, `flip_cell2` never shown as a number at all (it's expressed entirely through the visual: which way the cell is drawn).
3. **`cell_count` is a discrete step-1 slider {1,2,3}, not a continuous range** — every guided state locks it to exactly 1 or 2; only S8 exposes the 3-cell case.
4. **R never autosweeps in S3** — S3's ONLY variable is `switch` (confirmed by re-deriving the architect's own control-table language). Do not wire an `R_autosweep_down` flag onto S3 — that would be a silent physics bug (S3's teaching point is "switch closes, current densifies at FIXED R=4Ω," not an R sweep).
5. **S6 reuses `R_autosweep_down`/`R_autosweep_to` verbatim** (values: start_ms 700, duration_ms 3200, `R_autosweep_to: 0.25`) — same flag NAME as `internal_resistance.json` STATE_3, so it inherits the existing `pfRevealMs` registration with zero new engine work. Do not rename it.
6. **S7's `cycle_compare` needs a NEW engine flag + a NEW `pfRevealMs` entry** (does not exist yet) — author it as `cycle_compare: true, cycle_compare_settle_ms: 5400` plus per-phase `*_start_ms`/`*_duration_ms` fields per §3's table; this is routed via quality_auditor FAIL to `peter_parker:renderer_primitives`, never built by json_author directly.
7. **`load_glow_normalized`'s K=2.25 is a display constant, never surfaced as text** — do not print "2.25" anywhere on-canvas; it exists only inside the glow-brightness formula.
8. **`flip_cell2` × `cell_topology='parallel'` is an unauthored combination** — if S8's UI technically permits dragging both, the formula falls back safely to `eps_eq=ε` (parallel branch ignores the flag), but no narration, chip, or caption should present this state as a taught result — it silently degrades to "flip toggle has no visible effect in parallel," which is honest but not pedagogically highlighted.
9. **`i_ceiling_stack`/`i_ceiling_bank` are STATE_8-only informational readouts**, never given a fixed on-canvas position in S1–S7 (they don't exist as concepts until the explore state).

---

## Numeric verification appendix (all recomputed from `i = ε_eq/(R+r_eq)`, cross-checked in Python)

| Checkpoint (skeleton claim) | Recomputed | Verdict |
|---|---|---|
| S1: i=0.33A | 1.5/4.5 = 0.3333A | ✓ exact |
| S2: open-circuit 1.50→3.00V | ε_eq=1.5+1.5=3.0V | ✓ exact |
| S3 ladder audit: 3.00 = 0.30+0.30+2.40 | i=3.0/5.0=0.6A; i·r=0.30V×2; i·R=2.4V; sum=3.00 | ✓ exact |
| S4: ε_eq=0, i=0, r_eq=1.0Ω | ε_eq=1.5−1.5=0; r_eq=0.5+0.5=1.0Ω | ✓ exact |
| S5: open-circuit 1.50V | ε_eq(parallel, identical)=ε=1.5V | ✓ exact |
| S6: i=3.00A, per-branch 1.50A, internal step 0.75V, V_term=0.75V | i=1.5/0.5=3.0A; i/2=1.5A; i·(r/2)=0.75V; V=1.5−0.75=0.75V | ✓ exact |
| S6 start (R=4Ω): compare "one cell alone: 2.0A" — this is the SINGLE-cell current AT THE HEAVY LOAD (R=0.25), not at S6's sweep-start R | single@0.25Ω = 1.5/0.75=2.0A | ✓ exact — confirms this chip's semantics |
| S7 grid: 3.00/2.40/0.60/0.35 | series@0.25=2.4A, parallel@0.25=3.0A, series@4=0.6A, parallel@4=0.3529A | ✓ all exact |
| Crossover at R=r=0.5Ω → 2.00A both ways | series: 3.0/1.5=2.0A; parallel: 1.5/0.75=2.0A | ✓ exact, generalizes algebraically for ANY ε (crossover is exactly at R=r for the identical-2-cell case, independent of ε) |
| Explore ceilings n→∞⇒ε/r, m→∞⇒ε/R | numerically confirmed monotonic convergence (n=1000 → 2.9985A vs ceiling 3.0A; m=1000 → 0.37495A vs ceiling 0.375A) | ✓ confirmed, and independent of R/r respectively (not "tiny-R-only" as skeleton phrased it) |
| Assessment stems (q-series, q-reversed, q-parallel-V, q-choice, q-ceiling) | all re-derived independently | ✓ all physically correct, good distractor rationale (q-parallel-V's 6V distractor is a real series/parallel confusion, not a random wrong number) |

**Aha statement (≤15 words):** kept the skeleton's draft verbatim — *"More cells isn't more current — match series or parallel to the load."* (12 words) — physically verified true against the S7 checkpoint numbers (series loses on the heavy load: 2.40 < 3.00; parallel barely helps on the light load: 0.35 vs 0.33).

## Assessment (6 questions, backward-designed)

1. **q-series**: "Three cells, each 2 V and 1 Ω, in series across 9 Ω — find ε_eq, r_eq, i." (→ S2/S3) Answer: ε_eq=6V, r_eq=3Ω, i=0.5A.
2. **q-reversed**: "One of those three is reversed — new ε_eq, and does r_eq change?" (→ S4) Answer: ε_eq=2V (6-2×2), r_eq still 3Ω.
3. **q-parallel-V**: "Four identical 1.5 V cells in parallel: open-circuit voltage?" (→ S5) Answer: 1.5V (distractor 6V tests the series-overgeneralization).
4. **q-parallel-i**: heavy-load current with r/m (→ S6).
5. **q-choice**: "ε = 1.5 V, r = 0.5 Ω cells, load 0.1 Ω vs load 10 Ω — which grouping for each, why?" (→ S7, the aha question).
6. **q-ceiling**: "No matter how many cells you stack in series across a near-zero resistance, the current can never exceed…?" (→ S7/S8 conceptual) Answer: ε/r.

`coverage_map.by_state`: S1 baseline V=ε−ir usage; S2/S3/S4 series trio; S5/S6 parallel pair; S7 the decision; `non_assessed`: S8.
`misconception_watch` at STATE_4 + STATE_5 + STATE_7 ONLY.

## Self-review checklist

- [x] Every symbol in the skeleton's state narratives (ε, r, R, switch, i, V, r_eq, ε_eq, n/m/cell_count, flip) appears in `variables`/`derived_readouts`.
- [x] No angle formulas exist — N/A for `radians()`.
- [x] Live controls per state match the architect's table exactly (none on S1–S5/S7-precycle; R post-sweep on S6; topology post-cycle on S7; ALL on S8).
- [x] `variable_overrides` documented for all 8 states, including 2 NEW defensive locks (S3, S4, S6) beyond the skeleton's explicitly-named S2/S5 — each justified.
- [x] Board mark scheme: SKIPPED per Rule 20.
- [x] Drill-down phrasings: 20 total (5×4), real student voice, plain English, no Hinglish.
- [x] Constraints block: 7 assertions — justified, this concept has more genuine edge cases than most.
- [x] Numerical sanity check: full checkpoint chain re-derived from first principles + cross-checked in Python — 100% match to skeleton's claims, with two precision tightenings flagged (n→∞ ceiling is R-independent, not "tiny-R-only"; the flip-cell dead-zero is an n=2-specific result, not "any n").
- [x] Within-state motion timeline: written for all 8 states, every branch a pure fn of the state clock, no two states share a motion, no static state, controls match architect table.
- [x] Rule 32 sequencing: verified per state — every cause window precedes its effect window by ≥300–600ms (S6 is the declared exception per its own continuous-tracking physics, matching internal_resistance's droop precedent).
- [x] Word budget: S1=40, S2=50, S3=55, S4=55, S5=47, S6=55, S7=55 — all within [25,55].
- [x] Engine bug queue: consulted via direct code read of `deriveStateMeta.ts` (SQL unavailable); every relevant prevention rule satisfied; one new exception self-flagged (S7 cycle_compare has no shipped precedent) and routed to quality_auditor.
- [x] DC Pandey check: not consulted beyond what the architect already scoped. All formulas derived from first principles (V=ε−ir, series/parallel resistance composition) and verified numerically — zero content imported.

## Flags to downstream

- **To json_author:** shape per `internal_resistance.json` convention (scenario_type reuse `internal_resistance` + gated per-state flags); the S3-never-autosweeps and S6-reuses-exact-flag-names constraints (§6 items 4/5) are load-bearing — do not conflate them. New engine flags needed: `cell_topology`, `cell_count`, `flip_cell2`, `dock_cell`, `flip_cell`, `regroup`, `cycle_compare` (+ phase fields), glow keys `cells`/`ammeter`.
- **To quality_auditor:** please re-run the live `engine_bug_queue` SQL (code-read access only, not DB access, this dispatch). Verify S7's `cycle_compare` mechanism gets routed to `peter_parker:renderer_primitives` — it is the one component in this physics block with zero shipped precedent (bridge/jockey sweeps are single-phase; this is 3-phase). Also verify the two constraint-tightenings (n→∞ ceiling, n=2-specific dead zero) don't need architect re-sign-off — judged as precision corrections within physics_author's normal authority, not scope changes.

**Files referenced (no edits made — physics_author is markdown-only):**
- `C:\Tutor\physics-mind\docs\superpowers\plans\artifacts\combination_of_cells-architect.md`
- `C:\Tutor\physics-mind\src\data\concepts\emf_definition.json`
- `C:\Tutor\physics-mind\src\data\concepts\internal_resistance.json`
- `C:\Tutor\physics-mind\src\data\concepts\wheatstone_bridge.json` (one-shot timing precedent, lines ~737–777)
- `C:\Tutor\physics-mind\src\data\concepts\combination_of_resistors.json` (S9 paired-compare formula_overlay precedent)
- `C:\Tutor\physics-mind\src\lib\validators\visual\deriveStateMeta.ts` (lines 442–525, `pfRevealMs`/`DEFAULT_REVEAL_MS` mechanics)
