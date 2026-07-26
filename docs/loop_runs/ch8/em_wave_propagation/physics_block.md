# PHYSICS BLOCK — `em_wave_propagation`

> Authored by physics_author against the `DESIGN_OK` skeleton (`docs/loop_runs/ch8/em_wave_propagation/skeleton.md`, cycle-2) + Checkpoint A carry-forwards (`checkpoint_a_report.md`). No redesign of arc/state-count/archetypes/locked numbers — this block adds physics rigor, per-state motion/control timing, `teacher_script` physics content, constraint callouts, and drill-down phrasings for json_author to render against the field3d-surgeon's `em_wave_propagation` scenario build (§0b, frozen).

**Engine bug queue consultation (live, this dispatch had Bash+DB access):**
```
npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts em_wave_propagation   → 0 rows (new concept, clean)
npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --field3d --open       → 29 rows
npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --owner alex:physics_author → 7 rows
```
Prevention rules applied below: **`default_variables_only_first_var_merged`** (CRITICAL/FIXED, `peter_parker:runtime_generation`) — every variable with a non-trivial default (`nu`, `E0`, `n_slab`, `source_on`) is explicitly declared in §1a, none left to an implicit fallback. **`teach_show_quantity_live_when_named`** — λ/ν readouts born on S6's naming sentence, ratio chip on S7's, tanks on S8's (already the skeleton's design; verified consistent below). **`teach_reveal_synced_to_narration`** — every `at_ms` below is tied to a named sentence per the skeleton's cue plan, not a bare fixed offset. **`teach_color_each_element_by_its_own_sign`** — N/A here (no mixed-sign charge assembly; the single source charge bead is one object, not a signed collection). **`field3d_formula_overlay_generic_not_cambria_math`** (MODERATE/OPEN) — flag to json_author/field3d-surgeon: confirm `emw_formula` rides the Cambria-Math-serif special-cased path, not the generic 13px-monospace `#formula_overlay` fallback. **`field3d_sliders_panel_top12_vs_fsbtn_top10`** (MODERATE/OPEN) — the ν/E₀/n/source rows and any top-anchored HUD must clear `top:52px+` on both edges (already declared in skeleton §10 S6 zoning; extend the same clearance to all 4 slider rows). None of the 29 OPEN field_3d rows name `em_wave_propagation` yet (new concept) — the `PEDAGOGY_*` generic rows and `solenoid_*`/`gauss_law_sphere` rows are pre-existing scars on OTHER concepts, listed for quality_auditor's Gate-8 regression pass, not actionable here.

---

## 1. `physics_engine_config`

### 1a. Variables

```json
{
  "nu": {
    "name": "Source frequency (ν)",
    "unit": "MHz",
    "min": 50,
    "max": 200,
    "default": 100,
    "step": 5
  },
  "E0": {
    "name": "Field strength (E amplitude — labelled without subscript until S7)",
    "unit": "V/m",
    "min": 40,
    "max": 200,
    "default": 120,
    "step": 5
  },
  "n_slab": {
    "name": "Refractive index of the medium slab (n) — S10 only, advanced ring",
    "unit": "dimensionless",
    "min": 1.0,
    "max": 2.0,
    "default": 1.5,
    "step": 0.05
  },
  "source_on": {
    "name": "Source ON/OFF — slider-controlled only on S11; scripted (not slider-driven) on S2",
    "unit": "boolean (0/1)",
    "min": 0,
    "max": 1,
    "default": 1,
    "step": 1
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
  "D_gate": {
    "name": "Timing-gate separation distance (S6 only)",
    "unit": "m",
    "constant": 6.00
  },
  "c": {
    "name": "Speed of light in vacuum",
    "unit": "m/s",
    "derived": "1 / sqrt(mu0 * eps0)"
  },
  "nu_Hz": {
    "name": "Source frequency in SI base units",
    "unit": "Hz",
    "derived": "nu * 1e6   -- MHz->Hz conversion, see 6a"
  },
  "T_period": {
    "name": "Wave period",
    "unit": "s",
    "derived": "1 / nu_Hz"
  },
  "lambda_vac": {
    "name": "Wavelength in vacuum",
    "unit": "m",
    "derived": "c / nu_Hz"
  },
  "B0": {
    "name": "Magnetic field amplitude (B₀ = E₀/c)",
    "unit": "T",
    "derived": "E0 / c   -- SI Tesla; UI displays this * 1e6 as microtesla, see computed_outputs"
  },
  "k_wave": {
    "name": "Wave number (vacuum)",
    "unit": "rad/m",
    "derived": "2 * PI / lambda_vac   ( = 2*PI*nu_Hz / c )"
  },
  "omega_wave": {
    "name": "Angular frequency",
    "unit": "rad/s",
    "derived": "2 * PI * nu_Hz"
  },
  "uE": {
    "name": "Electric energy density at a crest",
    "unit": "J/m^3",
    "derived": "0.5 * eps0 * E0 * E0"
  },
  "uB": {
    "name": "Magnetic energy density at a crest",
    "unit": "J/m^3",
    "derived": "(B0 * B0) / (2 * mu0)   -- computed from B0 in SI TESLA, never the displayed microtesla value (see 6b / FL4)"
  },
  "dt_gate": {
    "name": "True gate transit time (unrounded internal)",
    "unit": "s",
    "derived": "D_gate / c"
  },
  "v_medium": {
    "name": "Phase speed inside the slab",
    "unit": "m/s",
    "derived": "c / n_slab"
  },
  "lambda_medium": {
    "name": "Wavelength inside the slab",
    "unit": "m",
    "derived": "v_medium / nu_Hz"
  }
}
```

