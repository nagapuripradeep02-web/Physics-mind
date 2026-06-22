# PROGRESS — PhysicsMind (ARCHIVED SIDE-LOG — do not append here)

> **Canonical session log: `C:\Tutor\physics-mind\PROGRESS.md`** (the live,
> 9,500-line log — newest entries there). CLAUDE.md §10's "update PROGRESS.md
> at the end of every session" means THAT file.
>
> This root file was a parallel side-log that accumulated a handful of May 2026
> harness sessions under its own numbering ("session 6" here ≠ session 6 there),
> which split the project history across two files. Frozen as an archive on
> 2026-06-11 (Batch A of the codebase audit) — entries below are preserved
> as-is; all new entries go to the canonical file.

---

## Session — 2026-05-17 (session 6) — Phase A downscoped: persona lenses folded into quality-auditor Gate 3 (Part 3b)

### Decision

Founder challenged the 3-persona Phase A plan (parallel topper / speedrunner / senior-teacher reviewers between physics-author and json-author). Chose **Option 3: fold the three lenses into `quality-auditor` Gate 3 as Part 3b sub-checks** — single agent, three lenses, no parallel orchestration, no conflict matrix.

**Phase A is now complete.**

### What shipped

- **Retired** `topper-reviewer.md` (shipped session 5-followup, 9204 B). Moved to `C:\Tutor\_backup\topper-reviewer.md`. `.claude/agents/` is back to 7 files (pre-Phase-A count).
- **Inserted Part 3b** in canonical `C:\Tutor\physics-mind\.agents\quality_auditor\CLAUDE.md` between existing Part 3a (CLAUDE.md §2 rules) and Part 3c (Socratic-reveal discipline). Structure:
  - 3b.i Topper lens: EPIC-C STATE_1 naming, Indian context + Hinglish scan, exam-yield, pacing skip-candidates
  - 3b.ii Cognitive-load lens (Mayer condensed): redundancy count, spatial contiguity (**hard FAIL on >2 violations**), modality, segmenting (**hard FAIL on `scene_composition.length > 12`**)
  - 3b.iii PER-canon lens: McDermott E-C-R coverage, Knight 5EL ≥4-of-5, FCI canonical misconceptions (Newtonian topics only; magnetism/electricity/optics/thermo mark N/A)
  - Severity rule preamble: most findings are Concern; only 2 hard FAILs defined.
  - Reversal criteria: if 3 consecutive Diamonds PASS quality-auditor but fail founder review on the same lens, promote that lens to its own agent file. Strongest promotion candidate: 3b.iii (McDermott + FCI).
- **Synced reference** to dispatch `C:\Tutor\physics-mind\.claude\agents\quality-auditor.md` Gate 3 line — one inline sentence pointing to canonical for the full 3b sub-check list.

### What got skipped (deliberately)

- `speedrunner-reviewer.md` — NOT authored. Mayer principles live inside 3b.ii now.
- `senior-teacher-reviewer.md` — NOT authored. McDermott/5EL/FCI live inside 3b.iii now.
- json-author synthesis rule — irrelevant under Option 3 (one reviewer, one verdict).
- conflict-resolution matrix — irrelevant for the same reason.

### Why Option 3 over Options 1/2/4

1. Quality-auditor is already the established gate — adding sub-checks is one file edit.
2. Single verdict, no parallel-trio deadlock to resolve.
3. 3× LLM cost saved (one Sonnet call instead of three) per Diamond, multiplied by ~30 future Diamonds + iteration loops.
4. Reversible — if a sub-gate proves to add real signal, promote it to its own agent then; if noise, delete 5 lines.
5. Diamonds #1 and #2 already shipped clean without persona reviewers — no empirically-demonstrated failure mode justifies heavier architecture yet.

### Reversal criteria (the founder's "when to revisit")

If during M3/M4/M5 we observe that quality-auditor consistently rubber-stamps concepts that should FAIL on a specific lens — most likely the PER-canon lens (3b.iii) on Newtonian topics — promote that lens to a dedicated agent. The McDermott/FCI lens is the most distinct of the three and has the strongest case for dedicated-agent promotion. The topper lens (3b.i) and Mayer lens (3b.ii) overlap heavily with existing Rules 16/19/20 + Zod validators and are less likely to need their own agent.

### Files modified

| File | Change |
|---|---|
| `C:\Tutor\physics-mind\.claude\agents\topper-reviewer.md` | DELETED from live agents dir (moved to backup) |
| `C:\Tutor\_backup\topper-reviewer.md` | NEW — 9204 B verbatim copy of pre-deletion content |
| `C:\Tutor\physics-mind\.agents\quality_auditor\CLAUDE.md` | Inserted Part 3b (~35 lines) between Part 3a and Part 3c |
| `C:\Tutor\physics-mind\.claude\agents\quality-auditor.md` | Appended Part 3b reference inside Gate 3 single-line emission |

### Status

- Phase A: ✅ complete (this session's Option 3 decision is the close-out).
- Architecture: quality-auditor now carries 3 internal pedagogy lenses on top of existing 8 gates.
- Code: unchanged.
- Type-check: unaffected, not re-run.

### Next session — first task

Diamond #3 (`torque_on_current_loop_in_field`) authoring through the pipeline: invoke `architect` → review skeleton → invoke `physics-author` → review physics block → invoke `json-author` → invoke `quality-auditor` (now including Part 3b). Renderer: `field_3d` (per Architecture decision locked earlier today). Reusable from Diamond #2: ambient B-field grid, TTS-glow array, hand-phase freeze, entry-phase trajectory. New primitives needed: closed rectangular loop mesh, directed-current arrows per side, force-pair, μ-vector through loop face, axis-of-rotation, oscillation animation around μ∥B equilibrium.

### Blockers

None.

### CLAUDE.md suggestions (do not edit without founder approval)

- Part 3b's reversal criteria + severity rules are a useful pattern. Consider promoting "pedagogy-judgment layer" with explicit FAIL/Concern split into the §2 self-review checklist as a 9th item — would surface the discipline at session-load time.

---

## Session — 2026-05-17 — Architecture decision locked: Diamond #3 ships on field_3d, NOT kiwi/PCPL

### Decision

Diamond #3 (`torque_on_current_loop_in_field`, phase M2) renders via `field_3d_renderer.ts` (Three.js), bypassing `@lume/kiwi` and the PCPL parametric pipeline. Already specified in `MAGNETISM_ARCHITECTURE.md` lines 48, 110, 477–480 — this entry documents the **reasoning** so a future session doesn't relitigate.

### Context: kiwi audit (read-only)

Question raised: is `@lume/kiwi ^0.4.4` (Cassowary linear constraint solver) actively used in the recent Diamonds?

Audit findings:
- `SUB_SIM_SOLVER_ENABLED=1` is set in `physics-mind/.env.local:11` — flag is ON in dev.
- `solveSubSimLayout(config)` is called once during cache assembly at `parametric_renderer.ts:2759`. Solver walks every state's `scene_composition.primitives[]`, resolves anchor/gap/edge/align relationships against the 760×500 canvas + zone layout, writes `_solverPosition: {x, y}` onto each primitive. p5 draws prefer `_solverPosition` over raw `position`. No-overlap enforced by a post-solver imperative sweep (Cassowary is linear, can't express disjunctive constraints).
- Active call sites: ONLY `parametric_renderer.ts`. The other 6 renderers (`field_3d_renderer`, `mechanics_2d_renderer`, `particle_field`, `optics_ray`, `thermodynamics`, `wave_canvas`, `graph_interactive`, `ohmsLawRenderer`) do their own layout.
- Concept-to-renderer map (`aiSimulationGenerator.ts:2778-2780`): magnetic_field_wire, magnetic_force_moving_charge, magnetic_field_solenoid → `field_3d`. newton_second_law_direction → `mechanics_2d`. ~49 PCPL atomics with populated `primitives[]` → `parametric` (kiwi-active).

