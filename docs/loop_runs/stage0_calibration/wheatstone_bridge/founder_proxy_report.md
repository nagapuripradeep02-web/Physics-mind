# founder-proxy report — `wheatstone_bridge` (Stage 0 calibration, 2026-07-22)

> EXPERIMENTAL trial, `docs/CHAPTER_LOOP.md` step 4. **Reports only — nothing applied.**
> No `visual:approve`, no `tts:*`, no `PILOT_CONCEPTS`, no deploy, no DB write.
> Candidate scar rows are **files for founder review**, never inserted (trial rule §3.4).

| | |
|---|---|
| Build under review | HEAD — founder-approved, baseline-locked, **live in `PILOT_CONCEPTS`** |
| Renderer | `particle_field_renderer.ts`, `topology: "bridge"` (2D, not field_3d) |
| THE EYE | `.visual_runs/wheatstone_bridge/20260722-122110/` — 32 checks, 32 passed, 0 failed |
| Drive dump | `.founder_runs/wheatstone_bridge/2026-07-22T10-23-37-573Z/` — 5 states, 15 shots, 5 drags, 0 flags, 0 console errors |
| Verdict | `ESCALATE(trigger 1 — renderer/engine edit needed)` — 7 P1 / 9 P2 / 4 P3 |

**No defects were planted in this concept.** Unlike the `capacitance` calibration, this run reviewed
the tree exactly as it ships, so every row below is a candidate against live code.

Blinding: `engine_bug_queue` queried with rows naming `wheatstone_bridge` excluded — **that filter
matched 0 of 304 rows**, i.e. this concept has never had a scar row, so no answer key was reachable
from the DB regardless. No `supabase_migrations/*`, no `_seed_engine_bug_queue_*`, no `PROGRESS.md`,
no `DISCUSSIONS.md`, no git commands. The agent noted that its detailed corpus pass covered ~220 of
the 304 rows before tool output truncated at 59 KB, and that the truncation was positional rather
than selective. Neither an `eye_walker` nor a `quality_auditor` report was available; the absence is
noted rather than blocking, so gates 0–20 are **not** independently confirmed by this run.

The one known historical finding on this concept — S1 node-A junction glow not distinct from B/C/D,
found by eye-walker and fixed in `c929a00` — was **not** re-flagged, correctly, since the halo +
peer-dim fix is in place.

---

## Orchestrator-verified findings

These three were checked in the source and in the frames by the orchestrating session rather than
taken on the agent's word. All are live in production.

**1. The slider panel collides with the review chrome — fleet-wide across every `particle_field`
concept.** `particle_field_renderer.ts:727`:

```js
panel.style.cssText = 'position:fixed;top:10px;right:10px;width:238px;' + …
```

`field_3d` uses `top:52px` *specifically* to clear this chrome. Confirmed visually in
`S5_late.png`: the first slider row renders as "Ratio arm" with its `10 Ω` value entirely hidden
behind the ⚙ Widgets / ⛶ Full screen buttons, while rows 2–5 read normally. The agent measured the
buttons covering 197 of the panel's 264 px width across its top 30 px. The OPEN scar
`field3d_sliders_panel_top12_vs_fsbtn_top10` names exactly this class — `particle_field` was never
migrated when `field_3d` was.

**2. The explore state prints a false measurement whenever the bridge is unbalanced.** `show_s_readout`
(~L1949) computes `S = R·(Q/P)` with **no** `bp.balanced` guard, while its sibling
`show_ig_zero_label` twenty lines earlier (L1927) explicitly carries one. `S = R·(Q/P)` is valid only
at the null. In the drive's final explore pose the canvas simultaneously asserts `S = 11 Ω` (arm
label), `S = 18.0 Ω` (readout chip) and `P/Q = 1.00 vs R/S = 1.64 ✗`.

**3. Two tolerances gate one physical fact.** `balanced` = `abs(gap) < bridgeTol()` = `0.01` on the
dimensionless ratio gap (L1371 / L1415); `drawBridgeWireBeads` early-outs on `mag < 1e-4` on ΔV
(L1836). A window therefore exists where the canvas prints the literal claim `i_g = 0` and a green ✓
while current beads are visibly streaming down the B–D chord. The agent enumerated 1,220 reachable
integer slider tuples in that window (smallest: P=5, Q=13, R=3, S=8, ε=10 V → ratio gap 0.0096 but
ΔV = 0.0505 V). **Reachable only via the explore sliders** — the scripted states S1–S4 land on exact
balance, so guided teaching is unaffected.

Also visible in the single verified frame: the battery's `+` plate stroke cutting through its own
`ε = 6.0 V` label, and `S = 6.0 Ω` printed on two surfaces at once.

---

## What the run credits

