# ARCHITECT SKELETON — bond_polarity_dipole_moment
# "Bond polarity and dipole moment" · Phase-0 bonding wave, Desk 1 concept 1 of 2 · tier ⭐ (one 💎 state: S5)
# NCERT Chemistry Class 11 Ch.4 "Chemical Bonding and Molecular Structure" §4.4 (polarity of bonds, dipole moment)
# Renderer: field_3d · scenario_type: "bonding_scene" · placement: 'free' · ONE unit · E1+E2 capabilities only (no E3 block authored)
# State design FIXED by docs/CHEMISTRY_PHASE0_BONDING.md §0b (founder-proxy Checkpoint A DESIGN_OK, cycle 2, 2026-08-01).
# This skeleton EXPANDS that table; it does not redesign it. Authoritative engine contract:
# docs/notes/bonding_scene_contract.md (supersedes the Phase-0 doc's literal guesses).
# Every dipole/charge number below is from the contract's shipped model output, not from theory.
# branch feat/chemistry-polarity-hbonding · registration: site #1 ONLY (src/data/concepts/chemistry/) · validate:chemistry

> **DISPATCHING-SESSION VERIFICATION NOTE (2026-08-01).** The architect ran without shell or Write
> tools, so it could neither query `engine_bug_queue` live nor save this file; the dispatching
> session saved it verbatim and then **checked its three engine flags against renderer source**:
> 1. **`compare_species` IS LIVE** — `field_3d_renderer.ts:49287`, gated on `mode === "compare"`.
>    The architect's flag #2 is RESOLVED and `docs/notes/bonding_scene_contract.md` has been
>    corrected (it wrongly listed the key as parse-only-until-E3). **S2/S6/S7 must therefore author
>    `mode: 'compare'`, not `dipole_sum`, on the states that swap species.**
> 2. **The angle ramp does NOT exist — flag #1 CONFIRMED.** No `angle_at_ms` / `angle_from` /
>    `angle_ramp_ms` anywhere in the `bonding_scene` region; `angle_deg` is a static override only.
>    **S4 is BLOCKED for json_author** until a surgeon adds the cue (dispatch E1c, queued behind
>    E3a — two surgeons in `field_3d_renderer.ts` at once is the Rule-40 hazard).
> 3. **No lone-pair lobe renders in `bonding_scene` — flag #3 CONFIRMED.** The `mgFrame` lone-pair
>    machinery belongs to `molecular_geometry` and is not drawn here. S7 either gets the lobe from
>    E1c or its narration says "the top of the pyramid" — **never narrate what is not drawn.**
>
> Also carried into E1c: the S7 delta cue **"Lone pair adds a dipole" contradicts the instrument**
> (`BS_LONE_PAIR_D` ships at 0 — published bond moments already absorb the term, so the NH₃/NF₃
> contrast is a DIRECTION reversal, not an added vector). Architect's proposed replacement,
> **"Arrows flip, dipole drops"**, is adopted pending founder-proxy Checkpoint A.
>
> **Gate 8 obligation:** quality_auditor MUST run the live queue query
> (`query_engine_bug_queue.ts <concept>` and `--field3d --open`) — this skeleton's scar compliance
> was built from the checklist mirror, not the live table.

---

## ⛔ CHECKPOINT A — SKELETON CYCLE 1: `DESIGN_FIX` (2026-08-01). All findings applied above.

The 8-state arc was NOT re-litigated and stands. What failed was that the per-state detail was
written against a *described* contract rather than against `BS_BOND_MOMENT_D`, `BS_CAMERAS` and the
compare branch **as shipped** — four load-bearing claims were contradicted by code. Every finding
below was re-verified against renderer source by the dispatching session before being applied.

| # | Finding | Where it landed |
|---|---|---|
| **F1** | S7 attributed the 1.47 → 0.23 D drop to arrows flipping. Reversing three symmetric vectors cannot shrink \|sum\| — the drop is entirely `N\|H −1.31` vs `N\|F 0.17`, and the higher-Δχ bond gets the SHORTER arrow, contradicting S2's core rule. | S7 re-specced to the **four-vector model** |
| **F2** | S2 narrated HF 1.83 / HI 0.44; the engine prints 1.82 / **0.38** — 16% apart on HI. | S2 blocked pending a table ratification (direction: **up**, to CRC) |
| **F3** | The Rule-35 anchor was specified in §9 and claimed as the macro vertex, but appeared in **no** state's narration and every state was at budget. Placing it at S1 (as DoD said) would pre-spoil S4's aha. | Anchor moved to **S4**, S4 re-budgeted |
| **F3b** | "Oil molecules barely respond" overstates it — oil does heat. | Oil clause **cut**; the dry-plate contrast kept |
| **F4** | The CHCl₃ override applied to CHCl₃ only, so three *surviving* Cl arrows halve mid-swap under "three arrows keep their directions." | Override extended to **CCl₄** |
| **F9** | The ring-cut walk covered states only; assessment items 1 and 3 name hidden-ring species. | Items now carry `depth_ring` |
| **F10** | `config.explore_species` was never named, and its **default contains CHCl₃ and NF₃** — silence is a 38b breach. | Key named and authored |
| **F11/F12/F13** | S7 opened on S3's exact two-beat; S2 ran 6 sentences / two ideas; "symmetry cancels" gives a noun agency. | Timings shifted, S2 compressed, wording fixed |

**Verdict on the three routings:** all correct. `compare` for S2/S6/S7 is right and forced; the S4
angle-ramp block is real with no acceptable JSON fallback; "never narrate what is not drawn" on S7
is right. But the `compare` correction has a side effect nobody could have seen without reading
`BS_CAMERAS`: **in this engine the mode string picks the camera**, so S2/S6/S7 introduce four
elevation-and-distance teleports the taught variable never caused.

### E1c — expanded from 2 items to 7 (one surgeon, one region, Rule 40)

