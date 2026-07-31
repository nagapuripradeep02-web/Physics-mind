# ARCHITECT SKELETON — `tension_force` (NEW, on the frozen `newtons_laws_body` engine + SEAM H)
# Chapter: Laws of Motion (Class 11) · renderer: field_3d / scenario `newtons_laws_body` · 2026-07-30
# Engine contract: docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md §1 / §2 Branch B / §6 flag 4 (SEAM H train)
# + docs/loop_runs/lom/lom_e_design.md §0/§3 (founder-approved arc, refined here).
# CONFIGURATION ONLY — zero renderer edits. Anything beyond the closed enums = ENGINE GAP CANDIDATES (end).
# Register conventions match siblings: chapter 8, section "8.4" (proposal — json_author confirms against
# normal_force 8.3 / connected_bodies 8.3 / friction_force 8.6). Rule 41 applies to EVERY string below.

## 1. Atomic claim + THE CONCEPT BOUNDARY

This concept teaches that a string exerts a PULL along its own line whose size is set by the motion,
not by the string — one ideal string carries ONE tension everywhere, but each string in a CHAIN
carries only the mass beyond it, so T₁ ≠ T₂ — and only that.

**Boundary against `connected_bodies` (SEALED, master, 7 states) — the reason this concept exists:**
- `connected_bodies` OWNS: one string over a pulley as a SYSTEM to solve — shared |a|, one T,
  T ≠ m₂g as a solving step, one equation per body, the incline variant, Atwood. Nothing here
  re-derives or re-solves any of that.
- `tension_force` OWNS: what tension IS as a force (a pull along the line, at both ends, whose value
  comes from the motion), and the same-versus-different question — WHEN tension is the same through
  a string and WHERE it changes (T₁ vs T₂). The T₁ ≠ T₂ half is a FOUNDER REQUIREMENT (2026-07-30)
  and is NOT trimmable; if the count must come down, the opening pulley states merge instead.
- Where they touch (T ≠ m₂g while accelerating): here it is the ENDPOINT about the force ("the
  string has no fixed tension of its own — the motion sets it", S3, different numbers from the
  sibling: 14.70 N vs its 13.07 N); in `connected_bodies` the same fact is a STEP toward solving the
  pair. S3's narration never sets up per-body equations — that is the sibling's S4.
- Follow-on pointer, not prerequisite: S7's closing narration may name `connected_bodies` as "how to
  solve these systems" (advisory, Rule 23).

It does NOT cover: slack strings (rope-slack rendering is a third engine seam — deliberately not
attempted; "pull-only" is taught by arrow DIRECTION, both arrows pointing away from their body),
massive strings, multi-pulley systems, or a body hanging from a fixed ceiling anchor.

## 2. State count + arc — 7 states

Founder chose "ONE sim, 6–7 states"; 7 justified: seven distinct one-motion ideas — merging the only
merge candidate S1+S2 would put TWO motions (arrow reveal-build + load ramp) and two ideas
(pulls-both-ways + self-adjusts) into one beat, violating Rule 31.

Arc: pull along the line at rest → T matches the load → accelerating, T is less than the weight →
one string, one T (earns the wrong belief) → two strings, two T (breaks it — PRIMARY aha) → why:
only the mass behind → train sandbox.

`teaching_method`: omitted on S1–S6 (straightforward beats); S7 `exploration_sliders`.
`advance_mode`: S1–S6 `manual_click`, S7 `interaction_complete` (2 distinct — Gate 12 / Rule 15).
Never `wait_for_answer` / `pause_after_ms`. Rule 20: NO `mode_overrides`. EPIC-C branches: ZERO.
Rule 19: ≥3 primitives/state by construction (surface + bodies + pulley or ropes + arrows + label
sprites + HUD). Inert `field_lines` block (type requires it).

## State titles (Rule 41d — rail-short, literal, first words carry meaning)

S1 "A String Pulls Along Its Own Line" · S2 "Tension Matches the Load" · S3 "Accelerating — Tension
Is Less Than the Weight" · S4 "One String Carries One Tension" · S5 "Two Strings Carry Two Different
Tensions" · S6 "Each String Pulls Only the Mass Behind It" · S7 "Explore — Change Every Value"

