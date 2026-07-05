# coulombs_law — Rule 31 reconstruction design

**Date:** 2026-07-05 · **Concept:** `coulombs_law` (Ch.1 §1.6, field_3d scenario `coulombs_law_force`)
**Type:** Rule 31 retrofit of an existing well-formed concept (physics, Indian anchor, scripts, assessment all preserved).
**Founder decisions locked:** arc = merge-to-8 (option B); engine = author adds minimal renderer support (option a); S7 = watch-this animation (no draggable 3rd charge).

## Atomic claim (unchanged)
Two point charges exert an equal-and-opposite force along the line joining them, F = k q₁q₂/r² — proportional to the product of the charges, falling as the inverse square of separation; with several charges the net force is the vector sum of the pair forces (superposition). Vacuum law only (dielectric factor is a separate sim).

## What breaks Rule 31 today
1. Three Socratic `wait_for_answer` "predict→reveal" beats (S3, S5, S8).
2. No per-state contextual controls — only the explore state is live.
3. `misconception_watch` on all 8 guided states (should be 1–3 pivots).

## Reconstructed 8-state arc + per-state control table (the Rule 31 artifact)
Sliders: q₁ (1–10 nC), q₂ (1–10 nC), r (2–20 cm) + q₂ sign toggle. Each guided beat exposes ONLY its knob; explore exposes all. Panel built once, rows shown/hidden per state; shared rows keep the same screen position (r fixed slot across S5/S6/S8; q₁/q₂ fixed slots).

| # | Teaches | Distinct auto-play motion | Live control | advance_mode | misconception_watch |
|---|---|---|---|---|---|
| S1 | Force acts across empty space (no contact) | two + charges appear; force arrows push outward across the gap | none | manual_click | — |
| S2 | F = k q₁q₂/r² | formula assembles; k = 9×10⁹ called out | none | manual_click | — |
| S3 | Sign sets direction (not magnitude) | flip q₂ − → both arrows reverse inward, length unchanged | q₂ sign toggle | manual_click | ✅ "sign changes strength" |
| S4 | Equal & opposite (N3L) | q₂ → 5× q₁, both arrows stay identical length | q₂ magnitude | manual_click | ✅ "bigger charge pushes harder" |
| S5 | 1/r² falloff — **PRIMARY aha** | drag r out → arrow collapses to F/4 then F/9 | r slider | manual_click | ✅ "double r halves F" |
| S6 | F ∝ q₁q₂ | double q₁ at fixed r → both arrows double together | q₁ slider | manual_click | — |
| S7 | Force is a vector → superposition | 3rd charge present; F₁ & F₂ add tip-to-tail into resultant | none (watch-this) | manual_click | — |
| S8 | Explore | all knobs live | q₁, q₂, r, sign | interaction_complete | — |

- advance_mode: 7× `manual_click` + 1× `interaction_complete` = 2 distinct (Gate 12 ✓).
- S1/S2/S7 are no-slider but NOT static — choreography auto-plays (Rule 31 catch #2). Never `auto_after_animation` on a live state (trips THE EYE motion heuristic).
- PRIMARY aha stays S5 (1/r²), inside foundational range.

## Misconception pivots: 8 → 3
Keep on S3, S4, S5 only. Prune S1, S2, S6, S7 (unrendered metadata; pruning needs no re-voice).

## Pacing (Rule 31a/b)
Each guided beat ~15–25s ≈ 3–4 tight sentences. Reuse existing scripts with the "predict" framing stripped from S3/S5/S8; write one fresh 3–4 sentence script for the merged S7 (vector + superposition). Explore = open/interaction_complete.

## Engine delta (minimal, additive)
`field_3d_renderer.ts` coulomb scenario: per-state control-row visibility. Add a per-state `controls: string[]` (or `coulomb.mode`) read that toggles which panel rows render, mirroring faraday's `stateDef.faraday.mode` → rows. All-or-nothing explorer stays for S8. No behavioral change to physics/arrows.

## Verification plan
1. `npx tsc --noEmit` = 0 · `npm run validate:concepts` PASS (Gates 12/19/20).
2. Re-seed cache → `npm run visual:eyes -- coulombs_law` → dispatch eye-walker to read frames; zero new `engine_bug_queue` rows.
3. Founder visual approval → then Rule 30f: TTS EN + Telugu re-voice (S3/S5/S7/S8 scripts changed → stale clips must be re-generated) → build:review → serve link.

## Out of scope
Dielectric-medium factor (separate sim). Draggable 3rd charge. Board/competitive modes (Rule 20 suspended). epic_c_branches (EPIC-L-first).
