import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { logUsage } from '@/lib/usageLogger';
import crypto from 'crypto';

export interface QuestionFingerprint {
    concept_id: string;
    intent: Intent;
    class_level: string;
    mode: string;
    aspect: string;
    cache_key: string;
    confidence: number;
    ncert_chapter?: string;
    variables_changing?: string[];
    parse_failed?: boolean;  // true when JSON was truncated/unparseable — skip MVS + cache
}

export type Intent =
    | 'understand'
    | 'derive'
    | 'hypothetical'
    | 'compare'
    | 'apply'
    | 'define'
    | 'specific_confusion';  // student has a specific wrong belief about HOW something works

// ══════════════════════════════════════════════════════════════════
// Canonical concept_id registry — single source of truth.
// Must match the list advertised to the classifier LLM below, and
// must match filenames in src/data/concepts/ (minus .json).
// Any upstream layer (inputUnderstanding, intentResolver, vision)
// that returns a concept_id NOT in this set is untrusted and will
// be dropped by the route handler's validity guard.
// ══════════════════════════════════════════════════════════════════
export const VALID_CONCEPT_IDS: ReadonlySet<string> = new Set([
    // Current electricity
    'ohms_law', 'parallel_resistance', 'series_resistance',
    'kirchhoffs_voltage_law', 'kirchhoffs_current_law', 'kirchhoffs_laws',
    'wheatstone_bridge', 'meter_bridge', 'internal_resistance',
    'electric_power_heating', 'drift_velocity', 'resistivity', 'resistance',
    'temperature_dependence_of_resistance', 'resistance_temperature_dependence',
    'potentiometer',
    // Vectors / kinematics (Ch.5-7)
    'vector_resolution',
    // Atomic splits from former vector_basics bundle (Ch.5.2)
    'unit_vector', 'angle_between_vectors', 'scalar_multiplication',
    'negative_vector', 'equal_vs_parallel',
    // Atomic splits from former scalar_vs_vector bundle (Ch.5.1)
    'current_not_vector', 'parallelogram_law_test', 'pressure_scalar',
    'area_vector',
    // Atomic splits from former vector_addition bundle (Ch.5.2)
    'resultant_formula', 'special_cases', 'range_inequality',
    'direction_of_resultant',
    // Atomic splits from former vector_components bundle (Ch.5.3)
    'unit_vector_form', 'inclined_plane_components', 'negative_components',
    'dot_product',
    // Atomic splits from former distance_vs_displacement bundle (Ch.6.1-6.5)
    'distance_displacement_basics', 'average_speed_velocity',
    'instantaneous_velocity', 'sign_convention', 's_in_equations',
    // Atomic splits from former uniform_acceleration bundle (Ch.6.6-6.9)
    'three_cases', 'free_fall', 'sth_formula', 'negative_time',
    // Atomic splits from former non_uniform_acceleration bundle (Ch.7.1-7.4)
    'a_function_of_t', 'a_function_of_x', 'a_function_of_v', 'initial_conditions',
    // Atomic splits from former motion_graphs bundle (Ch.7.5)
    'xt_graph', 'vt_graph', 'at_graph', 'direction_reversal',
    // Atomic splits from former relative_motion bundle (Ch.6.10)
    'vab_formula', 'relative_1d_cases', 'time_to_meet',
    // Atomic splits from former river_boat_problems bundle (Ch.6.11)
    'upstream_downstream', 'shortest_time_crossing', 'shortest_path_crossing',
    // Atomic splits from former rain_umbrella bundle (Ch.6.12)
    'apparent_rain_velocity', 'umbrella_tilt_angle',
    // Atomic splits from former aircraft_wind_problems bundle (Ch.6.13)
    'ground_velocity_vector', 'heading_correction',
    // Atomic splits from former projectile_motion bundle (Ch.7.6)
    'time_of_flight', 'max_height', 'range_formula',
    // Atomic splits from former projectile_inclined bundle (Ch.7.7)
    'up_incline_projectile', 'down_incline_projectile',
    // Atomic splits from former relative_motion_projectiles bundle (Ch.7.8)
    'two_projectile_meeting', 'two_projectile_never_meet',
    // Forces (Ch.8)
    'field_forces', 'contact_forces', 'normal_reaction', 'tension_in_string',
    'hinge_force', 'free_body_diagram',
    // Friction (Ch.8.5)
    'friction_static_kinetic',
]);

