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
| 2 | Authoring layer (`mathematics_author` + pattern library) | ✅ 2026-08-04 |
| 1 | Curriculum plumbing (subject first-class) | ✅ 2026-08-04 |
| 2.5 | `validate:mathematics` + shared-gate extraction + CI | ✅ 2026-08-04 |
| 2.6 | THE EYE made subject-correct (`2d4cb06`) | ✅ 2026-08-05 |
| — | DB migration authored + pre-flighted (`84e85bc`) | ✅ **APPLIED 2026-08-05** by the founder to dev `dxwpkjfypzxrzgbevfnx`, verbatim. Verified after: 681 rows intact, 9 owners, both CHECKs carry the mathematics values. `alex:mathematics_author` + `subject='mathematics'` are now writable. |
| P0 | **`cartesian_plane` scenario** (engine; master, Rule 40) | ☐ **BLOCKS ranked P1 #1–#3** |
| 3 | First concept — **`unit_circle_to_sine_wave`** (ranked P1 #4) | 🟡 IN FLIGHT on desk `feat/mathematics-unit-circle`. Platform hunk merged to master (`5e26843`); skeleton + mathematics block + TS engine authored, uncommitted. |
| 4 | Mathematics-specific gates | ☐ (grow from scars) |
| 5 | Further scenarios (3D solids, sampling box) | ☐ founder-gated |

**Mathematics is a first-class subject in the tooling, and its visual gate is now correct for it.
The first concept is in flight; nothing is authored off-list.**

---

## 🔭 SESSION — THE EYE audited for mathematics: one blocker fixed, one blind spot recorded, and a migration bug my own pre-flight caught (2026-08-05, master + desk `feat/mathematics-unit-circle`)

> Founder question that started it: *"the EYE is nothing but a set of deterministic tests — does it
> also work properly for mathematics? For every simulation we need to run the eye, the eye walker,
> and the visual approval. All three should run properly."* Correct question to ask before the first
> concept, not after it. The answer was **mostly yes, with one blocker** — and finding it cost
> nothing compared to what it would have cost later.

### Bottom line

Four commits landed on master. The mathematics foundation merged (`a54b993`), the first concept's
platform hunk landed separately per Rule 40 (`5e26843`), THE EYE was made subject-correct
(`2d4cb06`), and the DB migration was fixed after its own pre-flight caught a real bug in it
(`84e85bc`). The unit-circle desk is open, synced and in flight.

### THE EYE audit — what was checked, not assumed

THE EYE is exactly two gates: `runPixelGate` (D1p, D5, D6, D7) + `runRegressionGate`. **Neither
contains a single subject or concept-id branch** — the only hits for `physics|chemistry|conceptId ===`
are calibration comments. `deriveStateMeta`, `deriveStateIds`, `pixelGate`, `regressionGate` and
`visual_approve` have zero subject references. So capture, gates, baselines and approve are
subject-agnostic by construction.

**The part that mattered for mathematics is thin-line content**, and it was already handled:

- **D5** — the canvas-ratio motion lens was calibrated on `field_3d` and, in the file's own words,
  *"structurally cannot see a THIN primitive (a 3-4px force_arrow line, an angle_arc, a traced
  locus)"*. That is `locus_trace`, the unit circle's own primitive. Filed as
  `visual_eyes_d5_thin_primitive_undercounted_on_large_canvas` and **fixed 2026-07-23** with a second
  ink-relative lens, ground-truthed on `scalar_vs_vector STATE_2` — a thin rotating pointer on PCPL,
  the exact content class. 1.39–1.48% of ink against a 0.02% noise ceiling: >20× margin.
- **D7** — reads the plain canvas ratio, but fires only on `tailFrozen && earlierMoved`. On thin
  content nothing clears the canvas epsilon, so `earlierMoved` is false and D7 passes. No false
  failure.
- **D6 — a REAL blind spot, recorded rather than fixed.** Its threshold is
  `max(20% of canvas, 8 × median)`; on thin content the median is tiny so it falls back to the 20%
  floor, which a traced locus can never reach. It will not false-fail a mathematics sim — it will
  **silently miss a genuine mid-state teleport**. On this subject that must be caught by eye. Now
  written into the eye_walker mathematics addendum so the frame-reader knows the gate will not do it
  for them.

**The empirical proof that beat all of the above:** three parametric/PCPL concepts across TWO
subjects are already baseline-locked, so eyes → eye_walker → `visual:approve` has completed on this
renderer twice — `scalar_vs_vector` (physics, 11 baselines), `bohr_model_energy_levels` (chemistry,
19), `law_of_conservation_of_mass` (chemistry, 15).

### THE BLOCKER: a green EYE run that could not be trusted

`assertCacheMatchesSource` (`loadCachedSim.ts`) read `built.subject !== 'chemistry'` — an allowlist
of one. **Mathematics was skipped entirely.**

Mathematics concepts are hand-seeded into `simulation_cache` for the identical reason chemistry's
are: they register at site #1 only (the isolation contract) and never touch the live generation
pipeline. THE EYE reads **only** that row. The guard exists because the class it catches
(`eye_reads_the_hand_seeded_cache_not_the_current_source`, CRITICAL) returned **"35 checks / 35
passed" over entirely PRE-fix pixels — twice** — and was caught by a human diffing frames by hand,
which is not a gate.

**The cost of that miss is not a broken run. It is a GREEN one.**

