# SKELETON — `atomic_and_ionic_radius`

> **Architect skeleton v3.1 — 2026-08-07 (v3 + the five Checkpoint-A cycle-2 patches: S4 re-cast as marker-walks-a-complete-curve, S4 cause-first claim withdrawn, S8 controls:[], the spherical-average qualifier declared with a narration duty, the stale zeff-dial limit withdrawn) — 2026-08-07 · desk `feat/chemistry-periodicity` · CYCLE 2 revision after
> Checkpoint A `DESIGN_FIX` (8 P1s: 7 unauthored keys + 1 vocabulary rewrite) + engine builds 5–6.**
> Chapter: NCERT Cl.11 Ch.3 (`CHEMISTRY_CHAPTER_NAMES[3]`, already plumbed).
> Renderer: `field_3d` · `scenario_type: "orbital_shapes"` · engine builds 1–6 LANDED.
> **Binding upstream design:** `docs/CHEMISTRY_PHASE0_PERIODICITY.md` §0b (sealed 9-state arc) +
> §Config contract (three blocks: "What EXISTS" · "⛔ DOES NOT EXIST" · "⛔ NEW GAPS") +
> **§THE MOTION VOCABULARY**, which governs every motion cell below: this scenario's primitives are
> (1) instantaneous SWAPS/CUTS (`element_steps` · `charge_steps` · `gallery_steps` ·
> `populate_steps`), (2) ONE continuous ramp (`z_ramp`, plus the pre-existing reveal beats),
> (3) camera moves (`camera_steps`, build 5). **Every motion cell in §3 names its primitive.** A
> species or charge change is a CUT — the engine is RIGHT to cut (a tween between Li and Be would
> draw an atom that does not exist; between Na and Na⁺, a half-ionised sodium) — so legibility at a
> cut comes from a held comparison (`ghost_species`), a duration, or a live readout, never from an
> eased contraction the engine does not make.
> Downstream: `chemistry_author` (position #2), then `json_author`. JSON lives in
> `src/data/concepts/chemistry/` — Gate 8b: NO registration in the 8 physics sites.
> **v2 → v3 in one line: the arc, rings, pairing, misconception placement, anchor, entry_state_map,
> assessment stems and Blocks 1–2 are UNCHANGED (all cleared at Checkpoint A); what changed is the
> motion vocabulary (tween verbs → cut/step language with named primitives) and seven engine keys
> the now-capable engine requires authored (`as:'core'` · `clear:true` · `camera_steps` ×2 ·
> `mode:'explore'` · `orbital:'shell'` · the 4-step S8 gallery · the S8 ledger re-realisation),
> plus every affected pm figure re-derived to the build-6 shell/radial laws.**

**Engine-bug-queue note:** the dispatch granted a live-queue query but this session's tool grant
carried no Bash; the queue was NOT queried live. Scars addressed structurally in this revision:
`skeleton_choreography_written_in_tween_vocabulary_the_engine_renders_as_a_cut` (OPEN, owner
`alex:architect` — THE fix this revision exists for: every §3 motion cell now names its primitive,
all continuity verbs removed except where `z_ramp` or a reveal beat genuinely drives them);
`taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` (OPEN,
recurring — declared for S2/S6 in §Where-the-design-wants, ghost re-cast as "the before" not "the
cause"); plus the three carried from v2: `phase0_union_table_asserted_not_walked_state_by_state`
(the **Exposes `controls:[]`** column, re-stamped against builds 5–6 below);
`field3d_invariant_object_on_a_multi_object_stage_has_no_silhouette_to_track` (S7's pin is the
engine's own `electron_count` surface with the MEASURED `(held)` stamp);
`field3d_explore_picker_renders_blank_when_handed_a_value_its_option_list_lacks` (S8 authors
`config.explore_orbitals`, now the 4-entry list). Also honoured: the FIXED ghost-outlives-its-phase
scar (S6 authors `clear:true` AT the element swap — the verbatim reproduction case). Previously-
honoured scars carried from v1/v2: inert-mode-string (no guided state authors `mode`; S9's
`mode:'explore'` is the build-6 EXPLORE key, not a camera string), anchor-homed-with-budget,
narration-never-attributes-an-effect-the-model-lacks (load-bearing at S5 group-jump magnitude AND
S6 Phase B), `populate_baseid` (S8 base = first gallery step), closed-enum discipline (freeze check
re-run over `element`, `orbital` — now incl. `'shell'` — `curve`, `mark`, `hud_lines`, the
control-row set, `mode:'explore'`, AND the glow keys).
**FLAG to quality_auditor: run the live queue query at Gate 8 and diff against this list.**

---

## 1. Atomic claim

This concept teaches **what sets the size of an atom or ion — the effective pull per outermost
electron (Z_eff = Z − S) — and only that**, covering the period trend, the group trend, ion
formation, and the isoelectronic series. It does NOT cover ionisation enthalpy (deferred to
`ionisation_enthalpy`, this wave's #2, which takes this concept as prerequisite), electron gain
enthalpy or electronegativity (ledger), or metallic/van-der-Waals radius definitions (ledger —
model radius only, stamped).

## 2. State count + arc (9 states — Phase 0 binding; arc sealed at Checkpoint A, unchanged)

Complexity: complex (7–9 band). 8 guided + 1 explore. The hook moves at S1 (orbit prop dissolves
into a measured cloud). `teaching_method`: S1–S8 omit the field (straightforward motion beats,
Rule 31); S9 `exploration_sliders`.

| # | id | Purpose (one line) | Ring |
|---|---|---|---|
| S1 | `STATE_1` | Define the size we measure — r₉₀ of the electron cloud; anchor: lithium ions in a phone battery | core |
| S2 | `STATE_2` | One electron, more protons: H → He⁺ → Li²⁺, the shell smaller at each step | core |
| S3 | `STATE_3` | Inner electrons reduce that pull — the core appears, the outer shell relaxes out; Z_eff = Z − S | core |
| S4 | `STATE_4` | Across a period: same shell, rising Z_eff, radius falls step by step | core |
| S5 | `STATE_5` | Down a group: a new shell opens and resets the size upward | core |
| S6 | `STATE_6` | Make ions: remove an electron — big shrink; add one — small growth (the asymmetry taught) | core |
| S7 | `STATE_7` | Isoelectronic series — electron count HELD at 10, radius still falls (the beat) | core |
| S8 | `STATE_8` | Where S comes from — shell-by-shell screening ledger (Slater groups) | extended |
| S9 | `STATE_9` | Explore — element, charge, Z_eff dials live (core-ring content only) | explore |

State titles (Rule 41d — literal; varied from delta cues where Checkpoint A flagged verbatim
duplication at S3/S8): S1 "The size of one atom" · S2 "More protons, smaller shell" ·
S3 "Screening by inner electrons" · S4 "Across a period: smaller" · S5 "Down a group: larger" ·
S6 "Making ions: remove or add electrons" · S7 "Same electron count, smaller ions" ·
S8 "Where S comes from: inner shells" · S9 "Explore atomic and ionic size".

## 3. Per-state choreography + control plan (Rule 31 — FIRST design artifact)

**Column contract (union-scar 3rd recurrence, binding):** *Distinct motion* = what the state
RENDERS, **with the driving primitive named in-cell** (§THE MOTION VOCABULARY — cut ·
ramp · reveal beat · camera step); **Exposes** = the exact `controls:[]` values from the frozen
row set (`orbital · dots · spin · probe · schar · twist · element · charge · zeff`) the state
EXPOSES — `—` means `controls: []`, legal on a watch-beat (Rule 31c: motion ≠ interactivity). A
dragged dial seizes its parameter at the ONE place the schedules are read (`osElementAt` /
`osChargeAt` / `osZEffAt`), so a drag is bit-for-bit the scheduled picture. **This walk was re-run
against builds 5–6 (2026-08-07):** the control-row set is unchanged (no new rows landed); what
builds 5–6 added are SCHEDULE/CONFIG keys, not controls — the scriptable-knob list is now
`element_steps · charge_steps · z_ramp · gallery_steps · ghost_species` (with per-entry **`as`**
and **`clear`**) · **`camera_steps`** · **`mode:'explore'`** · **`orbital:'shell'`** ·
`config.explore_orbitals` · `probe_auto` · reveal beats. Per-state Exposes values below are
re-confirmed unchanged.

| # | Teaches | Archetype | Distinct motion (renders — primitive named) | Delta cue (≤5 w) | Exposes `controls:[]` | Real number | Dur | Words | Ring | advance_mode | Vertex |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S1 | The size we measure — r₉₀ | `shell-settle` | H's Bohr-orbit prop dissolves into accumulating measurement dots (`measure-stipple` — REVEAL BEATS, genuinely continuous); the r₉₀ boundary settles over the swarm (reveal beat) | "One electron, one shell" | — | r₉₀ = 141 pm (model) | 14s | 35 (12 = anchor) | core | manual_click | particulate |
| S2 | More protons pull the one shell in | `nucleus-charge-up` | One-electron ladder H → He⁺ → Li²⁺ as two paired scheduled CUTS (`element_steps`+`charge_steps`): a ghost outline PINS the before ~0.6s ahead (reveal beat), then the 1s cloud CUTS to its new smaller size — no in-between atom is drawn. Legibility at each cut = the held ghost + the falling radius HUD; the element HUD string names the new Z (a TEXT-only cause — declared scar, see §Where) | "More protons, smaller shell" | — | r₉₀: 141 → 70.5 → 47.0 pm (model, 1s law r₉₀/Z); Z = 1, 2, 3 named on the element line | 16s | 45 | core | manual_click | particulate |
| S3 | Inner electrons reduce the pull | `core-reveal-relax` (coined: the held core outline appears, then the outer shell relaxes outward — no peel machinery exists or is needed) | Na's outer electron opens at the size the full 11-proton pull would give (~94 pm); the CORE outline APPEARS from nothing (`ghost_species` with **`as:'core'`** — build 5/6; ≈61.8 pm, RADIAL law) and holds; after ~1s the 3s cloud relaxes OUTWARD **continuously** to ~469 pm — this is the scenario's ONE true ramp (`z_ramp`, 11 → 2.2), so continuity verbs are earned here and only here. NO glow focal authored (see Rule 32 note) | "Inner electrons reduce the pull" | `zeff` (dial range is 0.15–19.70, enum-derived (build 5) — the opening Z_eff = 11 IS reachable by drag; the teacher can return to the bare-pull picture) | Z_eff = 11 − 8.8 = 2.2 (Slater); r: ~94 → ~469 pm (model); core ≈61.8 pm | 18s | 50 | core | manual_click | particulate → symbolic label |
| S4 | Across a period the shell stays, the pull rises — because a same-shell electron screens only 0.35, so net pull climbs with Z | `period-sweep` | Eight scheduled CUTS Li→Ne (`element_steps`, **`orbital:'shell'`** — build 6: ONE spherical silhouette across all eight steps, 371.46 → 72.31 pm, no sphere→dumbbell flip at boron): at each cut the strip cell and the shell resolve TOGETHER (one `osElementAt` per frame — no lead is authorable, see Rule 32 note) and the shell CUTS to its next smaller size; the radius HUD steps down. **The trend curve is COMPLETE at ms 0** — `osDrawCurve` builds the whole period every frame and only the yellow marker is time-dependent (`:60245-60259`) — so it is authored as a MAP, not as evidence being built: the marker WALKS a curve already on screen, exactly as a teacher points along a printed graph. **Legibility = the shrinking shell + the stepping radius HUD** (the primary evidence, genuinely per-cut); the curve is orientation, and narration must never say "watch the curve build". Camera FIXED | "Same shell, smaller each step" | `element` | Z_eff (Slater) + r pm per element; 371.46 → 72.31 pm (shell, endpoints engine-verified) | 16s | 45 | core | manual_click | particulate + symbolic (strip) |
| S5 | Down a group a new shell resets it | `group-step` | Two scheduled CUTS Li→Na→K (`element_steps`): the strip marker drops one PERIOD row, a ghost (`ghost_species`, reveal beat −600ms) HOLDS the previous atom's boundary, then the new, visibly larger shell (2s→3s→4s) APPEARS in one cut over it. Legibility = the held-ghost size comparison + n/r HUD, not a growth tween | "New shell, larger again" | `element` | n and r per step: 371.6 → 469.0 → 808.71 pm (model — narration claims DIRECTION only, never the size of the jump; see §Content rulings) | 15s | 40 | core | manual_click | particulate + symbolic (strip) |
| S6 | Remove or add an electron at a fixed nucleus — and why the two changes differ in size | `ion-charge-sweep` | **`orbital:'shell'` throughout** (all four species render as spheres; no dumbbell flip, HUD label constant). Phase A (wide frame): ghost pins neutral Na (reveal beat); at the charge CUT the shell CUTS 469.0 → 61.75 pm — the whole outer shell gone in ONE step; the held ghost makes the 7.6× gap read as a held comparison. At 9000 ms: element-swap CUT Na→Cl **with ghost `clear:true` pinned at the SAME at_ms** (the FIXED ghost-outlives-its-phase scar) + **`camera_steps`** re-frame to the tight Cl frame (Cl system ~2.5× smaller). Phase B (tight frame): ghost pins neutral Cl; at the charge CUT the shell STEPS outward past the held outline by +6.1% — a small step, taught as small; ghost + radius HUD carry it. Charge changes are TEXT+cut only causes (declared scar, §Where) | "Remove: big. Add: small" | `charge` | 469.0 → 61.75 pm (7.6×, shell); Cl ≈159.6 → Cl⁻ ≈169.3 pm (+6.1% — ratio engine-exact, pm values DESIGN TARGETS) | 18s | 50 | core | manual_click | particulate → symbolic (ion equation) |
| S7 | **Isoelectronic series — the misconception beat** | `count-held-Z-swept` | Six paired scheduled CUTS (`element_steps`+`charge_steps` at identical at_ms), **`orbital:'shell'`** — all six species render as spheres: the `electron_count` HUD line holds `10 e⁻ (held)` — the engine's own MEASURED stamp — while at each cut ONLY the shell steps smaller, radius HUD falling 148.42 → 47.80 pm. Legibility = the pinned readout beside the stepping readout; no ghost, no strip | "Same electron count, smaller" | — (exposing `element` or `charge` alone would break the pinned pairing; deliberately zero) | 148.42 · 109.87 · 87.22 · 61.75 · 53.89 · 47.80 pm (shell law, engine-verified); count 10 throughout | 20s | 55 | core | manual_click | particulate |
| S8 | Inner shells set the screening | `subshell-fill` | K's occupied SHELLS walked as **FOUR** gallery SWAP cuts `1s → 2s → 3s → 4s` (`gallery_steps`; Slater groups ns+np together — 2s≡2p at Z_eff 14.85 and 3s≡3p at 7.75, so the 2p/3p steps carried no new number and are CUT); at each swap the **per-orbital `z_eff` HUD line** (build 5, verified) re-prints the falling pull — 18.7 → 14.85 → 7.75 → 2.2 — while the radius spans 7.53 → 808.71 pm (107.4×), each step re-framed by **`camera_steps`**. The Slater RULE sits as the one static formula surface; each step's arithmetic is spoken in NARRATION (no scheduled ledger surface exists — see §Where) | "Inner shells set the screening" | **—** (`controls: []`. v3 authored `['orbital']`; that picker is DEAD under `gallery_steps` — the schedule fills `active` at `:63251-63258` and a dragged `baseId` is blocked while `stepsPending` at `:63280-63281`, then the picker display desyncs after one drag. Shipped precedent: `atomic_orbitals_s_p_d` STATE_8, the gallery state, authors `controls: []`. Legal on a watch-beat, Rule 31c) | Z_eff per shell: 18.7 · 14.85 · 7.75 · 2.2; r 7.53 → 808.71 pm (endpoints engine-verified) | 18s | 50 | extended | manual_click | symbolic-supported particulate |
| S9 | Explore | `open` (`drag-sandbox`) | **`mode:'explore'`** (build 6 — idle spin + the explore branch of `deriveStateMeta`; coexists with the explicit `camera`, which is kept): teacher drives the three periodicity dials; each drag is a live CUT/seize at the single schedule-read site; cloud (**`orbital:'shell'`** — dragging element/charge never flips the silhouette family), strip, curve and HUD respond live; free-runs (Rule 37). The anion direction (S6 Phase B) is re-drivable here at any element | — | `element` · `charge` · `zeff` — ALL | live | open | 0 | explore | interaction_complete | all |

**No-repeat check:** eight distinct archetypes + `open`; `core-reveal-relax` coined with its
justification in-cell. FOUR states use `ghost_species` (S2, S3, S5, S6 — v2 miscounted three) —
the ghost is the scenario's "hold the BEFORE for comparison" idiom (re-cast from v2's "cause":
the ghost is the before, never the cause — see §Where), and the four ROLES stay distinct: S2 holds
the previous rung of a 1s ladder; S3's is the `as:'core'` core region appearing from nothing (a
different key form and a different meaning); S5 holds the previous GROUP row under a structurally
larger new shell; S6 holds each neutral atom across a charge cut, cleared at the phase swap. S2
and S7 are both fixed-count/rising-Z but are NOT the same beat: S2's count is trivially one (no
belief in play); S7's pin lands after S6 has planted "electrons drive size". Cross-concept
`period-sweep` pair (radius S4 ↔ IE S3) declared in Phase 0's shared preamble.

**Rule 32 per row (revised to the cut vocabulary + builds 5–6):** where a true cause-first beat is
authorable it is authored — S3: the core outline appears ~1s before the ramp starts (reveal beat
before ramp; the one state where cause and effect read from different resolved values). At the CUT
states the engine renders cause and effect in the same frame, so the sequenced element is the
BEFORE: S2/S5/S6 pin the ghost ~0.6s ahead of the cut — legitimate, because the ghost resolves
through its OWN schedule at its own `at_ms`, i.e. a genuinely different resolved value.
**S4 claims NO cause-first beat** (v3 asserted "the strip cell moves FIRST" — that was false and is
withdrawn): `osDrawStrip` and the shell resolution run in the SAME frame pass from the SAME
`osElementAt(os, ms)` (`:63387` / `:63401-63411`), so they are two renderings of one per-frame
variable and this section's own constraint forbids separating them by timing. S4's beat is a
simultaneous step, honestly described. The rendered cause at S2/S6 is a HUD string only (nucleus
mesh is Z-invariant — declared scar, §Where). Only
the taught variable moves (S9 exempt); delta column = the on-canvas cue verbatim; same apparatus
from a home pose (element changes are strip-anchored cuts of one persistent silhouette, never
teleport-rebuild). **Camera:** two states author `camera_steps` (S6 phase boundary; S8 per gallery
step) — **declared consequence: authoring `camera_steps` forfeits the entry glide, so S5→S6 and
S7→S8 are hard camera cuts at state entry**, a declared deviation from the home-pose glide (the
apparatus itself still persists; only the framing cuts). One glow focal per instant — always a
mesh from the CLOSED glow enum; the overlay has NO glow key (known gap) — no state binds focus to
strip/curve. **S3 binds NO glow focal at all:** `os_ghost_sphere` shares
`elementType:"os_surface"` with the live cloud, so a `surface` focal would light BOTH (Rule 32e
violation); the core's APPEARANCE from nothing is the visual event and needs no glow.

## 3b. Per-state ENGINE CONFIG intent (every key verified at its call site, builds 1–6)

Global: every state authors its own `camera: {az,el,dist}` + `dot_target` (mandatory); S6/S8
additionally author `camera_steps` (build 5); S9 additionally authors `mode:'explore'` (build 6).
Compute, don't guess: frame so the largest boundary shown fills ~55–65% of frame height, `dist`
scaled from the shipped hydrogen solves by (target r / hydrogen r); `dot_target` scaled to hold
density, verified via `PM_osVisDots`. Never author `z_eff` and `z_ramp` on one state. `overlay`
only where an element SOURCE exists (`ovHasElem`). `model_series` never authored.
**Paired-schedule pin rule (DoD-j):** `element_steps` + `charge_steps` always at IDENTICAL
`at_ms`; `ghost_species` deliberately −600 ms as the declared before-pin beat; S6's ghost
`clear:true` entry at the SAME `at_ms` as the element swap; **no reveal pin binds to any
`element_i` / `charge_i` / `ghost_species_i` cue name** — reveals bind to `at_ms` or non-schedule
cues only, so no window can render the wrong species.

| # | Engine config intent |
|---|---|
| S1 | `element:'H'`, `orbital:'1s'`, `z_eff:1`, dissolve/stipple cues (existing machinery), `overlay:null`, `hud_lines:['radius']`. Radius HUD prints `r = 141 pm (90%)` — the `(model)` stamp is the CAPTION's duty. Camera ≈ shipped 1s solve |
| S2 | `orbital:'1s'`, `z_eff:'slater'` (S = 0 for one electron, so Z_eff = Z exactly — derived, never authored), paired `element_steps:[{0,'H'},{5500,'He'},{10500,'Li'}]` + `charge_steps:[{0,0},{5500,+1},{10500,+2}]` (identical at_ms), `ghost_species:[{4900,'H',0},{9900,'He',+1}]`, `hud_lines:['element','radius']` — the element line prints `He⁺ · Z = 2 · 1 e⁻`, which NAMES bare Z (no `'z'` HUD line exists; no `z_eff` line authored — Z_eff is first taught at S3). Formula surface: `r ∝ 1/Z (model)`. Camera FIXED at the H framing (largest). Ion-notation gloss duty: narration glosses the ⁺ in one clause (Block 1) |
| S3 | `element:'Na'`, `charge:0`, `orbital:'valence'` (→3s, derived; a sphere — `r =` label throughout), `z_ramp:{from:11, to:2.2, at_ms:≈4500, duration_ms:≈6000}` (opens at the bare-pull size ~94 pm, relaxes OUTWARD to ~469 pm), **`ghost_species:[{at_ms:≈3400, element:'Na', charge:+1, as:'core'}]`** — build 5/6: the `as:'core'` key renders the held Na⁺ as its CORE region (RADIAL law, **≈61.8 pm** — corrected from v2's "~70 pm", which was the valence/lobe-tip number; without `as:'core'` the ghost would render the 2p_z dumbbell). **NO glow focal authored** (shared `elementType` — §3 note). `controls:['zeff']` (drag seizes the ramp's parameter; dial range 0.15–19.70 enum-derived, build 5 — the opening 11 IS reachable by drag). `hud_lines:['element','z_eff','radius']` (`config` DROPPED — subshell notation untaught until S8). Formula surface: `Z_eff = Z − S = 11 − 8.8 = 2.2 (Slater)` — caption carries the `(Slater)` stamp during the ramp. Camera framed for the FINAL relaxed 3s (~469 pm; motion grows into frame). Exact S verified by `chemistry_author` |
| S4 | **`orbital:'shell'`** (build 6 — one silhouette Li→Ne, 371.46 → 72.31 pm; no sphere→dumbbell flip at boron; radius HUD keeps ONE label), `z_eff:'slater'`, `element_steps:[Li,Be,B,C,N,O,F,Ne]` at ~1.6s intervals, `overlay:{table:true, curve:'radius_vs_z', mark:'line'}` (all species NEUTRAL), `controls:['element']`, `hud_lines:['element','z_eff','radius']` (`config` dropped). Camera fixed, framed for Li. Intermediate pm values are DESIGN TARGETS (endpoints engine-verified) |
| S5 | `orbital:'valence'` (2s→3s→4s — all spheres), `z_eff:'slater'`, `element_steps:[{0,'Li'},{5000,'Na'},{10000,'K'}]`, `ghost_species:[{4400,'Li',0},{9400,'Na',0}]`, **`overlay:{table:true, curve:null}`** (group form deliberately absent), `controls:['element']`, `hud_lines:['element','radius']`. Rides row L (3s, 4s). Optional cutaway NOT authored (node rings unexplained to the S5 audience — Block 1). Camera framed for K's 4s. **Narration duty: DIRECTION only** — the model's group jumps are +26% / +73% against the real ≈+22% / +22%, and K's 808.71 pm is ~3.6× the real ~227 pm; the narration says "larger again", never how much larger (the narration-attributes-an-effect scar, honoured) |
| S6 | `z_eff:'slater'`, **`orbital:'shell'`** (all four species spheres — no Na⁺ dumbbell, no HUD relabel), paired `element_steps:[{0,'Na'},{9000,'Cl'}]` + `charge_steps:[{0,0},{4000,+1},{9000,0},{13000,-1}]` (the 9000 ms pair pinned together), **`ghost_species:[{3400,'Na',0},{9000, clear:true},{12400,'Cl',0}]`** — the `clear:true` entry pinned AT the element swap (build 5; without it a 469 pm sodium outline sits around a ~160 pm chlorine for 3.4 s — the verbatim reproduction case of the FIXED ghost scar), **`camera_steps:[{0, wide-Na frame},{9000, tight-Cl frame}]`** (build 5 — declared consequence: entry glide forfeited, S5→S6 is a hard camera cut at state entry), `overlay:null`, `hud_lines:['element','radius']`. Formula surface (ledger): `Na → Na⁺ + e⁻` then `Cl + e⁻ → Cl⁻`. Phase-B honesty: the +6.1% swell is taught AS small (§Content rulings) |
| S7 | `z_eff:'slater'`, **`orbital:'shell'`**, paired `element_steps:[N,O,F,Na,Mg,Al]` + `charge_steps:[−3,−2,−1,+1,+2,+3]` at the SAME six `at_ms` (~3s apart), `hud_lines:['element','electron_count','z_eff','radius']` — the pin is the engine's `electron_count` line printing `10 e⁻ (held)`, the stamp MEASURED by the engine. **Declared duplication (build-4 surface, unchanged by 5–6): the `element` HUD line ends in the electron count (`… · 10 e`), duplicating the dedicated `electron_count` line beside it; dropping `element` is NOT available — `label` prints the orbital name, so species identity would vanish. Declared, accepted** (§Where). `overlay:null` (strip would compete with the pin and cannot be made focal), `controls:[]` — deliberately zero. Camera fixed, framed for N³⁻ (148.42 pm, shell law) |
| S8 | `element:'K'`, gallery SWAP walk **`gallery_steps:['1s','2s','3s','4s']`** — CUT from v2's six (Slater groups ns and np together: 2s≡2p at Z_eff 14.85, 3s≡3p at 7.75 — two of five transitions carried no new number and a ~0.02 pm radius change, on the state whose subject is the running ledger). Base `orbital` = first step (`populate_baseid` scar); swap-not-accumulate, so `OS_MAX_SETS` never binds. `z_eff:'slater'`, **`camera_steps`** per gallery step (build 5 — the span is 7.53 → 808.71 pm, **107.4×**: on one camera either the 1s is 0.9% of frame or the 4s is off it; declared consequence: entry glide forfeited, S7→S8 is a hard camera cut at entry), `controls:['orbital']` with **`config.explore_orbitals:['1s','2s','3s','4s']`** (blank-picker scar; S8 is the ONLY state exposing `'orbital'`, so the override leaks nowhere). **Ledger re-realised (v2's "the S ledger adds each group's contribution" is WITHDRAWN — `os_formula` is ONE static ~250px string with no schedule; an accumulating ledger has nowhere to live):** (1) the ONE static formula surface states the RULE — `S = 0.35·(same shell) + 0.85·(n−1) + 1.00·(deeper)` — arithmetic only (38c); (2) the running number lives on the **per-orbital `z_eff` HUD line** (build 5, verified), re-printing at each swap: 18.7 → 14.85 → 7.75 → 2.2 `(Slater)`; (3) each step's arithmetic is spoken in NARRATION. `hud_lines:['element','config','z_eff']` — `config` line legal HERE ONLY |
| S9 | **`mode:'explore'`** (build 6 — REQUIRED: without it the sandbox is byte-static AND `deriveStateMeta` takes the non-explore branch and expects motion, failing THE EYE and the Checkpoint-B Rule-37 probe; coexists with the explicit `camera`, which is kept), `z_eff:'slater'` default, **`orbital:'shell'`** (dragging element/charge never flips the silhouette family; HUD label constant), `controls:['element','charge','zeff']` — the three build-4 periodicity dials (each seizes at the single schedule-read site), `overlay:{table:true, curve:'radius_vs_z', mark:'line'}`, `hud_lines:['element','electron_count','z_eff','radius']` (`config` dropped — 38b core-only), formula surface `Z_eff = Z − S`. **Curve-vs-ion labelling (Content ruling 2, REVISED): NO authored annotation and NO `render_annotations` flag** — build 5's built-in legend already reads "Slater model · neutral atoms", saying exactly what the annotation was going to say; dropping the global flag also removes the annotation-behind-panel hazard DoD-j flagged. `advance_mode:'interaction_complete'` (free-runs, Rule 37). Camera framed for the largest reachable boundary; `dot_target` generous |

