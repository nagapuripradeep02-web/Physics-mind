# `force_rig` — the concurrent-force / circular-motion field_3d engine spec

> Founder-approved 2026-07-30. ONE new `scenario_type` in `src/lib/renderers/field_3d_renderer.ts`
> that serves BOTH remaining Laws of Motion concepts (`equilibrium_of_particles`,
> `uniform_circular_motion`) as pure JSON configuration.
>
> **Why one scenario for two visibly different apparatus.** A force table (ring, pulleys, hanging
> weights) and a ball whirled on a string are the SAME code: a point mass acted on by several forces
> whose DIRECTIONS are authored angles rather than a single track axis, integrated with damping so
> the mass visibly settles or visibly circles. The existing `newtons_laws_body` engine cannot serve
> either — it is strictly 1-D along a straight surface. This is the genuinely new capability in the
> chapter.
>
> **The success criterion: `uniform_circular_motion` must require ZERO renderer edits after
> `equilibrium_of_particles` seals.** If it forces a renderer change, this design under-generalized —
> STOP and re-scope rather than extending the engine per concept (the Ch.7 failure mode: 28 engine
> commits across 8 concepts).

Internal code prefix: `fr`. Per-state config key: `force_rig`. Follow `newtons_laws_body`
(prefix `nlb`, same file) as the structural template for arrows, HUD, sliders, trusted-drag seize
and `param_ramp` — reuse those code paths, do not re-derive them.

---

## 1. Per-state JSON config surface

```ts
force_rig?: {
    // The two apparatus this engine renders. Both are the same solver (§2).
    apparatus: 'force_table' | 'whirl';

    // ── force_table: a particle pulled by N strings over pulleys ─────────────
    force_table?: {
        view?: 'top_down' | 'perspective';   // default 'top_down' — the lab view
        ring_mass_kg?: number;               // default 0.05; only affects settling speed
        damping?: number;                    // b in F = −b·v; default tuned to settle in ~1.5 s
        strings: Array<{
            id: string;
            angle_deg: number;               // measured CCW from +x in the table plane
            hanging_mass_kg: number;         // tension = m·g along this string, exactly
            label?: string;                  // e.g. "T₁"
            color?: string;
        }>;
        show_resultant?: boolean;            // draw ΣF from the ring; length ∝ |ΣF|
        show_components?: boolean;           // resolve each tension into x and y
    };

    // ── whirl: a bob on a string sweeping a circle ───────────────────────────
    whirl?: {
        geometry: 'conical' | 'flat';
        // 'conical' — a real conical pendulum: gravity acts, the cone half-angle θ is SOLVED
        //             from the speed, never authored (§2). This is the exam case.
        // 'flat'    — the bob slides on a frictionless horizontal plane, string anchored at the
        //             centre. Gravity is balanced by the plane, so the string tension is PURELY
        //             centripetal. This is the clean cut-the-string case.
        string_length_m: number;             // L
        bob_mass_kg: number;
        omega_rad_per_s?: number;            // drives the motion; θ and r follow from it
        anchor_height_m?: number;            // conical only; default = L above the circle plane
        release?: {                          // THE MISCONCEPTION BEAT — cut the string
            at_ms: number;
            trail?: boolean;                 // draw the post-release path, default true
            ghost_circle?: boolean;          // keep the old circular path as a dim ghost so the
                                             // straight departure is visibly NOT along it
        };
        show_radius?: boolean;               // draw r from axis to bob
        show_velocity?: boolean;             // tangential v arrow
    };

    // Force arrows on the particle. Directions come from the solver, never authored.
    arrows?: Array<{
        show: Array<'tension' | 'weight' | 'normal' | 'resultant' | 'centripetal'>;
        labels?: Partial<Record<'tension' | 'weight' | 'normal' | 'resultant' | 'centripetal', string>>;
    }>;

    // Rule 33d instruments — live numerics only.
    readouts?: Array<'T' | 'sum_F' | 'sum_Fx' | 'sum_Fy' | 'theta' | 'v' | 'omega' | 'r' | 'a_c'>;

    glow_focal?: string;                     // EXACTLY ONE per state (Rule 32e)
    controls_visible?: Array<'m1' | 'm2' | 'm3' | 'angle1' | 'angle2' | 'omega' | 'L' | 'bob_mass'>;
    trusted_drag_seizes?: boolean;           // sandbox state only
    param_ramp?: { param: 'angle1' | 'angle2' | 'omega' | 'm1'; from: number; to: number; start_ms?: number; end_ms: number };
    phases?: Array<{ id: string; at_ms?: number; until_ms?: number | null; glow_focal?: string }>;
};
```

