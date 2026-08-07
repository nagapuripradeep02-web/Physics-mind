# PHYSICS BLOCK — `conservation_of_angular_momentum` (rotmech · Class 11 Ch.7 · 0b)

> Produced by `alex:physics_author` 2026-08-02, against **skeleton REV 4** (`skeleton.md`) after founder-proxy Checkpoint A returned **`DESIGN_OK`** (`founder_proxy_A_cycle2_final.md`). All five carry-forwards addressed to physics_author are taken (rounding · S5 transient coincidence · one apparatus noun · arrow-length semantics · m/ω₀ ranges). Completes Phase 0b; the 0c-1 `field3d-surgeon` dispatch is authorised on skeleton REV 4 + this block.

---

## §1 — Variables, formulas, constraints

### `physics_engine_config.variables`

```json
{
  "variables": {
    "r": {
      "name": "Radius of each sliding mass from the axle",
      "unit": "m",
      "min": 0.15, "max": 0.90, "default": 0.80, "step": 0.01
    },
    "m": {
      "name": "Mass of each sliding mass (two, symmetric about the axle)",
      "unit": "kg",
      "min": 0.5, "max": 5.0, "default": 2.0, "step": 0.1
    },
    "omega0": {
      "name": "Seed angular speed magnitude — sets L only at t=0 (S1) and at an explicit RESTART (S6 run-cut, S8 live m/omega0/direction change); NOT applied continuously mid-run",
      "unit": "rad/s",
      "min": 0.5, "max": 3.0, "default": 1.5, "step": 0.1
    },
    "omega": {
      "name": "Live angular speed — the DERIVED quantity omega = L/I, recomputed every step; never itself an independent variable or slider",
      "unit": "rad/s",
      "min": null, "max": null, "default": null,
      "derived": "omega = L / I"
    },
    "spin_sign": {
      "name": "Spin direction — a discrete RESTART control (grip-rule +1 vs -1), never eased through zero",
      "unit": "dimensionless (+1 or -1 only)",
      "min": -1, "max": 1, "default": 1, "step": 2
    },
    "tau_brake": {
      "name": "Brake torque magnitude while the pad is engaged against the turntable's rim",
      "unit": "N·m",
      "min": 0, "max": 2.0, "default": 0.92, "step": 0.05
    },
    "I_frame": {
      "name": "Fixed inertia of the turntable + rod, excluding the two sliding masses",
      "unit": "kg·m^2", "constant": 0.50
    },
    "R_drum": {
      "name": "Braked radius — where the pad contacts the turntable's rim",
      "unit": "m", "constant": 0.55
    },
    "rod_half_length": {
      "name": "Rod half-length — apparatus geometry only, not a formula input",
      "unit": "m", "constant": 1.0
    },
    "rod_height_above_pad": {
      "name": "Vertical clearance of the rod plane above the drum's pad plane — apparatus geometry only, guarantees no fouling between the pad and the masses at any r (including r=0.20 < R_drum)",
      "unit": "m", "constant": 0.25
    }
  }
}
```