Enum discipline (full freeze check, per contract): every `element` (H, He, Li, Be…Ne, Na, Mg, Al,
Cl, K ∈ H…Ca), `charge` (−3…+3), `orbital` (`'1s'`, `'valence'`, **`'shell'`** — build 6,
gallery/picker names `1s·2s·3s·4s` ∈ the closed list), `curve` (`'radius_vs_z'`, `null`), `mark`
(`'line'`), every `hud_lines` value (`radius · element · electron_count · z_eff · config`), every
`controls` value (`zeff · element · charge · orbital`), **`mode:'explore'`**, every
`ghost_species` entry key (`at_ms · element · charge · as:'core' · clear:true`), `camera_steps`,
and every glow key named in this skeleton are inside their frozen sets. No `'psi2'`/`'probe'`
authored. No annotation and no `render_annotations` authored anywhere.

## §Content rulings

**Ruling 1 — S6 Phase B KEPT in the guided path, taught honest-and-tight (numbers re-derived to
the build-6 shell law).** Moving the anion to S9's charge dial fixes nothing — the dial drives the
same model. Instead the smallness is CONTENT: removal empties a whole shell (469.0 → 61.75 pm,
7.6×); addition only adds one same-shell neighbour, and a same-shell electron screens weakly
(Slater 0.35) — so the growth is small (Cl ≈159.6 → Cl⁻ ≈169.3 pm; the **+6.1% ratio is
engine-exact and law-independent** — same shell, Z_eff 6.10 → 5.75 — while the pm values are
design targets for `chemistry_author`). That asymmetry is real screening physics, readable off the
two ghost comparisons, and the delta cue says it: "Remove: big. Add: small." Narration states the
direction (anions are larger than their atoms) and why the model's change is modest — it never
narrates a large swell over a small picture. Camera: `camera_steps` cut to the tight Cl frame at
the phase boundary (the Cl system is ~2.5× smaller), making +6% of a frame-filling boundary plus
the moving radius HUD the legible evidence. No measured covalent radii on canvas or in narration.

