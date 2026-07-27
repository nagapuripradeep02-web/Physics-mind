# QUALITY-AUDITOR REPORT — connected_bodies (Laws of Motion #2) — CYCLE 2 (FINAL)

- Concept: src/data/concepts/connected_bodies.json — 7 states, field_3d, scenario_type newtons_laws_body (Branch B coupled/Atwood)
- Cycle: 2 (FINAL) - Branch: feat/lom-a - Date: 2026-07-26
- Change under audit: exactly ONE — engine fix 3, commit aa7daf5, resolving cycle-1 ship-blocker NEW-A.
- Evidence: THE EYE run .visual_runs/connected_bodies/20260726-002614/ (31/31, manifest warnings []); frozen frames read directly; fresh tsc = 0 (EXIT 0); validate:concepts = 126 PASS / 0 FAIL, target PASS, no bounds warning, registration all OK; JSON re-parsed this session.

## VERDICT: PASS
## RECOMMENDATION: SEAL

The single cycle-1 ship-blocker (NEW-A: STATE_6 rendered no pulley wheel, ropes to nowhere, glow_focal invisible) is RESOLVED and verified in the pixels. All six guided states remain physically correct and held (the fix is a scoped-visibility change that leaves every physics path byte-identical per the surgeon isolation proof, corroborated against cycle-1 runtime values). The three carried items are all engine-surface and none blocks a teacher teaching connected-bodies. With the runaway guard tripped (3 engine commits: 5a07aa9, bc649d4, aa7daf5) and no further engine fix available, SEAL is correct — the concept is teacher-ready; residual items are cosmetic/edge-of-sandbox polish for a later batch, not defects that mislead physics or break the visual.

## The fix — verified from pixels AND runtime

Engine fix 3 (aa7daf5): the pulley bracket (post + arm + wheel + hub) is a SIBLING of the slab under the surface group; the per-state hide now targets nlb_surface (the slab mesh) with o.visible = !surface.hidden, while nlb_surface_group is forced visible = true (diff read directly at field_3d_renderer.ts ~30827). The group no longer drags the pulley down with the slab.

STATE_6 frozen (STATE_6__frozen.png) and dense_t08000 now show a REAL Atwood machine:
- The glowing pulley wheel (silver ring + dark hub) is present, top-center, and is the single bright focal element — the declared glow_focal nlb_pulley_wheel now exists on screen (Rule 32e satisfied).
- Both grey ropes rise from m1 (blue, hanging) and m2 (red, hanging) tangent to the rim — one rope over one wheel, the model S6 exists to teach.
- No table slab (correct — an Atwood has no table).
- HUD: m1 a = 0.24 m/s2, T = 20.08 N; m2 a = -0.24 m/s2, T = 20.08 N — ONE shared tension, matching task-expected S6 (a=0.239, T=20.08 in (19.60, 20.58)). Held into the frozen baseline.
- Formula a = (m1 - m2)g / (m1 + m2); delta-cue caption "Only the difference drives".

## Regression re-confirmation — nothing regressed

- S1/S2: a = 0.00, T = 19.60 (earned-wrong-belief T=m2g at a=0; both bodies glide) — held.
- S3 (PRIMARY aha): frozen HUD m1/m2 T = 13.07, a = 3.27 — matches; T < m2g = 19.60, misconception confronted; caption "T is not m2g", formula T = m2(g - a), A_ghost trail present. Held.
- S4: a = 0.65, T = 18.29 — held.
- S5: a = 0.43, T = 28.11, N = 33.95 (f = 6.79) — held; static incline known-and-expected.
- S6: a = 0.239, T = 20.08 — held (frozen HUD above).
- S7 sandbox: live 7-slider panel, full HUD, Newton-consistent numbers.

Content gates re-parsed this cycle:
- Word budget: S1=51 S2=55 S3=54 S4=51 S5=52 S6=52 (all in [25,55]; S2 at ceiling), S7=22 (exempt). PASS.
- advance_mode: 2 distinct (manual_click x6, interaction_complete). prims = 3 every state. PASS.
- Language: text_te absent, text_hi absent — English-only (Rule 30i). PASS.
- Anchor: elevator car + counterweight on a shaft-top pulley — universal, culture-neutral; no country token. Rule 35 PASS.
- Registration: VALID_CONCEPT_IDS / renderer map / panel map / PCPL all OK.
- Console: manifest warnings []; no timeouts; 0 errors. PASS.
- Unicode: on-canvas math Unicode, one formula surface per guided state. PASS.

