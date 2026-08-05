# `rigid_body_rotation` — §5.1 re-verification list, PREPARED TO RUN

**Source:** `founder_proxy_A_cycle2_final.md` §5.1 (the six items that must be re-verified before
`json_author` starts, because *"a stale answer changes the design, not just the build"*).
**Prepared:** 2026-08-05, Desk C (`feat/rotmech-c`). **Nothing here is a design change.**
**Status of the concept:** still BLOCKED. Design sealed at `skeleton_rev3.md` + `physics_block.md`.

This file exists so the 0d session does not re-derive the six questions from scratch. Each item
carries: the question, the **exact command**, the **answer as of 2026-08-05** where a read-only
channel could settle it, and the **routing consequence**. Items marked ⏳ cannot be settled from
this desk and are stated as the precise thing to go get.

> **Do not run this list before 0c-3 merges.** Three of six answers are cheap re-confirmations;
> the two that matter (items 2 and 3) are decisions, not queries.

---

## Scoreboard

| # | Item | State as of 2026-08-05 | Blocks json_author? |
|---|---|---|---|
| 1 | Bug-queue re-run | ✅ **queries re-run, delta identified: exactly 4 rows** (below) | No — but the 4 rows need verdicts |
| 2 | C8's fate (F-C4 / camera) | ✅ **SCOPED AND DISPATCHED as E9** — not declined | Yes, until E9 lands |
| 3 | Two-timed-class fence | ⏳ **still unanswered** — office ruling | Yes, if cumulative |
| 4 | C7 / concept #2 wave membership | ⏳ **unanswered**; C7 deferred as `C-11`, lowest priority | No — clean trim either way |
| 5 | F-C5 ride-along (`tts_sentences[].glow`) | ✅ **CONFIRMED still a no-op** — deferred as `C-3`, not in the nine | No — authoring constraint only |
| 6 | "No precedent JSON exists" | ⚠️ **PREMISE IS NOW FALSE** — a precedent exists (below) | No — this *unblocks* work |

---

## 1 · The bug-queue re-run — **DONE, and the delta is exactly four rows**

The four REV 1 queries (declared at `skeleton_rev3.md:38`) re-run against the live table today.
The table is **reachable** (the outage recorded at REV 2/REV 3 and in `findings_c.md` PASS 9 is
over).

```bash
npx tsx src/scripts/query_engine_bug_queue.ts --owner alex:architect
npx tsx src/scripts/query_engine_bug_queue.ts --row-type directive
npx tsx src/scripts/query_engine_bug_queue.ts --field3d --open
npx tsx src/scripts/query_engine_bug_queue.ts --concept rigid_body_rotation
```

| Query | REV 1 (2026-08-04) | LIVE (2026-08-05) | Δ |
|---|---|---|---|
| `--owner alex:architect` | 63 | **67** | **+4** |
| `--row-type directive` | 83 | **83** | 0 |
| `--field3d --open` | 85 | **85** | 0 |
| `--concept rigid_body_rotation` | 1 | **1** | 0 |

**Three of four queries are unchanged.** The only drift is the +4 on the architect-owned query —
the same four `findings_c.md` PASS 9 flagged, and it **has not grown** in the ~24 h since. PASS 9's
obligation ("re-audit the delta before json_author starts") is therefore bounded and specific.

