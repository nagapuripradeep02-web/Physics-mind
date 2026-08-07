# engine_handoff — arrow-label glyph height (field3d_surgeon, 2026-08-03)

Dispatch: ONE bug_class `field3d_arrow_label_sprite_renders_at_under_half_the_body_label_glyph_height`.
Stopped at the Amendment-4 ceiling with the fix IN PLACE and verified, and ONE open item.

## Done and verified

`src/lib/renderers/field_3d_renderer.ts`, +37/-5, four functional lines:

- new `NLB_BODY_LABEL_H = 0.40` (the reference: the body billboard's glyph height,
  previously a bare literal at its build site)
- `NLB_ARROW_LABEL_H = NLB_BODY_LABEL_H` (was `0.26`)
- `NLB_LABEL_MIN_SEP = NLB_ARROW_LABEL_H * (0.30 / 0.26)` (was a bare `0.30`; the ratio
  is the swept-and-validated one, so at the historical 0.26 it still evaluates to 0.30)
- the body billboard build site now passes `NLB_BODY_LABEL_H` instead of `0.4`

Measured, kinetic_energy_definition STATE_3 frozen (1280x720), `mg` ink height vs the
`cart = 4 kg` billboard ink height: **0.43 -> 0.714** (ink threshold 100) and
**0.50 -> 0.714** (threshold 60). Body billboard byte-identical either way.

`check:renderer-syntax` OK · `tsc --noEmit` 0 · `validate:concepts` 151 PASS / 0 FAIL.
THE EYE: kinetic_energy_definition 38/38, positive_negative_zero_work 38/38,
work_done_by_constant_force 38/38, normal_force 32/32. Every H2 delta inside the 2%
tolerance. Collision verified by frame inspection on normal_force S4 (8 labels, 2 bodies)
and S5 (components) — no two labels touch.

## OPEN — the one thing left, and it is BLOCKING for one concept

`work_done_by_constant_force` STATE_5: the `nlb_wk` work-bar tracks lose their
zero-line collinearity. Slot 0's track top drops ~15 px while slot 1's holds.

Causally established, do not re-litigate:

| NLB_ARROW_LABEL_H | STATE_5 frozen vs approved baseline |
|---|---|
| 0.26 | **0 px** — byte-identical |
| 0.40 | 4445 px, incl. 3 regions at x = 25..70 (y = 93, 164, 278) |

Both arms went through the full EYE path with a cache re-seed. STATE_5 is deterministic
across same-code runs (0 px); STATE_6 is NOT (1758 px between two identical-code runs —
explore state, Rule 37).

A probe against the `review-site/` build showed ZERO panel movement for the same
constant, i.e. **the review-site probe path does not reproduce it — only the EYE path
does.** Do not use the probe to exonerate this.

The mechanism was not located. A 3D sprite scale has no legitimate path into a DOM flex
layout. Suspect neighbourhood, in order:
1. the measure-and-reflow fit ladder the work bars deliberately share with the energy
   panel (`nlb_en_*` classes; see the comment above the `nlb_wk_bars` div and
   `nlbFitReadoutPanel`'s three-step ladder as the pattern)
2. `nlbDodgeBodyLabels`, which calls `getBoundingClientRect()` on the panels every frame

Contract at stake (documented in the file): every track is the first child of a column
flex at `flex:0 0 auto` under `align-items:stretch`, so every track top — and every zero
line at `top:50%` inside it — is collinear BY CONSTRUCTION. The previous violation of it
put 28 J of phantom deflection on the normal-force bar.

## Exact next step

1. Reproduce: seed `work_done_by_constant_force`, `npm run visual:eyes -- work_done_by_constant_force`,
   then compare `STATE_5__frozen.png` against `.visual_runs/work_done_by_constant_force/20260802-232029/`.
2. Instrument: log `getBoundingClientRect()` of every `.nlb_en_trk` in `#nlb_wk_bars` on
   each state apply, at both constant values, and diff.
3. Fix the coupling, not the label size. The label fix is correct and measured.

## Do NOT

- `visual:approve` anything — baseline re-approval is the dispatching session's step, and
  `work_done_by_constant_force` STATE_5 must NOT be re-baselined until the above is closed
  (it would lock a misaligned instrument in).
- Revisit SEAM Q (ink contrast) or SEAM R (ink lift) — different bug_class, already
  committed at `8bd84a2`.

## Scar rows

Appended to `docs/loop_runs/ch6/kinetic_energy_definition/scar_candidates_engine.sql`
(SQL text only, not applied): the fixed row above, plus
`nlb_work_bar_track_tops_lose_collinearity_when_a_3d_label_size_changes` as its own
OPEN row.
