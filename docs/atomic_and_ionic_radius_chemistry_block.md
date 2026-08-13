# CHEMISTRY BLOCK — `atomic_and_ionic_radius`

> **Author:** `chemistry_author` (pipeline position #2) · **Date:** 2026-08-07 · **Desk:**
> `feat/chemistry-periodicity`, synced to `origin/master fed2180`.
> **Upstream:** `docs/atomic_and_ionic_radius_skeleton.md` v3.1 (SEALED at founder-proxy Checkpoint A,
> arc/rings/misconception/anchor/control-table UNCHANGED — executed, not redesigned) +
> `docs/CHEMISTRY_PHASE0_PERIODICITY.md` v4 (§Config contract, §THE MOTION VOCABULARY — binding).
> **Downstream:** `json_author` converts this block + the skeleton into
> `src/data/concepts/chemistry/atomic_and_ionic_radius.json` (Gate 8b: no registration in the 8
> physics sites).
> **Renderer:** `field_3d` · `orbital_shapes` (engine builds 1–6 landed, commits `cde4d10` ·
> `682c53c` · `6f3b20c` · `c42cdbe` · `ea1ca6b` on `origin/master`).

---

## 0. Numeric verification report — READ FIRST

**Method.** Every figure below was obtained one of two ways, both run, neither eyeballed:

1. **Headless engine replica.** A scratch Node harness
   (`src/scripts/scratch_periodicity_verify.js`, deleted after use per the Tools-forbidden clause)
   re-implemented — line-for-line, not approximated — the LIVE functions in
   `src/lib/renderers/field_3d_renderer.ts`: `osR` (exact hydrogenic radial forms), `osBuildTables`
   (the N=3000 grid, iso-density CDF and outer-branch tables), `osRhoOuter`/`osROutPm` (the
   iso-density contour law used by `orbital:'valence'`), `osRhoAt`/`osShellOuterPm` (the radial-CDF
   "shell" law used by `orbital:'shell'` and the `as:'core'` ghost), `osSlaterS` + `OS_SUBSHELLS`
   (Slater's rules, groups (1s)(2s,2p)(3s,3p)(3d)(4s,4p)), and the `OS_IONS` build (Z, S, Z_eff,
   `zEffBy` per occupied subshell, `coreKey`/`coreClosed`) for every element H–Ca × charge −3…+3,
   exactly as `field_3d_renderer.ts` builds it at load. Every radial function's own normalisation
   integral was checked ≥0.999998 before trusting any r₉₀ off it (1s/2s/2p = 1.000000; 3s/3p/3d/4s =
   0.999998–0.999999) — the grid is faithful, not merely plausible.
2. **Independent analytic cross-check.** The K/4s figure (the one correction below) was re-solved a
   second way — direct bisection on the closed-form `R₄₀(ρ)` with no discretised grid at all — and
   agreed with the harness to 5 significant figures (1779.1689 pm vs 1779.170 pm at Z=1), so the
   correction is not a grid artefact.
3. **Textbook cross-check.** The Slater Z_eff series this harness produced for period 2 (Li 1.30 ·
   Be 1.95 · B 2.60 · C 3.25 · N 3.90 · O 4.55 · F 5.20 · Ne 5.85) and the two worked examples the
   skeleton already cites (Na S=8.8→Z_eff=2.2; Cl S=10.9→Z_eff=6.1) are the standard textbook Slater
   results for these elements — an independent check that has nothing to do with this renderer.

**Every pm figure below is the model's own r₉₀ (Slater Z_eff, then the frame-time `1/Z_eff`
hydrogenic similarity) — never a cited/measured covalent or ionic radius. No such table exists or
was imported (Rule 35/DoD-i).**

### 0a. Confirmed exactly (skeleton figure = measured figure, ≤0.2 pm rounding)