## 3. Per-state control table (Rule 31 — REQUIRED design artifact)

| S | Teaches | Archetype | Delta cue (≤5 words) | controls_visible | EN words | depth_ring |
|---|---|---|---|---|---|---|
| 1 | A taut string pulls BOTH bodies, along its own line, away from each body; at rest T = m₂g | `reveal-build` (arrows draw in one by one: m₂g → T on B → T on A) | "String pulls at both ends" | — | 30–45 | core |
| 2 | T has no fixed value of its own — it matches whatever load hangs on it | `param_ramp` on the hanging mass (2→4 kg; weight arrow lengthens FIRST, T readout and T arrows track — 32a) | "Heavier load, larger tension" | — | 30–45 | core |
| 3 | Rule 16a pivot: T equals the weight ONLY at rest — release frictionless, T = m₂(g−a) = 14.70 N < 19.60 N | `translate-through` (rig releases from rest and runs; T readout falls the instant motion starts) | "Accelerating: T drops below m₂g" | m2 | 40–55 | core |
| 4 | One ideal string carries ONE tension everywhere — the pulley changes the pull's DIRECTION, never its size | `glow-walk` (coined in `connected_bodies`: phased focal traversal — focus travels A-end T arrow → pulley wheel → B-end T arrow over a steady glide; the traveling focus is the motion) | "One string, one tension" | — | 35–50 | core |
| 5 | PRIMARY aha: one pull, TWO strings, two DIFFERENT tensions — T₁ = 1.00 N, T₂ = 2.00 N on screen (SEAM H train) | `train-pull` (coined: one applied force drags a line of string-linked carts; each string carries its own live tension number — no seed archetype names chained towing) | "Two strings, two tensions" | F | 40–55 | core |
| 6 | WHY: each string accelerates only the carts behind it — T₁ = m₁a, T₂ = (m₁+m₂)a (DECLARED CONTRAST PAIR with S4: the same phased walk that found ONE number along one string now finds TWO across two strings — the delta names the flip) | `glow-walk` | "Only the mass behind it" | m2 | 40–55 | extended |
| 7 | Everything together on the train, teacher-driven | `drag-sandbox` | "Try every slider" | m, m2, F, mu_s, mu_k, v0 (ALL for this concept — theta is never taught here; the whole concept is flat ground, incline tension belongs to `connected_bodies`) | 0 / open | core |

No archetype repeat except the one declared contrast pair (S4/S6). No static state — S2's ramp,
S4/S6's phased traversal over live motion, and S1's timed arrow build are each the state's motion.

## 4. Per-state engine spec (closed enums only — spec §1/§2/§6 flag 4)

**Body-id plan (HARD constraint: `hanging` is per-id, constant across states — the mesh union rule
`connected_bodies` hit at bring-up):** pulley rig S1–S4 uses `A` (surface, 6 kg, label "m₁") +
`B` (`hanging: true`, label "m₂"); train rig S5–S7 uses NEW ids `P` (rear, label "m₁", 2 kg),
`Q` (middle, "m₂", 2 kg), `R` (front, "m₃", 2 kg). Ids never cross rigs. The engine hides bodies
absent from the live state's `bodies[]` (the sibling's Atwood P/Q precedent).

**Slider-target/order plan (nlbSliderBodies = first/second NON-ghost body in AUTHORED array order;
nlbForceTargetBody = the first):**
- S3 authors `[A, B]` → `m2` targets B (hanging) ✓, glyph m₂ matches B's label ✓.
- S2 authors `[B, A]` DELIBERATELY: `param_ramp {param:'m'}` writes the FIRST non-ghost body's mass
  = B, the hanging load — this is the only closed-enum way to ramp the load (param_ramp has no
  'm2'; see GAP CANDIDATE 1). No slider row is shown in S2, so the m-glyph mismatch never renders.
- S5/S6/S7 author `[R, Q, P]` while `train.body_ids: ["P","Q","R"]` (rear→front, its own contract):
  the F slider/param then targets R, the FRONT cart — mandatory, because F applied to a rear cart
  would slacken the strings ahead and the engine hides a non-positive segment (missing rope).
  `m` targets R and `m2` targets Q, so concept-level `slider_controls.m.label = "m₃"` (m is only
  ever shown in train states) and `m2` keeps glyph "m₂" (correct for BOTH B in S3 and Q in S6/S7).
  Rear cart P (m₁) has no slider — accepted, see GAP CANDIDATE 4.
