# SKELETON — `rolling_on_incline` (chapter `rotmech`, Class 11 Ch.7 — Systems of Particles & Rotational Motion) — REV 2 (live-queue audited)

> **Phase-0 role:** 0b spec driver for build **0c-2** (bounded rotational extension to `newtons_laws_body`). This skeleton + the physics block ARE the spec the field3d-surgeon builds against. Founder-proxy Checkpoint A runs on this document BEFORE any engine code.
> Survey: `docs/loop_runs/rotmech/phase0_survey.md` (founder-approved 2026-08-02). Concept #12 of the 14-concept spine, ★ Diamond, V1 priority. Sibling: `pure_rolling` (#11, same 0c-2 build).
>
> **Engine bug queue consultation (REV 2 — live):** live table queried via `query_engine_bug_queue.ts` (Bash grant active) + the 2026-08-02 live snapshots (32 `alex:architect` rows, 47 directive rows, 30 field_3d OPEN/DEFERRED). Every row dispositioned in the SCAR AUDIT section at the end. Renderer claims verified against `field_3d_renderer.ts` code with line numbers (per `archetype_live_tier_unverified_against_renderer`): body-count loops `:39895/:40245/:44663`, energy-layer-only `slice(0,2)` `:43247/:43356`, `controls_visible` enum `:1340`, `#nlb_formula` `:41746`, `param_ramp` `:42295`. All rolling motions are tier **[NEEDS-SCENARIO]** by construction — this document is the 0c-2 dispatch that builds them.

## 1. Atomic claim

This concept teaches that a body rolling without slipping down an incline accelerates at a rate set ONLY by the dimensionless shape factor k = I/mR² — so four shapes released together always finish in the fixed order solid sphere, disc, hollow sphere, ring, regardless of mass or radius. It does NOT teach the rolling constraint itself or the contact-point kinematics in depth (that is `pure_rolling`, which precedes it; here they appear as one compact recap beat), and it does NOT teach rotational kinetic energy as a topic (`rotational_work_energy`); the energy split appears here only as the extended-ring explanation of the race.

## 2. State count + arc

**8 states** (complex — 7–9 band; the concept carries a race phenomenon, a constraint recap, two misconception kills, an energy explanation, a derivation, and a regime switch — each a genuinely distinct picture). Depth rings per the settled Rule-38 structure: core S1–S4, extended S5, advanced S6–S7 (contiguous, immediately before explore), explore S8.

| State | Title (Rule 41 — literal, rail-truncation-safe) | Purpose (one line) | teaching_method | depth_ring |
|---|---|---|---|---|
| STATE_1 | The race: four shapes | Hook — four bodies released together on one incline finish in a fixed order, every time | straightforward beat | core |
| STATE_2 | Rolling links v and ω | Recap beat: v = Rω on screen — a rim point stops at contact, centre moves at v, top at 2v | straightforward beat | core |
| STATE_3 | The friction is static | RM-G7 kill: contact point speed is 0.00 m/s, so the friction is static, not kinetic — SEQUENTIAL contrast with a skidding block | straightforward beat (16a contrast) | core |
| STATE_4 | Mass and radius cancel | Second kill: a heavy large sphere and a light small sphere TIE — only k = I/mR² matters | straightforward beat (16a contrast) | core |
| STATE_5 | The same energy, split two ways | WHY (AP/IB/NCERT mainstream route): same drop = same total KE; the ring puts a larger share into spinning, so less into moving | straightforward beat | extended |
| STATE_6 | One formula ranks all four | a = g sin θ / (1 + I/mR²) built from τ = Iα about the contact point; slider θ confirms it live | derivation_first_principles | advanced |
| STATE_7 | Low friction: rolling becomes slipping | The regime switch: μ_s below (k/(1+k))·tan θ → the contact point slides, friction flips to kinetic | straightforward beat | advanced |
| STATE_8 | Try every variable | Sandbox — controls live per their `min_ring`, core-ring readouts only | exploration_sliders | explore |

The hook MOVES (S1 is the race itself, no static setup state). No `narrative_socratic`, no `wait_for_answer`, no `pause_after_ms` anywhere.

## 3. Per-state choreography + control plan (Rule 31 control table — FIRST design artifact)

