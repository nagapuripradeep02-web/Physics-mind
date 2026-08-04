> # ⚠ INCOMPLETE AND INTERNALLY INCONSISTENT — DO NOT READ AS REV 2, DO NOT FEED TO ANY AGENT OR TO DESK E
>
> **What this is:** the fix-cycle-1 rewrite of `tau_eq_i_alpha`, abandoned part-written on
> 2026-08-04 when the `alex:architect` dispatch died on an account-level API error
> ("organization has disabled Claude subscription access for Claude Code"). Not a work failure —
> an auth failure, mid-patch (the agent was rewriting its fourth patch).
>
> **Why it is worse than merely truncated:** the header says REV 2 and a FIX-CYCLE-1 RESPONSE
> table is present, but the closing handoff is still REV 1's text (it routes to a Checkpoint A
> that has already happened). Some patches applied, others did not.
>
> **The specific danger:** gate finding **P1-4 is NOT fixed here.** S6 still teaches that an
> opposing torque never reverses a spin — which is true of *friction*, not of an opposing torque.
> The word "frictional" appears nowhere in this file. Anyone reading it as a finished REV 2 would
> take a physics error as reviewed and approved.
>
> **What IS good in it:** the FIX-CYCLE-1 RESPONSE table and the adoption of the desk's shared
> contract item 2 (the single motor drive wheel replacing the floating tangential arrow).
>
> **The live document is `skeleton.md`, restored to REV 1** (gated `DESIGN_FIX`, see
> `founder_proxy_A.md`, which names the S6 error as P1-4). Re-run fix cycle 1 from REV 1 once API
> access is restored; this file is reference material for that re-run, not its input.

# Skeleton — `tau_eq_i_alpha` (rotmech · Class 11 Ch.7 · Phase-0b, Desk D) — REV 2

> **Status:** Phase-0b design pass (desk `feat/rotmech-d`, wave-1 docs-only). This skeleton + its
> physics block are half of build **0c-3**'s authoritative scope (rotmech_d_state.md §next-3). The
> `rigid_body_rotation` (rbr) scenario EXISTS and is frozen at 0c-1 (`field_3d_renderer.ts:939–1059`,
> impl `:49737–50700+`), so — unlike the CoAM 0b exemplar — this skeleton claims `[LIVE]` tiers and
> cites file:line for every one (scar `archetype_live_tier_unverified_against_renderer`); everything
> else is `[NEEDS-0c-3]` with the exact gap named.
> **The headline correction (scar `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set`):**
> the 0c-1 contract comment claims `applied_torque_Nm` is IMPLEMENTED as "#7's α = τ/I with no extra
> code path" (`:947–949`). That claim is TRUE ONLY FOR AN OPPOSING TORQUE. The single integrator
> `rbrLAt` (`:49933–49943`) is decay-only — `mag = |L0| − τ·engaged_seconds`, clamped at 0 — and BOTH
> sources (`brake` and `applied_torque`, resolved `:50518–50533`, both via `Math.abs` into the same
> `eng.tau`) can only ever REDUCE |L|. **A constant applied torque cannot spin the body up, and a body
> starting from rest (L₀ = 0) never moves at all.** The desk state file frames this desk's block as
> "α has nowhere to print" — that is the SMALLER half. The missing α/τ readout rows are a display gap
> (D3); the decay-only integrator is a **physics gap** (D1) that makes six of this concept's eight
> states unbuildable. The display half is stated at D3; the physics half's DIAGNOSIS is folded into
> `_engine/findings_d.md` §1 — since fix cycle 1 the CANONICAL semantics site for the signed
> torque (P1-3) — which D1 consumes by reference; this skeleton remains the authoritative
> statement of what this CONCEPT needs.
> **Bug-queue consultation (2026-08-04, LIVE table via Bash):** see SCAR AUDIT §Queries — universe
> 157 unique rows (63 / 83 / 85 across the three list queries), superset-diffed mechanically, every
> row dispositioned verbatim below. `tau_eq_i_alpha` itself: 0 rows (not yet authored — expected).
> `rigid_body_rotation`: 1 row (dispositioned).
> **DC Pandey check:** chapter table of contents only (rotational dynamics is Ch.7 scope). No
> teaching method, example problem, or figure imported. NCERT chapter index confirms τ = Iα is core
> syllabus in Systems of Particles & Rotational Motion.
> **Namespace check:** no `src/data/concepts/tau_eq_i_alpha.json` and no chemistry collision — the id
> exists only in the `4b289d4` pre-registration (shared registration files, READ-ONLY on this desk).
> **NO CONCEPT JSON IS AUTHORED FROM THIS SKELETON until the 0c-3 engine PR merges** (desk guardrail;
> the silent-skip failure mode in `rbrRebuildReadout` `:50162–50163` is exactly why).
> **Revision history:** REV 1 preserved at `skeleton_rev1.md`. Checkpoint-A report:
> `founder_proxy_A.md` (cycle 1 — the authoritative fix list for this revision). **This is fix
> cycle 1 of max 2.** The four SHARED-CONTRACT items in the response table below are adopted
> VERBATIM from the orchestrating session's reconciliation — desk law, not this skeleton's to
> renegotiate; the sibling `rotational_kinematics` is being fixed against the identical text.

---

## FIX-CYCLE-1 RESPONSE (finding → what changed → where it now reads)

