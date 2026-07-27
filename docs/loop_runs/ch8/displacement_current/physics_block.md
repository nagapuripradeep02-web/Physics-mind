# PHYSICS BLOCK — `displacement_current`

> Authored by physics_author against the DESIGN_OK skeleton (`skeleton.md`) + Checkpoint A carry-forwards
> (`checkpoint_a_report.md`). No redesign of arc/state-count/archetypes/locked numbers — this block adds
> physics rigor, the per-state motion/control timeline, teacher_script physics content, constraint
> callouts, and drill-down phrasings for json_author to render.
>
> **Engine bug queue consultation:** live SQL not reachable from this dispatch (same constraint the
> architect hit at §0a) — deferred to quality_auditor at Gate 8 per the skeleton's own flag (Escalation
> #2). Static mirror `docs/FIELD3D_SCENARIO_CHECKLIST.md` re-checked for variable/formula-class
> prevention rules: "gate on-canvas quantities/formulas to the state that teaches them" (already
> satisfied — ε₀ never appears before S8, μ₀ never before S3, per skeleton §10b) and "don't pre-spoil a
> later reveal" (satisfied — I_d readout born S6, ledger born S9). Bug #1's prevention rule
> (`default_variables_only_first_var_merged`) is honored below: every variable with a non-trivial
> default (I_c=1.2, s=0, r=10) is EXPLICITLY declared in `physics_engine_config.variables` — none is
> left to an implicit fallback.

---

## 1. `physics_engine_config`

### 1a. Variables

```json
{
  "I_c": {
    "name": "Charging (conduction) current",
    "unit": "A",
    "min": 0,
    "max": 2.0,
    "default": 1.2,
    "step": 0.1
  },
  "R": {
    "name": "Plate radius",
    "unit": "m",
    "constant": 0.06
  },
  "d_gap": {
    "name": "Plate separation (gap)",
    "unit": "m",
    "constant": 0.005
  },
  "A": {
    "name": "Plate area (πR²)",
    "unit": "m^2",
    "derived": "PI * R * R"
  },
  "eps0": {
    "name": "Permittivity of free space (electric constant)",
    "unit": "F/m",
    "constant": 8.8541878128e-12
  },
  "mu0": {
    "name": "Permeability of free space (magnetic constant)",
    "unit": "T·m/A",
    "constant": 1.25663706212e-06
  },
  "s": {
    "name": "Surface morph parameter — 0 = flat disk (wire pierces it), 1 = balloon bulging through the gap (nothing pierces it)",
    "unit": "dimensionless",
    "min": 0,
    "max": 1,
    "default": 0,
    "step": 0.01
  },
  "r_cm": {
    "name": "Probe radial distance from the wire/gap axis (UI unit — see 6c for the required cm to m conversion inside formulas)",
    "unit": "cm",
    "min": 0,
    "max": 15,
    "default": 10,
    "step": 0.5
  },
  "Q": {
    "name": "Charge accumulated on each plate",
    "unit": "C",
    "derived": "eps0 * (E field integrated over the charge window) — see computed_outputs.Q_uC"
  },
  "E": {
    "name": "Electric field in the gap",
    "unit": "V/m",
    "derived": "Q / (eps0 * A)"
  },
  "Phi_E": {
    "name": "Electric flux through the gap (Gauss, one-plate surface)",
    "unit": "V·m",
    "derived": "Q / eps0"
  },
  "dPhiE_dt": {
    "name": "Rate of change of electric flux",
    "unit": "V·m/s",
    "derived": "I_c / eps0 while charging, 0 while paused"
  },
  "I_d": {
    "name": "Displacement current",
    "unit": "A",
    "derived": "eps0 * dPhiE_dt  (= I_c while charging, 0 while paused)"
  },
  "B": {
    "name": "Magnetic field magnitude at radial distance r",
    "unit": "T",
    "derived": "piecewise — see formulas.B_field_inside / B_field_outside below"
  }
}
```

**Slider rows (3, matching skeleton §0b exactly):** `dc_ic_row` -> `I_c` (0-2.0 A, step 0.1, default 1.2) ·
`dc_surface_row` -> `s` (0-1, step 0.01, default 0) · `dc_probe_row` -> `r_cm` (0-15 cm, step 0.5, default 10).

### 1b. Formulas (PM_interpolate syntax — angle-free concept, no `radians()` needed anywhere)

```json
{
  "plate_area": "PI * R * R",
  "charge_ramp": "(state clock t_local, capped) — Q(t) = min(t_local / T_charge, 1) * Q_max while I_c held, frozen thereafter until reset; Q_max scales with I_c: Q_max = 1.2016e-7 * (I_c / 1.2)",
  "efield": "E = Q / (eps0 * A)",
  "eflux": "Phi_E = Q / eps0",
  "eflux_rate_charging": "dPhiE_dt = I_c / eps0",
  "eflux_rate_paused": "dPhiE_dt = 0",
  "displacement_current": "I_d = eps0 * dPhiE_dt",
  "I_enc_conduction_old_law": "I_enc = I_c * (1 - s)   — S3/S4 (pre-generalized law; s fixed 0 at S3)",
  "I_enc_conduction_ledger": "I_enc_c = I_c * (1 - s)  — S9 ledger term 1",
  "I_enc_displacement_ledger": "I_enc_d = I_d * s       — S9 ledger term 2",
  "ampere_maxwell_sum": "mu0 * (I_enc_c + I_enc_d)   — S9 sum chip; algebraically identical to mu0 * I_c whenever I_d = I_c (i.e. whenever charging is live)",
  "B_field_inside": "B = mu0 * I_d * (r_cm/100) / (2 * PI * R * R)     — for r_cm/100 < R",
  "B_field_outside": "B = mu0 * I_d / (2 * PI * (r_cm/100))            — for r_cm/100 >= R",
  "ampere_circuital_recall": "loop-integral of B.dl = mu0 * I_enc   — S3, inherited notation from amperes_circuital_law (RECALL, not new — see 6a)",
  "ampere_maxwell_general": "loop-integral of B.dl = mu0 * (I_c + eps0 * dPhiE_dt)   — S9, the generalized law"
}
```

