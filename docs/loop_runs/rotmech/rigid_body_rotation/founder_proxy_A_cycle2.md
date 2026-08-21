# founder_proxy — Checkpoint A (DESIGN GATE) · `rigid_body_rotation` (rotmech #3) · **fix cycle 2 of 2**

**Reviewed:** `docs/loop_runs/rotmech/rigid_body_rotation/skeleton_rev2.md` against `founder_proxy_A.md` (cycle 1) and `skeleton_rev1.md`.
**Date:** 2026-08-04 · **Desk:** C (`feat/rotmech-c`) · **Authority:** design gate only. No repo file was edited, no agent dispatched, no SQL applied.

> Persisted verbatim by the dispatching session — this cycle's report was returned in-message.

---

## VERDICT — `DESIGN_FIX` (cycle 2 of 2 — the last), all findings → `alex:architect`

**Every one of the five cycle-1 P1s is genuinely closed**, and I verified each against the primary source rather than the response table: R1 is implemented to the letter (commit `2443a74` read; the deletion is a rebuild, not a renumber — entry map, rings, both 38a cuts, aha designation, deep-dive picks, clusters and the JEE trace are all re-derived and internally consistent, with zero residue of the deleted state); C8 is BLOCKING with numbers that check out (φ = 0.35 rad → sin 69.95° = 0.9397; the ≥ 0.90 requirement → φ ≤ 0.451 rad, exact); C10 is a real new row and PASS 5 files it correctly as distinct from F-C3; C7's cost cell is now honest and states the defer recommendation out loud; the ladder re-tune vacated the P₃/mass collision with clearances computed from `RBR_MASS_R`/`RBR_WORLD_PER_M` rather than asserted. All nine P2s and all six P3s are addressed. On the two questions escalated to me, the architect was **right on both** (§R below), and the §8 prerequisite substitution is **correct on the merits**.

It does not pass, for three reasons — and **all three are one-clause document edits**. No design change, no re-derivation, no re-costing, no new engine row is implied by any of them. Two are **recurrences inside this chapter run**, which my Pass-1 ratchet makes P1 automatically, and the third is an unstated geometry constraint on the aha state whose omission makes the concept's misconception counter a rendered lie:

1. **F1 — the skeleton asserts a glow focal ("the rim ring") that no addressable token can match, and registers its new element families for visibility but never for the glow pass.** This is the sibling's A3 (`glow_focal_names_a_container_the_glow_pass_skips_so_the_whole_scene_dims`) arriving on a family that does not exist yet — the failure mode is that the *whole scene dims and nothing brightens*.
2. **F2 — the pin-margin table uses `pin = clamp(0.60R, 150, R−150)`, which does not govern this renderer.** This is an exact recurrence of a candidate row **already drafted against this desk's other skeleton** — `skeleton_pin_table_uses_a_pin_formula_the_target_renderer_does_not_use` (`angular_momentum/founder_proxy_A.md` §6, A6). The table was re-derived from scratch on the new numbering and re-derived it wrong.
3. **F3 — S3's simultaneity beat has two unstated geometry preconditions, and S1/S3 each stack two gauges on one line at one default offset.** The `crossing_mark_at_ms` counter — the visual_counter for the concept's first misconception — is false unless P₁ and P₂ share an arm and the start ray equals θ at window open. Neither is stated anywhere.

I am deliberately not softening these to reach `DESIGN_OK` on the last cycle. This concept is blocked on 0c-3, so the document — not a live build — is the whole deliverable, and it is what Desk E scopes from and what json_author reads weeks from now with nobody in the room who remembers this review. Cycle 2 is mechanically closable: six edits, none requiring a judgment call, none requiring a founder ruling. **ESCALATE is not the expected outcome here and I would regard it as a failure of the closure list, not of the design.**

---

## §R — THE TWO ITEMS ESCALATED TO ME

### R-1 · The P2-7 fence question — **escalating was RIGHT. The named fallback is NOT real, and that should be said out loud.**

Escalating is exactly what I asked for in cycle 1 ("Do not answer it locally"). The count is now performed rather than asserted (2 classes: C1 label cues, the C4 compare family), the C8 ease is correctly listed-but-not-counted (it is a renderer constant, not an authored field), and PASS 5 files the question with the fence's actual two classes named. That is the protocol working.

**But the fallback does not cover the case in which the fence binds.** The skeleton asks two questions at once — *does the fence bind 0c-1*, and *does it count cumulatively with 0c-1's existing surface* — and names one fallback ("fold the C1 label cues into the existing per-element reveal pattern; reveal the S1 labels un-timed"), which reduces 2 → 1. Walk the branches:

- **Fence binds, new classes only:** the count is 2 = the fence. Nothing to fix; the fallback is unneeded.
- **Fence binds cumulatively:** the scenario's existing surface is already six classes (`readout_at_ms`, `phases[]` at/until, `external_torque` engage/release, `restart`, `reference_marks[].at_ms`, `param_ramp` — the skeleton lists them itself). 6 + 2 = 8; dropping to 7 changes nothing. The fallback is inert precisely where it is needed.
- **Fence does not bind 0c-1:** moot.

So the honest statement is: *there is no design fallback for the cumulative reading; under it the concept re-scopes, the same as under a declined C8.* Naming a fallback that cannot discharge the binding branch is the shape of thing the fence was signed to prevent. **P2 — one clause.**

### R-2 · The bug-queue outage — **honest handling. It does not block `DESIGN_OK`, and I verified it myself.**

I ran the query independently:

```
npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts rigid_body_rotation
query failed: <!DOCTYPE html> … supabase.co | 522: Connection timed out … 2026-08-04 13:16:33 UTC
```

The outage is **real, project-wide and still live 24 minutes after the architect's 12:52 UTC attempt**. The handling is the correct one on every axis: the failure is documented in the header rather than papered over, the carried-forward consultation is **same-day** (so the corpus cannot have moved materially), the boundary claim ("nothing outside the four queried result sets is dispositioned") is preserved, conformance to my five unfiled candidate rows is stated row-by-row and is accurate where I checked it, and the 0d re-run is made a precondition on json_author. The only rows that could have entered the table since REV 1 are the candidates this desk itself generated, which are unfiled and which the architect has in hand.

I would have blocked on an *undisclosed* stale audit. A disclosed one, independently reproducible, with a named re-run obligation, is exactly what an agent should do when infrastructure is down. **No finding.** (My own Pass 1 fell back to the same sources; scope stated in §P1 below.)

### R-3 · The §8 prerequisite substitution — **right ids, right scoping, wrong provenance in the flag**

**On the merits the architect is correct and I endorse the refusal.** #3 precedes #5 `torque` and #6 `moment_of_inertia` in the approved order (`phase0_survey.md:42-46`); #3 teaches no dynamics and no mass distribution, so #3 is *their* prerequisite. Naming them would invert the graph — the exact lie Ruling 3 exists to prevent. The three named are right: `uniform_circular_motion` (shipped, and S2 literally extends it), `centre_of_mass` and `motion_of_centre_of_mass` (JSON-less, correctly scoped **advisory for S5 only**, which is also correct under the cut — if S5 goes, so does the dependency). Nothing is missing: the geometry `s = rθ` is not a concept id, and #4 is downstream.

**The flag's wording is defective and the dispatcher's question anticipates it exactly.** §8 says: *"the ruling names `torque` and `moment_of_inertia` as the ids to carry"*. It does not. The founder's R3 stated a **principle**, in the context of `angular_momentum` (#9), where both genuinely apply; the two ids reached #3 through a **dispatch-prompt error**. As written, a later reader concludes the founder directed those ids onto #3 and the architect overrode the founder — the inverse of what happened. Worse, the closing sentence ("If the founder intended them here regardless, that is a one-line §8 edit at cycle 2") leaves open a question that is already closed, and invites a future session to "fix" §8 by inverting the graph. **P2 — rewrite to: R3 is a principle, given in #9's context; the two example ids arrived via a dispatch error; #3's real dependencies are the three named; the question is closed.**

---

## §P1 — PASS-1 RATCHET (scope stated, per the checklist)

Live table unreachable (§R-2). Corpus actually consulted: the two applied rows in `_engine/scar_candidates.sql`; the seven candidate classes in `angular_momentum/founder_proxy_A.md` §6; my own five from `rigid_body_rotation/founder_proxy_A.md` §C; the REV 1 disposition list; the four OPEN classes named in `findings_c.md` PASS 1–5. **Classes checked by name against REV 2** — not a blanket "no recurrences":

