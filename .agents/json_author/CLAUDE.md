# JSON_AUTHOR — Agent Spec

Third in the pipeline. Converts architect skeleton + physics block into a full concept JSON that PASSes Zod, bounds check, and renders correctly.

## Role

Emit `src/data/concepts/<id>.json` conforming to v2.1 gold-standard schema. Wire every concept-registration site (8 places). Make every primitive live on-canvas. Make every label_expr resolve.

## Input contract

- Architect skeleton (7 sections).
- Physics block from physics_author (5 sections: physics_engine_config JSON, per-state variable_overrides notes, mark scheme, drill-down trigger phrases, constraint callouts).

## Output contract

1. New file `src/data/concepts/<id>.json` — PASSes `npx tsc --noEmit` and `npm run validate:concepts`.
2. Edits to 7 registration sites (see §"Eight registration sites" below).
3. A migration file `supabase_<date>_seed_<id>_clusters_migration.sql` containing INSERT rows into `confusion_cluster_registry` matching the physics_author's drill-down phrasings.

## Tools allowed

- `Read`, `Grep`, `Glob` on project source + shipped JSONs.
- `Write` for the new JSON + SQL migration.
- `Edit` on the 5 registration-site files (never rewrite whole file).
- `Bash`: `npx tsc --noEmit`, `npm run validate:concepts`. Fast iteration loop.

## Tools forbidden

- `apply_migration` via Supabase MCP — SQL migration is authored but not applied; quality_auditor's pre-run step applies.
- Editing any agent spec (`.agents/**`).
- Editing renderer / engine / API route code. If a primitive type you need isn't supported by the renderer, STOP and escalate.

## The Zod schema — source of truth

`src/schemas/conceptJson.ts` — quote these constraints verbatim in your mental model:

**State schema (lines 40-56)**:
- `title: string` required.
- `focal_primitive_id: string` required, min 1 char.
- `advance_mode: enum` — `auto_after_tts | manual_click | auto_after_animation | interaction_complete | wait_for_answer`.
- `scene_composition: array` — min 3 primitives.
- `teacher_script: { tts_sentences: [...] }` — min 1 sentence, each `{id, text_en}`.
- `choreography_sequence: { phases: [...] }` optional.

**Top-level (lines 195+)**:
- `concept_id`, `concept_name`, `chapter`, `section` required.
- `renderer_pair: { panel_a: string, panel_b: string }` required.
- `physics_engine_config` required.
- `real_world_anchor: { primary: string, secondary?, tertiary? }` required.
- `epic_l_path: { state_count: int ≥ 2, states: {…} }` required.
- `epic_c_branches: [...]` min 4 (Zod enforces).
- `regeneration_variants: [...]` — Type B dominant (different world, same physics).
- `mode_overrides: { board: {…}, competitive: {…} }` — both required (Rule 20).

**superRefine**: ≥2 distinct `advance_mode` values across EPIC-L states (Rule 15). All-`auto_after_tts` = Zod FAIL.

## Canvas bounds — 760×500

Renderer canvas set at `parametric_renderer.ts:2124` → `createCanvas(760, 500)`. Every primitive's bounding box must fit in `[0, 760] × [0, 500]`.

**Bounds validator** (`src/scripts/validate-concepts.ts`) checks static primitives: `body` (circle/rect), `vector`. It does NOT check: symbolic anchors (`from: "block_center"`), labels, annotations (text metrics unavailable statically), surfaces (complex geometry).

**Bounds rules**:
- Circle body: `position: {x, y}` is center; `size: number` is diameter. Bbox = `[x-r, x+r] × [y-r, y+r]` where `r = size/2`.
- Rect body: `position` is center; `size: {w, h}`. Bbox = `[x-w/2, x+w/2] × [y-h/2, y+h/2]`.
- Vector: `from: {x,y}` and `to: {x,y}` — bbox bounds both.

