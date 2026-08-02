# Skeleton — `conservation_of_angular_momentum` (rotmech · Class 11 Ch.7 · 0b spec driver for build 0c-1)

> **Status:** Phase-0b deepest-concept design (AUTHORING_PIPELINE.md §0). This skeleton + the physics block ARE the real spec for the NEW field_3d `scenario_type` (working name `rigid_body_rotation`). Rule 12 does not apply — the scenario does not exist yet. Literal config/key names below are guesses; the field3d-surgeon dispatch report's closed enums supersede them. Physics, geometry, and what-must-be-visible are exact.
> **Bug-queue consultation:** this session has no SQL/Bash tool; consulted the canonical doc mirror `docs/FIELD3D_SCENARIO_CHECKLIST.md` (distillation of the field_3d `incident`/`directive` rows). Every directive is applied below — see the "Scar directives applied" note after §10. No exception needed → nothing to FLAG to Gate 8 on this ground.
> **DC Pandey check:** consulted chapter table of contents only (Rotational Mechanics — confirms conservation of angular momentum is its own sub-topic, after L = Iω and τ = Iα). No teaching method, no example problem, no figure imported.

---

## 1. Atomic claim

This concept teaches ONE thing: **when the net external torque on a system is zero, its angular momentum L = Iω stays constant — so if the mass distribution changes and I falls, ω must rise (and kinetic energy is NOT conserved while this happens)**. It does not cover what angular momentum is or its formula (taught in `angular_momentum`), how I is computed (taught in `moment_of_inertia`), or how a nonzero torque produces α (taught in `tau_eq_i_alpha`). The Kepler-2nd-law application is deferred to the Gravitation chapter (survey: out of scope).

## 2. State count + arc — 8 states (7 guided + 1 explore)

Complexity call: **complex (7–9 band)**. The concept needs the conservation event itself (2 contrast beats), its energy consequence (the misconception payoff), its vector nature (RM-G6), its boundary condition (τ_ext ≠ 0 breaks it), and the advanced derivation. Fewer states would fold two ideas into one beat and break the 25–55-word budget.

The apparatus is ONE machine throughout (Rule 32d home pose): a **turntable on a vertical axle, carrying a horizontal rod with two equal masses that can slide symmetrically along the rod**. The turntable is ALWAYS spinning from S1 onward — continuous rotation is the home-pose motion; each state's declared "distinct motion" is the change layered on top of that spin. HUD (value-only): `I`, `ω`, `L`, plus `KE` from S4.

| State | Title (Rule 41 — literal, first words carry meaning) | Purpose | teaching_method | Ring |
|---|---|---|---|---|
| S1 | Steady spin, constant L | Baseline: no external torque → I, ω, L all steady; L readout established | *(straightforward beat — field omitted)* | core |
| S2 | Masses pulled in — spin speeds up | THE PRIMARY AHA: I drops, ω rises, L stays pinned | *(straightforward beat)* | core |
| S3 | Masses pushed out — spin slows down | Contrast pair of S2: reversible, L still pinned | *(straightforward beat)* | core |
| S4 | Kinetic energy is not conserved | KE = ½Iω² rises during pull-in; the person does real work | `misconception_confrontation` (Rule 16a contrast beat, in-EPIC-L) | core |
| S5 | L is a vector along the axis | Direction by the right-hand grip rule; reverse the spin → L flips | *(straightforward beat)* | extended |
| S6 | External torque changes L | A brake pad touches the rim → L visibly decays; conservation needs τ_ext = 0 | *(straightforward beat)* | extended |
| S7 | Why L is constant: τ_ext = dL/dt | Derivation ring: τ_ext = dL/dt, so τ_ext = 0 ⇒ L constant | `derivation_first_principles` | advanced |
| S8 | Try it yourself | Sandbox: slide the masses, set the spin, watch L hold | `exploration_sliders` | *(explore — ring-neutral, surfaces CORE content only)* |

Advanced ring = S7, a contiguous block immediately before the explore state (Rule 38a) ✓. `advance_mode`: S1–S7 `manual_click`, S8 `interaction_complete` — ≥2 distinct modes (Gate 12) ✓.

## 3. Per-state choreography + control plan (Rule 31 control table — FIRST design artifact)

**Coined archetype (one, justified):** `radial-slide` — mass elements translate radially WITHIN the rotating body, changing its shape while it spins. No seed archetype captures a shape change of the rotating object itself (translate-through is an object moving past apparatus). Used by S2/S3 as a declared contrast pair.