| Class | Result |
|---|---|
| `skeleton_pin_table_uses_a_pin_formula_the_target_renderer_does_not_use` | **RECURS — F2** |
| `glow_focal_names_a_container_the_glow_pass_skips_so_the_whole_scene_dims` | **RECURS in kind — F1** |
| `skeleton_reveal_schedule_incompatible_with_its_own_authored_word_budget` | does **not** recur — REV 2 authors no `readout_at_ms` numerals; it states the ordering constraint and hands the ms to physics_author, which is the correct level |
| `repin_blank_fires_on_input_so_a_slider_drag_hides_the_readouts_it_teaches` | closed here by C10, and correctly kept distinct from F-C3 |
| `explore_slider_range_drives_the_taught_vector_past_its_own_arrow_clamp` | N/A — no arrow of any kind survives R1 |
| `contrast_state_chips_the_constant_and_leaves_the_changed_quantity_to_memory` | not present — S3 shows both compared values simultaneously in-frame |
| `field3d_focal_glow_pulse_phase_reads_absolute_time_so_frozen_h2_jitters` | applies fleet-wide; unchanged by this design; noted for THE EYE at 0d |
| `engine_stash_on_shared_renderer_reverts_concurrent_session_uncommitted_work` | N/A (docs-only pass; no `src/` touched — confirmed, tree clean) |
| `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` | honoured — the two-axis solve obligation is carried into C8 verbatim |
| `authored_lumped_constant_inconsistent_with_the_drawn_apparatus_geometry` | closed with computed numbers ✓ |
| `signed_engine_union_drops_items_its_own_state_table_still_consumes` | discharged — the old→new mapping is explicit and I verified no orphaned consumption |

---

## §2 — PER-STATE TABLE (6 of 6, explore included)

| state | correct | order_ok | labels_present | reads_sound_off | clearly_different | how_i_would_use | problem_or_missing | pri |
|---|---|---|---|---|---|---|---|---|
| S1 rigid body / fixed distances | Y | Y | Y — P₁, P₂, 0.30 m, 1.40 m | Y (under C8; **not** under the pinned pose) | Y — opens the arc | "Watch the two numbers while it spins. Nothing about this body changes." | Both gauges take C5's single default standoff and are collinear (0.30 nested inside the 1.40 span through the axis) | P1 (F3) |
| S2 every point circles | Y | Y | Y — traces + markers; no numeral needed | Y | Y — `trace-draw`, first painted path | "Follow each dot round with a finger — two circles, one body." | Pin lands at 1500 ms today; only C9's registration of trace-complete moves it (F2) | P1 (F2) |
| S3 outer travels farther | Y | Y | Y — r₁ 0.30, r₂ 0.60, s₁ 0.81, s₂ 1.62, ω 1.50 | Y | Y — `arc-compare` + flashed crossing | "Freeze on the flash: both hit the line together — now read the two arc numbers." | Same-arm and start-ray constraints unstated; two nested radius gauges at one offset; the anchor still asserts a speed | P1 (F3) |
| S4 same radius, same circle | Y | Y | Y — r 0.10 / 0.50 / 0.50 | Y | Y — `populate-rule`, 13 points | "Count the dots on the outer ring — same distance out, same path, any angle." | Focal "the rim ring" is not an addressable token (F1); 2 of 8 rim dots necessarily sit on the rod's diameter and one at the always-on stripe tip (0.506 m vs 0.50 m) | P1 (F1) |
| S5 slide + spin | Y — trochoid bound authored correctly | Y | Y — 1.10 m, "centre", ω | Y | Y — `translate-through` | "The centre goes straight; that same point loops. One motion, two parts." | Rides defer-recommended C7; cut verified clean | P3 |
| S6 explore | Y (given C10 + C6) | Y — explore-last | Y — live r gauge + ω HUD | Y | Y — `drag-sandbox` | "Drag the dot in to the axle — its circle shrinks to nothing." | None. The r/m/τ_brake exclusions remain right | — |

---

## §3 — FINDINGS

### **F1 · P1 · S4 · The state's focal is a token nothing can match, and the new element families are registered for visibility but not for the glow pass.** `[owner: alex:architect]`

**Machine evidence.** The glow pass resolves exactly one focal string and matches it two ways only:

```js
// field_3d_renderer.ts :50776-50777
var isFocal = !!focal && (ud.id === focal || ud.elementType === focal);
```

`glowActive = !!focal` (`:50773`), so a **non-matching non-empty focal dims everything and brightens nothing** — the sibling's A3 defect verbatim. §3 S4 authors *"Focal (32e): the rim ring during the same-radius beat"*; "the rim ring" is eight of thirteen markers. It cannot be an `id` (one string, eight objects) and it cannot be the marker `elementType` (that would light the five line dots too). **C1 does not define any group/elementType token, and C9's registration list covers `RBR_ELEMENT_TYPES` + the overlay `flags` map (`:50586-50613`) — visibility only.**

