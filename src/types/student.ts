export type StudentClass = 'Class 10' | 'Class 11' | 'Class 12';
export type ClassLevel = 10 | 11 | 12;
// Subject is the second curriculum dimension alongside ClassLevel (added 2026-07-23,
// CHEMISTRY_BUILD_PLAN.md Phase 1; 'mathematics' added 2026-08-04, MATHEMATICS_BUILD_PLAN.md
// Phase 1). Defined here — the client-safe types module — so both server (conceptCatalog) and
// client ("use client" pages) can import it without pulling in the `server-only` catalog module.
// Catalog routing defaults to 'physics' everywhere.
//
// The value is the full word 'mathematics', not 'math' — it matches the shipped
// pyq_questions.subject CHECK constraint and src/lib/pyqSearch.ts, and this repo already
// carries enough naming traps (renderer_pair.panel_a "mechanics_2d" not meaning
// mechanics_2d_renderer.ts; the renderer_primitives -> pcpl_surgeon rename that left its DB
// tag behind) without adding a math/mathematics split.
export type Subject = 'physics' | 'chemistry' | 'mathematics';
export type StudentBoard = 'CBSE' | 'Telangana Board' | 'AP Board' | 'Maharashtra Board' | 'Other State Board';
export type StudentGoal = 'Board Exam' | 'JEE' | 'NEET' | 'Just Learning';
export type AppMode = 'learn' | 'practice';
export type ExamMode = 'JEE' | 'CBSE';

export interface StudentProfile {
    name: string;
    class: StudentClass;
    class_levels?: ClassLevel[];
    board: StudentBoard;
    goal: StudentGoal;
    firstTopic: string;
    onboardingComplete: boolean;
}

const CLASS_TO_LEVEL: Record<StudentClass, ClassLevel> = {
    'Class 10': 10,
    'Class 11': 11,
    'Class 12': 12,
};

const LEVEL_TO_CLASS: Record<ClassLevel, StudentClass> = {
    10: 'Class 10',
    11: 'Class 11',
    12: 'Class 12',
};

export function classToLevel(c: StudentClass): ClassLevel {
    return CLASS_TO_LEVEL[c];
}

export function levelToClass(l: ClassLevel): StudentClass {
    return LEVEL_TO_CLASS[l];
}

export function resolveClassLevels(profile: StudentProfile): ClassLevel[] {
    if (profile.class_levels && profile.class_levels.length > 0) {
        return profile.class_levels;
    }
    return [classToLevel(profile.class)];
}

export interface ModuleData {
    id: number;
    title: string;
    description: string;
    animationType: 'electrons' | 'kcl' | 'voltage' | 'none';
}

export interface ConceptEntry {
    id: string;
    name: string;
    conceptClass: string;
    subject: string;
    status: 'understood' | 'needs_review';
    timestamp: number;
}