| Skeleton figure | Measured | Method | Verdict |
|---|---|---|---|
| S2 ladder 141 / 70.5 / 47.0 pm | 140.76 / 70.38 / 46.92 pm | harness, `osR`(1s) iso-density r₉₀ ÷ Z (S = 0 confirmed exactly for all three, so Z_eff = Z) | CONFIRMED (rounding only) |
| S3 Na: S = 8.8, Z_eff = 2.2 | S = 8.8000, Z_eff = 2.2000 | harness `osSlaterS`, exact | CONFIRMED EXACT |
| S3 core ≈ 61.8 pm | 61.75 pm | harness, `osShellOuterPm` on 2p at Na⁺'s `zEffBy["2,1"]` = 6.85 (radial/shell law) | CONFIRMED |
| S4 endpoints 371.46 → 72.31 pm | 371.46 → 72.31 pm | harness, shell law, Li 2s / Ne 2p_z | CONFIRMED EXACT |
| S6 469.0 → 61.75 pm (7.6×) | 467.58 → 61.75 pm (7.57×) | harness, shell law | CONFIRMED (pm: 0.3% rounding; ratio: exact "7.6×" survives) |
| S6 Cl ≈159.6 → Cl⁻ ≈169.3 pm (+6.1%) | 159.49 → 169.20 pm (+6.09%) | harness, shell law; Z_eff 6.10 → 5.75 confirmed exact | CONFIRMED |
| S7 series 148.42 · 109.87 · 87.22 · 61.75 · 53.89 · 47.80 pm | identical to 2 dp | harness, shell law, all at nE = 10 exactly | CONFIRMED EXACT, strictly monotone |
| S8 Z_eff per shell 18.7 · 14.85 · 7.75 · 2.2 | 18.700 · 14.850 · 7.750 · 2.200 | harness `osSlaterS` on K's own configuration, worked by hand below (§2b) | CONFIRMED EXACT |
| S8 span low end 7.53 pm | 7.53 pm | harness, shell law, K 1s | CONFIRMED EXACT |
| Carbon Z_eff = 3.25 | 3.2500 | harness + textbook cross-check | CONFIRMED EXACT |

### 0b. Corrected (skeleton figure was wrong or a rough hand estimate — use the measured value)