**The four rows, identified mechanically** (bug_class extracted from the query output, `grep -F`
against the whole `rigid_body_rotation/` document set — 67 strings in, 63 matched, 4 missing;
the count agreeing with PASS 9's independently-recorded "four rows entered" is the cross-check):

All four were filed against **`unit_circle_to_sine_wave`** — they entered the corpus with the
mathematics subject that landed on master, which is why a rotmech skeleton had never seen them.

| # | `bug_class` | Sev | Verdict for `rigid_body_rotation` |
|---|---|---|---|
| a | `skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads` | MAJOR | **BINDS — hardest of the four.** |
| b | `correspondence_state_stages_cause_first_as_a_head_start_so_the_equal_quantities_are_drawn_unequal` | MAJOR | **BINDS on S1 and S3.** |
| c | `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders` | MAJOR | **N/A — with a live trap.** |
| d | `pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve` | CRITICAL | **N/A as filed — generalisation binds C-1.** |

These are **proposed** verdicts prepared for the 0d session, not dispositions taken. Each needs
the reader-function check the row itself demands before it is written into a skeleton.

### a · `skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads` — BINDS

> *"A ring cut is discharged by RING ASSIGNMENT, never by a field: every control the explore state
> exposes must map to a guided state whose depth_ring survives the cut, with no hiding mechanism
> assumed anywhere."*

This row and `FROZEN_SCOPE_0c3.md` §C row **C-8** are the same subject arriving from two
directions. C-8 records that `min_ring` on rbr `controls_visible` **does not exist** — `bonding_scene`
implements `{ id, min_ring }` (`:55484–55492`) but rbr's token is a bare string union (`:1051`) —
and warns that *"the ring-gated explore claim must not be sealed as satisfied at Checkpoint C."*
The new scar row states the general rule and makes the same warning a **queue-backed obligation**.

**Concrete check for the 0d session** (do this before json_author, on `skeleton_rev3.md` §10 and
the S6 sandbox row): every control S6 exposes must map to a guided state whose `depth_ring`
survives the cut — under both the advanced cut and the advanced+extended cut. Rule 38b already
says the explore state surfaces **CORE-ring content only**. If any S6 control's only home is S5
(the whole advanced ring, cleanly cut per §5.2), the fix is **re-ring or cut the control** — not a
tag, and not "C-8 will land."

### b · `correspondence_state_stages_cause_first_...` — BINDS on S1 and S3

> *"In a state whose claim is an equality or a correspondence, Rule 32a is satisfied by REVEAL ORDER
> (the new element appears first, both drivers held) and NEVER by staggering the drivers of the two
> equated quantities."*

Both of this concept's equality states are exposed:

- **S1** claims *"the distances between its points never change"* — two gauges reading constant
  through spin. An equality asserted across the whole state.
- **S3** compares two swept arcs at different radii on one body — the same-θ claim.

Rule 32a (cause moves first) and this row are in direct tension on exactly these states, and the
row names the resolution: satisfy 32a by **reveal order**, never by starting one driver early.
The row also requires a per-state timing table with **sub-beat driver-profile columns** on any
state carrying a `misconception_watch` or a correspondence claim — `skeleton_rev3.md` has a
per-state control table; **confirm it carries a driver profile per sub-beat, or add one.**
The row's own note is worth taking seriously: *"both P1s on this concept were invisible until it
existed."*

### c · `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders` — N/A, with a live trap

N/A **by founder ruling R1**: this concept authors **zero formula surfaces** (`founder_proxy_A_cycle2_final.md`
§5.1, in the must-not-change list). A row about formula-surface/HUD unit disagreement cannot fire
on a concept with no formula surface.

**The trap:** `ENGINE_LANDING_NOTICE.md` §3 lists `formula_lines: [{text, at_ms?}]` (E1) as
**newly authorable** on rbr states. If json_author reaches for it here, R1 is violated *and* this
row activates in the same move. Record the N/A **with its reason**, so the reason travels.

### d · `pcpl_locus_trace_sweep_parameter_...` — N/A as filed; the generalisation binds C-1

N/A as filed: `locus_trace` is a PCPL primitive in `parametric_renderer.ts`; this concept is
`field_3d`. The probe (intersect slider variables with `locus_trace` x_expr/y_expr) has nothing to
run against.

**But the mechanism generalises and it points straight at C-1.** The defect is *a trace
parameterised on a variable the same state also exposes as a slider*. `FROZEN_SCOPE_0c3.md` §C
row **C-1** buys *"progressive circular traces"* plus *"a new `r_point` control with ramp/sweep
plumbing"* — and S6 exposes `r_point` live. If a bought trace ends up parameterised on `r_point`,
that is this scar in a second renderer. **Hand this caution to Desk E with the C-1 dispatch:** the
trace runs on a dedicated sweep variable choreographed off the state clock, never on the
teacher-dragged control.

### What is NOT done, and cannot be done here

The second half of §5.1 item 1 — *"the whole Desk C candidate manifest applied SELECT-before-INSERT
with the A6 **amendment** rather than a second class"* — is a **DB write**, forbidden by desk
guardrail 9. `scar_candidates_c.sql` remains **unapplied**; 12 candidates + 2 amendments.
This stays with Desk E / the 0d session, and `findings_c.md` PASS 13's obligation rides with it:
when applied, **F-C6 and F-C8 must reach the queue tagged `concepts_affected` including
`angular_momentum`**, so an ordinary pre-walk query finds them. Until then a clean
`--concept angular_momentum` query (**0 rows today**) is *not* evidence of a clean concept.

---

## 2 · C8's fate (F-C4, per-state camera) — **SCOPED AND DISPATCHED. Not declined.**

`FROZEN_SCOPE_0c3.md` §B: **E9 · `rbr_camera_pose_is_not_authorable` — BLOCKS DESK C's #3**,
sourced from *"findings_c F-C4 (P1, on a founder ruling) + C8."* It is one of the nine frozen
dispatches, not a §C deferral.

**Consequence: the `declined ⇒ RE-SCOPE` branch of §5.2 is closed.** All six states stay
[CAM]-tagged and the six-state arc stands. What remains is **timing, not fate** — E9 is not in
group 1 (E1–E4). `ENGINE_LANDING_NOTICE.md` §7 lists it outstanding alongside E5, E6, E7, E8.

```bash
# re-confirm on merge — one line, no interpretation needed
git log --all -S "rbr_camera_pose_is_not_authorable" --oneline
```

**Verify, do not assume:** dispatched ≠ landed. Re-read `FROZEN_SCOPE_0c3.md` §B E9 for scope
drift before json_author consumes the [CAM] tags.

## 3 · The two-timed-class fence — ⏳ **STILL THE BLOCKER. Unanswered.**

Unchanged and unanswerable from any desk. Both readings still live:

- **Non-cumulative / binds only 0c-2** ⇒ the six-state design stands as sealed.
- **Cumulative** ⇒ **RE-SCOPE, not trim.** §5.2's arithmetic is on the record: existing surface
  six classes, this ask adds two, the only named reduction takes 8 → 7. There is no design
  fallback.

Raised in `findings_c.md` PASS 5 and in §5.3 item 2 of the cycle-2 report ("an office question in
two skeletons now; answer it once, chapter-wide"). **Get this ruling before json_author starts,
not at seal** — it is the one item on this list that can invalidate the sealed design.

## 4 · C7 / concept #2's wave membership — ⏳ unanswered, and cheap either way

If `motion_of_centre_of_mass` enters a wave, the C7 defer recommendation should be **re-taken
rather than inherited**. Desk E has already ranked C7 as **`C-11`, lowest priority in the merge**
(*"#2's union row; #3 only consumes it (advanced ring, cleanly cuttable)"*) — which matches this
desk's recommendation, reached independently.

**Consequence is bounded:** §5.2 records *"C7 declined ⇒ TRIM, cleanly. S5 is the whole advanced
ring; §10(i-1)'s cut is verified. The one row whose loss costs a state and nothing else."*
No re-scope on either answer. **Note the interaction with item 1a:** the S5 cut is exactly the
ring cut that must be discharged by ring assignment rather than by a field.

## 5 · F-C5 ride-along — **CONFIRMED still open. The authoring constraint stands.**

`FROZEN_SCOPE_0c3.md` §C row **C-3** — deferred, not in the nine, not in group 1.

**Therefore, unchanged and binding on json_author:** `tts_sentences[].glow` is a **silent no-op on
every rbr state**. The working channels are per-state `glow_focal` + `phases[]`. Do not author
narration-level glow bindings and assume they render; Checkpoint B must not score narration→canvas
binding against this concept as if the channel worked.

**Precedent now exists** — `angular_momentum.json` authors the working channels only, at
`:636–641` (S1 `phases[]` with four `glow_focal` handoffs), `:682–684`, `:729–733`, `:766`.
Clone that shape.

## 6 · "No precedent JSON exists" — ⚠️ **THE PREMISE IS NOW FALSE**

§5.1 item 6 reads *"No concept JSON in any branch consumes the rbr scenario, so every field is
authored from the contract, not cloned."* **That is no longer true.**

```bash
git show origin/feat/rotmech-c:src/data/concepts/angular_momentum.json | grep -n scenario_type
#   588:    "scenario_type": "rigid_body_rotation",
```

`angular_momentum.json` — committed `7877393` (2026-08-05 01:31 +0200), pushed on
`origin/feat/rotmech-c`, `tsc` 0 / validator 150 PASS / THE EYE 23/23 / quality-auditor PASS — is a
**working rbr concept JSON**. It is held at founder-proxy Checkpoint B on `FIX(engine)` for
**F-C8**, which is an *engine* hold: **its authoring is signed off and correct.**

**This flips item 6 from a cost into an asset.** json_author clones verified field shapes instead
of deriving each from `APPARATUS_CONTRACT.md`. The three cautions in item 6 survive as
*verification* steps rather than authoring-from-scratch steps:

- `readouts` **re-declared in each state** — a state's array is its own (`:50158`/`:50233`)
- unknown `readouts` tokens are skipped **in silence** (`:50162`/`:50236`) — and `RBR_RO_META`
  (`:50147`) is still the closed six `I · ω · L · KE · dL/dt · F`. **E5 has not landed**
  (`ENGINE_LANDING_NOTICE.md` §7), so **θ, α, τ and v remain unauthorable.** This is still the
  reason wave 2 waits.
- `mode: 'sandbox'` on S6 (P3-ii) has **no precedent** — `angular_momentum` authors no sandbox
  state. This one really is authored from the contract.

**Two things this precedent does NOT license.** Both are correct-as-authored workarounds on
`angular_momentum` and must not be cloned forward as patterns:

1. `restart: { at_ms: 17500, "every_ms": 99000, flip_spin: false }` (`:716`) — a deliberate
   **F-C6 dodge**, documented in `findings_c.md` PASS 12. A one-shot `restart` with no `every_ms`
   computes `NaN` and zeroes L for the whole state. **Drop it when E6 lands; do not propagate it.**
2. The `rbr_l_arrow` focal handoffs (`:641`, `:684`, `:766`) are **correct-but-illegible** until
   **E7**. Authored correctly so they become legible for free — not a shape to imitate blind.

---

## ⚠ Correction owed to Desk E — E7 now has a back-compat surface

`FROZEN_SCOPE_0c3.md` §C row **C-3** states: *"**No back-compat constraint: no concept JSON
consuming rbr exists on any branch** (Desk C verified and withdrew its earlier contrary claim)."*

That withdrawal was narrower than the sentence it became. What this desk withdrew (cycle-2 report
§5.3 item 4) was a claim about **`conservation_of_angular_momentum`'s "already-approved states"** —
Desk A's concept, which indeed has no JSON. It was generalised into "no rbr JSON on any branch",
and **as of now that generalisation is false**: `angular_momentum.json` has been on
`origin/feat/rotmech-c` since 2026-08-05 01:31 +0200, roughly 12½ hours before `FROZEN_SCOPE_0c3.md`
was last written (`6c5ed6d`, 14:06 +0200).

**Why it matters, and why it is E7's problem specifically** — this desk is E7's named verifier
(`ENGINE_LANDING_NOTICE.md` §5). E7 rebuilds the L-arrow primitive (mesh-cylinder shaft, two-sided
clearance, `RBR_AXLE` geometry in scope, a new bounded magnitude→length map replacing the raw
`RBR_L_ARROW_SCALE` clamp). There is now committed authoring that consumes it:

| Site in `angular_momentum.json` | Field | What E7 must not regress |
|---|---|---|
| `:628`, `:671`, `:759`, `:790` | `show_l_arrow: true` (4 states) | the arrow renders on every state that asks for it |
| `:718` | `show_l_arrow: false` | S3 stays clean |
| `:641` | `phases[]` → `glow_focal: rbr_l_arrow` @ 15200 ms | S1 focal handoff |
| `:684` | `phases[]` → `glow_focal: rbr_l_arrow` @ 12600 ms | S2 focal handoff |
| `:766` | state-level `glow_focal: rbr_l_arrow` | S4 — the flip state, where the **≥ 300 px** criterion is measured |

The "absent = byte-identical" clause in the §C registration rider can no longer be discharged
against an empty consumer set. **Reported to `_engine/findings_c.md`, PASS 16.** No engine fix
dispatched from this desk (guardrail 6).

---

## When E6/E7 land — the `angular_momentum` cycle (separate from this list)

Order, per the desk contract: **re-seed → `visual:eyes` → re-walk → founder-proxy**, against the
objective acceptance criteria in `founder_proxy_B.md` §6 — which this desk has confirmed match
`FROZEN_SCOPE_0c3.md` §B E7's "secondary acceptance floors" verbatim:

- arrow ink **≥ 400 px** (S1 frozen)
- pixel-measured length ratio `len(6.51)/len(1.14)` = **5.71 ± 0.10**, intercept **< 1 px**
- arrow-vs-axle contrast **≥ 3:1**
- S4 flip changes **≥ 300 px**

Plus, from E7's contract correction: **the primary assertion is DRAWN GEOMETRY, not pixel
luminance** — assert the shaft mesh exists, is a cylinder not a `Line`, its radius exceeds the axle
radius by the constant-declared ratio, and its drawn length tracks |L|. The pixel floors above are
a **secondary absolute floor**. F-C7's luminance-delta probe is **not** to be carried forward: it
passes on a build where the arrow is still invisible.

Three authoring findings ride the same cycle: **P2-1** (S4 `phases[]`), **P2-2** (the Rule-38g CBSE
cell), **P3** (the `s2_4` idiom). Drop the `every_ms: 99000` workaround when **F-C6/E6** lands.

Two traps from `ENGINE_LANDING_NOTICE.md` §4 apply to that re-run:
1. **`md5sum` the dense frames.** All three EYE dense-motion gates pass by construction on a scene
   that never moved.
2. **Re-seed immediately before every EYE run** — the renderer changed, so a cached `sim_html` is
   stale and silently re-tests the old engine. Read the `Motion map:` line; a `?` means `[D5]`
   did not run. (Desk C's seed already carries the PASS 14 `field_3d_config` fix — `[D5]` was
   ARMED on 5/5 states in run `20260804-181916`.)

**Seed scope reminder:** `npm run cache:clear:scoped -- <id>` only; this desk may seed exactly
`angular_momentum`, `rigid_body_rotation`, `tension_force`, `equipotential_surfaces`.