| State | Teaches (one idea) | Archetype | Distinct motion (what animates; cause → effect per Rule 32a) | Delta (one line → ≤5-word cue) | Live controls (Rule 31c) | Words | Ring |
|---|---|---|---|---|---|---|---|
| S1 | With no external torque, L = Iω does not change | `reveal-build` | Turntable spins steadily at ω₀ = 2.0 rad/s, masses at r = 0.8 m; the L vector arrow draws in along the axle, then the I / ω / L readouts build in one by one, each on its narration beat. Nothing else changes — the steadiness IS the point | **"No torque: L constant"** | none | 30–45 | core |
| S2 | Pull the masses in → I falls → ω must rise to keep L fixed | `radial-slide` | CAUSE first: the two masses visibly slide inward along the rod (r: 0.8 → 0.2 m over ~2 s). After a readable ~0.7 s beat the EFFECT follows: rotation visibly speeds up (2.0 → 9.3 rad/s), ω readout climbs, I readout falls, **L readout sits pinned at 6.12 kg·m²/s with a hold-glow**. One full slow revolution before, several fast revolutions after | **"Masses in: spin faster"** | none (watch beat) | 35–55 | core |
| S3 | Push the masses out → I rises → ω falls; the trade runs both ways | `radial-slide` (declared contrast pair of S2 — delta names the flip) | Same choreography reversed: masses slide OUT (0.2 → 0.8 m), spin visibly slows (9.3 → 2.0 rad/s), L readout never moves. Ends back at the S1 home pose | **"Masses out: spin slower"** | none | 25–40 | core |
| S4 | L is conserved but kinetic energy is NOT — pulling in takes real work | `cycle-compare` | One full pull-in → push-out cycle with the KE readout/bar now visible. Wrong expectation shown first (Rule 16a): a thin static reference tick marks the starting KE = 6.1 J, labelled "if energy stayed constant". During pull-in the actual KE bar climbs past it to 28.4 J while L stays flat; on push-out KE returns to 6.1 J. The gap between tick and bar IS the work done pulling inward | **"Kinetic energy goes up"** | none | 40–55 | core |
| S5 | L is a vector pointing along the rotation axis (right-hand grip rule) | `rotate/flip` | Camera reframes to see the axle side-on (Rule 32d: camera moves only to frame the new thing). A grip-rule hand curls its fingers with the spin; the L arrow points up the axle. Then the spin direction reverses → the L arrow flips to point down. One flip cycle, looping | **"L points along axis"** | spin-direction toggle | 30–45 | extended |
| S6 | Conservation holds ONLY while τ_ext = 0; an external torque changes L | `null-result-hold` inverted as its declared contrast use: the state kills the belief "L never changes" by SHOWING the boundary — brake engages (cause), then L readout, pinned through S1–S5, visibly decays (effect). Archetype declared `translate-through` (brake pad moves in against the rim) | Brake pad translates in, touches the rim; after a beat, ω AND L decay together toward zero; the "L" hold-glow breaks. Release the brake → decay stops (L holds at its new lower value — it does not recover) | **"External torque changes L"** | brake-torque slider (this state only) | 30–50 | extended |
| S7 | τ_ext = dL/dt; zero external torque ⇒ dL/dt = 0 ⇒ L constant | `reveal-build` | The equation builds term by term on the single formula surface, synced to narration; alongside it a slow replay of S2's pull-in runs with dL/dt readout showing 0.00 throughout. Calculus notation allowed here only (Rule 38c) | **"Torque equals dL/dt"** | none | 35–55 | advanced |
| S8 | Sandbox — the teacher drives everything core | `drag-sandbox` | Free-running (Rule 37): teacher drags the mass-radius slider live, spin responds instantly, L pinned; can restart with a new ω₀ or mass m. Continuous motion, loops forever | **"Try it yourself"** | ALL core controls: mass radius r, initial spin ω₀, mass m (see 38b note below) | 0 / open | *(explore)* |

**Archetype audit:** reveal-build ×2 (S1/S7 — declared repeat justification: S1 builds instruments, S7 builds the equation; if founder-proxy objects, S7 falls back to a coined `equation-build`); radial-slide ×2 (declared contrast pair, delta names the flip); cycle-compare, rotate/flip, translate-through, drag-sandbox ×1 each. No static state — the turntable spins in every state.

