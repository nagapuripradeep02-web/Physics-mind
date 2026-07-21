# PHYSICS BLOCK — `capacitance`

> Companion to `capacitance_skeleton.md`. Produced by physics-author, 2026-07-21.
> All locked numbers in the skeleton were VERIFIED by direct calculation — no physics errors found.

## 0. Numerical verification (all confirmed)

ε₀ = 8.854×10⁻¹² F/m exactly:

| State | A (m²) | d (m) | V | C | Q |
|---|---|---|---|---|---|
| default | 0.01 | 0.001 | 12 | 88.54 pF → **88.5 pF** ✓ | 1.06248 nC → **1.06 nC** ✓ |
| S2 step | 0.01 | 0.001 | 6 | 88.54 pF | **0.53 nC** ✓ |
| S2 step | 0.01 | 0.001 | 24 | 88.54 pF | **2.12 nC** ✓ |
| ratio | — | — | — | — | Q/V = **0.0885 nC/V** ✓ |
| S4 | 0.02 | 0.001 | 12 | **177 pF** ✓ | **2.12 nC** ✓ |
| S5 | 0.01 | 0.002 | 12 | **44.3 pF** ✓ | **0.53 nC** ✓ |

S6 chain at defaults: σ = Q/A = 1.06248×10⁻⁷ C/m² ✓ · E = σ/ε₀ = **12000.000 V/m** ✓ exact · V = E·d = **12.000 V** ✓ closes exactly. Note: σ/ε₀ ≡ V/d algebraically given C = ε₀A/d, so the chain closes exactly at **any** state's values, not only the default.

**Notation-ladder confirmation (guideline 2):** every formula used anywhere in this concept (C=Q/V, C=ε₀A/d, Q=CV, σ=Q/A, E=σ/ε₀, V=E·d, and "slope" as rise/run) is pure algebra. No derivative, integral, or vector operator is needed at any depth ring, including the S6 `advanced` tail. The skeleton's friction-report item 2 is confirmed: capacitance is the easy case, and the ladder's real stress test comes at RC/Gauss-route siblings.

## 0a. Live engine_bug_queue consultation

Queried the LIVE table (not the mirror) for `alex:physics_author`, `alex:json_author`, and open `field_3d` rows. Rules this block satisfies:

- **`DUALPANEL_EQUATION_INCOHERENT`** (CRITICAL) — the graph trace is literally `Q = C(A,d)·V` using the shared C formula, so it re-slopes live whenever A or d moves.
- **`DUALPANEL_RANGE_OFF`** / **`DUALPANEL_LIVEDOT_OFF_GRAPH`** (MAJOR) — the Q-axis must dynamically rescale once A/d go live (see flag 1 in §8).
- **`teach_reveal_synced_to_narration`** / **`teach_show_quantity_live_when_named`** — built into every t-window in §4.
- **`teach_color_each_element_by_its_own_sign`** — carried into the dot-pool spec.
- **`guided_state_overruns_pacing_target`** / **`field3d_state_duration_field_clamps_eye_capture_window`** — authored `duration` must be ≥ the real ms totals in §4, not a word-count estimate.
- **`missing_visible_element_frozen_tail`** — every `scene_composition` annotation id needs a matching `visible_elements` entry.

## 1. Variables

```json
"variables": {
  "V": { "name": "Potential difference (voltage) across the plates", "unit": "V",
         "min": 0, "max": 24, "default": 12, "step": 1, "role": "driver",
         "ui_label_first_appearance": "Voltage V (p.d.)", "ui_label_subsequent": "V" },
  "A": { "name": "Plate area (each plate)", "unit": "m^2",
         "min": 0.005, "max": 0.025, "default": 0.01, "step": 0.001, "role": "driver",
         "ui_label": "Plate area A" },
  "d": { "name": "Plate separation", "unit": "m",
         "min": 0.0005, "max": 0.0025, "default": 0.001, "step": 0.0001, "role": "driver",
         "ui_label": "Separation d",
         "display_note": "on-canvas ruler + narration show d_mm = d*1000, NEVER raw metres" },
  "epsilon0": { "name": "Permittivity of free space", "unit": "C^2/(N*m^2)", "constant": 8.854e-12 },
  "C": { "name": "Capacitance", "unit": "F", "derived": "epsilon0 * A / d" },
  "Q": { "name": "Charge stored on ONE plate", "unit": "C", "derived": "C * V" },
  "sigma": { "name": "Surface charge density (S6 chain only)", "unit": "C/m^2", "derived": "Q / A" },
  "E": { "name": "Field between plates via the sheet route (S6 chain only)", "unit": "V/m", "derived": "sigma / epsilon0" }
}
```