| State | Teaches (one aspect) | Motion archetype | Distinct motion (what animates, how it differs) | Delta (= ≤5-word cue, Rule 32c) | Live controls | EN words | depth_ring |
|---|---|---|---|---|---|---|---|
| S1 | The phenomenon: shape decides the finish order | `translate-through` | Four visibly different bodies (solid sphere, disc, hollow sphere, ring — equal m = 1 kg, R = 0.15 m) roll down one incline from a common start line, **released simultaneously** (no stagger — see the multi-body framing plan below); they separate as they descend; finish-order chips light 1-2-3-4 at the bottom; loop resets and re-runs — same order every time. The AUTHORED beat needs no teacher input | "Four shapes, one ramp" | none (watch beat) | 40–50 (incl. the ≤12-word anchor sentence) | core |
| S2 | v = Rω in action (recap of `pure_rolling`) | `flow-along-path` | ONE disc rolls slowly; a marked rim point traces its cycloid, visibly pausing at each ground touch; velocity arrows at contact (0), centre (v), top (2v); readouts v and Rω stay numerically equal | "v equals R ω" | none | 30–45 | core |
| S3 | The friction at the contact is STATIC (RM-G7) | `null-result-hold` | **SEQUENTIAL contrast, never co-present** (`contrast_ghost` scar): first the locked (non-rotating) block ALONE skids down — contact slides, friction label f_k, skid trail draws; the block then DISSOLVES; only then does the rolling disc assemble and descend — contact-speed readout holds 0.00 m/s, friction label f_s, no trail. The two half-beats fire on the scenario_cue channel; at no instant are both bodies visible | "Contact point speed: zero" | none | 40–55 | core |
| S4 | Only k = I/mR² matters — mass and radius cancel | `translate-through` — **declared contrast pair with S1**: S1 = different shapes, different finishes; S4 = same shape, different m and R, dead tie | A large heavy solid sphere (m = 5 kg, R = 0.30 m) races a small light solid sphere (m = 0.5 kg, R = 0.10 m), released simultaneously; they stay exactly abreast the whole way; both k chips read 0.40; both cross the finish line in the SAME frame and both finish chips stamp "TIE". The AUTHORED beat (release → tie → chips) runs with no teacher input; the m₂/R₂ sliders are the Rule-31 contextual extra — any re-drag re-runs the race and it still ties | "Mass and radius cancel" | m₂, R₂ (of the second sphere) | 35–50 | core |
| S5 | WHY: the energy split | `cycle-compare` | Release→arrive→reset loop, solid sphere beside ring, **same 1.00 m drop** (run length d = 2.366 m at θ = 25°, m = 1 kg each); value-only readouts (Rule 33d) fill as they descend, DERIVED live from the engine's v and ω (metric: KE_trans = ½mv², KE_rot = ½Iω² = ½k·mv² under rolling, zero at release): sphere reaches `KE_trans 7.0 J · KE_rot 2.8 J`, ring `KE_trans 4.9 J · KE_rot 4.9 J`; totals identical (mgh = 9.8 J), splits different; sphere arrives first with the larger KE_trans. **NO energy bars — founder decision; numeric readouts via SEAM M only** | "Same energy, different split" | none | 40–55 | extended |
| S6 | a = g sin θ / (1 + I/mR²) | `reveal-build` | One disc held mid-slope; arrows mg sin θ, N, f_s draw in sequence; the moment arm R about the contact point highlights; the formula surface (#nlb_formula, Cambria) builds term by term (τ = Iα → a = g sin θ/(1+k)); then, still inside the authored loop, the disc releases and the live a readout matches the formula's number. All of that needs no teacher input; the θ slider is the contextual extra — dragging it re-poses and re-checks | "One formula ranks all" | θ | 45–55 | advanced |
| S7 | The slipping condition | `regime-switch` (coined — one-line justification: the taught event is a DISCONTINUOUS behavior change as μ_s crosses a threshold; no existing archetype names a threshold crossing) | Ring rolls at μ_s = 0.50; an **AUTHORED `param_ramp`** (renderer §7.1, `field_3d_renderer.ts:42295`) drives μ_s 0.50 → 0.05 over 1000–5000 ms — the archetype is discharged by the authored beat, not by the slider; the slider thumb + numeric label move in lockstep with the ramp (`ghost_compare_cause_invisible_slider_frozen` scar). The state's authored μ_s equals `param_ramp.from` = 0.50 (`field3d_param_ramp_authoring_contract`). A μ_min marker sits on the slider row; when the ramp crosses μ_min = 0.233 (~3372 ms), the contact-speed readout jumps off zero, the friction label flips f_s → f_k, a skid trail starts, and spin visibly lags translation. Teacher drags seize the ramp thereafter (Rule 37 drag-seize) | "Too little friction: slipping" | μ_s | 35–50 | advanced |
| S8 | Everything, teacher-driven | `drag-sandbox` | Teacher drives the ring-gated control set (below); race re-runs live; finish chips, v, Rω, contact-speed readouts live. Core-ring surfaces ONLY (38b): v = Rω readout + k chips; no acceleration formula, no KE split, no μ_min | "All controls live" | see min_ring table below | 0 / open | explore |

**S8 explore controls with `min_ring` (`explore_controls_not_ring_gated_survive_the_ring_cut` — fixed in this revision):**

| Control | `min_ring` | Guided state that teaches it (must survive the cut) |
|---|---|---|
| shape (per lane: solid sphere / disc / hollow sphere / ring) | core | S1 (shape decides the order), S4 (only shape survives) |
| m (selected body) | core | S4 (m₂ slider — mass cancels) |
| R (selected body) | core | S4 (R₂ slider — radius cancels) |
| θ (incline angle) | **advanced** | S6 (the only state that teaches what θ does quantitatively) |
| μ_s | **advanced** | S7 (the slip regime) |

Coherent-when-cut re-run over this list: *hide advanced* → sandbox = shape + m + R (exactly the surviving core lesson: shape decides, m and R cancel) — coherent; *hide advanced+extended* → same set — coherent. No control survives whose lesson is hidden.

**Multi-body framing plan (`nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` — fixed in this revision).** Track runs along world x (down-slope), lanes along world z. Every multi-body state authors a THREE-QUARTER camera (design values: yaw 35° off the track axis, elevation 22°, framing the full run) so the lane axis carries a strong screen-x component:

- **S1 (4 bodies):** lane gap 0.8 m (lanes at z = −1.2, −0.4, +0.4, +1.2 m). Design target at the authored camera: adjacent-lane centre separation projects to **≈ 8.5% of canvas width (≈ 110 px at 1280 px) at t = 0**, vs a body projected width of ≈ 3% (diameter 0.30 m ≈ 40 px) — adjacent screen-x extents disjoint with ≥ 70 px clearance. **No release stagger** — a stagger would falsify the taught sentence "released together" (`teach_visual_must_match_narration`); disjointness comes from lane projection alone. **Monotonicity through the loop:** lanes are ordered by finish speed in the direction of the along-track screen-x drift (sphere in the lane whose screen-x offset already leads the drift direction, then disc, hollow sphere, ring), so along-track advance only GROWS every adjacent screen-x gap — the scar row's 100 ms-sampled probe passes for the whole loop by construction. Surgeon confirms the exact camera with a 2-D solve (`camera_solve_searched_in_one_axis` — sweep yaw AND elevation), quoting the feasible band, not the argmax.
- **S4 (2 bodies, the dead heat):** lane gap 1.2 m. Projected centre separation **≈ 13% canvas width (≈ 165 px)**; projected half-width sum ≈ 54 px (diameters 0.60 m + 0.20 m) — disjoint with ≥ 110 px clearance. Because both bodies hold IDENTICAL track positions at every t, their screen separation is the CONSTANT lane projection for the entire descent — extents disjoint at every sample, and the tie stays legible three ways: the screen offset vector never changes, both cross the finish line in the same frame, both chips stamp "TIE". **Explicitly: lane offset + camera angle, no time stagger — a stagger would destroy the dead-heat reading the state exists to show.**
- **S5 (2 bodies):** same treatment as S4, lane gap 1.2 m; the sphere pulls ahead along-track, and the same speed-ordered lane rule keeps the gap monotone.
- **S3:** two bodies but SEQUENTIAL (never co-present) — the multi-body probe is N/A per instant; single-body framing on the contact point.
- **S8:** inherits the S1 four-lane camera as its home framing.
- **S2/S6/S7:** single body; camera closes on the contact point (Rule 32d — camera moves only to frame the new thing).

**Home pose + track geometry (`nlb_static_state_authored_on_the_track_bound` / `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate`):** `surface.length_m = 6.0`, θ default 25°. Every body's home pose: `initial_position_m = 0.6 m` inset from the upper track bound — ≥ 2× the largest body half-width (R = 0.30 m), so no clamp alarm can fire. The finish line is authored as **arithmetic on the home pose**: `s_finish = initial_position_m + 4.5` (S1/S4), `s_finish = initial_position_m + 2.366` (S5) — a track coordinate, never a bare displacement; the finish inset from the lower bound is ≥ 0.9 m in every state.

**Loop-reset / frozen-pin timing (both nlb timing scars — computed against the authored physics, θ = 25°, g sin θ = 4.142 m/s²; a = 2.958 / 2.761 / 2.485 / 2.071 m/s² for sphere/disc/hollow/ring; json_author re-verifies at h = 1/60):**

| State | loop_reset_ms R | Last asserted event | Event time | < 55% R? | Pin 0.60R | Margin (≥ 167 ms) |
|---|---|---|---|---|---|---|
| S1 | 6000 | ring crosses finish (d = 4.5 m) | ≈ 2085 ms (34.8%) | ✓ | 3600 ms | ≈ 1515 ms ✓ |
| S4 | 5000 | tie crossing (d = 4.5 m, a = 2.958) | ≈ 1745 ms (34.9%) | ✓ | 3000 ms | ≈ 1255 ms ✓ |
| S5 | 4500 | ring arrives (d = 2.366 m) | ≈ 1512 ms (33.6%) | ✓ | 2700 ms | ≈ 1188 ms ✓ |
| S7 | 8000 | slip onset (ramp crosses μ_min = 0.233) | ≈ 3372 ms (42.2%) | ✓ | 4800 ms | ≈ 1428 ms ✓ |

**Rule 32 legibility per beat:** cause before effect everywhere (S1/S4: release gesture → separation; S6: θ slider moves → arrows re-resolve → a readout updates after a readable beat; S7: μ_s ramp falls → μ_min marker crossed → THEN the slip begins). Only the taught variable moves per state (S5's two bodies are the taught comparison; all else holds pose). Same incline apparatus persists from a home pose across all 8 states — bodies swap by show/hide of a union-built set with **distinct body ids per role** (the S3 block is `nlb_block`, never a reused disc id — `field3d_build_once_body_reads_a_per_state_flag` scar: any build-time-consumed flag, e.g. `rotation_locked`, is constant per id). Exactly ONE glow focal per instant (S2: the rim point; S3: the contact-speed readout; S4: the k chips; S6: the formula term being built; S7: the friction label) — every glow target names a primitive the state actually builds (`ecp_glow_targets_missing_primitives`).

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots, no per-state tic)

| Wrong belief | Source | Confronted at | `misconception_watch` beat |
|---|---|---|---|
| "Rolling friction is kinetic friction" (the contact rubs, so it must be sliding friction) | Catalog RM-G7 | STATE_3 | `belief`: the wheel's contact scrubs along the ground like a sliding block. `visual_counter`: the skidding locked block (f_k label + skid trail) shown FIRST and ALONE, dissolving before the rolling disc assembles (sequential, never superimposed) — the wrong expectation's consequence, then the real physics, back-to-back in motion. `one_line_fix`: the contact point is instantaneously at rest, so the friction is static; kinetic friction appears only when the body slips (S7 closes that loop). **Named primitives that draw the wrong picture** (`field3d_rule16a_belief_unbuildable` scar): the `rotation_locked` body flag + the skid-trail primitive + the f_k label — all in the build sheet, dispatched at design time. |
| "The heavier (or bigger) body wins the race" | Standard PER + catalog | STATE_4 | `belief`: 5 kg beats 0.5 kg downhill. `visual_counter`: the two spheres stay exactly abreast for the full descent — a dead tie stamped "TIE" on both chips, re-runnable at any m₂/R₂. `one_line_fix`: m and R both cancel from a = g sin θ/(1+I/mR²); only the dimensionless shape factor survives. |

No other state carries a `misconception_watch`. EPIC-C branches: ZERO (EPIC-L-first directive; none requested).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **STATE_4** — the concept's PRIMARY aha and the historically stickiest point (students accept the race order but resist the cancellation; "surely mass matters" survives one viewing). Worth a hand-authored deep-dive.
- **STATE_6** — the derivation; the mathematical-abstraction criterion (τ = Iα about the contact point uses the parallel-axis idea implicitly; multiple documented confusion phrasings about "why divide by 1 + k").
- All other states un-flagged (Explain button → feedback form, Rule 18).

## 6. Drill-down clusters (3 candidates each; physics_author fleshes out trigger_examples)

**STATE_4:**
- `why_mass_cancels` — both the driving term (mg sin θ) and the inertia terms (m, I ∝ mR²) scale with m and R², so they divide out.
- `shape_factor_table` — where 2/5, 1/2, 2/3, 1 come from: how far the mass sits from the axis.
- `same_shape_always_ties` — any two solid spheres tie; any two rings tie; a marble ties a bowling ball.

**STATE_6:**
- `torque_about_contact_point` — why taking torques about the contact point makes friction drop out of the torque equation.
- `why_one_plus_k` — the denominator as "translational inertia plus rotational inertia, per unit mass".
- `rolling_vs_frictionless_slider` — a = g sin θ (sliding, frictionless) vs a = g sin θ/(1+k) (rolling): rolling is always slower, and friction does zero work doing it.

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_4   # "why does the sphere win", "which rolls fastest", the race
  energy:       STATE_5             # "energy split", "KE of rolling body on incline"
  derivation:   STATE_6 → STATE_7   # "formula for acceleration", "minimum friction to roll", slipping
```
Default aspect `foundational`. Cross-slice pill at the end of the foundational slice: "See WHY the sphere wins? (energy)" → STATE_5. PRIMARY aha (S4) is inside the foundational range — coverage rule satisfied, no exit-pill needed.

## 8. Prerequisites (advisory, Rule 23)

- `pure_rolling` (#11, same chapter — NOT yet shipped; authored on this same 0c-2 build before or alongside this concept) — v = Rω, contact point at rest. S2 is its compact recap.
- `moment_of_inertia` (#6 — not yet shipped, 0c-1) — without I, the k chips are noise; S4's cliff.
- `tau_eq_i_alpha` (#7 — not yet shipped, 0c-1) — S6's cliff.
- `friction_force` (SHIPPED, Class-11 Laws of Motion on this same `newtons_laws_body` scenario) — static vs kinetic vocabulary for S3/S7.
- `rotational_work_energy` (#8 — not yet shipped) — advisory only for S5; S5 states ½Iω² as one readout label, does not derive it.

Namespace check (`chemistry_concept_id_collides` scar): `rolling_on_incline` collides with no rostered physics or chemistry id.

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral) — **now a STATE assignment with a word reserve**

**Primary (assigned to STATE_1, ≤ 12 words inside its 40–50 budget — `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` scar):** the closing sentence of S1's narration: *"Try it at home: a food can beats a roll of tape."* — a can and a ring-shaped tape roll on a tilted board reproduce the race in any kitchen or classroom on Earth; physics-true at every depth (the tape roll genuinely has k ≈ 1); no brand, place, or culture. Placement pre-spoils nothing: S1's own visual already shows the outcome the sentence names. **Secondary (unassigned colour, available to physics_author for S8's opening caption only):** a bicycle wheel on a sloped path — the widest-syllabus-overlap rolling device (38f). Why it hooks: the race outcome is checkable at home in thirty seconds, and the result contradicts the "heavier wins" instinct immediately — the hook and the misconception kill are the same object. (The source catalog's 12 anchors are ALL India-specific per the survey — none imported.)

**DC Pandey check:** consulted chapter table of contents only, to confirm rolling on an incline sits in Rotational Motion and that the slipping-condition variant appears in the JEE problem set (scope metadata). No teaching sequence, no example problem, no figure, no phrasing imported. NCERT check: rolling motion is §7.14 (NCERT teaches it via the energy route — which is why the energy explanation is ringed extended, not dropped).

## 10. Definition of Done (Gate 0 — no TBDs)

**(a) States:** the 8 states of §2, exactly as tabled in §3, including the multi-body framing plan, home-pose geometry, and timing table.

**(b) Symbol-label table** (every narrated quantity → exact on-canvas label):

| Quantity | On-canvas label |
|---|---|
| Incline angle | θ (slider row "Incline θ") |
| Body velocity (CoM) | v |
| Angular velocity | ω |
| Radius | R |
| Rolling constraint readout | v = Rω (values: `v 2.40 m/s · Rω 2.40 m/s`) |
| Contact-point speed readout | `contact 0.00 m/s` (metric: \|v − ωR\|, from live engine v and ω) |
| Shape factor chip (per body) | k = I/mR² → `k 0.40` `k 0.50` `k 0.67` `k 1.00` |
| Weight component along slope | mg sin θ |
| Normal force | N |
| Static / kinetic friction | f_s / f_k |
| Acceleration readout | a (m/s²) |
| Formula surface (S6 only) | a = g sin θ / (1 + I/mR²) — on `#nlb_formula` (Cambria Math, `field_3d_renderer.ts:41746`), never the generic monospace `#formula_overlay` |
| Slip threshold (S7 only) | μ_min = k tan θ / (1+k), plus the μ_min tick on the μ_s slider row |
| Energy readouts (S5 only) | `KE_trans 7.0 J · KE_rot 2.8 J` (value-only, Rule 33d; DERIVED per the S5 metric, never authored text) |
| Friction coefficient slider | μ_s |
| Masses | m₁, m₂ |
| Finish chips | `1` `2` `3` `4` and `TIE` |

All Unicode (θ, ω, ², ·) across all three text paths (Rule 34c).

**(b′) Term-introduction ledger (`symbol_printed_on_canvas_before_the_lesson_defines_it` scar — instruments count as uses):**

| Symbol/term | DEFINED in | First USED in | OK? |
|---|---|---|---|
| finish chips 1–4 | S1 (narration names the order) | S1 | ✓ |
| v, ω, R, v = Rω | S2 | S2 | ✓ |
| contact-speed readout | S2 (the 0-arrow at contact + readout) | S2 (re-used S3/S7) | ✓ |
| f_k, f_s, skid trail | S3 (friction words typed there; S1 narration stays friction-neutral) | S3 | ✓ |
| k = I/mR² chip | S4 (chip + patch sentence) | S4 (re-used S6/S8) | ✓ — **k chips MUST NOT render in S1–S3** |
| KE_trans, KE_rot | S5 | S5 | ✓ |
| mg sin θ, N, a, the formula | S6 | S6 | ✓ |
| μ_s, μ_min, TIE chip | S7 / S7 / S4 | S7 / S7 / S4 | ✓ |

**(c) Right-hand-rule plan:** N/A — this concept teaches no direction rule (ω/L as vectors belong to `angular_momentum`, 0c-1). Declared deliberately, not omitted.

**(d) Motion plan:** every state's motion is the §3 table; nothing static, nothing asserted-but-not-rendered (S3's skid trail and S7's spin-lag are drawn, not narrated). Wheel/sphere spin is driven by the body's own position via the existing SEAM-G mechanism, extended so spin rate honours the slip state (spin lags in S7). Every archetype is discharged by the AUTHORED beat with zero teacher input (S4: the tie run; S6: the build + release + match; S7: the `param_ramp`); sliders are Rule-31 contextual extras only.

**(e) Modes:** the nlb `mode` enum is closed and contains no rolling modes — 0c-2 adds mode values (proposed: `rolling_race`, `rolling_contact`, `rolling_friction_contrast`, `rolling_energy_split`, `rolling_derive`, `rolling_slip`, reusing `sandbox`). See ENGINE REQUIREMENTS.

**(f) `assessment` + `coverage_map` + `misconception_watch`:** assessment items span race order (S1), constraint (S2), friction type (S3), cancellation (S4), speed-at-bottom ratio (S5/S6), slip threshold (S7); coverage_map maps each to its state; misconception_watch = exactly the two beats of §4.

**(g) Macro↔micro plan (Rule 33):** strict macro↔micro (lattice/carrier) structure is N/A — the mechanism here is contact-scale, not microscopic. The Rule-33d instrument duty still applies and is met: contact-speed readout (live number, S2/S3/S7), v/Rω pair, a readout, k chips, KE pair — every instrument shows a live numeric value that tracks the motion; no decorative dials. Every derived readout is specified by its METRIC, not its values (`derived_readout_asserted_by_value` scar): contact speed = |v − ωR| from the live engine pair; KE_trans = ½mv², KE_rot = ½Iω² (= ½k·mv² under rolling), zero-baselined at release; a = the engine's own integrator acceleration; the S5/S6 numbers in this document are the CHECK values those metrics must reproduce, never authored display strings.

**(h) Canvas budget (Rule 34):** per state ONE formula surface maximum (S2: v = Rω; S5: none — readouts only; S6: the acceleration formula; S7: the μ_min inequality; S1/S3/S4/S8: none); on-canvas caption = the ≤5-word delta cue from §3 only; prose narration in the strip below; HUD value-only; corners reserved per 34d — every NEW top-anchored panel (finish chips, k chips) at `top:52px+` on BOTH edges (`field3d_sliders_panel_top12` scar).

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Preset-cut coherence — checked over states AND the explore control list (§3 min_ring table):** *Hide advanced (S1–S5 + S8):* phenomenon → constraint → friction type → cancellation → energy explanation → sandbox (shape/m/R). No surviving narration/caption references the formula or the slip condition (S5 explains the race by energy alone; S4's fix-line cites the cancellation phrased "both cancel from the motion equation" without displaying the advanced formula — physics_author must keep S4's narration formula-free). *Hide advanced+extended (S1–S4 + S8):* a complete qualitative lesson; S4 stands on the demonstrated tie; sandbox = shape/m/R. Both cuts verified against every §3 caption, control, and the S8 min_ring column.
- **(i-2)** S8 surfaces CORE-ring content only: v = Rω readout, contact-speed, finish chips, k chips. No acceleration formula, no KE split, no μ_min. No explore formula surface exists at all, so no explore relation needs a deriving state under any preset (`explore_state_formula_surface_asserts_a_relation_no_state_derives` — satisfied by construction; the one explore readout relation, v = Rω, is derived in S2, core, which survives every cut).
- **(i-3) `curriculum_tags` (claims, not facts — 38g):** CBSE/NCERT: core+extended = NCERT §7.14 (energy route) — **verified at authoring** (NCERT is the backbone); advanced S6 closed form + S7 slip condition = JEE Main/Advanced — verified against the DCP problem-set index. AP Physics C: full incl. advanced — `needs_teacher_verification`. AP Physics 1: core+extended — `needs_teacher_verification`. IB DP (rigid body option): core+extended — `needs_teacher_verification`. A-level (OCR/AQA): core only — `needs_teacher_verification`.
- **(i-4) Preset proposal (hide, never reorder — 38h):** `full` = S1–S8; `mainstream` (AP1/IB/board) = hide S6–S7 (sandbox loses θ, μ_s per min_ring); `qualitative` = hide S5–S7 (same sandbox set).
- **(i-5) Graph axes (38e):** no graph panel in this concept — N/A, declared.
- **Notation ladder (38c):** core/extended surfaces are algebra-free or single-relation (v = Rω); the only compound formula sits in advanced. **Dialect (38d):** "incline" dual-labelled once as "incline (ramp)" in S1 narration, then bare.

**(j) Teacher-walk answers (`directive_no_gate_asks_whether_a_teacher_could_use_it` — answered in writing):** (1) *Does anything on screen state and show the thing the concept is named after, in the assessed representation?* Yes — S6 STATES the closed form a = g sin θ/(1+I/mR²) on the formula surface and SHOWS the live a matching it; S5 shows the NCERT/AP energy route; S4 states the governing claim (only k matters). (2) *First thing a teacher will try after the aha, demonstrable in the authored range?* Re-run S4 at the extremes — slider ranges m₂ ∈ [0.2, 10] kg, R₂ ∈ [0.05, 0.40] m all tie; then S8 pit a marble-sized sphere against a huge ring. Both demonstrable. (3) *Term ledger:* table (b′) — every define precedes every use. Declared omissions re-examined against the title: the rolling constraint's full treatment is deferred to `pure_rolling` by roster design (S2 recaps it on screen), and rotational KE is deferred to `rotational_work_energy` (S5 still shows the split live) — decisions, not exemptions.

Target: 2–3 founder rounds. Everything downstream builds to this table in ONE pass.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

1. **Prerequisite cliff.** `pure_rolling` → breaks at **STATE_2**: patch is S2 itself — one compact sentence re-stating "rolling means the contact point is momentarily at rest, so v = Rω" while the cycloid shows it (non-condescending: 10 seconds of moving recap, not a lecture). `moment_of_inertia` → breaks at **STATE_4** (the k chips): patch sentence in S4 — "k measures how far the mass sits from the axis — a ring's mass is all at the rim, so k = 1." `tau_eq_i_alpha` → breaks at **STATE_6**: patch sentence — "torque divided by rotational inertia gives angular acceleration, the rotational form of F = ma." `friction_force` (shipped) → S3 assumes the words static/kinetic; the skidding-block half of the contrast IS the patch.
2. **JEE-backwards trace.** *Question:* "A solid sphere and a ring, same m and R, roll without slipping from rest down an incline of height h. (i) Ratio of their speeds at the bottom; (ii) the minimum μ_s for the ring to roll at incline angle θ." Knowledge pieces → states: rolling constraint v = Rω → S2; total KE splits ½mv² + ½Iω² with equal drops → S5; v = √(2gh/(1+k)) / equivalently a = g sin θ/(1+k) → S6; k values per shape → S4 (chips) + S1 (order); slip threshold μ_min = k tan θ/(1+k) → S7; friction-is-static (so it does no work, legitimising the energy route) → S3. No missing piece; no state added.
3. **Misconception entry mapping (16a).** RM-G7 → confronted at S3 (beat in §4). *Planting risk:* S1's narration must never say the bodies "rub" or "grip" the slope (also a Rule 41 violation) — physics_author flagged to phrase S1 friction-neutrally; the friction word first appears in S3 where it is immediately typed correctly. Heavier-wins → confronted at S4. *Planting risk:* S1 must show four bodies of EQUAL mass and radius (labels m 1 kg, R 0.15 m visible on demand) so the race itself never suggests mass caused the order; S4 then varies m and R explicitly. No EPIC-C branches (fallback deferred, none requested).

### Block 2 — Aha-moment designation

- **PRIMARY aha (the 10-year memory):** *at STATE_4* — "mass and radius cancel: a marble and a bowling ball tie, because only the SHAPE — the dimensionless k = I/mR² — decides who wins."
- **SUPPORTING aha (1):** *at STATE_3* — "the contact point is at rest, so rolling friction is STATIC friction" (sets up the primary: static friction is the agent that converts shape into rank, and it legitimises S5's equal-energy argument since static friction does no work).
- **Cohesion check:** the supporting aha is the mechanism behind the primary (the friction couples translation to rotation; the coupling strength per unit mass IS k). No stand-alone aha candidates; the slip condition (S7) is a consequence, not a separate aha.
- **Wrong-belief setup:** for the primary — S1 builds the confident belief "the race order must come from some property of the bodies" and everyday instinct supplies "heavier/bigger"; S2 quietly shows m nowhere in v = Rω. S4 breaks it. For the supporting — S1's rolling contact plus the everyday word "friction" builds "the wheels rub, so kinetic"; S3 breaks it with the 0.00 m/s readout.
- **Foundational-coverage rule:** PRIMARY aha at S4 ∈ `foundational` (S1–S4). Satisfied; no exit-pill required.

---

## ENGINE REQUIREMENTS THIS SKELETON IMPOSES (the 0c-2 build sheet)

### (a) What `newtons_laws_body` ALREADY provides that this concept uses (no work) — verified against renderer code, lines quoted

1. **Inclined surface** — `surface.theta_deg` (0 = flat is the same code path); slope length via `length_m`.
2. **Bodies with mass / initial position / velocity** — `bodies[]`, stable IDs, union-built meshes shown/hidden per state (Rule 32d home-pose persistence for free). Body iteration loops on `bodies.length` throughout (`field_3d_renderer.ts:39895/:40245/:44663` — see FINDING 7, downgraded).
3. **Static + kinetic friction** — `mu_s` / `mu_k` per body, `surface.frictionless`.
4. **Rolling wheel mesh + position-driven spin** — SEAM G (`shape: 'wheel'`, position-driven spin incl. rewind-safe unwinding, `:40045`) — the spin-display mechanism the new shapes reuse.
5. **Force-arrow overlay, length ∝ magnitude, component resolution** — SEAM C (`arrows[]`, `show_components`) — S6's mg sin θ / N / f arrows.
6. **Live numeric readouts / teaching instruments** — SEAM M — carries v, Rω, contact-speed, a, k chips, and the S5 KE pair as VALUE-ONLY readouts (founder's no-energy-bars ruling; SEAM L untouched).
7. **Per-state contextual sliders + guided ramp + sandbox drag-seize** — `controls_visible` (`:1340/:41856–:42146`, rows hidden by `visibility:hidden` with fixed slots per the slider-row scar), `param_ramp` (§7.1, `:42295–:42318`, closed form of t_ms — pin/rewind safe), `trusted_drag_seizes`.
8. **Fixed-step real integrator** (Rule 36, trapezoid position update per the `spec_semi_implicit_euler` row) — the translational substrate the rolling branch plugs into; the rolling branch MUST preserve dt-fold exactness in position AND velocity at 1e-9.
9. **Ghost/fixed body machinery + dedicated Cambria formula panel** — `#nlb_formula` (`:41746`); S3's locked block is an ordinary integrated body with a `rotation_locked` flag (see (b)-7), distinct body id.

### (b) What the extension must ADD

*Items 1–6 are in the survey's closed union table (0c-2 rows + advanced-ring sweep); 7–8 are contract-shape items surfaced by the scar walk:*

1. **Per-body shape factor k = I/mR²** — authored per body (2/5 solid sphere · 1/2 disc · 2/3 hollow sphere · 1 ring), surfaced as a live chip label (rendered only from the state that defines k — S4 onward).
2. **Rolling acceleration branch** — a = g sin θ / (1 + k) with v = Rω driving ω (and mesh spin) from the integrator's v; f_s computed as the coupling force (f_s = k·mg sin θ/(1+k)) so SEAM-C arrows are honest. Fold-exactness preserved (see (a)-8).
3. **Contact-point velocity picture** — arrows 0 / v / 2v at contact/centre/top + marked-rim-point cycloid trace + contact-speed readout (|v − ωR|). (Union row shared with `pure_rolling` #11 — same build, not new scope.) **Trace/trail constraint:** the cycloid trace and skid trails are accumulating visuals — they must be REPLAYABLE pure functions of state-local t over a bounded lookback (the `hysteretic_state_cannot_be_latched_under_a_time_pin` pattern), never latched per-frame state, so SET_TIME_FREEZE rewinds and THE EYE pins are byte-stable.
4. **Static-vs-kinetic friction call-out** — the f_s / f_k label at the contact, switching with regime; regime itself a closed-form function of state-local t (μ(t) vs μ_min), no latch.
5. **Rolling-vs-slipping regime switch** — when μ_s < k tan θ/(1+k): translational a = g(sin θ − μ_k cos θ), rotational α from kinetic-friction torque, contact speed ≠ 0, spin visibly lags, skid trail draws. (Union table, advanced-ring sweep row #12.) The μ_min tick renders on the μ_s slider row (FINDING 11); the authored `param_ramp` drives the slider thumb + numeric label in lockstep (`ghost_compare_cause_invisible_slider_frozen`).
6. **KE_trans / KE_rot computation** exposed to SEAM-M readouts (½mv², ½k·mv² under rolling; |v − ωR|-consistent in slip) — derived from the live post-step engine state in one pass (`derived_energy_sum_pairs_prestep_position_with_poststep_velocity` discipline); **no SEAM-L change, no new bar, ever.**
7. **`rotation_locked` per-body flag + sequential contrast cueing** — S3's wrong-picture primitives, named at design time (`field3d_rule16a_belief_unbuildable` scar): a body flag that locks spin (constant per body id — never a per-state build-branch, per the build-once-flag scar), skid-trail primitive, f_k label, and show/dissolve cues on the scenario_cue channel so the two half-beats are sequential, never co-present.
8. **`controls_visible` token enum extension** — the closed enum at `:1340` (`'m'|'m2'|'F'|'F_ang'|'theta'|'mu_s'|'mu_k'|'v0'`) lacks `'R2'`, `'R'`, and the per-lane shape-picker tokens this concept's states name (`closed_enum_cannot_name_a_substance_the_design_teaches` — diffed against every §3 control cell). Extend the enum + build the rows via the existing union-over-states row builder; no deferred members (every added token is implemented in this build — `deferred_enum_members` row satisfied by having an empty deferred list).

### Phase-0 union WALK (state × union row, both directions — `phase0_union_table_asserted_not_walked_state_by_state`)

| State | Union/build rows consumed |
|---|---|
| S1 | (a)1,2,3 · (b)1,2 · F8 (4 meshes) · F7 (4 bodies) · F9 (start/finish + chips) · F10 (mode) |
| S2 | (a)1,2 · (b)2,3 · F10 |
| S3 | (a)1,2,3,9 · (b)3,4,7 · F10 |
| S4 | (a)1,2,7 · (b)1,2 · F8 (two sizes of one mesh) · F9 (TIE chip) · F10 · (b)8 (R2 token) |
| S5 | (a)1,2 · (b)1,2,6 · F9 · F10 |
| S6 | (a)1,2,5,7,9 · (b)1,2 · F10 |
| S7 | (a)1,2,3,7 · (b)3,4,5 · F11 · F10 |
| S8 | (a)1,2,3,7 · (b)1,2,3,8 · F7,F8,F9 · F10 |

Reverse check: every row (a)1–9, (b)1–8, F7–F11 is claimed by at least one state ((a)4 via S2/S1 spin display, (a)6 by every readout state, (a)8 by all); every state claims ≥1 row. Both directions closed.

### ⚠ FINDINGS — needs NOT explicit in the survey's union table (call out per the alarm rule)

7. **Body count > 2 — DOWNGRADED (dispatcher-verified against renderer code).** The 2-body limit is NOT structural: every body path loops on `bodies.length` (`:39895/:40245/:44663`); the only hard `slice(0, 2)` caps are inside `nlbApplyEnergyLayer`/`nlbUpdateEnergyPanel` (`:43247/:43356`) — the energy panel this concept does not use. Remaining work: correct the stale "1 or 2 bodies" config comment, and VERIFY (not lift) HUD/readout/label layout at 4 simultaneous bodies (label de-collision, chip rows) — a layout check, not a structural change.
8. **Four new rolling-shape meshes.** SEAM G ships ONE wheel mesh. The race requires four VISUALLY DISTINCT bodies — `shape` enum extension `'solid_sphere' | 'disc' | 'hollow_sphere' | 'ring'`, with the hollow sphere reading as hollow (cutaway or translucent shell) — the solid/hollow pair must differ VISIBLY (state-idea-distinctness scar). Real geometry work, not itemised in the union table.
9. **Finish-order chips + start/finish lines + TIE stamp.** The race payoff needs a start line, a finish line authored as a track coordinate on the home pose (§3 geometry paragraph), per-body finish chips (1…4) and a TIE stamp for S4. SEAM-M-adjacent; nowhere in the union table. New top-anchored chip panels at `top:52px+` both edges (`field3d_sliders_panel_top12`).
10. **New `mode` values + deriveStateMeta co-edit.** The nlb `mode` enum is closed; the extension adds the rolling modes of DoD (e). `deriveStateMeta.ts` is co-edited in the SAME change — all three sites (`F3D_REVEAL_KEYS` + `maxRevealForField3dState` + `deriveHoldExpectations`, per the `derivestatemeta_new_scenario_key` row), proven against both config shapes — or THE EYE false-fails every state.
11. **Slip-threshold indicator (S7).** A μ_min tick/value on the μ_s slider row so the regime switch's cause is visible before its effect (Rule 32a). Trivial, but not in the union table.
12. **(NEW in REV 2) `controls_visible` token enum extension** — see (b)-8; surfaced by diffing the §3 control cells against the actual enum at `:1340` rather than citing the seam report (`architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` — both the type declaration `:1340` and the reader `:42146` quoted).
13. **(NEW in REV 2) Multi-body race camera authoring** — per-state three-quarter camera values + speed-ordered lane assignment (§3 framing plan) as authorable state data, verified by the multibody scar row's projection probe; surgeon's camera solve sweeps BOTH yaw and elevation (`camera_solve_searched_in_one_axis`).
14. **(NEW in REV 2) Registration duty for json_author** — this concept inserts its `concept_panel_config` row (`default_panel_count=1`) in the SAME session it is authored (going-forward directive on the CRITICAL `field3d_particle_field_vestigial_dual_panel_config_gap` row), and declares motion consistently in `epic_l_path` AND `field_3d_config` (the `eye_motion_map` row's divergence trap).

Nothing else. No energy bars (founder ruling honoured), no zoom inset, no graph panel, no RHR hand. If Checkpoint A or the surgeon finds any FURTHER capability needed, that is the alarm rule firing — STOP and re-scope with the survey, never extend per concept.

---

## SCAR AUDIT (every `alex:architect` row + every relevant directive row; evidence for Checkpoint A)

| bug_class | Verdict |
|---|---|
| **alex:architect rows (32)** | |
| nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies | **fixed-in-this-revision** — §3 framing plan: off-axis camera, lane gaps, numeric projected screen separations (≈8.5% / ≈13% canvas width), monotone speed-ordered lanes; no-stagger decision justified; S4 tie legibility solved by lane offset + camera, never time stagger |
| explore_controls_not_ring_gated_survive_the_ring_cut | **fixed-in-this-revision** — §3 min_ring table (θ, μ_s = advanced; shape, m, R = core); coherent-when-cut re-run over the control list in (i-1) |
| nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control | **fixed-in-this-revision** — S4/S6 authored beats made explicit (no input needed); S7's ramp converted to an AUTHORED `param_ramp`, slider = contextual extra; DoD (d) states the rule |
| nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate | **fixed-in-this-revision** — finish lines authored as `initial_position_m + d`; `initial_position_m = 0.6` stated in the home-pose paragraph |
| nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm | **fixed-in-this-revision** — 0.6 m inset (≥ 2× largest half-width) every state; ≥ 0.9 m finish inset |
| nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula | **fixed-in-this-revision** — §3 timing table: every crossing < 42.2% of R (< 55% bound) |
| nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows | **fixed-in-this-revision** — §3 timing table: margins 1188–1515 ms ≥ 167 ms; json_author re-verifies at h = 1/60 |
| contrast_ghost_coresident_with_the_real_set_fuses_both | **fixed-in-this-revision** — S3 explicitly sequential (block alone → dissolve → disc alone), scenario_cue-driven |
| symbol_printed_on_canvas_before_the_lesson_defines_it | **fixed-in-this-revision** — DoD (b′) term-introduction ledger; k chips banned from S1–S3 |
| teach_visual_must_match_narration | **satisfied** — S5 numbers derived live and reachable (geometry corrected to h = 1.00 m so 7.0/2.8 and 4.9/4.9 J are the true engine values); S1 "released together" true (no stagger); S3/S7 trails drawn |
| oncanvas_formula_asserts_a_value_the_renderer_cannot_show | **fixed-in-this-revision** — S5 run geometry corrected (old 4.5 m run contradicted the 9.8 J totals); DoD (g) "no claim without a rendered measurement" via metrics |
| derived_readout_asserted_by_value_without_defining_its_metric | **fixed-in-this-revision** — metrics defined for contact speed, KE pair, a (DoD g); document values re-labelled as check values |
| derivation_principle_applied_to_one_beat_but_not_its_sibling | **satisfied** — every real number on screen (a, v, Rω, contact, KE) drives from the engine; the only authored constants are the k definitions themselves |
| phase0_union_table_asserted_not_walked_state_by_state | **fixed-in-this-revision** — bidirectional WALK table added |
| archetype_live_tier_unverified_against_renderer | **fixed-in-this-revision** — tier declared [NEEDS-SCENARIO]; existing-provision claims verified with file:line (`:1340/:39895/:40243/:41746/:42295/:43247/:43356/:44663`) |
| architect_declares_an_engine_limit_without_checking_the_per_concept_override_path | **fixed-in-this-revision** — F7 downgraded on code evidence (both declaration and reader lines quoted); enum limit (b)-8 likewise quoted from code, not the seam report |
| closed_enum_cannot_name_a_substance_the_design_teaches | **fixed-in-this-revision** — §3 control cells diffed against the `:1340` enum; missing tokens itemised as (b)-8; shape enum covers every body the state tables name |
| state_added_at_review_outruns_the_config_contract_shape | **satisfied** — every state shape-walked: one config object expresses each (S3's two-body sequential beat = two ids + cues; S1's four bodies = the N-body list); discipline noted for any future fix-cycle state |
| field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive | **fixed-in-this-revision** — §4 names the wrong-picture primitives (`rotation_locked`, skid trail, f_k label) as design-time build items (b)-7; S3/S4 and S1/S4 opening frames differ by far more than a caption |
| real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget | **fixed-in-this-revision** — anchor assigned to S1, ≤ 12 words reserved inside the 40–50 budget; no pre-spoil |
| lesson_never_states_the_principle_it_is_named_after | **satisfied** — S6 states the formula, S4 states the governing claim, S5 shows the assessed energy route; teacher-walk answer (j)(1) |
| concept_taught_its_own_quantity_without_the_canonical_picture | **satisfied** — assessed representations (closed-form a; energy split) both on screen; declared omissions re-examined in (j)(3) |
| narration_attributes_an_effect_to_a_cause_the_model_does_not_contain | **satisfied** — every causal sentence (energy split, cancellation, slip threshold) computed against the engine model in §3/§10; numbers checksum (9.8 = 7.0+2.8 = 4.9+4.9; μ_min = 0.233 at 25°) |
| nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger | **N/A with reason** — no applied forces, no work accumulators/bars anywhere; gravity is the only drive and always acts down-slope, so no state can reverse and unwind a ledger |
| explore_state_formula_surface_asserts_a_relation_no_state_derives | **satisfied** — S8 carries NO formula surface (value-only sandbox); its one readout relation v = Rω is derived in core S2, surviving every preset |
| teach_do_not_prespoil_a_later_reveal | **satisfied** — k hidden until S4, formula until S6, μ_min until S7 (ledger b′) |
| teach_concrete_before_abstract_compare | **satisfied** — arc is concrete race (S1) → abstract formula (S6); S5's comparison is not an "equals a simpler known result" beat, so no staged-reveal duty arises |
| teach_distinct_reference_lines_for_two_radii | **N/A with reason** — only one radius per body on screen; no R-vs-r pair exists |
| teach_coordinate_sim_with_graph | **N/A with reason** — no graph panel (declared, i-5) |
| teach_field3d_explore_grab_and_move_field_point | **N/A with reason** — field-point/charge primitive concept; nlb scenario has no field point. Drag interactivity here = the existing trusted-drag slider contract |
| teach_inverted_scenario_inverts_cutline_flags | **N/A with reason** — 0c-2 extends nlb, inverts no sibling scenario |
| chemistry_concept_id_collides_with_rostered_physics_id | **satisfied** — `rolling_on_incline` unique across both subject rosters (§8) |
| **Relevant non-architect directive / OPEN rows** | |
| field3d_param_ramp_authoring_contract (field3d_surgeon) | **fixed-in-this-revision** — S7 authored μ_s = `param_ramp.from` = 0.50, stated in the control table |
| ghost_compare_cause_invisible_slider_frozen (renderer_primitives) | **fixed-in-this-revision** — S7 ramp moves the slider thumb + numeric label in lockstep (stated in S7 row + build item (b)-5) |
| hysteretic_state_cannot_be_latched_under_a_time_pin (field3d_surgeon) | **satisfied** — build items (b)-3/4 require trails and the slip regime to be replayable closed forms of state-local t |
| spec_semi_implicit_euler_position_not_step_count_invariant (renderer_primitives) | **satisfied** — (a)-8/(b)-2 require the rolling branch to preserve trapezoid-form dt-fold exactness in position AND velocity |
| derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys (renderer_primitives) | **satisfied** — FINDING 10 mandates the three-site deriveStateMeta co-edit in the same change, both config shapes |
| field3d_per_state_slider_rows_collapsed_in_a_bottom_anchored_panel (renderer_primitives) | **satisfied** — new tokens ride the existing visibility:hidden fixed-slot row builder (`:41856–:42146`); union-over-states row build reaffirmed in (b)-8 |
| field3d_build_once_body_reads_a_per_state_flag_from_the_union_def (renderer_primitives) | **satisfied** — distinct body ids per role; `rotation_locked` constant per id (§3 legibility paragraph + (b)-7) |
| field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus (renderer_primitives) | **satisfied** — extension stays inside nlb's private apply pass; new meshes/chips register through the scenario's own index; bring-up probe asserts apparatus existence + visibility |
| field3d_sliders_panel_top12_vs_fsbtn_top10 (renderer_primitives) | **fixed-in-this-revision** — DoD (h) + FINDING 9: every new top-anchored panel at top:52px+ on BOTH edges |
| field3d_formula_overlay_generic_not_cambria_math (renderer_primitives) | **satisfied** — all formula surfaces ride the dedicated Cambria `#nlb_formula` (`:41746`), never the generic overlay (DoD b) |
| field3d_particle_field_vestigial_dual_panel_config_gap (runtime_generation, CRITICAL/OPEN) | **satisfied (going-forward duty routed)** — FINDING 14: json_author inserts the `concept_panel_config` row (panel_count=1) in the same authoring session |
| eye_motion_map_reads_cached_physics_config (visual_validator) | **satisfied** — FINDING 14: motion declared consistently in `epic_l_path` and `field_3d_config` so the maps cannot diverge |
| ecp_glow_targets_missing_primitives (json_author) | **satisfied** — §3 glow-focal list maps 1:1 to built primitives; audit duty restated for json_author |
| nlb_seized_slider_run_overruns_a_loop_sized_work_scale (json_author, FIXED) | **N/A with reason** — no work_accumulators/work_scale_J in this concept |
| derived_energy_sum_pairs_prestep_position_with_poststep_velocity (field3d_surgeon, FIXED) | **satisfied** — (b)-6 requires the KE pair derived from the same post-step state in one pass |
| explicit_linear_drag_is_unstable (field3d_surgeon) | **N/A with reason** — no drag term anywhere in the rolling model |
| contact_detected_slow_window_arms_one_frame_late (field3d_surgeon, FIXED) | **N/A with reason** — no spring/contact-compression beat |
| field3d_newtons_laws_body_surface_slab_cannot_be_hidden (renderer_primitives) | **N/A with reason** — every state uses the surface; no hidden-slab need |
| field3d_hanging_body_gravity_sign_inverted (renderer_primitives) | **satisfied (general prevention applied)** — every closed-form checksum in this document executed numerically (a-values, times, KE values, μ_min) rather than eyeballed; no hanging bodies here |
| camera_solve_searched_in_one_axis_hides_the_feasible_region (field3d_surgeon) | **satisfied** — §3 framing plan mandates the 2-D (yaw+elevation) solve with feasible-band reporting |
| field3d_hard_threshold_label_decollision_pops / field3d_pinned_rewind_last_float_bit (field3d_surgeon, FIXED) | **satisfied** — inherited engine behavior; 4-body label de-collision explicitly in F7's verify list |
| deferred_enum_members_must_be_declared (field3d_surgeon, FIXED) | **satisfied** — (b)-8: empty deferred list, all added tokens/shapes implemented in this build |
| directive_no_gate_asks_whether_a_teacher_could_use_it (ambiguous) | **fixed-in-this-revision** — DoD (j): the three teacher-walk questions answered in writing |
| teach_reveal_synced_to_narration / teach_show_quantity_live_when_named / teach_color_each_element_by_its_own_sign (physics_author) | **satisfied (routed)** — flagged in the physics_author handoff: reveals tuned to narration pacing (S6 term-by-term build, S2 arrow reveals), quantities drawn live when first named; no signed-color duty here (no charges) |
| teach_read_dense_ramp_frames / teach_auditor_reads_field3d_sliders / verification_via_applystate (visual_validator) | **satisfied (routed)** — S6/S7 in-state ramps flagged for DENSE-frame reading; auditor reads controls from field_3d_config; player-driven verification only |
| solenoid_* / eddy_currents captions / radius_scenario kerning / gauss label overlap / graph_title_caption_zorder / CACHE_UPSERT / magnetic_flux_loop / ppc_probe_points | **N/A with reason** — per-concept rows for other scenarios; their generalisable lessons (annotations gated to referents, caption/stat-box layout checks, label spacing) are inherited via the Rule-34d/label items already in DoD (h) and F7's layout verify |

---

**Self-review (REV 2):** all original checklist items still pass; the two confirmed misses are fixed (multi-body framing plan with numeric projected separations + no-stagger tie resolution; min_ring-gated explore controls with the cut re-run); the self-audit additionally corrected S5's geometry (the one place a shown number was unreachable), converted S7 to an authored param_ramp, made S3 explicitly sequential, added the term ledger, home-pose/finish-line arithmetic, timing/pin margins, anchor state assignment, teacher-walk answers, the union WALK, and two new engine findings (control-token enum, race camera authoring). F7 downgraded per dispatcher verification with line citations. Every scar row dispositioned above; none skipped.
