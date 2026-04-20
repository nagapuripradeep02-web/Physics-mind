export type StudentClass = 'Class 10' | 'Class 11' | 'Class 12';
export type StudentBoard = 'CBSE' | 'Telangana Board' | 'AP Board' | 'Maharashtra Board' | 'Other State Board';
export type StudentGoal = 'Board Exam' | 'JEE' | 'NEET' | 'Just Learning';
export type AppMode = 'learn' | 'practice';
export type ExamMode = 'JEE' | 'CBSE';

export interface StudentProfile {
    name: string;
    class: StudentClass;
    board: StudentBoard;
    goal: StudentGoal;
    firstTopic: string;
    onboardingComplete: boolean;
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
