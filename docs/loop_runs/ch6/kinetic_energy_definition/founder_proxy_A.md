# FOUNDER_PROXY — CHECKPOINT A (design gate) · `kinetic_energy_definition` · cycle 0

## VERDICT: `DESIGN_FIX` → `alex:architect` (cycle 1 of max 2)

Four P1s. This is a strong, unusually well-evidenced skeleton — the engine citations spot-checked
are overwhelmingly correct (including the one the dispatch asked to distrust most), the Phase-0
"zero renderer edits" bet holds, and R1/R3 are genuinely good refutations I concur with. But the
concept's PRIMARY aha is staked on a panel layout the design itself is unsure of and defers proof
of until after the build; and three of the five guided states carry numbers or strings that
contradict what will actually be on screen.

**The single most important sentence in this report:** as authored, S2 shows the bar multiply by
**four** and S3 also shows the bar multiply by **four**. The one thing this concept exists to teach
— that speed is squared and mass is *not* — never appears on screen.

---

## Pass 1 — scar pre-read

Ran `query_engine_bug_queue.ts positive_negative_zero_work --open` (15 rows) + all five accumulated
ch6 `scar_candidates_*.sql` files (31 distinct `bug_class` values).

| Scar class | Result |
|---|---|
| `nlb_multibody_lane_gap_is_along_z…` | Discharged (off-axis camera + stagger) — but see F7, F10 |
| `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` | Discharged; arithmetic re-derived, correct |
| `nlb_static_state_authored_on_the_track_bound…` | Discharged, over-conservatively — see F9 |
| `nlb_loop_reset_clears_checkpoint_stamp…` | Discharged; t₂/R = 0.34 < 0.55 ✓ |
| `nlb_frozen_pin_lands_within_one_frame…` | Discharged, and **better than claimed** — see C4 |
| `nlb_motion_archetype_declared_from_a_between_state_delta…` | **Partial recurrence at S3** — see F3 |
| `state_glow_focal_dims_one_half_of_the_relation…` / `authored_state_glow_focal_silently_voids…` | Discharged by construction (zero `glow_focal`) |
| `explore_state_discoverables_authored_only_as_unrendered…` | Discharged in §10(a) |
| `explore_controls_not_ring_gated…` / `explore_state_formula_surface_asserts_a_relation…` | Discharged |
| `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` | Discharged for numbers; **breached for the anchor** — F12 |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | **Recurrence, inverted** — F9 |
| `nlb_work_bar_glow_ids…`, `nlb_angle_arc_radius…`, `nlb_displacement_vector_is_single_body…`, `nlb_work_probe_globals…`, `nlb_work_bar_tracks_misalign…` | N/A (no work bars/arc/d-vector). The d-vector row binds on F7's remedy |
| `nlb_friction_vector_first_frame_reveal_tint…` | **LIVE and unaddressed** — S5 renders a friction arrow; the OPEN t=0 contrast hole applies. Engine-owned, but the skeleton should name it as known-inherited on S5 |

---

## Pass 2/3 — engine verification of the four RISK claims (read at source)

**RISK-2 layout claim — CORRECT, and the architect read the code better than the engine's own comment.**
`nlbBuildEnergyPanel` L43515-47 emits `nlb_en_g0`/`nlb_en_g1` as sibling **block** divs;
`nlbApplyEnergyLayer` L43633: `gEl.style.marginTop = (g > 0) ? "9px" : "0";` — group 1 is **below**
group 0. Both draw `NLB_EN_COL.K = "#FFCA28"` (L43396) — identical amber. The engine's own comment
at L43206 says *"SEAM L's two compact **side-by-side** bar groups"*. **That comment is wrong.**

**RISK-1 gate/caption/percent — all four sub-claims verified.** L43624 `if (!cfg && !hasWk) { hide }`;
L43643-44 empty-caption hide; `nlbEnPct` L43466-67 rounds to 3 dp; `nlbFitEnergyPanel` L43690-712
measured ladder.

