# `force_rig` — authoritative JSON contract (as BUILT)

> Written 2026-07-31 at the close of Phase 0, from the two `field3d-surgeon` build dispatches
> (`e5c5d01` force_table, `096157d` whirl). **This supersedes any guess in the architect skeleton
> or in `FORCE_RIG_ENGINE_SPEC.md` §1** where the two disagree — the spec is the design intent, this
> is what the renderer actually reads. Authoring against the spec alone will produce keys the engine
> ignores and bands where every arrow sits on the length floor.

Top level: `scenario_type: "force_rig"`, `explorer_id: "force_rig_explorer"` (default).
Per-state key: `force_rig`, with `apparatus: "force_table" | "whirl"`.

---

## Branch A — `apparatus: "force_table"`

```jsonc
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down",              // default
    "ring_mass_kg": 0.05,            // default; affects settling speed only
    "damping": 40,                   // default
    "ring_start_offset_m": [0.06, 0.0],   // NOT in the spec — added in build (see note 1)
    "show_resultant": true,
    "show_components": false,
    "strings": [
      { "id": "s1", "angle_deg": 0,   "hanging_mass_kg": 3.0, "label": "T₁", "color": "#ffd166" }
    ]
  },
  "arrows":   [{ "show": ["tension", "resultant"], "labels": { "resultant": "ΣF" } }],
  "readouts": ["T", "sum_F", "sum_Fx", "sum_Fy"],
  "controls_visible": ["m1", "m2", "m3", "angle1", "angle2"],
  "glow_focal": "fr_ring",
  "param_ramp": { "param": "angle1", "from": 30, "to": 75, "end_ms": 6000 }
}
```

**Bands and limits (violating these is silent, not an error):**

| Key | Constraint | Why |
|---|---|---|
| `strings[]` | **max 4** | engine limit |
| `hanging_mass_kg` | **1.2 – 5.0 kg** | below 1.2 kg every arrow renders at the ~11.5 N length floor and "length ∝ magnitude" dies |
| `ring_start_offset_m` | \|offset\| ≤ 0.15 | table radius is 0.25 m |
| `angle_deg` | CCW from +x, 0–359 | |

- `arrows[].show` enum is closed: `tension | weight | normal | resultant | centripetal`. **On branch A only `tension` and `resultant` render.**
- `readouts` on branch A: `T | sum_F | sum_Fx | sum_Fy` only.
- `controls_visible`: `m<i>` / `angle<i>` bind to `strings[i-1]`; a control for a string the state does not have is auto-hidden. `omega|L|bob_mass` are type-legal but have **no slider row on branch A — do not author them here.**
- Slider defaults: `m*` 1.2–5.0 step 0.1 (defaults 3 / 4 / 5); `angle*` 0–359 step 1. Override per-token via top-level `slider_controls.<token>{min,max,step,default,label,dp}`.

---

## Branch B — `apparatus: "whirl"`

```jsonc
"force_rig": {
  "apparatus": "whirl",
  "whirl": {
    "geometry": "conical",           // or "flat"
    "string_length_m": 1.00,
    "bob_mass_kg": 1.5,
    "omega_rad_per_s": 4.0,
    "anchor_height_m": 1.00,         // conical only; default = L
    "show_radius": true,
    "show_velocity": true,
    "release": { "at_ms": 4000, "trail": true, "ghost_circle": true }
  },
  "arrows":   [{ "show": ["tension", "weight"] }],
  "readouts": ["T", "theta", "v", "omega", "r", "a_c"],
  "controls_visible": ["omega", "L", "bob_mass"],
  "glow_focal": "fr_bob"
}
```

**Authoring rules that are real constraints, not style:**

- **`theta` is silently dropped on `flat`** — there is no cone. Do not author it there.
- **Never author `resultant` and `centripetal` in the same state** — they are the identical vector in the steady state and stack two arrows and two labels on one line.
- **Never author `resultant` on a `flat` state** — it *is* the tension.
- `normal` renders only on `flat`.
- **θ is SOLVED**, never authored. `cos θ = g/(ω²L)`; below `ω² L > g` there is no conical solution — the engine clamps ω to `√(g/L)`, hangs the bob, hides the guide ring, snaps the slider handle back and shows an amber `ω min = …` row. The clamp is a **teaching surface**: ω is deliberately allowed below the physical minimum so a teacher can drive into it and see why.

**Slider bands:** `omega` 1.0–6.5 step 0.1 (default 4.0) · `L` 0.60–1.40 step 0.05 (default 1.00) · `bob_mass` 0.8–4.5 step 0.1 (default 1.5).

