"use client";

import { useState } from "react";
import type { NCERTSource } from "@/lib/teacherEngine";

interface Props {
    sources: NCERTSource[];
}

function simColor(sim: number): string {
    if (sim >= 0.85) return "#22c55e"; // green
    if (sim >= 0.70) return "#eab308"; // yellow
    return "#ef4444";                  // red
}

function simLabel(sim: number): string {
    return `${(sim * 100).toFixed(0)}%`;
}

export default function NCERTSourcesWidget({ sources }: Props) {
    const [expanded, setExpanded] = useState(false);

    if (!sources.length) return null;

    return (
        <div
            style={{
                marginTop: "12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                overflow: "hidden",
                fontSize: "12px",
                fontFamily: "inherit",
            }}
        >
            {/* ── Toggle button ── */}
            <button
                onClick={() => setExpanded((v) => !v)}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 12px",
                    background: "#f8fafc",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "#64748b",
                    fontWeight: 500,
                }}
                aria-expanded={expanded}
            >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span role="img" aria-label="book">📚</span>
                    {sources.length} NCERT source{sources.length !== 1 ? "s" : ""}
                </span>
                <span
                    style={{
                        display: "inline-block",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 200ms ease",
                        fontSize: "10px",
                        color: "#94a3b8",
                    }}
                >
                    ▼
                </span>
            </button>

            {/* ── Source cards ── */}
            {expanded && (
                <div>
                    {sources.map((src, i) => (
                        <div
                            key={i}
                            style={{
                                padding: "10px 12px",
                                borderTop: "1px solid #f1f5f9",
                                background: "#fff",
                            }}
                        >
                            {/* Header row */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    gap: "8px",
                                    marginBottom: "5px",
                                }}
                            >
                                {/* Chapter + section */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            color: "#334155",
                                            display: "block",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {src.chapter_name}
                                    </span>
                                    {src.section_name && (
                                        <span style={{ color: "#94a3b8" }}>
                                            › {src.section_name}
                                        </span>
                                    )}
                                </div>

                                {/* Similarity % badge */}
                                <span
                                    style={{
                                        flexShrink: 0,
                                        fontWeight: 600,
                                        color: simColor(src.similarity),
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {simLabel(src.similarity)} match
                                </span>
                            </div>

                            {/* Similarity bar */}
                            <div
                                style={{
                                    width: "100%",
                                    height: "3px",
                                    background: "#f1f5f9",
                                    borderRadius: "2px",
                                    marginBottom: "7px",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${(src.similarity * 100).toFixed(0)}%`,
                                        height: "100%",
                                        background: simColor(src.similarity),
                                        borderRadius: "2px",
                                        transition: "width 300ms ease",
                                    }}
                                />
                            </div>

                            {/* Snippet */}
                            <p
                                style={{
                                    margin: 0,
                                    color: "#64748b",
                                    lineHeight: "1.5",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}
                            >
                                {src.snippet}
                                {src.snippet.length >= 250 && (
                                    <span style={{ color: "#94a3b8" }}> …</span>
                                )}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
