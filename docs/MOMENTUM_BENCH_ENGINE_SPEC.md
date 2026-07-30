# `momentum_bench` — the impulse / momentum field_3d engine spec

> Founder-approved 2026-07-30. ONE new `scenario_type` in `src/lib/renderers/field_3d_renderer.ts`
> that serves BOTH Laws of Motion momentum concepts (`impulse`, `conservation_of_momentum`) as pure
> JSON configuration.
>
> **Why one scenario for two visibly different apparatus.** On Ch.7 and Ch.8 brand-new renderer
> scenario work consumed 34–42% of the whole chapter budget — the single largest cost in the system,
> and Ch.7's failure mode was EXTENDING THE ENGINE PER CONCEPT (28 engine commits). A ball hitting a
> wall and two carts colliding on a track are the SAME code: bodies on a line, a compliant contact
> model, momentum instrumentation. The wall is a body with infinite mass. The variation is entirely
> parametric.
>
> **The success criterion for this build: `conservation_of_momentum` must require ZERO renderer
> edits after `impulse` seals.** If it forces a renderer change, this design under-generalized —
> STOP and re-scope rather than extending the engine per concept.

Internal code prefix: `mb`. Per-state config key: `momentum_bench`. Follow `newtons_laws_body`
(prefix `nlb`, same file) as the structural template — it is the closest mechanics analogue, it
already solves the force-arrow overlay / HUD / slider / trusted-drag problems, and its
`spring_action` slow-motion discipline is REUSED here verbatim (see §5).

---

## 1. Per-state JSON config surface

```ts
momentum_bench?: {
    mode?: 'single_body' | 'wall_impact' | 'collision' | 'explosion' | 'sandbox';

    track?: {
        length_m?: number;         // visible half-length, default 6
        mu_k?: number;             // default 0 — a genuinely low-friction track.
                                   // NON-ZERO IS A TEACHING TOOL, NOT A DEFECT: with friction the
                                   // track has an external force and Σp is NOT conserved. Any state
                                   // that sets mu_k > 0 is asserting exactly that.
    };

    // 1..3 bodies. A `fixed` body is the wall (see §2).
    bodies: Array<{
        id: string;                        // stable, e.g. "A" | "B" | "WALL"
        label?: string;                    // Unicode on-canvas label, e.g. "m₁"
        mass_kg: number;
        color?: string;
        shape?: 'cart' | 'ball' | 'wall';  // presentation only; 'wall' implied by fixed
        initial_position_m: number;        // signed, along the shared track axis
        initial_velocity_mps?: number;
        fixed?: boolean;                   // infinite effective mass — never integrated, but REAL:
                                           // it takes and exerts contact forces and its arrows draw
                                           // at full brightness. Semantics identical to nlb's
                                           // `fixed` flag; reuse that code path, do not re-derive.
    }>;

    // The interaction. Presence of this block is what makes a contact possible at all;
    // omit it for a single_body state (nothing to collide with).
    contact?: {
        between: [string, string];         // the two body ids that may touch
        stiffness_N_per_m: number;         // k — sets BOTH peak force and contact duration (§2)
        damping_Ns_per_m?: number;         // c — 0 = perfectly elastic, high = inelastic
        sticks?: boolean;                  // perfectly inelastic latch: on first contact the pair
                                           // is constrained to a common velocity and STAYS joined.
                                           // Mutually exclusive with `preload_m`.
        preload_m?: number;                // EXPLOSION: the contact starts compressed by this much
                                           // and releases. Mutually exclusive with `sticks`.
        natural_length_m?: number;         // rest length of the compliant element, default 0.4
        label?: string;                    // e.g. "steel bumper" | "foam pad" | "velcro"
    };

    // Rule 33d instruments. All are LIVE numeric readings, never decorative.
    readouts?: Array<'v' | 'p' | 'sum_p' | 'KE' | 'sum_KE' | 'F_contact' | 'J'>;

    // The force–time trace. THIS IS THE INSTRUMENT THAT TEACHES IMPULSE — the shaded area IS
    // the impulse, so the fill is the point, not decoration. One trace per contact.
    force_trace?: {
        show: boolean;
        fill_area?: boolean;               // shade ∫F dt, default true
        peak_marker?: boolean;             // annotate F_peak, default true
        window_ms?: number;                // x-axis span; default = the state's reveal window
        compare_with_previous_lane?: boolean;  // two-lane states: draw BOTH traces on one axis so
                                               // the equal areas are directly comparable
    };

    // Two independent lanes of the SAME experiment, side by side, sharing one clock.
    // This is how `impulse` shows same-Δp/different-stiffness without a confound.
    lanes?: Array<{
        id: string;
        offset_z_m: number;                // lateral offset so lanes never occlude
        bodies: string[];                  // body ids belonging to this lane
        contact_override?: Partial<{ stiffness_N_per_m: number; damping_Ns_per_m: number; label: string }>;
    }>;

    glow_focal?: string;                   // EXACTLY ONE per state (Rule 32e)
    controls_visible?: Array<'m1' | 'm2' | 'v1' | 'v2' | 'k' | 'c'>;   // Rule 31 contextual controls
    trusted_drag_seizes?: boolean;         // sandbox state only
    slow_window?: {                        // §5 — MANDATORY on any state with a contact
        slow_factor: number;               // dt multiplier during contact ONLY
        badge?: boolean;                   // default true — the honesty requirement
    };
    repeat_every_ms?: number;              // re-arm the whole interaction on this cycle
    param_ramp?: { param: 'v1' | 'k' | 'm2'; from: number; to: number; start_ms?: number; end_ms: number };
    phases?: Array<{ id: string; at_ms?: number; until_ms?: number | null; glow_focal?: string }>;
};
```

