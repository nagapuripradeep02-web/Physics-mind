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

---

## 2026-08-05 · A-18 CLEARED — S3 and S7 assemble term-by-term, verified on two channels

**S3 and S7 are UNBLOCKED.** A-11/E-1 and A-12/E-2 are not — Checkpoint B still cannot run.

### D1 alone did not fix anything — the JSON had to be re-authored

Desk E's D1 (`7022169`) ports `formula_lines` to rbr: a per-line timed reveal on the one
Rule-34b surface, every line whose `at_ms ≤ t` joined in authored order, recomputed as a pure
function of state-local `tMs` (so a pin/rewind reproduces earlier frames and no second hysteretic
latch is introduced — the A-6 scar class). Desk E took the **`nlb.formula_lines` shape rather than
Desk D's proposed `formula_at_ms`**, because that name already means "whole overlay at one instant"
on `pef` — the correct Rule-40a call, and the richer shape S7 needed.

**But D1 is an authoring affordance, not an automatic upgrade.** Absent `formula_lines` is
byte-identical to the legacy string *by design* — the backwards-compatibility guarantee A-18 asked
for. This concept authored a bare `formula` string on every state, so after D1 landed both beats
were **still dead**. Authored on this desk:

| State | `formula_lines` | Sourced from |
|---|---|---|
| S3 | `I₁ω₁` @ 0 · `= I₂ω₂` @ **1600** | physics_block §3 times the assembly over 0–3200 with one narration sentence; 1600 = its midpoint. Completes well before the 3200 ms slide. |
| S7 | `τₑₓₜ` @ 0 · `= dL/dt` @ **2000** | physics_block §3's narration-sync rows (sentence 1 → 0–2000 `τₑₓₜ` term, sentence 2 → 2000–4000 `= dL/dt` term). **⚠ This justification was WRONG — see the correction below. The values stand; the reason given for them did not.** |

The legacy `formula` string is retained on both as the documented complete equation; D1 resolves
precedence deterministically (`Array.isArray` + length, never truthiness).

### Verification — the PASS was worthless, so it was not used as evidence

THE EYE returned **35 checks / 35 passed / 0 failed** — the *same* 35/35 it returned before D1
existed and before the beats worked. Desk B has just demonstrated 35/35 on a scene that never
moved. **The PASS proves nothing about this question and was not counted.** Two independent
channels were used instead, chosen because they fail differently:

**1 — DOM text probe** (`src/scripts/_scratch_rbr_formula_probe.ts`, new, $0). Drives the REAL
assembled renderer over the REAL concept JSON on a deterministic virtual clock and reads
`#rbr_formula`'s `textContent` at pinned instants. Expectations are derived from the JSON at
runtime, not hardcoded. **All checks passed:**

| Sample | S3 reads | S7 reads |
|---|---|---|
| t = 500 / 1000 | `I₁ω₁` (one line) | `τₑₓₜ` (one line) |
| t = 1599 / 1999 | `I₁ω₁` | `τₑₓₜ` |
| t = 2000 → 6000 | `I₁ω₁\n= I₂ω₂` | `τₑₓₜ\n= dL/dt` |

