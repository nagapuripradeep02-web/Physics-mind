# Physics Block — `ac_voltage_capacitor`

**Engine bug queue consulted live** (`npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts`, not just the checklist mirror): `--field3d --open` (28 rows — `ghost_compare_cause_invisible_slider_frozen` confirmed still OPEN, directly informs S5 below; `field3d_formula_overlay_generic_not_cambria_math` and `field3d_sliders_panel_top12_vs_fsbtn_top10` also confirmed still OPEN, both already correctly routed in skeleton §0b/§10h), `ac_voltage_capacitor` (0 rows — not yet seeded, expected pre-json_author), `--owner alex:physics_author` (6 rows — the same generic `DUALPANEL_*` triad + 3 directives, N/A to field_3d, identical finding to both sealed siblings), `ac_generator` (4 FIXED — `bulb_glow_not_modulating` is the direct precedent for the E-field-emissive `applyGlowEmphasis` exemption in §0b req 1, correctly cited already).

**Gap found, FLAGged to quality_auditor:** the two freshest scars the skeleton cites by commit SHA — `field3d_rms_subscript_ascii_in_renderer_text_paths` (`4dc1c76`) and `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (`ad7975b`) — do **not** appear as rows in the live `engine_bug_queue` table under `ac_voltage_inductor`, `ac_voltage_resistor`, `--field3d`, or `--owner peter_parker:renderer_primitives` (searched the full 179-row owner dump + the 28-row open field3d dump; no match on `subscript`/`dt_accum`/`tubeline`). These were evidently fixed via direct commit without a corresponding queue row seeded. Not a blocker — the skeleton's citation is commit-SHA-verifiable and both prevention rules are applied below regardless — but quality_auditor should not expect a live-queryable row for either at Gate 8.

**DC Pandey check:** none consulted. Every formula below re-derived directly from `q = Cv`, `i = dq/dt`, and elementary trig/calculus — independently Python-verified (shown inline; store-lobe integral checked to `<1e-13` against the closed form, S5 sweep checked exactly, both edge corners checked).

---

## 1. `physics_engine_config`

```json
{
  "variables": {
    "vm":     { "name": "Peak (amplitude) voltage across the capacitor", "unit": "V", "min": 2, "max": 20, "default": 10.0, "step": 1, "role": "driver" },
    "C":      { "name": "Capacitance of the plates", "unit": "F", "min": 0.04, "max": 0.40, "default": 0.1273, "step": 0.02, "role": "driver" },
    "f_demo": { "name": "Demo-compressed AC frequency (real mains is tens of Hz)", "unit": "Hz", "min": 0.1, "max": 0.5, "default": 0.25, "step": 0.05, "role": "driver" },

    "omega":  { "name": "Angular frequency", "unit": "rad/s", "derived": "omega = 2*PI*f_demo" },
    "theta":  { "name": "Instantaneous phase — NATIVE radians, state-local clock (Rule 26)", "unit": "rad",
                 "derived": "theta = omega * t   [EXCEPT S5 while undragged, which uses the closed-form ramp-phase accumulator of §3 S5 in place of omega*t]" },

    "X_C":    { "name": "Capacitive reactance — the capacitor's frequency-made opposition (source-string token: literal ASCII X_C, capital C, underscore — see §6.6)", "unit": "Ω",
                 "derived": "X_C = 1 / (omega * C)" },
    "im":     { "name": "Peak (amplitude) current", "unit": "A", "derived": "im = vm / X_C = omega * C * vm" },
    "v":      { "name": "Instantaneous source/capacitor voltage", "unit": "V", "derived": "v = vm * sin(theta)" },
    "v_C":    { "name": "Instantaneous plate voltage (ideal capacitor: identically equals v — see §6.6 for the token)", "unit": "V",
                 "derived": "v_C = v   [an ideal capacitor's own voltage always answers the source EXACTLY, at every instant — this identity is WHY i must equal C*dv/dt: v_C has no independent freedom to lag or smooth]" },
    "i":      { "name": "Instantaneous current", "unit": "A",
                 "derived": "i = im * sin(theta + PI/2) = im * cos(theta)   [LEADS v by exactly PI/2 rad = 90° = T/4, always]" },
    "slope_v":{ "name": "Instantaneous slope of v — the S4 PRIMARY-aha value, the tangent-walk cursor's live number", "unit": "V/s",
                 "derived": "slope_v = vm * omega * cos(theta)   [= dv/dt exactly; i = C * slope_v identically, since C*vm*omega*cos(theta) = im*cos(theta) — NEVER a hardcoded 15.7, since vm is live-draggable at S4]" },
    "q":      { "name": "Instantaneous charge on the plates (signed)", "unit": "C", "derived": "q = C * v = q_max * sin(theta)" },
    "q_max":  { "name": "Maximum plate charge — the S5 constant-cargo readout, frequency-INDEPENDENT", "unit": "C", "derived": "q_max = C * vm" },

    "p":      { "name": "Instantaneous power delivered TO the capacitor (S6/S8) — SIGNED, opposite sign convention from ac_voltage_inductor's p", "unit": "W",
                 "derived": "p = v * i = (vm*im/2) * sin(2*theta)   [+ = storing into the field, − = field returning energy to the source; STORE-quarter-first, verified §2]" },
    "p_amp":  { "name": "Amplitude of the power oscillation", "unit": "W", "derived": "p_amp = vm*im/2" },
    "p_avg":  { "name": "Cycle-average power — EXACT zero, over an interval as short as T/2 = π/ω (p's own period), not just a full T", "unit": "W", "derived": "p_avg = 0" },

    "U":      { "name": "Energy stored in the capacitor's E-field, instantaneous — the U-gauge value", "unit": "J",
                 "derived": "U = 0.5 * C * v^2 = Umax * sin(theta)^2   [breathes 0 <-> Umax TWICE per source period T, peaking at v's OWN crest — dU/dt = p(t) exactly, verified §2]" },
    "Umax":   { "name": "Maximum stored energy — the U-gauge's ceiling AND the p-strip store-lobe's shaded area", "unit": "J", "derived": "Umax = 0.5 * C * vm^2" },

    "lead_seconds": { "name": "Time lead between the i-peak and the next v-peak — the S2 bracket's number", "unit": "s",
                        "derived": "lead_seconds = T/4 = 1/(4*f_demo)   [shrinks as f_demo rises; if the S2 bracket persists visually into S5, its TIME label must rescale live with f_demo]" },
    "lead_degrees": { "name": "Phase lead in degrees — frequency-INDEPENDENT, always exactly a quarter cycle", "unit": "deg", "constant": 90 },

    "bead_frac": { "name": "Micro-band wire-bead position fraction, 0/1=ends 0.5=home (Rule 33b)", "unit": "dimensionless",
                     "derived": "bead_frac = 0.5 + A_frac * sin(theta)   [SIGN FLIPPED from both siblings, owing to this concept's own phase: d(bead_frac)/dt = A_frac*omega*cos(theta), proportional to i(t)=im*cos(theta) with the SAME sign — beads are at MAXIMUM speed exactly at theta=0 (v=0, i=im, the S1 'full flood' plant) and MOMENTARILY AT REST exactly at theta=pi/2 (v-crest, i=0, the S1 'frozen' plant)]" },
    "A_frac":    { "name": "Bead-excursion visual scale, calibrated to 0.30 at defaults (fleet convention, reused unmodified)", "unit": "dimensionless",
                     "derived": "A_frac = clamp(0.30 * (im/omega) / (2.00/1.5708), 0.08, 0.42)" },

    "charge_glyph_frac": { "name": "Plate charge-glyph density fraction, 0=empty 1=full (Rule 33c)", "unit": "dimensionless",
                             "derived": "charge_glyph_frac = abs(sin(theta))   [= |q|/q_max; polarity/direction = sign(q) = sign(sin(theta)) — glyphs pile INTO one plate and drain OUT of the other, NEVER cross the gap]" },
    "field_brightness": { "name": "Inter-plate E-field brightness/density — cool blue/geometric ONLY, the plates BODY never receives this or any emissive (Rule 33d)", "unit": "dimensionless (0–1)",
                            "derived": "field_brightness = U/Umax = sin(theta)^2 = v^2/vm^2   [peaks EXACTLY at v's own crest (t=1,3,5...s at defaults) — the 'field brightest while beads freeze' S1 plant; = 0 exactly at v=0 (t=0,2,4...s) — the companion 'beads at full flood while the plates are empty' half of the same plant; self-normalized to that state's own Umax, safe at every slider corner, no external reference needed]" },
    "arrow_dir": { "name": "Wire-current arrow direction / charge-glyph polarity sense", "unit": "sign (±1)",
                    "derived": "arrow_dir = sign(i) = sign(cos(theta))   [flips at i's own zero crossings, i.e. EXACTLY at v's crest/trough instants (t=1,3,5...s at defaults) — a full quarter-cycle BEFORE v's own zero crossings (t=0,2,4...s). ONE flip schedule drives BOTH the wire arrow and the plate charge-glyph polarity here — unlike ac_voltage_inductor, which needed two independently-timed arrow-pairs (wire-current vs back-emf). Binding — see §6.4.]" }
  },

  "computed_outputs": {
    "v_display":         { "formula": "vm*Math.sin(omega*t)" },
    "vC_display":        { "formula": "vm*Math.sin(omega*t)" },
    "i_display":         { "formula": "im*Math.cos(omega*t)" },
    "im_display":        { "formula": "omega*C*vm" },
    "Xc_display":        { "formula": "1/(omega*C)" },
    "slope_display":     { "formula": "vm*omega*Math.cos(omega*t)" },
    "q_display":         { "formula": "C*vm*Math.sin(omega*t)" },
    "qmax_display":      { "formula": "C*vm" },
    "p_display":         { "formula": "(vm*im/2)*Math.sin(2*omega*t)" },
    "U_display":         { "formula": "0.5*C*vm*vm*Math.sin(omega*t)*Math.sin(omega*t)" },
    "Umax_display":      { "formula": "0.5*C*vm*vm" },
    "field_brightness_display": { "formula": "Math.sin(omega*t)*Math.sin(omega*t)" },
    "bead_frac_display": { "formula": "0.5 + A_frac*Math.sin(omega*t)" },
    "lead_seconds_display": { "formula": "1/(4*f_demo)" },
    "avg_p_display":     { "formula": "0.0" }
  },

  "formulas": {
    "instantaneous_voltage":      "v = vₘ sin(ωt) — the applied AC voltage, ω = 2πf_demo",
    "plate_voltage_tracks_source": "v_C = v — an ideal capacitor's own voltage answers the source EXACTLY, at every instant (S3)",
    "defining_relation":          "i = C·(dv/dt) — the defining law: current is the RATE charge must arrive, never v's size (S4 PRIMARY aha)",
    "instantaneous_current":      "i = iₘ sin(ωt + 90°) = iₘ cos(ωt), iₘ = vₘ/X_C — current LEADS voltage by exactly a quarter cycle",
    "reactance":                  "X_C = 1/(ωC) — the frequency-made opposition; X_C FALLS as ω rises (opposite the coil) and X_C→∞ as ω→0 (a steady/DC capacitor draws no current — blocks DC outright)",
    "plate_charge":               "q = Cv, q_max = Cvₘ — frequency-INDEPENDENT (S5's constant-cargo number)",
    "instantaneous_power":        "p = v·i = +(vₘiₘ/2) sin(2ωt) — SIGNED, symmetric about zero, twice the source frequency; STORE-quarter-first (opposite sign from ac_voltage_inductor's p)",
    "average_power":              "⟨p⟩ = 0 EXACTLY — not approximately — over any interval that is a whole multiple of T/2 = π/ω",
    "stored_energy":              "U = ½Cv² = Umax sin²(ωt), Umax = ½Cvₘ² — breathes 0↔Umax twice per source period, peaking at v's OWN crest; dU/dt = p(t) exactly",
    "lobe_area_link":             "∫ p dt over any store quarter = Umax exactly — verified: ∫₀^{1s} 10 sin(πt) dt = 20/π ≈ 6.366 J at defaults, matching Umax bit-for-bit (§2)",
    "point_symmetry_fold":        "p(t_c+τ) = −p(t_c−τ) at any zero crossing t_c of p(t) — every positive STORE lobe is the exact 180°-point-rotation of its trailing negative RETURN lobe about their shared zero crossing (S8's fold)",
    "closed_form_derivation":     "q = Cv → i = C·dv/dt = ωCvₘ cos ωt = iₘ sin(ωt + π/2); the ω landing UPSTAIRS (multiplying) IS X_C's falling-with-frequency behaviour, and the +cos IS the 90° lead — one differentiation yields both headline results (S8), where the sibling's integral dropped ω downstairs"
  },

  "constraints": [
    "i(t) = im sin(ωt + π/2) LEADS v(t) = vm sin(ωt) by EXACTLY π/2 rad (90°, T/4) at every instant — never lags, never in-phase, for a pure ideal capacitor.",
    "v_C(t) = v(t) exactly, at every instant — an ideal capacitor's own voltage always equals the source's; i = C dv/dt is the SLOPE of that shared voltage, never v's value directly (the entire content of the PRIMARY aha).",
    "X_C = 1/(ωC) FALLS as frequency rises and as capacitance rises; X_C → ∞ as ω → 0 (a steady/DC capacitor draws zero current once charged — blocks DC outright).",
    "p(t) = v(t)·i(t) = +(vm·im/2)·sin(2ωt) is exactly odd-symmetric about every one of its own zero crossings — store and return lobe areas cancel PAIRWISE and exactly, never approximately, so ⟨p⟩ = 0.",
    "U(t) = ½Cv(t)² ≥ 0 always; dU/dt = p(t) exactly — the U-gauge and the p-strip are the SAME physics, never independently scripted.",
    "q_max = Cvm is frequency-INDEPENDENT — only the TIME available to deliver it (T/4 = 1/(4f)) shrinks as f rises, which is why im = ω·q_max grows with frequency even though q_max itself never changes."
  ]
}
```

**Edge-case sweep (Escalation check, per role spec) — Python-verified:**

```
omega = pi/2 = 1.570796...   Xc = 5.0   im = 2.0   T = 4.0
lead seconds = T/4 = 1.0
qmax = 1.27324 (= 4/pi)          max v-slope = 15.708 (= 5*pi)   i=C*slope = 2.0 ✓
p amplitude = 10.0                Umax = 6.36620 (= 20/pi)
S5 sweep:  f=0.10 → Xc=12.5, im=0.80   f=0.25 → Xc=5.0, im=2.00   f=0.50 → Xc=2.5, im=4.00
hot corner (vm=20,f=0.5,C=0.4):  Xc=0.7958 Ω, im=25.13 A
dead corner (vm=2,f=0.1,C=0.04): Xc=39.79 Ω, im=0.0503 A
store-lobe integral ∫₀¹ p dt (numeric quad) = 6.366198 J, error 7e-14 — matches vm·im/(2ω)=20/π bit-for-bit
⟨p⟩ over [0,2] (T/2) numeric = -7.4e-17 ≈ 0 exactly
```

`vm` floor = 2V (never a divide issue — numerator everywhere). `f_demo` floor = 0.1Hz → `omega` floor 0.6283 rad/s. `C` floor = 0.04F. `X_C = 1/(omega*C)` therefore never divides by zero anywhere in the declared ranges (worst case `omega*C` = 0.6283×0.04 = 0.02513 → `X_C`=39.79Ω, finite).

**FLAG resolved — the skeleton's own two noted corners (both physically honest, not a bug):**
1. **Do not raise the C floor to hide the hot corner.** `C=0.4F` is a pedagogically real "large demo capacitor" value; narrowing the range would quietly reduce syllabus-honest exploration.
2. **Auto-scale the scope's i-axis** to a computed ceiling (reuse the sibling's exact recipe): `i_axis_max = max(2.5 · im_current, 5.0)` — always ≥5A near defaults, clears the analytic worst case (`im_max = vm_max·ω_max·C_max = 20×π×0.4 ≈ 25.13A`) with headroom.
3. **Reuse the `A_frac` clamp `[0.08, 0.42]`** — verified at BOTH corners: hot corner `im/ω=25.13/3.1416=8.0`, ratio to default `1.2732`→`6.283`, raw `A_frac=1.885`→clamps to **0.42**; dead corner `im/ω=0.0503/0.6283=0.0800`, ratio `0.0628`, raw `A_frac=0.0188`→clamps to **0.08** (beads still visibly swing, not degenerate — the dead-corner FLAG is resolved: explore never goes visually static).
4. **Never clamp the displayed HUD number.** `iₘ=25.1A` (or `0.05A`) is shown honestly — only the rendering geometry is bounded.
5. `field_brightness = sin²θ` needs **no** fixed-reference clamp (self-normalized to that state's own `Umax`) — safe at every corner by construction, same as both siblings' analogous channel.

---

## 2. Per-state variable notes (`variable_overrides`)

Direct application of `default_variables_only_first_var_merged` (canonical, confirmed via live query under `--owner peter_parker:runtime_generation` precedent both siblings cite): every non-live variable must be pinned explicitly, never left to fall through.

| State | `variable_overrides` | Why |
|---|---|---|
| S1 | `{ vm: 10.0, f_demo: 0.25, C: 0.1273 }` | Full lock — no live controls; both S1 plants (full flood at v=0, frozen beads + brightest field at the v-crest) must land at exact defaults. |
| S2 | `{ vm: 10.0, f_demo: 0.25, C: 0.1273 }` | Full lock — the ghost must equal "literally the coil's exact 2.00A quarter-late trace," which only holds because `X_C = X_L(sibling) = 5.0Ω` exactly at these defaults; the exact-inversion identity (`sin(θ+π/2)≡−sin(θ−π/2)`) needs matched `iₘ`. |
| S3 | `{ vm: 10.0, f_demo: 0.25, C: 0.1273 }` | Full lock — the A→B→A′ loop boundaries (t=0,1,2,3,4s) and the `q=+1.27C`/`v=v_C=+7.1V` mirror must land at exact defaults. |
| S4 | `{ f_demo: 0.25, C: 0.1273 }` | **`vₘ` LIVE, no override on it** (DF2 precedent). `f_demo`/`C` locked so ONLY vₘ's effect on the tangent steepness + `iₘ` scale is visible (32b) — the three stop TIMES (0, 1.0, 2.0s) stay pinned since they depend only on the locked `ω`. |
| S5 | `{ vm: 10.0, C: 0.1273 }` | **`f_demo` is the scripted/live variable, no override on it.** **CRITICAL defensive override on `vm`:** S4 leaves `vm` live-dragged — without re-locking it here, a teacher who raised `vm` in S4 would silently carry a wrong `vm` into S5, corrupting the authored plateau numbers (`iₘ=0.80/4.00A`, `q_max=1.27C`) the narration states as exact fact. `C` stays locked throughout (locked until S9). |
| S6 | `{ vm: 10.0, f_demo: 0.25, C: 0.1273 }` | Full lock — **CRITICAL defensive re-lock** of BOTH `vm` (S4 legacy) and `f_demo` (S5 legacy — a genuine teacher drag mid-ramp could leave `f` anywhere in [0.1,0.5]). The signed product-walk table (0/±10.0W boundary values, the "area=6.37J" shading, the gauge's 0↔6.37J excursion) needs exact defaults. |
| S7 | `{ vm: 10.0, f_demo: 0.25, C: 0.1273 }` | Full lock — same CRITICAL defensive reasoning as S6. The dead-needle `0.00W` reading (re-confirmed every 2.0s) must be exact and repeatable across the state's 7–10 cycles. |
| S8 | `{ vm: 10.0, f_demo: 0.25, C: 0.1273 }` | Full lock — apparatus `reveal_hold` (dimmed, static); the derivation's numeric anchors (10.0V/2.00A/±10.0W/6.37J) must match locked defaults exactly. |
| S9 | *(none — inherits `default_variables`: vm=10.0, f_demo=0.25, C=0.1273)* | Explore; `vm`, `f_demo`, `C` ALL live (Rule 31). No override needed since nothing else is locked. |

**Control-gating note (independently re-verified, matches skeleton exactly):** `f_demo` is LOCKED until S5 (a live `f` before S5 changes `iₘ=ωCvₘ` and pre-spoils S5's whole reveal). `C` is LOCKED until S9 (C's own inversion — bigger C = LESS opposition — is a narration clause at S5, explored live only in the sandbox). `vₘ` goes LIVE at S4 (DF2 pattern), then is defensively RE-LOCKED at S5 and stays locked through S8.

---

## 3. Within-state motion timeline + per-state control spec (all 9 states)

**Shared machinery (define once, reference per state) — all formulas verified numerically above:**

- **Wire beads (micro band, Rule 33b):** `bead_frac(t) = 0.5 + A_frac·sin(θ)`. **Verified against the S1 narration plants:** beads pass through center (`bead_frac=0.5`) at MAXIMUM speed exactly at `θ=0, π, 2π` (t=0, 2.0, 4.0s — the v-ZERO instants, since `i(t)=iₘ` there) — "beads at full flood while v reads zero." Beads are momentarily AT REST exactly at `θ=π/2, 3π/2` (t=1.0, 3.0s — the v-PEAK instants, since `i(t)=0` there) — "beads freeze dead at the v-crest."
- **Plate charge glyphs (micro band, Rule 33c):** `charge_glyph_frac(t) = |sin(θ)|` (density, 0=empty→1=full), polarity = `sign(sin θ)`. Glyphs pile INTO one plate / drain OUT of the other — **never cross the gap**, terminating exactly at the plate surface every frame.
- **Wire current arrow / charge-glyph polarity sense:** `arrow_dir(t) = sign(i) = sign(cos θ)`. **Flips at t = 1.0s, 3.0s** (i's own zero crossings, at the v-PEAK/trough instants) — **a full quarter-cycle BEFORE** v's own zero crossings (t=0, 2.0, 4.0s). This single stagger IS the lead made mechanically visible.
- **Inter-plate E-field brightness (macro↔micro link, Rule 33d):** `field_brightness(t) = U(t)/Umax = sin²θ`. Peaks (brightest) exactly at t=1.0, 3.0s (v-crest/trough — the S1 plant: "field brightest while beads freeze"); zero at t=0, 2.0, 4.0s (v=0 — plates genuinely empty there). **Cool blue-cyan geometry only** — the plates BODY never receives this or any other emissive channel. **Driven every frame; EXEMPTED from `applyGlowEmphasis`** when `plates`/`efield`/`charge` is glow_focal (S1/S3/S7).
- **Plate voltage / slope (S3/S4):** `v_C(t) = v(t)` exactly (ideal capacitor). `slope_v(t) = vm·ω·cos θ`. At defaults, `slope_v(0)=+5π≈+15.71 V/s`, `slope_v(1.0)=0`, `slope_v(2.0)=−5π≈−15.71 V/s` — all Python-verified. **Live with `vₘ`:** at any dragged `vₘ`, `slope_v = vₘ·ω` at the zero-crossing stops, scaling proportionally, while the stop TIMES never move (locked `ω`).

---

### S1 `capacitor_joins_the_circuit` — core — `oscillate/track`

| t-window | What animates | Driven by | Live controls |
|---|---|---|---|
| continuous, from t=0 | v-trace draws live: `v(t)=vₘsin(ωt)`; dashed `vₘ` peak line at t=1.0s | `t`, `ω` (locked) | **none** |
| continuous | wire beads oscillate per `bead_frac(t)`; charge glyphs pile/drain per `charge_glyph_frac(t)`; beads never cross the plate gap | `t`, `ω` | — |
| continuous | cool blue-cyan inter-plate field breathes per `field_brightness(t)`, peaking at t=1.0/3.0s; plates stay cold (no emissive) | `t`, `ω` | — |

`f`/`C` LOCKED (see §2/§3 gating note). Two deliberate, unnamed plants: beads at full flood + field DARK at v-zero instants (t=0,2,4s); beads frozen + field BRIGHTEST at v-crest instants (t=1,3s) — both resolved narratively at S2/S4. glow_focal = `plates`.

---

### S2 `current_leads_quarter_cycle` — core — `ghost-overlay-compare` (16a confrontation #1)

Cue-bound sequence (`ghost_dock` s1 → `bead_disobey_beat` s2 → `real_sweep_start` s3 → `lead_bracket_land` on the naming sentence):

1. **Ghost docks first** (readable ~0.5–1s before anything else moves, 32a): dashed grey `i_ghost(t) = iₘ sin(ωt − π/2) = −iₘcos(ωt)` — last lesson's exact quarter-LATE rhythm, literally the sibling's 2.00A trace at these defaults (`X_L=X_C=5.0Ω`). Legend: "last lesson's rhythm (the coil — ¼ late)."
2. **Bead-disobey beat:** at t=0 the ghost claims maximum BACKWARD flow (`i_ghost(0)=−iₘ=−2.00A`); the real apparatus disagrees — beads surge FORWARD at full flood (verified: `i_real(0)=+iₘ`, exact opposite of the ghost at every instant, `sin(θ+π/2)≡−sin(θ−π/2)`).
3. **Real i-trace sweeps in, clock-drawn** (never a phase-slide morph — binding 32a caution): `i(t)=iₘcos(ωt)`, same `iₘ=2.00A`, cresting at t=0 (and 4.0, 8.0s) — 1.0s BEFORE v's crest at t=1.0s (and 5.0s).
4. **Lead bracket lands** with time-order arrow: "i crests 1.0 s BEFORE v = ¼ cycle = 90°."

No live controls (full lock, §2). glow_focal = `i_trace`.

---

### S3 `plates_fill_and_push_back` — core — `cycle-compare`

Loop **A→B→A′** on the plate close-up (camera nudges in once), repeating continuously on the state's own T=4.0s clock — Python-verified table:

- **A** (`0 ≤ t < 1.0s`, FILLING): v climbs 0→+10.0V; current DIES from `+2.00A→0` as `i(t)=iₘcos(ωt)` falls (plates' answer catching up); charge glyphs thicken 0→`q_max`; field brightens 0→1.
- **B** (`t=1.0s`, CREST): plates full — `q=+1.27C`, `i=0.00A`, field brightest.
- **A′** (`1.0 ≤ t < 2.0s`, SPILLING): source eases (v still positive, falling toward 0 at t=2.0s), plates POUR charge back (`q` falls `q_max→0`), current already reversed (`i` goes negative right after t=1.0s, reaching `−iₘ` at t=2.0s) — **current reversed a full quarter-cycle (t=1.0s) before v itself reverses sign (t=2.0s)**.
- Loop repeats `[2.0,4.0]` with opposite polarity (q negative), closing at t=4.0s ≡ t=0.

HUD pair mirrors LIVE at every instant: `v = +7.1V / v_C = +7.1V` — tracking volt-for-volt (representative t=0.5s: both `+7.07V` exactly). One clause: no charge ever crosses the gap — the circuit's current IS the filling and draining.

No live controls (full lock, §2). glow_focal = `charge`.

---

### S4 `current_copies_the_slope` — core — **PRIMARY AHA** — `tangent-walk`

Cursor walks the V-TRACE carrying a live tangent arrow, `slope_v(t)=vₘω·cos(θ)`. Three cue-gated stops (Python-verified):

| Stop | t | v | slope_v = dv/dt | i = C×slope_v | note |
|---|---|---|---|---|---|
| 1 | 0 s | 0 (rising, steepest) | **+vₘω** (=+15.7 V/s at default) | **+iₘ** (=+2.00A) | i at its own peak, exactly at v's steepest climb |
| 2 | 1.0 s | +vₘ (crest) | 0 (flat) | 0 | beads freeze, plates full |
| 3 | 2.0 s | 0 (falling, steepest) | **−vₘω** (=−15.7 V/s) | **−iₘ** (=−2.00A) | i at its negative peak |

**PLAIN LIVE `vₘ`** (binding — no scripted driver, unlike S5): every frame recomputes `slope_v = vₘ(t)·ω` — never a hardcoded `15.7`. Dragging `vₘ` steepens every tangent AND scales `iₘ=vₘ/X_C` in step, while stop TIMES (0/1.0/2.0s) stay pinned (they depend only on the locked `ω`). Caption slot draws ONLY the latest fired stop (F1 clearRect fix pattern).

Live control: **vₘ** (2–20V, plain live). glow_focal = `tangent`.

---

### S5 `reactance_falls_with_frequency` — extended — `ramp-response` (16a confrontation #2)

**Scripted eased f-ramp: 0.25 → 0.50 → 0.10 → 0.25 Hz**, drag-seize + DOM-thumb+label lockstep (`ghost_compare_cause_invisible_slider_frozen` fix pattern — confirmed still OPEN in the live queue, applied here as binding), phase via the closed-form ramp-integral (`field3d_dt_accumulated_motion_invisible_to_eye_timepin` fix pattern — clone of the inductor's lemma, schedule-generic math, re-verified numerically to error `<1e-10` for this build independently):

```
Δθ(u) = 2π·ΔT·[ f₀·u + (f₁−f₀)·(u³ − u⁴/2) ]         (partial segment, smoothstep(u)=3u²−2u³)
Δθ(1) = π·ΔT·(f₀ + f₁)                                  (full-segment total)
```

**Schedule** (same leg timing as the sibling — the lemma is schedule-generic, independent of L vs C):

| Segment | Window | f(t_r) | X_C, iₘ at boundary |
|---|---|---|---|
| Leg A (rise) | [0, 4.0s], smoothstep 0.25→0.50 | — | at 4.0s: **X_C=2.5Ω, iₘ=4.00A** (SWELLS) |
| Hold A | [4.0, 5.5s] | 0.50 const | unchanged |
| Leg B (fall) | [5.5, 11.5s], smoothstep 0.50→0.10 | — | at 11.5s: **X_C=12.5Ω, iₘ=0.80A** (starves) |
| Hold B | [11.5, 13.0s] | 0.10 const | unchanged |
| Leg C (return) | [13.0, 17.0s], smoothstep 0.10→0.25 | — | at 17.0s: **X_C=5.0Ω, iₘ=2.00A** (default) |
| Post-ramp hold | t_r>17.0 | 0.25 const | holds until drag/exit |

Accumulated phase (Python-verified against direct numerical integration, error ~3e-9): Leg A total `Δθ=3π`; Hold A adds `1.5π`; Leg B total `Δθ=3.6π`; Hold B adds `0.3π`; Leg C total `Δθ=1.4π`. `θ_entry = (π/2)·t_rampStart` (ordinary pre-ramp phase). **Constant-cargo readout:** `q_max = Cvₘ = 1.27C` pinned at EVERY frequency — verified `iₘ=ω·q_max` at each leg's f: `0.1→0.628×1.2732=0.80✓`, `0.25→2.00✓`, `0.5→3.1416×1.2732=4.00✓`.

**Drag-seize:** identical mechanism to both siblings — grab halts the script permanently for this state-entry; phase continues as ordinary live `θ(t)=θ_at_drag+2π·f_live(t)·(t−t_drag)`.

**Visible effects:** at the f=0.50 plateau the i-envelope SWELLS to 4.00A (beads swing MORE energetically — the inverted contrast to the sibling's "barely budge"); at f=0.10 the current starves to 0.80A (beads barely budge). Live `X_C` readout tracks `5.0→2.5→12.5→5.0Ω`. Trace y-scales rescale smoothly (C¹ continuity guaranteed by smoothstep's zero-derivative at boundaries).

Live control: **f_demo** (0.1–0.5Hz, drag-seize + thumb-lockstep). glow_focal = `xc_readout`.

---

### S6 `power_swings_both_ways` — extended — `trace-product`

p-strip docks at t=0 with its zero baseline highlighted; **background trace draws continuously from t=0** — state-entry sits exactly at a `q=0`/`i=iₘ` boundary, the START of a STORE lobe (a DIFFERENT positioning from the inductor's t=0, which sat at a U-MAXIMUM — flagged explicitly, not a discrepancy). Cursor walk covers ONE full period `[0, 4.0s]` starting immediately (no offset shift needed, unlike the inductor's `[1.0,5.0s]` walk). Python-verified table:

| t | v | i | p=v·i | U | note |
|---|---|---|---|---|---|
| 0 | 0 | +2.00 | 0.0 W | 0 | touches zero, entering STORE |
| 0.5 | +7.07 | +1.41 | **+10.0 W** | 3.18 J | store peak |
| 1.0 | +10.00 | 0 | 0.0 W | **6.37 J** | touches zero, U at max, entering RETURN |
| 1.5 | +7.07 | −1.41 | **−10.0 W** | 3.18 J | return trough |
| 2.0 | 0 | −2.00 | 0.0 W | 0 | touches zero, U=0, entering STORE (opposite polarity) |
| 2.5 | −7.07 | −1.41 | **+10.0 W** | 3.18 J | store peak (2nd, negative v & i) |
| 3.0 | −10.00 | 0 | 0.0 W | **6.37 J** | touches zero, U at max again |
| 3.5 | −7.07 | +1.41 | **−10.0 W** | 3.18 J | return trough (2nd) |
| 4.0 | 0 | +2.00 | 0.0 W | 0 | loop closes ≡ t=0 |

**The curve CROSSES zero** four times per period. Shaded store-lobe label lands on the FIRST store lobe `τ∈[0,1]`: "area = 6.37 J" — verified `∫₀¹ p dt = 6.366198 J` (scipy quad, error 7e-14) = `20/π` exactly, matching `Umax` bit-for-bit. Note the gauge breathes at v's OWN crests (t=1,3s) — opposite the inductor's i-crest timing — same 2f rate.

No live controls (full lock, §2, CRITICAL defensive re-lock of vm/f_demo). glow_focal = `p_strip`.

---

### S7 `nothing_consumed` — extended — SUPPORTING AHA — `null-result-hold` (16a confrontation #3)

Meter (`avg_p` mode) docks at t=0. `⟨p⟩` over ANY interval that is a whole multiple of `T/2=2.0s` (p's own period) is EXACTLY zero — verified `∫₀² p dt ≈ −7.4×10⁻¹⁷ ≈ 0` (numeric quad). Needle displayed as a HELD constant `0.00 W`, re-confirmed every 2.0s. State spans ~14–20s (word budget 30–45) → **7–10 independent re-confirmations**. Meanwhile beads rock, charge glyphs pile/drain, field breathes, U-gauge fills/drains `0↔6.37J` — the null is on the METER ONLY. Clause: "same size of opposition as the coil too, opposite clock; only the resistor ate" — plates cold forever, contrast against the resistor's steady 10.0W heater through the same 5Ω.

No live controls (full lock, CRITICAL defensive re-lock). glow_focal = `meter`.

---

### S8 `one_derivative_both_results` — advanced — `chain-link-derivation`

3D apparatus `reveal_hold` (dimmed, static — Rule 26 motion carried entirely by the scope-pane fold + algebra dock, per Rule 32b). Cue-bound (`fold_start`/`fold_end` s1–2, `identity_dock` s3):

**The fold (exact, distinct construction from S6's product-walk — do not conflate):** `p(t)` has zero crossings every 1.0s (t=0,1,2,3,4,...), each lobe spanning exactly 1.0s with peak magnitude 10.0W at its midpoint. **Verified exact odd-symmetry** about every zero crossing `t_c`: `p(t_c+τ)=−p(t_c−τ)` for any τ. Concretely: rotating the FIRST STORE lobe's peak `(0.5, +10)` by 180° about the shared zero crossing `(1.0, 0)` gives `(1.5, −10)` — **exactly the following RETURN lobe's trough** (matches the S6 table exactly). This is the visual: each positive (store) lobe rotates 180° about its trailing zero crossing and lands flush on the next negative (return) lobe — areas cancel pairwise, `⟨p⟩=0` exact.

**Algebra dock (s3):** the chain `q=Cv → i=C·dv/dt = ωCvₘ cos ωt = iₘ sin(ωt+π/2)` docks. The `ω` landing UPSTAIRS (multiplying, in the numerator) IS `X_C`'s falling-with-frequency behaviour — where the sibling's integration dropped `ω` downstairs (into a denominator, causing `X_L` to RISE with frequency), this differentiation lifts it upstairs: one sign of one calculus step IS the whole L↔C inversion. Then `p=(vₘiₘ/2)sin 2ωt → ⟨p⟩=0` docks alongside the fold.

No live controls (full lock). glow_focal = `formula`.

---

### S9 `ac_capacitor_sandbox` — core (ring-neutral) — `drag-sandbox`

Free-runs continuously (Rule 37, never freezes). All formulas from §1 apply live with `vₘ`, `f_demo`, `C` all draggable (trusted-drag seizes manual):

- v/i traces re-scale live (`vₘ`, `iₘ=ωCvₘ`); beads re-pace (`A_frac`, clamped `[0.08,0.42]`, verified at both extreme corners §1); charge glyphs re-pile (`charge_glyph_frac`); field re-breathes (`field_brightness=sin²θ`, self-normalized, safe at every corner); HUD tracks `v`, `i`, `iₘ` live.
- Formula surface: **`i leads v by ¼ cycle (90°)` only** (core-ring, Rule 38b) — p-strip, `X_C` readout, `q` readout, and U-gauge are **deliberately ABSENT** (extended-ring content, F3 HUD gate enforced).
- Scope y-axis auto-scale per §1's edge-case recommendation.

Live controls: **ALL** — vₘ (2–20V), f_demo (0.1–0.5Hz), C (0.04–0.40F). glow_focal = `formula`.

---

## 4. Board-mode mark scheme + derivation sequence — **SKIPPED**

Per the active conceptual-only directive (founder 2026-06-11, Rule 20 suspension) and skeleton DoD §10(e): **no `mode_overrides`, no board mark scheme, no derivation_sequence authored for this concept.**

---

## 5. Drill-down cluster phrasings (9 clusters × 5 phrases = 45)

### S2 — `why_lead_not_lag`
- "why does current lead and not lag this time"
- "didnt the coil teach us current is always late"
- "why is the capacitor the opposite of the coil"
- "is lead just lag backwards or something different"
- "why does this component flip the rule from last time"

### S2 — `current_before_voltage_causality`
- "how can the current arrive before the voltage that causes it"
- "isnt that backwards, effect before cause"
- "does the capacitor know the voltage is coming"
- "how does current know to rise early if nothing pushed it yet"
- "is this actually breaking cause and effect"

### S2 — `reading_lead_lag_on_time_graphs`
- "how do i tell from the graph which one is early"
- "does the earlier peak mean it leads or lags"
- "why does the arrow point forward not backward"
- "which curve crossing zero first tells me the lead"
- "im lost reading which peak comes first on this graph"

### S4 — `i_equals_c_dvdt_meaning`
- "what does i equals c dv dt actually mean here"
- "why does capacitance multiply the rate of change and not the voltage itself"
- "is dv dt just how fast the voltage is changing"
- "why isnt there a v term directly in that equation"
- "what is c actually doing in that formula"

### S4 — `v_slope_vs_v_value_confusion`
- "why does the current care about voltages slope and not its value"
- "im confused how a slope can create a current"
- "so voltage size doesnt matter to the current"
- "how is slope different from the voltage itself"
- "why cant i just read current straight off the voltage graph"

### S4 — `why_exactly_quarter_early`
- "why exactly a quarter cycle early and not some other amount"
- "is the quarter cycle lead always exact or just approximate"
- "could the lead be a different fraction for a different capacitor"
- "why does the geometry force exactly 90 degrees early"
- "why is it always a quarter, never a third or a fifth early"

### S7 — `capacitor_charging_heats_misconception`
- "if the plates keep pushing back doesnt that cost energy like a resistor"
- "why doesnt the capacitor heat up if its always resisting"
- "isnt charging something always going to waste some energy"
- "why does a resistor heat but a capacitor doesnt"
- "so pushing back on current isnt the same as burning it up"

### S7 — `where_field_energy_goes_capacitor`
- "where does the energy in the field actually go"
- "does the energy disappear when the field collapses"
- "if energy is stored between the plates where does it go when they discharge"
- "is the energy really given back or lost somewhere"
- "whats on the other end getting that returned energy"

### S7 — `zero_power_but_current_flows_capacitor`
- "how can average power be zero when current is clearly flowing"
- "doesnt current always mean some power is being used"
- "if power is zero why does the ammeter still show current"
- "is zero average power even possible with real current flowing"
- "why does the wattmeter read zero while the circuit is obviously active"

---

## 6. Constraint callouts

1. **`radians()` N/A.** No slider is degree-valued (`f_demo` Hz, `vₘ` V, `C` F); `theta` is native radians throughout — no `radians()` wrap needed anywhere.
2. **HUD display precision:** `v`/`v_C` → 1dp signed (`+7.1 V`); `i` → 2dp signed (`+1.41 A`); `iₘ` → 2dp; `X_C` → 1dp (`5.0 Ω`, styled-subscript compose per §6.6); `q`/`q_max` → 2dp (`+1.27 C`); `p` → **1dp SIGNED** (`+7.1 W` — mirrors the inductor's convention, NOT the resistor's unsigned convention, since p genuinely swings both signs); `U` → 2dp (`4.25 J`); `⟨p⟩` → held `0.00 W`.
3. **`C`'s default (0.4/π ≈ 0.1273F) is deliberately NOT on the 0.02F step grid.** Forced by chapter-continuity design (`X_C=1/(ωC)=5.000Ω` exactly at defaults, matching both siblings' `5.0Ω`). Do not round the authored default to a grid-aligned value.
4. **ONE flip schedule drives both the wire arrow and the charge-glyph polarity here** (`arrow_dir(t)=sign(cos θ)`, flipping at t=1,3,5...s) — **unlike `ac_voltage_inductor`, which needed two independently-timed arrow-pairs** (wire-current vs back-emf, staggered 1.0s apart). Do not port the inductor's two-arrow-pair logic; this concept needs only one.
5. **`field_brightness = sin²θ` is self-normalized to that state's own `Umax`** — like both siblings, no fixed external `P_REF` is needed (no cross-state/cross-corner comparison requirement here).
6. **Styled-subscript compose routine (genuinely NEW machinery — no clone source exists, per §0b req 7).** Unicode has no subscript-"c" codepoint. `X_C` and `v_C` render via the NEW two-draw compose routine on BOTH raster text paths — canvas (`ctx.fillText`) and 3D sprite (`createLabelSprite`): base letter full-size, then "C" at reduced size on a lowered baseline, x-advanced by the measured base-glyph width, Cambria Math throughout. DOM/HUD path uses `<sub>C</sub>` or a CSS reduced-size/lowered-baseline span. **Authored source strings carry the plain ASCII token `X_C` / `v_C` (capital C, underscore, exactly this casing)** — physics_author, json_author, and the engine dispatch MUST use this exact token; the engine's compose routine MUST NEVER emit the literal underscore or side-by-side `XC` on screen.
7. **S5's phase MUST be the closed-form piecewise formula of §3 S5, never a per-frame accumulator** — verify via the same re-pin-to-earlier-timestamp-after-a-later-one test the `dt_accumulated` fix used (byte-identical value required).
8. **Dedicated Cambria-Math formula panel carries every §1 `formulas` string** — never the generic `#formula_overlay` (confirmed still OPEN in the live queue as `field3d_formula_overlay_generic_not_cambria_math`, 2026-07-23).
9. **Beads never cross the gap** (load-bearing correctness visual) — engine must render bead termination AT the plate surface, converting to/from charge glyphs there, verified in every frame, not just keyframes.
10. **Plates/E-field never receive warm/heat-tinting in any state** (anti-heater discipline) — the inter-plate field is geometric line-work brightness only, driven every frame and EXEMPTED from `applyGlowEmphasis` when `plates`/`efield`/`charge` is glow_focal (S1/S3/S7).