`explorer_id` reuses the existing top-level `Field3DConfig.explorer_id`, defaulting to
`"force_rig_explorer"`.

---

## 2. Physics core

Fixed-step, Rule 36: accumulate real elapsed ms, 0–3 steps of `h = 1/60 s`, forced to 1 under
`SET_TIME_FREEZE`. Every expression strictly linear in `dt`. `g = 9.8`.

### Branch A — `force_table` (damped 2-D particle)

Each string `i` pulls the ring toward its pulley with tension `T_i = m_i · g`, **exactly** — the
hanging mass IS the tension, which is what makes this apparatus so teachable.

```
ΣF = Σ_i  T_i · (cos φ_i, sin φ_i)          // φ_i = string angle_deg
a   = (ΣF − b·v) / m_ring
v  += a·dt ;  p += v·dt
```

The ring is a REAL integrated particle, not a placed marker. When the forces do not balance it
visibly drifts off centre and settles at a new position; when they do balance it returns to the
centre and stays. **Equilibrium is demonstrated as a physical settling, not asserted by three arrows
that happen to be drawn head-to-tail.** That is the entire reason this engine exists.

Damping is a display convenience (it makes the settle finite and legible) and must be disclosed in
the HUD only as settling behaviour — never as a force in the free-body diagram, because it is not
part of the physics being taught.

**Lami's theorem** falls out for the three-string case and can be read straight off the screen:
`T₁/sin α = T₂/sin β = T₃/sin γ`, where each angle is the one OPPOSITE its tension. The harness
asserts it; the sim never has to claim it.

### Branch B — `whirl`

**`geometry: 'flat'`** — the bob slides on a frictionless horizontal plane; the plane's normal force
cancels gravity exactly, so the string tension is the ONLY horizontal force:

```
T = m·ω²·r      pointing at the anchor,  r = L
a_c = ω²·r = v²/r
```

**`geometry: 'conical'`** — a real conical pendulum. The bob hangs at cone half-angle `θ` from the
vertical, sweeping a circle of radius `r = L·sin θ`:

```
vertical:    T·cos θ = m·g
horizontal:  T·sin θ = m·ω²·r = m·ω²·L·sin θ
⟹            T = m·ω²·L                    and     cos θ = g / (ω²·L)
```

**`θ` is SOLVED from `ω`, never authored.** This is the fidelity commitment of this branch: at every
speed the teacher dials in, the cone angle is the physically correct one, and the sim cannot be made
to show an impossible pose. Note the real constraint `ω² L > g` — below that there is no conical
solution (the bob simply hangs). The engine must CLAMP the slider to the physical range and say so
rather than rendering a nonsense angle; a slider that silently swallows an out-of-range write is the
trap that cost lom-c and lom-d a fix cycle each.

Period: `τ = 2π·√(L·cos θ / g)`.

**Implementation note — integrate, don't script.** The bob is integrated under gravity plus the
inextensible-string constraint, and seeded with the exact conical initial condition
(tangential speed `v = ω·L·sin θ` with `cos θ = g/(ω²L)`). Conical motion is a genuine solution of
those dynamics, so it emerges and persists rather than being drawn on a parametric circle. A trusted
slider drag on `ω` re-seeds the constraint (seed the CONSTRAINT, not its projections — the lesson
from `nlb_coupled_initial_velocity_never_seeded`).

### `release` — cutting the string

At `at_ms` the string constraint is REMOVED. Thereafter:

- `flat`: no horizontal force at all ⟹ the bob travels in a **straight line at constant speed along
  the tangent**. Not outward. Not curving. This is the centrifugal-force killer, and it must be a
  consequence of deleting the constraint, never a scripted straight line.