Plus: **rewind determinism** — S3 at 3000 → 500 → 3000 un-reveals the second line and reproduces
the first frame byte-identically (D1's stateless claim holds; no second A-6-class latch).
**Untouched states are byte-identical** — S1 `L = Iω` and S5 `τₑₓₜ ≠ 0 ⇒ L changes` constant across
time and equal to the authored string exactly. **Zero console/page errors.**
The probe asserts the clock actually reached each instant, so a dead scene reports as a dead scene
rather than as a silent pass — the specific trap being guarded against.

**2 — eye-walker on the pixels** (`.visual_runs/…/20260805-030738/`), briefed to distrust the PASS
and to transcribe rather than confirm. Independently found the transition: **last one-line frame
`STATE_3__dense_t01000`, first two-line `STATE_3__dense_t02000`** (same for S7). Also confirmed the
intermediate single-line state is legible and unclipped; the taller two-line block (≈x22–106,
y262–318) clears the caption, HUD, KE bar and slider panel with room to spare (**Rule 34d clean** —
it grew into empty canvas); glyphs are true Unicode with correct subscript baselines (**34c clean**);
and **no untouched state's surface changed**, S6's blank surface being correct (it authors none).

**The two channels are complementary, and neither alone would have been enough.** The 1000 ms dense
cadence bounds the reveal only to `(1000, 2000]` — eye-walker was explicit that this is *consistent
with* 1600 but does not *prove* it. The DOM probe pins the exact instant (absent at 1599, present at
2000). Conversely the probe reads text, not rendering — only the pixels prove the glyphs actually
draw, unclipped and uncollided.

### Two probe FAILs, both characterized before being dismissed — neither is a defect

- **`at_ms: 0` on `SET_TIME_FREEZE` is falsy**, so a pin at t = 0 free-runs to the ~1500 ms harness
  default instead of holding at 0. **Pin channel only** (probes and THE EYE, which always pins at
  maxReveal, never at 0); playback is unaffected. Readings at that instant remain correct *for that
  instant*. Noted, not filed.
- **At the exact authored instant the reveal can be one float-epsilon late.** `tMs` is
  `(time − stateStart) × 1000`, so a pin at 1600 lands on 1599.999999…, which fails `tMs >= 1600`.
  Measured: the clock printed `1600.000000` at six decimals while still comparing `< 1600`. Sub-
  microsecond, invisible, and S7's 2000 boundary landed the other way. **Confirmed by measurement,
  not assumed** — the probe now reports it as a note instead of asserting float equality.

### eye-walker's two candidate scar rows are BOTH already filed — not new

Its `reference_mark_tick_label_overflows_panel_into_canvas_edge` is **A-17** (S4 tick caption
overflow, already routed) and `slider_panel_reserves_fixed_height_regardless_of_content` is **A-5**
(sparse slider panel, already routed with the `visibility:hidden` tension noted). Independent
re-derivation from the pixels — good corroboration, nothing to add to the queue.
Its one genuinely new observation is deliberately **not** filed: S7's tail lights two HUD chips at
once (`L` and `dL/dt`). Rule 32e governs canvas glow focals, not HUD chip styling, and in S7 the
pairing is arguably the teaching point. Founder/founder-proxy call, not an engine bug.

### ⚠ This desk now carries Desk E's UNMERGED branch

**0c-3 has NOT merged to master.** D1 lives only on `feat/rotmech-0c3`, so `npm run desk:sync`
(which merges `origin/master` into desks) could never deliver it — it did not touch this desk at
all. `origin/feat/rotmech-0c3` was merged in directly to make the verification possible. The merge
was conflict-free (dry-run first, then clean), but this desk's history is now **ahead of master by
Desk E's in-flight engine tree**, including the five 0c-3 commits and `FROZEN_SCOPE_0c3.md`. If
Desk E rebases or amends 0c-3 before it reaches master, this desk carries a divergent copy of
`field_3d_renderer.ts` — the exact race the "never edit the platform files" guardrail exists to
prevent, arriving by merge rather than by edit. **Flagged for the office.** No platform file was
edited here.

### Verification chain

| Check | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npm run validate:concepts` | 150 PASS / 0 FAIL |
| THE EYE | 35/35 — **recorded, not counted as evidence** |
| DOM text probe | ALL CHECKS PASSED (incl. rewind determinism + legacy byte-identity) |
| eye-walker | assembly confirmed on both states; Rules 34c/34d clean; no regression |
| Cache | `cache:clear:scoped` then re-seed, immediately before THE EYE (guardrails 1–3) |

Review site rebuilt: `review-site/conservation_of_angular_momentum/`
(serve with `npx --yes http-server review-site -p 8110 -c-1` → `http://localhost:8110/conservation_of_angular_momentum/`).
The `build:review` warning "states with no narration: STATE_8" is **expected** — the sanctioned
`text_en: ""` interim encoding (A-15), not a defect.

---

## 2026-08-05 (later) · Gate cycle re-run — quality-auditor **FAIL**, held entirely on E-1/E-2

`quality-auditor` ∥ `eye-walker` ran in parallel on a freshly re-seeded cache and a fresh EYE dump
(`20260805-124934`). Both agree, from independent evidence.

**Verdict: FAIL — and no concept-JSON defect is responsible.** The auditor's own summary: *"If E-1
and E-2 were fixed today, this concept would PASS."* The FAIL routes to
`[owner: peter_parker:field3d_surgeon] [reason: bug-class]` on the OPEN scar
`teach_visual_must_match_narration`, instances **E-1** (A-11) and **E-2** (A-12).

**Gate 15 failures on S1 and S6 collapse into E-1** — the auditor was explicit that these must NOT
be routed separately to `alex:json_author`, because there is nothing for a json author to fix: the
arrow simply has no visible geometry. S6's atomic claim ("L is a vector — the arrow flips") is
carried by a text label teleporting across the authored 500 ms re-pin blank.

### The `formula_lines` change itself: CLEAN on every dimension checked

| Re-check | Result |
|---|---|
| Rule 34b — still ONE surface | ✓ exactly one `#rbr_formula` on all 8 states; legacy string never rendered alongside |
| Rule 34c — Unicode, all three text paths | ✓ DOM + sprites; no `ctx.fillText` path in this scenario; only `R_drum` is ASCII = A-10, already filed |
| Rule 34d — the taller block | ✓ zero pairwise overlaps, live bounding boxes on all 8 states; nearest neighbour 318 px away |
| Rule 25 — bare first line | ✓ reads incomplete-but-not-wrong; no `=`, no RHS, and the caption carries the complete idea in words |
| Rule 31 — S7's archetype renders | ✓ discharged |
| No new latch (the A-6 scar class) | ✓ **independently reproduced from the live DOM**: pin 9000 → rewind 1500 REMOVES the second line, both states |

That last row matters: the auditor reproduced the rewind determinism by a different method than
this desk's probe (live pinned DOM walk vs. virtual-clock harness) and got the same answer. Three
independent channels now agree the reveal is a pure function of `tMs`.

Physics was recomputed from scratch and matches exactly — I = 3.06, L = 4.59, ω(0.20) = 6.9545
("4.64 times"), S5's braked L = 2.29 / ω = 0.75 read off the frozen HUD, and both q3 distractors'
arithmetic verified against their stated misconception.

### ⚠ A claim this desk made in writing was WRONG — corrected

The A-18 note above justified S7's `at_ms` values as matching physics_block §3's narration sync
"exactly". **Against the real player that sync does not exist.** `build_review_site.ts:1142`
estimates sentence length from character count and ignores the authored `duration`, so `s7_1`
occupies `[0, 7111)` and `s7_2` starts at **7391 ms** — the `= dL/dt` line at 2000 ms lands 5.4 s
before the sentence it was said to be synced to. The values were chosen against a timing model
`physics_block.md` describes and the player does not implement.

**The values still stand, on a different and honest justification:** the second line lands inside
`s7_1`, which recites the whole relation, and motion outrunning narration is the permitted
direction under Rule 31. Filed as **A-21** (advisory, systemic, founder decision) — the same
mismatch runs 2.0–2.7× across all seven guided states, and every `readout_at_ms` / `param_ramp` /
`formula_lines.at_ms` in this concept was chosen against that model.

### New findings filed

- **A-20** (MEDIUM, Desk E) — rbr's ⚙ widget labels fall back to internal ids: "Kebar", "Repin",
  "Spin dir slider" (which is a button, not a slider). Rule 39g spot-check on a NEW scenario;
  sanctioned fix is the `data-wg-label` escape hatch.
- **A-21** (MEDIUM, advisory, office/founder) — the narration-timeline mismatch above.

### Closed on this desk

- **S8 was missing `depth_ring`** (auditor LOW). Now `"depth_ring": "core"`, matching the
  `capacitance` proof-run, whose `interaction_complete` state is likewise tagged `core` — and
  matching Rule 38b (the explore state surfaces CORE-ring content only). Verified: tsc 0,
  validate 150 PASS / 0 FAIL.
- Two DoD-ledger overstatements (`m` never printed on any guided state; `r` first prints on S1,
  not S2) are recorded as LOW for `alex:architect`. Cosmetic — nothing untaught reaches the
  screen; the ledger simply overstates. **Not fixed here** (skeleton/DoD is architect's file, and
  the concept is not sealed).

### Checkpoint B was NOT run — its precondition is unmet

founder-proxy Checkpoint B is defined as running **after a quality-auditor PASS** + eye-walker.
The auditor returned **FAIL**. Running Checkpoint B now would ask it to re-derive a verdict it has
already given: at the previous Checkpoint B it returned `FIX(engine)` blocking on exactly A-11,
and **nothing about A-11 or A-12 has changed since** — both re-confirmed unchanged by two agents
on this run. The concept's status is already the documented degrade path: parked for Desk E, and
founder-proxy re-reviews once E-1 lands.

---

## 2026-08-06 · founder-proxy **Checkpoint B — `FIX`** (cycle 1 of 3). Not sealed.

E1/E4/E5/E7 all verified by this desk (reports in `_engine/findings_a.md`). The gate ran for the
first time with its precondition met (`quality-auditor` **PASS** + `eye-walker`). The two gates then
**contradicted each other** on whether S6 teaches its claim, which founder-proxy adjudicated.

### The ruling: A-23 WITHDRAWN — quality-auditor was right

eye-walker read motion off **1 Hz** dense frames on a rotor with a **4.19 s period** — 86° of rod per
frame on a 2-fold-symmetric rod, which aliases a steady spin into apparent stillness. Its
prescription ("flip must render as continuous rotation, or L through zero") was also physically
wrong: for a fixed-axis rotor **L is always ±ẑ**, and L-through-zero needs a torque that Checkpoint
A's F-2 deliberately removed. **The `bug_class` must not be filed.** What was real in it is refiled,
narrower and source-verified, as **A-26**.

### THREE P1s — the concept does not seal this cycle

| # | Finding | Owner | Status |
|---|---|---|---|
| **B-3** | **The review site served to the gate predated E7 by one engine fix** | *this desk* | ✅ **FIXED** |
| **B-1** | S4's KE tick caption clips at canvas x=0 — recurrence of the **FIXED** scar `graph_marker_label_clipped`, on the supporting-aha state | `peter_parker:field3d_surgeon` | → Desk E, **blocking** |
| **B-2** | S6's frozen pin lands on a camera-degenerate rod phase (A-22) | `alex:json_author` | ✅ **FIXED** |

**B-3 was my error and it invalidated the live half of the gate.** I rebuilt the review site
*before* merging master, so the bundle served to both agents was pre-E7: 82 × `#90A4AE`,
**zero** `rbrMakeThickVector`. founder-proxy spent five probes chasing what looked like a
catastrophic regression — "the L arrow is never drawn in live playback" — which was **the pre-E7 sim
faithfully reproducing the exact A-11/A-16 defects it was convened to verify as fixed.** It caught
the trap only because the live apparatus was still the old light grey. Rebuilt and verified:
`rbrMakeThickVector` ×5, `#1F2A30` present, HTTP 200. **Provenance now matters more than any single
finding — a stale bundle makes the same defect read as both fixed and unfixed.**

### Fixed on this desk this cycle (all verified: tsc 0 · validate 150 PASS / 0 FAIL · 0 collisions)

- **B-2 · S6 camera** `[0.22, 0.80, 5.85]` → `[0.21, 2.02, 5.55]`.
  **Deliberate deviation from the routing, stated:** founder-proxy said "offset the *azimuth*".
  Azimuth alone only changes *when* the rod goes edge-on — it dodges the degeneracy at one pin time
  and returns the moment pacing moves the pin. **Elevation removes it structurally**: 7.78° → 20.0°,
  so the worst-case end-on mass separation goes **0.217 → 0.547 world units** (drum radius 0.55 for
  scale). **Distance is preserved exactly** (5.9085, so the apparatus does not shrink — the open
  scar `authored_camera_leaves_the_apparatus_at_half_the_fleet_linear_scale` is not worsened) and
  **azimuth is preserved exactly** (x/z 0.03761 → 0.03761, so the side-on character the L arrow
  needs is intact; the arrow foreshortens only to cos 20° = 0.94 of full length).
- **B-6 · S4** `gap_hold` focal `rbr_pull_arrow` → `rbr_mass`. The held payoff was glowing the
  *cause*, and because `F = mω²r` the pull arrows are at MAXIMUM length after the pull-in — two
  oversized bars dominating the frame whose claim is the KE bar's open gap. (`rbr_ke_bar` is not a
  valid glow id; `rbr_mass` is the best available.)
