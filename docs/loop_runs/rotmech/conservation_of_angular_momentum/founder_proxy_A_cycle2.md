# CHECKPOINT A — `conservation_of_angular_momentum` (rotmech 0b, **REV 3**)

**VERDICT: `DESIGN_FIX` → `alex:architect` — fix cycle 2 of 2, the LAST one.**
founder-proxy, 2026-08-02 · reviewed `docs/loop_runs/rotmech/conservation_of_angular_momentum/skeleton.md` (REV 3) against `skeleton_rev2.md` and `founder_proxy_A.md`.

**All twelve claimed fixes landed. Each one verified in the REV 3 text — none is a paper claim.** F-1…F-5 (the blocking five) are genuinely, structurally fixed: S4's push-out is gone and its end-configuration is the held-open gap; the eased spin reversal is gone and replaced by two restarted runs that never take L through zero; the two-mode integrator is gone and replaced by the single angular-momentum integrator exactly as ruled, with the S8 r-drag-while-braking case now correct by construction; the −r̂ pull arrows are on screen and claimed in the walk; S3 is re-declared as the predictive quantitative beat and Rule 38a's ordering clause is now addressed. The arithmetic is independently re-derived and exact. This is a good skeleton and the lesson design is, on its merits, excellent.

**It is sent back anyway, and the reason is narrow: this document is not only a lesson design — it is the build contract for a NEW scenario serving twelve concepts.** Three items in the *engine* surface are still open, and each one is the kind of hole the survey's own alarm rule exists to prevent: (1) the skeleton never says whether a one-way authored beat **holds or repeats**, and never states the entry pose that a ramp must start from — leaving an OPEN scar row (`field3d_param_ramp_authoring_contract`) both binding and undispositioned; (2) F1's "prediction tick at 1.50" is specified on a **value-only numeric readout that has no scale for a tick to sit on**, so the single picture that justifies S3's existence may not be renderable as written; (3) the F-10 enum-closure block, whose entire job is closing the enum against the served set, **omits three of the survey's own five closing additions**. None of these is polish.

No physics doubt. No escalation. Every correction below is a named, mechanically checkable edit.

---

## Pass 1 — scar consultation (live, re-run this session)

Queried: `--owner alex:architect` → **32 rows** · `--row-type directive` → **47 rows** · `--owner peter_parker:field3d_surgeon` (full text pulls on the five integrator/ramp rows). Counts match the Checkpoint-A cycle-1 pull, so **no new architect rows have landed since REV 2** — the universe is unchanged. Per the dispatch note `--field3d --open` was **not** relied on for coverage (`query_engine_bug_queue.ts:23` hardcodes a 21-concept FIELD3D list with zero `newtons_laws_body` members, so nlb-family rows cannot surface through it); the nlb rows reach this design through `--owner alex:architect` and `--row-type directive`, both pulled in full.

Renderer absence claims re-verified independently at `src/lib/renderers/field_3d_renderer.ts`:

| Probe | Result | Meaning |
|---|---|---|
| `momentOfInertia\|angularMomentum\|moment_of_inertia\|angular_momentum` | **0 hits** | survey's absence claim still holds; 0c-1 is genuinely required |
| `reference_marks\|referenceMark` | **0 hits** | **F1 is a genuine build**, as ruled last cycle |
| `param_ramp` | **23 hits** | the one-shot ramp mechanism EXISTS in `newtons_laws_body` — prior art to mirror, and the reason its authoring directive binds |
| `src/data/concepts/` id scan | no `angular`/`rotat`/`inertia` id | namespace check confirmed |

**Scar-audit coverage claim — FAILS.** REV 3 declares: *"Not queried: nothing beyond the six commands above; any row outside those result sets is NOT dispositioned here rather than silently 'none skipped'."* That is the right discipline, but it does not hold: at least five rows **inside** the queried result sets are absent from the REV 3 audit:

| Row (in `--row-type directive`, undispositioned in REV 3) | Binds? |
|---|---|
| `field3d_param_ramp_authoring_contract` [OPEN] | **YES — this is finding P1-1** |
| `derived_energy_sum_pairs_prestep_position_with_poststep_velocity` [FIXED] | **YES — the HUD's I/ω/L/KE must publish from ONE post-step snapshot** |
| `camera_solve_searched_in_one_axis_hides_the_feasible_region…` [OPEN] | dispositioned in REV 2, dropped in REV 3 |
| `field3d_measured_overlay_fit_runs_once_against_a_sibling_blanked_on_entry` [FIXED] | likely (formula-overlay fit on a new scenario) |
| `teach_auditor_reads_field3d_sliders_from_config_not_scene_composition` [OPEN] | at 0d audit, minor |