**Rule 38b vs Rule 31 "explore = ALL controls" — declared resolution:** the spin-direction toggle (S5) and brake slider (S6) are EXTENDED-ring controls; surfacing them in the explore state would make S8 incoherent under the hide-extended preset. Rule 38b takes precedence (explore surfaces CORE-ring content only): S8 exposes r, ω₀, m. The brake control lives only in S6. Founder-proxy Checkpoint A should confirm this precedence call.

**Rule 33 macro↔micro:** N/A-with-justification — the taught variable (I, from the mass distribution) IS the visible mechanism: the masses at radius r are on screen, and I = I_frame + 2mr² recomputes live from what the eye sees. No hidden microscopic level exists. Instruments (Rule 33d): value-only HUD with live numbers — `I = 3.06 kg·m²`, `ω = 2.0 rad/s`, `L = 6.12 kg·m²/s`, `KE = 6.1 J` (S4+).

**Rule 34 canvas budget (per state):** top caption = the ≤5-word delta cue only; ONE math-serif Unicode formula surface (S1/S8: `L = Iω` · S2/S3: `ω = L / I` · S4: `KE = ½Iω²` · S5: none — the hand + arrow carry it · S6: `τ_ext ≠ 0 ⇒ L changes` · S7: `τ_ext = dL/dt`); HUD value-only; all math real Unicode (ω, τ, ½, ², ·, kg·m²/s).

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots, no per-state tic)

| Wrong belief | Confronted at | `misconception_watch` beat |
|---|---|---|
| "A spin rate cannot change unless something pushes or a motor acts" | **S2** | belief: nothing external touched it, so ω must stay 2.0 rad/s · visual_counter: masses slide in and the spin visibly speeds up 4.6× while the L readout never moves · one_line_fix: no external torque fixes L, not ω — change I and ω must change with it |
| **"If angular momentum is conserved, energy is conserved too"** (the one that matters most) | **S4** | belief: KE should stay at 6.1 J through the pull-in · visual_counter: the static "if energy stayed constant" tick vs the KE bar climbing to 28.4 J while L stays flat — wrong expectation drawn, real physics beside it, back-to-back, no pause · one_line_fix: pulling the masses inward takes real work, and that work becomes extra kinetic energy; KE = L²/2I rises as I falls |
| "L is just a number" (RM-G6 — L is a vector) | **S5** | belief: L has a size but no direction · visual_counter: the L arrow along the axle flips when the spin reverses · one_line_fix: L points along the rotation axis by the right-hand grip rule |

S1, S3, S6, S7, S8 carry NO misconception_watch — straightforward teaching. EPIC-C branches: **zero** (EPIC-L-first directive, 2026-06-10).

## 5. `has_prebuilt_deep_dive` states (2)

- **S2** — the primary-aha state; the "but WHY does it speed up" question is the historic sticking point (students accept the fact, not the mechanism). Cache-worthy.
- **S4** — energy bookkeeping is where exam mistakes concentrate (KE ratio problems); the L-conserved-therefore-E-conserved confusion has many phrasings. Cache-worthy.

These are the same states carrying the Pass-1 cliff sentences (see Block 1) — no divergence to document. V1.0 ships zero authored deep-dives (Rule 18); the flag marks investment priority only.

## 6. Drill-down clusters

**S2:** `why_omega_rises` ("what pushes it faster") · `L_vs_omega_confusion` (conserving ω instead of L) · `internal_forces_no_torque` (why the pulling force exerts no torque about the axis — it points along r).
**S4:** `ke_not_conserved` (energy bookkeeping in the pull-in) · `who_does_the_work` (the person/agent does work against the inward-force requirement) · `ke_ratio_formula` (KE = L²/2I, KE₂/KE₁ = I₁/I₂).

## 7. `entry_state_map`

```
entry_state_map:
  foundational:   STATE_1 → STATE_4   # "what is conservation of L" / stool demo / energy question
  vector_nature:  STATE_5             # "which direction is L"
  external_torque: STATE_6            # "when is L not conserved"
  derivation:     STATE_7             # "prove L is constant"
```

Default aspect = `foundational`. PRIMARY aha (S2) is inside the foundational range ✓ (foundational-coverage rule satisfied — no exit-pill needed). S4's energy beat also lands inside foundational, so the silent student meets both the aha and the key misconception on the default slice.

## 8. Prerequisites (advisory — Rule 23)

`angular_momentum` (#9, this chapter — L = Iω + vector nature), `moment_of_inertia` (#6 — I = Σmᵢrᵢ²), `tau_eq_i_alpha` (#7 — what a torque does), `rotational_work_energy` (#8 — KE = ½Iω², needed for S4's bar). **All four are in-chapter and NOT yet shipped** — they precede this concept in the approved 14-concept teaching order, so at 0d authoring time they will exist. No cross-chapter prerequisites.

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral)

