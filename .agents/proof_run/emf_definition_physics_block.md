# Physics Block — `emf_definition` (Ch.3 Current Electricity #5, Diamond 1/2)

> Input to json_author. Companion to `emf_definition_skeleton.md`. Cell is IDEAL (r=0); the droop V=ε−Ir is Diamond 2 — this block claims nothing about it.

**Native-engine note:** like `combination_of_resistors`, this concept's physics is computed NATIVELY in the renderer's `emfCurrents()` — `physics_engine_config` below is DOCUMENTATION per the Zod requirement, it does NOT drive PM_interpolate.

---

## 1. `physics_engine_config` (documentation only)

```json
"physics_engine_config": {
  "variables": {
    "emf": {
      "name": "electromotive force (epsilon)",
      "unit": "V",
      "min": 1,
      "max": 12,
      "default": 1.5,
      "role": "slider — live ONLY in S4 (taught variable) and S6 (explore); locked to 1.5 on S1/S2/S3/S5 — reorder-safe per Rule 25d"
    },
    "R": {
      "name": "load resistance",
      "unit": "Ω",
      "min": 0.5,
      "max": 12,
      "default": 1.5,
      "role": "slider — live ONLY in S6; locked to 1.5 on S1-S5 (never the taught variable in this diamond)"
    },
    "switch": {
      "name": "circuit switch (0=open, 1=closed)",
      "unit": "dimensionless (enum)",
      "min": 0,
      "max": 1,
      "default": 1,
      "role": "slider (2-state toggle) — live ONLY in S6; closed on S1-S4, forced open by open_circuit on S5; rendered as text (Open/Closed), never raw 0/1"
    },
    "q": {
      "name": "charge in the traced packet (display-only, NOT an engine slider)",
      "unit": "C",
      "min": 1,
      "max": 2,
      "default": 1,
      "role": "S3 ONLY — driven by the charge_double flag on the state clock (1 C → 2 C); NOT a control on any state"
    },
    "i": { "name": "loop current", "unit": "A", "derived": "switch === 0 ? 0 : emf / R", "role": "live readout — the ammeter; dies to 0 on S5" },
    "V_terminal": { "name": "terminal voltage", "unit": "V", "derived": "emf", "role": "IDEAL cell only (r=0) — always equals ε, open or closed; the voltmeter reading. Diamond 2 replaces with ε − i·r" },
    "W": { "name": "work done by the cell on the traced packet", "unit": "J", "derived": "emf * q", "role": "readout on the lifted packet — 1.5 J at q=1, 3.0 J at q=2 (S3)" },
    "W_per_q": { "name": "work per unit charge — the definition of emf", "unit": "J/C", "derived": "W / q  (≡ emf always — this identity IS the aha)", "role": "the ladder step-height label; reads the SAME number as the emf badge at every instant, incl. during S3 doubling" }
  },
  "formulas": {
    "i": "switch === 0 ? 0 : emf / R",
    "V_terminal": "emf",
    "W": "emf * q",
    "epsilon_definition": "emf = W / q",
    "unit_identity": "1 V ≡ 1 J/C"
  },
  "constraints": [
    "ε = W/q at every instant — an intensive property; doubling q doubles W but leaves ε (=W/q) unchanged (the S3 aha)",
    "ε is set by the cell's chemistry — independent of R, switch state, and i (S4: the circuit never sets ε)",
    "IDEAL cell (r=0): V_terminal = ε identically, open OR closed — NO droop authored; Diamond 2 replaces this with V = ε − ir",
    "open circuit (switch=0) ⇒ i=0 exactly; and i=0 ⇒ V_terminal=ε is TRUE FOR ANY CELL (no current ⇒ no i·r term) — why S5's claim safely survives into Diamond 2, unlike a closed-circuit V=ε claim",
    "i ≥ 0 always; emf ∈ [1,12], R ∈ [0.5,12] both > 0 ⇒ i = emf/R has no divide-by-zero in range",
    "1 V ≡ 1 J/C exactly — the SI definition of the volt, not an approximation"
  ]
}
```

---

## 2. Per-state variable-lock plan (reorderable-rail safety, Rule 25d)