**Dispositions checked and accepted as honest in REV 3:** all six of the failing REV-2 dispositions are genuinely re-done (`nlb_loop_reset…` now binds via its transferable half and is answered by F-1; `nlb_frozen_pin…` assertion replaced by a per-state table with the pre-roll included; `nlb_static_state_on_the_track_bound` clamp widened to [0.15, 0.90] with taught poses strictly inside; the `derived_readout…` tautology retired honestly with the mode enum; `teach_distinct_reference_lines_for_two_radii` flipped from "N/A" to BINDING with the rim specified; `closed_enum…` re-scoped to the 12-concept union — though see P1-3 for how far that re-scope actually got). That is real work and it is recorded as such.

---

## Diff verification — REV 2 → REV 3, claim by claim

The RESPONSE table was not accepted. Each row below is what was found in the REV 3 text.

| Claimed | Verified in REV 3 | Verdict |
|---|---|---|
| **F-1** push-out deleted; gap holds; archetype renamed | §3 S4 ("HOLDS there with the gap open for the rest of the loop… no push-out; the beat never undoes its own claim"), archetype block (`diverge-from-mark`), pin table S4 row, §4 row 2, §10(d) | **LANDED** |
| **F-2** restart not reversal; engine F4 deleted | §3 S6 ("two RUNS, never a continuous reversal… L never crosses zero on screen"), E2 ("ω₀ is signable"), `~~F4~~ DELETED` tombstone, §10(c) | **LANDED** |
| **F-3** single L-integrator; mode enum deleted | E2 block verbatim as ruled; `~~E3~~`/`~~F3~~` tombstones; §3 metrics rewritten; S7 reframed as illustration; S8 "r-drag DURING braking is correct by construction" | **LANDED — and the reasoning is now correct, not just the formula** |
| **F-4** −r̂ arrows on screen | §3 S2 + S4, ledger row "Inward pull force", F5 engine row, walk table claims F5 at S2/S4, §6 drill-down picture, §9 | **LANDED for S2/S4 — NOT for S3 or S8 (finding P2-4)** |
| **F-5** S3 = quantitative beat; 38a ordering | §2 title/purpose, 38a paragraph ("qualitative → quantitative → condition → extended → derivation"), §3 S3 (prediction tick at 1.50, live readout lands on it), delta cue, teacher-walk Q1, JEE trace | **LANDED — the strongest single improvement in REV 3** |
| **F-6** S8 control semantics | §3 S8 (m/ω₀ re-initialise with a re-pin cue; r the only L-preserving live drag; direction = restart), E8 re-pin cue | **LANDED** |
| **F-7** (a) loop minima (b) geometry | §3 pin table (seven rows, S2 pre-roll included); §2 geometry paragraph (R_rim 1.2, rod 1.0, clamp [0.15,0.90]) | **LANDED — arithmetic re-checked below; see P2-6 on the rim value** |
| **F-8** ω₀ = 1.50, no collisions, 2 dp | §2 ground truth + every state row + §4 + Block 1 + E6 | **LANDED — every number independently re-derived, all correct** |
| **F-9** brake promoted to core, moved before the vector beat | §2 table (S5 core / S6 extended), §3, §7 (`foundational: STATE_1 → STATE_5`), §10(i-1)/(i-4) | **LANDED — and the S1-arrow-as-magnitude-only treatment that makes the cut coherent is genuinely careful work** |
| **F-10** enum closure vs the 12-concept union | Enum-closure block present; torque source is a LIST with implemented/deferred split | **PARTIAL — see P1-3** |
| **F-11** S7 archetype `equation-build` | §3 archetype block + S7 row; dL/dt reframed | **LANDED** |
| **F-12** (a) title (b) "torque" (c) clamp | §2 table "Why L stays constant"; §3 S1 (`never "outside twist"`); [0.15, 0.90] in §2/E4/teacher-walk | **LANDED** |

### Arithmetic — re-run independently, every figure

I(0.80) = 0.50 + 2(2.0)(0.64) = **3.06** ✓ · L = 3.06 × 1.50 = **4.59** ✓ · I(0.20) = 0.50 + 2(2.0)(0.04) = **0.66** ✓ · ω₂ = 4.59/0.66 = **6.9545 → 6.95** ✓ · KE₁ = ½(3.06)(2.25) = **3.4425 → 3.44** ✓ · KE₂ = L²/2I₂ = 21.0681/1.32 = **15.9607 → 15.96** ✓ (cross-checked ½I₂ω₂² = 15.96 ✓) · ratio = 15.96/3.4425 = **4.636** = I₁/I₂ = 3.06/0.66 = **4.636** ✓ · top spin = 6.9545/2π = **1.1068 → 1.11 rev/s** ✓ · S2 pre-roll = 2π/1.50 = **4.189 → 4.19 s** ✓ · S2 loop minimum = 6.89/0.55 = **12.53 → ≥12.6 s** ✓ · pin 0.60×13 = 7.8 s, margin **0.91 s** ✓. Every pin-table row satisfies end-config/R < 0.55 (S7 tightest at 0.545) ✓.

