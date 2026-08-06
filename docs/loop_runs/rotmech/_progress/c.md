# Desk C progress

- 2026-08-04 · `rigid_body_rotation` (concept, wave 2 — BLOCKED on 0c-3) · Phase-0b DESIGN PASS
  complete: skeleton REV 1 written to `docs/loop_runs/rotmech/rigid_body_rotation/skeleton.md`
  (7 states; 8 [LIVE] surfaces cited, 8 engine rows C1–C9 for 0c-3; v-readout ruling = per-marker
  labels, no HUD row; body_shape variants ruled NOT required). Engine rows mirrored to
  `_engine/findings_c.md` (PASS 1). Bug queue consulted live (63/83/85/1 rows). Next:
  founder-proxy Checkpoint A on this skeleton; `angular_momentum` wave-1 authoring unaffected.

- 2026-08-04 · **`angular_momentum` (wave 1) — Checkpoint A `DESIGN_OK` + physics block done.**
  Authored from scratch: architect → Checkpoint A (`DESIGN_FIX`, 13 findings) → REV 2 → ruling
  delta REV 3 → Checkpoint A cycle 2 (`DESIGN_FIX`, 5 findings) → REV 4 → **`DESIGN_OK`**.
  5 states (4 guided + explore), core + extended rings only; the advanced ring (L = r × p) is
  deliberately absent — `cross_product_construction` is inert — with the insertion seam named so
  it lands later as an insertion, never a restructure.
  Design spine: S1 defines L = Iω over the home pose · S2 ω-proportionality via an authored brake
  decay onto a predicted `L = 1.53` chip while I hold-glows · **S3 PRIMARY aha** — brake to rest,
  slide the masses in *while still*, restart at the same ω₀, L reads 0.99 beside its own
  "before: 4.59" chip · S4 vector/grip rule (extended) · S5 sandbox.
  The design problem solved: ω is unconditionally L/I, so every r-slide while spinning renders
  #10's conservation aha. Moving r only while braked to rest (L clamped 0 ⇒ ω = 0 for every I)
  renders zero dynamics, and the L = Iω payload arrives from the restart re-seed.
  Physics block written; **C1 carried as BINDING** (`theta0_rad = 1.739`, re-solve verified by
  projection). C3 taken (pad travel 6800 → 2200 ms). Pins unmoved: 22700 / 20400 / 19500 / 13000.
  Narration 51/44/53/49 words, all under plan. Largest static window anywhere: 1.0 s.
  Next: `json-author` (8 registration sites are pre-registered on master; JSON + SQL only).

- 2026-08-04 · **`rigid_body_rotation` (wave 2) — Checkpoint A `DESIGN_OK` + physics block done.**
  REV 1 → Checkpoint A (`DESIGN_FIX`, 5 P1 + 9 P2) → REV 2 → cycle 2 (`DESIGN_FIX`, 3 P1 + 5 P2)
  → REV 3 → **`DESIGN_OK`**. Founder ruling cost it a state: `v = ωr` belongs to #4
  `rotational_kinematics` (master pre-registration corrected in `2443a74`), so this concept keeps
  the arc comparison only — **no formula surface, no v arrow, no velocity ladder, no speed word
  anywhere**. 7 → **6 states**, ladder fully rebuilt rather than renumbered.
  Engine ask for 0c-3: **8 active (C1, C3, C4, C5, C6, C8-BLOCKING, C9, C10) + C7
  defer-recommended + C2 withdrawn to Desk D.** Zero of six states buildable today.
  Physics block written, ~60 `[NEEDS-0c-3]` vs ~20 `[LIVE]`, every LIVE tag grepped against the
  renderer rather than copied. It corrected two skeleton pin cells (S3 15200 not ~5.2 s — the ω
  readout dominates by ~10 s, closing residual P3-iii; S4 8290 not ~4.5 s, since one revolution
  alone is 4.19 s).
  **STOP HERE. Do not start json-author** — blocked until 0c-3 merges, and the re-verification
  list in `founder_proxy_A_cycle2_final.md` §5.1 must be re-run first.

