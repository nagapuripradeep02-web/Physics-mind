# Architect skeleton — `torque_on_current_loop_in_field`

Diamond #3 of magnetism proof-of-concept. Archetype **C** (closed-loop rotational dynamics). Phase **M2** per `docs/MAGNETISM_ARCHITECTURE.md` §10. Renderer: **field_3d** (Three.js). Authored 2026-05-20.

DC Pandey check: Vol 2 Ch.26 §26.6 table-of-contents reference only. No teaching sequence, no figure number, no example phrasing copied. All pedagogy authored from first principles.

Engine bug queue check: queried `engine_bug_queue WHERE status='FIXED' AND (owner_cluster='alex:architect' OR cardinality(concepts_affected)>=5)` — Supabase MCP still timing out (carried over from sessions 5–6). Architect-class prevention_rules carried in memory: (a) Rule 16 EPIC-C STATE_1 visualizes wrong belief in primitives, (b) Rule 19 ≥3 primitives/state in scene_composition, (c) Rule 15 ≥2 distinct advance_mode values across EPIC-L. All satisfied below.

---

## 1. Atomic claim

A current loop in a uniform magnetic field experiences zero net force but a non-zero torque τ = NIA × B = μ × B that rotates the loop until its magnetic moment μ aligns with B.

One student question: "If the loop is just sitting in a magnetic field, why does it start spinning?"

---

## 2. EPIC-L state count + arc (7 states, complexity-driven per CLAUDE.md §7)

Justification: medium-to-complex. Three new physical quantities (force pair, torque vector, μ vector), one new motion regime (rotation about a torque axis), one conceptual unification (loop ↔ bar magnet). §7 table says complex = 7–9 states; 7 is the floor for "build COMPLETE understanding."

