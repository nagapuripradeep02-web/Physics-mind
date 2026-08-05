# Skeleton — `conservation_of_angular_momentum` (rotmech · Class 11 Ch.7 · 0b spec driver for build 0c-1) — REV 3

> **Status:** Phase-0b deepest-concept design (AUTHORING_PIPELINE.md §0). This skeleton + the physics block ARE the real spec for the NEW field_3d `scenario_type` (working name `rigid_body_rotation`). Rule 12 does not apply — the scenario does not exist yet. Literal config/key names below are guesses; the field3d-surgeon dispatch report's closed enums supersede them. Physics, geometry, and what-must-be-visible are exact.
> **Renderer-readiness declaration (scar `archetype_live_tier_unverified_against_renderer`):** because the scenario does not exist, **every motion specified here is `[NEEDS-SCENARIO]`** — no archetype is claimed `[LIVE]`. The verification obligation transfers to the 0c-1 build and its bring-up probes. The grip-rule hand reference is visual-vocabulary precedent only, not a reuse claim.
> **Bug-queue consultation (2026-08-02, REV 3, LIVE table via Bash):** queries re-run this session — see SCAR AUDIT §"Queries run". Every row re-audited against the REV 3 text; the six REV-2 dispositions founder-proxy showed failing are re-dispositioned there.
> **DC Pandey check:** chapter table of contents only. No teaching method, example problem, or figure imported.
> **Namespace check:** `conservation_of_angular_momentum` appears in neither `src/data/concepts/` nor `chemistry/` — no collision.
> **Revision history:** REV 2 preserved at `skeleton_rev2.md`. Checkpoint A report: `founder_proxy_A.md`. This is fix cycle 1 of 2.

---

## 1. Atomic claim

This concept teaches ONE thing: **when the net external torque on a system is zero, its angular momentum L = Iω stays constant — so if the mass distribution changes and I falls, ω must rise (and kinetic energy is NOT conserved while this happens)**. It does not cover what angular momentum is or its formula (`angular_momentum`), how I is computed (`moment_of_inertia`), or how a nonzero torque produces α (`tau_eq_i_alpha`). Kepler's 2nd law is deferred to Gravitation.

## 2. State count + arc — 8 states (7 guided + 1 explore)

Complexity call: **complex (7–9 band)**. The concept needs the conservation event (a qualitative aha + a quantitative check), its energy consequence, its boundary condition (τ_ext ≠ 0 — **now core, F-9**), its vector nature, and the advanced derivation.

The apparatus is ONE machine throughout (Rule 32d): a **turntable on a vertical axle carrying a horizontal rod with two equal masses that slide symmetrically**. The turntable is ALWAYS spinning from S1 onward. States **re-initialise their authored entry configuration on entry** (F-6 semantics). HUD (value-only): `I`, `ω`, `L`, plus `KE` from S4.

**Apparatus geometry (F-7b — fully specified):** turntable disc radius **R_table = R_rim = 1.2 m** (the brake acts at this rim); rod half-length **1.0 m**; sliding-mass clamp **r ∈ [0.15, 0.90] m** (F-12c — widened; every taught pose sits STRICTLY INSIDE it: home r = 0.80 < 0.90, pulled-in r = 0.20 > 0.15). The rim (1.2 m) lies beyond the rod tip (1.0 m), so the pad never fouls the masses. Where both r and R_rim are on screen (S5, S8-with-brake) they are drawn as **two distinct, separately-labelled reference lines** (scar `teach_distinct_reference_lines_for_two_radii` — now BINDING).

**Authored numeric ground truth (F-8 — ω₀ = 1.5 rad/s so no two displayed quantities collide):** each sliding mass **m = 2.0 kg**; frame inertia **I_frame = 0.50 kg·m²**. Then I(0.80) = 0.50 + 2·2.0·0.80² = **3.06 kg·m²**; with **ω₀ = 1.50 rad/s**, **L = 4.59 kg·m²/s**; I(0.20) = **0.66 kg·m²** → ω = **6.95 rad/s**; **KE₁ = 3.44 J**; **KE₂ = L²/2I₂ = 15.96 J**; ratio = I₁/I₂ = **4.64**. Top spin = **1.11 rev/s** (readable from the back of a room). KE₁ (3.44) ≠ L (4.59) — no numeric collision anywhere on the HUD. **HUD decimal places: exactly 2 everywhere**, and narration uses the SAME 2-dp figures — one rounding convention (the REV-2 9.3-vs-9.27 inconsistency retires with the old numbers).

| State | Title (Rule 41 — literal, first words carry meaning) | Purpose | teaching_method | Ring |
|---|---|---|---|---|
| S1 | Steady spin, constant L | Baseline: no external torque → I, ω, L steady; L readout established; the LAW stated in words | *(straightforward beat)* | core (qualitative) |
| S2 | Masses pulled in — spin speeds up | THE PRIMARY AHA: I drops, ω rises, L pinned; the inward pull arrows are ON SCREEN (F-4) | *(straightforward beat)* | core (qualitative) |
| S3 | The equation predicts the new speed | **Quantitative beat (F-5):** I₁ω₁ = I₂ω₂ predicts 1.50 rad/s BEFORE the push-out; the live readout lands on the prediction | *(straightforward beat)* | core (quantitative) |
| S4 | Kinetic energy is not conserved | KE rises during pull-in and the gap HOLDS open (F-1); the visible pull does the work (F-4) | `misconception_confrontation` | core (quantitative) |
| S5 | External torque changes L | **Promoted to core (F-9):** a brake pad touches the rim → L visibly decays; conservation needs τ_ext = 0 | *(straightforward beat)* | core (condition) |
| S6 | L is a vector along the axis | Grip rule; a RESTARTED run with opposite spin (F-2) → L points the other way | *(straightforward beat)* | extended |
| S7 | Why L stays constant | τ_ext = dL/dt, so τ_ext = 0 ⇒ L constant (title per F-12a) | `derivation_first_principles` | advanced |
| S8 | Try it yourself | Sandbox | `exploration_sliders` | *(explore — ring-gated controls)* |

**Rule 38a — BOTH clauses addressed (the ordering clause was unaddressed in REV 2, F-5):** the ladder reads **qualitative (S1–S2) → quantitative (S3–S4) → condition (S5, core) → extended (S6) → derivation (S7)** — monotone rings core (S1–S5) → extended (S6) → advanced (S7), advanced a contiguous block immediately before explore ✓. `advance_mode`: S1–S7 `manual_click`, S8 `interaction_complete` ✓.

