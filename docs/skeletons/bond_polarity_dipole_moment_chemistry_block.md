# CHEMISTRY BLOCK — bond_polarity_dipole_moment
Authored by `chemistry_author` · 2026-08-01 · branch `feat/chemistry-polarity-hbonding` · Desk 1,
concept 1 of 2. Companion to `docs/skeletons/bond_polarity_dipole_moment_skeleton.md` (Checkpoint A
cycle 1, `DESIGN_FIX`, applied). The 8-state arc, rings, archetypes and delta cues are UNCHANGED —
this block ratifies the three flagged data gaps (R1/R2/R3), fills in the per-state timeline exactly,
writes shipping narration, and supplies the remaining authoring artifacts. Renderer:
`field_3d_renderer.ts`, `scenario_type: "bonding_scene"`. Numbers below trace to a direct read of
`field_3d_renderer.ts` (line refs given inline) or to CRC gas-phase dipole data (cited).

**Engine bug queue consulted (per role spec) before authoring.** Live query run against
`engine_bug_queue` (`query_engine_bug_queue.ts`, `.env.local` copied read-only from the sibling
worktree for this session — never committed, `.env*` is gitignored):
`bond_polarity_dipole_moment` (no rows), `--owner alex:physics_author --open` (9 rows),
`--owner alex:json_author --open` (19 rows). Rows load-bearing on this build:
- `narration_references_a_prerequisite_concepts_apparatus_that_is_not_on_screen` — S4's VSEPR clause
  and S5's "shape from the shapes lesson" clause reference the IDEA from `vsepr_molecular_shapes`,
  never an apparatus/fixture from it. Compliant as authored in the skeleton; carried forward unchanged.
- `teach_show_quantity_live_when_named` / `teach_reveal_synced_to_narration` — every cue time in §3
  below was retimed from the skeleton's placeholder values to the actual per-sentence speech timing
  of the FINAL narration text (2.8 words/sec, the fleet constant used by `narration_outruns_choreography`'s
  own probe), not left at round numbers. Full working in §3.
- `narration_outruns_choreography` (MAJOR, owner alex:json_author, "choreography settles long before
  narration ends") — checked explicitly for all 7 guided states against the probe's own formula
  (`FAIL if choreo_end_ms < 0.7 * est_speech_ms`). Six states retimed to clear it; S4 does not clear
  it and the reason is structural, not an authoring miss — flagged in §3 and in the report below.
- `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` — the NLB-specific
  probe doesn't bind `bonding_scene`, but its PRINCIPLE (a magnitude near the arrow-length floor
  renders as an invisible stub and destroys a length-ratio comparison) is exactly E1c-4's concern
  for this concept (HI/N-F/C-H sit under the ~0.52 D floor as shipped). R1 and R2 both happen to move
  values UP, which independently helps E1c-4 — noted in the report.
- `state_duration_field_overpadded_vs_reveal` — every state's declared `dur` checked against
  `content_ms = max(reveal_end_ms, est_speech_ms)`; all seven land under the 1.5x ceiling (§3 table).
- No open row targets `bonding_scene` or a chemistry concept specifically; the above are the
  subject-neutral field_3d rows that bind.

**Source check line:** Consulted the NCERT Chemistry Class 11 Ch.4 §4.4 chapter index to confirm
scope. Consulted NCERT Exemplar Ch.4 for the three misconception beliefs only (§4 of the skeleton).
No teaching method, no worked example, no figure imported. All narration/anchors are first-principles.

---

## R1 — the four-vector model for S7 (calibration shown)

**Problem, restated with the numbers.** As shipped (`field_3d_renderer.ts:48521,48538`):
`BS_BOND_MOMENT_D["N|H"] = -1.31`, `["N|F"] = 0.17`, `BS_LONE_PAIR_D.N = 0`. `bscDipole` (`:48641`)
sums `m * dir` over the three bonds plus `lp * dir` over the lone-pair direction(s), where `dir` is
central→ligand and `m`'s sign follows "positive = central atom δ+" (`:48512`). Forward-computing with
the shipped numbers and the given axial cosines (NH₃ 107° → 0.3722, NF₃ 102.3° → 0.4374, both from
`mgSqueeze`'s closed form `cosθ = 1.5cos²β − 0.5` at `:47487-47501`, verified: NH₃
`cos107°=-0.29237 → β=acos(√((−0.29237+0.5)/1.5))=acos(√0.13842)=acos(0.37205)` ✓ matches 0.3722):

- NH₃: bond term alone = `3 × 1.31 × 0.3722 = 1.4628 D` (lp=0) → engine prints **1.462 D** ✓
- NF₃: bond term alone = `3 × 0.17 × 0.4374 = 0.2231 D` (lp=0) → engine prints **0.223 D** ✓

Both totals are individually fine (they match the literature NH₃ 1.47 / NF₃ 0.23 the concept
narrates). The defect is what each ARROW shows: `|N|H| = 1.31 D` is drawn far longer than
`|N|F| = 0.17 D`, even though `Δχ(N,F) = 0.94 > Δχ(N,F) = 0.84`(N,H) — the higher-Δχ bond draws the
shorter arrow, contradicting S2's core rule.

**The fix.** Split each total into an intrinsic bond term (drawn as the arrow, scales with Δχ) plus a
real lone-pair term `L = BS_LONE_PAIR_D.N` (drawn as its own vector under E1c-2). Both totals must
still land on 1.47/0.23, and `|b(N–F)| > |b(N–H)|` must hold. Two equations, three unknowns — the
third constraint is a single linear "intrinsic bond moment ∝ Δχ" proportionality (the same physical
assumption the engine's own `BS_MU_FALLBACK_D_PER_CHI = 1.0 D` fallback (`:48543`) already uses
fleet-wide for untabulated pairs — this reuses that convention rather than inventing a new one), which
also matches the standard textbook account (NH₃: bond resultant and lone pair point the SAME way and
add; NF₃: the more polar N–F bonds point the OPPOSITE way to the lone pair and the bond term wins,
leaving a small net pointing along the bond direction):

```
b(N-H) = k·Δχ(N,H) = k·0.84        b(N-F) = k·Δχ(N,F) = k·0.94
NH3:  3·b(N-H)·0.3722 + L = 1.462   →  0.93794·k + L = 1.462
NF3:  3·b(N-F)·0.4374 − L = 0.223   →  1.23347·k − L = 0.223
Add:  2.17141·k = 1.685  →  k = 0.7759
      b(N-H) = 0.652 D,  b(N-F) = 0.729 D,  L = 0.734 D
```

Rounding to the table's own 2-decimal convention (`-1.31`, `0.17`, `1.82` …) and forward-checking —
`b(N-H)=0.66`, `b(N-F)=0.73`, `L=0.73` reproduces the target closer than the raw solve:

