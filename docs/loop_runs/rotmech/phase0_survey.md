# Ch.7 (Class 11) Systems of Particles & Rotational Motion — Phase-0 survey (0a)

> **Concept spine FOUNDER-APPROVED 2026-08-02: all 12 rotational concepts + centre of mass = 14.**
> Engine strategy still open — see "Per-concept engine mapping" below.
> 0b/0c do not start until the engine decision is approved (AUTHORING_PIPELINE.md §0).
> Drafted 2026-08-02 in the office (`C:\Tutor\physics-mind`, master `004b534`).
> Source catalogs: `docs/catalog/pilot-topic-15-rotational-mechanics.md` (13 atomics + 14 nanos,
> RM-G1…RM-G12 applied 2026-05-25) · `pilot-topic-14-momentum-collisions.md` (centre of mass, MC-G2).

## ⚠ Loop-slug collision — this chapter is NOT `ch7`

`docs/loop_runs/ch7*` is **Class 12 Ch.7, Alternating Current** (8/8 sealed 2026-07-24) and
`ch8` is **Class 12 Ch.8, EM Waves**. The existing slugs are not class-qualified, so this
chapter takes the slug **`rotmech`** (matching its catalog name) — never `ch7`.

| Slug | Chapter | Status |
|---|---|---|
| `ch6` | Class 11 Ch.6 — Work, Energy & Power | in progress (concept #2 awaiting founder review) |
| `ch7` | **Class 12** Ch.7 — Alternating Current | sealed 8/8 |
| `ch8` | **Class 12** Ch.8 — EM Waves | 2/3 sealed |
| **`rotmech`** | **Class 11 Ch.7 — Systems of Particles & Rotational Motion** | **this survey** |

Catalog Open Question 5 already settled the source-side ambiguity: *"T15 is the canonical pilot;
T7 considered = T15 via this catalog."* T15 is the syllabus authority, with centre of mass pulled
in from T14 by founder decision (NCERT §7.2/§7.3 place it in this chapter, and the chapter title
says *Systems of Particles*).

---

## THE APPROVED SPINE — 14 concepts, teaching order

★ = catalog Diamond candidate · **V1** = flagged V1 priority in catalog Section H

| # | concept_id | Teaches | Engine |
|---|---|---|---|
| 1 | `centre_of_mass` | R = Σmᵢrᵢ/Σmᵢ — the mass-weighted average point. **It is a mathematical location, not a material point: a ring's CoM sits in the empty hole** | NEW ★ |
| 2 | `motion_of_centre_of_mass` | V_CoM = P_total/M. Throw a tumbling body — the body spins wildly, its CoM traces one clean parabola | NEW ★ |
| 3 | `rigid_body_rotation` | Rigid body = internal distances fixed. On a fixed axis every point traces a circle; outer points travel further in the same time | NEW |
| 4 | `rotational_kinematics` | ω = dθ/dt, α = dω/dt, ω = ω₀ + αt. Same equations as linear motion, new variables. v = ωr links the two | NEW |
| 5 | `torque` | τ = rF sin θ. The moment arm is what matters — a force pushing straight at the axis turns nothing | NEW |
| 6 | `moment_of_inertia` | I = Σmᵢrᵢ² — rotational mass. **The same body has a different I about a different axis** | NEW ★ **V1** |
| 7 | `tau_eq_i_alpha` | τ_net = Iα — the rotational F = ma | NEW ★ **V1** |
| 8 | `rotational_work_energy` | W = τ·θ; KE_rot = ½Iω² | NEW |
| 9 | `angular_momentum` | L = Iω. A **vector** along the rotation axis, by the right-hand rule | NEW |
| 10 | `conservation_of_angular_momentum` | No external torque ⇒ L constant. Pull the masses in, I drops, ω rises | NEW ★ **V1** |
| 11 | `pure_rolling` | v = Rω. The contact point is instantaneously at rest ⇒ **static** friction, not kinetic | EXTEND ★ **V1** |
| 12 | `rolling_on_incline` | The race: solid sphere < disc < hollow sphere < ring, ranked by I/mR² | EXTEND ★ **V1** |
| 13 | `flywheel_application` | ½Iω² stored in a spinning wheel smooths a jerky drive | NEW ★ **V1** |
| 14 | `torsional_pendulum` | τ = −κθ ⇒ angular SHM, T = 2π√(I/κ) | NEW · V1.2 |

**Why 14 and not the catalog's V1 count of 5.** The five V1 atomics (#6, #7, #10, #11+#12, #13) are
the *payoffs*; every one of them uses ω, τ and I as already-taught vocabulary. Shipping them without
the scaffolding would break **Rule 25 (foundation-first, no untaught term)**. Same call as Ch.6 — a
12-concept spine drawn from a 33-atomic catalog.

---

## The 0a question: does an existing scenario family stretch?

**PARTLY — and the split is the whole finding.** The chapter divides into two apparatus families
and they get opposite answers.

### What already exists and IS reusable

`newtons_laws_body` (ONE scenario_type, 10+ shipped concepts across Class-11 Laws of Motion and
Ch.6 Work-Energy) provides, as pure JSON config:

| Capability | Config surface | Status |
|---|---|---|
| Surface, flat OR inclined | `surface.theta_deg` (0 = flat, SAME code path) | ✅ exists |
| 1–2 bodies, mass / position / velocity | `bodies[]` | ✅ exists |
| Static + kinetic friction | `bodies[].mu_s / mu_k`, `surface.frictionless` | ✅ exists |
| **A rolling wheel body** (tyre + hub + crossed spokes) | `bodies[].shape: 'wheel'` (SEAM G) | ✅ exists |
| Force arrows, length ∝ magnitude, component resolution | `arrows[]`, `show_components` (SEAM C) | ✅ exists |
| **Energy bars** K · U_grav · U_spring · E_total · E_dissipated | `energy_layer.bars[]` (SEAM L) | ✅ exists |
| Zero-reference line for U | `energy_layer.h_ref_m` | ✅ exists |
| Teaching instruments + live numeric readouts | SEAM M, `readouts` | ✅ exists |
| **Off-axis force geometry** (F, d, and the angle between them) | SEAM N | ✅ exists |
| Per-state sliders, guided ramp, sandbox drag-seize | `controls_visible`, `param_ramp`, `trusted_drag_seizes` | ✅ exists |
| Real fixed-step integrator (Rule 36) | Branch A / Branch B | ✅ exists |

### The gap — verified, not assumed

Searched all **66,865 lines** of `field_3d_renderer.ts` at `origin/master` (004b534):

- **Moment of inertia does not exist as a quantity anywhere.** Zero hits for
  `momentOfInertia` / `I_cm` / `inertia_kgm2` / `moment_of_inertia`.
- **No angular momentum.** Zero hits for `angular_momentum` / `angularMomentum`.
- **No centre of mass.** Zero hits for `centre_of_mass` / `centerOfMass` / `v_com`.
- **No torque-driven angular integrator.** No `α = τ/I` anywhere.
- **The two scenarios that DO rotate a body under torque are not usable as a base.**
  `torque_on_loop_uniform_field` and `dipole_in_uniform_field` / `bar_magnet_in_uniform_field`
  share a **lumped damped-pendulum integrator** with an *authored* stiffness
  (`pend_k`, commented "k = swing stiffness pE/I") and damping `pend_b`. **I is folded into a
  hand-tuned constant, never computed.** That engine structurally cannot express this chapter's
  central misconception target — *same body, different axis ⇒ different I* (RM-G2).
- **The `wheel` shape is kinematic, not dynamic.** SEAM G keeps the box mesh as an invisible
  carrier and reads the wheel's **spin from the body's position**; its own comment records
  *"PHYSICS IS IDENTICAL"* to a sliding block with `f = μ_r·N`. There is no rolling constraint,
  no I, and no KE split. It is an honest visual for rolling *friction*; it is not rolling *dynamics*.

**Conclusion: rotational dynamics is genuinely absent. 0c is required.**

---

## The two families

### Family A — MASS DISTRIBUTION + FIXED-AXIS ROTATION · **12 of 14** · needs a NEW scenario

Concepts 1–10, 13, 14. A set of masses at positions — as discrete particles, or as a rigid body
(disc, ring, rod, sphere, flywheel) on an axle or a torsion wire. No surface, no sliding, no
friction cone. This apparatus does not exist in any form today. **→ ONE new configurable
`scenario_type`.**

**Centre of mass costs almost nothing here, because it shares the mass-distribution core:**

```
R_cm = Σ mᵢrᵢ  / Σmᵢ      ← weighted by r¹   (concepts 1, 2)
I    = Σ mᵢrᵢ²            ← weighted by r²   (concepts 6–10, 13, 14)
```

Identical particle list, identical masses, identical radii — a different exponent. The axis
selector that concept 6 needs (*same body, different axis ⇒ different I*) is the same machinery
that lets concept 1 show the CoM sitting in a ring's empty hole. **Adding CoM does NOT add a third
engine**; it is a small extension of 0c-1's core, and concept 2 (tumbling body, CoM tracing a clean
parabola) reuses the θ-rotation machinery with a translating frame.