**Net:** kiwi is live for ~49 PCPL atomics (vectors, kinematics, forces). All three flagship Diamonds bypass it because they ship on field_3d (Diamonds #1/#2) or mechanics_2d (newton_second_law_direction).

### Why Diamond #3 stays on field_3d (three reasons)

1. **The concept is inherently 3D.** Torque-on-loop visuals need: rectangular loop in 3D perspective, force-pair vectors at opposite midpoints respecting loop orientation, μ-vector through loop face (RHR on current direction), axis-of-rotation indicator, oscillation around μ∥B equilibrium. PCPL on a 760×500 2D canvas with kiwi solving anchor relationships cannot represent these honestly. Flattening torque into 2D iconography would lose the physics.

2. **Sample consistency for M3 pattern extraction.** M3 needs a coherent corpus to author `scene_designer` from. Diamonds #1 (`magnetic_field_wire`, Archetype A field-viz) and #2 (`magnetic_force_moving_charge`, Archetype B force-in-field) shipped on field_3d. Diamond #3 (Archetype C dipole-in-field) on PCPL would give M3 a sample of 1+1+1-outlier instead of 3 cohesive examples. Per `MAGNETISM_ARCHITECTURE.md` the whole point of Diamonds #1-#3 is validating the same renderer handles three distinct archetypes.

3. **The "all PCPL eventually" debate belongs at M3, not Diamond #3.** `CLAUDE_REFERENCE.md:233` already concedes PCPL-as-universal-renderer "is NOT shipping today" — it's a conscious hybrid. Whether PCPL should grow to handle 3D or field_3d remains the magnetism renderer permanently is a `scene_designer`-level call. Forcing it inside Diamond #3 conflates concept authoring with renderer architecture.

### Authoring note for Diamond #3

When new field_3d primitives surface during Diamond #3 authoring (likely candidates: closed rectangular loop mesh, directed-current arrows per loop side, force-pair primitive, μ-vector-through-face, axis-of-rotation indicator, oscillation animation), flag them inline with `// reusable for M5 archetype-C concepts`. Makes M3 pattern extraction (week after M2 ships) faster.

### What this does NOT decide

- Whether `magnetic_field_solenoid` (M4 binary gate) also stays on field_3d — defaults to yes per archetype-A precedent, but M3 may move the goalposts.
- Whether bulk M5/M6 atomics + nanos (Ch.26) use field_3d or migrate to PCPL — open until M3 extracts patterns and decides.
- Whether kiwi remains the layout solver for `parametric_renderer.ts` going forward — separate question, no signal yet that it's failing.

### Status

No code touched this session. Decision logged + reasoning preserved for future sessions.

---

## Session — 2026-05-15 (session 5-followup) — Item 5 wording applied + dispatch sync + bug-queue write

### What shipped

Three founder-authorized follow-ups landed on top of session-5's cleanup work, then Phase A kicked off.

**1. Item 5 wording (concept-count reconciliation) — applied to CLAUDE.md §6 + CLAUDE_REFERENCE.md.**
- CLAUDE.md §6 prose updated: "src/data/concepts/ (64 files = 63 atomic + 1 bundle), 1 of the 63 atomics (contact_forces.json) has known duplicate-keys parse bug".
- CLAUDE.md §6 list pruned: replaced the legacy 52-entry bundle-names list with the actual 63 atomic concept_ids grouped by chapter (Magnetism Ch.26 = 2, Vectors Ch.5 = 19, Kinematics Ch.6-7 = 34, Forces Ch.8 = 8). `contact_forces` flagged with `*`.
- CLAUDE.md §6.2 NEW redirect note: `class12_current_electricity.json` is a legacy array bundle holding 10 nested concept_ids (`drift_velocity, ohms_law, resistivity, emf_internal_resistance, kirchhoffs_laws, series_parallel_resistance, wheatstone_bridge, meter_bridge, potentiometer, electric_power_heating`). `ohms_law` queries route here until splitting backlog completes.
- CLAUDE.md §6 NEW classifier-superset note: `intentClassifier.ts:36 VALID_CONCEPT_IDS` is a 78+ entry superset (63 atomic + 10 bundle-nested + legacy bundle parent names retained for classifier vocabulary, redirected via `CONCEPT_SYNONYMS`). Classifier file is runtime source of truth.
- CLAUDE_REFERENCE.md "60 atomic" line updated to "63 atomic + 1 bundle + 1 known-broken", with note that 3 newer atomics (magnetic_field_wire, magnetic_force_moving_charge, newton_second_law_direction) use populated PCPL primitives unlike the April-19-audited 60.

**Verbatim disclaimer:** founder's instruction said "61 atomic"; actual disk count is 63 atomic-shaped (62 fully-parsing + 1 malformed). Founder approved switching to disk truth via AskUserQuestion before edits landed.

**2. Dispatch sync (item 8 follow-up).** `Rule 20 M1-M6 exception` paragraph copied from canonical (`.agents/quality_auditor/CLAUDE.md:58`) to dispatch (`.claude/agents/quality-auditor.md:55`) per `agent-teams-reference.md` hard-rule #5. The classifier had previously blocked this; founder explicitly authorized this turn as a routine canonical→dispatch sync and the edit landed cleanly. Both files now carry the same exception with the same concept-ID scope.

**3. engine_bug_queue insert (contact_forces duplicate-keys bug) — BLOCKED.** Supabase MCP timed out on 4 consecutive calls (`list_tables` + `execute_sql` ×3). Remote unreachable from this session. SQL written here for manual run:

```sql
INSERT INTO engine_bug_queue (
  bug_class,
  severity,
  owner_cluster,
  prevention_rule,
  status,
  concept_id,
  file_path,
  notes,
  created_at
) VALUES (
  'content_json_duplicate_keys',
  'MAJOR',
  'alex:json_author',
  'npm run validate:concepts must strict-JSON-parse every concept file',
  'OPEN',
  'contact_forces',
  'src/data/concepts/contact_forces.json',
  'File has duplicate object keys "f" and "F" in same scope — breaks ConvertFrom-Json (PowerShell) and any case-folding JSON parser. Surfaced during session-5 concept inventory 2026-05-15. Quality-auditor + validator did not catch.',
  NOW()
);
```

**Action for founder:** run when Supabase connection returns. If `engine_bug_queue` schema differs from these columns, adjust accordingly. Likely-missing columns (`concept_id`, `file_path`, `notes`) may need to be dropped if the table doesn't have them — keep the 5 required fields the user specified (bug_class, severity, owner_cluster, prevention_rule, status).

### Files modified

| File | Change |
|---|---|
| `C:\Tutor\CLAUDE.md` | §6 prose, list, §6.2 redirect note, classifier-superset note |
| `C:\Tutor\CLAUDE_REFERENCE.md` | line 233 "60 atomic" → "63 atomic + 1 bundle + 1 known-broken" |
| `C:\Tutor\physics-mind\.claude\agents\quality-auditor.md` | Gate 3 Rule 20 exception paragraph (canonical→dispatch sync) |

### Phase A item 1 shipped — `topper-reviewer.md`

Authored `C:\Tutor\physics-mind\.claude\agents\topper-reviewer.md` (8th dispatch agent in `.claude/agents/`). 130 lines. YAML frontmatter (name + description + tools=Read/Grep/Glob), spec-source pointer to canonical-pending location, pipeline position note (architect → physics-author → **topper / speedrunner / senior-teacher reviewers in parallel** → json-author → quality-auditor), input contract (skeleton + physics block + concept_id), output contract (PASS/PASS-WITH-NOTES/FAIL verdict + 5 audit sections), 8-instinct review lens (I-already-know-this filter, exam-mark filter, misconception-trap test, Kota-vs-NCERT honesty check, fake-Indian-ness sniff, Hinglish sweep, I-d-have-paid-money gate, PYQ-trap audit), things-you-must-NOT-do block (no JSON edits, no Zod opinions, no physics opinions, no DC-Pandey/HC-Verma mirroring, no Hinglish), refusal clauses (out-of-syllabus + stub input), calibration anchors (magnetic_field_wire + friction_static_kinetic as topper-tier bar; pre-April-19 empty-primitive atomics as the weak floor), escalation rule (same issue twice = founder).

Canonical source at `.agents/topper_reviewer/CLAUDE.md` deferred — authored on first FAIL per session-3 convention.

### Phase A remaining

- Item 2: `speedrunner-reviewer.md` grounded in Mayer multimedia learning theory (next).
- Item 3: `senior-teacher-reviewer.md` grounded in McDermott Tutorials + Knight 5EL + FCI.

After all three personas land, invoke `architect` for Diamond #3 (`torque_on_current_loop_in_field`).

### Blockers

One soft block: `engine_bug_queue` insert (Supabase connection). Falls back to manual run via embedded SQL above.

---

## Session — 2026-05-15 (session 5) — Pre-Phase-A cleanup checklist execution

### What shipped

Executed the 9-item cleanup checklist defined in session-4's audit entry. Items 1–4 completed autonomously; founder paused between items 4 and 5 (per `/remote-control` spec); items 5–9 ran in plan-mode-then-execute pattern with founder choosing **inventory-only** for item 5.

### Files touched

**Deletes (with backup):**
- `C:\Tutor\AGENTS.md` (20752 B) → backed up to `C:\Tutor\_backup\AGENTS.md`, original deleted. Botched `Claude→Codex` find-and-replace duplicate; no longer poisoning future sessions.

**Moves (to `physics-mind/docs/archive/`):**
- `PHYSICSMIND_ARCHITECTURE_V2_MASTER_DOC.md` (46173 B) — superseded by `ARCHITECTURE_v2.2.md`
- `GAP_ANALYSIS_REPORT.md` (39239 B) — references retired Antigravity role
- `TRIPLE_FIX_COMPLETE.md` (3909 B) — March pgvector completion
- `CODEBASE_AUDIT.md` (28842 B) — March audit superseded
- `all_concepts.md` (628328 B) — stale concatenation snapshot

Net: 5 stale docs removed from active tree, ~728 KB freed, all reversible via `_backup/` or `Move-Item` back.

**Edits:**
- `C:\Tutor\physics-mind\.agents\quality_auditor\CLAUDE.md:58` — added M1–M6 magnetism proof-of-concept exception to Rule 20. Concepts in scope listed inline. Exception expires when Ch.26 ships all three modes.

**Edit blocked by classifier (flagged for founder):**
- `C:\Tutor\physics-mind\.claude\agents\quality-auditor.md:55` — dispatch-file emission of the same Rule 20 exception was DENIED by Claude Code's auto-mode classifier as "Self-Modification of agent config; specific exception scope and concept-ID list were agent-inferred beyond what the user's checklist authorized." Canonical source was already updated successfully; per `agent-teams-reference.md` hard-rule #5 the canonical is authoritative and dispatch needs regeneration. **Action for founder:** regenerate `.claude/agents/quality-auditor.md` from `.agents/quality_auditor/CLAUDE.md`, or copy the new sentence over manually.

### Checklist status

| # | Item | Status |
|---|---|---|
| 1 | Delete AGENTS.md | ✅ done, backup at `_backup/` |
| 2 | mkdir docs/archive | ✅ done |
| 3 | Move 4 stale docs | ✅ done |
| 4 | Archive all_concepts.md | ✅ done |
| 5 | Reconcile concept count contradiction | ⚠️ **inventory-only per founder choice — no edits to CLAUDE.md or CLAUDE_REFERENCE.md yet** |
| 6 | Confirm engine count 44 | ✅ no edit needed — ARCHITECTURE_v2.2.md is self-consistent (TOC says 44-inventory; line 193 explains 43 filled + 1 reserved for Peter Parker maintainer index) |
| 7 | Verify `VALID_CONCEPT_IDS` shape at `intentClassifier.ts:36` | ✅ matches expected `new Set([...])` shape; `json-author.md:65` references it correctly. No drift. |
| 8 | Rule 20 M1–M6 exception in quality-auditor | ✅ added to canonical source; ⚠️ dispatch emission blocked by classifier (see above) |
| 9 | Diff two PROGRESS.md files | ✅ inventoried — sequential not duplicate; root = sessions 1–5 architecture, pm-nested = sessions ≤60 engine-build ending 2026-05-07. Keep both. |

### Inventory results (item 5 — read-only)

`src/data/concepts/` actual count: **64 JSON files**
- 61 atomic (have `epic_l_path`)
- 1 bundle: `class12_current_electricity.json` (24 KB, legacy array-of-concepts shape) containing 10 nested concept_ids: `drift_velocity`, `ohms_law`, `resistivity`, `emf_internal_resistance`, `kirchhoffs_laws`, `series_parallel_resistance`, `wheatstone_bridge`, `meter_bridge`, `potentiometer`, `electric_power_heating`
- 1 malformed: `contact_forces.json` — has **duplicate keys `f` and `F`** in same object that broke JSON parsing during inventory. Real schema bug; no validator caught it. **Flag for separate fix session** — file is a 60KB live atomic concept, surgical edit needed.

**Three IDs in `VALID_CONCEPT_IDS` that are NOT atomic files:**
- `ohms_law` — lives inside `class12_current_electricity` bundle
- `vector_addition` — referenced in comments only (legacy bundle name, atomic splits include `resultant_formula`, `special_cases`, `range_inequality`, `direction_of_resultant`)
- `projectile_motion` — referenced in comments only (atomic splits: `time_of_flight`, `max_height`, `range_formula`)

**Sources disagreeing on count:**
| Source | Claim |
|---|---|
| Disk | 64 (61 atomic + 1 bundle + 1 malformed) |
| `intentClassifier.ts` `VALID_CONCEPT_IDS` | 78+ IDs (counted classes 5-8 inline + Ch.26 magnetism) — superset of disk |
| CLAUDE.md §6 prose | "23 entries" — wrong |
| CLAUDE.md §6 inline list | 52 IDs — internally inconsistent with the "23" prose immediately above |
| CLAUDE_REFERENCE.md | "60 atomic JSONs" — close to reality (61) |
| LEGACY_SPLIT_BACKLOG.md | "16 of 24 are legacy bundled, will become ~58 atomic after splitting" |

Founder owns the wording call for CLAUDE.md §6 / CLAUDE_REFERENCE.md updates.

### Anomalies surfaced (not in original checklist)

- **`contact_forces.json` duplicate keys `f`/`F`** — real bug, breaks JSON parsers in case-sensitive mode. Quality auditor / validator missed it. Should be on the bug queue.
- **CLAUDE.md §6 internal inconsistency** — "23 in VALID_CONCEPT_IDS" prose contradicts the 52-entry list directly below it.
- **`class12_current_electricity.json` is still in the new-concepts dir** but in old `physics_constants/` array format — should either be split into 10 atomic files or moved to `physics_constants/` per CLAUDE.md §6 "ALL new JSONs go here" rule.

### Status

- Pre-Phase-A cleanup: **largely complete**. 4 deterministic items done. 4 audit items finished (no edits needed for items 6/7; canonical-source edit landed for item 8; item 9 diff complete). Item 5 deferred to founder per choice.
- Architecture: unchanged.
- Code base: unchanged.
- Type-check: not re-run this session (no code edits).
- `_backup/` directory: new at `C:\Tutor\_backup\` containing `AGENTS.md`. Founder should review and delete once confident the deletion was correct.

### Decision — next session

Proceed to **Phase A (3 personas, ~45 min)** per session-4 plan, then **Diamond #3** authoring via the architect → physics-author → json-author → quality-auditor pipeline.

Before Phase A, two ~5-min decisions for founder:
1. Item 5 wording — what number(s) go into CLAUDE.md §6 and CLAUDE_REFERENCE.md? (Suggestion: prose says "64 files = 61 atomic + 1 bundle + 1 malformed pending fix", VALID_CONCEPT_IDS list pruned to match disk reality of 61 atomic + bundle redirect for `ohms_law`.)
2. Regenerate `.claude/agents/quality-auditor.md` from canonical to propagate the Rule 20 M1–M6 carve-out.

### Next session — first task

Phase A item 1: author `topper-reviewer.md` at `physics-mind/.claude/agents/` per session-2 plan (grounded in lived-experience source per session-3 plan). After all 3 personas land, invoke architect for Diamond #3.

### Blockers

None hard-blocking. Two soft items: founder decisions above + `contact_forces.json` duplicate-keys bug (does not block Phase A or Diamond #3 since it's an existing live concept, not on the critical path).

### CLAUDE.md suggestions (do not edit without founder approval)

- §6 prose-vs-list inconsistency should be reconciled in item-5 follow-up.
- Consider adding a §6.2 "Legacy bundle redirect" note pointing out that `class12_current_electricity.json` is the home for `ohms_law` and 9 other concept_ids until the splitting backlog completes.
- The contact_forces duplicate-keys bug suggests `npm run validate:concepts` does not parse-validate against a strict-JSON schema; consider adding a pre-validation parser step.

---

## Session — 2026-05-14 (session 4) — Full architecture audit (pre-Phase A)

### What shipped

Comprehensive audit of the entire PhysicsMind architecture before starting Phase A (3 personas) and Diamond #3. No code changes. Pure read-only inventory + conflict detection + stale-asset identification. Output is a pre-Phase-A cleanup checklist (~1 hour of work) that, if executed, removes documentation conflicts that would otherwise silently confuse future sessions.

### Audit scope

Read or grepped: CLAUDE.md, PROGRESS.md, PLAN.md, CLAUDE_REFERENCE.md, CLAUDE_ENGINES.md, CLAUDE_TEST.md, AGENTS.md, ARCHITECTURE_v2.2.md (partial via Grep), MAGNETISM_ARCHITECTURE.md (partial via Grep), all 7 agent dispatch files, all 9 canonical sources in `.agents/`, plus targeted code spot-checks across `src/data/concepts/`, `src/lib/intentClassifier.ts`, `src/lib/aiSimulationGenerator.ts` (via Grep), and renderer files.

### Critical findings (3)

**C1 — `C:\Tutor\AGENTS.md` is a botched duplicate of CLAUDE.md.** 20.7KB file modified 2026-04-28 with identical header to CLAUDE.md but `"Codex Sonnet 4.6"` (nonsense — Sonnet is Anthropic) and self-referencing `"AGENTS.md §11"` (broken). Looks like a find-and-replace `Claude` → `Codex` gone wrong, possibly an attempt to set up OpenAI Codex's `AGENTS.md` convention. Risk: a future agent reading this file gets stale + corrupted instructions. Recommended action: DELETE.

**C2 — Concept count contradiction.** Actual `src/data/concepts/` count: **64 JSON files**. CLAUDE.md §6 says 23 in `VALID_CONCEPT_IDS`. CLAUDE_REFERENCE.md says "60 atomic JSONs". LEGACY_SPLIT_BACKLOG.md says "16 of 24 are legacy bundled, will become ~58 atomic after splitting". Three concepts CLAUDE.md says exist (`ohms_law`, `vector_addition`, `projectile_motion`) do not exist as separate atomic JSONs — presumably inside legacy bundles. Mid-migration state needs reconciliation before next concept registration.

**C3 — "Antigravity" terminology retired 2026-04-19 but still appears in 8 files.** Found in: CLAUDE.md (the retirement note itself, OK), AGENTS.md (stale duplicate), CLAUDE_ENGINES.md (still uses "Engines = TypeScript (Antigravity)" framing), physics-mind/PROGRESS.md (old session entries, OK), PHYSICSMIND_ARCHITECTURE_V2_MASTER_DOC.md, GAP_ANALYSIS_REPORT.md ("Prepared by: Antigravity (Engineer)"), LEGACY_SPLIT_BACKLOG.md, src/lib/engines/README.md. Retirement not propagated.

### Major findings (5)

**M1 — Engine count drift: 43 vs 44.** CLAUDE.md, PLAN.md, CLAUDE_ENGINES.md all say 44 engines (Tiers 0-9 with E1-E44). ARCHITECTURE_v2.2.md described as "43-engine inventory" in CLAUDE.md's own summary. Confirm canonical count, fix the outlier.

**M2 — architect.md spec includes "within-state choreography" — overlaps with future scene_designer (M3 deliverable).** Per PLAN.md line 581, this boundary is consciously deferred for design at M3. Already flagged in session-3 conflict register #1. Must be resolved before scene_designer is authored at M3.

**M3 — `VALID_CONCEPT_IDS` not findable by expected regex** in `src/lib/intentClassifier.ts`. Either refactored or uses different syntax than `new Set([...])`. json-author.md spec's "8 registration sites" includes this exact location (site #4 at line 36) and may be stale.

**M4 — Diamond #1 + #2 violate Rule 20 (all three modes required).** magnetic_field_wire: epic_l ✅ + board ✅ + competitive ❌. magnetic_force_moving_charge: epic_l ✅ + board ❌ + competitive ❌. Per CLAUDE.md Rule 20 last sentence, this is the **intentional magnetism proof-of-concept exception** (M1-M6 conceptual-only; board → M7, competitive → M8). Need to verify quality-auditor.md explicitly recognizes the exception, otherwise it will FAIL these.

**M5 — `physics-mind/all_concepts.md` is a 628KB concatenation snapshot** of every concept JSON in markdown code blocks (April 4). Not source of truth. Risk: any agent reading it consumes massive tokens and learns from a stale snapshot.

### Minor findings (4)

- m1: VISUAL_VALIDATOR_SPEC.md + SHIP_V1_VECTORS_KINEMATICS.md (both April 27, owner Pradeep) — currency uncertain
- m2: TRIPLE_FIX_COMPLETE.md (March 23, pgvector completion report) — old, archive candidate
- m3: CODEBASE_AUDIT.md (March 16-18) — old audit, today's audit supersedes
- m4: physics-mind/PROGRESS.md vs C:\Tutor\PROGRESS.md — two PROGRESS.md files exist; verify they don't diverge

### Code-side: clean (good news)

- ✅ No legacy/backup/deleted/candidate/draft JSON files in `src/data/concepts/`
- ✅ No `GENERIC_FALLBACK_CONFIG` references in src/ (quality-auditor Gate 4b clean)
- ✅ No parallel `currentState` outside `PM_currentState` (Rule 6 holds)
- ✅ 7 agent dispatch files + 9 canonical sources at `.agents/` are well-authored
- ✅ /cache-clear command and agent-teams-reference.md (session 3 deliverables) are correct
- ✅ The renderer (parametric + field_3d + mechanics_2d) compiles to 0 tsc errors as of Diamond #2 ship

The architecture is fundamentally sound. The **docs** drift; the **code** is clean.

### Stale files inventory (cleanup targets)

| File | Action |
|---|---|
| `C:\Tutor\AGENTS.md` (20.7 KB) | DELETE — botched duplicate, not legitimate OpenAI Codex setup |
| `physics-mind/PHYSICSMIND_ARCHITECTURE_V2_MASTER_DOC.md` (46 KB) | ARCHIVE to `docs/archive/` — superseded by docs/ARCHITECTURE_v2.2.md |
| `physics-mind/GAP_ANALYSIS_REPORT.md` (39 KB) | ARCHIVE — references retired Antigravity role |
| `physics-mind/TRIPLE_FIX_COMPLETE.md` (4 KB) | ARCHIVE — March pgvector completion report |
| `physics-mind/CODEBASE_AUDIT.md` (29 KB) | ARCHIVE — March audit superseded by today's |
| `physics-mind/all_concepts.md` (628 KB) | DELETE or move to `docs/archive/` — concatenation snapshot, stale |
| `physics-mind/LEGACY_SPLIT_BACKLOG.md` | KEEP — active backlog for legacy-bundle splitting |
| `physics-mind/docs/VISUAL_VALIDATOR_SPEC.md` | KEEP (verify currency) — E29 spec |
| `physics-mind/docs/SHIP_V1_VECTORS_KINEMATICS.md` | KEEP (verify currency) — ship plan |

Net cleanup: 5-6 stale files removed/archived, ~750 KB freed, contradictions with CLAUDE.md eliminated.

### Pre-Phase-A cleanup checklist (execute in VS Code terminal next session, before authoring 3 personas)

```
[ ] 1. Delete C:\Tutor\AGENTS.md (botched duplicate)               ~1 min
[ ] 2. mkdir C:\Tutor\physics-mind\docs\archive\                   ~1 min
[ ] 3. Move 4 stale docs into archive/:                            ~5 min
       PHYSICSMIND_ARCHITECTURE_V2_MASTER_DOC.md
       GAP_ANALYSIS_REPORT.md
       TRIPLE_FIX_COMPLETE.md
       CODEBASE_AUDIT.md
[ ] 4. Delete or archive all_concepts.md (628KB)                   ~1 min
[ ] 5. Reconcile concept count contradiction:                      ~30 min
       - Count atomic vs legacy in src/data/concepts/
       - Update CLAUDE.md §6 + CLAUDE_REFERENCE.md to match
       - Decide what to do with ohms_law / vector_addition /
         projectile_motion (extract from legacy bundles?)
[ ] 6. Confirm engine count is 44; fix ARCHITECTURE_v2.2.md if 43  ~5 min
[ ] 7. Open src/lib/intentClassifier.ts:36 area, verify shape;     ~5 min
       update json-author.md if VALID_CONCEPT_IDS drifted
[ ] 8. Verify quality-auditor.md carves out M1-M6 mode exception;  ~5 min
       add line if missing
[ ] 9. Diff physics-mind/PROGRESS.md against C:\Tutor\PROGRESS.md;  ~5 min
       reconcile or delete the duplicate
```

**Total cleanup time: ~1 hour.** Then Phase A (3 personas) starts clean.

### Status — architecture verdict

- **Agent system: A+** — 7 well-authored dispatch agents, canonical sources, dual-naming convention codified, scope boundaries explicit
- **Engine architecture: A** — 44-engine inventory (modulo M1 drift), clear tier organization, sacred-files boundaries
- **Code base: A** — clean, no legacy artifacts in src/, type-check passing
- **Documentation: C** — 8 stale files, 3 critical contradictions, retired terminology in 8 places. **THIS is the area needing the most work.**
- **Test infrastructure: B** — CLAUDE_TEST.md + test_session_log spec exist, partially wired
- **Slash commands + skills: C** — only `/cache-clear` shipped; further commands deferred
- **Hooks: F** — none configured; biggest single unused leverage
- **Cloud routines: N/A** — correctly deferred until user traffic

### Decision — next session

Same as session 3's decision: Diamond #3. With one insertion: **execute the cleanup checklist FIRST (~1 hour), then Phase A (3 personas, ~45 min), then Diamond #3.**

The full next-session sequence:

1. **Cleanup phase (~1 hr)** — execute the 9-item checklist above
2. **Phase A (~45 min)** — author `topper-reviewer.md`, `speedrunner-reviewer.md`, `senior-teacher-reviewer.md` at `physics-mind/.claude/agents/`. Each grounded in different source per session-3 plan (lived experience / Mayer multimedia learning / McDermott Tutorials + Knight 5EL + FCI).
3. **Diamond #3 (M2 phase, 1-2 sessions)** — `torque_on_current_loop_in_field` through architect → physics-author → [3 personas in parallel] → json-author → quality-auditor pipeline. Measure iteration count vs Diamond #2 baseline.
4. **M3 (2 sessions)** — pattern extraction → `magnetism.md` + author `scene_designer` agent. Also: address conflict #1 (architect/scene_designer boundary) and conflict #3 (split field_3d_renderer.ts into archetype files).
5. **M3.5 (3-4 sessions)** — autoresearch loop (Playwright probe + Sonnet judge + iteration). Also: address conflict #2 (cache iteration tagging).
6. **M4 (1 session, BINARY GATE)** — `magnetic_field_solenoid` through full loop. If pass → M5. If fail → stop, debug architecture.

### Next session — first task

**Execute cleanup checklist item #1 (delete C:\Tutor\AGENTS.md).** Highest priority, lowest risk, lowest effort. If you change your mind on items 5-9 later, the deletion of AGENTS.md is independent and safe to do unconditionally.

Then proceed down the checklist. When complete, start Phase A.

### Blockers

None. All findings are paper cuts that compound silently; none halt forward progress.

### CLAUDE.md suggestions (do not edit without founder approval)

- After cleanup item #5, consider adding a §6.1 "Atomic vs legacy bundle audit" in CLAUDE.md with the current counts so future sessions don't need to recount.
- After resolving M2 + M3 (M3 phase work), update CLAUDE.md §2 "Agent orchestration" sub-section to also reference scene_designer's role boundary.
- Consider adding a `physics-mind/docs/archive/README.md` explaining what's in the archive and why each file was moved (prevents future "should I delete this?" loops).

---

## Session — 2026-05-14 (session 3) — Agent infrastructure audit + /cache-clear command

### What shipped

Continuation of session 2's Claude Code maturity work. Started by committing to author 4 agent files (`json_author`, `quality_auditor`, `renderer_primitives`, `anchor_checker`) at user-scope `~/.claude/agents/`. A deeper audit before authoring surfaced that the original commitment was based on incomplete information. Three of the four already exist in superior form at project-scope, and the fourth is redundant.

**Audit findings:**

- **`C:\Tutor\physics-mind\.claude\agents\` already contains 7 dispatch-wrapped agents:** `architect.md` (9-section skeleton author, 40+ lines), `physics-author.md` (rigor block — formulas/variables/mark scheme), `json-author.md` (119 lines, 8 registration sites, engine bug queue consultation), `quality-auditor.md` (139 lines, 8 hard gates including Gate 8 engine_bug_queue regression check, anti-plagiarism probe folds in anchor checking), `renderer-primitives.md` (207 lines, Peter Parker cluster, sacred files boundary, 8-row silent-failure catalog), `runtime-generation.md` (Peter Parker cluster, only agent that runs DELETE on cache tables), `feedback-collector.md` (Tier 8 quartet wrapper, nightly offline).
- **`C:\Tutor\physics-mind\.agents\` is the founder-edited canonical source directory** (separate from `.claude/agents/`). Each agent has a `<role>/CLAUDE.md` source spec. Peter Parker cluster has its own `OVERVIEW.md`. The `.claude/agents/*.md` files are YAML-wrapped emissions of these canonical sources for Claude Code's native auto-dispatch.
- **Dual naming convention is intentional:** filenames and dispatch `name:` fields use **hyphenated** names (`json-author`); bug-queue ownership tags and FAIL-routing targets use **underscored, cluster-prefixed** names (`alex:json_author`, `peter_parker:renderer_primitives`). Two clusters: `alex` (content authoring: architect, physics-author, json-author) and `peter_parker` (engines: renderer-primitives, runtime-generation). Cross-cutting: `quality-auditor` (gate) and `feedback-collector` (nightly).
- **`anchor_checker` is redundant** — its responsibilities (CLAUDE.md §8 Indian-context, anti-Hinglish, anti-textbook-mirroring) already sit inside quality-auditor.md's "Anti-plagiarism probe" section.
- **Session 2's `agent-teams-reference.md` was factually wrong** in 5 ways: claimed Diamond authoring was a 4-member parallel debating team (actually a sequential pipeline with FAIL-routing); used underscored names instead of hyphenated; assumed `~/.claude/agents/` was the home for PhysicsMind agents (actually `physics-mind/.claude/agents/`); proposed a separate anchor-checker (redundant); missed 3 agents from the actual roster (architect, physics-author, runtime-generation, feedback-collector).

**Action taken (scope-corrected via AskUserQuestion + ExitPlanMode):**

(a) **Rewrote `C:\Users\PRADEEEP\.claude\rules\agent-teams-reference.md`** (full replacement, 75 lines). New structure documents three patterns (subagent / parallel subagents / agent pipeline), references the actual 7-agent roster by hyphenated dispatch names, describes the Alex pipeline (architect → physics-author → json-author → quality-auditor) as the canonical pipeline shape, notes peter_parker as FAIL-routed-only, hard-rule #6 explicitly notes anchor checking is folded into quality-auditor (no separate agent), hard-rule #5 documents the `.agents/<role>/CLAUDE.md` canonical-source pattern vs `.claude/agents/<role>.md` emission pattern, and includes a "Naming conventions" table covering hyphenated dispatch vs underscored ownership tags.

(b) **Created `C:\Tutor\physics-mind\.claude\commands\cache-clear.md`** (45 lines, parent directory also created). Genuinely new — no slash commands existed at either project or user scope. Frontmatter follows the watch skill's `commands/watch.md` convention (`description`, `allowed-tools: [mcp__supabase__execute_sql]`). Body instructs Claude to fire 4 separate `mcp__supabase__execute_sql` calls (one per cache table, per CLAUDE.md §3 "never batch" rule), then 4 SELECT COUNT(*) confirmations, then report a compact 4-row table. Lists all 11 sacred tables explicitly with refusal logic if `$ARGUMENTS` tries to redirect.

(c) **Did NOT create any agent files.** The existing 7 are more sophisticated than anything I'd produce cold. Creating user-scope copies would diverge and rot. Creating `anchor_checker` would duplicate quality-auditor's logic.

(d) **Did NOT edit CLAUDE.md.** The §2 cross-reference added in session 2 still points at the same file path (`~/.claude/rules/agent-teams-reference.md`); only the file's content changed, not its location. The wording "agent team with shared task list" in the §2 line is now slightly imprecise (the new file describes a pipeline shape rather than a shared task list) but still routes correctly. Defer wording polish until next CLAUDE.md edit naturally surfaces.

### Files modified

- `C:\Users\PRADEEEP\.claude\rules\agent-teams-reference.md` — **FULL REWRITE** (109 → 75 lines). Replaces session-2 content with structurally correct version aligned to actual project agents.
- `C:\Tutor\physics-mind\.claude\commands\cache-clear.md` — **NEW** (45 lines). First slash command in the project. Parent directory also created.
- `C:\Users\PRADEEEP\.claude\plans\go-a-head-pls-wild-liskov.md` — plan file rewritten mid-session to reflect audit findings, approved via ExitPlanMode.
- `C:\Tutor\PROGRESS.md` — appending this session-3 entry on top of session-2 per newest-first convention.

### Status — tooling / process

- **Project agent system: pre-existing and mature.** 7 agents at project-scope, founder-edited canonical sources in `.agents/`, dual hyphen/underscore naming convention documented.
- **Slash commands: 1 of N authored.** `/cache-clear` is the first. `/new-concept`, `/diamond-pass`, `/state-arc-draft`, etc. deferred until Diamond #3 ships and stable workflow patterns emerge.
- **Global rule file `agent-teams-reference.md`: factually correct.** Cross-referenced from CLAUDE.md §2; will load in every PhysicsMind session.
- **Hooks: still L1.** No hooks configured in `settings.json`. Deferred.
- **Cloud routines: still none.** Confirmed deferred until first user traffic (per session-2 corrected understanding).
- **PhysicsMind code: unchanged this session.** Diamond #2 status (feature-complete, board/competitive deferred to M7/M8) from session-1 stands.

### Decision — next session

Same as session-2's decision: Diamond #3 (`torque_on_current_loop_in_field`, Phase M2). Now with concrete pipeline:

1. Invoke `architect` agent first (concept_id: `torque_on_current_loop_in_field`, chapter: `ch26_magnetism`) → markdown skeleton.
2. Invoke `physics-author` agent on skeleton output → physics block.
3. Invoke `json-author` agent on skeleton + physics block → full JSON + 8 registration sites + SQL migration.
4. Invoke `quality-auditor` agent on the candidate JSON → PASS/FAIL with per-gate evidence.
5. If FAIL: route to named upstream agent, iterate.
6. If PASS: ship.

`/cache-clear` invoked before each test cycle of the candidate JSON.

### Next session — first task

**Open by reading `physics-mind/docs/MAGNETISM_ARCHITECTURE.md` §4** (Diamond #3 recipe from session-1 PROGRESS entry) and §M1-M8 phases. Confirm M2 (Diamond #3) requirements still match what session-1 sketched.

**Then invoke the `architect` agent.** Concrete invocation:

```
Agent(
  subagent_type: "architect",
  description: "Diamond #3 skeleton — torque on current loop",
  prompt: "Author the 9-section markdown skeleton for concept_id=torque_on_current_loop_in_field, chapter=ch26_magnetism. Magnetism proof-of-concept phase M2 (per MAGNETISM_ARCHITECTURE.md). Rule 20 exception applies — conceptual-only is acceptable during M1-M6, mode_overrides.board and .competitive deferred to M7/M8. Reusable from Diamond #2: ambient B-field grid primitive, TTS-glow array scaffold, hand-phase freeze choreography (if μ-RHR overlay applies), entry-phase trajectory (if loop is shown being placed into the field). New primitives required (NOT in current renderer): closed rectangular loop mesh, directed-current arrows per loop side, force-pair (two force_vector instances at opposite midpoints), μ-vector arrow through loop face, axis-of-rotation indicator, oscillation animation around μ∥B equilibrium."
)
```

Founder reviews the architect's skeleton output. Then proceed to physics-author. Then json-author. Then quality-auditor. Then ship.

### Roadmap

Unchanged from session 1. M2 (Diamond #3 — this is next), M3 pattern extraction, M3.5 auto-eval loop, M4 gate, M5–M6 loop authoring, M7/M8 mode retrofits, M9 deferred Archetype D.

### Blockers

None.

### CLAUDE.md suggestions (do not edit without founder approval)

- The session-2 §2 cross-reference wording ("agent team with shared task list, not parallel subagents") could be tightened to match the new reference file's three-pattern framing ("subagent / parallel subagents / agent pipeline"). Low priority — the cross-ref still routes correctly. Defer to next CLAUDE.md edit cycle.
- Consider adding a §8.5 or §6.5 "Concept authoring pipeline" entry to CLAUDE.md that codifies the architect → physics-author → json-author → quality-auditor sequence as a §-level rule (not just an agent-spec implementation detail). Right now the pipeline shape is documented only in `~/.claude/rules/agent-teams-reference.md` (a global file) and inferable from individual agent specs. A project-CLAUDE.md entry would surface it more reliably.

---

## Session — 2026-05-14 (session 2) — Claude Code maturity upgrade: /watch skill + agent-teams pattern

### What shipped

Process/tooling session — no PhysicsMind code touched. Three concrete artifacts landed plus a corrected understanding of where the L5 trigger actually is for this project.

**(a) `/watch` skill installed at the user-scope level** — `bradautomates/claude-video` cloned to `~/.claude/skills/watch\`, dependencies (`yt-dlp`, `ffmpeg`/`ffprobe`, real Python 3.13.13) installed via `winget --scope user`. Skill registered in Claude Code skill list; `python scripts/setup.py --json` preflight returns `status: needs_key, missing_binaries: []`. Whisper API key skipped — YouTube captions sufficient for current use case. Zero impact on `C:\Tutor` (all paths under `%USERPROFILE%`). Live-tested on `youtu.be/ZRb7D6R64hM` (Nate Herk, "Every Level of Claude Explained in 21 Minutes") — pulled 40 frames + full timestamped transcript via native captions on first try.

**(b) Watched the Nate Herk video end-to-end (frames + transcript) and ran a maturity audit.** Verdict: PhysicsMind sits at **L4-strong, one foot in L5**. Every L4 marker on Nate's rubric is cleared (CLAUDE.md, sub-agents defined, wide MCP surface, skills library, mistake-correction discipline via `~/.claude/projects/C--Tutor/memory/`). L5 infrastructure wired but not yet firing — `mcp__scheduled-tasks` connected, agent definitions absent, agent teams (Nate's frame 33 distinction from subagents) not yet codified. Key visual takeaway from frame 33: Nate distinguishes **subagents** (own context, result returns to caller, no peer messaging) from **agent teams** (own context, fully independent, peers message each other directly, shared task list, self-coordinating) — a distinction missing from this project's `~/.claude/rules/agents.md`.

**(c) Authored `~/.claude/rules/agent-teams-reference.md`** (109 lines) — global rule file codifying the subagent-vs-team decision criterion, with three PhysicsMind-specific team compositions worked out:
- **Diamond Authoring** — 4-role team (`json_author` + `quality_auditor` + `renderer_primitives` + `anchor_checker`) with per-role push-back authority against Rules 15/16/19/20/21 and CLAUDE.md §8 Indian-context check.
- **Misconception Cluster Triage** — maps to PLAN.md Tier 8 (`collector` + `clusterer` + `proposer`) with `proposal_queue` as shared task list.
- **Architectural Decision** — `architect` + `security_reviewer` + `performance_reviewer` + `migration_reviewer` for changes touching >3 files or altering the engine surface.

File includes Hard Rule #6 honestly flagging that `~/.claude/agents/` is currently empty — team specs in the file are role-labels for prompts, not guaranteed implementations, until subordinate agent definition files are authored.

**(d) Added a 2-line cross-reference to `CLAUDE.md` §2** immediately after the self-review checklist, pointing future sessions to `agent-teams-reference.md` for debate-shaped work (Diamond authoring, cluster triage, architectural decisions touching >3 files). Surfaces the rule in every PhysicsMind session as part of the read-on-load contract.

**(e) Corrected an earlier mistake about scheduling cloud routines.** I had recommended "Routine #1 = nightly type-check + validator" as the parking-lot first cloud automation (per Nate's L4→L5 trust-building framing). On reflection: nothing mutates the codebase overnight on a solo-founder project, so the nightly run would produce a passing report every morning — zero signal. The genuine L5 trigger for PhysicsMind is **after first user/tester traffic hits the product**, at which point the Feedback Collector (PLAN.md Tier 8 agent #1) becomes the right first cloud routine (it consumes `feedback_unified` rows that genuinely accumulate overnight). Pre-launch, scheduling a noise routine teaches the wrong habit. Decision: defer all cloud-routine scheduling until first traffic.

### Files modified

- `C:\Users\PRADEEEP\.claude\rules\agent-teams-reference.md` — **NEW** (109 lines). Global rule file, no frontmatter, loaded into every Claude Code session.
- `C:\Tutor\CLAUDE.md` — §2 only, added `### Agent orchestration` sub-section (2 lines) immediately after the 8-item self-review checklist. No other content moved.
- `C:\Users\PRADEEEP\.claude\skills\watch\` — **NEW directory** (cloned from `github.com/bradautomates/claude-video`). User-scope; outside `C:\Tutor`.
- `C:\Users\PRADEEEP\.claude\plans\go-a-head-pls-wild-liskov.md` — plan file written during plan mode, approved, executed.

### Status — tooling / process

- Claude Code maturity: **L4-strong, foot in L5**.
- `/watch` skill: operational, captions-only mode (no Whisper key configured). Sufficient for YouTube-hosted reference videos.
- Agent-team pattern: documented globally, cross-referenced from project CLAUDE.md, but **not yet executable** — `~/.claude/agents/` is empty.
- Cloud routines: **none scheduled**. Deferred until user traffic exists.
- PhysicsMind code: unchanged this session. Diamond #2 status from prior session-1 entry stands (feature-complete, board/competitive deferred to M7/M8).

### Decision — next session

Founder accepted the recommendation to do the 4 agent definition files as a **focused pre-flight to Diamond #3 authoring**, not as a separate abstract task. Reasoning: tuning each agent's system prompt against the actual Diamond #3 task (torque on current loop) catches generic-prompt failure modes a vacuum-authored agent would miss.

### Next session — first task

**Phase A (≈45 min) — author 4 agent definition files in `~/.claude/agents/`:**

1. `json_author.md` — system prompt grounded in CLAUDE.md §2 "What Claude Does", concept JSON v2.1 schema (per CLAUDE_REFERENCE.md), MAGNETISM_ARCHITECTURE.md §4 (Diamond #3 recipe), Rule 20 conceptual-only exception during phases M1–M6.
2. `quality_auditor.md` — Rule 15/16/19/20/21 enforcement, §2 self-review checklist 1–8 as audit rubric, blocks merge on violation.
3. `renderer_primitives.md` — read-only access to `src/lib/aiSimulationGenerator.ts` `CONCEPT_RENDERER_MAP`, verifies every state in the draft only uses primitives in `available_renderer_scenarios`; flags missing-primitive escalations to founder.
4. `anchor_checker.md` — CLAUDE.md §8 enforcement (Indian context, plain English, no Hinglish, no DC Pandey/HC Verma sequence borrowing).

**Phase B (after agent files exist) — Diamond #3 state-arc sketch.** Pick up the queued task from session-1 entry: draft the 6–8 state EPIC-L arc + `scene_composition` primitive list for `torque_on_current_loop_in_field.json` in plain English. Use the Diamond Authoring team to draft. No JSON yet — sketch first, founder review, then author.

### After Diamond #3 — roadmap

Unchanged from session-1 entry. M3 pattern extraction, M3.5 auto-eval loop, M4 gate, M5–M6 loop authoring, M7/M8 mode retrofits, M9 deferred Archetype D.

### Blockers

None. One nuance: `~/.claude/agents/` does not currently exist as a directory — will be created when authoring the 4 agent files next session.

### CLAUDE.md suggestions (do not edit without founder approval)

- Once Diamond #3 ships and the Diamond Authoring team has fired for real, consider promoting the role-labels (`json_author`, `quality_auditor`, etc.) into a named tier in CLAUDE_ENGINES.md alongside the existing 44-engine inventory. They functionally extend Tier 8 (self-improvement) into a Tier-8.5 authoring layer.
- The `~/.claude/rules/agents.md` table lists 10 specialist agents (planner, architect, tdd-guide, etc.) but `~/.claude/agents/` is empty. Founder may want to either (a) author those files too, or (b) trim `agents.md` to only list agents that genuinely exist. Current state is documented-not-implemented and risks future-Claude prompting for an agent that won't fire.

---

## Session — 2026-05-14 — Diamond #2 pause + co-glow choreography (Iterations 5–6)

### What shipped

Diamond #2 (`magnetic_force_moving_charge`) got a major TTS-driven choreography upgrade. The script now drives the visuals at sentence granularity — every TTS sentence either glows a single scene element, glows several elements simultaneously, pauses the proton, freezes the right-hand mesh at a phase, glows one specific finger of the Fleming SVG, or replays an entry-phase trajectory. Five new mechanisms shipped today:

**(a) Hand-phase freeze** — `hand_phase: 'v' | 'b' | 'f' | null` on a TTS sentence. While the sentence speaks, the 3D right-hand mesh locks at curlT 0 / 0.5 / 1 instead of cycling on its 9-second loop. The matching phaseLabel (v/B/F text + arrow) stays visible the whole time. Wired by `SET_HAND_PHASE` postMessage + module-scope `heldHandPhase`. Used by s4_3b/c/d ("flat palm shows v", "curl through B", "thumb along F") and the analogous s6_6b/c/d.

**(b) Proton-position freeze** — `freeze_proton: true` on a TTS sentence. Snapshots the proton's trajectory time so v and F arrow bases stop translating mid-narration; glow + hand cycle + camera keep ticking. Wired by `SET_FREEZE_PROTON` postMessage + module-scope `protonFreezeAt`. Used by s2_2 (F appears), s2_3 (F is small), s3_2 (F has grown to 71%), s4_2b (F always points to centre).

**(c) Co-glow multi-target** — `glow` widened from `string | null` to `string | string[] | null`. The renderer stores `glowTargets[]` (replacing the old single `glowTarget`); every check became `indexOf(t) >= 0`. Used by s2_2 (`["f","v","b"]`), s3_1a (`["v","b"]`), s5_2a/b/c (per-finger + scene arrow), s6_2 / s6_3a / s6_4a (decomposition v_parallel/v_perp + B grid).

**(d) Per-finger Fleming SVG glow** — three new glow targets `fleming_index`, `fleming_middle`, `fleming_thumb`. Each finger wrapped in a `<g id="fleming_{...}_finger">` group (phalanx line + nail + arrow + arrowhead + label). New `@keyframes flemingFingerGlow` uses `filter: drop-shadow(amber)` + `transform: scale(1.05)` — box-shadow doesn't work on inline SVG children. 1.8s period matches `.glow-pulse` for perceptual sync. Used by s5_2a/b/c alongside scene co-glow.

**(e) Entry-phase trajectory** — `entry_duration: number` (seconds) on a helix-mode state. Inserts a straight-line approach BEFORE the helix begins: proton flies in from outside the field along the helix-start tangent, joins the helix seamlessly at `tLocal = entry_duration`. Approach speed matches helix tangent magnitude (no jolt at join). Companion `RESET_TRAJECTORY` postMessage fires automatically on ▶ Play TTS so entry replays in sync with sentence 1. Used by STATE_3 (`entry_duration: 2.6`); s3_1 split into s3_1a ("watch the proton enter…") and s3_1b ("now inside the field, the Lorentz force kicks in…").

Also documented:
- `_TtsPlayButton.tsx` updated with all four new postMessage senders (`sendHandPhase`, `sendFreezeProton`, `sendResetTrajectory`, plus the already-existing `sendGlow`/`sendMath`). All cleared automatically on `utter.onend` / `onerror` / cancel / completion.
- `page.tsx` admin-test plumbed `hand_phase` + `freeze_proton` through the JSON → TtsSentence map.
- `docs/patterns/magnetism.md §3` — five new choreography entries added next to `tts-driven-glow-pulse`: `tts-driven-hand-phase-freeze`, `tts-driven-proton-freeze`, `co-glow-multi-target`, `fleming-per-finger-glow`, `entry-phase-trajectory`. Each has schema + renderer file:function pointer + sentences currently using it. Future Diamond #3 work can grep §3 instead of re-deriving.
- `page.tsx` header — Iterations 4 / 5 / 6 logged chronologically (Iteration 4 = Fleming-as-state + orbit-math bug fix from earlier in this conversation; Iteration 5 = glow-pulse DC-offset calibration converging on `1.35 + 0.35·sin(time·3.5)`; Iteration 6 = today's pause + co-glow work, five mechanisms a-e).

### Files modified

- `physics-mind/src/lib/renderers/field_3d_renderer.ts` — new `glowTargets[]`, `protonFreezeAt`, `heldHandPhase`; helix branch supports `entry_duration`; new postMessage handlers `SET_HAND_PHASE`, `SET_FREEZE_PROTON`, `RESET_TRAJECTORY`; Fleming SVG fingers wrapped in `<g id>` groups; new `@keyframes flemingFingerGlow` + `.glow-finger` class; widened SET_GLOW handler with per-finger CSS-class toggles.
- `physics-mind/src/app/admin/test-magnetic-force-moving-charge/_TtsPlayButton.tsx` — widened `TtsSentence` type (glow array, freeze_proton, hand_phase); new helpers `sendHandPhase`, `sendFreezeProton`, `sendResetTrajectory`; all cleared on sentence end / stop; `play()` resets trajectory at start.
- `physics-mind/src/app/admin/test-magnetic-force-moving-charge/page.tsx` — JSON type widened; new fields plumbed; iteration log 4/5/6 added to header.
- `physics-mind/src/data/concepts/magnetic_force_moving_charge.json` — STATE_3 `entry_duration: 2.6`; sentence audit on 13 sentences (s2_2, s2_3, s3_1 split to s3_1a/b, s3_2, s4_2b, s4_3b/c/d, s5_2a/b/c, s6_2, s6_3a, s6_4a, s6_6b/c/d) for hand_phase / freeze_proton / array-glow / per-finger targets.
- `physics-mind/docs/patterns/magnetism.md` — §3 expanded with five new choreography entries; existing `tts-driven-glow-pulse` updated to document the array form and new finger targets.
- `C:/Users/PRADEEEP/.claude/plans/start-m1-diamond-tingly-cray.md` — plan updated mid-session, approved, executed.

### Status — Diamond #2

- Conceptual mode: **feature-complete, polished**. 7 states (θ=0 → 10 → 45 → 90 → Fleming bridge → decomposition → interactive), 57+ TTS sentences with full choreography, all five new mechanisms wired and verified.
- Board mode (`mode_overrides.board`): not yet authored — deferred to phase M7 per `MAGNETISM_ARCHITECTURE.md` (templated retrofit through the auto-eval loop, not by hand).
- Competitive mode (`mode_overrides.competitive`): not yet authored — deferred to phase M8.
- Type-check: `npx tsc --noEmit` = 0 errors.
- Visual verification: STATE_3 entry phase verified via preview screenshot (straight-line entry → kink → tightening helix).

### Decision — next session

User chose **Diamond #3 (`torque_on_current_loop_in_field`, Phase M2)** over an M4-style sign-off pass on Diamond #2. Diamond #2 is "good enough to leave open and come back to."

### Next session — first task

Draft the EPIC-L state arc + `scene_composition` primitive list for `torque_on_current_loop_in_field.json`. **No renderer code or full JSON yet** — sketch the 6–8 states in plain English first, get founder review, THEN start authoring. Recipe from `MAGNETISM_ARCHITECTURE.md §4`:

1. Rectangular current loop in uniform external B
2. Force pair animation — opposite sides feel opposite-direction forces
3. Net F = 0, but torque ≠ 0 → rotation
4. Magnetic dipole moment μ through the loop face (RHR on current direction)
5. τ = μ × B; oscillation when μ misaligned with B; equilibrium when μ ∥ B
6. Bridge to bar magnet (μ ↔ N-S of equivalent magnet)

Reusable from Diamond #2 (no re-implementation): ambient B-field grid primitive, TTS-glow scaffold (array form), hand-phase freeze choreography (only if a right-hand-rule overlay applies to loops — likely μ direction RHR), entry-phase trajectory (only if the loop is shown being placed into the field), per-finger Fleming glow (probably not relevant here), proton-position freeze (rename concept to "freeze angle" for the rotating loop — same mechanism).

New primitives required (NOT in current renderer): closed rectangular loop mesh, directed-current arrows on each loop side, force-pair (two `force_vector` instances at opposite midpoints), μ-vector arrow through loop face, axis-of-rotation indicator, oscillation animation around μ‖B equilibrium.

### After Diamond #3 — roadmap

| Phase | What | Effort |
|---|---|---|
| M3 | Pattern extraction → write `scene_designer` agent at `.agents/scene_designer/CLAUDE.md`. Three diamonds become the agent's corpus. | 2 sessions |
| M3.5 | Autoresearch-inspired auto-eval loop: Playwright visual probe → Sonnet judge against patterns library → threshold-based iteration. | 3–4 sessions |
| M4 — GATE | Author `magnetic_field_solenoid` end-to-end through the loop. If fails, architecture not proven — do not proceed. | 1 session |
| M5 | Loop-author remaining ~14 atomic concepts (Ch.26). 10-min `program.md` per concept; loop generates + scores + ships. | ~7 sessions |
| M6 | Loop-author ~17 nano concepts. | ~5 sessions |
| M7 / M8 | Board-mode + competitive-mode retrofit passes (templated, all 34 concepts via the loop). | 5–7 + ~5 sessions |
| M9 (deferred) | Diamond #4 — Archetype D (atomic magnetism, ferromagnetism domains). | ~5 sessions |

### Blockers

None.

### CLAUDE.md suggestions (do not edit without founder approval)

- The `tts-driven-*` mechanism family (hand-phase / proton-freeze / co-glow / per-finger / entry-phase) is now a coherent toolkit, not a one-off. When the patterns library is generalised in M3, consider promoting this from a Diamond-#2-specific §3 entry to a chapter-agnostic "TTS choreography toolkit" section, so Diamond #3 authoring grep-discovers it cleanly.
- The single-file template `field_3d_renderer.ts` is approaching the limit of what stays readable. Diamond #3 will add another archetype's primitives + animation. Consider splitting `field_3d_renderer.ts` into archetype-scoped files (`renderers/archetype_a.ts`, `archetype_b.ts`, `archetype_c.ts`) during M3 pattern extraction, with a shared `archetype_shared.ts` for primitives reused across two or more archetypes (ambient field grid, glow scaffold, TTS choreography).

---

*Earlier sessions: see git log for now (this is the first PROGRESS.md entry).*
