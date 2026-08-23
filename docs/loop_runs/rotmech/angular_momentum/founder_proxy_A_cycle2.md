# founder-proxy — Checkpoint A (DESIGN GATE) · `angular_momentum` · fix cycle 1 → verdict for cycle 2

**Target:** `C:\Tutor\physics-mind-rotmech-c\docs\loop_runs\rotmech\angular_momentum\skeleton_rev3.md`
**Desk:** C (`feat/rotmech-c`) · Class 11 Ch.7 concept #9 · rbr scenario, built and merged
**Chain read:** `skeleton_rev1.md` → `founder_proxy_A.md` → `skeleton_rev2.md` → `skeleton_rev3.md` (+ `docs/loop_runs/rotmech/_engine/findings_c.md` PASS 4/PASS 5)

> Persisted verbatim by the dispatching session — founder-proxy is report-only and writes no repo file.

---

## 1 · VERDICT — `DESIGN_FIX` (fix cycle 2 of 2 — the last; all findings → `alex:architect`)

**A1–A13 are discharged.** I re-derived, not accepted: every reveal instant against the word plan at 2.6 w/s; every pin against `deriveStateMeta.ts:3145/3156/3175/3185/3195` + `clampReveal :3423`; the four focal tokens against the glow pass's early-return list at `:50776`; the L-chip's latch-safety against the reveal-gated predicate at `:50275`; the `slider_controls` band against `rbrSc :50005–50014` and the arrow clamps at `:49796–49797`; the `core_only` cut after A5's t = 0 branch. All correct. Both founder rulings are implemented faithfully — the camera plan matches F-C4 as filed, including the "#9 survives on the existing oblique pose / #3 does not" asymmetry, and §8 states Ruling 2 with its reasoning and keeps the no-silent-drop instruction.

It does not pass, because **the A1 re-timing tripled the narration but left the choreography windows where the old clock put them.** S3 — the primary aha — now holds a **completely static canvas from 11.0 s to 17.0 s** (6.0 s: platform at rest, masses parked, all three readouts frozen, nothing revealing) while narration talks about a restart that has not happened yet. S2's taught motion is 3.4 s of a 22 s state, behind 13.9 s of a picture identical to S1's last frame. That is the exact failure Rule 37 was written for, one state earlier in the pipeline, and it was created by the fix I ordered — which makes it mine to catch here rather than at Checkpoint B.

