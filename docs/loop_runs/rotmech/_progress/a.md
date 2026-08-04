# Desk A progress — `feat/rotmech-a`

Per `_progress/README.md`: this desk writes here, never to the shared `PROGRESS.md`.

---

## 2026-08-04 · Wave 1 — `conservation_of_angular_momentum` authored

**Entered at `json-author`**, not `architect` — Phase 0b was already complete and approved
(`skeleton.md` REV 4 + `physics_block.md`, founder-proxy Checkpoint A `DESIGN_OK`). This concept
is the 0c-1 spec driver, so the `rigid_body_rotation` (rbr) engine was built from this very
skeleton and every capability it needs exists.

### Delivered

- `src/data/concepts/conservation_of_angular_momentum.json` — 8 states (S1–S7 `manual_click`,
  S8 `interaction_complete`), full `physics_engine_config`, assessment (7 questions) +
  `coverage_map`, `curriculum_tags`, `entry_state_map`, `misconception_watch` on S2/S4/S6,
  `has_prebuilt_deep_dive` + drill-downs on S2/S4, and the per-state `rigid_body_rotation` block.
- `supabase_migrations/supabase_2026-08-04_seed_conservation_of_angular_momentum_clusters_migration.sql`
  — 6 `confusion_cluster_registry` rows, 30 trigger phrases verbatim from physics_block §5.
  **Authored, not applied.**
- `src/scripts/_seed_conservation_of_angular_momentum_cache.ts` — scoped delete-then-insert on
  this desk's own `concept_key`, mirroring `_seed_capacitance_cache.ts`.
- `docs/loop_runs/rotmech/_engine/findings_a.md` — 14 engine findings for Desk E (below).

### Registration — verified, nothing edited

All 8 Ch.7 ids were pre-registered on master in `4b289d4`, so the three shared registration files
stayed **read-only** on this desk per guardrail 4. Confirmed present:
`panelConfig.ts:1859` · `aiSimulationGenerator.ts:3045` (`"field_3d"`) ·
`intentClassifier.ts:304` + the `CLASSIFIER_PROMPT` hint and disambiguation line.
Site 7 (`PCPL_CONCEPTS`) is N/A — this is field_3d, not parametric.

### Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npm run validate:concepts` | `PASS conservation_of_angular_momentum.json` · 150 PASS / 0 FAIL · zero WARN on target |
| `check-layout-overlap.mjs` | 0 collisions across 8 states |
| THE EYE (`visual:eyes`) | **35 checks · 35 passed · 0 failed · $0.00** (re-run clean after fixes) |
| Apparatus contract | **8/8 states conform** — every pinned field authored explicitly, no chapter fork |
| `param_ramp` entry contract | 4/4 — authored entry `r` equals `ramp.from`, holds at `to`, S6 the only looping state |
| Closed-enum trap | clean — every `readouts[]` token inside `RBR_RO_META`, every `controls_visible` token inside the five |

Numeric ground truth read off the captured HUDs matches physics_block §1 exactly at all 8
sample points, including S5's held quadruple `I 3.06 · ω 0.75 · L 2.29 · KE 0.86` and the
Unicode minus (U+2212) on S6's negative readouts.

### Gate cycle

`quality-auditor` and `eye-walker` ran in parallel. The auditor returned **FAIL** on two
blockers; eye-walker independently confirmed both from the pixels. Both were routed to
`alex:json_author` as named deltas, fixed, and re-confirmed against a fresh capture:

- **B-1** `idle_auto_sweep.range` was `[0.20, 0.80]`. The engine reads `range[0]` as the sweep
  START, not a minimum, so S8 seeded `L0 = I(0.20)·1.50 = 0.99` — the explore state, where the
  teacher demonstrates "watch, L does not move", read a different invariant from every guided
  state's pinned 4.59. Fixed to `[0.80, 0.20]`; S8 now opens `r 0.80 · I 3.06 · ω 1.50 · L 4.59`
  and all five keyframes hold 4.59.
- **B-2** all 8 `field_3d_config.states[].label` values had been authored from the skeleton's
  internal **Purpose** column. `label` is rendered — the renderer unconditionally prepends it to
  the bottom-left legend and rbr has no suppression early-return — so authoring jargon
  ("primary aha", "quantitative beat", "ring-gated"), ASCII math (`I1 omega1 = I2 omega2`,
  `tau_ext = dL/dt`) and "drum" were all on canvas, in every frame, breaking Rules 34a/34b/34c/41
  and physics_block callout 2. Rewritten to the Title column; no ASCII math survives on canvas.
- **R-4 + R-5** S8 shipped 27 narration words where physics_block §4 authors **0**, and that
  sentence named the spin-direction control, which is `min_ring: extended` and is cut with S6
  under the `core_only` preset — a Rule-38a coherent-when-cut leak. Narration removed.

