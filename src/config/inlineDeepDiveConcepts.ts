// Feature flag: concepts for which "Explain step-by-step" renders as
// inline sub-pills in the state strip instead of opening DeepDiveModal.
//
// Rollout plan: one concept at a time, after the inline UX is validated
// in the browser for that concept. Remove the modal entirely once every
// concept with allow_deep_dive has been promoted to the inline path.
//
// See plan: `~/.claude/plans/pls-proceed-polished-newt.md` (Phase D UX).

export const INLINE_DEEP_DIVE_CONCEPTS = new Set<string>([
  'normal_reaction',
]);

export function usesInlineDeepDive(conceptId: string | undefined | null): boolean {
  if (!conceptId) return false;
  return INLINE_DEEP_DIVE_CONCEPTS.has(conceptId);
}