The agent was explicit that the PRIMARY aha (S3 — the bridge wire emptying while all four arms keep
flowing) is genuinely excellent, and that bead direction `sign(V_B − V_D)`, battery polarity toward
node A, `bridgeNodes()` home-pose stability (no teleport), the closed glow-key enum, and explore
liveness (`motionProbe.bytesEqual: false`, all 5 sliders moved, 0 console errors) are all correct.
`i_g = 0` at balance is exact for any G. Six prior-scar recurrences were called, and two of them were
deliberately **not** promoted to P1 with the reasoning stated — the founder can overrule.

---

## Candidate scar rows

**Trial mode: proposals for founder review. Nothing was inserted.** Machine-ready, schema-normalised
SQL is in `scar_candidates.sql` beside this file — **9 rows**.

Normalisations applied by the orchestrating session (agent output used values outside the column
enums and would have failed on insert):

- `probe_type` — agent emitted `automated`; the column accepts `sql` | `js_eval` | `manual` |
  `vision_model`. Normalised to `js_eval`.
- `%%` escape sequences in `title` / `root_cause` reduced to a literal `%`.
- All rows `status = 'OPEN'`, `row_type = 'incident'`.

| # | bug_class | sev | owner | blast radius |
|---|---|---|---|---|
| 1 | `pf_slider_panel_collides_with_review_chrome_fullscreen` | MAJOR | `peter_parker:renderer_primitives` | **11 shipped Ch.3 concepts** |
| 2 | `bridge_s_readout_unguarded_prints_false_measurement` | MAJOR | `alex:json_author` | `wheatstone_bridge` |
| 3 | `bridge_two_tolerances_ig_zero_claimed_while_beads_flow` | MAJOR | `alex:json_author` | `wheatstone_bridge` |
| 4 | `pf_resistor_body_transparent_under_dim_wire_shows_through` | MODERATE | `peter_parker:renderer_primitives` | 5 concepts |
| 5 | `pf_formula_surface_monospace_corner_chip_as_declared_focal` | MAJOR | `peter_parker:renderer_primitives` | 4 concepts |
| 6 | `bridge_unknown_arm_labelled_with_its_answer_from_state_1` | MAJOR | `alex:architect` | 3 concepts |
| 7 | `bridge_misconception_counter_dimmed_and_unnumbered` | MODERATE | `alex:json_author` | `wheatstone_bridge` |
| 8 | `bridge_state1_fourteen_second_still_diagram` | MODERATE | `alex:json_author` | `wheatstone_bridge` |
| 9 | `bridge_battery_symbol_hairline_and_label_collision` | MODERATE | `peter_parker:renderer_primitives` | 3 concepts |

Rows 2 and 3 are routed to `alex:json_author` because a content-side mitigation exists
(`show_s_readout: false` on S5; tightening `bridge_calibration.ratio_tolerance`), even though the
structurally correct fix — a `bp.balanced` guard at the draw call, and one predicate per physical
fact — is engine-side. The founder may prefer to route both to the engine instead.

Two rows the founder may want to rule **out of scope rather than fix**, since both are
doctrine-vintage gaps on a concept authored before the rule existed:

- Rule 38 is entirely unauthored here — no `depth_ring`, no `curriculum_tags`, no
  `needs_teacher_verification` cells (agent finding F-15, no row filed).
- All 11 `tts_sentence`s carry `text_te` and none carries `text_hi` (Rule 30i retired Telugu; agent
  finding F-17, P3, no row filed).

If they stay unruled, the proxy will re-raise them on every Ch.3 concept it ever reviews.

---

## Frames the founder should open first

1. `.founder_runs/wheatstone_bridge/2026-07-22T10-23-37-573Z/explore_slider_4_after.png` — the canvas
   asserting `S = 11 Ω`, `S = 18.0 Ω` and `✗ unbalanced` at the same instant (row 2).
2. `.founder_runs/wheatstone_bridge/2026-07-22T10-23-37-573Z/S5_late.png` — "Ratio arm" clipped and
   its value swallowed by the Full-screen button, rows 2–5 fine (row 1; **orchestrator-verified**).
3. `.founder_runs/wheatstone_bridge/2026-07-22T10-23-37-573Z/S4_t0.png` — the state whose declared
   glow focal is a 0.43 %-of-canvas monospace corner chip, with the narrated galvanometer dimmed to
   35 % (row 5).
4. `.visual_runs/wheatstone_bridge/20260722-122110/STATE_3__frozen.png` — the PRIMARY aha; the
   emptying bridge wire is excellent, but everything proving "the arms keep flowing" is at 35 % with
   no number (row 7).
5. `.visual_runs/wheatstone_bridge/20260722-122110/STATE_1__frozen.png` — inspect regions
   **(690, 400) 130 × 70** at 6× and **(540, 590) 190 × 80** at 5×: the arm wire drawn through the
   resistor zigzag, a bead sitting on the `S` of `S = 6 Ω`, and the battery `+` plate cutting through
   its own `ε = 6.0 V` label (rows 4 and 9).

Review page (server on :8087): <http://localhost:8087/wheatstone_bridge/>
