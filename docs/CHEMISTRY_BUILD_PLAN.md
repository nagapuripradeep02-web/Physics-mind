# Chemistry Build Plan — v1.0 (EXECUTION PLAN, phase-by-phase)

> **Status: PLANNING ARTIFACT (Rule 17) — 2026-07-23, branch `feat/chemistry-foundation`.**
> Companion to `CHEMISTRY_ARCHITECTURE.md` (the design/why). This doc is the *how*: per-phase task
> lists with exact files, exit criteria, rollback, and a founder checkpoint between every phase.
> **Nothing advances to the next phase without an explicit go.** Phase numbers match
> `CHEMISTRY_ARCHITECTURE.md` §8 for cross-reference; the recommended *execution order* is
> **0 → 2 → 1 → 3 → 4 → 5** (safest-first: agents-layer before runtime code).
>
> **The regression tripwire (run after EVERY phase, all must hold):**
> `npx tsc --noEmit` = 0 errors · `npm run validate:concepts` = **124/124 PASS, 0 FAIL** ·
> `npm test` (vitest) green. Any deviation = stop, fix or roll back before proceeding.

---

## Phase tracker (living — update as phases complete)

| Phase | Name | Risk | Status |
|---|---|---|---|
| 0 | Safety baseline | none | ✅ 2026-07-23 |
| 2 | Authoring layer ready (`chemistry_author` + architect sources) | low | ✅ 2026-07-23 (tripwire green: tsc 0 · 124/124 · 288/288 · 11/11 emissions) |
| 1 | Curriculum plumbing (subject first-class) | low-med | ☐ |
| 3 | First concept — vertical slice | medium | ☐ (blocked on concept decision) |
| 4 | Chemistry validator + visual gate + CI | medium | ☐ |
| 5 | Dedicated chemistry renderer (3D) | high | ☐ (founder-gated) |

---

## Phase 0 — Safety baseline

**Goal:** a byte-clean, verified-green starting line so every future diff is meaningful.

**Tasks**
1. Restore the committed `package-lock.json` (`git restore package-lock.json`) — the working-tree
   diff is regenerable platform noise; discarding it is safe.
2. `npm ci` — install exactly from the committed lockfile (does not modify it).
3. Run + record the baseline: `npx tsc --noEmit` · `npm run validate:concepts` · `npm test` ·
   `npm run check:agents` (agent emissions in sync — needed clean before Phase 2).
4. Lock the isolation contract in code: comment above the non-recursive scan in
   `src/scripts/validate-concepts.ts` (~line 1108) stating that `chemistry/` is intentionally
   excluded and recursion must never be added to the physics scan.
5. Install the existing local git hook (`bash scripts/install-git-hooks.sh`) — pre-commit
   agent-sync check only; local `.git/hooks`, not a repo change.

**Exit criteria:** `git status` clean except the two untracked `docs/CHEMISTRY_*.md`; tripwire green;
baseline numbers recorded in this doc.
**Rollback:** none needed — nothing irreversible.
**Checkpoint → founder:** approve plan + order (0 → 2 → 1 → 3); pick Phase 3 concept when ready.

**Recorded baseline (2026-07-23):** tsc = 0 errors · validate = **124/124 PASS, 0 FAIL**, registration ✓,
exit 0 (non-fatal warnings: 405 word-budget / 105 files, 14 physics / 5 files, 1 undeclared-derived-id —
pre-existing backfill items, unchanged) · vitest = **27 files / 288 tests, all pass** · check:agents =
**10/10 emissions in sync** · `npm ci` = exit 0 (lockfile sync fixed in commit `d25cdc4`).

---

## Phase 2 — Authoring layer ready (runs BEFORE Phase 1; zero runtime risk)

**Goal:** the agent pipeline can author chemistry. Touches only `.agents/`, `.claude/agents/`,
`docs/`, and two admin-UI enums — no serving-path code.

**Tasks**
1. **`.agents/chemistry_author/CLAUDE.md`** — sibling of `.agents/physics_author/CLAUDE.md`.
   Output contract = a 6-section "chemistry block": quantities-with-units, formulas (stoichiometric
   ratios, K expressions, rate laws, Nernst), per-state visual timeline, constraints (mass/charge
   balance, valid oxidation states, electron bookkeeping), drill-down phrases.