The reorderable state rail means a teacher can jump from S6 (sliders dragged anywhere) straight into S1 — guided states must render at their intended numbers regardless. **Engine mechanism note for json_author:** the emf engine's `cEmf()`/`cLoadR()`/`emfSwitchOpen()` read the live slider; to honor per-state locks the engine reads an optional per-state numeric (`emf`/`R`) + the existing `open_circuit` flag. Author the locks as per-state values; the main session adds the ~3-line `cEmf()/cLoadR()` per-state-override support during integration (Task 10/11).

| State | Locks | Live control | Why |
|---|---|---|---|
| S1 | emf=1.5, R=1.5, closed | none | S1 narration ("i=1.0 A") only true at defaults |
| S2 | emf=1.5, R=1.5, closed, q=1 | none | ladder step reads exactly 1.5 J/C; `ε = W/q` shows 1.5 = 1.5/1 |
| S3 | emf=1.5, R=1.5, closed | none | ε/R locked; q is the ONLY moving var (charge_double 1→2) |
| S4 | R=1.5, closed | **emf** | emf is the taught slider (NOT locked); R/switch pinned so one variable moves (32b); re-init emf→1.5 on SET_STATE entry |
| S5 | emf=1.5, R=1.5, **open** | none | `open_circuit` forces the open condition; switch override belt-and-suspenders |
| S6 | none (defaults as entry pose) | **emf·R·switch** | fully teacher-driven sandbox; opens on the S1-S4 familiar picture (32d) |

---

## 3. Per-state motion timeline (Rule 31/32 — pure fn of state clock)

| State | What animates | Driven by | Live control | Cause→effect gap (32a) |
|---|---|---|---|---|
| S1 | Beads flow ∝ i; inside the cell each bead hoisted −→+ (pump-lift, continuous ≥1 cycle/dwell); ammeter i=1.0 A | i = emf/R (fixed) | none | N/A — establishes the cause |
| S2 | `ladder_reveal` cue on s2_1: ladder draws in — step up `ε=1.5 J/C` at cell, flat wire, equal drop across load; `ε=W/q` overlay lands last | emf → step height | none | ~0.5–0.8s (pump already shown → ladder traces it) |
| S3 | `charge_double` cue on s3_2: packet q 1→2 (cause) → beat ~0.7s → W 1.5→3.0 J while step HELD at 1.5 J/C (the non-change is the teaching); `1 V = 1 J/C` last | q (state-clock); W=emf·q | none | ~0.7s cause(q)→effect(W) |
| S4 | emf slider appears; on drag pump-lift height changes FIRST → beat → ladder step stretches, bead speed + ammeter follow; chemistry tags at stops 1.5/2/3.7/12 | emf (live) | **emf** | ~0.6–0.8s |
| S5 | `switch_open` cue on s5_1: loop breaks (cause) → beat ~0.8–1.0s beads coast to halt, ammeter→0 → voltmeter docks, settles at V=ε=1.5 V; ladder flat-topped (no drop) | switch (forced 0); V=emf | none | ~0.8–1.0s break→halt→settle |
| S6 | All dials live: emf scales step+pump+speed, R throttles flow, switch replays halt-settle; all instruments live | emf, R, switch | **ALL** | explore exempt |

---

## 4. Worked numbers (verified — all skeleton arithmetic holds)

- Defaults ε=1.5, R=1.5, closed → **i = 1.5/1.5 = 1.0 A** (legible).
- S2 step: ε = W/q = 1.5/1 = **1.5 J/C** = the ε badge (unit identity ✓).
- S3 doubling: W = εq → 1.5×1=**1.5 J** → 1.5×2=**3.0 J**; W/q: 1.5 → **1.5** (held exactly).
- S4 stops: 1.5/2.0/3.7/12.0 V all land on the 0.1-V grid within [1,12], none clipped.
- S5: switch=0 → i=0 → V_terminal = ε = **1.5 V** (ladder flat-top = correct picture).
- JEE-trace: ε=2 V, q=5 C → W = εq = **10 J** ✓.

---

## 5. Board mark scheme — DEFERRED (conceptual-only, Rule 20). Author NO `mode_overrides`.

---

## 6. Drill-down clusters (9 × 5 real student-voice phrases)

