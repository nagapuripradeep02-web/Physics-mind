# Skeleton — `angular_momentum` (rotmech · Class 11 Ch.7 · concept #9 · Phase 0d, Desk C) — REV 4

> **Status:** Phase-0d architect skeleton, **REV 4 — the FIX-CYCLE-2 resubmission** (Checkpoint A
> cycle-2 report `founder_proxy_A_cycle2.md`, verdict `DESIGN_FIX`, findings B1–B5, all routed
> `alex:architect`; this is the LAST fix cycle — the next verdict is `DESIGN_OK` or `ESCALATE`).
> A1–A13 and both founder rulings are DISCHARGED and NOT reopened; every B-fix is small and mapped
> in the FIX-CYCLE-2 RESPONSE table at the end. REV 3's two ruling deltas stand unchanged: **(R1)** the rbr camera is a filed P1 engine gap — **F-C4**,
> `docs/loop_runs/rotmech/_engine/findings_c.md` PASS 4 (READ this session; NOT re-filed) — so this
> concept authors its pose explicitly and tags every pose-dependent beat; **(R2)** `torque` (#5) and
> `moment_of_inertia` (#6) are NAMED in §8 — the REV 1/REV 2 OPEN-FOUNDER-QUESTION framing is
> answered. Every A1–A13 discharge from the REV 2 fix cycle (Checkpoint A `founder_proxy_A.md`,
> verdict `DESIGN_FIX`, all routed `alex:architect`) is preserved untouched — none reopened. Authored against the FROZEN `rigid_body_rotation` contract
> (`field_3d_renderer.ts:939–1058` interface · `:49736–50767` implementation, BUILT and MERGED).
> **Rule 12 applies fully:** every config field this skeleton consumes is verified IMPLEMENTED with a
> `file:line` citation in the ENGINE-REALITY WALK; no declared-inert member is consumed anywhere. The
> ONE field new in this revision (`slider_controls[token]` range overrides) is verified against its rbr
> reader `rbrSc` (`:50005–50014`) this session.
> **Revision history:** REV 1 at `skeleton_rev1.md` · Checkpoint A report `founder_proxy_A.md` ·
> REV 2 (fix-cycle-1; A1–A13 discharged) at `skeleton_rev2.md` · REV 3 (the ruling-delta pass)
> preserved at `skeleton_rev3.md` · Checkpoint A cycle-2 report `founder_proxy_A_cycle2.md`
> (`DESIGN_FIX`, B1–B5) · **this file = REV 4, the 2026-08-04 fix-cycle-2 resubmission** — every
> B-finding response mapped in the FIX-CYCLE-2 RESPONSE table at the end; the RULING-DELTA and
> FIX-CYCLE-1 tables are preserved as history. Everything the reviewer verified
> and endorsed is preserved structurally (all 20 ENGINE-REALITY WALK rows, the §3 closed-form
> numerics, the S3 stop-slide-restart device, the S5 `r` exclusion, `flip_spin: false`, the L-vs-I
> 3.06 catch, the prerequisite handling); the deltas are exactly the A1–A13 responses — mapped
> finding-by-finding in the FIX-CYCLE-1 RESPONSE table at the end.
> **Bug-queue consultation (LIVE table via Bash, RE-RUN at REV 3, 2026-08-04):** `--owner alex:architect` →
> **63 rows** · `--row-type directive` → **83 rows** · `--field3d --open` → **85 rows** ·
> `angular_momentum` → **0 rows** · `rigid_body_rotation` → **0 rows** (REV 2 saw 1 — the
> `engine_stash_on_shared_renderer…` row, #33 below, no longer carries the concept tag at the live
> table; its REV 2 disposition was N/A-at-this-desk, so zero design impact — the disposition is
> retained below as history). Supabase intermittently returned 522s this session; every count above
> is from a verified non-failed run. Counts otherwise IDENTICAL to the REV 1
> consultation — the union is the same **157 distinct bug_class strings** (156 at the REV 3 re-run — #33's concept
> tag dropped, disposition retained), so the REV 1 SCAR AUDIT
> carries forward below with only the dispositions the Checkpoint A report showed defective re-ruled
> in place (#2, #25, #129, #139, #141). The six candidate rows drafted in `founder_proxy_A.md` §6 and the FOUR drafted in
> `founder_proxy_A_cycle2.md` §6 are not yet filed; this revision conforms to every one of their
> prevention rules (the cycle-2 four ARE the B1/B2/B3/F-C5 classes, discharged in the FIX-CYCLE-2
> RESPONSE table). **REV 4 consultation attempt (2026-08-04): Supabase UNREACHABLE — Cloudflare 522
> HTML on the concept/scenario queries and a zero-row grep on the owner query this session,
> corroborating the cycle-2 report's four consecutive 522s. The REV 3 verified counts (63/83/85/0/0)
> carry forward; the boundary is declared honestly rather than asserted fresh.**
> **DC Pandey check:** chapter table of contents only (Ch.7 scope confirmation). No teaching method,
> example problem, or figure imported. NCERT = syllabus backbone only.
> **Namespace check:** `angular_momentum` exists in neither `src/data/concepts/` nor
> `src/data/concepts/chemistry/` (checked at REV 1); it is pre-registered in `VALID_CONCEPT_IDS`
> (`src/lib/intentClassifier.ts:1274`) with the scope line this skeleton obeys.
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

**Vector-beat ownership (the Checkpoint A structural question, answered in writing for Checkpoint C):**
the axial-vector + grip-rule beat (S4) is OWNED by this concept. The registered scope line
(`src/lib/intentClassifier.ts`, rotmech block) explicitly includes "drawn as a VECTOR along the
rotation axis with its direction set by the right-hand rule", and `conservation_of_angular_momentum`'s
own §1 states it does not cover what angular momentum is. #10's DESIGN_OK'd S6 is the same state as
this S4 (same archetype, same two restarted opposite-spin runs, same grip hand, same arrow flip, same
extended ring). S4 is NOT deleted on that basis — the duplication is a chapter-level founder item at
Checkpoint C, now on record: if #10 keeps a vector state, the version inside ITS scope is that the
DIRECTION of L is conserved too, not the grip-rule introduction, which is this concept's registered
material.

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
| S1 | A spinning body carries angular momentum | Definition: name L, restate I and ω (prerequisites), build the three readouts in ledger order; the `L = Iω` formula surface and the axial L arrow are ON from t = 0 (A5 — the registered headline visual debuts with the definition beat; the arrow's DIRECTION un-narrated until S4) | *(straightforward beat)* | manual_click | core (qualitative) |
| S2 | Slower spin, smaller L | ω-proportionality, used PREDICTIVELY: a brake slows the spin; L = Iω predicts where L lands (chip at 1.53) and the live readout meets it; I never moves | *(straightforward beat)* | manual_click | core (quantitative) |
| S3 | Mass position changes L | THE PRIMARY AHA + misconception pivot: stop → move the masses in while STILL → restart at the SAME ω = 1.50 → L reads 0.99 beside its "before: 4.59" chip. Spin rate alone does not fix L | `misconception_confrontation` | manual_click | core (quantitative) |
| S4 | L points along the axis | Vector nature: grip rule, sign colours, two restarted runs of opposite spin — arrow up, then down | *(straightforward beat)* | manual_click | extended |
| S5 | Try it yourself | Sandbox: m and ω₀ each RESTART → L re-pins from the new I·ω₀; the L arrow tracks the product live during the drag (slider ranges authored inside the arrow map's faithful band) | `exploration_sliders` | interaction_complete | *(explore — core-ring content only)* |

**Rail check (Rule 41d / A13):** the five titles' FIRST words are pairwise distinct — "A spinning…" /
"Slower…" / "Mass…" / "L points…" / "Try…" — so the truncating rail can never show adjacent twins
(REV 1's S2/S3 both opened on a spin-speed phrase and both ended "…smaller L").

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

**Narration→timing conversion (A1 — every timed value below derives from it):** Rule 31's own pacing
is 25–55 EN words ≈ 10–20 s ⇒ **2.6 words/s**. Every reveal schedule below is derived from the state's
MAX word budget (the worst case): the cumulative words of the sentences up to AND INCLUDING the one
that defines a surface, ÷ 2.6, give the earliest instant that surface may print; every `at_ms` sits at
or after that instant. State duration R = max-narration time + a held tail ≥ 1.5 s. The frozen pin is
NOT derived from R (A6) — it follows the reveal candidates automatically (`deriveStateMeta.ts:3134–3210`),
so this re-timing moves every pin with it. physics_author writes the actual sentences and RECOMPUTES
every `at_ms` from the real cumulative word counts on the engine's 16 ms grid; the schedule below is
the binding worst-case envelope, not a promise of exact instants.

**Scope of the reveal-after-its-sentence rule (B1 — the cycle-2 root cause, corrected):** the
ledger discipline above governs PRINTED symbols and values ONLY — `readout_at_ms`,
`reference_marks` chips, the formula surface. It never gates the motion of a PHYSICAL OBJECT:
Rule 32a requires cause-before-effect, not narration-before-motion — an object may move before
(or while) the sentence that names it runs. REV 3 over-applied the ledger to every channel, which
serialised narration→motion and opened the S3/S2 static holes. Two consequences, BINDING on every
recomputation:
- **No-static-hole rule:** no guided state holds a fully static canvas (nothing translating,
  rotating, ramping, revealing, or changing a readout) for more than ~2 s; the movers must SPAN
  the narration, never follow it. Whenever the clock is re-derived from real word counts, the
  mover windows are RE-SPREAD over the new clock in the same pass.
- **Plan-binds rule (B4):** the sentence plan below is the BINDING narration envelope — each
  sentence is written AT OR UNDER its planned words (the band's lower bound still applies to the
  state total), so the plan's cumulative ends are true worst-case instants and every derived R,
  `at_ms` and ≥1.5 s held tail holds by construction. The Words column reads "plan N binds"
  accordingly.

**Sentence plan (max words per sentence · cumulative end instant at 2.6 words/s):**

| State (budget) | Sentences | Cumulative ends |
|---|---|---|
| S1 (40–55) | T1 the machine + merry-go-round anchor (16 w) · T2 I defined, dual-label "moment of inertia (rotational inertia)" (14 w) · T3 ω defined (9 w) · T4 L defined + "the arrow on the axle shows how much" (16 w) | 6.2 · 11.5 · 15.0 · 21.2 s |
| S2 (40–55) | T1 recall + the brake announced (12 w) · T2 the prediction: L = Iω ⇒ 1.53 (14 w) · T3 the pad named as the cause (10 w) · T4 the locked fall, I holding (12 w) | 4.6 · 10.0 · 13.8 · 18.5 s |
| S3 (40–55) | T1 baseline restated: L reads 4.59 (9 w) · T2 the brake stops it; ω = 0 so L = 0 (13 w) · T3 still platform, masses slide in, I falls (12 w) · T4 restart at the same speed (10 w) · T5 payoff: 0.99, not 4.59 (11 w) | 3.5 · 8.5 · 13.1 · 16.9 · 21.2 s |
| S4 (35–50) | T1 bicycle-wheel anchor + the axle line (13 w) · T2 grip rule, run A: thumb up (14 w) · T3 the flip: thumb down, same line (12 w) · T4 the axis, not any mass's heading (11 w) | 5.0 · 10.4 · 15.0 · 19.2 s |
| S5 | 0 / open | — |

**Word-band position (the B1 trim branch, addressed rather than skipped):** the plans stay at
55/48/55/50 — the mid-band trim is DECLINED, with reasons: (1) the cycle-2 defect was
motion-spread, not word count — S1 and S4 carry continuous apparatus motion at full band with no
static window, and the S2/S3 holes are closed below by re-spreading movers with zero words
removed; (2) trimming S2/S3 would move their narration-anchored reveal instants and therefore
their pins (chip `at_ms` + 900, release + 2000, `readout_at_ms` + 1200 all derive from sentence
ends), which this fix is required to hold at 20400/19500; (3) the top-band words are doing
enumerable work — S1 carries three term introductions plus the A11 dual-label and the A5
arrow-introduction clause; S3's five sentences anchor five sequential beats and carry the §4
attribution clause that guards the cross-concept planting risk — compression there risks exactly
the narration-does-structural-work caveat Checkpoint A attached to A9. What IS adopted from the
branch: the plan-binds rule (plans are maxima; physics_author writes at-or-under), and the
no-static-hole rule makes any real-count shortening safe by construction (movers re-spread
whenever the clock moves).

**Coined archetypes (two, each justified once):**
- `decay-track` (S2) — a rendered agent drives a smooth decay while two readouts fall in locked
  proportion and a third holds; the distinct picture is the lockstep fall meeting a pre-printed
  prediction chip. (Not `oscillate/track`: nothing is periodic.)
- `stop-and-reconfigure` (S3) — the apparatus is halted, its shape is changed with ZERO dynamics on
  show, then relaunched so the consequence is read against the on-screen baseline. (No seed archetype
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
| S1 | A spinning body carries L = the product of I and ω | `reveal-build` | Turntable already spinning at ω = 1.50, masses at r = 0.80 (home pose; the drum's marker stripe makes the spin legible). **`L = Iω` formula surface + the axial L arrow + `L` sprite ON from t = 0** **[POSE-OBLIQUE]** (both are static per-state overlays — formula `:50570–50574`, arrow visibility `:50609`, neither timeable; the t = 0 branch taken per Checkpoint A A5: the definition beat carries the registered headline visual, and the core_only cut stays coherent). Readouts build ONE at a time, each only AFTER its defining sentence (`readout_at_ms`): I = 3.06 at 12000 ms (T2 ends 11.5 s), ω = 1.50 at 15500 (T3 ends 15.0 s), L = 4.59 at 21500 (T4 ends 21.2 s). T4's closing clause introduces the arrow as the how-much indicator; its DIRECTION is deliberately un-narrated until S4. **`phases[]` (B2 — the focal follows the narration; REV 3's static 24 s `rbr_drum_marker` focal dimmed the debuting arrow to 0.40 for its whole debut state, `:50782–50788` + `:3397–3398`):** base `rbr_drum_marker` (T1, the spinning machine) → `rbr_mass` at 6300 (T2, I = the mass spread) → `rbr_drum_marker` at 11700 (T3, the sweep) → **`rbr_l_arrow` at 15200, open** (T4 — the arrow holds the focal through the sentence that introduces it; its label `rbr_l_label` is solid-listed and never dims). The spin is continuous for all 24 s — no static window. Anchor (~7 words) inside T1. R = 24 s | **"Spin carries angular momentum"** | none | 40–55 · plan 55 binds | core |
| S2 | L falls in exact proportion to ω (I fixed) — and L = Iω predicts the landing value | `decay-track` | Formula + arrow persist from S1 (no debut event — Rule 32d). T1 announces the brake by 4.6 s → **the pad GLIDES in from 4800** (`pad_travel_ms` 6800, engage 11600 — the travel window is engine-derived as engage − travel_ms, `:50735–50736`: the cause is announced, then visibly approaches for the whole middle of the state. B1: an OBJECT may move once 32a is honoured; the ledger gates printed values only). T2's prediction ends 10.0 s → the chip **"predicted L = 1.53"** reveals at_ms 10500 beside the L readout, BEFORE the fall begins. τ = 0.45 N·m acts over engage_at_ms 11600 → release_at_ms 18400 (6.8 s braked ⇒ ΔL = 0.45 × 6.8 = 3.06 exactly): L 4.59 → 1.53 linearly, ω 1.50 → 0.50 in lockstep — a slower, MORE readable fall than REV 3's 3.4 s sprint, spanning the second half of the state instead of its last 15% — **I holds 3.06 with `hold_glow`**, the unchanging ratio IS the lesson; the L arrow shrinks in EXACT proportion (0.918 → 0.306 world units; both ends clear the 0.22 floor, `:49796–49797`) **[POSE-OBLIQUE]**. T3 (ends 13.8) narrates the press as the cause while the fall is young (32a holds: the press at 11.6 s precedes the fall it causes; the naming sentence may run over the motion). At release the live L lands on the chip and the MATCH latch co-glows both (`:50271–50278`); the pad retracts from 18400 on the same 6800 ms path (mid-retract at state end — motion only, nothing asserted on it; S3 re-poses it parked at entry, the accepted single-frame re-pose). **`phases[]` (B2):** base `rbr_brake_pad` (announce → glide → press) → **`rbr_l_arrow` at 12600, open** (the decay + the chip match — the arrow's LENGTH is the state's tracking channel and now holds the focal while it tracks; the pad is never focal after it stops mattering). NO fully static window: spin continuous, glide 4.8–11.6 s, decay 11.6–18.4 s, retract runs to state end. **Rendered differentiators vs #10's approved brake beat (A7, named for the Checkpoint-C coherence check):** (1) the prediction chip — #10 S5 authors none; (2) `hold_glow: ['I']` here vs the drawn `R_drum` reference line there (`show_drum_line: false` here); (3) endpoint numbers 1.53 / 0.50 here vs ≈2.29 / 0.75 there; (4) framing — a prediction met here, the law's boundary condition there. τ 0.45-vs-0.92 is NOT claimed as a differentiator: no `tau_brake` row is built in either concept, so no student can see it | **"L falls with the spin"** | none | 40–55 · plan 48 binds | core |
| S3 | The same spin speed can carry much less L — mass position matters | `stop-and-reconfigure` | 0–3.5 s steady home spin (T1 restates the baseline: L reads 4.59). Pad travels 3900–4500 (engage − travel_ms 600); τ = 2.00 engages at 4500 and stops the platform at ≈6.8 s (analytic 2.295 s decay; closed-form clamp `:49937–49944`, no integrator lag); release_at_ms 7500, retract 7500–8100. **Chip "before: 4.59" (`reference_marks`, surface L) reveals at_ms 7800** (A2 — the aha's baseline stands beside the L readout from here to state end; revealed only AFTER L has left 4.59 — L = 0.00 from the stop instant — so the reveal-gated match predicate `:50275` can never spuriously latch). **9000–16000 ms: `param_ramp` slides r 0.80 → 0.20 on the STILL platform** (B1 — the 7 s slide SPANS T3 and T4, replacing REV 3's 2 s sprint that left 11.0–17.0 s fully frozen; the physics is identical — L = 0 rest-clamped, so ω = L/I = 0 for every I(t) during the slide) — the only mover is the mass pair **[POSE-OBLIQUE]** (the slide is a horizontal-plane translation whose screen travel depends on the rod's stop azimuth — CONTROLLED via the `theta0_rad` = 0.168 azimuth solve, B3, camera plan below); the I readout falls live 3.06 → 0.66 across the whole 7 s slide (pure geometry; ω and L pinned at 0.00). T4 ends 16.9 s → chip **"same speed: 1.50"** (surface ω) reveals at_ms 17000. **Restart at_ms 17500, `flip_spin: false` EXPLICIT**, blank 500 ms (badge "restarting") → at 18.0 s the spin resumes at exactly ω = 1.50 (chip match co-glows) — **L reads 0.99 beside its "before: 4.59" chip**: both halves of the contrast on one frozen frame (Rule 24, reads sound-off). Held to R = 23 s. Largest static window anywhere in the state: 1.0 s (16.0–17.0 s) — the no-static-hole rule holds. **`phases[]`:** base `rbr_drum_marker` (T1 baseline spin) → `rbr_brake_pad` at 3900 (travel + stop) → `rbr_mass` at 9000 (the slide) → `rbr_drum_marker` at 17500 (the relaunch). `show_l_arrow: false` in this state (the 0.22 arrow floor would draw a nonzero stub through the whole L = 0 dwell — F-C2); the L story rides the readout + BOTH chips | **"Same speed, smaller L"** | none | 40–55 · plan 55 binds | core |
| S4 | L is a vector along the rotation axis (grip rule) | `cycle-compare` | **[POSE-OBLIQUE]** Oblique framing per the §3 camera plan — vertical axle fully in frame (the flip is this concept's MOST pose-dependent picture). Run A (0–11.0 s): spin +1.50, the articulated grip hand curls continuously with the rim (2600 ms curl loop, `:50748–50764`), L arrow UP, blue (`RBR_POS_COLOR`); T1's bicycle-wheel anchor and T2's grip-rule walk complete at 10.4 s. Cut at 11.0 s (`restart` at_ms 11000, every_ms 8000, `flip_spin: true` — authored explicitly even though it is the default), blank 500 ms → Run B (11.5–19.0 s): spin −1.50, hand flips 180° about world X (orientation-preserving — still a right hand, `:50746–50750`), arrow DOWN, amber; readouts print signed values with the real U+2212 minus (`rbrFx`, `:49817–49823`). Second cut at 19.0 s → run A′ closes the A→B→A′ cycle to R = 22 s. **First and only state to narrate direction.** Secondary anchor (~9 words) in T1 | **"L points along the axis"** | spin-direction button *(min_ring: extended)* — drives the SAME restart mechanism live (`:50100–50111`), never eased through zero | 35–50 · plan 50 binds | extended |
| S5 | Sandbox — L tracks the product I·ω | `drag-sandbox` | `mode: 'sandbox'`, free-running (Rule 37). Entry = home pose, spinning; formula + arrow on. **Honest control semantics (A4, corrected):** every `input` event on `m` or `ω₀` fires `rbrApplyParam` → `rbrRestartNow` (`:50074`/`:50078`), which re-arms the re-pin blank — so during a continuous drag all three READOUTS render "—" under the "restarting" badge (`:49899`, `:50243`) and re-appear 0.5 s after the teacher lets go, at the new I·ω₀ (F-C3 filed for the engine-side improvement). The LIVE channel during the drag is the **L arrow** — its frame path is not blank-gated (`:50704–50718`) — and with the ranges below it is exactly proportional over the ENTIRE reachable band: **the arrow tracks the product live during the drag; the numbers confirm it half a second after release.** **[POSE-OBLIQUE]** The spin-direction button restarts with the sign flipped. **`r` is EXCLUDED** (the hazard ruling below). **`tau_brake` is EXCLUDED** (F-C1: a live τ drag applies torque while the pad stays invisible/parked — an invisible cause). **No `idle_auto_sweep`**: the only implemented sweep param is `r` (`rbrRAt`, `:49857–49862`), which is excluded. Until the first trusted input the machine simply spins live (Rule 37) | **"Try it yourself"** | `m` *(core, `slider_controls` 0.5–3.0 kg)* · `ω₀` *(core, 1.0–2.0 rad/s)* · spin-direction *(extended)* | 0 / open | *(explore)* |

**S3 one-beat ruling (A9 — trimmed to its sufficient reason, B5):** S3 is three sequential MOTIONS
(stop, slide, relaunch) carrying ONE idea — the same ω with a different I is a different L — which
only the full cycle can show on one machine (ω₀ is a per-state constant, so a two-speed comparison
inside one state is impossible; any r motion while spinning renders the sibling's aha). The
S3a/S3b split was checked against the 5-state budget and rejected on ONE ground, which is
sufficient and is the whole ruling: **S3a's own payload ("stopped: ω = 0 so L = 0") is derivable
arithmetic on the already-taught relation — it fails the state-earns-its-place-by-a-distinct-IDEA
test.** (REV 3's two supporting reasons are WITHDRAWN, not defended: `reference_marks` are
per-state surfaces, so a split could simply author its own "before: 4.59" chip in S3b — where L
runs 0 → 0.99, is never 4.59, and so could never spuriously latch — the chip-stranding argument
was wrong; and "the re-timed envelope carries the load without compression" was contradicted by
B1's 6-second hole. The ruling stands on the information-gain test alone.) One beat, kept — with
the Checkpoint A caveat carried forward: narration does structural work here (the §4 attribution
rule), so physics_author must keep T4/T5 inside the authored wording plan.

**S5 `m`-correlate honesty (A8):** the drawn mass spheres are size-constant by design (`RBR_MASS_R`,
`:49798` — Rule 29: magnitude is never size), so dragging `m` changes nothing about the machine's
drawn geometry. Its rendered correlates are (1) the L arrow — live during the drag and, with the A4
ranges, faithful across the whole reachable band — and (2) the re-pinned readouts 0.5 s after release.
physics_author instruction: S5's caption/plan directs the teacher's eye to the arrow and the readouts
("watch the arrow"), and never claims the masses themselves respond. Scar #141's disposition now names
S5 explicitly (SCAR AUDIT).

**Slider-range derivation (A4-ii — authored regardless of the F-C2ext engine fix):** per-concept
overrides ride `config.slider_controls[token]` (schema `:2181`; rbr reader `rbrSc` `:50005–50014`,
verified this session — per-token min/max/step/default/label merged over `RBR_SLIDER_SPEC`). Authored:
`m` {min 0.5, max 3.0, step 0.1, default 2.0} · `omega0` {min 1.0, max 2.0, step 0.1, default 1.5}.
With r pinned at 0.80: I = 0.50 + 1.28·m ∈ [1.14, 4.34] ⇒ reachable |L| = I·ω₀ ∈ [1.14, 8.68] ⊂
**[1.10, 9.00]**, the arrow map's faithful band (0.22 ≤ 0.20·|L| ≤ 1.80, `:49796–49797`): no slider
corner floors or saturates the arrow, and the home pose (L = 4.59) sits mid-band. Trade accepted: a
narrower sandbox that never lies beats a wide one whose arrow freezes while the number climbs (REV 1's
corners reached L = 20.7 with the arrow clipped from 9.00 up). If F-C2ext's knee+asymptote map lands,
a later rev may widen the ranges.

**Archetype audit:** reveal-build (S1), decay-track (S2), stop-and-reconfigure (S3), cycle-compare
(S4), drag-sandbox (S5). No repeats, no static state; drag-sandbox on the explore state only.

**Camera plan (Ruling 1 / F-C4 — filed P1 engine gap, `docs/loop_runs/rotmech/_engine/findings_c.md`
PASS 4; READ this session, NOT re-filed).** The rbr camera is hardcoded at build time —
`spherical.phi = 1.16` (66.5° polar = 23.5° elevation above the rotation plane), `radius = 9.6`,
`theta = π/4` (`field_3d_renderer.ts:50476`); NO camera field exists anywhere in the config surface
(`:978–1060`) and `applyRigidBodyRotationState` (`:50480`) never touches the camera — one pose, every
state, every concept. This concept's correct framing IS exactly that oblique pose — but until this
revision it held the pose only by accident of an engine default. That is the trap the apparatus
contract's author-even-when-the-default-matches discipline exists for: an omitted field silently
inherits a default, and a future engine change to that default would silently move this concept's
framing with no authored record that the framing mattered.

- **Authored pose — ONE pose, all five states (S1–S5):** `{radius: 9.6, theta: π/4, phi: 1.16}`, the
  current solved default declared verbatim. No state wants a different pose: this concept needs BOTH
  an axial-vector read (which fails toward top-down — the L arrow foreshortens to a dot) and a
  legible SWEEP of the drum's rotation marker (cycle-2 correction: NOT a "spin-circle read", which
  overstated the constraint — `rbr_drum_marker` is a radial `BoxGeometry` bar on the drum's top
  face, `:50322–50326`, so what it needs is a readable sweep, not circularity; the sweep degrades
  toward side-on, where the bar's motion collapses to an ambiguous oscillation). The oblique pose
  is the solve that serves both at once. It also inherits the build comment's framing obligation (`:50469–50474`): the pose
  was SOLVED by sweeping radius and elevation together, per scar
  `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` — any future
  re-solve must sweep both axes, never nudge one.
- **Pose-dependent beats, tagged [POSE-OBLIQUE] in the control table (the blast radius if the pose
  ever moves):**
  - **S1** — the axial L arrow ON from t = 0 (the registered headline visual, A5): toward top-down
    it collapses toward a dot and the definition beat loses its picture.
  - **S2** — the arrow's exact proportional shrink 0.918 → 0.306 world units: the LENGTH read is
    the state's tracking channel, and foreshortening compresses the very ratio the beat teaches.
  - **S4** — the up/down flip + grip hand: the MOST pose-dependent beat — both arrow directions and
    the hand's curl plane must read simultaneously (top-down kills the flip; side-on kills the curl).
  - **S5** — the arrow is the ONLY live channel during a drag (A4: readouts blank until release): a
    foreshortened arrow would leave the drag with no faithful correlate at all.
  - **S3 — the mass slide, TAGGED [POSE-OBLIQUE] (B3 — the cycle-2 omission):** the slide is a
    translation in the horizontal plane, so its screen legibility swings 2.5× with the rod's
    azimuth α to the camera at the stop instant (full 1.08 world units of travel at α ≈ 90°;
    0.399× and mostly toward the camera at α ≈ 0°). REV 3 checked only the NUMBERS (readouts +
    chips — genuinely pose-independent DOM surfaces) and missed the MOVER of the primary aha.
    α is now CONTROLLED via the `theta0_rad` azimuth solve below, never left to luck.
  - **Checked and NOT tagged:** the **drum-marker spin legibility** (S1/S3 focal): the marker is a
    radial bar needing a legible SWEEP, not a circle (actual geometry: `BoxGeometry` on the drum's
    top face, `:50322–50326`) — it constrains the pose from the OPPOSITE side (degrades toward
    side-on, not top-down) and reads clearly at 23.5° elevation. A pose-TOLERANCE, not a
    pose-dependence; recorded with the real geometry so any future pose re-solve respects both
    constraint directions.
  - **The S3 azimuth solve (B3) — `theta0_rad` is IMPLEMENTED, and it is the lever:** REV 3's walk
    marked the field DECLARED-INERT by copying the renderer's stale type-declaration comment
    (`:953` "DECLARED, NOT IMPLEMENTED"); the READERS implement it — seeded at `:50499`
    (`theta0: rbrNum(rb.theta0_rad, 0)`), applied at every state entry via `rbrThetaReset`
    (`:50557` → `:49970` `eng._th = eng.theta0`), and returned by `rbrThetaAt` (`:49958` /
    `:49965`) — re-verified by grep against the readers THIS session. It is the exact mirror of
    the A3 trap: there, a token that looked live and was not; here, a field that looks inert and
    is not. Rod azimuth at the S3 stop: θ_stop = `theta0_rad` + ω₀·t_engage + ω₀·t_decay/2, with
    t_decay = I₀ω₀/τ = 2.295 s ⇒ θ_stop = `theta0_rad` + 8.471 rad. Rod ACROSS the view ⇒
    (θ_stop − π/4) ≡ π/2 (mod π — the rod is two-ended) ⇒ **`theta0_rad` = 0.168** for the §3
    timings (REV 3's implicit 0 landed α ≈ 80° by pure luck, and α moves ≈43° for every 0.5 s the
    brake window shifts). **json_author/physics_author instruction: RE-SOLVE `theta0_rad` =
    ((π/4 + π/2) − ω₀·(t_engage + t_decay/2)) mod π whenever the brake window, τ, ω₀ or I₀ moves —
    §3 instructs recomputation from real word counts, so it WILL move.** Authored in S3 only;
    every other state keeps the default 0 (entry orientation is invisible on a spinning platform —
    no 32d continuity break). General lesson, adopted into the walk: a field claimed INERT needs
    proof that no reader consumes it — grep the symbol, never copy its declaration label.
- **Dependency direction, stated plainly (the asymmetry Desk E should read):** this concept is
  authorable TODAY on the existing hardcoded pose and is **NOT blocked by F-C4** — what F-C4 buys it
  is that the pose stops being an accident. If per-state camera authoring lands, json_author writes
  the pose above into the config of every state; if it does not land, this concept INHERITS `:50476`
  and carries the recorded risk that any future change to that hardcoded default silently re-frames
  every [POSE-OBLIQUE] beat, with no authoring-side gate to catch it before THE EYE's baselines
  drift. The sibling `rigid_body_rotation` (#3) sits on the OTHER side of the asymmetry: it needs
  near-top-down (under this pose its circles render at 0.399 aspect while its narration says
  "circle") and is **NOT authorable as designed without the F-C4 row**. One desk, one scenario,
  opposite pose requirements — that collision is the row's priority argument, recorded here so it
  stays legible.

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

**Rule 32 legibility:** cause before effect (S2's pad is announced, glides in over 6.8 s, and
presses at 11.6 s — the fall follows the press; S3 slide completes before the restart; S4
cut-blank before the flipped run) · only the taught variable moves per guided
state (S1 nothing but the standing spin + readout builds; S2 the decay; S3 one mover at a time,
sequentially; S4 the sign) · delta cues ≤5 words, each the caption opener · same machine from the home
pose every state, single-frame re-pose at entry, no teleport-rebuild · ONE scene glow focal per instant
(per-state `glow_focal` + `phases[]` re-aim it, `:50647–50657`; readout `hold_glow` is the separate
instrument channel, `:50206–50218`, so the relation's halves are never scene-dimmed — scar
`state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` discharged by channel
separation). **Focal plan (A3 → B2: a focal is a per-INSTANT decision — every guided state longer
than two sentences authors `phases[]`, `:50647–50657`; the sentence that introduces an overlay
holds that overlay as the focal at that instant, never as a dimmed peer. The dim is REAL:
`rbr_l_arrow` is NOT in the solid carve-out `:50782–50788`, so a non-focal arrow renders at
`GLOW_DIM_OPACITY` 0.40 (`:3397–3398`) — the engine's recorded judgment is that a 40 % arrow
still reads as an arrow (`:49010–49026`), so the defect B2 names is the STATIC focal across a
22–24 s state, not the dim itself):** S1 base `rbr_drum_marker` → `rbr_mass` at 6300 (T2) →
`rbr_drum_marker` at 11700 (T3) → `rbr_l_arrow` at 15200, open (T4 — the introducing sentence) ·
S2 base `rbr_brake_pad` (announce → glide → press) → `rbr_l_arrow` at 12600, open (the decay + the
chip match) · S3 base `rbr_drum_marker` (T1 baseline) → `rbr_brake_pad` at 3900 (travel + stop) →
`rbr_mass` at 9000 (the slide) → `rbr_drum_marker` at 17500 (the relaunch) · S4 `rbr_l_arrow`
static, deliberate (the arrow IS the state's subject — cycle-2 report §2: no dim problem; the
hand is a named mesh, never dimmed — Rule 29) · S5 none. Every phase boundary sits at its
sentence's cumulative end from the §3 plan (physics_author moves them with the real word counts);
phase instants are PIN CANDIDATES (`deriveStateMeta.ts:3198–3208`), enumerated in the pin table —
no pin moves. **F-C5 (reviewer-filed, Desk E ride-along, NOT re-filed here):**
`applyRigidBodyRotationGlow` has no `glowTargets` fallback (`:50772` vs force_rig `:49002`), so
per-sentence narration `glow` is INERT on rbr — `phases[]` is this scenario's ONLY emphasis
instrument, and the plan above is designed on exactly that basis. **Glow-reachability
rule (A3 — the strengthened safeguard):** enum membership is NOT sufficient.
`applyRigidBodyRotationGlow` early-returns on `rbr_root` and `rbr_spin` (`:50776`) BEFORE its focal
test, while `glowActive = !!focal` (`:50773`) is true for any non-empty string — so naming either dims
the whole apparatus and brightens nothing (REV 1's S1/S3-relaunch defect). A glow target must be
REACHABLE BY THE CONSUMING FUNCTION: check the pass's early-return list, not `RBR_ELEMENT_TYPES`.
Every focal token above was re-checked against the pass this session — `rbr_drum_marker`,
`rbr_brake_pad`, `rbr_mass`, `rbr_l_arrow` all reach the focal test ✓. An absent `glow_focal` is legal
(Rule 32e caps the focal count; it does not require one).

**Rule 33 macro↔micro:** N/A-with-justification — the taught variable's mechanism (spin + mass
placement) IS the visible apparatus. Instruments (33d): value-only HUD, live 2-dp numbers, the 2-dp
convention shared with the sibling (one machine, one rounding).

**Rule 34 canvas budget:** top caption = the ≤5-word delta cue only; ONE formula surface per state —
S1/S2/S3/S5 **`L = Iω`** (`#rbr_formula`, Cambria Math, `:50446–50449`; S1 per A5), S4 **none** (the
picture is the lesson); all surfaces symbolic — numeric claims live only in the HUD and the three
chips the live readouts meet or stand beside; all on-canvas math real Unicode (ω, kg·m², U+2212 minus
via `rbrFx`).

**Frozen-pin table (A6 — pins computed from the renderer's REAL derivation: pin =
`clampReveal(max(reveal candidates))`, `deriveStateMeta.ts:3134–3210` + `clampReveal` `:3423–3425`,
called at `:3445`. Candidates per component: ramp end + 900 (`:3145`) · brake release + 2000 (`:3156`)
· restart at + blank + 1500 (`:3175`) · marks at + 900 (`:3185`) · readouts at + 1200 (`:3195`). The
pin is INDEPENDENT of state duration; the clamp bounds (1500 / 60000) engage nowhere below. REV 1's
`0.60R` formula is deleted — it does not govern field_3d):**

| State | Candidates (ms) | Pin | Last asserted event | Margin | Frozen frame photographs |
|---|---|---|---|---|---|
| S1 | readouts 13200 / 16700 / **22700** · phases 6800 / 12200 / 15700 | 22700 | L printed 21500 | 1200 ✓ | all three readouts live at home values; formula + L arrow up (from t = 0); arrow holds the focal (phase from 15200) |
| S2 | chip 11400 · phase 13100 · release **20400** | 20400 | match latch at release 18400 | 2000 ✓ | L = 1.53 co-glowing its prediction chip; I = 3.06 hold-glow; ω = 0.50; pad withdrawing (deterministic mid-retract, clock-derived) |
| S3 | release 9500 · marks 8700 / 17900 · ramp **16900** · phases 4400 / 9500 / 18000 · restart **19500** | 19500 | restart effective + ω-chip latch 18000 | 1500 ✓ | ω = 1.50 matched to its chip; **L = 0.99 beside "before: 4.59"**; masses visibly at r = 0.20; rod ACROSS the view (theta0 solve) |
| S4 | restart **13000** | 13000 | Run B under way from 11500 | 1500 ✓ | arrow DOWN, amber; hand flipped; signed −1.50 / −4.59 |
| S5 | sandbox — no reveal pin (classified interactive, `:3210–3212`) | — | — | — | live spin |

**Pin-candidate completeness note (REV 4, self-caught while discharging B1/B2):** `phases[]`
instants are pin candidates (`deriveStateMeta.ts:3198–3208` — a window phase contributes
`max(at, min(at + 500, until − 200))`, an open phase `at + 500`) — a candidate class the REV 3
table OMITTED even though REV 3's S3 already authored phases (no pin moved, so no defect
materialized, but the enumeration was incomplete). Enumerated now for S1/S2/S3: every phase
candidate sits below its state's governing candidate, so **no pin moves** — S1 22700, S2 20400,
S3 19500, S4 13000, exactly the cycle-2 report's A6 verification set. B1's changes also move no
pin: S3's widened ramp contributes 16000 + 900 = 16900 < 19500 (`:3145` vs `:3175`), and S2's
brake re-window keeps release_at_ms UNCHANGED at 18400 (the glide + slower τ change engage and
travel only, neither of which is the governing candidate).

Discrete-event note (scar `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows`):
S3's stop instant (≈6.8 s) is a CLOSED-FORM clamp (`:49941–49943`), not an integrator sign-flip —
exact, and nothing is pinned on it anyway. physics_author recomputes every window at the engine's 16 ms
grid. THE EYE must read DENSE frames across S2 11.4–18.6 s (the press + the slow decay), S3 9.0–16.2 s
(the still-platform slide) and 17.4–19.6 s (the restart), and S4 10.9–13.1 s (the flip) — scar
`teach_read_dense_ramp_frames_not_just_frozen`.

**Numeric ground truth (2-dp convention shared with the sibling; all hand-computed from the engine's own closed forms):**

| Quantity | Home (S1/S2/S4 entry) | S2 held | S3 stopped | S3 relaunched | S4 Run B |
|---|---|---|---|---|---|
| I (kg·m²) | 3.06 | 3.06 | 3.06 → 0.66 during the slide | 0.66 | 3.06 |
| ω (rad/s) | 1.50 | 0.50 | 0.00 | 1.50 | −1.50 |
| L (kg·m²/s) | 4.59 | 1.53 | 0.00 | 0.99 | −4.59 |

Checks: S2 decay 0.45 N·m × 6.8 s = 3.06 exactly (B1 — τ halved, braked window doubled, endpoints identical) → L 4.59 − 3.06 = 1.53; ω = 1.53/3.06 = 0.50 exactly
(no rounding collision — 1.53 = 4.59/3 exactly). S3 stop time 4.59/2.00 = 2.295 s from engage 4.5 s ⇒
still at ≈6.8 s; relaunch L = I(0.20)·1.50 = (0.50 + 2·2.0·0.04)·1.50 = 0.66·1.50 = 0.99 exactly; ω =
0.99/0.66 = 1.50 exact (chip tolerance 0.01 trivially met). **The one numeric coincidence, named
(A12):** during the S2 decay L sweeps 4.59 → 1.53 and passes EXACTLY 3.06 — the value on the
hold-glowed I readout — at t ≈ 15.0 s under the B1 re-window, inside THE EYE's dense window. Benign and unavoidable (I is
constant, L is continuous), it is named here AND in the handoff so the 0d reader does not file it as a
defect; physics_author constraint: no narration clause or glow may stage an L-vs-I comparison during
the S2 decay.

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots)

| Wrong belief | At | `misconception_watch` beat |
|---|---|---|
| **"Angular momentum is just spin speed with a fancier name — same spin rate, same L"** | **S3** | belief: the restarted platform spins at exactly the speed it started with, so L should read 4.59 again · visual_counter: the ω readout matches its "same speed: 1.50" chip while the L readout shows 0.99 **beside the "before: 4.59" baseline chip** (A2 — the contrast's two numbers share one frame), with the masses visibly sitting close to the axle · one_line_fix: L = Iω — the same ω carries less angular momentum when the mass sits near the axis |
| **"Momentum points the way things move — so L should point along the motion"** | **S4** | belief: L should aim where the masses are heading · visual_counter: each mass's heading changes every instant (the spin itself shows it, always on screen), while the L arrow stands fixed along the axle; flip the spin and the arrow flips along the SAME line · one_line_fix: no single motion direction fits a spinning body — L points along the axis, by the right-hand grip rule |

Named primitives for each wrong picture (scar `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive`),
all BUILT: S3 needs the ω chip AND the L baseline chip "before: 4.59" (`reference_marks` chips,
`:50164–50177`), the L readout (`:50147`), the sliding masses (`rbr_mass`, `:50356–50361`), the
restart badge (`:50457–50461`). S4 needs the L arrow with sign colour (`:50704–50718`), the grip hand
(`:50414–50433`), the always-on spinning apparatus.

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
(#4 — ω itself), `torque` (#5 — what kind of agent changes L: the S2/S3 brake IS an external torque
acting, even though every rendered string says only "a brake" and the τ glyph never appears because
the tau_brake slider row is never built), `moment_of_inertia` (#6 — I itself).

**Founder ruling, 2026-08-04 (Ruling 2 — supersedes REV 1's §8 reasoning and CLOSES the REV 1/REV 2
OPEN-FOUNDER-QUESTION):** `torque` and `moment_of_inertia` are NAMED even though both are registered
ids with NO concept JSON behind them yet. The dependency is real, and suppressing it would make the
prerequisite graph lie. REV 1 declined `torque` on the grounds that the concept never uses the word
in a rendered string — that test is now superseded: what the array records is whether the dependency
is TRUE, not whether the word is printed, and a student's full grasp of WHY the brake beats change L
is torque's material. Rule 23 makes prerequisites advisory and never gating, and the validator has
no referential check, so naming registered-but-unauthored ids is legal and correct — both precede
this concept in the approved teaching order and are registered in `VALID_CONCEPT_IDS`. json_author
must NOT silently drop the array or silently substitute ids.

Linear momentum p = mv is prior
knowledge from the momentum chapter — referenced in ONE S1 narration clause as an analogy, and NOT
named in the prerequisites array (no registered concept id exists for it; Ruling 2 covers
REGISTERED ids only — naming an unregistered id remains forbidden).

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
| Moment of inertia | `I` HUD row, `3.06 kg·m²` | S1 T2 — dual-label ONCE at first use: "moment of inertia (rotational inertia)" (A11), bare "moment of inertia" thereafter | S1 `readout_at_ms` 12000 (T2 ends 11.5 s) | ✓ |
| Angular speed | `ω` HUD row, `1.50 rad/s` | S1 T3 (one-clause restatement) | S1 15500 (T3 ends 15.0 s) | ✓ |
| Angular momentum | `L` HUD row, `4.59 kg·m²/s` | S1 T4 ("their product is the angular momentum L") | S1 21500 — after the sentence (T4 ends 21.2 s) | ✓ |
| L vector | axle arrow + `L` sprite (blue/amber by sign) | S1 T4's closing clause — the arrow named as the how-much indicator; DIRECTION deliberately un-narrated until S4 | **S1 t = 0** (static per-state overlay `:50607–50619`, untimeable — the t = 0 branch per Checkpoint A A5) | ✓ |
| The relation | `L = Iω` formula surface | S1 T4 states it in words; S2 USES it predictively | **S1 t = 0** (static surface `:50570–50574`). The print precedes its defining sentence — ACCEPTED deliberately (A5): the REV-1 S2-debut alternative broke the core_only cut, the apparatus contract's opening pose, and the registered scope line; the ledger discipline is enforced on the channel the engine can time (`readout_at_ms`) | ✓ |
| Prediction chip | "predicted L = 1.53" | S2 T2 (ends 10.0 s) | S2 `at_ms` 10500 — after the sentence | ✓ |
| Baseline chip (A2) | "before: 4.59" | S3 T1 cites 4.59 (ends 3.5 s) | S3 `at_ms` 7800 — after the stop, so the reveal-gated match predicate (`:50275`) can never latch on it (L = 0.00 from ≈6.8 s and is never 4.59 again in-state) | ✓ |
| Brake pad | pad mesh + "brake" label | S2 T1 announces it (ends 4.6); T3 narrates the press as the cause | S2 glide begins 4800 (B1: announced, then approaches — the ledger gates PRINTED values only; an object moves under 32a cause-before-effect, and here it is also named first). (S3: named in T2; pad visibility is per-state static `:50627–50631`, parked until its travel) | ✓ |
| Restart badge | "restarting" | self-defining literal word (Rule 41) | S3 17500 / S4 11000 / S5 on m/ω₀/direction events | ✓ |
| Same-speed chip | "same speed: 1.50" | S3 T4 before it (ends 16.9 s) | S3 `at_ms` 17000 | ✓ |
| Signed values | U+2212 minus on ω, L | S4 T3 ("spinning the other way") | S4 Run B (from 11.5 s) | ✓ |

NOT drawn anywhere: `r` line and label (`show_r_line` false — the r symbol is #6/#10 vocabulary; the
mass positions are directly visible), `R_drum` line (`show_drum_line` false — with zero radius
reference lines on screen there is nothing to conflate, and no narration cites any radius value),
pull arrows, KE/dL/dt/F rows, the τ glyph (no tau_brake row is ever built). json_author note (A3 —
the STRENGTHENED safeguard): a glow target must (1) name an element in `RBR_ELEMENT_TYPES`
(`:50586–50592`) or a HUD row id, AND (2) be REACHABLE by the consuming pass —
`applyRigidBodyRotationGlow` skips `rbr_root`/`rbr_spin` at `:50776` BEFORE its focal test while still
dimming every peer, so enum membership alone is the exact trap REV 1 fell into. Check the consumer
function's early-return list, never just the enum (scars `ecp_glow_targets_missing_primitives` + the
glow-container candidate row in `founder_proxy_A.md` §6).

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
- **(i-1) Preset-cut coherence, BOTH cuts walked (RE-RUN after A5):** *Hide advanced:* the advanced
  ring is EMPTY (blocked) — the cut is the identity today, coherent trivially; declared so the preset
  exists the day the L = r × p state lands. *Hide advanced+extended (drop S4):* S1–S3 + S5 —
  coherent: the axial L arrow now DEBUTS IN S1 (core) with T4's clause introducing it as the how-much
  indicator, so no surviving state shows an unexplained overlay (REV 1 failed exactly here — the
  arrow debuted in S2 with no introducing narration); direction is never narrated in S1–S3 (S1's
  clause is magnitude-only — the sibling's precedent); spin never goes negative in the surviving
  states, so the sign colours never engage; S5 keeps `m` and `ω₀` (core), and the spin-direction
  button is CUT with S4's ring (min_ring extended) ✓.
- **(i-2) Explore = core-ring content only:** S5's formula surface is `L = Iω`, stated AND shown
  by S1 (A5) and used predictively by S2 — core, surviving every preset ✓; S5's live controls are core except the ring-gated
  direction button ✓.
- **(i-3) `curriculum_tags` (claims, not facts — 38g; A10):** CBSE/NCERT: covered (L = Iω and the
  axial direction are NCERT Ch.7 content) — marked verified, the one authoring-time verification 38g
  permits. JEE Main: core+extended, **`needs_teacher_verification: true`** · JEE Advanced:
  core+extended, **`needs_teacher_verification: true`** · NEET: core+extended,
  **`needs_teacher_verification: true`** (ring claims derived from syllabus familiarity, confirmed by
  no real teacher) · IB DP / A-level / AP Physics C: **every cell `needs_teacher_verification:
  true`**. No preset goes teacher-visible until a real teacher of that curriculum confirms it.
- **(i-4) Presets (hide, never reorder — 38h/25d):** `full` = S1–S5 · `no_derivation` = identical to
  `full` today (empty advanced ring; will hide the L = r × p state when it lands) · `core_only` =
  hide S4 (controls auto-cut by min_ring).
- **(i-5) Graph axes:** no graph in any ring → N/A by design.
- **Dialect (38d):** "angular momentum", "angular speed" read identically across
  CBSE/JEE/NEET/IB/A-level/AP; **one dual-label at first use (A11): S1 T2 says "moment of inertia
  (rotational inertia)" once** — the AP/IB dialect bridged in four words — then bare "moment of
  inertia" everywhere; apparatus noun is "turntable" everywhere (the sibling's one-noun rule).
- **THE ADVANCED-RING SLOT, pinned for the retrofit:** the advanced ring is **L = r × p** — a particle
  moving on a straight line still has angular momentum about a point (survey advanced-ring sweep, row
  #9: "the same cross-product construction as #5"). It waits on **`cross_product_construction`**
  (declared-inert, `field_3d_renderer.ts:952–954`; built under 0c-3 per `rotmech_c_state.md`). When it
  lands: ONE new state inserts **between S4 and S5** (keeping the advanced ring contiguous immediately
  before explore, 38a), `entry_state_map` gains `derivation: <new state>`, the `no_derivation` preset
  hides it, and NOTHING else moves — S1–S4 reference no cross-product content and S5's controls and
  formula are core-ring, so the retrofit is a pure INSERTION, never a restructuring.

**Teacher-usability walk (scar `directive_no_gate_asks_whether_a_teacher_could_use_it`):**
(1) *Does anything state the relation and show it in the assessed representation?* Yes — S1 states L = Iω
in words with the formula surface on screen (A5); S2 USES it predictively (the live L lands on the pre-computed
chip — the exam's use of the formula, performed on screen); S3 uses it in the other factor. (2) *First
thing a teacher tries after the aha?* "Change the mass / the speed and watch L" — S5's m and ω₀, each
restart-badged so L visibly re-pins from the product. (3) *Definition precedes use?* Yes — ledger (b).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `moment_of_inertia` → breaks at **S1** (a student without it reads "I" as a
mystery number): patched by one non-condescending clause — "the spread of its mass about the axle is
its moment of inertia I" — co-located with the I readout building. `rotational_kinematics` → **S1**
(ω): one clause, "its spin rate is the angular speed ω", with the ω readout. `rigid_body_rotation` →
**S1** (the machine): the opening sentence names the turntable and its two masses turning together. `torque` (named per
Ruling 2, §8) → breaks NOWHERE in rendered content, by design: the brake beats (S2/S3) are narrated
causally as "a brake slows the spin" precisely so no torque vocabulary is needed — that phrasing IS
the patch, already in place; the dependency is conceptual (what kind of agent changes L), not a
vocabulary cliff, so no new clause is added.
No later state introduces prerequisite-dependent vocabulary.

**JEE-backwards trace.** *"A turntable with moment of inertia 3.06 kg·m² spins at 1.50 rad/s.
(i) Find its angular momentum. (ii) The masses are repositioned so I = 0.66 kg·m² and it spins at the
same 1.50 rad/s — find L now. (iii) State the direction of L."* (i) L = Iω = 4.59 kg·m²/s → S1–S2
(definition, units on the readout; the equation on screen from S1, USED predictively at S2). (ii) 0.99 kg·m²/s → S3 performs
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
  breaks it. Supporting: S1–S3 handle L as an unsigned magnitude — the axial arrow is on screen from S1 but
  narrated only as the how-much indicator, its direction never spoken — earning "it's just a
  number" before S4 flips the world.
- **Foundational coverage:** S3 ∈ `foundational` (S1→S3) ✓.

---

## ENGINE-REALITY WALK — every state × every consumed config field vs the frozen contract

Interface citations are `field_3d_renderer.ts` type-declaration lines (`:977–1058`); implementation
citations are the reader/consumer lines. **Every consumed field is IMPLEMENTED; no state consumes a
DECLARED-INERT field.** (Scar `archetype_live_tier_unverified_against_renderer` — every archetype's
motion is verified against renderer CODE below, not merely the renderer family.) **B3 addition:
the walk verifies in BOTH directions — an IMPLEMENTED claim cites its reader; an INERT claim
cites a grep proving zero reads outside the type-declaration block. A declaration comment is
documentation, not evidence (`theta0_rad` below is the scar that forced this).**

| Field (decl) | Reader (impl) | Status | Consumed by |
|---|---|---|---|
| `mode: 'fixed_axis'/'sandbox'` (`:980`) | `:50487`; sandbox ramp-guard `:50536` | IMPLEMENTED | S1–S4 fixed_axis, S5 sandbox |
| `apparatus.body_shape: 'turntable_rod'` (`:982`) | the only implemented shape (contract §1) | IMPLEMENTED (this member only) | all — authored explicitly |
| `apparatus.i_frame_kgm2 / rod_half_length_m / brake_drum_radius_m / rod_height_above_pad_m / r_min_m / r_max_m` (`:983–988`) | `:50488–50493` | IMPLEMENTED | all — pinned values authored explicitly (0.50 / 1.00 / 0.55 / 0.25 / 0.15 / 0.90) |
| `masses.count / mass_kg / r_m` (`:995`) | `:50494–50496` | IMPLEMENTED | all (2 / 2.0 / 0.80; S3 r_m 0.80 = ramp.from) |
| `omega0_rad_s` (`:996`) | `:50497` — **Math.abs applied**; sign rides `spin_sign` only | IMPLEMENTED | all (1.50) |
| `spin_sign` (`:997`) | `:50498` | IMPLEMENTED | all (+1) |
| `external_torque.source:'brake'`, `tau_brake_Nm`, `engage_at_ms`, `release_at_ms`, `pad_travel_ms` (`:999–1006`) | `:50518–50527`; pad pose `:50725–50744` — travel window = engage − travel_ms (`:50735–50736`), retract re-uses the same path (`:50737–50739`); pad visibility `:50626–50631` | IMPLEMENTED | S2 (0.45; 11600; 18400; 6800 — the B1 glide: pad approaches 4800–11600, mid-retract at state end), S3 (2.00; 4500; 7500; 600) — `release_at_ms` ALWAYS explicit (absent = never-releases, resolved by `typeof` at `:50523`) |
| `param_ramp {param:'r'}` (`:1010–1013`) | `rbrRAt` `:49851–49856`; seed `:50535–50539` | IMPLEMENTED **for `param:'r'` ONLY** — `omega0`/`m` ramps are silent no-ops (verified reality #3); none authored | S3 only (0.80 → 0.20, 9000–16000 — the B1 7 s slide) |
| `theta0_rad` (`:998`) | seed `:50499` (`theta0: rbrNum(rb.theta0_rad, 0)`) → `rbrThetaReset` `:50557`/`:49970` → `rbrThetaAt` `:49958`/`:49965` | **IMPLEMENTED — the `:953` "DECLARED, NOT IMPLEMENTED" comment is STALE; status verified against the READERS by grep this session (B3; REV 3 copied the comment and marked it DECLARED-INERT)** | S3 only (0.168 rad — the azimuth solve, §3 camera plan; default 0 elsewhere) |
| `reference_marks[]` chip form (`:1021–1030`) | build `:50164–50177`; reveal + MATCH LATCH `:50261–50279` | IMPLEMENTED (chip AND tick; only chip used) | S2 (L chip "predicted 1.53", at_ms 10500, tol 0.01) · S3 (L baseline chip "before: 4.59", at_ms 7800 — post-stop so it can never latch (A2) · ω chip 1.50, at_ms 17000) |
| `restart {at_ms, every_ms, flip_spin}` (`:1033`) | `:50544–50550`; anchor `:49915–49926`; **flip_spin defaults TRUE** (`:50548`) | IMPLEMENTED | S3 (at 17500, **flip_spin: false EXPLICIT**, no every_ms → single restart, `:49893`), S4 (at 11000, every 8000, flip_spin: true explicit) |
| `repin_cue.blank_ms` (`:1037`) | `:50505`; blanking `:49896–49903`; badge `:50283–50284` | IMPLEMENTED | S3, S4, S5 (500) |
| `show_l_arrow` (`:1039`) | `:50607–50619`; arrow pose/colour `:50704–50718` | IMPLEMENTED | **S1 (A5), S2, S4, S5 true; S3 false** (L = 0 stub — F-C2) |
| `show_grip_hand` (`:1042`) | `:50612`; curl loop `:50748–50764` | IMPLEMENTED | S4 only |
| `readouts` (`:1043`) | closed set `RBR_RO_META` `:50147–50154`; **unknown token silently skipped** `:50162–50163` | IMPLEMENTED — only `I/omega/L` authored, all in the set | all states |
| `readout_at_ms` (`:1047`) | `:50234–50241` | IMPLEMENTED | S1 (staged builds) |
| `hold_glow` (`:1048`) | `:50245–50248` | IMPLEMENTED | S2 (['I']) |
| `formula` (`:1050`) | `:50570–50574` — static per state, Cambria Math | IMPLEMENTED | S1/S2/S3/S5 "L = Iω" (S1 per A5); S4 none |
| `controls_visible` (`:1051`) | rows union `:50015–50025`; per-state toggle `:50128–50142` | IMPLEMENTED — closed set r/m/omega0/tau_brake/spin_dir | S4 ['spin_dir'], S5 ['m','omega0','spin_dir'] |
| `slider_controls[token]` range overrides (`:2181`) | `rbrSc` `:50005–50014` — per-token min/max/step/default/label merged over `RBR_SLIDER_SPEC` (verified this session) | IMPLEMENTED | S5's A4-ii band mitigation: m {0.5–3.0, def 2.0}, omega0 {1.0–2.0, def 1.5} |
| `glow_focal` (`:1053`) + `phases[]` (`:1055`) | `:50507`, `:50647–50657`; phase instants are pin candidates, `deriveStateMeta.ts:3198–3208` | IMPLEMENTED | S1/S2/S3 author `phases[]` per the B2 focal plan (boundaries at sentence ends); S4 static `rbr_l_arrow`, deliberate; one focal per instant |
| `visible_elements` (`:1054`) | exact-token matcher `:50593–50622`; overlays default OFF | IMPLEMENTED | not needed (show_* flags suffice); apparatus always-on `:50585` |

**Deliberately NOT consumed (and why):** `trusted_drag_seizes` (`:1052`) — **DECLARED but has NO rbr
reader** (grep this session: readers exist only for kinematics_1d_track/nlb, e.g. `:25047`; rbr
seizure is unconditional on any trusted input, `:50106`, `:50121`) — authoring it would be a silent
no-op, so it is omitted. `idle_auto_sweep` — r-only reader (`:49857`), r excluded (§3). `ke_bar` and
the `reference_marks` tick form — no KE content. `applied_torque_Nm` — implemented (`:50528–50533`)
but unconsumed (#7's row). `particles[]`, `parts[]`, `axis_select`, `axis_pair`,
`cross_product_construction`, `body_shape` variants, `external_torque.source 'torsion_spring' |
'applied_force_at_point'` — DECLARED-INERT (`:950–956`, contract §1), consumed by NOTHING here ✓. (**`theta0_rad` LEFT this list at REV 4** — B3: it is IMPLEMENTED,
the `:953` comment is stale, and S3 now consumes it for the azimuth solve; see its walk row.)
**Camera: no field exists** — the rbr config surface (`:978–1060`)
carries NO camera member at all and `applyRigidBodyRotationState` (`:50480`) never touches the
camera (F-C4, P1, PASS 4 — founder-ruled engine gap, filed by the dispatching session); this
concept's pose intent is authored in the §3 camera plan and becomes consumable config the day the
surface lands.

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

**Re-ruled pointer (requested by the cycle-2 reviewer for the Checkpoint C diff — the rows
carrying a `re-ruled` marker, so C never scans 157 rows):** **#2** (A4-ii) · **#13** (F-C4) ·
**#19** (F-C5, this revision) · **#25** (A2) · **#62** (Ruling 1/F-C4) · **#75** (instants
updated, this revision) · **#120** (B1, this revision) · **#129** (A5) · **#139** (A5) · **#141**
(A8). Every other row carries its REV 1 disposition unchanged.

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
2. `architect_authors_a_force_triangle_whose_ratio_exceeds_the_renderer_arrow_maps_dynamic_range` — **re-ruled (A4-ii)**: no force arrows authored; REV 1 checked the L-arrow against the GUIDED band only — REV 2 extends the check to the sandbox corners and narrows S5's `slider_controls` ranges (m 0.5–3.0, ω₀ 1.0–2.0) so every reachable |L| ∈ [1.14, 8.68] stays inside the map's faithful [1.10, 9.00] (`:49796–49797`); S3's arrow hidden (F-C2).
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
13. `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` — sat, and carried forward through F-C4 (Ruling 1): the build-time pose was solved by sweeping radius + elevation TOGETHER (`:50469–50477`); the §3 camera plan pins that solved pose as this concept's authored camera and forbids any one-axis re-solve when the F-C4 surface lands.
14. `caption_clipped_by_adjacent_stat_box` — sat: captions are ≤5-word cues; fixed zones per `:50441–50467`; EYE re-checks.
15. `capture_frozen_frame_ignores_its_own_poll_result_and_photographs_off_pin` — EYE: harness-side; binds 0d verification.
16. `chemistry_concept_id_collides_with_rostered_physics_id` — sat: verified no collision (`ls` of both concept dirs this session).
17. `close_camera_framed_extent_is_authored_as_the_run_length_and_omits_the_body_radius` — N/A: no close-camera state authored.
18. `closed_enum_cannot_name_a_substance_the_design_teaches` — sat: every consumed token is in the frozen implemented enums; nothing this design teaches needs a missing member (KE/dLdt deliberately unused, not missing-for-teaching).
19. `concept_ships_zero_narration_glow_bindings` — **re-ruled (F-C5, cycle 2)**: per-sentence `glow` is INERT on rbr (no `glowTargets` fallback — `:50772` vs force_rig `:49002`; filed by the cycle-2 reviewer as F-C5, Desk E ride-along), so REV 3's "physics_author must bind per-sentence glow" was an instruction to author silent no-ops. The narration→canvas emphasis binding is carried by `phases[]`, whose instants derive from the §3 sentence ends — narration-synced by construction; physics_author moves phase boundaries with the REAL sentence ends and authors NO sentence-level `glow` until F-C5 lands.
20. `concept_taught_its_own_quantity_without_the_canonical_picture` — BINDS: canonical picture = the L vector on the axis (S1/S2/S4/S5 — A5) + L = Iω used predictively on screen (S2 chip).
21. `contact_detected_slow_window_arms_one_frame_late_and_buries_the_body_at_full_dt` — N/A (nlb, FIXED).
22. `contrast_ghost_coresident_with_the_real_set_fuses_both` — N/A: no ghost bodies.
23. `cyclotron_timers_sliders_fullscreen_button_corner_collision` — sat: rbr HUD at top:52px (`:50443`), sliders bottom-right (`:50465`).
24. `deferred_enum_members_must_be_declared_not_merely_unimplemented` — sat: the frozen contract ships the split (`:944–956`); this skeleton consumes implemented members only.
25. `derivation_principle_applied_to_one_beat_but_not_its_sibling` — **re-ruled (A2)**: REV 1's disposition ("the chip discipline is applied to BOTH quantitative beats") was self-defeating — inside S3 it chipped the CONSTANT and left the changing quantity to memory. REV 2 chips the variable too: S2 chips predicted L; S3 chips BOTH ω ("same speed: 1.50") and L's baseline ("before: 4.59").
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
36. `explore_state_formula_surface_asserts_a_relation_no_state_derives` — sat: S5's `L = Iω` is stated AND shown by S1 (A5) and used by S2 — both survive every preset.
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
62. `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` — **re-ruled (Ruling 1 / F-C4)**: the camera IS non-authorable in rbr (hardcoded `:50476`; F-C4 filed P1, PASS 4) and this concept's framing correctness DEPENDS on that hardcoded pose — REV 2's "no per-state camera needed" asserted the gap away. The §3 camera plan authors the pose explicitly, tags every [POSE-OBLIQUE] beat, and records the inherit-with-risk fallback. NOT blocked: the needed pose is the existing default.
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
75. `hysteretic_state_cannot_be_latched_under_a_time_pin` — sat: all physics closed-form; the chip MATCH latch (`eng.matched`) is the one hysteresis and both pins land after their match instants (S2 pin 20.4 s > match 18.4 s; S3 pin 19.5 s > ω-chip match 18.0 s — **instants updated to the B1 clock at REV 4; REV 3 carried REV 1-vintage numbers here**), so the frozen frames are correct; rewind caveat noted at #119.
76. `lesson_never_states_the_principle_it_is_named_after` — sat: S1 states L = Iω in words with the surface on screen (A5); S2 uses it predictively.
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
120. `rule31_motion_floor_satisfied_by_a_late_label_reveal_over_a_frozen_canvas` — **re-ruled (B1)**: REV 3's disposition ("S3's still phase is bracketed by motion and is itself the point of a moving beat") was FALSE on its own clock — the authored windows held a fully static canvas 11.0–17.0 s in the primary-aha state. REV 4 re-spreads the movers (S3 ramp 9000–16000; S2 glide 4800–11600 + the 6.8 s decay) and §3 now carries the BINDING no-static-hole rule (~2 s max fully static; movers span the narration; re-spread on every clock re-derivation).
121. `scar_audit_claims_a_coverage_boundary_it_did_not_enumerate` — BINDS: this audit enumerates the union verbatim, both directions.
122. `seam_r_ink_lift_reveals_sub_surface_force_arrows_fleet_wide_and_no_gate_reads_it_as_a_change` — N/A (nlb seam).
123. `shared_bar_scale_cross_state_guarantee_is_void_when_the_panel_reflow_ladder_drops_a_step` — N/A: no bar scales.
124. `signed_engine_union_drops_items_its_own_state_table_still_consumes` — sat: no union rewrite here; the reverse walk maps every state-named primitive to a built row.
125. `skeleton_anchor_specified_in_section_9_reaches_no_narration_line` — BINDS: both anchors have reserved words inside their states' budgets.
126. `skeleton_asserts_a_held_comparison_value_at_an_instant_the_faster_body_has_already_passed` — N/A: single body.
127. `skeleton_authors_a_multi_phase_state_on_an_engine_with_no_per_body_activation_time` — sat: every timed beat rides an implemented timed field (engage/release/ramp/restart/at_ms/readout_at_ms), each cited.
128. `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant` — sat: no timed class beyond the implemented surface is authored.
129. `skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static` — BINDS: NO timed overlay reveal is authored anywhere — the only timed surfaces are `readout_at_ms` and `reference_marks[].at_ms`, both implemented; REV 2's t = 0 branch (A5) puts the static formula + arrow ON from S1 entry rather than pretending they can be timed.
130. `skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal_inside_it` — BINDS: margins measured from the LAST asserted event, per state.
131. `solenoid_focal_primitive_on_title_not_physics` — N/A (solenoid); focals here are physics elements.
132. `solenoid_state3_annotation_orphaned_from_referent` — N/A (solenoid).
133. `solenoid_state4_outside_fade_narrated_not_shown` — N/A (solenoid).
134. `solenoid_state5_gesture_sequencing_absent` — N/A (solenoid).
135. `solenoid_state7_hand_flip_unimplemented` — N/A (solenoid); the rbr hand flip IS implemented (`:50746–50750`) and verified.
136. `spec_semi_implicit_euler_position_not_step_count_invariant` — sat: rbr θ is a fixed-grid sum (`:49952–49966`), step-count invariant by construction.
137. `state_added_at_review_outruns_the_config_contract_shape` — noted: any review-added state must be expressible in the frozen shape; the one anticipated addition (advanced ring) is pre-slotted in §10(i).
138. `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` — sat: the relation's halves live on the HUD instrument channel (hold_glow, `:50206–50218`), which the scene focal never dims.
139. `symbol_printed_on_canvas_before_the_lesson_defines_it` — **re-ruled (A5)**: REV 1 served this scar by stripping S1's formula + arrow; Checkpoint A ruled the scar already discharged by the readout staging (the only channel the engine can time) and showed the strip broke the core_only cut, the apparatus contract's opening pose, and the registered scope line. REV 2 authors both at t = 0 with T4's introducing clause; the ledger records the accepted precede explicitly.
140. `taught_delta_smaller_than_the_instruments_own_live_noise` — sat: deltas are 3.0× (S2) and 4.6× (S3); readouts are closed-form, noise-free.
141. `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` — BINDS-with-mitigation, **extended to S5 (A8)**: L's correlates are the arrow (S1/S2/S4/S5) and the spin + mass placement themselves; in S3 the arrow must hide (F-C2), so that beat leans on the readout + both chips against the S1/S2-established arrow memory. In S5, `m` has no drawn-geometry correlate (`RBR_MASS_R` constant, `:49798` — Rule 29 by design): its rendered correlates are the L arrow (live during the drag, faithful across the narrowed band) + the re-pinned readouts 0.5 s after release; the caption/narration plan points at them.
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

*Handoff: REV 4 supersedes REV 3 as the working skeleton — the fix-cycle-2 resubmission (the LAST
fix cycle; the next Checkpoint A verdict is `DESIGN_OK` or `ESCALATE`). On `DESIGN_OK`:
physics_author (narration + per-state variable overrides + `phases[]` bindings, against this
skeleton — with every at_ms recomputed from the REAL sentence word counts per the §3 conversion
rule, each sentence written AT OR UNDER its plan words, the MOVERS re-spread over the new clock in
the same pass per the §3 no-static-hole rule, phase boundaries moved to the real sentence ends,
and `theta0_rad` RE-SOLVED with the brake window per the §3 azimuth solve), then json_author (pure
JSON — the scenario is built and merged; no engine dispatch).*

**0d reader notes:**
1. **(A12)** During the S2 decay, L passes EXACTLY 3.06 — the value on the hold-glowed I readout — at
   t ≈ 15.0 s (the B1 re-window moved the crossing), inside THE EYE's dense window. Benign numeric coincidence (I constant, L continuous):
   do NOT file it as a defect; narration/glow never stage an L-vs-I comparison there (physics_author
   constraint, §3).
2. Engine findings F-C1 / F-C2(ext) / F-C3 / **F-C4 (P1, per-state camera — PASS 4,
   founder-ruled)** live in `docs/loop_runs/rotmech/_engine/findings_c.md` (written by the
   dispatching sessions, per the desk contract). None blocks this concept as designed: S5 is
   authored honest WITHOUT F-C1–C3 (blank-during-drag stated, arrow band narrowed, `tau_brake` and
   `r` excluded), and F-C4's needed pose is the EXISTING default — see the §3 camera plan (author
   the pose when the surface lands; inherit it with the recorded risk if it does not).

---

## FIX-CYCLE-1 RESPONSE (A-1 … A-13 + the structural question × what changed × where)

| Finding | What changed | Where |
|---|---|---|
| **A1 (P1)** | Every timed value re-derived from the word budget at 2.6 words/s: explicit sentence plan (max words · cumulative ends) per state; every `readout_at_ms` / chip `at_ms` / `engage/release_at_ms` / `param_ramp` window / `restart.at_ms` / R recomputed to sit AFTER its defining sentence (S1 readouts 12000/15500/21500 in R = 24 s vs REV 1's 2000/2800/3600 in 8 s; S2 chip 10500, brake 15000–18400, R = 22 s; S3 fully re-spread, R = 23 s; S4 cut 11000/every 8000, R = 22 s); the conversion is stated as the binding rule and physics_author recomputes from real counts | §3 conversion block + sentence plan + control table |
| **A2 (P1)** | Second `reference_marks` chip authored in S3: surface L, "before: 4.59", at_ms 7800 — revealed post-stop so the reveal-gated predicate can never latch; the frozen frame carries 0.99 BESIDE 4.59; §4's visual_counter updated; SCAR #25 re-ruled (REV 1 chipped the constant only) | §3 S3 + pin table; §4; §10(b); SCAR #25 |
| **A3 (P1)** | `rbr_spin` focal REMOVED everywhere: S1 → `rbr_drum_marker`, S3 relaunch phase → `rbr_drum_marker`; every focal token re-checked against `applyRigidBodyRotationGlow`'s early-return list (`:50776`); the safeguard STRENGTHENED from enum-membership to reachable-by-the-consuming-function | §3 focal plan + glow-reachability rule; §10(b) json_author note |
| **A4 (P1)** | S5 claim REWRITTEN honestly: readouts blank "—" for the whole drag and re-pin 0.5 s after release (F-C3); the live channel is the L arrow (not blank-gated); `slider_controls` overrides authored — m 0.5–3.0, ω₀ 1.0–2.0 ⇒ reachable \|L\| [1.14, 8.68] ⊂ faithful [1.10, 9.00]; reader `rbrSc` verified `:50005–50014`; new ENGINE-REALITY WALK row added | §3 S5 + slider-range derivation; ENGINE-REALITY WALK (+1 row); SCAR #2 |
| **A5 (P1)** | The t = 0 branch taken: S1 authors `formula: "L = Iω"` + `show_l_arrow: true`; T4's clause introduces the arrow as the how-much indicator (direction un-narrated until S4); the ledger records the accepted precede; the 38a core_only cut RE-WALKED and now coherent; SCAR #139 re-ruled | §2 table; §3 S1; §10(b) ledger; §10(i-1); SCAR #129/#139 |
| **A6 (P2)** | Pin table recomputed from the renderer's real derivation — `clampReveal(max(candidates))` with every candidate component cited (`deriveStateMeta.ts:3134–3210`, `:3423–3425`, `:3445`); duration-independent; the `0.60R` formula deleted. Done FIRST, so A1's re-timing was derived against the real pins | §3 frozen-pin table |
| **A7 (P2)** | Four RENDERED differentiators vs #10's approved brake beat named in the S2 row (prediction chip · `hold_glow: ['I']` vs the drawn R_drum line · endpoint numbers · framing); the τ-value non-difference stated honestly | §3 S2 row |
| **A8 (P2)** | S5's `m`-correlate stated honestly (`RBR_MASS_R` constant, Rule 29): correlates = the now-faithful L arrow + post-release readouts; physics_author caption instruction added; SCAR #141 extended to S5 | §3 S5-correlate block; SCAR #141 |
| **A9 (P2)** | One-beat ruling written: the S3a/S3b split CHECKED against the 5-state budget and rejected (S3a fails the distinct-IDEA test; per-state chips would strand the A2 baseline across the boundary; movers strictly sequential under the re-timed envelope); the reviewer's narration-does-structural-work caveat carried to physics_author | §3 S3 one-beat ruling |
| **A10 (P3)** | JEE Main / JEE Advanced / NEET cells now ship `needs_teacher_verification: true`; CBSE/NCERT keeps the one authoring-time verification 38g permits | §10(i-3) |
| **A11 (P3)** | Dual-label once at first use: S1 T2 "moment of inertia (rotational inertia)", bare thereafter | §3 sentence plan; §10(b) ledger; §10 dialect |
| **A12 (P3)** | The L-passes-3.06 crossing (t ≈ 16.7 s, mid-S2-decay) named in the numeric block AND in a dedicated 0d reader note so it is never filed as a defect | §3 checks; 0d reader notes |
| **A13 (P3)** | S3 title → "Mass position changes L"; rail check added — all five title first-words pairwise distinct | §2 table + rail check |
| **Structural Q** | S4/#10-S6 ownership CLAIMED in writing: #9 owns the grip-rule beat per its registered scope line; the duplicate is a Checkpoint-C founder item; #10's in-scope alternative (direction conservation) named | §1 ownership block |

**Net changes vs REV 1:** everything founder-proxy verified is preserved structurally — the 20-row
ENGINE-REALITY WALK (three rows updated for values, ONE row added for `slider_controls`), the
closed-form numeric ground truth (values unchanged; only the clock they sit on moved), the S3
stop-slide-restart device, the S5 `r`/`tau_brake` exclusions, `flip_spin: false`, both anchors, the
misconception plan, the entry map, the prerequisites block (whose OPEN founder question is since RESOLVED by the
2026-08-04 Ruling 2 — see RULING-DELTA D8), and the aha designation. The deltas are exactly the A1–A13 responses
above. **State count UNCHANGED at 5** — A9's split was checked in writing and rejected, not silently
declined. Bug-queue counts re-run this session and identical to REV 1 (63/83/85/0/1) — no new rows to
disposition; five REV-1 dispositions re-ruled in place (#2, #25, #129, #139, #141).

---

## RULING-DELTA (REV 2 → REV 3, 2026-08-04 — two founder rulings; nothing from A1–A13 reopened)

| # | Ruling | Edit | Where | Why |
|---|---|---|---|---|
| D1 | R1 (camera / F-C4) | New **Camera plan** block: pose `{radius 9.6, theta π/4, phi 1.16}` authored explicitly, ONE pose for all five states | §3 | An omitted field silently inherits an engine default; a future change to the hardcoded `:50476` would silently move this concept's framing — the apparatus contract's author-even-when-the-default-matches discipline, applied to the camera |
| D2 | R1 | **[POSE-OBLIQUE]** tags on S1 (arrow from t = 0), S2 (proportional shrink), S4 (flip + grip hand), S5 (arrow = the only live drag channel); S3 and the drum-marker legibility CHECKED and NOT tagged, reasoning recorded (they constrain the pose from the opposite, side-on direction — a tolerance, not a dependence) | §3 control table + camera plan | The ruling asks that the blast radius be visible at a glance |
| D3 | R1 | S4 row's "no per-state camera field exists in the frozen contract, none consumed" parenthetical replaced with the camera-plan reference + tag | §3 S4 row | The old wording read as "camera is a non-issue"; Ruling 1 says it is a filed P1 gap this concept depends on |
| D4 | R1 | Dependency direction stated plainly: authorable TODAY, NOT blocked by F-C4; author-the-pose-if-the-surface-lands / inherit-with-recorded-risk-if-not; the #3 asymmetry (NOT authorable as designed without the row) written down | §3 camera plan | Makes the F-C4 row's priority legible to Desk E; records that this concept's correctness no longer rests on an unauthored accident |
| D5 | R1 | Scar dispositions #13 (carried forward through F-C4; one-axis re-solve forbidden) and #62 (re-ruled: REV 2's "no per-state camera needed" asserted the gap away) updated to cite F-C4 | SCAR AUDIT | Forced consistency: two dispositions contradicted the filed ruling |
| D6 | R1 | "Deliberately NOT consumed" walk gains the camera line (no field exists in `:978–1060`; pose intent pre-authored, consumable the day the F-C4 surface lands) | ENGINE-REALITY WALK | The walk must account for the ONE surface the design depends on but cannot yet consume |
| D7 | R1 | 0d reader note 2 extended to F-C4 | 0d reader notes | Handoff completeness |
| D8 | R2 (prerequisites) | §8 rewritten: `torque` (#5) and `moment_of_inertia` (#6) NAMED; the OPEN-FOUNDER-QUESTION blockquote DELETED (answered); ruling + date + reasoning recorded in §8's own words ("the dependency is real, and suppressing it would make the graph lie" — supersedes REV 1's word-appears-in-a-rendered-string test); json_author no-silent-drop instruction kept; the p = mv exclusion kept and sharpened (Ruling 2 covers registered ids only); the stale net-changes footnote referencing the OPEN question updated | §8 + net-changes paragraph | Founder ruling 2026-08-04 |
| D9 | R2 | Block 1 gains the `torque` cliff entry: breaks NOWHERE in rendered content by design — the "a brake slows the spin" phrasing IS the patch, already in place | Block 1 prerequisite cliffs | Forced consistency: every §8 prerequisite carries a Pass-1 cliff entry (architect spec) |
| D10 | — | Header/status/revision-history re-framed as the REV 3 ruling-delta; bug-queue consultation RE-RUN (63/83/85/0/0 — #33's concept tag dropped at the live table, disposition retained as history; Supabase 522 flakiness noted, all counts from verified runs); handoff line updated (inherits REV 2's Checkpoint A position, no re-review) | header · bug-queue block · handoff | Audit trail; spec-mandated pre-artifact consultation |

**NOT changed — checked edit-by-edit:** state count (5) · every timing, pin, and closed-form number ·
the control table's physics and archetypes · §4 misconceptions · §5/§6/§7 · §9 anchors · §10 DoD
content · Blocks 1–2 (except D9's added cliff row) · the ENGINE-REALITY WALK rows (except D6's
appended camera line) · the SCAR AUDIT dispositions (except D5) · the FIX-CYCLE-1 RESPONSE record
(preserved verbatim as history). No REV 2 discharge is weakened by any ruling edit; in particular D3
alters only the framing-provenance sentence of the S4 row, never its choreography, and D8 does not
touch the S2/S3 narration plan (the brake stays "a brake" in every rendered string — Ruling 2 changes
the prerequisite GRAPH, not the vocabulary discipline).

---

## FIX-CYCLE-2 RESPONSE (B1–B5 + the reviewer's two notes × what changed × where)

| Finding | What changed | Where |
|---|---|---|
| **B1 (P1)** | The choreography RE-SPREAD over the re-timed clock, words unchanged: S3's `param_ramp` widened 9000–11000 → **9000–16000** (the reviewer's worked example — a 7 s slide spanning T3–T4; physics identical, L = 0 rest-clamped so ω = L/I = 0 for every I(t); the 6.0 s frozen window is GONE, largest static gap now 1.0 s). S2's brake re-windowed: pad GLIDES in from 4800 (`pad_travel_ms` 6800 — travel = engage − travel_ms, `:50735–50736`, so the long approach is engine-native), τ 0.90 → **0.45** over engage 11600 → **release 18400 UNCHANGED** (ΔL = 0.45 × 6.8 = 3.06 exactly, same endpoints 1.53/0.50 — the decay now spans the second HALF of the state instead of its last 15%, and it is slower and more readable). Pins UNMOVED: S2 20400, S3 19500 (ramp end + 900 = 16900 < 19500, `:3145` vs `:3175`). The root-cause rule written into §3 as BINDING: the ledger gates PRINTED symbols/values only; objects follow 32a cause-before-effect; no fully static canvas > ~2 s; movers span the narration; re-spread on every clock re-derivation. The trim branch ADDRESSED and declined with a three-part argument (§3 word-band position block); its plan-binds clause adopted | §3 conversion block + word-band block + S2/S3 rows + pin table + walk rows |
| **B2 (P2)** | `phases[]` authored in S1 (base marker → `rbr_mass` 6300 → marker 11700 → **`rbr_l_arrow` 15200, the sentence that introduces it**) and S2 (base pad through announce/glide/press → **`rbr_l_arrow` 12600** through the decay + chip match); S3's phases given explicit windows; S4's static focal kept deliberately (the arrow IS the subject — cycle-2 report §2). Designed on `phases[]` as the ONLY emphasis channel (F-C5 — reviewer-filed, NOT re-filed); phase instants included as pin candidates (`:3198–3208`) — no pin moves. The dim consequence stated plainly in the focal plan (`rbr_l_arrow` absent from the solid carve-out `:50782–50788` → a non-focal arrow renders at 0.40) | §3 focal plan + S1/S2/S3 rows + pin table |
| **B3 (P2)** | The walk row corrected against the READERS (`:50499` → `:50557`/`:49970` → `:49958`/`:49965`): `theta0_rad` is IMPLEMENTED, the `:953` comment is STALE — moved out of the DECLARED-INERT list into its own walk row, consumed by S3. S3's slide tagged **[POSE-OBLIQUE]**; azimuth solve authored: **`theta0_rad` = 0.168** puts the rod ACROSS the view at the stop (α = 90°, vs REV 3's α ≈ 80° by luck), with the RE-SOLVE formula bound to every brake-window/τ/ω₀/I₀ change. The both-directions verification rule adopted into the walk preamble (grep the symbol, never copy its declaration label) | §3 camera plan (S3 bullet + azimuth solve) + S3 row + ENGINE-REALITY WALK (new row, preamble, NOT-consumed list) |
| **B4 (P3)** | The sentence plan declared the BINDING narration envelope (plan-binds rule, §3 conversion block); every Words cell reads "band · plan N binds" (S2: plan 48 binds — a compliant physics_author can no longer write 55 words against R = 22 and break the ≥1.5 s held-tail rule) | §3 conversion block + control-table Words column |
| **B5 (P3)** | The A9 ruling re-stated on reason (1) alone — the distinct-IDEA test, sufficient by itself; reasons (2) and (3) WITHDRAWN explicitly with why each fails (a split's S3b could author its own per-state baseline chip, which also could never spuriously latch; the envelope claim was contradicted by B1's hole) — so the Checkpoint C diff records a defence that holds | §3 one-beat ruling |
| **Note — scar pointer** | Re-ruled pointer added at the top of the SCAR AUDIT: #2, #13, #19 (new), #25, #62, #75 (updated), #120 (new), #129, #139, #141 | SCAR AUDIT header |
| **Note — marker geometry** | The camera plan's second constraint restated from the marker's ACTUAL geometry — a radial `BoxGeometry` bar (`:50322–50326`) needing a legible SWEEP, not circularity; the tolerance-not-dependence conclusion unchanged | §3 camera plan pose bullet + not-tagged bullet |
| **Also fixed (self-caught this cycle)** | (1) The REV 3 pin table OMITTED the `phases[]` candidate class (`deriveStateMeta.ts:3198–3208`) even though REV 3's S3 authored phases — no pin moved, so no defect materialized, but the enumeration was incomplete; enumerated now with a note. (2) Scar #75's disposition carried REV 1-vintage match/pin instants through two re-timings — updated to the B1 clock. (3) Scar #120 re-ruled: REV 3's own disposition asserted S3's still phase was "bracketed by motion" over what was in fact a 6.0 s hole. (4) S3's REV 3 prose said "pad travels from 3.4 s" against its own authored numbers (engage 4500 − travel 600 = 3900) — now stated as 3900–4500 | pin table note + SCAR #75/#120 + S3 row |

**NOT changed at REV 4 — checked edit-by-edit:** state count (5) · every closed-form VALUE (I/ω/L
tables, slider bands, arrow map) · every pin (22700/20400/19500/13000) · S1/S4 narration timings
and S4's entire choreography · the archetypes and their audit · §4 misconceptions · §5/§6/§7 · §8
prerequisites (Ruling 2) · §9 anchors · §10 DoD content except the brake-pad ledger row · Blocks
1–2 · the camera pose itself (`{radius 9.6, theta π/4, phi 1.16}`, all five states) · every scar
disposition except #19/#75/#120 and the pointer · the RULING-DELTA and FIX-CYCLE-1 tables
(history, verbatim). A1–A13 and both founder rulings: none reopened.