**Ruling 2 — trend curve vs ion HUD, decided per state (REVISED at cycle 2).** S4: all species
neutral — no conflict. S5: `curve:null` by design. S6/S7: `overlay:null` (already ruled). S9: the
ONLY live conflict site — **resolved by build 5's built-in legend**, which reads "Slater model ·
neutral atoms" on the overlay: `Al³⁺ · 47.8 pm` in the HUD beside `Al` on the curve reads as two
labelled answers to two questions, not a contradiction. **v2's authored annotation + global
`render_annotations:true` are RETIRED** — the legend says the same thing, and dropping the flag
removes the z-index-9-behind-panels hazard. Plot-ions and hide-at-nonzero-charge remain rejected
for v2's reasons.

**Ruling 3 (new at cycle 2) — S5 narrates DIRECTION only.** The Slater model overstates the group
jump: Li 371.6 → Na 469.0 → K 808.71 is +26% / +73% against the real ≈+22% / +22%, and K at 813 pm
is ~3.6× the real ~227 pm. Direction right, magnitude wrong. The narration claims only "larger
again — a new shell opened"; no percentage, no "nearly doubles", nothing quantitative about the
jump. The on-canvas pm values stay (they are the model's own, stamped); the claim discipline is
narration-side.

## 4. Misconception confrontation plan (Rule 16a — one genuine belief) — UNCHANGED (cleared)

**Belief: "more electrons means a bigger atom."** Source: NCERT Exemplar-documented ion-size
confusion (`chemistry_author` cites the item; belief only, never prose).

- **Earned first:** S6 legitimately shows adding an electron growing the ion (and removal
  shrinking it) — the student leaves S6 confident electron count drives size.
- **Confrontation — S7 `misconception_watch`:** `belief`: "more electrons means a bigger atom" ·
  `visual_counter`: the engine's electron-count line holds `10 e⁻ (held)` while the radius falls
  148.42 → 47.80 pm across six ions · `one_line_fix`: "Size follows the pull per electron, Z_eff —
  not the number of electrons." Straightforward contrast beat; no predict/pause.
- No other state carries a watch. EPIC-C branches: none (EPIC-L-first directive).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates) — UNCHANGED