**S2 `why_volts_not_joules`:** "if emf is energy why is it measured in volts" · "why don't we just say joules for emf" · "how can energy be volts, isnt volt a different unit" · "why divide by charge to get emf, why not just use joules" · "1 volt is really 1 joule per coulomb? that sounds weird"

**S2 `emf_vs_potential_difference`:** "is emf the same thing as voltage" · "whats the difference between emf and potential difference" · "why does the book use two different symbols if they mean the same thing" · "is emf just p.d. across the battery" · "why cant we just call it terminal voltage"

**S2 `who_does_the_work`:** "what actually pushes the charge inside the cell" · "is it the electric field that lifts the charge inside the battery" · "what force moves the electron from minus to plus terminal" · "why doesnt the charge just go back down on its own inside the cell" · "what agent is doing this work, is it chemical energy"

**S3 `emf_is_not_a_force`:** "its called electromotive force so why isnt it a force" · "if its not a force why does it push the current" · "the name literally says force, shouldnt it have units of newton" · "why is emf measured in volts if its really a force" · "isnt emf literally the force pushing the electrons around"

**S3 `double_charge_double_energy`:** "if more charge needs more energy why doesnt emf go up" · "cell does more work for more charge so emf should increase right" · "why does the ratio stay the same when total work doubles" · "shouldnt bigger current mean bigger emf" · "if I push double the charge doesnt the cell get stronger"

**S3 `volts_equal_joules_per_coulomb`:** "prove that 1 volt is 1 joule per coulomb" · "why is v = w/q the definition of a volt" · "where does joule per coulomb come from in the volt unit" · "is this the same w/q as in electric potential from electrostatics" · "how do you actually derive 1V = 1J/C"

**S5 `why_no_current_to_measure`:** "why must no current flow to read the emf" · "why cant I just measure emf while current is flowing" · "whats wrong with measuring voltage on a closed circuit" · "why does opening the switch change what the meter reads" · "what happens to the reading if current is flowing instead"

**S5 `voltmeter_draws_no_current`:** "doesnt the voltmeter itself complete the circuit" · "if a voltmeter is connected wont current flow through it too" · "how can a voltmeter measure something without drawing any current" · "is a real voltmeter also ideal like the one in this sim" · "why does an ideal voltmeter have infinite resistance"

**S5 `emf_when_current_flows`:** "will the voltmeter still show emf when the switch is closed" · "does closing the circuit change what the voltmeter reads" · "is v = emf always true even when current is flowing" · "whats different for a real battery when current is flowing" · "why does the reading only equal emf when there is no current"

---

## 7. Constraint callouts for json_author

- No trig — `radians()` N/A.
- `switch` is a 2-state enum (step=1, min=0, max=1); render text Open/Closed, never raw 0/1.
- `q` is NOT a `slider_controls` entry — it is state-scoped animation data (S3 charge_double only).
- `emf`/`R` defaults are non-1 (1.5) — confirm the generator threads them from `slider_controls.default`, not a silent fallback to 1.
- `i` and `V_terminal` are NEVER independent sliders — always derived (`i = switch===0?0:emf/R`; `V_terminal = emf`).
- **Ideal-cell honesty guard:** NO annotation/caption/`formula_overlay` in S1–S6 may write `V = ε − ir`, mention "internal resistance," or show a droop — that is Diamond 2's vocabulary. Only S5's `V = ε (no current)` is permitted (universally true, safe forward).
- Chemistry-stop labels are real electrode-chemistry values — no scaling/fudge (unlike resistivity's hidden V_supply).

---

## Escalation (to json_author + main session)

**S4 slider entry-reset:** on a fresh `SET_STATE` into S4, `emf` should re-init to 1.5 (state = self-contained, Rule 25d) while trusted in-session drag seizes control until the next state change. Confirm this matches the sibling engine's `combination_of_resistors` S2/S4/S6/S7 trusted-drag reset pattern. **S4 distinctness (from architect FLAG 1):** S4's `__frozen` at default ε resembles S2 except for the visible slider row + chemistry tags — if THE EYE/eye-walker flags it, add a `scenario_cue`-bound ε glide on S4 entry (additive engine ask, not a JSON workaround).
