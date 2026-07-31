# `impulse` — Architect Skeleton (v2.4, Rule 31/32/34/38/41 native)

> Concept 1 of 2 on `momentum_bench` (`field_3d`, `scenario_type: "momentum_bench"`).
> Chapter: Laws of Motion (Class 11). Branch: `feat/lom-f-momentum`, worktree `physics-mind-lom-f`.
> Engine contract: `docs/loop_runs/lom_f/_engine/momentum_bench_json_contract.md` (harness 63/63 — author to the proved numbers).
> Downstream: physics-author (motion timelines + narration) → json-author (`src/data/concepts/impulse.json`).

## The one shared fixture (home pose — Rule 32d)

Every state uses the SAME apparatus so the only visible change per state is the new thing. **Author the whole concept to the harness-proved fixture:**

| Constant | Value | Why |
|---|---|---|
| Ball mass `m` | **1.0 kg** | the proved fixture (in slider range 0.5–10) |
| Impact speed `v` | **3.0 m/s** | the proved fixture (in slider range −6…6) |
| Rigid contact `k` | **2000 N/m** | gives F_peak = **134.16 N**, t_c = **70 ms** (π√(m/k)) |
| Padded contact `k` | **200 N/m** | gives F_peak = **42.43 N**, t_c = **222 ms**; peak ratio **3.16223 ≈ √10** |
| Damping `c` | **0** (elastic) | both walls REBOUND — founder decision; Δp = 2mv by construction |
| Momentum change | **Δp = 2mv = 6.00 kg·m/s**; **J = 6.00 N·s** | areas proved equal to **0.0038%** |
| Wall centre | s = **+2.0 m**, `fixed: true`, shape `wall` | ball (radius 0.28) + wall half-extent 0.3 + natural length 0.4 → first touch at ball centre **+1.02 m** (computed from §1 apparatus constants, not guessed) |
| Ball start | s = **−3.0 m** for the long-approach states; physics-author may shorten to ≈ −1.6 m on the repeat-cycle states so a full bounce fits the `repeat_every_ms` cycle — COMPUTE the cycle from approach + slowed contact + depart, never guess |

All narration numbers below are these proved numbers, stated without hedging (contract §0).

---

## 1. Atomic claim

This concept teaches ONE thing: **impulse — the product of contact force and contact time — equals the change in momentum (J = F̄Δt = Δp), so for a fixed momentum change, spreading the contact over more time lowers the peak force.** It does NOT cover conservation of momentum between two free bodies (deferred to `conservation_of_momentum`), inelastic energy loss, or 2-D oblique impacts.

## 2. State count + arc

**8 states (7 guided + 1 explore).** The §5 table puts impulse at medium–complex; 8 is at the low end of "complex" and is justified line-by-line: two founder-mandated beats (NCERT `2mv` rebound; two-lane equal-areas payoff), one mandatory slow-motion-honesty beat, one graph-literacy beat (area under F–t is an exam staple on every board), one extended application beat (the anchor), one advanced counter-intuitive beat (t_c invariant to speed), plus the prerequisite-patch opener and the explore state. Nothing is padding — every state carries an idea the previous states do not prove.

**Quality test:** a student who watches all 8 can answer: "find the impulse on a rebounding ball" (S2), "read impulse off an F–t graph / find average force" (S4), "why equal impulse but different peak force" (S5), "why bend your knees when landing / why airbags" (S5–S6), "does hitting faster change the contact time" (S7), and any numeric F̄ = Δp/Δt problem (S4–S5).