### Family B — ROLLING ON A SURFACE · **2 of 14** · EXTEND `newtons_laws_body`

Concepts 11 and 12 need an incline, several bodies racing, friction, force arrows and energy bars —
**all of which `newtons_laws_body` already has**, plus a wheel mesh. The only missing physics is I,
the rolling constraint, and the KE split. Rebuilding the incline apparatus inside the new scenario
would duplicate ~2,000 lines and fork a surface shared by 10+ shipped concepts. **→ a NAMED,
bounded rotational extension to `newtons_laws_body`**, exactly the shape Ch.6 used for its energy
layer.

> **This is still ONE Phase 0.** Two bounded builds planned up front is the doctrine working; it is
> the opposite of Class-12 Ch.7, which discovered engine work per concept and cost ~1,296M tokens
> for 6 concepts.

---

## Per-concept engine mapping

### 0c-1 — NEW `scenario_type` (working name `rigid_body_rotation`) · serves 12 concepts

| # | concept | Engine need beyond what exists |
|---|---|---|
| 1 | `centre_of_mass` | Particle set with per-particle mass + position; **computed CoM marker**; continuous bodies (rod, disc, ring, L-plate) with CoM shown — including **outside the material** |
| 2 | `motion_of_centre_of_mass` | Translating frame + free rotation: body tumbles while the CoM marker traces a clean path; V_CoM = P_total/M readout |
| 3 | `rigid_body_rotation` | Axle + rigid body meshes; θ rotation; per-point circular traces at different radii |
| 4 | `rotational_kinematics` | Angular kinematics integrator; θ/ω/α live readouts; a point's v arrow at radius r (v = ωr) |
| 5 | `torque` | Force applied at a point on the body; r vector, the angle, and the **moment arm r sin θ** drawn |
| 6 | `moment_of_inertia` | I computed live from the mass distribution + **an axis selector** (same body, different axis) |
| 7 | `tau_eq_i_alpha` | The α = τ_net / I integrator |
| 8 | `rotational_work_energy` | KE_rot = ½Iω² bar + W = τ·θ accumulator (mirrors the Ch.6 SEAM-L pattern) |
| 9 | `angular_momentum` | L = Iω drawn as a **vector along the axis**, right-hand rule |
| 10 | `conservation_of_angular_momentum` | **LIVE-VARYING I** (masses slide along the rod) with L pinned constant and ω responding — *the hardest single requirement* |
| 13 | `flywheel_application` | Energy stored then released over time against a fluctuating drive |
| 14 | `torsional_pendulum` | Torsional restoring torque τ = −κθ (a small delta on #7's integrator) |

### 0c-2 — ROTATIONAL EXTENSION to `newtons_laws_body` · serves 2 concepts

| # | concept | Engine need beyond what exists |
|---|---|---|
| 11 | `pure_rolling` | Rolling constraint v_CoM = Rω; contact-point velocity picture (0 at contact, v at centre, 2v at top) + cycloid trace; static-vs-kinetic friction called out at the contact |
| 12 | `rolling_on_incline` | Per-body shape factor I/mR² (2/5 sphere · 1/2 disc · 2/3 hollow sphere · 1 ring); the acceleration branch a = g sin θ / (1 + I/mR²); N bodies racing one incline, ranked by that factor |

> **NO energy bars in 0c-2 — deliberately (founder challenge, 2026-08-02).** Neither atomic's core
> claim is an energy claim: #11 is a kinematic constraint + a friction-type claim (the KE split is
> a *nano* beneath it, not the aha), and #12's result follows from dynamics (τ = Iα + N2 +
> constraint) without any energy argument. Nor would it be free reuse: the SEAM-L bar list is a
> **closed enum** `K | U_grav | U_spring | E_total | E_dissipated` with no rotational term, and
> `E_total` renders as a stacked K-on-U-on-Uₛ column — so adding KE_rot changes the stack semantics
> of a display 10+ shipped Ch.6/Ch.11 concepts depend on, and duplicates the KE_rot bar #8 already
> builds on the new scenario. Rules 31 / 32b / 34 agree: no canvas display that isn't the taught
> thing. **If the "a ring puts more energy into spinning" line is wanted for the race payoff, use a
> value-only numeric readout** (`KE_trans 2.40 J · KE_rot 0.96 J`, Rule 33d) via nlb's existing
> readouts — never a new bar in the shared panel.

