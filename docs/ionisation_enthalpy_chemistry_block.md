# CHEMISTRY BLOCK — `ionisation_enthalpy`

> **Author:** `chemistry_author` (pipeline position #2) · **Date:** 2026-08-07 · **Desk:**
> `feat/chemistry-periodicity`, synced to `origin/master fed2180`.
> **Upstream:** `docs/ionisation_enthalpy_skeleton.md` v1 (architect skeleton, executing Phase 0's
> OWN flagged 8-state fallback — arc/rings/misconception/anchor/control-table SEALED, executed not
> redesigned) + `docs/CHEMISTRY_PHASE0_PERIODICITY.md` (§Config contract, §THE MOTION VOCABULARY —
> binding) + `docs/atomic_and_ionic_radius_chemistry_block.md` (sibling — same house form, and its
> verified engine constants reused rather than re-derived where the same physics is drawn twice).
> **Downstream:** `json_author` converts this block + the skeleton into
> `src/data/concepts/chemistry/ionisation_enthalpy.json` (Gate 8b: no registration in the 8 physics
> sites).
> **Renderer:** `field_3d` · `orbital_shapes` (engine builds 1–6 landed on `origin/master`).

---

## 0. Numeric verification report — READ FIRST

**Method.** A scratch Node harness (`verify_ie.js`, run from the desk scratchpad, deleted after
use per the Tools-forbidden clause) re-implemented — line for line, not approximated — the LIVE
functions in `src/lib/renderers/field_3d_renderer.ts`: `osR` (exact hydrogenic radial forms),
`osSlaterS` + `OS_SUBSHELLS` (Slater's rules), the `OS_IONS` build (Z, S, Z_eff, `zEffBy` per
occupied subshell, `valenceKey`, `coreClosed`) for every element H–Ca × charge −3…+3, and
`osRhoAt`/the shell (radial-CDF) r₉₀ law used by `orbital:'shell'` — the SAME law the sibling's
harness verified against, re-derived independently here rather than assumed. Every radial
function's own normalisation integral was checked ≥ 0.999998 before trusting any r₉₀ off it
(1s/2s/2p = 1.000000; 3s/3p = 0.999999; 4s = 0.999998 — identical to the sibling's own report). The
`OS_IE` citation table was read directly from its source lines (`:60000–60021`), not retyped from
the skeleton, and every arithmetic claim built on it (`osIeDrawCount`, the 9.2× ratio, the Slater
model spread) was independently computed from that source, not copied from the skeleton's own
numbers.

### 0a. Confirmed exactly (skeleton figure = source figure, every one, no discrepancies)

Unlike the sibling block, **this skeleton had no numeric defects.** The K/4s-class systematic
error the sibling caught (813.5 → 808.71 pm) was already patched before this skeleton was written
(S4's engine-config intent already reads "K's 4s (808.71 pm, model)"), and every other figure
checked out on first read.

| Skeleton figure | Source / measured | Method | Verdict |
|---|---|---|---|
| `OS_IE` table: Na 495.8/4562/6910.3, Li 520.2, F 1681.0, K 418.8, Be 899.5, B 800.6, N 1402.3, O 1313.9, Ne 2080.7, Mg 737.7/1450.7/7732.7, Al 577.5/1816.7/2744.8/11577 | identical, verbatim, every digit | direct read of `OS_IE` at `:60000–60021` | CONFIRMED EXACT (all 14 quoted values) |
| Be 899.5 > B 800.6 | true | direct comparison on the source table | CONFIRMED |
| N 1402.3 > O 1313.9 | true | direct comparison on the source table | CONFIRMED |
| `osIeDrawCount`: Na 3, Mg 4, Al 5 | Na 3, Mg 4, Al 5 | harness, `osValenceCount(neutral) + 2`: Na valence 1 (3s¹) → 3; Mg valence 2 (3s²) → 4; Al valence 3 (3s²3p¹) → 5 | CONFIRMED EXACT, formula and outputs both |
| 9.2× ratio (ΔᵢH₂/ΔᵢH₁, Na) | 4562 / 495.8 = **9.2013** | harness, exact division on the two citations | CONFIRMED — "9.2 ×" is the correct rounding |
| Slater model spread 1.07× (Li) → 5.40× (Ne) | Li **1.066×** (554.4 predicted / 520.2 measured); Ne **5.396×** (11226.7 predicted / 2080.7 measured) | harness, `E = 13.6·Z_eff²/n²` eV → ×96.485 kJ/mol, `Z_eff` from Slater on the neutral atom's own valence subshell | CONFIRMED (rounds to 1.07× / 5.40× exactly as claimed; matches the renderer's own code comment "554 predicted / 520.2 measured" and "11226 / 2080.7" verbatim) |
| S3/S4/S5 shell radii: Li 371.46, Ne 72.31, K 808.71 pm | Li **371.46**, Ne **72.31**, K **808.71** pm | harness, shell (radial-CDF) law, reproducing the sibling's own independently-run figures for the identical species/orbitals | CONFIRMED EXACT — cross-concept consistency: the same three numbers this harness produces are the exact numbers the sibling block's harness produced for the same species |

### 0b. Newly measured — design targets the skeleton left unstated (F's S2 radius; the six S3 intermediates)

The skeleton correctly flags these as design targets for `chemistry_author` to verify (§Source
check: *"F's shell radius at S2; the six intermediate S3 radii (Be→F)"*). Measured here, shell
(radial-CDF) law throughout — the same law S1–S4/S8 all use (`orbital:'shell'`):

| Element | Z_eff (Slater, neutral) | Valence orbital drawn | r₉₀ (shell law), pm |
|---|---|---|---|
| Li | 1.3000 | 2s | 371.46 (endpoint, re-confirmed) |
| Be | 1.9500 | 2s | **247.64** |
| B | 2.6000 | 2p | **162.69** |
| C | 3.2500 | 2p | **130.15** |
| N | 3.9000 | 2p | **108.46** |
| O | 4.5500 | 2p | **92.97** |
| **F** | **5.2000** | **2p** | **81.35** (S2's design target) |
| Ne | 5.8500 | 2p | 72.31 (endpoint, re-confirmed) |

Strictly monotone decreasing across all eight, as the arc requires. **S2's cut is Li (371.46 pm) →
F (81.35 pm)** — a 4.6× contraction over the same eight-value span S3 walks in full.

**Which of these carry the `(spherical average)` HUD qualifier, checked against `osShellExact`
directly (not assumed):** l = 0 orbitals (Li, Be — full or single-electron 2s) are always exactly
spherical; l = 1 orbitals are exact only when the subshell is FULL. Walked element by element:

| Element | Subshell occupancy | Exact? | HUD suffix |
|---|---|---|---|
| Li | 2s¹/2 (l=0) | exact | none |
| Be | 2s²/2 (l=0) | exact | none |
| **B** | 2p¹/6 (l=1, open) | **not exact** | **first appearance of "(spherical average)"** |
| C | 2p²/6 | not exact | "(spherical average)" |
| N | 2p³/6 | not exact | "(spherical average)" |
| O | 2p⁴/6 | not exact | "(spherical average)" |
| F | 2p⁵/6 | not exact | "(spherical average)" |
| Ne | 2p⁶/6 (full) | exact | none |

Confirms the skeleton's own claim precisely: boron is the genuine FIRST appearance of the
qualifier in the S3 sweep, which is exactly where its one narration gloss is scheduled. **Flagged
observation (not a defect, not fixed — sealed skeleton, execute-not-redesign):** S2 shows F
*before* S3 introduces the gloss, and F is itself an open-2p species (2p⁵/6) — so S2's radius HUD
will print the `(spherical average)` suffix on F one state before the concept explains what it
means. The DoD symbol-label table already schedules "first taught: S2" for the radius HUD line in
general and the gloss specifically "at S3/boron", so this ordering is the skeleton's own design,
not an omission introduced here. The term is plain descriptive English ("spherical average"), not
opaque jargon, so it is unlikely to actively confuse — flagged to `quality_auditor` as a documented
observation, matching the sibling block's precedent for a sealed-skeleton close call, rather than
silently patched by adding narration duty the skeleton did not assign to S2.

### 0c. Cross-concept consistency bonus (unplanned, worth recording)

S1's ghost-vs-live comparison (neutral Na held as a ghost, live cloud cutting to Na⁺) draws the
**identical ion** the sibling's own S7 sanity check independently derives:

| Species | Orbital drawn | Z_eff | r₉₀ (shell law), pm |
|---|---|---|---|
| Na (neutral, the S1 ghost) | 3s | 2.2000 | 467.58 |
| Na⁺ (live, post-cut) | 2p | 6.8500 | 61.75 |

Shrink ratio **7.57×** — the exact same ratio the sibling's own S6 independently reports for the
same species pair (469.0 → 61.75 pm, "7.6×" on the pm figures, 7.57× exact). Two concepts, two
independent harnesses, one physical event, one number. This is not a design target the skeleton
asked for; it is offered here as an extra internal-consistency check that came out right.

### Sanity check run (role-spec self-review)

**Na, S5's cliff, traced end to end (not eyeballed):** Na neutral, Z = 11, config 1s²2s²2p⁶3s¹.
Valence subshell 3s, occupancy 1. `osIeDrawCount` = valence(1) + 2 = **3** rungs. Charge steps
0 → +1 → +2 read `OS_IE.Na[0..2]` = 495.8, 4562, 6910.3 kJ/mol — every value a direct table lookup,
never a computation. Ratio IE₂/IE₁ = 4562/495.8 = **9.2013**, rounds to "9.2 ×" exactly as the S5
formula surface states. Independently, the SAME Na⁺ ion this state's stage-shell collapse implies
(3s electron gone, [Ne] 2p⁶ core left) resolves to Z_eff = 6.85, r₉₀ = 61.75 pm — the identical
number §0c and the sibling both independently produce. Nothing in this chain was assumed; every
link was computed.

**Nothing was left unverified.** Every skeleton figure had a call-site-verifiable formula behind
it, and every design target the skeleton flagged is now a measured number in §0b.

---

## 1. Quantities, formulas, computed outputs (`physics_engine_config` reference)

**Note for `json_author`:** the per-state `orbital_shapes` config keys are fully specified in the
skeleton §3b; this section documents the underlying CHEMISTRY quantities those keys drive. `Z`,
`Z_eff`, `r90` reuse the sibling block's verified formulas verbatim — same engine, same law, same
numbers where the same species/orbital recurs (§0c). `ΔᵢH₁`/`IE_k`/`k` are new to this concept and
are, by design, **never derived** — every ionisation enthalpy is a citation (engine decision 3,
Phase 0).

```json
"variables": {
  "Z":      { "name": "nuclear charge (atomic number)", "unit": "e", "min": 1, "max": 20, "default": 11 },
  "S":      { "name": "Slater screening constant", "unit": "e", "min": 0, "max": 5.85 },
  "Z_eff":  { "name": "effective nuclear charge", "unit": "e", "derived": "Z - S", "min": 1.30, "max": 6.85 },
  "r90":    { "name": "90%-boundary radius (this concept's guided-state range)", "unit": "pm", "derived": "r90_Z1(orbital) / Z_eff", "min": 61.75, "max": 808.71 },
  "n":      { "name": "principal quantum number of the drawn valence shell", "unit": "dimensionless", "min": 2, "max": 4 },
  "charge": { "name": "ion charge", "unit": "e", "min": -3, "max": 3, "default": 0 },
  "k":      { "name": "electron index — the k-th electron removed (IE index = charge + 1)", "unit": "dimensionless", "min": 1, "max": 5, "default": 1 },
  "IE_k":   { "name": "k-th ionisation enthalpy (cited, never computed)", "unit": "kJ/mol", "min": 418.8, "max": 14842 }
}
```

```json
"formulas": {
  "z_eff": "Z - S",
  "r90_pm": "r90_Z1[orbital] / Z_eff",
  "ie_index": "charge + 1",
  "delta_h2_over_delta_h1": "IE_2 / IE_1"
}
```

**Deliberately absent: any formula that computes `IE_k` from `Z_eff`.** The Slater-hydrogenic
energy 13.6·Z_eff²/n² is a real quantity this scenario CAN compute (it drives S7's model trace),
but it is never the value printed as an ionisation enthalpy — §0a's spread table (1.07×–5.40×
off, and backwards on both taught orderings) is exactly why. `ie_measured`/`IE_k` is a lookup into
`OS_IE`, stamped `(measured)`, full stop.

```json
"computed_outputs": {
  "ie_measured_hud": "IE_k for the species/index on screen, printed 'IEk = <value> kJ/mol (measured)' with a real <sub> k index; em dash for an anion or an index past the citation",
  "staircase_rung_count": "osIeDrawCount(element) = valence electron count (neutral) + 2 -- e.g. Na 3, Mg 4, Al 5 -- derived so the cliff always lands one rung from the right edge, keyed to the NEUTRAL atom so the axis never rescales under a charge drag",
  "radius_hud_pm": "r90_pm, printed 'r = <n> pm (90%)', or with the ', spherical average' suffix on an open p subshell (from S3/boron on; never on Li, Be, or a full subshell like Ne)",
  "z_eff_hud": "Z_eff, printed '(Slater)' -- S7 only in this concept (38b: the symbol is the prerequisite's, not taught in this concept's own core states)",
  "delta_ratio_display": "IE_2 / IE_1, arithmetic on two citations, printed '9.2 x' on S5's formula surface"
}
```

```json
"constraints": [
  "electron count is exactly conserved in every ionisation equation (Na 11e- -> Na+ 10e- + 1e-; Na+ 10e- -> Na2+ 9e- + 1e-)",
  "charge balances on both sides of every ionisation equation (0 = +1 + -1; +1 = +2 + -1)",
  "every ionisation enthalpy on any surface is a citation from OS_IE (CRC 97th / NIST ASD), stamped (measured); the engine never computes an IE",
  "the model series (Slater-hydrogenic 13.6 Z_eff^2/n^2) is drawn only beside the measurement, in its own colour/dash/mark, and is never stamped (measured)",
  "the staircase rung count is keyed to the neutral atom's valence electron count, never to the live charge, so the axis never rescales under a marker mid-state",
  "ion charge is always an integer in {-3 ... +3}; no fractional charge is ever shown"
]
```

---

## 2. Chemistry ledger

### 2a. Ion-formation equations (S1 and S5 formula surfaces)

**First ionisation — S1 (and S8's generic `X(g) → X⁺(g) + e⁻`):**

```
Na(g)  →  Na⁺(g)  +  e⁻          ΔᵢH₁ = 495.8 kJ/mol (measured)
```

| | electrons | charge |
|---|---|---|
| LHS: Na | 11 | 0 |
| RHS: Na⁺ + e⁻ | 10 + 1 = 11 ✓ | (+1) + (−1) = 0 ✓ |

**Second ionisation — S5 (the misconception payoff; the equation behind `ΔᵢH₂ = 9.2 × ΔᵢH₁`):**

```
Na⁺(g)  →  Na²⁺(g)  +  e⁻        ΔᵢH₂ = 4562 kJ/mol (measured)
```

| | electrons | charge |
|---|---|---|
| LHS: Na⁺ | 10 | +1 |
| RHS: Na²⁺ + e⁻ | 9 + 1 = 10 ✓ | (+2) + (−1) = +1 ✓ |

Both balanced on electron count and on charge. No mass changes (same nucleus; an ionisation is an
electron transfer, not a nuclear reaction). No state symbol beyond `(g)` is taught in this concept
(every species drawn is gas-phase, per the definition of ionisation enthalpy itself — DoD-c). No
redox half-reactions are shown (each equation is a single removal, not a paired
oxidation/reduction), so no oxidation numbers are authored — matching DoD-c exactly.

### 2b. Which equation each surface cites

| State | Formula surface | Equation it documents |
|---|---|---|
| S1 | `Na(g) → Na⁺(g) + e⁻ · ΔᵢH₁ = 495.8 kJ/mol (measured)` | §2a, first equation |
| S5 | `ΔᵢH₂ = 9.2 × ΔᵢH₁ (measured)` | §2a, second equation (the ratio is arithmetic ON both citations, 4562 and 495.8) |
| S6 | `valence electrons = last k before the jump` (plain reading rule, not a reaction equation) | — |
| S8 | `X(g) → X⁺(g) + e⁻ · ΔᵢH₁` | §2a, first equation, generic form |

---

## 3. Per-state narration (`text_en`) — word-budgeted, Rule 41 plain English

*(All within the global 25–55 EN-word band. Word counts given per state; the skeleton's per-state
target is the design aim, not a hard requirement — the band is. Unicode throughout per Rule 34c.)*

**S1 — "Energy to remove an electron" (34 words, 12 anchor):**
> Sodium must be stored under oil; neon needs no protection at all. Pulling one electron off an
> atom costs energy — the ionisation enthalpy, ΔᵢH₁, also written IE₁. Sodium's cost: 495.8
> kilojoules per mole, measured.

**S2 — "Lithium and fluorine compared" (44 words):**
> Lithium and fluorine both keep their outermost electron in the second shell. Fluorine's outer
> electrons sit in the same shell as lithium's, but feel far more protons pulling, with little to
> screen that pull. Lithium's electron costs 520.2 kilojoules per mole; fluorine's costs 1681.0.

**S3 — "Across a period: cost rises" (52 words):**
> Across period two, rising nuclear charge pulls each shell in — lithium 371 picometres down to
> neon 72 — while the same charge raises the removal cost, step by step: 520 up to 2081 kilojoules
> per mole. From boron on, the outer subshell is only part filled, so radius reads as a spherical
> average.

**S4 — "Down a group: cost falls" (40 words):**
> Down a group, sodium's outer electron starts in a new, farther shell than lithium's — potassium's
> farther still, shell four. Farther out and screened by more inner electrons, removal costs less
> each step: 520.2, then 495.8, then 418.8 kilojoules per mole.

**S5 — "Removing a second electron" (55 words):**
> Sodium's staircase is fixed on screen: three rungs, complete before anything moves. The first
> electron costs 495.8 kilojoules per mole. The second climbs the same staircase to 4562 — the
> wall, nine times taller. The second electron comes from a full inner shell, much closer to the
> nucleus, so the price jumps. The third rung: 6910.3.

**S6 — "Counting valence electrons from jumps" (53 words):**
> Now the whole staircase swaps with the element, and the cliff moves. Sodium's one valence electron
> puts the wall after the first rung. Magnesium has two electrons: 737.7, 1450.7, then the wall at
> 7732.7, after the second rung. Aluminium has three: 577.5, 1816.7, 2744.8, then 11577. The jump
> position counts the valence electrons.

**S7 — "Where the model fails" (55 words):**
> Measured, the cost dips at boron: 899.5 down to 800.6 kilojoules per mole. Boron's new electron
> sits in a different, slightly higher subshell — the model, rising smoothly, misses this. Measured,
> oxygen dips: 1402.3 down to 1313.9; two electrons now share one orbital, a cause not shown here.
> The axis is compressed so both traces fit.

**S8 — Explore:** 0 words / open (Rule 31 explore-last; `interaction_complete`).

### Narration-duty compliance check (the five binding duties, verified line by line)

1. **S3 never says the curve builds** — narration names only element/radius/IE values changing; the
   word "curve" does not appear in S3's narration at all, and no verb of construction ("builds",
   "grows", "forms") is used.
2. **S3 glosses "spherical average" at boron in one clause** — "From boron on, the outer subshell is
   only part filled, so radius reads as a spherical average." (12 words, one clause, matches §0b's
   confirmed first-appearance element exactly).
3. **S3 says "step by step", never "always"** — verbatim "step by step"; the word "always" does not
   appear anywhere in S3.
4. **S5/S6 verbs follow Ruling 3** — S5: "climbs the same staircase" (the marker steps on a FIXED
   map, "fixed on screen... before anything moves"); S6: "the whole staircase swaps... the cliff
   moves" (the map swaps). Neither state says "the staircase grows".
5. **S7's honesty beat** — the MEASURED trend is named as the fact ("Measured, the cost dips...");
   the model is named as missing the cause ("the model, rising smoothly, misses this") — never as
   showing or predicting the dip; oxygen's cause is narrated over its own dip with the limit stated
   plainly ("a cause not shown here"). Log-axis clause present verbatim: "The axis is compressed so
   both traces fit."

---

## 4. Notation + dialect ladder (Rule 38c/38d)

- **No logarithms, no calculus, no quantum notation on any formula surface or in any narration
  sentence, anywhere in this concept.** Every core/extended state uses arithmetic and ratio forms
  only (`ΔᵢH₂ = 9.2 × ΔᵢH₁`, `Z_eff = Z − S`). **The S7 log-scale AXIS is a display convention, not
  notation** — Ruling 4 (Phase 0, pre-cleared at Checkpoint A) fires it automatically when
  `model_series` spans a decade; no `log()` operation is ever written on a formula surface or
  computed by a student, so Rule 38c (which governs taught notation) is not engaged by it. This
  distinction is worth stating explicitly since S7 is this concept's only `extended`-ring state and
  there is no `advanced` ring at all — nothing here ever needed one; nothing to flag to the founder.
- **Dual-labelled once, at first appearance (S1):** "the ionisation enthalpy, ΔᵢH₁, also written
  IE₁" — CBSE/NCERT says ionisation enthalpy; JEE/NEET, IGCSE and A-level commonly say ionisation
  energy, and the international symbol is IE₁. Bare "ΔᵢH₁"/HUD `IE₁` after S1.
  "Ionisation" spelling (NCERT/IGCSE/A-level) is used throughout, not US "ionization" — flagged for
  the AP/IB teacher pass per skeleton DoD-i-3.
- **IUPAC-first naming:** sodium, lithium, fluorine, beryllium, boron, nitrogen, oxygen, neon,
  magnesium, aluminium (IUPAC spelling, not "aluminum") used throughout — all already the primary
  names on every board, no common-name aliasing needed.
- **`Z_eff` kept as the literal ASCII HUD token the renderer actually prints** (S7 only) — an
  approved fleet baseline per the sibling block, not a Rule-34c gap `chemistry_author` can fix.
- **NCERT §3.7.1(c) vocabulary used verbatim as TERMS (never as copied prose):** ionisation
  enthalpy, successive ionisation enthalpies, ΔᵢH₁ — every one appears in the narration above at
  its first-taught state, matching what a CBSE/JEE student's textbook and exam already call it.

---

## 5. Drill-down cluster phrasings (5 per cluster, real student voice)

### S5 — `successive_ie_staircase`
1. "why does removing the second electron cost so much more than the first"
2. "is 4562 a typo, that jump looks huge compared to 495.8"
3. "does every element have this same nine times jump"
4. "why is there a wall instead of the cost just going up a bit"
5. "if the second electron is still just an electron why does it cost so differently"

### S5 — `ie_index_vs_charge`
1. "so IE2 of sodium is IE1 of sodium plus, is that right"
2. "why does charge plus one give me the second ionisation energy and not the first again"
3. "im confused which number goes with which electron being removed"
4. "does IE3 mean removing the third electron or removing from the plus-3 ion"
5. "why does the staircase still show three rungs even after i charge it up to plus 2"

### S5 — `why_the_cliff_is_a_shell_edge`
1. "how does one number on a graph prove shells are real"
2. "couldnt the jump just be some other reason, not a shell edge"
3. "why does the cliff appear right after the valence electrons run out"
4. "so the jump position literally tells you how many outer electrons there were"
5. "whats actually different about the electron that comes after the jump"

### S7 — `be_b_anomaly`
1. "wait doesnt boron have more protons than beryllium, why is it cheaper to remove"
2. "why does one more electron in a new subshell make it easier not harder"
3. "is the 2p electron just farther out than the 2s one"
4. "why does the model get this one wrong if its using the same Z_eff rule"
5. "so more penetration means the 2s electron is held tighter than the 2p one"

### S7 — `n_o_anomaly`
1. "why would pairing two electrons in one orbital make removal easier"
2. "isnt oxygen supposed to hold on tighter since it has one more proton than nitrogen"
3. "whats different about oxygen's fourth 2p electron compared to nitrogen's third"
4. "so its repulsion between the two paired electrons that costs energy, not the nucleus"
5. "why doesnt the sim show me the two electrons sharing the orbital directly"

### S7 — `model_vs_measured_reading`
1. "which line am i supposed to trust, the amber one or the cyan one"
2. "why does the model even get graphed if its wrong at these two points"
3. "is the dashed line just wrong or is it wrong on purpose to teach something"
4. "why is the axis compressed, doesnt that make the dip look smaller than it is"
5. "if the model misses boron and oxygen what else might it be getting wrong"

---

## 6. Chemical-validity constraint callouts — what a state must never show

1. **Never a mid-ionisation atom.** `element_steps`/`charge_steps` are cuts — no state may render
   an in-between species (e.g. a "Na⁰·⁵⁺") during a swap; legibility comes from a held ghost, a
   complete map with a stepping marker, or a stepping cited readout, never an eased contraction
   (§THE MOTION VOCABULARY).
2. **Never let `ie_measured` print a value the citation does not carry.** An anion (charge < 0)
   prints `IE = —` unindexed; an index past the array length prints the same em dash. No
   extrapolated or interpolated IE is ever shown.
3. **Never let S1's `ie_measured` line exist at all.** The HUD tracks the live species; after S1's
   own charge cut it would print IE₂ = 4562, S5's entire payoff, thirteen seconds into the concept
   (Ruling 2 / Deviation 5). S1 carries its number on the static formula surface only.
4. **Never let the staircase rung count key off the live charge.** It is derived from the NEUTRAL
   atom's valence count, so the axis never rescales under S5's marker walk or under a teacher's
   `charge` drag mid-state (Rule 32b).
5. **Never a "(measured)" stamp on the model series, and never an unlabelled trace.** S7's amber
   series is the citation; the cyan dashed series is Slater-hydrogenic arithmetic. Each carries its
   own colour, dash, mark and legend row — neither is ever printed without provenance.
6. **Never narrate the model as showing, predicting, or explaining either anomaly.** S7's narration
   names the MEASUREMENT as the fact and the model's omission as the reason it disagrees — reversing
   that (the model "shows" the dip) restates the confronted misconception as fact.
7. **Never more than one glow focal at once, and never ANY focal on S3, S5, S6 or S7.** These four
   states' argument lives on the overlay (table/curve/staircase), which has no glow key; lighting a
   mesh would point attention away from the evidence (§3's declared no-focal states).
8. **Never a fractional or non-integer ion charge, and never a species outside H…Ca or a charge
   outside −3…+3** — the closed enum the whole `OS_IONS` table is built from.

---

## 7. Assessment items (DoD-f, full stems + answers)

**1. Successive IEs → identify the group (→ S6).**
*Stem:* Given the successive ionisation enthalpies 577.5, 1816.7, 2744.8 and 11577 kJ/mol, identify
which group of the periodic table this element belongs to, and justify from the data alone.
*Answer:* The jump between the third value (2744.8) and the fourth (11577) — about 4.2× — marks a
shell edge: the fourth electron removed comes from a closed inner shell, not the outer one. Three
electrons removed before that jump means three valence electrons, so the element belongs to
**group 13** (these are aluminium's own cited values: 577.5, 1816.7, 2744.8, 11577). *Distractor
logic:* a student who assumes "IE always rises steadily" has no way to pick a group from these
numbers at all — every successive IE rises; only the JUMP's position carries the group information.

**2. Why IE₂(Na) ≈ 9 × IE₁(Na) (→ S5).**
*Stem:* Sodium's first ionisation enthalpy is 495.8 kJ/mol, but its second is 4562 kJ/mol — about
9.2 times larger. Explain why.
*Answer:* Sodium's first electron comes from the lone 3s valence electron; once it is gone, the
second electron must come from the complete, much closer [Ne] core (2p⁶) — far less screened and
far more tightly bound to the nucleus. *Distractor logic:* "every electron costs about the same" is
the confronted misconception — the jump is specific to crossing a shell edge, not a general rule
that removal cost rises smoothly electron by electron.

**3. Arrange Be, B, C, N, O by first ionisation enthalpy, both inversions (→ S3 + S7).**
*Stem:* Arrange beryllium, boron, carbon, nitrogen and oxygen in increasing order of first
ionisation enthalpy, and explain any place the order is not what rising atomic number alone would
predict.
*Answer:* B (800.6) < Be (899.5) < C (1086.5) < O (1313.9) < N (1402.3) kJ/mol. Two inversions:
**Be > B**, even though boron has one more proton — boron's added electron enters the 2p subshell,
which penetrates the nucleus less than 2s and sits at a higher energy, so it is easier to remove
despite the extra proton. **N > O**, even though oxygen has one more proton — oxygen's fourth 2p
electron must pair with one already occupying a 2p orbital, and the extra electron-electron
repulsion from pairing raises its energy, making it easier to remove.

**4. Why IE₁ falls from Li to K (→ S4).**
*Stem:* Explain why the first ionisation enthalpy falls from lithium (520.2 kJ/mol) to sodium
(495.8) to potassium (418.8), even though each has more protons than the last.
*Answer:* Down the group the outermost electron starts in a new, farther-out shell each time
(2s → 3s → 4s). The extra distance from the nucleus outweighs the extra nuclear charge — the added
inner shells screen almost all of the extra protons — so the effective pull barely changes while
the electron sits farther away, and removal gets cheaper.

**5. Why IE₁(F) > IE₁(Li) (→ S2/S3).**
*Stem:* Explain why fluorine's first ionisation enthalpy (1681.0 kJ/mol) is more than three times
lithium's (520.2 kJ/mol), even though both keep their outermost electron in the same shell (n = 2).
*Answer:* Both outer electrons sit in shell n = 2, but fluorine has 9 protons screened by only 2
inner electrons, while lithium has 3 protons screened by the same 2 inner electrons. Fluorine's
effective nuclear charge (Z_eff = 5.20) is far higher than lithium's (Z_eff = 1.30) — same shell,
far more unscreened pull, so removal costs far more.

**6. The equation defining ΔᵢH₁, with state symbols (→ S1).**
*Stem:* State the equation that defines the first ionisation enthalpy of sodium, with correct state
symbols, and give the measured value.
*Answer:* Na(g) → Na⁺(g) + e⁻, ΔᵢH₁ = 495.8 kJ/mol (measured). All species are gaseous — ionisation
enthalpy is defined for an isolated atom in the gas phase, so no solid, liquid or aqueous symbol is
ever correct here.

**`coverage_map`:** item 1 → STATE_6 · item 2 → STATE_5 · item 3 → STATE_3, STATE_7 · item 4 →
STATE_4 · item 5 → STATE_2, STATE_3 · item 6 → STATE_1.

---

## Source check (chemistry form)

*Consulted NCERT Chemistry Ch.3 §3.7.1(c) index to confirm scope and to take the exact vocabulary a
CBSE/JEE student meets — "ionisation enthalpy", "successive ionisation enthalpies", ΔᵢH₁, the Be/B
and N/O anomalies. NCERT Exemplar consulted for the two misconception beliefs only. No teaching
method, no example problem, no figure imported from either source. Every worked comparison (Li/F,
Li/Na/K, Na's staircase, Mg/Al's cliffs, Be/B/N/O) was derived directly from the cited `OS_IE` table
and Slater's rules, never copied from a textbook worked example. The real-world anchor (sodium
under oil / neon needing none, S1) is universal — an element's own chemistry, no place, brand,
currency or culture — matching Rule 35.*

**Engine-verified figures (read from `OS_IE` at `:60000–60021` and independently re-derived by this
block's own harness, not merely re-typed from the skeleton):** all 14 quoted IE citations exact ·
`osIeDrawCount` formula and outputs (Na 3, Mg 4, Al 5) exact · 9.2× ratio exact · both orderings
(Be>B, N>O) exact · Slater model spread 1.07×/5.40× exact · shell-law radii for the whole Li→Ne
sweep, including the two design targets the skeleton flagged (F at S2: 81.35 pm; the six S3
intermediates Be/B/C/N/O/F: 247.64/162.69/130.15/108.46/92.97/81.35 pm) — all newly measured here,
none carried over unverified. **No skeleton figure required correction** (contrast with the
sibling's K-radius fix) — every number in `docs/ionisation_enthalpy_skeleton.md` checked out exactly
against its live source.

---

## 8. Engine bug-queue consultation (run live, before finalising this block)

Queried `engine_bug_queue` live (Supabase REST, `dxwpkjfypzxrzgbevfnx`) for
`status = 'FIXED' AND owner_cluster IN ('alex:chemistry_author','alex:physics_author','alex:json_author')`
OR `owner_cluster = 'peter_parker:runtime_generation' AND bug_class LIKE '%variable%'`, per the
spec's pre-authoring contract — the skeleton's own dispatch flagged that its tool grant carried no
Bash and the live query was NOT run there, so this is the first live run for this concept. 98 rows
returned (88 `alex:json_author`, 10 `alex:chemistry_author` FIXED, 0 `alex:physics_author` FIXED —
all 10 `alex:physics_author` rows are currently `OPEN`, so none bind yet; 1
`peter_parker:runtime_generation` variable-merge row, not applicable to a `field_3d` scenario) —
identical counts to the sibling block's own live run. Every one of the 10 `alex:chemistry_author`
`prevention_rule`s was read and checked against this draft:

| `bug_class` | Applies here? | Resolution |
|---|---|---|
| `gas_box_state4_asserts_unchanged_speed_with_no_instrument` | Checked — no state in this concept asserts a quantity is unchanged without an instrument | S7's "z_eff HUD rises smoothly across all four cuts" (skeleton §3b) has its own instrument (`hud_lines: z_eff`, S7 only); no narration line above claims constancy without a printed number beside it |
| `superposed_orbital_sign_convention_inverts_the_taught_direction` | No — no hybrid/superposition orbitals anywhere in this concept | — |
| `countability_metric_that_ignores_the_back_lobes_under_calls_fusion` | No — `'valence'` resolves to a SINGLE 2p_z member (OS_VALENCE_ORBITAL convention), never a multi-lobe gallery; no fusion states | — |
| `narration_claims_a_net_average_the_visible_transient_contradicts` | Checked — S3's "spherical average" claim | **Satisfied by construction**, same reasoning as the sibling: `orbital:'shell'` draws the sphere AT the spherically-averaged radial-CDF radius the narration names — the instrument IS the average |
| `cue_fired_on_at_ms_lands_before_the_sentence_that_names_it` | Applies to `json_author`, not to this markdown | **Flag to `json_author`:** bind every schedule event (ghost pins, element/charge cuts) to the specific sentence above that names it via `scenario_cue`, never `at_ms` alone — e.g. S1's charge cut binds to "Pulling one electron off an atom costs energy," not to a bare timestamp |
| `narration_speaks_a_between_run_comparison_as_an_in_state_observation` | No — every comparison (S2 Li vs F, S3's eight-element sweep, S5's staircase, S7's four-element model-vs-measured) is within ONE state's own timeline, never across states or viewports | — |
| `instrument_noise_needs_density_not_a_longer_average` | No — every quantity is a deterministic citation or a deterministic geometric computation, no statistical noise | — |
| `real_world_anchor_promises_a_lever_the_sim_does_not_have` | Checked — both numbers the anchor names ARE demonstrated on screen | Unlike the sibling's Li⁺ close call, both quantities the anchor cites are genuinely shown: sodium's 495.8 kJ/mol at S1, neon's 2080.7 kJ/mol at S3 (same `OS_IE` citations, same concept). Not flagged as a close call — the mechanism the anchor names is fully on-screen, just in two different states of the same arc rather than one |
| `the_most_likely_followup_question_was_undemonstrable_at_the_authored_range` | **Checked — a genuine documented limitation** | The most likely follow-up right after S7 ("does the model miss other elements the same way, e.g. period 3?") is NOT reachable in S8/explore: Deviation 4 fixes the explore overlay to `curve:'ie_successive'` (the staircase), not `ie_vs_z`+`model_series` — so the model-vs-measured view exists ONLY inside the guided S7 state and cannot be re-explored on demand. This is an already-declared skeleton constraint (no "curve" control row exists), not something introduced here — **flagged to `quality_auditor`** as a documented, not-fixed limitation |
| `narration_quotes_a_point_value_of_a_noisy_instrument` | No — no noisy instrument anywhere; every quoted number is an exact citation, independently re-verified against `OS_IE` in §0a, not sampled from a fluctuating readout | — |

---

## Self-review checklist

- [x] Every quantity in the skeleton's state narratives (Z, S, Z_eff, r₉₀, n, charge, k, IE_k)
      appears in `variables` with a unit.
- [x] Ledger complete: both ion-formation equations (S1's first ionisation, S5's second) with
      electron + charge balance tables; no redox states, no oxidation numbers, matching DoD-c.
- [x] Every state's motion archetype from the skeleton maps to an existing `orbital_shapes`
      capability (builds 1–6, all landed on master) — nothing here needs an unbuilt surface; the
      oxygen-pairing gap was already resolved by the skeleton's own S7/S8 merge (Deviation 1),
      executed, not redesigned.
- [x] Rule 31 word budgets: every guided state 34–55 EN words (global band 25–55); S8 = 0/open.
- [x] Rule 41 plain English: no idiom, no metaphor, no personification; "the model misses this" and
      "a cause not shown here" describe what is/is not on screen, not what the model wants or knows.
- [x] Notation ladder: no logs/calculus/quantum notation on any formula surface or narration
      sentence; the S7 log-scale AXIS is a display convention, distinguished explicitly from taught
      notation (§4); dual-label applied once (ΔᵢH₁/IE₁, S1); IUPAC-first naming.
- [x] Drill-down phrasings: 30 total (5 × 6 clusters), genuine student voice, no Hinglish, no
      textbook prose.
- [x] Constraints: 6 short factual assertions, conservation-first (electron count, then charge, then
      provenance).
- [x] Numerical sanity check RUN (not eyeballed): Na's S5 staircase traced end-to-end from
      configuration through `osIeDrawCount` through the 9.2× ratio, cross-checked against the
      independently-produced Na⁺ core radius (61.75 pm) both this block and the sibling block derive
      for the identical ion (§0c).
- [x] Engine bug queue queried LIVE (Supabase REST) before finalising — 10 `alex:chemistry_author`
      FIXED rows read in full; zero required a narration fix (unlike the sibling, which caught one);
      one flagged as a genuine documented limitation (S8's fixed explore curve, §8); one flagged to
      `json_author` (cue binding); the anchor was checked and found to need NO close-call flag
      (both cited numbers are genuinely on screen).
- [x] Source check line present: NCERT index + Exemplar belief only; nothing imported.
- [x] `aha_moment` chemistry check: PRIMARY (S5) — chemically true and S5 genuinely demonstrates it
      (9.2013× measured, the staircase fixed and complete before the marker moves). SUPPORTING (S3)
      — chemically true and measured exactly (radius falls, IE rises, one cause). Both
      `misconception_watch` counters (S5's 9× wall; S7's measured dip vs the model's rise) are
      correct chemistry, not persuasive framing — both independently re-derived in §0a, not merely
      re-typed. Assessment answers verified correct by direct computation from `OS_IE` and Slater's
      rules; every distractor logic described is a real wrong belief that produces that wrong
      reasoning.
- [x] No skeleton figure required correction — §0a/§0b report every figure CONFIRMED or newly
      MEASURED, none corrected; contrast recorded explicitly against the sibling's K-radius fix.
- [x] Scratch verification harness deleted after use (Tools-forbidden clause).
