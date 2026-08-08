# HANDOFF — `vector_products_in_space` (3D vectors: dot & cross product)

> **Status: WORK STOPPED MID-FLIGHT by founder decision, 2026-08-08.** Nothing is committed.
> The founder is restarting this concept — and the wider 3D-vectors chapter — in a **fresh session
> on a new desk, beginning at Phase 0**, so that the `field_3d` engine is surveyed and built
> properly once and the whole chapter can then be authored quickly.
>
> **This file is the complete record of what was done, measured, learned and left behind.**
> Read it before opening that new session. Its most valuable content is §3 (the measured engine
> inventory) and §7 (the two traps), which is exactly the Phase-0 input the next session needs.
>
> ---
> ### ✅ SUPERSEDED 2026-08-08 — that Phase-0 session ran. → **`docs/MATHEMATICS_PHASE0_VECTORS_3D.md`**
> This file is now HISTORY. Read it for context; take decisions from the Phase-0 doc. Three of its
> open items are closed and two of its measurements are corrected:
> - **§2 (the 10 unexplained EYE failures) is RESOLVED — the surgeon's diff is exonerated.** A clean,
>   freshly-synced master carrying **zero** of that diff returns 43/56 on `parallel_currents_force`,
>   **13 failures, all `H2/VISUAL_REGRESSION`, zero functional gates**. The baselines were approved
>   2026-07-05 and 199 commits have touched `field_3d_renderer.ts` since. Candidate **#3** (which §2
>   ranked last) was right. *Also found en route: local master was 6 commits behind origin, 4 of them
>   touching the renderer — the Build Plan's "sync before you measure" rule was live and unnoticed.*
> - **§1 (the fate of the engine desk) is DECIDED, pending founder sign-off: KEEP and WIDEN**, under
>   three conditions — **rename** `scenario_type` off a concept id (`vector_products_in_space` →
>   `vector_geometry_3d` + a `mode` enum, free today and impossible after merge), **widen** to
>   lines/planes so concept #9 is pure JSON, and **re-verify on a synced base** with all 8 negative
>   controls firing.
> - **§8.1 (survey D + E + F together) is ANSWERED: D and E are one purchase; F is measurably not.**
>   `field_3d` has **zero** expression evaluation, so F's authored `y = f(x)` profile needs a closed
>   enum or a fleet-wide evaluator, and F's 2D half is `cartesian_plane` on a different renderer.
> - **§3 CORRECTION — `crossProduct` is `0`, not 193/215/217.** The composite is `ArrowHelper` 205 +
>   `PlaneGeometry` 10 + `crossProduct` **0**. Never sum unlike symbols into one reuse number.
> - **§3 CONFIRMED — the generic camera path is real** (`applyState:67195`, ungated). But a
>   near-identical copy lives at `:66995` inside `applyStraightWireCurrentState`; resolve citations to
>   the **enclosing function**, never the matching line. *New:* the ease itself
>   (`lerpSpherical`, `t = 0.05` per rendered frame) is **frame-rate dependent** — Rule 36, and §6's
>   solution makes a camera tilt the primary aha.
> ---
>
> Companion docs: `docs/MATHEMATICS_DISCUSSIONS.md` §6 (the ranked list + the ⚑ 2026-08-08
> correction) · `docs/MATHEMATICS_BUILD_PLAN.md` · `docs/patterns/mathematics.md` (archetypes D/E) ·
> `docs/MATHEMATICS_PHASE0_CARTESIAN_PLANE.md` (**the model to imitate** — the Phase-0 survey that
> made `cartesian_plane` succeed across three concepts).

---

## 1. Where everything physically is

Two desks hold uncommitted work. **Neither has a PR. Nothing is on master.**

| Desk | Branch | Base | Contents |
|---|---|---|---|
| `Physics-mind-mathematics-vectors-3d` | `feat/mathematics-vectors-3d` | `ad569ae` | `docs/skeletons/vector_products_in_space_skeleton.md` (untracked, 509 lines + cycle-1 amendment) |
| `Physics-mind-field3d-vector-products-scenario` | `feat/field3d-vector-products-scenario` | `0d6df82` | The engine build — **626 insertions, 3 deletions** across 3 modified + 3 new files |

