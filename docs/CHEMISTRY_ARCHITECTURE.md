# PhysicsMind → Chemistry — Foundation Architecture — v0.1 (PROPOSAL)

> **Status: PROPOSAL. Produced 2026-07-23 on branch `feat/chemistry-foundation`. Nothing here builds
> or edits anything — this is the reviewable plan per Rule 17 (offline, human-approved).** On founder
> approval, its items flow into the normal authoring pipeline
> (architect → author → json-author → quality-auditor, see `AUTHORING_PIPELINE.md`).
>
> **Thesis in one line:** the factory is already subject-agnostic at its spine — **do NOT duplicate the
> physics stack; extend it.** Chemistry is *content + curriculum plumbing + one new render surface*,
> not a second copy of the pipeline.
>
> **Evidence base:** four read-only architecture passes over the live tree (2026-07-23) covering
> (1) the renderer + concept-data model, (2) the 10-role authoring pipeline, (3) the curriculum/NCERT
> layer, (4) the validation/test/safety layer. Baseline captured green: `npx tsc --noEmit` = 0 errors;
> `npm run validate:concepts` = 124/124 atomic concepts PASS. No files were modified in the analysis.
>
> **Companion docs:** `ARCHITECTURE_v2.2.md` (the v2 architecture + schema) · `AUTHORING_PIPELINE.md`
> (how ONE concept is built) · `CURRICULUM_ARCHITECTURE_PROPOSAL.md` + `CURRICULUM_BUILD_ROADMAP.md`
> (the physics curriculum DAG this mirrors) · root `CLAUDE.md` §5/§6 (pipeline + the 8 registration
> sites) · `src/data/concepts/chemistry/README.md` (the scaffold note this plan fulfils).

---

## 0. Standing decisions respected (stated back for correction)

Carried over from the physics doctrine — flag any that should differ for chemistry:

1. **AI writes DATA, never rendering code** (Rule 5/17/18). Pre-built renderers do all drawing; agents author config only. The Rule 18 floor holds for chemistry: *no un-reviewed generative process decides chemistry a student sees at runtime.*
2. **NCERT = syllabus backbone only** — coverage + sequencing. Real-world anchors authored **universal**, never country-specific (Rule 35). Applies unchanged to chemistry.
3. **EPIC-L-first** — misconceptions confronted inside the linear path (Rule 16a); no EPIC-C branches on new concepts.
4. **Conceptual depth first** — `epic_l_path` only; no exam problem-class sims in V1 (Rule 20 suspended).
5. **Everything ships through the human gate** — AI `quality_auditor` is a cheap pre-flight; the real gate is a teacher (Asmi) reviewing a real lesson (Rule 17).
6. **Plain English only** — never Hinglish.
7. **Isolation is safety** — chemistry concepts live in `src/data/concepts/chemistry/`, and the physics validator's non-recursive scan means they cannot break physics (see §7).

---

## 1. Why this document exists

The scaffold note in `src/data/concepts/chemistry/README.md` says a chemistry renderer and a
`chemistry_author` role "still need to be designed before the first concept lands here." This document
is that design. It answers the founder's three questions directly:

- **"Do we duplicate everything?"** → No. §2 shows most of the factory is already subject-neutral.
- **"Is anything unsafe to start?"** → No; the tree is green and isolation is built-in. §7 + §10.
- **"What are the step-by-step changes?"** → §8, a phased plan that proves the path cheaply first.

The system is a **pipeline that manufactures simulations from data**, not a pile of hand-built sims.
The physics-specificity is not spread evenly — it is concentrated in exactly **two seams** (§3).
Everything else is shared infrastructure that chemistry inherits for free.

---

## 2. The layer map — reuse vs. new work