// Synonyms → canonical IDs. Gemini/Flash often return physicist-common synonyms
// ("normal_force", "tension", "weight") instead of the slug we store. Map them
// before the validity guard so the override can still apply.
//
// Also: the second block below covers legacy parent-bundle names. After the
// 2026-04-18 atomic-split migration these bundles are no longer valid concept
// IDs. Historical caches and older classifier outputs can still reference them,
// so each legacy name redirects to the foundational atomic child as a safety
// net. The CLASSIFIER_PROMPT has been pruned of these bundles — Gemini should
// never return them for new queries — but keeping the redirect is defensive.
export const CONCEPT_SYNONYMS: Readonly<Record<string, string>> = {
    normal_force: 'normal_reaction',
    normal_forces: 'normal_reaction',
    tension: 'tension_in_string',
    rope_tension: 'tension_in_string',
    atwood_machine: 'tension_in_string',
    contact_force: 'contact_forces',
    field_force: 'field_forces',
    weight: 'field_forces',
    gravitational_force: 'field_forces',
    fbd: 'free_body_diagram',
    laws_of_motion: 'free_body_diagram',
    friction: 'friction_static_kinetic',
    static_friction: 'friction_static_kinetic',
    kinetic_friction: 'friction_static_kinetic',
    coefficient_of_friction: 'friction_static_kinetic',
    mu_s: 'friction_static_kinetic',
    mu_k: 'friction_static_kinetic',
    kirchhoffs_law: 'kirchhoffs_laws',
    // Legacy parent-bundle redirects (post-split). See PROGRESS.md 2026-04-18
    // for the split history. Each bundle routes to its foundational atomic child.
    vector_basics: 'unit_vector',
    vector_addition: 'resultant_formula',
    vector_components: 'vector_resolution',
    scalar_vs_vector: 'current_not_vector',
    distance_vs_displacement: 'distance_displacement_basics',
    uniform_acceleration: 'three_cases',
    non_uniform_acceleration: 'a_function_of_t',
    motion_graphs: 'xt_graph',
    relative_motion: 'vab_formula',
    river_boat_problems: 'upstream_downstream',
    rain_umbrella: 'apparent_rain_velocity',
    aircraft_wind_problems: 'ground_velocity_vector',
    projectile_motion: 'time_of_flight',
    projectile_inclined: 'up_incline_projectile',
    relative_motion_projectiles: 'two_projectile_meeting',
};

export function normalizeConceptId(id: string | null | undefined): string | null {
    if (!id) return null;
    const slug = id.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
    if (VALID_CONCEPT_IDS.has(slug)) return slug;
    const aliased = CONCEPT_SYNONYMS[slug];
    if (aliased && VALID_CONCEPT_IDS.has(aliased)) return aliased;
    return null;
}

// ══════════════════════════════════════════════════════════════════
// CLASSIFIER_PROMPT ↔ VALID_CONCEPT_IDS drift detector.
// Runs once at module load (dev only). Parses the concept IDs advertised in
// the prompt against VALID_CONCEPT_IDS + CONCEPT_SYNONYMS and logs a warning
// for any mismatch. This is the sentinel that catches session-31.5 + 32's
// silent failure class: the prompt advertised legacy bundle names that were
// split months earlier, Gemini returned them, `normalizeConceptId` silently
// resolved to the wrong atomic child, and downstream pipelines misrouted.
//
// Any concept a json_author registers in VALID_CONCEPT_IDS must also appear in
// the prompt's valid list — otherwise Gemini won't know to return it. Any
// concept in the prompt that's not in VALID_CONCEPT_IDS (and isn't an alias)
// is a stale entry — prune it.
//
// Reads only the "VALID CONCEPT IDs" block (before "CRITICAL DISAMBIGUATION")
// so disambiguation hint IDs are free to reference valid concepts without
// re-declaration.
// ══════════════════════════════════════════════════════════════════

