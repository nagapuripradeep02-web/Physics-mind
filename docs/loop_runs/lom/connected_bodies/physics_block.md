# PHYSICS BLOCK — `connected_bodies`

> Stage 2 artifact. Input: `docs/loop_runs/lom/connected_bodies/skeleton.md` (architect, 7 states).
> Engine: `newtons_laws_body` (field_3d), configuration only — no renderer edit required or proposed.
> `g = 9.8 m/s²` is the engine's hardcoded constant. Slider min/max/step/default are the engine's OWN
> shared `#nlb_sliders` config (`field_3d_renderer.ts` ~30356–30362, same panel every `newtons_laws_body`
> concept reuses) — **not authorable per-concept**; quoted verbatim from `free_body_diagram/physics_block.md`
> §1, which is the live reference for this engine. Position-update / hanging-body sign conventions below
> use the engine's ACTUAL built implementation (phase0 report §4, items 1–2), not the literal spec-doc text
> the spec itself flags as corrected — the two differ only in numerical-integration exactness and the
> hanging-body gravity sign, never in the steady-state formulas an author needs.

**Engine bug queue consultation:** DB not reachable from this read-only authoring context. Consulted the
committed scar surface applied by the architect (`docs/loop_runs/lom/_engine/scar_candidates.sql`,
phase0 report §5/§7) and `free_body_diagram/engine_gap.md` (GAPs 1–3, all either resolved-in-config or
inherited-fixed for this concept per skeleton §"Engine-bug-queue consultation"). Applied below: per-state
near side-on `camera_position`; ONE short formula line per state; `phases[]` only for glow/arrow-visibility
timing, never a hardcoded `*_at_ms`; specific `glow_focal` ids; dedicated Atwood body ids `P`/`Q` (never
reusing `A`/`B`); constant `hanging` flag per body id across every state it appears in;
`pulley.post_position_m` left at/near default; `idle_auto_sweep.range[0]` = the state's own value.
FLAG to quality_auditor: confirm no new `alex:physics_author`/`alex:json_author` FIXED rows landed since
2026-07-25, and see the **F-slider non-physical-tension finding** in §5 item 10 — it is new, found while
authoring this concept, not yet in the scar surface.

---

## 1. `physics_engine_config`

### 1a. Variables