**Session 30.7 regression references**:
- `field_forces.json` STATE_2 Earth: `position.y = 420, size = 130` (top 355, bottom 485). Was `y=560, size=180` before fix.
- Symbolic anchors (`from: "mango_center"`, `from: "block_center"`) are NOT bounds-checked but still must render sensibly — inspect visually in quality_auditor gate 4.

## PM_ZONES — use zone anchors for text

5 zones at `parametric_renderer.ts:1993-1999`: MAIN_ZONE (scene), CALLOUT_ZONE_R (callouts), FORMULA_ZONE (boxes), CONTROL_ZONE (sliders), TITLE_ZONE. Prefer `zone: "CALLOUT_ZONE_R", anchor: "top_left"` over absolute coords for label/annotation/formula_box — survives layout changes.

## Primitive types — 12 built + 22 planned (target 34)

Current state: **12 built** are safe to use today. **22 planned** are NOT yet implemented — if your concept needs one, STOP and file an engine bug against the `renderer_primitives` cluster, **do not invent the primitive**.

**Built (12) — safe to use** (the renderer maps them in `parametric_renderer.ts`):

| type | purpose | key fields |
|---|---|---|
| `body` | physical object | `shape: circle\|rect`, `position`, `size`, `fill_color`, `border_color` |
| `surface` | table/wall/incline | `orientation: horizontal\|vertical\|inclined`, `angle?`, `position`, `length`, `texture?`, `friction?` |
| `force_arrow` | drawn force | `from: {x,y}\|"body_center"`, `magnitude\|magnitude_expr`, `direction_deg`, `label\|label_expr`, `scale_pixels_per_unit` |
| `vector` | generic arrow | `from: {x,y}`, `to: {x,y}`, `label?`, `color?`, `style?: solid\|dashed` |
| `label` | text | `text\|text_expr`, `position`, `font_size?`, `color?` |
| `annotation` | callout text | `text`, `position`, `style?: callout\|underline`, `color?` |
| `formula_box` | boxed equation | `equation\|equation_expr`, `position`, `border_color?` |
| `slider` | student input | `variable`, `min`, `max`, `step`, `default`, `label` |
| `angle_arc` | angle indicator | `vertex`, `from_direction`, `to_direction`, `label?`, `radius?` |
| `axes` | coord frame | `position`, `length`, `angle_deg?`, `x_label?`, `y_label?` |
| `force_components` | force decomp | `force_id`, `decompose_axis`, `origin_body_id`, `scale_pixels_per_unit` |
| `derivation_step` | board handwriting | `text`, `position`, `animate_in: handwriting` |
| `mark_badge` | board mark overlay | `state`, `marks`, `label`, `position` |

If architect/physics_author asks for a type not in this list, escalate — don't invent one.

**Planned (22) — NOT yet built** (per CLAUDE_ENGINES.md:147-150):
- **Sprites (8)**: `earth_surface`, `table_surface`, `ramp`, `pulley`, `mass_block`, `spring`, `charge`, `magnet`
- **Fields (4)**: `electric_field`, `magnetic_field`, `gravity_field`, `wave_field`
- **Board mode (4)**: `variable_meter`, `equation_box`, `unit_display`, `step_counter`
- **Circuit mode (6)**: `battery`, `resistor`, `capacitor`, `led`, `switch`, `voltmeter`

These block Ch.F–H concept authoring (circuits, fields). When the concept you're retrofitting needs one, file engine bug → wait for renderer_primitives cluster to land it → resume.

## Eight registration sites — ALL required

Adding a new concept requires touching ALL of these. Missing ANY ONE = silent pipeline failure:

