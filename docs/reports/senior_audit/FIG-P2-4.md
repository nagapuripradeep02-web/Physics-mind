# FIG-P2-4 — Physics-II figure review (pngs.txt lines 63–83, 21 figures)

Reviewer pass: each PNG read against its card JSON (the `answer.steps[]` entry with
`kind == "diagram"`), its `lines` / `why` / `common_mistakes` / `margin_note`, and the card's
`question_text`. Handwriting font and small aesthetic differences are NOT flagged.

| png | question_id | step_id | verdict | what is wrong | what it should show |
|---|---|---|---|---|---|
| fig_66 | ts_ipe_p2_sem_semiconductor_as_half_wave_rectifier | s2_circuit | OK | — | Transformer P/S, single diode D in series with the load across the secondary. Diode triangle points right, towards the load, exactly as `common_mistakes` demands. AC source sits in the primary loop. |
| fig_67 | ts_ipe_p2_sem_semiconductor_as_half_wave_rectifier | s3_waveforms | OK | — | Input full sine; output = positive humps with flat-zero gaps, on a shared time axis. Matches "hump, gap, hump, gap". |
| fig_68 | ts_ipe_p2_sem_transistor_and_its_working | s3_pnp_figure | OK | — | p-n-p slab; the left battery's long (+) plate faces the p emitter, so the emitter junction is forward biased; the right battery presents its short (−) plate to the p collector, so the collector junction is reverse biased. Both lead arrows point right — current INTO the emitter, OUT of the collector — correct for p-n-p. |
| fig_69 | ts_ipe_p2_sem_transistor_and_its_working | s5_npn_figure | OK | — | Identical figure with n-p-n regions and BOTH battery polarities flipped (emitter side −, collector side +), arrows reversed (current OUT of the emitter, INTO the collector). Correct for n-p-n and correct as the "same picture, every polarity flipped" contrast. |
| fig_7 | ts_ipe_p2_cur_kirchhoff_laws_wheatstone_bridge | s2_junction_figure | OK | — | Five branches at one junction: the I₁, I₂, I₃ arrowheads point IN, I₄ and I₅ point OUT. Matches I₁ + I₂ + I₃ = I₄ + I₅. |
| fig_8 | ts_ipe_p2_cur_kirchhoff_laws_wheatstone_bridge | s4_loop_figure | OK | — | Single loop, cell ε (long plate = +, on the bottom rail) with R₁, R₂, R₃. The marked current arrow on the top wire points left, which is the direction conventional current actually takes out of the drawn + terminal — arrow and polarity agree. |
| fig_9 | ts_ipe_p2_cur_kirchhoff_laws_wheatstone_bridge | s5_bridge_figure | OK | — | Diamond A–C–B–D with P (AC), Q (CB), R (AD), S (DB) and G across the CD diagonal. Arm lettering matches s6/s7 exactly (i₁ in P, i₂ in R, i₃ in Q, i₄ in S, giving P/Q = R/S). The cell and key are deliberately deferred to the next step per the margin note — not a defect, but nothing in the figure shows the supply. |
| fig_70 | ts_ipe_p2_sem_transistor_circuit_symbols | s1_npn_symbol | OK | — | n-p-n symbol: the arrow is on the emitter lead and points AWAY from the base. Collector / Base / Emitter each labelled on their own lead. |
| fig_71 | ts_ipe_p2_sem_transistor_circuit_symbols | s2_pnp_symbol | OK | — | Same body, arrow reversed to point TOWARDS the base. This is the correct pair, and correctly NOT the swapped page-54 figure the card warns about. |
| fig_72 | ts_ipe_p2_sem_zener_diode_as_voltage_regulator | s2_symbol | OK | — | Diode triangle with the Z-bent bar, the two bends going opposite ways; p on the anode lead, n on the cathode lead. |
| fig_73 | ts_ipe_p2_sem_zener_diode_as_voltage_regulator | s3_circuit | OK | — | Supply (long / + plate on the top rail) into a series R_s in the top line, zener across the load. The zener triangle points UP with its bar facing the positive rail, i.e. reverse biased, exactly as `common_mistakes` requires. Load in parallel with the zener, V_o taken across it. |
| fig_74 | ts_ipe_p2_wav_closed_pipe_harmonics | s2_figure | WRONG-LABEL | The node at the closed end is lettered **"n"** and the antinode **"an"**. `n` is the symbol this same card uses for FREQUENCY throughout (n₁ = v/4l, n₃ = 3n₁, n₁ : n₃ : n₅ = 1 : 3 : 5), so the figure letters a node with the frequency symbol. It is also inconsistent with fig_79 in the same chapter, which correctly uses **N** and **AN**. Secondary: the two envelope curves are drawn almost straight (control point (170,60) on a 55→80 span), so the loop reads as a plain wedge rather than a quarter-wave bulge. | Antinode marked **A** (or AN) at the open end and node marked **N** at the wall, with a visibly curved quarter-wave envelope — wide at the open end, tapering to the node. The pipe geometry itself (open left, wall right, l = λ₁/4 arrow) is correct. |
| fig_75 | ts_ipe_p2_wav_doppler_observer_moving | s2_figure | OK | — | S fixed, observer moving O → O′; three consistent distances (L = 250 px, L − V₀T = 180 px, V₀T = 70 px, and 180 + 70 = 250). The V₀T arrow points from O towards S — observer approaching, as the derivation assumes. |
| fig_76 | ts_ipe_p2_wav_doppler_source_moving | s2_figure | OK | — | S → S′ towards a fixed O; L = 240 px, VₛT = 70 px, L − VₛT = 170 px, consistent. Only the source moves, as the `common_mistakes` line insists. |
| fig_77 | ts_ipe_p2_wav_open_pipe_harmonics | s2_figure | WRONG-LABEL | Same defect as fig_74: antinodes lettered **"an"**, the middle node lettered **"n"** — and this card's equations use n₁, n₂, n₃ for the harmonic frequencies. Inconsistent with fig_79's N / AN. | **A** at each open end and **N** at the centre. The wave geometry is right: wide at both ends, pinched at mid-pipe, no end wall on either side, l = λ₁/2. |
| fig_78 | ts_ipe_p2_wav_resonance_velocity_of_sound | s2_figure | WRONG-LABEL | (a) Same "an" / "n" lettering problem. (b) In the lower tube the single **"n"** sits at x = 74 while the node it names (the pinch) is at x = 103 — about 30 px to its left, over the open-end antinode region instead, so it reads as labelling the wrong feature. (c) The lower tube's two antinodes and its closed-end node are unlabelled while the upper tube's are labelled, so a student cannot tell which pinch the "n" belongs to. (d) In the upper tube "n" is drawn at the top corner (y = 52) although the node is at mid-height (y = 75). | **N** placed on each pinch and **A** on each bulge, in both tubes. The wave patterns themselves are correct: λ/4 (A–N) in tube 1 and 3λ/4 (A–N–A–N, with the node landing exactly on the closed end) in tube 2. |
| fig_79 | ts_ipe_p2_wav_stationary_waves_string_laws | s2_figure | OK | — | String between supports P and Q vibrating in three loops, node at each fixed support, **N** on an internal node and **AN** above the middle antinode, l arrow under the whole string. This is the labelling convention figs 74 / 77 / 78 should have used. |
| fig_80 | ts_ipe_p2_wop_interference_intensity_conditions | s1_figure | WRONG-LABEL | The **Q** label (x = 64, y = 136) is drawn straight over the middle barrier segment at x = 70 — the barrier line runs through the glyph. It is then crowded immediately against the **d** label (x = 80, y = 148), so the two collide in the narrow gap between the slits. Also, **d** has no dimension line or ticks spanning S₁ → S₂, so it reads as naming the short barrier stub between the slits rather than the slit separation. | Q set clear of the barrier (to its left, on the axis), and d carried on a short double-headed arrow from S₁ to S₂. The optics is otherwise correct: two slits, rays to P, dashed axis QO, x from O to P, D slit-to-screen. |
| fig_81 | ts_ipe_p2_wop_polaroid_between_crossed_polaroids | s1_figure | WRONG-LABEL | The caption **"axis at θ"** (x = 192) runs into the P₃ rectangle, whose left edge is at x = 240: the rectangle border cuts through the word and "θ" ends up sitting inside P₃, so the caption appears to belong to the third sheet rather than to P₂. Secondary: P₃'s dashed horizontal transmission axis is collinear with the outgoing ray (both at y = 120), so it reads as part of the emerging beam rather than as an axis. | The θ caption placed above or below P₂, clear of P₃; P₃'s axis offset from the ray line. The axis orientations themselves are right — P₁ vertical, P₃ horizontal (crossed), P₂ tilted between them. |
| fig_82 | ts_ipe_p2_wop_resolving_power_of_eye | s1_figure | UNCLEAR | The caption reads **"equal black stripes"** but the stripes are drawn as empty outlined rectangles carrying a single diagonal line each — nothing is black or shaded, so the drawing contradicts its own caption (the margin note quietly concedes this: "Shade the stripes black in your booklet"). A single diagonal reads as a strike-through, not as fill. The first gap is only 6 px wide, so stripes 1 and 2 nearly merge. | Solid (or densely hatched) equal-width black stripes with clearly widening white gaps. The measurable content is right: stripe widths all 18 px, gaps 6 → 10 → 16 → 24 px, with ticks and d on the widest gap. |
| fig_83 | ts_ipe_p2_wop_total_internal_reflection_huygens | s2_figure | UNCLEAR | (a) The **A** label sits below the interface and the dashed normal runs through the glyph. (b) The incident wavefront AB is drawn in the same solid stroke as the rays, rising up-right from A, so at a glance it reads as the reflected ray rather than a wavefront. (c) The refracted wavefront is an unlabelled segment floating in the rarer medium, not anchored to the interface at the point where B lands, and with no secondary-wavelet arc from A — it looks like a stray tick across the refracted ray, even though step s3 argues explicitly from "every point of the surface emits secondary wavelets". | A on the interface, clear of the normal; wavefronts drawn in a distinct style and labelled (AB, and the refracted wavefront through the point where B meets the surface), with the Huygens wavelet arc centred on A. The angles are physically correct: i ≈ 35°, r ≈ 60°, both wavefronts perpendicular to their rays, so r > i going denser → rarer as the card requires. |

