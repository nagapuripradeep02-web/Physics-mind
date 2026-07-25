# PROGRESS_CHEMISTRY.md — PhysicsMind Chemistry Build

> Dedicated chemistry build log (sibling of root `PROGRESS.md`, which stays the physics/engine log).
> Newest session first. Chemistry work started 2026-07-23 on branch `feat/chemistry-foundation`.
>
> **Companion docs:** `docs/CHEMISTRY_ARCHITECTURE.md` (design — extend, don't duplicate) ·
> `docs/CHEMISTRY_BUILD_PLAN.md` (phase-by-phase execution plan + tracker) ·
> `docs/CHEMISTRY_DISCUSSIONS.md` (strategy/decisions log) · `docs/patterns/chemistry.md`
> (architect pattern library) · `.agents/chemistry_author/CLAUDE.md` (the rigor role).

## Phase status

| Phase | Name | Status |
|---|---|---|
| 0 | Safety baseline | ✅ 2026-07-23 |
| 2 | Authoring layer (`chemistry_author` + pattern library) | ✅ 2026-07-23 |
| 1 | Curriculum plumbing (subject first-class) | ✅ 2026-07-23 |
| 2.5 | Parity hardening (4 shared specs + tooling + validate:chemistry) | ✅ 2026-07-23 |
| 3 | First concept — **Bohr energy levels** (Wave 1 pivoted from Rutherford; prove-first) | ✅ 2026-07-23 — authored, validated, renders on the teacher surface (formal quality_auditor + Asmi review pending) |
| 4 | Chemistry machine gates (ledger check, animation vocab) | ☐ |
| 5 | Chemistry render surface (particle-box, then Three.js molecule/orbital) | ☐ (founder-gated) |

## The renderer-compounding build FLOW (locked 2026-07-23 — see CHEMISTRY_DISCUSSIONS.md §C3)

Build by **renderer archetype, not by chapter** — each renderer surface, built once, is reused by the
next concept, so cost-per-concept falls as the catalog grows (the physics magnetism recursive-bootstrap,
applied to chemistry). Every Wave 1–3 concept sits in NCERT **and** IGCSE/IB/AP/A-level; Rule 38
depth-rings absorb the depth difference (author at NCERT/JEE depth, hide the advanced ring for lighter
boards).

| Wave | Archetype | Renderer cost | Concepts (build order) |
|---|---|---|---|
| 1 Prove it | K trajectory | £0 (reuses built `magnetic_force_moving_charge`) | **Rutherford α-scattering** [→ electron-discovery deflection] |
| 2 Passport ⭐ | M particle-box (+N graph) | build gas-collision box ONCE | kinetic particle theory/states → diffusion → rates → collision theory → equilibrium/Le Chatelier |
| 3 Energy | L ladder (+N) | modest (generic 2D primitives) | Bohr/energy levels/spectra · reaction energy profiles/enthalpy/activation energy |
| 4 Bookkeeping | O ledger | cheap (generic primitives) | balancing · conservation of mass · mole concept · stoichiometry |
| 5 Structure | P Three.js | big (Phase 5) | orbitals s/p/d · bonding/VSEPR · hybridization · organic mechanisms · electrochem cells |

---

## 🧪 SESSION (cont. 2) — Clearing the open list: THE EYE unblocked + run, scar-list probes mechanised, renderer Rule-29 fix (2026-07-24)

**Bottom line: five of the "still open" items are closed and THE EYE now RUNS on the parametric/chemistry family for the first time. Physics untouched throughout — tsc 0 · validate:concepts 124/124 · validate:chemistry 1/1 · both renderer bodies syntax-OK. Only the genuinely human/founder-gated items remain (Asmi review; the Supabase migration; two fuzzy probes).**

### THE EYE — unblocked (root cause found) and RUN
The "environmental Playwright stall" was NOT a network problem. A **hung download process from 02:37 (≈11 h old, ~0 CPU)** was holding `ms-playwright/__dirlock`, so every new install bailed instantly on the lock. Worse, even a fresh install **downloads 100 % of 92 MiB then hangs in EXTRACTION** — it writes only `ABOUT` + `LICENSE` (the two small text entries) and stalls before the 156 MB executable (macOS security scan on the binary write is the likely culprit; the binary runs fine once present, so not Gatekeeper-at-launch). Fix: killed the zombie tree, cleared the lock, then **salvaged a complete leftover temp zip** (`$TMPDIR/playwright-download-*/…headless-shell…1217.zip`, `unzip -t` clean) and extracted it manually into the cache + wrote `INSTALLATION_COMPLETE`. `chrome-headless-shell --version` → `Google Chrome for Testing 147.0.7727.15`.
- Then: `_seed_chemistry_cache.ts bohr_model_energy_levels` → `visual:eyes`. **THE EYE ran end-to-end: 9 states + 266 dense frames, 39 deterministic checks · 32 passed · 7 failed · $0.** Frames: `.visual_runs/bohr_model_energy_levels/20260724-140150/` (298 PNGs).
- **The 7 failures are all one class — [D7] "frozen tail" on the guided states (S1–S5, S7, S8; S6 and the S9 explorer PASS).** Motion runs ~10–17 s then holds static through D7's 30 s dense window. This is settle-then-hold, NOT a crash (motion runs for seconds first; no console exceptions). Two entangled causes, both a founder/eye_walker call: (a) D7's 30 s window over-captures the legitimate Rule-26 post-narration hold → a **D7-calibration scar candidate for the parametric family**; (b) the real Row-4 gap underneath (motion ends a few s before narration). **NOT approved (visual:approve stays founder-gated); the Rule-29 fix was NOT reverted to game the gate.** Note: removing the continuous size-throb (below) is what *unmasked* this — the throb had been keeping pixels changing every frame, hiding the static hold.

### Cross-machine convergence — focal emphasis unified on `PM_focalEmphasis` (2026-07-24, later)
A second machine (`feat/field3d-draggable-sensor`) independently fixed the SAME Rule-29 violation the
same day. Its `PM_focalEmphasis(spec) → {isFocal, alphaMul, glowPx}` landed in **`2435706`
"feat(pcpl): harden parametric renderer to doctrine parity"** (peter_parker:renderer_primitives).
**It won on merit and this tree adopted it**, deleting our `PM_focalPulseBoost`/`PM_brightenRgb`:
it dims non-focal peers (`alphaMul 0.6` — Rule 29 as written, "focal brightens **+ peers dim**",
which is what makes Rule 32e legible), uses a real `shadowBlur` glow rather than a white colour-lerp
that washes out on light elements, is **static** so it doesn't re-mask THE EYE's D7 frozen-tail
probe, and holds `glow_focus`'s halo radius CONSTANT (ours multiplied it by `1+boost`).
Ported **verbatim** — `diff` against their function is exactly ONE line: their `PM_simClockMs` →
this tree's freeze-aware `PM_now()`, so freeze-determinism holds under our clock.
- Rewired 5 sites: `drawLabel`/`drawAnnotation`/`drawForceArrow`/`drawFormulaBox` +
  `premium_primitives`' `glow_focus`. Glow set/reset pairs verified balanced (a leaked `shadowBlur`
  bleeds into every later primitive); the 5th reset in the file is master's pre-existing `=6`/`=0` pair.
