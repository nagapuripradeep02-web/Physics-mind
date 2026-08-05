# rotmech desk B — loop state

updated: 2026-08-04
desk: `feat/rotmech-b` · `C:\Tutor\physics-mind-rotmech-b`
cut from: `4b289d4` (the Phase-0d pre-registration commit)
review_port: **8111**
regression_sample: **rolling_friction, work_done_by_constant_force**
engine_surface: `newtons_laws_body` **SEAM R** (the 0c-2 rolling extension)

## Concept set — FROZEN. This desk owns exactly these two.

| Wave | Concept | Status |
|---|---|---|
| 1 | `pure_rolling` | **6 of 8 STATES WORKING** (2026-08-05, after the B-8 s0 fix). tsc 0 · validate PASS. **BLOCKED on S3 (B-5, zero bodies render) + S7 (B-1, capture never occurs)**, plus B-2 slider rows on S1/S8. |
| 1 | `rolling_on_incline` | **NON-FUNCTIONAL** (2026-08-05). tsc 0 · validate PASS. **BLOCKED — all 8 states dead (B-3)**; S8 sandbox byte-identical over 10.5 s across two runs. Also B-2 (S4/S8 radius), S8 "marble vs ring" unachievable. |

> **⚠ B-3 as first filed was HALF WRONG, and the wrong half was ours.** `pure_rolling` looked
> dead because of **B-8**, a Desk B authoring defect: `surface.length_m` is a HALF-length, so
> bodies authored `s0 = 2.4` on the FLAT states had 0.6 m of runway and hit the wall at ~300 ms.
> Fixed to −2.4; **`pure_rolling` now works on 6 of 8 states**. `rolling_on_incline` was already
> correct, was not changed, and is byte-identical + still dead — that is the real B-3.
>
> **E2/E3 have NOT landed** (verified: 0 behind origin/master; `NLB_SLIDER_TOKENS` still the
> eight pre-SEAM-R tokens; `canRoll` still has no kinematic precondition). B-1 and B-2 are OPEN.

**This desk is the only one with two ready concepts, and it carries both rolling concepts
deliberately.** They are the joint consumers whose union defined SEAM R — the amendment's
16-item build sheet tags 13 items `both`, and commit `27d5004` is titled *"both rolling
skeletons converge on one contract."* Splitting them across two desks would produce divergent
lane geometry, body radii and k-chip choices against the same untested engine, and risks two
independent engine dispatches for one defect (the Rule 40a failure). They also share one
regression pair, which Amendment 5 forbids two desks from owning.

**`rolling_on_incline`'s ACTIVATION SEMANTICS block is canonical for the pair**, and
`pure_rolling`'s activation paragraph is imported from it verbatim. If you change one, change
both in the same session and restate the source revision. "The sibling quotes this verbatim"
is a claim to be diffed, never asserted.

## next
**Blocked on Desk E.** B-3 is the gating fix — B-1 and B-2 are secondary and a B-1-only fix
will not revive either concept. Nothing further to build here until it lands; then re-walk
BOTH concepts in full (not just the S7/radius beats). Full log:
`docs/loop_runs/rotmech/_progress/b.md`.

## done
- **2026-08-05 — THE EYE run on all four permitted keys** (scoped clear → seed → `visual:eyes`,
  re-seeded before each). **5 new findings filed** (B-3 CRITICAL · B-4 · B-5 · B-6 · B-7) →
  `_engine/findings_b.md`. Regression pair CLEAN (`work_done_by_constant_force` H2 0.00%,
  `rolling_friction` 0.22–0.38%). THE EYE itself reported **35/35 PASS on both dead concepts**
  (filed B-4 — a gate blind spot, `D5` skipped fleet-wide on this scenario). Two temp seed
  scripts created (`_seed_pure_rolling_cache.ts`, `_seed_rolling_on_incline_cache.ts`) — delete
  after the gate. No approve, no seal, no engine dispatch, no platform file touched.
