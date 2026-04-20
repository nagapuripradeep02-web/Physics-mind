/**
 * Engine 14: Misconception Detection Engine
 *
 * Pipeline per CLAUDE.md §21:
 *   1. Exact substring match (case-insensitive) against trigger_phrases[]
 *   2. Fuzzy match via normalized Levenshtein distance < 0.3
 *   3. Novel → engine returns matched=false; live-path may call Haiku offline
 *
 * Exact beats any fuzzy. When multiple branches match fuzzy, the lowest
 * normalized distance wins; ties broken by branch declaration order.
 */

import type { Engine, SimSession, SimEvent } from '../types';

export type MatchType = 'exact' | 'fuzzy' | 'novel' | 'none';

export interface MisconceptionBranch {
  branchId: string;
  triggerPhrases: string[];
  misconception?: string;
}

export interface MisconceptionConfig {
  branches: MisconceptionBranch[];
}

export interface MisconceptionMatch {
  matched: boolean;
  branchId: string | null;
  confidence: number;
  matchType: MatchType;
}

export interface MisconceptionState {
  lastMatch: MisconceptionMatch | null;
}

const FUZZY_THRESHOLD = 0.3;

/**
 * Classic Wagner-Fischer Levenshtein distance.
 * Returns the minimum number of single-character edits to transform a → b.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      if (a.charCodeAt(i - 1) === b.charCodeAt(j - 1)) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Normalized Levenshtein in [0, 1]: distance / max(len(a), len(b)).
 * Empty strings return 0 when both empty, 1 otherwise.
 */
export function normalizedLevenshtein(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 0;
  return levenshtein(a, b) / max;
}

export class MisconceptionDetectionEngine implements Engine<MisconceptionConfig, MisconceptionState> {
  readonly id = 'misconception-detection';
  readonly dependencies: string[] = [];

  private config: MisconceptionConfig | null = null;
  private session: SimSession | null = null;
  private state: MisconceptionState = { lastMatch: null };

  async init(config: MisconceptionConfig, session: SimSession): Promise<MisconceptionState> {
    this.config = config;
    this.session = session;
    this.state = { lastMatch: null };
    return this.state;
  }

  async reset(): Promise<void> {
    this.state = { lastMatch: null };
  }

  async destroy(): Promise<void> {
    this.state = { lastMatch: null };
    this.config = null;
    this.session = null;
  }

  detect(studentText: string): MisconceptionMatch {
    if (!this.config || !studentText || studentText.trim().length === 0) {
      return this.record({ matched: false, branchId: null, confidence: 0, matchType: 'none' });
    }

    const normalized = studentText.toLowerCase().trim();

    // Stage 1 — exact substring match in declaration order
    for (const branch of this.config.branches) {
      for (const phrase of branch.triggerPhrases) {
        const p = phrase.toLowerCase().trim();
        if (p.length === 0) continue;
        if (normalized.includes(p)) {
          return this.record({
            matched: true,
            branchId: branch.branchId,
            confidence: 1.0,
            matchType: 'exact',
          });
        }
      }
    }

    // Stage 2 — fuzzy: lowest normalized distance per-phrase across all branches.
    // Ties broken by declaration order (first branch wins).
    let bestDistance = Infinity;
    let bestBranchId: string | null = null;
    for (const branch of this.config.branches) {
      for (const phrase of branch.triggerPhrases) {
        const p = phrase.toLowerCase().trim();
        if (p.length === 0) continue;
        const dist = normalizedLevenshtein(normalized, p);
        if (dist < bestDistance) {
          bestDistance = dist;
          bestBranchId = branch.branchId;
        }
      }
    }

    if (bestBranchId !== null && bestDistance < FUZZY_THRESHOLD) {
      return this.record({
        matched: true,
        branchId: bestBranchId,
        confidence: 1 - bestDistance,
        matchType: 'fuzzy',
      });
    }

    return this.record({ matched: false, branchId: null, confidence: 0, matchType: 'none' });
  }

  getLastMatch(): MisconceptionMatch | null {
    return this.state.lastMatch;
  }

  onEvent(_event: SimEvent): void {
    // No event-driven behavior. Engine is queried directly via detect().
  }

  private record(match: MisconceptionMatch): MisconceptionMatch {
    this.state.lastMatch = match;
    return match;
  }
}
