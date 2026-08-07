# ROTMECH APPARATUS CONTRACT — binding on every Phase-0d desk

**Status: BINDING. Landed with the pre-registration commit, 2026-08-04.**

Six of the eight Phase-0d concepts render on the SAME turntable, and two render on the same
incline, authored across **five parallel desks that cannot see each other's work**. Nothing in
the validator checks cross-concept apparatus agreement, and nothing catches it until the
chapter-wide Checkpoint C at the very end. Without a pinned contract, six concepts on one
machine become six different machines.

**Rule 32d says the same apparatus persists from a recognizable home pose so that at every
click the only visible change IS the new thing. Across a chapter, that rule only holds if
every desk builds the same machine.** This file is that machine.

Every value below is the engine default, verified in `src/lib/renderers/field_3d_renderer.ts`
on master at PR #28. **Author them explicitly anyway** — an omitted field silently inherits
the default today, but a future engine change to a default would then silently move your
apparatus.

---

## 1 · The turntable (`rigid_body_rotation` scenario — 0c-1)

Serves `rigid_body_rotation`, `rotational_kinematics`, `tau_eq_i_alpha`,
`rotational_work_energy`, `angular_momentum`, `conservation_of_angular_momentum`.

| Field | Pinned value | Source |
|---|---|---|
| `apparatus.body_shape` | `'turntable_rod'` | the ONLY implemented shape (`:982`) |
| `apparatus.i_frame_kgm2` | `0.50` | `RBR_DEF_I_FRAME` (`:49739`) |
| `apparatus.rod_half_length_m` | `1.00` | `RBR_DEF_ROD_HALF` (`:49740`) |
| `apparatus.brake_drum_radius_m` | `0.55` | `RBR_DEF_DRUM_R` (`:49741`), Addendum B |
| `apparatus.rod_height_above_pad_m` | `0.25` | `RBR_DEF_ROD_H` (`:49742`) — the pad must never foul a mass |
| `apparatus.r_min_m` | `0.15` | `RBR_DEF_R_MIN` (`:49743`) |
| `apparatus.r_max_m` | `0.90` | `RBR_DEF_R_MAX` (`:49743`) |
| `masses.count` | `2` | the rod carries a symmetric pair |
| `masses.mass_kg` | `2.0` | `RBR_DEF_MASS` (`:49744`) |
| `omega0_rad_s` | `1.5` at the home pose | `RBR_DEF_OMEGA0` (`:49744`) |
| re-pin blank | `500` ms minimum | `RBR_DEF_BLANK_MS` (`:49745`), Addendum C |

**The home pose is `r = 0.80 m`, `ω = +1.50 rad/s`, `m = 2.0 kg`, `tau_brake = 0`.**
This is `conservation_of_angular_momentum`'s S1/S2/S4/S5 entry (its physics block, the 0c-1
spec driver). Every rotmech turntable concept opens from this pose so a teacher moving between
simulations sees one continuing machine, not six unrelated ones.

Derived at the home pose, for cross-checking your own numbers:
`I = 0.50 + 2(2.0)(0.80²) = 3.06 kg·m²` · `L = 4.59 kg·m²/s` · `KE = 3.44 J`.

### Implemented readouts — the closed set

`RBR_RO_META` (`:50147`) implements exactly six rows:

```
I   ·   ω   ·   L   ·   KE   ·   dL/dt   ·   F
```

**There is no θ, no α, no W, no v row.** `rbrRebuildReadout` (`:50162`) does
`if (!meta) continue` — an unknown token is skipped in **silence**, with no throw and no gate
failure. A concept authored against a missing row passes Zod, passes `validate:concepts`,
seeds, renders, and can be sealed with the taught quantity simply absent.

**If your concept needs a row not in that list, it is BLOCKED on 0c-3. Do not author it.**

### Implemented controls — the closed set

`controls_visible` (`:1051`): `'r' | 'm' | 'omega0' | 'tau_brake' | 'spin_dir'`.

