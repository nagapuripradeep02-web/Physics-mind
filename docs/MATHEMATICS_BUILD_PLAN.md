# Mathematics Build Plan — v1.0 (EXECUTION PLAN, phase-by-phase)

> **Status: PLANNING ARTIFACT (Rule 17) — 2026-08-04, branch `feat/mathematics-foundation`.**
> Companion to `docs/MATHEMATICS_ARCHITECTURE.md` (the design/why). This doc is the *how*: per-phase
> tasks with exact files, exit criteria, rollback, and a founder checkpoint between every phase.
> **Nothing advances to the next phase without an explicit go.** Phase numbers mirror
> `docs/CHEMISTRY_BUILD_PLAN.md` for cross-reference; execution order is **0 → 2 → 1 → 2.5 → 3 → 4 → 5**
> (safest-first: agents layer before runtime code).
>
> **Concept ORDER is not decided here.** It lives in `docs/MATHEMATICS_DISCUSSIONS.md` §6 (the ranked
> list, gated by the whiteboard test). This doc is the authority on phase *mechanics* only.
>
> **THE REGRESSION TRIPWIRE — run after EVERY phase; all must hold:**
> ```
> npx tsc --noEmit              → 0 errors
> npm run validate:concepts     → 149/149 PASS, 0 FAIL      (physics; unchanged until physics adds concepts)
> npm run validate:chemistry    → 10/10 PASS, 0 FAIL        (byte-identical to the captured baseline)
> npm run validate:mathematics  → PASS                      (from Phase 2.5)
> npm test                      → 327/327
> npm run check:agents          → all emissions in sync
> ```
> Any deviation = stop, fix or roll back. Do not push through.

---

## Phase tracker (living)

| Phase | Name | Risk | Status |
|---|---|---|---|
| 0 | Safety baseline | none | ✅ 2026-08-04 |
| A | Ranked diamond list (BLOCKING gate) | none | ✅ 2026-08-04 — `docs/MATHEMATICS_DISCUSSIONS.md` |
| 2 | Authoring layer (`mathematics_author` + pattern library + DB migration) | low | ✅ 2026-08-04 |
| 1 | Curriculum plumbing (subject first-class) | low-med | ✅ 2026-08-04 |
| 2.5 | `validate:mathematics` + shared-gate extraction + CI | low-med | ✅ 2026-08-04 |
| P0 | **`cartesian_plane` scenario** (engine; master, Rule 40) | medium | ◐ **0a COMPLETE + 0b COMPLETE 2026-08-06** → `docs/MATHEMATICS_PHASE0_CARTESIAN_PLANE.md` (survey + contract, AMENDMENT 1) · `docs/skeletons/definite_integral_as_accumulated_area_skeleton.md` (spec driver, round 1). Checkpoint A cycle 0 = `DESIGN_FIX`, 19 findings applied; **cycle 1 pending**. 0c/0d open. **BLOCKS P1 concepts** |
| 3 | First concept — vertical slice | medium | ☐ recommendation: **the unit circle** (`parametric`, [LIVE], zero engine spend) |
| 4 | Mathematics-specific gates (interval honesty, notation ladder) | medium | ☐ (grows from scars) |
| 5 | Further scenarios (3D solids, sampling box) | high | ☐ founder-gated |

**Recorded baseline (2026-08-04, at `origin/master` after a 128-commit fast-forward):**
`tsc` = 0 errors · `validate:concepts` = **149/149 PASS, 0 FAIL** · `validate:chemistry` =
**10/10 PASS** · `npm test` = **28 files / 327 tests, all pass** · `check:agents` = **14/14 in sync**.

> ⚠ The local checkout was **128 commits behind `origin/master`** when this session opened, and the
> first baseline taken on it read 146/146. It was fast-forwarded before any file was written and
> re-measured at 149/149. **Sync before you measure** — a baseline from a stale tree is a false
> tripwire, and building on one is the exact Rule-40 conflict hazard.

