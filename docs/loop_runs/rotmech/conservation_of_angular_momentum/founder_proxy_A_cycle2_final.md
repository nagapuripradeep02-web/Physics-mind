# CHECKPOINT A — `conservation_of_angular_momentum` (rotmech 0b, **REV 4**) — FINAL VERIFICATION

**VERDICT: `DESIGN_OK`.**
founder-proxy, 2026-08-02 · fix cycle 2 of 2 (the last) · reviewed `skeleton.md` (REV 4) against `skeleton_rev3.md` and `founder_proxy_A_cycle2.md`.

**All three blocking P1s landed, and each was verified against a source outside the document — not against the RESPONSE table.** P1-1's ramp-shape claim was re-checked against `field_3d_renderer.ts` and the citation is exact to the line. P1-3's enum diff was re-checked against `phase0_survey.md` and every line reference is correct. P1-2's two surface forms are declared at both consumption sites, in F1, in the ledger and in the walk table. P2-4 … P2-7 and all eight P3 notes also landed. The new S5 and drum arithmetic re-derives exactly. And the scar-audit claim that was the entire substance of P2-7 — the superset — is not merely true this time, it is **set equality**: the three list queries were re-run live (32 / 47 / 30, universe unchanged), the `bug_class` strings extracted and deduplicated (**77**), and diffed both directions against the document: **zero missing, zero orphans, zero ellipses.** That is the first document in this run whose declared coverage boundary is mechanically reproducible.

`physics_author` is authorised. The 0c-1 `field3d-surgeon` dispatch is authorised on the spec as written, with the carry-forward list below folded into the brief — none of it withholds approval, and none of it is a design defect.

---

## The three P1s — verified against source, not against the response table

### P1-1 · one-shot-hold contract + entry pose — **LANDED (six sub-items, all six checked)**

| Required correction | Where it now reads | Verified how |
|---|---|---|
| Declare one-shot-hold, name the shape by file:line | §3 opening block + header | **Citation checked against source.** `field_3d_renderer.ts` L42295 opens the comment; L42296–42298 read *"ONE-SHOT monotonic reveal … then HOLDS at 'to' forever — the deliberate opposite of nlbRunIdleSweep's repeating triangle"*; L42330 is `else if (tMs >= t1) v = pr.to; // HOLDS at "to" — never returns toward "from"`. **Every line number in the skeleton is exact**, including the 42295–42338 range (the function closes at 42338) |
| "Loop period" language gone from S1–S5/S7 | pin-table column is now **"State duration R (min)"**, with the disclaimer *"these are STATE DURATIONS, not loop periods"*; S4's "rest of the loop" → "remainder of the state"; archetype-discharge rule re-worded off "loop reset" | `grep -i loop` over REV 4 returns **seven hits, all legitimate**: the S6 declaration ×3, the pin-table disclaimer, the DoD line, and two scar `bug_class` strings. No looping language survives on a one-shot state |
| S6 the only looping state; S8's sweep = idle triangle | §3 ×4, E4 | S8 reads *"repeating triangle, `nlbRunIdleSweep` shape — NOT a ramp"* in both §3 and E4 |
| ENTRY CONFIG column, all eight states, entry = `ramp.from` | §3 table column 4 | **All eight rows carry (r · ω · brake).** Each ramped state's entry cross-checked against E4's directed ramps: S2 entry 0.80 = from 0.80 · S3 0.20 = 0.20 · S4 0.80 = 0.80 · S7 0.80 = 0.80. **Consistent in every case.** E4's `↔` is now directed `→` per state |
| State entry = single-frame re-pose | §2 as the general rule; **named at the one place it matters** — S5's entry cell: *"single-frame re-pose from S4's held r = 0.20"* | This is the exact seam the finding was about (S4 holds at 0.20, S5 opens at 0.80). It cannot now be read as a taught radial slide |
| Disposition `field3d_param_ramp_authoring_contract` | SCAR AUDIT row 31: *"**B — the P1-1 row**"* | The row's live text was pulled: its DO ("author's initial pose and the ramp are two sources of truth; keep them equal") and its probe ("assert the authored value of the ramped param equals `param_ramp.from`") are both discharged — the probe is carried **verbatim** into E4 |

### P1-2 · one rendering form per consumption site — **LANDED**

