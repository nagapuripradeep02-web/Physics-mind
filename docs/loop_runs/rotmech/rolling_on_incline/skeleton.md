# SKELETON — `rolling_on_incline` (chapter `rotmech`, Class 11 Ch.7 — Systems of Particles & Rotational Motion)

> **Phase-0 role:** 0b spec driver for build **0c-2** (bounded rotational extension to `newtons_laws_body`). This skeleton + the physics block ARE the spec the field3d-surgeon builds against. Founder-proxy Checkpoint A runs on this document BEFORE any engine code.
> Survey: `docs/loop_runs/rotmech/phase0_survey.md` (founder-approved 2026-08-02). Concept #12 of the 14-concept spine, ★ Diamond, V1 priority. Sibling: `pure_rolling` (#11, same 0c-2 build).
>
> **Engine bug queue consultation:** this session has no Bash/SQL tool, so the live `query_engine_bug_queue.ts` could not be run. Consulted the canonical distillation `docs/FIELD3D_SCENARIO_CHECKLIST.md` (all directive rows applied: concrete-before-abstract, don't-pre-spoil, visual-matches-narration, coordinate readouts with motion) plus the nlb-specific scar list (an interaction must be a rendered object, never asserted arrows; no glow-only-delta static states; the F-ramp ban class). **FLAG to quality_auditor:** re-run the live queue query at Gate 8 as the authoritative pass. One checklist row ("sliders in the LAST state only") predates and is superseded by Rule 31 per-state contextual controls — nlb's `controls_visible` is the standing contract; this skeleton follows Rule 31.

## 1. Atomic claim

This concept teaches that a body rolling without slipping down an incline accelerates at a rate set ONLY by the dimensionless shape factor k = I/mR² — so four shapes released together always finish in the fixed order solid sphere, disc, hollow sphere, ring, regardless of mass or radius. It does NOT teach the rolling constraint itself or the contact-point kinematics in depth (that is `pure_rolling`, which precedes it; here they appear as one compact recap beat), and it does NOT teach rotational kinetic energy as a topic (`rotational_work_energy`); the energy split appears here only as the extended-ring explanation of the race.

## 2. State count + arc

**8 states** (complex — 7–9 band; the concept carries a race phenomenon, a constraint recap, two misconception kills, an energy explanation, a derivation, and a regime switch — each a genuinely distinct picture). Depth rings per the settled Rule-38 structure: core S1–S4, extended S5, advanced S6–S7 (contiguous, immediately before explore), explore S8.

| State | Title (Rule 41 — literal, rail-truncation-safe) | Purpose (one line) | teaching_method | depth_ring |
|---|---|---|---|---|
| STATE_1 | The race: four shapes | Hook — four bodies released together on one incline finish in a fixed order, every time | straightforward beat | core |
| STATE_2 | Rolling links v and ω | Recap beat: v = Rω on screen — a rim point stops at contact, centre moves at v, top at 2v | straightforward beat | core |
| STATE_3 | The friction is static | RM-G7 kill: contact point speed is 0.00 m/s, so the friction is static, not kinetic — contrast with a skidding block | straightforward beat (16a contrast) | core |
| STATE_4 | Mass and radius cancel | Second kill: a heavy large sphere and a light small sphere TIE — only k = I/mR² matters | straightforward beat (16a contrast) | core |
| STATE_5 | The same energy, split two ways | WHY (AP/IB/NCERT mainstream route): same drop = same total KE; the ring puts a larger share into spinning, so less into moving | straightforward beat | extended |
| STATE_6 | One formula ranks all four | a = g sin θ / (1 + I/mR²) built from τ = Iα about the contact point; slider θ confirms it live | derivation_first_principles | advanced |
| STATE_7 | Low friction: rolling becomes slipping | The regime switch: μ_s below (k/(1+k))·tan θ → the contact point slides, friction flips to kinetic | straightforward beat | advanced |
| STATE_8 | Try every variable | Sandbox — all controls live, core-ring readouts only | exploration_sliders | explore |

The hook MOVES (S1 is the race itself, no static setup state). No `narrative_socratic`, no `wait_for_answer`, no `pause_after_ms` anywhere.

## 3. Per-state choreography + control plan (Rule 31 control table — FIRST design artifact)

| State | Teaches (one aspect) | Motion archetype | Distinct motion (what animates, how it differs) | Delta (= ≤5-word cue, Rule 32c) | Live controls | EN words | depth_ring |
|---|---|---|---|---|---|---|---|
| S1 | The phenomenon: shape decides the finish order | `translate-through` | Four visibly different bodies (solid sphere, disc, hollow sphere, ring) roll down one incline from a common start line; they separate as they descend; finish-order chips light 1-2-3-4 at the bottom; loop resets and re-runs — same order every time | "Four shapes, one ramp" | none (watch beat) | 40–50 | core |
| S2 | v = Rω in action (recap of `pure_rolling`) | `flow-along-path` | ONE disc rolls slowly; a marked rim point traces its cycloid, visibly pausing at each ground touch; velocity arrows at contact (0), centre (v), top (2v); readouts v and Rω stay numerically equal | "v equals R ω" | none | 30–45 | core |
| S3 | The friction at the contact is STATIC (RM-G7) | `null-result-hold` | Contrast beat: first a locked (non-rotating) block SKIDS down — contact slides, friction label f_k, skid trail draws; then the rolling disc — contact-speed readout holds 0.00 m/s, friction label f_s, no trail. The "nothing slides" hold IS the physics | "Contact point speed: zero" | none | 40–55 | core |
| S4 | Only k = I/mR² matters — mass and radius cancel | `translate-through` — **declared contrast pair with S1**: S1 = different shapes, different finishes; S4 = same shape, different m and R, dead tie | A large heavy solid sphere (m = 5 kg, R = 0.30 m) races a small light solid sphere (m = 0.5 kg, R = 0.10 m); they stay exactly abreast the whole way; both bodies' k chips read 0.40; teacher drags m₂/R₂ and the re-run still ties | "Mass and radius cancel" | m₂, R₂ (of the second sphere) | 35–50 | core |
| S5 | WHY: the energy split | `cycle-compare` | Release→arrive→reset loop, solid sphere beside ring from the same height; value-only readouts (Rule 33d) fill as they descend: sphere `KE_trans 7.0 J · KE_rot 2.8 J`, ring `KE_trans 4.9 J · KE_rot 4.9 J`; totals identical, splits different; sphere arrives first with the larger KE_trans. **NO energy bars — founder decision; numeric readouts via SEAM M only** | "Same energy, different split" | none | 40–55 | extended |
| S6 | a = g sin θ / (1 + I/mR²) | `reveal-build` | One disc held mid-slope; arrows mg sin θ, N, f_s draw in sequence; the moment arm R about the contact point highlights; the formula surface builds term by term (τ = Iα → a = g sin θ/(1+k)); then the disc releases and the live a readout matches the formula's number; θ slider re-poses and re-checks | "One formula ranks all" | θ | 45–55 | advanced |
| S7 | The slipping condition | `regime-switch` (coined — one-line justification: the taught event is a DISCONTINUOUS behavior change as μ_s crosses a threshold; no existing archetype names a threshold crossing) | Ring rolls at μ_s = 0.5; μ_s ramps down; below (k/(1+k))·tan θ the contact-speed readout jumps off zero, the friction label flips f_s → f_k, a skid trail starts, and spin visibly lags translation | "Too little friction: slipping" | μ_s | 35–50 | advanced |
| S8 | Everything, teacher-driven | `drag-sandbox` | Teacher picks each body's shape, drags θ, μ_s, m, R; race re-runs live; finish-order chips, v, ω, contact-speed readouts live. Core-ring surfaces ONLY (38b): v = Rω readout + k chips; no acceleration formula, no KE split | "All controls live" | ALL (shape per body, θ, μ_s, m, R) | 0 / open | explore |

**Rule 32 legibility per beat:** cause before effect everywhere (S1/S4: release gesture → separation; S6: θ slider moves → arrows re-resolve → a readout updates after a readable beat; S7: μ_s slider falls → threshold line crossed → THEN the slip begins). Only the taught variable moves per state (S5's two bodies are the taught comparison; all else holds pose). Same incline apparatus persists from a home pose across all 8 states — bodies swap by show/hide of a union-built set (the nlb body-mesh contract), camera moves only to frame the contact point in S2/S3/S7. Exactly ONE glow focal per instant (S2: the rim point; S3: the contact-speed readout; S4: the k chips; S6: the formula term being built; S7: the friction label).

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots, no per-state tic)

| Wrong belief | Source | Confronted at | `misconception_watch` beat |
|---|---|---|---|
| "Rolling friction is kinetic friction" (the contact rubs, so it must be sliding friction) | Catalog RM-G7 | STATE_3 | `belief`: the wheel's contact scrubs along the ground like a sliding block. `visual_counter`: the skidding locked block (f_k label + skid trail) shown FIRST, then the rolling disc whose contact-speed readout holds 0.00 m/s with the f_s label — the wrong expectation's consequence, then the real physics, back-to-back in motion. `one_line_fix`: the contact point is instantaneously at rest, so the friction is static; kinetic friction appears only when the body slips (S7 closes that loop). |
| "The heavier (or bigger) body wins the race" | Standard PER + catalog | STATE_4 | `belief`: 5 kg beats 0.5 kg downhill. `visual_counter`: the two spheres stay exactly abreast for the full descent — a dead tie the teacher can re-run at any m₂/R₂. `one_line_fix`: m and R both cancel from a = g sin θ/(1+I/mR²); only the dimensionless shape factor survives. |

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

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral)

