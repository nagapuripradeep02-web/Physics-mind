# MATHEMATICS BLOCK — `vector_products_in_space`

> Author: `mathematics_author` · Desk: `Physics-mind-mathematics-vector-products` @ `feat/mathematics-vector-products`, merged master `3ae9047`.
> Upstream: `docs/skeletons/vector_products_in_space_skeleton.md` (founder_proxy Checkpoint A `DESIGN_OK`, cycle 1).
> Renderer: `field_3d`, `scenario_type: "vector_geometry_3d"`, `vg.mode: "products"` — **LIVE on master.**
> Adds rigor; does **not** redesign. Every deviation from the skeleton is flagged with its measurement, never silent.
>
> **⚠ THE ONE-LINE RESULT.** The skeleton is authorable on the shipped renderer with **five corrections and
> three named engine deltas**. The corrections are all mine to make (numbers, poses, easing, one anchor).
> **The three deltas are not** — two of them (§FLAG A, §FLAG B) make a state render a statement that is
> mathematically FALSE, and one (§FLAG C) silently hides a formula surface. **S6 must not ship without
> FLAG A.** Everything else, including the primary aha, is buildable today with zero renderer edits.

---

## 0. Method note — the renderer is the source of truth, and it was read, not cited

Every claim below was re-derived from `src/lib/renderers/field_3d_renderer.ts` at this desk's HEAD and
re-measured with an independent probe. Where the skeleton, the Phase-0 survey and the shipped renderer
disagree, **the renderer wins and the disagreement is named**.

