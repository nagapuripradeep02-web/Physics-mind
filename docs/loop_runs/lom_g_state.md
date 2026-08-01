# lom-g loop state — Laws of Motion, off-axis forces tray

updated: 2026-08-01 (**PHASE 2 BUILT — `uniform_circular_motion` authored, audited, fixed and
         re-verified. AWAITING FOUNDER REVIEW.** The Phase-0 success criterion HELD: the concept
         needed **ZERO renderer edits**. Two content FAILs found and fixed in one cycle; three
         engine findings reported and NOT dispatched — the runaway guard is at its limit.)

---

## PHASE 2 — FOUNDER REVIEW ROUND 1 (2026-08-01) — "circular motion is really good", TWO defects raised, BOTH FIXED

Founder watched the sim and raised two things. Both were real; both are fixed and re-verified.

### 1. "There should be a realistic way of cutting the thread" — 4 engine commits

The founder's words: *"in the third state, there should be a realistic way of cutting the thread, and
it's moving in a straight line. Everything should be realistic… I feel like I'm moving the graphics.
At the same time, physics computed."* They **explicitly authorised** going past the runaway guard for
this. Four `field3d-surgeon` commits, one `bug_class` each, run SEQUENTIALLY (same file region, and
`feat/lom-f-momentum` edits it concurrently):

| commit | what |
|---|---|
| `7d24724` | the frozen-frame capture actually reaches its pin (see the FLEET finding below) |
| `910535c` | post-cut flight envelope **1.4 s → 5.5 s**: rimless fading sheet, release azimuth solved backwards so the departure is always across-screen, framing follow on the rig's display node |
| `fb259a6` | one rimless sheet for EVERY flat state (Rule 32d continuity) + the pin gate re-keyed to the ENGINE clock |
| `5716010` | **the string is now visibly SEVERED** instead of vanishing |

**The severing is derived, not animated.** The string is a *constraint* in this engine, not a body, so
at the cut there was literally nothing left to draw. The fix draws the two lengths from the kinematics
that ARE determined at that instant: the post-side keeps the angular velocity it had (starting at
exactly the pre-cut rate, so nothing jumps) and settles onto the sheet; the ball-side stub is dragged
off tangentially. They are continuous at τ=0 and part immediately, so the eye sees the thread part at
the point it was cut. No spark, no flash, no blade (Rule 24/34); nothing scales (Rule 29).
**The ball is untouched — measured 1.8000 m/s at every sample from τ = −200 ms to +1600 ms**, with
T going 12.96 → 0.00 exactly at the cut. The straight line is still the integrator's output.

### 2. "Do the subtitles synchronize with the picture, or is it desync?" — YES, IT WAS. ~17 s off.

**The founder caught a defect BOTH review agents missed.** Measured against the player's own
clock-driven subtitle path (`activeSiAt(t)` advances on the state clock even when audio is silent):
`"Now the string is cut."` was displayed at **2.4 s**; the string was actually cut at **19.6 s**; the
payoff got **1.4 s** at the very end of a 21 s state.