- **Deliberately NOT rebased.** `origin/feat/field3d-draggable-sensor` is **23 commits behind master**
  (predates `capacitance.json`, `meter_bridge`, Rule 39g fleet-wide widgets, pilot catalog 47→53);
  rebasing onto it would move our base backwards. We stay on current master — when their 11 commits
  land, the rebase is a no-op for this file because the content is now identical.

**Post-rewire verification:** tsc 0 · validate:concepts **124/124** · validate:chemistry **1/1** ·
both renderer bodies syntax-OK · `build:review` exit 0 for a chemistry AND a physics parametric
concept · emitted p5 body (3552 lines) `node --check`s clean for both · glow set/reset pairs balanced.
**THE EYE re-run: 39 checks · 33 passed · 6 failed** (was 32/7) — **STATE_2's D7 recovered** and
**no new failure class appeared**; all 6 remaining failures are still the single pre-existing D7
frozen-tail class (S1/S3/S4/S5/S7/S8; S2/S6/S9 pass). Removing the sine pulse was expected to keep or
strengthen D7, and it did — the signal is now honest rather than masked by per-frame churn.

**Two claims from the cross-machine analysis were checked and corrected:** "master has no focal
machinery" (❌ master HAS `PM_focalPulseScale` at line 447 — it was a live Rule-29 violation, not a
gap) and "their branch deletes `capacitance.json`" (❌ **false alarm** — absent at the merge-base;
master added it *after* they branched). Their `pcplRenderer/` deletion IS real and **safe** (only
"Ported from…" comments reference it; zero imports in `src/`).