function extractAdvertisedConcepts(prompt: string): Set<string> {
    const anchor = 'VALID CONCEPT IDs — you MUST return one of these exactly as written:';
    const start = prompt.indexOf(anchor);
    const end = prompt.indexOf('CRITICAL DISAMBIGUATION');
    if (start < 0 || end < 0 || end <= start) return new Set();
    const block = prompt.slice(start, end);
    const ids = new Set<string>();
    for (const raw of block.split('\n')) {
        const trimmed = raw.trim();
        // Skip section separators (── Heading ──), the anchor itself, and empty lines.
        if (!trimmed || trimmed.startsWith('──') || trimmed.startsWith('════') || trimmed.startsWith('VALID CONCEPT')) continue;
        // First token on a concept line is the slug (lowercase + underscores).
        const match = trimmed.match(/^([a-z][a-z0-9_]*)/);
        if (match) ids.add(match[1]);
    }
    return ids;
}

function assertClassifierPromptInSync(): void {
    const advertised = extractAdvertisedConcepts(CLASSIFIER_PROMPT);
    const missingFromPrompt: string[] = [];
    const unknownInPrompt: string[] = [];

    for (const valid of VALID_CONCEPT_IDS) {
        if (!advertised.has(valid)) missingFromPrompt.push(valid);
    }
    for (const adv of advertised) {
        if (!VALID_CONCEPT_IDS.has(adv) && !(adv in CONCEPT_SYNONYMS)) {
            unknownInPrompt.push(adv);
        }
    }

    if (missingFromPrompt.length > 0) {
        console.warn(
            '[intentClassifier] ⚠️ VALID_CONCEPT_IDS not advertised in CLASSIFIER_PROMPT:',
            missingFromPrompt.join(', '),
            '\n  → Gemini will never classify queries to these IDs until the prompt lists them.',
            '\n  → json_author registration site #8: add each new atomic ID to the prompt\'s VALID CONCEPT IDs block.',
        );
    }
    if (unknownInPrompt.length > 0) {
        console.warn(
            '[intentClassifier] ⚠️ CLASSIFIER_PROMPT advertises IDs not in VALID_CONCEPT_IDS or CONCEPT_SYNONYMS:',
            unknownInPrompt.join(', '),
            '\n  → Gemini may return these, `normalizeConceptId` will reject them, and /api/chat will fail.',
            '\n  → Prune the prompt or add the ID to VALID_CONCEPT_IDS.',
        );
    }
}

// The assertion runs at the bottom of this file — after CLASSIFIER_PROMPT is
// defined — to avoid a temporal-dead-zone ReferenceError.