**Magnitude band (arrow floor ≈ 11.5 N, cap 58.3 N):**
- Conical: `m = 1.5 kg, L = 1.00 m, ω ∈ [3.4, 6.4]` → T = 17–61 N, W = 14.7 N — all proportional.
- **Cut-the-string: run it SLOW** — `m ≈ 4.0 kg, ω ≈ 1.8, L = 1.00` → T = 12.96 N (above floor) and 1.8 m/s of flight, so the ~1.2 s `deriveStateMeta` pin window stays on the table and in frame. **Keep post-cut flight ≤ ~1.4 s.**

---

## Shared

- `param_ramp: { param: "angle1"|"angle2"|"m1"|"omega", from, to, start_ms?, end_ms }`.
  **Reveal pin = `end_ms + 1600 ms`** (the settle) on branch A — budget the state's duration for it.
  `release.at_ms` pins at **+1200 ms**.
- `phases: [{ id, at_ms?, until_ms?, glow_focal? }]`.
- `glow_focal` — exactly ONE per state (Rule 32e). Valid ids:
  - table: `fr_ring` `fr_table` `fr_rim` `fr_centre` `fr_pulley_<i>` `fr_string_<i>` `fr_weight_<i>` `fr_arrow_<i>` `fr_resultant` `fr_zero_dot`
  - whirl: `fr_bob` `fr_wstring` `fr_anchor` `fr_plane` `fr_guide_ring` `fr_ghost_ring` `fr_radius_line` `fr_trail` `fr_w_tension` `fr_w_weight` `fr_w_normal` `fr_w_centripetal` `fr_w_resultant` `fr_w_velocity`
  - `fr_trail` is exempt from the glow dim pass (build call — it is evidence, not a competing peer).
- `stateDef.formula_overlay` is the ONE formula surface (`#fr_formula`, Cambria Math, left-centre). **The engine authors no formula text** — the concept supplies it. Conical: `cos θ = g / (ω²L)`. Flat: `T = m ω² r`.
- Explore state: `trusted_drag_seizes: true` → classified `interactive`, never freezes (Rule 37).
  **Caveat:** `trusted_drag_seizes` implements the SLIDER seize only. Pointer-dragging the ring itself is NOT implemented (it would need the shared pointer handler, a region another tray is in).
- Camera: `[0, 3.4, 9.2]` framed both fixtures acceptably; a conical state can come closer.
  The camera **target is not authorable** — the whirl rig self-centres around the origin (scar candidate 3).
- `deriveStateMeta` needs **no edit** for either branch — both are registered.

---

## Build calls that departed from the spec (founder-visible)

1. **`ring_start_offset_m`** — new key, not in spec §1. It is what lets a guided state open displaced and *visibly settle* rather than opening still — the tray's own named Rule 31 trap.
2. **String direction is `unit(pulley_i − p)`, not the fixed authored angle.** Spec §2's `ΣF = Σ T_i(cos φ_i, sin φ_i)` is the `p = 0` case; off centre the directions rotate, giving the restoring stiffness. Without it the ring drifts forever and **spec assertion 2 is unsatisfiable** — there is no new fixed point to settle at.
3. **Implicit linear drag** (`v_new = (v + (F/m)h) / (1 + (b/m)h)`). Spec §2's explicit form is unstable at the damping a legible ~1.5 s settle requires (`b·h/m ≈ 13` vs a bound of 2). Reported free-body `a = (ΣF − b·v)/m` is unchanged — nothing the HUD or an arrow shows differs. Scar candidate 2.
4. **Hanging weights drawn radially outward, not screen-down** — in a top-down view that is the honest projection and the only placement that survives every angle.
5. **Whirl: velocity Verlet + SHAKE/RATTLE at a 2 ms micro-step** (8 per shared step). At 1/60 s the constrained-orbit radius error is ~1% at ω = 6 — a visible cone angle disagreeing with `cos θ = g/(ω²L)`. `T = mω²L` and `cos θ = g/(ω²L)` appear **nowhere in the renderer**; they fall out of `T = m(û·a_free + |v|²/L)`.
6. **`fr_wstring`** is a dedicated mesh rather than reusing `fr_hangdrop_0` — `glow_focal` is authored by id and `"fr_hangdrop_0"` is unreadable for a whirling bob's string.
7. **Plane radius derived from `L`, widened to `L × 2.8`** when a `release` is authored, opacity 0.55 (the weight arrow was otherwise swallowed by an opaque top).