**Primary:** a food can and a ring-shaped roll of tape released together on a tilted board — the can wins, every time, in any kitchen or classroom on Earth. It is the cheapest real demonstration a teacher can perform live after showing the sim, it is physics-true at every depth (the tape roll genuinely has k ≈ 1), and it needs no brand, place, or culture to land. **Secondary:** a bicycle wheel on a sloped path — the everyday rolling object every Class 10–12 student has pushed, and the widest-syllabus-overlap device for rolling (38f). Why it hooks: the race outcome is checkable at home in thirty seconds, and the result contradicts the "heavier wins" instinct immediately — the hook and the misconception kill are the same object. (The source catalog's 12 anchors are ALL India-specific per the survey — none imported.)

**DC Pandey check:** consulted chapter table of contents only, to confirm rolling on an incline sits in Rotational Motion and that the slipping-condition variant appears in the JEE problem set (scope metadata). No teaching sequence, no example problem, no figure, no phrasing imported. NCERT check: rolling motion is §7.14 (NCERT teaches it via the energy route — which is why the energy explanation is ringed extended, not dropped).

## 10. Definition of Done (Gate 0 — no TBDs)

**(a) States:** the 8 states of §2, exactly as tabled in §3.

**(b) Symbol-label table** (every narrated quantity → exact on-canvas label):

| Quantity | On-canvas label |
|---|---|
| Incline angle | θ (slider row "Incline θ") |
| Body velocity (CoM) | v |
| Angular velocity | ω |
| Radius | R |
| Rolling constraint readout | v = Rω (values: `v 2.40 m/s · Rω 2.40 m/s`) |
| Contact-point speed readout | `contact 0.00 m/s` |
| Shape factor chip (per body) | k = I/mR² → `k 0.40` `k 0.50` `k 0.67` `k 1.00` |
| Weight component along slope | mg sin θ |
| Normal force | N |
| Static / kinetic friction | f_s / f_k |
| Acceleration readout | a (m/s²) |
| Formula surface (S6 only) | a = g sin θ / (1 + I/mR²) |
| Slip threshold (S7 only) | μ_min = k tan θ / (1+k) |
| Energy readouts (S5 only) | `KE_trans 7.0 J · KE_rot 2.8 J` (value-only, Rule 33d) |
| Friction coefficient slider | μ_s |
| Masses | m₁, m₂ |

All Unicode (θ, ω, ², ·) across all three text paths (Rule 34c).

**(c) Right-hand-rule plan:** N/A — this concept teaches no direction rule (ω/L as vectors belong to `angular_momentum`, 0c-1). Declared deliberately, not omitted.

**(d) Motion plan:** every state's motion is the §3 table; nothing static, nothing asserted-but-not-rendered (memory scar: an interaction must be a rendered object — S3's skid trail and S7's spin-lag are drawn, not narrated). Wheel/sphere spin is driven by the body's own position via the existing SEAM-G mechanism, extended so spin rate honours the slip state (spin lags in S7).

**(e) Modes:** the nlb `mode` enum is closed and contains no rolling modes — 0c-2 adds mode values (proposed: `rolling_race`, `rolling_contact`, `rolling_friction_contrast`, `rolling_energy_split`, `rolling_derive`, `rolling_slip`, reusing `sandbox`). See ENGINE REQUIREMENTS.

**(f) `assessment` + `coverage_map` + `misconception_watch`:** assessment items span race order (S1), constraint (S2), friction type (S3), cancellation (S4), speed-at-bottom ratio (S5/S6), slip threshold (S7); coverage_map maps each to its state; misconception_watch = exactly the two beats of §4.

**(g) Macro↔micro plan (Rule 33):** strict macro↔micro (lattice/carrier) structure is N/A — the mechanism here is contact-scale, not microscopic. The Rule-33d instrument duty still applies and is met: contact-speed readout (live number, S2/S3/S7), v/Rω pair, a readout, k chips, KE pair — every instrument shows a live numeric value that tracks the motion; no decorative dials. The contact-point velocity-arrow picture (0/v/2v) is the "interior story" device, per the survey's union table.

**(h) Canvas budget (Rule 34):** per state ONE formula surface maximum (S2: v = Rω; S5: none — readouts only; S6: the acceleration formula; S7: the μ_min inequality; S1/S3/S4/S8: none); on-canvas caption = the ≤5-word delta cue from §3 only; prose narration in the strip below; HUD value-only; corners reserved per 34d.

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Preset-cut coherence — checked:** *Hide advanced (S1–S5 + S8):* the lesson is phenomenon → constraint → friction type → cancellation → energy explanation → sandbox. No surviving narration/caption references the formula or the slip condition (S5 explains the race by energy alone; S4's fix-line cites the cancellation, phrased "both cancel from the motion equation" without displaying the advanced formula — physics_author must keep S4's narration formula-free). *Hide advanced+extended (S1–S4 + S8):* phenomenon + constraint + friction type + cancellation — a complete qualitative lesson; S4 stands on the demonstrated tie, S8 surfaces only core content by construction (38b). Both cuts verified against every §3 caption and control.
- **(i-2)** S8 surfaces CORE-ring content only: v = Rω readout, contact-speed, finish chips, k chips. No acceleration formula, no KE split, no μ_min.
- **(i-3) `curriculum_tags` (claims, not facts — 38g):** CBSE/NCERT: core+extended = NCERT §7.14 (energy route) — **verified at authoring** (NCERT is the backbone); advanced S6 closed form + S7 slip condition = JEE Main/Advanced — verified against the DCP problem-set index. AP Physics C: full incl. advanced — `needs_teacher_verification`. AP Physics 1: core+extended — `needs_teacher_verification`. IB DP (rigid body option): core+extended — `needs_teacher_verification`. A-level (OCR/AQA): core only — `needs_teacher_verification`.
- **(i-4) Preset proposal (hide, never reorder — 38h):** `full` = S1–S8; `mainstream` (AP1/IB/board) = hide S6–S7; `qualitative` = hide S5–S7.
- **(i-5) Graph axes (38e):** no graph panel in this concept — N/A, declared.
- **Notation ladder (38c):** core/extended surfaces are algebra-free or single-relation (v = Rω); the only formula with a compound structure sits in advanced. **Dialect (38d):** "incline" dual-labelled once as "incline (ramp)" in S1 narration, then bare.

Target: 2–3 founder rounds. Everything downstream builds to this table in ONE pass.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

1. **Prerequisite cliff.** `pure_rolling` → breaks at **STATE_2**: patch is S2 itself — one compact sentence re-stating "rolling means the contact point is momentarily at rest, so v = Rω" while the cycloid shows it (non-condescending: it is 10 seconds of moving recap, not a lecture). `moment_of_inertia` → breaks at **STATE_4** (the k chips): patch sentence in S4 — "k measures how far the mass sits from the axis — a ring's mass is all at the rim, so k = 1." `tau_eq_i_alpha` → breaks at **STATE_6**: patch sentence — "torque divided by rotational inertia gives angular acceleration, the rotational form of F = ma." `friction_force` (shipped) → S3 assumes the words static/kinetic; the skidding-block half of the contrast IS the patch.
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

### (a) What `newtons_laws_body` ALREADY provides that this concept uses (no work)

1. **Inclined surface** — `surface.theta_deg` (0 = flat is the same code path); slope length via `length_m`.
2. **Bodies with mass / initial position / velocity** — `bodies[]` (`mass_kg`, `initial_position_m`, `initial_velocity_mps`), stable IDs, union-built meshes shown/hidden per state (Rule 32d home-pose persistence for free).
3. **Static + kinetic friction** — `mu_s` / `mu_k` per body, `surface.frictionless`.
4. **Rolling wheel mesh + position-driven spin** — SEAM G (`shape: 'wheel'`, `nlbSetBodyPosition` reads spin from position) — the spin-display mechanism the new shapes reuse.
5. **Force-arrow overlay, length ∝ magnitude, component resolution** — SEAM C (`arrows[]`, `show_components`) — S6's mg sin θ / N / f arrows.
6. **Live numeric readouts / teaching instruments** — SEAM M — carries v, Rω, contact-speed, a, k chips, and the S5 KE_trans/KE_rot pair as VALUE-ONLY readouts (per the founder's no-energy-bars ruling; SEAM L untouched).
7. **Per-state contextual sliders + guided ramp + sandbox drag-seize** — `controls_visible`, `param_ramp`, `trusted_drag_seizes` (S4's m₂/R₂, S6's θ, S7's μ_s, S8's full set).
8. **Fixed-step real integrator** (Rule 36 Branch A/B) — the translational dynamics substrate the rolling branch plugs into.
9. **Ghost/fixed body machinery** — S3's locked skidding block is an ordinary integrated body with rotation locked (see (b)-6), not a new body class.

### (b) What the extension must ADD

*All items 1–6 are in the survey's closed union table (0c-2 rows + the advanced-ring sweep):*

1. **Per-body shape factor k = I/mR²** — authored per body (2/5 solid sphere · 1/2 disc · 2/3 hollow sphere · 1 ring), surfaced as a live chip label.
2. **Rolling acceleration branch** — a = g sin θ / (1 + k) with the rolling constraint v = Rω driving ω (and mesh spin) from the integrator's v; f_s computed as the coupling force (f_s = k·mg sin θ/(1+k)) so SEAM-C arrows are honest.
3. **Contact-point velocity picture** — velocity arrows 0 / v / 2v at contact/centre/top + a marked-rim-point cycloid trace + a contact-speed readout. (Listed in the union under `pure_rolling` #11 — SAME build, shared by both rolling concepts; not new scope.)
4. **Static-vs-kinetic friction call-out** — the f_s / f_k label at the contact, switching with regime.
5. **Rolling-vs-slipping regime switch** — when μ_s < k tan θ/(1+k): translational branch a = g(sin θ − μ_k cos θ), rotational branch α = μ_k g cos θ·(mR/I)·(1/R)-form (τ from kinetic friction), contact speed ≠ 0, spin visibly lags, skid trail draws. (Union table, advanced-ring sweep row #12.)
6. **KE_trans / KE_rot computation** exposed to SEAM-M readouts (½mv², ½Iω² = ½k·mv² under rolling) — explicitly sanctioned by the survey as value-only readouts; **no SEAM-L change, no new bar, ever.**

### ⚠ FINDINGS — needs NOT explicit in the survey's union table (call out per the alarm rule)

7. **Body count > 2.** The `bodies[]` contract is documented "1 or 2 bodies"; S1 needs FOUR racing simultaneously. The survey's union row says "N bodies racing one incline", so the intent is approved — but the documented 2-body limit (and anything downstream that assumes it: HUD layout, arrow map, drag-pick, readout rows) must be lifted to N = 4 for independent (no pulley/train) bodies. Flagging because the config comment and the survey wording disagree; the surgeon must treat the lift as in-scope, not incidental.
8. **Four new rolling-shape meshes.** SEAM G ships ONE wheel mesh (tyre + hub + spokes). The race requires four VISUALLY DISTINCT bodies — solid sphere, disc, ring, and a hollow sphere that reads as hollow (cutaway or translucent shell), i.e. a `shape` enum extension `'solid_sphere' | 'disc' | 'hollow_sphere' | 'ring'`. Implied by the survey's shape-factor row but never itemised as mesh work — it is real geometry work and the hollow-vs-solid sphere legibility is a design constraint (the pair must differ VISIBLY, per the state-idea-distinctness scar).
9. **Finish-order chips + common start/finish lines.** The race payoff needs a start line, a finish line, and per-body finish-order indicators (1st…4th). Small (SEAM-M-adjacent), but nowhere in the union table.
10. **New `mode` values.** The nlb `mode` enum is closed; the extension adds the rolling modes listed in DoD (e). Inherent to any nlb extension but worth naming so `deriveStateMeta.ts` is co-edited in the SAME change (mandatory per the field3d-surgeon contract — new per-state reveal/hold/motion recognition, or THE EYE false-fails every state).
11. **Slip-threshold indicator (S7).** A visual threshold marker (the μ_min value on the μ_s slider row or as a readout) so the regime switch's cause is visible before its effect (Rule 32a). Trivial, but not in the union table.

Nothing else. No energy bars (founder ruling honoured), no zoom inset, no graph panel, no RHR hand, no camera machinery beyond existing framing. If Checkpoint A or the surgeon finds any FURTHER capability needed, that is the alarm rule firing — STOP and re-scope with the survey, never extend per concept.

---

**Self-review:** all checklist items pass — atomic claim one sentence; 8 states within the complex band with justification; control table complete with archetypes/deltas/controls/budgets/rings; one coined archetype (`regime-switch`) justified; one declared contrast pair (S1/S4) with the flip named; 2 misconception beats only; 2 deep-dive picks with 3 clusters each; entry_state_map with foundational containing the PRIMARY aha; advisory prerequisites with shipped-status; universal anchor; DoD complete with zero TBDs; both preset cuts checked; bug-queue consultation done via the canonical checklist distillation with a Gate-8 re-run flag (noted at top).
