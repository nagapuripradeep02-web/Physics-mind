/**
 * build:quicklearn — emit the Quick Learn STUDENT wrapper page for one concept.
 *
 * Quick Learn is a ~10-minute guided student path over an EXISTING built sim,
 * delivered by "Vidi" — an AI-tutor CHAT interface beside the simulation:
 *   intro card → guided missions arriving as chat messages ("drag V to 5"),
 *   with celebrations on success → remember cards → 5-question MCQ sprint
 *   (rendered from the concept's authored `assessment` block) → wrong-answer
 *   diagnosis with a "see it again" state replay → result summary.
 *
 * The LESSON is fully scripted (deterministic, Rule 18-safe). The chat input
 * box connects to a REAL model via the local quicklearn_chat_server.ts backend
 * (DeepSeek) — but ONLY for free-form questions the student types; the model
 * never drives the sim and never generates lesson content. Every interaction
 * (slider settles, mission completions, quiz picks, chat turns) streams to the
 * backend's JSONL log. If the backend is down, the chat input hides and the
 * scripted lesson runs untouched.
 *
 * It writes ONE file: ./review-site/quicklearn/<concept_id>/index.html
 * The page iframes ../../<concept_id>/sim.html DIRECTLY (the teacher player is
 * skipped entirely) and drives it over the standard postMessage contract
 * (SET_STATE / STATE_REACHED). Slider observation is same-origin capture-phase
 * DOM delegation (particle_field emits no PARAM_UPDATE) keyed on the renderer's
 * stable `pm_sl_<param>` input ids — trusted events only, never polled values.
 *
 * Prereq: `npm run build:review -- <concept_id>` must have produced sim.html.
 *
 * Usage:
 *   npx tsx src/scripts/build_quicklearn.ts [concept_id]   (default: ohms_law)
 *   QL_CHAT_URL overrides the chat backend origin (default http://localhost:8082).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, cpSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

// ── Mission-config schema (src/data/quicklearn/<id>.json) ────────────────────

const setParamSuccessSchema = z.object({
    param: z.string().min(1),
    op: z.enum(['gte', 'lte', 'eq']),
    value: z.number(),
    // eq only: half-width of the accepted window. Defaults to the slider step,
    // which is fine for coarse sliders but un-draggable for 1-step ones (a
    // student cannot land exactly on 45° of a 0–90° slider).
    tolerance: z.number().positive().optional(),
});

const changeParamSuccessSchema = z.object({
    param: z.string().min(1),
    delta: z.number(),
});

/**
 * Where a param lives in the sim's DOM. particle_field follows the pm_sl_<id>
 * convention so it needs no map; field_3d panels are hand-written per scenario
 * with bespoke ids (#v_slider, #q_toggle, …), declared here per concept.
 * min/max/step describe the DOM control's own units (a field_3d slider often
 * displays scaled units: v_slider reads 0.5–5 for 0.5–5 ×10⁵ m/s).
 */
const paramMapEntrySchema = z.object({
    input_id: z.string().min(1),
    kind: z.enum(['range', 'toggle']),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
});

/**
 * How the wrapper reads the live on-screen numbers for the tutor:
 *   fn    — call a top-level window function (particle_field style)
 *   range — read an <input type=range> value by id, times `scale`
 *   text  — read an element's textContent verbatim (pre-formatted readouts)
 */
const readingSpecSchema = z.object({
    label: z.string().min(1),
    source: z.enum(['fn', 'range', 'text']),
    name: z.string().min(1),
    scale: z.number().optional(),
    round: z.number().int().min(0).optional(),
    unit: z.string().optional(),
});

const missionSchema = z.discriminatedUnion('kind', [
    z.object({
        id: z.string().min(1),
        state: z.string().min(1),
        kind: z.literal('observe'),
        instruction: z.string().min(1),
        min_watch_ms: z.number().int().min(0).default(6000),
        done_label: z.string().min(1).default('Done'),
    }),
    z.object({
        id: z.string().min(1),
        state: z.string().min(1),
        kind: z.literal('set_param'),
        instruction: z.string().min(1),
        success: setParamSuccessSchema,
        hint: z.string().optional(),
        hint_after_ms: z.number().int().min(0).default(20000),
    }),
    z.object({
        id: z.string().min(1),
        state: z.string().min(1),
        kind: z.literal('change_param'),
        instruction: z.string().min(1),
        success: changeParamSuccessSchema,
        hint: z.string().optional(),
        hint_after_ms: z.number().int().min(0).default(20000),
    }),
    z.object({
        id: z.string().min(1),
        state: z.string().min(1),
        kind: z.literal('toggle'),
        instruction: z.string().min(1),
        success: z.object({ param: z.string().min(1) }),
        hint: z.string().optional(),
        hint_after_ms: z.number().int().min(0).default(20000),
    }),
]);

/**
 * What the student is actually LOOKING AT. The model has no vision, so without
 * this it guesses from state titles — and a title like "battery on" makes it
 * confidently describe a battery and resistor that are nowhere on screen
 * (observed 2026-08-18 on the first real student question). Renderer facts
 * cannot be derived from concept data, so they are authored once per concept.
 */
const stageElementSchema = z.object({ looks_like: z.string().min(1), means: z.string().min(1) });

const stageSchema = z.object({
    // `extends` names a shared vocabulary file in _stages/ — most of what is on
    // screen belongs to the RENDERER SCENARIO, not the concept, so sims of the
    // same family describe their picture once.
    extends: z.string().min(1).optional(),
    viewpoint: z.string().min(1).optional(),
    elements: z.array(stageElementSchema).default([]),
});

const stageLibrarySchema = z.object({
    _comment: z.string().optional(),
    viewpoint: z.string().min(1),
    elements: z.array(stageElementSchema).min(1),
});

const tutorSchema = z.object({
    welcome: z.array(z.string().min(1)).min(1),
    celebrations: z.record(z.string(), z.string().min(1)).default({}),
    quiz_intro: z.string().default(''),
    summary_line: z.string().default(''),
});

const missionFileSchema = z.object({
    concept_id: z.string().min(1),
    title: z.string().min(1),
    intro: z.object({
        heading: z.string().min(1),
        lines: z.array(z.string().min(1)).min(1),
        what_changes: z.array(z.object({ you_change: z.string(), you_see: z.string() })),
    }),
    missions: z.array(missionSchema).min(1),
    remember: z.object({
        key_ideas: z.array(z.string().min(1)).min(1),
        formula: z.object({ plain: z.string().min(1), reading: z.string().min(1) }),
        common_mistake: z.object({ wrong: z.string().min(1), right: z.string().min(1) }),
    }),
    quiz: z.object({ question_ids: z.array(z.string().min(1)).min(1) }),
    diagnosis_overrides: z
        .record(z.string(), z.object({ replay_state: z.string().min(1), replay_prompt: z.string().min(1) }))
        .default({}),
    skills: z.record(z.string(), z.array(z.string().min(1))),
    tutor: tutorSchema.optional(),
    // REQUIRED. Without it the tutor guesses what is on screen from state
    // titles and invents apparatus (it described a battery and resistor that
    // are not drawn, 2026-08-18). A loud build failure is the cheaper mistake.
    stage: stageSchema,
    param_map: z.record(z.string(), paramMapEntrySchema).optional(),
    readings: z.array(readingSpecSchema).default([]),
});

type MissionFile = z.infer<typeof missionFileSchema>;

// ── Concept JSON (the subset Quick Learn reads) ──────────────────────────────

interface SliderDef {
    min: number;
    max: number;
    step?: number;
    default?: number;
    label?: string;
    unit?: string;
}

interface AssessmentQuestion {
    q_id: string;
    stem: string;
    options: Record<string, string>;
    correct: string;
    distractor_misconceptions: Record<string, string>;
    tested_idea: string;
    teaches_state: string;
    difficulty: string;
    parallel_form_stem?: string;
}

interface MisconceptionWatch {
    belief?: string;
    one_line_fix?: string;
}

interface ConceptState {
    title?: string;
    misconception_watch?: MisconceptionWatch[];
    scene_composition?: { type?: string; id?: string; text?: string }[];
    teacher_script?: { tts_sentences?: { text_en?: string }[] };
}

interface PfState {
    label?: string;
    caption?: string;
    formula_overlay?: string;
    show_current_meter?: boolean;
    show_vi_graph?: boolean;
    show_flux_conservation?: boolean;
    field_visible?: boolean;
    ohmic?: boolean;
    visible_controls?: string[];
    show_sliders?: boolean;
}

interface F3dState {
    label?: string;
    caption?: string;
    visible_controls?: string[];
    show_sliders?: boolean;
}

interface ConceptJson {
    concept_id?: string;
    concept_name?: string;
    epic_l_path?: { states?: Record<string, ConceptState> };
    particle_field_config?: {
        slider_controls?: Record<string, SliderDef>;
        vi_graph?: { x_axis?: string; y_axis?: string };
        states?: Record<string, PfState>;
    };
    field_3d_config?: {
        scenario_type?: string;
        slider_controls?: Record<string, SliderDef>;
        states?: Record<string, F3dState>;
    };
    assessment?: { mastery_definition?: string; questions?: AssessmentQuestion[] };
}

function fail(msg: string): never {
    console.error('build:quicklearn FAIL — ' + msg);
    process.exit(1);
}

function loadJson(path: string, what: string): unknown {
    if (!existsSync(path)) fail(what + ' not found at ' + path);
    try {
        return JSON.parse(readFileSync(path, 'utf-8'));
    } catch (e) {
        fail(what + ' is not valid JSON: ' + (e instanceof Error ? e.message : String(e)));
    }
}

// ── Cross-validation (mission config ↔ concept JSON) ─────────────────────────

