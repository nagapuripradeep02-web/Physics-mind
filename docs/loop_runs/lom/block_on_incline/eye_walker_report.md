# eye_walker report — block_on_incline (cycle 1 — RE-READ)
Run: `.visual_runs/block_on_incline/20260726-032449/`
Prior report (cycle 0): `docs/loop_runs/lom/block_on_incline/eye_walker_report.md` (this file, overwritten) —
found 1 CRITICAL (`sliding_block_reaches_ramp_end_reverts_to_static_friction`) + 1 disclosed residual
(fs/fk arrow 15N-floor stub). Two fixes landed against that CRITICAL (renderer `_boundArrestedSliding`
latch + STATE_4 reveal-pin moved to ~7100ms). This cycle re-walks all 5 states against the fresh frame
dump to verify the fix and check for regressions.

Bug-queue consultation (pre-walk): `query_engine_bug_queue.ts block_on_incline --field3d --open` returned
**no matching rows** — nothing OPEN/DEFERRED to carry into this walk.

## Deterministic gate summary
23/23 deterministic checks passed, 0 failed, $0.00 (per dispatch brief; manifest.json for this run carries
`"warnings": []` and all 5 states `timed_out: false`). As before, deterministic checks are blind to the
physics-readout / friction-type-collapse defect below — this walk again comes entirely from reading
rendered pixels: contact sheets, full dense series, and frozen frames across all 5 states.

## Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| STATE_1 | ✓ mg, N, dashed mg·sinθ/mg·cosθ, right-angle marker all present, frozen ≡ held final static pose | ✓ unchanged from cycle 0 — static-by-design reveal beat, no regression from the renderer edit | ✓ "Gravity splits on the slope" vs black baseline | ✓ | no change from cycle 0 |
| STATE_2 | ✓ fs=mg·sinθ formula, θ/fs/ΣF HUD present | ✓ θ tilts monotonically, fs climbs in lockstep, ΣF=0.00N throughout — unchanged from cycle 0 | ✓ "Friction rises to match" | ✓ | fs arrow near-constant-length stub (disclosed residual) unchanged, not worse |
| STATE_3 | ✓ **frozen ≡ byte-identical to `dense_t15000`** (state's own duration end, held per Rule 26): N=40.14N, **fk=15.25N, a=0.00, block visibly at the ramp's lower-left (post-slide) position** — this is the fix in action: the block reached the track/duration end and correctly stayed labelled `fk` (it WAS sliding) instead of reverting to `fs` | ✓ block motionless 0–8000ms (fs climbing 14.62→19.26N, a=0.00), breaks away between t8000–t9000 (fk=16.73N, a=−0.96), then visibly accelerates down-slope through t9000→t13000 (a: −0.96→−2.00→…), reaching the bound near t14000–15000 where it settles — **friction label correctly stays `fk` at the settle, never reverts to `fs`** | ✓ "Tilt until grip fails" | ✓ | **improved vs cycle 0**: previously the same end-of-slide moment was an unverified "held" claim; this cycle confirms the settle-at-bound instant no longer falsely re-derives static friction — exactly what the engine fix targeted, and it generalizes correctly beyond STATE_4 |
| STATE_4 | ✓ **frozen now lands at ~7100ms, mid-slide**: B shows fk=17.26N, v=−1.95 m/s (interpolates correctly between the t7000 v=−1.92 and t8000 v=−2.14 dense samples — no discontinuity), A stays fs=18.36N/v=0.00 throughout | ✓ **CRITICAL RESOLVED.** Full dense series t0000→t8000: B's velocity magnitude increases monotonically (−0.40 → −0.65 → … → −1.70 → −1.92 → −2.14 m/s) with constant a=−0.22 m/s² and fk=17.26N held constant the entire time; A stays motionless at fs=18.36N/a=0.00/v=0.00 throughout. **No snap-to-static, no readout collapse — B never re-enters A's static values.** The state's own duration was shortened to end at t=8000 (before the old wall-arrival time of ~t8500-9000), so the fix is verified on TWO fronts: the latch itself, and the content no longer running the demo past its pedagogical point | ✓ "Moving friction is weaker" — and the two-fates contrast now HOLDS through the whole state | ✓ text/Unicode fine | none — this is the confirmed fix |
| STATE_5 | ✓ formula `a=g(sinθ−μk·cosθ)`, all 5 sliders present, HUD clears corners; frozen genuinely a live moving moment (θ=31°, v=−1.14, a=−1.88 — distinct from any adjacent dense sample, confirming Rule 37 continuous-run, not a re-entered freeze) | ✓ **previously-flagged v=0.00-with-nonzero-a symptom does NOT reproduce.** Walked every dense frame (t0–t10000) + 5 KEYFRAMES samples: every (v,a) pair is now internally consistent — either both genuinely zero (a fresh rest pose right after a slider change, e.g. t5000/t6000/t9000/t10000/KEYFRAMES_t07878, all a=0.00 & v=0.00 together) or both nonzero together during an actual slide (t1000: a=−1.21,v=−0.38; t7000: a=−0.96,v=−0.40ish progression; frozen: a=−1.88,v=−1.14). No frame shows the mismatched "v=0 but a≠0" pattern cycle 0 flagged | n/a (explore exempt) | ✓ | residual concern from cycle 0 is retired — likely was the same friction-latch defect surfacing in the sandbox, now fixed by the same engine patch |

## Frames for founder eyes (≤5)

1. `.visual_runs/block_on_incline/20260726-032449/STATE_4__dense_t08000.png` — B still sliding at the state's new duration end (v=−2.14 m/s, fk=17.26N), A untouched at fs=18.36N — the two-fates contrast now holds to the end.
2. `.visual_runs/block_on_incline/20260726-032449/STATE_4__frozen.png` — the new ~7100ms reveal pin: a genuinely mid-slide held picture a teacher would see, B clearly still in motion.
3. `.visual_runs/block_on_incline/20260726-032449/STATE_3__frozen.png` — confirms the fix generalizes: block settled at the ramp's lower bound, HUD correctly still reads `fk` (never reverts to `fs`) even though a=0.00 at the settle.
4. `.visual_runs/block_on_incline/20260726-032449/STATE_3__dense_t09000.png` — the break-away instant itself (fs→fk transition, a jumps to −0.96), good reference for how well the central beat reads.

Only 4 — nothing else earns founder eyes this cycle; STATE_1/STATE_2/STATE_5 are unremarkable-clean re-reads.

## Candidate engine_bug_queue rows

None. The cycle-0 CRITICAL (`sliding_block_reaches_ramp_end_reverts_to_static_friction`) is CONFIRMED
RESOLVED by direct frame evidence in both the state it was found in (STATE_4) and the state most likely to
re-expose the same code path (STATE_3's own end-of-slide settle, and the STATE_5 sandbox). No new defect
found this cycle. The disclosed friction-arrow 15N-floor residual (STATE_2/STATE_3) is unchanged — still
not proposing a queue row for it, per the founder/quality-auditor's existing acceptance.

## Overall read

**CLEAN — recommend SEAL.** Both fixes verified against the fresh frame dump: (1) the renderer latch holds
a body's genuine friction-type (fk) across a track/duration-end arrest instead of silently re-deriving
static friction, confirmed in STATE_4 (the state that exposed it) AND independently in STATE_3's own
end-of-slide settle; (2) STATE_4's reveal pin now lands mid-slide (~7100ms) and shows the two-fates
contrast intact through the state's shortened duration. The previously-ambiguous STATE_5 sandbox symptom
(v=0 paired with nonzero a) does not reproduce anywhere in this run — every sampled frame's (v,a) pair is
now internally consistent. No regression detected in STATE_1/STATE_2 from the renderer edit. Only the
already-founder-accepted 15N friction-arrow floor remains as a known, unworsened residual.
