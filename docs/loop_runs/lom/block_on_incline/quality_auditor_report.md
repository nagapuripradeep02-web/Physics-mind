# QUALITY-AUDITOR REPORT — block_on_incline (Laws of Motion #3, lom-a) — CYCLE 1 (RE-AUDIT)

**VERDICT: PASS** (hands off to founder → reviewer). This is fix-cycle 1. Both cycle-0 fixes are verified
at RUNTIME against the live review sim (localhost:8089/block_on_incline/sim.html, HTTP 200); the previously
noted bound-halt readout collapse is GONE, and the STATE_3 central break-away beat is UNREGRESSED. Every
ACTIVE gate PASS or N/A, with pasted machine evidence. Zero console errors across the full 5-state walk.

Date 2026-07-26 · branch feat/lom-a · renderer field_3d / scenario newtons_laws_body (frozen engine +
pre-approved param_ramp + the new uncommitted Branch-A bound-halt latch) · pure-JSON concept content.
Probe scripts: docs/loop_runs/lom/block_on_incline/_probe_c1.mjs and _probe_pin.mjs. Frozen frame read
directly: .visual_runs/block_on_incline/20260726-032449/STATE_4__frozen.png.

---

## What changed since cycle 0, and how each was verified

**Fix 1 (CONTENT) — STATE_4 frozen pin → ~7100 ms.** The pin is derived, not authored literally:
STATE_4 has phases[0].id=gap_widens at_ms=6600, and deriveStateMeta adds the 500 ms nlbCushion →
maxRevealMs = 7100 ms (deriveStateMeta.ts:1711-1726). VERIFIED mid-slide two ways:
- Live dense trace at t≈7088 ms: B at s=-3.819 m, v=-1.947 m/s, a=-0.218, glyph=fₖ — genuinely sliding,
  bound (s=-7) not reached until ~8800 ms.
- The captured STATE_4__frozen.png HUD reads B: fₖ = 17.26 N, a = -0.22 m/s², v = -1.95 m/s with the red
  block visibly part-way down the ramp — the canonical held frame lands MID-SLIDE. (Focus b: PASS.)

**Fix 2 (ENGINE, uncommitted) — _boundArrestedSliding Branch-A bound-halt latch**
(field_3d_renderer.ts:30857, 31102, 31318-31352). Logic read and confirmed correct: boundPin holds
stuck=false while a latched body sits in the bound band, so the friction TYPE stays whatever it was the
instant before the wall; the latch is set only when a clamp fires on a genuinely-sliding frame and
cleared once the body leaves the band. Runtime proof below.

---

## Runtime probe — the decisive evidence (console errors across BOTH probes: zero)

### (a) STATE_4 — the decisive check: two identical blocks, two fates, NO post-bound collapse
Sampled LATE, well past the bound-halt instant (~8800 ms), out to 11.5 s:

    t=  128  A[fs=18.36 a=0.00 v=0.00 stuck=true ]  B[fk=17.26 a=-0.22 v=-0.43 stuck=false sliding]
    t= 8336  A[fs=18.36 a=0.00 v=0.00 stuck=true ]  B[fk=17.26 a=-0.22 v=-2.22 stuck=false sliding]
    t= 8800  A[fs=18.36 a=0.00 v=0.00 stuck=true ]  B[fk=17.26 a= 0.00 v= 0.00 stuck=false BAS=true ]  B hits bound s=-7
    t=11520  A[fs=18.36 a=0.00 v=0.00 stuck=true ]  B[fk=17.26 a= 0.00 v= 0.00 stuck=false BAS=true ]

- Block A holds at rest with fs = 18.36 N forever (tan22deg=0.404 lt mu_s=0.45, stuck; fs=mg.sin22deg=18.36).
- Block B slides with fk = 17.26 N (a=g(sin22deg - 0.38.cos22deg)=0.219, runtime -0.218) until it reaches
  its finite track bound at ~8800 ms.
- THE FIX: after the bound halt B stays glyph=fk, f=17.26, with _boundArrestedSliding=true. It does NOT
  flip to fs. Post-bound B HUD "fk=17.26 a=0.00 v=0.00" vs A HUD "fs=18.36 a=0.00 v=0.00" — NOT
  byte-identical (glyph fk not fs, value 17.26 not 18.36). The cycle-0 CRITICAL (both HUD rows going
  byte-identical the instant B hit the wall) is ELIMINATED. Focus a: PASS.
