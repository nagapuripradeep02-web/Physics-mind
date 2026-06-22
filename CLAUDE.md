# CLAUDE.md — PhysicsMind
# Operating Manual — v4.0 | June 2026 (rewritten 2026-06-23 — lean/teacher-facing: mission=teacher product, student tutor=vision/V2; dormant rule bodies → CLAUDE_RULES.md; companion docs re-bannered. DISCUSSIONS Session 77.)
# Read this COMPLETELY before doing anything in any session. Claude has no memory between sessions — this file is its context.

---

## §0 — ORIENTATION (mission · vision · stack)

**Mission (now): build the best teacher-facing physics teaching tool.** Teachers are the paying
customers. The simulation + a live teaching surface is the thing a teacher uses to explain concepts
to their students — the accurate, manipulable, moving picture they can't draw on a whiteboard.

**Vision (V2): a personal AI science tutor for every student who doesn't have one** — the AI "voice
professor," reached *through* the teachers we serve first. It lives on branch `feat/voice-professor`,
not master. Build V1 so it stays V2-ready (Rules 27/28), but don't ship student-facing yet.

**Stack:** Next.js 16 App Router + React 19 + TypeScript + Supabase (pgvector) + Gemini 2.5 Flash
(classify) + Claude Sonnet 4.6 + DeepSeek. Supabase project ID: `dxwpkjfypzxrzgbevfnx`.
TTS: Sarvam (V2 voice path).

**Companion docs** (open on the trigger; NOT loaded every session):
- `CLAUDE_RULES.md` — full verbatim body of every Rule 1–28 + dormant specs (the §7 index points here).
- `CLAUDE_APPENDIX.md` — §A glossary · §B concept-ID inventory · §C the Learning Model 5-row table.
- `docs/AUTHORING_PIPELINE.md` — the canonical authoring SOP (the live loop; see §5).
- `CLAUDE_REFERENCE.md` — **[STALE — orientation only, verify live]** file/route/table maps.
- `CLAUDE_TEST.md` — THE EYE visual-test protocol (live sections; deferred sections bannered).
- `CLAUDE_ENGINES.md` **[SUPERSEDED]** · `PLAN.md` **[HISTORICAL]** — old 44-engine OS + phase roadmap;
  read only for the feedback-architecture design that seeds §2. The live architecture is §1 below.

---

## §1 — ARCHITECTURE IN USE

The system is built by **agents authoring data**, not by a "44-engine OS" (that framing is retired —
see CLAUDE_ENGINES.md [SUPERSEDED]). Pre-built TypeScript renderers do all visualization + physics
computation; AI writes *configuration only* and is **never in the rendering loop** (Rule 5/17/18).

**Alex cluster — the authoring pipeline (sequential; each output is the next input):**
`architect` → `physics-author` → `json-author` → `quality-auditor`. The auditor PASS/FAILs and can
route a FAIL back to any upstream member.

**Peter Parker cluster — the engine layer:** `renderer-primitives` (display layer + primitives +
anchor/zone/scale/choreography engines), `runtime-generation` (generator + serving routes + cache
sweeps; the only agent that runs `DELETE` on cache tables). **Never call these directly** — they are
invoked only by a quality-auditor FAIL routing (`[owner: peter_parker:*]`).

**feedback-collector** — offline/nightly only; reads the feedback tables, writes proposals to
`proposal_queue` for founder approval. Never invoked on a live serving path.

**Two live renderers:** `field_3d_renderer.ts` (all current 3D diamonds) and `mechanics_2d_renderer.ts`
+ `pcplRenderer/*` (2D forces/friction). Other renderers exist (wave/optics/thermo) but are not the
current focus.

**Orchestration:** authoring = the pipeline above (sequential, never parallel). Routine checks
(type-check / validator / console-audit) = parallel subagents. Full rule:
`~/.claude/rules/agent-teams-reference.md`. Canonical agent specs: `.agents/<role>/CLAUDE.md`
(edit these) → emitted to `.claude/agents/<role>.md` (never edit the emission directly).

---

## §2 — THE DATA LOOPS WE OPTIMIZE FROM

Everything improves through an **offline, human-reviewed gate** (Rule 17). Three loops feed authoring:

1. **`student_confusion_log`** — the misconception corpus. **Currently founder/test-sourced — there
   are NO real students yet**, so don't cite it as real-student data. At scale it becomes irreplaceable
   ground truth on Indian STEM misconceptions (the data moat). Sacred — NEVER delete.
2. **Teacher review** — the real pedagogy gate. A reviewer (currently **Asmi Singh**) teaches a real
   student with the sim, screen-records, and writes per-state notes → `reviews/` →
   `feedback.md` → **4-bucket routing** (teaching / build / test / engine-bug). The human is the gate;
   the AI `quality-auditor` is only a cheap pre-flight that keeps a broken sim off her desk.