Second half, same root: §3's Rule-32 plan states *"markers/traces/gauges join the brighten-only solid set"*. That set is a **hardcoded elementType list** at `:50782-50788` (`rbr_axle`/`rbr_drum`/`rbr_drum_marker`/`rbr_rod`/`rbr_mass`/pad/arm/hand/labels). A new elementType absent from it takes the dim branch — *opacity 0.40*, the "40% turntable renders as glass" case the code comment names. No row obligates that edit.

**What the founder would say.** *"You told me the ring lights up. On screen the whole machine went grey and nothing lit."*

**Required (one clause each, no new row).** (a) C1: markers carry an authored **group token**, registered so the focal test can match it, with the rim ring and the dot line as distinct groups. (b) C9: extend the registration rider from "`RBR_ELEMENT_TYPES` + flags map" to "**+ the focal-match tokens + the brighten-only `solid` list at `:50782-50788`**" for every new family (markers, traces, gauges). This closes the forward walk for S4's asserted highlight, which currently has no owning contract.

### **F2 · P1 · all states · The pin-margin table repeats a pin formula this desk was already told does not govern field_3d.** `[owner: alex:architect]`

**Machine evidence.** §3 states *"pin = clamp(0.60R, 150, R−150)"* and derives six margins from it. The real rule, read this session:

```ts
// deriveStateMeta.ts :3445
out[stateId] = clampReveal(maxRevealForField3dState(o, f3d.coilTurns));
// :3423  clampReveal = min(60000, max(1500, ms))
// :3215  return candidates.length > 0 ? Math.max(...candidates) : DEFAULT_REVEAL_MS;
```

The pin is `max(registered reveal candidates)`, clamped to [1500, 60000]. **There is no duration or loop-period term anywhere in it.** The rbr block (`:3128-3213`) accepts exactly six sources: `param_ramp.end_ms`, `external_torque` engage/release, `restart.at_ms`, `reference_marks[].at_ms`, `readout_at_ms`, `phases[]`. This concept authors **none** of the first four. Concretely, today: **S1 and S2 register nothing** (ω is not printed until S3), so `!rbrFound` → `RBR_CUSHION` 900 → clamped to **1500 ms** — S1 pins with one gauge unbuilt, S2 with the traces a third painted. The renderer's own comment names that failure class (`field3d_scenario_missing_maxreveal_block_frozen_pin_defaults_1500ms_predates_scripted_reveal`).

**This was filed against this desk on this run**: `angular_momentum/founder_proxy_A.md` §6, class `skeleton_pin_table_uses_a_pin_formula_the_target_renderer_does_not_use`, finding A6. REV 2 re-derived the table from scratch on the new numbering and re-derived it with the same wrong rule.

**Why it matters even though nothing renders wrong today.** The wrong model makes registration look optional ("my last reveal is at 3.2 s, the pin is at 6.0 s, I'm safe"); the right model makes C9 the *only* thing standing between this concept and a self-contradictory H2 baseline. The skeleton's C9 list is complete and correct — but its rationale in §3 rests on arithmetic that is not real, and §3 instructs physics_author to *"recompute at the engine step size"* using it.

**Required.** Replace the formula with `pin = clamp(max(registered reveal candidates), 1500, 60000)`; restate each row as "last asserted reveal → the C9 key that registers it → the resulting pin"; and state plainly that **C9 registration, not the margin arithmetic, is what makes the frozen frame photograph the claim.** Do **not** mint a new `bug_class` — amend the existing draft (§4).

### **F3 · P1 · S3 (and S1) · The simultaneity beat has two unstated preconditions, and every two-gauge state stacks both gauges on one line.** `[owner: alex:architect]`

Three constraints, one root: coincidence and distinctness are asserted in prose but never reduced to authored placement.

