# Physics-author block — `torque_on_current_loop_in_field`

> **[VINTAGE — pre-Rule-31/35 architecture (Socratic beats, Indian anchors, EPIC-C). Historical record only — never clone.]**

> **[OLD MODEL — superseded by Rule 31, 2026-07-02.]** This exemplar predates the straightforward +
> per-state-contextual-controls doctrine: it uses Socratic predict→reveal pacing, `wait_for_answer` /
> `pause_after_ms` beats, and/or "sliders in the last state only". Do NOT clone its pacing or control
> placement for new concepts — clone `faraday_law_induction_skeleton.md` instead. Physics content and
> structure remain valid reference.

Consumes the architect skeleton at `torque_on_current_loop_in_field_skeleton.md`. Produces variables, formulas, per-state physics overrides, drill-down trigger phrases, board mark scheme (deferred per Rule 20 M1-M6).

---

## Variables (slider-controllable)

```
N         — number of turns                                int        default 1     min 1     max 100   step 1
I         — current through the loop                       A          default 0.5   min 0.01  max 5     step 0.01
L_side    — side length of (square) loop                   m          default 0.10  min 0.02  max 0.30  step 0.01
B         — magnitude of uniform external field            T          default 0.1   min 0.01  max 1.0   step 0.01
theta_deg — angle between μ and B                          deg        default 30    min 0     max 180   step 1
```

Square loop is the pedagogical simplification (A = L_side²). Generalization to rectangular and circular loops mentioned in tertiary anchor but not slider-exposed (avoids cognitive overload per Mayer segmenting).

## Computed outputs

```
A_loop        — L_side * L_side                                                 m²
mu_magnitude  — N * I * A_loop                                                  A·m²
tau_magnitude — mu_magnitude * B * sin(theta_deg * PI / 180)                    N·m
tau_max       — mu_magnitude * B                                                N·m   (at θ = 90°)
F_per_side    — I * L_side * B                                                  N     (force on one current-carrying side)
omega_natural — sqrt(mu_magnitude * B / I_inertia)                              rad/s (approximate; I_inertia ≈ N * (1/12) * m_loop * L_side² for thin-frame model)
```

Note: `omega_natural` is reported but pedagogically deferred — we describe oscillation qualitatively in STATE_7 without deriving period; vibration_magnetometer concept (catalog row 26.13) carries the full derivation.

## Core formulas

```
tau_vector        :  τ = μ × B                                  (vector form, RHR)
tau_magnitude     :  τ = μ B sinθ                               (scalar form)
mu_definition     :  μ = N I A                                  (loop magnetic moment)
mu_direction      :  μ ⊥ loop face, RHR from current direction  (right-hand curl fingers along I, thumb gives μ)
net_force_zero    :  F_top + F_bottom = 0  and  F_left + F_right = 0    (anti-parallel pairs)
force_per_side    :  F = I (L × B)                              (force on a current-carrying segment)
no_work           :  W = ∫ τ dθ = 0  averaged over one rotation in pure τ = μ × B  (no dissipative source means KE oscillates, average = 0)
equilibrium_stable:  θ = 0°   (μ ∥ B)            ← τ = 0, restoring τ if perturbed
equilibrium_unstable: θ = 180° (μ anti-parallel to B)  ← τ = 0, but any perturbation grows
oscillation_qualitative:  if released from θ ≠ 0 with no friction, loop oscillates between ±θ_0 about θ = 0
```

## Constraints

```
1. B must be uniform across the loop. Non-uniform B adds a net force (gradient term).
2. Loop is rigid — no flexing. Wire is non-resistive for the pure-physics demo.
3. Rotation axis is fixed by the geometry (we choose the axis ⊥ to both sides feeling force).
4. theta_deg measured from μ to B (not B to μ). Sign convention: positive θ → restoring τ.
5. The formula τ = μ × B holds for ANY shape of planar loop, not just rectangular.
   The rectangular special case is pedagogically chosen to derive it from F = IL × B; the general
   result then generalizes.
6. No emf back-reaction (would couple to the next chapter, electromagnetic induction).
```

---

## Per-state physics overrides (EPIC-L)

| state | theta_deg | N | I | L_side | B | what physics drives the visual |
|---|---|---|---|---|---|---|
| STATE_1 | 90 | 1 | 0.5 | 0.10 | 0.1 | loop at rest, θ=90° (μ ⊥ B), max τ scenario — but no rotation shown yet |
| STATE_2 | 90 | 1 | 0.5 | 0.10 | 0.1 | reveal F on side AB; F = I·L_side·B ≈ 0.005 N |
| STATE_3 | 90 | 1 | 0.5 | 0.10 | 0.1 | reveal F on side CD; same magnitude, opposite direction. ΣF = 0 |
| STATE_4 | 90 | 1 | 0.5 | 0.10 | 0.1 | τ revealed: τ = μB sin 90° = 1·0.5·0.01·0.1 = 5×10⁻⁴ N·m |
| STATE_5 | 90 | slider | slider | slider | 0.1 | student varies N,I,L to see μ scaling |
| STATE_6 | slider | 1 | 0.5 | 0.10 | 0.1 | θ slider 0→180; τ scales as sinθ |
| STATE_7 | initial 60 | 1 | 0.5 | 0.10 | 0.1 | release at 60° → oscillates; switches loop ↔ bar magnet on click |