**Numeric-collision check (the REV-2 defect class) — CLEAR.** At every *held* configuration the four readouts are pairwise distinct at 2 dp: home = 3.06 / 1.50 / 4.59 / 3.44; pulled-in = 0.66 / 6.95 / 4.59 / 15.96. The REV-2 identity KE₁ ≡ L (which held structurally because ω₀ = 2.0 made ½Lω₀ = L) is gone. Two *transient* crossings exist mid-ramp (I = ω = 2.14 when I² = L; KE = L = 4.59 when ω = 2.00) but both occur while both numbers are visibly sweeping, neither is a pinned or held reading, and no state asks a teacher to compare those two instruments at that instant. **Not a finding.** One physical identity remains and is correct, not a collision: ω₂/ω₁ = KE₂/KE₁ = I₁/I₂ = 4.64 — that is real physics and worth the teacher knowing, not a display accident.

**Single-integrator correctness for a dragged `r` during braking — CONFIRMED CORRECT.** For fixed-axis rotation dL/dt = τ_ext, and the internal radial pull that changes I exerts zero torque about the axis, so L is untouched by the drag. Integrating L and deriving ω = L/I(t) therefore reproduces α = (τ_ext − ω·dI/dt)/I identically — the ω·dI/dt term the REV-2 `torque_driven` mode dropped now emerges from the definition and cannot be omitted. REV 3 states exactly this and states why. **The F-3 fix is not merely applied, it is understood.** Two precision points for the brief are in P3, not findings.