**RISK-3(a) no snap-back — CORRECT.** `nlbResetTrajectory` L45447-84 rewinds `s`,`v`,`a`,`F_net`,
nulls `_ramp_last` (L45467), **never touches `b.m`**; `nlbRunParamRamp` L42645-66 is a pure closed
form of `t_ms`.

**RISK-3(b) live billboard — CORRECT.** `nlbUpdateMassText` L40597-611 called per frame (L45857).
*But see F3 — this resolution is the finding, not the reassurance.*

**RISK-4 stamps — CORRECT.** `capture` enum L1500 carries `'K'`/`'v'`; `nlbCpStampText` L44755-98;
interpolation branch L44767-69 `vsq = v² − 2·a·back` exact for constant a.

**Ghost-bar descope — CORRECT.** `nlbPublishEnergy` L43205: `if (!b || b.ghost || b.fixed) continue;`
Group cap verified L43515 (`g < 2`) and L43626 (`.slice(0, 2)`). Unbuildable as stated.

---

## Pass 4 — per-state table

| state | correct | order_ok | labels | sound_off | distinct | problem_or_missing | P |
|---|---|---|---|---|---|---|---|
| S1 `moving_body_has_energy` | Y | Y | Y | Y | Y | None. Clean opener; formula-free by design is right | — |
| S2 `speed_counts_twice` | Y | Y | Y | **N** | **N** | 4:1 read is two amber bars at **10%/40%** of a 186 px track, **stacked vertically, baselines ~252 px apart**. Plus an unmeasurable "twice the ground" claim | **P1 (F2)**, P2 (F7) |
| S3 `mass_counts_once` | **N** | Y | Y | **N** | **N** | Ramp 2→8 kg is **×4**, every string says **×2**; bar multiplies by 4 — **identical to S2**. Cause (mass) has **no rendered physical correlate** | **P1 (F1)**, **P1 (F3)** |
| S4 `never_negative` | Y | Y | Y | Y | Y | Equality read from two 22.5% stubs on separate baselines; numerals carry the claim, not the bars | P2 (F5) |
| S5 `check_the_numbers` | Y | Y | Y | **N** | **N** | Same 5 kg / 2 and 4 m/s / 10 and 40 J as **S2**; delta cue is S2's claim reversed | **P1 (F4)**, P3 (F13) |
| S6 `explore` | Y | Y | Y | Y | Y | Declared control "drag the cart" **stops the demo dead** (`b.v = 0`, L42578) | P2 (F8) |

---

## Findings

### P1 — F1 · S3 multiplies mass by FOUR while every string says TWO, and the resulting bar factor is identical to S2's
**Owner: `alex:architect`**

- ramp: `param_ramp {param:'m', from: 2, to: 8}`; bar "climbs **16.0 to 64.0 J**"
- delta cue: **"Double mass, double K"** · title: **"Twice the mass, twice the energy"**

8/2 = **4**. 64/16 = **4**. And S2: 40/10 = **4**.

Two defects in one number: (1) the cue and rail title assert a doubling the animation does not show
(Rule 32c); (2) a student who watches S2 then S3 sees **the bar multiply by exactly four, twice** —
the linear-vs-quadratic distinction is invisible.

**Fix at design:** ramp `m` **2 → 4** (K 16.0 → 32.0 J). Strings become true, S2/S3 finally reads
"speed doubled → ×4; mass doubled → ×2". Also keeps F3's remedy inside its clamp and lowers the
concept peak, which F2 needs.

### P1 — F2 · The PRIMARY aha is staked on two same-coloured bars stacked VERTICALLY at 10% and 40%, with proof deferred until after the build
**Owner: `alex:architect`**

- Groups stack vertically (L43515-47, L43633 `marginTop:9px`); same colour `#FFCA28` (L43396)
- Track height step 0: `NLB_EN_STEPS[0].trk = 186` px (L43413)
- With `bar_max_J = 100`: 10 J → 10% = **18.6 px**; 40 J → 40% = **74.4 px**
- Vertical separation of the two fills' baselines: cap 15.6 + margin 5 + track 186 + sym 20.9 +
  value 15.6 + group margin 9 = **~252 px**

