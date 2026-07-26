# Physics Block — `ac_voltage_resistor`

**Engine bug queue consulted** (live SQL, not the mirror — `query_engine_bug_queue.ts`):
`--field3d --open` (28 rows), `ac_generator` (4 FIXED — `bulb_glow_not_modulating`, `label_sprite_wide_string_clipped`, `graph_marker_label_clipped`, `label_occluded_and_offcanvas_circuit`), `--owner alex:physics_author` (6 rows, mostly generic dual-panel/mechanics_2d directives — N/A to field_3d), `--owner peter_parker:runtime_generation` (confirms `default_variables_only_first_var_merged`, FIXED — canonical "declare every non-trivial-default variable explicitly" precedent). Every OPEN field_3d row cross-checked against §0b: `ghost_compare_cause_invisible_slider_frozen` (→ §0b req 7, honored below), `field3d_formula_overlay_generic_not_cambria_math` (→ §0b req 4), `field3d_sliders_panel_top12_vs_fsbtn_top10` (→ §0b req "top:52px+"). All already correctly routed to the engine ask; nothing new to add. **DC Pandey check: none consulted — every formula below derived directly from v=vₘsin ωt, Ohm's law, and elementary calculus/trig identities.**

**Cosmetic tidy accepted per founder-proxy P3 note:** S7 archetype renamed `fold-and-settle` → **`square-and-settle`** below (label only; the binding build instruction was already correct).

---

## 1. `physics_engine_config`

