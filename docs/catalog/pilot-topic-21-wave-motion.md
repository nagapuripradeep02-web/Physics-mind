# Stage 2 Pilot — Topic 21: Wave Motion

> **Pilot purpose:** Second of three pilots (after Friction). Applies the founder-approved format from `pilot-topic-12-friction.md` to a topic with NO existing repo concepts (Wave Motion is fresh territory) and a different shape (more abstract math, fewer problem-pattern atomics, cross-topic dependencies to SHM/Sound/Wave-Optics).

**Stage:** 2 (concept extraction) — pilot batch 2 of 3
**Topic from Stage-1 commonality matrix:** Row 21 — "Wave Motion — transverse, longitudinal, equations"
**Triple-covered check:** ✅ NCERT 11.2 Ch.15 §15.1–15.5 + DC Pandey W&T Ch.17 + HC Verma Vol-1 Ch.15 §15.1–15.5
**Status:** **Founder-style decisions applied 2026-05-25.** Founder delegated all open-question authority with quality as the only red line ("don't compromise quality — this research is product strategy"). Decisions captured in the table below; Section G updated; Section D edited accordingly.

---

## Founder-style decisions applied (2026-05-25)

Founder delegated decision authority on 2026-05-25 with the constraint "quality must not be compromised — the data and patterns drive product strategy." Decisions taken as a founder would, optimizing for catalog completeness + dependency-graph integrity + Stage-4-onward usefulness, not for catalog brevity.

| # | Question | Decision | Effect on this file |
|---|---|---|---|
| W-G1 | A20 phase-constant — atomic or nano of A8? | **Collapse into A8 as nano N8.4.** Same pattern as Friction Q-C1 (A16 angle-of-friction → N15.3). φ is a parameter of the sine-wave equation, not an independent physical phenomenon. | A20 row removed below; N8.4 added under A8. |
| W-G2 | A10 wave-number — atomic or nano of A9? | **Confirmed as nano N9.2 (already collapsed in catalog).** k = 2π/λ is mathematically equivalent to λ. | No change — confirmed as-is. |
| W-G3 | A16, A17, A18 sound-speed atomics — Topic 21 or Topic 23? | **Keep in Topic 21 as v1?=FALSE.** NCERT §15.4.2 + DCWT §17.6 both place these in their Wave Motion chapters (2-of-3 sources vote Topic 21). Each atomic lives in exactly ONE catalog file. Topic 23 Sound Waves will cross-topic-ref when authored. | No changes to A16, A17, A18 rows. |
| W-G4 | Math-tools reference file — create now? | **Defer to Stage 3** (divergent chapters). Math tools are JEE-extra per founder's "triple-covered only" scope rule, but the catalog dependency graph still needs nodes for Requires columns to terminate at. Stage 3 creates a slim `stage-3-tier-0-math-tools.md` reference (not authoring scope). For Stage 2, use `[math-tools: <concept>]` notation in Requires column as the placeholder. | No change to existing `[math-tools: ...]` references; convention locked. |
| W-G5 | `candidate_micro` Stage-4 review threshold | **Tag every candidate_micro through Stage 2 (all 44 topics), Stage 4 reviews en bloc.** Cannot set threshold without seeing distribution. Current pattern: 2-6 per topic. Decision held until Stage 4 has data. | No change to existing tags. |
| W-G6 | 2,770 total entries projection — tighten atomic threshold? | **ACCEPT — do not tighten.** Catalog must be exhaustive for research value. V1 authoring queue is ~1,000 atomics per "1 context per concept" rule = tractable over 2-3 years. Tightening now loses patterns Stage 4–6 need. Founder's words: "don't compromise quality — the data and patterns help a lot." | No change to atomic/nano granularity rules. |

---

## Section A — Source citations

| Source | Location | Pages (printed) | Pages (PDF) | Coverage type |
|---|---|---|---|---|
| **NCERT 11.2** | Ch.15 "Waves" §15.1 Introduction + §15.2 Transverse & Longitudinal + §15.3 Displacement Relation (15.3.1 Amplitude/Phase, 15.3.2 Wavelength/Wave number, 15.3.3 Period/Frequency) + §15.4 Speed of Traveling Wave (15.4.1 Transverse, 15.4.2 Longitudinal) + §15.5 Principle of Superposition | 367–378 | 147–158 | Canonical baseline + 4 worked examples (Ex 15.1–15.4) |
| **DC Pandey W&T** | Ch.17 "Wave Motion" §17.1 Intro + §17.2 Mechanical/Non-mechanical + §17.3 Equation of Travelling Wave + §17.4 Sine Wave (Wavelength, Frequency, Wave speed, Particle velocity vs Wave velocity) + §17.5 Two Graphs in Sine Wave + §17.6 Wave Speed (Transverse + Longitudinal in 3 states + Newton-Laplace) + §17.7 Energy in Wave Motion | 1–22 | 14–35 | Problem-pattern + graph-pedagogy depth (11 worked examples, 5 introductory exercises) |
| **HC Verma Vol-1** | Ch.15 "Wave Motion and Waves on a String" §15.1 Wave Motion + §15.2 Wave Pulse on a String + §15.3 Sine Wave Travelling on a String + §15.4 Velocity of a Wave on a String + §15.5 Power Transmitted Along the String. (§15.6–15.15 = Topic 22 + Topic 23, out of scope) | 303–308 | 313–318 | Concept-derivation pedagogy (4 worked examples in §15.1–15.5; remaining at chapter end) |

**Cross-check note:** Unlike Friction (where HCV1 owned conceptual depth), Wave Motion is more evenly distributed: NCERT and DCWT both give substantial theoretical treatment, HCV1 is shorter but pedagogically tighter. DCWT adds the unique "Two Graphs in Sine Wave" (§17.5) pedagogy that neither NCERT nor HCV1 has — a major teaching asset.

---

## Section B — Existing repo concepts addressing this topic

| File | Concept ID | What it covers | What it doesn't |
|---|---|---|---|
| — | — | **No existing repo concepts for Wave Motion.** | All 26 atomic concepts below are net-new V1 authoring work. |

Forward-referenced prereqs already in repo (cross-topic dependencies):
- `newton_second_law_direction.json` — used in A14 transverse-wave-speed derivation (string segment FBD)
- `free_body_diagram.json` — used in A14 small-segment analysis
- `vector_resolution.json` — minor (tension components on curved string)
- **MISSING prereqs (Topic 20 SHM, not yet authored):** angular frequency ω, simple harmonic motion equation, period T, phase angle φ. SHM is Topic 20 in the catalog matrix; its atomics get extracted at Topic-20 catalog time. Cross-topic-ref edges below cite SHM prereqs as `[Topic-20: <concept_id>]`.