`explorer_id` reuses the existing top-level `Field3DConfig.explorer_id`, defaulting to
`"momentum_bench_explorer"` via the standard `config.explorer_id || "<default>"` idiom.

---

## 2. Physics core — one compliant-contact integrator

Fixed-step, Rule 36: accumulate real elapsed ms, run 0–3 steps of `h = 1/60 s`, forced to 1 step
under `SET_TIME_FREEZE`. Every expression below is strictly linear in `dt`.

Per body, `s` = signed position along the shared track axis, `v` = signed velocity.

### Contact force

Let the two contact bodies be `i`, `j` with facing-face separation `d`. Overlap
`δ = max(0, L_natural − d)`, closing rate `δ̇ = −(d)/dt` evaluated from the current velocities.

```
δ > 0  ⟹  F_contact = k·δ + c·δ̇        (compression only, never tensile — the bodies push,
                                          they do not pull; clamp F_contact ≥ 0 unless `sticks`)
δ = 0  ⟹  F_contact = 0
```

The force is applied **equal and opposite** to the two bodies. This is Newton's third law holding by
construction, and it is why momentum conservation comes out as a RESULT rather than an assertion:

```
dp_i/dt = +F_contact,  dp_j/dt = −F_contact   ⟹   d(p_i + p_j)/dt = 0
```

**Do NOT hard-code the textbook collision outcome formulas** (`v₁' = ((m₁−m₂)v₁ + 2m₂v₂)/(m₁+m₂)`
and friends). They must EMERGE from the integrator. If they do not reproduce to ~0.5%, that is a
defect in the integrator and must be fixed there — never patched by writing the closed form in.
The bring-up harness (§6) asserts exactly this.

### Body update

```
a_i = (ΣF_i) / m_i                    // ΣF_i = contact force ± track friction
v_i += a_i · dt
s_i += v_i · dt
```

A `fixed: true` body is SKIPPED by the integrator entirely (`v` and `s` never change) but still
receives and exerts its half of the contact force, and its arrows and `F_contact` readout draw
normally. This is what makes the wall-impact honest: the pair is exactly equal and opposite, the
wall's acceleration is simply zero.

Track friction, when `mu_k > 0`: `F_fric_i = −sign(v_i)·mu_k·m_i·g`, applied only while `|v_i| > STOP_EPS_V`
(0.01 m/s). This is the ONLY external force in the scenario and the only way Σp changes.

### `sticks` (perfectly inelastic)

On the first frame with `δ > 0`, latch the pair: thereafter integrate them as one body of mass
`m_i + m_j` at the common velocity `(m_i v_i + m_j v_j)/(m_i + m_j)` — which is exactly what
momentum conservation demands, so the latch is not a cheat, it is the constraint. Kinetic energy
drops by `½·μ·(v_i − v_j)²` with `μ = m_i m_j/(m_i + m_j)`; the `KE` readout must SHOW that drop.

### `preload_m` (explosion)

The contact starts compressed by `preload_m` with both bodies at rest, and releases from `t = 0`
(or from `contact_from_ms`). Σp = 0 before and after, so the speeds come out in inverse mass ratio.

### Closed-form results the engine must reproduce (these are the harness assertions)

For a linear undamped contact (`c = 0`) between masses `m_i`, `m_j` with reduced mass
`μ = m_i m_j/(m_i + m_j)`:

| Quantity | Closed form | Why it matters |
|---|---|---|
| Contact duration | `t_c = π·√(μ/k)` | **Independent of impact speed** — stiffness alone sets it |
| Peak force | `F_peak = Δv·√(k·μ)` | Scales as `√k` |
| Impulse | `J = ∫F dt = μ·Δv_rel` (= `m·Δv` for a wall) | The AREA — invariant to `k` |

`F_peak · t_c = π·J/2` for the half-sine pulse, so **stiffening the contact raises the peak and
shortens the duration in exact compensation, leaving the area fixed.** That identity is the entire
`impulse` concept, and it is a consequence of the integrator, not a claim in a caption.

For a `fixed` wall, drop the `1/m` term of the wall: `μ → m_ball`.

---

## 3. Rendering

- **Track:** a low slab along the x axis, `length_m` half-length each way. Lanes offset in z.
- **Bodies:** `cart` = the existing nlb cart mesh (reuse, do not author a new one); `ball` = a
  sphere of radius 0.28 m; `wall` = the nlb wall-slab mesh (reuse).
- **Contact element:** drawn between the two facing faces, compressing visibly with `δ`. A stiff
  contact barely deforms; a soft one deforms a lot — the DEFORMATION IS THE VISIBLE CAUSE of the
  long contact time, and without it the sim asserts softness rather than showing it. This is the
  `newton_third_law` lesson applied here: the cause must be a visible object.
- **Force arrows:** equal and opposite on the two bodies during contact, length ∝ `F_contact`.
  Reuse nlb's arrow overlay and its ~15 N length-floor behaviour (known residual, documented).
- **Force trace:** a 2-D overlay panel, Unicode axis labels (`F (N)`, `t (ms)`), the area under the
  curve filled. In a two-lane state both traces share ONE axis pair so the areas are directly
  comparable. Rule 34: this is the state's ONE instrument surface; do not also print `J = FΔt` as a
  second formula surface — the formula overlay carries that, once.
- **Momentum ledger:** a compact value-only HUD — `p₁`, `p₂`, `Σp`, and `KE` when requested. Rule 34b:
  values only (`Σp = 4.00 kg·m/s`), never the symbolic derivation. Must clear the review chrome
  (`top: 52px`+, Rule 34d).

---

## 4. Rule compliance notes for the builder

- **Rule 36 (frame-rate independence):** every integrator expression is linear in `dt`; no literal
  `0.016`; no accumulated phase. `SET_TIME_FREEZE` forces one step, so frozen baselines are
  byte-identical by construction.
- **Rule 37 (explore state runs continuously):** the sandbox state must never freeze. `repeat_every_ms`
  re-arms the interaction so the bench keeps demonstrating; a trusted drag seizes and cancels it.
- **Rule 29 (emphasis is brightness):** no zoom, no bulge. Arrow LENGTH changes only when the real
  force does.
- **Rule 32e:** exactly one `glow_focal` at any instant.
- **Rule 39f:** the ⚙ teacher widget panel auto-discovers overlays via the clean-mode conventions —
  statically-authored `.pm_hud` overlays, dynamically-created inline `position:fixed` panels, and
  `div[id$="_row"]` slider rows. Follow those conventions and ⚙ works for free; no per-concept
  authoring.
- **New-scenario checklist (field_3d):** register in `deriveStateMeta.ts` (reveal keys + max reveal
  ms, including `repeat_every_ms` and `slow_window`), add to the `#sliders` exclusion chain, NO
  backticks anywhere in the emitted renderer template, cue gates evaluated at `t = 0`, and declare
  `__PM_supportsTimePin`.

---

## 5. The slow-motion honesty requirement (MANDATORY, not optional)

A real steel impact lasts a few milliseconds. At real speed it is invisible; slowed silently it
teaches a falsehood about how long forces act.

So **any state with a contact must declare `slow_window`**, and while that window is open the canvas
shows a `slow motion ×N` badge. The HUD keeps reporting the TRUE physical values — true peak force,
true contact duration in ms — while only the PLAYBACK is slowed. `slow_factor` is a `dt` MULTIPLIER
on the integrator during the contact window only (`dtPhysics = h / S`): the step stays strictly
linear in `dt`, there is no sub-stepping and no second clock, and under `SET_TIME_FREEZE`
`dt = 0 ⟹ dtPhysics = 0`.

This is the identical mechanism and the identical honesty rule as `nlb`'s `spring_action`
(`#nlb_slowmo`). **Reuse that code path** rather than writing a second slow-motion implementation.

---

## 6. Bring-up harness (must pass before ANY concept authoring starts)

`src/scripts/_scratch_mb_seams.ts`, modelled on `_scratch_nlb_seams.ts`. Assertions:

1. **Momentum conservation:** for elastic, inelastic and explosion fixtures, `Σp` constant to 1e-9
   across the whole run (with `mu_k = 0`).