2. `npm run sync:agents` → emits `.claude/agents/chemistry-author.md`; verify `npm run check:agents`.
3. Register the role in governance: roster table `.agents/CLAUDE.md` · pipeline diagram
   `.agents/README.md` · valid owner-tags `.agents/peter_parker/OVERVIEW.md`.
4. Add `alex:chemistry_author` to the two admin-UI enums (type-check fails without both):
   `src/app/admin/bug-queue/page.tsx` (TS union) · `src/app/admin/bug-queue/BugQueueList.tsx`
   (`OWNERS` array).
5. **Architect chemistry sources:** create `docs/patterns/chemistry.md` (representation archetypes:
   particle/trajectory, energy-level ladder, particulate-vs-symbolic-vs-macro triangle, graph-first)
   + a chemistry source-role note (NCERT Chemistry = backbone; NCERT Exemplar = misconception belief;
   universal anchors per Rule 35). One architect for both subjects (per `CHEMISTRY_ARCHITECTURE.md` §4).
6. Update `src/data/concepts/chemistry/README.md` to point at the two new docs.

**Exit criteria:** tripwire green · `check:agents` clean · admin bug-queue page type-checks with the
new owner tag.
**Rollback:** delete the new files, revert the two enum edits, re-run `sync:agents`.
**Checkpoint → founder:** review the `chemistry_author` spec + pattern file (this defines chemistry
rigor; worth a careful read).

---

## Phase 1 — Curriculum plumbing (subject first-class)

**Goal:** the app can *see* chemistry. First phase touching runtime code — physics behavior must be
provably unchanged.

**Tasks**
1. `subject: 'physics' | 'chemistry'` on `CatalogConcept`, `CatalogChapter`, `GhostSeed` in
   `src/lib/conceptCatalog.ts` — **default `'physics'`** everywhere so the existing catalog is
   byte-identical in behavior.
2. Loader: add a *second, tagged* scan of `src/data/concepts/chemistry/` in
   `loadLiveConceptsFromJsons()` — the physics flat scan stays untouched (isolation contract).
3. Chapter tables: key by `(subject, chapter)`; add a small chemistry seed
   (`CHAPTER_NAMES_CHEMISTRY` — NCERT Cl.11 units) in a **separate file**
   (`src/lib/chemistryCatalog.ts`) so subject teams don't collide in one file.
4. `src/data/ncert-boundaries.ts`: add chemistry `class_11` boundaries (start with Ch.1–4 only).
5. `/learn` UI: un-hardcode "Learn Physics" (`src/app/learn/page.tsx:96`); subject toggle that
   defaults to Physics and shows Chemistry only when ≥1 live chemistry concept exists (so nothing
   user-visible changes until Phase 3 ships).
6. `/api/catalog`: pass-through `subject` filter, defaulting to physics.

**Explicitly NOT in this phase:** `StudentProfile.subject`, onboarding changes, any edit to
`VALID_CONCEPT_IDS` / `PCPL_CONCEPTS` / `CONCEPT_PANEL_MAP` / `CONCEPT_RENDERER_MAP` (Gate 8b is
all-or-nothing — deferred until the chemistry serving path exists).

**Exit criteria:** tripwire green · `/api/catalog` responses for physics **byte-identical** before/after
(capture once before starting, diff after) · `/learn` renders unchanged for physics · dev server boots.
**Rollback:** revert the commits of this phase; no data/schema migrations involved.
**Checkpoint → founder:** click through `/learn` yourself; confirm zero physics-visible change.

---

## Phase 3 — First concept: the vertical slice

**Goal:** ONE chemistry concept end-to-end through the real pipeline, reusing an existing renderer
(§5a of the architecture doc) — proving the whole chemistry path before any engine spend.

**3a — Concept decision (checkpoint, together).** Candidates in `CHEMISTRY_ARCHITECTURE.md` §9;
recommendation: **Rutherford α-scattering** (reuses the proven force-in-field/particle-trajectory
archetype → ~zero new renderer code), Bohr model as the follow-up.