## The three CARRIED items — explicit judgment

### 1. S7 sandbox reaches a > g / non-physical tension at deliberate extreme input — NOT ship-blocking (reconfirmed)
With m1=0.5, mu=0, F=+20 the rigid Branch-B model solves to a=15.06 m/s2 (> g) and prints abs T=10.51 while the true string tension is negative — a taut rope cannot push, so physically it should go slack (T=0) and B free-fall at g. No NaN, no crash, finite Newton-consistent numbers. [judgment] ACCEPTABLE TO CARRY: all six guided states are correct and held; the a>g regime is reachable ONLY by pushing the shared F slider to its extreme against near-minimum m1 in the explicit free-exploration state; a teacher would not naturally hit it, and if they did the sim degrades gracefully. Later polish: clamp T>=0 with a slack-rope visual, or narrow the shared F range. Owner peter_parker:field3d_surgeon.

### 2. S7 m2 HUD block bleeds into the slider panel (Rule 34d, LOW) — cosmetic-carry
The sandbox HUD is the tallest in the concept and its lowest lines graze the top slider row. Engine-generated layout, not concept-authored, minor legibility only, not a regression from this cycle. [judgment] ACCEPTABLE TO CARRY. Owner peter_parker:field3d_surgeon.

### 3. NEW — STATE_6 pulley POST BASE visibly floats — cosmetic-carry, NOT ship-blocking
With the slab gone, the grey vertical post (which in the table states mounts to the table edge) hangs with nothing beneath it: read directly in STATE_6__frozen.png / dense_t08000, the post base terminates in open space near mid-canvas rather than mounting to a ceiling above or a stand/floor below. This layer had never rendered before aa7daf5, so it was never content-reviewed — correct call to surface it.
[judgment] COSMETIC-CARRY, not ship-blocking, and categorically different from cycle-1 NEW-A. NEW-A blocked because the core teaching OBJECT was entirely absent (no wheel, ropes to nowhere — not an Atwood machine). Here every teaching element is present and correct — wheel, two ropes tangent to the rim, both hanging masses, T-up / mg-down arrows, shared-tension HUD, the (m1-m2)g/(m1+m2) formula — and the physics reads correctly. The floating post is a realism gap in a small off-to-the-side grey element that neither obscures nor contradicts the physics; a teacher reads "one wheel, two masses, the difference drives it" regardless. It looks slightly unfinished, not wrong.
Later polish (batch with items 1-2, NOT this cycle — runaway guard tripped): in connected_atwood mode extend the post to a ceiling/beam mount, add a floor stand, OR hang the wheel from a top bracket and hide the unmounted lower post. Owner peter_parker:field3d_surgeon.

## Gate-by-gate (deltas from cycle 1)
- Gate 0 DoD: PASS. Gate 1 tsc: PASS (EXIT 0). Gate 2 validate: PASS (126/126, target PASS, no bounds warning).
- Gate 3a: PASS. 3c: N/A (Rule-31). 3d E42: PASS. 3e Rule31: PASS. 3f Rule32+budget: PASS. 3g Rule33/34: PASS with NEW-B + item 3 noted.
- Gate 4 live visual walk: PASS (was FAIL) — S6 pulley wheel now renders; all 7 states verified in pixels.
- Gate 7 console: PASS. Gate 8 bug-queue: cycle-0/1 scars + NEW-A scar FIXED (founder to flip rows, no DB write); confusion_cluster_registry N/A-DORMANT; 2 new LOW OPEN-candidate rows for founder (item 1 slack-rope, item 3 post float), both field3d_surgeon.
- Gate 9: PASS w/ NEW-B. Gate 10: PASS. Gate 11: PASS. Gate 12: PASS (S6 declared change, pulley now persists). Gate 13: PASS. Gate 14: PASS. Gate 15: PASS (S6 focal now visible; 15d holds all states). Gates 16-20: PASS structural.
- Anti-plagiarism / Rule 35 / Rule 30i: PASS. Rule 20 / mode_overrides: PASS (absent = correct).

## Routing summary
No content routes (alex:* clean). All three carried items owned by peter_parker:field3d_surgeon [reason: engine], deferred to a later polish batch — none blocks this SEAL. No further engine fix this cycle (runaway guard). No DB writes made.
