# ARCHITECT SKELETON — hydrogen_bonding
# "Hydrogen bonding" · Phase-0 bonding wave, Desk 1 concept 2 of 2 · tier 💎 (capability 1 + 4)
# NCERT Chemistry Class 11 Ch.4 "Chemical Bonding and Molecular Structure" §4.9 (hydrogen bonding)
# Renderer: field_3d · scenario_type: "bonding_scene" · placement: 'free' · E1+E2 capabilities only (no E3 block authored)
# State design FIXED by docs/CHEMISTRY_PHASE0_BONDING.md §0b (founder-proxy Checkpoint A DESIGN_OK, cycle 2, 2026-08-01).
# This skeleton EXPANDS that table; it does not redesign it. Authoritative engine contract:
# docs/notes/bonding_scene_contract.md (supersedes the Phase-0 doc's literal guesses); the dispatching
# session's verified engine facts supersede both, and every renderer claim below was re-verified
# against field_3d_renderer.ts source (line numbers cited inline).
# branch feat/chemistry-polarity-hbonding · registration: site #1 ONLY (src/data/concepts/chemistry/) · validate:chemistry

---

## ⛔ DISPATCHING-SESSION MEASUREMENT NOTE (2026-08-02) — READ BEFORE CHECKPOINT A

The architect's flag **F-A** (no scripted temperature ramp) was independently confirmed by the
dispatching session's own grep of `field_3d_renderer.ts`: the complete set of keys the
`bonding_scene` apply + frame passes read is enumerated at `:53176–54610`, and `thermal` carries
exactly `T_K` and `jiggle_scale`. There is no temperature cue anywhere.

**But the measurement says the gap is LARGER than a missing ramp key, and F-D as written is not
reachable even if the surgeon ships one.** The dispatching session replayed the SHIPPED link pass
(`field_3d_renderer.ts:54399–54471`, transcribed exactly, driven by the shipped `mgFrame`,
`bscOrientRot`, `bscCharges`, `bscJiggle`, `bscLinkSites`, `bscLinkOk`, `bscLinkLatch`) over a
solved 30-unit tetrahedral network. Measured links-per-molecule, mean over a 0.8–15 s sweep,
shipped link defaults (form 210 / break 260):

| `jiggle_scale` | 100 K | 200 K | 273 K | 298 K | 373 K | 450 K | 550 K | 600 K | drop 298→600 |
|---|---|---|---|---|---|---|---|---|---|
| 0.6 | 3.66 | 3.65 | 3.61 | 3.61 | 3.56 | 3.52 | 3.46 | 3.43 | **−5 %** |
| 0.8 | 3.65 | 3.57 | 3.50 | 3.48 | 3.39 | 3.28 | 3.12 | 3.04 | **−13 %** |
| **0.9** | — | 3.51 | **3.41** | **3.38** | 3.25 | 3.08 | 2.89 | **2.78** | **−18 %** |
| 1.0 | 3.61 | 3.46 | 3.32 | 3.26 | 3.07 | 2.88 | 2.64 | 2.49 | −24 % |
| 1.2 | 3.55 | 3.28 | 3.02 | 2.95 | 2.68 | 2.40 | 2.09 | 1.97 | −33 % |
| 1.4 | 3.46 | 3.02 | 2.68 | 2.54 | 2.20 | 1.94 | 1.65 | 1.55 | −39 % |

**The root cause is the thermal model, not the missing cue.** Jiggle amplitude goes as
√(T/T₀) (`:52209–52217`), so the whole authored slider range 100 → 600 K is only a factor of 2.45
in amplitude and a physically honest 298 → 600 K is a factor of **1.42**. A tetrahedral network at
a physically honest O···O sits ~80 pm inside its own `break_pm`, so a 1.42× amplitude change moves
the link count by ~18 %. **Every route to F-D's "≤50 % of S5" costs S5 its own designed ≈3.5.**

Searched and rejected, each measured, not argued:
* **wider/narrower lattice spacing** — O···O 5.75 / 6.00 / 6.15 / 6.30 units: the fractional drop
  never exceeds −33 % and the 298 K value falls with it (6.30 units reads 2.66 at 298 K).
* **tighter hysteresis** (`break_pm` 205 / 215 / 230 with `form_pm` 210 / 195 / 185, 36 combinations)
  — best is −20 % at a 298 K reading of 2.86.
* **positional + orientational disorder** (5 × 3 × 3 = 45 combinations, deterministic seeded
  offsets) — strictly worse: disorder lowers the 298 K count without improving the fraction.
* **flattening the cluster into a slab** (KY 1 / 1.6 / 2.2 / 3.0) — worse on both axes.

**Consequence for the F-A dispatch:** a `T_from`/`T_at_ms`/`T_ramp_ms` cue on its own buys S6 a
scripted *decline* from 3.38 to 2.78 — real, monotone, honest, and matched by a visibly harder
jiggle — but not a collapse. If the founder wants S6 to read as the network coming apart, the
engine ask must ALSO cover the thermal model (units that separate as well as jiggle — expansion or
diffusion), which is a materially bigger dispatch and touches the Phase-0 ledger's
`states_of_matter` deferral. **This is a founder-proxy Checkpoint A decision, not an authoring one.**

**Two further measured corrections to the skeleton below (both supersede it):**
1. **S5 `jiggle_scale: 0.10` is wrong — it produces NO flicker.** Measured at the solved layout,
   scale 0.10 and scale 0.30 both read a byte-constant 3.67 links/molecule for the whole state: the
   excursions never reach `break_pm`, so nothing ever breaks and "Links keep re-forming" is a
   caption over a still picture. **The measured value is `jiggle_scale: 0.9`** — mean 3.38, live
   range 3.13–3.73 (≈47–56 dashed links swinging), which is both the design's ≈3.5 and a real
   flicker. json_author authors 0.9 on S5/S6/S7/S8 and changes ONLY `thermal.T_K` between them —
   changing the scale between states would make the S5→S6 comparison not a temperature comparison
   at all (the σ/π two-instrument scar).