**No new contradiction of the REV-2 classes.** No state ends by undoing its own claim (all seven walked: S2 holds in, S3 ends on the met prediction, S4 holds the gap, S5 holds the decayed L, S6 ends mid-run-B arrow-down, S7 ends with the equation complete). No state reverses L without a torque (S6's sign change is a narrated restart with a re-pin cue and a discontinuous re-pin, not an on-screen zero crossing).

---

## FINDINGS

### P1-1 · Engine spec · The skeleton never says whether a one-way beat **holds or repeats**, and never states the entry pose a ramp starts from. An OPEN scar row binds this and was not dispositioned.

**Evidence.** `field_3d_renderer.ts:42295–42338` (`nlbRunParamRamp`): the proven ramp shape is a **ONE-SHOT monotonic reveal — "linearly interpolates from → to across [start_ms, end_ms], then HOLDS at 'to' forever — the deliberate opposite of nlbRunIdleSweep's repeating triangle."** REV 3 instead uses looping language throughout: the archetype-discharge rule says "between t=0 and **the loop reset**", the pin table's column is "**Loop period** R", S4 says the gap holds "for the rest of **the loop**", S6 says "**the loop repeats**", and E4 writes the ramp bidirectionally as "r: 0.80 **↔** 0.20". A surgeon reading this can legitimately build a repeating ramp — in which case S2 and S4 each return their masses to 0.80 and close their own gap once per cycle, which is the F-1 defect re-entering at the engine layer instead of the authoring layer. Separately, OPEN directive `field3d_param_ramp_authoring_contract` says in terms: *"A param_ramp state must author its own surface/body value for the ramped param equal to `from`, or state entry visibly jumps before the ramp starts."* REV 3 asserts the principle ("States re-initialise their authored entry configuration on entry") but never tables the entry configuration for S4→S5 (r jumps 0.20 → 0.80), S5, S6, or S7 — and never dispositions the row.

**Required corrections (all checkable by inspection):**
1. Replace "loop period" with **state duration** for S1–S5 and S7, and add one line: *"S1–S5 and S7's authored beats are ONE-SHOT — each ramp holds at its end value for the remainder of the state and never returns toward its start (shape: `nlbRunParamRamp`, `field_3d_renderer.ts:42295–42338`, a closed form of `eng.t_ms` so a `SET_TIME_FREEZE` rewind reproduces it exactly). **S6 is the only looping state.** S8's idle sweep is the repeating-triangle shape (`nlbRunIdleSweep`), not a ramp."* Fix E4's `↔` to a directed `→` per state.
2. Add an **ENTRY CONFIG** column to the §3 table: (r, ω, sign, brake) at t = 0 for all eight states, with the rule *"in every ramped state the authored entry r EQUALS `param_ramp.from`"*.
3. State that state entry is an **instantaneous re-pose (single frame), never an animated slide** — so the S4 → S5 re-pose (r 0.20 → 0.80) can never be read as a taught radial slide.
4. Disposition `field3d_param_ramp_authoring_contract` in the SCAR AUDIT.

### P1-2 · Engine spec · F1's prediction mark is specified on a surface that cannot carry it — S3's payload picture may not exist.

**Evidence.** §3 S3: *"the PREDICTION lands as a **reference mark at 1.50 on the ω readout**"*, and §10(b) ledger: *"Predicted speed mark — tick 'predicted 1.50'"*. But §3's own instrument spec is *"value-only HUD, live 2-dp numbers"* (Rule 33d, correctly chosen) — a value-only numeric readout **has no scale for a tick to sit on**. F1 is written generically ("`reference_marks[]` on any readout/bar") and is unambiguous for S4's KE **bar**; for S3 it is undefined, and S3's entire justification for existing (F-5) is that the live readout visibly *meets* a pre-computed prediction. `reference_marks` is confirmed absent from the renderer (0 hits), so there is no existing behaviour to fall back on and the surgeon will invent one.

**Required correction.** Name ONE form for the numeric-readout consumption site and state the cue, e.g.: *"On a value-only readout the mark renders as a static labelled value chip adjacent to the live readout (`predicted ω = 1.50`), with a match cue — hold-glow on both, fired once when |ω − 1.50| < 0.01 — as ω sweeps down to meet it. On a bar (S4) the mark renders as a labelled tick on the bar scale."* Either that, or give ω a small linear gauge in S3 only and put the tick on it — but say which.

### P1-3 · Engine spec · The enum-closure block omits three of the survey's own five closing additions — the prophylaxis against the alarm rule is itself incomplete.

**Evidence.** `phase0_survey.md:223–232` closes the union with **five** additions. REV 3's enum-closure block declares: `particle_mass[i]`/`particle_pos[i]` · `body_shape` · `axis_select` · `θ₀/ω₀/α-drive` · `F_applied, F_point, F_angle` · `r` · `m` · `τ_brake` · `κ` · `fragment_trigger`. Diffing against the survey:

| Survey closing addition (line) | In REV 3's token list? |
|---|---|
| Live cross-product construction, r×F and r×p, ⊥ result + RHR (#5, #9) — L227 | **inputs only** (`F_point`, `F_angle`); the construction itself is not a declared config surface |
| Parallel-axis + perpendicular-axis geometry, **two axes at once with d drawn** (#6) — L228 | **ABSENT** (`axis_select` selects one axis; it does not express a pair or `d`) |
| Multi-body system + **live CoM marker and path trace** (#2, #3) — L229 | **ABSENT** (`fragment_trigger` is the trigger, not the marker/trace) |
| Composite body as a **parts list** (per-part mass + centroid) (#1) — L230 | **ABSENT** (`body_shape` is a shape token, not a parts list) |
| Rolling-vs-slipping regime switch (#12) — L231 | correctly excluded (0c-2) ✓ |

The survey names these as exactly the items whose omission "would each have forced a renderer edit *after* 0c had landed — precisely the failure that cost Class-12 Ch.7 ~1,296M tokens for 6 concepts." A closure list that drops them re-opens that door.

**Required correction.** Add to the declared token/config list: `axis_pair {a, b}` + `d_draw` + perpendicular-axis triple · `cm_marker` + `cm_path_trace` + a multi-body list · `parts[] {mass, centroid}` · `cross_product_construction {inputs, result, rhr_hand}`. Then apply the FIXED row `deferred_enum_members_must_be_declared_not_merely_unimplemented` to the **whole** list, not only the torque-source list: ship explicit IMPLEMENTED and DEFERRED sets whose union equals the frozen contract and whose intersection is empty.

### P2-4 · S3 and S8 · The visible-agent principle was applied to one beat of a declared contrast pair and not its sibling — the OPEN row `derivation_principle_applied_to_one_beat_but_not_its_sibling` is carried as "satisfied" and is not.

**Evidence.** F-4 put −r̂ arrows on S2 and S4 (§3 rows, ledger, walk table). S3 — S2's **declared contrast pair** — slides the masses from 0.20 to 0.80 with no arrow mentioned anywhere in its row, its walk entry (`E1, E2, E4, F1, E8, E9` — no F5), or the ledger. S8's teacher-driven drag is likewise silent. The founder's sentence at S3 is *"where did the hands go?"* — two states after the sim taught that something has to pull.

**Required correction.** Decide and state it in S3's row. The physically correct answer is that the arrows **stay inward and shorten**: for the masses to move outward the applied centripetal force must be *less* than mω²r, so the agent eases its hold — it never pushes outward. Rendering that is both honest and a second free kill on "something pushed them out." If the decision is to omit them, say so in one clause with the reason, so json_author does not silently drop a primitive the sibling state builds. Add the same one-line decision for S8.

### P2-5 · S5 (now core) is the only state with no numeric ground truth, and its slider has no range.

**Evidence.** §2's discipline is *"Every number printed anywhere below is this arithmetic — nothing is free-standing"* (REV 2) / the 2-dp convention (REV 3). S5's beat says *"L holds at its new lower value"* — that value is never authored, nor is τ_brake, nor the brake slider's [min, max] or default. F2's contract says the brake must never reverse the spin *"at any reachable slider value"*, but the reachable set is undefined, so the probe has no domain. F-9 promoted this state to **core**, so it survives every preset and its end-configuration is what the frozen pin photographs under `core_only`.

**Required correction.** Author τ_brake (value + N·m), the decay duration, and the resulting held L / ω / KE at 2 dp; check those three against I for a 2-dp collision the way F-8 checked the others; state the slider range and default. (A clean choice: decay 4.59 → 2.30 over 2.5 s ⇒ τ = 0.92 N·m, held ω = 0.75, KE = 0.86 — four distinct readings.)

### P2-6 · Apparatus geometry: R_rim = 1.2 m is not consistent with I_frame = 0.50 kg·m².

**Evidence.** §2 authors R_table = R_rim = **1.2 m** and I_frame = **0.50 kg·m²**. A uniform disc with I = 0.50 at R = 1.2 has M = 2I/R² = **0.69 kg** — and the 2 m rod inside that budget (I_rod = M_rod·L²/12 = 0.33·M_rod) pushes the disc below 0.25 kg. A 2.4 m-diameter, sub-kilogram turntable is not an apparatus a physics teacher will accept, and REV 3 has now made the rim a **labelled on-canvas reference line**, i.e. a number a teacher can check. The stated reason for 1.2 m is sound (clear the 1.0 m rod tip so the pad never fouls the masses) — so the fix is a choice, not a deletion.

**Required correction.** Either (a) keep the rim beyond the rod and raise I_frame — **rejected here**, because I_frame ≈ 2.9 collapses the pull-in ratio from 4.64 to 1.78 and kills the aha; or (b) put the brake surface on a **drum at ~0.5–0.6 m** with the pad approaching in the disc plane, vertically clear of the rod and masses which ride above it. (b) also *strengthens* `teach_distinct_reference_lines_for_two_radii`: the masses visibly travel **outside** the braked radius, which is the stool-with-outstretched-arms picture, instead of a rim that reads as merely the table edge. State the vertical clearance either way.

### P2-7 · The scar audit's declared coverage boundary is false.

**Evidence.** Five rows inside the declared query sets are undispositioned (table in Pass 1). Two of them bind: `field3d_param_ramp_authoring_contract` (P1-1) and `derived_energy_sum_pairs_prestep_position_with_poststep_velocity` — whose DO ("Re-derive every term of a conserved sum from post-step state in one pass. Never reuse a value the integrator computed before its own update") lands directly on this concept's HUD, where I, ω = L/I, L, KE = ½Iω² and S7's dL/dt must all publish from ONE post-step snapshot.

**Required correction.** Disposition the five named rows; add the post-step-snapshot requirement to E8 with the same-frame consistency probe.

### P3 notes (take on the same pass; none blocking)

- `entry_state_map` lost the `external_torque` aspect in the F-9 reshuffle — a student asking "when is L not conserved" now enters at STATE_1. Restore `external_torque: STATE_5` (aspects need not be disjoint from the foundational range).
- **Rest clamp is on L, not ω.** Since ω = L/I, state it as *"if τ_ext·h would carry L through zero, set L = 0"* — otherwise the surgeon may clamp a derived quantity.
- **The dt-fold probe must fold the FRAME dt with h held fixed.** The cycle-1 wording ("a dt-fold (h, h/2, h/4) reproduces θ as well as ω") reads as folding the integrator step; explicit Euler on θ cannot satisfy that at 1e-9 and no fleet integrator does. The correct probe is the one in `explicit_linear_drag_is_unstable…`: *20 steps at dt = h vs 10 steps at dt = 2h, assert |θ_a − θ_b| < 1e-12 and |ω_a − ω_b| < 1e-12*, with n = round(dt/h). This error propagated into REV 3's E2 — correct it there.
- S3's budget is at the ceiling: subscript clause + prediction sentence + slide narration + the 10-word diver anchor inside 55 words. If physics_author overruns, cut the subscript clause and label "before/after" on the formula surface instead.
- §4 narrates "speeds up 4.6×" against the stated 2-dp convention (4.64×). Pick one.
- S6's walk row omits E1 though its HUD shows I.
- Say how long the S6 re-pin cue holds (≥0.5 s) and that the readouts blank across the cut, so no single frame shows a live +4.59 → −4.59 transition.
- S1's axle arrow exists for five states before S6 explains its direction. The magnitude-only treatment is the right call and no change is asked for — but physics_author must not narrate the arrow's *direction* before S6, or the extended cut stops being coherent.

---

## Rulings on the questions the re-submission raises

1. **Did every claimed fix land?** Yes — twelve of twelve, verified in text, none paper. F-1…F-5 are structurally fixed, not reworded.
2. **Is the arithmetic self-consistent and collision-free?** Yes, every figure re-derived above. The REV-2 KE₁ ≡ L identity is gone; no held configuration has a 2-dp collision; the two transient mid-ramp crossings are not findings.
3. **Is the single integrator correct for a dragged `r` during braking?** Yes, and the skeleton now states *why* — the ω·dI/dt term emerges from ω = L/I rather than being an omission. This was the most dangerous item last cycle and it is properly closed.
4. **Did the fixes introduce new contradictions of the REV-2 classes?** **No.** No state undoes its own claim within its beat; no state reverses L without a torque. The one residue is the *unstated* seam behaviour (P1-1), which is an ambiguity, not an authored defect — and it is graded as such rather than promoted to a false P1.
5. **Is the implied engine union still inside the survey's 0c-1 authorisation?** **Mostly, with three items that must be recorded as survey addenda, not waved through:** `reference_marks[]` (F1) · a **visible brake actuator with rim geometry** (F2's pad + `rim_radius_m` + the drawn rim line) · the **re-pin cue** (E8). None appears in `phase0_survey.md`'s union or its five closing additions. All three were raised at 0b **before any code**, which is exactly the path the survey prescribes, so **the alarm rule is not tripped** — but the union table is the chapter's single source of truth and it should not silently diverge from the spec the surgeon builds against. The dispatching session should append these three to the survey's 0c-1 table as an explicit addendum for the founder's awareness. F5 (radial force arrow) is **not** an addendum — survey row #5 already authorises force-applied-at-a-point, and REV 3 correctly claims reuse.
6. **Is the lesson design itself sound?** Yes, and better than REV 2 by a clear margin. S3's re-declaration as the predictive beat is the single best change: it converts a derivable state into the exam's actual use of the equation, performed on screen. The S1-arrow-as-magnitude-only device that keeps the extended cut coherent under F-9 is craft that was not asked for.

---

## ENGINE QUEUE — advisory to the 0c-1 dispatch brief

Nothing is built, so nothing is `FIX(engine)`. These are corrections the **skeleton must carry** before `field3d-surgeon` is dispatched; owner on dispatch = `peter_parker:field3d_surgeon`.

| # | Item | Tag | Evidence / probe |
|---|---|---|---|
| E-a | **Two ramp shapes, named:** one-shot-hold (`nlbRunParamRamp`, `field_3d_renderer.ts:42295–42338`) for S1–S5/S7; repeating triangle (`nlbRunIdleSweep`) for S8 only; S6 loops its two runs | **blocking 0c-1** | P1-1. Probe: at t > end_ms assert the ramped param equals `to` for the remainder of the state and never re-approaches `from` |
| E-b | **Entry pose == `param_ramp.from`** in every ramped state; state entry is a single-frame re-pose | blocking 0c-1 | OPEN `field3d_param_ramp_authoring_contract`. Probe is already written in that row |
| E-c | **`reference_marks[]` with TWO declared surface forms** — bar tick (S4) and adjacent labelled value chip + match cue (S3) | blocking 0c-1 | P1-2; confirmed absent (0 hits) |
| E-d | **Enum closure = a DIFF against `phase0_survey.md:223–232`, both directions**, with IMPLEMENTED/DEFERRED sets | blocking 0c-1 | P1-3 + FIXED `deferred_enum_members_must_be_declared_not_merely_unimplemented` (its probe applies verbatim) |
| E-e | **One post-step snapshot** publishes I, ω, L, KE and dL/dt in the same frame | blocking 0c-1 | FIXED `derived_energy_sum_pairs_prestep_position_with_poststep_velocity`; probe: assert all five HUD values consistent with the SAME published L and I in one frame snapshot |
| E-f | Single L-integrator + signed ω₀ + frictional rest clamp **on L** | blocking 0c-1 (carried, correct in REV 3) | P3; probe per `explicit_linear_drag…`: 20 steps at dt = h vs 10 at dt = 2h, \|Δθ\| and \|Δω\| < 1e-12; plus drag `r` with τ_brake > 0 for 20 s and assert ω = (L₀+∫τ)/I(t) to 1e-9 |
| E-g | τ_ext source LIST with rim geometry (`rim_radius_m`) + F5 radial force arrow | carried from cycle 1 — build as listed | REV 3 F2 / F5 |
| E-h | Record F1, the visible brake actuator + rim, and the re-pin cue as **survey addenda** to the 0c-1 union table | process | Ruling 5 |

---

## Candidate scar rows (report-only — the dispatching session files these; founder-proxy applied nothing)

**Two of the cycle-1 candidates should be EXTENDED, not duplicated** (`bug_class` is the upsert key):

```sql
-- EXTEND the pending cycle-1 candidate rather than minting a sibling class
INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('authored_beat_ends_by_undoing_the_state_own_claim',
 'A one-way authored beat that does not declare hold-vs-repeat undoes its own claim once per cycle',
 'CRITICAL','alex:architect',
 'A skeleton removed an authored push-out but kept looping language, leaving the beat''s termination (hold at end value vs return to start) unstated; a repeating ramp reinstates the deleted undo at the engine layer.',
 'Every authored beat DECLARES its termination: one-shot-hold (holds at the end value for the remainder of the state, never returning toward the start) or looping. A state whose claim is a CHANGE must be one-shot-hold. Name the proven shape by file:line so the surgeon does not invent a third. State the entry configuration for every state and require it to equal the ramp''s from-value.',
 'js_eval',
 'For every state with an authored ramp: at t > end_ms assert the ramped parameter equals `to` and never re-approaches `from` within the state; assert the authored entry value of the ramped parameter equals ramp.from.',
 'OPEN', ARRAY['conservation_of_angular_momentum']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_coam_cycle1', 'directive')
ON CONFLICT (bug_class) DO UPDATE SET
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  concepts_affected = EXCLUDED.concepts_affected;

INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set',
 'A Phase-0 enum closure re-scoped to the union but silently dropped rows the union itself added',
 'MAJOR','alex:architect',
 'The architect re-scoped the enum from its own five tokens to the 12-concept union but enumerated the union from memory, omitting three of the five capabilities the survey''s own closing sweep had added.',
 'Enum closure is a DIFF against the survey table, executed in BOTH directions and shown: every survey union row (including every row the advanced-ring sweep ADDED) maps to at least one declared token, and every declared token maps to at least one union row. Assert the addition rows by line reference, never from memory.',
 'sql',
 'Extract the capability rows from the Phase-0 survey union table plus its closing-additions table; extract the token list from the skeleton''s enum-closure block; assert the set difference is empty in both directions.',
 'OPEN', ARRAY['conservation_of_angular_momentum']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_coam_cycle1', 'directive')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, prevention_rule = EXCLUDED.prevention_rule,
  probe_logic = EXCLUDED.probe_logic, concepts_affected = EXCLUDED.concepts_affected;
```

**Three NEW classes** (checked against this run's other candidate names — no collision):

```sql
INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('named_primitive_declared_without_the_surface_that_can_render_it',
 'A design named the misconception/prediction primitive but not the surface it attaches to, and the chosen surface cannot carry it',
 'MAJOR','alex:architect',
 'A generic reference-mark primitive was declared for "any readout or bar", then consumed on a value-only numeric readout that has no scale for a mark to sit on; the state''s entire payload picture was therefore unrenderable as specified.',
 'Naming the primitive is half the requirement (field3d_rule16a...). The other half is naming, per consumption site, the SURFACE it attaches to and what "the live value meets the mark" looks like on that surface. A value-only readout is not a scale: a mark on it must be re-specified as an adjacent labelled value chip plus an explicit match cue, or the readout must be given a gauge in that state.',
 'manual',
 'For every design-time primitive consumed at more than one site, assert each site names the host surface and the on-screen cue; reject "any readout or bar" as a site specification.',
 'OPEN', ARRAY['conservation_of_angular_momentum']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_coam_cycle2', 'directive')
ON CONFLICT (bug_class) DO UPDATE SET prevention_rule = EXCLUDED.prevention_rule;

INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('scar_audit_claims_a_coverage_boundary_it_did_not_enumerate',
 'A scar audit declared its queried universe honestly, then left rows inside that universe undispositioned',
 'MODERATE','alex:architect',
 'The audit stated "any row outside these result sets is not dispositioned" but omitted five rows that were inside them, including an OPEN directive that bound the design.',
 'Declaring the query boundary is necessary but not sufficient: the set of bug_class strings dispositioned in the document must be a SUPERSET of the union of the declared queries'' result sets. Diff the two lists mechanically before submitting; a row inside the boundary gets an explicit verdict (fixed / satisfied / N-A-with-reason), never silence.',
 'sql',
 'Re-run each query the document declares; collect result bug_class strings; assert every one appears verbatim in the document text.',
 'OPEN', ARRAY['conservation_of_angular_momentum']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_coam_cycle2', 'directive')
ON CONFLICT (bug_class) DO UPDATE SET prevention_rule = EXCLUDED.prevention_rule;

INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('authored_lumped_constant_inconsistent_with_the_drawn_apparatus_geometry',
 'A lumped inertia/stiffness constant was authored independently of the geometry drawn on canvas, implying an impossible object',
 'MODERATE','alex:architect',
 'I_frame = 0.50 kg-m-squared was authored for teaching contrast while the rim radius was set to 1.2 m for mesh clearance; together they imply a sub-kilogram 2.4 m turntable, and the rim is now a labelled on-canvas number a teacher can check.',
 'Any lumped constant (I_frame, k, damping) authored alongside a DRAWN dimension must be checked for mutual plausibility at design time: back out the implied mass/size and state it. If the teaching-driven constant and the clearance-driven geometry conflict, change the geometry, never the constant that carries the aha ratio.',
 'manual',
 'For each authored lumped inertia, compute the implied body mass from the drawn radius (M = 2I/R^2 for a disc) and assert it is within an order of magnitude of a real classroom apparatus.',
 'OPEN', ARRAY['conservation_of_angular_momentum']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_coam_cycle2', 'directive')
ON CONFLICT (bug_class) DO UPDATE SET prevention_rule = EXCLUDED.prevention_rule;
```

**No row minted for P2-4** — the OPEN `derivation_principle_applied_to_one_beat_but_not_its_sibling` is exactly this failure; append `conservation_of_angular_momentum` to its `concepts_affected` rather than forking the key. Same standing recommendation as cycle 1 for `teach_visual_must_match_narration`.

---

## Key paths the founder should read first

1. `docs/loop_runs/rotmech/conservation_of_angular_momentum/skeleton.md` §3 S3 row + §10(b) "Predicted speed mark" — the one place a P1 is visible in three lines (P1-2).
2. `src/lib/renderers/field_3d_renderer.ts:42295–42338` — `nlbRunParamRamp`'s comment block; it settles P1-1 by itself ("HOLDS at `to` forever — the deliberate opposite of nlbRunIdleSweep's repeating triangle").
3. `docs/loop_runs/rotmech/phase0_survey.md:223–232` beside skeleton.md's "Enum-closure contract" paragraph — the three-row gap of P1-3 is a direct visual diff.
4. `docs/loop_runs/rotmech/conservation_of_angular_momentum/skeleton.md` §3 pin-margin table — the best new work in REV 3; every row re-checked and correct.
5. `docs/loop_runs/rotmech/conservation_of_angular_momentum/skeleton.md` §3 S3 + §2 38a paragraph — the F-5 fix; worth reading as the model for how a "contrast pair" state earns its place.

---

```
RUBRIC (advisory, unratified — docs/EXEMPLAR_RUBRIC.md; did not affect the verdict)
Checkpoint-A subset (D1, D2, D8, D9, D10 — the five answerable from a skeleton)
  D1 2 · D2 2 · D8 2 · D9 2 · D10 2   = 10/10   (was 8/10 at REV 2)
  weakest: D10 explore earns its place — five dials, four with stated live semantics
           after F-6; the brake dial still has no range or default, so one of the five
           is not yet demonstrable within a stated range (evidence: §3 S8 controls row,
           §3 S5 — no [min,max] anywhere in the document)
           D2 arc grammar — the order IS the derivation and the aha lands at S2 of 8,
           but S3's quantitative instance predicts the SLOW-DOWN while the assessed
           exam item (Block 1 JEE trace) computes the SPEED-UP; the skill transfers,
           the instance is inverted (evidence: §3 S3 "predicts 1.50" vs Block 1 "(i) the new ω")
```

**Note on the score, for the founder.** This is the highest Checkpoint-A subset recorded, and the verdict is `DESIGN_FIX` anyway. That is not a contradiction — it is a blind spot worth knowing about: the rubric measures the **lesson**, and this lesson is genuinely excellent. The three P1s are all in the **engine-spec surface**, which no rubric dimension touches, and which only exists because this skeleton is a Phase-0 spec driver. Per the 2026-08-01 report-only ruling the score changed nothing; had a 10/10 talked the reviewer out of the FIX, it would have broken it.

---

## Gate statement

**This is fix cycle 2 of 2 — the last one.** There is no cycle 3: if the re-submission does not carry P1-1, P1-2 and P1-3, the concept **ESCALATES to the founder** under the fix-cycle-budget trigger, and the 0c-1 dispatch parks with it. Each of the three is a named, mechanically checkable edit — a declared ramp-termination line plus an entry-config column; one named rendering form for the prediction mark; four tokens added to the enum list with an implemented/deferred split — and cycle 2 can be verified by inspection in minutes, not by re-reviewing the design.

**`physics_author` and the 0c-1 `field3d-surgeon` dispatch remain UNAUTHORISED** until this returns `DESIGN_OK`. Nothing here is a shipping judgment (Rule 17 untouched); founder-proxy wrote no files, applied no SQL, and dispatched no one — the routing above is a report field for the orchestrating session.
