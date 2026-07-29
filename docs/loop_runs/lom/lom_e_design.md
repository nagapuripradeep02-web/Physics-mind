# lom-e design — `rolling_friction` + `tension_force`

Founder-approved 2026-07-30. Branch `feat/lom-e-rolling-tension`, worktree
`C:\Tutor\physics-mind-lom-e`, cut from `feat/lom-friction-force` @ `a039841` with
`feat/lom-normal-force` merged in (`d8967c6`). Review port **8091**. EYE regression pair:
`electric_flux` + `magnetic_flux` (disjoint from the live ch7/ch8 loops, per CHAPTER_LOOP
Amendment 5).

This branch is the single integration point for the Laws of Motion contact-force set: it holds
`normal_force`, `friction_force` and the two new concepts on identical engine code, so the chapter
comes home to master in ONE merge.

---

## 0. Why these two concepts, and what makes each distinct

**`rolling_friction`** — the friction chapter's missing third case. `friction_force` teaches static
vs kinetic on a sliding block; this teaches that *rolling* contact resists two-to-three orders of
magnitude less, which is why every heavy thing humans move has wheels under it.

**`tension_force`** — the contact-force trio's closer, and the founder's explicit requirement
(2026-07-30) that it teach **when tension is the same through a string and when it is not**
(T₁ vs T₂). That second half is what makes it NOT a duplicate of `connected_bodies`:

| Concept | Owns |
|---|---|
| `connected_bodies` (sealed, master) | ONE string over a pulley: shared \|a\|, one T, T ≠ m₂g, one equation per body, Atwood |
| `tension_force` (this branch) | What tension IS: a pull along its own line that self-adjusts; ONE ideal string carries ONE tension everywhere, but each string in a CHAIN carries only the mass beyond it — T₁ ≠ T₂ |

Founder decision (2026-07-30): the two halves ship as ONE sim, not two. Split, sim #2 would open on
a contrast whose setup lives in another file — the contrast IS the lesson, so both halves sit on one
state rail.

**Ids are NEW, old skeletons are left alone** — the same call `normal_force` (vs the dead
`normal_reaction`) and `friction_force` (vs the dead `friction_static_kinetic`) already made. But
`tension_in_string` (dead `mechanics_2d`, section 8.1) currently owns the classifier synonyms
`tension` and `rope_tension`, so those redirect to `tension_force`; `atwood_machine` stays pointed
at `connected_bodies`, which is what actually teaches Atwood.

**Known catalog flag:** `docs/catalog/pilot-topic-12-friction.md` marks A11 rolling friction
`v1?: FALSE — V2 (depends on rotation)`. The comparison framing adopted here needs no torque and no
moment of inertia — only that a wheel visibly rolls while a block slides — so it is Class-11 safe.
Recorded because the tag is real and a future reader will hit it.

---

## 1. Phase 0 — the two engine seams (the ONLY renderer work)

Both land inside the existing `newtons_laws_body` scenario. No new `scenario_type`: per
`NEWTONS_LAWS_BODY_ENGINE_SPEC.md`, a second scenario is the single most expensive thing this
codebase can do, and neither concept needs a different physical picture — a surface carrying bodies,
gravity resolved, friction, applied force, arrows, live readouts.

### Seam 1 — `bodies[].shape?: 'block' | 'wheel'`

Purpose: `rolling_friction` needs a body that visibly ROLLS. Authoring a sliding cube and narrating
"rolling" is the asserted-not-rendered defect class the founder rejected on `newton_third_law`.

- **Geometry:** `CylinderGeometry(r, r, NLB_BODY_SIZE, 24)` with `rotation.x = π/2` so the axle lies
  along the depth (Z) axis — it reads as a wheel edge-on in the near side-on camera every nlb state
  authors. `r = NLB_BODY_SIZE / 2`, so a wheel and a block of the same mass occupy the same footprint
  and the side-by-side comparison is honest.
- **Spin legibility:** a smooth cylinder rolling looks perfectly static. The wheel therefore carries
  a contrasting **hub disc + two crossed spokes** as children, so rotation is visible. (Cheap up
  front; this is exactly the class of defect eye-walker otherwise reports three cycles late.)
- **Spin kinematics:** `mesh.rotation.z = -s / r`, computed from the body's CURRENT position each
  frame — never accumulated. Rolling without slipping is `s = rθ`, so this is exact, it is
  **dt-free** (Rule 36 safe by construction, no `0.016` anywhere), and under `SET_TIME_FREEZE`
  (`dt = 0`, `s` unchanged) the frame is byte-identical. Reversing direction unwinds correctly for
  free.
- **Physics: UNCHANGED.** Rolling resistance genuinely is `f = μ_r N` — the existing Branch A
  friction path already computes it. `μ_r` is authored as `mu_s`/`mu_k` ≈ 0.002. No integrator edit,
  no new branch, no new formula.
