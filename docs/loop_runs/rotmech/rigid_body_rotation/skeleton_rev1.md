# Skeleton — `rigid_body_rotation` (rotmech · Class 11 Ch.7 · concept #3) — REV 1

> **Status:** Phase-0b DESIGN PASS on a BLOCKED concept (desk C, wave 2). This concept renders on
> the **rbr scenario** (the field_3d `scenario_type` that happens to share its name — throughout
> this document "the rbr scenario" means the renderer surface at `field_3d_renderer.ts:939` /
> `:49736–50790`, and "this concept" means the lesson being designed). The concept is blocked on
> build **0c-3**; the purpose of this pass is a precise, walkable engine requirement list so that
> when 0c-3 merges, the build starts at `json-author`.
> **Tiering discipline:** every motion carries `[LIVE]` (verified in the renderer THIS session,
> with file:line) or `[NEEDS-0c-3]` (named engine row). Nothing is split between.
> **Bug-queue consultation (2026-08-04, LIVE table via Bash):** see SCAR AUDIT §"Queries run".
> **DC Pandey check:** chapter table of contents only. No teaching method, example problem, or
> figure imported. NCERT §7.1 (rigid body) / §7.6 confirm scope.
> **Namespace check:** `rigid_body_rotation` appears in neither `src/data/concepts/` nor
> `src/data/concepts/chemistry/` — no collision (the *scenario_type* of the same name is a
> renderer identifier, not a concept JSON).
> **Cross-desk prior art (Rule 40a):** `git log --all -S` found Desk D's engine findings
> (commit `c677482`, `_engine/findings_d.md`) whose §4 already asks for the tangential v = ωr
> arrow + circular trace THIS concept needs. This skeleton's engine rows are written to LAND ON
> the same build items, one semantics, built once (scar
> `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field`).

---

## 1. Atomic claim