### founder-proxy Checkpoint B — **`FIX(engine)`, blocking. NOT sealed.**

Full report: the verdict is `FIX(engine)` with **A-11 blocking**, plus two content findings that
were routable on this desk and are now closed. founder-proxy drove the sim itself under Playwright
(24 samples, zero console errors) and confirmed the physics independently: **L is exactly 4.59 in
every torque-free state at every sampled t** — not 4.5899 — S5 lands on its authored held triple,
S3's ω lands on the prediction exactly, and r-drag under brake holds L pinned. It found no
ESCALATE trigger and no doubt about the engine's correctness.

**Why it could not APPROVE:** *"STATE_6 does not show the thing STATE_6 exists to show."* S6's
atomic claim is "L is a vector — the arrow flips", and there is no visible arrow (A-11). Its
summary judgment: a teacher would want to teach S1–S5 from this today, and S5 is "the
best-composed state I have seen come off a first rotmech build" — but they would not teach S6 from
it. Teaching-value read on the two blocking engine defects: S2's PRIMARY aha **degraded but
survives** (all three payload elements are on screen and correct), S4's supporting aha likewise,
**S6 destroyed**.

**Closed on this desk after Checkpoint B** (`alex:json_author`, both verified):

- **F-1 + F-2 — one `camera_position` edit.** The apparatus was drawn at 18.7% of canvas width
  against ~38% (`block_on_incline`) and ~30% (`capacitance`) for approved baseline-locked
  exemplars — roughly half their linear scale, a quarter of their area, in a frame ~85% black.
  Worse, the 23.4° elevation foreshortened the rod to 0.40× edge-on, and Rule 37 freezes guided
  states at timeline end — so `STATE_3__frozen` showed `r = 0.80` with the masses **71 px apart**
  against **191 px** at identical r and camera in S1. The frame meant to prove "the masses slid
  back out" was indistinguishable from "the masses are at the axle". Recurrence of the FIXED scar
  `field3d_position_vector_foreshortened_3q_camera`.
  `[6.2, 3.8, 6.2]` → `[2.74, 3.87, 2.74]` (distance 9.56 → 5.48, elevation 23.4° → 45°, azimuth
  unchanged). S6's own side-on reframe rescaled by the same ratio with its direction preserved
  exactly (`[0.3, 1.1, 8.0]` → `[0.22, 0.80, 5.85]`).
  **Verified, not asserted:** json_author reimplemented the renderer's projection in a standalone
  script and calibrated it against founder-proxy's own cited pixel numbers first (reproduced
  239×215 px vs the cited 239×220, and 70/192 px vs the cited 71/191) before sweeping for a new
  triple. eye-walker then independently re-measured on the live page — its method reproduced 18.6%
  against the stated 18.7% — and **hunted the worst spin phase rather than accepting a good frame**:
  worst-case mass separation at the home pose is now **232 px** (ratio 0.68), against the old worst
  of 71 px (ratio 0.37). The new worst frame beats the old *best* frame.
- **F-3 — two redundant `label` strings.** `STATE_7.label` was byte-identical to its own formula
  surface, so S7 printed the same relation three times in one frame (caption in words, Cambria-Math
  surface, monospace legend) — Rule 34b, plus 41d, plus the 32d-flavoured point that S7 was the
  only one of eight where the legend stopped being a sentence. `STATE_8.label` was byte-identical
  to its own caption. Now `"Why L stays constant"` and `"Full turntable, every control live"`.

**Still blocking, and NOT fixable here** — `peter_parker:field3d_surgeon` (Desk E) owns both:
**E-1/A-11** and **E-2/A-12**. eye-walker re-checked both under the new camera: severity
**unchanged**. Both are colour/depth/occlusion defects, not size defects, so a closer camera does
not help — though A-11 now has more pixel budget for whoever builds the fix.

**Verdict path from here:** founder-proxy re-reviews once E-1 lands. If Desk E's 2-attempt budget
fails on E-1, the concept parks to the founder's chapter-end engine queue — the documented degrade
path, and explicitly preferred over sealing a state whose only claim is invisible.

**Advisory rubric** (unratified, did not affect the verdict): **14/20**. Weakest D5 apparatus
conviction (both vectors invisible). Strongest **D9 — "the cleanest Rule-41 title set I have
reviewed", better than the three exemplars**, which §4's fence says would fail Rule 41 today.

### Two founder-proxy rulings worth carrying forward

