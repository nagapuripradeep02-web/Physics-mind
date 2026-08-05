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