- `conical`: projectile motion under gravity from the release point with the tangential velocity.

`ghost_circle` keeps the abandoned circular path dim on screen so the departure is visibly NOT along
it. There is no outward force to draw at any point, before or after — because there isn't one.

---

## 3. Rendering

- **Force table:** a circular table seen top-down, pulleys at the rim at each string's angle,
  strings running from the ring over each pulley, and a hanging mass drawn below each pulley with its
  value. Changing a hanging mass changes the drawn weight AND the tension, together — one funnel.
- **Whirl:** the anchor (a post, or a hand-free pivot), the string, the bob, the swept circle as a
  faint guide ring, and the radius line when `show_radius`.
- **Arrows:** drawn along TRUE solved directions, length ∝ magnitude. Reuse nlb's arrow overlay
  including its ~15 N length-floor residual.
- **Resultant:** when `show_resultant`, draw `ΣF` from the particle. At equilibrium it collapses to a
  dot — **the visual signature of `ΣF = 0`**, and far better teaching than a caption saying so.
- **HUD:** value-only (Rule 34b) — `T₁ = 4.90 N`, `θ = 38.2°`, `a_c = 6.13 m/s²`. One math-serif
  Unicode formula surface per state (Rule 34b), clear of the review chrome (`top: 52px`+, Rule 34d).
- Rule 34c: all on-canvas math is real Unicode (`θ ω Σ ² · ⁻ °`), swept across DOM overlays,
  canvas-drawn text AND 3D sprite labels — a sweep of one path silently skips the others.

---

## 4. Rule compliance notes for the builder

- **Rule 36:** linear in `dt`, no literal `0.016`, no accumulated angle. Drive the circular motion
  from integrated state, and under `SET_TIME_FREEZE` (dt = 0) the pose reproduces byte-identically.
- **Rule 37:** the explore state never freezes — the whirl keeps sweeping, the table stays live under
  drags, and only the teacher's Pause halts it.
- **Rule 31 (no static state):** a force table at equilibrium is visually still. Every guided state
  must therefore carry motion — use `param_ramp` on an angle or a mass so tensions visibly change and
  the ring visibly re-settles. **A state whose only delta is a glow change is a Rule 31 violation**
  (the `newtons_laws_body` scar: `phases[]` only re-times `glow_focal`, and an opacity-only delta
  renders as a 0.00% frame-to-frame diff — a static state that passes every deterministic gate).
- **Rule 29:** emphasis is brightness. Arrow length changes ONLY when the real magnitude does.
- **Rule 39f:** follow the clean-mode overlay conventions and the ⚙ teacher widget panel works for
  free — no per-concept authoring.
- **New-scenario checklist (field_3d):** register in `deriveStateMeta.ts` (reveal keys + max reveal
  ms, including `release.at_ms` and any `param_ramp.end_ms`), add to the `#sliders` exclusion chain,
  NO backticks in the emitted renderer template, cue gates at `t = 0`, declare `__PM_supportsTimePin`.

---

## 5. Bring-up harness (must pass before ANY concept authoring starts)

`src/scripts/_scratch_fr_seams.ts`, modelled on `_scratch_nlb_seams.ts`. Assertions:

1. **Equilibrium settles:** a balanced three-string fixture returns the ring to the centre
   (|p| < 1 mm) and STAYS; `|ΣF| < 1e-6 N` at rest.
2. **Imbalance moves it:** changing one hanging mass by 20% drives the ring measurably off centre and
   it settles at a new fixed point — proving the settle is solved, not scripted.
3. **Lami's theorem:** for the balanced three-force fixture, `T_i/sin(opposite angle)` agrees across
   all three to within 0.5%.
4. **Conical solution:** `cos θ = g/(ω²L)` to within 0.5% across a sweep of `ω`, and `T = mω²L`.
5. **Physical range clamp:** for `ω²L < g` the engine clamps and does not render a cone; the slider
   write is not silently swallowed (the lom-c/lom-d range trap).
6. **Period:** measured revolution time matches `2π√(L cos θ/g)` to within 1%.
7. **Cut-the-string is straight (`flat`):** after release, successive velocity samples are parallel to
   within 0.5° and the speed is constant — i.e. genuinely straight, genuinely tangential, and the
   perpendicular distance from the anchor INCREASES monotonically while the path never curves outward.