## Per-state physics overrides (EPIC-C)

| branch | state | what wrong-belief physics looks like |
|---|---|---|
| A (work) | A.1 | KE-rising bar gauge (wrong); τ does NO net work in the absence of dissipation |
| A | A.2-4 | re-derive F · v_side over a loop side; show time-averaged to zero |
| B (net force) | B.1 | both side-forces drawn parallel-same-direction (wrong) |
| B | B.2-4 | restore anti-parallel; ΣF visibly cancels frame-by-frame |
| C (τ max @ aligned) | C.1 | μ ∥ B with giant τ arrow (wrong) |
| C | C.2-4 | sweep θ from 0 to 90; show τ-magnitude curve rising as sinθ |
| D (RHR for μ) | D.1 | μ drawn tangent to loop edge (wrong) |
| D | D.2-4 | RHR correctly applied — fingers curl with I, thumb gives μ perpendicular through face |

---

## Drill-down trigger phrases (for confusion_cluster_registry)

```
state: STATE_3
  cluster_id: why_no_net_force
    triggers: ["why is there no net force", "shouldn't the loop move", "where does the translation go",
               "the forces look balanced but the loop is moving", "if forces cancel why does it spin"]
  cluster_id: forces_look_unequal
    triggers: ["forces look different", "why are F1 and F2 equal", "isn't one side stronger",
               "the closer side should feel more force"]

state: STATE_4
  cluster_id: where_does_torque_come_from
    triggers: ["where does torque come from", "what is a couple", "why does it rotate not translate",
               "how can zero force cause motion", "what makes it spin if ΣF is zero"]
  cluster_id: which_axis_does_it_rotate
    triggers: ["which axis", "why this axis and not that", "where is the rotation axis",
               "what if I tilt the loop", "does it always rotate about the same line"]

state: STATE_6
  cluster_id: tau_max_at_what_angle
    triggers: ["when is torque max", "why is torque zero at zero", "shouldn't aligned be max",
               "what angle gives biggest spin", "why sin and not cos"]
  cluster_id: stable_vs_unstable_equilibrium
    triggers: ["which equilibrium is stable", "what if mu is anti-parallel to B",
               "why does it come back to zero", "is 180 degrees also equilibrium"]
```

---

## Board mark scheme (DRAFTED-BUT-DEFERRED per Rule 20 M1-M6 exception)

Retained here for M7 retrofit; NOT shipped in V1 mode_overrides:

```
Step 1:  Identify forces on each of the 4 sides of the loop                    [1 mark]
Step 2:  Show top & bottom sides → no force (current ∥ B for those sides)     [1 mark]
Step 3:  Compute F on left/right sides: F = I L_side B                         [1 mark]
Step 4:  Show ΣF = 0 (anti-parallel forces cancel)                             [1 mark]
Step 5:  Compute torque arm and torque magnitude τ = F · (L_side · sin θ)      [2 marks]
Step 6:  Rewrite as τ = (I A) · B sin θ                                        [1 mark]
Step 7:  Generalize: τ = μ B sin θ where μ = N I A                             [1 mark]
Step 8:  Vector form: τ = μ × B                                                [1 mark]
Total:                                                                         [9 marks]
```

Mark badges flagged for retrofit at M7 — one per step, accumulating yellow "+N marks" overlays as derivation_sequence handwrites the answer on the answer-sheet canvas.

---

## Handoff to json-author

Next phase consumes both the skeleton and this physics block. Output:
- `src/data/concepts/torque_on_current_loop_in_field.json` (~30 KB)
- `src/lib/physicsEngine/concepts/torque_on_current_loop_in_field.ts`
- 6 registration sites + admin test page
- field_3d_config block with `scenario_type: "torque_on_loop_uniform_field"`
- slider_controls for N, I, L_side, B, theta_deg

Renderer extensions REQUIRED (Phase 4, in field_3d_renderer.ts):
- `buildTorqueLoopInField()` — analogous to `buildLorentzForceField()` (line 1808)
- rectangular loop mesh + per-side current arrows
- force-pair arrows that update with rotation
- μ vector arrow through loop face (RHR-derived from current direction)
- τ vector arrow along rotation axis
- `SET_LOOP_ANGLE` postMessage handler — accepts theta_deg, rotates loop mesh smoothly
- Reuse `ambient_field` grid from `buildLorentzForceField` (already there at line 1808)
- Optional: oscillation animation mode (μ swings around B with simple harmonic approximation)
- Bar magnet swap primitive for STATE_7 (loop → equivalent bar magnet, same μ)
