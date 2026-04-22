"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Camera, Paperclip, X, Zap, RefreshCw } from "lucide-react";
import { MessageRenderer } from "@/components/MessageRenderer";
import ConceptSidebar from "@/components/ConceptSidebar";
import TeacherPlayer from "@/components/TeacherPlayer";
import { AISimulationRenderer } from "@/components/AISimulationRenderer";
import DualPanelSimulation from "@/components/DualPanelSimulation";
import { getPanelConfig } from "@/config/panelConfig";
import ResponseActionBar from "@/components/ResponseActionBar";
import NCERTSourcesWidget from "@/components/NCERTSourcesWidget";
import ConfidenceMeter from "@/components/ConfidenceMeter";
import ImageAnnotator, { type AnnotationBounds } from "@/components/ImageAnnotator";
import MisconceptionVerifyCard from "@/components/MisconceptionVerifyCard";
import { SimulationSwitcher } from "@/components/SimulationSwitcher";
import DeepDiveModal from "@/components/DeepDiveModal";
import { usesInlineDeepDive } from "@/config/inlineDeepDiveConcepts";
import type { DeepDiveSubState } from "@/components/TeacherPlayer";
import DrillDownWidget from "@/components/DrillDownWidget";
import { type TeachingMode } from "@/components/TeachingModeToggle";
import { getConceptMeta } from "@/config/conceptMeta";
import { type ChatMode, type Chat, type ChatMessage, useChats } from "@/contexts/ChatContext";
import { useProfile } from "@/contexts/ProfileContext";
import type { NCERTSource, Lesson } from "@/lib/teacherEngine";
import type { TeacherScriptStep } from "@/lib/aiSimulationGenerator";

// Local types not exported from context
interface ConceptualMessage extends ChatMessage {
    isMvsResponse?: boolean;
    onDemandSimLabel?: string | null;
}
type ConceptualChat = Chat;
interface Concept { name: string; conceptClass: string; subject: string; }

interface Props {
    onGoToCompetitive: (exam?: string, keywords?: string[]) => void;
    /**
     * Learning section this tab represents. Controls the `section`/`mode`/
     * `examMode` params sent to /api/chat and /api/generate-simulation.
     * Default is 'conceptual' (LearnConceptTab in the Conceptual sidebar
     * section). Pass 'board' from BoardExamTab — the rest of the UI stays
     * the same, but the sim pipeline switches to answer-sheet rendering.
     */
    section?: 'conceptual' | 'board' | 'competitive';
}

