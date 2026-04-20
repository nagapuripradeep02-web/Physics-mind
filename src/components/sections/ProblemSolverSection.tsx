"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Camera, Paperclip, X, Eye, EyeOff } from "lucide-react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { MessageRenderer } from "@/components/MessageRenderer";
import ConceptSidebar from "@/components/ConceptSidebar";
import ResponseActionBar from "@/components/ResponseActionBar";
import { getModePromptSuffix } from "@/components/ModeToggle";
import ChatSkeleton from "@/components/ChatSkeleton";
import ElectronsWire from "@/components/animations/ElectronsWire";
import KCLJunction from "@/components/animations/KCLJunction";
import VoltageDrop from "@/components/animations/VoltageDrop";
import { useProfile } from "@/contexts/ProfileContext";
import { useChats, titleFromMessage, type ChatMode, type ChatMessage } from "@/contexts/ChatContext";

/* ── Helpers ──────────────────────────────────────────── */
function detectAnimation(text: string): "electrons" | "kcl" | "voltage" | null {
    const t = text.toLowerCase();
    if (t.includes("current") || t.includes("resistance") || t.includes("ohm")) return "electrons";
    if (t.includes("kcl") || t.includes("junction") || t.includes("kirchhoff")) return "kcl";
    if (t.includes("voltage") || t.includes("potential") || t.includes("circuit") || t.includes("emf")) return "voltage";
    return null;
}

interface ActiveConcept { name: string; conceptClass: string; subject: string; }

interface ProblemResponse {
    competitive: string;
    board: string;
}

