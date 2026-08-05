# PROGRESS_MATHEMATICS.md — PhysicsMind Mathematics Build

> Dedicated mathematics build log (sibling of `PROGRESS.md`, the physics/engine log, and
> `PROGRESS_CHEMISTRY.md`). Newest session first. Mathematics work started 2026-08-04 on branch
> `feat/mathematics-foundation`.
>
> **Companion docs:** `docs/MATHEMATICS_DISCUSSIONS.md` (the whiteboard test applied + THE RANKED
> LIST — read first; nothing is authored off it) · `docs/MATHEMATICS_ARCHITECTURE.md` (design —
> extend, don't duplicate) · `docs/MATHEMATICS_BUILD_PLAN.md` (phase mechanics + tracker) ·
> `docs/patterns/mathematics.md` (architect pattern library) ·
> `.agents/mathematics_author/CLAUDE.md` (the rigor role).

## Phase status

| Phase | Name | Status |
|---|---|---|
| 0 | Safety baseline | ✅ 2026-08-04 |
| A | Ranked diamond list (BLOCKING gate) | ✅ 2026-08-04 |
| 2 | Authoring layer (`mathematics_author` + pattern library + DB migration) | ✅ 2026-08-04 |
| 1 | Curriculum plumbing (subject first-class) | ✅ 2026-08-04 |
| 2.5 | `validate:mathematics` + shared-gate extraction + CI | ✅ 2026-08-04 |
| P0 | **`cartesian_plane` scenario** (engine; master, Rule 40) | ☐ **BLOCKS ranked P1 #1–#3** |
| 3 | First concept — vertical slice | ☐ recommendation: the unit circle (P1 #4, [LIVE] surface, zero engine spend) |
| 4 | Mathematics-specific gates | ☐ (grow from scars) |
| 5 | Further scenarios (3D solids, sampling box) | ☐ founder-gated |

**Mathematics is a first-class subject in the tooling. No concept is authored, and one is not
buildable off-list.**

---

## 📐 SESSION — Mathematics opened as the third subject: the foundation, the ranked list, and the finding that the most fundamental maths visual does not exist (2026-08-04, branch `feat/mathematics-foundation`)

> Founder directive: open mathematics **the way chemistry was opened** — intersection-first across
> Indian and international curricula rather than NCERT-only like physics — with each sim's states
> ordered easy → intermediate → advanced so one file serves every syllabus. Scope agreed up front:
> **foundation only, no concept authored**, with a **blocking ranked diamond list** deciding what may
> ever be authored, and **one new agent** (`mathematics_author`).

### Bottom line

The subject is buildable end-to-end in the tooling — role, pattern library, ranked list, subject
plumbing, validator, CI step and DB migration — and the whole of it is provably invisible to physics
and chemistry. Three findings drove the shape of it, and the third changed the plan.

**1. The founder's "easy → intermediate → advanced across both syllabi" mechanism already exists as
law.** It is **Rule 38** (`CLAUDE_RULES.md:63`): `depth_ring: core | extended | advanced`, the
advanced ring contiguous before the explore state, both reduced cuts required to stay coherent, the
notation ladder, and `curriculum_tags` as claims (38g). Proven on `capacitance` and shipped on all ten
chemistry concepts. **Mathematics needed no new rule** — it needed the ranked list and an author role
that applies Rule 38 to maths. Nothing was invented that already existed.

**2. Mathematics is the harshest subject the whiteboard test has ever been applied to.** More than
half of school mathematics is *better* on a board — a board with chalk is the medium the subject was
designed around, so a maths sim justifies itself against a stronger incumbent than a chemistry sim
did. The demo tier is written down explicitly in `MATHEMATICS_DISCUSSIONS.md` §5 (algebra, sequences,
identities, matrix arithmetic, counting, mensuration) so it is not re-proposed.

**3. THE LOAD-BEARING FINDING, made before any code: the single most fundamental mathematics visual —
a coordinate plane with numeric axes and a curve that responds to a slider — does not exist in any
renderer the teacher product can ship.** This was measured, not surveyed, and it **corrects the
working hypothesis** that maths would be the cheapest subject on engine cost. It is the cheapest in
its geometry half and blocked in its graphing half.

- `build_review_site.ts:3603` ships exactly three engine families: `field_3d_config`,
  `particle_field_config`, `physics_engine_config` (PCPL/parametric).
- **`graph_interactive_renderer.ts` is a real Plotly plotter that is NOT one of them.** It is named
  as `renderer_pair.panel_b` on **48 shipped physics concepts**, and the review builder has no
  panel-B branch at all. On 48 concepts this is authored metadata the teacher product never renders.
  Same class as the filed chemistry scar `review_site_missing_renderer_family_branch`. **Pre-existing,
  not a mathematics regression** — surfaced by this survey, filed as a founder call.
- The PCPL `axes` primitive (`parametric_renderer.ts:2668`) is two labelled arrows: no grid, no
  ticks, no numeric scale, no data↔pixel transform. It is a free-body-diagram orientation indicator
  inherited from physics.
- **But PCPL `locus_trace` already traces an arbitrary curve that responds live to a slider**
  (`:2356`, sampling via `PM_choreoVarsAtTime` `:2311`, which merges live slider values under the
  drag-seize guard). Capability 2 works on the shipped engine today; what is missing is the *frame*.
- The 3D half is near-free: `field_3d_renderer.ts` carries 193 occurrences of
  `crossProduct`/`PlaneGeometry`/`ArrowHelper` from magnetism, directly reusable.

**Rule 40a sweep** (`git fetch origin` + `git log --all -S`, 1062 commits, all branches): **0 hits**
for `cartesian_plane`, `function_plot`, `graph_paper`, `axis_ticks`, `riemann`, `secant_slope`,
`tangent_line`, `solid_of_revolution`, `unit_circle`, `argand`, `slope_field`, `sampling_box`.
Nothing is being built twice.

**Consequence:** one foundational scenario, **`cartesian_plane`**, gates the front of the ranked list
and must land on master separately (Rule 40) before any concept desk opens. It is a new CASE on the
existing parametric renderer, not a new file — the explicit lesson `docs/patterns/chemistry.md`
records against `CHEMISTRY_ARCHITECTURE.md` §5c, which named a new FILE where a new CASE would do and
cost two waves of scheduling.

### The curriculum answer (the founder's specific ask)

Ordering formula changed from chemistry's to reflect the directive:
`(irreplaceability tier) × (INTERSECTION BREADTH) ÷ (renderer dependency)`, scored across
**CBSE · ICSE/ISC · JEE · IB DP · AP · Cambridge IGCSE · A-level**. Full table:
`MATHEMATICS_DISCUSSIONS.md` §4.

**What it says, and it is not what an Indian-only ranking would say:** the widest Indian ∩
international overlap is **the calculus core + graph behaviour + probability**. Coordinate geometry of
the straight line, sequences and series, and matrix algebra all rank high in CBSE/JEE and fail either
the intersection test, the whiteboard test, or both.

- **Graph transformations is the highest-value single concept in school mathematics by intersection
  breadth — 7/7, every board, every level** — and it is pure Capability 2.
- **3D coordinate geometry is the mirror image:** strong CBSE/JEE/IB-HL, **absent from AP and
  IGCSE**. A JEE/CBSE depth play, built deliberately for that audience, never by momentum (Rule 38f).

### What shipped

**Docs (4 new).** `docs/MATHEMATICS_DISCUSSIONS.md` (whiteboard test applied · four-capability
scoring · measured renderer reality-check · intersection table · demo tier · THE RANKED LIST) ·
`docs/MATHEMATICS_ARCHITECTURE.md` · `docs/MATHEMATICS_BUILD_PLAN.md` · `docs/patterns/mathematics.md`
(archetypes A–I, three-tier LIVE/NEEDS-SCENARIO/PHASE-5, maths motion-archetype vocabulary, and seven
authoring hazards seeded from the sibling subjects' scars).

**The agent.** `.agents/mathematics_author/CLAUDE.md` + emission (`check:agents` 14 → **15/15**).
Its central artifact is the **domain & validity ledger** — chemistry's failure mode is a visual that
violates conservation; mathematics' is *a statement true on the interval drawn and false off it, or a
theorem applied outside its hypotheses*. Also: **quantities are UNITLESS**, so the `physics_author`
units checklist is explicitly *replaced*, not inherited (it would misfire on every concept).
Registered in `.agents/CLAUDE.md` (roster + hard-rules addendum + role count 14→15),
`.agents/README.md`, `.agents/peter_parker/OVERVIEW.md`, both admin bug-queue enums, and
`scripts/sync-agents.js`.

**The DB migration, shipped WITH the role — the chemistry trap pre-corrected.** Chemistry's Phase 2
added `alex:chemistry_author` to the two UI enums and never migrated the `owner_cluster` CHECK, so
the UI offered an owner the database rejected on write; latent for days, and it went on to cost a
later session a *wrong diagnosis* in its scar rows. `supabase_2026-08-04_engine_bug_queue_mathematics_subject_migration.sql`
adds `alex:mathematics_author` and widens `subject` to include `'mathematics'`. **Not applied —
applying is a founder action.**

**Subject plumbing.** `Subject` union · `src/lib/mathematicsCatalog.ts` · third `sourcesFor()` branch ·
`src/data/concepts/mathematics/` + README · N-way `resolveConceptJsonPath` ·
`NCERT_MATHEMATICS_BOUNDARIES` · `SUBJECT_LABEL`.

**Validator + CI.** Subject-neutral gates extracted **by move** into `src/scripts/lib/conceptGates.ts`
(word budget · indicator binding · duplicate-key scanner · narration-vs-choreography), shared by
chemistry and mathematics; `gasPopulationErrors` stayed chemistry-local. `validate-mathematics.ts` +
`package.json` script + **a `verify.yml` step in the same commit** — chemistry ran four concepts deep
across five sessions with *no CI coverage at all*, because `validate:concepts` cannot see a subfolder.

### THE LESSON: the probe found a data-corruption bug no gate could have

Walking the mathematics catalog tree by hand — not any validator — surfaced this:
**`conic_sections_as_loci` appeared under a chapter titled "Vector Algebra".**

`byChapter` in `conceptCatalog.ts` was keyed by the **bare chapter number**. NCERT mathematics
numbering restarts each class, so Cl.11 Ch.10 (Conic Sections) and Cl.12 Ch.10 (Vector Algebra)
collided: whichever arrived second found the first's `CatalogChapter` and silently appended to it. No
error, no warning, a plausible-looking tree.

**The first fix was wrong, and being wrong is what found the real invariant.** Keying every subject by
`(class_level, chapter)` moved physics output. Measurement explained why: **physics chapters 1, 2, 5,
6, 7 and 8 all legitimately carry BOTH Class-11 and Class-12 concepts**, because physics numbering is
a single DC Pandey sequence that is *global to the subject* — "Chapter 5" means Vectors at any level,
and merging is correct there. NCERT maths numbering is *scoped to the class level*. Two genuinely
different data models, one of which had never been written down. Now it is, as
`chaptersAreLevelScoped` on `SubjectCatalogSources`, with the reasoning in the comment.

Same root cause, second instance: `sectionName` and `createChapter` both took bare keys and gained
optional level-qualified overrides consulted first.

### One more silent-degradation trap, fixed on sight

`/api/catalog` and `/api/catalog/concept` both parsed the subject as
`raw === "chemistry" ? "chemistry" : "physics"`. Adding a third subject to the union would have left
both routes behind: **`?subject=mathematics` would have returned the PHYSICS catalog with a 200**,
which reads as "mathematics has no concepts" rather than as an error. Both now parse off a
`Set<Subject>`.

### Verification (evidence, not assertion)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run validate:concepts` | **149/149 PASS, 0 FAIL** (unchanged) |
| `npm run validate:chemistry` | **10/10 PASS** — and output **byte-identical** to the pre-extraction capture |
| `npm run validate:mathematics` | **PASS**, 0 files scanned (empty namespace by design) |
| `npm test` | **28 files / 327 tests, all pass** |
| `npm run check:agents` | **15/15 emissions in sync** |
| `npm run build` | **`✓ Compiled successfully` + `Finished TypeScript`** — the admin bug-queue page type-checks with the new owner tag, which is what this check exists to prove. See the build caveat below. |
| Catalog probe | **byte-identical**: `getCatalogTree` × 6 level-combos × 3 subject-args + 6 concept lookups, 750 KB, diff empty — re-run after *each* of the two grouping-key attempts |
| Resolver probe | 3-namespace ambiguity **throws**, including the chemistry↔mathematics pair the old 2-way check could not see; physics-only resolution unchanged and silent |

> ⚠ **Build caveat, recorded rather than glossed.** `npm run build` compiles and type-checks clean,
> but its static-export stage intermittently fails on **`/admin/sim-viewer`** with
> *"took more than 60 seconds"*. **Not caused by this work and not in its diff.** That page is a
> server component that calls `supabaseAdmin` to list every `simulation_cache` row
> (`src/app/admin/sim-viewer/page.tsx:13`), so prerendering it requires a live Supabase round-trip —
> the build is network- and DB-latency dependent at that step, which is why it succeeded on one run
> and timed out on the next with an identical tree. Nothing in this session touches `supabaseAdmin`,
> `deriveStateIds` or that route. **Standing risk worth a founder call:** a build that can fail on DB
> latency is a deploy hazard for `build:pilot` too; the fix is `export const dynamic = 'force-dynamic'`
> (or equivalent) on that admin page so it is never statically prerendered.

> ⚠ **Sync before you measure.** The local checkout opened **128 commits behind `origin/master`** and
> its first baseline read 146/146. It was fast-forwarded before any file was written and re-measured
> at 149/149. A baseline from a stale tree is a false tripwire, and building on one is the exact
> Rule-40 conflict hazard the repo already records twice.

### Proposed `CLAUDE.md` deltas — AWAITING FOUNDER APPROVAL (§9: no unapproved edits)

`CLAUDE.md` was deliberately **not** edited. Three parentheticals are proposed, each mirroring the
chemistry one already in place:

1. **§1 (Alex cluster)** — after the chemistry sentence: *"(Mathematics concepts substitute
   `mathematics-author` at position #2 — added 2026-08-04; see `docs/MATHEMATICS_ARCHITECTURE.md` +
   `docs/MATHEMATICS_BUILD_PLAN.md`.)"*
2. **§5 (source roles)** — after the chemistry source-roles note: *"(Mathematics source roles —
   2026-08-04: NCERT Mathematics = backbone, NCERT Exemplar = misconception beliefs, international
   specifications for scope/coverage claims only; HCV/DCP are physics-only. See
   `docs/patterns/mathematics.md` §3.)"*
3. **§6 (the eight registration sites)** — extend the chemistry carve-out to name mathematics:
   mathematics ids live in `src/data/concepts/mathematics/` and register **nowhere else** (sites
   2/3/4/7/8 forbidden — Gate 8b is all-or-nothing); validation is `npm run validate:mathematics`.

### Open items

1. **`cartesian_plane` is the gate.** Ranked P1 #1–#3 cannot be built without it. It needs a Phase-0
   survey on the `docs/CHEMISTRY_PHASE0_BONDING.md` model, then a single dispatch landing on master
   separately with its own headless gate (`check:cartesian-plane`, negative controls per section).
   **P1 #4 (the unit circle) does not need it** — that is why it is the recommended first concept:
   it proves the whole mathematics path at zero engine spend, exactly as `bohr_model_energy_levels`
   did for chemistry on the same renderer.
2. **The professor gate has still never run on any subject outside physics.** Ten chemistry concepts
   have passed every machine gate and none has passed Asmi's review — the stated bottleneck for six
   consecutive sessions. Mathematics starts behind the same closed gate. **Founder decision worth
   taking explicitly:** sequence the first mathematics concept *behind* the first professor review,
   or accept a third subject on an unvalidated pedagogy gate.
3. **Every international `curriculum_tags` cell will ship unverified** (Rule 38g), so no mathematics
   preset can go teacher-visible either. An intersection-first subject whose intersection claims are
   all unverified is a thesis, not a shipped feature. Closing it needs one teacher per board.
4. **`graph_interactive` renders nowhere on 48 physics concepts** — pre-existing, surfaced here.
   Founder call: wire a `panel_b` branch into `build_review_site.ts`, or drop the field so the JSON
   stops claiming a panel that never paints. Scar-row candidate.
5. **The DB migration is not applied.** Until it is, `alex:mathematics_author` is offered by the admin
   UI and rejected by the database — the exact chemistry defect, now with the fix already written.
6. **Nothing is committed.** Work sits on `feat/mathematics-foundation`, unpushed, per the standing
   rule that commits happen on founder go.

### ⏭ NEXT

**founder review of `docs/MATHEMATICS_DISCUSSIONS.md` §6 (the ranked list) — before anything else.**
The list decides every subsequent build, and re-ordering it is free today and expensive after a
scenario is dispatched. Then either (a) dispatch the `cartesian_plane` Phase-0 survey, or (b) author
the unit circle on the existing parametric renderer and prove the path first. Recommendation on
record: **(b) then (a)** — a proven path costs nothing to have and de-risks the engine spend.
