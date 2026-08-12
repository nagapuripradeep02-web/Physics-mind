# SKELETON — `ionisation_enthalpy`

> **Architect skeleton v1 — 2026-08-07 · desk `feat/chemistry-periodicity` · wave concept #2.**
> Chapter: NCERT Cl.11 Ch.3 §3.7.1(c) (`CHEMISTRY_CHAPTER_NAMES[3]`, already plumbed).
> Renderer: `field_3d` · `scenario_type: "orbital_shapes"` · engine builds 1–6 LANDED.
> **Binding upstream design:** `docs/CHEMISTRY_PHASE0_PERIODICITY.md` §0b (the sealed IE arc,
> cleared `DESIGN_OK` at Checkpoint A cycle 2) + §Config contract (all three blocks) + **§THE
> MOTION VOCABULARY**, which governs every motion cell in §3: this scenario's primitives are
> (1) instantaneous SWAPS/CUTS (`element_steps` · `charge_steps` · `gallery_steps` ·
> `populate_steps`), (2) ONE continuous ramp (`z_ramp` + the pre-existing reveal beats),
> (3) camera moves (`camera_steps`, build 5). **Every motion cell below names its primitive.**
> A species or charge change is a CUT and the engine is RIGHT to cut — for THIS concept the cut is
> also the physics: ionisation is all-or-nothing, the electron is bound or it is gone, and there is
> no half-ionised atom to tween through. Legibility at a cut comes from a held comparison
> (`ghost_species`), a duration, or a live readout — never from an eased motion the engine does
> not make.
> Model: `docs/atomic_and_ionic_radius_skeleton.md` v3.1 (the sibling; its house form — primitive
> named per motion cell, Exposes `controls:[]` column, per-state engine-config intent, provenance
> split, where-the-design-wants section — is matched here).
> Downstream: `chemistry_author` (position #2), then `json_author`. JSON lives in
> `src/data/concepts/chemistry/` — Gate 8b: NO registration in the 8 physics sites.
> **Headline structural decision (Phase 0's OWN flagged fallback, executed): 8 STATES, NOT 9.**
> Phase 0 §0b declared: *"If the dispatch cannot depict p-subshell pairing, S8 collapses into S7
> with new labels and must be cut to a single anomaly state… the concept survives either way at 8
> or 9 states."* Builds 1–6 shipped no pairing depiction — verified in the merged renderer:
> `spin` is rotation about `spin_axis` (`:59171`), `populate_steps` renders up to `OS_MAX_SETS = 3`
> orbital clouds whose SHAPE is occupancy-independent (`:59408`, `:60577`), and the only rendered
> 2p³ vs 2p⁴ correlate is the `config` HUD **string** — the verbatim shape of the OPEN scar
> `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause`. So the
> oxygen state is CUT and merged into ONE `model-vs-measured` state (new S7) that shows BOTH
> measured dips on one `ie_vs_z` + `model_series` axis. Deviation 1, declared, pre-authorised.

**Engine-bug-queue note:** the dispatch granted a live-queue query but this session's tool grant
carried no Bash; the queue was NOT queried live. Scars dispositioned by name in this revision:
`skeleton_choreography_written_in_tween_vocabulary_the_engine_renders_as_a_cut` (OPEN, owner
`alex:architect` — every §3 motion cell names its primitive: cut · reveal beat · marker-cut on a
complete curve; NO ramp is used anywhere in this concept, and no continuity verb survives);
`taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` (OPEN,
recurring — the oxygen-pairing case is RESOLVED BY CUTTING the state rather than declaring it; the
residual narration-only cause inside merged S7 is declared in §Where);
`phase0_union_table_asserted_not_walked_state_by_state` (3rd-recurrence direction honoured — the
**Exposes `controls:[]`** column is present per state, and the explore state's controls were
walked FIRST against the frozen row set, which is how the nonexistent "curve" control was caught —
Deviation 4); `field3d_authored_mode_string_is_inert_decoration_and_states_render_static` (no
guided state authors `mode`; every guided state's motion has a named schedule; S8 authors
`mode:'explore'`, the one authorised use);
`narration_attributes_an_effect_to_a_cause_the_model_does_not_contain` (load-bearing at S7 and
worked into its narration duty: the dip is a MEASURED fact and the model's trace visibly does NOT
dip — narration names what the model is missing, never what the model "shows");
`real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` (anchor homed at S1
with 12 of its 35 words); the DEAD-CONTROL class ("a control the schedule already owns is dead") —
dispositioned in §3's column contract: `element`/`charge` dials exposed BESIDE running schedules
are LIVE by construction, because build 4's seize lives INSIDE `osElementAt`/`osChargeAt`/
`osZEffAt` (`:60442–60449`, contract row CLOSED) — unlike the orbital picker under
`gallery_steps`, which this concept never exposes; the CURVE-COMPLETE-AT-MS-0 class — no cell or
narration says a curve "builds": every curve is a MAP complete at ms 0, the marker CUTS along it
(S3), or the map itself is SWAPPED whole at an element cut (S6);
`field3d_explore_picker_renders_blank_when_handed_a_value_its_option_list_lacks` (n/a — no state
exposes `orbital`, so `config.explore_orbitals` is deliberately NOT authored);
`canvas_graph_label_collides` (settled engine-side: marker value on an opaque plate `:60382`,
two-row legend band `:60270`); the FIXED ghost-outlives-its-phase class (no state here crosses a
phase boundary under a held ghost — every ghost either IS the end-frame comparison or is the
sibling-S5 verified pattern); `field3d_control_range_typed_from_a_narrower_derivation` (FIXED;
n/a — no `zeff` dial exposed in this concept).
**FLAG to quality_auditor: run the live `engine_bug_queue` query at Gate 8 and diff against this
list — it was compiled without DB access.**

---

## 1. Atomic claim

This concept teaches **the energy cost of removing electrons from an isolated gaseous atom —
ionisation enthalpy ΔᵢH — and only that**: what IE₁ is, how it tracks size and pull across a
period and down a group, how successive ionisation enthalpies expose shell structure by where
they jump, and where the screening model measurably fails (Be/B, N/O). It does NOT re-teach
Z_eff, screening, or shell opening (prerequisite `atomic_and_ionic_radius`, this wave's #1 —
assumed throughout and patched in single clauses, never re-taught), and does NOT cover electron
gain enthalpy or electronegativity (ledger, wave #3+).

## 2. State count + arc (8 states — Phase 0's 9-state arc with its OWN flagged S7+S8 merge executed)

Complexity: complex (7–9 band). 7 guided + 1 explore. The hook moves at S1 (the electron-removal
cut happens on screen). `teaching_method`: S1–S7 omit the field (straightforward motion beats,
Rule 31); S8 `exploration_sliders`.

| # | id | Purpose (one line) | Ring |
|---|---|---|---|
| S1 | `STATE_1` | Removing an electron costs energy — ΔᵢH₁ defined on a real removal; anchor: why sodium is stored under oil and neon needs nothing | core |
| S2 | `STATE_2` | One named pair — lithium vs fluorine: smaller atom, higher cost | core |
| S3 | `STATE_3` | The inversion — across period 2, radius falls WHILE IE₁ rises (both numbers live; declared contrast pair with radius S4) | core |
| S4 | `STATE_4` | Down a group: the outer electron sits in a farther shell, removal gets cheaper | core |
| S5 | `STATE_5` | Successive IEs — sodium's second electron costs nine times the first (the cliff; misconception beat 1) | core |
| S6 | `STATE_6` | The cliff MOVES with the element — where it falls counts the valence electrons | core |
| S7 | `STATE_7` | Model vs measurement — the measured trace dips at boron and at oxygen; the model's does not (misconception beat 2) | extended |
| S8 | `STATE_8` | Explore — element and electron-index dials live over the staircase (core-ring content only) | explore |

State titles (Rule 41d — literal, first words carry the meaning; varied from delta cues):
S1 "Energy to remove an electron" · S2 "Lithium and fluorine compared" ·
S3 "Across a period: cost rises" · S4 "Down a group: cost falls" ·
S5 "Removing a second electron" · S6 "Counting valence electrons from jumps" ·
S7 "Where the model fails" · S8 "Explore ionisation enthalpy".

## 3. Per-state choreography + control plan (Rule 31 — FIRST design artifact)

**Column contract (union-scar 3rd recurrence, binding):** *Distinct motion* = what the state
RENDERS, **with the driving primitive named in-cell** (cut · reveal beat · marker-cut · map-swap;
NO ramp is used in this concept); **Exposes** = the exact `controls:[]` values from the frozen row
set (`orbital · dots · spin · probe · schar · twist · element · charge · zeff`) — `—` means
`controls: []`, legal on a watch-beat (Rule 31c). A dial exposed beside a running schedule is
LIVE: build 4's seize is INSIDE `osElementAt`/`osChargeAt`/`osZEffAt`, so a drag is bit-for-bit
the scheduled picture (`:60442–60449`; contract row CLOSED). The explore state was walked FIRST:
its Phase-0 control list (`element · which e⁻ · curve`) hit one row that DOES NOT EXIST — there
is no "curve" control row — see Deviation 4.

| # | Teaches | Archetype | Distinct motion (renders — primitive named) | Delta cue (≤5 w) | Exposes `controls:[]` | Real number | Dur | Words | Ring | advance_mode | Vertex |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S1 | Removing an electron costs a definite energy | `pull-free` | Neutral Na's 3s shell on stage (`orbital:'shell'` — sphere family). Ghost before-pin (reveal beat, −600 ms) holds the neutral boundary; then ONE `charge_steps` CUT 0→+1: the outer shell is GONE in one step — bound or gone, no in-between, which the narration names as the physics (ionisation is all-or-nothing). The cost sits on the static formula surface: `Na(g) → Na⁺(g) + e⁻ · ΔᵢH₁ = 495.8 kJ/mol (measured)`. NO `ie_measured` HUD here — post-cut it would print IE₂ = 4562 and pre-spoil S5 (Deviation 5) | "Energy to remove one electron" | — | ΔᵢH₁(Na) = 495.8 kJ/mol (measured, static surface) | 14s | 35 (12 = anchor) | core | manual_click | particulate + symbolic (equation) |
| S2 | Smaller atom → outer electron closer to an unscreened pull → higher cost | `pair-compare` | Li's big 2s shell opens with `hud_lines` `radius` + `ie_measured` (IE₁ = 520.2, the HUD line's first appearance); ghost before-pin (reveal beat, −600 ms) holds Li's boundary; ONE `element_steps` CUT Li→F (`orbital:'shell'` — no dumbbell flip): the live shell is far smaller INSIDE the held Li outline while IE₁ CUTS to 1681.0. Concentric held-ghost comparison, not literal side-by-side (Deviation 2). One clause patches the prerequisite ("same shell, far more protons pulling") | "Smaller atom, more energy" | — | Li 520.2 vs F 1681.0 kJ/mol (measured); r: 371.46 pm → F (design target) | 16s | 45 | core | manual_click | particulate |
| S3 | **The inversion** — same cause (rising Z_eff), radius falls, IE rises | `period-sweep` (declared cross-concept contrast pair with radius S4 — its one-new-thing is the INVERSION) | Eight `element_steps` CUTS Li→Ne (`orbital:'shell'`): at each cut the shell steps smaller (radius HUD falls — the re-shown half of the pair) while the `ie_measured` HUD steps HIGHER — **both numbers live on screen together, per the Checkpoint-A condition**. Overlay `{table, curve:'ie_vs_z'}`: **the curve is COMPLETE at ms 0** — a map, not evidence being built — and the marker CUTS from element to element along it (each marker move is itself a cut resolved from `osElementAt`); narration must never say the curve builds. Single measured series → linear axis (log fires only with `model_series`, `:60289` — core never sees log) | "Size falls, energy rises" | `element` (live-seize) | r 371.46 → 72.31 pm (shell law, endpoints engine-verified) AND IE₁ 520.2 → 2080.7 kJ/mol (measured), together | 20s | 55 | core | manual_click | particulate + symbolic (curve/strip) |
| S4 | Down a group the outer electron starts farther out — cheaper to remove | `group-step` | Two `element_steps` CUTS Li→Na→K: strip marker drops one PERIOD row per cut; ghost before-pins (reveal beats, −600 ms) hold the previous atom's boundary under the visibly larger new shell (sibling-S5 verified ghost pattern, no `clear` needed); `ie_measured` HUD FALLS 520.2 → 495.8 → 418.8. Overlay `{table:true, curve:null}` (group form deliberately absent — the strip carries "down a group"). Radius narration claims DIRECTION only (sibling Content-ruling 3 inherited: the model overstates group jumps) | "Outer shell, less energy" | `element` (live-seize) | IE₁: 520.2 → 495.8 → 418.8 kJ/mol (measured); n = 2, 3, 4 | 15s | 40 | core | manual_click | particulate + symbolic (strip) |
| S5 | **Successive IEs — the cliff (misconception beat 1)** | `staircase` | Element pinned Na; overlay `{curve:'ie_successive', mark:'step'}` — the 3-rung staircase (count DERIVED: valence 1 + 2, `osIeDrawCount:60063`, keyed to the NEUTRAL atom so the axis never rescales under the marker) is COMPLETE at ms 0: 495.8 · 4562 · 6910.3, the k=2 wall ~9× the k=1 bar, visible from the first frame. Two `charge_steps` CUTS 0→+1→+2 walk the marker up the wall while `ie_measured` re-prints IE₁ → IE₂ → IE₃ with real `<sub>` indices; the stage shell collapses at the first cut (3s gone) — entailed by the species, secondary to the overlay evidence (declared: the staircase + HUD are the taught surface; the stage picture is small by mid-state) | "Second electron costs far more" | `charge` (the "which e⁻" dial — IE index = charge + 1, live-seize; the staircase axis is charge-independent by design) | 495.8 → 4562 → 6910.3 kJ/mol (measured); ΔᵢH₂ = 9.2 × ΔᵢH₁ | 20s | 55 | core | manual_click | symbolic (staircase) + particulate |
| S6 | **The cliff's POSITION counts the valence electrons** | `count-from-jump` | Two `element_steps` CUTS Na→Mg→Al at charge 0: at each cut the ENTIRE staircase is SWAPPED whole (a new complete map per element — nothing builds) and the cliff lands one rung further right: Na jumps after k=1 (3 rungs), Mg after k=2 (4 rungs), Al after k=3 (5 rungs) — rung count derived, so the cliff MOVES, which is what earns this state its slot beside S5 (Phase-0 condition honoured). Strip lit cell walks group 1→2→13, tying jump position to group number | "The jump gives valence count" | `element` (live-seize) | cliff after k = 1 / 2 / 3; Mg 737.7·1450.7·**7732.7**; Al 577.5·1816.7·2744.8·**11577** (measured) | 18s | 50 | core | manual_click | symbolic (staircase/strip) |
| S7 | **Model vs measurement — both anomalies, one state (the merged Phase-0 fallback)** | `model-vs-measured` | Overlay `{table, curve:'ie_vs_z', model_series:true}`: amber solid-round MEASURED series and cyan dashed-square Slater series drawn together, legend "measured" / "Slater model" (`:60424–60427`); the two-series span (520 → 11226) trips the auto-LOG axis (`:60289` — deliberate: the 99 kJ/mol Be→B dip is the content and dies on a linear axis; "log scale" tag prints, one narration clause glosses it). Three `element_steps` CUTS Be→B→N→O with `orbital:'valence'` — **deliberately NOT `'shell'`**: the Be→B cut flips the silhouette family sphere→dumbbell, which here IS boron's cause depicted (the outer electron changed subshell); at each cut the marker steps and the amber trace visibly DIPS where the cyan model steps UP. Oxygen's cause (two electrons sharing one 2p orbital) has NO rendered correlate — narrated over the visible measured dip, never claimed shown (§Where). `z_eff` HUD rises smoothly across all four cuts — the model's monotone claim printed beside the dipping measurement | "Measured dips; model rises" | `element` (live-seize) | 899.5 > 800.6 and 1402.3 > 1313.9 kJ/mol (measured, OS_IE); model spread 1.07× (Li) → 5.40× (Ne), engine-stated `:59986` | 22s | 55 | extended | manual_click | symbolic (two-trace curve) + particulate (family flip) |
| S8 | Explore | `open` (`drag-sandbox`) | **`mode:'explore'`** (build 6 — idle spin + the explore branch of `deriveStateMeta`; coexists with the explicit `camera`). Teacher drives `element` + `charge`; every drag is a live seize at the single schedule-read site; shell (`orbital:'shell'` — no silhouette flips under drags), strip, staircase (curve `'ie_successive'`, fixed — Deviation 4), marker and `ie_measured` respond live; S5's cliff-walk and S6's cliff-move are both re-drivable. A negative charge drag prints `IE = —` unindexed (the engine's honest anion surface, `:64723–64726`). Free-runs (Rule 37) | — | `element` · `charge` — ALL of this concept's taught dials | live | open | 0 | explore | interaction_complete | all |

**No-repeat check:** seven distinct archetypes + `open`, none coined (all from Phase 0's own
naming), none static (S8 de-static'd by `mode:'explore'`). The one archetype that vanished
(`model-vs-measured` ×2) vanished WITH the merge — the declared repeat pair no longer exists.
Declared near-relations: **S1 and S5 both use a Na `charge_steps` cut** — different archetypes,
different pictures (S1: one definitional cut, ghost + enthalpy equation, no overlay; S5: three
cuts walking a complete staircase, no ghost), and the shared species is deliberate — same
apparatus, home pose (Rule 32d), S1 plants the atom the S5 cliff belongs to. **S3 here ↔ radius
S4** is the cross-concept `period-sweep` contrast pair declared in Phase 0's shared preamble; the
Checkpoint-A condition (both numbers live on one screen) is authored in S3's `hud_lines`.
**S5 ↔ S6** share the staircase overlay but not the moving thing: S5 walks a marker up a FIXED
map; S6 swaps the map and the CLIFF moves.

**Rule 32 per row:** cause-first beats are authored where cause and effect read from different
resolved values — S1/S2/S4 pin ghosts ~0.6 s ahead of their cuts (the ghost resolves through its
OWN schedule: a genuinely different resolved value); at every cut, HUD, shell, strip and marker
resolve from ONE per-frame variable and are honestly described as simultaneous steps (no false
lead claimed anywhere — the sibling's withdrawn-S4 lesson applied from the start). Only the
taught variable's motion changes per state (S5's stage-shell collapse is declared as entailed and
secondary; S8 exempt). Delta column = the on-canvas cue verbatim (Rule 32c/34a). Same apparatus
from a home pose; NO `camera_steps` anywhere in this concept — every camera is fixed per state,
so NO entry-glide forfeits (unlike the sibling). One glow focal per instant, always a mesh from
the closed glow enum; **S3, S5, S6 and S7 bind NO glow focal at all** — their argument lives on
the overlay, which has no glow key (carried gap), and lighting a mesh would point away from the
evidence; the sibling's S3 no-focal ruling is the precedent.

## 3b. Per-state ENGINE CONFIG intent (every key verified at its call site, builds 1–6)

Global: every state authors its own `camera: {az,el,dist}` + `dot_target` (mandatory). Compute,
don't guess: frame so the largest boundary shown fills ~55–65% of frame height, `dist` scaled
from the shipped hydrogen solves by (target r / hydrogen r); `dot_target` scaled to hold density,
verified via `PM_osVisDots`. No state authors `z_ramp` or `z_eff` as a literal (always
`'slater'`). `overlay` only where an element source exists (`ovHasElem` — static `element` or
`element_steps`, both present wherever authored). `model_series` authored at S7 ONLY. No
`camera_steps`, no `ghost_species` `clear` (no ghost crosses a phase boundary), no
`render_annotations`, no `config.explore_orbitals` (no state exposes `orbital`). No paired
`element_steps`+`charge_steps` exist in this concept (each state schedules ONE parameter), so the
paired-pin rule is satisfied vacuously; **no reveal pin binds to any `element_i`/`charge_i`/
`ghost_species_i` cue name** — reveals bind to `at_ms` only.

| # | Engine config intent |
|---|---|
| S1 | `element:'Na'`, `orbital:'shell'`, `z_eff:'slater'`, `charge_steps:[{0,0},{6500,+1}]`, `ghost_species:[{at_ms:5900, element:'Na', charge:0}]` (holds the neutral boundary to state end — the end-frame IS the comparison), `overlay:null`, `hud_lines:['element','radius']` — **`ie_measured` deliberately NOT authored** (post-cut it prints IE₂ = 4562, the S5 spoiler; Deviation 5). Formula surface: `Na(g) → Na⁺(g) + e⁻ · ΔᵢH₁ = 495.8 kJ/mol (measured)` — the ledger row, NCERT's exact symbol, gas-phase state symbols, provenance stamped. Narration dual-labels once (38d): "ionisation enthalpy, ΔᵢH₁ — also written IE₁". Camera framed for neutral Na 3s (~469 pm) |
| S2 | `orbital:'shell'`, `z_eff:'slater'`, `element_steps:[{0,'Li'},{7000,'F'}]`, `charge:0`, `ghost_species:[{at_ms:6400, element:'Li', charge:0}]`, `overlay:null` (the pair needs no curve; the strip would add a third surface — Rule 34), `hud_lines:['element','radius','ie_measured']` (first `ie_measured`: `IE₁ = 520.2 kJ/mol (measured)` → cuts to 1681.0). Formula surface: none (the two stepping HUD numbers are the argument). Camera framed for Li (371.46 pm, the larger) |
| S3 | `orbital:'shell'`, `z_eff:'slater'`, `charge:0`, `element_steps:[Li,Be,B,C,N,O,F,Ne]` at ~2.2 s intervals, `overlay:{table:true, curve:'ie_vs_z', mark:'line'}` (single measured series, amber, linear axis — `model_series` absent so log cannot fire), `hud_lines:['element','radius','ie_measured']` — **both numbers live, the Checkpoint-A condition**. Formula surface: none (the curve is the surface's job). One 7-word narration clause re-glosses the spherical-average radius qualifier at boron (inherited from sibling S4's gloss; the HUD suffix appears here too on open subshells). Camera fixed, framed for Li |
| S4 | `orbital:'valence'` (2s→3s→4s, all spheres — no flip, no relabel), `z_eff:'slater'`, `charge:0`, `element_steps:[{0,'Li'},{5000,'Na'},{10000,'K'}]`, `ghost_species:[{4400,'Li',0},{9400,'Na',0}]` (sibling-S5 verified pattern), `overlay:{table:true, curve:null}`, `hud_lines:['element','radius','ie_measured']`. Formula surface: none. Camera framed for K's 4s (808.71 pm, model — narration claims size DIRECTION only; the IE numbers are measured and claimed fully). Rides row L (3s, 4s) |
| S5 | `element:'Na'` (static — the `ovHasElem` source), `orbital:'shell'` (Na⁺'s 2p valence must not flip the silhouette), `z_eff:'slater'`, `charge_steps:[{0,0},{6500,+1},{13000,+2}]`, `overlay:{table:false, curve:'ie_successive', mark:'step'}` (step is the default on this curve anyway — authored explicitly), `hud_lines:['element','ie_measured']` (radius dropped: one stepping number, not two competing). Staircase = 3 rungs (derived, neutral-keyed — axis stable under the S5 walk AND under any teacher `charge` drag). Formula surface: `ΔᵢH₂ = 9.2 × ΔᵢH₁ (measured)`. `misconception_watch` here (§4). Camera framed for neutral Na |
| S6 | `orbital:'shell'`, `z_eff:'slater'`, `charge:0`, `element_steps:[{0,'Na'},{6000,'Mg'},{12000,'Al'}]`, `overlay:{table:true, curve:'ie_successive', mark:'step'}` — at each cut `osIeDrawCount` re-derives (3→4→5 rungs) and the whole map swaps; marker sits at k=1 throughout (charge 0), `hud_lines:['element','ie_measured']`. NO `config` HUD line (subshell notation is the SIBLING's extended-ring content; under its core preset it is untaught — the valence count is carried by the jump position + narration). Formula surface: `valence electrons = last k before the jump` (plain literal reading rule, 38c/41). Camera fixed (stage shells Na/Mg/Al are same-order; overlay is the evidence) |
| S7 | `orbital:'valence'` — **deliberate** (the Be→B sphere→dumbbell family flip IS boron's depicted cause), `z_eff:'slater'`, `charge:0`, `element_steps:[{0,'Be'},{5500,'B'},{11000,'N'},{16500,'O'}]`, `overlay:{table:true, curve:'ie_vs_z', model_series:true}` — amber measured + cyan dashed Slater, legend automatic, LOG axis auto-fires (span > decade with model on; one narration clause: "the axis is compressed so both traces fit"), `hud_lines:['element','z_eff','ie_measured']` — `radius` dropped (the `lobe tip =` relabel branch would fire on dumbbells, and radius is not the taught number). Formula surface: none (two labelled traces + legend are the state's surface; the Slater formula would be advanced-ring algebra + clutter). `misconception_watch` here (§4). Narration duty (scar-bound): the model's trace RISES at B and at O — narration says the MEASUREMENT dips and names what the model lacks (subshell penetration; pairing), never that the model shows the dip; oxygen's cause is narration-only over the visible dip (§Where). Camera framed for the 2p_z dumbbell family |
| S8 | **`mode:'explore'`** (REQUIRED — without it the sandbox is byte-static and `deriveStateMeta` expects motion; coexists with the explicit `camera`), `element:'Na'` default, `charge:0` default, `z_eff:'slater'`, `orbital:'shell'`, `controls:['element','charge']` (every dial any guided state exposed; each seizes at the single schedule-read site), `overlay:{table:true, curve:'ie_successive', mark:'step'}` — the CORE payoff fixed as the explore map (Deviation 4: no "curve" control row exists), `hud_lines:['element','radius','ie_measured']` — **no `z_eff` line** (38b: the symbol is not established by this concept's core states; it appears only in extended S7), no `electron_count`. Formula surface: `X(g) → X⁺(g) + e⁻ · ΔᵢH₁` (core, algebra-free). Anion drags print `IE = —` unindexed — accepted, the engine's documented honest surface. `advance_mode:'interaction_complete'`, free-runs (Rule 37). Camera framed for the largest reachable neutral (K); `dot_target` generous |

Enum discipline (full freeze check, per contract — every closed enum, not just the four value
enums): every `element` (H…Ca ∋ Na, Li, F, Be, B, C, N, O, Ne, Mg, Al, K), `charge` (−3…+3 —
schedules use 0…+2; the explore dial legitimately reaches negatives and meets the em-dash),
`orbital` (`'shell'`, `'valence'` ∈ closed list), `curve` (`'ie_vs_z'`, `'ie_successive'`,
`null`), `mark` (`'line'`, `'step'`), every `hud_lines` value (`element · radius · ie_measured ·
z_eff` ∈ the handled set swept at `:59288–59290`), every `controls` value (`element · charge` ∈
the frozen row set `:59319–59320`), `mode:'explore'` (the one authorised use), every
`ghost_species` entry key (`at_ms · element · charge` — no `as`, no `clear` authored), and every
glow key named (NONE on S3/S5/S6/S7 — declared) are inside their frozen sets. `model_series`
authored at S7 only. No `psi2`/`probe`, no annotations, no `render_annotations`, no
`config.explore_orbitals`, no `camera_steps`, no `z_ramp`.

## §Content rulings

**Ruling 1 — the merge (Deviation 1) is Phase 0's own fallback, executed, and the merged state
must still depict ONE cause.** The A2 declaration permitted `model-vs-measured` twice only if
each state depicted its own cause; the engine can depict boron's (subshell family flip via
`orbital:'valence'`) and cannot depict oxygen's (no pairing primitive — verified, header). So ONE
state, boron's cause depicted, oxygen's cause narrated over its visible measured dip with the
narration duty scoped: the DIP is the shown fact; "two electrons now share one orbital" is named
as what the model is missing, in one clause, with nothing on stage claimed to show it. The state
survives Rule 31 (one idea: "the measured trend breaks where the model says it shouldn't — twice,
for two reasons the model lacks") because the two dips are one visual event on one axis.

**Ruling 2 — S1 carries its number on the formula surface, not the HUD.** `ie_measured` tracks
the live species, so after S1's cut it prints IE₂ = 4562 — S5's entire payoff, leaked in the
concept's first 14 seconds (the don't-pre-spoil directive). The static formula surface prints the
citation for the removal actually shown, stamped `(measured)`, and doubles as the NCERT-exact
ΔᵢH₁ definition with gas-phase state symbols (the chemistry ledger row). The HUD line debuts at
S2, where both species on screen are neutral and only IE₁ values exist.

**Ruling 3 — S5/S6 axis stability is load-bearing, and the engine already guarantees it.** The
staircase rung count is keyed to the NEUTRAL element (`:60051–60054`), so S5's marker walk and
any teacher `charge` drag happen on a FIXED map (Rule 32b), while S6's element cuts legitimately
swap the whole map — the cliff position is S6's taught variable. Narration verbs follow: S5
"climbs the staircase" → the marker steps; S6 "the jump moves" → the map swaps. Never "the
staircase grows".

**Ruling 4 — the log axis at S7 is accepted, not fought.** It fires automatically
(`model_series` on + span > decade) and exists for this exact state (the buried-dip comment
`:60283–60288`). It appears ONLY in the extended ring — core states never meet it (S3's single
series is linear). One narration clause glosses it; the "log scale" tag prints on-canvas.

## 4. Misconception confrontation plan (Rule 16a — TWO genuine beliefs, one per ring, per Phase 0)

**Belief 1 (core, S5): "every electron costs about the same to remove."**
Source: NCERT Exemplar successive-IE items (`chemistry_author` cites the item; belief only).
- **Earned first:** S1–S4 show exactly one cost per species, varying smoothly and modestly
  (520 → 496 → 419 down a group; ~4× across a period) — the student leaves S4 with "removal cost
  varies gently with size."
- **Confrontation — S5 `misconception_watch`:** `belief`: "every electron costs about the same" ·
  `visual_counter`: the k=2 bar stands ~9× the k=1 bar on one staircase, and the HUD steps
  495.8 → 4562 · `one_line_fix`: "The second electron comes from a full inner shell, much closer
  to the nucleus — the price jumps." Straightforward contrast beat; no predict/pause. Survives
  the core-only cut (the ring's own beat, per Phase 0's cycle-2 A1 fix).

**Belief 2 (extended, S7): "ionisation energy just rises across a period."**
- **Earned first:** S3 shows eight elements rising (and its narration says "step by step the cost
  climbs" — never "always"; the planting moment flagged and softened, not corrected early).
- **Confrontation — S7 `misconception_watch`:** `belief`: "across a period the cost only rises" ·
  `visual_counter`: the amber measured trace dips at B and at O while the cyan model trace rises
  through both · `one_line_fix`: "The rise holds shell-by-shell — a new subshell at boron and a
  shared orbital at oxygen each make removal cheaper."

No other state carries a watch (guardrail: 2 pivots, both genuine). EPIC-C branches: none
(EPIC-L-first directive).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **S5** — the exam workhorse (successive-IE tables → identify the group) and misconception 1's
  home; "why is IE₂ so huge for sodium" concentrates in many phrasings.
- **S7** — the anomalies, the highest-frequency JEE/NEET trap on this section (order Be/B or N/O),
  and the concept's honesty beat.

All other states `false`. V1.0 ships zero authored deep-dives (Rule 18).

## 6. Drill-down clusters

S5: `successive_ie_staircase` (why IE₂ ≫ IE₁ when the first shell empties) ·
`ie_index_vs_charge` (IE₂ of X = IE₁ of X⁺ — the index bookkeeping students tangle) ·
`why_the_cliff_is_a_shell_edge` (the jump as direct evidence shells are real).

S7: `be_b_anomaly` (2s vs 2p penetration — removal from a higher-energy subshell) ·
`n_o_anomaly` (pairing in one orbital raises the electron's energy → cheaper removal) ·
`model_vs_measured_reading` (which trace is data, which is model, and why a model failing is
information).

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:  STATE_1 → STATE_2   # what ionisation enthalpy is + the size link
  period_trend:  STATE_3
  group_trend:   STATE_4
  successive_ie: STATE_5 → STATE_6   # the staircase + reading valence count
  anomalies:     STATE_7
```

Default aspect `foundational`. **Foundational-coverage rule:** the PRIMARY aha lives at S5,
outside the foundational slice → the foundational slice declares a **mandatory exit-pill** into
`successive_ie` ("The second electron costs nine times more — see the staircase", landing at S5;
S1–S4's smooth-cost picture is the earned wrong belief, so entering at S5 directly off the
foundational slice still lands on a built-up contrast).

## 8. Prerequisites (advisory, Rule 23)

- **`atomic_and_ionic_radius`** (this wave, #1) — Z_eff, screening, shell opening, subshells, the
  r₉₀ picture, and the strip/curve reading conventions. Assumed, never re-taught; patched in
  single clauses (Block 1).
- `bohr_model_energy_levels` (shipped) — shells are discrete; inherited through #1.

Downstream: `electron_gain_enthalpy` (ledger, wave #3) will list THIS concept as prerequisite.

## 9. Real-world anchor (Rule 35 / 38f)

**Primary (home S1, 12 of its 35 words):** *sodium must be stored under oil; neon needs no
protection at all* — how easily an atom gives up its outer electron decides how it behaves, and
that ease is a measured number: 495.8 kJ/mol for sodium, 2080.7 for neon. Universal (an element's
own chemistry — no place, brand, currency, or culture), physics-true at every depth (reactivity
of Na genuinely traces to its low ΔᵢH₁), and it seeds the exact species S1 and S5 use. No
secondary anchor — every other state's word budget is committed.

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the eight rows of §2, exactly.

**(b) Symbol-label table:**

| Quantity | On-canvas label | First taught |
|---|---|---|
| Ionisation enthalpy (1st) | Formula surface `ΔᵢH₁` (NCERT symbol, dual-labelled once in narration as "also written IE₁"); HUD prints `IE₁ = 495.8 kJ/mol (measured)` with a real DOM `<sub>` (engine surface, `:64712`) | S1 (surface) / S2 (HUD) |
| Successive IEs | HUD `IE₂`, `IE₃` … (index = charge + 1, engine-derived); staircase y-axis `IEₖ (kJ/mol)`, x-axis `electron removed (k)` (engine-drawn, `:60242`) | S5 |
| Electron-index | `k` (axis label + narration) | S5 |
| 90%-boundary radius | HUD `r = <n> pm (90%)`; open-subshell states show the engine's `(spherical average)` qualifier — glossed in one clause at S3/boron (inherited sibling gloss); the `(model)` stamp is the CAPTION's duty; `orbital:'shell'` everywhere except S4 (`valence`, all-s) and S7 (`valence`, deliberate flip) keeps the `r =` noun constant where radius is shown | S2 (in this concept; taught at sibling S1) |
| Nuclear charge | `Z = <n>` inside the HUD `element` line; curve x-axis `atomic number Z` with element-named ticks | S2 |
| Effective nuclear charge | `Z_eff` HUD line, `(Slater)` stamped — **S7 only** (extended); absent from every core state and from S8 (38b) | S7 (in this concept) |
| Ion charge | Superscript on the species label (`Na⁺`); the removal equation glosses it at S1 | S1 |
| Gas-phase state symbol | `(g)` in both formula-surface equations | S1 |
| Provenance | `(measured)` on every IE (HUD + surfaces); amber solid round = citation, cyan dashed square = Slater model, legend `measured` / `Slater model` (engine-drawn); `log scale` tag at S7 (engine-drawn) | S1 / S7 |

All Unicode across DOM/graph/sprite paths (Δᵢ, ₁, ₖ, ⁺, ⁻, e⁻, ≫, × — Rule 34c; the engine
already prints `IEₖ`, `e⁻` and the `<sub>` indices).

**(c) Ledger plan (chemistry variant of the RHR row):** ionisation equations with gas-phase state
symbols as the S1 and S8 formula surfaces (`Na(g) → Na⁺(g) + e⁻ · ΔᵢH₁ = 495.8 kJ/mol
(measured)`; `X(g) → X⁺(g) + e⁻ · ΔᵢH₁`); every IE on any surface is a citation from `OS_IE`
(CRC 97th / NIST ASD, named at the table) stamped `(measured)`; the one derived quantity on
screen (S7's model trace) carries its own colour, dash, mark and legend row. No redox states → no
oxidation numbers; no particle-count scale factor (single-atom scenario).

**(d) Motion plan (primitive-named, per §3):** ghost before-pin + ONE charge CUT (S1) · ghost
before-pin + ONE element CUT (S2) · element CUTS ×8 with marker-cuts along a complete curve (S3) ·
element CUTS ×2 with ghost before-pins (S4) · charge CUTS ×2 walking a fixed complete staircase
(S5) · element CUTS ×2 swapping the staircase map whole, cliff position the moving thing (S6) ·
element CUTS ×3 on a two-trace map with a family-flip at the first cut (S7) · `mode:'explore'`
free-run sandbox (S8). NO ramp anywhere; no continuity verb survives in any cell; every schedule
key named in §3b exists in builds 1–6 at a verified call site.

**(e) Modes:** guided states S1–S7 author NO `mode` key (inert-decoration scar); every state
authors explicit `camera` + `dot_target` (mandatory). S8 MUST author `mode:'explore'` — the one
authorised use.

**(f) `assessment` + `coverage_map` + `misconception_watch`:** watches at S5 and S7 only (§4).
Assessment stems (`chemistry_author` drafts items): given successive IEs 577.5, 1816.7, 2744.8,
11577 — identify the group (→S6) · why is IE₂(Na) ≈ 9 × IE₁(Na) (→S5) · arrange Be, B, C, N, O by
first ionisation enthalpy (→S3 + S7) · why does IE₁ fall from Li to K (→S4) · why is IE₁(F) >
IE₁(Li) (→S2/S3) · state the equation defining ΔᵢH₁ with state symbols (→S1). `coverage_map` maps
each to its state.

**(g) Rule 33:** does NOT fire (Phase 0 correction — microscopic variable, microscopic
mechanism). The strip/curve overlay exists on Rule 24/25 grounds; live numeric readouts
everywhere (`ie_measured`, radius, the marker's plated value).

**(h) Canvas budget (Rule 34):** ONE formula surface per state — S1 the ΔᵢH₁ equation ·
S2 none · S3 none (curve is the surface) · S4 none · S5 `ΔᵢH₂ = 9.2 × ΔᵢH₁ (measured)` ·
S6 `valence electrons = last k before the jump` · S7 none (two labelled traces are the surface) ·
S8 the definitional equation. Caption = the ≤5-word delta cue only; prose in the strip below. HUD
value-only. Overlay owns bottom-left (formula auto-pushed top-left, engine-handled). No
annotations; `render_annotations` not authored. Glow gap designed around: S3/S5/S6/S7 bind no
focal (§3).

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Both cuts, both directions.** Cut A (hide extended S7): survivors S1–S6 + S8 — no
  survivor references anomalies, the model series, Slater's formula, the log axis, or `z_eff`
  (the symbol appears ONLY at S7 in this concept); S3's narration claims the rise without
  "always"; reverse: every displayed quantity in the survivors (ΔᵢH₁/IEₖ, r, Z, k, charge) is
  introduced by a surviving state. Cut B (hide advanced + extended): identical — no advanced ring
  exists (S7 sits immediately before S8: contiguity trivial, 38a).
- **(i-2)** S8 surfaces core content only: the definitional equation, the staircase, element +
  charge dials, `ie_measured`/radius lines — no `z_eff`, no model series, no config notation.
- **(i-3) `curriculum_tags` (38g):** CBSE/NCERT §3.7.1(c) `full`, **verified** (successive IEs +
  both anomalies are NCERT text). JEE/NEET · IGCSE · IB DP · AP · A-level all `full` +
  `needs_teacher_verification: true`. Dialect note (38d): "ionisation" spelling (NCERT/IGCSE/
  A-level) vs US "ionization", and "ionisation enthalpy" vs "ionisation energy" — dual-labelled
  once at S1 ("the energy — the ionisation enthalpy ΔᵢH₁"), then consistent; flagged for the AP/
  IB teacher pass.
- **(i-4) Presets:** `full` = S1–S8 · `core` = S1–S6, S8 (hides S7). Hide, never reorder.
- **(i-5) Graph axes (38e):** `ie_vs_z` plots IE₁/kJ·mol⁻¹ (y) vs Z (x); `ie_successive` plots
  IEₖ (y) vs k (x) — both conventions shared across all six boards; no conflict, no axis-swap
  toggle; the S7 log axis is engine-forced with the model series and labelled on-canvas; all
  flagged `needs_teacher_verification`.

**(j) Schedule/flag discipline:** every state schedules at most ONE parameter (no paired
schedules exist); ghosts pin at −600 ms as declared before-pin beats and never cross a phase
boundary (no `clear` needed anywhere); no reveal pin binds to any schedule cue name; no
`camera_steps` (all cameras fixed — no entry-glide forfeits); `model_series` at S7 only; `mode`
at S8 only; `ie_measured` never authored on a state whose schedule takes the species past the
citation the state teaches (the S1 ruling); `json_author` must not add `config.explore_orbitals`,
annotations, or a `z_eff` HUD line outside S7.

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `atomic_and_ionic_radius` → cliff at **S2** (Z_eff/screening): one
clause patches it — "fluorine's outer electrons sit in the same shell as lithium's, but feel far
more protons" — restating the result without re-teaching Slater; students WITH the prerequisite
hear a reminder, not a lecture. Second cliff at **S4** (shell opening): one clause — "sodium's
outer electron starts in a new, farther shell". Third cliff at **S7** (subshells + `z_eff`
symbol): S7 rings `extended`, mirroring the sibling's S8 (its subshell state) ringing extended —
the Phase-0 ordering ruling ("a state cannot survive a cut its foundation does not survive")
holds across the concept seam; S7's narration still gives boron's flip one literal clause ("the
new electron sits in a different, slightly higher subshell") so the state stands alone for a
teacher entering via the `anomalies` aspect.

**JEE-backwards trace.** *"An element's successive ionisation enthalpies are 577.5, 1816.7,
2744.8 and 11577 kJ/mol. State its group, and explain why the fourth value is so large."* Needs:
what ΔᵢH is (S1) · that successive removals cost more, catastrophically so past the valence shell
(S5) · reading the count off the jump position (S6). Delivered. Second stem: *"Arrange B, Be, N,
O by first ionisation enthalpy and explain both inversions."* → S3 (baseline rise) + S7 (both
anomalies, both causes named). Covered; no missing piece, no state added.

**Misconception entry mapping (16a).** Belief 1 ("every electron costs about the same"):
planting risk is S1–S4's one-number-per-species smoothness — flagged at the planting moment: S2's
narration attributes cost to pull-at-distance, never to "electrons being alike"; S5 confronts
(§4). Belief 2 ("IE just rises across a period"): planting risk is **S3 itself** — its narration
says the cost climbs "step by step" and never "always", setting the rule without overclaiming;
S7 confronts (§4). No 16b branches.

## Block 2 — Aha-moment designation

- **PRIMARY aha (S5):** *sodium gives up its first electron for 495.8 kJ/mol and demands 4562 for
  the second — a nine-times wall, not a slope — because the second electron comes from a closed
  inner shell: the staircase makes shell structure READABLE in an energy measurement.*
- **SUPPORTING aha (S3):** the inversion — the same rising pull that shrinks the atom raises the
  removal cost; radius and IE are one cause read in two directions. (1 + 1 — sweet spot.)
- **Cohesion:** S3 establishes "cost tracks pull"; S5's cliff is that same law hitting a shell
  edge — the supporting aha supplies the reading the primary depends on. No orphans (S7's
  honesty beat reinforces the LIMITS of the S3 mechanism and points back at it).
- **Wrong-belief setup:** PRIMARY — S1–S4 earn "removal cost varies gently" (smooth trends, one
  cost per species); S5 breaks it. SUPPORTING — the sibling concept earns "smaller = just a size
  fact"; S3 breaks it by showing size and cost move oppositely under one cause.
- **Foundational coverage:** primary at S5, outside `foundational` → mandatory exit-pill (§7).
- **Cross-reference:** deep-dive flags (S5, S7) — S5 coincides with the primary-aha/cliff state;
  S7 diverges from the aha pair deliberately: it is flagged for exam-frequency (the anomaly
  ordering trap), documented here per the divergence rule.

## Source check (chemistry form)

*Consulted NCERT Chemistry Ch.3 index (§3.7.1 c) to confirm scope and to take the exact
vocabulary a CBSE/JEE student meets — "ionisation enthalpy", "successive ionisation enthalpies",
ΔᵢH₁, the Be/B and N/O anomalies; NCERT Exemplar consulted for the two misconception beliefs
only. No teaching method, no example problem, no figure imported.*
**Engine-verified figures (read from `OS_IE` at `:60000–60021` and the renderer's own stated
arithmetic):** every IE quoted — Na 495.8 / 4562 / 6910.3 · Li 520.2 · F 1681.0 · K 418.8 ·
Be 899.5 · B 800.6 · N 1402.3 · O 1313.9 · Ne 2080.7 · Mg 737.7 / 1450.7 / 7732.7 ·
Al 577.5 / 1816.7 / 2744.8 / 11577 (all kJ/mol, cited CRC 97th / NIST ASD, stamped `(measured)`
by the engine); the model spread 1.07× (Li) → 5.40× (Ne) (`:59986`); the staircase draw counts
Na 3 / Mg 4 / Al 5 (derived by `osIeDrawCount` = valence count + 2 — verified by reading
`:60055–60067`; `chemistry_author` confirms on the frame); the shell radii endpoints carried over
from the sibling's engine-verified set (Li 371.46 → Ne 72.31 pm; Li 371.6 → Na 469.0 → K 808.71
pm). **DESIGN TARGETS for `chemistry_author`:** F's shell radius at S2; the six intermediate S3
radii (Be→F); the 9.2× ratio's on-surface rounding (4562 / 495.8 = 9.20 — state as "9.2 ×",
arithmetic on citations).

## DEVIATIONS from Phase 0 (declared, not silent)

1. **8 states, not 9 — S8 (oxygen) merged into S7.** Phase 0's OWN flagged build-time fallback,
   executed on verified engine facts: no pairing depiction exists (`spin` = rotation `:59171`;
   `populate_steps` clouds are occupancy-independent; only the `config` string changes 2p³→2p⁴ —
   the text-only-cause scar's verbatim shape). Merged S7 shows BOTH dips on one
   `ie_vs_z`+`model_series` axis; boron's cause depicted (family flip), oxygen's narrated over
   its visible dip. Rings shift accordingly: core S1–S6 · extended S7 · explore S8; the extended
   ring keeps its own misconception beat (belief 2 at S7), so no ring ships beatless.
2. **S2 "side by side" realised as a concentric held-ghost comparison** — the scenario has one
   stage; the ghost idiom is its verified comparison primitive.
3. **S5's "which e⁻" control realised as the `charge` dial** — IE index = charge + 1 by the
   engine's own contract; there is no separate which-electron key (documented `:60022–60029`).
4. **The explore state's Phase-0 "curve" control DOES NOT EXIST as a control row** (frozen set
   `orbital · dots · spin · probe · schar · twist · element · charge · zeff`, `:59319`). Realised
   by FIXING the explore curve to `'ie_successive'` — the core payoff, and the map both remaining
   dials genuinely drive (charge walks the marker, element moves the cliff). Explore exposes
   `['element','charge']` = every dial any guided state exposed (Rule 31c satisfied).
5. **S1's IE₁ lives on the static formula surface, not the `ie_measured` HUD** — the HUD tracks
   the live species and would print IE₂ = 4562 after S1's removal cut, pre-spoiling S5's cliff.
   The HUD debuts at S2 (§Content ruling 2).
6. **No `z_eff` HUD line in any core state or in the explore state** — Phase 0's S3 row lists
   "r AND IE₁ live" (honoured verbatim); the Z_eff SYMBOL is not established by this concept's
   core states (it is the prerequisite's), so under Rule 38b it surfaces only at extended S7.

## Where the design wants something the contract doesn't provide (all designed around)

- **No electron-spin / orbital-pairing depiction** → the oxygen anomaly state is CUT (Deviation
  1); the residual narration-only cause inside S7 is declared and scoped (§Content ruling 1).
- **Species/charge changes are CUTS, not tweens** — and for ionisation the cut IS the physics
  (bound or gone); every cut's legibility is a held ghost, a complete map with a stepping marker,
  or a stepping cited readout; §3 names the primitive per cell.
- **`ie_measured` cannot be scheduled or hidden mid-state** → S1's formula-surface workaround
  (Deviation 5).
- **No "curve" control row** → explore curve fixed (Deviation 4).
- **The overlay has no glow key** (carried gap) → S3/S5/S6/S7 bind NO glow focal; the overlay
  event carries the beat (sibling-S3 precedent).
- **The auto-LOG axis at S7 cannot be declined** when `model_series` spans a decade → accepted as
  designed-for behaviour (`:60283`), extended-ring only, glossed in one clause.
- **An anion prints `IE = —` unindexed** (`:64723`) → reachable only by teacher drags in S8;
  accepted as the engine's honest surface, no gloss owed (explore has no narration).
- **The radius HUD relabels `r =` → `lobe tip =` on lobe states** (branch still live) → S7 (the
  only dumbbell state) drops the `radius` line; every other radius-showing state renders spheres.
- **No side-by-side dual stage** → all comparisons are concentric held-ghost or overlay-carried.

## Self-review (architect checklist — result)

Atomic claim one sentence ✓ · 8 states, complex band, Phase-0 arc executed with its own flagged
fallback taken and declared ✓ · control table complete with the binding **Exposes `controls:[]`**
column, explore walked FIRST (caught the nonexistent "curve" row) ✓ · every motion cell names its
primitive — cut / reveal beat / marker-cut / map-swap; zero ramps, zero tween verbs ✓ · seven
distinct archetypes + open, no repeat (the declared S7/S8 repeat pair dissolved with the merge),
none static (S8 via `mode:'explore'`), sandbox last, ≥2 advance modes ✓ · Rule 32 plan honest
(ghost before-pins at S1/S2/S4; simultaneity at cuts stated, no false lead claimed; no
`camera_steps`, no glide forfeits; four no-focal states declared) ✓ · Rule 33 does-not-fire
declared ✓ · Rule 34 budget per state, one surface each where authored, no annotations ✓ ·
Rule 38 block complete: both cuts both directions, S8 core-only (z_eff excluded on 38b grounds),
tags claimed with verification flags, presets derived, axes decided ✓ · Rule 41: titles/cues/fix
lines literal ✓ · misconception_watch at TWO genuine pivots, one per ring (Phase-0 A1 honoured) ✓
· deep-dive flags 2, three clusters each, S7 divergence from the aha pair documented ✓ ·
entry_state_map + mandatory exit-pill ✓ · prerequisites advisory; sibling assumed, never
re-taught, cliffs patched in clauses ✓ · anchor universal, homed at S1, 12-word budget ✓ ·
NCERT vocabulary imported (ΔᵢH₁, successive ionisation enthalpies, the anomalies), prose/figures
not ✓ · engine never computes an IE — every IE a citation with the `(measured)` stamp; the model
appears only beside the measurement in its own colour/dash/mark ✓ · S3 carries BOTH numbers live
(the Checkpoint-A contrast-pair condition) ✓ · provenance split engine-verified vs design-target
✓ · bug-queue: twelve scar classes dispositioned by name; live query NOT run (no Bash in this
grant) — FLAGged to quality_auditor ✓ · zero TBDs ✓.