**Primary: a person sitting on a rotating stool, holding a mass in each hand, arms stretched out — pulling the arms in makes them spin visibly faster; stretching out slows them down again.** This is the canonical lab demonstration, physically the EXACT system the sim renders (turntable + rod + two sliding masses), recognisable in any classroom in any country, and it hooks because the speed-up feels like something-for-nothing — nobody pushed. **Secondary: a diver leaving the board in a stretched position, tucking tight to somersault fast, then stretching out to slow the rotation before entering the water.** Both are per the founder-approved survey replacement table; the catalog's Bharatnatyam/Kathak/ISRO anchors are NOT imported. Region-dependent constants: none in this concept. The on-screen apparatus stays the abstract turntable (no human figure needed in the engine — the person lives in the narration, keeping the mesh budget small); narration says "like a person on a rotating stool" at S2.

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 8 states of §2, exactly as tabled in §3.

**(b) Symbol-label table** (on-canvas labels, Unicode, symbolic per Rule 24):

| Quantity | Label | First appears |
|---|---|---|
| Angular momentum | `L` (axle arrow + HUD `L = 6.12 kg·m²/s`) | S1 |
| Moment of inertia | `I` (HUD `I = 3.06 kg·m²`) | S1 |
| Angular speed | `ω` (HUD `ω = 2.0 rad/s`) | S1 |
| Mass radius | `r` (line from axle to a mass, tip tracking the mass) | S2 |
| Each sliding mass | `m` (small tag, S8 slider label `m`) | S1 |
| Kinetic energy | `KE` (HUD `KE = 6.1 J` + bar with reference tick) | S4 (never earlier — don't pre-spoil) |
| External torque | `τ_ext` (label at the brake pad) | S6 |
| Rate of change of L | `dL/dt` (formula surface + readout `dL/dt = 0.00`) | S7 only (advanced) |

**(c) Right-hand-rule plan:** S5 uses the **grip rule** (fingers curl with the spin, thumb gives L along the axis) — grip, not cross-product, because this state teaches circulation→axis direction, not a single r × p (that construction belongs to `angular_momentum` #9 / `torque` #5 per the survey union). The hand performs one full curl + flip cycle; visual vocabulary copied from the existing field_3d RHR hands (pattern, not code reuse — survey notes they are orientation-fixed; this one flips with the spin toggle).

**(d) Motion plan:** S1 spin + instrument build-in · S2 radial slide-in + spin-up (cause 0.7 s before effect) · S3 radial slide-out + spin-down · S4 full in-out cycle + KE bar tracking · S5 camera reframe + hand curl + spin reversal + L-arrow flip loop · S6 brake pad translate-in + joint ω/L decay + release-and-hold · S7 equation build + slow S2 replay with dL/dt = 0.00 · S8 free-running sandbox (Rule 37 auto-continuous). No passive state.

**(e) Modes:** conceptual-only (Rule 20 [D] — no `mode_overrides` authored).

**(f)** `assessment` + `coverage_map` authored (physics_author supplies items: new-ω calculation, KE-ratio item, τ_ext-condition item, L-direction item); `misconception_watch` exactly the 3 entries of §4.

**(g) Macro↔micro (Rule 33):** N/A-with-justification as stated in §3 — mechanism is fully visible at the taught level; live numeric instruments per state as tabled.

**(h) Canvas budget (Rule 34):** per state as tabled in §3 — one formula surface, ≤5-word delta cue, value-only HUD, all-Unicode math across DOM + any canvas text + sprite labels.

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Preset-cut coherence — checked:** *Hide advanced (drop S7):* S1–S6 + S8 — coherent; nothing in S1–S6/S8 references dL/dt or the derivation. *Hide advanced+extended (drop S5–S7):* S1–S4 + S8 — coherent; S1 states the "no external torque" condition qualitatively in its own narration, S4 closes the energy story, S8 uses only core controls and core formula `L = Iω`. No surviving state names the brake, the vector direction, or dL/dt.
- **(i-2)** Explore state = core-ring content only: formula `L = Iω`, controls r / ω₀ / m, all symbols established in S1–S2 ✓.
- **(i-3) `curriculum_tags` (claims, not facts):** CBSE/NCERT: covered (NCERT Ch.7, conservation of angular momentum §7.13-area) — verifiable at authoring, marked verified. JEE Main/Advanced: core+extended+advanced — `needs_teacher_verification`. NEET: core+extended — `needs_teacher_verification`. IB DP Physics / A-level / AP Physics C: rings claimed core(+advanced for AP C / A-level rotational dynamics options) — every cell `needs_teacher_verification: true`.
- **(i-4) Preset proposal (hide, never reorder):** `full` = S1–S8 · `no_derivation` = hide S7 · `qualitative_core` = hide S5–S7.
- **(i-5) Graph axes (38e):** no graph in this concept's core or extended rings (live readouts carry the numbers; the S7 replay uses a readout, not a curve) → no axis-convention conflict exists. N/A by design, not by omission.

**Scar directives applied (FIELD3D_SCENARIO_CHECKLIST.md):** concrete-before-abstract (S1 steady case alone before the change at S2) · reveal-synced-to-narration (S1 instrument build, S7 equation build) · show-quantity-live-when-named (r line grows at S2 when narration first says "radius") · don't-pre-spoil (KE first at S4; dL/dt only at S7; ε-style constants none) · visual-matches-narration (the pinned-L hold-glow is SHOWN whenever "L does not change" is said) · coordinate-sim+graph (no static curve anywhere) · explorers-must-move / no clock-gated slider visuals (S8 free-runs, slider-driven visuals render at full immediately) · sliders-in-last-state amended by Rule 31 per-state contextual controls (S5/S6 local controls are current doctrine).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `angular_momentum` → breaks at **S1**: a student who has never met L = Iω sees three readouts with no meaning; S1's first narration sentence re-states it in one breath ("the spin momentum L — moment of inertia times angular speed") without condescending. `moment_of_inertia` → breaks at **S2**: if I is a mystery, "I falls when the masses come in" is magic; S2's choreography patches it by having the `r` line shrink WITH the I readout so I-follows-r² is seen even if not derived. `rotational_work_energy` → breaks at **S4**: one clause re-anchors KE = ½Iω² as the bar appears. `tau_eq_i_alpha` → breaks at **S6**: one clause — "a torque is what changes rotation" — as the brake engages.

**JEE-backwards trace.** *"A person stands on a frictionless rotating platform with a 2 kg mass in each hand. With arms out, I = 3.0 kg·m² and ω = 2 rad/s. Pulling the masses in reduces I to 0.66 kg·m². Find (i) the new ω, (ii) the ratio of final to initial kinetic energy, (iii) where the extra energy came from."* Piece (i) L₁ = L₂ and why → S1–S3. Piece (ii) KE = L²/2I ⇒ KE₂/KE₁ = I₁/I₂ → S4 (algebra surfaced in S4's deep-dive cluster `ke_ratio_formula`; the state itself shows the numbers 6.1 → 28.4 J). Piece (iii) work done by the person → S4. Condition-check distractor ("platform has friction") → S6. Vector-direction variant → S5. No missing piece.

**Misconception entry mapping (16a).** All three wrong beliefs are confronted proactively in EPIC-L per §4. Planting risk: S2's narration could itself plant "energy for free" if it says the spin-up "costs nothing" — physics_author is instructed to say "no external torque" (torque-free ≠ effort-free) and S4 detonates the residue two clicks later. No EPIC-C branches (fallback deferred).

## Block 2 — Aha-moment designation

- **PRIMARY aha (the 10-year memory), at S2:** *pull your arms in and you spin faster all by yourself — because L = Iω cannot change when nothing outside twists you.*
- **SUPPORTING aha (1), at S4:** *the speed-up is not free — kinetic energy goes UP, paid for by the real work of pulling the masses inward.* Cohesion: it deepens the primary directly (same event, energy ledger of it) — it does not stand alone. Total = 2 (sweet spot).
- **Wrong-belief setup.** For the primary: S1 deliberately builds "nothing external acts, so nothing about the spin will change" — one full state of confident steadiness before S2 breaks the ω half of that belief while keeping the L half. For the supporting: S2+S3 build "the trade is perfectly reversible, so nothing is gained or lost" — S4 shows exactly what is NOT conserved inside that reversible-looking trade.
- **Foundational coverage:** S2 ∈ foundational (S1–S4) ✓.

---

## ENGINE REQUIREMENTS THIS SKELETON IMPOSES (for `field3d-surgeon`, build 0c-1)

Ground truth check against the survey's closed union table; findings flagged explicitly.

**Already in the union table (build as listed):**

1. **Live-recomputed I from the mass distribution, every fixed step** — `I(t) = I_frame + Σ mᵢ rᵢ(t)²` with rᵢ varying DURING rotation. Never an authored constant. (Union: #10 row — the named hardest requirement.)
2. **Conservation integrator mode: L pinned, ω responds** — `ω(t) = L / I(t)` each step, θ integrated from ω on the Rule-36 fixed-step clock (0–3 × 1/60 s steps, linear in dt). L is the state's invariant, set from initial conditions, never drifting numerically (compute ω from L, don't integrate α — this is the exactness the pinned-L readout depends on). (Union: #10.)
3. **Torque integrator mode: α = τ_net / I** — used by S6 (brake) and shared verbatim by concept #7 `tau_eq_i_alpha` and, with τ = −κθ, #14. The scenario needs BOTH modes selectable per state: `L_conserved` vs `torque_driven`. **Note for the surgeon:** S6 switches the same apparatus from mode 2 to mode 3 mid-lesson — the mode is per-state, not per-concept. (Union: #7 + #10 jointly imply this; the per-state mode switch is spelled out here so it lands in the state contract.)
4. **Radial mass translation choreography** — two masses slide symmetrically along the rod on an authored ramp (r: 0.8 ↔ 0.2 m over ~2 s) while the body rotates; also drivable live by a slider in S8 (trusted-drag seizes, per the live-instrument model). (Union: #10 "masses slide along the rod".)
5. **L vector along the axis** — arrow on the axle, length ∝ |L|, flips with spin sign (S5). (Union: #9 row; the flip-with-sign behaviour is required here.)
6. **KE_rot readout** — ½Iω² live, mirroring the SEAM-L-style pattern on the new scenario. (Union: #8 row.)
7. **Grip-rule hand that tracks spin direction** — curl + thumb along axis, must flip when ω reverses. (Union: the cross-product/RHR construction row covers the hand vocabulary; survey already notes existing hands are orientation-fixed and this build makes orientation live.)
8. **Value-only HUD instruments** I / ω / L / KE with live numbers + a hold-glow treatment on a pinned readout (Rule 33d/34b; hold-glow is a brightness treatment per Rule 29 — no size pulse).
9. **deriveStateMeta.ts co-edit in the SAME change** (scar rule: reveal/hold/motion recognition per state, else THE EYE false-fails D7/D1p); continuous-spin states classified so the always-rotating home pose never reads as a frozen tail.

**FINDINGS — needed by this skeleton but NOT explicitly in the union table (call these out at Checkpoint A / dispatch):**

- **F1 — Static reference tick on a readout/bar ("wrong expectation" marker).** S4's Rule-16a contrast needs a thin labelled tick at the starting KE value ("if energy stayed constant") that the live bar climbs past. Trivial to build, but it is a display primitive the union table never names. Generic form suggested: an authored `reference_marks` entry on any readout/bar (value + short label) — #12's rolling race could reuse it. Cost: small.
- **F2 — External brake-torque source with a visible actuator.** The union gives the α = τ_net/I integrator (#7) and force-at-a-point torque (#5), but S6 needs a *named friction-brake* torque: a pad mesh that translates in, contacts the rim (cause), applies an authored constant opposing τ (effect, after the readable beat), releases on cue, magnitude drivable by the S6 slider. A brake is also the natural τ source for #13 `flywheel_application`'s energy-release beat — build it once as a generic `external_torque: {type: brake, tau, engaged}` and it serves two concepts. Cost: small.
- **F3 — Per-state integrator-mode switch on one apparatus** (mode 2 ↔ mode 3 within a single concept). Implied by the union but never stated as a per-state contract; making it per-state config (not per-scenario) is what keeps S6 pure JSON. Cost: zero if designed in now; an alarm-rule stop if discovered later.

Neither F1, F2 nor F3 changes the two-build strategy or adds a third engine; all three are small, and per the survey's alarm rule they are being raised NOW, at 0b, not mid-chapter.

**Explicitly NOT required by this concept** (don't build on its account): graphs/curve panels, energy bars beyond the single KE readout+tick, a human figure mesh, precession/gyroscope machinery, multi-body fragmentation (that's #2's row), the r × p cross-product construction (that's #5/#9's row).

---

*Handoff: → founder-proxy Checkpoint A on this skeleton before any engine code; then physics_author for exact functional forms (including #7's constant-I integrator forms, folded into the same physics block per the survey), then 0c-1 dispatch to field3d-surgeon on `feat/rotmech-engine`.*