- 2026-08-04 · **Engine findings filed to `_engine/findings_c.md`** (Desk E drains; no DB write
  from this desk, guardrail 9): **F-C1** sandbox live `tau_brake` applies real torque with the pad
  invisible/parked — **confirmed on all four links and it BLOCKS Desk A's approved
  `conservation_of_angular_momentum` S8** · **F-C2 + extension** L-arrow floor draws a stub at
  L = 0 *and* clips above |L| = 9.00 while sandboxes reach 20.7 · **F-C3** re-pin blank fires on
  every `input`, so a drag blanks the HUD throughout · **F-C4 (P1, founder-ruled)** per-state
  camera authoring — one pinned pose cannot serve a chapter where #3 needs near-top-down and #9
  needs oblique · **F-C5** rbr glow pass has no `glowTargets` fallback, so per-sentence narration
  glow is inert family-wide · **C10** non-restarting live ω control (deliberately NOT F-C3) ·
  **PASS 7** the shared `APPARATUS_CONTRACT.md:70` wrongly lists `theta0_rad` as inert — it is
  fully implemented, and three sibling desks read that line · **PASS 8** three corrections to the
  0c-3 ask found at physics-author time (C4 needs a heterogeneous group token; `show_r_line`
  tracks the wrong radius; `idle_auto_sweep` needs an `r_point` key).
  **Office questions raised, unanswered:** does the 0c-2 two-timed-class fence bind 0c-1, and
  does it count cumulatively (if so, #3 re-scopes)?

- 2026-08-04 · **Scar candidates: 12 indexed in `_engine/scar_candidates_c.sql`, NONE applied.**
  Filed as a manifest pointing at the authoritative SQL in each founder-proxy report, so no second
  copy can drift. Two **amendments** that must be UPSERTs, never new classes: the pin-formula
  class (recurred on this desk in the same session, in a table re-derived after the first filing)
  and the declared-inert-label class (widened to the shared contract + three sibling desks).
  Every row files `subject = 'subject_neutral'`. **The live `engine_bug_queue` was unreachable all
  session** — four Cloudflare 522s / schema-cache failures across two independent callers
  (12:52, 13:16, 13:40 UTC + a later founder-proxy attempt). Carried-forward counts are same-day
  and the boundary is declared; **the 0d session must re-run the four queries before json-author
  starts.**

- 2026-08-04 · **Founder rulings taken this session:** (1) `v = ωr` → #4, not #3 (#3 keeps the arc
  comparison; it costs a state and the numeric ladder, and that is correct). (2) The camera is an
  ENGINE gap, not an authoring problem — the reword was rejected; both skeletons design assuming
  per-state camera lands, with every dependent beat marked. (3) Prerequisites: name JSON-less ids
  where the dependency is real. **Note on (3):** the dispatch relayed `torque`/`moment_of_inertia`
  to #3 in error — those precede #3 in the approved order and naming them would invert the graph.
  The architect correctly refused; #3 names `centre_of_mass`, `motion_of_centre_of_mass` and
  `uniform_circular_motion` instead. `angular_momentum` names all four, where they genuinely apply.

- 2026-08-05 · **No authoring — both concepts still blocked on Desk E.** Pushed the master-merge
  commit `6364e77` after verifying it (`tsc` 0 · validator 150 PASS / 0 FAIL, unchanged).
- 2026-08-05 · **§5.1 re-verification list PREPARED** →
  `docs/loop_runs/rotmech/rigid_body_rotation/reverification_5_1.md`. Four of six items settled
  read-only: item 1 (queries re-run, delta = exactly 4 named rows), item 2 (**C8 is dispatched as
  E9, not declined** — the `declined ⇒ re-scope` branch is closed), item 5 (F-C5 confirmed still a
  no-op, deferred as C-3), item 6 (**premise now false** — a precedent rbr JSON exists, which
  turns that item from a cost into an asset). Items 3 and 4 need office rulings; **item 3, the
  two-timed-class fence, is the only one that can still invalidate the sealed design.**
- 2026-08-05 · **Bug queue is reachable again.** `--owner alex:architect` 63 → 67; the other three
  REV 1 queries byte-stable. The +4 are all `unit_circle_to_sine_wave` rows that arrived with the
  mathematics subject. One BINDS hard on #3's ring cut, one BINDS on the S1/S3 equality claims,
  two are N/A-with-reason (one of which generalises into a caution for the C-1 trace design).
  Verdicts are *proposed for the 0d session*, not taken. Manifest still unapplied (DB write).
- 2026-08-05 · **PASS 16 filed** — E7's back-compat surface. Desk C is E7's named verifier, and
  the E7 acceptance floors are confirmed identical across `founder_proxy_B.md` §6 and
  `FROZEN_SCOPE_0c3.md` §B. No engine fix dispatched (guardrail 6); no DB write.

