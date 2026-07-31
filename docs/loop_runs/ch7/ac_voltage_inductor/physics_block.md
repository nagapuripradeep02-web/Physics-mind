# Physics Block — `ac_voltage_inductor`

**Engine bug queue consulted** (live `query_engine_bug_queue.ts`, not just the mirror): `--field3d --open` (28 rows), `--owner alex:physics_author` (6 rows — the `DUALPANEL_*` triad is mechanics_2d/PCPL-generic, N/A to field_3d, same as the sibling's finding), `ac_voltage_inductor` (0 rows — not yet seeded, expected pre-json_author). Cross-checked the two freshest FIXED scars by `git log -1` on their commit SHAs since they postdate this worktree's last DB mirror sync:
- **`field3d_dt_accumulated_motion_invisible_to_eye_timepin`** (`ad7975b`) — root cause was a **per-frame accumulator** (`+= K·dt`) for a scripted drift, invisible to `SET_TIME_FREEZE` because a `dt>0.2` guard zeroed it. Fix pattern: replace with a **pure closed-form function of absolute state-local `t`**, reconstructible at any pinned `t` with zero per-frame history — proven by re-pinning to an earlier timestamp after a later one and getting a byte-identical value. **Directly drives my S5 design below** (the f-ramp phase MUST use this exact pattern, not an accumulator).
- **`field3d_rms_subscript_ascii_in_renderer_text_paths`** (`4dc1c76`) — ASCII subscripts survived on renderer-hardcoded text paths even though the concept JSON's own overlay used Unicode; the **canvas-drawn graph labels additionally needed a font swap** (9px monospace renders subscript glyphs as an illegible blob — Cambria Math renders cleanly at the same size). **Directly informs my `ₗ` (Xₗ) glyph flag** in §6.
- **`ghost_compare_cause_invisible_slider_frozen`** (OPEN) — a scripted variable-sweep demo must move the DOM slider thumb + numeric label in lockstep with the script value. Applies to S5's `f_demo` (binding, honored below); does **NOT** apply to S4's `vₘ` (nothing scripts it — plain live slider, no lockstep duty).
- **`field3d_formula_overlay_generic_not_cambria_math`** (OPEN) — routes every formula in §1 through the dedicated cloned panel (`#acr_formula`/`#acr_derivation` lineage), never the generic `#formula_overlay`.
- **`default_variables_only_first_var_merged`** (FIXED, canonical) — every non-trivial-default variable (`vm`, `L`, `f_demo`) must be explicitly declared/overridden per state, never left to fall through. Drives the CRITICAL defensive-lock chain in §2 (S5–S8 must re-lock `vm` after S4 leaves it live-dragged; S6–S8 must re-lock `f_demo` after S5's ramp/drag).
- `field3d_sliders_panel_top12_vs_fsbtn_top10` (OPEN) — any new DOM panel (Xₗ readout, U-gauge, meter) uses `top:52px+` on both edges (already carried in skeleton §0h).

**DC Pandey check:** none consulted. Every formula below is re-derived directly from `v = L di/dt` + trig identities + elementary calculus, independently numerically verified (Python, shown inline where non-trivial — see the closed-form ramp-integral verification in §3 S5, checked against direct numerical integration to <1e-11 error).

---

## 1. `physics_engine_config`

```json
{
  "variables": {
    "vm":     { "name": "Peak (amplitude) voltage across the inductor", "unit": "V", "min": 2, "max": 20, "default": 10.0, "step": 1, "role": "driver" },
    "L":      { "name": "Self-inductance of the coil", "unit": "H", "min": 1.0, "max": 10.0, "default": 3.1831, "step": 0.1, "role": "driver" },
    "f_demo": { "name": "Demo-compressed AC frequency (real mains is tens of Hz)", "unit": "Hz", "min": 0.1, "max": 0.5, "default": 0.25, "step": 0.05, "role": "driver" },

    "omega":  { "name": "Angular frequency", "unit": "rad/s", "derived": "omega = 2*PI*f_demo" },
    "theta":  { "name": "Instantaneous phase — NATIVE radians, state-local clock (Rule 26)", "unit": "rad",
                 "derived": "theta = omega * t   [EXCEPT S5 while undragged, which uses the closed-form ramp-phase accumulator of §3 S5 in place of omega*t]" },

    "Xl":     { "name": "Inductive reactance — the coil's frequency-made opposition", "unit": "Ω", "derived": "Xl = omega * L" },
    "im":     { "name": "Peak (amplitude) current", "unit": "A", "derived": "im = vm / Xl" },
    "v":      { "name": "Instantaneous voltage across the inductor", "unit": "V", "derived": "v = vm * sin(theta)" },
    "i":      { "name": "Instantaneous current", "unit": "A", "derived": "i = im * sin(theta - PI/2) = -im * cos(theta)   [lags v by exactly PI/2 rad = 90° = T/4, always]" },
    "slope_i":{ "name": "Instantaneous slope of the current — the S4 PRIMARY-aha value, the tangent-walk cursor's live number", "unit": "A/s",
                 "derived": "slope_i = v / L   [exact at every instant — v = L di/dt rearranged; NEVER a hardcoded 3.14, since v (and hence slope_i) is live-draggable at S4]" },
    "eps_back": { "name": "Back-emf induced across the coil's own turns (S3)", "unit": "V", "derived": "eps_back = -v   [Lenz: opposes the applied voltage volt-for-volt, at every instant, both while i rises AND falls]" },

    "p":      { "name": "Instantaneous power delivered TO the inductor (S6/S8) — SIGNED, unlike ac_voltage_resistor's p", "unit": "W",
                 "derived": "p = v * i = -(vm*im/2) * sin(2*theta)   [+ = storing into the field, − = field returning energy to the source]" },
    "p_amp":  { "name": "Amplitude of the power oscillation", "unit": "W", "derived": "p_amp = vm*im/2" },
    "p_avg":  { "name": "Cycle-average power — EXACT zero, and over an interval as short as T/2 = π/ω (p's own period), not just a full T", "unit": "W", "derived": "p_avg = 0" },

    "U":      { "name": "Energy stored in the inductor's magnetic field, instantaneous — the U-gauge value", "unit": "J",
                 "derived": "U = 0.5 * L * i^2 = Umax * cos(theta)^2   [breathes 0 <-> Umax TWICE per source period T; dU/dt = p(t) exactly — verified analytically, §3]" },
    "Umax":   { "name": "Maximum stored energy — the U-gauge's ceiling AND the p-strip store-lobe's shaded area", "unit": "J", "derived": "Umax = 0.5 * L * im^2" },

    "lag_seconds": { "name": "Time lag between the v-peak and the i-peak — the S2 bracket's number", "unit": "s",
                       "derived": "lag_seconds = T/4 = 1/(4*f_demo)   [shrinks as f_demo rises — if the S2 bracket persists visually into S5, its TIME label must rescale live with f_demo]" },
    "lag_degrees": { "name": "Phase lag in degrees — frequency-INDEPENDENT, always exactly a quarter cycle", "unit": "deg", "constant": 90 },

    "bead_frac": { "name": "Micro-band wire-bead position fraction, 0/1=ends 0.5=home (Rule 33b)", "unit": "dimensionless",
                     "derived": "bead_frac = 0.5 - A_frac * sin(theta)   [d(bead_frac)/dt ∝ i(t); beads are momentarily AT REST exactly when i=0 — i.e. at the v-PEAK instants — the S1 plant]" },
    "A_frac":    { "name": "Bead-excursion visual scale, calibrated to 0.30 at defaults (fleet convention, §0b reuse note)", "unit": "dimensionless",
                     "derived": "A_frac = clamp(0.30 * (im/omega) / (2.00/1.5708), 0.08, 0.42)" },

    "field_brightness": { "name": "Coil field-loop brightness/density — cool blue-cyan geometry ONLY, the coil BODY never receives this or any emissive (Rule 33d)", "unit": "dimensionless (0–1)",
                            "derived": "field_brightness = U/Umax = cos(theta)^2   [max exactly when i is at ITS OWN peak, i.e. at v=0 — the S1 plant; self-normalized to that state's own Umax, safe at every slider corner, no separate fixed reference needed]" },
    "arrow_dir": { "name": "Wire-current arrow direction / field-loop circulation sense", "unit": "sign (±1)",
                    "derived": "arrow_dir = sign(i) = -sign(cos(theta))   [flips at i's zero crossings: t = T/4, 3T/4, ... i.e. AT THE v-PEAK instants — the OPPOSITE timing from ac_voltage_resistor's arrow, which flips at v-zero. Binding — see §3 S1/S3.]" }
  },

  "computed_outputs": {
    "v_display":        { "formula": "vm*Math.sin(omega*t)" },
    "i_display":         { "formula": "-im*Math.cos(omega*t)" },
    "im_display":        { "formula": "vm/(omega*L)" },
    "Xl_display":        { "formula": "omega*L" },
    "slope_display":     { "formula": "vm*Math.sin(omega*t)/L" },
    "eps_back_display":  { "formula": "-vm*Math.sin(omega*t)" },
    "p_display":         { "formula": "-(vm*im/2)*Math.sin(2*omega*t)" },
    "U_display":         { "formula": "0.5*L*im*im*Math.cos(omega*t)*Math.cos(omega*t)" },
    "Umax_display":      { "formula": "0.5*L*im*im" },
    "field_brightness_display": { "formula": "Math.cos(omega*t)*Math.cos(omega*t)" },
    "bead_frac_display": { "formula": "0.5 - A_frac*Math.sin(omega*t)" },
    "lag_seconds_display": { "formula": "1/(4*f_demo)" },
    "avg_p_display":    { "formula": "0.0" }
  },

  "formulas": {
    "instantaneous_voltage":  "v = vₘ sin(ωt) — the applied AC voltage, ω = 2πf_demo",
    "faraday_relation":       "v = L·(di/dt) — the defining law: voltage sets the current's SLOPE, not its size (S4 PRIMARY aha)",
    "instantaneous_current":  "i = iₘ sin(ωt − 90°) = −iₘ cos(ωt), iₘ = vₘ/Xₗ — current lags voltage by exactly a quarter cycle",
    "back_emf":               "ε_back = −v — the coil's induced emf opposes the applied voltage volt-for-volt at every instant (S3)",
    "reactance":              "Xₗ = ωL — the frequency-made opposition; Xₗ→0 as ω→0 (a DC-steady inductor is an ideal short)",
    "instantaneous_power":    "p = v·i = −(vₘiₘ/2) sin(2ωt) — SIGNED, symmetric about zero, twice the source frequency",
    "average_power":          "⟨p⟩ = 0 EXACTLY — not approximately — over any interval that is a whole multiple of T/2 = π/ω",
    "stored_energy":          "U = ½Li² = Umax cos²(ωt), Umax = ½Liₘ² — breathes 0↔Umax twice per source period; dU/dt = p(t) exactly (energy conservation, verified analytically)",
    "lobe_area_link":         "∫ p dt over any store quarter = Umax exactly — e.g. (vₘiₘ/2)/ω·[cos(2ωt₁)−cos(2ωt₂)] evaluated over a store window returns Umax bit-for-bit (verified §3 S6)",
    "point_symmetry_fold":    "p(t_c+τ) = −p(t_c−τ) at ANY zero crossing t_c of p(t) — every positive lobe is the EXACT 180°-point-rotation of its trailing negative lobe about their shared zero crossing (S8's fold; distinct construction from the sibling's half-height fold)",
    "closed_form_derivation": "v=L di/dt → i=−(vₘ/ωL)cos ωt = iₘ sin(ωt−π/2); the ω in the denominator IS Xₗ's frequency-dependence, and the −cos IS the 90° lag — one integration yields both headline results (S8)"
  },

  "constraints": [
    "i(t) = im sin(ωt − π/2) lags v(t) = vm sin(ωt) by EXACTLY π/2 rad (90°, T/4) at every instant — never leads, never in-phase, for a pure ideal inductor.",
    "v = L di/dt exactly, at every instant — the SLOPE of i is what v sets, never i's value directly (this is the entire content of the PRIMARY aha).",
    "Xl = ωL grows linearly with frequency; Xl → 0 as ω → 0 (an ideal short at steady DC — consistent with the shipped `inductance` concept's 'current never jumps').",
    "p(t) = v(t)·i(t) = −(vm·im/2)·sin(2ωt) is exactly odd-symmetric about every one of its own zero crossings — store and return lobe areas cancel PAIRWISE and exactly, never approximately, so ⟨p⟩ = 0.",
    "U(t) = ½Li(t)² ≥ 0 always; dU/dt = p(t) exactly (verified: d/dt[Umax cos²ωt] = −(2ω·Umax) sin ωt cos ωt = −(20ω/π) sin 2ωt = p(t) at defaults) — the U-gauge and the p-strip are the SAME physics, never independently scripted.",
    "An ideal inductor has zero resistance — it dissipates NOTHING; every joule delivered to it over any quarter cycle is returned in the following quarter cycle exactly."
  ]
}
```

**Edge-case sweep (Escalation check, per role spec):** `vm` floor = 2V (never causes a divide issue, vm is the numerator). `f_demo` floor = 0.1Hz → `omega` floor = 0.6283 rad/s. `L` floor = 1.0H. `Xl = omega*L` therefore never reaches 0 anywhere in the declared ranges (floor ≈ 0.6283 Ω at the L=1.0/f=0.1 corner) — no divide-by-zero anywhere in `im = vm/Xl` or `slope_i = v/L`.

**FLAG resolved — the skeleton's own noted S9 corner (vₘ=20V, f=0.1Hz, L=1.0H → iₘ ≈ 31.83A, Python-verified above):** **recommendation is auto-scale, not a floor.**
1. **Do not raise the L floor.** L=1.0H is a pedagogically real "small inductor" demonstration value; shrinking the range to hide the corner would quietly narrow syllabus-honest exploration.
2. **Auto-scale the scope's i-axis** to a *computed* ceiling, not a fixed default-tuned range: `i_axis_max = max(2.5 · im_current, 5.0)` — always ≥5A for legibility near defaults, scales smoothly to clear the analytic worst case (`vm_max/(2π·f_min·L_min) = 20/0.6283 ≈ 31.83A`) with headroom, never clips.
3. **Reuse the existing `A_frac` clamp `[0.08, 0.42]`** already declared above for bead geometry — no new mechanism; verified at this exact corner: `im/ω = 31.83/0.6283 = 50.66`, normalized ratio to default `= 39.79`, raw `A_frac = 0.30×39.79 = 11.9` → clamps to `0.42` (beads never overshoot the coil/wire geometry).
4. **Never clamp the displayed HUD number.** `iₘ = 31.8A` is shown honestly (matches the sibling's precedent: "expected, physically honest" saturation) — only rendering geometry is bounded, never the number a teacher reads.
5. `field_brightness = cos²θ` needs **no** additional fixed-reference clamp (unlike the sibling's heater `P_REF`) — it is self-normalized to that state's own `Umax`, so it stays in `[0,1]` at every slider corner by construction; no cross-state comparison requires an external reference here.

---

## 2. Per-state variable notes (`variable_overrides`)

Same field_3d precedent as the sibling (`variable_overrides` sibling to `show_sliders`/`visible_controls`, per state) — direct application of `default_variables_only_first_var_merged`: every non-live variable must be pinned explicitly, never left to fall through.

| State | `variable_overrides` | Why |
|---|---|---|
| S1 | `{ vm: 10.0, L: 3.1831, f_demo: 0.25 }` | Full lock — no live controls this state (f is deliberately LOCKED until S5, §3 gating note); the two plants (bead pause at v-peak, field peak at v-zero) must land at the exact defaults. |
| S2 | `{ vm: 10.0, L: 3.1831, f_demo: 0.25 }` | Full lock — no live controls; the ghost trace must equal "literally the sibling's exact 2.00A in-phase trace," which only holds because Xₗ=5.0Ω=R_sibling exactly at these defaults. |
| S3 | `{ vm: 10.0, L: 3.1831, f_demo: 0.25 }` | Full lock — no live controls; the ±7.1V HUD mirror and the A→B→A′ loop boundaries (t=0,2.0,4.0s) must land at exact defaults. |
| S4 | `{ L: 3.1831, f_demo: 0.25 }` | **`vₘ` LIVE, no override on it.** L and f_demo locked so ONLY vₘ's effect is visible (Rule 32b) and so the three stop TIMES (t=1.0/2.0/3.0s) stay pinned — they depend only on ω (=f_demo), never on vₘ. |
| S5 | `{ vm: 10.0, L: 3.1831 }` | **`f_demo` is the scripted/live variable, no override on it.** `vm` and `L` locked so ONLY the frequency-driven envelope is visible (32b) — **CRITICAL defensive override**: S4 leaves `vm` live-dragged; without re-locking it here, a teacher who raised vₘ in S4 would silently carry a wrong vₘ into S5, corrupting the authored plateau numbers (iₘ=5.0A/1.0A) the narration states as exact fact. |
| S6 | `{ vm: 10.0, L: 3.1831, f_demo: 0.25 }` | Full lock, no live controls — **CRITICAL defensive re-lock** of BOTH `vm` (S4 legacy) and `f_demo` (S5 legacy — a genuine teacher drag mid-ramp could leave f anywhere in [0.1,0.5]). The signed product-walk table (0/±10.0/±20.0W boundary values, the "area=6.37J" shading) needs the exact defaults. |
| S7 | `{ vm: 10.0, L: 3.1831, f_demo: 0.25 }` | Full lock — same CRITICAL defensive reasoning as S6. The dead-needle `0.00 W` reading and the U-gauge's `0↔6.37J` excursion must be exact and repeatable across the 3.5–5 periods this state spans. |
| S8 | `{ vm: 10.0, L: 3.1831, f_demo: 0.25 }` | Full lock — apparatus is `reveal_hold` (dimmed, static); the derivation's numeric anchors (10.0V/2.00A/10.0W amplitude/6.37J Umax) must match the locked defaults exactly. |
| S9 | *(none — inherits `default_variables`: vm=10.0, L=3.1831, f_demo=0.25)* | Explore; `vm`, `f_demo`, `L` ALL live (Rule 31). No `variable_overrides` needed since nothing else is locked. |

---

## 3. Within-state motion timeline + per-state control spec (all 9 states)

**Shared machinery (define once, reference per state) — all formulas verified numerically above:**

- **Wire beads (micro band, Rule 33b):** `bead_frac(t) = 0.5 − A_frac·sin(θ)`. **Verified against the S1 narration plants**: beads are momentarily at rest exactly at `θ=π/2, 3π/2` (t=1.0s, 3.0s — the v-PEAK instants, since `i(t)=0` there) and pass through center (`bead_frac=0.5`) at maximum speed exactly at `θ=0,π,2π` (t=0, 2.0, 4.0s — the v-ZERO instants, since `|i|=iₘ` there). This is the exact mechanical embodiment of "the beads pause at the WRONG moment" (S1).
- **Wire current arrow / field circulation sense:** `arrow_dir(t) = sign(i) = −sign(cos θ)`. **Flips at t = 1.0s, 3.0s** (i's own zero crossings) — **this is 1.0s OFFSET from where the sibling `ac_voltage_resistor`'s arrow flips** (that arrow flips at v-zero, since its current is in phase). **Binding for json_author/engine:** do not reuse the resistor's flip-timing logic verbatim; this concept's arrow timing must key off `i(t)`'s sign, not `v(t)`'s.
- **Coil field-loop brightness (macro↔micro link, Rule 33d):** `field_brightness(t) = U(t)/Umax = cos²θ`. Peaks (brightest) exactly at t=0, 2.0, 4.0s (v-zero, i-peak — the second S1 plant: "field swells brightest exactly when v is ZERO"); collapses to zero at t=1.0, 3.0s. **Cool blue-cyan geometry only** — the coil BODY never receives this or any other emissive channel (the anti-heater, per §0b). **Driven every frame; EXEMPTED from `applyGlowEmphasis`** when `coil`/`bfield` is glow_focal (S1/S3/S7) — emphasis dims peers only, never overwrites the live field brightness.
- **Back-emf / source-drive arrow pair (S3):** `eps_back(t) = −v(t)`. **Flips at t = 0, 2.0, 4.0s** — the SAME instants as the field-loop brightness peak, and **1.0s offset from the wire-current-arrow's own flip times (t=1.0, 3.0s)**. This 1.0s stagger between the two arrow-pairs is the lag made mechanically visible without any new machinery — flag this explicitly to json_author/engine as a deliberate, load-bearing detail, not an inconsistency to "fix."
- **Tangent slope (S4):** `slope_i(t) = v(t)/L`, continuous. At defaults, `slope_i(1.0s) = +π ≈ +3.14 A/s`, `slope_i(2.0s) = 0`, `slope_i(3.0s) = −π ≈ −3.14 A/s` — all Python-verified. **Live with `vₘ`**: at any dragged `vₘ`, `slope_i = vₘ/L` at the v-peak stop, scaling proportionally (e.g., `vₘ=20V → slope=±2π≈±6.28 A/s`), while the stop TIMES never move (they depend only on the locked `ω`).

---

### S1 `coil_joins_the_circuit` — core — `oscillate/track`

| t-window | What animates | Driven by | Live controls |
|---|---|---|---|
| continuous, from t=0 | v-trace draws live: `v(t)=vₘsin(ωt)`; dashed `vₘ` peak line marks at t=1.0s (first peak) | `t`, `ω` (locked) | **none** |
| continuous | wire beads oscillate per `bead_frac(t)`; wire arrow flips per `arrow_dir(t)` at t=1.0/3.0s | `t`, `ω` | — |
| continuous | cool blue-cyan field loops breathe per `field_brightness(t)`, peaking at t=0/2.0/4.0s; coil body stays cold (no emissive) | `t`, `ω` | — |

`f` is LOCKED (see §3 gating note below the table). Two deliberate, unnamed plants: beads pause at v-peak instants (t=1,3s); field peaks at v-zero instants (t=0,2,4s) — both resolved narratively at S2/S4.

---

### S2 `current_lags_quarter_cycle` — core — `ghost-overlay-compare` (coin, 16a confrontation)

Cue-bound sequence (`ghost_dock` s1 → `bead_disobey_beat` s2 → `real_sweep_start` s3 → `lag_bracket_land` on the naming sentence):

1. **Ghost docks first** (readable ~0.5–1s before anything else moves, 32a): dashed grey `i_ghost(t) = iₘ sin(ωt)` — the in-phase hypothesis, literally the sibling's exact 2.00A trace at these defaults (Xₗ=R_sibling=5.0Ω). Legend: "in-phase guess (resistor's rhythm)."
2. **Bead-disobey beat:** beads visibly pause at t=1.0s (v-peak) — the ghost claims maximum flow there; the real apparatus disagrees (readable beat).
3. **Real i-trace sweeps in, clock-drawn** (never a phase-slide morph — binding 32a caution): `i(t) = −iₘcos(ωt)`, same `iₘ=2.00A`, peaking at t=2.0s — exactly 1.0s after v's peak at t=1.0s.
4. **Lag bracket lands:** "1.0 s = ¼ cycle = 90°" between the two peak markers.

No live controls (f locked; vm/L locked). glow_focal = `i_trace`.

---

### S3 `coil_fights_change` — core — `cycle-compare`

Loop **A→B→A′** on the coil close-up (camera nudges in once), repeating continuously on the state's own T=4.0s clock:

- **A** (`0 ≤ t < 2.0s`, i RISING: `i(0)=−2.00A → i(2.0)=+2.00A`, di/dt = imω sin(ωt) > 0 throughout): flux loops thicken; back-emf arrow points AGAINST the drive (`eps_back(t) = −v(t) < 0` throughout A, since v≥0 there).
- **B** (`2.0 ≤ t < 4.0s`, i FALLING): flux loops collapse; back-emf arrow FLIPS, now `eps_back(t) > 0` (v≤0 there) — propping the falling current up.
- **A′:** loop repeats. HUD pair `v = +…V` / `ε_back = −…V` mirrored LIVE at every instant (exact negatives, e.g. representative instant `v=+7.1V ⟹ ε_back=−7.1V`) — the Rule 33c real number.

No live controls (full lock, §2). glow_focal = `backemf`.

---

### S4 `voltage_sets_the_slope` — core — **PRIMARY AHA** — `tangent-walk` (coin)

Cursor walks the traces carrying a **continuous** live tangent arrow, `tilt(t) = atan(slope_i(t))`, `slope_i(t) = v(t)/L`. **Three cue-gated readable dwells** (`tangent_stop_1/2/3`, ~0.4–0.6s each, bound to narration sentences 2–4 per skeleton cue plan):

| Stop | t | v | slope_i = v/L | note |
|---|---|---|---|---|
| 1 | 1.0 s | +vₘ (peak) | **+vₘ/L** (=+3.14 A/s at default) | i climbing STEEPEST, through zero |
| 2 | 2.0 s | 0 | **0** (flat) | i coasting over its +iₘ crest |
| 3 | 3.0 s | −vₘ (peak) | **−vₘ/L** (=−3.14 A/s at default) | steepest fall |

**PLAIN LIVE `vₘ`** (binding — no scripted driver, no thumb-lockstep, no closed-form-phase duty, unlike S5): every frame recomputes `slope_i = vₘ(t)/L` from whatever the slider currently reads — **never a hardcoded `3.14`**. Dragging `vₘ` steepens every tangent AND scales `iₘ=vₘ/Xₗ` in step, while stop TIMES (1.0/2.0/3.0s) stay pinned exactly (they depend only on the locked `ω`) — the crest stays geometrically fixed at the v-zero instant regardless of voltage. Because `f_demo` and `L` are locked (§2), ordinary continuous `θ=ωt` phase suffices — nothing here needs S5's ramp machinery.

Live control: **vₘ** (2–20V, plain live). glow_focal = `tangent`.

---

### S5 `reactance_grows_with_frequency` — extended — `ramp-response` (coin)

**Scripted eased f-ramp: 0.25 → 0.50 → 0.10 → 0.25 Hz**, drag-seize + DOM-thumb+label lockstep (`ghost_compare_cause_invisible_slider_frozen` scar pattern), phase via the closed-form ramp-integral (`field3d_dt_accumulated_motion_invisible_to_eye_timepin` fix pattern — **binding**).

**General lemma (Python-verified against direct numerical integration, error < 1e-11 across all three legs):** for a smoothstep-eased frequency ramp from `f₀` to `f₁` over duration `ΔT` — `f(u) = f₀ + (f₁−f₀)·smoothstep(u)`, `smoothstep(u) = 3u²−2u³`, `u = local_t/ΔT ∈[0,1]` — the accumulated phase is:

```
Δθ(u) = 2π·ΔT·[ f₀·u + (f₁−f₀)·(u³ − u⁴/2) ]         (partial segment, any u ∈ [0,1])
Δθ(1) = π·ΔT·(f₀ + f₁)                                  (full-segment total — the average-frequency shortcut,
                                                           exact because ∫₀¹smoothstep(u)du = ½ exactly)
```

**Proposed concrete schedule** (json_author/engine may retime hold/leg durations to fit actual narration length; the ENDPOINTS 0.25→0.50→0.10→0.25 Hz, the smoothstep easing, and the leg ORDER must be preserved — the plateau numbers below depend only on the f-endpoints, not on duration):

| Segment | Local window (t_r, relative to `ramp_window_start` cue) | f(t_r) | Xₗ, iₘ at boundary |
|---|---|---|---|
| Leg A (rise) | `[0, 4.0s]`, smoothstep 0.25→0.50 Hz | — | at t_r=4.0: **Xₗ=10.0Ω, iₘ=1.0A** |
| Hold A | `[4.0, 5.5s]`, f=0.50 const | 0.50 Hz | (unchanged) |
| Leg B (fall) | `[5.5, 11.5s]`, smoothstep 0.50→0.10 Hz | — | at t_r=11.5: **Xₗ=2.0Ω, iₘ=5.0A** |
| Hold B | `[11.5, 13.0s]`, f=0.10 const | 0.10 Hz | (unchanged) |
| Leg C (return) | `[13.0, 17.0s]`, smoothstep 0.10→0.25 Hz | — | at t_r=17.0: **Xₗ=5.0Ω, iₘ=2.0A** (back to default) |
| Post-ramp hold | `t_r > 17.0`, f=0.25 const | 0.25 Hz | holds at default until drag/state exit |

**Accumulated phase at each boundary** (via the lemma; all Python-verified exact): Leg A total `Δθ=3π`; Hold A adds `π·1.5=1.5π` (θ=4.5π at t_r=5.5); Leg B total `Δθ=3.6π` (θ=8.1π at t_r=11.5); Hold B adds `0.2π·1.5=0.3π` (θ=8.4π at t_r=13.0); Leg C total `Δθ=1.4π` (θ=9.8π at t_r=17.0). **Absolute state phase:** `θ(t) = θ_entry + θ_r(t − t_rampStart)` for `t ≥ t_rampStart`, where `θ_entry = (π/2)·t_rampStart` (ordinary phase accumulated during the pre-ramp hold at the default f=0.25Hz). This entire construction is a **pure, piecewise-analytic function of absolute `t`** — no per-frame `+=` accumulation anywhere, hence exactly rewindable under `SET_TIME_FREEZE` by construction (satisfies the B1 scar's fix criterion directly).

**Drag-seize:** the instant the teacher grabs `f_demo`, `dragged_f_demo=true` halts the script permanently for this state-entry; phase continues as ordinary live `θ(t) = θ_at_drag + 2π·f_live(t)·(t−t_drag)`, recomputed from the live slider every frame (standard, no closed-form duty needed post-drag — THE EYE never drives trusted drags).

**Visible effects:** i-envelope collapses `2.00→1.0A` at the f=0.50 plateau (beads barely budge — "turned around before they get going"); swells to `5.0A` at the f=0.10 plateau. Live `Xₗ` readout tracks `5.0→10.0→2.0→5.0Ω`. Trace y-scales rescale smoothly (continuous, no jitter — the phase formula's C¹ continuity at every leg boundary, since smoothstep has zero derivative at u=0,1, guarantees `f(t)` and `df/dt` are both continuous throughout).

Live control: **f_demo** (0.1–0.5Hz, drag-seize + thumb-lockstep). glow_focal = `xl_readout`.

---

### S6 `power_swings_both_ways` — extended — `trace-product` (fleet reuse)

p-strip docks at t=0 (cue `p_strip_dock`) with its zero baseline highlighted; **background trace draws continuously from t=0** using the SAME universal phase convention as every other state (`v(0)=0` rising, `i(0)=−iₘ`) — this means state-entry (t=0) sits exactly at a U-MAXIMUM (a store/return boundary, since `i(0)=−iₘ` is an extreme). The **guided cursor-walk** (cue `product_walk_start`, bound to the "share sign" narration sentence) begins at **t=1.0s** — the first STORE-quarter boundary — and walks one full period `[1.0s, 5.0s]` (Python/hand-verified all values):

| τ = t−1.0 | Absolute t | Segment | p(t) shape | U(t) | Bars / gauge |
|---|---|---|---|---|---|
| [0, 1.0] | [1.0, 2.0]s | **STORE** | 0 → **+10.0W** (t=1.5) → 0 | 0 → Umax (6.37J) | rise ABOVE zero, gauge fills, field brightens |
| [1.0, 2.0] | [2.0, 3.0]s | **RETURN** | 0 → **−10.0W** (t=2.5) → 0 | Umax → 0 | dip BELOW zero, gauge drains, field dims |
| [2.0, 3.0] | [3.0, 4.0]s | STORE | 0 → +10.0W → 0 | 0 → Umax | rise, fill, brighten |
| [3.0, 4.0] | [4.0, 5.0]s | RETURN | 0 → −10.0W → 0 | Umax → 0 | dip, drain, dim |

Loop closes at t=5.0s ≡ t=1.0s (mod T=4.0s) — a clean repeat. **The curve CROSSES zero** (the sibling's only touched it). Shaded store-lobe label lands on the FIRST store lobe (τ∈[0,1]): "area = 6.37 J" — verified `∫₁² p dt = U(2)−U(1) = 6.366−0 = 20/π J` exactly (fundamental theorem of calculus applied to `dU/dt=p`, cross-checked via `∫−10sin(πt)dt` antiderivative, both methods agree to machine precision).

No live controls (full lock, §2, CRITICAL defensive re-lock of vm/f_demo). glow_focal = `p_strip`.

---

### S7 `nothing_consumed` — extended — SUPPORTING AHA — `null-result-hold`

Meter (`avg_p` mode) docks at t=0 (`meter_dock`). **Update rule (stronger than the sibling's case):** `⟨p⟩` over ANY interval that is a whole multiple of `T/2 = 2.0s` (p's OWN period, half the source period) is EXACTLY zero — verified: `∫₀² −10sin(πt)dt = (10/π)[cos(πt)]₀² = (10/π)(1−1) = 0`. The needle therefore re-confirms `0.00 W` **every 2.0s**, twice as often as the sibling's resistor meter needed a full `T`. State spans ~14–20s (word budget 30–45), i.e. **7–10 independent re-confirmations**. Displayed as a HELD constant `0.00 W` (never a decaying transient). Meanwhile beads keep rocking, field keeps breathing (`field_brightness(t)=cos²θ`), U-gauge keeps filling/draining `0↔6.37J` — the null is on the METER ONLY, exactly the paradox.

No live controls (full lock, CRITICAL defensive re-lock). glow_focal = `meter`.

---

### S8 `one_integral_both_results` — advanced — `chain-link-derivation` (fleet reuse)

3D apparatus `reveal_hold` (dimmed, static — Rule 26 motion is carried entirely by the scope-pane fold + algebra dock, per Rule 32b). Cue-bound (`fold_start`/`fold_end` s1–2, `identity_dock` s3):

**The fold (exact, distinct from the sibling's half-height fold — do not conflate):** `p(t)` has zero crossings every **1.0s** (at t=0,1,2,3,4,…, since `2ωt=nπ ⟺ t=n`), each lobe spanning exactly 1.0s with peak magnitude 10.0W at its midpoint. **Verified exact odd-symmetry** about every zero crossing `t_c`: `p(t_c+τ) = −10sin(π(t_c+τ)) = −p(t_c−τ)` for any `τ` (direct trig identity, holds for every `t_c` an integer). Concretely: rotating the STORE lobe's peak `(1.5, +10)` by 180° about the shared zero crossing `(2.0, 0)` gives `(2.5, −10)` — **exactly the following RETURN lobe's trough.** This is the visual: each positive lobe rotates 180° about its trailing zero crossing and lands flush on the next negative lobe — exact point-symmetry congruence, areas cancel pairwise, `⟨p⟩=0` exact (not approximate).

**Algebra dock (s3):** the chain `v=L·di/dt → i=−(vₘ/ωL)cos ωt = iₘsin(ωt−π/2)` docks, followed by `p=−(vₘiₘ/2)sin 2ωt → ⟨p⟩=0`. The `ω` landing in `i`'s denominator IS `Xₗ`'s frequency-dependence; the `−cos` IS the 90° lag — one integration, both headline results.

No live controls (full lock). glow_focal = `formula`.

---

### S9 `ac_inductor_sandbox` — core (ring-neutral) — `drag-sandbox`

Free-runs continuously (Rule 37, never freezes). All formulas from §1 apply live with `vₘ`, `f_demo`, `L` all draggable (trusted-drag seizes manual):

- v/i traces re-scale live (`vₘ`, `iₘ=vₘ/Xₗ`); beads re-pace (`A_frac`, clamped `[0.08,0.42]` — verified at the extreme corner, §1 edge-case sweep); field re-breathes (`field_brightness=cos²θ`, self-normalized, safe at every corner); HUD tracks `v`, `i`, `iₘ` live.
- Formula surface: **`i lags v by ¼ cycle (90°)` only** (core-ring, Rule 38b) — NO rms-style formula needed here (this concept never has one); p-strip, Xₗ readout, and U-gauge are **deliberately ABSENT** (extended-ring content, per DoD i-2 coherence rule).
- Scope y-axis auto-scale per the edge-case recommendation above.

Live controls: **ALL** — vₘ (2–20V), f_demo (0.1–0.5Hz), L (1.0–10.0H). glow_focal = `formula`.

---

## 4. Board-mode mark scheme + derivation sequence — **SKIPPED**

Per the active conceptual-only directive (founder 2026-06-11, Rule 20 suspension) and skeleton DoD §10(e): **no `mode_overrides`, no board mark scheme, no derivation_sequence authored for this concept.**

---

## 5. Drill-down cluster phrasings

Per role spec ("for each cluster_id the architect named, write 5 real confusion phrases") — the skeleton §6 names **9 distinct cluster_ids** (3 per pivot state: S2, S4, S7), so this section produces **9 clusters × 5 phrases = 45 total** (matching the sibling's exact precedent structure).

### S2 — `why_lag_not_lead`
- "why does current lag and not lead"
- "could the current come before the voltage instead"
- "why does the coil make it late and not early"
- "is lag always the direction or could it flip"
- "why not just a random delay, why exactly lag"

### S2 — `current_max_when_voltage_zero`
- "how can current be maximum when voltage is zero"
- "if voltage is zero shouldnt current also be zero"
- "whats pushing the current when there is no voltage"
- "why does the current peak exactly where voltage crosses zero"
- "doesnt zero voltage mean nothing is happening"

### S2 — `quarter_cycle_90_degrees_meaning`
- "what does 90 degrees even mean without a circle here"
- "why call it degrees when everything is just a graph"
- "is a quarter cycle the same everywhere or does it depend on frequency"
- "how do you turn 1 second into 90 degrees"
- "does 90 degrees mean something is rotating"

### S4 — `slope_vs_value_confusion`
- "why does voltage control the slope and not the size"
- "im confused how a value can set a slope"
- "so voltage isnt telling current how big to be"
- "how is slope different from the current itself"
- "why cant i just read current straight off the voltage"

### S4 — `v_equals_L_didt_meaning`
- "what does v equals l di dt actually mean physically"
- "what is di dt supposed to represent"
- "why does inductance multiply the rate of change and not the current"
- "is di dt just how fast current is changing"
- "why isnt there a current term directly in that equation"

### S4 — `why_exactly_quarter_cycle`
- "why exactly a quarter cycle and not some other fraction"
- "is the quarter cycle lag always exactly that or just close"
- "why does the geometry force exactly 90 degrees"
- "could the lag be different for a different inductor"
- "why is it always exactly a quarter, never a third or a fifth"

### S7 — `reactance_vs_resistance_heating`
- "if the coil fights the current why doesnt it heat up"
- "whats the difference between reactance and resistance then"
- "doesnt fighting something always cost energy"
- "why does resistance heat but reactance doesnt"
- "so opposing current isnt the same as using it up"

### S7 — `where_stored_energy_goes`
- "where does the stored energy actually go"
- "does the energy just disappear when the field collapses"
- "if energy goes into the field where does it go when the field shrinks"
- "is the energy really given back or just used elsewhere"
- "whats on the other end receiving that returned energy"

### S7 — `zero_power_but_current_flows`
- "how can average power be zero when current is clearly flowing"
- "doesnt current flowing always mean power is being used"
- "if power is zero why does the ammeter show current at all"
- "is zero average power even possible with real current"
- "why does the wattmeter read zero but the circuit is obviously live"

---

## 6. Constraint callouts

1. **`radians()` N/A.** No slider in this concept is degree-valued (`f_demo` is Hz, `vₘ` is V, `L` is H); `theta` is native radians throughout — no `radians()` wrap needed anywhere except the FIXED `lag_degrees=90` display constant, which is a pure label, never fed back into a trig function.
2. **HUD display precision (carry §10(b) exactly):** `v`/`ε_back` → 1dp, signed (`+7.1 V`); `i` → 2dp, signed (`+1.41 A`); `iₘ` → 2dp; `Xₗ` → 1dp (`5.0 Ω`); `p` → **1dp, SIGNED** (`−7.1 W` — different from the sibling's unsigned `p`, since p genuinely goes negative here); `U` → 2dp (`4.25 J`); `⟨p⟩` → held `0.00 W`.
3. **`L`'s default (10/π ≈ 3.1831H) is deliberately NOT on the 0.1H step grid.** This is intentional — it's forced by the chapter-continuity design (`Xₗ=ωL=5.000Ω` exactly at defaults, matching the sibling's `R=5.0Ω`). Do not "round" the authored default to a grid-aligned value; the initial slider position may sit between step marks, which is normal HTML range-input behavior.
4. **Two arrow-pairs flip at DIFFERENT instants — both correct, not a bug.** The wire current arrow / field circulation sense flips at t=1.0s, 3.0s (`i`'s zero crossings, at the v-PEAK instants). The S3 back-emf arrow flips at t=0, 2.0, 4.0s (`v`'s zero crossings, at the i-PEAK instants). This 1.0s stagger between the two is the lag made mechanically visible — engine must implement both independently from their own formulas (`arrow_dir` vs `eps_back`'s sign), never derive one from the other's flip schedule.
5. **`field_brightness = cos²θ` is self-normalized to that state's own `Umax`** — unlike the sibling's heater, which needed a FIXED external `P_REF` for honest cross-state/cross-corner comparison, this concept's field brightness has no cross-comparison requirement (it's always read within its own state), so self-normalization is correct and introduces no saturation-hiding risk.
6. **S5's phase MUST be the closed-form piecewise formula of §3 S5, never a per-frame accumulator** (the exact `field3d_dt_accumulated_motion_invisible_to_eye_timepin` scar class) — verify via the same re-pin-to-earlier-timestamp-after-a-later-one test the original fix used (byte-identical value required).
7. **Sprite/canvas glyph fallback for `ₗ` (Xₗ), directly informed by the `field3d_rms_subscript_ascii_in_renderer_text_paths` fix:** verify the `ₗ` subscript (U+2097) renders in BOTH the 3D sprite font path (`createLabelSprite`) AND the 9px canvas-drawn graph-label path (which needed the Cambria Math font swap in the sibling's fix, not just a Unicode character swap) — a Unicode character change with no font check reproduces that exact scar. Fallback = styled small "L", never ASCII `X_L`.
8. **Dedicated Cambria-Math formula panel carries every §1 `formulas` string** — never route through the shared generic `#formula_overlay` (OPEN scar `field3d_formula_overlay_generic_not_cambria_math`).
9. **If the S2 lag bracket persists visually into S5** (not specified as removed by the skeleton), its TIME label (`lag_seconds = 1/(4·f_demo)`) must rescale live with the ramp while its DEGREE label stays fixed at `90°` — a bracket that doesn't rescale its time value under the ramp would silently teach that the lag TIME is frequency-independent, which is false (only the lag in DEGREES is).
10. **S7's meter re-confirms every 2.0s, not 4.0s** — verified `⟨p⟩=0` exactly over any `T/2` window (p's own period), not just full `T` — a stronger/faster legibility fact than the sibling's case; implement the update-tick rate accordingly for maximal re-confirmation density in S7's ~14–20s span.

---

## Self-review checklist

- [x] Every symbol referenced in the skeleton's state narratives (v, i, iₘ, Xₗ, ε_back, slope/di/dt, p, U, Umax, ⟨p⟩, θ, ω, lag) appears in `variables`.
- [x] No `radians()` needed anywhere (no degree-valued slider) — confirmed §6.1.
- [x] Every state's live control(s) declared exactly per the architect's control table (vₘ→S4 plain-live, f_demo→S5 scripted+drag-seize, ALL→S9), each with default/min/max/step in §1.
- [x] `variable_overrides` documented for all 9 states with one-line justifications (§2); S5's `vm:10.0` and S6/S7/S8's `{vm:10.0, f_demo:0.25}` flagged CRITICAL (defensive-lock chain, direct application of `default_variables_only_first_var_merged`).
- [x] Board-mode section explicitly SKIPPED (Rule 20 [D]).
- [x] Drill-down cluster phrasings: 9 clusters (3 states × 3 each, per skeleton §6's actual cluster_id list) × 5 phrases = 45, real-student-voice, plain English, no Hinglish, no textbook prose.
- [x] `constraints` block: 6 short physics assertions (§1) + 10 engineering constraint callouts (§6).
- [x] Numerical sanity check run and Python-verified: ω=π/2, Xₗ=5.00Ω exactly, iₘ=2.00A, lag=1.0s, p amplitude=10.0W, ⟨p⟩=0, Umax=20/π≈6.37J, S5 sweep Xₗ=2.0Ω/10.0Ω at f=0.1/0.5Hz with iₘ=5.0A/1.0A, edge corner iₘ≈31.83A — all independently reproduced, not copied.
- [x] Closed-form S5 ramp-phase lemma derived AND Python-verified against direct numerical integration (error < 1e-11) both for full-leg totals and arbitrary partial-segment fractions.
- [x] Within-state motion timeline written for all 9 states: every row a pure function of the state clock `t` (Rule 26); 9 distinct archetypes carried forward from skeleton, none static; controls column matches architect table exactly (including the S4 plain-live / S5 scripted-drag-seize distinction, verified precisely).
- [x] **Rule 32 sequencing verified per state:** S2 (ghost docks, THEN beads disobey, THEN real trace sweeps — readable beats); S3 (i rises THEN emf answers); S4 (cursor reads v THEN tangent tilts); S5 (f ramps THEN envelope collapses); S6 (signs disagree THEN bar drops THEN gauge drains). **Binding 32a "never fake the lag" caution enforced in formulas**: i(t) computed as the closed-form `−iₘcos θ`, never a frame-delay of v(t); ghost is a static dashed hypothesis, never phase-slid into the real trace.
- [x] **Word budget (Rule 31a):** not physics_author's to author (architect owns narration text) — confirmed the skeleton's stated 30–55-word budgets per state are consistent with the motion complexity each state's formulas require.
- [x] **Notation ladder (Rule 38c):** S1–S7/S9 formula surfaces are algebra-only (`v=vₘsin ωt`, `Xₗ=ωL`, `iₘ=vₘ/Xₗ`, `p=v·i`, `⟨p⟩=0`, `U=½Li²`); calculus (`di/dt`, `π/2` radians) is confined entirely to S8, the advanced-ring state — confirmed no calculus/vector operator appears anywhere else, no FLAG needed. **Dialect (38d):** no board-divergent term in this concept's vocabulary requiring dual-labeling (v/i/p/L/Xₗ are universal notation) — N/A, confirmed clean.
- [x] Engine bug queue consulted live via `query_engine_bug_queue.ts` (`--field3d --open`, `--owner alex:physics_author`, `ac_voltage_inductor`) plus targeted `git log` verification of the two freshest FIXED scars (`ad7975b`, `4dc1c76`) that postdate the DB mirror; every relevant rule cross-checked and applied (§3 S5's closed-form design directly implements the `dt_accumulated` fix pattern; §6.7 directly implements the `rms_subscript` fix's font-path lesson).
- [x] DC Pandey check: no formula, explanation, or example problem imported from any external book — every formula in §1 derived directly from `v=L di/dt` + trig identities, all non-trivial claims independently Python-verified.

---

**Files referenced (read-only, no edits made):**
- `C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7\ac_voltage_inductor\skeleton.md` (input contract, full read incl. cycle-1 DF1/DF2 corrections)
- `C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7\ac_voltage_resistor\physics_block.md` (format/rigor reference)
- `C:\Tutor\physics-mind-ch7\src\scripts\query_engine_bug_queue.ts` (live DB consultation)
- `C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7_engine_log.md` (referenced by skeleton §0a; not independently re-read, git commit messages used instead for precision)

This physics block is ready to append to `skeleton.md` and hand to the §3b engine dispatch (new `scenario_type: "ac_inductor"`, clean standalone sibling clone — build scope `ac_inductor` alone, `ac_resistor` untouched) followed by `json_author`.
