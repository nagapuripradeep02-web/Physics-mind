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
- `docs/archive/CLAUDE_REFERENCE.md` — **[STALE — orientation only, verify live]** file/route/table maps.
- `CLAUDE_TEST.md` — THE EYE visual-test protocol (live sections; deferred sections bannered).
- `docs/archive/CLAUDE_ENGINES.md` **[SUPERSEDED]** · `docs/archive/PLAN.md` **[HISTORICAL]** — old 44-engine OS + phase roadmap;
  read only for the feedback-architecture design that seeds §2. The live architecture is §1 below.

---

## §1 — ARCHITECTURE IN USE

The system is built by **agents authoring data**, not by a "44-engine OS" (that framing is retired —
see docs/archive/CLAUDE_ENGINES.md [SUPERSEDED]). Pre-built TypeScript renderers do all visualization + physics
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
the syllabus backbone (coverage + sequencing) — its Indian-context examples are NOT imported; real-world
anchors are authored UNIVERSAL (Rule 35). Teaching is Claude's own judgment. **Plain English only — never Hinglish.**
Full source rule: CLAUDE_RULES.md (§8 of original, preserved).

**State count = minimum states to build COMPLETE understanding — complexity-driven, never fixed.**
EPIC-L: 2–3 (very simple) … 10–12 (very complex). MICRO/HOTSPOT = exactly 2. WHAT-IF = 0 new states.
Quality test: "could a student who watches ALL states answer any exam question on this concept?"
(EPIC-C / deep-dive / drill-down / board state counts are DORMANT — CLAUDE_RULES.md.)

