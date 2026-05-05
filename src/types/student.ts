export type StudentClass = 'Class 10' | 'Class 11' | 'Class 12';
export type ClassLevel = 10 | 11 | 12;
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
