# Stage 0 calibration — founder:drive + founder-proxy vs the real scar record

> Run 2026-07-22, worktree `C:\Tutor\physics-mind-ch7`, branch `feat/ch7-alternating-current`.
> Protocol: `docs/CHAPTER_LOOP.md` §7 Stage 0. EXPERIMENTAL trial — nothing here is doctrine.
> **Nothing was shipped, approved, deployed, or written to the DB.** No `visual:approve`, no `tts:*`,
> no `PILOT_CONCEPTS`, no `build:pilot`/`deploy:*`, no `engine_bug_queue` INSERT.

---

## 1 · What ran

| # | Build | Concept | THE EYE | drive | founder-proxy verdict |
|---|---|---|---|---|---|
| A1 | HEAD (current, approved) | `capacitance` | 44/44 | 7 states, 21 shots, 3 drags, 0 flags | `ESCALATE(trigger 1)` — 8 P1 |
| A2 | HEAD (current, approved) | `wheatstone_bridge` | 32/32 | 5 states, 15 shots, 5 drags, 0 flags | `ESCALATE(trigger 1)` — 7 P1 |
| B | **pre-fix reconstruction** | `capacitance` | 44/44 | 7 states, 21 shots, 3 drags, 0 flags | `ESCALATE(trigger 1)` — 6 P1 |

All three proxy runs were **blinded**: instructed to exclude every `engine_bug_queue` row whose
`concepts_affected` contains the target concept, to read no `supabase_migrations/*`, no
`_seed_engine_bug_queue_*`, no `PROGRESS.md`, no `DISCUSSIONS.md`, and to run **no git command at all**
(the git history is the answer key). Each run reported its exclusion count and named the scar classes
it checked.

Cache handling: the per-concept `_seed_<id>_cache.ts` scripts delete-then-insert their own
`simulation_cache` row, which achieves the protocol's "no stale sim" intent. The global 4-table
DELETE was **deliberately skipped** — other worktree sessions share this dev Supabase project and the
per-concept reseed is sufficient here.

---

## 2 · The answer key (what the founder actually caught)

| Concept | Finding | Recorded in | Status at run time |
|---|---|---|---|
| `capacitance` | Rule-34d chrome collision — `cap_readout` + `cap_ratio_readout` at `top:12px` under the Full-screen button / pen bar; the S2 ratio box is the PRIMARY aha's sole glow focal | scar row `field3d_sliders_panel_top12_vs_fsbtn_top10` (OPEN) + commit `2545f68` | FIXED |
| `capacitance` | negative dot pool washed out by translucent-plate blend order | scar `capacitance_negative_pool_low_contrast` (FIXED) | FIXED |
| `capacitance` | S6 chain-link glow cues authored, never wired | scar `capacitance_chain_link_derivation_pulse_unwired` (FIXED) | FIXED |
| `capacitance` | pF readout precision mismatch across 3 surfaces | scar `capacitance_pF_readout_precision_mismatch` (FIXED) | FIXED |
| `capacitance` | **guided-state sliders (S2–S5) dead on drag** — scripted ramp clobbers the dragged value | commit `95fe10c`, "founder-reported" — **no scar row** | FIXED |
| `capacitance` | **explore state surfaced extended-ring `C = ε₀A/d`** (Rule 38b) | commit `95fe10c` — **no scar row** | FIXED |
| `wheatstone_bridge` | S1 node-A junction glow not distinct from B/C/D | commit `c929a00` (eye-walker, "founder-eyes item") — **0 rows in `engine_bug_queue`** | FIXED |

**The calibration problem this creates:** every known finding was already fixed before the sims under
test. Runs A1/A2 can therefore only measure **specificity** (does the proxy invent defects, or
re-flag things already fixed?). They cannot measure **recall**. Run B exists to close that gap.

---

## 3 · Run B — the recall test

Three defects were surgically re-planted in `capacitance` to reconstruct the pre-fix build, then
reverted (`git checkout --`, tree verified clean; re-seed produced a byte-identical
2,220,351-char sim):

1. `cap_readout` and `cap_ratio_readout` returned to `top:12px` (with the scar-naming comments
   stripped so the source itself could not leak the answer).
2. The four `PM_cap*Dragged` seize guards removed from `v_steps` / `v_sweep` / `area_morph` /
   `gap_morph` — restoring the founder's "sliders do nothing" bug.
3. `STATE_7.capacitance.formula` returned to `C = ε₀A / d` — restoring the Rule-38b breach.

**Result: 3 / 3 recovered**, each with correct root cause and correct owner routing.