---

## Section C — Methodology notes (carried over from Friction format)

Same conventions as `pilot-topic-12-friction.md` Section C:
1. Atomic-per-context (where applicable — Wave Motion has fewer "contexts" than Friction; mostly definitional + derivational)
2. Per-row `v1?` flag inside Notes
3. Source citation as `[Book §Sec p.NNN]` triple
4. `UNCERTAIN — flagged for founder review` where atomic/nano boundary is unclear
5. Cross-topic dependency edges cite the foreign topic, not invent the concept
6. Nano rows use `↳` prefix with `parent: <atomic_id>` in Notes
7. `granularity_question: candidate_micro` flags accumulated for Stage-4 en bloc review

**Wave-Motion-specific note:** The atomic/nano boundary for math-heavy derivations (e.g., A14 v=√(T/μ) — is the dimensional-analysis approach a nano, or is each derivation method a separate atomic?) is genuinely harder than for Friction's problem patterns. I flagged 3 UNCERTAIN tags rather than coin-flip.

---

## Section D — Concept catalog (atomic + nano)

### Legend (same as Friction)

- **Type:** `atomic` | `nano` | `cross-topic-ref`
- **Sim?:** ✅ simulatable | ⚠ partial | ❌ not-simulatable
- **In repo?:** ✅ already a JSON | ⚠ partially covered | — not yet authored
- **v1?:** TRUE = ships in V1 | FALSE = V2 candidate

