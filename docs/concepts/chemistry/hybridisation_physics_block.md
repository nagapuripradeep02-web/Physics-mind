# Physics block — `hybridisation_sp_sp2_sp3` (P4 #13)

> **Written BEFORE any renderer code or state design.** Every number below is measured, not
> asserted — the repeated chemistry lesson is that tsc, the validators and THE EYE cannot see a
> claim about meaning, so the meaning gets settled first, headlessly, with a control that
> reproduces an already-shipped number.
> Scratch harnesses: `hybrid_physics.js` · `hybrid_sign.js` · `hybrid_roots.js` ·
> `hybrid_countable.js` · `hybrid_waist.js` (session scratchpad, 2026-07-29).

---

## 1. The wavefunction

A hybrid on one atom, written in the frame of its OWN lobe axis (`c = cos θ` from that axis):

```
ψ_h(ρ, c) = −c_s · R₂₀(ρ) · Y₀₀  +  c_p · R₂₁(ρ) · √(3/4π) · c
c_s² + c_p² = 1        f ≡ c_s²  =  the S-CHARACTER fraction
R₂₀(ρ) = (1/2√2)(2 − ρ)e^(−ρ/2)      R₂₁(ρ) = (1/2√6) ρ e^(−ρ/2)      ρ = r/a₀,  a₀ = 52.9177 pm
```

Same exact hydrogenic (Z=1) functions the shipped `orbital_shapes` surface already evaluates —
so hybridisation is not a second physics, it is the SAME physics recombined, and every hybrid
number below is commensurable with `atomic_orbitals_s_p_d`.

### 1a. THE SIGN IS LOAD-BEARING — and it is MINUS

`R₂₀` is **negative for ρ > 2**, i.e. across most of the bonding region. So the naive
`ψ = +c_s ψ₂ₛ + c_p ψ₂ₚ` puts the constructive side at `c = −1`. Measured hemisphere probability
for sp³:

| convention | P(front, along +axis) | P(back) |
|---|---|---|
| `+c_s ψ₂ₛ` | **17.5 %** | 82.5 % |
| `−c_s ψ₂ₛ` | **82.5 %** | 17.5 % |

**The `+` convention builds a hybrid whose big lobe points away from the bond.** It renders
perfectly, every caption stays "correct", every gate passes, and the concept teaches the exact
inverse of directional bonding. This is the same defect class as the `node_count` clover that was
geometrically right and posed wrong. **Use the minus sign.** Verified for sp, sp², sp³.

---

## 2. Verified invariants (all four PASS)

| # | Check | Result |
|---|---|---|
| 1 | `⟨ψ_h\|ψ_h⟩ = 1` for f = 0, ¼, ⅓, ½ | **1.000000** each |
| 2 | Angle law `cos θ = −f/(1−f)` vs the authored direction lists | sp **180.00°** · sp² **120.00°** · sp³ **109.47°** — MATCH to 0.01° |
| 3 | Each hybrid SET is orthonormal (`⟨h_i\|h_j⟩ = f + (1−f)(â_i·â_j)`) | max off-diagonal **5.6e−17**, max diagonal error **2.2e−16** |
| 4 | **CONTROL** — pure 2p (f = 0) at the SHIPPED level 9.0768e−5 | tip **482.5 pm** vs the shipped concept's **482 pm**; L/half-width **1.44** vs shipped **1.44** |

Check 4 is the one that matters: the harness reproduces a number already on master from an
independent path, so the hybrid numbers it produces are trustworthy for the same reason.

---

## 3. THE SPINE OF THE CONCEPT — one dial drives everything

`f`, the s-character, is a single real physical parameter that **simultaneously** sets the angle
between the lobes and the shape of each lobe. Measured sweep (90 % contour):

| s-character f | angle (law) | front tip | back tip | front/back |
|---|---|---|---|---|
| 0 % (pure p) | 90.00° | 483 pm | 483 pm | 1.00 |
| 10 % | 96.38° | 436 | 508 | 0.86 |
| 20 % | 104.48° | 404 | 514 | 0.79 |
| **25 % — sp³** | **109.47°** | 388 | 516 | 0.75 |
| **33.3 % — sp²** | **120.00°** | 359 | 518 | 0.69 |
| 40 % | 131.81° | 334 | 520 | 0.64 |
| **50 % — sp** | **180.00°** | 291 | 522 | 0.56 |

The three named hybrids are **three stops on one continuous dial**, and the tetrahedral angle is
not a fact to memorise — it is what `cos θ = −f/(1−f)` returns at f = ¼. A whiteboard can draw the
three stops; it structurally cannot sweep between them. This is the concept's PRIMARY aha and the
whole justification for the 💎 tier.

Measured directional concentration (a real number for the HUD, Rule 33d):
**sp 87.5 % · sp² 85.4 % · sp³ 82.5 %** of the electron on the bonding side.

---

## 4. Two authoring traps, solved here rather than in the frames

### 4a. The 90 % contour FUSES — the multi-lobe states must author `enclosure: 0.5`

Union-silhouette waist ratio = (union radius along the bisector between two adjacent lobes) ÷ (tip
radius). Higher = no visible notch between lobes = a student cannot count them.