const CLASSIFIER_PROMPT = `You are a physics question analyzer for Indian Class 10-12 students.

════════════════════════════
VALID CONCEPT IDs — you MUST return one of these exactly as written:
════════════════════════════
  ── Current electricity (Ch.3) ──
  ohms_law              ← V=IR, non-ohmic conductors, current same through series resistors
  parallel_resistance   ← 1/R = 1/R1 + 1/R2, current splits across branches
  series_resistance     ← R = R1 + R2, same current through every element
  kirchhoffs_voltage_law
  kirchhoffs_current_law
  kirchhoffs_laws       ← combined KVL+KCL questions
  wheatstone_bridge
  meter_bridge
  internal_resistance
  electric_power_heating ← P=I²R, Joule heating, bulb glows, heating effect
  drift_velocity
  resistivity
  resistance
  temperature_dependence_of_resistance
  resistance_temperature_dependence
  potentiometer

  ── Vectors (Ch.5) ── atomic splits
  vector_resolution        ← resolving a force/vector at an angle into axes
  unit_vector              ← definition, magnitude, direction of unit vector
  angle_between_vectors
  scalar_multiplication    ← scaling a vector by a scalar
  negative_vector
  equal_vs_parallel
  current_not_vector       ← why current is scalar despite having direction
  parallelogram_law_test
  pressure_scalar          ← why pressure is scalar
  area_vector
  resultant_formula        ← R = sqrt(P² + Q² + 2PQcosθ), triangle/parallelogram
  special_cases            ← θ=0, θ=90, θ=180 specific resultant outcomes
  range_inequality         ← |P−Q| ≤ |R| ≤ P+Q
  direction_of_resultant   ← tanα = Qsinθ/(P+Qcosθ)
  unit_vector_form         ← a = axî + ayĵ + azk̂
  inclined_plane_components ← mgsinθ along incline, mgcosθ perpendicular
  negative_components
  dot_product              ← A·B = AB cosθ, scalar product

  ── Kinematics (Ch.6-7) ── atomic splits
  distance_displacement_basics   ← path length vs displacement
  average_speed_velocity
  instantaneous_velocity
  sign_convention
  s_in_equations
  three_cases             ← v = u + at / s = ut + ½at² / v² = u² + 2as
  free_fall
  sth_formula             ← s_nth displacement in n-th second
  negative_time
  a_function_of_t
  a_function_of_x
  a_function_of_v
  initial_conditions
  xt_graph                ← position-time graph interpretation
  vt_graph                ← velocity-time graph interpretation
  at_graph                ← acceleration-time graph interpretation
  direction_reversal

  ── Relative motion (Ch.6.10-6.13) ── atomic splits
  vab_formula             ← v_AB = v_A − v_B, 1D/2D relative velocity definition
  relative_1d_cases
  time_to_meet
  upstream_downstream     ← boat in river, along vs against stream
  shortest_time_crossing
  shortest_path_crossing
  apparent_rain_velocity  ← v_rain_rel = v_rain − v_person (magnitude + direction)
  umbrella_tilt_angle     ← tanθ = v_person / v_rain, which way to tilt umbrella
  ground_velocity_vector  ← aircraft + wind: v_ground = v_air + v_wind
  heading_correction      ← pilot's heading to counter crosswind

  ── Projectiles (Ch.7.6-7.8) ── atomic splits
  time_of_flight          ← T = 2u sinθ / g
  max_height              ← H = u² sin²θ / 2g
  range_formula           ← R = u² sin2θ / g
  up_incline_projectile   ← projectile up an inclined plane
  down_incline_projectile ← projectile down an inclined plane
  two_projectile_meeting
  two_projectile_never_meet

  ── Forces (Ch.8) ──
  field_forces            ← gravitational force, electrostatic force, weight = mg
  contact_forces          ← normal + friction at contact surface, resultant
  normal_reaction         ← N perpendicular to surface, N = mg cosθ on incline
  tension_in_string       ← rope tension, Atwood machine, T = 2m₁m₂g/(m₁+m₂)
  hinge_force             ← pin joint, rod on wall, hinge reaction
  free_body_diagram       ← FBD, isolate body, force diagram
  friction_static_kinetic ← static vs kinetic friction, μₛ vs μₖ, push almirah, slipping threshold

CRITICAL DISAMBIGUATION (current electricity):
- "why does current reduce after resistor?" → ohms_law
- "does current decrease as it flows through a resistor?" → ohms_law
- "is current the same before and after a resistor?" → ohms_law
- "what is V=IR?" → ohms_law
- "how does voltage relate to current?" → ohms_law
- "why does a wire get hot when current flows?" → electric_power_heating (NOT ohms_law)
- "why does the bulb glow?" → electric_power_heating
- "joule heating" / "P = I²R" / "heating effect of current" → electric_power_heating

CRITICAL DISAMBIGUATION (vectors, Ch.5):
- "triangle law" / "parallelogram law" / "resultant of two vectors" → resultant_formula
- "direction of resultant" / "angle of resultant vector" → direction_of_resultant
- "resolve a vector" / "x and y components" → vector_resolution
- "dot product" / "scalar product" → dot_product
- "unit vector" → unit_vector
- "i cap j cap k cap" / "vector in ijk form" → unit_vector_form

CRITICAL DISAMBIGUATION (kinematics, Ch.6-7):
- "distance vs displacement" → distance_displacement_basics
- "equations of motion" / "suvat" → three_cases
- "free fall" → free_fall
- "nth second displacement" → sth_formula
- "v-t graph" → vt_graph
- "s-t graph" / "x-t graph" / "position-time graph" → xt_graph
- "a-t graph" → at_graph

CRITICAL DISAMBIGUATION (relative motion, Ch.6.10-6.13):
- "relative velocity" / "v_AB formula" → vab_formula
- "river crossing" / "boat in river" → upstream_downstream (or shortest_time_crossing / shortest_path_crossing for specific crossing strategy)
- "rain falling" / "rain umbrella" without tilt angle question → apparent_rain_velocity
- "at what angle to tilt umbrella" / "umbrella tilt angle" / "tilt my umbrella" → umbrella_tilt_angle
- "aircraft wind" / "plane flying with wind" → ground_velocity_vector
- "pilot heading" / "plane direction correction" → heading_correction

CRITICAL DISAMBIGUATION (projectiles, Ch.7.6-7.8):
- "range of projectile" → range_formula
- "maximum height" → max_height
- "time of flight" → time_of_flight
- "projectile on incline" (upward) → up_incline_projectile
- "projectile on incline" (downward) → down_incline_projectile
- "two projectiles meeting" → two_projectile_meeting

CRITICAL DISAMBIGUATION (forces, Ch.8):
- "gravitational force" / "weight of object" → field_forces
- "normal force" / "N = mg cosθ" → normal_reaction
- "friction and normal force together" → contact_forces
- "tension in rope" / "Atwood machine" → tension_in_string
- "hinge force on rod" → hinge_force
- "draw FBD" / "free body diagram" / "forces on block" → free_body_diagram
- "static vs kinetic friction" / "μₛ vs μₖ" / "why is it easier to push once moving" / "when does block slip" / "coefficient of friction" → friction_static_kinetic

If the student question matches any of the above concepts, return that exact
concept_id string. Do NOT invent variations (e.g. "ohms_law_basic",
"current_reduction_due_to_resistance", "kvl_single_loop"). Do NOT modify,
hyphenate, or paraphrase these strings. These exact IDs exist in the database —
returning any other string for these topics will cause a pipeline failure.

For questions that do NOT match any of the above, return concept_id: "unknown"
════════════════════════════

Analyze this question and output a JSON fingerprint.

STUDENT QUESTION: "{QUESTION}"
STUDENT CLASS: "{CLASS}"
STUDENT MODE: "{MODE}"

MODE meanings:
- "conceptual" = student wants deep intuition, analogies, visual understanding. No exam pressure.
- "board" = student preparing for CBSE/State boards. Needs NCERT language, marks format.
- "jee" = student preparing for JEE/NEET. Needs tricks, traps, shortcuts, edge cases.

Respond with ONLY a valid JSON object. No markdown code blocks. No explanation.
Start your response with { and end with }

Example output (EXACTLY 6 fields, no more, no less):
{
  "concept_id": "ohms_law",
  "intent": "specific_confusion",
  "class_level": "12",
  "mode": "conceptual",
  "aspect": "none",
  "confidence": 0.9
}

════════════════════════════
RULES FOR concept_id:
════════════════════════════
Must be SPECIFIC sub-concept in snake_case.

GOOD (specific):
  "parallel_plate_capacitor_basic"
  "capacitor_energy_storage"
  "capacitor_charging_rc_circuit"
  "capacitor_discharging_rc_circuit"
  "kvl_single_loop"
  "kvl_multi_loop"
  "resistance_temperature_dependence"
  "wire_resistance_length_area"
  "ohms_law_basic"
  "ohms_law_non_ohmic"

BAD (too vague):
  "capacitor"
  "electricity"
  "circuit"
  "resistance"

Rule: if unsure → add MORE specificity, not less.
"capacitor" → "parallel_plate_capacitor_basic"
"wave" → "transverse_wave_properties"
"lens" → "convex_lens_image_formation"

════════════════════════════
RULES FOR intent:
════════════════════════════
"understand": explain, what is, how does, describe, tell me about, show me, visualize
"derive": derive, prove, show that, step by step derivation, how is formula obtained, mathematical proof
"hypothetical": what if, what happens when, if X increases/decreases, effect of changing, what would happen, suppose X doubles
"compare": difference between, compare, X vs Y, which is better, similarities between
"apply": find, calculate, given values present, numerical problem, a wire of resistance X, any question with specific numbers given
"define": define, what do you mean by, definition of, units of, SI unit, formula for
"specific_confusion": student states a WRONG belief or reports contradictory observation that reveals a specific misconception.
  Use this when: "I thought", "isn't it", "shouldn't", "but why does", "I read that", "my book says", "doesn't that mean",
  "why does X happen" (where X contradicts expected behavior), "how can X if Y", "that can't be right because"
  Examples:
  - "why does current reduce after the resistor?" → specific_confusion (student believes current is consumed)
  - "does current decrease after passing through a resistor?" → specific_confusion
  - "I thought current reduces as it flows past a resistor" → specific_confusion
  - "why does the resistor not use up current?" → specific_confusion
  - "why is current same before and after resistor?" → specific_confusion
  - "doesn't resistance reduce current?" → specific_confusion
  - "how can EMF be greater than terminal voltage?" → specific_confusion
  - "how does a parallel circuit draw more current?" → specific_confusion
  - "shouldn't current be less after the bulb?" → specific_confusion

════════════════════════════
RULES FOR aspect:
════════════════════════════
ONLY for hypothetical intent.
For ALL other intents: always "none"

If hypothetical, identify what is changing:
"if length increases" → "length_increasing"
"if area halves" → "area_decreasing"
"if temperature rises" → "temperature_increasing"
"if voltage doubles" → "voltage_increasing"
"if dielectric inserted" → "dielectric_inserted"
"if dielectric removed" → "dielectric_removed"
"if plates move closer" → "separation_decreasing"
"if plates move apart" → "separation_increasing"
"if length doubles and area halves" → "length_up_area_down"
"if resistance doubles" → "resistance_increasing"
"if frequency increases" → "frequency_increasing"

════════════════════════════
RULES FOR variables_changing:
════════════════════════════
Empty [] for non-hypothetical.
Variable symbols for hypothetical:
["L"] ["A"] ["T"] ["V"] ["d"] ["R"] ["f"]
Multiple: ["L", "A"] ["d", "A"]

════════════════════════════
RULES FOR ncert_chapter:
════════════════════════════
Exact chapter name in lowercase.

Class 12 Physics Part 1:
  "electric charges and fields"
  "electrostatic potential and capacitance"
  "current electricity"
  "moving charges and magnetism"
  "magnetism and matter"
  "electromagnetic induction"
  "alternating current"
  "electromagnetic waves"

Class 12 Physics Part 2:
  "ray optics and optical instruments"
  "wave optics"
  "dual nature of radiation and matter"
  "atoms"
  "nuclei"
  "semiconductor electronics"

Class 11 Physics:
  "physical world"
  "units and measurements"
  "motion in a straight line"
  "motion in a plane"
  "laws of motion"
  "work energy and power"
  "system of particles and rotational motion"
  "gravitation"
  "mechanical properties of solids"
  "mechanical properties of fluids"
  "thermal properties of matter"
  "thermodynamics"
  "kinetic theory"
  "oscillations"
  "waves"

Class 10 Physics:
  "light reflection and refraction"
  "human eye and colourful world"
  "electricity"
  "magnetic effects of electric current"
  "sources of energy"

════════════════════════════
RULES FOR confidence:
════════════════════════════
0.95-1.0: Question is clear and specific
0.70-0.94: Question is somewhat ambiguous
Below 0.70: Too vague, needs clarification
  Examples of low confidence:
  "explain that thing" → 0.3
  "I dont understand" → 0.2
  "help me" → 0.1`;