function crossValidate(concept: ConceptJson, mission: MissionFile): void {
    const states = concept.epic_l_path?.states ?? {};
    const sliders = concept.particle_field_config?.slider_controls ?? concept.field_3d_config?.slider_controls ?? {};
    const questions = concept.assessment?.questions ?? [];
    const qById = new Map(questions.map((q) => [q.q_id, q]));

    if (questions.length === 0) fail('concept has no assessment.questions — author them first.');

    for (const qid of mission.quiz.question_ids) {
        if (!qById.has(qid)) fail('quiz.question_ids lists unknown question "' + qid + '".');
    }
    for (const [bucket, qids] of Object.entries(mission.skills)) {
        for (const qid of qids) {
            if (!qById.has(qid)) fail('skills.' + bucket + ' lists unknown question "' + qid + '".');
        }
    }
    for (const [qid, d] of Object.entries(mission.diagnosis_overrides)) {
        if (!qById.has(qid)) fail('diagnosis_overrides keys unknown question "' + qid + '".');
        if (!states[d.replay_state]) fail('diagnosis_overrides.' + qid + '.replay_state "' + d.replay_state + '" is not a state.');
    }
    for (const m of mission.missions) {
        if (!states[m.state]) fail('mission ' + m.id + ' targets unknown state "' + m.state + '".');
        if (m.kind === 'observe') continue;
        // With a param_map (bespoke field_3d panels), the map is the authority
        // and its min/max are in the CONTROL's own display units — the concept
        // slider_controls may use SI units the DOM never shows.
        const mapped = mission.param_map?.[m.success.param];
        if (mapped) {
            if (m.kind === 'toggle') continue;
            if (mapped.kind !== 'range') fail('mission ' + m.id + ' needs a range control, but param_map says "' + m.success.param + '" is a ' + mapped.kind + '.');
            if (m.kind === 'set_param' && mapped.min !== undefined && mapped.max !== undefined) {
                if (m.success.value < mapped.min || m.success.value > mapped.max) {
                    fail('mission ' + m.id + ' target ' + m.success.value + ' is outside ' + m.success.param + ' DOM range [' + mapped.min + ', ' + mapped.max + '].');
                }
            }
            if (m.kind === 'change_param' && mapped.min !== undefined && mapped.max !== undefined && Math.abs(m.success.delta) > mapped.max - mapped.min) {
                fail('mission ' + m.id + ' delta exceeds ' + m.success.param + ' DOM range.');
            }
            continue;
        }
        if (m.kind === 'toggle') fail('mission ' + m.id + ' is a toggle but "' + m.success.param + '" has no param_map entry.');
        const s = sliders[m.success.param];
        if (!s) fail('mission ' + m.id + ' uses param "' + m.success.param + '" — not in slider_controls and not in param_map.');
        if (m.kind === 'set_param') {
            if (m.success.value < s.min || m.success.value > s.max) {
                fail('mission ' + m.id + ' target ' + m.success.value + ' is outside ' + m.success.param + ' range [' + s.min + ', ' + s.max + '].');
            }
        } else if (Math.abs(m.success.delta) > s.max - s.min) {
            fail('mission ' + m.id + ' delta ' + m.success.delta + ' exceeds ' + m.success.param + ' full range.');
        }
    }
    for (const qid of mission.quiz.question_ids) {
        const q = qById.get(qid);
        if (q && !mission.diagnosis_overrides[qid] && !states[q.teaches_state]) {
            fail('question ' + qid + ' teaches_state "' + q.teaches_state + '" is not a state (needed for replay).');
        }
    }
    if (mission.tutor) {
        const missionIds = new Set(mission.missions.map((m) => m.id));
        for (const cid of Object.keys(mission.tutor.celebrations)) {
            if (!missionIds.has(cid)) fail('tutor.celebrations keys unknown mission "' + cid + '".');
        }
    }
}

/**
 * Catch the common staleness case: the renderer draws something no stage
 * element describes (so the tutor will improvise about it). Warns rather than
 * fails — the wording is prose and cannot be matched exactly — but every miss
 * is printed by name so it cannot be missed.
 */
function checkStageCoverage(concept: ConceptJson, stage: ResolvedStage): void {
    const pfStates = concept.particle_field_config?.states ?? {};
    const blob = stage.elements.map((e) => e.looks_like + ' ' + e.means).join(' ').toLowerCase();
    const expect: { flag: keyof PfState; needs: string[]; label: string }[] = [
        { flag: 'show_vi_graph', needs: ['graph'], label: 'the V–I graph' },
        { flag: 'show_current_meter', needs: ['meter', 'ammeter'], label: 'the current meter' },
        { flag: 'show_flux_conservation', needs: ['count', 'tally'], label: 'the counting meters' },
        { flag: 'field_visible', needs: ['arrow'], label: 'the field arrows' },
    ];
    const missing: string[] = [];
    for (const e of expect) {
        const usedBy = Object.entries(pfStates).filter(([, s]) => s[e.flag] === true).map(([sid]) => sid);
        if (usedBy.length === 0) continue;
        if (!e.needs.some((w) => blob.includes(w))) {
            missing.push('  - ' + e.label + ' is shown in ' + usedBy.join(', ') + ' but no stage element describes it');
        }
    }
    if (missing.length > 0) {
        console.warn('\nWARNING — the tutor will be guessing about part of the screen:');
        console.warn(missing.join('\n'));
        console.warn('Add matching entries to the stage block (or its _stages/ library).\n');
    }
}

// ── The model's grounding: concept facts as one stable string ────────────────
// Sent as the tail of the system prompt on every /api/chat call. Built once at
// build time so the prefix is byte-stable — DeepSeek's automatic prefix cache
// then bills the repeated part at the cache-hit rate.

interface ResolvedStage {
    viewpoint: string;
    elements: { looks_like: string; means: string }[];
}

/**
 * Merge the shared scenario vocabulary (_stages/<name>.json) with the concept's
 * own additions. The concept wins on a conflicting `looks_like` so a sim can
 * correct the family description without editing the shared file.
 */
function resolveStage(mission: MissionFile, root: string): ResolvedStage {
    const own = mission.stage;
    let base: ResolvedStage = { viewpoint: own.viewpoint ?? '', elements: [] };

    if (own.extends) {
        const libPath = join(root, 'src', 'data', 'quicklearn', '_stages', own.extends + '.json');
        const parsed = stageLibrarySchema.safeParse(loadJson(libPath, 'stage library "' + own.extends + '"'));
        if (!parsed.success) {
            fail('stage library ' + own.extends + '.json invalid:\n' +
                parsed.error.issues.map((i) => '  ' + i.path.join('.') + ': ' + i.message).join('\n'));
        }
        base = { viewpoint: own.viewpoint ?? parsed.data.viewpoint, elements: parsed.data.elements.slice() };
    }

    for (const e of own.elements) {
        const i = base.elements.findIndex((b) => b.looks_like === e.looks_like);
        if (i >= 0) base.elements[i] = e;
        else base.elements.push(e);
    }

    if (!base.viewpoint) {
        fail('stage needs a `viewpoint` (either its own, or via `extends` to a _stages/ file).');
    }
    if (base.elements.length === 0) fail('stage resolved to zero elements — nothing describes the screen.');
    return base;
}

function buildTutorContext(concept: ConceptJson, mission: MissionFile, stage: ResolvedStage): string {
    const states = concept.epic_l_path?.states ?? {};
    const pfStates = concept.particle_field_config?.states ?? {};
    const f3dStates = concept.field_3d_config?.states ?? {};
    const sliders = concept.particle_field_config?.slider_controls ?? concept.field_3d_config?.slider_controls ?? {};
    const lines: string[] = [];
    lines.push('Concept: ' + (concept.concept_name ?? mission.concept_id) + ' (' + mission.concept_id + ').');

    // ── WHAT IS ON SCREEN ────────────────────────────────────────────────────
    // Sent FIRST and stated as the only allowed source for "what am I looking
    // at" answers. Without it the model invents standard textbook apparatus.
    lines.push('');
    lines.push('WHAT THE STUDENT IS LOOKING AT (this is the ONLY correct description of the picture — never describe anything that is not listed here):');
    lines.push('Viewpoint: ' + stage.viewpoint);
    lines.push('Things visible on screen and what each one is:');
    for (const e of stage.elements) {
        lines.push('- ' + e.looks_like + ' = ' + e.means);
    }

    lines.push('');
    lines.push('The lesson state by state (title, the words shown on screen, and what happens):');
    for (const [sid, s] of Object.entries(states)) {
        lines.push('- ' + sid + ': ' + (s.title ?? sid));
        const pf = pfStates[sid];
        const f3 = f3dStates[sid];
        const caption = pf?.caption ?? f3?.caption;
        if (caption) lines.push('    caption on screen: "' + caption + '"');
        if (pf?.formula_overlay) lines.push('    formula shown: ' + pf.formula_overlay);
        const on: string[] = [];
        if (pf?.show_current_meter) on.push('current meter');
        if (pf?.show_vi_graph) on.push('V–I graph');
        if (pf?.show_flux_conservation) on.push('the two counting meters before and after the resistor region');
        if (pf?.field_visible) on.push('electric field arrows');
        if (pf?.ohmic === false) on.push('a filament (non-ohmic) instead of a plain wire, so the graph line curves');
        if (on.length) lines.push('    visible in this state: ' + on.join(', '));
        const ctrls = pf?.visible_controls ?? f3?.visible_controls ?? [];
        if (ctrls.length) lines.push('    controls the student can use here: ' + ctrls.join(', '));
        else if (pf?.show_sliders || f3?.show_sliders) lines.push('    all sliders available here');
        else lines.push('    no sliders in this state');
        for (const a of s.scene_composition ?? []) {
            if (a.text) lines.push('    label on screen: "' + a.text + '"');
        }
        for (const t of s.teacher_script?.tts_sentences ?? []) {
            if (t.text_en) lines.push('    what happens: ' + t.text_en);
        }
    }
    const sliderLines = Object.entries(sliders).map(([sid, s]) => {
        return '- ' + (s.label ?? sid) + ' slider: ' + s.min + ' to ' + s.max + (s.unit ? ' ' + s.unit : '') + ' (default ' + (s.default ?? s.min) + ').';
    });
    if (sliderLines.length > 0) {
        lines.push('Sliders the student can move:');
        lines.push(...sliderLines);
    }
    lines.push('Formula: ' + mission.remember.formula.plain + '. ' + mission.remember.formula.reading);
    lines.push('Key ideas:');
    mission.remember.key_ideas.forEach((k, i) => lines.push(String(i + 1) + '. ' + k));
    lines.push('Wrong ideas to correct kindly:');
    lines.push('- WRONG: "' + mission.remember.common_mistake.wrong + '" RIGHT: "' + mission.remember.common_mistake.right + '"');
    for (const s of Object.values(states)) {
        for (const w of s.misconception_watch ?? []) {
            if (w.belief && w.one_line_fix) lines.push('- WRONG: "' + w.belief + '" RIGHT: "' + w.one_line_fix + '"');
        }
    }
    const vi = concept.particle_field_config?.vi_graph;
    if (vi?.x_axis && vi?.y_axis) {
        lines.push('The graph on screen plots ' + vi.x_axis + ' on the horizontal axis and ' + vi.y_axis + ' on the vertical axis, so the slope of the line equals resistance R.');
    }
    return lines.join('\n');
}

// ── Assemble the single window.QL_CONFIG object ──────────────────────────────

function buildQlConfig(concept: ConceptJson, mission: MissionFile, chatServer: string, simSrc: string, stage: ResolvedStage): object {
    const states = concept.epic_l_path?.states ?? {};
    const questions = concept.assessment?.questions ?? [];
    const qById = new Map(questions.map((q) => [q.q_id, q]));

    const resolvedQuestions = mission.quiz.question_ids.map((qid) => qById.get(qid) as AssessmentQuestion);

    const diagnosis: Record<string, { replay_state: string; replay_prompt: string }> = {};
    for (const q of resolvedQuestions) {
        const override = mission.diagnosis_overrides[q.q_id];
        const replayState = override?.replay_state ?? q.teaches_state;
        const stateTitle = states[replayState]?.title ?? replayState;
        diagnosis[q.q_id] = {
            replay_state: replayState,
            replay_prompt: override?.replay_prompt ?? 'Watch this part again: ' + stateTitle,
        };
    }

    // Free-play target = the concept's last state (by convention the explore
    // state, advance_mode interaction_complete — Rule 31 explore-last).
    const stateNums = Object.keys(states)
        .map((s) => /^STATE_(\d+)$/.exec(s))
        .filter((m): m is RegExpExecArray => m !== null)
        .map((m) => parseInt(m[1], 10));
    const exploreState = stateNums.length > 0 ? 'STATE_' + Math.max(...stateNums) : mission.missions[mission.missions.length - 1].state;

    const tutor = mission.tutor ?? {
        welcome: ['Hi! I am Vidi, your guide for this lesson.', 'Do each small step with me, and ask me anything in the box below.'],
        celebrations: {},
        quiz_intro: '',
        summary_line: '',
    };

    return {
        concept_id: mission.concept_id,
        title: mission.title,
        intro: mission.intro,
        missions: mission.missions,
        remember: mission.remember,
        sliders: concept.particle_field_config?.slider_controls ?? concept.field_3d_config?.slider_controls ?? {},
        questions: resolvedQuestions,
        diagnosis,
        skills: mission.skills,
        explore_state: exploreState,
        tutor,
        tutor_context: buildTutorContext(concept, mission, stage),
        chat_server: chatServer,
        sim_src: simSrc,
        param_map: mission.param_map ?? {},
        readings: mission.readings,
    };
}