| set | 50 % | 70 % | 90 % |
|---|---|---|---|
| sp (2 lobes) | 0.187 ✅ | 0.184 ✅ | 0.764 ✅ |
| sp² (3 lobes) | 0.775 ✅ | 0.844 ⚠ | 0.895 ⚠ |
| **sp³ (4 lobes)** | **0.808** ⚠ | 0.863 ⚠ | **0.907 ❌ FUSES** |

This is the shipped `orbital_shapes` scar recurring, and worse: hybrid lobes on one atom genuinely
overlap in space (unlike the lobes of a single p, which are separated by a true nodal plane), so no
camera solve can fix it. **Authoring rule: every multi-lobe hybrid state uses `enclosure: 0.5`**,
where sp³ is L/half-width **1.51** — actually *slimmer* than the pure 2p at 90 % (1.44) that already
ships and reads fine. Combine with the Fresnel edge-weighted alpha the previous session built for
exactly this failure. Nothing is faked: the HUD MEASURES the enclosed fraction from the dot sample
and prints it, so a 50 % contour announces itself as a 50 % contour.

### 4b. There is a near-nucleus core blob, and the mesh must not claim otherwise

The 2s radial node survives into the hybrid, distorted. Along the FRONT ray the density crosses the
contour **three** times, not once:

| set | front ray at its own 90 % level |
|---|---|
| sp | inside from 0 → out @ 47.6 pm → back in @ 58.8 → out @ 522.4 |
| sp² | inside from 0 → out @ 38.7 pm → back in @ 49.5 → out @ 518.1 |
| sp³ | inside from 0 → out @ 33.7 pm → back in @ 44.3 → out @ 515.6 |

So a mesh built from the outermost root alone (what the shipped lobe builder does) silently swallows
a ~10 pm node shell at ~7 % of the lobe length. **That is acceptable and is NOT to be faked away —
but no state may claim the lobe is solid to the nucleus**, and if a state ever wants to teach it,
the existing camera-aligned `cutaway` already exposes exactly this kind of interior.

Confirmed absent: there is **no** node along the BACK ray for any of the three (the root
`ρ = 2c_s/(c_s − c_p)` is negative for all f < ½), so each back lobe is one compact blob attached at
the nucleus — the textbook picture, and here it is derived rather than assumed.

---

## 5. Solved iso-density levels (atomic units) — to be imported as constants

Solved by bisection against the same functions the renderer will evaluate; each re-verified live by
the occupancy HUD, which counts the ACTUAL dot sample and never asserts.

| set | f | 50 % | 70 % | 90 % |
|---|---|---|---|---|
| sp | ½ | 8.5587e−4 | 3.8003e−4 | 8.0806e−5 |
| sp² | ⅓ | 9.4100e−4 | 4.1401e−4 | 8.6901e−5 |
| sp³ | ¼ | 9.6698e−4 | 4.2371e−4 | 8.8483e−5 |

For the continuous-f sweep state, levels come from a build-time table on an f-grid (one
mass-vs-level histogram pass per grid point inverts to all three enclosures at once), so every frame
stays a pure lookup and the scenario keeps its `SET_TIME_FREEZE` byte-identical guarantee.

---

## 6. Direction lists (the "frame list" the engine comment anticipated)

```
sp   f=1/2   [0,0,1] · [0,0,−1]                                        180.00°
sp²  f=1/3   three at 120° in the xz-plane                             120.00°
sp³  f=1/4   [1,1,1] · [1,−1,−1] · [−1,1,−1] · [−1,−1,1] (normalised)  109.47°
```

Each verified orthonormal as a SET (§2 check 3), not merely spaced by eye.

---

## 7. Engine delta against shipped `orbital_shapes`

The scenario's own header comment already scoped this: *"a hybrid is a new angular factor plus a new
lobe-direction list."* One correction to that forecast, found here: a hybrid is **not separable** —
`R₂₀` and `R₂₁` differ, so `density ≠ R(ρ)²·A(d̂)` and the existing `osRhoOuter(orb, lev/A)`
shortcut does not apply. The hybrid needs a per-direction outer-root solve. It IS a surface of
revolution about its own lobe axis, so that is a **1-D** table over `c ∈ [−1,1]` built once — cheap,
and it drops straight into the existing canonical-mesh + `osApplyLobe` aiming path.

Additive only, no shipped behaviour touched:
1. `OS_ORBITALS` — three `kind: "hybrid"` entries carrying `f`, the level table, the direction list.
2. `osHybridPsi` + a build-time `c`-grid of outer roots (replaces the separable shortcut for hybrids only).
3. `osLobeFrames` — return the hybrid direction list (already returns a list).
4. Seeded rejection sampler for the dot swarm from the non-separable `|ψ|²` (build time only; a frame stays a pure lookup).
5. New modes: `merge_morph` · `set_populate` · `tetra_assemble` · `param_sweep`.
6. HUD lines: `s_char` · `angle` · `front_back` · `front_tip` / `back_tip`.
7. Solved cameras per mode (measured against pairwise screen separation — the VSEPR lesson: camera placement is a quantity with a correct answer).

Rule 40: this is PLATFORM work on `field_3d_renderer.ts` and lands on master separately from the
concept JSON.
