# Ch.7 engine-loop log

Per docs/CHAPTER_LOOP.md §3b commit + audit discipline. Founder reviews via
`git log --grep=engine-loop -p` + this file.

---

## Stage 1a — particle_field chrome-collision shakedown (2026-07-22)

**Rollback point (pre-dispatch HEAD):** `7a2fee1ab958eab348f06bb63a60ae14734415a2`

**Finding:** `docs/loop_runs/stage0_calibration/CALIBRATION_REPORT.md` §4 — the OPEN scar
`field3d_sliders_panel_top12_vs_fsbtn_top10` names a Rule-34d class (top-anchored DOM overlay
collides with the review chrome) that field_3d was fixed for but `particle_field_renderer.ts:727`
(`#pm-sliders`, `top:10px;right:10px`) was never migrated. Affects all 13 shipped particle_field
concepts.

**Owner dispatched:** `peter_parker:renderer_primitives`, via a `general-purpose` stand-in carrying
`.claude/agents/renderer-primitives.md` as its operating spec — the native `renderer-primitives`
dispatch type is not registered in this session (roster gap, not a protocol change; founder confirmed
the stand-in for this run). Two dispatch attempts: the first was interrupted mid-flight by the founder
(who wanted the founder-proxy decision explained in plain language first) and left an uncommitted
hardcoded `top:52px` edit + 4 scar blocks in the working tree; the re-dispatch below found, reconciled,
and superseded that stray edit before landing the founder-approved fix shape.

**Founder decision (before re-dispatch):** reject the hardcoded field_3d-parity shape. THE EYE
screenshots the raw sim page (no chrome), so `#pm-sliders` sits inside the LOCKED baselines of all 13
particle_field concepts, and the trial forbids `visual:approve` (no in-loop re-lock). Chosen fix:
**chrome-aware conditional** — shift to `top:52px` only when the review chrome is detected present,
else stay `top:10px`, so raw-capture baselines stay byte-identical.

**Fix landed:** `src/lib/renderers/particle_field_renderer.ts` only.
- New `pfInReviewChrome()` helper (before `buildOverlayUI`): `window.parent !== window` AND the
  parent document exposes `#fsTopControls`/`#fsBtn` → true only inside the real review tool
  (same-origin parent); false in THE EYE's bare-wrapper capture (no chrome, or cross-origin).
- `#pm-sliders` cssText: `top:10px` (literal) → `top: pfInReviewChrome() ? '52px' : '10px'`.
- Other two `position:fixed` overlays (`#pm-caption`, `#pm-formula`) audited, NOT moved — no genuine
  chrome overlap (driver: 0 caption collisions across 5 states; formula is bottom-right, chrome is
  top-anchored only).

**Verify chain (§3b):**
1. `check:renderer-syntax` → PASS · `tsc --noEmit` → PASS · `validate:concepts` → PASS
   (124/124 atomic; pre-existing unrelated WARNs only).
2. Reseed + rebuild + drive `wheatstone_bridge`: chrome branch — collisions **8 → 0**, flags=0,
   consoleErrors=0. Raw branch — `visual:eyes -- wheatstone_bridge` **32/32, 0 diffs** vs locked
   baseline (proves the conditional's false-branch is a no-op under THE EYE).
3. Regression sample (particle_field): `visual:eyes -- ohms_law` **38/38, 0 diffs**.
4. Clock guard (Rule 36b): diff touches no `__pmSteps`/`dtStep`/`deltaTime`/integrator — full-fleet
   sweep not required.

**Scar candidates (files only, NOT applied):** `docs/loop_runs/ch7/_engine/scar_candidates.sql`
blocks (1)–(4) are from the interrupted first attempt (block 1's prevention_rule needs a founder edit
— it currently overstates a hardcode that was not what landed); block (5) is the authoritative record
for the fix that actually shipped (`particle_field_sliders_panel_top10_vs_reviewchrome`, status FIXED
in the candidate text, `concepts_affected` = all 13). Also logged but NOT fixed this dispatch (deferred,
own future findings): canvas-drawn HUD top-corner collisions (`pf_canvas_hud_top_corner_vs_review_chrome`,
invisible to the DOM-only driver probe), the caption max-width latent risk
(`pf_caption_maxwidth_68pct_can_reach_review_chrome`), and the tall-panel-vs-formula-overlay risk on
short viewports (`pf_tall_slider_panel_can_reach_formula_overlay_on_short_stage`).

**Commit:** see `git log --grep=engine-loop -p` for `fix(engine-loop): particle_field_sliders_panel_top10_vs_reviewchrome [peter_parker:renderer_primitives]`.

**Outcome:** Stage 1a shakedown PASSED — dispatch + verify chain + rollback-readiness + commit
discipline all exercised successfully on a known defect before Stage 1b's novel content run.