The skeleton's own words (§Block 2): *"its energy bar standing four times as tall"* renders as **two
short amber stubs, one ~250 px above the other, on separate baselines.**

The skeleton knows (RISK-2) and routes it forward: *"physics-author must confirm at THE EYE… If it
does not, that is a legibility finding for founder-proxy."* **That is the concept-#2 failure
verbatim** — a permitted-but-unexercised path staged to be discovered after the build, on the state
carrying the PRIMARY aha.

**The scale is an authored choice, not a constraint.** Worked alternative, all scars re-checked:
- S5 at `v0 = 5`: K₀ = 62.5 J; flags at 4.00/2.00 m/s → d = 0.918/2.143 m (`s_m` −4.482/−3.257),
  t₁ = 0.204 s, t₂ = 0.612 s (0.26·R ✓), rest t = 1.020 s, s = −2.849 ✓, pin margin **387 ms** ✓
- S5 at `v0 = 4.5`: K₀ = 50.6 J; t₁ = 0.102 s, t₂ = 0.510 s, rest 0.918 s, margin **489 ms** ✓
- With S3 at 2→4 kg the concept peak becomes **50.6 J** → `bar_max_J = 55` puts S2 at **18% and 73%**,
  S1 73%, S4 41%, S5 92%. Same 4:1 ratio, rendered as "nearly the full track against a stub."

**Required in cycle 1:** (a) pick the shared bar scale for **within-state legibility** and recompute
every state's peak; (b) **write the vertical stacking into §3 and §10(h)** — as written, downstream
agents would author narration for a side-by-side picture; (c) **name the fallback now**.

**Founder note (PRIME DIRECTIVE).** If cycle 1's honest answer is "only a row layout fixes this",
that is an **engine** fix and a **Phase-0 alarm** → founder re-scope call, not the loop's. Not routed,
because a blanket `flex-direction:row` is *not* safe: #9 authors up to 5 slots per group, and
2 × 5 × 46 px + gaps ≈ 570 px would eat the left half of the canvas.

### P1 — F3 · S3's taught variable has no rendered physical correlate; §3's Rule-32a claim is false against the engine
**Owner: `alex:architect`**

- `NLB_BODY_SIZE = 0.55` (L39592), verbatim comment: *"world units — **MASS-INDEPENDENT** (Rule 29:
  size is never a magnitude cue here)."* A cart at 8 kg is pixel-identical to a cart at 2 kg.
- `nlbUpdateMassText` (L40597-611) and `nlbPublishEnergy` L43209 both read the same `b.m` on the same
  frame; `nlbUpdateEnergyPanel` L43745 reads it that frame. **There is no "first".**
- Skeleton §3 asserts *"the billboard number changes first — the bar's climb is its consequence."*

Partial recurrence of `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control`
— the declared `ramp-and-track` archetype is discharged by a *number* incrementing, not by a motion.

**A zero-edit correlate exists.** `nlbArrowLen(magN) = |F| × NLB_ARROW_SCALE` with
`NLB_ARROW_SCALE = 0.048`, clamped `[0.55, 2.80]` (L39661-63, L40808-13). With `arrows:{weight:true}`
the weight arrow grows 19.6 N → **0.94** at 2 kg to 39.2 N → **1.88** at 4 kg: a visibly, exactly
doubling arrow that **is** the mass, inside the clamp. (The clamp bites at 58.3 N ≈ 5.95 kg — an
independent reason 2→8 is wrong and 2→4 is right.)

### P1 — F4 · S5 verifies the exact numbers S2 already showed, and its delta cue restates S2's claim
**Owner: `alex:architect`**

