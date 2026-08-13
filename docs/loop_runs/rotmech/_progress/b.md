# Desk B — progress log (`feat/rotmech-b`)

## 2026-08-04 — wave 1: BOTH rolling concepts authored (json_author stage)

**Concepts:** `pure_rolling` (#11) · `rolling_on_incline` (#12). Both started at json_author —
0b was DONE for each (skeleton REV 3 / REV 6, physics blocks, Checkpoint A `DESIGN_OK`).
Authored in that order, the sibling reusing every apparatus decision.

**Landed**
- `src/data/concepts/pure_rolling.json` — 8 states, rings core S1–S3 / extended S4–S6 /
  advanced S7 / explore S8.
- `src/data/concepts/rolling_on_incline.json` — 8 states, rings core S1–S4 / extended S5 /
  advanced S6–S7 / explore S8.
- `docs/loop_runs/rotmech/_engine/findings_b.md` — 2 OPEN engine findings (below).

**Verify chain:** `npx tsc --noEmit` 0 errors · `npm run validate:concepts` **151 PASS / 0 FAIL**,
both concepts PASS with zero warnings attached.

**Registration:** both ids verified already pre-registered on master (`4b289d4`) at
`panelConfig.ts`, `intentClassifier.ts` (`VALID_CONCEPT_IDS` + `CLASSIFIER_PROMPT`) and
`aiSimulationGenerator.ts` (`CONCEPT_RENDERER_MAP`). **Read-only, not edited** (guardrail 4).
No platform file touched (guardrail 5). No cache writes, no approve/tts/deploy, no commits.

### Phase-0 alarm rule: did NOT fire
No third timed field class was needed or found in either concept. Every authored millisecond in
both JSONs is a `phases[].glow_focal` window, a `formula_lines[].at_ms`, a `bodies[].activate_at_ms`,
a pre-existing engine field (`param_ramp`), or a physics event.

### ACTIVATION SEMANTICS — the paired-contract claim, DIFFED not asserted
Canonical: `rolling_on_incline/skeleton.md` §3, **REV 6.1** (2026-08-02).
Import: `pure_rolling/skeleton.md` §3, stamped **REV 3.1**.

**Result: every normative clause is identical word-for-word** — the optional-`activate_at_ms`
default, `typeof`-not-truthiness with authored-0 ≡ absent, the full whole-body hiding
enumeration before activation, seed-at-activation on the state-local clock, the
"NOT integrated means s and v do not advance, not that forces are not solved" rule, the
single-lane retirement gated on an explicit `single_lane: true` flag and never inferred from
`lane_gap_m === 0`, and the held-visible single-body clause.

**It is not literally verbatim.** The import (a) drops four cross-reference tags that only
resolve inside the canonical document — `(R-11)`, `(REV 6.1, P1-A condition 2)`, `(R-10)`, and
the trailing consumer parentheticals `(S3, which authors both flags)` / `(S6)`; (b) omits one
explanatory sentence — *"Skipping the body's seam-B pass renders `b.f` as a stale zero
(zero-marker or floor), which is not the authored picture either."*; and (c) does not carry the
FORMULA-LINE REVEAL SEMANTICS paragraph at all, referencing its own union item (c)-9 instead.
None of these carries normative force.

**No paired edit was required this session** — authoring forced no change to the semantics on
either side, so neither document was touched.

### Engine findings filed (→ `_engine/findings_b.md`, for Desk E; no engine dispatch from here)
- **B-1 (MAJOR, OPEN)** — the rolling branch's `rollHeld` gate (`field_3d_renderer.ts:46829`)
  has no KINEMATIC precondition. On flat ground `drive = 0` ⇒ `fRoll = 0` ⇒ `canRoll` is
  trivially true, so a wheel launched with a v–ω mismatch takes the rolling branch at
  `a = 0, f = 0` and `_spinIndep` freezes ω at its seed: **no deceleration, no spin-up, no
  capture.** The alternative authoring (omit `rolling`, keep `omega0_rad_s`) gets honest
  contact-relative friction but the angular integration is gated on `rolling` at `:46867`, so ω
  still never moves. **Neither authoring produces the taught picture.** Blocks union item (c)-3.
  Scoped to FLAT-track capture only — **`rolling_on_incline` is unaffected** (drive ≠ 0 on a
  real incline, bodies released from rest, and S7's μ_s ramp drives `canRoll` false, the
  intended working direction).
- **B-2 (MAJOR, OPEN)** — union item **(b)-8 half-landed**: `controls_visible` tokens `R`, `R2`,
  `omega0` are declared in the interface (`:1547-1548`) but absent from `NLB_SLIDER_TOKENS` /
  `NLB_SLIDER_SPEC` (`:42637-42653`), and `nlbSliderTokensUsed` **drops an unknown token in
  silence** — no row, no warning, no gate failure. Kills `pure_rolling` S1's only control and
  half its S8 sandbox, and `rolling_on_incline` S4's mandated live R₂.

**Both concepts are authored to SPEC, not around the gaps** — declaring an unwired token is
inert (clean filter, no throw), so fidelity costs nothing at runtime and the pair needs zero
re-authoring once the fixes land.

### NOT done — do not seal these at Checkpoint B
- `pure_rolling` **STATE_7** (slide-to-roll capture) and **STATE_8**'s ω₀-mismatch demo — blocked on B-1.
- `pure_rolling` **STATE_1** live-radius beat + both **STATE_8** radius dials, and
  `rolling_on_incline` **STATE_4** live-radius re-verify — blocked on B-2.
- `rolling_on_incline` **STATE_8**'s "marble vs huge ring" DoD teacher-walk example — not
  achievable on the shipped engine by any authoring choice (no shape token, no live radius,
  live mass binds by array index to sphere + disc). Needs a chapter-level decision.
- **THE EYE has not been run on either concept.** No cache seeded, no `visual:eyes`, no
  `visual:approve`. Every camera framing, glow-focal id string and overlay collision claim in
  both JSONs is authored-to-convention and **visually unverified**.

### Next
Seed the scoped caches (`npm run cache:clear:scoped -- <id>`, this desk's four permitted keys
only) and run THE EYE on both concepts + the `rolling_friction` / `work_done_by_constant_force`
regression pair, on port **8111**. Expect B-1 to surface loudly as a frozen `pure_rolling` S7.

---

## 2026-08-05 — THE EYE run on all four keys. The rolling extension is DEAD, not partially blocked.

**Ran:** scoped clear → seed → `visual:eyes` on `pure_rolling`, `rolling_on_incline`,
`rolling_friction`, `work_done_by_constant_force`, re-seeding immediately before each run.
Guardrail 1 honoured — `cache:clear:scoped` only, never the global 4-table wipe. Guardrail 2
honoured — only this desk's four permitted keys were touched. Two eye-walkers dispatched (one
per new concept). No `visual:approve`, no seal, no engine dispatch, no platform file touched.