/* ── Single message panel ─────────────────────────────── */
function ResponsePanel({
    label, content, isStreaming, section, messageId, onConceptClick,
}: {
    label: string; content: string; isStreaming: boolean; section: "competitive" | "board";
    messageId: string; onConceptClick: (name: string, cls: string, subj: string) => void;
}) {
    return (
        <div className="h-full flex flex-col bg-black overflow-hidden">
            <div className={`shrink-0 px-4 py-2 border-b text-[11px] font-bold tracking-widest uppercase ${section === "competitive"
                ? "bg-blue-500/5 border-blue-500/20 text-blue-400"
                : "bg-indigo-500/5 border-indigo-500/20 text-indigo-400"
                }`}>
                {label}
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 group">
                {content ? (
                    <>
                        <div className="text-[13px] leading-relaxed text-zinc-200">
                            <MessageRenderer content={content} onConceptClick={onConceptClick} />
                            {isStreaming && <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-1 rounded" />}
                        </div>
                        {!isStreaming && content.length > 10 && (
                            <ResponseActionBar content={content} section="solver" messageId={messageId} />
                        )}
                    </>
                ) : isStreaming ? (
                    <div className="flex gap-1.5 pt-2">
                        {[0, 150, 300].map(d => <div key={d} className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

/* ── Main ProblemSolverSection ────────────────────────── */
interface ProblemSolverSectionProps {
    isMobile?: boolean;
}

export default function ProblemSolverSection({ isMobile = false }: ProblemSolverSectionProps) {
    const { examMode, profile, addConcept, sessionConceptIds } = useProfile();
    const { activeProblemChat, activeProblemId, updateProblemChat, chatLoading, getProblemMessages, saveProblemMessages, loadProblemMessages } = useChats();

    const currentMode = 'jee';
    const [streamingMessages, setStreamingMessages] = useState<ChatMessage[] | null>(null);
    const contextMessages = activeProblemId ? getProblemMessages(activeProblemId) : [];
    const messages = streamingMessages ?? contextMessages;
    const [input, setInput] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const mode = "competitive" as ChatMode;
    const [visualOn, setVisualOn] = useState(true);
    const [animType, setAnimType] = useState<"electrons" | "kcl" | "voltage" | null>(null);
    const [activeConcept, setActiveConcept] = useState<ActiveConcept | null>(null);
    const [mobilePanelTab, setMobilePanelTab] = useState<"competitive" | "board">("competitive");
    const [mobileVizOpen, setMobileVizOpen] = useState(false);

    // Streaming state per panel
    const [competitiveResponse, setCompetitiveResponse] = useState("");
    const [boardResponse, setBoardResponse] = useState("");
    const [singleResponse, setSingleResponse] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [skeletonTimer, setSkeletonTimer] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    /* Sync messages from chat context */
    useEffect(() => {
        if (!activeProblemChat) return;
        setSkeletonTimer(true);
        const timeout = setTimeout(() => setSkeletonTimer(false), 1000);
        setStreamingMessages(null);
        setCompetitiveResponse("");
        setBoardResponse("");
        setSingleResponse("");
        if (activeProblemId) loadProblemMessages(activeProblemId);
        return () => clearTimeout(timeout);
    }, [activeProblemId]);

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        Array.from(e.target.files || []).forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => setAttachments(prev => [...prev, ev.target?.result as string]);
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    /** Stream from /api/chat, update setter incrementally, return full accumulated text */
    const streamResponse = async (
        userText: string,
        extraPrompt: string,
        setter: (v: string | ((p: string) => string)) => void,
        signal: AbortSignal
    ): Promise<string> => {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal,
            body: JSON.stringify({
                messages: [
                    ...messages.map(m => ({ role: m.role, content: m.content })),
                    { role: "user", content: userText }
                ],
                mode: currentMode,
                chatMode: mode,
                attachments, profile, moduleId: 1,
                extraSystemPrompt: extraPrompt,
            }),
        });
        if (!res.body) return "";
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            setter(prev => (typeof prev === "string" ? prev : "") + chunk);
        }
        return fullText;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && attachments.length === 0) return;
        const userText = input.trim();
        setInput("");
        setIsStreaming(true);
        setCompetitiveResponse("");
        setBoardResponse("");
        setSingleResponse("");

        const anim = detectAnimation(userText);
        if (anim) setAnimType(anim);

        const userMsg: ChatMessage = { role: "user", content: userText, timestamp: Date.now() };
        const currentMessages = contextMessages;
        const updatedMessages = [...currentMessages, userMsg];
        setStreamingMessages(updatedMessages);

        const ac = new AbortController();
        try {
            let assistantContent = "";
            if (mode === "both") {
                const compPrompt = getModePromptSuffix("competitive") +
                    `\nEnd with: "⏱ ~${Math.ceil(userText.length / 80 + 1)} min in exam" and a shortcut box.`;
                const boardPrompt = getModePromptSuffix("board") +
                    `\nEnd with: "Answer: [value with units]" and "Marks: Step 1(1m) Step 2(2m)..."`;
                const [compFull, boardFull] = await Promise.all([
                    streamResponse(userText, compPrompt, setCompetitiveResponse, ac.signal),
                    streamResponse(userText, boardPrompt, setBoardResponse, ac.signal),
                ]);
                assistantContent = `[Competitive]: ${compFull}\n\n[Board]: ${boardFull}`;
            } else {
                const modePrompt = getModePromptSuffix(mode) +
                    (mode === "competitive"
                        ? `\nEnd with: "⏱ ~${Math.ceil(userText.length / 80 + 1)} min in exam" and a shortcut tip.`
                        : `\nEnd with: "Answer: [value with units]" and marks allocation.`);
                assistantContent = await streamResponse(userText, modePrompt, setSingleResponse, ac.signal);
            }

            if (activeProblemId) {
                const finalMessages = [
                    ...updatedMessages,
                    { role: "assistant" as const, content: assistantContent, timestamp: Date.now() },
                ];
                await saveProblemMessages(activeProblemId, finalMessages);
                await updateProblemChat(activeProblemId, {
                    title: currentMessages.length === 0 ? titleFromMessage(userText) : (activeProblemChat?.title ?? titleFromMessage(userText)),
                });
            }
        } catch { }
        finally {
            setIsStreaming(false);
            setStreamingMessages(null);
        }
    };

    const handleConceptClick = (name: string, conceptClass: string, subject: string) => {
        setActiveConcept({ name, conceptClass, subject });
    };

    if (chatLoading || skeletonTimer) return <ChatSkeleton />;

    /* ── Visualization Panel (shared) ── */
    const VizPanel = () => (
        <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">
            <div className="shrink-0 px-4 py-2 border-b border-zinc-800 text-[11px] font-bold text-zinc-500 tracking-widest uppercase">
                Visualization
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
                {animType ? (
                    <div className="w-full h-48">
                        {animType === "electrons" && <ElectronsWire playing speed={1} />}
                        {animType === "kcl" && <KCLJunction playing speed={1} />}
                        {animType === "voltage" && <VoltageDrop playing speed={1} />}
                    </div>
                ) : (
                    <div className="text-center text-zinc-700">
                        <p className="text-2xl mb-2">🔬</p>
                        <p className="text-[12px]">Visualization appears after solving</p>
                    </div>
                )}
            </div>
        </div>
    );

    /* ── Toolbar ── */
    const Toolbar = () => (
        <div className="shrink-0 bg-zinc-950 border-b border-zinc-800 px-4 py-2 flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                ⚡ Competitive Mode — JEE/NEET preparation
            </span>
            <div className="ml-auto flex bg-zinc-900 rounded-xl p-0.5 border border-zinc-800">
                <button onClick={() => setVisualOn(true)}
                    className={`flex items-center gap-1 px-3 h-7 rounded-lg text-[12px] font-semibold transition-all ${visualOn ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                    <Eye className="w-3 h-3" />Visual
                </button>
                <button onClick={() => setVisualOn(false)}
                    className={`flex items-center gap-1 px-3 h-7 rounded-lg text-[12px] font-semibold transition-all ${!visualOn ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                    <EyeOff className="w-3 h-3" />Off
                </button>
            </div>
        </div>
    );

    /* ── Input bar ── */
    const InputBar = () => (
        <div className="shrink-0 bg-black border-t border-zinc-900 px-4 py-3">
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
            <form onSubmit={onSubmit} className="flex items-center gap-2">
                <button type="button" onClick={() => imgInputRef.current?.click()} disabled={isStreaming}
                    className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all shrink-0">
                    <Camera className="w-4 h-4" />
                </button>
                <input ref={imgInputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isStreaming}
                    className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all shrink-0">
                    <Paperclip className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple hidden onChange={handleFiles} />
                <input
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-full px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-zinc-600"
                    value={input}
                    placeholder="Ask any JEE/NEET question or upload a problem from your study material..."
                    onChange={e => setInput(e.target.value)}
                    disabled={isStreaming}
                />
                <button type="submit" disabled={isStreaming || (!input.trim() && attachments.length === 0)}
                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40 transition-all shrink-0">
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );

    /* ── Empty state messages ── */
    const emptySuggestions = [
        "JEE 2023: A wire of resistance 10Ω is bent into a circle. Find resistance between diametrically opposite ends.",
        "JEE Advanced: In a Wheatstone bridge P=Q=10Ω, R=5Ω, S=5Ω. Is it balanced? What's the galvanometer current?",
    ];

    /* ── MOBILE LAYOUT ── */
    if (isMobile || window?.innerWidth < 768) {
        return (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Toolbar />

                {visualOn && (
                    <div className="shrink-0">
                        <button onClick={() => setMobileVizOpen(o => !o)}
                            className="w-full px-4 py-2 text-[12px] text-zinc-500 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                            <span>🔬 Visualization</span>
                            <span>{mobileVizOpen ? "▲ collapse" : "▼ expand"}</span>
                        </button>
                        {mobileVizOpen && <div className="h-40 bg-zinc-950"><VizPanel /></div>}
                    </div>
                )}

                {mode === "both" && (
                    <div className="shrink-0 flex bg-zinc-900 border-b border-zinc-800">
                        {(["competitive", "board"] as const).map(tab => (
                            <button key={tab} onClick={() => setMobilePanelTab(tab)}
                                className={`flex-1 py-2 text-[12px] font-semibold transition-all capitalize ${mobilePanelTab === tab ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                                    }`}>
                                {tab === "competitive" ? "🏆 Competitive" : "📋 Board"}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto bg-black">
                    {mode === "both" ? (
                        <ResponsePanel
                            label={mobilePanelTab === "competitive" ? "🏆 COMPETITIVE" : "📋 BOARD"}
                            content={mobilePanelTab === "competitive" ? competitiveResponse : boardResponse}
                            isStreaming={isStreaming}
                            section={mobilePanelTab}
                            messageId={`mobile-${mobilePanelTab}`}
                            onConceptClick={handleConceptClick}
                        />
                    ) : (
                        <div className="group px-4 py-4">
                            {singleResponse ? (
                                <>
                                    <div className="text-[13px] leading-relaxed text-zinc-200">
                                        <MessageRenderer content={singleResponse} onConceptClick={handleConceptClick} />
                                        {isStreaming && <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-1 rounded" />}
                                    </div>
                                    {!isStreaming && <ResponseActionBar content={singleResponse} section="solver" messageId="single" />}
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center py-12">
                                    <EmptyState suggestions={emptySuggestions} onPick={setInput} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <InputBar />
                {activeConcept && <ConceptSidebar conceptName={activeConcept.name} conceptClass={activeConcept.conceptClass} conceptSubject={activeConcept.subject} onClose={() => setActiveConcept(null)} />}
            </div>
        );
    }

    /* ── DESKTOP: BOTH + VISUAL ── */
    if (mode === "both" && visualOn) {
        return (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Toolbar />
                <PanelGroup direction="horizontal" className="flex-1">
                    <Panel defaultSize={38} minSize={22}>
                        <div className="h-full flex flex-col">
                            <ResponsePanel label="🏆 COMPETITIVE" content={competitiveResponse} isStreaming={isStreaming} section="competitive" messageId="comp" onConceptClick={handleConceptClick} />
                        </div>
                    </Panel>
                    <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-blue-500 transition-colors cursor-col-resize" />
                    <Panel defaultSize={38} minSize={22}>
                        <div className="h-full flex flex-col">
                            <ResponsePanel label="📋 BOARD" content={boardResponse} isStreaming={isStreaming} section="board" messageId="board" onConceptClick={handleConceptClick} />
                        </div>
                    </Panel>
                    <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-blue-500 transition-colors cursor-col-resize" />
                    <Panel defaultSize={24} minSize={18}>
                        <VizPanel />
                    </Panel>
                </PanelGroup>
                <InputBar />
                {activeConcept && <ConceptSidebar conceptName={activeConcept.name} conceptClass={activeConcept.conceptClass} conceptSubject={activeConcept.subject} onClose={() => setActiveConcept(null)} />}
            </div>
        );
    }

    /* ── DESKTOP: SINGLE MODE ── */
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Toolbar />
            <PanelGroup direction="horizontal" className="flex-1">
                <Panel defaultSize={visualOn ? 70 : 100} minSize={50}>
                    <div className="h-full overflow-y-auto bg-black px-4 py-4 group">
                        {singleResponse ? (
                            <>
                                <div className="max-w-3xl mx-auto text-[13px] leading-relaxed text-zinc-200">
                                    <MessageRenderer content={singleResponse} onConceptClick={handleConceptClick} />
                                    {isStreaming && <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-1 rounded" />}
                                </div>
                                {!isStreaming && <ResponseActionBar content={singleResponse} section="solver" messageId="single" />}
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <EmptyState suggestions={emptySuggestions} onPick={setInput} />
                            </div>
                        )}
                    </div>
                </Panel>
                {visualOn && (
                    <>
                        <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-blue-500 transition-colors cursor-col-resize" />
                        <Panel defaultSize={30} minSize={20}>
                            <VizPanel />
                        </Panel>
                    </>
                )}
            </PanelGroup>
            <InputBar />
            {activeConcept && <ConceptSidebar conceptName={activeConcept.name} conceptClass={activeConcept.conceptClass} conceptSubject={activeConcept.subject} onClose={() => setActiveConcept(null)} />}
        </div>
    );
}

function EmptyState({ suggestions, onPick }: { suggestions: string[]; onPick: (s: string) => void }) {
    return (
        <div className="text-center max-w-md w-full">
            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
            </div>
            <h2 className="text-[14px] font-semibold text-zinc-200 mb-1">Competitive</h2>
            <p className="text-[12px] text-zinc-500 mb-4">Ask JEE/NEET questions, paste problems, or upload your study material.</p>
            <div className="flex flex-col gap-2 text-left">
                {suggestions.map(s => (
                    <button key={s} onClick={() => onPick(s)}
                        className="text-left text-[12px] px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all leading-relaxed">
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}
