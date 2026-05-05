"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { StudentProfile, ConceptEntry, AppMode, ExamMode, ClassLevel } from '@/types/student';
import { classToLevel } from '@/types/student';
import {
    getProfile, saveProfile,
    getConcepts, saveConcept, updateConceptStatus as updateConceptStatusLib,
    getModuleProgress, saveModuleProgress
} from '@/lib/profile';

function migrateClassLevels(profile: StudentProfile): StudentProfile {
    if (profile.class_levels && profile.class_levels.length > 0) return profile;
    const derived: ClassLevel[] = [classToLevel(profile.class)];
    return { ...profile, class_levels: derived };
}

interface ProfileContextValue {
    profile: StudentProfile | null;
    loading: boolean;
    saveProfileData: (p: StudentProfile) => Promise<void>;
    concepts: ConceptEntry[];
    addConcept: (c: ConceptEntry) => Promise<void>;
    markConceptUnderstood: (id: string) => Promise<void>;
    markConceptNeedsReview: (id: string) => Promise<void>;
    moduleProgress: Record<number, number>;
    updateModuleScore: (moduleId: number, score: number) => Promise<void>;
    appMode: AppMode;
    setAppMode: (m: AppMode) => void;
    examMode: ExamMode;
    setExamMode: (m: ExamMode) => void;
    currentModule: number;
    setCurrentModule: (id: number) => void;
    sessionConceptIds: Set<string>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [concepts, setConcepts] = useState<ConceptEntry[]>([]);
    const [moduleProgress, setModuleProgressState] = useState<Record<number, number>>({});
    const [appMode, setAppMode] = useState<AppMode>('learn');
    const [examMode, setExamMode] = useState<ExamMode>('JEE');
    const [currentModule, setCurrentModule] = useState(1);
    const [sessionConceptIds, setSessionConceptIds] = useState<Set<string>>(new Set());

    // Load all data from Supabase on mount
    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            const [p, c, mp] = await Promise.all([
                getProfile(),
                getConcepts(),
                getModuleProgress(),
            ]);
            if (cancelled) return;
            const migrated = p ? migrateClassLevels(p) : null;
            setProfile(migrated);
            if (migrated && p && (!p.class_levels || p.class_levels.length === 0)) {
                // Persist the back-fill so future loads skip the shim
                void saveProfile(migrated);
            }
            setConcepts(c);
            setModuleProgressState(mp ?? {});
            if (migrated?.goal === 'Board Exam') setExamMode('CBSE');
            else if (migrated?.goal === 'JEE') setExamMode('JEE');
            setLoading(false);
        }
        load();
        return () => { cancelled = true; };
    }, []);

    const saveProfileData = useCallback(async (p: StudentProfile) => {
        await saveProfile(p);
        setProfile(p);
        if (p.goal === 'Board Exam') setExamMode('CBSE');
        else if (p.goal === 'JEE') setExamMode('JEE');
    }, []);

    const addConcept = useCallback(async (c: ConceptEntry) => {
        await saveConcept(c);
        setConcepts(prev => {
            const filtered = prev.filter(x => x.id !== c.id);
            return [...filtered, c];
        });
        setSessionConceptIds(prev => new Set([...prev, c.id]));
    }, []);

    const markConceptUnderstood = useCallback(async (id: string) => {
        await updateConceptStatusLib(id, 'understood');
        setConcepts(prev => prev.map(c => c.id === id ? { ...c, status: 'understood' } : c));
    }, []);

    const markConceptNeedsReview = useCallback(async (id: string) => {
        await updateConceptStatusLib(id, 'needs_review');
        setConcepts(prev => prev.map(c => c.id === id ? { ...c, status: 'needs_review' } : c));
    }, []);

    const updateModuleScore = useCallback(async (moduleId: number, score: number) => {
        const newScore = Math.max(0, Math.min(100, score));
        const best = Math.max(moduleProgress[moduleId] ?? 0, newScore);
        await saveModuleProgress(moduleId, best);
        setModuleProgressState(prev => ({ ...prev, [moduleId]: best }));
    }, [moduleProgress]);

    return (
        <ProfileContext.Provider value={{
            profile, loading, saveProfileData,
            concepts, addConcept, markConceptUnderstood, markConceptNeedsReview,
            moduleProgress, updateModuleScore,
            appMode, setAppMode,
            examMode, setExamMode,
            currentModule, setCurrentModule,
            sessionConceptIds,
        }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
    return ctx;
}