- **`slider_controls` sized RIGHT the first time (the lom-c/lom-d F-widening lesson):**
  `F: { min: 0, max: 12, step: 0.5, default: 3 }` — min 0 is a SAFETY rail: a negative F on the
  front cart pushes the train backward, slackens both strings, and hides both ropes.
  `m2: { min: 0.5, max: 4, step: 0.5 }` — cap 4 kg so a sandbox/S3 drag can never exceed the S1/S2
  static-hold margin story (and in S3 the rig is already released, any m2 is safe).
  `m` default spec (0.5–10) is fine for m₃.

**HARD ARITHMETIC (computed, not guessed; g = 9.8):**
- S1/S2 at-rest hold: μₛ·m_A·g = 0.8 × 6 × 9.8 = **47.04 N > m₂g = 19.60 N** ✓ — and it holds
  through the whole S2 ramp (m₂ = 4 kg → 39.20 N < 47.04 N ✓; slip threshold m₂ = 4.8 kg, never
  reached — slipping is S3's beat, not S2's).
- S3 release (frictionless, m_A = 6, m_B = 2): a = m₂g/(m_A+m_B) = 19.6/8 = **2.45 m/s²**;
  T = m₂(g−a) = 2 × 7.35 = **14.70 N < m₂g = 19.60 N** ✓. Run budget 2.5 m → motion lasts
  √(2·2.5/2.45) = **1.43 s**, then halts at the bound (halt narrated as the end of the run —
  known engine limit, GAP CANDIDATE 2).
- S4 exact balance glide: μₖ = 1/3 on A → fₖ = (1/3)(6)(9.8) = 19.60 N = m₂g → a = 0; constant
  v = 0.35 m/s × 14 s = 4.9 m (A: −4.5 → +0.4, inside ±7 with the post at +7) ✓. T = 19.60 N at
  both ends — deliberate: a = 0 again, so T returns to m₂g even while MOVING (acceleration, not
  motion, is what changes T).
- S5/S6 train (flat, frictionless, F = 3 N on R, three 2-kg carts): a = F/M = 3/6 = **0.5 m/s²**;
  T₁ = m₁a = 2 × 0.5 = **1.00 N**; T₂ = (m₁+m₂)a = 4 × 0.5 = **2.00 N**; **T₂/T₁ = 2 exactly**
  (equal carts), and F = 3.00 N — the 1/2/3 ladder is the memorable picture. Engine formula check:
  T_i = (Σ_{j≤i} m_j)a − Σ_{j≤i}(drive_j+f_j) → T₁ = 2(0.5) − 0 = 1 ✓, T₂ = 4(0.5) − 0 = 2 ✓.
- Train geometry: spacing **2.5 m ≥ the 1.5 m minimum** (body width 1.1 m). Positions ascending
  with `train.body_ids` order: P −5.0, Q −2.5, R 0.0. `surface.length_m: 7` (bounds ±7): span 5 m
  fits; R runs 0 → +6.5 m → **motion lasts √(2·6.5/0.5) = 5.10 s**; P ends at +1.5 ✓.
- Durations (clamped 3–60 s; must cover narration — Ch.4 duration-clamp scar): S1 12, S2 14
  (ramp end_ms ≈ 6000, then held picture), S3 16, S4 14, S5 16, S6 18, S7 0.