1. **Same arm — unstated, and the misconception counter is false without it.** §2 says only *"marked points on the rod at r = 0.30 (P₁) and 0.60 (P₂) m"*. The rod is symmetric (`sides = [1, -1]`, `:50355`) and REV 2's own gauges *cross the axis* twice ("P₂→far-mass", "P₁→far-mass"), which actively primes a cross-body layout. **If P₁ and P₂ sit on opposite arms they cross a single fixed start ray half a revolution apart** — and §4's first `visual_counter` ("BOTH points cross the fixed start line at the same flashed instant") renders a lie on the concept's aha state. Grep confirms the word "arm" appears nowhere in the file.
2. **The start ray must equal θ at window open — unstated, and the authored 5.2 s encodes it.** C4 declares `start_line.angle_deg` and `compare_window.from_ms` as independent fields. The design's numbers only cohere if the body is *at* the start ray when the window opens: window 1.0 s → arcs sweep 1.80 s (2.70 rad, exactly 0.81/1.62 m ✓) → the next crossing at 1.0 + 2π/1.5 = **5.19 s**, which is the authored ~5.2 s flash. If the ray is authored at θ(0) instead, the flash belongs at 4.19 s and the arcs no longer begin at the line.
3. **Two gauges, one offset.** C5 authors *"default 0.10 world units ≈ 0.056 m, lateral to the span; authorable per gauge"* — one default, and no state names an override. S1 draws 0.30 m (axle→P₁) and 1.40 m (P₂→far-mass, through the axis); on one arm the second span **contains** the first. S3 draws r₁ = 0.30 and r₂ = 0.60, nested by construction. At one offset both pairs render as segments lying on top of each other. This is my cycle-1 P2-1 item 2 half-closed: the *equal-length* coincidence was removed, the *collinearity* was not, and P2-2's standoff fix supplies a single lane. (The choice of a **lateral** rather than vertical offset is right and I credit it — a vertical offset collapses onto the rod under the near-top-down pose.)

**What the founder would say.** *"Twice the radius, twice the arc — but I'm looking at one line with two numbers floating near it."*

**Required (three clauses).** (a) State that P₁ and P₂ share an arm, and why (the crossing beat). (b) State `start_line.angle_deg = θ(compare_window.from_ms)` as an authoring constraint on C4, with the 5.19 s crossing shown as its consequence. (c) Author distinct offsets — the clean solve is r₁ at +0.10 world and r₂ at −0.10 world, flanking the rod, which also makes "twice as long" directly visible as two parallel bars.

---

### P2 findings

**F4 · P2 · S4 · Two of the eight rim dots necessarily sit under the rod, and one at the always-on stripe tip.** `[owner: alex:architect]`
The P2-3 disposition asserts *"the dots co-rotate with the rod at ±90°, so they stay clear of it at every instant."* True for the five-dot **line**; false for the eight-dot **ring**, which spans all angles. Evenly spaced from 90°, two dots land at 0° and 180° — under the rod (radius 0.05 world at 0.45 world height, `:50346-50349`; parallax offset ≈ 0.16 world at 70° elevation). Worse, the always-on stripe runs to `RBR_DEF_DRUM_R·W·0.92` = **0.506 m** (`:50322-50326`), and the rim ring sits at **0.50 m** — the stripe tip lands on the ring, 0.011 world from a dot. Fix: offset the ring by 22.5° (dots at 22.5° + k·45°), which clears both the rod diameter and the stripe, and state the clearance.

**F5 · P2 · S3/§9 · The anchor still asserts a speed the concept no longer teaches.** `[owner: alex:architect]`
*"a merry-go-round — the rider at the edge moves fastest"* was on-payload in REV 1 and is off-payload under R1. The skeleton patches it with a narration instruction ("cashed out as 'covers more ground in the same time'") — but that costs words on the one state that is already over budget (the named pieces sum to ≈57 words against a 55 ceiling, which is why the anchor is the *first* item in the cut order), and it plants #4's frame inside #3. Write the anchor as a distance claim — "on a merry-go-round the rider at the edge travels the longest way round" — and the cash-out clause disappears with it.

**F6 · P2 · §3 camera plan · "Radius solved per state" lets the apparatus change size at every click.** `[owner: alex:architect]`
S1–S3 have identical drawn extents (rod ±1.8 world, gauges, traces); if each solves its own radius they will differ, and the teacher sees the machine dolly on every state change — Rule 32d ("at every click the only visible change IS the new thing") and the F-C4 binding note ("a per-state pose must not read as a different machine"). Author **one shared radius for S1–S3**, and name S4 (drum-face) and S5 (glide) as the only two declared framing moves in the concept. The 800 ms closed-form ease is correct as authored and clears every pin comfortably.

**F7 · P2 · §8 · The prerequisite flag misattributes a dispatch error to the founder's ruling.** `[owner: alex:architect]` — see §R-3.

**F8 · P2 · engine ask · The named P2-7 fallback cannot discharge the branch that needs it.** `[owner: alex:architect]` — see §R-1. Say so; do not leave a fallback standing that is inert under the cumulative reading.

### P3 notes (fix if cheap; do not spend the cycle on them)