Two smaller things the same fixes created: the corrected focals now **actually dim** (they didn't before — `rbr_spin` brightened nothing), so S1's newly-added L arrow (A5's whole point) and S2's declared tracking channel both render at `GLOW_DIM_OPACITY = 0.40` for their entire states, with no `phases[]` to move the emphasis across four sentences; and the ONE pose-dependent beat missing from the `[POSE-OBLIQUE]` list is S3's mass slide, whose lever — `theta0_rad` — the ENGINE-REALITY WALK marks DECLARED-INERT while the engine implements it at `:50499 → :50557 → :49958/:49970`.

All three are cheap: two numbers, one `phases[]` block per state, one walk row. None touches state count, physics, numbers, rings, prerequisites, or the camera plan.

**Not an ESCALATE.** No physics doubt; the closed forms re-check exactly. Budget: this is cycle 2 of 2, so a third `DESIGN_FIX` is not available — but per the prime directive, budget is not a reason to pass a defect. If the next revision leaves a residual I will hand it to the founder rather than lower a grade.

---

## 2 · PER-STATE TABLE

Checkpoint-A form (no frames exist; `reads_with_sound_off` judged from the authored visual plan). Rows unchanged from cycle 0 are marked ✔fixed.

| State | correct_YN | order_ok_YN | labels_present_YN | reads_with_sound_off_YN | clearly_different_YN | how_i_would_use | problem_or_missing | P |
|---|---|---|---|---|---|---|---|---|
| **S1** "A spinning body carries angular momentum" | Y | Y | Y | **Y** ✔fixed (A5: `L = Iω` + L arrow from t = 0) | Y | "Three numbers appear one at a time; the third is the first two multiplied." | Timing now sound (A1 ✔) but the focal `rbr_drum_marker` is static for 24 s / 4 sentences and dims the L arrow to 0.40 for the whole debut state (**B2**) | P2 |
| **S2** "Slower spin, smaller L" | Y | Y | Y | Y | Y | "I holds still; L and ω fall together onto the number we printed before it happened." | The decay occupies 15.0–18.4 s of a 22 s state; 13.9 s of preamble in which the canvas is S1's last frame (**B1**); L arrow dimmed while its LENGTH is the tracking channel (**B2**); sentence plan totals 48 w against a 40–55 column (**B4**) | **P1** |
| **S3** "Mass position changes L" — PRIMARY AHA | Y | Y | **Y** ✔fixed (A2: both chips on one frame) | **Y** ✔fixed | Y | "Stop it, slide the masses in, spin it back to the same speed — read L beside its own before-value." | **11.0 → 17.0 s: nothing on canvas moves or changes (B1)**; the mass slide — the only mover and the mechanism of the aha — is pose- and stop-azimuth-dependent, untagged, and uncontrolled (**B3**) | **P1** |
| **S4** "L points along the axis" | Y | Y | Y | Y | Y | "Curl your right hand with the rim — thumb up. Other way — thumb down, same line." | Clean. Focal `rbr_l_arrow` is the focal, so no dim problem here; `[POSE-OBLIQUE]` correctly tagged as the most pose-critical beat | P3 (the #10-S6 duplication, a Checkpoint-C founder item) |
| **S5** "Try it yourself" (explore) | **Y** ✔fixed (A4: claim rewritten honestly; band narrowed) | Y | Y | Y (arrow live; readouts return 0.5 s after release) | Y | "Drag m, watch the arrow; let go, watch the numbers re-pin." | Sandbox genuinely narrowed (m 0.5–3.0, ω₀ 1.0–2.0) — the honest trade, correctly argued; `m` still has no drawn-geometry correlate, stated plainly | P3 |

---

## 3 · FINDINGS

### P1 — block `DESIGN_OK`

**B1 · The re-timing stretched the narration and left the choreography where it was: S3 holds a fully static canvas for 6.0 s, and S2 back-loads its only taught motion into its last 15%.** `[owner: alex:architect]`

S3's authored event list (§3 control table), reconstructed on the state clock:

| window | what is on screen |
|---|---|
| 0 – 3.4 s | home spin (motion) |
| 3.4 – 4.0 | pad travels in (motion) |
| 4.5 – 6.795 | decay to rest; readouts fall live (motion) — stop instant `4.59/2.00 = 2.295 s` after engage, closed form `:49937–49943` |
| 7.5 – 8.1 | pad retracts (motion) |
| 7.8 | "before: 4.59" chip reveals |
| 9.0 – 11.0 | `param_ramp` r 0.80 → 0.20; I falls 3.06 → 0.66 live (motion) |
| **11.0 – 17.0** | **nothing.** ω = L/I = 0 exactly (`:49945`, `rbrLAt` rest-clamped at `:49942`), so θ does not advance (`:49961`); masses parked; I/ω/L all constant; no reveal; `show_l_arrow: false`. **6.0 s of a frozen picture.** |
| 17.0 | "same speed: 1.50" chip |
| 17.5 – 18.0 | blank + badge |
| 18.0 – 23.0 | spinning again |

Narration T4 ("restart at the same speed", 13.1 → 16.9 s) plays over the dead window, so the state is not silent — it is motionless. This is the D7 anchor verbatim ("dead zone over most of the state") landing in the concept's primary aha, and it is what Rule 37 exists to prevent one layer down. My Pass-4 checklist item is "a state where nothing moves"; six seconds qualifies.

The same mechanism, milder, in **S2**: the pad's travel is gated on T3 naming it (`ends 13.8 s → travel begins 13900`), so the decay runs 15.0 → 18.4 s in a 22 s state and the first 13.9 s show a picture visually identical to S1's final frame — while the on-canvas delta cue already reads "L falls with the spin" (Rule 32d: at the click, the only visible change should BE the new thing).

**Root cause, and why it is design-level rather than physics_author's:** §3's conversion rule was applied to *every* channel, including physical objects. The ledger discipline it serves (scar `symbol_printed_on_canvas_before_the_lesson_defines_it`) governs **printed symbols and values** — `readout_at_ms`, chips, the formula surface. Rule 32a governs objects, and it requires only that the cause move before the effect, not that narration name it first. Gating the pad and the ramp on their sentences serialised narration→motion instead of overlapping them.

**Fix shape (cheap, and it moves no pin):**
- Widen S3's ramp to span the narration — e.g. `param_ramp` 9000 → 16000 (a 7 s slide). The physics is identical (L = 0 and ω = 0 for every I(t) during the slide), the I readout falls live for 7 s instead of 2, and the pin is unchanged: ramp end + 900 = 16900 < restart 17500 + 500 + 1500 = **19500** (`:3145` vs `:3175`).
- Let S2's pad travel early (the object may move before it is named) so the decay sits mid-state rather than in its last quarter.
- State the rule in §3 so physics_author cannot re-create the hole when it recomputes from real word counts: *no guided state holds a fully static canvas for more than ~2 s; the movers must span the narration.*
- **Consider trimming toward the middle of the word band rather than the top.** All four states are authored at their maximum (55/48/55/50 words), which is what forced 22–24 s states and 91 s of guided runtime. Rule 31's own conversion puts 55 words at ≈20 s; 40–45 words per state would shrink both the states and the holes. This is the branch of A1 the revision did not consider, and it is the one that also fixes S2's preamble.

### P2

**B2 · S1 and S2 author a static `glow_focal` across four sentences, and it dims the one overlay each state depends on.** `[owner: alex:architect]`

A3's fix worked — `rbr_drum_marker`, `rbr_brake_pad`, `rbr_mass`, `rbr_l_arrow` all clear the early return at `:50776`. But a *reachable* focal now has a real consequence the REV 1 no-op did not:

```js
// :50782-50789 — the solid carve-out list, then:
applyGlowEmphasis(o, isFocal, glowActive, glowP, solid);
// :3397-3398 — non-focal, NOT solid:  m.transparent = true; m.opacity = GLOW_DIM_OPACITY;  // 0.4
```

`rbr_l_arrow` is **not** in the solid list (`:50782–50788`) — arrows keep the real dim channel by design. So:
- **S1** (focal `rbr_drum_marker`): the axial L arrow — the concept's registered headline visual, added by A5 precisely so the definition beat carries it — renders at 40 % opacity for all 24 s, including T4's clause that introduces it. Its label `rbr_l_label` **is** solid, so a bright "L" sits over a faded arrow.
- **S2** (focal `rbr_brake_pad`): the arrow is dimmed for all 22 s while §3 declares its length (0.918 → 0.306) the state's tracking channel and D2 tags it `[POSE-OBLIQUE]` as pose-critical. The pad also stays focal for ~4 s after it has retracted and stopped mattering.

I am not calling the 40 % dim an engine defect — the engine's own recorded judgment is that "an arrow at 40 % still reads as an arrow" (`:49010–49026`, force_rig). The finding is the **static focal on a 22–24 s state**. S3 already does this right with `phases[]`. Compounding it: `applyRigidBodyRotationGlow` reads `(eng.glow_focal) || rb.glow_focal` and **has no `glowTargets` fallback** (contrast force_rig `:49002`), so per-sentence narration `glow` is inert in every rbr state — `phases[]` is the *only* emphasis instrument this scenario has, and S1/S2 decline to use it.

Fix: author `phases[]` in S1 (marker → rod/masses at T2 → marker at T3 → **`rbr_l_arrow` at T4**, the sentence that introduces it) and in S2 (pad through travel + engage → `rbr_l_arrow` through the decay and the chip match). Zero engine cost; `phases[]` is implemented at `:50647–50657` and already in the walk.

**B3 · The one pose-dependent beat missing from the `[POSE-OBLIQUE]` list is S3's mass slide — and its lever is a field the walk marks inert while the engine implements it.** `[owner: alex:architect]`

The camera plan checks S3 and declines to tag it, on the reasoning that the beat "rides readouts + chips — pose-independent DOM surfaces". That is true of the *numbers* and false of the *mover*. The slide is a translation in the horizontal plane (`param_ramp` on r, `rbrRAt :49851–49856`), so its screen legibility scales as √(sin²α + cos²α·sin²23.5°) where α is the rod's azimuth relative to the camera at the moment the platform stops:

- α ≈ 90° → each mass travels the full 1.08 world units (Δr 0.60 m × `RBR_WORLD_PER_M` 1.8);
- α ≈ 0° → 0.399 × that, mostly *toward* the camera — a 2.5× legibility swing on the only mover in the primary-aha state.

And α is **uncontrolled**: θ at the stop is 1.50 × 4.5 + ½ × 1.50 × 2.295 = **8.471 rad** = 125.3° mod 2π, which happens to land ≈80° off the camera azimuth (π/4) — near the best case, by luck. It moves **0.75 rad ≈ 43° for every 0.5 s** physics_author shifts the brake window when it recomputes from real word counts (§3 instructs exactly that).

The lever exists and the walk says it does not:

```
// walk, "Deliberately NOT consumed": theta0_rad ... DECLARED-INERT (:950–956) ✓
// engine reality:
:50499   theta0: rbrNum(rb.theta0_rad, 0),
:50557   rbrThetaReset();            // called at every state apply
:49970   eng._thN = 0; eng._th = eng.theta0;
:49965   return eng._th + rbrOmegaAt(...) * rem;
```

`theta0_rad` is fully implemented. The renderer's own type-declaration comment (`:953`, "DECLARED, NOT IMPLEMENTED") is stale, and the skeleton inherited it — the exact mirror of the A3 trap (there, a token that looked live and was not; here, a field that looks inert and is). Fix: correct the walk row (cite the reader, not the declaration comment), tag S3's slide `[POSE-OBLIQUE]`, and instruct json_author/physics_author to solve `theta0_rad` so the rod sits across the view at the stop instant, **re-solved whenever the brake window moves**.

### P3

**B4 · S2's sentence plan (48 words) and its control-table budget (40–55) disagree about what binds.** `[owner: alex:architect]`
S1/S3 sum to exactly 55 and S4 to exactly 50 — their plans and budgets agree. S2's four sentences total 48, so at the stated 40–55 a compliant physics_author could write 55 words (21.2 s), leaving R = 22 s a 0.8 s tail against §3's own "held tail ≥ 1.5 s" rule and putting narration end *after* the last motion. §3 calls the sentence plan "the binding worst-case envelope"; say so in the Words column too (or raise S2's plan to 55).

**B5 · A9's written ruling stands on its first reason only — say that, because Checkpoint C reads it.** `[owner: alex:architect]`
Reason (1) is correct and sufficient: S3a's payload ("stopped: ω = 0 so L = 0") is arithmetic on the already-taught relation and fails the distinct-IDEA test. That is the right test and I accept the rejection on it. Reason (2) — that a split "strands the A2 baseline chip across a state boundary" — is **not** an obstacle: `reference_marks` are per-state, so a "before: 4.59" chip is simply authored *in S3b*, where it also cannot spuriously latch (L runs 0 → 0.99 and is never 4.59; predicate `:50275`). Reason (3) — "the re-timed envelope carries the load without compression" — is contradicted by B1: it carries it with a 6-second hole. Keep the ruling, drop reasons (2) and (3), or the Checkpoint-C diff records a defence that does not hold.

---

## 4 · THE FIVE THINGS THE DISPATCH ASKED ME TO RULE ON

**4.1 · A9 (the S3 split) — the rejection is upheld.** See B5. One beat, kept, on the information-gain argument alone. State count stays 5; that was the right call and it was checked in writing rather than silently declined, which is what I asked for.

**4.2 · Ruling 1 (camera / F-C4) — implemented soundly; the asymmetry argument holds, with one correction and one omission.**
The pose is authored verbatim from `:50475–50477` (`radius 9.6`, `theta π/4`, `phi 1.16`), the F-C4 filing matches `findings_c.md` PASS 4 field-for-field, and D4's "authorable today, NOT blocked; inherit-with-recorded-risk if the row is declined" is exactly the honest position (and matches PASS 4's own "angular_momentum survives on the existing oblique pose").

*The asymmetric-pair argument is valid.* At 23.5° elevation the axial arrow projects at cos 23.5° = **0.917** of its length — near-ideal — while a horizontal circle renders at aspect **0.399**. Two constraints from opposite directions bracket the elevation, and the pose sits near the arrow end of the bracket, which is correct for *this* concept: it never asserts a circle anywhere (unlike #3, whose narration says "circle" against a 0.40 ellipse). One correction: the skeleton calls the second constraint a "spin-circle read", which overstates it — `rbr_drum_marker` is a radial `BoxGeometry` bar on the drum's top face (`:50322–50326`), so what it needs is *not* circularity but a legible sweep, which it has at 0.40 aspect with the rod and masses reinforcing it. Calling it a pose *tolerance* rather than a dependence is right; the reasoning for it should cite the marker's actual geometry.

*The omission is S3's mass slide* — B3. Everything else checks: S1 arrow, S2 arrow shrink, S4 flip + curl plane, S5 arrow-as-only-live-channel are the correct four, and S4 is correctly called the most pose-dependent.

**4.3 · Ruling 2 (prerequisites) — implemented correctly, and the Block 1 patch is sound.**
§8 names all four, states the ruling with its date, records the reasoning ("what the array records is whether the dependency is TRUE, not whether the word is printed") and explicitly supersedes REV 1's rendered-string test. It keeps the json_author no-silent-drop instruction, keeps the p = mv exclusion and sharpens it to registered-ids-only, and it now carries the fallback I asked for at cycle 0 — Rule 23 advisory + no referential check in the validator, so naming registered-but-unauthored ids is legal. I confirmed the validator side: `prerequisite` appears nowhere in `src/schemas/conceptJson.ts`.

The forced Block 1 edit is sound. "Breaks NOWHERE in rendered content, by design — 'a brake slows the spin' IS the patch, already in place" is honest and consistent with Block 1's own misconception note (c) ("S2 must never … name torque"). The distinction it draws — a *conceptual* dependency that is not a *vocabulary* cliff — is the right shape for a cliff analysis and does not contradict §8's "a student's full grasp of WHY the brake beats change L is torque's material".

**4.4 · Scar #62 re-ruled in place — correct, and correctly handled for Checkpoint C.**
A scar disposition is a live judgment, not a historical record; leaving "no per-state camera needed" standing after a founder ruling to the contrary would be the actual defect. What Checkpoint C needs is traceability, and it has it three ways: D5 names the edit, its location and its reason; the disposition text itself carries the `**re-ruled (Ruling 1 / F-C4)**` marker with what REV 2 said and why it was wrong; and the NOT-changed paragraph enumerates the boundary. #13 is handled the same way. No different handling needed. The only thing I would add is a one-line pointer at the top of the SCAR AUDIT saying which rows carry a `re-ruled` marker (currently #2, #13, #25, #62, #129, #139, #141 across two revisions) so the C diff does not have to scan 157 rows.

**4.5 · The bug-queue discrepancy — handled honestly; no dispositional impact; corroborated from this desk.**
The disclosure is the right shape: the delta is named, the missing row is identified (#33), its REV 2 disposition is retained as history, the union count is corrected 157 → 156, the absence of a status filter is stated, and the 522s are declared with "every count above is from a verified non-failed run".

Impact is zero under **both** hypotheses. #33 (`engine_stash_on_shared_renderer_reverts_concurrent_session_uncommitted_work`) was dispositioned "N/A here: this desk is read-only on the renderer; binds Desk E" — true whether the concept tag was dropped or the row was deleted. And the architect's own data bounds the risk: the other four queries returned **identical** counts (63/83/85/0), which is strong evidence nothing else moved at the live table.

I attempted independent verification and **could not reach Supabase** — four consecutive Cloudflare 522s on `query_engine_bug_queue.ts rigid_body_rotation` this session. So the flakiness claim is corroborated, and the discrepancy is not resolvable from this desk. Right call: flag it to the founder at Checkpoint C as an ops item (a row that changed under an active audit), not a design one. It changes no verdict here.

---

## 5 · ENGINE QUEUE

Nothing here blocks this concept. F-C1 / F-C2ext / F-C3 / F-C4 are already filed and correctly reflected in the design; one new row:

| ID | Finding | Owner | Tag |
|---|---|---|---|
| **F-C5 (new)** | **`applyRigidBodyRotationGlow` has no `glowTargets` fallback, so per-sentence narration `glow` is inert in every rbr state.** `:50772` reads `(eng && eng.glow_focal) \|\| rb.glow_focal \|\| ""` — the force_rig sibling at `:49002` reads `… \|\| (glowTargets.length ? glowTargets[0] : "")` and sets `glowActive = !!focal \|\| glowTargets.length > 0` at `:49003`. Consequence: an authored `tts_sentences[].glow` does nothing on rbr, so the scenario's only emphasis channel is the state focal + `phases[]`, and EXEMPLAR_RUBRIC D3 (narration→canvas binding — measured 52/52 on the exemplars) is unreachable by the normal channel across the whole chapter. Fix shape: parity with force_rig (`glowTargets[0]` fallback, `glowActive` widened), leaving an explicit `glow_focal`/phase focal short-circuiting as it does today so #10's approved states are byte-identical. Probe: in an rbr state with no `glow_focal` and a sentence glow naming `rbr_l_arrow`, assert the arrow's material opacity is 1.0 and a peer overlay's is 0.4. | `peter_parker:field3d_surgeon` | **ride-along** (affects #3, #4, #9, #10 and every future rbr concept; no concept is blocked, since `phases[]` is a working substitute) |

---

## 6 · CANDIDATE SCAR ROWS

Checked against `founder_proxy_A.md` §6 and `docs/loop_runs/rotmech/_engine/findings_c.md` — no `bug_class` collision. Live-enum values only.

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause,
  prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type) VALUES
('retimed_narration_leaves_the_choreography_windows_on_the_old_clock',
 'A word-budget re-timing stretches the narration but not the movers, opening a static hole mid-state',
 'CRITICAL','alex:architect',
 'angular_momentum REV 2 re-derived every at_ms from the 2.6 words/s conversion but kept each mover gated on the sentence that names it, so the movers stayed short while the state tripled in length: S3 ran its last motion (param_ramp) to 11000 ms and its restart at 17500 ms, leaving 6.0 s in which omega = L/I = 0, theta does not advance, no readout changes and no mark reveals. S2 put its only taught motion (a 3.4 s decay) in the last 15% of a 22 s state behind 13.9 s of the previous state final frame.',
 'When a state duration is re-derived from the word budget, RE-SPREAD the movers over the new clock in the same pass: no guided state may hold a fully static canvas longer than ~2 s, and the physical beat must span the narration rather than follow it. The reveal-after-its-sentence rule governs PRINTED symbols and values (readouts, chips, formula surfaces), never the motion of a physical object - Rule 32a requires only cause-before-effect. Consider trimming toward the middle of the word band instead of the top before stretching the state.',
 'js_eval',
 'For each guided state build the sorted list of change instants (mover start/end, ramp window, restart, reveal at_ms); assert no consecutive gap exceeds 2000 ms and that the last mover ends at or after the narration end.',
 'OPEN', ARRAY['angular_momentum']::text[], ARRAY[]::text[],
 'rotmech desk C Checkpoint A cycle 2 2026-08-04', 'incident'),

('static_state_focal_dims_the_overlay_the_state_exists_to_introduce',
 'One glow_focal held for a whole multi-sentence state dims the very overlay the state debuts',
 'MAJOR','alex:architect',
 'applyGlowEmphasis dims every non-focal, non-solid element to GLOW_DIM_OPACITY 0.4 (field_3d_renderer.ts:3397-3398); rbr_l_arrow is excluded from the solid carve-out (:50782-50788), so a state whose focal is another element renders the L arrow at 40% for its whole duration. angular_momentum S1 (focal rbr_drum_marker) does this to the axial L arrow in the state that introduces it, and S2 (focal rbr_brake_pad) does it to the arrow whose LENGTH is the state tracking channel. Aggravated because applyRigidBodyRotationGlow has no glowTargets fallback (:50772 vs force_rig :49002), so per-sentence narration glow is inert and phases[] is the only channel.',
 'A glow_focal is a per-INSTANT decision, not a per-state one. Any guided state longer than ~2 narration sentences authors phases[] so the focal follows the narration; the sentence that introduces an overlay must have that overlay as the focal at that instant, never as a dimmed peer.',
 'js_eval',
 'For each state with a static glow_focal and duration > 12000 ms, list the visible non-solid overlays; assert none is named by the state narration plan as its taught channel while a different element holds the focal.',
 'OPEN', ARRAY['angular_momentum']::text[], ARRAY[]::text[],
 'rotmech desk C Checkpoint A cycle 2 2026-08-04', 'incident'),

('walk_labels_a_field_inert_from_its_declaration_comment_while_the_reader_implements_it',
 'The engine-reality walk inherits a DECLARED-NOT-IMPLEMENTED comment the implementation contradicts',
 'MAJOR','alex:architect',
 'field_3d_renderer.ts:953 lists theta0_rad under "DECLARED, NOT IMPLEMENTED", but the scenario reads it at :50499, seeds it through rbrThetaReset at :50557 and returns it from rbrThetaAt at :49958/:49965 - it fully controls the apparatus start angle. The angular_momentum walk copied the comment and so never considered the only lever that controls the rod azimuth at S3 stop instant, on which the legibility of the primary-aha mass slide depends (0.399x screen travel at the worst azimuth, and the azimuth moves 0.75 rad per 0.5 s of timing change).',
 'The engine-reality walk verifies against the READER, in both directions: a field claimed IMPLEMENTED needs its reader line, and a field claimed INERT needs proof that no reader consumes it. A type-declaration comment is documentation, not evidence - grep the symbol before copying its label.',
 'js_eval',
 'For every field the walk marks DECLARED-INERT, grep the renderer for the property name; assert zero reads outside the type declaration block.',
 'OPEN', ARRAY['angular_momentum']::text[], ARRAY[]::text[],
 'rotmech desk C Checkpoint A cycle 2 2026-08-04', 'incident'),

('scenario_glow_pass_has_no_glowtargets_fallback_so_narration_glow_is_inert',
 'A field_3d scenario glow pass reads only the state focal, silently voiding every per-sentence glow',
 'MAJOR','peter_parker:field3d_surgeon',
 'applyRigidBodyRotationGlow computes focal as (eng.glow_focal || rb.glow_focal || "") at field_3d_renderer.ts:50772 with no glowTargets fallback, while the force_rig sibling at :49002-49003 falls back to glowTargets[0] and widens glowActive. Every tts_sentences[].glow authored on an rbr concept is therefore a silent no-op, and the exemplar-measured narration-to-canvas binding (52/52 sentences) is unreachable through the normal channel for the whole Ch.7 rotmech family.',
 'Every new scenario glow pass implements the generic glowTargets fallback and widens glowActive accordingly, so a per-sentence glow works without per-scenario authoring. An explicit state focal or phase focal must still short-circuit it, so existing concepts render byte-identically.',
 'js_eval',
 'In an rbr state with no glow_focal and a sentence glow naming rbr_l_arrow, assert that element material opacity is 1.0 and a peer overlay opacity is 0.4.',
 'OPEN', ARRAY['angular_momentum','conservation_of_angular_momentum','rigid_body_rotation','rotational_kinematics']::text[],
 ARRAY[]::text[], 'rotmech desk C Checkpoint A cycle 2 2026-08-04', 'incident');
```

---

## 7 · KEY LOCATIONS (no frames exist at Checkpoint A — the five places to look)

1. `C:\Tutor\physics-mind-rotmech-c\docs\loop_runs\rotmech\angular_momentum\skeleton_rev3.md` §3, S3 row — read the event instants in order and B1's 6-second hole is visible on one line.
2. `C:\Tutor\physics-mind-rotmech-c\src\lib\renderers\field_3d_renderer.ts:3384–3405` + `:50782–50789` — `applyGlowEmphasis` and the solid carve-out; B2 in two screens (`rbr_l_arrow` is absent from the list).
3. `…\field_3d_renderer.ts:50499` + `:50557` + `:49958–49970` — `theta0_rad` read, seeded and returned; B3's mislabel, refuted in three lines.
4. `…\field_3d_renderer.ts:50772` vs `:49002–49003` — the rbr glow pass beside its force_rig sibling; F-C5 in a two-line diff.
5. `C:\Tutor\physics-mind-rotmech-c\src\lib\validators\visual\deriveStateMeta.ts:3134–3213` — the real rbr pin derivation; confirms A6 is now exact (S1 22700 / S2 20400 / S3 19500 / S4 13000) and that B1's ramp widening moves no pin.

---

## 8 · RUBRIC (advisory, unratified — `docs/EXEMPLAR_RUBRIC.md`; did not affect the verdict)

Checkpoint A scores the five answerable from a skeleton. §3's thresholds are explicitly unratified and are neither quoted nor applied; the number carries no authority and blocked nothing. The verdict is `DESIGN_FIX` on **B1** alone and would be identical with this section deleted.

```
D1 1 · D2 1 · D8 2 · D9 2 · D10 1   = 7/10   (A-subset: D1, D2, D8, D9, D10)

weakest: D1 information gain — no state is derivable from its predecessor, but S2
         stays thin: its payload L = 1.53 at ω = 0.50 is arithmetic on S1's own
         printed numbers (I = 3.06, ω = 1.50, L = 4.59). It earns its place on the
         wrong-belief setup Block 2 describes, not on new information. Unchanged
         by this revision.

         D10 explore earns its place — honesty improved (the blank-during-drag is
         now stated, the band narrowed so the arrow never saturates), but the
         teacher experience did not: all three readouts still render "—" for the
         whole drag (rbrBlanked :49899, re-armed per input :50074) and `m` moves
         nothing on the drawn machine (RBR_MASS_R constant, :49798). F-C3 would
         move this to 2.

         (D2 ties at 1: the arc order IS the equation being built, but the aha
         lands at S3 of 5 — the 60% mark — where the measured exemplars land
         theirs at 33–50%. D9 rose to 2 on A13's retitle: all five titles state a
         result in Rule 41 plain English with the meaning in the first words.)

not scored at A: D7 motion completeness. Finding B1 is that dimension's 0-anchor
         ("dead zone over most of the state") arriving early — it is raised as a
         normal P1 finding on its own evidence, not on this sheet.
```

---

*Handoff: `DESIGN_FIX`, fix cycle 2 of 2 — the last before ESCALATE. B1–B5 route to `alex:architect`. On the resubmission I will re-check only: (i) S3's and S2's event spread against the ≤2 s static rule and the pin table (which should not move); (ii) S1's and S2's `phases[]` blocks against `:50647–50657` and the focal-at-introduction instant; (iii) the corrected `theta0_rad` walk row plus the S3 slide tag and its azimuth instruction; (iv) B4's binding-budget wording and B5's trimmed A9 ruling. Everything else in REV 3 is verified and closed — A1–A13, both founder rulings, the scar re-rulings, and the bug-queue disclosure. F-C5 → `docs/loop_runs/rotmech/_engine/findings_c.md` for Desk E, ride-along, blocking nothing. The `#9-S4 / #10-S6` duplication and the Rule-38g tag-verification pattern remain chapter-level founder items for Checkpoint C, unchanged.*