**3b — Serving-path decision (design, cheap-first).** Recommended: render via the deterministic
**review-site / test-page path** (`npm run build:review -- <id>` / an admin test page reading
`src/data/concepts/chemistry/` directly) — no shared-registry edits, no Gate 8b exposure. Full app
registration (classifier + panels) deferred to after Phase 4.

**3c — Pipeline run (sequential, never parallel):**
`architect` skeleton (10 sections + per-state control table + DoD, chemistry sources)
→ `chemistry_author` block → `json_author` emits
`src/data/concepts/chemistry/<id>.json` (existing schema as-is — its shapes are subject-neutral;
field renaming like `physics_engine_config` → `engine_config` is deliberately deferred to Phase 4+)
→ `quality_auditor` gates (Gate 3d/E42 marked N/A-chemistry for the slice; all agnostic gates apply:
word budget, ≥2 advance_mode, ≥3 primitives/state, Rules 24/31/32/34/35).

**3d — Visual gate:** `npm run visual:eyes -- <id>` → `eye_walker` frame read → founder OK →
`visual:approve`. **3e — Professor gate:** Asmi teaches with it, per-state notes → `reviews/`.

**Exit criteria:** the sim plays states correctly on the review surface · THE EYE passes with zero new
`engine_bug_queue` rows · tripwire green (physics still 124/124 — the slice adds no flat-dir files) ·
teacher review logged.
**Rollback:** delete the one JSON + review build; nothing shared was touched.
**Checkpoint → founder:** watch the sim; decide Bohr-next vs. Phase 4 hardening.

---

## Phase 4 — Chemistry validation + visual gate + automation

**Goal:** chemistry gets its own gates before the fleet grows past a handful of concepts.

**Tasks**
1. `npm run validate:chemistry` — new script scanning ONLY `src/data/concepts/chemistry/`; reuses the
   agnostic gates (schema, word budget, advance_mode, coverage/quiz 19/20, bounds) via shared imports;
   physics-only gates (E42, mechanics animation vocabulary) excluded.
2. **Chemistry correctness gate** (the E42 analog): balanced-equation check (mass + charge),
   oxidation-state validity, unit coherence on K/rate expressions; grows via the same
   `engine_bug_queue` scar-list discipline.
3. Chemistry animation vocabulary file (parallel to `animation_vocabulary.ts`, enforced by the new
   validator only).
4. Extend THE EYE / eye_walker SOP with a chemistry sanity checklist (per-state: particulate
   consistency, conservation visually respected, label/formula Unicode).
5. **Automation:** add `tsc` + `validate:concepts` + `validate:chemistry` to pre-commit and/or CI
   (founder decision on where — this changes contributor workflow).

**Exit criteria:** chemistry validator passes on the Phase 3 concept · physics validator output
byte-identical · tripwire green.
**Checkpoint → founder:** approve the correctness-gate rules (they encode chemistry doctrine).

---

## Phase 5 — Dedicated chemistry renderer (founder-gated, second wave)

**Goal:** the chemistry-distinctive visuals (orbitals, VSEPR, lattices) that justify engine spend —
only after Phases 3–4 prove demand.

**Scope (Peter Parker `renderer_primitives` work):** Three.js `molecule_3d` / `orbital_3d` renderer
(pattern-reference: `field_3d_renderer.ts`, content net-new) · 2D chemistry primitives (atoms, bonds,
Lewis dots, reaction/equilibrium arrows, apparatus, energy profiles) as new PCPL primitives ·
chemistry animation verbs · widget-toggle conventions (Rule 39 discovery conventions) · THE EYE
support for the new renderer.

**Not planned in detail here** — gets its own proposal doc (per house convention, like
`MAGNETISM_ARCHITECTURE.md`) once Phase 3/4 learnings are in.

---

## Standing safety rules (all phases)

1. Chemistry JSONs ONLY in `src/data/concepts/chemistry/` — never the flat dir.
2. Never edit shared physics gates/whitelists/registries in place — parallel chemistry files only.
3. Tripwire after every phase; physics count stays **124** until physics itself adds concepts.
4. Commits happen only on founder go, on this branch (`feat/chemistry-foundation`), phase-scoped
   (one phase = one reviewable commit set).
5. Any surprise (validator count change, tsc error, unexpected diff) = stop and report, don't push through.
