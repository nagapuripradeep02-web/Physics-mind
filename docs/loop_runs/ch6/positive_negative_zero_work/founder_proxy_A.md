# Checkpoint A report — `positive_negative_zero_work`

> founder-proxy, 2026-08-02. Report-only (the agent wrote no repo files; persisted here by the
> dispatching session). Concept #2 of Ch.6, branch `feat/ch6-concept-2`. Cycle 1 of 2.

# VERDICT: `DESIGN_FIX` — cycle 1 of 2 · routed to `alex:architect`

**3 blocking (P1) · 4 P2 · 6 P3. The Phase-0 alarm rule does NOT fire — I concur with the skeleton,
and I checked specifically for a reason to route an engine dispatch and did not find one.**

This is a stronger skeleton than concept #1's cycle 1 was. Its §0 verification record is not
decoration: I re-checked all five load-bearing engine claims at source and **every one of them holds**
— `work_bar_*` glow inert (L43492‑43494), `'normal'` returning a hard 0 (L44161), the `_dsp0` wrap
re-anchor (L45571‑45572 / L44018 / L43000), `param_ramp` having no `'F_ang'` member (L1576‑1582), and
`readouts`/`controls_visible` carrying `'v'`/`'F_ang'` (L1336/L1340). **Every number in the Arithmetic
table is correct** — I recomputed all of them independently, including the two the brief flagged
(S2's `−90.0 J ≡ −½mv₀²` and S5's `−12.5 N` along-component and `N = 27.3 N`), and the loop-end
positions, the frozen-pin phases against `deriveStateMeta` L2931‑2943, and all three `work_scale_J`
values against the FIXED scar row's own probe. Nothing in the arithmetic is wrong. The S1/S2 contrast
pair is the strongest single thing in the document.

**The failure is S5**, and it is not an arithmetic failure — it is that the state cannot survive the
one interaction it exists for. The brief asked whether a loop reset landing exactly on the stop instant
is safe. It is (verified below, to the frame). But the invariant only governs the *unseized* run, and
S5's whole purpose is to be seized: **the moment a teacher touches the θ slider, the loop stops
re-arming, the frictionless crate reverses, and the bar unwinds from −90.0 J back to zero at an
unchanged 120°.** Separately, S5's declared archetype names a motion nothing in the authored beat
produces — a recurrence of two findings this chapter already paid for. And the atomic claim states the
qualitative work–energy theorem as a rule, where it is both #4's property and, for a single force,
false.

All three P1s are design fixes. **No renderer edit is required for any of them, and I am explicitly
declining to route one** — including for the `param_ramp` gap, where the architect's own #1 physics
ruling holds and the engine is not the defect.

---

## Pass 1 — scar classes actually checked (not "no recurrences")

Live query run this session: `query_engine_bug_queue.ts positive_negative_zero_work` → **11 rows**,
matching the skeleton's table exactly. Plus this run's accumulated candidate files
(`work_done_by_constant_force/scar_candidates_checkpointA.sql`,
`conservation_of_mechanical_energy/scar_candidates_seam_{k,m}.sql`) and both #1 Checkpoint-A reports.

| Class checked | Result |
|---|---|
| `nlb_checkpoint_capture_overshoots_exact_crossing_value` [FIXED] | N/A — zero checkpoints |
| `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` [OPEN] | N/A — zero checkpoints |
| `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` [OPEN] | N/A — zero checkpoints |
| `nlb_multibody_lane_gap_is_along_z…` [OPEN] | N/A — zero multi-body states |
| `nlb_angle_arc_radius_overruns_the_neighbouring_lane_body` [OPEN] | N/A — single body in every arc state |
| `nlb_displacement_vector_is_single_body…` [OPEN] | N/A — single body everywhere |
| `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm` [OPEN] | **PASS, probe run by hand:** \|−5.4\| = 5.4 < 6 − 0.55 = 5.45 ✓; and no authored run reaches a bound inside 2 s (S1 +2.6, S2 −0.81, S3 +0.6, S4 −1.24, S5 +1.6) ✓ |
| `nlb_seized_slider_run_overruns_a_loop_sized_work_scale` [FIXED] | **PASS, probe run by hand on all three scales** — see F9 |
| `nlb_sandbox_wrap_remaps_s_but_not_s0…` [FIXED] | Relied on correctly for S6; the WITHDRAWN mitigation (seed at the bound) is correctly not used ✓ |
| `nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate` [OPEN] | **No `work_bar_*` focal authored anywhere** ✓ — and the "optional-on-E1" note correctly does not depend on it |
| `nlb_work_probe_globals_disagree_on_multibody_states` [OPEN] | Single body — see the advisory note to quality-auditor below |
| #1 Chkpt-A **F4** (declared delta is a verified no-op) | **RECURRENCE → F2** |
| #1 Chkpt-B (S5 declared `reveal-build` with no time-varying mechanism) | **RECURRENCE → F2** |
| #1 Chkpt-A **F11** (no drawn F-component; wording must not name it) | Clean — no `one_line_fix` in §4 names an on-canvas component ✓ |
| #1 Chkpt-A cycle-2 **N3/N4** (unmatched focal silently dims everything) | Clean — every focal id verified registered; see F6/F12 |
| #1 Chkpt-A cycle-2 **N12** (scale sized to the extreme corner flattens the instrument) | **Adjacent → F9** (recorded, deliberately NOT routed) |
| `field3d_path_integral_accumulator_bills_a_teleport_as_displacement` | Covered — the wrap discards Δs > half-span (L44195) ✓ |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | Clean — `slider_controls.F_ang {0…180}` is correctly used as the per-concept override this time |

