# HANDOFF — `vector_products_in_space` (banked 2026-08-09, founder decision)

> **Status: BANKED, not abandoned and not approved.** The engine is COMPLETE and MERGED on master.
> The concept JSON is authored, gated and committed on desk `feat/mathematics-vector-products` @
> `25a1a99`. It went through **two** gate rounds; the second found the concept substantially improved
> and surfaced one new MAJOR. The founder stopped the fix cycle here.
>
> **Nothing is approved.** No `visual:approve`, no baseline locked, no `PILOT_CONCEPTS` entry, no PR.
> **This file is the complete record of what is done, what is outstanding, and what was measured** —
> written because every finding below otherwise exists only inside agent reports and a chat log, which
> is the exact failure mode this wave named twice (A20, and the concept desk's own uncommitted-work
> near-miss).
>
> Companions: `docs/MATHEMATICS_PHASE0_VECTORS_3D.md` (the survey + AMENDMENTS A1–A31) ·
> `docs/skeletons/vector_products_in_space_skeleton.md` (Checkpoint A `DESIGN_OK`) ·
> `docs/skeletons/vector_products_in_space_mathematics_block.md`.

---

## 1. WHAT IS DONE AND ON MASTER — this is the durable asset

**Two `field_3d` engine purchases, five surgeon dispatches, four merged PRs.**

| | state | gate |
|---|---|---|
| `vector_geometry_3d` (serves #7 + #9) | ✅ master | `check:vector-geometry-3d` **570 assertions / 60 negative controls** |
| `solid_of_revolution` (serves #8) | ✅ master | `check:solid-of-revolution` **231 / 34** |

PRs: **#75** (VG-A/B/C + rename + union) · **#77** (SR-A/SR-B) · **#78** (three authoring-found defects
+ both fleet-safety gates repaired) · **#79** (the surface-truth cluster).

**Concept #9 `lines_and_planes_in_space` and #8 `solids_of_revolution` are both unblocked and need
ZERO further renderer work.** That was 0d's success test and it holds. The engine is the thing that
outlives this concept, and it is banked.

---

## 2. WHAT IS OUTSTANDING ON THE CONCEPT — the resume list

Ordered by what a resuming session should do first. **Everything below is authoring or engine work on
a concept that is otherwise green** (`tsc` 0 · `validate:mathematics` PASS · `validate:concepts` 151 PASS ·
`check:vector-geometry-3d` ALL SECTIONS PASSED).

### 2a · THE ONE BLOCKER — one clause, no re-baseline
**`STATE_8` `s8_2`: *"Change the angle and the two lengths, and every reading follows."* is FALSE against
its own readout panel.** S8's four `value_readouts` are `theta_deg, a_dot_b, a_dot_cross, b_dot_cross`.
Driving the shipped `vgReadoutLine`:
```
θ 60→120  → a·b −3.00   a·(a×b) 0.00   b·(a×b) 0.00
|a| 3→5   → a·b  5.00   a·(a×b) 0.00   b·(a×b) 0.00
|b| 2→4   → a·b  6.00   a·(a×b) 0.00   b·(a×b) 0.00
tilt 0→60 → a·b  3.00   a·(a×b) 0.00   b·(a×b) 0.00
```
False twice: the two dot-with-cross readouts are **identically zero** (they are the *point* of S4), and
θ does not follow either length. **Owner `alex:json_author`.** Text-only — THE EYE captures the renderer
wrapper, not the subtitle strip, so **no pixel moves and no re-baseline is needed.**
*This is the second occurrence in the same sentence:* the previous `s8_2` was wrong about the tilt, that
half was fixed, and the "every reading" half was left standing.

### 2b · ⭐ THE NEW MAJOR — S6 draws two EQUAL magnitudes at UNEQUAL screen lengths
**The state whose entire lesson is `b×a = −(a×b)` — same length, opposite direction — renders the second
arrow 34 % shorter.** Independently reproduced (the eye-walker read 272/180 px off the frames; the model
gives 275/182):
```
|a×b| = 6.50  →  275 px up        (tip 13.94 units from the camera)
|b×a| = 6.50  →  182 px down      (tip 20.06 units from the camera)   ratio 0.662
```
Pure perspective at S6's authored pose (az 90 / el 30 / R 16). **The frozen baseline archives the short
one.**
**⚠ The `cross_mag` label fix is what made this legible.** Before it, both readouts printed `|a×b|`, so
nobody would compare them; now one reads `|b×a| = 6.50` beside a visibly shorter arrow. **Fixing one
truth-surface exposed the one beneath it** — worth remembering as a pattern, not just an incident.
**Escape routes, measured — neither is free:**
| lever | value needed for ratio ≥ 0.95 | cost |
|---|---|---|
| pull the camera back | **R ≈ 100+** | the figure is already 11 % of frame width at R 16 |
| drop elevation | **el ≈ 2°** | `a` and `b` live in the xz-plane — that is edge-on |
A third option exists and is a design call: **accept the foreshortening and let the readout carry the
claim** (D4: every geometric claim carries a 3D-computed number — `6.50` is printed both times). That is
consistent with this wave's own invariant, and it is the cheapest honest answer.
**Owner: `alex:architect` (design) with `peter_parker:field3d_surgeon` if a camera solve is chosen.**

### 2c · D5 NEVER RAN — the motion gate is still skipped on all eight states
`deriveMotionExpectations` gained a `vg` entry in PR #79, **and D5 is still `Skipped — motion expectation
unknown` on every state**, with the nine skips (8×D5 + H2) counted inside a `35 passed` headline.
Eye-walker's hypothesis, unverified: `visual_eyes.ts:68` feeds `deriveMotionExpectations(cached.physics_config)`
while the sibling reveal/hold derivations at `:84–85` feed `conceptJson ?? cached.physics_config` — so the
sibling derivations resolve and this one does not. **Owner `peter_parker:field3d_surgeon`.**
**Separately and fleet-wide:** that `visual_eyes.ts` aggregates skips into the pass count is a Rule-40
reporting change touching every EYE headline on both engines. **Founder call, deliberately not built.**

### 2d · Carriable — authoring
- **S1** prints a lone `θ` glyph *and* a HUD asserting `|a| = 3.00`, `|b| = 2.00` at t=0, **before either
  vector exists.** The reveal-gate applied to S4 in PR #79 was not applied to S1's readout set.
- **Suppressing `#legend` cost the object names.** S7's base quad and height segment, and S5's
  parallelogram — whose entire claim is *"this area is |a×b|"* — now carry **no on-canvas label**.
  "Removing beats relocating" was right about the collision and wrong about the naming.
- **θ rounds to integer degrees while its own product uses the unrounded angle**: S2 t=8000 shows
  `θ = 47°` and `a·b = 4.07`, but `6·cos 47° = 4.09`. Two numbers beside their own formula must satisfy
  it at the displayed precision.
- **The projection label overprints the θ arc** at the vertex — and it is **on the frame that would become
  the H2 baseline** (S3 frozen).
- **Framing, raised twice and deferred twice:** the drawn figure is **11–17 % of frame width** across the
  guided states (S4 12 %, S6 11 %); the origin sits at exact frame centre and everything grows right and
  down, leaving the **left ~48 % of the canvas permanently empty.** Not fixable without an authorable
  camera *target* — which is the OPEN row `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable`.
- `b×c` is named as an *area* in S7 while being a *vector* (the `vg_bxc` arrow does not exist — see §4).
- S8 is a **still photograph** for its entire captured life (all frames byte-identical); whether a
  teacher's drag animates it is **not verifiable from frames**.

### 2e · Carriable — skeleton reconciliation (`alex:architect`)
The skeleton's §10b DoD declares three strings the shipped engine cannot render (`b×c` label,
`Area = 6.50` inside the quad, a `direction: +y/−y` HUD token that does not exist in `VG_READOUT_LABEL`),
and its `Base 4.25 / Height 2.34` are **stale** — the JSON's measured 4.27 / 2.33 are correct. Also §3a's
declared camera floor of 18.91° is not the shipped floor (S1 opens at θ=6 where it is 5.64°; harmless,
but false as a statement).