---

## Phase 0 — Safety baseline

**Goal:** a verified-green starting line so every later diff is meaningful.

**Tasks**
1. `git fetch origin` and fast-forward the working branch — **before** measuring anything.
2. Capture the tripwire numbers and record them in this doc.
3. Capture `npm run validate:chemistry` output to a file — this is the byte-identical reference for
   the Phase-2.5 shared-gate extraction.

**Exit criteria:** tripwire green, numbers recorded. **Rollback:** none needed.

---

## Phase A — The ranked diamond list (BLOCKING)

**Goal:** nothing is authored that did not need to be a simulation.

**Deliverable:** `docs/MATHEMATICS_DISCUSSIONS.md` — the whiteboard test applied per candidate, the
four-capability scoring, the measured renderer reality-check, the Indian ∩ international intersection
table, the demo tier recorded explicitly, and the ranked list.

**Why it is first:** mathematics is the most whiteboard-native of the three subjects. Without this
gate the subject produces a cheap catalog of concepts that did not need a build — the failure the
chemistry list exists to prevent, at higher risk here.

**Exit criteria:** the list exists, the demo tier is written down, and every P1 entry names the
capability it claims and the surface it needs. **Checkpoint → founder:** approve or re-order.

---

## Phase 2 — Authoring layer (runs BEFORE Phase 1; zero runtime risk)

**Goal:** the pipeline can author mathematics. Touches `.agents/`, `.claude/agents/`, `docs/`,
`scripts/sync-agents.js`, two admin-UI enums, and one SQL file — no serving-path code.

**Tasks**
1. `.agents/mathematics_author/CLAUDE.md` — canonical spec. 6-section output block (same shape as
   `physics_author` / `chemistry_author` so `json_author` consumes all three identically), with the
   **domain & validity ledger** replacing chemistry's balanced-equation ledger, and the units
   checklist explicitly replaced (mathematics quantities are unitless).
2. `scripts/sync-agents.js` → add `{ canonical: 'mathematics_author', emission: 'mathematics-author' }`.
3. `.claude/agents/mathematics-author.md` — frontmatter authored by hand (`name`, `description`,
   `model: claude-sonnet-5` matching both sibling authors), body filled by `npm run sync:agents`.
   **Never hand-edit the body.**
4. Governance: `.agents/CLAUDE.md` roster + hard-rules addendum · `.agents/README.md` pipeline diagram ·
   `.agents/peter_parker/OVERVIEW.md` owner tags.
5. Admin enums — **both, or the app fails to type-check**: `src/app/admin/bug-queue/page.tsx` (TS
   union) and `src/app/admin/bug-queue/BugQueueList.tsx` (`OWNERS` array).
6. **DB migration** — `supabase_migrations/supabase_2026-08-04_engine_bug_queue_mathematics_subject_migration.sql`.
   Ships in the same commit as the role, because chemistry shipped the enums without the constraint
   and the UI offered an owner the database rejected for days.
7. `docs/patterns/mathematics.md` — architect pattern library (representation lens, motion
   archetypes, the LIVE / NEEDS-SCENARIO / PHASE-5 tiering).

**Exit criteria:** tripwire green · `check:agents` clean · `npm run build` type-checks the bug-queue
page with the new owner tag. **Rollback:** delete the new files, revert the two enum edits and the
`ROLES` line, re-run `sync:agents`. **Checkpoint → founder:** read the `mathematics_author` spec and
the pattern file — they define mathematics rigor.

---

## Phase 1 — Curriculum plumbing (subject first-class)

**Goal:** the app can *see* mathematics. First phase touching runtime code — physics **and** chemistry
behaviour must be provably unchanged.