### ⚠ FLAGGED for the other machine — a SECOND collision the earlier analysis missed
**The player-clock contract is NOT additive.** Their branch already has a full clock —
`PM_simClockMs`/`PM_clockAccumMs`/`PM_paused`/`PM_frozen`/`PM_pinTargetMs`/`PM_pinCatchupPending`,
fixed 1/60 s ticks with deterministic catch-up, and `window.__PM_supportsTimePin` for THE EYE
(19 `SET_TIME_FREEZE` refs). Message types differ **both ways**:
- **Theirs LACKS `RESET_TRAJECTORY` + `REPLAY_ANIMATIONS`** — the ▶ Play path (ours has them).
- **Ours lacks `SET_CUE_TIME`** + their deterministic re-sim catch-up.

Their deterministic re-sim is the stronger base; our Play/Replay path is a genuine gap in theirs.
Converging is a separate, larger job — deliberately NOT bundled into the focal rewire.
Also: their branch modified `check-layout-overlap.mjs` (+103 lines) but **their version still has the
`C:/Tutor/…` Windows path and still hardcodes `STATE_1..STATE_5`** — the vacuous-Gate-9 bug is
unfixed there, so this tree's rewritten version should win that file on merge.

### Scar-list rows closed / mechanised (of the "6 OPEN")
- **Row 7 — `check-layout-overlap.mjs` STATE_1..5 hardcode → FIXED.** Now enumerates states from `Object.keys(epic_l_path.states)` (+ `epic_c_branches`), models each primitive's REAL rendered box (label = font·1.25 centre-anchored; annotation/formula_box = lines·1.35+pad top-left), and applies a 3 px penetration tolerance so the intentional 14 px label stagger stops false-positiving. Proof: it now scans **Bohr's 9 states and vector_head_to_tail's 17** — the old script silently stopped at STATE_5 on both (and hid a real 6 px annotation overlap in vector_head_to_tail STATE_5, a physics finding left for the physics pipeline). Stale `C:/Tutor/...` default path gone; bare ids resolve across physics + chemistry.
- **Row 5 — Rule-29 focal size-bulge → FIXED (renderer).** `PM_focalPulseScale` (a size multiplier hitting textSize/strokeWeight/headLen/lineHeight in drawLabel/drawAnnotation/drawForceArrow/drawFormulaBox) is gone. **Now converged on the other machine's `PM_focalEmphasis` — see the cross-machine section above** (our interim `PM_focalPulseBoost`/`PM_brightenRgb` were deleted in favour of it). Verified: emitted sim.html has 0 stale helpers, 6 `PM_focalEmphasis`, and the 3552-line p5 body `node --check`s clean for BOTH a chemistry and a physics parametric concept.
- **Row 2 — indicator hardcoded-to-default → FIXED (probe mechanised).** Hard gate in `validate:chemistry` (`indicatorBindingErrors`): a pointer/caret/needle/marker BODY in a slider state with an `animation` block but no `position_expr` FAILs. Bohr passes (its indicators all bind `position_expr`).
- **Row 4 — narration outruns choreography → probe mechanised as WARN** (`narrationChoreographyWarnings`, heuristic words/2.8 wps, matches the word-budget WARN pattern). It caught that the prior "all 8 retimed" claim was incomplete: **STATE_3 (0.69) and STATE_7 (0.62) still settle before narration ends** — corroborated independently by THE EYE's D7. Stays OPEN until those two are retimed (chemistry_author + Asmi, not a mechanical bump).
- **Rows 3 & 6 remain OPEN** for the next pass: Row 3 (explore-ring symbol) needs reliable symbol tokenisation; Row 6 (computed-but-unsurfaced) is under-specified here — the concept's `computed_outputs` roles are empty strings, and the actual instance is already fixed (S9's `readout_hud` branches on `direction` → absorb/emit word).
- Seed script `_seed_engine_bug_queue_bohr_audit.ts` updated in-place (rows 2/5/7 → FIXED with `fixed_in_files`; row 4 annotated) so a post-migration re-run reflects reality.

### Also closed
- **Catalog naming (was "still open #4"):** `chemistryCatalog.ts` `'bohr_model'` → `'bohr_model_energy_levels'` (concept_id + the two downstream prerequisites), matching the shipped id before the serving path live-wires it.