| Finding | What changed | Where |
|---|---|---|
| **SHARED CONTRACT (orchestrating-session reconciliation — adopted verbatim, both Desk-D skeletons)** | (1) α = the per-step finite difference is the chapter's ONE definition, recorded at findings_d §1; this skeleton names it the shared definition and names the sibling as consumer. (2) The sibling's K8 **motor drive wheel** is the surviving chapter actuator; REV 1's floating tangential arrow is DROPPED as the actuator — the rim force arrow now layers ON the wheel, and **contact = the engage instant**. (3) The canonical signed-torque semantics moved OUT of both skeletons to **findings_d §1**; D1 consumes by reference and never restates. (4) ω₀ floor: ONE reconciled ask — lower to 0 at BOTH sites (`:49999` min AND the `:50075` live-write guard); explore-state-only | §3 readout metrics; D1; D2; D3; D4; item B; scar row 155 |
| **P1-1** | Drive actuator un-forked (wheel adopted, above) AND the phantom-arrow beat killed: the cause-motion is the wheel's ~0.7 s travel and the force arrow appears AT contact — no frame ever draws a force while τ reads 0.00 (fixed at S2, S4, S5, S7; S3's release = the wheel withdrawing). D4 rebuilt around findings_d §4b's verified travel-plumbing fact (`padEngageMs` never reaches the applied source) | §3 S2/S3/S4/S5/S7/S8; D4; §10(b)/(d) |
| **P1-2** | The finite-difference α is kept (this side's D3 won) and is now DECLARED the single shared metric, with the engine-side one-formula requirement cited to findings_d §1; the sibling's τ/I form is retired on its side | §3 readout metrics; D3 |
| **P1-3** | Neither skeleton is the definition site any more: the semantics live at findings_d §1, outside both; D1 cites by reference; scar row 155 re-dispositioned honestly (REV 1 marked it satisfied — it was satisfied by neither) | D1; scar rows 155, 108 |
| **P1-4** | S6 re-taught honestly: never-reversing is FRICTION's behaviour, not a law of opposing torques — title now "Friction brake: negative α", narration scopes the claim in one clause, and the reversal physics is named REAL (findings_d §1 semantics) but out of scope (the sibling's sandbox owns it). §4's claim that S6 "kills 'negative α spins it backwards'" is DELETED — that belief is correct physics, not a misconception | §2 S6; §3 S6; §4 |
| **P1-5** | The I and τ patches now COMPUTE on on-screen objects: I at S4 = 0.50 (frame) + 0.50 + 0.50 (each 2 kg mass at 0.50 m) = 1.50 — algebra-only, no Σ, S7's derivation untouched; τ at S2 = the arrow's own label × the drum radius, 2.78 N × 0.55 m = 1.53 N·m (S4 repeats the recipe: 1.09 × 0.55 = 0.60). The founder ruling request on prerequisites stays visible (item A); the proxy's recommendation (accept the unbuilt state with strengthened patches, no re-sequencing) is adopted | item A patch table; §3 S2/S4; §2 cross-checks; §10(b) |
| **P1-6** | New engine row **D10**: `deriveStateMeta` motion declared from the TORQUE, not the seed alone — ships in the SAME change as D1 (findings_d §6b); walk table updated in both directions (S4/S5/S7 consume it) | D10; walk table |
| **P1-7** | S3's entry ω = S2's end value (**5.56**, now stated per P3-2), drives to **6.56**, then releases and holds — the seam no longer changes ω without a torque; S2 → S3 reads as one continuous story | §2 tables; §3 S3; pin table |
| **P1-8** | The τ_net tug is KEPT and priced STRUCTURALLY (a second source: `sources[]` summing to τ_net, per-source engage windows, `rbrBrakedSeconds` split, every `eng.tau > 0` guard widened for the signed source), with a DESIGNED fallback (one signed `tau_app` control, tug cut) if Desk E rules simultaneity out of scope; ω = 0 with both engaged is DEFINED: a static hold with breakaway (`sign(L)` never consulted at 0; no limit-cycle chatter); bring-up probe (e) added | D1; §3 S8; D5 |
| **P2-1** | findings_d §2's loud-warn (`console.warn` once per state on an unknown readout token) added to D3 — the scope-freeze document carries it, not only the findings file | D3 |
| **P2-2** | The `external_torque.source` declared/live enum mismatch closed in D1's same-change list (declare `'applied_torque'`; drop or explicitly defer the two never-implemented members) | D1 |
| **P2-3** | Run B → **2.5 s** (end ω **5.80** — the 6.95 collision with CoAM's headline removed; REV 1 celebrated it as coherence, but it was two unrelated mechanisms sharing a number); run A ALSO driven 2.5 s (→ **1.25**), so the equal-time speed ratio IS the α ratio: 5.80/1.25 = **4.64**. A cross-APPARATUS collision scan now sits beside the in-state scan; the 4.64 inertia ratio is kept (forced by the contract's own poses — real coherence) | §2 ground truth + cross-checks; §3 S5; §4; pin table |
| **P2-4** | Folded into shared item 4: D2 narrowed (an authored `omega0_rad_s: 0` already works today — verified `:50497`/`:49828`; no APPARATUS_CONTRACT deviation on the authoring path), office ask = contract-reading confirmation + the two-site floor | item B; D2 |
| **P2-5** | Explicit physics_author instruction: S5 reads the 4.64 off the instruments ONLY and never invites an r² computation (the frame inertia dilutes r²; the why is #6's job) | §3 S5; §5 |
| **P3-1…P3-8** | `converge-on-mark` spelling adopted (the sibling's coin); `two-run-compare` coined for S5 (CoAM's `cycle-compare` is DEFINED as looping — one name may not cover both pictures); S2's end ω stated (5.56); S3 duration 10 → 8 s (pin margin recomputed); S7's frame term named as the rod's own particles summed the same way; "spin" → "spin rate" in titles and cues (Rule 41b); the Checkpoint-B one-focal frame check noted at §10(b); the core-only teacher-usability answer added; the D4/D7 force-map vs sibling velocity-map note added per findings_d §4 | each at its finding's site |

---

## ⚠ CHECKPOINT-A ITEMS — raised here deliberately, per the desk contract

### A. The prerequisites problem (open item needing a founder ruling)

`torque` (#5), `moment_of_inertia` (#6) and `rotational_kinematics` (#4) all precede this concept in
the approved teaching order and NONE is in this wave (#4 is this desk's other blocked concept; #5/#6
are unassigned). This concept genuinely uses all three as vocabulary, so its `prerequisites` array
will name ids with no concept JSON. **Concrete Rule-25 consequence, state by state:**

| Untaught term | First used | One-breath patch (authored into that state's narration; references only ON-SCREEN objects) |
|---|---|---|
| torque τ | S1 (the "τ = 0.00" readout), S2 (the drive) | S1: "a torque is a turning push about the axle — right now there is none." S2 COMPUTES it (P1-5) from the rendered cause: the drive wheel's rim force arrow is labelled `F = 2.78 N`, and one clause gives the recipe — "2.78 newtons at the 0.55-metre rim: a turning push of 2.78 × 0.55 = 1.53 newton-metres." S4 repeats the same visible recipe with its own numbers (1.09 N × 0.55 m = 0.60 N·m). |
| angular acceleration α | S1 (the "α = 0.00" readout) | S1: "α is how quickly the spin rate changes each second — steady spin means α is zero." |
| moment of inertia I | S4 (the equation) | S4 — the patch COMPUTES, not names (P1-5): "moment of inertia I measures how spread out the mass is — half a unit for the frame, plus each 2 kg mass at 0.50 m giving 0.50: 0.50 + 0.50 + 0.50 = 1.50." Arithmetic on the two visible masses; algebra-only, no Σ (S7 still owns WHY that sum is I). physics_author: speak the unit once ("kilogram-metre-squared") so the 0.50 m radius and the 0.50 kg·m² terms never blur. |
| ω = αt (kinematics) | S4 (the prediction) | S4: one clause — "a steady α of 0.40 for three seconds adds 1.20 to the speed." |

These patches make the concept self-standing if it ships before #4/#5/#6 exist; they do not
condescend to a student who has them (each is one breath, co-located with the visual). **Founder
ruling requested:** accept the advisory-prerequisites-unbuilt situation with these patches, or
re-sequence the wave.

### B. Office items — entry ω = 0 (NARROWED at fix cycle 1) + the reconciled ω₀ slider floor

**Narrowed per the Checkpoint-A reconciliation (P2-4); the founder-proxy's contract reading is
adopted.** Verified in code: an AUTHORED `omega0_rad_s: 0` already works today — `:50497` resolves
through `rbrNum` (`:49828`, `typeof`/`isFinite`), so a literal 0 is honoured, never the 1.5
default. S4/S5/S7 seeded at rest therefore need ONLY D1's signed torque to move: **no new field,
and no APPARATUS_CONTRACT deviation on the authoring path.** The contract's §1 language pins the
pose a teacher OPENS on, and this concept does open there (S1, S2, S6, S8 enter at the home pose).
Two narrow items go to the office (already recorded at findings_d §1; kept here for the audit
trail):

1. **Confirm the contract reading** — §1 pins the CONCEPT-OPENING pose only (the sibling's
   identical request; a confirmation, not a deviation).
2. **The reconciled ω₀ slider ask — ONE position for the whole desk (P2-4; supersedes REV 1's
   "keep the floor" AND the sibling's one-site request, which contradicted each other):** lower
   the floor to 0 at BOTH sites — `RBR_SLIDER_SPEC.omega0.min = 0.5` (`:49999`) **and** the
   live-write guard `if (!(value > 0)) return;` (`:50075`, which rejects a written 0 even with the
   min lowered). Both sites move together or the floor moves and nothing happens.
   Explore-state-only effect.

---

## 1. Atomic claim

This concept teaches ONE thing: **a net external torque produces angular acceleration in proportion,
τ_net = Iα — torque sets how quickly the spin rate CHANGES (never the spin rate itself), and the
same torque produces less α when I is larger**. It does not cover what torque is or the moment arm
(`torque`, #5), how I is computed or its axis-dependence (`moment_of_inertia`, #6), the kinematics
ω = ω₀ + αt as its own subject (`rotational_kinematics`, #4), rotational work/energy (#8), or
angular momentum L and its conservation (#9, #10 — L, KE, dL/dt and F_pull readouts are never shown
in this concept).

## 2. State count + arc — 8 states (7 guided + 1 explore)

Complexity call: **complex (7–9 band)** — catalog Diamond ★ V1. The concept needs the null baseline,
the qualitative law (both halves: torque present → ω changes; torque absent → ω persists), the
quantitative prediction, the I-dependence, the signed/net form, and the advanced derivation.

The apparatus is the ONE chapter turntable (APPARATUS_CONTRACT §1, all pinned values authored
explicitly): brake drum R = 0.55 m on a vertical axle, rod half-length 1.00 m riding 0.25 m above
the pad plane, two symmetric sliding masses m = 2.0 kg, I_frame = 0.50 kg·m², r ∈ [0.15, 0.90].
State entry is an instantaneous single-frame re-pose to the authored ENTRY CONFIG (the 0c-1 general
rule, CoAM physics block §2 — same mechanism, no new machinery). HUD (value-only, 2 dp): `I`, `ω`,
`α`, `τ` — **and never `L`, `KE`, `dL/dt` or `F_pull`** (readout lists are opt-in per state,
`:1043`; showing L here would pre-spoil #9 — scar `teach_do_not_prespoil_a_later_reveal`; this is
also the `teach_inverted_scenario_inverts_cutline_flags` lesson applied: this concept SURFACES the
quantities the sibling build suppressed and suppresses the ones the sibling owned).

**Authored numeric ground truth (all 2 dp, pairwise-distinct checks noted):**

| Config | r (m) | I (kg·m²) | τ (N·m) | α (rad/s²) | Key ω values |
|---|---|---|---|---|---|
| Home / S1, S2, S6, S8 entry | 0.80 | 3.06 | S2 drive **+1.53** · S6 brake **1.53** | S2 **+0.50** · S6 **−0.50** | home ω 1.50; S2 climbs 0.50/s unbounded (state-end value **5.56** — P3-2); S6: 1.50 → 0 in 3.00 s |
| S3 (after-drive hold) | 0.80 | 3.06 | +1.53 then **0** at 2.0 s | +0.50 then **0.00** | entry **5.56** (= S2's end — P1-7 continuity) → holds **6.56** |
| S4 (fresh numbers) | **0.50** | **1.50** | **+0.60** | **+0.40** | from rest; predicted ω after 3.0 s = **1.20** |
| S5 run A | 0.80 | 3.06 | +1.53 | +0.50 | from rest → **1.25** in 2.5 s (chip-stamped) |
| S5 run B | 0.20 | 0.66 | +1.53 (same) | **+2.32** (2.3182) | from rest → **5.80** in 2.5 s |
| S7 (derivation replay) | 0.80 | 3.06 | +1.53 | +0.50 | from rest, slow replay |

Cross-checks: 1.53/3.06 = 0.500 exactly; 0.60/1.50 = 0.400 exactly; 1.53/0.66 = 2.3182 → 2.32;
run A 0.50 × 2.5 = **1.25**; run B 2.3182 × 2.5 = 5.7955 → **5.80**; equal-time speed ratio
5.7955/1.25 = **4.64** = I ratio 3.06/0.66 = α ratio 2.32/0.50 (the ratio is FORCED by the
contract's own poses, r 0.80 → 0.20 on this rod — genuine chapter coherence with CoAM). Drive
forces (P1-5): F = τ/R_drum: 1.53/0.55 = 2.7818 → **2.78 N** (S2); 0.60/0.55 = 1.0909 →
**1.09 N** (S4). S2 end ω = 1.50 + 0.50 × 8.11 = **5.56** (P3-2); S3 end = 5.56 + 0.50 × 2.0 =
**6.56**. **Cross-apparatus collision scan (P2-3):** run B's 2.5 s duration is chosen so its end ω
(5.80) does NOT equal CoAM's headline pulled-in ω = 6.95 — REV 1's 3.0 s produced exactly that
collision and presented it as coherence; same machine, unrelated mechanisms, a false lesson to
anyone who notices (2.0 s was also rejected: → 4.64, colliding with the ratio itself). No headline
value here (5.56 · 6.56 · 5.80 · 1.25 · 1.20 · 0.60 · 0.40 · 1.09 · 2.78 · 2.32) equals a CoAM
headline (6.95 · 4.59 · 2.29 · 15.96 · 3.44 · 0.92 · 0.75 · 0.86); shared values (1.53 · 3.06 ·
0.66 · 4.64 · 1.50) are the SAME quantity on the same apparatus — coherence, not collision.
S7 torque ledger: per-mass m·r²·α = 2.0·0.64·0.50 = **0.64**, two masses **1.28**, frame
0.50·0.50 = **0.25**, total **1.53** ✓ exact. Numeric-collision scan: S4 shows I = 1.50 while 1.50
is also the home ω — but S4 enters from REST (ω starts 0.00) and its target chip is 1.20, so no two
co-visible readouts share a value in any state; narration never invites a cross-instrument
comparison of I with a speed. S6's τ_brake = 1.53 deliberately equals S2's drive ("the same size
torque, opposite direction, removes speed at the same rate it added it") — same quantity, same unit,
the equality IS the point, stated in narration. HUD decimals: exactly 2 everywhere; negatives print
a real Unicode minus (U+2212) on every text path.

| State | Title (Rule 41 — literal) | Purpose | teaching_method | Ring |
|---|---|---|---|---|
| S1 | No torque: the spin rate does not change | Baseline + null: τ = 0 ⇒ α = 0 ⇒ ω constant; readouts built; kills "a spinning object needs a torque to keep spinning" | *(straightforward beat)* | core (qualitative) |
| S2 | Torque on: the spin rate keeps rising | **THE PRIMARY AHA:** constant τ → ω climbs and never settles; α is the constant thing | *(straightforward beat)* | core (qualitative) |
| S3 | Torque off: the spin rate stays | The other half: removing τ removes the CHANGE, not the motion | *(straightforward beat)* | core (qualitative) |
| S4 | The equation predicts the speed | Quantitative: τ = Iα computes α = 0.40 and predicts ω = 1.20 after 3 s, BEFORE the run; the live readout meets the chip | *(straightforward beat)* | core (quantitative) |
| S5 | Same torque, more inertia: less α | SUPPORTING AHA: same τ, I × 4.64 ⇒ α ÷ 4.64 — two runs, one comparison | `misconception_confrontation` | core (quantitative) |
| S6 | Friction brake: negative α | The signed law via a FRICTION brake: a torque opposing the spin gives α < 0; ω falls at a steady rate to rest, and friction then HOLDS it at rest. Honest scope (P1-4): never-reversing is FRICTION's behaviour, not a law of opposing torques — a sustained driven opposing torque CAN reverse a spin (D1 semantics; out of scope here, owned by the sibling's sandbox) | *(straightforward beat)* | extended |
| S7 | Adding up every particle | Derivation: F = ma per particle ⇒ τ = (Σmr²)α = Iα; the ledger sums to 1.53 exactly | `derivation_first_principles` | advanced |
| S8 | Try it yourself | Sandbox — incl. drive + brake together (a live τ_net tug) | `exploration_sliders` | *(explore — ring-gated)* |

**Rule 38a:** ladder qualitative (S1–S3) → quantitative (S4–S5) → extended (S6) → derivation (S7);
rings monotone; advanced contiguous immediately before explore ✓. `advance_mode`: S1–S7
`manual_click`, S8 `interaction_complete` ✓ (Gate 12: 2 distinct modes).

## 3. Per-state choreography + control plan (Rule 31 control table)

**Beat-termination contract:** S3–S7 are ONE-SHOT — each drive/decay ends (release, match,
cut-and-run-B, rest clamp, replay end) and HOLDS its end configuration for the remainder of the
state. **S2 is deliberately NOT hold-terminated: its beat is a monotone unbounded climb to state end
— the climb IS the state's claim** ("as long as the torque acts, the speed keeps rising"),
implemented as an engage with `release_at_ms` omitted (= never releases, `:50523–50524`), a closed
form of state-local t, so the frozen pin photographs a mid-climb frame that is the claim itself
(scar `authored_beat_ends_by_undoing_the_state_own_claim` — no beat undoes its claim; S2's never
ends it). No state loops. No `param_ramp` is authored anywhere in this concept (r changes only at
entry/run re-poses) — scar `field3d_param_ramp_authoring_contract` is satisfied vacuously and by
design.

**Coined archetypes (three, justified once):**
- `steady-drive` — a constant rendered cause is held ON while the effect readout changes at a
  constant rate; the distinct picture is the constant-cause / steadily-changing-effect pairing
  (no seed-vocabulary archetype names it: nothing translates, densifies, or cycles — the CAUSE holds
  still and the NUMBERS move).
- `converge-on-mark` — a live readout sweeps toward a pre-committed prediction chip and the match
  cue seals the meeting; the meeting is the picture (the inverse of CoAM's `diverge-from-mark`).
  **Spelling settled chapter-wide to the sibling's coin (P3-1)** — REV 1's `converge-to-mark` is
  retired; one name, one picture.
- `two-run-compare` — a one-shot A→cut→B comparison HELD at its end (S5). Coined at P3-1 because
  CoAM's `cycle-compare` is DEFINED there as "the ONLY looping state" — one archetype name may not
  cover both a looping and a non-looping picture.

| State | Teaches (one idea) | Archetype | ENTRY CONFIG (r · ω · τ_app · τ_brake at t = 0) | Authored beat (no teacher input; cause → beat → effect) | Delta cue | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|---|
| S1 | No net torque ⇒ α = 0 ⇒ ω stays exactly what it is | `null-result-hold` | 0.80 · +1.50 · 0 · 0 | Turntable spins steadily (continuous, never a cold start). Readouts build one by one, each only AFTER its defining sentence (`readout_at_ms`, `:1047`): I 3.06 → ω 1.50 → τ **0.00** → α **0.00**. Hold-glow settles on the ω row: nothing changes it. Misconception beat: narration names the everyday expectation ("things slow down on their own") while the ω readout visibly refuses to move | **No torque: spin unchanged** | none | 35–50 | core |
| S2 | A constant torque does not set the speed — it sets the RATE the speed changes | `steady-drive` | 0.80 · +1.50 · 0 (wheel contact = engage at 4.89 s) · 0 | Pre-roll: one full slow revolution (2π/1.50 = 4.19 s). CAUSE: the **motor drive wheel** (D4 — the shared chapter actuator, the sibling K8's surviving spec) translates in from its park pose over ~0.7 s (4.2 → 4.89 s), visibly turning as it approaches; **contact IS the engage instant** (the pad's own timing contract — Rule 32a satisfied by the physics, never a dead beat): at contact the rim force arrow appears at the contact patch, labelled `drive F = 2.78 N`, and τ = +1.53 engages — **no frame ever draws a force while τ reads 0.00 (P1-1)**. One clause computes τ from the visible cause: 2.78 N × 0.55 m = 1.53 N·m (P1-5). ω climbs at exactly 0.50/s — 1.50 → 2.00 → 3.00 → past every value to the state-end **5.56** (P3-2), never settling; α readout sits CONSTANT at +0.50 (the steady thing), τ readout +1.53. The spin visibly quickens each revolution. Anchor (~8 words): "like steadily pushing a playground merry-go-round" | **Torque on: spin rate climbs** | none | 40–55 | core |
| S3 | Removing the torque removes the change, not the motion | `null-result-hold` — **declared contrast pair of S1** (delta names the flip: S1 holds the NEVER-driven rate 1.50; S3 holds a DRIVEN-UP rate 6.56 — absence of torque preserves whatever ω the torque left behind) | 0.80 · **+5.56 (= S2's end value — P1-7: the click changes NOTHING but the running clock; S2 → S3 reads as one continuous story)** · +1.53 (engaged at entry, wheel in contact) · 0 | Entry mid-drive: wheel engaged, arrow on, ω climbing 5.56 → 6.56 over 2.0 s (α +0.50). CAUSE: at 2.0 s the **wheel visibly withdraws** (release cue), its arrow leaving with it. After a readable beat the EFFECT: α snaps to 0.00, τ to 0.00 — and ω HOLDS at **6.56** for the remainder (state ≥ 8 s — P3-3). Nothing slows it | **Torque off: spin rate stays** | none | 25–40 | core |
| S4 | τ = Iα is exact: it predicts the outcome before the run | `converge-on-mark` | **0.50** · **0 (from rest — item B)** · +0.60 (wheel contact = engage at 3.9 s) · 0 | Fresh pose (masses visibly at mid-rod; r-line labelled 0.50). Narration COMPUTES I from the visible rig (P1-5): 0.50 for the frame + 0.50 per 2 kg mass at 0.50 m = **1.50** — algebra-only, no Σ. The formula surface **τ = Iα** appears whole at its defining sentence (D8); the chip **"predicted ω = 1.20 after 3 s"** stamps beside the ω readout (chip form, `:1021–1030`, `:50165–50176` — [LIVE]). CAUSE: the wheel travels in 3.2 → 3.9 s; contact = engage, its arrow `F = 1.09 N` appears at contact (1.09 × 0.55 = 0.60 — the S2 recipe repeated). EFFECT: ω sweeps 0.00 → 1.20 over 3.0 s (α readout constant +0.40); at 6.9 s the wheel withdraws exactly as ω arrives — **match cue co-glows chip and readout** (latch, tolerance 0.01) — and ω holds 1.20 | **Equation predicts the speed** | none | 40–55 | core |
| S5 | The SAME torque gives less α when I is bigger — α = τ/I | `two-run-compare` (one-shot A→cut→B, then HELD — coined at P3-1: never looping, so CoAM's looping `cycle-compare` name may not cover it) | run A: 0.80 · 0 (rest — item B) · +1.53 (wheel engages 0.5 s) · 0; run B (at the cut): **0.20** · 0 · +1.53 · 0 | Run A (the reference — reuses S2's τ and home r deliberately, as CONTINUITY, not verification): wheel drives 0.5–3.0 s, ω 0 → **1.25**, α +0.50; at 3.0 s a chip stamps **"run A: ω = 1.25"** beside the ω readout (static — the held comparison value). CUT at 3.5 s: re-pin cue, readouts blank ≥ 0.5 s (`:50053–50064` [LIVE] + D6), masses re-pose to r = 0.20 in the blanked single frame. Run B: SAME wheel, same τ = +1.53, an EQUAL 2.5 s drive (4.0–6.5 s) — ω races 0 → **5.80**, α +2.32. HELD: chip 1.25 beside live 5.80, α 2.32, I 0.66 — the whole comparison in one frame, and the equal-time speed ratio IS the α ratio: 5.80/1.25 = **4.64**. Narration states the factor: I is 4.64× smaller, α is 4.64× larger. **physics_author (P2-5): S5 reads 4.64 off the instruments ONLY — never invite an r² computation (the frame inertia dilutes r²; the why is #6's job); the one_line_fix stays "I depends on where the mass sits"**. Anchor (~9 words): "a merry-go-round with riders near the edge speeds up more slowly" | **More inertia: less acceleration** | none | 40–55 | core |
| S6 | A FRICTION brake torque is a negative α: ω falls at a steady rate to rest, and friction then HOLDS it at rest | `translate-through` | 0.80 · +1.50 · 0 · 1.53 (pad engages at 1.5 s; slider default/step overridden per-concept via `config.slider_controls`, `:50005–50014` [LIVE]) | CAUSE: the brake pad translates in to the drum (pad machinery [LIVE], `:50623–50631`; R_drum line + r-line drawn as two distinct labelled lines — CoAM's dual-line discipline inherited). EFFECT after contact: α reads **−0.50**, τ **−1.53**, ω falls 1.50 → 0 over exactly 3.0 s — the same rate S2 added speed, opposite sign (narrated). Rest clamp at 4.5 s: ω holds 0.00, α returns 0.00 while the pad stays on. **Honest scope (P1-4): never-reversing is FRICTION's behaviour, not a law of opposing torques** — narration carries it in one clause ("friction opposes the spin, so at rest it only grips — it cannot spin the wheel backwards; a driven opposing torque could"); the reversal physics is real (D1 / findings_d §1 semantics) but out of this concept's scope, taught in the sibling's sandbox | **Brake on: negative α** | brake-torque slider, [0, 2.0], step 0.01, default 1.53 *(min_ring: extended)* | 35–50 | extended |
| S7 | The law is Newton's second law summed over the body's particles: τ = (Σmr²)α = Iα | `equation-build` | 0.80 · 0 (rest — item B) · +1.53 (wheel contact = engage at 4.5 s) · 0 | The equation assembles synced to narration on the single formula surface (D8): F = ma per particle → the tangential force each mass needs is m·(rα) → its torque m·r²·α → summed: τ = (Σmr²)α = Iα. Per-mass **tangential force arrows** (D7) reveal one per sentence, equal by symmetry (0.80 N each), riding the masses. Then the wheel travels in 3.8 → 4.5 s (contact = engage — P1-1) and the slow drive replay runs 4.5–7.5 s (ω 0 → 1.50) with the arrows on and the ledger narrated: 0.64 + 0.64 + 0.25 = 1.53 — **and the frame's 0.25 IS the rod's own particles, each m·r²·α, summed the same way and quoted as one number (P3-4)**. Σ/calculus notation here only (Rule 38c) | **Adding up every particle** | none | 40–55 | advanced |
| S8 | Sandbox | `drag-sandbox` | 0.80 · +1.50 · 0 · 0 (home pose per contract) | Free-running (Rule 37). **No idle sweep** — the turntable's own steady spin is the until-first-input motion (an idle τ-pulse cycle would grow ω without bound, and an idle r-sweep would perform CoAM's conservation beat and pre-spoil a LATER concept — both rejected, stated here so json_author does not add one). Live semantics: `tau_app` drag (D5) applies the drive along the home spin sense — the drive WHEEL is in contact whenever tau_app > 0 and withdraws at 0, its rim arrow tracking the dragged magnitude; `tau_brake` drag opposes (extended ring); **both at once = a live τ_net tug — the α readout shows the difference** (the teacher's own net-torque demonstration), with the ω = 0 rule DEFINED (P1-8): while the brake is engaged and |τ_app| ≤ τ_brake, the wheel is HELD at rest (L pinned 0, α reads 0.00) until τ_app exceeds τ_brake and it breaks away smoothly — no chatter at zero. **Declared fallback:** if Desk E rules simultaneity out of scope (D1 structural note / findings_d §1), S8 drops the tug and exposes ONE signed `tau_app` control [−2.0, +2.0] — designed here so the cheap cut is a design decision, not a mid-build improvisation. `r`/`m` drags re-shape I live; `ω₀` change = restart with re-pin cue ([LIVE] `:50074–50078`). α/τ readouts blank across every re-pin (D3) | **Try it yourself** | ALL, ring-gated: `tau_app` *(core — the taught variable, D5)* · `r` *(core)* · `m` *(core)* · `omega0` *(core)* · `tau_brake` *(extended — cut with S6's ring)* | 0 / open | *(explore)* |

**Archetype audit:** null-result-hold ×2 (S1/S3, declared contrast pair), steady-drive (S2), converge-on-mark (S4), two-run-compare (S5), translate-through (S6), equation-build (S7), drag-sandbox (S8). No other repeat; no static state; every archetype discharged by the authored beat with no teacher input (S6's slider is layered ON an authored beat). Chapter vocabulary settled (P3-1): `converge-on-mark` is the sibling's spelling, adopted; `cycle-compare` is NOT used here (CoAM defines it as looping).
converge-to-mark (S4), cycle-compare (S5), translate-through (S6), equation-build (S7), drag-sandbox
(S8). No other repeat; no static state; every archetype discharged by the authored beat with no
teacher input (S6's slider is layered ON an authored beat).

**Explore controls — ring-gated:** *Hide advanced (drop S7):* S8 keeps all five, each mapping to a
surviving state ✓. *Hide advanced+extended (drop S6–S7):* S8 keeps tau_app/r/m/omega0 (taught by
S1–S5); tau_brake is CUT with S6's ring ✓. S8's formula surface stays **τ = Iα** (stated by S4,
core, survives every preset) ✓.

**Readout metrics (every displayed number defined):** `I` = I_frame + 2·m·r(t)², recomputed live
(`rbrIOf`, `:49865`). `ω` = L/I, derived every step (`:49945–49948`). **`τ` (net) = the signed
authored schedule value at t** — a display of the acting torque, not a measurement (+drive − brake;
0 when nothing engaged). **`α` = the per-step finite difference (ω_k − ω_{k−1})/h on the fixed
16 ms grid** (`RBR_GRID_MS`, `:49737`) — equal to τ_net/I exactly whenever I is constant (every
guided beat; zero live noise — the taught deltas 0 → ±0.50 are full-scale), and honest in the one
place they differ (an S8 r-drag during a drive, where dω/dt = (τ − ω·dI/dt)/I — the readout shows
the true rate, never a lie). **α and τ BLANK during every re-pin/restart blank window** (the
one-step finite difference across a cut is a meaningless spike — D3). All rows publish from ONE
post-step snapshot per frame.

**Rule 33 macro↔micro:** N/A-with-justification — the taught variable (α) IS the visible mechanism:
the spin itself quickening or slackening, with the instruments reading it live (33d satisfied by the
value-only HUD).

**Rule 34 canvas budget:** top caption = the ≤5-word delta cue only; ONE formula surface per state —
S1/S2/S3 none (qualitative; the law lives in narration until earned) · S4/S5 **τ = Iα** · S6
**τ_net = Iα** (the "net" is S6's one new thing, reconciled by narration against S4's form) · S7
**τ = (Σmr²)α = Iα** · S8 **τ = Iα**; math-serif Unicode throughout (`RBR_MATH_FONT` [LIVE]); all
surfaces SYMBOLIC — numbers live only in the HUD and the chips the live readouts meet.

**Pin-margin discipline (margins from the LAST asserted event, computed at the 16 ms grid with
≤2-step discrete lag added):**

| State | Last asserted event (design est.) | State duration R (min) | Pin at 0.60R | Margin |
|---|---|---|---|---|
| S1 | readouts built ~4.4 s | ≥ 8 s | 4.8 s | 0.4 s ✓ |
| S2 | none — monotone climb by design; pin photographs mid-climb (ω ≈ 2.96, α +0.50, arrow on) | ≥ 13 s (author 13) | 7.8 s | claim-by-construction ✓ |
| S3 | release + settle ~2.5 s | ≥ 10 s | 6.0 s | 3.5 s ✓ |
| S4 | match + release 6.9 s (+ 0.033 lag) | ≥ 12 s (author 12) | 7.2 s | 0.27 s ✓ |
| S5 | run-B end + hold 7.0 s (+ lag) | ≥ 13 s (author 13) | 7.8 s | 0.77 s ✓ — the pin photographs chip 1.50 beside live 6.95 (the archived frame IS the correct comparison) |
| S6 | rest clamp 4.5 s (+ 0.033) | ≥ 10 s | 6.0 s | 1.47 s ✓ |
| S7 | replay end 7.5 s (+ lag) | ≥ 13 s (author 13) | 7.8 s | 0.27 s ✓ |

physics_author recomputes at the engine grid. THE EYE reads DENSE frames across the S2/S4/S5/S6
drive/decay windows, not only the frozen pins.

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots)

| Wrong belief | At | `misconception_watch` beat |
|---|---|---|
| "A spinning object slows and stops on its own; keeping it spinning needs a torque" (the everyday friction world) | **S1** | belief: with nothing driving it, ω should drift down · visual_counter: τ = 0.00 and the ω readout sits pinned at 1.50 for the whole state, spin never flagging · one_line_fix: with no net torque α is zero — the spin neither grows nor dies; it continues |
| **"A constant torque makes it turn at a constant speed"** (the force→velocity carryover — THE pivot) | **S2** | belief: hold a steady push and the wheel settles at some steady rate · visual_counter: the drive arrow holds perfectly constant while ω climbs past 2.00, 3.00, 4.00… and never settles; the CONSTANT readout is α, not ω · one_line_fix: torque sets the rate of CHANGE of spin — constant torque means constantly increasing speed |
| "The same torque always produces the same acceleration — only how much mass, not where it sits" | **S5** | belief: same push, same speed-up · visual_counter: identical drive arrow, identical τ = 1.53, and run B (masses near the axle) reaches 6.95 in the time run A reached 1.50 — α readout 2.32 vs the chip-stamped run A · one_line_fix: α = τ/I, and I depends on where the mass sits — 4.64× less inertia, 4.64× more acceleration |
| | | Named primitives for each wrong picture (scar `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive`): S1 needs the τ/α readout rows (**D3**); S2 needs the rendered drive arrow (**D4**) + the climbing ω under **D1**; S5 needs the two-run restart script (**D6**) + the run-A chip ([LIVE]) |

S3, S4, S6, S7, S8 carry NO misconception_watch (S6's never-reverses beat kills "negative α spins it
backwards" structurally, without a watch entry). EPIC-C branches: **zero** (Rule 20 [D]; EPIC-L-first).

## 5. `has_prebuilt_deep_dive` states (2)

**S2** (the primary aha — the force→velocity confusion is the single most documented dynamics
misconception, linear or rotational) and **S5** (the I-dependence — where exam mistakes concentrate:
students carry m into τ = Iα without r²). Cache-hint only; V1.0 ships zero authored deep-dives
(Rule 18).

## 6. Drill-down clusters

**S2:** `constant_torque_constant_speed` (why doesn't it settle) · `why_it_keeps_speeding_up`
(what α being constant means) · `torque_off_no_stop` (why removing the torque doesn't stop it —
bridges to S3).
**S5:** `same_torque_different_alpha` (how the same push can accelerate differently) ·
`mass_position_matters` (why r², not just m) · `alpha_formula_use` (computing α = τ/I in problems).

## 7. `entry_state_map`

```
entry_state_map:
  foundational:    STATE_1 → STATE_5   # the law, both halves, the prediction, the I-dependence
  opposing_torque: STATE_6             # "what if the torque opposes the spin" routes to the brake
  derivation:      STATE_7
```

Default `foundational`. PRIMARY aha (S2) inside the foundational range ✓; the supporting aha (S5)
and all three misconception beats also land inside it — the silent student meets everything core on
the default slice.

## 8. Prerequisites (advisory — Rule 23)

`rotational_kinematics` (#4) · `torque` (#5) · `moment_of_inertia` (#6) · `rigid_body_rotation`
(#3). All in-chapter, NONE shipped, and #5/#6 are not even in this wave — **see Checkpoint-A item A
for the Rule-25 consequence and the per-state patches.** No cross-chapter prerequisites (Newton's
second law itself is assumed from Laws of Motion, invoked only in S7's derivation with its own
one-clause restatement).

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral)

**Primary: pushing a playground merry-go-round** — hold a steady push on the rail and it does not
turn at one speed; it speeds up for as long as you keep pushing. Assigned to **S2**, ~8 words
reserved. Physically the exact rendered system (a torque at the rim of a mass-laden rotor), known in
every playground in every country; no brands, places, or festivals. Dialect note (38d):
"merry-go-round" is the widest-read term; physics_author may write "playground merry-go-round" once
for clarity. **Secondary: the same merry-go-round with riders sitting near the edge** — the same
push speeds it up more slowly. Assigned to **S5**, ~9 words — it lands ON the I-dependence aha it
illustrates. Neither pre-spoils a later reveal. No region constants anywhere. The apparatus stays
the abstract chapter turntable; the pushing agent is ON SCREEN as the rendered drive arrow (D4).

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 8 of §2, exactly as tabled in §3.

**(b) Symbol-label table + term-introduction ledger:**

| Quantity | Label | DEFINED at | First PRINTED at | ✓ |
|---|---|---|---|---|
| Moment of inertia | `I` (HUD `3.06 kg·m²`) | S1 one-breath (full cliff patch at S4) | S1, after its sentence (`readout_at_ms`) | ✓ |
| Angular speed | `ω` (HUD `1.50 rad/s`) | S1 | S1 | ✓ |
| Torque (net) | `τ` (HUD `0.00 N·m`, signed) | S1 one-breath ("a turning push about the axle") | S1, after it | ✓ |
| Angular acceleration | `α` (HUD `0.00 rad/s²`) | S1 ("how quickly the spin rate changes each second") | S1, after it | ✓ |
| Drive force at the rim | tangential arrow, label "drive" | S2, the cause sentence | S2 | ✓ |
| Radius of the masses | `r` line + label | S4 first needs it named (pose 0.50) | S4 (line exists [LIVE]) | ✓ |
| The law | `τ = Iα` formula surface | S4, its defining sentence | S4 — never earlier | ✓ |
| Prediction mark | chip `predicted ω = 1.20 after 3 s` | S4, the prediction sentence | S4 | ✓ |
| Held comparison | chip `run A: ω = 1.50` | S5, run-A close | S5 | ✓ |
| Braked radius | `R_drum` line, distinct style + label from `r` | S6, "at the rim" | S6 | ✓ |
| Signed/negative values | Unicode minus (U+2212) on α and τ | S6, the opposing sentence | S6 — first negative anywhere | ✓ |
| Per-particle force | tangential arrows, label `m·r·α` | S7, its derivation sentence | S7 only | ✓ |
| Σ notation | `Σmr²` on the formula surface | S7 | S7 only (advanced) | ✓ |
| NEVER shown | `L`, `KE`, `dL/dt`, `F_pull` rows; the L axle arrow; the grip hand | — | — (owned by #8/#9/#10) | ✓ |

json_author note: glow-target set ⊆ built primitive ids; HUD hold-glow rides the instrument channel,
scene glow_focal the scene — S2 glows the drive arrow (cause) while the ω row carries instrument
hold-glow, so the taught relation's two halves are never mutually dimmed (scars
`ecp_glow_targets_missing_primitives`, `state_glow_focal_dims_one_half_of_the_relation…`).

**(c) Right-hand-rule plan:** **N/A by scope** — this concept teaches magnitudes and signs along a
fixed, known axis; the DIRECTION of rotational vectors by the grip rule is `angular_momentum`'s (#9)
opening beat. No hand is shown (`show_grip_hand` false everywhere).

**(d) Motion plan:** S1 continuous steady spin + sentence-synced readout build · S2 pre-roll
revolution → drive arrow (cause, 0.7 s beat) → unbounded steady climb · S3 climbing entry → arrow
retracts → speed freezes and holds · S4 re-posed rig → formula + chip → drive from rest → readout
meets chip (match latch) → hold · S5 run A from rest → chip stamp → blanked cut + re-pose → run B
from rest → held comparison · S6 pad translates in → steady decay → rest clamp holds · S7 equation
assembly + arrow reveals → slow replay from rest · S8 free-running sandbox (steady spin until first
trusted input). No passive state; every stated agent is a rendered object (drive arrow, pad); every
stated number is produced by the §3 metrics.

**(e) Modes:** conceptual-only (Rule 20 [D]); no `mode_overrides`.

**(f)** `assessment` + `coverage_map` authored at 0d; `misconception_watch` exactly the 3 of §4.

**(g) Macro↔micro:** N/A-with-justification per §3.

**(h) Canvas budget:** per §3. rbr zones already distinct ([LIVE]: HUD/readout, formula, sliders,
re-pin badge at `top:52px`, `:50459`); no ke_bar authored (no bars anywhere); chips render inline
in the readout row (`:50171`).

**(i) Curriculum-flex (Rule 38):**
- **(i-1) Preset-cut coherence:** *Hide advanced (drop S7):* S1–S6 + S8 coherent — no surviving
  state references Σmr² or the per-particle picture. *Hide advanced+extended (drop S6–S7):* S1–S5 +
  S8 coherent — no surviving state references opposing/negative torque or a signed α (S1–S5 drives
  are all positive; the Unicode-minus ledger row is S6-only); S8 drops tau_brake by min_ring.
- **(i-2)** Explore = core content only: formula `τ = Iα` (S4, core) ✓; the extended-ring control is
  cut with its ring ✓.
- **(i-3) `curriculum_tags` (claims, not facts — 38g):** CBSE/NCERT covered, marked verified
  (τ = Iα is a named NCERT-section topic). JEE Main/Advanced core+extended+advanced · NEET
  core+extended · IB DP / A-level / AP Physics C (rotational dynamics with calculus — advanced ring
  relevant) — every non-CBSE cell `needs_teacher_verification: true`.
- **(i-4) Presets (38h — hide, never reorder):** `full` = S1–S8 · `no_derivation` = hide S7 ·
  `core_only` = hide S6–S7 (controls auto-cut by min_ring).
- **(i-5) Graph axes:** no graph in any ring → N/A by design. An ω–t graph was CONSIDERED and
  deliberately excluded: the slope-legibility job is done by the α readout + the S4 chip, and
  graph-first treatment of ω(t) belongs to `rotational_kinematics` (#4) — duplicating it here would
  blur both concepts' atomic claims. (Noted for the sibling skeleton, where the graph rows WILL bind.)

**Teacher-usability walk:** (1) *Law stated and shown in the assessed representation?* S1 states it
in words, S4 shows τ = Iα AND uses it predictively on screen (the exam's use of the equation,
performed), S7 derives it. (2) *First thing a teacher tries after the aha, demonstrable in range?*
Drag tau_app and watch α follow instantly while ω integrates it — S8, [0, 2.0] N·m; then the tug:
drive AND brake together, α reading the net — the τ_net demonstration no whiteboard can do.
(3) *Definition precedes use?* Ledger §10(b), enforced by `readout_at_ms`.

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** See Checkpoint-A item A — the four cliffs (τ at S1/S2, α at S1, I at S4,
ω = αt at S4) each carry a named one-breath patch in the state that hits them.

**JEE-backwards trace.** *"A wheel of moment of inertia 3.06 kg·m² is at rest. A constant torque of
1.53 N·m acts for 3 s. Find (i) α, (ii) ω at 3 s, (iii) the constant opposing torque that would then
bring it to rest in 3 s, (iv) how α changes if the same torque acts on a wheel of half the moment of
inertia."* (i) α = τ/I → S4 (performed on screen with fresh numbers). (ii) ω = αt → S4's chip (one
clause of #4's kinematics, patched). (iii) signed/net torque → S6 (its exact numbers: 1.53 N·m
stops 1.50 rad/s in 3.0 s). (iv) inverse proportionality → S5. Conceptual distractor ("the torque
stops — does the wheel stop?") → S3. No missing piece. (M1–M6 magnetism carve-out: N/A.)

**Misconception entry mapping.** All three confronted proactively per §4. Planting risk: S2's
narration must never say the wheel "wants" to speed up or "fights" the push (Rule 41) and must not
call the climb "free" — the drive arrow is right there acting; S4's exactness could plant "same τ,
same α always" — S5 detonates it one click later (that sequencing is deliberate).

## Block 2 — Aha-moment designation

- **PRIMARY aha, at S2:** *a torque does not set how fast something spins — it sets how fast the
  spin CHANGES; hold a steady torque on and the speed climbs without limit.*
- **SUPPORTING aha, at S5:** *the same torque produces less angular acceleration when the mass sits
  farther out — α = τ/I.* Total = 2. Cohesion: S5's flip is meaningless without S2's "torque sets α"
  — it reinforces the primary by showing what MODULATES it ✓.
- **Wrong-belief setup.** Primary: S1 builds the steady, friction-world comfort ("spin just
  persists") so the everyday "push steadily, turn steadily" expectation walks into S2 confident and
  wrong. Supporting: S2 + S4 build "τ fixes α exactly" with I never once changing — S5 then changes
  ONLY I under the identical drive.
- **Foundational coverage:** S2 ∈ foundational (S1–S5) ✓.

---

## ENGINE REQUIREMENTS (for `field3d-surgeon`, build 0c-3 — Desk E freezes scope from this list)

Every `[LIVE]` tier verified against renderer code this session at the cited lines. Every
`[NEEDS-0c-3]` row states what must be built, why the concept fails without it, and which knobs are
scriptable (scar `phase0_union_lists_capabilities_but_never_which_knobs_are_scriptable`); each new
config field carries an **absent-field clause: absent ⇒ today's behaviour byte-identical** (scar
`engine_extension_replaces_a_shared_constant_without_an_absent_field_fallback_clause`). All new
numeric fields resolve by `rbrNum`'s typeof test (`:49828`), never truthiness (scar
`optional_config_field_with_a_legal_zero_value_is_resolved_by_truthiness` — legal zeros are
everywhere here: ω₀ = 0, τ = 0, at_ms = 0).

1. **D1 `[NEEDS-0c-3]` — SIGNED DRIVE TORQUE (the physics gap; the serious one).**
   `rbrLAt` (`:49933–49943`) is decay-only: `mag = |L0| − eng.tau·braked_seconds`, clamped at 0;
   both sources feed `eng.tau` through `Math.abs` (`:50520`, `:50532`). Required: the single
   closed-form integrator generalises to
   `L(t) = L_anchor + τ_app_signed·s_app(t) − sign(L)·τ_brake·s_brake(t)` — piecewise-linear in
   state-local t with breakpoints at engage/release/zero-crossing instants, still a pure closed form
   of `eng.t_ms` (accumulator-free; Rule 36; a `SET_TIME_FREEZE` pin re-evaluates; a pinned rewind
   reproduces the frame — the trace obligation of scar
   `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls` transfers to the
   0c-3 report, which must cite the terminating line of every function on the rewind path, as
   `rbrThetaAt`'s backwards-rebuild does at `:49958`). **Semantics, defined ONCE for both Desk-D
   concepts (scar `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field`
   — `rotational_kinematics` consumes this row BY REFERENCE, never redefines it):**
   `applied_torque_Nm` becomes SIGNED; positive drives along the +`spin_sign` axis; it may
   legitimately carry L through zero (a drive is not friction); the rest clamp applies ONLY to the
   brake component (brake semantics unchanged, `:49942`). Engage/release knobs as today
   (`engage_at_ms`/`engage_cue`/`release_at_ms`/`release_cue`, `:50522–50524` [LIVE]); both sources
   may be active simultaneously (S8's τ_net tug). Absent-field clause: no `applied_torque_Nm` ⇒
   behaviour identical to today. Bring-up probes: (a) from rest, τ_app = 1.53, I = 3.06 constant —
   assert ω(t) = 0.50·t to 1e-9 over 20 s; (b) frame-dt fold with the grid h held fixed (20 steps at
   dt = h vs 10 at dt = 2h), assert |Δθ| and |Δω| < 1e-12; (c) drive + brake simultaneously engaged,
   assert dω/dt = (τ_app − τ_brake·sign(ω))/I segment-wise; (d) drive against the spin from
   ω = +1.50, assert a smooth sign change with NO clamp event. **Without D1: S2, S3, S4, S5, S7,
   S8 — six of eight states — cannot exist.**

2. **D2 `[NEEDS-0c-3 + office ruling]` — start from rest.** Authoring `omega0_rad_s: 0` is ALREADY
   read correctly (`rbrNum` typeof, `:49828`; `Math.abs(0) = 0` at `:50497`) — the block is purely
   D1 (L₀ = 0 under decay-only never moves). No config change needed; what IS needed: (a) D1 lands;
   (b) the APPARATUS_CONTRACT deviation ruling (Checkpoint-A item B) authorising entry ω = 0 for
   S4/S5/S7 (and the sibling's states); (c) the ω₀ SLIDER floor 0.5 (`:49999`) stays — no control
   change; `rbrApplyParam`'s `!(value > 0)` guard on omega0 (`:50076–50078`) also stays.

3. **D3 `[NEEDS-0c-3]` — `alpha` and `tau` readout rows.** `RBR_RO_META` (`:50147–50154`) closes at
   six (I·ω·L·KE·dLdt·F_pull); `rbrRebuildReadout` skips unknown tokens in silence
   (`if (!meta) continue`, `:50162–50163`) — the rows MUST land before any JSON names them. Add:
   `alpha: { label: "α", unit: " rad/s²", dp: 2 }` and `tau: { label: "τ", unit: " N·m", dp: 2 }`,
   both SIGNED with a real Unicode minus (U+2212) on every text path (the FIXED
   `ascii_minus_in_oncanvas_math_from_tofixed` sweep discipline). Metrics exactly as §3: α =
   per-step (ω_k − ω_{k−1})/h on the 16 ms grid; τ = the signed authored schedule value at t. Both
   publish from the same post-step snapshot as I/ω; **both BLANK during re-pin blank windows** (the
   cross-cut finite difference is a spike, not a measurement). The existing `dLdt` row is NOT an
   acceptable substitute — it prints L-language this concept must not show (ledger §10b).
   `readout_at_ms` (`:1047` [LIVE]) already gates per-row reveal — S1 uses it. Scriptable knobs:
   `readouts` list per state, reveal ms per row, `hold_glow` membership. Absent from a state's list
   ⇒ row not built (today's behaviour).

4. **D4 `[NEEDS-0c-3]` — a rendered DRIVE actuator.** The taught cause must be a rendered object
   (scars `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause`,
   `narration_attributes_an_effect_to_a_cause_the_model_does_not_contain`); the pad renders only the
   brake (`:50623–50631`). Build: a tangential force arrow at the drum rim (torque = force at the
   rim × R_drum — visually honest, and the wrench picture #5 will later formalise), label "drive",
   anchored at the rim, direction = drive sense, length through the existing bounded `rbrArrowLen`
   map (`:49829` — knee + soft saturation + min floor; a single arrow, no ratio pair, so the map's
   dynamic range is safe). Visibility follows the SOURCE like the pad's does (drive active ⇒ arrow
   on; release retracts it) — never a stray overlay (the 0c-1 stray-overlay lesson, `:50596–50606`).
   Element type registers in the exact-token list (`:50586–50592`); `deriveStateMeta` co-edited in
   the SAME change if reveal keys are added. Scriptable knobs: engage/release (shared with D1's),
   label text. Absent ⇒ no arrow, today's scenes unchanged.

5. **D5 `[NEEDS-0c-3]` — `tau_app` slider token.** `RBR_SLIDER_TOKENS` (`:49995`) and
   `controls_visible` (`:1051`) close at r|m|omega0|tau_brake|spin_dir — the explore state cannot
   expose the taught variable (Rule 31 explore-last fails). Add token `tau_app`: range [0, 2.0] N·m,
   **step 0.01** (1.53 and 0.60 must be reachable; note S6 also overrides tau_brake's default 0.92 /
   step 0.05 to 1.53 / 0.01 via the per-concept `config.slider_controls` path — [LIVE],
   `:50005–50014`, an authoring fact, not an engine change), default 1.53; live drag applies the
   signed drive along the current spin sense with a segment re-anchor exactly like tau_brake's
   (`:50079–50088`). Wire into `rbrApplyParam`, `rbrSyncSliderRow`, PARAM_UPDATE emit. Hidden rows
   keep their reserved slot (`visibility:hidden`, `:49991`, `:50137` [LIVE]). Absent from
   `controls_visible` ⇒ hidden as today.

6. **D6 `[NEEDS-0c-3]` — restart RUNS with per-run config overrides (S5).** The `restart` block
   (`:1033`, `:50544–50550`) re-seeds L and can flip spin, but cannot change r or re-enter from rest
   between runs. Extend: `restart.runs?: Array<{ at_ms: number; r_m?: number; omega0?: number }>` —
   at each scripted cut the engine re-poses the named fields in the blanked single frame and
   re-anchors through the ONE re-anchor point (`rbrRestartNow`, `:50050–50064`), so the re-pin cue
   can never be forgotten on the new path (Addendum C's own design intent). One cut in S5, no loop.
   The buy is scoped to a RUN SCRIPT up front, not one instant (scar
   `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant`).
   Scriptable knobs: per-run at_ms, r_m, omega0. Absent ⇒ today's restart behaviour.

7. **D7 `[NEEDS-0c-3]` — per-particle TANGENTIAL force arrows (S7 only).** The existing pull arrows
   are hard-set radial (`setDirection(−r̂)`, `:50693–50698`). Build a second small arrow family: one
   per mass, tangential (⊥ rod, in the drive sense), length ∝ m·r·α through `rbrArrowLen` (an equal
   pair by symmetry — no ratio distortion; 0.80 N clears the min floor with margin), label `m·r·α`,
   revealed one-per-cue, riding the rotating masses. Registers in the exact-token list; labels
   decollided from the r-label hysteretically (scars `field3d_label_sprite_overlap`,
   `field3d_hard_threshold_label_decollision_pops_when_the_pair_separates`,
   `radius_scenario_F_r_label_kerning_collision`). Consumed by ONE advanced state — the smallest
   row; Desk E may sequence it last. Absent ⇒ nothing renders.

8. **D8 `[NEEDS-0c-3]` — timed formula reveal.** The formula surface is a STATIC per-state string
   set once at state apply (`:50570–50574`) — a timed reveal is not authorable (scar
   `skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static`
   — caught HERE, at design time). Minimum buy: `formula_at_ms?: number` (surface hidden until t,
   then shown whole, co-located with its defining sentence — Rule 25 satisfied; absent ⇒ shown from
   entry as today). An optional richer form (`formula_steps?: Array<{at_ms, text}>`) would serve
   S7's term-by-term assembly better — **decision delegated to Desk E, ONE semantics for the
   chapter**, because the sealed CoAM physics block (§3 S3/S7: "formula_surface assembles") already
   ASSUMES assembly the frozen engine does not provide — the same shared-field scar again; reconcile
   both consumers in one buy. S4/S7 here are authorable under the minimum buy (S7's assembly
   downgrades to a sentence-synced whole-formula reveal, with the D7 arrow reveals carrying the
   build).

9. **D9 `[LIVE]` inventory consumed as-is (verified this session):** apparatus + continuous spin +
   single-frame state re-pose (`applyRigidBodyRotationState` rebuilds the whole engine record,
   `:50481–50557`) · chip reference_marks on the ω readout row with match latch + co-glow
   (`:1021–1030`, `:50165–50176`; surface 'omega' is in the closed enum — **no α/θ mark surface is
   needed by this design, deliberately: both predictions land on ω**) · brake machinery complete for
   S6 (pad translate + engage/release cues + rest clamp + slider, `:50519–50527`, `:49927–49943`,
   `:50623–50631`) · per-concept slider spec override (`config.slider_controls`, `:50005–50014`) ·
   `readout_at_ms` (`:1047`) · `hold_glow` (`:1048`) · `phases[]` glow-focal scheduling
   (`:50647–50657`; ONE focal at a time by construction) · re-pin cue + blank (`:50050–50064`,
   `RBR_DEF_BLANK_MS` 500 ms) · Cambria-Math formula surface + value-only HUD (`RBR_MATH_FONT`,
   Rule 34b) · exact-token visibility with apparatus always-on (`:50581–50631`) · Rule-37 sandbox
   free-run + trusted-drag seize (`:50106–50126`) · default camera framing (`:50470–50477` — no
   camera solve authored; every state stays in the default frame) · fixed-grid θ, accumulator-free
   time (`:49952–49976`, `:969–976`). NOT consumed (authored off in every state): L arrow, grip
   hand, pull arrows, F_pull/L/KE/dLdt readouts, ke_bar, idle_auto_sweep, param_ramp, spin_dir
   control.

**Findings for the office (dispatching session copies to `_engine/findings_d.md`):**
- **F-a (correction to the desk state file):** `theta0_rad` is not fully inert — it is read at
  `:50499` and seeds `rbrThetaAt`'s grid integration (`:49958`, `eng._th = eng.theta0`), so it
  already poses the initial ANGLE. What is missing for #4 is any θ/α display surface and the
  kinematics readouts. The sibling skeleton should verify against these lines, not the "declared
  but inert" summary.
- **F-b (legibility, decision requested, non-blocking):** under a held max drive in S8, ω grows
  without bound (τ 2.0 on I 3.06 for 60 s ⇒ ω ≈ 41 rad/s — visual strobe on a 60 Hz canvas). The
  physics is correct and the teacher holds the brake; options: (i) accept (recommended — matches
  the CoAM corner-case posture), (ii) a soft visual treatment at high ω. No engine work assumed.
- **F-c:** Checkpoint-A item B (entry ω = 0) verbatim.
- **F-d:** D8's shared-semantics note — CoAM's sealed physics block assumes formula assembly the
  frozen engine lacks; reconcile once, chapter-wide.

### Per-state × engine-row WALK (both directions)

| State | Consumes |
|---|---|
| S1 | D3 (α/τ rows), D9 (spin, readout_at_ms, hold_glow) |
| S2 | D1 (drive), D3, D4 (arrow), D9 (cues, phases) |
| S3 | D1 (release), D3, D4 (retract), D9 |
| S4 | D1, D2 (rest entry), D3, D4, D8 (formula_at_ms), D9 (chip + match latch, r-line) |
| S5 | D1, D2, D3, D4, D6 (run script), D9 (chips ×2, re-pin cue) |
| S6 | D3, D9 (brake pad + cues + rest clamp + slider override, drum line + r line) |
| S7 | D1, D2, D3, D4, D7 (F_t arrows), D8, D9 |
| S8 | D1 (live drive + net tug), D3 (blank on restarts), D4, D5 (tau_app token), D9 (sliders, seize, Rule-37 free-run) |

Reverse: D1 ← S2,S3,S4,S5,S7,S8 · D2 ← S4,S5,S7 · D3 ← all · D4 ← S2,S3,S4,S5,S7,S8 · D5 ← S8 ·
D6 ← S5 · D7 ← S7 · D8 ← S4,S7 · D9 ← all. Every D-row claimed by ≥1 state ✓; every state claims
≥1 row ✓; every primitive named in §3/§4/§10(b) maps to a D-row or a cited [LIVE] surface ✓.

**Contract-shape check (scar `state_added_at_review_outruns_the_config_contract_shape`):** every §3
state is expressible as ONE `rigid_body_rotation` config object under the 0c-3-extended shape
(entry pose + torque schedule + readouts + marks + optional runs — checked state by state; none
needs a second timed mechanism beyond the scoped buys).

---

## SCAR AUDIT

**Queries run (2026-08-04, LIVE table via Bash):**

```
query_engine_bug_queue.ts --owner alex:architect        → 63 unique bug_class
query_engine_bug_queue.ts --row-type directive          → 83 unique bug_class
query_engine_bug_queue.ts --field3d --open              → 85 unique bug_class
query_engine_bug_queue.ts tau_eq_i_alpha                → 0 rows (not yet authored — expected)
query_engine_bug_queue.ts rigid_body_rotation           → 1 row (inside the directive set; row 33 below)
```

**Superset discipline:** the three list queries' `bug_class` strings were extracted, deduplicated
(**157 unique rows**) and diffed mechanically against this document — every row appears below
VERBATIM with an explicit verdict; nothing inside the declared boundary is silent, and no
dispositioned row lies outside the query union (scar
`scar_audit_claims_a_coverage_boundary_it_did_not_enumerate`, executed per its own PROBE). The
universe GREW from the CoAM REV-4 audit's 77 (the ch6/rolling desks filed new rows); where a
verdict is unchanged from that audit on the identical apparatus/engine, it says so briefly. Not
queried: nothing beyond the five commands above.

**Complete disposition table (157 rows; B = binds this design, B-sat = satisfied where named,
0c-3 = binds the engine build, 0d = binds the authoring/registration/EYE stage, PA = physics_author,
N/A = with reason):**

| # | bug_class (verbatim) | Verdict |
|---|---|---|
| 1 | `archetype_live_tier_unverified_against_renderer` | B-sat — every [LIVE] claim cites file:line verified this session (header, §3, D9); D-rows carry no live claim |
| 2 | `architect_authors_a_force_triangle_whose_ratio_exceeds_the_renderer_arrow_maps_dynamic_range` | B-sat — D4 single arrow, D7 equal pair; no ratio pair; bounded `rbrArrowLen` cited `:49829` |
| 3 | `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | B-sat — every limit quotes BOTH the type decl and the reader (`:1023`+`:50165`; `:1051`+`:49995`+`:50128`; `:50147`+`:50162`; `:49937`+`:50518`; `:50497`+`:49828`); the override path found and USED (`config.slider_controls`, `:50005–50014`) |
| 4 | `architect_reuses_a_marker_mechanism_without_diffing_the_side_effects_its_presence_switches_on` | B-sat — chip renders inline in its readout row only (`:50165–50176`); pad visibility follows source+τ (`:50623–50631`), so τ_brake-0 states never show a stray pad |
| 5 | `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` | B-sat — `rigid_body_rotation` queried; its 1 row = #33 |
| 6 | `authored_beat_ends_by_undoing_the_state_own_claim` | B-sat — §3 beat-termination contract; S2's non-terminating climb declared as the claim itself |
| 7 | `authored_lumped_constant_inconsistent_with_the_drawn_apparatus_geometry` | B-inherited — CoAM REV-4 P2-6 plausibility check governs the identical apparatus; no new lumped constant |
| 8 | `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state` | 0d — json_author: state glow_focal only where no sentence glow bound (§10b note) |
| 9 | `biot_single_element_states_static_pose` | N/A (biot) — no-static-state principle = §3 archetype audit |
| 10 | `biot_state6_dotcross_lesson_not_rendered` | N/A (biot) — narrated-construct-must-render = walk table + D4/D7 |
| 11 | `biot_state8_db_arrow_not_scaled_by_contribution` | N/A (biot) — S7's arrows equal BECAUSE contributions equal (symmetry), stated |
| 12 | `CACHE_UPSERT_CONFLICT_TARGET_MISSING` | 0d — serving/cache path at registration |
| 13 | `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` | N/A-by-design — no camera solve authored; default framing every state (`:50470–50477`) |
| 14 | `caption_clipped_by_adjacent_stat_box` | 0d — zones distinct per §10(h) |
| 15 | `capture_frozen_frame_ignores_its_own_poll_result_and_photographs_off_pin` | 0d — EYE tooling |
| 16 | `chemistry_concept_id_collides_with_rostered_physics_id` | B-sat — namespace check in header |
| 17 | `close_camera_framed_extent_is_authored_as_the_run_length_and_omits_the_body_radius` | N/A — no close-camera state; rotation in place inside the default frame |
| 18 | `closed_enum_cannot_name_a_substance_the_design_teaches` | **B — the desk's founding row:** the closed readout enum cannot name α/τ; answered by D3; the design refuses to author around it (header guardrail) |
| 19 | `concept_ships_zero_narration_glow_bindings` | PA/0d — physics block binds sentence→glow per state |
| 20 | `concept_taught_its_own_quantity_without_the_canonical_picture` | B-sat — S4/S5 are the canonical torque-spins-up-a-resting-body picture (enabled by D1/D2) |
| 21 | `contact_detected_slow_window_arms_one_frame_late_and_buries_the_body_at_full_dt` | N/A-with-adoption — no contact detection; discrete event times computed at the 16 ms grid (pin table) |
| 22 | `contrast_ghost_coresident_with_the_real_set_fuses_both` | B-sat — no ghosts; S5's comparison is sequential runs + a static chip |
| 23 | `cyclotron_timers_sliders_fullscreen_button_corner_collision` | B-sat [LIVE] — rbr top overlay at `top:52px` (`:50459`); panels bottom-anchored |
| 24 | `deferred_enum_members_must_be_declared_not_merely_unimplemented` | B — every 0c-3 field ships IMPLEMENTED under this spec; no new inert declarations; the one formerly-"implemented" member (`applied_torque_Nm`) re-specified honestly (D1) |
| 25 | `derivation_principle_applied_to_one_beat_but_not_its_sibling` | B-sat — the rendered-cause principle applied at EVERY torque event: D4 arrow in S2/S3/S4/S5(both runs)/S7/S8, pad in S6, both in S8 |
| 26 | `derived_energy_sum_pairs_prestep_position_with_poststep_velocity` | B → D3 — one post-step snapshot per frame for I/ω/α/τ; probe carried into D3 |
| 27 | `derived_readout_asserted_by_value_without_defining_its_metric` | B-sat — §3 metrics defines all four rows incl. α's finite-difference metric and its honest explore-case divergence |
| 28 | `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl` | 0c-3 — rbr keys landed at 0c-1; D4/D7/D8 co-edit deriveStateMeta in the SAME change if reveal keys added |
| 29 | `directive_no_gate_asks_whether_a_teacher_could_use_it` | B-sat — teacher-usability walk (§10), incl. the τ_net tug |
| 30 | `ecp_glow_targets_missing_primitives` | 0d — glow-target set ⊆ built ids (§10b) |
| 31 | `energy_layer_two_body_groups_stack_vertically_so_a_bar_height_compare_is_not_side_by_side` | N/A — nlb energy layer; no bars here |
| 32 | `engine_extension_replaces_a_shared_constant_without_an_absent_field_fallback_clause` | B-sat — every D-row carries its absent-field clause |
| 33 | `engine_stash_on_shared_renderer_reverts_concurrent_session_uncommitted_work` | 0c-3 process row for Desk E — this desk never edits the renderer (guardrail 5); carried into the dispatch brief |
| 34 | `explicit_linear_drag_is_unstable_at_the_damping_a_legible_settle_requires` | B-sat — constant-magnitude torques only, closed form, no drag; its fold probe adopted verbatim in D1(b) |
| 35 | `explore_controls_not_ring_gated_survive_the_ring_cut` | B-sat — min_ring gating, both cuts walked (§3) |
| 36 | `explore_state_formula_surface_asserts_a_relation_no_state_derives` | B-sat — S8's τ = Iα stated by S4 (core) under every preset |
| 37 | `eye_dense_frames_are_never_hashed_so_a_frozen_state_passes_31_of_31` | 0d — EYE reads dense frames (pin-table note) |
| 38 | `eye_h2_baseline_nondeterministic_electric_potential_meaning_state6` | N/A — another concept's baseline record |
| 39 | `eye_h2_frozen_frames_of_moving_elements_wobble_sub_perceptually_so_zero_percent_is_not_a_valid_gate` | 0d — EYE tooling |
| 40 | `eye_motion_map_reads_cached_physics_config_which_holds_only_epic_l_path` | 0d — EYE session |
| 41 | `field3d_arrow_label_sprite_renders_at_under_half_the_body_label_glyph_height` | 0c-3 — D4/D7 label sizing note |
| 42 | `field3d_build_once_body_reads_a_per_state_flag_from_the_union_def_and_mis_renders_silently` | 0c-3 — D4/D7 are visibility-toggled overlays built once, never per-state mesh branches (stated) |
| 43 | `field3d_dt_accumulated_motion_invisible_to_eye_timepin` | B-sat [LIVE] — rbr accumulator-free (`:969–976`); D1 preserves closed form |
| 44 | `field3d_focal_glow_pulse_phase_reads_absolute_time_so_frozen_h2_jitters` | 0c — engine-wide glow row; noted |
| 45 | `field3d_formula_overlay_generic_not_cambria_math` | B-sat [LIVE] — `RBR_MATH_FONT` surface (Rule 34b) |
| 46 | `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` | B-sat [LIVE] — rbr exact-token registry, apparatus always-on (`:50581–50592`); D4/D7 register their tokens there |
| 47 | `field3d_hanging_body_gravity_sign_inverted_vs_own_axis` | B-adopted — every closed-form checksum executed numerically (§2 cross-checks) |
| 48 | `field3d_hard_threshold_label_decollision_pops_when_the_pair_separates` | 0c-3 — D7 label decollision hysteretic |
| 49 | `field3d_integrating_scenario_state_entry_must_rebuild_the_whole_engine_record` | B-sat [LIVE] — `applyRigidBodyRotationState` rebuilds `eng` wholesale (`:50486–50512`) |
| 50 | `field3d_label_sprite_overlap` | 0c-3 — drive/F_t/r/R_drum labels decollided (D4/D7) |
| 51 | `field3d_measured_overlay_fit_runs_once_against_a_sibling_blanked_on_entry` | 0c-3 — S4/S5 chips appear mid-state; any position measured against them re-measures per frame, churn-guarded |
| 52 | `field3d_newtons_laws_body_surface_slab_cannot_be_hidden_for_a_both_hanging_atwood_state` | N/A — nlb apparatus flag |
| 53 | `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` | B-checked — S7's pair equal (no ratio); 0.80 N and the drive arrow clear the floor via the knee map (`:49829`); F_pull arrows unused |
| 54 | `field3d_nlb_body_label_overlaps_the_pulley_mesh` | N/A — nlb |
| 55 | `field3d_nlb_body_screen_anchor_lands_under_the_dom_slider_panel` | 0c-3 layout note — D4 arrow anchors at the rim, clear of the bottom-right panel |
| 56 | `field3d_param_ramp_authoring_contract` | N/A-by-design — NO param_ramp authored anywhere (declared §3); trivially satisfied |
| 57 | `field3d_particle_field_vestigial_dual_panel_config_gap` | 0d — registration (default_panel_count=1) |
| 58 | `field3d_per_state_slider_rows_collapsed_in_a_bottom_anchored_panel_make_shared_rows_jump` | B-sat [LIVE] — slot-preserving `visibility:hidden` rows (`:49991`, `:50137`); D5's row joins the same discipline |
| 59 | `field3d_pinned_rewind_reproduces_the_instant_but_not_the_last_float_bit` | B-inherited — closed forms throughout; D1 restates the requirement |
| 60 | `field3d_release_widens_ground_plane_per_state_causing_unnarrated_apparatus_jump` | N/A — one machine, no per-state apparatus growth |
| 61 | `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive` | B-sat — §4 names each belief's primitives (D3/D4/D6 + live chip) |
| 62 | `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` | N/A-checked — the rbr default frame centres the axle (`:50470–50477`); nothing off-centre authored |
| 63 | `field3d_sliders_panel_top12_vs_fsbtn_top10` | B-sat [LIVE] — rbr panels avoid the corner (`:50459`, `:50465`) |
| 64 | `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` | 0d — EYE reads pixels for D4/D7 labels |
| 65 | `force_rig_short_reveal_pin_below_catchup_threshold_keeps_prefreeze_jitter` | N/A — force_rig scenario |
| 66 | `force_rig_slider_panel_renders_full_height_when_one_row_visible` | N/A — force_rig; rbr panel sizes to built rows |
| 67 | `frozen_frame_read_as_dense_series_continuation_on_translating_body` | 0d — EYE reading discipline |
| 68 | `frozen_pin_unbudgeted_on_a_sequential_misconception_state_can_archive_the_wrong_picture` | B-sat — pin table budgets every sequential state; S5's pin archives the COMPLETED comparison |
| 69 | `galvanometer_family_motion_expectation_undeclared` | N/A — particle_field family |
| 70 | `ghost_compare_b_handoff_instant_snap` | B-sat — S5's cut is a blanked, cued restart (≥ 0.5 s), never a snap posing as physics |
| 71 | `ghost_compare_cause_invisible_slider_frozen` | B-sat — no idle sweep (no thumb to freeze); S6/S8 sliders sync live (`:50090–50097`) |
| 72 | `glow_focal_fr_ring_whiteouts_the_ring_and_occludes_it` | N/A — force-rig ring |
| 73 | `graph_title_caption_zorder_overlap` | N/A — no graph in any ring (§10 i-5) |
| 74 | `harness_source_grep_comment_strip_defeated_by_crlf_line_endings` | 0d — tooling |
| 75 | `hysteretic_state_cannot_be_latched_under_a_time_pin` | B — all torque schedules closed-form piecewise in state-local t (D1); the match latch replays as 0c-1 built it |
| 76 | `lesson_never_states_the_principle_it_is_named_after` | B-sat — S1 states, S4 shows-and-uses, S7 derives |
| 77 | `loop_dipole_couple_simultaneous_reveal` | N/A — loop_dipole; cause-first sequencing everywhere here |
| 78 | `loop_dipole_micro_claim_without_micro_visual` | N/A — Rule 33 N/A-justified (§3) |
| 79 | `magnetic_flux_loop_scenario_new_build` | N/A — precedent record |
| 80 | `mfl_loop_footprint_inverted_vs_theta` | N/A — mfl scenario |
| 81 | `named_primitive_declared_without_the_surface_that_can_render_it` | **B — the row that forces D3–D8:** every named primitive maps to a live surface or a D-row (walk table, both directions) |
| 82 | `narration_attributes_an_effect_to_a_cause_the_model_does_not_contain` | B-sat — D1 puts the drive IN the model; D4 renders it; the pad renders the brake |
| 83 | `narration_references_a_prerequisite_concepts_apparatus_that_is_not_on_screen` | B/PA — cliff patches reference only on-screen objects (Checkpoint-A table) |
| 84 | `narration_timing_probe_uses_a_speech_model_the_shipped_player_does_not` | 0d — validator row |
| 85 | `nlb_angle_arc_radius_overruns_the_neighbouring_lane_body` | N/A — nlb |
| 86 | `nlb_body_label_is_brighten_only_so_static_text_outranks_the_state_focal` | N/A — nlb; rbr glow discipline per §10(b) |
| 87 | `nlb_camera_rotated_body_label_bleed_through_slider_panel` | N/A — nlb |
| 88 | `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` | N/A — no checkpoints |
| 89 | `nlb_coupled_sandbox_F_slider_exceeds_string_tautness_bound` | N/A — no string; the one S8 range corner is F-b, flagged with a recommendation |
| 90 | `nlb_displacement_vector_is_single_body_so_a_compare_state_measures_only_one` | N/A-by-construction — S5's compare is sequential on one body with a chip-held reference, never two live bodies |
| 91 | `nlb_formula_and_readout_zones_are_fixed_css_and_collide_with_a_tall_hud` | 0c-3 layout note — this HUD is 4 rows (I/ω/α/τ), shorter than CoAM's 5 |
| 92 | `nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix` | N/A — nlb seam |
| 93 | `nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger` | B-analog-sat — the brake never reverses (rest clamp, `:49942`); the DRIVE legitimately grows ω and there is no work ledger to unwind (no bars) |
| 94 | `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` | B-sat — pin margins ≥ 167 ms from the LAST asserted event incl. ≤2-step discrete lag (pin table) |
| 95 | `nlb_lane_offsets_apply_to_declared_bodies_not_co_present_ones_so_sequential_phases_split_laterally` | N/A — single body, no lanes |
| 96 | `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` | B-sat-structurally — no looping state exists; every pin lands on a held or monotone frame |
| 97 | `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` | B-sat — archetype-discharge: every beat runs teacher-free (§3 audit) |
| 98 | `nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` | N/A — single body |
| 99 | `nlb_multibody_sandbox_wrap_reanchors_only_the_wrapping_body` | N/A — single body, no wrap |
| 100 | `nlb_overlay_ink_lift_is_bounded_to_the_families_whose_length_is_a_magnitude` | 0c-3 — D4/D7 are magnitude-length families; ink-lift bounding noted for the surgeon |
| 101 | `nlb_seized_slider_run_overruns_a_loop_sized_work_scale` | N/A-by-construction — no fixed-scale bar anywhere; HUD value-only |
| 102 | `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm` | B-analog-sat — r poses 0.20/0.50/0.80 strictly inside [0.15, 0.90] |
| 103 | `nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate` | N/A — no work bars |
| 104 | `nlb_work_bar_track_tops_lose_collinearity_when_a_3d_label_size_changes` | N/A — no work bars |
| 105 | `nlb_work_probe_globals_disagree_on_multibody_states` | N/A — single body, no work probe |
| 106 | `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` | B-sat — all formula surfaces symbolic; numbers only in HUD + chips the readouts meet |
| 107 | `optional_config_field_with_a_legal_zero_value_is_resolved_by_truthiness` | B-VERIFIED — `rbrNum` typeof-resolved (`:49828`): `omega0_rad_s: 0`, `tau: 0`, `at_ms: 0` all author correctly; D-rows bound to the same resolution (preamble) |
| 108 | `paired_skeletons_cite_each_other_by_state_number_across_a_renumbering` | B-sat — CoAM cited by content + REV; the sibling consumes D1/D8 BY NAME, never by state number |
| 109 | `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set` | **B — the headline:** 0c-1's "applied_torque_Nm = #7 with no extra code path" comment (`:947–949`) is false for the driving half; this skeleton is the correction and the 0c-3 scope statement |
| 110 | `phase0_union_lists_capabilities_but_never_which_knobs_are_scriptable` | B-sat — every D-row lists its scriptable knobs |
| 111 | `phase0_union_table_asserted_not_walked_state_by_state` | B-sat — walk table, both directions |
| 112 | `ppc_probe_points_primitive_new_build` | N/A — precedent record |
| 113 | `prior_rulings_and_internal_ledgers_are_not_re_run_over_the_states_a_restructure_creates` | B-declared — on any Checkpoint-A restructure, the ledger, pin table, walk table and this audit re-run over the new state set |
| 114 | `quantitative_check_state_reuses_the_exact_numbers_and_the_delta_cue_of_the_state_it_verifies` | B — designed against: S4 uses entirely fresh numbers (r 0.50 · I 1.50 · τ 0.60 · α 0.40 · ω 1.20), none of S2's; every delta cue distinct; S5-run-A's reuse of S2's τ/pose is declared CONTINUITY (the reference run), not verification |
| 115 | `radius_scenario_F_r_label_kerning_collision` | 0c-3 — D4/D7 label kerning vs the r-label |
| 116 | `ramp_endpoints_multiply_the_taught_variable_by_a_factor_no_rendered_string_claims` | B-sat — the 4.64× factor is narrated in S5 and legible in the held HUD pair + chip |
| 117 | `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` | B-sat — S2 ~8 words, S5 ~9 words, reserved in the §3 budgets |
| 118 | `review_site_build_is_stale_against_the_concept_under_review` | 0d — build discipline |
| 119 | `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls` | B — rewind claims cite terminating lines (`:49958`; anchor chain `:49915–49926`); D1's report must re-trace every call it touches |
| 120 | `rule31_motion_floor_satisfied_by_a_late_label_reveal_over_a_frozen_canvas` | B-sat — every state's motion is physical spin/climb/decay; no label-only state |
| 121 | `scar_audit_claims_a_coverage_boundary_it_did_not_enumerate` | B-sat — this table IS the mechanical superset diff (157/157, both directions) |
| 122 | `seam_r_ink_lift_reveals_sub_surface_force_arrows_fleet_wide_and_no_gate_reads_it_as_a_change` | N/A — nlb SEAM R |
| 123 | `shared_bar_scale_cross_state_guarantee_is_void_when_the_panel_reflow_ladder_drops_a_step` | N/A — no bars, no shared bar scale |
| 124 | `signed_engine_union_drops_items_its_own_state_table_still_consumes` | B-sat — REV 1 (no renumbering yet); the walk table binds both directions; any future renumbering shows the old→new mapping |
| 125 | `skeleton_anchor_specified_in_section_9_reaches_no_narration_line` | B-sat — anchors are state assignments with reserved words (S2/S5); physics block must carry the lines |
| 126 | `skeleton_asserts_a_held_comparison_value_at_an_instant_the_faster_body_has_already_passed` | B-sat-by-construction — the comparison value is HELD as a static chip (run A), never a fly-by of a moving body |
| 127 | `skeleton_authors_a_multi_phase_state_on_an_engine_with_no_per_body_activation_time` | B-checked — S5's phasing rides D6 (explicitly bought); all other timing uses the live engage/release pair (`:50522–50524`) |
| 128 | `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant` | B-sat — D6 scoped to a run SCRIPT up front; D1's engage/release is already a two-instant surface |
| 129 | `skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static` | **B — caught at design time:** the formula surface is static per state (`:50570–50574`); S4/S7's timed reveal rides D8, bought explicitly; all other timed overlays use live surfaces (`readout_at_ms`, mark `at_ms`, cues) |
| 130 | `skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal_inside_it` | B-sat — pin margins computed from the LAST asserted event per state |
| 131 | `solenoid_focal_primitive_on_title_not_physics` | 0d — glow focal on physics primitives, never titles |
| 132 | `solenoid_state3_annotation_orphaned_from_referent` | 0c-3 — D4/D7 labels anchored to their referents |
| 133 | `solenoid_state4_outside_fade_narrated_not_shown` | B-sat — no claim without a rendered agent/measurement (§10 d) |
| 134 | `solenoid_state5_gesture_sequencing_absent` | N/A — no hand, no gestures (RHR N/A by scope) |
| 135 | `solenoid_state7_hand_flip_unimplemented` | N/A — no hand |
| 136 | `spec_semi_implicit_euler_position_not_step_count_invariant` | B-sat [LIVE] — θ on the fixed grid (`:49952–49965`); D1 preserves; fold probe D1(b) |
| 137 | `state_added_at_review_outruns_the_config_contract_shape` | B-sat — contract-shape check after the walk table |
| 138 | `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` | 0d/B-noted — §10(b): scene focal (drive arrow) and instrument hold-glow (ω row) ride separate channels, so cause and effect are never mutually dimmed |
| 139 | `symbol_printed_on_canvas_before_the_lesson_defines_it` | B-sat — §10(b) ledger with DEFINED/PRINTED columns; `readout_at_ms` enforces S1's ordering |
| 140 | `taught_delta_smaller_than_the_instruments_own_live_noise` | B-sat — α is piecewise-constant and exact on the grid (zero noise); taught deltas full-scale; the one noisy instant (a cut) is BLANKED (D3) |
| 141 | `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` | B — forces D4; α's correlate is the visibly quickening/slackening spin read against the constant cause |
| 142 | `teach_auditor_reads_field3d_sliders_from_config_not_scene_composition` | 0d — the audit reads `field_3d_config` + frames |
| 143 | `teach_color_each_element_by_its_own_sign` | B/PA — signed α/τ digits take the chapter sign-colours (cool for +, warm amber for −, CoAM convention), consistent across S6/S8; no L arrow here to colour |
| 144 | `teach_concrete_before_abstract_compare` | B-sat — qualitative S1–S3 precede the equation (S4); anchors land ON their ahas |
| 145 | `teach_coordinate_sim_with_graph` | N/A — no graph (deliberate, §10 i-5; WILL bind the #4 sibling) |
| 146 | `teach_distinct_reference_lines_for_two_radii` | B — S6 draws r (0.80) and R_drum (0.55) as distinct labelled lines (CoAM discipline inherited); elsewhere only one radius on screen |
| 147 | `teach_do_not_prespoil_a_later_reveal` | B-sat — L/KE/dLdt/F_pull never shown; Σ-form S7-only; negatives S6-only; no ω–t graph (belongs to #4) |
| 148 | `teach_field3d_explore_grab_and_move_field_point` | B-sat — S8 live drags on the taught variable (D5) and the shape variables |
| 149 | `teach_inverted_scenario_inverts_cutline_flags` | B-sat-applied — this concept surfaces α/τ (suppressed in the sibling's build) and suppresses L/KE/dLdt/F_pull (the sibling's owned rows); stated in §2 |
| 150 | `teach_read_dense_ramp_frames_not_just_frozen` | 0d/B — EYE reads dense frames across S2/S4/S5/S6 windows (pin-table note) |
| 151 | `teach_reveal_synced_to_narration` | B/PA — `readout_at_ms` + cues sentence-synced; carried to the physics block |
| 152 | `teach_show_quantity_live_when_named` | B-sat — α/τ/ω/I live whenever named (D3 from S1 onward) |
| 153 | `teach_visual_must_match_narration` | B — claim-by-claim audit at the physics block; dispatching session appends this concept to the OPEN row |
| 154 | `the_eye_passes_a_frame_in_which_one_compared_body_is_hidden_behind_another` | N/A — single body |
| 155 | `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` | B — D1's signed-τ semantics defined once, consumed by reference by `rotational_kinematics`; D8's semantics reconciled chapter-wide by Desk E (F-d) |
| 156 | `velocity_arrows_routed_through_a_force_arrow_map_collapse_their_ratio_and_cannot_draw_a_true_zero` | B-checked — no velocity arrows; D4/D7 are genuine forces on the force map; a zero drive HIDES the arrow (visibility), never draws a zero-length one |
| 157 | `verification_via_applystate_bypasses_player_false_hang` | 0d — verification drives the real player |

---

*Handoff: → founder-proxy **Checkpoint A** (cycle 1). On `DESIGN_OK`: the physics block for this
concept, then the sibling `rotational_kinematics` skeleton (which consumes D1/D3/D8 by reference and
adds the θ/kinematics rows). The dispatching session also: (1) copies findings F-a…F-d +
Checkpoint-A items A/B into `docs/loop_runs/rotmech/_engine/findings_d.md` for Desk E's 0c-3 scope
freeze; (2) appends `tau_eq_i_alpha` to the OPEN `teach_visual_must_match_narration` row at 0d.
NO concept JSON until the 0c-3 PR merges and this desk syncs.*
