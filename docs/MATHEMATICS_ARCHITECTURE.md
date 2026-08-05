# PhysicsMind → Mathematics — Foundation Architecture — v1.0

> **Status: FOUNDATION AS-BUILT + design. Produced 2026-08-04 on branch `feat/mathematics-foundation`.**
> Third subject, opened on the founder's directive to build it **the way chemistry was built** —
> intersection-first across Indian and international curricula, not NCERT-only the way physics is.
>
> **Thesis in one line:** the factory is subject-agnostic at its spine and has now proven it twice —
> **do NOT duplicate the stack; extend it.** Mathematics is *content + curriculum plumbing + one
> foundational render scenario*, not a third copy of the pipeline.
>
> **Evidence base:** a read-only pass over the live tree at `origin/master` (2026-08-04, synced —
> the local checkout was 128 commits stale and was fast-forwarded before measuring). Baseline
> captured green: `npx tsc --noEmit` = 0 errors · `npm run validate:concepts` = **149/149** ·
> `npm run validate:chemistry` = **10/10** · `npm run check:agents` = 14/14 · `npm test` = 327/327.
>
> **Companion docs:** `docs/MATHEMATICS_DISCUSSIONS.md` (the whiteboard test applied + the ranked
> list — **read this first**) · `docs/MATHEMATICS_BUILD_PLAN.md` (phase mechanics) ·
> `docs/patterns/mathematics.md` (architect pattern library) · `docs/CHEMISTRY_ARCHITECTURE.md`
> (the precedent this re-runs) · root `CLAUDE.md` §5/§6.

---

## 0. Standing decisions respected (stated back for correction)

Carried from physics + chemistry doctrine — flag any that should differ for mathematics:

1. **AI writes DATA, never rendering code** (Rules 5/17/18). Pre-built renderers do all drawing.
   The Rule 18 floor holds: *no un-reviewed generative process decides mathematics a student sees at
   runtime.*
2. **Real-world anchors authored UNIVERSAL** (Rule 35) — no country-specific culture in any rendered
   or narrated string.
3. **EPIC-L-first** (Rule 16a) — misconceptions confronted inside the linear path, no EPIC-C branches.
4. **Conceptual depth only** — `epic_l_path` only; Rule 20 (board/competitive overrides) stays suspended.
5. **Everything ships through the human gate** (Rule 17) — `quality_auditor` is a cheap pre-flight;
   the real gate is a teacher reviewing a real lesson.
6. **Plain English only** (Rule 41) — basic, literal register in every reader-facing string.
7. **Isolation is safety** — mathematics concepts live in `src/data/concepts/mathematics/`, invisible
   to the physics validator's non-recursive scan (§5).
8. **Rule 38 is the curriculum mechanism** — depth rings + `curriculum_tags` as claims. This is what
   "easy → intermediate → advanced across both syllabi" means concretely, and it is already law.

---

## 1. What is genuinely new, and what is not

The physics-specificity of this factory is concentrated in **two seams** (`CHEMISTRY_ARCHITECTURE.md`
§3). Chemistry proved the framing by fitting into it. Mathematics fits the same two seams:

**Seam A — the rigor author role.** `physics_author` appends force/field/calculus rigor with units on
every quantity. `chemistry_author` appends balanced equations and conservation. Mathematics needs a
sibling that appends **domain/validity rigor**: where a relation is defined, where it fails, what a
theorem's hypotheses actually are. → §3.

**Seam B — the render surface.** → §4. **This is the whole cost of mathematics**, and unlike the
chemistry estimate it was measured before it was scheduled.

Everything between the seams — concept JSON schema, the EPIC-L state machine, `advance_mode` gating,
`teacher_script`/TTS, assessment + coverage map, sliders and the interaction engine, the iframe host
and the `postMessage` contract, THE EYE and `eye_walker`, `retrofit_surgeon`, `shipper`, `git_steward`,
`founder_proxy` — is subject-neutral and inherited at zero cost.

### The layer map

