# PHYSICS BLOCK — `kirchhoff_loop_rule_KVL`

*(companion to `kirchhoff_loop_rule_KVL-architect.md`; json_author reads BOTH.)*

## Verified numbers (Python-checked; ε locked, I=ε/ΣR, Vₖ=IRₖ, ΣV=ε−ΣVₖ=0)
- **S1/S2 baseline** ε=6V, R1=2Ω, R2=1Ω → I=2A, V1=4V, V2=2V. ΣV: +6−4−2=0. "6 = 4 + 2".
- **S3** R2 1→4Ω (R1 stays 2) → I=1A, V1=2V (**falls** 4→2), V2=4V (**rises** 2→4) — drops SWAP, sum still 6. Ghost = FIXED string "6 + 4 + 2 = 12" (pinned to ORIGINAL 4/2 split + all-positive; never recomputed). Real "+6 − 4 − 2 = 0".
- **S4 primary (3-resistor)** R3=3Ω, R1=2,R2=1 → I=1A, V1=2, V2=1, V3=3, sum 6. "1.5+... " no — "+6 − 2 − 1 − 3 = 0".
- **S4 fallback (2-resistor)** stay R1=2,R2=1 (I=2,V1=4,V2=2) + morph formula `ε=IR₁+IR₂` → `ΣV=0` (formula-generalize archetype).
- **Assessment** ideal 12V + 4Ω&2Ω series → I=2A, 8V+4V, +12−8−4=0.

## Variables (documentary; renderer computes natively — adapter siblings cKvlR1/R2/R3/Emf/Currents)
| var | unit | min | max | default | role |
|---|---|---|---|---|---|
| epsilon | V | 3 | 12 | 6 | locked via variable_overrides on S1–S4; live ONLY in S5. Never a guided teaching target. |
| R1 | Ω | 1 | 8 | 2 | locked on S1/S2/S4; fixed on S3 during cue but slider visible+live post-reveal; live S5. |
| R2 | Ω | 1 | 8 | 1 | locked on S1/S2/S4; S3 = scripted autosweep 1→4 (cue `r2_grow`) then live post-reveal; live S5. |
| R3 | Ω | 1 | 8 | 3 | inert/undrawn S1–S3; drawn via cue `r3_draw_in` + locked to 3 on S4; live S5. Gate on scene flag `three_resistor`. |
| I | A | — | — | derived | `three_resistor ? ε/(R1+R2+R3) : ε/(R1+R2)`. Single value everywhere (series loop, no junction). Bead speed ∝ I. |
| V1/V2/V3 | V | — | — | derived | Vₖ=IRₖ; V3=0 unless three_resistor. Each drives its voltmeter + a ladder down-step. |
| kvl_sum | V | — | — | derived | `ε − V1 − V2 (− V3)` MUST equal 0.0 every instant/state/setting — this IS the taught rule. Drives sum HUD + ladder closing-to-baseline. |