2. **Emergent closed forms:** elastic two-body outcome matches `v₁' = ((m₁−m₂)v₁ + 2m₂v₂)/(m₁+m₂)`
   to within 0.5% — WITHOUT that formula appearing in the renderer source (grep-assert it does not).
3. **Impulse identity:** `∫F dt` (numerically integrated from the trace samples) equals `m·Δv` to
   within 0.5%, for both a stiff and a soft contact.
4. **The impulse lesson:** across a 10× stiffness change at fixed impact speed, the two areas agree
   to within 1% while `F_peak` differs by ≳3×. **This is the assertion that proves the concept is
   teachable at all** — if it fails, `impulse` cannot be authored.
5. **Contact duration:** `t_c` matches `π√(μ/k)` to within 2% and is invariant to impact speed.
6. **Inelastic KE drop:** matches `½μ(Δv)²` to within 0.5%; `Σp` unchanged.
7. **Wall case:** a `fixed` body never moves, its arrow draws at full brightness, and the ball's
   `|Δp| = 2mv` for an elastic wall bounce.
8. **Rule 36:** N steps of `0.016` ≡ 1 step of `0.016·N` to machine precision; frozen frame
   byte-identical.
9. **Friction case:** with `mu_k > 0`, `Σp` decays monotonically (proving the engine does not
   fake conservation when there IS an external force).

Total-distance-travelled style assertions are preferred over instantaneous samples wherever a
sample could land on a designed-zero instant — see the lom-e SEAM J lesson.

---

## 7. Verify chain (per CHAPTER_LOOP.md §3b — ALL must pass before any engine commit)

1. `npm run check:renderer-syntax` → `npx tsc --noEmit` → `npm run validate:concepts`
2. Re-seed the target concept's `simulation_cache`, then `npm run visual:eyes -- <target>`
3. Regression sample (Amendment 5 disjoint pair for this tray): **`gauss_law_sphere` + `coulombs_law`**
   — re-seed + EYE. Any H2 diff vs locked baselines = regression = FAIL.
4. Clock guard (Rule 36b): the `slow_window` touches `dtPhysics`, so if the diff reaches
   `__pmSteps`/`dtStep`, the FULL fleet sweep runs immediately, not at chapter end.
5. On failure: surgical rollback of engine files only, attempt 2 with the failure evidence added.
   Second failure → degrade to the founder's queue. **Never leave the build broken.**

ONE `bug_class` per dispatch (Amendment 4). Per-dispatch ceiling ~100 tool calls / ~45 min; on
hitting it, write `engine_handoff.md` and exit for a fresh dispatch.

---

## 8. What the two concepts need from this engine

Written here so the builder can see the whole demand surface at once, and so the architect can be
handed HARD FACTS instead of designing against wishful config.

### `impulse` — one ball, one wall

- `mode: 'wall_impact'`, bodies = ball + `fixed` wall, `shape: 'ball'` / `'wall'`.
- The NCERT beat: elastic rebound, `|Δp| = 2mv` — needs `readouts: ['v','p','J','F_contact']`.
- The payoff beat: TWO LANES, same ball, same speed, `stiffness_N_per_m` differing ~10× (rigid wall
  vs springy padded wall), both rebounding — so `Δp` is identical by construction and only the
  contact stiffness varies. `force_trace.compare_with_previous_lane: true` puts both traces on one
  axis: **equal areas, very different peaks.**
- `slow_window` mandatory. Anchor (Rule 35, universal): airbag / crumple zone / bending your knees
  when you land / foam in a parcel.

### `conservation_of_momentum` — two carts, no wall

- `mode: 'collision'` and `'explosion'`, bodies = two carts, no `fixed` body anywhere.
- Elastic (`c = 0`, magnetic bumpers) → Σp constant and NONZERO. This is the state the concept
  exists for; the `Σp = 0` explosion alone teaches symmetry, not conservation.
- Inelastic (`sticks: true`, velcro) → Σp identical, `KE` visibly drops. Needs
  `readouts: ['v','p','sum_p','KE','sum_KE']`.
- Explosion (`preload_m`) → Σp = 0, speeds in inverse mass ratio. Anchor: a person on a skateboard
  throwing a heavy ball; a rocket. **No firearm** (founder decision 2026-07-30: the 400:1 rifle/bullet
  speed ratio cannot be drawn honestly at one scale, and the product ships to schools internationally).
- Explore: `m1`, `m2`, `v1`, `v2` and the interaction type all live.

**Nothing above requires a renderer edit beyond this spec.** If authoring discovers one, that is the
under-generalization signal — STOP and re-scope.