| Layer | File(s) (representative) | Chemistry verdict |
|---|---|---|
| Concept-JSON schema | `src/schemas/conceptJson.ts` | ✅ **Reuse** — `scene_composition` is free-form; only field *names* say "physics" |
| EPIC-L state machine, `advance_mode` gating | `src/lib/engines/state-machine/`, `TeacherPlayer.tsx` | ✅ **Reuse as-is** |
| Teacher script / TTS (en/hi/te) | `teacher_script` schema, `src/lib/engines/teacher-script/` | ✅ **Reuse as-is** |
| Assessment (MCQ quiz) + coverage map (Gates 19/20) | `conceptJson.ts`, `MCQMode.tsx` | ✅ **Reuse as-is** — subject-agnostic pedagogy |
| Control panels / sliders | `SliderSpec`, `src/lib/engines/interaction/` | ✅ **Reuse as-is** |
| Iframe host + player + `postMessage` contract | `AISimulationRenderer.tsx`, `TeacherPlayer.tsx`, `DualPanelSimulation.tsx` | ✅ **Reuse as-is** — this is the clean plug-in seam |
| Panel-B graph renderer (x-y plots) | `graph_interactive_renderer.ts` | ✅ **Light touch** — titration curves, energy profiles, rate plots are x-y plots |
| Agent roles: `eye_walker`, `retrofit_surgeon`, `shipper`, `feedback_collector` | `.agents/*/CLAUDE.md` | ✅ **Reuse as-is** |
| Agent roles: `json_author`, `quality_auditor`, `runtime_generation` | `.agents/*/CLAUDE.md` | 🟡 **Mechanical reuse** — subject-neutral plumbing; each has one small physics-bound sub-part |
| `architect` role | `.agents/architect/CLAUDE.md` | 🟡 **Framework reuses; needs chemistry pedagogy sources + `docs/patterns/chemistry.md`** |
| `physics_author` role | `.agents/physics_author/CLAUDE.md` | 🔴 **Needs `chemistry_author` sibling** (§4) |
| Renderers + primitives (molecules, bonds, orbitals, apparatus) | `src/lib/renderers/*`, `src/lib/pcplRenderer/*` | 🔴 **New work — the biggest lift** (§5) |
| Gate 3d (E42 physics validator), Gate 13 (animation vocabulary) | `pcplPhysicsValidator.ts`, `animation_vocabulary.ts` | 🔴 **Physics-hardcoded** — build parallel chemistry gates; do NOT edit in place (§7) |
| Curriculum layer — `subject` is not first-class | `src/lib/conceptCatalog.ts`, `src/data/ncert-boundaries.ts`, `src/app/learn/page.tsx` | 🔴 **Plumbing** — make subject first-class; teach the loader to see `chemistry/` (§6) |

**Reading of the map:** the entire orchestration + data spine is reusable. The domain drawing and the
rigor role are net-new. That is the whole story.

---

## 3. The two concentrated physics seams

Everything physics-specific reduces to two places. Naming them precisely is what makes chemistry
tractable:

**Seam A — the rigor author role.** `physics_author` appends force/field/calculus rigor (variables
with units, formulas, per-state motion timeline, constraints). Chemistry needs a sibling that appends
chemistry rigor (balanced equations, mass/charge conservation, stoichiometry, equilibrium & Le
Chatelier, kinetics/rate laws, thermodynamics, oxidation states, bonding & geometry). → §4.

**Seam B — the render/validate engines.** Every live renderer (`field_3d`, `particle_field`,
`mechanics_2d`) and every primitive (`force_arrow`, `vector`, `angle_arc`, field lines) is Newtonian;
the animation vocabulary (`free_fall`, `pendulum`, `atwood`, `projectile`) is mechanics motion; the
E42 validator (Gate 3d) checks force-arrow geometry. Chemistry needs its own primitives, animation
verbs, renderer(s), and a correctness validator. → §5, §7.

The concept-JSON schema, state machine, TTS, quiz, sliders, and player sit *between* these two seams
and are shared. A chemistry concept JSON validates against the schema **today** with zero schema
changes (the schema never constrains primitive `type` values).

---

## 4. Seam A — the `chemistry_author` role

Low-risk clone-and-register (day-scale). Steps, mirroring how `physics_author` is wired:

1. **Author `.agents/chemistry_author/CLAUDE.md`** — sibling of `physics_author`, but its rigor domain
   is chemistry. Output contract = a "chemistry block": quantities-with-units, formulas
   (stoichiometric ratios, K expressions, rate laws, Nernst), constraints (mass/charge balance, valid
   oxidation states), and student-voice drill-down phrases.
