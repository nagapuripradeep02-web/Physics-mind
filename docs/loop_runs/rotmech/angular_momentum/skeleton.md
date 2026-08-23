# Skeleton — `angular_momentum` (rotmech · Class 11 Ch.7 · concept #9 · Phase 0d, Desk C)

> **Status:** Phase-0d architect skeleton, authored FROM SCRATCH against the FROZEN `rigid_body_rotation`
> contract (`field_3d_renderer.ts:939–1058` interface · `:49736–50767` implementation, BUILT and MERGED).
> **Rule 12 applies fully:** every config field this skeleton consumes is verified IMPLEMENTED with a
> `file:line` citation in the ENGINE-REALITY WALK; no declared-inert member is consumed anywhere.
> **Bug-queue consultation (LIVE table via Bash, this session):** `--owner alex:architect` → **63 rows** ·
> `--row-type directive` → **83 rows** · `--field3d --open` → **85 rows** · `angular_momentum` → **0 rows**
> (expected — not yet authored) · `rigid_body_rotation` → **1 row**. Union = **157 distinct bug_class
> strings**, every one dispositioned VERBATIM in the SCAR AUDIT (both directions checked).
> **DC Pandey check:** chapter table of contents only (Ch.7 scope confirmation). No teaching method,
> example problem, or figure imported. NCERT = syllabus backbone only.
> **Namespace check:** `angular_momentum` exists in neither `src/data/concepts/` nor
> `src/data/concepts/chemistry/` (checked by `ls` this session); it is pre-registered in
> `VALID_CONCEPT_IDS` (`src/lib/intentClassifier.ts:1274`) with the scope line this skeleton obeys.
> **Apparatus:** `APPARATUS_CONTRACT.md` §1 obeyed field-for-field; every pinned value authored
> explicitly; home pose r = 0.80 m, ω = +1.50 rad/s, m = 2.0 kg, τ_brake = 0 (I = 3.06 kg·m²,
> L = 4.59 kg·m²/s). One continuing machine with `conservation_of_angular_momentum` (Desk A).

---

## 1. Atomic claim

This concept teaches ONE thing: **a spinning body carries angular momentum L = Iω — a real physical
quantity set by BOTH the spin rate ω and the moment of inertia I, and it is a VECTOR pointing along the
rotation axis by the right-hand grip rule.** It does not cover what happens when L is conserved
(`conservation_of_angular_momentum` — no state in this concept ever changes r while the body spins), how
I is computed from the mass distribution (`moment_of_inertia`), τ = Iα (`tau_eq_i_alpha`), or W = τθ /
KE_rot (`rotational_work_energy`). The advanced form L = r × p is **BLOCKED** on the inert
`cross_product_construction` and is NOT authored (see §2 and §10(i)).

## 2. State count + arc — 5 states (4 guided + 1 explore), core + extended rings ONLY

Complexity call: **simple–medium (§5 band 3–4, +1 for the vector beat = 5)**. The concept needs the
definition, its two proportionalities (ω and I), its vector nature, and an explore state. It does NOT
need a conservation event, an energy story, or a derivation — those belong to its siblings.

**The ring constraint, stated explicitly (Rule 38a under the 0c-3 block):** this skeleton authors the
**core and extended rings only**. The advanced ring — **L = r × p, a particle on a straight line still
has angular momentum about a point** — requires `cross_product_construction`, which is DECLARED BUT
INERT in the frozen contract (`field_3d_renderer.ts:952–954`; reading it is a silent no-op). It is not
authored, and no stub state exists for it. §10(i) pins the exact insertion slot for the later retrofit.

| State | Title (Rule 41 — literal, first words carry meaning) | Purpose | teaching_method | advance_mode | Ring |
|---|---|---|---|---|---|
| S1 | A spinning body carries angular momentum | Definition: name L, restate I and ω (prerequisites), build the three readouts in ledger order | *(straightforward beat)* | manual_click | core (qualitative) |
| S2 | Slower spin, smaller L | ω-proportionality, used PREDICTIVELY: a brake slows the spin; L = Iω predicts where L lands (chip at 1.53) and the live readout meets it; I never moves | *(straightforward beat)* | manual_click | core (quantitative) |
| S3 | Same spin speed, smaller L | THE PRIMARY AHA + misconception pivot: stop → move the masses in while STILL → restart at the SAME ω = 1.50 → L reads 0.99, not 4.59. Spin rate alone does not fix L | `misconception_confrontation` | manual_click | core (quantitative) |
| S4 | L points along the axis | Vector nature: grip rule, sign colours, two restarted runs of opposite spin — arrow up, then down | *(straightforward beat)* | manual_click | extended |
| S5 | Try it yourself | Sandbox: m and ω₀ each RESTART → L re-pins from the new I·ω₀ — the product explored live | `exploration_sliders` | interaction_complete | *(explore — core-ring content only)* |

**Rule 38a walk, BOTH clauses:** ladder reads qualitative (S1) → quantitative (S2–S3) → extended (S4)
→ *(advanced slot: EMPTY, blocked — see §10(i))* → explore (S5). Rings are monotone; the advanced ring,
when it lands, is a single contiguous state inserted immediately before S5 — an INSERTION, never a
restructuring. `advance_mode`: ≥2 distinct modes ✓ (Gate 12).