### Advanced-ring engine sweep — COMPLETED 2026-08-02

The tables above swept the **core** physics. Rule 38 means every concept also carries an *advanced*
ring, and an advanced ring can demand engine capability its core ring never touches — which is
exactly how a chapter reaches concept 6 and then discovers a renderer edit (the alarm rule). This
sweep asks ONE question per concept: **does its advanced ring need engine capability the core ring
doesn't?** It does not assign states — that stays the architect's job at 0b/0d.

| # | concept | Advanced ring holds | New engine capability? |
|---|---|---|---|
| 1 | `centre_of_mass` | R = ∫r dm/M; composite bodies by subtraction | **YES (small)** — composite body as a *parts* list (per-part mass + centroid); reuses the Σmᵢrᵢ core |
| 2 | `motion_of_centre_of_mass` | A system that FRAGMENTS — CoM path continues undisturbed | **YES** — multi-body system, independent trajectories, live CoM marker + path trace |
| 3 | `rigid_body_rotation` | General motion = translation + rotation about CoM | no — shared with #2 |
| 4 | `rotational_kinematics` | Calculus forms ω = dθ/dt, α = dω/dt; non-uniform α | no — integrator already listed; θ(t)/ω(t) graph panel already exists in field_3d |
| 5 | `torque` | **τ = r × F vector form**, direction ⊥ to both | **YES** — a *live* cross-product construction |
| 6 | `moment_of_inertia` | **Parallel axis I = I_cm + Md²; perpendicular axis I_z = I_x + I_y**; I = ∫r²dm | **YES — highest value** — two axes shown simultaneously (shifted pair with d drawn; orthogonal triple on a planar body) |
| 7 | `tau_eq_i_alpha` | Derivation from the per-particle sum | no |
| 8 | `rotational_work_energy` | W = ∫τ dθ for varying τ; P = τω | no — bar + accumulator already listed; τ–θ graph uses the existing panel |
| 9 | `angular_momentum` | **L = r × p** — a particle on a STRAIGHT line still has L about a point | no new build — **the same cross-product construction as #5** |
| 10 | `conservation_of_angular_momentum` | Derivation τ_ext = dL/dt = 0 | no — live-varying I already listed |
| 11 | `pure_rolling` | 0 / v / 2v velocity field; cycloid | no — already in 0c-2 |
| 12 | `rolling_on_incline` | Derivation via τ = Iα about contact; **the slipping condition** | **YES (small)** — a rolling-vs-slipping regime switch (μ below threshold ⇒ it slips) |
| 13 | `flywheel_application` | Energy in/out across a cycle | no |
| 14 | `torsional_pendulum` | θ(t) = θ₀ cos ωt from τ = −κθ | no — τ = −κθ already listed |

