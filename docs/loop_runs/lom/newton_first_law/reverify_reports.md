# RE-VERIFICATION REPORTS — `newton_first_law` (lom-b concept 1/3)

**2026-07-25.** Post-engine-fix re-verification after the concept was unparked. The blocking defect
`field3d_nlb_physics_clock_not_state_local` was fixed on `feat/lom-a` (cd8fe67) and cherry-picked
here as **3e1b159**. Content was NOT re-authored — the concept JSON is byte-unchanged since the
prior quality-auditor PASS.

## Verify chain (orchestrator, this session)

| Step | Result |
|---|---|
| `npm run check:renderer-syntax` | field_3d syntax OK (2159 KB) · particle_field syntax OK (220 KB) |
| `npx tsc --noEmit` | **0 errors** |
| `npm run validate:concepts` | **126 PASS / 0 FAIL**; `newton_first_law.json` PASS |
| `npm run cache:clear:scoped -- newton_first_law` | simulation_cache concept_key deleted=1 |
| re-seed `_seed_newton_first_law_cache.ts` | assembled sim_html 2,265,459 chars · seeded |
| `npm run visual:eyes -- newton_first_law` | **19 deterministic checks · 19 passed · 0 failed · $0.00** · 109406 ms → run dir `.visual_runs/newton_first_law/20260725-202536/` |
| `npm run build:review -- newton_first_law` | built, 4 states; HTTP **200** at `http://localhost:8090/newton_first_law/` |

Re-seed was required and performed: the sim HTML is assembled from the renderer and cached, so the
renderer fix would not otherwise have reached THE EYE.

> Note for the record — eye-walker flagged that the deterministic `D1p/D5/D6/D7/H1/H2` summary is not
> persisted into `manifest.json` and no console log is written to disk, so it could not cite the line
> from artifacts alone. The orchestrator captured it directly from the run (row above). **Process gap
> worth closing:** have `visual_eyes.ts` persist its summary line into `manifest.json`.

---

## quality-auditor — VERDICT: PASS

Re-ran the gates the engine fix could have changed; carried the purely-authorial gates forward from
the prior PASS (JSON unchanged), stating explicitly which were which.

**Re-ran:**
- **Gate 4 (live visual walk)** — PASS. Both pre-fix failure signatures are gone:
  - *Symptom A (STATE_1 frozen)*: was `v = 0.00` on an empty track (block had hit the +10 m bound
    before the reveal window), contradicting "No force — never slows". Now `dense_t00000` shows the
    block at launch (x ≈ −8) with `v = 1.00 m/s`, `ΣF = 0.00 N`, and `__frozen` shows it coasted to
    mid-track **still reading `v = 1.00 m/s`**.
  - *Symptom B (STATE_2 first capture)*: was `v = 0.02 m/s` (98% pre-decelerated), leaving the state
    static for its whole ~14 s. Now `dense_t00000` reads `v = 1.00 m/s`; `dense_t04000` reads
    `v = 0.03`; `frozen` reads `v = 0.02`. **The ~4 s deceleration now plays entirely inside the
    reveal window.**
- **Physics / HUD ↔ caption consistency** — PASS. S2: fₖ = μₖ·N = 0.025·(2·9.8) = 0.49 N ✓ matches
  HUD; a = −0.245 m/s² ⇒ t_stop = 4.08 s ✓ matches "stops in ~4 s". S3: N = m·g = 19.60 N ✓,
  ΣF = 0.00 ✓. S4: ΣF = F, a = ΣF/m = −0.16/2 = −0.08 m/s² ✓ internally consistent.
- **Gate 7 (console + log discipline)** — PASS. Review site HTTP 200; manifest `warnings: []`, zero
  timeouts, all 4 states reached. No audio manifest = silent narration is EXPECTED (TTS founder-gated
  in this loop), not a defect.
- **Gate 8 (engine_bug_queue regression)** — PASS. The fixed scar no longer manifests; all other
  `newtons_laws_body` seam scars are structurally absent on this concept (no pulley, no hanging body,
  θ = 0, no label collision, sandbox sliders correct). `confusion_cluster_registry` probe N/A-DORMANT.
  **No new scar candidate from this re-audit.**

**Carried forward (spot-checked, not re-derived):** Gate 0 DoD · Gates 3a/3d/3e/3f/3g (Rule 15 two
advance_modes, Rule 19 ≥3 primitives/state, Rule 31 archetypes + declared S1/S2 contrast pair +
per-state `controls_visible` [] / [] / ["m"] / all-5, ≤5-word delta cues opening every caption) ·
Gates 9–13 · Gates 14/15 · Rule 35 universal anchor (space-probe / ice-vs-rough-table). Gate 3c N/A
(no `narrative_socratic`); Gates 16–20 N/A deferred (no `assessment` block).

**Return-to-author routing:** none. **Scar candidates emitted:** none.

**Advisory (non-blocking, unchanged from the prior audit):** DoD §10(f) over-declares `assessment` +
`coverage_map` while Gates 16–20 are dormant — the architect should drop that mandate (or supply a
full 6-item plan) on next touch so the tension does not recur.