**The hardest design problem, solved deliberately (verified engine reality #1):** ω is ALWAYS derived
as L(t)/I(t) (`rbrOmegaAt`, `:49945`), so ANY r motion while spinning under τ_ext = 0 renders the
conservation behaviour (L pinned, ω rising) — which is `conservation_of_angular_momentum`'s PRIMARY aha
and must not appear here, even accidentally. This skeleton's rule: **r never changes while the body
spins, in any state.** S3 changes r ONLY while the platform is braked to rest — during the slide L = 0
(rest-clamped), so ω = L/I = 0 for every value of I(t): there is nothing to conserve and nothing speeds
up; the one visible motion is the masses sliding on a still platform while the I readout falls as pure
geometry. The "same ω, different I ⇒ different L" payload is then delivered by the RESTART mechanism
(verified engine reality #2): `rbrAnchor` (`:49915–49926`) re-seeds L₀ = I(r at effective time)·ω₀·sign,
re-pinning ω to exactly 1.50 with `flip_spin: false` set EXPLICITLY (the default is TRUE — `:50548`
`flip_spin: rb.restart.flip_spin !== false` — an unset flag would silently reverse the spin and teach
the wrong lesson). The `repin_cue` blank (≥500 ms, `:50505`, badge "restarting" `:50460`) makes the L
discontinuity read as a restart, never as an uncaused torque. And in S5 the r slider is **excluded
outright** (see §3, explore row) so no teacher drag can stage the sibling's aha inside this sandbox.

## 3. Per-state choreography + control plan (Rule 31 control table)

**Coined archetypes (two, each justified once):**
- `decay-track` (S2) — a rendered agent drives a smooth decay while two readouts fall in locked
  proportion and a third holds; the distinct picture is the lockstep fall meeting a pre-printed
  prediction chip. (Not `oscillate/track`: nothing is periodic.)
- `stop-and-reconfigure` (S3) — the apparatus is halted, its shape is changed with ZERO dynamics on
  show, then relaunched so the consequence is read against the remembered baseline. (No seed archetype
  covers a beat whose point is that the interesting change happens while nothing moves dynamically.)

**Vehicle-vs-archetype note (honest):** the brake pad appears as a VEHICLE in both S2 and S3. The
declared archetypes differ because the distinct pictures differ — S2's picture is the proportional fall
onto a prediction chip; S3's picture is the still-platform reshape and the same-speed relaunch. The pad
is a stagehand in S3 (narrated as "the brake stops the turntable", one clause) and the star's cause in
S2. Declared-archetype repeats: none anywhere.

**Archetype-discharge rule (scar `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control`):**
every archetype below is discharged by motion the AUTHORED beat produces with no teacher input, INSIDE
its own state — S3's I-contrast is intra-state (stop → slide → restart all on the state clock), never a
between-state delta. The S4 toggle is a Rule-31 contextual control layered on an authored loop.

| State | Teaches (one idea) | Archetype | Authored beat (no teacher input; cause → effect) | Delta cue | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|
| S1 | A spinning body carries L = the product of I and ω | `reveal-build` | Turntable already spinning at ω = 1.50, masses at r = 0.80 (home pose; the drum's marker stripe makes the spin legible). Readouts build ONE at a time, each only AFTER its defining sentence (`readout_at_ms`): I = 3.06 at ~2.0 s, ω = 1.50 at ~2.8 s, L = 4.59 at ~3.6 s. **No L arrow and no formula surface in S1** — both are static per-state overlays (arrow `:50607–50619`, formula `:50570–50574`, neither timeable), so showing either from t = 0 would print the symbol before its defining sentence (scar `symbol_printed_on_canvas_before_the_lesson_defines_it`). They debut at S2 entry, AFTER S1 has defined L. Anchor (~7 words) lands here | **"Spin carries angular momentum"** | none | 35–50 | core |
| S2 | L falls in exact proportion to ω (I fixed) — and L = Iω predicts the landing value | `decay-track` | Arrow + formula debut at entry (L already defined). 0–2.4 s: narration makes the prediction; the chip **"predicted L = 1.53"** reveals beside the L readout (`reference_marks` chip form, `at_ms` 2000). 2.5–3.6 s: the pad translates in (CAUSE — `pad_travel_ms` 1100). 3.6–7.0 s: τ = 0.90 N·m decays L 4.59 → 1.53 linearly; ω falls 1.50 → 0.50 in lockstep; **I holds 3.06 with `hold_glow`** — the unchanging ratio IS the lesson; the L arrow shrinks in EXACT proportion (0.918 → 0.306 world units; both ends clear the 0.22 floor, `:49796–49797`). At 7.0 s the pad releases; the live L lands on the chip and the MATCH latch co-glows both (`:50271–50278`). Held to state end (pad retracts 7.0–8.1 s — motion only, nothing asserted on it) | **"L falls with the spin"** | none | 40–55 | core |
| S3 | The same spin speed can carry much less L — mass position matters | `stop-and-reconfigure` | 0–2.0 s steady home spin (baseline re-seen). 2.0–2.6 s pad in; τ = 2.00 stops the platform at t ≈ 4.90 s (analytic 2.295 s decay; closed-form clamp `:49937–49944`, no integrator lag) — narration: stopped means ω = 0, so L = 0 (an L = Iω fact, not a torque lesson). Release at 5.2 s. **5.6–7.6 s: `param_ramp` slides r 0.80 → 0.20 on the STILL platform** — the only mover is the mass pair; the I readout falls live 3.06 → 0.66 (pure geometry; ω and L pinned at 0.00). At 7.6 s the chip **"same speed: 1.50"** reveals beside the ω readout. **Restart at 8.0 s, `flip_spin: false` EXPLICIT**, blank 500 ms (badge "restarting") → at 8.5 s the spin resumes at exactly ω = 1.50 (chip match co-glows) — **but L reads 0.99, not 4.59**. Held. **`show_l_arrow: false` in this state**: the arrow floor (`RBR_L_ARROW_MIN` 0.22, `:49797`) would draw a nonzero stub through the whole L = 0 dwell — a rendered lie (finding F-C2 filed); the L quantity rides its readout + the S2-established arrow memory | **"Same speed, smaller L"** | none | 40–55 | core |
| S4 | L is a vector along the rotation axis (grip rule) | `cycle-compare` | Default 3/4 framing (vertical axle fully in frame — no per-state camera field exists in the frozen contract, none consumed). Run A (0–4.0 s): spin +1.50, the articulated grip hand curls continuously with the rim (2600 ms curl loop, `:50748–50764`), L arrow UP, blue (`RBR_POS_COLOR`). Cut at 4.0 s (`restart` `at_ms` 4000, `every_ms` 6500, `flip_spin: true` — authored explicitly even though it is the default), blank 500 ms → Run B (4.5–10.5 s): spin −1.50, hand flips 180° about world X (orientation-preserving — still a right hand, `:50746–50750`), arrow DOWN, amber; readouts print signed values with the real U+2212 minus (`rbrFx`, `:49817–49823`). Loop repeats. **First and only state to narrate direction.** Secondary anchor (~9 words) lands here | **"L points along the axis"** | spin-direction button *(min_ring: extended)* — drives the SAME restart mechanism live (`:50100–50111`), never eased through zero | 35–50 | extended |
| S5 | Sandbox — L tracks the product I·ω | `drag-sandbox` | `mode: 'sandbox'`, free-running (Rule 37). Entry = home pose, spinning. **Control semantics (all verified):** dragging `m` or `ω₀` fires a RESTART (`rbrApplyParam`, `:50071–50078` → `rbrRestartNow` `:50053`) — L re-pins from the new I·ω₀ with the blank + "restarting" badge, so **L visibly tracks the product: exactly this concept's lesson**. The spin-direction button restarts with the sign flipped. **`r` is EXCLUDED** (the hazard ruling below). **`tau_brake` is EXCLUDED** (finding F-C1: a live τ drag applies torque while the pad stays invisible/parked — an invisible cause; see ENGINE-REALITY WALK). **No `idle_auto_sweep`**: the only implemented sweep param is `r` (`rbrRAt`, `:49857–49862`), which is excluded — and an unattended r sweep would loop the sibling concept's conservation aha on screen. Until the first trusted input the machine simply spins live, which satisfies Rule 37 | **"Try it yourself"** | `m` *(core, 0.5–5.0 kg)* · `ω₀` *(core, 0.5–3.0 rad/s)* · spin-direction *(extended)* | 0 / open | *(explore)* |

**Archetype audit:** reveal-build (S1), decay-track (S2), stop-and-reconfigure (S3), cycle-compare
(S4), drag-sandbox (S5). No repeats, no static state; drag-sandbox on the explore state only.

**The explore r-hazard, ruled on (verified engine reality #4):** in sandbox, dragging `r` does NOT
restart (`rbrApplyParam` `:50068–50070` clamps and returns) — L holds and ω rises: the conservation
behaviour, which is (a) NOT this concept's lesson and (b) the sibling's PRIMARY aha, pre-spoiled to any
teacher who drags the most tempting slider first. **Resolution: `r` is simply not named in S5's
`controls_visible`** — `controls_visible` is a per-state authored list (`:1051`, consumed
`:50128–50142`), and `rbrBuildSliderRows` builds only the union of tokens named ANYWHERE in the concept
(`:50015–50025`), so the r row never exists in this concept's panel at all. Defense: `m` already gives
clean I-variation WITH restart semantics (I = 0.50 + 2mr²), so nothing pedagogical is lost; the teacher
who wants the r-drag experience gets it in `conservation_of_angular_momentum`'s sandbox, where it IS
the lesson. No engine change requested — the asymmetry is CORRECT for the sibling; this is an
authoring-side resolution.

**Readout metrics (scar `derived_readout_asserted_by_value_without_defining_its_metric`):** all rows
are engine closed forms of state-local ms — I = I_frame + 2·m·r(t)² (`rbrIOf` `:49865`), L =
sign·max(0, |L₀| − τ·braked_s) (`rbrLAt` `:49937`), ω = L/I (`:49945`), all published from ONE snapshot
per frame (`:50230`). This concept authors `readouts: ['I','omega','L']` only — every token inside the
closed set `RBR_RO_META` (`:50147–50154`). **KE, dLdt, F_pull are deliberately NOT shown**: KE_rot
belongs to #8, dL/dt to the sibling's advanced ring, and F_pull to no beat here (`show_pull_arrows`
false everywhere — no untaught force on screen). Nothing outside the closed set is needed → this
concept is NOT blocked on 0c-3 for any readout.

**Rule 32 legibility:** cause before effect (S2 pad travels 1.1 s before the decay; S3 slide completes
before the restart; S4 cut-blank before the flipped run) · only the taught variable moves per guided
state (S1 nothing but the standing spin + readout builds; S2 the decay; S3 one mover at a time,
sequentially; S4 the sign) · delta cues ≤5 words, each the caption opener · same machine from the home
pose every state, single-frame re-pose at entry, no teleport-rebuild · ONE scene glow focal per instant
(per-state `glow_focal` + `phases[]` re-aim it, `:50647–50657`; readout `hold_glow` is the separate
instrument channel, `:50206–50218`, so the relation's halves are never scene-dimmed — scar
`state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` discharged by channel
separation). Focal plan: S1 `rbr_spin` · S2 `rbr_brake_pad` · S3 phases: pad → masses → `rbr_spin` at
the relaunch · S4 `rbr_l_arrow` (the hand is a named mesh, never dimmed — Rule 29) · S5 none.

**Rule 33 macro↔micro:** N/A-with-justification — the taught variable's mechanism (spin + mass
placement) IS the visible apparatus. Instruments (33d): value-only HUD, live 2-dp numbers, the 2-dp
convention shared with the sibling (one machine, one rounding).

**Rule 34 canvas budget:** top caption = the ≤5-word delta cue only; ONE formula surface per state —
S1 **none** (ledger rationale in the S1 row), S2/S3/S5 **`L = Iω`** (`#rbr_formula`, Cambria Math,
`:50446–50449`), S4 **none** (the picture is the lesson); all surfaces symbolic — numeric claims live
only in the HUD and the two chips the live readouts MEET on screen; all on-canvas math real Unicode
(ω, kg·m², U+2212 minus via `rbrFx`).

**Pin-margin table (pin = clamp(0.60R, 150, R−150); margins measured from the LAST asserted event, ≥167 ms):**

| State | Last asserted event (design est.) | R (authored) | Pin | Margin | Frozen frame photographs |
|---|---|---|---|---|---|
| S1 | L readout printed ~4.4 s | 8 s | 4.8 s | 0.4 s ✓ | all three readouts live at the home values |
| S2 | match latch fires at release, 7.0 s (pad retract 7.0–8.1 s is un-asserted motion) | 13 s | 7.8 s | 0.8 s ✓ | L = 1.53 co-glowing its prediction chip; I = 3.06 hold-glow; ω = 0.50 |
| S3 | restart effective 8.5 s (readouts un-blank; the ω chip match latches on the same evaluation — a re-pin is instantaneous, not a sweep) | 15 s | 9.0 s | 0.5 s ✓ | ω = 1.50 matched to its chip; L = 0.99; masses visibly at r = 0.20 |
| S4 | Run B under way from 5.0 s (cut 4.0 + blank 0.5 + settle) | 13 s | 7.8 s | 2.8 s ✓ | arrow DOWN, amber; hand flipped; signed readouts −1.50 / −4.59 |
| S5 | open/continuous (Rule 37 — never freezes) | — | — | — | live spin |

Discrete-event note (scar `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows`):
S3's stop instant (≈4.90 s) is a CLOSED-FORM clamp (`:49941–49943`), not an integrator sign-flip —
exact, and nothing is pinned on it anyway. physics_author recomputes every window at the engine's 16 ms
grid. THE EYE must read DENSE frames across S2 3.6–7.0 s, S3 5.6–8.7 s, and S4 3.5–5.5 s (scar
`teach_read_dense_ramp_frames_not_just_frozen`).

**Numeric ground truth (2-dp convention shared with the sibling; all hand-computed from the engine's own closed forms):**

| Quantity | Home (S1/S2/S4 entry) | S2 held | S3 stopped | S3 relaunched | S4 Run B |
|---|---|---|---|---|---|
| I (kg·m²) | 3.06 | 3.06 | 3.06 → 0.66 during the slide | 0.66 | 3.06 |
| ω (rad/s) | 1.50 | 0.50 | 0.00 | 1.50 | −1.50 |
| L (kg·m²/s) | 4.59 | 1.53 | 0.00 | 0.99 | −4.59 |

Checks: S2 decay 0.90 N·m × 3.4 s = 3.06 exactly → L 4.59 − 3.06 = 1.53; ω = 1.53/3.06 = 0.50 exactly
(no rounding collision — 1.53 = 4.59/3 exactly). S3 stop time 4.59/2.00 = 2.295 s; relaunch L =
I(0.20)·1.50 = (0.50 + 2·2.0·0.04)·1.50 = 0.66·1.50 = 0.99 exactly; ω = 0.99/0.66 = 1.50 exact (chip
tolerance 0.01 trivially met). No two displayed values collide within a state except I = 3.06 appearing
in S2/S3 as the SAME constant it is — no cross-quantity coincidence anywhere (the sibling's S5
L-sweeps-through-3.06 window does not occur here: S2's L range 4.59→1.53 passes 3.06 at ~5.3 s, so
narration/glow must not stage an L-vs-I comparison during the S2 decay — physics_author constraint).

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots)

| Wrong belief | At | `misconception_watch` beat |
|---|---|---|
| **"Angular momentum is just spin speed with a fancier name — same spin rate, same L"** | **S3** | belief: the restarted platform spins at exactly the speed it started with, so L should read 4.59 again · visual_counter: the ω readout matches its "same speed: 1.50" chip while the L readout shows 0.99 — a 4.6× drop at identical spin rate, with the masses visibly sitting close to the axle · one_line_fix: L = Iω — the same ω carries less angular momentum when the mass sits near the axis |
| **"Momentum points the way things move — so L should point along the motion"** | **S4** | belief: L should aim where the masses are heading · visual_counter: each mass's heading changes every instant (the spin itself shows it, always on screen), while the L arrow stands fixed along the axle; flip the spin and the arrow flips along the SAME line · one_line_fix: no single motion direction fits a spinning body — L points along the axis, by the right-hand grip rule |

Named primitives for each wrong picture (scar `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive`),
all BUILT: S3 needs the ω chip (`reference_marks` chip, `:50164–50177`), the L readout (`:50147`), the
sliding masses (`rbr_mass`, `:50356–50361`), the restart badge (`:50457–50461`). S4 needs the L arrow
with sign colour (`:50704–50718`), the grip hand (`:50414–50433`), the always-on spinning apparatus.

S1, S2, S5 carry NO misconception_watch (founder guardrail 2026-07-04). EPIC-C branches: **zero**.

Planting-risk note (cross-concept seam): S3 shows "masses moved in ⇒ L ended smaller", which a student
could wrongly carry into #10 (where masses-in at τ = 0 holds L). The narration attributes the change
explicitly to the RESTART at the same speed — "restarted at the same speed as before, the closer-in
masses carry less angular momentum" — never to the slide itself; the badge and blank make the re-seed
visible. The sibling's pull-in state then teaches the τ = 0 case on the same machine.

## 5. `has_prebuilt_deep_dive` states (2)

**S3** (the primary aha; "isn't L just the spin rate?" is where the concept's identity sticks) and
**S4** (direction/RHR — the historic sticking point for every axial vector). V1.0 ships zero authored
deep-dives (Rule 18); the flag marks investment priority only — every state shows the Explain button.

## 6. Drill-down clusters (3 per flagged state; physics_author fleshes out trigger phrases)

**S3:** `l_vs_spin_speed_identity` (isn't L the same thing as how fast it spins) ·
`why_mass_position_matters` (why does where the mass sits change L at the same speed) ·
`stopped_body_zero_L` (does a stopped body keep any angular momentum).
**S4:** `which_way_does_L_point` (how can a spin have a direction) · `right_hand_rule_how` (how do I
actually use the right-hand rule here) · `why_axis_not_tangent` (why not along the motion of the mass).

## 7. `entry_state_map`

```
entry_state_map:
  foundational:     STATE_1 -> STATE_3   # definition + both proportionalities; contains the PRIMARY aha
  vector_direction: STATE_4              # "which way does L point"
```

Default `foundational`. PRIMARY aha (S3) inside the foundational range ✓ — no exit-pill needed.
*(When the blocked advanced state lands, the map gains `derivation: <the inserted state>` — §10(i).)*

## 8. Prerequisites (advisory — Rule 23)

`rigid_body_rotation` (#3 — the machine and "every point shares one ω"), `rotational_kinematics`
(#4 — ω itself), `moment_of_inertia` (#6 — I itself). `torque` (#5) is NOT listed: this concept never
uses the word torque in any reader-facing string — the brake is narrated as "a brake", and the τ glyph
never appears because the tau_brake slider row is never built. Linear momentum p = mv is prior
knowledge from the momentum chapter — referenced in ONE S1 narration clause as an analogy, and NOT
named in the prerequisites array (no registered concept id exists for it; naming a dangling id is
forbidden).

> **⚠ OPEN FOUNDER QUESTION (do not resolve at this desk — flagged per the dispatch and
> `rotmech_c_state.md` §Open item):** `torque` (#5) and `moment_of_inertia` (#6) precede this concept
> in the approved teaching order and are registered in `VALID_CONCEPT_IDS` — but have NO concept JSON
> yet. A `prerequisites` array naming `moment_of_inertia`, `rotational_kinematics`,
> `rigid_body_rotation` therefore points at registered-but-unauthored ids. Rule 23 makes prerequisites
> advisory (a soft UI suggestion, never a gate), so the array is authored as above on the expectation
> those concepts exist by chapter seal — **but the founder ruling must land before this concept seals,
> not at seal.** json_author must NOT silently drop the array or silently substitute ids.

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral, state-assigned with word budgets)

**Primary: a playground merry-go-round** — assigned to **S1**, ~7 words reserved ("a playground
merry-go-round carries it the same way"). It is physically the EXACT system rendered (a flat platform
spinning on a vertical axle with mass out on its arms), recognisable in any country, and pre-spoils
nothing — it lands on the definition it illustrates. **Secondary: a spinning bicycle wheel held by its
axle** — assigned to **S4**, ~9 words reserved ("hold a spinning bicycle wheel by the axle — L lies
along it"). The axle in the hands IS the direction claim, graspable literally; the canonical classroom
demonstration of an axial vector, widest-syllabus-overlap (38f). No region constants anywhere. The
catalog's India-specific anchors (survey §Rule-35 conflict) are NOT imported. Both anchors appear in
the drafted narration plan (scar `skeleton_anchor_specified_in_section_9_reaches_no_narration_line`).

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 5 of §2, exactly as tabled in §3.

**(b) Symbol-label table + term-introduction ledger:**

| Quantity | Label / surface | DEFINED at | First PRINTED at | ✓ |
|---|---|---|---|---|
| Moment of inertia | `I` HUD row, `3.06 kg·m²` | S1 sentence 2 (one-clause prerequisite restatement) | S1 `readout_at_ms` ~2000 | ✓ |
| Angular speed | `ω` HUD row, `1.50 rad/s` | S1 sentence 3 (one-clause restatement) | S1 ~2800 | ✓ |
| Angular momentum | `L` HUD row, `4.59 kg·m²/s` | S1 sentence 4 ("their product is the angular momentum L") | S1 ~3600 — after the sentence | ✓ |
| L vector | axle arrow + `L` sprite (blue/amber by sign) | S1 (defined) | **S2 entry** — the arrow is a static per-state overlay (`:50607–50619`, untimeable), so it debuts one state AFTER the definition, never before | ✓ |
| The relation | `L = Iω` formula surface | S1 states it in words; S2 shows and USES it | **S2 entry** — same static-overlay reasoning; S1 carries NO formula surface | ✓ |
| Prediction chip | "predicted L = 1.53" | S2 prediction sentence (~0–2.0 s) | S2 `at_ms` 2000 — after the sentence | ✓ |
| Brake pad | pad mesh + "brake" label | S2 sentence naming it at state open | S2 t = 0 (pad visibility is per-state static, `:50627–50631`; parked until 2.5 s) — co-timed with the naming sentence at open | ✓ |
| Restart badge | "restarting" | self-defining literal word (Rule 41) | S3 8.0 s / S4 4.0 s / S5 on m/ω₀/direction events | ✓ |
| Same-speed chip | "same speed: 1.50" | S3 sentence before it | S3 `at_ms` 7600 | ✓ |
| Signed values | U+2212 minus on ω, L | S4 ("spinning the other way") | S4 Run B | ✓ |

NOT drawn anywhere: `r` line and label (`show_r_line` false — the r symbol is #6/#10 vocabulary; the
mass positions are directly visible), `R_drum` line (`show_drum_line` false — with zero radius
reference lines on screen there is nothing to conflate, and no narration cites any radius value),
pull arrows, KE/dL/dt/F rows, the τ glyph (no tau_brake row is ever built). json_author note: every
teacher_script glow target must name an element in `RBR_ELEMENT_TYPES` (`:50586–50592`) or a HUD row
id — glow-target set ⊆ built ids (scar `ecp_glow_targets_missing_primitives`).

**(c) Right-hand-rule plan:** S4 uses the **grip rule** (circulation → axis) via the built articulated
hand (`:50414–50433`) — grip, not cross-product: the cross-product form belongs to the BLOCKED advanced
ring (L = r × p) and is not performed anywhere in this concept.

**(d) Motion plan:** S1 continuous home spin + staged readout builds · S2 pad travel → proportional
decay onto the chip → release + retract · S3 pad stop → still-platform mass slide (I falling live) →
badge-marked restart at the same speed · S4 two-run flip loop with the continuously curling hand ·
S5 free-running sandbox, every parameter change a badged restart. No passive state; every stated number
is produced by the §3 closed forms; every stated agent (the pad, the restart) is a rendered object or
badge.

**(e) Modes:** conceptual-only (Rule 20 [D]) — no `mode_overrides`.

**(f)** `assessment` + `coverage_map` authored by json_author; `misconception_watch` exactly the 2 of §4.

**(g) Macro↔micro:** N/A-with-justification per §3.

**(h) Canvas budget:** per §3. All overlays are the scenario's built fixed-zone panels (HUD top-right
`top:52px` clearing the Full-screen button `:50441–50443`; formula mid-left; sliders bottom-right;
badge top-centre); no new DOM panels authored.

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Preset-cut coherence, BOTH cuts walked:** *Hide advanced:* the advanced ring is EMPTY
  (blocked) — the cut is the identity today, coherent trivially; declared so the preset exists the day
  the L = r × p state lands. *Hide advanced+extended (drop S4):* S1–S3 + S5 — coherent: no surviving
  narration, caption, or formula references direction (S1–S3 never mention it; the arrow in S2 is a
  magnitude indicator whose direction is never narrated — the sibling's exact precedent); spin never
  goes negative in the surviving states, so the sign colours never engage; S5 keeps `m` and `ω₀`
  (core), and the spin-direction button is CUT with S4's ring (min_ring extended) ✓.
- **(i-2) Explore = core-ring content only:** S5's formula surface is `L = Iω`, stated by S1 and shown
  by S2 — both core, surviving every preset ✓; S5's live controls are core except the ring-gated
  direction button ✓.
- **(i-3) `curriculum_tags` (claims, not facts — 38g):** CBSE/NCERT: covered (L = Iω and the axial
  direction are NCERT Ch.7 content) — marked verified. JEE Main/Advanced: core+extended · NEET:
  core+extended · IB DP / A-level / AP Physics C: **every cell `needs_teacher_verification: true`**.
  No preset goes teacher-visible until a real teacher of that curriculum confirms it.
- **(i-4) Presets (hide, never reorder — 38h/25d):** `full` = S1–S5 · `no_derivation` = identical to
  `full` today (empty advanced ring; will hide the L = r × p state when it lands) · `core_only` =
  hide S4 (controls auto-cut by min_ring).
- **(i-5) Graph axes:** no graph in any ring → N/A by design.
- **Dialect (38d):** "angular momentum", "moment of inertia", "angular speed" read identically across
  CBSE/JEE/NEET/IB/A-level/AP; apparatus noun is "turntable" everywhere (the sibling's one-noun rule).
- **THE ADVANCED-RING SLOT, pinned for the retrofit:** the advanced ring is **L = r × p** — a particle
  moving on a straight line still has angular momentum about a point (survey advanced-ring sweep, row
  #9: "the same cross-product construction as #5"). It waits on **`cross_product_construction`**
  (declared-inert, `field_3d_renderer.ts:952–954`; built under 0c-3 per `rotmech_c_state.md`). When it
  lands: ONE new state inserts **between S4 and S5** (keeping the advanced ring contiguous immediately
  before explore, 38a), `entry_state_map` gains `derivation: <new state>`, the `no_derivation` preset
  hides it, and NOTHING else moves — S1–S4 reference no cross-product content and S5's controls and
  formula are core-ring, so the retrofit is a pure INSERTION, never a restructuring.

**Teacher-usability walk (scar `directive_no_gate_asks_whether_a_teacher_could_use_it`):**
(1) *Does anything state the relation and show it in the assessed representation?* Yes — S1 states
L = Iω in words; S2 SHOWS the equation and uses it predictively (the live L lands on the pre-computed
chip — the exam's use of the formula, performed on screen); S3 uses it in the other factor. (2) *First
thing a teacher tries after the aha?* "Change the mass / the speed and watch L" — S5's m and ω₀, each
restart-badged so L visibly re-pins from the product. (3) *Definition precedes use?* Yes — ledger (b).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `moment_of_inertia` → breaks at **S1** (a student without it reads "I" as a
mystery number): patched by one non-condescending clause — "the spread of its mass about the axle is
its moment of inertia I" — co-located with the I readout building. `rotational_kinematics` → **S1**
(ω): one clause, "its spin rate is the angular speed ω", with the ω readout. `rigid_body_rotation` →
**S1** (the machine): the opening sentence names the turntable and its two masses turning together.
No later state introduces prerequisite-dependent vocabulary.

**JEE-backwards trace.** *"A turntable with moment of inertia 3.06 kg·m² spins at 1.50 rad/s.
(i) Find its angular momentum. (ii) The masses are repositioned so I = 0.66 kg·m² and it spins at the
same 1.50 rad/s — find L now. (iii) State the direction of L."* (i) L = Iω = 4.59 kg·m²/s → S1–S2
(definition, units on the readout, the equation shown and used at S2). (ii) 0.99 kg·m²/s → S3 performs
exactly this on screen. (iii) along the axis by the right-hand rule → S4. No missing piece. (M1–M6
magnetism carve-out: N/A — not a magnetism concept.)

**Misconception entry mapping.** Both pivots confronted proactively per §4. Planting risks: (a) S2's
locked proportion could plant "L is just ω rescaled — a duplicate readout"; that belief is built
DELIBERATELY (it is true at fixed I) and detonated one click later at S3 — see Block 2. (b) S3's
"masses in ⇒ smaller L" cross-concept risk — mitigated by attribution-to-the-restart narration (§4
note). (c) S2 must never say the brake "removes angular momentum from the world" or name torque — the
beat's claim is the locked ratio, and the cause is simply "a brake slows the spin".

## Block 2 — Aha-moment designation

- **PRIMARY aha, at S3:** *two turntables spinning at the SAME rate can carry very different angular
  momentum — where the mass sits matters exactly as much as how fast it turns.* (The 10-year memory:
  L is its own physical quantity, not a renamed spin rate.)
- **SUPPORTING aha, at S4:** *a spin has a direction — along the axis, the one line the spinning body
  holds fixed — read by curling the right hand with it.* Total = 2 (the sweet spot).
- **Cohesion check:** the supporting aha completes the primary's claim — L is not-just-speed (S3) and
  not-just-a-number (S4); both build "L is a real vector quantity in its own right". Neither stands
  alone; neither belongs in a sibling atomic.
- **Wrong-belief setup.** Primary: S1 and S2 BUILD the confident near-truth — S2's exact proportional
  fall (L tracking ω onto a predicted value with I hold-glowing) makes "L is spin speed times a fixed
  constant of the machine" feel airtight; S3 then changes the machine's constant at fixed speed and
  breaks it. Supporting: S1–S3 handle L as an unsigned number on a readout (the arrow's direction is
  never narrated), earning "it's just a number" before S4 flips the world.
- **Foundational coverage:** S3 ∈ `foundational` (S1→S3) ✓.

---

## ENGINE-REALITY WALK — every state × every consumed config field vs the frozen contract

Interface citations are `field_3d_renderer.ts` type-declaration lines (`:977–1058`); implementation
citations are the reader/consumer lines. **Every consumed field is IMPLEMENTED; no state consumes a
DECLARED-INERT field.** (Scar `archetype_live_tier_unverified_against_renderer` — every archetype's
motion is verified against renderer CODE below, not merely the renderer family.)

| Field (decl) | Reader (impl) | Status | Consumed by |
|---|---|---|---|
| `mode: 'fixed_axis'/'sandbox'` (`:980`) | `:50487`; sandbox ramp-guard `:50536` | IMPLEMENTED | S1–S4 fixed_axis, S5 sandbox |
| `apparatus.body_shape: 'turntable_rod'` (`:982`) | the only implemented shape (contract §1) | IMPLEMENTED (this member only) | all — authored explicitly |
| `apparatus.i_frame_kgm2 / rod_half_length_m / brake_drum_radius_m / rod_height_above_pad_m / r_min_m / r_max_m` (`:983–988`) | `:50488–50493` | IMPLEMENTED | all — pinned values authored explicitly (0.50 / 1.00 / 0.55 / 0.25 / 0.15 / 0.90) |
| `masses.count / mass_kg / r_m` (`:995`) | `:50494–50496` | IMPLEMENTED | all (2 / 2.0 / 0.80; S3 r_m 0.80 = ramp.from) |
| `omega0_rad_s` (`:996`) | `:50497` — **Math.abs applied**; sign rides `spin_sign` only | IMPLEMENTED | all (1.50) |
| `spin_sign` (`:997`) | `:50498` | IMPLEMENTED | all (+1) |
| `external_torque.source:'brake'`, `tau_brake_Nm`, `engage_at_ms`, `release_at_ms`, `pad_travel_ms` (`:999–1006`) | `:50518–50527`; pad pose `:50725–50744`; pad visibility `:50626–50631` | IMPLEMENTED | S2 (0.90; 3600; 7000; 1100), S3 (2.00; 2600; 5200; 600) — `release_at_ms` ALWAYS explicit (absent = never-releases, resolved by `typeof` at `:50523`) |
| `param_ramp {param:'r'}` (`:1010–1013`) | `rbrRAt` `:49851–49856`; seed `:50535–50539` | IMPLEMENTED **for `param:'r'` ONLY** — `omega0`/`m` ramps are silent no-ops (verified reality #3); none authored | S3 only (0.80 → 0.20, 5600–7600) |
| `reference_marks[]` chip form (`:1021–1030`) | build `:50164–50177`; reveal + MATCH LATCH `:50261–50279` | IMPLEMENTED (chip AND tick; only chip used) | S2 (L chip 1.53, at_ms 2000, tol 0.01), S3 (ω chip 1.50, at_ms 7600) |
| `restart {at_ms, every_ms, flip_spin}` (`:1033`) | `:50544–50550`; anchor `:49915–49926`; **flip_spin defaults TRUE** (`:50548`) | IMPLEMENTED | S3 (at 8000, **flip_spin: false EXPLICIT**, no every_ms → single restart, `:49893`), S4 (at 4000, every 6500, flip_spin: true explicit) |
| `repin_cue.blank_ms` (`:1037`) | `:50505`; blanking `:49896–49903`; badge `:50283–50284` | IMPLEMENTED | S3, S4, S5 (500) |
| `show_l_arrow` (`:1039`) | `:50607–50619`; arrow pose/colour `:50704–50718` | IMPLEMENTED | S2, S4, S5 true; **S1 false (ledger), S3 false (L = 0 stub — F-C2)** |
| `show_grip_hand` (`:1042`) | `:50612`; curl loop `:50748–50764` | IMPLEMENTED | S4 only |
| `readouts` (`:1043`) | closed set `RBR_RO_META` `:50147–50154`; **unknown token silently skipped** `:50162–50163` | IMPLEMENTED — only `I/omega/L` authored, all in the set | all states |
| `readout_at_ms` (`:1047`) | `:50234–50241` | IMPLEMENTED | S1 (staged builds) |
| `hold_glow` (`:1048`) | `:50245–50248` | IMPLEMENTED | S2 (['I']) |
| `formula` (`:1050`) | `:50570–50574` — static per state, Cambria Math | IMPLEMENTED | S2/S3/S5 "L = Iω"; S1/S4 none |
| `controls_visible` (`:1051`) | rows union `:50015–50025`; per-state toggle `:50128–50142` | IMPLEMENTED — closed set r/m/omega0/tau_brake/spin_dir | S4 ['spin_dir'], S5 ['m','omega0','spin_dir'] |
| `glow_focal` (`:1053`) + `phases[]` (`:1055`) | `:50507`, `:50647–50657` | IMPLEMENTED | all guided states (one focal per instant) |
| `visible_elements` (`:1054`) | exact-token matcher `:50593–50622`; overlays default OFF | IMPLEMENTED | not needed (show_* flags suffice); apparatus always-on `:50585` |

**Deliberately NOT consumed (and why):** `trusted_drag_seizes` (`:1052`) — **DECLARED but has NO rbr
reader** (grep this session: readers exist only for kinematics_1d_track/nlb, e.g. `:25047`; rbr
seizure is unconditional on any trusted input, `:50106`, `:50121`) — authoring it would be a silent
no-op, so it is omitted. `idle_auto_sweep` — r-only reader (`:49857`), r excluded (§3). `ke_bar` and
the `reference_marks` tick form — no KE content. `applied_torque_Nm` — implemented (`:50528–50533`)
but unconsumed (#7's row). `theta0_rad`, `particles[]`, `parts[]`, `axis_select`, `axis_pair`,
`cross_product_construction`, `body_shape` variants, `external_torque.source 'torsion_spring' |
'applied_force_at_point'` — DECLARED-INERT (`:950–956`, contract §1), consumed by NOTHING here ✓.

**Reverse walk:** every state consumes ≥1 implemented row; every authored field appears in the table;
every primitive named in §3/§4 maps to a built element in `RBR_ELEMENT_TYPES` (`:50586–50592`) or a
built DOM surface (`:50441–50467`) ✓. `deriveStateMeta.ts` registration verified PRESENT
(`rigid_body_rotation` at `deriveStateMeta.ts:496 / :787 / :3127 / :3927` — no co-edit needed; the
scenario shipped with it).

**Two engine findings filed to `docs/loop_runs/rotmech/_engine/findings_c.md` (appended this session):**
- **F-C1 — sandbox live `tau_brake` is an invisible cause.** Pad visibility reads the AUTHORED
  `external_torque.tau_brake_Nm` only (`:50626–50631`) and `rbrApplyVisibility` runs only at state
  apply (`:50559`, its sole call site); a live slider drag sets `eng.tau`/`brakeOnMs` but never
  `padEngageMs` (`:50079–50088`), and the pad pose is gated on `padEngageMs` (`:50728–50744`) — so a
  sandbox τ drag applies real torque while the pad stays invisible (or parked). This is the
  `ghost_compare_cause_invisible_slider_frozen` scar class, and it binds the SIBLING's DESIGN_OK'd
  explore state ("the brake applies live τ_ext while held > 0"). This concept routes around it (no
  tau_brake row anywhere).
- **F-C2 — the L-arrow length floor draws a nonzero stub at L = 0.** `RBR_L_ARROW_MIN` 0.22 (`:49797`,
  applied `:50705–50707`) means |L| < ≈1.10 kg·m²/s distorts the drawn ratio and L = 0 draws a visible
  stub — a rendered lie in any beat that dwells at rest. This concept hides the arrow in S3; request:
  suppress the arrow below a small ε so a stop beat can show L vanishing.

---

## SCAR AUDIT

**Queries run (LIVE table via Bash, this session), with counts:**

```
query_engine_bug_queue.ts --owner alex:architect     -> 63 rows
query_engine_bug_queue.ts --row-type directive       -> 83 rows
query_engine_bug_queue.ts --field3d --open           -> 85 rows
query_engine_bug_queue.ts angular_momentum           -> 0 rows (concept not yet authored — expected)
query_engine_bug_queue.ts rigid_body_rotation        -> 1 row
```

**Union = 157 distinct bug_class strings** (computed mechanically: `grep '^●' | sed | sort -u` across
the queries). **Not-queried boundary, declared honestly:** nothing beyond the five commands above was
queried; a row outside those result sets (e.g. rows scoped to other scenarios that are neither
architect-owned, directive-typed, nor field3d-open) is NOT dispositioned here rather than silently
"none skipped". Per `scar_audit_claims_a_coverage_boundary_it_did_not_enumerate`, every union member
is dispositioned VERBATIM below — the document set equals the query union in both directions.

**Verdict key:** **BINDS** = actively shaped this skeleton (how) · **sat** = satisfied by this design
or the built engine (where) · **N/A** = out of scope, with the reason · **0d/EYE** = binds the
downstream build/verification session, noted for handoff.

1. `archetype_live_tier_unverified_against_renderer` — BINDS: every archetype verified [LIVE] against renderer code with file:line (ENGINE-REALITY WALK).
2. `architect_authors_a_force_triangle_whose_ratio_exceeds_the_renderer_arrow_maps_dynamic_range` — sat: no force arrows authored; L-arrow ranges checked against `:49796–49797` (S2 exact-ratio band; S3 hidden — F-C2).
3. `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` — BINDS: every limit cites BOTH the type declaration and the reader function lines.
4. `architect_reuses_a_marker_mechanism_without_diffing_the_side_effects_its_presence_switches_on` — BINDS: restart reuse audited — flip_spin default-TRUE side effect (S3 sets false explicitly); authored restarts do NOT reset θ (only `rbrRestartNow` does, `:50063`); anchor/brake-window interplay traced in §3.
5. `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` — BINDS: `rigid_body_rotation` queried (1 row — see #33).
6. `authored_beat_ends_by_undoing_the_state_own_claim` — BINDS: S1–S3 are one-shot-hold (end-config = the claim); S4's loop IS its claim (the two directions).
7. `authored_lumped_constant_inconsistent_with_the_drawn_apparatus_geometry` — sat: all constants from the binding apparatus contract (chapter-wide plausibility ruled at 0c-1).
8. `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state` — 0d: json_author must route narration glow via `phases[]`, never a static focal that voids sentence glow; noted in §3.
9. `biot_single_element_states_static_pose` — N/A (biot scenario; no static state here regardless).
10. `biot_state6_dotcross_lesson_not_rendered` — N/A (biot).
11. `biot_state8_db_arrow_not_scaled_by_contribution` — N/A (biot).
12. `CACHE_UPSERT_CONFLICT_TARGET_MISSING` — 0d: binds the seeding session, not the design.
13. `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` — sat: build-time framing solved by the surgeon (`:50470–50477`); no per-state camera consumed.
14. `caption_clipped_by_adjacent_stat_box` — sat: captions are ≤5-word cues; fixed zones per `:50441–50467`; EYE re-checks.
15. `capture_frozen_frame_ignores_its_own_poll_result_and_photographs_off_pin` — EYE: harness-side; binds 0d verification.
16. `chemistry_concept_id_collides_with_rostered_physics_id` — sat: verified no collision (`ls` of both concept dirs this session).
17. `close_camera_framed_extent_is_authored_as_the_run_length_and_omits_the_body_radius` — N/A: no close-camera state authored.
18. `closed_enum_cannot_name_a_substance_the_design_teaches` — sat: every consumed token is in the frozen implemented enums; nothing this design teaches needs a missing member (KE/dLdt deliberately unused, not missing-for-teaching).
19. `concept_ships_zero_narration_glow_bindings` — 0d: physics_author must bind per-sentence glow; §3 gives the target plan.
20. `concept_taught_its_own_quantity_without_the_canonical_picture` — BINDS: canonical picture = the L vector on the axis (S2/S4) + L = Iω used predictively on screen (S2 chip).
21. `contact_detected_slow_window_arms_one_frame_late_and_buries_the_body_at_full_dt` — N/A (nlb, FIXED).
22. `contrast_ghost_coresident_with_the_real_set_fuses_both` — N/A: no ghost bodies.
23. `cyclotron_timers_sliders_fullscreen_button_corner_collision` — sat: rbr HUD at top:52px (`:50443`), sliders bottom-right (`:50465`).
24. `deferred_enum_members_must_be_declared_not_merely_unimplemented` — sat: the frozen contract ships the split (`:944–956`); this skeleton consumes implemented members only.
25. `derivation_principle_applied_to_one_beat_but_not_its_sibling` — sat: the predictive-chip discipline is applied to BOTH quantitative beats (S2 L chip, S3 ω chip).
26. `derived_energy_sum_pairs_prestep_position_with_poststep_velocity` — N/A (FIXED; no energy sum; rbr publishes one snapshot `:50230`).
27. `derived_readout_asserted_by_value_without_defining_its_metric` — BINDS: §3 readout-metrics block cites every closed form.
28. `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl` — sat: registration verified (`deriveStateMeta.ts:496/:787/:3127/:3927`).
29. `directive_no_gate_asks_whether_a_teacher_could_use_it` — BINDS: teacher-usability walk in §10.
30. `ecp_glow_targets_missing_primitives` — 0d: glow-target ⊆ built-ids rule stated in §10(b) for json_author.
31. `energy_layer_two_body_groups_stack_vertically_so_a_bar_height_compare_is_not_side_by_side` — N/A (nlb energy layer; no bars).
32. `engine_extension_replaces_a_shared_constant_without_an_absent_field_fallback_clause` — N/A: zero engine work at this desk.
33. `engine_stash_on_shared_renderer_reverts_concurrent_session_uncommitted_work` — N/A here: this desk is read-only on the renderer; binds Desk E. (The one `rigid_body_rotation`-tagged row.)
34. `explicit_linear_drag_is_unstable_at_the_damping_a_legible_settle_requires` — sat: the brake is constant-magnitude frictional in closed form (`:49933–49944`), not linear drag.
35. `explore_controls_not_ring_gated_survive_the_ring_cut` — BINDS: S5 min_rings authored (m/ω₀ core, spin_dir extended); both cuts walked in §10(i-1).
36. `explore_state_formula_surface_asserts_a_relation_no_state_derives` — sat: S5's `L = Iω` is stated by S1 and shown/used by S2 — both survive every preset.
37. `eye_dense_frames_are_never_hashed_so_a_frozen_state_passes_31_of_31` — EYE: dense windows listed in §3 for the 0d reader.
38. `eye_h2_baseline_nondeterministic_electric_potential_meaning_state6` — N/A (other concept).
39. `eye_h2_frozen_frames_of_moving_elements_wobble_sub_perceptually_so_zero_percent_is_not_a_valid_gate` — EYE: harness-side.
40. `eye_motion_map_reads_cached_physics_config_which_holds_only_epic_l_path` — 0d: binds the seeding/EYE session.
41. `field3d_arrow_label_sprite_renders_at_under_half_the_body_label_glyph_height` — EYE: open engine layout row; few labels here; re-read at 0d.
42. `field3d_build_once_body_reads_a_per_state_flag_from_the_union_def_and_mis_renders_silently` — sat: rbr builds from the all-states union (`:50015–50025`) and re-poses per state; no per-state build flag consumed.
43. `field3d_dt_accumulated_motion_invisible_to_eye_timepin` — sat: rbr is accumulator-free by construction (`:49969–49976`, `rbrThetaAt` fixed grid).
44. `field3d_focal_glow_pulse_phase_reads_absolute_time_so_frozen_h2_jitters` — EYE: open engine row; noted for baseline reading.
45. `field3d_formula_overlay_generic_not_cambria_math` — sat: `#rbr_formula` uses `RBR_MATH_FONT` (`:49747`, `:50448`).
46. `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` — sat: rbr has its own exact-token matcher + `RBR_ALWAYS_ON` (`:50581–50622`).
47. `field3d_hanging_body_gravity_sign_inverted_vs_own_axis` — N/A; its general prevention (execute every closed-form checksum numerically) applied — all §3 numbers hand-computed from the engine's forms.
48. `field3d_hard_threshold_label_decollision_pops_when_the_pair_separates` — sat: FIXED engine invariant, inherited.
49. `field3d_integrating_scenario_state_entry_must_rebuild_the_whole_engine_record` — sat: `applyRigidBodyRotationState` rebuilds `eng` wholesale (`:50486–50512`).
50. `field3d_label_sprite_overlap` — EYE: open engine row; no stacked label pair authored; re-read at 0d.
51. `field3d_measured_overlay_fit_runs_once_against_a_sibling_blanked_on_entry` — N/A (FIXED, other overlay system).
52. `field3d_newtons_laws_body_surface_slab_cannot_be_hidden_for_a_both_hanging_atwood_state` — N/A (nlb).
53. `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` — BINDS in its rbr form: L-arrow floor analysis done (S2 band exact-ratio above the floor; S3 arrow hidden; F-C2 filed).
54. `field3d_nlb_body_label_overlaps_the_pulley_mesh` — N/A (nlb).
55. `field3d_nlb_body_screen_anchor_lands_under_the_dom_slider_panel` — N/A (nlb anchors).
56. `field3d_param_ramp_authoring_contract` — BINDS: S3's `masses.r_m` 0.80 == `ramp.from` (the only ramp; also enforced by `:50538`).
57. `field3d_particle_field_vestigial_dual_panel_config_gap` — 0d: json_author inserts the `concept_panel_config` row (default_panel_count 1) in the same session.
58. `field3d_per_state_slider_rows_collapsed_in_a_bottom_anchored_panel_make_shared_rows_jump` — sat: rbr reserves hidden slots via visibility:hidden (`:50033`, `:49988–49994`).
59. `field3d_pinned_rewind_reproduces_the_instant_but_not_the_last_float_bit` — sat: FIXED invariant, inherited.
60. `field3d_release_widens_ground_plane_per_state_causing_unnarrated_apparatus_jump` — N/A (force_rig).
61. `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive` — BINDS: §4 names a BUILT primitive for every belief counter.
62. `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` — sat: no per-state camera needed or consumed; build framing verified (`:50470–50477`).
63. `field3d_sliders_panel_top12_vs_fsbtn_top10` — sat: rbr sliders are bottom-anchored (`:50465`).
64. `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` — EYE: binds the 0d reader (pixel reads for sprite labels).
65. `force_rig_short_reveal_pin_below_catchup_threshold_keeps_prefreeze_jitter` — N/A (force_rig).
66. `force_rig_slider_panel_renders_full_height_when_one_row_visible` — N/A (force_rig; rbr panel hides at zero rows, `:50141`).
67. `frozen_frame_read_as_dense_series_continuation_on_translating_body` — EYE: reader discipline; noted.
68. `frozen_pin_unbudgeted_on_a_sequential_misconception_state_can_archive_the_wrong_picture` — BINDS: S3's pin (9.0 s) photographs the POST-restart contrast, after every sequential beat; margin tabled.
69. `galvanometer_family_motion_expectation_undeclared` — N/A (particle_field).
70. `ghost_compare_b_handoff_instant_snap` — sat: the only discontinuities are badge-and-blank restarts — the honest form; no ghost handoff.
71. `ghost_compare_cause_invisible_slider_frozen` — BINDS: drove the S5 tau_brake EXCLUSION (a live brake is an invisible cause today — F-C1); every remaining cause is rendered (pad, badge).
72. `glow_focal_fr_ring_whiteouts_the_ring_and_occludes_it` — N/A (force_rig).
73. `graph_title_caption_zorder_overlap` — N/A: no graph.
74. `harness_source_grep_comment_strip_defeated_by_crlf_line_endings` — N/A (harness-side).
75. `hysteretic_state_cannot_be_latched_under_a_time_pin` — sat: all physics closed-form; the chip MATCH latch (`eng.matched`) is the one hysteresis and both pins land after their match instants (S2 7.8 > 7.0; S3 9.0 > 8.5), so the frozen frames are correct; rewind caveat noted at #119.
76. `lesson_never_states_the_principle_it_is_named_after` — sat: S1 states L = Iω in words; S2 prints and uses it.
77. `loop_dipole_couple_simultaneous_reveal` — N/A (loop_dipole).
78. `loop_dipole_micro_claim_without_micro_visual` — N/A (loop_dipole).
79. `magnetic_flux_loop_scenario_new_build` — N/A (FIXED, other scenario).
80. `mfl_loop_footprint_inverted_vs_theta` — N/A (other scenario).
81. `named_primitive_declared_without_the_surface_that_can_render_it` — BINDS: the reverse walk maps every named visual to a built element or DOM surface.
82. `narration_attributes_an_effect_to_a_cause_the_model_does_not_contain` — BINDS: S2's fall is attributed to the rendered pad; S3's L change to the badged restart; both exist in the model.
83. `narration_references_a_prerequisite_concepts_apparatus_that_is_not_on_screen` — sat: prerequisite restatements reference only the on-screen machine; the p = mv clause is an apparatus-free analogy (flagged to physics_author to keep it so).
84. `narration_timing_probe_uses_a_speech_model_the_shipped_player_does_not` — N/A (validator-side).
85. `nlb_angle_arc_radius_overruns_the_neighbouring_lane_body` — N/A (nlb).
86. `nlb_body_label_is_brighten_only_so_static_text_outranks_the_state_focal` — N/A (nlb).
87. `nlb_camera_rotated_body_label_bleed_through_slider_panel` — N/A (nlb).
88. `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` — N/A (nlb checkpoints).
89. `nlb_coupled_sandbox_F_slider_exceeds_string_tautness_bound` — N/A (nlb); transferable half checked: no S5 slider combination produces an unphysical pose (every change re-seeds a valid L).
90. `nlb_displacement_vector_is_single_body_so_a_compare_state_measures_only_one` — N/A (nlb).
91. `nlb_formula_and_readout_zones_are_fixed_css_and_collide_with_a_tall_hud` — sat (transferable): the rbr HUD is 3 rows max here; zones distinct by build (`:50441–50467`).
92. `nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix` — N/A (nlb).
93. `nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger` — N/A (nlb); the rbr brake cannot reverse spin (rest clamp ON L, `:49933–49936`).
94. `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` — BINDS (transferable): pin-margin table, ≥167 ms everywhere, discrete events computed from the engine's own forms.
95. `nlb_lane_offsets_apply_to_declared_bodies_not_co_present_ones_so_sequential_phases_split_laterally` — N/A (nlb lanes).
96. `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` — BINDS (transferable half): every guided end-config is a HELD pose that photographs its claim; no loop reset on S1–S3.
97. `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` — BINDS: archetype-discharge rule in §3; S3's contrast is intra-state.
98. `nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` — N/A: single apparatus.
99. `nlb_multibody_sandbox_wrap_reanchors_only_the_wrapping_body` — N/A (nlb).
100. `nlb_overlay_ink_lift_is_bounded_to_the_families_whose_length_is_a_magnitude` — N/A (nlb overlay families).
101. `nlb_seized_slider_run_overruns_a_loop_sized_work_scale` — sat: no bar scales in S5; every readout value is bounded by the closed form at any slider corner.
102. `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm` — sat (transferable): taught poses 0.20/0.80 strictly inside the clamp [0.15, 0.90].
103. `nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate` — N/A (nlb).
104. `nlb_work_bar_track_tops_lose_collinearity_when_a_3d_label_size_changes` — N/A (nlb).
105. `nlb_work_probe_globals_disagree_on_multibody_states` — N/A (nlb).
106. `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` — sat: formula surfaces symbolic only; every numeric claim is a HUD/chip value the renderer computes.
107. `optional_config_field_with_a_legal_zero_value_is_resolved_by_truthiness` — BINDS: `release_at_ms` authored explicitly on every brake use (absent = never-releases via typeof, `:50523`); no zero-valued optional relied on.
108. `paired_skeletons_cite_each_other_by_state_number_across_a_renumbering` — BINDS: sibling references name CONTENT with revision (e.g. "the sibling's brake-condition state, skeleton REV 4"), never a bare state number this document depends on.
109. `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set` — sat: 0c-1 closed the enums against the 12-concept union; this skeleton is a subset check.
110. `phase0_union_lists_capabilities_but_never_which_knobs_are_scriptable` — sat: scriptability verified per knob (ramp = r only; m/ω₀ = restart-only; τ = authored windows only).
111. `phase0_union_table_asserted_not_walked_state_by_state` — BINDS: the ENGINE-REALITY WALK runs both directions.
112. `ppc_probe_points_primitive_new_build` — N/A (FIXED, other scenario).
113. `prior_rulings_and_internal_ledgers_are_not_re_run_over_the_states_a_restructure_creates` — N/A (fresh concept, no restructure); binds any future REV.
114. `quantitative_check_state_reuses_the_exact_numbers_and_the_delta_cue_of_the_state_it_verifies` — sat: S2 (1.53 / 0.50) and S3 (0.99 / 1.50) share no headline number and no cue wording.
115. `radius_scenario_F_r_label_kerning_collision` — N/A (other scenario; no r label drawn here).
116. `ramp_endpoints_multiply_the_taught_variable_by_a_factor_no_rendered_string_claims` — sat: S3's endpoint values are rendered live (I 3.06 → 0.66; L 4.59 vs 0.99 on screen with the chip); narration states the contrast in the same numbers.
117. `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` — BINDS: §9 assigns states + word budgets.
118. `review_site_build_is_stale_against_the_concept_under_review` — 0d: binds the verification session.
119. `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls` — BINDS: rewind claims traced to terminating lines (`rbrThetaAt` rebuild-from-zero `:49958`; anchor closed forms `:49915–49943`; the matched-latch record `eng.matched` persists across a backward pin — flagged as the one rewind-hysteretic surface, harmless at the authored pins per #75).
120. `rule31_motion_floor_satisfied_by_a_late_label_reveal_over_a_frozen_canvas` — sat: the apparatus spins continuously in every state; S3's still phase is bracketed by motion and is itself the point of a moving beat.
121. `scar_audit_claims_a_coverage_boundary_it_did_not_enumerate` — BINDS: this audit enumerates the union verbatim, both directions.
122. `seam_r_ink_lift_reveals_sub_surface_force_arrows_fleet_wide_and_no_gate_reads_it_as_a_change` — N/A (nlb seam).
123. `shared_bar_scale_cross_state_guarantee_is_void_when_the_panel_reflow_ladder_drops_a_step` — N/A: no bar scales.
124. `signed_engine_union_drops_items_its_own_state_table_still_consumes` — sat: no union rewrite here; the reverse walk maps every state-named primitive to a built row.
125. `skeleton_anchor_specified_in_section_9_reaches_no_narration_line` — BINDS: both anchors have reserved words inside their states' budgets.
126. `skeleton_asserts_a_held_comparison_value_at_an_instant_the_faster_body_has_already_passed` — N/A: single body.
127. `skeleton_authors_a_multi_phase_state_on_an_engine_with_no_per_body_activation_time` — sat: every timed beat rides an implemented timed field (engage/release/ramp/restart/at_ms/readout_at_ms), each cited.
128. `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant` — sat: no timed class beyond the implemented surface is authored.
129. `skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static` — BINDS: this scar caught the S1 design — the formula and the L arrow are STATIC per-state overlays, so NO timed reveal is authored for either; both debut at S2 entry instead; the only timed overlays used are `readout_at_ms` and `reference_marks[].at_ms`, both implemented.
130. `skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal_inside_it` — BINDS: margins measured from the LAST asserted event, per state.
131. `solenoid_focal_primitive_on_title_not_physics` — N/A (solenoid); focals here are physics elements.
132. `solenoid_state3_annotation_orphaned_from_referent` — N/A (solenoid).
133. `solenoid_state4_outside_fade_narrated_not_shown` — N/A (solenoid).
134. `solenoid_state5_gesture_sequencing_absent` — N/A (solenoid).
135. `solenoid_state7_hand_flip_unimplemented` — N/A (solenoid); the rbr hand flip IS implemented (`:50746–50750`) and verified.
136. `spec_semi_implicit_euler_position_not_step_count_invariant` — sat: rbr θ is a fixed-grid sum (`:49952–49966`), step-count invariant by construction.
137. `state_added_at_review_outruns_the_config_contract_shape` — noted: any review-added state must be expressible in the frozen shape; the one anticipated addition (advanced ring) is pre-slotted in §10(i).
138. `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` — sat: the relation's halves live on the HUD instrument channel (hold_glow, `:50206–50218`), which the scene focal never dims.
139. `symbol_printed_on_canvas_before_the_lesson_defines_it` — BINDS: drove S1's no-arrow/no-formula design + the readout_at_ms ledger.
140. `taught_delta_smaller_than_the_instruments_own_live_noise` — sat: deltas are 3.0× (S2) and 4.6× (S3); readouts are closed-form, noise-free.
141. `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` — BINDS-with-mitigation: L's correlates are the arrow (S2/S4) and the spin + mass placement themselves; in S3 the arrow must hide (F-C2), so that beat leans on the readout + chips against the S2-established arrow memory — F-C2 requests arrow-zero suppression so a future rev can keep the arrow through the whole beat.
142. `teach_auditor_reads_field3d_sliders_from_config_not_scene_composition` — 0d: binds quality-auditor; controls are in `controls_visible` config.
143. `teach_color_each_element_by_its_own_sign` — sat: built-in sign colours (`:49748–49752`), engaged at S4; physics_author carries the convention into narration.
144. `teach_concrete_before_abstract_compare` — sat: the qualitative machine (S1) precedes both quantitative beats.
145. `teach_coordinate_sim_with_graph` — N/A: no graph.
146. `teach_distinct_reference_lines_for_two_radii` — sat by omission: ZERO radius reference lines authored (`show_r_line`/`show_drum_line` false everywhere); no radius value narrated.
147. `teach_do_not_prespoil_a_later_reveal` — BINDS, the central constraint: r never moves while spinning, so the sibling's aha never renders; direction is not narrated before S4; L = r × p never appears.
148. `teach_field3d_explore_grab_and_move_field_point` — dispositioned: S5's live manipulables are the lesson's variables (m/ω₀/direction); no field point exists; the r grab is EXCLUDED with a written defense (§3).
149. `teach_inverted_scenario_inverts_cutline_flags` — N/A: no inverted sibling scenario.
150. `teach_read_dense_ramp_frames_not_just_frozen` — EYE: dense windows listed in §3.
151. `teach_reveal_synced_to_narration` — 0d: physics_author writes per-sentence sync rows; §3 gives the anchor plan.
152. `teach_show_quantity_live_when_named` — sat: every named quantity has a live readout at naming time (readout_at_ms).
153. `teach_visual_must_match_narration` — BINDS: choreography audited claim-by-claim; per the sibling's precedent, the dispatching session should APPEND this concept to the OPEN row rather than mint a duplicate.
154. `the_eye_passes_a_frame_in_which_one_compared_body_is_hidden_behind_another` — N/A: one apparatus, no compared bodies.
155. `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` — BINDS: every shared field (restart, repin_cue, brake windows, chips, hold_glow) is used with the semantics the sibling's physics block pinned — checked against `conservation_of_angular_momentum/physics_block.md`; no divergent semantics introduced.
156. `velocity_arrows_routed_through_a_force_arrow_map_collapse_their_ratio_and_cannot_draw_a_true_zero` — BINDS in L-arrow form: the true-zero failure identified at S3 (arrow hidden there; F-C2 filed); guided ranges verified linear/exact elsewhere.
157. `verification_via_applystate_bypasses_player_false_hang` — N/A (FIXED, validator-side: the EYE now drives the real player; binds the 0d verification session, not this design).

---

*Handoff: → founder-proxy **Checkpoint A**. On `DESIGN_OK`: physics_author (narration + per-state
variable overrides + glow bindings, against this skeleton), then json_author (pure JSON — the scenario
is built and merged; no engine dispatch). Engine findings F-C1/F-C2 appended to
`docs/loop_runs/rotmech/_engine/findings_c.md` for Desk E; neither blocks this concept as designed.*