- Arrows, labels, HUD readouts and the trusted-drag hit proxy are reused untouched — they key off
  `bodyId`, not geometry.

### Seam 2 — `train?: { body_ids: string[] }`

Purpose: `tension_force` states 5–6 (T₁ ≠ T₂). This cannot be done on the current rig at any price
in JSON: `pulley` couples exactly two bodies with one string, so there is only ever ONE tension.

- **Geometry:** N bodies on the SAME surface, adjacent pairs joined by a taut rope segment. A
  3-body train needs exactly 2 segments, which is exactly the two rope meshes
  (`nlb_rope_a` / `nlb_rope_b`) SEAM D already builds — they get a straight-segment fitter
  (`nlbFitTrainRope`) alongside the existing pulley fitter, no new asset class.
- **Integrator:** Branch B's shape with every `c_i = +1` and one shared `theta` — one shared `a` for
  the whole train:
  `a = (Σ (F_applied_i − m_i g sin θ) + Σ f_i) / Σ m_i`.
- **Per-segment tension** by suffix-mass sum — segment `i` joins body `i` to body `i+1`, and carries
  only what is beyond it:
  `T_i = Σ_{j>i} [ m_j a + m_j g sin θ − f_j − F_applied_j ]`.
  For the canonical flat case (drive on the rear body only, F on the last body, friction f_j):
  `T_1 = m_2 a + m_3 a + …`, i.e. exactly "only the mass beyond this string".
- **Readouts:** `'T1' | 'T2'` join the readouts enum.
- **Arrows:** the existing `tension` arrow kind, pointed along the surface — forward on the body
  behind a segment, backward on the body ahead of it, so equal-and-opposite reads on screen.
- `deriveStateMeta.ts` needs **no** change: reveal timing still comes from `phases[]` and hold
  classification still keys off `mode === 'sandbox'`.

### Verify chain — run after EACH seam, both must pass before its commit

1. `npm run check:renderer-syntax` (Rule 36c) → `npx tsc --noEmit` (0) → `npm run validate:concepts`.
2. Re-seed + `npm run visual:eyes` on the regression pair (`electric_flux`, `magnetic_flux`). Any H2
   diff vs locked baselines = regression = FAIL, surgical rollback of renderer files only.
3. Rule 36b full-fleet sweep is **NOT** triggered: seam 1 is position-derived (touches no clock),
   seam 2 adds a dispatch branch and never touches `__pmSteps` / `dtStep` / the shared `animate()`
   accumulator.

One commit per seam (`feat(engine): …`) so the founder reviews with `git log -p`.
`NEWTONS_LAWS_BODY_ENGINE_SPEC.md` §1/§6 is updated in the same commits — the seams become doctrine,
not tribal knowledge.

**If seam 2 balloons past its scope, STOP and report** rather than extending the engine per concept
(spec §7 discipline: a concept forcing a renderer change means the design under-generalized).

**Who writes it:** the orchestrating session, directly. `field3d-surgeon` and `renderer-primitives`
are both absent from this session's dispatch registry (the documented worktree registry gap), and a
`general-purpose` dispatch averages ~25M tokens on field_3d work versus ~3.4M for the specialist.
Recorded because CHAPTER_LOOP §0.1 normally forbids the orchestrator touching the renderer.

---

## 2. Phase 1 — `rolling_friction`

**Atomic claim.** Rolling contact resists motion two-to-three orders of magnitude less than sliding
contact: same weight, same push, opposite outcome — because `f = μ_r N` with `μ_r` ≈ 0.002 against
`μ_k` ≈ 0.4. It does NOT cover rotational dynamics (no torque, no moment of inertia — Topic 15), and
it does NOT re-teach static vs kinetic (that is sibling `friction_force`).

**Universal anchor (Rule 35).** A wheeled suitcase versus dragging the same case. Culture-neutral,
no country, no brand.

**Proposed 5-state arc** (the architect owns final calibration; state count is complexity-driven per
Rule 11 and this is a simple concept):

| S | Teaches | Archetype | Delta cue (≤5 words) | Controls | EN words |
|---|---|---|---|---|---|
| 1 | Same mass, same push: the block crawls to a stop, the wheel rolls on | `side-by-side-race` | "Same push, different fate" | F | 30–45 |
| 2 | Why — identical formula, tiny coefficient: `f = μN`, μ_r ≈ 0.002 vs μ_k ≈ 0.4 | `reveal-build` | "Tiny f, same law" | m | 35–50 |
| 3 | Rule 16a: "a wheel has no friction" — it does; ramp μ_r up and the wheel slows too | `param_ramp` on `mu_k` | "Rolling still resists" | mu_k | 40–55 |
| 4 | Heavier load: sliding gets proportionally worse, rolling barely notices (DECLARED contrast pair with S1) | `side-by-side-race` | "Load punishes sliding more" | m, F | 30–45 |
| 5 | Sandbox | `drag-sandbox` | "All yours" | ALL | 0 / open |