- **2026-08-04 — both JSONs authored** (json_author stage). `src/data/concepts/pure_rolling.json`
  + `src/data/concepts/rolling_on_incline.json`. tsc 0 errors · `validate:concepts` 151 PASS /
  0 FAIL. Registration sites verified pre-registered and left untouched; no platform file
  touched. **Phase-0 alarm rule did NOT fire** — no third timed field class needed or found.
- **ACTIVATION SEMANTICS diffed, not asserted:** every normative clause of the canonical
  (`rolling_on_incline` REV 6.1) and the import (`pure_rolling` REV 3.1) is identical
  word-for-word; the import drops only four cross-reference tags, one explanatory sentence, and
  the FORMULA-LINE paragraph — none normative. **No paired edit was required.**
- **2 engine findings filed** → `docs/loop_runs/rotmech/_engine/findings_b.md`: **B-1** rolling
  branch has no kinematic gate (flat-track capture inexpressible; blocks union (c)-3;
  `rolling_on_incline` unaffected) · **B-2** union (b)-8 half-landed (`R`/`R2`/`omega0` declared
  but unwired, dropped in silence). Both `peter_parker:field3d_surgeon`, routed to Desk E.
  **No engine fix dispatched from here.**

## SEAM R facts already paid for — do not re-derive

1. **`nlbDriveArrowsForBody` reads arrow magnitudes LIVE off the body.** An authored arrow
   magnitude is a *prediction of what the engine will report*, never an instruction to it.
   "Not integrated" in the activation semantics means s and v do not advance — it does **not**
   mean the forces are not solved.
2. **Presence is `typeof`, never truthiness.** `lane_gap_m = 0`, `activate_at_ms = 0` and
   `visible_before_activation: false` are all legal falsy values.
3. **The timed surface is exactly TWO field classes** — `bodies[].activate_at_ms` and
   `formula_overlay[].at_ms`. Per-arrow reveal was ruled OUT; arrows are static from entry and
   sequenced by `phases[].glow_focal`. **A third timed class is the Phase-0 alarm rule: STOP
   and report, do not build.**
4. **Readout tokens are ASCII identifiers** — `'contact'`, `'Romega'`, `'omega'`, `'KE_trans'`,
   `'KE_rot'`. The Unicode `Rω` / `ω` is display only; Rule 34c governs on-canvas text, not
   TypeScript identifiers.
5. **Shape factors k** (`field_3d_renderer.ts:39984`), the whole physics of the race:
   `solid_sphere 0.4 · disc 0.5 · wheel 0.5 · hollow_sphere 2/3 · ring 1.0`, with
   `a = g sin θ/(1+k)`. The winner does not depend on mass or radius.

## Guardrails

1. **`npm run cache:clear:scoped -- <id>` ONLY.** The global 4-table wipe destroys four sibling
   desks' seeded rows mid-EYE.
2. **Cache one-owner rule.** This desk may seed exactly: `pure_rolling`, `rolling_on_incline`,
   `rolling_friction`, `work_done_by_constant_force`. Seeding any other key races a sibling.
3. **Always re-seed immediately before `visual:eyes`.**
4. **Shared registration files are READ-ONLY here** (pre-registered on master in `4b289d4`).
5. **Never edit the six platform files** — above all `field_3d_renderer.ts` and
   `deriveStateMeta.ts`, not even a comment.
6. **Engine findings → `docs/loop_runs/rotmech/_engine/findings_b.md`.** Desk E is the sole
   engine owner. **This desk is the nominated SEAM R finding owner** — no other desk files an
   nlb finding.
7. **`APPARATUS_CONTRACT.md` is binding** — scene scale 0.5 world units/m, body size 0.55,
   default `radius_m` 0.55 m, lane gap 0.85, race order sphere → disc → hollow sphere → ring
   left to right so the finish order reads left-to-right.
8. **Progress lines → `docs/loop_runs/rotmech/_progress/b.md`**, never `PROGRESS.md`.
9. No `visual:approve` · no `tts:*` · no `PILOT_CONCEPTS` · no `build:pilot` · no `deploy:*` ·
   no `engine_bug_queue` DB writes · no merge to master · no `npm install` · no `git add -A`.
10. `npx --yes http-server review-site -p 8111 -c-1` (never `serve:review`, hardcoded to 8080).