### Still open (genuinely human/founder-gated)
1. **Asmi professor review** — the human gate; unchanged.
2. **Supabase migration** (`…engine_bug_queue_chemistry_subject_migration.sql`) — verified correct/ready; still needs the founder's hand in the SQL editor (no direct Postgres from here).
3. **Row 3 + Row 6 probes** — next pass (see above).
4. **STATE_3 / STATE_7 retiming** + adjudicating THE EYE's D7 verdict (calibration vs. real) — chemistry_author + founder/eye_walker.

### Files changed
- `src/scripts/check-layout-overlap.mjs` (rewritten — Row 7)
- `src/lib/renderers/parametric_renderer.ts` + `src/lib/renderers/premium_primitives.ts` (Rule-29 brightness emphasis — Row 5)
- `src/scripts/validate-chemistry.ts` (Row 2 hard gate + Row 4 WARN probe)
- `src/lib/chemistryCatalog.ts` (bohr id fix)
- `src/scripts/_seed_engine_bug_queue_bohr_audit.ts` (status/fixed_in_files bookkeeping)
- (env) Playwright `chromium_headless_shell-1217` extracted into `~/Library/Caches/ms-playwright/`; `simulation_cache` seeded for bohr; EYE frames under `.visual_runs/`.

---

## 🧪 SESSION (cont.) — Quality pass: physics-grade polish, the scar list, and the stage-4 gate (2026-07-24)

**Bottom line: the founder's review ("it only fills 50–60% of the panel, text overlaps text, physics sims come out at another level — why not this?") was correct on every count, and the causes were structural, not cosmetic. Fixed, then formally gated. 19 defect classes are now recorded in `engine_bug_queue` (12 from the build, 7 from the audit) — the scar list that makes the NEXT chemistry concept cheaper. Physics untouched throughout: tsc 0 · validate:concepts 124/124 · validate:chemistry 1/1 · both physics review builds green.**

### Why chemistry looked worse than physics — three structural causes (all fixed)
1. **The panel-fill gap was renderer-level, not chemistry.** `field_3d` does `setSize(innerWidth, innerHeight)` and reframes with a camera; the parametric renderer drew on a **fixed 760×500 canvas pinned top-left** — measured 760×500 inside a 972×659 iframe = **59% fill**. Added a config-gated fit-and-center transform (design space preserved, mouse remapped for slider hit-testing) → **100% fill**, verified. Gated so physics app/admin rendering is byte-unchanged.
2. **The overlaps had ONE systemic root cause.** `PM_resolveAnnotationOverlap` force-separates every `annotation` by ~41px. The ladder's rungs converge to 27–50px apart, so all six labels were pushed off their own rungs and the cascade shoved the bottom label onto the λ-strip. **A label pointing at the wrong line is a correctness defect.** Fixed by moving anchored text to `label` primitives (exempt from the resolver).
3. **Transient arrows never disappeared.** `animated_path` primitives without `disappear_at_ms` all persisted into the frozen end frame, stacking their tip-anchored labels — this *was* the S6 bottom-left crowding and the S4 arrows-through-text.

### GAP-2 closed + THE EYE unblocked
- **`position_expr`** added to `drawBody` (positional sibling of `label_expr`) — verified live: dragging n_end 2→6 moved the electron to y=166, exactly the n=6 rung, with readouts recomputing to 1.13 eV / 1094 nm / IR.
- **THE EYE was structurally blocked for chemistry** (it reads `simulation_cache`, not the JSON). Built `src/scripts/_seed_chemistry_cache.ts` (renderer-aware, namespace-general) + extracted `src/scripts/lib/buildParametricConfig.ts` so the review site and the cache seed cannot drift. THE EYE now resolves the concept, enumerates all 9 states and builds reveal maps. **Remaining blocker is environmental only** — the Playwright `chrome-headless-shell` binary download stalls on this laptop's network (license files only, no binary). Re-run `npx playwright install chromium-headless-shell` then `npm run visual:eyes -- bohr_model_energy_levels`.

