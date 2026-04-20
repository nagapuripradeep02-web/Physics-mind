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
]);

// Synonyms → canonical IDs. Gemini/Flash often return physicist-common synonyms
// ("normal_force", "tension", "weight") instead of the slug we store. Map them
// before the validity guard so the override can still apply.
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
    kirchhoffs_law: 'kirchhoffs_laws',
    // Legacy parent-bundle redirects (post-split). These IDs remain valid
    // classifier outputs but route to the foundational atomic child of each
    // bundle. See PROGRESS.md 2026-04-18 for the split history.
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

const CLASSIFIER_PROMPT = `You are a physics question analyzer for Indian Class 10-12 students.

════════════════════════════
VALID CONCEPT IDs — you MUST return one of these exactly as written:
════════════════════════════
  ohms_law              ← ONLY use for V=IR relationship, non-ohmic conductors, basic Ohm's Law, current in series circuits, why current is same everywhere
  parallel_resistance
  kirchhoffs_voltage_law
  kirchhoffs_current_law
  wheatstone_bridge
  meter_bridge
  internal_resistance
  electric_power_heating ← use for: power dissipation, Joule heating, why wires/bulbs get hot, heating effect of current, P=I²R, P=V²/R, bulb glows, energy lost as heat

  vector_basics         ← basic vector definition, magnitude, direction
  vector_addition       ← triangle law, parallelogram law, resultant
  vector_components     ← resolution of vectors, x/y components
  scalar_vs_vector      ← scalar vs vector distinction
  dot_product           ← scalar product, A·B = AB cosθ
  distance_vs_displacement ← path length vs displacement
  uniform_acceleration  ← constant acceleration, equations of motion
  non_uniform_acceleration ← variable acceleration, a-t graphs
  motion_graphs         ← s-t, v-t, a-t graph interpretation
  relative_motion       ← relative velocity in 1D and 2D
  river_boat_problems   ← river crossing, drift, minimum time
  rain_umbrella         ← relative velocity of rain
  aircraft_wind_problems ← aircraft heading vs velocity
  projectile_motion     ← parabolic trajectory, range, maximum height
  projectile_inclined   ← projectile on inclined plane
  relative_motion_projectiles ← two projectiles, minimum distance

  field_forces            ← gravitational force, electrostatic force, non-contact forces, weight = mg
  contact_forces          ← normal force, friction at contact surface, contact force resultant
  normal_reaction         ← N perpendicular to surface, N = mg cosθ on incline, reaction force
  tension_in_string       ← string tension, rope tension, Atwood machine, T = 2m₁m₂g/(m₁+m₂)
  hinge_force             ← hinge force, pin joint, rod on wall, hinge reaction
  free_body_diagram       ← FBD, free body diagram, draw forces, isolate body, force diagram

CRITICAL DISAMBIGUATION:
- "why does current reduce after resistor?" → ohms_law
- "does current decrease as it flows through a resistor?" → ohms_law
- "is current the same before and after a resistor?" → ohms_law
- "what is V=IR?" → ohms_law
- "how does voltage relate to current?" → ohms_law
- "why does a wire get hot when current flows?" → electric_power_heating (NOT ohms_law)
- "why does the bulb glow?" → electric_power_heating
- "joule heating" → electric_power_heating
- "heating effect of current" → electric_power_heating
- "power dissipated in resistor" → electric_power_heating
- "P = I²R" → electric_power_heating
- "electric power heating" → electric_power_heating

  CRITICAL DISAMBIGUATION (Ch.5-7 additions):
  - "explain vector addition" → vector_addition
  - "triangle law" → vector_addition
  - "parallelogram law" → vector_addition
  - "resultant of two vectors" → vector_addition
  - "resolve a vector" → vector_components
  - "x and y components" → vector_components
  - "dot product" → dot_product
  - "scalar product" → dot_product
  - "distance vs displacement" → distance_vs_displacement
  - "equations of motion" → uniform_acceleration
  - "suvat" → uniform_acceleration
  - "v-t graph" → motion_graphs
  - "s-t graph" → motion_graphs
  - "relative velocity" → relative_motion
  - "river crossing" → river_boat_problems
  - "rain falling" → rain_umbrella
  - "projectile" → projectile_motion
  - "range of projectile" → projectile_motion
  - "inclined plane projectile" → projectile_inclined
  - "gravitational force" → field_forces
  - "weight of object" → field_forces
  - "normal force" → normal_reaction
  - "N = mg cosθ" → normal_reaction
  - "friction and normal force together" → contact_forces
  - "tension in rope" → tension_in_string
  - "Atwood machine" → tension_in_string
  - "hinge force on rod" → hinge_force
  - "draw FBD" → free_body_diagram
  - "free body diagram" → free_body_diagram
  - "forces on block" → free_body_diagram

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
