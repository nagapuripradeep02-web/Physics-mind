# founder-proxy — Checkpoint A (DESIGN GATE) · `angular_momentum` · fix cycle 2 → FINAL verdict

**Target:** `C:\Tutor\physics-mind-rotmech-c\docs\loop_runs\rotmech\angular_momentum\skeleton_rev4.md`
**Desk:** C (`feat/rotmech-c`) · Class 11 Ch.7 concept #9 · `rigid_body_rotation` scenario, built and merged
**Chain read:** `skeleton_rev1` → `founder_proxy_A.md` → `rev2` → `rev3` → `founder_proxy_A_cycle2.md` → **`rev4`**
**Scope of this review (as dispatched):** the four re-check items from my cycle-2 handoff, plus anything REV 4 newly broke. A1–A13, both founder rulings, the scar re-rulings and the bug-queue disclosure were verified and closed at cycle 2 and are NOT reopened.

> Persisted verbatim by the dispatching session — founder-proxy is report-only and writes no repo file.

---

## 1 · VERDICT — `DESIGN_OK`, with ONE binding correction travelling to physics_author (C1)

**B1, B2, B4 and B5 are fully discharged, and I re-derived every one of them rather than accepting the report.** The S3 six-second hole is gone: the ramp now runs 9000 → 16000 and the largest static window anywhere in that state is **1.0 s** (16.0–17.0), with the next-largest 0.9 s (8.1–9.0) and 0.7 s (stop → release). S2 has **no static window at all** — the drum spins continuously, the pad glides 4.8 → 11.6 s, the decay spans 11.6 → 18.4 s, and the retract runs past state end. **No pin moved:** I recomputed all four from `deriveStateMeta.ts:3134–3213` including the newly-enumerated `phases[]` class at `:3198–3208`, and every phase candidate sits below its state's governing candidate — S1 22700 (readout 21500+1200; phases 6800/12200/15700), S2 20400 (release 18400+2000; chip 11400, phase 13100), S3 19500 (restart 17500+500+1500; ramp 16900, marks 8700/17900, phases 4400/9500/18000), S4 13000. Exactly the cycle-2 A6 verification set. The physics number the architect changed is right: `0.45 × 6.8 = 3.06` exactly, endpoints 1.53 / 0.50 unchanged, `1.53 = 4.59/3` so no rounding collision, and the L-crosses-3.06 coincidence correctly re-derived to t ≈ 15.0 s. The `phases[]` semantics check out against `:50647–50657` (last matching entry wins, so the ordered open phases give the intended piecewise focal), the introducing-sentence instants are right (S1's `rbr_l_arrow` at 15200 opens with T4 and holds through the pin), and S4's deliberate static `rbr_l_arrow` focal is safe — I confirmed `rbr_grip_hand` and `rbr_l_label` are both in the solid carve-out at `:50782–50788` while `rbr_l_arrow` is not.

**B3's structural half is right and its arithmetic half is wrong.** `theta0_rad` IS implemented — I re-verified the reader chain (`:50499` seed → `rbrThetaReset :50557`/`:49970` → `rbrThetaAt :49958`/`:49965`), the walk row is now correct, the both-directions verification rule is the right general lesson, and tagging S3's slide `[POSE-OBLIQUE]` was the correct call. But the azimuth **solve is derived in the wrong rotation convention and lands the primary aha's only mover on the global MINIMUM of screen travel** — the exact 0.399× foreshortened case B3 was written to eliminate. I did not reason this out and assert it; I projected it through real three.js r128 with the renderer's own camera (`:4104–4111`, `:50475–50477`) and mass geometry (`:50676`, local +X inside a group whose `rotation.y = rbrThetaAt`). At the authored `theta0_rad = 0.168`, θ_stop = 3π/4 and each mass slides **0.0748 NDC ≈ 40 px, purely vertical (dx = 0.0000)** — it reads as the masses drifting up the frame, not inward along the rod. A full 2π sweep puts that value at the sweep **minimum**. The correct solve gives **`theta0_rad` = 1.739**, θ_stop = 5π/4, **0.1383 NDC ≈ 75 px, purely horizontal (dy = 0.0000)** — 1.85× the travel, and unambiguously "the masses moved in". Because the platform is at rest for the whole 7 s slide, θ_stop governs the entire beat, so this is not a one-frame issue.