// ── The wrapper page ─────────────────────────────────────────────────────────
// One self-contained HTML file. The inline script uses NO backticks and no
// template interpolation (repo discipline for generated JS). All authored text
// reaches the DOM via textContent, never innerHTML.

function renderPage(ql: object, title: string): string {
    const qlJson = JSON.stringify(ql).replace(/</g, '\\u003c');
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} — Viditra Quick Learn</title>
<style>
  :root {
    --bg:#0B0E1A; --panel:#131735; --panel2:#1A1F42; --line:rgba(255,255,255,0.10);
    --text:#E7EAF3; --dim:#9AA3BC; --accent:#FFD54F; --good:#66BB6A; --bad:#EF5350; --info:#4DD0E1;
  }
  * { box-sizing:border-box; margin:0; padding:0; }
  html,body { height:100%; }
  body { background:var(--bg); color:var(--text); font:15px/1.55 system-ui,-apple-system,'Segoe UI',sans-serif; display:flex; flex-direction:column; }
  header { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:10px 18px; border-bottom:1px solid var(--line); flex:0 0 auto; }
  .brand { font-weight:700; letter-spacing:0.2px; white-space:nowrap; }
  .brand span { color:var(--accent); font-weight:600; }
  #chips { display:flex; gap:6px; flex-wrap:wrap; }
  .chip { font-size:12px; color:var(--dim); border:1px solid var(--line); border-radius:999px; padding:3px 12px; }
  .chip.on { color:#0B0E1A; background:var(--accent); border-color:var(--accent); font-weight:700; }
  .chip.done { color:var(--good); border-color:var(--good); }
  main { flex:1 1 auto; min-height:0; display:flex; }
  .hidden { display:none !important; }

  /* SIM mode */
  #simWrap { flex:1; display:flex; min-height:0; }
  #simBox { flex:1 1 66%; min-width:0; position:relative; }
  #simBox iframe { position:absolute; inset:0; width:100%; height:100%; border:0; background:#0A0A1A; }
  #panel { flex:0 0 360px; max-width:42%; border-left:1px solid var(--line); background:var(--panel); padding:12px; display:flex; flex-direction:column; gap:10px; min-height:0; }
  #panelHead { display:flex; justify-content:space-between; align-items:center; flex:0 0 auto; gap:8px; }
  #mProgress { display:flex; gap:6px; padding:2px 4px; }
  #voiceBtn { background:transparent; color:var(--dim); border:1px solid var(--line); font-weight:500; font-size:12px; padding:5px 10px; white-space:nowrap; }
  #micBtn { flex:0 0 auto; background:var(--panel2); color:var(--text); border:1px solid var(--line); font-size:16px; padding:9px 12px; }
  #micBtn.listening { border-color:var(--bad); color:var(--bad); animation:micPulse 1.2s infinite; }
  @keyframes micPulse { 0%,100% { box-shadow:0 0 0 0 rgba(239,83,80,0.5); } 50% { box-shadow:0 0 0 7px rgba(239,83,80,0); } }
  .dot { width:10px; height:10px; border-radius:50%; background:var(--line); }
  .dot.on { background:var(--accent); }
  .dot.ok { background:var(--good); }

  /* Chat thread */
  #chatThread { flex:1 1 auto; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding:4px; }
  .msg { max-width:88%; border-radius:14px; padding:9px 12px; font-size:14px; }
  .msg.tutor { align-self:flex-start; background:var(--panel2); border:1px solid var(--line); border-bottom-left-radius:4px; }
  .msg.student { align-self:flex-end; background:rgba(255,213,79,0.14); border:1px solid rgba(255,213,79,0.35); border-bottom-right-radius:4px; }
  .avatarRow { display:flex; align-items:center; gap:6px; margin-bottom:4px; }
  .avDot { width:9px; height:9px; border-radius:50%; background:var(--info); box-shadow:0 0 6px var(--info); }
  .avName { font-size:11px; font-weight:700; color:var(--info); letter-spacing:0.5px; }
  .chatMeta { align-self:center; font-size:11px; color:var(--dim); text-transform:uppercase; letter-spacing:1px; padding:2px 0; }
  .msg.typing { display:flex; gap:5px; align-items:center; padding:12px 14px; }
  .tdot { width:7px; height:7px; border-radius:50%; background:var(--dim); animation:tblink 1s infinite; }
  .tdot:nth-child(2) { animation-delay:0.2s; }
  .tdot:nth-child(3) { animation-delay:0.4s; }
  @keyframes tblink { 0%,60%,100% { opacity:0.25; } 30% { opacity:1; } }

  /* Panel controls + chat input */
  .panelBtns { display:flex; flex-direction:column; gap:8px; flex:0 0 auto; }
  #chatInputRow { display:flex; gap:8px; flex:0 0 auto; }
  #chatInput { flex:1; min-width:0; background:var(--panel2); border:1px solid var(--line); border-radius:10px; color:var(--text); font:inherit; padding:9px 12px; }
  #chatInput:focus { outline:none; border-color:var(--info); }
  #chatSend { flex:0 0 auto; background:var(--info); }
  .note { color:var(--dim); font-size:13px; }
  button { font:inherit; border:0; border-radius:8px; padding:10px 16px; cursor:pointer; background:var(--accent); color:#0B0E1A; font-weight:700; }
  button:disabled { background:var(--panel2); color:var(--dim); cursor:default; }
  button.ghost { background:transparent; color:var(--text); border:1px solid var(--line); font-weight:500; }

  /* CARD mode */
  #card { flex:1; overflow-y:auto; display:flex; justify-content:center; padding:32px 18px; }
  .cardInner { width:100%; max-width:680px; display:flex; flex-direction:column; gap:18px; }
  h1 { font-size:26px; line-height:1.25; }
  h2 { font-size:18px; }
  .box { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:10px; }
  table { border-collapse:collapse; width:100%; }
  td, th { border:1px solid var(--line); padding:8px 12px; text-align:left; font-size:14px; }
  th { color:var(--dim); font-weight:600; }
  .formula { font-family:'Cambria Math',Georgia,serif; font-size:30px; text-align:center; padding:8px 0; }
  .kidea { display:flex; gap:10px; align-items:baseline; }
  .kidea .n { color:var(--accent); font-weight:700; }
  .wrongLine { color:var(--bad); }
  .rightLine { color:var(--good); }
  .opt { display:block; width:100%; text-align:left; background:var(--panel2); color:var(--text); font-weight:500; margin-top:8px; border:1px solid var(--line); }
  .opt:hover:not(:disabled) { border-color:var(--accent); }
  .opt.right { border-color:var(--good); color:var(--good); font-weight:700; background:rgba(102,187,106,0.10); }
  .opt.wrong { border-color:var(--bad); color:var(--bad); background:rgba(239,83,80,0.08); }
  .qMeta { color:var(--dim); font-size:13px; }
  .verdictRow { display:flex; justify-content:space-between; gap:12px; align-items:baseline; border-bottom:1px solid var(--line); padding:8px 0; }
  .verdictRow:last-child { border-bottom:0; }
  .v-strong { color:var(--good); font-weight:700; }
  .v-mid { color:var(--accent); font-weight:700; }
  .v-review { color:var(--bad); font-weight:700; }
  .btnRow { display:flex; gap:10px; flex-wrap:wrap; }
  .score { font-size:42px; font-weight:800; color:var(--accent); }
  @media (max-width: 860px) {
    #simWrap { flex-direction:column; }
    #panel { flex:1 1 auto; max-width:none; border-left:0; border-top:1px solid var(--line); }
    #simBox { flex:0 0 46%; min-height:300px; }
  }
</style>
</head>
<body>
<header>
  <div class="brand">Viditra <span>Quick Learn</span></div>
  <nav id="chips"></nav>
</header>
<main>
  <section id="simWrap" class="hidden">
    <div id="simBox"></div>
    <aside id="panel">
      <div id="panelHead">
        <div id="mProgress"></div>
        <button id="voiceBtn" class="hidden" title="Turn the voice on or off"></button>
      </div>
      <div id="chatThread"></div>
      <div class="panelBtns">
        <button id="mBtn" disabled>Continue</button>
        <button id="mBack" class="ghost hidden">Back to the question</button>
      </div>
      <div id="chatInputRow" class="hidden">
        <button id="micBtn" class="hidden" title="Ask by voice">&#127908;</button>
        <input id="chatInput" type="text" maxlength="300" placeholder="Ask Vidi anything about this&#8230;" autocomplete="off">
        <button id="chatSend">Ask</button>
      </div>
      <div id="askNote" class="note hidden">Ask-me is offline &#8212; the guided lesson still works.</div>
    </aside>
  </section>
  <section id="card" class="hidden"><div class="cardInner" id="cardInner"></div></section>
</main>
<script>window.QL_CONFIG = ${qlJson};</script>
<script>
(function () {
  'use strict';
  var QL = window.QL_CONFIG;
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  // ── Session id (stable across reloads, per browser) ────────────────────────
  var SID = (function () {
    try {
      var k = 'pm_ql_sid', v = localStorage.getItem(k);
      if (!v) { v = 'ql_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); localStorage.setItem(k, v); }
      return v;
    } catch (e) { return 'ql_anon'; }
  })();

  // ── Store (localStorage only) ──────────────────────────────────────────────
  var Store = {
    key: 'pm_quicklearn_' + QL.concept_id + '_v1',
    data: null,
    load: function () { try { return JSON.parse(localStorage.getItem(this.key)); } catch (e) { return null; } },
    save: function () { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) {} },
    clear: function () { try { localStorage.removeItem(this.key); } catch (e) {} },
    fresh: function () {
      this.data = { version: 1, concept_id: QL.concept_id, started_at: new Date().toISOString(),
        finished_at: null, missions: [], quiz: [], score_first_try: 0, skills: {}, questions_asked: 0 };
    }
  };

  // ── Interaction log → chat backend (fire-and-forget) ───────────────────────
  var Log = {
    send: function (type, payload) {
      if (Chat.online === false) return;
      try {
        fetch(QL.chat_server + '/api/log', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: SID, type: type, payload: payload || null })
        }).catch(function () {});
      } catch (e) {}
    }
  };

  // ── Rolling action buffer (what the model "sees" the student doing) ────────
  var Actions = {
    buf: [], timers: {},
    slider: function (param, value) {
      clearTimeout(Actions.timers[param]);
      Actions.timers[param] = setTimeout(function () {
        Actions.buf.push({ t: Date.now(), kind: 'slider', param: param, value: value });
        if (Actions.buf.length > 60) Actions.buf = Actions.buf.slice(-60);
        Log.send('slider', { param: param, value: value, state: Sim.curState });
      }, 600);
    },
    event: function (kind, payload) {
      Actions.buf.push({ t: Date.now(), kind: kind, payload: payload });
      if (Actions.buf.length > 60) Actions.buf = Actions.buf.slice(-60);
      Log.send(kind, payload);
    },
    recent: function () {
      return Actions.buf.slice(-10).map(function (a) {
        return a.kind === 'slider' ? { kind: 'slider', param: a.param, value: a.value } : { kind: a.kind, info: a.payload };
      });
    }
  };

  // ── Voice — browser speech in both directions, at zero cost ───────────────
  // Deliberately different from the teacher player's rule (engine_bug_queue:
  // narration_cancel_speak_race_browser_tts — VERIFIED lesson narration must be
  // pre-rendered Sarvam clips). A live AI answer cannot be pre-rendered, so
  // browser TTS is the right tool HERE, with the scar's mechanics honored:
  // one queue, one utterance at a time, never cancel()-then-speak()
  // back-to-back (stop() opens a ~300ms cool-down before the next speak),
  // long text chunked at sentence boundaries. The chat bubbles are the
  // subtitles and remain the source of truth — a TTS failure loses nothing.
  var Voice = {
    ttsOk: (typeof window.speechSynthesis !== 'undefined') && (typeof window.SpeechSynthesisUtterance !== 'undefined'),
    SR: window.SpeechRecognition || window.webkitSpeechRecognition || null,
    enabled: false, voice: null, q: [], speaking: false, coolUntil: 0,
    init: function () {
      if (!Voice.ttsOk) return;
      try { Voice.enabled = localStorage.getItem('pm_ql_voice') !== 'off'; } catch (e) { Voice.enabled = true; }
      // Rank every voice instead of taking the first match: neural voices
      // ("Natural"/"Online"/"Neural" in the name) sound human, the old local
      // SAPI ones sound robotic. en-IN preferred, then en-GB/en-US.
      function pick() {
        var vs = [];
        try { vs = window.speechSynthesis.getVoices() || []; } catch (e) { return; }
        var best = null, bestScore = 0;
        for (var i = 0; i < vs.length; i++) {
          var v = vs[i], s = 0;
          if (/en[-_]IN/i.test(v.lang)) s += 8;
          else if (/en[-_](GB|US)/i.test(v.lang)) s += 4;
          else if (/^en/i.test(v.lang)) s += 2;
          else continue;
          if (/natural|neural|online/i.test(v.name || '')) s += 16;
          if (s > bestScore) { bestScore = s; best = v; }
        }
        if (best) Voice.voice = best;
      }
      pick();
      try { window.speechSynthesis.onvoiceschanged = pick; } catch (e) {}
      // Chrome silently drops speak() before the first user gesture — prime
      // once, near-silently, on the first tap or key.
      function prime() {
        document.removeEventListener('pointerdown', prime, true);
        document.removeEventListener('keydown', prime, true);
        try {
          var u = new SpeechSynthesisUtterance(' ');
          u.volume = 0.01;
          window.speechSynthesis.speak(u);
        } catch (e) {}
      }
      document.addEventListener('pointerdown', prime, true);
      document.addEventListener('keydown', prime, true);
      Voice.renderBtn();
    },
    renderBtn: function () {
      var b = $('voiceBtn');
      if (!Voice.ttsOk) { b.classList.add('hidden'); return; }
      b.classList.remove('hidden');
      b.textContent = Voice.enabled ? '🔊 Voice on' : '🔇 Voice off';
    },
    toggle: function () {
      Voice.enabled = !Voice.enabled;
      try { localStorage.setItem('pm_ql_voice', Voice.enabled ? 'on' : 'off'); } catch (e) {}
      if (!Voice.enabled) Voice.stop();
      Voice.renderBtn();
      Actions.event('voice_toggle', { on: Voice.enabled });
    },
    // Physics text is full of symbols a speech engine reads badly or skips
    // ("V = IR" became "vee equals eye arr"; "Ω" and "×10⁵" were dropped
    // entirely). Spoken form is rewritten here; the on-screen bubble keeps the
    // real symbols (Rule 24 — the visual stays symbolic).
    // NOTE ON ESCAPES (repo Rule 14): this whole page is emitted from a JS
    // template literal, so a single backslash is EATEN — "\\s" here is what
    // reaches the browser as "\s". Writing "\s" silently produced /s+/ and
    // deleted every letter "s" from the spoken text. Always double them.
    _speakable: function (text) {
      var t = ' ' + String(text) + ' ';
      // Units and symbols first (longest patterns before their substrings).
      t = t.replace(/×\\s*10\\^?([⁰¹²³⁴⁵⁶⁷⁸⁹0-9]+)/g, ' times ten to the power $1 ');
      t = t.replace(/([0-9])\\s*Ω/g, '$1 ohms').replace(/Ω/g, ' ohms ');
      t = t.replace(/([0-9])\\s*°/g, '$1 degrees').replace(/°/g, ' degrees ');
      t = t.replace(/\\bmT\\b/g, ' millitesla ').replace(/\\bfN\\b/g, ' femtonewtons ');
      // A letter straight after a number is a UNIT, not a symbol ("6 V" is
      // "six volts", not "six voltage V"). Runs before the symbol expansion.
      t = t.replace(/([0-9])\\s*V\\b/g, '$1 volts').replace(/([0-9])\\s*A\\b/g, '$1 amperes');
      t = t.replace(/([0-9])\\s*T\\b/g, '$1 tesla').replace(/([0-9])\\s*N\\b/g, '$1 newtons');
      t = t.replace(/\\bm\\/s\\b/g, ' metres per second ').replace(/\\bV\\/R\\b/g, ' V by R ');
      t = t.replace(/\\|v\\|/g, ' v ');
      t = t.replace(/\\bsin\\b/g, ' sine ').replace(/\\bcos\\b/g, ' cosine ').replace(/\\btan\\b/g, ' tangent ');
      t = t.replace(/θ/g, ' theta ').replace(/μ/g, ' mu ').replace(/Φ/g, ' phi ').replace(/π/g, ' pi ');
      t = t.replace(/⊥/g, ' perpendicular to ').replace(/∝/g, ' is proportional to ');
      t = t.replace(/×/g, ' cross ').replace(/·/g, ' times ').replace(/÷/g, ' divided by ');
      t = t.replace(/\\s=\\s/g, ' equals ');
      // Bare single-letter physics symbols → spoken names (same doctrine as
      // Rule 30's narration rule for the teacher product).
      // "I" is the one symbol that is also a pronoun — "Hi! I am Vidi" was
      // spoken "Hi! current I am Vidi". Skip the expansion when the next word
      // is a common first-person verb (tutor voice); physics uses ("the
      // current I", "I equals V by R") never pair I with these verbs.
      t = t.replace(/\\bV\\b/g, ' voltage V ').replace(/\\bI\\b(?!\\s+(?:am|was|will|can|could|have|had|would|should|need|saw|see|think|do|did|hope|want|know|mean|guess|wish|like|love)\\b)/g, ' current I ').replace(/\\bR\\b/g, ' resistance R ');
      t = t.replace(/\\bB\\b/g, ' magnetic field B ').replace(/\\bF\\b/g, ' force F ').replace(/\\bq\\b/g, ' charge q ');
      // NO bare-A rule: "A" is the article ("A coil is…" was spoken "amperes
      // coil is…") and in induction lessons the AREA symbol (Φ = B·A cosθ).
      // Real ampere readings are number-adjacent ("0.32 A") and already
      // handled above; a lone "A" reads correctly as the letter.
      // Superscript digits left over anywhere else.
      t = t.replace(/⁰/g, ' zero ').replace(/¹/g, ' one ').replace(/²/g, ' squared ').replace(/³/g, ' cubed ')
           .replace(/⁴/g, ' four ').replace(/⁵/g, ' five ').replace(/⁶/g, ' six ')
           .replace(/⁷/g, ' seven ').replace(/⁸/g, ' eight ').replace(/⁹/g, ' nine ')
           .replace(/⁻/g, ' minus ');
      // Formula bodies stay compact (Rule 30b) — "qvB" survives the expansions
      // above (no word boundary inside it) and is only spaced out here, so it
      // reads "q v B", not "charge q velocity v magnetic field B".
      t = t.replace(/\\bqvB\\b/g, ' q v B ');
      // Squeeze runs of spaces BEFORE the collapse rules below — the expansions
      // above pad with spaces, and "field  magnetic field B" would not match.
      t = t.replace(/\\s+/g, ' ');
      // Expanding a bare symbol can duplicate a word the sentence already had
      // ("the field magnetic field B") — collapse those.
      t = t.replace(/\\bfield magnetic field B\\b/gi, 'magnetic field B');
      t = t.replace(/\\bforce force F\\b/gi, 'force F');
      t = t.replace(/\\bvoltage voltage V\\b/gi, 'voltage V');
      t = t.replace(/\\bcurrent current I\\b/gi, 'current I');
      t = t.replace(/\\bresistance resistance R\\b/gi, 'resistance R');
      t = t.replace(/\\bcharge charge q\\b/gi, 'charge q');
      t = t.replace(/\\bspeed v\\b/gi, 'speed v');
      // Decorative characters the engine either spells out or chokes on.
      t = t.replace(/[✓✗≡*_#•⊕⊗]/g, ' ');
      t = t.replace(/[—–]/g, ', ');
      return t.replace(/\\s+/g, ' ').replace(/ ,/g, ',').replace(/,\\s*,/g, ',').trim();
    },
    say: function (text) {
      if (!Voice.ttsOk || !Voice.enabled || !text) return;
      var t = Voice._speakable(text);
      if (!t) return;
      // A new message INTERRUPTS a stale backlog (founder 2026-08-19: clicking
      // "I saw it" or asking a question must not wait behind the old greeting).
      // Stale = the last enqueue was >3s ago and speech is still going — that
      // backlog is old news; drop it via stop(), whose 300ms cool-down keeps
      // the cancel()->speak() scar mechanics honored (_drain waits it out).
      // Bubbles that arrive together in a burst (celebration + next mission,
      // <3s apart) still queue, so nothing is clipped mid-burst.
      var now = Date.now();
      if ((Voice.speaking || Voice.q.length > 0) && now - (Voice.lastEnqueueAt || 0) > 3000) {
        Voice.stop();
      }
      Voice.lastEnqueueAt = now;
      // ONE queue item per message: the primary voice is a Sarvam clip (whole
      // message = one clip, better prosody + one API call). The browser-TTS
      // fallback chunks internally (_speakUtter).
      Voice.q.push(t.slice(0, 800));
      Voice._drain();
    },
    _drain: function () {
      if (Voice.speaking || Voice.q.length === 0) return;
      var wait = Voice.coolUntil - Date.now();
      if (wait > 0) { setTimeout(function () { Voice._drain(); }, wait); return; }
      var text = Voice.q.shift();
      Voice.speaking = true;
      var settled = false;
      // Watchdog: a fetch or clip that never settles must free the queue.
      var tm = setTimeout(function () { done(); }, 12000 + text.length * 120);
      function done() {
        if (settled) return;
        settled = true;
        clearTimeout(tm);
        Voice.audioEl = null;
        Voice.speaking = false;
        Voice._drain();
      }
      // PRIMARY: a Sarvam bulbul:v3 "priya" clip from the worker — the
      // product's Indian female voice (Rule 30), IDENTICAL for every student
      // in every browser (desktop Chrome ships no Indian-English voice at
      // all, so browser TTS can never satisfy that). KV-cached server-side:
      // each unique line is synthesized once, ever. The deploy page's fetch
      // wrapper attaches the access code; on a local build this endpoint does
      // not exist and the browser-TTS fallback below takes over.
      var fell = false;
      function fallback() {
        if (fell || settled) { if (!fell) done(); return; }
        fell = true;
        Voice._speakUtter(text, done);
      }
      try {
        fetch((QL.chat_server || '') + '/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text, session_id: SID })
        }).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (j) {
            if (settled) return;
            if (!j || !j.audio_b64) { fallback(); return; }
            var a = new Audio('data:audio/wav;base64,' + j.audio_b64);
            Voice.audioEl = a;
            a.onended = done;
            a.onerror = fallback;
            var p = a.play();
            if (p && p.catch) p.catch(fallback);
          })
          .catch(fallback);
      } catch (e) { fallback(); }
    },
    // Browser-TTS fallback for one queue item — chunked at sentence ends
    // (~160 chars) because Chrome can silently drop long utterances mid-way.
    _speakUtter: function (text, done) {
      if (!Voice.ttsOk) { done(); return; }
      var chunks = [];
      var parts = text.split(/([.!?]+ )/);
      var cur = '';
      for (var i = 0; i < parts.length; i++) {
        cur += parts[i];
        if (/[.!?]/.test(parts[i]) || cur.length > 160) {
          if (cur.trim()) chunks.push(cur.trim());
          cur = '';
        }
      }
      if (cur.trim()) chunks.push(cur.trim());
      var k = 0;
      function speakNext() {
        if (k >= chunks.length) { done(); return; }
        var u;
        try { u = new SpeechSynthesisUtterance(chunks[k++]); } catch (e) { done(); return; }
        if (Voice.voice) u.voice = Voice.voice;
        u.lang = 'en-IN';   // Rule 30i: pinned, never read from storage
        u.rate = 0.95;      // a shade under default — physics needs following, not skimming
        u.pitch = 1.0;
        u.onend = speakNext;
        u.onerror = speakNext;
        try { window.speechSynthesis.speak(u); } catch (e) { done(); }
      }
      speakNext();
    },
    stop: function () {
      Voice.q = [];
      Voice.speaking = false;
      if (Voice.audioEl) { try { Voice.audioEl.pause(); } catch (e) {} Voice.audioEl = null; }
      try { window.speechSynthesis.cancel(); } catch (e) {}
      // Scar guard: a speak() straight after cancel() is the flaky Chrome
      // path — hold the queue briefly.
      Voice.coolUntil = Date.now() + 300;
    }
  };

  // ── Mic — dictate a question (pattern copied from the pilot feedback box) ──
  var Mic = {
    on: false, rec: null, armedAt: 0, MAX_MS: 30000,
    toggle: function () { if (Mic.on) Mic.stop(); else Mic.start(); },
    start: function () {
      if (!Voice.SR || Mic.on) return;
      Voice.stop();                 // never talk over the student
      Mic.on = true;
      Mic.armedAt = Date.now();
      Mic.ui();
      Mic.run();
    },
    stop: function () {
      Mic.on = false;
      Mic.ui();
      try { if (Mic.rec) Mic.rec.stop(); } catch (e) {}
    },
    ui: function () {
      var b = $('micBtn');
      b.classList.toggle('listening', Mic.on);
      b.textContent = Mic.on ? '●' : '🎤';
      b.title = Mic.on ? 'Listening — tap to stop' : 'Ask by voice';
    },
    run: function () {
      var r;
      try { r = new Voice.SR(); } catch (e) { Mic.stop(); return; }
      Mic.rec = r;
      r.lang = 'en-IN';             // Rule 30i: pinned dictation language
      r.continuous = true;
      r.interimResults = true;
      r.onresult = function (ev) {
        if (Mic.rec !== r) return;
        var finalText = '', hyp = '';
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          if (ev.results[i].isFinal) finalText += ev.results[i][0].transcript;
          else hyp += ev.results[i][0].transcript;
        }
        if (hyp) $('chatInput').value = hyp.slice(0, 300);
        if (finalText.trim()) {
          $('chatInput').value = finalText.trim().slice(0, 300);
          Mic.stop();
          Actions.event('mic_used', { chars: finalText.trim().length });
          Chat.ask();
        }
      };
      r.onerror = function (ev) {
        if (Mic.rec !== r) return;
        var code = (ev && ev.error) || '';
        if (code === 'no-speech') { Chat.meta('I did not hear anything — tap the mic and try again'); return; }
        if (code === 'aborted') return;
        Mic.stop();
        if (code === 'not-allowed' || code === 'service-not-allowed') Chat.meta('Microphone is blocked — allow it from the mic icon in the address bar, or just type');
        else if (code === 'audio-capture') Chat.meta('No microphone found on this device — you can type instead');
        else if (code === 'network') Chat.meta('Speech needs an internet connection — you can type instead');
        else Chat.meta('Speech input stopped — you can type instead');
      };
      // Chrome ends recognition on silence — re-arm a fresh instance while
      // still within the window (stale instances discarded by the rec check).
      r.onend = function () {
        if (Mic.rec !== r) return;
        if (Mic.on && Date.now() - Mic.armedAt < Mic.MAX_MS) {
          setTimeout(function () { if (Mic.on && Mic.rec === r) Mic.run(); }, 120);
        } else if (Mic.on) {
          Mic.stop();
        }
      };
      try { r.start(); } catch (e) { Mic.stop(); }
    }
  };

  // ── Chat (the tutor surface: scripted beats + real-model answers) ──────────
  var Chat = {
    q: [], busy: false, history: [], online: null, typingEl: null,
    say: function (text, cb) { Chat.q.push({ text: text, cb: cb }); Chat._pump(); },
    _pump: function () {
      if (Chat.busy || Chat.q.length === 0) return;
      Chat.busy = true;
      var item = Chat.q.shift();
      Chat._typing(true);
      var delay = Math.min(1100, 350 + item.text.length * 5);
      setTimeout(function () {
        Chat._typing(false);
        Chat._bubble('tutor', item.text);
        Chat.busy = false;
        if (item.cb) item.cb();
        Chat._pump();
      }, delay);
    },
    meta: function (text) { $('chatThread').appendChild(el('div', 'chatMeta', text)); Chat._scroll(); },
    _bubble: function (role, text) {
      var b = el('div', 'msg ' + role);
      if (role === 'tutor') {
        var av = el('div', 'avatarRow');
        av.appendChild(el('span', 'avDot'));
        av.appendChild(el('span', 'avName', 'Vidi'));
        b.appendChild(av);
        Voice.say(text);   // one hook voices every tutor message; bubbles stay as subtitles
      }
      b.appendChild(el('div', null, text));
      $('chatThread').appendChild(b);
      Chat.history.push({ role: role, text: text });
      if (Chat.history.length > 24) Chat.history = Chat.history.slice(-24);
      Chat._scroll();
    },
    _typing: function (on) {
      if (on) {
        if (Chat.typingEl) return;
        var t = el('div', 'msg tutor typing');
        t.appendChild(el('span', 'tdot')); t.appendChild(el('span', 'tdot')); t.appendChild(el('span', 'tdot'));
        $('chatThread').appendChild(t);
        Chat.typingEl = t; Chat._scroll();
      } else if (Chat.typingEl) {
        Chat.typingEl.remove(); Chat.typingEl = null;
      }
    },
    _scroll: function () { var t = $('chatThread'); t.scrollTop = t.scrollHeight; },
    ask: function () {
      var inp = $('chatInput');
      var question = (inp.value || '').trim();
      if (!question || Chat.online === false) return;
      inp.value = '';
      Chat._bubble('student', question);
      Chat._typing(true);
      Log.send('question_asked', { question: question, state: Sim.curState });
      var payload = {
        session_id: SID, concept_id: QL.concept_id,
        phase: PHASES[App.phase], state: Sim.curState,
        mission_id: (App.phase === 1 && QL.missions[Missions.idx]) ? QL.missions[Missions.idx].id : null,
        question: question,
        recent_actions: Actions.recent(),
        recent_messages: Chat.history.slice(-7, -1),
        live_readings: Sim.readings(),
        tutor_context: QL.tutor_context
      };
      fetch(QL.chat_server + '/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); }).then(function (j) {
        Chat._typing(false);
        Chat._bubble('tutor', j.reply || 'I could not think of an answer. Try asking in a different way!');
        if (Store.data) { Store.data.questions_asked = (Store.data.questions_asked || 0) + 1; Store.save(); }
      }).catch(function () {
        Chat._typing(false);
        Chat._bubble('tutor', 'I am offline right now, but the lesson still works. Keep going!');
        Chat.setOnline(false);
      });
    },
    setOnline: function (on) {
      Chat.online = on;
      $('chatInputRow').classList.toggle('hidden', !on);
      $('askNote').classList.toggle('hidden', on);
    },
    probe: function () {
      try {
        fetch(QL.chat_server + '/api/log', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: SID, type: 'session_start', payload: { concept_id: QL.concept_id } })
        }).then(function (r) { Chat.setOnline(r.ok); }).catch(function () { Chat.setOnline(false); });
      } catch (e) { Chat.setOnline(false); }
    }
  };

  // ── SimBridge — drives + observes the sim iframe ───────────────────────────
  var Sim = {
    frame: null, ready: false, queue: [], curState: null,
    pendingState: null, pendingResolve: null,
    onParam: null,
    init: function () {
      window.addEventListener('message', function (ev) { Sim._onMsg(ev); });
      var f = document.createElement('iframe');
      f.src = QL.sim_src;
      f.setAttribute('allow', 'autoplay');
      $('simBox').appendChild(f);
      Sim.frame = f;
      setTimeout(function () {
        if (Sim.ready) return;
        // particle_field exposes PM_currentState on window; field_3d keeps it
        // inside its closure but always sets window.SIM_CONFIG — either is
        // proof the sim booted even if SIM_READY was missed.
        try {
          var w = f.contentWindow;
          if (w && (typeof w.PM_currentState !== 'undefined' || typeof w.SIM_CONFIG !== 'undefined')) Sim._becomeReady();
        } catch (e) {}
      }, 3000);
    },
    _becomeReady: function () {
      if (Sim.ready) return;
      Sim.ready = true;
      Sim._capture();
      var q = Sim.queue; Sim.queue = [];
      for (var i = 0; i < q.length; i++) Sim.send(q[i]);
    },
    _onMsg: function (ev) {
      var d = ev.data || {};
      if (d.type === 'SIM_READY') Sim._becomeReady();
      else if (d.type === 'STATE_REACHED') {
        Sim.curState = d.state;
        if (Sim.pendingResolve && d.state === Sim.pendingState) {
          var r = Sim.pendingResolve; Sim.pendingResolve = null; r();
        }
      } else if (d.type === 'SIM_ERROR') {
        Missions.simError(d.message || 'simulation error');
      }
    },
    send: function (m) {
      if (!Sim.ready) { Sim.queue.push(m); return; }
      try { Sim.frame.contentWindow.postMessage(m, '*'); } catch (e) {}
    },
    setState: function (id) {
      return new Promise(function (res) {
        if (Sim.curState === id) { res(); return; }
        Sim.pendingState = id; Sim.pendingResolve = res;
        Sim.send({ type: 'SET_STATE', state: id });
        setTimeout(function () {
          if (Sim.pendingResolve === res) { Sim.pendingResolve = null; Sim.curState = id; res(); }
        }, 2000);
      });
    },
    // Param → DOM element. QL.param_map wins (bespoke field_3d panels);
    // otherwise the particle_field pm_sl_<param> convention.
    _paramEl: function (name) {
      var doc = Sim.frame.contentWindow.document;
      var m = QL.param_map[name];
      if (m) return doc.getElementById(m.input_id);
      return doc.getElementById('pm_sl_' + name);
    },
    readParam: function (name) {
      try {
        var el = Sim._paramEl(name);
        if (!el) return null;
        var m = QL.param_map[name];
        if (m && m.kind === 'toggle') return el.textContent || '';
        return parseFloat(el.value);
      } catch (e) { return null; }
    },
    // Live on-screen numbers for the tutor, walked from the QL.readings spec.
    // Sources: 'fn' = top-level window function (particle_field), 'range' =
    // slider value × scale, 'text' = a readout element's own text (field_3d's
    // "F = 0.163 fN"). A failed probe contributes nothing — silence beats a
    // wrong number — and physics is never recomputed in this page.
    readings: function () {
      var out = [];
      try {
        var w = Sim.frame.contentWindow;
        if (!w) return null;
        for (var i = 0; i < QL.readings.length; i++) {
          var spec = QL.readings[i];
          try {
            var val = null;
            if (spec.source === 'fn') {
              if (typeof w[spec.name] === 'function') {
                var n = w[spec.name]();
                if (typeof n === 'number' && isFinite(n)) val = n;
              }
            } else {
              var el = w.document.getElementById(spec.name);
              if (el) {
                if (spec.source === 'text') {
                  var t = (el.textContent || '').trim();
                  if (t) { out.push(spec.label + ' ' + t); continue; }
                } else {
                  var v = parseFloat(el.value);
                  if (isFinite(v)) val = v;
                }
              }
            }
            if (val !== null) {
              if (spec.scale) val = val * spec.scale;
              var r = (spec.round !== undefined) ? spec.round : 2;
              var shown = val.toFixed(r);
              out.push(spec.label + ' ' + shown + (spec.unit ? ' ' + spec.unit : ''));
            }
          } catch (e2) {}
        }
      } catch (e) { return null; }
      return out.length ? out : null;
    },
    // Same-origin capture-phase delegation (particle_field emits no
    // PARAM_UPDATE). Trusted events only — programmatic state changes must
    // never complete a mission.
    _capture: function () {
      try {
        var doc = Sim.frame.contentWindow.document;
        if (doc.documentElement.getAttribute('data-ql-captured')) return;
        doc.documentElement.setAttribute('data-ql-captured', '1');
        // Reverse lookup: DOM element id → param name (from QL.param_map).
        var byId = {};
        var toggles = {};
        for (var p in QL.param_map) {
          byId[QL.param_map[p].input_id] = p;
          if (QL.param_map[p].kind === 'toggle') toggles[QL.param_map[p].input_id] = p;
        }
        function paramOf(el) {
          if (!el || !el.id) return null;
          if (byId[el.id]) return byId[el.id];
          if (el.type === 'range' && el.id.indexOf('pm_sl_') === 0) return el.id.slice(6);
          return null;
        }
        function handler(ev) {
          var t = ev.target;
          if (!ev.isTrusted || !t || t.type !== 'range') return;
          var p = paramOf(t);
          if (p && Sim.onParam) Sim.onParam(p, parseFloat(t.value));
        }
        doc.addEventListener('input', handler, true);
        doc.addEventListener('change', handler, true);
        // Toggle controls (e.g. field_3d's +e/−e charge badge) are click-driven
        // spans, not inputs. Value = the element's text after the flip.
        doc.addEventListener('click', function (ev) {
          var t = ev.target;
          if (!ev.isTrusted || !t || !t.closest) return;
          for (var id in toggles) {
            if (t.closest('#' + id)) {
              // Capture phase runs BEFORE the sim's own click handler flips
              // the text — defer one tick so we report the NEW value.
              (function (tid, pname) {
                setTimeout(function () {
                  var el = doc.getElementById(tid);
                  if (Sim.onParam) Sim.onParam(pname, (el && el.textContent) || 'toggled');
                }, 0);
              })(id, toggles[id]);
              return;
            }
          }
        }, true);
      } catch (e) {}
    }
  };

  // ── Missions (scripted beats delivered through the chat) ───────────────────
  var Missions = {
    idx: 0, active: false, done: false, baseline: null, startedAt: 0,
    hintTimer: null, watchTimer: null, hintShown: false, welcomed: false,
    start: function (i) {
      Missions.idx = i; Missions.active = true; Missions.done = false;
      Missions.baseline = null; Missions.hintShown = false; Missions.startedAt = Date.now();
      clearTimeout(Missions.hintTimer); clearTimeout(Missions.watchTimer);
      var m = QL.missions[i];
      App.showSim();
      $('mBack').classList.add('hidden');
      var prog = $('mProgress'); prog.textContent = '';
      for (var d = 0; d < QL.missions.length; d++) {
        prog.appendChild(el('span', 'dot' + (d < i ? ' ok' : d === i ? ' on' : '')));
      }
      var btn = $('mBtn');
      btn.classList.remove('hidden');
      btn.disabled = true;
      btn.textContent = 'Continue';
      btn.onclick = function () { Missions.next(); };
      if (!Missions.welcomed) {
        Missions.welcomed = true;
        var w = QL.tutor.welcome || [];
        for (var wi = 0; wi < w.length; wi++) Chat.say(w[wi]);
      }
      Chat.meta('Mission ' + (i + 1) + ' of ' + QL.missions.length);
      Chat.say(m.instruction);
      Actions.event('mission_start', { id: m.id, state: m.state });
      if (m.kind === 'observe') {
        Missions.watchTimer = setTimeout(function () {
          btn.textContent = m.done_label || 'Done';
          btn.disabled = false;
        }, m.min_watch_ms || 6000);
      } else if (m.hint) {
        Missions.hintTimer = setTimeout(function () {
          Chat.say('Hint: ' + m.hint);
          Missions.hintShown = true;
        }, m.hint_after_ms || 20000);
      }
      Sim.setState(m.state).then(function () {
        if (m.kind === 'observe') return;
        var live = Sim.readParam(m.success.param);
        if (live === null) { Missions.degrade(); return; }
        if (m.kind === 'change_param') Missions.baseline = live;
      });
    },
    onParam: function (param, value) {
      if (!Missions.active || Missions.done) return;
      var m = QL.missions[Missions.idx];
      if (!m || m.kind === 'observe' || param !== m.success.param) return;
      if (m.kind === 'toggle') { Missions.succeed(); return; }
      if (typeof value !== 'number' || isNaN(value)) return;
      // Ranges/steps come from the param_map entry when one exists (DOM units),
      // else from the concept slider_controls.
      var s = QL.param_map[param] || QL.sliders[param] || {};
      var ok = false;
      if (m.kind === 'set_param') {
        if (m.success.op === 'gte') ok = value >= m.success.value;
        else if (m.success.op === 'lte') ok = value <= m.success.value;
        else ok = Math.abs(value - m.success.value) <= (m.success.tolerance || s.step || 1);
      } else {
        if (Missions.baseline === null) Missions.baseline = value;
        var target;
        if (m.success.delta >= 0) {
          target = Math.min(Missions.baseline + m.success.delta, s.max !== undefined ? s.max : Infinity);
          ok = value >= target || Missions.baseline >= target;
        } else {
          target = Math.max(Missions.baseline + m.success.delta, s.min !== undefined ? s.min : -Infinity);
          ok = value <= target || Missions.baseline <= target;
        }
      }
      if (ok) Missions.succeed();
    },
    succeed: function () {
      if (Missions.done) return;
      Missions.done = true;
      clearTimeout(Missions.hintTimer);
      var m = QL.missions[Missions.idx];
      Chat.say((QL.tutor.celebrations && QL.tutor.celebrations[m.id]) || 'Well done! You completed this step.');
      $('mBtn').disabled = false;
      Actions.event('mission_done', { id: m.id, ms: Date.now() - Missions.startedAt, hint_shown: Missions.hintShown });
    },
    // Slider missing (engine drift or a broken build) — never strand the student.
    degrade: function () {
      Chat.say('The slider for this step could not be found. Watch the simulation, then press Continue.');
      $('mBtn').disabled = false;
    },
    simError: function (msg) {
      Chat.say('The simulation hit a problem (' + msg + '). You can continue without it.');
      $('mBtn').disabled = false;
    },
    next: function () {
      var m = QL.missions[Missions.idx];
      if (Store.data) {
        Store.data.missions.push({
          id: m.id, completed: true,
          ms: Date.now() - Missions.startedAt, hint_shown: Missions.hintShown
        });
        Store.save();
      }
      if (Missions.idx + 1 < QL.missions.length) Missions.start(Missions.idx + 1);
      else { Missions.active = false; App.showRemember(); }
    }
  };

  // ── Quiz (cards; the chat returns on diagnosis replays) ────────────────────
  var LETTERS = ['A', 'B', 'C', 'D'];
  function shuffled(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  var Quiz = {
    k: 0, attempts: 0, gaveUp: false, firstAnswer: null,
    order: [], triedLetters: {},
    start: function (k) {
      Quiz.k = k; Quiz.attempts = 0; Quiz.gaveUp = false; Quiz.firstAnswer = null;
      Quiz.order = shuffled(LETTERS); Quiz.triedLetters = {};
      if (k === 0) Actions.event('quiz_start', {});
      Quiz.render();
    },
    render: function () {
      var q = QL.questions[Quiz.k];
      var inner = App.showCard();
      inner.appendChild(el('div', 'qMeta', 'Question ' + (Quiz.k + 1) + ' of ' + QL.questions.length));
      inner.appendChild(el('h2', null, q.stem));
      var box = el('div', 'box');
      for (var i = 0; i < Quiz.order.length; i++) {
        (function (letter) {
          var b = el('button', 'opt', q.options[letter]);
          b.setAttribute('data-letter', letter);
          if (Quiz.triedLetters[letter]) { b.disabled = true; b.classList.add('wrong'); }
          b.onclick = function () { Quiz.pick(letter, b); };
          box.appendChild(b);
        })(Quiz.order[i]);
      }
      inner.appendChild(box);
      if (Quiz.attempts >= 2) {
        var giveUp = el('button', 'ghost', 'Show me the answer and move on');
        giveUp.onclick = function () { Quiz.showAndMoveOn(); };
        inner.appendChild(giveUp);
      }
    },
    pick: function (letter, btn) {
      var q = QL.questions[Quiz.k];
      if (Quiz.firstAnswer === null) Quiz.firstAnswer = letter;
      Quiz.attempts++;
      Actions.event('quiz_pick', { q_id: q.q_id, letter: letter, correct: letter === q.correct, attempt: Quiz.attempts });
      if (letter === q.correct) {
        btn.classList.add('right');
        var all = document.querySelectorAll('.opt');
        for (var i = 0; i < all.length; i++) all[i].disabled = true;
        Quiz.finishQuestion(true);
      } else {
        Quiz.triedLetters[letter] = true;
        Quiz.showDiagnosis(letter);
      }
    },
    showDiagnosis: function (letter) {
      var q = QL.questions[Quiz.k];
      var d = QL.diagnosis[q.q_id] || {};
      var inner = App.showCard();
      inner.appendChild(el('div', 'qMeta', 'Question ' + (Quiz.k + 1) + ' of ' + QL.questions.length));
      inner.appendChild(el('h2', null, 'Not yet \\u2014 look again'));
      var box = el('div', 'box');
      box.appendChild(el('p', 'wrongLine', 'Why that answer is wrong: ' + (q.distractor_misconceptions[letter] || 'it does not match what the simulation showed.')));
      box.appendChild(el('p', 'note', d.replay_prompt || ''));
      inner.appendChild(box);
      var row = el('div', 'btnRow');
      if (d.replay_state) {
        var see = el('button', null, 'See it again');
        see.onclick = function () { Quiz.replay(d); };
        row.appendChild(see);
      }
      var back = el('button', 'ghost', 'Back to the question');
      back.onclick = function () { Quiz.render(); };
      row.appendChild(back);
      inner.appendChild(row);
      var rec = Quiz.currentRecord();
      rec.attempts = Quiz.attempts;
      Store.save();
    },
    replay: function (d) {
      var rec = Quiz.currentRecord();
      rec.saw_replay = true; Store.save();
      Actions.event('quiz_replay', { state: d.replay_state });
      App.showSim();
      Missions.active = false;
      $('mProgress').textContent = '';
      $('mBtn').classList.add('hidden');
      Chat.meta('Look again');
      Chat.say(d.replay_prompt || 'Watch this part again. Ask me if anything is unclear.');
      var back = $('mBack');
      back.classList.remove('hidden');
      back.onclick = function () { back.classList.add('hidden'); Quiz.render(); };
      Sim.setState(d.replay_state);
    },
    showAndMoveOn: function () {
      Quiz.gaveUp = true;
      var q = QL.questions[Quiz.k];
      Actions.event('quiz_gave_up', { q_id: q.q_id });
      var inner = App.showCard();
      inner.appendChild(el('div', 'qMeta', 'Question ' + (Quiz.k + 1) + ' of ' + QL.questions.length));
      inner.appendChild(el('h2', null, 'The answer'));
      var box = el('div', 'box');
      box.appendChild(el('p', 'rightLine', q.options[q.correct]));
      box.appendChild(el('p', 'note', q.tested_idea));
      inner.appendChild(box);
      var next = el('button', null, 'Next');
      next.onclick = function () { Quiz.finishQuestion(false); };
      inner.appendChild(next);
    },
    finishQuestion: function (correctNow) {
      var q = QL.questions[Quiz.k];
      var rec = Quiz.currentRecord();
      rec.first_answer = Quiz.firstAnswer;
      rec.correct_first_try = Quiz.firstAnswer === q.correct;
      rec.attempts = Quiz.attempts;
      rec.gave_up = Quiz.gaveUp;
      Store.save();
      if (correctNow) {
        var inner = App.showCard();
        inner.appendChild(el('h2', null, Quiz.attempts === 1 ? 'Correct' : 'Got it \\u2014 on the retry'));
        var box = el('div', 'box');
        box.appendChild(el('p', 'rightLine', q.tested_idea));
        inner.appendChild(box);
        var next = el('button', null, Quiz.k + 1 < QL.questions.length ? 'Next question' : 'See my result');
        next.onclick = function () { Quiz.advance(); };
        inner.appendChild(next);
      } else {
        Quiz.advance();
      }
    },
    advance: function () {
      if (Quiz.k + 1 < QL.questions.length) Quiz.start(Quiz.k + 1);
      else App.showSummary();
    },
    currentRecord: function () {
      var q = QL.questions[Quiz.k];
      for (var i = 0; i < Store.data.quiz.length; i++) {
        if (Store.data.quiz[i].q_id === q.q_id) return Store.data.quiz[i];
      }
      var rec = { q_id: q.q_id, first_answer: null, correct_first_try: false, attempts: 0, saw_replay: false, gave_up: false };
      Store.data.quiz.push(rec);
      return rec;
    }
  };

  // ── App (phases + chrome) ──────────────────────────────────────────────────
  var PHASES = ['Intro', 'Missions', 'Remember', 'Quiz', 'Result'];
  var App = {
    phase: 0,
    setPhase: function (p) {
      App.phase = p;
      var chips = $('chips'); chips.textContent = '';
      for (var i = 0; i < PHASES.length; i++) {
        chips.appendChild(el('span', 'chip' + (i === p ? ' on' : i < p ? ' done' : ''), PHASES[i]));
      }
    },
    showSim: function () {
      $('card').classList.add('hidden');
      $('simWrap').classList.remove('hidden');
    },
    showCard: function () {
      // Cards are silent by design (quiz questions read aloud would help
      // neighbours copy; Remember/summary are for reading) — and a card
      // switch is always student-initiated, so cutting speech here is expected.
      Voice.stop();
      $('simWrap').classList.add('hidden');
      $('card').classList.remove('hidden');
      var inner = $('cardInner'); inner.textContent = '';
      return inner;
    },
    start: function () {
      Sim.init();
      Sim.onParam = function (p, v) { Actions.slider(p, v); Missions.onParam(p, v); };
      $('chatSend').onclick = function () { Chat.ask(); };
      $('chatInput').addEventListener('keydown', function (ev) { if (ev.key === 'Enter') Chat.ask(); });
      Voice.init();
      $('voiceBtn').onclick = function () { Voice.toggle(); };
      if (Voice.SR) {
        $('micBtn').classList.remove('hidden');
        $('micBtn').onclick = function () { Mic.toggle(); };
      }
      Actions.event('voice_support', { tts: Voice.ttsOk, stt: !!Voice.SR, enabled: Voice.enabled });
      Chat.probe();
      App.showIntro();
    },
    showIntro: function () {
      App.setPhase(0);
      var inner = App.showCard();
      inner.appendChild(el('h1', null, QL.title));
      inner.appendChild(el('h2', null, QL.intro.heading));
      var box = el('div', 'box');
      for (var i = 0; i < QL.intro.lines.length; i++) box.appendChild(el('p', null, QL.intro.lines[i]));
      inner.appendChild(box);
      if (QL.intro.what_changes.length) {
        var tbl = el('table');
        var hr = el('tr'); hr.appendChild(el('th', null, 'You change')); hr.appendChild(el('th', null, 'You see'));
        tbl.appendChild(hr);
        for (var w = 0; w < QL.intro.what_changes.length; w++) {
          var r = el('tr');
          r.appendChild(el('td', null, QL.intro.what_changes[w].you_change));
          r.appendChild(el('td', null, QL.intro.what_changes[w].you_see));
          tbl.appendChild(r);
        }
        inner.appendChild(tbl);
      }
      var prev = Store.load();
      var row = el('div', 'btnRow');
      if (prev && prev.finished_at) {
        inner.appendChild(el('p', 'note', 'Last time: ' + prev.score_first_try + ' out of ' + QL.questions.length + ' on the first try.'));
        var cont = el('button', 'ghost', 'See my last result');
        cont.onclick = function () { Store.data = prev; App.showSummary(); };
        row.appendChild(cont);
      }
      var startBtn = el('button', null, "Let's see it");
      startBtn.onclick = function () { Store.fresh(); Store.save(); App.setPhase(1); Missions.start(0); };
      row.insertBefore(startBtn, row.firstChild);
      inner.appendChild(row);
    },
    showRemember: function () {
      App.setPhase(2);
      var inner = App.showCard();
      inner.appendChild(el('h1', null, 'Remember this'));
      var box = el('div', 'box');
      for (var i = 0; i < QL.remember.key_ideas.length; i++) {
        var k = el('div', 'kidea');
        k.appendChild(el('span', 'n', String(i + 1) + '.'));
        k.appendChild(el('span', null, QL.remember.key_ideas[i]));
        box.appendChild(k);
      }
      inner.appendChild(box);
      var fbox = el('div', 'box');
      fbox.appendChild(el('div', 'formula', QL.remember.formula.plain));
      fbox.appendChild(el('p', 'note', QL.remember.formula.reading));
      inner.appendChild(fbox);
      var mbox = el('div', 'box');
      mbox.appendChild(el('h2', null, 'The common mistake'));
      mbox.appendChild(el('p', 'wrongLine', '\\u2717 ' + QL.remember.common_mistake.wrong));
      mbox.appendChild(el('p', 'rightLine', '\\u2713 ' + QL.remember.common_mistake.right));
      inner.appendChild(mbox);
      if (QL.tutor.quiz_intro) inner.appendChild(el('p', 'note', QL.tutor.quiz_intro));
      var go = el('button', null, 'Start the ' + QL.questions.length + ' questions');
      go.onclick = function () { App.setPhase(3); Quiz.start(0); };
      inner.appendChild(go);
    },
    showSummary: function () {
      App.setPhase(4);
      if (!Store.data.finished_at) {
        var score = 0;
        for (var i = 0; i < Store.data.quiz.length; i++) if (Store.data.quiz[i].correct_first_try) score++;
        Store.data.score_first_try = score;
        Store.data.finished_at = new Date().toISOString();
        Store.data.skills = App.skillVerdicts();
        Store.save();
        Actions.event('summary', { score: score, skills: Store.data.skills, questions_asked: Store.data.questions_asked || 0 });
      }
      var inner = App.showCard();
      inner.appendChild(el('h1', null, 'You learned it'));
      inner.appendChild(el('div', 'score', Store.data.score_first_try + ' / ' + QL.questions.length));
      inner.appendChild(el('p', 'note', 'Right on the first try.'));
      var box = el('div', 'box');
      var labels = { concept: 'Concept', calculation: 'Calculation', graph: 'Graph reading', direction: 'Direction (right-hand rule)', misconception: 'Common mistake' };
      var lines = {
        strong: 'Good. Keep it.',
        getting_there: 'You fixed it after a retry. Look at this once more tomorrow.',
        review: 'Watch the linked part of the simulation again, then retry the quiz.'
      };
      var cls = { strong: 'v-strong', getting_there: 'v-mid', review: 'v-review' };
      var words = { strong: 'Strong', getting_there: 'Getting there', review: 'Review this' };
      for (var bucket in QL.skills) {
        var v = Store.data.skills[bucket] || 'strong';
        var rowEl = el('div', 'verdictRow');
        var left = el('div');
        left.appendChild(el('div', null, labels[bucket] || bucket));
        left.appendChild(el('div', 'note', lines[v]));
        rowEl.appendChild(left);
        rowEl.appendChild(el('div', cls[v], words[v]));
        box.appendChild(rowEl);
      }
      inner.appendChild(box);
      if (QL.tutor.summary_line) inner.appendChild(el('p', 'note', QL.tutor.summary_line));
      App.feedbackCard(inner);
      var row = el('div', 'btnRow');
      var again = el('button', 'ghost', 'Try the quiz again');
      again.onclick = function () {
        Store.data.quiz = []; Store.data.finished_at = null; Store.data.score_first_try = 0; Store.save();
        App.setPhase(3); Quiz.start(0);
      };
      var free = el('button', 'ghost', 'Free play');
      free.onclick = function () { App.freePlay(); };
      var over = el('button', 'ghost', 'Start over');
      over.onclick = function () { Store.clear(); App.showIntro(); };
      row.appendChild(again); row.appendChild(free); row.appendChild(over);
      inner.appendChild(row);
    },
    // Two taps and an optional line. Kept this short on purpose — a long form
    // at the end of a lesson is a form nobody fills in.
    feedbackCard: function (inner) {
      if (Store.data && Store.data.feedback_sent) return;
      var box = el('div', 'box');
      box.appendChild(el('h2', null, 'Tell us how it went'));
      box.appendChild(el('p', 'note', 'Two taps. It helps us make the next lesson better.'));
      var picked = { helped: null, again: null };

      function pills(question, key, options) {
        box.appendChild(el('p', null, question));
        var rowEl = el('div', 'btnRow');
        options.forEach(function (opt) {
          var b = el('button', 'ghost', opt);
          b.onclick = function () {
            picked[key] = opt;
            var sibs = rowEl.querySelectorAll('button');
            for (var i = 0; i < sibs.length; i++) sibs[i].className = 'ghost';
            b.className = '';
            check();
          };
          rowEl.appendChild(b);
        });
        box.appendChild(rowEl);
      }

      pills('Did this help you understand it?', 'helped', ['Yes, a lot', 'Somewhat', 'Not really']);
      pills('Would you use this for other chapters?', 'again', ['Yes', 'Maybe', 'No']);

      var ta = document.createElement('textarea');
      ta.id = 'fbComment';
      ta.rows = 2;
      ta.maxLength = 500;
      ta.placeholder = 'Anything confusing? What would make it better? (optional)';
      ta.style.cssText = 'width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:10px;color:var(--text);font:inherit;padding:9px 12px;resize:vertical;';
      box.appendChild(ta);

      var send = el('button', null, 'Send feedback');
      send.disabled = true;
      box.appendChild(send);
      function check() { send.disabled = !(picked.helped && picked.again); }

      send.onclick = function () {
        send.disabled = true;
        send.textContent = 'Sending…';
        var payload = {
          type: 'feedback', session_id: SID, concept_id: QL.concept_id,
          helped: picked.helped, would_use_again: picked.again,
          comment: ta.value || '',
          score_first_try: Store.data.score_first_try,
          questions_total: QL.questions.length,
          questions_asked: Store.data.questions_asked || 0,
          missions_completed: (Store.data.missions || []).length,
          skills: Store.data.skills || null,
          minutes_spent: Store.data.started_at
            ? Math.round((Date.now() - new Date(Store.data.started_at).getTime()) / 60000) : null
        };
        // The Edge Function is one URL and routes on body.type; the localhost
        // prototype server routes on path.
        var isEdge = QL.chat_server.indexOf('/functions/') > -1;
        fetch(QL.chat_server + (isEdge ? '' : '/api/feedback'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        }).then(function () { done(); }).catch(function () { done(); });
      };
      function done() {
        if (Store.data) { Store.data.feedback_sent = true; Store.save(); }
        box.textContent = '';
        box.appendChild(el('h2', null, 'Thank you!'));
        box.appendChild(el('p', 'note', 'Your answer went straight to the person who built this.'));
      }
      inner.appendChild(box);
    },
    skillVerdicts: function () {
      var out = {};
      var byId = {};
      for (var i = 0; i < Store.data.quiz.length; i++) byId[Store.data.quiz[i].q_id] = Store.data.quiz[i];
      for (var bucket in QL.skills) {
        var qids = QL.skills[bucket];
        var allFirst = true, anyGaveUp = false;
        for (var j = 0; j < qids.length; j++) {
          var rec = byId[qids[j]];
          if (!rec || !rec.correct_first_try) allFirst = false;
          if (rec && rec.gave_up) anyGaveUp = true;
        }
        out[bucket] = allFirst ? 'strong' : anyGaveUp ? 'review' : 'getting_there';
      }
      return out;
    },
    freePlay: function () {
      App.showSim();
      Missions.active = false;
      Actions.event('free_play', {});
      $('mProgress').textContent = '';
      $('mBtn').classList.add('hidden');
      Chat.meta('Free play');
      Chat.say('Both sliders are yours now. Make the current large, then small. Watch the graph follow you \\u2014 and ask me anything you wonder about.');
      var back = $('mBack');
      back.classList.remove('hidden');
      back.textContent = 'Back to my result';
      back.onclick = function () {
        back.classList.add('hidden'); back.textContent = 'Back to the question';
        App.showSummary();
      };
      Sim.setState(QL.explore_state);
    },
    simError: function (msg) { Missions.simError(msg); }
  };

  App.start();
})();
</script>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * The page is emitted from a template literal, so a single backslash inside it
 * is swallowed: writing /\s+/ in the source ships /s+/ to the browser, which
 * silently deletes every letter "s" from the text it touches. It is valid
 * JavaScript, so `node --check` never catches it — this does.
 * Shipped that way once (voice narration, 2026-08-19); never again.
 */
