"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Camera, Paperclip, X, Zap, RefreshCw } from "lucide-react";
import { MessageRenderer } from "@/components/MessageRenderer";
import ConceptSidebar from "@/components/ConceptSidebar";
import ResponseActionBar from "@/components/ResponseActionBar";
import ConfidenceMeter from "@/components/ConfidenceMeter";
import { getModePromptSuffix } from "@/components/ModeToggle";
import ChatSkeleton from "@/components/ChatSkeleton";
import NCERTSourcesWidget from "@/components/NCERTSourcesWidget";
import { useProfile } from "@/contexts/ProfileContext";
import { useChats, titleFromMessage, type ChatMode, type ChatMessage } from "@/contexts/ChatContext";
import type { NCERTSource } from "@/lib/teacherEngine";

const FRUSTRATION_KEYWORDS = [
    ["kcl", "junction", "current split"],
    ["kvl", "loop", "voltage law"],
    ["ohm", "resistance", "v=ir"],
    ["wheatstone", "bridge"],
    ["potentiometer"],
    ["drift", "electron"],
    ["emf", "internal"],
    ["power", "heat"],
];

function detectKeyword(text: string): string | null {
    const t = text.toLowerCase();
    for (const group of FRUSTRATION_KEYWORDS) {
        if (group.some(k => t.includes(k))) return group[0];
    }
    return null;
}

interface ActiveConcept { name: string; conceptClass: string; subject: string; }