**Tasks**
1. `src/types/student.ts` — `Subject` becomes `'physics' | 'chemistry' | 'mathematics'`.
2. `src/lib/mathematicsCatalog.ts` (new) — data only, sibling of `chemistryCatalog.ts`:
   `MATHEMATICS_CHAPTER_NAMES`, `MATHEMATICS_SECTION_NAMES`, `MATHEMATICS_GHOSTS`. **Seeded only from
   the Phase-A ranked list**, never a full NCERT chapter dump — a ghost catalog that outruns the
   ranked list is the demo-tier trap in a different costume.
3. `src/lib/conceptCatalog.ts` — third branch in `sourcesFor()`. Physics falls through unchanged.
4. `src/data/concepts/mathematics/` + `README.md` — the isolation contract.
5. `src/scripts/lib/resolveConceptJson.ts` — widen 2-way → **N-way**, preserving the loud ambiguity
   throw across *every* pair of namespaces.
6. `src/data/ncert-boundaries.ts` — add `NCERT_MATHEMATICS_BOUNDARIES` as a separate export; physics
   `NCERT_BOUNDARIES` untouched.
7. `src/app/learn/page.tsx` — extend `SUBJECT_LABEL` only. No toggle (nothing to show yet).

**Explicitly NOT in this phase:** `StudentProfile.subject`, onboarding, any shared-registry edit.

**Exit criteria:** tripwire green · physics catalog output byte-identical (see Verification) ·
dev server boots. **Rollback:** revert this phase's commits; no data or schema migration involved.
**Checkpoint → founder:** click through `/learn`; confirm zero physics-visible change.

---

## Phase 2.5 — `validate:mathematics` + shared-gate extraction + CI

**Goal:** mathematics has a gate before its fleet grows, and it is in CI from day one.

**Tasks**
1. **Capture first:** `npm run validate:chemistry > <scratch>/chem-before.txt 2>&1`.
2. Extract the subject-neutral gates from `validate-chemistry.ts` into
   `src/scripts/lib/conceptGates.ts` — `statesOf`, `countWords`, `wordBudgetWarnings`,
   `indicatorBindingErrors`, `choreoEndMs`, `narrationChoreographyWarnings`, `duplicateKeyErrors`.
   **Move every explanatory comment verbatim** — each records a real defect and is why its gate exists.
3. `validate-chemistry.ts` imports them; `gasPopulationErrors` stays chemistry-local.
4. **Diff against the capture — must be empty.** Non-empty = stop and fix.
5. `src/scripts/validate-mathematics.ts` (new) — scans only the mathematics namespace, imports the
   shared gates + `validateConceptJson` + the `deriveStateMeta` helpers. Empty namespace = PASS.
6. `package.json` — `"validate:mathematics": "npx tsx src/scripts/validate-mathematics.ts"`.
7. `.github/workflows/verify.yml` — new step immediately after the chemistry step, same rationale
   comment. **Chemistry ran five sessions with no CI coverage at all**; mathematics does not repeat it.

**Exit criteria:** chemistry validator output byte-identical to the capture · `validate:mathematics`
PASS on an empty namespace · tripwire green. **Rollback:** revert; the extraction is mechanical.

---

## Phase P0 — the `cartesian_plane` scenario (BLOCKS the P1 concepts)

**Goal:** the render surface every top-ranked mathematics diamond needs.

**Why it is a phase of its own:** `docs/MATHEMATICS_DISCUSSIONS.md` §3 measured that no shippable
renderer draws a coordinate plane with numeric axes. P1 #1/#2/#3 (graph transformations, the
derivative, the definite integral) are all blocked on it; #4 (the unit circle) is not.

