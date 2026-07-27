# CHECKPOINT C (handover gate) — founder-proxy — `em_wave_propagation`

> Ch.8 chapter loop, `docs/CHAPTER_LOOP.md` §3 step 5. Date 2026-07-25. Branch `feat/ch8-em-waves`.
> (Report returned inline by the agent per its no-write role contract; persisted here by the loop session.)

## VERDICT: **SEALED**

— with two mandatory founder chapter-end queue items (one ratchet-corpus gap, one severity-enum confirmation). Every claimed A/B fix is verified present in the tree; no silent skip on any *fix*. The two gaps are on the scar-*filing* side, are trial-mode file-only artifacts the founder adjudicates at chapter end, and do not affect the shipped sim — so they carry forward rather than block the chapter.

> **LOOP NOTE (post-report, 2026-07-25):** queue item 1 below (the missing F-S5 scar row) was **CLOSED in-loop** — the row is now filed in `docs/loop_runs/ch8/_engine/scar_candidates.sql` with severity `CRITICAL` (the standard enum, deliberately avoiding the unconfirmed `'MAJOR'`). Item 2 (the `'MAJOR'` severity confirmation on the F-S1 row) remains founder-owned.

## Fix-diff audit table

| Finding | Claim | Landed? | Evidence |
|---|---|---|---|
| **F-S5** (BLOCKING) ghost dissolve dead code | `7bb26e2`: renderer reads `ghost_dissolve_at_ms` via `cueTriggerMs`, ~1 s fade of 3D ghost + DOM ✗-tag, reset on entry | **LANDED** | `field_3d_renderer.ts:31438-31439` (committed HEAD): `if (ew.show_ghostb && ew.ghost_dissolve_at_ms != null) { var gdMs = cueTriggerMs("ghost_dissolve", ...) }`. CP-B cycle-2 eye_walker CLOSED. |
| **F-S9** reveal pin | `1b5efa7`: `deriveStateMeta` gains `link1/2/3_at_ms` + `assembled_at_ms`, pin → 18000 ms | **LANDED** | `src/lib/validators/visual/deriveStateMeta.ts:1376-1381`: `push(emwState.link1_at_ms,600)…push(emwState.assembled_at_ms,2000)`. |
| **F-S1** pulse/pin desync | `8d2f826`: pulse travel + period derive from `needle_kick_at_ms`; S2 byte-identical | **LANDED** | `field_3d_renderer.ts:31240`: `cueTriggerMs("needle_kick", (ew.needle_kick_at_ms != null) ? ... : EMW_PULSE_ARRIVE0)`; default preserved (L30713). |
| **F-S6** λ bracket | `c16383d`: ⊓ bracket + λ sprite over 2π/k, gated `show_lambda` (S6+S11) | **LANDED** | Renderer `L31194` (`emw_lambda: !!ew.show_lambda`) + `L31567`; JSON `show_lambda:true` at L1263 (S6) and L1393 (S11). |
| **F-S8** Rule 34c subscripts | UNCOMMITTED working-tree JSON: `u<sub>E</sub>`/`u<sub>B</sub>` | **LANDED (working tree)** | `em_wave_propagation.json:1317`: `"formula": "u<sub>E</sub> = ½ε₀E² = u<sub>B</sub> = B²/2μ₀"` — real Unicode ½ ε₀ ² μ₀, HTML subscripts on the DOM overlay path. Confirmed present; seal commit must `git add` the JSON so it is not lost. |
| **CP-A F2** both trains + slab bunching | carry-forward LANDED | Present | committed in `6a0fa7f` add-ons scenario. |
| **CP-A F3** S6 zoning, one formula surface | carry-forward LANDED | Present | S6 formula dock single-surface; F-S6 bracket sits in reserved band y1.80–2.42 (Rule 34d). |
| **CP-A FL1** S10 n-drag un-pins clock (founder hand-test pending) | carry-forward WIRED | Wired | `field_3d_renderer.ts:31271`: `if (window.PM_emwNDragged) slabRamp = 1` (drag-seize present). **Founder hand-test still owed** — THE EYE cannot fire trusted drag events. |
| **CP-A FL2** S6 historical-identity framing | carry-forward LANDED | Present | JSON S6 content. |
| **CP-A FL4** both tanks identical, crest 6.38×10⁻⁸ | carry-forward LANDED | Present | `em_wave_propagation.json:147-148` `uE_display`/`uB_display` LOCKED to identical `6.38×10⁻⁸ J/m³` from independent chains; L722 visual_counter. |

**No claimed fix failed to land.** All renderer/deriveStateMeta edits are committed (`7bb26e2`, `1b5efa7`, `8d2f826`, `c16383d`) and are correctly absent from the working tree.

## Scar-candidate schema audit (`docs/loop_runs/ch8/_engine/scar_candidates.sql`)

Three new rows at C-gate time, all schema-valid on structure: column list matches the 13-col contract; `row_type='incident'` ×3 (valid enum); `probe_type='manual'` ×3 (valid enum); `concepts_affected`/`fixed_in_files` all `ARRAY[...]::text[]` (never NULL); `bug_class` values unique and distinct from the pre-existing corpus.

**Two schema/ratchet gaps (→ founder queue, not seal blockers):**