**I am signing this rather than escalating, and the reason matters: the convention error is MINE.** My cycle-2 report asserted that REV 3's implicit `theta0 = 0` "lands ≈80° off the camera azimuth — near the best case, by luck." The probe says it lands **9.6° off the line of sight — near the WORST case**, and the architect derived REV 4's formula from my framing, which is why the `(π/4 + π/2)` term is off by exactly π/2. Escalating would hand the founder an arithmetic question with a single determinate answer, on an error I authored into the fix instruction. And the residual is not a design defect: the arc, the state count, the device, the rings, the anchors and the control plan are all right, and the skeleton itself declares `theta0_rad` **provisional** ("RE-SOLVE whenever the brake window, τ, ω₀ or I₀ moves"). What is durably wrong is the FORMULA, and a corrected formula plus a reproducible probe is precisely what a travel condition is for. **C1 is binding, not advisory:** if it is not carried, Checkpoint B must FAIL this concept on it, and I name the probe below so that gate is mechanical rather than a matter of taste.

**Not an ESCALATE.** No physics doubt — every closed form re-checks exactly. Everything else has converged, and I did not lower anything to reach this verdict: C1 is a P2 because the aha's payload rides the two chips and the readouts, which are pose-independent DOM surfaces, and the slide is weakened rather than falsified. Had it falsified a claim it would be a P1 and this would read ESCALATE.

---

## 2 · PER-STATE TABLE

Checkpoint-A form (no frames exist; `reads_with_sound_off` judged from the authored visual plan).