- **P3-a** — S4's §3 text says *"Camera moves to the drum-face view"* while the camera table gives S1–S4 the same φ and θ, differing only in radius. Say which it is (a dolly, not a new elevation), or json_author will invent one.
- **P3-b** — the C8 poses give φ and θ with numbers but defer radius to a build-time solve. Correct in principle (a solve needs the scene); name the *acceptance test* instead — full rod span + gauges + labels inside the frame, clear of the `:50435-50466` DOM zones — so Desk E can close the row without a judgment call.
- **P3-c** — with the near-top-down pose the axle (`:50305-50309`, 3.4 world tall, spanning y −1.1…2.3) is seen close to end-on. It still reads at 70°, and the concept needs the *plane*, so the trade is right — but one clause confirming the axle stays legible would pre-empt a Checkpoint B surprise.
- **P3-d** — §4 places both `misconception_watch` beats on S3. That is correct placement (one genuine pivot, two halves of one belief) rather than spraying, but it should be *said*, because it will read as a guardrail question to the 0d reader.

---

## §4 — CANDIDATE SCAR ROWS

For the dispatching session to file (or save to `_engine/scar_candidates.sql`). `bug_class` checked against: the two APPLIED rows in that file, the seven drafted in `angular_momentum/founder_proxy_A.md` §6, and my own five in `rigid_body_rotation/founder_proxy_A.md` §C. **No collisions.** Not applied to the DB by me.

**FIRST — a recurrence, NOT a new class.** F2 recurs `skeleton_pin_table_uses_a_pin_formula_the_target_renderer_does_not_use`, already drafted in `angular_momentum/founder_proxy_A.md` §6. **Do not mint a second class** (`bug_class` is the upsert key). Amend the existing draft: add `'rigid_body_rotation'` to `concepts_affected`, and append to `root_cause` that it recurred in the same chapter run, on the same desk, in a table re-derived from scratch after the first filing — which is the evidence that the prevention rule has to be checkable, not remembered.

```sql
-- Candidate F - F1. New element family registered for visibility, invisible to the glow pass.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'skeleton_registers_a_new_element_family_for_visibility_but_not_for_the_glow_pass',
    'A skeleton buys a new on-canvas element family and registers it in the visibility list only, then authors a glow focal naming it - so the focal matches nothing, the whole scene dims, and the new elements render at overlay opacity',
    'MAJOR',
    'alex:architect',
    'The rbr glow pass resolves ONE focal string and matches it two ways only - field_3d_renderer.ts:50776, isFocal = (ud.id === focal || ud.elementType === focal) - while glowActive = !!focal at :50773, so a non-empty focal that matches nothing takes every element down the non-focal branch and brightens none. Separately the brighten-only carve-out at :50782-50788 is a HARDCODED elementType list (axle, drum, drum_marker, rod, mass, pad, arm, hand, four label types); an elementType absent from it takes the dim branch, which drops opacity to 0.40 - the case the code comment describes as a 40 percent turntable rendering as glass. rigid_body_rotation authored a focal called the rim ring, meaning eight of thirteen new markers: not expressible as an id (one string, eight objects) and not expressible as the marker elementType (that would light the five line dots as well). Its engine rider C9 obligated deriveStateMeta keys, RBR_ELEMENT_TYPES and the overlay flags map - all three of which are VISIBILITY surfaces - and nothing in the ask reached the glow pass at all. The same renderer had already produced this failure once in the same chapter run, with glow_focal rbr_spin naming a container the pass skips before the focal test.',
    'When a skeleton buys a new on-canvas element family, its registration rider must enumerate EVERY pass the family must be visible to, not only the visibility pass: (1) the element-type list, (2) the overlay flags map, (3) the FOCAL-MATCH tokens, and (4) the brighten-only solid list. If any state authors a focal on a SUBSET of the new family, that subset needs its own addressable group token, stated in the engine row - a focal is one string and cannot enumerate objects.',
    'js_eval',
    'For every state of a field_3d concept, read the authored glow_focal (including phases[].glow_focal) and assert at least one scene object satisfies ud.id === focal || ud.elementType === focal. Separately assert that no non-focal element of a newly bought family renders at the dim-branch opacity when the state declares it as apparatus.',
    'OPEN',
    ARRAY['rigid_body_rotation', 'angular_momentum']::text[],
    ARRAY[]::text[],
    'rotmech desk C - rigid_body_rotation Checkpoint A cycle 2, 2026-08-04',
    'incident'
);
```