| Planted | Recovered as | Quality of the catch |
|---|---|---|
| dead guided sliders | P1-1, with the exact clobber mechanism traced to `updateCapacitanceFrame` | **Exceeded the founder's own report** — also caught that the slider *label* writeback IS guarded while the physics path is not, so "the panel lies about it" (label 22.0 V, sim 12.0 V) |
| `top:12px` collisions | P1-3 (right edge, 101×28 px and 85×28 px overlaps) + P1-4 (left edge, 181×35 px) | Measured page-coordinate rects; identified it as a verbatim recurrence of the FIXED scar whose class name literally records `top12 vs fsbtn top10` |
| Rule-38b explore formula | P1-6 | **Exceeded the founder's fix** — also flagged `show_field_lines: true` on the core-ring explore state as advanced-ring content, which the original fix did not address |

**Honesty caveat — this was a *hinted* recall test, not a blind one.** Run B's dispatch named the
three surfaces to probe first (chrome overlays, guided-state drag behaviour, Rule 38b). It therefore
measures *judgment given the right place to look*, not unprompted search. Two mitigations:

- The chrome-collision class was found **unprompted** in run A2 on `particle_field` (see §4), so blind
  recall for that class is independently demonstrated.
- Guided-state drag behaviour genuinely needed the hint, because `founder_drive.ts` does not exercise
  it at all (see §5). That is a harness gap, not a proxy gap.

---

## 4 · What the proxy found that the founder did not — verified independently

These were spot-checked in the source and in the frames by the orchestrating session, **not taken on
the agent's word**. All are on concepts that are approved, baseline-locked, and live in
`PILOT_CONCEPTS`.

### P0-class

**`capacitance` — the Q–V graph is mathematically incapable of showing capacitance change.**
`capDrawGraph` (`field_3d_renderer.ts` ~5844):

```js
var Qaxis = Math.max(C * Vaxis * 1e9, 0.1);   // axis normalised BY C
var p1    = px(vEnd, C * vEnd * 1e9);         // yFrac ≡ (C·Vaxis)/(C·Vaxis) = 1
```

C cancels exactly. The trace always runs origin → top-right corner; the live dot lands at
`(V/Vaxis, V/Vaxis)`, also C-independent. STATE_3 teaches *"the slope IS the capacitance"*, then
STATE_4 doubles C to 177 pF and STATE_5 quarters it to 44.3 pF — **the line does not move a pixel**
(agent measured 0 differing bytes across the 227,850-byte graph rect; trace slope 0.5951 in all three
states). There are no numeric axis ticks either, so nothing else signals the silent rescale.
Owner: engine.

**`wheatstone_bridge` — the slider panel collides with the review chrome, fleet-wide.**
`particle_field_renderer.ts:727` — `panel.style.cssText = 'position:fixed;top:10px;right:10px;…'`,
while `field_3d` uses `top:52px` *specifically* to clear that chrome. Confirmed visually in
`S5_late.png`: row 1 renders as "Ratio arm" with its `10 Ω` value entirely hidden behind the
⚙ Widgets / ⛶ Full screen buttons; rows 2–5 read fine. The OPEN scar
`field3d_sliders_panel_top12_vs_fsbtn_top10` names exactly this class — `particle_field` was never
migrated. **Affects all 11 Ch.3 concepts, all shipped.** Owner: engine.

### Also verified in source

| Finding | Verified fact |
|---|---|
| `capacitance` — `A` and `d` never labelled | `cap_gap_label` / `cap_area_label` are built (lines 5439/5454) with elementType `cap_gap_bracket` / `cap_area_tag`; state entry zeroes opacity **by elementType**, the per-frame ramp restores **by id** (`capFindById("cap_gap_bracket")`, `…("cap_area_bracket")`) — the sprites are never restored. Confirmed in `STATE_5__frozen.png`: bare cyan stick, bare yellow stick, while the formula surface reads `C = ε₀A / d`. |
| `wheatstone_bridge` — false measurement in explore | `if (st && st.show_s_readout)` (~L1949) has **no** `bp.balanced` guard, while its sibling `show_ig_zero_label` (L1927) explicitly does. Away from balance the canvas prints a "measured" S that contradicts the arm label. |
| `wheatstone_bridge` — two tolerances for one fact | `balanced` = `abs(gap) < bridgeTol()` = 0.01 on the dimensionless ratio (L1371/L1415); bead rendering early-outs on `mag < 1e-4` on ΔV (L1836). A window exists where `i_g = 0` is asserted over visibly flowing beads. Reachable only via explore sliders, not in the scripted states. |

---

## 5 · Gate and harness blind spots exposed

Three independent reasons a defective build sails through every existing gate:

1. **THE EYE screenshots the raw sim, never the wrapped review page.** No chrome-collision defect can
   ever fail it. This is precisely how the `capacitance` 34d bug reached the founder's desk, and why
   the `particle_field` one is still live across 11 shipped concepts.
