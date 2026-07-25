# `newtons_laws_body` — the Laws of Motion field_3d engine spec

> Founder-approved 2026-07-25. ONE new `scenario_type` in `src/lib/renderers/field_3d_renderer.ts`
> that serves the entire 6-concept Laws of Motion chapter as pure JSON configuration.
>
> **Why one scenario and not six.** On Ch.7 and Ch.8, brand-new renderer scenario work consumed
> 34–42% of the whole chapter's token budget — it is the single largest cost in the system. Every
> extra `scenario_type` is a fresh expensive build plus its own defect tail. All six Laws of Motion
> concepts are the same physical picture: a surface (flat or inclined) carrying one or two bodies,
> gravity resolved into components, optional friction, optional applied force, optional
> inextensible-string/pulley constraint, a force-arrow overlay, and live numeric readouts. The
> variation is **entirely parametric**. `theta_deg = 0` gives flat ground through the *same* code
> path as an incline — never a special case. Presence of the `pulley` block gates the coupled branch.
>
> **The success criterion for this build: concepts 2–6 must require ZERO renderer edits.**
> If a later concept needs a renderer change, this design under-generalized.

Internal code prefix: `nlb`. Per-state config key: `newtons_laws_body`. Follow
`kinematics_1d_track` (prefix `kt`) as the structural template — it is the most recent scenario
added to this file and the closest existing mechanics analogue.

---

## 1. Per-state JSON config surface

Declared alongside the existing `track?:` block in the per-state config interface:

```ts
newtons_laws_body?: {
    mode?: 'rest_equilibrium' | 'coast_no_force' | 'coast_with_friction' |
        'accelerate_applied_force' | 'compare_mass_same_force' |
        'compare_force_same_mass' | 'action_reaction_pair' | 'fbd_isolate' |
        'incline_decompose' | 'incline_slide' | 'connected_atwood' |
        'connected_incline_hanging' | 'sandbox';

    surface?: {
        theta_deg?: number;        // incline angle; 0 = flat ground, SAME code path
        length_m?: number;         // visible half-length, default 6
        frictionless?: boolean;    // hard-zeroes every body's mu_s/mu_k this state
    };

    // 1 or 2 bodies. Two bodies with NO `pulley` = independent, side-by-side
    // (Newton II mass/force compare, Newton III pair) — each integrated as its own
    // single-body case. Two bodies WITH `pulley` = the coupled Atwood case.
    bodies: Array<{
        id: string;                        // stable, e.g. "A" | "B"
        label?: string;                    // Unicode on-canvas label, e.g. "m₁"
        mass_kg: number;
        color?: string;
        hanging?: boolean;                 // hangs vertically off the pulley; ignores theta, N forced 0
        initial_position_m?: number;       // signed, along the body's OWN axis
        initial_velocity_mps?: number;
        mu_s?: number;                     // omit/0 = frictionless for this body
        mu_k?: number;
        applied_force_N?: number;          // signed, along the body's own positive axis
        ghost?: boolean;                   // FBD decorative context body: dimmed, NEVER integrated
    }>;

    pulley?: {                             // presence IS the coupled-integrator gate
        body_a_id: string;                 // the body on the surface/incline
        body_b_id: string;                 // the hanging body
        post_position_m?: number;          // default = surface.length_m
    };

    action_reaction?: {                    // Newton III: engine-enforced equal-and-opposite
        engaged: boolean;
        driver_body_id: string;            // the other body's applied_force_N is MIRRORED each frame
    };

    arrows?: Array<{
        body_id: string;
        show: Array<'weight' | 'normal' | 'friction' | 'applied' | 'tension' | 'net'>;
        show_components?: boolean;         // resolve weight into mg*sin(theta) + mg*cos(theta)
        labels?: Partial<Record<'weight'|'normal'|'friction'|'applied'|'tension'|'net', string>>;
    }>;

    glow_focal?: string;                   // EXACTLY ONE per state (Rule 32e)
    readouts?: Array<'N'|'f'|'a'|'v'|'T'|'F_net'|'F_applied'>;      // Rule 33d live numerics
    controls_visible?: Array<'m'|'m2'|'F'|'theta'|'mu_s'|'mu_k'|'v0'>;  // Rule 31 contextual controls
    trusted_drag_seizes?: boolean;         // sandbox state only
    idle_auto_sweep?: { param: 'F'|'theta'|'m'; range: [number, number] };
    phases?: Array<{ id: string; at_ms?: number; until_ms?: number | null; action?: string; glow_focal?: string }>;
};
```