- **S3** — the concept's mathematical abstraction (Z_eff = Z − S); where "why doesn't the outer
  electron feel all 11 protons?" concentrates in multiple phrasings.
- **S7** — the core insight + exam workhorse (rank isoelectronic ions); the misconception's home.

All other states `false`. V1.0 ships zero authored deep-dives (Rule 18).

## 6. Drill-down clusters — UNCHANGED

S3: `slater_screening_walkthrough` (how S is counted, group by group) · `why_inner_electrons_screen`
(why an inner shell cancels pull but a same-shell neighbour barely does) · `zeff_vs_z_confusion`
(student uses full Z in a size argument).

S7: `isoelectronic_ranking` (order any 10-e⁻ or 18-e⁻ series) · `electron_count_vs_pull` (the
confronted belief in its typed forms) · `ionic_vs_atomic_radius_mixups` (comparing an ion to the
wrong neutral atom).

## 7. `entry_state_map` — UNCHANGED

```
entry_state_map:
  foundational:        STATE_1 → STATE_3   # what atomic size is and what sets it
  period_trend:        STATE_4
  group_trend:         STATE_5
  ionic_radius:        STATE_6 → STATE_7   # ions + isoelectronic series
  screening_subshells: STATE_8
```

Default aspect `foundational`. **Foundational-coverage rule:** the PRIMARY aha lives at S7,
outside the foundational slice → the foundational slice declares a **mandatory exit-pill** into
`ionic_radius` ("Same electron count, different size — see why", landing at S6 so the wrong
belief is earned before S7 breaks it).