| # | Title (rail-truncation-safe, Rule 41d) | Ring | teaching_method | Purpose (one line) |
|---|---|---|---|---|
| S1 | Momentum of a moving ball | core | *(straightforward beat)* | Establish p = mv as the tracked quantity; patch the momentum prerequisite cliff; home pose. |
| S2 | Rebound doubles the momentum change | core | misconception_confrontation (16a contrast beat) | The NCERT beat: +mv in, −mv out, Δp = 2mv. |
| S3 | Contact force in slow motion | core | *(straightforward beat)* | The honesty beat: the force is large (134 N) and brief (70 ms); the deformation is the visible cause. |
| S4 | Area under the force–time curve | core | *(straightforward beat)* | The graph: shaded area = impulse = Δp; area tracks Δp live as impact speed ramps. |
| S5 | Two walls, equal areas | core | misconception_confrontation (16a contrast beat) | THE PAYOFF: two lanes, ~10× stiffness, both rebounding — equal areas, peaks 3.16× apart. **PRIMARY aha.** |
| S6 | Softer contact, smaller peak force | extended | *(straightforward beat)* | The application: ramp k down — peak falls, duration grows, area holds; bend-your-knees anchor expanded. |
| S7 | Contact time does not depend on speed | advanced | derivation_first_principles | t_c = π√(m/k): hit faster, peak grows, contact time identical. |
| S8 | Explore the impact | core | exploration_sliders | Sandbox: all sliders live, `interaction_complete`, CORE-ring content only. |

Rings ordered qualitative → quantitative → derivation; the advanced ring (S7) is a contiguous block immediately before the explore state (Rule 38a).

**advance_mode plan (Rule 15):** S1–S7 `manual_click`, S8 `interaction_complete` — 2 distinct modes, no `wait_for_answer`, no `pause_after_ms`, no `auto_after_tts`.

## 3. Per-state choreography + control plan (Rule 31 — the control table)

### 3a. The control table (REQUIRED artifact)

