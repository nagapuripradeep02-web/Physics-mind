# FOUNDER_PROXY — CHECKPOINT A — `potential_energy_definition` — cycle 0

> Persisted verbatim by the dispatching session. founder-proxy is report-only and cannot
> write repo files; this chapter has already lost agent findings that existed only in
> report text (PROGRESS.md, concept #2 session), so the report is filed here on its behalf.

## VERDICT: `DESIGN_FIX` → `alex:architect` (cycle 0 of max 2)

Three P1s. This is a technically excellent skeleton — the engine reads are real, the arithmetic discipline is mostly sound, the marks rule is correctly applied, and the `bar_max_J = 2 × work_scale_J` invariant is the best single idea in the ch6 corpus so far (I verified it survives every reflow rung, which the architect asserted but did not prove). But the skeleton makes one design decision — pinning `h_ref_m = −1.8` at the home pose — whose full cost it never records, and that cost lands on three separate things: it spends concept #7's PRIMARY aha before #7 runs, it makes S3 thin, and it forces an unexplainable 49 J discontinuity at the click into explore. Separately, S2's picture manufactures a misconception ("friction's energy is destroyed") one click after S1 taught the opposite, and the skeleton's own vocabulary ban (`f-2`: no "heat") forbids the one clause that would fix it. Neither is a physics error and neither needs an engine change — both are architect-authority design calls, which is exactly what this gate is for.

**Not `ESCALATE`:** the physics shown is correct at every frame I checked. **No `FIX(engine)`:** I found no ask in this design that requires a renderer edit — the Phase-0 alarm-rule claim is TRUE and I verified it independently (see §B).

---

## A. Answers to the four questions the dispatch asked directly

**1. Is `h_ref_m = −1.8` a legitimate simplification, or does it silently make #7 harder?** It makes #7 harder, and the evidence is in #7's own skeleton on disk. `docs/loop_runs/ch6/gravitational_potential_energy/skeleton.md:146` authors #7's **PRIMARY aha** as `h_ref_m: 0.3` — "the dashed line now sits at the cart's start height and the bar opens at exactly 0.0 J", delta cue *"New zero, same ΔU"*, with `h_ref_label: "h = 0 (moved)"` (line 220) to name the change. That is **exactly the configuration #6 ships as its unremarked default, three times.** Worse, `:313` records #7's teaching mechanism: *"Belief 1 (absolute zero) is PLANTED by S1's unexamined floor reference — deliberately: S1/S2 build the confident habit, S3 breaks it."* #6 does not build that habit; it builds the opposite one. #7's primary aha will land on a student who has already spent an entire concept with the zero at the object's start line, and #7's S1 (ground reference, `U = mgh`) will read as the contradiction rather than the norm.

**2. Could a student who sees only #6 form the belief "U is zero at the start" as a law?** Yes, and the skeleton has no defence. The zero-at-start picture runs in S1, S2 and S3. It is never named as a choice (correctly — #6 is forbidden). The single forward sentence that would inoculate ("…lets you place the U = 0 line wherever you like", `f-2`) lives **only in S3**, which the `intro` preset deletes (`(i-5)`). Under that preset the concept plants the belief three times and says nothing. Then S4 contradicts it silently (see P1-3).

**3. Is the aha true-by-construction a device or a tautology?** A device, and a good one — but the skeleton undersells its own proof. `U = mg(s·sinθ − h_ref)` (`nlbHeightM` L48240–48244, `b.U_grav_J` L48288–48290) and `W = Σ F∥·Δs` (`nlbRunWorkAccum` L50336–50339) are the same number when `h_ref = s₀·sinθ` — so yes, identical by algebra. That is fine: `ΔU = −W_c` **is** a definition, not a measurement, and showing a definition as an identity is honest. The picture does carry the claim, and I verified the mechanism the architect only asserted: **every** `.nlb_en_trk` — energy AND work — is written the same `S.trk` height by one loop in `nlbFitEnergyPanel` (L48871–48872), the energy fill is `100·U/bar_max` % (`nlbEnPct`) and the work fill is `50·|W|/work_scale` % (L50848), so with `bar_max = 2 × work_scale` the two are pixel-identical **at every ladder step** and the invariant cannot be broken by a reflow rung. Duty M-2 is therefore a real, satisfiable measurement, not a hope. Keep this.

**4. Did the Phase-0 alarm rule really not fire?** Correct — verified against source, not against the seam reports. Every mechanism this design consumes exists: `bars`/`bar_max_J`/`h_ref_m`/`precision` (config L1941–1989, resolver L50935–50938, negative binds via `typeof === "number" && isFinite`), `checkpoints` with `capture`/`capture_mode`/`dwell_ms`/`dwell_from_pass`/`marker:'point'` (L2079–2137), `work_accumulators` + `work_scale_J` (L2055–2059, default = `bar_max_J` — so authoring 145 explicitly is *load-bearing*, and the skeleton does), `height_markers.show_h_ref_line`/`h_ref_label` (drawn at `energy_h_ref_m · NLB_WORLD_PER_M`, L49891), and `eye_capture_ms` (`extractEyeCaptureMs` visual_eyes L118–131 → `maxRevealMsByState` L121 → both the poll L145 and `frozenFrame.atMsByState` L148). Zero renderer edits. No `deriveStateMeta` co-edit needed.

---

## B. What I verified and found SOUND (so the architect does not re-litigate it)

| Claim | Verified at | Result |
|---|---|---|
| Dwell fires once on the stamped ascent pass | `_count++` L50441 **precedes** `if (mode==="first" && _count>1) continue` L50442; dwell block L50457–50480 inside the same branch, gated `!sandbox && !seized && !dragged` | ✔ exactly as claimed |
| Dwell arithmetic | recomputed by hand: T_A = 322.0, T_B = 789.7 + 2000 = **2789.7**, hold→4789.7, R 6600 ≥ 5289.7, `eye_capture_ms` = 3789.7 → **3790**, margins 1000.3 / 999.7 | ✔ correct |
| Stamp strings | `nlbCpStampText` L50551–50594: head = `label + ":  "`, `'U_grav'`→`"U = "+nlbEnFx`, `'W'`→`"W "+label+" = "` per accumulator | ✔ renders **exactly** `point A:  U = 39.2 J · W gravity = −39.2 J` |
| Stamp values exact | crossing interpolation `ugX = m·g·(h_m + dh)` L50565–50568, `wv −= (1−f)·_dW` L50588 → U(A)=4·9.8·1.0=39.2, W(A)=−19.6·2.0=−39.2; B = 78.4/−78.4 | ✔ exact, not rounded |
| Frozen pins | `deriveStateMeta` L3202–3221 (`offset = clamp(0.60R,150,R−150)`, `base = max(1500, candidates)`, `DEFAULT_REVEAL_MS = 1500` L698) → S1 **1890**, S2 **1770**; phase-stable under any later reveal candidate (cycle changes, phase does not) | ✔ correct |
| S2 pin picture | recomputed: t=1770 → s = −0.082, U = **68.95**, W_grav = −68.95, W_fric = −54.82 | ✔ matches |
| Real minus | `nlbMinus` L48605 inside `nlbEnFx` L48608–48612 | ✔ #5's stale ASCII record correctly superseded |
| Marks in ONE state | S3 only; S1/S2/S4 zero checkpoints (`(d)`) | ✔ founder's mark rule correctly applied in advance |
| Multibody N/A **conclusion** | `nlbBodyLaneZ` L44503–44508: `if (lanes.length < 2) return 0` | ✔ correct (citation defect — P3-8) |
| Drift-guard N/A | gate reads a state that shows `E_total`; none authored | ✔ |
| Explore ring-gate N/A | `controls_visible` for nlb is a **closed string enum** L1819 with no `min_ring` object form (contrast L1323, which has one) | ✔ |
| `work_bar_*` glow inert | `nlbEnergyApplyGlow` L49043 — `isEn` false for `work_bar_*`, panel untouched | ✔ |
| Glow whitelist ids all real | `energy_bar_U_grav` L48552 · `energy_panel` L48551 · `marker_h_ref` L49386 · `checkpoint_1/2` L47023 · `nlb_arrow_block_weight` L45692 | ✔ all exist |
| Arrow floor | `NLB_ARROW_SCALE = 0.048` L43674; 39.2 N → 1.88 units = 3.4× the 0.55 floor | ✔ |
| Negative-U guard maths, S1/S3 | S1 worst folded s(3200) = −3.088; S3 s(2650 phys) = −2.255 — both above home | ✔ guard cannot fire |
| S4 negative-U guard | bounds are `length_m − 0.55` → s_min = −5.45, h = −2.725, `h_ref −3.05` → U_min = 12.7 J | ✔ safer than the skeleton's own bound |
| Cross-state numeral freshness | {128.0, 17.6} / {79.7, 91.2, 11.9} / {39.2, 78.4, 98.0}; m 4 vs #5's 5, θ 30 vs 25 | ✔ no collision |

**Scar dispositions spot-checked: 8** (multibody-N/A, drift-guard-N/A, explore-ring-N/A, friction-arrow-N/A, arrow-floor, `h_ref` truthiness, checkpoint-overshoot-FIXED, signed-bar-pairing-FIXED). Seven are correct as written; one (multibody) is correct in substance but cites the directive text instead of the reader — see P3-8. **No recurrence** of any prior ch6 finding was found in Pass 1.

---

## C. Per-state design table (Checkpoint A form)

| # | Ring | Distinct IDEA (not numbers) | Derivable from predecessor? | Delta visible? | Rule 41 | Design verdict |
|---|---|---|---|---|---|---|
| S1 | core | The mirror exists, both directions — negative work is stored | no (first) | yes: a second bar appears and rises in lock-step | title is a fragment; cue OK | **OK**, subject to P1-1 |
| S2 | core | The mirror does **not** extend to a non-conservative force — a third bar with no partner | **no** — a picture S1 cannot draw | yes: third bar, no mirror | cue personifies ("Friction stores nothing") | **FIX** — P1-2 (manufactures a destruction belief it may not correct) |
| S3 | extended | Two-place arithmetic form, held and readable | **partly yes** — with `h_ref` at the start, both stamps restate S1's pointwise identity; the "difference" is only in the student's head | yes: latched record + dwell | good | **thin** — P2-4 |
| S4 | core (explore) | Sandbox; the definition survives every motion | n/a | yes | "Change anything" OK | **FIX** — P1-3 (silent reference shift), P2-6 (friction ledger unbounded under drag) |

---

## D. Findings

### P1-1 · The reference pin spends #7's primary aha and plants a law that is a choice · `alex:architect`
`h_ref_m = −1.8` on S1–S3 (§3, §Arithmetic) makes `U = −W_gravity` an **absolute** identity, not the Δ-relation the concept claims to teach. Three states show U = 0 at the start; the concept is forbidden from saying why; the single inoculating sentence dies under `intro`. **Evidence:** `#7 skeleton:146` (same configuration = #7's PRIMARY aha, `h_ref_m: 0.3`, cue "New zero, same ΔU"), `#7 skeleton:313` ("Belief 1 (absolute zero) is PLANTED by S1's unexamined floor reference — deliberately"), `#6 skeleton:133` + `:284`, `(i-5)` presets.

Resolve, do not just record. Three routes I can see, in my order of preference:
- **(a) One reference for all four states, at the ramp's foot** (`h_ref ≈ −3.05`). U opens at ~49 J everywhere; the claim becomes "the U bar **rises by** exactly the joules gravity's bar falls" — which is the true law, is still pixel-true as a *change* (Δ128 J = 44 % of the U track and 44 % of the W half-track, by the same invariant), makes S3 genuinely load-bearing (the pointwise identity fails, only the difference works — P2-4 dissolves), makes S4 continuous (P1-3 dissolves), and leaves #7's ground-reference habit intact. Cost: the "same number" numeral read weakens to a lock-step-motion read.
- **(b) Keep −1.8 for S1–S3 and unify S4 to it** by authoring `surface.length_m: 3.6` on S4 (per-state, `nlbBoundsM(b, eng.length_m)` L47604 / default L44388), so the block cannot go below the line. Fixes P1-3 only; P1-1 and P2-4 survive.
- **(c) Keep the design and hand the founder the cross-concept cost explicitly**, plus a coordination note to #7's architect that its S1/S3 setup no longer holds. This is the honest minimum; it is not a fix.

Whichever route: **flag to the dispatching session that #7 is being architected in parallel and its PRIMARY aha depends on this decision.** The two skeletons cannot be gated independently.

### P1-2 · S2 manufactures "friction's energy is destroyed" and `f-2` bans the fix · `alex:architect`
S1's `one_line_fix` is *"moved, not destroyed"* (§4). One click later S2's `visual_counter` is *"at the loop's end friction's joules have no store anywhere on screen"* (§4). The only inference available to a Class-11 student is that friction's joules **were** destroyed — the exact belief S1 just removed. `f-2` bans the word "heat" outright, so the design forecloses its own correction.

The `one_line_fix` ("friction's work depends on the trip taken … so no single stored number per position can exist") answers *why no U exists*; it does not answer *where the joules went*, and the picture asks that question loudly. Fix: lift the "heat" ban for **one** clause in S2 ("those joules leave the block as heat — concept 10 follows them"), which names the destination without doing #10's accounting. Alternatively re-word S2's counter so it claims only *"no bar rises, because there is no single stored number per position"* and never implies absence of a destination. Do not ship the state as drafted.

### P1-3 · S3 → S4 reference discontinuity, and the ring-cut that removes its only explanation · `alex:architect`
At the click into explore, `h_ref` moves −1.8 → −3.05: the dashed **U = 0** line teleports 1.25 m down the ramp and the U bar jumps 0 → **49.0 J** at the *same block position*. Rule 32d (only the new thing changes) and Rule 25 (no untaught term; explanation co-located) both bite, and #6 may not explain it. `(i-1)` checked ring-cut coherence in one direction only (does a surviving state *reference* hidden content) and missed the other: under Cut 2 the surviving S4 carries a shifted reference whose only acknowledgement lived in the deleted S3. Solved for free by P1-1 route (a), or independently by route (b).

### P2-4 · S3's information gain is thin under the current reference · `alex:architect`
With `h_ref` at the start, `U(A) = 39.2 / W(A) = −39.2` and `U(B) = 78.4 / W(B) = −78.4` — each stamp independently restates S1's pointwise identity, and the *difference* relation is never displayed. A student can read S3 as "S1 with numbers". Under P1-1 route (a) the stamps become `U = 88.2 / W = −39.2` and `U = 127.4 / W = −78.4`, the pointwise identity visibly fails, and only 127.4 − 88.2 = 39.2 works — S3 then proves something no other state can. Resolve with P1-1; do **not** solve by adding a fifth state.

### P2-5 · §Arithmetic errors in the load-bearing table · `alex:architect`
- **S2, "s at t = R":** recorded −3.330 (0.27 m above home). Recomputed: descent elapsed 1933.55 ms, distance 3.6065 m, **s(2950) = −3.1407** (0.459 m above home, U = 9.0 J). The recorded value is s at **R + 50**, one column left of where it sits. The same row's `W_fric(R) = −91.2` uses the *correct* 3.607 m, so the row is internally inconsistent.
- **S1:** s(3150) = −2.7101 (recorded −2.700), U(R) = **17.44 J** (recorded 17.6) — and 17.6 is quoted again in `(d)`'s pin list and `f-3`'s narration duty.

Both errors are in the safe direction (the guard still cannot fire, and the S1/S2 pin pictures I recomputed are correct), so nothing downstream breaks. But §Arithmetic is the artifact the negative-U guard — an H4 EYE **FAIL** — rests on, and a table that is wrong in the safe direction today is wrong in the unsafe direction after the next parameter change. Re-derive the whole table; label each column by its instant.

### P2-6 · S4's friction envelope is bounded over the wrap span, not over the affordance the state advertises · `alex:architect`
`nlbRunWorkAccum` L50319–50340 accumulates on `ds = b.s − b._s_pre` for **any** motion — integrator or teacher drag — rejecting only teleports (`|ds| > span·0.5`, L50322). The wrap re-zeros; a **drag does not**. At the authored corner μ = 0.6, f = 20.37 N against `work_scale_J = 280` → the friction bar clamps and emits `[PM_NLB_ENERGY_SCALE]` after ~13.7 m of dragging, i.e. inside one demonstration — and S4's own named discoverable is *"raise μ — friction's bar falls whichever way the block moves"*. §0.B files this row as **AVOIDED**; it is not avoided, it is *exposed*. Re-file as ACCEPTED + bounded with the drag case stated, or reduce the exposure. (Separately: the monotonicity argument is wrong in form — at μₛ = 0.6 > tan 30° = 0.577 the block **sticks** at the apex, so 0.6 is not the worst free-running corner. The true worst free-running case is ≈165 J, comfortably inside 280; only the drag case bites.)

### P2-7 · Assessment q2 asks for a picture the sim never draws · `alex:architect` (hand down to physics-author)
`(f)` q2: *"block moves DOWN so W_grav > 0 so ΔU < 0"*. In every guided state the gravity ledger is **negative in every frame** — it rises from −128 toward −17.4 on the descent but never crosses zero, because the loop truncates 116 ms before recross and the block never goes below its start line. The rate is visible; the sign is not. Either re-designate q2 as an explicit transfer question, or add a narration duty on S1's descent ("gravity is now doing positive work — its total is climbing back toward zero"). Do not add a state for this.

### P3-8 · Scar-citation discipline on the multibody N/A · `alex:architect`
`§0.A` row 4 promises every N/A quotes the deciding reader. The multibody family N/A instead cites *"the `nlb_lane_offsets_apply_to_declared_bodies…` directive text"* (§0.B). That is the precise substitution the architect-owned row exists to stop. I verified the conclusion myself — `nlbBodyLaneZ` L44503–44508, `if (lanes.length < 2) return 0` — so the disposition stands; the citation does not.

### P3-9 · The dwell badge translates the whole bar panel, in the one state that stamps numbers · eye-walker duty
`#nlb_slowmo` is created at `top:52px; left:12px` (L46612) — the **same corner** as `#nlb_energy` (L48677). `nlbEnergyTopPx()` L48846–48857 re-tops the panel to `badge.bottom + 8` while a dwell is open ≈ **89 px**, so in S3 the entire bar panel slides ~37 px down at each dwell and back up after. The fit ladder is **not** re-run (only `top` is written per frame). I computed no clipping at either the EYE's 720 or the short 551 px teacher rung (step-1 bottom ≈ 478 vs limit 539), so this is not a defect — but it means S3's frozen frame at 3790 photographs the bars 37 px lower than S1/S2's, in exactly the state whose numerals the cross-state scale story leans on. Undisposed; `work_energy_theorem` S4 shipped through it, so precedent exists. Record it as an eye-walker comparison note.

### P3-10 · Rule 41 · `alex:architect`
- S2 delta cue **"Friction stores nothing"** makes friction the *agent* of storing — 41a personification, and outside `f-2`'s own allowed-verb list (which permits the passive "stored"). Suggest "No store for friction" or "Friction's work: no store".
- S1 title **"Potential energy: gravity's negative work, stored"** is a trailing fragment; the rail truncates and the meaning arrives last (41d). Suggest "Negative work becomes stored energy".

### P3-11 · Rule 35 / 38f · `alex:architect`
"**Every building on every syllabus has one**" (§9) is a factual overreach — rooftop tanks are common in India, the Middle East, Latin America and the Mediterranean, and uncommon in the UK/US/northern Europe, where mains pressure or a loft cistern is the norm. Not a Rule-35 violation (no festival/currency/brand/name), but the universality *assertion* should go. The architect itself names the pumped-storage plant as "the widest-syllabus-overlap device for this concept (38f)" and then files it **secondary** — invert them, or drop the claim.

### P3-12 · Chapter note, not a #6 defect
`curriculum_tags` marks CBSE `verified: true` on documentary (NCERT TOC) evidence rather than a teacher's confirmation. This matches all five shipped ch6 concepts (checked `conservative_vs_nonconservative_forces.json:583`), so it is chapter-consistent; flagging only because 38g reads every cell as a claim. Founder call, chapter-wide, not this concept's.

---

## E. `engine_queue`

**Empty.** No `FIX(engine)`. Every mechanism this design consumes is built, and I found no finding whose correct fix lives in a shared engine file. The Phase-0 alarm-rule claim is verified TRUE.

One near-miss recorded for the founder's chapter-end queue, **not routed**: the unsigned `U_grav` stack cannot draw U < 0, which is what forces `h_ref` below the lowest reachable point and therefore forces the whole P1-1 trade. #7's skeleton records the same constraint independently (`:170`, `:297`). If the chapter ever wants the below-reference quadrant drawn, that is one signed-`U_grav` engine ask serving #6, #7 and #9 — worth pricing once at chapter end rather than three times. Owner if ever taken: `peter_parker:field3d_surgeon`.

---

## F. Candidate scar rows

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause,
  prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type) VALUES

('skeleton_pins_the_energy_reference_to_make_its_aha_exact_and_spends_the_next_concepts_lesson',
 'A skeleton pins h_ref_m at the home pose so U = -W holds pointwise, and the exact configuration is the NEXT concept''s primary aha',
 'CRITICAL', 'alex:architect',
 'potential_energy_definition pinned energy_layer.h_ref_m = -1.8 (the home-pose height) so the U bar and the gravity work bar read the same number at every frame. gravitational_potential_energy (#7, architected in parallel) authors that same moved-zero configuration as its PRIMARY aha, and plants the ground-reference habit its S3 exists to break. #6 builds the opposite habit first, unremarked, three states running, while being forbidden from naming the reference as a choice.',
 'When a design pins a reference/gauge/zero to make a relation exact, the skeleton must state (a) what general statement the pinned form silently narrows, and (b) which downstream concept owns the un-narrowing - and cite that concept''s skeleton if it exists. A pinned gauge is never a free simplification.',
 'manual',
 'Grep the sibling skeletons in the same chapter run for the pinned field name (h_ref_m, reference, zero line). If a later concept authors the same value as an aha or a misconception_watch counter, the pin is spending that concept''s lesson.',
 'OPEN', ARRAY['potential_energy_definition','gravitational_potential_energy']::text[],
 ARRAY[]::text[], 'ch6-concept-6 checkpoint A 2026-08-09', 'incident'),

('state_removes_a_store_without_naming_the_destination_and_recreates_the_belief_the_prior_state_fixed',
 'A scope-condition state shows a quantity with no store one click after the concept taught that energy is never destroyed',
 'CRITICAL', 'alex:architect',
 'potential_energy_definition S1 fixes "negative work destroys energy" with "moved, not destroyed"; S2 then shows friction''s bar with no partner and narrates "friction''s joules have no store anywhere on screen". The only inference left is destruction. The skeleton''s own vocabulary ban (no "heat") forbids the one clause that would name the destination, so the design forecloses its own correction.',
 'When a state shows a quantity LEAVING with no on-screen destination, and an earlier state in the same concept taught conservation-of-somekind, the destination must be NAMED in one clause even if its accounting belongs to a later concept. A boundary ban may withhold the accounting, never the destination.',
 'manual',
 'For each misconception_watch one_line_fix in a concept, check whether a LATER state''s visual_counter or narration implies the negated form. If state N teaches "X is not destroyed" and state N+1 shows X vanishing with no named destination, flag.',
 'OPEN', ARRAY['potential_energy_definition']::text[], ARRAY[]::text[],
 'ch6-concept-6 checkpoint A 2026-08-09', 'incident'),

('explore_state_changes_an_authored_reference_the_guided_states_never_declared_as_changeable',
 'The sandbox silently re-authors the reference the guided states taught from, producing an unexplainable jump at the click into explore',
 'MAJOR', 'alex:architect',
 'potential_energy_definition authors h_ref_m -1.8 on S1-S3 and -3.05 on S4 (forced by the unsigned U stack and free drag over the full track). At the click into explore the dashed U = 0 line teleports 1.25 m and the U bar jumps 0 -> 49.0 J at the same block position, with no permitted explanation. The ring-cut check looked only for surviving states REFERENCING hidden content, not for a surviving state whose only acknowledgement lived in a cut state.',
 'Any authored field that defines what an instrument MEASURES FROM (h_ref_m, a zero line, an origin) is part of the home pose under Rule 32d: it must be identical in every state, or the change must be the state''s declared one-new-thing with its own delta cue. The ring-cut check runs BOTH directions - also verify no surviving state depends on a cut state for its only explanation.',
 'js_eval',
 'Read field_3d_config.states.*.newtons_laws_body.energy_layer.h_ref_m across all states of a concept. If more than one distinct value appears, assert that each change is named in that state''s delta cue or caption; otherwise fail.',
 'OPEN', ARRAY['potential_energy_definition']::text[], ARRAY[]::text[],
 'ch6-concept-6 checkpoint A 2026-08-09', 'incident'),

('sandbox_ledger_envelope_bounded_over_the_wrap_span_while_the_state_advertises_dragging',
 'A sandbox work-ledger envelope is sized over the wrap span, but nlbRunWorkAccum accumulates on teacher-drag displacement too',
 'MAJOR', 'alex:architect',
 'nlbRunWorkAccum (field_3d_renderer.ts L50319-50340) accumulates dW on ds = b.s - b._s_pre for ANY motion, rejecting only teleports (|ds| > span*0.5). The sandbox wrap re-zeros the ledger; a DRAG does not. potential_energy_definition S4 sizes work_scale_J = 280 over the wrap span while naming "raise mu - friction''s bar falls whichever way the block moves" as a discoverable: at mu 0.6 (f = 20.37 N) the friction bar clamps and warns after ~13.7 m of dragging, inside one demonstration.',
 'A sandbox ledger envelope must be bounded over the affordance the state ADVERTISES, not over its free-running lap. If drag is exposed and the ledger accumulates on drag displacement, either bound it, drop the ledger, or file the row as ACCEPTED-with-exposure - never as AVOIDED.',
 'manual',
 'For a sandbox state authoring both trusted_drag_seizes and a monotone work accumulator (friction), compute f_max * (advertised drag path) and compare against work_scale_J. Flag if a plausible demo clamps the bar.',
 'OPEN', ARRAY['potential_energy_definition']::text[], ARRAY[]::text[],
 'ch6-concept-6 checkpoint A 2026-08-09', 'incident'),

('checkpoint_dwell_badge_translates_the_shared_bar_panel_in_the_state_that_stamps_the_numbers',
 'The dwell honesty badge and the energy panel share the top-left corner, so every dwell slides the whole bar panel ~37 px',
 'MODERATE', 'peter_parker:field3d_surgeon',
 '#nlb_slowmo is created at top:52px;left:12px (L46612) and #nlb_energy at left:12px;top:52px (L48677). nlbEnergyTopPx() (L48846-48857) re-tops the panel to badge.bottom + 8 whenever a dwell or slow window is open, so the bars translate down ~37 px for the dwell and back. The fit LADDER is not re-run, only top. No clipping measured at 720 or 551 px, but a state''s frozen pin lands mid-dwell by the mandatory eye_capture_ms = T_P + D_P/2 rule, so the stamped state''s bar geometry is offset from every other state''s.',
 'A dwell/slow state''s frozen frame is not pixel-comparable to its siblings'' for panel geometry. Either give the badge its own corner, or re-run nlbFitEnergyPanel when the badge toggles. Until then, skeletons authoring dwell_ms must disposition the panel shift and eye-walker must not read a panel offset as a layout regression.',
 'js_eval',
 'With a dwell open, read getComputedStyle(document.getElementById("nlb_energy")).top and compare against the same state with the badge hidden; assert the delta is declared.',
 'OPEN', ARRAY['work_energy_theorem','potential_energy_definition']::text[], ARRAY[]::text[],
 'ch6-concept-6 checkpoint A 2026-08-09', 'incident');
```

All five pass the schema discipline: `severity` ∈ CRITICAL/MAJOR/MODERATE, `probe_type` ∈ manual/js_eval, `row_type` = `'incident'`, both array columns are Postgres `ARRAY[…]::text[]` literals, and no `bug_class` collides with `docs/loop_runs/ch6/scar_candidates_viewport_premise.sql` or with any earlier `scar_candidates_*.sql` in this chapter run.

---

## G. Files the architect should open first

1. `docs/loop_runs/ch6/gravitational_potential_energy/skeleton.md` — lines **146**, **157**, **220**, **313**. This is the whole of P1-1; read #7's S3 before touching #6's `h_ref_m`.
2. `docs/loop_runs/ch6/potential_energy_definition/skeleton.md` — §4 (the two `misconception_watch` rows, P1-2) and `(f-2)` (the "heat" ban that blocks the fix).
3. `docs/loop_runs/ch6/potential_energy_definition/skeleton.md` — §Arithmetic, the S2 row (P2-5).
4. `src/lib/renderers/field_3d_renderer.ts` L50303–50345 — `nlbRunWorkAccum`, the drag-accumulation proof behind P2-6.
5. `src/lib/renderers/field_3d_renderer.ts` L48860–48882 — `nlbFitEnergyPanel`, the one loop that makes the 2× pairing invariant true at every rung. Keep this design; cite this line.

---

```
RUBRIC (advisory, unratified — docs/EXEMPLAR_RUBRIC.md; did not affect the verdict)
  Checkpoint A subset: D1 1 · D2 2 · D8 2 · D9 1 · D10 1   = 7/10
  weakest: D1 information gain — S3 is derivable in substance from S1: with h_ref pinned
           at the home pose, U = −W holds pointwise, so both stamps (39.2/−39.2 and
           78.4/−78.4) restate S1's own identity and the difference is never displayed
           (evidence: skeleton §3 S3 row + §Arithmetic "U = 19.6·(s + 3.6) = −W_gravity
           exactly, every frame")
           D10 explore earns its place — three dials each with a named discoverable, but
           the state opens on an unexplained 49.0 J / 1.25 m reference shift and its
           advertised μ discoverable clamps the friction bar after ~13.7 m of dragging
           (evidence: skeleton §3 S4 row, h_ref_m −3.05; nlbRunWorkAccum L50319–50340)
  D2 and D8 are the skeleton's strengths: the ring order IS the build (qualitative mirror →
  scope condition → quantitative form), the aha lands in state 1 of 4, and the two
  misconception beats sit at genuine pivots with S3/S4 correctly left bare.
```

**Cycle budget:** 1 of 2 spent. If cycle 1 does not resolve P1-1 (or does not hand the founder an explicit, coordinated cross-concept decision on it), the next verdict is `ESCALATE` — the #6/#7 reference design is a co-design question and I will not spend the second cycle arguing it.