**Discipline (all four are Rule-40 / chemistry-precedent requirements):**
1. **Phase-0 survey first**, on the `docs/CHEMISTRY_PHASE0_BONDING.md` model — the union check
   (every engine feature exercised by at least one designed state; no designed state needing a
   feature outside the set) made checkable *before* a line of renderer code.
   **✅ DONE 2026-08-06 → `docs/MATHEMATICS_PHASE0_CARTESIAN_PLANE.md`** (0a: survey, union table,
   union walk, config contract, nine engine decisions, the four-dispatch plan and the gate spec).
   0b — the deepest-concept skeleton (#3, the definite integral) + Checkpoint A — is the next step.
2. **A new CASE on `parametric_renderer.ts`, not a new file.** The recorded §5c lesson.
3. **Lands on master separately and immediately**, one `bug_class` per dispatch, dispatched to the
   owning surgeon — never bundled into a concept branch.
4. **Ships its own headless gate** — `npm run check:cartesian-plane`, sections with negative controls
   on every one, no browser (the `check:sigma-pi` / `check:hybrid-orbitals` pattern).

**Exit criteria:** the gate passes with negative controls · `check:renderer-syntax` +
`check:renderer-backticks` clean · **`vector_head_to_tail` and every other shipped PCPL concept comes
back unchanged from THE EYE** (the regression-bearing-edit check the bonding wave used) · tripwire green.

---

## Phase 3 — First concept: the vertical slice

**Goal:** ONE mathematics concept end-to-end through the real pipeline.

**3a — Concept decision (checkpoint).** Recommendation on record: **the unit circle unrolled into
sine & cosine** — 7/7 intersection breadth, a genuine Capability-2 diamond, and the only P1-grade
concept that runs on a **[LIVE]** surface today. It proves the whole path (agent → validator → THE EYE
→ baselines) at **zero engine spend**, exactly as `bohr_model_energy_levels` did for chemistry on the
same renderer.

**3b — Serving path.** The deterministic review-site path (`npm run build:review -- <id>`) — no
shared-registry edits, no Gate 8b exposure. Full app registration deferred.

**3c — Pipeline (sequential, never parallel):**
`architect` skeleton (10 sections + the Rule-31 per-state control table + Rule-38 ring column + both
coherence cuts + Definition of Done) → **founder_proxy Checkpoint A** → `mathematics_author` block →
`json_author` emits `src/data/concepts/mathematics/<id>.json` → `quality_auditor` (physics-only gates
marked N/A; every agnostic gate applies: word budget, ≥2 `advance_mode`, ≥3 primitives/state,
Rules 24/31/32/34/35/38/41).

**3d — Visual gate:** `npm run visual:eyes -- <id>` → `eye_walker` frame read → founder OK →
`visual:approve`. **3e — Professor gate:** a teacher teaches with it.

**Exit criteria:** the sim plays correctly on the review surface · THE EYE passes with zero new
`engine_bug_queue` rows · tripwire green (physics stays 149 — the slice adds no flat-dir files) ·
teacher review logged. **Rollback:** delete the one JSON + review build; nothing shared was touched.

---

## Phase 4 — Mathematics-specific gates

**Goal:** domain correctness, grown from scars rather than anticipated.

Two candidates already named: an **interval-honesty** gate (a curve drawn over `[a,b]` under a caption
claiming "for all x") and a **notation-ladder** gate (Rule 38c — formal limit/integral notation on a
core or extended ring state). Both wait for a real defect to seed them.

---

## Phase 5 — Further scenarios (founder-gated)

3D solids of revolution, the sampling/probability box. Each gets its own Phase-0 survey and its own
proposal doc once Phase 3 learnings are in.

---

## Standing safety rules (all phases)

1. Mathematics JSONs ONLY in `src/data/concepts/mathematics/` — never the flat dir.
2. Never edit shared physics gates, whitelists or registries in place — parallel files only.
3. Tripwire after every phase; physics stays **149** and chemistry **10/10** until those subjects
   themselves change.
4. Commits happen only on founder go, phase-scoped (one phase = one reviewable commit set).
5. `git fetch origin` and sync **before** measuring a baseline or opening a desk.
6. Any surprise — validator count change, tsc error, unexpected diff — is a stop-and-report, never a
   push-through.