### Tier 1 — Foundational definitional atomics (the "what is a wave" cluster)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A1** `wave_motion_energy_transport_without_matter` | A wave transports energy/disturbance from one region of space to another **without bulk motion of matter** | atomic | ✅ | — | — | A2, A6, A27 | **Sources:** HCV1 §15.1 (queue analogy + "Hello" example); NCERT §15.1 (pebble-in-pond, cork-pieces-on-water explicit); DCWT §17.1 (energy transfer definition). **v1?:** TRUE — opens the topic. **PRIMARY aha:** the medium doesn't travel; the disturbance does. |
| ↳ N1.1 `queue_jerk_propagation_analogy` | Person in queue leans → pushes neighbor → jerk propagates without anyone walking forward | nano | ✅ | — | A1 | A1 | parent: A1. Sources: HCV1 §15.1 (the classic Indian-context queue figure). Strong real-world visual. |
| ↳ N1.2 `cork_pieces_on_water_demo` | Drop pebble in pond; cork pieces bob up-down but don't move outward | nano | ✅ | — | A1 | A1, A27 | parent: A1. Sources: NCERT §15.1 explicit. |
| ↳ N1.3 `circular_ripple_on_water` | Raindrop on calm water → expanding circle. Each water particle locally up-down only. | nano | ✅ | — | A1 | A1 | parent: A1. Sources: HCV1 §15.1, NCERT §15.1. |
| **A2** `mechanical_vs_nonmechanical_waves` | Mechanical waves require a medium (sound, string, water); non-mechanical do not (EM, matter waves) | atomic | ✅ | — | A1 | A3, A4, A14, A26 | **Sources:** HCV1 §15.1 explicit definition; NCERT §15.1 (trichotomy: mechanical, EM, matter waves); DCWT §17.2 explicit. **v1?:** TRUE. EPIC-C: misconception "all waves need a medium" → confronted (EM waves in vacuum). |
| ↳ N2.1 `sound_requires_medium_no_sound_in_vacuum` | Bell-jar experiment: bell rings inaudibly when air pumped out. Sound is a mechanical wave. | nano | ✅ | — | A2, A4 | A2, A4 | parent: A2. Sources: DCWT §17.2 ("Over the moon, sound waves cannot travel"), NCERT §15.1. |
| ↳ N2.2 `EM_waves_propagate_in_vacuum_speed_c` | Light from stars reaches earth across vacuum at c = 3×10⁸ m/s | nano | ✅ | — | A2 | A2 | parent: A2. Sources: NCERT §15.1 explicit (Eq 15.1 cites c). Cross-topic-ref Topic-40 EM Waves for depth. |
| ↳ N2.3 `matter_waves_de_broglie_brief_mention` | Quantum-mechanical waves associated with electrons, used in electron microscopes | nano | ⚠ partial | — | A2 | — | parent: A2. Sources: NCERT §15.1 brief paragraph. Cross-topic-ref Topic-48 Dual Nature. ⚠ partial sim — quantum waves don't visualize as classical disturbances. |
| **A3** `transverse_wave_definition_particles_perpendicular` | Wave where medium particles oscillate **perpendicular** to propagation direction (string, water surface, EM) | atomic | ✅ | — | A1, A2 | A14, A23, A26 | **Sources:** HCV1 §15.14 (within §15.1-15.5 scope referenced from §15.2); NCERT §15.2 (Fig 15.2 pulse on string, Fig 15.3 harmonic wave); DCWT §17.4 (Fig 17.3 crest-trough). **v1?:** TRUE. Key visual: string up-down vs wave left-right. |
| ↳ N3.1 `string_pulse_y_perpendicular_x_propagation` | Hand snap up-down sends pulse along x; each string element moves in y only | nano | ✅ | — | A3, A1 | A3 | parent: A3. Sources: HCV1 Fig 15.2, NCERT Fig 15.2. |
| **A4** `longitudinal_wave_definition_particles_parallel` | Wave where medium particles oscillate **along** propagation direction (sound in air, compression in slinky) | atomic | ✅ | — | A1, A2 | A16, A17, A23 | **Sources:** HCV1 §15.14 (sound waves are longitudinal); NCERT §15.2 (Fig 15.4 piston in pipe, compressions and rarefactions); DCWT §17.4 (Fig 17.4 compressions/rarefactions). **v1?:** TRUE. Key visual: slinky compression travels. |
| ↳ N4.1 `compressions_and_rarefactions` | Longitudinal wave = alternating high-density and low-density regions traveling | nano | ✅ | — | A4 | A4, A16 | parent: A4. Sources: NCERT §15.2, DCWT §17.4. |
| ↳ N4.2 `piston_in_pipe_generates_sound` | Push-pull piston creates sinusoidal compressions in air → sound wave | nano | ✅ | — | A4, N4.1 | A4 | parent: A4. Sources: NCERT Fig 15.4 explicit. |
| **A5** `wave_pulse_vs_wave_train` | Single jerk = wave pulse; continuous oscillation of source = wave train (or wave packet) | atomic | ✅ | — | A1 | A6, A8 | **Sources:** HCV1 §15.2 explicit (pulse if source active briefly; wave train if continuous); NCERT §15.2 (Fig 15.2 pulse vs Fig 15.3 harmonic wave); DCWT §17.3 implicit. **v1?:** TRUE. Foundational distinction before introducing the wave equation. |
| **A6** `traveling_wave_equation_y_equals_f_t_minus_x_over_v` | The general form of a wave traveling in +x direction at speed v: y(x,t) = f(t − x/v). The argument MUST be in the combination (t − x/v). | atomic | ✅ | — | A1, A5, `function_of_two_variables` (math-tools) | A8, A21, A23 | **Sources:** HCV1 §15.2 derivation Eq 15.1 (explicit); DCWT §17.3 (3 conditions for a wave function: PDE form, single-valued, continuous; general solution y = f(ax ± bt)); NCERT §15.3 (Eq 15.2 = sinusoidal special case). **v1?:** TRUE — foundational equation. **PRIMARY aha:** any function whose argument is the combination t−x/v is a wave. |
| ↳ N6.1 `argument_must_be_t_minus_or_plus_x_over_v` | y = f(x−vt) or y = f(t−x/v) for +x propagation; y = f(t+x/v) for −x propagation | nano | ✅ | — | A6 | A6, A8 | parent: A6. Sources: HCV1 §15.2 (Eq 15.1–15.4), DCWT §17.3 explicit. |
| ↳ N6.2 `wave_PDE_d2y_dt2_equals_v2_d2y_dx2` | Wave equation in PDE form (∂²y/∂t² = v² ∂²y/∂x²). Any solution f(x±vt) satisfies it. | nano | ✅ | — | A6, `partial_derivatives` (math-tools) | A6, A14 | parent: A6. Sources: DCWT §17.3 (Condition 1 explicit), HCV1 §15.4 (used implicitly). `granularity_question: candidate_micro` — single-equation insight. |
| ↳ N6.3 `arbitrary_function_f_works_as_long_as_argument_correct` | y = (t − x/v)², or y = A exp[-(t−x/v)/T], or y = sin... — all are wave equations. Shape is arbitrary; ARGUMENT is constrained. | nano | ✅ | — | A6, N6.1 | A6 | parent: A6. Sources: HCV1 §15.2 explicit example; DCWT §17.3. EPIC-C target: students think only sin/cos count as waves. |
| **A7** `wave_speed_relations_v_equals_omega_over_k_equals_lambda_over_T_equals_nu_lambda` | Three equivalent expressions for wave speed: v = ω/k = λ/T = νλ | atomic | ✅ | — | A6, A9, A11 | A14, A15 | **Sources:** HCV1 §15.3 (Eq 15.9 v = λ/T = νλ); NCERT §15.4 (Eq 15.12 explicit triple equality); DCWT §17.4 (v = ω/k, v = fλ). **v1?:** TRUE. The relationship students use constantly. |
| ↳ N7.1 `lambda_equals_v_T_distance_per_period` | Wavelength = distance the wave travels in one period | nano | ✅ | — | A7, A9, A11 | A7, A9 | parent: A7. Sources: HCV1 §15.3 explicit derivation. |
| **A8** `sinusoidal_wave_y_equals_a_sin_kx_minus_omega_t_plus_phi` | The canonical sinusoidal traveling wave: y(x,t) = A sin(kx − ωt + φ). A=amplitude, k=wave number, ω=angular freq, φ=phase constant. | atomic | ✅ | — | A6, A20 (phase), `SHM` [Topic-20] | A9, A11, A13, A14, A19, A21 | **Sources:** HCV1 §15.3 (Eq 15.6 y = A sin ω(t − x/v), also forms 15.10-15.15); NCERT §15.3 (Eq 15.2 standard form); DCWT §17.4 (y = A sin(ωt − kx + φ) with all alternate forms). **v1?:** TRUE — central equation. Special case of A6. |
| ↳ N8.1 `amplitude_A_max_displacement` | A = max value of y; particles oscillate between +A and −A | nano | ✅ | — | A8 | A8, A24, A25 | parent: A8. Sources: NCERT §15.3.1 explicit. |
| ↳ N8.2 `phase_kx_minus_omega_t_plus_phi` | The entire argument is "the phase"; determines y at any (x,t) | nano | ✅ | — | A8, A20 | A8, A19 | parent: A8. Sources: NCERT §15.3.1 explicit. |
| ↳ N8.3 `alternate_sine_wave_forms` | y = A sin(kx−ωt) ≡ A sin 2π(x/λ − t/T) ≡ A sin k(x−vt). All same wave. | nano | ✅ | — | A8, N7.1 | A8 | parent: A8. Sources: HCV1 §15.3 (Eq 15.10-15.12 explicit), DCWT §17.4 ("Extra Points to Remember" callout). |
| ↳ N8.4 `phase_constant_phi_initial_phase` | φ in y = A sin(kx − ωt + φ) is the **initial phase angle** — sets the wave's lateral shift / starting position at (x=0, t=0). Determined by initial conditions. φ = π/2 makes the wave start at max; φ = π reverses the sine; etc. | nano | ✅ | — | A8 | A8, A19 | parent: A8. Sources: NCERT §15.3.1 explicit ("φ is the phase at x=0 and t=0. Hence φ is called the initial phase angle"); HCV1 §15.3 (Eq 15.13-15.15 walk through different φ choices); DCWT §17.4. **Collapsed from former A20 atomic** per founder-style decision W-G1 (2026-05-25) — geometrically a lateral shift of the same wave, not a separate physical phenomenon. |
| **A9** `wavelength_lambda_min_distance_same_phase` | Wavelength = minimum spatial distance between two points oscillating in phase | atomic | ✅ | — | A8 | A7, A10 (nano) | **Sources:** HCV1 §15.3 (Eq 15.8 λ = vT derivation); NCERT §15.3.2 (Eq 15.6 λ = 2π/k); DCWT §17.4 (Fig 17.3 between two crests). **v1?:** TRUE. |
| ↳ N9.1 `wavelength_distance_between_crests_or_troughs` | Easiest measurement: λ = distance between consecutive crests (or troughs) | nano | ✅ | — | A9, A12 | A9 | parent: A9. Sources: HCV1 §15.3 explicit, NCERT §15.3.2, DCWT §17.4. |
| ↳ N9.2 `k_equals_2pi_over_lambda_wave_number` | Angular wave number k = 2π/λ; unit rad/m. "Number of waves in 2π length." | nano | ✅ | — | A9 | A7, A8, A14 | parent: A9. Sources: HCV1 §15.3, NCERT §15.3.2 (Eq 15.6), DCWT §17.4 Note. **UNCERTAIN — flagged for founder review:** is `wave_number` a separate atomic or a nano of `wavelength`? They are tightly coupled (one is 2π/the other). Collapsed here as nano per analogous Friction A16→N15.3 decision; founder spot-check welcome. |
| **A11** `angular_frequency_omega_period_relation` | ω = 2π/T = 2πν. T = period (seconds per cycle), ν = frequency (cycles per second, Hz) | atomic | ✅ | — | A8, `SHM_oscillation` [Topic-20] | A7, A13 | **Sources:** HCV1 §15.3 (ν = 1/T, ω = 2π/T); NCERT §15.3.3 (Eq 15.7 ωT = 2π, Eq 15.8 ν = ω/2π); DCWT §17.4 (ω = 2πf = 2π/T). **v1?:** TRUE. Inherited from SHM but central to wave equation. |
| ↳ N11.1 `period_T_time_for_one_full_oscillation` | T = time for any particle to complete one cycle | nano | ✅ | — | A11 | A7, A9 | parent: A11. Sources: NCERT §15.3.3, Fig 15.7. |
| ↳ N11.2 `frequency_nu_units_hertz` | ν = 1/T, unit Hz = oscillations per second | nano | ✅ | — | A11, N11.1 | A7 | parent: A11. Sources: HCV1 §15.3, NCERT §15.3.3. |
| **A12** `crest_and_trough` | Crest = point of max positive displacement (+A); trough = max negative (−A) | atomic | ✅ | — | A8 | A9, N9.1 | **Sources:** HCV1 §15.3, NCERT §15.3.1, DCWT §17.4 Fig 17.3. **v1?:** TRUE — basic terminology, but worth a standalone atomic because students confuse with amplitude. |
| **A13** `wave_velocity_vs_particle_velocity_distinction` | **Two different velocities exist at the same point.** Wave velocity v = ω/k (constant, depends on medium). Particle velocity v_P = ∂y/∂t = Aω cos(kx−ωt+φ) (varies sinusoidally with time, depends on position+time). | atomic | ✅ | — | A7, A8 | A21, A23 | **Sources:** HCV1 §15.3 explicit ("This velocity is totally different from the wave velocity v"); DCWT §17.5 (very explicit: vP = −v × slope of y-x graph); NCERT — implicit (Eq 15.11 dx/dt = ω/k for fixed phase point). **v1?:** TRUE. **CRITICAL misconception target:** students conflate the two velocities. EPIC-C: STATE_1 shows student saying "wave is moving at 5 m/s, so each particle moves at 5 m/s" → wrong. |
| ↳ N13.1 `wave_velocity_constant_in_medium` | v = ω/k is set by medium properties (string tension, mass density). Same value for all particles. | nano | ✅ | — | A13, A14 | A13, A15 | parent: A13. Sources: HCV1 §15.3, NCERT §15.4. |
| ↳ N13.2 `particle_velocity_changes_sinusoidally` | v_P = Aω cos(...) — changes sign every half-cycle, depends on time and position | nano | ✅ | — | A13, A8 | A13, A21 | parent: A13. Sources: HCV1 §15.3 Eq 15.7, DCWT §17.5. |
| ↳ N13.3 `particle_velocity_zero_at_extreme_positions` | At y = ±A, cos(phase) = 0 (since sin = ±1), so v_P = 0 | nano | ✅ | — | A13, N13.2 | A13 | parent: A13. Sources: DCWT §17.5 explicit, HCV1 §15.3. |
| ↳ N13.4 `particle_velocity_max_at_mean_position` | At y = 0, cos = ±1, so v_P = ±Aω = maximum particle speed | nano | ✅ | — | A13, N13.2 | A13 | parent: A13. Sources: DCWT §17.5, HCV1 (worked example 2). |
| ↳ N13.5 `v_P_equals_minus_v_wave_times_slope` | Elegant relation: v_P = −v × (∂y/∂x). Particle velocity = −(wave velocity) × (slope of y-x graph at that point) | nano | ✅ | — | A13, A23 | A13 | parent: A13. Sources: DCWT §17.5 explicit (Eq iv), JEE 2008 example. `granularity_question: candidate_micro`. |
| **A26** `transverse_waves_require_shear_modulus_solids_only` | Transverse waves can propagate only in media that can sustain shearing strain — solids only. Longitudinal waves propagate in solids, liquids, gases. | atomic | ✅ | — | A2, A3, A4 | A14 | **Sources:** NCERT §15.2 explicit; DCWT §17.2 "Extra Points to Remember" (earthquake P-waves longitudinal, S-waves transverse — S-waves don't pass through Earth's liquid outer core). **v1?:** TRUE. Strong EPIC-C: surprising fact that doesn't fit "all media support all waves" assumption. |
| ↳ N26.1 `S_waves_dont_pass_through_earth_liquid_core` | Seismology: P-waves (longitudinal) arrive first everywhere; S-waves (transverse) don't reach the antipode → proof Earth's outer core is liquid | nano | ✅ | — | A26 | A26 | parent: A26. Sources: DCWT §17.2 "Extra Points to Remember" explicit. Spectacular Indian-context anchor: 2001 Gujarat earthquake, 2015 Nepal earthquake — seismograph readings reflect this. |
| **A27** `wave_does_not_carry_matter_only_disturbance` | Restating A1 as a misconception-confronting atomic: when a sound wave goes from a speaker to your ear, NO air physically travels — only the disturbance pattern does | atomic | ✅ | — | A1, N1.2 | — | **Sources:** HCV1 §15.1 (explicit speaker example: "The air that is near the speaker at the time of uttering a word remains all the time near the speaker"); NCERT §15.1 ("The water mass does not flow outward with the circles, but rather a moving disturbance is created"); DCWT §17.1. **v1?:** TRUE — **CRITICAL EPIC-C atomic.** STATE_1: student says "I hear you, so air moved from your mouth to my ear" → wrong. Visualize: cork bobbing in place on water while ripple expands. |