Rewritten as a **physics exclusion** (`=== 'physics'` returns early) rather than a chemistry
allowlist. Physics is the one namespace legitimately served by the live pipeline, whose output
differs from a bare renderer assembly, so comparing there would false-fail every run. Everything
else is hand-seeded and now guarded **by construction — no edit needed for the next subject.**

Verified with a negative control, not asserted:

| case | result |
|---|---|
| chemistry + tampered html | **HARD FAIL** ✅ |
| physics + tampered html | passes through silently ✅ |
| chemistry + matching html | no false positive ✅ |
| physics / non-assemblable | skipped, unchanged ✅ |

Mathematics fires by construction (`subject !== 'physics'`).

Two smaller fixes rode along: `_seed_chemistry_cache.ts` → **`_seed_subject_cache.ts`** (nothing in
its code ever gated on chemistry — only the name did, which made it undiscoverable the moment a third
subject existed; the stale-cache failure message now names the actual subject too), and an
**eye_walker mathematics addendum** mirroring the chemistry one: interval honesty, readout-agrees-
with-picture, approaching-is-not-reaching, exact-vs-decimal, stable precision, axis/scale honesty.

### THE LESSON: my own migration was wrong, and only the census caught it

Running the migration's own pre-flight against dev returned **FAIL**. The restated `owner_cluster`
CHECK list had **dropped `peter_parker:runtime_generation` — 27 live rows.** I had hand-carried the
list forward from the 2026-07-24 chemistry migration and lost a line in transit.

Why that is worse than a typo: Step 1 is `DROP CONSTRAINT` then `ADD CONSTRAINT`. The DROP would have
**succeeded** and the ADD would have failed on those 27 rows, leaving `engine_bug_queue` with **no
owner_cluster constraint at all** — a half-applied migration that silently removes a guard. Nothing
downstream would have reported it.

Fixed in `84e85bc`. The file now carries the census inline (681 rows · 9 owner values · 3 subject
values) and an explicit warning: **a restated CHECK is only ever as good as the census taken
immediately before it — never copy the list forward without re-running it.** The re-run parses the
CHECK lists straight out of the `.sql` file rather than a retyped copy, which is the actual lesson.
Result: **PASS**. Also corrected an inherited comment — `visual_validator` is 50 live rows, not 39.

### Repo hygiene (founder directive: plan in the office, build at a desk)

The foundation had been built in the **office** on a branch created in place — the anti-pattern
`docs/GIT_WORKFLOW.md` §7 names by name. Corrected this session: foundation merged to master, office
returned to `master` and clean, and the concept work moved to a proper worktree via
`npm run desk:new`. Also: `.gitignore` hardening committed (`c2b8c72`, verified against
`git ls-files` first — zero tracked paths matched, so nothing changed status), the desk's branch
re-pointed from `origin/master` to its own remote, and the desk synced twice.

`npm run desk:audit` now reads **"Nothing to do — every desk is pushed, current, and earning its
place."** `commits existing ONLY on this machine: 0`.

### Verification

`tsc` 0 · `check:renderer-syntax` clean · `check:agents` **15/15** · `validate:concepts` **149/149**
· `validate:chemistry` **10/10** · `validate:mathematics` PASS · `npm test` **327/327** ·
migration pre-flight **PASS** against 681 live rows.

### Open items

1. ~~**The DB migration is authored, pre-flighted and NOT APPLIED.**~~ **CLOSED 2026-08-05 — APPLIED**
   by the founder from the master checkout via the Supabase MCP, verbatim (no apply-time deviation).
   Verified after: both CHECKs carry the mathematics values, 681 rows intact (physics 497 · chemistry
   106 · subject_neutral 78 · mathematics 0), 9 distinct owners — zero rows lost or retagged.
   `alex:mathematics_author` and `subject='mathematics'` are writable as of now.
   **⚠ DOCTRINE SETTLED — do not re-raise this as a blocker.** The org-access question is answered
   NO, permanently, and by design rather than by accident: an MCP connector with DDL rights on that
   org would also hold them over `student_confusion_log`, `ncert_content` and `pyq_questions` —
   three tables `CLAUDE.md` marks NEVER DELETE. DDL stays a founder action on the founder's machine
   (Rule 17), roughly once per subject lifetime. **Authoring sessions need no dashboard access ever:**
   scar READS run headless through `src/scripts/query_engine_bug_queue.ts` (service-role), and scar
   WRITES are plain data INSERTs via `_seed_engine_bug_queue_*.ts` seed scripts — both already work
   from any clone holding `.env.local`. This is exactly how chemistry has run since 2026-07-27.
2. **D6 cannot see a teleport of thin content** (above). Recorded in the eye_walker addendum; a real
   fix would need an ink-relative lens for D6 the way D5 got one. Scar-row candidate.
3. **`graph_interactive` renders nowhere on 48 shipped physics concepts** — surfaced by the Session
   M1 renderer survey, still open. Either wire a `panel_b` branch into `build_review_site.ts` or drop
   the field so the JSON stops claiming a panel that never paints.
4. **`cartesian_plane` still gates ranked P1 #1–#3.** Needs its own Phase-0 survey before dispatch.
5. **`feat/mathematics-foundation` is merged and deskless** — safe to delete.

### ⏭ NEXT

Finish `unit_circle_to_sine_wave` on its desk: commit the skeleton + mathematics block + TS engine,
seed the cache with `_seed_subject_cache.ts`, then `visual:eyes` → `eye_walker` → founder approval →
`visual:approve`. The EYE path is now trustworthy for it, which was the point of this session.

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