## Clean figures

- fig_66_ts_ipe_p2_sem_semiconductor_as_half_wave_rectifier.png
- fig_67_ts_ipe_p2_sem_semiconductor_as_half_wave_rectifier.png
- fig_68_ts_ipe_p2_sem_transistor_and_its_working.png
- fig_69_ts_ipe_p2_sem_transistor_and_its_working.png
- fig_7_ts_ipe_p2_cur_kirchhoff_laws_wheatstone_bridge.png
- fig_8_ts_ipe_p2_cur_kirchhoff_laws_wheatstone_bridge.png
- fig_9_ts_ipe_p2_cur_kirchhoff_laws_wheatstone_bridge.png
- fig_70_ts_ipe_p2_sem_transistor_circuit_symbols.png
- fig_71_ts_ipe_p2_sem_transistor_circuit_symbols.png
- fig_72_ts_ipe_p2_sem_zener_diode_as_voltage_regulator.png
- fig_73_ts_ipe_p2_sem_zener_diode_as_voltage_regulator.png
- fig_75_ts_ipe_p2_wav_doppler_observer_moving.png
- fig_76_ts_ipe_p2_wav_doppler_source_moving.png
- fig_79_ts_ipe_p2_wav_stationary_waves_string_laws.png

## Counts

| verdict | count |
|---|---|
| OK | 14 |
| WRONG-PHYSICS | 0 |
| WRONG-LABEL | 5 |
| CLIPPED | 0 |
| UNCLEAR | 2 |
| **total** | **21** |

## Cross-cutting note

Three of the seven flags are one shared convention bug: the waves figures letter a **node "n"**
and an **antinode "an"** (figs 74, 77, 78), while fig_79 in the same chapter correctly uses
**N** and **AN**. `n` is the frequency symbol in every one of those cards' equations
(n₁ = v/4l, n₃ = 3n₁, n₁ : n₂ : n₃), so a single sweep to N / A (or N / AN) fixes three figures
and removes a real symbol collision. No electronics figure in this share has a wrong
polarity, arrow or diode orientation — all ten semiconductor/circuit figures check out.