| # | Ask | Blocking? |
|---|---|---|
| E1c-1 | Scripted angle ramp: `angle_from` / `angle_at_ms` / `angle_ramp_ms` | **blocks S4** |
| E1c-2 | Draw the lone-pair lobe (and, under F1, its vector) | **blocks S7** |
| E1c-3 | Single-unit `compare` inherits the `dipole_sum` camera (scene-derived, not mode-keyed). Verify S4's bend reads at el 47 in the same pass. | **blocking** |
| E1c-4 | Arrow head scales with magnitude (`headLen = min(0.30, aLen*0.5)`) — drawn length is currently constant below 0.52 D, and HI 0.38, N–F 0.17 and C–H 0.30 all sit under that floor while narration says length IS the magnitude | **blocking** |
| E1c-5 | Compare-swap guard reads `PM_bscLigDragged` / `PM_bscMolDragged`, not only `PM_bscSpeciesDragged` — S2's ligand slider is dead from 9 s onward | **blocking** |
| E1c-6 | `angle_deg` applies to 2- and 3-bond centres with zero lone pairs, so CO₂ can be bent live (today the explore `angle` slider is inert for 8 of 9 picker species) | ride-along |
| E1c-7 | Ratified `BS_LONE_PAIR_D.N` + intrinsic N–H/N–F moments (F1); ratified `H\|F/H\|Cl/H\|Br/H\|I` row (F2); `Cl: 0.74` on CCl₄ (F4) — **data, values from `chemistry_author`** | **blocks S2/S6/S7** |

**E1c stays queued behind E3a** — two surgeons in `field_3d_renderer.ts` at once is the Rule-40
hazard this Phase 0 exists to prevent.

**`chemistry_author` is UNBLOCKED**: F1 and F3 were the two blockers and both are settled above.
F2/F4/F11/F12/F13 are its own first-pass work; F10 rides to `json_author`; F9 is applied.

---

## 1. Atomic claim + tier justification (honest)

This concept teaches ONE thing: a bond's polarity is a vector, and a molecule's dipole moment is the
vector sum of its bond dipoles — so molecular polarity is decided by SHAPE, not by whether the bonds
are polar. It does NOT cover hydrogen bonding (deferred to `hydrogen_bonding`, which declares this
concept its prerequisite), ionic character percentages / Fajans' rules (deferred per the Phase-0
ledger), or intermolecular forces generally.

**Tier: ⭐, not 💎 — stated plainly.** A teacher CAN draw CO₂ on a whiteboard with two opposing
arrows and say "they cancel." Exactly one state is genuinely unwhiteboardable: S5, four tetrahedral
bond dipoles summing to exactly zero in three dimensions, readable only under rotation. The concept
earns its 8-state build on three grounds, none of them inflated: (a) **coverage** — full on five of
six boards (CBSE §4.4, JEE, IB, AP, A-level; IGCSE partial); (b) **a real examined failure** —
"polar bonds ⇒ polar molecule" is a belief a static CO₂ drawing does not kill, and it is examined
directly (rank the dipoles of NH₃/NF₃/H₂O/CCl₄ is a standing JEE/board item); (c) it is
`hydrogen_bonding`'s Rule-25 prerequisite — δ+/δ− must exist before a δ+ hydrogen can seek a δ−
oxygen. Ground (c) alone would justify two states, not eight; (a)+(b) are the load-bearing case.

## 2. State count + arc — 8 states (FIXED by Checkpoint A; do not renegotiate)

One polar bond → the arrow, to scale → two arrows cancel (CO₂) → bend it and it's polar (H₂O,
PRIMARY aha) → four arrows in 3D still zero (CCl₄, the 💎) → one substitution breaks it (CHCl₃) →
the lone-pair direction reversal (NH₃/NF₃) → explore.

**Rings (FIXED):** core S1–S5 · extended S6 · advanced S7 (contiguous, immediately before explore,
Rule 38a) · core explore S8. `teaching_method`: straightforward motion beats S1–S7 (field omitted);
S8 `exploration_sliders`. `advance_mode`: `manual_click` S1–S7, `interaction_complete` S8
(Gate 12: 2 distinct modes).

**Declared archetype repeat (Rule 31b, cross-concept):** `pair-shift` (S1) is a DELIBERATE repeat
with `hydrogen_bonding` S1 — the student meets the shared pair moving off the hydrogen in the
prerequisite and again where it is used. Declared, never renamed (Phase-0 §0b). Within this concept
no archetype repeats. Six of eight states run `mode: dipole_sum`, so **each authors its own cue
timing** — the hybridisation scar (d): an archetype is a claim about RHYTHM, not a label; the
per-state cue tables below are the enforcement.

## 3. Per-state control table + choreography (Rule 31 — the auditor checks the build against this)

Home pose (Rule 32d): one unit at the origin on the deep-blue field background, solved camera per
mode (NO `camera` authored anywhere — see scar plan), atom labels on, scale 1 unit = 48 pm. The
apparatus "persisting" across states is the arrow grammar: δ labels, bond arrows drawn δ+ → δ−,
and the dashed resultant — same visual language every state, only the molecule changes.