Ball bearings stay **narration** on S1/S4 — an anchor mention, never an asserted visual we don't
render. `advance_mode`: S1–S4 `manual_click`, S5 `interaction_complete` (2 distinct → Gate 12 /
Rule 15). No `wait_for_answer`, no `pause_after_ms`, no `mode_overrides` (Rule 20).

---

## 3. Phase 2 — `tension_force`

**Atomic claim.** A string exerts a PULL along its own line whose size is set by the motion, not by
the string; one ideal string carries ONE tension everywhere, but each string in a chain carries only
the mass beyond it, so T₁ ≠ T₂. It does NOT solve coupled two-body systems (sibling
`connected_bodies`) and does not cover massive strings or multi-pulley systems (out of chapter
scope).

**Universal anchor (Rule 35).** A line of towed luggage carts — which is also literally the T₁/T₂
apparatus, so the anchor and the rig are the same picture.

**Proposed 7-state arc** (founder-chosen 6–7; architect may merge S1+S2 if S1 reads thin):

| S | Teaches | Archetype | Delta cue (≤5 words) | Controls | EN words |
|---|---|---|---|---|---|
| 1 | A string PULLS along its line, at both ends, away from each body (at rest, T = m₂g) | `reveal-build` | "String pulls both ways" | m2 | 30–45 |
| 2 | T self-adjusts to the load — the string has no value of its own | `param_ramp` on `m2` | "T follows the load" | m2 | 35–50 |
| 3 | Rule 16a: T ≠ mg once it moves — release, and T = m₂(g − a) | `translate-through` (ghost) | "Moving: T drops" | m2 | 40–55 |
| 4 | ONE ideal string, ONE tension: both arrows equal; the pulley turns direction, not size | `glow-walk` | "One string, one T" | m | 35–50 |
| 5 | TWO strings, TWO tensions: a 3-cart train under one pull, T₁ ≠ T₂ (seam 2) | `train-pull` (coined) | "Two strings, two T" | F | 35–50 |
| 6 | Why — each string carries only the mass beyond it (DECLARED contrast pair with S4) | `glow-walk` | "Only the mass beyond" | m, F | 40–55 |
| 7 | Sandbox | `drag-sandbox` | "All yours" | ALL | 0 / open |

Not attempted, deliberately: a string going SLACK (rope-slack rendering is a third engine seam) and
a body hanging from a fixed ceiling anchor (the gap `free_body_diagram` recorded). "Pull-only" is
taught by arrow DIRECTION — both arrows point away from their body along the string — which is
honest with what the engine renders.

---

## 4. Phase 3 — verification (per concept)

Alex pipeline, sequential, never parallel: `architect` → `physics-author` → `json-author`, every
output written to `docs/loop_runs/lom/<concept>/` and passed to the next stage BY PATH. Then
`quality-auditor` ∥ `eye-walker` in ONE message (two Agent calls) — eye-walker reads every dumped
frame in its own context so the main session never loads ~100 PNGs. A FAIL routes to the ONE named
upstream agent; a `[owner: peter_parker:*]` FAIL is an engine finding and goes through the seam
verify chain above.

Registration, 6 sites per concept (spec §8 — **not** `PCPL_CONCEPTS`, these are field_3d):
`src/data/concepts/<id>.json` · `CONCEPT_PANEL_MAP` · `CONCEPT_RENDERER_MAP` ·
`VALID_CONCEPT_IDS` · `CLASSIFIER_PROMPT` · `supabase_migrations/…_seed_<id>_clusters_migration.sql`.
Plus, for `tension_force` only, the `tension` / `rope_tension` synonym redirect.

Then `npm run visual:eyes -- <id>` and `npm run build:review -- <id>`, and the founder gets
`http://localhost:8091/<id>/` for **all four** sims — `normal_force` and `friction_force` are
rebuilt here too, because they now sit on the same engine code as the new pair.

**`visual:approve` is never run by this session** (Rule 17 — the human is the gate).

## 5. Phase 4 — ship + merge (after explicit founder visual approval)

1. `shipper` per approved concept: `visual:approve` → `tts:generate --langs=en` → `build:review` →
   verify. English-only (Rule 30i); audio is on-demand, not a ship gate (Rule 30h).
2. Merge `feat/lom-e-rolling-tension` → `master`, then **`git push` explicitly** — the managed
   post-commit hook deliberately does NOT auto-push master.
3. `PILOT_CONCEPTS` + `build:pilot` + `deploy:app` ONLY on explicit founder instruction.