```
NH3 = 3 × 0.66 × 0.3722 + 0.73 = 0.73696 + 0.73 = 1.46696 D  → 1.47 D  ✓
NF3 = |3 × 0.73 × 0.4374 − 0.73| = |0.95791 − 0.73| = 0.22791 D → 0.23 D  ✓
```

**RATIFIED:**

```
BS_BOND_MOMENT_D["N|H"] = -0.66   (was -1.31; sign unchanged — N stays δ−, central-atom convention)
BS_BOND_MOMENT_D["N|F"] =  0.73   (was  0.17; sign unchanged — N stays δ+)
BS_LONE_PAIR_D.N        =  0.73   (was  0.00)
```

Check: `|N|F| 0.73 > |N|H| 0.66` — S2's core rule ("bigger Δχ ⇒ longer arrow") now holds for the pair
S7 draws. `b/Δχ`: 0.66/0.84 = 0.786, 0.73/0.94 = 0.777 — within 1.2% of each other, consistent with
the single-`k` assumption used to derive them (this is a sanity check on the solve, not an additional
claim). Both totals round to the literature values the narration quotes (1.47 D, 0.23 D).

**Convention decision.** N is the SOLE exception to the fitted/absorbed convention; the rest of
`BS_BOND_MOMENT_D` (O, S, Se, Te, C, B, Be, P, every H|X row) stays fitted, `BS_LONE_PAIR_D` stays 0
for those centrals. Reason: this concept only draws a lone-pair vector at N (S7, under E1c-2) — no
other central atom in the concept's ligand set (O in H₂O, C in CO₂/CCl₄/CHCl₃, H in the HX row) ever
has its lone pair drawn or narrated, so converting them would be pure unforced rework with a real
downstream cost: O's fitted `-1.51` is what produces H₂O's `1.849 D` output that **S4's PRIMARY aha
and `hydrogen_bonding`'s donor/acceptor charge table both depend on** — an R1 fix scoped to S7 must
not perturb either. Code comment for the surgeon (E1c-7):

```javascript
// RATIFIED 2026-08-01 (chemistry_author, bond_polarity_dipole_moment R1): N is the SOLE
// EXCEPTION to the fitted/absorbed convention above. Every other central atom's bond moment
// (O, S, Se, Te, C, B, Be, P, every H|X row) stays FITTED -- the published value already
// absorbs any lone-pair contribution, BS_LONE_PAIR_D stays 0 for those centrals, and nothing
// downstream of them (H2O's 1.849 D output that bond_polarity_dipole_moment S4 and
// hydrogen_bonding's bscCharges/bscIonicFraction donor-acceptor table both depend on) is
// touched by this ratification.
// N moves to the INTRINSIC + EXPLICIT-LONE-PAIR convention because bond_polarity_dipole_moment
// S7 draws the lone-pair vector on screen (E1c-2) and teaches "direction decides" as a real
// four-vector composition -- under the fitted convention (lp=0) the NH3->NF3 drop came
// entirely from bond-moment MAGNITUDE (N|H -1.31 >> N|F 0.17), putting the higher-Delta-chi
// bond (N-F) on the SHORTER arrow, contradicting S2's "bigger Delta-chi = longer arrow" rule.
// Calibration (chemistry_author, full working in the R1 report): intrinsic b(N-H)=0.66 D,
// b(N-F)=0.73 D (|N-F| > |N-H| matches Delta-chi 0.94 > 0.84); L = BS_LONE_PAIR_D.N = 0.73 D.
// Forward check vs mgSqueeze axial cos (NH3 107deg -> 0.3722, NF3 102.3deg -> 0.4374):
//   NH3 = 3*0.66*0.3722 + 0.73 = 1.467 D -> narrate/HUD "1.47 D"
//   NF3 = |3*0.73*0.4374 - 0.73| = 0.228 D -> narrate/HUD "0.23 D"
// Both reproduce the shipped 1.462/0.223 totals this replaces, within literature tolerance.
// Do NOT extend this convention to any other central atom without a matching on-screen
// lone-pair-vector need -- it is a local exception, not a table-wide migration.
var BS_BOND_MOMENT_D = {
    ...
    "N|H": -0.66, "N|F": 0.73,
    ...
};
var BS_LONE_PAIR_D = { N: 0.73, O: 0, S: 0, Se: 0, Te: 0, P: 0, Cl: 0, F: 0 };
```

---

## R2 — the hydrogen-halide row (up, to CRC)

Engine as shipped: `H|F 1.82 · H|Cl 1.08 · H|Br 0.78 · H|I 0.38`. CRC Handbook of Chemistry and
Physics gas-phase molecular dipole moments (microwave-determined, the standard modern reference set):
**HF 1.826 · HCl 1.109 · HBr 0.827 · HI 0.448 D.** Rounded to the table's 2-decimal convention:

```
BS_BOND_MOMENT_D["H|F"]  = 1.83   (was 1.82)
BS_BOND_MOMENT_D["H|Cl"] = 1.11   (was 1.08)
BS_BOND_MOMENT_D["H|Br"] = 0.83   (was 0.78)
BS_BOND_MOMENT_D["H|I"]  = 0.45   (was 0.38)
```

Direction is up per the skeleton's own diagnosis (F2): the skeleton's narration was ALREADY drafted
against these values (S2's draft quoted "1.83 debye" for HF and "0.45" for the swap target — both
land EXACTLY on the ratified numbers with no further narration edit needed), and the pre-existing
16%-off HI gap (0.38 vs 0.448) is the σ/π two-instrument scar verbatim: a spoken number and an
on-screen instrument reading different values for the same quantity.