## 8. Prerequisites (advisory, Rule 23) — UNCHANGED

- `bohr_model_energy_levels` (shipped) — shells exist and are discrete; also the home of the
  one-electron species (He⁺, Li²⁺) S2's ladder rides on.
- `atomic_orbitals_s_p_d` (shipped) — the cloud/r₉₀/measurement-dot picture S1 stands on.

Downstream: `ionisation_enthalpy` (this wave, #2) lists THIS concept as prerequisite.

## 9. Real-world anchor (Rule 35 / 38f) — UNCHANGED (cleared)

**Primary (home S1, 12 of its 35 words):** *in a phone battery, lithium ions carry the charge —
they fit through the electrode's narrow layers because they are among the smallest ions.*
Universal (phones/laptops/vehicles worldwide), brand-free, country-free, and causally defensible
(the ion's small radius is genuinely what lets Li⁺ move into and out of the gaps between electrode
layers — intercalation — so the size→function link asserted is real and survives depth).
Widest-syllabus device (38f). No secondary anchor — every other state's word budget is committed.

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the nine rows of §2, exactly.

**(b) Symbol-label table:**

| Quantity | On-canvas label | First taught |
|---|---|---|
| 90%-boundary radius | HUD `r = <n> pm (90%)`, or `r = <n> pm (90%, spherical average)` on an OPEN subshell — the `(model)` stamp lives in the state CAPTION, never the HUD. **The NOUN is constant** (every multi-species state authors `orbital:'shell'`, every other state renders a sphere, so the `r =` → `lobe tip =` relabel never fires). ⚠ **The QUALIFIER is NOT constant** — v3 wrongly claimed it was. `osShellExact` is false on any open subshell (`:60585`, printed `:64583-64585`), so the suffix APPEARS at boron in S4 (Li/Be closed → B…F open → Ne closed), TOGGLES across the Cl→Cl⁻ cut in S6 Phase B, and can appear on any drag in S9. **Authoring duty:** `chemistry_author` budgets one narration clause at its first appearance (S4, boron) — "for a part-filled shell we draw the average" — so it is never an untaught phrase (Rule 25); S6 and S9 inherit that gloss and add nothing | S1 (bare) / S4 (qualifier) |
| Nuclear charge | `Z = <n>` inside the HUD `element` line (`He⁺ · Z = 2 · 1 e⁻`) — no standalone `'z'` line exists | S2 |
| Screening constant | `S` | S3 |
| Effective nuclear charge | `Z_eff` (HUD prints `(Slater)` only when engine-derived; ramp values print bare — caption carries provenance during S3's ramp; **per-orbital since build 5** — S8's gallery re-prints it per shell) | S3 |
| Shell number | `n` | S5 |
| Ion charge | superscript on the species label (`Na⁺`, `Cl⁻`, `N³⁻`); glossed in one clause at first sight (S2) | S2 (gloss) / S6 (taught) |
| Electron count | HUD `electron_count` line: `10 e⁻ (held)` — the `(held)` stamp is engine-MEASURED. Declared duplication at S7: the `element` line also ends in `… 10 e` (§Where) | S7 |
| Electron configuration | HUD `config` line (`1s² 2s² 2p⁶ 3s¹`) — **S8 and S8 only** (untaught before; extended-ring after) | S8 |

All Unicode across DOM/graph/sprite paths (₉₀, ⁺, ³⁻, ⁻, ², ⁶ — Rule 34c; the engine already
prints `e⁻`).

**(c) Ledger plan (chemistry variant of the RHR row):** ion-formation equations as the S6 formula
surface (`Na → Na⁺ + e⁻`, `Cl + e⁻ → Cl⁻`), charges as proper superscripts; the Slater screening
plan at S8 = **rule on the static formula surface + running per-orbital Z_eff on the HUD +
per-step arithmetic in narration** (revised — no scheduled ledger surface exists). Every number
verified + stamped `(Slater)`. No reaction states → no state symbols / oxidation numbers.

**(d) Motion plan (primitive-named, per §3):** reveal-beat dissolve-settle (S1) · paired
CUTS ×2 with ghost before-pins (S2) · core reveal beat + the one z_ramp (S3) · shell CUTS ×8 with
accumulating curve (S4) · CUTS ×2 with ghost before-pins (S5) · charge/element CUTS with ghost
pins, one `clear`, one `camera_steps` re-frame (S6) · paired CUTS ×6 under the pinned count (S7) ·
gallery SWAP cuts ×4 with `camera_steps` (S8) · `mode:'explore'` free-run sandbox (S9). Nothing
static (S9 explicitly de-static'd by `mode:'explore'`); every schedule named in §3b; every
schedule key verified to exist in builds 1–6.

**(e) Modes (AMENDED at cycle 2):** guided states S1–S8 author NO `mode` key (the camera-table
string is inert decoration — filed scar; every state authors explicit `camera` + `dot_target`,
mandatory). **S9 MUST author `mode:'explore'`** — the build-6 explore key (idle spin +
`deriveStateMeta` explore branch); it coexists with S9's explicit `camera`. v2's blanket "mode
only as camera-table key" is superseded by exactly this one authorised use.

**(f) `assessment` + `coverage_map` + `misconception_watch`:** watch at S7 only (§4). Assessment
stems (chemistry_author drafts items): rank an isoelectronic series (→S7) · why Na > Mg (→S4) ·
why K > Na (→S5) · why Na⁺ ≪ Na and why Cl⁻ is only somewhat larger than Cl in the screening
picture (→S6) · compute Z_eff for a given element (→S3/S8). `coverage_map` maps each to its state.

**(g) Rule 33:** does NOT fire (Phase 0 correction — microscopic variable, microscopic
mechanism). The element strip exists on Rule 24/25 grounds. Live numeric readouts everywhere
(radius, Z_eff, pinned count).

**(h) Canvas budget (Rule 34):** ONE formula surface per state — S1 none · S2 `r ∝ 1/Z (model)` ·
S3 `Z_eff = Z − S = 11 − 8.8 = 2.2 (Slater)` · S4 none (the curve is the surface's job) · S5 none ·
S6 the ion equations · S7 none (the pinned count IS the argument) · S8 the Slater RULE (static;
the running number is HUD's job, the arithmetic narration's) · S9 `Z_eff = Z − S`. Caption = the
≤5-word delta cue only; prose below in the strip. HUD value-only. Overlay owns bottom-left
(formula auto-pushed top-left). **No annotation anywhere; `render_annotations` not authored**
(build 5's legend carries the S9 series label). Glow gap designed around: every focal is a mesh;
S3 binds no focal at all.

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Both cuts, both directions.** Cut A (hide extended S8): survivors S1–S7+S9 — no
  survivor names subshells (`config` HUD line appears ONLY at S8; S3's screening is shell-based;
  S5 says "new shell"; S9 carries no config line); reverse: every displayed quantity (r₉₀, Z, S,
  Z_eff, n, charge, e⁻ count) is introduced by a surviving state. Cut B (hide advanced+extended):
  identical — no advanced ring exists (contiguity trivial; S8 sits immediately before S9, 38a).
- **(i-2)** S9 surfaces core content only: `Z_eff = Z − S`, the three dials, radius curve,
  electron-count line — no subshell notation (config dropped from S9 for exactly this).
- **(i-3) `curriculum_tags` (38g):** CBSE/NCERT §3.7.1(a)(b) `full`, **verified**. JEE/NEET ·
  IGCSE · IB DP · AP · A-level all `full` + `needs_teacher_verification: true`.
- **(i-4) Presets:** `full` = S1–S9 · `core` = S1–S7, S9 (hides S8). Hide, never reorder.
- **(i-5) Graph axes (38e):** `radius_vs_z` plots r/pm (y) vs Z (x) — the convention shared
  across all six boards; no conflict, no axis-swap toggle; flagged `needs_teacher_verification`.

**(j) Schedule/flag discipline (revised at cycle 2):** paired `element_steps`+`charge_steps` at
identical `at_ms` in S2/S6/S7; `ghost_species` at −600 ms as the declared BEFORE-pin beat; **S6's
ghost `clear:true` pinned at the SAME `at_ms` as the element swap** (the FIXED
ghost-outlives-its-phase scar — the un-cleared case is its verbatim reproduction); **no reveal pin
binds to any `element_i`/`charge_i`/`ghost_species_i` cue** — reveals use `at_ms` or non-schedule
cues, closing the wrong-species window. **`camera_steps` authored at S6 and S8 ONLY, each with its
entry-glide forfeit declared** (§3 Rule-32 note). **`render_annotations` is NOT authored and no
state authors an annotation** — `json_author` must keep it that way (the S9 series label is build
5's built-in legend). `config.explore_orbitals` (`['1s','2s','3s','4s']`) is concept-level — S8 is
the only state exposing `'orbital'`, so the override leaks nowhere. S9 is the only state authoring
`mode`.

## Block 1 — Pass-1 strategic checklist — UNCHANGED (cleared)

**Prerequisite cliffs.** `bohr_model_energy_levels` → cliff at **S1** (no shell picture): S1's
dissolve beat opens on the familiar orbit prop and replaces it ("the electron is not on a track —
it is measured somewhere new each time"). Secondary cliff at **S2** (one-electron ions): narration
gives them one literal clause — "written He⁺: two protons, but still only one electron" — so the
superscript is glossed at first sight without teaching ion formation early (taught at S6).
`atomic_orbitals_s_p_d` → cliff at **S5** (node rings on 3s/4s): narration names the new shell
only by size and n ("a third, larger shell"); the cutaway is NOT authored, so no ring goes
unexplained.

**JEE-backwards trace.** *"Arrange N³⁻, O²⁻, F⁻, Na⁺, Mg²⁺ in decreasing ionic radius, and explain
why Na⁺ is smaller than Na."* Needs: what radius means (S1) · Z pulls (S2) · Z_eff (S3) · ion
formation and why removal shrinks (S6) · isoelectronic ordering by Z (S7). All delivered. Second
stem: *"Why is Na larger than Mg but smaller than K?"* → S4 + S5. Covered.

**Misconception entry mapping (16a).** Belief "more electrons = bigger atom": **planting risk is
S6 itself** — flagged at the planting moment: S6's narration closes by naming the held variable
("the nucleus never changed — only the count"), setting the hook without correcting; S7 confronts
(§4). Additional planting guard: S2 is a FIXED-count ladder, and its narration attributes the
shrink to protons, never to "fewer electrons". No 16b branch.

## Block 2 — Aha-moment designation — UNCHANGED (cleared; pm figures updated to shell law)

- **PRIMARY aha (S7):** *six ions with identical electron clouds — ten electrons each, and the
  count visibly held — and the size still falls step after step, because only the nucleus grew:
  size is set by pull per electron, not by electron count.*
- **SUPPORTING aha (S3):** sodium's outer electron feels ~2 protons' worth of pull, not 11 — the
  core outline appears and the shell relaxes outward. Supplies Z_eff, the exact variable the
  primary varies. (1 + 1 — sweet spot.)
- **Cohesion:** the supporting aha supplies the primary's working quantity. No orphans.
- **Wrong-belief setup:** PRIMARY — S6 builds "electron count drives size"; S7 breaks it.
  SUPPORTING — S2 builds "more protons always means much smaller" at full strength (Z_eff = Z with
  nothing in between); S3 tempers it with screening.
- **Foundational coverage:** primary at S7 is outside `foundational` → mandatory exit-pill (§7).
- **Cross-reference:** deep-dive flags (S3, S7) coincide with the aha states — no divergence.

## Source check (chemistry form)

*Consulted NCERT Chemistry Ch.3 index (§3.7.1 a/b) to confirm scope; NCERT Exemplar consulted for
the misconception belief only. No teaching method, no example problem, no figure imported.*
**Engine-verified figures (builds 1–6):** the isoelectronic shell-law series 148.42 · 109.87 ·
87.22 · 61.75 · 53.89 · 47.80 pm; the S4 shell sweep endpoints 371.46 → 72.31 pm; the group ladder
Li 371.6 → Na 469.0 → K 808.71 pm; the S8 gallery span 7.53 → 808.71 pm and its Slater-group Z_eff
values 18.7 · 14.85 · 7.75 · 2.2; the S3 core ≈61.8 pm (RADIAL law); carbon's Z_eff = 3.25.
**DESIGN TARGETS for `chemistry_author` to verify against the engine's own derivation** (never a
cited covalent table — none exists): the one-electron ladder radii (141 / 70.5 / 47.0 pm — 1s law,
unaffected by build 6); Na's S = 8.8 / Z_eff = 2.2 and the S3 opening ~94 pm; S4's six intermediate
pm values (Be→F); S8's intermediate shell radii (2s ≈ 32.5 pm, 3s ≈ 133.2 pm); **S6 Phase B's
Cl ≈159.6 → Cl⁻ ≈169.3 pm** (derived from hydrogen 3p r₉₀ ≈ 973 pm / Z_eff 6.10 → 5.75; the +6.1%
ratio is same-shell and therefore engine-exact regardless of the shell constant — verify the pm
pair, trust the ratio).

## DEVIATIONS from Phase 0 (declared, not silent)

1. **Row K (`energy` HUD) not claimed by any state** — aligned with the contract, which logs row K
   as unclaimed in this wave (−13.6 eV at S1 would be an untaught quantity, Rule 25).
2. **S6 uses two elements (Na then Cl) in two phases** — upheld at Checkpoint A on Rule 31;
   Phase B realised per §Content ruling 1; phase boundary now carried by `camera_steps` + ghost
   `clear:true` (build 5).
3. **S7 authors `overlay:null`** — upheld; the pin (the engine's own `electron_count` surface)
   carries the beat alone.
4. **S3's Phase-0 "shells (staged fill)" control** is realised as `controls:['zeff']` + the
   core-reveal-relax mechanism — a staged multi-shell fill is unbuildable (`OS_MAX_SETS = 3`,
   one sphere boundary, uniform Z scale), and the `as:'core'` ghost + outward relax teaches the
   same one idea within what exists.
5. **S8's gallery is FOUR steps, not Phase-0 §0b's implied six** — Slater groups ns+np together
   (2s≡2p, 3s≡3p), so the p-steps carried no new number on the ledger state; declared here, cue
   and purpose unchanged.
6. **S5→S6 and S7→S8 are hard camera cuts at state entry** — the price of `camera_steps`
   (entry-glide forfeit, declared in §3); the apparatus itself persists (no teleport-rebuild).

## Where the design wants something the contract doesn't provide (all designed around)

- **Species/charge changes are CUTS, not tweens** (`element_steps`/`charge_steps` are
  latest-fired-wins, no ease — and rightly so: the in-between atom does not exist) → every cut's
  legibility is a held `ghost_species` comparison, an accumulating curve/HUD, or a pinned readout;
  §3 names the primitive per cell. (The OPEN architect scar this revision answers.)
- **The nucleus mesh is Z-invariant and no electron-transfer mesh exists** → at S2 and S6 the
  CAUSE ("more protons" / "an electron removed or added") is depicted by a HUD **string** only;
  the ghost is re-cast as **the before**, never the cause. This is the OPEN recurring scar
  `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` —
  declared, accepted for this wave.
- **No overlay glow key** → no state binds focus to strip/curve; S7 drops the overlay.
- **`os_ghost_sphere` shares `elementType:"os_surface"` with the live cloud** → S3 binds NO glow
  focal (a `surface` focal would light both, Rule 32e); the core's appearance from nothing is the
  visual event.
- **The S7 `element` HUD line ends in the electron count**, duplicating the dedicated
  `electron_count` line — dropping `element` is not available (`label` prints the orbital name;
  species identity would vanish). Declared, accepted.
- **`os_formula` is one static string with no schedule** → S8's ledger re-realised as static rule
  + per-orbital `z_eff` HUD + narrated arithmetic.
- ~~The `zeff` dial range is 0.5–10~~ **WITHDRAWN at v3.1 — this limit does not exist.** `0.5, 10`
  are only initial values; an IIFE at `:59955-59970` immediately recomputes the range from
  `OS_IONS[].zEffBy`, giving **0.15 … 19.70** (build 5; the DB row
  `field3d_control_range_typed_from_a_narrower_derivation_clamps_a_state_it_must_reach` is FIXED and
  the bound contract records it CLOSED). **S3's opening Z_eff = 11 is therefore inside the dial's
  range and a teacher CAN drag back to the bare-pull picture** — the most valuable manipulation on
  that state. v3 designed around a demolished wall and gave up the affordance; v3.1 takes it back.
  `chemistry_author` may write S3's narration assuming the teacher can return to Z_eff = 11.
- **No `'z'` HUD line** → S2 names Z via the `element` line; no `z_eff` line before S3.
- **No staged nested-shell fill** (`OS_MAX_SETS`, single sphere boundary, uniform Z scale) → S3's
  core-reveal-relax (Deviation 4); S8 uses SWAP gallery steps.
- **No group-form curve** (by design) → S5 `curve:null` + strip.
- **No cited radius table** → every pm radius stamped `(model)` via captions; no measured radius
  anywhere on canvas or in narration.
- **CLOSED since v2 (no longer designed around):** core-region surface (→ `as:'core'`, build 5/6) ·
  mid-state camera schedule (→ `camera_steps`, build 5) · ghost clear step (→ `clear:true`,
  build 5) · explore idle motion (→ `mode:'explore'`, build 6) · orbital-independent `z_eff` HUD
  (→ per-orbital, build 5) · the sphere/lobe-tip HUD relabel (→ `orbital:'shell'`, build 6) ·
  the S9 annotation need (→ build 5's built-in "Slater model · neutral atoms" legend).

## Self-review (architect checklist — result)

Atomic claim one sentence ✓ · 9 states, complex band, Phase-0 sealed, arc untouched ✓ · control
table complete with the binding **Exposes `controls:[]`** column RE-RUN against builds 5–6
(control-row set unchanged; new keys are schedules/config, listed) ✓ · **every motion cell names
its primitive — cut / ramp / reveal beat / camera step; continuity verbs survive only at S1's
reveal beats and S3's z_ramp; every cut's legibility relocated to a held ghost, an accumulating
readout, or a pinned count, and where the evidence is a static comparison the cell says so
plainly** ✓ · archetypes distinct (one coined with justification), none static (S9 via
`mode:'explore'`), sandbox last ✓ · Rule 32 plan revised (before-pins at cuts, true cause-first
only at S3, two `camera_steps` states with entry-glide forfeits DECLARED, S3 no-focal ruling,
one focal elsewhere, home pose) ✓ · Rule 33 does-not-fire declared ✓ · Rule 34 budget per state,
zero annotations, no `render_annotations` ✓ · Rule 38 block complete, both cuts both directions,
S9 core-only ✓ · misconception_watch at ONE pivot ✓ · deep-dive flags 2 + 3 clusters each ✓ ·
entry_state_map + exit-pill ✓ · prerequisites advisory, shipped ✓ · anchor universal, homed,
word-budgeted ✓ · source-check with engine-verified vs design-target figures separated ✓ ·
bug-queue: five named OPEN/FIXED scars addressed by name; live query FLAGged (no Bash in this
grant) ✓ · Blocks 1+2 untouched ✓ · three content rulings (incl. the new S5 direction-only
ruling) ✓ · all seven previously-unauthored keys authored with their call-site builds named ✓ ·
every affected pm figure re-derived to the shell/radial laws, provenance split verified/target ✓ ·
zero TBDs ✓.
