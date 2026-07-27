# Founder-proxy — Checkpoint C (Handover Gate) — `ac_power_factor` (Ch.7 §7.7, `ac_power`, 10 states)

**Founder asleep — proceeding autonomously.** Every claimed A/B fix diffed against the real commits (`9df14e3` build, `f997ede` fix bundle); scar schema validated against the LIVE `supabase_migrations/` CHECK; coherence diffed against the 5 sealed siblings. Orchestrator-persisted verbatim.

## VERDICT: **SEALED**
Every claimed Checkpoint-A/B fix landed in the real commits — no silent skips. All 5 scar rows + the Stage-6 directive are schema-valid against the live table. Cross-concept coherence with the 5 sealed siblings intact. Packet complete (7/7). Physics 100% correct — no ESCALATE. Shipping stays founder-only (Rule 17).

## Gate 1 — Claimed-fix diff (all landed)
| Fix | Landed (evidence) |
|---|---|
| **F1** (blocking) | `f997ede` @~29820-29831: removed `naive=Number(Vrms.toFixed(2))*Number(Irms.toFixed(3))`; now `chip = "V_rms × I_rms = " + phys.S.toFixed(2) + " W?"` struck. phys.S=5.547→5.55, identical to S8 leg/ratio/narration. |
| **F4b** | gate `explore \|\| wave_sinks` (S3 auto-fits [P−S,P+S]±10%); PWR_COL_RET 0.50→0.78 alpha; product_wave fixed range untouched. |
| **F4a** | new `pwrFxZero(v,dp)` clamps |v|<0.5·10⁻ᵈᵖ→0; applied to ipar/iperp HUD. "−0.000 A" gone; legit signs kept. |
| **F4d** | wattmeter label scale 0.24→0.34. |
| **F3** | `close_chip` grepped absent from ac_power_factor.json (untracked, working-tree end-state = absent). |
| **Design-doc 0.785→0.784** | physics_block §4.1 "⚠ ORCHESTRATOR CORRECTION" note + CpA "⚠ SELF-CORRECTION" note both landed. |

**CpA advisories survived:** A2 (S CORE at S4, VA-triangle-leg S8-only) ✓; A3 (s6_4 guard clause verbatim, S10 hud_show_p true→25 W) ✓; A5 ("Q factor" only in non-rendered prohibition metadata; S8 renders "reactive power Q (VAR)") ✓; A8 (I_rms 3dp 0.784) ✓. No claimed fix failed. No silent skip.

## Gate 2 — Scar-schema validation (LIVE CHECK)
severity ∈ (CRITICAL,MAJOR,MODERATE) — 0 MINOR ✓; owner_cluster valid (renderer_primitives/physics_author/json_author) ✓; probe_type js_eval/manual ✓; row_type incident/directive ✓; status FIXED/OPEN ✓; 13 cols=13 values ✓; TEXT[] never NULL (directive uses ARRAY[]::text[]) ✓; bug_class unique, no prior-block collision ✓. The 5 ac_power_factor rows + the Stage-6 compose-rule-of-four directive are APPLY-clean.

## Gate 3 — Cross-concept coherence (INTACT)
Number lock byte-identical to series_lcr (vₘ 10.0/f 0.25/R 5.0/L 3.1831/C 0.1273, shared f_demo); default=resonance cosφ=1 P=10 W = the resistor concept's ⟨p⟩ (consistent callback); ⟨p⟩=0 wattless callbacks consistent; impedance→power triangle inherits series_lcr (≥12px vertex margins close the slcr clip in-clone); fan inherits phasors; colour law cyan=V/amber=i + new coral #FF6E40 (25° from amber); withholding discipline — the power face is this sim's front door, no settled mechanism re-taught. No contradiction.

## Gate 4 — Packet complete
7/7 artifacts under docs/loop_runs/ch7/ac_power_factor/ (skeleton, physics_block, checkpointA, auditor, eye_walker, checkpointB, checkpointB_cycle1). Engine log Stage 6 + 6b match the real commit diff-stats (f997ede +26/−10; 9df14e3 +991/−2 + deriveStateMeta +41/−1).

## Founder-packet sentence
**Is `ac_power_factor` the highest-value version achievable within loop authority? — YES.** Both 16a pivots land wrong-consequence-first, the S5 primary aha reproduces the meter's 3.08 W three independent ways, the S6 paradox (more amps/fewer watts) is exact, and the flagship-pivot self-contradiction (5.54 vs 5.55) was caught and fixed to read one canonical value everywhere. The one residual is intrinsic, not a defect: a teacher who manually computes 7.07×0.784 gets 5.54 while every surface reads 5.55 (I_rms=0.784498 honestly displays 0.784; S drawn from full precision). Eliminating it needs nudging a default to force I_rms=0.785 — rejected at CpB as too fragile (0.7845 boundary re-ripples the lattice). The symbolic-operand fix is the correct highest-quality resolution within loop authority.

## Gate 5 — Handover items for the founder
1. **F4c hue nudge (P3, deferred):** S5/S6 coral i∥ vs amber i — distinguishable + labeled at review scale; one-line nudge on founder fullscreen preference.
2. **Residual 3dp artifact (accepted, intrinsic):** the 5.54-vs-5.55 teacher-mental-math gap. No action; documented.
3. **NEW — non-rendered 0.785 staleness (invisible, next-touch cleanup):** three internal surfaces still carry 0.785 — epic_l_path annotations `s4_mid_label`/`s6_mid_label` (field_3d ignores epic_l annotations, non-rendered) + assessment Q2 stem "0.785 A" (dormant quiz, not on canvas). Zero visible impact. **CAUTION:** a blind 0.785→0.784 sweep of Q2 would break the quiz-answer arithmetic (0.784²·5=3.07≠3.08) — needs care, deferred to next touch, NOT done at seal.
4. **5 scar rulings + compose-rule-of-four directive** (files only): F1 MAJOR FIXED, design-numberlock directive MODERATE OPEN, F4b/F4a/F3 MODERATE FIXED, compose-4× MODERATE OPEN.
5. **curriculum_tags:** CBSE/JEE verified (founder-as-in-trial-authority, S8 triangle sub-cell needs_teacher_verification); CAIE partial + IGCSE/IB/AP/Ontario all needs_teacher_verification.
6. **Runaway guard: engine-loop commit count now 18** — past the §3b 8-commit guard, under the whole-chapter grant + the explicit "do ac_power_factor too" directive. Confirm the grant before lc_oscillations (#7) pushes toward ~20+.
7. **Standing items:** (a) `.agents/founder_proxy/CLAUDE.md` stale severity enum (says CRITICAL/MODERATE/MINOR; live is CRITICAL/MAJOR/MODERATE — spec fix owed); (b) colour-law/ac_inductor reconciliation pending; (c) slcr S7 down-leg-clip scar OPEN on the sealed original (closed in-clone here).

## ≤5 key frames (post-fix run 20260724-091141)
1. STATE_4__frozen — F1 resolved (struck "V_rms × I_rms = 5.55 W?" over "3.08 / 5.55 = 0.555"; 5.54 gone).
2. STATE_9__frozen — cross-state 5.55 ("5.55 × 0.555 = 3.08 W").
3. STATE_3__frozen — F4b prominent returned lobe.
4. STATE_10__frozen — F4a "0.000 A" clean + explore CORE-only + 5 sliders.
5. STATE_8__frozen — "S = 5.55 VA"/"Q = 4.62 VAR", S²=P²+Q² symbolic-only, "reactive power Q (VAR)" (A5).

**Verdict: SEALED.** On SEALED the orchestrator does the surgical commit + state advance to `lc_oscillations` (#7).