- **Keep S8's `text_en: ""`.** The cheaper path — trimming four words off S8's sentence — was
  ruled **worse**, not cheaper: it would re-introduce narration into an explore state that
  physics_block §4 authors at 0 words, purely to route around a schema limitation, and would have
  quietly re-opened the R-5 ring-cut leak. `""` is the honest encoding; a fabricated sentence is a
  lie about the design. **The schema is what is wrong** (A-15, office/Rule-40, on master).
  Checkpoint C should carry a line marking `text_en: ""` on an `interaction_complete` state as a
  **sanctioned interim encoding**, so desks B–E adopt it knowingly and all eight sweep in one edit.
- **A-2 (S8 brake ghost) is a ride-along, not blocking** — S8's own claim ("every control is live
  and L responds") is true. The contradiction is with S2's claim, one state upstream, and only if
  the teacher touches τ. Moot in practice since A-11 dispatches Desk E anyway, and better carried
  in the same pass. founder-proxy drove it: at τ = 1.95 N·m the turntable reaches **ω = 0.00,
  L = 0.00, KE = 0.00 with no pad, arm or label anywhere on canvas** — angular momentum to zero
  with nothing touching the machine, which is the exact picture S2 spends thirteen seconds
  destroying.

### Two corrected diagnoses — carried into `findings_a.md` so Desk E is not sent to the wrong knob

Both of eye-walker's original mechanisms were wrong, and founder-proxy traced the real ones in
source. This is the single most valuable output of the gate cycle:

- **A-11 is occlusion, not scaling.** `RBR_L_ARROW_SCALE` runs correctly (0.918 units at L = 4.59
  vs 0.458 at L = 2.29, and the head *does* shift ~31 px). `ArrowHelper`'s shaft is a zero-width
  `THREE.Line` lying inside an opaque `CylinderGeometry(0.07, 0.07, 3.4)` axle — **the shaft is
  never visible at all**, only the fixed-size 0.24 cone head. Tuning the scale constant would fix
  nothing.
- **A-12 is camouflage, not the length floor.** `rbrArrowLen(3.60 N) = 0.252`, comfortably **above**
  `RBR_ARROW_MIN_LEN = 0.16`. The arrow is drawn tail-outward onto the rod's own 0.20-unit tip
  overhang in a near-identical pale tone. And `F = mω²r` with `ω ∝ 1/I` means it is **smallest
  exactly when it must be seen**. Sending Desk E to the floor constant would waste a dispatch.

Plus **A-16** (new, nobody had filed it): the founder-approved sign-colour convention has exactly
one consumer in the renderer, and it recolours the shaft A-11 proves is invisible — the L label and
HUD digits never take sign colour at all, so the whole channel has zero on-screen presence.

Five candidate scar rows + three recurrence updates are staged in
`_engine/scar_candidates_a.sql` (**not applied** — guardrail 9; scars are files on this desk).

### Open items for the founder / office

1. **`prerequisites`** names four in-chapter ids (`angular_momentum`, `moment_of_inertia`,
   `tau_eq_i_alpha`, `rotational_work_energy`) that exist in `VALID_CONCEPT_IDS` with no concept
   JSON yet. Rule 23 makes prerequisites advisory, never gating, and nothing fails on them —
   but the ruling flagged in `rotmech_a_state.md` is still open.
2. **`chapter` / `section` numbering is unpinned** for the rotmech set. json_author authored
   `chapter: 9`, `section: "9.9"` (next free internal id, approximating NCERT §7.9). **All eight
   Ch.7 concepts across five blind desks must agree** — this needs one office ruling, not five
   independent guesses. Filed as A-4.
3. **Two OPEN scars give contradictory instructions on narration glow** —
   `concept_ships_zero_narration_glow_bindings` wants `tts_sentences[].glow`, while
   `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state` says such
   glows are inert wherever a state authors a `glow_focal`, and marks the question FOUNDER
   DECISION PENDING. This concept took the only path that renders (18 `phases[]` entries).
   Filed as A-14 — needs a ruling, not an engine fix.

### Engine findings → Desk E (`docs/loop_runs/rotmech/_engine/findings_a.md`)

14 rows, none fixed here (guardrails 5 + 6 — the renderer was never edited). The two most
serious, both raised by eye-walker from cross-state pixel comparison and both sitting directly on
this concept's key pedagogical beats:

- **A-11 (CRITICAL)** the L arrow is visually indistinguishable from the static axle pole —
  pixel-identical at L = 4.59 and L = 2.29, no reveal-in animation. S6's entire misconception
  payload ("L is a vector, not just a number") depends on a visible arrow flipping direction.
- **A-12 (MAJOR)** the pull-arrow minimum-length floor collapses low-force visibility — at
  r = 0.80 / F ≈ 3.6 N there is no visible arrow geometry at all, only a text label. This is
  exactly S2's cause beat, carrying the PRIMARY aha, where skeleton §9 requires the agent doing
  the work to be on screen. The scar was named prospectively in physics_block §6 callout 4 and
  is now **confirmed materialized**.

