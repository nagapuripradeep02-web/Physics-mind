# push-off apparatus — engine seam report

> 2026-07-29. Engine-only session for `docs/NLB_PUSH_OFF_SPEC.md`. NO concept JSON was authored.
> Two `field3d-surgeon` dispatches, one commit per seam, on `feat/lom-a` in `C:\Tutor\physics-mind-lom-a`.

| Seam | Commit | What |
|---|---|---|
| A | `d9d07a0` | `push_off` contact→release force phase + `fixed` body (integrator + wall slab) |
| B | `208a8ba` | `spring` geometry + glow (brighten-only) + head-on lane wiring |

Verify chain green at HEAD (`208a8ba`): `check:renderer-syntax` OK (field_3d 2198 KB, particle_field 220 KB) ·
`npx tsc --noEmit` 0 errors · `validate:concepts` **127 PASS / 0 FAIL**.

Regression (shared-renderer leakage check): `cache:clear:scoped electric_flux` → re-seed
(`_seed_electric_flux_cache.ts`; the scoped clear removes the cached sim, so a re-seed is required before
THE EYE) → `visual:eyes -- electric_flux` = **62 deterministic checks, 62 passed, 0 failed, $0.00**.
`eye-walker` read all 211 frames: **NO REGRESSION** — zero stray meshes, no brightness anomaly, no z-shift
or mis-framing, no overlay leakage, zero candidate `engine_bug_queue` rows.

---

## 1. What landed

### `push_off` — the contact-then-release phase (seam A)

`nlbRunPushOff(nlb, eng)` sits at the **input stage** of `updateNewtonsLawsBodyFrame()`, ahead of the
`action_reaction` mirror and both integrator branches — the same placement `nlbRunIdleSweep` and
`nlbRunParamRamp` use:

```
eng.t_ms += h*1000 → nlbRunPhases → nlbRunPushOff → action_reaction mirror
                   → nlbRunIdleSweep → nlbRunParamRamp → Branch A / Branch B → arrows, ropes
```

The equality is **unrepresentable-if-broken**: both bodies are written from one expression every frame,
`bA.F_applied = F; bB.F_applied = -F`. There is no second authored number to drift from, and any slider
or stale value is overwritten on the next tick.

- Clock: the state-local `eng.t_ms` that `nlbResetTrajectory()` already rebases. No second clock, no
  accumulator, no latch. Pure closed form → **Rule 36** holds (linear in dt; under `SET_TIME_FREEZE`
  `dt = 0` leaves `t_ms` unchanged and the gate recomputes the identical force, so frozen frames are
  byte-stable by construction).
- **Rule 37 / sandbox:** the gate is INERT in a `mode: 'sandbox'` state (`if (eng.mode === "sandbox") return;`
  — the same carve-out `param_ramp` makes). No release instant can have "already passed" and zero the
  forces out from under the teacher; the sandbox free-runs. A sandbox that wants the equal-and-opposite
  guarantee authors `action_reaction`, whose mirror still runs there.
- `eng.push_off_contact` is published each frame as a **derived read** for the spring — never a second
  source of truth for force.

### `fixed` — the wall / Earth-anchored body (seam A)

- **Branch A:** `a = 0`, `v = 0`, `s` pinned; `N` computed normally; `f = -(F_applied + gravAlong)` (the
  anchor reaction); `F_net = 0`; readouts still written. It is **not** skipped by `nlbDriveArrows` (only
  `ghost` is), so its arrows draw at full magnitude and full brightness — the wall's arrow is
  pixel-identical to the cart's, which is the whole point of the wall state.
- **Branch B (pulley):** a `fixed` body anchors the whole string (`anchoredB` ORs into `stuckB` → `a = 0`,
  `v = 0`, nothing moves). Physically correct for an inextensible string tied to an immovable body, and
  the safe choice — dropping it out of the coupled set would silently break the constraint.