2. **The 30-unit layout is a diamond (ice-Ic) network at O···O = 5.75 scene units = 276 pm**, sites
   sorted outward from the centroid so the `count` slider grows the network from the middle without
   moving a unit already on screen. Measured: **3.38 links/molecule at 298 K** (F-C's ≥3.2 met),
   and the S4 negative control is exact — the SAME 30 coordinates read **0.00** links in H₂S, H₂Se
   and H₂Te. Cluster radius is **12.84 units**; the `network` camera (az 35 / el 22 / dist 17) shows
   ±9.81 units vertically, so the outer shell of the network BLEEDS past the frame. That is
   irreducible, not a layout error: real water occupies 270 unit³ per molecule, so 30 molecules
   need a sphere of radius ≥12.5 whatever the arrangement. Authoring `camera` is forbidden
   (lesson 3), so the state is framed on the middle of the network with the edges running off — to
   be confirmed on THE EYE frames at Checkpoint B, not assumed.

---

> **ARCHITECT FLAGS TO THE DISPATCHING SESSION (2026-08-02) — read before chemistry_author opens.**
>
> **F-A · BLOCKING (S6): no scripted temperature ramp exists in `bonding_scene`.** Verified in
> session, not taken on report: `T_K` is resolved ONCE per frame from either a teacher drag or the
> static authored `thermal.T_K` (`field_3d_renderer.ts:53507–53508`); the only scripted ramp in the
> free-placement path is `sepAt`'s separation ramp (`:53603–53610`); a full-file grep for
> `T_from | T_at_ms | T_ramp | thermal_at_ms | heat_at_ms` returns zero bonding_scene hits. S6's
> whole beat — "heat it; links fail one by one; every O–H survives" — must AUTO-PLAY on the state
> clock (Rule 31; the headless harness never drags). A static-hot state shows the END of the story,
> not the failing. **There is no acceptable JSON fallback.** Route to `field3d-surgeon` (queued
> behind E3a/E1c — one surgeon in `field_3d_renderer.ts` at a time, Rule 40), ask patterned on the
> shipped `approach_from / approach_at_ms / approach_duration_ms`:
> 1. `thermal.T_from` + `T_at_ms` + `T_ramp_ms` — `T_K` becomes the destination, ramped via `mgRamp`
>    (closed-form, D-1; no accumulator).
> 2. The ramp yields to the drag-seize guard exactly as `sepAt` does (`PM_bscTempDragged` already
>    exists at `:53507`); the temperature slider row already tracks the live `T_K` per frame
>    (`:54592–54593`), so the DOM stays joined for free — state that in the dispatch so the surgeon
>    doesn't rebuild it (`scripted_change_desyncs_the_dom_control_that_shares_it` scar).
> 3. Register `T_at_ms`/`T_ramp_ms` as frozen-pin candidates in `deriveStateMeta` **in the same
>    change** (the polarity E1c-8 lesson).
>
> ⚠ **AMENDED by the measurement note above: item 1 alone does not reach F-D.** See the table.
>
> **F-B · RESOLVED, recorded:** the S4 compare swap is scene-wide — a unit participates iff its
> species equals the state's base species and it authors no differing per-unit `species` (`:53695`).
> Author S4's two units WITHOUT per-unit species overrides and both waters become H₂S.
>
> **F-C · MEASUREMENT REQUIREMENT (S5):** ≥3.2 links per molecule at the frozen pin, measured.
> **MET: 3.38 measured** (see the note above). A low count is GEOMETRY (contract trap 4) — never a
> threshold edit.
>
> **F-D · MEASUREMENT REQUIREMENT (S6):** at ramp end, links/molecule ≤ 50 % of S5's measured value.
> **NOT REACHABLE on the shipped thermal model** — best measured is −18 % at S5 = 3.38, or −39 % at
> the cost of S5 reading 2.54. Escalated to Checkpoint A.
>
> **F-E · VERIFY-BY-HAND REQUIREMENT (S8):** every picker species hand-driven with an
> expected-reading table (concept-1 lesson 5). Table in §3 S8. If NH₃ or HF reads 0 links in the
> water-solved layout, DROP it from `explore_units` rather than ship a picker refuting S4.
>
> **F-F · DELIBERATE CHOICE, recorded:** the closed glow enum has no key for the trend panel, so S7
> authors NO glow at all (a non-keyed `glow_focal` dims the whole scene with no focal lit — scar #33).
>
> **Gate 8 obligation:** this skeleton was produced without shell access; scar compliance below is
> against the checklist mirror + both Phase-0 docs. quality_auditor MUST run the live queue
> (`query_engine_bug_queue.ts hydrogen_bonding` and `--field3d --open`).

---

## 1. Atomic claim + tier justification (honest)

This concept teaches ONE thing: a δ+ hydrogen bonded to a strongly negative atom (N, O, F) forms a
weak, directional, constantly-breaking link to a δ− atom of a neighbouring molecule — and those
links, individually ~20× weaker than a covalent bond, collectively explain water's anomalous boiling
point. It does NOT cover ice's open lattice / why ice floats (deferred per the Phase-0 ledger),
other intermolecular forces (dispersion, dipole–dipole generally), intramolecular hydrogen bonding
(o-nitrophenol), or solubility/hydration (ledger, P5).

**Tier: 💎, with its capability numbers (1 + 4, per the 0a table).** A whiteboard draws two water
molecules and one dotted line. It cannot show thirty molecules making and breaking links
continuously (capability 1), and it cannot make the boiling-point anomaly **emerge** — the trend
line extrapolated from H₂S/H₂Se/H₂Te and water landing 193 K above it, with the engine deriving the
gap by least squares rather than the author asserting it (capability 4). S5–S7 are the diamond;
S1–S4 build the machinery that makes S7 an argument. Full coverage on all six boards, including
**IGCSE full and "an entire AP unit"** — the strongest single reason the bonding wave exists.

## 2. State count + arc — 8 states (FIXED by Checkpoint A cycle 2; do not renegotiate)

Bare δ+ hydrogen → second molecule attaches → pull-test: the link is not a bond → it needs N/O/F →
thirty molecules, links everywhere → heat breaks links only → the boiling-point anomaly (PRIMARY
aha) → explore.

**Rings (FIXED): ALL EIGHT states are `core`.** Promoted at Checkpoint A cycle 2 because the anomaly
(S6–S7) is this concept's whiteboard-test justification and sits inside the IGCSE cut. No extended
ring, no advanced ring. `teaching_method`: straightforward motion beats S1–S7 (field omitted); S8
`exploration_sliders`. `advance_mode`: `manual_click` S1–S7, `interaction_complete` S8 (Gate 12: 2
distinct modes ✓).

**Declared archetype repeat (Rule 31b, cross-concept):** `pair-shift` (S1) is a DELIBERATE repeat
with `bond_polarity_dipole_moment` S1 — the student met the shared pair sliding off the hydrogen in
the prerequisite; here the identical picture is USED (the reuse is the pedagogy — Rule 25
foundation-first made visible). Declared, never renamed. Within this concept no archetype repeats:
S5 (`network-flicker`, steady flicker at fixed T) and S6 (`heat-the-network`, decline under heating)
share `mode: 'network'` but not an archetype — an archetype is a claim about RHYTHM (the
hybridisation scar (d)), and the per-state cue tables are the enforcement.

## 3. Per-state control table + choreography (Rule 31)

Home pose (Rule 32d): water molecule(s) on the deep-blue field background, solved cameras only (NO
`camera` authored anywhere), atom labels on, scale 1 unit = 48 pm (`BS_BOND_LEN` 2.0 = the 96 pm
O–H). The persisting apparatus is the LINK GRAMMAR: solid sticks = covalent bonds, the dashed
H···O link = the hydrogen bond, δ labels on focal units — same visual language every state; only
the population and the temperature change.

**Camera continuity plan (Rule 32d), against the five verified solved cameras:** S1 single unit at
origin → per-shape solve az 35 / el 47 / dist 7 (H₂O is "general"). S2–S3 two units →
`approach_link` mode camera az 35 / el 16 / dist 11 (SHARED — the S1→S2 pull-back frames the new
second molecule, the one camera move Rule 32d permits). S4 two units, `compare` mode → az 35 /
el 20 / dist 12 (a small el/dist nudge; the H₂O→H₂S swap itself does NOT move the camera). S5–S7 →
`network` camera az 35 / el 22 / dist 17 (SHARED across all three — one frame for three states).
S8 → explore camera + engine idle spin.

| # | ring | teaches (one idea) | archetype | ≤5-word delta cue | controls (min_ring) | dur | words | glow focal |
|---|---|---|---|---|---|---|---|---|
| S1 | core | the δ+ hydrogen is a bare proton — the shared pair sits far from it | `pair-shift` ⇄ (declared, cross-concept) | "Bare positive hydrogen" | — | 16 s | 41 | `electrons` → `charges` |
| S2 | core | a second molecule turns and attaches | `approach-and-link` | "Second molecule attaches" | — | 16 s | 45 | `units` → `links` |
| S3 | core | it is NOT a bond — the link fails, the stick does not (misconception beat 1) | `pull-to-break` | "Weak link breaks first" | separation (core) | 18 s | 46 | `links` |
| S4 | core | it needs a strongly negative atom — S is not negative enough | `species-swap` | "Sulfur is not negative enough" | species (core) | 16 s | 43 | `charges` |
| S5 | core | thirty molecules: links form and break everywhere at once | `network-flicker` | "Links keep re-forming" | count (core) | 16 s | 45 | `links` |
| S6 | core | heat breaks links one by one; every O–H survives (misconception beat 2) | `heat-the-network` | "Heat breaks links only" | temperature (core) | 18 s | 41 | `links` |
| S7 | core | the anomaly you can now explain — **PRIMARY aha** | `trend-break` | "Water boils far higher" | — | 20 s | 49 | none (F-F) |
| S8 | core | explore | `interaction_complete` | — | species · count · temperature (all core) | open | 0 | none (sandbox) |

**Rule 32 legibility plan (all states):** cause moves first, effect after a readable beat — S1 the
pair slides, THEN the δ labels land; S2 the second molecule travels, THEN the link snaps on; S3 the
pull begins, the link stretches, THEN it breaks (the sticks never move — they ARE the control
condition); S4 the swap completes, THEN the charges shrink and the link is absent; S6 the heating
shows, THEN the count falls. Only the taught variable moves per state (S7's molecules hold their S6
pose while only the trend panel reveals). Delta cue = the caption opener, ≤5 words. Exactly one
glow focal per instant; where two are listed the focus HANDS OVER at the cue, never overlaps.

### Per-state `bonding_scene` authoring detail

Every state: `placement: 'free'`, `show_hud: true`, `render_annotations: true` (every annotation
carries `at_ms`/`until_ms` — any caption whose claim stops being true gets `until_ms`, concept-1
lesson 2), `config.field_lines.opacity` present at CONFIG level (blank-scene trap), **`eye_capture_ms`
at STATE level, never nested inside `bonding_scene`** (concept-1 lesson 1), value ≥ last cue + 2000.
`links: { enabled: true }` and NOTHING else in the links block on S2–S8 — every threshold falls back
to the shipped defaults (donor 0.15 / acceptor 0.30 / form 210 / break 260 / min 90 / angle 40 /
pm_per_unit 48); re-authoring them invites drift. **NEVER author `links.show_count`** — parsed and
never read (the σ/π decorative-string scar). No `dipole.show_bond_arrows` anywhere — this concept's
charge story is δ labels only; the arrow layer belongs to the prerequisite.

**S1 — "Bare positive hydrogen"** · `mode: 'assemble'` · `species: 'H2O'` · one unit at origin · `focal_unit: 0`
- `electrons: { show: 'pair_glyph', pair_shift: 0 }` at entry; `pair_shift_at_ms: 4000`,
  `pair_shift_duration_ms: 2500` ramping the glyph toward oxygen (row N — a rigid two-dot glyph
  translating along the bond axis, no deforming cloud).
- `dipole: { show_charges: true, show_charge_values: false }`, `charges_at_ms: 7500` (effect after
  cause; the cue withholds the layer until the evidence lands). Values stay OFF here (Rule 34
  minimum; the numbers earn their place at S4).
- `hud_lines: ['delta_chi']` — prints 1.24 (|χ(H) − χ(O)| = |2.20 − 3.44|, Pauling). No formula
  surface. No controls. NO second molecule, NO link (don't pre-spoil S2).
- The one idea beyond the prerequisite's repeat: hydrogen has NO inner electrons — when the pair
  shifts away, what is left is an almost bare proton. That is why hydrogen specifically.
- `eye_capture_ms: 10500`.
- Narration intent (41 w, 4 sentences): "Oxygen pulls the shared electron pair much harder than
  hydrogen — the electronegativity difference is 1.24. Watch the pair slide toward oxygen. Hydrogen
  has no other electrons, so what remains is an almost bare, positive proton: delta plus. Oxygen
  becomes delta minus."

**S2 — "Second molecule attaches"** · `mode: 'approach_link'` · two H₂O units on `separation_axis`
- `units`: two H₂O, no per-unit species overrides; `separation_axis` authored; unit 1's `orient`
  authored so its oxygen faces unit 0's donor H inside the 40° window.
- Scripted approach: `approach_from` wide, `separation: 5.75`, `approach_at_ms: 3000`,
  `approach_duration_ms: 2600`. Destination O···O = 5.75 units × 48 pm = **276 pm** (O–H 96 pm +
  H···O 180 pm). The link SNAPS ON when H···O crosses form_pm 210 (O···O 306 pm = 6.375 units) —
  near the end of the travel, a readable cause→effect beat by construction.
- `dipole: { show_charges: true }` (no cue — carried over from S1's established labels; the NEW
  thing is the link, and only the new thing changes — Rule 32d).
- `hud_lines: ['links']` — 0 → 1. No formula surface. No controls.
- `eye_capture_ms: 9000` (link formed, settled at 276 pm).
- Narration intent (45 w, 4 sentences): "The delta-plus hydrogen attracts the delta-minus oxygen of
  a second water molecule. The second molecule turns and settles in a straight line: hydrogen to
  oxygen, 180 picometres — almost twice the 96-picometre O–H bond inside each molecule. A dashed
  link forms. This is a hydrogen bond."

**S3 — "Weak link breaks first"** · `mode: 'approach_link'` · same two units (home pose = S2's end) · MISCONCEPTION BEAT 1
- Scripted pull — the approach machinery run OUTWARD: `approach_from: 5.75`, `separation: 9.0`
  (O···O 432 pm, well past break), `approach_at_ms: 4000`, `approach_duration_ms: 3500`. The link
  stretches and BREAKS when H···O crosses break_pm 260 (O···O 356 pm = 7.42 units); both O–H sticks
  are byte-identical throughout — the contrast beat (Rule 16a): the wrong expectation ("it's a
  bond") is given its honest evidence first (the link held all through S2), then its consequence
  fails on screen while the real bonds never move.
- `controls: [{ id: 'separation', min_ring: 'core' }]` — live and JOINED both ways to the scripted
  pull (contract trap 3, re-seed on entry + per-frame track until a trusted drag seizes).
- **Formula surface INTRODUCED here**, math-serif Unicode, ONE surface, shown S3–S6 and S8, hidden
  at S7 (the trend panel occupies that zone — Rule 34d):
  `E(H···O) ≈ 20 kJ·mol⁻¹ ≪ E(O−H) = 464 kJ·mol⁻¹`
  Convention: tabulated mean bond enthalpies (the NCERT Class-11 data-table convention; the water
  H-bond figure ~20 kJ·mol⁻¹ sits inside NCERT §4.9's 10–40 range). chemistry_author ratifies the
  digits; the FIXED design number is the ratio ≈1:23.
- `hud_lines: ['links']` — 1 → 0. The "276 pm" distance tag carries `until_ms` = break time.
- `eye_capture_ms: 10500` (post-break: link gone, sticks intact, formula surface up).
- Narration intent (46 w, 4 sentences): "Pull the two molecules apart. The dashed link stretches and
  breaks at about 260 picometres — both O–H bonds are unchanged. A hydrogen bond takes about 20
  kilojoules per mole to break; a covalent O–H bond takes 464. This link is more than twenty times
  weaker."

**S4 — "Sulfur is not negative enough"** · `mode: 'compare'` · start: two linked H₂O (S2's home pose, `separation: 5.75`, no approach cues) · `compare_species: 'H2S'`
- Scripted scene-wide swap at `compare_at_ms: 5000`, `compare_duration_ms: 2500` — BOTH units follow
  the base species (F-B, `:53695`); author no per-unit species overrides. After the swap the link is
  ABSENT — **derived, not authored (D-2)**: H₂S's donor H δ+0.036 fails the 0.15 donor threshold AND
  S δ−0.071 fails the 0.30 acceptor threshold; nothing in the JSON says "no link." The acceptor set
  {N, O, F} emerges from the same thresholds — there is no whitelist.
- `dipole: { show_charges: true, show_charge_values: true }` — the values ARE this state's lesson:
  the labels collapse H +0.319 / O −0.638 → H +0.036 / S −0.071 (⚠ 0.319 is the DONOR H's charge,
  never quoted as oxygen's).
- `controls: [{ id: 'species', min_ring: 'core' }]` — the species picker (sourced from
  `config.explore_units`) is live and joined; a drag seizes the scripted swap (`:53457`).
- `hud_lines: ['delta_chi']` — 1.24 → 0.38 (|2.58 − 2.20|). Formula surface persists.
- `eye_capture_ms: 10000`.
- Narration intent (43 w, 4 sentences): "Swap oxygen for sulfur. Sulfur pulls only slightly harder
  than hydrogen — the electronegativity difference falls from 1.24 to 0.38, and the small charges
  fall with it. No link forms. A hydrogen bond needs a strongly negative partner: in practice
  nitrogen, oxygen, or fluorine."

**S5 — "Links keep re-forming"** · `mode: 'network'` · 30 H₂O units, explicit `units` array
- **Coordinates: the dispatching session's numeric solve** — a diamond (ice-Ic) network at
  O···O = 5.75 units, sites sorted outward from the centroid, per-unit `orient` solved so each
  molecule's two O–H bonds aim at two of its four neighbours. **Measured 3.38 links/molecule at
  298 K** (F-C's ≥3.2 met).
- `thermal: { T_K: 298, jiggle_scale: 0.9 }` — **`jiggle_scale` MUST be authored explicitly; it
  defaults to 0** (`:53583`). **0.9 is the MEASURED value** (see the measurement note: 0.10 gives a
  byte-constant 3.67 and no flicker at all). Amplitude ∝ √(T/T₀), deterministic per-unit seeded
  sines (D-1) — frozen baselines safe by construction.
- `links: { enabled: true }`. Label budget (D-6): defaults are correct at 30 units — author nothing.
- `controls: [{ id: 'count', min_ring: 'core' }]` — seeds at 30, max = the engine mesh pool = 30
  (`count_max` NOT authored). Shrinking the count never moves a surviving unit (D-1).
- `hud_lines: ['links_per_unit']` — THE number of this concept; it is what explains S7.
- `eye_capture_ms: 9000` (flicker mid-life; the measured value is read HERE).
- Narration intent (45 w, 3 sentences): "Now thirty water molecules. Each delta-plus hydrogen can
  link to a delta-minus oxygen on a neighbour, so dashed links form in every direction — and they
  keep breaking and re-forming as the molecules move. On average, each molecule holds more than
  three links at any moment."
  *(The spoken claim "more than three" is deliberately robust to any measured value ≥3.2 — the
  narration digit can never disagree with the instrument.)*

**S6 — "Heat breaks links only"** · `mode: 'network'` · same 30 units (home pose = S5) · MISCONCEPTION BEAT 2 · **⛔ SEE F-A + THE MEASUREMENT NOTE**
- Intended (F-A ask): `thermal: { T_from: 298, T_K: 600, T_at_ms: 4000, T_ramp_ms: 5000,
  jiggle_scale: 0.9 }`. Measured outcome even WITH the ramp: 3.38 → 2.78 links/molecule (−18 %),
  amplitude ×1.42. F-D's ≤50 % is not reachable on the shipped thermal model.
- `controls: [{ id: 'temperature', min_ring: 'core' }]` — the slider row is ALSO the temperature
  instrument (Rule 33d + D-3: the row prints the live rounded T_K, `:54592–54593`; no HUD
  temperature line exists in the closed enum and none is needed).
- `hud_lines: ['links_per_unit']` — falls live; the design's "links vs T_K" is this pair of live
  instruments read together.
- `links: { enabled: true }`. Formula surface persists (it is the EXPLANATION: 20 goes long before
  464). **Not one O–H stick moves relative to its molecule — engine-guaranteed** (no intra-unit
  stick-break machinery exists; `check:bonding-scene` §9(b) asserts bond-length invariance under T),
  and that guarantee IS the contrast beat.
- `eye_capture_ms: 11500`.
- Narration intent (41 w, 4 sentences): "Raise the temperature. The molecules shake harder and the
  dashed links fail one by one — watch the count per molecule fall. Not one O–H bond breaks.
  Boiling separates water molecules from each other; it never splits water into hydrogen and
  oxygen."

**S7 — "Water boils far higher"** · `mode: 'network'` · same 30 units at `T_K: 298` (cooled home pose; links back) · PRIMARY AHA
- The trend surface (row O), revealed by `compare_at_ms` — the trend reveal fires on `compare_at_ms`
  regardless of mode, with no swap (no `compare_species` authored, so the swap machinery stays dark):
  ```
  trend: { show: true,
           x_label: "Period of central atom",
           y_label: "Boiling point / K",
           points: [ {label:'H2O', x:2, y:373}, {label:'H2S', x:3, y:213},
                     {label:'H2Se', x:4, y:232}, {label:'H2Te', x:5, y:271} ],
           extrapolate_from: ['H2S','H2Se','H2Te'] }
  compare_at_ms: 4000, compare_duration_ms: 6000
  ```
  **`points[].label` = plain-ASCII species keys** (`H2S`, never `H₂S`) — the engine composes the
  subscripts AND the `bp` HUD line resolves by matching the live species key (contract trap 1).
- **The gap is DERIVED, not authored** — the engine least-squares the three family points and draws
  the extrapolation ("180 K on the line") and the gap ("+193 K") itself. Least-squares check on
  (3, 213) (4, 232) (5, 271): slope 29.1, intercept 122.2, value at x = 2 → **180.4 K**; water at
  373 → gap **+193 K**. Nothing about the anomaly is asserted.
- `hud_lines: ['bp']` — resolves 373 for the live species H₂O. NO glow authored (F-F). Formula
  surface HIDDEN this state (Rule 34d). No controls. `thermal.jiggle_scale: 0.9` (the backdrop keeps
  living and self-sustains the state past the reveal); declare `reveal_hold`.
- **`eye_capture_ms: 13000` authored explicitly** — the frozen-pin deriver reads
  `compare_at_ms + compare_duration_ms + 600` = 10600 here, which lands just at the end of the slow
  reveal; 13000 photographs the settled panel.
- Narration intent (49 w, 4 sentences): "Compare water with its own family. Hydrogen sulfide boils
  at 213 kelvin, hydrogen selenide at 232, hydrogen telluride at 271. On that line water should
  boil near 180 kelvin — it boils at 373, one hundred degrees Celsius. The 193-kelvin gap is the
  energy needed to break its hydrogen bonds."
- 🔴 **The Rule-35 anchor lives HERE** (§9) — it IS this state's content, so no pre-spoil hazard.

**S8 — "Explore hydrogen bonds"** · `mode: 'explore'` · core · `advance_mode: interaction_complete`
- Controls (ALL, Rule 31c): `[{id:'species',min_ring:'core'}, {id:'count',min_ring:'core'},
  {id:'temperature',min_ring:'core'}]`. `links: {enabled:true}`, `thermal: {T_K:298,
  jiggle_scale:0.9}`, `hud_lines: ['links_per_unit']`. Formula surface: the S3 core surface returns.
  Engine idle spin covers the no-frozen-tail duty (trap 6).
- **`config.explore_units` MUST be authored explicitly** (Rule 38b / the sibling's F10 — silence on
  a picker is a breach even when the default is defensible).
- **Per-species picker table — MEASURED on the shipped layout, F-E DISCHARGED (see Appendix A).**
  The architect's predicted readings for NH₃ and HF were both WRONG, and both would have shipped a
  sandbox refuting the concept (concept-1 lesson 7 verbatim). `explore_units` is therefore authored
  as **`["H2O","H2S","H2Se","H2Te"]`** — the chalcogen family, which is exactly S4's lesson AND
  S7's trend family, so every reading a teacher can produce is one the guided arc already taught.

  | picker species | predicted | **MEASURED** (298 K, jiggle 0.9, solved layout) | disposition |
  |---|---|---|---|
  | H₂O | 3.38 | **3.40** (range 3.00–3.67) | ✅ keep |
  | H₂S | 0 | **0.00** | ✅ keep — S4's lesson |
  | H₂Se | 0 | **0.00** | ✅ keep |
  | H₂Te | 0 | **0.00** | ✅ keep |
  | NH₃ | "lower than water" | **4.42** (range 3.80–4.73) — HIGHER | ❌ **DROPPED** |
  | HF | "links form, chain-like" | **0.00** — no links at all | ❌ **DROPPED** |

  **Why NH₃ is dropped.** 4.42 > water's 3.40 is an ENGINE ARTIFACT: the link criterion has no
  acceptor saturation, so ammonia's three donor hydrogens all link while its single lone pair
  accepts without limit. Real ammonia is acceptor-limited (~2 hydrogen bonds per molecule) and boils
  at 240 K against water's 373 K. A teacher who picks NH₃, reads 4.42 and concludes "ammonia is more
  hydrogen-bonded than water" has been handed the exact opposite of S7's argument by the concept's
  own sandbox.
  **Why HF is dropped.** HF reads 0.00 links in this layout, which would refute S4's {N, O, F}
  lesson on screen. The cause is geometric, not chemical: in `MG_MOLECULES` HF is a diatomic with
  **central `H`**, so its donor hydrogen sits at the unit ORIGIN and the fluorine points outward —
  the water-solved tetrahedral lattice presents no acceptor to a donor buried at the centre of its
  own unit. Ammonia and hydrogen fluoride both remain TAUGHT (S4's narration names nitrogen, oxygen
  and fluorine, and the `nh3_hf_same_anomaly` drill-down cluster carries them); they are simply not
  offered as sandbox species this fixed layout can render honestly.
- Narration: 0 / open.

## 4. Misconception confrontation plan (Rule 16a — 2 rows, at the two FIXED pivots only)

| wrong belief | state | contrast beat (sequential, never superimposed) |
|---|---|---|
| "A hydrogen bond is a bond like any other" | **S3** | the link is given its honest evidence first (it formed, it held, it has a length), then the pull: the dashed link stretches and fails at 260 pm while both solid O–H sticks sit byte-identical — and the formula surface lands the 20 vs 464 kJ·mol⁻¹ scale |
| "Water boils high because its O–H bonds are strong" / "boiling splits water" | **S6** | heating kills links on the live counter while not one O–H stick ever yields; narration closes it: boiling never splits water into hydrogen and oxygen |

No other state carries a `misconception_watch`. Belief source: NCERT Exemplar Ch.4 (belief only).

## 5. `has_prebuilt_deep_dive` states

- **S3** — the bond-vs-force distinction is the historically stuck point; also carries the
  quantitative scale.
- **S7** — the anomaly is the exam workhorse and the graph argument is the piece students reproduce
  wrongly.

## 6. Drill-down clusters

S3: `hbond_vs_covalent_strength` · `intermolecular_vs_intramolecular` · `what_breaks_when_water_boils`.
S7: `boiling_point_family_trend` · `nh3_hf_same_anomaly` · `hbonds_hold_dna_strands`.

## 7. entry_state_map

```
foundational:    STATE_1 → STATE_4   # what a hydrogen bond is + what it needs
                                     # MANDATORY EXIT-PILL → boiling_anomaly
boiling_anomaly: STATE_5 → STATE_7   # the network + the PRIMARY aha (S7)
exploration:     STATE_8
```

The PRIMARY aha (S7) sits OUTSIDE the foundational range, so the foundational slice declares the
**mandatory exit-pill** into `boiling_anomaly`.

## 8. Prerequisites (advisory, Rule 23)

- `bond_polarity_dipole_moment` (Desk 1 concept 1) — the δ+/δ− grammar and the pair-shift picture.
  The declared cross-concept archetype repeat at S1 IS the patch.
- `vsepr_molecular_shapes` (SHIPPED, baseline-locked) — bent water; the near-tetrahedral link
  directions at S5.
- Downstream: a future water/states-of-matter concept inherits the ice beat (ledger).

## 9. Real-world anchor (Rule 35 / 38f — universal, physics-true)

**Primary — water itself, SPOKEN AT S7** (the anchor and the aha are one sentence). Water boils at
the same temperature everywhere on Earth at sea level, and by its own molecular family it should
boil near 180 K (−93 °C): there would be no liquid water, no oceans. The 193-kelvin gap the engine
draws IS the hook. Maximally universal (Rule 35), widest-syllabus-overlap (38f), physics-true at
every depth this concept reaches. Secondary (one clause, inside S6's narration): boiling water never
splits it into hydrogen and oxygen — the steam above a cooking pot is still H₂O.

**Rejected candidates, recorded deliberately:**
- *"Ice floats on lakes"* — the ice-lattice beat is ledger-deferred (never narrate what is not
  drawn), and frozen lakes are climate-regional (Rule 35 caution).
- *"Sweat cools you by evaporating"* — physics-true but points at latent heat generally, not at
  hydrogen bonding specifically.
- *DNA base-pairing as the anchor* — universal and true, but not demonstrable on this canvas; kept
  as a drill-down cluster (S7), never the hook.

## 10. Definition of Done (Gate 0 — zero TBDs)

(a) **States:** as §3.
(b) **Symbol-label table:** δ⁺ / δ⁻ → atom-attached labels (`show_charges`); charge values → 
`show_charge_values`, S4 only · χ → spoken "electronegativity", never a bare canvas symbol · Δχ →
HUD "Δχ = 1.24" (value-only) · H···O → the dashed link + the ··· notation in the formula surface ·
O−H → solid stick + en-dash in text · pm → "picometres" spoken in full at first use (S2) ·
kJ·mol⁻¹ → superscript Unicode, formula surface only · K → "kelvin" spoken in full at first use
(S7); axis label "Boiling point / K" · links per molecule → HUD `links_per_unit` · T → the
temperature slider row's live value (D-3: no second T instrument) · molecule labels → engine-composed
Unicode subscripts from plain-ASCII species keys (trap 1).
(c) **Direction-rule plan (chemistry variant — balanced-equation ledger N/A: no chemical reaction
appears anywhere in this concept; no state symbols, no oxidation numbers, no mole scale factor).**
The direction duty is the **link-grammar convention**: a hydrogen bond is always drawn
donor-H···acceptor (D–H···A), dashed, visually distinct from the solid covalent sticks; stated once
in S2's narration and held by the engine's donor/acceptor thresholded criterion in every later
state; the 40° angle window is why the second molecule must TURN before it attaches.
(d) **Motion plan:** per §3 — pair slide · approach-and-snap · pull-to-break · scene-wide swap ·
steady flicker · heat-driven decline · slow trend reveal · idle-spin sandbox; no static state; cause
before effect throughout; S5≠S6 rhythm declared.
(e) **Modes/config:** `field_3d` · `bonding_scene` · `placement:'free'` everywhere · modes
`assemble` (S1), `approach_link` (S2–S3), `compare` (S4), `network` (S5–S7), `explore` (S8) — all
in the E1+E2 LIVE list; NO E3 block authored anywhere; `render_annotations: true`;
`config.field_lines.opacity` present; state-level `eye_capture_ms` per state;
`links.show_count` never authored.
(f) **assessment + coverage_map:** 4 items, each tagged `depth_ring` (all `core`): (1) which of
H₂O/H₂S/HCl/CH₄ shows hydrogen bonding, and why [S4] · (2) explain why water boils 160 K above
hydrogen sulfide although it is the lighter molecule [S7] · (3) when water boils, which attractions
break and which do not [S3/S6] · (4) roughly compare the energy to break a hydrogen bond and an O–H
covalent bond [S3]. Under every preset all four survive (single ring). misconception_watch: exactly
the §4 two rows.
(g) **Macro↔micro / representation triangle (Rule 33, chemistry form):** the taught MACRO variable
(boiling point) is explained by a PARTICULATE mechanism. Particulate vertex leads every guided
state; macro vertex = the heating beat + the boiling-point graph (S6–S7); symbolic vertex never
leads a core state — the formula surface first appears at S3 AFTER the break has played. Instruments
carry 33d: `links_per_unit` is a live counter; the temperature slider row prints live T_K; the trend
panel derives and prints 180 / +193.
(h) **Canvas budget (Rule 34):** ONE formula surface — `E(H···O) ≈ 20 kJ·mol⁻¹ ≪ E(O−H) =
464 kJ·mol⁻¹` — introduced S3, shown S3–S6 and S8, hidden S7. Captions = the ≤5-word delta cues
only; narration prose in the strip below. HUD value-only. All math real Unicode (δ⁺ δ⁻ Δχ ··· ≈ ≪
·mol⁻¹ ₂ →) across DOM, HUD, graph text and sprite paths. HUD clears `top: 52px`.
(i) **Curriculum-flex (Rule 38):**
  (i-1) Ring-cut walk — trivial by design and stated: all 8 states are `core`. Both cuts are the
  full lesson — COHERENT by identity.
  (i-2) Explore = core only: trivially satisfied, BUT `config.explore_units` is still authored
  explicitly (38b), and every listed species is core-taught content.
  (i-3) curriculum_tags (CLAIMS): CBSE/NCERT Cl.11 Ch.4 §4.9 — full, `verified: true` · JEE/NEET,
  IGCSE, IB DP, AP, A-level — full, `needs_teacher_verification: true`.
  (i-4) Presets: ONE — full (S1–S8). Single-ring concepts derive exactly one.
  (i-5) Graph axes (38e), decided: x = period of the central atom (2→5, left to right), y = boiling
  point in kelvin, increasing upward. The only dialect difference is the unit (IGCSE tends to °C),
  resolved in NARRATION, not on the axis — "373 kelvin, one hundred degrees Celsius". No axis-swap
  toggle needed.

## Two-pass lens — Block 1 (strategic)

**Prerequisite cliff.** `bond_polarity_dipole_moment` → the concept breaks at S1 if δ+/δ− is
unfamiliar; patch: S1 does not reference the prerequisite — it RE-PERFORMS the pair-shift motion in
full. `vsepr_molecular_shapes` → breaks at S5 if "links form in every direction" reads as arbitrary;
patch: the solved near-tetrahedral orientations SHOW the geometry rather than naming it.

**Exam-backwards trace.** *"H₂O boils at 373 K while H₂S, the heavier molecule, boils at 213 K —
explain. Which of HF, HCl, NH₃, H₂S show hydrogen bonding? When water boils, what breaks?"* Pieces:
δ+ H and why hydrogen specifically → S1; the link, its geometry and its 180 pm length → S2; its
strength scale → S3; the {N, O, F} criterion (HCl fails on the acceptor threshold — the exact engine
derivation) → S4; the network and its ~3.4 links/molecule → S5; heat breaks links only → S6; the
trend argument and the 193 K gap → S7. No missing piece.

**Misconception entry mapping.** Belief 1 — planted by S2 ITSELF (a link between molecules, named a
hydrogen *bond*); the planting is deliberate and flagged at the planting moment (180 pm vs 96 pm),
then confronted at S3. Belief 2 — planted by everyday language outside the sim; confronted at S6.
No EPIC-C branches (EPIC-L-first directive).

## Two-pass lens — Block 2 (aha designation)

- **PRIMARY aha (S7):** by its own molecular family, water should boil near 180 K — no oceans — and
  the 193-kelvin gap the graph derives is nothing but its hydrogen bonds.
- **SUPPORTING (1) — S3:** the link is real but it is NOT a bond — twenty times weaker, and it
  breaks while the true bonds never move.
- **Cohesion check:** S3 gives the aha its unit of account (20 kJ·mol⁻¹ per link); S5 gives it its
  multiplier (>3 links per molecule); S7 cashes both in as 193 K.
- **Wrong-belief setup:** S2 builds confident "it's a bond"; S3 breaks it. S5/S6 build confident
  "these links are individually trivial"; S7 flips it — collectively they are worth 193 kelvin.
- **Foundational coverage:** S7 is OUTSIDE `foundational` (S1–S4) → the mandatory exit-pill into
  `boiling_anomaly` is declared in §7.

## Scar-list compliance note

⚠ PROCESS FLAG: the architect ran without shell access. quality_auditor MUST run the live
`query_engine_bug_queue.ts hydrogen_bonding` and `--field3d --open` at Gate 8.

Applied: no `camera`/`camera_position` on any state (lesson 3) · camera continuity declared per
state against the five verified solves · glow keys only from the closed 10-key enum; S7/S8 author NO
glow rather than a non-keyed `glow_focal` (scar #33, F-F) · `render_annotations: true` +
`at_ms`/`until_ms` on every annotation; claims that stop being true carry `until_ms` (lessons 2/6) ·
`config.field_lines.opacity` present (blank-scene trap) · **state-level `eye_capture_ms`, never
nested** (lesson 1), authored explicitly on S7 · sliders sharing scripted quantities joined both
ways — S3 `separation` (trap 3), S4 `species` (`:53457`), S6 `temperature` (`:54592`) ·
**`thermal.jiggle_scale` authored explicitly wherever motion is needed — it defaults to 0**
(`:53583`) · **`links.show_count` never authored** (decorative-key scar) · `links: { enabled: true }`
present on every link state (the link pass is gated on the block's presence) · D-6 label budget:
defaults respected at 30 units · no frozen tail: S7 declares `reveal_hold`; S8 rides the engine idle
spin (trap 6) · `pmCreateAutoLabel` for every changing label · plain-ASCII species keys everywhere
(trap 1) · HUD clears `top: 52px` · don't-pre-spoil: no second molecule before S2, no link before
S2, no formula before S3, no network before S5, no trend before S7 · concrete-before-abstract: one
molecule → two → thirty → the graph · one instrument per quantity (D-3) · low-link-count = geometry,
never thresholds (trap 4, F-C) · derived-not-authored (D-2): S4's absent link and S7's gap are both
engine derivations.

## Self-review (architect, chemistry form)

Consulted NCERT Chemistry Class 11 Ch.4 index to confirm §4.9 scope. No teaching method, example
problem, or figure imported. NCERT Exemplar consulted for misconception beliefs only. Atomic claim
one sentence with named deferrals ✓ · 8 states per the FIXED table, arc/archetypes/delta cues/
controls/real numbers unchanged — one BLOCKING engine gap reported (F-A), zero silent redesigns ✓ ·
control table complete ✓ · no archetype repeat except the declared cross-concept `pair-shift` ✓ ·
misconception_watch at the 2 FIXED pivots only ✓ · 2 deep-dive states + 3 clusters each ✓ ·
entry_state_map with the mandatory exit-pill ✓ · prerequisites advisory ✓ · anchor universal +
physics-true, three rejected candidates recorded ✓ · DoD complete, zero TBDs ✓ · ring-cut walk
stated though trivial; explore_units authored despite a defensible default ✓ · curriculum_tags as
claims, only CBSE verified ✓ · Rule 41 pass over every title, cue and narration line ✓ ·
[LIVE]-only capabilities (E1+E2), no E3 block ✓ · every quoted number is either an engine-printed
value or a published value with its convention named ✓ · six flags raised to the parent ✓.

---

# APPENDIX A — THE MEASURED GEOMETRY (dispatching session, 2026-08-02)

Every number here was produced by replaying the **SHIPPED** link pass
(`field_3d_renderer.ts:54399–54471`, transcribed exactly) driven by the shipped `mgFrame`,
`bscOrientRot`, `bscCharges`, `bscJiggle`, `bscLinkSites`, `bscLinkOk` and `bscLinkLatch`, extracted
from `FIELD_3D_RENDERER_CODE` by the same harness `src/scripts/check_bonding_scene.ts` uses.
**json_author authors these values verbatim. They are measurements, not proposals.**

## A1 · The two-molecule pair (S2 · S3 · S4)

```
units: [
  { "id": "hb_donor",    "species": "H2O", "at": [0,0,0], "orient": [190, 69] },
  { "id": "hb_acceptor", "species": "H2O", "at": [0,0,0], "orient": [180,  0] }
]
separation_axis: [1, 0, 0]
```
`separation_axis` overrides `at` for units 0 and 1 (`:53615`), placing them at ∓sep/2 along the axis
— the authored `at` is therefore inert here and is written as the origin deliberately.

* `orient [190, 69]` puts one O–H **exactly** along +x: measured direction cosine **1.0000**.
* `orient [180, 0]` puts one lone pair **exactly** along −x: measured **1.0000**. The acceptor
  presents its lone pair to the incoming hydrogen — the chemically correct picture, and it costs
  nothing because the engine's criterion checks only the D–H···A angle.
* At the authored 5.75-unit separation the single link measures **H···O 180.0 pm at 179.9°** — a
  textbook linear hydrogen bond, and exactly one link (not a mutual pair).

**Measured form/break edges (static sweep):**

| O···O (units) | pm | links |
|---|---|---|
| 6.40 | 307 | 0 |
| **6.375** | **306** | **0** ← the form edge |
| 6.30 | 302 | 1 (H···O 206.4 pm, 180.0°) |
| 5.75 | 276 | 1 (H···O 180.0 pm, 179.9°) |

**S2 approach** `approach_from: 12.0` → `separation: 5.75`, `approach_at_ms: 3000`,
`approach_duration_ms: 2600`: the link **snaps on at 5100 ms** at O···O 305 pm — 500 ms before the
travel ends, so the cause (the approach) completes visibly and the effect (the link) lands inside
the same beat. `eye_capture_ms: 9000`.

**S3 pull** `approach_from: 5.75` → `separation: 9.0`, `approach_at_ms: 4000`,
`approach_duration_ms: 3500`: the link **breaks at 5800 ms** at O···O 357 pm / H···O 261 pm — the
hysteresis carries it from `form_pm` 210 out to `break_pm` 260, then it fails, and the pull
continues for a further 1700 ms with both O–H sticks untouched. `eye_capture_ms: 10500`.

**S4 swap** at the fixed 5.75 separation: H₂O reads 1 link, H₂S reads **0** — measured, derived,
nothing authored. `eye_capture_ms: 10000`.

## A2 · The 30-molecule network (S5 · S6 · S7 · S8)

A diamond (ice-Ic) network at **O···O = 5.75 scene units = 276 pm**, sites sorted outward from the
centroid so the `count` slider grows the network from the middle and never moves a unit already on
screen. Per-unit `orient` solved on a 1° grid to aim each molecule's two O–H bonds at two of its
four neighbours.

```json
[{"id":"hb_w0","species":"H2O","at":[0.44,0,0],"orient":[125,-37]},
 {"id":"hb_w1","species":"H2O","at":[-2.88,-3.32,3.32],"orient":[232,-36]},
 {"id":"hb_w2","species":"H2O","at":[-2.88,3.32,-3.32],"orient":[232,-36]},
 {"id":"hb_w3","species":"H2O","at":[3.76,-3.32,-3.32],"orient":[232,-36]},
 {"id":"hb_w4","species":"H2O","at":[3.76,3.32,3.32],"orient":[232,-36]},
 {"id":"hb_w5","species":"H2O","at":[-6.2,-6.64,0],"orient":[125,-37]},
 {"id":"hb_w6","species":"H2O","at":[-6.2,0,-6.64],"orient":[125,-37]},
 {"id":"hb_w7","species":"H2O","at":[-6.2,0,6.64],"orient":[125,-37]},
 {"id":"hb_w8","species":"H2O","at":[-6.2,6.64,0],"orient":[125,-37]},
 {"id":"hb_w9","species":"H2O","at":[0.44,-6.64,-6.64],"orient":[338,-39]},
 {"id":"hb_w10","species":"H2O","at":[0.44,-6.64,6.64],"orient":[125,-37]},
 {"id":"hb_w11","species":"H2O","at":[0.44,6.64,-6.64],"orient":[125,-37]},
 {"id":"hb_w12","species":"H2O","at":[0.44,6.64,6.64],"orient":[53,35]},
 {"id":"hb_w13","species":"H2O","at":[7.08,-6.64,0],"orient":[338,-39]},
 {"id":"hb_w14","species":"H2O","at":[7.08,0,-6.64],"orient":[338,-39]},
 {"id":"hb_w15","species":"H2O","at":[7.08,0,6.64],"orient":[53,35]},
 {"id":"hb_w16","species":"H2O","at":[7.08,6.64,0],"orient":[53,35]},
 {"id":"hb_w17","species":"H2O","at":[-9.52,-3.32,-3.32],"orient":[232,-36]},
 {"id":"hb_w18","species":"H2O","at":[-9.52,3.32,3.32],"orient":[83,-29]},
 {"id":"hb_w19","species":"H2O","at":[-2.88,-9.96,-3.32],"orient":[232,-36]},
 {"id":"hb_w20","species":"H2O","at":[-2.88,9.96,3.32],"orient":[301,17]},
 {"id":"hb_w21","species":"H2O","at":[-2.88,-3.32,-9.96],"orient":[301,28]},
 {"id":"hb_w22","species":"H2O","at":[-2.88,3.32,9.96],"orient":[83,-29]},
 {"id":"hb_w23","species":"H2O","at":[3.76,-9.96,3.32],"orient":[232,-36]},
 {"id":"hb_w24","species":"H2O","at":[3.76,9.96,-3.32],"orient":[301,17]},
 {"id":"hb_w25","species":"H2O","at":[3.76,-3.32,9.96],"orient":[83,-29]},
 {"id":"hb_w26","species":"H2O","at":[3.76,3.32,-9.96],"orient":[301,28]},
 {"id":"hb_w27","species":"H2O","at":[10.4,-3.32,3.32],"orient":[20,-33]},
 {"id":"hb_w28","species":"H2O","at":[10.4,3.32,-3.32],"orient":[20,-33]},
 {"id":"hb_w29","species":"H2O","at":[-12.84,0,0],"orient":[125,-37]}]
```

**Measured, `thermal.jiggle_scale: 0.9`, shipped link defaults:**

| state | T_K | links/molecule (mean) | live range | raw dashed links |
|---|---|---|---|---|
| S5 · S7 · S8 | 298 | **3.40** | 3.13 – 3.67 | ~47 – 55 |
| S6 | 600 | **2.84** | 2.40 – 3.33 | ~36 – 50 |

**Representative frozen pins** — chosen as the instant whose value is NEAREST the state's own mean,
never a flattering outlier:

| state | `eye_capture_ms` | reads |
|---|---|---|
| S5 | **8200** | 51 links = 3.40 / molecule |
| S6 | **10300** | 43 links = 2.87 / molecule |
| S7 | **12000** | 52 links = 3.47 / molecule |

**`count` slider curve** (units authored centre-outward, so shrinking never moves a survivor):
2 → 0.90 · 5 → 1.46 · 10 → 2.05 · 15 → 2.02 · 20 → 2.19 · 25 → 2.78 · 30 → 3.40.

**Framing, recorded honestly:** cluster radius **12.84 units**; the shipped `network` camera
(az 35 / el 22 / dist 17) shows ±9.81 units vertically, so the outer shell bleeds off-frame. This is
irreducible — liquid water occupies 270 unit³ per molecule, so any honest 30-molecule arrangement
needs radius ≥ 12.5. Authoring `camera` is forbidden (it suppresses the solved camera). **Confirm on
THE EYE frames at Checkpoint B; do not assume.**

## A3 · What was searched and rejected for S6 (all measured, none argued)

* lattice spacing O···O 5.75 / 6.00 / 6.15 / 6.30 units — fractional drop never beats −33 %, and the
  298 K reading falls with it;
* hysteresis, 36 combinations of `form_pm` 210/195/185 × `break_pm` 260/230/215/205 — best −20 % at
  a 298 K reading of 2.86;
* positional + orientational disorder, 45 combinations of seeded offsets — strictly worse on both
  axes (disorder lowers the 298 K count without improving the fraction);
* flattening the cluster into a slab, 4 factors — worse on both axes.

The binding constraint is the thermal model itself: amplitude ∝ √(T/T₀), so 298 → 600 K is ×1.42.

---

# ⛔ CHECKPOINT A — CYCLE 1: `DESIGN_FIX` (founder-proxy, 2026-08-02)

Verdict `DESIGN_FIX`. Recommendation on the S6 question: **option (B)** — script the ramp and
re-scope S6's words to the claim §0b actually makes. Rubric 7/10 (advisory, did not move the verdict).

**The finding that dissolved the crisis.** F-D ("links/molecule ≤ 50 % of S5") was the *architect's
own invented bar*. §0b's S6 row asks for **"links vs T_K"** and the cue **"Heat breaks links only"**
— a relationship and a misconception beat, not a magnitude. **F-D is RETIRED.** Option (C) (an
expansion/diffusion thermal model) is rejected on three independent grounds, any one sufficient:
it is the wrong physics (a real network collapses at vaporisation by *separation*, a density
collapse — the shipped model is isochoric, so its small decline across the liquid range is
*defensible*); it would have to be authored rather than derived (the D-2 defect); and it builds the
ledger-deferred `states_of_matter` concept. **(C) is where the alarm rule would fire.**

## The blocking measurement — F1(c), run by the dispatching session

founder-proxy made EQ-2 conditional: *"report the 600 K live RANGE. Ranges overlap ⇒ blocking."*
Measured on the shipped harness, 0.8–18 s sweep, `jiggle_scale` 0.9, shipped link defaults:

| state | mean | live range |
|---|---|---|
| S5 @ 298 K | 3.41 | **3.00 – 3.67** |
| S6 @ 600 K | 2.85 | **2.27 – 3.33** |

**They OVERLAP** (S6 max 3.33 > S5 min 3.00). **29 % of S6's frames read a value S5 also produces at
298 K.** ⇒ **EQ-2 IS BLOCKING.**

**And the proposed fix is confirmed to work.** Averaging over the 640 ms lookback the link pass
*already builds* (`:54419–54433`) separates them cleanly:

| state | smoothed range |
|---|---|
| S5 @ 298 K | 3.18 – 3.59 |
| S6 @ 600 K | 2.60 – 3.16 |

Separated: **YES**. The flicker stays in the pixels, where it is S5's lesson; the number stops being
noise, so S6's caption becomes readable.

## ⛔ S6 IS HARD-BLOCKED — TWO ENGINE CHANGES, BOTH BLOCKING, BOTH IN `field_3d_renderer.ts`

| # | Ask | Status |
|---|---|---|
| **EQ-1** | `thermal.T_from` + `T_at_ms` + `T_ramp_ms` — a line-for-line clone of the shipped angle ramp at `:53500–53503` (same `mgRamp`, same default-constant shape), yielding to the existing `PM_bscTempDragged` guard (`:53507`) exactly as `sepAt` yields at `:53603`. The slider row already tracks live `T_K` per frame (`:54592`) — do NOT rebuild it. Register both cue keys in `deriveStateMeta` **in the same change** (the E1c-8 lesson). | **BLOCKING** |
| **EQ-2** | A **time-averaged** `links_per_unit` over the lookback the link pass already builds. Pin-safe by the same argument as the FIXED scar `hysteretic_state_cannot_be_latched_under_a_time_pin`. | **BLOCKING** (F1(c) measured: ranges overlap) |
| **EQ-3** | Make `bscSiteExtent` see molecular units, then set `network: { …, fit: true }`. The auto-fit **already ships** (`:53280–53283`) and is a silent no-op here only because `bscSiteList`'s free-placement branch filters through `bscIsSite` (`:52449`), which excludes molecules. Rule 40a: extend the helper, do not build it twice. | ride-along (verify on frames at B) |

Dispatch as **ONE `field3d-surgeon` visit to one region** (Rule 40). **The dispatching session did
NOT touch `src/lib/`** — per the desk's alarm-rule instruction, S6 stops here and is reported.

## Findings resolved by the dispatching session

* **F7 — DISCHARGED by measurement, not deferred.** NH₃ and HF were hand-measured on the shipped
  layout *before* json_author opens, exactly as required. Results and dispositions are in §3 S8:
  **NH₃ 4.42** (higher than water — an engine artifact, the criterion has no acceptor saturation,
  so ammonia's three donors all link while its single lone pair accepts without limit; real NH₃
  boils 133 K *below* water, so a teacher reading 4.42 would be handed the opposite of S7's
  argument) and **HF 0.00** (its donor hydrogen is the molecule's *central* atom in `MG_MOLECULES`,
  so it sits at the unit origin with the fluorine outward, and a water-solved tetrahedral lattice
  presents it no acceptor). **Both DROPPED**; `explore_units` is the chalcogen family, where every
  reading a teacher can produce is one the guided arc taught. Both remain TAUGHT in S4's narration
  and in the `nh3_hf_same_anomaly` drill-down.
* **F6 — applied.** S3 authors `separation: 8.0`, not 9.0. The separation slider's default maximum
  is 8 (`:53036`), and the row is joined to the scripted pull every frame (`:54586`), so a 9.0
  destination would clamp the thumb at 8 while the scene sat at 9.0 — the D-3 one-instrument scar.
  8.0 is O···O 384 pm, still far past the 357 pm break, so the beat is unchanged.
* **F3 — applied.** S7 **shows** the formula surface. The engine already re-anchors `#bsc_formula`
  to `top:52px; left:16px` whenever the trend panel is up (`:53262–53266`), built for exactly this
  state; the skeleton's stated collision does not exist, and the 20 ≪ 464 kJ·mol⁻¹ scale is the unit
  of account for S7's own sentence.
* **F4 — applied.** S7's closing line becomes *"That 193-kelvin gap is there because those hydrogen
  bonds have to be broken first."* A temperature difference is not an energy.
* **F2 — applied.** The Rule-35 anchor now reaches a spoken line. S7's narration closes:
  *"Without them, water would be a gas everywhere on Earth — there would be no oceans."* (S7 had 49
  of 55 words.) This was the sibling desk's F3 recurring one concept later; the scar row founder-proxy
  drafted (`skeleton_anchor_specified_in_section_9_reaches_no_narration_line`) is the right ratchet.
* **F1(a) — applied.** F-D retired in writing (above).

## Findings ROUTED, not silently resolved

* **F5 — RESOLVED by founder decision (2026-08-02): the S7 delta cue is now
  "Water boils far higher".** It was reported rather than edited, per this desk's instruction that a
  defect found in a FIXED §0b delta cue is escalated and never changed unilaterally; the founder
  then ruled. founder-proxy's case was that "break" is this concept's load-bearing *literal* verb
  (S3 "Weak link breaks first", S6 "Heat breaks links only", "not one O–H bond breaks"), so re-using
  it figuratively at the PRIMARY aha asks an ESL Class-11 student to switch senses at the hardest
  moment (Rule 41a). The replacement is 4 words (≤5, Rule 32c), literal — "boils" is the physics
  verb and "far higher" a plain comparison — and it states the RESULT rather than naming a graph
  the student has not yet been shown. The archetype stays `trend-break` (an internal label, not
  reader-facing). **`docs/CHEMISTRY_PHASE0_BONDING.md` §0b has been amended in the same change**, so
  the fixed design and this skeleton cannot disagree.
* **F1(b) — pending the engine.** S6's narration must be re-drafted onto what is unambiguously
  visible and engine-guaranteed (the ×1.42 jiggle amplitude and the invariant O–H sticks), with the
  count change stated as *fewer links*, never as a countdown. That re-draft depends on what EQ-1 and
  EQ-2 actually ship, so it is deliberately NOT written yet.
* **F9 — carried to chemistry_author.** `links_per_unit` is `2L/N` (`:54471`) — the mean *degree*,
  correct convention. But only ~1.70 links are *owned* per molecule, so any line that multiplies
  3.40 × 20 kJ·mol⁻¹ is **2× wrong**. The honest product is ~1.70 × 20 ≈ 34 kJ·mol⁻¹ against water's
  ΔH_vap ≈ 40.7 — which is the striking agreement worth having. No drafted line states the product;
  the guard is recorded so none ever does.
* **F10 / F11 / F12 — recorded.** The exit-pill has no schema home (`entry_state_map` is validated
  nowhere) and chemistry has no serving path yet, so it is a design note, not a field. F11 (the
  S3→S4 el 16→20 / dist 11→12 nudge) is subsumed by EQ-3 if the free-placement solve is made
  content-derived. F12 (CBSE `verified: true`) is a wave-wide convention question, raised once.

## Status

**S1 · S2 · S3 · S4 · S5 · S7 · S8 are design-complete and fully measured.** S6 is blocked on EQ-1 +
EQ-2. Per the desk's alarm rule the build STOPS here rather than authoring a state the taste gate
has already rejected in its only shippable form (option (A), rejected on Rule 31b and Rule 32a).