---

## 3. ✅ SCAR ROWS — SEEDED AND VERIFIED LIVE (closed 2026-08-09, commit `15608f1`)

> **RESOLVED — do NOT redo this.** All **18** rows below were authored into
> `src/scripts/_seed_engine_bug_queue_vector_products_gate_rounds.ts` (+ archival migration SQL) and
> upserted to the live queue 42 minutes after this file was written. **Re-verified 2026-08-09 by direct
> query against `engine_bug_queue`: 18/18 present, 0 missing, 0 status mismatches, all 18 stamped
> `discovered_in_session = session_2026-08-09_vector_products_gate_rounds`.** 5 `FIXED` / 13 `OPEN`;
> the concept now shows **25 rows** total.
>
> Two details worth keeping. (a) `eye_gate_skipped_for_an_unregistered_scenario_is_counted_as_a_pass`
> was deliberately seeded **`OPEN`, overriding the surgeon's `FIXED`** — the `vg` registration landed but
> the second EYE walk found D5 still skipped on all eight states, and *a row is FIXED when the product has
> the thing it describes, not when a change intended to deliver it has landed*. (b)
> `field3d_vg_slider_range_is_concept_wide_...` was authored `OPEN` **by design** and closes only now that
> `STATE_5` carries `control_ranges`. Neither status is an oversight.
>
> **The presence of the migration SQL file does not prove the rows landed** — the script writes that file
> *before* it upserts. The proof is the query, and it was run.

*Historical record of what the 18 cover (verified against the live queue, not re-authored):*

- **4 rows from PR #79's surface-truth dispatch** — `field3d_vg_a_value_surface_can_disagree_with_the_geometry_it_names` ·
  `field3d_vg_slider_range_is_concept_wide_so_a_guided_state_cannot_bound_its_own_control` (**authored `OPEN`
  by design — it closes only now that `STATE_5` carries `control_ranges`**) ·
  `field3d_vg_overlay_relocation_moved_the_collision_instead_of_removing_it` ·
  `eye_gate_skipped_for_an_unregistered_scenario_is_counted_as_a_pass`.
