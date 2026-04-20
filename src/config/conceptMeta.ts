// =============================================================================
// conceptMeta.ts
// Lightweight display-metadata lookup for concept_id → { title, chapter, class,
// realWorldAnchor }. Used by the header and the worked-example banner.
// Intentionally separate from panelConfig (layout/renderer) so UI chrome
// doesn't depend on rendering internals.
// =============================================================================

export interface ConceptMeta {
    title: string;
    chapter: string;
    classLevel: "10" | "11" | "12";
    realWorldAnchor?: string;
}

const CH8_FORCES: Record<string, ConceptMeta> = {
    normal_reaction: {
        title: "Normal Reaction",
        chapter: "Laws of Motion",
        classLevel: "11",
        realWorldAnchor: "You standing on the classroom floor",
    },
    contact_forces: {
        title: "Contact Forces",
        chapter: "Laws of Motion",
        classLevel: "11",
    },
    field_forces: {
        title: "Field Forces",
        chapter: "Laws of Motion",
        classLevel: "11",
    },
    free_body_diagram: {
        title: "Free Body Diagram",
        chapter: "Laws of Motion",
        classLevel: "11",
    },
    tension_in_string: {
        title: "Tension in a String",
        chapter: "Laws of Motion",
        classLevel: "11",
    },
    hinge_force: {
        title: "Hinge Force",
        chapter: "Laws of Motion",
        classLevel: "11",
    },
};

const CURRENT_ELECTRICITY: Record<string, ConceptMeta> = {
    ohms_law: { title: "Ohm's Law", chapter: "Current Electricity", classLevel: "12" },
    drift_velocity: { title: "Drift Velocity", chapter: "Current Electricity", classLevel: "12" },
    resistivity: { title: "Resistivity", chapter: "Current Electricity", classLevel: "12" },
    resistance: { title: "Resistance", chapter: "Current Electricity", classLevel: "12" },
    kirchhoffs_laws: { title: "Kirchhoff's Laws", chapter: "Current Electricity", classLevel: "12" },
    kirchhoffs_voltage_law: { title: "Kirchhoff's Voltage Law", chapter: "Current Electricity", classLevel: "12" },
    kirchhoffs_current_law: { title: "Kirchhoff's Current Law", chapter: "Current Electricity", classLevel: "12" },
    parallel_resistance: { title: "Resistors in Parallel", chapter: "Current Electricity", classLevel: "12" },
    series_resistance: { title: "Resistors in Series", chapter: "Current Electricity", classLevel: "12" },
    wheatstone_bridge: { title: "Wheatstone Bridge", chapter: "Current Electricity", classLevel: "12" },
    meter_bridge: { title: "Meter Bridge", chapter: "Current Electricity", classLevel: "12" },
    internal_resistance: { title: "Internal Resistance of a Cell", chapter: "Current Electricity", classLevel: "12" },
    electric_power_heating: { title: "Electric Power & Joule Heating", chapter: "Current Electricity", classLevel: "12" },
    potentiometer: { title: "Potentiometer", chapter: "Current Electricity", classLevel: "12" },
    temperature_dependence_of_resistance: { title: "Temperature Dependence of Resistance", chapter: "Current Electricity", classLevel: "12" },
    resistance_temperature_dependence: { title: "Temperature Dependence of Resistance", chapter: "Current Electricity", classLevel: "12" },
};

export const CONCEPT_META: Record<string, ConceptMeta> = {
    ...CH8_FORCES,
    ...CURRENT_ELECTRICITY,
};

export function getConceptMeta(conceptId: string | null | undefined): ConceptMeta | null {
    if (!conceptId) return null;
    if (CONCEPT_META[conceptId]) return CONCEPT_META[conceptId];
    for (const key of Object.keys(CONCEPT_META)) {
        if (conceptId.includes(key)) return CONCEPT_META[key];
    }
    return null;
}

export function prettifyConceptId(conceptId: string): string {
    return conceptId
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
}