- 2026-08-06 · **E7 landed (`14b2943`) and is VERIFIED on `angular_momentum`.** Desk C is E7's named
  verifier — Desk E's canaries do not exercise rbr, so it was LANDED but not VERIFIED until now.
  Containment confirmed independently of `desk:sync` (which skips the current desk): `14b2943` is an
  ancestor of `origin/master`. Merged master in (46 commits), verify chain green — `tsc` 0 ·
  `check:renderer-syntax` OK · `validate:concepts` 150 PASS / 0 FAIL.
- 2026-08-06 · **F-C8 closed, and F-C2 + F-C7 close with it.** All four acceptance floors met with
  headroom: S1 ink **1247 px** in a 45×68 bbox (was **15 px / 11×6**, floor 400 → 3.1×) · contrast
  **8.79:1** (floor 3) · S4 flip **5518 px** (floor 300 → 18×) · drawn **world** length slope
  **0.200000** exactly with intercept **1.5e-15**, `len/|L|` = 0.20000 at 7/7 pins across L =
  1.53…6.12 and both signs. Separability is by construction on BOTH consumers (L shaft 0.090 ÷ axle
  0.045 = 2.0; pull shaft 0.080 ÷ rod 0.040 = 2.0) — the C-6-merges-into-E7 ruling was honoured.
- 2026-08-06 · **Founder ruling applied — acceptance criterion #2 amended.** The pixel ratio reads
  6.13, not 5.71: perspective foreshortening, not a defect. Accept on world length. `founder_proxy_B.md`
  §6 amended; criteria 1/3/4 stay pixel measurements.
- 2026-08-06 · **Founder ruling applied — the two-timed-class fence is NON-CUMULATIVE, binds 0c-2
  only.** `rigid_body_rotation`'s sealed design is NOT invalidated; the RE-SCOPE branch is dead.
  §5.1 item 3 — the last item that could have forced a re-scope — is CLOSED. Wave 2 stays parked on
  the remaining engine rows; json-author not started.