### 1c. `computed_outputs` (for UI display / HUD)

```json
{
  "Q_uC": { "formula": "Q * 1e6" },
  "E_field": { "formula": "Q / (eps0 * A)" },
  "Phi_E_display": { "formula": "Q / eps0" },
  "I_d_display": { "formula": "eps0 * dPhiE_dt" },
  "B_uT": { "formula": "B_field(r_cm) * 1e6" },
  "ledger_sum_display": { "formula": "mu0 * (I_enc_c + I_enc_d)" }
}
```

### 1d. `constraints`

```json
[
  "I_d = I_c at every instant while I_c flows (constant-current charger, no RC decay stylized away — S1 clause)",
  "I_d = 0 the instant charging pauses, even though Q/E/Phi_E remain frozen at their reached value (not zero) — S6/S5 exploit this distinction",
  "B(r) is continuous at r = R: the inside formula (mu0*I_d*r/2*pi*R^2) and outside formula (mu0*I_d/2*pi*r) agree exactly at r = R (both give 4.0 uT) — no discontinuity at the plate edge",
  "B_gap(r=10cm) = B_wire(r=10cm) exactly, because r=10cm > R=6cm places the probe in the region where the gap's B(r) and the wire's B(r) are the SAME formula (mu0*I/2*pi*r) with the SAME current magnitude (I_d = I_c) — this identity breaks for r < R (S7's job)",
  "The Ampere-Maxwell sum mu0*(I_enc_c + I_enc_d) is INVARIANT under the surface morph s (0 to 1) whenever I_d = I_c — the two terms trade share but the sum never changes; this is a construction identity, not a coincidence, and must render numerically stable to at least 3 significant figures across the full s sweep",
  "Nothing (no charge, no bead) ever crosses the plate gap at any state, at any slider setting — a real conduction current never exists inside the gap; only I_d does"
]
```

---

## 2. Per-state `variable_overrides`

Following the `hinge_force.json` STATE_4 / `field_forces.json` STATE_5 defensive pattern — lock every
value the narration asserts, even where it matches the slider default, so an upstream leak from a prior
state's slider drag can never desync a guided state's numbers.