2. **`npm run sync:agents`** → emits `.claude/agents/chemistry-author.md` (frontmatter:
   `name/description/model: claude-sonnet-5`). Never edit the emission directly.
3. **Register the role in governance** everywhere `physics_author` appears:
   - roster table `.agents/CLAUDE.md`; pipeline diagram `.agents/README.md`; valid owner-tags in
     `.agents/peter_parker/OVERVIEW.md`.
   - **Two admin-UI enums (must add `alex:chemistry_author` or the app fails to type-check):**
     `src/app/admin/bug-queue/page.tsx` (TS union type) and
     `src/app/admin/bug-queue/BugQueueList.tsx` (`OWNERS` array).
4. **Pipeline wiring:** the chemistry sequence becomes
   `architect → chemistry_author → json_author → quality_auditor`.

**`architect` adaptation (Seam A-adjacent):** the skeleton *framework* (atomic claim, state count,
aha designation, `entry_state_map`, depth rings, Definition of Done) transfers directly. What's
physics-loaded is its content scaffolding — motion-archetype vocabulary, right-hand-rule DoD rows,
`docs/patterns/magnetism.md`, and the HCV/DCP/NCERT-physics source discipline. Cheapest path: keep one
`architect` and give it a chemistry pedagogy-source set + a new `docs/patterns/chemistry.md` +
chemistry-appropriate representation/motion archetypes. Heavier path (defer): a `chemistry_architect`.

---

## 5. Seam B — the chemistry render surface (the biggest lift)

Chemistry renderers plug into the existing seam: a `renderer_pair` name → the renderer switch in
`src/lib/epicStateBuilder.ts` → an isolated code-as-string blob that only has to honor the iframe
`postMessage` contract (`SIM_READY`, `SET_STATE`, `STATE_REACHED`). This boundary already exists;
chemistry slots in at exactly it.

**Phased so we never build the expensive engine before proving we need it:**

- **5a — Reuse first (zero new renderer).** Some foundational chemistry reuses proven physics
  renderers directly — e.g. particle-trajectory (Rutherford α-scattering) reuses the
  `magnetic_force_moving_charge` "force-in-field / particle trajectory" archetype; kinetic-molecular
  gas views reuse the kinetic-theory particle-collision archetype; any x-y relationship (titration,
  energy profile, rate) reuses `graph_interactive_renderer`. **This is the vertical-slice path.**
- **5b — New 2D primitives.** atoms, bonds (single/double/triple), electron-dot/Lewis, reaction &
  equilibrium arrows, beaker/burette/titration apparatus, energy-profile diagrams. Added as new PCPL
  primitives (parallel to `force_arrow` et al.), not by widening the physics set in place.
- **5c — New 3D renderer (`molecule_3d` / `orbital_3d`).** Three.js, analogous to `field_3d` (which is
  a *reference pattern*, not reusable content) — for s/p/d orbitals, VSEPR geometry, lattices/crystals.
  This is the dominant cost and the second wave; it is founder-gated Peter Parker (`renderer_primitives`)
  work. `docs/DISCUSSIONS.md` (Topic 14) already notes the p5 + Plotly + Three.js stack covers the
  chemistry "diamond zones" — the tech exists; the content does not.
- **New animation verbs** in a chemistry vocabulary (bond-forming, electron-transfer, molecular
  vibration, dissolution) — parallel to `animation_vocabulary.ts`, never folded into the physics list.

---

## 6. Curriculum-layer changes (make `subject` first-class)

Today `subject` is **not** a structural dimension — the catalog is organized/filtered only by
`class_level`, `/learn` hardcodes "Learn Physics", and the loader `loadLiveConceptsFromJsons()` reads
`src/data/concepts/` **flat**, so the `chemistry/` subfolder is silently invisible to users.

Minimal plumbing to make chemistry visible:

1. **Add `subject: 'physics' | 'chemistry'`** to `CatalogConcept`, `CatalogChapter`, `GhostSeed`
   (`src/lib/conceptCatalog.ts`); route/filter by **(subject × class_level)**.
