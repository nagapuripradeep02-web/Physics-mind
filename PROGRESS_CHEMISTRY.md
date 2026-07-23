# PROGRESS_CHEMISTRY.md — PhysicsMind Chemistry Build

> Dedicated chemistry build log (sibling of root `PROGRESS.md`, which stays the physics/engine log).
> Newest session first. Chemistry work started 2026-07-23 on branch `feat/chemistry-foundation`.
>
> **Companion docs:** `docs/CHEMISTRY_ARCHITECTURE.md` (design — extend, don't duplicate) ·
> `docs/CHEMISTRY_BUILD_PLAN.md` (phase-by-phase execution plan + tracker) ·
> `docs/CHEMISTRY_DISCUSSIONS.md` (strategy/decisions log) · `docs/patterns/chemistry.md`
> (architect pattern library) · `.agents/chemistry_author/CLAUDE.md` (the rigor role).

## Phase status

| Phase | Name | Status |
|---|---|---|
| 0 | Safety baseline | ✅ 2026-07-23 |
| 2 | Authoring layer (`chemistry_author` + pattern library) | ✅ 2026-07-23 |
| 1 | Curriculum plumbing (subject first-class) | ✅ 2026-07-23 |
| 2.5 | Parity hardening (4 shared specs + tooling + validate:chemistry) | ✅ 2026-07-23 |
| 3 | First concept — Rutherford α-scattering (Wave 1, prove-first) | ⏭ NEXT SESSION |
| 4 | Chemistry machine gates (ledger check, animation vocab) | ☐ |
| 5 | Chemistry render surface (particle-box, then Three.js molecule/orbital) | ☐ (founder-gated) |

## The renderer-compounding build FLOW (locked 2026-07-23 — see CHEMISTRY_DISCUSSIONS.md §C3)

Build by **renderer archetype, not by chapter** — each renderer surface, built once, is reused by the
next concept, so cost-per-concept falls as the catalog grows (the physics magnetism recursive-bootstrap,
applied to chemistry). Every Wave 1–3 concept sits in NCERT **and** IGCSE/IB/AP/A-level; Rule 38
depth-rings absorb the depth difference (author at NCERT/JEE depth, hide the advanced ring for lighter
boards).

| Wave | Archetype | Renderer cost | Concepts (build order) |
|---|---|---|---|
| 1 Prove it | K trajectory | £0 (reuses built `magnetic_force_moving_charge`) | **Rutherford α-scattering** [→ electron-discovery deflection] |
| 2 Passport ⭐ | M particle-box (+N graph) | build gas-collision box ONCE | kinetic particle theory/states → diffusion → rates → collision theory → equilibrium/Le Chatelier |
| 3 Energy | L ladder (+N) | modest (generic 2D primitives) | Bohr/energy levels/spectra · reaction energy profiles/enthalpy/activation energy |
| 4 Bookkeeping | O ledger | cheap (generic primitives) | balancing · conservation of mass · mole concept · stoichiometry |
| 5 Structure | P Three.js | big (Phase 5) | orbitals s/p/d · bonding/VSEPR · hybridization · organic mechanisms · electrochem cells |

---

## 🧪 SESSION — Chemistry foundation: architecture → chemistry_author → subject-aware catalog → parity-audit hardening → international build-flow locked (2026-07-23, branch `feat/chemistry-foundation`, new macOS laptop)

**Bottom line: chemistry went from an empty scaffold folder to a fully buildable subject at parity with physics — architecture + phased plan (Rule 17, founder-approved), the `chemistry_author` agent role + pattern library, subject-aware catalog plumbing (physics output proven BYTE-IDENTICAL), a founder-requested parity audit that hardened all four shared agent specs + the build/verify tooling, and a locked international-first, renderer-compounding build flow. Physics untouched throughout (tripwire green after every phase). 5 commits on `feat/chemistry-foundation`, NOT pushed. NO chemistry concept authored yet — next session builds Rutherford α-scattering (Wave 1, prove-first).**

### Phases delivered
- **Phase 0 — baseline (`d25cdc4`, `4a3cbf5`):** fixed a real repo bug (committed lockfile out of sync → `npm ci` failed repo-wide, missing @emnapi entries; proven fixed). Locked the isolation-contract comment in `validate-concepts.ts` (non-recursive scan = chemistry invisible to physics validation BY DESIGN). Installed the local agent-sync pre-commit hook. Recorded the green tripwire baseline.
- **Phase 2 — authoring layer (`d31f6c4`):** `.agents/chemistry_author/CLAUDE.md` (+ emission, sonnet-5 pin) — balanced-equation-ledger doctrine (atom/charge conservation, redox e⁻ balance), chemistry units first-class, [LIVE]-archetype-only interim rule. `docs/patterns/chemistry.md` — representation triangle (macro↔particulate↔symbolic), archetypes K–Q with renderer-gating, chemistry source roles (NCERT Chemistry backbone + NCERT Exemplar misconceptions + universal anchors). Governance: 11-role roster, `alex:chemistry_author` owner tag everywhere.
- **Phase 1 — curriculum plumbing (`c6bfb03`):** `Subject` type (client-safe); `src/lib/chemistryCatalog.ts` (NCERT Cl.11 Ch.1–4 maps + Ch.2 roadmap ghosts); `conceptCatalog.ts` routes by `subject` as a PARAMETER (default physics), NOT a stored field — physics API output proven byte-identical via a throwaway function-level diff harness. `?subject=` on both catalog routes; `/learn` label un-hardcoded (toggle deferred to Phase 3); separate `NCERT_CHEMISTRY_BOUNDARIES`.
- **Phase 2.5 — parity hardening (`ed49664`):** founder asked "is chemistry as strong as physics? why wasn't the architect changed?" — a two-audit pass (agent specs + serving-path tooling) found the four shared specs would misfire on a chemistry run (architect never referenced chemistry.md → violated chemistry_author's input contract by construction; auditor had no `alex:chemistry_author` FAIL route + Gate 2 would false-FAIL; json_author's 8-site registration inverted for chemistry; eye_walker lacked chemistry visual-sanity checks). Fixed with ADDITIVE "Chemistry concepts (2026-07-23)" sections in all four canonicals (+0 deletions, emissions regenerated same-session). Tooling: new shared `src/scripts/lib/resolveConceptJson.ts` (flat physics path FIRST = byte-identical; logs on chemistry resolution) wired into the 3 flat-hardcoded loaders — including fixing a SILENT-degradation trap (a missing chemistry JSON used to quietly disable THE EYE's Category I/E, now an explicit warning). New `npm run validate:chemistry` v0. Addenda to AUTHORING_PIPELINE.md + root CLAUDE.md (3 lines, founder-approved).

### Strategy locked this session (detail → CHEMISTRY_DISCUSSIONS.md)
- **Verdict: extend, don't duplicate.** The subject-neutral spine (schema, Rule 31/32/33/34 pacing/legibility, TTS, EYE motion-reading, catalog) transfers. Chemistry-specific work is concentrated in exactly two seams: the rigor role (chemistry_author — DONE) and the render surface (Phase 5). ONE shared architect/auditor/eye_walker with chemistry-aware SPECS, not sibling roles.
- **International + NCERT at once (the founder's priority):** chemistry's "universal passport" = the *physical chemistry of change* cluster (kinetic theory → rates → energetics → equilibrium) — both the highest cross-curriculum overlap AND the most simulatable, per Rule 38 + Session-86 market sizing + Topic-14 simulatability. Served by concept CHOICE (the passport concepts sit in every board) + Rule 38 depth-rings (NCERT depth authored, lighter boards hide the advanced ring).
- **Renderer reality check (verified):** `particle_field_renderer` is entirely circuit-shaped — NO gas-particle/collision scenario exists. So archetype M (particle-box) is NOT [LIVE]; it needs a modest scenario built once (then reused across the whole passport cluster). The ONLY true zero-renderer-cost start is Rutherford (archetype K, reuses the built trajectory engine). **`docs/patterns/chemistry.md` mislabels M as [LIVE] — flagged for correction.**
- **Decision (founder): prove-first.** Wave 1 = Rutherford α-scattering (zero renderer, validates the whole chemistry pipeline). The particle-box investment + the passport cluster follow in Wave 2.

### Verification (evidence)
`tsc` 0 · `validate:concepts` 124/124 (physics untouched) · `validate:chemistry` 0/0 PASS (empty namespace) · vitest 288/288 · agents 11/11 in sync · `build:review faraday_law_induction` exit 0 with zero resolver log lines (physics path silent) · chemistry-side resolution probed + logged.

### Environment notes (new machine)
Repo migrated from Windows (`C:\Tutor\...` paths in docs are historical). `~/.claude/rules/agent-teams-reference.md` (referenced by governance) does NOT exist on this laptop — the hard rules survive verbatim in `.agents/CLAUDE.md`, but the original external file should be recovered/re-authored. 2 pre-existing `react-hooks/set-state-in-effect` lint errors in `learn/page.tsx` (present on HEAD, untouched).

### ⏭ NEXT SESSION — Rutherford α-scattering (Wave 1, prove-first)
The first chemistry vertical slice through the full pipeline, on the registration-free review-site path:
1. **Concept correction first (small):** fix the archetype-M `[LIVE]` mislabel in `docs/patterns/chemistry.md` (add a "needs-a-scenario" tier between [LIVE] and [PHASE-5]); optionally re-seed the roadmap ghosts around the international wave order.
2. **Pipeline:** `architect` skeleton (chemistry sources + `docs/patterns/chemistry.md` archetype K; DoD = balanced-equation-ledger variant, RHR N/A) → `chemistry_author` block (α-particle trajectory geometry, closest-approach `d = kQq/E`, the ONE formula surface of the aha state) → `json_author` emits `src/data/concepts/chemistry/rutherford_alpha_scattering.json` (site #1 ONLY — sites 2/3/4/7/8 forbidden; reuse a `field_3d_config` on the force-in-field machinery) → `quality_auditor` (chemistry gates: ledger correctness N/A for a physics-experiment concept, but conservation/units apply; `validate:chemistry` PASS).
3. **Visual:** needs a `simulation_cache` row → a chemistry cache-seed script that reads the chemistry subdir (Phase-3 per-concept file) → `visual:eyes` (THE EYE) → `eye_walker` → founder review → `build:review -- rutherford_alpha_scattering`.
4. **Prereq to watch:** THE EYE reads the sim from Supabase `simulation_cache`, not the JSON — so the cache-seed step is the gate. The review-site path (`build:review`) renders straight from the JSON and needs no cache.