| # | state_id | teaching_method | Pedagogical intent | Key visual primitive |
|---|---|---|---|---|
| 1 | STATE_1 | narrative_socratic | **Hook + setup** — galvanometer needle hint, then zoom to a rectangular loop sitting at θ=90° in uniform B. No motion yet. | rectangular current_loop primitive at rest + ambient_field grid (reuse Diamond #2) |
| 2 | STATE_2 | narrative_socratic + Socratic-reveal | **Force on one side** — predict: "On side AB (current I going up), which way is F?" pause 3s, reveal F = IL × B arrow. | per-side current arrow + force arrow F₁ (RHR via μ-blob from Diamond #2's `buildLorentzForceField`) |
| 3 | STATE_3 | narrative_socratic + Socratic-reveal | **Force on opposite side** — predict: "What about side CD (current going down)?" pause 3s, reveal F₂ = −F₁ (anti-parallel). Net force = 0 made explicit with ΣF arrow shrinking to zero. | force_pair_animation (F₁ and F₂ co-rendered) + net-force-zero label |
| 4 | STATE_4 | narrative_socratic | **Torque emerges** — same forces, different lines of application → couple. Show the rotation tendency with a circular dashed arrow about the central axis. | torque_arrow (τ vector along rotation axis) + couple_indicator |
| 5 | STATE_5 | exploration_sliders | **μ = NIA reveal** — the dipole-moment arrow appears through the loop face (RHR derived from current direction). Slider lets student vary N, I, dimensions; μ length scales live. | mu_vector_arrow through loop face + sliders panel |
| 6 | STATE_6 | exploration_sliders + Socratic-reveal | **τ = μ × B magnitude** — θ slider varies angle between μ and B. Predict at each θ: "Where is τ maximum?" reveal τ = μB sinθ; show τ-arrow scaling. Equilibrium at θ=0 (μ ∥ B). | mu_vector + B_field_arrow + τ_arrow with magnitude bar + θ_slider |
| 7 | STATE_7 | exploration_sliders | **Loop ↔ bar magnet unification** — replace loop with bar magnet (same μ direction); same τ; oscillation animation if released from off-equilibrium. Interactive: drag-release to swing. | bar_magnet primitive + same μ vector + oscillation animation |

advance_mode mix (Rule 15): `auto_after_tts` (1,2,3,4), `manual_click` (5), `wait_for_answer` (6), `interaction_complete` (7). Four distinct values ≥ Rule 15 minimum of 2.

`scene_composition.primitives.length ≥ 3` everywhere (Rule 19): each state has loop/bar + ambient_field + ≥1 vector arrow = 3 minimum, most carry 4–5.

---

## 3. Four EPIC-C misconception branches (Rule 16 — STATE_1 visualizes wrong belief in primitives, not just teacher_script)

### Branch A — `magnetic_force_does_work_on_loop`
- STATE_1 (misconception_confrontation): loop spinning + a misleading KE-rising bar gauge with "ω increasing" — wrong-belief annotation in red: "Myth: torque does work on the loop, so KE rises." Visualized in primitives (gauge), not just script.
- STATE_2–4: per-side force decomposition → F · v_side computed → time-averaged work = 0 → only spring/external torque restoring force does work.
- Returns to EPIC-L STATE_5 via entry_state_map.

### Branch B — `net_force_nonzero_on_rotating_loop`
- STATE_1 (misconception_confrontation): loop with both forces drawn parallel-same-direction (wrong) and a big ΣF arrow → "Wrong belief: rotating loop must have a net force pushing it sideways."
- STATE_2–4: re-derive force pair signs; explicit anti-parallel rendering; ΣF visibly cancels to zero each frame.
- Returns to EPIC-L STATE_4.

### Branch C — `torque_max_when_mu_parallel_to_B`
- STATE_1 (misconception_confrontation): loop drawn with μ ∥ B and a giant τ-arrow label "τ MAX" → "Wrong belief: torque is maximum when μ ∥ B (alignment = max force)."
- STATE_2–4: τ = μB sinθ; θ=0 gives sinθ=0; show τ-arrow shrink to point at alignment; restoration of correct intuition via slider sweep.
- Returns to EPIC-L STATE_6.

### Branch D — `rhr_for_mu_same_as_rhr_for_current`
- STATE_1 (misconception_confrontation): a hand wrapped around a wire (Diamond #1 RHR) being mis-applied to the loop — μ arrow drawn tangent to the loop edge (wrong) instead of perpendicular through the face.
- STATE_2–4: correct RHR for μ — fingers curl with current direction around the loop, thumb gives μ through the loop's face. Visual contrast: tangent (wrong) vs normal-to-face (right).
- Returns to EPIC-L STATE_5.

---

## 4. has_prebuilt_deep_dive picks (cache-warming hint, NOT UI gate)

Per CLAUDE.md Rule 18 + memory `no-runtime-deep-dive`: every state shows the Explain button, but until analytics flag a state, the button routes to a one-sentence feedback form (`feedback_unified` write). No deep-dive sub-states authored here. Flag the candidates for future hand-authoring:

- **STATE_3** `has_prebuilt_deep_dive: false` (candidate) — net-force-zero from two anti-parallel forces is non-obvious. Cluster candidates: `why_no_net_force`, `forces_look_unequal`, `where_does_translation_go`.
- **STATE_4** `has_prebuilt_deep_dive: false` (candidate) — couple → torque is the hardest conceptual jump. Cluster candidates: `where_does_torque_come_from`, `what_is_couple`, `why_rotation_not_translation`.
- **STATE_6** `has_prebuilt_deep_dive: false` (candidate) — τ = μB sinθ angular dependence is the most-failed JEE step. Cluster candidates: `tau_max_at_what_angle`, `why_sin_not_cos`, `stable_vs_unstable_equilibrium`.

All three remain `false` for V1 ship (Rule 18 — runtime button → feedback form).

---

## 5. Drill-down clusters (2–3 seed phrases per hard state)

Registered in `confusion_cluster_registry` table:

```
state: STATE_3
  cluster_id: why_no_net_force
    triggers: ["why is there no net force", "shouldn't the loop move", "where does the translation go"]
  cluster_id: forces_look_unequal
    triggers: ["forces look different", "why are F1 and F2 equal", "isn't one side stronger"]

state: STATE_4
  cluster_id: where_does_torque_come_from
    triggers: ["where does torque come from", "what is a couple", "why does it rotate not translate"]
  cluster_id: which_axis_does_it_rotate
    triggers: ["which axis", "why this axis and not that", "where is the rotation axis"]

state: STATE_6
  cluster_id: tau_max_at_what_angle
    triggers: ["when is torque max", "why is torque zero at zero", "shouldn't aligned be max"]
  cluster_id: stable_vs_unstable_equilibrium
    triggers: ["which equilibrium is stable", "what if mu is anti-parallel to B", "why does it come back"]
```

Authored states stay shallow (MICRO 2-state protocol) — Haiku classifier handles edge cases at runtime.

---

## 6. entry_state_map (v2.2)

```
entry_state_map:
  foundational: ["STATE_1", "STATE_2", "STATE_3", "STATE_4"]
  dipole_moment: ["STATE_5"]
  oscillation:   ["STATE_7"]
```

Default = `foundational`. The two cross-slice pills (`dipole_moment`, `oscillation`) invite deeper exploration for students who already know force-pair → torque.

Branch returns:
- A (work) → STATE_5
- B (net force) → STATE_4
- C (τ max angle) → STATE_6
- D (RHR for μ) → STATE_5

---

## 7. Prerequisites (advisory per Rule 23)

```json
"prerequisites": [
  "magnetic_force_moving_charge",
  "force_on_current_in_field"
]
```

`magnetic_force_moving_charge` is shipped (Diamond #2). `force_on_current_in_field` is NOT yet shipped — it's row 26.4 in the atomic catalog, scheduled post-M4. We list it advisory anyway: a student arriving without it will see "Builds on force on a current-carrying wire — 5 min intro?" and can choose to skip. Rule 23 says soft suggestion, never hard block.

---

## 8. Indian real-world anchor (plain English, NO Hinglish, NOT DC Pandey/HC Verma)

**Primary:** Picture the analog galvanometer in your school physics lab — the brass-framed instrument with a thin needle that flicks across a paper scale when current flows. Inside that brass case is a tiny rectangular coil suspended in the field of two permanent magnets. When you connect a battery, current flows through the coil and the same τ = μ × B torque you'll see in a moment swings the needle. The bigger the current, the bigger the torque, the further the needle deflects against the restoring spring. Every micrometer reading on that scale is a torque measurement.

**Secondary:** Picture a ceiling fan motor in a Bengaluru summer apartment. Inside the white plastic housing is a rotor wound with current-carrying coils sitting in the field of the stator's permanent magnets. Each half-rotation, the commutator flips the current direction so the torque on the rotor stays in the same rotational sense. That continuous τ = μ × B torque, flipped at the right moment, is what keeps the blades spinning at 350 RPM all afternoon.

**Tertiary:** Picture a moving-coil microphone on stage at an IIT-Bombay Mood Indigo concert. The singer's voice vibrates a thin diaphragm, which vibrates a tiny coil sitting in a permanent-magnet field. Each oscillation of the coil is a τ = μ × B torque cycle. The induced EMF (next chapter) reads out the audio signal. The microphone is just a galvanometer running backwards.

All three anchors: Indian context, plain English, physics-true. No "zameen", no figure references, no DC Pandey example phrasings.

---

## 9. Rule 20 conformance note

Diamond #3 ships **conceptual-only** under the magnetism M1-M6 exception (canonically synced in `quality_auditor/CLAUDE.md` line 58, dispatch `quality-auditor.md` Gate 3 line 55, commit 2e07fef on 2026-05-20).

- `mode_overrides.board` — drafted by physics-author for archive, NOT shipped. Retrofit phase M7.
- `mode_overrides.competitive` — NOT drafted. Retrofit phase M8.

Quality-auditor Gate 3 must NOT FAIL Diamond #3 on missing mode_overrides. Concept is in the exception scope list: `magnetic_field_wire, magnetic_force_moving_charge, torque_on_current_loop_in_field, magnetic_field_solenoid`.

---

## Self-review (architect checklist)

- [x] Atomic claim ONE sentence
- [x] State count (7) matches §7 complex range and concept complexity
- [x] 4 EPIC-C branches, real misconceptions (A/B/C from documented FCI-style errors; D from RHR-confusion sessions in `student_confusion_log`)
- [x] Each EPIC-C STATE_1 visualizes wrong belief in PRIMITIVES (gauge, wrong-direction force pair, wrong-direction τ arrow, mis-applied hand)
- [x] 3 has_prebuilt_deep_dive candidates flagged (STATE_3/4/6), all kept `false` per Rule 18
- [x] Every EPIC-L state has teaching_method (v2.2)
- [x] Socratic-reveal annotated on STATES 2/3/6 (each introduces a new quantity)
- [x] entry_state_map declared with `foundational` minimum
- [x] Prerequisites cite shipped concept (magnetic_force_moving_charge) + advisory unshipped (force_on_current_in_field)
- [x] Real-world anchor Indian, plain English, physics-true
- [x] DC Pandey check line (top)
- [x] Engine bug queue line (top) — MCP timeout noted, prevention_rules carried in memory and satisfied
- [x] Rule 20 conformance note (§9)

---

## Handoff to physics-author

Next phase consumes this skeleton and produces:
- physics_engine_config variables: I, N, A_or_dimensions (length × breadth), B, theta_deg
- computed_outputs: mu = N × I × A; tau = mu × B × sin(theta_deg × PI / 180); F_per_side = I × L × B
- formulas: τ = μ × B (vector), τ = μB sinθ (magnitude), μ = NIA, W = 0 (no work by B-force), τ-equilibrium at θ=0
- constraints: B uniform; loop rigid; θ measured from μ to B not B to μ; rotation axis fixed (no precession)
- per-state physics overrides for the 7 EPIC-L + 4×4 EPIC-C states
- drill-down trigger phrases for the 6 clusters above
- board mark scheme (drafted-but-deferred per Rule 20 M1-M6 exception)
