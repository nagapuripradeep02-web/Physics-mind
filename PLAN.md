# PLAN.md — PhysicsMind Master Roadmap

**Loaded every session.** Concise on purpose — for depth see [docs/ARCHITECTURE_v2.2.md](docs/ARCHITECTURE_v2.2.md).

**Current phase:** E (concept retrofit) → starting H (V2.3 schema work) in parallel.
**Last updated:** 2026-04-24 (session 34).

---

## Where we are

- **52 atomic concepts** in `VALID_CONCEPT_IDS`. **11 gold-standard** (full v2.1: ch.8 forces 6, ch.5 vectors 3, ch.5 relative motion 1, plus tension_in_string covers atwood). **41 unretrofitted** (legacy bundles or partial).
- **v2.2 schema** ready (additive, non-breaking): `teaching_method`, `reveal_at_tts_id` + `pause_after_ms`, `entry_state_map`. Three new fields not yet Zod-enforced; will be in v2.3 once ≥20 JSONs ship them.
- **Board mode v0** ships in 10 concepts (canvas_style: answer_sheet + derivation_sequence + mark_scheme). **v1 atom-composition architecture** designed (see [board-mvp.html](public/board-mvp.html)) but not yet implemented.
- **8 registration sites** required per new concept (see [docs/ARCHITECTURE_v2.2.md §6.2](docs/ARCHITECTURE_v2.2.md#62-eight-registration-sites-for-a-new-concept)). Boot-time drift detector catches the most common mistake.

---

## Phase sequence (D → O)

### Phase D — Foundation (DONE, sessions 1-22)

Engines 1-27 shipped. Tier 0 storage. Tier 1 classifier. Tier 2 PCPL renderer (parametric + graph_interactive). Tier 3 concept loader. Tier 4 deep-dive + drill-down. Tier 5 modes. Tier 6 live serving.

### Phase E — Concept retrofit (IN PROGRESS, sessions 23-50)

11 concepts shipped as v2.1 gold-standard. **41 to go.** Authoring queue (immediate):

| Order | Concept | Why this order |
|---|---|---|
| 1 (next) | `parallelogram_law_test` (Ch.5) | First v2.2-native — exercises all three new fields |
| 2 | `vab_formula` (Ch.6.10) | Second v2.2-native, relative motion family |
| 3 | `friction_static_kinetic` (Ch.8) | Session 34 proof-run — best demo of `misconception_confrontation` |
| 4-10 | Vector math atomics (resultant_formula's siblings, range_inequality, etc.) | Quickest wins; Ch.5 retrofit nearly complete |
| 11-50 | Forces + kinematics + electricity | Ordered by JEE PYQ frequency (highest first) |

**Session-34 specific (this branch):**
- 3 new doc files (ARCHITECTURE_v2.2.md, PLAN.md, CLAUDE_ENGINES.md).
- `friction_static_kinetic` end-to-end (architect → physics_author → json_author → quality_auditor → 8-site registration → verification).

### Phase F — Engine cluster specs (BLOCKED on E, ~session 50)

Write the 5 Peter Parker cluster CLAUDE.md files AFTER 3 v2.2-native proof-runs. Files:
- `.agents/clusters/renderer_primitives/CLAUDE.md`
- `.agents/clusters/runtime_generation/CLAUDE.md`
- `.agents/clusters/quality/CLAUDE.md`
- `.agents/clusters/self_improvement/CLAUDE.md`
- `.agents/clusters/assessment/CLAUDE.md`

Authored from observed reality, not theory.

### Phase G — Quality engine build-out (sessions 50-70)

| Engine | Builds |
|---|---|
| E38 Physics Validator (E42) | Hard gate at /api/deep-dive — 9 conditions per CLAUDE_ENGINES.md |
| E39 Visual Probe (E43) | Replaces gate 4 manual walks; logs to test_session_log |
| E40 Regression Suite (E44) | Nightly across all concepts |
| E41 engine_bug_queue | Structured bugs vs. PROGRESS.md prose |
| E42 test_session_log | Every gate run, every concept, every session |
| E43 proposal_queue | Pradeep's review surface for Tier 8 outputs |

### Phase H — V2.3 schema work (sessions 70-90, can start partially in parallel with E)

| Field / engine | Purpose |
|---|---|
| `scene_pattern` + `composition_rules` | Parametric scaling (3-block FBD vs 2-block FBD via composition) |
| `derivation_atoms[]` + `composition_rules` + `mark_variants` + `BOARD_PROFILES` | Board mode atom-composition |
| `board_variant` in fingerprint | 6D cache key for board mode |
| Zod superRefine for Socratic-reveal | Hard gate for v2.2 narrative_socratic states once ≥20 JSONs carry the fields |
| Engine composition for board atoms | Deterministic, no LLM |
| Build-time pre-warm cache script | ~7,700 entries at deploy time |
| 22 planned PCPL primitives | Expand library 13 → 35 |
| E11 motion type #7 "uniform translation" | Doc-only fix |

### Phase I — Image triage infrastructure (sessions 90-110)

| Engine | Build |
|---|---|
| Tier 0 scope filter UI | Reject non-physics images politely |
| Triage engine | 5-tier classifier (canonical / pattern / composite / Sonnet fallback) |
| Intent Detector | 6-mode classifier (Learn / Correct / Solve / Compare / Check / Explore) |
| 5×6 routing matrix | Wire triage × intent to the right runtime path |

### Phase J — Tier 8 self-improvement quartet (sessions 110-130)

| Engine | Builds |
|---|---|
| E34 Feedback Collector | Nightly aggregation across variant_feedback + simulation_feedback + chat_feedback |
| E35 Confusion Clusterer | DBSCAN/HDBSCAN over confusion phrases → cluster proposals |
| E36 Change Proposer | Structured diffs to JSON / cluster registry / drill-down trigger lists |
| E37 Auto-Promoter | 20 positive + 0 negative + 0 E42 violations → status: verified (Rule 18) |

### Phase K — Assessment (sessions 130-150)

| Engine | Builds |
|---|---|
| E29 Feynman-mode grader | "Now you explain it back" — Sonnet grades against physics_engine_config |
| E30 Answer-sheet PDF export | Client-side jsPDF for V1 |
| E28 Assessment generator | Per-concept MCQ bank generation |

### Phase L — V3 prep (year 2)

Content/pedagogy separation. `<concept_id>.pedagogy.json` files. Per-student profile selector.

### Phase M — Variants 1 → 3 (year 2)

Author Type B + Type C variants per concept. 3× authoring effort per concept.

### Phase N — Multilingual native authoring (year 2-3)

`text_hi`, `text_ta`, `text_te`, `text_bn`, `text_kn`, `text_mr`. Native authors, not machine translation.

### Phase O — Adaptive difficulty (year 3)

Per-student difficulty profile adjusts state count + pedagogy.

---

## Variant strategy

- **Today:** 1 variant per concept (the authored states).
- **Year 2:** 3 variants per concept (Type A, B, C).
- **Year 3:** A/B testing per cohort + regional preference profiles.

---

## Test-repair procedure (formal)

When a concept fails the quality_auditor pass:

1. **Auditor reports FAIL** with gate # and route-to agent.
2. **Author named in route** receives the fail report (architect / physics_author / json_author).
3. Author makes ONE change addressing the root cause (not symptom).
4. Re-run from quality_auditor. Repeat max 3 times.
5. After 3 failed iterations: escalate to Pradeep. Don't grind.

If gate 4 (live visual walk) fails because of a routing issue (Path 1 works, Path 2 doesn't): root cause is almost always a missing site #6 (`PCPL_CONCEPTS`) or site #3 (`CLASSIFIER_PROMPT` drift).

---

## Guardrails (running discipline)

| Rule | Enforced by |
|---|---|
| 8 registration sites required | quality_auditor gate 4 + boot drift detector |
| Three modes always shipped (Rule 20) | Zod schema + quality_auditor gate 3 |
| EPIC-C STATE_1 shows wrong belief (Rule 16) | quality_auditor gate 3 |
| ≥3 primitives per state (Rule 19) | Zod superRefine + quality_auditor gate 3 |
| ≥2 distinct advance_modes per JSON (Rule 15) | Zod superRefine |
| advance_mode required per state | Zod schema |
| `text_en` not `text` (Rule 13) | Validator script + Zod |
| DC Pandey TOC-only (§8) | Architect / physics_author / json_author self-review checklist |
| No Hinglish | quality_auditor anti-plagiarism probe |
| Indian context anchors | quality_auditor anti-plagiarism probe |
| Sonnet banned from uncached live-serving (Rule 18) | Code review (no automation yet) |
| Auto-promote: 20+/0-/0 E42 violations | Tier 8 (Phase J — not built yet) |

---

## Blockers

- **Peter Parker cluster specs blocked on Phase E proof-runs** (need 3 v2.2-native concepts before authoring cluster docs).
- **Tier 8 quartet blocked on engine_bug_queue + proposal_queue Supabase tables** (Phase G prep).
- **Image triage blocked on schema for triage_log table** (Phase I prep).
- **Multilingual blocked on hiring** (year 2 staffing).

No blockers for Phase E concept authoring.

---

## Cost guardrails

- Per-query steady-state cost target: **$0.0001** (Gemini Flash classifier only).
- Per-concept authoring cost target: **$5-15** (one-time Sonnet calls across Alex pipeline).
- Sonnet runtime usage: ONLY for first-student DEEP-DIVE / drill-down miss / image vision / novel concept fallback. Always cached + reviewed within 24h.
- See `/admin/costs` dashboard for real-time tracking.

---

*For depth on any item: [docs/ARCHITECTURE_v2.2.md](docs/ARCHITECTURE_v2.2.md). For engine details: [CLAUDE_ENGINES.md](CLAUDE_ENGINES.md). For session history: [PROGRESS.md](PROGRESS.md).*
