# Chemistry concepts

Namespace for chemistry concept JSONs, kept separate from the flat physics
concepts in `src/data/concepts/` so both subject teams can commit concurrently
with minimal file overlap.

**Isolation contract:** the physics validator scans the flat dir NON-recursively
by design — files here are invisible to `npm run validate:concepts` and get their
own `validate:chemistry` gate (CHEMISTRY_BUILD_PLAN.md Phase 4). Never place a
chemistry JSON in the flat dir. See `docs/CHEMISTRY_ARCHITECTURE.md` §7.

Follows the same authoring pipeline and 8-registration-site doctrine as physics
(root `CLAUDE.md` §5/§6), with `chemistry_author` substituted at position #2
(`architect → chemistry_author → json_author → quality_auditor`).

Status (2026-07-23, CHEMISTRY_BUILD_PLAN.md Phase 2 complete):
- ✅ Agent-pipeline role: `.agents/chemistry_author/CLAUDE.md` (+ emitted wrapper).
- ✅ Architect pattern library: `docs/patterns/chemistry.md` (archetypes K–Q;
  only **[LIVE]** archetypes may be scheduled until Phase 5).
- ⏳ Chemistry-specific renderer (`molecule_3d`/`orbital_3d`, apparatus
  primitives): Phase 5 — design target, not yet built.
- ⏳ `validate:chemistry` + chemistry correctness gate: Phase 4.

Design + plan: `docs/CHEMISTRY_ARCHITECTURE.md` · `docs/CHEMISTRY_BUILD_PLAN.md`.