### Declared but inert — reading these is a silent no-op

`particles[]`, `parts[]`, `axis_select`, `axis_pair`/`d_draw`, `theta0_rad`,
`cross_product_construction`, `body_shape` variants beyond `'turntable_rod'`, and
`external_torque.source` `'torsion_spring'` | `'applied_force_at_point'` (`:939-956`).

Note the declared/live mismatch on `external_torque.source`: the interface declares
`'brake' | 'applied_force_at_point' | 'torsion_spring'` but the implementation resolves
`'applied_torque' | 'brake'` (`:50518`). **Use `'brake'` or `applied_torque_Nm`.** The
mismatch is queued for 0c-3.

---

## 2 · The incline (`newtons_laws_body` SEAM R — 0c-2)

Serves `pure_rolling` and `rolling_on_incline` (both on Desk B).

| Field | Pinned value | Source |
|---|---|---|
| scene scale | `0.5` world units per metre | `NLB_WORLD_PER_M` (`:39895`) |
| body size | `0.55` world units | `NLB_BODY_SIZE` (`:39896`) — **mass-independent** (Rule 29) |
| default `radius_m` | `0.55` m | `NLB_DEFAULT_RADIUS_M` (`:39981`) |
| lane gap | `0.85` world units | `NLB_LANE_GAP` (`:39914`) |

**Shape factors k** (`:39984`) — the closed set, and the whole physics of the race:

```
solid_sphere 0.4  ·  disc 0.5  ·  wheel 0.5  ·  hollow_sphere 2/3  ·  ring 1.0
```

with `a = g sin θ / (1 + k)`.

**`radius_m` back-compat:** absent ⇒ exactly `NLB_WHEEL_R / NLB_WORLD_PER_M = 0.55 m`, the
pre-SEAM-R constant, byte-identically. Presence is resolved by `typeof`, never truthiness —
`lane_gap_m = 0`, `activate_at_ms = 0` and `visible_before_activation: false` are all legal
falsy values.

**The four-body race order, fixed:** solid sphere, disc, hollow sphere, ring — fastest to
slowest, left to right, so the finish order reads left-to-right on screen.

**The timed surface is exactly TWO field classes** — `bodies[].activate_at_ms` and
`formula_overlay[].at_ms`. A third timed class is the Phase-0 alarm rule: **stop and re-scope**,
never build.

### Readout tokens — ASCII identifiers, Unicode display

Enum members are ASCII (`'contact'`, `'Romega'`, `'omega'`, `'KE_trans'`, `'KE_rot'`); the
Unicode `Rω` / `ω` belongs on screen only. Rule 34c governs on-canvas text, **not** TypeScript
identifiers.

---

## 3 · Shared authoring conventions

- **Colours and labels** for a quantity are identical across all eight concepts. `L` is always
  the axial vector in the same colour; `I`, `ω`, `L`, `KE` always read in the same HUD order as
  `RBR_RO_META` declares them.
- **Rule 41 (plain language)** on every reader-facing string. "the masses move in", not "the
  masses tuck in". Forces and bodies do not want, know, try, or resist.
- **Rule 35 (universal anchors)** — no country-specific culture anywhere. A merry-go-round, a
  potter's wheel, a bicycle wheel, a door on its hinges: all fine. No festivals, brands,
  currency, place names.
- **Rule 34a** — the on-canvas top caption is the ≤5-word delta cue ONLY; prose narration lives
  in the strip below the canvas.

---

## 4 · Changing this contract

**A desk may not change it unilaterally.** If your concept genuinely needs a different value,
that is a chapter-wide decision: write it to your own
`docs/loop_runs/rotmech/_engine/findings_<desk>.md`, and it is resolved in the office across
all eight concepts at once. A silent local deviation forks the chapter's apparatus, and nobody
discovers it until Checkpoint C, after every concept is sealed.
