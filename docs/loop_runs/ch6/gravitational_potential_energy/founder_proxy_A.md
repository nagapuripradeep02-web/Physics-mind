# FOUNDER_PROXY — CHECKPOINT A (design gate) — `gravitational_potential_energy` — cycle 0

> Persisted verbatim by the dispatching session. founder-proxy is report-only and cannot write
> repo files. See also the sibling report `../potential_energy_definition/founder_proxy_A.md` —
> **the two reports DISAGREE on collision 2**; the dispatching session's adjudication is recorded
> at the end of this file under "DISPATCHING SESSION — COORDINATED RULING".

## VERDICT: `DESIGN_FIX` → `alex:architect` (cycle 1 of max 2)

This is a strong skeleton — the best-verified §0 I have read in this chapter, and its S2 dwell arithmetic, its `h_ref_m` single-field proof and its ring plan all survive independent recomputation. But it ships **five P1s**, and three of them are the same defect wearing three costumes: **the number that carries the claim is rendered in neither of the two states being compared.** S3 (the PRIMARY aha), S4 and S5 each ask the student to hold an unrendered number in their head across a state click. On a concept whose entire subject is *which numbers are real and which are bookkeeping*, that is the wrong place to economise. Add a genuinely too-tight work scale on S5 that fires a `[PM_NLB_*]` warn THE EYE's H4 fails on, and an explore state missing the concept's own middle term, and this needs one more cycle before physics-author runs.

Both cross-sim collisions the dispatch named are **real**, and I adjudicate them below — collision 1 against the architect, collision 2 mostly in the architect's favour with one cheap sentence owed.

---

## 1. ADJUDICATION — COLLISION 1: is S5 `#6`-S1 with different numerals?

**Ruling: as designed, YES. S5 does not earn its place.** It is fixable, not deletable — but it must change.

### The evidence

| | #6 STATE_1 | #7 STATE_5 |
|---|---|---|
| apparatus | one block, 30° incline, `initial_position_m` fixed | one cart, 30° incline, `initial_position_m` fixed |
| motion | launched up frictionless, rises, returns | launched up frictionless, rises, returns |
| archetype | `cycle-compare` | `cycle-compare` |
| instruments | `bars:['U_grav']` + `work_accumulators:[{gravity}]`, one panel | `bars:['U_grav']` + `work_accumulators:[{gravity}]`, one panel |
| formula surface | `ΔU = −W gravity` | `ΔU = −W by gravity` |
| delta cue | "Negative work, stored as U" | "Work bar mirrors U" |
| claimed idea | ΔU = −W_c IS the definition (PRIMARY aha) | ΔU = −W applied to gravity ⇒ derives U = mgh |

Every physical and instrumental element is the same. The declared difference is *the derivation of U = mgh from the #6 relation* — and **nothing on S5's screen performs that derivation.** To get U = mgh from ΔU = −W_gravity you must show W_gravity = −mg·Δh. S5 renders no Δh, no mg·Δh product, no height bracket. `newtons_laws_body` has no instrument for it. The derivation therefore lives entirely in narration, on a concept governed by Rule 24 ("the sim is the teacher's silent VISUAL", reads with sound off).

Strip the narration and S5 is: an incline, a cart, a U bar, a gravity work bar, and `ΔU = −W by gravity` on the formula surface. That is #6's opening screen. This is precisely the founder's #4/#5 complaint — *"it looks same thing explained in all the simulations"* — reproduced across a concept boundary instead of a state boundary. The `#4`-STATE_5 deletion standard asks: *if I deleted this, what could a student no longer answer?* As authored, the answer is "nothing they could not answer from #6".

### Second, independent defect in S5: the mirror is false on screen

`nlbHeightM` (L48240–48244) reads `h_ref_m`; S5 authors `h_ref_m = 0` (ramp base) with the cart launched from h = 1.4 m. So:

- the U bar **opens at 34.3 J** (57% of the 60 J track) and creeps to 44.1 J;
- the gravity W bar **opens at 0** and dips to −9.8 J.

They do not mirror. Only their *changes* mirror. The stamp — `checkpoint:  U = 44.1 J · W gravity = −9.8 J` — puts **44.1 and −9.8** side by side under a formula surface reading `ΔU = −W by gravity`. Those two numbers are not equal and opposite. The equality the state exists to show is `44.1 − 34.3 = 9.8`, and **34.3 is not latched anywhere** — it was the bar's opening value 353 ms earlier and is gone by the time the stamp appears.

#6 avoided exactly this by pinning `h_ref_m = −1.8` at the home pose so `U ≡ −W_gravity` frame-by-frame. #7 cannot copy that (its tail descends below the launch line, which would drive U negative — L48948 warn). So #7 must show the difference a different way.

### What would make S5 earn its place — the constructive path

There is one idea here that **#6 provably cannot teach and #7-S3 has just made available**: *#6 hid the offset by pinning the zero at the start. Now that you know the zero is yours to choose, the coupling still holds — not on U, but on ΔU.* That is a genuine, load-bearing new claim, it is the natural closure of the PRIMARY aha, and it retroactively explains #6's setup as one choice.