---

## Rulings on the six points the skeleton submitted

**1 · `ledger-split` (S4) — ACCEPT the coining, on the merits, not on the declaration.**
The panel is on-canvas apparatus and Rule 33d makes instruments first-class, so four bars diverging
from one zero line into a signed fan *is* a real, complete, new motion no earlier state produces. Two
conditions. **(a) It must read at the frozen pin — verified:** at phase 1200 ms the four bars sit at
+44.9 / −29.4 / 0.0 / +15.6 J on a 180 J scale (25% / 16% / 0 / 9% of half-track), and at loop end at
124.8 / −81.5 / 0 / +43.3 (69% / 45% / 0 / 24%). The fan reads. **(b) Record the coined name in the
chapter's archetype vocabulary** so #3–#12 do not reuse it for any state whose bars merely move.
Note the coining is load-bearing for Rule-31 compliance: if S4 were `translate-through` the concept
would carry three of them.

**2 · S1/S2 contrast pair — ENDORSE, keep verbatim.**
Four large, simultaneous, opposite differences: arrow direction (forward vs backward), bar direction
and colour (green up vs red down), `v` rising vs falling, and the end state (moving fast vs stopped
with the arrow *vanished*). Meanwhile the crate's direction of travel deliberately stays the same, so
only the taught variable changes (Rule 32b). That is the textbook shape of a contrast pair and it is
the best thing in the skeleton. The S2 vanish beat — `f` falls to 0 via the static-hold branch at
L45491, so `|f| ≤ NLB_ARROW_EPS` hides the arrow (L39664) *and* the arc (L43977), while the bar holds
at −90.0 J because Δs = 0 — is engine-true and is a genuinely excellent piece of design.

**3 · Does S5 prove something S1–S4 do not — YES on IDEA, NO on picture.**
The three-regime taxonomy is complete after S3, so S5's information gain must come from elsewhere,
and it does: **(a)** an *applied pull* — the same object as S1's — does negative work, breaking
"negative work is what friction does", a belief S1–S4 actively plant since friction is the only
negative bar anywhere; **(b)** the HUD reads a positive `F = 25 N` the whole time while W is negative,
which is the concept's third documented misconception and is confronted nowhere else. **S5 keeps its
place. Do not cut it.** What it lacks is a distinct authored motion (F2) and a survivable interaction
(F1). Fix those.

**4 · S4's `energy_panel` focal — compliant with 32e, defensible, but taken without weighing a free
alternative. → F6.**

**5(a) · No drawn F-component on flat ground — NOT blocking. E2 stays a ride-along.**
Re-verified unchanged: `var comps = !!spec.show_components && !b.hanging && Math.abs(th) > NLB_COMP_MIN_THETA`
(L40862‑40865), and the config type resolves the **weight** only (L1319). #1 accepted this for a
*magnitude* concept, where the projection is more load-bearing. For a *sign* concept it is less so:
the sign is carried by three independent, more elementary channels — the arrow visibly leaning
backward while the crate moves forward, the arc's live 120°, and the bar's direction. Routing an
engine dispatch here would be a per-concept engine extension, which is exactly what Phase 0 exists to
prevent.

**5(b) · `param_ramp` has no `'F_ang'` — the LIMITATION is real and correctly recorded; the
RATIONALISATION is not.**
Verified at source: `param_ramp.param: 'theta' | 'F' | 'mu_s' | 'mu_k' | 'm'` (L1576‑1582). But
"teacher-driven is arguably the better pedagogy" is a claim about the *addition*; it does not
discharge Rule 31's requirement on the *authored beat*. **Ruling: a state whose taught transition
happens only under a teacher's finger does NOT satisfy "ONE complete motion."** The live control is
*required* by Rule 31 and is a good thing; it is not a substitute. → F2.
**And to be explicit: do NOT route an engine fix for this.** The architect's #1 ruling holds here too
— a ramping θ makes the accumulator sum ∫F cos θ ds, which disagrees with the `W = F·d·cos θ` surface
S5 prints. The engine gap is not the defect; the design is.

**5(c) · `work_bar_*` glow inert — correctly handled, no finding.**
Re-verified: `isEn` accepts only `NLB_EN_PANEL_GLOW | energy_bar_* | energy_seg_* | energy_col_E`
(L43492‑43494). No such focal is authored. E1 stays a ride-along.

**6 · The #3/#4 boundary — NOT honest as written. → F3.**
The `f-4` word ban is well-drawn and the ΔK exclusion is clean, but §1 and S1 assert the qualitative
work–energy theorem *as a rule* — and additionally assert it of a single force, where it is false.