export default function LearnConceptTab({ onGoToCompetitive, section = 'conceptual' }: Props) {
    const { examMode, profile } = useProfile();
    const { activeConceptualId, activeConceptualChat, getConceptualMessages, saveConceptualMessages, createConceptualChat } = useChats();
    // Use context messages as source of truth — always in sync across sidebar switches
    const contextMessages = activeConceptualId ? getConceptualMessages(activeConceptualId) as ConceptualMessage[] : [];
    const [streamingMessages, setStreamingMessages] = useState<ConceptualMessage[] | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<ChatMode>("both");
    // Teaching mode is seeded from the `section` prop (which sidebar surface
    // the student is on), but stateful so the in-panel TeachingModeToggle
    // can override it per chat — Conceptual / Board / JEE-NEET.
    const [teachingMode, setTeachingMode] = useState<TeachingMode>(section as TeachingMode);
    useEffect(() => { setTeachingMode(section as TeachingMode); }, [section]);
    // Phase F: deep-dive modal — open when TeacherPlayer's Explain button fires.
    // Used ONLY for concepts NOT in INLINE_DEEP_DIVE_CONCEPTS. Flagged concepts
    // use the inline sub-pill path below (deepDiveSubStates / activeDeepDiveParent).
    const [deepDiveState, setDeepDiveState] = useState<string | null>(null);
    // Inline deep-dive UX (Phase D/F — flag-gated). Populated by fetching
    // /api/deep-dive when the student clicks "Explain step-by-step" on a
    // concept whose id is in INLINE_DEEP_DIVE_CONCEPTS. Rendered by
    // TeacherPlayer as inline sub-pills (3a, 3b, 3c, 3d).
    const [deepDiveSubStates, setDeepDiveSubStates] = useState<DeepDiveSubState[] | null>(null);
    const [activeDeepDiveParent, setActiveDeepDiveParent] = useState<string | null>(null);
    const [activeDeepDiveIdx, setActiveDeepDiveIdx] = useState<number | null>(null);
    const [deepDiveStatus, setDeepDiveStatus] = useState<'pending_review' | 'served' | 'fresh' | null>(null);
    const [deepDiveCacheId, setDeepDiveCacheId] = useState<string | null>(null);
    const [deepDiveLoading, setDeepDiveLoading] = useState(false);
    const [skeletonTimer, setSkeletonTimer] = useState(false);
    const [attachments, setAttachments] = useState<string[]>([]);
    const [keywordCounts, setKeywordCounts] = useState<Record<string, number>>({});
    const [revisionCard, setRevisionCard] = useState<string | null>(null);
    const [generatingRevision, setGeneratingRevision] = useState(false);
    const [activeConcept, setActiveConcept] = useState<Concept | null>(null);
    const [mvsData, setMvsData] = useState<{
        misconception: any;
        fingerprint: any;
        originalQuestion: string;
    } | null>(null);
    const [lessons, setLessons] = useState<Map<string, Lesson>>(new Map());
    const [lessonLoading, setLessonLoading] = useState(false);
    const [aiPhysicsConfigs, setAiPhysicsConfigs] = useState<Map<string, unknown>>(new Map());
    const [aiSimHtmls, setAiSimHtmls] = useState<Map<string, string>>(new Map());
    const [aiSecondarySimHtmls, setAiSecondarySimHtmls] = useState<Map<string, string | null>>(new Map());
    const [aiConceptIds, setAiConceptIds] = useState<Map<string, string>>(new Map());
    const [aiTeacherScripts, setAiTeacherScripts] = useState<Map<string, TeacherScriptStep[]>>(new Map());
    // State IDs with allow_deep_dive:true, per message key. Populated from the
    // sim-API response; gates the "Explain" button in TeacherPlayer.
    const [allowDeepDiveMap, setAllowDeepDiveMap] = useState<Map<string, string[]>>(new Map());
    const [isLoadingSim, setIsLoadingSim] = useState(false);
    const [multiPanelData, setMultiPanelData] = useState<Map<string, {
        panelAHtml: string;
        panelBHtml: string;
        primaryPanel: 'panel_a' | 'panel_b';
        syncRequired: boolean;
        sharedStates: string[];
    }>>(new Map());
    const [ncertSourcesMap, setNcertSourcesMap] = useState<Map<string, NCERTSource[]>>(new Map());
    const [lastStudentBelief, setLastStudentBelief] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<{
        base64: string;
        mediaType: string;
        preview: string;
    } | null>(null);
    const [annotationBounds, setAnnotationBounds] = useState<AnnotationBounds | null>(null);

    // Secondary panel collapse state — student can hide the graph for focus.
    // Default: expanded only when we have secondary HTML. Persisted in
    // localStorage so the choice survives refresh.
    const [secondaryCollapsed, setSecondaryCollapsed] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("pm_secondary_collapsed") === "true";
    });
    useEffect(() => {
        if (typeof window === "undefined") return;
        localStorage.setItem("pm_secondary_collapsed", String(secondaryCollapsed));
    }, [secondaryCollapsed]);

    // Variant switcher state
    type JsonVariant = {
        variant_id: string;
        approach_pill_label: string;
        entry_state: string;
        state_sequence: string[];
    };
    const [cachedVariantsMap, setCachedVariantsMap] = useState<Map<string, Array<{config: Record<string,unknown>, variant_index: number, entry_state: string, approach: string}>>>(new Map());
    const [jsonVariantsMap, setJsonVariantsMap] = useState<Map<string, JsonVariant[]>>(new Map());
    const [fingerprintKeyMap, setFingerprintKeyMap] = useState<Map<string, string>>(new Map());
    const [originalSimHtmlMap, setOriginalSimHtmlMap] = useState<Map<string, string>>(new Map());
    const [variantGenerating, setVariantGenerating] = useState(false);
    const [variantExhausted, setVariantExhausted] = useState(false);
    const [activeVariantEntryState, setActiveVariantEntryState] = useState<string | null>(null);
    const [activeStateSequence, setActiveStateSequence] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const simIframeRef = useRef<HTMLIFrameElement | null>(null);
    const secondarySimIframeRef = useRef<HTMLIFrameElement | null>(null);
    const generatedLessonsRef = useRef<Set<string>>(new Set());

    const lastSentImageRef = useRef<{ base64: string; mediaType: string } | null>(null);
    const lastFingerprintKeyRef = useRef<string | null>(null);
    const isSubmittingRef = useRef(false);
    // Tracks the latest slider values from either panel (Panel A PCPL sliders or
    // Panel B graph sliders). Updated whenever a PARAM_UPDATE bubbles up from
    // DualPanelSimulation so we can restore these values when a deep-dive ends.
    const userParamsRef = useRef<Record<string, number>>({});
    // Snapshot of userParamsRef taken at the moment the student opens a
    // deep-dive. Used by handleDeepDiveExit to rewind Panel B's yellow dot to
    // the user's chosen θ/m before the deep-dive overrode it.
    const paramSnapshotRef = useRef<Record<string, number> | null>(null);

    // SIM_ERROR: capture iframe crash messages so blank sims surface an error
    const [simError, setSimError] = useState<string | null>(null);
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (e.data?.type === 'SIM_ERROR') {
                const msg = `${e.data.error ?? 'Unknown error'} (${e.data.source ?? '?'}:${e.data.line ?? '?'})`;
                console.error('[SIM_ERROR from iframe]', msg);
                setSimError(msg);
            }
            // Snapshot user slider values as they change — used to restore Panel B
            // to the student's θ/m when a deep-dive exits (F1 fix).
            if (e.data?.type === 'PARAM_UPDATE' && typeof e.data.key === 'string') {
                const v = parseFloat(e.data.value);
                if (Number.isFinite(v)) {
                    userParamsRef.current = { ...userParamsRef.current, [e.data.key]: v };
                }
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    // -- Draggable panel state --
    // Horizontal divider: left chat width as % of viewport (0 = hidden, 70 = max)
    const [leftWidth, setLeftWidth] = useState(45);
    // Vertical divider: Section A (TeacherPlayer: pill row + TTS text + thumbs)
    // height in px. Default 160 gives comfortable room for 3 lines of script
    // text + pills + thumbs, much bigger than the old 76px which clipped
    // everything to the pill row.
    const [sectionAHeight, setSectionAHeight] = useState(160);

    const isDraggingH = useRef(false);
    const isDraggingV = useRef(false);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    // Track ANY drag in progress as React state — used to suppress iframe pointer events
    const [anyDragging, setAnyDragging] = useState(false);

    const onMouseDownH = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDraggingH.current = true;
        setAnyDragging(true);
    }, []);

    const onMouseDownV = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDraggingV.current = true;
        setAnyDragging(true);
    }, []);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (isDraggingH.current) {
                const pct = (e.clientX / window.innerWidth) * 100;
                setLeftWidth(Math.max(20, Math.min(70, pct)));
            } else if (isDraggingV.current && rightPanelRef.current) {
                const rect = rightPanelRef.current.getBoundingClientRect();
                const next = e.clientY - rect.top;
                // 76px min (pill row only) .. 60% of right panel height max
                setSectionAHeight(Math.max(76, Math.min(rect.height * 0.6, next)));
            }
        };
        const onUp = () => {
            if (isDraggingH.current || isDraggingV.current) {
                isDraggingH.current = false;
                isDraggingV.current = false;
                setAnyDragging(false);
            }
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        // Safety: also release on mouseleave from document
        document.addEventListener('mouseleave', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            document.removeEventListener('mouseleave', onUp);
        };
    }, []);

    /* On chat switch: clear only LOCAL transient UI (streaming, lesson, sim) */
    useEffect(() => {
        setStreamingMessages(null);
        setSkeletonTimer(false);
        setKeywordCounts({});
        setRevisionCard(null);
        setMvsData(null);

        setLessons(new Map());
        setLessonLoading(false);
        setAiPhysicsConfigs(new Map());
        setAiSimHtmls(new Map());
        setMultiPanelData(new Map());
        setIsLoadingSim(false);
        setNcertSourcesMap(new Map());
        generatedLessonsRef.current = new Set();
        setCachedVariantsMap(new Map());
        setFingerprintKeyMap(new Map());
        setOriginalSimHtmlMap(new Map());
        setVariantExhausted(false);
        setActiveVariantEntryState(null);

        if (!activeConceptualId) return;
        setSkeletonTimer(true);
        const timeout = setTimeout(() => setSkeletonTimer(false), 600);
        setMode(activeConceptualChat?.mode ?? "both");
        return () => clearTimeout(timeout);
    }, [activeConceptualId]);

    /* Scroll to bottom on new messages */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [streamingMessages, contextMessages]);




    const displayMessages = streamingMessages ?? contextMessages;
    const exchangeCount = Math.floor(displayMessages.filter((m: ConceptualMessage | { role: string }) => m.role === "user").length);

    // Derive the last assistant message key for lesson lookup
    const lastAsstMsg = [...displayMessages].reverse().find(m => m.role === "assistant");
    const lastKey = lastAsstMsg ? `${lastAsstMsg.role}-${lastAsstMsg.timestamp}` : null;
    const currentLesson = lastKey ? lessons.get(lastKey) ?? null : null;
    const currentSimHtml = lastKey ? aiSimHtmls.get(lastKey) ?? null : null;
    const currentSecondarySimHtml = lastKey ? aiSecondarySimHtmls.get(lastKey) ?? null : null;
    const currentConceptId = lastKey ? aiConceptIds.get(lastKey) ?? undefined : undefined;
    const currentTeacherScript = lastKey ? aiTeacherScripts.get(lastKey) ?? null : null;
    const currentMultiPanel = lastKey ? multiPanelData.get(lastKey) ?? null : null;
    const currentCachedVariants = lastKey ? cachedVariantsMap.get(lastKey) ?? [] : [];
    const currentJsonVariants = lastKey ? jsonVariantsMap.get(lastKey) ?? null : null;
    const currentFingerprintKey = lastKey ? fingerprintKeyMap.get(lastKey) ?? null : null;
    const currentAllowedDeepDiveStates = lastKey ? allowDeepDiveMap.get(lastKey) ?? null : null;

    // ── Inline deep-dive handlers ────────────────────────────────────────
    // Trigger: student clicks "Explain step-by-step" on a concept in the
    // INLINE_DEEP_DIVE_CONCEPTS allowlist. We fetch /api/deep-dive, parse
    // the flat script into per-sub-state text, and hand the array to
    // TeacherPlayer which renders the inline sub-pills + sub-state text.
    const handleInlineDeepDive = async (conceptId: string, stateId: string) => {
        setDeepDiveLoading(true);
        // Snapshot current user params BEFORE the deep-dive overrides them, so
        // handleDeepDiveExit can rewind Panel B to the student's chosen θ/m.
        paramSnapshotRef.current = { ...userParamsRef.current };
        try {
            const res = await fetch('/api/deep-dive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concept_id: conceptId,
                    state_id: stateId,
                    class_level: typeof profile?.class === 'string' ? profile.class : '11',
                    mode: teachingMode,
                    session_id: activeConceptualId ?? undefined,
                }),
            });
            if (!res.ok) {
                console.error('[deep-dive] fetch failed:', res.status, await res.text());
                return;
            }
            const data = await res.json();
            const subStatesObj = (data?.sub_states ?? {}) as Record<string, { scene_composition?: unknown[]; variables?: Record<string, number>; example_anchor?: string; teacher_script?: { tts_sentences?: Array<{ text_en?: string; duration_ms?: number }> } }>;
            const flatScript = Array.isArray(data?.teacher_script_flat) ? data.teacher_script_flat as Array<{ id: string; text: string }> : [];

            // Group flat script lines by sub-state prefix (e.g., STATE_3_DD1_s1).
            // Match SubSimPlayer.tsx:44-48's regex pattern: "<STATE_KEY>_s<N>".
            const scriptBySubState = new Map<string, string[]>();
            for (const entry of flatScript) {
                const match = entry.id.match(/^(.+?)_s\d+$/);
                const subKey = match ? match[1] : entry.id;
                if (!scriptBySubState.has(subKey)) scriptBySubState.set(subKey, []);
                scriptBySubState.get(subKey)!.push(entry.text);
            }

            // Build DeepDiveSubState[] in the order sub_states keys appear.
            const letters = 'abcdefghijklmnop';
            const parentMatch = stateId.match(/STATE_(\d+)/);
            const parentNum = parentMatch ? parentMatch[1] : '?';
            const subStates: DeepDiveSubState[] = Object.entries(subStatesObj).map(([key, val], idx) => {
                const lines = scriptBySubState.get(key) ?? [];
                return {
                    sub_state_id: key,
                    parent_state_id: stateId,
                    label: `${parentNum}${letters[idx] ?? idx + 1}`,
                    scene_composition: Array.isArray(val?.scene_composition) ? val.scene_composition : [],
                    teacher_text: lines.join(' '),
                    variables: val?.variables,
                    example_anchor: typeof val?.example_anchor === 'string' ? val.example_anchor : undefined,
                };
            });

            if (subStates.length === 0) {
                console.warn('[deep-dive] parsed 0 sub-states; falling back to modal');
                setDeepDiveState(stateId);
                return;
            }

            setDeepDiveSubStates(subStates);
            setActiveDeepDiveParent(stateId);
            setActiveDeepDiveIdx(0);
            setDeepDiveStatus((data?.status as typeof deepDiveStatus) ?? null);
            setDeepDiveCacheId(typeof data?.id === 'string' ? data.id : null);

            // Fire SET_STATE for the first sub-pill immediately so the student
            // sees the sub-scene as soon as the sub-pills appear.
            const first = subStates[0];
            simIframeRef.current?.contentWindow?.postMessage({
                type: 'SET_STATE',
                state: first.sub_state_id,
                inline_scene_composition: first.scene_composition,
                inline_variables: first.variables,
            }, '*');
            secondarySimIframeRef.current?.contentWindow?.postMessage({
                type: 'SET_STATE',
                state: first.sub_state_id,
                inline_scene_composition: first.scene_composition,
                inline_variables: first.variables,
            }, '*');

            // F1: sync Panel B's yellow dot to the deep-dive scenario's θ/m.
            // Sub-state `variables` wins; fall back to the concept's default_variables.
            const scenarioVars = (first.variables && Object.keys(first.variables).length > 0)
                ? first.variables
                : (data?.default_variables as Record<string, number> | undefined) ?? {};
            for (const [k, v] of Object.entries(scenarioVars)) {
                if (typeof v !== 'number') continue;
                const msg = { type: 'PARAM_UPDATE', key: k, value: v };
                simIframeRef.current?.contentWindow?.postMessage(msg, '*');
                secondarySimIframeRef.current?.contentWindow?.postMessage(msg, '*');
            }
        } catch (err) {
            console.error('[deep-dive] exception:', err);
        } finally {
            setDeepDiveLoading(false);
        }
    };

    const handleDeepDiveExit = () => {
        // Return Panel A to the parent state. Parent state's scene_composition
        // is untouched in PM_config.states (sub-states used unique ids).
        const parent = activeDeepDiveParent;
        setDeepDiveSubStates(null);
        setActiveDeepDiveParent(null);
        setActiveDeepDiveIdx(null);
        setDeepDiveStatus(null);
        setDeepDiveCacheId(null);
        if (parent) {
            simIframeRef.current?.contentWindow?.postMessage({ type: 'SET_STATE', state: parent }, '*');
            secondarySimIframeRef.current?.contentWindow?.postMessage({ type: 'SET_STATE', state: parent }, '*');
        }
        // F1: restore Panel B's yellow dot to the user's pre-deep-dive θ/m.
        const snapshot = paramSnapshotRef.current;
        if (snapshot) {
            for (const [k, v] of Object.entries(snapshot)) {
                if (typeof v !== 'number') continue;
                const msg = { type: 'PARAM_UPDATE', key: k, value: v };
                simIframeRef.current?.contentWindow?.postMessage(msg, '*');
                secondarySimIframeRef.current?.contentWindow?.postMessage(msg, '*');
            }
            paramSnapshotRef.current = null;
        }
    };

    const handleSubStateClick = (idx: number) => {
        setActiveDeepDiveIdx(idx);
    };

    // Derive panel layout from concept_id (try/catch — falls back to single)
    let currentPanelLayout: 'single' | 'dual_horizontal' | 'dual_vertical' = 'single';
    if (currentConceptId) {
        try { const pc = getPanelConfig(currentConceptId); if (pc) currentPanelLayout = pc.layout; } catch { /* not in map */ }
    }

    function triggerLessonGeneration(allMessages: ConceptualMessage[], mvsContext?: string, studentConfusionData?: any, panelConfig?: any, forceRegenerate?: boolean, scope?: string, examMode?: string, conceptId?: string) {
        const lastAsst = [...allMessages].reverse().find(m => m.role === "assistant");
        const lastUser = [...allMessages].reverse().find(m => m.role === "user");
        console.log('[triggerLesson] entry — allMessages:', allMessages.length, '| lastAsst:', lastAsst?.role ?? 'MISSING', '| lastUser:', lastUser?.role ?? 'MISSING');
        if (!lastAsst || !lastUser) {
            console.warn('[triggerLesson] EARLY EXIT — missing lastAsst or lastUser');
            return;
        }

        const key = `${lastAsst.role}-${lastAsst.timestamp}`;
        console.log('[triggerLesson] key:', key, '| already generated:', generatedLessonsRef.current.has(key));
        if (generatedLessonsRef.current.has(key)) {
            console.warn('[triggerLesson] EARLY EXIT — key already in generatedLessonsRef (dedup guard)');
            return;
        }
        generatedLessonsRef.current.add(key);

        const fpKey = lastFingerprintKeyRef.current;
        const classLevel = (profile?.class as string | undefined)?.replace("Class ", "") ?? "12";

        setLessonLoading(true);
        setIsLoadingSim(true);
        setSimError(null);
        setVariantExhausted(false);
        setActiveVariantEntryState(null);

        // ── Lesson (~2-3s) — updates TeacherPlayer script immediately ─────────
        void fetch("/api/generate-lesson", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question: lastUser.content,
                answer: lastAsst.content,
                chatId: activeConceptualId,
                fingerprintKey: fpKey,
                image: lastSentImageRef.current,
                mvsContext,
            }),
        }).then(async r => {
            if (!r.ok) throw new Error(`Lesson API ${r.status}`);
            const data = await r.json();
            if (data.lesson) setLessons(prev => new Map(prev).set(key, data.lesson));
        }).catch(err => {
            console.error("[triggerLesson] lesson failed:", err);
        }).finally(() => {
            setLessonLoading(false);
        });

        // ── Simulation (~25-35s) — fires in parallel, updates when ready ──────
        void fetch("/api/generate-simulation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                concept: conceptId || lastUser.content,
                question: lastUser.content,
                classLevel,
                fingerprintKey: fpKey,
                mode: teachingMode,
                mvsContext,
                studentConfusionData,
                panelConfig: panelConfig ?? null,
                forceRegenerate: forceRegenerate ?? false,
                scope: scope ?? 'local',
                examMode: teachingMode,
            }),
        }).then(async r => {
            if (!r.ok) throw new Error(`Sim API ${r.status}`);
            const data = await r.json();
            console.log('[triggerLesson] Sim API response received:', { key, dataKeys: Object.keys(data), simHtmlLen: data.simHtml?.length ?? 0, hasSimHtml: !!data.simHtml, conceptId: data.conceptId, type: data.type });

            // ── Multi-panel response (Phase 6) ──────────────────────
            if (data.type === 'multi_panel') {
                const panelA = data.panel_a as Record<string, unknown>;
                const panelB = data.panel_b as Record<string, unknown>;
                const panelAHtml = (panelA?.simHtml ?? panelA?.sim_html ?? '') as string;
                const panelBHtml = (panelB?.simHtml ?? panelB?.sim_html ?? '') as string;

                if (panelAHtml && panelBHtml) {
                    setMultiPanelData(prev => new Map(prev).set(key, {
                        panelAHtml,
                        panelBHtml,
                        primaryPanel: data.primary_panel ?? 'panel_a',
                        syncRequired: data.sync_required ?? true,
                        sharedStates: data.shared_states ?? ['STATE_1', 'STATE_2', 'STATE_3', 'STATE_4'],
                    }));
                    console.log('[triggerLesson] multi_panel stored for key:', key);
                } else {
                    console.warn('[triggerLesson] multi_panel missing simHtml — falling back');
                }
                const resolvedConceptIdMulti = data.conceptId
                    ?? (typeof data.fingerprintKey === 'string' ? data.fingerprintKey.split('|')[0] : null);
                if (resolvedConceptIdMulti) setAiConceptIds(prev => new Map(prev).set(key, resolvedConceptIdMulti));
                if (Array.isArray(data.allowDeepDiveStates)) {
                    setAllowDeepDiveMap(prev => new Map(prev).set(key, data.allowDeepDiveStates));
                }
                if (data.teacherScript?.length) setAiTeacherScripts(prev => new Map(prev).set(key, data.teacherScript));
                if (data.fingerprintKey) setFingerprintKeyMap(prev => new Map(prev).set(key, data.fingerprintKey));
                if (data.cached_variants?.length) setCachedVariantsMap(prev => new Map(prev).set(key, data.cached_variants));
                if (Array.isArray(data.regeneration_variants) && data.regeneration_variants.length) {
                    setJsonVariantsMap(prev => new Map(prev).set(key, data.regeneration_variants as JsonVariant[]));
                }
            } else {
                // ── Single-panel response (existing) ────────────────────
                if (data.simHtml) {
                    setAiSimHtmls(prev => new Map(prev).set(key, data.simHtml));
                    setOriginalSimHtmlMap(prev => new Map(prev).set(key, data.simHtml));
                }
                if (data.physicsConfig) setAiPhysicsConfigs(prev => new Map(prev).set(key, data.physicsConfig));
                setAiSecondarySimHtmls(prev => new Map(prev).set(key, data.secondarySimHtml ?? null));
                // Fall back to fingerprintKey's first segment if the server didn't
                // echo conceptId — without it, TeacherPlayer can't render the
                // Deep-Dive button and DeepDiveModal can't be opened.
                const resolvedConceptId = data.conceptId
                    ?? (typeof data.fingerprintKey === 'string' ? data.fingerprintKey.split('|')[0] : null);
                if (resolvedConceptId) setAiConceptIds(prev => new Map(prev).set(key, resolvedConceptId));
                if (Array.isArray(data.allowDeepDiveStates)) {
                    setAllowDeepDiveMap(prev => new Map(prev).set(key, data.allowDeepDiveStates));
                }
                if (data.teacherScript?.length) setAiTeacherScripts(prev => new Map(prev).set(key, data.teacherScript));
                if (data.fingerprintKey) setFingerprintKeyMap(prev => new Map(prev).set(key, data.fingerprintKey));
                if (data.cached_variants?.length) setCachedVariantsMap(prev => new Map(prev).set(key, data.cached_variants));
                if (Array.isArray(data.regeneration_variants) && data.regeneration_variants.length) {
                    setJsonVariantsMap(prev => new Map(prev).set(key, data.regeneration_variants as JsonVariant[]));
                }
            }
        }).catch(err => {
            console.warn("[triggerLesson] simulation failed:", err);
        }).finally(() => {
            setIsLoadingSim(false);
        });
    }

    async function handleModeChange(newMode: ChatMode) {
        setMode(newMode);
        if (!activeConceptualId) return;
        await fetch("/api/conceptual-chat/mode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId: activeConceptualId, mode: newMode }),
        });
    }

    async function handleRevision() {
        if (!displayMessages.length) return;
        setGeneratingRevision(true);
        try {
            const res = await fetch("/api/revision-card", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: displayMessages.slice(-6) }),
            });
            if (!res.ok) throw new Error("Revision failed");
            const data = await res.json();
            setRevisionCard(data.card ?? null);
        } catch (err) {
            console.error("Revision error:", err);
        } finally {
            setGeneratingRevision(false);
        }
    }

    function handleConceptClick(name: string, conceptClass: string, subject: string) {
        setActiveConcept({ name, conceptClass, subject });
    }

    async function handleLowConfidence(messageIdx: number) {
        const targetMsg = displayMessages[messageIdx];
        if (!targetMsg) return;
        const prevUser = messageIdx > 0 ? displayMessages[messageIdx - 1]?.content ?? "" : "";
        setInput(`Can you re-explain this more clearly? The previous explanation was: "${targetMsg.content.slice(0, 100)}..."`);
    }

    async function handleStrategyRequest(type: "board" | "jee") {
        const lastAsst = [...displayMessages].reverse().find(m => m.role === "assistant");
        if (!lastAsst) return;
        const suffix = type === "board"
            ? "\n\nNow give me the step-by-step board exam answer format for this."
            : "\n\nNow give me the JEE shortcut / trick for this concept.";
        setInput(lastAsst.content.slice(0, 60) + suffix);
    }

    function handleVariantChange(variant: {
        config?: Record<string, unknown>;
        variant_index: number;
        entry_state: string;
        approach_pill_label: string;
        state_sequence: string[];
    }) {
        if (!lastKey) return;
        if (variant.variant_index === 0) {
            const orig = originalSimHtmlMap.get(lastKey);
            if (orig) setAiSimHtmls(prev => new Map(prev).set(lastKey, orig));
            setActiveVariantEntryState('STATE_1');
            setActiveStateSequence([]);
        } else {
            // Only swap sim HTML if this variant has a generated config
            // (thumbs-down flow). JSON-driven Type 1 variants reuse the
            // existing sim HTML — only state_sequence changes.
            const simHtml = variant.config?.simHtml as string | null | undefined;
            if (simHtml) setAiSimHtmls(prev => new Map(prev).set(lastKey, simHtml));
            setActiveVariantEntryState(variant.entry_state ?? 'STATE_1');
            setActiveStateSequence(variant.state_sequence ?? []);
            // Note: if simHtml is null (JSON-driven variant), iframe stays
            // loaded — TeacherPlayer's variant-switch useEffect handles reset.
        }
    }

    async function handleWantDifferent() {
        if (!currentConceptId || !lastKey || !currentFingerprintKey || variantGenerating) return;
        setVariantGenerating(true);
        try {
            const signalRes = await fetch("/api/feedback/signal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    base_cache_key: currentFingerprintKey,
                    concept_id: currentConceptId,
                    variant_index: 0,
                    session_id: activeConceptualId,
                    signal: "negative",
                }),
            });
            if (!signalRes.ok) throw new Error(`Signal API ${signalRes.status}`);
            const signalData = await signalRes.json();

            if (!signalData.can_regenerate) {
                setVariantExhausted(true);
                return;
            }

            const classLevel = (profile?.class as string | undefined)?.replace("Class ", "") ?? "12";
            const genRes = await fetch("/api/feedback/generate-variant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    base_cache_key: currentFingerprintKey,
                    concept_id: currentConceptId,
                    session_id: activeConceptualId,
                    variant_index: signalData.next_variant.variantIndex,
                    class_level: classLevel,
                    question: currentConceptId.replace(/_/g, " "),
                }),
            });
            if (!genRes.ok) throw new Error(`Generate-variant API ${genRes.status}`);
            const genData = await genRes.json();

            const newSimHtml = (genData.config as Record<string, unknown>)?.simHtml as string | null | undefined;
            if (newSimHtml && lastKey) {
                setAiSimHtmls(prev => new Map(prev).set(lastKey, newSimHtml));
                setActiveVariantEntryState(genData.entry_state ?? 'STATE_1');

                const newEntry = {
                    config: genData.config as Record<string, unknown>,
                    variant_index: genData.variant_index as number,
                    entry_state: genData.entry_state as string,
                    approach: genData.approach as string,
                };
                setCachedVariantsMap(prev => {
                    const existing = prev.get(lastKey) ?? [];
                    if (existing.some((v: { variant_index: number }) => v.variant_index === newEntry.variant_index)) return prev;
                    return new Map(prev).set(lastKey, [...existing, newEntry]);
                });

                const scriptFromVariant = (genData.config as Record<string, unknown>)?.teacherScript;
                if (Array.isArray(scriptFromVariant) && scriptFromVariant.length) {
                    setAiTeacherScripts(prev => new Map(prev).set(lastKey, scriptFromVariant as TeacherScriptStep[]));
                }
            }
        } catch (err) {
            console.error("[handleWantDifferent] error:", err);
        } finally {
            setVariantGenerating(false);
        }
    }

    function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
                setAttachments(prev => [...prev, ev.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    }

    function handleCameraUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const dataUrl = ev.target?.result as string;
            const [header, base64] = dataUrl.split(",");
            const mediaType = header.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
            setUploadedImage({ base64, mediaType, preview: dataUrl });
        };
        reader.readAsDataURL(file);
    }

    async function handleMvsResponse(response: "YES" | "NO") {
        if (!mvsData || !activeConceptualId) return;

        const { misconception, fingerprint, originalQuestion } = mvsData;
        setMvsData(null); // Hide card immediately
        setIsLoading(true);

        const mvsMsg: ConceptualMessage = {
            role: "user",
            content: `[MVS Answer] ${response === "YES" ? "Yes, exactly" : "No, I understand that"}`,
            timestamp: Date.now(),
            isMvsResponse: true, // Custom internal flag if needed
        };

        const allMessages = [...displayMessages, mvsMsg];
        setStreamingMessages(allMessages); // Show user's tap
        
        try {
            const res = await fetch("/api/mvs-response", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userResponse: response,
                    originalQuestion,
                    misconception,
                    fingerprint,
                    profile,
                }),
            });

            if (!res.ok) throw new Error("MVS response failed");

            const data = await res.json();
            
            const asstTimestamp = Date.now();
            const asstMsg: ConceptualMessage = {
                role: "assistant",
                content: data.explanation,
                timestamp: asstTimestamp,
            };

            const finalMessages = [...allMessages, asstMsg];
            
            if (data.ncertSources?.length > 0) {
                setNcertSourcesMap(prev => new Map(prev).set(`assistant-${asstTimestamp}`, data.ncertSources));
            }

            // ONLY trigger simulation if YES (they have the misconception, so show the sim)
            // or if it's general logic. For MVS, we always want the simulation.
            void saveConceptualMessages(activeConceptualId, finalMessages);
            setStreamingMessages(null);
            
            // Re-trigger simulation with the NEW conversation context
            const mvsContextToPass = `Student misunderstood: ${misconception.phrase}`;
            void triggerLessonGeneration(finalMessages, mvsContextToPass, undefined, data.panelConfig);

            // Log to simulation_feedback
            fetch("/api/simulation-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: activeConceptualId,
                    concept_id: fingerprint.concept_id,
                    confusion_pattern_id: misconception.misconception_id,
                    student_rating: "neutral", // preliminary
                    was_confusion_correct: response === "YES",
                })
            }).catch(e => console.error("feedback log error", e));

        } catch (err) {
            console.error("MVS error:", err);
            setStreamingMessages(null);
            setIsLoading(false);
        }
    }

    async function onSubmit(e?: React.FormEvent, textOverride?: string) {
        if (e) e.preventDefault();

        // Synchronous ref guard — prevents double-fire from Fast Refresh, double-clicks,
        // or stale isLoading reads before React re-renders.
        if (isSubmittingRef.current) return;

        const currentInput = textOverride ?? input;

        if (!currentInput.trim() && attachments.length === 0 && !uploadedImage) return;
        if (isLoading) return;

        isSubmittingRef.current = true;

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const userText = currentInput.trim();
        const imageSnapshot = uploadedImage;
        const image = imageSnapshot
            ? { base64: imageSnapshot.base64, mediaType: imageSnapshot.mediaType }
            : null;
        lastSentImageRef.current = image;

        setInput("");
        setUploadedImage(null);
        setAnnotationBounds(null);
        setAttachments([]);

        // Ensure a chat session exists before saving anything.
        // activeConceptualId is a closure snapshot — capture a local id to use throughout.
        let effectiveChatId = activeConceptualId;
        if (!effectiveChatId) {
            try {
                effectiveChatId = await createConceptualChat();
            } catch (err) {
                console.error('[chat] Failed to create chat session:', err);
                isSubmittingRef.current = false;
                return;
            }
        }

        const userMsg: ConceptualMessage = {
            role: "user",
            content: userText,
            timestamp: Date.now(),
        };

        const allMessages = [...displayMessages, userMsg];
        setStreamingMessages(allMessages);
        setIsLoading(true);

        // Build the attachments array the API expects
        const allAttachments = imageSnapshot
            ? [`data:${imageSnapshot.mediaType};base64,${imageSnapshot.base64}`, ...attachments]
            : attachments;

        try {
            console.log('[chat] fetch /api/chat — sending', allMessages.length, 'messages');
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: abortRef.current.signal,
                body: JSON.stringify({
                    messages: allMessages.map(m => ({ role: m.role, content: m.content })),
                    mode: teachingMode,
                    section: teachingMode,
                    sessionId: effectiveChatId,
                    examMode,
                    attachments: allAttachments,
                    profile,
                    moduleId: 1,
                    marked_region: annotationBounds ?? null,
                }),
            });

            console.log('[chat] response status:', res.status, res.ok);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error((errData as { error?: string }).error ?? `API error ${res.status}`);
            }

            const data = await res.json();
            console.log('[chat] JSON parsed — type:', data.type, '| explanation len:', data.explanation?.length ?? 0, '| ncertSources:', data.ncertSources?.length ?? 0, '| keys:', Object.keys(data));

            // Intercept On-Demand Simulation
            if (data.type === "on_demand_available") {
                console.log('[chat] intercepted: on_demand_available — returning early');
                const asstTimestamp = Date.now();
                const fingerprintKey = res.headers.get("X-Fingerprint-Key");
                if (fingerprintKey) {
                    lastFingerprintKeyRef.current = fingerprintKey;
                }
                const asstMsg: ConceptualMessage = {
                    role: "assistant",
                    content: "I can run a simulation of that scenario if you'd like to see it visually.",
                    timestamp: asstTimestamp,
                    onDemandSimLabel: data.sim_label,
                };
                const finalMessages = [...allMessages, asstMsg];
                void saveConceptualMessages(effectiveChatId, finalMessages);
                setStreamingMessages(null);
                setIsLoading(false);
                return; // halt logic, wait for user click
            }

            // Intercept Clarification
            if (data.type === "clarification") {
                console.log('[chat] intercepted: clarification — showing question');
                const asstTimestamp = Date.now();
                const asstMsg: ConceptualMessage = {
                    role: "assistant",
                    content: data.message,
                    timestamp: asstTimestamp,
                };
                const finalMessages = [...allMessages, asstMsg];
                void saveConceptualMessages(effectiveChatId, finalMessages);
                setStreamingMessages(null);
                setIsLoading(false);

                // Retain uploaded image so student can answer without re-uploading
                if (data.retain_image_context && imageSnapshot) {
                    setUploadedImage({
                        base64: imageSnapshot.base64,
                        mediaType: imageSnapshot.mediaType,
                        preview: `data:${imageSnapshot.mediaType};base64,${imageSnapshot.base64}`,
                    });
                }
                // Clear annotation — mark already processed
                setAnnotationBounds(null);
                return;
            }

            // Intercept MVS
            if (data.type === "MVS_REQUIRED") {
                console.log('[chat] intercepted: MVS_REQUIRED — returning early');
                setMvsData({
                    misconception: data.misconception,
                    fingerprint: data.fingerprint,
                    originalQuestion: userText
                });
                void saveConceptualMessages(effectiveChatId, allMessages);
                setStreamingMessages(null);
                setIsLoading(false);
                return; // halt normal flow
            }

            const assistantText: string = data.explanation ?? "";
            const ncertSources: NCERTSource[] = data.ncertSources ?? [];
            const fingerprintKey: string | null = res.headers.get("X-Fingerprint-Key");
            lastFingerprintKeyRef.current = fingerprintKey;

            const asstTimestamp = Date.now();
            const asstMsg: ConceptualMessage = {
                role: "assistant",
                content: assistantText,
                timestamp: asstTimestamp,
            };
            const finalMessages = [...allMessages, asstMsg];

            if (ncertSources.length > 0) {
                const msgKey = `assistant-${asstTimestamp}`;
                setNcertSourcesMap(prev => {
                    const next = new Map(prev);
                    next.set(msgKey, ncertSources);
                    return next;
                });
            }

            console.log('[chat] saving messages — effectiveChatId:', effectiveChatId, '| finalMessages.length:', finalMessages.length);
            void saveConceptualMessages(effectiveChatId, finalMessages);

            setStreamingMessages(null);
            console.log('[chat] streamingMessages cleared — displayMessages will fall back to context');

            // Store student_belief for BeliefProbeCard (Layer 2)
            setLastStudentBelief(data.studentConfusionData?.student_belief ?? null);

            // Trigger lesson + simulation generation (skip if session already covered this concept)
            if (data.skipSimulation) {
                console.log('[SESSION] simulation skipped — concept already covered in this session');
            } else {
                console.log('[chat] calling triggerLessonGeneration — finalMessages.length:', finalMessages.length, '| lastAsst role:', finalMessages[finalMessages.length - 1]?.role);
                void triggerLessonGeneration(finalMessages, undefined, data.studentConfusionData, data.panelConfig, false, data.scope, data.examMode, data.conceptId);
            }

        } catch (err: unknown) {
            if (err instanceof Error && err.name === "AbortError") return;
            console.error('[chat] ERROR:', err);
            const errorMsg: ConceptualMessage = {
                role: "assistant",
                content: "Sorry, something went wrong. Please try again.",
                timestamp: Date.now(),
            };
            void saveConceptualMessages(effectiveChatId, [...allMessages, errorMsg]);
            setStreamingMessages(null);
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    }

    const frustrationSuffix = exchangeCount > 5 ? " I'm still confused." : "";
    void frustrationSuffix;

    return (
        <div className={`flex-1 flex flex-col min-h-0 overflow-hidden accent-${section}`}>
            {/* Drag overlay: prevents iframes from swallowing mouseup events and keeps cursor consistent */}
            {anyDragging && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, cursor: isDraggingV.current ? 'row-resize' : 'col-resize' }} />
            )}
            
            {/* Main split: LEFT chat | divider | RIGHT panel */}
            <div
                className="flex-1 min-h-0 overflow-hidden"
                style={{ display: 'flex', flexDirection: 'row' }}
            >
                {/* LEFT: Chat panel */}
                <div
                    style={{
                        width: `${leftWidth}%`, minWidth: 0, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        transition: anyDragging ? 'none' : 'width 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                >
                    {/* Session memory welcome card */}
                    {contextMessages.length === 0 && activeConceptualChats_hasRecent(activeConceptualChat) && (
                        <div className="mx-4 mt-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-3 shrink-0">
                            <div>
                                <p className="text-[13px] font-semibold text-zinc-200">
                                    Continue where you left off?
                                </p>
                                <p className="text-[12px] text-zinc-500 mt-0.5">{activeConceptualChat?.title}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => setInput("Continue explaining from where we left off")}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-medium rounded-lg transition-colors">
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Messages — top padding keeps the first line of a new
                         assistant message clear of the tab header. */}
                    <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4 bg-black scroll-smooth min-h-0">
                        {skeletonTimer ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                            </div>
                        ) : displayMessages.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center max-w-sm">
                                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">📚</span>
                                    </div>
                                    <h2 className="text-base font-semibold text-zinc-100 mb-1">Ask any concept</h2>
                                    <p className="text-[13px] text-zinc-500 leading-relaxed mb-4">
                                        {examMode === "JEE" ? "JEE-level intuition, shortcuts & traps" : "Board exam step-by-step solutions"}
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {["What is drift velocity?", "Explain KCL", "Ohm's Law derivation"].map(q => (
                                            <button key={q} onClick={() => setInput(q)}
                                                className="text-[12px] px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-all">
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto space-y-4">
                                {/* 5-min revision button after 3+ exchanges */}
                                {exchangeCount >= 3 && !revisionCard && (
                                    <div className="flex justify-center">
                                        <button onClick={handleRevision} disabled={generatingRevision}
                                            className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-amber-500/50 text-zinc-400 hover:text-amber-400 text-[12px] font-medium rounded-full transition-all">
                                            {generatingRevision ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                                            Revise in 5 mins
                                        </button>
                                    </div>
                                )}

                                {/* Revision card */}
                                {revisionCard && (
                                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                                        <pre className="text-[12px] text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">{revisionCard}</pre>
                                        <div className="mt-2">
                                            <ResponseActionBar content={revisionCard} section={section === 'board' ? 'conceptual' : section} messageId="revision" />
                                        </div>
                                    </div>
                                )}

                                {displayMessages.map((m: ConceptualMessage | { role: string; content: string; timestamp?: number }, idx: number) => {
                                    const isAsst = m.role === "assistant";
                                    const isLastAsst = isAsst && idx === displayMessages.length - 1;
                                    const msgKey = `${m.role}-${m.timestamp}`;
                                    return (
                                        <div key={idx} className={`flex flex-col group ${isAsst ? "items-start" : "items-end"} animate-fade-in`}>
                                            <div
                                                className={`max-w-[88%] rounded-2xl text-[14px] leading-relaxed ${isAsst
                                                    ? "bg-zinc-900 border border-zinc-800 border-l-[3px] text-zinc-100 pl-4 pr-4 py-3"
                                                    : "text-white px-4 py-3"
                                                }`}
                                                style={
                                                    isAsst
                                                        ? { borderLeftColor: 'rgb(var(--accent) / 0.55)' }
                                                        : { backgroundColor: 'rgb(var(--accent))', boxShadow: 'var(--shadow-sm)' }
                                                }
                                            >
                                                {(m as ConceptualMessage).onDemandSimLabel ? (
                                                    <div className="flex flex-col items-start gap-4">
                                                        <MessageRenderer
                                                            content={m.content}
                                                            onConceptClick={isAsst ? handleConceptClick : undefined}
                                                            isAssistant={isAsst}
                                                            userQuestion={isAsst && idx > 0 ? (displayMessages[idx - 1]?.content ?? "") : undefined}
                                                        />
                                                        {!aiSimHtmls.has(msgKey) && (
                                                            <button
                                                                onClick={() => triggerLessonGeneration(displayMessages.slice(0, idx + 1))}
                                                                disabled={isLoadingSim}
                                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded-xl transition-colors w-full sm:w-auto"
                                                            >
                                                                {isLoadingSim ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                                                {isLoadingSim ? "Generating Simulation..." : (m as ConceptualMessage).onDemandSimLabel}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <MessageRenderer
                                                        content={m.content}
                                                        onConceptClick={isAsst ? handleConceptClick : undefined}
                                                        isAssistant={isAsst}
                                                        userQuestion={
                                                            isAsst && idx > 0
                                                                ? (displayMessages[idx - 1]?.content ?? "")
                                                                : undefined
                                                        }
                                                    />
                                                )}
                                            </div>
                                            {isAsst && !isLoading && !(m as ConceptualMessage).onDemandSimLabel && m.content.length > 10 && (
                                                <>
                                                    <NCERTSourcesWidget sources={ncertSourcesMap.get(msgKey) ?? []} />
                                                    <ResponseActionBar content={m.content} section={section === 'board' ? 'conceptual' : section} messageId={`msg-${idx}`} />
                                                    <ConfidenceMeter
                                                        chatId={activeConceptualId ?? ""}
                                                        messageIdx={idx}
                                                        onLowConfidence={() => handleLowConfidence(idx)}
                                                    />
                                                    {/* Strategy opt-in buttons */}
                                                    <div className="flex gap-2 mt-1.5 px-1 flex-wrap">
                                                        <button
                                                            onClick={() => handleStrategyRequest('board')}
                                                            disabled={isLoading}
                                                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-full transition-all disabled:opacity-40"
                                                        >
                                                            📋 Board format
                                                        </button>
                                                        <button
                                                            onClick={() => handleStrategyRequest('jee')}
                                                            disabled={isLoading}
                                                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-full transition-all disabled:opacity-40"
                                                        >
                                                            ⚡ JEE strategy
                                                        </button>
                                                        {isLastAsst && (
                                                            <span className="text-[11px] text-zinc-600 flex items-center">
                                                                📊 →
                                                            </span>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                                
                                {mvsData && (
                                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <MisconceptionVerifyCard
                                            mvsPhrase={mvsData.misconception.mvs_phrase}
                                            onResponse={handleMvsResponse}
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}
                                
                                {isLoading && displayMessages[displayMessages.length - 1]?.role === "user" && (
                                    <div className="flex justify-start animate-fade-in">
                                        <div
                                            className="bg-zinc-900 border border-zinc-800 border-l-[3px] rounded-2xl px-4 py-3 max-w-[88%] w-full sm:w-[360px] space-y-2"
                                            style={{ borderLeftColor: 'rgb(var(--accent) / 0.55)' }}
                                        >
                                            <div className="h-3 w-3/4 rounded bg-zinc-800 animate-pulse" />
                                            <div className="h-3 w-1/2 rounded bg-zinc-800 animate-pulse" style={{ animationDelay: '150ms' }} />
                                            <div className="h-3 w-2/3 rounded bg-zinc-800 animate-pulse" style={{ animationDelay: '300ms' }} />
                                            <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-zinc-500">
                                                <span
                                                    className="w-1 h-1 rounded-full animate-pulse"
                                                    style={{ backgroundColor: 'rgb(var(--accent))' }}
                                                />
                                                Thinking through NCERT sources…
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input area */}
                    <div className="shrink-0 bg-black border-t border-zinc-900 px-4 py-3">
                        {/* Uploaded image preview with annotation */}
                        {uploadedImage && (
                            <div className="max-w-3xl mx-auto mb-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[12px] text-zinc-400">Image attached — AI will explain & simulate this</span>
                                    <button
                                        type="button"
                                        onClick={() => { setUploadedImage(null); setAnnotationBounds(null); }}
                                        className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors shrink-0"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <ImageAnnotator
                                    imageUrl={uploadedImage.preview}
                                    onAnnotationChange={setAnnotationBounds}
                                />
                            </div>
                        )}

                        {attachments.length > 0 && (
                            <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                                {attachments.map((src, i) => (
                                    <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 shrink-0 group">
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setAttachments(p => p.filter((_, j) => j !== i))}
                                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100">
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => imgInputRef.current?.click()}
                                disabled={isLoading}
                                aria-label="Upload an image (camera or screenshot)"
                                title="Upload image — take a photo of a question or attach a screenshot"
                                className={`p-2 rounded-xl transition-all shrink-0 ${uploadedImage ? "text-blue-400 bg-blue-500/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input ref={imgInputRef} type="file" accept="image/*" hidden onChange={handleCameraUpload} />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                aria-label="Attach a PDF or image"
                                title="Attach files — PDFs or images"
                                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all shrink-0"
                            >
                                <Paperclip className="w-4 h-4" />
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple hidden onChange={handleFiles} />
                            <input
                                className="flex-1 min-w-0 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-full px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-zinc-600"
                                value={input}
                                placeholder="Ask a physics concept — e.g. 'why doesn't gravity tilt with the surface?'"
                                onChange={e => setInput(e.target.value)}
                                disabled={isLoading}
                                aria-label="Physics question"
                            />

                            {/* Answer-style hint toggle (shorthand: which prompt style will shape the NEXT answer) */}
                            <button
                                type="button"
                                onClick={() => {
                                    const modes: ChatMode[] = ["competitive", "board", "both"];
                                    const nextIdx = (modes.indexOf(mode) + 1) % modes.length;
                                    handleModeChange(modes[nextIdx]);
                                }}
                                disabled={isLoading}
                                aria-label={`Answer-style: ${mode === "competitive" ? "JEE/NEET" : mode === "board" ? "Board" : "Both"}`}
                                title={`Answer-style: ${mode === "competitive" ? "JEE/NEET" : mode === "board" ? "Board" : "Both"} — click to cycle`}
                                className="px-2.5 h-9 flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg transition-all text-[11px] font-semibold shrink-0"
                            >
                                <span className="text-xs" aria-hidden>
                                    {mode === "competitive" ? "🏆" : mode === "board" ? "📋" : "⚡"}
                                </span>
                                <span className="hidden md:inline">
                                    {mode === "competitive" ? "JEE" : mode === "board" ? "Board" : "Both"}
                                </span>
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading || (!input.trim() && attachments.length === 0)}
                                aria-label="Send question"
                                title="Send question (Enter)"
                                className="p-2.5 text-white rounded-xl disabled:opacity-40 transition-all shrink-0 hover:brightness-110"
                                style={{ backgroundColor: 'rgb(var(--accent))', boxShadow: 'var(--shadow-md)' }}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
                {/* end LEFT panel */}

                {/* HORIZONTAL DIVIDER */}
                <div
                    onMouseDown={onMouseDownH}
                    className="hidden md:block shrink-0 select-none"
                    style={{
                        width: 6, cursor: 'col-resize',
                        background: '#1a1f2e',
                        borderLeft: '1px solid #2a3044',
                        borderRight: '1px solid #2a3044',
                        transition: 'background 0.15s',
                    }}
                    title="Drag to resize panels"
                />

                {/* RIGHT PANEL: steps (fixed px) + simulation (flex-1) */}
                <div
                    ref={rightPanelRef}
                    className="flex flex-col bg-[#0a0d14]"
                    style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}
                >
                    {/* SECTION A: Steps list — renders for both single-panel and multi-panel
                         (DualPanelSimulation does NOT ship its own Play/Explain controls, so the
                         TeacherPlayer compact header owns them for every concept).
                         Height is driven by `sectionAHeight` state so the teacher below-pills
                         area (TTS sentence + thumbs) has room to breathe. Drag the vertical
                         divider below to resize. */}
                    <div
                        className="hidden md:block shrink-0 bg-zinc-950"
                        style={{ height: sectionAHeight, flexShrink: 0, overflow: 'hidden', borderBottom: '1px solid #1e2030' }}
                    >
                        {currentLesson ? (
                            /* TeacherPlayer mounts as soon as lesson arrives (~2-3s).
                               It shows skeleton dots/rows internally while aiScript is still
                               generating (~25-35s). No lesson-based steps ever appear. */
                            <TeacherPlayer
                                key={lastKey ?? 'empty'}
                                lesson={currentLesson}
                                simHtml={currentSimHtml}
                                isLoadingSim={isLoadingSim}
                                compact
                                aiScript={currentTeacherScript}
                                iframeRef={simIframeRef}
                                secondaryIframeRef={secondarySimIframeRef}
                                conceptId={currentConceptId}
                                secondarySimHtml={currentSecondarySimHtml}
                                sessionId={activeConceptualId ?? undefined}
                                studentBelief={lastStudentBelief ?? undefined}
                                entryState={activeVariantEntryState ?? undefined}
                                stateSequence={activeStateSequence.length > 0 ? activeStateSequence : undefined}
                                onDeepDiveClick={currentConceptId
                                    ? (stateId) => {
                                        if (usesInlineDeepDive(currentConceptId)) {
                                            void handleInlineDeepDive(currentConceptId, stateId);
                                        } else {
                                            setDeepDiveState(stateId);
                                        }
                                    }
                                    : undefined}
                                allowedDeepDiveStates={currentAllowedDeepDiveStates ?? undefined}
                                deepDiveSubStates={deepDiveSubStates}
                                activeDeepDiveParent={activeDeepDiveParent}
                                activeDeepDiveIdx={activeDeepDiveIdx}
                                deepDiveStatus={deepDiveStatus}
                                deepDiveLoading={deepDiveLoading}
                                onSubStateClick={handleSubStateClick}
                                onDeepDiveExit={handleDeepDiveExit}
                                deepDiveCacheId={deepDiveCacheId}
                            />
                        ) : (lessonLoading || isLoadingSim) ? (
                            /* Lesson + sim both still generating — show skeleton strip immediately */
                            <div className="flex flex-col bg-zinc-950">
                                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-800/60 bg-zinc-900/40">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 animate-pulse shrink-0" />
                                    <div className="flex items-center gap-1 flex-1">
                                        {[0,1,2,3].map(i => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-0">
                                    {[0,1,2,3].map(i => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-2 border-l-2 border-transparent">
                                            <div className="w-3 h-3 rounded-full bg-zinc-800 animate-pulse shrink-0" style={{ animationDelay: `${i * 120}ms` }} />
                                            <div className="h-2.5 rounded bg-zinc-800 animate-pulse" style={{ width: `${60 + i * 10}%`, animationDelay: `${i * 120}ms` }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-4 bg-zinc-950">
                                <p className="text-zinc-600 text-xs text-center px-4">
                                    Ask a physics question to start ↙
                                </p>
                            </div>
                        )}
                    </div>

                    {/* VERTICAL DIVIDER — drag to resize Section A (teacher-script
                         area) vs the simulation below. Min 76px pill-row-only,
                         max 60 % of right panel. */}
                    <div
                        onMouseDown={onMouseDownV}
                        className="hidden md:flex shrink-0 select-none items-center justify-center group"
                        style={{
                            height: 6, cursor: 'row-resize',
                            background: '#1a1f2e',
                            borderTop: '1px solid #2a3044',
                            borderBottom: '1px solid #2a3044',
                            transition: 'background 0.15s',
                        }}
                        title="Drag to resize teacher-script area vs simulation"
                    >
                        <div
                            style={{
                                width: 40, height: 2, borderRadius: 1,
                                background: '#3a4057',
                            }}
                            className="group-hover:bg-zinc-500"
                        />
                    </div>

                    {/* Merged info bar — worked example + mode pills + confused chip.
                         Replaces the three separate rows (worked-example banner,
                         TeachingModeToggle row, drill-down row) which read as overcrowded.
                         position:relative anchors the drill-down's expanded popover. */}
                    {(currentSimHtml || currentMultiPanel) && (
                        <div className="shrink-0 relative flex items-center gap-3 px-3 py-1.5 bg-zinc-950 border-b border-zinc-800">
                            {/* Worked-example context — wraps first so mode pills stay aligned right.
                                 When a deep-dive sub-state is active and it carries its own
                                 `example_anchor`, that text wins over the concept's global
                                 anchor so the EXAMPLE tag matches the sub-state scene. */}
                            {(() => {
                                const meta = currentConceptId ? getConceptMeta(currentConceptId) : null;
                                const activeSub = (activeDeepDiveParent && deepDiveSubStates && activeDeepDiveIdx != null)
                                    ? deepDiveSubStates[activeDeepDiveIdx] ?? null
                                    : null;
                                const anchor = activeSub?.example_anchor ?? meta?.realWorldAnchor;
                                if (!anchor) return null;
                                return (
                                    <div
                                        className="flex items-center gap-1.5 min-w-0 text-[11px] text-blue-200/80"
                                        title="The simulation uses this specific scenario. Other numbers in the text may refer to different examples."
                                    >
                                        <span className="uppercase tracking-wider font-semibold text-blue-400/90 text-[9px] shrink-0">
                                            Example
                                        </span>
                                        <span className="truncate">{anchor}</span>
                                    </div>
                                );
                            })()}
                            {/* Right side — Confused? drill-down chip only.
                                 Conceptual / Board / JEE mode pills removed per user
                                 feedback (the sidebar already has dedicated tabs for
                                 those three surfaces; the in-panel duplication was
                                 overcrowded and confusing). `teachingMode` still
                                 tracks `section` so /api/chat params stay correct. */}
                            <div className="ml-auto flex items-center gap-2 shrink-0">
                                <DrillDownWidget
                                    compact
                                    conceptId={currentConceptId}
                                    currentStateId={activeVariantEntryState ?? activeStateSequence[0] ?? (currentConceptId ? 'STATE_1' : null)}
                                    classLevel={typeof profile?.class === "string" ? profile.class : undefined}
                                    mode={teachingMode}
                                    sessionId={activeConceptualId ?? undefined}
                                />
                            </div>
                        </div>
                    )}

                    {/* Variant switcher — tabs only render when there's >1 variant.
                         Hides entirely on concepts with a single explanation. */}
                    {(currentSimHtml || currentMultiPanel) && (
                        (currentJsonVariants?.length ?? 0) + (currentCachedVariants?.length ?? 0) > 0
                    ) && (
                        <SimulationSwitcher
                            mainSimHtml={currentSimHtml ?? ''}
                            cachedVariants={currentCachedVariants}
                            jsonVariants={currentJsonVariants ?? undefined}
                            baseCacheKey={currentFingerprintKey ?? ''}
                            conceptId={currentConceptId ?? ''}
                            sessionId={activeConceptualId ?? ''}
                            onVariantChange={handleVariantChange}
                            onRequestNewVariant={handleWantDifferent}
                            isGenerating={variantGenerating}
                            exhausted={variantExhausted}
                        />
                    )}

                    {/* SECTION B: Simulation — flex:1, fills ALL remaining height */}
                    <div
                        style={{
                            flex: 1,
                            minHeight: 0,
                            overflow: 'hidden',
                            position: 'relative',
                            background: '#0a0a14',
                        }}
                    >
                        {/* Show loading when EITHER lesson or sim is loading */}
                        {/* ── Multi-panel simulation (Phase 6) ── */}
                        {currentMultiPanel ? (
                            <div style={{ position: 'absolute', inset: 0 }}>
                                <DualPanelSimulation
                                    panelAHtml={currentMultiPanel.panelAHtml}
                                    panelBHtml={currentMultiPanel.panelBHtml}
                                    primaryPanel={currentMultiPanel.primaryPanel}
                                    syncRequired={currentMultiPanel.syncRequired}
                                    sharedStates={currentMultiPanel.sharedStates}
                                    script={currentTeacherScript}
                                    conceptId={currentConceptId}
                                    variantEntryState={activeVariantEntryState ?? undefined}
                                    variantStateSequence={activeStateSequence.length > 0 ? activeStateSequence : undefined}
                                    // Share the same RefObjects TeacherPlayer targets
                                    // so state-pill clicks actually reach the iframes
                                    // this component renders.
                                    externalPrimaryRef={simIframeRef}
                                    externalSecondaryRef={secondarySimIframeRef}
                                />
                            </div>
                        ) : (lessonLoading || isLoadingSim) && !currentSimHtml ? (
                            <div style={{ position: 'absolute', inset: 0 }}>
                                <AISimulationRenderer
                                    simHtml={null}
                                    isLoading={true}
                                    concept={activeConcept?.name ?? ''}
                                />
                            </div>
                        ) : currentSimHtml ? (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: currentPanelLayout === 'dual_horizontal' ? 'row' : 'column' }}>
                                {/* Primary panel — gets more space by default (62/38) so the graph
                                     doesn't dominate when it has no data yet. */}
                                <div style={{ flex: secondaryCollapsed ? 1 : 1.6, minWidth: 0, minHeight: 0, position: 'relative' }}>
                                    <AISimulationRenderer
                                        simHtml={currentSimHtml}
                                        concept={activeConcept?.name ?? ''}
                                        iframeRef={simIframeRef}
                                    />
                                    {/* SIM_ERROR overlay — only shown when iframe posts an error */}
                                    {simError && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,20,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, zIndex: 10 }}>
                                            <span style={{ color: '#f87171', fontSize: 12, fontFamily: 'monospace', textAlign: 'center', maxWidth: 360 }}>
                                                ⚠ Simulation error: {simError}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setSimError(null);
                                                    // Clear dedup guard so the retry isn't blocked
                                                    if (lastKey) generatedLessonsRef.current.delete(lastKey);
                                                    // forceRegenerate=true: deletes bad cache entry on server, forces fresh AI generation
                                                    void triggerLessonGeneration(displayMessages as ConceptualMessage[], undefined, undefined, undefined, true);
                                                }}
                                                style={{ marginTop: 4, padding: '4px 12px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
                                            >
                                                Retry simulation
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {/* Secondary panel — dual layouts only. Collapsible to a
                                     narrow rail when the student wants full focus on the primary. */}
                                {(currentPanelLayout === 'dual_horizontal' || currentPanelLayout === 'dual_vertical') && currentSecondarySimHtml && (
                                    secondaryCollapsed ? (
                                        <button
                                            type="button"
                                            onClick={() => setSecondaryCollapsed(false)}
                                            title="Show graph panel"
                                            style={{
                                                width: currentPanelLayout === 'dual_horizontal' ? 28 : '100%',
                                                height: currentPanelLayout === 'dual_vertical' ? 28 : '100%',
                                                flexShrink: 0,
                                                borderLeft: currentPanelLayout === 'dual_horizontal' ? '1px solid #1e2030' : undefined,
                                                borderTop: currentPanelLayout === 'dual_vertical' ? '1px solid #1e2030' : undefined,
                                                background: '#0c0f1a',
                                                color: '#9ca3af',
                                                fontSize: 10,
                                                cursor: 'pointer',
                                                writingMode: currentPanelLayout === 'dual_horizontal' ? 'vertical-rl' : 'horizontal-tb',
                                                letterSpacing: 1,
                                            }}
                                        >
                                            ▸ Graph
                                        </button>
                                    ) : (
                                        <div
                                            style={{
                                                flex: 1, minWidth: 0, minHeight: 0, position: 'relative',
                                                borderLeft: currentPanelLayout === 'dual_horizontal' ? '1px solid #1e2030' : undefined,
                                                borderTop: currentPanelLayout === 'dual_vertical' ? '1px solid #1e2030' : undefined,
                                            }}
                                        >
                                            <AISimulationRenderer
                                                simHtml={currentSecondarySimHtml}
                                                concept={activeConcept?.name ?? ''}
                                                iframeRef={secondarySimIframeRef}
                                            />
                                            {/* Collapse handle */}
                                            <button
                                                type="button"
                                                onClick={() => setSecondaryCollapsed(true)}
                                                title="Hide graph panel"
                                                style={{
                                                    position: 'absolute', top: 6, right: 6, zIndex: 5,
                                                    padding: '2px 6px', borderRadius: 4,
                                                    background: 'rgba(15,15,28,0.85)', color: '#9ca3af',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    fontSize: 10, cursor: 'pointer',
                                                }}
                                            >
                                                Hide
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p className="text-zinc-700 text-xs">No simulation for this concept</p>
                            </div>
                        )}
                    </div>
                    {/* end SECTION B */}
                </div>
                {/* end RIGHT panel */}

            </div>
            {/* end main split */}

            {activeConcept && (
                <ConceptSidebar
                    conceptName={activeConcept.name}
                    conceptClass={activeConcept.conceptClass}
                    conceptSubject={activeConcept.subject}
                    onClose={() => setActiveConcept(null)}
                />
            )}

            {/* Phase F: Deep-dive modal — fixed-position overlay.
                 Rendered only for concepts NOT in INLINE_DEEP_DIVE_CONCEPTS;
                 flagged concepts use the inline sub-pill path (see TeacherPlayer). */}
            {!usesInlineDeepDive(currentConceptId) && (
                <DeepDiveModal
                    open={!!deepDiveState && !!currentConceptId}
                    conceptId={currentConceptId ?? ""}
                    stateId={deepDiveState ?? ""}
                    classLevel={typeof profile?.class === "string" ? profile.class : undefined}
                    mode={teachingMode}
                    sessionId={activeConceptualId ?? undefined}
                    onClose={() => setDeepDiveState(null)}
                />
            )}
        </div>
    );
}

// Helper: does the chat have any existing messages saved?
function activeConceptualChats_hasRecent(chat: any): boolean {
    return chat && (chat.messages?.length ?? 0) === 0 && !!chat.title && chat.title !== "New Chat";
}