**`g` is deliberately ABSENT — do not emit a dead constant.** Rotation here is about a VERTICAL axle in a HORIZONTAL plane, so gravity acts parallel to the rotation axis and contributes zero torque about it (τ = r × F, and F_gravity is parallel to the axis at every mass's position). No formula in this concept references g. json_author omits the key entirely rather than ship an unused slot.

### Category summary (live-drivable / restart-seed-only / fixed constant)

| Variable | Category | Where live | Where seed-only |
|---|---|---|---|
| `r` | **Live-drivable** (ramp in guided states, drag in S8) | S2–S4, S7 (authored ramps) · S8 (trusted-drag) | — |
| `m` | **Restart-seed-only** | — | S8 only (a change RESTARTS: L re-pins from I(r)·ω₀·spin_sign) |
| `omega0` | **Restart-seed-only** | — | S1 (initial seed) · S6 (run-cut restart) · S8 (live restart) |
| `omega` | **Derived, never a variable** | recomputed every step everywhere (ω = L/I) | n/a — has no default/min/max of its own |
| `spin_sign` | **Restart-seed-only** (discrete, never eased) | — | S6 (mid-state restart), S8 (toggle = restart) |
| `tau_brake` | **Live-drivable** | S5 (default 0.92, teacher may retry) · S8 (live) | — |
| `I_frame` · `R_drum` · `rod_half_length` · `rod_height_above_pad` | **Fixed apparatus constants** | never adjustable | — |
| `g` | **Not used** — see the justification above | n/a | n/a |

### `physics_engine_config.formulas`

```json
{
  "formulas": {
    "angular_momentum_definition": "L = I·omega — the defining relation. omega is ALWAYS the derived quantity (omega = L/I); it is never itself integrated.",
    "newtons_second_law_rotational": "tau_ext = dL/dt — the general law this concept teaches. The engine integrates L directly in step-count-invariant form: L(t+h) = L(t) + tau_ext*h  (rest clamp ON L: if tau_ext*h would carry L through zero, set L = 0 — the clamp acts on L, never on the derived omega); omega(t) = L(t)/I(t), recomputed every step; theta(t+h) = theta(t) + omega*h.",
    "conservation_condition": "tau_ext = 0 => dL/dt = 0 => L is EXACTLY constant, with zero accumulation error by construction (S1-S4, S6, S7, S8-without-brake).",
    "moment_of_inertia": "I(t) = I_frame + 2*m*r(t)^2 — two symmetric sliding masses; recomputed live every step as r(t) changes, NEVER an authored constant.",
    "kinetic_energy": "KE = L^2/(2*I) = 0.5*I*omega^2 — the two forms are numerically identical (checked to 5 dp at S5's held values: 0.85688 both routes). KE is NOT conserved when I changes, even though L is exactly constant.",
    "brake_torque_source": "tau_ext = -sign(omega) * tau_brake while the pad is engaged (frictional — opposes the EXISTING spin, never reverses it); tau_ext = 0 otherwise.",
    "pull_force_magnitude": "F_pull = m * omega^2 * r — the live magnitude of each -r-hat arrow (the centripetal hold needed to keep a mass on its instantaneous circular path at radius r and speed omega). SHRINKS as the masses move out (19.35 N at r=0.20 -> 3.60 N at r=0.80, a 5.4x drop — the agent eases its hold) and GROWS by the same factor on every inward slide; never reverses sign or points outward.",
    "dLdt_finite_difference": "dL/dt (S7 only) = (L_k - L_k_minus_1)/h, a per-step measurement of the engine's OWN integrated L. Because the single L-integrator constructs dL/dt = tau_ext BY DEFINITION, this readout is an ILLUSTRATION of the law being simulated, never sold as an independent confirmation.",
    "top_spin_rate": "n = |omega|/(2*PI) rev/s — at r=0.20, omega=6.9545: n = 1.1063 -> 1.11 rev/s."
  }
}
```

### Constraints

- L = I·ω at every instant; ω is always DERIVED from L and I, never independently stored or integrated.
- τ_ext = dL/dt (Newton's second law for rotation). When τ_ext = 0, L is EXACTLY constant.
- KE = L²/2I = ½Iω² is NOT conserved when I changes, even while L is exactly constant — the S4 payload.
- I(t) = I_frame + 2mr(t)² rises with r²; I_frame = 0.50 kg·m² is a fixed apparatus constant, never adjustable.
- The −r̂ pull force on each mass points directly AT the rotation axis — zero moment arm, hence zero torque about that axis; this is WHY the radial pull changes I and ω while leaving L untouched.
- Rest clamp acts on L only: if τ_ext·h would carry L through zero, L is set to exactly 0. ω is never independently clamped.
- τ_brake ∈ [0, 2.0] N·m is frictional — opposes the existing sign of ω, can only decelerate toward rest, never reverses spin at any reachable value.
- r ∈ [0.15, 0.90] m is a hard mechanical range; both taught poses (0.20, 0.80) sit strictly inside it.
- m and ω₀ are RESTART/seed parameters — they set L fresh at t = 0 or at an explicit restart event, never applied as a continuous per-frame force during an ordinary state.

### Ground-truth numeric table (re-derived; matches skeleton REV 4 exactly)

| Quantity | r = 0.80 (home) | r = 0.20 (pulled in) | S5 held (brake default) |
|---|---|---|---|
| I (kg·m²) | 3.06 | 0.66 | 3.06 (r fixed) |
| ω (rad/s) | 1.50 | 6.95 | 0.75 |
| L (kg·m²/s) | 4.59 | 4.59 | 2.29 |
| KE (J) | 3.44 | 15.96 | 0.86 |
| F_pull (N) | 3.60 | 19.35 | n/a (brake, no radial slide) |

KE₂/KE₁ = I₁/I₂ = 4.64. Top spin at r = 0.20: 1.11 rev/s. **Max-τ (2.0 N·m) stop time = 4.59/2.0 = 2.295 s → prints as 2.30 s** under the 2-dp convention (carry-forward 1 — the skeleton's "2.29 s" in that one cell was the rounding slip; do not propagate it). That is less than the 2.5 s engagement window, so at slider max the rest clamp fires early and holds L = 0, ω = 0, KE = 0 for the remainder of the window and the state — a legible boundary case, never a reversal.

---

## §2 — Per-state variable notes: the general re-pose rule + overrides

**General rule (governs every state, stated once):** on state entry the engine hard-sets `(r, ω, τ_brake)` to that state's authored ENTRY CONFIG in a single frame (P1-1); L is then whatever `I(r)·ω` computes to at that instant. This is the SAME mechanism for every state — there is no special-cased "restart" machinery at ordinary state boundaries. The re-pin CUE (blank ≥ 0.5 s + hold-glow, E8) is authored ONLY for the two INTRA-state events the skeleton names — S6's run-A→run-B cut and S8's live m/ω₀/direction change — never for an ordinary click-to-next-state advance, because a fresh state load needs no visual cushioning (the viewer is not mid-observation of a readout that just discontinuously jumped; they are looking at a new state).

S3 is the one place this reads as continuous rather than a re-pose, but the *mechanism* is identical — S3's authored entry (r = 0.20, ω = +6.95) simply equals S2's held end values, so nothing visibly changes across the cut.

Per the `hinge_force.json` / `field_forces.json` defensive pattern (lock the value even though the default nominally matches, guarding the recorded `default_variables_only_first_var_merged` failure mode), **every state declares `m: 2.0` explicitly** even though it never changes in a guided state:

| State | `variable_overrides` | Justification |
|---|---|---|
| S1 | `{ m: 2.0, r: 0.80, omega: +1.50, spin_sign: +1, tau_brake: 0 }` | True initial seed: L = I(0.80)·1.50 = 4.59. Defensive `m` lock per the historical leak. |
| S2 | `{ m: 2.0, r: 0.80, omega: +1.50, tau_brake: 0 }` | Entry = ramp.from (P1-1 contract); identical L = 4.59 to S1 — the SAME free-spin baseline, not a new value. |
| S3 | `{ m: 2.0, r: 0.20, omega: +6.95, tau_brake: 0 }` | **The one non-home entry.** Continuity from S2's held end (both r AND ω copied exactly) so the cut reads seamless; L = I(0.20)·6.95 = 4.59, unchanged. |
| S4 | `{ m: 2.0, r: 0.80, omega: +1.50, tau_brake: 0 }` | Re-pose back to home; L = 4.59 again — same invariant as S1/S2. |
| S5 | `{ m: 2.0, r: 0.80, omega: +1.50, tau_brake: 0 }` | Single-frame re-pose from S4's held r = 0.20 (P1-1, named explicitly at this seam) to the home pose; L = 4.59 at entry, THEN the brake beat is the only place in S1–S5 that changes it. |
| S6 | `{ m: 2.0, r: 0.80, omega0: 1.50, spin_sign: +1 (run A), tau_brake: 0 }` | Fresh seed (this state's own restart mechanism runs mid-state for run B — spin_sign flips to −1, re-pin cue fires). |
| S7 | `{ m: 2.0, r: 0.80, omega0: 1.50, spin_sign: +1, tau_brake: 0 }` | Re-seed to the canonical positive spin — S6 may have ended mid run-B (negative); S7 needs the positive baseline for its replay. |
| S8 | `{ m: 2.0, r: 0.80, omega0: 1.50, spin_sign: +1, tau_brake: 0 }` + idle sweep armed | Sandbox initial pose; every field live-drivable from here (r core, m core, ω₀ core, τ_brake core, spin_sign extended). |

---

## §3 — Within-state motion timeline + per-state control spec (Rule 31)

**Glow-target glossary** (used consistently below; final primitive IDs are the surgeon's to name — these are the physics-verified targets json_author binds against): `L_arrow` · `I_readout` · `omega_readout` · `L_readout` · `KE_readout` · `KE_bar` · `KE_tick` · `pull_arrows` · `r_line` · `R_drum_line` · `brake_pad` · `predicted_omega_chip` · `dLdt_readout` · `formula_surface` · `grip_hand` · `sliding_masses` · `turntable_body`.

**One-shot-hold contract carried forward exactly:** S1–S5 and S7 each ramp once and HOLD at the end value for the remainder of the state (never re-approach `from`). S6 is the only looping state. S8's idle motion is the repeating-triangle (`nlbRunIdleSweep`), not a ramp. Every state's entry is a single-frame re-pose to its ENTRY CONFIG (§2) — never an animated slide into position.

### S1 — "No torque: L constant" · core · none live · duration ≥ 8 s, pin @ 4.8 s

Entry: r = 0.80, ω = +1.50, brake off. Turntable is ALREADY spinning at t = 0 (never a cold start).

| t-window | What animates | Driven by |
|---|---|---|
| 0–8000 ms (whole state) | Turntable + rod + two masses spin continuously at ω = 1.50 (background motion, never stops — E9's continuous-spin classification) | ω (constant this state) |
| 0–1200 ms | `L_arrow` draws in along the axle, length ∝ \|L\| = 4.59 (**magnitude only — no direction semantics rendered or narrated**) | L |
| 1200–2000 ms | masses visibly at r = 0.80 (home pose established) | r |
| 2000–2800 ms | `I_readout` builds in: "I = 3.06 kg·m²" | I(0.80) |
| 2800–3600 ms | `omega_readout` builds in: "ω = 1.50 rad/s" | ω |
| 3600–4400 ms | `L_readout` builds in: "L = 4.59 kg·m²/s" | L |
| 4400 ms → end | HELD — all three readouts + `L_arrow` steady; law statement narrated over this hold | — |

Controls: **none**. Margin: end-config ~4.4 s, pin 4.8 s ✓.

Narration sync (sentence # → t-anchor → glow): 1 → 0–1200 → `turntable_body`, `L_arrow` · 2 → 1200–2000 → `sliding_masses`, `r_line` · 3 → 2000–2800 → `I_readout` · 4 → 2800–3600 → `omega_readout` · 5 → 3600–4400 → `L_readout` · 6 → 4400+ → `L_readout` (hold-glow, sustained).

### S2 — "Masses in: spin faster" · core · none live · duration ≥ 12.6 s (author 13 s), pin @ 7.8 s

Entry: r = 0.80 (= ramp.from), ω = +1.50, brake off.

| t-window | What animates | Driven by |
|---|---|---|
| 0–4190 ms | Pre-roll: one full slow revolution at steady ω = 1.50, r = 0.80 (matches 2π/1.50 = 4.19 s exactly) | ω |
| 4190–4890 ms (700 ms) | `pull_arrows` appear on both masses, pointing along −r̂ at the axis (**cause**), static — masses NOT yet moving | F_pull (static reveal) |
| 4890–6890 ms (2000 ms, one-shot ramp) | Masses slide inward, r: 0.80 → 0.20 (**effect**); ω climbs 1.50 → 6.95, I falls 3.06 → 0.66, both recomputed live every step; `L_readout` stays flat at 4.59 throughout, hold-glow builds | r-ramp → ω = L/I, I(r) |
| 6890 ms → 13000 ms | HELD at r = 0.20, ω = 6.95, I = 0.66, L = 4.59 (`L_readout` hold-glow steady) | — |

Controls: **none**. Margin: end-config 6.89 s, pin 7.8 s, margin 0.9 s ✓.

Narration sync: 1 → 4190–4890 (cause, static) → `pull_arrows` · 2 → 4890–6890 → `sliding_masses`, `r_line` · 3 → 4890–6890 (law, overlapping the ramp) → `L_readout` · 4 → 4890–6890 (effect) → `omega_readout`, `I_readout` · 5 → 6890+ (anchor, over the hold) → `turntable_body`.

### S3 — "Equation predicts the slow-down" · core · none live · duration ≥ 10 s, pin @ 6.0 s

Entry: r = 0.20 (= ramp.from), ω = +6.95 (**continuity from S2's held end** — the one state that is not a fresh re-pose in appearance, though mechanically identical).

| t-window | What animates | Driven by |
|---|---|---|
| 0–3200 ms | `formula_surface` assembles I₁ω₁ = I₂ω₂; `predicted_omega_chip` reveals "predicted ω = 1.50" (static value chip, F1 chip form) | authored reveal |
| 3200–5200 ms (2000 ms, one-shot ramp) | Masses slide OUT, r: 0.20 → 0.80; `pull_arrows` **persist and SHORTEN** as r rises (19.35 N → 3.60 N, F5 tracking — the hold eases, never reverses to a push); ω falls 6.95 → 1.50 continuously | r-ramp → F_pull(r,ω), ω = L/I |
| ~5190–5200 ms | **Match cue fires as a LATCH** (first frame \|ω − 1.50\| < 0.01 stays true forever once the ramp holds — carry-forward 6: NOT an edge detector, since the predicate window is under one frame at 60 Hz) — `omega_readout` and `predicted_omega_chip` co-glow | ω meeting the chip |
| 5200 ms → 10000 ms | HELD at r = 0.80, ω = 1.50 (global home pose); chip + readout glow sustained | — |

Controls: **none**. Margin: end-config 5.2 s, pin 6.0 s, margin 0.8 s ✓.

Narration sync: 1 → 0–3200 → `formula_surface`, `predicted_omega_chip` · 2 → 3200–3800 → `sliding_masses`, `r_line` · 3 → 3200–5200 → `pull_arrows` (tracking/shortening) · 4 → ~5200 → `omega_readout` + `predicted_omega_chip` (match-glow) · 5 → 5200+ (anchor) → `turntable_body`.

### S4 — "Kinetic energy goes up" · core (misconception_confrontation) · none live · duration ≥ 10 s, pin @ 6.0 s

Entry: r = 0.80 (= ramp.from), ω = +1.50, brake off.

| t-window | What animates | Driven by |
|---|---|---|
| 0–2500 ms | `KE_tick` reveals ALONE at 3.44 J on the bar scale, labelled "if energy stayed constant" — **nothing else moves** (Rule 32b) | authored reveal |
| 2500–3200 ms (700 ms) | `pull_arrows` reappear (cause), static | F_pull (static reveal) |
| 3200–5200 ms (2000 ms, one-shot ramp, replay of S2's slide) | r: 0.80 → 0.20; `KE_bar` climbs 3.44 → 15.96 J continuously (KE = L²/2I(t)); `L_readout` stays flat at 4.59 the whole time | r-ramp → KE(L,I) |
| 5200 ms → 10000 ms | HELD — the gap between `KE_tick` (3.44) and `KE_bar` (15.96) stays visibly OPEN for the remainder of the state (F-1; this pin **photographs** the claim by construction) | — |

Controls: **none**. Margin: end-config 5.2 s, pin 6.0 s, margin 0.8 s ✓.

Narration sync: 1 → 0–2500 → `KE_tick` · 2 → 3200–5200 → `sliding_masses`, `KE_bar` · 3 → 3200–5200 → `L_readout` (flat, contrast glow) · 4 → 5200+ → `pull_arrows`, `KE_bar` (the gap).

### S5 — "External torque changes L" · core (condition) · **brake-torque slider live** · duration ≥ 10 s, pin @ 6.0 s

Entry: r = 0.80 (**single-frame re-pose from S4's held r = 0.20**), ω = +1.50, brake pad disengaged (τ = 0 at entry — the engage IS the beat).

| t-window | What animates | Driven by |
|---|---|---|
| 0–1500 ms | `brake_pad` translates in toward the turntable's rim; `R_drum_line` drawn/labelled, visually distinct from `r_line`; masses at r = 0.80 sit visibly OUTSIDE the braked radius (0.55 m) | pad translate (authored) |
| 1500 ms | Pad makes contact — τ_ext becomes −0.92 N·m (default) | brake engagement |
| 1500–4000 ms (2500 ms) | L decays linearly: L(t) = 4.59 − 0.92·(t − 1.5 s) → 2.29 at t = 4.0 s; ω, KE recompute live each step (I fixed at 3.06 — r never moves in S5). **CAUTION (carry-forward 2): at t ≈ 3160 ms absolute (1.66 s into the decay) L momentarily equals 3.06, the SAME NUMBER as the constant `I_readout` — different instruments, different units, no defect, but do not co-glow or narrate a comparison at this instant** | τ_brake, L-integrator |
| 4000–5000 ms (1000 ms) | Pad releases (τ_ext → 0); the `L_readout` hold-glow — pinned since S1 — **finally breaks and re-settles**, marking visually that this is the first state where L actually changed | release (authored) |
| 5000 ms → 10000 ms | HELD at L = 2.29, ω = 0.75, KE = 0.86 | — |

Controls: **brake-torque slider**, `[0, 2.0]` N·m, default **0.92**, step 0.05, min_ring `core` — live during the state; the teacher may retry at other τ values (rest clamp always active on L, never reverses spin at any reachable value; at τ = 2.0 the platform reaches rest at 2.30 s < the 2.5 s window and the clamp holds L = ω = KE = 0 for the remainder — a legible extreme, not a reversal). Margin: end-config 5.0 s, pin 6.0 s, margin 1.0 s ✓.

Narration sync: 1 → 0–1500 → `brake_pad`, `R_drum_line` · 2 → 1500–1700 → `sliding_masses`, `r_line` (contrast: outside the braked radius) · 3 → 1500–4000 → `L_readout` (decay glow — **not** co-glowed with `I_readout`) · 4 → 4000–5000 → `omega_readout`, `brake_pad` (release).

### S6 — "L points along axis" · extended · **spin-direction toggle (= restart)** · duration ≥ 10 s (looping), pin @ 6.0 s

Entry: r = 0.80, run A ω = +1.50, brake off. Camera reframes side-on at entry. **The only looping state. First and only state to narrate L's direction.**

| t-window | What animates | Driven by |
|---|---|---|
| 0–4000 ms (Run A) | Steady spin ω = +1.50; `grip_hand` curls WITH the spin (one full curl); `L_arrow` — now direction-capable — points UP, \|L\| = 4.59 | spin_sign = +1 |
| 4000–4500 ms (500 ms, cut) | Restart cue fires; readouts BLANK, hold ≥ 0.5 s (P3/E8 — never a live +4.59 → −4.59 frame) | restart trigger |
| 4500 ms | Restart: spin_sign flips to −1; L re-pins to −4.59; re-pin cue (hold-glow flash) fires once | spin_sign = −1 |
| 4500–10500 ms (Run B, 6000 ms) | Spin ω = −1.50; `grip_hand` curls the OTHER way; `L_arrow` points DOWN | spin_sign = −1 |
| 10500 ms | Cycle repeats (blank + cut → Run A) — continuous loop for the state's full duration | — |

Controls: **spin-direction toggle**, min_ring `extended` — drives the SAME restart mechanism live (no easing through zero at any reachable value). Pin @ 6.0 s lands ~1.5 s into Run B ✓.

Narration sync: 1 → 0–1200 → `L_arrow` (magnitude, transitioning to signed) · 2 → 1200–4000 → `grip_hand` · 3 → ~3500 (Run A) → `L_arrow` (up) · 4 → 4500–10500 (Run B) → `L_arrow` (down), `grip_hand`.

### S7 — "Torque equals dL/dt" · advanced · none live · duration ≥ 11 s, pin @ 6.6 s

Entry: r = 0.80, ω = +1.50 (re-seed to the canonical positive spin — S6 may end mid Run B), brake off.

| t-window | What animates | Driven by |
|---|---|---|
| 0–4000 ms | `formula_surface` assembles term-by-term: τ_ext = dL/dt; `dLdt_readout` appears, pinned at 0.00 by ~4000 ms | authored reveal, synced to narration |
| 4000–6000 ms (2000 ms, one-shot ramp, slow replay of S2's pull-in) | r: 0.80 → 0.20; I falls, ω rises, `L_readout` stays flat; `dLdt_readout` stays fixed at **0.00 the whole time** | r-ramp → I, ω; dL/dt = per-step ΔL/h (constructed as 0 since τ_ext = 0) |
| 6000 ms → 11000 ms+ | HELD — equation complete, replay held at r = 0.20, dL/dt still 0.00 | — |

Controls: **none**. Margin: end-config 6.0 s, pin 6.6 s, margin 0.6 s ✓. **Honest framing (F-3/F-11):** dL/dt is a per-step finite difference of the engine's OWN integrated L — under the single integrator this equals τ_ext by construction, so it is presented as an ILLUSTRATION of the law, never as an independent measurement.

Narration sync: 1 → 0–2000 → `formula_surface` (τ_ext term) · 2 → 2000–4000 → `formula_surface` (= dL/dt term), `dLdt_readout` · 3 → 4000–6000 → `L_readout` (flat, contrast) · 4 → 4000–6000 → `dLdt_readout` (pinned 0.00), `sliding_masses`.

### S8 — "Try it yourself" · explore · **ALL, ring-gated** · open/continuous (Rule 37 — never auto-freezes)

Entry: r = 0.80, ω₀ = 1.50, spin_sign = +1, τ_brake = 0, idle sweep armed.

| Behavior | What animates | Driven by |
|---|---|---|
| Until first trusted input | Idle auto-sweep: r oscillates 0.80 → 0.20 → 0.80 (**repeating triangle, `nlbRunIdleSweep` — NOT a ramp**), thumb + numeric label in lockstep on the state clock; `pull_arrows` track live | idle sweep |
| `r` drag (live, trusted-seize) | Masses slide to the dragged r; L held CONSTANT (no brake engaged); ω, I, KE, F_pull recompute every frame; arrows track live | r |
| `m` / `ω₀` / spin-direction change | **RESTART**: L re-pins from the new I(r_current)·ω₀·spin_sign; re-pin cue (blank ≥ 0.5 s + hold-glow flash) fires, attributed visibly to the restart, never silent | m, ω₀, spin_sign |
| brake-torque drag (live) | τ_ext applies while held > 0; rest clamp always active; `r`-drag DURING braking is automatically correct (E2's α = (τ − ω·dI/dt)/I coupling emerges from the definition, no special-casing) | τ_brake |

Controls: **ALL**, ring-gated — `r` (core, [0.15, 0.90] m, step 0.01, default 0.80) · `ω₀` (core, [0.5, 3.0] rad/s, step 0.1, default 1.50) · `m` (core, [0.5, 5.0] kg, step 0.1, default 2.0) · brake-torque (core, [0, 2.0] N·m, step 0.05, default 0.92) · spin-direction (**extended**, restart toggle). No narration (0/open).

---

## §4 — Narration (`text_en`) per state

All within the approved budgets; word counts per sentence. Symbols expanded to spoken names on first use per state (Rule 30); on-canvas labels stay symbolic. No idioms or personification (Rule 41) — "grip" avoided throughout in favour of literal "presses onto". The S1 axle arrow's direction is never mentioned before S6.

**S1** (41 words):
1. "This turntable spins steadily." (4)
2. "Two equal masses sit out near the rod's ends." (9)
3. "Spread of mass is moment of inertia I." (8)
4. "Spin rate is angular speed ω." (6)
5. "Their product is angular momentum L." (6)
6. "With no external torque, L stays the same." (8)

**S2** (55 words) — cause narrated before effect; never "free"/"costs nothing":
1. "An inward pull force acts on each mass." (8)
2. "The masses slide in toward the axle." (7)
3. "No external torque acts, so angular momentum L cannot change." (10)
4. "Moment of inertia I falls, so angular speed ω rises — the spin speeds up four point six four times." (19)
5. Anchor (11): "Like a person on a spinning stool, pulling their arms in."

**S3** (55 words) — subscript clause cut per the overrun fallback; "before/after" carried by the formula-surface labels instead:
1. "The equation predicts angular speed ω: one point five oh radians per second, before the slide begins." (17)
2. "Now the masses slide back out." (6)
3. "The pull arrows shorten as the masses move out — the force never reverses to push." (15)
4. "Angular speed ω slows and meets the prediction exactly." (9)
5. Anchor (8): "Like a diver stretching to slow a somersault."

**S4** (53 words):
1. "If energy were conserved, kinetic energy would stay three point four four joules." (13)
2. "The masses pull in once more, and energy climbs past the mark to fifteen point nine six joules." (18)
3. "Angular momentum L stays exactly flat the whole time." (9)
4. "The visible pull does real work — that work becomes the extra kinetic energy." (13)

**S5** (50 words) — apparatus is "turntable" throughout; no narration invites a glance at both L and I mid-decay:
1. "A brake pad presses onto the turntable's rim at zero point five five metres." (14)
2. "The masses stay outside this braked radius." (7)
3. "An external torque now acts: L falls from four point five nine to two point two nine." (17)
4. "Angular speed falls to zero point seven five as the pad releases." (12)

**S6** (42 words) — the FIRST state to narrate L's direction:
1. "Angular momentum L is a vector — it points along the rotation axis." (12)
2. "Curl the right hand's fingers with the spin; the thumb points along L." (13)
3. "Spinning this way, L points up." (6)
4. "Now the turntable restarts spinning the other way — L points down." (11)

**S7** (52 words):
1. "External torque equals the rate of change of angular momentum: torque equals dL over dt." (15)
2. "When no external torque acts, dL over dt is zero." (10)
3. "So angular momentum L cannot change — this is exactly what conservation means." (12)
4. "Watch the readout stay at zero point zero zero as the masses slide in again." (15)

**S8**: 0 words (open explore state — no authored narration).

---

## §5 — Drill-down cluster phrasings (30 phrases, 6 clusters × 5)

**`why_omega_rises`** (S2): "why does it spin faster when nothing pushed it" · "how can speed increase with no force" · "nothing touched it so why did the spin change" · "where does the extra speed come from" · "isnt this against newtons first law"

**`L_vs_omega_confusion`** (S2): "if L stays the same why does omega change" · "L is constant so shouldnt the spin stay the same too" · "whats the difference between L and omega here" · "why is L fixed but the speed isnt" · "I thought L and omega always move together"

**`internal_forces_no_torque`** (S2): "the pull is a force so why is there no torque" · "doesnt pulling the masses in count as a push" · "why doesnt the inward pull twist the turntable" · "the arrows are forces so where is the torque" · "how can a force act with zero torque"

**`ke_not_conserved`** (S4): "if L is conserved why isnt energy conserved too" · "L stays the same so why does KE change" · "doesnt conservation mean everything stays constant" · "why does kinetic energy go up when nothing new pushed it" · "I thought conserved quantities dont change ever"

**`who_does_the_work`** (S4): "where does the extra kinetic energy come from" · "who is doing the work here" · "nothing external acted so what added the energy" · "is the pull force actually doing work" · "if torque is zero how can there be work"

**`ke_ratio_formula`** (S4): "how do you find the new kinetic energy without recomputing omega" · "is there a shortcut formula for the energy ratio" · "why does KE equal L squared over 2I" · "how is the KE ratio just I1 over I2" · "can I get the energy change straight from the inertia values"

---

## §6 — Constraint callouts

1. **Rounding.** 2 dp everywhere. The max-torque stop time is 4.59/2.0 = 2.295 s → prints **"2.30 s"**, never "2.29 s" (which is the unrelated held-L value at default τ — different quantity, different unit; keep them visually and numerically distinct).
2. **One noun for the apparatus.** "Turntable" in every reader-facing string (captions, delta cues, HUD labels, narration) — never "brake drum"/"platform". The pad "presses onto the turntable's rim at 0.55 m." Internal engine/geometry field names (`brake_drum_radius_m`, `R_drum`) are not reader-facing and may keep "drum" as an identifier.
3. **S5 transient coincidence — not a defect.** L sweeps through 3.06 at t ≈ 1.66 s into the decay (≈ 3.16 s absolute state time), momentarily equal to the constant `I_readout`. Different instruments, different units, no pin lands there, no beat asks a comparison. §3's S5 row flags the exact window — narration and glow must not invite a side-by-side glance at L and I during the decay.
4. **Arrow-length scaling (F5) — a NEW build-sheet item.** Guided-state F_pull ranges 3.60 N (r = 0.80) → 19.35 N (r = 0.20), a 5.4× spread. Per the OPEN row `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio`, the SMALLER magnitude (3.60 N) must clear the renderer's minimum-length floor with margin, and the larger (19.35 N, drawn close to the axle) must not clip. **S8's full slider range is far more extreme** — at m = 5.0 kg, r = 0.90 m, ω₀ = 3.0 rad/s, I reaches 8.60 kg·m² and L can seed as high as ≈ 25.8 kg·m²/s, pushing F_pull into the hundreds of newtons at corner combinations. A fixed linear arrow scale sized to the guided range (3.60–19.35 N) **will clip or saturate in S8**; flag for field3d-surgeon to choose a graceful (auto-rescaling or bounded/asymptotic) mapping for the explore state rather than a fixed linear one. *(Orchestrating-session note: this is a 0c-1 union addendum raised at 0b before any code — the same class as the rolling concepts' arrow-map finding on 0c-2.)*
5. **Sign-colour convention** (scar `teach_color_each_element_by_its_own_sign`, routed to physics_author). `L_arrow` and the signed `omega_readout`/`L_readout` digits take ONE consistent colour when spin_sign = +1 and a DIFFERENT consistent colour when spin_sign = −1, identical across S6's two runs and S8's toggle — a teacher should read the sign from colour alone before reading the number. Suggested: cool blue for +1, warm amber for −1 (avoid red, reserved elsewhere for warnings).
6. **ASCII-minus risk.** ω and L are genuinely negative in S6 Run B and S8 (spin_sign = −1) — the first states in this concept to print a negative number. Every `toFixed()` call on these readouts must post-process to a real Unicode minus (U+2212) per Rule 34c / the FIXED bug `ascii_minus_in_oncanvas_math_from_tofixed`; json_author's sweep must cover all three text paths (DOM readouts, canvas `fillText`, sprite labels) since this concept exercises all three.
7. **Brake source formula.** τ_ext = −sign(ω)·τ_brake while engaged; rest clamp acts on L only, never on the derived ω; the brake must never reverse spin at any reachable slider value (verify with a 20 s seize probe across [0, 2.0] N·m).
8. **KE bar full scale (S4 only).** 15.96 × 1.1 = 17.556 → display ceiling **17.6 J**. No clipping risk elsewhere — S4 is sliderless (fixed range by construction), and every other state shows KE as a plain value-only number, not a bar.
9. **dL/dt honesty (S7).** Present strictly as an illustration of the integrated law (the single integrator makes dL/dt = τ_ext true by construction) — never caption it as independent proof.
10. **r's global entry default is 0.80**, used at every state's entry except S3 (explicit override 0.20, continuity from S2's held end).
11. **ω₀ and spin_sign are restart/seed-only parameters** — wired to (re)set L only at t = 0 (S1) and at explicit restart events (S6's cut, S8's live m/ω₀/direction change), never applied as a continuous per-frame drive during an ordinary state.
12. **Notation ladder (Rule 38c) — verified compliant.** Every formula surface on a core/extended state is algebra-only (L = Iω, ω = L/I, I₁ω₁ = I₂ω₂, KE = ½Iω², "τ_ext ≠ 0 ⇒ L changes"); the one calculus form, τ_ext = dL/dt, is correctly confined to S7 (advanced ring) and does not appear elsewhere.
13. **Dialect (38d).** No board-divergent term identified in this concept's core vocabulary (angular momentum, moment of inertia, angular speed read identically across CBSE/JEE/NEET) — no dual-labelling required.

---

**DC Pandey check:** every formula, narration line and anchor above derives from L = Iω / τ_ext = dL/dt / KE = ½Iω² directly — no teaching sequence, example or figure imported from any book.

*Phase 0b for `conservation_of_angular_momentum` is COMPLETE (skeleton REV 4 `DESIGN_OK` + this block). Next: the 0c-1 `field3d-surgeon` dispatch on `feat/rotmech-engine`, with the eleven approval carry-forwards and callout 4's S8 arrow-scale addendum folded into the brief.*