| # | ring | teaches (one idea) | archetype | ≤5-word delta cue | controls (min_ring) | dur | words | glow focal (closed enum) |
|---|---|---|---|---|---|---|---|---|
| S1 | core | one atom pulls the shared pair harder | `pair-shift` ⇄ (declared, cross-concept) | "Shared pair moves to chlorine" | — | 18 s | 41 | `electrons` → `charges` |
| S2 | core | the bond dipole arrow, drawn to scale | `arrow-grow` | "Arrow shows the shift" | ligand (core) | 20 s | 53 | `arrows` |
| S3 | core | two polar bonds, zero molecular dipole | `vector-cancel` | "Opposite arrows cancel" | — | 20 s | 46 | `arrows` → `resultant` |
| S4 | core | bend it and it is polar — **PRIMARY aha** | `bend-and-sum` | "Bent shape, arrows add" | angle (core) | 22 s | 53 | `resultant` |
| S5 | core | four arrows in 3D still sum to zero — **the 💎 state** | `tetra-sum` | "Four arrows, still zero" | spin (core) | 22 s | 48 | `arrows` → `resultant` |
| S6 | ext | one substitution breaks the symmetry | `substitute-one` | "One swap breaks symmetry" | — | 20 s | 44 | `resultant` |
| S7 | adv | the lone pair carries its own dipole, and the bond arrows can oppose it | `lone-pair-add` | "Arrows flip, dipole drops" | — | 22 s | 53 | `arrows` → `resultant` |
| S8 | core | explore | `interaction_complete` | — | molecule · angle · ligand (all core) | open | 0 | none (sandbox) |

**Rule 32 legibility plan (all states):** cause first with a readable beat — S1 the pair slides,
THEN δ labels appear; S3/S5 the bond arrows are seen polar FIRST, then the summation runs; S4 the
angle closes first, then the resultant grows; S6/S7 the atom swap completes first, then the
resultant responds. Only the taught variable moves per state (the molecule holds pose while arrows
sum; the arrows hold while the angle bends drives them). Delta cue = caption opener. Exactly one
glow focal per instant (column above; where two are listed the focus HANDS OVER at the cue, never
overlaps).

### Per-state `bonding_scene` authoring detail (chemistry_author fleshes the timelines; json_author implements)

Every state: `placement:'free'`, `show_hud: true`, `render_annotations: true` (with `at_ms`/`until_ms`
on every annotation), `config.field_lines.opacity: {}` at config level (blank-scene trap),
`eye_capture_ms` ≥ the last cue + 2000.

**S1 — "The shared pair shifts"** · `mode:'assemble'` · `species:'HCl'` · `focal_unit: 0`
- `electrons: { show:'pair_glyph', pair_shift: 0 }` at entry; `pair_shift_at_ms: 4000`,
  `pair_shift_duration_ms: 2500` ramping pair_shift → 1 (glyph translates rigidly along the bond
  axis toward Cl — row N is a rigid two-dot glyph, no deforming cloud).
- `dipole: { show_charges: true, show_charge_values: false }`, `charges_at_ms: 7500` (effect after
  cause). NO bond arrow (don't pre-spoil S2's reveal — checklist directive).
- `hud_lines: ['delta_chi']` (reads 0.96). No formula surface. No controls.
- Vertex: particulate leads; symbolic (δ notation) enters as labels on motion already seen.
- Narration intent (41 w): "Hydrogen and chlorine share one electron pair. Chlorine pulls harder:
  its electronegativity is 3.16, hydrogen's is 2.20 — a difference of 0.96. Watch the shared pair
  slide toward chlorine. Chlorine becomes slightly negative, delta minus. Hydrogen becomes slightly
  positive, delta plus."

**S2 — "The bond dipole arrow"** · `mode:'compare'` ⚠ *(was `dipole_sum`; the swap needs `compare`)* · start `species:'HF'`
- `dipole: { show_bond_arrows: true, show_charges: true, arrow_scale: <ratified> }`,
  `arrows_at_ms: 3000` — the arrow GROWS from the δ+ atom toward the δ− atom. The δ+ → δ−
  convention is asserted here ONCE in narration and by gate assertion 5, and every later state
  inherits it silently.
- Scripted single swap HF → HI via `compare_species: 'HI'`, `compare_at_ms: 9000`,
  `compare_duration_ms: 1500`: the extremes of the ladder — arrow 1.83 D → 0.44 D, Δχ 1.78 → 0.46.
  The `ligand` slider (4 rungs: F/Cl/Br/I) is live and JOINED to the scripted swap (drag-seize,
  contract trap 3), so the teacher visits HCl (1.08 D) and HBr (0.82 D) themselves — the four-rung
  ladder Checkpoint A required.
- `hud_lines: ['mu','delta_chi']`. No formula surface. `controls: [{id:'ligand', min_ring:'core'}]`.
- 🔴 **NUMBERS BLOCKED pending a data ratification (F2).** The engine's `BS_BOND_MOMENT_D` currently
  holds HF **1.82** · HCl **1.08** · HBr **0.78** · HI **0.38**, while this narration quotes 1.83 and
  0.44 — a **16% disagreement on HI between the spoken number and the on-screen instrument**, which
  is the σ/π two-instrument scar verbatim. The skeleton's numbers are the *better* ones (CRC
  gas-phase: 1.826 / 1.109 / 0.827 / 0.448); the engine carries an older bond-moment tabulation. So
  the fix direction is **up**: ratify the `H|F / H|Cl / H|Br / H|I` row to the measured values.
  Blast radius checked — `hydrogen_bonding` derives its charges from `bscIonicFraction(Δχ)`, not
  from this table, so nothing else in the wave moves. `chemistry_author` ratifies; the surgeon
  applies it in E1c.
- Narration intent (≤48 w, 4 sentences — compressed at Checkpoint A cycle 1, F12: the draft ran 6
  sentences and carried two ideas; the teacher-chrome line was cut): "A polar bond gets an arrow,
  drawn from delta plus to delta minus. Its length is the measured dipole moment. Hydrogen
  fluoride: 1.83 debye, a long arrow. Swap fluorine for iodine and it falls to 0.45 — a bigger
  electronegativity difference gives a longer arrow." *(final digits follow the ratified table.)*