**Instrument check (A21's lesson: independent implementation is not independent verification).** My probe
reproduces four skeleton figures that VG-A independently re-derived on the corrected isotropic metric:

| Quantity | Skeleton | VG-A | This probe |
|---|---|---|---|
| S8 min pairwise separation, 266 747 poses | 18.91° | 18.914° | **18.914°** |
| S8 max projected arm | 0.436 | 0.4364 | **0.4364** |
| S8 min projected arm | 0.0412 | 0.0412 | **0.0412** |
| S8 entry pose | az 0 / el 30 / R 12.99 | same | **az 0.00 / el 30.00 / R 12.99** |
| S4 `a×b` arm, el 70 → el 30 at R 16 | 0.160 → 0.336 (×2.1) | — | **0.1599 → 0.3358 (×2.10)** |
| S7 default-`c` engine values (A22 item 6) | — | V 8.35 / B 4.99 / H 1.67 | **8.3501 / 4.9888 / 1.6737** |

All camera figures below are **FOV 60° / aspect 16:9, perspective, isotropic tangent units
(camX/camZ, camY/camZ), pairwise over every rendered pair, worst case over every live slider and over
every ramp the state drives** (A10 + A14 + A26).

## Engine bug queue consultation (own sweep, run this session with `.env.local` present)

```
query_engine_bug_queue.ts vector_products_in_space   → 7 rows, ALL FIXED
```

| bug_class | Verdict |
|---|---|
| `field3d_has_no_generic_two_vector_scenario_…` [DIRECTIVE/FIXED] | **Satisfied and now genuinely FIXED on master** (the provenance defect the skeleton flagged is closed — PR #75 merged). Its five DO clauses are each honoured below: isotropic metric (§0), Rodrigues tilt (§2f), explore camera solves its radius **and** is scored over the full cartesian product (§2g), Rule 40a on mechanisms not names (I author no mechanism), and the scenario name. |
| `field3d_vector_geometry_parallelepiped_is_a_boolean_solid_…` [FIXED] | **Satisfied and re-verified independently.** Its PROBE demands `base × height == \|a·(b×c)\|` at every fraction to 1e-9. Measured over `f ∈ [0,1]` at 1001 samples: **max drift 3.55e-15** (§2e). Base offset lies in the base plane by construction (`f·k·(b+c)`), so it cannot corrupt the height. |
| `field3d_vector_geometry_authored_readouts_field_collides_…` [FIXED] | **Satisfied.** Every state below authors **`value_readouts`**, never `readouts`, never `static_readouts`. No state in this concept authors `static_readouts` at all. |
| `parallel_direction_cross_product_is_1e17_not_zero_…` [FIXED] | **N/A to `products` mode** (the guard is `vgCommonPerp`'s, a `lines_planes` helper). The equivalent guard in this half is `vgSplitPieces`' `baseArea > 1e-9` and `vgAutoFramePos`' `lx > 1e-6` — both epsilons, both verified reachable-but-not-reached (§2d, §2g). |
| `glow_base_colour_cached_on_first_call_…` [FIXED] | **N/A** — it concerns the `vg_lp_*` reassignable pool. `products` mode uses fixed-role meshes. |
| `quad_winding_negative_control_scored_area_…` · `gate_unique_corner_count_…` [FIXED] | **N/A to authoring** — gate-internal. Recorded so the sweep is complete. |
| `authored_annotation_asserts_a_value_its_own_state_control_can_falsify` [alex:json_author, FIXED] | **BINDS at S5 and S8** — the only two states with live sliders. Discharged by construction: **no string anywhere in this concept states a value.** Every number is a `value_readouts` token computed in 3D from the live vectors. §6 constraint 6. |
| `calculator_dom_harvest_needs_symbol_and_value_in_ONE_text_node` | **Satisfied by the engine**, verified in source: `vgReadoutLine` returns `lab + " = " + vgFx(v, dp)` as one string into one `<div>`. Nothing for me to author. |
| `field3d_hud_negative_zero_at_resonance_quadrature` | **BINDS and is satisfied by the engine's `vgFx` clamp** (`|v| < 0.5·10⁻ᵈᵉᶜ → 0`). Load-bearing here: at `b_tilt ≠ 0` the true `a·(a×b)` is 1.78e-14, not 0. Without the clamp S4's aha would print `-0.00`. §2c. |
| `explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations` · `biot_state6_dotcross_lesson_not_rendered` | **BIND hardest, and they are why §3 carries a rendering-path column.** `field_3d` never paints `scene_composition` annotations. Verified in source: the `products` frame loop reads **nine** element classes and no annotation path. **Zero `annotation` primitives are authored.** |

No `FIX(engine)` is required to build this concept. **Three engine deltas are REQUESTED with severity** (§FLAGS) — two of them are correctness, not polish.

## Source verification

*Consulted the NCERT Mathematics Class 12 chapter index (Ch. 10, Vector Algebra) and the named
international specifications (IB DP AA guide; AP Course & Exam Description; Cambridge 0580/0606;
A-level Further Mathematics) for SCOPE only, feeding the skeleton's §10i-3. NCERT Exemplar consulted for
misconception BELIEFS only (M1/M2/M3). No teaching method, no example problem, no figure imported.
HC Verma and DC Pandey not consulted — physics-only.*
Additionally read in-repo: `src/lib/mathematicsCatalog.ts` — **the concept id is SETTLED as
`vector_products_in_space`** (founder, 2026-08-08) and `lines_and_planes_in_space`'s prerequisite already
points at it. **Skeleton FLAG 3b is CLOSED; nothing for `json_author` to reconcile.**

---

## 1. `engine_config`

**Mathematics quantities are UNITLESS.** The one exception is deliberate and is a *measure*, not a unit:
`theta_deg`, `b_tilt_deg`, `c_theta_deg`, `c_phi_deg` are **angles in DEGREES**. The renderer converts
internally (`vgBuildVectors`: `thetaDeg/2 · π/180`). **No authored expression anywhere uses radians**, and
there is no `PM_interpolate` in this concept at all — `field_3d` computes every number in TypeScript from
`vgBuildVectors`, so `formulas` below is a **documentary contract**, not an evaluated string set.

```jsonc
{
  "variables": {
    "a_mag":       { "name": "length of a",                     "min": 1.0,  "max": 5.0,  "default": 3.0 },
    "b_mag":       { "name": "length of b",                     "min": 1.0,  "max": 5.0,  "default": 2.0 },
    "theta_deg":   { "name": "angle between a and b, degrees",  "min": 20,   "max": 160,  "default": 60 },
    "b_tilt_deg":  { "name": "rotation of b about a-hat, degrees", "min": 0, "max": 60,   "default": 0 },
    "c_mag":       { "name": "length of c (S7 only)",           "min": 0.5,  "max": 4.0,  "constant": 2.0 },
    "c_theta_deg": { "name": "c polar angle FROM +Y, degrees (S7 only)", "min": 0, "max": 180, "constant": 40 },
    "c_phi_deg":   { "name": "c azimuth in the xz-plane, degrees (S7 only)", "min": 0, "max": 360, "constant": 6 }
  },
  "formulas": {
    "a":            "a_mag * (cos(theta_deg/2), 0, +sin(theta_deg/2))",
    "b0":           "b_mag * (cos(theta_deg/2), 0, -sin(theta_deg/2))",
    "b":            "Rodrigues(b0, about = a/|a|, angle = b_tilt_deg)",
    "c":            "c_mag * (sin(c_theta)cos(c_phi), cos(c_theta), sin(c_theta)sin(c_phi))",
    "a_dot_b":      "a . b",
    "cross":        "a x b",
    "cross_mag":    "|a x b| = a_mag * b_mag * sin(theta_deg)",
    "a_dot_cross":  "a . (a x b)",
    "b_dot_cross":  "b . (a x b)",
    "triple":       "a . (b x c)",
    "volume":       "|a . (b x c)|",
    "base_area":    "|b x c|",
    "height":       "|a . (b x c)| / |b x c|",
    "flip":         "b x a = Rodrigues(a x b, about = a/|a|, angle = 180 deg) = -(a x b)"
  },
  "computed_outputs": {
    "theta_deg":    "vg.value_readouts token 'theta_deg'  -> 'θ = 60°'          — 0 dp, engine-fixed",
    "a_mag":        "token 'a_mag'        -> '|a| = 3.00'  — 2 dp",
    "b_mag":        "token 'b_mag'        -> '|b| = 2.00'  — 2 dp",
    "a_dot_b":      "token 'a_dot_b'      -> 'a·b = 5.64'  — 2 dp, signed",
    "cross_mag":    "token 'cross_mag'    -> '|a×b| = 6.50' — 2 dp",
    "a_dot_cross":  "token 'a_dot_cross'  -> 'a·(a×b) = 0.00' — 2 dp, zero-clamped",
    "b_dot_cross":  "token 'b_dot_cross'  -> 'b·(a×b) = 0.00' — 2 dp, zero-clamped",
    "volume":       "token 'volume'       -> 'Volume = 9.95' — 2 dp, UNSIGNED",
    "base_area":    "token 'base_area'    -> 'Base = 4.27'   — 2 dp",
    "height":       "token 'height'       -> 'Height = 2.33' — 2 dp"
  },
  "constraints": [
    "theta_deg is DEFINED on (0, 180) and DRAWN on [6, 160]; the sandbox slider is clamped to [20, 160] so a x b can never be the zero vector and its direction is never undefined",
    "a . (a x b) = 0 and b . (a x b) = 0 identically, for every a and b in R^3 with no hypothesis — the concept's only universally quantified claim; measured max 1.78e-14 over 77 409 configurations and printed 0.00 by the engine's vgFx zero-clamp",
    "b_tilt_deg is a Rodrigues rotation ABOUT a-hat, so theta, |b|, |a x b|, a.(a x b) and b.(a x b) are ALL exactly invariant under it — measured worst error 6.04e-14 deg / 1.78e-15 over 77 409 configurations",
    "|b x c| > 0 is required for Height and for the split; at the authored c it is 4.2708, and vgSplitPieces guards baseArea > 1e-9 so a coplanar triple returns Height 0 rather than NaN",
    "the split is a VOLUME-EXACT shear: |a(f).(b x c)| = |a.(b x c)| for every f in [0,1] — measured max drift 3.55e-15, so Volume, Base and Height do not move by one displayed digit while the solid does",
    "every displayed number is 2 dp except theta_deg which is 0 dp; BOTH are fixed in the renderer (VG_READOUT_DP / vgReadoutLine) and are NOT authorable — no state may state a precision the engine does not print"
  ]
}
```

**`slider_controls` — the live authoring surface (`vgSc` reads `config.slider_controls[key]`).** These are
what the sandbox actually renders; `variables` above is documentary.

| key | min | max | step | default | label |
|---|---|---|---|---|---|
| `theta_deg` | 20 | 160 | 1 | 60 | `θ (a, b)` |
| `a_mag` | 1.0 | 5.0 | 0.25 | 3.0 | `\|a\|` |
| `b_mag` | 1.0 | 5.0 | 0.25 | 2.0 | `\|b\|` |
| `b_tilt_deg` | 0 | 60 | 5 | 0 | `b tilt` |

These are the renderer's own defaults, so authoring them is a **declaration**, not an override — but author
them anyway: a later renderer default change would otherwise silently move the camera solve's domain.

---

## 2. Domain & validity ledger

**THE CENTRAL ARTIFACT.** Every relation this concept displays, with its domain, its drawn interval, its
boundary behaviour, and — for every "for all / always / never" — the named theorem with its hypotheses
checked against the sim's own setup.

### 2a. The apparatus, and what it can and cannot represent

```
a = |a| (cos(θ/2), 0, +sin(θ/2))            a and b straddle +x symmetrically in the xz-plane
b₀ = |b| (cos(θ/2), 0, −sin(θ/2))            so a×b runs along +Y BY CONSTRUCTION
b  = R_â(β) · b₀                             β = b_tilt_deg, Rodrigues about â
```

**What this parametrisation CANNOT reach, stated because it bounds every claim:** `a` and `b` always have
their tails at the origin and `a` always lies in the xz-plane. The concept therefore never draws
free vectors, never draws a translated vector, and never draws `a` out of the ground plane. **No narration
may say "any two vectors in space" while only this family is drawn.** It may — and does — say *"two arrows
from the same point"*, which is exactly true of everything on screen. (Rule 25: the claim matches the
picture; the generality lives in the theorems named below, not in the drawing.)

### 2b. `θ` — the driving quantity

| | |
|---|---|
| **Defined on** | `(0°, 180°)` — the angle between two non-zero vectors. At `0°` and `180°` the vectors are parallel and `a×b`'s DIRECTION is undefined (its magnitude is 0). |
| **Drawn interval** | **`[6°, 160°]`** across the whole concept. S1 opens at 6°, S3 reaches 130°, the sandbox slider spans `[20°, 160°]`. |
| **Slider domain** | `[20°, 160°]` — narrower than the drawn interval, deliberately. |
| **Excluded** | `0°`, `180°`. **Unreachable by construction**, both by the ramp `from` values and by the slider clamp. |
| **Boundary behaviour** | As `θ → 0⁺`: `a·b → +|a||b|`, `|a×b| → 0`, the green arrow shrinks below the renderer's `0.02` draw threshold and disappears. As `θ → 180⁻`: `a·b → −|a||b|`, same collapse. **Neither boundary is drawn.** |
| **Engine precision** | `vgReadoutLine` prints `theta_deg` at **0 dp**: `θ = 60°`. |

> ⚠ **CORRECTION TO THE SKELETON.** The skeleton writes `θ = 60.0°` in six places (§3 control table,
> §10b label table, §10h HUD table). The engine prints **`θ = 60°`** — `vgReadoutLine`'s `theta_deg`
> branch is hardcoded `vgFx(vals.theta_deg, 0)`. **Renderer wins.** No narration may quote a tenth of a
> degree; none below does.

> ⚠ **MATHEMATICS-FORCED CHANGE — S1's ramp starts at 6°, not 0°.** The skeleton authors `b` sweeping
> `0° → 60°`. `vgAnimValue` returns the ramp's `from` for the whole pre-roll, so `θ = 0` would hold for
> the entire 1400 ms grow-in with `b` (length 2.0) lying exactly inside `a` (length 3.0): two coincident
> shafts, z-fighting, and an angle arc of zero extent under a `θ` glyph. **`from: 6` is the smallest
> change that keeps the skeleton's beat ("b sweeps up from a") while giving two distinguishable arrows
> from the first frame.** It also removes `θ = 0` from the drawn interval, which is the honest place for
> it: `a×b` is the zero vector there and the concept never claims otherwise.

### 2c. `a·b` — the dot product

| | |
|---|---|
| **Definition used** | `a·b = \|a\|\|b\| cos θ`. Equivalent to the coordinate form; **the coordinate form is never shown** (it is the skeleton's declared exclusion). |
| **Domain** | All of `R³ × R³`. No exclusions whatsoever. |
| **Range over the drawn interval** at `\|a\|=3, \|b\|=2` | `[6 cos 160°, 6 cos 6°] = [−5.638, +5.967]` |
| **S2's drawn sub-interval** `θ ∈ [20°, 60°]` | `a·b ∈ [3.000, 5.638]` — **strictly positive, strictly monotone**, one sign only |
| **S3's drawn sub-interval** `θ ∈ [20°, 130°]` | `a·b ∈ [−3.857, 5.638]`, **attaining 0 exactly at θ = 90°** |
| **The zero is ATTAINED, not approached** | `cos` has a genuine zero at `90°`; this is not a limit. The state may say "is zero", never "gets close to zero". |
| **Verified values** | `θ=60°: 3.0000` (exact, `6 × ½`) · `θ=20°: 5.638156 → 5.64` · `θ=90°: 0.000000 → 0.00` · `θ=130°: −3.856726 → −3.86` |

**Every "always / never" claim about `a·b`, traced:**

| Claim | Named fact | Hypotheses | Satisfied here? |
|---|---|---|---|
| S3 formula surface `a·b = 0 at θ = 90°` | `cos 90° = 0` | none (instant-scoped to this state's own `a`, `b`) | ✓ trivially. **Deliberately NOT the biconditional `a·b = 0 ⟺ a ⟂ b`** — that form needs `a ≠ 0, b ≠ 0` and is notation the core ring does not own (38c). |
| Assessment item 2: `a·b = 0` for two **non-zero** vectors ⇒ `θ = 90°` | `\|a\|\|b\| cos θ = 0` with `\|a\|,\|b\| ≠ 0` ⇒ `cos θ = 0` | **non-zero is stated in the item** ✓ | ✓ correct as written |
| Assessment item 1: `a·b < 0` ⇒ `θ > 90°` | same | non-zero, implicit in "the angle between `a` and `b`" | ✓ correct |
| Narration "the number measures how much of `b` points along `a`" | `a·b = \|a\| · (\|b\| cos θ)` — `\|a\|` times the signed component of `b` along `â` | none | ✓ true, and it is **the only sentence in the concept that describes something the picture does not draw** — see FLAG B |

### 2d. `a×b` — the cross product

| | |
|---|---|
| **Domain** | All of `R³ × R³`, no exclusions. `a×b` is **defined** everywhere, including when `a ∥ b` (it is then the zero vector); only its **direction** is undefined there. |
| **Drawn on** | S4 (θ 130°→60°), S5 (θ=60°, `\|b\|` 2.0→2.5), S6 (frozen, flipped), S8 (sandbox). |
| **Magnitude range, drawn** | S4: `\|a×b\| = 6 sin θ ∈ [4.596, 5.196]` · S5: `[5.196, 6.495]` · S6: `6.495` frozen · S8: `[0.342, 25.000]` over the full slider product |
| **Smallest arrow reachable** | **0.342** world units (`\|a\|=\|b\|=1, θ=20°`). Renderer floor is `Math.max(0.05, len)` — **6.8× clear, so the floor NEVER clamps and the length ratio the sandbox teaches is never falsified.** |
| **Exact vs decimal** | `\|a×b\|` at `\|a\|=3, \|b\|=2.5, θ=60°` is **`15√3/4`** exactly `= 6.495191…`; the HUD prints `6.50`. At `\|b\|=2.0` it is **`3√3`** `= 5.196152…` → `5.20`. **The exact surds live on the formula surface's symbolic form; only the HUD rounds.** |

**The concept's ONE universally quantified claim, and it is safe:**

> **Theorem.** For every `a, b ∈ R³`: `a·(a×b) = 0` and `b·(a×b) = 0`.
> **Hypotheses: none.** It holds for the degenerate case too (`a×b = 0 ⇒ both dots are 0`).
> **The sim's setup:** every `(a, b)` the concept can produce is in `R³`, so the hypothesis set is
> satisfied vacuously at every frame, under every slider, under every tilt.
> **Measured:** `max(|a·(a×b)|, |b·(a×b)|) = 1.78e-14` over 77 409 configurations
> (`θ ∈ [20,160]` × `tilt ∈ [0,60]` × `|a| ∈ {1,3,5}` × `|b| ∈ {1,2,5}`) — floating-point residue only.
> **Printed as `0.00` by the engine's `vgFx` zero-clamp** (`|v| < 0.005 → 0`). Without that clamp a tilted
> sandbox would print `-0.00` under the aha. **This is the only place in the concept where an engine
> guard is load-bearing for a teaching claim.**

**S4's aha is therefore arithmetic, not pixels** (Rule 33d / D4). Two numbers that read `0.00` from every
camera pose, at every tilt, under every drag. **Projection preserves neither angle nor collinearity; these
two numbers survive all of it.**

**Anticommutativity (S6):**
> **Theorem.** `b×a = −(a×b)` for every `a, b ∈ R³`. **Hypotheses: none.**
> **Engine mechanism, verified:** `flip_frac` rotates `a×b` about `â` by `π·flip_frac`. Since `â ⟂ (a×b)`,
> a half-turn about `â` maps `a×b` exactly onto `−(a×b)`. **Measured `max |R_â(π)(a×b) + (a×b)| = 1.78e-15`**
> over 21×9 samples. So the arrow that ends S6 **IS** `b×a`, not an approximation of it.
> **Note for the assessment:** item 5's "same length, opposite direction" is degenerate when `a ∥ b`
> (both are the zero vector). Not reachable in the sim, and the item's intended answer is unambiguous —
> recorded, not changed.

**Area (S5):**
> **Theorem.** `|a×b|` equals the area of the parallelogram spanned by `a` and `b`, for every `a, b ∈ R³`.
> **Hypotheses: none** (it degenerates correctly: `a ∥ b` gives a segment, area 0 = `|a×b|`).
> **The DEMONSTRATION is one interval** — S5 fixes `θ = 60°` and moves only `|b| ∈ [2.0, 2.5]`.
> **Binding narration duty:** S5 states the identity as an identity. It must **never** say "watch — it
> works for every angle", because the state never varies the angle. The generality is a theorem, not an
> induction from 51 sampled frames. The narration below obeys this.

### 2e. The triple product and the volume (S7, advanced ring)

| | |
|---|---|
| **`a·(b×c)`** | the **SIGNED** volume. Token `triple`, label `a·(b×c)`. |
| **`\|a·(b×c)\|`** | the **UNSIGNED** volume. Token `volume`, label `Volume`. |
| **⚠ Two tokens, one quantity** | `triple` and `volume` differ by a sign for a left-handed triple. **S7 authors `volume` ONLY.** Authoring both would put two instruments on one quantity (`patterns/mathematics.md` hazard 4) and would disagree the moment `c` crossed the `a,b` plane. At the authored `c`, `a·(b×c) = +9.951209`, so they happen to agree — **which is exactly why the trap is invisible and why the rule is "author one".** |
| **`Base = \|b×c\|`** | requires `b ∦ c`. At the authored `c`: `4.270752`. Guarded by `baseArea > 1e-9` (an epsilon, not `=== 0` — the FIXED scar). |
| **`Height = \|a·(b×c)\| / \|b×c\|`** | `2.330084`. Returns `0` (not NaN) when `Base = 0`. |
| **Excluded point, reachable in principle** | `c_theta_deg = 90°` with `b_tilt = 0` puts `c` in the `a,b` plane: the triple is coplanar, `Volume = 0.00`, `Height = 0.00`, NaN-free. **Verified in the shipped gate** (`check:vector-geometry-3d` asserts `\|a·(b×c)\| = 0` there to 1e-12). **Not reachable in this concept** — S7 authors `c` as a constant and exposes no `c` control; S8 shows no `c` at all (38b). **Recorded because assessment item 6 examines exactly this case and the sim never draws it: item 6 is a legitimate transfer item, and no state claims to demonstrate coplanarity.** |

> **THE SPLIT'S IDENTITY, verified rather than trusted.**
> `a(f) = (1−f)·a + f·s·h·n̂` where `n̂ = norm(b×c)`, `h = |a·(b×c)|/|b×c|`, `s = sign(a·(b×c))`.
> Then `a(f)·(b×c) = (1−f)V + f·s·h·|b×c| = V` for **every** `f`.
> **Measured over 1001 samples of `f ∈ [0,1]`: max drift 3.55e-15.**
> So `Volume`, `Base` and `Height` do not move by one displayed digit while the solid visibly straightens.
> **That invariance IS the lesson (Cavalieri), and it is exact in real arithmetic, not within a tolerance.**
> The base parallelogram is extracted along `f·k·(b+c)`, which lies **in the base plane** by construction
> (both `b` and `c` do), so it has zero component along `n̂` and cannot corrupt the height the picture reads.

### 2f. `b_tilt_deg` — the invariance proof, run not asserted

`b = R_â(β)·b₀`. `R_â` is a rotation fixing `a`, so `a×R(b) = R(a)×R(b) = R(a×b)`.
Consequences, **all exact**, measured over 77 409 configurations:

| Quantity | Worst deviation from the slider/theorem |
|---|---|
| `θ_true − θ_slider` | **6.04e-14 °** |
| `\|b\| − b_mag` | **1.78e-15** |
| `\|a×b\| − \|a\|\|b\| sin θ` | **1.07e-14** |
| `a·(a×b)`, `b·(a×b)` | **1.78e-14** |

**So the HUD, the angle arc, the formula surface and the slider can never disagree.** This is the fix for
the 41.98° defect the skeleton found; it is now shipped in `vgBuildVectors` and I re-derived it here
independently rather than accept it.

### 2g. The sandbox camera — worst case over EVERYTHING that moves

`position = R·normalize(â + b̂ + n̂)`, `n̂ = norm(a×b)`, `R = 2.5·max(|a|, |b|, |a×b|)`.

```
FOV 60, aspect 16:9, isotropic tangent units, half-extent 0.5774 (vert) / 1.0264 (horiz)
axes swept: theta [20,160] step 2  x  a_mag [1,5] step .25  x  b_mag [1,5] step .25  x  b_tilt [0,60] step 5
            = 266 747 poses, 4 of 4 live sliders
MIN pairwise separation = 18.914 deg      MAX projected arm = 0.4364 (on frame)   MIN arm = 0.0412
```

> ⚠ **THE EXTREMA ARE PLATEAUS — quantified, per the A19 carry-forward warning.** The minimum pairwise
> separation is attained at **3757 distinct poses**, the maximum arm at **429**, the minimum arm at **26**.
> The auto-frame direction is magnitude- and tilt-invariant, which is precisely why an angular argmin is a
> large flat set. **No constraint, caption or narration below names a corner as "the worst case."** The
> constraint block says *"worst case over the swept product"*, which is the only true form.

---

## 3. Timeline + control spec + narration (Rule 31)

**Rendering paths — the nine element classes `products` mode actually draws** (read from the frame loop;
anything not on this list does not exist on screen):
`vg_vector_a` · `vg_vector_b` · `vg_vector_c` · `vg_cross_vector` · `vg_angle_arc` · `vg_parallelogram` ·
`vg_parallelepiped` · `vg_base_face` · `vg_height_seg` · plus `vg_label` sprites (`a`, `b`, `c`, `a×b`, `θ`).
**Text paths:** `#vg_readout` (top-LEFT, `top:52px;left:12px`, Cambria Math — **not top-right**, the
skeleton's §10h is wrong and the renderer wins) · `#formula_overlay` (bottom-RIGHT, monospace, 300 px max)
· `#caption` (the ≤5-word delta cue) · `#vg_sliders` (bottom-RIGHT, bottom-anchored so it clears the
"Full screen" chrome by construction — the `field3d_sliders_panel_top12_vs_fsbtn_top10` scar is
**satisfied without authoring**).

**`reveal_ms` is load-bearing and is NOT a cosmetic default.** `growT = show_sliders ? 1 : min(1, stateMs/reveal_ms)`
scales **both `a` and `b` from zero** on every guided state entry. A state that must keep the apparatus
standing (Rule 32d home pose) authors **`reveal_ms: 1`**. Only S1 wants the grow-in. `arc_reveal_frac`,
`cross_reveal_frac` and `c_reveal_frac` each **default to that same ease**, so a state that ramps one
explicitly must also pin `reveal_ms`.

**Precision doctrine (engine-fixed, not authorable):** every products readout is **2 dp**; `theta_deg` is
**0 dp**. Constant across all eight states. No state may print a third digit or quote one in narration.

---

### STATE_1 — "Two Vectors from One Point"
`reveal-build` · cue **"Two vectors, one angle"** · core · `manual_click` · **no controls**
**Camera:** `camera_position` for az 90 / el 70 / R 10, `camera_mode: "authored"`.
**`vg`:** `mode: "products"`, `a_mag: 3.0`, `b_mag: 2.0`, `theta_deg: 6`, `show_angle_arc: true`,
`show_cross_vector: false`, `reveal_ms: 1200`, `value_readouts: ["a_mag","b_mag","theta_deg"]`.
**`animate`:** `{theta_deg, 6 → 60, start 1400, dur 2000}` · `{arc_reveal_frac, 0 → 1, start 3400, dur 800}`.
**Beat:** `a` and `b` grow in together 0–1200 ms → they separate 1400–3400 ms → the arc draws 3400–4200 ms.
**Rule 32a:** the arrows move first; the arc — a *measurement of* that motion — lands 0 ms after they stop,
a full beat later. ✓
**Formula surface:** none.
**The real NUMBER:** `θ` live, `6° → 60°`.
**Camera, measured:** min pairwise over `{a, b}` swept across the whole drawn `θ` range = **18.82°** at
`θ = 20°`; max arm **0.3145** at `θ = 123°`; min arm **0.1764** at `θ = 160°`. All on frame
(limit 0.5774 vertical). *(Skeleton claims 0.296 / 0.197 — both slightly off; the verdicts survive.)*
**Narration (51 words; the anchor is the first two sentences, 26 words, verbatim from the skeleton):**
> "Pull a suitcase by its strap. Pull it straight forward and all of the pull moves it. Pull at an angle
> and only part of it does. Here are two arrows, a and b, from the same point; each has a length and a
> direction. The angle between them is θ."

**Anchor check.** The claim is about the *component of the pull along the direction of travel* — exactly
`|F| cos θ`. It asserts nothing about area, torque or swept regions. **No over-claim.** Universal (a
suitcase with a strap exists everywhere; no country, brand, currency or named person). Rule 41: every word
literal; the suitcase does not want or resist anything.

---

### STATE_2 — "The Dot Product Measures Alignment"
`parameter-sweep` *(declared Rule-31b contrast pair with S3)* · cue **"Angle closes, number grows"** ·
core · `manual_click` · **no controls**
**Camera:** unchanged (az 90 / el 70 / R 10).
**`vg`:** `theta_deg: 60`, `show_angle_arc: true`, `reveal_ms: 1`,
`value_readouts: ["theta_deg","a_dot_b"]`.
**`animate`:** `{theta_deg, 60 → 20, start 400, dur 4600}`.
**Formula surface:** `a·b = |a| |b| cos θ`
**The real NUMBER:** `a·b` climbs `3.00 → 5.64`; `θ` falls `60° → 20°`.
**Delta vs S3:** one monotone ramp, one sign, no critical point.

> ⚠ **RULE 32a EXEMPTION, DECLARED — I will not fake a lag.** The skeleton authors the effect (a violet
> projection segment) lagging the cause (θ) by 600 ms. **That segment does not exist in `products` mode**
> (FLAG B). With it gone, the only two rendered quantities are `θ` and `a·b`, and `a·b` is a *function of
> θ evaluated in the same frame* — not a downstream effect with a propagation delay. **Rule 32a governs
> causal chains between two rendered objects; here the relation is an identity.** Staging a fake 600 ms
> delay would render a number that disagrees with the arrows beside it, which is this wave's own recorded
> defect class. **Exemption declared, reason given, routed to `quality_auditor`.** The same exemption
> covers S3 and S5.

**Dialect (38d), first appearance:** "the dot product, also called the scalar product" — then bare.
**Narration (35 words):**
> "The dot product, also called the scalar product, is one number. It measures how much of b points along
> a. As the angle shrinks the number grows: 3.00 at sixty degrees, 5.64 at twenty degrees."

---

### STATE_3 — "Zero at Ninety Degrees, Then Negative"
`parameter-sweep` *(THE contrast pair of S2 — same knob, same tracked number, opposite outcome)* ·
cue **"Number reaches zero, then reverses"** · core · `manual_click` · **no controls** ·
**`misconception_watch`: M1**
**Camera:** unchanged.
**`vg`:** `theta_deg: 20`, `show_angle_arc: true`, `reveal_ms: 1`,
`value_readouts: ["theta_deg","a_dot_b"]`.
**`animate` (three segments as ONE list — verified against `vgAnimValue`'s "last opened window wins" rule,
including that the closed second window does **not** drag the value back during the hold):**
`{theta_deg, 20 → 90, start 0, dur 2400}` · `{theta_deg, 90 → 130, start 3400, dur 2200}`
→ ramp `[0, 2400]`, **HOLD `[2400, 3400]` at exactly 90° with `a·b = 0.00`**, ramp `[3400, 5600]`.
**Formula surface:** `a·b = 0 at θ = 90°` *(instant-scoped, algebra-only — deliberately NOT the
biconditional `⟺`, which needs the non-zero hypothesis and is notation the core ring does not own)*
**The real NUMBER:** `a·b`: `5.64 → 0.00 → −3.86` (verified: `6cos20° = 5.638156`, `6cos90° = 0`,
`6cos130° = −3.856726`).
**M1 — "two non-zero things multiplied can never give zero":** the counter is a **full second held at
exactly `0.00`** with two arrows visibly present and neither of them zero, followed by the sweep
*continuing* so the zero is seen as a **crossing**, not a wall.
`one_line_fix`: **"The dot product measures alignment. At ninety degrees there is none, and past ninety
degrees it points the other way."**
**Longest static run:** the 1000 ms hold = 17.9 % of a 5600 ms timeline. **It IS the claim.**
**Narration (42 words):**
> "Now open the angle. The number falls, and at exactly ninety degrees it is 0.00 — two arrows, neither of
> them zero, and their dot product is nothing. Keep opening. Past ninety degrees the number is negative: at
> 130 degrees it reads −3.86."

---

### STATE_4 — "The Cross Product Points Out of the Plane" — **PRIMARY AHA**
`rotate-to-reveal` · cue **"New arrow leaves the plane"** · core · `manual_click` · **no controls** ·
**`misconception_watch`: M2**
**Camera:** `camera_mode: "steps"` + `camera_position` for the base pose az 90 / el 70 / R 10.
```jsonc
"camera_steps": [
  { "at_ms": 0,    "az": 90, "el": 70, "dist": 10, "ease_ms": 0    },
  { "at_ms": 200,              "dist": 16, "ease_ms": 1200 },   // staging dolly (inherits az/el)
  { "at_ms": 2800,  "el": 30,             "ease_ms": 1600 }    // THE reveal tilt (inherits az/dist)
]
```
**Verified against `vgCamScheduleAt`:** each step inherits unnamed fields from the step before it ✓; the
pose is a **pure function of state-local ms**, so the tilt settles at **4400 ms on every machine**,
frame-rate independent, and reproduces byte-identically under `SET_TIME_FREEZE`. **The skeleton's
`lerpSpherical` design-around is correctly withdrawn.**
**`vg`:** `theta_deg: 130`, `show_cross_vector: true`, `show_angle_arc: true`, `reveal_ms: 1`,
`value_readouts: ["a_dot_cross","b_dot_cross"]`.
**`animate`:** `{theta_deg, 130 → 60, start 0, dur 1400}` · `{cross_reveal_frac, 0 → 1, start 1600, dur 1000}`.
**Formula surface: NONE** — this is a direction state (Rule 34b permits zero surfaces; S1 also has none).
**⚠ `cross_mag` is NOT authored.** This is the skeleton's load-bearing Cut-2 decision: under `core_only`,
S5 is gone and a `|a×b|` number on S4 would be an orphaned quantity whose only explanation was just cut.
**The real NUMBER: `a·(a×b) = 0.00` and `b·(a×b) = 0.00`, both live, both pinned through the tilt.**
**Rule 32a, genuinely satisfied here:** staging (θ + dolly) completes at 1400 → the new object appears
1600–2600 → the camera reveals its LENGTH from 2800. Three beats, never simultaneous. The tilt reveals
*how long* the arrow is, never *that it exists*.
**Camera, measured (FOV 60 / 16:9, at R 16):** `a×b` projected arm **0.1599 at el 70 → 0.3358 at el 30
(×2.10)**; min pairwise over `{a, b, a×b}` at el 30 = **32.20°**; the two taught pairs `a^(a×b)` and
`b^(a×b)` are **symmetric** by the scene convention. All on frame.
**M2 — "the cross product is just another multiplication, so it gives a number":** the contrast beat is
that what appears is not a readout, it is an **arrow**, and the two dot readouts prove perpendicularity
**arithmetically** using the zero-dot-product test taught one state earlier.
`one_line_fix`: **"The cross product makes a new vector, not a number. Its direction is part of the answer."**
**Dialect (38d), first appearance:** "the cross product, also called the vector product" — then bare.
**Direction rule — the skeleton's last open ASSUMPTION, CLOSED as a NO:**
> `extras.right_hand` is a **top-level config field**, not scenario-gated, so it *is* reachable from
> `vector_geometry_3d`. **But what ships is the GRIP rule** — a 2D corner card with cases `'A' | 'B' |
> 'solenoid'` (thumb = current, fingers = B) and an optional 3D grip mesh built from a `thumb_direction`
> plus a `finger_curl`. **None of them is the cross-product right-hand rule** (fingers along `a`, curl
> toward `b`, thumb gives `a×b`), and the skeleton itself rules the grip rule out as having no referent
> here. **Verdict: do NOT author `extras.right_hand`.** S4's rule is carried by narration plus the two
> zero readouts — which is what the skeleton said was sufficient, and it is: the readouts, not a hand,
> are what make the claim true.
**Narration (47 words):**
> "There is a second product. It does not give a number — it gives a new arrow, the cross product, also
> called the vector product. It stands out of the plane a and b share. Both readouts hold at 0.00, so the
> new arrow is perpendicular to both."

---

### STATE_5 — "The Cross Product's Length Is an Area"
`linear-stretch` · cue **"The parallelogram appears"** · **extended** · `manual_click` ·
**live control: `b_mag`**
**Camera:** az 90 / el 30 / R 16, carried from S4's end pose. **Zero camera movement** — deliberately: a
camera that dollied out as the quad grew would cancel the growth on screen.
**`vg`:** `theta_deg: 60`, `b_mag: 2.0`, `show_parallelogram: true`, `show_cross_vector: true`,
`show_angle_arc: true`, `controls: ["b_mag"]`, `value_readouts: ["cross_mag"]`.
**State-level:** `show_sliders: true` → `growT` is forced to 1, so `a`, `b` and `a×b` are at full length
from frame 0 (Rule 32d home-pose continuity, achieved by the engine rather than by `reveal_ms`).
**`animate`:** `{b_mag, 2.0 → 2.5, start 1200, dur 3800}`.
**Formula surface:** `|a×b| = |a| |b| sin θ`
**The real NUMBER:** `|a×b|`: `5.20 → 6.50` — exact forms `3√3 = 5.196152` and `15√3/4 = 6.495191`.
**ONE instrument, and the skeleton's declared exception dissolves.** §10g asked me to assert that `Area`
and `|a×b|` agree at every sampled frame. **`VG_READOUT_LABEL` has no `area` token** — the engine prints
`|a×b|` and nothing else. So there is exactly one instrument for the quantity, and
`patterns/mathematics.md` hazard 4 cannot fire. **This is better than what was asked for; recorded rather
than worked around.**
**Cliff patch (Block 1, second cliff):** the narration names `|a||b| sin θ` as "base times perpendicular
height" once. Done below.
**Camera, measured across the whole `b_mag` ramp:** min pairwise **32.20°**, max arm **0.4411**, min arm
**0.1069**. On frame. *(Skeleton claims min arm 0.119; measured 0.1069. Verdict unchanged.)*
**Generality duty (§2d):** the state fixes `θ` and varies only `|b|`. The narration states the identity as
an identity and **does not** claim it was verified across angles.
**Narration (41 words):**
> "The parallelogram that a and b span appears. Now lengthen b. The parallelogram grows and the green
> arrow grows with it. The arrow's length is the area of that parallelogram — base times perpendicular
> height. The reading runs from 5.20 to 6.50."

---

### STATE_6 — "Swap the Order and the Direction Flips"
`rotate/flip` · cue **"Order swapped, arrow flipped"** · **extended** · `manual_click` · **no controls** ·
**`misconception_watch`: M3**
**Camera:** az 90 / el 30 / R 16, carried. Zero movement.
**`vg`:** `theta_deg: 60`, `b_mag: 2.5` *(= S5's exit; continuity closed)*, `show_cross_vector: true`,
`show_angle_arc: true`, `reveal_ms: 1`, `value_readouts: ["cross_mag"]`.
**`animate`:** `{flip_frac, 0 → 1, start 2000, dur 1000}`.
**Formula surface:** `b×a = −(a×b)` — **authored for the whole state, because `formula_overlay` is a
per-state string and cannot be scheduled.** The skeleton's "order label flips at 2000 ms" is not
authorable; the identity is stated and the picture then demonstrates it.
**The real NUMBER:** `|a×b| = 6.50`, **frozen**, while the arrow reverses.

> ⚠ **RULE 33d TENSION, DECLARED.** S6 is the only state whose number does **not** change — and that is
> half its claim (the length is invariant). The other half (the direction reverses) has **no readout token
> in `VG_READOUT_LABEL`**: the products set is `a_mag, b_mag, theta_deg, a_dot_b, cross_mag, a_dot_cross,
> b_dot_cross, triple, volume, base_area, height`. There is no direction or sign token. `a_dot_cross` and
> `b_dot_cross` are computed from `axb`, not from the flipped `crossDrawn`, so they hold at `0.00` too.
> **The skeleton's `direction: +y → −y` HUD line does not exist.** Zero-code disposition: the frozen
> `|a×b|` carries the invariance, the picture carries the reversal, the formula surface carries the
> identity. **Sized remedy: FLAG C.**

**M3 — "vector multiplication commutes":** the scene is frozen, only the one arrow turns, and the length
reading does not move by a single digit while it does.
`one_line_fix`: **"Swapping the order reverses the cross product: b×a = −(a×b)."**
**Static-run remedy (skeleton FLAG 5, 2000 ms = 33 % of a 6000 ms timeline).** The skeleton's proposed
remedy — a brightness pulse plus a character-by-character order label — **is not authorable**: the order
label is a static `formula_overlay` string, and Rule 32e/`state_glow_focal_dims_one_half_of_the_relation…`
forbids a state-level glow focal here (S6's claim is a relation between an arrow and its own reversal).
**Disposition: shorten the opening hold to 1000 ms** — `{flip_frac, 0 → 1, start 1000, dur 1000}` — giving
a 1000 ms static run over a 5000 ms timeline (**20 %**, inside the directive's guidance) and preserving the
"scene holds still, then only the arrow moves" reading. **`mathematics_author`'s change; verify by dense
frame diff at THE EYE, do not assume.**
**Narration (35 words):**
> "Swap the order. Write b×a instead of a×b and the same arrow turns through the plane to point the
> opposite way. The length reading does not change: 6.50 before, 6.50 after. Only the direction reverses."

---

### STATE_7 — "Three Vectors Span a Volume" — **advanced ring**
`decompose` · cue **"A third vector, a volume"** · **advanced** · `manual_click` · **no controls** ·
`teaching_method: derivation_first_principles`
**⭐ THE SOLVED `c` — the skeleton's targets do not fall out of the defaults, and the rounding decides.**

```
AUTHORED:  a_mag 3.0 · b_mag 2.5 · theta_deg 60 · b_tilt 0
           c_mag 2.0 · c_theta_deg 40 · c_phi_deg 6          <-- SOLVED, replaces the skeleton's guess
TRUE:      Volume 9.951209   Base 4.270752   Height 2.330084   a.(b x c) = +9.951209
DISPLAYED: Volume 9.95       Base 4.27       Height 2.33
CLOSURE:   4.27 x 2.33 = 9.9491  ->  rounds to 9.95  ==  displayed Volume        MARGIN 0.0041
```

> **The skeleton's triple (9.95 / 4.25 / 2.34) CANNOT close, and the reason is exact.**
> `4.25 × 2.34 = 9.945` — **precisely the 2-dp rounding boundary**, margin **0.0000**. An exhaustive search
> of the whole feasible `c` family confirms: with `Base_d = 4.25` and `Height_d = 2.34` the best achievable
> `|Base_d × Height_d − Volume_d|` is **0.0050**, i.e. the boundary itself, on every member. The nearby
> triple **9.95 / 4.27 / 2.33** closes with a margin of **0.0041** below the boundary, and `c_mag` lands on
> a clean **2.00**. **Two displayed digits move; the headline number does not.**
> Also note: `c_theta_deg` is the polar angle **FROM +Y**, so the solved `c_theta_deg = 40` *is* the
> skeleton's "elevation 50°" — the skeleton's `c` azimuth (65°) is what moved.

**Camera — RE-SOLVED, because moving `c` invalidates the authored pose.**
```jsonc
"camera_mode": "steps",
"camera_steps": [
  { "at_ms": 0, "az": 90, "el": 30, "dist": 16, "ease_ms": 0    },   // S6's exact end pose
  { "at_ms": 0, "az": 60,           "dist": 12, "ease_ms": 1800 }    // the ONE reframe (el inherited)
]
```
| | Skeleton (az 30 / el 25 / R 10) | **Authored (az 60 / el 30 / R 12)** |
|---|---|---|
| worst min pairwise over `{a, b, c, height-segment}`, swept over the whole split `f ∈ [0,1]` | **1.22°** and **OFF-FRAME** (max horizontal 1.680 vs limit 1.0264) | **40.89°**, on frame (max horizontal 0.905, max vertical 0.243) |
| min projected arm | — | **0.1331** (floor 0.13) ✓ |
| reframe shape | pan 60° **+ elevation change + dolly 16→10** | **pan 30°, elevation UNCHANGED, dolly 16→12** |

**The elevation is held at S6's own 30°, so the reframe is a pure pan plus a dolly.** That wins Rule-32d
home-pose continuity for free — the same move A21 §4 found available on `#9`'s S3 and this skeleton had
not looked for.
**`vg`:** `show_c: true`, `show_parallelepiped: true`, **`show_cross_vector: false`**,
`show_angle_arc: false`, `split_gap_k: 1.0`, `reveal_ms: 1`,
`value_readouts: ["volume","base_area","height"]`.
**`animate`:**
`{c_reveal_frac, 0 → 1, start 1800, dur 1200}` ·
**`{solid_build_frac, 0 → 1, start 3000, dur 1600, easing: "linear"}`** ·
`{split_solid_frac, 0 → 1, start 4800, dur 1600}` *(default smoothstep — it is one continuous motion)*.

> **`easing: "linear"` on `solid_build_frac` is REQUIRED, and the measurement is reproduced here.**
> `vgSolidFaceCount = floor(frac·6)`, so face *k* lands when `frac = k/6`.
> | face | smoothstep | **linear** |
> |---|---|---|
> | 1 | 3414.6 ms | **3266.7** |
> | 2 | 3619.1 | **3533.3** |
> | 3 | 3800.0 | **3800.0** |
> | 4 | 3980.9 | **4066.7** |
> | 5 | 4185.4 | **4333.3** |
> | 6 | 4600.0 | **4600.0** |
> Smoothstep gives a **415 ms dead lead-in** and lands faces 1–2 and 5–6 in a rush at each end. Linear is
> **even, 266.7 ms per face**. Reproduces the recorded measurement exactly.

**⚠ `show_cross_vector: false`, and the skeleton's `b×c` arrow does not exist.** §10j lists a green
`vector b×c` primitive on S7. **`products` mode has exactly ONE cross-product arrow and it always draws
`a×b`** (`vg_cross_vector` is written from `vgCrossVec(a, b)`). What stands perpendicular to the base is
the **white height segment** (`vg_height_seg`), drawn from the base midpoint along `s·h·n̂`. That is the
right object for the state anyway — it is the *height*, which is what the split is decomposing. **`a×b`
must be hidden**, or a green arrow would stand along +Y beside a base whose normal points elsewhere.
**Formula surface:** `Volume = |a·(b×c)|` — **one equation, one idea.** The `Base × Height` half is carried
by the picture and the HUD, not by a second surface (Rule 34b).
**The real NUMBER:** `Volume = 9.95`, `Base = 4.27`, `Height = 2.33`, all three **live through the split
and all three motionless** (drift 3.55e-15).
**Rule 32a:** four strictly sequential beats — reframe (0–1800) → `c` grows (1800–3000) → solid builds
(3000–4600) → solid splits (4800–6400). Never simultaneous. ✓
**Cliff patch (Block 1, third cliff — reading a 3D solid on a 2D screen):** the split IS the patch, and the
anchor below names the invariance the split demonstrates.

> ⚠ **MATHEMATICS-FORCED ANCHOR CHANGE — the wedge doorstop is struck.** The skeleton's secondary anchor
> is "a wedge-shaped doorstop." **A doorstop is a wedge (a triangular prism); the sim draws a
> parallelepiped (a slanted box).** The anchor would name a different solid from the one on screen —
> the same class of defect as the door anchor the founder_proxy already struck for claiming swept area.
> **Replacement: a leaning stack of paper.** It is universal (Rule 35), literal (Rule 41), and it is the
> *exact* statement of what the engine's shear does: shearing a solid onto its base normal changes no
> volume. **The anchor now states the theorem the picture proves**, instead of decorating it.

**Narration (43 words):**
> "A third arrow c arrives, and the three span a box: volume 9.95. Now the box straightens and its base
> slides clear — base 4.27, height 2.33. A stack of paper pushed sideways still holds the same paper.
> Base times height is the volume."

---

### STATE_8 — "Explore: Angle, Lengths and Tilt"
`drag-sandbox` · cue **"All controls live"** · core · **`interaction_complete`** · narration 0 / open
**Camera:** `camera_mode: "auto_frame"`, `auto_frame_k: 2.5`. Entry pose (θ 60, |a| 3, |b| 2, tilt 0):
**az 0.00 / el 30.00 / R 12.99.**
**`vg`:** `show_cross_vector: true`, `show_angle_arc: true`, **`show_parallelogram: false`,
`show_parallelepiped: false`, `show_c: false`** (38b — the explore state surfaces CORE-ring content only),
`controls: ["theta_deg","a_mag","b_mag","b_tilt_deg"]`,
`value_readouts: ["theta_deg","a_dot_b","a_dot_cross","b_dot_cross"]`.
**State-level:** `show_sliders: true`.
**No `animate`** — Rule 37 free-run; the player never freezes the explore state.
**Formula surface:** `a·b = |a| |b| cos θ` *(S2's — core-ring, survives every preset)*.
**⚠ NO `cross_mag`** — `|a×b|` is S5's quantity (extended ring) and would be orphaned under `core_only`.
**Ring-cut re-check against my own ledger (item 7 of the dispatch brief).** `core_only` hides S5, S6, S7.
Survivors S1–S4 + S8. **Every quantity S8 displays is introduced by a survivor:** `θ` (S1), `a·b` (S2/S3),
`a·(a×b)` and `b·(a×b)` (S4). Its formula surface is S2's. **No core-ring state depends on any cut-ring
quantity — verified token by token, not asserted.** *(The preset is thin, as Checkpoint A flagged; my
ledger does not make it thinner, and `b_tilt` remains core because "two arrows in three dimensions" is the
concept's core claim, not an extension of it.)*
**Camera, measured: §2g** — 266 747 poses, min pairwise **18.914°**, max arm **0.4364** (on frame),
min arm **0.0412**, **extrema on plateaus (3757 / 429 / 26 argmins)**.
**Arrow floor: the smallest arrow the sandbox can produce is 0.342 world units against a renderer floor of
0.05 — 6.8× clear.** **Skeleton FLAG 7 is closed as NO DEFECT: the floor never clamps, so the length ratio
the sandbox teaches is never falsified, and no range narrowing is needed.** *(Legibility note, not a
correctness one: at 0.342 the hardcoded 0.22-long arrowhead is 64 % of the arrow. Worth a look at THE EYE
at `|a|=|b|=1, θ=20°`; it is not a wrong number.)*

---

## 4. Notation ladder (Rule 38c)

**38c must be re-based for this concept, and the re-basing is declared rather than assumed.** Rule 38c says
vector forms live in advanced states. **This concept's core content IS the vector product**, so a literal
reading would forbid the subject from its own core ring. The honest scoping:

| Ring | Notation permitted | Actually authored |
|---|---|---|
| **core** (S1–S4, S8) | `θ`, `\|a\|`, `\|b\|`, `a·b`, `a×b`, `a·(a×b)`; `a·b = \|a\|\|b\| cos θ` | exactly that, nothing more |
| **extended** (S5, S6) | adds `\|a×b\| = \|a\|\|b\| sin θ` and `b×a = −(a×b)` | exactly that |
| **advanced** (S7) | adds the **scalar triple product** `a·(b×c)` and `Volume = \|a·(b×c)\|` | exactly that |

**FORBIDDEN EVERYWHERE, and absent — checked string by string:** any determinant or matrix form of the
cross product; any component/coordinate computation (`a×b = (a₂b₃−a₃b₂, …)`); the `î ĵ k̂` basis; any
`lim`, integral or derivative notation; the biconditional `⟺`; any proof-by-induction structure; the
projection *formula* `(a·b/|b|²)b` (the concept teaches projection's meaning, never its formula).
**Nothing is smuggled below its ring, and nothing needed to be — no FLAG is owed on 38c.**

**Dialect (38d) — dual-labelled ONCE at first appearance, then bare:**

| Term | First appearance | Form |
|---|---|---|
| dot product | S2 narration | "the dot product, also called the scalar product" |
| cross product | S4 narration | "the cross product, also called the vector product" |
| `\|a\|` | S1 narration | "each has a length" (the word the picture shows; the bars are read as "length of a") |

**No genuine cross-board conflict found.** "Dot/scalar" and "cross/vector" are the only divergent pairs and
both are dual-labelled. Degrees are used throughout (never radians) — universal at this level on every board
named in the skeleton's §10i-3. **Nothing to escalate under 38e.**

**Exact-before-decimal.** Three values in this concept are irrational:
`3√3 = 5.196152…` → HUD `5.20` · `15√3/4 = 6.495191…` → HUD `6.50` · `6 cos 20° = 5.638156…` → HUD `5.64`.
**The symbolic forms live on the formula surface (`|a×b| = |a||b| sin θ`); only the HUD rounds, and it
rounds at a fixed 2 dp the engine owns.** No state prints a rounded value inside a symbolic expression.
**Precision never changes mid-concept** (engine-enforced: `VG_READOUT_DP` has no products entries, so every
products token falls to the default 2, and `theta_deg` is hardcoded 0).

---

## 5. Drill-down cluster phrasings (9 clusters × 5 — real student voice, plain English)

**`zero_dot_product_means_perpendicular`**
1. how can you multiply two things that are not zero and get zero
2. does a dot b equal zero always mean the angle is exactly 90
3. if the dot product is zero is one of the vectors zero
4. why is cos 90 zero and what does that have to do with arrows
5. is perpendicular the same as saying the dot product vanishes

**`dot_product_sign_and_the_angle`**
1. what does a negative dot product actually mean
2. why does the sign flip at 90 degrees and not somewhere else
3. can the dot product be negative if both lengths are positive
4. how do i tell from the number whether the angle is sharp or wide
5. does negative mean the vectors point in opposite directions

**`dot_product_is_not_always_positive`**
1. i thought multiplying two positive things always gives positive
2. why is the dot product allowed to be negative when lengths are not
3. is the minus sign part of the answer or a mistake
4. does a negative dot product mean a negative length somewhere
5. when is the dot product biggest and when is it smallest

**`right_hand_rule_gives_the_direction`**
1. which way does a cross b point and how do i remember it
2. do i point my fingers along a or along b first
3. what happens to the right hand rule if i swap the two vectors
4. is there a way to get the direction without using my hand
5. why do we need a rule at all when there are two perpendicular directions

**`cross_product_makes_a_vector_not_a_number`**
1. why does one product give a number and the other gives an arrow
2. is a cross b a length or a direction or both
3. how can multiplying two arrows give a third arrow
4. what is the difference between a dot b and a cross b in one line
5. if it is a vector then what are its components

**`cross_product_is_perpendicular_to_both`**
1. how do i know a cross b is really at 90 degrees to both
2. is it perpendicular to a only or to a and b together
3. what if a and b are already perpendicular does anything change
4. can a cross b ever lie in the same plane as a and b
5. why is a dot a cross b always zero no matter what i change

**`triple_product_is_a_volume`**
1. why is a dot b cross c a volume and not an area
2. do i do the cross first or the dot first
3. what is the base and what is the height in the box
4. does the answer change if i swap a and b and c around
5. why does the volume stay the same when the box leans over

**`zero_triple_product_means_coplanar`**
1. what does it mean when the triple product comes out zero
2. does zero volume mean one of the vectors is zero
3. what does coplanar actually look like for three arrows
4. if two of them are parallel is the triple product zero
5. how flat does the box have to be before the volume is zero

**`order_of_operations_in_a_dot_b_cross_c`**
1. why is there no bracket around a dot b in a dot b cross c
2. can i write a cross b dot c and get the same answer
3. what would a dot b cross c mean if i did the dot first
4. does the dot and cross swap rule work for any three vectors
5. is a dot b cross c a number or a vector

---

## 6. Constraint callouts — domain first

```json
"constraints": [
  "theta_deg is DEFINED on (0, 180) and DRAWN on [6, 160]; the sandbox slider is clamped to [20, 160], so a x b is never the zero vector and its direction is never undefined anywhere on screen",
  "a . (a x b) = 0 and b . (a x b) = 0 for every a, b in R^3 with NO hypothesis — measured max 1.78e-14 over 77 409 configurations and printed 0.00 by the engine's zero-clamp; this is the only universally quantified claim the concept makes",
  "b_tilt_deg is a Rodrigues rotation about a-hat, so theta, |b|, |a x b| and both perpendicularity readouts are exactly invariant under it (worst 6.04e-14 deg / 1.78e-14) — no readout can drift from the slider that drives it",
  "the S7 split is a volume-exact shear: Volume, Base and Height do not move by one displayed digit for any split fraction (max drift 3.55e-15); Base 4.27 x Height 2.33 = 9.9491 rounds to the displayed Volume 9.95 with 0.0041 of margin",
  "every products readout is 2 dp and theta_deg is 0 dp, both fixed in the renderer and NOT authorable; no narration or caption quotes a precision the engine does not print",
  "S5 fixes theta at 60 and varies only |b|, so no string may claim the area identity was verified across angles — it is a theorem, stated as one, not an induction from the drawn interval",
  "the S8 camera extrema are PLATEAUS (3757 / 429 / 26 argmins over 266 747 poses); the worst case is a value over the swept product, never a named slider corner"
]
```

---

## Numerical sanity check — RUN, not eyeballed (full log)

```
MODEL VALIDATION (reproduces the engine's own reported defaults, A22 item 6):
  |a|=3.0 |b|=2.5 th=60 c(2.0, 50, 65) -> V 8.3501  Base 4.9888  Height 1.6737
  engine-reported                       -> V 8.35    Base 4.99    Height 1.67      MATCH

CORE VALUES (|a| = 3):
  |b|=2.0 th= 60 : a.b =  3.0000 (exact 6 x 1/2)   |axb| = 5.196152 = 3*sqrt(3)   -> 3.00 / 5.20
  |b|=2.0 th= 20 : a.b =  5.638156                 |axb| = 2.052121               -> 5.64
  |b|=2.0 th= 90 : a.b =  0.000000 (attained)      |axb| = 6.000000               -> 0.00
  |b|=2.0 th=130 : a.b = -3.856726                 |axb| = 4.596267               -> -3.86
  |b|=2.5 th= 60 : a.b =  3.7500                   |axb| = 6.495191 = 15*sqrt(3)/4 -> 6.50
  a x b at |a|=3,|b|=2,th=60 = (0.000, 5.196152, 0.000)   -- along +Y, as the convention promises
  a.(axb) = b.(axb) = 0.00e+00 at every sample

b_tilt INVARIANCE, 141 x 61 x 9 = 77 409 configurations:
  max |theta_true - theta_slider|   = 6.040e-14 deg
  max | |b| - b_mag |               = 1.776e-15
  max | |axb| - |a||b| sin(theta) | = 1.066e-14
  max |a.(axb)|, |b.(axb)|          = 1.776e-14      -> vgFx clamp prints 0.00

flip_frac = 1:  max |R_a(pi)(a x b) + (a x b)| = 1.776e-15   -> the flipped arrow IS b x a

S7 SOLVE, c_mag 2.0 / c_theta_deg 40 / c_phi_deg 6:
  c            = (1.278533, 1.532089, 0.134379),  |c| = 2.0000
  a.(b x c)    = +9.951209        Volume = 9.951209 -> 9.95
  |b x c|      =  4.270752        Base   = 4.270752 -> 4.27
  height       =  2.330084        Height = 2.330084 -> 2.33
  ROUNDING     : 4.27 x 2.33 = 9.9491 -> 9.95 == displayed Volume,  margin 0.0041 below the boundary
  skeleton     : 4.25 x 2.34 = 9.9450 -> EXACTLY the boundary, margin 0.0000 -> cannot close
  split drift over 1001 samples of f in [0,1] : 3.553e-15

solid_build_frac FACE TIMES over 3000-4600 ms:
  smoothstep 3414.6 / 3619.1 / 3800.0 / 3980.9 / 4185.4 / 4600.0   (415 ms dead lead-in)
  linear     3266.7 / 3533.3 / 3800.0 / 4066.7 / 4333.3 / 4600.0   (even, 266.7 ms/face)  <-- AUTHORED

CAMERA (FOV 60, aspect 16:9, isotropic, pairwise, worst case):
  S1-S3 az90/el70/R10, theta in [20,160]: min pairwise 18.82 (th=20) / max arm 0.3145 (th=123) / min arm 0.1764 (th=160)
  S4    az90 fixed, el 70->30 at R16    : a x b arm 0.1599 -> 0.3358 (x2.10); min pairwise 32.20 at el 30
  S5    az90/el30/R16, |b| 2.0->2.5     : min pairwise 32.20 / max arm 0.4411 / min arm 0.1069
  S7    az60/el30/R12, split f in [0,1] : min pairwise 40.89 / min arm 0.1331 / maxX 0.773 (lim 1.0264) / maxY 0.207 (lim 0.5774)
  S7    skeleton pose az30/el25/R10     : min pairwise 1.22 and OFF-FRAME (maxX 1.680)  -> REJECTED
  S8    auto_frame, 266 747 poses       : min pairwise 18.914 / max arm 0.4364 / min arm 0.0412
        argmin counts 3757 / 429 / 26   -> PLATEAUS, not corners

ARROW LENGTH FLOOR:
  smallest reachable world arrow = 0.3420 (|a|=|b|=1, th=20)  vs renderer floor 0.05  -> 6.8x clear
```

---

## FLAGS

### FLAG A — **S6 renders a false label. It must not ship without a 3-line renderer delta.** [CORRECTNESS]

`labCross` is created **once at build time** as `createLabelSprite("a×b", …)` and is **never re-texted** —
the frame loop only repositions it. At `flip_frac = 1` the drawn arrow **is** `b×a` (verified exact to
1.78e-15), and it is labelled **`a×b`**. **The state whose entire claim is that the two are different
renders a label saying they are the same.**

**Requested delta (D-14):** `vg.cross_label?: string`, applied through `updateLabelSpriteText(labCross, …)`
— the file already uses exactly that call at two sites. **~3 lines.** S6 would author `cross_label: "b×a"`.
**No zero-code workaround exists:** the label's visibility is bound to `show_cross_vector`, so S6 cannot
hide it without hiding the arrow whose reversal is the lesson.
**If the founder declines:** S6 must be cut, not shipped with the wrong label. Under `no_advanced` and
`full` presets S6 is visible; only `core_only` hides it.

### FLAG B — **`products` mode cannot draw the projection segment. S2 and S3 lose their geometric register.** [DESIGN]

The skeleton's S2 and S3 are built on "the violet projection segment along `a`" that lengthens, collapses
to a point at 90°, and reappears on `a`'s far side. **`products` mode renders nine element classes and a
projection is not among them.** The `lines_planes` half's `vg_lp_seg` is hard-gated behind
`d.mode === "lines_planes"`, and its authoring surface takes literal world coordinates — a segment whose
length must track `|b| cos θ` while `θ` ramps would need a knob equal to `cos θ`, which no linear or
smoothstep ramp can be. **Every approximation I costed produces a picture measuring a different number
from the one it claims — this wave's own recorded defect class.** *(The `c` arrow can be aimed along `a`
exactly, but its length still cannot track `cos θ`, and its sprite label would permanently read `c` —
FLAG A's defect a second time.)*

**Consequence, stated plainly:** without this, S2 and S3 lead **numerically**, not graphically, which
contradicts the skeleton's own §10g register table (graphical leads all eight states). M1's counter
survives — arguably stronger, since it is arithmetic — but "how much of `b` points along `a`" becomes a
sentence rather than a picture.

**Requested delta (D-16):** `vg.show_projection?: boolean` drawing the segment from the origin to
`(b·â)â`, in the region role colour, **with no sprite label** (so FLAG A cannot recur), hidden when
`|b·â| < 0.02`. Everything it needs is already computed in the frame. **~25 lines.**
**Recommendation: price it at Checkpoint B.** The concept is coherent without it; it is two states weaker.

### FLAG C — three smaller items, each with a zero-code disposition already authored

1. **`#formula_overlay` and `#vg_sliders` occupy the same corner.** Both are `bottom:12px; right:12px`,
   both `z-index:10`; `#vg_sliders` is appended later so it **paints over the formula surface**. This bites
   **S5 and S8** — the only two states with both. **One-line delta (D-13): move `#vg_sliders` to
   `left:12px`**, which is where the skeleton's §10h zoning already put it. **Zero-code fallback:** S5 and
   S8 author no `formula_overlay` — a real loss on S5, whose surface is its claim.
2. **No direction/sign readout token exists** for S6 (§3, STATE_6). **Delta (D-15):** a `cross_dir`
   token. **Disposition without it: authored as above** (frozen `|a×b|` + the picture + the formula).
3. **The chapter colour language's role 5 (violet measured region) is not renderable in `products` mode.**
   The parallelogram and the base face are built from **`color_cross`** and the parallelepiped from
   **`color_c`** — so under the skeleton's palette the quad and base render **GREEN** and the solid renders
   **MAGENTA**, colliding with roles 4 and 3. Only four colour keys are read (`color_a/b/c/cross`); there
   is no `color_region`. **The `lines_planes` half honours the language (`VG_ROLE_COLOR.region = #8B6FE8`),
   so the renderer is internally inconsistent.** This is a **chapter-level** decision — Acts II and III
   inherit — so it is a founder call, not mine. **3-line delta:** read `vgCfg.color_region` in `pgMat`,
   `ppMat`, `bfMat`. **Without it, `json_author` must author the palette as-shipped and the skeleton's
   §⓪ rule "violet is never an arrow and green is never a fill" is broken by the engine, not by the
   authoring.**

### FLAG D — corrections I made to the skeleton, each with its measurement

| # | Skeleton | Authored | Why |
|---|---|---|---|
| 1 | S7 `c` at azimuth 65° / elevation 50° / `\|c\|` 2.0 → V 9.95 / Base 4.25 / Height 2.34 | **`c_mag 2.0`, `c_theta_deg 40`, `c_phi_deg 6` → V 9.95 / Base 4.27 / Height 2.33** | the skeleton's triple sits exactly on the 2-dp rounding boundary and cannot close; this one closes with 0.0041 of margin |
| 2 | S7 camera az 30 / el 25 / R 10, "min pairwise 37.3°" | **az 60 / el 30 / R 12** | at the solved `c` the skeleton's pose gives **1.22°** and is **off frame**; the new pose gives **40.89°** on frame and holds S6's elevation, winning home-pose continuity |
| 3 | S1 `θ` ramps from **0°** | **from 6°** | at `θ = 0` the two arrows are coincident for the full 1400 ms pre-roll — z-fighting shafts under a zero-extent arc |
| 4 | S7 secondary anchor: **a wedge-shaped doorstop** | **a leaning stack of paper** | a doorstop is a wedge; the sim draws a slanted box. The replacement states the shear invariance the picture proves |
| 5 | S6 opening hold **2000 ms** (33 %, flagged) with a brightness-pulse + character-by-character remedy | **1000 ms hold** (20 %) | the authored remedy is unbuildable — `formula_overlay` is a static per-state string and a state-level glow focal is forbidden here by the relation-dimming directive |
| 6 | `θ = 60.0°` (six places) | **`θ = 60°`** | `vgReadoutLine` prints `theta_deg` at 0 dp; not authorable |
| 7 | S5 HUD `Area = 6.50` beside `\|a×b\| = 6.50` | **`\|a×b\|` only** | no `area` token exists — and this is better: the two-instruments-for-one-quantity hazard cannot fire |
| 8 | S7 primitive `vector b×c` (green) | **`show_cross_vector: false`; the white height segment carries the normal** | `vg_cross_vector` always draws `a×b`; a `b×c` arrow does not exist |
| 9 | HUD **top-right**; sliders bottom-left | **HUD top-LEFT** (`top:52px;left:12px`); sliders bottom-right | as shipped |
| 10 | S1–S3 max arm 0.296 / min arm 0.197; S5 min arm 0.119 | **0.3145 / 0.1764 / 0.1069** | re-measured; every verdict (on frame, above floor) survives |

### FLAG E — closed items, recorded so nobody re-opens them

- **Skeleton FLAG 3b (concept id):** **CLOSED.** `mathematicsCatalog.ts` already carries
  `vector_products_in_space`, founder-settled 2026-08-08, and Act II's prerequisite points at it.
- **Skeleton FLAG 4 (D-5 build-vs-fallback):** **CLOSED — the full split shipped**, volume-exact, verified.
- **Skeleton FLAG 7 (arrow length floor):** **CLOSED as NO DEFECT** — 0.342 vs a 0.05 floor, 6.8× clear.
- **Skeleton §10c ASSUMPTION (right-hand-rule mesh):** **CLOSED as a NO** — reachable, but what ships is
  the grip rule, which is the wrong rule. Do not author it.
- **D-6 (`deriveStateMeta`):** **CLOSED** — `'vg'` is in `F3D_REVEAL_KEYS`, with its own
  `maxRevealForField3dState` block (grow-in + `animate[]` ends + `camera_steps` ends) and its own
  hold classification. Nothing for `json_author` to add.
- **`check:vector-geometry-3d`** uses its own synthetic inputs and reads no concept JSON, so moving `c`
  and the S7 pose costs the gate nothing.

---

## Self-review checklist

- [x] Every quantity in the skeleton's state narratives appears in `variables` with a domain agreeing with §2.
- [x] **Domain & validity ledger complete** — domain, drawn interval, excluded points and boundary behaviour
      for `θ`, `a·b`, `a×b`, the triple product, `Base`, `Height` and `b_tilt`; every "for all / always /
      never" traced to a named theorem with its hypotheses checked against the sim's own setup (§2c–§2f).
- [x] No caption or narration generalises past the interval drawn (S5's fixed-θ duty is written as a
      binding duty, not a note).
- [x] Every state's motion is an archetype the shipped engine can produce; the two that could not
      (S2/S3's projection segment; S6's flipping label) are **FLAGged, not improvised**.
- [x] Rule 31 timeline per state (t-window × what animates × driven-by), every value a closed form of the
      state clock; controls match the architect's table; explore = all four.
- [x] Rule 32: cause-before-effect verified where a causal chain exists (S1, S4, S7) and **exempted with a
      written reason where the relation is an identity** (S2, S3, S5). Rule 33 register declared per state
      with its real number. Rule 34: one formula surface per state (S1/S4 none), value-only HUD,
      ≤5-word cue — plus the corner collision found and FLAGged.
- [x] Word budget (31a): S1 51 · S2 35 · S3 42 · S4 47 · S5 41 · S6 35 · S7 43 · S8 0/open. All ≤ 55.
- [x] Notation ladder (38c) re-based with its reasoning stated; triple product advanced-only; no
      determinant, component, basis-vector, limit or biconditional notation anywhere. Dialect dual-labels
      once each. No genuine board conflict (38e).
- [x] **Pixel↔data scale: N/A and stated** — this is a 3D perspective scenario, not `parametric`. Its
      analogue, the projection metric, is declared once (FOV 60 / 16:9 / isotropic tangent units) and
      reused verbatim beside every camera number.
- [x] Exact forms (`3√3`, `15√3/4`) on the symbolic surface, decimals in the HUD, precision declared,
      constant, and **engine-owned rather than authored**.
- [x] Drill-down phrasings: 9 clusters × 5, student voice, no textbook prose, no Hinglish.
- [x] `constraints`: 7 assertions, domain first.
- [x] **Numerical sanity check RUN** — full log above, including the model's validation against the
      engine's own independently reported defaults.
- [x] Engine bug queue consulted live this session; every row dispositioned; no exception owed.
- [x] Source check line present.
- [x] Plain-language sweep (Rule 41) over every authored string: no idiom, no metaphor, no personified
      vector. **The named banned sentence is absent** — nothing "refuses" to lie in the plane; the arrow
      *stands out of* the plane, which is literal.
- [x] `aha_moment` check: **"Two arrows can be multiplied to give a third arrow, out of their plane"**
      (13 words) is mathematically TRUE and S4 demonstrates it with two live readouts at `0.00`.
      `misconception_watch` counters M1/M2/M3 are correct mathematics. All seven assessment answers
      verified correct (§2); all 21 distractors encode real wrong beliefs; item 5's degenerate
      parallel case and item 7's `θ = 0/180` transfer are both recorded in the ledger.
