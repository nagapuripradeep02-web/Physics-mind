# ARCHITECT SKELETON — `uniform_circular_motion`

**chapter:** Laws of Motion (Class 11) · **engine:** `force_rig`, `apparatus: "whirl"` (Branch B ONLY) · **worktree:** `C:\Tutor\physics-mind-lom-g` (`feat/lom-g-offaxis`)
**designed against:** `docs/loop_runs/lom_g/_engine/force_rig_json_contract.md` (as-built — authoritative), `docs/FORCE_RIG_ENGINE_SPEC.md` §2/§7, `docs/loop_runs/lom_g_state.md`
**downstream:** physics-author → json-author → quality-auditor → FOUNDER REVIEW (no founder-proxy on this tray)
**Phase-0 success criterion:** this concept requires **ZERO renderer edits**. Verdict of this design: **it does** — every state below is expressible in the built contract. No engine request is load-bearing.

---

## §0 — ENGINE FINDINGS (read before anything else)

Every beat wanted vs. what the contract can express. Nothing here requires a renderer edit; two items are ASSUMPTIONS that physics-author must measure, one is a disclosed display limit, one is a genuinely nice-to-have reported as a future engine request that this concept does NOT need.

### Finding 1 — the whirl `param_ramp` reveal pin is UNVERIFIED. ASSUMPTION declared, per instruction.

The contract states the `end_ms + 1600 ms` reveal pin **for branch A** ("the settle") and gives `release.at_ms → +1200 ms` as the only branch-B pin. It does not state the pin for a whirl `omega` ramp. **Assumed: `end_ms + 1600 ms` applies to whirl ramps too** (STATE_2 / STATE_5 / STATE_6 durations are budgeted on that assumption, with ≥1.4 s of slack after the assumed pin). physics-author must verify the real pin against `deriveStateMeta.ts` (whirl is registered — contract: "no edit needed for either branch") **before locking any duration**, and re-budget if it differs. This is a measurement task, not an engine request.

### Finding 2 — clamp behaviour under a `param_ramp` that drives ω below √(g/L) is UNVERIFIED. STATE_6 carries a declared fallback.

The contract documents the `ω²L > g` clamp for **slider writes** (engine clamps ω to `√(g/L)`, hangs the bob, hides the guide ring, snaps the handle back, shows the amber `ω min` row). STATE_6 (the advanced state) ramps ω **down through** the minimum and depends on the ramp path hitting the same clamp funnel — the cone visibly closing to θ = 0 and the bob hanging. Harness S5 proved the clamp for direct writes; whether `frApplyParam` under a ramp takes the same path is not on the record. **Fallback if it does not:** end the ramp at ω = 3.2 rad/s (just above ω_min = 3.13 for L = 1.00) so the cone closes to ~6° without entering the clamp, and the narration states the limit while the amber-row/hang demonstration moves to the explore state's slider (where the clamp IS proven honest). **Second fallback:** CUT STATE_6 entirely — it is the only advanced-ring state, so the rings stay coherent by construction. Neither fallback touches the renderer.

### Finding 3 — explore-state arrow saturation above the 58.3 N cap. DISCLOSED, accepted.

Slider extremes in the sandbox (m = 4.5, ω = 6.5, L = 1.40) produce T ≈ 266 N, far past the 58.3 N arrow cap, so the tension arrow's **length** saturates while the HUD numbers keep climbing honestly. This is the engine's documented magnitude band, not a defect; every **guided** state is authored inside the proportional band (largest authored T = 57.7 N, STATE_5 ramp end). The contract documents per-token `slider_controls` overrides under branch A; whether they bind to whirl tokens is unverified — physics-author MAY test tightening `omega` max to ~6.2 in the explore state, but **acceptance of saturation is the designed fallback**, and the narration-free sandbox makes no claim the saturated arrow contradicts. No engine request.

### Finding 4 — no teacher-triggered cut in the sandbox. Beat reframed; future engine request REPORTED, not needed.

The natural closing beat — "cut the string at any speed the teacher has dialled in" — is **not expressible**: `release` is an authored `at_ms` one-shot per state, and there is no trusted "cut now" operation. **Reframed:** the cut lives wholly in STATE_3 (replayable by re-entering the state, which replays the release via the E1 `frResetTrajectory` rewind), and the explore state has no cut. **Reported as a genuine future engine request** (a trusted release trigger, natural Professor-Pack verb for V2): this concept does NOT need it, and it must not be built for this concept (Phase-0 criterion; the runaway guard is at its tray limit).

### Finding 5 — the `a_c` readout is deliberately UNUSED. Scope boundary, not an engine finding.

`readouts` offers `a_c`, but the kinematic derivation `a = v²/r` belongs to the catalog atomic `centripetal_acceleration_kinematic` (Topic 10 A5 — not shipped). This concept is the **force-side** hub (A7+A10 core claim). Using the `a_c` readout without teaching it would put an untaught symbol on screen (Rule 25). It stays off in every state.

### Engine bug queue consultation

No live DB access needed: the tray mirror `docs/loop_runs/lom_g/_engine/scar_candidates.sql` (**applied 2026-08-01 — archival record, 11 rows**) was read in full. Architect-relevant rows and how this skeleton satisfies them:
- **Candidates 1/8 (arrow collinear with apparatus line — FIXED, recurrence class, `uniform_circular_motion` in `concepts_affected`):** the whirl tension arrow lies along its own string in EVERY state of this concept. The mesh-shaft fix (`7c6bbb3`) shipped, but the EYE brief must re-verify on the WHIRL branch specifically (the fix was frame-verified on the table): shaft distinguishable from `fr_wstring`, tip proportional, at flat AND conical geometries. FLAGGED to quality-auditor/eye-walker.
- **Candidate 9/10 (arrow overrun / framing — FIXED):** largest authored guided-state T = 57.7 N against the 58.3 N cap-by-construction — inside the containment the fix guarantees. Explore saturation disclosed in Finding 3.
- **Candidate 3 (camera target not authorable — OPEN):** accepted as a design constraint; the whirl rig self-centres on the origin (build note 7) and this skeleton authors ONE camera `[0, 3.4, 9.2]` for every state (Rule 32d — no cuts), declining the contract's "a conical state can come closer" offer to keep home-pose continuity absolute.
- **Candidates 2/4/5:** renderer-internal directive / probe-definition / regression-sample rows — no authoring surface.
- **Tray-state D5 note:** the whirl is the concept the D5 motion gate exists for, and D5 is currently dark fleet-wide pending the founder's platform call. Until that lands, eye-walker must judge motion from the dense frames BY EYE (md5-distinctness + adjacent-pair diffs), exactly as the E1 verification did. FLAGGED in the EYE brief.