```json
{
  "variables": {
    "vm":     { "name": "Peak (amplitude) voltage across the resistor", "unit": "V",   "min": 2,   "max": 20,  "default": 10.0, "step": 1,   "role": "driver" },
    "R":      { "name": "Resistance of the heater element",             "unit": "Ω",   "min": 2,   "max": 20,  "default": 5.0,  "step": 1,   "role": "driver" },
    "f_demo": { "name": "Demo-compressed AC frequency (real mains is tens of Hz)", "unit": "Hz", "min": 0.1, "max": 0.5, "default": 0.25, "step": 0.05, "role": "driver" },
    "V_dc":   { "name": "DC twin supply voltage — S6 only", "unit": "V", "min": 0, "max": 20, "default": 10.0, "step": 0.1, "role": "driver" },

    "omega":  { "name": "Angular frequency", "unit": "rad/s", "derived": "omega = 2*PI*f_demo" },
    "theta":  { "name": "Instantaneous phase — NATIVE radians, no wrap needed (no degree slider exists in this concept)", "unit": "rad", "derived": "theta = omega * t   [t = state-local clock in seconds, Rule 26]" },

    "v":      { "name": "Instantaneous voltage", "unit": "V", "derived": "v = vm * sin(theta)" },
    "im":     { "name": "Peak (amplitude) current", "unit": "A", "derived": "im = vm / R" },
    "i":      { "name": "Instantaneous current", "unit": "A", "derived": "i = v / R = im * sin(theta)" },
    "p":      { "name": "Instantaneous power dissipated in R", "unit": "W", "derived": "p = v * i = vm*im*sin(theta)^2  [>= 0 always]" },
    "p_peak": { "name": "Peak instantaneous power", "unit": "W", "derived": "p_peak = vm * im" },
    "p_avg":  { "name": "Cycle-average power", "unit": "W", "derived": "p_avg = p_peak / 2 = vm*im/2" },
    "i_avg_cycle": { "name": "Cycle-average current — EXACT zero over any whole number of periods", "unit": "A", "derived": "i_avg_cycle = 0" },

    "Vrms":   { "name": "RMS voltage — the DC-equivalent rating", "unit": "V", "derived": "Vrms = vm / sqrt(2)" },
    "Irms":   { "name": "RMS current", "unit": "A", "derived": "Irms = im / sqrt(2)" },

    "E":      { "name": "Energy dissipated since THIS state began (Rule 26 state-local clock, resets each state entry)", "unit": "J",
                 "derived": "E(t) = p_avg*t - (p_peak/(4*omega))*sin(2*omega*t)   [monotone non-decreasing by construction, dE/dt = p(t) >= 0]" },

    "i2_running":   { "name": "Cumulative time-average of i² since state start — the S7 settling meter", "unit": "A^2",
                        "derived": "i2_running(t) = im^2 * (0.5 - sin(2*omega*t)/(4*omega*t))   [limit as t->0 is 0; settles to im^2/2 as t grows]" },
    "Irms_running": { "name": "Running rms current — √ pulled from i2_running (S7)", "unit": "A", "derived": "Irms_running(t) = sqrt(i2_running(t))" },

    "R_dc":   { "name": "Twin (DC) heater resistance — LOCKED equal to R, never an independent slider (required so the match lands exactly at Vrms regardless of R)", "unit": "Ω", "derived": "R_dc = R" },
    "I_dc":   { "name": "DC twin current", "unit": "A", "derived": "I_dc = V_dc / R_dc" },
    "P_dc":   { "name": "DC twin instantaneous (= constant) power", "unit": "W", "derived": "P_dc = V_dc^2 / R_dc" },
    "E_dc":   { "name": "DC twin energy since state start", "unit": "J", "derived": "E_dc(t) = P_dc * t   [exactly linear — no ripple, unlike E(t)]" }
  },

  "computed_outputs": {
    "v_display":       { "formula": "vm*Math.sin(omega*t)" },
    "i_display":        { "formula": "v_display / R" },
    "p_display":        { "formula": "v_display * i_display" },
    "E_display":        { "formula": "(vm*im/2)*t - (vm*im/(4*omega))*Math.sin(2*omega*t)" },
    "p_avg_display":    { "formula": "vm*im/2" },
    "Vrms_display":     { "formula": "vm/Math.sqrt(2)" },
    "Irms_display":     { "formula": "im/Math.sqrt(2)" },
    "i2_running_display": { "formula": "t < 1e-3 ? 0 : im*im*(0.5 - Math.sin(2*omega*t)/(4*omega*t))" },
    "Irms_running_display": { "formula": "Math.sqrt(i2_running_display)" },
    "P_dc_display":     { "formula": "V_dc*V_dc/R" },
    "E_dc_display":     { "formula": "(V_dc*V_dc/R)*t" }
  },

  "formulas": {
    "instantaneous_voltage": "v = vₘ sin(ωt) — the applied AC voltage, ω = 2πf_demo",
    "ohms_law_instant":       "i = v/R — Ohm's law holds at EVERY instant, not just for DC",
    "instantaneous_current":  "i = iₘ sin(ωt), iₘ = vₘ/R — current is in phase with voltage (zero phase difference)",
    "instantaneous_power":    "p = v·i = vₘiₘ sin²(ωt) ≥ 0 — never negative, because v and i always share sign",
    "peak_power":             "p_peak = vₘiₘ",
    "average_power":          "⟨p⟩ = vₘiₘ/2 — from ⟨sin²ωt⟩ = ½",
    "cycle_average_current":  "⟨i⟩ = 0 exactly, over any whole number of periods — ∫₀ᵀ sin(ωt)dt = 0",
    "rms_voltage":            "Vᵣₘₛ = vₘ/√2 ≈ 0.707vₘ — the DC-equivalent voltage",
    "rms_current":            "Iᵣₘₛ = iₘ/√2",
    "rms_power_check":        "⟨p⟩ = Vᵣₘₛ·Iᵣₘₛ = Iᵣₘₛ²R = ½vₘiₘ — three equivalent routes to the same 10.0 W",
    "square_mean_root":       "⟨i²⟩ = iₘ²/2 (square, then mean) → Iᵣₘₛ = √⟨i²⟩ = iₘ/√2 (then root) — the recipe order matters (S7)",
    "half_identity":          "sin²(ωt) = (1 − cos 2ωt)/2 — the cos 2ωt term is the SAME double-frequency (2f) pulse seen in p(t) since S3/S4 (S8)",
    "point_symmetry_proof":   "sin²(π/4+x) + sin²(π/4−x) = 1 for any x — equivalently p(t_c+τ) + p(t_c−τ) = p_peak at any ½-crossing instant t_c — the EXACT geometric fact that lets the S8 fold land flush at ½, not approximately",
    "dc_twin_match":          "P_dc = V_dc²/R_dc; setting R_dc = R and P_dc = ⟨p⟩ gives V_dc² = vₘ²/2 → V_dc = vₘ/√2 = Vᵣₘₛ exactly — the match is forced to land at the rms value ONLY because R_dc = R"
  },

  "constraints": [
    "i(t) = v(t)/R holds at every instant — Ohm's law is not a DC-only law.",
    "v(t) and i(t) are exactly in phase for a pure resistor — zero phase difference, always (no v→i time lag may ever be drawn — Rule 32a binding caution).",
    "p(t) = v(t)·i(t) = vₘiₘ sin²(ωt) ≥ 0 at every instant — a resistor never returns energy to the source.",
    "The cycle-average of i(t) (and v(t)) is exactly zero over any whole number of periods, yet ⟨p(t)⟩ = ½vₘiₘ > 0 — average current cannot rate AC.",
    "Vᵣₘₛ = vₘ/√2 and Iᵣₘₛ = iₘ/√2 are the DC-equivalent values: ⟨p⟩ = Vᵣₘₛ·Iᵣₘₛ = Iᵣₘₛ²R = ½vₘiₘ.",
    "⟨sin²ωt⟩ = ½ EXACTLY (not approximately) over any whole number of half-periods — from sin²θ = (1−cos2θ)/2 and the point-symmetry sin²(π/4+x)+sin²(π/4−x)=1."
  ]
}
```

**Edge-case sweep (Escalation check, per role spec):** `R` slider floor = 2 Ω (never 0 → `i=v/R` never blows up); `f_demo` floor = 0.1 Hz → `omega` floor = 0.628 rad/s (never 0 → the `1/omega` terms in `E(t)`, `i2_running(t)`, and the bead-amplitude formula below never divide by zero). No θ=90°-style singularity exists anywhere in this concept — flagging clean, no misconception_watch/variable_overrides addition needed for this reason.

---

## 2. Per-state variable notes (`variable_overrides`)