**S3 — "Two arrows cancel — CO₂"** · `mode:'dipole_sum'` · `species:'CO2'` · MISCONCEPTION BEAT 1
- Contrast beat, sequential (Rule 16a, never superimposed): `charges_at_ms: 2500` +
  `arrows_at_ms: 4000` — BOTH C=O arrows grow long and polar (the wrong expectation's evidence,
  shown honestly) → `resultant_at_ms: 9000` — the summation runs and the resultant is ZERO; HUD
  `mu` lands 0.00 D. The wrong expectation's consequence is the two long arrows; the real physics
  is the zero — back-to-back, no predict-pause.
- Formula surface INTRODUCED here (the symbolic vertex earning its place after the particulate
  story): `μ = μ₁ + μ₂ + …  (added as vectors)` — algebra-only (38c), math-serif Unicode, ONE
  surface; it persists S3→S8 unchanged.
- `hud_lines: ['mu']`. No controls (motion ≠ interactivity; this is a watch-this beat).
- Narration intent (46 w): "Carbon dioxide is a straight molecule. Each carbon–oxygen bond is
  strongly polar — both arrows are long. Now add them. They point in exactly opposite directions,
  so they cancel completely. The total dipole moment is zero. Polar bonds by themselves do not
  make a polar molecule."

**S4 — "Bent water is polar"** · `mode:'dipole_sum'` · `species:'H2O'` · PRIMARY AHA
- Scripted bend: molecule opens LINEAR (`angle_deg: 180` — arrows opposite, resultant zero, the
  S3 picture recreated on water), then the angle ramps 180 → 104.5° at ~6000 ms over ~3000 ms;
  the arrows tilt with the bonds and the resultant GROWS to 1.85 D (`resultant_at_ms` timed to the
  ramp end + a readable beat). The `angle` slider is live and joined (drag-seize) so dragging
  re-runs the cancellation continuously.
- ⚠ **BLOCKED — CONFIRMED CONTRACT GAP.** The shipped cue list has no scripted angle-ramp key
  (`angle_deg` is a static override; verified against renderer source). Required:
  `angle_from / angle_at_ms / angle_ramp_ms`, named after the shipped `pair_shift_at_ms` pattern.
  **Routed to `field3d-surgeon` as dispatch E1c (queued behind E3a).** There is no acceptable
  fallback: opening at equilibrium with only a slider leaves the state with no scripted motion,
  which fails the headless harness and Rule 31's no-static-state.
- `hud_lines: ['mu']`. Formula surface persists. `controls: [{id:'angle', min_ring:'core'}]`.
- Prerequisite patch (one clause, non-condescending): "its two lone pairs hold the bonds at 104.5
  degrees" — the VSEPR cliff sentence.
- 🔴 **The Rule-35 anchor lives HERE** (fixed at Checkpoint A cycle 1, F3). It was specified in §9
  and claimed as the Rule-33 macro vertex in DoD (g), but no state's narration contained it and
  every state was already at budget — an unbuildable anchor under a DoD claiming zero TBDs. It
  belongs immediately after the resultant grows, because that is the first moment "water is polar"
  is true on screen. **Putting it at S1 would have pre-spoiled S4's primary aha by three states**
  (OPEN directive `teach_do_not_prespoil_a_later_reveal`). Recalled in one clause at S8.
- Narration intent (51 w, 4 sentences — the drag line was cut per F12; the VSEPR clause trimmed to
  make room): "Water has the same polar bonds, but the molecule is bent — its lone pairs hold them
  at 104.5 degrees. The two arrows no longer point opposite ways. Their sum is 1.85 debye: same
  bonds, different shape, polar molecule. This is why a microwave heats food and leaves a dry plate
  cool."

**S5 — "Four arrows, zero — CCl₄"** · `mode:'dipole_sum'` · `species:'CCl4'` · the 💎 ·
MISCONCEPTION BEAT 2
- `arrows_at_ms: 3000` (four C–Cl arrows, each polar — the wrong expectation shown again, now ×4)
  → `resultant_at_ms: 8000` (sum runs → exactly zero) → `spin_start_ms: 10000`,
  `spin_rate: ~0.15` so the 3D balance is READ under rotation, plus a live `spin` slider (core).
- **Do NOT author `camera`** — the solved dipole_sum/counting camera exists because a ligand swings
  onto the central atom mid-spin at the obvious elevation (CRITICAL scar, reproduced during E1).
  Countability across the whole spin window is D-4's gate assertion, not this concept's problem to
  re-solve.
- `hud_lines: ['mu']` (0.00 D). Formula surface persists. `controls: [{id:'spin', min_ring:'core'}]`.
- Narration intent (48 w): "Four carbon–chlorine bonds, each polar, point at the four corners of a
  tetrahedron — the shape from the shapes lesson. Turn the molecule: from every side the four
  arrows balance. Their sum is exactly zero, in three dimensions. Carbon tetrachloride has no
  dipole moment. The symmetric shape makes the four arrows cancel." *(final sentence reworded at
  Checkpoint A cycle 1, F13 — "symmetry cancels four polar bonds" gives an abstract noun agency,
  Rule 41a.)*

**S6 — "One swap — CHCl₃"** · `mode:'compare'` · start `species:'CCl4'`, `compare_species:'CHCl3'` · extended
- Scripted single substitution CCl₄ → CHCl₃ at `compare_at_ms: 5000`: one Cl swaps to H
  (mixed ligands — union row L; the optional `ligands` array path), then `resultant_at_ms: 9000` —
  the resultant grows from zero along the H–C axis.
- **The CHCl₃ number (DECIDED — see report):** the HUD prints the LITERATURE 1.04 D via the
  ratified per-molecule override `MG_MOLECULES.CHCl3.bond_moments = { Cl: 0.74 }` (a data edit, the
  hook E1 shipped for exactly this). chemistry_author ratifies the value and SHOWS the calibration
  per OPEN-DECISION-1; narration quotes the same 1.04 D — ONE instrument, no HUD/narration
  disagreement (the σ/π scar). The override lives on the CHCl₃ entry only; CCl₄'s zero is
  symmetry-exact and unaffected (gate assertion 4 still holds: CHCl₃ ≠ 0, symmetric species < 1e-12).