| symbol | name | unit | min | max | step | default | maps to |
|---|---|---|---|---|---|---|---|
| `m` (m₁) | mass of body A (surface body) | kg | 0.5 | 10 | 0.5 | **4** | `mass_a`, engine's shared `#nlb_m_slider` |
| `m2` (m₂) | mass of body B (hanging body) | kg | 0.5 | 10 | 0.5 | **2** | `mass_b`, `#nlb_m2_slider` |
| `theta` (θ) | incline angle | ° | 0 | 60 | 1 | 0 | `theta_deg`, `#nlb_theta_slider` — 0 gives flat ground through the SAME code path |
| `mu_s` (μₛ) | static-friction coefficient (body A only; B's is engine-forced 0, hanging) | — | 0 | 1 | 0.05 | 0 | `mu_s`, `#nlb_mus_slider` |
| `mu_k` (μₖ) | kinetic-friction coefficient (body A only) | — | 0 | 1 | 0.05 | 0 | `mu_k`, `#nlb_muk_slider` |
| `v0` | initial velocity along the string | m/s | −5 | 5 | 0.5 | 0 | `initial_velocity_mps` (both bodies, coupled — same magnitude, opposite sign per `c_i`), `#nlb_v0_slider` |
| `F` | extra applied force on body A | N | −20 | 20 | 0.5 | 0 | `applied_force_N` on body A, `#nlb_f_slider` — **S7 sandbox only; never authored on a guided state (§5 item 10)** |
| `g` | gravitational acceleration | m/s² | — | — | — | **9.8 (engine constant)** | hardcoded in `updateNewtonsLawsBodyFrame` |

`m1`/`m2` in the tables below always mean body A's/B's mass regardless of which concrete body ids
(`A`/`B` or `P`/`Q`) a state uses — the physics is identical, only the ids differ (S6 uses its own).

### 1b. Formulas (derived from Newton's second law per body — none imported)

**Shared constraint (all coupled states):** the string is inextensible ⇒ `|s₁̇| = |s₂̇| = |v|`,
`|s₁̈| = |s₂̈| = |a|` at every instant — one shared scalar speed/acceleration, opposite-signed per body
via the pulley's sign factor `c_i`. This is S1's entire taught content (no formula needed, just the
identity of the two `v` readouts).

**Horizontal + hanging (θ=0 special case of the general incline formula, same code path):**
```
a = (m₂g − μₖ·m₁·g) / (m₁ + m₂)
T = m₂ · (g − a)                     [ = m₁·(g − a) + μₖ·m₁·g  when A is sliding kinetically ]
```

**Incline + hanging (general form — θ=0 recovers the line above):**
```
a = (m₂·g − m₁·g·sin θ − μₖ·m₁·g·cos θ) / (m₁ + m₂)
N = m₁·g·cos θ
T = m₂ · (g − a)
```

**Atwood (both hanging):**
```
a = (m₁ − m₂)·g / (m₁ + m₂)
T = m₂·(g + a) = m₁·(g − a)          [ identically equal — verified to 9 dp at runtime, phase0 §3 ]
```

**Verification against the frozen engine (phase0 §3, §4 item 2 — the ACTUAL built formulas, which
correct the literal spec-doc text's hanging-body sign but agree exactly with the three boxes above):**

| Case | Formula result | Runtime engine result (phase0 §3) |
|---|---|---|
| Atwood m₁=3, m₂=5 | a = −2.4500, T = 36.750 both | a = −2.4500, \|T\| = 36.750 both ✓ |
| Incline+hang θ=0, m₁=4, m₂=3, μₖ=0.2 | a = 3.0800, N = 39.200, T = 20.160 | identical ✓ |
| Incline+hang θ=25°, same masses | a = 0.81829, N = 35.5274, T = 26.9446 | identical ✓ |

**`computed_outputs`:**
```json
"computed_outputs": {
  "a": "shared |acceleration| along the string, m/s²",
  "v": "shared |speed| along the string, m/s",
  "T": "string tension, N — equal magnitude on both bodies by construction",
  "N": "normal reaction on the surface body only (0, suppressed, on any hanging body)",
  "f": "friction on the surface body only (0, suppressed, on any hanging body)",
  "F_net": "net force on the requested body, N"
}
```

**`constraints` (documentation-only, Physics Validator E25/E29/E30):**
```json
"constraints": [
  "|a_A| = |a_B| = a and |v_A| = |v_B| = v at every instant — the inextensible string forces one shared kinematics",
  "T is the SAME magnitude at both ends of the string (ideal massless string, frictionless massless pulley)",
  "T = m2*g only in the special case a = 0 (S1/S2's earned wrong belief); whenever a != 0, T != m2*g",
  "for incline+hanging with F=0: 0 < T < m2*g always (T -> m2*g only as a -> 0)",
  "for Atwood: T lies strictly between m1*g and m2*g (T -> the smaller weight as masses converge)",
  "N != 0 and f != 0 only on the non-hanging (surface) body; a hanging body always reports N=0, f=0, suppressed not zero-printed",
  "g = 9.8 m/s^2 (engine constant); mass and weight are never the same quantity in narration"
]
```

---

## 2. Per-state variable overrides (only where they differ from the row defaults above)

- **S1** (`connected_incline_hanging`, θ=0): A: `mass_kg:4, mu_k:0.5, initial_velocity_mps:0.35,
  initial_position_m:-4.2`; B: `mass_kg:2, hanging:true`; `surface.length_m:7`,
  `pulley.post_position_m:7` (default = length_m). **Why the override:** μₖ=0.5 is chosen so
  `μₖ·m₁·g = 19.60 N = m₂·g` exactly — the deliberate `a=0` balance that lets S1 show pure constant-v
  coupling with no acceleration to distract from the "one system" claim.
- **S2**: identical to S1 (Rule 32d home-pose continuity — "glide continues"); no new overrides.
  `T` reads `19.60 N = m₂g` here — this is the earned wrong belief, not an error.
- **S3** (`surface.frictionless: true`): A: `mass_kg:4, initial_velocity_mps:0, initial_position_m:-1.0`
  (recommended — see §6 framing note); B: `mass_kg:2, hanging:true`; **ghost** A′:
  `ghost:true, initial_position_m:-1.0` (frozen at A's own start pose — "the world where T=m₂g and
  nothing ever moves"). `mu_s`/`mu_k` forced 0 by `surface.frictionless`.
- **S4**: same rig as S3, `mu_k:0.4` on A, `initial_velocity_mps:0, initial_position_m:-1.0`
  (recommended, matching S3 for apparatus continuity). `F` stays 0 — this state is the frictional
  from-rest release, not a balanced-glide state (unlike FBD S4, which locked `F=μₖmg` for a balance;
  connected_bodies' S4 wants a≠0 to demonstrate "solve it").
- **S5** (`surface.theta_deg:30`, static — GAP 1, no ramp): A: `mass_kg:4, mu_k:0.2,
  initial_position_m:-1.0, initial_velocity_mps:0`, `show_components:true`; B: `mass_kg:3, hanging:true`.
  θ=30 static is chosen deliberately per GAP 1's resolution (same pattern as `free_body_diagram` S5) —
  no `idle_auto_sweep`/`param_ramp` unless the founder-pre-approved `param_ramp` fix (commit 2998e54,
  not yet built) lands before json authoring.
- **S6** (`connected_atwood`, `surface.hidden:true`): P: `mass_kg:2.1, hanging:true,
  initial_position_m:2.0` (recommended — see §6); Q: `mass_kg:2.0, hanging:true,
  initial_position_m:2.0` — **own ids, never `A`/`B`** (phase0 bring-up scar: reusing surface-body ids
  for a hanging pair mis-renders silently with correct integrator physics but wrong visual parent group).
- **S7** (`sandbox`): A: `mass_kg:4, mu_s:0, mu_k:0.4, applied_force_N:0`; B: `mass_kg:2, hanging:true`;
  `theta_deg:0`. Chosen as S4's canonical numbers so the sandbox opens on a familiar rig.
  `idle_auto_sweep:{param:'m', range:[4, 10]}` — range[0]=4 is the state's own seeded value (phase0 §6:
  first frame must not step). `trusted_drag_seizes:true`.

No `variable_overrides` needed beyond the above; every guided state's narrated number is produced by
exactly the formulas in §1b with the listed inputs — none require a defensive lock against an upstream
default leak (unlike `hinge_force`'s `F_ext:0` pattern), because every value here is itself the taught
number, not a "should be zero but might leak" case.

---

## 3. Within-state motion + reveal timeline (Rule 26/31/32 — phase fractions, never `*_at_ms`)

Motion-budget arithmetic **redone independently** (½at² for the four accelerating states, v·t for the
two constant-velocity states) — **all five architect numbers check out exactly**; see §6 correction log.

| S | t-window (phase) | what animates | driven by | duration |
|---|---|---|---|---|
| S1 | 0→100% | A + B glide at constant `v0=0.35 m/s` (`coupled-glide`); both `v` readouts update identically every frame — the delta IS their identity | `s = s₀ + v₀t`; s(0)=−4.2, s(15 s)≈+1.05 (any duration in 3–60 s stays inside the ±7 m bound — see §6) | **15000 ms** (30–45 words ≈ 12–18 s) |
| S1 | continuous | `a` readout holds at `0.00 m/s²` throughout — proof this isn't free-fall | computed | whole state |
| S2 | phase `tension_draw` (0→~30%) | `tension` arrows on A and B both draw in to `19.60 N` simultaneously (ONE T, both ends — cause: the rope is named as one object) | fixed `T=m₂g` (a=0 case) | first ~30% |
| S2 | continuous, after arrows settle (~0.5–1 s gap, Rule 32a) | A+B glide continues (home pose from S1); `T` readout holds `19.60 N` — the balanced case being earned | computed | rest of state |
| — | | | | **17000 ms** (35–50 words ≈ 14–20 s) |
| S3 | phase `ghost_freeze` (0→~15%) | ghost A′ fades to 0.40 opacity at its frozen start pose — the "should never move" reference (cause named first, Rule 32a) | scenario_cue | first ~15% |
| S3 | phase `release` (~20%→ burst end) | real A + B release from rest, accelerate at `a=3.267 m/s²`, run 2.0 m in **1.106 s**, then halt at the run bound; ghost stays frozen throughout | `a = m₂g/(m₁+m₂)`, `s = ½at²` | ~1.1 s of the state |
| S3 | continuous, held after halt | `T` reads `13.07 N`, visibly below `m₂g = 19.60 N` on B's weight arrow (`translate-through`: real A visibly past its frozen ghost) | computed | remaining ~19 s of narration |
| — | | | | **20000 ms** (40–55 words ≈ 16–22 s) |
| S4 | phase `arrow_walk` (0→~50%, `glow-walk`) | `phases[]` walks focal `nlb_arrow_A_tension → nlb_arrow_B_weight → nlb_arrow_A_net`, ONE focal at any instant (32e); A+B release from rest in parallel, `a=0.653 m/s²`, run 2.0 m in **2.474 s** | computed `a`, `phases[]` glow sequence | first ~50% |
| S4 | continuous, held after halt | `a`, `T` (18.29 N — computed, see §6), `F_net` readouts settle; glow-walk continues over the settled rig (per skeleton) as the derivation narration finishes | computed | rest of state |
| — | | | | **20000 ms** (40–55 words ≈ 16–22 s) |
| S5 | phase `components_draw` (0→~35%, cause-before-effect gap, Rule 32a) | dashed `m₁g·sinθ` / `m₁g·cosθ` components draw in on A while the tilted apparatus is already posed (no animated tilt — GAP 1); the `normal` arrow settles at this state's own `N = m₁g·cosθ = 4×9.8×0.8660 = 33.95 N` | fixed θ=30, `show_components` reveal | first ~35% |
| S5 | phase `creep` (~40%→ burst end, ~0.5–1 s after components settle) | A+B release from rest, `a=0.430 m/s²`, run 2.0 m in **3.049 s** (`coupled-glide`, DECLARED CONTRAST PAIR with S1 — same archetype, opposite delta: constant-v flat glide becomes a slow uphill creep) | computed `a` | ~3.0 s |
| S5 | continuous, held after halt | `N` readout is the live instrument (Rule 33 N/A-macro exemption met via this readout) reading `33.95 N` — below the flat-ground `39.20 N` at θ=0; `T` reads `28.11 N` | computed | rest of state |
| — | | | | **18000 ms** (35–50 words ≈ 14–20 s) |
| S6 | 0→100% (`mirror-descent`) | P descends, Q ascends, exactly mirrored, from rest; `a=0.239 m/s²`, each body travels its **1.5 m** creep in **3.543 s**, then holds (no floor object — GAP 2 — narrated as "the end of its run," not an arrival) | computed `a`, opposite-signed `c_i` | ~3.5 s |
| S6 | continuous | ONE `T` readout (`20.08 N`) sits visibly between Q's weight `19.60 N` and P's weight `20.58 N` — the "only the difference drives" delta; the vanished slab (`surface.hidden`) IS the one visible change from S1–S5's home pose | computed | rest of state |
| — | | | | **15000 ms** (30–45 words ≈ 12–18 s) |
| S7 | open, continuous, never auto-freezes (Rule 37) | all six arrow kinds + `show_components` live-redraw every frame from slider/drag state; `idle_auto_sweep` on `m` runs a 4000 ms triangle from 4→10 kg until a trusted input seizes | `m, m2, F, theta, mu_s, mu_k, v0` (ALL, live) | open (`interaction_complete`) |

Rule 32 compliance per state: cause-before-effect gap (S2's tension draw before glide resumes; S3's
ghost freeze before the real release; S4's arrow-walk opens on `tension` before `net`; S5's component
draw before the creep begins); only the taught variable's motion changes (S2/S3/S4/S5 keep the pulley
post/wheel/ropes at home pose — the ONE visible change is the arrow reveal or the release); ONE
specific-id `glow_focal` per state (S1 `nlb_rope_a`, S2 `nlb_arrow_A_tension`, S3 `nlb_arrow_B_tension`,
S4 phased walk ending `nlb_arrow_A_net`, S5 `nlb_comp_A_sin`, S6 `nlb_pulley_wheel`, S7 `nlb_body_A`).

---

## 4. Per-state control spec (Rule 31 — closed enum `m|m2|F|theta|mu_s|mu_k|v0`)

| S | `controls_visible` | validated against closed enum |
|---|---|---|
| S1 | *(none)* | matches architect table `—` |
| S2 | *(none)* | matches architect table `—` |
| S3 | `["m2"]` | ✓ |
| S4 | `["m","m2"]` | ✓ |
| S5 | `["theta","mu_k"]` | ✓ |
| S6 | `["m","m2"]` | ✓ |
| S7 | `["m","m2","F","theta","mu_s","mu_k","v0"]` | ✓ ALL seven authorable tokens |

Slider rows for every token this concept ever uses are built once and shown/hidden per state
(engine-level, reserved-slot pattern, Rule 32d) — this concept is the first to use all seven tokens.

---

## 5. Physical constraints / correctness guards (Definition-of-Done, Gate 8/25/29/30)

1. `|a₁| = |a₂| = a`, `|v₁| = |v₂| = v` at every instant in every coupled state — verified at runtime
   to 9 dp (phase0 §3): this is S1's entire content and must never be violated.
2. `T` is the same magnitude on both bodies at all times (ideal massless string over an ideal massless
   frictionless pulley) — verified at runtime for all three structural cases (phase0 §3 table).
3. `T = m₂g` **only** when `a = 0` (S1/S2's deliberately balanced case); every other state must show
   `T ≠ m₂g` the instant `a ≠ 0` (S3's PRIMARY aha) — checked numerically: S3 13.07 < 19.60,
   S4 18.29 < 19.60, S5 28.11 < 29.40.
4. For every incline+hanging state with `F=0`: `0 < T < m₂g` strictly (`T → m₂g` only as `a → 0`).
   Verified S3/S4/S5 all satisfy `0 < T < m₂g`.
5. For the Atwood state: `T` lies strictly between the two weights, `m₂g < T < m₁g`
   (`19.60 < 20.08 < 20.58`) — verified, and this is S6's SUPPORTING aha.
6. `N ≡ 0`, `f ≡ 0` on any `hanging: true` body — suppressed in the readout, never printed as `0.00`
   (engine fact, phase0 §3 fix). Applies to B (S1–S5, S7) and P/Q (S6).
7. Static-friction non-start condition (horizontal rig, `θ=0`, `F=0`): the system stays at rest from
   `v=0` iff `m₂g ≤ μₛ·m₁g`, i.e. `μₛ ≥ m₂/m₁`. At S1's own masses (`m₁=4, m₂=2`) that threshold is
   `μₛ ≥ 0.5` — since S1 authors `v0=0.35` (already moving, kinetic branch engaged regardless of `μₛ`),
   this never fires in the guided arc, but **in S7 a teacher who drags `μₛ` above `m₂/m₁` from a
   `v0=0` seed will correctly see the rig refuse to start** — expected physics, not a defect.
8. `hanging` is constant per body id across every state it appears in — `A`/`B` never hanging→surface
   or vice versa; `P`/`Q` are Atwood-only ids, never reused as `A`/`B` (phase0 bring-up scar — hit
   exactly this bug on the first Atwood test).
9. Ideal-string idealization is stated honestly in narration (per skeleton §9's anchor note) — the
   string is massless/inextensible and the pulley frictionless/massless.
10. **New finding — string-tautness bound on the S7 `F` slider (not present in `free_body_diagram`,
    which has no coupled branch).** `T > 0` requires `a < g`. Solving the incline+hanging formula for
    the threshold on the extra applied force: `T > 0 ⟺ F < m₁·g·(1 + sin θ + μₖ·cos θ)`. Because the
    engine's `m`/`theta`/`mu_k` slider ranges are shared and fixed (`m₁ ∈ [0.5,10]`, `θ ∈ [0°,60°]`,
    `μₖ ∈ [0,1]`), the WORST case over that range is `m₁=0.5, θ=0°, μₖ=0` ⇒ threshold `= 4.9 N`. The
    `F` slider itself runs to **+20 N**. A teacher who drags `m` to its minimum, `mu_k` to 0, and `F`
    above ~4.9 N in S7 drives the coupled model into a regime (`a > g`) the Branch B integrator has no
    representation for — a real taut string would go slack and the two bodies would decouple; the
    current model instead keeps solving the rigid coupled equations and would report a **negative
    tension**. **This cannot be fixed by JSON authoring alone** since the slider range is the engine's
    shared, non-per-concept-authorable panel. Explicit S7 manual-check item for quality_auditor, and an
    engine-gap candidate (clamp `T` at 0 with a slack-rope visual, or narrow the shared `F` slider) —
    founder call. Not a stop for authoring S1–S6, which never enter this regime.

---

## 6. Motion-budget verification & framing note

**½at² check (accelerating states) — all match the architect's skeleton exactly, no corrections:**

| S | a (m/s²) | run (m) | t = √(2·run/a) | architect claimed | match? |
|---|---|---|---|---|---|
| S3 | 3.2667 | 2.0 | 1.106 s | 1.11 s | ✓ |
| S4 | 0.6533 | 2.0 | 2.474 s | 2.47 s | ✓ |
| S5 | 0.4302 | 2.0 | 3.049 s | 3.05 s | ✓ |
| S6 | 0.2390 | 1.5 | 3.543 s | 3.54 s | ✓ |

**v·t check (constant-velocity states):** S1/S2 at `v0=0.35 m/s`: over any duration `d ∈ [3,60] s`
(the Rule-31 clamp), displacement `= 0.35d`. Bound margin to the post at `s=+7` (from start `s=−4.2`)
is `11.2 m ⇒ d ≤ 32.0 s` before reaching the post; the left bound `s=−7` is never threatened (motion
is rightward only). The chosen 15000/17000 ms durations are comfortably inside both bounds — the
arithmetic tolerates any narration length the 25–55-word budget could produce (worst case 55 words
≈ 22 s ⇒ 7.7 m displacement, still 3.5 m short of the post).

**T-value completeness check:** S4's skeleton row doesn't state a numeric T; computed here:
`T = m₂·(g−a) = 2×(9.8−0.6533) = 18.29 N` — satisfies `0 < T < m₂g = 19.60 N` (constraint 4).

**No architect number required correction.** Every displayed `a`/`T` value in the skeleton's §4 table
(S1 exact-balance, S3 3.27/13.07, S4 0.65, S5 0.43/28.1, S6 0.239/20.08) reproduces exactly against
both the closed-form derivation and the phase0-verified runtime engine.

**Framing note (flagged to json_author, not resolved here — matches the skeleton's own instruction):**
Unlike `free_body_diagram`'s pure-horizontal coast, this scene has vertical extent: B's hanging drop
(2.0 m for S3/S4/S5) and the Atwood pair's 1.5 m mirror creep both need vertical frame room the FBD
`s_occlusion ≈ 1.397×distance` calibration never modeled (it assumed a flat table only). Recommend:
(a) keep `surface.length_m=7` and `pulley.post_position_m=7` shared across S1–S5/S7 (Rule 32d apparatus
continuity — A's own horizontal excursion in every accelerating state is tiny, only ±1 m from a
recommended `initial_position_m=−1.0`, so horizontal occlusion risk here is near zero, much safer than
FBD's 5 m coast); (b) the real constraint is **vertical** — the camera must include the post height
down through B's/P's/Q's full drop with margin, which needs json_author's own Playwright projection
probe (per skeleton §4) rather than reusing FBD's flat-ground constant unmodified; (c) S6's own
vertical framing: recommend `P.initial_position_m = Q.initial_position_m = 2.0` (both start hanging
2.0 m below the pivot — a legible symmetric "two hanging weights" home pose), giving P a final depth
of `3.5 m` and Q a final depth of `0.5 m` (still clear of the pulley wheel) after the 1.5 m mirror
creep — chosen so rope-length symmetry (`P_pos + Q_pos = 4.0`, constant) holds throughout.

---

## 7. Drill-down cluster phrasings (5 real student-voice phrases each)

**`tension_equals_hanging_weight`**
- "why isnt the tension just the weight of the hanging block"
- "shouldnt the rope pull with exactly mg since thats whats hanging"
- "the rope holds the weight so why is T less than mg"
- "if the block weighs 19.6 N why does the rope only feel 13 N"
- "doesnt the string always match the weight its carrying"

**`tension_same_throughout_massless_string`**
- "why is the tension the same on both sides of the pulley"
- "does the rope pull harder on the heavy side"
- "shouldnt the string near the block have more tension than near the other block"
- "how can one number be the tension when two different things are attached"
- "if the masses are different why isnt the pull different too"

**`rope_pulls_both_ends_equally`**
- "does the rope choose which end to pull harder on"
- "why does the same rope pull one block forward and the other one up"
- "if its one rope shouldnt it split its pull between the two blocks"
- "how does a single tension act in two different directions at once"
- "why doesnt the pulley change how much force the rope carries"

**`which_body_gets_which_equation`**
- "how do i know which block gets which equation"
- "do i write one equation for the whole system or one for each block"
- "why cant i just add both masses and use one big equation"
- "which block's forces do i write down first"
- "do the two equations have to look different for each block"

**`sign_convention_along_the_string`**
- "why does one block's forward count as the other block's up"
- "how do i keep the signs straight when the rope turns a corner"
- "why is tension positive for one block and negative for the other"
- "does the pulley flip the sign of the acceleration"
- "how do i decide which direction is positive for each block"

**`system_method_vs_free_body_method`**
- "whats the difference between treating them as one system and drawing two free bodies"
- "why does adding the equations make the tension disappear"
- "when should i use the whole-system shortcut instead of two separate equations"
- "do i lose information if i just add the masses together"
- "why does the system method give the same acceleration faster"

---

**DC Pandey check:** consulted the Laws of Motion table of contents for scope only (connected
bodies/pulleys as its own sub-topic after FBD and Newton's laws, per skeleton §9) — no formula, numeric
example, teaching sequence, or figure imported. Every number in this block was derived directly from
`ΣF = ma` per body, the inextensibility constraint `|a₁|=|a₂|`, and verified against the engine's own
runtime output (phase0 §3), not against any textbook worked example.

---

## Board-mode / mode_overrides — DEFERRED (Rule 20 [D])

Not authored, per the active conceptual-only directive. No board mark scheme, no `mode_overrides`.

## EPIC-C branches — ZERO, per skeleton §2/§5.