| S | mode | rig / bodies / numbers | arrows (show) | readouts | formula (ONE line, Unicode) | glow_focal / phases | motion budget |
|---|---|---|---|---|---|---|---|
| 1 | `connected_incline_hanging`, θ=0 | A: 6 kg, μₛ 0.8, μₖ 0.7, at rest, `initial_position_m: −1.0` · B: 2 kg `hanging` · `surface.length_m: 7`, pulley post default (+7) | A: normal, weight, tension · B: weight, tension | `T` | `T = m₂g` | phases: `nlb_arrow_B_weight` → `nlb_arrow_B_tension` → `nlb_arrow_A_tension` (reveal-build; one focal at a time) | at rest by 47.04 > 19.60 N; the arrow build IS the motion |
| 2 | same rig, same numbers (32d home pose) — bodies AUTHORED `[B, A]` for the ramp target | as S1 | `T` | `T = m₂g` | `nlb_arrow_B_weight` (the cause); `param_ramp {param:'m', from:2, to:4, end_ms:6000}` | never slips (39.20 < 47.04 N); T readout 19.60→39.20 N tracks the growing weight arrow |
| 3 | same rig, `surface.frictionless: true`, m₂ back to 2 kg (narration opens "back to the 2-kilogram load"), A from rest at −3.0, run 2.5 m | A: tension · B: weight, tension (visibly unequal: 19.6 vs 14.7) | `T`, `a` | `T = m₂(g − a)` | `nlb_arrow_B_tension`; phases: weight glows first (cause), release beat follows (32a) | a = 2.45; run done in 1.43 s, halt = end of run |
| 4 | same rig, μₖ = 1/3 (exact balance), `initial_velocity_mps: 0.35`, A from −4.5 | A: tension, friction · B: weight, tension (equal length, perpendicular directions) | `T`, `v` | `a = 0 → T = m₂g` | phases walk: `nlb_arrow_A_tension` → `nlb_pulley_wheel` → `nlb_arrow_B_tension` | constant 0.35 m/s × 14 s = 4.9 m ✓ full-duration glide |
| 5 | **RIG CHANGE — declared** (see below). `mode: 'accelerate_applied_force'`, θ=0, `surface.frictionless: true`, `train: { body_ids: ["P","Q","R"], show_segment_labels: true }`, bodies `[R, Q, P]`, R carries `applied_force_N: 3` | R: applied · P: tension · Q: tension | `T1`, `T2`, `a` | `T₁ ≠ T₂` | phases: `nlb_arrow_R_applied` (cause) → `nlb_rope_a` (T₁) → `nlb_rope_b` (T₂) | a = 0.5; 6.5 m run in 5.10 s |
| 6 | same train, same numbers (32d) | as S5 | `T1`, `T2` | `T₁ = m₁a · T₂ = (m₁+m₂)a` | phases walk: `nlb_body_P` → `nlb_rope_a` → `nlb_rope_b` → `nlb_arrow_R_applied` (count the masses behind each string: 2 kg → 1 N, 4 kg → 2 N, 6 kg → 3 N) | pull re-runs under the walk; m₂ drag makes T₂ rise while T₁ barely moves — the unequal response is the taught relevance |
| 7 | `sandbox`, train rig, no `frictionless` (μ seeds 0, sliders live), `trusted_drag_seizes: true` (json_author VERIFIES coupled-train drag against `_scratch_nlb_seams.ts` — if the whole-train drag misbehaves, drop the flag and rely on sliders), `idle_auto_sweep {param:'F', range:[3, 9]}` (range[0] = the state's own authored F = 3 — first frame must not step) | P, Q: tension · R: applied | `T1`, `T2`, `a`, `v` | `a = F ∕ (m₁+m₂+m₃)` | `nlb_body_R` | free-runs (Rule 37 automatic on `interaction_complete`) |

**The S4→S5 rig transition (Rule 32d, declared — not a scene cut):** the pulley, the hanging block
and A leave; three carts and two strings appear. Justified: the question "is T the same in EVERY
string?" cannot be posed on a one-string rig (SEAM H's entire reason to exist). Continuity anchors:
the SAME table surface (`length_m: 7`), the same HUD/slider panel position, and the delta cue +
narration name the swap in the first sentence ("Now three carts on the same table, joined by two
strings"). Camera: S1–S4 share ONE near side-on `camera_position` (start from the sibling's
[0, 1.8, 10.5]; json_author re-verifies with the projection probe); S5–S7 get ONE wider side-on
position framing −5…+6.5 m — the camera moves once, exactly to frame the new thing (32d).

Rule 32 per state: cause first (weight arrow grows before T tracks in S2; weight glows before
release in S3; F arrow glows before the strings in S5); only the taught variable's motion changes;
ONE specific-id glow focal at any instant (phases, never two).
Rule 33: N/A-macro — the taught variable is the string force itself; the real-number duty is met by
live `T`/`T1`/`T2`/`a` readouts + the per-segment tension sprites (`show_segment_labels: true`).
Rule 34: on-canvas = delta cue + the ONE formula line + value-only HUD; prose in the strip below;
all math real Unicode (T₁ T₂ m₁ m₂ m₃ μₛ μₖ ≠ ∕ −).

## 5. Misconception plan (Rule 16a — pivots only, TWO hooks, EPIC-C = zero)

1. **S3 — "the tension in a string equals the weight it holds."** Earned by S1/S2 (at rest, T reads
   exactly m₂g through the whole ramp) and flagged at the planting moment (S2 narration: "at rest —
   and only at rest — T equals the hanging weight"). Contrast beat: release frictionless — the T
   readout falls from 19.60 to 14.70 N the instant motion starts, and on B the weight arrow visibly
   outreaches the tension arrow. visual_counter = "T reads 14.70 N while the weight stays 19.60 N;
   the two arrows on B are unequal lengths." one_line_fix = "T equals the weight only when a = 0 —
   while accelerating, T = m₂(g − a)."
2. **S5 — "tension is the same everywhere in any connected string system."** Earned by S4 (one
   string, one T — stated precisely FOR ONE STRING, which is the honest planting flag). Contrast
   beat: if every string carried the same pull, both rope sprites would show the same number; on
   screen the rear string reads 1.00 N and the front string 2.00 N under one 3.00 N pull.
   visual_counter = "two live sprites, two different numbers, one pull." one_line_fix = "one STRING
   has one tension; each separate string carries only the mass behind it."

No other state carries a misconception_watch.

## 6. `has_prebuilt_deep_dive` picks + drill-down clusters (cache hints, not gates)

- **S3**: `tension_equals_weight_always` · `string_transmits_weight_not_force` ·
  `tension_while_accelerating`
- **S5**: `same_tension_everywhere_chain` · `front_string_vs_rear_string` ·
  `tension_equals_applied_force` (the real "T₂ = F" error — countered on screen: T₂ = 2 N < F = 3 N)

All 7 states still show the Explain button; un-flagged states route to the feedback form (Rule 18).

## 7. entry_state_map (v2.2)

```
foundational: STATE_1 → STATE_4   # what tension is; T set by motion; one string, one T
chain:        STATE_5 → STATE_6   # T₁ ≠ T₂ — tension in a chain of bodies
```

Default aspect = foundational. **PRIMARY aha lives in S5 (chain slice), OUTSIDE foundational →
the foundational slice declares a MANDATORY exit-pill** ("Is T the same when there are TWO
strings?") into the chain slice — the coverage rule's explicit second branch. (S5 cannot move into
foundational: it needs S4's earned wrong belief immediately before it.)

## 8. Prerequisites (advisory only, Rule 23)

`normal_force` (this branch — N on the surface body), `newton_second_law` (a = F/m reasoning in
S3/S5), `free_body_diagram` (arrow vocabulary). **`connected_bodies` is the FOLLOW-ON, not a
prerequisite** — S7 narration points to it as "how to solve these systems." Legacy
`tension_in_string` (dead mechanics_2d): classifier synonyms `tension` / `rope_tension` redirect
HERE (lom_e_design §0); `atwood_machine` stays pointed at `connected_bodies`.

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral, plain English)

Primary: **a luggage tow train** — a small tractor pulling a line of baggage carts, seen at any
airport on Earth. It is literally the S5 apparatus: the coupling nearest the tractor pulls every
cart behind it, so it carries the largest tension; the last coupling pulls only one cart. Secondary:
**an elevator cable** — while the car accelerates downward the cable's tension is less than the
car's weight (the S3 fact, felt in the stomach). Both are findable anywhere, age-appropriate,
brand-free, and physics-true at full depth (the ideal massless-string idealization is stated
honestly in narration). DC Pandey check: consulted the Laws of Motion table of contents for scope
only (string tension and connected blocks are standard sub-topics) — no teaching sequence, example
problem, or figure imported.

## 10. Definition of Done (Gate 0 — no TBDs)

(a) 7 states as tabled. (b) Symbol-label table (engine Unicode sprites): T · T₁ · T₂ · m₁ · m₂ ·
m₃ · m₂g · N · fₖ · F · a · μₛ · μₖ — narration names each once before relying on it; cart labels
m₁ (rear P), m₂ (Q), m₃ (front R) so T₁ = m₁a reads directly off the screen. (c) RHR plan: N/A (no
cross products). (d) Motion plan = the archetype + motion-budget columns (§3/§4); no static state;
every accelerating state's run arithmetic is computed above and the halt is choreographed as the
end of the run. (e) Modes: conceptual only. (f) `assessment` + `coverage_map` authored;
misconception_watch exactly at S3/S5. (g) Macro↔micro (Rule 33): N/A-macro — live T/T₁/T₂/a
readouts + segment sprites carry the real-number duty. (h) Canvas budget (Rule 34): one formula
line per state as tabled, ≤5-word delta cues, value-only HUD; overlays in distinct zones (HUD
clears the review chrome). (i) Curriculum-flex (Rule 38): rings core ×6 + extended ×1 (S6),
advanced ring EMPTY (contiguity vacuously satisfied). Cut checks — hide advanced: identical, all 7
survive ✓; hide advanced+extended: S1–S5 + S7 survive; S5 still shows the T₁ ≠ T₂ fact (the why is
deferred), S7's formula `a = F∕(m₁+m₂+m₃)` uses only symbols established in core S5, and NO
surviving narration/caption/formula may reference S6's per-string formula (constraint handed to
physics_author) ✓. Explore state = CORE ring content only (38b) ✓. Notation ladder: algebra only
throughout (38c) ✓. Dialect: "string" dual-labelled once as "string (rope/cord)" then bare (38d).
Graphs: none → axis conventions N/A (38e). `curriculum_tags`: CBSE/NCERT Class-11 Laws of Motion =
verified (tension + connected blocks are core NCERT); ISC, JEE/NEET, IB, A-Level, AP = authored as
claims with `needs_teacher_verification: true` (38g). Preset proposal (hide, never reorder — 38h):
`full` = all 7; `standard` = hide nothing (advanced empty); `intro` = hide extended (S6).
Registration (spec §8): sites 1–6, NOT `PCPL_CONCEPTS`, plus the `tension`/`rope_tension`
`CONCEPT_SYNONYMS` redirect. Wording register: clone `friction_force` (post-Rule-41), not its
content.

## Two-pass lens

**Block 1.** Prerequisite cliffs: `newton_second_law` missing → S3/S5 break ("why a = F over total
mass?") — S3 carries one clause "the net force divided by the total moving mass gives the
acceleration"; `normal_force` missing → S1's N arrow — one clause "the table holds block A up";
`free_body_diagram` missing → the arrow census — S1's reveal-build names each arrow as it appears
(which it does anyway). JEE-backwards trace: "Three 2-kg blocks on a frictionless table are joined
by two strings and pulled by a horizontal force of 3 N. Find the tension in each string." Needs:
one shared a = F/M (S5), each string = mass behind × a (S6), tension acts along the string at both
ends (S1/S4) — delivered. Second standard item: "a block hangs from a string in a lift accelerating
downward — is T more or less than mg?" → T = m(g−a) (S3) — delivered. Misconception-entry mapping:
"T = weight" is PLANTED by S1/S2's at-rest reading by design and flagged at the planting moment
(S2: "at rest — and only at rest"); confronted at S3 (§5). "Same T everywhere" is planted by S4's
one-string rule, precisely scoped at planting ("one STRING"); confronted at S5 (§5).

**Block 2.** PRIMARY aha (S5): *one pull, two different tensions — a string only has to move the
mass behind it, so T₁ ≠ T₂.* SUPPORTING aha (S3): *the string has no fixed tension of its own — the
motion sets it (T = m₂(g−a) < m₂g the moment it accelerates).* Cohesion: S3 is the mechanism the
primary runs on — because T is set by what must be moved, each string in a chain reads differently;
if T were a property of the string, every string would read the same. Wrong-belief setup: S1–S2
earn "T = the hanging weight" (broken by S3); S4 earns "tension is the same throughout" (broken by
S5). Foundational-coverage rule: satisfied via the declared mandatory exit-pill (§7).

## Engine-bug-queue consultation

DB not runnable from this read-only architect context; consulted the committed scar surfaces:
`docs/loop_runs/lom/connected_bodies/skeleton.md` (applied-scar list + GAP CANDIDATES),
`docs/loop_runs/lom/lom_e_design.md`, `NEWTONS_LAWS_BODY_ENGINE_SPEC.md` §6 flags, and the live
renderer config surface (train block + NLB_SLIDER_SPEC + nlbApplyParam, read this session).
Applied: per-state near side-on camera, ONE shared camera per rig; short one-line formulas
(formula-width scar); ALL timing via `phases[]` (never hardcoded `*_at_ms`); specific glow ids
only; inert `field_lines`; constant per-id `hanging` → disjoint rig ids A/B vs P/Q/R (bring-up
scar); cart spacing 2.5 m ≥ 1.5 m minimum (hidden-rope rule); `train.body_ids` rear→front with
ascending `initial_position_m`; `idle_auto_sweep.range[0]` and `param_ramp.from` = the state's own
authored value; durations cover narration (duration-clamp scar); `slider_controls` sized at
authoring time incl. the F ≥ 0 slack rail (the lom-c/lom-d widening lesson). FLAG to
quality_auditor: confirm no new FIXED rows for `alex:architect` since 2026-07-25, and verify the
S2 body-order ramp trick + coupled-train drag against `_scratch_nlb_seams.ts` behavior.

## ENGINE GAP CANDIDATES (checked against spec §1 — train and wheel already covered; these are new)

1. **(MINOR, new) `param_ramp` has no `'m2'`** (enum: theta|F|mu_s|mu_k|m). S2 needs the HANGING
   load to ramp. Designed around with documented behavior: `'m'` targets the FIRST non-ghost body
   in authored array order (`nlbSliderBodies`), so S2 authors `bodies: [B, A]` and ramps 'm' with
   no slider row visible. Works, but it is subtle and order-fragile — a one-token enum addition
   (`'m2'`) would make it boring. Founder's call; the JSON ships either way.
2. **(RECURRENCE) No run-loop/replay for an accelerating guided state** — `connected_bodies` GAP
   CANDIDATE 1, unchanged. S3 (1.43 s) and S5/S6 (5.10 s) halt at the bound and hold for the rest
   of the dwell; halts are narrated as the end of the run. If `run_loop` lands before the json
   pass, S3/S5/S6 adopt it — json_author checks at authoring time.
3. **(MINOR, new) Train drive direction has no engine guard** — a negative/rear applied force
   slackens segments and hides ropes (correct render of a real zero, but a sandbox foot-gun).
   Designed around: F targets the front cart by authored body order + `slider_controls.F.min = 0`.
   Candidate: engine-side clamp or a validator warning for train states with F < 0 reachable.
4. **(MINOR, new) Only 2 of 3 train carts have mass sliders** (m/m2 → bodies[0]/[1] = R, Q; rear
   P fixed at 2 kg in the sandbox). Accepted — two adjustable masses already change T₁, T₂ and
   their ratio. Candidate if wanted: an `'m3'` slider token.

## ORCHESTRATOR CONFIRMATION of the slider-target reasoning (read from the committed renderer, 2026-07-30)

Verified against `nlbApplyParam` / `nlbSliderBodies` / `nlbForceTargetBody` in
`src/lib/renderers/field_3d_renderer.ts`, and against `nlbTrainTensions` / `nlbFitRopes`:
- `m` → `nlbSliderBodies()[0]`, `m2` → `[1]`, both being the first/second NON-GHOST body in
  AUTHORED `bodies[]` order. The S2 `[B, A]` ramp trick and the S5–S7 `[R, Q, P]` order are
  therefore correct as written.
- `F` → `nlbForceTargetBody()` = the `action_reaction` driver if engaged, else
  `nlbSliderBodies()[0]`. With `[R, Q, P]` that is R, the FRONT cart — exactly as the skeleton
  requires, so the train sandbox is unaffected by the single-target semantics.
- `mu_s`/`mu_k` write EVERY non-ghost, non-hanging body (the coefficients belong to the CONTACT).
  For S7's train that is all three carts together, which is correct — they share one table.
- SEAM H reads segment order from `train.body_ids`, NOT from the authored `bodies[]` array, so the
  deliberate `[R, Q, P]` authoring order cannot disturb which rope is T₁ and which is T₂. Confirmed
  in `nlbTrainTensions` and the `nlbFitRopes` train branch.