Scene flags (NOT variables, sibling of KCL's three_branch/ghost_text/kcl_sum_readout): `three_resistor:bool`, `kvl_sum_readout:bool`, `ghost_text:string`(fixed), plus per-state ladder/voltmeter/cue flags.

## Constraints
- ΣV=0 EXACTLY at every setting (definition of the rule, not a coincidence). V1+V2(+V3)=ε always.
- S3 R2 change REDISTRIBUTES drops (V1↔V2 swap) but never the SUM (Rule 32b invariant).
- I is the SAME single number everywhere (series loop — no split; the sibling contrast to KCL's parallel).
- R∈[1,8]Ω, ε∈[3,12]V → I∈[0.375,6]A; no div-by-zero/negative.
- S3 ghost "6 + 4 + 2 = 12" FIXED authored string pinned to ORIGINAL split — never recomputed, never allowed to equal the real sum.
- H/L sign tags (rise source L→H; drop resistor H→L along current) = fixed geometry, appear S3+, persist S4/S5; only MAGNITUDES respond to sliders.
- ε NEVER a slider in guided states (locked overrides); live only S5. Voltmeters I·Rₖ ("4.0 V", currents "2.00 A").
- R3 element NOT rendered before S4 (Rule 32d — S4 only ADDS R3).
- **Optional `r` slider EXCLUDED from S5 this ship** (would force S1–S4's ε=IΣR to become approximate + need a second engine capability; internal_resistance owns that idea). Documented for quality_auditor.

## Per-state variable_overrides (Rule 25d)
- **S1** `{epsilon:6, R1:2, R2:1, three_resistor:false}` — numbers computed but NOT shown (traversal only).
- **S2** `{epsilon:6, R1:2, R2:1, three_resistor:false}` — clean baseline for the staircase; no live control.
- **S3** `{epsilon:6, R1:2, R2:1, three_resistor:false}` entry, cue `r2_grow` sweeps R2 1→4; R1/R2 live AFTER reveal.
- **S4** `{epsilon:6, R1:2, R2:1, R3:3}` entry starts three_resistor:false (R3 not drawn) → cue `r3_draw_in` flips true. No live control. FALLBACK: stay three_resistor:false throughout + formula-generalize.
- **S5** none (schema defaults ε=6,R1=2,R2=1,R3=3,three_resistor:true); all sliders live.

## Within-state timeline (cause-first per Rule 32a; all *_at_ms are THE EYE fallback, production re-anchored via scenario_cue)
- **S1 (~14s):** 0–800 home pose (beads circulating); 800–2200 marker walks loop, ladder traces UP +ε / DOWN R1 / DOWN R2 in lockstep, lands at start height (unlabeled); 2200+ loops continuously. Controls: none.
- **S2 (~15s):** 0–1200 numbered ladder + 0V baseline tick; cue `riser_up`@1200 → +6V riser, cell voltmeter→6.0; beat; cue `step_r1`@2700 → −4V step, voltmeter→4.0; beat; cue `step_r2`@4200 → −2V step, voltmeter→2.0, ladder lands at 0; 5000–5800 sum "6 = 4 + 2" composes; hold. Controls: none.
- **S3 (~18s):** 0–1000 home pose (6/4/2 closing ladder); cue `r2_grow`@1000 → R2 box grows 1→4 (CAUSE); beat 2200–2900; 2900–4100 beads slow (I 2→1), ladder redistributes LIVE (V1 4→2 falls, V2 2→4 rises), still lands 0; cue `ghost_strike`@4100 → naive "6 + 4 + 2 = 12 ✗" shoots up struck-through, real "+6 − 4 − 2 = 0 ✓" pins at baseline, H/L tags fade in; 5000+ hold, R1/R2 sliders live. Controls: R1, R2 (post-reveal).
- **S4 (~15s):** 0–900 home pose (familiar 2-step ladder); cue `r3_draw_in`@900 → R3 draws in (CAUSE); beat; 2400–3600 beads slow (I 2→1), ladder RE-TRACES 3 down-steps (2/1/3), lands 0; 3600–4400 formula flips `ε=IR₁+IR₂` → `ΣV=0`; hold. Controls: none. FALLBACK: cue `formula_generalize`@900 expands `ε=IR₁+IR₂`→`ΣV=0` (bracket-widen), ladder stays 2-step.
- **S5 (open):** continuous until trusted drag seizes; ladder/voltmeters/sum recompute live. Controls: ALL (ε,R1,R2,R3; show_sliders:true, interaction_complete).

**advance_mode:** manual_click ×4 + interaction_complete (≥2 distinct, Gate 12; no wait_for_answer, no pause_after_ms).

## Formula/HUD (Rule 34)
ONE math-serif Unicode formula surface: `ε = IR₁ + IR₂` (S2–S3) morphs to `ΣV = 0` (S4+), never both at once. Sum HUD = separate value-only zone `+6 − 4 − 2 = 0` (S3 ghost `6 + 4 + 2 = 12 ✗` struck, distinct zone, no collision). All Unicode (ε Σ Ω − ₁₂₃), 3 text paths.

## Drill-down clusters (migration only — DORMANT)
**leftover_voltage_after_drops:** "why does the loop end at exactly zero" / "shouldnt some voltage be left after both resistors" / "where does the leftover voltage go" / "does the loop always come back to zero exactly" / "why is nothing left over after crossing both resistors"
**all_voltages_added_positive:** "why cant i just add 6 plus 4 plus 2" / "i got 12 volts by adding all three is that wrong" / "why is the resistor drop negative in the equation" / "should i add or subtract the voltages around the loop" / "why does the sign flip for the resistor terms"
**second_emf_sign_in_loop:** "what if there are two batteries in the same loop" / "does the second emf add or subtract" / "how do i know the sign of the second cell" / "what happens if the two cells oppose each other" / "why would epsilon be negative in the loop equation"

## FLAGS to json_author / quality_auditor
1. Author S4 as **3-resistor primary** (R3=3); use the 2-resistor formula-generalize fallback ONLY if the 3rd ladder step is engine-non-trivial.
2. Engine adds needed (peter_parker via auditor): multi-step series ladder (2–3 down-steps), per-resistor voltmeters (cell + each R, labeled+signed), `kvl_sum_readout` HUD (sibling of kcl_sum_readout). S3 ghost reuses shipped `drawStruckTextC` (+ possible runaway-ladder trace variant). All gated → zero regression to emf_definition/internal_resistance/combination_of_resistors/electric_power.
3. `r` slider EXCLUDED from S5 (auditor: not silently dropped — see constraints).
4. quality_auditor: Gate-8 cluster-registry N/A-DORMANT; S4 fallback pre-authorized; re-run engine_bug_queue live.