```sql
-- Candidate G - F3. A coincidence asserted in prose, never reduced to authored placement.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'skeleton_asserts_a_coincidence_between_annotations_without_authoring_the_placement_that_makes_it_true',
    'A skeleton states that two authored annotations coincide, stay distinct or do not overlap, and never writes the placement constraint that makes the statement true - so the claim survives review as prose and fails as pixels',
    'MAJOR',
    'alex:architect',
    'rigid_body_rotation S3 carries the concept primary misconception counter as a simultaneity claim: both marked points cross one fixed start line at the same flashed instant, staged by an authored crossing_mark_at_ms. Two placement facts have to hold for that to be true and neither is written anywhere in the skeleton. First, the two markers must sit on the SAME arm of a symmetric rod (sides = [1,-1] at :50355); on opposite arms they cross a single fixed ray half a revolution apart, and the counter renders a lie - and the skeleton own gauges cross the axis twice, actively priming a cross-body layout. Second, the authored crossing instant of 5.2 s is only correct if start_line.angle_deg equals theta at compare_window.from_ms: window opens at 1.0 s, one revolution is 2*pi/1.5 = 4.19 s, so the crossing is at 5.19 s - but the engine contract declares start_line.angle_deg and compare_window.from_ms as INDEPENDENT fields, so an author can satisfy both literally and still detach the arcs from the line. A third instance of the same root in the same document: the distance-gauge contract carries ONE default lateral standoff, and both states with two gauges draw NESTED collinear spans (0.30 inside 1.40 through the axis; r1 = 0.30 inside r2 = 0.60), so at the default offset the two gauges lie on top of each other.',
    'Any skeleton sentence of the form these coincide, these stay distinct, these do not overlap, or these read as two things is a PLACEMENT CONSTRAINT and must be written as one, in numbers, next to the claim: which arm, which angle, which offset, which clearance. Reducing it to numbers is also the check - a constraint that cannot be written as a number is a claim the author has not yet verified. Where the engine contract exposes the two quantities as independent fields, the skeleton must state the relation BETWEEN them, because the schema will not.',
    'manual',
    'For each state, list every asserted coincidence or distinctness between authored annotations, and for each one name the authored field values that force it. Any assertion whose supporting values are absent from the skeleton, or are exposed by the engine contract as independent fields with no stated relation, is a finding.',
    'OPEN',
    ARRAY['rigid_body_rotation']::text[],
    ARRAY[]::text[],
    'rotmech desk C - rigid_body_rotation Checkpoint A cycle 2, 2026-08-04',
    'incident'
);
```

**Schema note for the dispatcher:** both rows use live enum values only (`severity` ∈ CRITICAL/MAJOR/MODERATE; `probe_type` ∈ js_eval/manual; `row_type` = incident), both arrays are Postgres literals and neither is NULL, and `subject` is deliberately unset — per the file's own header note, file these as `subject = 'subject_neutral'`, since both are authoring-process defects in shared machinery. My five cycle-1 candidates remain unfiled and remain valid; Candidate B (`skeleton_claims_a_relation_the_approved_spine_assigns_to_a_different_concept`) is now *founder-confirmed* by `2443a74` and is the strongest of them.

---

## §5 — ENGINE QUEUE

**No new engine row comes out of this review, and no `FIX(engine)` verdict.** All three P1s and all five P2s are authoring-side and route to `alex:architect`. Stated explicitly because the ask is the deliverable Desk E scopes from and the count must not drift: it stays **8 active (C1, C3, C4, C5, C6, C8-BLOCKING, C9, C10) + C7 defer-recommended + C2 withdrawn**.

Two findings **land inside existing rows** as contract text, not as new rows:
- **F1 → C1 + C9** (group token addressable by the focal test; the registration rider extended to the focal-match tokens and the `:50782-50788` brighten-only list). This is the row text Desk E needs; without it C1 is buildable and S4 still fails.
- **F3(c) → C5** (per-gauge offsets, with S1's and S3's pairs named).

`findings_c.md` PASS 4 and PASS 5 are accurate against the skeleton and against the code — I re-verified F-C4's φ/aspect arithmetic and C10's full trace independently. PASS 1's stale C2 and "C8 optional" text is correctly superseded rather than edited, which is right for an append-only mirror.

---

## §6 — WHERE TO LOOK FIRST (no frames exist at Checkpoint A)