2. **Teach the loader to discover chemistry JSONs** — recurse into `src/data/concepts/chemistry/`
   (a tagged second scan, so the physics flat-scan stays byte-identical — see §7).
3. **Namespace chapter tables by subject** — `CHAPTER_NAMES`/`SECTION_NAMES`/`GHOST_CONCEPTS` are keyed
   by bare chapter number and collide across subjects; key by `(subject, number)` and split into
   per-subject seed files so the two teams don't edit one file (the README's concurrency rationale).
4. **Add chemistry to `NCERT_BOUNDARIES`** (`src/data/ncert-boundaries.ts`) for LLM board/competitive
   scope prompts.
5. **UI/profile:** un-hardcode "Learn Physics" in `src/app/learn/page.tsx`; add a subject selector;
   consider a `subject` field on `StudentProfile`/onboarding.
6. **Reuse the existing per-concept `curriculum_tags`** (free-text `curriculum` + `syllabus_unit`,
   `conceptJson.ts` lines ~297–317) to carry "NCERT Class 11 Chemistry — Unit N" claims — **no schema
   change**, and it already carries `needs_teacher_verification`.

---

## 7. Validation & safety

**The isolation guardrail (why chemistry cannot break physics):** `validate-concepts.ts` scans
`src/data/concepts/` **non-recursively** (`readdirSync(...).filter(f => f.endsWith('.json'))`). Files
inside `src/data/concepts/chemistry/` are invisible to the physics validation run. Treat "no recursion
into the flat `concepts/` dir" as a **contract** — lock it with a comment and, ideally, a test.

**Rules for keeping physics green:**

- **Keep every chemistry JSON inside `src/data/concepts/chemistry/`.** The flat dir's Zod schema
  *mandates* `physics_engine_config` + `renderer_pair` (`conceptJson.ts:330–331`); a chemistry file
  dropped flat would be validated as physics and trip the fleet-wide registration gate (Gate 8b).
- **Do NOT edit shared physics gates in place** — `ANIMATION_TYPES`, `MATH_WHITELIST`,
  `FORBIDDEN_TOKENS`, or the E42 validator. Build a **parallel chemistry schema + `validate:chemistry`
  script** instead. The renderer switch and the animation whitelist must stay in lock-step for physics.
- **Don't touch the shared registries** (`VALID_CONCEPT_IDS`, `PCPL_CONCEPTS`, `CONCEPT_PANEL_MAP`,
  `CONCEPT_RENDERER_MAP`) until the chemistry renderer + routing exist — Gate 8b is all-or-nothing, so
  a half-registered concept fails the entire physics run.
- **Chemistry needs its own correctness gate** to replace physics-only Gate 3d/E42 — equation
  balancing, conservation of mass/charge, valid oxidation states.
- **Chemistry needs its own visual gate.** THE EYE → `eye_walker` path and the §5.6 physics-sanity
  checks are field_3d/physics-specific; design a chemistry equivalent before authoring (§14 discipline:
  fix the root cause in prompt/renderer/engine, never hand-patch one JSON).