**Range design note (FLAG — do not mirror the sibling):** `parallel_plate_capacitor_field` uses a wide `d: 0.001–0.1`, but it has only ONE live geometry variable. This concept has **two simultaneous live geometry variables (A and d) in S7**, and C = ε₀A/d is their product/ratio — a naive wide range on both compounds into a ~500× swing in C, crossing pF into nF and forcing a unit-switching HUD. A and d are therefore sized to **0.5×–2.5× default**, which contains S4's target (A=0.02, exactly 2×) and S5's (d=0.002, exactly 2×) with headroom; worst case (A=0.025, d=0.0005, V=24) tops out at **C≈442.7 pF, Q≈10.6 nC** — single-unit, no sci-notation. V is capped at 24 because that is the ceiling S2/S3 already teach exhaustively.

## 2. Formulas

```json
"formulas": {
  "capacitance_definition": "C = Q / V",
  "capacitance_geometry":   "C = epsilon0 * A / d",
  "charge_from_CV":         "Q = C * V",
  "sigma_from_Q":           "sigma = Q / A",
  "E_from_sigma":           "E = sigma / epsilon0",
  "V_from_Ed":              "V = E * d",
  "graph_trace_QV":         "Q = C * V   // MUST reference the SAME live C — never a hardcoded slope",
  "graph_trace_VQ_toggled": "V = Q / C   // S7 axis-swap toggle; same C"
}
```

**Display / precision conventions** (legibility only, Rule 34c — physics unchanged):

```json
"computed_outputs": {
  "C_pF":            "(C*1e12) < 100 ? (C*1e12).toFixed(1) : (C*1e12).toFixed(0)",
  "Q_nC":            "(Q*1e9).toFixed(2)",
  "ratio_nC_per_V":  "(C*1e9).toFixed(4)   // S2 only — 0.0885, deliberately not pF",
  "sigma_nC_per_m2": "(sigma*1e9).toFixed(1)  // '106.2 nC/m²' not '1.06e-7 C/m²'",
  "E_display_Vpm":   "E.toFixed(0)            // '12000 V/m' not '1.2e4'",
  "d_mm":            "(d*1000).toFixed(1)",
  "dot_count":       "Math.round(Q_nC / 0.1)  // one dot per 0.1 nC — legible sprite counts",
  "graph_Q_axis_max":"1.1 * C * V_slider_max  // RECOMPUTE whenever A or d changes"
}
```

**Constraints:**

1. `Q = C·V` is exact at every instant — never an approximation.
2. `C = ε₀A/d` is fixed by geometry alone; a property of the device, not of the charge or voltage on it (the PRIMARY aha).
3. The ratio Q/V is numerically identical to C at every V — demonstrated, never asserted without the live readout backing it.
4. While the battery stays connected, **V is HELD FIXED by the source**; Q is the dependent quantity that follows geometry changes (the S4/S5 guard).
5. No charge crosses the gap — one plate accumulates +Q, the other −Q; conduction current flows only in the external wires.
6. The isolated-capacitor case (battery disconnected, Q fixed instead of V) is **NOT taught here and must never be visually implied**; it is confined to the `fixed_v_vs_fixed_q` drill-down cluster, narration-only.
7. σ = Q/A, E = σ/ε₀, V = E·d stay algebraically consistent with C = ε₀A/d at every state — the S6 chain closes numerically at whatever A, d, V the state shows.

## 3. Per-state variable overrides

```
S1 charge_and_hold:       { A: 0.01, d: 0.001, V: 12 }   // home pose; locks the narrated 1.06 nC
S2 the_frozen_ratio:      { A: 0.01, d: 0.001, V: 6 }    // ENTRY only — 12/24/12 are scripted cue events
S3 name_the_slope:        { A: 0.01, d: 0.001, V: 0 }    // sweep starts at the origin
S4 more_area_more_charge: { A: 0.01, d: 0.001, V: 12 }   // A morphs 0.01→0.02
S5 the_gap_paradox:       { A: 0.01, d: 0.001, V: 12 }   // d morphs 0.001→0.002
S6 why_epsilon_a_over_d:  { A: 0.01, d: 0.001, V: 12 }   // nothing moves; locks σ=106.2 nC/m², E=12000 V/m
S7 capacitance_sandbox:   (defaults; all three then live)
```

