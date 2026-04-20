"use client";

import { useState } from "react";

interface VariantEntry {
  config?: Record<string, unknown>;
  variant_index: number;
  entry_state: string;
  approach_pill_label: string;
  state_sequence: string[];
  /** Phase 4: true when this entry came from concept JSON regeneration_variants
   *  (Type 1 — no fresh generation, only state_sequence + entryState change). */
  isJsonDriven?: boolean;
}

interface JsonVariant {
  variant_id: string;
  approach_pill_label: string;
  entry_state: string;
  state_sequence: string[];
}

interface SimulationSwitcherProps {
  /** The default simulation config (variant 0) */
  mainSimHtml: string;
  /** Pre-generated variant configs from the API (legacy thumbs-down flow) */
  cachedVariants: Array<{
    config: Record<string, unknown>;
    variant_index: number;
    entry_state: string;
    approach: string;
  }>;
  /** Phase 4: JSON-driven pill list from concept JSON regeneration_variants */
  jsonVariants?: JsonVariant[];
  /** 5D fingerprint key for the base simulation */
  baseCacheKey: string;
  conceptId: string;
  sessionId: string;
  /** Callback when active variant changes — parent swaps sim HTML + entry_state + state_sequence */
  onVariantChange: (variant: VariantEntry) => void;
  /** Callback to trigger generation — parent handles the API call and sim swap */
  onRequestNewVariant?: () => void;
  /** Whether generation is in progress */
  isGenerating?: boolean;
  /** Whether all variants have been exhausted */
  exhausted?: boolean;
}

export function SimulationSwitcher({
  mainSimHtml,
  cachedVariants,
  jsonVariants,
  baseCacheKey,
  conceptId,
  sessionId,
  onVariantChange,
  onRequestNewVariant,
  isGenerating = false,
  exhausted = false,
}: SimulationSwitcherProps) {
  const allVariants: VariantEntry[] = [
    {
      variant_index: 0,
      entry_state: "STATE_1",
      approach_pill_label: "Full explanation",
      state_sequence: [],
    },
    ...(jsonVariants ?? []).map((v, i) => ({
      variant_index: i + 1,
      entry_state: v.entry_state,
      approach_pill_label: v.approach_pill_label,
      state_sequence: v.state_sequence,
      isJsonDriven: true,
    })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabClick = (idx: number) => {
    setActiveIndex(idx);
    // Phase 4: JSON-driven (Type 1) pills only swap state_sequence + entryState.
    // They MUST NOT trigger any generation API call. Early return after onVariantChange
    // so no fall-through code can reach onRequestNewVariant or any signal/generate endpoint.
    if (allVariants[idx].isJsonDriven) {
      onVariantChange(allVariants[idx]);
      return;
    }
    onVariantChange(allVariants[idx]);
  };

  const formatLabel = (v: VariantEntry, i: number): string => {
    // Prefer the concept-JSON-authored label; it's already phrased for students
    // (e.g. "On an incline", "With friction"). Fall back to a descriptive default.
    if (v.approach_pill_label && v.approach_pill_label !== "Explanation 1") return v.approach_pill_label;
    if (i === 0 || v.variant_index === 0) return "Full explanation";
    return `Alternative view ${i}`;
  };

  return (
    <div style={{
      height: 38, borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: '#0c0c17', padding: '4px 10px',
      display: 'flex', gap: 5, alignItems: 'center',
      overflowX: 'auto', flexShrink: 0,
    }}>
      {allVariants.map((v, i) => (
        <button
          key={v.variant_index}
          onClick={() => handleTabClick(i)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 6, height: 30,
            border: activeIndex === i
              ? '0.5px solid rgba(99,102,241,0.35)'
              : '0.5px solid rgba(255,255,255,0.07)',
            background: activeIndex === i
              ? 'rgba(99,102,241,0.1)'
              : 'rgba(15,15,28,1)',
            cursor: 'pointer', whiteSpace: 'nowrap',
            fontSize: 10, fontWeight: activeIndex === i ? 500 : 400,
            color: activeIndex === i
              ? '#c7d2fe'
              : 'rgba(232,230,240,0.4)',
            transition: 'all 0.15s',
            fontFamily: 'inherit',
          }}
        >
          {formatLabel(v, i)}
        </button>
      ))}
      {!exhausted && onRequestNewVariant && !jsonVariants?.length && isGenerating && (
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginLeft: 4, fontFamily: 'monospace' }}>
          generating…
        </div>
      )}
    </div>
  );
}