**Blast-radius check, verified (not trusted on report).** `hydrogen_bonding`'s link-formation logic
(donor/acceptor charges, `links.delta_min` thresholds) reads `bscCharges()` (`:48610`), which computes
per-atom partial charge from `bscIonicFraction(|Δχ|)` (`:48607`) — a function of electronegativity
DIFFERENCE only, with no reference to `BS_BOND_MOMENT_D` anywhere in its body. The ONLY consumer of
`BS_BOND_MOMENT_D` is `bscDipole()` (`:48641`, arrow length + `mu` HUD line), called at `:49315`.
Confirmed by grep: `bscCharges(` appears at `:48754`, `:49318`, `:49402` — none inside `bscDipole`,
and `bscDipole(` calls `bscBondMoment()`, never `bscIonicFraction`. So R2 changes NOTHING about
hydrogen-bond formation/donor-acceptor thresholds anywhere in the wave; the only effect outside this
concept is that if `hydrogen_bonding` ever draws an HF/HCl/HBr/HI bond-dipole arrow (not currently
planned — that concept's job is the H···X approach geometry, not bond-dipole magnitude), it would
inherit the more accurate CRC number, which is a strict improvement, not a regression.

---

## R3 — `Cl: 0.74` on CCl₄ as well as CHCl₃ (confirmed exact, not approximate)

`MG_MOLECULES.CHCl3.bond_moments = { Cl: 0.74 }` already exists as an authored override hook
(`:48530`); ratifying it on **CCl₄ too** (`MG_MOLECULES.CCl4.bond_moments = { Cl: 0.74 }`) is the
fix for F4. Both claims check out exactly, by construction, not approximately:

**CCl₄ stays exactly zero.** `bscDipole` applies the override VALUE identically to every ligand named
`Cl` (`bscBondMoment`'s `molOverride[ligand]` lookup, `:48627`, keys on ligand name only, not bond
index). CCl₄ has four identical Cl ligands at ideal tetrahedral vertices, whose four unit direction
vectors sum to the zero vector by construction (`mgIdealDirs`, symmetric solid). Total = `0.74 × (d₁+d₂+d₃+d₄) = 0.74 × 0 = 0`
— exact, independent of which scalar is used, as long as it is the SAME scalar on all four bonds
(matches the contract's own "< 1.2e-15 D" empirical floor for every symmetric species).

**CHCl₃ lands on exactly 1.04 D, and this is WHY 0.74 was chosen.** `CHCl3.ligands = ["H","Cl","Cl","Cl"]`
(`:47409`), so three bonds carry the override (0.74) and one (H, index 0) carries the unmodified
table value `C|H = -0.30`. Since the four IDEAL directions still sum to zero (`d₁+d₂+d₃+d₄=0`, the
molecule's angle is authored at the same 109.5° as CCl₄ — `:47408-47409`), `d₁+d₂+d₃ = -d₄` (d₄ =
the H direction). Total = `0.74·(d₁+d₂+d₃) + (−0.30)·d₄ = 0.74·(−d₄) − 0.30·d₄ = −(0.74+0.30)·d₄ = −1.04·d₄`
— magnitude **exactly 1.04 D**, matching the literature target with no rounding slop, because
`0.74 + 0.30 = 1.04` is the arithmetic identity the override value was chosen to satisfy.

**Δχ ordering against C–H holds.** `Δχ(C,Cl) = |3.16 − 2.55| = 0.61`, `Δχ(C,H) = |2.20 − 2.55| = 0.35`
(`BS_CHI`, `:48487-48491`) — C–Cl is the more polar bond, and with the override its arrow (`0.74`)
is also the longer one (`0.30`), so "bigger Δχ ⇒ longer arrow" holds through the swap, and S6's own
claim ("three arrows keep their directions; the fourth is different") is literally true: three
identical `0.74` arrows are UNCHANGED by authoring the CCl₄ override (S5's home pose and S6's opening
pose are pixel-identical, Rule 32d), and the swap changes exactly the one bond that becomes different.

---

## 1. Quantity declarations (`physics_engine_config.variables`)

**A departure worth stating up front:** `bonding_scene` is NOT `parametric_renderer`/PCPL. It does
not read `PM_interpolate` formula strings — `μ` and `Δχ` are computed natively inside the renderer
(`bscDipole`/`bscChi`/`bscIonicFraction`) from the tables ratified above. The `formulas` block below
is therefore REFERENCE documentation for json_author/quality_auditor (what the HUD numbers mean and
where they come from), not runtime expression strings the way a PCPL concept's would be. There is
nothing to wrap in `radians()` — no angle enters a trig expression json_author authors directly.

```json
{
  "variables": {
    "chi_H":  { "name": "electronegativity of hydrogen",  "unit": "Pauling scale (dimensionless)", "constant": 2.20 },
    "chi_C":  { "name": "electronegativity of carbon",    "unit": "Pauling scale (dimensionless)", "constant": 2.55 },
    "chi_N":  { "name": "electronegativity of nitrogen",  "unit": "Pauling scale (dimensionless)", "constant": 3.04 },
    "chi_O":  { "name": "electronegativity of oxygen",    "unit": "Pauling scale (dimensionless)", "constant": 3.44 },
    "chi_F":  { "name": "electronegativity of fluorine",  "unit": "Pauling scale (dimensionless)", "constant": 3.98 },
    "chi_Cl": { "name": "electronegativity of chlorine",  "unit": "Pauling scale (dimensionless)", "constant": 3.16 },
    "chi_Br": { "name": "electronegativity of bromine",   "unit": "Pauling scale (dimensionless)", "constant": 2.96 },
    "chi_I":  { "name": "electronegativity of iodine",    "unit": "Pauling scale (dimensionless)", "constant": 2.66 },
    "delta_chi": {
      "name": "electronegativity difference between the two bonded atoms",
      "unit": "Pauling scale (dimensionless)", "min": 0, "max": 2.0,
      "derived": "abs(chi_A - chi_B)", "role": "read_only_hud"
    },
    "bond_moment_intrinsic": {
      "name": "intrinsic (per-bond) dipole moment, table-ratified above",
      "unit": "D (debye)", "min": 0, "max": 1.90,
      "note": "reads BS_BOND_MOMENT_D[central|ligand]; the arrow the canvas draws IS this value (Rule 29 — one instrument)",
      "role": "engine_constant"
    },
    "lone_pair_moment_N": { "name": "nitrogen lone-pair dipole moment (R1)", "unit": "D (debye)", "constant": 0.73, "role": "engine_constant" },
    "mu": {
      "name": "molecular dipole moment (resultant)",
      "unit": "D (debye)", "min": 0, "max": 2.0,
      "derived": "vector sum of every bond dipole plus (N only) the lone-pair dipole, computed by bscDipole — read-only, not authorable per state",
      "role": "computed_output"
    },
    "bond_angle": {
      "name": "the bonded angle at the central atom",
      "unit": "degrees", "min": 90, "max": 180, "default": 104.5, "step": 0.5,
      "role": "taught_variable", "note": "live only on S4 (H2O family, default 104.5 = water's equilibrium) and S8 (all core molecules); inert on every other state (angle_deg is a static per-state override, not a control, elsewhere)"
    },
    "ligand": {
      "name": "the halogen swapped into the HX / NX3 slot",
      "unit": "categorical", "options": ["F", "Cl", "Br", "I"], "default_S2": "F",
      "role": "taught_variable", "note": "live on S2 (4-rung ladder, joined to the scripted HF->HI swap, drag-seize) and S8 (all four rungs, no scripted swap)"
    },
    "molecule": {
      "name": "the species on screen",
      "unit": "categorical",
      "options_S8_core_only": ["H2O", "CO2", "CCl4", "CH4", "BF3", "HF", "HCl", "HBr", "HI"],
      "role": "taught_variable", "note": "S8 only (config.explore_species, F10 — CHCl3 and NF3 explicitly EXCLUDED, Rule 38b)"
    },
    "spin": {
      "name": "rotation about the vertical axis, teacher-driven when live",
      "unit": "categorical (drive/idle)", "role": "taught_variable",
      "note": "live on S5 (spin_rate ~0.15 rad/s, spin_start_ms authored) and S8 (idle auto-spin, contract trap 6)"
    }
  },
  "formulas": {
    "delta_chi": "|chi_A - chi_B|  (reference only -- renderer computes this natively, not via PM_interpolate)",
    "bond_dipole_vector": "bond_moment_intrinsic * unit_vector(central -> ligand)  (sign convention: positive = central atom is delta+)",
    "molecular_dipole": "mu = |sum_i(bond_dipole_vector_i) + lone_pair_moment_N * unit_vector(central -> lone_pair)|  (the N-lone-pair term is 0 for every central atom except N, per R1's convention decision)"
  },
  "computed_outputs": {
    "S1_HCl":  { "delta_chi": 0.96 },
    "S2_HF":   { "mu": 1.83, "delta_chi": 1.78 },
    "S2_HCl":  { "mu": 1.11, "delta_chi": 0.96 },
    "S2_HBr":  { "mu": 0.83, "delta_chi": 0.76 },
    "S2_HI":   { "mu": 0.45, "delta_chi": 0.46 },
    "S3_CO2":  { "mu": 0.00 },
    "S4_H2O":  { "mu": 1.85, "bond_angle": 104.5 },
    "S5_CCl4": { "mu": 0.00 },
    "S6_CHCl3":{ "mu": 1.04 },
    "S7_NH3":  { "mu": 1.47, "delta_chi": 0.84 },
    "S7_NF3":  { "mu": 0.23, "delta_chi": 0.94 }
  },
  "constraints": [
    "mu is the VECTOR sum of every bond dipole plus any explicit lone-pair dipole, never their arithmetic (scalar) sum",
    "every bond arrow is drawn delta-plus to delta-minus; the convention is asserted once (S2 narration + gate assertion 5) and holds unchanged in every later state",
    "a molecule with n identical bonds in a fully symmetric point-group arrangement (linear AB2, tetrahedral AB4) has mu = 0 regardless of individual bond polarity",
    "the higher-delta-chi bond in any displayed pair carries the longer arrow (S2's core rule); S7's four-vector ratification exists specifically to keep this true",
    "changing or removing exactly one bond's contribution (S6's Cl -> H swap) changes the resultant by exactly that one bond's vector delta -- the other bonds' vectors are untouched",
    "no chemical reaction, state symbol, oxidation number, or mole-scale factor appears anywhere in this concept -- see the balanced-equation-ledger section below"
  ]
}
```

---

## 2. Balanced-equation ledger — N/A, stated explicitly

No reaction, no state symbols, no oxidation numbers, no charge-balance table apply to this concept.
Every species shown is a single stable molecule/bond, never transformed into another substance
on-screen (CO₂, H₂O, CCl₄, CHCl₃, NH₃, NF₃, HF/HCl/HBr/HI are each displayed as themselves — S6's
CCl₄→CHCl₃ "swap" is a scripted SUBSTITUTION for teaching purposes, not a reaction, and is narrated
as "replace," never "react"). The conservation-discipline analog for this concept is the
**arrow-convention plan** (below), which does the same evidentiary job the ledger does elsewhere:
every arrow, in every state, is drawn δ+ → δ−, asserted once (S2) and enforced by gate assertion 5.
A sign flip on any table entry would render a perfectly normal-looking arrow while teaching the
reverse of the truth — the CRITICAL scar `superposed_orbital_sign_convention_inverts_the_taught_direction`
noted at `:48516` — so this is a real correctness discipline, not a formality, even without a reaction.

---

## 3. Per-state motion timeline + control spec

`words/2.8 wps → ms/word ≈ 357.14`, the fleet's estimated-speech constant (matches
`narration_outruns_choreography`'s own probe). Every cue below is retimed against the FINAL narration
text's own per-sentence cumulative word count, not left at the skeleton's placeholder numbers — this
is the reconciliation the role spec asks for, done explicitly rather than asserted.

### S1 — "The shared pair shifts" (core · `pair-shift` · 41→40 words)

| cue | ms | synced to |
|---|---|---|
| `pair_shift_at_ms` | 8600 | start of "Watch the shared pair slide toward chlorine" (sentence 3 begins ~8570ms) |
| `pair_shift_duration_ms` | 1800 (ends 10400) | finishes inside sentence 3's own window (ends 10710ms) |
| `charges_at_ms` | 11000 | 600ms readable gap after pair-shift ends (Rule 32a); lands as sentence 4 ("Chlorine becomes... delta minus") begins (~10710ms) |

Last authored cue 11000ms. `deriveStateMeta` candidates: `pair_shift_at_ms+1200=9800`,
`charges_at_ms+900=11900` → max 11900. **`eye_capture_ms: 13000`** (≥ last cue + 2000, and ≥ the
derived candidate). Declared `dur: 18s`; est. speech 40w → 14286ms; `content_ms = max(11000,14286) =
14286`; `18000/14286 = 1.26×` — clears the 1.5× overpad ceiling. `narration_outruns_choreography`
check: `0.7 × 14286 = 9996`; last cue 11000 ≥ 9996 ✓.

Controls: none (core, watch-only). Glow focal: `electrons` (0–10400ms) → `charges` (11000ms→).

### S2 — "The bond dipole arrow" (core · `arrow-grow` · 55 words, at the ceiling)

| cue | ms | synced to |
|---|---|---|
| `arrows_at_ms` | 2200 | as the word "arrow" is first spoken (sentence 1, ~2140ms) |
| `compare_at_ms` | 12500 | as "Swap fluorine for iodine" begins (sentence 4 opens ~11430ms; a small settle gap after HF's numbers finish at 11430) |
| `compare_duration_ms` | 1800 (ends 14300) | finishes BEFORE "the difference drops to 0.46" is spoken (~14640ms) — the HUD already reads the new numbers when the narrator states them |

Last authored cue 14300ms. `deriveStateMeta`: `arrows_at_ms+900=3100`,
`compare_at_ms+1500(flat)=14000` (note: the flat offset UNDER-reads my authored 1800ms duration by
300ms — negligible here, flagged generically below) → max 14000. **`eye_capture_ms: 16300`**.
Declared `dur: 20s`; est. speech 55w → 19643ms; `content_ms=19643`; `20000/19643=1.02×` ✓.
`narration_outruns_choreography`: `0.7×19643=13750`; last cue 14300 ≥ 13750 ✓ (margin 550ms).

Controls: `[{id:'ligand', min_ring:'core'}]`, drag-seized to the scripted swap (contract trap 3).
Glow focal: `arrows` throughout.

### S3 — "Two arrows cancel — CO₂" (core · `vector-cancel` · MISCONCEPTION BEAT 1 · 47 words)

| cue | ms | synced to |
|---|---|---|
| `charges_at_ms` | 2200 | start of sentence 2 ("Each carbon-oxygen bond is strongly polar") |
| `arrows_at_ms` | 3600 | as "both arrows are long" is spoken, still inside sentence 2 (ends 5710ms) |
| `resultant_at_ms` | 12200 | inside sentence 5 ("The total dipole moment is zero," 11070–13210ms) — the sum lands as the number is spoken |

Last authored cue 12200ms. `deriveStateMeta`: `charges+900=3100`, `arrows+900=4500`,
`resultant+900=13100` → max 13100. **`eye_capture_ms: 14200`**. Declared `dur: 20s`; est. speech
47w → 16786ms; `content_ms=16786`; `20000/16786=1.19×` ✓. `narration_outruns_choreography`:
`0.7×16786=11750`; last cue 12200 ≥ 11750 ✓ (margin 450ms).

Formula surface introduced here (`μ = μ₁ + μ₂ + … (added as vectors)`), persists unchanged S3→S8.
Controls: none (watch-this beat). Glow focal: `arrows` (2200–12200ms) → `resultant` (12200ms→).

### S4 — "Bent water is polar" (core · `bend-and-sum` · PRIMARY AHA · 54 words)

| cue | ms | synced to |
|---|---|---|
| `angle_from` | 180 | recreates S3's cancelled picture on water at entry |
| `angle_at_ms` | 4500 | as "is bent" is spoken (sentence 1, word 11 ≈ 3930ms) |
| `angle_ramp_ms` | 3000 (ends 7500) | finishes exactly as "104.5 degrees" is spoken (sentence 1 ends 7500ms) |
| `resultant_at_ms` | 11700 | just before "1.85 debye" is spoken (sentence 3, ~11790ms) — the arrow is already grown when the number lands |

⚠ **BLOCKED pending E1c-1** (angle-ramp cue does not exist yet — confirmed, `docs/notes/bonding_scene_contract.md`).
Authored here so json_author has exact numbers the moment E1c ships; do not implement a fallback.

Last authored cue 11700ms. `deriveStateMeta` candidate for `resultant_at_ms+900=12600`; **no
candidate exists yet for `angle_at_ms`/`angle_ramp_ms`** (confirmed by reading `deriveStateMeta.ts`'s
`bonding_scene` block, lines ~1992–2023 — only `spin_start_ms · arrows_at_ms · resultant_at_ms ·
charges_at_ms · pair_shift_at_ms · compare_at_ms · assemble_at_ms · approach_at_ms` are read). This
is NOT a blocking gap for THIS state specifically, because `resultant_at_ms` (11700) is deliberately
sequenced AFTER the ramp completes (7500) and dominates the candidate list on its own — but it IS a
genuine latent gap for any FUTURE state that scripts an angle ramp with no following reveal cue.
Flagged in the report below as a follow-up ask, not solved here (Rule 40 — engine work is not mine).
**`eye_capture_ms: 13700`** (≥ 11700+2000, ≥ derived candidate 12600). Declared `dur: 22s`; est.
speech 54w → 19286ms; `content_ms=19286`; `22000/19286=1.14×` ✓ (no overpad).

`narration_outruns_choreography`: `0.7×19286=13500`; last authored cue was 11700 < 13500 →
**failed the probe by ~1800ms.**

🔵 **RESOLVED by the dispatching session — not an exception, and not a new prop.** The diagnosis
above is right: sentence 4 is a spoken recall. But its conclusion — that filling the gap would
require drawing a microwave — is not the only option. **A dipole in a flipping field TURNS, and that
turning IS dielectric heating.** So the anchor sentence gets the one motion that is literally the
mechanism it describes:

| cue | ms | synced to |
|---|---|---|
| `spin_start_ms` | **14286** | the first word of sentence 4 ("This is why a microwave…") |
| `spin_rate` | **≈0.22 rad/s** | ~1.1 half-turns across the 5.0 s anchor sentence — slow, readable, no blur |

Last cue 14286 ≥ 13500 → **clears the probe** (margin 786ms). Why this is the right fix rather than
a patch:
- **Physics-true.** A water molecule turning under a flipping field is exactly what a microwave does
  to it. The anchor becomes something the student *watches* instead of something the narrator
  asserts — Rule 24, the sim is the teacher's silent visual.
- **No new prop, no new capability.** `spin_rate` / `spin_start_ms` shipped in E1 and are already
  used by S5. Rule 32d one-apparatus continuity is intact; the canvas budget is untouched.
- **Rule 32b holds.** A whole-body rotation is a viewpoint change, not a second variable moving —
  the bend and the resultant stay settled and correct throughout.
- ⚠ **Declared for Checkpoint B:** this puts a rotation on S4 as well as S5. It is **not** an
  archetype repeat. S4's archetype is `bend-and-sum`, and the spin is an anchor coda *after* that
  beat has landed; S5's spin **is** its beat — the reading mechanism that proves a 3D count.
  Different function, different timing, different duration. If the proxy disagrees, the fallback is
  to shorten sentence 4, never to reintroduce a static tail.

`eye_capture_ms` stays 13700 (the frozen pin should photograph the settled bent molecule with its
resultant, not a mid-rotation frame; the spin is continuous and self-sustaining for D7).

VSEPR prerequisite clause: "its two lone pairs hold the bonds at 104.5 degrees" (references the IDEA,
never a `vsepr_molecular_shapes` fixture by name — clears `narration_references_a_prerequisite_...`).
Controls: `[{id:'angle', min_ring:'core'}]`, drag-seized (contract trap 3). Formula surface persists
(S3's). Glow focal: `resultant` (11700ms→; angle motion itself has no dedicated glow key in the
10-key enum — the bond arrows carry the motion visually, `arrows` implicit through the ramp).

### S5 — "Four arrows, zero — CCl₄" (core, the 💎 · `tetra-sum` · MISCONCEPTION BEAT 2 · 51 words)

| cue | ms | synced to |
|---|---|---|
| `arrows_at_ms` | 3200 | mid-sentence 1, as "four corners of a tetrahedron" is described (~4640ms) |
| `resultant_at_ms` | 9800 | just before sentence 2 ends ("the four arrows balance," 10360ms) |
| `spin_start_ms` | 10400 | 600ms readable gap after the resultant settles (Rule 32a) |

Last authored one-shot cue 10400ms (spin then runs perpetually — see below). `deriveStateMeta`:
`arrows+900=4100`, `resultant+900=10700`, `spin_start+1200=11600` → max 11600. **`eye_capture_ms:
12400`**. Declared `dur: 22s`; est. speech 51w → 18214ms; `content_ms=18214`; `22000/18214=1.21×` ✓.

`narration_outruns_choreography`: unlike S4, S5's `spin_rate ≈0.15 rad/s` runs CONTINUOUSLY from
10400ms onward (through the rest of narration and into S8), so the picture is never static after the
resultant settles — the probe's premise (a state that goes visually dead while narration continues)
does not apply here by construction. No camera authored (per the D-4 solved-camera scar, `:48545`ff
— S5 uses the shipped `dipole_sum` camera, never a per-state override).

Controls: `[{id:'spin', min_ring:'core'}]`. Formula surface persists. Glow focal: `arrows`
(3200–9800ms) → `resultant` (9800ms→).

### S6 — "One swap — CHCl₃" (extended · `substitute-one` · 44 words)

| cue | ms | synced to |
|---|---|---|
| `compare_at_ms` | 2200 | right after "Replace" is spoken (sentence 2 begins 1790ms) |
| `compare_duration_ms` | 1500 (ends 3700) | finishes as sentence 2 ends (3930ms) — the swap completes as the instruction finishes being spoken |
| `resultant_at_ms` | 12800 | just before "1.04 debye" is spoken (sentence 5, ~13210–13930ms) |

Last authored cue 12800ms. `deriveStateMeta`: `compare_at_ms+1500(flat)=3700` (matches the authored
1500ms exactly here — no drift), `resultant+900=13700` → max 13700. **`eye_capture_ms: 14800`**.
Declared `dur: 20s`; est. speech 44w → 15714ms; `content_ms=15714`; `20000/15714=1.27×` ✓.
`narration_outruns_choreography`: `0.7×15714=11000`; last cue 12800 ≥ 11000 ✓ (margin 1800ms).

Ratified override: `MG_MOLECULES.CHCl3.bond_moments = { Cl: 0.74 }` (R3). Controls: none. Formula
surface persists. Glow focal: `resultant` throughout (the three unchanged arrows carry no separate
glow key — they simply hold pose, Rule 32b/32d).

### S7 — "Lone pair: NH₃ vs NF₃" (advanced · `lone-pair-add` · MISCONCEPTION BEAT 3 · 53 words)

| cue | ms | synced to |
|---|---|---|
| `charges_at_ms` | 2000 | early in sentence 1 (unchanged from Checkpoint A cycle 1, F11) |
| `arrows_at_ms` | 3200 | still inside sentence 1 (ends 7500ms) |
| `resultant_at_ms` | 7800 | as sentence 2 begins ("They add") — grows to settle right as "1.47 debye" is spoken (~8930ms) |
| `compare_at_ms` | 9200 | as "Swap" is spoken (sentence 3 begins 8930ms) |
| `compare_duration_ms` | 7300 (ends 16500) | the flip-and-shrink plays out THROUGH sentence 4's explanation ("Fluorine pulls harder still... against the lone pair," 10710–16790ms), finishing right as it ends — a deliberately slow, readable transformation for the hardest single idea in the arc, not a quick cut |

Last authored cue 16500ms. `deriveStateMeta`: `charges+900=2900`, `arrows+900=4100`,
`resultant+900=8700`, **`compare_at_ms+1500(flat)=10700`** — ⚠ this candidate materially
UNDER-reads the true settle time (16500) because the flat +1500 heuristic does not read
`compare_duration_ms` (confirmed: `bscPush(bscState.compare_at_ms, 1500)` at `deriveStateMeta.ts`,
does not consult the sibling `_duration_ms` field, unlike `pair_shift_at_ms`/`approach_at_ms`/
`assemble_at_ms`, which all do). **I author `eye_capture_ms` explicitly to cover this rather than
rely on the derived candidate — the per-state contract already requires that
(`eye_capture_ms ≥ last cue + 2000`, hand-authored, not inferred).** **`eye_capture_ms: 18500`**
(16500+2000). Declared `dur: 22s`; est. speech 53w → 18929ms; `content_ms=18929`;
`22000/18929=1.16×` ✓ (no overpad — the long swap duration is inside the narration window, not
padding beyond it). `narration_outruns_choreography`: `0.7×18929=13250`; last cue 16500 ≥ 13250 ✓
(margin 3250ms — the deliberately slow swap is what clears this state's own probe cleanly, unlike S4).

⚠ **Flag for the surgeon/quality_auditor (not fixed here, Rule 40):** `deriveStateMeta.ts`'s
`compare_at_ms` candidate should read `compare_duration_ms` the way `pair_shift_at_ms` already does,
the same one-line pattern used at three other cue keys in the same block. Low-risk, generalizable,
would remove the need for every future `compare`-mode state with a non-default duration to
hand-verify its own `eye_capture_ms` the way this one does. Not asking E1c to carry it (Rule-40
two-surgeons hazard is already live) — a follow-up ask.

Under R1, `arrows_at_ms` now grows BOTH NH₃ bond arrows AND (E1c-2) the lone-pair vector at entry;
the swap at `compare_at_ms` re-orients the bond arrows only (the lone-pair vector's direction is
fixed by geometry, only its role in the sum changes — it stops adding and starts opposing).
`hud_lines:['mu','delta_chi']`; Δχ reads 0.84 (N–H) then, after the swap, 0.94 (N–F) — HUD updates
live through the swap window, same instrument throughout (D-3).

Controls: none. Formula surface persists. Glow focal: `arrows` (3200–7800ms) → `resultant`
(7800ms→).

### S8 — "Explore polarity" (core · `interaction_complete`)

No scripted cues (user-driven; engine idle-spins per contract trap 6, no frozen tail — Rule 37).
Controls: `[{id:'molecule',min_ring:'core'}, {id:'angle',min_ring:'core'}, {id:'ligand',min_ring:'core'}]`.
`config.explore_species: ["H2O","CO2","CCl4","CH4","BF3","HF","HCl","HBr","HI"]`,
`config.explore_ligands: ["HF","HCl","HBr","HI"]` (F10, both authored explicitly — the unauthored
default contains CHCl₃ and NF₃, a Rule 38b breach). `hud_lines:['mu','delta_chi']`. Formula surface
= the S3 core surface only (38b).

---

## 4. Notation + dialect ladder

This concept never needs the calculus/log/quantum tier at any ring — every state, core through
advanced (S7), stays arithmetic/vector-arrow notation (`μ = μ₁+μ₂+…`, added as vectors; no logs, no
derivatives, no quantum numbers appear anywhere). S7 does not escalate NOTATION, only CONTENT
complexity (a direction-reversal argument, still expressed with the same vector-sum language as
S3/S5) — trivially compliant with 38c.

Dual-labels (38d): "dipole moment μ" spoken in full at first use (S2) with the unit spoken in full
("debye") before the symbol "D" is used bare thereafter — already fixed in the skeleton's DoD, carried
forward unchanged. "electronegativity" is NEVER shown as a bare canvas symbol (χ is spoken, never
drawn) — no dual-label needed, it is simply never abbreviated on-canvas.

**Two deliberate exceptions to strict IUPAC-primary naming, recorded rather than silently applied:**
"chloroform" (IUPAC trichloromethane) and "carbon tetrachloride" (IUPAC tetrachloromethane) are kept
as their common names, unqualified, because both are the universal name used at this level across
every syllabus this concept targets (CBSE/NCERT, JEE, IB, AP, A-level all teach "chloroform"/"carbon
tetrachloride" without the IUPAC form in a Class-11 inorganic-bonding context — IUPAC systematic
naming of haloalkanes is a Class-12 organic-nomenclature topic, off-scope here and would be a
distracting, unfamiliar term mid-lesson). "Ammonia" (IUPAC "azane," essentially never used) needs no
qualification for the same reason. "Hydrogen fluoride/chloride/bromide/iodide" are already systematic
names, not common names — no exception needed there.

---

## 5. Drill-down cluster phrasings (5 per cluster, student voice)

**`vector_addition_of_bond_dipoles`** (S4):
1. "why do you add the arrows instead of just adding the numbers"
2. "if both bonds are polar why doesn't the total just get bigger"
3. "how do two arrows pointing different ways add up to a smaller number"
4. "is adding dipole arrows the same as adding forces"
5. "why does the direction of the arrow matter if the bond is polar either way"

**`shape_decides_polarity`** (S4):
1. "so the bonds don't decide if the molecule is polar, the shape does"
2. "why does bending the molecule change anything if the bonds stayed the same"
3. "can two molecules with the same bonds have totally different polarity"
4. "does changing the shape without changing the atoms really change the dipole"
5. "why do we care about the 3D shape and not just which atoms are attached"

**`bent_vs_linear_water`** (S4):
1. "what would water look like if it were a straight line instead of bent"
2. "why isn't water shaped like carbon dioxide if both have two bonds"
3. "if water were linear would it still be able to dissolve salt"
4. "what's actually pushing the hydrogens apart to make the bent shape"
5. "why does 104.5 degrees matter so much for water's polarity"

**`tetrahedral_cancellation_3d`** (S5):
1. "how can four arrows in different directions add up to exactly zero"
2. "I can see two arrows cancel on paper, how do I see four cancel in 3D"
3. "do all four bonds have to point at exactly the same angle to cancel"
4. "why doesn't spinning the molecule ever show a leftover arrow"
5. "is the 3D cancellation just a coincidence for this particular shape"

**`symmetry_and_zero_dipole`** (S5):
1. "does every symmetric molecule automatically have zero dipole moment"
2. "what exactly counts as symmetric enough to cancel"
3. "if all four bonds are identical, does the molecule have to be nonpolar"
4. "why does symmetry matter more than how polar each bond is"
5. "is there a shortcut to know a molecule is nonpolar without doing the vector math"

**`ccl4_vs_chcl3_contrast`** (S5, bridges S6):
1. "why does swapping just one chlorine for hydrogen suddenly make it polar"
2. "doesn't replacing one atom out of four barely change anything"
3. "why can't the other three chlorines still cancel out on their own"
4. "how much of the dipole comes from the one different bond versus the shape"
5. "if I swapped a different chlorine instead of that one, would I get the same answer"

---

## 6. Constraint callouts

- **Scale:** 1 scene unit = 48 pm (contract's own scale; O–H drawn at `BS_BOND_LEN` 2.0 units = 96
  pm). No particle-count representative scale applies (no mole-scale/Avogadro depiction anywhere in
  this concept — a single molecule is drawn at true relative bond geometry, not a bulk sample).
- **No unit conversions apply.** No °C↔K, no g↔mol anywhere in this concept — say so explicitly
  rather than leaving the callout blank; `μ` is authored, displayed, and computed in debye throughout,
  `Δχ` is dimensionless (Pauling) throughout, `bond_angle` is authored, displayed, and computed in
  degrees throughout. Nothing hides a conversion behind a slider.
- **Slider steps:** `bond_angle` step 0.5° (fine enough to resolve 104.5° exactly on S4/S8; matches
  the ramp's own 180→104.5° target). `spin` has no numeric step — it is a drive/idle toggle plus the
  authored `spin_rate`, not a magnitude slider. `ligand`/`molecule` are discrete enumerations, not
  continuous — no step applies.
- **No log-scale display anywhere** in this concept (μ and Δχ are both linear-scale HUD reads).
- **Arrow length = the SAME table value used for the HUD `mu`/`delta_chi` reads** (Rule 29, D-3 one
  instrument) — this is the discipline R1/R2/R3 exist to protect: any future data edit to
  `BS_BOND_MOMENT_D`/`BS_LONE_PAIR_D` must keep the arrow and the HUD reading off the identical table
  entry, never a separately-tuned "display" value.

---

## 7. Assessment items (4, `depth_ring`-tagged per skeleton DoD)

**Item 1 — `extended`** (S5/S6): *"Which of these has a dipole moment of zero: water, ammonia, carbon
tetrachloride, or chloroform?"*
- Correct: **carbon tetrachloride** (μ = 0, exact by tetrahedral symmetry).
- Distractor "water" — misconception: any molecule with polar bonds and no net charge must have a
  nonzero dipole moment (fails to check whether the shape is symmetric enough to cancel).
- Distractor "ammonia" — misconception: a molecule with a lone pair cannot be symmetric enough to
  cancel, so it must be one of the zero-μ options (confuses "has a lone pair" with "cancels").
- Distractor "chloroform" — misconception: since three of the four bonds are identical (three C–Cl),
  the molecule is "close enough" to symmetric to cancel (ignores that ONE different bond is enough to
  break the symmetry entirely — this is S6's whole lesson).

**Item 2 — `core`** (S3): *"Carbon dioxide has two strongly polar carbon–oxygen bonds, yet CO₂ has no
dipole moment. Why?"*
- Correct: the two bond dipoles are equal in magnitude and point in exactly opposite directions
  (linear geometry), so they cancel completely.
- Distractor "the bonds in CO₂ are actually nonpolar" — misconception: infers backward from zero
  molecular dipole that the individual bonds must be nonpolar.
- Distractor "carbon and oxygen have the same electronegativity" — misconception: conflates zero
  MOLECULAR dipole with zero electronegativity difference.
- Distractor "CO₂ has no lone pairs so it cannot be polar" — misconception: lone pairs, not shape
  cancellation, are believed to determine polarity.

**Item 3 — `advanced`** (S4/S7): *"Rank H₂O, NH₃, and NF₃ by dipole moment from largest to smallest,
and explain why NF₃'s dipole moment is so much smaller than NH₃'s even though the N–F bond is more
polar than the N–H bond."*
- Correct: **H₂O (1.85 D) > NH₃ (1.47 D) > NF₃ (0.23 D)**. In NH₃ the bond-dipole resultant points the
  same way as the lone pair (they add); in NF₃ the more polar N–F bonds point the OPPOSITE way to the
  lone pair (they mostly cancel it), so despite the larger bond polarity the net molecular dipole is
  much smaller.
- Distractor "NF₃ should have the largest dipole moment because the N–F bond is the most polar bond
  of the three" — misconception: bond polarity alone (not direction relative to the lone pair) sets
  molecular dipole (misconception §4 belief 3 verbatim).
- Distractor "NH₃ and NF₃ should have about the same dipole moment since both are pyramidal with one
  lone pair" — misconception: ignores that the DIRECTION of the bond dipoles relative to the lone pair
  differs between the two.
- Distractor "the lone pair on nitrogen doesn't affect the dipole moment, only the bonds do" —
  misconception: exactly the fitted-vs-intrinsic confusion R1's four-vector model exists to resolve.

**Item 4 — `core`** (S4): *"A linear AB₂ molecule with two identical polar bonds is bent into an angle
less than 180 degrees, with the bond lengths and bond polarities unchanged. What happens to its
dipole moment?"*
- Correct: the dipole moment increases from zero to a nonzero value — bending breaks the exact
  cancellation, so the two bond dipoles now add a nonzero component along the bisector.
- Distractor "the dipole moment stays zero because the bonds themselves did not change" —
  misconception: conflates bond-level polarity with molecule-level polarity (misconception §4 belief
  1 verbatim).
- Distractor "the dipole moment decreases because the bonds are now closer together" —
  misconception: confuses geometric crowding/distance with vector direction.
- Distractor "the dipole moment cannot be predicted without knowing the exact atoms involved" —
  misconception/evasion: fails to apply the general vector-sum rule, which holds regardless of atom
  identity.

---

## 8. Final shipping narration (S1–S7, word counts against the 25–55 budget)

**S1 (40w):** "Hydrogen and chlorine share one electron pair. Chlorine pulls harder: its
electronegativity is 3.16, hydrogen's is 2.20, a difference of 0.96. Watch the shared pair slide
toward chlorine. Chlorine becomes slightly negative, delta minus. Hydrogen becomes slightly positive,
delta plus."

**S2 (55w):** "A polar bond gets an arrow, drawn from delta plus to delta minus. Its length is the
measured dipole moment. Hydrogen fluoride: electronegativity difference 1.78, dipole moment 1.83
debye — a long arrow. Swap fluorine for iodine: the difference drops to 0.46, and the arrow shrinks
to 0.45 debye. A bigger difference gives a longer arrow."

**S3 (47w):** "Carbon dioxide is a straight molecule. Each carbon-oxygen bond is strongly polar: both
arrows are long. Now add them as vectors. They point in exactly opposite directions, so they cancel
completely. The total dipole moment is zero. Polar bonds by themselves do not make a polar molecule."

**S4 (54w):** "Water has the same polar bonds, but the molecule is bent: its two lone pairs hold the
bonds at 104.5 degrees. The two arrows no longer point opposite ways. Their sum is 1.85 debye — same
bonds, different shape, polar molecule. This is why a microwave oven heats food and leaves a dry
plate cool."

**S5 (51w):** "Four carbon-chlorine bonds, each polar, point at the four corners of a tetrahedron —
the shape from the shapes lesson. Turn the molecule: from every side the four arrows balance. Their
sum is exactly zero, in three dimensions. Carbon tetrachloride has no dipole moment. The symmetric
shape makes the four arrows cancel."

**S6 (44w):** "Carbon tetrachloride again: total zero. Replace one chlorine with a hydrogen. Three
arrows keep their directions; the fourth is different. The arrows no longer cancel — a resultant
appears along the hydrogen-carbon axis. This is chloroform, measured at 1.04 debye. One substitution
removes the symmetry."

**S7 (53w):** "Ammonia: nitrogen pulls harder than hydrogen, so the three bond arrows point toward
nitrogen — the same way its lone pair points. They add: 1.47 debye. Swap the hydrogens for
fluorines. Fluorine pulls harder still, so the bond arrows now point away from nitrogen, against the
lone pair. Most of that cancels: 0.23 debye."

Every string above is plain literal English (Rule 41): "pulls" is the physics word for
electronegativity's action (matches NCERT usage, matches the skeleton's own self-review line);
"cancels," "add," "flip," "drops" are literal vector-arithmetic/direction words, not idioms; no
molecule is described as wanting, seeking, or deciding anything.

---

## Self-review (chemistry_author)

Consulted NCERT Chemistry Class 11 Ch.4 §4.4 chapter index for scope; NCERT Exemplar for the three
misconception beliefs only. No teaching method, no example problem, no figure imported. Engine bug
queue consulted live (query above); every load-bearing prevention rule satisfied or the exception
explicitly recorded (S4's `narration_outruns_choreography` miss). R1/R2/R3 each ratified with the
calibration shown, not asserted, and forward-checked against the exact renderer formula
(`mgSqueeze`'s closed form, `bscDipole`'s vector sum). Every quantity in the skeleton's state
narratives appears in `variables` with a unit. No balanced-equation ledger needed — stated explicitly,
not left blank. Rule 31 timeline authored for all 8 states, reconciled against `deriveStateMeta`'s
actual candidate-computation code (not assumed), with two genuine engine gaps found and flagged
rather than worked around in JSON (angle-ramp candidate; compare-duration-blind flat offset). Word
budget: all seven guided states 40–55 words. Notation ladder: no log/calculus/quantum notation
anywhere in this concept, at any ring — trivially compliant. Drill-down phrasings: 30 total (5 × 6
clusters), plain student voice, no Hinglish. Constraints: 6, conservation/arrow-convention first.
Numerical sanity check RUN (not eyeballed): R1's forward computation (1.467 D, 0.228 D) and R3's
exact identity (0.74+0.30=1.04) are both shown as arithmetic, not claimed. Source check line present
above. Did not write or edit any concept JSON.