- **Close the automation gap:** there is no pre-commit/CI enforcement of `tsc`/`validate` today (the
  only git hook checks agent-sync and isn't even installed). Add `npx tsc --noEmit` +
  `npm run validate:concepts` to CI/pre-commit so a leaked chemistry change is caught before it lands.

---

## 8. The phased build plan

Ordered to **prove the path cheaply before building the expensive engine**, matching the physics
doctrine (finish thin vertical slices; treat the 3D renderer as a gated second wave).

| Phase | Goal | Scope | Risk |
|---|---|---|---|
| **0 — Safety baseline** | Known-good starting line | Record green baseline (tsc 0, validate 124/124); `npm ci` to clean `package-lock.json`; lock the "no recursion" isolation contract | none |
| **1 — Curriculum plumbing (minimal)** | Make chemistry *visible* | `subject` first-class; loader recurse into `chemistry/`; chemistry `NCERT_BOUNDARIES`; un-hardcode "Learn Physics" | low |
| **2 — `chemistry_author` role** | Stand up Seam A | Clone spec, `sync:agents`, register in roster + 2 admin enums; wire pipeline sequence | low (day-scale) |
| **3 — First concept (vertical slice)** | Prove end-to-end on a **reused** renderer (§5a) | One NCERT Cl.11 Ch.2 concept authored through architect → chemistry_author → json_author → quality_auditor → THE EYE → teacher | medium |
| **4 — Chemistry validator + visual gate** | Domain correctness | Parallel `validate:chemistry` + chemistry-correctness gate + chemistry visual-audit path | medium |
| **5 — Dedicated chemistry renderer** | Seam B, second wave | Three.js `molecule_3d`/`orbital_3d` + new 2D primitives + chemistry animation verbs (founder-gated) | high (biggest lift) |

Phases 0–2 are safe, mechanical, and unblock authoring. Phase 3 is the milestone that de-risks the
whole subject. Phase 5 is only justified once Phase 3 proves demand.

---

## 9. First concept — candidates (decision deferred, to choose together)

Anchor (per `docs/DISCUSSIONS.md` Topic 14): chemistry "diamonds" lead with **physical chemistry**;
NCERT **Class 11, Chapter 2 "Structure of Atom"** is the foundational, most-simulatable entry.

| Candidate | NCERT | Why | Engine cost |
|---|---|---|---|
| **Rutherford α-scattering** | Cl.11 Ch.2 | Particle-trajectory deflection; reuses the proven force-in-field archetype; cheapest proof of the whole path; historical lead-in to Bohr | **~0 (reuse §5a)** |
| **Bohr model / energy levels** | Cl.11 Ch.2 | Iconic atomic visual — quantized orbits + absorption/emission on level jumps; memorable payoff | low |
| **Atomic orbitals (s/p/d)** | Cl.11 Ch.2 | The true chemistry-distinctive 3D visual; foundational to all bonding downstream | **high (needs §5c)** |
| Covalent bonding & VSEPR | Cl.11 Ch.4 | Core 3D diamond (bond angles, lone-pair repulsion) | high (needs §5c) |
| Kinetic-molecular gas view | Cl.11 | Reuses kinetic-theory archetype; 2D-friendly | low — but ⚠ verify against the rationalised 2023+ syllabus |

*Not recommended first:* mole concept / stoichiometry (Cl.11 Ch.1) — most foundational numerically but
weakly simulatable (counting/ratio, not motion).

**Recommendation:** lead the vertical slice (Phase 3) with **Rutherford α-scattering** (or **Bohr
model**), reserving orbitals/VSEPR for the second wave that justifies building the 3D renderer.
**This choice is intentionally left open — to be decided together before Phase 3.**

---

## 10. Pre-flight safety checklist (before any chemistry work)

1. ✅ **Baseline green** — verified 2026-07-23: `tsc` 0 errors, `validate:concepts` 124/124 PASS. This
   is the regression tripwire; the count must stay 124 after every chemistry change.
2. **`npm ci`** — reconcile the dirty `package-lock.json` so the baseline is byte-clean.
3. **Isolation contract** — all chemistry JSONs in `src/data/concepts/chemistry/`; never the flat dir.
4. **No edits to shared physics gates/registries** — parallel chemistry files only (§7).
5. **Plan the chemistry validator + visual gate before the first concept lands** (§7).
6. **Add tsc + validate to CI/pre-commit** to close the automation gap (§7).

---

## 11. Open decisions & immediate next action

**Open (founder/team):**
- First concept for the Phase-3 slice (§9) — recommendation: Rutherford α-scattering.
- One `architect` with chemistry sources vs. a `chemistry_architect` (§4) — recommendation: one, for now.
- How much of Phase 1 curriculum plumbing to do now vs. defer until a concept renders.

**Immediate next action on approval:** Phase 0 (safety baseline) + Phase 2 (`chemistry_author` role),
both safe and mechanical, then choose the Phase-3 concept together and author the first vertical slice.

*This document builds nothing. It makes chemistry buildable.*