- Never an m/F slider target, never pickable/draggable.
- Renders as a **wall slab** (`BoxGeometry(0.275, 1.76, 1.43)` world units), geometry translated so the
  slab's base lands exactly where a cart's does. `nlbSetBodyPosition` — the single placement funnel every
  arrow origin, label and pick proxy follows — is untouched.

### `spring` — the visible interaction object (seam B)

- One mesh, built in `buildNewtonsLawsBody()` step 2d in the un-rotated `world` group beside the ropes.
- **Carried from the one funnel:** `nlbFitSpring()` is called from the last line of `nlbSetBodyPosition`,
  the same path the arrows/pick proxies use (build seed, integrator writeback, slider write, drag). It
  re-reads both bodies, so the second of the pair's two calls per tick settles the geometry. No per-frame
  follow hook, no new clock, no second placement path. Two extra calls exist only for entry/rewind
  determinism (`applyNewtonsLawsBodyState`, `nlbResetTrajectory`), beside the existing `nlbFitRopes()`.
- **Compress / extend / hide**, all derived from current positions + `eng.push_off_contact`:
  - `gap = |pB − pA| − halfExtent(A) − halfExtent(B)` from `nlbBodyWorldPos` (theta rotation and lane
    offset already folded in — no theta branch).
  - `target` = compressed length when compressed-now, else natural. Compressed-now = `eng.push_off_contact`
    when the state declares `push_off` and `mode !== 'sandbox'`; otherwise the authored `spring.compressed`
    (so the authored flag is never a dead key).
  - `drawn = min(gap, target)` — it can never be longer than the gap it sits in, and it extends *with*
    the carts during contact.
  - **hides** when `gap > natural + 0.02`, i.e. once the carts separate past natural length (also when
    either body is absent/invisible, or the state declares no `spring`).
- **Rule 36:** geometry is rebuilt (not `scale.y`-stretched — that squashes the wire into a ribbon) at a
  **quantised** length, `round(drawn/0.02)*0.02`, a pure function of position. Under `SET_TIME_FREEZE`
  positions do not change → same quantum → no rebuild → identical position/quaternion re-written.
- **Glow:** key `nlb_spring` (both `userData.id` and `userData.elementType`, so `glow_focal: "nlb_spring"`
  matches either arm of `nlbApplyGlow`). Added to the 2026-07-29 `solidApparatus` brighten-only list. Proof
  it can never dim: `solidApparatus` is passed as `applyGlowEmphasis`'s `brightenOnly` argument →
  `touchOp = false` → **every** opacity write in that function is `if (touchOp)`-guarded, including the peer
  branch `else if (touchOp) { m.opacity = GLOW_DIM_OPACITY; }`. `GLOW_DIM_OPACITY` is unreachable for it.

### Lane — head-on instead of side-by-side (seam B)

Two guards at the top of `nlbBodyLaneZ`, both per-state facts:

1. `if (eng.push_off) return 0;` — every body in a push-off state shares one lane.
2. `if (b && b.fixed) return 0;` — a state containing a wall slab is head-on too.

Everything else takes the byte-identical original path (pulley early-return, hanging/ghost filter,
`lanes.length < 2 → 0`, and the `(k − (n−1)/2) * NLB_LANE_GAP` stagger for side-by-side compares).
No existing concept JSON authors `push_off`, `fixed`, or an nlb `spring`, so both conditions are
statically false in every state of `free_body_diagram`, `connected_bodies` and `block_on_incline` —
zero pixels can move in any locked baseline.

---

## 2. The JSON config surface an author should now use

On the per-state `newtons_laws_body` block, alongside the existing `action_reaction`:

```ts
push_off?: {
    body_a_id: string;
    body_b_id: string;
    force_N: number;          // magnitude applied to EACH body, equal and opposite, during contact
    release_at_ms?: number;   // contact ENDS here; default 0 = released immediately
    contact_from_ms?: number; // contact BEGINS here; default 0
};

spring?: {
    between: [string, string];   // the two body ids
    compressed?: boolean;        // render state; the ENGINE drives it from the push_off phase
    coils?: number;              // default 8
};
```

On each entry of the existing `bodies: Array<{ … }>`:

```ts
fixed?: boolean;   // wall / Earth: never integrates, but takes AND exerts forces; renders as a wall slab
```

### Authoring contract — NOT optional

A spring is a real object with a real length. Natural length **1.6 m**, compressed length **0.72 m**
(apparatus constants, like the cart size — not authorable). Three authored numbers must agree with it:

1. **Position.** `|s_a − s_b| = 0.72 + half-width of each body` (0.55 m per cart, 0.275 m for a `fixed`
   wall slab). Cart pair → `|s_a − s_b| = 1.82 m` (e.g. `+0.91` / `−0.91`). Cart vs wall → `1.545 m`.
2. **Order.** `push_off` gives `body_a_id` **+**`force_N` along +s, so **body_a is the body on the positive
   side** — reversed, the pair drives together instead of apart.
3. **Timing.** `release_at_ms = 1000 · sqrt( 1.76 / (force_N · (1/m_a + 1/m_b)) )`, dropping the `1/m` term
   of a `fixed` body. Worked values: 30 N on 2+2 kg → **242 ms** · 30 N on 2+6 kg → **297 ms** ·
   30 N cart vs 2 kg cart-vs-wall → **343 ms** · 20 N on 3+3 kg → **363 ms**.
   Author longer than this and the coil vanishes while the arrows still draw.

Further authoring notes:

- `release_at_ms` defaults to `0`, so **omitting it means "never in contact"** (`t >= 0` is always at/after
  release). A push-off state must author it.
- `fixed` is read at **build** time from the body's first appearance across all states (the same contract
  `hanging` already has) — an id must not flip `fixed` between states.
- Do **not** put `'F'` in `controls_visible` on a guided `push_off` state: the gate rewrites both
  `F_applied` every tick, so a trusted F drag there is silently discarded (thumb moves, canvas does not).
- `glow_focal: "nlb_spring"` for the state that points at the cause.
- Spec authoring constraints still apply: smallest on-screen force **≥ 15 N** (arrow-length floor), and
  carts of a few kg with tens of newtons so the acceleration is actually visible.

---

## 3. Deferred / interpretive calls

Text-only rows in `docs/loop_runs/lom/_engine/scar_candidates.sql` (nothing applied to the DB):

- `nlb_push_off_bodies_lane_separated_so_they_never_touch` → **UPDATE to FIXED** (resolved in seam B).
- `nlb_spring_authored_gap_wider_than_compressed_length_floats_untouching` (MODERATE).
- `nlb_push_off_release_window_outlives_the_spring_extension` (MAJOR) — the one that will bite the concept
  build if the timing contract above is ignored. Its long-term engine fix (derive the release instant from
  the geometry and treat `release_at_ms` as a cap) changes `push_off`'s founder-approved force semantics,
  so it is a **founder call**, not a surgeon call.
- `F` slider inside a contact window is a dead control (see the authoring note above) — two proposed
  resolutions recorded: validator-forbid the combination, or let the drag rescale the push_off magnitude.

Interpretive calls made by the surgeon, worth knowing:

- **Natural/compressed length are apparatus constants, not authorable.** The founder-approved surface lists
  only `between`/`compressed`/`coils`. Deriving natural length from the authored gap instead would make the
  release instant depend on where the author parked the carts. Cost: a concept wanting a different spring
  size needs a renderer edit — a small dent in "concepts 2–6 need zero renderer edits".
- **Geometry rebuild instead of `scale.y` fit**, diverging from the `nlbFitSegment` idiom the ropes use, so
  the wire radius stays honest (0.022 at both lengths) instead of rendering as a flat ribbon.
- **Hide at natural length, not at release** — a spring that has let go cannot still push.

Not done here, deliberately: no concept JSON, no `visual:eyes` on `newton_third_law` (nothing authors these
keys yet), no DB writes, no branch/worktree change. `deriveStateMeta.ts` needed one change in seam A (a
`push_off` state pins reveal at `release_at_ms + 2000` and sets `phaseFound`, so the mode floor cannot pull
the pin back inside the contact window); seam B needed none.