### The stage-4 `quality_auditor` gate — VERDICT: FAIL (then fixed)
The audit was genuinely adversarial and found what my own visual walk missed. **Chemistry substrate passed cleanly**: ledger exact to the last digit, both compute engines in exact parity, the 6→2 rounding trap correctly avoided (410 not 411 nm), all 36 slider combinations resolve with zero template leaks, isolation clean both directions, assessment well-built, Rule-35 sweep spotless.
- **F1 (CRITICAL, the real blocker):** the parametric renderer implemented only **3 of 7** player message types — no `SET_TIME_FREEZE`/`RESET_TRAJECTORY`/`REPLAY_ANIMATIONS`/`PAUSE`/`RESUME`. So **Play/Pause/Replay were dead on the entire parametric family** (violating root §6 + Rule 26b), and it's precisely why THE EYE could never gate this family — `SET_TIME_FREEZE` is its capture pin. Silent because `PM_simTimeMs` was still exposed, so the player's clock *read* succeeded while every *write* was dropped. **FIXED:** full clock contract implemented; every animation gate now reads `PM_now()`; verified all 7 types present in the built sim.
- **F2–F6 + concerns FIXED:** λ-pointer hardcoded to 656 nm while its own text said 486 (in the state fighting that exact misconception); S9's `n_start` moved nothing; explore state surfaced extended-ring `ΔE`/`UV`/`IR` (Rule 38b); **narration outran motion in all 8 guided states** (Rule 31a inversion — word budget passed, so budget compliance masked it); strip label back inside the renderer-owned slider band. All retimed/rebound; choreography now spans narration in every state.

### The scar list (the founder's ask) — 19 rows in `engine_bug_queue`
Recorded with `bug_class`/`severity`/`owner_cluster`/`root_cause`/`prevention_rule`/`probe_logic`, tagged `discovered_in_session`. **10 of 12 build-round classes are `subject_neutral`** — they bind physics authoring identically (canvas fit, annotation de-overlap, coincident text, ASCII math, control-zone, smooth_camera clipping, review-site branch, position binding, computePhysics dispatch). This is the point: the chemistry run hardened the *shared* factory.
- Migration written (**needs founder to run in the Supabase SQL editor** — no direct Postgres access from here): `supabase_2026-07-24_engine_bug_queue_chemistry_subject_migration.sql` adds the `subject` column **and fixes a latent Phase-2 gap — `alex:chemistry_author` was in both admin UI enums but never in the DB CHECK constraint**, so the UI offered an owner the database rejects. Until applied, rows are stored without `subject` (the seed scripts degrade gracefully and re-running backfills).

### Still open
1. **THE EYE run** — environmental (Playwright binary download).
2. **Asmi professor review** — the human gate; unchanged.
3. **6 OPEN queue rows** for the next pass (indicator-binding probe, explore-ring symbol probe, narration/choreography probe, Rule-29 focal-size violation in the renderer, computed-but-unsurfaced value, and `check-layout-overlap.mjs` hardcoding STATE_1–5 so Gate 9 silently skips later states on every concept).
4. `src/lib/chemistryCatalog.ts` names the concept `bohr_model` vs the shipped `bohr_model_energy_levels` — harmless while chemistry serving is deferred, live-wire when it isn't.

---

## 🧪 SESSION — First chemistry diamond BUILT: Rutherford go/no-go → pivot to Bohr energy levels → full pipeline end-to-end → renders on the teacher surface (2026-07-23, branch `feat/chemistry-foundation`)

**Bottom line: the chemistry pipeline is PROVEN end-to-end and the first chemistry simulation — `bohr_model_energy_levels` — is authored, validated, physically correct, and renders on the real teacher review surface. Two "zero-renderer" premises in the docs turned out to be optimistic (Rutherford AND, more subtly, the "zero engine code" banner for archetype L) — both were caught before wasting pipeline work, and one shared-tooling gap (the review site never supported the parametric renderer at all) was closed additively. Physics untouched throughout (tsc 0 · validate:concepts 124/124 · validate:chemistry 1/1 PASS).**

### The Rutherford go/no-go (decided against; founder pivot to Bohr)
The plan called Rutherford α-scattering a "£0 reuse of `magnetic_force_moving_charge`'s trajectory machinery." A read of `field_3d_renderer.ts` disproved it: Lorentz motion is **hardcoded closed-form** (`trajectory_mode: circle/helix/static`, no general force integrator), no Coulomb scenario animates a moving particle, and `animated_path` is 2D-only + not wired into field_3d. Rutherford's 1/r² **hyperbolic scattering** off a fixed nucleus needs a **new `field_3d` scenario (~200–400 lines)** — exactly the renderer spend Wave-1 "prove-first" was meant to avoid. **This is the same mislabel class as archetype M** (both overstated renderer readiness). Corrected `docs/patterns/chemistry.md`: archetype K split (in-field circular/helical = [LIVE]; scattering = [NEEDS-SCENARIO]), archetype M relabeled [NEEDS-SCENARIO] with a new tier between [LIVE] and [PHASE-5]. **Founder decision: pivot Wave 1 to Bohr / atomic energy levels** (archetype L, genuinely renderable on the existing 2D `parametric` renderer — the true zero-new-renderer path; iconic, NCERT Cl.11 Ch.2, rated "low engine cost" in `CHEMISTRY_ARCHITECTURE.md` §9).