---

## Self-review checklist

- [x] Every symbol referenced in the skeleton's state narratives (v, v_C, i, iₘ, X_C, slope_v/dv/dt, q, q_max, p, U, Umax, ⟨p⟩, θ, ω, lead) appears in `variables`.
- [x] No `radians()` needed anywhere — confirmed §6.1.
- [x] Every state's live control(s) declared exactly per the architect's control table (vₘ→S4 plain-live, f_demo→S5 scripted+drag-seize, ALL→S9), each with default/min/max/step in §1.
- [x] `variable_overrides` documented for all 9 states (§2); S5's `vm:10.0` and S6/S7/S8's `{vm:10.0, f_demo:0.25}` flagged CRITICAL (defensive-lock chain, direct application of `default_variables_only_first_var_merged`).
- [x] Board-mode section explicitly SKIPPED (Rule 20 [D]).
- [x] Drill-down cluster phrasings: 9 clusters × 5 phrases = 45, real-student-voice, plain English, no Hinglish, no textbook prose.
- [x] `constraints` block: 6 short physics assertions (§1) + 10 engineering constraint callouts (§6).
- [x] Numerical sanity check run and independently Python-verified: ω=π/2, X_C=5.00Ω exactly, iₘ=2.00A, lead=1.0s, p amplitude=10.0W, ⟨p⟩=0 (numeric ~1e-17), Umax=20/π≈6.37J, store-lobe integral=6.366198J (error 7e-14), S5 sweep X_C=12.5/5.0/2.5Ω at f=0.1/0.25/0.5Hz with iₘ=0.80/2.00/4.00A, hot corner iₘ≈25.13A, dead corner iₘ≈0.0503A — all independently reproduced, not copied.
- [x] Closed-form S5 ramp-phase lemma re-verified numerically (error ~3e-9 for the leg totals, ~1e-10 partial-segment against direct numerical integration) — confirmed schedule-generic (identical to the sibling's, independent of L vs C).
- [x] Within-state motion timeline written for all 9 states: every row a pure function of the state clock `t` (Rule 26); 9 distinct archetypes carried forward from skeleton (ZERO new coins, per skeleton's economy design), none static; controls column matches architect table exactly.
- [x] **Rule 32 sequencing verified per state:** S2 (ghost docks, THEN beads disobey, THEN real trace sweeps); S3 (v climbs THEN glyphs thicken THEN current dies); S4 (cursor reads v THEN i-dot answers); S5 (f ramps THEN envelope swells/starves); S6 (signs disagree THEN bar drops THEN gauge drains). **Binding 32a "never fake the lead" caution enforced in formulas:** i(t) computed as the closed-form `iₘcos θ`, never a frame-advance of v(t); ghost is a static dashed hypothesis, never phase-slid into the real trace.
- [x] **Word budget (Rule 31a):** not physics_author's to author (architect owns narration text) — confirmed the skeleton's stated 30–55-word budgets per state are consistent with the motion complexity each state's formulas require.
- [x] **Notation ladder (Rule 38c):** S1–S7/S9 formula surfaces are algebra-only (`v=vₘsin ωt`, `X_C=1/(ωC)`, `iₘ=vₘ/X_C`, `p=v·i`, `⟨p⟩=0`, `U=½Cv²`); calculus (`dv/dt`, `π/2` radians) confined entirely to S8, the advanced-ring state — confirmed no calculus/vector operator appears anywhere else, no FLAG needed. **Dialect (38d):** no board-divergent term requiring dual-labeling — N/A, confirmed clean.
- [x] Engine bug queue consulted LIVE via `query_engine_bug_queue.ts` (`--field3d --open`, `--owner alex:physics_author`, `ac_voltage_capacitor`, `ac_voltage_inductor`, `ac_voltage_resistor`, `ac_generator`, plus a 924+563-row full-dump grep for the two commit-cited scars); every relevant OPEN rule cross-checked and applied; the two commit-cited FIXED scars (`4dc1c76`, `ad7975b`) do NOT surface as live queue rows under any filter tried — FLAGged to quality_auditor (§ top of this document) as a gap in the queue's seeding, not a physics gap.
- [x] DC Pandey check: no formula, explanation, or example problem imported from any external book — every formula in §1 derived directly from `q=Cv`/`i=dq/dt` + trig identities, all non-trivial claims independently Python-verified.

---

**Files/commands referenced (read-only + live queries, no edits made):**
- `C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7\ac_voltage_capacitor\skeleton.md` (input contract, full read)
- `C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7\ac_voltage_inductor\physics_block.md` (format/rigor precedent — physics independently re-derived, not copied)
- `C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7\ac_voltage_resistor\physics_block.md` (format precedent)
- `npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts` (live DB consultation — several filter combinations run)
- Python (`scipy.integrate.quad`) — all locked numbers, the store-lobe integral, `⟨p⟩` over T/2, and the S5 closed-form ramp lemma independently verified numerically

This physics block is ready to append to `skeleton.md` and hand to the §3b engine dispatch (new `scenario_type: "ac_capacitor"`, clean standalone sibling clone — build scope `ac_capacitor` alone, neither sealed sibling touched) followed by `json_author`.

---

## Report back

**Store-lobe integral — independently verified, not copied:** `∫₀^{1s} p(t) dt` where `p(t)=(vₘiₘ/2)sin(2ωt)` at defaults computed by direct numerical quadrature = **6.366198 J** (error 7×10⁻¹⁴), matching the closed form `vₘiₘ/(2ω) = 20/π ≈ 6.3662 J` bit-for-bit and equal to `Umax=½Cvₘ²=20/π`. This confirms the skeleton's stated correction (the "2× arithmetic slip" it flags as fixed) is now the physically correct form — an independent derivation from `∫₀^{T/4}(vₘiₘ/2)sin(2ωt)dt = (vₘiₘ/(4ω))[1−cos(2ω·T/4)] = (vₘiₘ/(4ω))·2 = vₘiₘ/(2ω)` lands on the same 20/π independently.

**S5 sweep — independently verified exact:** f=0.1→`X_C=12.5Ω, iₘ=0.80A`; f=0.25→`X_C=5.00Ω, iₘ=2.00A`; f=0.5→`X_C=2.50Ω, iₘ=4.00A`, with `q_max=Cvₘ=1.2732C` pinned at every point and `iₘ=ω·q_max` checked exactly at each leg (0.80/2.00/4.00, all match). Hot corner `iₘ≈25.13A`, dead corner `iₘ≈0.0503A` both confirmed; the `A_frac` bead clamp `[0.08,0.42]` absorbs both corners without going degenerate (dead corner clamps to the 0.08 floor, still visibly non-static).

**One physics point worth a second look (not an error):** the skeleton's S6 cue-plan text ("the cursor walks one period from t=0") sits at a genuinely DIFFERENT phase-alignment than the sibling's S6 walk (which starts at t=1.0s, a U-maximum instant) — because THIS concept's t=0 is a `q=0` boundary (a store-lobe START), not a U-maximum. This is exactly what the skeleton specifies and it is physically correct — flagged only so json_author doesn't reflexively copy the sibling's `[1.0,5.0]` walk-window offset onto this concept's S6 (it should be `[0,4.0]`, as written above).

**Nothing else in the skeleton failed independent verification.** The lead direction, the falling-reactance inversion, the p(t) sign (STORE-quarter-first, opposite the inductor's), the `q_max` frequency-independence, the `Umax=20/π` coincidental numerical echo with the sibling's `½Liₘ²`, and both edge-corner claims all check out exactly as stated.

**Gap flagged to quality_auditor (not a physics gap, a queue-seeding gap):** the two commit-cited FIXED scars the skeleton relies on (`field3d_rms_subscript_ascii_in_renderer_text_paths` / `4dc1c76`, `field3d_dt_accumulated_motion_invisible_to_eye_timepin` / `ad7975b`) do not appear as rows in the live `engine_bug_queue` table under any filter tried (`--field3d`, `--owner peter_parker:renderer_primitives` full 179-row dump, concept-name queries for both siblings). Both prevention rules are applied regardless (they're independently sound engineering constraints, verifiable from the commit diffs), but Gate 8 should not expect a live-queryable row for either — confirm via `git show` on those SHAs rather than the queue table if verification is needed.