| State | correct_YN | order_ok_YN | labels_present_YN | reads_with_sound_off_YN | clearly_different_YN | how_i_would_use | problem_or_missing | P |
|---|---|---|---|---|---|---|---|---|
| **S1** "A spinning body carries angular momentum" | Y | Y | Y | Y | Y | "Three numbers appear one at a time; the third is the first two multiplied." | Clean. `phases[]` fixed the B2 dim — the arrow takes the focal at 15200 with T4 and holds it through the 22700 pin. Continuous spin, no static window | P3 |
| **S2** "Slower spin, smaller L" | Y | Y | Y | Y | Y | "I holds still; L and ω fall together onto the number we printed before it happened." | B1 discharged — zero static window, decay 11.6–18.4 spans the second half, chip at 10500 prints before the fall begins at 11600. Residual: the 6.8 s pad glide projects at **11.4 px/s** — visible but weak (**C3**) | P3 |
| **S3** "Mass position changes L" — PRIMARY AHA | Y | Y | Y | Y | Y | "Stop it, slide the masses in, spin it back to the same speed — read L beside its own before-value." | B1 discharged (largest static window 1.0 s). **The azimuth solve is inverted: the slide projects at the sweep minimum, 40 px purely vertical (C1)** | **P2** |
| **S4** "L points along the axis" | Y | Y | Y | Y | Y | "Curl your right hand with the rim — thumb up. Other way — thumb down, same line." | Clean and untouched by this revision; the static `rbr_l_arrow` focal is correct (hand + label are solid-listed) | P3 (the #10-S6 duplication — a Checkpoint-C founder item) |
| **S5** "Try it yourself" (explore) | Y | Y | Y | Y | Y | "Drag m, watch the arrow; let go, watch the numbers re-pin." | Unchanged and honest: blank-during-drag stated, band narrowed, `r` and `tau_brake` excluded with written defences | P3 |

---

## 3 · CONDITIONS TRAVELLING WITH THE CONCEPT

None of these is a fix-cycle routing — the verdict is `DESIGN_OK` and the concept proceeds. C1 is **binding**; C2–C3 are advisory to the next stage; C4–C6 are Checkpoint-C / founder items.

### C1 · BINDING — the S3 azimuth solve is off by π/2; use `theta0_rad = 1.739` and the corrected formula `[owner: alex:physics_author` (re-solve) `→ alex:json_author` (writes it)`]`

**The convention chain, verified line by line.** `spin.rotation.y = rbrThetaAt(tMs)`, and three.js `R_y(θ)·x̂ = (cos θ, 0, −sin θ)`; the masses sit on local +X (`:50676`, `o.position.set(ud.side * r * W, rodY, 0)`); the camera sits at `(R sinφ cosθ_c, R cosφ, R sinφ sinθ_c)` looking at the origin (`:4104–4111`) with `θ_c = π/4` (`:50477`). The rod's azimuth is therefore measured in the **opposite sense** to the camera's, so the two differ by a sign — which is what a π/2 error looks like when a solve is written from remembered convention instead of projected.

Rod broadside ⟺ `cos(θ_stop + θ_cam) = 0` ⟺ **θ_stop ≡ π/2 − θ_cam (mod π)**. REV 4 authored `θ_stop ≡ π/4 + π/2`, which is the anti-parallel case.

| | θ_stop | mass slide 0.80→0.20 m, projected | direction | apparent rod span |
|---|---|---|---|---|
| REV 4 authored `theta0 = 0.168` | 3π/4 = 2.356 | **0.0748 NDC ≈ 40 px** — the sweep **MINIMUM** | dx = −0.0000, dy = −0.0748 (pure vertical) | 130 px |
| REV 3 implicit `theta0 = 0` | 2.188 | 0.0765 NDC ≈ 41 px (also near-worst — my cycle-2 "near the best case" was wrong) | dx = −0.0197, dy = −0.0739 | — |
| **corrected `theta0 = 1.739`** | 5π/4 = 3.927 | **0.1383 NDC ≈ 75 px** (sweep max 0.1420) | **dx = +0.1383, dy = 0.0000** (pure horizontal) | 199 px |

**The corrected instruction, verbatim, to replace the §3 camera-plan line:**

```
theta0_rad = ((π/2 − θ_cam) − ω₀·(t_engage + t_decay/2)) mod π,  θ_cam = π/4 (:50477)
           = (π/4 − 1.50·(4.5 + 1.1475)) mod π = (0.7854 − 8.47125) mod π = 1.739
RE-SOLVE whenever the brake window, τ, ω₀ or I₀ moves. VERIFY by projection, never by assertion:
the authored angle's NDC travel must sit within 10% of a 2π sweep maximum, not the minimum.
```

Accuracy note so nobody over-engineers this: the engine integrates θ on a forward-Euler 16 ms grid (`RBR_GRID_MS`, `:49737`), which drifts ≈0.012 rad (0.7°) over the decay — immaterial to a cos² legibility term. And the perspective optimum sits at θ_stop ≈ 0.490 (mod π), only 2.7% above the analytic π/4-family solve — take the analytic value, do not chase the perspective peak.

Two dependent corrections in the same edit: the FIX-CYCLE-2 RESPONSE table's B3 row claims "α = 90°, vs REV 3's α ≈ 80° by luck" (both wrong — 0° and ≈9.6°), and the pin table's S3 row says the frozen frame shows "rod ACROSS the view (theta0 solve)". It does not: at the 19500 pin the platform has been spinning for 1.5 s, so the pin azimuth is unrelated to θ_stop. Harmless — the frozen frame's claims (L = 0.99 beside "before: 4.59", masses at r = 0.20) are azimuth-independent — but it should not stand as a verified statement. The azimuth governs the **dense** window 9.0–16.2 s, which §3 already lists correctly.

### C2 · P3 — the stated phase-anchoring rule does not describe what is authored `[owner: alex:physics_author]`
§3 says "Every phase boundary sits at its sentence's cumulative end from the §3 plan", and physics_author is told to move them with the real word counts. That is true of S1 (6300/11700/15200 vs ends 6.2/11.5/15.0) but false of S2 (12600 is not a sentence end — it is 1.0 s after the press, and holding the pad focal for a beat after the cause is *correct* 32a practice) and false of S3 (3900 = pad travel start, 9000 = ramp start, 17500 = restart — all motion-anchored). Left as written, a recomputation could drag S3's 9000 phase to a sentence end and desync the focal from the mover it exists to follow. State the real rule: **a phase anchored to a MOTION event moves with that event; only sentence-anchored phases move with the words.**

### C3 · P3 — the S2 pad glide is slow enough to be worth a second look `[owner: alex:physics_author]`
Measured through the real camera: the pad's park→contact travel (`parkZ = contactZ + 1.05`, `:50730–50731`) projects to **78 px @1080h**, so `pad_travel_ms = 6800` gives **11.4 px/s** — perceptible, but weak for a beat whose job is "the cause visibly approaches", and 11× slower than the same pad in S3 (129.7 px/s). It is defensible (gentle approach ↔ gentle brake, τ 0.45 vs 2.00) and I am not calling it a defect — the state has continuous spin, so the no-static-hole rule holds regardless. But when the clock is recomputed, prefer a **2.0–2.5 s travel ending at engage** over the full 6.8 s creep: it reads as deliberate, it still spans the pre-decay middle, and it lets the retract finish inside the state instead of being caught mid-path at 22.0 s.

### C4 · P3 · HANDOVER — the chapter-wide apparatus contract still calls `theta0_rad` inert
`docs/loop_runs/rotmech/APPARATUS_CONTRACT.md:70` lists `theta0_rad` under "**Declared but inert — reading these is a silent no-op**". REV 4 corrected its own walk row, but the contract is the upstream source of the error and the artifact the **other three rotmech desks read**. Any sibling that needs to control its start azimuth will be told the lever does not exist. Not a blocker for this concept; a founder/Checkpoint-C item for the desk that owns the contract.

### C5 · P3 · HANDOVER — the SCAR AUDIT query block contradicts the header
The audit block is captioned "Queries run (LIVE table via Bash, **this session**), with counts" and shows `rigid_body_rotation → 1 row`, while the header states the REV 3 re-run returned **0** and that the REV 4 attempt hit Cloudflare 522s. The header's disclosure is honest and complete; the audit block is REV-1-vintage and mislabelled. Cosmetic, but it is exactly the kind of thing a Checkpoint-C diff trips on. (The bug-queue handling itself I rule **acceptable**, identical to the sibling standard: I hit the same 522s at cycle 2, the boundary is declared rather than asserted, and the four unchanged counts bound the risk.)

### C6 · P3 · HANDOVER (unchanged) — `#9-S4` vs `#10-S6`
The duplication remains claimed in writing with #10's in-scope alternative named. Still a chapter-level founder item at Checkpoint C, not a design defect here.

---

## 4 · RULINGS THE DISPATCH ASKED FOR

**4.1 · The word-band trim — DECLINED, and I ACCEPT the decline.** All three of the architect's reasons hold, and the second is the strongest: trimming S2/S3 moves their narration-anchored reveal instants, which moves the chip `at_ms`, the release and the readout candidates, which moves the very pins this fix was required to hold at 20400/19500. My cycle-2 suggestion was a *branch to consider*, not a finding, and the defect it was attached to (motion spread) has been closed with **zero words removed** — which is the better outcome, because it leaves S1's three term-introductions plus the A11 dual-label and the A5 arrow clause, and S3's five sentences with the §4 attribution clause, intact. My 91 s concern was a proxy for "these states are long because nothing happens in them"; the proxy is now disconfirmed — S1 spins continuously for 24 s, S2 has no static window, S3's largest hole is 1.0 s. Long states carrying continuous motion are not the failure I was pointing at. The **plan-binds** clause it adopted is the part that actually mattered, and it landed (B4). **Rejected as a finding; the decline is correct and the argument is sound.**

**4.2 · The two self-caught disclosures — sufficient, and independently verified.**
*(1) The omitted `phases[]` pin-candidate class.* I did not take the "no pin moved" claim on trust — I recomputed every candidate from `:3134–3213` **including the new S1 and S2 phase blocks**, which is precisely where a latent omission would stop being latent. S1's phases contribute 6800/12200/15700 against a governing 22700; S2's contributes 13100 against 20400; S3's 4400/9500/18000 against 19500. **No pin moves.** Disclosure sufficient; the enumeration is now complete and correct.
*(2) Scar #75's stale instants.* Updated to the B1 clock; the pointer at the SCAR AUDIT head (#2, #13, #19, #25, #62, #75, #120, #129, #139, #141) is exactly the traceability I asked for at cycle 2, and #120's re-ruling — owning that REV 3's own disposition asserted a 6.0 s hole was "bracketed by motion" — is the kind of self-correction I want on record for the C diff.

**4.3 · The B3 prose/number contradiction fix (pad "from 3.4 s" → 3.9–4.5).** Verified against the engine: travel window = `engage − pad_travel_ms` (`:50735–50736`), so 4500 − 600 = **3900 → 4500**. Correct.

**4.4 · Scar classes checked in Pass 1** (recurrence check, run before reading the skeleton): `retimed_narration_leaves_the_choreography_windows_on_the_old_clock` (closed — B1) · `static_state_focal_dims_the_overlay_the_state_exists_to_introduce` (closed — B2) · `walk_labels_a_field_inert_from_its_declaration_comment_while_the_reader_implements_it` (closed in the walk; **recurs at the contract level — C4**) · `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` (S3's stop is a closed-form clamp, nothing pinned on it) · `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` (pose unchanged; both-axis discipline recorded) · `ecp_glow_targets_missing_primitives` (all four focal tokens re-checked against the `:50776` early return — all reach the focal test) · `teach_read_dense_ramp_frames_not_just_frozen` (dense windows re-stated for the new clock) · `derived_readout_asserted_by_value_without_defining_its_metric` (all three rows are engine closed forms). **One recurrence: C4.** Live-table re-consultation attempted and failed (522s), as at cycle 2.

---

## 5 · CANDIDATE SCAR ROWS

One new class. The contract-level recurrence (C4) is the **same root cause** as the cycle-2 candidate `walk_labels_a_field_inert_from_its_declaration_comment_while_the_reader_implements_it`, so it is filed as a widening of that existing candidate rather than a duplicate `bug_class` — checked against `founder_proxy_A.md` §6, `founder_proxy_A_cycle2.md` §6 and `_engine/findings_c.md`.

```sql
-- NEW class
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause,
  prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type) VALUES
('screen_legibility_solve_derived_in_the_wrong_rotation_convention',
 'An azimuth/camera legibility solve is derived analytically and lands on the WORST screen projection',
 'MAJOR','alex:architect',
 'angular_momentum REV 4 solved theta0_rad so the rod would sit across the view at the S3 stop, requiring (theta_stop - theta_cam) = pi/2 (mod pi). But three.js rotation.y maps a local +X rod to (cos t, 0, -sin t) while the camera spherical places the camera at (sin phi cos t, cos phi, sin phi sin t) - the two azimuths are measured in OPPOSITE senses, so the correct condition is theta_stop = pi/2 - theta_cam (mod pi). The authored theta0_rad = 0.168 put theta_stop at 3pi/4, the exact global MINIMUM of screen travel: each mass projected 0.0748 NDC (about 40 px at 1080h) purely vertically instead of 0.1383 NDC (75 px) purely horizontally, on the only mover of the concept PRIMARY aha. The reviewer cycle-2 report contained the same convention error and the architect derived from it, so the mistake propagated through a review rather than being caught by one.',
 'A screen-legibility claim is a MEASUREMENT, never a derivation from remembered conventions. Project the actual world points through a camera built from the scenario authored spherical pose and compare against a full 2 pi sweep of the free angle. This binds the reviewer as much as the author: a review finding that names a geometric direction must itself be projected before it is written.',
 'js_eval',
 'Build a THREE.PerspectiveCamera from the scenario authored {radius, theta, phi} and lookAt(0,0,0). Project the moving element start and end world positions to NDC at the authored angle and measure the travel. Sweep the free angle over 2 pi in 0.1 degree steps; assert the authored value travel is within 10 percent of the sweep maximum and is not within 20 percent of the sweep minimum.',
 'OPEN', ARRAY['angular_momentum']::text[], ARRAY[]::text[],
 'rotmech desk C Checkpoint A cycle 2 FINAL 2026-08-04', 'incident');
```

**Widen the existing cycle-2 candidate** `walk_labels_a_field_inert_from_its_declaration_comment_while_the_reader_implements_it` (upsert on `bug_class`) — append to `root_cause`: *"The stale claim also reached the SHARED chapter artifact: docs/loop_runs/rotmech/APPARATUS_CONTRACT.md:70 lists theta0_rad under 'Declared but inert', so all four rotmech desks are told a live lever does not exist; correcting only the per-concept walk leaves the propagation source intact."* — and to `prevention_rule`: *"When a walk row is corrected against the readers, correct every SHARED contract carrying the same claim in the same pass, and re-run the both-directions check over the contract's whole declared-inert list."* `concepts_affected` widens to `ARRAY['angular_momentum','conservation_of_angular_momentum','rigid_body_rotation','rotational_kinematics']::text[]`.

---

## 6 · ENGINE QUEUE

**Nothing blocks this concept.** No new engine finding this cycle. Carried forward, unchanged and correctly reflected in the design: **F-C1** (sandbox live `tau_brake` is an invisible cause — routed around), **F-C2/F-C2ext** (L-arrow floor draws a stub at L = 0 — arrow hidden in S3), **F-C3** (readouts blank during drag — stated honestly in S5), **F-C4** (P1, per-state camera — this concept authorable today on the existing pose, with the risk recorded), **F-C5** (`applyRigidBodyRotationGlow` has no `glowTargets` fallback, `:50772` vs force_rig `:49002` — **ride-along**, `peter_parker:field3d_surgeon`; REV 4 correctly designs on `phases[]` as the only emphasis channel because of it). All live in `docs/loop_runs/rotmech/_engine/findings_c.md` for Desk E.

---

## 7 · KEY LOCATIONS (no frames exist at Checkpoint A — the five places to look)

1. `C:\Tutor\physics-mind-rotmech-c\docs\loop_runs\rotmech\angular_momentum\skeleton_rev4.md` §3 camera plan, "The S3 azimuth solve (B3)" bullet — the one line C1 replaces.
2. `C:\Tutor\physics-mind-rotmech-c\src\lib\renderers\field_3d_renderer.ts:4104–4111` beside `:50475–50477` — the camera's spherical convention next to the rbr pose; the sign that C1 turns on, in two screens.
3. `…\field_3d_renderer.ts:50676` + the `spin.rotation.y = theta` line — the mass on local +X inside the rotated group; the other half of the convention.
4. `…\src\lib\validators\visual\deriveStateMeta.ts:3198–3208` — the `phases[]` pin-candidate class REV 3 omitted; confirms every new S1/S2 phase sits below its governing candidate.
5. `C:\Tutor\physics-mind-rotmech-c\docs\loop_runs\rotmech\APPARATUS_CONTRACT.md:70` — the shared contract still calling `theta0_rad` inert (C4).

---

## 8 · RUBRIC (advisory, unratified — `docs/EXEMPLAR_RUBRIC.md`; did not affect the verdict)

Checkpoint A scores the five answerable from a skeleton. §3's thresholds are unratified and are neither quoted nor applied. The verdict is `DESIGN_OK` on the evidence in §1 and would be identical with this section deleted.

```
D1 1 · D2 1 · D8 2 · D9 2 · D10 1   = 7/10   (A-subset: D1, D2, D8, D9, D10)
Unchanged from cycle 2 — REV 4 touched no state count, no arc order, no title,
no misconception placement and no explore content, so no dimension moved.

weakest: D1 information gain — no state is derivable from its predecessor, but S2
         stays thin: its payload L = 1.53 at ω = 0.50 is arithmetic on S1's own
         printed numbers (I = 3.06, ω = 1.50, L = 4.59). It earns its place on the
         wrong-belief setup Block 2 describes, not on new information.

         D10 explore earns its place — honest and correctly narrowed, but all three
         readouts still render "—" for the whole drag (rbrBlanked :49899, re-armed
         per input :50074) and `m` moves nothing on the drawn machine
         (RBR_MASS_R constant, :49798). F-C3 would move this to 2.

         (D2 ties at 1: the arc order IS the equation being built, but the aha lands
         at S3 of 5 — the 60% mark — where the measured exemplars land theirs at
         33–50%. D8 = 2: two pivots, both where the belief genuinely bites.
         D9 = 2: all five titles state a result in plain English, meaning first.)

not scored at A: D7 motion completeness — the dimension B1 was fixing. The 6.0 s
         dead zone is gone and S2's decay now spans the state's second half; I raise
         no D7-derived finding, and C1/C3 stand on their own projected evidence.
```

---

## 9 · HANDOFF — next pipeline stage and what travels

**Next stage: `alex:physics_author`** (narration + per-state variable overrides + `phases[]` bindings against REV 4), then **`alex:json_author`** (pure JSON — the `rigid_body_rotation` scenario is built and merged; **no engine dispatch is needed or authorized**). Checkpoint B follows after quality_auditor PASS + eye_walker + the founder_drive dump.

**Conditions that MUST travel:**

1. **C1 is binding.** `theta0_rad = 1.739` for S3, and the re-solve formula becomes `((π/2 − θ_cam) − ω₀·(t_engage + t_decay/2)) mod π` with `θ_cam = π/4`. Every re-solve is **verified by projection**, not by derivation. Also correct the FIX-CYCLE-2 B3 row's "α = 90°" claim and the S3 pin-table parenthetical. **If C1 does not land, Checkpoint B fails this concept on it** — the probe in §5 is the gate, and the dense EYE window 9.0–16.2 s is where it shows.
2. **C2/C3 are advisory to physics_author** when it recomputes the clock from real word counts: motion-anchored phases move with their motion, not with the words; prefer a 2.0–2.5 s pad travel ending at engage over the 6.8 s glide.
3. **Everything REV 4 declares binding stays binding:** the plan-binds rule (each sentence at or under its planned words), the no-static-hole rule (movers re-spread on every clock re-derivation, no fully static canvas > ~2 s), the A12 constraint (no narration clause or glow may stage an L-vs-I comparison during the S2 decay, where L crosses 3.06 at ≈15.0 s), and the §4 attribution rule (S3's change is attributed to the RESTART, never to the slide).
4. **Checkpoint C carries:** C4 (the contract's stale `theta0_rad` line — chapter-wide, three sibling desks), C5 (the SCAR AUDIT query-block staleness), C6 (`#9-S4` vs `#10-S6`), the bug-queue row-under-audit ops item (#33) from cycle 2, and the Rule-38g tag-verification pattern. F-C1–F-C5 remain Desk E's, none blocking.

**One thing I want on the record for the founder's packet, in my own words:** the only defect that survived this fix cycle originated in my cycle-2 report, not in the architect's work. The architect did original geometry off a direction I asserted without projecting it, and got the same sign I did. The corrected rule I am adopting — *a review finding that names a geometric direction must itself be measured before it is written* — binds this role, and it is in the scar row above under exactly that wording.