- Physically honest: B was arrested by an end-of-track wall, not by friction re-gripping — the friction
  TYPE stays kinetic, exactly the intended fix behaviour.

### (b) STATE_4 7100 ms pin — mid-slide (frozen PNG + live trace both confirm B moving). PASS.

### (c) STATE_3 — central break-away beat: UNREGRESSED
theta ramps monotonically 0.33 to 35deg (param_ramp 0 to 35 over 0-12000 ms), block EXACTLY stuck until
tan(theta)=mu_s, then breaks away and slides:

    t=8304  theta=24.22  s=4.500 v=0.000  a=0.00  f=20.07  stuck=true   last stuck; fs peak, mu_s=20.07/44.7=0.449
    t=8720  theta=25.43  s=4.448 v=-0.283 a=-0.83 f=16.83  stuck=false  break-away; theta_c ~24.2deg bracketed
    t=12000 theta=35.0   s=-4.106 v=-5.877 stuck=false  fk             ramp-end pin: LIVE sliding, not halted
    t=12416 theta=35.0   s=-6.773 v=-6.946 stuck=false  fk             still sliding, approaching bound

- v is EXACTLY 0 while theta lt theta_c and non-zero after — the taught claim, confirmed at runtime.
  Monotonic theta, exact stick, clean break-away at atan(mu_s)=24.2deg. N falls 49.0 to 40.14. Matches
  cycle-0 to sampling tolerance. The integrator-region engine edit did NOT perturb this beat. Focus c:
  PASS — the concept whole point is intact (no static incline).

### (d) STATE_5 sandbox — the v=0-with-nonzero-a symptom is RESOLVED
Forced theta=35deg then the Rule-37 idle_auto_sweep runs; body A slides and hits the sandbox track bound:

    t=1904  theta=34.28  s=-1.430 v=-2.251 a=-2.40  fk  bas=false   sliding
    t=3408  theta=24.44  s=-7.000 v= 0.00  a= 0.00  fk  bas=true    at bound: v AND a both 0
    t=3920  theta=20.60  s=-7.000 v= 0.00  a= 0.00  fk  bas=true

At the bound the latch now zeroes v AND a together and keeps glyph=fk — the cycle-0 eye-walker
v=0.00-with-nonzero-a inconsistency is GONE. Physically-correct at-the-bound case. Focus d: RESOLVED.

### (e) STATE_1 / STATE_2 — no regression
- STATE_1 (incline_decompose): A s=2, v=0, stuck=true, N=46.04, f=16.76 — static decompose overlay
  intact (no friction HUD row rendered on this beat, as designed).
- STATE_2 (thin-margin hold): theta holds 20deg then ramps 20 to 23.5deg (1000-8000 ms) then holds; block
  NEVER moves (s=2.000, v=0, stuck=true, fs) through ramp AND hold; f tracks 16.76 to 19.54 N. The
  deliberately thin margin at 23.5deg holds at runtime. Matches cycle-0.

---

## Gate results

Re-verified this cycle (touched by the timing edit and/or the integrator-region engine edit):

| Gate | Result | Evidence |
|---|---|---|
| 1 tsc | PASS | npx tsc --noEmit exit 0 (founder-run; check:renderer-syntax OK on both renderers). |
| 2 validator | PASS | 127 PASS / 0 FAIL; PASS block_on_incline.json, zero WARN on target (founder-run). |
| 3d E42 physics | PASS | Runtime: N=mg.cos(theta) (S4 N=45.43 at theta22 = 49.cos22); SigmaF=0 at equilibrium (A a=0 stuck; S2 held); fk 17.26 lt fs 18.36; B a=0.219=g(sin - mu_k.cos); S3 theta_c=atan(mu_s)=24.2deg. All match the physics block, not the worksheet. |
| 4 visual walk | PASS | field_3d: THE EYE 23/23, 0 warnings (manifest.warnings empty) + live walk of all 5 states (PM_nlbEngine present, correct mode) + STATE_4__frozen.png read directly. Legacy 4a/4b N/A (retired chat/pill stack). |
| 7 console/log | PASS | Zero errors across both probe walks (all 5 states + pin). Zero page errors. |
| 8 bug queue / scar | PASS | Scar closed = Branch-A twin of coupled fix bc649d4 (scar_candidates.sql:426 nlb_coupled_readouts_revert_to_rest_values_on_bound_halt). Runtime confirms B stays fk=17.26, distinct from A fs=18.36, post-bound; regression absent. confusion_cluster_registry N/A-DORMANT. See recommendation. |
| 15 Pass-2 (timing) | PASS | The 7100 ms pin now lands MID-SLIDE (B v=-1.95) — a STRONGER 15b/15c curiosity beat than a halted end-state; resolving formula fk=mu_k.N lands. 15e re-entry OK. |