| Layer | File(s) | Mathematics verdict |
|---|---|---|
| Concept-JSON schema | `src/schemas/conceptJson.ts` | ✅ **Reuse unchanged** — `scene_composition` is free-form; the schema never constrains primitive `type` values. `physics_engine_config` is a legacy *name* over a subject-neutral shape (variables / formulas / constraints); renaming stays deferred, as it was for chemistry. |
| EPIC-L state machine, `advance_mode` | `src/lib/engines/state-machine/`, `TeacherPlayer.tsx` | ✅ Reuse as-is |
| `teacher_script` / TTS | `teacher_script` schema, `generate_tts_audio.ts` | ✅ Reuse as-is (English-only, Rule 30i; audio on-demand, Rule 30h) |
| Assessment + coverage map (Gates 19/20) | `conceptJson.ts` | ✅ Reuse as-is — subject-agnostic pedagogy |
| Sliders / interaction | `SliderSpec`, `src/lib/engines/interaction/` | ✅ Reuse as-is |
| Iframe host + `postMessage` | `AISimulationRenderer.tsx`, `TeacherPlayer.tsx` | ✅ Reuse as-is — the clean plug-in seam |
| Curriculum layer (`subject` routing) | `src/lib/conceptCatalog.ts`, `src/types/student.ts` | ✅ **Already generic** — chemistry made `subject` first-class; mathematics is a third branch in `sourcesFor()`, not new architecture |
| Shared CLI resolver | `src/scripts/lib/resolveConceptJson.ts` | 🟡 **Widen 2-way → N-way** (§5) |
| Validator | `src/scripts/validate-chemistry.ts` | 🟡 **Extract shared gates**, then a thin `validate-mathematics.ts` (§6) |
| Agent roles: `architect`, `json_author`, `quality_auditor`, `eye_walker`, `shipper`, … | `.agents/*/CLAUDE.md` | ✅ Reuse — `architect` gains `docs/patterns/mathematics.md` (the chemistry pattern, §3) |
| `physics_author` / `chemistry_author` | `.agents/*/CLAUDE.md` | 🔴 **Needs a `mathematics_author` sibling** (§3) |
| Render surface | `src/lib/renderers/*` | 🔴 **One foundational scenario — `cartesian_plane`** (§4) |
| Physics-only gates (E42, mechanics animation vocabulary) | `pcplPhysicsValidator.ts`, `animation_vocabulary.ts` | 🔴 **Never edit in place** — excluded from the mathematics validator, exactly as for chemistry |

**Reading of the map:** one author role and one render scenario. That is the whole story — and it is
a *smaller* story than chemistry's was, because chemistry already paid for the subject plumbing.

---

## 2. Curriculum position — intersection-first (the founder's directive)

Physics is authored NCERT-first. **Mathematics follows chemistry: concepts are selected by what
Indian *and* international curricula both teach.** The mechanics:

- **Selection** — the ranked list in `docs/MATHEMATICS_DISCUSSIONS.md` §6, ordered by
  `(irreplaceability tier) × (intersection breadth) ÷ (renderer dependency)`.
- **Within a concept** — Rule 38 depth rings: `core` (qualitative picture) → `extended`
  (quantitative law) → `advanced` (derivation / formal notation), the advanced ring a contiguous
  block before the explore state, **both reduced cuts verified coherent by the architect**.
- **Coverage claims** — `curriculum_tags` per concept, one entry per board, `full | partial | absent`
  + syllabus-unit label. **Only CBSE/NCERT may be `verified: true`** (Rule 38g); every other board
  ships `needs_teacher_verification: true` and no preset is teacher-visible until confirmed.
- **Notation ladder (38c, mathematics form)** — core and extended states carry algebraic and
  geometric forms only. Formal limit notation (ε-δ, `lim` with a formal definition), vector-operator
  and integral-sign machinery, and proof-by-induction structure live on `advanced` states only. If
  the mathematics genuinely needs them below the advanced ring, **FLAG** — never smuggle.

**Design decision — NCERT numbering stays the filing system.** `chapter` + `section` on every concept
JSON is the catalog's structural key (`conceptCatalog.ts`), and physics + chemistry both key on it.
Intersection-first governs **which concepts get built and in what order**; `curriculum_tags` carry the
international coverage claims; `depth_ring` carries the cut points. Inventing a second filing system
keyed on IB/AP units would fork the catalog layer for no gain and is explicitly rejected.

---

## 3. Seam A — the `mathematics_author` role

Low-risk clone-and-register, mirroring `chemistry_author` exactly. Pipeline for mathematics concepts:

```
architect → mathematics_author → json_author → quality_auditor
```

with `founder_proxy` at Checkpoints A/B/C unchanged, and all eight hard rules in `.agents/CLAUDE.md`
applying as written.

**The rigor domain — what replaces chemistry's balanced-equation ledger.** Chemistry's failure mode
is a visual that violates conservation. Mathematics' failure mode is different and needs naming:
**a statement that is true on the drawn interval and false off it, or a theorem applied outside its
hypotheses.** The role's central artifact is therefore a **domain & validity ledger**: for every
relation the concept displays — its domain, its range, the excluded points, the interval actually
drawn, and the behaviour at each boundary; for every "for all x" claim — the theorem named, with its
hypotheses stated and checked against what the sim shows.

**Quantities are unitless.** The `physics_author` discipline of "every quantity carries a unit,
never a bare number" is explicitly *replaced*, not inherited — a mathematics variable is a pure
number with a domain, and inheriting the units checklist would misfire on every concept.