`explorer_id` reuses the existing top-level `Field3DConfig.explorer_id`, defaulting to
`"newtons_laws_body_explorer"` via the standard `config.explorer_id || "<default>"` idiom.

---

## 2. Physics core — one fixed-step integrator, two branches

Per body, `s` = signed position along its OWN positive axis (up-slope for a surface body,
downward for a hanging body). `g = 9.8`. `STOP_EPS_V = 0.01` m/s.

### Branch A — independent bodies (no `pulley`)

```
theta_i  = body.hanging ? 90 : surface.theta_deg
N_i      = m_i * g * cos(theta_i)                 // = 0 automatically when hanging
drive_i  = F_applied_i - m_i * g * sin(theta_i)
maxStat_i = mu_s_i * N_i

if |v_i| < STOP_EPS_V and |drive_i| <= maxStat_i:
    a_i = 0; v_i = 0
    f_i = -drive_i                                 // reported magnitude only, for the readout
else:
    vSign_i = (|v_i| > STOP_EPS_V) ? sign(v_i) : sign(drive_i)
    f_i     = -vSign_i * mu_k_i * N_i
    a_i     = (drive_i + f_i) / m_i

v_new = v_i + a_i * dt
if sign(v_i) != sign(v_new) and |drive_i| <= maxStat_i: v_new = 0   // kills friction jitter across v=0
s_i  += v_new * dt                                 // semi-implicit Euler, uses the UPDATED v
```

`newton_first_law` (theta=0, F=0, mu=0 => drive=0, a=0, v constant) and `newton_second_law`
(theta=0, mu=0, a=F/m) fall out with zero special-casing.

### Branch B — coupled (`pulley` present)

