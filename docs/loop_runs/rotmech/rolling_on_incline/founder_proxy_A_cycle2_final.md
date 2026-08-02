# CHECKPOINT A — `rolling_on_incline` (rotmech 0b, **REV 5**) — FINAL VERIFICATION

## VERDICT: `ESCALATE` (fix-cycle budget exceeded — 2 of 2 `DESIGN_FIX` rounds used)

**founder-proxy, 2026-08-02**

REV 5 is an honest, high-quality revision and **almost all of it verifies.** Every claimed carry-forward was diffed against the REV 4 text rather than trusted as "unchanged"; every number in the timing table was re-derived independently; the eleven-id scar sweep was re-run live (29 distinct OPEN rows — the same set REV 5 dispositions); every renderer citation the amendments turn on was re-read; and the two sibling documents were diffed field by field. The REV 4 fix set is carried intact, A-1…A-13 all landed, S3's and S6's re-choreographed timings are correct to the digit, and the E-numbering is consistent across both skeletons.

**One thing is not there, and it is the exact thing this dispatch asked me to hunt: a second timed action, smuggled in under the narrow buy.** S6 authors a timed per-arrow reveal chain (450 / 900 / 1350 ms) and a timed multi-line formula build (1350–2500 ms). `newtons_laws_body` has neither surface — `arrows[]` is a static per-state array bound once at apply, and the formula surface is a static string (`eng.formula_base = stateDef.formula_overlay`) whose only dynamic writer is the checkpoint stamper that U5 explicitly bypasses. The union U1–U13 does not contain the capability, and **U10's own scope guard forbids the only declared mechanism class that could carry it** (*"no `phases[].action` revival … a second timed field = the alarm rule"*). The document's own rule says STOP and re-scope. That decision — extend the buy to a timed overlay-reveal channel, or re-author the two derivation states to need none — belongs to Ruling 3(v)'s owner, not to this gate, and there is no cycle 3 in which the architect could take it. Everything else is carry-forward.

---

## What the founder must decide (one question, two options, both costed)

> **Does 0c-2 buy a timed OVERLAY reveal (per-arrow show + formula-line build), or do the derivation states author static overlays and let `phases[].glow_focal` do the walking?**