**Verified absent across ALL branches** (Rule 40a — `git log --all -S`): moment of inertia, angular
momentum, centre of mass, parallel/perpendicular-axis geometry, multi-body fragmentation, and any
generic cross-product construction. The three `parallel_axis` / five `moment_of_inertia` commits are
**catalog and docs files only** — no engine implementation has ever existed.

**Prior art that is a PATTERN, not a reuse.** field_3d has three articulated right-hand-rule hands
(`createParallelCurrentsRhrHand`, `rhrFingerJoints`, plus biot_savart and `rhr_force_direction`), but
each is **orientation-FIXED at build** — `parallel_currents_force`'s own comment records *"Orientation
is FIXED at build … the hand never needs to track flips."* Rotational needs τ to track a **draggable**
F and a variable r, so this is a genuine new build; the existing hands supply the visual vocabulary
(arrow + hand + beat captions) to copy, and `vcross` exists only as a local helper inside one
scenario's closure, not as a shared primitive.

### ⇒ FIVE additions to the union table (this closes it)

| Add to | Capability | Serves |
|---|---|---|
| 0c-1 | **Live cross-product construction** (r × F and r × p, draggable inputs, ⊥ result + RHR) | #5, #9 — build once, serves two |
| 0c-1 | **Parallel-axis + perpendicular-axis geometry** — two axes at once, with d drawn | #6 — **core NCERT §7.10, its own syllabus section; not exotic** |
| 0c-1 | **Multi-body system + live CoM marker and path trace** (fragmenting system) | #2, and #3's general-motion ring |
| 0c-1 | **Composite body as a parts list** (per-part mass + centroid) | #1 |
| 0c-2 | **Rolling-vs-slipping regime switch** (μ below the threshold) | #12 |

