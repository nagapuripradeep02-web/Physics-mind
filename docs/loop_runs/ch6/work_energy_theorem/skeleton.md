# ARCHITECT SKELETON — `work_energy_theorem` (CYCLE 1 — Checkpoint A `DESIGN_FIX` patches applied; patch log at end)

> Chapter: Class 11 Ch.6 Work, Energy and Power · concept **#4** of 12 (approved teaching order, founder 2026-08-01)
> Renderer: `field_3d` / `scenario_type: "newtons_laws_body"` + the Phase-0c ENERGY LAYER (SEAMS K/L/M/N).
> **This is a 0d pure-JSON concept. Design target and verdict: ZERO renderer edits — see ENGINE FIT CHECK. No alarm.**
> Doctrine: Rules 11 · 16a · 19 · 23 · 24 · 25 · 31 · 32 · 33 · 34 · 35 · 38 · 41. Conceptual-only (Rule 20 [D]); EPIC-C branches: none.
> Siblings shipped: `work_done_by_constant_force` (#1), `positive_negative_zero_work` (#2), `kinetic_energy_definition` (#3).
> **First concept in the fleet to author `work_accumulators` AND `energy_layer` together.** The panel header
> proves it on screen: `nlbEnergyPanelLabel()` returns `"Energy and work bars"` only when both exist
> (`field_3d_renderer.ts` L44909-23, branch L44918 — never taken by any shipped concept). That pairing IS this concept.

---

## 0. Engine bug queue — consulted, this dispatch

Consulted via the dispatch-provided queue dump `docs/loop_runs/ch6/work_energy_theorem/inherited_scars.txt`
(the output of `query_engine_bug_queue.ts` for scenario `newtons_laws_body`: **50 OPEN/DEFERRED rows, 13 concepts**),
read in full. Every row naming `work_energy_theorem` or tagged `alex:architect` is dispositioned below; rows whose
discharge lives in a later section name that section.

| Row | Disposition |
|---|---|
| `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` (DIRECTIVE, names #4) | §3 home-pose paragraph states every `initial_position_m`; the one checkpoint (S5) is authored as arithmetic: `s_m = initial_position_m + d_target = −5.4 + 2.0 = −3.4`. §10(d). |
| `nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger` (CRITICAL) | **S4 deliberately authors exactly this configuration — and it is NOT the scar's failure mode.** The scar binds a state whose CLAIM is the SIGN of a constant force's work, where the unwind erases the claim. S4's claim is the OPPOSITE: that the ledger unwinds in lockstep with K through the turn — the reversal IS the taught beat, declared as `cycle-compare`. The scar's probe clause is scoped to "states authoring work_accumulators with a non-empty controls_visible": **every guided state here authors `controls_visible: []`**, so no slider can outlive a loop and no seized run exists. The state ENDS by `loop_reset_ms = 2600` and every cycle replays identically. Argued in §3 (S4 row) and §10(d). **S6 disposition (cycle 1 — the ONE state the probe clause actually selects: work accumulators + non-empty `controls_visible`):** S6 makes NO sign claim (no caption, cue, title or narration asserts the sign of any force's work — the sandbox teaches the relation under dials); the SEAM J wrap re-zeroes every ledger by contract on every lap (L48204-05), so a ledger re-zero is the sandbox's designed loop, not the erasure of a claim, and the scar's assertion is inapplicable to a wrapping sandbox by design; and with `v0 {min 0, …}` (§10(f-3)) no teacher-reachable setting produces a reversal at all. Stated for quality-auditor, not left to inference. |
| `nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` (DIRECTIVE, names #4) | **N/A by design choice, stated not silent: this concept is SINGLE-BODY in every state.** The theorem is a per-body statement (net work ON a body = ΔK OF that body); no compare state is needed, and the two configurations that would want one are blocked anyway (two-group energy panels drop a second reflow rung at the 551 px iframe, and lanes stack under the head-on camera). One camera, `[0, 2.0, 10]`, every state. |
| `nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate` (MAJOR, names #4, owner `peter_parker:field3d_surgeon`) | **Binding design rule: this concept authors ZERO `glow_focal`, and no `tts_sentences[].glow` may name any `work_bar_*` id** — a `work_bar_*` focal lights nothing and dims the whole scene. The state that would most want one (S1's net bar) instead leaves emphasis to per-sentence bindings on ids that DO light (`energy_bar_K`, `energy_panel`, mesh ids). Declared engine dependency, NOT routed from here; when the row closes, a work-bar focal becomes authorable. §3. |
| `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` (DIRECTIVE, names #4) | Every archetype in §3 names a motion the AUTHORED beat produces with no teacher input, inside the state, between t=0 and loop reset. All six come from the seed vocabulary — zero coined archetypes. |
| `shared_bar_scale_cross_state_guarantee_is_void_when_the_panel_reflow_ladder_drops_a_step` (DIRECTIVE, names #4) | §3 "PANEL LAYOUT AND REFLOW UNIFORMITY" — constructed, not asserted: single-word work-bar captions (`pull` · `friction` · `net`) give every state a ONE-line caption row, so all six states share identical panel geometry and select the SAME ladder rung together at EVERY viewport height (the iframe is responsive — no single rung is asserted anywhere). All cross-state claims ride NUMERALS and FILL FRACTIONS (`nlbEnPct` percentage), never pixel height. Probe handed to physics-author. |
| `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` (DIRECTIVE, names #4) | S5 is the only checkpoint state: crossing at 828 ms of R = 2400 → fraction **0.345 < 0.55**. §10(d). |
| `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm` (DIRECTIVE, names #4) | Every home pose inset: 5.4 and 1.6 in magnitude, both < `length_m − 0.55` = 5.45. §3 + §10(d) travel table — no body passes ±5.4 inside any authored loop. |
| `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` (DIRECTIVE, names #4) | §10(d) margin table, discrete events integrated at h = 1/60: S2 rest 1033 ms vs pin 1260 (margin 227 ms); S4 turn 1000 ms vs pin 1560 (560 ms); S5 crossing at or before 861 ms vs pin 1440 (579 ms or more). All clear 167 ms. |
| `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls` (DIRECTIVE, names #4) | **This design makes NO rewind-preservation claim.** Nothing survives a loop reset on purpose: ledgers re-zero, stamps re-fire, K re-derives from v. The one preservation-shaped fact relied on (each cycle replays identically) is discharged by citing SEAM M's own RESET_TRAJECTORY demonstration (full DOM snapshot diff of zero across RESET, pin, RESET, pin — ch6_state.md SEAM M RESULT), not by my reading of any function body. No param_ramp is authored, so the scar's probe case is empty. |
| `quantitative_check_state_reuses_the_exact_numbers_and_the_delta_cue_of_the_state_it_verifies` (MAJOR) | S5 (the verification state) lands on **m = 5, F = 5 N, v₀ = 2 m/s, W = 10.0 J, K: 10.0 → 20.0 J** — no earlier state renders any of those energy values (S1/S2: 40.0; S3: 98.0/15.6; S4: 18.0/46.1/28.1). The S1-fills-40 / S2-removes-40 echo is a deliberate designed pair (§2), not a verification duplicate, and their delta cues share no phrase. |
| `taught_variable_has_no_rendered_physical_correlate` (MAJOR) | The taught relation (W_net = ΔK) is carried by two NON-TEXT geometries that move monotonically with it — the net bar's signed fill and the K bar's fill — plus the crate's own motion as cause. No state's taught variable is text-only. |
| `energy_layer_two_body_groups_stack_vertically` (MAJOR) | Read and used as a DESIGN DRIVER: it is one of the two reasons this concept is single-body (see the lane row above). No state authors `body_ids` of length 2. |
| `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` (DIRECTIVE) | Every state here teaches a RELATION (a work bar against the K bar) → **zero `glow_focal` in all six states**, argued per state in §3. `glowActive` stays false, nothing dims, per-sentence bindings take effect. |
| `authored_state_glow_focal_silently_voids_every_tts_sentence_glow` (MAJOR) | Avoided by construction — zero state-level focals (row above). |
| `concept_ships_zero_narration_glow_bindings` (MAJOR, owner `alex:physics_author`) | Carried to physics-author: every `tts_sentences` entry binds a glow to an id that EXISTS and LIGHTS (`energy_bar_K`, `energy_panel`, `nlb_body_*`, arrow ids, `displacement_vector`, `checkpoint_1`) — never `work_bar_*` (see above). |
| `explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations` (MAJOR, owner `alex:json_author`) | §10(a): Rule 19 counted against DRAWN objects only; every teaching string in S6 lives on a rendering path; every assessment item with `teaches_state` = S6 answerable from what S6 renders. |
| `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility` (DIRECTIVE, owner `alex:physics_author`) | Every authored force checked against the floor at `NLB_ARROW_SCALE = 0.048`, min length 0.55 → the floor bites below about 11.5 N: S1 F = 10 N renders AT the clamp floor (visible but clamped — acceptable: no length RATIO is claimed anywhere in this concept; the arrow is a direction cue, magnitudes live in the HUD and bars); S2 f = 19.6 N → 0.94 ok; S3 F = f = 19.6 N → 0.94 both, and their EQUAL length is true and is the state's point; S4 F = 12 N → 0.576, just above the floor; S5 F = 5 N → clamp floor, direction cue only, declared. No state claims an arrow-length ratio. |
| `calculator_dom_harvest_needs_symbol_and_value_in_ONE_text_node` (MAJOR, names #4, owner `peter_parker:visual_validator`) | **Channel B has LANDED in this desk** (`readoutHarvest.ts` L180-202): it composes the sibling `nlb_en_sym`/`nlb_en_val` pair into the chip form (`K 40.0 J`), so the K bar harvests in every state — **but the gate requires the symbol node to be BARE: `!/\s/.test(direct)` (L192)**, so a multi-word caption is silently skipped. §3's single-word captions (`pull` · `friction` · `net`) make all three work numerals harvestable too (values use ASCII `-` from `toFixed` → pass the sibling numeral test). Handed to physics-author: author `computed_outputs` keys so the harvested `pull` / `friction` / `net` / `K` readings have ground truth. *A SKIP is still not a pass* — any numeral the harvest skips is hand-verified against §10(d). |
| `nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix` (MAJOR, OPEN) | Binds S2, S3, S6 (friction arrows). Engine-owned, known-inherited, named so eye-walker does not re-file it. |
| `nlb_work_bar_track_tops_lose_collinearity_when_a_3d_label_size_changes` (MAJOR, names #4) | No label, sprite or panel constant is touched (pure JSON). The standing probe (all `nlb_wk` track tops equal within 1 px) is handed to physics-author to run once on the built concept. Also: ch6_state.md — the E3 label-size fix is **HELD**; this concept must not take it. |
| `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (DIRECTIVE) | The work ledgers and K are SEAM-built quantities already contracted to rebuild from the state record (SEAM M entry-rebuild + wrap re-anchor); this concept authors no new accumulator of its own and no `*_at_ms`. The cold-pin vs played-frame probe stays in physics-author's kit. |
| `nlb_work_probe_globals_disagree_on_multibody_states` (MODERATE, names #4) | Single-body concept; every accumulator carries an explicit `body_id`. The scalar-global ambiguity cannot arise. |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` (DIRECTIVE) | Every engine limit asserted in this skeleton quotes its source line, read at source this dispatch: panel label L44909-23 · `NLB_EN_STEPS` L44841-45 · fit ladder L45119-39 · work section same-panel stack L44977-45029 (zero line at top:50%, L45014) · `NLB_WK_MAX = 4` L45356 · work overflow warn L46396-98 · scale warn prefix L44851 · sandbox gate reader `nlbSandboxWrap()` L43942-46. **Cycle 1: the SEAM J sandbox wrap is now CITED at source — L48194-48205.** One statement per wrap direction does all three things: `v1 = (b.v0 != null) ? b.v0 : 0` (re-seeds v to the authored v₀), `nlbEnergyOnWrap(eng)` (re-zeroes every ledger), `b._dsp0 = s1` (re-anchors d). S6's envelope arithmetic (§10(f-3)) rests on this line, and RISK-D reduces to a 30 s verification drive. |
| `ramp_endpoints...` · `nlb_angle_arc_radius...` · `nlb_displacement_vector_is_single_body` · `nlb_coupled_sandbox_F_slider...` | N/A with reasons: no `param_ramp`; no `angle_arc` (every force at 0°); single body (the d arrow measures the only body); no coupled bodies. The sandbox validity bound that DOES apply (energy-scale overflow over the full slider cross-product) is computed in §10(f-3) by the coupled-sandbox row's own method: the envelope over the FULL cross-product, never the defaults alone. |

Also read and honoured from ch6_state.md "Before concept #4": the `W` label collision (see LABELLING SCHEME), the corrected reflow trigger (§3), the held E3 fix (not taken), and the S3-normal-arrow note (N/A — this design does not clone #3's S3).

---

## 1. Atomic claim

This concept teaches ONE idea: **the NET work done on a body equals the change in its kinetic energy — W_net = ΔK = ½mv² − ½mv₀²** — and only that.

It does NOT cover: what work is or W = F·d·cos θ (#1); the sign taxonomy of work or net work as a signed sum (#2 — assumed, not re-taught); what K is (#3); whether a force's work depends on the path (#5); potential energy of any kind (#6/#7/#8); where removed kinetic energy GOES — heat, sound, the micro story (#10); power (#11/#12).

**Boundary with #3, enforced mechanically.** #3 authors ZERO `work_accumulators` (its greppable invariant, honoured on ship). #4 is the concept where the work bars and the K bar appear TOGETHER for the first time in the fleet — the pairing is the concept. The mirror invariant json-author is held to and quality-auditor can grep:

> **Every state of `work_energy_theorem` authors BOTH a non-empty `energy_layer.bars` (exactly `["K"]`) AND at least one `work_accumulators` entry.** Consequence on screen: the left panel's engine-composed header reads `"Energy and work bars"` (`nlbEnergyPanelLabel`, L44918) in every state — #1 said `Work done`, #3 said `Energy bars`, #4 says both. Consequence on layout: every state renders the same combined panel class, which is what makes the reflow arithmetic in §3 uniform.

**Boundary with #10, declared:** S2 and S3 use friction to remove or cancel kinetic energy. This concept reads the LEDGER (how many joules of net work) and never asks where the energy went, never says "lost", "heat" or "dissipated", and never authors the `E_dissipated` bar.

**Boundary with #5, declared:** S4's out-and-back motion is about the theorem holding through a velocity reversal. No string may say "round trip", "closed path" or compare paths — path-dependence is #5's PRIMARY content.

## LABELLING SCHEME — the `W` collision, resolved by rule (ch6_state.md "Before concept #4")

The letter `W` means WORK — and only work — everywhere in this concept:

- **The symbol `W` appears in exactly two places:** the formula surfaces (`W_net = ΔK` …) and S5's checkpoint stamp (`flag:  W net = 10.0 J  ·  K = 20.0 J` — the engine emits `"W " + label` per captured accumulator, `nlbCpStampText` L46217-23). Both mean work.
- **Work bars never carry the symbol `W`.** They are captioned with the force's plain-English name (SEAM M contract: plain-English, Rule 41), authored as **single words — `pull` · `friction` · `net` (binding, F1/F8):** a one-word caption cannot wrap (CSS never breaks an unspaced word), which is what makes the reflow rung identical across all six states at every viewport height (§3), and a whitespace-free caption is what THE CALCULATOR's channel B can harvest (L192).
- **No weight arrow is authored in ANY state.** Every surface is flat, gravity's work is identically zero and never discussed, so weight ink would be untaught clutter (Rule 34). If any downstream agent adds one, its label is the engine default **`mg`** (`NLB_ARROW_DEFAULT_LABELS.weight` — the line #3 held) — never `W`.
- Force arrows use the engine's default symbolic labels (physics-author reads the exact strings at `NLB_ARROW_DEFAULT_LABELS` L39679 and records them in the physics block); none of them is `W`.
- No reader-facing string may use `W` for weight; narration says "weight" as a word if it ever needs it (it should not).

---

## 2. State count + arc — 6 states (5 guided + 1 explore)

Medium concept (§5 calibration: medium = 5–6). The theorem needs: the statement shown positive, shown negative, the "only the NET counts" confrontation, the change-not-total case (v₀ ≠ 0, through a reversal), the derivation with a numeric check, and the sandbox. Each guided state proves something no other state proves (the distinct-IDEA gate, not merely distinct archetype):

| # | id | Ring | What this state PROVES that no earlier state does | teaching_method |
|---|---|---|---|---|
| S1 | `net_work_fills_k` | core | The theorem itself, positive case: one steady pull from rest, and the net-work bar and the K bar climb in LOCKSTEP — the same joules on two instruments, every frame, ending at 40.0 J on both. **PRIMARY aha.** | (straightforward beat) |
| S2 | `negative_net_removes_k` | core | The theorem is SIGNED: friction alone does −40.0 J of net work and K falls from 40.0 J to exactly 0.0 J — the same 40.0 J S1 put in, taken out. Not derivable from S1: nothing in S1 shows a bar below the zero line driving K DOWN. | (straightforward beat) |
| S3 | `only_net_counts` | core | Work by A force is not the theorem's W: the pull does +98.0 J while K never moves, because friction does −98.0 J and the NET is 0. **SUPPORTING aha + Rule 16a beat.** Not derivable from S1/S2: both were single-force states where the drawn bar WAS the net. | misconception_confrontation |
| S4 | `change_not_total` | extended | ΔK is a CHANGE measured from the starting energy, not the final ½mv²: a cart that starts with 18.0 J, is slowed to 0, turns, and speeds up again — the net bar reads −18.0 J at the very moment K reads 0, and the loop ends with K = 46.1 J beside net = +28.1 J — two different nonzero numerals, related only through the starting 18.0. Not derivable from S1–S3: every earlier state has ΔK equal to plus-or-minus the whole bar because it starts or ends at rest. | (straightforward beat) |
| S5 | `derive_and_check` | advanced | WHERE the theorem comes from: W_net = ma·d and v² = v₀² + 2ad give ½mv² − ½mv₀² — and a flag stamps W net = 10.0 J against K rising 10.0 → 20.0 J, a check the teacher does aloud. No earlier state derives; no earlier state prints the equality as arithmetic. | derivation_first_principles |
| S6 | `explore` | core (explore) | Teacher's sandbox: force, mass and starting speed live on a rough floor; the work bars and the K meter track every choice. | exploration_sliders |

**The S1/S2 pair is the concept's spine:** S1 fills exactly 40.0 J of kinetic energy with +40.0 J of net work; S2 removes exactly 40.0 J with −40.0 J. The shared numeral is DESIGNED (one number in, the same number out) — it is not the quantitative-verification state reusing values (that is S5, whose numbers are fresh; §0).

Rule 38a ladder: qualitative/relational (S1–S3), the harder quantitative case (S4), derivation (S5), sandbox. Advanced ring = S5, a contiguous block immediately before the explore state (38a).

The hook MOVES from the first frame: S1 opens with the crate already accelerating and both bars already climbing.

---

## 3. Per-state choreography + control table (Rule 31 — REQUIRED artifact)

**Home pose (Rule 32d — PERMANENT).** Flat floor every state (`surface.theta_deg: 0`, `length_m: 6` — a HALF-length, track spans −6 to +6). ONE body id across the whole concept: **`cart`** (blue `#42A5F5`), billboard label `m` (symbol, dodge-friendly — the #1 lesson that a word label overprints). Mass 5 kg except S4 (4 kg — the one state whose delta is framed by a different starting energy). **`initial_position_m`, stated explicitly per state (scar row): S1 = −5.4 · S2 = −5.4 · S3 = −5.4 · S4 = +1.6 · S5 = −5.4 · S6 = −5.4.** All inset from the ±5.45 authoring bound (`length_m − 0.55`); every guided loop's travel stays inside ±5.4 (§10(d) table). Camera **`[0, 2.0, 10]` in every state — it never moves** (single body throughout; Rule 32d: nothing new to frame).

**PANEL LAYOUT AND REFLOW UNIFORMITY (the reflow scar — constructed, not asserted; rewritten cycle 1, F1).** The sim iframe is RESPONSIVE (observed heights 551 / 599 / 731 / 911 px with the teacher's window) and THE EYE captures at 1280×720 — no single height may be assumed. Constants read at source: `NLB_EN_STEPS` L44841-45 (step 0 `trk: 186`, step 1 `trk: 138`, step 2 `trk: 98`); the fit ladder steps the whole panel down a rung whenever its measured bottom exceeds `window.innerHeight − 12` OF THE IFRAME (`nlbFitEnergyPanel` L45119-41, limit L45123); the work section renders in the SAME panel, stacked BELOW the energy group (L44977-45029), signed fills against a mid-height zero line (L45014), captions that wrap by design (L45017-25).

Panel HEIGHT is set by the tallest work caption's LINE COUNT — the same panel *class* does not fix panel *height* (the cycle-0 reasoning error). Measured with the real fit ladder in headless Chromium (Checkpoint A): one-line captions bottom at 545.6 px (step 0) / 439.3 px (step 1); a two-line caption (`by the pull`) adds one caption line-height (13 px × 1.15 ≈ 15 px) → 560.5 / 453.1 px, opening a viewport band (iframe ≈ 558–572 px) where two-line states sit one rung BELOW one-line states — a live inconsistency in a band no 1280×720 baseline can ever photograph.

**Constructed fix: single-word work-bar captions in EVERY state — `pull` · `friction` · `net`.** A single unspaced word cannot wrap at any ladder step (CSS never breaks an unspaced word; `friction` at the widest, 8 chars at the 13 px step-0 sym font ≈ 40 px, fits the 46 px slot), so every state's caption row is ONE line and all six states share identical panel geometry at EVERY viewport height — whichever rung the teacher's window selects, all six states select it together (both content classes now identical: step 0 at iframe ≥ 573 px including THE EYE's 720; step 1 at ≤ 557 px including 1052×551).

Binding consequences: (a) no narration, caption, title or aha may compare bar HEIGHT across states, and within a state the work bars and the K bar are DIFFERENT instruments (signed mid-zero vs bottom-zero, different scales) — **the equality W_net = ΔK is always read from the NUMERALS**, with fills as reinforcement; (b) probe handed to physics-author: *at iframe heights 551, 720 and 911, assert every state's `.nlb_en_trk` computed height is IDENTICAL across all six states — never assert a particular value* (551 and 720 legitimately land on different rungs); fallback if any state measures a different rung at any height: re-run this section's reasoning and equalize panel content — never captions-as-spacers.

**Scales.** Guided K bar: ONE shared `bar_max_J = 55` (concept peak 48.4 J in S5 → 12% headroom; no guided state has a slider, so every peak is exact and `[PM_NLB_ENERGY_SCALE]` is unreachable — warn prefix L44851). Explore `bar_max_J = 340` (by-construction envelope over the FULL 12.0 m wrap span, §10(f-3)). Work scales are per-state (`work_scale_J`: 55 · 55 · 110 · 40 · 55 · 400) — shipped precedent #2 (180/315/792); cross-state work-bar deflections are declared NOT comparable, numerals carry every claim.

| # | Teaches | Archetype | Distinct motion (authored beat, no teacher input) | Delta cue | Controls | Ring | Words |
|---|---|---|---|---|---|---|---|
| S1 | W_net = ΔK, positive | `translate-through` | Crate (5 kg) pulled from rest by a steady 10 N force on a frictionless floor from s₀ = −5.4; over the 2.0 s loop it crosses to −1.4 m while the `net` bar (up, green) and the K bar climb together 0 → **40.0 J each** — the two numerals equal on every frame. `loop_reset_ms = 2000`. Applied arrow shown. Formula `W_net = ΔK` | "Two bars, one number" | none | core | 30–45 |
| S2 | W_net = ΔK, negative | `decay-to-rest` (Ch.6-registered by #2, `positive_negative_zero_work/skeleton.md` L57 — permitted exactly when the slow-down IS the taught content, as here: the fall to a standstill with K on exactly 0.0 and the ledger held at −40.0 is the state's claim; delta: the ledger runs BELOW zero and K falls instead of fills — the 40.0 J S1 put in, taken back out) | Crate (5 kg) launched at 4 m/s onto a rough floor (μ = 0.4, a = −3.92 m/s²) from s₀ = −5.4; friction is the only horizontal force; the `net` bar dives 0 → **−40.0 J** as K falls 40.0 → **0.0 J**; the crate stops at −3.36 m at t = 1.03 s and holds. `loop_reset_ms = 2100`. Friction arrow shown (t = 0 tint scar inherited, §0) | "Negative net work: K falls" | none | core | 30–45 |
| S3 | Only the NET work changes K | `null-result-hold` | Crate (5 kg) coasting at a constant 2.5 m/s: the pull is authored EQUAL to kinetic friction (F = μmg = 19.6 N, both arrows the same 0.94 length), s₀ = −5.4 → −0.4 over 2.0 s. THREE work bars run: `pull` climbs to **+98.0 J**, `friction` dives to **−98.0 J**, `net` sits parked ON the zero line at **0.0 J** — and the K bar holds **15.6 J**, flat, while the crate visibly crosses the floor with its d arrow growing. The deliberate nothing-happens is the taught null (16a beat, §4). `loop_reset_ms = 2000` | "Net zero: K constant" | none | core | 40–55 |
| S4 | ΔK is a change from the START, with sign, through a turn | `cycle-compare` | Crate (**4 kg**) launched LEFT at −3 m/s from s₀ = +1.6 against a steady +12 N pull, frictionless: phase A — it slows, K falls 18.0 → 0 as `net` dives 0 → **−18.0 J**; the turn at t = 1.0 s (s = +0.1); phase B — it accelerates RIGHT, K refills as the same bar climbs back through zero to **+28.1 J** at t = 2.6 s (v = +4.8 m/s, K = 46.1 J). One loop = fall, turn, refill — the A→B→A′ contrast. At every instant the net numeral equals K − 18.0 (at the loop end: 46.1 − 18.0 = 28.1 ✓). `loop_reset_ms = 2600`. Applied arrow shown. Formula `ΔK = ½mv² − ½mv₀²` | "Measured from the start" | none | extended | 40–55 |
| S5 | The derivation, checked by a stamped number | `flow-along-path` | Crate (5 kg) already moving at 2 m/s, steady 5 N pull, frictionless, s₀ = −5.4, a = 1 m/s². It flows past ONE flag at `s_m = −5.4 + 2.0 = −3.4` (d = 2.0 m, t = 0.83 s), which stamps **`flag:  W net = 10.0 J  ·  K = 20.0 J`** under the formula `W_net = ma·d = ½mv² − ½mv₀²`. The K bar started at 10.0 J (visible at every loop start) — the teacher checks 20.0 − 10.0 = 10.0 aloud, and 5 N × 2.0 m = 10.0 J against the d arrow's own value. `loop_reset_ms = 2400`. HUD adds the `a` row | "Derived from F = ma" | none | advanced | 40–55 |
| S6 | Teacher's sandbox | `drag-sandbox` | `mode: "sandbox"`, `trusted_drag_seizes`. Rough floor (μ = 0.3, fixed). Sliders F, m, v₀ drive the crate live; work bars (`pull`, `friction`, `net`) + K track every choice; SEAM J's wrap is the loop (each lap re-seeds v to v₀, re-zeroes the ledgers and re-anchors d — cited at source, L48204-05, one statement). Dragging the crate repositions AND stops it (v = 0) — the honest way to park it and read K = ½mv₀² afresh | "Change force, mass, speed" | `F`, `m`, `v0` (ALL) | core | 0 / open |

**Archetype audit** (each names an in-state authored motion): `translate-through` ×1 (S1 — accelerating away under a forward pull) · `decay-to-rest` ×1 (S2 — Ch.6-registered by #2; the slow-down to a standstill IS this state's taught content, which is the registry's own condition of use) · `null-result-hold` (S3 — the canonical 16a contrast beat: the crate and two big bars move, the taught pair holds still) · `cycle-compare` (S4 — the slowing phase against the speeding-up phase inside one loop) · `flow-along-path` (S5 — past a stamping flag) · `drag-sandbox` (S6, explore only). No state static, **no archetype repeat at all — the S1/S2 contrast-pair declaration is retired**, zero coined archetypes.

**Rule 32 plan.** (32a) cause first: the crate's motion is the cause and leads by construction — work accumulates only as the crate covers distance, so both bars follow the motion continuously; in S5 the crate crosses the flag first, the stamp lands after (crossing interpolation). (32b) only the taught variable's motion changes per state: S1/S2 one force, one ledger; S3 adds the second ledger and nothing else changes vs S2's apparatus class; S4 changes only the starting velocity's sign and the mass vs S1's shape; S5 adds only the flag. Apparatus, camera and panel position identical throughout — no teleport, no camera cut. (32c) delta cues in the table, all 5 words or fewer, each names the state's one new thing. (32d) home pose: same crate, same floor, same left-edge panel, every state. (32e) **zero `glow_focal` in all six states, argued:** every state's claim is a RELATION between a work bar and the K bar (S3: between three bars and K) — a focal would dim half the relation (scar row, §0). Nothing dims; per-sentence tts glows carry narration-order emphasis on lightable ids only.

---

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots, no per-state tic)

| Wrong belief | State | `misconception_watch` beat |
|---|---|---|
| "The work done by the force you apply becomes kinetic energy" — students compute W of the pull and set it equal to ΔK even when friction acts | **S3** | `belief`: the pull's work turns into kinetic energy · `visual_counter`: the pull's bar climbs to +98.0 J — the number the belief tracks — while the K bar holds 15.6 J without moving and the net bar sits on its zero line · `one_line_fix`: only the NET work changes kinetic energy — add the works with their signs first |
| "Net work equals the final ½mv²" — the initial kinetic energy is dropped, the classic exam error | **S4** | `belief`: net work equals the final kinetic energy, so a body at v = 0 has received zero net work · `visual_counter`: at the END of the run the K bar reads 46.1 J while the net bar reads +28.1 J — two different nonzero numbers on one screen; the change is 46.1 − 18.0 = 28.1, measured from the starting 18.0 J, and the net bar reads the CHANGE, never the total (the turn instant — K = 0.0 with net = −18.0 — stays as the SIGN beat, but cannot carry the confrontation: S2's end pose already renders K = 0.0 beside a nonzero net bar) · `one_line_fix`: W_net = ½mv² − ½mv₀², the CHANGE, not the final value |

S1, S2, S5, S6 carry **no** `misconception_watch`. EPIC-C branches: NONE (EPIC-L-first directive 2026-06-10).

16a delivery: both are straightforward contrast beats in motion, no predict-pause. S3 renders the wrong expectation's tracked quantity (the +98 J pull bar) simultaneously against the flat reality — the full rendered form. S4's confrontation is a NUMERIC contrast at the loop end (the wrong prediction — "net work equals the final ½mv², 46.1 J" — is named in narration while the net bar reads +28.1 J; the turn supplies the sign beat); declared for quality-auditor as narration-named rather than ghost-rendered (the engine has no ghost-bar primitive — the same engine-forced descope #3 declared, not routed).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **S3 `only_net_counts`** — the stickiest idea: work by a force vs net work on the body.
- **S4 `change_not_total`** — the dropped-K₀ error, plus signed net work through a reversal.

Pass-1 cliff notes (Block 1) land on S1/S2 (prerequisite gaps) while the deep-dive picks are S3/S4 — divergence documented: the cliffs are PREREQUISITE gaps patched by one narration clause each; the places students get stuck on THIS concept's own content are S3 and S4.

## 6. Drill-down clusters (3 candidates each; physics_author writes trigger_examples)

- S3: `applied_work_vs_net_work` (the pull's work is real work — it is just not the theorem's W) · `pulling_but_speed_constant` (steady speed under a real pull) · `zero_net_work_while_moving` (moving body, zero net work, no contradiction)
- S4: `forgot_initial_kinetic_energy` (½mv² − ½mv₀², not ½mv²) · `negative_then_positive_net_work` (the sign of W_net follows the change, not the force) · `net_work_when_body_reverses` (the theorem holds instant by instant through v = 0)

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:       STATE_1 -> STATE_3   # "what is the work-energy theorem" — contains the PRIMARY aha (S1)
  changing_direction: STATE_4              # "does it hold when the body slows down / turns around?"
  derivation:         STATE_5              # "prove / derive the work-energy theorem"
```

Default aspect `foundational`. **Foundational-coverage rule satisfied directly** — the PRIMARY aha is S1, inside STATE_1 → STATE_3; no exit-pill required. Cross-slice pills after the foundational slice: "What if it is already moving?" → STATE_4, "Where does the formula come from?" → STATE_5.

## 8. Prerequisites (advisory — Rule 23)

All three shipped siblings, in order: `work_done_by_constant_force` (#1 — what W is), `positive_negative_zero_work` (#2 — signs and the net as a signed sum), `kinetic_energy_definition` (#3 — what K is). This is the first Ch.6 concept whose prerequisites are the chapter's own earlier concepts; the forward edges point to #9 and #10.

## 9. Real-world anchor (Rule 35 universal · Rule 38f widest-overlap · Rule 41 plain)

**Primary — braking a moving vehicle.** To stop, the brakes and the road must do negative net work exactly equal to the vehicle's kinetic energy — every joule of ½mv² must be matched by a joule of negative net work before v reaches zero. Twice the speed means four times the kinetic energy (#3's own shipped claim), so four times the net work to remove. Universal (vehicles and braking exist everywhere; no place, brand or currency named); widest-overlap (CBSE, IB, AP, A-Level and JEE all teach stopping via the work-energy theorem). **Two declared restraints:** no stopping-DISTANCE number is spoken (nothing in this sim renders one — the distance payload stays with #10 per #3's §9 declaration), and no word about where the removed energy GOES (heat is #10's PRIMARY content).

**Secondary — catching a ball.** Your hands must do negative net work equal to the ball's kinetic energy. Moving the hands backward while catching spreads the same joules over a longer distance, so the force on the hands is smaller — same W, longer d, smaller F. Universal, hands-on, pure work-energy content.

The source catalog's mined anchors are pre-Rule-35 and India-specific — **NOT imported** (phase0_survey.md Rule 35 section).

---

## 10. Definition of Done (Gate 0 — no TBDs)

### (a) States and rendered primitives (Rule 19 counted against what is DRAWN — `field_3d` never paints `scene_composition` annotations)

| State | Drawn objects |
|---|---|
| S1 | floor slab · crate · billboard `m = 5 kg` · applied arrow · combined panel (net bar + K bar, both with numerals) · HUD `v` row · formula surface |
| S2 | floor slab · crate · billboard · friction arrow · panel (net + K) · HUD `v`, `f` rows · formula surface |
| S3 | floor slab · crate · billboard · applied + friction arrows (equal length 0.94) · d arrow with value · panel (pull, friction, net + K) · HUD `v`, `F`, `f` rows · formula surface |
| S4 | floor slab · crate · billboard `m = 4 kg` · applied arrow · panel (net + K) · HUD `v` row · formula surface |
| S5 | floor slab · crate · billboard · applied arrow · d arrow with value · one checkpoint flag · panel (net + K) · HUD `v`, `a` rows · formula surface + stamp |
| S6 | floor slab · crate · billboard · applied + friction arrows · d arrow · panel (pull, friction, net + K) · HUD rows · three slider rows |

### (b) Symbol-label table (Rule 34c Unicode; engine strings read at source)

| Narrated quantity | On-canvas rendering, with source |
|---|---|
| the panel's teacher-facing name | engine-composed **`"Energy and work bars"`** (`nlbEnergyPanelLabel` L44918 — first concept ever to take this branch). Also the ⚙ row's label (`data-wg-label`, L44939) — Rule 39g automatic, nothing to author |
| kinetic energy | K bar, symbol **`K`**, amber, bottom-zero track, value e.g. `40.0 J` (`precision: 1` authored) |
| work done by a force | signed work bar, mid-height zero line (L45014), green up / red down, caption = plain-English force name authored as a SINGLE word (`pull` · `friction` · `net` — F1 reflow uniformity + F8 harvestability), signed value e.g. `−40.0 J` with −0.0 clamp (SEAM M contract) |
| net work, in symbols | **`W_net`** — formula surfaces and the S5 stamp ONLY (LABELLING SCHEME; `W` never appears on a bar caption or an arrow) |
| the change in kinetic energy | **`ΔK`** (U+0394) — formula surfaces only |
| starting speed | **`v₀`** (subscript U+2080) — first on canvas in S4's formula; the WORD "starting speed" is core from S2's narration, which backs the `v0` slider glyph under the intro cut |
| speed / friction / force / acceleration | HUD rows `v` (m/s), `f` (N), `F` (N), `a` (m/s², S5 only) — value-only, live |
| displacement | d arrow, label `d`, `show_value: true` (S3, S5, S6) |
| the checkpoint stamp (S5) | `flag:  W net = 10.0 J  ·  K = 20.0 J` — the engine emits `"W " + label + " = "` per captured accumulator (`nlbCpStampText` L46217-23; S5 authors ONLY the `net` accumulator, so exactly one W part) — appended under the authored formula (stored `formula_base`, SEAM M — a stamp can never eat the formula). **36 characters — OUTSIDE #3's measured 34-char one-line precedent, so the stamp may wrap; RISK-E asserts 2 rendered lines at most and treats a wrap as acceptable** |
| force arrows | engine default symbolic labels (physics-author records exact strings from `NLB_ARROW_DEFAULT_LABELS` L39679); none is `W` |

**TERM-INTRODUCTION LEDGER.** `K`, `v`, `J` — prerequisite (#3), re-named in S1 narration one clause each. `W_net` and `ΔK` — DEFINED by S1 (narration + formula `W_net = ΔK`; the `net` bar caption is its rendered face). Signed work — prerequisite (#2), S2 re-names it in one clause. `v₀` — S4 (formula) with the word from S2. `a` and the chain `ma·d` — S5 (advanced). No symbol appears on canvas before its defining state.

**"No claim without a rendered measurement":** every narrated number is produced by a rendered instrument (bars, HUD, d value, stamp, billboard). Nothing may name a stopping distance, heat, momentum or power as a number — none is rendered.

### (c) Direction-rule plan

N/A, deliberately: work and kinetic energy are scalars; the direction content here is SIGN, and sign is rendered as bar deflection about a drawn zero line (up/down + green/red + signed numeral). No right-hand rule.

### (d) Motion plan, loop arithmetic, frozen-pin margins

g = 9.8. Pin per loop-state = clamp(0.60R, 150, R−150) at 60% phase (SEAM M); every cycle replays identically (entry rebuild + the SEAM M reset demonstration, §0 rewind row), so phase-relative assertions hold on every cycle including the pinned one.

| State | Home pose (`initial_position_m`) | Motion | R (ms) | Travel / position at R | Past ±5.4? |
|---|---|---|---|---|---|
| S1 | −5.4, v₀ = 0, F = 10 N, m = 5, frictionless | a = 2.0 m/s² | 2000 | d = 4.0 m → **−1.4** | no |
| S2 | −5.4, v₀ = 4, μ = 0.4, m = 5 | a = −3.92; rest at d = 2.041 m, t = 1.020 s (discrete 1.033 s) | 2100 | **−3.36**, at rest 1.03–2.10 s | no |
| S3 | −5.4, v₀ = 2.5, F = 19.6 N, μ = 0.4, m = 5 | a = 0 exactly (F = μmg); constant v | 2000 | d = 5.0 m → **−0.4** | no |
| S4 | +1.6, v₀ = −3, F = +12 N, m = 4, frictionless | a = +3.0; turn at t = 1.0 s, s_min = **+0.1** | 2600 | s(2.6) = **+3.94**, v = **+4.8** | no |
| S5 | −5.4, v₀ = 2, F = 5 N, m = 5, frictionless | a = 1.0; flag at s_m = −5.4 + 2.0 = **−3.4**, t = 0.828 s | 2400 | s(2.4) = **+2.28**, v = 4.4 | no |
| S6 | −5.4, sandbox (μ = 0.3, defaults F = 20, m = 4, v₀ = 0) | wrap is the loop | — | wraps | n/a |

Key per-state numbers (all exact — no guided sliders): S1 W_net = K: 0 → **40.0 J** (v_end 4.0). S2 K: **40.0 → 0.0**, W_net → **−40.0 J** (f = 19.6 N × 2.041 m = 40.0). S3 W_pull = +19.6 × 5.0 = **+98.0 J**, W_friction = **−98.0 J**, net **0.0**, K flat **15.6 J** (15.625 displays 15.6). S4 K: 18.0 → 0 → **46.1 J** (½·4·4.8² = 46.08); W_net: 0 → **−18.0** → **+28.1 J** (12 × (3.94 − 1.6) = 28.08; ΔK = 46.08 − 18.0 = 28.08 ✓ — every number at the SAME t = 2.6 s). S5 at flag: v² = 4 + 2·1·2 = 8, K = **20.0 J**, W = **10.0 J**, K₀ = **10.0 J**; at R: K = 48.4 J, W = 38.4 J.

**Frozen-pin margin table (discrete events integrated at h = 1/60):**

| State | Pin (0.60R phase) | Asserted event at the pin | Event time | Margin ≥ 167 ms? |
|---|---|---|---|---|
| S1 | 1200 | both numerals equal and nonzero (14.4 J at pin) | continuous | n/a — no discrete event |
| S2 | 1260 | crate at rest, K = 0.0, net = −40.0 | 1033 ms (v_n = 4 − 3.92n/60 → n = 62) | **227 ms** yes |
| S3 | 1200 | net on zero, K = 15.6, pull/friction at ±58.8 J | continuous | n/a |
| S4 | 1560 | past the turn: K small and RISING, net bar negative (−12.4 J), v = +1.68 | turn at 1000 ms (v_n = −3 + 3n/60 → n = 60 exact) | **560 ms** yes |
| S5 | 1440 | stamp `flag: W net = 10.0 J · K = 20.0 J` present under the formula | crossing at or before 861 ms discrete; fraction 0.345 of R < 0.55 | **at least 579 ms** yes |

Accepted trade in S2 (the same class #3 accepted on its S5): the crate is at rest for about half the loop (1033 → 2100 ms, ~51%) — and the rest pose IS the closing claim (K on exactly 0.0, net held at −40.0). Flagged at Checkpoint A as the concept's weakest stretch; accepted with the precedent declared.

**One-shots:** ONE checkpoint, S5 only: `{ s_m: -3.4, label: "flag", capture: ["W","K"], capture_mode: "first", body_id: "cart" }`. No `sum_merge`, no `height_markers`, no `phases`, no `param_ramp`, no `idle_auto_sweep`, no spring, no pulley, no `angle_arc` (every force at 0°).

### (e) Modes

Conceptual-only (Rule 20 [D]) — no `mode_overrides`. `advance_mode`: `manual_click` S1–S5, `interaction_complete` S6 — 2 distinct modes, Gate 12 satisfied. No `wait_for_answer`, no `pause_after_ms`.

### (f) `assessment` + `coverage_map` + `misconception_watch`, and the binding numeric constraints

`assessment` + `coverage_map` by physics-author; every item with `teaches_state` = S6 answerable from what S6 renders. `misconception_watch` = §4 exactly (S3, S4 only).

**(f-1) Shared guided `energy_layer`:** `{ bars: ["K"], bar_max_J: 55, precision: 1 }` on S1–S5. K fills at 55 J: S1 0 → 72.7% · S2 72.7% → 0 · S3 28.4% flat · S4 32.7% → 0 → 83.8% · S5 18.2% → 88.0% (flag 36.4%). Concept peak 48.4 J → 12% headroom; no guided state has a slider, so every peak is exact and the overflow warn is unreachable.

**(f-2) `work_scale_J` per state:** 55 (S1) · 55 (S2) · 110 (S3) · **40 (S4)** · 55 (S5) · **400 (S6)**. Peak deflections of the signed half-track: S1 +72.7% · S2 −72.7% · S3 ±89.1% with net on the line · S4 **−45.0% → +70.2%** (18.0 and 28.08 on the 40 J scale) · S5 +69.8%. The work overflow warn (L46396-98) is unreachable in every guided state by the same no-slider argument. S1 and S2 share the 55 J scale deliberately — the mirrored ±40.0 J pair.

**(f-3) Explore envelope, by construction over the FULL slider cross-product AND the full wrap span** (the coupled-sandbox row's method; rewritten cycle 1, F3/F4/F6): sliders `F {min 0, max 30, step 5, default 20}` · `m {min 2, max 6, step 1, default 4}` · **`v0 {min 0, max 4, step 1, default 0}`** (F4: min raised from −4 — no state teaches a backward launch, S4 owns the reversal, and the removed corner (F = 30, m = 2, v₀ = −4) would turn around in 16/35.88 = 0.45 m ≪ the span, mini-wrapping against the boundary with the ledgers re-zeroing several times a second; raising the min deletes the reversal corner at zero teaching cost); μ = 0.3 fixed. **The per-lap distance is the WRAP SPAN, not the seed lap: `nlbBoundsM` (L47150-67) returns `{lo: −length_m, hi: +length_m}` → span = hi − lo = 2 × 6 = 12.0 m.** The −5.4 seed start makes only lap 1 11.4 m; every later lap is the full 12.0 m (the wrap re-seeds v to v₀, re-zeroes the ledgers and re-anchors d — L48204-05), so every per-lap maximum is taken at d = 12.0. **Slider monotonicity checked BEFORE picking corners:** K at wrap = ½mv₀² + (F − μmg)·d has ∂K/∂m = ½v₀² − μg·d = 8 − 35.28 < 0 even at v₀ = 4 — K is DECREASING in m, so the worst corner is the LIGHTEST mass. Max K at wrap = ½·2·4² + (30 − 0.3·2·9.8)·12 = 16 + 289.44 = **305.4 J → `bar_max_J: 340`** (10% headroom; worst fill 89.8%). Max |W|: pull 30 × 12.0 = **360.0 J → `work_scale_J: 400`** (the cycle-0 scale of 360 would sit at full deflection EXACTLY, and per-step accumulation overshoots the wrap point, so the warn fires on the wrong side of the epsilon); friction at most 0.3·6·9.8·12 = 211.7 J; net at most 289.4 J. Zero overflow warns reachable at ANY teacher-reachable setting. Default-run legibility (F = 20, m = 4, v₀ = 0): K at wrap 98.9 J (29% of 340), pull 240 J (60% of 400), friction −141.1 J (35%), net 98.9 J (25%) — live, never a sliver, and the numerals carry the equality. A small-F, small-m corner (F = 5, m = 2: F < μmg = 5.88 N) honestly does not move from rest — static friction holds, bars sit on zero, which is true physics.

**(f-4) Friction declared by name everywhere:** S1, S4, S5 author `surface.frictionless: true`; S2 authors `mu_s: 0.4, mu_k: 0.4`; S3 the same pair with F = 19.6 N exactly; S6 `mu_s: 0.3, mu_k: 0.3`.

**(f-5) The §1 invariant, restated as the build's most dangerous line:** every state authors BOTH `energy_layer {bars: ["K"]}` AND its `work_accumulators` (each entry with explicit `body_id: "cart"`). Omitting either on any state silently changes the panel class, the header AND the reflow step of that state (§3).

**(f-6) `h_ref_m` NOT authored** (default 0; every state flat, U_grav identically 0, no U bar anywhere). No `E_total`, no `E_dissipated` (#9/#10 content; also keeps SEAM L's drift guard out of scope).

### (g) Macro-micro plan (Rule 33)

**N/A with rationale:** the taught relation lives entirely at the macroscopic level (a force, a distance, a speed). The micro story of S2's removed energy is #10's PRIMARY content and is deliberately not opened. **Rule 33d instruments, all live numerics:** the panel numerals per frame; HUD `v`/`F`/`f`/`a`; the d arrow's value; the billboard mass; the S5 stamp's captured pair.

### (h) Canvas budget (Rule 34)

ONE formula surface per state: S1 `W_net = ΔK` · S2 `W_net = ΔK` · S3 `W_net = 0 → ΔK = 0` · S4 `ΔK = ½mv² − ½mv₀²` · S5 `W_net = ma·d = ½mv² − ½mv₀²` (+ engine stamp beneath) · S6 `W_net = ΔK` (core form only, 38b). All Unicode: Δ U+0394, ½ U+00BD, ² U+00B2, ₀ U+2080, − U+2212, → U+2192, · U+00B7.

On-canvas caption = the delta cue only; prose lives in `#capStrip`. HUD value-only. Zone map: combined panel LEFT edge from `top: 52` (the tallest left panel in the fleet to date — **no other left-edge overlay may be authored in any state**); HUD, formula surface and slider rows in their fleet-standard right/bottom zones; corners reserved (34d).

### (i) Curriculum-flex block (Rule 38)

- **(i-1) Cut 1, hide `advanced` (S5):** S1, S2, S3, S4, S6 — coherent. The theorem is stated (S1, core), both signs shown, the net confronted, the change-from-start case kept. Nothing surviving references the flag, the stamp, `a`, or the `ma·d` chain. **Cut 2, hide `advanced` + `extended` (S4, S5):** S1, S2, S3, S6 — coherent: statement, both signs, the 16a confrontation, sandbox. Lost and named: ΔK-as-a-difference with v₀ ≠ 0 and the derivation. No surviving formula uses `v₀` (S1–S3 surfaces do not); the S6 `v0` slider glyph is backed by S2's core-ring WORD "starting speed" (ledger, §10(b)).
- **(i-2) Explore = CORE only (38b):** S6's surface is `W_net = ΔK` (S1, core); instruments are the bars taught in S1–S3 (core); controls `F` (`min_ring: core`, S1's taught cause), `v0` (`min_ring: core`, S2's launch), `m` (`min_ring: core` — the billboard mass runs from S1 and K's mass dependence is prerequisite #3). Nothing from S4/S5 (no flag, no stamp, no `a` row) appears. Every surviving control maps to a surviving state under both cuts.
- **(i-3) `curriculum_tags` are CLAIMS (38g):** CBSE/NCERT Class 11 Ch.6 (NCERT's own work-energy theorem section) — **verified** at authoring. IB DP, AP Physics 1, A-Level (AQA/OCR/Edexcel), JEE Main, JEE Advanced, NEET — all `needs_teacher_verification: true`.
- **(i-4) Presets (hide, never reorder — 38h/25d):** `full` = S1–S6 · `standard` = S1, S2, S3, S4, S6 · `intro` = S1, S2, S3, S6.
- **(i-5) Graph-axis convention:** N/A — no graph panel; the instruments are magnitude/signed bars with fixed zeros.

### Rule 41 audit of every reader-facing string

**Titles** (short, literal, front-loaded — the rail truncates): "Net work equals the kinetic energy gained" (S1) · "Negative net work removes kinetic energy" (S2) · "Only the net work changes kinetic energy" (S3) · "Change measured from the starting energy" (S4) · "The theorem comes from F = ma" (S5) · "Explore: force, mass and starting speed" (S6).

**Delta cues:** "Two bars, one number" · "Negative net work: K falls" · "Net zero: K constant" · "Measured from the start" · "Derived from F = ma" · "Change force, mass, speed". All 5 words or fewer, mutually distinct, no phrase shared with any sibling concept's cues.

**Bar captions:** `pull` · `friction` · `net` (single words — F1/F8). **Body label:** `m`. **Flag label:** `flag`.

**Banned-register sweep (carried to physics-author as a hard list):** forces do not *want, fight, win, steal, eat, give back* energy; energy is not *lost, spent, stored, carried* and does not *go* anywhere (that sentence shape is #10's question and also personifies). The bar *climbs / falls / stays on the zero line* — a bar or an energy store never *drains* (and nothing *drains* anything); the crate *speeds up / slows down / stops / turns back*; works *add up to zero* (never "cancel each other out" as a fight). "Net work", "kinetic energy", "friction" are physics vocabulary, not jargon (41b).

---

## ENGINE FIT CHECK (0d — every state mapped to a built, contracted block)

| # | Needs | Engine block (contract + reader, read at source) | Exercised by a shipped concept? |
|---|---|---|---|
| all | work bars + K bar in ONE panel | `work_accumulators` (SEAM M) rendered in SEAM L's panel below the energy group (L44977-45029); `energy_layer` (SEAM L); header branch L44918 | **Each half shipped (#1/#2 work; #3 energy). The COMBINATION is a first — RISK-A** |
| S1, S4, S5 | steady applied force, frictionless | `mode: "accelerate_applied_force"`, `applied_force {N, angle_deg: 0}` | YES — #1 throughout |
| S2 | friction-only deceleration to rest | `mode: "coast_with_friction"`, `mu_s`/`mu_k` | YES — #2 STATE_2 (m 5, v₀ 6, μ 0.4 there; fresh numbers here) |
| S3 | pull exactly balancing kinetic friction, constant v | same integrator, F authored = μmg = 19.6 N | **Never shipped as an exact balance — RISK-B** |
| S4 | applied force opposing v₀, reversal, frictionless | Branch A integrator; the CRITICAL scar documents the engine behaviour (reverses at v = 0, ledger unwinds) — here that IS the design | **Behaviour documented by the scar itself; probe as RISK-C** |
| S5 | flag stamping W and K | `checkpoints` capture enum contains `W` (#1 shipped) and `K` (#3 shipped) | **The `["W","K"]` pair is a first — RISK-E** |
| S6 | sandbox with F, m, v0 live on a rough floor | `mode: "sandbox"`, `trusted_drag_seizes`, `slider_controls`; SEAM J wrap gate reader L43942-46 | sliders all shipped (#1/#2 F+m, #3 v0); wrap re-seed CITED at source L48204-05 (v → v₀ · `nlbEnergyOnWrap` · `_dsp0` re-anchor, one statement) — **RISK-D is a verification drive, not a gate** |
| S3, S5, S6 | d arrow with value | `displacement_vector {body_id, label, show_value}` (SEAM N) | YES — #1/#2 every state |
| — | `deriveStateMeta.ts` co-edit | none: no new scenario_type, reveal key, cue time, or hold class; the energy settle floor and the loop-pin rule are already built (SEAM L/M) | zero edits |
| — | NOT used, deliberately | `body_ids` (2-group) · `angle_arc` · `F_ang` · `param_ramp` · weight arrows · `sum_merge` · `height_markers` · `U_grav`/`U_spring`/`E_total`/`E_dissipated` · `h_ref_m` · spring · pulley · `P`/`P_avg` | — |

### The five probes physics-author runs BEFORE json-author commits

- **RISK-A — the combined panel has never rendered.** Probe at iframe heights 551, 720 AND 911 (the iframe is responsive; THE EYE captures at 1280×720): drive every state; assert the panel header reads exactly `Energy and work bars`, both sections visible, every work caption renders ONE line, and every state's `.nlb_en_trk` computed height IDENTICAL across all six states — **never assert a particular value** (551 and 720 legitimately land on different rungs). Also run the standing collinearity probe (all `nlb_wk` track tops equal within 1 px).
- **RISK-B — the exact balance (S3).** Drive 10 s (5 loops); assert |v − 2.5| < 0.001 m/s throughout, the net bar's rendered value is `0.0 J` at every sampled instant (the −0.0 clamp honoured), and K holds 15.6 ± 0.1 J.
- **RISK-C — the reversal (S4).** Sample 5 instants across one loop; assert net numeral = K − 18.0 J within display precision at each; assert the net bar minimum is −18.0 ± 0.1 J at the turn; assert cycle 2 replays cycle 1 (no cross-cycle drift).
- **RISK-D — the sandbox wrap: DISCHARGED at source (cycle 1), verification drive only.** `field_3d_renderer.ts` L48194-48205 — one statement per wrap direction re-seeds `v` to the authored `v0`, calls `nlbEnergyOnWrap(eng)` (every ledger re-zeroes) and re-anchors `d` via `b._dsp0 = s1`. Remaining verification (not a gate): drive S6 at defaults 30 s and assert zero `[PM_NLB_ENERGY_SCALE]` and zero work-overflow console lines, and that after a wrap net = K − ½mv₀² holds again.
- **RISK-E — the `["W","K"]` stamp.** Pin S5 at the contracted instant; assert `#nlb_formula` carries the authored formula plus the stamp `flag:  W net = 10.0 J  ·  K = 20.0 J` (36 chars — may wrap), total 2 rendered lines at most; a wrapped stamp is acceptable, never a failure.

**No renderer edit is required by any of the five.** Each is verification of a built, contracted mechanism. A probe failing in a way that needs a renderer change IS the Phase-0 alarm — a re-scope decision, never absorbed per concept.

### Phase-0 union walk

Survey row #4: "**W accumulator + K bar (before/after)**" — consumed by every state (the before/after is S4/S5's ΔK-from-K₀ and the stamp). Declared reuses beyond the row, none needing an engine line: `checkpoints` (S5 — shipped #1/#3), `displacement_vector` (S3/S5/S6 — shipped #1), the sandbox wrap loop (S6 — shipped #1). Walked both directions: no state consumes an unbuilt capability; every unused energy-layer capability is gated OFF by absence (SEAM L/M presence-gates), so nothing half-renders.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** (1) #1 missing breaks **S1** ("why does the bar climb as it moves?") — patch clause: "the work bar climbs as the pull acts over distance — force times metres." (2) #2 missing breaks **S2** ("why is the bar below zero?") — patch clause: "friction points against the motion, so its work counts negative." (3) #3 missing breaks **S1** ("what is the right-hand meter?") — patch clause: "the K bar reads the crate's kinetic energy — the energy it has because it is moving." Each is one clause, non-condescending, placed in the state's opening sentence.

**JEE-backwards trace.** *"A 2 kg block moving at 6 m/s is pulled by a steady 10 N horizontal force along a rough floor (μ = 0.4) for 5 m. Find its final speed."*
- W of each force with its sign (+50 J pull, −39.2 J friction) — prerequisite #2, re-armed by **S3** (two signed ledgers on one screen)
- only the NET (+10.8 J) enters the theorem — **S3**
- W_net = ½mv² − ½mv₀² with K₀ = 36 J — **S4** (the change, not the total), closed form on **S4/S5**
- solve ½·2·v² = 46.8 → v = 6.84 m/s — the K arithmetic is #3, verified live by **S5**'s stamp
Every piece is delivered. "How much became heat?" is out of scope → #10; "does the path matter?" → #5.

**Misconception entry mapping (16a).** (1) *"The pull's work becomes kinetic energy"* — arrives with the student AND is planted inside this concept by S1/S2 themselves, where the one drawn bar IS the net, so watching "the force's bar" works perfectly. Flagged at the planting moment: **S1's narration must say "only one force acts, so its work is the whole net work" (one clause)**; S3 confronts. (2) *"Net work = final ½mv²"* — planted by S1–S3, where every ΔK runs from or to zero so the shortcut never fails; S4 confronts at the turn. Both mapped in §4; no EPIC-C branches.

### Block 2 — Aha-moment designation

- **PRIMARY aha (S1):** the work meter and the energy meter are the same meter. **The ten-year memory: two bars climbing in lockstep, reading the same joules on every frame — push joules in through work and they appear, one for one, as kinetic energy.** Anchored on the NUMERALS (both read 40.0 J), fills as reinforcement — the durability lesson #3's cycle taught.
- **SUPPORTING aha (S3):** a force can do 98 joules of work while the kinetic energy never moves — the theorem's W is the NET, and the net can be zero in a moving, hard-pulled body.
- **Cohesion check:** the supporting aha sharpens the primary's one subtle word ("net"). S2 and S4 are consequences (sign, and change-from-start) — deliberately not designated. Two ahas total, the sweet spot.
- **Wrong-belief setup:** for the primary — the lockstep itself is the surprise (work and energy have never been one number on screen before). For the supporting — **S1 and S2** build the confident habit "watch the force's bar, it matches K" (true in both, single-force states); S3 breaks it one state later.
- **Foundational-coverage:** S1 is inside `foundational` (STATE_1 → STATE_3); no exit-pill needed.

---

## Handoff dependencies (dispatching session, before Checkpoint B)

1. **THE CALCULATOR's channel B has landed** (§0): the K bar and the single-word work captions (`pull` · `friction` · `net`) all harvest; physics-author authors `computed_outputs` ground truth for the harvested `pull` / `friction` / `net` / `K` readings. Any numeral the harvest still SKIPs is hand-verified against §10(d) — a skip is not a pass.
2. **THE EYE `checks` block into `manifest.json`** (ch6_state.md "Before concept #4") — same-session chore, not authoring.
3. **The E3 arrow-label fix is HELD** — this concept ships against the current constants; do not take the one-line parity change here.

## Compliance lines

- **Source check:** consulted NCERT Class 11 Ch.6 chapter scope (the work-energy theorem section's placement) and HC Verma Ch.8 for teaching SEQUENCE only. No teaching method, example problem, figure or phrasing imported. The catalog's India-specific anchors are not used (pre-Rule-35).
- **Engine bug queue:** consulted this dispatch via the provided scenario dump (50 rows, §0). Every relevant `prevention_rule` satisfied at a named site. **Declared rather than discharged, FLAGGED for quality-auditor Gate 8:** the S4 AND S6 dispositions of the CRITICAL reversal row (S4: the reversal is the taught beat, adjudicated SOUND at Checkpoint A; S6: no sign claim + wrap re-zero by contract + `v0 min 0` removes the reversal corner — §0); the S4 16a numeric-contrast delivery (no ghost-bar primitive, engine-forced); the inherited friction t=0 tint scar on S2/S3/S6; the dead `work_bar_*` glow ids (engine-owned; no binding authored against them). **FLAG:** run `query_engine_bug_queue.ts work_energy_theorem` against the built JSON before verdict.
- **Rule 40:** no engine mechanism proposed → no `git log --all -S` owed. Pure JSON on the shipped renderer.
- **Boundary reconciliation:** with #3 (§1 invariant — this is the concept that turns the panel header to `Energy and work bars`); with #5 (no path language); with #10 (no destination language, no `E_dissipated`, stopping-distance number withheld).

## Self-review checklist — all items verified

Atomic claim one sentence with mechanically-greppable boundaries on #3/#5/#10 · 6 states in the medium band, each earning its place by a distinct IDEA with the derivability argument written per state · control table complete: archetype + delta + controls + ring + words per state, no archetype repeat at all (S2 = `decay-to-rest`, Ch.6-registered by #2), null-result-hold as the 16a beat, drag-sandbox explore-only, zero coined archetypes, no static state · Rule 32 plan incl. zero glow_focal argued per state (every claim is a relation) · Rule 33 N/A with rationale, every instrument live-numeric · Rule 34 one all-Unicode formula surface per state, panel zone discipline, 5-word cues · Rule 35/38f universal anchors (vehicle braking, catching a ball) with the #10 payload withheld · Rule 38 rings tagged, advanced contiguous before explore, BOTH cuts run coherent with losses named, explore core-only with min_ring on every control, tags as claims, presets derived, graph N/A · Rule 41 audit over titles/cues/captions with a banned-register list handed down · misconception_watch at exactly 2 genuine pivots · deep-dive picks 2 with 3 clusters each and the cliff-divergence documented · entry_state_map with foundational containing the PRIMARY aha · prerequisites advisory, all shipped · DoD zero TBDs, every numeric constraint computed (home poses, travel, pins, margins, scales, fills, the explore envelope over the full slider cross-product) · the six named traps each addressed in a named section (W label scheme · reflow uniformity by single-word captions · checkpoint-as-track-coordinate · multi-body camera N/A-by-design · work-bar glow ban · distinct-idea audit) · ENGINE FIT: every state mapped to a built contract with source lines, five first-exercise risks named with probes, zero renderer edits, no alarm.

---

**Handoff to physics-author.** Inputs owed: the five RISK probes (RISK-D is a 30 s verification drive — the wrap contract is cited at L48204-05), the §3 reflow probe (`.nlb_en_trk` heights IDENTICAL across all six states at iframe heights 551/720/911 — never a particular value), the exact arrow-label strings from `NLB_ARROW_DEFAULT_LABELS` L39679, narration inside the tabled word budgets honouring the Rule-41 banned list, the three cliff clauses (S1 ×2, S2 ×1) and S1's "only one force acts" planting-flag clause, per-sentence glow bindings on lightable ids only (never `work_bar_*`), `assessment` + `coverage_map`.

**json-author authors from this document's arithmetic ONLY:** every state authors BOTH `energy_layer {bars: ["K"], bar_max_J: 55 (S1–S5) / 340 (S6), precision: 1}` AND its `work_accumulators` (S1/S2/S4/S5: `net` only; S3/S6: `applied` + `friction` + `net`; every entry `body_id: "cart"`, every rendered `label` a SINGLE word — exactly `pull` / `friction` / `net` (F1/F8)); `work_scale_J` 55/55/110/40/55/400; the S5 flag as `s_m = -5.4 + 2.0 = -3.4`, `capture: ["W","K"]`; `initial_position_m` per §10(d)'s table; `surface.frictionless: true` on S1/S4/S5 and the exact μ pairs on S2/S3/S6; S3's F = 19.6 N exactly; sliders per §10(f-3) (`v0` min 0 — F4) with `min_ring: core` on all three; zero `glow_focal`, zero `body_ids`, zero weight arrows, zero `angle_arc` anywhere.

---

## Cycle 1 patch log (Checkpoint A `DESIGN_FIX` — cycle 1 of 2; all findings owner `alex:architect`)

Per the dispatch, F1/F2/F3 were independently reproduced BEFORE applying — none taken on trust.

- **F1 (reflow uniformity) — APPLIED.** Mechanism re-verified at source: the caption node (`nlb_en_sym`, L45025) is the panel's one growing child and wraps by design (L45017-25); panel height therefore tracks the tallest caption's LINE COUNT; the fit limit is `window.innerHeight − 12` of the iframe (L45123, ladder L45119-41). Structural guarantee reproduced without re-running headless: CSS never breaks a single unspaced word, so `pull`/`friction`/`net` render one line at every ladder step (`friction`, the widest, ≈ 40 px at the 13 px step-0 font < the 46 px slot), while `by the pull` wraps at its space. The reviewer's px table is internally consistent (560.5 − 545.6 = 14.9 ≈ one 13 px × 1.15 caption line) and its band follows: one-line class fits step 0 from iframe ≥ 558 (545.6 + 12), two-line only from ≥ 573 (560.5 + 12) → split band 558–572, invisible to 720-px baselines. Patched: §3 panel block (rewritten), §0 reflow row, §1 LABELLING SCHEME, §3 S3/S6 rows, §10(b), Rule 41 captions line, RISK-A (`expected 138 px` deleted — 720 would sit at step 0/186 px, so the clause could never pass under THE EYE), json-author line.
- **F2 (S4 loop-end numbers) — APPLIED, arithmetic reproduced:** v(2.6) = −3 + 3·2.6 = **+4.8 m/s** (the cycle-0 +3.8 is v at t ≈ 2.267 s — a different t than the travel table's s(2.6)); s(2.6) = 1.6 − 7.8 + 10.14 = +3.94 m ✓; K(2.6) = ½·4·4.8² = **46.08 J**; W_net(2.6) = 12 × (3.94 − 1.6) = **28.08 J**; ΔK = 46.08 − 18.0 = 28.08 ✓ — consistent once everything sits at the same t. Peak |W| 28.08 J overran the cycle-0 `work_scale_J: 25` (frac 1.12 → clamp + `[PM_NLB_ENERGY_SCALE]`, L46386-98, in a guided state §10(f-2) claims cannot warn) → re-authored **40** (deflections −45.0% / +70.2%). K on the shared 55 J bar: 83.8%; S5's 48.4 J remains the concept peak so `bar_max_J: 55` stands; pin-time values (t = 1.56 s: v = +1.68, net = −12.4) unaffected. Patched: §2 S4 row, §3 S4 row + Scales, §4 (with F5), §10(d) travel table + key numbers, (f-1) fill, (f-2), §0 quantitative-check row.
- **F3 (S6 envelope on the wrap span) — APPLIED, reproduced at source and by arithmetic:** `nlbBoundsM` L47150-67 returns `{lo: −length_m, hi: +length_m}` for this uncoupled, non-hanging body → span = 12.0 m; 11.4 m is only the seed lap (the wrap L48204-05 re-seeds v and re-zeroes the ledgers, so later laps run the full span). Monotonicity before corners: ∂K/∂m = ½v₀² − μg·12 = 8 − 35.28 < 0 → the LIGHTEST mass is the worst corner. Max K = 16 + 24.12 × 12 = **305.44 J** > the cycle-0 `bar_max_J: 300` → **340** (worst fill 89.8%). Max pull work 30 × 12 = **360.0 J** = the cycle-0 scale EXACTLY (and per-step accumulation overshoots the wrap point) → **`work_scale_J: 400`**. Friction ≤ 0.3·6·9.8·12 = 211.7 J ✓, net ≤ 289.4 J ✓. Default-run figures re-checked: 98.9 / 240 / −141.1 / 98.9 J = 29% / 60% / 35% / 25% ✓.
- **F4 (S6 vs the CRITICAL reversal row) — APPLIED:** §0 now dispositions S6 explicitly (no sign claim; ledger re-zero is the wrap contract, L48204-05; the probe's assertion is inapplicable to a wrapping sandbox by design) and the slider is **`v0 {min 0, max 4, step 1, default 0}`** — adopted rather than computing the opposing corner, because the removed corner (F = 30, m = 2, v₀ = −4; turn in 16/35.88 = 0.45 m) would mini-wrap with ledgers re-zeroing several times a second, and no state teaches a backward launch (S4 owns the reversal). S4's own disposition kept verbatim (adjudicated SOUND — not weakened).
- **F5 (S4 16a end-pose) — APPLIED:** `visual_counter` moved to the loop end (K 46.1 J beside net +28.1 J — both nonzero, different); the turn stays as the sign beat. Premise verified: S2's held rest pose already renders K = 0.0 beside a nonzero net bar, so the turn could not carry a confrontation only S4 can make.
- **F6 (RISK-D discharged at source) — APPLIED:** L48194-48205 read this cycle — one statement per wrap direction re-seeds v to v₀, calls `nlbEnergyOnWrap`, re-anchors `_dsp0`. RISK-D is now a 30 s verification drive, not a gate; the "(f-3) depends on RISK-D" sentence deleted; §0 engine-limit row and the ENGINE FIT S6 row updated to the citation.
- **F7 (S2 archetype) — APPLIED:** `decay-to-rest`, verified registered for Ch.6 at `positive_negative_zero_work/skeleton.md` L57 with exactly the condition of use S2 meets (the slow-down IS the taught content). The archetype audit now shows zero repeats; the S1/S2 contrast-pair declaration is retired (the S1-fills-40 / S2-removes-40 pedagogy is unchanged — that is content, not Rule-31 bookkeeping).
- **F8 (THE CALCULATOR statement) — APPLIED:** channel B verified landed at `src/lib/validators/numeric/readoutHarvest.ts` L180-202 with the bare-symbol gate `!/\s/.test(direct)` at L192; F1's single-word captions make `pull` / `friction` / `net` (and `K`) all harvestable; `computed_outputs` ground-truth duty handed to physics-author; a SKIP is still not a pass.
- **P3 ×4 — APPLIED:** stamp string corrected to the engine's real emission `flag:  W net = 10.0 J  ·  K = 20.0 J` (verified `nlbCpStampText` L46217-23 emits `"W " + label + " = "` per accumulator; 36 chars > the 34-char one-line precedent → RISK-E accepts a 2-line wrap) at §1 / §3 / §10(b) / §10(d) margin table / RISK-E; S4 title shortened to "Change measured from the starting energy" (Rule 41d); `drains` added to the banned-register list and swept out of the design prose (`K falls`, `the slowing phase`); S2's ~51%-at-rest stretch now explicitly acknowledged as the Checkpoint-A-flagged accepted trade.

**No disagreements:** all three load-bearing findings reproduced exactly as measured. Design intact — no new states, no re-opened decisions, the nine patch sites verified and closed.
