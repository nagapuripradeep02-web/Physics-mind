# `newtons_laws_body` extension — the push-off apparatus (Newton's third law)

> Founder-approved 2026-07-29. An EXTENSION to the existing `newtons_laws_body` scenario, NOT a new
> `scenario_type`. Adds the missing capability that makes a real third-law lesson possible.

## Why

The current `newton_third_law` fails to teach, and the root cause is not polish. Its states are two
300 kg blocks with 30 N arrows and `action_reaction: engaged` — but **the interaction itself is never
on screen.** Nothing touches, nothing connects the two bodies, and the forces appear from nowhere.
Newton's third law is a statement about ONE interaction between TWO bodies; a sim that draws two
separate blocks with asserted arrows shows a student "two blocks with labels", not "these two push
each other". (Its motion is also nearly invisible: 30 N on 300 kg is a = 0.1 m/s².)

The fix is to put the **cause on screen as a physical object**: a compressed spring between two carts
that visibly releases, driving them apart at the same instant.

## The teaching target

Three specific student beliefs must be defeated:

1. *"The heavier / stronger one pushes harder."* → the two arrows stay PIXEL-IDENTICAL while the
   accelerations go 3:1. That single image is the lesson.
2. *"Equal and opposite means they cancel, so nothing should move."* → the pair acts on DIFFERENT
   bodies; isolate each cart's FBD.
3. *"If nothing moves, there was no force."* → push a wall: same pair, no visible motion, because the
   other body is the Earth.

## What to add (three capabilities, one cohesive seam)

### 1. `push_off` — a contact-then-release force phase

New per-state block, alongside the existing `action_reaction`:

```ts
push_off?: {
    body_a_id: string;
    body_b_id: string;
    force_N: number;          // magnitude applied to EACH body, equal and opposite, during contact
    release_at_ms?: number;   // contact ENDS here; default 0 = released immediately at state start
    contact_from_ms?: number; // contact BEGINS here; default 0
};
```

Semantics — this is the whole physics change:

- While `contact_from_ms <= t < release_at_ms`: body_a gets `+force_N` along its axis and body_b gets
  `-force_N`. **The engine enforces the equality** (same magnitude, opposite sign) exactly the way
  `action_reaction` already does — never two hand-authored numbers.
- At `t >= release_at_ms`: BOTH applied forces become 0. The carts then coast at whatever velocity
  they reached (μ = 0 on a low-friction track), so the *result* of the interaction persists visibly
  long after the interaction ends. That separation is what sells the simultaneity.
- Before `contact_from_ms`: both forces 0, carts at rest.

Rule 36 is unaffected: this only gates WHICH force value the existing integrator sees per frame. Do
not add a second clock — read the state-local `eng.t_ms` that `nlbResetTrajectory()` already rebases.
Rule 37: in a `mode: 'sandbox'` state the ramp/gate must not freeze the explore run.

### 2. `spring` — the visible interaction object

```ts
spring?: {
    between: [string, string];   // the two body ids
    compressed?: boolean;        // render state; engine drives it from the push_off phase
    coils?: number;              // default 8
};
```

Geometry: a coil/plunger drawn BETWEEN the two bodies' faces, following them every frame from the
same `nlbSetBodyPosition` funnel the arrows use (no per-frame follow hook, no new clock). It renders
COMPRESSED before release and extends to natural length at release, then hides once the carts
separate beyond its natural length. It is apparatus, so per the 2026-07-29 founder review it is
brighten-only — it must never dim to `GLOW_DIM_OPACITY`.

### 3. `fixed` — the wall / Earth-anchored body

Add to the existing per-body config:

```ts
fixed?: boolean;   // body never integrates: infinite effective mass (the wall / the Earth)
```

A `fixed` body is skipped by the integrator entirely (like `ghost`, but it is REAL — it takes and
exerts forces, and its arrows draw normally). This is what makes the wall state honest: the pair is
still equal and opposite, the wall's acceleration is simply zero because its mass is effectively
infinite. Render it as a wall slab rather than a cart when `fixed` is set.

## The 5-state arc the JSON will author

| State | Setup | Beat |
|---|---|---|
| 1 | equal carts, `push_off` released early | one push, two motions, same instant |
| 2 | same `force_N`, masses 1:3 | arrows IDENTICAL, accelerations 3:1 |
| 3 | cart vs `fixed: true` wall | same pair, no visible motion |
| 4 | `ghost` isolation of each cart's FBD | the pair lives on DIFFERENT bodies |
| 5 | sandbox: mass-ratio + force sliders | — |

## Authoring constraints (learned this chapter)

- Keep the smallest on-screen force **≥ 15 N** or the arrow-length floor collapses it to a stub.
- Pick masses so the acceleration is actually VISIBLE — the old 300 kg / 30 N gave a = 0.1 m/s² and
  read as static. Target carts of a few kg with tens of newtons.
- Two independent bodies are already lane-separated in z by `nlbBodyLaneZ`; for a push-off they must
  share ONE lane (they collide head-on), so `push_off` bodies return lane 0.

## Verify chain

`npm run check:renderer-syntax` → `npx tsc --noEmit` (0) → `npm run validate:concepts` → re-seed →
`npm run visual:eyes -- newton_third_law` → regression EYE on `electric_flux` + `magnetic_flux`.

Rule 36b full-fleet re-verify is NOT triggered: this adds force-gating and geometry, and never
touches the shared `animate()` / `dtStep` / `__pmSteps` clock.