This concept teaches ONE thing: **a rigid body is a body whose internal distances never change,
so when it turns on a fixed axis every point of it moves in its own circle around the axis, all
points complete each turn together — one shared turning rate ω — and therefore a point farther
from the axis moves faster: v = ωr.** It does not cover ω = dθ/dt, α, or the rotational
kinematic equations (`rotational_kinematics`, #4 — which USES v = ωr as taught vocabulary), how
mass distribution enters (I = Σmr², `moment_of_inertia`, #6), or L = Iω (`angular_momentum`,
#9, in flight on this same desk — none of its material is taken). The advanced ring states the
decomposition *general motion = motion of the centre + rotation about the centre*; the parabola
of a thrown body's centre belongs to `motion_of_centre_of_mass` (#2) and is NOT staged here.

## 2. State count + arc — 7 states (6 guided + 1 explore)

Complexity call: **medium-plus**. The core is genuinely medium (definition → circles → the
same-time aha → v = ωr = 4 guided beats); the extended whole-body beat and the advanced
general-motion decomposition (the survey's row-#3 advanced ring) add two more. 7 total.

The apparatus is the chapter's ONE machine (APPARATUS_CONTRACT §1, binding): the turntable —
axle, brake drum, rod, two 2.0 kg masses — opening from the **home pose r = 0.80 m,
ω = +1.50 rad/s, m = 2.0 kg, τ_brake = 0** (I = 3.06 kg·m², L = 4.59 kg·m²/s, KE = 3.44 J,
authored explicitly per the contract). **The masses never move in this concept** — sliding them
changes I and, under the L-conserving engine (`rbrOmegaAt` = L/I, `:49945`), changes ω: that is
`conservation_of_angular_momentum`'s aha (#10, DESIGN_OK on Desk A) and this concept must not
stage it. Everything this concept adds moves ON the spinning body: **marked points, traces,
arcs, velocity arrows** — massless annotations that never enter I (`rbrIOf`, `:49865`, reads
only the mass pair; the marker contract in engine row C1 states masslessness explicitly).

The entire apparatus — drum, rod, masses — spins as ONE spin-group (`rbr_spin`, `:50298-50302`):
the machine itself IS the rigid body under study. No body_shape swap is needed anywhere: the
drum face IS the disc for the whole-body beat (§3 S5), so `body_shape` variants (`'disc'`,
`'ring'`, `'rod'`, `'sphere'` — declared-inert at `:982`) are **NOT required by this concept**
(a scoping finding mirrored to `_engine/findings_c.md`).

**Authored numeric ground truth (2 dp everywhere, no two displayed numerals collide):**
marked points on the rod at r = 0.30 (P₁), 0.60 (P₂), 0.90 (P₃) m — all on material (rod
half-length 1.00 m) and clear of the masses (0.80). At ω = 1.50 rad/s: chord P₁P₂ = **0.30 m**,
cross-gauge P₂→far mass = **1.40 m** (S1); over the S3 compare window Δt = 1.80 s the swept
angle is 2.70 rad, so arcs s₁ = **0.81 m**, s₂ = **1.62 m** (exactly 2×); speeds v = **0.00 /
0.45 / 0.90 / 1.35 m/s** at r = 0 / 0.30 / 0.60 / 0.90 (a 0:1:2:3 ladder) (S4); drum-face dot
speeds **0.15…0.75 m/s** with only the innermost, outermost and one rim dot labelled (S5).
One revolution = 4.19 s. Displayed-numeral audit: {0.30, 1.40} · {0.81, 1.62} · {0.00, 0.45,
0.90, 1.35} · {0.15, 0.75} · ω 1.50 — no cross-state confusable pair (0.90 m/s and the S3 arc
values never co-display; S3's highlights clear on S4 entry).

| State | Title (Rule 41 — literal, first words carry meaning) | Purpose | teaching_method | Ring |
|---|---|---|---|---|
| S1 | A rigid body: distances stay fixed | Definition shown as a held measurement | *(straightforward beat)* | core (qualitative) |
| S2 | Every point moves in a circle | Per-point circular traces | *(straightforward beat)* | core (qualitative) |
| S3 | Outer points travel farther in the same time | THE PRIMARY AHA + ω introduced | *(straightforward beat)* | core (qualitative) |
| S4 | Speed equals ω times r | The quantitative rule, v = ωr, zero at the axis | *(straightforward beat)* | core (quantitative) |
| S5 | The whole disc follows the same rule | Generalize from 3 points to every point | *(straightforward beat)* | extended |
| S6 | Moving and spinning at once | General motion = slide of centre + spin about centre | *(straightforward beat)* | advanced |
| S7 | Try it yourself | Sandbox | `exploration_sliders` | *(explore — ring-gated controls)* |

**Rule 38a — both clauses:** ladder reads qualitative (S1–S3) → quantitative (S4) → extended
(S5) → advanced (S6, a contiguous single-state block immediately before the explore) ✓.
`advance_mode`: S1–S6 `manual_click`, S7 `interaction_complete` (Gate 12: 2 distinct modes) ✓.

## 3. Per-state choreography + control plan (Rule 31 control table)

**Coined archetypes (three, each justified once):**
- `trace-draw` (S2) — points paint their own paths as the body carries them; the growing trace
  IS the picture. No seed archetype covers self-recording motion.
- `arc-compare` (S3) — two swept arcs grow simultaneously from one shared start line over the
  same time window and are compared at the same instants. `cycle-compare` contrasts phases of a
  loop; this contrasts two elements inside ONE interval, which is the whole content of the aha.
- `populate-rule` (S5) — a rule shown on few elements is repainted across the entire body (a
  radial line of dots + a rim ring of dots). The distinct picture is the rule at population
  scale, not any one element.

**Archetype-discharge rule (scar `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control`):**
every archetype is discharged by motion the authored beat produces with NO teacher input,
between t = 0 and loop end. The spin itself runs continuously in every state (engine `[LIVE]`),
so no state is static even while an overlay reveals.

| State | Teaches (one idea) | Archetype | Authored beat (cause then effect; tier tags inline) | Delta cue | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|
| S1 | Rigid = every internal distance stays the same while the body moves | `null-result-hold` | Turntable spins at the home pose `[LIVE :49945/:50671]`. Two marked points appear on the rod — P₁ (r = 0.30), P₂ (r = 0.60) — each a dot + label `[NEEDS-0c-3 C1]`; then two distance gauges draw: P₁–P₂ = 0.30 m and P₂–far-mass = 1.40 m, each with a live length label `[NEEDS-0c-3 C5]`. The body keeps turning; the numbers HOLD to the last digit — the deliberate nothing-changes beat. Narration states the definition in plain words: "a rigid body: the distances between its points never change" | **"One body, fixed distances"** | none | 30–45 | core |
| S2 | Every point of the body moves in its own circle about the axis | `trace-draw` (coined) | Gauges hide; P₁ and P₂ each paint a circular trace as the body sweeps one full revolution (4.19 s), inner circle small, outer circle large, concentric `[NEEDS-0c-3 C3]`. Traces persist. Anchor here (~8 words, no speed claim): "each point of a ceiling-fan blade draws its own circle" | **"Each point draws a circle"** | none | 25–45 | core |
| S3 | All points complete the turn together — one ω — so the outer point covers more distance in the same time (PRIMARY AHA) | `arc-compare` (coined) | A fixed start line appears on the base frame, crossing both traces `[NEEDS-0c-3 C4]`. CAUSE: the compare window opens (1.0 s in) — EFFECT after a readable beat: both swept arcs highlight and GROW together for the same Δt = 1.80 s, the outer visibly outrunning the inner; at window close the labels land: s₁ = 0.81 m, s₂ = 1.62 m `[NEEDS-0c-3 C4]`. Then both points cross the start line at the SAME instant (one full turn together). Narration introduces ω: "the body has one turning rate ω (angular speed)"; the HUD ω row reveals only after that sentence (`readout_at_ms` `[LIVE :50234-50241]`, row `[LIVE :50149]`). Anchor (~9 words): "on a merry-go-round, the rider at the edge moves fastest" | **"Same time, longer outer path"** | none | 40–55 | core |
| S4 | The rule is exact: v = ωr — zero at the axis, growing in proportion to r | `reveal-build` | The S3 highlights clear; traces stay. Four tangential velocity arrows + live value labels build one per narration sentence at r = 0 (a marker ON the axle: no arrow, label 0.00 m/s — the true zero), P₁ 0.45, P₂ 0.90, P₃ 1.35 m/s `[NEEDS-0c-3 C1, C2]`; the arrow tips line up along a straight envelope — the linear rule made visible. The single formula surface shows **v = ωr** `[LIVE :50570-50574]` | **"Speed grows with radius"** | none | 35–55 | core |
| S5 | Not just marked points: EVERY point of the body obeys v = ωr | `populate-rule` (coined) | Camera lifts to read the drum face (`[NEEDS-0c-3 C8]`, fallback: default view acceptable). On the drum: a radial LINE of five dots (r = 0.10 to 0.50) and a RIM RING of eight dots (all at r = 0.50) `[NEEDS-0c-3 C1]`. The dot line stays perfectly straight as it sweeps (rigidity restated at scale); v arrows grade along the line `[NEEDS-0c-3 C2]` — only the innermost (0.15 m/s) and outermost (0.75 m/s) line dots and ONE rim dot (0.75 m/s) carry labels (Rule 34); the rim arrows are all equal: same r, same v | **"Whole disc, same rule"** | none | 30–50 | extended |
| S6 | General motion = the centre slides + the body spins about the centre; distances STILL fixed | `translate-through` | The rod (with masses + markers) lifts off the axle and glides across the scene at constant velocity while it keeps spinning `[NEEDS-0c-3 C7 — shared with the engine row of #2]`; the centre point traces a straight line while P₂ traces a looping curve `[C3 on the translating frame]`; the P₁–P₂ gauge stays pinned at 0.30 m through the whole glide `[C5]`. A co-moving highlight circle then shows P₂ still just circling the centre `[C7]`. Loop: a brief blank, the rod returns to the axle, the glide replays. Wording literal (no "thrown" — nothing falls here): "take the rod off its axle and set it moving" | **"Slide plus spin combined"** | none | 35–55 | advanced |
| S7 | Sandbox | `drag-sandbox` | Free-running (Rule 37). Controls: **ω₀** slider `[LIVE :49999]` — a change re-initialises the spin via the restart path `[LIVE :50053-50064]` with the 500 ms re-pin blank `[LIVE :49896]`, all v arrows and labels growing TOGETHER (one ω); and **a draggable marker radius r_point** (range 0.00–0.95 m) `[NEEDS-0c-3 C6]` — dragging it slides one marker along the rod, its circle, arrow and live label scaling continuously (no restart: markers are massless, I never changes). Idle auto-sweep on r_point until first trusted input `[C6; the sweep plumbing consumes only param "r" today — verified :49852/:49858]`. Formula surface: v = ωr (core, derived by S4 under every preset). **Deliberately NOT exposed: r, m, tau_brake** — r and m re-shape I and stage the conservation aha of #10; the brake stages torque (#5/#7/#13) | **"Try it yourself"** | ω₀ *(min_ring: core)* · r_point *(min_ring: core)* | 0 / open | *(explore)* |

**Archetype audit:** null-result-hold (S1), trace-draw (S2), arc-compare (S3), reveal-build
(S4), populate-rule (S5), translate-through (S6), drag-sandbox (S7). No repeat, no static state.

**Rule 32 legibility plan:** cause-first sequencing stated per beat above (the S3 window opens
before the highlights grow; the S4 arrows land one per sentence). Only the taught annotation
layer changes per state — the apparatus pose and the mass positions never change until the S6
advanced detach, which is itself the taught thing (32b). Delta cues double as captions (32c).
One apparatus from one home pose; camera moves only to frame the drum face in S5 and the glide
in S6 (32d). Exactly one glow focal per instant, staged via `phases[]` `[LIVE :50647-50656]`;
**markers, traces and gauges join the brighten-only solid set** (`:50782-50788` pattern) so a
compare beat never dims one of its own compared elements (scar
`state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach`) (32e).

**Rule 33 macro-micro:** N/A-with-justification — the taught variable IS the visible motion of
visible points; there is no hidden micro mechanism. Instruments (33d): the ω HUD row (live,
2 dp) and the per-marker live v labels are the instruments, each at the point it describes.

**Rule 34 canvas budget:** top caption = the delta cue only. ONE formula surface per state:
S1–S3 none · S4 **v = ωr** · S5 **v = ωr** (the same rule restated over the population — same
closed form, no second relation) · S6 none · S7 **v = ωr**. All labels real Unicode (ω, the
subscripts ₁ ₂ ₃, m/s); the rbr formula surface is already Cambria Math `[LIVE :49747, :50448]`.
Marker labels: value-only. HUD: value-only (`:50144-50154`).

**Readout metrics (scar `derived_readout_asserted_by_value_without_defining_its_metric`):**
ω = the engine global `PM_rbrOmega` = L(t)/I(t) `[LIVE :49945, :50231]` — constant 1.50 here
since no state authors any torque. Per-marker v_i = `PM_rbrOmega` times r_i, computed from the
same per-frame snapshot (C2 contract). Arc s_i = r_i times the swept angle on the engine
integrator θ (`rbrThetaAt` `[LIVE :49952]`) (C4 contract). Gauge lengths: 0.30 m for the
collinear P₁P₂ pair and 1.40 m for the opposite-side P₂ to far-mass pair (collinear through the
axis: 0.60 + 0.80) — constant by construction; their constancy under spin and under the S6
glide IS the taught claim (C5 contract).

**Pin-margin table (pin = clamp(0.60R, 150, R−150); every margin at least 10 frames = 167 ms;
times name the LAST asserted reveal, not the phase start — scar
`skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal_inside_it`):**

| State | Last asserted reveal complete (design est.) | Loop period R (min) | Pin at 0.60R | Margin |
|---|---|---|---|---|
| S1 | second gauge label ~3.0 s | at least 8 s | 4.8 s | 1.8 s ✓ |
| S2 | both traces closed at 1 rev + 1 s reveal lead = ~5.2 s | 10 s | 6.0 s | 0.8 s ✓ |
| S3 | arc labels 3.2 s; simultaneous start-line crossing ~5.2 s | 10 s | 6.0 s | 0.8 s ✓ |
| S4 | fourth arrow + label ~5.0 s | 10 s | 6.0 s | 1.0 s ✓ |
| S5 | rim-dot label ~4.5 s | 9 s | 5.4 s | 0.9 s ✓ |
| S6 | co-moving highlight lands ~6.0 s (detach 0.8 s, glide 3.5 s) | 12 s (then loop blank + replay) | 7.2 s | 1.2 s ✓ — the pin lands BEFORE the first loop reset, so the reset can never blank what the pin photographs |
| S7 | free-running, no pin contract (Rule 37) | — | — | — |

physics_author recomputes these at the engine step size. THE EYE must read DENSE frames across
the S2 trace growth and the S3 compare window, not only the frozen end-state (scar
`teach_read_dense_ramp_frames_not_just_frozen`).

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots)

| Wrong belief | At | `misconception_watch` beat |
|---|---|---|
| "A point farther from the axis takes longer to get around" (longer path conflated with more time) | **S3** | belief: the outer point has more distance, so it must finish later · visual_counter: after sweeping visibly different arcs (0.81 vs 1.62 m), BOTH points cross the fixed start line at the same instant · one_line_fix: every point of a rigid body completes each turn together — one body, one turning rate ω |
| "Every point of one spinning body moves at the same speed" (one body means one motion means one speed) | **S4** | belief: it is one object, so all of it has one speed · visual_counter: four live speed labels on one body at one instant — 0.00, 0.45, 0.90, 1.35 m/s — with the axle point not moving at all · one_line_fix: one ω is shared; v = ωr grows with distance from the axis |

Named buildable primitives for each wrong picture (scar
`field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive`): S3 needs the start line +
swept-arc highlights + labels (C4) on the live traces (C3); S4 needs markers (C1) + v arrows
with true-zero (C2). S1, S2, S5, S6, S7 carry NO misconception_watch. EPIC-C branches: **zero**.

## 5. `has_prebuilt_deep_dive` states (2)

**S3** (the primary aha; period-vs-speed confusion is the historic sticking point) and **S4**
(the quantitative rule; where exam use concentrates). Cache-hint only; V1.0 ships zero authored
deep-dives (Rule 18).

## 6. Drill-down clusters

**S3:** `outer_point_takes_longer` · `one_omega_all_points` · `arc_length_vs_time`.
**S4:** `v_equals_omega_r_use` · `axis_point_speed_zero` · `omega_vs_v_confusion`.

## 7. `entry_state_map`

```
entry_state_map:
  foundational:   STATE_1 -> STATE_4   # definition, circles, the aha, v = ωr
  whole_body:     STATE_5
  general_motion: STATE_6
```

Default `foundational`. PRIMARY aha (S3) inside the foundational range ✓; the quantitative rule
(S4) also lands on the default slice.

## 8. Prerequisites (advisory — Rule 23)

`uniform_circular_motion` (SHIPPED — a single particle circling; this concept extends it to
every point of one body) · `centre_of_mass` (#1) and `motion_of_centre_of_mass` (#2) — advisory
for S6 only; both are in-chapter, precede this concept in the approved teaching order, and are
NOT yet shipped. **Same open founder ruling as the desk-state file records for
`angular_momentum`:** a `prerequisites` array naming registered-but-JSON-less ids needs the
ruling before seal, not at seal.

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral)

**Primary: a merry-go-round — the rider at the edge moves fastest, yet everyone completes the
turn together.** Assigned to **S3**, ~9 words reserved in its budget — it lands ON the aha it
illustrates, pre-spoiling nothing. Universal playground apparatus, recognisable in any country.
**Secondary: a ceiling-fan blade — each point of the blade draws its own circle.** Assigned to
**S2**, ~8 words; deliberately makes NO speed claim (the S3 reveal stays intact). Both are
widest-syllabus-overlap devices for this physics (38f); no region constants anywhere. The
catalog India-specific anchors (Bharatnatyam, ISRO, the Indian potter's-wheel framing) are NOT
imported.

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 7 of §2, exactly as tabled in §3.

**(b) Symbol-label table + term-introduction ledger:**

| Quantity | Label | DEFINED at | First PRINTED at | ✓ |
|---|---|---|---|---|
| Marked point 1 | `P₁` (dot + label) | S1 ("we mark two points of the body") | S1 | ✓ |
| Marked point 2 | `P₂` | S1, same sentence | S1 | ✓ |
| Distance gauges | `0.30 m` / `1.40 m` value labels | S1, the distances sentence | S1 | ✓ |
| Circular trace | (drawn path, per-marker colour) | S2, "each point draws a circle" | S2 | ✓ |
| Start line | label "start" | S3, the same-time sentence | S3 | ✓ |
| Arc lengths | `s₁ = 0.81 m` / `s₂ = 1.62 m` | S3, at window close | S3 | ✓ |
| Angular speed | `ω` (HUD `1.50 rad/s`) | S3, "one turning rate ω (angular speed)" — dual-label once (38d), bare after | S3, after that sentence (`readout_at_ms`) | ✓ |
| Axle point | `0.00 m/s` label (no arrow — true zero) | S4, "the point on the axle does not move" | S4 | ✓ |
| Marked point 3 | `P₃` | S4 ("a third point, farther out") | S4 | ✓ |
| Speed | `v` value labels (`0.45 / 0.90 / 1.35 m/s`) + formula `v = ωr` | S4 | S4 — never earlier | ✓ |
| Drum dots | line + rim dots, labels `0.15` / `0.75 m/s` | S5 | S5 | ✓ |
| Centre point | label "centre" | S6, "the centre point of the body" | S6 | ✓ |

json_author note: every teacher_script glow target must name a primitive the state builds;
glow-target set is a subset of built object ids. **`readouts[]` may name ONLY `omega` from
`RBR_RO_META` (`:50147`) — authoring a `v` (or any unknown) token is FORBIDDEN:
`rbrRebuildReadout` (`:50162`) and `rbrWriteReadouts` (`:50236`) skip unknown tokens in
silence** (the desk-state blocked-concept trap; the v-readout ruling below is the design
answer).

**(c) Right-hand-rule plan:** N/A-with-justification — this concept teaches no direction rule.
The direction of ω/L along the axis belongs to `angular_momentum` (#9); teaching it here would
take material from that concept.

**(d) Motion plan:** S1 spin + marker/gauge reveal with held values · S2 traces painting over
one revolution · S3 window-open, arcs grow, labels, simultaneous crossing · S4 four arrows
building the linear envelope · S5 dot-line sweeping straight + graded arrows · S6 detach,
glide + spin, straight centre trace vs looping point trace, co-moving circle · S7 free-run +
idle r_point sweep. No passive state; no claim without a rendered measurement (§3 metrics);
every stated agent is a rendered object.

**(e) Modes:** conceptual-only (Rule 20 [D]).

**(f)** `assessment` + `coverage_map` authored at 0d; `misconception_watch` exactly the 2 of §4.

**(g) Macro-micro:** N/A-with-justification per §3.

**(h) Canvas budget:** per §3. New DOM/sprite surfaces follow the rbr zone map (`:50435-50466`);
any new panel at `top:52px+`.

**(i) Curriculum-flex (Rule 38):**
- **(i-1) Preset-cut coherence:** *Hide advanced (drop S6):* S1–S5 + S7 — coherent; no surviving
  state references the glide; the S7 controls map to S3/S4 (ω₀) and S4 (r_point) ✓. *Hide
  advanced+extended (drop S5–S6):* S1–S4 + S7 — coherent; the definition, the aha and the rule
  all survive; nothing surviving references the drum-face population or the glide ✓.
- **(i-2)** Explore surfaces CORE content only: formula `v = ωr` (stated by S4, core, surviving
  every preset) ✓; both explore controls are min_ring core ✓.
- **(i-3) `curriculum_tags` (claims, not facts):** CBSE/NCERT — covered (NCERT Ch.7 §7.1/§7.6),
  marked verified. JEE Main core+extended · NEET core · IB DP / A-level / AP Physics 1 — every
  cell `needs_teacher_verification: true`.
- **(i-4) Presets:** `full` = S1–S7 · `no_general_motion` = hide S6 · `core_only` = hide S5–S6
  (controls unaffected — both are core; hide, never reorder).
- **(i-5) Graph axes:** no graph in any ring — N/A by design.

**Teacher-usability walk (scar `directive_no_gate_asks_whether_a_teacher_could_use_it`):**
(1) *Does anything state the principle and show it in the assessed representation?* Yes — S1
states the rigid-body definition in its exam wording; S4 states and shows v = ωr with the
numbers a ratio question uses. (2) *First thing a teacher tries after the aha?* "What about a
point even farther out, or right at the axle?" — the S7 r_point drag covers 0.00–0.95 m
continuously, including the true zero. (3) *Definition precedes use?* Yes — ledger §10(b).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `uniform_circular_motion` → S2: a student who has never seen a single
particle circle is patched by one clause ("each point moves like the single circling ball you
have seen — but now they are all fixed together"). `centre_of_mass` → S6: one clause patches it
("the centre — the balance point of the body") without condescending. No other cliff: the S1
definition is self-contained.

**JEE-backwards trace.** *"A disc rotates uniformly about its fixed axis. Points P and Q are at
r and 3r from the axis. Find (i) the ratio of their angular speeds, (ii) the ratio of their
linear speeds, (iii) the speed of a point ON the axis."* (i) 1:1 — one ω → S3 (shown by the
simultaneous crossing). (ii) 1:3 — v = ωr → S4 (the 0.45/1.35 pair IS this ratio, performed on
screen). (iii) zero → the S4 axle marker. Distractor "the outer point takes longer" → the S3
watch beat. Conceptual variant "is the path of a rim point a circle?" → S2 (fixed axis: yes);
a ROLLING wheel is out of scope (deferred to #11 `pure_rolling`, different scenario). No
missing piece.

**Misconception entry mapping.** Both beliefs confronted proactively per §4. Planting risk: the
S2 narration must not say the points "move together" without qualification — a student can hear
"same speed"; physics_author writes "they turn together" (a time claim, not a speed claim), and
S3 then makes the time/speed split explicit two clicks later.

## Block 2 — Aha-moment designation

- **PRIMARY aha, at S3:** *every point of a spinning body finishes the turn at the same moment —
  so the outer point, covering more distance in the same time, MUST be moving faster.*
- **SUPPORTING aha, at S4:** *the trade is exact and linear — v = ωr, from zero at the axle
  upward in proportion.* Total = 2.
- **Cohesion check:** the supporting aha quantifies the primary; nothing stands alone.
- **Wrong-belief setup.** Primary: S1+S2 deliberately build "it is one body moving as one
  thing" (the rigidity beat makes the student CONFIDENT in oneness) — S3 breaks the "one speed"
  half while keeping the "one turn" half. Supporting: S3 leaves "faster, but by how much?"
  open; S4 answers before the student can wrongly guess a square law.
- **Foundational coverage:** S3 inside foundational (S1–S4) ✓.

---

## ENGINE REQUIREMENTS (0c-3) — desk C rows, mirrored to `_engine/findings_c.md`

**Context.** The frozen 0c-1 contract (`:939-1059`) and implementation (`:49736-50790`) were
read end-to-end this session. `[LIVE]` machinery this concept consumes as-is: the closed-form
spin engine (`rbrOmegaAt` `:49945`, `rbrThetaAt` `:49952`), the ω HUD row + `readout_at_ms`
term gating (`:50147-50154`, `:50234-50241`), the formula surface (`:50570-50574`), `phases[]`
glow staging (`:50647-50656`), the ω₀ slider + spin restart + re-pin blank (`:49999`,
`:50053-50064`, `:49896`), the exact-token visibility gate (`:50581-50632`), and the whole
apparatus mesh set (`:50288-50412`). Everything below does NOT exist — each absence verified in
the same read, not assumed.

**Contract preamble binding every row:** all new config fields optional, absent means
byte-identical to today (scar
`engine_extension_replaces_a_shared_constant_without_an_absent_field_fallback_clause`); all
legal-zero fields (`r_m: 0` for the axle marker, `angle_deg: 0`) resolved by `typeof`, never
truthiness (scar `optional_config_field_with_a_legal_zero_value_is_resolved_by_truthiness`);
all motion closed-form in state-local ms, accumulator-free (the rbr invariant, `:969-976`);
meshes built ONCE from the union of every state's declarations, per-state VALUES read at apply
(scar `field3d_build_once_body_reads_a_per_state_flag_from_the_union_def_and_mis_renders_silently`).

| Row | Capability (scriptable knobs stated) | Consumed by | Also serves | Cost |
|---|---|---|---|---|
| **C1 — body point markers** | `point_markers[]: { id, r_m (0 legal — the axle marker), angle_deg, plane: 'rod' or 'drum', label?, label_at_ms?/cue? }`. Small dots rigidly attached to the spin group, with sprite labels. **The contract line that prevents the #10 trap: markers are MASSLESS annotations — `rbrIOf` (`:49865`) is untouched; adding, moving or dragging a marker never changes I, ω or L.** Markers join the brighten-only solid glow set (`:50782` pattern) and the exact-token visibility list (C9) | S1–S7 (this concept) | **#4** (Desk D findings §3 needs "a mark on the rotating body" to make θ observable and break the rod pi-symmetry — C1 IS that mark) · #6 (point-mass visual precedent) | small |
| **C2 — tangential velocity arrow + live value label per marker** | Length proportional to ωr via a **DEDICATED linear velocity map with a true zero** — a marker at r = 0 draws NO arrow and a `0.00 m/s` label; NEVER routed through the force-arrow knee map (`rbrArrowLen` `:49829` and its MIN_LEN floor `:49795` — scar `velocity_arrows_routed_through_a_force_arrow_map_collapse_their_ratio_and_cannot_draw_a_true_zero`). Sized for the reachable band 0–2.85 m/s (ω₀ max 3.0 times r_point max 0.95). Value label = `PM_rbrOmega` times `r_m` from ONE per-frame snapshot; labels blank under `rbrBlanked` (`:49896`) like the HUD. Label decollision at small radii is a build obligation (OPEN row `field3d_label_sprite_overlap`). Per-marker `v_arrow_at_ms`/cue for the S4 one-per-sentence build | S4, S5, S6, S7 | **#4** (Desk D findings §4 — the SAME build item, one semantics: tangential arrow at an authored radius, length proportional to ωr, live value label) | small-moderate |
| **C3 — circular trace per marker** | Progressive paint as the marker sweeps; persists across the state; per-marker colour; **a pure function of state-local t** — the swept span is redrawn from the closed-form θ (the `rbrThetaAt` backwards-rebuild discipline, `:49958`, is the pattern), so a SET_TIME_FREEZE pin, a rewind and a dt-fold all reproduce it exactly (scars `hysteretic_state_cannot_be_latched_under_a_time_pin`, `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls` — bring-up probe: pin, rewind, re-pin; assert byte-equal trace pixels) | S2, S3, S4 (persisting), S6 (both frames) | **#4** (Desk D §4: "optional circular trace, same machinery") · #2 (the declared `cm_path_trace` member is the same trace core on a translating point — build the drawing core once) | moderate |
| **C4 — fixed start line + swept-arc highlight + arc-length labels over ONE authored window** | `{ start_line: {angle_deg, label}, compare_window: {from_ms, to_ms}, arc_labels: [{marker_id, at_ms?}] }`. The start line lives on the BASE frame — the existing drum stripe (`:50322`) ROTATES with the spin group, verified unusable as a fixed reference, so a new fixed ray is required. ONE timed window per state (scar `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant` — this concept authors exactly one, in S3). Arc length = r times the swept angle from the engine θ | S3 | **#4** (Desk D §3 wants a fixed base reference + a swept angle between two rays — same fixed-ray + swept-highlight machinery, reused for θ instead of s) | small (rides C3) |
| **C5 — chord gauge between two markers (or marker to mass)** | A drawn segment + live length label. Constancy is the POINT — the gauge must keep reading through spin (S1) and through the C7 glide (S6) | S1, S6 | #1 (a parts-distance visual precedent); otherwise this-concept-only — priced accordingly | small |
| **C6 — live marker-radius control** | New `controls_visible` token **`r_point`** + slider row (the reserved-slot `visibility:hidden` pattern, `:50033`/`:50137`) + `param_ramp`/`idle_auto_sweep` support for `param: "r_point"` — **the plumbing consumes only `param === "r"` today, verified `:49852`/`:49858`; any other param is a silent no-op.** Dragging r_point moves the marker, its circle, arrow and label live; NO restart (massless — C1 contract). **This reopens the controls enum: sanctioned, because 0c-3 is an engine build** — the 0c-3 brief must re-close `controls_visible` against the REMAINING served set (the #4 alpha-drive and applied-torque controls per Desk D §5, the #14 kappa) in the same declared/implemented split the 0c-1 contract used (scars `closed_enum_cannot_name_a_substance_the_design_teaches`, `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set`, `deferred_enum_members_must_be_declared_not_merely_unimplemented`) | S7 | **#4** (a draggable point radius under a v = ωr readout is its explore beat too) | small-moderate |
| **C7 — free-flight decomposition (advanced)** | The rod+masses+markers detach at an authored instant and glide at constant velocity while spinning at constant ω (torque-free, gravity-free — nothing falls in the rbr scenario); centre-point trace (straight) + point trace (looping) in the world frame; a co-moving highlight circle showing the point circling the centre; loop reset via a brief blank (readouts AND C2 labels blank through it). **This is the engine row of #2** (`motion_of_centre_of_mass`: translating frame + free rotation + CoM marker + path trace — the survey union table). This concept CONSUMES it for one advanced state and adds only the co-moving highlight + the gauge-through-glide asks. If the #2 row is deferred, S6 is cut with its ring and the lesson stays coherent (38a — designed for that from the start) | S6 | **#2 (core)** · #3 advanced (here) — the survey's own sharing note | large — but bought by #2 regardless |
| **C8 — per-state camera pose (OPTIONAL, P2)** | The rbr config has **no camera field** (`:977-1059`, verified) and the build pins one spherical pose (`:50475-50477`); the fleet-level gap is already the OPEN row `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` — **append rbr + this concept to that row rather than minting a duplicate.** Wanted: authored phi/theta/radius per state (S5 drum-face view, S6 wide glide framing). Any authored solve sweeps radius AND elevation (the build comment `:50470-50474` records the same lesson). **Stated fallback if not built: the default 3/4 view is acceptable — circles read as ellipses in honest perspective, and S5/S6 remain teachable** | S5, S6 (nice-to-have S2/S3) | #1, #2 (CoM paths), #4, fleet-wide | moderate; P2 |
| **C9 — registration co-edit, SAME change, every row above** | (a) `deriveStateMeta.ts` — every new timed element (trace growth end, compare-window close, arc labels, marker/arrow reveal ms, glide loop) registered in `F3D_REVEAL_KEYS` / `maxRevealForField3dState` / `deriveHoldExpectations`, against BOTH config shapes (scar `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl`); (b) every new elementType appended to `RBR_ELEMENT_TYPES` + the overlay `flags` map (`:50586-50613`) — rbr overlays DEFAULT OFF and appear only on explicit ask, and the generic matcher never sees rbr children (`:50581-50584`, scar `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus`); (c) no literal backticks in the emitted template body; `npm run check:renderer-syntax` after every seam | all states | all rbr concepts | obligatory rider |

**Explicitly NOT required by this concept (scope 0c-3 down, not up):** `body_shape` variants
(`'disc'` / `'ring'` / `'rod'` / `'sphere'` stay declared-inert — the drum face IS the disc,
the rim dot-ring IS the ring picture) · theta/alpha/W/v HUD rows (ω suffices here; theta/alpha
are Desk D's own rows) · `reference_marks[]` · `ke_bar` · any new torque source · any graph
panel · any second body.

### The missing `v` readout — the design ruling (asked for explicitly by the dispatch)

**A `v` row in `RBR_RO_META` is NOT a blocking 0c-3 requirement, and this concept will never
author one.** Reasons, in order of weight: (1) **v is per-point** — S4 shows four different v
values at one instant on one body; a singleton HUD row structurally cannot say WHICH point it
describes, and averaging or picking one would misteach the very claim (one ω, MANY v). The
number belongs at the point it describes: the C2 live value label at each arrow, which is also
the Rule 33d instrument-at-the-point discipline. (2) The claim is still carried numerically and
live — C2 labels are computed from the engine's own ω snapshot, never asserted. (3) The
silent-skip trap (`if (!meta) continue`, `:50163`, `:50237`) is disarmed by authoring law, not
by a new row: §10(b) bans any token outside `RBR_RO_META` in `readouts[]`, and this desk
ENDORSES the Desk D findings §2 ask that 0c-3 make the skip loud (`console.warn`) — that
warning protects every future rbr concept, this one included. What IS required for v: **C2 in
full** — rendered arrow, true zero, live numeric label. A trace + arrow without any number
would fail `teach_show_quantity_live_when_named` the moment narration says "0.45 metres per
second"; the label is therefore inside the C2 contract, not optional.

## PER-STATE x ENGINE-ROW WALK (both directions)

| State | Consumes [NEEDS-0c-3] | Consumes [LIVE] |
|---|---|---|
| S1 | C1 (P₁, P₂), C5 (two gauges), C9 | spin engine, apparatus, glow phases |
| S2 | C1, C3 (two traces), C9 | spin engine |
| S3 | C1, C3 (persisting), C4 (start line + window + labels), C9 | ω HUD row + readout_at_ms, glow phases |
| S4 | C1 (+ axle marker, P₃), C2 (four arrows/labels, true zero), C3 (persisting), C9 | formula surface, glow phases |
| S5 | C1 (drum line + rim dots), C2 (graded + equal arrows), C8 (optional; fallback stated), C9 | formula surface, spin engine |
| S6 | C7 (glide + co-moving circle + loop blank), C3 (both frames), C5 (gauge through glide), C1, C8 (optional), C9 | — |
| S7 | C6 (r_point + sweep), C1, C2, C9 | ω₀ slider, restart + re-pin blank, formula surface, Rule-37 free-run |

Reverse: **C1** from S1–S7 · **C2** from S4, S5, S6, S7 · **C3** from S2, S3, S4, S6 · **C4**
from S3 · **C5** from S1, S6 · **C6** from S7 · **C7** from S6 · **C8** from S5, S6 (optional) ·
**C9** from all. Every row claimed by at least one state ✓; every state claims at least one row
✓; no unclaimed row, no unbacked state (scars
`phase0_union_table_asserted_not_walked_state_by_state`,
`signed_engine_union_drops_items_its_own_state_table_still_consumes` — this is REV 1, no prior
union to diff; any future renumbering must show the old-to-new mapping here).

**[LIVE] vs [NEEDS-0c-3] split, counted:** 8 distinct [LIVE] surfaces consumed (spin engine ·
apparatus meshes · ω HUD row + readout_at_ms · formula surface · phases/glow · ω₀ slider ·
restart/re-pin · visibility gate), each cited by line; **8 engine rows** asked of 0c-3 (C1–C7 +
C9 mandatory; C8 optional-P2). **Zero of the 7 states is fully buildable today** — S1–S6 each
need at least C1; even the S7 sandbox needs C1+C2+C6.

---

## SCAR AUDIT

**Queries run (this session, LIVE table via Bash — read-only):**

```
query_engine_bug_queue.ts --owner alex:architect     -> 63 rows
query_engine_bug_queue.ts --row-type directive       -> 83 rows
query_engine_bug_queue.ts --field3d --open           -> 85 rows
query_engine_bug_queue.ts rigid_body_rotation        -> 1 row
```

**Not queried:** nothing beyond the four commands above; any row outside those result sets is
NOT dispositioned here rather than silently "none skipped". (The 1 row of the scenario-name
query is the stash-discipline directive, dispositioned below; per the sibling skeleton's
operational note, family rows for this scenario surface via `--owner` / `--field3d --open`,
which were both run.)

**Disposition — every bug_class inside the queried universe, VERBATIM, one verdict each**
(scar `scar_audit_claims_a_coverage_boundary_it_did_not_enumerate`: superset, both directions).

### A — BINDS this design; how it is satisfied

| bug_class | Verdict |
|---|---|
| `archetype_live_tier_unverified_against_renderer` | satisfied — every [LIVE] tag cites the verifying file:line, read this session; everything unverifiable is [NEEDS-0c-3] with a row id |
| `phase0_union_table_asserted_not_walked_state_by_state` | satisfied — the walk above, both directions |
| `signed_engine_union_drops_items_its_own_state_table_still_consumes` | satisfied — REV 1 baseline; renumber-mapping obligation recorded in the walk |
| `scar_audit_claims_a_coverage_boundary_it_did_not_enumerate` | satisfied — this list is the mechanical superset, both directions |
| `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` | satisfied — the scenario-specific query was run (1 row) AND the field3d open sweep covers the rbr family |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | satisfied — every closed/inert claim quotes BOTH the declaration and the reader (readouts `:1043` + `:50162`; ramp/sweep `:1013`/`:1015` + `:49852`/`:49858`; controls `:1051` + `:50128`; visibility `:1054` + `:50593`) |
| `closed_enum_cannot_name_a_substance_the_design_teaches` | satisfied — the one enum this design must extend (`controls_visible` + `r_point`) is named as a sanctioned 0c-3 reopen in C6; no other enum is touched |
| `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set` | satisfied — C6 obliges the 0c-3 brief to re-close against the remaining served set (#4, #14), not against this concept alone |
| `deferred_enum_members_must_be_declared_not_merely_unimplemented` | satisfied — C6 requires the declared/implemented split in the 0c-3 brief; body_shape members stay declared-inert by explicit decision |
| `velocity_arrows_routed_through_a_force_arrow_map_collapse_their_ratio_and_cannot_draw_a_true_zero` | satisfied — C2 mandates a dedicated linear map with a drawable true zero; the S4 axle marker is the zero case on screen |
| `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` | satisfied in its transferable half — C2 must NOT inherit `RBR_ARROW_MIN_LEN` (`:49795`); the v map floor is zero |
| `teach_distinct_reference_lines_for_two_radii` | satisfied — P₁/P₂/P₃ each get a distinct colour + label; their traces are distinct; the existing r-line vs drum-line pair (`:49759-49760`) is untouched |
| `teach_do_not_prespoil_a_later_reveal` | satisfied — no v arrow before S4, no ω before S3, the S2 fan anchor makes no speed claim, formula gated to S4+ |
| `teach_concrete_before_abstract_compare` | satisfied — two concrete points (S3) before the formula (S4) before the population (S5) |
| `teach_visual_must_match_narration` | audited claim-by-claim in §3; the dispatching session should APPEND this concept to the OPEN row rather than mint a duplicate |
| `teach_field3d_explore_grab_and_move_field_point` | satisfied by design — the S7 r_point drag IS the grab-and-move pattern |
| `teach_read_dense_ramp_frames_not_just_frozen` | carried as an EYE obligation — the §3 pin table names the dense windows (S2 trace growth, S3 compare window) |
| `explore_controls_not_ring_gated_survive_the_ring_cut` | satisfied — min_ring declared per control; both core; both map to surviving states under every cut (§10 i-1) |
| `explore_state_formula_surface_asserts_a_relation_no_state_derives` | satisfied — the S7 formula v = ωr is stated and shown by S4 (core) under every preset |
| `authored_beat_ends_by_undoing_the_state_own_claim` | satisfied — every end-config HOLDS its claim (S1 gauges held, S3 labelled arcs held, S4 envelope held); the S6 loop reset lands AFTER the pin and reads as a blanked replay, not an undo |
| `frozen_pin_unbudgeted_on_a_sequential_misconception_state_can_archive_the_wrong_picture` | satisfied — S3/S4 pins land after the counter-picture completes (§3 table) |
| `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` | satisfied in its transferable half — margins stated in ms, all at least 0.8 s (well over 167 ms); physics_author recomputes at engine step size |
| `skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal_inside_it` | satisfied — the pin table names LAST reveals |
| `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` | satisfied in its transferable half — S6 is the only looping state and its pin precedes the first reset |
| `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm` | satisfied in its transferable half — all authored poses strictly inside bounds (markers at most 0.90 vs rod 1.00; drum dots at most 0.50 vs drum 0.55; r_point max 0.95 vs 1.00; masses at home 0.80 vs clamp 0.90) |
| `quantitative_check_state_reuses_the_exact_numbers_and_the_delta_cue_of_the_state_it_verifies` | satisfied — the S3 numbers (0.81/1.62 m) and S4 numbers (0.45/0.90/1.35 m/s) are disjoint sets; the compare window was retuned to 1.80 s specifically to keep them disjoint; delta cues all distinct |
| `taught_delta_smaller_than_the_instruments_own_live_noise` | satisfied — taught deltas are 2x and 3x ratios on a noise-free closed-form engine |
| `derived_readout_asserted_by_value_without_defining_its_metric` | satisfied — §3 "Readout metrics" defines every displayed number's formula and source snapshot |
| `narration_attributes_an_effect_to_a_cause_the_model_does_not_contain` | satisfied — the claims are geometric (rigidity, shared ω, v = ωr); no dynamical cause is asserted anywhere |
| `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` | satisfied — v is a rendered arrow on a visibly moving point; the label annotates, never substitutes |
| `symbol_printed_on_canvas_before_the_lesson_defines_it` | satisfied — ledger §10(b), enforced via readout_at_ms and per-element reveal cues |
| `lesson_never_states_the_principle_it_is_named_after` | satisfied — S1 states the rigid-body definition verbatim; S4 states v = ωr |
| `concept_taught_its_own_quantity_without_the_canonical_picture` | satisfied — the canonical picture (marked points on one rotating body, circles + graded v arrows) is exactly what renders |
| `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive` | satisfied — §4 names the buildable primitives (C1/C2/C3/C4 + live spin) per belief |
| `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` | satisfied — S3 ~9 words, S2 ~8 words, inside those budgets |
| `skeleton_anchor_specified_in_section_9_reaches_no_narration_line` | satisfied — same state+word assignments; physics_author writes the lines into those states |
| `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` | satisfied — C2/C3/C4 are written to the Desk D findings §3/§4 semantics, cited; the 0c-3 brief reconciles once |
| `paired_skeletons_cite_each_other_by_state_number_across_a_renumbering` | satisfied — Desk D is cited by content and section, never by its state numbers |
| `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant` | satisfied — timed-surface inventory per row: C4 one window (S3 only); C7 one detach instant + one loop; nothing else timed beyond per-element reveal cues the scenario already patterns |
| `skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static` | satisfied — the rbr overlay config is NOT static (readout_at_ms, phases, at_ms/cue patterns, all cited); every NEW overlay ships its own at_ms/cue field inside its C-row |
| `skeleton_authors_a_multi_phase_state_on_an_engine_with_no_per_body_activation_time` | satisfied — the S6 detach instant is an explicit C7 field, never an assumed capability |
| `architect_reuses_a_marker_mechanism_without_diffing_the_side_effects_its_presence_switches_on` | satisfied — the existing drum stripe (`:50322`) was diffed: it ROTATES with the spin group, so it cannot serve as the S3 fixed start line (C4 builds a base-frame ray); C1 markers switch on nothing else (overlays default OFF, `:50596`) |
| `named_primitive_declared_without_the_surface_that_can_render_it` | satisfied — every named primitive maps to a C-row or a cited [LIVE] surface (the walk) |
| `authored_lumped_constant_inconsistent_with_the_drawn_apparatus_geometry` | satisfied — every marker sits on drawn material (radii checked against rod half-length and drum radius); no lumped constant is displayed by this concept |
| `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls` | satisfied — the trace-rewind claim is NOT asserted from current code; it is written into the C3 contract with a bring-up probe, naming the `rbrThetaAt` rebuild branch (`:49958`) as the pattern to follow |
| `hysteretic_state_cannot_be_latched_under_a_time_pin` | satisfied — the only history-like visuals (traces, arcs, glide paths) are contractually pure functions of state-local t (C3/C7) |
| `field3d_dt_accumulated_motion_invisible_to_eye_timepin` | satisfied — all C-rows accumulator-free by contract, matching the scenario invariant (`:969-976`) |
| `spec_semi_implicit_euler_position_not_step_count_invariant` | satisfied — no new integrator anywhere; constant-ω closed forms only |
| `explicit_linear_drag_is_unstable_at_the_damping_a_legible_settle_requires` | N/A-satisfied — no drag, no settle dynamics authored |
| `state_added_at_review_outruns_the_config_contract_shape` | satisfied — every §3 state is expressible as one config object under the frozen contract + C-rows; any review-added state must re-run this walk |
| `prior_rulings_and_internal_ledgers_are_not_re_run_over_the_states_a_restructure_creates` | satisfied — REV 1; obligation recorded for any future restructure |
| `derivation_principle_applied_to_one_beat_but_not_its_sibling` | satisfied — the same-window discipline applies to BOTH compared arcs (S3) and the label discipline to BOTH dot sets (S5) |
| `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` | satisfied — markers/traces/gauges join the brighten-only solid set (§3 Rule 32e plan); a compare state focal never dims its counterpart |
| `optional_config_field_with_a_legal_zero_value_is_resolved_by_truthiness` | satisfied — typeof resolution written into the C-row preamble (r_m 0, angle_deg 0) |
| `engine_extension_replaces_a_shared_constant_without_an_absent_field_fallback_clause` | satisfied — all C-row fields optional; absent = byte-identical behaviour (preamble) |
| `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` | satisfied — C9(b): rbr children bypass the generic matcher (`:50581-50584`, verified); every new elementType registers in RBR_ELEMENT_TYPES + the flags map |
| `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl` | satisfied — C9(a) |
| `field3d_build_once_body_reads_a_per_state_flag_from_the_union_def_and_mis_renders_silently` | satisfied — C-row preamble: meshes built once from the union, per-state VALUES read at apply |
| `field3d_per_state_slider_rows_collapsed_in_a_bottom_anchored_panel_make_shared_rows_jump` | satisfied — the C6 row joins the reserved-slot visibility:hidden pattern (`:50033`/`:50137`, cited) |
| `field3d_param_ramp_authoring_contract` | satisfied — the only authored ramp/sweep (S7 idle sweep on r_point) enters at its own from-value under the same contract; C6 extends the param plumbing rather than bypassing it |
| `close_camera_framed_extent_is_authored_as_the_run_length_and_omits_the_body_radius` | satisfied in its transferable half — the S6 framed extent = glide run PLUS one rod length margin each end; exact metres computed by physics_author with the C7 velocity; the C8 fallback framing must still pass the in-frame check at t = 0, at the pin and at state end |
| `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` | carried into the C8 contract — any authored camera solve sweeps radius AND elevation (the scenario build comment `:50470-50474` records the same lesson) |
| `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` | BINDS — C8 appends rbr + this concept to this OPEN row; fallback stated |
| `directive_no_gate_asks_whether_a_teacher_could_use_it` | satisfied — §10 teacher-usability walk |
| `ramp_endpoints_multiply_the_taught_variable_by_a_factor_no_rendered_string_claims` | satisfied — the only ramp (idle sweep) renders its factor continuously via the live v label |
| `skeleton_asserts_a_held_comparison_value_at_an_instant_the_faster_body_has_already_passed` | satisfied — the S3 compared event is SIMULTANEOUS by construction (one ω); the pin lands after it with arcs held |
| `architect_authors_a_force_triangle_whose_ratio_exceeds_the_renderer_arrow_maps_dynamic_range` | satisfied — arrow ratios 1:2:3 (S4) and 1:5 (S5, 0.15 to 0.75) sit inside the C2 linear band by contract; no force triangle exists |
| `engine_stash_on_shared_renderer_reverts_concurrent_session_uncommitted_work` | BINDS the 0c-3 engine session, recorded in the findings mirror; this desk is read-only on all six platform files |
| `teach_inverted_scenario_inverts_cutline_flags` | N/A-with-reason — this concept inverts no sibling; noted for #7/#13/#14 as the sibling skeleton did |
| `teach_coordinate_sim_with_graph` | N/A by design — no graph in any ring (§10 i-5) |
| `chemistry_concept_id_collides_with_rostered_physics_id` | verified — no collision in either concepts directory (header) |
| `contrast_ghost_coresident_with_the_real_set_fuses_both` | N/A — no ghost anywhere; the S6 decomposition uses a co-moving highlight on the REAL body, never a ghost copy |
| `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` | satisfied — the formula surface stays symbolic; every value on canvas is engine-computed (C2/C4/C5 metrics) |
| `phase0_union_lists_capabilities_but_never_which_knobs_are_scriptable` | satisfied — every C-row states its scriptable knobs/fields inline |
| `shared_bar_scale_cross_state_guarantee_is_void_when_the_panel_reflow_ladder_drops_a_step` | N/A — no bars in this concept |
| `energy_layer_two_body_groups_stack_vertically_so_a_bar_height_compare_is_not_side_by_side` | N/A — no energy layer |
| `nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger` | N/A — no applied force, no work ledger; ω never reverses in a guided state |
| `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` | satisfied — archetype-discharge rule in §3; every archetype discharges from authored within-state motion |

### B — binds a DOWNSTREAM stage; obligation named

| bug_class | Owner of the obligation |
|---|---|
| `teach_reveal_synced_to_narration` · `teach_show_quantity_live_when_named` · `concept_ships_zero_narration_glow_bindings` · `narration_references_a_prerequisite_concepts_apparatus_that_is_not_on_screen` (the UCM ball-on-string must never be named as if on screen — the S2 patch clause is about the on-screen points) · `teach_color_each_element_by_its_own_sign` (leaning N/A: no signed pair rendered — spin never reverses in a guided state; binds only if physics_author adds sign talk) | physics_author, at 0d |
| `ecp_glow_targets_missing_primitives` · `solenoid_focal_primitive_on_title_not_physics` (its general half: focal names a physics primitive, never a title) · `review_site_build_is_stale_against_the_concept_under_review` | json_author / build ops, at 0d |
| `rule31_motion_floor_satisfied_by_a_late_label_reveal_over_a_frozen_canvas` (spin always runs — structurally safe; EYE confirms) · `narration_timing_probe_uses_a_speech_model_the_shipped_player_does_not` · `teach_auditor_reads_field3d_sliders_from_config_not_scene_composition` · `eye_motion_map_reads_cached_physics_config_which_holds_only_epic_l_path` · `eye_dense_frames_are_never_hashed_so_a_frozen_state_passes_31_of_31` · `capture_frozen_frame_ignores_its_own_poll_result_and_photographs_off_pin` · `frozen_frame_read_as_dense_series_continuation_on_translating_body` (S6 IS a translating body — flag to the EYE session explicitly) · `eye_h2_frozen_frames_of_moving_elements_wobble_sub_perceptually_so_zero_percent_is_not_a_valid_gate` · `eye_h2_baseline_nondeterministic_electric_potential_meaning_state6` · `galvanometer_family_motion_expectation_undeclared` · `the_eye_passes_a_frame_in_which_one_compared_body_is_hidden_behind_another` (the S3/S5 compares are concentric — check occlusion at the chosen camera) · `verification_via_applystate_bypasses_player_false_hang` · `harness_source_grep_comment_strip_defeated_by_crlf_line_endings` | THE EYE / verification session, at 0d |
| `field3d_label_sprite_overlap` · `field3d_arrow_label_sprite_renders_at_under_half_the_body_label_glyph_height` · `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` · `radius_scenario_F_r_label_kerning_collision` · `graph_title_caption_zorder_overlap` · `caption_clipped_by_adjacent_stat_box` · `field3d_formula_overlay_generic_not_cambria_math` (rbr already Cambria, cited) · `field3d_sliders_panel_top12_vs_fsbtn_top10` (rbr already top:52px, cited) · `cyclotron_timers_sliders_fullscreen_button_corner_collision` · `field3d_hard_threshold_label_decollision_pops_when_the_pair_separates` · `field3d_focal_glow_pulse_phase_reads_absolute_time_so_frozen_h2_jitters` · `field3d_integrating_scenario_state_entry_must_rebuild_the_whole_engine_record` (rbr rebuilds `eng` at apply, `:50486` — C-rows add fields to that record) · `field3d_measured_overlay_fit_runs_once_against_a_sibling_blanked_on_entry` · `contact_detected_slow_window_arms_one_frame_late_and_buries_the_body_at_full_dt` · `derived_energy_sum_pairs_prestep_position_with_poststep_velocity` (C2 labels publish from ONE snapshot — contract) · `field3d_pinned_rewind_reproduces_the_instant_but_not_the_last_float_bit` · `nlb_seized_slider_run_overruns_a_loop_sized_work_scale` (S7 has no work scale; the v map covers the slider corners by C2 sizing) | 0c-3 engine build (Desk E) — mirrored in `findings_c.md` |

### C — N/A-with-reason (other scenarios / other surfaces; no transferable half beyond what section A already carries)

`nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` ·
`nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` ·
`nlb_lane_offsets_apply_to_declared_bodies_not_co_present_ones_so_sequential_phases_split_laterally` ·
`nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate` ·
`nlb_angle_arc_radius_overruns_the_neighbouring_lane_body` ·
`nlb_body_label_is_brighten_only_so_static_text_outranks_the_state_focal` ·
`nlb_displacement_vector_is_single_body_so_a_compare_state_measures_only_one` ·
`nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix` ·
`field3d_nlb_body_screen_anchor_lands_under_the_dom_slider_panel` ·
`seam_r_ink_lift_reveals_sub_surface_force_arrows_fleet_wide_and_no_gate_reads_it_as_a_change` ·
`nlb_work_bar_track_tops_lose_collinearity_when_a_3d_label_size_changes` ·
`nlb_work_probe_globals_disagree_on_multibody_states` ·
`nlb_multibody_sandbox_wrap_reanchors_only_the_wrapping_body` ·
`nlb_coupled_sandbox_F_slider_exceeds_string_tautness_bound` ·
`nlb_formula_and_readout_zones_are_fixed_css_and_collide_with_a_tall_hud` ·
`field3d_nlb_body_label_overlaps_the_pulley_mesh` ·
`nlb_camera_rotated_body_label_bleed_through_slider_panel` ·
`field3d_newtons_laws_body_surface_slab_cannot_be_hidden_for_a_both_hanging_atwood_state` ·
`nlb_overlay_ink_lift_is_bounded_to_the_families_whose_length_is_a_magnitude` — all
newtons_laws_body-surface rows; this concept is on the rbr scenario.
`biot_state6_dotcross_lesson_not_rendered` · `biot_single_element_states_static_pose` ·
`biot_state8_db_arrow_not_scaled_by_contribution` · `solenoid_state7_hand_flip_unimplemented` ·
`solenoid_state3_annotation_orphaned_from_referent` · `solenoid_state5_gesture_sequencing_absent` ·
`solenoid_state4_outside_fade_narrated_not_shown` · `mfl_loop_footprint_inverted_vs_theta` ·
`loop_dipole_couple_simultaneous_reveal` · `loop_dipole_micro_claim_without_micro_visual` ·
`glow_focal_fr_ring_whiteouts_the_ring_and_occludes_it` ·
`force_rig_slider_panel_renders_full_height_when_one_row_visible` ·
`force_rig_short_reveal_pin_below_catchup_threshold_keeps_prefreeze_jitter` ·
`field3d_release_widens_ground_plane_per_state_causing_unnarrated_apparatus_jump` ·
`ghost_compare_cause_invisible_slider_frozen` · `ghost_compare_b_handoff_instant_snap` (no ghost
authored anywhere) · `field3d_hanging_body_gravity_sign_inverted_vs_own_axis` (no gravity in the
rbr scenario; the S6 wording avoids any falling claim) ·
`authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state` (noted for
json_author when binding glows; the phases channel is this design's focal mechanism) ·
`magnetic_flux_loop_scenario_new_build` · `ppc_probe_points_primitive_new_build` (FIXED
historical precedents; probe_points is pattern-precedent for C1, not reuse — probe points are
static field samplers, C1 markers ride the spin group) ·
`field3d_particle_field_vestigial_dual_panel_config_gap` · `CACHE_UPSERT_CONFLICT_TARGET_MISSING`
(serving/cache-side; bind the 0d session ops, not this design).

---

## Deliverable summary (for the dispatching session)

1. **7 states** — definition (held gauges) → circles (traces) → same-time aha (arc compare) →
   v = ωr (arrow ladder with true zero) → whole disc (extended) → slide+spin decomposition
   (advanced) → sandbox (ω₀ + draggable point radius).
2. **Tier split:** 8 [LIVE] surfaces (each cited by line); 8 [NEEDS-0c-3] rows (C1–C7 + C9;
   C8 optional-P2). Zero states buildable today.
3. **Engine rows ranked by Ch.7 concepts served:** C1 markers (#3, #4, #6 precedent) and C2 v
   arrows (#3, #4 — the same item as Desk D findings §4, one build) and C3 traces (#3, #4, #2)
   lead; then C4 start-ray/arc window (#3, plus the #4 swept-angle machinery), C6 r_point
   control (#3, #4), C7 glide (bought by #2, consumed here), C5 gauges (#3, weak #1), C8 camera
   (fleet-wide; optional). C9 rides every row.
4. **v-readout ruling:** NOT a HUD-row blocker — v is per-point and carried by the C2 live
   per-marker labels; authoring any unknown readouts token is banned in the DoD; the Desk D
   loud-warn ask is endorsed.
5. **body_shape finding:** the declared-inert body_shape variants are NOT required by this
   concept — the drum face is the disc and the rim dot-ring is the ring picture. 0c-3 scope
   shrinks accordingly unless #1 buys the shapes for its own reasons.

*Handoff: founder-proxy Checkpoint A (design gate). On DESIGN_OK: physics block (this desk,
wave-2 design), then HOLD until 0c-3 merges; the build resumes at json-author.*