Re-timed (`3505a78`): cut moved to **12800 ms**, landing exactly under the sentence that announces it;
duration 21 → 18 s; flight 5.2 s (≤ 5.5 cap); pin 15800 ≤ 18000, leaving 2.2 s of flight visible after
it; consequence narrated WHILE the straight line is on screen. 45 words, in band.
The static caption and bottom-left label were deliberately KEPT — they are state placards summarising
the whole beat (STATE_2's cue behaves identically), and only a clock-synced subtitle can contradict
the picture.

**GATE GAP, worth more than this concept:** quality-auditor and eye-walker both check frames, gates
and per-state deltas. **Neither checks narration-against-event alignment, and there is no gate that
does.** A state can announce an event 17 s before it happens and pass every check. This is the second
"the machine cannot see it" finding on this tray, alongside the D5/motion one.

### 🚨 FLEET FINDING — my diagnosis was WRONG, and the truth is much wider

I filed the STATE_3 pre-cut frozen frame as "the pin path does not reproduce the release". **That was
wrong** — the release always fired correctly at 19600 ms. `field3d-surgeon` disproved it with a probe
and found the real mechanism:

Under a `SET_TIME_FREEZE` pin the sim crawls **one fixed 1/60 s step per rendered frame**, and headless
Chromium delivers ~18 fps → **~290 ms of sim time per wall second**. A 20800 ms pin therefore needs
~75 s of real time. `captureFrozenFrame` polls for `at_ms*2.5+4000` ≈ 56 s and **then screenshots
anyway, discarding its own `poll.reached`**. Solving `0.29·(2.5·at + 4000) ≥ at` shows **every pin past
~4.2 s was a coin flip.** Last session's FIX A made this fatal for the PRIMARY capture path; the
frozen-frame path was never covered.

**Blast radius, measured by me across the fleet** (`_scratch_pin_blast_radius.ts`, untracked):

| | |
|---|---|
| states with pin > 4200 ms | **307 of 845** |
| concepts affected | **87 of 149** |
| …of which BASELINE-LOCKED | **45 of 75** |

**This retro-explains a mystery this tray already filed.** `electric_potential_meaning` was recorded
last session as NON-DETERMINISTIC (STATE_6 H2 at 2.31–2.90%, "cannot distinguish a regression from
noise"). Its pins are 19–20 s. It was never an unstable baseline — it was this capture lottery.

**Honest limit: 307 is an upper bound on EXPOSURE, not a count of corrupted baselines.** Reachability
depends on per-scenario frame cost, and `eddy_currents` (24 s pin, baseline-locked) reproduces 12/12
H2 at 0.00% — either it is cheap enough to reach its pin, or its content is static near the pin so an
off-pin frame looks identical. **Which of the 307 are actually wrong needs measuring.**

The renderer-side cure landed here (compressed deterministic replay, force_rig-gated). **The TOOLING
half is filed OPEN and NOT fixed** — `capture_frozen_frame_ignores_its_own_poll_result_and_photographs_off_pin`,
which still affects EVERY renderer. It is `visual_eyes.ts` = Rule 40 PLATFORM, belongs on master.
**FOUNDER CALL.**

### Two engine findings still OPEN on this concept

- **`force_rig_whirl_tension_arrow_illegible_at_floor_band_magnitude`** (MODERATE) — unchanged and now
  the most visible remaining flaw: **STATE_1's caption reads "Tension pulls inward, always" and the
  tension arrow is essentially invisible** at its constant T = 13.50 N. The state's own claim is the
  one thing a teacher cannot see. Verified by eye on `20260801-171738/STATE_1__frozen.png`.
- **Candidate J** (LOW, new) — states whose reveal pin is BELOW the 2000 ms catch-up threshold
  (STATE_1/4/7 here, all at 1600 ms) skip the deterministic rewind and keep pre-freeze phase jitter;
  STATE_1's frozen frame varied 0.005–0.175% across runs. Under the H2 2% tolerance so it fails no
  gate today, **but it means a short-pin baseline is minted from one of several possible phases — know
  this before approving any baseline.**

### Verification after all five commits
`tsc` **0** · `validate:concepts` **148 PASS / 0 FAIL** · `check:renderer-syntax` **OK ×3** ·
THE EYE **31/31** on three consecutive runs · **all 7 frozen frames 0.000%** across runs A-vs-B and
B-vs-C (A-vs-C differs only on STATE_1 at 0.005% = Candidate J) · regression `eddy_currents`
**38/38, all 12 H2 at 0.00%** · `equilibrium_of_particles` (the founder-approved `force_table`
sibling) **31/31**, untouched by every diff · review link rebuilt and verified **OVER THE WIRE**
(new narration present in the served page, old absent, `at_ms: 12800` in the served sim).

**Standing lesson recorded:** an md5 diff of two PNGs answers "are these bytes equal", NOT "does this
picture differ" — encoding metadata alone diverges the hash. I filed a fleet-wide non-determinism
claim on hashes and had to retract it after `pixelmatch` showed 52/137 frames pixel-identical and only
`STATE_3__frozen` genuinely unstable. **Never file a determinism verdict on hashes.**

---

## PHASE 2 — `uniform_circular_motion` — BUILT (pre-review record below)

**Review link: http://localhost:8093/uniform_circular_motion/** (rebuilt after the fixes and verified
OVER THE WIRE — the post-fix string is present in the served `sim.html` and the pre-fix string is
absent, so this is not last session's stale-link trap.)

### The headline: the engine generalized. Zero renderer edits.

`force_rig`'s whirl branch served the entire concept as pure JSON. Phase 0's stated criterion —
"`uniform_circular_motion` must require ZERO renderer edits after `equilibrium_of_particles` seals,
or the design under-generalized" — is **met**. No renderer file was touched at any point in Phase 2.

### Pipeline + verification

architect → physics-author → json-author → (quality-auditor ∥ eye-walker) → fix cycle → re-verify.
No founder-proxy on this tray (founder review per concept, as lom-c/d/e ran).

| gate | before fixes | after fixes |
|---|---|---|
| `npx tsc --noEmit` | 0 | **0** |
| `npm run validate:concepts` | 148 PASS / 0 FAIL | **148 PASS / 0 FAIL**, target zero warnings |
| THE EYE | 31/31 exit 0 | **31/31 exit 0** |
| STATE_6 dead tail | 11 s of 20 s (55%) | **7 s of 15 s (47%)** |

**physics-author measured before authoring** (the sibling's standard, repeated): all four unverified
assumptions (V1 whirl `param_ramp` reveal pin = `end_ms + 1600`, confirmed by direct code read AND a
live call; V2 the clamp funnel IS taken by a down-ramp, not just a slider write; V3 the ω slider
handle tracks a live ramp; V4 post-cut flight stays on the widened plane, edge measured at ≈1.52 s
→ hard rule "never exceed 1.5 s") came back favorable. **No fallback was invoked and no architect
number needed correction.**

### quality-auditor: FAIL → 2 MEDIUM content findings, both fixed in ONE cycle

- **F1 — STATE_7 surfaced `T = m ω² L`**, a relation derived only at STATE_5 (outside the `core_only`
  cut) and contradicting its own value-only HUD (`r = 0.790 m` beside a formula in `L = 1.00 m`).
  Routed to architect as pass-1. **Ruling: STATE_7 surfaces NO formula** (the deliberate S1/S3
  pattern). **Substituting STATE_2's `T = m ω² r` was considered and REJECTED as a PHYSICS ERROR on
  this apparatus** — on the cone `T sin θ = m ω² r` with `r = L sin θ`, so `T = m ω² L ≠ m ω² r`
  (24.0 N vs ~19.0 N at the authored values; the live HUD would refute the surfaced formula every
  frame). Worth keeping: the architect's own §12 i-2 self-check missed this because it tested that
  the SYMBOLS were core-established, not that the RELATION was.
- **F2 — STATE_6 was byte-frozen for 11 of its 20 s.** Measured independently twice (auditor +
  orchestrator, agreeing). Cause is physical: at ω ≤ ω_min, cos θ = 1 ⇒ θ = 0 ⇒ r = 0, so the bob
  hangs on the axis and revolution at zero radius is indistinguishable from a frozen frame. Fixed by
  PACING, not by touching the measured ramp: narration 46 → 35 words, duration 20 → 15 s.
  **Residual is physics-imposed and accepted:** motion ends ~7 s (the ω_min crossing lands at ~72% of
  the ramp), and the reveal pin forces duration ≥ 10.8 s, so ~7 s of hold remains. It is not padding —
  it is the payoff (hanging bob + amber `ω min = 3.13 rad/s`) held while the last two sentences
  describe it, which is a legitimate Rule 26 final-picture hold.
- F3/F4 (LOW, fixed): STATE_1 named "the balanced ring" — the SIBLING's apparatus, not on screen — and
  used "zero sum" as an idiom; STATE_4 personified gravity ("Gravity joins the picture" / label
  "Gravity joins:"), Rule 41a.

**Auditor settled the two claims that mattered.** (1) *No outward force anywhere* — **SURVIVES**, and
it re-established this INDEPENDENTLY rather than citing the physics block's harness proof (whose
source grep is itself an OPEN bug row): every rendered string yields 3 hits, all negations;
`centrifugal` authored nowhere; every arrow across ~31 frames is T→anchor, W↓, v tangent, or ΣF
horizontal-inward. (2) *Rule 38 i-1* — the conical explore picture is **ACCEPTED; do NOT take the flat
fallback**, which would cost the founder-named ω_min clamp beat for no gain.

### 🚨 THREE ENGINE FINDINGS — reported, NOT dispatched (runaway guard at its limit)

**All three are `[owner: peter_parker:field3d_surgeon]`.** The tray's guard is AT its limit (9 engine
commits) and the state file already records that any FURTHER engine fix here needs an explicit founder
call. **None was dispatched. FOUNDER CALL.**

1. **`force_rig_whirl_release_not_reproduced_under_set_time_freeze_pin` — CRITICAL.**
   STATE_3 is the PRIMARY AHA (cut the string). Its `__frozen.png` — the canonical reveal photograph,
   and the future H2 baseline — shows the **pre-cut orbit** (`T = 12.96 N`, string intact).
   **eye-walker found it but hypothesised a stale `simulation_cache`; that hypothesis is WRONG and was
   disproved before filing:**
   - the cache was cleared and re-seeded from the current JSON minutes before the capture — twice;
   - `deriveMaxRevealTimeMs` on the concept JSON returns **STATE_3 = 20800 ms** (= `release.at_ms`
     19600 + 1200), and THE EYE's own streamed **Reveal map** line confirms `STATE_3=20800ms` was the
     pin actually used;
   - the concept authors no `eye_capture_ms` override;
   - `STATE_3__dense_t20000.png` — the SAME sim time — shows the cut CORRECTLY (`T = 0.00 N`,
     `v = 1.80 m/s` unchanged, bob off the ghost circle with a trail).
   So the dense path integrates through the release and gets it right; the `SET_TIME_FREEZE` pin path
   does not reproduce the constraint-deletion event. **Same defect CLASS as last session's E1**, which
   `frResetTrajectory` fixed for the `param_ramp` / `phases` beats — the `release` beat was never
   covered. **Impact is baseline integrity, not teaching:** a teacher pressing play sees the cut
   correctly, but locking baselines now would freeze a pre-cut frame as the aha's regression baseline —
   the same blind spot that let seven dead states pass 31/31 last session.
2. **Non-determinism — CONTROL RUN DONE. The scope is NARROW, and an earlier reading of mine was
   WRONG; this is the corrected version.**
   A third EYE run with **identical code, identical JSON, identical cache** was captured and compared
   against run 2. **A first pass by md5 said "137 of 137 frames differ" — that was misleading and is
   retracted: md5 also catches PNG encoding metadata.** Re-measured with `pixelmatch` on actual pixel
   content (`src/scripts/_scratch_ucm_determinism_all.ts`, untracked):

   | | result |
   |---|---|
   | frames compared | 137 |
   | pixel-IDENTICAL | 52 |
   | genuinely differing | 85, all small (0.13 % – 0.98 %) |
   | **frozen frames (= the H2 baseline source)** | **ALL 0.000 % EXCEPT `STATE_3__frozen` at 0.289 %** |

   **This is the fact that matters:** THE EYE builds H2 baselines from the FROZEN frames
   (`visual_eyes.ts` → `frozenFrame: { atMsByState: maxRevealMsByState }`). Six of seven are perfectly
   reproducible. **Only STATE_3's — the `release` state's — is both WRONG (pre-cut) and UNSTABLE.**
   So findings 1 and 2 are ONE defect with one root cause, localized to the whirl `release` beat under
   the time pin — **not** a general engine non-determinism, and **not** a bar to baseline-locking the
   other six states. The earlier "cannot be baseline-locked" conclusion is withdrawn.

   **Residual, LOW and separate:** dense frames of the ramped/conical states (S2, S4, S5, S6, S7)
   jitter 0.1–1 % run-to-run — consistent with sub-step jitter in the conical branch's
   velocity-Verlet + SHAKE/RATTLE micro-stepping (2 ms × 8 per shared step, build note 5). Dense frames
   are NOT the H2 baseline source, so this does not threaten regression protection. Worth a row, not a
   dispatch. Note STATE_1 (flat, steady) and STATE_3's dense frames are pixel-identical throughout —
   the jitter tracks the ramp/cone, not the engine as a whole.
3. **`force_rig_whirl_tension_arrow_illegible_at_floor_band_magnitude` — MODERATE.**
   At floor-band magnitudes (~11.5–17 N) the tension arrow is too SHORT to read direction at all,
   independent of the shaft/string colour fix. Worst in **STATE_1**, where T = 13.5 N is constant for
   the whole state — so the state's own delta cue ("Tension pulls inward, always") is the one thing a
   teacher cannot see. eye-walker confirms the `7c6bbb3` mesh-shaft fix DOES generalize to the whirl
   branch at mid/high magnitudes; this is the narrower residual.

**Owner-tag correction, for the second session running:** eye-walker filed its rows under
`peter_parker:renderer_primitives`, which maps to `pcpl-surgeon` (2D parametric owner) and would have
REJECTED the scope. Both root causes are in `field_3d_renderer.ts` → `field3d-surgeon`. The auditor
independently caught two further OPEN rows carrying the same mis-tag and supplied retag SQL.

### The highest-leverage item is NOT about this concept

quality-auditor's scar candidate A: **THE EYE writes every pixel needed to answer "did anything move"
and compares none of them.** Three numbers per state — distinct-hash count, last-change ms, and that
as a fraction of duration — would have caught F2 in the same run that reported 31/31, and would have
caught last session's seven dead states. $0, renderer-agnostic, and **immune to the missing
`field_3d_config` that darkened D5**. Platform work for master (Rule 40), not this branch.
(D5 itself is still dark: this run's **Motion map printed `STATE_1=? … STATE_7=?`** — all skipped.)

### Phase 2 artefacts
`docs/loop_runs/lom_g/uniform_circular_motion/` → `01_architect_skeleton.md` (§12 i-2 annotated with
the superseding F1 ruling) · `02_physics_block.md` (§0 = the four measurements) ·
`03_auditor_report.md` (435 lines, per-gate evidence) · `04_eye_walker_report.md` (per-state verdict +
the disproved stale-cache hypothesis) · `scar_candidates.sql` (SQL TEXT ONLY — **not applied**).
Concept: `src/data/concepts/uniform_circular_motion.json` · seed script
`src/scripts/_seed_uniform_circular_motion_cache.ts` · migration FILE (unapplied).

### Registration trap worth remembering
`uniform_circular_motion` is one of the ~60 retired-architecture ids, so it already carried STALE
registrations pointing at the dead `mechanics_2d` path. json-author **overwrote** rather than added:
`CONCEPT_RENDERER_MAP` `"mechanics_2d"` → `"field_3d"`, the `MECHANICS_SCENARIO_MAP` `"circular"` entry
removed, `CONCEPT_PANEL_MAP` renderer flipped, and `VALID_CONCEPT_IDS` + `CLASSIFIER_PROMPT` added
(both were absent). The map removal was verified safe independently: all 8 other field_3d retrofits
likewise carry no `MECHANICS_SCENARIO_MAP` entry, and every consumption site is `?? default`.

---

## (Phase 1 history below)

updated: 2026-07-31 (**FOUNDER APPROVED `equilibrium_of_particles` on content and physics —
         "perfect", no content rework. Authoring sign-off ONLY; nothing sealed.** All three
         founder-ordered fixes LANDED (E2, FIX A, E1) and THE EYE re-run independently verified:
         **the seven states now show real motion.** Awaiting founder re-review.)

## STATUS — approved on content, three fixes landed, motion now PROVEN

Founder review verdict: **APPROVED on content and physics.** No architect / physics-author /
json-author rework. `visual:approve`, `tts:*`, `build:pilot` and deploy remain FORBIDDEN —
baselines cannot be locked, and approval here is authoring sign-off only.

Three fixes, in the founder's order, each its own commit. All three are platform/engine work and
were declared **EXEMPT from the runaway guard** (the 7.1 precedent that exempted lom-f's SEAM C).
**The guard therefore stays at 2 of 3 for genuine NEW defects.**

| # | commit | what |
|---|---|---|
| 1 | `5801db6` | **E2** — `force_rig` honours authored `strings[].color` on arrows `[peter_parker:field3d_surgeon]` |
| 2 | `ea16433` | **FIX A** — a frame that never reached its sim-time pin is FATAL, not a warning (THE EYE) |
| 3 | `b2ebf9a` | **E1** — `force_rig` reconstructs state at a pinned `at_ms` instead of returning steady state `[peter_parker:field3d_surgeon]` |

### THE ANSWER THE FOUNDER ASKED FOR: yes, the motion is real

Independently re-run by the orchestrator (not taken on an agent's report):
`npm run visual:eyes -- equilibrium_of_particles` → **31/31, exit 0, no `EYE_CAPTURE_ABORTED`** —
so with FIX A armed, every pin genuinely reached its instant.

- **114 dense frames, 114 DISTINCT** (md5, per state: 17/16/17/18/19/16/11 frames, all unique).
  Before the fix the ring centroid was **sub-pixel identical across all 114** and every adjacent-pair
  diff was 0.00%.
- **The founder's stated acceptance criterion is MET: `STATE_1__dense_t00000.png` reads
  `T₁ = 29.40 N`** (was 49.00), hanger label `3.0 kg`, ring at table centre — read by eye, not inferred.
- The ramp genuinely replays: at `t=16000` the same state reads `T₁ = 49.00 N`, hanger `5.0 kg`, and
  the ring has visibly travelled right of its start marker.
- E2 confirmed in the same frames: T₁ gold, T₂ blue, T₃ red exactly as authored.

### E1's root cause, for the record

Every EYE capture path sends `RESET_TRAJECTORY` before pinning. The shared handler only rebases
`stateStartTime` — which rewinds every **closed-form** scenario for free. `force_rig` is a genuine
integrator on both branches (`p/v`, `p3/v3`, trail, plus the `eng.t_ms` driving `phases[]` and
`param_ramp`) and was never hooked in, so its accumulators stayed where the previous capture left
them; `SET_TIME_FREEZE` is pin-by-target and only advances FORWARD, so every pin handed back the
converged pose. `newtons_laws_body` had already solved this exact class with `nlbResetTrajectory()`;
the fix reuses that contract verbatim (`frResetTrajectory()`) rather than inventing a mechanism.
**No shared clock code touched** — `__pmSteps`/`dtStep` untouched, so Rule 36b's fleet sweep does
NOT trigger. `_scratch_fr_seams.ts` still 42/42 including S9 fold-exactness.

## D5 motion gate — force_rig branch WRITTEN (`c4a099e`), but the gate is still dark fleet-wide

`deriveMotionExpectations` now has a `force_rig` branch. The rule it encodes is deliberately
conservative — declare `true` only where the engine PROVABLY repaints between the dense capture's
pinned instants, leave everything else `undefined` (skip), because a false FAIL trains people to
ignore the gate:
- **whirl → true** only when the swept circle clears the bob (`r = L·sinθ` vs the bob radius); a
  conical state at or below the `ω_min` clamp has `θ = 0`, `r = 0` and hangs dead still.
- **force_table → true** on a param_ramp that actually WRITES (a table token, not seized, delta
  above the engine's own 1e-4 guard) or a `ring_start_offset_m` at or beyond the ring's own
  diameter.
- **`phases[]` is NOT a motion signal** — `frRunPhases` only rewrites `glow_focal`, and every phase
  authored on this concept has no focal of its own, so it repaints nothing.

**It can actually fail, proven against the real defect rather than a synthetic one:** run against
the pre-`b2ebf9a` dump `20260731-044255` (the capture that certified seven dead states 31/31), all
seven states FAIL D5 with max adjacent diff 0.00–0.02%. **This gate would have caught this
morning's CRITICAL defect.** On the current frames all seven PASS at 0.31–0.64%, 3–6× the floor.

### ⚠ THE REAL FINDING — D5 is dormant on EVERY field_3d concept, not just this one

The branch changes nothing yet, and the reason is a second, bigger defect: **`visual_eyes.ts:68`
derives the motion map from `cached.physics_config`, and every `_seed_*_cache.ts` writes
`physics_config: { epic_l_path }` with no field_3d blocks.** Six lines below, `:82` already
establishes the correct pattern — `revealSource = conceptJson ?? cached.physics_config` — with a
comment explaining that the JSON is authoritative for field_3d; the reveal pins and hold
expectations both use it. Motion (`:68`) and durations (`:67`) never got it.

So D5 has been skipped fleet-wide on field_3d since the seed-script cache convention began. Filed
as `eye_motion_map_reads_cached_physics_config_which_holds_only_epic_l_path`
`[owner: peter_parker:visual_validator]`.

**Measured blast radius (mine, not taken on report): 40 of 148 concepts derive a different motion
map from the JSON than from the cached shape — and 25 of those are BASELINE-LOCKED.**

**Deliberately NOT fixed here, and this is the important judgement:** the fix is one line, but its
effect is to switch a dormant gate ON for 25 locked concepts simultaneously. Done inside a chapter
branch, every other running tray's regression step would start failing on concepts they never
touched, and it would read as a regression caused by that tray. It is also Rule 40 PLATFORM
(`visual_eyes.ts` + `deriveStateMeta.ts`). It should land on master as its own piece of work,
followed immediately by a full-fleet sweep, with every newly-failing state either fixed or its
motion declaration corrected before the change is called done. **FOUNDER CALL.**

## (superseded by the above) STILL OPEN — THE EYE photographs honestly but does NOT yet GATE motion

**`deriveMotionExpectations` has no `force_rig` branch.** `force_rig` is registered for reveal keys
(`deriveStateMeta.ts:597/604`), reveal pins (`:2517/2533`) and hold expectations (`:3213/3223`) — but
not for motion. The re-run still prints `Motion map: STATE_1=?, … STATE_7=?` and **D5 is skipped on
all 7 states**. So the frames are now honest, and the motion is real and human-verifiable, but a
genuinely static `force_rig` state would still not be CAUGHT by the machine. Deliberately not fixed —
outside the founder's three-fix instruction. `[owner: peter_parker:field3d_surgeon]`

## Both MAJOR arrow scars — FIXED 2026-07-31 (founder-ordered, one dispatch each)

| # | commit | bug_class | agent |
|---|---|---|---|
| 4 | `7c6bbb3` | `field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line` | `field3d-surgeon` |
| 5 | `887ea50` | `force_arrow_length_exceeds_the_apparatus_line_it_lies_along` | `field3d-surgeon` |

Run SEQUENTIALLY, not in parallel: both edit the same arrow-drawing region of
`field_3d_renderer.ts`, which `feat/lom-f-momentum` is also editing concurrently.

**Ownership correction: eye-walker filed both under `peter_parker:renderer_primitives`, which is
WRONG.** That tag maps to `pcpl-surgeon`, which owns the 2D parametric renderer and would have
rejected the scope. Both root causes live in `field_3d_renderer.ts` → `field3d-surgeon`. Worth
remembering: eye-walker's owner tags are a guess from the symptom, not from the code.

- **`7c6bbb3`** — the shaft was a `THREE.Line`, and WebGL ignores `linewidth` on essentially every
  desktop driver, so it drew 1px no matter what. `FR_ARROW_Z` never addressed that (depth ordering
  was never the failure — a 1px line *in front of* a bright cylinder is still invisible), which is
  why this recurred. Fixed with a real mesh cylinder shaft (`FR_ARROW_SHAFT_R = 0.045`) PLUS the
  never-applied prevention clause (b): string thinner (0.013→0.009) and dimmer (opacity 0.72→0.55,
  emissive 0.22→0.12). A mesh cannot vanish on different hardware; clause (b) alone would have left
  a 1px arrow against a 1px string. Trap found en route: `ArrowHelper.setColor()` reaches only
  `.line`/`.cone`, so the new child mesh needed explicit re-colouring or it would have kept the
  build-time palette forever — the same defect class E2 fixed.
- **`887ea50`** — `force_rig` inherited `newtons_laws_body`'s arrow map (0.048 world/N). A free-body
  arrow has unlimited room; a tension arrow drawn *along its own string* has only the ring→pulley
  run, which is 2.40 world ONLY while the ring sits at table centre — and the ring is a solved,
  moving object. At STATE_1 t=16000 the ring settles at (0.785, 0.128), leaving a run of **1.62**
  against a **2.352** arrow. Fixed by lowering the single shared scale to 0.026 and adding a
  perpendicular label offset. **Not a clamp** — one shared newtons→world map still serves every
  arrow, and the floor/cap are now expressed in NEWTONS with lengths derived, so the thresholds
  cannot silently drift. Proportionality verified in-frame after the fix: 77/62 px = 0.805 against
  49.0/39.2 N = 0.800 (before: 148/119 = 0.804).

### RESOLVED by founder call — zoom the apparatus, then fix the labels properly

| # | commit | bug_class |
|---|---|---|
| 6 | `0c86658` | `force_rig_apparatus_drawn_too_small_for_its_own_arrow_budget` |
| 7 | `c79bbf8` | `force_rig_arrow_label_ink_too_dark_to_read_against_the_apparatus` |

- **`0c86658`** — the zoom went on the **scene-graph root** (`root.scale.setScalar(1.42)` plus a
  branch-A framing shift), NOT on the ~20 world-unit constants. That choice is the whole point: a
  root transform cannot miss a constant, and every ratio 887ea50 and 7c6bbb3 depend on is preserved
  by construction. `k = 1.42` not 1.5 because the outermost object is not the table but the hanging
  weight's "N kg" label at the 5 kg slider maximum, and the camera looks DOWN, so +y content is
  nearer the lens — a string at 90° clips the top at k ≈ 1.55. Tightest measured margin 12.5 px
  (top, angle1 = 0) with nothing clipped at any authored angle on either branch.
- **`c79bbf8`** — the durable fix the founder asked for, not a hex-picking patch: a hue-preserving
  **luminance floor** (`FR_INK_LUM_MIN = 0.62`) applied through ONE funnel, so no authored colour
  can produce an unreadable label. Contrast measured before → after: blue T₂ **1.62:1 → 4.83:1**,
  red T₃ **1.30:1 → 4.42:1**, red W **1.26:1 → 4.89:1**, with hue held within ~1° of each arrow's
  authored value, so label→arrow matching by colour alone still works. Gold was already above the
  floor and is returned untouched.
  **The ink floor alone would NOT have fixed this** — the generic glow pass was multiplying peer
  labels by `GLOW_DIM_OPACITY = 0.40`, which no floor survives. `fr_arrow_label` joins the
  brighten-only carve-out `fr_weight_label` already had. **The ARROW still dims to 0.40, so Rule 32e
  single-focal is untouched** — only the name tag stays readable. `FR_LABEL_DIM_OPACITY` is the one
  number to turn if a stricter reading of 32e is wanted.

**Honest limit on the aha, for the record:** the zoom recovered ~77% of the approved arrow ink
(~51 px → ~71 px), not 100%, and it cannot go further by framing alone. The reason is geometric and
worth keeping: in the approved look the arrow spanned essentially the FULL table radius — which is
exactly why it punched past the pulley the moment the solved ring moved off centre. "Arrow spans the
radius" and "arrow never leaves the table" are mutually exclusive on a moving-ring apparatus. The
remaining lever is the hanging-chain footprint (`FR_HANG_OUT` + label gap ≈ 32% of the outer radius),
which is a relative-geometry change and a separate founder call — not taken.

### (resolved above) OPEN TASTE CALL — fix 5 shrank every arrow to 54% of its approved drawn length

The global scale had to be set by the WORST case (STATE_4/STATE_1, where the ring settles close to a
pulley and the run collapses), so every well-behaved state paid for it. STATE_5 never had an
overshoot problem — its run is the full 2.40 — yet its primary-aha arrows fell from ~150 px to ~45 px
stubs clustered at the ring. Compare `20260731-152258\STATE_5__frozen.png` (approved look) with
`20260731-190618\STATE_5__frozen.png`. The concept was founder-approved on the former.

This is inherent to "one shared scale", which proportionality REQUIRES — but it is not the only
lever. **The apparatus is drawn small: the table spans ~306 px of a 1280×720 frame, so the sim fills
roughly 40% of the height.** Scaling the drawn apparatus and the arrow scale together by the same
factor k zooms the whole picture up in pixels while leaving every geometric relationship — including
the containment clearance and the proportionality — exactly intact. That would recover the arrows'
screen presence without reintroducing either scar. Not done: it changes framing, and the founder
approved this concept on its current framing.

Also observed in the same frames, not yet filed: **the `T₁`/`T₂`/`T₃` arrow labels read dim and
small** — they are drawn in each arrow's authored colour (blue, red) and now sit deep inside the
dark table disc rather than out at the rim, so contrast is poor. Legibility is Rule 24/34 territory.

Founder call needed: accept as-is · zoom the apparatus (recommended) · or revert `887ea50` and
contain the overshoot a different way.

## (superseded — both now fixed) Two MAJOR arrow scars are now MORE visible, precisely because motion is real

Both were known and deliberately left (one `bug_class` per dispatch); both are plainly visible in the
new `STATE_1__dense_t16000.png`:
- `field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line` — **recurrence**;
  `FR_ARROW_Z` alone is insufficient. Arrows read as floating triangles, not arrows: the shaft is a
  1px `THREE.Line` against a thicker, brighter string. Prevention-rule clause (b) — make the
  apparatus line thinner AND dimmer than the arrow — has never been applied.
- `force_arrow_length_exceeds_the_apparatus_line_it_lies_along` — at `T₁ = 49.00 N` the arrow
  overshoots its own pulley and terminates inside the 5.0 kg hanging weight, burying the `T₁` label
  under the `5.0 kg` label. Physically correct (length = magnitude, not reach) but reads wrong.

Recommended as the next two dispatches, one `bug_class` each, before Phase 2.

### Lower-severity findings from the same walk (eye-walker, text only — no DB writes)

| bug_class | sev | owner |
|---|---|---|
| `field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line` **(recurrence — `FR_ARROW_Z` alone is insufficient)** | MAJOR | `peter_parker:renderer_primitives` |
| `force_arrow_length_exceeds_the_apparatus_line_it_lies_along` (a 39.2 N arrow punches past its pulley and terminates inside the hanging weight; recurs at 0°/90°/270°) | MAJOR | `peter_parker:renderer_primitives` |
| `unicode_subscript_gamma_used_where_latin_subscript_y_intended` (U+1D67 renders as a visible Greek **γ** on STATE_3's formula surface) | MAJOR | `alex:json_author` |
| `glow_focal_fr_ring_whiteouts_the_ring_and_occludes_it` (Rule 29 — emphasis must preserve identity colour) | MODERATE | `peter_parker:renderer_primitives` |
| `force_rig_slider_panel_renders_full_height_when_one_row_visible` (~250 px of empty black above STATE_4's single row) | MODERATE | `peter_parker:renderer_primitives` |

Advisory, no engine work: append a `concept_panel_config` INSERT to the already-authored migration
FILE so this concept doesn't join the 45-row `panel_count` backlog. `[alex:json_author]`

## What DID pass, so the review is worth the founder's time

Framing centred within 1% of viewport, nothing clipped, ring never near the rim (max 0.079 m of a
0.25 m table) · hanger/pulley/label radial placement clean at every authored angle
(0/17/34/50/90/130/163/180/233/270) — Phase 0's screen-down-hanger defect is FIXED · HUD at exactly
`top: 52px`, clears the Full-screen button, value-only · one Unicode math-serif formula surface per
state · ≤5-word delta cue on all 7 captions · narration 31–41 words, all inside the 25–55 budget ·
arrow magnitudes proportional where measurable (39.2/49.0 = 0.80 vs 116/149 px = 0.78) · every T
matches its hanger label · zero console errors · zero layout collisions · Rule 41 and Rule 35 probes
over all 86 rendered strings returned NOTHING · **the primary aha does ship**: `STATE_5__frozen.png`
vs `STATE_6__frozen.png`, same load `W = 49.00 N`, supports 29.40 N at steep cables vs 49.00 N at
flat ones, both numbers legible, both geometries unmistakable.

### Frames worth founder eyes — CURRENT run (post-fix)
`.visual_runs\equilibrium_of_particles\20260731-152258\` →
- `STATE_1__dense_t00000.png` — **the proof E1 is fixed**: `T₁ = 29.40 N`, hanger `3.0 kg`, ring at
  centre. This frame read 49.00 N before.
- `STATE_1__dense_t16000.png` — the same state at the ramp's end: `T₁ = 49.00 N`, hanger `5.0 kg`,
  ring visibly travelled. Pair it with the frame above and the replay is undeniable. **Also the
  clearest picture of both open arrow scars** — the arrow reads as a floating triangle and its tip
  sits inside the 5.0 kg weight with the `T₁` label buried under `5.0 kg`.
- `STATE_3__frozen.png` — **E2 fixed**: two colour PAIRS as authored (gold horizontal, blue
  vertical), not four unrelated colours. The `ΣFᵧ` U+1D67 subscript still renders as a Greek γ here
  — unfixed, `[alex:json_author]`.
- `STATE_5__frozen.png` + `STATE_6__frozen.png` — **the PRIMARY AHA, now honest**: both support
  cables render the SAME gold in each state (they are physically identical), load red. Same
  `W = 49.00 N`, supports 29.40 N steep vs 49.00 N flat.

(The pre-fix run `20260731-044255` is superseded — its frames show the steady-state artefact and the
wrong colours. Do not review from it.)

### The review LINK was stale until now — rebuilt 2026-07-31 18:00

`review-site/equilibrium_of_particles/` had been built at **05:03**, i.e. before E2 (14:47) and E1
(15:13). The founder opening that link would have re-reviewed the OLD sim — wrong arrow colours and
the steady-state pose — and it would have looked like the fixes never landed. Rebuilt with
`npm run build:review -- equilibrium_of_particles`; `frResetTrajectory` (the E1 symbol, which exists
only at/after `b2ebf9a`) is present 3× in the fresh `sim.html` **and 3× in the copy actually served
over the wire**, so this is not the stale-cwd 404/stale-server trap.

**Standing lesson for every tray: a renderer fix does not reach the founder's link until
`build:review` re-runs.** The frames come from THE EYE's own capture path and update immediately;
the review site does not. Landing an engine fix and handing over the old link is silent.

Live: **http://localhost:8093/equilibrium_of_particles/** (HTTP 200, verified against the fresh build).

## Two founder-named beats were reframed / cut at design time (architect §0, accepted)

- **"Sweep an angle and watch BOTH other tensions change while the ring holds centre" is physically
  impossible on this apparatus.** `T_i = m_i·g` is an INPUT fixed by the hanging mass; the ring
  POSITION is the solved output. Sweeping an angle cannot change `T₂`/`T₃`, and the ring cannot hold
  centre once the geometry moves. Reframed to what a real force table does: sweep `angle1` and the
  ring **continuously tracks a moving balance point** — balance is still shown as a live condition,
  and the thing that moves is a rendered object (the ring's path), not an asserted number. STATE_4.
- **Lami's theorem is CUT.** Reading it off the screen needs the three inter-string angles; the
  engine exposes no inter-string angle readout and no angle-arc drawable. Authored "α = 127°"
  annotations would be stale the instant the ring moves (every guided state has motion by design) —
  the exact `newton_third_law` failure the founder rejected. **Reinstating it is a genuine engine
  request (angle readout + arc drawable), reported not worked around.**

## Phase 1 artefacts
`docs/loop_runs/lom_g/equilibrium_of_particles/01_architect_skeleton.md` (skeleton; §0 = engine findings) ·
`02_physics_block.md` (physics; §0 = the three MEASURED values that overrode the architect) ·
`src/data/concepts/equilibrium_of_particles.json` · migration FILE (unapplied, no DB writes).
physics-author measured against the real engine and **rejected** the architect's `ring_mass_kg 0.25 /
damping 12` (settles in 0.17 s, ~40× too fast) → **70 / 64**; caught **three `|p|` rim breaches**
(STATE_4 40°→34°, STATE_5 supports 60/120→50/130, STATE_3 offset 0.13→0.125).

design: docs/FORCE_RIG_ENGINE_SPEC.md  (founder-approved 2026-07-30)
built:  docs/loop_runs/lom_g/_engine/force_rig_json_contract.md  ← **read this before authoring**
worktree: C:\Tutor\physics-mind-lom-g
branch: feat/lom-g-offaxis
base: master @ 06a3ee0 (clean cut)
review_port: 8093          (8080-8082 / 8087-8092 / 8099 are in use by other worktrees)
regression_sample: electric_potential_meaning, eddy_currents   (Amendment 5 — disjoint from lom-f's
                   gauss_law_sphere + coulombs_law and from every other running loop)
                   ⚠ electric_potential_meaning is NON-DETERMINISTIC — see "Regression-sample
                   finding" below. `eddy_currents` currently carries the whole regression signal.

chapter_map (founder-approved 2026-07-30, in build order):
  1. equilibrium_of_particles   — the force table (ring, 3 pulleys, hanging weights)
  2. uniform_circular_motion    — the whirl: flat, then conical, then cut the string

  BUILD ORDER IS DELIBERATE. `equilibrium_of_particles` is the static branch — low risk — and it
  PROVES the off-axis force solver before `uniform_circular_motion` depends on it. Same
  structural-extremes-first logic lom-a used. Do not reorder to do the exciting one first.

next: **FOUNDER REVIEW of `uniform_circular_motion`** at http://localhost:8093/uniform_circular_motion/
      (link rebuilt post-fix and verified over the wire). BOTH tray concepts are now built; the
      chapter_map is complete. Nothing is shipped: `visual:approve`, `tts:*`, `build:pilot` and
      deploy remain untouched for BOTH concepts, and neither has a `visual_baselines` entry, so
      neither has H2 regression protection.
      **THREE FOUNDER CALLS ARE OPEN, in priority order:**
      (1) **(RESOLVED 2026-08-01)** — the CRITICAL pin defect was fixed in `7d24724` (+ the gate
          correction in `fb259a6`); the diagnosis in this line was WRONG and the real mechanism is the
          fleet-wide capture-timeout finding recorded in the Founder Review Round 1 section above.
          **What replaces it as the top engine call: the TOOLING half is still OPEN** —
          `capture_frozen_frame_ignores_its_own_poll_result_and_photographs_off_pin` affects EVERY
          renderer, exposes 307 states / 87 concepts / 45 baseline-locked, and is Rule 40 PLATFORM
          work for master. Plus, on this concept: the MODERATE floor-band arrow (STATE_1's claim is
          invisible) and LOW Candidate J (short-pin phase jitter).
      (2) **The fleet-wide D5 fix** (still dark — this run's Motion map printed all `?`). Unchanged
          from last session: one line, but it switches a dormant gate ON for 25 locked concepts at
          once, so it belongs on master with an immediate full-fleet sweep. Now joined by the
          auditor's cheaper, complementary proposal — three motion numbers per state in THE EYE,
          renderer-agnostic and immune to the missing `field_3d_config`.
      (3) **Whether scar candidates get applied to `engine_bug_queue`.** Last session the founder
          LIFTED the file-only ban and 13 rows landed; this session's candidates are still FILES
          (auditor's 4 INSERT + 2 retag UPDATE, plus the 3 engine findings above). The cost of
          leaving them as files is on the record: the arrow-shaft scar RECURRED precisely because its
          prevention rule existed only as prose in an unmerged file.
      Also open from Phase 1, unchanged: the tray's regression gate still runs on ONE concept
      (`eddy_currents`) because `electric_potential_meaning` is non-deterministic; two MODERATE
      `force_rig` table scars remain filed-but-unfixed.
in_flight: (none — Phase 2 complete pending founder review)
parked: (none)
engine_commits: e5c5d01 (force_table + harness), 096157d (whirl), 5801db6 (E2 colour),
                ea16433 (FIX A — EYE pin fatal, platform/Rule 40), b2ebf9a (E1 time-pin replay),
                7c6bbb3 (arrow shaft width), 887ea50 (arrow length containment),
                0c86658 (apparatus zoom), c79bbf8 (label ink luminance floor)
                → the two arrow fixes were FOUNDER-ORDERED, which is itself the notification the
                runaway guard exists to force. The guard is now AT its tray limit: any FURTHER
                engine fix on this tray needs an explicit founder call first.

---

## Phase 0 — DONE (2026-07-30 → 2026-07-31)

`force_rig` is one new `scenario_type` in `src/lib/renderers/field_3d_renderer.ts` serving BOTH
concepts as pure JSON config. Built by two `field3d-surgeon` dispatches, one `bug_class` each, each
under its own §3b verify chain.

| # | commit | branch | seams |
|---|---|---|---|
| 1 | `e5c5d01` | `force_table` — damped 2-D particle, top-down table, pulleys, hanging weights + the shared `fr*` scaffolding, `deriveStateMeta` registration, `_scratch_fr_seams.ts` | 1, 2, 3, 9 |
| 2 | `096157d` | `whirl` — flat + conical, **cone angle solved**, cut-the-string | 4, 5, 6, 7, 8 |

**Bring-up harness `src/scripts/_scratch_fr_seams.ts` — 42 checks · 42 passed · 0 failed · 0 SKIP.**
Re-run independently by the orchestrator at HEAD, not taken on report. `npx tsx src/scripts/_scratch_fr_seams.ts`.

Headline evidence (all spec §5 assertions):
- **S1** balanced fixture settles to `|p| = 3.4e-14 mm`, `|ΣF| = 0.000 N`, unmoved over a further 5 s.
- **S2** +20% on one mass → ring settles at a NEW fixed point, engine `(0.024002, 0.008765)` vs an
  independently coded root solve `(0.024002, 0.008765)` — the settle is SOLVED, not scripted.
- **S3** Lami: `T_i/sin(opposite)` = 49.0000 / 49.0000 / 49.0000, spread 0.0000%, on a deliberately
  non-symmetric 3-4-5 fixture.
- **S4** `cos θ = g/(ω²L)` worst error **0.0006%** across ω = 3.4…6.4, measured off the anchor+bob
  meshes AFTER 2 s of integration — persistence, not seeding. `T = mω²L` worst 0.0000%.
- **S5** below `ω²L > g` the engine clamps to `√(g/L)`, renders no cone, and the write is **not**
  silently swallowed (handle snaps back, HUD shows an amber `ω min = 4.04 rad/s`).
- **S6** period 1.57079 s vs `2π√(L cosθ/g)` = 1.57080 s — 0.0005%.
- **S7** post-cut: largest turn **0.00000°** over 73 steps, speed spread 0.00000%, perpendicular
  distance of the fitted line from the axis = 2.40000 vs abandoned-circle radius 2.40000 (a radial
  "flung outward" path would read 0), r strictly increasing 2.465 → 6.099. Ghost circle + trail drawn.
- **S8** 0 occurrences of `/centrifug/i` in executable lines; largest outward radial arrow component
  `0.000e+0`; `dot(tension, unit(anchor−bob))` min = 1.000000000.
- **S9** Rule 36 fold-exact (`Δ|p| = Δ|v| = 0` across 20 sub-steps 1-at-a-time vs 2-at-a-time, with a
  companion check proving the compared run actually travelled 70.9 mm), frozen frame byte-identical.

**Build state at HEAD (independently verified):** `check:renderer-syntax` OK · `npx tsc --noEmit`
**0 errors** · `npm run validate:concepts` **145 PASS / 0 FAIL** (warning profile unchanged) ·
regression EYE `eddy_currents` **38/38 clean** (twice).

**The success criterion still stands and is now testable:** `uniform_circular_motion` must require
ZERO renderer edits after `equilibrium_of_particles` seals. If authoring forces a renderer change,
this design under-generalized — STOP and re-scope, do not extend the engine per concept.

### The risk that did NOT materialize

The spec §8 / state-file risk note said `whirl` was the genuinely new capability and might need
parking. **It landed on attempt 1 with the beat intact.** The cone emerges from velocity-Verlet +
SHAKE/RATTLE integration (`T = m(û·a_free + |v|²/L)`) — `T = mω²L` and `cos θ = g/(ω²L)` appear
NOWHERE in the renderer, they fall out. `release` deletes the constraint and returns gravity alone
(conical) or the zero vector (flat); the straight line is the OUTPUT, not the instruction. Nothing
was weakened, nothing was scripted, no outward force is drawn or computed anywhere.

### Frame-visible / assertion-invisible defects — the recurring lesson

**Five real defects across the two dispatches were invisible to a fully-passing assertion suite and
visible in the first rendered frame.** Both surgeons flagged it independently; it is now the loudest
signal from Phase 0. Read the frame before declaring anything built.
- Tension arrow collinear with its own string → shaft swallowed (ArrowHelper's shaft is a 1px LINE).
- Hangers drawn screen-down folded back over a top-down table at 90°.
- The whirl rig rendered entirely in the top half (camera TARGET is not authorable).
- The bob slid off the edge of the frictionless plane after the cut — reads as flying, the exact
  misreading that state exists to kill.
- The post-cut trail dimmed to 40% under the glow pass.

Recorded as **5 scar candidates** in `docs/loop_runs/lom_g/_engine/scar_candidates.sql`
(SQL TEXT only — no DB write, per the tray's prohibitions). Founder applies or discards.

---

## Regression-sample finding — `electric_potential_meaning` is non-deterministic

Not a regression, and proven so rather than argued:

| run | code | result |
|---|---|---|
| dispatch 1, run 1 | `e5c5d01` | 43/44 |
| dispatch 1, run 2 | `e5c5d01` (identical) | **44/44** |
| dispatch 2 | `096157d` + diff | 43/44 — H2 STATE_6 at **2.90%** |
| dispatch 2, diff stashed | `e5c5d01` unmodified | 43/44 — H2 STATE_6 at **2.31%** |

Identical code produced different verdicts (rows 1–2), and unmodified code fails the same check at a
different magnitude (row 4). That is a non-deterministic baseline, not a `force_rig` regression —
which is additionally impossible by construction here, since every shared-file edit is either a new
`force_rig` branch or a NOT-list term false for every other scenario.

**Operational consequence, for the founder:** this tray's regression gate is running on ONE concept.
`eddy_currents` is clean and repeatable (38/38, twice); `electric_potential_meaning` STATE_6 cannot
currently distinguish a regression from noise. Either its baseline needs re-locking, or this tray
needs a different Amendment-5-disjoint partner. **Not reassigned unilaterally** — picking a
replacement needs the fleet-wide view of which locked concepts other trays have claimed.
Filed as scar candidate 5.

---

## Dispatch blocker — RESOLVED and CONFIRMED IN PRODUCTION (2026-07-31)

`field3d-surgeon` resolved normally this session and ran both dispatches. The fix in `6821467`
(double-quoting the 4 broken `description:` values) is confirmed working end-to-end, not just parsing.

Root cause, for the record: an unquoted YAML scalar cannot contain `": "` — the parser reads it as a
nested mapping key and throws, and the registry **silently drops** any agent whose frontmatter fails
to parse. The `[owner: peter_parker:*]` routing tag the doctrine requires in these descriptions is
itself what broke them. Proven by parsing all 13 emissions with `js-yaml`: failed on exactly the 4
agents missing from the registry, succeeded on exactly the 9 present. The earlier "wrong checkout
path" theory was wrong and cost lom-f and lom-g a parked phase each.

Edit site is durable: `scripts/sync-agents.js` preserves emission frontmatter VERBATIM and takes only
the body from `.agents/<role>/CLAUDE.md`, so `npm run sync:agents` will not clobber it. The
"never edit the emission directly" rule governs the BODY; frontmatter exists only in the emission.

### STILL BROKEN ON MASTER — founder action, out of scope for this tray

`renderer-primitives`, `runtime-generation` and `shipper` carry the identical defect in
`C:\Tutor\physics-mind\.claude\agents\` and are therefore **silently undispatchable in every session
fleet-wide**. These are doctrine agents, not trial ones — the whole Peter Parker cluster and the
release chain. Any past session that "fell back to general-purpose because the cluster agent wasn't
available" hit this bug. Recommended alongside the fix: make `sync-agents.js --check` FAIL on
frontmatter that does not parse, so a dropped agent can never again be silent.

**DO NOT fall back to general-purpose** for field_3d engine work — banned by CHAPTER_LOOP.md
Amendment 4 (~3.4M vs ~25M tokens for the same job); §0.1 bans the orchestrator editing
`field_3d_renderer.ts` itself. Parking is correct; a fallback is not.

---

## Founder decisions on the record (2026-07-30)

- **Two new engines, not four.** Four apparatus, two engines — a scenario is what is on screen, an
  engine is the code behind it. Ch.7/Ch.8 forensics: new scenario work is 34-42% of a chapter, and
  extending the engine per concept was the expensive failure mode.
- **Circular motion scope: ball on a string + conical pendulum.** Banked road and vertical circle are
  deliberately OUT (vertical circle is non-uniform and normally taught after work-energy).
- **The misconception beat is cutting the string** — the bob leaves along the tangent, straight, not
  outward. No outward force is drawn at any point, because none exists. The picture proves it rather
  than a caption denying it.
- **Review gate: FOUNDER REVIEW PER CONCEPT**, as lom-c/d/e ran. No founder-proxy on this tray.
  quality-auditor PASS is NOT approval and does NOT trigger visual:approve.

## Rule 31 trap specific to this tray

A force table at equilibrium is visually STILL, and `equilibrium_of_particles` is therefore the
concept most at risk of authoring a static state — which passes every deterministic gate. The
`newtons_laws_body` scar is explicit: `phases[]` only re-times `glow_focal`, and an opacity-only
delta renders as a 0.00% frame-to-frame diff. Every guided state must carry real motion — use
`param_ramp` on an angle or a hanging mass so tensions visibly change and the ring visibly
re-settles. Distinctness must be carried by geometry, position, or arrow LENGTH.

**The engine now gives you two tools for this the spec did not have:** `ring_start_offset_m` (open a
state displaced so it *visibly settles*) and `param_ramp.param: "omega"` on the whirl branch. Budget
state duration for the settle — the reveal pin is `param_ramp.end_ms + 1600 ms`.

## Hard prohibitions on this tray

Never: `visual:approve` · `tts:*` · PILOT_CONCEPTS · `build:pilot` / `deploy:*` · DB writes to
`engine_bug_queue` (scar candidates stay files) · any merge · touching another branch or worktree ·
engine edits outside the §3b verify chain (a routed `field3d-surgeon` dispatch is the ONLY
legitimate path to a renderer edit).

**Renderer co-ordination:** `feat/lom-f-momentum` is building `momentum_bench` in the same
`field_3d_renderer.ts` concurrently, and another session is finishing `feat/lom-a` / `feat/lom-b`.
Every Phase-0 edit was kept region-disjoint — `fr*` functions and the `force_rig` config block only;
a sibling-contamination grep over changed lines returned 0 real hits across both dispatches. The
expected overlaps are the one-line `scenario_type` union, the dispatch switch, the `#sliders`
exclusion chain and the formula-hide chain — the trivial textual conflicts lom-a predicted.

## Verification of the base cut (2026-07-30)

`npx tsc --noEmit` → 0 errors. `npm run validate:concepts` → 145 PASS / 0 FAIL (verified in the
sibling lom-f cut of the same commit). node_modules junctioned; `.env.local` copied.