## 3. Per-state choreography + control plan (Rule 31 control table)

**Coined archetypes (three, each justified once):**
- `radial-slide` — mass elements translate radially WITHIN the rotating body, changing its shape while it spins. Declared by S2/S3 as a contrast pair.
- `diverge-from-mark` (NEW, replaces S4's `cycle-compare` per F-1) — a live readout departs from a static reference mark and HOLDS the gap. The distinct picture is the opening gap itself.
- `equation-build` (S7, per F-11) — the equation assembles term-by-term on the single formula surface, synced to narration.

**Vehicle-vs-archetype note (honest):** the radial slide is the apparatus's ONLY way to change I, so it also appears as the *vehicle* inside S4 and S7. Each state's DECLARED archetype names its distinct new on-screen picture (S4: the bar-vs-tick gap opening and holding; S7: the equation assembling beside a dL/dt readout pinned at 0.00 while I and ω sweep). Declared-archetype repeats: none except the S2/S3 pair.

**Archetype-discharge rule:** every archetype is discharged by motion the AUTHORED beat produces with NO teacher input, between t=0 and loop reset. The S6 toggle and S5 slider are Rule-31 contextual controls layered ON TOP of an authored beat.

| State | Teaches (one idea) | Archetype | Authored beat (no teacher input; cause → effect) | Delta cue | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|
| S1 | With no external torque, L = Iω does not change | `reveal-build` | Turntable spins steadily at ω₀ = 1.50, masses at r = 0.80; the L arrow draws in along the axle (**MAGNITUDE indicator here**, length ∝ \|L\| — direction semantics taught only in S6, keeping the extended cut coherent), then I / ω / L readouts build one by one, **each only AFTER the narration sentence defining it** (ledger §10b). Narration states the law with the plain physics word (F-12b): "with no external torque, L = Iω stays the same" — never "outside twist" | **"No torque: L constant"** | none | 30–45 | core |
| S2 | Pull the masses in → I falls → ω must rise | `radial-slide` | CAUSE first — **a radial force arrow appears on each mass pointing along −r̂ toward the axis (F-4)**, and the masses slide inward under them (r: 0.80 → 0.20 over ~2 s). After a ~0.7 s beat the EFFECT follows: spin visibly speeds up (1.50 → 6.95), ω climbs, I falls, **L sits at 4.59 with a hold-glow**. One full slow revolution before (4.19 s), several fast after. Anchor here: ~8 words — "like a person on a rotating stool pulling their arms in" | **"Masses in: spin faster"** | none | 35–55 | core |
| S3 | The trade is EXACT: I₁ω₁ = I₂ω₂ predicts the new speed before it happens (F-5) | `radial-slide` (declared contrast pair of S2 — delta names the flip AND the payload) | Opens at S2's end configuration (r = 0.20, ω = 6.95 — continuity). The formula surface shows **I₁ω₁ = I₂ω₂** (symbolic; one clause defines the subscripts); the PREDICTION lands as a **reference mark at 1.50 on the ω readout** (F1 `reference_marks`). THEN the masses slide OUT (0.20 → 0.80), spin slows, and **the live ω readout lands exactly on the predicted tick**. L never moves. Ends at the global home pose. Secondary anchor (~10 words): "like a diver stretching out to slow the somersault before the water" | **"Equation predicts the slow-down"** | none | 35–55 | core |
| S4 | L is conserved but kinetic energy is NOT | `diverge-from-mark` (renamed per F-1) | SEQUENTIAL contrast: the thin static tick appears FIRST at KE = 3.44 J, labelled "if energy stayed constant", on its own beat with nothing else changing. THEN the pull-in runs ONCE — the −r̂ arrows appear (F-4), masses slide in, the KE bar climbs past the tick to 15.96 J while L stays flat — **and HOLDS there with the gap open for the rest of the loop (F-1: no push-out; the beat never undoes its own claim)**. The gap IS the work done by the visible pull (W = ΔKE; nothing off-screen is credited). Bar scale 1.1× the 15.96 J peak | **"Kinetic energy goes up"** | none | 40–55 | core |
| S5 | Conservation holds ONLY while τ_ext = 0 (promoted to core, F-9) | `translate-through` | Authored beat: brake pad translates in, touches the RIM at 1.2 m (cause) — **the rim radius is drawn as its own labelled reference line, visually distinct from the r line**; after a readable beat ω AND L decay together (effect); the hold-glow breaks. On the authored cue the brake releases → decay stops, L holds at its new lower value. **Brake contract:** frictional — opposes ω, rest-clamps at ω = 0, NEVER reverses spin (seized-slider 20 s probe: ω monotone-decaying to ≥0). L(t) closed-form piecewise in state-local t, so time-pin rewinds replay it exactly | **"External torque changes L"** | brake-torque slider *(min_ring: core)* | 30–50 | core |
| S6 | L is a vector along the rotation axis | `cycle-compare` (freed by F-1's rename) | Camera reframes to see the axle side-on. Authored loop, **two RUNS, never a continuous reversal (F-2)**: run A — spin at +ω₀, hand curls with it, L arrow up (~4 s). Then a HARD CUT restart cue ("run it again the other way" — a brief re-pin flash marks the fresh run): run B launches at **−ω₀** — hand curls the other way, arrow down (~6 s), loop repeats. **L never crosses zero on screen** — between runs the readouts re-pin discontinuously (ω = −1.50, L = −4.59), clearly a restart, not an uncaused torque. The toggle drives the SAME restart mechanism live | **"L points along axis"** | spin-direction toggle (= restart) *(min_ring: extended)* | 30–45 | extended |
| S7 | τ_ext = dL/dt ⇒ τ_ext = 0 ⇒ L constant | `equation-build` (renamed per F-11) | The equation builds term by term, synced to narration; alongside it a slow authored replay of S2's pull-in with a **dL/dt readout showing 0.00**. **Honest framing (F-3/F-11):** dL/dt = per-step (L_k − L_{k−1})/h of the engine's own L state — under the single L-integrator this equals τ_ext by construction, so it is presented as an ILLUSTRATION of the law the engine integrates, never sold as an independent measurement. Calculus notation allowed here only | **"Torque equals dL/dt"** | none | 35–55 | advanced |
| S8 | Sandbox | `drag-sandbox` | Free-running (Rule 37). **Control semantics (F-6, an engine contract stated so the surgeon never invents it):** `r` is the ONLY live-drag control preserving L; **`m` and `ω₀` RE-INITIALISE the state** — L re-pins from the new I·ω₀ with a brief re-pin cue (L visibly jumps AT the flash, attributed to the restart, never silently); the **direction control is a restart** (no easing through zero anywhere); the brake applies live τ_ext while held > 0 (**r-drag DURING braking is correct by construction** — F-3). **Idle auto-sweep:** until first trusted input, r oscillates 0.80 → 0.20 → 0.80 on the state clock, thumb + numeric label in lockstep | **"Try it yourself"** | ALL, ring-gated: r *(core)*, ω₀ *(core)*, m *(core)*, brake-torque *(core)*, spin-direction *(extended)* | 0 / open | *(explore)* |

**Archetype audit:** reveal-build (S1), radial-slide ×2 (S2/S3 declared pair), diverge-from-mark (S4), translate-through (S5), cycle-compare (S6), equation-build (S7), drag-sandbox (S8). No declared repeat outside the pair; no static state.

**Explore controls — ring-gated (scar `explore_controls_not_ring_gated_survive_the_ring_cut`; preserved from REV 2, min_rings updated for F-9):** *Hide advanced (drop S7):* S8 keeps r/ω₀/m/brake/spin-direction, each mapping to a surviving state ✓. *Hide advanced+extended (drop S6–S7):* S8 keeps r/ω₀/m/brake (core, taught by S1–S5); spin-direction is CUT with S6's ring ✓. S8's formula surface stays `L = Iω` (core) under every preset ✓.

**Readout metrics (F-3 — rewritten honestly):** `I` = I_frame + Σmᵢrᵢ(t)², recomputed every fixed step. **`L` = the engine's single integrated state** — `L += τ_ext·h` (rest-clamped), so dL/dt = τ_ext is the engine's law. `ω` = L/I(t), derived each step. `KE` = ½I(t)ω(t)². `dL/dt` (S7 only) = per-step finite difference of L. **Honest framing carried into narration:** the L readout displays the quantity the engine integrates; its flatness in torque-free states is the law being simulated, and is PRESENTED as such — never as an independent measurement that "happens to agree" (the REV-2 "capable of disagreeing" claim was a tautology under the mode-E2 definition and retires with the modes). What DOES independently confirm the physics on screen: S3's live ω readout landing on the pre-computed prediction tick, and S8's E-a probe.

**Rule 33 macro↔micro:** N/A-with-justification — the taught variable (I) IS the visible mechanism. Instruments (33d): value-only HUD, live 2-dp numbers.

**Rule 34 canvas budget:** top caption = the ≤5-word delta cue only; ONE formula surface per state (S1/S8 `L = Iω` · S2 `ω = L / I` · S3 `I₁ω₁ = I₂ω₂` · S4 `KE = ½Iω²` · S5 `τ_ext ≠ 0 ⇒ L changes` · S6 none · S7 `τ_ext = dL/dt`); all math real Unicode. All surfaces SYMBOLIC — numeric claims live only in the HUD and in reference marks the live readouts meet on screen.

**Pin-margin discipline (F-7a — per-state loop periods stated, not asserted):**

| State | End-config reached (design est.) | Loop period R (min) | Pin at 0.60R | Margin |
|---|---|---|---|---|
| S1 | instruments built ~4.0 s | ≥ 8 s | 4.8 s | ✓ |
| S2 | pre-roll revolution 4.19 s + 0.7 s + 2 s ramp = **6.89 s** | **≥ 12.6 s (author 13 s)** | 7.8 s | 0.9 s ✓ |
| S3 | prediction build ~3 s + 2 s slide = ~5.2 s | ≥ 10 s | 6.0 s | 0.8 s ✓ |
| S4 | tick ~2.5 s + 0.7 s + 2 s ramp = ~5.2 s; **end-config = the HELD-OPEN gap (F-1), so the pin photographs the claim by construction** | ≥ 10 s | 6.0 s | 0.8 s ✓ |
| S5 | engage 1.5 s + decay 2.5 s + release 1 s = ~5.0 s | ≥ 10 s | 6.0 s | 1.0 s ✓ |
| S6 | run A ~4 s → cut → run B; end-config = run-B-in-progress, arrow down | ≥ 10 s | 6.0 s | ~2 s into run B ✓ |
| S7 | equation complete + replay ~6.0 s | ≥ 11 s | 6.6 s | 0.6 s ✓ |

physics_author recomputes exactly at the engine's step size. THE EYE must read DENSE frames across the S2/S3/S4/S5 ramp windows, not only the frozen end-state.

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots)

| Wrong belief | At | `misconception_watch` beat |
|---|---|---|
| "A spin rate cannot change unless something pushes or a motor acts" | **S2** | belief: nothing external touched it, so ω must stay 1.50 · visual_counter: masses slide in under the visible −r̂ arrows and the spin speeds up 4.6× while L never moves · one_line_fix: no external torque fixes L, not ω — change I and ω must change with it (the inward pull points AT the axis, so it exerts no torque about it) |
| **"If angular momentum is conserved, energy is conserved too"** | **S4** | belief: KE should stay at 3.44 J · visual_counter: the static tick drawn FIRST, alone; then the KE bar climbs past it to 15.96 J while L stays flat, **and the gap stays open** — sequential, never undone (F-1) · one_line_fix: the visible inward pull does real work, and that work becomes extra kinetic energy; KE = L²/2I rises as I falls |
| "L is just a number" (RM-G6) | **S6** | belief: L has size but no direction · visual_counter: two restarted runs — spin one way, arrow up; the other way, arrow down (never easing through zero, F-2) · one_line_fix: L points along the rotation axis by the right-hand grip rule |

Named primitives for each wrong picture (scar `field3d_rule16a_belief_unbuildable…`): S2 needs the hold-glow (E8) + −r̂ arrows (**F5**); S4 needs the tick (**F1**) + arrows (**F5**); S6 needs the flippable hand + arrow (E5/E7 on a signable ω₀).

S1, S3, S5, S7, S8 carry NO misconception_watch. EPIC-C branches: **zero**.

## 5. `has_prebuilt_deep_dive` states (2)

**S2** (the primary aha; "why does it speed up" is the historic sticking point) and **S4** (energy bookkeeping, where exam mistakes concentrate). V1.0 ships zero authored deep-dives (Rule 18); the flag marks investment priority.

## 6. Drill-down clusters

**S2:** `why_omega_rises` · `L_vs_omega_confusion` · `internal_forces_no_torque` (**now with its picture: the rendered −r̂ arrows point straight at the axis, zero moment arm** — F-4).
**S4:** `ke_not_conserved` · `who_does_the_work` (the visible inward pull) · `ke_ratio_formula` (KE = L²/2I, KE₂/KE₁ = I₁/I₂).

## 7. `entry_state_map`

```
entry_state_map:
  foundational:  STATE_1 → STATE_5   # the trade, the energy story, AND the law's condition (F-9)
  vector_nature: STATE_6
  derivation:    STATE_7
```

Default `foundational`. PRIMARY aha (S2) inside the foundational range ✓. S4's energy beat and S5's boundary condition both land inside foundational, so the silent student meets the aha, the key misconception AND the law's condition on the default slice.

## 8. Prerequisites (advisory — Rule 23)

`angular_momentum` (#9) · `moment_of_inertia` (#6) · `tau_eq_i_alpha` (#7) · `rotational_work_energy` (#8). All in-chapter, NOT yet shipped; they precede this concept in the approved teaching order, so at 0d they will exist. No cross-chapter prerequisites.

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral)

**Primary: a person on a rotating stool, a mass in each hand, arms out — pulling them in makes them spin visibly faster.** Assigned to **S2**, ~8 words reserved. Placement pre-spoils nothing — it lands ON the aha it illustrates. The canonical demonstration, physically the EXACT system rendered, recognisable in any classroom in any country. **Secondary: a diver stretching out to slow the somersault before entering the water.** Assigned to **S3**, ~10 words — it fits the slow-down beat exactly. Both per the founder-approved survey table; the catalog's Bharatnatyam/Kathak/ISRO anchors are NOT imported. No region constants. The apparatus stays the abstract turntable (no human mesh — **the agent that does the work is nonetheless ON SCREEN as the rendered −r̂ arrows, F-4**).

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 8 of §2, exactly as tabled in §3.

**(b) Symbol-label table + term-introduction ledger:**

| Quantity | Label | DEFINED at | First PRINTED at | ✓ |
|---|---|---|---|---|
| Angular momentum | `L` (axle arrow + HUD `4.59 kg·m²/s`) | S1 sentence 1–2 | S1, after it | ✓ |
| Moment of inertia | `I` (HUD `3.06 kg·m²`) | S1, same sentence | S1 | ✓ |
| Angular speed | `ω` (HUD `1.50 rad/s`) | S1, same sentence | S1 | ✓ |
| Each sliding mass | `m` | S1 ("two equal masses, m each") | ~~S1 tag~~ → **NEVER PRINTED** (see ✎1) | ✓* |
| Mass radius | `r` (line from axle) | S2, first "radius" sentence | ~~S2~~ → **S1** (see ✎2) | ✓ |
| Inward pull force | −r̂ arrows (label "pull") | S2, the sentence naming the pull (F-4) | S2 | ✓ |
| Before/after subscripts | `I₁ω₁ = I₂ω₂` | S3, one clause | S3 | ✓ |
| Predicted speed mark | tick "predicted 1.50" | S3, the prediction sentence | S3 | ✓ |
| Kinetic energy | `KE` (HUD + bar with tick) | S4 opening | S4 — never earlier | ✓ |
| External torque | `τ_ext` (at the pad) | S5 | S5 | ✓ |
| Rim radius | `R_rim` reference line (distinct style + label from `r`) | S5, "at the rim" | S5 | ✓ (F-7b) |
| Rate of change of L | `dL/dt` | S7 | S7 only | ✓ |

> **✎ LEDGER CORRECTIONS — appended 2026-08-05 by `alex:json_author` after the built concept was
> measured against this table. The rows above are the APPROVED design; these are what the shipped
> JSON + renderer actually do.** Raised as LOW findings by `quality-auditor`'s re-audit; recorded
> here rather than silently rewritten, because Checkpoint A approved the original.
> **None of these changes what a student sees — nothing untaught reaches the screen. The ledger
> simply overstated, and a ledger that overstates cannot be used as evidence at Checkpoint C.**
>
> **✎1 — `m` is never printed anywhere.** The claim "first PRINTED at S1 tag" is false. The
> renderer's complete sprite-label set for this scenario is `L`, `r`, `pull`, `brake`, `R_drum`
> (all hardcoded in `field_3d_renderer.ts`), and `RBR_RO_META` implements exactly six HUD rows —
> `I · ω · L · KE · dL/dt · F` — with **no `m` row**. So `m` is DEFINED in S1's narration and never
> appears on canvas in any state. Harmless under Rule 25 (defining a symbol you never print is not
> "using an untaught term"), which is why the ✓ stands — but the "First PRINTED" cell was fiction.
> Marked ✓* to flag that the tick refers to the definition order only.
>
> **✎2 — `r` first prints at S1, not S2.** STATE_1 authors `show_r_line: true` and glows
> `rbr_r_line` over 1200–2000 ms; `STATE_1__frozen.png` shows the green `r` label at (730, 286).
> Pedagogically defensible — the radius line is visible while S1's narration is still on I and ω,
> and Rule 25's bar is "no untaught TERM", not "no unlabelled line". But the JSON and the ledger
> disagreed, and the JSON is the truth.
>
> **✎3 — the rim label is `R_drum` on screen, not `R_rim`** (row "Rim radius" above). The string is
> hardcoded at `field_3d_renderer.ts:50397` — `rbrMakeLabel("R_drum", …)` — and is visible on S5
> and S8. It is an ASCII code identifier reaching the canvas, so it violates Rule 34c (the
> `createLabelSprite` text path a DOM-only Unicode sweep skips) and Rule 41 (`R_drum` is not a word
> a student reads). **Not fixable on this desk** — it is renderer-side, filed as **A-10**, routed to
> `peter_parker:field3d_surgeon` as work-order unit **W-7**. Until it lands, this ledger row
> describes an intent, not the screen.

json_author note: every teacher_script glow target must name a primitive the state builds — glow-target set ⊆ built object ids.

**(c) Right-hand-rule plan:** S6 uses the **grip rule** — grip, not cross-product, because this teaches circulation→axis direction, not a single r × p (that belongs to #5/#9). One full curl per RUN, flipping between the two restarted runs (F-2).

**(d) Motion plan:** S1 spin + instrument build · S2 arrows → slide-in → spin-up (cause 0.7 s before effect) · S3 prediction tick → slide-out → ω meets the tick · S4 tick first, then arrows + pull-in, bar climbs and the gap HOLDS (F-1) · S5 pad translate-in + joint decay (rest-clamped) + release-and-hold · S6 run A → hard-cut restart → run B, arrow flipped (F-2) · S7 equation build + replay with dL/dt = 0.00 · S8 free-running sandbox with idle sweep. No passive state. **No claim without a rendered measurement:** every number stated is produced by the §3 metrics; every stated agent (the pull, the brake) is a rendered object.

**(e) Modes:** conceptual-only (Rule 20 [D]).

**(f)** `assessment` + `coverage_map` authored; `misconception_watch` exactly the 3 of §4.

**(g) Macro↔micro:** N/A-with-justification per §3.

**(h) Canvas budget:** per §3. New DOM panels at `top:52px+` BOTH edges.

**(i) Curriculum-flex (Rule 38):**
- **(i-1) Preset-cut coherence, re-run for the F-9 promotion:** *Hide advanced (drop S7):* S1–S6 + S8 coherent; S8's five controls all map to surviving states. *Hide advanced+extended (drop S6–S7):* S1–S5 + S8 — coherent; **the law's condition survives in S5 (F-9 — the smallest preset no longer teaches an unconditioned law)**; S1's axle arrow is a magnitude indicator only and no surviving state narrates its DIRECTION (direction semantics live entirely in S6); S8 keeps r/ω₀/m/brake, spin-direction cut with its ring.
- **(i-2)** Explore = core content only: `L = Iω` (stated by S1, surviving every preset) ✓.
- **(i-3) `curriculum_tags` (claims, not facts):** CBSE/NCERT covered, marked verified. JEE Main/Advanced core+extended+advanced · NEET core+extended · IB DP / A-level / AP Physics C — every cell `needs_teacher_verification: true`.
- **(i-4) Presets:** `full` = S1–S8 · `no_derivation` = hide S7 · `core_only` = hide S6–S7 (controls auto-cut by min_ring; **the smallest preset RETAINS the condition beat** — F-9).
- **(i-5) Graph axes:** no graph in any ring → N/A by design.

**Teacher-usability walk:** (1) *Does anything state the law and show it in the assessed representation?* Yes — S1 states it; S3 shows **I₁ω₁ = I₂ω₂** AND demonstrates it predictively (the readout lands on the pre-computed tick — the exam's use of the equation, performed on screen); S7 formalizes. (2) *First thing a teacher tries after the aha, demonstrable in range?* Drag the masses and watch L hold — S8's r slider over [0.15, 0.90]; and "what if something DOES touch it" — S5's brake, now core. (3) *Definition precedes use?* Yes — ledger §10(b).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `angular_momentum` → S1, patched by the one-breath restatement. `moment_of_inertia` → S2, patched by the `r` line shrinking WITH the I readout. `rotational_work_energy` → S4, one clause re-anchors KE = ½Iω². `tau_eq_i_alpha` → S5, one clause as the brake engages.

**JEE-backwards trace.** *"…I = 3.06 kg·m², ω = 1.5 rad/s; pulling in reduces I to 0.66. Find (i) the new ω, (ii) the KE ratio, (iii) where the extra energy came from."* (i) I₁ω₁ = I₂ω₂ used PREDICTIVELY → S1–S3 (S3 performs exactly this on screen). (ii) KE = L²/2I ⇒ ratio I₁/I₂ → S4 (3.44 → 15.96 J shown). (iii) work done by the pull → S4, with the pull RENDERED (F-4). Condition distractor ("platform has friction") → S5. Direction variant → S6. No missing piece.

**Misconception entry mapping.** All three confronted proactively per §4. Planting risk: S2's narration could plant "energy for free" if it says the spin-up "costs nothing" — physics_author says "no external torque" (torque-free ≠ effort-free; the pull arrows are right there doing work) and S4 detonates the residue two clicks later.

## Block 2 — Aha-moment designation

- **PRIMARY aha, at S2:** *pull your arms in and you spin faster all by yourself — because L = Iω cannot change when nothing outside twists you.*
- **SUPPORTING aha, at S4:** *the speed-up is not free — kinetic energy goes UP, paid for by the real work of the visible inward pull.* Total = 2.
- **Wrong-belief setup.** Primary: S1 builds "nothing external acts, so nothing about the spin will change" before S2 breaks the ω half while keeping the L half. Supporting: S2+S3 build "the trade is exact and reversible, so nothing is gained or lost" — S3's predictive exactness makes that belief MORE confident, and S4 then shows exactly what is NOT conserved inside the exact-looking trade.
- **Foundational coverage:** S2 ∈ foundational (S1–S5) ✓.

---

## ENGINE REQUIREMENTS (for `field3d-surgeon`, build 0c-1) — REVISED per Checkpoint A

All rows `[NEEDS-SCENARIO]`. **Changes vs REV 2: old E2+E3 replaced by the single angular-momentum integrator (F-3); old F3 (mode enum) DELETED; old F4 (eased reversal) DELETED — collapsed to a signable ω₀ (F-2); F2 re-contracted as one entry in a τ_ext source LIST with rim geometry; NEW F5 (radial force arrows, F-4); enum closure re-scoped to the 12-concept union (F-10).**

1. **E1 — Live-recomputed I** — `I(t) = I_frame + Σ mᵢ rᵢ(t)²`, rᵢ varying DURING rotation. Never an authored constant.
2. **E2 — THE single angular-momentum integrator (replaces REV 2's two-mode E2/E3):**
   ```
   L(t+h) = L(t) + τ_ext·h        (frictional sources rest-clamped at ω = 0)
   ω(t)   = L(t) / I(t)
   θ(t+h) = θ(t) + ω·h            (step-count-invariant form)
   ```
   No mode flag exists. τ_ext = 0 ⇒ L constant by construction, zero accumulation error; I constant ⇒ dω/dt = τ/I identically; **r dragged WHILE braking is automatically correct** (the α = (τ − ω·dI/dt)/I coupling emerges from the definition — the REV-2 `torque_driven` mode would have shipped wrong physics in S8). **ω₀ is signable** — this absorbs the deleted eased-reversal choreography (F-2): direction changes are RESTARTS; no easing-through-zero mechanism is built. Integrator discipline: θ update fold-exact; sub-step count from real dt; dt = 0 under a pin takes zero steps. **Bring-up probe:** drag `r` with `τ_brake > 0` for 20 s, assert ω(t) matches (L₀ + ∫τ)/I(t) to 1e-9; a dt-fold (h, h/2, h/4) reproduces **θ** as well as ω.
3. ~~**E3**~~ — **DELETED** (merged into E2; tombstone so REV-2 cross-references don't dangle).
4. **E4 — Radial mass translation choreography** — symmetric slide on an authored ramp (r: 0.80 ↔ 0.20 over ~2 s, clamp [0.15, 0.90]) while rotating; live-drivable by the S8 slider (trusted-drag seizes); S8 runs an idle auto-sweep until first trusted input, thumb + label in lockstep.
5. **E5 — L vector along the axis** — arrow on the axle, length ∝ |L|, sign follows ω's sign (S1 magnitude; S6 direction).
6. **E6 — KE_rot readout** — ½Iω² live; S4 bar scaled 1.1× the reachable peak (15.96 J → ~17.6 J full scale).
7. **E7 — Grip-rule hand tracking spin sign** — curl + thumb along axis, flips between runs of opposite ω₀.
8. **E8 — Value-only HUD instruments** I / ω / L / KE, 2-dp, live per §3 metrics + hold-glow on the pinned readout (brightness only, Rule 29) + a **re-pin cue** fired whenever a restart re-initialises L (S6 runs; S8 m/ω₀/direction — F-6). New top-anchored DOM panels at `top:52px+` BOTH edges. Per-state control rows hide with `visibility:hidden` + disabled input, never `display:none`; rows built only for tokens THIS concept names; thumbs re-synced on state entry.
9. **E9 — deriveStateMeta.ts co-edit in the SAME change, THREE sites:** `F3D_REVEAL_KEYS` · reveal-ms in `maxRevealForField3dState` · hold classification in `deriveHoldExpectations` — proven against BOTH config shapes. Continuous-spin states classified so the always-rotating home pose never reads as a frozen tail. Plus: no literal backticks in the renderer template body; apparatus not blanked by the generic `visible_elements` matcher; no per-state flag selects a build-time mesh branch.

**Finding rows:**

- **F1 — Generic `reference_marks[]` on any readout/bar** (value + label + own reveal cue). Consumed TWICE: S3's "predicted 1.50" tick on the ω readout, and S4's "if energy stayed constant" tick on the KE bar (sequential contrast: tick reveals FIRST, alone). Renderer verified absent at Checkpoint A. Reusable by #12's rolling race. Cost: small.
- **F2 — `τ_ext` as a SOURCE LIST, not brake-only:** `external_torque: { source: brake | applied_force_at_point | torsion_spring, … }`. This concept builds the **brake**: pad translates in, contacts the rim at **`rim_radius_m` = 1.2** (drawn as its own labelled reference line, distinct from the r line), applies an authored opposing τ, releases on cue, magnitude drivable by the S5/S8 slider. **Frictional contract:** opposes ω, rest-clamps at ω = 0, NEVER reverses spin at any reachable slider value (seize slider 20 s, ω monotone-decaying to ≥0, no rendered sign flip). **Time-pin contract:** S5's L(t) closed-form piecewise, replayed not latched. `applied_force_at_point` (#5, #7) and `torsion_spring` (τ = −κθ, #14) are DECLARED list members built under their own concepts' rows — declared now so the enum never reopens (the 0c-1 brief ships the implemented/deferred split explicitly). #13's flywheel reuses the brake. Cost: small.
- ~~**F3**~~ — **DELETED** (no mode to switch). Contract-shape check retained: every §3 state is expressible as ONE config object under the single-integrator + τ_ext-source shape.
- ~~**F4**~~ — **DELETED** (the eased spin-reversal is gone with F-2; direction changes are restarts on E2's signable ω₀; build no easing-through-zero choreography).
- **F5 — Radial force arrow attachable to any mass, along −r̂, with authored reveal cue (NEW — F-4).** Renders the agent doing the work in S2/S4; visually it is the survey's #5 "force applied at a point on the body" pointed at the axis — reuse that machinery, build once. Also the picture for `internal_forces_no_torque` (arrow through the axis ⇒ zero moment arm). Cost: one arrow.

**Enum-closure contract (F-10 — closes `closed_enum_cannot_name_a_substance_the_design_teaches` against the SERVED SET):** the 0c-1 brief must declare its config + control-token enums against the survey's **12-concept union**: `particle_mass[i]` / `particle_pos[i]` (#1, #2) · `body_shape` (#1, #3) · `axis_select` (#6) · `θ₀ / ω₀ (signed) / α-drive` (#4, #7) · `F_applied`, `F_point`, `F_angle` (#5, and F5 here) · `r` · `m` · `τ_brake` (#13) · `κ` (#14) · `fragment_trigger` (#2 advanced). Torque source enum = the F2 list. **This concept names five tokens (`r`, signed `ω₀`, `m`, `spin_sign`, `τ_brake`) — a subset check against the union, never the closure itself.** An enum closed against these five would force #4/#5/#6/#14 into post-0c renderer edits.

**Per-state × engine-row WALK (both directions; F5 claimed per F-4):**

| State | Consumes |
|---|---|
| S1 | E1, E2, E5 (magnitude), E8, E9 |
| S2 | E1, E2, E4, **F5**, E8, E9 |
| S3 | E1, E2, E4, **F1**, E8, E9 |
| S4 | E1, E2, E4 (pull-in, held), E6, **F1**, **F5**, E8, E9 |
| S5 | E1, E2 (τ_ext = brake), **F2** (incl. rim line), E8, E9 |
| S6 | E2 (signable ω₀, restart), E5, E7, E8 (re-pin cue), E9 |
| S7 | E1, E2, E4 (replay), E8 (dL/dt), E9 |
| S8 | E1, E2 (live brake + restart), E4 (slider + idle sweep), **F2**, E8, E9 |

Reverse: every live row E1, E2, E4–E9, F1, F2, F5 claimed by ≥1 state ✓; every state claims ≥1 row ✓; deleted rows E3/F3/F4 claimed by none ✓.

**Registration note:** json_author inserts the `concept_panel_config` row (default_panel_count=1) in the SAME session at 0d.

**Explicitly NOT required:** graphs/curve panels, energy bars beyond the KE readout+ticks, a human figure mesh, precession machinery, multi-body fragmentation (#2), the r × p construction (#5/#9), **any eased spin-reversal mechanism (deleted F4)**, **any integrator-mode enum (deleted F3)**.

---

## SCAR AUDIT

**Queries run (this session, REV 3 — stated per the `rolling_on_incline` lesson: a row not queried cannot be dispositioned):**

```
query_engine_bug_queue.ts --owner alex:architect                      → 32 rows
query_engine_bug_queue.ts --row-type directive                        → 47 rows
query_engine_bug_queue.ts --field3d --open                            → 30 rows
query_engine_bug_queue.ts newtons_laws_body                           → 0 rows (family rows surface via --owner/--field3d)
query_engine_bug_queue.ts conservation_of_angular_momentum            → 0 rows (concept not yet authored — expected)
query_engine_bug_queue.ts rigid_body_rotation                         → 0 rows (scenario not yet built — expected)
```

Counts match founder-proxy's own Checkpoint-A pull (32 / 47), so the audited universe is the same one the reviewer verified. **Not queried:** nothing beyond the six commands above; any row outside those result sets is NOT dispositioned here rather than silently "none skipped".

**The six dispositions founder-proxy showed failing — re-dispositioned:**

| Row | REV 2 said | REV 3 disposition |
|---|---|---|
| `nlb_loop_reset_clears_checkpoint_stamp…` | N/A (no checkpoints) | **BINDS via its transferable half** — **fixed by F-1**: S4's end-config is now the HELD-OPEN gap, so the pin photographs the claim by construction; every other state's end-config is likewise a held pose |
| `nlb_frozen_pin_lands_within_one_frame…` | "comfortably met" (asserted) | **fixed** — assertion replaced by per-state loop minima with the pre-roll INCLUDED (S2: 4.19 + 0.7 + 2 ⇒ R ≥ 12.6 s, authored 13 s; full table §3) |
| `nlb_static_state_authored_on_the_track_bound…` | fixed (poses ON the clamp) | **fixed** — clamp widened to [0.15, 0.90]; taught poses (0.20, 0.80) strictly INSIDE it |
| `derived_readout_asserted_by_value…` + `narration_attributes_an_effect_to_a_cause…` | fixed / satisfied (via "capable of disagreeing") | **fixed honestly** — the tautology retires WITH the mode enum (F-3); L readout = the engine's integrated state, framed as "the engine changes L only by τ_ext"; independent confirmation now comes from S3's prediction tick + the E-a probe. S4's "real work" cause is a RENDERED agent (F5) |
| `teach_distinct_reference_lines_for_two_radii` | N/A ("only one radius") | **BINDS** — the brake acts at the now-specified rim (1.2 m), a second radius; S5/S8 draw `r` and `R_rim` as two distinct labelled lines |
| `closed_enum_cannot_name_a_substance…` | fixed (five tokens) | **fixed at the right scope** — enums close against the survey's **12-concept union**; this concept's five tokens are a SUBSET check |

**Verified-honest dispositions carried unchanged:** `contrast_ghost_coresident…` · `nlb_multibody_lane_gap…` (N/A) · `nlb_checkpoint_s_m…` (N/A) · `teach_coordinate_sim_with_graph` (N/A) · `architect_declares_an_engine_limit…` (N/A; obligation to 0d) · `teach_inverted_scenario_inverts_cutline_flags` (N/A; noted for #7/#13/#14) · `chemistry_concept_id_collides…` (verified) · `explore_controls_not_ring_gated…` (min_rings updated for F-9, both cuts re-verified).

**Remaining rows re-audited against REV 3:** `archetype_live_tier_unverified…` (blanket [NEEDS-SCENARIO]) · `phase0_union_table_asserted_not_walked…` (walk re-run; F5 claimed — the REV-2 walk's failure to claim the force arrow is exactly what F-4 caught) · `nlb_motion_archetype_declared_from…` (discharge rule restated) · `symbol_printed_on_canvas_before…` (ledger extended: pull arrows, prediction tick, R_rim) · `teach_visual_must_match_narration` [OPEN] (re-audited claim-by-claim; per Checkpoint A this concept should be APPENDED to that row's `concepts_affected` rather than minting a duplicate) · `oncanvas_formula_asserts_a_value…` · `derivation_principle_applied_to_one_beat…` · `concept_taught_its_own_quantity…` (S3 shows AND uses the assessed form) · `lesson_never_states_the_principle…` · `field3d_rule16a_belief_unbuildable…` (named primitives F1, F5, E5/E7) · `real_world_anchor_declared…` · `nlb_frictionless_state_with_an_opposing_applied_force…` (F2 frictional + 20 s probe) · `explore_state_formula_surface_asserts…` [OPEN] · `teach_do_not_prespoil…` · `teach_concrete_before_abstract_compare` · `teach_field3d_explore_grab_and_move_field_point` [OPEN] · `state_added_at_review_outruns_the_config_contract_shape` · `directive_no_gate_asks_whether_a_teacher_could_use_it` · `teach_reveal_synced_to_narration` / `teach_show_quantity_live_when_named` · `teach_color_each_element_by_its_own_sign` (N/A) · `teach_read_dense_ramp_frames…` · `field3d_sliders_panel_top12…` [OPEN] · `derivestatemeta_new_scenario_key…` [OPEN] + `magnetic_flux_loop_scenario_new_build` + `field3d_generic_visible_elements_matcher…` [OPEN] + `field3d_build_once_body_reads_a_per_state_flag…` [OPEN] (folded into E9) · `field3d_per_state_slider_rows_collapsed…` [OPEN] (E8) · `spec_semi_implicit_euler…` [OPEN] + `explicit_linear_drag_is_unstable…` [OPEN] (E2; the brake is constant-magnitude frictional, not linear drag) · `hysteretic_state_cannot_be_latched_under_a_time_pin` (F2 replay) · `field3d_particle_field_vestigial_dual_panel_config_gap` [OPEN] (0d) · `ecp_glow_targets_missing_primitives` [OPEN] · `nlb_seized_slider_run_overruns_a_loop_sized_work_scale` · `deferred_enum_members_must_be_declared…` (F2 ships the split) · solenoid_* rows [OPEN] · `ghost_compare_cause_invisible_slider_frozen` / `…instant_snap` [OPEN] (S8 sweep moves thumb+label in lockstep; S6's between-run cut is a NARRATED RESTART with a re-pin cue — the honest form of a discontinuity, not a snap posing as physics) · `field3d_formula_overlay_generic_not_cambria_math` [OPEN] + layout/kerning/z-order rows + `eye_motion_map_reads_cached_physics_config…` [OPEN] + `CACHE_UPSERT_CONFLICT…` [OPEN] + `verification_via_applystate…` (engine/validator-side; bind the 0c-1/0d sessions) · `field3d_hanging_body_gravity_sign_inverted…` [OPEN] (its GENERAL prevention — execute every closed-form checksum numerically before closing a seam — adopted as the E-a probe discipline) · `field3d_newtons_laws_body_surface_slab…` [OPEN] (nlb-only) · `field3d_hard_threshold_label_decollision…` / `field3d_pinned_rewind_reproduces_the_instant…` (FIXED invariants; inherited).

---

## FIX-CYCLE-1 RESPONSE (F-1 … F-12 × what changed × where)

| Finding | What changed | Where |
|---|---|---|
| **F-1 (P1)** | S4's push-out DELETED; beat = tick-alone → pull-in → **gap held open for the rest of the loop**; end-config = the held gap, so the pin photographs the claim by construction; archetype renamed → coined **`diverge-from-mark`**; bar scale re-derived (1.1× 15.96 J) | §3 S4 + archetype block + pin table; §4; §10(d) |
| **F-2 (P1)** | Eased reversal DELETED; the vector beat (now S6) is **two RESTARTED runs of opposite ω₀ sign** with a hard cut + re-pin cue — L never crosses zero; toggle = same mechanism; **engine F4 deleted**, collapsed to "ω₀ signable" in E2 | §3 S6; §10(c)/(d); E2 + F4 tombstone |
| **F-3 (P1)** | Two-mode spec DELETED; **single angular-momentum integrator** exactly as ruled; no mode enum; r-drag-while-braking correct by construction; E-a probe carried; L-readout tautology retired — reframed as the integrator state; independent confirmation moved to S3's tick + the probe | E2 (+E3/F3 tombstones); §3 metrics; §3 S7/S8 |
| **F-4 (P1)** | **F5 (NEW): radial −r̂ force arrows** on each mass, authored in S2 and S4 with reveal cue + ledger row; **claimed in the walk table**; reuses union #5's machinery; `internal_forces_no_torque` now has its picture | F5 + walk; §3 S2/S4; §4; §6; §9; §10(b)/(d) |
| **F-5 (P1)** | S3 **re-declared as the quantitative beat**: I₁ω₁ = I₂ω₂ computes the prediction (tick at 1.50 via F1) BEFORE the push-out; the live readout lands on it; title + cue say so; **Rule 38a ordering now explicitly addressed** — qualitative → quantitative → condition → extended → derivation | §2 + 38a paragraph; §3 S3; §10 walk Q1; JEE trace |
| **F-6 (P2)** | S8 control semantics as an engine contract: `m`/`ω₀` **re-initialise** (L re-pins with a cue), `r` is the only live-drag control holding L, direction = restart | §3 S8; E8 |
| **F-7 (P2)** | (a) Per-state loop minima tabled WITH the pre-roll (S2 ⇒ R ≥ 12.6 s, authored 13 s; all seven tabled). (b) Geometry specified: R_rim = **1.2 m**, rod half-length 1.0 m, clamp [0.15, 0.90]; **r and R_rim as two distinct labelled lines** | §2 geometry; §3 pin table; §3 S5; §10(b); F2 |
| **F-8 (P2)** | **ω₀ = 1.50**; every number re-derived (L = 4.59, ω₂ = 6.95, KE 3.44 → 15.96, ratio 4.64, top spin 1.11 rev/s); KE₁ ≠ L; **HUD = 2 decimals everywhere**, narration matching | §2; every state row; §4; Block 1; E6 |
| **F-9 (P2)** | Brake **PROMOTED to core and moved before the vector beat** — S5 = brake (core), S6 = vector (extended); rings monotone; smallest preset retains the condition; foundational extended to S1→S5; both cuts re-verified | §2; §3; §7; §10(i-1)/(i-4); min_rings |
| **F-10 (P2)** | **Enum-closure contract**: enums declared against the survey's **12-concept union** (tokens enumerated); **torque source = a LIST** with an explicit implemented/deferred split | Enum-closure block + F2; SCAR AUDIT |
| **F-11 (P2)** | S7 archetype renamed **`equation-build`**; the beat states why the picture is distinct despite the replay vehicle; `dL/dt = 0.00` reframed as an **illustration of the law the engine integrates** | §3 archetype block + S7 |
| **F-12 (P3)** | (a) S7 title → **"Why L stays constant"**. (b) S1 uses **"torque"**, never "outside twist". (c) r clamp widened to **[0.15, 0.90]** | §2; §3 S1; §2 geometry |

**Also addressed:** the six failing scar dispositions re-done with the report's evidence; queries stated with counts and the not-queried boundary declared; Checkpoint A's note carried — the dispatching session should APPEND this concept to the OPEN `teach_visual_must_match_narration` row rather than mint a duplicate.

**Net changes vs REV 2:** everything the reviewer praised is preserved structurally (term ledger, ring-cut walk with min_ring explore controls, per-state×engine walk, anchor state-assignments, numeric ground-truth discipline, S7's existence); the deltas are exactly the F-1…F-12 fixes plus the six re-dispositions.

*Handoff: → founder-proxy Checkpoint A re-submission (fix cycle 1 of 2). On `DESIGN_OK`: physics_author, then 0c-1 dispatch to field3d-surgeon on `feat/rotmech-engine`.*

---

**Operational note for the dispatching session:** the two zero-row family queries (`newtons_laws_body`, `rigid_body_rotation`) returning empty is a quirk of the query script's concept matching — nlb rows surface via `--owner` and `--field3d --open`. Worth knowing when auditing future scenario-family rows.