3. **`engine_bug_queue`** — the scar list (the build-side moat). Every recurring defect class the
   reviewer catches becomes a permanent automated check (Gate 8 / THE EYE), so the pre-flight gets
   smarter every week. Fed by the human, not by AI judges.

The learning gate has FIVE meanings (offline+reviewed ✅ vs online+un-reviewed ❌) — Rule 17 +
`CLAUDE_APPENDIX.md` §C. The one hard floor: **no un-reviewed generative process decides physics a
student sees at runtime** (Rule 18).

---

## §3 — TEACHER-FACING PRODUCT (V1 — the mission)

**The surface:** `src/scripts/build_review_site.ts` builds the teacher/reviewer site — a self-contained
per-concept sim with a **reorderable vertical state rail** (open any state, drag to reorder, "Default
order" reset — Rule 25d), a **draw-on-the-sim pen + whiteboard panel**, tap-to-pause, narration off by
default. Deterministic, no LLM. Per-concept verification lives in `src/app/admin/test-*` pages.

**Design law (Rule 24): the sim is the teacher's silent VISUAL.** On-canvas text = labels + equations
+ derivation steps only, never prose. It must read correctly with sound OFF. Show the physical picture,
not lines of algebra (that's the teacher's whiteboard). TTS is off by default, but always author the
`teacher_script` + reveal bindings — it's the V2 orchestration seed.

The buy-trigger is **coverage (≈25/30 chapters) + classroom reliability** — not more features. Today:
~5 complete diamonds + 2 near-complete (magnetism / friction / electrostatics). The ~60 old
vectors/kinematics/forces JSONs are OLD architecture, NOT product — never count them as built.

(File map: §8.)

---

## §4 — STUDENT-FACING PRODUCT (V2 — the vision)

The AI **voice professor**: speak a doubt → it narrates + drives the sim live (`SET_STATE`/`PARAM_UPDATE`),
answering "what if?" on the moving picture. **AI = conductor, not composer** — it picks inputs from a
whitelist of physics-constrained operations; the verified engine computes the physics (Rule 18 floor).
Lives on `feat/voice-professor` (+ `feat/voice-professor-generalize`), **not master**.

**Rule 28 — every new field_3d sim ships a "Professor Pack" as DATA, never new engine code.** The
control layer (operations + camera framing + streaming + client player) is build-once; a new sim is
pure data: knobs/objects/states declared in the concept JSON + a reviewed `src/data/voice_professor/<id>.json`
bundle. This is why §3 work is V2-ready at ~$0. Full body: CLAUDE_RULES.md Rule 28. (File map: §8.)

---

## §5 — THE AUTHORING PIPELINE (the live loop)

Canonical SOP: `docs/AUTHORING_PIPELINE.md`. Five stages:
**① source pedagogy** from the best professor's teaching (extract pedagogy, never prose) →
**② design states** (front-load the complete done-list; compute placements, don't guess) →
**③ THE EYE** — mandatory visual gate, `npm run visual:eyes -- <id>` then `npm run smoke:visual-validator -- <id> --dense`; **Read every dumped frame**; zero new `engine_bug_queue` rows → after founder OK, `npm run visual:approve -- <id>` →
**④ professor gate** (Asmi review) → **⑤ student** (V2, later).

**Source roles:** HC Verma = teaching *sequence* / derivation order (never copied). DC Pandey = table
of contents + problem variants + misconception *belief* (belief only, never prose/figures). NCERT =
Indian real-world anchors. Teaching is Claude's own judgment. **Plain English only — never Hinglish.**
Full source rule: CLAUDE_RULES.md (§8 of original, preserved).

**State count = minimum states to build COMPLETE understanding — complexity-driven, never fixed.**
EPIC-L: 2–3 (very simple) … 10–12 (very complex). MICRO/HOTSPOT = exactly 2. WHAT-IF = 0 new states.
Quality test: "could a student who watches ALL states answer any exam question on this concept?"
(EPIC-C / deep-dive / drill-down / board state counts are DORMANT — CLAUDE_RULES.md.)

---

## §6 — OPERATIONAL CONTRACTS (never violate)

### Commands
```bash
npm run dev            # dev server (localhost:3000)        npm run build / lint
npm run validate:concepts   # Zod + all gates — must pass   npx tsc --noEmit  # 0 errors, always
npm run build:review -- <id> / review:all   # build the teacher/reviewer site
npm run visual:eyes -- <id>                 # THE EYE: deterministic frames + gates ($0)
npm run smoke:visual-validator -- <id> --dense   # vision gate (cost ladder)
npm run seed:concepts / extract:ncert / mineru / dev:full
```
No test suite. Verification = curl against API routes, the admin test pages, or THE EYE.

### Cache clear — RUN BEFORE EVERY TEST (four SEPARATE queries; never batch)
```sql
DELETE FROM simulation_cache;
DELETE FROM lesson_cache;
DELETE FROM response_cache;
DELETE FROM session_context;
```

### NEVER DELETE — sacred tables
```
student_confusion_log   ← founder/test confusion data (the misconception moat)
ncert_content           ← the entire NCERT knowledge base
ai_usage_log            ← cost tracking          tts_translation_cache / tts_audio_cache ← cached TTS
pyq_questions           ← past-year questions    physics_concept_map ← concept relationships
concept_panel_config    ← concept registrations  chat_feedback / variant_feedback / simulation_feedback ← feedback
```
(Row counts intentionally omitted — verify live; counts in prose rot.)

### PM_currentState — the ONLY state variable (Rule 6)
```javascript
if (PM_currentState === 'STATE_1') { ... } else if (PM_currentState === 'STATE_2') { ... }
// WRONG: a parallel `let currentState = 1` never updated by TeacherPlayer.
```

### PostMessage contract — ALL renderers implement
```javascript
// on load:        window.parent.postMessage({ type: 'SIM_READY' }, '*');
// on state applied: window.parent.postMessage({ type: 'STATE_REACHED', state: 'STATE_N' }, '*');
window.addEventListener('message', (e) => {
  if (e.data.type === 'SET_STATE') applySimState(e.data.state);
  if (e.data.type === 'PAUSE')  pauseClock();          // freeze master clock + TTS together (26b)
  if (e.data.type === 'RESUME') resumeClock();
  if (e.data.type === 'MUTE')   setMuted(e.data.muted); // audio only; clock keeps running (26a)
});
```
Reveals/motion run on the state's own clock (`PM_simTimeMs`), never on TTS events (Rule 26).

### Adding a new concept — EIGHT registration sites (miss one = silent pipeline failure)
1. `src/data/concepts/<id>.json` (the concept; ≥3 primitives/state, varied advance_mode, conceptual-only)
2. SQL INSERT into `concept_panel_config` (or `CONCEPT_PANEL_MAP` in `src/config/panelConfig.ts`)
3. `CONCEPT_RENDERER_MAP` in `src/lib/aiSimulationGenerator.ts`
4. `VALID_CONCEPT_IDS` in `src/lib/intentClassifier.ts`
5. `allow_deep_dive: true` tags on hard states (optional; deep-dive itself is dormant)
6. If splitting a bundle: retire parent + add `CONCEPT_SYNONYMS` redirect
7. `PCPL_CONCEPTS` in `src/lib/aiSimulationGenerator.ts` (only for PCPL/2D-rendered concepts)
8. `CLASSIFIER_PROMPT` (+ `ASPECT_VOCABULARY`) in `src/lib/intentClassifier.ts`

### Self-review checklist (before declaring a concept done)
`tsc` 0 · `validate:concepts` target PASSES · Rule 15 (≥2 advance_mode) · Rule 16a (EPIC-L confronts the
wrong belief) · Rule 19 (≥3 primitives/state) · Rule 24 (labels/equations only, reads sound-off) ·
Rule 25 (foundation-first, no untaught term, explanation co-located with its visual) · Rule 27 (new
physics objects = explorer pattern: stable ID + params) · Indian anchor, plain English · **THE EYE**
(§5 ③) with zero new `engine_bug_queue` rows.

---

## §7 — THE RULES (numbered index — numbers are PERMANENT; full bodies in CLAUDE_RULES.md)

> Rule numbers never change or get reused — validator ("Gate N"), agent specs, and CLAUDE_TEST.md cite
> them. Tags: **[A]** active · **[D]** dormant · **[V2]** student/voice-professor. New rules append.

1. **[A]** Chat API returns JSON `{explanation, ncertSources, usage}` — no streaming.
2. **[A]** Three teaching modes are separate functions — never mixed.
3. **[A]** Strategy buttons are UI-only — never appended to explanation text.
4. **[A]** Cache key is 5-dimensional: `concept_id|intent|class_level|mode|aspect`.
5. **[A]** AI never writes rendering code in Stage 2 (config JSON only); Stage 3B emits p5.js HTML.
6. **[A]** `PM_currentState` is the ONLY state variable (see §6).
7. **[A]** `NCERTSourcesWidget` uses inline styles (no Tailwind).
8. **[A]** `usageLogger.ts` uses camelCase: `taskType`, `sessionId`.
9. **[A]** Delete `simulation_cache` rows for a concept to force regen (cached sims persist forever).
10. **[A]** Tier 1/2 cache hits return `ncertSources: []` (known limit; session_context still writes).
11. **[A]** Never hardcode state count — complexity-driven (§5). EPIC-C branches = 0 until real students.
12. **[A]** Sonnet picks scenarios ONLY from `available_renderer_scenarios` — never invents.
13. **[A]** `teacher_script` uses `text_en` (language is a pipeline responsibility).
14. **[A]** Escape sequences: use `\\u0027` not `\'` in template literals.
15. **[A]** `advance_mode` per state — variety is pedagogy; reject all-`auto_after_tts`.
16. **[A]** Confront the wrong belief explicitly — **16a** proactively inside EPIC-L (`misconception_watch` + predict→reveal); **16b** if an EPIC-C branch fires, STATE_1 shows the real wrong belief, never neutral.
17. **[A]** Everything may learn, but only via the offline human-reviewed gate; no un-reviewed runtime generation decides physics (Learning Model — APPENDIX §C).
18. **[A]** Sonnet banned from uncached live serving paths for verified content. **[D]** Deep-dive is NOT runtime-generated (button → feedback form; child states hand-authored on analytics trigger).
19. **[A]** Every state has `scene_composition.primitives.length ≥ 3`.
20. **[D]** Conceptual-only directive: board + competitive modes SUSPENDED — do NOT author `mode_overrides` on new concepts.
21. **[D]** IF a board override is authored it's answer-sheet-first + all-or-nothing (Gate 21). Deferred per Rule 20.
22. **[D]** Deep-dive (button) and drill-down (typed phrase) are mutually exclusive entry paths.
23. **[A]** Prerequisites are advisory, not gating (soft suggestion, never a hard block).
24. **[A]** The sim is the teacher's silent visual — labels/equations only, reads sound-off, picture over algebra, TTS off but author the script (§3).
25. **[A]** Pedagogical sequencing is correctness — foundation-first, no untaught term, co-locate explanation+visual; **25d** authored order is fixed, teacher may reorder at runtime (each state's visual is self-contained).
26. **[A]** Playback runs on the state's own clock (`PM_simTimeMs`), never gated on TTS; MUTE = audio only, PAUSE/RESUME = clock+audio together (§6).
27. **[A]** Every new primitive ships a stable addressable ID + key params via postMessage/slider (explorer pattern; `biot_explorer` is the seed).
28. **[V2]** Every new field_3d sim ships a "Professor Pack" as DATA (concept JSON knobs/objects/states + reviewed `voice_professor/<id>.json`), never new engine code. Generic verbs over named objects; never invent per-sim ops. (§4)

---

## §8 — IMPORTANT FILES

**Teacher-facing (V1 — master):**
- `src/scripts/build_review_site.ts` — the teacher product surface (state rail + draw-on-sim pen + whiteboard).
- `src/lib/renderers/field_3d_renderer.ts` — Three.js 3D sims (the diamonds).
- `src/lib/renderers/mechanics_2d_renderer.ts` + `src/lib/pcplRenderer/*` — 2D PCPL sims.
- `src/data/concepts/*.json` — the diamond content (the real product).
- `src/app/admin/test-*/` — per-concept end-to-end verification pages.
- `src/components/TeacherPlayer.tsx` — playback.
- THE EYE: `src/scripts/visual_eyes.ts`, `src/scripts/smoke_visual_validator.ts`, `src/lib/validators/visual/*`.

**Student-facing (V2 — `feat/voice-professor*` branches):**
- `src/lib/voiceProfessor/operations.ts` — operation vocabulary + validation leash.
- `src/lib/voiceProfessor/professorBrain.ts` — dialogue grounding (auto-derives the control surface).
- `src/lib/voiceProfessor/framing.ts` — camera-framing engine.
- `src/app/api/voice-professor/route.ts` (beats) · `src/app/api/voice/route.ts` (Sarvam STT/TTS).
- `src/data/voice_professor/*.json` — Professor Packs (Rule 28).

**Shared core (both):**
- `src/schemas/conceptJson.ts` — the validator (the gates).
- `src/lib/aiSimulationGenerator.ts` — assembler + `CONCEPT_RENDERER_MAP` + `PCPL_CONCEPTS`.
- `src/lib/physics_constants/index.ts` — `loadConstants` (reads `data/concepts/` first, legacy fallback).
- `src/lib/intentClassifier.ts` — `VALID_CONCEPT_IDS` + `CLASSIFIER_PROMPT`.
- `.claude/agents/*` (emitted) + `.agents/*` (canonical) — the agent specs.

(Deeper file/route/table maps: `CLAUDE_REFERENCE.md` — [STALE], verify live.)

---

## §9 — PROGRESS TRACKING

Update `PROGRESS.md` at the END of every session: what completed, current status, files changed,
next session's first task, blockers, any CLAUDE.md suggestions (do not edit CLAUDE.md without founder
approval). Strategic discussions → append to `docs/DISCUSSIONS.md`.

---

*The mission is the teacher's tool; the vision is a tutor for every student, reached through teachers.*
*The diamonds compound the product; the scar list + confusion log compound the moat. That is PhysicsMind.*