2. **H2 regression tolerance is 0.02** (`visual_baselines/capacitance/baselines.json`) — wider than an
   on-canvas text change. Run B swapped the explore-state equation and THE EYE still returned
   **44/44**.
3. **`founder_drive.ts` drags sliders only in the explore state** (`exploreIdx = stateCount - 1`).
   The guided-state control surface — where the founder's own "sliders do nothing" bug lived — is not
   exercised. A concept can ship with every guided control dead and both harnesses stay silent.

Secondary harness note: `particle_field` sliders carry no DOM `id`, so the drive manifest records
them as `slider_0…slider_4` and cannot say which physical variable moved.

---

## 6 · Taste-match verdict

**Precision — strong.** Five of five spot-checked structural P1s across the three runs were confirmed
as real code facts by independent inspection (panel anchor, S-readout guard, dual tolerance, graph
normalisation, label-sprite restore), plus direct visual confirmation in two frames. Zero
hallucinated defects found in the sample.

**Specificity against the answer key — clean.** Not one of the seven already-fixed findings was
falsely re-flagged. The proxy explicitly checked `field3d_readout_hud_top12_vs_fsbtn_top10` on the
current `capacitance` build and correctly marked it **clear** (the HUD is at `top:52px` there) — then
correctly flagged it as a **recurrence** in run B when it was at `top:12px`. That is the single
sharpest calibration signal in this report: the same class, correctly discriminated in both
directions, by the same rubric.

**Recall — 3/3 on hinted probes, 1 class demonstrated blind.** See §3 for the caveat.

**Verdict discipline — miscalibrated, and this is the real Stage 0 finding.** All three runs returned
`ESCALATE`. Per the literal wording of escalation trigger 1 ("the correct fix lives in a shared engine
file") every one is *correct*. But the practical consequence is that the loop would have parked both
calibration concepts, and would park most future concepts, because most real defects in this codebase
are renderer-side. An escalation path that fires on the majority case is not an exception path — it is
the default, and it silently converts "autonomous chapter loop" into "queue of founder decisions."

**Grade drift — none observed.** All runs were cycle 0, so no budget pressure existed. Untested.

---

## 7 · Recommendations (founder decides — nothing applied)

1. **Do not graduate Stage 0 as-is.** Not because the proxy failed — it outperformed the recorded
   human review on both concepts — but because trigger 1 needs redefining before Stage 1, or the loop
   will park everything. Options: allow a `FIX(engine)` verdict that files a scar candidate and
   *continues*; or narrow trigger 1 to "engine fix that changes shared behaviour for other concepts."
2. **Triage the verified production defects in §4 separately from the trial.** The Q–V graph bug and
   the `particle_field` chrome collision are live in `PILOT_CONCEPTS` today and are not
   trial-contingent. The graph one in particular defeats the stated pedagogical claim of the state it
   appears in.
3. **Close the harness gaps in §5** before Stage 1 — extend `founder_drive` to drag controls in every
   state that declares them and to measure overlay rects against the chrome on the *built* page.
   Both are cheap and both would have caught real, shipped bugs.
4. **Consider a scar row for the `text_te`/`text_hi` and Rule-38 vintage gaps** the proxy raised on
   `wheatstone_bridge` — or explicitly mark them doctrine-vintage and out of scope for old concepts,
   so the proxy stops re-raising them.
5. **Candidate scar rows are persisted** (2026-07-22, founder-requested) — 20 rows across:
   - `capacitance/founder_proxy_report.md` + `capacitance/scar_candidates.sql` (11 rows)
   - `wheatstone_bridge/founder_proxy_report.md` + `wheatstone_bridge/scar_candidates.sql` (9 rows)

   None applied to the DB. Three orchestrator-level corrections were made while filing, and each is
   documented in the report beside its SQL:
   - **2 rows dropped as calibration artifacts** — the Run B drag-seize and `top:12px` rows describe
     defects the orchestrator planted, not defects in the tree.
   - **1 row scope-corrected** — the Rule-38b row's *formula* half was an artifact; its
     *`show_field_lines` on a core-ring explore state* half is real at HEAD and was verified, so the
     row is filed narrowed to that.
   - **2 cross-run duplicates merged** (same defect, different `bug_class`, and `bug_class` is the
     upsert key). Independent rediscovery by two separately-blinded runs against two different builds
     is the strongest reproducibility signal in this calibration.

   Schema normalisation was also required: agents emitted `row_type` values
   (`engine_defect` / `content_defect` / `process_gap`) and a `probe_type` (`automated`) outside the
   table's enums, plus `NULL` for `fixed_in_files`. **As authored by the agents, none of these rows
   would have inserted.** Worth fixing in the founder-proxy spec's output contract before Stage 1.
