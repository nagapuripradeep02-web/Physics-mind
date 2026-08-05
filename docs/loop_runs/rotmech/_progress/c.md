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
