# `momentum_bench` — JSON authoring contract

> Extracted from `docs/loop_runs/lom_f_state.md` (Phase 0 complete, harness 63/63) so the authoring
> pipeline can be handed a PATH rather than a paste. Source of truth for the design:
> `docs/MOMENTUM_BENCH_ENGINE_SPEC.md`. Source of truth for what the engine actually DOES: this file.
>
> `scenario_type: "momentum_bench"`, per-state config key `momentum_bench`, internal prefix `mb`,
> renderer `src/lib/renderers/field_3d_renderer.ts`.

---

## 0. What the engine has ALREADY PROVED — author to it, do not re-derive

The bring-up harness (`src/scripts/_scratch_mb_seams.ts`, 63/63) proves these numerically against
closed forms derived independently of the renderer. **These are facts. Do not restate them as
claims to be re-verified, and do not hedge them in narration.**

| Proved | Evidence |
|---|---|
| Momentum conserved | `Σp` constant to `0.000e+0` over every fixture |
| Elastic outcome emerges | matches `v₁′ = ((m₁−m₂)v₁ + 2m₂v₂)/(m₁+m₂)` to 0.0000% — the textbook formula is **absent** from the renderer source |
| Impulse identity | `∫F dt = m·Δv` to 0.0005% |
| **Equal areas under 10× stiffness** | soft `5.999975 N·s` vs rigid `5.999750 N·s` — **0.0038% apart** |
| **Peaks differ** | `42.4264 N` vs `134.1620 N` — ratio **3.16223** vs `√10 = 3.16228` |
| `F_peak · t_c = πJ/2` | holds on both lanes |
| Contact duration | `t_c = π√(μ/k)` to 0.0000%, **invariant to impact speed** |
| Wall bounce | `|Δp| = 2mv` exactly; a `fixed` body never moves and its arrow draws full-brightness |
| Two SIMULTANEOUS lanes | both engaged for 4 frames; areas `5.999975` / `5.999750`, peaks `42.43` / `134.16`, drawn on ONE shared axis |
| Rule 36 | 60 Hz vs 120 Hz fold identical to `4.44e-16` |

**The physical meaning, which is the whole teaching claim:** stiffening a contact raises the peak
force and shortens the duration *in exact compensation*, leaving the area — the impulse, the
momentum change — fixed. That is a consequence of the integrator, never a claim in a caption.

---

## 1. Apparatus constants — PHYSICS, not decoration

They decide where a contact begins, so compute positions from them; never guess.

| Body | Half-extent along the track |
|---|---|
| `cart` | **0.4 m** |
| `ball` | **0.28 m** (radius) |
| `wall` | **0.3 m** |

`contact.natural_length_m` default **0.4 m**. Scene scale **0.5 world units per metre**.

**Contact begins when** `s_hi − half_hi − (s_lo + half_lo) ≤ natural_length_m`.
Worked example: a ball closing on a wall centred at `s = 0` first touches at ball centre `−0.98`.

---

## 2. Closed enums

| Key | Allowed values |
|---|---|
| `mode` | `single_body \| wall_impact \| collision \| explosion \| sandbox` |
| `bodies[].shape` | `cart \| ball \| wall` (`wall` implied by `fixed: true`) |
| `readouts[]` | `v \| p \| sum_p \| KE \| sum_KE \| F_contact \| J` |
| `controls_visible[]` | `m1 \| m2 \| v1 \| v2 \| k \| c` |
| `param_ramp.param` | `v1 \| k \| m2` |
| `glow_focal` | exactly ONE of `mb_body_<id>` / `mb_track` / `mb_contact_element` / a bare body id |

## 3. Slider ranges (renderer-fixed — a `param_ramp` must stay inside its param's range)

`m1,m2` 0.5–10 kg step 0.1 · `v1,v2` −6…6 m/s step 0.1 · `k` 50–5000 N/m step 25 ·
`c` 0–300 N·s/m step 1.

## 4. Per-state keys

- **`formula`** — ONE Unicode algebra string. **No digits, no values** (harness-enforced).
  Math-serif surface, bottom-centre, `max-width:330px`.
- **`lanes[]`** — `{id, offset_z_m, bodies[], contact_override?{stiffness_N_per_m, damping_Ns_per_m, label}}`.
  **±1.3 m offsets read cleanly.** A lane owning the base `contact.between` pair modifies the base
  contact in place; any other lane with an override gets its own contact. Cap **3 contacts**.
- **`force_trace.compare_with_previous_lane: true`** — both traces on ONE shared axis pair. This is
  the two-lane payoff beat.
- **`slow_window: {slow_factor, badge}`** — **MANDATORY on any state with a contact** (spec §5).
  Pure `dt` multiplier on playback only; the HUD keeps reporting TRUE peak force and TRUE contact
  duration in ms. The `slow motion ×N` badge is the honesty requirement, not decoration.
- **`trusted_drag_seizes: true`** — the explore state ONLY, paired with `repeat_every_ms` (~1400 ms)
  so the bench keeps demonstrating until a teacher grabs it (Rule 37).

## 5. Hard prohibitions

- **Never author `sticks` and `preload_m` on the same contact** — Gate 8m in
  `src/schemas/conceptJson.ts` rejects it, and `validate:concepts` will FAIL.
- **Do not author `'J'` in `readouts` on a state that shows the force trace** — the trace's shaded
  area already carries its own `J = … N·s` label. Duplication, not a conflict.
- **No `field_lines` block** — `momentum_bench` draws no tube field lines.
- **No `*_at_ms` fallbacks** — `param_ramp.start_ms` defaults 0; `repeat_every_ms` and
  `phases[].at_ms` are the only clocks, and every gate holds at `t = 0`.

## 6. Overlay zones (measured, pairwise disjoint, all clear of review chrome at `y ≥ 52`)

| Element | Zone |
|---|---|
| `#mb_slowmo` (slow-motion badge) | top-left |
| `#mb_readout` (value-only momentum HUD) | top-right |
| `#mb_trace` (force–time panel) | bottom-left |
| `#mb_sliders` | bottom-right |
| `#mb_formula` | bottom-centre |
| `#caption` (shared chrome) | top-centre |

Rule 34b: the formula surface and the value-only HUD are **separate surfaces** — a founder ruling,
do not merge them. Rule 34a: the on-canvas caption is the ≤5-word delta cue ONLY; prose narration
lives in the subtitle strip below the canvas.

## 7. Live behaviour worth knowing while authoring

- `v1`/`v2` sliders write the initial velocity always, and live velocity only when the body is not
  mid-contact (rewriting velocity inside an engaged contact would contradict the solved segment).
- `k`/`c` sliders write the BASE contact only — in a two-lane state the other lane's override is the
  authored contrast and must not be dragged away underneath it.
- A scripted/untrusted driver (THE EYE, Playwright `fill()`) does **not** seize the sandbox; only a
  real trusted drag does. Designed behaviour, asserted from both sides.
- `lanes[].id` is carried as an event tag but not rendered — the trace legend names a lane by its
  contact `label` (e.g. "foam pad" / "steel bumper"), which is the teacher-facing name. **Author
  those labels as plain-English apparatus names (Rule 41).**