1. `src/lib/renderers/field_3d_renderer.ts:50770-50789` — the glow pass. One focal string, two match forms, a hardcoded brighten-only list. **F1 lives here.**
2. `src/lib/validators/visual/deriveStateMeta.ts:3128-3215` + `:3445` — the real pin. Six accepted rbr reveal sources; no duration term. **F2 lives here.**
3. `skeleton_rev2.md` §3, S3 row — the three unstated placement constraints on the concept's aha. **F3 lives here.**
4. `field_3d_renderer.ts:50320-50327` + `:50585` — the always-on stripe tip at 0.506 m against a rim ring at 0.50 m. **F4.**
5. `skeleton_rev2.md` §8 — the prerequisite flag's provenance. **F7 / §R-3.**

---

## §7 — CLOSURE LIST FOR CYCLE 2 (mechanical; nothing here is a judgment call)

1. **F1** — C1 gains a marker **group token** addressable by the focal test; C9's rider extends to the focal-match tokens **and** the `:50782-50788` brighten-only list.
2. **F2** — pin table restated as `clamp(max(registered reveals), 1500, 60000)`, each row naming the C9 key that registers its last reveal; the "C9 is what makes this true" sentence added.
3. **F3** — same arm stated; `start_line.angle_deg = θ(compare_window.from_ms)` stated; r₁/r₂ and S1's two gauges given distinct offsets.
4. **F4** — rim ring offset 22.5°, clearance stated. **F5** — anchor rewritten as distance. **F6** — one shared camera radius S1–S3; S4/S5 the only declared moves.
5. **F7** — §8 flag rewritten (R3 = principle, given in #9's context; the two ids arrived by dispatch error; question closed). **F8** — say that no fallback covers the cumulative reading.
6. P3-a…P3-d if cheap; each may be declined in writing with a reason.

Everything else in REV 2 is **endorsed and must not be re-opened**: the R1 rebuild and the 6-state arc, the deletion bookkeeping, the C8 camera plan and its arithmetic, C10, the C7 defer recommendation, the C2 withdrawal, the ladder re-tune and clearances, the coined archetypes, the ring cuts, the v-readout and r/m/τ_brake refusals, the S3 cut order, and the prerequisite ids themselves.

---

```
RUBRIC (advisory, unratified — docs/EXEMPLAR_RUBRIC.md; did not affect the verdict)
Checkpoint A scores the five answerable from a skeleton.

  D1 1 · D2 2 · D8 2 · D9 2 · D10 2                                        = 9/10  (cycle 1: 8/10)

  weakest: D1 information gain — S4's gain THINNED under R1 and I am recording it
           rather than acting on it, because I directed the re-point myself in
           cycle 1. In REV 1 the state added a quantitative fact ("same radius,
           same speed"); under R1 it adds "same radius, same circle", which a
           student who has seen S2 ("each point moves in its own circle about the
           axis") can largely derive — the residual gain is the jump from a rod to
           a continuous body and the ruling-out of angular dependence, which no
           listed misconception doubts. S1 also remains thin by construction (a
           null result on a body that cannot deform), now partly repaired by the
           C8 pose, which gives it a picture that could have changed and doesn't.
           Evidence: §3 S2 beat vs §3 S4 beat; §4 lists no belief at S4.
           D8 misconception placement — placement is exact, not sprayed, so it
           scores 2; the observation is that both beats now sit on ONE state
           (§4: both rows read "At S3"), where the rubric's 2-anchor imagines
           2–3 pivots. Correct for this concept — the concept has one pivot and
           both halves of the belief bite there — but it concentrates the whole
           misconception load, the whole quantitative payload and the anchor on
           the single state that already needs a named cut order to fit its budget.

  This did not change the verdict. The verdict rests on F1, F2 and F3, each of
  which stands on its own machine evidence.
```

---

## HANDOFF

- **Verdict:** `DESIGN_FIX` → `alex:architect`, **cycle 2 of 2**. Six document edits; no design, engine-ask or cost change.
- **Cycle-2 gate:** the §7 closure list, each item landed **or declined in writing with a reason**. On a clean close this is `DESIGN_OK`.
- **Rulings returned as asked:** P2-7 escalation **correct**, fallback **not real** (F8) · outage handling **honest, independently verified**, does **not** block · §8 substitution **correct on the merits**, flag wording **defective** (F7).
- **Still on the founder/office list:** does the two-timed-class fence bind 0c-1 (and cumulatively?) — `findings_c.md` PASS 5; and F-C4's chapter-wide camera question, on which this concept's authorability depends.
- **Nothing here is a shipping judgment.** Checkpoint A is a design gate; Rule 17 is untouched.