**Cosmetic note (not a defect):** in S4 the `F` slider row label rounds to −0.2 N while the swept
instantaneous value is −0.16 N — the idle auto-sweep's continuous value not snapping to the 0.5 step
grid. HUD `F` and `a` agree; no physics error.

---

## eye-walker — EYE VERDICT: CLEAN, 0 NEW CANDIDATES

Read the full `20260725-202536` frame set (both contact sheets at grid resolution, every dense frame
needed to trace the S1/S2 velocity–position curves at full resolution, all `_frozen`/`_panel_a`
frames for all 4 states, S3 dense across the full window, S4 dense + 4 keyframes).

**CRITICAL clock defect — CONFIRMED FIXED.**
- **STATE_1** `coast_no_force`: `v = 1.00 m/s` holds constant from `dense_t00000` through
  `dense_t16000` **and** the frozen pin — no snap to 0.00. Position advances monotonically; the
  "No force — never slows" caption is no longer contradicted at the frame a teacher leaves frozen.
- **STATE_2** `coast_with_friction`: first dense frame now reads `v = 1.00 m/s`, and the decel is
  progressive and visible — t0 = 1.00 → t1000 = 0.76 → t2000 = 0.51 → t3000 = 0.27 → t4000 = 0.03 →
  t5000 = 0.00, with friction correctly flipping kinetic (fₖ = 0.49 N) → static (f_s = 0.00 N) and
  ΣF −0.49 N → 0.00 N. **The concept's PRIMARY aha — the declared S1/S2 contrast pair — is now
  actually visible frame-to-frame.**

*Detour saved for the next reader:* `STATE_2__panel_a` and `STATE_2__frozen` both read `v = 0.02`,
superficially close to the old buggy frozen readout. Verified **not** a recurrence — both are captured
at the state's *reveal-complete* pin time (cross-checked against STATE_1, whose panel_a/frozen share an
identical non-zero early position mapping to ~t ≈ 3000 ms on its own position–time line). A
reveal-complete pin at t ≈ 4000–4200 ms naturally yields a small-but-nonzero v on the real decel curve —
internally consistent with the dense series. No candidate filed.

**Per-state verdict table**

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| STATE_1 `coast_no_force` | OK — v=1.00, ΣF=0.00, mg+N balanced | OK — constant-v translation, no stall, no teleport | OK — caption now honestly represented | OK | CRITICAL regression check PASSES |
| STATE_2 `coast_with_friction` | OK — reveal-complete pin consistent with dense curve | OK — genuine 1.00→0.00 decel over ~5 s, then holds at rest to t=14000 | OK — strong, now-visible contrast vs STATE_1 | OK | CRITICAL regression check PASSES (was fully broken) |
| STATE_3 `rest_equilibrium` | OK — N=19.60 N, ΣF=0.00 pinned, mg/N equal-opposite | n/a (static by design) | OK vs STATE_2 | OK **except glow handoff** | known MODERATE item, see below |
| STATE_4 `sandbox` | OK — all 5 sliders (m, F, μs, μk, v₀) | OK — `idle_auto_sweep` on F drives real continuous motion + live HUD across all 5 keyframes (t=94→10111 ms); Rule 37 free-run confirmed | n/a (explore, exempt) | OK | no defects |

**Candidate `engine_bug_queue` rows — NEW: ZERO.**

**Known / already-logged (carried, not re-filed):** `field3d_nlb_phase_glow_handoff_not_visible` —
MODERATE, owner **ambiguous** (`peter_parker:renderer_primitives` vs `alex:json_author`). STATE_3's
authored `weight → normal` glow handoff at 4000 ms fires in code but produces no perceptible
brightness delta (arrows read identically bright across t=3000/4000/12000/frozen). Confirmed still
reproducing, unchanged by this clock fix, non-blocking. It sits in
`docs/loop_runs/lom/_engine/scar_candidates.sql` (report only) and has never been inserted into the
DB — **still awaiting founder ownership triage**; Amendment 4's one-bug_class-per-dispatch rule also
bars bundling it.

**Frames for founder eyes (3 — the fix proof):**
1. `.visual_runs/newton_first_law/20260725-202536/STATE_1__frozen.png` — the exact frame that
   regressed before (was v=0.00, block stopped at bound); now reads v=1.00, honoring "never slows".
2. `.visual_runs/newton_first_law/20260725-202536/STATE_2__dense_t00000.png` — the first captured
   frame of the friction state now shows full launch velocity (v=1.00) instead of 98% decelerated.
3. `.visual_runs/newton_first_law/20260725-202536/STATE_2__dense_t02000.png` — mid-decel (v=0.51),
   for a side-by-side against t00000/t04000/t05000 to see the arc land visually.

---

## Gate outcome (CHAPTER_LOOP Amendment 6)

quality-auditor **PASS** + eye-walker **zero NEW candidates** ⇒ auto-approve fires.
`npm run visual:approve -- newton_first_law` run by this session; concept **SEALED**.