**7 · (brief's own question) `loop_reset_ms = 2400 = t_stop` — arithmetically SAFE for the authored
loop; the danger is elsewhere, and it is F1.**
Verified: `nlbRunLoopReset` fires on the first frame where `Math.floor(t_ms / R)` increments
(L43023‑43025), so the overshoot is bounded by **one frame**, and Rule 36 caps a frame at 3 fixed
1/60 s steps → ≤ 50 ms → backward travel ≤ ½·2.5·0.05² = **3.1 mm** → ΔW ≤ **+0.04 J**, invisible at
1 dp. The skeleton's own "≈0.3 mm / +0.004 J" is the 1-step figure and is right. **No ambiguous
photograph either:** the frozen pin sits at phase 1440 ms, **960 ms clear** of the boundary, and dense
frames are relaxed because `loop_reset_ms` states keep `reveal_hold` (SEAM L site ii — it never
asserts stillness). Two residuals worth stating: the invariant is written `≤` and should be `<` with
a stated margin, because an equality invariant leaves no room for a physics-author who nudges v₀, F or
m; and the state never *holds* its own terminal picture, where S2 holds its stop for 1.07 s and calls
that a beat. Neither is P1. **F1 is.**

---

## Findings

### P1 — BLOCKING

**F1 · S5's authored physics cannot terminate. On the first touch of the θ slider — the state's own
control, the thing it exists for — the crate reverses and the bar unwinds from −90.0 J back to zero
at an unchanged 120°.** — S5 — `[owner: alex:architect]`

Verified end to end at source:

```
L44685-86  mu_s: frictionless ? 0 : (d.mu_s || 0)   // surface.frictionless hard-zeroes mu_s AND mu_k
L45471     var maxStat = b.mu_s * N;                                        // = 0 on S5
L45470     var drive = nlbForceAlong(b) + nlbGravAlong(b, th) + Fspr;       // = 25·cos120° = −12.5 N
L45491     var stuck = !boundPin && (Math.abs(b.v) < NLB_STOP_EPS_V) && (Math.abs(drive) <= maxStat);
           //   |−12.5| <= 0  is FALSE  → the crate can NEVER be stuck
L45506     if (nlbSgn(v0) !== nlbSgn(v1) && Math.abs(drive) <= maxStat) { v1 = 0; a = 0; }
           //   identical guard → the rest-clamp never fires either
L43022     if (window.PM_nlbSweepSeized || window.PM_nlbBodyDragged) return;  // no more loop resets
L42171     if (ev && ev.isTrusted) window.PM_nlbSweepSeized = true;           // one θ drag latches it
L44209-10  wk[w].W += nlbWorkForceAlong(eng, b, wk[w].force) * ds;   // W = F_along·(s − s₀), constant F
```

So: the teacher drags θ (or drags it and puts it back at 120°). The loop stops re-arming. The crate
decelerates through v = 0 at t = 2.4 s at s = +1.8 m, **reverses**, and accelerates backward at
2.5 m/s². Because F_along is constant, `W = F_along × (s − s₀)` — the bar climbs steadily out of its
dive and reaches **0.0 J the instant the crate returns to its release point**, then goes green. Total
elapsed from the drag: ~2.5 s of return travel.

Every individual frame is *honest* physics. What is destroyed is the state's own claim, in the exact
interaction the state was designed to invite. And the arc makes it worse before it makes it better:
`nlbFangDir('displacement')` reads `b.s − nlbDispOrigin(b)` (L43989) — **net** displacement, not
velocity — so the arc keeps reading **120°** through the whole return while the red bar shrinks toward
zero, and only flips to 60° after the crate passes s₀.

**The skeleton's stated seizure consequence is factually wrong for this state.** §3's bounding
paragraph says the seized crate "runs the remaining track once and arrests at the bound — fleet-normal,
accepted for S3/S5 exactly as #1's Patch 4 accepted it for its S3." That is true of **S3** (zero
drive, so a coast that arrests forward at the +bound with W = 0 forever, fully consistent with S3's
claim). It is false of **S5**, whose drive is non-zero and points backward. The two were reasoned
about as one case; they are not one case.

**Naming the constraint, not prescribing a mechanism:** S5's rest must be *permanent* for every θ the
slider can reach, i.e. `μₛ·N(θ) ≥ |F cos θ|` across 0…180°. I computed that envelope: the binding
value is **μₛ ≈ 0.60**, maximised near θ ≈ 150° (|F cos θ| = 21.7 N against N = 36.5 N; at the
authored 120° it is only 0.457, and at 180° 0.510 — so authoring against the 120° number alone would
still leave a reversal reachable by the slider). Authoring friction on S5 is not free: it changes a,
t_stop, d, breaks the `−90.0 J ≡ −½mv₀²` identity, and introduces a second negative-work force with no
bar of its own. **That trade is the architect's to make, and there may be a better answer than
friction** — for instance a redesign in which the state does not depend on the crate stopping at all.
Do not reach for `param_ramp` on the angle (see ruling 5b).

**F2 · S5's declared archetype `rotate/flip` has no authored referent — nothing rotates or flips inside
the state. Its authored motion is S2's, which makes three `translate-through` states against Rule 31's
one-pair allowance.** — S5 — `[owner: alex:architect]`

§3's own archetype cell defines it two ways, and neither is a within-state authored motion:
*"between states the arrow rotated past 90°"* — that is the **delta cue**, not the archetype — and
*"within the state the teacher rotates it live"* — that is teacher-driven, and §"Accepted limitations" 2
concedes the sweep is unauthorable (`param_ramp.param` has no `'F_ang'`, L1576‑1582, verified).

Strip both and S5's authored beat is: *a crate launched at 6 m/s decelerates to a stop under a
constant opposing force while a red bar dives.* That is **S2's sentence with a different noun**. The
skeleton acknowledges the adjacency and answers it with three *static* distinguishers — the tilted
arrow, the 120° arc, the θ slider — none of which is a motion.