- **B-7 · S7** `held` focal `rbr_drum` → `rbr_l_arrow`. The advanced payoff was glowing inert
  geometry — the brightest object at the instant the claim is `dL/dt = 0.00` was the drum, which
  carries no information. The L arrow is the element that visibly does *not* change, which IS the claim.
- **B-8 · S6** `hand_curl_a.until_ms` 4000 → 3500, removing the only two-focal overlap in the
  concept (Rule 32e).
- **B-9 · curriculum_tags** CBSE/NCERT `verified: true` → `false` / `needs_teacher_verification: true`.
  It was the one cell asserted as fact with **no named verifier** (Rule 38g: tags are claims).

### Ride-along to Desk E (not blocking)

- **A-26 / B-4** — the restart is marked only in chrome while the body glides through it (above).
- **A-25 / B-5** — the arrowhead is 2.3× wider than long (`_headR = 0.090 × 3.1 = 0.279`, i.e. 0.558
  across vs `RBR_L_HEAD_LEN = 0.24`). founder-proxy: eye-walker's MAJOR is closer to right than
  quality-auditor's LOW, and **this is the highest-leverage engine fix in the chapter** — eight
  rotmech concepts inherit the primitive, and the chapter's subject is vector direction.
- **A-24** — E7 over-corrected the darkening (axle 1.37:1 vs background).