- 2026-08-06 · **P1-2 / F-C3 recommended DOWNGRADE to ride-along, on measured evidence.** Over a
  10-sample real `input`-event drag: readouts still blank 10/10 (E6 hasn't landed) but the arrow is
  drawn 10/10 at exactly 0.20·|L|, 0.612 → 1.224 world. Its own routing note set that condition.
- 2026-08-06 · **⚠ The `ENGINE_LANDING_NOTICE` §4 md5 remedy is UNSOUND here.** PNG IDAT compression
  is nondeterministic while pixels are not — two identical-build runs gave byte-different,
  pixel-identical frames (0/921600). A dead scene would still emit all-distinct hashes, so the check
  can only return all-clear. Re-ran at pixel level: zero identical adjacent pairs across all 5 states.
  Filed as `findings_c.md` **PASS 17** with a recommendation to amend the scar row's prevention rule.
- 2026-08-06 · **B-11 tested directly:** all five `__frozen` frames pixel-identical across two runs,
  so frozen judgments this cycle are sound. But `[H2]` was **Skipped — no approved baseline**, so
  this concept carries **no A/B regression signal at all**; verdicts rest on the frames plus geometry.
- 2026-08-06 · E5 confirmation: **zero `[PM_RBR_TOKEN]` warnings, zero console errors** — every
  `readouts` token this concept authors is a known row. Unfalsifiable before E5.
- 2026-08-06 · **Checkpoint B fix cycle 1 → `FIX(engine)`, blocking. NOT approved.** New finding
  **P1-A / F-C9**: STATE_4's reversed L vector is swallowed by the drum's projected silhouette.
  **Independently confirmed here by hide-and-diff** (founder-proxy used a hue gate; 589 px vs its
  640 px — within 8 %, two methods): at identical |L| = 4.59, UP reads 1206 px / 45×68 with 681 px of
  non-head ink, DOWN reads **589 px / 40×21 with 73 px** — ratio **48.8 %**, the shaft gone and only
  the cone surviving. Reproducible at t=13000 and t=16000; **pre-flip is healthy (1243 px)**, so it
  is the reversed direction specifically, and the anchor is already sign-mirrored (`:51885`) — the
  cause is silhouette, not anchor. Routed `peter_parker:field3d_surgeon` via Desk E as a NEW
  `bug_class`; **not dispatched from here** (guardrail 6).
- 2026-08-06 · **Lesson owned: acceptance criterion 4 could not have caught it, and I verified
  against it without checking its shape.** "S4 flip changes ≥ 300 px" is a bare delta; my 5518 px
  passed *because* the arrow vanishes. That is a live recurrence of this desk's own PASS-15 rule
  (pair every delta with an absolute floor) — filed here after the F-C7 probe was caught, then
  violated by a criterion written at cycle 0 and satisfied by a measurement taken here at cycle 1.
  **Standing correction for every future vector verification in this chapter: measure ABSOLUTE ink
  at the pose pointing away from the camera, plus a ratio against the favourable pose. Never accept
  a bare change-count.** Filed as `findings_c.md` PASS 18; §6 criterion 4 marked superseded.
- 2026-08-06 · E7 itself stands: F-C8/F-C2/F-C7 remain closed, the up-pointing vector is 1206–1243 px
  in all four states that author it. **F-C9 is a second, distinct defect on the same primitive, not a
  regression of E7.** P1-2/F-C3 downgrade to ride-along accepted by founder-proxy. Three authoring
  findings (P2-1, P2-2, P3) remain open and ride the next cycle, plus a new P2-A (the vector is as
  wide as it is long at small |L|). Two fix cycles remain before ESCALATE.

- 2026-08-06 (later) · **Synced to master (46 behind, not the 26 in the brief — master moved again).**
  `desk:sync` does NOT touch the current checkout, so merged by hand; triad green after:
  `check:renderer-syntax` OK · `tsc` 0 · `validate:concepts` 150 PASS / 0 FAIL. **E11 landed (Desk B's);
  F-C9 and E6 have NOT** — checked by `git log -S` on the renderer, not assumed.
- 2026-08-06 · **All three ride-along authoring findings LANDED.** P2-1 — STATE_4 `phases[]`
  (p1@0 l_arrow · p2@4200 grip_hand · p3@11800 l_arrow · p4@15500 mass), timed around the flip at
  11000 + 500 ms blank; tokens confirmed against `RBR_ELEMENT_TYPES` before authoring. P2-2 — the CBSE
  cell now `verified: false` / `needs_teacher_verification: true`. P3 — the `s2_4` idiom "falls in step
  with" → "in proportion to", plus the same idiom in `am_s2_detail` and the personification in
  `am_s2_anchor` ("the turntable used" → "L = I omega from the previous state"). tsc 0, validator PASS,
  EYE **23/23**, Motion map 5/5.
- 2026-08-06 · **P2-1 verified from SCENE STATE, not pixels** — each token vs its OWN baseline:
  grip_hand 1.00 → 1.43/1.48 across p2 then back to 1.00; mass 0.24 → 0.94/0.64 across p4. Two
  near-misses recorded: the hand is a Group with no material (the glow pass traverses it), and
  comparing emissive ACROSS element types is meaningless (l_arrow's baseline 0.84 beats mass's
  boosted 0.94).
- 2026-08-06 · **⚠ STATE_4's frozen pin MOVED 13000 → 16000** as a direct consequence of P2-1
  (`deriveStateMeta` takes `phases[].at_ms + 500`). Still inside the flipped run, so the reversed
  vector is still in frame, but the focal is now `rbr_mass` rather than `rbr_l_arrow` — the frame
  founder-proxy called the most important one for FIX(engine) sign-off. Unavoidable: any phase after
  ~12500 moves the pin, and s4_3/s4_4 must follow the flip. **Cycle-2 taste call, flagged not fixed.**
- 2026-08-06 · **N2 narration audit: CLEAN.** All 74 reader-facing strings swept; no arrow world-unit
  length (0.918/0.792/0.612/0.342/0.306/0.198/1.224) appears anywhere; every asserted value matches the
  RENDERED readout at its own instant. Two probe gaps recorded that would each have produced a false
  pass: **a digit regex finds nothing in narration** (Rule 30 spells numbers out — three of five value
  assertions live there), and `caption`/`label` sit at the f3d STATE level so a first extractor silently
  missed 10 on-canvas strings. `findings_c.md` PASS 19.
- 2026-08-06 · **P1-A/F-C9 re-measured at the new pin — STILL OPEN**: 595 px, 40×21, non-head 53 vs 677
  for the up vector, ratio 48.9 %. Robust across pins (589 @13000, 610 @16000, 595 @16000 post-edit), so
  Desk E can verify at either instant. Dead-scene re-check redone at PIXEL level per the standing
  correction — zero identical adjacent pairs across all 5 states.