| # | Skeleton said | Measured | Δ | Root cause | Correction |
|---|---|---|---|---|---|
| **1** | **S5 K: 813.5 pm** (also **S8 span high end 813.53 pm**) | **808.71 pm** | −4.8 pm / −0.6% | K's 4s r₉₀ at Z=1 is **1779.17 pm** (independently re-solved by closed-form bisection with no grid at all, and this exact number is already the renderer's own code comment: *"4s 68 (r₉₀ = 1779 pm)"*). 1779.17 ÷ 2.2 = 808.71, not 813.5. The skeleton's 813.5 appears in **two** places (S5's table and S8's span), same root figure both times — a systematic early estimate, not two independent errors | Use **808.71 pm** for K's 4s reading everywhere it appears (S5, S8, S9's reachable maximum). S8's span is **7.53 → 808.71 pm ≈ 107.4×**, not "108×" |
| 2 | S5 Li 371.6 / Na 469.0 pm | Li 371.46 / Na 467.58 pm | ≤1.5 pm / ≤0.3% | Rough hand rounding in an earlier design pass | Use the precise values — this also makes S5's Li figure **identical** to S4's own engine-verified Li endpoint (371.46 pm), as it must be (same species, same orbital, same law) |
| 3 | S3 opening ~94 / relaxed ~469 pm | 93.52 / 467.58 pm | ≤1.4 pm | Design-target tildes, never claimed precise | Use 93.52 / 467.58 pm |
| 4 | S8 intermediate "3s ≈ 133.2 pm" | 132.73 pm | 0.5 pm | Rounding | Use 132.73 pm (2s ≈ 32.5 confirmed to 32.52, no change) |

**On the task's specific question — does S5's law matter?** No, and here is the measurement that
settles it: S5's three species (Li 2s, Na 3s, K 4s) are **all l = 0 spheres**. For an l = 0 orbital
the iso-density contour and the radial-CDF ("shell") r₉₀ coincide to within the grid's own
resolution (Li: 371.34 vs 371.46 pm; Na: 467.58 vs 467.58 pm identically; K: 808.71 vs 808.71 pm
identically) — there is no angular structure for the two laws to disagree about. **`orbital:'valence'`
vs `orbital:'shell'` is a real distinction for S4/S6/S7/S8 (which include p-type species), but it is
numerically moot for S5.** The correction above is not a law-choice fix; it is a precision fix.

**Sanity check run (role-spec self-review, S7 Na⁺):** Z = 11, remove one electron → config
1s² 2s² 2p⁶ (= [Ne], 10 e⁻). Outermost occupied subshell = 2p, same Slater group as 2s. S =
0.35×(2s+2p total 8, minus self = 7) + 0.85×(1s = 2) = 2.45 + 1.70 = **4.15**. Z_eff = 11 − 4.15 =
**6.85**. r₉₀ = (2p shell-law r₉₀ at Z=1, 423.00 pm) ÷ 6.85 = **61.75 pm** — the identical number S3's
core ghost and S6's Phase-A endpoint both independently produce for the same ion. Three states, one
number, one formula: internally consistent by construction, and it plugs in and comes out right.

**Nothing could not be verified.** Every skeleton figure had a call-site-verifiable formula behind it.

---

## 1. Quantities, formulas, computed outputs (`physics_engine_config` reference)

**Note for json_author:** the per-state `orbital_shapes` config keys (`element`, `charge`, `orbital`,
`z_eff`/`z_ramp`, `element_steps`, `charge_steps`, `ghost_species`, `camera_steps`, `mode`) are
already fully specified in the skeleton §3b — this section documents the underlying CHEMISTRY
quantities those keys drive, for the `variables`/`formulas`/`computed_outputs` fields.

```json
"variables": {
  "Z":      { "name": "nuclear charge (atomic number)", "unit": "e", "min": 1, "max": 20, "default": 11 },
  "S":      { "name": "Slater screening constant", "unit": "e", "min": 0, "max": 18.7 },
  "Z_eff":  { "name": "effective nuclear charge", "unit": "e", "derived": "Z - S", "min": 0.15, "max": 19.70 },
  "r90":    { "name": "90%-boundary radius", "unit": "pm", "derived": "r90_Z1(orbital) / Z_eff", "min": 7.53, "max": 808.71 },
  "n":      { "name": "principal quantum number (shell)", "unit": "dimensionless", "min": 1, "max": 4 },
  "charge": { "name": "ion charge", "unit": "e", "min": -3, "max": 3, "default": 0 },
  "nE":     { "name": "electron count", "unit": "dimensionless", "derived": "Z - charge", "min": 1, "max": 22 }
}
```

```json
"formulas": {
  "slater_S": "0.30*(other same-group electrons, 1s ONLY) + 0.35*(other same-group electrons, ns/np) + 0.85*(electrons in shell n-1) + 1.00*(electrons in shell <= n-2)",
  "z_eff": "Z - S",
  "r90_pm": "r90_Z1[orbital] / Z_eff"
}
```

`r90_Z1[orbital]` (the Z=1 reference radius every state divides by — engine build-time constants,
re-derived and confirmed by the harness):

| orbital | law: iso-density (valence) r₉₀, pm | law: shell (radial-CDF) r₉₀, pm |
|---|---|---|
| 1s | 140.76 | 140.82 |
| 2s | 482.75 | 482.89 |
| 2p (lobe tip / shell-avg) | 482.45 | 423.00 |
| 3s | 1028.67 | 1028.67 |
| 3p (lobe tip / shell-avg) | 1092.53 | 972.89 |
| 4s | 1779.17 | 1779.17 |

(1s/2s/3s/4s coincide across both laws exactly, as they must — no angular structure to disagree
about. 2p/3p diverge because the lobe tip is a directional maximum and the shell law is a
spherical average — this is the numeric content behind the skeleton's `(model, spherical average)`
qualifier.)

```json
"computed_outputs": {
  "radius_hud_pm": "r90_pm, printed 'r = <n> pm (90%)' or '... (90%, spherical average)' on an open subshell",
  "z_eff_hud": "Z_eff, printed '(Slater)' only when derived from an element (never on a bare authored z_eff)",
  "electron_count_hud": "nE, printed '<n> e⁻' — '(held)' suffix only at S7",
  "config_hud": "electron configuration string, S8 only (e.g. '1s² 2s² 2p⁶ 3s² 3p⁶')"
}
```

```json
"constraints": [
  "electron count is exactly conserved in every ion-formation equation (Na 11e- -> Na+ 10e- + 1e-; Cl 17e- + 1e- -> Cl- 18e-)",
  "charge balances on both sides of every ion-formation equation (0 = +1 + -1; 0 + -1 = -1)",
  "Z_eff = Z - S at all times; S is never negative and Z_eff never exceeds Z",
  "every S7 isoelectronic species carries exactly 10 electrons; only Z and Z_eff vary across the series",
  "every displayed radius is the model's own r90 (Slater Z_eff + hydrogenic 1/Z similarity), never a cited covalent or ionic radius",
  "ion charge is always an integer in {-3 ... +3}; no fractional charge is ever shown"
]
```

---

## 2. Chemistry ledger

### 2a. Ion-formation equations (S6 formula surface)

**Cation — removal (Phase A):**

```
Na(g)  →  Na⁺(g)  +  e⁻
```

| | electrons | charge |
|---|---|---|
| LHS: Na | 11 | 0 |
| RHS: Na⁺ + e⁻ | 10 + 1 = 11 ✓ | (+1) + (−1) = 0 ✓ |

**Anion — addition (Phase B):**

```
Cl(g)  +  e⁻  →  Cl⁻(g)
```

| | electrons | charge |
|---|---|---|
| LHS: Cl + e⁻ | 17 + 1 = 18 | 0 + (−1) = −1 |
| RHS: Cl⁻ | 18 ✓ | −1 ✓ |

Both balanced on electron count and on charge. No mass changes (same nucleus; these are electron
transfers, not nuclear reactions) — no state symbols beyond `(g)` are taught here (Rule 25: state
symbols beyond gas-phase ions are untaught vocabulary for this concept; DoD-c: no reaction states,
so no oxidation numbers).

### 2b. Slater screening ledger (S8 — static rule + per-shell arithmetic, worked for potassium)

**Static formula surface (S = screening constant felt by an electron in shell n):**

```
S = 0.35 · (other electrons in the SAME Slater group)
  + 0.85 · (electrons in shell n − 1)
  + 1.00 · (electrons in any shell n − 2 or deeper)
```

(1s is the one exception: the same-shell constant is 0.30, not 0.35 — Slater's own stated rule.)

**Worked, shell by shell, for potassium (Z = 19, config 1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹):**

| Shell (gallery step) | Same-group screeners | n−1 screeners | n−2-or-deeper screeners | S | Z_eff = 19 − S | r₉₀ (shell law), pm |
|---|---|---|---|---|---|---|
| 1s | (2−1)×0.30 = 0.30 | — | — | **0.30** | **18.70** | 7.53 |
| 2s≡2p (grp) | (8−1)×0.35 = 2.45 | 1s: 2×0.85 = 1.70 | — | **4.15** | **14.85** | 32.52 |
| 3s≡3p (grp) | (8−1)×0.35 = 2.45 | 2s+2p: 8×0.85 = 6.80 | 1s: 2×1.00 = 2.00 | **11.25** | **7.75** | 132.73 |
| 4s | (1−1)×0.35 = 0.00 | 3s+3p: 8×0.85 = 6.80 | 1s+2s+2p: 10×1.00 = 10.00 | **16.80** | **2.20** | 808.71 |

Electron bookkeeping check: 2 + 8 + 8 + 1 = 19 = Z ✓ at every row (nothing is created or destroyed
by the screening sum — S counts *other* electrons only, never the electron itself).

---

## 3. Per-state narration (`text_en`) — word-budgeted, Rule 41 plain English

*(All within the global 25–55 EN-word band; individual counts noted. Unicode superscripts/formula
symbols throughout per Rule 34c. `Z_eff` kept as the literal ASCII HUD token the renderer actually
prints — an approved fleet baseline, not a Rule-34c gap chemistry_author can fix.)*

**S1 — "The size of one atom" (36 words, 12 anchor):**
> An electron in hydrogen is not on a fixed orbit — measured repeatedly, its cloud has a boundary
> holding nine tenths: the atomic radius. In a phone battery, lithium ions are small enough to slide
> through.

**S2 — "More protons, smaller shell" (47 words):**
> Hydrogen has one electron and one proton. Add a proton with no new electron, and that same
> electron feels a stronger pull: helium plus, then lithium two-plus, written He⁺ and Li²⁺. Nothing
> screens that pull, so each added proton pulls the shell in, and it steps smaller.

**S3 — "Screening by inner electrons" (53 words):**
> Sodium's outer electron does not feel the full pull of eleven protons. Ten inner electrons screen
> most of that pull — the screening (shielding) effect. What remains is the effective nuclear
> charge: Z_eff = Z − S = 11 − 8.8 = 2.2. Screened this weakly, the electron settles far outside the
> core.

**S4 — "Across a period: smaller" (52 words):**
> Across period two, every atom keeps the same outer shell, but each proton added raises the
> effective nuclear charge, pulling the shell in a little more. A marker moves along the trend
> already there, lithium to neon. From boron on, the shell is part filled, so the reading is a
> spherical average.

**S5 — "Down a group: larger" (41 words — revised at the bug-queue pass, see §8):**
> Lithium's outer electron sits in the second shell, sodium's the third, potassium's the fourth.
> Down the group a new shell opens farther from the nucleus at every step — the atom is larger
> again because a whole new shell has appeared.

**S6 — "Making ions: remove or add electrons" (54 words):**
> Removing sodium's one outer electron empties its whole third shell: Na → Na⁺ + e⁻. The ionic
> radius shrinks sharply — a big shrink. Adding an electron to chlorine only adds one same-shell
> neighbour: Cl + e⁻ → Cl⁻. A same-shell electron screens weakly, so the ion grows only a little:
> remove big, add small.

**S7 — "Same electron count, smaller ions" (54 words):**
> Nitride, oxide, fluoride, sodium, magnesium and aluminium ions are isoelectronic species: each
> holds exactly ten electrons, held fixed on screen. The nuclear charge alone rises, seven protons
> to thirteen. As it climbs, the ten electrons are pulled in tighter and the radius falls each step:
> size follows the pull per electron, not the count.

**S8 — "Where S comes from: inner shells" (51 words):**
> Potassium's nineteen electrons fill four shells. Slater's rule counts each electron's screening:
> 0.35 from a same-group neighbour, 0.85 from the shell just inside, 1.00 from every shell deeper.
> Shell by shell this gives effective nuclear charges 18.7, 14.85, 7.75 and 2.2: the innermost
> electron barely screened, the outermost almost fully screened.

**S9 — Explore:** 0 words / open (Rule 31 explore-last; `interaction_complete`).

---

## 4. Notation + dialect ladder (Rule 38c/38d)

- **No logarithms, no calculus, no quantum notation anywhere in this concept** — every core/extended
  state uses arithmetic and ratio forms only (`Z_eff = Z − S`, `r₉₀ = r₉₀(Z=1)/Z_eff`). There is no
  advanced ring to escalate into (skeleton DoD-i-1: S8 sits immediately before S9). Nothing to flag.
- **Dual-labelled once, at first appearance (S3):** "the screening (shielding) effect" — CBSE/NCERT
  says screening effect; other boards (A-level, IB) commonly say shielding effect. Bare "screening"
  after S3.
- **IUPAC-first naming:** "sodium," "chlorine," "aluminium" (IUPAC spelling, not "aluminum") used
  throughout; no common-name aliasing needed (these are already the primary names on every board).
- **"battery," never "cell"** (fleet dialect convention, Rule 38d) — already the anchor's word choice.
- **NCERT §3.7.1(a)(b) vocabulary used verbatim as TERMS (never as copied prose):** atomic radius,
  ionic radius, isoelectronic species, effective nuclear charge, screening effect / shielding
  effect — every one of these appears in the narration above at its first-taught state, matching
  what a CBSE/JEE student's textbook and exam already call it.

---

## 5. Drill-down cluster phrasings (5 per cluster, real student voice)

### S3 — `slater_screening_walkthrough`
1. "how do you know its 0.35 and not something else"
2. "do you count the electron itself when you add up S"
3. "why is 1s different, its 0.30 not 0.35 right"
4. "can you walk me through the sodium number again, i keep getting a different S"
5. "whats the difference between screening from the same shell and screening from a shell inside"

### S3 — `why_inner_electrons_screen`
1. "why does an inner electron block the pull but one in the same shell almost doesnt"
2. "if theyre all just electrons why does distance from the nucleus matter for screening"
3. "so is it about being between the nucleus and the outer electron"
4. "why doesnt every electron cancel out the same amount of charge"
5. "whats actually different about a 2s electron screening a 3s electron vs another 3s electron screening it"

### S3 — `zeff_vs_z_confusion`
1. "isnt sodium just pulling with all 11 protons"
2. "why do we say Z_eff and not just Z when comparing sizes"
3. "i thought more protons always means smaller, why isnt it just Z"
4. "so the number on the periodic table isnt the real pull the electron feels"
5. "why is Z_eff so much smaller than Z for sodium but not for lithium"

### S7 — `isoelectronic_ranking`
1. "how do i know which isoelectronic ion is biggest without a table"
2. "do i just look at which one has the most protons"
3. "is N3- bigger than O2- because it has fewer protons"
4. "wait these all have 10 electrons but different sizes, how"
5. "whats the trick for ranking an isoelectronic series on the exam"

### S7 — `electron_count_vs_pull`
1. "so more electrons doesnt always mean bigger"
2. "then why did adding an electron make the ion bigger in the last state"
3. "isnt more electrons more repulsion so it should be bigger"
4. "im confused, the last state said adding electrons grows it but now its not about electron count"
5. "so what actually decides the size if not how many electrons there are"

### S7 — `ionic_vs_atomic_radius_mixups`
1. "am i comparing Na to Na+ or to Ne"
2. "is Na+ smaller because its like neon now"
3. "why cant i compare Na+ directly to Mg2+ atom size"
4. "which neutral atom do i compare Cl- back to"
5. "does the ion count as the element it looks like or the element it came from"

---

## 6. Chemical-validity constraint callouts — what a state must never show

1. **Never a mid-transition atom.** `element_steps`/`charge_steps` are cuts — no state may render an
   in-between species (e.g. "Na⁰·⁵⁺") during a swap; legibility comes from the held ghost, never an
   eased contraction (§THE MOTION VOCABULARY).
2. **Never an un-pinned electron count at S7.** The `electron_count` HUD must read exactly `10 e⁻
   (held)` at all six cuts — a drifting or re-computed count would silently re-teach the misconception
   the state exists to break.
3. **Never a stale ghost.** S6's Na ghost must clear (`clear:true`) at the same `at_ms` as the
   Na→Cl swap — an outlived 469 pm sodium outline around a ~160 pm chlorine cloud is a defect the
   renderer has already been fixed to avoid; no future edit may reintroduce it.
4. **Never a "(measured)" stamp on a model number.** Every r₉₀ on canvas or in narration is
   `(model)`/`(Slater)` provenance only — no covalent/ionic radius table exists in this concept, so
   nothing may imply one does.
5. **Never more than one glow focal at once**, and **never a focal on S3** (the ghost core shares
   `elementType:"os_surface"` with the live cloud — a `surface` focal would light both).
6. **Never a fractional or non-integer ion charge**, and never a species outside H…Ca with charge
   outside −3…+3 (the closed enum this scenario's whole `OS_IONS` table is built from).
7. **Never let the "spherical average" qualifier appear silently.** Its first appearance (S4,
   boron) must carry the one-clause gloss ("shell is part filled, so the reading is a spherical
   average") — every later appearance (S6 Phase B's Cl⁻, S9 drags) inherits that gloss without
   repeating it.

---

## 7. Assessment items (DoD-f, full stems + answers)

**1. Isoelectronic ranking (→ S7).**
*Stem:* N³⁻, O²⁻, F⁻, Na⁺, Mg²⁺ and Al³⁺ all have exactly 10 electrons. Arrange them in decreasing
order of ionic radius and explain why the order is not random.
*Answer:* N³⁻ > O²⁻ > F⁻ > Na⁺ > Mg²⁺ > Al³⁺. All six have the same electron count, so the same
Slater screening (S = 4.15) applies to all; only the nuclear charge differs (Z = 7 → 13). The ion
with the smallest Z (nitride) has the smallest Z_eff and is pulled in the least, so it is largest;
each added proton pulls the same 10 electrons in a little further. *Distractor logic:* a student
reasoning from electron count alone has no basis to order these at all, since electron count is
identical throughout — the ranking can only come from Z.

**2. Why Na > Mg (→ S4).**
*Stem:* Sodium and magnesium are both period-3 elements. Explain why the atomic radius of Na is
larger than Mg.
*Answer:* Both fill only up to the n = 3 shell, but Mg has one more proton and one more 3s electron
than Na. That extra 3s electron only screens the other 0.35 (same Slater group), while the extra
proton adds a full +1 to Z, so Z_eff rises from 2.2 (Na) to 2.85 (Mg): the same shell is pulled in
tighter, making Mg smaller.

**3. Why K > Na (→ S5).**
*Stem:* Explain why potassium has a larger atomic radius than sodium, even though their effective
nuclear charges are almost identical (both Z_eff ≈ 2.2).
*Answer:* Na's outermost electron occupies the third shell (3s); K's occupies the fourth (4s) — a
new shell has opened, farther from the nucleus. Since Z_eff barely changes between them, the entire
size increase comes from the new shell opening, not from any change in the net pull per electron.

**4. Na⁺ ≪ Na, Cl⁻ only somewhat larger than Cl (→ S6).**
*Stem:* Na⁺ is much smaller than the neutral Na atom, but Cl⁻ is only a little larger than the
neutral Cl atom. Explain the difference using the screening picture.
*Answer:* Removing Na's single 3s electron empties the entire outermost shell, dropping the radius
to the [Ne] core underneath — a whole shell disappears, so the radius collapses sharply (469 →
61.75 pm). Adding an electron to Cl instead adds one more electron to the shell that is already
there (3p); a same-shell electron screens weakly (0.35), so Z_eff falls only a little (6.10 → 5.75)
and the ion grows only a little (159.5 → 169.2 pm, +6%). Removing a whole shell shrinks a lot;
adding one electron to an existing shell grows only a little.

**5. Compute Z_eff (→ S3/S8).**
*Stem:* Using Slater's rules, calculate the effective nuclear charge felt by a 3s electron in a
magnesium atom (Z = 12, configuration 1s² 2s² 2p⁶ 3s²).
*Answer:* Same-group screening: the only other 3s/3p electron is 1 × 0.35 = 0.35. Shell n−1 (n = 2:
2s²2p⁶ = 8 electrons) × 0.85 = 6.80. Deeper shell (n = 1: 2 electrons) × 1.00 = 2.00. S = 0.35 +
6.80 + 2.00 = 9.15. Z_eff = 12 − 9.15 = **2.85**.

---

## Source check (chemistry form)

*Consulted NCERT Chemistry Ch.3 §3.7.1(a)(b) index for scope and vocabulary (atomic radius, ionic
radius, isoelectronic species, effective nuclear charge, screening/shielding effect) — terms only.
NCERT Exemplar consulted for the S7 misconception belief only ("more electrons means a bigger
atom"). No teaching method, no example problem, no figure imported from either source. Every worked
example (Na, Cl, K, Mg) was derived from Slater's rules directly, not copied from a textbook
worked example. Real-world anchor (lithium-ion battery, S1) is universal — no country-specific
content anywhere in this block.*

---

## 8. Engine bug-queue consultation (run live, before finalising this block)

Queried `engine_bug_queue` live (Supabase REST, `dxwpkjfypzxrzgbevfnx`) for
`status = 'FIXED' AND owner_cluster IN ('alex:chemistry_author','alex:physics_author','alex:json_author')`
OR `owner_cluster = 'peter_parker:runtime_generation' AND bug_class LIKE '%variable%'`, per the spec's
pre-authoring contract. 98 rows returned (88 `alex:json_author`, 10 `alex:chemistry_author`, 0
`alex:physics_author` FIXED — all `alex:physics_author` rows are currently `OPEN`, so none bind yet;
1 `peter_parker:runtime_generation` variable-merge row, not applicable to a `field_3d` scenario).
Every one of the 10 `alex:chemistry_author` `prevention_rule`s was read and checked against this
draft:

| `bug_class` | Applies here? | Resolution |
|---|---|---|
| `gas_box_state4_asserts_unchanged_speed_with_no_instrument` | **YES — caught a real defect** | S5's original draft narrated "the effective nuclear charge barely changes" between Na and K, but S5's own engine config (skeleton §3b) authors `hud_lines:['element','radius']` — **no `z_eff` line**. That claim had no on-screen correlate and was struck (§3, S5, revised). The state now claims only what the shell/element HUD directly shows: a new shell opening, larger each step |
| `superposed_orbital_sign_convention_inverts_the_taught_direction` | No — no hybrid/superposition orbitals in this concept | — |
| `countability_metric_that_ignores_the_back_lobes_under_calls_fusion` | No — no multi-lobe fusion states (S3 explicitly binds no glow focal for the analogous reason, already in the skeleton) | — |
| `narration_claims_a_net_average_the_visible_transient_contradicts` | Checked — S4's "spherical average" claim | **Satisfied by construction**: `orbital:'shell'` (build 6) draws the sphere AT the same spherically-averaged radial-CDF radius the narration names — the instrument IS the average, not a transient it contradicts |
| `cue_fired_on_at_ms_lands_before_the_sentence_that_names_it` | Applies to json_author, not to this markdown | **Flag to json_author:** bind every schedule event (ghost pins, `z_ramp` start, element/charge cuts, `camera_steps`) to the specific SENTENCE above that names it via `scenario_cue`, never `at_ms` alone — e.g. S3's ghost-appears beat binds to "Ten inner electrons screen most of that pull," not to a bare timestamp |
| `narration_speaks_a_between_run_comparison_as_an_in_state_observation` | No — every comparison (S6 Phase A/B, S7's six cuts) is within ONE state's own timeline/composition, never across states or viewports | — |
| `instrument_noise_needs_density_not_a_longer_average` | No — every quantity here is a deterministic geometric computation, no statistical noise | — |
| `real_world_anchor_promises_a_lever_the_sim_does_not_have` | Checked — a close call, documented, not fixed (sealed anchor) | The anchor names Li⁺ specifically, but this concept never renders Li⁺ as its own species: S2 shows Li²⁺, S5 shows neutral Li — no state shows the singly-charged battery ion. The anchor's underlying MECHANISM (small radius ⇒ small ion) is demonstrable on-screen via the same Z_eff/screening machinery the whole concept teaches on other species, and the anchor was already cleared at Checkpoint A as "causally defensible... survives depth." **Flagged for `quality_auditor`'s Rule 35 anchor probe as a documented close call** — not redesigned here (sealed skeleton, two-cycle cap) |
| `the_most_likely_followup_question_was_undemonstrable_at_the_authored_range` | No new gap — the two likely follow-ups (S3: "what if nothing screened it at all?" and S7/S9: "what about an 18-electron series?") are both already reachable (S3's `zeff` dial explicitly reaches 11 per the v3.1 withdrawal; S9's `element`/`charge` dials are ALL, so a teacher can build Ca²⁺ or any other series by hand) | — |
| `narration_quotes_a_point_value_of_a_noisy_instrument` | No — no noisy instrument in this concept; every quoted number was independently confirmed to match the exact HUD-computing functions (§0), and S5/S6 Phase B already prefer ratios/direction over absolute magnitude per Ruling 3 | — |

---

## Self-review checklist

- [x] Every quantity in the skeleton's state narratives (Z, S, Z_eff, r₉₀, n, charge, nE) appears in
      `variables` with a unit.
- [x] Ledger complete: S6 ion-formation equations with electron + charge balance; S8 Slater ledger
      with K's arithmetic worked per shell, electron count checked against Z.
- [x] Every state's motion archetype from the skeleton maps to an existing `orbital_shapes` capability
      (builds 1–6, all landed on master) — nothing here needs an unbuilt surface.
- [x] Rule 31 word budgets: every guided state 36–54 EN words (global band 25–55); S9 = 0/open.
- [x] Rule 41 plain English: no idiom, no metaphor, no personification beyond the project's own
      established physics-teaching register ("feels," "screens" — used identically in the skeleton
      itself and standard chemistry usage).
- [x] Notation ladder: no logs/calculus/quantum notation anywhere (none needed below or at the
      extended ring); dual-label applied once (screening/shielding, S3); IUPAC-first naming.
- [x] Drill-down phrasings: 30 total (5 × 6 clusters), genuine student voice, no Hinglish, no
      textbook prose.
- [x] Constraints: 6 short factual assertions, conservation-first (electron count, then charge).
- [x] Numerical sanity check RUN (not eyeballed): S7 Na⁺ traced end-to-end from configuration through
      Slater S through Z_eff through r₉₀, matching S3's and S6's independently-produced figure for
      the same ion (61.75 pm, three ways, one number).
- [x] Engine bug queue queried LIVE (Supabase REST) before finalising — 10 `alex:chemistry_author`
      FIXED rows read in full; one caught a real defect (S5's narration, fixed); one documented as a
      close call for quality_auditor (the anchor); one flagged to json_author (cue binding). See §8.
- [x] Source check line present: NCERT index + Exemplar belief only; nothing imported.
- [x] `aha_moment` chemistry check: PRIMARY (S7) — chemically true and S7 genuinely demonstrates it
      (measured, strictly monotone, nE pinned at exactly 10 every cut). SUPPORTING (S3) — chemically
      true and measured exactly. `misconception_watch` counter at S7 is correct chemistry (electron
      count held, radius still falls — not persuasive framing, the literal measured fact).
      Assessment answers verified correct by direct Slater computation; every distractor logic
      described is a real wrong belief that produces that wrong reasoning.