**Option A — extend the buy (one new item, E18).** A per-element reveal instant for nlb overlays (`arrows[].show_at_ms` per kind; `formula_overlay` as an ordered line list with per-line `at_ms`), under the same discipline as `activate_at_ms` (pure function of state-local t, absent ⇒ today's behaviour, pin/rewind byte-stable). Cost: one more engine item, and the fence around "no choreography DSL" moves from *one* timed field to *two classes* of timed field — precisely what Ruling 3(v) was written to prevent by default. Consumers: **#12 S6; #11 S1, S2, S4, S6** — five states across the pair.

**Option B — no buy; re-author.** S6 shows all three force arrows from state entry and walks emphasis with `phases[].glow_focal` (which exists, `nlbRunPhases` `:45296–45310`); the formula surface carries one static string. Cost: the `reveal-build` archetype and `derivation_first_principles` teaching_method on S6 become a glow-walk over a pre-printed result — the final line `a = g sin θ/(1+k)` is on canvas from t = 0, before the derivation that produces it (a do-not-prespoil break on the concept's one derivation state). The same re-authoring falls on #11's S1/S2/S4/S6. **Zero engine work, one authoring pass on both skeletons.**

Either way the founder's signature is needed before the 0c-2 dispatch, because the union is the surgeon's contract and today it is silent on the point.

---

## Machine evidence for the blocking finding

| Claim | Evidence |
|---|---|
| nlb force arrows are static per state | `field_3d_renderer.ts:44697–44712` — `eng.arrows` is built ONCE per state apply from `nlb.arrows[]`, mapping `show[]` into a boolean `showMap`. Drawn each frame by `nlbDriveArrowsForBody` (`:40815+`) from that static map: `if (show.weight) nlbUpdateArrow(...) else nlbHideArrowKind(...)`. **No time argument anywhere in the path.** |
| The nlb formula surface is a static string | `:44801` `eng.formula_base = stateDef.formula_overlay \|\| ""`; the ONLY dynamic append is `nlbRenderStamps` (`:44374–44389`), which concatenates *checkpoint* stamps — the mechanism U5 explicitly bypasses. No line-by-line build exists. |
| No timed reveal channel exists for nlb overlays | `validators/visual/deriveStateMeta.ts:2739–2994` enumerates every nlb reveal candidate the gate knows: `phases[]` (`:2747–2760`), `param_ramp` (`:2770`), `push_off` (`:2832`), `energy_layer.sum_merge` (`:2910–2917`), `loop_reset_ms` (`:2937`). Nothing for arrows or formula lines. |
| The half-declared mechanism is dead and fenced | `:1583` `phases?: Array<{id; at_ms?; until_ms?; action?; glow_focal?}>` — `action` is written (`:45304`) and never read (sibling P1-A, re-confirmed). REV 5 U10: *"no `phases[].action` revival, no per-body show/hide timeline, no general choreography DSL."* |
| Rule 40a check — never built elsewhere | `git log --all -S "activate_at_ms"` → two **docs-only** commits; `-S "arrow_reveal"` → none; `-S "formula_lines"` → none. |
| What REV 5 authors against it | §3 S6: *"arrows draw in sequence — mg sin θ (450 ms), N (900), f_s (1350) … the surface builds f·R = I_cm·α → f = k·m·a → a = g sin θ/(1+k) (1350–2500 ms)"*; the timing table asserts the pin photographs *"full formula + arrows"*. |

**Pass-1 ratchet reading:** this is a **recurrence** of the sibling review's own P1-A class — candidate row `skeleton_authors_a_multi_phase_state_on_an_engine_with_no_per_body_activation_time`, whose prevention rule reads *"…read the renderer's body-visibility path and its in-state timeline block and confirm a per-body activation/hold surface EXISTS."* REV 5 applied that rule to **bodies** and not to **overlays**, in the same document, in the state next door. Automatic P1 under Pass 1. *(Mitigation on the record: that row is a candidate — both concepts return **0 rows** in the live queue, confirming the sibling review's five candidates and three upserts are still unfiled, so the ratchet could not fire mechanically. The architect did have the review text, and REV 5 dispositions that very row as "the defect this REV exists to fix".)*

---

## Verified and holding — do not churn any of this in whatever revision follows

**REV 4's original fix set — every row diffed against the REV 4 text, all carried, none silently dropped.**

| Cycle-2 finding | Carried? | How it was checked |
|---|---|---|
| P1-A(1) finish semantics | ✓ verbatim | §3 finish-semantics ¶ identical to REV 4 minus one redundant clause |
| P1-A(2) `checkpoints.capture` four-part diff | ✓ verbatim | U5 carries all four line-numbered reasons |
| P1-A(3) synchronised restart | ✓ + widened (ω re-seed) | U6; §3 S8 |
| P1-A(4) loop_reset re-derivation | ✓ all eight rows re-derived | arithmetic below |
| P1-B / Ruling 2 arrow map | ✓ force channel **verbatim unchanged** as A-6 claims | every value re-computed: 1.243 / 2.665 / 0.414 / 0.400 / 0.414 / 0.588 / hides; N : f_s = 6.4335, mg sinθ : f_s = 3.000; 20°–40° range re-checked (20°: N 2.763 ≤ 2.80, f_s 0.335 > 0.25; 40°: N 2.252, f_s 0.630) |
| P1-C glow ruling | ✓ | S4/S5 still author NO state-level focal; S3's windows re-aligned to the activation boundary; E6 still blocking |
| P1-D S2/S3/S6 timing | ✓ | all three tabled with sub-beats |
| P1-E back-compat | ✓ + extended to the new fields | (b)-19 |
| P2-1 eleven-id sweep | ✓ re-run live, and independently re-run here | 29 distinct OPEN rows, same set |
| P2-2 radius clause · P2-3 t = 0 worst case · P2-4 frame-fit bound · P3-1 no invisible wall · P3-2 S1 title | ✓ | §4 row 2; §3 framing ¶; §3; §2 |
| #11 A1–A4 | ✓ (A1 restated as branch PRIORITY; A4 widened twice) | U1, U2, F8, S8 |

**A-1…A-13, checked individually.**
- **A-1 (activation semantics)** — the two derived rules genuinely ride the SAME authored instant. Single-lane retirement fires at *the next body's* `activate_at_ms` (S3: block has none → active from entry; disc = 1500 → block retires at 1500). `visible_before_activation` is a boolean, not a time. **No second timed field is smuggled in here** — the smuggling is in S6's overlays, not in U10.
- **A-2 (S3)** — re-derived from scratch: a = 9.8(sin 25° − 0.15 cos 25°) = **2.80938 m/s²**; block at 1500 ms = 2.4 − ½(2.80938)(1.5²) = **−0.7606** ✓; bound −3.0 needs 5.4 m ⇒ t = √(10.8/2.80938) = **1961 ms > 1500 ms retirement** ✓ — the block genuinely never reaches the clamp. Disc a = 4.14166/1.5 = **2.76111**; at the 1920 pin (t = 420 ms) s = **+2.1565** ✓; at loop end 3200 (t = 1700 ms) s = **−1.5898**, 1.41 m clear ✓; the disc's own bound crossing would be 3478 ms > 3200 ✓. Pin margin 420 ms ≥ 167 ✓.
- **A-3 (S6)** — release 2500, pin 2760 ⇒ t = 260 ms ⇒ s = 2.4 − ½(2.76111)(0.26²) = **+2.3067** ✓, live a = **2.761** ✓; finish 4.5 m ⇒ t = √(9/2.76111) = **1805 ms** ⇒ halt at **4305 ms** ✓; loop 4600 ⇒ 295 ms held finish ✓; 0.60 × 4600 = **2760** exactly ✓.
- **A-4** `lane_gap_m = 0` on S3 with #11 a declared consumer ✓. **A-5** three-phase shape deleted; E8's note reads "up to TWO sequential activation bodies" ✓. **A-6** force channel verbatim; velocity channel names/defaults identical to #11's ✓. **A-7** marks out of U4 and into U11/E12 ✓. **A-8** ω re-seed in both U6 and U12 ✓. **A-9** registration set enumerated; E14 on the correct owner tag ✓. **A-10** branch priority quoted against code — `f = -vSign * b.mu_k * N` re-read at **`:45498`** ✓. **A-11** close-camera table with run-midpoint targets ✓. **A-12** sweep re-run (see P2-5 for a wording correction). **A-13** E-numbering **verified consistent across both documents** — #11 maps E9–E14 + E1; #12 re-tags its own U1/U2/U4 as E15/E16/E17 and mints nothing in 9–14. No collision.

**Every other timing row re-derived and unchanged:** S1 crossings 1744 / 1805 / 1903 / 2085 ms (a = 2.95833 / 2.76111 / 2.485 / 2.07083, run 4.5 m) ✓, pin 2400, margin 315 ✓; S2 halt 1204 ms, cusp at half a revolution = 754 ms, v = Rω = 3.323 ✓; S4 1745 ✓; S5 sphere 1265 / ring 1512 ✓ (d = 2.366 m ⇒ h = 1.00000 m, mgh = 9.8 J, 7.0/2.8 vs 4.9/4.9) ✓; S7 slip onset 1193, halt 1968 ✓. All pin margins ≥ 260 ms.

**Rules 35 / 38 / 41 re-checked in full:** 38a ring order + contiguous advanced block + both cuts re-run independently ✓; 38b explore surfaces core only ✓; 38c algebra-only outside advanced ✓; 38d dialect ✓; 38f anchors ✓; 38g tags carry `needs_teacher_verification` ✓; 38e N/A ✓. Rule 41: all eight titles and delta cues literal ✓. Rule 35: nothing country-specific ✓.

---

## Carry-forward for whichever revision the founder authorises

**P2-1 · The signed union drops two REV-3 items its own state table still consumes. [alex:architect]** Ruling 1 asked for an enumeration that is *complete and honest*, and U1–U13 is presented as that list. Missing: **(b)-7 `rotation_locked`** (S3's locked body; #11's S3 wheel needs it — and #11's consumption table cites `(b)-7`, which now has **no U-row**) and **(b)-15 centre markers** (§3 S4's CoM tie metric, S8's core-ring list). REV 5 never reproduces (b)-1…(b)-15, so a surgeon reading REV 5 alone cannot reach them.

**P2-2 · The two documents state different semantics for the same bought field. [alex:architect]**

| Point | #12 REV 5 | #11 REV 2 |
|---|---|---|
| the buy | `activate_at_ms` **+ `visible_before_activation` + single-lane retirement** (U10) | *"this single field is the entire buy"* ((c)-5) — no boolean, no retirement rule |
| how phase A ends | retires **at the next body's activation** (1500), derived, no second field | **"DISSOLVES at 1400"** — a *separate* instant, 100 ms before phase B's 1500 |

Trivially reconcilable (delete #11's 1400 dissolve — its phase-A body is already at rest from 1020 ms, so retirement at 1500 costs nothing), but as written the surgeon receives two specs for one field.

**P2-3 · S7's friction arrow is outside the arrow-map table and clamps. [alex:architect / alex:physics_author]** Post-slip f_k = 0.05 × 8.88182 = **0.4441 N** ⇒ 0.30 × 0.4441 = **0.1332 wu < the authored 0.25 floor** ⇒ renders clamped at 0.25, **1.88× overstated**, in the advanced state whose payoff *is* the friction flip (pre-slip f_s for a ring = 2.0708 N ⇒ 0.621 wu, so the drop reads 2.5× instead of 4.7×). The "no clamp anywhere" claim is scoped to a table with no S7 row — not false, but uncovered. Either table S7 or declare the clamp honest-by-scope as S3's near-equal pair is.

**P2-4 · Two engine-queue numbers for one field.** U8 routes `lane_gap_m` under **E7b** (authorable gap) and **E10** (gap = 0 / single-lane) — one config field, one code site (`nlbBodyLaneZ` `:39992–40001`), two dispatch numbers. Merge before dispatch or the surgeon runs it twice.

**P2-5 · (b)-19's acceptance mis-quotes the row it cites. [alex:architect]** `eye_h2_frozen_frames…`'s DO (read live) is: *"State the no-regression criterion as 'H2 PASSES its tolerance AND any non-zero percentage reproduces on the PRE-change renderer **or has max channel delta ≤ 3**' … settle it with a pre/post pixel diff (bounding box + max channel delta)."* There is **no "recorded wobble band"** in the row. The direction of A-12 is right; the acceptance should quote *max channel delta ≤ 3* and *reproduces on the pre-change renderer*.

**P3-1 · Retirement is gated on a rendering value.** Tying a lifecycle rule to `lane_gap_m === 0` means a future state authoring gap 0 for a legitimately co-visible pair inherits retirement. Gate it on an explicit `single_lane: true`, or on "the successor declares `activate_at_ms`".

**P3-2 · E9's expectation should name the whole body.** U10 says the disc "sits unrendered"; the surgeon must also hide its **arrows, labels, trail and readout rows** before activation (arrows live on a separate object path, `nlbDriveArrowsForBody`). One clause.

**P3-3 · The `readouts` closed enum (`:1336`) is never diffed in #12.** U4 buys `KE_trans`/`KE_rot`/contact/`Rω` as readouts, but the enum (`'N'|'f'|'a'|'v'|'T'|'F_net'|'F_applied'|'T1'|'T2'|'P'|'P_avg'`) is quoted only in #11. Same class as the `closed_enum_cannot_name_a_substance_the_design_teaches` directive, now raised twice on this pair; #11 got it right, #12 didn't restate it.

---

## Per-state table (design-level — no frames exist at Checkpoint A)

| state | correct | order_ok | labels_present | reads_sound_off | clearly_different | how_i_would_use | problem_or_missing | pri |
|---|---|---|---|---|---|---|---|---|
| S1 | Y | Y | Y (chips, k, m) | Y | Y (four bodies separate, lineup) | "Same ramp, same start — the order never changes." | none new; occlusion gate (E2) still the acceptance | — |
| S2 | Y | Y | Y (v, Rω, contact) | Y | Weak vs #11's own S2 (D1) | "One wheel: the bottom point stops dead each time it touches." | thin by design (recap); nothing new at REV 5 | P3 |
| S3 | Y | Y | Y (f_k, f_s, contact) | Y | Y (skid → roll, hard cut) | "The skid mark is the difference — the roller leaves none." | retirement semantics vs #11's 1400 dissolve (P2-2) | P2 |
| S4 | Y | Y | Y (m, R, k chips, TIE) | Y | Y (declared contrast pair with S1) | "Heaviest and biggest against lightest and smallest — dead tie." | E6 still the blocking precondition | — |
| S5 | Y | Y | Y (KE pairs latched) | Y | Y (freeze-and-read) | "Same total, different split — the ring spends more on spinning." | `readouts` enum never diffed (P3-3) | P3 |
| S6 | Y (physics) | Y | Y (three arrows, formula) | Y | Y (held → released) | "Build it once: three forces, one line, one answer." | **the arrow sequence and the formula build have no engine surface, and U10 forbids the class** | **P1** |
| S7 | Y | Y | Y (μ_min tick, f label) | Y | Y (regime switch) | "Drop the friction and rolling gives up — watch the contact leave zero." | friction arrow clamps, untabled (P2-3) | P2 |
| S8 | Y | Y | Y (core-ring only) | Y | Y (sandbox) | "Pit a marble against a huge ring — every lap starts level." | now genuinely achievable (U6 + ω re-seed) | — |

---

## `engine_queue` — status at escalation

E1–E17 stand exactly as REV 5 tags them (E1 → **`peter_parker:renderer_primitives` → pcpl-surgeon**; E2/E3/E4/E6/E7/E9/E10/E11/E12/E15/E16/E17 blocking under `peter_parker:field3d_surgeon`; E8/E13 ride-along; E14 → pcpl-surgeon). **Merge E7b into E10 (P2-4) before any dispatch.**

**E18 — timed overlay reveal for nlb (per-arrow `show_at_ms`; ordered formula lines with per-line `at_ms`)** · owner `peter_parker:field3d_surgeon` · **blocking, PENDING FOUNDER SIGNATURE — not routed.** Evidence the agent would need: `:44697–44712` (static `eng.arrows` build), `:40815+` (`nlbDriveArrowsForBody`, no time input), `:44801` (`formula_base` static), `:44374–44389` (stamps are the only dynamic writer), `deriveStateMeta.ts:2739–2994` (no reveal candidate exists — a new field must be registered there or THE EYE mis-pins), `:1583` (`phases[].action` declared, dead). Expectation: in #12 S6 at t = 400 ms exactly zero force arrows are visible; at 1400 ms exactly three; the formula surface holds line 1 only at 1400 ms and all three lines at 2500 ms. Consumers if bought: #12 S6; #11 S1/S2/S4/S6.

---

## Candidate scar rows (report-only — the dispatching session files these)

```sql
-- 1
('skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static',
 'A derivation state schedules arrows and formula lines at authored millisecond marks, but the scenario binds both overlays once per state apply with no time input',
 'MAJOR','alex:architect',
 'newtons_laws_body builds eng.arrows once per state apply from a static show[] map and sets the formula surface from a single authored string; the only dynamic writer is the checkpoint stamper. A state authoring "arrows draw at 450/900/1350 ms" and "the surface builds over 1350-2500 ms" therefore renders every arrow and the complete formula from t = 0, prespoiling the result the state exists to derive, and the frozen pin photographs a picture the DoD never described.',
 'The per-body activation check is only half the rule: run the SAME reader check on every OVERLAY a state schedules - arrows, formula lines, labels, brackets, markers. Open the scenario''s overlay binding site and its reveal-candidate list in deriveStateMeta; if no time input reaches the overlay, either name a timed reveal surface as a build item with its config shape, or author the overlay static and drive the beat with the emphasis channel that does exist.',
 'js_eval',
 'For each state whose skeleton schedules an overlay at an authored ms mark: drive the state to 100 ms before that mark and assert the overlay is absent, then to 200 ms after and assert it is present at full opacity.',
 'OPEN', ARRAY['rolling_on_incline','pure_rolling']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech 2026-08-02', 'directive'),

-- 2
('signed_engine_union_drops_items_its_own_state_table_still_consumes',
 'A rewritten union table becomes the surgeon''s contract while silently losing items an earlier revision listed and the state table still names',
 'MAJOR','alex:architect',
 'The build sheet was re-tabled from a numbered (b) list into a U-numbered union without reproducing the old list. Two items consumed by authored states - a per-body rotation-lock flag and the centre markers a tie state measures with - survive only in the state prose and in the sibling document''s consumption table, where they now reference a row number that no longer exists.',
 'When a union table is renumbered or rewritten, walk the OLD list item by item into the new one and show the mapping, then walk every state''s named primitives back into a union row. An item named in a state table with no union row is a build item the surgeon will not build.',
 'js_eval',
 'For each skeleton whose build sheet is renumbered: assert every primitive named in the state choreography table maps to at least one union row id, and every union row id is claimed by at least one state.',
 'OPEN', ARRAY['rolling_on_incline']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech 2026-08-02', 'directive'),

-- 3
('two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field',
 'Sibling spec drivers for a single engine build describe the same new config field with different companions and different phase-boundary rules',
 'MAJOR','alex:architect',
 'One document defines the bought activation field as activation plus a visible-before-activation flag plus retirement derived from the successor''s instant; the sibling defines it as "this single field is the entire buy" and authors its phase A to dissolve at an instant of its own, 100 ms before the successor activates. The surgeon receives two contracts for one field and will implement whichever document is read first.',
 'When two concepts drive ONE engine build, the bought field''s semantics live in ONE paragraph and the second document quotes it verbatim rather than restating it. Before either goes to verification, diff the two documents field by field - name, default, companions, boundary rules - and reconcile every difference in writing.',
 'manual',
 'Diff the union/field tables of every skeleton naming the same engine build; list each field name and assert the semantics paragraphs are textually identical or one cites the other.',
 'OPEN', ARRAY['rolling_on_incline','pure_rolling']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech 2026-08-02', 'directive')
```

**UPSERT, do not re-mint:** `skeleton_authors_a_multi_phase_state_on_an_engine_with_no_per_body_activation_time` (sibling candidate, still unfiled) — widen its `prevention_rule` with the overlay clause and add both concept ids. Also still unfiled and needed before the 0c-2 dispatch: the sibling review's five candidates and three upserts, plus this report's three. **The live queue returns 0 rows for both concepts — the ratchet is not yet armed for this pair.**

---

## Key artefacts — the five reads that decide the founder's call

1. `src/lib/renderers/field_3d_renderer.ts:44697–44712` — `eng.arrows` built once per apply from a static `show[]`; the absence the whole escalation turns on.
2. `src/lib/renderers/field_3d_renderer.ts:44801` + `:44374–44389` — the formula surface is one authored string plus checkpoint stamps; there is no line-by-line build.
3. `src/lib/validators/visual/deriveStateMeta.ts:2739–2994` — the complete nlb reveal-candidate list; no arrow or formula entry, so a new field must be registered here too or THE EYE mis-pins.
4. `docs/loop_runs/rotmech/rolling_on_incline/skeleton.md` §3 S6 row + the ACTIVATION SEMANTICS scope guard — the authored beat and the rule that forbids its mechanism, eleven lines apart.
5. `docs/loop_runs/rotmech/pure_rolling/skeleton.md` §3 S3 row + timing table — the 1400 ms dissolve against the sibling's derived-retirement-at-1500, the second half of the one-contract failure.

---

```
RUBRIC (advisory, unratified — docs/EXEMPLAR_RUBRIC.md; did not affect the verdict)
  Checkpoint A subset:  D1 1 · D2 2 · D8 2 · D9 2 · D10 2   = 9/10   (was 8/10 at REV 3)
  weakest: D1 information gain — S2 is still the one state that adds no idea this
           concept owns: a full state recapping #11's core claim, now explicitly on
           #11's own wheel radius so the picture IS #11's picture. Defensible under
           Rule 23 and genuinely consumed by S3's contact-0.00 claim and S5's energy
           route — unchanged since REV 2.
           D10 explore earns its place — raised to 2 this cycle: the synchronised
           restart plus the all-body ω re-seed makes DoD (j)(2)'s marble-vs-ring demo
           actually achievable, which it was not at REV 3. Residual: under the deepest
           cut the sandbox keeps only shape/m/R, so the reduced-preset lesson rests
           entirely on the finish order.
  D2 (2): both ring cuts re-run independently and stay coherent; the ring cut IS the arc.
  D8 (2): exactly two beats, at genuine pivots, both naming their primitives.
  D9 (2): all eight titles state a result in literal English, meaning in the first words.
  This section did not change the verdict; the escalation stands on its own evidence.
```

**Escalation semantics: park-and-continue.** `physics_author` and the 0c-2 `field3d-surgeon` dispatch remain **unauthorised** for BOTH `rolling_on_incline` and `pure_rolling` until the founder answers the single question above — the pair share the dependency, so #11's REV 2 cannot be verified independently of it either. Everything else in REV 5 is verified and ready. founder-proxy routes and reports only — dispatched nothing, applied no SQL, wrote no files.