| State | `variable_overrides` | Why |
|---|---|---|
| STATE_1 | `{ I_c: 1.2, s: 0 }` | S1 narrates the canonical 1.2 A charging story; `s` isn't shown but must not carry a stray value from nowhere (defensive — matches `field_forces.json` STATE_5's m:1 defensive lock even though 1 is also the slider default) |
| STATE_2 | `{ s: 0 }` | I_c is the live control here (teacher may leave it dragged from a prior visit); s is not part of this state's story and must stay 0 |
| STATE_3 | `{ I_c: 1.2, s: 0 }` | S3's I_enc = 1.2 A is a locked HUD number; s must be pinned to the flat-disk case (this is the pre-generalized law, no morph yet) |
| STATE_4 | `{ I_c: 1.2 }` | The crisis (1.2 A to 0) must always start from the locked 1.2 A conduction reading, independent of any I_c drag from S2; `s` itself is this state's own live/scripted control (0 to 1), not overridden |
| STATE_5 | `{ I_c: 1.2, s: 0 }` | The 2.4 uT identity is exact only at I_c = 1.2 A (checkpoint A carry-forward #1); s stays 0 (irrelevant to this state, but locked so no residual balloon geometry bleeds into the gap-probe shot) |
| STATE_6 | `{ s: 0 }` | I_c is this state's own live control (throttled by the scripted ON/OFF demo, teacher-draggable); s locked off — the gap must read bead-free throughout, unconfused by any lingering morph |
| STATE_7 | `{ I_c: 1.2, s: 0 }` | The locked B(r) profile numbers (2.0/4.0/2.4 uT) are exact only at I_c = 1.2 A; s pinned flat (irrelevant to a radial sweep) |
| STATE_8 | `{ I_c: 1.2, s: 0, r_cm: 10 }` | Nothing animates (`reveal_hold`) — every HUD number quoted in the docking chain (Q, Phi_E, dPhiE_dt, I_d = 1.2 A) is the exact locked snapshot; all three sliders pinned so a residual teacher-drag from S6/S7 can never desync the derivation's own numbers |
| STATE_9 | `{ I_c: 1.2 }` | The frozen sum chip (`mu0 x 1.2 A`) is only frozen if I_c is locked at 1.2 A; `s` is this state's own live/scripted control (continuous scrub), not overridden |
| STATE_10 | *(none — explore is intentionally the one state where every default is live/teacher-facing, not locked)* | Rule 31/37: explore surfaces the authored defaults (I_c 1.2, s 0, r_cm 10) via `default_variables`, not `variable_overrides` — the whole point of S10 is that dragging is real |

---

## 3. Per-state motion + control spec (Rule 31/32/33/38)

### 3.0 Shared loop machinery (declared once, reused by reference below)

Two bounded, looping motion primitives satisfy §0a's "every state loops a full charge-window motion
cycle" while resolving the tension between (a) states whose OWN taught variable requires I_d/B to stay
continuously live (S7, S9) and (b) states whose taught variable literally IS the on/off charging
behavior (S1, S2, S6). Both are `PM_simTimeMs`-only pure functions (Rule 26); no `pause_after_ms`.

**Loop A — "charge / hold / soft-reset" (I_c pulses on then off; used where charging start/stop or its
direct consequence is the point).** Canonical period `T_A = 6.0 s`, phase split `CHARGE [0, 4.2s)` ·
`HOLD [4.2, 5.1s)` · `RESET [5.1, 6.0s)`. During CHARGE: I_c flows at its slider value, `Q(t)` ramps
linearly 0 -> `Q_max(I_c)` over the 4.2 s window (`Q_max` scales with I_c per §1b so the SLOPE, not the
window length, visibly changes with I_c — this is what S2's "growth rate visibly changes" cue means),
`I_d = I_c` constant, `B(r)` per formula constant. During HOLD: I_c = 0 (charger paused), `Q/E/Phi_E`
FROZEN at their reached value (not zeroed), `I_d = 0`, `B = 0` everywhere (checkpoint A carry-forward
#2's exact behavior). During RESET: `Q/E/Phi_E`/dot-pool fade 0.9 s back toward 0 (stylized, unnarrated,
low-salience — never scheduled under a spoken cue), preparing the next CHARGE ramp. Loop repeats.

**Loop B — "sustained charge, cosmetic Q-reset only" (I_c never pauses; used where the taught idea
needs I_d/B continuously nonzero — S7's radial profile, S9's frozen sum).** I_c holds constant
(no on/off) for the ENTIRE state dwell, so `I_d = I_c` and `B(r)` are continuously live throughout — the
probe sweep (S7) and the surface scrub (S9) never see a spurious zero. Only the Q-driven DISPLAY
(dot-pool density / flux-line count, purely cosmetic) cycles on its own short period (`T_B = 4.5 s`
ramp-up, ~0.5 s cosmetic fade) so the display stays bounded on an indefinitely long dwell — this fade
never touches I_c, I_d, or B, and is never narrated or cued.

**S6's dedicated throttle loop** (distinct from Loop A — the cue plan requires exactly TWO cycles inside
an ~18 s dwell, which Loop A's 6.0 s period does not hit): `T_S6 = 9.0 s`, `ON [0, 4.5s)` (I_c = 1.2 A,
I_d = 1.2 A, B live, beads flow, ghost column glows) -> `OFF [4.5, 9.0s)` (I_c = 0, I_d = 0, B = 0, beads
static, ghost column dims) -> repeat. Two full cycles = 18.0 s, sitting at the top of S6's 40-55 w budget.

**S10's continuous sandbox:** all three sliders manual; while untouched, I_c auto-sweeps
`I_c(t) = 1.2 + 0.6*sin(2*pi*t / 8s)` (0.6-1.8 A, Rule 37 continuous-run) using Loop B's cosmetic-only
Q-reset (I_d/B never interrupted); the first trusted drag event on any of the three rows seizes that
row into full manual and the auto-sweep on I_c stops (explorer trusted-drag pattern).

**S8 exception (declared, per §3's own footer):** no loop at all — the whole apparatus sits at the
FROZEN hold-snapshot (I_c = 1.2 A, Q = 0.12 uC, E = 1.2e6 V/m, Phi_E = 1.36e4 V·m, I_d = 1.2 A,
B(10 cm) = 2.4 uT) for the entire dwell; motion is carried entirely by the glow-walk + docking chain
(`reveal_hold`, THE EYE-declared).

### 3.1 STATE_1 `charge_the_gap` — core · `flow-along-path` · Loop A, offset-started

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0.0-1.2s | apparatus at rest, switch open, no beads, HUD Q = 0 | — (pre-cause hold) | none |
| 1.2s | switch CLOSES (one-shot cue, `deriveStateMeta` settle-pin) | cause | none |
| 1.2-5.4s (CHARGE) | amber beads stream both wires continuously; ~0.6-1s after the switch-close beat, +/- dot pools begin visibly growing on the facing plate faces; beads visibly STOP DEAD at each plate face, gap stays bead-free throughout | I_c = 1.2 A (locked) | none |
| 1.2-5.4s | wire ammeter needle settles and holds at `I_c = 1.20 A`; HUD `Q` climbs 0 -> 0.12 uC | I_c (locked) | none |
| 5.4-6.3s (HOLD) | beads pause, dot pools freeze at max, ammeter stays pinned at 1.20 A (charger paused ≠ ammeter reading a live 0 — the LOCKED S1 narrative is about conduction current existing, so S1's captured frame is taken from the CHARGE window, not HOLD) | — | none |
| 6.3-7.2s (RESET) | dot pools fade low-salience back toward 0, unnarrated | — | none |
| loop from 1.2s (CHARGE) | repeats ~2-3x across the 18 s dwell | — | none |

Cause->effect gap (32a): switch-close (cause) -> beads (effect) is instantaneous-ish by design (beads ARE
the visible consequence of the closed circuit); beads (cause) -> dot-pool growth (effect) carries the
required ~0.6-1s readable beat.

### 3.2 STATE_2 `field_grows_in_gap` — core · `densify/rarefy` · Loop A, continuous (no switch re-close)

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0.0s+ (inherited CHARGE, ambient) | beads keep arriving (cause, continuing motion, no re-trigger) | I_c | **I_c** |
| ~0.6-1s after each CHARGE-phase start | green E-lines in the gap thicken/brighten in step with dot-pool growth (effect) | `E(t) = Q(t)/(eps0*A)`, `Phi_E(t) = Q(t)/eps0` | — |
| continuous | HUD `Phi_E` counts up live during CHARGE, freezes during HOLD, fades during RESET | Q(t) | — |
| on I_c drag | the CHARGE-phase ramp SLOPE visibly steepens/shallows (Q_max scales with I_c per §1b) — the one thing this state lets the teacher change | I_c (live) | **I_c** |

Only I_c moves at teacher discretion (32b); apparatus/camera hold pose from S1.

### 3.3 STATE_3 `loop_and_disk` — core · `reveal-build` · Loop A, ambient background; camera moves ONCE

| t-window (sentence-aligned thirds of an 18s dwell) | what animates | driven by | live controls |
|---|---|---|---|
| 0.0-1.0s | camera eases right to frame the wire (one-shot, only camera move in the whole concept — 32d) | cause | none |
| 1.0-6.0s (sentence 1) | Amperian ring `dc_loop` draws itself around the wire; one `dl` arrow-segment tags it | cause | none |
| 6.0-12.0s (sentence 2) | flat translucent disk `dc_surface` (s=0, pinned) fills the loop, named "one CHOICE of surface"; beads (ambient CHARGE-phase flow) pierce the disk with flash ticks | I_c (locked, ambient CHARGE) | none |
| 12.0-18.0s (sentence 3) | `I_enc = 1.2 A` docks on the formula surface (one-shot, HOLDS after docking regardless of subsequent ambient HOLD/RESET dips — "docked formula lines hold end pose" per §0a); blue curl arrows circulate the loop (grip rule sense = bead-current direction) | I_enc = I_c*(1-0) = 1.2 A | none |
| ambient throughout | beads keep flowing/pausing on the background Loop A cycle (non-narrated, home-pose per 32b) | I_c (locked) | none |

The `I_enc` dock and curl-arrow appearance are cued to land inside a CHARGE-phase window of the ambient
loop (so the piercing flashes are visibly happening when the dock fires) — never scheduled inside a
HOLD/RESET window.

### 3.4 STATE_4 `same_loop_two_answers` — core · `surface-morph` (pair w/ S9) · Loop B-style sustained ambient (I_c stays on so the crisis is about the SURFACE, never confused with a charging pause)

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0.0-2.0s (sentence 1) | loop `dc_loop` and curl arrows sit UNCHANGED from S3's docked pose (home-pose continuity, 32d) — establishing "same loop" | — | **s** |
| 2.0-8.0s (sentence 2 — the morph window, per cue plan) | `dc_surface` bulges (cause) continuously s: 0->1, disk slips into a balloon between the plates; pierce flashes CEASE the instant the surface no longer intersects the wire (a geometric consequence of the morph, NOT of any charging pause — I_c stays 1.2 A throughout) | s(t) scripted 0->1 over 6s, teacher-seizable via trusted-drag | **s** |
| ~9.0s (after a readable beat past the morph, per cue plan "readout flip pinned after it") | `I_enc` FLIPS 1.2 A -> 0 (one-shot, holds thereafter) | `I_enc = I_c*(1-s)`, s=1 | — |
| 9.0-18.0s | formula surface shows both right-hand sides with a glowing "?" (holds) | — | — |
| ambient | beads keep flowing (I_c = 1.2 A, uninterrupted — Loop-B-style for this state specifically, so the crisis reads as purely about surface choice) | I_c (locked) | — |

**Declared contrast pair with S9 (skeleton §3):** the identical disk<->balloon morph plays again in S9,
where the readout that flips here (I_enc) is replaced by a two-term sum that does NOT flip. Both states
must use the IDENTICAL morph timing/geometry so the visual echo reads as the same primitive.

### 3.5 STATE_5 `b_lives_in_the_gap` — core · `translate-through` · Loop A, needle-capture cued inside a CHARGE window (carry-forward #2)

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0.0-2.0s (sentence 1) | misconception beat: ghost tag posts "no current here -> B should be 0" (16a pivot #2); probe `dc_probe` sits beside the wire, reading 2.4 uT | — | none |
| 2.0-10.0s (sentences 2-3, probe glide) | probe glides at FIXED r = 10 cm (radius never changes — only its axial/angular position moves) from beside-the-wire around into the gap mid-plane (cause) | r_cm locked at 10 throughout the glide — only the probe's position along its rail changes, not r | none |
| ~7.0-8.0s (inside the CHARGE-phase window of the ambient Loop A, per carry-forward #2 — never scheduled inside HOLD) | needle HOLDS (settles, stops fluctuating) at **2.4 uT** — the captured/pinned frame for THE EYE | `B(r=10cm, r>R) = mu0*I_d/(2*pi*r)`, I_d = I_c = 1.2 A at this instant | none |
| final sentence (~10.0-18.0s) | blue B-circulation rings `dc_bring_gap` materialize around the gap axis, same grip-rule sense as S3's wire rings (one-shot, holds) | — | none |
| ambient | Loop A continues cycling in the background AFTER the needle-hold is captured; the pinned 2.4 uT label/reading is a captured record, not a live-tracking value that must stay nonzero for the rest of the dwell — but the visible probe/needle itself is still LIVE, so it WILL show 0 during subsequent HOLD phases; this is acceptable (physically correct — the field really is 0 when I_c pauses) and is itself a secondary teaching point available if a teacher lingers | I_c cycling | none |

**Probe framing (carry-forward #1 — hard constraint):** the probe sprite must sit at the AXIAL mid-plane
between the plates, never seated radially inside the drawn plate disk (r=10cm > R=6cm plate radius at
all times in this state — the probe is always outside the plate's radial footprint, "in the gap" means
axially between the plates, not radially inside them). No radius slider is live in this state.

### 3.6 STATE_6 `flux_acts_as_current` — core (PRIMARY aha) · `cycle-compare` · dedicated 9.0s x2 throttle loop

| t-window (within one 9.0s cycle; x2 across the dwell) | what animates | driven by | live controls |
|---|---|---|---|
| 0.0s | throttle ON (cause) | teacher-draggable I_c or scripted default 1.2 A | **I_c** |
| 0.0-4.5s (ON) | beads flow, flux ramps (dot pools + E-lines grow), ghost column `dc_ghost_col` in the gap glows (bead-free — never populated with beads); ~0.5-1s after cause, BOTH meters rise together: `I_c = 1.20 A` and the newly-born gap readout `I_d = 1.20 A` | I_c=1.2, I_d=I_c | **I_c** |
| 4.5s | throttle OFF (cause) | — | **I_c** |
| 4.5-9.0s (OFF) | beads halt, flux freezes (NOT fades to 0 — frozen at reached value, per Loop A's HOLD semantics), ghost column dims; ~0.5-1s after cause, BOTH meters die to zero: `I_c = 0.00 A`, `I_d = 0.00 A` | I_d = eps0*0 = 0 | **I_c** |
| loop | repeats exactly twice across the ~18s dwell | — | **I_c** |
| throughout | the gap stays visibly bead-free in BOTH phases (16a pivot #3's confrontation: the reading is real, the beads are not) | — | — |

**Misconception pivot #3 timing:** the "reading dies the instant flux stops changing" claim must be
CUED to the 4.5s throttle-OFF beat specifically (not any arbitrary moment) so the causal link (throttle
off -> I_d dies, immediately, together with I_c) is legible.

### 3.7 STATE_7 `where_is_b_strongest` — extended · `oscillate/track` · Loop B (sustained I_c, cosmetic Q-reset only)

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0.0s+ | I_c held continuously at 1.2 A (never pauses this state — B must stay live throughout the whole sweep) | I_c (locked, sustained) | none |
| 0.0-2.0s | probe starts at r = 0 (on-axis) | — | **probe r** |
| 2.0-5.5s | probe sweeps outward through the gap: HUD B tracks live, 0 -> **2.0 uT at r=3cm** (linear rise, inside-formula) | `B = mu0*I_d*r/(2*pi*R^2)`, r<R | **probe r** |
| ~5.5s | probe crosses r = R = 6.0 cm: HUD hits **4.0 uT peak**; plate-edge tag `R = 6.0 cm` appears (first shown here, per §10b); a peak marker PINS at this point and holds for the rest of the dwell regardless of further probe motion | continuity of inside/outside formulas at r=R | **probe r** |
| 5.5-9.0s | probe continues outward past the edge: B FALLS as 1/r (outside-formula) down to **2.4 uT at r=10cm** | `B = mu0*I_d/(2*pi*r)`, r>=R | **probe r** |
| 9.0-14.0s | probe glides back inward to r=0 (return leg of the oscillate/track motion), tracking the same profile in reverse; loops | same formulas, mirrored | **probe r** |

The peak marker is the ONE frozen/pinned element in an otherwise fully continuous, live-tracking state
(consistent with §0a's "pinned peak marker holds end pose" carve-out).

### 3.8 STATE_8 `why_epsilon0_dphi_dt` — advanced · `chain-link-derivation` · frozen snapshot, `reveal_hold`

| t-window (sentences 2-4 per cue plan; sentence 1 sets up, no cue) | what glows / docks | algebra line | numeric closure |
|---|---|---|---|
| sentence 1 (~0-5s) | nothing moves; apparatus sits at the frozen hold-snapshot (I_c=1.2A, Q=0.12uC, E=1.2e6 V/m, Phi_E=1.36e4 V·m, I_d=1.2A, B(10cm)=2.4uT — every number the concept has already shown live, now recalled as fixed reference values) | — | — |
| sentence 2 cue (~5-9s) | dot pool `dc_dots_pos`/`dc_dots_neg` glows | `Phi_E = Q/eps0` docks | Phi_E = 1.2016e-7/8.854e-12 = 1.357e4 V·m (checks) |
| sentence 3 cue (~9-13s) | formula surface flips the same relation | `Q = eps0*Phi_E` docks (algebraic rearrangement, same identity restated for the rate step) | — |
| sentence 4 cue (~13-18s) | wire ammeter `dc_amm_wire` glows | `I_c = dQ/dt = eps0*dPhiE_dt` docks; chain closes numerically | 8.854e-12 x 1.36e11 ≈ 1.20 A (checks — the 1.36e11 is the ROUNDED display value; the unrounded chain gives exactly 1.2000 A, see §7) |

No physical motion anywhere in this state (declared `reveal_hold` — THE EYE's motion heuristic must NOT
flag this as "motion died"; it is the one state architecturally exempt per §0a/§3 footer). No slider.

### 3.9 STATE_9 `ampere_maxwell_ledger` — advanced · `surface-morph` (pair w/ S4) · Loop B (sustained I_c, continuous scrub)

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0.0s+ | I_c held continuously at 1.2 A (sustained — the frozen sum must never wobble due to a charging pause) | I_c (locked, sustained) | **s** |
| continuous, whole dwell | `dc_surface` scrubs disk<->balloon continuously: `s(t) = 0.5 + 0.5*sin(2*pi*t / 6s)` (teacher-seizable via trusted-drag on `dc_surface_row`) | s(t) scripted, ~3 oscillations across an 18s dwell | **s** |
| tracking s(t) | ledger's two terms trade: flat (s->0) shows `mu0*(1.2 + 0)`, bulged (s->1) shows `mu0*(0 + 1.2)`, mid-morph shows a genuine mix of both nonzero | `I_enc_c = I_c*(1-s)`, `I_enc_d = I_d*s` | — |
| on the naming sentence (per cue plan) | the SUM chip `loop-integral B.dl = mu0 x 1.2 A` glows once, then holds FROZEN — visibly NOT ticking even as the two terms above it keep trading | `mu0*(I_enc_c + I_enc_d) === mu0*I_c` (invariant, §1d) | — |

**Declared contrast pair with S4:** identical morph geometry/timing to S4; the flip is that S4's single
readout FLIPPED (1.2->0) while S9's SUM stays frozen — the caption in both states names this explicitly.

### 3.10 STATE_10 `displacement_sandbox` — core-ring only · `drag-sandbox` · Rule 37 continuous-run, never freezes

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| continuous, idle | I_c auto-sweeps 0.6-1.8 A (`1.2 + 0.6*sin(2*pi*t/8s)`); beads/flux/both meters (I_c, I_d — I_enc NOT shown, core-ring only) track live; surface sits at its last value (default s=0) with the core `I_enc` chip live; probe sits at its last position (default r=10cm) with `B` reading live along the rail on both sides of R (values simply read live — no peak callout, no R-tag, per §10 i-2) | live sliders + idle auto-sweep | **I_c · s · probe r (ALL)** |
| on any trusted drag | that row seizes to full manual; auto-sweep on I_c stops the instant I_c itself is touched (other rows never auto-sweep, so only I_c has a seize-to-stop moment) | teacher | **ALL** |

Formula surface: `I_d = I_c` only (core-ring; no eps0*dPhiE_dt, no ledger — Definition of Done i-2).

---

## 4. Board-mode mark scheme

**DEFERRED — conceptual-only directive (Rule 20 [D]) is active.** No `mode_overrides`, no derivation
sequence, no mark scheme authored for this concept. (Per Definition of Done §10e.)

---

## 5. `teacher_script` guidance per state (physics content — json_author writes final EN wording; Hindi via the Rule-30g Sonnet-5 sub-agent pre-ship)

Word budgets are the skeleton's locked §3 numbers; every state must carry these physics CLAUSES
verbatim-in-spirit (exact phrasing is json_author's call):

- **S1 (40-55w):** (i) name the constant-current-charger clause explicitly — "the charger holds the
  current steady" or equivalent, killing any RC-decay expectation; (ii) assert "nothing ever crosses
  the gap" as a flat physical fact, not a question; (iii) name the plates filling to +Q / -Q. Do NOT
  mention fields or B at all (S1 must plant "the gap is electrically dead" as the students own
  inference — misconception pivot #1 depends on S1 staying silent about fields).
- **S2 (30-45w):** recall electric flux as "field strength times the area it crosses — the same
  counting used for the Gauss flux law" (prerequisite-cliff patch clause, §Block-1); state that flux
  rises ONLY while current is charging the plates.
- **S3 (40-55w):** the required Ampere-recall patch clause — "add up B along the loop; Amperes law
  says the total equals mu-naught times whatever current threads the surface the loop bounds" (framed
  as RECALL of the shipped prerequisite, per checkpoint-A carry-forward #3 — NOT new calculus; the
  loop-integral notation is inherited, not introduced). Name the disk as "one choice of surface."
- **S4 (40-55w):** state the crisis explicitly as a genuine contradiction — "same loop, same law, two
  different answers" — before naming the fix comes later. Do not resolve it here (S4 is SUPPORTING
  aha; the resolution is S6/S9).
- **S5 (40-55w):** post the wrong-expectation ghost tags exact claim ("no current here, so no
  magnetic field") as a plain statement of the (wrong) belief being tested, then the needles 2.4 uT
  reading as the falsification. Required one-line fix clause: "The field is measurably there; whatever
  makes B in the gap, it is not moving charge." Do NOT say "current flows in the gap" anywhere.
- **S6 (40-55w, the PRIMARY aha):** state the equality I_d = I_c as the resolving idea in one clear
  sentence; explicitly note the reading dies the INSTANT the flux stops changing (ties to the 4.5s
  throttle-OFF beat). Required one-line fix clause (misconception pivot #3): "I_d is not charge in
  motion — it is changing electric flux acting, for magnetism, exactly like a current."
- **S7 (30-45w):** state the two regimes plainly — B rises with r out to the plate edge, then falls
  off "just like the field of a wire" beyond it; name the peak numerically (4.0 uT) at the edge.
  Notation: keep this state ALGEBRA-ONLY (B proportional to r inside, B proportional to 1/r outside) —
  no calculus form, per Rule 38c (extended ring).
- **S8 (40-55w, advanced ring — calculus permitted here only):** narrate the three-link chain in order
  — Gauss (Phi_E = Q/eps0) -> rearrange (Q = eps0*Phi_E) -> take rates (dQ/dt = eps0*dPhiE_dt, and
  dQ/dt is exactly what I_c means for a charging plate) -> conclude I_d equals eps0*dPhiE_dt equals
  I_c. Close with the numeric check reproducing 1.2 A.
- **S9 (40-55w, advanced ring):** state the generalized law once, symbolically: loop-integral of B.dl =
  mu0*(I_c + eps0*dPhiE_dt). Required clause (Block-1 planting-audit item #3): "flat surface: all
  conduction; bulged: all displacement; mid-morph: a mix — the law only ever needs the SUM."
- **S10 (<=20w, open):** invite manipulation; name the one governing idea (I_d = I_c) as the takeaway a
  teacher can quiz on live.

---

## 6. Physical constraints list (canvas/geometry, sign, unit-conversion)

**(6a) Geometry relationships (hard, must hold in every rendered frame):** plate radius R (6.0 cm)
is less than the probes minimum meaningful "in the gap" position; probe radius range (0-15 cm) spans
both the inside region (r<R, S7s linear regime) and the outside region (r>=R, S5s steady 10 cm
reading and S7s 1/r falloff); the probe sprites world position must sit strictly OUTSIDE the drawn
plate disks radial footprint whenever r>R is depicted (S5s fixed r=10cm shot) — never seat it inside
the plate geometry (checkpoint A carry-forward #1, hard requirement, not a suggestion).

**(6b) Sign/colour conventions:** + charge dots warm-coloured, - charge dots cool-coloured (skeleton
§0a); conduction beads amber; E-flux lines green; B-circulation rings blue; the grip-rule sense is
IDENTICAL at S3 (thumb along bead-current direction) and S5 (thumb along the flux-GROWTH direction in
the gap) — both curls must render the SAME rotational sense for the SAME physical current direction
(this is the entire content of the generalized law: displacement current obeys the identical
right-hand rule as conduction current). Any renderer implementation that flips the sense between S3
and S5 is a physics bug, not a style choice.

**(6c) Unit conversions the renderer MUST apply (else silent NaN/garbage per the PM_interpolate
gotcha — no `radians()` needed here since no angles exist, but an equivalent conversion IS required):**
the probe slider `r_cm` is authored in centimetres (UI-friendly, matches the on-canvas label `r = 10.0
cm`) but EVERY B-field formula requires metres — `r_m = r_cm / 100` must be applied inside
`B_field_inside`/`B_field_outside` before evaluation, exactly analogous to the documented
degrees-to-`radians()` conversion trap for angle-bearing formulas. `R` and `d_gap` are authored
directly in metres (constants) to avoid a second silent conversion site.

**(6d) The morph-invariant (S9s whole point) must be numerically robust:** `I_enc_c + I_enc_d =
I_c*(1-s) + I_d*s`; since `I_d = I_c` throughout S9s sustained-charge window, this simplifies exactly
to `I_c` for every `s` in [0,1] — verify the renderers live computation does not drift below ~3
significant figures across the full scrub range (a naive floating accumulation of `s` via `sin()`
should not introduce visible jitter in the displayed sum).

**(6e) Slider bound sanity:** `I_c` max (2.0 A) intentionally exceeds the locked default (1.2 A) so S2s
"drag I_c" and S10s sandbox have genuine range to explore; `s` and `r_cm` bounds match §0b exactly
(0-1, 0-15 cm) — do not widen or narrow either without a corresponding update to the B(r)
peak/2.4 uT/2.0 uT locked-number set, since those numbers are only exact at I_c = 1.2 A.

---

## 7. Arithmetic verification (independent recomputation — all pass)

Computed with `eps0 = 8.8541878128e-12` F/m, `mu0 = 1.25663706212e-06` T·m/A, `R = 0.06` m, `I_c =
1.2` A, `E = 1.2e6` V/m (skeletons stated snapshot value):

| Quantity | Computed | Skeleton locked value | Match |
|---|---|---|---|
| A = pi*R^2 | 1.13097e-2 m^2 | 1.13e-2 m^2 | matches |
| Q = eps0*E*A | 1.2017e-7 C = 0.1202 uC | 0.12 uC | matches (rounds correctly) |
| Phi_E = E*A | 1.3572e4 V·m | 1.36e4 V·m | matches |
| Phi_E = Q/eps0 | 1.3572e4 V·m | 1.36e4 V·m | matches (both routes agree, as Checkpoint A required) |
| dPhiE/dt = I_c/eps0 | 1.35529e11 V·m/s | 1.36e11 V·m/s | matches (rounds correctly) |
| I_d = eps0*dPhiE/dt | 1.20000 A (exact, algebraic identity) | 1.2 A | matches |
| B(r=10cm, r>R) | 2.40000e-6 T = 2.400 uT | 2.4 uT | matches |
| B_peak(r=R=6cm) | 4.00000e-6 T = 4.000 uT | 4.0 uT | matches |
| B(r=3cm, r<R) | 2.00000e-6 T = 2.000 uT | 2.0 uT | matches (also = B_peak/2, confirming the linear inside-profile since 3cm = R/2) |
| S8 chain closure (rounded-display arithmetic) | 8.854e-12 x 1.36e11 = 1.204 A | approx 1.2 A (skeletons own rounding) | matches — the small 1.204 vs 1.200 discrepancy is a rounding artifact of DISPLAYING the rate as 1.36e11; the exact unrounded chain (using I_c/eps0 then times eps0) returns exactly 1.2000 A. json_author should compute S8s HUD closure from the UNROUNDED internal values and only round the DISPLAYED intermediate to 1.36e11, so the closure reads approx 1.2 A cleanly rather than a visibly-off 1.204. |

**Verdict: all ten locked numbers reproduce independently — same result as Checkpoint As own
verification (`checkpoint_a_report.md` line 5).** No discrepancy found.

---

## 8. Drill-down cluster phrasings (5 real-student-voice phrases per cluster; 9 clusters total)

### S4 clusters

**`why_any_surface_works`**
- "why can you pick any surface"
- "how is the surface not fixed"
- "why does the loop matter and not the shape"
- "cant you just pick the surface that works"
- "why is choosing a different surface even allowed"

**`flat_vs_balloon_surface`**
- "why does a balloon surface count as valid"
- "is the bulged surface still touching the same loop"
- "why does the shape of the surface change the answer"
- "isnt the flat disk the only real surface"
- "how can a stretched surface still be bounded by the same ring"

**`what_counts_as_enclosed`**
- "what does enclosed current even mean here"
- "why does the wire not count as enclosed anymore"
- "does enclosed mean touching or something else"
- "why does the same wire count in one case and not the other"
- "what changes about what is inside the loop"

### S6 clusters

**`is_displacement_current_real`**
- "is displacement current an actual current"
- "is I_d a made up thing or a real current"
- "does displacement current really exist"
- "is this just a math trick or is it physical"
- "why call it current if nothing is moving"

**`current_without_moving_charge`**
- "how can there be current with no charge moving"
- "if nothing crosses the gap how is there current"
- "whats actually flowing in the gap"
- "how do you get current without any charge carriers"
- "is the field itself the current somehow"

**`why_gap_current_equals_wire_current`**
- "why is the gap current exactly equal to the wire current"
- "how do they always match up"
- "is it a coincidence that I_d equals I_c"
- "why cant the gap current be different from the wire"
- "why does the number always come out the same as I_c"

### S8 clusters

**`gauss_gives_q_equals_epsilon0_phi`**
- "where does Q equals epsilon naught phi come from"
- "how do you get charge from flux"
- "why is Gauss law used here"
- "why does flux relate to charge like that"
- "where does the epsilon naught come from in that step"

**`units_of_epsilon0_dphi_dt`**
- "why does epsilon naught times dphi by dt give amperes"
- "how do the units work out to current"
- "what are the units of dphi by dt actually"
- "why does multiplying by epsilon naught fix the units"
- "how does V·m per second turn into amps"

**`steady_state_kills_id`**
- "why does displacement current stop once the capacitor is full"
- "why is I_d zero when charging is done"
- "if the flux is not changing why is there no I_d"
- "why does a fully charged capacitor have no displacement current"
- "does I_d only exist while charging is happening"

---

## 9. Self-review checklist

- [x] Every symbol in the skeletons state narratives (I_c, Q, E, Phi_E, dPhiE_dt, I_d, I_enc, B, r, R,
      s, eps0, mu0) appears in `physics_engine_config.variables`.
- [x] No `radians()` needed (no angle-bearing formula in this concept) — the analogous cm-to-m
      conversion for `r_cm` is called out explicitly (§6c) as the equivalent silent-failure risk.
- [x] Every states live control(s) match the skeleton §3 control table exactly (S1 none · S2 I_c · S3
      none · S4 s · S5 none · S6 I_c · S7 probe r · S8 none · S9 s · S10 all three).
- [x] `variable_overrides` documented for every state that needs it, each justified (§2).
- [x] Board mark scheme correctly SKIPPED (Rule 20 [D] active).
- [x] Drill-down phrasings: 9 clusters x 5 phrases = 45, real-student-voice, no teacher-prose sentences.
- [x] `constraints` block: 6 short factual assertions (§1d).
- [x] Numerical sanity check run independently in Python — all ten locked HUD numbers reproduce (§7).
- [x] Within-state motion timeline written for all 10 states; every branch a pure fn of the state clock
      (Rule 26 — local time offsets and loop periods, no `pause_after_ms`); no two states share an
      identical motion (S4/S9 are the ONE declared contrast pair, correctly repeated); no static state
      (S8 is the declared `reveal_hold` exception per the skeletons own carve-out).
- [x] Rule 32 sequencing verified per state: cause-before-effect beats specified with concrete ~0.5-1s
      gaps (switch to beads S1, morph to flip S4, probe-arrival to needle-hold S5, throttle to meters
      S6); only the taught variables motion changes per state (§3, "ambient" bead-loop explicitly
      carved out as home-pose per 32bs own parenthetical, not a second taught variable).
- [x] Word budget: unchanged from skeletons locked 25-55 (30-45/40-55 per state) — physics_author added
      no narration text, only physics-content clauses for json_author to phrase within budget.
- [x] Notation ladder (38c): S3s loop-integral of B.dl = mu0*I_enc is framed as RECALL (checkpoint A
      carry-forward #3, folded into §5s S3 guidance); S7 stays algebra-only (B proportional to r
      inside, B proportional to 1/r outside, no derivative notation); calculus (dPhiE_dt as a genuine
      rate, the loop-integral as a new derivation object) is confined to S8/S9 (advanced ring only) —
      no calculus smuggled onto core/extended states. Dialect (38d): "Amperes circuital law"
      dual-labelled once at S3 per skeleton §10 ("Amperes law (circuital law)"), bare thereafter;
      "charger" not "cell"; carried forward unchanged from skeleton.
- [x] Engine bug queue consulted (static mirror; live SQL deferred to quality_auditor per skeletons own
      Escalation #2 — physics_author has no DB access in this dispatch, same constraint the architect
      hit). Bug #1s prevention rule satisfied: I_c/s/r_cm all explicitly declared with real defaults.
- [x] DC Pandey check: every formula derived here from first principles (Gauss law + the definition of
      current as dQ/dt + the standard uniform-current-density inside-a-conductor analogy for B(r<R)) —
      nothing imported from DC Pandey/HC Verma. NCERT §8.2 consulted for scope/sequencing only (per the
      skeletons own 0a note), never for teaching sequence or example problems.

---

## 10. Deviations from skeleton — NONE

No redesign of arc, state count, archetypes, or locked numbers was made. All decisions in this block
(the two-loop machinery in §3.0, the S6-dedicated 9.0s x2 throttle period, the S7/S9 sustained-charge
mode, the S8 frozen-snapshot pose) are GRANULAR TIMING/CONSISTENCY specifications explicitly assigned
to physics_author by the skeletons own Escalation #3 ("lock the loops charge-window timing... and the
two S6 throttle cycles to the narration beats") and by Checkpoint A carry-forwards #1-#3 — none
contradicts or overrides an architect decision.

## 11. Flags for quality_auditor

1. **S7/S9 "sustained charge, no hold pause" design (§3.0 Loop B)** is a physics_author judgment call
   resolving a genuine tension between §0as blanket "every state loops charge to hold to reset"
   language and the 32b variable-list (which names ONLY "probe radius"/"surface" as S7/S9s moving
   variable, never "throttle"). Please sanity-check the BUILT sims S7/S9 control table against this
   reading — if json_author or the field3d-surgeon instead wires S7/S9 to the same on/off Loop A as
   S1-S5, the B(r) profile and the frozen sum would both intermittently show 0, breaking both states
   legibility.
2. **S8s `reveal_hold` frozen-snapshot values** (§2, §3.8) are the EXACT locked numbers from skeleton
   §2 — verify the built state does not accidentally inherit a stray slider value from S6/S7 (this is
   why `variable_overrides` pins all three sliders on S8, per §2s table).
3. Run the live `engine_bug_queue` SQL at Gate 8 as already flagged by the architect (skeleton
   Escalation #2) — this dispatch had no DB access, same as the architects.