**Two temp seed scripts created** (the convention's per-concept files did not exist yet):
`src/scripts/_seed_pure_rolling_cache.ts`, `src/scripts/_seed_rolling_on_incline_cache.ts` —
verbatim clones of `_seed_rolling_friction_cache.ts` with the id swapped. Delete after the gate.

### Headline: B-1's scoping was wrong, and the concepts are worse off than recorded

**Every `rolling: true` body in both concepts fails to integrate — on every mode, on flat
ground and on the incline alike.** Filed as **B-3 (CRITICAL)**. This SUPERSEDES the earlier
"S7 blocked on B-1, S4 radius blocked on B-2" assessment, which understated the damage:
`pure_rolling` S1/S2/S4/S6/S7 and `rolling_on_incline` S1/S2/S4/S5/S8 all fail to render their
physics. **Neither concept is partially blocked. Both are non-functional.**

Verified mechanically in the main session, not taken on the eye-walkers' word: `rolling_on_incline`
STATE_8 (the Rule-37 continuous-run sandbox) yields **one MD5 across t=0/5000/10000/frozen** —
byte-identical over 10.5 s. STATE_1's race hashes `t0 = t1000 = t3000 = t4000`. STATE_7
(`param_ramp`) differs at every timestamp — the negative control that proves the harness sees
change when there is any.

The discriminator (`rolling: true` count per concept: `rolling_friction` 0 · `work_done` 0 ·
`pure_rolling` 6/9 · `rolling_on_incline` 16/17) correlates perfectly with dead-vs-alive.
**No approved concept in the fleet sets the flag**, so the H2 baselines were structurally
incapable of catching this.

### Regression pair: CLEAN — and that is not evidence of engine health

- `work_done_by_constant_force` — H2 **0.00%** on all 12 baselines.
- `rolling_friction` — H2 0.22–0.38% vs 2.0% tolerance, all 10 baselines.

SEAM R caused no drift on the approved fleet. But both concepts have **zero** `rolling: true`
bodies, so a clean regression says nothing about the rolling path. Recorded explicitly so no
desk cites this pair as reassurance about B-3.

### THE EYE reported 35/35 PASS on both dead concepts

Filed as **B-4 (MAJOR, tooling — Rule-40 platform surface, lands on master separately)**. `D5`
was skipped on every state ("motion expectation unknown" — also skipped on the APPROVED
`rolling_friction`, so it is pre-existing to the scenario, not SEAM R's doing), and `D6`/`D7`
were satisfied by caption, `glow_focal` and live-HUD pixels. D7 only fires on a frozen tail
*after earlier motion*, so a scene that never moved passes by construction. The machine's
verdict was actively misleading; the eye-walkers caught it on both concepts.

### Also filed

- **B-5 (MAJOR)** — `pure_rolling` STATE_3 renders **zero bodies** on an empty track while its
  HUD prints readouts for two. Verified by direct frame read in the main session.
- **B-6 (MINOR, doctrine not engine)** — `I_cm` in a rendered formula surface is ASCII, but
  **Unicode has no subscript 'c'**, so Rule 34c cannot be literally satisfied. **Deliberately
  NOT "fixed"** — inventing a glyph would be fabrication. Needs a doctrine call.
- **B-7 (ambiguous, unrouted)** — negative `a` on release may be a camera-axis convention, not a
  bug. Currently unfalsifiable: under B-3 nothing moves, so there is no direction to compare
  against. Re-check after B-3 lands.

### Still NOT done — unchanged, and now for a bigger reason
Nothing sealed. Nothing approved. No baseline written for either concept (H2 correctly reported
"no approved baseline" on both). A re-walk of BOTH concepts is required once B-3 lands — not
just the S7/radius beats named in the 2026-08-04 entry.

---

## 2026-08-05 (second run) — B-3 was half wrong, and the wrong half was OURS. `pure_rolling` is alive.

### E2/E3 have NOT landed — the premise of this round was false

The round was opened on "Desk E's E2 (kinematic gate) and E3 (R/R2/omega0 wired) are landed —
both your engine blockers are closed." **Neither is on `origin/master`.** Verified three ways:
`git fetch` + `git rev-list` shows this desk **0 behind** origin/master; origin/master's log
carries no E2/E3 commit; and the engine source in this worktree still reads
`NLB_SLIDER_TOKENS = ["m","m2","F","F_ang","theta","mu_s","mu_k","v0"]` (no `R`/`R2`/`omega0`)
with `canRoll` still the bare dynamic-availability test, no kinematic precondition.
**B-1 and B-2 remain OPEN and untouched.** `desk:sync` did not list this desk at all.

### B-8 — our own defect, and it was masquerading as B-3

`surface.length_m` is the track's **HALF-length** (bounds ±3), and `nlbGravAlong` returns
`−m·g·sinθ` so gravity drives −s. Every body authored `s0 = 2.4`: correct on the incline (5.4 m
of runway), **backwards on the flat states** (0.6 m of runway, wall-arrest at ~300 ms).
8 of `pure_rolling`'s 9 bodies affected; only S5 escaped, because `v₀ = 0` — which is exactly
why the first eye-walk had independently called S5 "the only clean state." All 17
`rolling_on_incline` bodies were already correct and were NOT touched.

Fixed to `s0 = −2.4` via `alex:json_author` (9 bodies + the doc-only `x0`). S5 moved too, for
Rule 32d pose continuity rather than because it was broken. `tsc` 0 · validate 151 PASS / 0 FAIL.

**This invalidated half of B-3, which this desk filed yesterday as a CRITICAL engine defect.**
The correction is boxed at the top of B-3 in `findings_b.md`. The observation was real,
reproducible and MD5-verified — and still wrong about the cause, because two different failures
share one signature and the desk had no negative control separating them.

### After the fix: `pure_rolling` is a working sim with two broken states

MD5-verified: distinct hash at every timestamp on S1, S7 and S8, including all 11 frames of the
S8 sandbox across 10 s. Eye-walked: **6 of 8 states now correct** (S1, S2, S4, S5, S6, S8). The
velocity collapse is gone; S2's aha state now reads `contact = 0.00` matching its own caption
(it previously read the exact inverse); STATE_1's revolution marks and the 2πR payoff now fire.
Both flagged camera values were eye-walked and frame correctly — the `camera_position[0] = 2.4`
match to the old start position is a coincidence, not a derived value.

Still broken: **S3 (B-5** — zero bodies render, confirmed still) and **S7 (B-1** — capture never
occurs, now cleanly confirmed with the confound removed: `f_k` sits at 0.00 N for the whole
state despite `mu_k: 0.05`, so ω never rises. The v-drop at ~2700 ms is the far wall at 5.4 m,
**not** capture — a reader could easily mistake it for success).

**New lead on B-1:** STATE_7 authors `omega0_rad_s: 0`, a legal falsy value, and the eye-walker
matched this to an already-OPEN scar row about legal zeros resolved by truthiness. This desk's
own SEAM R fact #2 records the identical hazard class. Cheap to check, and it would survive a
kinematic-gate-only fix.

### `rolling_on_incline`: unchanged, still dead, and now sharply diagnosed

Byte-identical to the previous run (S8 still one hash across t=0/3000/5000/10000/frozen). Since
its s0 was correct and untouched, this is the genuine engine defect. The second eye-walk narrowed
it hard:

- **The forces and branch-switches are CORRECT to the decimal.** S6's held→release fires on
  schedule (`f_s = 4.14 N = mg sin25°` → `a = −2.76 = g sinθ/(1+k)`, `f = 1.38 = k·m·a`); S7's
  μ_s ramp crosses μ_min correctly (`f_k → 0.44 N ≈ μ_k·N`). **The meshes are pixel-identical
  before and after both transitions.**
- **Positive control in the same frame:** S3's `rotation_locked` (non-rolling) block integrates
  correctly beside the frozen rolling disc — `contact` 0.09 → 2.88 → 4.18 m/s, tracking
  `a = g(sinθ − μ_k cosθ) = 2.809`.
- **Signature:** readouts that read from integrated state (`v`, `ω`, `Rω`, `contact`, KE) are
  frozen at seed everywhere; `a`/`f` (computed from formulas) move correctly.

Conclusion handed to Desk E: the force model and branch logic work; **the step that carries
computed motion into the body's persistent v/ω/position never executes for `rolling: true`
bodies.** Offered as evidence, not an asserted root cause.

**A hypothesis this desk raised and the frames REFUTED:** that the bodies are held stuck by
static friction (released from rest, `maxStat ≈ 7.99 N` vs drive `4.14 N`). S6 releases on
schedule and S7's ramp drives the body out of the static regime — and neither moves. Recorded so
no desk spends the same hour on it.

### Regression pair — clean, re-verified after the s0 edit
`rolling_friction` H2 0.22–0.38% · `work_done_by_constant_force` H2 0.00–0.07%, all baselines,
tolerance 2.0%. Still not evidence of engine health on the rolling path (both have zero
`rolling: true` bodies).

### State
Nothing sealed, nothing approved, no baseline written. `pure_rolling` needs B-1 + B-5 (+ B-2 for
its slider rows); `rolling_on_incline` needs B-3. **All four engine findings are Desk E's, and
none of them has landed yet.**

---

## 2026-08-05 (third round) — E2/E3 verification BLOCKED; STATE_7 phase window fixed; B-9 filed

**Committed and pushed** the B-8 s0 fix + docs as `a700f62` (surgical `git add` of the four named
files; the master-merge went up with it). The `.githooks/` auto-push hook had already pushed the
ref, so the explicit push was rejected as "already at a700f62" — local and remote verified
identical.

### E2/E3 — code confirmed, behaviour NOT verified

**PR #29 is OPEN, not merged** (`mergedAt: null`, head `feat/rotmech-0c3`). `desk:sync` merges
`origin/master` only and reported "master already current"; it did not list this desk at all.
Read-only inspection of the PR branch confirms **both changes exist** — `NLB_SLIDER_TOKENS` now
carries `R`/`R2`/`omega0` (E3) and `canRoll` now carries a `contactRest` term (E2). **Nothing
behavioural is verified**: not revival, not capture, not radius re-lift/re-scale/re-space, not
B-3. The PR branch was deliberately NOT merged into this worktree (unreviewed work; Rule 40; the
auto-push hook would publish it). Full verdict block in `_engine/findings_b.md`.

### Notice §6 — both halves now closed

The s0 half was already fixed and committed before reading the notice (B-8). The second half —
S7 pins at 1500 ms while its only phase window closed at `until_ms: 1361`, so the focal was
handed back before the reviewer screenshot — is **now fixed**: window extended to `until_ms:
2000` (the notice's option 1, minimal one-field diff). Verified on pixels — S7's frozen frame
now shows the wheel lit, t0/t1000/t2000/frozen hashes all changed, t3000 (outside the window
either way) byte-identical. `tsc` 0 · validate 151 PASS / 0 FAIL.

### B-9 filed — the pin is a flat 1500 for EVERY state, and the nlb reveal logic never runs

Measured `deriveMaxRevealTimeMs` directly: **1500 on all 16 states of both concepts**, including
states whose phases run to 2618 ms. Cause: `resolveField3dStates` wants `config.field_3d_config`
or top-level `config.states`, but the `_seed_<id>_cache.ts` convention writes
`physics_config: { epic_l_path }`, and `epic_l_path.states` carries no `newtons_laws_body` block.
So the entire nlb branch of `deriveStateMeta` is unreachable for every hand-seeded field_3d
concept — **including the approved `rolling_friction` / `work_done_by_constant_force` baselines**,
which use the identical seed shape. Same family as `2d4cb06`. **Not "fixed" by enriching this
desk's seeds** — that would diverge this desk's pins from the fleet mid-verification, and the
notice is explicit that moving the nlb pin is a fleet-wide call deliberately not taken.

**Five more states share S7's mismatch** (`pure_rolling` S4/S5/S6, `rolling_on_incline` S2/S4 —
pin 1500 after last window closes at 1200/1200/1400/1204/1100). Measured and recorded,
**deliberately not blind-fixed**: unlike S7 there is no capture being missed, and an unemphasised
settled end pose can be legitimate under Rule 32d. Re-assess when they can actually be seen.

### (this entry superseded by the 2026-08-06 post-merge entry at the end of the file)

### md5 discipline (task 4) — one methodological caveat worth keeping

`Motion map:` read all `?` — per notice §4, `[D5]` did not run, so B-4's blind spot is live and
the hash is the real check. Caveat found: **the explore state's dense frames are NOT comparable
run-to-run.** `pure_rolling` S8 produced entirely different dense hashes across two runs with no
S8 edit, while its `__frozen.png` stayed byte-identical (`7974ff8c94`) — the Rule 37 sandbox
free-runs on wall-clock; only the time-pinned frozen frame is deterministic. Guided states ARE
deterministic (S1 byte-identical across the same two runs).

---

## 2026-08-06 — POST-MERGE. E2 verified, E3 two-thirds verified, B-3 isolated.

PR #29 merged (`bd89d433`). **Containment confirmed independently of `desk:sync`**, which again
did not list this desk: `git merge-base --is-ancestor deb764b origin/master` → **ON_MASTER**,
`gh pr view 29` → MERGED, and the code on origin/master (`NLB_SLIDER_TOKENS` carries
`R`/`R2`/`omega0`; `contactRest` ×4). Merged origin/master into this desk by hand from **46
behind**. Triad after merge: renderer-syntax OK · tsc 0 · validate 151 PASS / 0 FAIL. Both Desk B
fixes survived (9 bodies at `s0 = −2.4`, S7 `until_ms: 2000`).

Re-seeded before every EYE run. Staleness proof: `sim_html` grew 4183986 → 4255010 (incline) and
4181111 → 4252135 (flat), so the new renderer really is under test.

### E2 — VERIFIED. B-1 FIXED.
`pure_rolling` S7 pre-merge `v 2.00 / Rω 0.00 / contact 2.00`; post-merge **`v 1.33 / Rω 1.33 /
contact 0.00 / f_k 0.00`**. That is capture at exactly `v₀/(1+k) = 2.0/1.5 = 1.333` for a wheel.

### E2 — DOES NOT FIX B-3, and that isolates it cleanly.
`rolling_on_incline` post-merge is **byte-identical to its own pre-merge frames** — S1
`f9a8b277`, S2 `e8987880`/`e72f7764`, S5 `8604265d`/`5e0bcce9`, S8 one hash `272d2ccb` across the
full 10 s sandbox. The same engine change that fixed flat-track capture left the incline
bit-for-bit unchanged. **B-3 is independent, CRITICAL, and has no engine owner.** (S8's hash did
move, `4ff923ec` → `272d2ccb` — that is E3's new slider rows rendering, not motion.)

### E3 — PARTIAL. B-2 FIXED; B-10 FILED.
Presence + initialisation verified on pixels: `pure_rolling` S1 renders `R = 0.25 m` (previously
NO control at all); incline S8 renders all six rows incl. `R`/`R₂` at 0.15 m, matching the
authored `radius_m`.

The **write** was driven directly (`src/scripts/_probe_e3_radius.ts` — sets `#nlb_r_slider`, fires
the DOM `input` event `nlbWireSlider` binds, clock pinned so before/after differ only by the
write; requested 0.50 clamps to 0.35). Result: engine `radius_m` 0.25 → 0.35 ✅, rolling
constraint preserved (ω 3.60 → 2.5714 so `Rω` holds 0.90) ✅, **re-scale ✅, re-lift ✅,
re-space ❌** — the marks and the `2πR` bracket are DESTROYED, leaving one stray tick and a
collapsed label artefact. Filed **B-10 (MAJOR)**. This is exactly what B-2's own suggested fix
warned about; two of its three parts landed.

### B-9 — reasoning replaced with the one that survives review
Not "the instruction said don't fix it." Notice §4 tells desks to enrich the seed, but its own
caveat says that restores `[D5]` only for scenarios WITH a motion branch — §4 names
`rigid_body_rotation` as one that has one and **`newtons_laws_body` as one that does not**. Desk
E's canaries are rbr; both of this desk's concepts are nlb. So enriching would buy **zero** `[D5]`
coverage while silently moving all 16 pins off the flat 1500, mid-verification. Confirmed
empirically: `Motion map:` read all `?` on both concepts even post-merge. B-9 stays fleet-wide and
unfixed here; it hits the approved `rolling_friction` / `work_done_by_constant_force` baselines too.

### Still deliberately unfixed
The five states sharing S7's pin mismatch (`pure_rolling` S4/S5/S6, `rolling_on_incline` S2/S4) —
no capture is being missed and a settled end pose can be legitimate under Rule 32d.

### State
**Checkpoint B deliberately HELD** (as instructed) — `pure_rolling` is 7/8 but S3 is still empty
(B-5) and the radius dial breaks the marks (B-10). Nothing sealed, no `visual:approve`, no
platform file touched, scoped cache clears only.

### Post-merge re-walk results (both concepts, full, every state)

**`pure_rolling` — 7 of 8 states read clean.** S7's capture is legible end to end:
`t0 v1.99/Rω0.02/f_k 0.49` → `t1000 v1.51/Rω0.99` → `t2000 v=Rω=1.33, contact 0, f 0`. Friction
is now actually acting during the slip (0.49 N) — pre-merge it read a dishonest 0.00. S1's
revolution marks + 2πR bracket + both formula lines render; the B-8 s0 fix is confirmed effective.
S2's cycloid cusp trace matches the authored aha. Only **S3 fails (B-5)**.

**`rolling_on_incline` — 1 of 8 moves.** Only S7's ring, and only AFTER its μ_s ramp drives it out
of the rolling branch.

### Two of my own records were wrong; both corrected in `findings_b.md`

1. **B-3's "S7's mesh is pixel-identical throughout" was WRONG.** It came from the first eye-walk
   and I filed it without checking. S7's dense hashes are five distinct values pre-merge
   (`17904384 e2af4a82 508469b5 1188eb23 1188eb23`) and five post-merge. **It sharpens the
   diagnosis:** S7 is the one body that LEAVES the rolling branch, and it moves the moment it does.
2. **B-9's framing was incomplete.** The pin genuinely is 1500 (`SET_TIME_FREEZE` rewinds the clock
   exactly — measured 3344 → 1500). But the frozen frame still showed formula lines authored at
   2300/2600. Cause: **the clock rewinds, the DOM reveals do not retract.** Filed as **B-11**.

### B-3's boundary, now sharp enough to dispatch
Not "incline rolling bodies never move" — **the `rollHeld`/`contactRest` branch's output never
reaches persistent state; the kinetic branch's always does.** Two bodies prove it by moving
(S3's `rotation_locked` block from entry; S7's ring after live branch transition) against twelve
that never do. And `contactRest` is NOT blocking them: S3's rolling disc reads `f = 1.38 N =
k·m·a`, the ROLLING closed form — so they are admitted to the branch and its formulas evaluate
correctly. **The defect is a write-back on one branch.** That is the dispatch.

### New findings
**B-10** (radius write destroys the marks — MAJOR, field3d_surgeon) · **B-11** (frozen frame is a
hybrid — MAJOR, platform) · **B-12** (friction subscript from held-state not branch — MINOR,
field3d_surgeon) · **B-13** (point_arrow labels overlap on S4/S5/S6 — MODERATE, **mine**) ·
**B-14** (μ_k glyph — MINOR, **mine**, low confidence, confirm before editing).

B-13/B-14 are Desk B's own and deliberately NOT fixed this session: the frames cannot be
re-verified until B-5/B-10/B-11 land, and fixing camera framing blind is the speculative retune
this desk has refused throughout. They belong in the pre-seal pass, together with authoring
`eye_capture_ms` per state (the sanctioned, non-diverging remedy for B-9 — see B-11).

### Regression pair post-merge — clean, and the deltas are proven vintage
`rolling_friction` 0.22–0.38% · `work_done_by_constant_force` 0.00–0.07%, all baselines,
tolerance 2.0% — **identical percentages to the pre-merge run**, which by notice §1's own two-run
method proves they are pre-existing baseline vintage, not engine drift. The engine merge caused
zero regression on approved work.

### Probes left in the tree (delete after the gate)
`_probe_e3_radius.ts` (reproduces B-10), `_probe_e3_crop.ts` (its evidence crops),
`_probe_pin.ts` (reproduces B-11).

---

## 2026-08-06 (narrow session) — B-5 hypothesis tested and corrected; pre-seal text audit

No EYE runs, no fixes, Checkpoint B still HELD.

### Task 1 — I tested my own B-5 hypothesis and half of it was wrong

Scanned all **74 `newtons_laws_body` states** in the fleet, read-only.

**REFUTED: "custom ids" is not the discriminator.** EVERY multi-body nlb state in the fleet uses
custom ids (A/B, P/Q, crate_a/crate_b…); not one uses `wheel`. `rolling_friction` S1–S5 are two
custom-id bodies, are APPROVED, and pass H2 — and I verified on pixels that its S1 renders both
meshes. My "every working state is single-body `wheel`" was true only *within* `pure_rolling`;
I over-scoped it to the fleet. **Had this gone out unchecked it would have sent the surgeon after
id resolution.**

**CONFIRMED AND SHARPENED: `single_lane: true` is the discriminator.** Only **2 of 74** states set
it — `pure_rolling` S3 and `rolling_on_incline` S3, both mine, both rendering **zero body meshes**.
All 35 multi-body states without the flag render fine.

**Second correction against my own record:** I had called `rolling_on_incline` S3 "the sharpest
positive control — the locked block dragging a skid mark." **Wrong.** Cropped 5×: at t0 and at the
frozen pin there is a moving pink force arrow and no body mesh. What moves is the position-derived
arrow, not the block. Both `single_lane` states show the identical signature. The genuine positive
control is `rolling_friction` S1, in a different concept.

**By id or by lane index? Neither — by authored activation instant.** `nlbRetireMs` returns
`Infinity` unless `single_lane`, so `nlbBodyLive` collapses to `t >= activateMs` — permanently
true for any body with no `activate_at_ms`. **`single_lane: true` is the ONLY way retirement can
become finite, hence the only way a body can stop being live.** That is why the defect is confined
to those two states, and why lane offsets are a false lead (both author `lane_gap_m: 0`).

**But retirement alone does NOT explain it.** For `pure_rolling` S3 the gate covers every instant
(locked live on [0,1500), roll live on [1500,∞)), yet the plank is bare at t=0 AND t=2000.
Something in the `single_lane` path suppresses the mesh even when `nlbBodyLive` is true. One
coincidence handed over: the frozen pin sits at exactly 1500, the boundary-exact handover instant.

### Task 2 — pre-seal text audit (no frames needed)

**Method note that changed the result:** `epic_l_path.scene_composition` text is NOT rendered for
field_3d — only `field_3d_config.states` reaches the canvas. A first pass flagged ~8 ASCII-math
violations that were ALL doc-only (scene_composition says "2 pi R" while the pixels show "2πR"
from `label`). Audit the rendered fields, not every string.

- **B-15 (MAJOR, mine)** — `rolling_on_incline`'s subtitle strip renders **authoring design notes,
  not narration**, in 7 of 8 states: millisecond timings, engine verbs (*halt-latches, retires,
  activates, re-synchronises*), raw world coordinates, and **`wu` (world units)**. Fails Rule 41c
  outright. `pure_rolling`'s eight labels are by contrast genuine teaching narration — same desk,
  same session. The `label` field was populated with the design table. Needs 7 rewrites.
- **B-16 (MINOR, mine)** — exactly one caption breaks Rule 34c: `rolling_on_incline` S2
  `"v equals R omega"` → `"v = Rω"`. The other 15 are clean.
- **B-17 (needs a RULING)** — the explore state exposes controls first taught in the advanced ring
  (`pure_rolling` v0/ω₀/μ_k; `rolling_on_incline` θ/μ_s). Not asserted as a violation — 38b's
  stated target is advanced *formulas*, and sliders are the explore state's job. Cheap either way.

**PASSES:** Rule 35 (zero culture hits, universal anchors) · Rule 38a (advanced ring contiguous
and immediately before explore in both; explore tagged core) · Rule 38g (5 curriculum rows each,
**0** unverified rows missing `needs_teacher_verification`) · prerequisites (both name JSON-less
ids per the founder ruling — 3 each).

### State
Nothing fixed. B-13/B-14 still deliberately unfixed; no `eye_capture_ms` authored (gated on B-11).
The dispatch queue is unchanged: **B-3** (incline motion), **B-5** (now a `single_lane` dispatch,
not an id one), **B-10** (radius write destroys the marks), **B-11** (hybrid frozen frame).

---

## 2026-08-06 (E11 session) — B-3 closed, B-15/B-16 fixed, B-17 blocked, B-18 filed

Containment confirmed independently (`desk:sync` skipped this desk again, 5 behind):
`merge-base --is-ancestor ccb2b65 origin/master` → ON_MASTER, `ba12073` on master. Merged by
hand. Triad clean, both Desk B fixes survived, `sim_html` 4255010 → 4257634.

### E11 VERIFIED — B-3 CLOSED
`rolling_on_incline` is alive on all 8 states. Verified on the **meshes**, not on hashes: cropped
5× to defeat the overlay trap, at t=0 the four bodies cluster at the top of the incline and by
t=2000 they have separated into the authored finish order — solid sphere, disc, hollow sphere,
ring. S8 now yields 10 distinct hashes where it had one.

`pure_rolling` non-regressed — but **not** byte-identical, and the hashes misled me. S1/S3/S7 all
changed. Measured properly: pre-E11 vs post-E11 deltas are 0.000–0.021% frozen and 0.042–0.137%
dense against a 2.0% tolerance. **No visible change.** S7's capture readouts unchanged.

### B-18 filed — md5 is over-sensitive, and it corrects my own method note
Two runs, no change between: **6 of 8 states give different dense hashes**, S7's frozen too. But
pixel deltas are 0.000–0.021% (frozen) / 0.013–0.128% (dense) — sub-threshold render noise. S7
even oscillates back to its exact pre-E11 hash. So "hashes differ" proves nothing; only the dead
direction survives (one hash across a series ⇒ dead scene). **Corrects my earlier note** that
"explore dense frames aren't comparable run-to-run; guided states are deterministic" — both
halves wrong: S8 is deterministic and 4 of 6 noisy states are guided. The earlier S8 difference
was the E2/E3 engine merge sitting between those runs, not nondeterminism. H2 at 2.0% is safe.

### B-15 FIXED — 8 narration rewrites (not 7; S8 was also out of budget at 18 words)
Every ms timing, engine verb, raw coordinate, `wu` and ASCII variable removed. All 8 labels now
39–43 words (Rule 31: 25–55). Re-scan shows zero residual hits. Not yet seen on pixels — a
re-walk is owed once B-5/B-10 land.

### B-16 FIXED — `"v equals R omega"` → `"v = Rω"` in both the caption and its delta_cue mirror.

### B-17 BLOCKED — the ruling assumes a mechanism that does not exist
First half applied (controls kept). Second half cannot be: **no `presets` field in the schema,
zero concepts author one, and no code reads `depth_ring` at all.** An existing scar row says it
verbatim — *"a ring cut is discharged by RING ASSIGNMENT, never by a field… with no hiding
mechanism assumed anywhere."* Authoring a presets block would fabricate a shape nothing consumes.
**Nothing authored.** Three real options recorded in findings for a founder decision.

### Task 4 — pure_rolling walked to the gate
quality-auditor ∥ eye-walker dispatched on the twice-verified post-E11 run
(`.visual_runs/pure_rolling/20260806-024318/`). No third capture: the concept JSON is unchanged
since that run (only `rolling_on_incline` was edited). **Checkpoint B HELD** pending B-5.

### Queue
**B-5 → B-10 → B-11**, plus B-17 awaiting a founder decision. B-3 dropped (closed).

### Pre-seal gate results — quality-auditor VERDICT: FAIL, 9 new findings

Ran ∥ the eye-walk on the twice-verified post-E11 run. PASS: gates 1/2/3a/7/9/10/12/14/16–18 and
all 8 registration sites (drift-free; `PCPL_CONCEPTS` correctly absent, `PILOT_CONCEPTS` 0 hits,
`visual_baselines/` empty — all correct for an unsealed concept). Console clean across 8 states on
port 8111. Layout 0 collisions. Word budget + delta cues within Rule 31 on all 8.

**FIXED this session (both verified independently before acting):**
- **N2 — the session's most consequential finding, and mine.** Rendered narration quoted arrow
  **world-unit lengths as speeds**: S2 said the centre arrow reads "0.55 m/s" when the canvas
  reads 0.60 (0.60 × 0.92 = 0.552); S6 said "1.84 m/s (2v)" and "0.92 m/s (v)" when v = 1.0, so
  2v = 2.00 (2.00 × 0.92 = 1.840). S6 self-contradicted. **On the PRIMARY aha state the sim was
  telling the student a number the screen does not show.** Had propagated into
  `aha_moment.visual_confirmation` and S2's `misconception_watch.visual_counter` — the aha's own
  stated visual proof. 4 strings fixed; grep now returns 0.
- **N5 — supersedes B-14 with the opposite fix.** B-14 guessed the label needed a new glyph. The
  engine default is already correct (`glyph: "μₖ"`); the concept was OVERRIDING it with ASCII.
  **Deleted the key.** B-14 CLOSED.

**Filed, NOT fixed:**
- **N1 (MAJOR, engine)** — 13 of 15 glow windows name unregistered roll-layer children, so they
  match nothing yet still set `glowActive`, dimming the ENTIRE overlay layer to 40% with nothing
  lit. The skeleton's whole §3 glow-walk is inert, and the mitigation adopted for the existing
  scar row is defeated because `phases[].glow_focal` reads the same variable as the state-level one.
- **N3 (MAJOR, architect)** — framed extent = full run + one body diameter for a 0.5 m body puts
  the wheel at 15–30 px. **This is the parent of B-13, B-19 and one OPEN queue row** — four
  symptoms of one design rule. Needs an architect decision, not per-state camera tweaks.
- **N4 (MODERATE, mine)** — all seven assessment answers keyed "A"; an all-A student scores 100%
  on pre- and post-test. Deliberately not fixed: `distractor_misconceptions` is keyed BY LETTER,
  so a careless reshuffle silently detaches every distractor from its misconception. Needs its own
  pass, not a find-and-replace at the end of a long session.
- **N7/N8/N9** — S5 has no `readouts` at all; S8's narration references advanced-ring content
  (breaching 38a independently of the B-17 ruling); Rule 41 register in two S1/S8 strings.
- **N6 — a DISAGREEMENT, recorded not silently resolved.** The audit treats `label` as a rendered
  surface (so Rule 30's expand-symbols carve-out would not apply); this desk's filed position
  (B-16) is that `label` IS the subtitle-strip narration, where Rule 30 requires it. Opposite
  instructions from two defensible readings — needs a doctrine call.
- **Gate 0**: the DoD's "turns counter" is UNBUILDABLE (no `turns` member in the `readouts` enum)
  and DoD (i-1)'s preset-coherence argument leans on it; S3's HUD prints `f_k` for both bodies, so
  **B-12 manifests on this concept too**, not only on the sibling.

---

## 2026-08-06b — N4/N7 landed; N2 audit extended to the sibling

**Sync: checked, not assumed.** 0 behind `origin/master` (994bb8f is a strict ancestor of HEAD) —
a master merge had already landed, so nothing to sync; `desk:sync` skipped the desk as usual. The
"21 behind" figure did not match the repo. Triad on the merged tree: renderer syntax OK · tsc 0 ·
151 PASS / 0 FAIL.

**B-15/B-16 were already done** (commit `0eed746`, two before the last — which is why the final
commit message didn't mention them). Verified on disk: all 8 labels 39–43 words and clean; S2
caption `"v = Rω"`.

### N2 extended to rolling_on_incline — clean of wu, but the register leak was wider than B-15
Rendered strings carry no world-unit values: the only numbers left are shape factors k and masses,
all genuine. **But the design-table register had also reached `misconception_watch`, which the
label rewrite never touched** — S3's `visual_counter` said "the instant the block **retires**", and
`aha_moment.statement` said "decides who **wins**" (Rule 41a bans personification by name). Both
fixed. Lesson: B-15 was scoped to `label` because that is where the audit looked; a register
defect from one authoring habit appears in every field that habit touched. **Audit by defect
class across all fields, not by the field the finding names.**

The validator then caught my own fix — the first `aha_moment.statement` rewrite killed the
personification but ran 24 words against a ≤15 gate. Corrected to 13. Second time this session
that running the gate, rather than trusting the edit, caught the defect.

### N4 FIXED — keys now C A D B A C B (all four letters)
Was A A A A A A A: an all-A student scored 100% on both pre- and post-test. **Verification method,
which is the part that matters:** `distractor_misconceptions` is keyed BY LETTER, so the script
built `option text → misconception text` for every question before the edit, rebuilt it after, and
asserted identity — any detachment aborts the write. **HELD for all 7.** Diff is 28/28 lines with
zero changes outside the option/correct keys; q1 spot-check shows each distractor still on its
intended misconception. Script kept at `src/scripts/_probe_rekey_assessment.mjs`.

### N7 half fixed — the other half is engine-owned
S5 was the only state with NO `readouts` key (verified against all 8). Added
`["v","omega","Romega"]`, matching S1/S6, so the HUD now reads v = 0.00 · ω = 4.00 rad/s ·
Rω = 1.00 m/s — the state's claim made numeric, and Rω = 0.25 × 4.0 = 1.00 explains the 1.00 m/s
the point labels print. Rule 33d satisfied.

**NOT fixed:** point labels print `nlbFx(Math.abs(pv), 2)`, so S5's top and bottom both read
1.00 m/s and the opposite directions rest on two arrow stubs. That `Math.abs` is in
`field_3d_renderer.ts` — a platform file. Filed as the engine half of N7
(`peter_parker:field3d_surgeon`). It interacts with N3 (the stubs are ~50 px at the authored
camera) but must NOT be fixed by re-authoring the camera — N3 is architect-owned.

### Untouched by instruction
N1, N3, B-5, B-10, B-11, B-13, B-19 — all routed. No per-state camera patched.

### State
Checkpoint B HELD on both concepts. Nothing sealed, no `visual:approve`, no platform file touched.
No EYE run this session — the four fixes are text/config only and the frames cannot be re-verified
meaningfully until B-5/B-10/B-11 land; a re-walk is owed then.

---

## 2026-08-07 — defect-class sweep at full scope; authoring side CLOSED

Checkpoint B HELD. No EYE run (both concepts blocked on Desk E / architect; frames cannot be
re-verified meaningfully until B-5/N1/N3 land — a re-walk is owed then).

### The doctrine applied at full scope — and it paid off exactly as predicted
`src/scripts/_probe_defect_class_sweep.mjs` walks EVERY string field of BOTH concepts against four
classes at once: world-unit numbers · internal units · engine verbs / ms timings · Rule 41a
personification. **14 hits → 6, all 6 survivors verified false positives.**

Last session I fixed competitive personification in `aha_moment.statement` only. The same habit was
alive in **six more fields**: `real_world_anchor.primary`, `epic.S1.scene_composition`, **the SPOKEN
`tts_sentences[3].text_en`**, `epic.S8.scene_composition`, and TWO `assessment.parallel_form_stem`s
("are let go together" — 41a bans it by name; "Which one wins the race?"). **Only one was the field
the original finding named.** Scoped to `label` again, five would have shipped.

Survivors dismissed with reasons so they are not re-chased: "stamp" and "param_ramp" sit in
`physics_engine_config`, which the renderer **never reads** (grep: no hits); "know" is about a
student; "like" ×2 is comparison; "lose" is the physical verb in "lose contact".

### N6 RESOLVED on evidence, not preference
The open disagreement — is `label` narration (Rule 30, expand symbols) or an on-canvas surface
(Rule 34c, Unicode)? Settled by reading the renderer: `field_3d_renderer.ts:66507` composes
`stateDef.label` into `legendEl.innerHTML` — the legend overlay **drawn inside the sim** (the
bottom-left box carrying "Drag to rotate"). The spoken channel is a **separate field**,
`tts_sentences[].text_en`. **Both rules apply, to different fields; there was never a conflict.**
Fixed the rendered labels accordingly: `m/s squared`→`m/s²`, `omega`→`ω`, `v0`→`v₀`. ROI S6's label
restated the formula in words — rewritten to point at the formula surface, which also satisfies
Rule 34b (one formula surface, never duplicated).

### Ledger written into findings_b.md so the gate reads unambiguously
**CLOSED (Desk B authoring):** B-8, B-14 (superseded by N5), B-15, B-16, N2, N4, N5, N6, N7
authoring half, N9, + the sweep.
**OPEN but blocked on a RULING, not on work:** B-6 (Unicode has no subscript c — recommendation
recorded: keep `I_cm`, treat 34c as admitting a documented no-glyph exception), B-17 (no preset
layer exists), and **N8 is subsumed by the B-17 ruling** — a dial you may show is a dial you may
name, and nothing reduces anything today.
**ROUTED AWAY:** B-5, N1, N3, B-10, B-11, B-12, B-13, B-19, N7 engine half. **N3 is the architect
parent of B-13 + B-19 + the open close_camera row — four symptoms, one design rule.** No per-state
camera patched.
**B-18 resolved by Desk E** — 88/88 equal hashes on pixel-identical adjacent pairs: within-run
adjacent comparison sound, never across runs. Dead-scene findings stand, no re-derivation needed.

### Verify
tsc 0 · validate:concepts 151 PASS / 0 FAIL · both concepts PASS. The gate caught nothing this
time because the previous session's lesson held: run the gate after every edit, not at the end.

---

## 2026-08-13 — B-5 verified on pixels; owed re-walk running; decision briefs filed

**Sync:** `9e77023` (B-5, PR #121) confirmed ON_MASTER by merge-base; merged 430 commits by hand,
zero conflicts. Triad: renderer syntax OK · tsc 0 · validate **155** PASS / 0 FAIL (fleet grew).
Both desk fixes intact. Re-seeded both concepts (`sim_html` → ~5.04 M chars, new renderer under
test); THE EYE 36/36 on both.

### B-5 PARTNER VERIFICATION — verified in BOTH directions, from dense frames
Per the known limitation (the reveal pin cannot photograph the first half of a single_lane state),
verified from dense frames, ink-pixel counts + crops on `pure_rolling` S3:
- **Positive:** real ink at every timestamp — 556/581 px during the locked window [0,1500),
  297–346 px during the roll window, vs the S1 single-body control at 418–455 px. Previously a
  bare plank at every frame.
- **Negative:** during the locked window the RED "locked wheel" renders with its skid mark and the
  green roll body reads ZERO ink; after 1500 the GREEN "rolling wheel" renders and the red is gone.
  One body per window, exactly as authored. The ink drop at the handover (581→297) is the
  single-occupancy signature — double occupancy would read ~double.
**B-5 CLOSED as verified on this desk's own concept.** The eye-walkers are extending this to
`rolling_on_incline` S3 and judging whether both S3s now TEACH their claims.

### Decision briefs filed (findings_b.md top) — B-6 · B-17/N8 · N3
Each one decision, desk recommendation first: B-6 → keep `I_cm`, amend 34c with a no-glyph
exception (v_cm/a_cm recur immediately); B-17/N8 → accept as-is, both halves become preset-aware
in one pass when a preset layer lands; N3 → amend the CAMERA RULE to budget glyph height (one
architect dispatch + one pass fixes B-13 + B-19 + the close_camera row + N7's residue), with the
engine-side label-separation floor as complement, never per-state patches.

### Awaiting: two eye-walker reports (full 8-state re-walk each, survival list for N1/N3/B-12/
B-13/B-19). Checkpoint B still HELD — no seal, no visual:approve.

### Re-walk complete — both halves filed (2026-08-13)

**B-5 fully CLOSED**: verified both directions on BOTH consumer concepts (pure_rolling S3 ink
counts + crops in the main session; rolling_on_incline S3 by the walk — block alone with skid
trail pre-1500, disc alone markless after). Both S3s now teach their claims.

**pure_rolling survival:** N3 + B-19 + B-13 survive (collision now a 3-label stack on S4/S5/S6/S8,
2-label on S2 the PRIMARY aha; luminance flat so it is pure layout, not dimming). N1 NOT
reproduced this run — inconclusive, not cleared. B-12 largely resolved on the locked wheel. No new
findings. (Walker mis-attributed the PRIMARY aha to S6; JSON says S2 — corrected in the report.)

**rolling_on_incline survival + new:**
- **B-20 NEW CRITICAL** — `finish_line.stamp:"order"` renders stacked "TIE" glyphs (S1 ×3, S5 ×2);
  S1's whole claim is the fixed ORDER. Verified by 3× crop in the main session. Closes the loop on
  this desk's 2026-08-06 flag ("TIE-like stamps in S1"). Engine-owned; authored JSON is correct.
- **B-12 recurs, sharpened**: the generic HUD panel hardcodes f_k regardless of regime while the
  per-arrow labels are correct — panel path is regime-blind.
- **B-21 NEW MODERATE** — dark-maroon friction labels near-camouflaged on the grey incline.
- **B-22 NEW AMBIGUOUS** — S4 (PRIMARY aha) is a physics-true tie (centroid gap fixed ~21 px) that
  READS as one sphere ahead due to the lane offset. Founder judgment, deliberately unrouted.
- The walk's `I_cm` "new" row is open B-6 (Brief 1) — not re-filed. Camera rows fold into N3
  (Brief 3).
- Numeric physics verified exact across S2/S5/S6/S7/S8.

**Queue state: Desk B's authoring queue is EMPTY.** Every remaining blocker is engine-owned
(B-20, B-12, B-21, B-13/B-10/B-11/N1), architect-owned (N3 → B-19), or a founder ruling
(B-6, B-17/N8, B-22, and the N3 camera-rule decision per Brief 3). Checkpoint B HELD.