1. `src/data/concepts/<id>.json` — the file itself.
2. `concept_panel_config` Supabase table (SQL INSERT) OR `CONCEPT_PANEL_MAP` in `src/config/panelConfig.ts`. If the concept ships Panel B (graph/board split), set `layout: 'dual_horizontal'` with `secondary` block — `layout: 'single'` silently drops the secondary panel.
3. `CONCEPT_RENDERER_MAP` entry in `src/lib/aiSimulationGenerator.ts` (line ~2564) — **legacy concepts only**; PCPL-migrated concepts go to #7 instead and are REMOVED from this map.
4. `VALID_CONCEPT_IDS` set in `src/lib/intentClassifier.ts` (line ~36).
5. Tag `has_prebuilt_deep_dive: true` on 2–3 hard states (cache-warming hint, NOT a gate — every state shows the Explain button to students per session 33). Populate `drill_downs: [...]` arrays on those states.
6. Retire parent bundle (if splitting) — rename old bundle to `<bundle_id>.legacy.json.deleted` and add a legacy-bundle entry in `CONCEPT_SYNONYMS` (`intentClassifier.ts` ~line 110) pointing to the foundational atomic child (defensive for historical caches).
7. **`PCPL_CONCEPTS` set** in `aiSimulationGenerator.ts:2821` — add the new concept_id so production routes to `parametric_renderer`. If you skip this, the concept appears to work on `/test-engines` (which calls `assembleParametricHtml` directly) but in production chat flow (`/api/generate-simulation`) routes to legacy `mechanics_2d_renderer`. This was missed for Ch.5 concepts through sessions 28-30 and discovered post-hoc in session 31.5.
8. **`CLASSIFIER_PROMPT` VALID CONCEPT IDs block** in `intentClassifier.ts` (line ~137). Add the new atomic ID under the correct chapter section with a one-line hint. If you skip this, `VALID_CONCEPT_IDS` knows the concept but Gemini never returns it — queries route to the nearest advertised sibling instead, and `normalizeConceptId` silently maps to the wrong atomic. Also add a CRITICAL DISAMBIGUATION line for the new ID's common student phrasings. A dev-only boot assertion in `intentClassifier.ts` warns on startup whenever site #4 and site #8 drift apart — check server logs for `[intentClassifier] ⚠️`. This silent failure was first caught in session 32.

## v2.2 schema deltas (session 33 additions — non-breaking)

Three new fields join the concept JSON. Architect + physics_author deliver them in their handoff; json_author writes them into the file. All are **additive** — existing v2.1 JSONs remain valid; new JSONs ship with all three.

### (a) `teaching_method` per state (string enum)

Every state in `epic_l_path.states` + `epic_c_branches[].states` gets one of:
`narrative_socratic` | `misconception_confrontation` | `worked_example` | `shortcut_edge_case` | `compare_contrast` | `exploration_sliders` | `derivation_first_principles`

```jsonc
"STATE_3": {
  "title": "Incline case: N = mg cosθ",
  "teaching_method": "narrative_socratic",
  "scene_composition": [ … ]
}
```

Default if architect didn't specify: `narrative_socratic`. Board-mode state_overrides: `worked_example`. Competitive-mode: `shortcut_edge_case`.

### (b) `reveal_at_tts_id` on primitives + `pause_after_ms` on tts_sentences

Socratic-reveal bindings. The physics_author's reveal table (§3 of their output) translates to:

```jsonc
"scene_composition": [
  { "id": "person_body",  "type": "body",   /* ...no reveal_at, visible at state entry */ },
  { "id": "mg_vector",    "type": "vector", /* ...no reveal_at, visible at state entry */ },
  { "id": "N_vector",     "type": "vector", "reveal_at_tts_id": "s3",
    "animate_in": "fade", "focal_highlight_ms": 800 /* ... */ },
  { "id": "equilibrium_label", "type": "text", "reveal_at_tts_id": "s4",
    "animate_in": "slide_right" /* ... */ }
],
"teacher_script": {
  "tts_sentences": [
    { "id": "s1", "text_en": "Person stands on the floor. mg acts downward.", "pause_after_ms": 1500 },
    { "id": "s2", "text_en": "Person isn't falling through — where must the floor push?", "pause_after_ms": 2500 },
    { "id": "s3", "text_en": "Floor pushes back. Normal reaction, N.", "pause_after_ms": 800 },
    { "id": "s4", "text_en": "At equilibrium, N = mg.", "pause_after_ms": 1200 }
  ]
}
```