Engine desk diff:
```
 package.json                                 |   3 +-   (adds check:vector-products)
 src/lib/renderers/field_3d_renderer.ts       | 586 ++++   (74,959 → 75,545 lines)
 src/lib/validators/visual/deriveStateMeta.ts |  40 ++
 + src/scripts/check_vector_products.ts                       (new, 512 lines, the gate)
 + src/scripts/_seed_engine_bug_queue_vector_products_in_space_scenario.ts   (new, ALREADY RUN)
 + supabase_migrations/supabase_2026-08-08_seed_engine_bug_queue_..._migration.sql  (new, emitted)
```

**Decide deliberately in the new session whether to keep or discard this engine work.** It is
genuinely good and fully gated (§4), but it was built to serve ONE concept's design. A proper Phase-0
survey covering the whole chapter may want a different shape — and §5 records an unresolved
regression signal against it that was never diagnosed.

---

## 2. ⚠ THE UNRESOLVED ITEM — read this before trusting the engine desk

`npm run visual:eyes -- parallel_currents_force` on the engine desk returned:

```
📊 56 deterministic checks · 46 passed · 10 failed
```

**This concept's recorded reference result is 56/56.** The run was executed but the **10 failures
were never diagnosed** — the founder stopped the work at exactly that point. Do not read this as
"the engine build is broken", and do not read it as "it's fine" either. It is **unknown**, and it is
the single highest-priority question if the engine work is kept.

Three candidate explanations, in order of likelihood, none verified:
1. **H2 stale baselines.** The concept's cache was re-seeded immediately before the run
   (`_seed_parallel_currents_force_cache.ts`, `sim_html 4,527,388 chars`), and the surgeon's edit
   changes the emitted `field_3d` template. Byte-different HTML ⇒ different pixels ⇒ H2 diffs that
   are vintage, not functional. **This is the documented, common case** — `MATHEMATICS_BUILD_PLAN.md`
   36b records a 41-concept sweep where every diff was exactly this.
2. **A genuine shared-glue regression.** The surgeon touched 2 shared lines (the scenario-type union
   terminator and the `#sliders` NOT-list condition). Small, but shared.
3. **Pre-existing drift** unrelated to this work — master moved between the last recorded 56/56 and
   `0d6df82`.

**How to resolve it in one step:** run the same EYE sweep on a checkout of `0d6df82` **without** the
surgeon's diff. Same failures ⇒ pre-existing, not ours. Different ⇒ diagnose the diff.

---

## 3. THE MEASURED ENGINE INVENTORY — the highest-value content here

All numbers measured directly against `src/lib/renderers/field_3d_renderer.ts`, twice, by two
independent agents plus the dispatching session. **Do not re-derive from scratch — re-verify these
and move on.**

| What | Count | What it means for you |
|---|---|---|
| `scenario_type === ` dispatch branches | **234** | Scenario dispatch is hard-coded per scenario. There is **NO generic "any two vectors" scenario** a JSON author can target. A new `scenario_type` is unavoidable. |
| `crossProduct` / `ArrowHelper` / `PlaneGeometry` | **215–217** | The vector **maths and arrow drawing are genuinely reusable.** This is the half that is real. |
| `BufferGeometry.setFromPoints` live sites | **40** | The per-frame-rewritten-geometry technique already has heavy precedent — mesh work is conventional, not novel. |
| `parallelogram` | **0** | No parallelogram mesh exists. Existing `PlaneGeometry` uses are all **fixed, axis-aligned rectangles** — not reusable for a live quad from two arbitrary vectors. |
| `parallelepiped` | **0** | No analog at all. |
| `vectorTriad` | **0** | Rule-40a sweep clean — nothing is being built twice. |
| `applyRhrForceDirectionState` | `:11992`, dispatched `:67383` | **The clone target.** Nearest existing two-vector-plus-cross-product scenario. |

**The camera mechanism already exists and does NOT need building.** The generic
`stateDef.camera_position → animateCameraTo()/lerpSpherical()` path in `applyState()` is a
top-level block, never scenario-gated, so any new scenario gets **per-state camera poses with eased
transitions for free**. This was discovered only after a scenario was scoped to build it — a good
Rule-40a catch worth repeating.