**Pacing + shape (Rule 31, word budget 2026-07-08):** a guided state = **ONE idea + ONE complete motion**,
narration **25–55 EN words (2–4 tight sentences ≈ 10–20s)** — >55 = split ("two ideas"), <~20 = merge/enrich;
motion may outrun narration, never the reverse (the final explore state = 0/open); no two states alike, no
static state — each state DECLARES a motion archetype + delta line, no archetype repeat except a declared
contrast pair (DISCUSSIONS Sessions 78/82). **Legibility (Rule 32):** cause moves before effect · only the
taught variable moves · caption opens with a ≤5-word delta cue · same apparatus, home pose, no teleport ·
one glow focal at a time. Shape exemplars: `faraday_law_induction`, `magnetisation_and_intensity` (narration
predates the word budget — clone their arc/controls, not their sentence length).

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
wrong belief via a straightforward contrast beat) · Rule 19 (≥3 primitives/state) · Rule 24
(labels/equations only, reads sound-off) · Rule 25 (foundation-first, no untaught term, explanation
co-located with its visual) · Rule 27 (new physics objects = explorer pattern: stable ID + params) ·
Rule 29 (emphasis = brightness, never size — no zoom/bulge) · **Rule 31 (per-state contextual
controls; word budget 25–55 EN words/state; distinct motion every state via declared archetype+delta,
no static state; explore-last)** · **Rule 32 (cause-first, one-variable-moves, delta-cue caption,
home-pose continuity, single focal)** · **Rule 33 (macro cause + micro mechanism shown together with a
zoom-link when the taught variable is macroscopic; each state's interior tells its OWN story with a real
number; instruments show live numeric reading + tracking needle)** · **Rule 34 (uncluttered canvas —
≤5-word delta-cue caption on-canvas + prose narration in the strip BELOW it; ONE math-serif Unicode
formula surface + value-only HUD; all math Unicode across DOM/graph/sprite text paths; overlays never
collide/clip)** · **Rule 35 (universal anchor — no country-specific culture anywhere in the sim; region
constants neutral or parameterized)** · plain English · **THE EYE** (§5 ③) with zero new `engine_bug_queue` rows.

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
15. **[A]** `advance_mode` per state — ≥2 distinct modes (Gate 12); reject all-`auto_after_tts`. No mode is individually required; `wait_for_answer` is LEGACY (never authored on new concepts — Rule 31).
16. **[A]** Confront the wrong belief explicitly — **16a** proactively inside EPIC-L (`misconception_watch` + a straightforward contrast beat: show the wrong expectation's consequence, then the real physics — no predict-pause); **16b** if an EPIC-C branch fires, STATE_1 shows the real wrong belief, never neutral.
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
29. **[A]** Emphasis is brightness, NEVER size — no zoom-in/zoom-out "bulge" on any element. Focal brightens + peers dim via `applyGlowEmphasis()`; named meshes (the 3D hand) stay static, full-bright, never dim (`brightenOnly`); a vector's length changes ONLY when the real physical magnitude does (e.g. `tauThrob`). (CLAUDE_RULES.md)
30. **[A]** Stored narration uses Sarvam **bulbul:v3** (speaker `priya`), not v2 — v3 pronounces inline code-mixed English / Romanized symbols natively. **Never transliterate** inline English to Telugu/Hindi script (Sarvam: transliteration *degrades* quality). **Expand bare single-letter physics symbols to their full spoken name in the narration** (E→"electric field E", V→"potential V", B→"magnetic field B", I→"current I", F→"force F", …) — concept-correct meaning, formula bodies stay compact; on-canvas labels stay symbolic (Rule 24). **Colour names stay ENGLISH in the Hindi + Telugu narration** (founder 2026-06-29) — write red/blue/yellow/green/purple/amber in Latin inside `text_hi`/`text_te`, never translated (red→लाल/ఎరుపు, blue→नीला/నీలం, etc.); same code-mixed reasoning as no-transliteration. Defaults live in `generate_tts_audio.ts`. **30f (2026-07-02): ship EN + Telugu AUDIO per concept — rendered LAST (after founder visual approval, before teacher handoff); Hindi text-only until a Hindi market exists; more languages only after ~25-chapter coverage + a native reviewer each.** **30g (2026-07-08, founder): translate narration with SONNET 5 on the Claude Code subscription — a `model: sonnet` sub-agent — NEVER `npm run tts:translate` (which bills the metered anthropic/deepseek/google API keys the founder does not want used). The subscription is only reachable from inside Claude Code, so translation is an AGENT step, not a script: dump each state's `text_en` sentences → dispatch a `model: sonnet` sub-agent that returns code-mixed `text_te` under the Rule-30 code-mix constraints (technical/English terms stay Latin, never transliterate, expand bare symbols to spoken names, colour words English) → write `text_te` structurally into the concept JSON → `npm run tts:generate -- <id> --langs=en,te` re-voices (hash-aware; EN unchanged skips, TE re-fetches). Sarvam **bulbul:v3/priya** still does the AUDIO (a separate paid TTS, unrelated to the LLM billing); Sarvam-Translate/Mayura is NOT used (it fully-translates/transliterates, breaking the code-mix bulbul needs). Telugu stays DRAFT until a native reviewer. NOTE (updated 2026-07-11): the `shipper` chain no longer calls `tts:translate` — it now REFUSES to ship if any sentence lacks `text_te`, so run this Sonnet-5 sub-agent step BEFORE dispatching shipper; `tts:generate` also defaults to `en,te` with Hindi behind `--allow-hindi`. Reference run: `ohms_law` 2026-07-08.** **30h (2026-07-11, founder): audio is ON-DEMAND, not a ship/catalog gate — SUPERSEDES 30f. The sim is a silent visual (Rule 24, TTS off by default; the teacher narrates), so narration audio is supplementary. Ship a concept to the pilot catalog on its complete, baseline-locked VISUALS (a missing audio manifest = silent narration = the default anyway). Author the Telugu TEXT always (30g Sonnet-5 code-mix — cheap, preserves Rule-35 portability) but render Telugu AUDIO only on genuine teacher/market demand; render ENGLISH audio when narration matters for the pilot, not speculatively per concept. `tts:generate` re-synthesizes from Sarvam every run — there is NO free Supabase restore, the local manifest is the only cache — so treat each render as real Sarvam spend and voice only what's needed. `shipper` still requires `text_te` to EXIST (portability) but no longer requires TE audio; its `tts:generate` defaults to `--langs=en`. Ref: Ch.3 catalog opened on visuals 2026-07-11 (drift_velocity/internal_resistance/electrical_power_in_resistor voiced EN; ohms_law/resistivity/combination_of_resistors/emf_definition silent-but-complete; faraday_law_induction re-voiced EN).** (CLAUDE_RULES.md)
31. **[A]** **Straightforward + per-state contextual controls (founder 2026-07-01/02; Sessions 78/79; word budget + archetypes 2026-07-08).** Guided states = ONE idea + ONE complete motion each (narration 25–55 EN words ≈ 2–4 tight sentences ≈ 10–20s; >55 = split, <~20 = merge; motion may outrun narration, never the reverse; no Socratic predict→reveal, no static state); distinct motion is DECLARED — each state names a motion archetype + a one-line delta, no archetype repeat except a declared contrast pair; each state exposes ONLY the slider(s) relevant to what it teaches; the final explore state exposes ALL (`interaction_complete`). Built as presets over ONE engine: control panel built once, rows shown/hidden per state; a shared slider keeps the same screen position; the per-state control table (state × teaches × archetype × delta × controls × duration) is a REQUIRED design artifact. Shape exemplars: `faraday_law_induction`, `magnetisation_and_intensity`. (CLAUDE_RULES.md)
32. **[A]** **Legibility — every state makes its physics and its difference visible (founder 2026-07-08; Session 82).** (32a) the CAUSE moves visibly first, the effect responds after a readable beat — never simultaneous; (32b) in a guided state ONLY the taught variable's motion changes, all else holds pose (explore exempt); (32c) each guided state's caption OPENS with a ≤5-word delta cue naming its one new thing; (32d) the same apparatus persists across states from a recognizable home pose — at every click the only visible change IS the new thing; (32e) exactly ONE glow-focal element at any instant (Rule 29 = how to emphasize; 32e = how many). Gate 3f + eye_walker "delta visible?". (CLAUDE_RULES.md)
33. **[A]** **Macro↔micro dual-level legibility (founder 2026-07-08; Session 83).** When a concept's taught variable is MACROSCOPIC but its mechanism is MICROSCOPIC, the sim shows BOTH levels simultaneously with an explicit zoom-link; the taught variable's change must be visible at the level where it physically happens — never show only the interior when the cause is a macroscopic manipulation. (33a) the macroscopic cause is a real object that visibly changes (rod longer/wider/hotter, plates farther, wire moved) in the macro band; (33b) the microscopic mechanism is the linked interior (lattice/electrons) in the micro band, with an explicit zoom-lens connector; (33c) each guided state's micro view TELLS ITS OWN STORY — no two states may show the same generic interior; follow one carrier where that carries the mechanism (longer wire = longer collision-filled journey; wider wire = more carriers flowing) and expose a real number (collision count, carriers) so the story is legible, not decorative; (33d) instruments (ammeter/voltmeter/thermometer) sit where a teacher reads them at a glance and show the live NUMERIC reading + a needle that tracks the physical change — never a decorative dial with no value. `particle_field` implements this via `macro_view: true` (split canvas) + per-state `micro_focus`. Reference: `resistivity`. (CLAUDE_RULES.md)
34. **[A]** **Uncluttered canvas — the screen shows the machine, not walls of text (founder 2026-07-10; ac_generator de-clutter).** Text must never hinder the sim; the canvas is dominated by the moving physical picture, with only the minimum legible labels/equations on it (extends Rule 24). (34a) **the on-canvas top caption is the ≤5-word delta cue ONLY** (Rule 32c) — never a prose sentence; narration prose lives in the subtitle strip BELOW the canvas (`#capStrip`), never overlaying the sim. (34b) **ONE formula surface per state** — the symbolic equation lives in a single dedicated formula overlay (math-serif Unicode font, e.g. `'Cambria Math'`), never duplicated elsewhere; the readout/HUD is a compact VALUE-only instrument (live numbers per Rule 33d: `Φ = 0.350 Wb`, not `Φ = NBA cos(ωt) = 0.350 Wb`). Don't overload a state with many formulas/abbreviations — one idea, one equation, big and readable. (34c) **all on-canvas math is real Unicode** (Φ ω ε ε₀ θ ° ² · ± → × ⊙ ⊗ μ …), never ASCII transcription (`Phi`, `omega`, `->`, `m2`, `2pi`, `deg`); an ASCII→Unicode sweep MUST cover all THREE text paths — DOM overlays (concept JSON), canvas-drawn graph text (`ctx.fillText`), and hardcoded 3D sprite labels (`createLabelSprite`/`createWideLabelSprite` in `field_3d_renderer.ts`) — a sweep of one silently skips the others. (34d) **overlays never collide** — reserve the corners so nothing clips (the HUD must clear the review-chrome "Full screen" button → `top:52px`+; formula / graph / sliders occupy distinct zones); each state shows only the overlays it needs, the rest hidden. (34e) **a text-only de-clutter fails THE EYE's H2 baselines by design** (pixels moved) → re-baseline via `visual:approve` after founder OK, not a fix cycle. Reference: `ac_generator` (2026-07-10). (CLAUDE_RULES.md)
35. **[A]** **Globally neutral content — no country-specific culture anywhere in a sim (founder 2026-07-10).** The product ships the SAME concepts to multiple syllabi (India today; USA/UK/… next) by tagging/hiding/reordering per syllabus — cheap ONLY if the content itself needs zero cultural rework. (35a) real-world anchors stay (the hook is pedagogy) but are authored UNIVERSAL — household wiring, a phone charger, a ceiling fan, an elevator, an MRI scanner, a speaker magnet — never country-specific places, festivals, food, currency, brands, names, or "in every Indian home"-style phrasing, in ANY rendered or narrated text (captions, labels, titles, tts_sentences, all languages). (35b) region-dependent constants (mains 50 Hz vs 60 Hz, 230 V vs 120 V) are phrased neutrally ("the mains frequency"), or exposed as a slider default — never asserted as THE value. (35c) scope: this governs SIM CONTENT only — NCERT stays the syllabus backbone for coverage/sequencing, and the `student_confusion_log` moat stays Indian-student-sourced (data loops ≠ rendered content). (35d) plain English stays law (§5, Rule 30) — now also the portability requirement. (35e) existing concepts de-localize on next touch (a named retrofit-surgeon delta; re-voice only then — no mass re-voice). **SUPERSEDES** the Session-81 "keep Indian anchors as swappable `real_world_anchor` data" decision — anchors are now written neutral in the first place so no swap is ever needed. Enforced by the architect skeleton §9 + quality_auditor's anchor probe (both flipped 2026-07-10). (CLAUDE_RULES.md)
36. **[A]** **Frame-rate independence — the renderer clock is the invariant, not a per-sim test (founder 2026-07-11/12).** Both live renderers (`field_3d_renderer.ts`, `particle_field_renderer.ts`) accumulate REAL elapsed ms and run 0–3 fixed 1/60 s steps per frame (`__pmSteps`/`dtStep` in field_3d; the p5 `deltaTime` accumulator in particle_field) — numerically identical at 60 Hz, rate-correct on 120 Hz+ hardware. Every integrator MUST stay linear in dt (N steps × 0.016 ≡ 0.016 × N). Under a `SET_TIME_FREEZE` pin the step count is FORCED to 1, so THE EYE's frozen baselines stay byte-identical by construction. **NEVER hardcode a per-frame delta (`time += 0.016`) or assume 60 Hz** in either renderer — the failure (recorded Sarvam audio plays at wall-clock while choreography runs ~2× on a 120 Hz tablet) is INVISIBLE in dev and only surfaces on real classroom hardware (fixed 2026-07-11, commit `6febde1`). (36a) A NEW sim needs NO special 120Hz verification — the fix is renderer-level and every concept's mandatory THE EYE gate (fixed-step frozen frames) already exercises it. (36b) A full-fleet re-verify (re-seed + THE EYE across all baseline-locked concepts) is warranted ONLY after a renderer-clock edit — reference run 2026-07-11 swept 41 baseline-locked concepts, ZERO functional regressions (all diffs were H2 stale-baseline vintage, re-baselined). (36c) Guard on every renderer edit: `npm run check:renderer-syntax` (node --check on both emitted template bodies). Geometry constants that legitimately use 0.016 s (tube/cylinder radii) and the explorer drag-velocity divisor are NOT clocks — leave them. (CLAUDE_RULES.md)
37. **[A]** **The explore (final) state runs CONTINUOUSLY — the player never auto-freezes it (founder 2026-07-12).** The review player's `onTimelineEnd()` (`build_review_site.ts`) pins the clock (`SET_TIME_FREEZE`) at timeline end to hold a clean final frame — correct for GUIDED states (Rule 26: a narrated state holds its final picture once its narration ends). But the LAST state (`advance_mode: 'interaction_complete'`, all sliders) is a live teacher SANDBOX and must keep MOVING: so `interaction_complete` skips the freeze — the clock free-runs, the bead/motion phase wraps (`% 1`) so the motion loops forever, slider drags drive live continuous motion, and ONLY the teacher's Pause button (a separate `freeze()`, Rule 26b) halts it. The failure it fixes: the explore state stopped dead after its ~8 s narration (frozen clock → beads static, slider drags produced no motion). (37a) Like Rule 36, this is a PLAYER INVARIANT enforced ONCE in the shared player — NOT a per-concept authoring rule. Every diamond's explore state gets it on its next `build:review` / `build:pilot`; a new concept needs NO special handling — just author the explore state as `interaction_complete` per Rule 31 (explore-last) and the continuous-run behavior is automatic. (37b) THE EYE's `SET_TIME_FREEZE` capture path is separate, so frozen baselines are UNAFFECTED — no re-baseline needed. (fixed 2026-07-12, commit `1d63d79`.) (CLAUDE_RULES.md)

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

(Deeper file/route/table maps: `docs/archive/CLAUDE_REFERENCE.md` — [STALE], verify live.)

---

## §9 — PROGRESS TRACKING

Update `PROGRESS.md` at the END of every session: what completed, current status, files changed,
next session's first task, blockers, any CLAUDE.md suggestions (do not edit CLAUDE.md without founder
approval). Strategic discussions → append to `docs/DISCUSSIONS.md`.

---

*The mission is the teacher's tool; the vision is a tutor for every student, reached through teachers.*
*The diamonds compound the product; the scar list + confusion log compound the moat. That is PhysicsMind.*