function assertNoEatenEscapes(html: string): void {
    const suspects: { re: RegExp; why: string }[] = [
        { re: /replace\(\/s\+\/g/, why: '/s+/ — an eaten \\s+ (deletes the letter s)' },
        { re: /\/\bb[A-Za-z]+\\?b\//, why: '/bWORDb/ — eaten \\b word boundaries' },
        { re: /\[0-9\]s\*/, why: '[0-9]s* — an eaten \\s*' },
        { re: /\/d\+\//, why: '/d+/ — an eaten \\d+' },
    ];
    const bad = suspects.filter((s) => s.re.test(html));
    if (bad.length > 0) {
        fail('emitted page contains eaten escape sequences (double the backslashes in the template):\n' +
            bad.map((b) => '  - ' + b.why).join('\n'));
    }
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main(): void {
    const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
    const isPublic = process.argv.includes('--public');
    const conceptId = args[0] || 'ohms_law';
    const root = process.cwd();

    // Local dev talks to the localhost prototype server; the public build talks
    // to the deployed Supabase Edge Function (supabase/functions/quicklearn-chat).
    const defaultChat = isPublic
        ? 'https://dxwpkjfypzxrzgbevfnx.supabase.co/functions/v1/quicklearn-chat'
        : 'http://localhost:8082';
    const chatServer = process.env.QL_CHAT_URL || defaultChat;

    const conceptRaw = loadJson(join(root, 'src', 'data', 'concepts', conceptId + '.json'), 'concept JSON') as ConceptJson;
    const missionRaw = loadJson(join(root, 'src', 'data', 'quicklearn', conceptId + '.json'), 'quicklearn mission config');
    const parsed = missionFileSchema.safeParse(missionRaw);
    if (!parsed.success) {
        fail('mission config invalid:\n' + parsed.error.issues.map((i) => '  ' + i.path.join('.') + ': ' + i.message).join('\n'));
    }
    const mission = parsed.data;
    if (mission.concept_id !== conceptId) {
        fail('mission config concept_id "' + mission.concept_id + '" does not match "' + conceptId + '".');
    }

    crossValidate(conceptRaw, mission);
    const stage = resolveStage(mission, root);
    checkStageCoverage(conceptRaw, stage);

    const simPath = join(root, 'review-site', conceptId, 'sim.html');
    if (!existsSync(simPath)) {
        console.warn('\nWARNING: ' + simPath + ' does not exist.');
        console.warn('The Quick Learn page will 404 its iframe until you run:');
        console.warn('  npm run build:review -- ' + conceptId + '\n');
    }

    if (!isPublic) {
        // Local build: the page sits beside the built sims and reuses
        // review-site/vendor/ through sim.html's own relative path.
        const ql = buildQlConfig(conceptRaw, mission, chatServer, '../../' + conceptId + '/sim.html', stage);
        const outDir = join(root, 'review-site', 'quicklearn', conceptId);
        mkdirSync(outDir, { recursive: true });
        const outPath = join(outDir, 'index.html');
        const pageHtml = renderPage(ql, mission.title);
        assertNoEatenEscapes(pageHtml);
        writeFileSync(outPath, pageHtml, 'utf-8');

        console.log('build:quicklearn OK — ' + outPath);
        console.log('  missions: ' + mission.missions.length + '   quiz questions: ' + mission.quiz.question_ids.length + '   chat: ' + chatServer);
        console.log('  serve:  npm run serve:review   then open http://localhost:8080/quicklearn/' + conceptId + '/');
        console.log('  chat backend:  npm run quicklearn:chat   (DeepSeek; key from .env.local)');
        return;
    }

    // ── Public build (--public) ──────────────────────────────────────────────
    // Self-contained folder under website/ — the marketing-site worker serves it
    // as static assets (wrangler.toml, [assets] directory = "./website"). It is
    // deliberately NOT part of app.viditra.co: that is the paying teacher app,
    // and this is an unproven student surface.
    //
    // website/ has no vendor/ dir, so sim.html's ../vendor/ references are
    // rewritten to siblings and the files copied in. Vendored rather than CDN
    // on purpose — same classroom-reliability reason the pilot vendors three/
    // katex/p5 (a student on a weak connection should not depend on jsdelivr).
    if (!existsSync(simPath)) fail('--public needs the built sim. Run: npm run build:review -- ' + conceptId);

    const slug = conceptId.replace(/_/g, '-');
    const outDir = join(root, 'website', 'learn', slug);
    mkdirSync(outDir, { recursive: true });

    let simHtml = readFileSync(simPath, 'utf-8');
    const vendorRefs = [...simHtml.matchAll(/\.\.\/vendor\/([A-Za-z0-9._-]+)/g)].map((m) => m[1]);
    for (const file of [...new Set(vendorRefs)]) {
        const src = join(root, 'review-site', 'vendor', file);
        if (!existsSync(src)) fail('sim.html needs vendor/' + file + ' but it is missing from review-site/vendor/.');
        copyFileSync(src, join(outDir, file));
        console.log('  vendored: ' + file);
        // katex.min.css pulls its webfonts via relative url(fonts/...) — copy
        // the fonts dir alongside or KaTeX silently degrades to system fonts.
        if (file === 'katex.min.css') {
            const fontsSrc = join(root, 'review-site', 'vendor', 'fonts');
            if (existsSync(fontsSrc)) {
                cpSync(fontsSrc, join(outDir, 'fonts'), { recursive: true });
                console.log('  vendored: fonts/ (KaTeX webfonts)');
            }
        }
    }
    simHtml = simHtml.replace(/\.\.\/vendor\//g, './');
    writeFileSync(join(outDir, 'sim.html'), simHtml, 'utf-8');

    const ql = buildQlConfig(conceptRaw, mission, chatServer, './sim.html', stage);
    const publicHtml = renderPage(ql, mission.title);
    assertNoEatenEscapes(publicHtml);
    writeFileSync(join(outDir, 'index.html'), publicHtml, 'utf-8');

    console.log('build:quicklearn --public OK — ' + outDir);
    console.log('  chat endpoint : ' + chatServer);
    console.log('  preview       : npm run serve:site   →  http://localhost:8090/learn/' + slug + '/');
    console.log('  live (after founder deploy): https://viditra.co/learn/' + slug + '/');
    console.log('');
    console.log('  BEFORE the first deploy, the Edge Function must exist + hold the key:');
    console.log('    supabase secrets set DEEPSEEK_API_KEY=...   (Supabase dashboard → Edge Functions → Secrets)');
    console.log('    deploy supabase/functions/quicklearn-chat with JWT verification OFF');
    console.log('  Then publish the site:  npm run deploy:cf-site');
}

main();