### Tier 2 — Derived / problem-pattern atomics

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A14** `transverse_wave_speed_on_string_v_equals_sqrt_T_over_mu` | Speed of transverse wave on a stretched string: v = √(T/μ). T = tension, μ = linear mass density (mass/length). | atomic | ✅ | — | A3, A6, N6.2, N9.2, `newton_second_law_direction` ✅, `free_body_diagram` ✅ | A15, A23 | **Sources:** HCV1 §15.4 (full circular-arc derivation, Eq 15.16); NCERT §15.4.1 (dimensional-analysis derivation, Eq 15.14); DCWT §17.6 (full derivation including alternative v = √(T/ρA), Examples 17.10, 17.11). **v1?:** TRUE — central problem-pattern formula. |
| ↳ N14.1 `dimensional_analysis_T_per_mu_gives_velocity_squared` | [T] = MLT⁻², [μ] = ML⁻¹ → [T/μ] = L²T⁻². So v = C·√(T/μ); exact derivation shows C=1. | nano | ✅ | — | A14, `dimensional_analysis` (math-tools) | A14 | parent: A14. Sources: NCERT §15.4.1 explicit step-by-step. |
| ↳ N14.2 `circular_arc_derivation_string_segment` | Small string element forms arc of radius R, moves with speed v in moving frame; centripetal force T·Δl/R balances tension components; algebra gives v = √(T/μ) | nano | ✅ | — | A14, `centripetal_force` [Topic-13] | A14 | parent: A14. Sources: HCV1 §15.4 (with figure), DCWT §17.6 (with figure). |
| ↳ N14.3 `mu_definition_mass_per_unit_length` | μ = m/L. For a uniform string of total mass m and total length L. Units kg/m. | nano | ✅ | — | A14 | A14, A25 | parent: A14. Sources: HCV1, NCERT, DCWT all explicit. |
| ↳ N14.4 `tension_higher_wave_faster` | Pluck a tighter string → wave travels faster → higher pitch (sitar tuning) | nano | ✅ | — | A14 | A14 | parent: A14. Sources: HCV1 §15.4. Indian-context anchor: sitar/veena tuning. |
| ↳ N14.5 `heavier_string_slower_wave` | Thicker (heavier per length) string → slower wave → lower pitch | nano | ✅ | — | A14 | A14 | parent: A14. Sources: HCV1 §15.4, DCWT §17.6. |
| **A15** `wave_speed_depends_on_medium_not_source` | The medium determines wave speed. Frequency is set by the source; wavelength adapts via λ = v/ν. | atomic | ✅ | — | A7, A14 | — | **Sources:** NCERT §15.4 explicit ("does not depend on wavelength or frequency of the wave itself"); DCWT §17.6 explicit ("Waves of all frequencies travel in a given medium with same speed"); HCV1 implicit. **v1?:** TRUE. **CRITICAL EPIC-C atomic.** Misconception: "vibrating the string faster makes the wave go faster" → wrong (only changes frequency, wavelength shrinks; v unchanged). |
| ↳ N15.1 `frequency_set_by_source_wavelength_adapts` | Tune fork at higher ν → string vibrates faster → λ becomes shorter, but v = ν·λ stays constant | nano | ✅ | — | A15, A7 | A15 | parent: A15. Sources: DCWT §17.6 explicit. |
| ↳ N15.2 `wave_at_string_junction_changes_v_and_lambda` | When wave crosses from light string to heavy string, v decreases, ν unchanged, λ decreases | nano | ✅ | — | A15, A14 | — | parent: A15. Sources: HCV1 §15.8 (Topic-22 boundary — cross-topic). Touch-mention here. |
| **A16** `longitudinal_wave_speed_in_fluid_v_equals_sqrt_B_over_rho` | Speed of longitudinal wave in a fluid: v = √(B/ρ). B = bulk modulus, ρ = density. | atomic | ✅ | — | A4, `bulk_modulus` [Topic-18 Elasticity] | A18 | **Sources:** NCERT §15.4.2 (Eq 15.19 with derivation via dimensional analysis); DCWT §17.6 explicit; HCV1 in Ch.16 (out of §15.1-15.5 scope). **v1?:** FALSE — V2. Belongs jointly with Topic-23 Sound Waves; held here as a wave-speed atomic with cross-topic edge to Sound. |
| **A17** `longitudinal_wave_speed_in_solid_rod_v_equals_sqrt_Y_over_rho` | Speed of longitudinal wave in a long solid rod: v = √(Y/ρ). Y = Young's modulus. | atomic | ✅ | — | A4, `youngs_modulus` [Topic-18 Elasticity] | A18 | **Sources:** NCERT §15.4.2 (Eq 15.20, Table 15.1 with speeds — steel 5941 m/s, aluminum 6420 m/s); DCWT §17.6 (Eq v = √(Y/ρ)). **v1?:** FALSE — V2. |
| **A18** `newton_laplace_speed_of_sound_correction` | Newton's formula v = √(P/ρ) ≈ 280 m/s underestimates by ~15%. Laplace correction: process is adiabatic, not isothermal → B_adiabatic = γP → v = √(γP/ρ) = 331 m/s (matches measurement). | atomic | ✅ | — | A16, `adiabatic_process` [Topic-25 Thermodynamics] | — | **Sources:** NCERT §15.4.2 explicit (Eqs 15.22–15.24 with full Newton-Laplace narrative); DCWT §17.6 explicit. **v1?:** FALSE — V2. Historically important + JEE PYQ-frequent but conceptually advanced. |
| **A19** `principle_of_superposition_two_waves_pass_through_each_other` | When two or more waves traverse the same medium simultaneously, the displacement of any element is the algebraic sum of displacements due to each wave. The waves pass through unmodified after overlap. | atomic | ✅ | — | A6, A8 | — | **Sources:** NCERT §15.5 (FULL treatment, Eq 15.25–15.34, two-pulse figure, phase-difference analysis); HCV1 §15.6 (briefer); DCWT folds into Ch.18 (Topic-22 superposition chapter). **v1?:** TRUE — included per Stage-1 catalog placing NCERT §15.5 in Topic 21. **Caveat:** the deep treatment (standing waves, interference patterns, beats) is Topic 22. This atomic stays at the *principle level* (two pulses → algebraic sum, then waves continue independently). |
| ↳ N19.1 `displacements_add_algebraically_pointwise` | At each (x,t), y_total = y_1 + y_2 + ... + y_n | nano | ✅ | — | A19 | A19 | parent: A19. Sources: NCERT §15.5 (Eq 15.25), HCV1 §15.6, DCWT (forward ref). |
| ↳ N19.2 `linear_waves_only_obey_superposition` | Superposition holds for small-amplitude (linear) waves. Non-linear waves (huge amplitude) don't simply add. | nano | ✅ | — | A19 | A19 | parent: A19. Sources: HCV1 §15.6 explicit ("we shall only be talking about linear waves which obey the superposition principle"). |
| ↳ N19.3 `two_pulses_pass_through_each_other_then_continue` | Two opposite-shape pulses momentarily cancel at overlap (y_total = 0 across string), then continue unchanged | nano | ✅ | — | A19, N19.1 | A19 | parent: A19. Sources: HCV1 §15.6, NCERT Fig 15.9 (both show this dramatically). Strong simulation visual. |
| **A21** `particle_velocity_from_partial_derivative` | v_P(x,t) = ∂y/∂t = Aω cos(kx − ωt + φ) | atomic | ✅ | — | A8, A13, `partial_derivative` (math-tools) | A22 | **Sources:** HCV1 §15.3 (Eq 15.7 explicit with notation note); DCWT §17.5 (full derivation); NCERT — implicit. **v1?:** TRUE. Bridges wave equation to SHM behavior of particles. |
| ↳ N21.1 `partial_derivative_t_treats_x_constant` | ∂/∂t means hold x fixed (look at one particle); d/dt would mean follow a moving point | nano | ✅ | — | A21, `partial_derivative` | A21 | parent: A21. Sources: HCV1 §15.3 explicit ("while differentiating with respect to t, we should treat x as constant"). Math-tools subtlety students get wrong. |
| **A22** `particle_acceleration_in_sinusoidal_wave_a_p_equals_minus_omega_squared_y` | a_P = ∂²y/∂t² = −ω² · y(x,t). Same form as SHM — each particle executes SHM. | atomic | ✅ | — | A21 | — | **Sources:** DCWT §17.5 explicit (Eq v: aP = −ω²·displacement); HCV1 worked examples (Ch.15 WOE 2 explicit); NCERT — implicit. **v1?:** FALSE — V2 (extension of A21). |
| **A23** `two_graphs_y_vs_x_at_fixed_t_AND_y_vs_t_at_fixed_x` | Two visualizations of the same wave: (i) y-vs-x at fixed time (snapshot — shows wavelength λ); (ii) y-vs-t at fixed position (single particle's SHM — shows period T). Same equation, different "slice". | atomic | ✅ | — | A8, A13 | — | **Sources:** DCWT §17.5 (DEDICATED full subsection with both graphs explicitly contrasted, JEE PYQ-frequent format); NCERT Figs 15.6 + 15.7 (separated but discussed); HCV1 Fig 15.4 (only spatial snapshot). **v1?:** TRUE — strong pedagogical asset, unique to DCWT format. **PRIMARY aha:** wave = a function of two variables, and you can graph either dimension. |
| ↳ N23.1 `y_x_graph_slope_is_partial_dy_dx` | On the y-x snapshot, slope = ∂y/∂x at that point (not dy/dx since y is a 2-variable function) | nano | ✅ | — | A23, N21.1 | A23, N13.5 | parent: A23. Sources: DCWT §17.5 explicit. |
| ↳ N23.2 `y_t_graph_slope_is_particle_velocity` | On the y-t graph at fixed x, slope = ∂y/∂t = particle velocity | nano | ✅ | — | A23, A21 | A23 | parent: A23. Sources: DCWT §17.5. |
| ↳ N23.3 `phase_difference_from_path_difference_phi_equals_2pi_over_lambda_times_delta_x` | Two particles at distance Δx on the same y-x graph have phase difference φ = (2π/λ)·Δx | nano | ✅ | — | A23, A9 | A23 | parent: A23. Sources: DCWT §17.5 explicit. |
| ↳ N23.4 `phase_difference_from_time_interval_phi_equals_2pi_over_T_times_delta_t` | Same particle at two times Δt has phase difference φ = (2π/T)·Δt | nano | ✅ | — | A23, A11 | A23 | parent: A23. Sources: DCWT §17.5 explicit. |
| **A24** `energy_density_in_wave_u_equals_half_rho_omega_squared_A_squared` | Energy per unit volume in a sinusoidal wave: u = ½ρω²A². Comes from SHM energy ½kx² applied to each particle. | atomic | ✅ | — | A8, `SHM_energy` [Topic-20] | A25 | **Sources:** DCWT §17.7 explicit derivation; HCV1 §15.5 (related power formula). **v1?:** FALSE — V2 (energy is advanced topic; not in NCERT §15.1-15.5). |
| **A25** `power_transmitted_in_wave_P_equals_half_rho_omega_squared_A_squared_S_v` | Average power = ½ρω²A²·S·v (S = cross-sectional area). Alternative form on string: P_av = 2π²μvA²ν². | atomic | ✅ | — | A24, A14 | — | **Sources:** HCV1 §15.5 (full derivation, Eq 15.17); DCWT §17.7 (P = uSv). **v1?:** FALSE — V2. |

### Cross-topic-refs (concepts defined elsewhere; cited here as dependency edges)

| ID | Concept | Type | Owned by | Why cited |
|---|---|---|---|---|
| **CT1** `simple_harmonic_motion_x_equals_A_sin_omega_t` | SHM equation x = A sin(ωt + φ) | cross-topic-ref | **Topic-20 SHM** (N11.2 Ch.14, DCM2 Ch.13, HCV1 Ch.12) | A8 sinusoidal wave depends on SHM; particles in a wave execute SHM. |
| **CT2** `bulk_modulus_B` | Bulk modulus B = −V(dP/dV) | cross-topic-ref | **Topic-18 Elasticity** | A16 requires B definition |
| **CT3** `youngs_modulus_Y` | Young's modulus Y for solids | cross-topic-ref | **Topic-18 Elasticity** | A17 requires Y |
| **CT4** `centripetal_force_F_equals_m_v2_over_R` | Centripetal force for circular motion | cross-topic-ref | **Topic-13 Circular Motion** | N14.2 circular-arc derivation of v = √(T/μ) uses this |
| **CT5** `partial_derivative` | ∂/∂x and ∂/∂t for functions of two variables | cross-topic-ref | **Math Tools** (not in scope of triple-covered topics) | A6, A21, A23 all use partial derivatives |
| **CT6** `wave_reflection_and_standing_waves` | Reflection at boundaries + standing wave formation | cross-topic-ref | **Topic-22 Superposition + Standing Waves** (N11.2 §15.6, DCWT Ch.18, HCV1 §15.6-15.13) | A19 brushes against this; full coverage at Topic-22 |
| **CT7** `sound_waves_doppler_beats` | Doppler effect, beats, audible-range frequencies | cross-topic-ref | **Topic-23 Sound Waves** (N11.2 §15.7-15.8, DCWT Ch.19, HCV1 Ch.16) | A16, A17, A18 wave-speed-in-fluids/solids overlap with sound |
| **CT8** `polarization_of_waves` | Polarization phenomenon | cross-topic-ref | **Topic-44 Wave Optics** (N12.2 Ch.10, DCOM Ch.32, HCV1 Ch.17) | HCV1 §15.15 polarization is out of §15.1-15.5 scope; cross-listed here |

---

## Section E — Cross-source coverage matrix

| Atomic ID | NCERT 11.2 §15.1-15.5 | DCWT Ch.17 | HCV1 Ch.15 §15.1-15.5 |
|---|---|---|---|
| A1 energy-not-matter | **§15.1 explicit** | §17.1 brief | **§15.1 explicit (queue analogy)** |
| A2 mechanical-vs-nonmech | **§15.1 trichotomy** | **§17.2 explicit** | §15.1 brief |
| A3 transverse | **§15.2 explicit** | §17.4 explicit | §15.14 cross-ref |
| A4 longitudinal | **§15.2 piston explicit** | **§17.4 explicit** | §15.14 cross-ref |
| A5 pulse-vs-train | §15.2 Figs | §17.3 brief | **§15.2 explicit** |
| A6 traveling-wave-eq y=f(t-x/v) | §15.3 (Eq 15.2 sinusoidal) | **§17.3 FULL (3 conditions)** | **§15.2 FULL derivation** |
| A7 v=ω/k=νλ | **§15.4 Eq 15.12** | §17.4 | §15.3 Eq 15.9 |
| A8 sinusoidal | **§15.3 Eq 15.2** | **§17.4 all forms** | §15.3 Eq 15.6+ alternates |
| A9 wavelength | **§15.3.2** | §17.4 | §15.3 Eq 15.8 |
| A11 angular-freq | **§15.3.3** | §17.4 | §15.3 |
| A12 crest-trough | §15.3.1 implicit | **§17.4 Fig 17.3** | §15.3 implicit |
| A13 wave-vel-vs-particle-vel | implicit | **§17.5 FULL** | **§15.3 explicit** |
| A14 v=√(T/μ) | **§15.4.1 dim-analysis** | **§17.6 + Ex 17.10, 17.11** | **§15.4 circular-arc derivation** |
| A15 medium-not-source | **§15.4 explicit** | **§17.6 explicit** | implicit |
| A16 v=√(B/ρ) fluid | **§15.4.2 derivation** | §17.6 | Ch.16 forward ref |
| A17 v=√(Y/ρ) solid | **§15.4.2 Table 15.1** | §17.6 | Ch.16 forward ref |
| A18 Newton-Laplace | **§15.4.2 historical narrative** | **§17.6 explicit** | Ch.16 forward ref |
| A19 superposition principle | **§15.5 FULL phase-diff** | Ch.18 forward ref | §15.6 (borderline) |
| A21 v_P = ∂y/∂t | implicit | **§17.5 explicit** | **§15.3 Eq 15.7** |
| A22 a_P = -ω²y | implicit | **§17.5 explicit** | WOE 2 |
| A23 y-x vs y-t two graphs | Figs 15.6+15.7 separated | **§17.5 FULL dedicated subsection** | Fig 15.4 spatial only |
| A24 energy density | absent in §15.1-15.5 | **§17.7 explicit** | §15.5 power-related |
| A25 power transmitted | absent | **§17.7 explicit** | **§15.5 explicit Eq 15.17** |
| A26 transverse-needs-shear | **§15.2 explicit** | **§17.2 P/S-waves** | §15.14 |
| A27 wave-doesnt-carry-matter | **§15.1 explicit cork-piece** | §17.1 brief | **§15.1 explicit speaker example** |

**Observations:**
- **DCWT owns the math-pedagogy depth.** §17.5 "Two Graphs in Sine Wave" (A23) and the wave-velocity-vs-particle-velocity treatment (A13, A21, A22) are uniquely strong in DCWT. NCERT and HCV1 cover the content but DCWT's explicit visual contrast is unmatched.
- **NCERT owns the canonical derivations.** Dimensional analysis for v=√(T/μ) (A14), Newton-Laplace correction (A18), and superposition principle with phase difference (A19) are NCERT-primary.
- **HCV1 owns the conceptual narrative.** The queue-pushing analogy (A1), speaker-air example (A27), and circular-arc derivation of v=√(T/μ) (N14.2) are HCV1's pedagogical contributions.
- **Pedagogical implication for V1:** A teaching that synthesizes HCV1's narrative + NCERT's clean derivations + DCWT's two-graph visualization is stronger than any single source. EPIC-L states should mix all three.
- **Compared to Friction:** Wave Motion has FEWER problem-pattern atomics (just A14 v=√(T/μ) really; sound-speed variants A16/17/18 are V2). More definitional/conceptual atomics. Different shape, same authoring framework.

---

## Section F — V1 authoring queue

**Deferred to Stage 5** outcome-priority map per founder decision 2026-05-25 (Q-F4). Same as Friction.

**Inputs available for Stage 5 from this catalog:** 19 atomics flagged `v1?: TRUE` (A1, A2, A3, A4, A5, A6, A7, A8, A9, A11, A12, A13, A14, A15, A19, A21, A23, A26, A27) + 6 flagged `v1?: FALSE` (A16, A17, A18, A22, A24, A25) + 8 cross-topic-refs (CT1–CT8). Total atomics: **25** (A20 collapsed into N8.4 nano per W-G1 decision). Total nanos: **33** (+1 from A20 collapse).

---

## Section G — Open questions (founder-resolved + still-open)

1. ✅ **A20 phase-constant — atomic or nano of A8?** RESOLVED 2026-05-25 (W-G1, founder-style): collapsed into A8 as N8.4 nano.
2. ✅ **A10 wave-number — atomic or nano of A9?** RESOLVED 2026-05-25 (W-G2): confirmed as nano N9.2.
3. ✅ **A16, A17, A18 — Topic 21 or Topic 23?** RESOLVED 2026-05-25 (W-G3): KEEP in Topic 21 (NCERT + DCWT both place in Wave Motion chapter, 2-of-3 vote). Each atomic lives in exactly ONE catalog. Topic 23 Sound Waves will cross-topic-ref when authored. v1?=FALSE retained.
4. ✅ **Math-tools reference file** RESOLVED 2026-05-25 (W-G4): defer to Stage 3 (divergent chapters). Stage 3 produces `stage-3-tier-0-math-tools.md` as prerequisite-graph terminator (not authoring scope — math tools excluded from 44 triple-covered). In Stage 2 catalogs, `[math-tools: <concept>]` notation locks the convention.
5. ⏳ **`granularity_question: candidate_micro` review threshold.** Continue tagging through all 44 Stage-2 topics; Stage 4 reviews en bloc. Per W-G5: threshold not set until distribution data is in. Current pattern: 2-6 per topic.
6. ✅ **Scaling — accept 2,770 projection.** RESOLVED 2026-05-25 (W-G6): ACCEPT, do not tighten. Founder framing: "data and patterns help a lot — don't compromise quality." V1 authoring queue is ~1,000 atomics (37%), tractable over 2-3 years.

**Net open at end of Topic-21 pilot:** 1 (Stage-4 candidate_micro threshold, intentionally deferred).

---

## Section H — What's NOT in this pilot (scope boundary)

- **Topic 22 — Superposition + Standing Waves** (NCERT §15.6, DCWT Ch.18, HCV1 §15.6-15.13). Atomics: reflection of waves, standing waves on string fixed at both/one end, normal modes, fundamental + harmonics, sonometer, laws of transverse vibration. Cross-topic-ref CT6 here.
- **Topic 23 — Sound Waves + Doppler** (NCERT §15.7-15.8, DCWT Ch.19, HCV1 Ch.16). Atomics: longitudinal wave equation in air, pressure vs displacement wave, intensity, beats, Doppler effect, audible range. Cross-topic-ref CT7 here.
- **Topic 44 — Wave Optics Polarization** (HCV1 §15.15 + Class 12 Wave Optics chapter). Polarization atomic. Cross-topic-ref CT8 here.
- **Topic 20 — SHM** (NCERT §14, DCM2, HCV1 §12). SHM equation, period, ω. Cross-topic-ref CT1 here.
- PYQ frequency tags (Stage 5)
- JEE/NEET/board-exam weights (Stage 5)
- `student_confusion_log` cross-references for misconceptions (Stage 6)
- Worked-example-by-example mapping (deferred per Friction precedent)

---

## Section I — Stage-2 scaling notes (cumulative across pilots 1 + 2)

Patterns confirmed or refined after 2 of 3 pilots:

1. **HCV1 = depth, DCM/DCWT = breadth + unique pedagogies, NCERT = canonical baseline.** Confirmed for Wave Motion. But Wave Motion adds: **DCWT has unique math-pedagogy assets** (the two-graph treatment) that no other source matches. Pattern: each source contributes some unique angles. Synthesis is required.
2. **Atomic count per topic:** Friction 28, Waves 26. Range 25-30 likely holds for "medium" topics. Smaller topics (Topic 1 Physical World) may go <10; larger (Topic 31 EM Induction) may go 35+.
3. **Nano-to-atomic ratio ≈ 1.0-1.2.** Friction 1.04 (30/29), Waves 1.23 (32/26). Holds.
4. **V1 priority typically 35-50% of atomics.** Friction 14/28 = 50%, Waves 19/26 = 73%. Waves is higher because more atomics are definitional (every term — wavelength, frequency, period — is a V1 must-have). Topics with more problem-pattern variety will trend lower.
5. **Cross-topic-refs per topic:** Friction 1 (A27 circular-friction). Waves 8 (CT1-CT8). Wave Motion is much more cross-topic-dense because it sits at the intersection of SHM, Sound, Wave Optics, Elasticity. Pattern: **physics interconnects more than mechanics-of-particles.** Stage 5 priority queue will need a graph algorithm to handle cross-topic prereq dependencies.
6. **UNCERTAIN flags:** Friction 2, Waves 2. Stable at ~2/topic. Good.
7. **`candidate_micro` flags:** Friction 6, Waves 2. Lower for Waves because fewer derivation-step nanos (waves teaching is more about equations than step-by-step problem patterns). Pattern not yet clear.
8. **Source-coverage matrix (Section E) reproduction:** Worked for Friction; works for Waves. Keep in every topic.
9. **Empty Section B (no existing repo):** Waves has zero existing JSONs. Friction had one (with refactor backlog). Pattern: most of the 44 topics will have 0-2 existing JSONs since the 63 shipped atomics are concentrated in Vectors + Kinematics + Forces + Magnetism.

---

## Section J — Verification checklist

- [x] All 3 sources cited with chapter + section + page range (Section A)
- [x] Existing repo concepts (or absence) declared (Section B)
- [x] Methodology choices noted with Wave-Motion-specific addendum (Section C)
- [x] All atomic concepts identified across 3 sources, with cross-source citations (Section D Tier 1 + Tier 2)
- [x] All nano concepts identified with `parent: <atomic_id>` tags (Section D)
- [x] Cross-topic-refs separated into their own table (Section D bottom)
- [x] `Requires` and `Required-by` columns populated (Section D — full dependency graph)
- [x] `v1?` flag populated for every atomic (Section D Notes)
- [x] `Sim?` rating ✅/⚠/❌ populated for every row (Section D)
- [x] Cross-source coverage matrix (Section E)
- [x] Section F V1 queue properly deferred to Stage 5 with `v1?` flag count
- [x] Open questions surfaced explicitly (Section G)
- [x] Scope boundaries declared with cross-topic-refs to Topics 20, 22, 23, 44 (Section H)
- [x] Scaling implications updated cumulatively across pilots (Section I)
- [x] 2 `UNCERTAIN — flagged for founder review` items (A20 phase-constant, A10/N9.2 wave-number boundary)
- [x] 2 `granularity_question: candidate_micro` flags (N6.2, N13.5)
- [x] No new memory rules needed (all conventions already saved during Friction pilot)

---

*Generated: 2026-05-25. Pilot Topic 21 Wave Motion. Second pilot — validates that the Friction format applies cleanly to a topic with zero existing repo JSONs, more abstract math content, and dense cross-topic dependencies. Format held; same template applies to Topic 36 Moving Charges & Magnetism (next, sequential).*