Without this sweep, #5 and #6 would each have forced a renderer edit *after* 0c had landed —
precisely the failure that cost Class-12 Ch.7 ~1,296M tokens for 6 concepts.

### Explicitly OUT of scope for this Phase 0 (do not build)

- **Gyroscope + precession** — catalog Open Q1, V1.2 / Stage-4.
- **Compound-body I** (L-shape, T-shape) — Open Q2, V2; derivable via the two theorems.
- **General planar motion**, full treatment — Open Q3, V2.
- **Euler's equations for 3D rotation** — Open Q4, graduate-level.
- **Kepler's 2nd law** application — belongs to T16 Gravitation.
- **Linear momentum / collisions** — the rest of T14 stays in T14; only CoM is pulled forward.

---

## 0b — deepest-concept design (two spec drivers, one per build)

| Build | 0b spec driver | Why it is the most demanding |
|---|---|---|
| 0c-1 | **`conservation_of_angular_momentum` (#10)** | The only concept needing **live-varying I** while L holds constant, ω responds and KE_rot *changes*. It subsumes I, ω, L and the energy bar in one state. τ = Iα (#7) is strictly simpler — a constant-I integrator — so its exact functional forms are folded into the same physics block rather than driving a second design pass. |
| 0c-2 | **`rolling_on_incline` (#12)** | Exercises the constraint, the KE split, and a 4-body race on one incline simultaneously. |

Per the doctrine, **0c builds against the per-concept mapping above, not against #10 and #12 alone.**
founder-proxy **Checkpoint A** runs on each 0b skeleton **before any engine code**.

---

## SUCCESS TEST (Phase-0 alarm rule)

Concepts 1–14 must require **ZERO further renderer edits** after 0c-1 and 0c-2 land. A later concept
forcing an engine change means this survey under-generalized → **STOP and re-scope with the
surgeon**; never extend the engine per concept.

---

## ⚠ Rule 35 conflict — ALL 12 catalog anchors are India-specific

Worse than Ch.6: catalog Section F is titled *"Real-World Anchors (STRONG, **Indian-context**)"* and
**every single one** of its 12 anchors is country-specific — ISRO INSAT/GSAT/Cartosat, Bharatnatyam
and Kathak, Vande Bharat / WAP-7, Suzlon, Maruti/Tata KERS, Indian cricket spin bowling, Dipa
Karmakar, bullock-cart and Indian potter's wheels, BHEL turbines, HAL helicopters, INS Vikrant, DRDO
missiles. **The physics is sound; none of the framing is importable.**

The architect **must** author universal equivalents (Rule 35, founder 2026-07-10). Suggested set,
all culture-neutral and all classroom-recognisable:

| Catalog anchor | Universal replacement |
|---|---|
| ISRO reaction wheels | a spacecraft reaction wheel |
| Bharatnatyam / Kathak pirouette | **a person on a rotating stool pulling two masses in** (the canonical lab demo) |
| Vande Bharat traction motor | an electric train's traction motor |
| Suzlon wind farms | a wind turbine |
| Maruti / Tata KERS | an engine flywheel; regenerative braking |
| Indian cricket spin bowling | a thrown spinning ball |
| Dipa Karmakar somersault | a diver tucking in a somersault |
| Bullock cart / Indian potter's wheel | a potter's wheel; a bicycle wheel; a merry-go-round |
| BHEL turbines | a power-station turbine rotor |
| HAL helicopters | a helicopter rotor |
| INS Vikrant stabilisers | a ship's gyroscopic stabiliser |
| DRDO missile guidance | *drop* (defence + country-specific) |

Also load-bearing and fully universal: a door and its hinge, and a wrench on a bolt (torque /
moment arm) — both are already the textbook figures. For centre of mass: a thrown hammer or tennis
racket, and a ring whose CoM lies in the empty hole.

---

## REMAINING OPEN DECISION

**The engine strategy (§ "The two families").** Recommended: two bounded builds — one new
`rigid_body_rotation` scenario serving 12 concepts, plus a named rotational extension to
`newtons_laws_body` serving the 2 rolling concepts. Alternative: fold rolling into the new
scenario (avoids touching a shared file, but duplicates the incline/friction/energy apparatus).