Graded P1 because it is a **recurrence of two findings this chapter already paid for**:
- #1 Checkpoint A **F4** — a declared delta that was a verified pixel no-op;
- #1 Checkpoint B — *"S5 declared `reveal-build` with no time-varying mechanism — a third undeclared
  pure-translate"*, which cost a rebuild;
- and the standing memory `feedback_state_idea_distinctness_gate_gap`.

The IDEA is sound and S5 earns its place (ruling 3). The defect is the authored MOTION, and the
architect owns the choice. Two options I can name honestly, neither prescribed: **(i)** re-declare
**S2/S5** as the contrast pair — the "same slowing, from a pull instead of friction; |F| stays
positive" contrast attacks the concept's own planted belief directly — and leave S1 as the sole
`translate-through`; the cost is that the pair is non-adjacent, which weakens a contrast. **(ii)** Give
S5 a within-state motion the engine can author that S2 has not shown. I am deliberately *not* naming a
third: the obvious candidate (an angle ramp) is unauthorable and physics-hazardous, and letting the
loop run through F1's reversal into an authored out-and-back would resolve both F1 and F2 at the cost
of importing #5's round-trip lesson — a real option, but a boundary decision above this gate.

**F3 · The atomic claim and S1 state the qualitative work–energy theorem as a rule — for a SINGLE
force, where it is false.** — §1, S1 — `[owner: alex:architect]`

§1: *"θ < 90° → W > 0 (the force helps the motion; **the body speeds up**)"* and *"θ > 90° → W < 0
(… **the body slows down**)"*. §2's S1 row: *"'positive work goes with speeding up' as an observable."*

Two problems in one sentence.

- **Physics.** A single force doing positive work does not imply the body speeds up. The
  counter-example is inside this very concept: in **S4** the pull's bar is green while the crate's
  speed is governed by the *net*; move the numbers (F = 15 N against f = 19.6 N) and the crate slows
  while the pull still does positive work. The skeleton gets it **right** in S4 — *"net positive ↔
  speeds up, observable only"* — and wrong in §1 and S1.
- **Boundary.** Stated as a rule, "positive work → speeds up" **is** the qualitative work–energy
  theorem, which DoD (f-4) reserves for #4. The *observation* is permitted and is a fine use of the
  `v` readout; the *rule* is not.

**Fix:** restrict the correlation to **net** work everywhere it appears, and phrase S1's as an
observation of this state only ("this is the only force acting on the crate, and it speeds up"), never
as a general rule. §1's two parentheticals must drop the speed clauses or qualify them as net. This is
one of the cheapest fixes in the list and it protects both the physics and #4's claim.

---

### P2

**F4 · S2's frozen-pin picture — the state's declared "best single picture", on which its H2 baseline
is minted — is true by 10 ms.** — S2 — `[owner: alex:architect]`

DoD (d) asserts the frozen frame shows the crate stopped with *"the friction arrow vanished."* I
computed the margin.

```
deriveStateMeta L2931-43  offset = clamp(0.60·R, 150, R−150);  base = max(1500, …candidates)
                          wanted = ceil((1500 − 1560)/2600) = 0  → pin = cycle 0, t = 1560 ms
field_3d L39590           var NLB_STOP_EPS_V = 0.01;
field_3d L45491/45506     the arrow hides only once `stuck` is true and f = −drive = 0
```

Stepping at 1/60 s with a = −3.920: v₉₁ = 0.0547 m/s (**not** stuck — above the 0.01 band); the step to
n = 92 trips the sign-flip clamp at L45506 (v ← 0, t = 1533 ms) but that frame still reports
`stuck = false` and f = −19.6 N, so **the arrow is still drawn**; only frame 93 (t = 1550 ms) is stuck,
f = 0, arrow hidden. **Margin to the pin: 10 ms ≈ 0.6 frames.**

The picture as authored is correct — this is fragility, not error. But any downstream change to μ, m,
g or R flips the baseline onto the wrong side of the beat the DoD names.

**Fix:** `R ≥ 2900 ms` (offset ≥ 1740 ms) buys ≥ 200 ms ≈ 12 frames past the stop, still ends the loop
at −0.81 m (far inside the bound), and *lengthens* the "stopped, bar holding at −90.0 J" beat the state
calls its own content. State the margin as an invariant beside the bounding discipline, exactly the way
#1 states its crossing-before-55%-of-R invariant.

**F5 · The PRIMARY aha of a concept named "positive/negative/zero work" is not any of the three signs.**
— S2, S4 — `[owner: alex:architect]`

§"Block 2" designates **S4** (the net-sum ledger) PRIMARY and **S2** (negative work) SUPPORTING. Two
consequences worth a stated decision:

- **The payoff lands at state 4 of 6 — 67%.** All three concepts in the measured exemplar corpus land
  the aha in the first half, and #1 landed it at S2 of 6. The first half here carries only the
  *supporting* aha.