Shared scalar `v`/`a` along the string, per-body sign factor `c_i` in {+1,-1} (the pulley reverses
one side's sense):

```
N_i       = m_i * g * cos(theta_i)                 // 0 for the hanging body
D         = SUM c_i * (F_applied_i - m_i * g * sin(theta_i))
M         = SUM m_i                                 // ideal massless string/pulley

if |v| < STOP_EPS_V and |D| <= SUM maxStat_i:
    a = 0; v = 0
else:
    vSign  = (|v| > STOP_EPS_V) ? sign(v) : sign(D)
    F_fric = -vSign * SUM (mu_k_i * N_i)
    a      = (D + F_fric) / M

v_new = v + a * dt            (same zero-clamp guard)
for each body: v_i = c_i * v_new; s_i += v_i * dt
T_i = m_i * (c_i * a) - (F_applied_i - m_i * g * sin(theta_i)) [+ friction_i for the surface body]
```

**Checksums the auditor can verify against the JSON `formulas` block:**
- Atwood (both hanging): `a = (m1 - m2) * g / (m1 + m2)`, `T = m2 * (g + a) = m1 * (g - a)`.
- Incline + hanging: `a = (m_hang*g - m_inc*g*sin(theta) - mu_k*m_inc*g*cos(theta)) / (m1 + m2)`.

### Rule 36 compliance (NON-NEGOTIABLE)

One frame function, called ONCE per tick from `animate()`:

```js
if (config.scenario_type === "newtons_laws_body") {
    updateNewtonsLawsBodyFrame(heldAtPin ? 0 : dtStep);
    applyNewtonsLawsBodyGlow();
}
```

`dtStep` is already `0.016 * __pmSteps`. Call the function ONCE — never loop over `__pmSteps`
internally. Both branches are affine in `dt` (`v += a*dt; s += v*dt`, no internal sub-stepping),
so folding N micro-steps into one `dtStep` is exact. Under `SET_TIME_FREEZE`, `dt = 0` yields
`v_new = v`, `s_new = s` identically, so frozen frames are byte-stable with no special-case code.

**NEVER write a literal `time += 0.016` or assume 60 Hz.** This is Rule 36 and the failure it
prevents is invisible in dev — it only appears on 120 Hz classroom hardware.

---

## 3. Force-arrow overlay (this is what makes `free_body_diagram` config-only)

Built once per body in `buildNewtonsLawsBody()` — six `ArrowHelper`s + Unicode label sprites,
hidden by default:

```js
// userData.id = "nlb_arrow_" + bodyId + "_" + kind
function nlbUpdateArrow(bodyId, kind, originWorld, dirUnit, magnitudeN, labelText) {
    var len = clamp(NLB_ARROW_MIN_LEN, NLB_ARROW_MAX_LEN, magnitudeN * NLB_ARROW_SCALE);
    arrow.visible = magnitudeN > NLB_ARROW_EPS;   // a real zero force HIDES the arrow, never a stub
    arrow.position.copy(originWorld);
    arrow.setDirection(dirUnit);
    arrow.setLength(len, headLen, headWidth);
}
```

- **Rule 29:** arrow LENGTH tracking real magnitude is the deliberate exception (same as `tauThrob`).
  Emphasis of the teaching focus is **brightness only**, via the existing `applyGlowEmphasis()`.
  No size bump on top of the magnitude-driven length.
- **Rule 32e:** `nlbApplyGlow()` mirrors `ktApplyGlow` — reads `glow_focal`, exact-matches one id,
  dims the rest. By construction only one can match.
- **Rule 34c:** labels are real Unicode — `N`, `fₖ`, `fₛ`, `F`, `T`, `mg`, `ΣF`.
  Never ASCII transcription.
- `show_components` adds two dashed thin arrows (`mg*sin(theta)` along-surface,
  `mg*cos(theta)` perpendicular) plus a right-angle marker.
- **`ghost: true`** bodies are (a) skipped entirely by the step function — never integrated — and
  (b) rendered via `applyGlowEmphasis(mesh, false, true, 0, false)`, i.e. forced into the dim-peer
  branch regardless of `glow_focal`. No new dimming primitive.

---

## 4. Explorer surface (Rule 27) and Rule 37

`explorer_id = config.explorer_id || "newtons_laws_body_explorer"`. One `PARAM_UPDATE` per change,
mirroring `ktEmit`:

| param | source |
|---|---|
| `mass_a` / `mass_b` | `#nlb_m_slider` / `#nlb_m2_slider` (m2 row hidden unless 2 bodies) |
| `applied_force` | `#nlb_f_slider` (signed) |
| `theta_deg` | `#nlb_theta_slider` |
| `mu_s` / `mu_k` | `#nlb_mus_slider` / `#nlb_muk_slider` |
| `initial_velocity` | `#nlb_v0_slider` (sandbox only) |
| `body_position` | 3-D trusted-drag proxy `nlb_body_<id>_hit` — invisible-sphere pattern, same as `kt_runner_hit`, gated by `nlbStateIsDraggable()` |

The `#nlb_sliders` rows are built ONCE and shown/hidden per state via `controls_visible` (Rule 31),
keeping the same screen position across states (Rule 32d).

**Rule 37:** the final state is authored `mode: 'sandbox'` + `advance_mode: 'interaction_complete'`.
The review player already skips its freeze pin for that `advance_mode`, so continuous free-run is
automatic — no renderer work. `idle_auto_sweep` drives motion until a trusted (`ev.isTrusted`)
slider or drag seizes control, via a `window.PM_nlbBodyDragged` flag mirroring `PM_ktRunnerDragged`.

---

## 5. Integration checklist

Anchor by grep, not line number — the file drifts. Approximate current lines for orientation only.

### `src/lib/renderers/field_3d_renderer.ts`

| # | Site | What to do |
|---|---|---|
| 1 | `scenario_type` union (~L46) | append `\| 'newtons_laws_body'` |
| 2 | per-state config interface (next to `track?:`) | declare the §1 block |
| 3 | `nlbStateIsDraggable()` | mirror `ktStateIsDraggable()`; checks `trusted_drag_seizes` |
| 4 | pointer hit-test in `pmPickSensor` | raycast `nlb_body_<id>_hit` |
| 5 | `applyDragFrom()` | clamp `s` to surface bounds, set the drag flag, emit `body_position` |
| 6 | `buildNewtonsLawsBody()` (new) | surface(s) with theta rotation, body meshes, **pulley post + wheel + two rope segments (new geometry)**, arrow overlay, value-only HUD, own `#nlb_formula` element in Cambria Math (Rule 34b), `#nlb_sliders` panel |
| 7 | scenario dispatch `switch` (~L30193) | `case "newtons_laws_body": buildNewtonsLawsBody(); break;` |
| 8 | `applyNewtonsLawsBodyState()` + its call in `applyState()` (~L30574) | reset drag flags, seed masses/theta/mu/F, set arrow visibility + `glow_focal`, reset one-shot phase flags, toggle `#nlb_sliders` rows per `controls_visible` |
| 9 | **`#sliders` exclusion chain** (~L30879) | add `var isNlb = config.scenario_type === "newtons_laws_body";` and append `&& !isNlb` to the generic-panel boolean. **MISS THIS AND THE EYE FALSE-FAILS** — the exact leak `kt` hit |
| 10 | frame-update call site in `animate()` | `updateNewtonsLawsBodyFrame(heldAtPin ? 0 : dtStep); applyNewtonsLawsBodyGlow();` — must take the real `dtStep`, unlike `kt`'s closed form |
| 11 | `nlbEmit()` PARAM_UPDATE emitters | one per slider `input` handler, params per §4 |

### `src/lib/validators/visual/deriveStateMeta.ts`

| # | Site | What to do |
|---|---|---|
| 12 | reveal-time block | compute max reveal ms from `newtons_laws_body.phases[]`, same as the `track.phases[]` block |
| 13 | hold-expectation classification | `mode === 'sandbox' ? 'interactive' : 'reveal_hold'` |

**Both 12 and 13 are REQUIRED or THE EYE false-fails.**

### Always

14. `npm run check:renderer-syntax` after EVERY edit to the renderer (Rule 36c), then
    `npx tsc --noEmit` (0 errors) and `npm run validate:concepts`.

**Rule 36b full-fleet re-verify is NOT triggered** — this adds dispatch branches only and never
touches the shared `animate()` / `dtStep` / `__pmSteps` clock machinery.

---

## 6. Per-concept mapping — the proof that concepts 2–6 need no renderer edits

| Concept | bodies | theta | pulley | arrows | notes |
|---|---|---|---|---|---|
| `newton_first_law` | 1 | 0 | — | weight, normal, (friction in the contrast beat), net | coast_no_force -> coast_with_friction contrast -> rest_equilibrium -> sandbox |
| `newton_second_law` | 2 then 1 | 0 | — | applied, net | same-F/different-m, then different-F/same-m; mu = 0 throughout |
| `newton_third_law` | 2 | 0 | — | applied on BOTH bodies (equal length, opposite direction), net | `action_reaction.engaged`; the whole "why don't they cancel" beat IS two separate free bodies |
| `free_body_diagram` | 1 real + N `ghost` | 0 then >0 | — | all six + `show_components` on the incline beat | a ~ 0 in every real state; the cheapest concept |
| `block_on_incline` | 1 | slider, >0 | — | weight + components, normal, friction, net | mu_s/mu_k threshold arc, cloned from `friction_static_kinetic`'s pedagogy |
| `connected_bodies` | 2 | 0 then >0 | YES | weight both, normal + friction on the surface body, tension both, net | the ONE concept exercising Branch B + the new pulley geometry |

**Honest extension flags** (both inside this one scenario, not a second `scenario_type`):
1. The pulley post + wheel + rope-segment geometry is genuinely new — first use of this asset class.
2. `ghost: true` needs threading through build / seed / step.

---

## 7. Build order

1. Build sites 1–14 above.
2. Verify against the two structural extremes FIRST — `free_body_diagram` (no integrator; exercises
   the arrow overlay and `ghost` fully) and `connected_bodies` (Branch B + the new pulley geometry).
   Everything the other four concepts need is a strict subset of those two.
3. `npm run check:renderer-syntax` -> `npx tsc --noEmit` -> `npm run validate:concepts`.
4. Regression EYE on this branch's `regression_sample` (see the state file) to prove no existing
   field_3d scenario regressed.

## 8. Per-concept registration (x6, after the engine lands — JSON only)

1. `src/data/concepts/<id>.json` — `renderer_pair.panel_a/panel_b: "field_3d"`,
   `available_renderer_scenarios.field_3d: ["newtons_laws_body"]`, `physics_engine_config`
   (the §2 formulas as checksums), per-state `newtons_laws_body` blocks.
2. `CONCEPT_PANEL_MAP` in `src/config/panelConfig.ts`.
3. `CONCEPT_RENDERER_MAP` in `src/lib/aiSimulationGenerator.ts` — `<id>: "field_3d"`.
4. `VALID_CONCEPT_IDS` in `src/lib/intentClassifier.ts`.
5. `CLASSIFIER_PROMPT` in `src/lib/intentClassifier.ts`.
6. `supabase_migrations/supabase_2026-07-25_seed_<id>_clusters_migration.sql`.
7. **Do NOT add to `PCPL_CONCEPTS`** — these are field_3d, not PCPL.
8. `free_body_diagram` is a RETROFIT: flip its existing `CONCEPT_RENDERER_MAP` and `panelConfig.ts`
   entries from `mechanics_2d` to `field_3d`, and clear its `simulation_cache` rows (Rule 9).
   Do not confuse it with the unrelated dormant `MECHANICS_SCENARIO_MAP` string `"free_body_diagram"`
   in `aiSimulationGenerator.ts`, which is a fallback scenario name for other concepts — leave that alone.