- `hud_lines: ['mu']`. Formula surface persists. No controls.
- Narration intent (44 w): "Carbon tetrachloride again — total zero. Replace one chlorine with a
  hydrogen. Three arrows keep their directions; the fourth is different. The arrows no longer
  cancel: a resultant appears along the hydrogen–carbon axis. This is chloroform, measured at
  1.04 debye. One substitution removes the symmetry."
- 🔴 **The override must ALSO be applied to CCl₄ (F4).** As specced it lives on the CHCl₃ entry only,
  so the `compare` swap goes C\|Cl **1.46** → C\|Cl **0.74** and the three *surviving* chlorine arrows
  visibly halve — under a narration that says "three arrows keep their directions." That is an
  unexplained change to the exact elements the state claims are unchanged, and a Rule-32b breach.
  Ratify `Cl: 0.74` on **CCl₄ as well**: its μ stays exactly zero by symmetry (< 1e-15), S5's and
  S6's opening pose stay identical (Rule 32d), the Δχ ordering against C–H is preserved
  (0.74 > 0.30), and the swap then changes exactly ONE arrow — which is the whole lesson.
  *(Checkpoint A confirmed the 1.04 D value itself is honest and needs no on-canvas disclosure —
  the arrows carry no numeric labels, and a calibration note would violate Rule 34. Record it in the
  teacher notes.)*

**S7 — "Lone pair: NH₃ vs NF₃"** · `mode:'compare'` · start `species:'NH3'`,
`compare_species:'NF3'` · advanced · MISCONCEPTION BEAT 3
- `charges_at_ms: 2000` + `arrows_at_ms: 3200` *(shifted from 2500/4000 at Checkpoint A cycle 1,
  F11 — identical to S3's opening two-beat, and an identical opening is the hybridisation scar (d):
  an archetype is a claim about rhythm, not a label)*: three N–H arrows point TOWARD nitrogen
  (H δ+, N δ−) — the same way the lone pair points; `resultant_at_ms: 6500` → 1.47 D up the C₃ axis.
  Scripted swap NH₃ → NF₃ at `compare_at_ms: 10000`: every arrow FLIPS (N now δ+, F δ−, arrows
  point away from the lone-pair side), the resultant flips and shrinks → 0.23 D
  (`resultant` re-lands after the swap).