- **"Net work is the signed sum" is the state #3/#4 are built on** — §8 says so outright
  (*"#3 `kinetic_energy_definition` and #4 `work_energy_theorem` build directly on S4's net-work
  ledger"*). So the concept's ten-year memory is being spent on the next concept's foundation rather
  than on its own claim.

Neither designation produces a wrong picture and both are defensible — the skeleton's cohesion
argument ("without negative entries a signed sum is just a sum") is genuinely good. But the aha
designation drives narration emphasis, the deep-dive picks and the assessment weighting, so it should
be settled *with a stated reason* at design time. **Either defend S4 explicitly against the concept's
own name, or swap PRIMARY to S2** — which lands the aha at 33%, matches the title, and leaves S4 as a
strong closer. `entry_state_map` covers S1–S4 either way, so nothing else moves.

**F6 · S4's `energy_panel` focal dims all three force arrows AND the `d` arrow to 0.4 in the state that
first shows them together — and a verified zero-dim option exists that the skeleton does not weigh.**
— S4 — `[owner: alex:architect]`

```
L41799  var focal = (eng0 && eng0.glow_focal) || nlb.glow_focal || (glowTargets.length ? glowTargets[0] : "");
L41800  var glowActive = !!focal || glowTargets.length > 0;
L41819  var isFocal = !!focal && (ud.id === focal || ud.elementType === focal || ud.bodyId === focal);
L41837-42  solidApparatus carve-out: nlb_body | nlb_body_label | nlb_surface | nlb_pulley | nlb_rope | nlb_spring
L43502-04  nlbEnergyApplyGlow writes opacity "1" on every slot when isEn is false
```

With `energy_panel` the mesh pass matches nothing, so `isFocal` is false everywhere while `glowActive`
is true: **every overlay** goes to `GLOW_DIM_OPACITY = 0.4` — the three force arrows, their labels,
**and the `displacement_vector`**, which the skeleton does not mention. Only the crate, its label and
the slab stay full.

With **no `glow_focal` and an empty glow-target list, `glowActive` is false and nothing dims at all**,
and the panel is fully opaque either way. **Rule 32e caps the focal count at one; it does not require
one.**

The skeleton's defence is partly sound — the four bars carry their own English labels
(`"by the pull"` / `"by friction"` / `"by the normal force"` / `"net — the sum"`), so arrow-proximity
is not the only mapping channel, and that is a real argument. But the decision was taken without
weighing a contracted, free alternative, and without noticing the `d` arrow. **Fix: make the choice
and state the reason.** If `energy_panel` stays, name the `d` arrow among the dimmed overlays so
eye-walker does not read it as a defect at Checkpoint B.

**F7 · S5's delta cue "Past 90°: negative work" is a PERSISTENT caption that becomes false on the
state's own control.** — S5 — `[owner: alex:architect]`

A delta cue is a persistent caption (Rule 34a/32c) and must hold at every frame — this chapter's own
physics-author killed a cue for exactly this reason (*"a delta cue is a PERSISTENT caption, so it must
hold at every frame, not just at the crossing"*, ch6_state.md). Dragging `F_ang` below 90° — which the
state is designed to invite — turns the bar green under a caption still reading "Past 90°: negative
work". A cue that holds at every θ the slider reaches (e.g. *"The angle sets the sign"*, five words,
same claim, matches the title) removes the problem. Naming an option, not mandating the string.

---

### P3

**F8 · Three rail titles begin with the identical word, and the rail truncates (Rule 41d).**
S1 *"Force along motion: positive work"* · S2 *"Force against motion: negative work"* · S3 *"Force at
right angles: zero work"*. The differentiator sits in words 2–4; 41d requires the **first** words to
carry the meaning, and a truncated rail shows three rows opening "Force …". **VERBATIM alternative
(pure string swap, no design change, and it makes the rail read as the concept's own name):**

```
S1: Positive work: force along motion
S2: Negative work: force against motion
S3: Zero work: force at right angles
```

**F9 · S5 and S1–S4 draw the identical −90.0 J at different bar lengths, and the DoD does not say so.**
S2's −90.0 J is **50%** of half-track on the shared 180 J scale; S5's −90.0 J is **28.6%** on its own
315 J scale. **I am NOT asking for either value to change, and I checked before writing this.** 315 is
the *minimum* the FIXED scar row `nlb_seized_slider_run_overruns_a_loop_sized_work_scale` permits — I
ran its probe by hand on all three scales:

| state | probe span | max \|F_along\| over slider range | required (1.1×) | authored | |
|---|---|---|---|---|---|
| S3 | 11.4 m | 0 (no applied force) | 0 | 180 | ✓ |
| S5 | `length_m − initial_position_m` = 11.4 m | 25 N (θ = 0 or 180) | 313.5 | **315** | ✓ |
| S6 | sandbox → `2·length_m` = 12 m | 60 N | 792 | **792** | ✓ exactly at the bound |

This is the standing tension between that ratchet rule and instrument legibility — the same tension
#1's cycle-2 **N12** raised, and which #1 resolved toward the ratchet (it shipped `work_scale_J: 792`).
**The finding is only that the DoD must record it**, so physics-author does not write narration
inviting a cross-state bar-length comparison between S2 and S5. Recorded, deliberately not routed.

**F10 · S6's named discoverable "set θ = 90° → the pull acts, the crate coasts, its bar freezes" is
wrong in its motion clause.** S6 authors μₛ = μₖ = 0.3 (DoD f-1), so at θ = 90° a moving crate does
**not** coast — kinetic friction still decelerates it (at m = 5, F = 25: N = 49 − 25 = 24 N, f = 7.2 N)
— and a crate at rest never starts, because `F_along = 0` at 90°. The **bar-freeze** clause is right
and is the lesson. The better-stated discoverable is the one already on screen: the *applied* bar
freezes while the *friction* bar keeps diving.

**F11 · The DoD never states the per-state `arrows.show` list except for S4, nor S6's authored
`applied_force.angle_deg`.** The FIT CHECK gives `show: ['applied','friction','normal']` for S4 only.
S1/S2/S3/S5/S6 are unstated and the choice is load-bearing — S3's whole picture *is* the N arrow, S2's
is the friction arrow vanishing, S5's is the tilted pull. Gate 0 says no TBDs. Separately: S6's opening
picture depends on its authored `angle_deg` (#1 authored 60°; #2's `slider_controls.F_ang.default` is
0), and it is nowhere in the document.

*Verified while checking this, so the architect need not re-check it:* `slider_controls.*.default` does
**not** override a state's authored value. On entry the row syncs **from the engine**
(`nlbSyncSliderRow(stok, nlbSliderValueFromEngine(stok))`, L44864 → L42096 reads `nlbFAng(tg3)`), so
S5 opens at its authored 120° with the slider thumb there. No finding.

**F12 · No `tts_sentences[].glow` binding is required anywhere in the DoD.** Concept #1 shipped 0/18
bound sentences (recorded "Open, not blocking" at its Checkpoint B); the measured exemplar corpus is
52 sentences / 0 unbound (`resistivity` binds every one: `macro_rod`, `electrons`, `r_readout`).
Holding the sibling's bar this stays P3 — but the DoD is the cheapest place to require it, and **if it
is required, every value must come from the verified id list** (`displacement_vector`, `angle_arc`,
`energy_panel`, `nlb_arrow_<bodyId>_<kind>`, `nlb_body_<id>`), because an unmatched focal string
silently dims the entire scene (L41800 + L41819 — the N3/N4 class from #1's cycle 2).

**F13 · `Wₙₑₜ = ΣW` is the most abstract surface in the concept, on a CORE state, with exactly three
summands on screen.** The Unicode is correct (U+2099/U+2091/U+209C verified; Σ = U+03A3) and it is
algebra-only, so 34c and 38c are satisfied. But `Wₙₑₜ = W₁ + W₂ + W₃` lets the teacher point at each
bar as they read each term, which is the state's own "concrete before abstract" directive. Architect's
call.

**F14 · The DoD's frozen-pin figures are cycle PHASES, written as if they were pin instants.** Verified
against `deriveStateMeta` L2931‑2943: the capture is `cycle·R + offset` where
`wanted = ceil((max(1500, …) − offset)/R)`. So S1/S4 capture at **t = 3200 ms** (phase 1200, cycle 1),
S3/S5 at **t = 3840 ms** (phase 1440, cycle 1), S2 at **t = 1560 ms** (phase 1560, cycle 0). **The
pictures the skeleton states are all correct** — the reset is a full `nlbResetTrajectory`, so cycle 1
is identical to cycle 0 — but a Gate-0 DoD should not carry an instant that is not the instant.

---

**Advisory note to quality-auditor (not a finding, so a literal probe run is not misread as FAIL):**
the OPEN scar `nlb_work_probe_globals_disagree_on_multibody_states` fires its probe on
`work_accumulators.length > 1`, which **S4 satisfies with FOUR accumulators — all on ONE body**.
`PM_nlbWork` is keyed by **force** (`mirror[wk[m].force]`, L44223), not by body, so the four entries
are distinct, and `PM_nlbWorkApplied` (L44205 / L44219‑20) equals `mirror.applied` on a single-body
state. **N/A, not FAIL.** The skeleton's "verification claims scoped accordingly" is the right
handling.

---

## Arithmetic — recomputed independently (nothing accepted as asserted)

| State | Skeleton claims | My recompute | |
|---|---|---|---|
| **S1** | a 4.000 · d_loop 8.00 · end +2.6 · pin d 2.88 / W +57.6 / v 4.8 | a = 20/5 = 4.000 · d = ½·4·2² = 8.000 · −5.4+8.0 = **+2.600** · at 1.2 s: d = 2.880, W = 57.60, v = 4.800 · loop peak 160 J | ✓ |
| **S2** | f 19.6 · t_stop 1.531 · d 4.592 · W −90.0 ≡ −½mv₀² | f = 0.4·5·9.8 = 19.60 · a = −3.9200 · t = 6/3.92 = **1.53061 s** · d = 36/7.84 = **4.59184 m** · W = −19.6·4.59184 = **−90.000 J** ≡ −½·5·36 ✓ · end **−0.808** | ✓ (pin margin → F4) |
| **S3** | a 0 · d_loop 7.20 · end +1.8 · W 0 exact | v const 3.0 · d = 3·2.4 = 7.200 · end **+1.800** · `nlbWorkForceAlong` returns hard 0 for `'normal'` (L44161) at every m ✓ | ✓ |
| **S4** | a 2.08 · slopes +30/−19.6/0/+10.4 · peak 124.8 < 180 | a = (30−19.6)/5 = **2.0800** · d_loop = ½·2.08·4 = **4.160** · end **−1.240** · peaks 124.8 / −81.5 / 0 / +43.3 · pin 1.2 s: d = 1.4976 → **+44.93 / −29.35 / 0.0 / +15.57** · breakaway 30 > μₛmg = 19.6 ✓ | ✓ |
| **S5** | along −12.5 · N 27.3 · a −2.5 · t 2.4 · d 7.2 · W −90.0 | 25·cos120° = **−12.5000 N** · N = 49 − 25·sin120° = 49 − 21.6506 = **27.349 N** > 0 · a = **−2.5000** · t = **2.4000 s** · d = **7.2000 m** · end **+1.800** · W = **−90.000 J** · pin 1.44 s: v = 2.400, d = 6.048, W = **−75.60**, arc 120° · min N over 0…180° is at θ=90°: 49−25 = **24.0 > 0**, no lift-off anywhere | ✓ arithmetic; design → F1/F2 |
| **Bounds** | \|s\| < 5.45 everywhere | worst loop end **+2.60**; home **−5.40** < 5.45; no authored run reaches a bound within 2 s | ✓ (OPEN clamp scar's probe passes) |
| **Scales** | 180 / 315 / 792 | 1.1·160 = 176 → 180 · 1.1·25·11.4 = 313.5 → 315 · 1.1·60·12 = **792.0** exactly | ✓ all probe-compliant (F9) |
| **S5 loop invariant** | one-frame overshoot ≈ 0.3 mm ≈ +0.004 J | 1 step: 0.347 mm / +0.0043 J ✓ · **worst case under Rule 36 (3 steps/frame): 3.1 mm / +0.039 J** — still invisible at 1 dp | ✓ (ruling 7) |
| **Gate 12** | 2 distinct advance modes | `manual_click` ×5 + `interaction_complete` ×1 | ✓ |

---

## Per-state design table

| # | order_ok | idea distinct | labels | sound-off | how a teacher points at it | problem | P |
|---|---|---|---|---|---|---|---|
| **S1** `positive_work` | Y | Y — the sign convention + bar-up | Y | Y | *"The pull points the way the crate goes. Watch the bar climb — that is positive work."* | F3 (the "speeds up" rule), F8, F11 | **P1** |
| **S2** `negative_work_friction` | Y | Y — negative joules are real | Y | Y — the vanishing arrow over a held bar IS the content | *"No pull at all. Friction points backward. The bar goes below the line and the crate stops."* | F4 (0.6-frame pin margin), F5 (aha designation), F11 | **P2** |
| **S3** `zero_work_normal` | Y | Y — acting ≠ working | Y | Y | *"Make it heavier. The upward arrow grows. Now read the bar — still exactly zero."* | F11 (arrow set unstated) | **P3** |
| **S4** `net_work_ledger` | Y | Y — the signed sum; PRIMARY aha | Y | Y | *"Three forces, four accounts. Green up, red down, one parked on zero — and the last bar is the sum of the other three."* | F6 (focal dims all arrows + `d`), F5, F13 | **P2** |
| **S5** `angle_decides_sign` | Y | Y on IDEA (applied pull can be negative; \|F\| stays positive) — **NO on picture** | Y | Y | *"Same twenty-five newtons. Lean it back past ninety degrees. Now drag it under ninety and watch the bar turn green."* | **F1 (reversal unwinds the claim), F2 (archetype has no referent)**, F7, F9 | **P1** |
| **S6** `explore` | Y | n/a | Y | Y | *"Make it heavy enough and the pull cannot move it — and every bar parks, because nothing moved."* | F10 (misstated discoverable), F11 (`angle_deg` unstated) | **P3** |

**Rule 38 checked in full.** (38a) rings ordered qualitative → ledger → quantitative; the single
extended state is contiguous immediately before explore; advanced ring empty and declared ✓. **Cut 1**
(hide advanced) is the identity ✓. **Cut 2** (hide extended → S1–S4 + S6) — I walked every surviving
surface: S1 `W = F·d·cos θ > 0 (θ < 90°)`, S2 `W = f·d·cos 180° = −f·d`, S3 `W = N·d·cos 90° = 0`,
S4 `Wₙₑₜ = ΣW`, S6 `W = F·d·cos θ`. None references S5's 120° run or anything else hidden; the cos-θ
form is inherited from #1 as prerequisite ✓ coherent. (38b) explore surfaces only core content; the θ
slider *reaching* past 90° in the reduced preset is a discoverable, not a reference, and the red-bar
sign convention is core (S2) — **accepted, matching the skeleton's own reasoning**. (38c) every surface
algebra-only; no calculus, no vectors ✓. (38d) dialect plain and board-neutral; "by the normal force",
"battery" not applicable ✓ — one wrinkle, `"net — the sum"` carries an em-dash inside a fit-ladder slot
(cosmetic, folded into F13's neighbourhood, not filed). (38f) the carried-bag and bicycle-brake anchors
are the widest-overlap devices available and are physics-true at depth ✓. (38g) CBSE marked verified,
every other cell carries `needs_teacher_verification: true` ✓. (38h) presets hide, never reorder ✓.

**Rule 35 clean** — the survey's porter / PM Suryaghar / Manali chairlift / ISRO anchors are explicitly
refused (§9). **Rule 41** — titles literal (one truncation issue, F8); "climbs"/"dives" are literal bar
motion and are fine; the self-caught "stays on the books" quarantine is exactly the right instinct and
is noted approvingly.

---

## 0d success test / Phase-0 alarm rule — status

**The test HOLDS. The alarm does NOT fire. Zero renderer edits required; no surgeon dispatch opened,
and I checked specifically for a reason to open one.** The survey budgeted #2 as *"W sign (same
accumulator, three angles)"* and that is exactly what the skeleton spends. Every beat maps to a built,
contracted block: `applied_force {N, angle_deg}` in the (90°,180°] regime ✓ · the `'normal'`
accumulator's hard zero (L44161) ✓ · `mode` members `'coast_no_force'` / `'coast_with_friction'`
(L933‑934) ✓ · `readouts` `'v'` (L1336) ✓ · `controls_visible` `'F_ang'` (L1340) ✓ ·
`slider_controls` per-concept override ✓ · `angle_arc` `'normal'` / `'friction'` / `'applied'` /
`'displacement'` (L43969‑43992) ✓ · `loop_reset_ms` (L43018) ✓ · the `_dsp0` wrap re-anchor
(L45571‑72) ✓ · no `deriveStateMeta.ts` co-edit ✓.

**All three P1s are design fixes, not engine gaps.** F1 is a physics-of-the-authored-state problem
(the engine correctly refuses to hold a body no force is holding). F2's engine gap is real but is
*not* the right fix (ruling 5b) — routing `'F_ang'` into `param_ramp` would build a mechanism whose
output contradicts the formula surface the state prints. F3 is a sentence.

**Two engine ride-alongs stand, unchanged and correctly not depended on:** **E1**
(`work_bar_*` glow ids inert, `peter_parker:field3d_surgeon`) and **E2** (no applied-force component
overlay on flat ground, `peter_parker:field3d_surgeon`). Neither is routed by this report.

---

## `engine_queue`

**Empty for this checkpoint. No `FIX(engine)` finding is filed and none is routed.**

Two pre-existing ride-alongs stand, both `[owner: peter_parker:field3d_surgeon]`, neither newly routed
and neither depended on by this design:

- **E1** — `work_bar_*` glow ids never light behind the `energy_*` prefix gate (live OPEN row
  `nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate`; `isEn` at L43492‑43494). If it
  lands before json-author, S4's focal *may* upgrade to `work_bar_net`. **Optional, not depended on.**
- **E2** — no applied-force component overlay on flat ground (`show_components` resolves the weight
  only, L1319 / L40862‑40865). Ruled **not blocking** for a sign concept (ruling 5a).

**Deliberately NOT routed, and this is the load-bearing negative:** adding `'F_ang'` to
`param_ramp.param`. It would resolve F2's *label* while producing a state whose ledger accumulates
∫F cos θ ds against a printed surface reading `W = F·d·cos θ`. The architect killed exactly this on
concept #1 on physics grounds and was right; I am not re-opening it. This is also the Phase-0 alarm
rule working as designed — the engine is not the constraint here, the design is.

---

## Rubric (advisory, unratified — `docs/EXEMPLAR_RUBRIC.md`; did not affect the verdict)

```
Checkpoint A subset (D1, D2, D8, D9, D10)
  D1 1 · D2 1 · D8 2 · D9 2 · D10 2   = 8/10

weakest: D1 information gain — the three-regime taxonomy is complete after S3, so S5's
         gain rests entirely on two narrower claims (an applied pull can do negative
         work; |F| stays positive on the HUD while W is negative). Real, and enough to
         keep the state — but thin, and it is the state carrying both P1s.
         (evidence: S1 theta=0 positive, S2 theta=180 negative, S3 theta=90 zero — a
         student can state the full rule before S5 opens.)

         D2 arc grammar — the order IS the derivation (three cases -> the sum -> the
         rule), but the PRIMARY aha lands at state 4 of 6 (67%), where every concept in
         the measured exemplar corpus lands it in the first half and concept #1 landed
         it at S2 of 6. The first half carries only the SUPPORTING aha.
         (evidence: skeleton Block 2 designates S4 PRIMARY, S2 SUPPORTING; skeleton
         section 8 states #3 and #4 build directly on S4.)
```

The verdict is identical to what it would have been without this section: F1, F2 and F3 each stand on
their own evidence. No score routed an owner and no threshold is cited.

---

## Handoff

Route to **`alex:architect`**, cycle 1 of 2.

**Fix in this order** — F1 first, because it may change S5's numbers and therefore F2's option space:

1. **F1** — decide how S5's rest becomes permanent across the whole θ range (μₛ ≈ 0.60 envelope), or
   redesign S5 so it does not depend on the crate stopping. Re-derive a, t_stop, d, the pin picture and
   the `−½mv₀²` identity against whatever is chosen, and correct the bounding paragraph's seized-run
   sentence, which is currently right for S3 and wrong for S5.
2. **F2** — give S5 an authored within-state motion of its own, or re-declare the contrast pair.
3. **F3** — restrict the speed correlation to NET work in §1 and S1; keep the (f-4) ban as written.
4. **F4** — raise S2's `R` to ≥ 2900 ms and state the pin margin as an invariant.
5. **F5** — defend or swap the PRIMARY aha, in one sentence, in Block 2.
6. **F6, F7** — state the S4 focal decision (naming the `d` arrow); replace S5's delta cue with one
   that holds at every reachable θ.
7. **F8–F14** — the P3 sweep; F8's replacement titles are VERBATIM and can be applied as-is.

**Keep verbatim, do not re-open:** the S1/S2 contrast pair and its four-way visible delta · the S2
arrow-vanish-over-a-held-bar beat · the `ledger-split` coining and its justification · the three
misconception pivots (S2/S3/S5) and their `visual_counter` wording · the carried-bag and
bicycle-brake anchors · the Rule-38 ring plan and both cut checks · the home pose `−5.4` and the
whole bounding discipline · all three `work_scale_J` values · the scar-compliance table.

**Cycle-2 note for the reviewer (me):** F1's chosen resolution needs re-checking against the seized
run specifically, not just the loop — that is the check this cycle's skeleton did not run, and it is
the check that would have caught it.