Runtime contract: the TeacherPlayer fires primitive reveal animations when it begins speaking the matching `id` sentence. Primitives without `reveal_at_tts_id` are visible at state entry (base scene). `pause_after_ms` defaults to 1000 if omitted.

**Socratic-reveal check (Zod superRefine, future — add when v2.2 schema ships):** for every state with `teaching_method: "narrative_socratic"`, at least one primitive must have `reveal_at_tts_id` (otherwise the state is a static dump).

### (c) `entry_state_map` at concept root

Aspect routing. Classifier returns `aspect`; TeacherPlayer plays the matching slice.

```jsonc
{
  "concept_id": "normal_reaction",
  "entry_state_map": {
    "foundational": { "start": "STATE_1", "end": "STATE_3" },
    "incline":      { "start": "STATE_4", "end": "STATE_5" },
    "elevator":     { "start": "STATE_6", "end": "STATE_7" },
    "free_fall":    { "start": "STATE_8", "end": "STATE_8" }
  },
  "epic_l_path": { … }
}
```

Default aspect = `foundational`. Unknown `aspect` from classifier → fall through to `foundational` (defensive default; don't 404 a student query).

Exit pills at the end of each slice invite deeper exploration: *"See incline case?"* / *"See elevator case?"* — click navigates to that aspect's start state within the same JSON.

## Teacher script — language discipline (Rule 13)

`teacher_script.tts_sentences[i] = { id: string, text_en: string }`. **`text_en` is the only language field**. Never `text`. The TTS pipeline handles translation downstream.

**Sentence language rules**:
- Plain English, Class 11 reading level.
- No Hinglish (`zameen, deewar, tum, hain, kya, seedhi`).
- No textbook phrasing (*"Let us consider a block of mass m..."*).
- Indian real-world concrete (*"a mango from a tree"*, *"an elevator floor"*) not abstract (*"an object"*).
- 3–5 sentences per state typical.

## Modes — ALL THREE required (Rule 20)

Every concept ships `epic_l_path` (conceptual baseline) + `mode_overrides.board` + `mode_overrides.competitive`. Rule 21 for board:

- `canvas_style: "answer_sheet"` (white ruled background).
- `derivation_sequence` — per-state primitive array with `animate_in: "handwriting"`.
- `mark_scheme` — total marks + per-state breakdown.
- `mark_badge` primitives — yellow overlay "+N marks" tied to `mark_scheme` lines.

Competitive mode: `shortcuts: [...]` (keyboard jumpers to scenarios) + `edge_cases: [...]` (boundary conditions).

## Cross-cutting rule (all 4 authoring agents)

DC Pandey = scope only. Teaching method, example problems, anchors, phrasing = first principles. DC Pandey check line in self-review.

## Engine bug queue consultation (pre-authoring)

Before writing the JSON, query `engine_bug_queue` for prevention rules relevant to json_author + cross-cutting JSON-authoring bugs:

```sql
SELECT bug_class, prevention_rule, owner_cluster, severity
FROM engine_bug_queue
WHERE status = 'FIXED'
  AND (owner_cluster = 'alex:json_author' OR cardinality(concepts_affected) >= 5);
```

Read every `prevention_rule`. Each is a one-line constraint a prior bug forced into existence — your JSON must satisfy all of them. Examples from session 35:
- **Bug #13** (block penetrates floor): every `body` primitive in a state with a `surface` primitive must declare `attach_to_surface: "<surface_id>"`.
- **Bug #14** (unreadable annotations): every annotation `color` must have luminance contrast ≥ 4.5:1 against the canvas (avoid `#1F2937` on dark backgrounds — use `#E2E8F0`).
- **Bug #16** (origin_body_id mismatch): use the field name `origin_body_id` consistently on `force_arrow` primitives — `body_id` is legacy and only kept alive by the renderer's PM_resolveForceOrigin alias.

If a rule cannot be satisfied for a legitimate reason, document the exception in the JSON's leading concept-level comment and FLAG to `quality_auditor` for explicit Gate 8 review.

## Self-review checklist (run before handoff to quality_auditor)

- [ ] `npx tsc --noEmit` → 0 errors; `npm run validate:concepts` → target PASSES, no bounds WARN.
- [ ] CLAUDE.md §2 checklist items 3–8 (Rules 15, 16, 19, 20, 21, Indian-context anchor).
- [ ] All 8 registration sites touched. Especially sites #7 (`PCPL_CONCEPTS`) and #8 (`CLASSIFIER_PROMPT`) — boot-time assertion in `intentClassifier.ts` must log zero warnings after your changes.
- [ ] SQL migration drafted (physics_author's phrasings → INSERT rows into `confusion_cluster_registry`).
- [ ] No primitive type used outside the verified list. Every `*_expr` references only declared vars.
- [ ] Engine bug queue consulted; every relevant `prevention_rule` satisfied or exception documented and FLAGed.
- [ ] DC Pandey check: first-principles content, no imported examples/phrasing.

## Escalation

- Zod fails after 3 edit attempts → stop, read the error line by line, don't guess.
- Bounds warn on a primitive you believe correct → re-verify the math (session 30.7 was authoring error, not validator error).
- Need a primitive type not in the verified list → hand back to physics_author or architect. Don't invent types.

---

## Lessons from sessions 53-54 (current_not_vector + pressure_scalar)

These are concrete bugs Pradeep caught in production-equivalent reviews. Every one is now a hard rule. Future authors must internalize them before writing — they are the "you would have shipped these mistakes" list.

### A. Expression interpolation — what `text_expr` and `label_expr` can reference

`PM_interpolate` (in `parametric_renderer.ts:486`) merges `PM_physics.variables` AND `PM_physics.derived` into one scope (the derived merge landed 2026-05-04 — before that, only `variables` were in scope and any reference to `force_magnitude`, `pressure`, `i_actual` etc. silently leaked the raw `{...}` text into the rendered canvas).

**Rule**: Inside `text_expr` / `label_expr` / `direction_deg_expr` / `magnitude_expr`, you may reference:
- Any key under `physics_engine_config.variables` (e.g. `i1`, `theta_deg`, `depth`).
- Any key under `physics_engine_config.computed_outputs` (e.g. `force_magnitude`, `pressure`, `i_actual`, `gap_amperes`) — these are fed through PM_physics.derived.
- Math functions: `sqrt, atan2, atan, asin, acos, sin, cos, tan, abs, min, max, pow, log, exp, PI, E, round, floor, ceil, sign`.
- JS expressions and method calls on numbers, e.g. `{(i1+i2).toFixed(2)}` or `{force_magnitude.toFixed(0)}`.

**Author defensively** — even with the derived fix, prefer inlining the formula from raw variables when it's short. e.g. write `{(rho*g*depth/1000).toFixed(1)} kPa` rather than `{(pressure/1000).toFixed(1)} kPa` — independent of derived availability, easier to debug, no surprise.

**Validator wiring (session 55)**: Gate 4 inside `npm run validate:concepts` now mirrors PM_interpolate exactly. Every `text_expr` / `label_expr` / `direction_deg_expr` / `magnitude_expr` / `equation_expr` / `y_expr` / `angle_expr` / `label_override` is parsed for `{...}` placeholders. Identifiers that aren't in `physics_engine_config.variables`, the math whitelist, or `physics_engine_config.derived_fields_declared: [...]` (new optional field) emit:
- **FAIL** if the identifier looks like a typo (capital first letter, e.g. accidentally referencing a JS-class name).
- **WARN (`undeclared_derived_identifier`)** for `force_magnitude`-style names — declare them in `derived_fields_declared` to silence the warning, or inline the formula.

### B. Animation primitives — what is wired vs ignored

The renderer supports per-primitive timed reveal via `appear_at_ms` (delay before primitive becomes visible) and `animate_in_ms` (fade-in duration). Both honored on every primitive that goes through `PM_animationGate` — that is force_arrow, body, vector, label, annotation, formula_box, motion_path, derivation_step, mark_badge.

Also supported:
- `animate_in: "handwriting"` — character-by-character cursive reveal on `derivation_step`.
- `animate_in: "fade_in"` — alpha 0→1 on body primitives carrying the field.
- `animation: { type: "fade_in", delay_sec, duration_sec }` — body fade-in (some primitives).
- `style: "dashed"` on motion_path — produces a dashed line with arrowhead.

NOT wired (silent no-op — never use):
- `animation.type: "rotate_about"` — looks plausible in JSON, never executes.
- `animation.type: "slide_horizontal"` — only works in legacy mechanics_2d_renderer, NOT parametric_renderer.
- Any "camera transform" or "zoom" — the renderer has no scale/translate transforms. Don't author a "zoom into X" visual; use a banner annotation or a comparison_panel split instead, OR escalate to renderer_primitives if the concept fundamentally requires zoom.

**Validator wiring (session 55)**: Gate 6 in `validate:concepts` enforces the whitelist from `src/lib/renderers/animation_vocabulary.ts`. `animation.type` ∈ {`fade_in`, `slide_horizontal`, `slide_when_kinetic`, `free_fall`, `pendulum`, `atwood`, `door_swing`, `translate`}; `animate_in` ∈ {`none`, `handwriting`, `fade_in`}. Anything else FAILs the gate as `unknown_animation_type` / `unknown_animate_in`.

### C. Plain English vs technical notation

Conceptual mode (EPIC-L baseline + EPIC-C branches) MUST use plain English. Indian Class 11 students reading the canvas should not see `n_hat`, `F_vec`, or unicode-style math notation in the body of any annotation. Replace:
- `F_vec = P A n_hat` → "force = pressure × area, direction = the wall it pushes against"
- `n_hat (top)` → "top wall direction" or just an arrow pointing up
- `F_vec` in any annotation → "force"

Where notation IS allowed:
- `mode_overrides.board.derivation_sequence` — boards expect `n_hat`, `F_vec`, etc. Keep them.
- `mode_overrides.competitive.shortcuts` — JEE/NEET shorthand is fine.
- `mode_overrides.board.mark_scheme[].criterion` — exam-marker phrasing.

The branch named e.g. `force_per_area_so_vector` (where the misconception itself invokes the formula) MAY use the formula since the student typed something like "P = F/A so vector" — they want the equation. Otherwise, plain English everywhere.

**Validator wiring (session 55)**: Gate 5 forbids `n_hat`, `F_vec`, `\hat{`, `\vec{` anywhere outside `mode_overrides.*` — including EPIC-C branches. If a branch genuinely needs the LaTeX (the misconception invokes formulae), move that primitive's formal notation behind `mode_overrides.board.epic_c_branches[*]` and keep the conceptual surface English-only.

### D. Visual continuity across the EPIC-L path

If STATE_1's hook uses a real-world object (cooker, wire-junction, swing, …), STATE_2 and STATE_3 should keep using the same object unless the pedagogy genuinely demands a switch. Pradeep flagged a regression in `pressure_scalar` where STATE_1 showed a cooker, STATE_2 jumped to a generic test-point at "depth 5 m in water", STATE_3 showed a "water tank" — three different scenarios, three confused students.

**Rule**: visual anchor in STATE_1 is the concept's anchor for STATE_2 and STATE_3 unless the architect explicitly motivates a switch in the skeleton.

### E. Body labels — `label_below: true`

`drawBody` renders body labels at `cy` (centre) by default for circles. When the body is the origin of a force_arrow, the body's centre-label collides with the arrow's tail and the visual "what is what" fragments. Use `label_below: true` on the body so the label sits 12 px under the bottom edge — the arrow grows out of the body cleanly, the label is unambiguously the body's.

### F. Renderer template-literal trap

The entire executable renderer code in `parametric_renderer.ts` lives inside an `export const PARAMETRIC_RENDERER_CODE = \`…\`` template literal (line ~43 onward). **Do not use ASCII backticks inside comments in this region** — they close the template literal early and cause TS1005 parse errors. Use single quotes or no quotes in comments. Already burned us once on the PM_interpolate derived-merge.

**Vocabulary sync (session 55)**: when adding a new `animation.type` or `animate_in` kind, update three places in lockstep — the renderer's switch, `src/lib/renderers/animation_vocabulary.ts` (single source of truth), and Lesson §B above. The validator imports `ANIMATION_TYPES` / `ANIMATE_IN_KINDS` from that module and any drift between renderer and validator surfaces immediately as Gate 6 FAILs.

### G. EPIC-C branch states — Rule 19 hits often

Branch states tend to ship with one big formula_box and the rest of the scene_composition empty. Validator hard-fails (≥3 primitives required). Either:
- Split the big box into 2–3 smaller annotations (header tag + body box + footer tag), or
- Run the bulk-pad helper at `src/scripts/bulk-pad-branch-primitives.mjs` (one-off, but easy to repurpose).

### H. regeneration_variants requires `variant_id` and `type`

Zod requires `{variant_id: string, type: string, approach, label, entry_state}`. Authors regularly omit `variant_id` and `type`. Add both.

### I. Every concept that adds a new physics needs a `computePhysics_<id>` function in the renderer

Sites #7 (`PCPL_CONCEPTS`) and the renderer's `computePhysics(conceptId, vars)` dispatcher (around line 311 of `parametric_renderer.ts`) must both know about the concept. If you skip the dispatcher entry, the renderer silently uses an empty physics struct — every `force_magnitude` / `pressure` / etc. resolves to `undefined` and labels go blank. Add a `computePhysics_<id>(vars)` returning `{ concept_id, variables, derived: {…}, forces: [] }` and wire it into the dispatcher.

### J. Layout overlap is not in the validator yet — run it manually

`src/scripts/check-layout-overlap.mjs` computes bounding boxes for force_arrow / annotation / formula_box / label primitives and reports collisions. Run it before handing off:

```bash
node src/scripts/check-layout-overlap.mjs src/data/concepts/<id>.json
```

Acceptable collisions (intentional physics): force arrows from a shared origin (junction, point-source). Unacceptable: arrow LABEL (extends ~7 px/char right of tip) crashing into a right-side annotation. Quality_auditor will flag — fix in author pass to save a round-trip.

(As of 2026-05-04, an in-process version of this check also runs in `npm run validate:concepts` and emits `WARN OVERLAP ...` lines per state. Same-origin force_arrows within 4 px are filtered as intentional. The standalone .mjs script is still useful for ad-hoc per-state inspection.)

### K. Post-author smoke chain (the new "ship-ready" gate)

After Zod + bounds + overlap pass, run the visual smoke gate. This catches regressions that are purely visual (wrong arrow direction, label clipped off-screen, body z-order obscuring a primitive) — Zod can't see those.

```bash
# 1. Re-author? Flush + regenerate first.
node -e "import('@supabase/supabase-js').then(({createClient}) => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY).from('simulation_cache').delete().or('concept_id.eq.<id>,concept_key.eq.<id>'))"

# 2. Have a logged-in browser regenerate the row by hitting /api/generate-simulation
#    (auth-gated; can't be done from CLI without service-role workaround).

# 3. Run the visual smoke gate against the freshly cached row:
npm run smoke:visual-validator <id>
```

The smoke gate captures Playwright screenshots of every state, pixel-diffs across states (a state that's identical to the previous one is suspicious), OCRs labels with tesseract, and runs a 7-category Sonnet vision gate. Cost ~$0.04–$0.30 per concept.

### L. Pre-warm deep_dive_cache for spine concepts

When you ship a spine concept (catalog `is_spine: true`) with `has_prebuilt_deep_dive: true` flagged on hard states, run:

```bash
npm run prewarm:deepdive -- <concept_id>
```

This calls Sonnet directly (bypassing HTTP auth) to populate `deep_dive_cache` for every flagged state. Saves the first student a Sonnet wait; rows land as `pending_review` for human approval at `/admin/deep-dive-review`. Cost ~$0.04 per state. Without this, the first student to click "Explain" pays the latency tax.

### M. Constraint-based layout for EPIC-L (kiwi solver — author-time)

The kiwi-solver wrapper (`subSimSolverHost.ts`) is **generic over `ConfigLike`** — it solves any config with a `states` map, deep-dive sub-sims AND EPIC-L states. As of session 54 it's exposed as a CLI:

```bash
npm run solve:layout <concept_id>            # dry-run (report only)
npm run solve:layout <concept_id> -- --write # bake resolved coords into JSON
```

**When to author with constraints instead of pixel coordinates**: any time a primitive's "right place" is *relative* to another primitive (right of, below, inside, aligned with) — not at a fixed pixel coordinate. Constraints are robust to text-length changes, label-collision regressions, and downstream renderer canvas resizes.

**Vocabulary** (validated by `src/lib/constraintSchema.ts`):

| Field | Meaning | Example |
|---|---|---|
| `anchor` | Semantic placement target | `"CALLOUT_ZONE_R.center"`, `"probe_dot.right"`, `"floor.mid"`, `"on_surface:incline at:0.5"` |
| `edge` | Which edge of the target to anchor to | `"top"`, `"right"`, `"bottom"`, `"left"` |
| `gap` | Min pixels between this primitive and `anchor` (0–200) | `gap: 16` |
| `align` | Align this primitive's position to another (e.g. left-align two boxes) | `align: "verdict_box.left_edge"` |
| `avoid` | List of primitive IDs to keep clear of | `avoid: ["push_lid", "push_side_wall"]` |
| `priority` | Solver weight | `"required"` (hard), `"strong"`, `"medium"`, `"weak"` (default if omitted) |
| `width` / `height` | Explicit dimensions hint (saves p5.textWidth approximation) | `width: 200, height: 80` |
| `position` | Legacy literal `{x, y}` — demoted to weak suggestion when constraints present | — |

**Migration example** (pressure_scalar STATE_2 `pascal_box`):

```jsonc
// BEFORE (pixel-tuned)
{
  "type": "annotation",
  "id": "pascal_box",
  "text": "PASCAL'S TEST\n\n...",
  "position": { "x": 620, "y": 240 }
}

// AFTER (constraint-based)
{
  "type": "annotation",
  "id": "pascal_box",
  "text": "PASCAL'S TEST\n\n...",
  "anchor": "CALLOUT_ZONE_R.center",
  "priority": "strong",
  "gap": 16,
  "avoid": ["probe_dot", "probe_face"]
}
```

After migration, `npm run solve:layout pressure_scalar` will report `pascal_box` as resolved, with the kiwi-computed `(x, y)`. The renderer always reads `position` (not `_solverPosition`), so the workflow is:

1. Author with constraint fields.
2. Run `npm run solve:layout <id> -- --write` — kiwi solves and bakes resolved `(x, y)` into the JSON's `position` field.
3. Commit the result. Renderer behavior unchanged.

**Migration strategy**: don't migrate everything at once. Start with the primitives that historically caused collision bugs (right-side annotation boxes, AHA banners, derivation_step at canvas-bottom). Leave bodies and force_arrows on absolute positions for now — they're geometrically meaningful (a wire arrow's origin is the junction, not "near other primitives").

**Known limitations**:
- Force arrows are not registered as obstacles for collision avoidance (the solver can't bbox them — they have origin + direction + magnitude, not position + size). Layout-overlap warnings will still flag arrow-vs-annotation collisions; resolve manually until the solver learns force-arrow geometry.
- Sub-scene primitives inside `comparison_panel` are NOT solved (sub-scenes use a stripped renderer).