S2: two **5 kg** carts at **2** and **4 m/s** → **10.0 J** and **40.0 J**.
S5: one **5 kg** cart, flags at **4.00** and **2.00 m/s** → **40.0 J** and **10.0 J**.
Delta cues: S2 "Double speed, four times K"; S5 "Speed halves, K quarters" — one claim, two
directions. Rule 32c requires the cue to name the state's *one new thing*.

S5's genuinely new content — K falling continuously, and exactly 0.0 J at rest (`nlbEnPct(0,100) → 0`,
`nlbEnFx(0,1) → "0.0 J"`, negative-zero clamp L43450) — is not what its caption names.

**Cycle 1:** (a) re-pick flag speeds so verification lands on values no earlier state rendered;
(b) re-cue S5 on its own claim.

---

### P2 — F5 · S4's "exactly equal" is carried by two 22.5% stubs on separate baselines
§10(d) argues deflection over calm *because* equality is hard to read at 10% — that argument
condemns **S2's 10% bar**, which the skeleton accepts without comment. Folds into F2's scale decision.

### P2 — F6 · The shared-scale guarantee is void below a ~579 px viewport, on exactly the states that need it
`nlbFitEnergyPanel` (L43690-712) steps down when panel bottom > `innerHeight − 12`. Single-group
bottom = **315 px**; two-group = **567 px**. Below ~**579 px** viewport, S2/S4 drop to
`NLB_EN_STEPS[1]` (`trk:138`) while S1/S3/S5/S6 stay at step 0 (`trk:186`) — the same 40.0 J renders
**74 px** in S1 and **55 px** in S2. THE EYE runs 1280×720 (`screenshotter.ts` L297) and will
**never see this**.

### P2 — F7 · S2's "the fast cart covers twice the ground per second" has no rendered measurement
Carts start **2.0 m apart** (s₀ = −5.4, −3.4), so there is no same-start-line read; the gap grows
2.0 → 6.0 m, not a factor of two of anything on screen. §10(b) carries the DoD line *"No claim
without a rendered measurement"*. The remedy is blocked by the OPEN scar
`nlb_displacement_vector_is_single_body_so_a_compare_state_measures_only_one` → **delete the claim**.

### P2 — F8 · S6's declared "drag the cart" control stops the demo dead
`nlbApplyBodyDrag` L42577-79 (uncoupled branch): `b.s = sNew; b.v = 0;`. A drag **zeroes velocity**;
K collapses to 0.0 J and stays until the v0 slider is touched (L42400). Dragging is a
reposition-and-stop gesture here, not a live control.

---

### P3 — F9 · False engine citation: the track bound is ±`length_m`, not `length_m − 0.55`
`nlbBoundsM` (L45599-616) returns `{lo: −lenM, hi: lenM}` — the bound is **±6.0**. `length_m − 0.55`
is the *authoring inset* from the OPEN directive's probe, not the engine's clamp. Design is safe
(max 5.15), but this is the inverse of the filed
`architect_declares_an_engine_limit_without_checking_the_per_concept_override_path`, and #4…#12 will
clone this paragraph.

### P3 — F10 · Gratuitous camera deviation on the compare states
S2/S4 author `[3.5, 2.6, 9.5]`. The shipped two-body compare on this exact apparatus —
`work_done_by_constant_force` STATE_5/6 — uses **`[3, 2.5, 9]`**, already past the lane directive's
projection check. A new camera re-opens that check for no stated gain.

### P3 — F11 · Rule 41: "Speed halves, K quarters"
"Quarters" as a verb is not basic literal English for an ESL Class-11 reader (41c). Moot if F4 re-cues.

### P3 — F12 · The braking anchor's payload is a ×4 stopping distance this concept never shows
§9: *"twice the speed… about FOUR times the distance to stop."* Stopping distance = v²/2μg is
work-energy + friction — #4 and #10 content. §10(b) already forbids naming it as a number; the
anchor's whole payload **is** that number. Declare it as a forward-reference hook, or keep it
qualitative.