**Slider rows (4, matching skeleton §0b exactly):** `emw_freq_row` → `nu` (50–200 MHz, step 5, default 100; live on S6, S11) · `emw_e0_row` → `E0` (40–200 V/m, step 5, default 120; live on S7, S8, S11) · `emw_n_row` → `n_slab` (1.0–2.0, step 0.05, default 1.5; **live on S10 ONLY**, advanced ring) · `emw_src_row` → `source_on` (toggle; **live on S11 ONLY** — S2's switch-open is a scripted state-clock event on the same underlying variable, never the slider).

### 1b. Formulas (PM_interpolate syntax — **no `radians()` anywhere**; the phase argument `k·x − ω·t` is already in radians by construction, no degree conversion exists in this concept. Two genuinely silent-failure-risk unit conversions DO exist — see §6a/6b.)

```json
{
  "speed_of_light": "c = 1 / sqrt(mu0 * eps0)",
  "wavelength_vacuum": "lambda_vac = c / (nu * 1e6)",
  "period": "T_period = 1 / (nu * 1e6)",
  "amplitude_ratio": "B0 = E0 / c",
  "wavenumber": "k_wave = 2*PI / lambda_vac",
  "angular_frequency": "omega_wave = 2*PI * nu * 1e6",
  "phase_before_slab": "phi(x,t) = k0*x - omega_wave*t                              -- x < x_slab_a, k0 = omega_wave/c",
  "phase_inside_slab": "phi(x,t) = k0*x_slab_a + n_slab*k0*(x - x_slab_a) - omega_wave*t   -- x_slab_a <= x <= x_slab_b",
  "phase_after_slab": "phi(x,t) = k0*x_slab_a + n_slab*k0*(x_slab_b - x_slab_a) + k0*(x - x_slab_b) - omega_wave*t  -- x > x_slab_b",
  "E_field_train": "E(x,t) = E0 * sin(phi(x,t))   -- on ŷ, valid everywhere incl. inside slab",
  "B_field_train": "B(x,t) = (E0 / c) * sin(phi(x,t))   -- on ẑ, SAME phi(x,t) as E at every x incl. inside slab (vacuum-ratio stylization inside the slab is DECLARED, unnarrated — F2/FL5, see 5)",
  "energy_density_E": "uE(t) = 0.5 * eps0 * E(x_cursor,t)^2",
  "energy_density_B": "uB(t) = B(x_cursor,t)^2 / (2*mu0)",
  "gate_transit_time_true": "dt_gate_true = D_gate / c   -- 20.0138... ns, internal only, never displayed raw",
  "measured_speed_from_display": "v_measured = D_gate_display / dt_gate_display   -- computed from the ROUNDED HUD numbers 6.00m / 20.0ns, see 5/FL2",
  "medium_speed": "v_medium = c / n_slab",
  "medium_wavelength": "lambda_medium = v_medium / (nu * 1e6)",
  "crest_count_ratio_check": "nu_in_slab == nu_outside_slab   -- identity, ω(hence ν) never changes across the boundary by construction (see phase formulas)"
}
```

### 1c. `computed_outputs` (UI display — HUD is value-only per Rule 34b)

```json
{
  "c_display": { "formula": "c.toFixed(0)", "note": "shown as 2.998e8 -> format '2.998×10⁸ m/s' (S6 formula-dock line 2)" },
  "v_measured_display": { "formula": "'3.0×10⁸ m/s'  -- literally 6.00/20.0e-9, exact given the two ROUNDED display inputs (S6 formula-dock line 1)" },
  "T_display_ns": { "formula": "(T_period * 1e9).toFixed(1)", "note": "10.0 ns" },
  "lambda_display": { "formula": "lambda_vac.toFixed(2)", "note": "3.00 m" },
  "nu_display_MHz": { "formula": "nu.toFixed(0)", "note": "100 MHz" },
  "E0_display": { "formula": "E0.toFixed(0)", "note": "120 V/m" },
  "B0_display_uT": { "formula": "(B0 * 1e6).toFixed(2)", "note": "0.40 μT — computed from unrounded B0 in Tesla, THEN scaled for display" },
  "ratio_display": { "formula": "'3.0×10⁸'", "note": "E0/B0 in SI = c again, same string family as c_display but frozen chip (never ticks, S7)" },
  "uE_display": { "formula": "(uE * 1e8).toFixed(2)", "note": "LOCKED '6.38×10⁻⁸ J/m³' — see FL4, §5" },
  "uB_display": { "formula": "(uB * 1e8).toFixed(2)", "note": "MUST render the IDENTICAL '6.38×10⁻⁸ J/m³' string — computed via its OWN independent B²/2μ₀ chain, not copied from uE_display" },
  "D_display": { "formula": "D_gate.toFixed(2)", "note": "6.00 m" },
  "dt_display_ns": { "formula": "'20.0'", "note": "rounds from 20.0138ns; see §5 FL2 rounding note" },
  "k_display": { "formula": "k_wave.toFixed(2)", "note": "2.09 rad/m (S9 only)" },
  "omega_display": { "formula": "omega_wave.toExponential(2)", "note": "6.28×10⁸ rad/s (S9 only)" },
  "n_display": { "formula": "n_slab.toFixed(2)", "note": "1.50 (S10)" },
  "v_medium_display": { "formula": "v_medium.toExponential(2)", "note": "2.00×10⁸ m/s (S10)" },
  "lambda_medium_display": { "formula": "lambda_medium.toFixed(2)", "note": "2.00 m (S10)" }
}
```

### 1d. `constraints`

```json
[
  "c = 1/sqrt(mu0*eps0) is a GLOBAL constant of this concept — it never changes with nu, E0, or source_on; only n_slab (S10 only) changes the LOCAL phase speed",
  "B(x,t) = E(x,t)/c holds POINTWISE at every x and every t, not only at a crest — therefore uB(t)/uE(t) = 1 for ALL t, not only at the crest snapshot (uE=uB is a continuous identity, not a coincidence engineered at one instant)",
  "omega_wave (hence nu) is IDENTICAL on both sides of the slab boundary at every instant — only k_wave changes inside the slab (k_inside = n_slab * k0); this is what makes 'frequency holds, wavelength shortens' true by construction, not by narrative assertion",
  "the motes' position is a pure function of seed index ONLY, never of E(x,t)/B(x,t) or of t (except a global opacity fade in S3) — this null-displacement IS the physics being taught, not a rendering shortcut",
  "the speed chip (S6/S11) must never move on an nu or E0 drag; it moves ONLY when n_slab changes (S10), and even then it reports v_medium, never overwriting the vacuum c chip",
  "no state before S6 renders mu0, eps0, c, or the word 'light' in any text path (caption/HUD/formula/label/narration) — the don't-pre-spoil scar (§0a)"
]
```

---

## 2. Per-state `variable_overrides`

Following the `hinge_force.json` STATE_4 / `field_forces.json` STATE_5 defensive pattern — pin every value the narration/HUD asserts, even where it matches the slider default, so a residual teacher-drag from a prior visit to S6/S7/S8/S10 can never desync a guided state's numbers.

| State | `variable_overrides` | Why |
|---|---|---|
| STATE_1 | `{ nu: 100, E0: 120, n_slab: 1.0, source_on: 1 }` | S1's needle-kick must settle at the canonical 120 V/m / 0.40 μT peak every visit; `n_slab` defensively pinned to 1.0 even though `emw_slab` isn't rendered here — closes the "leaked n distorts speed elsewhere" risk named in §1d |
| STATE_2 | `{ nu: 100, E0: 120, n_slab: 1.0 }` | `source_on` is THIS state's own scripted variable (true→false mid-dwell on the state clock, never slider-driven here) — not overridden, per the dc S4/S9 pattern of never locking a state's own live/scripted control |
| STATE_3 | `{ nu: 100, E0: 120, n_slab: 1.0, source_on: 1 }` | "the receiver's 120 V/m peak reading" is a locked HUD assertion (§3 S3) — must read exactly 120, not a residual drag value |
| STATE_4 | `{ nu: 100, E0: 120, n_slab: 1.0, source_on: 1 }` | No live slider exists in S4 (camera/triad only) — every value must be locked so the crest/trough RHR demo is reproducible |
| STATE_5 | `{ nu: 100, E0: 120, n_slab: 1.0, source_on: 1 }` | The "twin readouts peak together" contrast needs the canonical E0/B0 pair; no live slider in S5 |
| STATE_6 | `{ E0: 120, n_slab: 1.0 }` | `nu` is THIS state's own live control (not overridden); `E0` and `n_slab` locked so λ/ν readouts and the c-vs-measured MATCH always resolve to the exact locked numbers |
| STATE_7 | `{ nu: 100, n_slab: 1.0 }` | `E0` is this state's own live/auto-sweep control (not overridden, dc S9/S10 pattern); `nu` locked so λ stays at 3.00 m throughout (frequency isn't this state's topic) |
| STATE_8 | `{ nu: 100, n_slab: 1.0 }` | `E0` is this state's own live/auto-sweep control; `nu` locked so k/ω-adjacent numbers never drift while the energy-tank equality is being demonstrated |
| STATE_9 | `{ nu: 100, E0: 120, n_slab: 1.0 }` | No live slider in S9 — the docked `B_z = (E0/c)·sin(kx−ωt)` line and the k=2.09/ω=6.28×10⁸ values are exact only at the locked defaults |
| STATE_10 | `{ nu: 100, E0: 120 }` | `n_slab` is THIS state's own live control (default 1.5, not overridden — FL1 requires the seize to drive it live); `nu`/`E0` locked so λ_vac=3.00 m and λ_med=2.00 m match §2's locked numbers exactly, and no E/B ratio artifact can appear even incidentally |
| STATE_11 | *(none)* | Rule 31/37: explore surfaces the authored defaults (nu 100, E0 120, source_on 1) via `default_variables`, not `variable_overrides` — dragging is the entire point; `n_slab`/`emw_slab` are not instantiated in S11 (core-ring only, §10 i-2) |

---

## 3. Within-state motion timeline + per-state control spec (Rule 31/26/32)

### 3.0 Shared design decisions (declared once, referenced below)

**Time-scaling license (FL3 — never "time-dilation"):** the DISPLAYED numeric readouts (T, Δt, λ, ν, c, v) are always the TRUE physical SI values computed from the formulas in §1b/1c — never stylized. What IS stylized, and only this, is the **screen-pacing** of the traveling-wave ANIMATION (how many wall-clock seconds it takes to watch a pulse cross the axis). A real 10 m pulse crosses at c in ~33 ns — imperceptible — so the animation is deliberately slowed to a watchable pace while the readouts keep reporting the real ns numbers. This decoupling (motion pace ≠ displayed-number pace) is the entire content of the license; it must never be described as relativistic and must never affect a computed value, only a screen-time duration.

**Pulse/gate timing locks (the task's explicit ask):**
- S1 full-axis pulse transit (source → far receiver, home pose, `wave_mode:'pulse'`): **launch at t=1200ms, arrival at t≈9000ms** (≈7.8 s screen-pace to cross the ~10 m axis), needle-kick settles and holds ~9000–9800ms, soft reset ~9800–10800ms, relaunch — **period ≈9.0s, ~2 cycles across the 18s dwell**, matching skeleton's "~2 cycles/dwell."
- S6 gate-to-gate transit (D = 6.00 m, gates at x=2.0m and x=8.0m on the axis): **gate A tick fires at the sentence-2 cue (~4500ms), gate B tick fires at ~7000ms** (≈2.5 s screen-pace for the 6 m segment), stopwatch **display** climbs 0.0→20.0 ns over that same 2.5 s window and then HOLDS at **20.0 ns** (rounded from the true internal 20.0138 ns — see §5 FL2).
- S2 leapfrog-relay hand-off period: **T_relay = 1.0 s per single hand-off** (E-kink glow 0–0.4s → readable beat → B-loop glow 0.4–0.8s, "one step ahead" → both fade 0.8–1.0s while the chevron marches forward one stylized step, ≈ λ/3 of screen distance) — **2.0 s per full E→B→E leapfrog cycle**, giving **3 full cycles across S2's 6 s zoom window** (sentence 3, 12.0–18.0s), continuing ambient if the teacher lingers.
- S7/S8 field-strength auto-sweep range: **E0(t) = 120 + 60·sin(2π·t / 8.0s)**, i.e. **60–180 V/m**, well inside the 40–200 slider bounds; first trusted drag on `emw_e0_row` seizes to full manual and the sweep stops (explorer trusted-drag pattern, identical mechanism to `displacement_current` S10's `I_c` sweep).
- Slab geometry (S10, locked default for legibility, non-binding on physics): `x_slab_a = 3.0m`, `x_slab_b = 7.0m` (4.0 m thick) — at default n=1.5 this holds exactly 2 full medium-wavelengths (λ_med=2.00m); at n_min=1.0 it holds ~1.33 (still ≥1 full crest-to-crest, legible); at n_max=2.0 it holds ~2.67 (denser but still resolvable — **flag to quality_auditor: verify visual legibility of crest spacing at n=2.0 via THE EYE dense frames, per the field3d checklist's "read dense ramp frames" directive**).

**Cursor mechanics (S5, S8):** `emw_cursor` sits at a **fixed x** (mid-axis, inside the S1–S9 vacuum region, e.g. x=5.0m) and reads the LOCAL field as the traveling wave sweeps past it — it does NOT translate along the axis chasing crests. At a fixed x, E(x,t) and B(x,t) both cycle sinusoidally in t at the same phase (period T=10.0 ns, stylized to a readable ~2–3 s screen period for S5/S8's "ride the train" beat), so "rides the train" means the cursor sits astride the moving wave, reading it locally, not that the cursor itself moves.

**Energy-tank refill rate (S8, worth flagging explicitly):** because u ∝ sin²(φ), the tanks fill/empty at **twice** the field's own frequency (period T/2, not T) — both crest AND trough of the field give the SAME max energy reading. This is why the skeleton's "crest → zero → crest" cursor language is correct even though it skips over the trough: sin²(φ) is indifferent to the sign of E/B, so every half-period looks like "crest → zero" from the tank's point of view.

### 3.1 STATE_1 `wiggle_launches_wave` — core · `translate-through` (paired w/ S6) · budget 40–55w/~18s

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0–1200ms | apparatus at rest, switch closed but bead still, no visible ripple, receiver gauges idle at 0 | — (pre-cause hold) | none |
| 1200ms | charge bead begins a short wiggle burst (cause) | `source_on=1`, scripted burst | none |
| 1200–2200ms | bead oscillates a few cycles (burst envelope) | scripted local burst | none |
| ~1800–2400ms | green E-ripple + blue B-ripple pulse detaches from the source and begins traveling +x (effect, readable continuation of the burst) | `E(x,t)`, `B(x,t)` pulse-mode envelope | none |
| 2400–8800ms | pulse travels the ~10 m axis at stylized screen-pace (real transit = D_axis/c ≈ 33 ns, decoupled per the time-scaling license); NO speed/Δt/gate number shown anywhere in this state | phase advance per §1b, mode=pulse | none |
| ~8800–9000ms (~0.6–1s beat BEFORE arrival) | nothing yet at the receiver — the wait itself is the teaching point | — | none |
| ~9000ms | pulse reaches the receiver; needle kicks up to the peak reading (E=120 V/m, B=0.40 μT) | `E(x_receiver,t)`, `B(x_receiver,t)` | none |
| 9000–9800ms | needle settles and HOLDS at peak (deriveStateMeta settle-pin, THE-EYE-captured frame) | — | none |
| 9800–10800ms | soft reset: pulse-visual clears, needle eases back toward 0, low-salience, unnarrated | — | none |
| loop from 1200ms | repeats ~2× across the 18 s dwell | — | none |

Cause→effect gap (32a): switch-wiggle (cause) → detached pulse (effect) ~0.6–1.2s; pulse-travel (cause) → needle-kick (effect) is the ENTIRE state's dramatic beat, ~7.6s — the delay IS the lesson.

### 3.2 STATE_2 `the_handshake` — core · `leapfrog-relay` · budget 40–55w/~18s

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0–6000ms (sentence 1) | pulse launches exactly as S1 (home-pose echo); traveling +x | phase advance, mode=pulse, `source_on=1` | none |
| 6000ms (sentence 2, "switch-open") | source switch visibly OPENS (one-shot cue); bead freezes instantly | `source_on: 1→0` (scripted, state-local) | none |
| 6000–6800ms (~0.6–0.8s beat) | pulse visibly CONTINUES, unchanged shape/speed — pixel-identical to before the switch-open | phase advance, unaffected by `source_on` | none |
| 6800–12000ms | pulse keeps traveling; NO new wavefront originates from the now-still source | phase advance | none |
| 12000ms (sentence 3, "relay-zoom") | camera-near zoom band opens at the pulse front; `emw_relay` chevron begins ticking (T_relay=1.0s per hand-off, per §3.0) | scripted relay choreography | none |
| 12000–18000ms | 3 full leapfrog cycles: E-kink glow → beat → B-loop glow "one step ahead" → fade → chevron marches +x, repeat | scripted, phase-locked to the pulse-front x-position | none |

**Hard narration guardrail (Escalation #4 / §4 planting-audit):** BOTH the E-kink and B-loop are ALREADY continuously present and in-phase throughout (per S5's later teaching) — the relay glow is a highlight riding on top of the always-simultaneous fields, never a sequential appear/disappear. The chevron must never make either field visually vanish between "hand-offs."

### 3.3 STATE_3 `no_medium_needed` — core · `null-result-hold` · budget 30–45w/~14s

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0–4700ms (sentence 1) | mode switches to continuous `train`; ~40 seeded gray motes sit along the axis at fixed positions; crests visibly sweep THROUGH them with zero displacement | `E(x,t)/B(x,t)` train, motes = pure fn of seed index only | none |
| 4700ms (sentence 2, "mote-vanish") | motes fade out over ~0.8s ("air pumped away") | opacity fade only, scripted | none |
| 5500–6100ms (~0.6s beat) | nothing else changes | — | none |
| 6100ms | "no change" chip appears and PINS (holds rest of dwell); train shape/speed/receiver reading (120 V/m) pixel-identical to before the vanish | — | none |
| 6100–14000ms (sentence 3) | train continues steady ambient oscillation; chip holds | phase advance, mode=train | none |

### 3.4 STATE_4 `transverse_structure` — core · `rotate/flip` · budget 40–55w/~18s

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0–4500ms (sentence 1) | train runs ambient (home pose); triad `x̂ŷẑ` fades in at marked point P | phase advance | none |
| 4500ms (sentence 2, "camera-out") | camera eases ONE round-trip toward the axis-on view (E vertical, B horizontal — the ONLY camera move in the whole concept, 32d) | scripted camera ease, ~3s | none |
| 7500–9000ms | hold at axis-on framing | — | none |
| 9000ms (sentence 3, "sweep+thrust") | RHR sweep-arc rotates E into B (cause) | scripted glyph animation, ~0.8s | none |
| 9800–10500ms | thrust arrow lights along +x (effect, readable beat) | `Ê × B̂ = x̂` | none |
| 10500–13500ms | hold at crest pose, thrust visibly +x | — | none |
| 13500ms (sentence 4, "trough re-sweep") | half a wave cycle later (natural T/2 phase advance, cued to land here), BOTH arrows flip (crest→trough) | phase advance, ω continuous | none |
| 14000–15500ms | sweep-arc re-performs; thrust arrow confirmed STILL +x — `(−Ê)×(−B̂) = Ê×B̂` | same RHR, sign-invariant | none |
| 15500–18000ms | camera eases back to the 3/4 home framing (one-shot, end of state) | scripted camera ease | none |

### 3.5 STATE_5 `in_phase` — core · `oscillate/track` · budget 40–55w/~18s

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0–4500ms (sentence 1, "ghost-spawn") | misconception beat (16a pivot #2): desaturated-red ghost B train spawns, shifted 90°, tagged "expected?" — E max where ghost-B reads ≈0 | scripted ghost, no physics link to real B | none |
| 4500–6300ms (sentence 2, "cursor-ride" begins) | `emw_cursor` fades in at a FIXED x (mid-axis), astride both real (blue) and ghost (red) trains | `E(x_cursor,t)`, `B(x_cursor,t)` | none |
| 6300–9000ms | twin readouts begin tracking: real E and real B rise/fall TOGETHER (in phase); ghost-B visibly out of step | same phase φ(x_cursor,t) for both real fields | none |
| 9000–13500ms (sentence 3) | continue tracking; cued to land on a held CREST moment: real E and real B simultaneously at max while ghost-B reads ≈0 at that exact instant — the falsification | φ = π/2 crest instant | none |
| 13500ms (sentence 4, final, "ghost-dissolve") | ghost train dissolves over ~1s | opacity fade | none |
| 14500–18000ms | end pose holds: real train + cursor + twin readouts continue ambient, in-phase | phase advance | none |

### 3.6 STATE_6 `speed_payoff` — core, PRIMARY aha · `translate-through` (paired w/ S1) · budget 40–55w/~18s

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0–4500ms (sentence 1) | mode returns to `pulse` (home-pose echo of S1 — the declared pair); gates A(x=2.0m)/B(x=8.0m) fade in, `D = 6.00 m` line appears, stopwatch idle at 0.0 ns | scripted setup | **ν** |
| 4500ms (sentence 2, "gate ticks") | pulse launches, reaches gate A → tick (cause); stopwatch starts | phase advance | **ν** |
| 4500–7000ms | pulse crosses the 6 m gap (≈2.5s screen-pace); stopwatch display climbs 0.0→20.0 ns in step | `dt_gate_true` internal, displayed rounded | **ν** |
| 7000ms | pulse reaches gate B → tick; stopwatch STOPS, holds at **20.0 ns** | one-shot, holds | **ν** |
| 9000ms (sentence 3, "v-dock") | `v = D/Δt = 6.00 m / 20.0 ns = 3.0×10⁸ m/s` docks as line 1 of `emw_formula` | `v_measured_display` | **ν** |
| 13500ms (sentence 4, "constant-dock + MATCH") | ε₀ chip (recall, `displacement_current`) and μ₀ chip (recall, `amperes_circuital_law`) slide into the SAME formula surface, resolve as line 2: `c = 1/√(μ₀ε₀) = 2.998×10⁸ m/s` | `c` formula | **ν** |
| 15500–16500ms | MATCH chip pins beside the surface, glows once, holds | — | **ν** |
| 16500–18000ms | λ/ν readouts born (`λ = 3.00 m`, `ν = 100 MHz`); ν slider row goes live | `lambda_vac`, `nu` | **ν** |
| ambient (lingering) | dragging ν visibly reshapes λ (`λ=v/ν` recomputes live) while the gates keep timing the SAME v — speed independent of ν, in vacuum | `lambda_vac(nu)`, `v_measured` fixed | **ν** |

**FL2 — narration framing (hard requirement, quoted verbatim for json_author):** the gate timing derives from the SAME internal v=c that the constant-dock computes — the two numbers agree BY CONSTRUCTION, which is correct physics (c *is* 1/√(μ₀ε₀)), not a coincidence to sell. Required framing: *"the speed timed here is the same 3×10⁸ that 1/√(μ₀ε₀) gives — the measured speed of light."* Never narrate this as two independent measurements that happened to match.

**Word-budget flag (see §7):** S6 is the densest state in the concept — 6+ distinct content pieces (gate mechanics, v=D/Δt, c=1/√(μ₀ε₀), MATCH/historical framing, λ/ν birth, sunlight anchor) inside one 40–55w budget. See §7 for the compression recommendation.

### 3.7 STATE_7 `amplitude_ratio` — extended · `lockstep-scale` · budget 30–45w/~14s

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0–4700ms (sentence 1) | field-strength row auto-sweeps: E0(t)=120+60·sin(2πt/8s); green envelope grows/shrinks (cause) | `E0(t)` scripted | **field strength** |
| continuous | blue envelope follows in EXACT lockstep — same instant, no separate readable-beat gap required (declared exception to 32a: the lockstep-SAME-instant IS the taught physics, matching the Rule-32a carve-out for co-moving cause+effect states) | `B0 = E0/c`, instantaneous | **field strength** |
| 4700–9400ms (sentence 2) | gauges track live: `E0 = …`, `B0 = …`; at default (120) B0 reads exactly **0.40 μT**, shown prominently | `E0_display`, `B0_display_uT` | **field strength** |
| 9400–14000ms (sentence 3) | ratio chip `E0/B0 = 3.0×10⁸` appears and NEVER ticks despite the ongoing sweep (frozen-chip motif) | `ratio_display` invariant | **field strength** |
| ambient | auto-sweep loops (period 8s, ~1.75 cycles/dwell); first trusted drag seizes the row to manual and the sweep stops | teacher | **field strength** |

### 3.8 STATE_8 `energy_split` — extended · `cycle-compare` · budget 40–55w/~18s

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0–4500ms (sentence 1) | misconception beat (16a pivot #3): ghost tag posts "B is 0.0000004 — surely it carries almost nothing," quoting S7's own real number | scripted ghost | **field strength** |
| 4500ms (sentence 2) | cursor at fixed x begins natural time-evolution cycling (cause) | φ(x_cursor,t) | **field strength** |
| 5300ms onward (effect, ~0.8s beat) | tanks fill/empty in EXACT lockstep, period T/2 (twice field frequency, §3.0); at a crest/trough instant BOTH read **6.38×10⁻⁸ J/m³** (FL4 locked string); at φ=0/π BOTH read 0 | `uE(t)`, `uB(t)`, independent formula chains, same string | **field strength** |
| 9000–13500ms (sentence 3) | 2–3 more crest/zero passes visible, equality repeatedly demonstrated | same | **field strength** |
| 13500–18000ms (sentence 4) | field-strength control confirmed live (auto-sweep, same as S7); drag it — tanks rescale together, equality never breaks | `uE(E0)`, `uB(E0)` | **field strength** |

### 3.9 STATE_9 `write_the_partner_wave` — extended · `chain-link-derivation` · budget 40–55w/~18s

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0–4500ms (sentence 1) | train runs ambient (home pose, `train`, no slab); formula surface shows the GIVEN `E_y = E0 sin(kx−ωt)` | phase advance | none |
| 4500ms (sentence 2, link 1) | triad glows (recall of S4) → "direction: ẑ" docks | `Ê×B̂=x̂` recall | none |
| 9000ms (sentence 3, link 2) | cursor glows (recall of S5) → "same phase: same (kx−ωt)" docks | in-phase recall | none |
| 13500ms (sentence 4, link 3) | ratio chip glows (recall of S7) → "amplitude: E0/c" docks | ratio recall | none |
| 16000–17000ms | completed line `B_z = (E0/c)·sin(kx−ωt)` lights, fully assembled | `k_wave`, `omega_wave` locked | none |
| 17000–18000ms | the (already ambient) blue B train glows briefly in confirmation | — | none |

### 3.10 STATE_10 `into_a_medium` — advanced · `densify/rarefy` · budget 40–55w/~18s

| t-window | what animates | driven by | live controls |
|---|---|---|---|
| 0–4500ms (sentence 1, "slab-slide") | translucent slab slides into x∈[3.0,7.0]m (cause) | scripted slide | **n** |
| 4500–5300ms (~0.8s beat) | — | — | **n** |
| 5300ms onward (effect) | BOTH trains visibly slow and densify inside the slab: λ 3.00m → λ_med 2.00m; phase fronts crawl at v_medium=2.00×10⁸ m/s | `phase_inside_slab`, both E and B trains | **n** |
| 9000–13500ms (sentence 3, "crest-counter chip") | crest-counter chip shows the SAME `ν = 100 MHz` on both sides of the slab | `nu` continuity (ω global) | **n** |
| 13500–18000ms | wave exits slab, resumes λ=3.00m/v=c; dragging n live deepens/lessens the bunching (FL1 seize un-pins the clock, per §0b req 2) | `n_slab` live | **n** |

**F2/FL5 constraint (hard, verbatim):** BOTH trains stay drawn inside the slab, both at v=c/n, both bunched to λ_med=2.00m, ν continuous for BOTH. No E/B amplitude ratio surfaced anywhere on this state. The in-slab B amplitude keeps the vacuum ratio E/c — a declared, unnarrated stylization, never a spoken caveat. `emw_receiver`, if visible, must reflect POST-slab (x>7.0m, vacuum) values only — never an in-slab reading — so the stylized ratio can never be read off accidentally.

### 3.11 STATE_11 `em_wave_sandbox` — core-ring only · `drag-sandbox` · Rule 37 continuous-run, 0/open ≤20w

Train self-moves perpetually (phase advance is a pure fn of clock time, satisfies "explorers must move" natively — no artificial auto-sweep needed, per skeleton §0a). ν, field-strength, source-on rows ALL live. Gauges, λ, ν readouts, and the speed chip `3.00×10⁸ m/s` track live. **Hard constraint:** amplitude and frequency drags visibly change the wave but NEVER the speed chip. No slab, no n row, no ratio chip, no tanks, no k/ω (core-ring only, §10 i-2). Source-off behaves as in S2: already-launched wave continues, no new wavefronts originate.

---

## 4. Board-mode mark scheme

**DEFERRED — conceptual-only directive (Rule 20 [D]) is active.** No `mode_overrides`, no derivation sequence, no mark scheme authored for this concept (per skeleton §10e).

---

## 5. `teacher_script` guidance per state (physics content — json_author writes final EN wording)

- **S1 (40–55w):** name the wiggle as the CAUSE; state plainly that the far receiver only responds after a delay — "it takes time to arrive." Do NOT name a speed number, do NOT mention fields co-regenerating (that's S2). Silent on WHAT is waving — let the medium belief walk in unchallenged (killed at S3).
- **S2 (40–55w):** the resolving clause is "each field's change feeds the other, one step ahead" — **never** "E turns into B" (hard guardrail, plants the wrong 90° belief). State the source-off fact as a flat physical result, not a question.
- **S3 (30–45w, misconception pivot #1):** state the wrong belief as what a rope/sound-wave intuition would predict, then the flat counter: "nothing material waves — the fields regenerate each other, and empty space is all they need." Anchor: the phone-to-spacecraft radio link crossing genuinely empty space.
- **S4 (40–55w):** name E⊥B⊥direction-of-travel explicitly; state the thrust points where the wave goes "crest or trough alike" — the sign-invariance of E×B is the content, stated plainly, not derived.
- **S5 (40–55w, misconception pivot #2):** post the wrong belief ("E and B peak at different times") as the ghost's claim, then the counter: "E and B rise and fall together — in phase, crest with crest, zero with zero."
- **S6 (40–55w, PRIMARY aha — compression required, see §7):** lean on the VISUALS for gate mechanics (the numbers docking IS the demonstration); reserve narration words for the four insight clauses only — (i) the equality found, (ii) the historical-identity framing (FL2, exact required phrasing above), (iii) the MATCH, (iv) the sunlight anchor ("this is how sunlight crosses 150 million km of nothing to warm your face — light itself is this wave"). Do not narrate arithmetic ("six divided by twenty gives…") — the dock shows it.
- **S7 (30–45w):** state B₀=E₀/c plainly; deliberately voice the tiny number (0.40 μT) — it is the bait for S8's pivot, not a mistake to hide.
- **S8 (40–55w, misconception pivot #3):** post the ghost's claim quoting S7's own 0.40 μT number, then the counter: "the tiny number is a unit artifact — the wave's energy is split exactly half-and-half between E and B."
- **S9 (40–55w):** three short parallel recall clauses (direction / phase / amplitude), each ≤10 words, then the assembled line. This list-like structure compresses naturally, unlike S6.
- **S10 (40–55w):** state v=c/n plainly; the required clause is "the frequency never changes, only the wavelength shortens" — do not say "unlike in a medium" anywhere in states that survive the hide-S10 cut (per §10 i-1).
- **S11 (≤20w, open):** invite manipulation; name the one invariant a teacher can quiz on live: "drag anything — the speed never moves."

---

## 6. Physical constraints + edge cases

**(6a) Unit conversions the renderer MUST apply (silent-NaN-class risk, no `radians()` in this concept — the equivalent trap here is MHz→Hz):** the `nu` slider is authored in MHz (UI-friendly, matches the on-canvas `ν = 100 MHz` label) but EVERY formula in §1b requires Hz — `nu_Hz = nu * 1e6` must be applied before evaluating `lambda_vac`, `omega_wave`, `k_wave`, `T_period`. Do not evaluate any formula against the raw slider value.

**(6b) Display-unit conversions (must NOT feed back into physics):** `B0` is computed and stored in **Tesla** (SI); the μT HUD string is a DISPLAY-ONLY scaling (`*1e6`) applied at the last step. `uB` MUST be computed from `B0` in Tesla, never from the rounded `B0_display_uT` string — this is the same "compute from unrounded internals" discipline as `displacement_current`'s FL4 predecessor (dc-S8 rounding lesson), now doubly locked here by the FL4 requirement itself.

**(6c) FL4 rounding — verified, not just accepted:** independently recomputed with `eps0=8.8541878128e-12`, `E0=120`: `uE = 6.375015225216×10⁻⁸ J/m³` — strictly greater than the 6.375 midpoint, rounds to **6.38×10⁻⁸ under every convention** (not a genuine tie; checkpoint A's own re-derivation agrees exactly). Both tanks MUST compute this from their OWN independent formula chain (`½ε₀E²` for uE; `B²/2μ₀` for uB using B in Tesla) — the identical string is proof the physics holds, not a copy-paste shortcut.

**(6d) Slider-extreme edge cases:**
- `nu` at 200 MHz (max): λ_vac=1.499m — still ≥1λ margin inside the ~10m axis. At 50 MHz (min): λ_vac≈6.00m — ~1.7 wavelengths fit; bracket/λ-readout must recompute live at both extremes, never clip off-axis.
- `E0` at 40 V/m (min): B0=0.133 μT; at 200 V/m (max): B0=0.667 μT — receiver gauge and envelope-scale range must accommodate both without clipping.
- `n_slab` at 1.0 (min): the slab must produce ZERO visible bunching (λ_med=λ_vac=3.00m) — this is a live sanity check that the boundary formula is continuous at n=1 (a "no medium" slab should render indistinguishably from no slab at all). At 2.0 (max): λ_med=1.499m — densest bunching; flag to quality_auditor to verify crest-spacing legibility at this extreme via THE EYE dense frames (per the field3d checklist directive on reading dense ramp frames).
- `source_on` toggled OFF on S11: the ALREADY-LAUNCHED wave continues propagating (matches S2's teaching) but no NEW wavefront originates from the source point — bead visibly stops, but the traveling train already in the axis is unaffected until it exits frame.

**(6e) Boundary continuity (hard, F2/FL5):** the phase functions in §1b (`phase_before_slab`/`phase_inside_slab`/`phase_after_slab`) are continuous in x by construction (each piece matches its neighbor's value at the shared boundary) — verify the renderer's implementation does not introduce a phase JUMP at x=3.0m or x=7.0m (a naive `k(x)*x` instead of the cumulative/piecewise form above WOULD introduce a discontinuity — this is the one formula in this block that needs exact implementation, not just conceptual honoring).

**(6f) What must NEVER change when dragging ν or E₀ (S6/S7/S8/S11):** the speed chip (`c` or `v_measured`) — a drag on either slider must leave every speed/v-related readout numerically frozen; only λ (from ν) or the envelope/tank magnitudes (from E₀) may move. This is the single most important cross-state invariant in the concept and should be spot-checked at every state that exposes ν or E₀ as a live control.

---

## 7. Narration word-budget plan per state — flags

Per-state budgets are the skeleton's locked §3 numbers (25–55 EN words on `text_en`); physics_author adds no narration prose, only the content clauses above for json_author to phrase within budget. One state carries a genuine compression risk:

- **S6 (PRIMARY aha, 40–55w) — COMPRESS, do not split.** The required content load is unusually dense for one state: gate mechanics, `v=D/Δt`, `c=1/√(μ₀ε₀)`, the FL2 historical-identity framing, the MATCH, λ/ν birth, AND the sunlight anchor. Since S6 is architecturally the single PRIMARY-aha state (DESIGN_OK-locked at 11 states; splitting would require an architect re-emission that is out of scope here), the fix is compression, not restructuring: **narrate only the four insight clauses** (equality found · historical-identity framing · MATCH · sunlight anchor) and let the VISUALS carry every mechanical step (gate ticks, the v=D/Δt and c=1/√(μ₀ε₀) dock animations, λ/ν readout birth) silently, per Rule 24 (sound-off legibility). A rough compressed draft (for word-count sanity, not final phrasing): *"The gates just timed it — three times ten to the eight metres per second. Multiply last chapter's two constants, μ-naught and epsilon-naught, the same way — same number. That's not luck: it's the speed of light. This is how sunlight crosses empty space to reach you — light itself is an electromagnetic wave."* ≈ 47 words — fits the 40–55w band. Flag to json_author: if the final phrasing still overflows, drop the sunlight anchor's mechanism clause ("crosses empty space") rather than any of the four insight clauses — the anchor's PAYOFF sentence is load-bearing (Rule 35 anchor placement), its setup clause is not.
- **S9 (extended, 40–55w) — fits comfortably.** The "three recalls" structure is inherently terse (parallel ≤10-word clauses per recall, matching `displacement_current`'s S9 ledger narration pattern, which worked at this same budget).
- **S8 (extended, misconception pivot, 40–55w) — fits comfortably.** Four pieces (ghost quote, tank tracking, equality claim, drag-rescale) is the same density `displacement_current`'s S8/S9 pair carried successfully at this budget.
- All other states carry 1–3 content pieces within their budgets — no compression risk identified.

---

## 8. Drill-down cluster phrasings (5 real-student-voice phrases per cluster; 9 clusters total)

### S2 clusters

**`how_do_fields_sustain_each_other`**
- "how do the fields keep each other going"
- "whats actually holding the wave up with nothing there"
- "how can E and B just keep making each other forever"
- "why doesnt the wave run out of energy on its own"
- "what keeps the fields regenerating without a source"

**`does_the_wave_need_its_source`**
- "does the wave die if you turn off the transmitter"
- "why does the wave keep going after the source stops"
- "so the source isnt actually pushing the wave the whole time"
- "once its launched does it need anything to keep moving"
- "why doesnt the wave stop the moment the antenna stops"

**`chicken_and_egg_e_or_b_first`**
- "which one comes first E or B"
- "isnt this a chicken and egg problem"
- "how can both fields cause each other at the same time"
- "does E create B or does B create E"
- "why isnt one of them the original cause"

### S6 clusters

**`is_c_matching_light_a_coincidence`**
- "is it just a coincidence that this equals the speed of light"
- "why does this number match light exactly"
- "did they design mu naught and epsilon naught to give light speed"
- "is this really how light was discovered or just a nice match"
- "how do two constants from circuits give the speed of light"

**`why_multiply_mu0_and_eps0`**
- "why do you multiply mu naught and epsilon naught to get speed"
- "what do these two constants have to do with each other"
- "why does 1 over root of mu epsilon give a speed at all"
- "where does this formula for c even come from"
- "why not just add mu naught and epsilon naught instead"

**`does_c_depend_on_frequency_or_amplitude`**
- "does the speed change if you change the frequency"
- "does a stronger wave travel faster"
- "why doesnt higher frequency mean faster light"
- "is c different for different colors"
- "does amplitude affect how fast the wave moves"

### S9 clusters

**`how_to_write_b_given_e`**
- "how do I find B if I only know E"
- "whats the formula to get B from E"
- "if E is given how do you figure out B"
- "how do you write out the B equation from the E equation"
- "given E how do I know what B looks like"

**`direction_of_b_from_propagation`**
- "how do you know which direction B points"
- "why is B along z and not some other axis"
- "how do you figure out Bs direction from the direction of travel"
- "whats the rule for finding Bs axis"
- "why does the direction of travel decide where B points"

**`same_phase_argument_meaning`**
- "why do E and B use the same kx minus omega t"
- "what does using the same phase argument actually mean"
- "why cant B have a different phase term than E"
- "does the same argument mean they peak together"
- "why is the bracket identical for both fields"

---

## 9. Self-review checklist

- [x] Every symbol in the skeleton's state narratives (E, B, ν, λ, T, k, ω, c, μ₀, ε₀, E₀, B₀, u_E, u_B, D, Δt, n, v) appears in `physics_engine_config.variables` or `computed_outputs`.
- [x] No `radians()` needed (phase argument is already in radians) — the equivalent MHz→Hz silent-failure trap is called out explicitly (§6a), plus the SI-Tesla-vs-display-μT trap (§6b).
- [x] Every state's live control(s) match skeleton §3 exactly: S1 none · S2 none · S3 none · S4 none · S5 none · S6 ν · S7 field strength · S8 field strength · S9 none · S10 n · S11 ν·field strength·source (ALL).
- [x] `variable_overrides` documented for every state, each justified (§2).
- [x] Board mark scheme correctly SKIPPED (Rule 20 [D]).
- [x] Drill-down phrasings: 9 clusters × 5 phrases = 45, real-student-voice, no teacher-prose.
- [x] `constraints` block: 6 short factual assertions (§1d).
- [x] Numerical sanity check run independently in Python — all 8 locked §2 numbers reproduce exactly (c, T, λ, B₀, measured-v match, u_E=u_B=6.38×10⁻⁸, k/ω/ω÷k, v_medium/λ_medium) — see §1d verification note; matches checkpoint_a_report's own re-derivation line-for-line.
- [x] Within-state motion timeline written for all 11 states; every branch a pure fn of the state clock (Rule 26, local ms offsets, no `pause_after_ms`); no two states share identical motion (S1/S6 are the ONE declared contrast pair, correctly repeated); no static state.
- [x] Rule 32 sequencing verified per state: cause-before-effect beats specified with concrete ~0.5–1s gaps (wiggle→pulse S1, switch→pulse-continues S2, mote-vanish→no-change S3, sweep→thrust S4, cursor-arrival→twin-readouts S5, gate-tick→dock S6, slab-slide→bunching S10); S7 lockstep explicitly noted as the declared 32a exception (co-moving cause+effect, the lockstep IS the physics).
- [x] Word budget: flagged S6 as a genuine compression risk with a concrete compressed draft (§7); all other states fit comfortably.
- [x] Notation ladder (38c): S1–S6+S11 (core) and S7/S8 (extended) stay algebra-only (no calculus, no vector cross-product notation beyond the RHR glyph's qualitative "sweep" — S4's `Ê×B̂=x̂` is a direction statement, not a computed cross-product formula); k/ω and the calculus-adjacent phase formalism are confined to S9 (advanced ring only). Dialect (38d): "vacuum (free space)" dual-labelled once at S3 per skeleton §10, bare thereafter; no dialect conflicts introduced by this block.
- [x] Engine bug queue consulted LIVE (this dispatch had DB access): 0 rows for `em_wave_propagation` itself; 29 OPEN field_3d rows reviewed, none apply directly to a brand-new concept but 3 are flagged forward to quality_auditor/json_author (`field3d_formula_overlay_generic_not_cambria_math`, `field3d_sliders_panel_top12_vs_fsbtn_top10`, `default_variables_only_first_var_merged` prevention satisfied by explicit declaration of all 4 non-trivial-default variables).
- [x] DC Pandey check: every formula derived here from first principles (Maxwell's equations' consequence — mutual induction of E/B, the wave equation's phase-speed identity c=1/√(μ₀ε₀), energy density from the standard field-energy formulas) — nothing imported from DC Pandey/HC Verma. NCERT §8.3 consulted for scope only (per skeleton §0a), never for teaching sequence or example problems.

---

## 10. Deviations from skeleton — NONE

No redesign of arc, state count, archetypes, or locked numbers. All decisions in this block (the phase-continuity formula for slab boundary behavior, the S1/S6 pulse-transit and S2 relay-hand-off timing locks, the S7/S8 auto-sweep range, the S5/S8 fixed-cursor mechanics, the tank-refill-at-2ν observation, the FL4 independent-chain verification) are GRANULAR TIMING/CONSISTENCY specifications explicitly assigned to physics_author by the skeleton's own Escalation #3 ("physics_author: lock the pulse/gate timing... the S2 relay hand-off period, the S7 auto-sweep range") and by the Checkpoint-A carry-forwards (FL1–FL5) — none contradicts or overrides an architect decision.

## 11. Flags for quality_auditor

1. **S6 word-budget compression (§7)** is a physics_author judgment call resolving genuine content density inside a DESIGN_OK-locked 11-state arc. Please verify the BUILT `teacher_script` for S6 actually leans on visuals for the mechanical dock steps and reserves narration for the four insight clauses — if json_author instead narrates the D/Δt arithmetic in prose, the state will overflow 55 words or drop the FL2 historical-identity framing / sunlight anchor.
2. **Phase-continuity formula (§1b `phase_inside_slab`/`phase_after_slab`, §6e)** is the one formula in this block requiring exact (not approximate) implementation — a naive `k(x)*x` instead of the cumulative piecewise form would introduce a visible phase discontinuity at the slab boundary, silently breaking the FL5 "ν continuous for both trains" claim even though ω itself is correctly held constant. Verify at Checkpoint B via THE EYE that no visible kink/jump appears at x=3.0m or x=7.0m.
3. **n=2.0 crest-spacing legibility (§6d)** — flagged as a dense-frames check, not a blocking defect; verify via THE EYE dense frames per the field3d checklist directive, not the frozen end-frame alone.
4. **`emw_receiver` post-slab positioning (§3.10, F2/FL5)** — verify the receiver gauges on S10, if visible, read the POST-slab (x>7.0m) vacuum values, never an in-slab reading, so the declared-safe "no ratio surfaced" claim holds mechanically, not just by omission.
5. Run the live `engine_bug_queue` SQL again at Gate 8 post-build (this dispatch's read is a pre-build snapshot; the field3d-surgeon's build may register new rows against `em_wave_propagation` specifically).

---

**Files referenced:** `docs/loop_runs/ch8/em_wave_propagation/skeleton.md`, `docs/loop_runs/ch8/em_wave_propagation/checkpoint_a_report.md`, `docs/loop_runs/ch8/displacement_current/physics_block.md` (structure/notation precedent), `docs/FIELD3D_SCENARIO_CHECKLIST.md`, `src/scripts/query_engine_bug_queue.ts` (live-queried this dispatch).