Full spec: `.agents/mathematics_author/CLAUDE.md`. Registration surface (all of it, or the role is
half-real): canonical spec → `scripts/sync-agents.js` `ROLES` → emission `.claude/agents/mathematics-author.md`
→ `.agents/CLAUDE.md` roster + addendum → `.agents/README.md` pipeline diagram →
`.agents/peter_parker/OVERVIEW.md` owner tags → **both** admin bug-queue enums → **the DB migration**
(§7).

**`architect` adaptation.** One architect serves all three subjects, as decided for chemistry. It
gains `docs/patterns/mathematics.md` (representation lens, motion archetypes, the three-tier
LIVE/NEEDS-SCENARIO/PHASE-5 discipline) and mathematics source roles: **NCERT Mathematics = syllabus
backbone (coverage + sequencing, chapter indexes only)**; **NCERT Exemplar = misconception belief
source (belief only)**; international specifications (IB subject guide, AP CED, Cambridge syllabus)
consulted **for scope and coverage claims only**. HC Verma and DC Pandey are physics-only and do not
apply. Teaching method, examples and anchors are authored from first principles.

---

## 4. Seam B — the render surface (measured, not surveyed)

Full measurement in `docs/MATHEMATICS_DISCUSSIONS.md` §3. The findings that drive the build:

1. **`build_review_site.ts:3603` ships exactly three engine families** — `field_3d_config`,
   `particle_field_config`, `physics_engine_config` (PCPL/parametric).
2. **`graph_interactive_renderer.ts` is a real Plotly plotter but is NOT a teacher-product surface** —
   it is named as `panel_b` on 48 shipped physics concepts and the review builder has no panel-B
   branch at all. It cannot carry a mathematics concept.
3. **The PCPL `axes` primitive is not a graph** — `drawAxes` (`parametric_renderer.ts:2668`) is two
   labelled arrows: no grid, no ticks, no numeric scale, no data↔pixel transform.
4. **PCPL `locus_trace` already traces an arbitrary curve that responds live to a slider**
   (`:2356` sampling through `PM_choreoVarsAtTime`, `:2311`, which merges live slider values under the
   drag-seize guard). Capability 2 works on the shipped engine today — what is missing is the *frame*.
5. **The 3D half is near-free** — `field_3d_renderer.ts` carries the vector / arrow / plane machinery
   built for magnetism (193 occurrences of `crossProduct`/`PlaneGeometry`/`ArrowHelper`).

**Rule 40a sweep, 1062 commits, all branches:** 0 hits for `cartesian_plane`, `function_plot`,
`graph_paper`, `axis_ticks`, `riemann`, `secant_slope`, `tangent_line`, `solid_of_revolution`,
`unit_circle`, `argand`, `slope_field`, `sampling_box`. Nothing is being built twice.

### The one build: `cartesian_plane`

A `parametric` (PCPL) scenario — **a new CASE, not a new FILE**, which is the explicit lesson
`docs/patterns/chemistry.md` records against `CHEMISTRY_ARCHITECTURE.md` §5c. Required capability set,
derived from the union of P1 concepts #1/#2/#3 and P3 #11/#12:

- axes with a declared data range, numeric ticks, gridlines and a data↔pixel transform (so authored
  expressions stop carrying hand-computed scale factors);
- `y = f(x)` plotted across the range, re-evaluated live against slider values;
- a movable point on the curve with a live coordinate readout (Rule 33d — real numbers, never a
  decorative marker);
- secant/tangent line through one or two curve points;
- shaded region under a curve, and an n-rectangle Riemann partition with a live sum;
- multi-curve overlay for a before/after contrast beat (Rule 16a).

**Discipline:** lands on **master separately and immediately** (Rule 40), one `bug_class` per
dispatch, with its own headless gate (`npm run check:cartesian-plane`, negative controls on every
section — the `check:sigma-pi` / `check:hybrid-orbitals` pattern) and a Phase-0 survey first on the
`docs/CHEMISTRY_PHASE0_BONDING.md` model. **No mathematics concept desk opens until it is on master.**

Everything else on the ranked list is `field_3d` reuse or `parametric` **[LIVE]** today.

---

## 5. Isolation & safety

**The guardrail (why mathematics cannot break physics or chemistry):** `validate-concepts.ts` scans
`src/data/concepts/` **non-recursively** by design. Files inside `mathematics/` are invisible to it,
exactly as `chemistry/` is. Treat "no recursion into the flat `concepts/` dir" as a permanent contract.

**Rules for keeping the other two subjects green:**

1. **Every mathematics JSON lives in `src/data/concepts/mathematics/`** — never the flat dir, whose
   Zod schema mandates `physics_engine_config` + `renderer_pair` and whose fleet-wide registration
   gate (8b) is all-or-nothing.