### ⚠ Carry to Checkpoint C — do NOT seal as satisfied

**A-8 confirmed inexpressible: `min_ring` occurs ZERO times in the shipped JSON.** The ring-gating of
explore controls that founder-proxy **approved at Checkpoint A** as closing
`explore_controls_not_ring_gated_survive_the_ring_cut` **is not implemented** — under a `core_only`
preset the extended-ring "Reverse spin" control survives with S6 hidden. founder-proxy explicitly
flagged this as contradicting its own Checkpoint A sign-off. Not blocking B (38g keeps presets
teacher-invisible), but it must reach C marked NOT satisfied.

### Advisory rubric 16/20 (unratified, did not affect the verdict)

Weakest **D3 narration→canvas binding: 33 `tts_sentences` across all 8 states, ZERO carrying any
glow binding** (exemplars measure 52/52 bound). Emphasis rides authored ms windows instead — which
founder-proxy identified as the **root cause of B-6, B-7 and B-8**, all three found independently
before it scored the dimension. That is the single most useful structural note of the cycle.

---

## STANDING ASSIGNMENT — Desk A is Desk E's rbr verification partner for E4/E5

**Assigned 2026-08-05.** E4 and E5 are **signed torque** and **the θ / α readout rows**.

**Trigger: when E4/E5 land ON MASTER** (not merely on `feat/rotmech-0c3` — see the sync trap
below). Then: `npm run desk:sync` → re-seed scoped → sanity EYE on the turntable → **report to
Desk E**.