- 🔴 **RE-SPECCED at Checkpoint A cycle 1 (F1) — the previous version taught a cause the engine's own
  numbers cannot produce.** As shipped, `BS_BOND_MOMENT_D` holds `N|H −1.31` and `N|F 0.17` with
  `BS_LONE_PAIR_D.N = 0` (verified at `:48520`/`:48538`). So the whole 1.47 → 0.23 D drop comes from
  the **bond-moment magnitude**, not from the flip — reversing three symmetric vectors reverses the
  resultant, it cannot shrink it. Worse, the *geometry* factor moves the wrong way (NF₃'s axial
  cos 0.437 > NH₃'s 0.372), and the higher-Δχ bond gets the **shorter** arrow, which directly
  contradicts S2's core-ring rule "a bigger electronegativity difference gives a longer arrow." A
  student who watched S2 and then S7 would have been shown two incompatible rules.
- **DECISION (adopted, ratification pending): the FOUR-VECTOR model.** Ratify *intrinsic*
  (un-absorbed) N–H / N–F bond moments plus a real `BS_LONE_PAIR_D.N`, and **draw the lone-pair
  vector** — which E1c is already visiting this region to make visible. A self-consistent set exists
  (illustrative only: L ≈ 1.0 D along the lone pair with b(N–H) ≈ 0.42 and b(N–F) ≈ 0.79 reproduces
  1.47 and 0.23 **and** restores "bigger Δχ ⇒ longer arrow"). Then S7 is four arrows, "direction
  decides" becomes literally true on canvas, and the state teaches the examined textbook explanation.
  **`chemistry_author` ratifies the actual values and SHOWS the calibration** (OPEN-DECISION-1's
  standing requirement) — including whether the whole `BS_BOND_MOMENT_D` table moves to one
  convention or N is documented as the exception. Do NOT keep the old wording over a three-vector
  model.
- ⚠ **CONFIRMED: `bonding_scene` renders no lone-pair lobe today** (that machinery belongs to
  `molecular_geometry`). Under the four-vector decision E1c must draw both the lobe and its vector —
  **never narrate what is not drawn**.
- `hud_lines: ['mu','delta_chi']` — Δχ reads 0.84 (N–H) then 0.94 (N–F). Under the four-vector model
  this is the honest belief-killer: the bonds ARE more polar (longer arrows) and the molecule's
  dipole is SMALLER, because the lone-pair vector now opposes them instead of adding.
- Narration intent (≤53 w, to be finalised against the ratified numbers): "Ammonia: nitrogen pulls
  harder than hydrogen, so the three bond arrows point toward nitrogen — the same way its lone pair
  points. They add: 1.47 debye. Swap the hydrogens for fluorines. Fluorine pulls harder still, so
  the bond arrows now point away — against the lone pair. They cancel most of it: 0.23 debye."

**S8 — "Explore polarity"** · `mode:'explore'` · core · `advance_mode: interaction_complete`
- Controls (ALL, Rule 31c): `[{id:'molecule',min_ring:'core'}, {id:'angle',min_ring:'core'},
  {id:'ligand',min_ring:'core'}]`. Live μ in debye (`hud_lines: ['mu','delta_chi']`), arrows +
  resultant + charges all on. Explore auto-spins when idle (contract trap 6 — no frozen tail,
  headless harness satisfied by the engine).
- **38b — CORE-ring content only:** the molecule picker lists core-taught species ONLY — H₂O, CO₂,
  CCl₄, CH₄, BF₃, HF, HCl, HBr, HI. **CHCl₃ and NF₃ are EXCLUDED from the picker** (they are
  extended/advanced states' species; including them would leak hidden-ring content under the
  core-only preset). BF₃ and CH₄ are included un-taught-but-core-safe: they are new EXAMPLES of the
  core rule (symmetry ⇒ zero), not new content — and BF₃ covers the trigonal-planar exam case the
  guided arc skips (recorded honestly: sandbox-only coverage is weak exam coverage, acceptable at
  ⭐ tier). Formula surface = the S3 core surface only.
- 🔴 **The key is `config.explore_species` (F10, verified at `:49065`), and it MUST be authored.**
  Its default is `["HCl","CO2","H2O","CCl4","CHCl3","NH3","NF3"]` — which contains CHCl₃ **and** NF₃,
  so **silence is a Rule-38b breach**, not a neutral omission. Author
  `config.explore_species: ["H2O","CO2","CCl4","CH4","BF3","HF","HCl","HBr","HI"]`.
  `config.explore_ligands`' default `["HF","HCl","HBr","HI"]` is already correct; author it anyway.
- Narration: 0 / open.

## 4. Misconception confrontation plan (Rule 16a — 3 rows, at genuine pivots only)

| wrong belief | state | contrast beat (sequential, never superimposed) |
|---|---|---|
| "If the bonds are polar, the molecule is polar" | **S3** | both CO₂ arrows shown long and polar FIRST (the belief's honest evidence), then the vector sum runs to zero on the live HUD |
| same belief, re-killed in 3D where a board cannot follow | **S5** | four polar arrows, then the 3D sum lands exactly zero and stays zero under rotation |
| "More polar bonds mean a bigger molecular dipole" | **S7** | Δχ on the HUD RISES (0.84 → 0.94), the bond arrows get LONGER, and μ still falls 1.47 → 0.23 D in the same frame — because the arrows now oppose the lone-pair vector instead of adding to it. *(Requires the four-vector ratification; under the shipped three-vector model this row is FALSE as drawn — see S7.)* |

No other state carries a `misconception_watch` — S1/S2/S4/S6/S8 are straightforward teaching.
Belief source: NCERT Exemplar Ch.4 (belief only; no problem text imported).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **S4** — where the vector-addition abstraction bites; the historically stuck point ("why does
  bending change anything?"). Also the PRIMARY aha.
- **S5** — the 3D cancellation; the concept's 💎 and the most-asked exam picture (CCl₄ vs CHCl₃).

## 6. Drill-down clusters

S4: `vector_addition_of_bond_dipoles` (arrows add head-to-tail, not arithmetically) ·
`shape_decides_polarity` (same bonds, linear vs bent outcomes) ·
`bent_vs_linear_water` (what water would be if straight — ties to the anchor).
S5: `tetrahedral_cancellation_3d` (why four can cancel when they aren't opposite pairs) ·
`symmetry_and_zero_dipole` (the general rule: symmetric arrangement of identical bonds ⇒ 0) ·
`ccl4_vs_chcl3_contrast` (one swap, zero to 1.04 D — bridges into S6).

## 7. entry_state_map

```
foundational:          STATE_1 → STATE_4   # contains the PRIMARY aha (S4) — coverage rule satisfied
symmetry_cancellation: STATE_5 → STATE_6   # "why is CCl4 nonpolar / CHCl3 polar"
lone_pair_effect:      STATE_7             # "why NH3 > NF3"
exploration:           STATE_8
```

## 8. Prerequisites (advisory, Rule 23)

- `vsepr_molecular_shapes` (SHIPPED, baseline-locked) — bent water, tetrahedral CCl₄/CH₄, the
  lone-pair squeeze. The real cliff (Block 1).
- Electronegativity itself has NO shipped concept — S1 self-patches by defining the pull with its
  two numbers on screen (χ 3.16 vs 2.20), so no gate.
- Downstream: `hydrogen_bonding` declares THIS concept its prerequisite; building this closes the
  edge before Desk 1's second concept opens.

## 9. Real-world anchor (Rule 35 / 38f — universal, physics-true)

**Primary — the microwave oven. SPOKEN AT S4** (after the resultant grows), recalled in one clause
at S8. A microwave oven's field flips direction billions of times a second. Water molecules are tiny
dipoles — a δ− oxygen end and δ+ hydrogen ends — so each flip turns them, and that turning is heat.
**The water-rich food gets hot while the dry ceramic plate stays cool.** This is dielectric heating
of polar molecules — physics-true at every depth this concept reaches, present in kitchens on every
continent, and a widest-syllabus-overlap device (38f). It hooks because it converts an invisible
molecular property (μ = 1.85 D) into something the student has felt.

⚠ **The oil comparison was CUT at Checkpoint A cycle 1 (F3b).** The draft said "oil molecules have
almost no dipole moment, so they barely respond" — an overstatement of the same kind the architect
rightly rejected the charged-rod demo for. Triglycerides carry real ester dipoles; oil's dielectric
loss at 2.45 GHz is far below water's, but oil **does** heat in a microwave (every teacher has
melted butter) and its specific heat is about half water's. The unimpeachable contrast is the dry
plate, which is already in the anchor. If a second case is ever wanted, "oil absorbs far less" is
the defensible wording — never "barely responds."
**Secondary (one clause, S8):** oil and water refuse to mix — polar molecules attract each other
more strongly than they attract nonpolar ones, so the liquids separate. (The full story is
`hydrogen_bonding`'s; here it is one foreshadowing clause only.)
**Rejected candidate, recorded deliberately:** the "charged rod bends a water stream" demo — the
deflection also occurs for nonpolar liquids via induced dipoles, so it is not physics-true as a
POLARITY demonstration and would plant a misconception of our own.

## 10. Definition of Done (Gate 0 — no TBDs)

(a) **States:** S1 HCl pair-shift + δ labels · S2 HF arrow to scale + HF→HI swap + 4-rung ligand
slider · S3 CO₂ two-arrow cancellation to 0.00 D · S4 H₂O 180°→104.5° bend, resultant to 1.85 D,
live angle slider · S5 CCl₄ four-arrow 3D zero under spin · S6 CCl₄→CHCl₃ swap, resultant 1.04 D
(ratified override) · S7 NH₃→NF₃ arrow-flip, 1.47→0.23 D · S8 explore (molecule/angle/ligand,
core species only, live μ).
(b) **Symbol-label table:** δ+ / δ− → atom-attached labels (engine `show_charges`) · χ → spoken
"electronegativity", never a bare canvas symbol · Δχ → HUD line "Δχ = 0.96" · μ → HUD "μ = 1.85 D"
(value-only, Rule 34b) · D → "debye", spoken in full on first use (S2), symbol thereafter ·
bond arrow → drawn δ+ → δ−, no label · resultant → dashed/distinct arrow labeled "μ" · molecule
labels H₂O/CO₂/CCl₄/CHCl₃/NH₃/NF₃ → engine-composed Unicode subscripts (ASCII keys in JSON per
contract trap 1).
(c) **Direction-rule plan (chemistry variant — balanced-equation ledger N/A: no reaction appears
anywhere in this concept; no state symbols, no oxidation numbers, no mole scale factor).** The
direction duty is the **arrow-convention plan**: every arrow in every state is drawn δ+ → δ−; the
convention is stated ONCE in S2's narration and enforced by gate assertion 5 (a sign flip renders
perfectly while teaching the reverse — the hybridisation CRITICAL scar); S7's whole lesson is this
convention doing real work.
(d) **Motion plan:** per the §3 cue tables — every state has a scripted, clock-driven motion
(pair slide · arrow grow + swap · sum-to-zero · bend-and-sum · spin-read · substitute · flip);
no static state; cause before effect throughout.
(e) **Modes/config:** `field_3d` · `bonding_scene` · modes `assemble` (S1), `dipole_sum` (S3–S5),
`compare` (S2, S6, S7), `explore` (S8) — all in the E1+E2 LIVE list; NO E3 block
(`lattice`/`sea`/`ions`/`transfer`/`shift`/`groups`) authored anywhere; `render_annotations: true`;
`config.field_lines.opacity: {}`; `eye_capture_ms` per state ≥ last cue + 2000.
(f) **assessment + coverage_map:** 4 items, authored by chemistry_author, **each tagged with a
`depth_ring` so the presets filter items as well as states** (F9 — the cut walk in (i-1) covered
states only, and items 1 and 3 name hidden-ring species): (1) `extended` — pick the zero-μ species
from H₂O/NH₃/CCl₄/CHCl₃ [S5/S6] · (2) `core` — why is CO₂ nonpolar though its bonds are polar
[S3] · (3) `advanced` — rank H₂O/NH₃/NF₃ by μ and give the NF₃ reason [S4/S7] · (4) `core` —
predict the effect of bending a linear AB₂ molecule [S4]. Under `core-only` the surviving set is
(2) and (4), which is a coherent two-item check of the taught rule. coverage_map ties each to its
state. misconception_watch: exactly the §4 three rows. **Note (F9, P3):** the S5 drill-down cluster
`ccl4_vs_chcl3_contrast` bridges into S6 and dangles under `core-only` — acceptable while
drill-down is a dormant path, but it must not be counted as core coverage.
(g) **Macro↔micro / representation triangle (Rule 33, chemistry form):** the taught variable is
natively PARTICULATE — the particulate vertex leads every guided state; the macro vertex is
carried by the anchor narration (microwave, S1 intro + S8); the symbolic vertex (μ formula, δ
notation, debye values) never leads a core state — the formula surface first appears at S3 AFTER
the cancellation has played. Instruments carry 33d: the μ HUD is a live numeric readout that
moves with every swap, bend and drag.
(h) **Canvas budget (Rule 34):** ONE formula surface — `μ = μ₁ + μ₂ + … (added as vectors)`,
introduced S3, persisting unchanged S3–S8; S1–S2 have NONE. Captions = the ≤5-word delta cues
only. HUD value-only (`Δχ = 0.96` / `μ = 1.85 D`). All math real Unicode (μ, δ⁺, δ⁻, Δχ, →,
subscripts) across DOM, HUD and sprite paths. HUD clears `top: 52px` (review-chrome fullscreen
button — OPEN scar).
(i) **Curriculum-flex (Rule 38):**
  (i-1) cut checks, walked: hide advanced (S7) → S1–S6 + S8: no surviving state references NF₃ or
  the lone-pair argument (S6 references only S5's CCl₄; S8's picker excludes NF₃) — COHERENT.
  Hide advanced+extended (S6+S7) → S1–S5 + S8: S5 ends on "symmetry cancels four polar bonds" with
  no tease of the swap; CHCl₃ appears nowhere else (S8's picker excludes it) — COHERENT.
  (i-2) explore = core only: picker restricted to core species, core formula surface, core
  controls — verified above (38b).
  (i-3) curriculum_tags (CLAIMS): CBSE/NCERT Cl.11 Ch.4 §4.4 — full, `verified: true` ·
  JEE/NEET — full, `needs_teacher_verification: true` · IGCSE — partial (qualitative bond polarity
  only), `needs_teacher_verification: true` · IB DP — full, `needs_teacher_verification: true` ·
  AP — full, `needs_teacher_verification: true` · A-level — full, `needs_teacher_verification: true`.
  (i-4) presets (hide, never reorder — 25d/38h): full (S1–S8) · core+extended (hide S7) ·
  core-only (hide S6+S7).
  (i-5) graph axes: NO graph in this concept (the `trend` block is unused); no axis convention to
  decide.

## Two-pass lens — Block 1 (strategic)

**Prerequisite cliff.** `vsepr_molecular_shapes` → the concept breaks at S4 if the student does not
hold "water is bent because lone pairs push" (S4's bend would read as arbitrary) and at S5 if the
tetrahedron is unfamiliar. Patch: S4 carries the one-clause reason ("its two lone pairs hold the
bonds at 104.5 degrees"); S5 carries "the shape from the shapes lesson" — both non-condescending
to students who have it.

**Exam-backwards trace (JEE-Main/board style).** *"Which of H₂O, NH₃, CCl₄, CHCl₃ has zero dipole
moment? The N–F bond is more polar than the N–H bond, yet NF₃'s dipole moment (0.23 D) is far
smaller than NH₃'s (1.47 D) — explain."* Pieces: what a bond dipole is → S1–S2; vector summation
and cancellation → S3; shape dependence → S4; tetrahedral zero → S5; CHCl₃ nonzero → S6; the
NH₃/NF₃ direction argument → S7. BF₃ (the other standard zero-μ item) → S8's picker + S5's
symmetry rule generalized. No missing piece.

**Misconception entry mapping.** Belief 1 ("polar bonds ⇒ polar molecule") → planted BY S1–S2
themselves (every arrow shown makes polarity feel inevitable — the planting is deliberate and
earned); confronted S3, re-confronted S5, `misconception_watch` rows at both. Belief 3 ("more
polar ⇒ bigger μ") → could be planted by S2's ladder (Δχ up, arrow up IS true for one bond);
S2's narration says "bond", never "molecule", to keep the claim scoped; confronted S7. No EPIC-C
branches (EPIC-L-first directive).

## Two-pass lens — Block 2 (aha designation)

- **PRIMARY aha (S4):** the same polar bonds give a zero dipole or 1.85 debye depending on nothing
  but the shape — polarity lives in geometry, not in the bonds. (The 10-year memory: "bend it and
  it becomes polar.")
- **SUPPORTING (1) — S5:** the cancellation survives into three dimensions — four arrows nobody
  can pair off by eye still sum to exactly zero. Reinforces the primary where the whiteboard
  cannot follow; it is the reason this concept is built.
- **Cohesion check:** S5 is the primary's 3D restatement; S7 is the primary's converse at
  advanced depth (direction decides). Nothing stands alone.
- **Wrong-belief setup:** S1–S2 build confident "polar bonds ⇒ polar" (two states of arrows
  growing with Δχ); S3 breaks it; S4 lands the aha on the rebound — the student who just lost
  "bonds decide" is handed "shape decides" while the loss is fresh.
- **Foundational coverage:** S4 ∈ foundational (S1–S4). Satisfied; no exit-pill needed.

## Scar-list compliance note (engine bug queue consultation)

⚠ PROCESS FLAG: this skeleton was produced in a dispatch without shell access — the live
`query_engine_bug_queue.ts` run could not be executed. Compliance below is against
`docs/FIELD3D_SCENARIO_CHECKLIST.md` (the queue's human-readable mirror) + every scar enumerated
in `docs/CHEMISTRY_PHASE0_BONDING.md` and `docs/notes/bonding_scene_contract.md`.
**quality_auditor MUST run the live query (concept + `--field3d --open`) at Gate 8** and route any
un-covered OPEN row back here.

Applied: no `camera` on any state, above all S5 (spin-rotates-solved-camera CRITICAL scar) ·
countability rides D-4's solved camera + gate, not per-concept solves · glow keys only from the
closed 10-key enum (scar #33) · `render_annotations: true` + `at_ms`/`until_ms` everywhere
(silent-no-op OPEN scar) · `config.field_lines.opacity` present (blank-scene trap) · sliders
sharing scripted quantities joined both ways (S2 ligand, S4 angle — drag-seize scar) · HUD clears
`top: 52px` (OPEN scar) · no frozen tail: every guided state's last cue lands before capture and
S6/S7's post-swap resultant re-land is the sustaining motion; `reveal_hold` declared where a state
ends on a held label · explore self-moves (engine idle spin) · `pmCreateAutoLabel` for every
changing label (μ readout) — never `createLabelSprite` · plain-ASCII species keys, engine composes
Unicode (contract trap 1) · don't-pre-spoil: no arrow before S2, no formula before S3, the
resultant never drawn before S3 · concrete-before-abstract: one bond (S1–S2) before sums (S3+) ·
reveal-synced-to-narration: every cue time above is tuned to its narration beat · one instrument
per quantity (D-3): μ exists ONLY as the HUD line; the arrows are drawn from the same table
(Rule 29 — length = real magnitude).

## Self-review (architect, chemistry form)

Consulted NCERT Chemistry Class 11 Ch.4 index to confirm §4.4 scope. No teaching method, no
example problem, no figure imported. NCERT Exemplar consulted for misconception beliefs only.
Atomic claim one sentence ✓ · 8 states per the FIXED Checkpoint-A table, unchanged ✓ · control
table complete (ring/archetype/delta/controls/words) ✓ · no archetype repeat except the declared
cross-concept `pair-shift` ✓ · misconception_watch at 3 genuine pivots only ✓ · 2 deep-dive
states + 3 clusters each ✓ · entry_state_map with foundational containing the primary aha ✓ ·
prerequisites advisory ✓ · anchor universal + physics-true, rejected candidate recorded ✓ ·
DoD complete, zero TBDs ✓ · both ring cuts walked ✓ · curriculum_tags as claims, only CBSE
verified ✓ · Rule 41 pass run over every title, cue and narration line (no idioms, no
personification — "pulls" is the physics word for electronegativity's action, used as NCERT uses
it; "drops", "flips", "cancel" literal) ✓ · [LIVE]-only capabilities (E1+E2) ✓ · three flags
raised to the parent rather than silently resolved ✓.