**Concrete engine asks that came out of this (validate against the whole chapter, not one concept):**
1. A new `scenario_type` case + `apply<Name>State()`, cloned in SHAPE from `applyRhrForceDirectionState`.
2. A live **parallelogram** mesh — 4 verts `[0, a, a+b, b]`, rewritten per frame, `transparent` + `DoubleSide`.
3. A live **parallelepiped** mesh — 8 corners / 6 faces; build all faces from the same corner
   formulas so adjacent faces share edge vertices and the solid closes by construction.

**Chapter-level amortisation — the reason Phase 0 matters.** Archetype **E** (lines & planes,
ranked P3 #9) reuses the SAME scenario shell and camera work, and archetype **F** (solids of
revolution, P3 #8) reuses the mesh-helper pattern. Survey **all three** into one Phase-0 contract and
the engine is bought once for the chapter. This is precisely what `cartesian_plane` did — one
purchase, then `graph_transformations`, `derivative_as_secant_limit` and
`definite_integral_as_accumulated_area` were authored on it with **zero** further engine spend.

---

## 4. What the engine desk actually built (if you keep it)

Written by `field3d-surgeon`, verify chain green except §2.

- **Pure, THREE-free helpers** (`:11893–12041`): `vpSub/vpAddVec/vpCrossVec/vpDotVec/vpLenVec/vpNormalize/vpTranslateVerts`, `vpBuildVectors`, `vpParallelogramVerts`, `vpParallelepipedFaces`, `vpProjectPoint`, `vpPairwiseScreenSeparationDeg`. Being THREE-free is what makes them headlessly gate-able.
- **The scenario** (`:12085–12369`): build / apply / frame / glow + a dynamic `#vp_sliders` panel that inherits the Rule-39g ⚙ widget engine by auto-discovery.
- **`deriveStateMeta.ts`** (+40): `F3D_REVEAL_KEYS += 'vp'`, a reveal-pin candidate, and an explicit guided→`reveal_hold` / explore→`interactive` split. It deliberately did **not** declare a D5 motion expectation, on that file's own "over-declaring is worse than skipping" doctrine — a judgment worth re-reviewing.
- **The gate — `npm run check:vector-products`** (`src/scripts/check_vector_products.ts`): **64 assertions, 0 failures, 8 negative controls, each confirmed to fail its target defect first.** Verified by the dispatching session: `ALL SECTIONS PASSED`.
- Verify chain on the desk: `check:renderer-syntax` OK ×3 · `check:renderer-backticks` clean · `tsc` **0** · `validate:concepts` **151 PASS** · `vitest` **356 passed**.

**The single best assertion in that gate**, worth preserving in any rebuild:
> a per-object foreshortening margin **passes vacuously** on the real b/(a×b) collinearity at
> θ=35°/az=35°/el=30° (`sepDeg=0.51`), while the **pairwise** metric correctly flags it.

That is scar row `camera_metric_scored_foreshortening_not_pairwise_screen_separation` turned into a
mechanical check. Keep it whatever else changes.

### The JSON contract it exposed (for whoever authors against it)
```
states.<id>.camera_position: [x,y,z]        // REQUIRED per state — no fixed pose works (§7)
states.<id>.vp: {
  mode?: 'dot'|'cross'|'triple', a_mag?, b_mag?, theta_deg?,
  c_mag?, c_theta_deg?, c_phi_deg?,          // c via spherical angles
  show_c?, show_cross_vector?, show_angle_arc?,
  show_parallelogram?, show_parallelepiped?, reveal_ms?,   // reveal_ms default 900
  controls?: string[], static_readouts?: string[]
}
config.slider_controls.{a_mag,b_mag,theta_deg,c_mag,c_theta_deg,c_phi_deg}: {min,max,step,default,label}
config.vp: { color_a?, color_b?, color_c?, color_cross? }
```

---

## 5. The design work — skeleton state

`docs/skeletons/vector_products_in_space_skeleton.md` on the concept desk. **Checkpoint A cycle 0 =
`DESIGN_FIX` (8 P1 · 9 P2 · 6 P3); cycle 1 amendment applied; the re-verdict was NEVER RUN.**
The Checkpoint A cycle budget (2) is therefore effectively spent — a fresh Phase-0 restart resets
this cleanly, which is a further argument for the founder's decision.

**Concept id `vector_products_in_space`** was collision-checked clear across all three namespaces.
These ids ALREADY EXIST as physics concepts and are permanently forbidden:
`dot_product`, `angle_between_vectors`, `unit_vector`, `unit_vector_form`, `area_vector`,
`scalar_vs_vector`, `vector_addition_law`, `vector_head_to_tail`, `vector_resolution`,
`negative_vector`, `scalar_multiplication`.

**The 8-state arc as amended** (worth reusing; it survived review on pedagogy):
S1 apparatus → S2 dot = alignment → S3 dot = 0 at 90°, **extended through 90° into the obtuse
regime** so the negative dot product is actually taught → S4 **PRIMARY AHA**, cross gives a
perpendicular direction → S5 cross magnitude = area, **driven by ‖b‖ not θ** → S6 order matters
(contrast with S4) → S7 *advanced*: triple product = volume → S8 explore.

Design decisions that were hard-won and should carry forward:
- **S4 shows `a·(a×b) = 0.0` and `b·(a×b) = 0.0`**, not `|a×b|`. Arithmetic proof of
  perpendicularity that survives every camera pose, and it repairs a Rule-38 ring-cut incoherence
  (S4 previously displayed `|a×b|`, whose only explanation lived in a cut ring).
- **S5 driven by ‖b‖**, not θ — differentiates its rhythm from S2/S3 (three states shared one
  rhythm) *and* removes it from the camera-collinearity exposure.
- **S8 needs a `b_tilt` control** or the sandbox can never demonstrate direction — which is the
  concept's own primary aha. Under the plane invariant (`a` along +x, `b` in-plane) `a×b` points
  along +z for every reachable slider combination.
- **The door anchor must not claim area.** "The swept door panel's area scales with how hard you
  push" is false — the swept region is pure geometry. Correct version: *"how much a push turns a
  door depends on both how hard you push and which direction you push relative to the door."*
- **Prerequisites**: `unit_vector` / `vector_resolution` / `dot_product` are **NOT shipped product** —
  no `visual_baselines/` entry, absent from `PILOT_CONCEPTS`, and `dot_product` names
  `panel_b: "graph_interactive"` which renders nowhere. `scalar_vs_vector` IS baseline-locked.

Left open, flagged `ASSUMPTION — probe-before-authoring`: the exact S7 camera pose (pending `c`'s
components) and the `b_tilt` × live-follow-azimuth interaction on S8.

---

## 6. THE CAMERA ANALYSIS — independently verified, reusable for the whole chapter

This is the deepest finding of the round and applies to **every** 3D-vector concept, not just this one.

**A single fixed camera cannot serve this concept.** At the originally authored pose
(azimuth 35°, elevation 30°), measured and reproduced independently by the dispatching session:

| true angle a^b | renders on screen as |
|---|---|
| 30° | 44.5° |
| 45° | 73.9° |
| **90°** | **125.2°** |
| 120° | 142.0° |

At **θ = 35°**, `proj(b) = (0.000, −0.500)` and `proj(a×b) = (0.000, 0.866)` — **exactly 180° apart,
one screen line.** Two vectors perpendicular in 3D draw as one.

**The theorem:** `b` goes screen-collinear with `a×b` at exactly **θ ≡ camera azimuth (mod 180°)**,
because the screen-right basis vector `r = û × ẑ` lies in the swept plane. An exhaustive search over
azimuth ∈ [−90°,90°] × elevation ∈ [5°,85°] found **ZERO feasible fixed poses**.

**The solution, verified numerically:**
- **Elevation 70°** (near-perpendicular to the a–b plane) for states that claim an in-plane angle:
  max error **3.47°** over θ ∈ [20°,160°] — a true 90° renders as **93.3°**, versus 125.2° before.
- **S4 tilts elevation 70°→30° with azimuth FIXED** — the tilt *is* the reveal that a third dimension
  exists, and holding azimuth constant means the collinearity condition is never crossed.
- **For a full-range sandbox slider: live-follow azimuth = `(θ + 90°) mod 360°`.** This makes the
  failure mathematically unreachable (collinearity needs azimuth ≡ θ mod 180°; a constant 90° offset
  never satisfies it). Measured minimum screen separation: **90.0°**.

**The invariant to write into the Phase-0 contract**, replacing the per-vector one:
> The camera azimuth (mod 180°) must lie outside every state's swept θ range, and away from 0°/180°.
> Any perpendicularity claim must ALSO carry a numeric dot-product readout, so the claim never rests
> on pixels.

---

## 7. THE TWO TRAPS — why this concept cost what it did

**Trap 1 — `[LIVE]` has two meanings, and only one is a costing basis.**
`docs/patterns/mathematics.md` tagged archetype D `[LIVE — reuse, verified 2026-08-04]`, and the
concept was scheduled into a tier literally headed *"the cheapest available (no new engine)"*. But
"verified" there meant *somebody read the renderer and saw `crossProduct` in it* — **not** that a
concept had ever been built on it.

| Meaning | Archetypes | Safe to cost against? |
|---|---|---|
| **Proven by shipping** — a concept runs on it today | A (`cartesian_plane`), B (`locus_trace`), C (unit circle) | **Yes** |
| **Proven by code-reading** — primitives exist, nothing ever wired end-to-end | **D**, **E** | **No** |

The *maths* was reusable; the *wiring* was not. **Never schedule a concept into a "no new engine"
tier on a code-read tag.** Build one throwaway state on the archetype first, or price the wiring in.
(The ranked list has been corrected: P2 #5 → **P3 #7**, with `⚑` note in `MATHEMATICS_DISCUSSIONS.md` §6.)

**Trap 2 — a check that measures the wrong thing passes vacuously.**
The original camera invariant bounded *per-vector* foreshortening. Every claim this concept makes is
about the *relationship between two* vectors, and projection preserves neither angles nor
collinearity — so the check passed while the sim was unreadable. This is a **rediscovery of an
already-filed MAJOR OPEN scar**, `camera_metric_scored_foreshortening_not_pairwise_screen_separation`,
whose prevention rule states it exactly:

> *"An occlusion metric must be PAIRWISE over every rendered pair, never per-object… when a
> measurement is introduced to prevent a defect, check that the thing it measures is the thing that
> failed."*

The architect walked into it because it could not query the live queue from a read-only desk.
**`engine_bug_queue` is 883 rows / 343 OPEN, of which 106 are `field_3d`.** The static mirror in
`docs/patterns/mathematics.md` §4 carries 12 hazards, of which exactly **one** touches `field_3d`.
**The live query is mandatory for any `field_3d` work; the mirror is not a substitute.** Copy
`.env.local` into the desk before dispatching anything that needs it.

Other OPEN rows that bear on this chapter:
- `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` [MAJOR]
- `field3d_explore_camera_fixed_while_its_own_dials_span_two_orders_of_radius` [CRITICAL]
- `concept_schema_assessment_minimum_exceeds_the_skeleton_authored_item_count` [OPEN] — the schema
  floor is `questions.min(6)` (`src/schemas/conceptJson.ts:328`); this skeleton specified 4. Second
  occurrence of the same class.

---

## 8. What the new Phase-0 session should do

Model it on `docs/MATHEMATICS_PHASE0_CARTESIAN_PLANE.md`, which is the process that worked.

1. **Scope the CHAPTER, not one concept.** Survey archetype **D** (dot & cross), **E** (lines &
   planes, P3 #9) and ideally **F** (solids of revolution, P3 #8) together, so one engine purchase
   serves all of them. This is the founder's stated goal and it is the right one.
2. **Do the union check before any code** — every engine feature exercised by at least one designed
   state, and no designed state needing a feature outside the set. The recorded P0 lesson:
   *"#3's 0b surfaced ten contract changes its sketch missed."*
3. **Start from §3's measured inventory** and §6's camera contract. Both are verified; re-verify
   cheaply, don't re-derive.
4. **Query the live `engine_bug_queue`** (§7) — `--field3d --open` first, all 106 rows.
5. **Decide the fate of the engine desk** (§1, §4) and resolve §2's 10 EYE failures either way.
6. Land the engine on **master separately** under Rule 40, with its own headless gate carrying
   negative controls, before any concept JSON is authored.

---

## 9. Cost so far, recorded honestly

Six agent dispatches: architect ×2, founder_proxy Checkpoint A ×1, field3d-surgeon ×1, plus the
dispatching session's own verification. Roughly **725k subagent tokens.** Output: one reviewed
skeleton, one gated engine build, one falsified scheduling premise, one verified camera contract,
and two durable traps written down.

None of it is wasted **if this file is read before the restart** — §3, §6 and §7 are the expensive
parts, and they are all reusable.