Three things this desk already knows that make it the right partner, and that the report should
carry:

1. **`RBR_RO_META` (`field_3d_renderer.ts:50147`) implements exactly six readout rows —
   `I · ω · L · KE · dL/dt · F`. There is no θ, α, W or v row.** `rbrRebuildReadout` (`:50162`)
   does `if (!meta) continue`, so an unknown token is skipped in **silence**: a concept authored
   against a missing row passes Zod, passes `validate:concepts`, seeds, renders, and can be sealed
   with the taught quantity simply absent. **E5 is exactly the fix for this**, so the sanity run
   must confirm the new tokens actually PRINT, not merely that nothing errored.
2. **A THE EYE PASS proves nothing about a specific beat** (A-19). Verify θ/α by reading the row's
   rendered text, not by a green verdict.
3. **`rotational_work_energy` (wave 2) is blocked on precisely this work** — it needs a `W = τ·θ`
   accumulator and a θ readout. E4/E5 landing is its unblock signal too.

**The sync trap, learned the hard way on E1 (2026-08-05):** `npm run desk:sync` merges
`origin/master` into desks and **skips the current desk entirely** (that is why `feat/rotmech-a`
never appears in its output). E1 was reported as "landed" while it existed only on
`feat/rotmech-0c3`, so `desk:sync` could never deliver it and reported nothing amiss. Before
trusting any "E-N landed" signal, check containment directly:

```bash
git fetch origin && git merge-base --is-ancestor <sha> origin/master && echo ON_MASTER || echo NOT_ON_MASTER
```

**Naming collision to keep straight in any report to Desk E:** Desk E's dispatch ids (`E1, E2, E3,
E4, E5…`) collide with founder-proxy's blocker ids (`E-1` = A-11 the invisible L arrow, `E-2` =
A-12 the camouflaged pull arrows, `E-3` = A-16, `E-4` = A-17). **Desk E's `E4` is signed torque;
founder-proxy's `E-4` is the S4 tick-caption overflow. They are unrelated.** Always qualify:
"Desk E dispatch E4" vs "blocker E-4/A-17".

### Next

**STOP. Still no Checkpoint B on `conservation_of_angular_momentum`.** A-18 is cleared, but
**A-11/E-1** (S6's invisible L arrow — S6's entire claim) and **A-12/E-2** (S2's camouflaged pull
arrows at the PRIMARY-aha cause beat) remain blocking and unfixed; eye-walker re-confirmed both
unchanged under this run, and confirmed neither is caused by the `formula_lines` port. In S6's
frozen frame the L arrow is **entirely absent** — the axle runs unbroken and not even the cone head
shows. founder-proxy re-reviews once E-1 lands.

Wave 2 (`rotational_work_energy`) stays **BLOCKED on 0c-3** — it needs a `W = τ·θ` accumulator
and a `θ` readout, and `RBR_RO_META` implements neither. Do not start it until 0c-3 merges and
this desk syncs.
