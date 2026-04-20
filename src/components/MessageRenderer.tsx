"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";


interface MessageRendererProps {
    content: string;
    onConceptClick?: (name: string, conceptClass: string, subject: string) => void;
    /** The user's question that triggered this assistant response */
    userQuestion?: string;
    /** Whether this is an assistant message (simulation only shows for assistant) */
    isAssistant?: boolean;
}

const CONCEPT_TAG_REGEX = /\[CONCEPT:\s*([^|]+?)\s*\|\s*class:\s*([^|]+?)\s*\|\s*subject:\s*([^\]]+?)\s*\]/g;

// Custom markdown components for better styling
const markdownComponents = {
    // Section headings (e.g. ⚡ [CONCEPT NAME])
    h2: ({ children }: any) => (
        <h2 className="text-blue-400 font-bold text-base mt-4 mb-2">{children}</h2>
    ),
    h3: ({ children }: any) => (
        <p className="text-[13px] font-semibold text-zinc-300 mt-3 mb-1">{children}</p>
    ),
    table: ({ children }: any) => (
        <table className="w-full border-collapse my-3 border border-zinc-700">
            {children}
        </table>
    ),
    thead: ({ children }: any) => (
        <thead className="bg-zinc-800/50">
            {children}
        </thead>
    ),
    th: ({ children }: any) => (
        <th className="border border-zinc-700 px-3 py-2 text-left text-zinc-200 font-semibold text-sm">
            {children}
        </th>
    ),
    td: ({ children }: any) => (
        <td className="border border-zinc-700 px-3 py-2 text-zinc-300 text-sm">
            {children}
        </td>
    ),
    tbody: ({ children }: any) => (
        <tbody className="[&>tr:nth-child(odd)]:bg-zinc-900/20">
            {children}
        </tbody>
    ),
    code: ({ node, inline, children, ...props }: any) => {
        if (inline) {
            return <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-blue-300 font-mono text-[13px]">{children}</code>;
        }
        return (
            <code className="block bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-[13px] text-zinc-300 overflow-x-auto my-2" {...props}>
                {children}
            </code>
        );
    },
    strong: ({ children }: any) => (
        <strong className="font-bold text-zinc-50">{children}</strong>
    ),
    hr: () => (
        <hr className="border-t border-gray-700 my-4" />
    ),
};

function parseConceptTags(
    text: string,
    onConceptClick?: (name: string, cls: string, subject: string) => void
): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    CONCEPT_TAG_REGEX.lastIndex = 0;

    while ((match = CONCEPT_TAG_REGEX.exec(text)) !== null) {
        const [full, name, cls, subject] = match;

        // Text before tag
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Concept pill
        parts.push(
            <button
                key={`concept-${match.index}`}
                onClick={() => onConceptClick?.(name.trim(), cls.trim(), subject.trim())}
                className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400/50 rounded-full text-xs font-semibold transition-all cursor-pointer"
                title={`Class ${cls} ${subject}`}
            >
                <span className="text-[10px]">↗</span>
                {name.trim()}
            </button>
        );

        lastIndex = match.index + full.length;
    }

    // Remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}

export function MessageRenderer({ content, onConceptClick, userQuestion, isAssistant }: MessageRendererProps) {

    // If content has concept tags, pre-process them
    const hasTags = CONCEPT_TAG_REGEX.test(content);
    CONCEPT_TAG_REGEX.lastIndex = 0;




    if (!hasTags || !onConceptClick) {
        // Simple render without concept tag interactivity
        return (
            <>
                <div className="leading-relaxed text-[15px] prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 pb-1">
                    <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>
                        {content}
                    </ReactMarkdown>
                </div>

            </>
        );
    }

    // Replace concept tags with placeholder, render markdown, then re-inject pills
    // Strategy: split on concept tags and render each segment as markdown + pills
    const segments: Array<{ type: "text" | "concept"; value: string; cls?: string; subject?: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    CONCEPT_TAG_REGEX.lastIndex = 0;

    while ((match = CONCEPT_TAG_REGEX.exec(content)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ type: "text", value: content.slice(lastIndex, match.index) });
        }
        segments.push({ type: "concept", value: match[1].trim(), cls: match[2].trim(), subject: match[3].trim() });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
        segments.push({ type: "text", value: content.slice(lastIndex) });
    }

    return (
        <>
            <div className="leading-relaxed text-[15px] prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 pb-1">
                {segments.map((seg, i) => {
                    if (seg.type === "concept") {
                        return (
                            <button
                                key={i}
                                onClick={() => onConceptClick(seg.value, seg.cls!, seg.subject!)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400/50 rounded-full text-xs font-semibold transition-all cursor-pointer not-prose"
                                title={`Class ${seg.cls} ${seg.subject}`}
                            >
                                <span className="text-[10px]">↗</span>
                                {seg.value}
                            </button>
                        );
                    }
                    return (
                        <ReactMarkdown key={i} remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>
                            {seg.value}
                        </ReactMarkdown>
                    );
                })}
            </div>

        </>
    );
}