### The Bohr build (full pipeline, sequential)
`architect` → 9-state skeleton (S1 rainbow-vs-lines hook → S2 ladder → S3 quantised-jump contrast (PRIMARY misconception) → S4 exact-photon absorb → S5 emission flip + first line → S6 gap-to-line fingerprint (PRIMARY aha) → S7 ΔE = hν = hc/λ ledger → S8 Eₙ = −13.6/n² + ionisation → S9 explore sandbox), Rule 16a/31/32/33/34/38 plan, universal anchor (glowing-gas sign / starlight). → `chemistry_author` → engine_config, python-verified energy-conservation ledger (E1..E6, four Balmer λ 656/486/434/410 nm, 1→3 absorption 12.09 eV, ionisation 13.6 eV all CONFIRMED), per-state motion timelines, 45 drill-down phrasings, integer-snap correctness rule. → `json_author` → `src/data/concepts/chemistry/bohr_model_energy_levels.json` (site #1 ONLY — isolation held), + the additive concept-gated compute wiring (see below), + a not-applied cluster-seed migration. → visual walk (me) → one ladder-clipping defect found + fixed.

### Two premise corrections + one tooling gap closed (all additive, physics byte-safe)
1. **Archetype L is [LIVE] but NOT "zero engine code."** `parametric_renderer.ts`'s `computePhysics()` is a hardcoded per-concept-id dispatch — every parametric concept needs its own ~15-line `computePhysics_<id>` (the "low engine cost" §9 forecast, not literally zero). Added `computePhysics_bohr_model_energy_levels` (iframe-side, for build:review live labels) + a TS engine `src/lib/physicsEngine/concepts/bohr_model_energy_levels.ts` + ENGINES entry — additive, concept-gated, fires only for this id.
2. **GAP 1 — the review site never supported the parametric renderer.** `build_review_site.ts` hard-gated on `field_3d_config`/`particle_field_config`; NO parametric concept (not even physics ones like `vector_head_to_tail`) could render on the teacher surface. Added an additive third branch (`buildParametricConfig` + `assembleParametricHtml`), mirroring the app-path construction. Verified physics field_3d review build (faraday) unaffected. **This unblocks the whole parametric family, physics and chemistry.**
3. **GAP 2 (known, deferred) — parametric can't bind `body`/`animated_path` positions to live variables.** Only text labels (`label_expr`/`text_expr`) are live-reactive. So in S7/S9 the slider updates the ΔE/λ NUMBERS live (verified: "ΔE = 1.89 eV λ = 656 nm (VISIBLE)") but the electron/photon GLYPH doesn't visually re-jump. Guided states S1–S8 (authored one-shot animations) are fully intact. GAP 2 = a `peter_parker:renderer_primitives` follow-up (a live-position-expr primitive) if future explore states need drag-driven motion.

### The one authoring defect found + fixed (visual walk)
STATE_2's `smooth_camera` zoom (1.3× centered on the bottom electron) pushed rungs n=4/5/6 off the top of the (already ~91%-full) canvas. `json_author` removed the smooth_camera (a legibility-over-flourish tradeoff — Rule 33 zoom-link sacrificed to keep all six rungs on-canvas). Re-verified: all 6 rungs now show with correct convergent spacing.

### Verification (evidence)
`tsc` 0 · `validate:concepts` **124/124** (physics untouched, isolation held) · `validate:chemistry` **1/1 PASS** · `build:review -- bohr_model_energy_levels` exit 0 · physics `build:review -- faraday_law_induction` exit 0 (parametric branch didn't disturb field_3d) · **visual walk on the served review site: S1 hook, S2 ladder (post-fix, all 6 rungs), S9 sandbox with live ΔE/λ readout — all render correctly.** Console clean (lone 404 = on-demand audio manifest, expected per Rule 30h).

### Files changed
- `src/data/concepts/chemistry/bohr_model_energy_levels.json` (new — the concept)
- `src/lib/renderers/parametric_renderer.ts` (+1 concept-gated compute fn + 1 dispatcher line)
- `src/lib/physicsEngine/concepts/bohr_model_energy_levels.ts` (new) + `src/lib/physicsEngine/index.ts` (+1 import, +1 ENGINES entry)
- `src/scripts/build_review_site.ts` (+parametric branch — GAP 1; helps physics parametric concepts too)
- `supabase_migrations/supabase_2026-07-23_seed_bohr_model_energy_levels_clusters_migration.sql` (new, NOT applied)
- `docs/patterns/chemistry.md` (archetype K split, M relabeled, L verified + tiers corrected)

### ⏭ NEXT — Bohr finishing + Wave-1.5
1. **Formal `quality_auditor` gate** (stage 4 — not yet run this session; chemistry gates: E42/RHR N/A, conservation/units/word-budget/assessment/Rule 24/31/32/34/35 apply) + **Asmi professor review**.
2. **THE EYE** needs a chemistry cache-seed (reads the chemistry subdir → `simulation_cache`) before `visual:eyes`/`visual:approve` (Phase-3d — still the prereq gate; the review-site path proved out today without it).
3. **GAP 2 decision:** greenlight a `renderer_primitives` live-position-expr primitive if drag-driven visual jumps matter, else ship S7/S9 with live numbers + authored default animation.
4. **Wave-1.5:** Rutherford α-scattering once a founder-approved `field_3d` scattering scenario is built (now correctly scoped as [NEEDS-SCENARIO]).
5. Not pushed. 8+ files changed on `feat/chemistry-foundation`.

---

## 🧪 SESSION — Chemistry foundation: architecture → chemistry_author → subject-aware catalog → parity-audit hardening → international build-flow locked (2026-07-23, branch `feat/chemistry-foundation`, new macOS laptop)

**Bottom line: chemistry went from an empty scaffold folder to a fully buildable subject at parity with physics — architecture + phased plan (Rule 17, founder-approved), the `chemistry_author` agent role + pattern library, subject-aware catalog plumbing (physics output proven BYTE-IDENTICAL), a founder-requested parity audit that hardened all four shared agent specs + the build/verify tooling, and a locked international-first, renderer-compounding build flow. Physics untouched throughout (tripwire green after every phase). 5 commits on `feat/chemistry-foundation`, NOT pushed. NO chemistry concept authored yet — next session builds Rutherford α-scattering (Wave 1, prove-first).**

### Phases delivered
- **Phase 0 — baseline (`d25cdc4`, `4a3cbf5`):** fixed a real repo bug (committed lockfile out of sync → `npm ci` failed repo-wide, missing @emnapi entries; proven fixed). Locked the isolation-contract comment in `validate-concepts.ts` (non-recursive scan = chemistry invisible to physics validation BY DESIGN). Installed the local agent-sync pre-commit hook. Recorded the green tripwire baseline.
- **Phase 2 — authoring layer (`d31f6c4`):** `.agents/chemistry_author/CLAUDE.md` (+ emission, sonnet-5 pin) — balanced-equation-ledger doctrine (atom/charge conservation, redox e⁻ balance), chemistry units first-class, [LIVE]-archetype-only interim rule. `docs/patterns/chemistry.md` — representation triangle (macro↔particulate↔symbolic), archetypes K–Q with renderer-gating, chemistry source roles (NCERT Chemistry backbone + NCERT Exemplar misconceptions + universal anchors). Governance: 11-role roster, `alex:chemistry_author` owner tag everywhere.
- **Phase 1 — curriculum plumbing (`c6bfb03`):** `Subject` type (client-safe); `src/lib/chemistryCatalog.ts` (NCERT Cl.11 Ch.1–4 maps + Ch.2 roadmap ghosts); `conceptCatalog.ts` routes by `subject` as a PARAMETER (default physics), NOT a stored field — physics API output proven byte-identical via a throwaway function-level diff harness. `?subject=` on both catalog routes; `/learn` label un-hardcoded (toggle deferred to Phase 3); separate `NCERT_CHEMISTRY_BOUNDARIES`.
- **Phase 2.5 — parity hardening (`ed49664`):** founder asked "is chemistry as strong as physics? why wasn't the architect changed?" — a two-audit pass (agent specs + serving-path tooling) found the four shared specs would misfire on a chemistry run (architect never referenced chemistry.md → violated chemistry_author's input contract by construction; auditor had no `alex:chemistry_author` FAIL route + Gate 2 would false-FAIL; json_author's 8-site registration inverted for chemistry; eye_walker lacked chemistry visual-sanity checks). Fixed with ADDITIVE "Chemistry concepts (2026-07-23)" sections in all four canonicals (+0 deletions, emissions regenerated same-session). Tooling: new shared `src/scripts/lib/resolveConceptJson.ts` (flat physics path FIRST = byte-identical; logs on chemistry resolution) wired into the 3 flat-hardcoded loaders — including fixing a SILENT-degradation trap (a missing chemistry JSON used to quietly disable THE EYE's Category I/E, now an explicit warning). New `npm run validate:chemistry` v0. Addenda to AUTHORING_PIPELINE.md + root CLAUDE.md (3 lines, founder-approved).

### Strategy locked this session (detail → CHEMISTRY_DISCUSSIONS.md)
- **Verdict: extend, don't duplicate.** The subject-neutral spine (schema, Rule 31/32/33/34 pacing/legibility, TTS, EYE motion-reading, catalog) transfers. Chemistry-specific work is concentrated in exactly two seams: the rigor role (chemistry_author — DONE) and the render surface (Phase 5). ONE shared architect/auditor/eye_walker with chemistry-aware SPECS, not sibling roles.
- **International + NCERT at once (the founder's priority):** chemistry's "universal passport" = the *physical chemistry of change* cluster (kinetic theory → rates → energetics → equilibrium) — both the highest cross-curriculum overlap AND the most simulatable, per Rule 38 + Session-86 market sizing + Topic-14 simulatability. Served by concept CHOICE (the passport concepts sit in every board) + Rule 38 depth-rings (NCERT depth authored, lighter boards hide the advanced ring).
- **Renderer reality check (verified):** `particle_field_renderer` is entirely circuit-shaped — NO gas-particle/collision scenario exists. So archetype M (particle-box) is NOT [LIVE]; it needs a modest scenario built once (then reused across the whole passport cluster). The ONLY true zero-renderer-cost start is Rutherford (archetype K, reuses the built trajectory engine). **`docs/patterns/chemistry.md` mislabels M as [LIVE] — flagged for correction.**
- **Decision (founder): prove-first.** Wave 1 = Rutherford α-scattering (zero renderer, validates the whole chemistry pipeline). The particle-box investment + the passport cluster follow in Wave 2.

### Verification (evidence)
`tsc` 0 · `validate:concepts` 124/124 (physics untouched) · `validate:chemistry` 0/0 PASS (empty namespace) · vitest 288/288 · agents 11/11 in sync · `build:review faraday_law_induction` exit 0 with zero resolver log lines (physics path silent) · chemistry-side resolution probed + logged.

### Environment notes (new machine)
Repo migrated from Windows (`C:\Tutor\...` paths in docs are historical). `~/.claude/rules/agent-teams-reference.md` (referenced by governance) does NOT exist on this laptop — the hard rules survive verbatim in `.agents/CLAUDE.md`, but the original external file should be recovered/re-authored. 2 pre-existing `react-hooks/set-state-in-effect` lint errors in `learn/page.tsx` (present on HEAD, untouched).

### ⏭ NEXT SESSION — Rutherford α-scattering (Wave 1, prove-first)
The first chemistry vertical slice through the full pipeline, on the registration-free review-site path:
1. **Concept correction first (small):** fix the archetype-M `[LIVE]` mislabel in `docs/patterns/chemistry.md` (add a "needs-a-scenario" tier between [LIVE] and [PHASE-5]); optionally re-seed the roadmap ghosts around the international wave order.
2. **Pipeline:** `architect` skeleton (chemistry sources + `docs/patterns/chemistry.md` archetype K; DoD = balanced-equation-ledger variant, RHR N/A) → `chemistry_author` block (α-particle trajectory geometry, closest-approach `d = kQq/E`, the ONE formula surface of the aha state) → `json_author` emits `src/data/concepts/chemistry/rutherford_alpha_scattering.json` (site #1 ONLY — sites 2/3/4/7/8 forbidden; reuse a `field_3d_config` on the force-in-field machinery) → `quality_auditor` (chemistry gates: ledger correctness N/A for a physics-experiment concept, but conservation/units apply; `validate:chemistry` PASS).
3. **Visual:** needs a `simulation_cache` row → a chemistry cache-seed script that reads the chemistry subdir (Phase-3 per-concept file) → `visual:eyes` (THE EYE) → `eye_walker` → founder review → `build:review -- rutherford_alpha_scattering`.
4. **Prereq to watch:** THE EYE reads the sim from Supabase `simulation_cache`, not the JSON — so the cache-seed step is the gate. The review-site path (`build:review`) renders straight from the JSON and needs no cache.