| State | Teaches | Archetype | Delta (one line → the ≤5-word cue) | Distinct motion | Controls | Narration budget |
|---|---|---|---|---|---|---|
| S1 | p = mv is what a moving body carries | `translate-through` *(contrast pair with S2)* | Setup: ball glides, momentum tracked → cue: **"Momentum p = mv"** | Ball glides left→right at 3 m/s past the (not-yet-relevant) wall lane end; p readout counts live; loops via `repeat_every_ms` | none | 25–35 words |
| S2 | Rebound reverses the SIGN: Δp = 2mv, not mv | `translate-through` — **declared contrast pair with S1**: same glide, now a wall; the momentum sign flips | Wall added: p goes +3.00 → −3.00 → cue: **"Rebound: momentum change 2mv"** | Approach, slowed contact (badge ×20), depart at −3 m/s; p readout flips sign; J readout lands on 6.00 N·s | none | 40–55 words (carries the 16a contrast) |
| S3 | The contact force is large and brief; the squeeze is the visible cause | `compress-release` *(coined: the contact element visibly compresses then releases — the deformation IS the cause of the force, per spec §3; no seed archetype covers a compliance cycle)* | Zoom of attention to the contact: force arrows + true milliseconds → cue: **"Large force, few milliseconds"** | Slowed contact (×20, badge): contact element compresses with δ, equal-opposite force arrows grow/shrink with F, F_contact readout peaks at 134.16 N, HUD reports TRUE t_c = 70 ms | none | 35–50 words |
| S4 | Shaded area under F–t = impulse = Δp | `reveal-build` | The trace draws itself; area label matches Δp → cue: **"Shaded area equals Δp"** | Force–time trace draws live during the slowed contact, area fills, peak marked; then `param_ramp` on v1 (1.5 → 3 m/s) across repeated bounces — each bounce's area label grows in lockstep with the Δp readout | `v1` | 40–55 words |
| S5 | Same Δp, ~10× stiffness apart: equal areas, very different peaks | `side-by-side-compare` *(coined: two SIMULTANEOUS lanes on one clock and one shared trace axis; `cycle-compare` is temporal A→B→A′, this is spatial — the engine's two-lane machinery exists precisely for this beat)* | Second lane appears: padded wall → cue: **"Two walls: equal areas"** | Both lanes launch together (offsets ±1.3 m), both balls rebound; `compare_with_previous_lane: true` draws BOTH traces on one axis — tall-narrow (134 N / 70 ms) vs low-wide (42 N / 222 ms), shaded areas visibly identical | none (the contrast is authored; a live `k` would drag the base lane away underneath it — contract §7) | 45–55 words (carries 16a contrast + one anchor sentence) |
| S6 | You cannot change Δp; you can only spread it over time | `oscillate/track` *(contrast pair with S7)* | Stiffness ramps DOWN, area holds → cue: **"Softer contact, lower peak"** | Single lane; `param_ramp` on k (2000 → 200) across repeated bounces: each successive trace is lower and wider, area label constant at 6.00 N·s; deformation visibly deepens | `k` | 35–50 words |
| S7 | Contact time is set by m and k, NOT by speed: t_c = π√(m/k) | `oscillate/track` — **declared contrast pair with S6**: same repeated-bounce choreography, the OPPOSITE ramped variable; what holds and what changes flips (S6: ramp k → t_c and peak change, area fixed · S7: ramp v → peak and area change, t_c fixed) | Speed ramps UP, contact time identical → cue: **"Contact time stays fixed"** | `param_ramp` on v1 (1.5 → 6 m/s) across repeats on the rigid contact: peak grows with each bounce, trace WIDTH identical, HUD t_c pinned at 70 ms | `v1` | 35–50 words |
| S8 | Teacher's sandbox | `drag-sandbox` | All controls live → cue: **"All controls live"** | Bench re-arms every ~1400 ms and keeps demonstrating until a trusted drag seizes it (Rule 37); every slider drives live motion | `m1`, `v1`, `k`, `c` (all meaningful ones — `m2`/`v2` are excluded because `wall_impact` has no second movable body; document this as the "ALL controls" set for this mode) | 0 / open |

No two states share an archetype except the two DECLARED contrast pairs (S1↔S2, S6↔S7); no state is static; `drag-sandbox` is explore-only. Every delta cue is ≤5 words, literal English, no personification (Rule 41).

### 3b. Per-state engine config sketch (keys from contract §2–§4 ONLY)

| State | `mode` | `slow_window` | `force_trace` | `readouts` | `glow_focal` (exactly one) | Other keys |
|---|---|---|---|---|---|---|
| S1 | `single_body` | — (no contact — the only contact-free state) | — | `['v','p']` | `mb_body_BALL` | `repeat_every_ms` (loop the glide) |
| S2 | `wall_impact` | `{slow_factor: 20, badge: true}` | — | `['v','p','J','F_contact']` (founder-mandated set; no trace on this state so `'J'` is legal) | `mb_body_BALL` | `contact` k=2000, c=0, label "rigid wall" |
| S3 | `wall_impact` | `{slow_factor: 20, badge: true}` | — | `['F_contact','p']` | `mb_contact_element` | same contact |
| S4 | `wall_impact` | `{slow_factor: 20, badge: true}` | `{show, fill_area: true, peak_marker: true}` | `['v','p','F_contact']` — **NO `'J'`** (hard prohibition: the trace's area label carries J) | `mb_body_BALL` | `param_ramp {param:'v1', from:1.5, to:3}` + `repeat_every_ms` |
| S5 | `wall_impact` | `{slow_factor: 10, badge: true}` (soft lane's 222 ms × 10 ≈ 2.2 s — ×20 would drag) | `{show, fill_area, peak_marker, compare_with_previous_lane: true}` | `['v','p']` — no `'J'` | `mb_contact_element` | `lanes`: base lane (k=2000, label **"rigid wall"**) + lane 2 (`offset_z_m: ±1.3`, `contact_override {stiffness_N_per_m: 200, label: "padded wall"}`); 2 contacts (cap is 3 ✓) |
| S6 | `wall_impact` | `{slow_factor: 10, badge: true}` | `{show, fill_area, peak_marker}` | `['F_contact','p']` | `mb_contact_element` | `param_ramp {param:'k', from:2000, to:200}` + `repeat_every_ms` |
| S7 | `wall_impact` | `{slow_factor: 20, badge: true}` | `{show, fill_area, peak_marker}` | `['v','F_contact']` | `mb_body_BALL` | `param_ramp {param:'v1', from:1.5, to:6}` + `repeat_every_ms` |
| S8 | `sandbox` | `{slow_factor: 10, badge: true}` (contacts occur → mandatory) | `{show, fill_area, peak_marker}` | `['v','p','F_contact']` | `mb_track` | `trusted_drag_seizes: true`, `repeat_every_ms: 1400`, `controls_visible: ['m1','v1','k','c']` |

`slow_window` is declared on EVERY contact state (S2–S8); S1 is the only state without a contact and correctly has none. All ramp values sit inside the renderer-fixed slider ranges (§3). Never `sticks` + `preload_m` together (neither is used here at all). No `field_lines`, no `*_at_ms` fallbacks.

**Formula surface per state (Rule 34b — ONE Unicode algebra string, NO digits/values, harness-enforced):**

| State | `formula` |
|---|---|
| S1 | `p = mv` |
| S2 | `Δp = p′ − p` *(prime notation chosen deliberately — subscript digits like p₁/p₂ risk the no-digits harness check; json-author must verify the check's treatment of subscripts before substituting)* |
| S3 | `F = kx` |
| S4 | `F̄Δt = Δp` |
| S5 | `F̄ = Δp/Δt` |
| S6 | `F̄ = Δp/Δt` *(deliberate repeat of S5 — same law, application beat; repetition across states is legal and aids continuity)* |
| S7 | `t_c = π√(m/k)` *(π is not a digit; json-author verify against the harness check)* |
| S8 | `F̄Δt = Δp` (CORE-ring formula only — Rule 38b) |

**Rule 32 legibility per beat:** cause before effect everywhere — the ball ARRIVES (cause) before the arrows/trace respond; the ramped slider value visibly changes before the next bounce differs. Only the taught variable moves per state (S6 ramps only k; S7 only v1). Same apparatus persists from the home pose — the wall added in S2 and the second lane added in S5 are each "the one new thing" at their click. Exactly one glow focal per state (table above). Camera holds; it may only pull back slightly at S5 to frame both lanes (contract: ±1.3 m offsets read cleanly).

**Rule 33 note:** the taught variable (stiffness/force) is macroscopic and its mechanism — contact deformation — is made directly visible by the engine's contact element (spec §3: "the deformation IS the visible cause"). No split-canvas micro band is needed or available in this scenario; the Rule 33d instrument duty is met by the live F_contact readout, the TRUE t_c in ms on the HUD, and the trace's numeric area/peak labels. Each ramp state's interior story differs (deepening squeeze in S6 vs faster-but-equal-length squeeze in S7).

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots, not a per-state tic)

**M1 — "The momentum change on rebound is mv"** (the student sees the speed unchanged and concludes little or nothing changed). Confronted at **S2**. `misconception_watch`: belief = "rebound at the same speed means the momentum change is mv, or even zero"; visual_counter = the p readout runs +3.00 → −3.00 kg·m/s while the |v| readout shows 3.0 both before and after — the speed evidence for the wrong belief is shown FIRST, then the signed momentum flip, then J lands on 6.00 N·s; one_line_fix = "momentum is signed — reversing direction changes it by 2mv." Straightforward contrast beat, no predict-pause: the choreography shows the unchanged speed (the wrong expectation's evidence), then the sign-flipped momentum (the real physics), back-to-back.

**M2 — "A softer wall means a smaller momentum change"** (soft = gentle = less happened). Confronted at **S5**. `misconception_watch`: belief = "the padded wall changes the ball's momentum less than the rigid wall"; visual_counter = both lanes rebound at the same 3 m/s, both Δp readouts identical at 6.00 kg·m/s, both shaded areas equal (proved to 0.0038%) — only the peaks differ, 134.16 N vs 42.43 N (ratio 3.16 ≈ √10); one_line_fix = "a softer contact lowers the PEAK force and lengthens the time — the momentum change is the same." The beat shows the soft lane's tall expectation confounded by the equal shaded areas on ONE shared axis.

No other state carries a `misconception_watch` (founder guardrail 2026-07-04). EPIC-C branches: **zero** (EPIC-L-first directive; not requested).

## 5. `has_prebuilt_deep_dive` states (cache hint; both paths dormant — metadata only)

- **S2** — the sign-reversal trap is the single most common exam error on this concept; multiple phrasings ("why 2mv", "isn't the speed the same", "is impulse mv or 2mv").
- **S4** — graph literacy: reading impulse and average force off an F–t curve is a mathematical abstraction with documented confusion patterns.
- **S5** — the PRIMARY aha; "equal areas different peaks" invites "but the hard wall hit harder" follow-ups.

## 6. Drill-down clusters (3 candidates each; physics-author fleshes out trigger_examples)

- S2: `rebound_sign_reversal` (why the sign flips), `momentum_change_vs_speed_change` (|v| same but Δp ≠ 0), `impulse_direction` (which way J points on rebound).
- S4: `area_under_curve_meaning` (why area = impulse), `average_force_from_graph` (F̄ as the equal-area rectangle), `impulse_units` (N·s ≡ kg·m/s).
- S5: `stiffness_vs_impulse` (k changes peak/time, not area), `peak_force_vs_average_force` (which one breaks things), `time_spreading_safety` (knees, airbags, padding as Δt-stretchers).

## 7. `entry_state_map`

```
entry_state_map:
  foundational:      STATE_1 → STATE_5   # "what is impulse" — contains the PRIMARY aha (S5) ✓
  rebound:           STATE_2             # "momentum change on bouncing off a wall"
  force_time_graph:  STATE_3 → STATE_4   # "area under F–t graph", "average force"
  applications:      STATE_5 → STATE_6   # "why airbags / bend knees / padding"
  contact_duration:  STATE_7             # "does hitting faster change contact time"
```
Default aspect = `foundational`. The PRIMARY aha (S5) is inside the foundational range — no exit-pill needed.

## 8. Prerequisites (advisory only — Rule 23)

- `newton_second_law` (shipped, `src/data/concepts/newton_second_law.json`) — F = ma is the source of F̄Δt = Δp; cliff patched at S4 (Block 1).
- `newton_third_law` (shipped) — the wall's force on the ball is the ball's force on the wall, mirrored; cliff patched at S3.
- Momentum itself has no standalone shipped concept (`conservation_of_momentum` is concept 2, downstream) — S1 exists to patch this cliff in ~30 words.

## 9. Real-world anchor (Rule 35 — universal, culture-neutral)

**Primary: bending your knees when you land from a jump.** Land stiff-legged and the same momentum change is forced through a few milliseconds — a large peak force through your joints. Bend your knees and the SAME momentum change spreads over ten times longer — a far smaller peak force. It is body-based, needs no apparatus, no place, no brand, no country; every Class 11 student has jumped off something and felt the difference. It is physics-true at every depth: Δp is fixed by the landing speed, only Δt is negotiable — exactly the S5/S6 lesson (F̄ = Δp/Δt).

**Secondary (one line in S6 only): a vehicle airbag** — a widest-syllabus-overlap safety device (Rule 38f), phrased generically ("an airbag", never a brand or crash-test authority).

Placement: one plain sentence of the knees anchor inside S5's narration (so the core-only cut keeps the anchor — see §10 preset check), expanded in S6. Hook flavor in S1–S2 stays apparatus-native (the ball and wall ARE the moving hook; no static setup state).

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** S1 glide + p readout · S2 rebound Δp = 2mv (16a beat M1) · S3 slowed contact, 134.16 N / 70 ms honesty · S4 trace + area = Δp under v-ramp · S5 two lanes, equal areas 0.0038%, peaks √10 apart (16a beat M2, PRIMARY aha) · S6 k-ramp, peak falls area holds, knees/airbag · S7 v-ramp, t_c pinned at 70 ms · S8 sandbox.

**(b) Symbol-label table** (on-canvas labels stay symbolic — Rule 24; narration expands per Rule 30):

| Quantity | On-canvas label | Where |
|---|---|---|
| Ball mass | `m` | body label |
| Velocity | `v (m/s)` | HUD readout |
| Momentum | `p (kg·m/s)` | HUD readout |
| Momentum change | `Δp` | formula surface / HUD |
| Impulse | `J (N·s)` | S2 readout; S4+ the trace's own area label |
| Contact force | `F (N)` | force arrows + F_contact readout; trace y-axis `F (N)` |
| Time | `t (ms)` | trace x-axis; TRUE contact duration on HUD |
| Stiffness | `k (N/m)` | slider row |
| Average force | `F̄` | formula surface only |
| Contact duration | `t_c` | S7 formula + HUD ms value |
| Lane names | "rigid wall" / "padded wall" | contact `label` → trace legend (plain apparatus names, Rule 41) |

**(c) Direction/rule plan:** no right-hand rule (1-D linear mechanics). The direction discipline is SIGN: velocity/momentum arrows drawn signed along the track; equal-and-opposite contact arrows on ball and wall during contact (the wall is `fixed` but REAL — its arrow draws full-brightness, proved in harness).

**(d) Motion plan:** every state's motion is in the §3a table; no static state; every guided state completes ≥1 full motion cycle per dwell; ramp states re-arm via `repeat_every_ms` with the cycle length COMPUTED from approach distance + slowed contact time + depart (never guessed).

**(e) Modes:** `single_body` (S1), `wall_impact` (S2–S7), `sandbox` (S8). `collision`/`explosion` unused (concept 2's).

**(f) Assessment + coverage_map + misconception_watch:** `assessment` items to be authored by physics-author covering: 2mv rebound numeric, F–t area read-off, F̄ = Δp/Δt numeric, equal-areas conceptual, t_c-invariance conceptual (advanced); `coverage_map` maps each to its state; `misconception_watch` ONLY at S2 and S5.

**(g) Macro↔micro (Rule 33):** see §3 note — contact-element deformation is the visible mechanism; live numbers = F_contact (N), true t_c (ms), area (N·s), peak marker. Each ramp state's interior story is distinct (S6 deepening squeeze vs S7 equal-length faster squeeze).

**(h) Canvas budget (Rule 34):** per state ONE formula surface (`#mb_formula`, bottom-centre, table in §3b), caption = the ≤5-word delta cue only (`#caption`, top-centre), value-only HUD (`#mb_readout`, top-right), trace bottom-left, sliders bottom-right, slow-mo badge top-left — the six zones are measured pairwise-disjoint in the contract (§6); nothing to invent, nothing may collide. All math Unicode (Δ, F̄, ′, √, π, ·, N·s).

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Preset cut coherence.** Cut 1 (hide advanced = S7): no surviving state references t_c = π√(m/k) or speed-invariance — S1–S6+S8 checked clean. Cut 2 (hide advanced+extended = S6+S7): the anchor and the safety law survive because S5's narration carries one knees sentence and the formula F̄ = Δp/Δt; S8's formula is F̄Δt = Δp (taught S4) — coherent. Constraint on physics-author: S5's narration must NOT say "as the next state shows"; S8 must not reference k-ramping or t_c.
- **(i-2) Explore = CORE only:** S8 formula `F̄Δt = Δp`, readouts v/p/F_contact — all established in core states. ✓
- **(i-3) `curriculum_tags` (claims, not facts):**

```
curriculum_tags:
  cbse_ncert:   { unit: "Laws of Motion (Class 11)", topic: "Impulse", verified: true }   # NCERT-verifiable at authoring (38g)
  jee_neet:     { relevance: "impulse–momentum theorem, F–t graph area", needs_teacher_verification: true }
  ap_physics_1: { unit: "Momentum — impulse and momentum change", needs_teacher_verification: true }
  ib_dp:        { topic: "Momentum and impulse", needs_teacher_verification: true }
  a_level_uk:   { topic: "Momentum; force as rate of change of momentum", needs_teacher_verification: true }
```

- **(i-4) Preset proposal (hide, never reorder):** `full` = S1–S8 · `standard` = hide S7 · `introductory` = hide S6+S7.
- **(i-5) Graph axes (38e):** F–t trace with F vertical, t horizontal — universal across boards, no known conflict, no axis-swap toggle needed. Decided.

**Also binding on json-author:** ≥3 primitives per state (Rule 19 — the momentum_bench block plus scene_composition primitives), no `mode_overrides` (Rule 20), never `'J'` in readouts alongside a trace, `text_hi` authored (30i) but NO `tts:*` runs on this tray, and the 8 registration sites at json-author stage. **STOP LINE stands: no `visual:eyes`, no `eye-walker`, no `visual:approve`, no deploy, no `engine_bug_queue` writes.**

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.**
- *Momentum itself* — breaks at S1 if the student has never met p = mv (this concept often IS their first momentum contact in Laws of Motion). S1 is the patch: one sentence defining p = mv against the live readout, without condescending — students who know it see a 10-second confirmation.
- *`newton_second_law`* — breaks at **S4** (F̄Δt = Δp is N2L rearranged). Patch sentence in S4's choreography plan: "from F = ma, the force times the time equals the mass times the velocity change" — one clause, delivered while the area fills.
- *`newton_third_law`* — breaks at **S3** (why the fixed wall carries a force arrow at all). Patch sentence in S3: "the wall pushes the ball exactly as hard as the ball pushes the wall — both arrows are drawn" — the equal-opposite arrow pair is already the state's visual.

**JEE-backwards trace.** Question: *"A ball of mass 0.15 kg moving at 12 m/s strikes a wall and rebounds at the same speed. The F–t graph of the contact is given. (a) Find the impulse on the ball. (b) If the contact lasts 10 ms, find the average force. (c) If the wall were padded so the contact lasted 40 ms, what changes?"* — (a) needs Δp = 2mv and impulse = Δp → **S2 + S4**; reading it as graph area → **S4**; (b) needs F̄ = Δp/Δt → **S5**; (c) needs peak/duration compensation at fixed area → **S5/S6**. No missing piece. (Bonus advanced discriminator "does contact time depend on impact speed?" → S7.)

**Misconception entry mapping (16a).** M1 → S2 (planting risk: S1's "momentum is what a moving body carries" could plant "momentum ≈ amount of motion, unsigned" — S1's narration must say "signed: direction counts" once, flagged for physics-author). M2 → S5 (planting risk: S3's "large force" beat could plant "stiff wall = more total effect" — acceptable, because that IS the confident-wrong-belief S5 is designed to break; do not soften S3). No EPIC-C branches (16b fallback deferred, no real students).

## Block 2 — Aha-moment designation

- **PRIMARY aha (S5):** *You cannot change the momentum transfer — you can only spread it over time: equal areas, very different peaks.* The 10-year memory is the two traces on one axis, tall-narrow and low-wide, shaded the same.
- **SUPPORTING aha (S2):** *Bouncing back doubles the momentum change* — 2mv, because the sign reverses. One supporting, one primary — the sweet spot.
- **Cohesion check:** S2 serves S5 directly — the payoff's "Δp identical by construction" is only credible to a student who has already internalized that a rebound fixes Δp at 2mv regardless of the wall. No orphan ahas.
- **Wrong-belief setup:** for S5's aha, S3+S4 build the confident wrong belief — the student has just watched the rigid wall deliver a violent 134 N spike and naturally expects "the rigid wall did more"; S5 breaks it with the equal areas. For S2's aha, S1 builds "momentum is just m times speed" — S2 breaks it with the sign flip.
- **Foundational-coverage rule:** S5 ∈ `foundational` (S1→S5). ✓

---

## Self-review declarations

- **DC Pandey / source check:** consulted no textbook content; scope and the NCERT ball-and-wall placement come from the founder brief; no teaching sequence, example problem, figure, or phrasing imported. Teaching arc authored from first principles against the engine's proved numbers.
- **Engine bug queue:** live query script not runnable in this dispatch (no shell tool); consulted `docs/FIELD3D_SCENARIO_CHECKLIST.md` (the canonical distillation) instead. Directives applied: concrete-before-abstract (single lane before two lanes; numbers before the S7 formula), reveal-synced-to-narration (trace draws with the contact, area named when shaded), coordinate sim+graph (the trace and the bench share one clock — engine-guaranteed), visual-must-match-narration (every stated number is a live readout), don't-pre-spoil (t_c formula gated to S7; F̄ = Δp/Δt gated to S5; no J-area talk before S4), sliders-last (guided states expose ≤1 contextual slider; full set only at S8). **FLAG → quality-auditor: run `query_engine_bug_queue.ts impulse` and `--field3d --open` as the Gate 8 pass; this skeleton's consultation was via the distillation file only.**

## Flags — where the contract and pedagogy pulled against each other, and the resolution

1. **`'J'` readout vs the trace's area label.** Pedagogy wants J visible everywhere from S2 on; the contract prohibits the `'J'` readout on trace states. Resolved WITH the contract: S2 (no trace) uses the mandated `['v','p','J','F_contact']`; S4+ let the trace's own `J = … N·s` area label carry the number. This is actually better pedagogy — the number sits ON the area it measures.
2. **Slow-factor on the two-lane state.** Honesty wants the same ×20 as the rigid-lane states, but the soft lane's 222 ms contact at ×20 is a 4.4 s dwell that kills the beat. Resolved for pedagogy within the contract: S5 (and S6/S8) use ×10, badge on — the honesty requirement is the BADGE + true HUD values, not any particular factor. Physics-author may tune factors; the badge and true ms are non-negotiable.
3. **No calculus form anywhere.** J = ∫F dt is the "real" definition, but Rule 38c puts calculus in the advanced ring and the advanced state's one formula slot is better spent on t_c = π√(m/k) (the counter-intuitive proved fact). Resolved: the integral is carried GRAPHICALLY (shaded area) at every level and never written symbolically. If a future advanced retrofit wants ∫F dt, it is a new advanced state, not a squeeze.
4. **Formula digit-check ambiguity.** The harness enforces "no digits, no values" in `formula`; `Δp = p′ − p` (primes) was chosen over subscript-digit forms, and `t_c = π√(m/k)` assumes π and the subscript `c` pass. **FLAG → json-author: verify both against the actual harness check before sealing; if `t_c` trips it, fall back to `t = π√(m/k)`.**
5. **`repeat_every_ms` on guided ramp states.** The contract's §4 describes `trusted_drag_seizes` + `repeat_every_ms` as the explore pairing, but the spec's §1 lists `repeat_every_ms` as a general per-state key ("re-arm the whole interaction"), and the ramp beats (S4/S6/S7) need repeated bounces to show a trend. Resolved: guided ramp states use `repeat_every_ms` WITHOUT `trusted_drag_seizes` (which stays explore-only). If json-author finds the renderer couples them, that is a STOP-and-report per the brief — do not extend the engine.
6. **No second movable body in `wall_impact`** means the `m2`/`v2` slider rows never appear in this concept, so "explore exposes ALL controls" = the 4 meaningful ones (`m1,v1,k,c`). Documented rather than worked around.

---

**Handoff:** this skeleton is ready for physics-author, who owns: exact narration (25–55 EN words/state within the budgets above, Rule 41 register), per-state motion timelines with computed positions/cycle lengths from the §1 apparatus constants, the `assessment` + `coverage_map`, drill-down trigger phrases, and the two `misconception_watch` entries' final wording.

---

# ORCHESTRATOR RESOLUTIONS (added 2026-07-31, post-architect)

Two of the architect's six flags are resolved from Phase 0 engine evidence. **Downstream stages take
these as settled — do not re-litigate or re-investigate them.**

**Flag 5 — `repeat_every_ms` without `trusted_drag_seizes`: RESOLVED, they are independent.**
`repeat_every_ms` landed in SEAM A (`2987cf4`) and is listed there as "fully implemented";
`trusted_drag_seizes` landed separately in SEAM C (`3d827ae`). They are separate config keys with no
coupling. Harness check C7 exercises them together only because the sandbox fixture uses both.
Guided ramp states may use `repeat_every_ms` alone. **This is NOT a stop-and-report condition.**

**Flag 4 — the `formula` no-digits check: RESOLVED by avoiding the construct entirely.**
The harness check (C8a) asserts the formula string contains no digit. `π` and `′` are not digits and
pass. The real hazard is `t_c`: an ASCII underscore violates Rule 34c (all on-canvas math must be
real Unicode), and Unicode has **no subscript Latin 'c'** to render it properly.

→ **S7's formula is `Δt = π√(m/k)`.** In this concept Δt *is* the contact duration, `Δ` is already
established from S2 onward, and it is clean Unicode. Do not author `t_c` in any formula surface.
The symbol table's `t_c` entry becomes `Δt`; on the HUD the true contact duration keeps its ms value.

**Flag 2 (slow_factor) stands as the architect resolved it** — the badge and true HUD values are the
honesty requirement, not any particular factor. Physics-author may tune factors per state.

**Flag 1, 3, 6 stand as resolved.** Note that flag 6's conclusion is confirmed by the engine
contract: `wall_impact` has one movable body, so `m2`/`v2` rows are correctly absent.
