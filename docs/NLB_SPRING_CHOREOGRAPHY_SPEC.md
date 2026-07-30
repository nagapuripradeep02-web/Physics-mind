# `newtons_laws_body` — realistic spring choreography

> Founder-approved 2026-07-30, from a screen recording of `newton_third_law`. Applies to EVERY state
> that uses a spring, in every concept, now and later.

## The founder's finding

> "the spring is really fast. You need to slow down. You are not showing real spring compressing and
> releasing it… It should be slow and perfect and realistic in every state wherever you use the
> spring. Make it high value — it should look like a real spring doing the things."

Confirmed on the recording: at t≈8 s the compressed coil, both arrows and the live HUD are all on
screen; by t≈10 s the carts have separated and the spring, arrows and readings are gone. The entire
interaction is a **flash**.

## Diagnosis — the coil geometry is fine, the TIMING is wrong

The coil is already honest geometry: a `TubeGeometry` helix (`NLB_SPRING_COILS = 8`,
`NLB_SPRING_WIRE_R = 0.022`) whose pitch is rebuilt as its length changes
(`NLB_SPRING_LEN_Q = 0.02` quantum). Nothing about the mesh needs replacing.

Three real defects, all timing/choreography:

1. **There is no compression stroke.** The state opens with the spring ALREADY compressed. A student
   never sees it being loaded, so the stored energy has no visible origin. This is the biggest miss —
   "you are not showing real spring compressing".
2. **The release is 420 ms.** That is the true physics (`t = sqrt(2·stroke/a_rel)`; 30 N on 4+12 kg
   over the 0.88 m stroke), and it cannot be slowed by authoring: a 2-second contact would need about
   1.3 N, far below the arrow-length floor that keeps a force readable.
3. **No ring.** A real spring oscillates briefly after it lets go. Ours vanishes the instant the gap
   passes natural length.

## The resolution: a declared slow-motion beat

Physics cannot give us large forces AND a slow release at the same time — which is exactly why every
real physics lesson films fast events in slow motion. So we do the same, and we LABEL it.

### `spring_action` — the full realistic cycle

New per-state block, replacing the bare `push_off` timing for spring states:

```ts
spring_action?: {
    approach_ms?: number;   // carts converge, coil at NATURAL length, no force yet
    compress_ms: number;    // coil VISIBLY compresses to NLB_SPRING_COMPRESS_FRAC; force ramps in
    hold_ms?: number;       // latched and loaded: coil compressed, both arrows at full magnitude,
                            //   HUD live. This is the beat a teacher talks over.
    slow_factor?: number;   // playback slowdown for the RELEASE only, default 6.
                            //   The 420 ms physical release plays over ~2.5 s of wall time.
    ring?: boolean;         // brief damped oscillation of the coil after it lets go (default true)
};
```

Sequence: `approach → compress → hold → release (slowed) → coast → re-arm` (the existing
`repeat_every_ms` still drives the cycle).

### How `slow_factor` must be implemented — this is the load-bearing constraint

It is a **dt multiplier on the integrator during the release window only**, NOT a clock hack:

```js
var dtPhysics = inSlowWindow ? (dt / slowFactor) : dt;
```

- Rule 36 is preserved: the step stays strictly linear in dt (`v += a·dtPhysics; s += v·dtPhysics`),
  there is no internal sub-stepping, no literal `0.016`, and no second clock. Under
  `SET_TIME_FREEZE`, `dt = 0`, so `dtPhysics = 0` and frozen frames stay byte-identical.
- The HUD keeps showing the **true physical values** (`F = 30.00 N`, `a = 7.50 m/s²`) — we are slowing
  the *playback*, not the physics. Never scale the reported numbers.
- **Rule 24/34 honesty requirement:** while the slow window is active, the canvas shows a small
  badge — `slow motion ×6` — so a student never mistakes a slowed release for a small acceleration.
  Without that label this change would be teaching a falsehood; with it, it is standard practice.
- Rule 37: in a `mode: 'sandbox'` state there is no slow window at all — the teacher's sandbox runs
  in real time, and a trusted slider or drag cancels any in-progress choreography (same
  `PM_nlbSweepSeized` / `PM_nlbBodyDragged` flags `idle_auto_sweep`, `param_ramp` and the repeat
  cycle already use).

### `ring` — the finishing touch

After release, once the carts pass natural length, the coil currently hides instantly. Instead: let it
oscillate about natural length with a short damped decay (a few tenths of a second of real time,
amplitude decaying to zero) and THEN hide. Purely cosmetic — it must never feed the integrator, and
never move a cart.

## Suggested default choreography

For the `newton_third_law` states (30 N, 4–12 kg, `length_m = 10`):

| Phase | Duration | What the student sees |
|---|---|---|
| approach | 600 ms | two carts drift together, coil at full natural length |
| compress | 1600 ms | coil visibly bunches, pitch tightens, arrows grow in |
| hold | 1200 ms | loaded and latched — the beat to narrate over |
| release | ~2500 ms wall (420 ms real, `slow_factor: 6`) | coil springs open, carts accelerate apart |
| coast + ring | remainder | carts separate 3:1, coil rings and fades |

That is roughly a 7-second cycle — so `repeat_every_ms` needs raising from 2600 to about **7200** for
these states, giving one full, legible, realistic cycle per narration beat instead of four flashes.

## Verify

`check:renderer-syntax` → `tsc --noEmit` (0) → `validate:concepts` → re-seed → `visual:eyes` on
`newton_third_law`, and confirm by eye that a mid-compress frame and a mid-release frame BOTH exist
and both show the coil at an intermediate length. Regression EYE on `electric_flux` + `magnetic_flux`.

Rule 36b full-fleet re-verify is NOT triggered: `dtPhysics` is a local scale inside the nlb frame
function and never touches the shared `animate()` / `dtStep` / `__pmSteps` clock.
