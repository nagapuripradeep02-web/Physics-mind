/**
 * Tier-based failure classification.
 *
 * Tier A+B failure → FATAL (abort session)
 * Tier C failure   → DEGRADED (static fallback, continue)
 * Tier D failure   → SILENT_FALLBACK (TTS→captions, sliders→disabled)
 * Tier E failure   → SKIP_FEATURE (serve baseline EPIC-L)
 * Tier F failure   → SILENT_LOG (never visible to student)
 */

import type { EngineTier } from '../types';

export type FailureAction = 'fatal' | 'degraded' | 'silent_fallback' | 'skip_feature' | 'silent_log';

const TIER_TO_ACTION: Record<EngineTier, FailureAction> = {
  A: 'fatal',
  B: 'fatal',
  C: 'degraded',
  D: 'silent_fallback',
  E: 'skip_feature',
  F: 'silent_log',
};

export interface FailureRecord {
  engineId: string;
  tier: EngineTier;
  action: FailureAction;
  error: Error;
  timestamp: number;
}

export class FailurePolicy {
  private failures: FailureRecord[] = [];

  classify(tier: EngineTier): FailureAction {
    return TIER_TO_ACTION[tier];
  }

  handleFailure(engineId: string, tier: EngineTier, error: Error): FailureRecord {
    const action = this.classify(tier);
    const record: FailureRecord = {
      engineId,
      tier,
      action,
      error,
      timestamp: Date.now(),
    };
    this.failures.push(record);
    return record;
  }

  isFatal(tier: EngineTier): boolean {
    return tier === 'A' || tier === 'B';
  }

  getFailures(): readonly FailureRecord[] {
    return this.failures;
  }

  hasFatalFailure(): boolean {
    return this.failures.some((f) => f.action === 'fatal');
  }

  clear(): void {
    this.failures = [];
  }
}
