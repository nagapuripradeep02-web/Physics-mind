# Mathematics concepts

Namespace for mathematics concept JSONs, kept separate from the flat physics
concepts in `src/data/concepts/` and from `src/data/concepts/chemistry/` so all
three subject teams can commit concurrently with minimal file overlap.

**Isolation contract:** the physics validator scans the flat dir NON-recursively
by design — files here are invisible to `npm run validate:concepts` and get their
own `npm run validate:mathematics` gate, which runs in CI from day one. Never
place a mathematics JSON in the flat dir: its Zod schema mandates
`physics_engine_config` + `renderer_pair`, and the fleet-wide registration gate
(8b) is all-or-nothing. See `docs/MATHEMATICS_ARCHITECTURE.md` §5.

Follows the same authoring pipeline as physics and chemistry (root `CLAUDE.md`
§5/§6), with `mathematics_author` substituted at position #2
(`architect → mathematics_author → json_author → quality_auditor`).

**⚠ Concept ids are ONE namespace across all three subjects** even though the
directories are separate. Mathematics is the most collision-prone of the three —
`vectors`, `circle`, `limits` and `work` all already have physics senses — so ids
are qualified, never bare. `src/scripts/lib/resolveConceptJson.ts` throws loudly
on any cross-namespace collision rather than silently resolving flat-first.

## Two gates before anything lands here

1. **The ranked list is blocking.** Nothing is authored that is not in
   `docs/MATHEMATICS_DISCUSSIONS.md` §6. Mathematics is the most whiteboard-native
   subject of the three, so its demo tier is the largest — a good teacher with a
   board and 60 seconds beats most of the syllabus, and building those concepts
   costs teacher trust rather than earning it.
2. **Only [LIVE] archetypes may be specified.** `docs/patterns/mathematics.md`
   tiers every archetype. `cartesian_plane` — the coordinate plane with numeric
   axes that every top-ranked mathematics diamond needs — **does not exist yet**
   and must land on master separately (Rule 40) before those concepts are
   scheduled.

## Status (2026-08-04 — foundation complete, no concept authored)

- ✅ Agent-pipeline role: `.agents/mathematics_author/CLAUDE.md` (+ emitted wrapper).
- ✅ Architect pattern library: `docs/patterns/mathematics.md` (archetypes A–I).
- ✅ Ranked diamond list: `docs/MATHEMATICS_DISCUSSIONS.md` §6.
- ✅ Subject plumbing + `npm run validate:mathematics` + CI step.
- ☐ `cartesian_plane` scenario (blocks ranked P1 #1–#3).
- ☐ First concept — recommendation: the unit circle unrolled into sine and
  cosine (ranked P1 #4; runs on the existing `parametric` renderer, zero engine
  spend).

Design + plan: `docs/MATHEMATICS_ARCHITECTURE.md` · `docs/MATHEMATICS_BUILD_PLAN.md`.