**DC Pandey / NCERT check:** consulted NCERT Class 11 Ch.4 §4.11 + Ch.5 §5.9 chapter placement and the DC Pandey Ch.10 table of contents (via the repo's own catalog docs) **for scope only** — confirming uniform circular motion + centripetal force + conical pendulum sit here, and banked road / vertical circle are separate atomics (founder scope decision matches the catalog's A13/A14/A17 split). **No teaching sequence, no example problem, no figure, no phrasing imported.** The catalog's Indian-context anchors (Buddh Circuit, Indian fairs) are **pre-Rule-35 and NOT used**.

---

## §1 — ATOMIC CLAIM

**This concept teaches that a body moving in a circle at constant speed is not in equilibrium — it needs a net force pointing at the centre at every instant, and that force is not a new kind of force but a real force (here, the string's tension, or the tension's horizontal component) already doing that job — and only that.**

It does **not** cover: the kinematic derivation `a = v²/r` (→ `centripetal_acceleration_kinematic`, Topic 10 A5, not yet shipped — Finding 5), car on a level or banked road (→ A12/A13/A14, deliberately out per founder decision), vertical circular motion (non-uniform; taught after work–energy — founder decision), centrifugal force as a rotating-frame tool (→ A26; this concept shows only that **no outward force exists in the ground frame**), angular kinematics θ/ω/α as a system (→ A1–A3), or period/frequency formal treatment.

---

## §2 — STATE COUNT + ARC

**7 states: 6 guided + 1 explore.**

**Justification (Rule 11, complexity-driven):** upper-medium. The core claim has three teachable faces — (a) circling at constant speed still needs a continuous inward pull (the velocity direction is always changing); (b) that pull is quantitative, `T = mω²r`; (c) when gravity joins (conical), the SAME tension does the inward job with one component while its other component balances weight — plus one Rule-16a beat that is the whole misconception payload (the cut), and one honest boundary (`ω²L ≥ g`) that the founder explicitly asked to be given an honest yes/no. The engine offers exactly six distinct honest pictures-in-motion (steady flat orbit · flat ω-ramp · release · steady cone · cone-opening ramp · cone-collapse ramp) plus the sandbox; 7 is the count at which no state is derivable from the previous ones and an 8th would repeat a picture. The `ω_min` question is answered **YES, one state** (STATE_6): the collapse of the cone at low spin is a distinct rendered idea (`cos θ ≤ 1` made visible), not a re-run of STATE_5 — and it is ring-fenced as the single advanced state so every reduced cut survives without it.

| # | Purpose (one line) | teaching_method |
|---|---|---|
| STATE_1 | Circling at constant speed: velocity is tangent and always turning; the string pulls inward the whole time | *(straightforward motion beat — Rule 31)* |
| STATE_2 | The inward pull is quantitative: spin faster and T = mω²r grows with the square | straightforward motion beat |
| STATE_3 | **Cut the string** — the ball leaves along the tangent, straight, at unchanged speed; no outward force exists | straightforward motion beat |
| STATE_4 | Gravity joins: the string tilts, and one tension has two components — vertical balances weight, horizontal points at the centre | straightforward motion beat |
| STATE_5 | Spin faster and the cone opens exactly as cos θ = g/(ω²L); the string approaches horizontal but never reaches it | straightforward motion beat |
| STATE_6 | Below ω = √(g/L) there is no cone: cos θ would have to exceed 1, so the bob just hangs | straightforward motion beat |
| STATE_7 | Explore — spin, length and mass all live; the ω_min clamp is honest at the slider | `exploration_sliders` |

**No `narrative_socratic`. No `wait_for_answer`. No `pause_after_ms`.** (Rule 31.)

---

## §3 — PER-STATE CHOREOGRAPHY + CONTROL PLAN (Rule 31 — the required first design artifact)

### Archetype vocabulary on this engine

The whirl offers exactly four honest motion drivers: (i) steady constrained revolution; (ii) `param_ramp` on ω (the ONLY rampable whirl token); (iii) `release` (constraint removal); (iv) teacher drag. Coined archetypes, with the required justification, and every repeat declared as a contrast pair whose delta names the flip:

| Archetype | Definition | Used in |
|---|---|---|
| `orbit-steady` | the bob sweeps its circle at constant ω; the force/velocity arrows rotate with it, lengths constant | **STATE_1 / STATE_4 — declared contrast pair** (flip: flat plane carries the weight vs. the tilted string carrying both jobs) |
| `spin-ramp-lengthen` *(coined)* | ω ramps up on FIXED geometry; the picture's change is an **arrow lengthening** (T) and the bob visibly quickening — the circle itself does not change | STATE_2 |
| `release-tangent` *(coined)* | the constraint is deleted mid-revolution; the bob departs **straight along the tangent** with the abandoned circle held as a dim ghost | STATE_3 |
| `cone-opening` *(coined)* | ω ramps up and the **apparatus shape** changes — θ opens, the swept circle widens and rises | **STATE_5 / STATE_6 — declared reversal pair** (flip: ramp DOWN, the cone closes through θ = 0 and the bob hangs) |
| `cone-collapse` *(coined)* | reversal member of the pair above | STATE_6 |
| `drag-sandbox` | teacher-driven | STATE_7 only |