export default function CompetitiveTab() {
    const currentMode = 'competitive';
    const { profile, addConcept, sessionConceptIds } = useProfile();
    const {
        activeProblemChat,
        activeProblemId,
        createProblemChat,
        updateProblemChat,
        getProblemMessages,
        saveProblemMessages,
        loadProblemMessages,
        chatLoading,
    } = useChats();

    // Messages come from problem context (Supabase-backed), not local state
    const [streamingMessages, setStreamingMessages] = useState<ChatMessage[] | null>(null);
    const contextMessages = activeProblemId ? getProblemMessages(activeProblemId) : [];
    const messages = streamingMessages ?? contextMessages;

    const [input, setInput] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const [mode, setMode] = useState<ChatMode>(activeProblemChat?.mode ?? "both");
    const [isLoading, setIsLoading] = useState(false);
    const [activeConcept, setActiveConcept] = useState<ActiveConcept | null>(null);
    const [skeletonTimer, setSkeletonTimer] = useState(false);
    const [keywordCounts, setKeywordCounts] = useState<Record<string, number>>({});
    const [revisionCard, setRevisionCard] = useState<string | null>(null);
    const [generatingRevision, setGeneratingRevision] = useState(false);
    const [ncertSourcesMap, setNcertSourcesMap] = useState<Map<string, NCERTSource[]>>(new Map());
    const [uploadedImage, setUploadedImage] = useState<{
        base64: string;
        mediaType: string;
        preview: string;
    } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const lastFingerprintKeyRef = useRef<string | null>(null);

    /* On chat switch: load messages from Supabase, reset local UI state */
    useEffect(() => {
        if (!activeProblemId) return;
        setStreamingMessages(null);
        setSkeletonTimer(true);
        const timeout = setTimeout(() => setSkeletonTimer(false), 600);
        setMode(activeProblemChat?.mode ?? "both");
        setKeywordCounts({});
        setRevisionCard(null);
        setNcertSourcesMap(new Map());
        setUploadedImage(null);
        loadProblemMessages(activeProblemId);
        return () => clearTimeout(timeout);
    }, [activeProblemId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const exchangeCount = messages.length / 2;

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        Array.from(e.target.files || []).forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => setAttachments(prev => [...prev, ev.target?.result as string]);
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const handleCameraUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;
        if (file.size > 10 * 1024 * 1024) {
            alert("Image too large. Max 10MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            const mediaType = file.type;
            setUploadedImage({ base64, mediaType, preview: result });
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    /* Send a message to the chat API */
    const sendToAPI = async (
        userText: string,
        systemSuffix?: string,
        imageForSend?: { base64: string; mediaType: string; preview: string } | null
    ) => {
        // Auto-create a problem chat if none is active
        let chatId = activeProblemId;
        if (!chatId) {
            chatId = await createProblemChat();
        }
        if (!chatId) return;

        setIsLoading(true);
        abortRef.current = new AbortController();
        const userMsg: ChatMessage = { role: "user", content: userText, timestamp: Date.now() };
        const baseMessages = getProblemMessages(chatId);
        const allMessages = [...baseMessages, userMsg];

        // Show user message while waiting for response
        setStreamingMessages([...allMessages]);

        const kw = detectKeyword(userText);
        let frustrationSuffix = "";
        if (kw) {
            setKeywordCounts(prev => {
                const count = (prev[kw] ?? 0) + 1;
                if (count >= 3) {
                    frustrationSuffix = `\n\nIMPORTANT: The student has asked about "${kw}" multiple times. Start your response with: "I notice we've covered this a few times. Let me try a completely different approach..." and use a fresh analogy or method—NOT the one you used before.`;
                }
                return { ...prev, [kw]: count };
            });
        }

        void getModePromptSuffix(mode) + frustrationSuffix; // kept for parity

        try {
            const allAttachments = imageForSend
                ? [`data:${imageForSend.mediaType};base64,${imageForSend.base64}`, ...attachments]
                : attachments;

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: abortRef.current.signal,
                body: JSON.stringify({
                    messages: allMessages.map(m => ({ role: m.role, content: m.content })),
                    mode: currentMode,
                    section: currentMode,
                    attachments: allAttachments,
                    profile,
                    moduleId: 1,
                }),
            });

            const fingerprintKey = res.headers.get('X-Fingerprint-Key') || null;
            if (fingerprintKey) {
                lastFingerprintKeyRef.current = fingerprintKey;
            }

            if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
            const data = await res.json();
            const assistantText: string = data.explanation ?? "";
            const ncertSources: NCERTSource[] = data.ncertSources ?? [];

            const asstTimestamp = Date.now();
            const finalMessages: ChatMessage[] = [
                ...allMessages,
                { role: "assistant" as const, content: assistantText, timestamp: asstTimestamp },
            ];

            if (ncertSources.length > 0) {
                setNcertSourcesMap(prev => {
                    const next = new Map(prev);
                    next.set(`assistant-${asstTimestamp}`, ncertSources);
                    return next;
                });
            }

            const kws = FRUSTRATION_KEYWORDS
                .filter(g => g.some(k => assistantText.toLowerCase().includes(k)))
                .map(g => g[0]);

            // Save to problem messages (separate from conceptual)
            await saveProblemMessages(chatId, finalMessages);

            await updateProblemChat(chatId, {
                keywords: kws,
                title: finalMessages.length <= 2
                    ? titleFromMessage(userText)
                    : (activeProblemChat?.title ?? titleFromMessage(userText)),
            });

            setStreamingMessages(null);

        } catch (err: any) {
            if (err.name !== "AbortError") {
                const errorMsg: ChatMessage = { role: "assistant", content: "Sorry, something went wrong. Please try again.", timestamp: Date.now() };
                const withError = [...allMessages, errorMsg];
                await saveProblemMessages(chatId, withError);
                setStreamingMessages(null);
            }
        } finally {
            setIsLoading(false);
            setAttachments([]);
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && attachments.length === 0 && !uploadedImage) return;
        const text = input.trim();
        const imageSnapshot = uploadedImage;
        setInput("");
        setUploadedImage(null);
        sendToAPI(text, undefined, imageSnapshot);
    };

    const handleLowConfidence = (msgIdx: number) => {
        const assistantMsg = messages[msgIdx];
        if (!assistantMsg) return;
        sendToAPI(
            `[System: Student rated this explanation as unclear. Previous response: "${assistantMsg.content.slice(0, 200)}"]`,
            "\n\nSince the student found the previous explanation unclear, use a completely different analogy and approach."
        );
    };

    const handleRevision = async () => {
        if (generatingRevision) return;
        setGeneratingRevision(true);
        const chatTitle = activeProblemChat?.title ?? "Current Electricity";
        const recentContext = messages.slice(-6).map(m => `${m.role}: ${m.content.slice(0, 200)}`).join("\n");
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "user",
                            content: `Generate a quick 5-minute revision card for: "${chatTitle}"\nBased on this conversation:\n${recentContext}\n\nFormat EXACTLY like this:\nQuick Revision: ${chatTitle}\n━━━━━━━━━━━━━━━━━━━━\n📌 3 Key Concepts:\n1.\n2.\n3.\n━━━━━━━━━━━━━━━━━━━━\n📐 2 Must-Know Formulas:\n1.\n2.\n━━━━━━━━━━━━━━━━━━━━\n⚡ 1 Exam Trick:\n[the most useful trick from this chat]\n━━━━━━━━━━━━━━━━━━━━`
                        }
                    ],
                    mode: "competitive",
                    section: "competitive",
                    profile,
                    moduleId: 1,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setRevisionCard(data.explanation ?? "");
            }
        } finally {
            setGeneratingRevision(false);
        }
    };

    const handleConceptClick = (name: string, conceptClass: string, subject: string) => {
        setActiveConcept({ name, conceptClass, subject });
        const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${conceptClass}`;
        if (!sessionConceptIds.has(id)) addConcept({ id, name, conceptClass, subject, status: "needs_review", timestamp: Date.now() });
    };

    /* ── Skeleton ── */
    if (chatLoading || skeletonTimer) return <ChatSkeleton />;

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="h-full flex flex-col min-h-0 overflow-hidden">
                        {/* Session memory welcome card */}
                        {messages.length === 0 && problemChat_hasRecent(activeProblemChat) && (
                            <div className="mx-4 mt-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-3 shrink-0">
                                <div>
                                    <p className="text-[13px] font-semibold text-zinc-200">
                                        Continue where you left off?
                                    </p>
                                    <p className="text-[12px] text-zinc-500 mt-0.5">{activeProblemChat?.title}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => setInput("Continue explaining from where we left off")}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-medium rounded-lg transition-colors">
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 bg-black scroll-smooth min-h-0">
                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center px-4">
                                    <div className="text-center max-w-sm">
                                        <div className="text-5xl mb-4">⚡</div>
                                        <h2 className="text-xl font-semibold text-zinc-100 mb-2">Competitive Exam Prep</h2>
                                        <p className="text-[13px] text-zinc-400 leading-relaxed mb-6">
                                            JEE Main · JEE Advanced · NEET<br/>
                                            Get deeper explanations, traps to avoid, and shortcuts for speed.
                                        </p>
                                        <div className="flex flex-col gap-2 mb-6">
                                            {["What trap do students fall into with KVL?", "Explain capacitor charging shortcut for JEE", "What if length doubles and area halves?", "Difficult KVL problem with 3 loops"].map(q => (
                                                <button key={q} onClick={() => setInput(q)}
                                                    className="text-[12px] px-4 py-2.5 text-left rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 transition-all">
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                                            📷 Upload JEE/NEET questions directly using the camera/file icon below
                                        </p>
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
                                                <ResponseActionBar content={revisionCard} section="conceptual" messageId="revision" />
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((m, idx) => {
                                        const isAsst = m.role === "assistant";
                                        const msgKey = `${m.role}-${m.timestamp}`;
                                        return (
                                            <div key={idx} className={`flex flex-col group ${isAsst ? "items-start" : "items-end"}`}>
                                                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${isAsst
                                                    ? "bg-zinc-900 border border-zinc-800 text-zinc-100"
                                                    : "bg-blue-600 text-white"
                                                    }`}>
                                                    <MessageRenderer
                                                        content={m.content}
                                                        onConceptClick={isAsst ? handleConceptClick : undefined}
                                                        isAssistant={isAsst}
                                                        userQuestion={
                                                            isAsst && idx > 0
                                                                ? (messages[idx - 1]?.content ?? "")
                                                                : undefined
                                                        }
                                                    />
                                                </div>
                                                {isAsst && !isLoading && m.content.length > 10 && (
                                                    <>
                                                        <NCERTSourcesWidget sources={ncertSourcesMap.get(msgKey) ?? []} />
                                                        <ResponseActionBar content={m.content} section="conceptual" messageId={`msg-${idx}`} />
                                                        <ConfidenceMeter
                                                            chatId={activeProblemId ?? ""}
                                                            messageIdx={idx}
                                                            onLowConfidence={() => handleLowConfidence(idx)}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                                        <div className="flex justify-start">
                                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 flex gap-1.5">
                                                {[0, 150, 300].map(d => <div key={d} className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input area */}
                        <div className="shrink-0 bg-black border-t border-zinc-900 px-4 py-3">
                            {/* Uploaded image preview */}
                            {uploadedImage && (
                                <div className="max-w-3xl mx-auto flex items-center gap-2 px-1 mb-2 bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3">
                                    <img
                                        src={uploadedImage.preview}
                                        alt="Uploaded"
                                        className="h-12 w-12 object-cover rounded-lg shrink-0"
                                    />
                                    <span className="text-[12px] text-zinc-400 flex-1">Image attached — AI will explain & simulate this</span>
                                    <button
                                        type="button"
                                        onClick={() => setUploadedImage(null)}
                                        className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors shrink-0"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
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

                            <div className="mb-3 flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full whitespace-nowrap">
                                    ⚡ Competitive Mode — JEE/NEET depth
                                </span>
                            </div>

                            <form onSubmit={onSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
                                <button type="button" onClick={() => imgInputRef.current?.click()} disabled={isLoading}
                                    className={`p-2 rounded-xl transition-all shrink-0 ${uploadedImage ? "text-blue-400 bg-blue-500/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}
                                    title="Upload image for AI to explain & simulate">
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input ref={imgInputRef} type="file" accept="image/*" hidden onChange={handleCameraUpload} />
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading}
                                    className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all shrink-0">
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple hidden onChange={handleFiles} />
                                <input
                                    className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-full px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-zinc-600"
                                    value={input}
                                    placeholder="Ask any JEE/NEET question or upload a problem from your study material..."
                                    onChange={e => setInput(e.target.value)}
                                    disabled={isLoading}
                                />

                                <button type="submit" disabled={isLoading || (!input.trim() && attachments.length === 0)}
                                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40 transition-all shrink-0">
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
            </div>

            {activeConcept && (
                <ConceptSidebar conceptName={activeConcept.name} conceptClass={activeConcept.conceptClass}
                    conceptSubject={activeConcept.subject} onClose={() => setActiveConcept(null)} />
            )}
        </div>
    );
}

// Helper: does the problem chat have a title suggesting previous messages?
function problemChat_hasRecent(chat: any): boolean {
    return chat && (chat.messages?.length ?? 0) === 0 && !!chat.title && chat.title !== "New Problem";
}