export async function classifyQuestion(
    question: string,
    classLevel: string,
    mode: string
): Promise<QuestionFingerprint | null> {
    const startTime = Date.now();

    try {
        const promptText = CLASSIFIER_PROMPT
            .replace('{QUESTION}', question)
            .replace('{CLASS}', classLevel || '12')
            .replace('{MODE}', mode || 'conceptual');

        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            prompt: promptText,
            temperature: 0.05,
            maxOutputTokens: 2048,  // raised from 1024 — truncation still occurring
        });

        logUsage({
            taskType: 'intent_classification',
            provider: 'google',
            model: 'gemini-2.5-flash',
            inputChars: promptText.length,
            outputChars: text.length,
            latencyMs: Date.now() - startTime,
            estimatedCostUsd: (promptText.length / 1_000_000 * 0.30) + (text.length / 1_000_000 * 2.50),
            wasCacheHit: false,
        });

        let fp: Omit<QuestionFingerprint, 'cache_key'>;
        const raw = text;
        console.log('[CLASSIFIER RAW]', JSON.stringify(raw).slice(0, 500));

        try {
            // Strip markdown fences if present
            const clean = raw
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            
            // Attempt 1: direct parse
            fp = JSON.parse(clean);

        } catch (e1) {
            try {
                // Attempt 2: extract just the JSON object if there's surrounding text
                const match = raw.match(/\{[\s\S]*\}/);
                if (!match) throw new Error('No JSON object found');
                fp = JSON.parse(match[0]);
                
            } catch (e2) {
                // Attempt 3: truncated JSON — try to close it and parse
                try {
                    const match = raw.match(/\{[\s\S]*/);
                    if (!match) throw new Error('No opening brace found');
                    
                    // Count unclosed braces and close them
                    const partial = match[0];
                    const opens = (partial.match(/\{/g) || []).length;
                    const closes = (partial.match(/\}/g) || []).length;
                    const closed = partial + '}'.repeat(Math.max(0, opens - closes));
                    fp = JSON.parse(closed);
                    
                } catch (e3) {
                    // All attempts failed (likely truncation) — return safe unknown fingerprint.
                    // parse_failed: true tells chat/route to skip MVS + cache entirely.
                    // Do NOT build concept_id from raw question text — that produces invented ids.
                    console.error('[CLASSIFIER] All parse attempts failed (truncated?):', raw.slice(0, 120));
                    return {
                        concept_id: 'unknown',
                        intent: 'understand' as Intent,
                        class_level: classLevel || '12',
                        mode: mode || 'conceptual',
                        aspect: 'none',
                        cache_key: '',   // empty — cache must be skipped
                        confidence: 0,
                        parse_failed: true,
                    };
                }
            }
        }

        let cache_key = [
            fp.concept_id,
            fp.intent,
            fp.class_level,
            fp.mode,
            fp.aspect,
        ].join('|');

        console.log('[CLASSIFIER] base key:', cache_key);
        console.log('[CLASSIFIER] confidence:', fp.confidence);

        return { ...fp, cache_key } as QuestionFingerprint;

    } catch (err) {
        console.error('[CLASSIFIER] error:', err);
        return null;
    }
}

// Run the boot-time drift assertion after CLASSIFIER_PROMPT is fully defined.
// Console-only (no throw) so production boots even if someone forgets the sync
// step — but the warning is loud enough that dev + CI notice on first request.
if (process.env.NODE_ENV !== 'production') {
    assertClassifierPromptInSync();
}