**Honest disclosure for the auditor (the Phase-1 lesson applied):** STATE_2, STATE_5 and STATE_6 all use the ω-ramp *driver*. They are separated by which object carries the change — STATE_2: fixed circle, growing **arrow** (flat, θ does not exist); STATE_5: opening **apparatus angle** (the taught object is θ, and T's growth is the supporting readout); STATE_6: the apparatus angle closing to **zero and the motion ending** (the taught object is the boundary). Each state proves something the previous ones do not: S2 proves the ω² law on a clean geometry; S5 proves the SOLVED angle law (a different equation); S6 proves that equation's domain edge. If the auditor judges S6 too thin, the fix is Finding 2's second fallback (cut S6), not a sixth archetype.

### The control table

| State | Teaches (one aspect) | Archetype | Delta line (= the ≤5-word on-canvas cue) | Distinct motion — what animates | `controls_visible` | Narration (EN words) | Duration | `depth_ring` | `advance_mode` |
|---|---|---|---|---|---|---|---|---|---|
| **STATE_1** | Constant speed is not constant velocity: the velocity arrow turns every instant, and the string supplies a continuous inward pull | `orbit-steady` | **"Tension pulls inward, always"** | Bob circles the flat plane at ω = 3.0 (period 2.1 s — ~4 full revolutions); the tangent velocity arrow sweeps continuously; the tension arrow tracks bob→anchor at fixed length; HUD `v` holds steady while the arrow's direction never stops changing | `[]` | 32–42 | 11 s | core | `manual_click` |
| **STATE_2** | The inward pull grows with the SQUARE of the spin: T = mω²r | `spin-ramp-lengthen` | **"Faster spin, larger tension"** | ω ramps 3.0 → 6.0 over 8 s (cause: the bob visibly quickens first); the tension arrow lengthens 13.5 → 54.0 N in step; the circle itself does not change | `["omega"]` *(V-flag: if the handle does not track the ramp, author `[]` — the sibling's V3)* | 30–42 | 13 s | core | `manual_click` |
| **STATE_3** | **PRIMARY AHA + Hook 1.** With the string cut there is no inward force — the ball travels straight along the tangent at unchanged speed. Not outward: no outward force exists | `release-tangent` | **"Cut: straight along tangent"** | Slow heavy orbit (m = 4.0, ω = 1.8, T = 12.96 N — the contract's own cut band) for 3–4 revolutions; at ~1.4 s before timeline end the string is cut; the bob departs dead straight, the trail draws the line, `ghost_circle` holds the abandoned circle dim; HUD `v` reads the SAME number before and after; `T` drops to 0. Frozen final frame = straight trail leaving the ghost circle tangentially | `[]` | 38–50 | ~17 s *(= narration length; release at duration − 1400 ms — physics-author computes from measured narration)* | core | `manual_click` |
| **STATE_4** | Gravity joins: the tilted string's ONE tension has two components — vertical balances mg, horizontal is the net inward force | `orbit-steady` **(pair member 2 — flip: the plane is gone; the string tilts to θ = 52° and the resultant ΣF is horizontal, pointing at the axis)** | **"Tension splits: vertical and inward"** | Conical pendulum at ω = 4.0: bob sweeps the tilted circle (r = 0.79 m); tension (24.0 N, along string), weight (14.7 N, down) and resultant ΣF (horizontal, inward) arrows all track the revolution; θ readout holds 52.2° | `[]` | 34–46 | 12 s | extended | `manual_click` |
| **STATE_5** | **Hook 2.** The cone angle is solved, not chosen: cos θ = g/(ω²L). Faster spin opens the cone — toward horizontal, never reaching it | `cone-opening` | **"Faster spin opens the cone"** | ω ramps 3.4 → 6.2 over 9 s; θ opens 32° → 75°, the swept circle widens and rises, T climbs 17.3 → 57.7 N (inside the 58.3 N cap); at the ramp's end the string is still 15° short of horizontal with T near the apparatus maximum | `["omega"]` *(same V-flag as STATE_2)* | 36–50 | 14 s | extended | `manual_click` |
| **STATE_6** | The law has an edge: cos θ ≤ 1 forces ω ≥ √(g/L). Below the minimum spin there is no cone — the bob hangs | `cone-collapse` **(pair member 2 — flip: ramp DOWN through ω_min = 3.13; the cone closes to θ = 0 and the revolution ends)** | **"Too slow: no cone"** | ω ramps 4.5 → 2.6 over 8 s; θ closes 61° → 0°; at ω_min the guide ring disappears, the bob hangs vertically and the engine's amber `ω min = 3.13 rad/s` row shows *(clamp path under a ramp = §0 Finding 2; fallback authored there)* | `["omega"]` | 30–42 | 13 s | **advanced** | `manual_click` |
| **STATE_7** | Explore | `drag-sandbox` | **"Change spin, length, mass"** | Conical, ω = 4.0 defaults; every slider drag re-seeds the constraint live; the whirl never freezes (Rule 37); the ω slider driven below 3.13 hits the honest clamp (handle snaps back, amber row) — the founder-named explore beat | `["omega","L","bob_mass"]` | 0 / open | 0 (open) | core | `interaction_complete` |

**Rule 15 check:** `manual_click` × 6 + `interaction_complete` × 1 = 2 distinct modes. ✓
**Advanced-ring contiguity (38a):** STATE_6 is the single advanced state, immediately before the explore state. ✓

### Rule 32 legibility plan

- **32a cause before effect.** S2/S5/S6: `start_ms` ≥ 1000, and the bob's own speed change is the visibly-first cause; the arrow length / cone angle responds through the integrator (the whirl is velocity-Verlet + SHAKE, so the response is physically lagged, never scripted-simultaneous). S3: the cut is the cause; the ghost circle persisting while the trail departs is the readable beat.
- **32b only the taught variable moves.** One ramped parameter per state (ω or nothing); m and L never change inside a guided state. S1/S4 ramp nothing — the constrained revolution is the motion. S7 exempt.
- **32c delta cue.** The Delta column above IS the on-canvas caption verbatim (Rule 34a).
- **32d home pose, no teleport.** Anchor, string, bob persist in every state. The ONE apparatus change — the flat plane removed between S3 and S4 — is a **declared, narrated change** ("now take the table away and let the ball hang"), and it is also the concept's structural hinge (gravity enters exactly there). Camera `[0, 3.4, 9.2]` on **every** state; the contract's closer conical framing is declined (§0, scar candidate 3 note). The whirl rig self-centres on the origin by construction.
- **32e one glow focal.** Per state: `fr_w_velocity` / `fr_w_tension` / `fr_bob` (the trail is dim-exempt by build) / `fr_w_resultant` / `fr_wstring` / `fr_guide_ring` / `fr_bob`.

### Rule 34 canvas budget

- ONE formula surface each (`formula_overlay`, Cambria Math — the engine authors no text, the concept supplies it): S1 **none** (deliberate — the opener is purely qualitative; the first formula arrives with S2) · S2 `T = m ω² r` · S3 **none** (deliberate — the picture IS the argument; a formula under the cut would compete with the trail) · S4 `T cos θ = mg` · S5 `cos θ = g / (ω²L)` · S6 `ω ≥ √(g/L)` (advanced ring — still algebra) · S7 `T = m ω² L` (**core-ring only, Rule 38b** — established in S2 with r = L; note it holds exactly on the cone too, which physics-author may use in S5's narration).
- Caption = the ≤5-word delta cue only; prose in the strip below. HUD value-only (`T = 24.0 N`, `θ = 52.2°`, `v = 3.00 m/s`), clear of chrome (`top: 52px`+). All math Unicode (`ω θ ² √ Σ °`), swept across all three text paths.

### Rule 33 macro↔micro

**Declared N/A for 33a–33c** (the taught variable and its mechanism are the same macroscopic level — a bob and a string). **33d binding:** every state carries live numeric readouts that track the physical change (T, v, ω, r, θ per table); STATE_3's `v` readout holding its value through the cut is itself an instrument-as-argument.

---

## §4 — MISCONCEPTION CONFRONTATION PLAN (Rule 16a)

**Two hooks, both at genuine pivots. Five states carry NO `misconception_watch`.** No EPIC-C branches (EPIC-L-first directive).

### Hook 1 — STATE_3 · *the founder-fixed beat, the one the apparatus PROVES*

- **belief:** "A whirled object is flung outward — cut the string and it flies away from the centre along the radius."
- **contrast beat (straight, no predict-pause):** the ball circles slowly, with only ONE force arrow ever on screen — inward. The string is cut. The ball leaves **straight along the tangent** at unchanged speed; the dim ghost circle stays so the departure is visibly NOT along the circle and visibly NOT outward. **No outward force is drawn or named at any point, before or after, because none exists** (harness S8: zero centrifugal terms, largest outward radial arrow component 0.000). The straight line is the integrator's output, not an instruction (Phase-0 build note).
- **visual_counter:** the straight tangent trail against the abandoned ghost circle, with `v` reading the same number before and after the cut and `T` reading 0 after.
- **one_line_fix:** "Nothing throws the ball outward — with the pull gone it keeps its velocity, straight along the tangent."

### Hook 2 — STATE_5 · *the solved-angle pivot*

- **belief:** "Spin fast enough and the string will rise to horizontal, with the bob level with the pivot."
- **contrast beat:** the wrong expectation is driven toward, hard: ω ramps to 6.2 rad/s — near the apparatus maximum — with T at 57.7 N. The cone opens to 75° **and stops short**: cos θ = g/(ω²L) is above zero at every real ω, so horizontal (cos θ = 0) would need infinite spin. The picture shows the approach and the shortfall in the same motion.
- **visual_counter:** θ readout at 75.2° with the ω slider at the top of its authored range and T within 1 N of the proportional band's cap.
- **one_line_fix:** "Horizontal needs cos θ = 0, and g/(ω²L) is never zero — the string gets close, never level."

*(The sibling belief "constant speed means no net force" is handled structurally, not with a third hook: STATE_1 shows a nonzero T readout during constant-speed circling, and STATE_3 shows what happens when that force is removed. Named as a wording constraint in §7, not manufactured into a per-state watch.)*

---

## §5 — `has_prebuilt_deep_dive` STATES

Two flagged (cache hint only — every state shows the Explain button; un-flagged routes to the feedback form, Rule 18):

1. **STATE_3** — "why the tangent?" This is where the centrifugal intuition fights hardest (documented in every PER corpus; HCV §7.6 exists because of it), and it is the concept's primary aha. Flag and aha agree.
2. **STATE_5** — the solved cone. The exam workhorse (conical pendulum), where students historically ask "where does cos θ = g/(ω²L) come from?" and "why can't it be horizontal?". Flag and Hook 2 agree.

*(STATE_6 considered and rejected — its question collapses into STATE_5's second cluster.)* Both flagged states carry Pass-1 cliff sentences (§7); no divergence to document.

---

## §6 — DRILL-DOWN CLUSTERS

**STATE_3 (the cut):**
- `why_tangent_not_outward` — velocity is tangent at every instant; removing the force keeps the velocity, it does not reverse the pull.
- `what_you_feel_in_a_turning_car` — the seat pushes you inward; "being flung outward" is your body continuing straight while the car turns under you.
- `speed_unchanged_after_release` — the inward force never did work on the speed (it was always perpendicular to v), so cutting it changes nothing about how fast.

**STATE_5 (the solved cone):**
- `deriving_cos_theta_g_over_omega2L` — the two component equations divided; why L, not r, appears.
- `why_the_string_never_goes_horizontal` — cos θ → 0 needs ω → ∞; tension T = mω²L grows without limit on the way.
- `tension_larger_than_weight_on_the_cone` — T = mg/cos θ ≥ mg always; the string pulls harder than the bob weighs at any tilt.

physics-author fleshes out `trigger_examples` per cluster.

---

## §7 — TWO-PASS COGNITIVE LENS

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.**
- `newton_first_law` — **breaks at STATE_3.** The cut is only an argument to a student who accepts "no force ⇒ straight line at constant speed". **Patch (in STATE_3's choreography):** the state does not cite the law, it performs it — the `v` readout holds its value and the trail is drawn straight; one narration sentence ("with no force left, it keeps the velocity it had") carries a student who never met the law, without condescending to one who did.
- `equilibrium_of_particles` (sibling, authored this tray) — **breaks at STATE_1** for the notation ΣF and at STATE_4 for components-of-one-force. **Patch:** STATE_1's narration states the contrast in one sentence — "last time ΣF was zero and the ring stayed put; here the ball is moving in a circle, and ΣF is NOT zero" — which re-teaches the symbol in passing. (Chapter coherence: same ΣF label, same arrow conventions, same engine.)
- `tension_force` — **breaks at STATE_1** (a string pulls along its own line, toward the anchor, never pushes). **Patch:** STATE_1's foundation sentence — "the string can only pull, and it pulls toward the centre" — is proved by the arrow tracking bob→anchor through four revolutions.
- `centripetal_acceleration_kinematic` — **NOT shipped** (catalog A5). The concept is deliberately designed not to need it: no `a_c` readout, no v²/r derivation; the quantitative claim enters as T = mω²r read off the instrument. Noted for the catalog's dependency graph rather than patched.

**JEE-backwards trace** (conceptual EPIC-L trace; board/competitive overrides are Rule 20 [D]):
> *A bob of mass m on a string of length L is whirled as a conical pendulum at angular speed ω. Find the string tension and the cone angle; state the minimum ω for the motion to exist. Separately: the string breaks — describe the bob's horizontal motion at that instant.*

| Piece the student needs | Delivered by |
|---|---|
| Circular motion needs a net inward force; the string's tension provides it | STATE_1 |
| T = mω²r (and r = L sin θ on the cone) | STATE_2 (+S5 readouts) |
| Vertical balance: T cos θ = mg | STATE_4 |
| Solved angle: cos θ = g/(ω²L) ⇒ T = mω²L | STATE_5 |
| Existence condition ω ≥ √(g/L) | STATE_6 |
| On breaking: tangential, straight, speed unchanged | STATE_3 |

No missing piece. No state added.

**Misconception entry mapping.**
- *"Flung outward"* — confronted at **STATE_3** (Hook 1). **Planting risk:** narration in S1/S2 must never say the ball "pulls outward on the string" without immediately anchoring which body each force acts ON — one flagged wording constraint: every force sentence names its object ("the string pulls the ball inward").
- *"Fast enough spin makes the string horizontal"* — confronted at **STATE_5** (Hook 2). **Planting risk:** STATE_4's narration must not say the string "rises as it spins" unqualified; it describes the one authored ω. Flagged.
- *"Constant speed ⇒ no net force"* — structurally prevented at **STATE_1**: the T readout is nonzero on screen during constant-speed motion, and the narration says "the speed is constant; the velocity is not — its direction changes every instant". Not a watch entry (guardrail: no manufactured hooks).

### Block 2 — Aha-moment designation

- **PRIMARY aha (STATE_3):** *Cut the string and the ball goes straight along the tangent — there is no outward force, and there never was.*
- **SUPPORTING aha (STATE_4):** *"Centripetal force" is not a new force — on the cone it is just the horizontal part of the tension the string already has.*
- **Cohesion check.** The supporting aha serves the primary directly: both are the same claim — the only real forces present (tension, weight) fully account for circular motion, so nothing outward is left to exist. Two ahas, not three. (STATE_5's never-horizontal moment was tested as a third and **rejected** — it reinforces the supporting aha's "the components must balance" logic rather than standing alone; it stays a hook, not an aha.)
- **Wrong-belief setup.** For the PRIMARY: **STATE_1 + STATE_2** build the confident near-miss — the student watches an inward-only force picture for two states while their body-memory ("I get thrown outward on a merry-go-round") stays unchallenged; STATE_3 collides the two. For the SUPPORTING: **STATE_3 → STATE_4** — the student has just seen tension alone do the whole job on the flat plane; STATE_4 threatens that simplicity with gravity and resolves it with components rather than a new force.
- **Foundational-coverage rule.** PRIMARY aha (STATE_3) is **inside** `entry_state_map.foundational` (STATE_1–STATE_3). Satisfied — no exit-pill needed.

---

## §8 — `entry_state_map`

```
entry_state_map:
  foundational:  STATE_1 → STATE_3     # "why doesn't it fly off", "what force keeps it circling", the cut
  conical:       STATE_4 → STATE_6     # conical pendulum, solved angle, minimum spin
  explore:       STATE_7
```

Default aspect = `foundational`. Valid classifier `aspect` values: `foundational`, `conical`, `explore`. The PRIMARY aha lives in the foundational slice, so no mandatory exit-pill; an optional pill "What if the ball also hangs under gravity? →" invites the `conical` slice after the foundational slice ends.

---

## §9 — PER-STATE `force_rig` CONFIG SKETCH (design against the CONTRACT, not the spec)

**Top level (`field_3d_config`):** `scenario_type: "force_rig"`, `explorer_id: "force_rig_explorer"`, `camera_position: [0, 3.4, 9.2]` on **every** state (never changes — Rule 32d; whirl self-centres). Slider bands are the engine's own: `omega` 1.0–6.5 · `L` 0.60–1.40 · `bob_mass` 0.8–4.5.

### STATE_1 — "The String Pulls Inward" · core · 11 s
```jsonc
"caption": "Tension pulls inward, always",
// formula_overlay: none (deliberate — §3 Rule 34 note)
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "flat", "string_length_m": 1.00, "bob_mass_kg": 1.5,
             "omega_rad_per_s": 3.0, "show_radius": true, "show_velocity": true },
  "arrows":   [{ "show": ["tension"] }],
  "readouts": ["T", "v"],
  "controls_visible": [],
  "glow_focal": "fr_w_velocity"
}
```
T = 1.5·3.0²·1.00 = **13.5 N** (above the 11.5 N floor ✓). Period 2.09 s → ~5 revolutions in 11 s. No `theta`, no `resultant`, no `normal` authored (contract rules; `normal` legal on flat but deliberately unused — the narration says the table carries the weight, the screen stays one-arrow clean).

### STATE_2 — "Faster Spin, Larger Pull" · core · 13 s
```jsonc
"caption": "Faster spin, larger tension",
"formula_overlay": "T = m ω² r",
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "flat", "string_length_m": 1.00, "bob_mass_kg": 1.5,
             "omega_rad_per_s": 3.0, "show_radius": true, "show_velocity": true },
  "arrows":   [{ "show": ["tension"] }],
  "readouts": ["T", "omega", "v"],
  "controls_visible": ["omega"],          // V-flag (§3): author [] if the handle does not track the ramp
  "glow_focal": "fr_w_tension",
  "param_ramp": { "param": "omega", "from": 3.0, "to": 6.0, "start_ms": 1200, "end_ms": 9200 }
}
```
T: 13.5 → 54.0 N (inside floor/cap ✓). Assumed pin 9200 + 1600 = **10800 ms** (§0 Finding 1) → duration 13 s.

### STATE_3 — "Cut the String" · core · ~17 s · **PRIMARY AHA · Hook 1**
```jsonc
"caption": "Cut: straight along tangent",
// formula_overlay: none (deliberate)
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "flat", "string_length_m": 1.00, "bob_mass_kg": 4.0,
             "omega_rad_per_s": 1.8, "show_radius": false, "show_velocity": true,
             "release": { "at_ms": 15600, "trail": true, "ghost_circle": true } },
  "arrows":   [{ "show": ["tension"] }],
  "readouts": ["T", "v"],
  "controls_visible": [],
  "glow_focal": "fr_bob"                  // fr_trail is dim-exempt by build; the trail stays evidence-bright
}
```
The contract's own cut band verbatim: T = 12.96 N (above floor ✓), v = 1.8 m/s. **Timing rule for physics-author:** `at_ms = duration − 1400 ms` (flight ≤ 1.4 s, contract hard limit — the widened plane L×2.8 holds ~1.4 s of flight in frame), `duration = measured narration length`, and check `at_ms + 1200 ≤ duration` (release pin ✓ at these numbers). Pre-cut: ~4.5 revolutions at period 3.49 s. The guided-state end-freeze (Rule 26) holds the final frame: straight trail leaving the dim ghost circle.

### STATE_4 — "Tension's Two Components" · extended · 12 s · **SUPPORTING AHA**
```jsonc
"caption": "Tension splits: vertical and inward",
"formula_overlay": "T cos θ = mg",
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "conical", "string_length_m": 1.00, "bob_mass_kg": 1.5,
             "omega_rad_per_s": 4.0, "show_radius": true, "show_velocity": false },
  "arrows":   [{ "show": ["tension", "weight", "resultant"], "labels": { "resultant": "ΣF" } }],
  "readouts": ["T", "theta"],
  "controls_visible": [],
  "glow_focal": "fr_w_resultant"
}
```
cos θ = 9.8/16.0 = 0.6125 → θ = 52.2°, T = mω²L = 24.0 N, W = 14.7 N — all proportional ✓. `resultant` is legal here (conical) and is **never co-authored with `centripetal`** (`centripetal` is authored NOWHERE in this concept); the ΣF label is the sibling concept's own notation, now visibly nonzero and horizontal — the chapter's hinge sentence.

### STATE_5 — "Spin Faster, the Cone Opens" · extended · 14 s · **Hook 2**
```jsonc
"caption": "Faster spin opens the cone",
"formula_overlay": "cos θ = g / (ω²L)",
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "conical", "string_length_m": 1.00, "bob_mass_kg": 1.5,
             "omega_rad_per_s": 3.4, "show_radius": true, "show_velocity": false },
  "arrows":   [{ "show": ["tension", "weight"] }],
  "readouts": ["T", "theta", "omega", "r"],
  "controls_visible": ["omega"],          // same V-flag as STATE_2
  "glow_focal": "fr_wstring",
  "param_ramp": { "param": "omega", "from": 3.4, "to": 6.2, "start_ms": 1200, "end_ms": 10200 }
}
```
θ: 32.0° → 75.2°; T: 17.3 → 57.7 N — the ramp ceiling is deliberately **6.2, not 6.4**, to stay under the 58.3 N proportional cap. Assumed pin **11800 ms** (§0 Finding 1) → 14 s.

### STATE_6 — "Below Minimum Spin, No Cone" · **advanced** · 13 s
```jsonc
"caption": "Too slow: no cone",
"formula_overlay": "ω ≥ √(g/L)",
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "conical", "string_length_m": 1.00, "bob_mass_kg": 1.5,
             "omega_rad_per_s": 4.5, "show_radius": true, "show_velocity": false },
  "arrows":   [{ "show": ["tension", "weight"] }],
  "readouts": ["theta", "omega"],
  "controls_visible": ["omega"],
  "glow_focal": "fr_guide_ring",
  "param_ramp": { "param": "omega", "from": 4.5, "to": 2.6, "start_ms": 1200, "end_ms": 9200 }
}
```
θ: 61.1° → 0° at ω_min = √(9.8/1.00) = 3.13 rad/s; the engine hides the guide ring, hangs the bob and shows its amber `ω min` row. **§0 Finding 2 governs this state** — fallback `to: 3.2` (cone closes to ~6°, no clamp entry) or full cut of the state; both authored there. Assumed pin **10800 ms** → 13 s.

### STATE_7 — "Explore: Spin, Length, Mass" · core · `interaction_complete` · duration 0 (open)
```jsonc
"caption": "Change spin, length, mass",
"formula_overlay": "T = m ω² L",          // CORE ring only (Rule 38b) — established in STATE_2 (r = L); exact on the cone too
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "conical", "string_length_m": 1.00, "bob_mass_kg": 1.5,
             "omega_rad_per_s": 4.0, "show_radius": true, "show_velocity": true },
  "arrows":   [{ "show": ["tension", "weight"] }],
  "readouts": ["T", "v", "omega", "r"],   // theta deliberately dropped — 38b-conservative (see below)
  "controls_visible": ["omega", "L", "bob_mass"],
  "trusted_drag_seizes": true,
  "glow_focal": "fr_bob"
}
```
The founder-named explore beat is native: driving `omega` below √(g/L) hits the proven honest clamp (harness S5 — handle snaps back, amber row). The whirl never freezes (Rule 37, engine-classified `interactive`). Arrow saturation past 58.3 N at slider extremes = §0 Finding 3, disclosed.

**Config-surface compliance audit (every state):** `theta` never authored on a flat state ✓ · `resultant` never on flat ✓ · `resultant`+`centripetal` never co-authored (`centripetal` unused) ✓ · `normal` never on conical (unused entirely) ✓ · every `param_ramp.param` = `omega` (the only whirl-rampable token) ✓ · every guided-state force ∈ [12.96, 57.7] N — inside floor 11.5 / cap 58.3 ✓ · bob_mass ∈ [1.5, 4.0] ⊂ [0.8, 4.5] ✓ · one `glow_focal` per state, all ids from the whirl list ✓ · post-cut flight 1.4 s ≤ 1.4 s ✓ · explore = `trusted_drag_seizes` + all three whirl controls, exactly the contract's sandbox shape ✓.

---

## §10 — PREREQUISITES (advisory only, Rule 23)

| concept_id | Status | Why |
|---|---|---|
| `equilibrium_of_particles` | authored this tray (founder-approved) | ΣF notation + the zero case this concept breaks; deliberate build order (tray chapter_map) |
| `newton_first_law` | shipped | no force ⇒ straight line — the logical engine of STATE_3 |
| `newton_second_law` | shipped | a net force means acceleration even at constant speed |
| `tension_force` | shipped | a string pulls along its own line, toward the anchor, never pushes |
| `vector_resolution` | shipped | components of one force — the STATE_4 cliff |

Gap noted for the catalog graph: `centripetal_acceleration_kinematic` (Topic 10 A5) is the catalog's stated prerequisite for this hub and is NOT shipped; this design deliberately does not depend on it (§0 Finding 5). Graph edge added: `equilibrium_of_particles` → **`uniform_circular_motion`** → (cyclotron/Topic 36, satellite orbits/Topic 16, conical-pendulum descendants).

---

## §11 — REAL-WORLD ANCHOR (Rule 35 universal · Rule 38f widest overlap)

**Primary — a ball whirled on a string, and the moment you let go.** Every student has whirled something on a string or swung a bag in a circle — and every student has the body-memory of "it flies outward when released", which is exactly wrong and exactly what STATE_3 settles. The anchor IS the apparatus: no translation gap between the hook and the sim.

**Secondary — the spin dryer.** A washing machine's spin cycle dries clothes because the drum turns and the water does NOT get "flung outward" — at each hole, water that loses its inward push simply keeps going straight along the tangent and leaves through the wall. A household machine on every syllabus's territory, no country, brand or place named.

**Why it hooks a Class 10–12 student:** both anchors weaponise a feeling the student already trusts ("I get thrown outward") and replace it with a sharper picture they can verify with their own hands the same day. Rule 38f satisfied: a string-and-ball and a washing machine are the widest-overlap devices available; no lab-specific apparatus is used as an anchor (the whirl rig is the instrument, not the hook).

---

## §12 — DEFINITION OF DONE (Gate 0 — no TBDs)

**(a) Every state by id, one line** — the table in §3 plus rail titles: S1 "The String Pulls Inward" · S2 "Faster Spin, Larger Pull" · S3 "Cut the String" · S4 "Tension's Two Components" · S5 "Spin Faster, the Cone Opens" · S6 "Below Minimum Spin, No Cone" · S7 "Explore: Spin, Length, Mass" (all short, literal, first-words-carry — Rule 41d).

**(b) Symbol-label table**

| Narration says | On-canvas label | Where |
|---|---|---|
| "the tension" | `T` | tension arrow label + HUD `T = 13.5 N` |
| "the weight" | `W` (arrow) / `mg` (formula) | weight arrow (conical states) + S4 formula |
| "the net force" / "the sum of the forces" | `ΣF` | resultant arrow label (S4) — sibling-concept notation |
| "the velocity" | `v` | velocity arrow + HUD `v = 3.00 m/s` |
| "the spin rate" | `ω` | HUD `ω = 4.00 rad/s` + slider row label |
| "the cone angle" | `θ` | HUD `θ = 52.2°` (conical states only — never on flat) |
| "the radius of the circle" | `r` | radius line + HUD `r = 0.79 m` |
| "the string length" | `L` | slider row label + formulas |
| "gravity" | `g` | formula surfaces only |

Zero ASCII math; `ω θ ² √ Σ °` Unicode across all three text paths (Rule 34c).

**(c) Direction-rule plan — RHR N/A** (no cross product taught; ω as a vector is out of scope). The binding direction discipline: **the tension arrow points from the bob toward the anchor in every state, solved by the engine, never authored; the velocity arrow is tangent, solved; no arrow ever points outward from the centre** (harness S8 is the standing proof).

**(d) Motion plan** — S1 revolution + turning arrows · S2 quickening bob + lengthening T arrow · S3 revolutions → cut → straight trail vs ghost circle · S4 tilted revolution with three tracking arrows · S5 opening cone (θ, r, T all climbing) · S6 closing cone → hang + amber row · S7 live under drags, never frozen. **No state is static; no state's only delta is a glow change** (the tray's named Rule 31 trap: `phases[]` repaints nothing on this engine — and `phases[]` is accordingly authored NOWHERE in this concept).

**(e) Modes:** conceptual only. No `mode_overrides` (Rule 20 [D]). No `epic_c_branches`.

**(f) `assessment` + `coverage_map` + `misconception_watch`:**
- `misconception_watch` on **STATE_3** and **STATE_5** only (§4).
- `assessment` — 6 questions, backward-designed:

| q | tested idea | teaches_state | keyed distractor |
|---|---|---|---|
| 1 | constant-speed circling still needs a net inward force | STATE_1 | "constant speed ⇒ no net force" |
| 2 | doubling ω quadruples the needed tension | STATE_2 | "doubles it" |
| 3 | released bob moves along the tangent at unchanged speed | STATE_3 | "outward along the radius" |
| 4 | on the cone, T cos θ = mg (so T > mg always) | STATE_4 | "T = mg" |
| 5 | cos θ = g/(ω²L); the string never reaches horizontal | STATE_5 | "horizontal at high enough ω" |
| 6 | conical motion exists only for ω ≥ √(g/L) | STATE_6 | "any ω gives some cone" |

- `coverage_map.by_state` covers STATE_1–STATE_6; `non_assessed_states: [STATE_7]`.
- Rule 19: ≥3 primitives per state (delta-cue annotation + state label + formula/HUD annotation minimum; S1/S3 substitute a second annotation for the absent formula surface).

**(g) Macro↔micro (Rule 33):** N/A for 33a–c, binding for 33d — see §3.

**(h) Canvas budget (Rule 34):** per state as listed in §3; HUD `top: 52px`+; formula surface `#fr_formula` left-centre; no collisions; S1/S3 formula-free by declared design.

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Both cuts checked coherent.**
  - *Hide advanced* (S6 gone): S1–S5 + S7 — **binding constraint to physics-author: STATE_5's narration must NOT mention a minimum spin or ω_min** (that fact lives only in S6); checked, no other state references it. Coherent ✓.
  - *Hide advanced + extended* (S4–S6 gone): survivors S1, S2, S3, S7 — a complete qualitative+quantitative flat lesson: *inward pull needed → grows as ω² → cut it and the ball goes straight → try it*. **Binding constraints:** S1–S3 narration never references the cone, θ, or "later we'll add gravity"; checked. **One flagged judgment call:** STATE_7's apparatus is CONICAL (the founder-named clamp-at-the-slider beat requires it), so under the reduced cut the sandbox shows a hanging-angle picture no surviving state derived. Defence: the picture is the natural real object (a whirled ball always rides below the hand — the anchor itself), its formula surface and all four readouts (`T v ω r`) are core-established, and `theta` is deliberately dropped from its readouts so no untaught symbol appears. **Fallback if the auditor rules it a 38-i-1 violation: author STATE_7 as `geometry: "flat"`** — losing the clamp beat from the sandbox (it remains in S6) — a one-key change.
- **(i-2) Explore surfaces CORE only (38b):** ~~formula `T = m ω² L`, readouts `T v ω r`, all core-established. ✓~~
  **SUPERSEDED 2026-08-01 by architect ruling on audit finding F1** (quality-auditor FAIL, pass-1 route).
  This self-check was WRONG: it tested that the SYMBOLS were core-established, not that the RELATION was.
  `T = m ω² L` is derived only at STATE_5, which is outside the `core_only` cut (S1, S2, S3, S7) — so
  under that preset the relation is unearned (the `capacitance ε₀A/d` scar class). It also contradicted
  STATE_7's own value-only HUD, which shows `r = 0.790 m` beside a formula written in `L = 1.00 m`.
  **Substituting STATE_2's `T = m ω² r` was considered and REJECTED as a physics error on this
  apparatus:** on the cone `T sin θ = m ω² r` with `r = L sin θ`, so `T = m ω² L ≠ m ω² r` (at the
  authored values, 24.0 N vs ~19.0 N — the live HUD would refute the surfaced formula every frame).
  **Ruling: STATE_7 surfaces NO formula**, matching the deliberate formula-free pattern of STATE_1 and
  STATE_3. Now reads: explore is formula-free; readouts `T v ω r` value-only, all core symbols. ✓
  (theta dropped — above.) The apparatus stays CONICAL — the auditor accepted that judgment call and
  explicitly ruled against the flat fallback, which would have cost the founder-named ω_min clamp beat.
- **(i-3) `curriculum_tags` as CLAIMS (38g):**

| curriculum | placement | verified | needs_teacher_verification |
|---|---|---|---|
| CBSE / NCERT Class 11 | Ch.4 §4.11 (uniform circular motion) + Ch.5 §5.9 (circular-motion dynamics) | `true` | `false` |
| JEE Main / NEET | Laws of Motion — dynamics of circular motion; conical pendulum | `false` | `true` |
| Cambridge A-Level | Circular motion — angular speed, centripetal force | `false` | `true` |
| US AP Physics 1 | Dynamics — circular motion and gravitation (force-side) | `false` | `true` |

- **(i-4) Presets (hide, never reorder):** `full` → all 7 · `hide_advanced` → drop S6 · `core_only` → S1, S2, S3, S7.
- **(i-5) Graph axes (38e): N/A** — no graph is rendered.

---

## §13 — SELF-REVIEW

- [x] Atomic claim ONE sentence; scope exclusions named with target concept_ids (banked road / vertical circle out per founder decision — not relitigated).
- [x] State count (7) justified against the calibration table AND the engine's six honest pictures; the ω_min question answered with an explicit yes + ring-fence.
- [x] Control table: teaches × archetype × delta × distinct motion × controls × narration budget × duration × ring × advance_mode. Every repeat a declared contrast pair (S1/S4, S5/S6); the shared ω-ramp driver across S2/S5/S6 disclosed with separation criteria and a named fallback (the Phase-1 lesson).
- [x] No static state; no glow-only delta; `phases[]` authored nowhere (the tray's named trap).
- [x] Rule 16a: 2 hooks at genuine pivots; five states carry none; the cut beat exactly as founder-fixed (no outward force drawn or named, ghost circle, tangent).
- [x] Rules 32 / 33 / 34 plans present; S1/S3 formula-free declared, not accidental.
- [x] Rule 38: rings tagged; advanced contiguous before explore; BOTH cuts checked with binding narration constraints; explore core-ring with one flagged judgment call + one-key fallback; tags as claims; presets derived; 38e N/A.
- [x] Rule 41: every title, cue and label literal ("splits", "opens", "hangs" are the physical words; nothing wants, throws, or fights; "flung outward" appears only inside the belief being confronted).
- [x] Rule 15 (2 modes) · Rule 19 (≥3 primitives declared) · Rule 35/38f anchor universal, widest-overlap, physics-true.
- [x] `entry_state_map` declared; PRIMARY aha inside foundational — no exit-pill needed.
- [x] Prerequisites advisory; all shipped or authored; the one genuine catalog gap (A5) named and designed around.
- [x] Engine bug queue consulted via the applied tray mirror; arrow-collinearity recurrence escalated to the EYE brief; D5-dark noted for eye-walker.
- [x] Two-pass lens Blocks 1 + 2 filled; DoD zero TBDs.
- [x] Every config sketch audited against the closed enums, bands, magnitude floor/cap, flight limit and pin arithmetic of the as-built contract. **ZERO renderer edits required.**

---

## §14 — HANDOFF NOTES TO `physics-author`

1. **Measure before locking — four V-checks, in the sibling's spirit (extend `_scratch_fr_seams.ts` locally, never commit engine changes):** (V1) the real reveal pin of a whirl `param_ramp` (§0 Finding 1 — every S2/S5/S6 duration assumes end_ms + 1600); (V2) clamp behaviour under the S6 down-ramp (§0 Finding 2 — fallbacks authored there); (V3) whether a visible `omega` slider row tracks a live ramp (S2/S5/S6 `controls_visible` — fallback `[]`); (V4) S3 flight geometry — confirm the bob stays on the widened plane and in frame for the full 1.4 s at m = 4.0, ω = 1.8 (the Phase-0 slide-off defect's exact scenario; the plane-widening build call is the fix, verify it holds).
2. **S3 timing is a formula, not a number:** `at_ms = duration − 1400`, `duration = measured narration`, assert `at_ms + 1200 ≤ duration`. Write the narration FIRST, then place the cut.
3. **Three load-bearing wording constraints (§7):** every force sentence names the body it acts on; S5 narration never mentions ω_min; S1–S3 narration never forward-references the cone or gravity's later role (the 38 reduced cut depends on it).
4. `physics_engine_config.constraints` records in plain terms: T is SOLVED by the constraint integrator (`T = m(û·a_free + |v|²/L)` — `T = mω²L` and `cos θ = g/(ω²L)` appear nowhere in the renderer and fall out); θ is solved, never authored; the post-cut straight line is the output of deleting the constraint, never scripted; no centrifugal term exists anywhere (harness S8).
5. **Never author:** `theta` on a flat state · `resultant` on a flat state · `resultant`+`centripetal` together · `centripetal` at all · any whirl force outside [11.5, 58.3] N in a guided state · post-cut flight > 1.4 s · a second glow focal · `phases[]`.

