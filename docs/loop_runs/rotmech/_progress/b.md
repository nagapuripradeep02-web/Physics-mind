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