## 4. Within-state reveal timeline (concrete ms)

**S1 `charge_and_hold`** — ~18000 ms: 0–1500 home hold (switch open) · **1500** switch closes (cause) · 1500–2200 beads stream along wires · **~2200** (0.7 s beat) ± dots begin accumulating, field lines intensify with Q · 2200–9000 pools grow, HUD Q climbs · **9000** beads visibly stop at the plate faces, gap bead-free · 9000–11000 flow → zero · **11000** HUD settles `Q = 1.06 nC` · hold to 18000.

**S2 `the_frozen_ratio`** — ~15000 ms: 0–1000 hold at V=6 · **1000** V 6→12 (~800 ms) · **~1800** (beat) beads in, pool grows, Q → 1.06 nC · 1800–3500 settle · **3500** V 12→24 · **~4300** Q → 2.12 nC · 4300–6000 settle · **6000** V 24→12 · **~6800** beads flow BACKWARD, pool shrinks, Q → 1.06 nC · 6800–8500 settle · throughout, `ratio_readout` is the single glow focal and never changes value · hold to 15000.

**S3 `name_the_slope`** — ~15000 ms: 0–800 camera pans right, graph docks (V=0, dot at origin) · **800** auto-sweep begins · 800–5300 V climbs 0→24, ~600–800 ms trailing beat, beads/pool/HUD track live, trace draws a straight line from the origin · **5300** V=24 (Q=2.12 nC) · 5300–6000 `slope = C` tag docks · 6000–6800 HUD re-badges to **C = 88.5 pF** · **6800–8300** V eases back to 12 so S4 starts clean (no teleport) · hold to 15000.

**S4 `more_area_more_charge`** — ~13000 ms: 0–700 hold · **700** plate morph begins (cause) · 700–3500 A 0.01→0.02 continuous · **~1400–1500** (beat) beads flow IN, pool grows at the **same density** over twice the floor · **3500** morph completes · 3500–5000 pool settles at 2× count, HUD C 88.5→177 pF, Q 1.06→2.12 nC · hold to 13000.