- **S3 (value-only readout):** *"a **static labelled VALUE CHIP** adjacent to the live ω readout — `predicted ω = 1.50`"*, with the **match cue** — hold-glow on both, fired once when |ω − 1.50| < 0.01.
- **S4 (bar):** *"the thin static tick appears FIRST at KE = 3.44 J **on the bar scale** (F1 tick form)"*.
- **F1** declares both forms as the primitive's contract, not as prose.
- **Ledger** now reads *"value chip `predicted ω = 1.50` adjacent to the live ω readout"* — the old "tick 'predicted 1.50'" is gone.
- **Walk table** distinguishes `F1 (chip form)` at S3 from `F1 (tick form)` at S4.

The surface that cannot carry a tick no longer carries one, and the ledger matches. The one thing the surgeon still needs is a semantics note (carry-forward 6) — not a design gap.

### P1-3 · enum closure as a shown both-direction diff — **LANDED, and the diff was checked independently**

`phase0_survey.md:223–232` was read directly. The five closing additions are at L227 (cross-product, #5/#9), L228 (parallel/perpendicular axis with d drawn, #6), L229 (multi-body + CoM marker/path trace, #2/#3), L230 (composite parts list, #1), L231 (rolling-vs-slipping, #12 → 0c-2). **REV 4's Direction-1 table cites all five, and every line reference is correct.** The four token groups that were absent at REV 3 are all present:

| Previously missing | Now declared |
|---|---|
| parallel/perp axis (L228) | `axis_select` + **`axis_pair {a, b}` + `d_draw` + the perpendicular-axis triple** ✓ |
| multi-body CoM (L229) | `bodies[]` + **`cm_marker` + `cm_path_trace`** + `fragment_trigger` ✓ |
| composite parts list (L230) | **`parts[] {mass, centroid}`** ✓ |
| cross-product construction (L227) | **`cross_product_construction {inputs, result, rhr_hand}`** ✓ |

Direction 2 (no orphan tokens) is present and maps every declared token to a survey row. The **IMPLEMENTED / DEFERRED** split is explicit; checked token by token — **intersection is genuinely empty** (no token appears in both lists; `ω₀` is implemented while `θ₀`/`α_drive` are deferred, which is the correct split, not a duplicate), and the union equals the declared contract. `deferred_enum_members_must_be_declared_not_merely_unimplemented` is applied to the whole list, per its live DO.

---

## The mechanical checks that were run, and what they returned

**Scar-audit superset (the P2-7 substance) — VERIFIED, and stronger than claimed.**

```
--owner alex:architect  32   --row-type directive  47   --field3d --open  30      (counts as declared)
77 unique bug_class strings across the three
DB → document:  0 missing   (every row appears verbatim)
document → DB:  77 rows in the table, 0 orphans
ellipses in row names: 0        rows with an empty verdict cell: 0
```

The claim was *superset*; the reality is *equality*. The five rows the cycle-2 report named as absent are all present with explicit verdicts: `field3d_param_ramp_authoring_contract` (row 31, **B**) · `derived_energy_sum_pairs_prestep_position_with_poststep_velocity` (row 14, **B** → E8's one-post-step-snapshot + same-frame probe) · `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` (row 4, **B**, restored, and the Camera note is back) · `field3d_measured_overlay_fit_runs_once_against_a_sibling_blanked_on_entry` (row 29, **B** → per-frame churn-guarded re-measure for the mid-state S4 bar and S3 chip) · `teach_auditor_reads_field3d_sliders_from_config_not_scene_composition` (row 65, **0d**). Per the dispatch note, `--field3d --open` was used only as one of three inputs to the union, never as coverage.

**Arithmetic — every new figure re-derived independently.**

| Claim | Re-derived | ✓ |
|---|---|---|
| ΔL = 0.92 × 2.5 | 2.30 | ✓ |
| L 4.59 → 2.29 | 2.2900 | ✓ |
| ω = 2.29/3.06 = 0.75 | 0.74837 → 0.75 | ✓ |
| KE = 0.86 | L²/2I = 0.85688 → 0.86, and ½Iω² = 0.85688 — the two routes agree to 5 dp | ✓ |
| four held readouts pairwise distinct at 2 dp | 3.06 / 0.75 / 2.29 / 0.86 | ✓ |
| max-τ stop inside the window | 4.59/2.0 = **2.295 s** < 2.5 s | ✓ (see carry-forward 1 on the printed rounding) |
| drum ≈ 2.3 kg | 2·0.35/0.55² = 2.314 | ✓ |
| rod ≈ 0.45 kg | 0.15·12/2.0² = 0.450, and 0.35 + 0.15 = 0.50 = I_frame exactly | ✓ |
| pad clears the masses at every r | rod plane +0.25 m above the pad plane; pad travels in the drum plane; at r = 0.20 (< R_drum) the mass is radially inside the drum edge but 0.25 m above it — **no intersection at any r** | ✓ |
| carried figures | I₁ 3.06 · I₂ 0.66 · L 4.59 · ω₂ 6.9545→6.95 · KE 3.4425→3.44 / 15.9607→15.96 · ratio 4.6364 = I₁/I₂ | ✓ |

**No new contradiction from the drum change or the S5 numbers.** The old clearance argument ("the 1.2 m rim lies beyond the 1.0 m rod tip") is fully replaced by the vertical-clearance argument; no live spec position still says `R_rim`/`rim_radius_m` (the two surviving mentions are the explicit supersession note and the rename row). The geometry change *improves* two other claims rather than straining them: the masses now genuinely cross the braked radius on every slide (strengthening `teach_distinct_reference_lines_for_two_radii`, as claimed) and the home pose literally is the stool picture. The S5 numbers do not disturb any other state — r is fixed at 0.80 through S5, so I stays 3.06 and the decay is a clean L-only integration, replayable in closed form as F2 requires. The pin at 6.0 s lands 1.0 s after the end-config and photographs the held 2.29 / 0.75 / 0.86 triple.

**P2-4's physics, checked quantitatively.** The stated picture — arrows stay inward and shorten on the way out — is not just defensible, it is strongly legible: the constraint force mω²r falls **19.35 N → 3.60 N** across the outward slide (ω = L/I falls faster than r rises), a 5.4× shortening, and lengthens by the same factor on every inward slide. The arrows never approach zero and never reverse.

---

## Per-state design table (Checkpoint A form — the built-sim CSV columns apply at B)

| State | One idea | Distinct from predecessor? | Entry config consistent? | Ring | Verdict |
|---|---|---|---|---|---|
| S1 | No external torque ⇒ L = Iω constant | baseline (`reveal-build`) | r 0.80 · ω +1.50 · brake off · no ramp | core | OK |
| S2 | Pull in ⇒ I falls ⇒ ω rises | THE aha; `radial-slide`; visible −r̂ agent | 0.80 = `ramp.from` ✓ | core | OK |
| S3 | The trade is exact — the equation *predicts* | declared contrast pair; the payload is prediction-meets-readout, not "the reverse slide" | 0.20 = `ramp.from` ✓, continuous with S2's held end | core | OK |
| S4 | L conserved, KE is not | `diverge-from-mark`; new quantity KE; gap holds | 0.80 = `ramp.from` ✓ | core | OK |
| S5 | Conservation holds only while τ_ext = 0 | `translate-through`; only state with a second agent; now fully numbered | **single-frame re-pose from S4's held 0.20** — named ✓ | core | OK |
| S6 | L is a vector along the axis | `cycle-compare`; **the only looping state**; restart not reversal | r 0.80 · run A ω +1.50 ✓ | extended | OK |
| S7 | τ_ext = dL/dt ⇒ L constant | `equation-build`; honest framing of dL/dt | 0.80 = replay `ramp.from` ✓ | advanced | OK |
| S8 | Sandbox | `drag-sandbox`; idle triangle; five ring-gated dials | r 0.80 · ω +1.50 · brake 0 · sweep armed | explore | OK — see carry-forward 5 |

Ring cut re-walked: drop S7 → coherent; drop S6–S7 → coherent, the condition beat survives (F-9), S1's axle arrow stays magnitude-only and nothing surviving narrates its direction, spin-direction cuts with its ring. Explore surfaces `L = Iω` (core) under every preset.

---

## Carry-forward — none of this withholds approval

**To `physics_author`:**

1. **Rounding slip.** `4.59/2.0 = 2.295 s` is printed as "2.29 s" in the P2-5 response row and in §3 S5 (the Notes section has it right). Under the document's own 2-dp rounding convention it is 2.30. Trivial, but this document's discipline is one convention everywhere.
2. **A transient numeric coincidence in S5, for narration only.** L sweeps through **3.06** at t ≈ 1.66 s into the decay, momentarily equalling the constant I readout. Different instruments, different units, no pin within 4 s of it, and no beat asks a comparison — **not a defect**. Named only so the narration does not invite a glance at both readouts during the decay.
3. **One noun for the apparatus.** §2/S1 say "turntable"; §2 geometry and F2 say "brake drum" / "platform" for the same object. Rule 41 wants one plain word in every reader-facing string. "Turntable" reads best; the pad then "grips the turntable's rim at 0.55 m".
4. **Arrow length semantics.** Author the −r̂ arrow as tracking mω²r: **19.35 N at r = 0.20 → 3.60 N at r = 0.80**. That makes "the agent eases its grip" a computed picture rather than an assertion, and it is the same number in reverse on every inward slide.
5. **`m` and `ω₀` still have no `[min, max]`/default** (r and τ_brake now do). Author them with the physics block; no probe depends on them, which is why this is not a finding.

**To the 0c-1 `field3d-surgeon` brief (the dispatching session folds these in — they are additions to a sound spec, not corrections to it):**

6. **The S3 match cue must be a predicate latch, not an edge detector.** |ω − 1.50| < 0.01 is true for only ~11 ms before the ramp ends (dω/dt ≈ 0.94 rad/s there) — under one frame at 60 Hz, so a crossing detector can step over it. The predicate stays true forever once the ramp holds, so a "first frame the predicate is true" latch cannot miss it. Say which.
7. **F5 builds the arrow *rendering* half of survey #5; the torque-producing `applied_force_at_point` source member is DEFERRED.** One sentence prevents the surgeon from either building the whole source or refusing the arrow because its source is deferred.
8. **The `r` and `R_drum` reference lines now coincide once per slide by construction** (every slide crosses 0.55). E5's hysteretic-decollision citation covers it, but the collision is now guaranteed rather than incidental — make it a named bring-up probe.
9. **Enum Direction-1 omits survey #11 (`pure_rolling`).** #12 got an explicit "correctly EXCLUDED — 0c-2" line; #11 ("no — already in 0c-2") got silence. Add the same line so the closure table is exhaustive over #1–#14. No capability is at risk — the survey itself assigns it to 0c-2 — but the table's value is that it is exhaustive.
10. **`deferred_enum_members…`'s third gate assertion** — *"no deferred member appears in the frame or apply pass"* — is not restated in the skeleton (the first two are). It is a build-time probe; carry it into the 0c-1 gate.
11. **Survey addenda (Ruling 5, unchanged and still owed by the dispatching session):** append `reference_marks[]` (both surface forms), the visible brake actuator + `brake_drum_radius_m` + drawn drum line, and the re-pin cue to `phase0_survey.md`'s 0c-1 union table. All three were raised at 0b before any code — the alarm rule is not tripped — but the union table is the chapter's source of truth and should not silently diverge from what the surgeon builds.

---

## Candidate scar rows

**No new class is minted this cycle** — nothing new failed, and every cycle-2 candidate's `bug_class` is already cited by name inside REV 4 (rows 13, 31 and the two new classes in §2/§3). The dispatching session files the cycle-1 and cycle-2 candidates as written in `founder_proxy_A_cycle2.md`, with **one amendment**: there is now a verified-working probe for the audit-coverage row, so replace its `probe_logic` with the command that actually ran.

```sql
INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('scar_audit_claims_a_coverage_boundary_it_did_not_enumerate',
 'A scar audit declared its queried universe honestly, then left rows inside that universe undispositioned',
 'MODERATE','alex:architect',
 'The audit stated "any row outside these result sets is not dispositioned" but omitted five rows that were inside them, including an OPEN directive that bound the design. Ellipsis-abbreviated bug_class names in the audit text silently defeated verbatim matching.',
 'Declaring the query boundary is necessary but not sufficient: the set of bug_class strings dispositioned in the document must be a SUPERSET of the union of the declared queries. Write every bug_class VERBATIM — never abbreviated with an ellipsis and never covered by a wildcard phrase like "layout/kerning rows" — so the diff is mechanical. Run the diff before submitting; a row inside the boundary gets an explicit verdict (binds / satisfied / N-A-with-reason), never silence.',
 'sql',
 'For each declared query, run src/scripts/query_engine_bug_queue.ts, extract bug_class via the leading bullet, sort -u across all queries, then for each string assert a fixed-string (grep -F) match in the document. Assert BOTH directions: zero DB rows missing from the document, and zero document rows outside the query union. Reference run 2026-08-02: 77/77, both directions clean.',
 'OPEN', ARRAY['conservation_of_angular_momentum']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_coam_cycle2', 'directive')
ON CONFLICT (bug_class) DO UPDATE SET
  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,
  probe_logic = EXCLUDED.probe_logic, concepts_affected = EXCLUDED.concepts_affected;
```

Also still owed by the dispatching session (both from cycle 2, unchanged): append `conservation_of_angular_momentum` to the OPEN `teach_visual_must_match_narration` and `derivation_principle_applied_to_one_beat_but_not_its_sibling` rows rather than forking either key.

---

## Key paths the founder should read first

1. `docs/loop_runs/rotmech/conservation_of_angular_momentum/skeleton.md` §3 opening block + the §3 table's ENTRY CONFIG column — the P1-1 fix, and the single most reusable artifact this cycle produced for every future field_3d skeleton.
2. `src/lib/renderers/field_3d_renderer.ts:42295–42338` — the comment the skeleton cites; it settles the hold-vs-repeat question by itself, and the skeleton's line references to it are exact.
3. `docs/loop_runs/rotmech/conservation_of_angular_momentum/skeleton.md` "Enum-closure contract" beside `docs/loop_runs/rotmech/phase0_survey.md:223–232` — the P1-3 fix as a direct visual diff; this is the block that protects 0c-1 from a post-landing renderer edit.
4. `docs/loop_runs/rotmech/conservation_of_angular_momentum/skeleton.md` SCAR AUDIT (the 77-row table) — the first mechanically reproducible coverage claim in this run; worth adopting as the house format for scar audits.
5. `docs/loop_runs/rotmech/conservation_of_angular_momentum/skeleton.md` §2 apparatus geometry — the drum rebuild; it fixed an implausible object and, unusually, made two unrelated teaching claims better.

---

```
RUBRIC (advisory, unratified — docs/EXEMPLAR_RUBRIC.md; did not affect the verdict)
Checkpoint-A subset (D1, D2, D8, D9, D10 — the five answerable from a skeleton)
  D1 2 · D2 2 · D8 2 · D9 2 · D10 2   = 10/10   (REV 3: 10/10 · REV 2: 8/10)
  weakest: D10 explore earns its place — the brake dial's missing domain is CLOSED
           ([0, 2.0] N·m, default 0.92), but m and ω₀ still carry no [min,max]
           (evidence: only [0.15,0.90] and [0,2.0] appear anywhere in the document)
           D2 arc grammar — unchanged from cycle 2 and now acknowledged in the text:
           S3's instance predicts the SLOW-DOWN while the assessed item computes the
           SPEED-UP; the skill transfers, the instance is inverted
           (evidence: §3 S3 "predicts 1.50" vs Block 1 "(i) the new ω")
```

The subset score is unchanged from the cycle that returned `DESIGN_FIX`, which is the same blind spot recorded last cycle and is worth the founder keeping: **the rubric measures the lesson, and this lesson was already excellent at REV 3.** Everything cycle 2 fixed lived in the engine-spec surface, which no rubric dimension touches. Per the 2026-08-01 report-only ruling the score changed nothing in either direction — it did not talk the reviewer out of the FIX last cycle and it did not talk it into the OK this cycle.

---

## Gate statement

**`DESIGN_OK`. No escalation — the fix-cycle budget was not exceeded; cycle 2 converged.** The concept proceeds to `physics_author`, then to the 0c-1 `field3d-surgeon` dispatch on `feat/rotmech-engine`, with the eleven carry-forwards above folded into the physics block and the dispatch brief respectively. Nothing above is a shipping judgment (Rule 17 untouched). founder-proxy wrote no files, applied no SQL, and dispatched no one — every routing and every SQL tuple here is a report field for the dispatching session.