Also filed: A-5 sparse slider panel height (confirmed regression) · A-6 S3's match cue is latched
rather than a closed form of t, so it reads as already-fired in every rewound frame and THE EYE
structurally cannot verify S3's one beat · A-7 no `at_ms` reveal channel for the pull arrows ·
A-8 `controls_visible` cannot express `min_ring`, so the ring-gated explore claim is a paper claim ·
A-9 `masses.r_m` is dead at t = 0 in any ramped or swept state (the mechanism behind B-1) ·
A-10 the `R_drum` sprite string · A-13 R_drum/brake label collision. A-1 and A-3 were amended
after the audit narrowed their scope.

### Desk notes

- **No dev server is possible on this desk.** `npm run dev` fails with
  `Symlink [project]/node_modules is invalid, it points out of the filesystem root` — Turbopack
  rejects the shared `node_modules` junction. A consequence of guardrail 9's no-`npm install`
  rule, not a defect. Verification ran against the built review site on **port 8110** plus THE
  EYE's frame dumps instead. Port 8080 was busy throughout with a sibling desk's server.
- Cache work used `npm run cache:clear:scoped` exclusively; the global 4-table wipe was never run.
- Narration audio is absent by design (Rule 30h, and `tts:*` is forbidden here). Not a defect.

---

## 2026-08-05 · S3 and S7 BLOCKED — dead formula-assembly archetype (found by Desk D)

**Checkpoint B is NOT to be run on this concept until `formula_at_ms` lands.** This arrived after
the JSON was committed (`1d5b693`) and is independent of the two engine defects already blocking
(A-11/E-1, A-12/E-2).

| State | Status | Why |
|---|---|---|
| **STATE_3** | **BLOCKED** | physics_block §3 times `formula_surface` assembling `I₁ω₁ = I₂ω₂` over 0–3200 ms. The surface has no timing — the whole equation appears complete at t = 0. |
| **STATE_7** | **BLOCKED** | Same, worse. `motion_archetype: "equation-build"` is S7's **declared Rule-31 archetype**, and its narration-sync table stages the surface across two windows (`τ_ext` term 0–2000, `= dL/dt` term 2000–4000). Neither the staging nor the archetype happens. |

**Source of the finding:** Desk D's `findings_d.md` **§6c**, filed as a cross-desk alert. Desk A's
own ten engine findings did not catch it — Desk D's architect read the contract from the other
side. Re-verified independently on this desk before recording: `rb.formula` is typed `string`
(`field_3d_renderer.ts:1050`) and written once per state apply at `:50570-50573`; `#rbr_formula`
has exactly three references in the entire renderer and `updateRigidBodyRotationFrame` is not one
of them, so there is no per-frame update path either.

**Filed as `A-18`, not `A-11`.** `rotmech_a_state.md` and `findings_d.md` §6c both say to file it
as A-11 — but **A-11 was already assigned** on this desk to the CRITICAL L-arrow occlusion defect
that founder-proxy carries as blocking **E-1**. Re-using the id would have collided two unrelated
blockers in the queue Desk E reads. A-18 is the next free id; an ID-collision note now sits at the
head of A-11 in `findings_a.md` redirecting anyone who arrives looking for "A-11 = formula
surface". **Desk D and the office should be told the id moved.**

**Not fixable here, and not worth routing around.** Guardrails 5 + 6 — the renderer is untouchable
on this desk and Desk E is the sole engine owner. There is also no honest concept-side workaround:
authoring the assembly away would delete S7's declared archetype, and Rule 31 is what makes S7 a
distinct state rather than a restatement of S5.

**One thing Desk E should not have to rediscover** (recorded in A-18): the mechanism already
exists twice in the same file — `pef.formula_at_ms` (`:9149`) for a whole-surface reveal instant,
and `nlb.formula_lines[].at_ms` (`:1644`, `:45148–45158`) for **per-line staged reveal on the ONE
Rule-34b surface**. This is a port, not a new build (Rule 40a). The `formula_lines` shape covers
S7; `formula_at_ms` alone covers S3 only.

**Sealing status unchanged and now doubly blocked:** A-11/E-1 (S6's arrow), A-12/E-2 (S2's cause
beat), and now A-18 (S3 + S7). Five of eight states have a blocking engine dependency.

### Next

**STOP. No Checkpoint B on `conservation_of_angular_momentum`** until `formula_at_ms` lands and
this desk syncs — then re-verify S3/S7 and hand back to founder-proxy along with E-1/E-2.

Wave 2 (`rotational_work_energy`) stays **BLOCKED on 0c-3** — it needs a `W = τ·θ` accumulator
and a `θ` readout, and `RBR_RO_META` implements neither. Do not start it until 0c-3 merges and
this desk syncs.