8. **No outward force exists:** grep-assert the renderer contains no centrifugal term; the only
   horizontal force on the bob before release is the string tension, directed at the anchor.
9. **Rule 36:** N steps of `0.016` ≡ 1 step of `0.016·N` to machine precision; frozen frame
   byte-identical.

Prefer integrated/total-quantity assertions over instantaneous samples where a sample could land on a
designed-zero instant (the lom-e SEAM J lesson).

---

## 6. Verify chain (per CHAPTER_LOOP.md §3b — ALL must pass before any engine commit)

1. `npm run check:renderer-syntax` → `npx tsc --noEmit` → `npm run validate:concepts`
2. Re-seed the target concept's `simulation_cache`, then `npm run visual:eyes -- <target>`
3. Regression sample (Amendment 5 disjoint pair for this tray): **`electric_potential_meaning` +
   `eddy_currents`** — re-seed + EYE. Any H2 diff vs locked baselines = regression = FAIL.
   (Disjoint from tray F's `gauss_law_sphere` + `coulombs_law` so the two loops never re-seed the
   same baseline at once.)
4. Clock guard (Rule 36b): if the diff reaches `__pmSteps`/`dtStep`/any integrator, the FULL fleet
   sweep runs immediately.
5. On failure: surgical rollback of engine files only, attempt 2 with failure evidence added. Second
   failure → degrade to the founder's queue. **Never leave the build broken.**

ONE `bug_class` per dispatch (Amendment 4). Ceiling ~100 tool calls / ~45 min → `engine_handoff.md`.

---

## 7. What the two concepts need from this engine

Hard facts for the architect, so it designs against the engine that will exist rather than wishful
config.

### `equilibrium_of_particles` — the force table

- `apparatus: 'force_table'`, `view: 'top_down'`, three strings.
- Core claim: `ΣF = 0` for concurrent forces. The resultant arrow collapsing to a dot IS the claim.
- The state that earns the concept: sweep one string's angle with `param_ramp` and watch BOTH other
  tensions change while the ring holds centre — balance is a live condition, not a lucky pose.
- The high-value teacher beat: swing two support cables toward horizontal and both tensions climb
  without limit. That is why cables sag, why a tightrope pulls so hard, why a rope can never be
  pulled perfectly straight. Universal anchor per Rule 35 (a hanging sign, a washing line) —
  no country-specific content.
- Explore: all three hanging masses and two angles live.

### `uniform_circular_motion` — the whirl

- `apparatus: 'whirl'`. Start `geometry: 'flat'` (pure centripetal, cleanest), then `'conical'`
  (the exam case, θ solved).
- Core claim: circular motion REQUIRES a net inward force; it is not a new kind of force, it is what
  the tension is doing. `readouts: ['T','v','omega','r','a_c']`.
- Rule 16a misconception beat: `release` — cut the string, the bob departs along the **tangent,
  straight, not outward**, with `ghost_circle` making the abandoned path visible. No outward force is
  ever drawn, because none exists.
- Conical state: raise `ω` and watch θ open up, with `T = mω²L` climbing — the string angle is
  solved, so the picture cannot lie.
- Explore: `omega`, `L`, `bob_mass` live; the `ω²L > g` clamp must be honest at the slider.

**Nothing above requires a renderer edit beyond this spec.** If authoring discovers one, that is the
under-generalization signal — STOP and re-scope rather than extending per concept.

---

## 8. Risk note (recorded before the build, not after)

The `force_table` branch is a damped 2-D particle solver — low risk, and it will land cleanly.

The `whirl` branch is the genuinely new part of this chapter: a constrained bob integrated in 3-D,
with a solved cone angle and a constraint-removal event. If it fights the build across two
`field3d-surgeon` attempts, the correct outcome is to **seal `equilibrium_of_particles` standalone and
PARK `uniform_circular_motion`** with the engine finding as the named cause — not to weaken the
cut-the-string beat or author around a missing cone. Parking is the founder-blessed outcome; a
degraded beat is not.