1. **F-S5 (BLOCKING) had NO scar row.** Commit `7bb26e2` declares `bug_class: field3d_emw_ghost_dissolve_hook_dead_code`, but no row existed. The blocking-severity defect that gated cycle-1 approval was fixed on pixels but **not ratcheted** — its recurrence would have gone uncaught. → **CLOSED in-loop** (see LOOP NOTE above): filed as a distinct row at `CRITICAL`, cross-referenced to the F-S1 root family ("authored `*_at_ms` cue never read by the renderer") while keeping the classes separate — F-S1 is a physical-arrival desync, F-S5 is a Rule-16a resolution beat that never fires at all.
2. **Non-standard severity `'MAJOR'`** on the F-S1 row (others are `'MODERATE'`). `'MAJOR'` is outside the standard `CRITICAL|MODERATE|MINOR` CHECK and will fail INSERT if the live `engine_bug_queue` CHECK is strict — the **same confirmation already queued for `displacement_current`**. Founder must confirm the CHECK permits it, or normalize the row before any apply. **Still open.**

## Cross-sim coherence with sealed `displacement_current`

No contradiction, no notation drift, no untaught-term (Rule 25) violation:

- Speed identity consistent: `displacement_current` uses `c = 1/√(μ₀ε₀)`; `em_wave_propagation` uses the same identity. Same μ₀/ε₀/c symbol set.
- Prerequisite chain clean: `em_wave_propagation` declares `displacement_current` + `faraday_law_induction` as prerequisites and does not re-teach them; the handshake ("changing E makes B" from displacement_current + Faraday's "changing B makes E") is built on, not re-derived.
- Classifier boundaries reconciled: `displacement_current`'s "Does NOT cover…" clause was updated to route wave-propagation/`c` downstream to `em_wave_propagation` as "the direct sequel," and `em_wave_propagation` absorbs the seeded siblings `em_wave_nature`/`speed_of_em_waves` via `CONCEPT_SYNONYMS` redirects — no overlap, no orphan.

## Exact `git add` list for the seal commit

Tracked (modified):
```
src/config/panelConfig.ts
src/lib/aiSimulationGenerator.ts
src/lib/intentClassifier.ts
docs/loop_runs/ch8/_engine/scar_candidates.sql
docs/loop_runs/ch8_state.md
```
Untracked (new):
```
src/data/concepts/em_wave_propagation.json          ← contains the F-S8 working-tree fix; MUST be added
src/scripts/_seed_em_wave_propagation_cache.ts
supabase_migrations/supabase_2026-07-25_seed_em_wave_propagation_clusters_migration.sql
docs/loop_runs/ch8/em_wave_propagation/            (skeleton, physics_block, engine_contract,
                                                    checkpoint_a/b/b_cycle2/c reports,
                                                    auditor_report + cycle2, eye_walker_report + cycle2)
```
Renderer edits are already committed — do **not** re-add `field_3d_renderer.ts` / `deriveStateMeta.ts`.

**Excluded from the seal commit:** `continue_em_wave_v2.txt` (scratch continuation file), `.founder_runs/` (drive-dump run artifacts), `docs/loop_runs/wrapper/` — transient run scaffolding; founder decides inclusion.

## Founder chapter-end queue (carry-forward)

1. ~~File the missing F-S5 scar row~~ — **CLOSED in-loop 2026-07-25** (filed at `CRITICAL`).
2. **[schema]** Confirm the live `engine_bug_queue` severity CHECK permits `'MAJOR'` (F-S1 row) — same open confirmation as `displacement_current`; else normalize before any DB apply.
3. **[hand-test]** CP-A **FL1**: S10 n-drag un-pins the clock — wiring present (`window.PM_emwNDragged`) but THE EYE cannot fire trusted drag events; founder must hand-verify the live drag drives continuous slab-bunching motion (Rule 37 explore-continuity).
4. **[trial artifacts]** Decide inclusion of `continue_em_wave_v2.txt` / `.founder_runs/` / `docs/loop_runs/wrapper/`.
5. **[P3 polish, from CP-B cycle 2]** (a) frequency ν renders as a Latin-"v" lookalike in the 13 px monospace HUD + slider on S6 and S11 — sharpened on S11 where the punchline `c = 3.00×10⁸ m/s — always` is a *speed*; cheapest fix is labelling `freq ν`. (b) S11 shows `λ = 3.00 m` on both the HUD and the bracket label (mild value duplication; accepted pattern, no action recommended).

## "Highest-value version achievable?" sentence (for the founder packet)

*"Within loop authority, `em_wave_propagation` is the highest-value version achievable: every Checkpoint-A/B finding is fixed and verified in the tree, it teaches the E⊥B⊥v in-phase self-propagation, the c = 1/√(μ₀ε₀) light-identity payoff, the B₀ = E₀/c amplitude lock, the equal energy split, and v = c/n in a medium coherently on top of the sealed `displacement_current` — and the only outstanding items are the founder-owned FL1 trusted-drag hand-test (THE EYE structurally cannot fire it) and the `'MAJOR'` severity-enum confirmation, which is a file-only trial artifact, not a defect in the shipped sim."*

## Key frames to eyeball first

`.visual_runs/em_wave_propagation/20260725-032745/` — `STATE_5__frozen.png` (F-S5 ghost fully dissolved) · `STATE_5__dense_t12000.png` (ghost still does its Rule-16a job first) · `STATE_9__frozen.png` (fully-assembled B_z, the F-S9 pin target) · `STATE_1__frozen.png` (F-S1 receiver needle nonzero at 9500 ms) · `STATE_6__frozen.png` (λ bracket rendered) · `STATE_8__frozen.png` (u_E/u_B subscripts).