Carried forward from cycle 0 (content/structure gates untouched by a single at_ms number + an
integrator-region engine edit; re-reading the frozen frame re-confirmed layout/text are clean):

| Gate | Result | Note |
|---|---|---|
| 0 DoD | PASS (carried) | JSON structure unchanged except STATE_4 phases[0].at_ms; 5 states, labels, misconception_watch (S1/S3/S4 pivots), assessment+coverage_map all as cycle 0. |
| 3a mechanical | PASS (carried) | Rule 15 (2 advance_mode), Rule 19 (3+ primitives/state), Rule 23 (advisory prereqs). |
| 3c Socratic | N/A | No narrative_socratic state (Rule-31 concept). |
| 3e Rule 31 | PASS (carried) | Distinct motion per state; S4 controls_visible=mu_k confirmed live (mu_k=0.38 slider in frozen frame); no wait_for_answer/pause_after_ms. |
| 3f Rule 32 + words | PASS (carried) | text_en unchanged; S4 caption "Moving friction is weaker" (5-word delta cue) confirmed in frozen frame; one glow focal (nlb_arrow_B_friction). |
| 3g Rule 33/34 | PASS (carried+confirmed) | Frozen frame: ONE Unicode formula surface (fk=mu_k.N, math-serif), value-only HUD (top clears the Full-screen button), no overlay collision; all math Unicode. |
| 5 / 6 | N/A | Deep-dive / drill-down deferred (Rule 18/22). |
| 9 layout overlap | PASS (carried) | check-layout-overlap.mjs clean cycle 0; frozen frame shows HUD/formula/slider in distinct zones. |
| 10 expr resolution | PASS (carried) | No {var} leak. |
| 11 plain-English | PASS (carried) | No Hinglish; SigmaF/theta/mu standard notation. |
| 12 continuity | PASS (carried) | Same ramp+block apparatus; S4 adds body B (declared). |
| 13 anim vocab | PASS (carried) | param_ramp/phases/idle_auto_sweep/mode-driven — all wired. |
| 14 Pass-1 | PASS (carried) | Skeleton complete, no TBDs (14b DORMANT). |
| 16-18 | PASS (carried) | Misconception at S1/S3/S4 pivots; one new variable/state; concrete-first. |
| 19-20 coverage/quiz | PASS (carried) | Validator PASS; distractors encode real misconceptions. |
| Anti-plagiarism / Rule 35 | PASS (carried) | Universal anchors; no country-specific content, no Hinglish. |

---

## Recommendation (non-blocking, text-only — no DB write this cycle)
The Branch-A bound-halt latch fix has NO dedicated scar row; only its coupled twin (scar_candidates.sql:426)
is recorded. Recommend the engine owner (peter_parker:field3d_surgeon) append a FIXED text row mirroring
line 426 — bug_class nlb_uncoupled_readouts_flip_to_static_on_bound_halt, probe: for each single-body
incline_slide state, sample the friction glyph + f value at t=1s (sliding) and again after the bound halt
(v==0), and assert the glyph and abs(f) are unchanged — when the engine change is committed. Not a blocker.

## Disclosed residual — S3 friction-arrow floor: UNCHANGED (LOW, still shippable)
The sub-15 N force-arrow length floor (phases cannot gate per-kind arrow visibility) is untouched by the
latch edit — S3 friction still reads 0.24 to 20.07 N with the arrow clamped to a stub only during the
early static build-up where friction is SUPPORTING. NOT worse than cycle 0. The recommended OPEN engine
scar (field3d_phases_cannot_gate_per_kind_arrow_visibility) still stands. Not a blocker.

## Known false-positive classes — explicitly NOT reported
Frozen-frame-as-dense-continuation; the designed end-of-track halt (no slide loop by design — B/A hold at
their bounds correctly); confusion_cluster_registry (N/A-DORMANT); absent audio_manifest.json (correct,
Rule 30h/30i). The probe SET_TIME_FREEZE-via-postMessage did not halt the engine in the Playwright harness
(harness quirk, not a defect); THE EYE own frozen-capture path is separate and authoritative, and
STATE_4__frozen.png confirms the 7100 ms mid-slide pin directly.