**S5 `the_gap_paradox`** — ~18000 ms: 0–700 hold · **700** gap morph begins · 700–3500 d 0.001→0.002 continuous · **~1400–1500** (beat) beads flow BACKWARD, pools visibly thin · **3500** morph completes (2.0 mm) · 3500–5500 pools settle at half, HUD C 88.5→44.3 pF, Q 1.06→0.53 nC · hold to 18000 (narration carries the "battery holds V fixed here" guard + ε₀'s first appearance).

**S6 `why_epsilon_a_over_d`** — ~18000 ms, nothing physically moves: 0–1500 hold, formula panel empty · **1500** dot-pool glow pulse → 1500–2300 line 1 `σ = Q/A ≈ 106.2 nC/m²` docks · **2500** field-line glow → 2500–3300 line 2 `E = σ/ε₀ = 12000 V/m` docks · **3500** gap-ruler glow → 3500–4300 line 3 `V = E·d = 12 V` docks · 4300–5500 the three merge into **C = Q/V = ε₀A/d**, closing at 88.5 pF · hold to 18000.

**S7 `capacitance_sandbox`** — Rule 37 continuous: idle V auto-sweep 0↔24 ping-pong drives beads/pool/graph until the teacher touches any control (V, A, d, axis toggle), which seizes it; graph persists with the trace re-sloping on every A/d change.

## 5. Per-state control spec (Rule 31 — shared panel, fixed slots)

| Slot | Control | Range | Live in |
|---|---|---|---|
| row 1 | V | 0–24 V, step 1 | S2, S3, S7 |
| row 2 | A | 0.005–0.025 m², step 0.001 | S4, S7 |
| row 3 | d | 0.0005–0.0025 m, step 0.0001 | S5, S7 |
| graph corner | axis-swap toggle (Q–V ↔ V–Q) | binary | S7 only |

S1 and S6 expose **no** live controls — S1 is pure phenomenon, S6 pure derivation.

## 6. Physical constraint callouts for json_author

1. **d must be computed in SI metres internally**; only the ruler/label/narration convert to mm (`d_mm = d*1000`). Get this wrong and C is off by 1000×.
2. **A displays directly in m²** (e.g. "A = 0.010 m²", 3 dp) — no cm² conversion layer.
3. **The graph trace must re-slope live** whenever A or d changes (S4/S5/S7); trace equation AND Q-axis domain both recompute from the same live C.
4. **σ and E display in nC/m² and plain V/m**, reusing the sibling's `sigma_display_nC`/`E_field_display` convention.
5. **C display uses the conditional precision formula** (<100 → 1 dp, ≥100 → integer) to reproduce 88.5 / 177 / 44.3 verbatim.
6. **Dialect:** "Voltage V (p.d.)" on first appearance (S2) only, bare "V" after; "battery" never "cell"; "permittivity of free space" spoken in full at first mention (S5), ε₀ on-canvas only.
7. **Every `scene_composition` annotation id needs a matching `visible_elements` entry.**
8. **Author each state's `duration` ≥ the §4 ms totals** (S1 18000, S2 15000, S3 15000, S4 13000, S5 18000, S6 18000) — not a shorter word-count estimate, or THE EYE goes blind on the tail.

## 7. Drill-down cluster phrases (5 per cluster × 9)

**S2 `why_ratio_constant`:** "why doesnt capacitance change when i add more charge" · "if i put more charge shouldnt C go up" · "why is Q over V always the same number" · "does capacitance depend on how much charge is on it" · "i dont get how the ratio stays fixed"

**S2 `what_is_a_farad`:** "what even is a farad" · "is a farad a really huge unit" · "why do we always see picofarads not farads" · "what does one farad actually mean" · "how big is one farad compared to real capacitors"

**S2 `charge_stored_vs_capacity`:** "whats the difference between charge and capacitance" · "is Q the same thing as C" · "capacity sounds like how much charge it holds so why isnt that C" · "if Q changes but C doesnt then what is C actually measuring" · "is capacitance like the size of a bucket and charge like the water"

**S5 `why_smaller_gap_bigger_c`:** "why does moving plates closer increase capacitance" · "shouldnt less space mean less room for charge" · "why is C bigger when d is smaller" · "how does a smaller gap let it hold more charge" · "doesnt closer plates mean less capacity not more"

**S5 `where_does_drained_charge_go`:** "where does the extra charge go when the gap widens" · "does the charge just disappear when you pull the plates apart" · "why does charge flow back to the battery" · "is the charge destroyed or does it go somewhere" · "why does pulling the plates apart make charge leave"

**S5 `fixed_v_vs_fixed_q`:** "what if the battery wasnt connected when i pulled the plates apart" · "does Q always change or only when the battery stays connected" · "whats different if the capacitor is isolated instead of connected to a battery" · "why does it matter if the battery stays attached" · "if i disconnect it first does Q change when d changes"

**S6 `derivation_chain_confusion`:** "wheres epsilon naught come from in this formula" · "why are there three steps to get to C equals epsilon A over d" · "how do sigma and E and V all connect together" · "why cant we just say C equals epsilon A over d without deriving it" · "im lost on how this chain of formulas fits together"

**S6 `sigma_vs_q`:** "whats the difference between sigma and Q" · "is sigma just charge divided by area" · "why do we need sigma if we already have Q" · "does sigma depend on the size of the plate" · "is sigma the same on both plates"

**S6 `why_v_equals_ed`:** "why does V equal E times d" · "how does the field turn into a voltage" · "why is voltage just field times distance here" · "wheres this V equals Ed formula come from" · "is V equals Ed the same as V equals W over q"

## 8. Findings summary

**No physics errors in the skeleton.** Every locked number checks out to the digit; the notation-ladder claim holds completely.

**Three additions the skeleton's §0b under-specifies** (flagged, not errors):
1. The Q–V graph's trace line and Q-axis domain must **dynamically recompute** from live `C(A,d)` once A/d go live in S4/S5/S7 — otherwise the trace dot clips off-graph or the line shows an incoherent slope (the `DUALPANEL_*` risk class).
2. Slider ranges for A and d should be **0.5×–2.5× default**, not a wide mirror of the sibling's, because two simultaneous live geometry variables would push C into nanofarads and force an unplanned pF↔nF HUD switch.
3. σ and E should display in `nC/m²` / plain `V/m` rather than raw scientific notation — same numbers, better legibility (Rule 34c).

**No pedagogical safety issues:** the three misconception fixes are physically sound one-liners; anchors are Rule-35 neutral; dialect discipline is correctly specified.