- **~12 rows from the two EYE walks**, headed by `vg_flip_state_draws_two_equal_magnitudes_at_unequal_screen_lengths` (§2b),
  `vg_camera_solve_frames_the_figure_at_one_sixth_of_canvas_width` (§2d) and
  `vg_state_1_hud_prints_magnitudes_before_either_vector_exists`.
- **2 tooling rows:** the on-frame gate projects **no labels** and uses a solver-derived pose rather than
  the state's own (it would have green-lit a `control_ranges` that clips the arrow's own name); and
  `query_engine_bug_queue.ts`'s `loadConceptIndex` (`:51`) does a **non-recursive** `readdirSync`, so
  `--field3d` and `--scenario` are structurally blind to `concepts/mathematics/` and `concepts/chemistry/`.
  That last one is the concrete mechanism behind AMENDMENT A20 and it is the same shape as the scar that
  file's own header already documents.

*Canonical text for all 18 (root cause · prevention rule · probe logic) now lives in
`src/scripts/_seed_engine_bug_queue_vector_products_gate_rounds.ts` and
`supabase_migrations/supabase_2026-08-09_seed_engine_bug_queue_vector_products_gate_rounds_migration.sql`
— read those, not this summary. The script is idempotent (`onConflict: 'bug_class'`), so re-running it is
safe but unnecessary.*

**Still genuinely outstanding from this section:** the two TOOLING rows are FILED, not FIXED —
`onframe_gate_projects_no_sprite_labels_and_uses_a_solver_pose_not_the_states_own` and
`engine_bug_queue_filters_are_blind_to_subject_subdirectories` (the non-recursive `readdirSync` at
`query_engine_bug_queue.ts:51`, the concrete mechanism behind AMENDMENT A20). Both are Rule-40 platform
work that lands on master separately.

---

## 4. MEASUREMENTS WORTH NOT REPEATING — all independently reproduced

- **S7's `c`:** `c_mag 2.0 · c_theta_deg 40 · c_phi_deg 6` → `Volume 9.951209 / Base 4.270752 / Height 2.330084`
  → displays **9.95 / 4.27 / 2.33**, and `4.27 × 2.33 = 9.9491`, which is **0.0041 ABOVE** the 9.945
  boundary and therefore rounds up. **The skeleton's own 4.25 × 2.34 = 9.945 sits exactly ON the boundary
  and cannot close.**
- **`Base = |b×c|`** (`field_3d_renderer.ts:12414`), and **`a` sits at +θ/2, `b` at −θ/2** (`vgBuildVectors:12120`).
  **`Volume` is identically invariant under an a↔b swap** (0.00e+0 over 20 000 configs) — it **cannot**
  validate the construction; **`Base` is the discriminating quantity** (diverges by up to 20.29). This cost
  a round-trip; see A29.
- **`split_gap_k = 0.6`**, not the 0.35 first recommended: 0.35 leaves **54 %** of the base inside the
  solid, 0.6 leaves 20 %, travel 2.358 < `|b|` 2.5. And **`k = 1` is exactly the tangency value**, because
  the offset is `k·(b+c)` and `|b+c|` **is** the base parallelogram's own diagonal.
- **`control_ranges.b_mag.max = 2.75`**, not 3.00: at 3.00 the tip label's own **centre** projects to
  NDC y = 1.0158 — off frame — a conclusion that needs no glyph metric. Verified 0 of 8 detents off frame
  under the strictest model (full sprite quad); the concept-wide range is **9** off frame, not 8.
- **S8's azimuth is identically 0.0000°** at every θ / |a| / |b| under `auto_frame`, because `a`,`b` are
  symmetric about +X: the pose `R·normalize(â+b̂+n̂)` has zero z-component. `camera_position` is inert and
  is *exactly* the computed pose. **The "az 0 is a better pose" claim was a single-θ artefact** — over the
  reachable range az 0 and az 90 both bottom out at **10.08°**. There is no pose advantage to buy.

---

## 5. THE HONEST READ

**The engine is the win.** Two scenarios, 801 gated assertions between them, seven mechanisms found
already shipping rather than built twice, and two concepts unblocked for pure-JSON authoring.

**The concept is close but not done.** Two gate rounds took it from FAIL + 13 findings to FAIL + 12, and
six of the eight shipped fixes are confirmed correct on pixels. What remains is one false sentence, one
genuine design question (§2b), a gate that never ran (§2c), and a framing complaint raised twice.

**The pattern worth carrying into the next concept:** *every* MAJOR finding across both EYE walks was the
same shape — **a text surface that disagrees with the picture beside it.** A stale slider, a hardcoded
label, a number printed before its subject, a sentence its own panel disproves, and finally two equal
magnitudes drawn unequal. **None was a rendering failure; all were claims.** 570 headless assertions and a
`35 passed` headline were structurally blind to every one of them, and only reading frames found them.

*Banked by founder decision. The engine ships; the concept waits.*