2. **Never edit shared physics gates in place** — `ANIMATION_TYPES`, `MATH_WHITELIST`,
   `FORBIDDEN_TOKENS`, the E42 validator. Parallel mathematics files only.
3. **Do not touch the shared registries** (`VALID_CONCEPT_IDS`, `PCPL_CONCEPTS`, `CONCEPT_PANEL_MAP`,
   `CONCEPT_RENDERER_MAP`) until a mathematics serving path exists. Gate 8b is all-or-nothing.
4. **Concept ids are ONE namespace across all three subjects**, even though the directories are
   separate. `resolveConceptJsonPath` widens from a 2-way to an **N-way** check and keeps its loud
   throw — this matters more for mathematics than it did for chemistry, because mathematics ids are
   the most collision-prone of the three (`vectors`, `circle`, `limits`, `work` all already have
   physics senses; `dynamic_equilibrium` is the recorded near-miss between physics and chemistry).
5. **CI from day one.** Chemistry ran five sessions with **no CI coverage at all** because
   `validate:concepts` never sees a subfolder — a broken chemistry concept passed the whole workflow
   green until `validate:chemistry` was added to `verify.yml` on 2026-07-28. Mathematics gets its CI
   step in the same commit as its validator.

---

## 6. Validation

**`npm run validate:mathematics`** — scans only `src/data/concepts/mathematics/`. An empty namespace
is a PASS (0 files scanned), so it is green from the first commit and safe in CI before any concept
exists.

**Shared gates are extracted, not copied.** `validate-chemistry.ts` was ~85% subject-neutral. Those
gates moved to **`src/scripts/lib/conceptGates.ts`** and both validators now import them:
`statesOf` · `countWords` · `wordBudgetWarnings` (Rule 31a) · `indicatorBindingErrors` ·
`choreoEndMs` + `narrationChoreographyWarnings` (Rule 31a inversion) · `duplicateKeyErrors`.
Every explanatory comment moved verbatim — each records a real defect and is the reason its gate
exists. The chemistry-specific `gasPopulationErrors` stayed chemistry-local.

**Why extraction rather than a copy:** `duplicateKeyErrors` exists because an authored fix was
silently discarded by JSON last-key-wins and passed `tsc`, the validator **and** a 39/39 THE EYE run
(`validate-chemistry.ts` header). A gate with that history must not be forked into two divergent
copies. Proof of safety: `npm run validate:chemistry` output captured before the move and diffed
after — **byte-identical**, the same technique chemistry Phase 1 used to prove the physics catalog
unchanged.

**Mathematics-specific gates start empty by design** and grow from the `engine_bug_queue` scar list,
per house discipline — a gate is earned by a defect, never anticipated. The two already named as
candidates: an **interval-honesty** gate (a curve drawn over `[a,b]` whose caption claims "for all x")
and a **notation-ladder** gate (Rule 38c — formal limit/integral notation appearing on a core or
extended ring state).

---

## 7. The DB migration — the trap chemistry fell into, pre-corrected

`supabase_migrations/supabase_2026-07-24_engine_bug_queue_chemistry_subject_migration.sql:13` records
it: chemistry Phase 2 added `alex:chemistry_author` to the two admin-UI enums but **never migrated the
`owner_cluster` CHECK constraint**, so the UI offered an owner the database rejected on write. Latent
for days, and it cost a later session a wrong diagnosis in its scar rows.

Mathematics therefore ships its migration in the same commit as its role:
`supabase_migrations/supabase_2026-08-04_engine_bug_queue_mathematics_subject_migration.sql` —
restates the full `owner_cluster` list plus `'alex:mathematics_author'` (a CHECK cannot be extended
in place) and widens the `subject` CHECK from `('physics','chemistry','subject_neutral')` to include
`'mathematics'`.

**Carried forward from that file, because it is easy to get backwards:** the **DB list is
authoritative over the admin `OWNERS` array**, not the other way round — the UI array has dropped
`peter_parker:visual_validator` while 39 live rows still use it. Never sync the CHECK *to* the UI.

Applying the migration is a founder action; the file ships ready.

---

## 8. What this foundation does NOT do

- No concept is authored. No renderer or scenario code is written.
- No `/learn` subject toggle — it can show nothing until a live mathematics concept exists, the same
  reason chemistry deferred it.
- No edits to `VALID_CONCEPT_IDS` / `PCPL_CONCEPTS` / `CONCEPT_PANEL_MAP` / `CONCEPT_RENDERER_MAP`.
- No edits to `validate-concepts.ts` or any physics gate.
- **`CLAUDE.md` is not edited** — the proposed §1/§5/§6 deltas are drafted in `PROGRESS_MATHEMATICS.md`
  and applied only on explicit founder approval (`CLAUDE.md` §9).

*This document builds nothing. It makes mathematics buildable.*