To render it, S5 needs **U₀ latched on screen beside U_checkpoint** so the subtraction is visible, not remembered. Mechanisms available (architect's call):
- a second flag just above the home pose (e.g. `s_m = 2.85`, `capture_mode:'first'`, no dwell) — clean, avoids the CRITICAL home-pose-`'first'` FIXED row entirely; or
- a home-armed flag with `capture_mode:'every'` + `dwell_from_pass: 2` (the S2 pattern, already verified working) — but note this produces a **third** stamp line and the skeleton's own §0B.23 caps at 2 stamps / 38 chars against the 340 px surface literal; re-check before choosing.
- `formula_lines` (ordered lines with `at_ms`, L50623–50650) is also authorable if a two-line base helps.

If the architect instead concludes S5 cannot be made to teach something #6 does not, **cut it** and ship 5 states. Either outcome is acceptable; the current S5 is not.

**[P1 · S5 · owner `alex:architect`]**

---

## 2. ADJUDICATION — COLLISION 2: #6 pins `h_ref_m = −1.8`; #7-S3 reveals the zero is a choice

**Ruling: this is mostly GOOD sequencing, and #6 needs no change. #7 owes one clause.**

> ⚠ **The #6 reviewer reached the OPPOSITE conclusion on this same question.** See the
> coordinated ruling at the end of this file.

Three findings from reading #6 at source:

1. **#6's zero line is NOT at the ground.** It sits at `h_ref_m = −1.8` = the block's home pose, *part-way up the slope*, labelled `"U = 0"`, with visible ground below it. A student who watches #6 has already seen the zero placed somewhere other than the floor. That **weakens**, not strengthens, the "ground is THE zero" law.
2. **#6 already ships the forward bridge.** Its DoD (f-2) authorises exactly one sentence: *"The next concept gives gravity's U its own formula, and lets you place the U = 0 line wherever you like."* That is the right sentence in the right place. **Hold it; do not change #6.**
3. **The real gap is on #7's side, and it is in #7's own misconception logic.** #7's Block-1 item 3 and §4 both assert that *S1/S2 plant the floor-zero habit* — *"S1/S2 build the confident habit, S3 breaks it"*. For a student on the default path (who has just watched #6, a declared prerequisite in §8) that premise is **false**: they arrived having seen a zero line that was not the floor. #7's PRIMARY aha is set up against a habit the immediately preceding concept has already loosened, and #7 never acknowledges #6's line at all.

This is not a disaster — it is a **missed free win**. The strongest possible opening for S3 is: *"the last concept put the zero line at the block's start. Here it sits at the ramp's base. Both are correct — watch what changes and what does not."* That converts a silent inconsistency into the concept's own first example.

**Required (P2):** S3 gains one narration clause naming the previous concept's line position as the first instance of the choice, **and** §4's `belief`/planting story is re-pointed so it does not depend on S1/S2 having planted a law that #6 already undercut. **[P2 · S3 · owner `alex:architect`]**

**Also (P3):** the same dashed line is labelled `"U = 0"` in #6, `"h = 0"` in #7-S1/S2/S4/S5/S6, and `"h = 0 (moved)"` in #7-S3. Three strings, one instrument, two consecutive concepts. The #6/#7 split is *defensible* (#6 bans "mgh" and has no h in its vocabulary), but the pair needs one bridging clause in #7-S1 — and I would drop `"(moved)"` outright: it **tells** what the geometry **shows**, and it adds a text change on top of the positional change that Rule 32b wants to be the state's only delta. **[P3 · S1/S3]**

---

## 3. ADJUDICATION — S6: Rule 31 + Rule 37 + the engine attribution

I checked the reader for every claim here, including one where I nearly filed a false finding.

**First, a claim I set out to break and could not:** the config comment at L2185–2190 that says a mechanism is *"IGNORED … in a `mode:'sandbox'` state"* attaches to **`loop_reset_ms`**, not to `idle_auto_sweep`. `nlbRunIdleSweep` (L47652–47669) guards only on `PM_nlbSweepSeized || PM_nlbBodyDragged` — **no sandbox check** — and its call site (L52258) is unconditional. Contrast `nlbRunParamRamp`, which *does* declare "NEVER runs in a sandbox". **The architect's §0A.8 is correct: the m-sweep will run in S6.** S6 is not literally frozen; the U bar and the `mg` arrow breathe.

**(1) Is `m` genuinely the only manipulable? No — verified at source.** `'theta'` is a live token (`controls_visible` enum L1819; `NLB_SLIDER_TOKENS` L47117; `NLB_SLIDER_SPEC.theta` L47127, min 0 / max 60 / step 1, per-concept overridable via `slider_controls` → `nlbSc` L47160–47181), and `nlbApplyParam('theta')` writes `eng.theta_deg` **and** calls `nlbApplySurface` (L47361–47363). `nlbHeightM` reads `eng.theta_deg` live. So **a θ slider varies h at fixed s** — the concept's own middle term — with:
- **no negative-U risk** (θ > 0, s > 0 ⇒ h > 0, no drag needed);
- **no bar_max_J breach**: worst corner m = 3 kg, θ = 40°, s = 2.4 ⇒ U = 3·9.8·2.4·sin 40° = **45.4 J** ≤ 0.9·60 = 54 ✓;
- **no slide**: static hold needs tan θ ≤ μₛ = 0.9 ⇒ θ ≤ 41.99°, so a 15–40° range holds;
- **`idle_auto_sweep` accepts `'theta'`** (L2195), so the sweep can drive the more visual dial.

A sandbox for `U = mgh` that cannot vary `h` is a sandbox missing the concept's own middle term.

**(2) Rule 37 — letter vs purpose. It fails the purpose.** Rule 37 exists because the explore state *stopped dead* after narration and slider drags produced no motion; the founder's fix was "the clock free-runs, the motion loops forever, slider drags drive live continuous motion". S6 as authored has a cart **frozen by design** (μₛ = 0.9, drag off) and a U bar animated by a metronome. The *apparatus* never moves, and the only teacher-driven change (mass) produces **no geometric change in the scene** except the `mg` arrow's length. That is exactly what OPEN row `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` is about — and the architect's blanket disposition #33 **over-claims**: true for S1–S5, **false for S6**. With θ live, the ramp rotates, the cart rides up and down with it, and both problems close at once.

**(3) Engine attribution — over-attributed, but there IS a real engine ask underneath.**

The negative-U limit is real and correctly read (`h_ref_m` comment L1958–1966; guard L48948–48955; bounds `lo = −lenM` L51653). But it **only blocks body drag**. It does not block a θ slider, and it therefore does not justify a one-slider sandbox. Attributing the whole shrinkage to the engine converts an authoring choice into an engine excuse — the inverted form of `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path`.

**Does #6's technique transfer? Partially, and it is the wrong trade for #7.** Parking `h_ref_m` below the track's lowest reachable point works arithmetically (track lo = −4.5 ⇒ h_min = −2.25, so h_ref ≤ −2.25 makes drag safe) — but then U at the cart's rest pose is 2·9.8·(1.2 + 2.25) = **67.6 J > bar_max 60**, so S6 would need its own scale. #6 could afford that (declared sandbox exemption, 560/280); **#7 cannot**, because its §0B.1 mitigation for `energy_bar_track_renders_no_scale_ceiling…` is precisely that all six states share one 60 J scale. And on pedagogy it is worse than the arithmetic: parking the zero line far below the visible ramp, in the very sandbox where the student was just told the zero is theirs to choose, throws away the concept's own aha.

**Ruling splits:**
- **Authoring finding (P1, `alex:architect`):** S6 gains at least `theta` alongside `m` (bounded via `slider_controls` to keep the static hold and the 60 J scale). Body drag stays off — that part *is* the engine limit and is honestly flagged. **[P1 · S6]**
- **Engine queue, RIDE-ALONG, `peter_parker:field3d_surgeon`:** signed / negative `U_grav` rendering. Ride-along, not blocking.

---

## 4. Scar disposition audit (§0A / §0B) — spot-checks against source

Twelve dispositions re-read against the renderer and the live queue.

### Verified CORRECT (checked at the reader, not the seam report)

| Claim | Verification |
|---|---|
| **§0A.1 — `h_ref_m` is ONE field with three consumers** | **CONFIRMED at all four sites.** Config type L1967 (+ comment L1958–1966). Resolver L50937–50938: `energy_h_ref_m` written once (`typeof === "number" && isFinite`). Reader 1 `nlbHeightM` L48240–48244. Reader 2 — the drawn line — L49888–49898 (`y = (eng.energy_h_ref_m \|\| 0) * NLB_WORLD_PER_M`; label `cfg.h_ref_label \|\| "h = 0"`). Reader 3 — `predicted_stop` caption — L49907–49909, same field. **The number and the drawn line cannot disagree. The PRIMARY aha's instrument is sound.** |
| §0A.2 — negative-U guard | L48948–48955, threshold `Ug < -1e-9`, prefix `NLB_ENERGY_SCALE_WARN_PREFIX` ✓ |
| §0A.4 — home-arm + `dwell_from_pass` | `nlbCpArm` L50405–50417 ✓; departure branch L50432–50438 ✓; dwell gate L50462 ✓; `NLB_DWELL_MAX_MS = 5000` L49107 ✓; config comment L2111–2117 states the `dwell_from_pass: 2` use case verbatim ✓ |
| §0A.5 — stamp emitter | `nlbCpStampText` L50551–50594; `"(pass N)"` only when `mode === "every" && _count > 1` (L50593) ✓; `'U_grav'` → `"U = " + nlbEnFx(...)` L50579 ✓; rewound `(1−f)·_dW` L50584–50590 ✓; **default capture is `['K','U_grav']`** so the explicit-`capture` duty is real ✓ |
| §0A.6 — `eye_capture_ms` at state-config TOP level | `visual_eyes.ts` `extractEyeCaptureMs` L221–235 + override L119–121 ✓ |
| §0A.7 — no per-control `min_ring` on this scenario | L1819–1824 ✓ |
| §0A.8 — `idle_auto_sweep` closed to `'F'\|'theta'\|'m'` | L2195 ✓ — **and it genuinely runs in a sandbox** |
| §0A.3 — bounds extend below origin | `nlbBoundsM` L51635–51653, `lo = −lenM` ✓ |
| §0B.2 — ink-lift bounded | h = 0 line and point markers are position-meaning ink → keep depth testing. **Correct.** |
| §0B.11 — frictionless + opposing applied force (CRITICAL) | Probe gates on non-empty `controls_visible`; no guided state has one. S1/S3/S4's F **aids** (F = mg sin θ ⇒ a = 0). **Correct.** |
| §0B.13 — sandbox μ below tan θ | Row demands the standing claim survive the steady state; `U = mgh` at rest does. **Correct.** |
| §0B.34 — S4's declared numeral-reuse exception | Probe compares (mass, speed, energy) **triples**; S4's triple is identical to S1's point-B triple, so the probe would fail. I **uphold the exception** — the identity of the number *is* the physics — **but only if the two paths are visibly compared**; see P1-2. |

### Dispositions that DO NOT hold

**(a) §0B.16 (`worked_loop_resize_patch_bounded_at_the_pin_instant_instead_of_the_loop_end`) is incompletely discharged.** The row's DO requires every ledger extreme checked **with one frame of slack**. §10(d)'s Bounds column is evaluated at **t = R exactly**, with no folded-frame column. #6's arithmetic table *does* carry a `worst folded frame (R + 50 ms)` column; #7 dropped it. **Recurrence of an OPEN architect-owned directive ⇒ automatically P1**, with a live consequence (P1-4).

**(b) §0A.9 / the S6 engine-limit framing** over-attributes — see §3.

**(c) §0B.33 (`taught_variable_has_no_rendered_physical_correlate`)** blanket AVOIDED is true for S1–S5, **false for S6**.

**(d) §0B.34's cross-tab was never run.** #6 performs an explicit cross-state numeral cross-tab; #7 does not, and it has a collision — P2-1.

### The four architect-owned directives

| Row | Status |
|---|---|
| `nlb_dwell_state_authored_without_recomputing_loop_reset_and_eye_capture` | **DISCHARGED.** All five dwell states recomputed from the authored physics; every T, D, R and `eye_capture_ms` reproduces. |
| `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` | **DISCHARGED.** Every pin mid-dwell with ≥ 600 ms both sides (S1/S3 600/600; S2/S4/S5 700/700) ≫ the 167 ms floor; physics frozen inside the window (`hPhys = 0`, L52339) so the margin is exact. |
| `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls` | **DISCHARGED** (weaker than #6's, but no `param_ramp`/`sum_merge` authored, so the surface is small). |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | **PARTIALLY** — see (b) and (c). Every *positive* limit claim quotes type + reader correctly; two *N/A / limit-attribution* claims do not survive the inverted form. |

### Dwell arithmetic — recomputed by hand

**S2 (`dwell_from_pass: 2`) is correct.** m = 2.5, θ = 30°, a = −4.9, v₀ = +3.13, s₀ = 2.8.
- return to s₀: t = 2v₀/|a| = **1277.6 ms** → architect's 1278 ✓
- rise = v₀²/2|a| = 0.99968 m → peak s = 3.7997 ≤ 3.95 ✓; peak h = 1.8998 → caption renders `h = 1.90 m` ✓
- U₀ = 34.3 J ✓; both stamps interpolate to s = s_m exactly (L50565–50568) ⇒ pass 1 and pass 2 **byte-identical "34.3 J"** ✓
- dwell window [1278, 2678]; R = 3178 ≥ 2678 + 500 ✓ (deferral branch L48462 unreachable ⇒ zero `[PM_NLB_DWELL]`)
- `eye_capture_ms` 1978 = 1278 + 700, margins 700/700 ✓
- pass 1 (`_count = 1`) gets no `"(pass 1)"` suffix and no dwell; pass 2 gets both ✓

Others also reproduce: **S1** A@500/B@4200, R 6000 ≥ 5900, pin 4800; **S3** = S1 with `h_ref` 0.3 (5.9 / 35.3 / ΔU 29.4 ✓); **S4** flag t 1750, R 3650, pin 2450, stamp 44.1 J (sin 48.6° = 0.750111 ⇒ 44.1065 → "44.1" ✓); **S5** flag t 353, `'first'` early-continue kills the descent recrossing (L50443) ✓.

**Float check on S3's "bar opens EMPTY":** `Math.sin(30·π/180) = 0.49999999999999994`, so h(0) = 0.6·sin30 − 0.3 ≈ **−5.6 × 10⁻¹⁷** ⇒ U ≈ −1.6 × 10⁻¹⁵ — inside the −1e−9 guard (no warn) **and** inside `nlbEnFx`'s `|x| < 0.05` clamp (L48611), so the surface renders exactly `"0.0 J"`, never `"−0.0 J"`. **S3's opening frame is safe.**

### Unproven-mechanism note

**No shipped concept authors `height_markers` or `h_ref_m`** — grepped `src/data/concepts/*.json`: `energy_layer` in 2, `work_accumulators` in 4, `dwell_ms` in 2, **`height_markers` and `h_ref_m` in zero, `predicted_stop` in zero**. The mesh is built (`marker_h_ref`, L49386–49391) and the reader is sound, but **#7's central visual has never rendered on any concept**, and the architect authors **no probe for it**. See P2-4.

---

## 5. Findings

### P1 — must resolve before `DESIGN_OK`

**P1-1 · S1+S3 (the PRIMARY aha) · `alex:architect` — the invariant the concept is built around is rendered in neither state being compared.**
S3's claim is *"every U value changes, ΔU = 29.4 J does not."* On screen: **S1** stamps 14.7 and 44.1 — **29.4 appears nowhere**, the student must subtract. **S3** renders `ΔU = mgΔh = 29.4 J` as **authored static text** + stamps 5.9 / 35.3. So the "unchanged" quantity is a mental subtraction in one state and a fixed string in the other. Nothing on screen ever *changes state and stays the same* — which is the entire aha. §2 calls it "the stamped ΔU = 29.4 J"; **it is not stamped in either state.**
*Engine:* `formula_lines` (ordered lines with `at_ms`, `nlbRenderStamps` L50623–50650) is authorable — **not** an engine limit.
*Constraint:* 29.4 J must be a rendered quantity in **both** S1 and S3, so the click shows the stamps move and that line hold.

**P1-2 · S4 · `alex:architect` — path independence compares against a distance no state renders.**
S4 draws `d = 1.40 m` and claims "instead of S1's 2.40 m". **S1 authors no `displacement_vector`**, and 2.40 m is rendered by no state. The comparison rests on a number that exists only in narration.
*Fix (pure JSON):* author `displacement_vector {show_value:true}` on S1 too — the single-body-per-state limit is satisfied. Bonus: S4's only visible change then becomes the ramp angle, which is *stronger* Rule 32b compliance.

**P1-3 · S5 · `alex:architect` — does not earn its place as designed; its stated mirror is false on screen.** Full adjudication in §1.

**P1-4 · S5 · `alex:architect` — `work_scale_J = 30` fails its own headroom rule and fires an EYE-H4 warn.**
At the single physics clock (wall R 3178 − dwell 1400 = physics 1778 ms):
- at t = R: s = 0.6202, W_gravity = −12.25·(0.6202 − 2.8) = **+26.70 J** ≤ 0.9·30 = 27 ✓ — a 1.1% margin.
- **with one frame of slack** (which the row explicitly requires): +16.7 ms ⇒ s = 0.5248, **W = +27.85 J > 27.0** ⇒ fails the probe.
- **at a 3-step folded frame** (+50 ms, the engine's cap): s = 0.3348, **W = +30.20 J > work_scale_J = 30** ⇒ `nlbUpdateWorkPanel` L50826–50835 fires `NLB_ENERGY_SCALE_WARN_PREFIX` and the signed bar clamps. §10(d) names *"Zero `[PM_NLB_DWELL]` / `[PM_NLB_ENERGY_*]` console lines"* as an EYE H4 assertion — **the state contradicts its own DoD.**
*Fix:* shorten S5's R (physics ≈1500 ms ⇒ W_end ≈ +10 J), preserving `bar_max_J = 60 = 2 × work_scale_J` — **or** raise `work_scale_J`, which breaks that ratio, so only if the mirror claim is dropped. Resolves cleanly *together with* P1-3.
*Also:* re-derive all of §10(d) with a folded-frame column. Thin-but-passing neighbour: **S4** at R + 50 ms gives U = 53.81 J against 0.9·60 = 54 — 0.35% of headroom.

**P1-5 · S6 · `alex:architect` — the explore state is missing the concept's own middle term.** Add `theta` (bounded 15–40° via `slider_controls`) alongside `m`; keep drag off; re-file the drag limitation as the ride-along engine ask.

### P2

**P2-1 · S5 · numeral collision: 44.1 J is reassigned.** S1 (m 3, h 1.5) and S4 (m 3, h 1.5) *deliberately* both stamp **44.1 J** — that identity is the teaching. S5 then stamps **44.1 J** at **m 2.5, h 1.8**. A student twice taught "44.1 J means 1.5 m" meets it at 1.8 m. §0B.34 checks triples and passes; it never checks rendered numerals. **Run a cross-tab and move S5's flag.** Benign: 34.3 (S2/S5, same configuration ✓) and 35.3 (S3-B / S6 sweep top, both 3 kg at 1.2 m ✓).

**P2-2 · §9 + S3 · the anchor's best asset reaches no narration line.** §9 binds anchor sentences to **S1 and S4 only** — **S3, the PRIMARY aha, the one state floor-numbering was made for, carries no anchor sentence.** That is `skeleton_anchor_specified_in_section_9_reaches_no_narration_line` in its most costly form.
*Rule 35 guard:* floor-numbering conventions differ (ground = 0 vs first = 1). Make the architect's own convention-free phrasing a **binding physics-author constraint**: "the floor you start on", "a floor below it" — never a floor number or naming convention. With that attached, **the anchor is a PASS**.

**P2-3 · S3/§4 · the misconception planting story assumes a student who has not seen #6.** One clause + a re-pointed `belief`.

**P2-4 · Probe set · P1–P5 omit the one mechanism that has never rendered.** Add **P6**: load S3, assert `marker_h_ref` is visible, its world y equals `h_ref_m · NLB_WORLD_PER_M` (L49890), its label renders, and — the part arithmetic cannot answer — that at h_ref = 0.3 m the line sits **above** the ramp's origin and reads as a level rather than being lost in the slab silhouette. Same probe confirms S2's `predicted_stop` caption renders `highest point  h = 1.90 m`.

**P2-5 · S6 · `idle_auto_sweep` range[0] ≠ the authored mass.** S6 authors m = 2 kg with `range:[1,3]`. Engine contract L47646–47649: the sweep starts at `range[0]` at t = 0, so **the first frame snaps 2 kg → 1 kg** while the billboard reads `m = 2 kg`. Set the authored mass to the sweep floor, start the sweep at 2, or verify the billboard is live-driven. (Also: the `m` slider's default glyph is **`m₁`**, L47119 — on a single-body sandbox that implies a second mass; override via `slider_controls.m.label`.)

### P3

- **P3-1 · S5 delta cue "Work bar mirrors U"** — metaphor-adjacent (Rule 41a). Prefer "U up, work down" / "Opposite signs, equal change".
- **P3-2 · `h_ref_label: "h = 0 (moved)"`** — tells what the geometry shows and adds a text delta on top of the positional delta (32b). Drop `(moved)`.
- **P3-3 · `entry_state_map` dangles under both ring cuts.** `relation_to_work → STATE_5` dies under Cut 1, `path_independence → STATE_4` under Cut 2. Name the preset consequence.
- **P3-4 · S2's two-pass stamp is ONE overwritten line, not two.** `cp.text` is rewritten each crossing (L50444). Acceptable and arguably elegant, but the skeleton asserts "two stamps, the SAME number" without saying so. **State it in the DoD so eye_walker knows what picture to judge.**
- **P3-5 · Rule 38g** — CBSE marked VERIFIED on an NCERT chapter-index read; that is syllabus-document verification, not teacher verification. Label it as such.
- **P3-6 · S3 changes two things at the click** — line position *and* formula surface. Defensible on the PRIMARY aha; P1-1's fix largely dissolves it. Name it a Checkpoint-B frame-reading duty.

---

## 6. `engine_queue`

**EQ-1 — RIDE-ALONG · owner `peter_parker:field3d_surgeon` · `nlb_energy_stack_cannot_render_negative_u_grav_so_a_reference_choice_concept_cannot_show_below_its_own_zero_line`**

*Not blocking:* #7 teaches correctly without it — every guided state keeps h ≥ h_ref (S2's tightest margin is 107 ms of physics before the crossing, still 57 ms clear at a 3-step folded frame).

*Why it is real:* this is the one concept whose atomic claim is *"you may put the zero line anywhere"*, and the unsigned stack means the sim **cannot show a body below the line it just called arbitrary**. Consequences already in the skeleton: body drag removed from explore; the §6 drill-down cluster `negative_potential_energy` authored then declared unrenderable; the *"a body at the ground has no U"* misconception only half-confrontable.

*Evidence:* config comment L1958–1966; guard L48948–48955; stack composition L48980–48992 (`nlbEnPct` clamps each segment ≥ 0 while the numeral above stays true — column and numeral diverge silently); drag clamp L51635–51653.
*After:* the U track renders signed (the `work_accumulators` half-track idiom at L50840+ is the obvious donor), or `energy_layer` declares an explicit `signed: true` opt-in so no shipped concept changes.

*Do NOT duplicate:* `energy_bar_track_renders_no_scale_ceiling_so_two_states_draw_one_value_at_two_heights` (same owner) already carries the scale-label half of this instrument's debt.

---

## 7. Candidate scar rows

No `bug_class` collisions with this run's other candidate files.

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('skeleton_asserts_an_invariance_across_two_states_whose_comparison_numeral_is_rendered_in_neither',
 'A concept built on "this number does not change" leaves the number to mental arithmetic in one state and to static text in the other',
 'CRITICAL', 'alex:architect',
 'The invariance is a DIFFERENCE (delta-U, a path length, a stored value) while the instruments render only LEVELS. Each state passes its own DoD because each renders its own numbers; the claim lives only in the gap between two states, which no per-state check reads.',
 'When a state pair exists to show a quantity UNCHANGED, that quantity must be a rendered surface in BOTH states, so the click shows the other numbers move and this one hold. Author it on the formula surface (formula_base or formula_lines) or as a stamp. A number the narration computes is not a rendered number.',
 'js_eval',
 'For every declared contrast pair: collect all rendered numerals (formula surface lines + checkpoint stamps + marker captions) in each state. Assert the quantity the pair claims is invariant appears as a rendered numeral in BOTH states. Fail if it appears in one or neither.',
 'OPEN', ARRAY['gravitational_potential_energy']::text[], ARRAY[]::text[],
 'ch6 concept-7 founder_proxy Checkpoint A cycle 0 (2026-08-09)', 'incident'),

('cross_state_numeral_collision_reassigns_a_value_the_concept_established_as_a_teaching_invariant',
 'A later state stamps the same joule numeral at a different mass and height, after two earlier states deliberately used it to mean one configuration',
 'MAJOR', 'alex:architect',
 'The existing freshness row checks (mass, speed, energy) TRIPLES. A concept whose lesson IS "equal numbers mean equal configurations" is broken by an equal NUMERAL at an unequal configuration, which the triple check passes.',
 'Every skeleton runs a cross-state numeral cross-tab before handoff: list every rendered numeral per state, and for any numeral appearing in more than one state, state explicitly whether the repeat is the teaching (same configuration) or a collision (different configuration). A collision is re-authored, not annotated.',
 'js_eval',
 'Harvest every rendered numeral per state. For each numeral appearing in two or more states, compare the authored (mass, height, reference) tuple behind it. Fail on any numeral shared by two states whose tuples differ.',
 'OPEN', ARRAY['gravitational_potential_energy']::text[], ARRAY[]::text[],
 'ch6 concept-7 founder_proxy Checkpoint A cycle 0 (2026-08-09)', 'incident'),

('explore_state_shrunk_to_one_control_by_an_engine_limit_that_blocks_only_one_other_control',
 'A sandbox dropped to a single slider and a motionless body, attributed to a rendering limit that in fact forbids only body drag while a live engine-supported slider for the concept''s own second variable went unauthored',
 'MAJOR', 'alex:architect',
 'A real engine limit was read correctly and then over-applied: it removed drag, and the design absorbed the rest of the loss silently instead of enumerating the remaining authorable controls against the closed token list.',
 'When an engine limit removes a control from an explore state, the skeleton enumerates EVERY remaining member of the scenario''s control token enum and states, per token, why it is or is not authored. Rule 31 requires the explore state to expose ALL relevant controls; a token that drives a term of the taught formula and is refused needs its own named reason, not the limit''s coattails.',
 'js_eval',
 'For the explore state: read the scenario''s controls_visible token enum from the renderer config type, and the taught formula''s variables from the concept JSON. Assert every formula variable with a corresponding live token is either exposed or carries an authored refusal reason. Separately assert at least one rendered apparatus element (not an instrument bar) changes geometry under each exposed control.',
 'OPEN', ARRAY['gravitational_potential_energy']::text[], ARRAY[]::text[],
 'ch6 concept-7 founder_proxy Checkpoint A cycle 0 (2026-08-09)', 'incident'),

('paired_concept_pins_a_reference_the_sibling_later_reveals_as_an_arbitrary_choice_with_no_bridging_line',
 'Concept N pins a zero reference to make its identity hold exactly; concept N+1 teaches that the same reference is free, and neither names the other, so a student sees the line move between concepts with no explanation',
 'MAJOR', 'alex:architect',
 'Two skeletons authored in parallel each honoured their own boundary correctly. The defect lives only in the SEQUENCE: the earlier concept''s setup silently becomes an instance of the later concept''s aha, and the later concept''s misconception-planting story assumes a student who never saw it.',
 'When a concept pair shares an apparatus and one member reveals a setup choice the other made, the revealing concept names the earlier configuration as its first worked example, in one clause. A misconception-planting story must be written for the student who arrived through the declared prerequisite path, not for a student meeting the apparatus cold. Check the shared instrument''s LABEL string across the pair as well as its position.',
 'manual',
 'For a concept whose prerequisite shares its scenario: diff the shared instrument''s authored configuration and label string across the two JSONs. Where they differ, assert the later concept has one narration clause naming the difference. Separately re-read the later concept''s misconception belief against what the prerequisite already showed.',
 'OPEN', ARRAY['gravitational_potential_energy','potential_energy_definition']::text[], ARRAY[]::text[],
 'ch6 concept-7 founder_proxy Checkpoint A cycle 0 (2026-08-09)', 'incident'),

('nlb_energy_stack_cannot_render_negative_u_grav_so_a_reference_choice_concept_cannot_show_below_its_own_zero_line',
 'The unsigned energy stack clamps a negative U_grav column at zero while its numeral stays true, so the one concept whose claim is that the zero line is arbitrary cannot show a body below it',
 'MAJOR', 'peter_parker:field3d_surgeon',
 'energy_layer renders U_grav on an unsigned track (nlbEnPct clamps each segment at >= 0, L48980-48992) while the numeral above it prints the true signed value; the L48948 guard warns rather than rendering. Correct for every concept that measures from the lowest point, wrong for a concept that teaches the reference as a free choice.',
 'A magnitude track whose underlying quantity can legitimately take either sign renders signed (the work_accumulators half-track idiom already in this file), behind an explicit opt-in so no shipped unsigned concept changes. Until then, a concept teaching reference choice must declare the below-the-line case as an unrenderable residual, and must not lose an explore control to it without saying so.',
 'js_eval',
 'Drive an incline state with energy_layer.h_ref_m authored ABOVE the body''s reachable minimum. Across the full descent, sample the U numeral and the drawn column height each frame; assert they agree in sign and magnitude, and assert zero console lines carrying NLB_ENERGY_SCALE_WARN_PREFIX.',
 'OPEN', ARRAY['gravitational_potential_energy']::text[], ARRAY[]::text[],
 'ch6 concept-7 founder_proxy Checkpoint A cycle 0 (2026-08-09)', 'incident');
```

*Not minted, deliberately:* the S5 folded-frame overrun is a **recurrence** of the existing OPEN directive `worked_loop_resize_patch_bounded_at_the_pin_instant_instead_of_the_loop_end`. Cite the recurrence; do not create a sibling class.

---

## 8. Files the founder should look at first

1. `docs/loop_runs/ch6/gravitational_potential_energy/skeleton.md` §3 rows **S1 / S3 / S4 / S5** — P1-1, P1-2 and P1-3 side by side.
2. Same file, **§10(d)** — the missing worst-folded-frame column is P1-4 in one glance.
3. Same file, **§3 row S6** + **§0A.9** — the explore state and its engine-limit justification.
4. `docs/loop_runs/ch6/potential_energy_definition/skeleton.md` §3 row **S1** and its home-pose paragraph — the other half of both collisions.
5. `src/lib/renderers/field_3d_renderer.ts` **L48948–48992** — the negative-U guard and the clamped unsigned stack, the engine ask in twelve lines.

---

```
RUBRIC (advisory, unratified; did not affect the verdict)
  Checkpoint-A subset (D1, D2, D8, D9, D10)
  D1 1 · D2 2 · D8 2 · D9 2 · D10 1   = 8/10
  weakest: D1 information gain — S5 re-runs #6-S1's apparatus, instruments, archetype and
           formula surface; its claimed derivation of U = mgh is performed by no rendered
           element. S2 is separately thin.
           D10 explore earns its place — one slider on a two-variable formula; the concept's
           own middle term h is unmanipulable and the cart never moves.
  D2 2: rings ordered qualitative→quantitative→derivation, advanced contiguous before explore,
        both cuts checked, aha at S3 of 6.
  D8 2: exactly two watches at genuine pivots (S3, S4).
  D9 2: all six titles state a result in plain literal English, meaning in the first words.
```

---

## DISPATCHING SESSION — COORDINATED RULING on collision 2 (2026-08-09)

**The two Checkpoint A reviewers disagree, and neither is simply wrong.** Recorded, not smoothed
(the chapter's own standing lesson from the #3 build: *"Report a measurement disagreement; do not
smooth it."*).

- **#6's reviewer (P1-1):** #6's `h_ref_m = −1.8` pin spends #7's aha. Fix in **#6** — route (a),
  one reference at the ramp's foot for all four states.
- **#7's reviewer (§2):** #6's line is already *not* at the ground, so it loosens rather than
  hardens the floor-zero law; #6 also already ships a forward-bridge sentence. Fix in **#7** — one
  bridging clause, and re-point the planting story.

**Both agree on the underlying fact:** #7's misconception-planting premise ("S1/S2 build the
floor-zero habit") is FALSE for a student who arrived through #6, the declared prerequisite. They
disagree only about which side pays.

**Ruling: do BOTH, and the reasons are independent.**

1. **#6 takes route (a)** — not primarily for the cross-concept reason, but because it resolves
   three #6-internal findings that stand on their own evidence: the unexplained 49 J / 1.25 m
   reference jump into the explore state (P1-3), S3's thinness under the pinned reference (P2-4),
   and the fact that `U = −W` pointwise is a pinned special case while `ΔU = −W` is the law the
   concept claims to teach. #7's reviewer's counter-argument addresses only whether route (a) is
   *necessary for #7*; it does not touch any of those three.
2. **#7 adds the bridging clause anyway** (its P2-3), because route (a) makes #7's planting premise
   *true* rather than merely worked-around: with #6 at the ramp foot and #7's S1/S2 at the ramp
   base, #7-S3 moving the line to the start height becomes a genuine first-time change — and naming
   #6's line as the first worked example costs one sentence and makes the sequence explicit.

**Consequence for #7's S5, checked before ruling:** #7's reviewer argued #6 "avoided the false
mirror by pinning `h_ref` at the home pose" and that #7 cannot copy it. Under route (a) #6 no
longer pins, so that asymmetry disappears — #6 and #7-S5 now face the *same* offset-U problem, and
#7-S5's required fix (latch U₀ on screen so the subtraction is visible) is the same fix #6-S3 needs.
This does not weaken P1-3 on S5; it means the two concepts should solve it the same way.
