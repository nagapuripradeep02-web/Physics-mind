# Physics Block — `phasors` (Ch.7 #4)

**Engine bug queue consulted live** (`npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts`):
`--owner alex:physics_author` (6 rows — the generic `DUALPANEL_*` triad, N/A to field_3d exactly as both
sealed siblings noted; the two `teach_reveal_synced_to_narration` / `teach_show_quantity_live_when_named`
directives are already the design's own cue-ARMS/phase-FIRES + F3 HUD-ring-gate machinery), `phasors` (0 rows —
not yet seeded, expected pre-json_author), `--field3d --open` grepped for `subscript|caption|order|freeze|arm|
phase_anchor|glow_focal|slider_step` (only two `graph_title_caption_zorder_overlap`-class rows on `eddy_currents`,
unrelated concept, no `phasors`-relevant open row beyond what the skeleton's §0a table already cites and applies).
No new gap found. Confirms: nothing outstanding beyond the eleven scars the skeleton already threads.

**DC Pandey check:** none consulted. Every formula below is re-derived directly from uniform circular motion
projected onto one axis (the vertical component v(t) = vₘ sin θ) plus the three settled sibling facts (R
in-phase, L lags 90°, C leads 90°) — independently re-verified numerically below, not copied from the
skeleton's own arithmetic.

---

## 0. Number-lock re-derivation (independent, Python-verified)

```
omega = 2*pi*0.25            = 1.5707963267948966 rad/s
omega in deg/s                = 90.000000 deg/s   (exact: (pi/2)*(180/pi) = 90)
T = 1/f_demo                  = 4.000 s

R branch:  i_m = vm/R          = 10.0/5.0            = 2.0000 A     phi = 0 deg
L branch:  X_L = omega*L       = 1.5707963*3.1831     = 5.000002 ohm  ->  i_m = 1.999999 A   phi = -90 deg (lag)
C branch:  X_C = 1/(omega*C)   = 1/(1.5707963*0.1273) = 5.000941 ohm  ->  i_m = 1.999624 A   phi = +90 deg (lead)

v(45 deg) = 10*sin(45deg)      = 7.0711 -> +7.1 V   (S2 stop 1 / S4 tangent context)
v(90 deg) = 10*sin(90deg)      = 10.000 -> +10.0 V  (S2 stop 2, "length and shadow agree")
v(180deg) = 10*sin(180deg)     = 0.0    -> 0.0 V    (S2 stop 3)

S2 freeze targets on the FIRST revolution (state entry theta=0):
  45 deg -> t=0.500s   90 deg -> t=1.000s   180 deg -> t=2.000s
S4 freeze targets on the FIRST revolution (state entry theta=0):
  30 deg -> t=0.333s   150 deg -> t=1.667s  240 deg -> t=2.667s   (span 2.333s, inside one T=4.0s turn)

S6 crossing arithmetic under the required theta0 = -90 deg anchor (derived below, F2):
  i-arrow (C, phi=+90): theta_i(t) = 0 + 90*t   -> first upper crossing (=90 deg) at t = 1.000 s
  v-arrow:               theta_v(t) = -90 + 90*t -> first upper crossing (=90 deg) at t = 2.000 s
  gap = 1.000 s = (90/360)*4.0 = Delta t  -> matches the S6 formula surface exactly
```

**T's frequency-independence check (used implicitly across S3-S6):** the phase offset `phi` (0°, −90°, +90°)
is fixed by the ELEMENT alone and never depends on `f_demo` or `vₘ` — confirmed algebraically: `phi` never
appears as a function of `omega` in any of the three branch formulas above, only `X_L`/`X_C`/`R` (which set
*magnitude* `iₘ`, never *phase*) depend on `f_demo`. This is the physical fact S3's live-`f` drag demonstrates
("the lock never opens").

---

## 1. `physics_engine_config`

```json
{
  "variables": {
    "vm":      { "name": "Peak (amplitude) voltage - the v-arrow's length, on its own cyan scale", "unit": "V", "min": 2, "max": 20, "default": 10.0, "step": 1, "role": "driver" },
    "f_demo":  { "name": "Demo-compressed AC frequency (real mains is tens of Hz)", "unit": "Hz", "min": 0.1, "max": 0.5, "default": 0.25, "step": 0.05, "role": "driver" },
    "R":       { "name": "Resistance of the heater element - the R branch (S1-S3)", "unit": "Ohm", "min": 2, "max": 20, "default": 5.0, "step": 1, "role": "driver" },
    "L":       { "name": "Self-inductance of the coil - the L branch (S4)", "unit": "H", "min": 1.0, "max": 10.0, "default": 3.1831, "step": 0.1, "role": "driver" },
    "C":       { "name": "Capacitance of the plates - the C branch (S5-S6)", "unit": "F", "min": 0.04, "max": 0.40, "default": 0.1273, "step": 0.02, "role": "driver" },

    "omega":   { "name": "Angular frequency of the shared rotating clock", "unit": "rad/s", "derived": "omega = 2*PI*f_demo" },
    "omega_deg_per_s": { "name": "Angular speed in degrees/second - the arithmetic gift at defaults", "unit": "deg/s", "derived": "omega_deg_per_s = omega * 180/PI  [= 90.000 exactly at f_demo=0.25]" },
    "T":       { "name": "Period of one full revolution = one full AC cycle (FIRST TAUGHT at S6, co-located with its only formula use - R5 resolution, section 3)", "unit": "s", "derived": "T = 1/f_demo" },

    "theta0":  { "name": "Per-state closed-form phase-ANCHOR (a constant, never a free-running second integrator - Escalation section 2 binding caution). Zero for every state EXCEPT S6.", "unit": "deg", "derived": "theta0 = 0 for S1-S5,S7,S8; theta0 = -90 for S6 ONLY (the F2 entry offset that produces the ~1.0s/~2.0s crossing timing)" },
    "theta_v": { "name": "v-arrow rotation angle - pure function of the STATE's own clock (Rule 26), rewindable under SET_TIME_FREEZE, never a dt-accumulator", "unit": "deg", "derived": "theta_v(t) = theta0(state) + omega_deg_per_s * t" },
    "phi":     { "name": "Constant angular offset of the i-arrow from the v-arrow, set by the ACTIVE element only (never f_demo or vm - see the T-independence check). Same quantity as the phase-difference arc reading.", "unit": "deg", "derived": "phi = 0 (R, S1-S3) | -90 (L lag, S4) | +90 (C lead, S5-S6)   [state-scripted via variable_overrides, NOT a slider]" },
    "theta_i": { "name": "i-arrow rotation angle - rigidly co-rotating with theta_v at a LOCKED offset (ONE closed-form clock, per-arrow constant offsets - never two independent phase integrators, Escalation section 2)", "unit": "deg", "derived": "theta_i(t) = theta_v(t) + phi" },

    "v":       { "name": "Instantaneous voltage - the v-arrow's vertical projection (the shadow), the S1/S2 taught quantity", "unit": "V", "derived": "v = vm * sin(radians(theta_v))" },
    "im":      { "name": "Peak current for the ACTIVE element (own amber scale, never length-compared to vm)", "unit": "A", "derived": "im = vm/R (R active) | vm/(omega*L) (L active) | vm*omega*C (C active)" },
    "i":       { "name": "Instantaneous current - the i-arrow's vertical projection", "unit": "A", "derived": "i = im * sin(radians(theta_i))" },

    "theta_v_readout_deg": { "name": "Live theta HUD value, degrees (S2 first-taught; radians only from S7 - 38c)", "unit": "deg", "derived": "((theta_v % 360) + 360) % 360" },
    "phi_arc_deg": { "name": "Live phase-difference arc numeric (S3 first-taught, magnitude convention: 0/90/90)", "unit": "deg", "derived": "abs(phi)" },
    "delta_t":  { "name": "S6 angle-to-time conversion - the taught quantity of the Delta t formula surface (T itself first tabled HERE, co-located - R5 resolution)", "unit": "s", "derived": "delta_t = (abs(phi)/360) * T" },

    "arrow_upper_crossing": { "name": "True exactly when an arrow's rotation angle passes through the finish-line direction (S6 flash trigger) - trough (270 deg) is the companion NEVER-flash instant", "unit": "boolean", "derived": "(theta mod 360) crosses 90 deg, increasing" }
  },

  "computed_outputs": {
    "v_display":        { "formula": "vm*Math.sin((theta0 + omega_deg_per_s*t)*Math.PI/180)" },
    "i_display":        { "formula": "im*Math.sin((theta0 + omega_deg_per_s*t + phi)*Math.PI/180)" },
    "im_display":        { "formula": "element==='R' ? vm/R : element==='L' ? vm/(omega*L) : vm*omega*C" },
    "theta_readout_display": { "formula": "((theta0 + omega_deg_per_s*t) % 360 + 360) % 360" },
    "phi_arc_display":   { "formula": "Math.abs(phi)" },
    "delta_t_display":   { "formula": "(Math.abs(phi)/360) * T" },
    "T_display":         { "formula": "1/f_demo" },
    "omega_rad_display": { "formula": "2*Math.PI*f_demo" }
  },

  "formulas": {
    "master_rotation":        "theta_v = theta0 + omega*t - ONE closed-form clock per state (theta0 = 0 except S6, where theta0 = -90 deg); theta is identically omega*t from the moment it is drawn (S1) - see R4 resolution, section 3",
    "voltage_projection":     "v = vm sin(theta_v) - the arrow's vertical shadow IS the instantaneous voltage (S1)",
    "shadow_reading":         "shadow = vm sin(theta) - same formula as above, S2's own phrasing: length (vm) is constant, shadow (v) is not",
    "rigid_pair_offset":      "theta_i = theta_v + phi - the i-arrow rides the SAME clock at a LOCKED constant offset phi, never a second free-running phase (S3-S5)",
    "current_projection":     "i = im sin(theta_i), im = vm/R (R) | vm/(omega L) (L) | vm*omega*C (C) - phi = 0/-90/+90 deg respectively",
    "phase_difference":       "phi = angle(v-arrow, i-arrow) - R: 0 deg in phase (S3) | L: 90 deg behind (S4) | C: 90 deg ahead (S5)",
    "angle_time_conversion":  "Delta t = (phi/360deg) * T - the reading convention as algebra, degree-native, T = 4.0 s here (S6; T first tabled HERE, R5 resolution)",
    "derivation_chain":       "theta = omega*t -> one turn = 2 pi rad = one period T -> omega = 2 pi/T = 2 pi f = pi/2 rad/s here -> v = vm sin(omega t) ; i = im sin(omega t -+ pi/2) (S7; minus for L lag, plus for C lead)",
    "explore_formula":        "phi = angle(v, i) - the whole concept in one symbol (S8, core-ring gloss spoken)"
  },

  "constraints": [
    "theta_v(t) = theta0(state) + omega*t at every instant - a pure function of the state's own clock (Rule 26); theta0 = 0 for every state except S6 (theta0 = -90 deg, a declared closed-form phase anchor, never a free-running independent integrator).",
    "The v-arrow's LENGTH is vm and never changes with time inside a state - only its vertical projection (the shadow, v) changes; conflating the two is the S2 pivot misconception.",
    "theta_i(t) = theta_v(t) + phi with phi fixed by the active element alone (0/-90/+90 deg) - the angle between the co-rooted v- and i-arrows is CONSTANT at every instant within a state; it never breathes, and it never depends on omega or vm (S3's f-drag proves this live).",
    "The v-arrow and i-arrow are CO-ROOTED at the disc centre in every multi-arrow state - never chained tip-to-tail (that is series_lcr_circuit's front door, never shown here).",
    "An arrow's upper (peak-line) crossing occurs exactly when its rotation angle is 90 deg (mod 360); the trough crossing (270 deg) is the physically real companion event and NEVER flashes (S6).",
    "No reactance numeral or symbol (X_L, X_C) renders anywhere in this sim, in any state or curriculum cut - the R = X_L = X_C = 5.0 Ohm coincidence at these defaults (the resonance condition) is withheld whole for series_lcr_circuit (F4)."
  ]
}
```

---

## 2. Formula values at chapter defaults - evaluated + independently re-derived

| Quantity | Formula | Value at vm=10.0V, f=0.25Hz | Rendered |
|---|---|---|---|
| omega | 2*pi*f | 1.5707963 rad/s | - |
| omega (deg/s) | omega*180/pi | 90.000 deg/s exactly | - |
| T | 1/f | 4.000 s | "T = 4.0 s" (S6) |
| R branch im | vm/R | 2.0000 A | 2.00 A |
| L branch im | vm/(omega*L) | 1.999999 A | 2.00 A |
| C branch im | vm*omega*C | 1.999624 A | 2.00 A |
| v at theta=45deg | vm*sin45 | 7.0711 V | +7.1 V |
| v at theta=90deg | vm*sin90 | 10.000 V | +10.0 V |
| v at theta=180deg | vm*sin180 | 0.000 V | 0.0 V |
| S6 first crossing (i, C branch) | 90/(90 deg/s) | 1.000 s | "i first - t = 1.0 s" |
| S6 second crossing (v) | 180/(90 deg/s) | 2.000 s | "v - t = 2.0 s" |
| S6 Delta t | (90/360)*4.0 | 1.000 s | "Delta t = 1.0 s" |
| S4 angle-to-time gift | 90/(90 deg/s) | 1.000 s | "that quarter turn is last lesson's one second" |

All independently re-derived in section 0 above; matches the skeleton section 2 and the founder-proxy cycle-1
report's own re-derivation exactly (report section 4 table). No new default anywhere - the carousel consumes
the SEALED sibling decimals R=5.0 Ohm / L=3.1831 H / C=0.1273 F verbatim (never the 10/pi, 0.4/pi fractions,
which are design intent only, per F9).

---

## 3. Resolution of the three assigned residuals (R3, R4, R5)

### R3 - S2's dwell, sized against the arm-slip worst case

**Decision: Option (a) - size S2's dwell for the worst case, with one structural mitigation that shrinks the
actual exposure.**

**Timing arithmetic (independently re-derived, matches the cycle-1 report):** S2's three freeze targets
(45deg, 90deg, 180deg) all occur on the FIRST revolution within the first 2.0 s of the state clock (t=0.5/1.0/2.0s
- see section 0). Since S2's own narration needs at least one intro sentence before the 45deg-arming sentence can
open, and TTS speech takes materially longer than 0.5 s per sentence, **stop 1 (45deg) will typically miss its
FIRST occurrence and fire on its second (t=4.5s)** - this is the ordinary case, not a rare tail. Stops 2 and 3
carry the same risk independently. Worst case (verified against the report's own bound): each of the three
stops slips one full turn, **+4.0 s each, up to +12.0 s cumulative across S2** at the locked default (T=4.0s).

**Structural mitigation (closes the report's "0.1 Hz edge corner" concern for THIS state specifically):**
`f_demo` is LOCKED in S2 - per the architect's control-gating note, f only goes live at S3 - so S2's
`variable_overrides` pins `f_demo: 0.25` explicitly (section 4 below), which is the DEFENSIVE reason this
matters: without the explicit override, a teacher who dragged `f_demo` at S3 and then reordered back to S2
(Rule 25d permits reordering) could leave S2 running at a stale frequency, potentially the 0.1 Hz floor
(T=10s, +10s per slip, per the report). **With the override, S2 can only ever run at the default T=4.0s - the
0.1 Hz worst case the report flags in the abstract can never actually occur inside S2 as authored.**

**Sizing decision:** S2's authored `duration` field stays narration-length (approx 18-20s, matching its
49-word script below) as the NOMINAL pacing estimate - consistent with every other state in the family - but
this is NOT a hard timeout. **Binding instruction to json_author/engine:** the freeze-arm mechanism must never
be capped by the `duration` field; S2's actual observable dwell (until the third freeze has visibly fired) may
legitimately extend to **approx 32 s worst case** (20s narration + 12s worst-case cumulative slip), and THE
EYE / founder_drive's capture window for S2 must be sized to **>= 32 s**, not the narration-only ~18-20s, so
the third freeze is never mis-flagged as "missing" purely from arm-slip timing. The F6 freeze-BUDGET (<=1.0s
per freeze, <=3.0s total FROZEN time) is UNAFFECTED by this - arm-slip only delays *when* a freeze starts,
never its *duration* once it fires - so the two constraints (elastic dwell, tight freeze budget) coexist
without conflict.

**S4 confirmed safe by construction (no action needed, per the report's own instruction to confirm):** S4's
three freezes (30/150/240 deg) arm TOGETHER at a single sentence (not three separate arm points), so the whole
trio necessarily completes within ONE subsequent revolution of that single arm point: worst case, if the arm
instant lands just past 30deg having passed, the trio still finishes within <= T = 4.0s of the arm (targets
span only 210deg of one 360deg turn, so 150 and 240 virtually always catch cleanly on the same pass that
recovers 30). S4's narration budget is 45-55 words (approx 18-22s), giving ample margin over this <=4.0s tail.
No dwell resizing needed for S4.

### R4 - one angle, two symbols, identity made binding (not parenthetical)

**Decision: keep `omega*t` in S1's formula (chapter consistency - all three sealed siblings open on
`v = vm sin(omega t)`) and make the identification a LABEL-LEVEL fix in both S1 and S2 - zero narration cost,
so it never competes with S2's already-tight word budget.**

- **S1 (BINDING, not parenthetical):** the disc's rotation angle carries a PERSISTENT on-canvas tag reading
  literally `omega*t`, anchored beside the rim/arc from the moment the disc appears (t=0 of S1) through every
  later state - this is now a required visible element, not merely narration text describing it. (See section
  4 S1 row.)
- **S2 (the one-clause identification, authored as a LABEL, not spoken narration):** S2's theta readout is
  composed as `theta (= omega*t)` on its first appearance - e.g. `theta = 45 deg (= omega*t)` - rather than a
  bare `theta = 45 deg`. This single label-level change discharges the "one-clause identification" the design
  gate asked for, at ZERO cost to S2's 35-50 word narration budget (which was already tight with the three
  freeze beats - see the word-budget arithmetic in section 6). Once established at S2, later phi/theta
  readouts (S3 onward) may drop back to the bare symbol per the family's own "dual-label once, then bare"
  convention (Rule 38d).
- **Why this satisfies Rule 38a's hide-advanced coherence check:** under the hide-advanced (S7 hidden) preset,
  a student now meets `omega*t` tagged on the disc from S1 and sees `theta (= omega*t)` at S2 - the identity
  is visible on screen throughout the reduced cut, never dependent on reaching the hidden S7 to learn it. S7
  still gets to "reveal" the full algebra (theta = omega*t as a formal derivation step, radians debut) - it is
  stating explicitly a fact the reduced cut has already shown implicitly, which is the correct relationship
  between a core-ring visual fact and its advanced-ring formalization (38c).

### R5 - `T` tabled at its own first-appearance state (S6), co-located with its only use

**Decision: add `T` to the symbol table with first-appearance = S6 itself (not S1), spoken AND shown at the
exact moment it is used - satisfying Rule 25's "no untaught term" by co-locating the definition with the
formula, in the SAME state, rather than by planting it five states earlier.**

Rationale for S6 (not S1): S1 is already DESIGN_OK and untouched by this residual; adding a persistent new
on-canvas tag there would touch a sealed, approved state and add to the canvas-budget pressure the design gate
already flagged as tight (R1/R2, routed to the engine dispatch - not physics_author's to reopen). Defining `T`
at S6, right where the `Delta t = (phi/360) * T` formula needs it, is minimal-footprint and textbook-clean:
S6's own narration (section 6 below) reads *"...one second in - a quarter of the four-second period, T"* - the
symbol, its name ("period"), and its value (4.0s) all land in the SAME breath, immediately before the formula
surface uses it. This is Rule 25's co-location requirement discharged directly, not worked around. Symbol
table row added in section 1 (`"T"` variable) and section 4 (S6 row) below.

---

## 4. Per-state variable notes (`variable_overrides`) - control-gating + defensive locks

| State | `variable_overrides` | Live control(s) | Why |
|---|---|---|---|
| S1 | `{ vm: 10.0, f_demo: 0.25, element: 'R' (R: 5.0) }` | none | Full lock - the congruence-onto-the-resistor-ghost plant needs exact defaults; no i-arrow yet, so only vm/f/R (for the ghost trace) matter. |
| S2 | `{ f_demo: 0.25, element: 'R' (R: 5.0) }` - no override on `vm` | vm (2-20V, plain-live, DF2 pattern) | `f_demo` locked so the three freeze targets (45/90/180 deg) stay at their exact t=0.5/1.0/2.0s defaults regardless of any earlier teacher drag elsewhere (Rule 25d reorder safety - this is also the structural mitigation for R3, section 3). |
| S3 | `{ vm: 10.0, element: 'R' (R: 5.0) }` - CRITICAL defensive re-lock of `vm` (S2 legacy), no override on `f_demo` | f_demo (0.1-0.5Hz, plain-live) | `vm` re-locked immediately (direct application of the family's defensive-lock chain, `default_variables_only_first_var_merged` scar precedent) so only the shared-clock speed is demonstrated (32b); im=2.00A stays f-blind by construction (R branch has no omega dependence). |
| S4 | `{ vm: 10.0, f_demo: 0.25, element: 'L' (L: 3.1831) }` - CRITICAL defensive re-lock of `f_demo` (S3 legacy) | none (f is RE-LOCKED for S4-S7, since a live f here would re-scale im via X and drag reactance on stage, violating 32b) | The three freeze targets (30/150/240 deg) and the "90-per-second gift" narration both assume the exact default omega. |
| S5 | `{ vm: 10.0, f_demo: 0.25, element: 'C' (C: 0.1273) }` | none | Full lock - same reasoning as S4; the flip's fixed 180deg relock sweep and the re-hung arc's 90.0deg reading need exact defaults. |
| S6 | `{ vm: 10.0, f_demo: 0.25, element: 'C' (C: 0.1273), theta0: -90 }` | none | Full lock, PLUS the state-scoped phase-anchor `theta0=-90deg` (section 0/1) - the ONLY non-zero theta0 in this concept, required for the ~1.0s/~2.0s crossing arithmetic (F2). Binding per Escalation section 2: this is a closed-form CONSTANT entry offset, never a free-running second integrator. |
| S7 | `{ vm: 10.0, f_demo: 0.25 }` (element-agnostic - the chain derivation names both L and C generically, no specific element rendered) | none | Full lock - the stated omega=pi/2 rad/s = 90 deg/s numeric anchor throughout the chain needs exact defaults. |
| S8 | (none - inherits `default_variables`: vm=10.0, f_demo=0.25, element='R', R=5.0) | ALL: vm, f_demo, element picker (R/L/C), element-VALUE row-swap slider (F8) | Explore - no lock needed since nothing else constrains it (Rule 37 free-run). |

**Off-grid element-VALUE slider note (F8, confirmed fleet precedent per the cycle-1 report, not a new
hazard):** the S8 element-value rows are the sealed sliders verbatim - `R 2-20 Ohm step1 default5.0` (on-grid),
`L 1.0-10.0 H step0.1 default3.1831` (OFF-grid), `C 0.04-0.40 F step0.02 default0.1273` (OFF-grid). Off-grid
initial value + snap-on-first-drag is the fleet's own already-shipped behaviour (verified against
`ac_voltage_inductor`/`ac_voltage_capacitor`'s sealed slider CSS, cycle-1 report section 3) - do not narrow
the ranges or round the defaults to "fix" this.

---

## 5. Within-state motion timeline + per-state control spec (Rule 31)

Shared machinery (define once): **master rotation** `theta_v(t) = theta0(state) + omega*t` (omega = 90deg/s
at defaults); **rigid pair offset** `theta_i(t) = theta_v(t) + phi`, phi fixed per active element;
**upper-crossing test** `(theta mod 360) crosses 90deg, increasing` (S6 only). Every row below is a pure
function of the state's own clock (Rule 26) - no dt-accumulator anywhere.

| State | t-window | What animates | Driven by | Live controls |
|---|---|---|---|---|
| S1 | continuous from t=0 | v-arrow (cyan, length vm) rotates CCW at omega; disc rim carries a PERSISTENT `omega*t` tag (BINDING, R4) | theta_v(t) | none |
| S1 | ~0.6-1.0s after entry (32a beat) | projection tie-line wires arrow-tip to scope pen | theta_v(t) | - |
| S1 | continuous once wired | pen re-draws the dashed resistor-ghost trace exactly on top of itself, crest for crest, over one full turn (T=4.0s) | v(t)=vm*sin(theta_v) | - |
| S2 | continuous from t=0, theta0=0 | v-arrow keeps spinning; live theta readout tracks, composed `theta (= omega*t)` on first appearance (R4) | theta_v(t) | vm (arrow+trace scale together, spin rate untouched) |
| S2 | cue-armed at s2/s3/s4 opens, phase-fires at next theta=45/90/180deg | 3 chronological freeze stops (F2); whole theta-driven scene halts <=1.0s each, <=3.0s total (F6); struck `v=10V?` at 45deg (true HUD +7.1V), agreement mark at 90deg (both read 10V, "only here"), shadow 0.0V at 180deg (arrow still 10.0V long) | phase-match on theta_v(t) | - |
| S3 | t=0 | amber i-arrow docks at origin, theta_i=theta_v (phi=0, R branch), length proportional to 2.00A on its own scale | theta_i(t)=theta_v(t) | none until s4 |
| S3 | continuous | pair rotates rigidly; pen draws BOTH traces over the resistor lesson's dashed pair, in step; arc opens reading `phi=0.0deg` | theta_v(t), theta_i(t) | - |
| S3 | from live-control invite (s4) | dragging f spins both arrows faster together; lock never opens; im stays 2.00A (f-blind, R branch has no omega) | theta_v(t),theta_i(t) via omega(f_demo) | f_demo |
| S4 | on naming sentence | apparatus swap (heater out, coil in, cloned asset); i-arrow re-locks to theta_i=theta_v-90 (phi=-90, L lag); arc widens 0->90deg visibly; pen re-draws the inductor lesson's exact lagging pair over its ghost | theta_i(t)=theta_v(t)+phi(L) | none (f re-locked) |
| S4 | cue-armed together at one sentence, phase-fires at next theta_v=30/150/240deg (chained, inside one turn) | 3 freezes, whole scene halts <=1.0s each <=3.0s total; arc reads `phi=90.0deg` every time (constancy asserted only over these 3 proven samples, section 10j of skeleton) | phase-match on theta_v(t) | - |
| S4 | after freezes | plant clause spoken (no new motion): "arrow ahead in spin peaks first"; 90deg/s gift spoken (quarter turn = 1.0s of last-lesson lateness) | - | - |
| S5 | on naming sentence | apparatus swap (coil out, plates in); i-arrow FLIPS in one continuous scripted sweep, theta_i: theta_v-90 -> theta_v+90 (180deg relock, cue-bound, holds end pose); arc re-hangs on the OTHER side reading `phi=90.0deg` ahead; pen re-draws the capacitor lesson's exact leading pair over its ghost | theta_i(t) scripted one-shot, theta_v(t) unaffected | none |
| S5 | after flip | nothing else moves (32b) - rigid rotation resumes at theta_i=theta_v+90 (phi=+90, C lead) | theta_v(t), theta_i(t) | - |
| S6 | t=0, theta0=-90 (ANCHOR, section 0/1) | peak line brightens into the finish line; C's pair spins from the anchored entry (v-arrow at -90deg, i-arrow at 0deg) | theta_v(t)=-90+omega*t, theta_i(t)=theta_v(t)+90 | none |
| S6 | armed s2, fires at first i-upper-crossing (t~1.0s) | flash + DERIVED timestamp ("i first - t=1.0s"); matching i-trace crest pulses in the sine strip | theta_i upper-crossing test | - |
| S6 | armed s3, fires at first v-upper-crossing (t~2.0s) | flash + DERIVED timestamp ("v - t=2.0s"); v-crest pulses; Delta t=1.0s (=(90/360)*T, T defined here, R5) | theta_v upper-crossing test | - |
| S6 | after crossings | disc rotation eases to a stop; region splits into the 3-diagram scoreboard (R phi=0deg, L "i 90deg behind", C "i 90deg ahead") - angle labels + element glyphs ONLY, no numerals (F4); holds as end pose | scripted one-shot | - |
| S7 | apparatus dims (E4 restore pattern), disc keeps turning slowly beside the Cambria panel | 4 chain docks (theta=omega*t; omega=2pi/T=2pi*f=pi/2 rad/s; v=vm*sin(omega t); i=im*sin(omega t -+ pi/2)); live theta readout switches from degrees to radians, sweeping the named values | theta_v(t) (slow), cue-bound docks | none |
| S8 | free-runs forever (Rule 37, never freezes) | element picker re-locks i-arrow's phi instantly; element-VALUE drag re-scales im (and i-arrow length) WHILE the locked angle holds DEAD STILL - the concept's own core claim under the teacher's hand (F8/section 10j of skeleton); vm/f_demo drags re-scale/re-pace everything live | theta_v(t),theta_i(t) continuous, all inputs live | ALL: vm, f_demo, element (R/L/C), element-VALUE |

**Rule 32 sequencing confirmed:** S1 (arrow spins -> tie-line wires -> pen draws - three readable beats); S2
(freeze lands -> struck reading appears -> true HUD confirms); S4 (coil docks -> arc opens -> traces lag ->
freezes); S5 (plates dock -> flip -> re-hung arc); S6 (arrow crosses -> flash -> trace-crest pulses). No two
states share a motion signature except the ONE declared contrast pair (S3/S4, both `rigid-pair-rotation`,
delta = the locked angle opening 0->90deg). No static state - the disc rotates in every state including inside
declared freeze windows' brief bounded halts (F6).

---

## 6. Narration (`text_en`, Rule 31a word budget) + on-canvas label spec + drill-downs

Word counts independently verified (Python `str.split()` count).

### STATE_1 `spin_draws_the_wave` - core - 40-55w budget - **53-55 words**

**On-canvas (BINDING, R4):** disc rim carries a persistent label `omega*t` (rendered `ωt`) beside the rotation
arc, visible from t=0 and unchanged through every later state. Formula surface: `v = vm sin(omega t)`. Ghost
trace legend: "the trace you measured (lesson 1)". glow_focal = `projection`.

```
s1_1 (glow: v_phasor): "The same resistor circuit, but now an arrow spins beside it, angle tagged ωt."
s1_2 (glow: projection): "Its tip casts a shadow straight down onto the scope, and that shadow starts drawing."
s1_3 (glow: v_trace): "One turn later, the shadow lands exactly on the wave you already measured."
s1_4 (glow: v_phasor): "This spinning arrow is called a phasor — one turn is one full cycle."
```
Word count: 14 + 15 + 13 + 13 = **55**.

### STATE_2 `arrow_and_shadow` - core - 35-50w budget - **49 words** - 16a pivot #1

**On-canvas (R4):** theta readout composed `theta = 45deg (= omega*t)` (rendered `θ = 45° (≡ ωt)`) on FIRST
appearance this state (label-level identity, not spoken - zero narration cost). Later states may drop back to
bare `theta`. Formula surface: `shadow = vm sin(theta)`. Three freeze captions (F1 single-latest pattern):
struck `v = 10 V?` beside true HUD `v = +7.1 V` at 45deg; unstruck agreement mark at 90deg; final
`shadow 0.0 V` at 180deg. glow_focal = `v_phasor`.

```
s2_1 (glow: v_phasor): "That arrow is bookkeeping — nothing in the circuit itself spins."
s2_2 (glow: v_phasor, cue: freeze_45_arm): "Freeze at forty-five: length reads ten volts — wrong, the true shadow is seven point one."
s2_3 (glow: v_phasor, cue: freeze_90_arm): "At ninety, length and shadow finally agree — ten volts, only here."
s2_4 (glow: v_phasor, cue: freeze_180_arm): "At a hundred eighty, shadow reads zero — the arrow's still ten volts long."
```
Word count: 10 + 15 + 11 + 13 = **49**.

**misconception_watch (16a, exactly as skeleton section 4):** belief "the arrow IS the physical quantity -
something in the circuit is rotating, and its size is the value right now"; visual_counter = the struck
wrong-readout at 45deg beside the true HUD, arrow visibly still full length, beads doing exactly what they did
all chapter; one_line_fix = "The arrow is bookkeeping — its length is the peak, its shadow is the now; nothing
in the circuit spins."

### STATE_3 `two_arrows_one_clock` - core - 35-50w budget - **50 words**

**On-canvas:** angle ARC opens reading `phi = 0.0deg`, dual-labeled once "phase difference φ" then bare.
i-arrow tagged `im` at tip, own amber scale, distinct arrowhead from the v-arrow. Formula surface:
`phi = 0deg - in phase`. glow_focal = `i_phasor`.

```
s3_1 (glow: i_phasor, cue: i_arrow_dock): "A second arrow joins — amber for current — locked in step with voltage."
s3_2 (glow: i_phasor): "It's two amps on its own scale — volt-arrows and amp-arrows never compare lengths, only angle."
s3_3 (glow: angle_arc, cue: arc_open): "That angle is the phase difference φ — zero here, in step together."
s3_4 (glow: i_phasor, cue: f_invite): "Speed up the clock: both spin faster, the lock never opens."
```
Word count: 12 + 15 + 12 + 11 = **50**.

### STATE_4 `lag_becomes_an_angle` - core - PRIMARY AHA - 45-55w budget - **54 words** - 16a pivot #2

**On-canvas:** arc widens 0->90deg visibly, reads `phi = 90.0deg` (constant across all 3 freezes). Formula
surface: `phi = 90deg - i behind v`. glow_focal = `angle_arc`.

```
s4_1 (glow: i_phasor, cue: coil_swap): "Heater out, coil in — the current arrow snaps ninety degrees behind voltage."
s4_2 (glow: angle_arc, cue: freeze_trio_arm): "Freeze anywhere — thirty, a hundred fifty, two forty — the angle always reads ninety."
s4_3 (glow: angle_arc): "One shared clock, one locked angle: timing has frozen into geometry."
s4_4 (glow: angle_arc): "Whichever arrow's ahead in the spin peaks first — that quarter turn is last lesson's one second of lateness."
```
Word count: 12 + 13 + 11 + 18 = **54**.

**misconception_watch (16a, exactly as skeleton section 4):** belief "phase difference is a time delay you can
only see by watching traces over a whole cycle — a frozen diagram can't hold timing"; visual_counter = three
freezes at three different instants, both arrows somewhere new every time, arc reading `phi=90.0deg` every
time; one_line_fix = "Both arrows ride one clock, so the angle between them never changes — one snapshot holds
the whole timing story."

**Note on `s4_2`'s cue semantics (confirms R3's "S4 safe by construction"):** this ONE sentence arms all three
freeze targets together (30/150/240deg) — not three separate arm points — which is exactly the mechanism the
cycle-1 report verified as slip-safe (section 3 above).

### STATE_5 `lead_is_the_mirror` - core - 30-45w budget - **41 words**

**On-canvas:** arc re-hangs on the other side, reads `phi = 90.0deg` ahead. Formula surface:
`phi = 90deg - i ahead of v`. glow_focal = `i_phasor`.

```
s5_1 (glow: i_phasor, cue: flip_start): "Coil out, plates in — watch the current arrow sweep clean across, from ninety behind to ninety ahead."
s5_2 (glow: angle_arc): "Same right angle, just the mirror side — the capacitor's current now leads instead of lags."
s5_3 (glow: i_phasor): "Everything else holds still — only that one angle flipped."
```
Word count: 17 + 15 + 9 = **41**.

### STATE_6 `read_the_frozen_diagram` - extended - 40-55w budget - **55 words**

**On-canvas:** peak line brightens into the labeled "finish line" (line exists unlabeled from S1). Crossing
flash + DERIVED timestamps on clear baselines (E9 class). Scoreboard: R `phi=0deg`, L `i 90deg behind`,
C `i 90deg ahead` — angle labels + element glyphs ONLY, NO numerals (F4). Formula surface:
`Delta t = (phi/360deg) * T` (T tabled HERE, first appearance — R5 resolution). glow_focal = `finish_line`.

```
s6_1 (glow: finish_line, cue: line_brighten): "That vertical line is the finish line — first past it, peaks first."
s6_2 (glow: finish_line, cue: i_cross_arm): "Watch current cross first, one second in — a quarter of the four-second period, T."
s6_3 (glow: finish_line, cue: v_cross_arm): "Voltage follows a quarter turn later, at two seconds — crossing order is cresting order."
s6_4 (glow: element, cue: scoreboard_split): "The whole chapter fits in three frozen diagrams: resistor in step, coil behind, capacitor ahead."
```
Word count: 12 + 14 + 14 + 15 = **55**.

### STATE_7 `angle_is_omega_t` - advanced - 45-55w budget - **55 words**

**On-canvas:** live theta readout switches to radians (38c debut). Formula surface (chain, 4 docks):
`theta = omega*t -> omega = 2pi/T = 2pi*f -> v = vm sin(omega t) -> i = im sin(omega t -+ pi/2)`.
glow_focal = `formula`.

```
s7_1 (glow: formula, cue: chain_1): "The angle is simply ωt — one turn is two pi radians, one period."
s7_2 (glow: formula, cue: chain_2): "Here that's omega equals two pi over T — pi over two radians a second."
s7_3 (glow: formula, cue: chain_3): "Voltage is vₘ sine ωt; current is iₘ sine of ωt, plus or minus pi over two."
s7_4 (glow: formula, cue: chain_4): "Same arrow, started ninety degrees earlier or later around the circle."
```
Word count: 13 + 14 + 17 + 11 = **55**.

### STATE_8 `phasor_sandbox` - core (ring-neutral) - 0/open (explore)

Formula surface: `phi = angle(v, i)` (rendered `φ = ∠(v, i)`, core-only, 38b). Scoreboard + timestamps
deliberately ABSENT (extended-ring gate). glow_focal = `formula`.

```
s8_1 (glow: formula): "It's all yours — drag peak voltage, frequency, and pick the element; watch the angle hold rock steady while everything else responds live."
```

---

## 7. Drill-down cluster phrasings (9 clusters x 5 phrases = 45)

### S1 - `circle_to_sine_projection`
- "how does a circle turn into a wave"
- "why does spinning make a sine curve"
- "im not seeing how the shadow becomes the graph"
- "why is the wave secretly a circle"
- "how do you get a smooth wave out of something going round and round"

### S1 - `what_actually_rotates_phasor`
- "what is actually spinning in the circuit"
- "is something physically rotating inside the wire"
- "does the phasor arrow exist for real or is it just a drawing"
- "what part of the circuit is the arrow representing"
- "is there a real spinning thing i cant see"

### S1 - `one_turn_one_cycle`
- "why does one spin equal one wave cycle"
- "how is a full circle the same as one period"
- "does the arrow have to go exactly once around for one cycle"
- "why not half a turn for one cycle"
- "whats the connection between degrees of spin and seconds of time"

### S4 - `angle_vs_time_delay_conversion`
- "how do i turn ninety degrees into seconds"
- "why does an angle even represent a time delay"
- "is ninety degrees always one second or does that change"
- "how do degrees and seconds connect on this diagram"
- "why is a quarter turn the same as a quarter cycle"

### S4 - `frozen_diagram_still_shows_lag`
- "how can a still picture show something that happens over time"
- "if its frozen how do i know theres a delay at all"
- "doesnt a snapshot lose the timing information"
- "how does one frame carry a whole cycle of lag"
- "why does a paused picture still tell me who is late"

### S4 - `why_angle_never_changes`
- "why doesnt the angle between the arrows ever move"
- "shouldnt the lag angle change as time goes on"
- "why is the gap between the arrows always the same"
- "does the angle ever open or close over time"
- "why is this angle constant when everything else in ac keeps changing"

### S6 - `which_phasor_leads_on_diagram`
- "how do i tell which arrow is ahead just by looking"
- "on a printed diagram how do i know which one leads"
- "which arrow do i look at first to find the lead"
- "how can i read lead or lag off a still picture"
- "whats the trick for spotting the leading phasor"

### S6 - `rotation_direction_convention_ccw`
- "why does the arrow spin counterclockwise and not the other way"
- "does the spin direction actually matter"
- "what if i imagined it spinning clockwise instead"
- "is counterclockwise just a convention or is it physically required"
- "would the diagram mean something different if it spun the other way"

### S6 - `arrow_length_across_units_trap`
- "can i compare the length of the voltage arrow to the current arrow"
- "why cant i say the current arrow is smaller so its weaker"
- "do the two arrow lengths mean anything when compared to each other"
- "is a ten unit arrow bigger than a two unit arrow in any real sense"
- "why do volts and amps arrows use different scales"

---

## 8. Constraint callouts (engineering)

1. **`radians()` wrap required.** All internal trig (`v = vm sin(theta_v)` etc.) must wrap the degree-native
   `theta` values in `radians()` before calling `sin`/`cos` - `theta_v` and `theta_i` are authored/displayed
   in DEGREES throughout (38c: no radians before S7); only S7's live readout and its own chain formulas switch
   to native radians.
2. **HUD display precision:** `v` -> 1dp signed (`+7.1 V`); `i`/`im` -> 2dp signed (`+2.00 A`); `theta` -> 1dp
   degrees (S2-S6), integer-friendly at named stops; `phi` (arc) -> 1dp degrees (`90.0deg`); `Delta t`/timestamps
   -> 1dp seconds (`1.0 s`); `T` -> 1dp seconds (`4.0 s`).
3. **`L`'s default (3.1831H) and `C`'s default (0.1273F) are deliberately OFF their S8 step grids** - forced by
   chapter-continuity design (both give approx 5.0 Ohm exactly at defaults, matching the family). Do not round
   the authored defaults to grid-aligned values; the off-grid-initial/snap-on-first-drag behaviour is
   confirmed fleet precedent (section 4 above), not a new hazard.
4. **`theta0 = -90deg` is the ONLY non-zero state-entry phase anchor in this concept**, scoped to S6 alone
   (section 1, section 4) - it is a CONSTANT (never a ramp, never a second free-running integrator),
   consistent with the E3 phase-anchor pattern the family already uses for scripted ramps, just without a ramp
   here.
5. **`phi` is a state-scripted constant (0/-90/+90 deg), never a slider** - it is set via each state's
   `variable_overrides`/active-element flag, not exposed as a draggable control until S8's element picker,
   which discretely re-locks it rather than sweeping it continuously.
6. **No tip-to-tail addition anywhere** - every multi-arrow state's v-arrow and i-arrow share the SAME root
   (disc centre); the engine must render them co-rooted, never chained.
7. **No reactance token (`X_L`, `X_C`) in any authored string, in any state** - the compose-routine promotion
   (section 0b req 7 of the skeleton) exists for `v_m`/`i_m` only in this concept; do not port the siblings'
   `X_L`/`X_C` compose calls here (F4).
8. **S8's element-VALUE drag must re-scale `im` (hence i-arrow length) while `phi` (hence the arc reading)
   stays completely inert** - this is the concept's own core physics claim under the teacher's hand (F8) and
   must be independently measurable (section 10j of the skeleton: an S8 element-value change at a non-default
   `f` provably moves im, proving the im-drive is live BEFORE its invariance under any f-drag elsewhere is
   asserted).
9. **S6's `theta0=-90deg` anchor is scoped to S6 ONLY** - S7's disc (which keeps turning slowly beside the
   derivation panel) and S8's free-running disc both use `theta0=0`, matching every other state; do not carry
   the S6 anchor forward.
10. **The S2/S4 freeze-window exemption** ("beads keep oscillating OUTSIDE the freeze windows") must be
    computed from the ACTUAL cue-fire log (the F7 fillText-interception probe), never from authored `at_ms`
    values - `at_ms` are arming fallbacks only, never firing instants (binding per the skeleton's R8 residual,
    routed to quality_auditor/engine, restated here for awareness).

---

## Self-review checklist

- [x] Every symbol in the skeleton's state narratives (v, i, vm, im, theta, phi, omega, T, Delta t, theta0)
  appears in `variables` (section 1) with an explicit first-appearance state where Rule 25 requires one.
- [x] Every formula wraps degree-native angles in `radians()` before any `sin`/`cos` call (section 8.1);
  native radians confined to S7 (38c).
- [x] Every state's live control(s) declared exactly per the architect's control table (vm->S2, f_demo->S3,
  ALL->S8), each with default/min/max/step in section 1, matching the sealed sibling slider ranges verbatim.
- [x] `variable_overrides` documented for all 8 states (section 4); S3's `vm` and S4's `f_demo` re-locks
  flagged CRITICAL (defensive-lock chain, direct application of `default_variables_only_first_var_merged`);
  S6's `theta0=-90` flagged as the concept's one special-case phase anchor.
- [x] Board-mode section explicitly SKIPPED (Rule 20 [D]) - not authored anywhere in this block.
- [x] Drill-down cluster phrasings: 9 clusters x 5 phrases = 45, real-student-voice, plain English, no
  Hinglish, no textbook prose.
- [x] `constraints` block: 6 short physics assertions (section 1) + 10 engineering constraint callouts
  (section 8).
- [x] Numerical sanity check run and independently Python-verified (section 0): omega=90.000deg/s exact,
  T=4.0s, R/L/C branches all render 2.00A, v(45deg)=+7.1V, S6 crossings at 1.0s/2.0s with Delta t=1.0s exact -
  all reproduced independently, matching both the skeleton section 2 and the founder-proxy cycle-1 report's
  own re-derivation.
- [x] Within-state motion timeline written for all 8 states (section 5): every row a pure function of the
  state clock theta(t)=theta0+omega*t (Rule 26); no dt-accumulator; controls column matches the architect
  table exactly; no two states share a motion signature except the ONE declared contrast pair (S3/S4).
- [x] **Rule 32 sequencing verified per state** (section 5 closing note): cause-before-effect with a readable
  beat in S1/S2/S4/S5/S6; only the taught variable's motion changes per state (32b); "never let the locked
  angle breathe" binding caution honored - phi is always the rigid, per-arrow-constant offset of ONE
  closed-form clock, never two independent integrators (Escalation section 2).
- [x] **Word budget (Rule 31a) verified by script, not estimate:** S1=55, S2=49, S3=50, S4=54, S5=41, S6=55,
  S7=55 - all inside their per-state bands from the architect's table; S8 open/0 (explore).
- [x] **Notation ladder (Rule 38c):** S1-S6/S8 formula surfaces are algebra-only, degree-native (`phi=90deg`,
  `Delta t=(phi/360)*T`); radians and the theta=omega*t-as-derivation confined entirely to S7. **Dialect
  (38d):** `theta (= omega*t)` dual-labeled once at S2, bare thereafter - the R4 resolution.
- [x] The three assigned residuals (R3, R4, R5) each resolved explicitly with timing/physics arithmetic, not
  merely restated (section 3).
- [x] Engine bug queue consulted LIVE (`--owner alex:physics_author`, `phasors`, `--field3d --open` grepped
  for the relevant scar classes) - no new gap found beyond what the skeleton's section 0a table already
  threads.
- [x] DC Pandey check: no formula, explanation, or example problem imported from any external book - every
  formula in section 1 derived directly from uniform-rotation projection + the three sealed sibling phase
  facts, independently re-verified numerically (section 0).

---

**Files/commands referenced (read-only + live queries, no edits made):**
- `docs/loop_runs/ch7/phasors/skeleton.md` (input contract, full read, both halves)
- `docs/loop_runs/ch7/phasors/founder_proxy_report_checkpointA_cycle1.md` (the design-gate verdict + the three
  assigned residuals, full read)
- `src/data/concepts/ac_voltage_resistor.json`, `ac_voltage_inductor.json`, `ac_voltage_capacitor.json` (sealed
  sibling slider ranges + defaults, verified via targeted grep)
- `docs/loop_runs/ch7/ac_voltage_capacitor/physics_block.md` (format/rigor precedent - physics independently
  re-derived for phasors, not copied)
- `npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts` (live DB consultation)
- `python3` (all numeric verification in section 0, and an independent word-count script for section 6)

This physics block is ready to append to `skeleton.md` and hand to the section 0b engine dispatch (NEW
`scenario_type: "ac_phasor"` + the compose-routine promotion) followed by `json_author`.