### P3 — F13 · S5's single formula surface will wrap
`#nlb_formula` (L41957): `right:22px; max-width:340px; font:600 22px/1.45 'Cambria Math'`. Stamp
`first flag:  v = 4.00 m/s  ·  K = 40.0 J` ≈ 40 chars ≈ 440 px → wraps. Base + **two** stamps → up
to 5 ragged lines. Precedent is thinner than it looks: #1 STATE_4 shipped **one** ~36-char stamp.

### P3 — F14 · Record that Rule 16a is delivered narration-only
The ghost-bar descope is engine-forced and correctly evidenced. But the wrong expectation's
*consequence* is never shown. Record in §4 as "16a delivered as a numeric contrast, not a rendered
wrong-expectation" so quality-auditor does not score a full 16a beat that was never built.

---

## Concurrences

- **C1 — S2/S4 as a declared contrast pair: GENUINE.** S4's idea (K carries no sign) is not derivable
  from S2 (both S2 carts move right; sign never tested). It *is* algebraically derivable from S3's
  formula — which is precisely why Rule 16a exists. **The state that fails the "distinct idea" test
  is S5, not S4 (F4).**
- **C2 — The empty `advanced` ring is ACCEPTABLE.** Rule 38a does not require one. `readouts` (L1336)
  has no momentum, so `K = p²/2m` would assert an unrendered number; nothing renders a second frame.
  The refusal to re-ring S5 as advanced to make the preset table look full is the right call.
- **C3 — R3's rejection of an accelerating cart is arithmetically CORRECT.** (R/t_flag)² at R = 2.2 s,
  t_flag ≤ 1.12 s gives (2200/1120)² = **3.86**. Deceleration peaks at t = 0.
- **C4 — S5's pin margin is BETTER than claimed.** At h = 1/60, v_n = 6 − 4.9n/60 crosses zero between
  n = 73 (v = 0.0383) and n = 74 → discrete rest at **t ≈ 1.2333 s**. Margin vs the pin at
  `clamp(0.60·2400, 150, 2250) = 1440 ms` is **~207 ms**, not 182.
- **C5 — The #3/#4 boundary invariant is sound and mechanically checkable.** `nlbEnergyPanelLabel`
  (L43480-93) returns exactly `"Energy bars"` with energy bars and no work ledgers. The internal
  always-on `eng.W_applied_J` (L43763) surfaces only through `E_dissipated`, never authored here.
- **C6 — S6's overflow-by-construction claim holds.** `v0 ∈ [−5,5]`, `m ∈ [1,8]` → K_max = **100.0 J
  < 110**; a body drag cannot import energy (`b.v = 0`).

---

## engine_queue (informational — Checkpoint A does not issue `FIX(engine)`; nothing here blocks)

| # | Finding | Owner | Tag |
|---|---|---|---|
| E1 | L43206 comment reads *"two compact **side-by-side** bar groups"*, but L43633 stacks group 1 below group 0. The comment is false and sits at exactly the read point a future architect uses to design a two-body compare (#4, #9, #10 all need one). | `peter_parker:field3d_surgeon` | ride-along, non-blocking |

---

## Rubric (advisory, unratified — did not affect the verdict)

```
Checkpoint A subset (D1, D2, D8, D9, D10)
D1 1 · D2 2 · D8 2 · D9 1 · D10 2   = 8/10
weakest: D1 information gain — S5 stamps the same 5 kg / 2 and 4 m/s / 10 J and 40 J that S2
         already rendered; S3 multiplies the bar by 4 exactly as S2 does
         D9 title as a teaching claim — "Twice the mass, twice the energy" is false against its
         own authored ramp
Not scored at Checkpoint A: D3–D7 (need the built artifact).
```

## Cycle budget

**Cycle 1 of a hard maximum 2** (founder instruction, this session). If F2's legibility question
cannot be resolved inside cycle 2 — i.e. if the honest answer is "only a side-by-side group layout
makes the PRIMARY aha read" — **`ESCALATE` rather than spend a third cycle**: that is a Phase-0
alarm and a renderer-scope decision the loop does not own.