Field_3d precedent for this lock (verified live in `circular_motion_charge_in_uniform_B.json` and structurally in `ac_generator.json`'s per-state `B/A/N/omega` inlining): each state's `field_3d_config.states.STATE_N.ac_resistor` block should carry an explicit `variable_overrides` object, sibling to `show_sliders`/`visible_controls`, locking every variable this state does NOT expose as a live control. This is the direct field_3d analogue of Bug #1 (`default_variables_only_first_var_merged`) — every non-live variable must be pinned explicitly, never left to fall through to whatever S9's schema default happens to be.

| State | `variable_overrides` | Why |
|---|---|---|
| S1 | `{ vm: 10.0, R: 5.0 }` | `f_demo` is the ONLY live control this state teaches; lock the other two so a stray S9 leak can't quietly change iₘ mid-demo. |
| S2 | `{ vm: 10.0, f_demo: 0.25 }` | `R` is live; lock `vm`/`f_demo` so only R's effect on iₘ is visible (32b: one variable moves). |
| S3 | `{ vm: 10.0, R: 5.0, f_demo: 0.25 }` | No live controls — full lock, pure demonstration state. |
| S4 | `{ vm: 10.0, R: 5.0, f_demo: 0.25 }` | Same — the product-walk needs fixed, predictable v/i values (the "3.0 W both-negative" beat below depends on these exact defaults). |
| S5 | `{ vm: 10.0, R: 5.0, f_demo: 0.25 }` | Full lock — the "dead needle" beat needs several repeatable, identical cycles. |
| S6 | `{ vm: 10.0, R: 5.0, f_demo: 0.25, V_dc: 10.0 }` | **Critical override.** `V_dc` is S6's live control, but it must **start** at 10.0 V (the "obvious wrong guess") every time this state is entered — this is the exact `hinge_force` STATE_4 `F_ext: 0` pattern: even though `V_dc`'s schema default already equals 10.0, the override is defensive (a stray S9 sandbox value from a prior session, or a future schema-default edit, must never silently start S6 below the wrong-guess voltage and break the 16a contrast beat). `R_dc = R = 5.0` is NOT itself a slider — it derives from `R`'s override automatically. |
| S7 | `{ vm: 10.0, R: 5.0, f_demo: 0.25 }` | Full lock — `iₘ² = 4.00 A²` must be exact for the settling meter to land on 2.0/1.41. |
| S8 | `{ vm: 10.0, R: 5.0, f_demo: 0.25 }` | Full lock — apparatus is `reveal_hold` (dimmed, static; see §3); no live physics changes this state. |
| S9 | *(none — inherits `default_variables`: vm=10.0, R=5.0, f_demo=0.25)* | Explore; `vm`, `f_demo`, `R` all live (Rule 31c). `V_dc`/twin_dc is **not** part of S9 (per skeleton — twin never appears in explore) — no override needed since it's simply unused. |

---

## 3. Within-state motion timeline + per-state control spec (all 9 states)

**Shared machinery used across states (define once, reference per state):**

- **AC bead oscillation (micro band, Rule 33b), all AC-side states:**
  `bead_frac(t) = 0.5 − A_frac·cos(ωt)` — dimensionless position along the visible wire segment (0/1 = ends, 0.5 = home/center). `A_frac = clamp(0.30 · (iₘ/ω)/(2.00/1.5708), 0.08, 0.42)` — i.e. amplitude scales directly with `iₘ/ω`, calibrated to `A_frac = 0.30` exactly at defaults. **This IS the Rule 33c "real number"**: at S2 with R doubled (iₘ halves), `A_frac` exactly halves (0.15) — the excursion visibly shrinks in lockstep with the halved current. At S1 with f raised to 0.5 Hz (ω doubles, iₘ fixed), `A_frac` also halves — the direct visual link to "real mains reverses too fast for any visible swing" (S1 narration clause). Velocity `d(bead_frac)/dt ∝ sin(ωt) = i(t)/iₘ`, so direction flips exactly when `i(t)` crosses zero, and the beads are momentarily **at rest at their extreme excursion** at `t=0` (since `i(0)=0`) — a nice double-meaning: the "zero current instant" IS the oscillation's own turning point.
- **Wire current arrow:** `arrow_direction(t) = sign(sin ωt)`, flips at `t = 0, T/2, T, …` (every zero crossing).
- **Heater emissive (macro, Rule 33d), AC side:** `heater_ac_emissive(t) = clamp(p(t)/P_REF, 0, 1)`, **`P_REF = 20.0 W`** (the concept's own default `p_peak` — a **fixed** reference, NOT self-normalized per-frame, so that in S9 a bigger vₘ/smaller R visibly glows brighter, not just "brighter relative to its own peak"). **Driven every frame, EXEMPTED from `applyGlowEmphasis` per §0b req 1** — when `heater` is the S3 glow_focal, emphasis is expressed by dimming peers only, the heater's own emissive channel is untouched.
- **Energy counter:** `E(t) = (vₘiₘ/2)·t − (vₘiₘ/(4ω))·sin(2ωt)`, state-local clock (resets to 0 at every state entry, Rule 26). Monotone non-decreasing by construction (`dE/dt = p(t) ≥ 0`).

---

### S1 `ac_swings_both_ways` — core — `oscillate/track`

| t-window | What animates | Driven by | Live controls |
|---|---|---|---|
| continuous, from t=0 | v-trace draws live: `v(t) = vₘsin(ωt)`; dashed `vₘ` peak line marked at the first peak (t=T/4) | `t`, `ω=2πf_demo` | **f** (0.1–0.5 Hz; drag-seize) |
| continuous | wire beads oscillate per `bead_frac(t)` above; wire arrow flips per `arrow_direction(t)` | `t`, `ω` | — |
| continuous | heater glows per `heater_ac_emissive(t)` (2×-frequency pulse, dips near-zero at `t=0, T/2, T`) — visible but NOT yet named (concrete-before-abstract) | `t`, `ω` | — |

`iₘ` isn't shown/named yet — beads/arrow/heater are driven by the true underlying current even before its formula appears (engine-bug-queue directive `teach_concrete_before_abstract_compare`). **Drag-seize:** dragging `f` immediately re-derives `ω` and restarts nothing — `t` keeps running, only `ω` changes, so the trace/beads/arrow/heater instantly re-pace (no snap/reset). At `f=0.5` Hz: `T=2.0 s`; at `f=0.1` Hz: `T=10.0 s`.

---

### S2 `ohm_at_every_instant` — core — `reveal-build`

Three cursor samples (cue-bound: `cursor_sample_1/2/3`, sentence 2–3), then full i-trace sweep (`i_sweep_start`, sentence 4):

| Sample | `t` | `θ=ωt` | `v` | `i=v/R` |
|---|---|---|---|---|
| zero | 0 s | 0 | 0.0 V | 0.0 A |
| mid | T/12 ≈ 0.333 s | π/6 (30°) | 5.0 V | 1.0 A |
| peak | T/4 = 1.0 s | π/2 (90°) | 10.0 V | 2.00 A |

Each sample: cursor stops, reads `v` (glow), a readable beat (~0.4–0.6 s, per 32a), then plants the `i`-dot at `v/R`. After the third sample, the full i-trace sweeps in continuously, locked to v (peak-with-peak, zero-with-zero ticks land). **Live control R** (2–20 Ω, drag-seize): drag mid-sweep and the i-trace amplitude re-scales live (`iₘ = vₘ/R`) while `v` is untouched — e.g. `R=10` → `iₘ=1.00 A`; bead amplitude halves in lockstep (Rule 33c real number). **⚠ Binding Rule-32a constraint: `i(t)` must be computed as `v(t)/R` at the SAME `t` as `v(t)` — zero frame-lag, zero phase offset introduced anywhere in the sampling/sweep code path.** No time-delay of any kind between the v-trace and i-trace is permitted (a delay would visually draw an inductor and directly contradicts this concept's claim).

---

### S3 `both_halves_heat` — core — `cycle-compare`

Loop A→B→A′ on the state's own period `T=4.0 s`, repeating continuously:

- **A** (`0 ≤ t < 2.0 s`, `i>0`): arrow →, beads advance forward through their positive-half swing, heater glows per `heater_ac_emissive(t)`.
- **B** (`2.0 ≤ t < 4.0 s`, `i<0`): arrow ←, beads swing backward, heater glows via the **same function** `heater_ac_emissive(t)` (since `p(t)=vₘiₘsin²ωt` is identical in magnitude on both halves — squaring erases the sign, so the SAME glow curve plays twice per period, just with the arrow reversed).
- **A′**: at `t=0, 2.0, 4.0 s` (every zero crossing) the glow visibly dips to near-zero — the 2×-frequency pulse.
- `E(t)` climbs through BOTH halves per the shared formula, never dipping — the direct visual proof of the misconception confrontation (16a pivot #1: "reversal ≠ undo").

No live controls (all locked, §2). glow_focal = `heater`.

---

### S4 `power_never_negative` — core — `trace-product` (coin)

p-strip docks below the v/i strip with its OWN highlighted zero baseline (never crosses, only touches). Cursor walks one full period `0 → T=4.0 s`:

| `t` | `v` | `i` | `p=v·i` | note |
|---|---|---|---|---|
| 0 | 0 | 0 | 0.0 W | touches zero |
| T/4 = 1.0 s | +10.0 V | +2.00 A | **20.0 W** | first peak, (+)×(+) |
| T/2 = 2.0 s | 0 | 0 | 0.0 W | touches zero |
| 3T/4 = 3.0 s | **−10.0 V** | **−2.00 A** | **20.0 W** | (−)×(−) beat — the two minus signs flash, product still peaks at 20.0 W (same as the +,+ instant) |
| T = 4.0 s | 0 | 0 | 0.0 W | touches zero, loop repeats |

`p(t) = vₘiₘsin²(ωt)` — this curve has period `T/2 = 2.0 s`, i.e. **twice** the frequency of v/i, matching the "twice each cycle" claim exactly. The painted p-curve pulses `0→20.0→0→20.0→…` continuously; the single highlighted "(−)×(−)" demonstration lands at `t=3.0 s` (walk window opens on that sentence per the cue plan). `E(t)` continues climbing per the shared formula. No live controls. glow_focal = `p_strip`.

---

### S5 `the_zero_average_paradox` — extended — `null-result-hold`

Averaging meter docks on the wire (`meter_dock`, sentence 1). **Update rule:** the needle re-computes the FULL-CYCLE average at every completed period boundary — `⟨i⟩_n = (1/T)∫_{(n-1)T}^{nT} i(t')dt' = 0` **exactly**, for every integer `n`, since `∫` of a full sine period is identically zero. The needle is displayed as constant `0.00 A` for the entire state (not a decaying transient toward zero — an EXACT, held-dead reading, because every completed cycle re-confirms it). State duration (30–45 words ≈ 15–20 s) spans 4–5 full periods (`T=4.0 s`), so the reveal (`avg_zero_reveal`, on the naming sentence) is followed by 3–4 more silent re-confirmations. Meanwhile beads keep rocking, heater keeps pulsing, `E(t)` keeps climbing (all per the shared formulas — the null result is on the METER only, not on the apparatus, which is exactly the paradox). No live controls. glow_focal = `meter`.

---

### S6 `rms_the_dc_equivalent` — extended — PRIMARY AHA — `twin-compare` (coin)

Camera widens; twin heater+DC-supply docks beside the main apparatus (`twin_dock`, sentence 1). **Twin physics:** `R_dc = R = 5.0 Ω` (LOCKED — see §1/§2; this is the physics fact that forces the match to land exactly at `Vᵣₘₛ`). Twin beads **drift steadily** (not oscillate) — `twin_bead_frac(t) = (twin_bead_frac(t₀) + k_drift·I_dc·(t−t₀)) mod 1`, direction fixed by `sign(V_dc)` (always positive here), clone of the existing faraday/circuit-engine streaming-bead pattern (§0b engine ask item 1 precedent), contrasted directly against the AC beads' rocking (Rule 33 plan).

**Scripted V_dc sweep** (cue window `dial_down_start → dial_down_end`, spanning sentences 2–3; `τ` = fraction of that window, `0≤τ≤1`, eased):
```
V_dc_script(τ) = 10.0                                    for τ < 0   (pre-window hold — the "obvious guess")
V_dc_script(τ) = 10.0 − (10.0 − 7.0711)·smoothstep(τ)     for 0 ≤ τ ≤ 1   [smoothstep(τ)=3τ²−2τ³]
V_dc_script(τ) = 7.0711 ≈ 7.07 V                          for τ > 1   (holds at the match)
```
**Thumb-lockstep (§0b req 7 / F1, binding):** the DOM `V_dc` slider thumb position + numeric label MUST track `V_dc_script(τ)` in real time during the scripted window — never an invisible/frozen slider driving a moving physics value (the exact `ghost_compare_cause_invisible_slider_frozen` scar). **Drag-seize:** the instant the teacher grabs the dial (`ev.isTrusted`), a `dragged_V_dc=true` flag halts `V_dc_script` permanently for the rest of this state-entry, and `V_dc` becomes the literal live slider value every frame thereafter — there is only ONE `V_dc` value driving `P_dc`/`E_dc`/`heater_dc_emissive` at any instant, scripted XOR live, never both fighting.

**Pre-match (V_dc=10.0 V):** `P_dc = 100/5 = 20.0 W` (constant) → `heater_dc_emissive = 1.0` (full, constant) vs AC heater oscillating `0↔1.0`, time-averaging `0.5` — the DC twin visibly, constantly out-glows the AC heater (16a pivot #3, wrong guess shown first). **At match (V_dc=7.0711 V):** `P_dc = 50.0/5 = 10.0 W` (constant) → `heater_dc_emissive = 0.5` (constant) vs AC heater still oscillating `0↔1.0` but **time-averaging 0.5** — same average brightness, though the two heaters visibly differ moment-to-moment (DC steady, AC pulsing) — this is the honest picture, not a fake instant-for-instant match. The **energy counters' slopes** are what genuinely lock: `E_dc(t) = 10.0·t` (perfectly linear) vs `E(t) = 10.0·t − 3.183·sin(2ωt)` (same mean slope, bounded ±3.18 J ripple around it) — **flag for engine: do NOT force `E(t) ≡ E_dc(t)` pointwise; only their long-run slopes match (10.0 W each) — the ripple is real physics, not a bug.** `Vᵣₘₛ` level line lands on the v-trace at `0.707vₘ = 7.07 V` on the naming sentence (`match_reveal`). Live control: **V_dc** (0–20 V; match dial, drag-seize + thumb-lockstep). glow_focal = `twin_dc`.

---

### S7 `square_mean_root` — extended — `square-and-settle` *(renamed from `fold-and-settle` per founder-proxy P3 tidy)*

3D apparatus is `reveal_hold` (dimmed, static — this and S8 are graph-band states, Rule 32b). All motion lives on the scope pane, cue-bound (`square_morph_start` s1 → `mean_settle_start` s2 → `root_pull` s3 → `avg_power_dock` s4):

1. **Squaring (s1):** the i-trace maps **pointwise `y → y²`** — `i(t)=iₘsin(ωt)` becomes `i²(t) = iₘ²sin²(ωt)`, y-axis rescales `A → A²`. **Explicitly NOT a fold/reflection** (that would build `|i|`, peak `iₘ=2.00`, mean `2iₘ/π≈1.27`, √≈1.13 A — inconsistent with the target). Squaring is the ONLY operation that produces `iₘ²=4.00 A²` and settles to `2.00 A²`.
2. **Settling (s2):** the meter (re-tasked from S5's averaging meter — same instrument object, Rule 32d-style reuse) now displays `i2_running(t) = iₘ²(0.5 − sin(2ωt)/(4ωt))`, climbing/oscillating with a shrinking envelope, visibly settling toward **`iₘ²/2 = 2.00 A²`** as `t` grows within the state.
3. **Root pull (s3):** a new dashed line animates in at `Irms_running(t) = √(i2_running(t))`, on the restored (original) `i`-axis, converging to **`1.41 A`**.
4. **Formula dock (s4):** `⟨i²⟩ = iₘ²/2 → Iᵣₘₛ = iₘ/√2 → ⟨p⟩ = Iᵣₘₛ²R` docks, with the numeric chain `2.00 A² → 1.41 A → 10.0 W` (all reconciling: `1.41²×5 = 9.94→10.0` at 3-sig-fig rounding; the EXACT symbolic chain `(iₘ/√2)²R = iₘ²R/2 = 4×5/2 = 10.0 W` is exact — display the exact chain, not the rounded-then-recomputed one, so no visible rounding artefact appears).

No live controls. glow_focal = `rms_line`.

---

### S8 `why_half` — advanced — `chain-link-derivation` (fleet reuse)

3D apparatus stays `reveal_hold` (dimmed, static — nothing physical moves, per skeleton). All motion is the p-strip geometric fold + algebra dock (cue-bound `fold_start`/`fold_end` s1–2, `identity_dock` s3):

**The fold (a DIFFERENT, exact operation from S7 — do not conflate):** within one p-period (`0 ≤ t ≤ 2.0 s`, i.e. `θ=ωt ∈ [0,π]`), the ½-crossings sit at `θ=π/4` (`t=0.5 s`) and `θ=3π/4` (`t=1.5 s`), i.e. `p=10.0 W` there exactly. The **exact identity** `sin²(π/4+x) + sin²(π/4−x) = 1` (equivalently `p(t_c+τ) + p(t_c−τ) = p_peak = 20.0 W` at either crossing `t_c`) means: the hump segment (`0.5 s ≤ t ≤ 1.5 s`, containing the peak `p=20.0 W` at `t=1.0 s`) is the exact **180° point-reflection**, through the point `(t_c, 10.0 W)`, of the trough segment on the other side of that crossing. Visually: **rotate** (not translate, not mirror-only) each above-½ segment 180° about its own ½-crossing point and it lands EXACTLY flush into the adjacent below-½ trough — the curve levels into a perfect rectangle at `y=10.0 W`, geometrically exact (this is what makes S8's claim "not approximately, exactly ½" true, and it is legitimately a fold — unlike S7, where the operation is squaring, not folding; per the founder-proxy handoff, do NOT harmonize these two operations).

**Algebra dock (s3):** `sin²ωt = (1 − cos 2ωt)/2` docks; the `cos 2ωt` term is named as the SAME double-frequency term whose visual consequence (the 2×-per-cycle pulse) has been on screen since S3/S4 — its own cycle-average is zero (an oscillating term with zero mean), leaving exactly `½`.

No live controls. glow_focal = `formula`.

---

### S9 `ac_resistor_sandbox` — core (ring-neutral) — `drag-sandbox`

Free-runs continuously per Rule 37 (never freezes). All formulas from §1 apply live with `vm`, `f_demo`, `R` all draggable (trusted-drag seizes manual per state):

- v/i traces re-scale live (`vₘ`, `iₘ=vₘ/R`); beads re-pace (`A_frac`, per the shared formula, **clamped to `[0.08, 0.42]`** — verified at the extreme corner `vm=20, R=2, f_demo=0.1` → `iₘ=10 A`, `ω=0.628 rad/s`, `iₘ/ω=15.9` vs the default ratio `1.273` → raw `A_frac=0.30×12.5=3.75` → **clamps to 0.42**, beads never overshoot into the source/heater geometry); heater re-pulses (`heater_ac_emissive`, same fixed `P_REF=20.0 W`, so extreme slider corners can genuinely saturate to full brightness — expected, physically honest); HUD tracks `v`, `i`, `p` live.
- Formula surface: **`i = v/R` only** (core-ring, Rule 38b — no rms readout here, deliberately, per the DoD i-2 coherence rule).
- Twin DC apparatus is **absent** from this state (not part of S9 per skeleton).

Live controls: **ALL** — vₘ (2–20 V), f_demo (0.1–0.5 Hz), R (2–20 Ω). glow_focal = `formula`.

---

## 4. Board-mode mark scheme + derivation sequence — **SKIPPED**

Per the active conceptual-only directive (founder 2026-06-11, Rule 20 suspension) and skeleton DoD §10(e): **no `mode_overrides`, no board mark scheme, no derivation_sequence authored for this concept.** Nothing in this section to produce.

---

## 5. Drill-down cluster phrasings (9 clusters × 5 phrases)

### S2 — `why_v_i_in_phase`
- "why do v and i peak at the same time"
- "why is there no delay between voltage and current here"
- "shouldnt current lag behind voltage a little"
- "why do they hit zero together"
- "is it always in phase or just for a resistor"

### S2 — `ohms_law_ac_validity`
- "does ohms law even work for ac"
- "i thought v equals ir was only for dc"
- "why can i use v over r when voltage keeps changing"
- "does r change as the voltage swings"
- "is this the same ohms law from before"

### S2 — `peak_current_from_peak_voltage`
- "how do i get peak current from peak voltage"
- "is im just vm divided by r"
- "why is peak current not the same as rms current"
- "if vm doubles does im double too"
- "whats the difference between i and im"

### S6 — `rms_vs_average_confusion`
- "isnt rms just another name for average"
- "why isnt rms zero if average current is zero"
- "why do we need rms if average already exists"
- "is rms the same as mean value"
- "why not just say average power instead of rms"

### S6 — `mains_rating_meaning`
- "is 230 volts the peak or something else"
- "why is my socket rated less than the actual peak voltage"
- "whats the real peak voltage of my wall socket"
- "why does the nameplate not show the peak value"
- "so the number on the appliance isnt the max voltage"

### S6 — `why_not_peak_value`
- "why dont we just rate everything by the peak voltage"
- "wouldnt peak voltage be the honest number to use"
- "why does the peak overheat things if we dont rate by it"
- "if peak is higher why isnt that the danger number"
- "why does 0.707 show up instead of 1"

### S7 — `why_root_two`
- "where does root 2 come from"
- "why divide by root 2 and not just 2"
- "why square root at the end"
- "is root 2 always the number or does it change"
- "why not just take the average of i directly"

### S7 — `square_mean_root_order`
- "why square first instead of averaging first"
- "does the order square mean root actually matter"
- "what if i average before squaring"
- "why not root then mean"
- "why cant i skip the squaring step"

### S7 — `average_power_half_peak_power`
- "why is average power exactly half the peak power"
- "is half peak power always true for any resistor"
- "why not use peak power for heating calculations"
- "does half only work because of sin squared"
- "why does average power need irms and not im"

---

## 6. Constraint callouts

1. **`radians()` N/A.** No slider in this concept is degree-valued (f_demo is in Hz); `theta = omega*t` is native radians throughout, matching the established `ac_generator` field_3d convention — no `radians()` wrap needed anywhere.
2. **HUD display precision (carry the skeleton's DoD table exactly, don't "fix" the asymmetry):** `v` → 1 decimal, signed (`+7.1 V`); `i` → **2 decimals**, signed (`+1.41 A`); `p` → 1 decimal, unsigned (`10.0 W`, since `p≥0` always); `E` → integer Joules (`47 J`); `Vᵣₘₛ`/`Iᵣₘₛ` inherit their parent's convention (1dp / 2dp respectively).
3. **Bead visual scale is NOT physical.** `A_frac` (§3) is a rendering constant calibrated for legibility, clamped `[0.08, 0.42]` of the wire-segment fraction — the real drift excursion at true mains frequency is sub-millimetre (S1 narration clause only, never drawn to true scale).
4. **`P_REF = 20.0 W` is a fixed reference, not self-normalizing.** Both `heater_ac_emissive` and `heater_dc_emissive` (twin) MUST divide by the SAME fixed `P_REF` so their brightness is directly, honestly comparable at S6 — normalizing each heater to its own instantaneous peak would silently break the "out-glows" / "matches" visual claims.
5. **`R_dc = R` is a hard lock, never an independent slider** — the twin heater's resistance must derive from the main circuit's `R` (itself locked at 5.0 Ω throughout S6, §2) for the S6 match to land at exactly `Vᵣₘₛ = vₘ/√2`; giving the twin its own resistance would decouple the match voltage from the taught formula.
6. **Averaging meter (S5) updates on completed-cycle ticks, not a continuous decaying average.** Display `⟨i⟩ = 0.00 A` as a HELD constant for the whole state (not a transient converging toward zero) — every full period re-confirms the same exact zero, which is the "dead needle" legibility the skeleton specifies.
7. **`E(t)` vs `E_dc(t)` at the S6 match are slope-equal, not pointwise-equal** — `E(t)` carries a bounded `±3.18 J` ripple around its mean slope (10.0 W) while `E_dc(t)` is perfectly linear; engine must NOT force them into pointwise coincidence.
8. **Sprite-glyph fallback (inherited flag from skeleton DoD §10(b), restated for downstream):** verify `ᵣₘₛ` subscript renders in the 3D sprite font path (`createLabelSprite`); fallback is a styled small "rms" string, never ASCII `I_rms`.
9. **Dedicated Cambria-Math formula panel (§0b req 4) carries every formula string in §1's `formulas` block** — never route any of these through the shared generic `#formula_overlay` (OPEN scar `field3d_formula_overlay_generic_not_cambria_math`).
10. **S7/S8 3D apparatus is explicitly `reveal_hold`** (dimmed, static) — the Rule 26 "sustain ≥0.1%/frame motion" requirement is satisfied by the SCOPE PANE's animation (squaring/settling/root-pull in S7; fold/dock in S8), not by the 3D scene, which correctly holds pose per Rule 32b.

---

## Self-review checklist

- [x] Every symbol referenced in the skeleton's state narratives (v, i, p, E, Vᵣₘₛ, Iᵣₘₛ, ⟨i⟩, ⟨i²⟩, ⟨p⟩, θ, ω) appears in `variables`.
- [x] No `radians()` needed anywhere — confirmed no degree-valued slider exists in this concept (documented in §6.1).
- [x] Every state's live control(s) declared exactly per the architect's control table (f→S1, R→S2, V_dc→S6, ALL→S9), each with default/min/max/step in §1.
- [x] `variable_overrides` documented for all 9 states with a one-line justification each (§2); S6's `V_dc:10.0` flagged CRITICAL (hinge_force STATE_4 pattern).
- [x] Board-mode section explicitly SKIPPED (Rule 20 [D] — conceptual-only directive active).
- [x] Drill-down cluster phrasings: 9 clusters (3 states × 3 each) × 5 phrases = 45, all real-student-voice, plain English, no Hinglish, no textbook prose.
- [x] `constraints` block: 6 short physics assertions (§1) + 10 engineering constraint callouts (§6, kept separate from the physics invariants per role-spec discipline).
- [x] Numerical sanity check run: defaults vₘ=10.0V, R=5.0Ω → iₘ=2.00A, p_peak=20.0W, ⟨p⟩=10.0W, Vᵣₘₛ=7.0711V, Iᵣₘₛ=1.4142A; cross-check Vᵣₘₛ·Iᵣₘₛ=10.0W=Iᵣₘₛ²R=½iₘ²R — all three routes reconcile exactly (Python-verified: `10/2**0.5 * 2/2**0.5 = 10.0`, `(2/2**0.5)**2*5 = 10.0`).
- [x] Within-state motion timeline written for all 9 states (§3): every row a pure function of the state clock `t` (Rule 26); no two states share a motion (9 distinct archetypes carried forward from skeleton, `fold-and-settle`→`square-and-settle` renamed); no static state (S7/S8 apparatus `reveal_hold` but scope-pane motion satisfies Rule 26); controls column matches architect table exactly.
- [x] **Rule 32 sequencing verified per state:** S2 (cursor reads v, THEN plants i, readable beat); S6 (dial moves THEN glow/energy-slope answers); S8 (chop THEN flip THEN level) — cause-before-effect honored everywhere; **32a binding caution explicitly re-stated and enforced in formulas** (i(t) computed at the SAME t as v(t), zero lag, §1 constraint #2 and §3-S2 flag); only the taught variable's motion changes per state (32b, confirmed apparatus-hold in S7/S8).
- [x] **Word budget (Rule 31a):** not physics_author's to author (architect owns narration text) — confirmed the skeleton's stated per-state word budgets (30–55) are consistent with the motion complexity each state's formulas require (no state needs more visual beats than its budget allows).
- [x] **Notation ladder (Rule 38c):** S1–S7/S9 formula surfaces are algebra/trig only (`v=vₘsin ωt`, `i=v/R`, `p=vi`, `Vᵣₘₛ=vₘ/√2`, `⟨i²⟩=iₘ²/2→Iᵣₘₛ=iₘ/√2→⟨p⟩=Iᵣₘₛ²R`); the one identity-manipulation (`sin²ωt=(1−cos2ωt)/2`) is confined to S8, the advanced-ring state — confirmed no calculus/vector operator appears anywhere (this concept never needed one; no FLAG required). **Dialect (38d):** no board-divergent term needing dual-labeling in this concept's vocabulary (v/i/p/R/rms are universal notation) — N/A, confirmed clean.
- [x] Engine bug queue consulted live via `query_engine_bug_queue.ts` (not the mirror); every relevant OPEN/FIXED row cross-checked against skeleton §0b — all already correctly routed; no new rows needed.
- [x] DC Pandey check: no formula, explanation, or example problem imported from any external book — every formula in §1 derived directly from `v=vₘsin ωt` + Ohm's law + elementary calculus/trig identities, verified numerically.

---

**Files referenced (read-only, no edits made):**
- `C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7\ac_voltage_resistor\skeleton.md` (input contract)
- `C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7\ac_voltage_resistor\founder_proxy_report_checkpointA_cycle1.md` (binding handoff note)
- `C:\Tutor\physics-mind-ch7\docs\FIELD3D_SCENARIO_CHECKLIST.md` (scar pre-flight mirror)
- `C:\Tutor\physics-mind-ch7\src\data\concepts\ac_generator.json` (physics_engine_config + field_3d_config precedent, bulb-brightness/dual-trace-graph clone source)
- `C:\Tutor\physics-mind-ch7\src\data\concepts\capacitance.json` (depth_ring / role-tagged variable precedent)
- `C:\Tutor\physics-mind-ch7\src\data\concepts\circular_motion_charge_in_uniform_B.json` (`variable_overrides` placement precedent — sibling to `show_sliders`/`visible_controls` inside the per-state scenario block)
- `C:\Tutor\physics-mind-ch7\src\schemas\conceptJson.ts` (variable/state schema shapes)

This physics block is ready to append to `skeleton.md` and hand to the §3b engine dispatch (new `scenario_type: "ac_resistor"`) followed by `json_author`.
