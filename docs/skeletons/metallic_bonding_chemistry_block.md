# CHEMISTRY BLOCK — `metallic_bonding`

Authored by `chemistry_author` · 2026-08-03 · branch `feat/chemistry-metallic-bonding` · Desk 3,
concept 2 of 2. Companion to `docs/skeletons/metallic_bonding_skeleton.md` (founder-proxy Checkpoint A
`DESIGN_OK` at cycle 2 of 2 — the 7-state arc is SEALED and is **not** touched here). This block
discharges the skeleton's three ratification duties (`BS_METALS`, the free-electron density n, and the
S4 drift model), reconciles every narration string against the shipped player clock, and hands the
surgeon numbers it can build `E3b` from. Same `bonding_scene` scenario as Desk 2's `ionic_bonding`.

**Engine bug queue — ATTEMPTED, blocked, as recorded by the skeleton (§14).** No `.env.local` exists
on this worktree (`query_engine_bug_queue.ts` fails with "Missing Supabase env vars"), and the script
is a known false-all-clear on chemistry concepts (hardcoded physics concept list). **Flagged again
here, unchanged:** run the live Gate-8 query from a credentialed session before Checkpoint B. This
block is built from `field_3d_renderer.ts` source (grep-verified, line numbers inline), the E1/E2
contract note, and the skeleton's own scar-compliance list — the same substitute the skeleton used.

**Source check line:** Consulted the NCERT Chemistry Class 11 Ch.3/Ch.4 index to confirm scope
(metallic bonding: brief qualitative mention; the Solid State unit is removed from the rationalised
syllabus). Consulted NCERT Exemplar for misconception beliefs only (the per-atom-ownership belief;
the fast-electron belief). No teaching method, worked example, or figure imported. Every derivation
below (ΔH_at convention, n, μ) is worked from first principles / standard tabulated constants, not
copied from any textbook's worked example.

---

## 0 · Status recap (unchanged from the skeleton — not re-litigated)

S1 is **buildable today** (E3a). S2–S7 are **E3b-blocked** — ten new capabilities (C-1…C-10), all
named in the skeleton §4. This block's three ratified numbers (`BS_METALS`, n, the drift model) are
the **required input** to that E3b dispatch, not downstream of it — the surgeon builds `BS_METALS`
and the drift consumer FROM the tables below.

---

## 1 · DUTY 1 — `BS_METALS`, fifteen cells, ratified

**Conventions named (all three metals, all three quantities):**

- **`a_pm`** — the conventional cubic (or, for hcp, basal-hexagonal) cell edge, X-ray diffraction, at
  ≈298 K, in picometres. This is the SAME linear-in-pm convention `BS_RADIUS_PM` already ships on
  (`field_3d_renderer.ts:51712` — `Na: 186, Mg: 160, Al: 143`), so a_pm and the atomic radii sit on one
  consistent scale and the touching-spheres geometry check below is meaningful.
- **hcp `a_pm` is the BASAL edge**, with the axial ratio fixed at the IDEAL c/a = √(8/3) ≈ 1.633, exactly
  as shipped in `BS_HCP_C_OVER_A` (`:51649`). Magnesium's REAL c/a is ≈1.624 — a 0.5% departure from
  ideal. At render scale this is invisible (sub-pixel on any camera framing this scenario uses) and
  does not affect the nearest-neighbour distance used in the geometry check (that check uses only the
  basal edge a, which is unaffected by c/a). **Not a correction — the ideal-ratio simplification is
  fine to ship as-is.**
- **`dH_at_kJ`** — the standard enthalpy of atomisation of the SOLID element at 298 K, **kJ per mole of
  ATOMS** (i.e., M(s) → M(g), one mole of gaseous atoms produced per mole of reaction as written).
  **Why "per mole of atoms" must be stated explicitly, even though it looks trivial for these three
  metals:** atomisation enthalpy is authored per mole of atoms EVERYWHERE by IUPAC convention, but the
  number only equals "per mole of solid" for monatomic solids. All three metals here ARE monatomic
  solids (no Na₂, Mg₂, Al₂ molecular units in the solid), so for THIS table the two phrasings coincide
  — but S6's narration says "the energy needed to pull one mole of atoms out," and that sentence is
  only literally true because the convention is atoms, not formula units. (Contrast: if this table ever
  grew a molecular/diatomic element, the two conventions would diverge and the narration would need to
  say which one the number is.) All three values below are confirmed on the per-mole-of-atoms basis.
- **`mp_K`** — melting point at standard pressure (101.325 kPa), kelvin.
- **`valence`** — free/delocalised electrons contributed per atom to the sea; matches the shipped
  `BS_VALENCE` table exactly (`:51726` — `Na: 1, Mg: 2, Al: 3`), so the sea-count-per-site logic (C-10,
  C-4) and this table never disagree.

**The ratified table (no digit changed from the architect's proposal):**

| Metal | cell | a_pm | valence | dH_at_kJ (mol⁻¹ atoms) | mp_K |
|---|---|---|---|---|---|
| Na | bcc | 429.0 | 1 | 107 | 371 |
| Mg | hcp | 320.9 | 2 | 146 | 923 |
| Al | fcc | 404.9 | 3 | 326 | 933 |

**Calibration shown (never asserted) — literature spread per cell:**

- `a_pm`: single-source-class X-ray cell-edge values, textbook-standard, negligible spread (±0.1 pm
  class) — Na 429.0–429.1, Mg 320.9 (basal), Al 404.9–405.0. No correction.
- `dH_at_kJ`: general inorganic-chemistry reference tables (CRC-Handbook / Housecroft-Sharpe-Appendix
  class) report a small spread per metal — **Na 107–109, Mg 146–150, Al 326–330 kJ·mol⁻¹** depending on
  source and measurement method (sublimation calorimetry vs. vapour-pressure extrapolation). The
  proposed 107/146/326 sit at the LOW end of each published band, which is fine — they are internally
  consistent (drawn from one source class) and, critically, **monotonic with wide margins** (Δ(Mg−Na)
  ≈ 39 kJ·mol⁻¹, Δ(Al−Mg) ≈ 180 kJ·mol⁻¹) — nowhere close to being swallowed by the ±2–4 kJ·mol⁻¹
  source spread. **Ratified as proposed; the spread is a rounding-class difference, not a defect** (see
  §11 tolerance).
- `mp_K`: Na 370.87 K → 371 (rounds correctly), Mg 923.15 K (650°C) → 923, Al 933.47 K (660.32°C) → 933.
  All exact to the nearest kelvin. No correction.

**Geometry cross-check RE-RUN against the ratified a_pm values (confirms the skeleton's own solve,
not merely repeated):**

| Metal | cell | nn formula | nn (pm) | 2·r (pm, `BS_RADIUS_PM`) | Touch? |
|---|---|---|---|---|---|
| Na | bcc | a·√3⁄2 | 429.0 × 0.86603 = 371.5 | 2 × 186 = 372 | ✓ (0.13% gap) |
| Al | fcc | a⁄√2 | 404.9 / 1.41421 = 286.3 | 2 × 143 = 286 | ✓ (0.10% gap) |
| Mg | hcp | a (basal nn = a for ideal c/a) | 320.9 | 2 × 160 = 320 | ✓ (0.28% gap) |

All three metals' spheres touch their nearest neighbours on the shared linear-pm scale, within
sub-percent rounding noise (the residual is exactly what you expect from a 0.1–1 pm class table meeting
a whole-picometre radius table). **No a_pm value needs to change; no re-solve required.**

**Constraint re-confirmed:** `BS_METALS` keys MUST be exactly `{Na, Mg, Al}` — the picker's three
`<option>` values are hardcoded in the DOM string (`:53419`). A fourth row would silently never render.

---

## 2 · DUTY 2 — free-electron density n (sodium), ratified

**Derivation, not quotation:** n = ρ·N_A·z / M

- ρ(Na) = 0.968 g·cm⁻³ (density of solid sodium metal at room temperature — standard tabulated value)
- N_A = 6.022 × 10²³ mol⁻¹
- z = 1 (free electrons per atom, from `BS_VALENCE.Na` — matches §1's ratified valence exactly)
- M = 22.99 g·mol⁻¹ (sodium's standard atomic weight)

```
n = (0.968 g/cm³ × 6.022×10²³ /mol × 1) / 22.99 g/mol
  = 5.829×10²³ / 22.99  (per cm³)
  = 2.535×10²² cm⁻³
  = 2.535×10²⁸ m⁻³               (×10⁶ cm³→m³)
```

**Result: n ≈ 2.5 × 10²⁸ m⁻³** (2 significant figures) — matches the architect's proposed value
exactly. **Ratified as proposed, no correction.**

**Comparison to published free-electron density and the reason it can differ:** some solid-state
physics tables (Kittel-class references) quote sodium's conduction-electron density closer to
**2.65 × 10²⁸ m⁻³**. That figure is computed from the density measured at low temperature (≈5 K,
≈1.013 g·cm⁻³) rather than room temperature — a metal is denser when cold, so n computed from a
5 K density is proportionally higher than n computed from the 298 K density used above. **This
concept's `thermal.T_K` default is 298 K** (every guided state), so the ROOM-TEMPERATURE density is
the correct input, and 2.5 × 10²⁸ m⁻³ is the number to ship — the ~5% difference from the low-temperature
figure is explained by which density was used, not by an error in either number.

**Precision + framing to ship:** `n(e⁻) ≈ 2.5 × 10²⁸ per m³`, exactly as authored in the S3 formula
surface (2 sig figs; `≈`, never `=`, since it is a rounded derived quantity). **This is RATIFIED DATA on
the formula surface — never a count of the on-screen dots.** The narration's scale-factor clause
("each dot stands for very many electrons") is the honest framing: S3's sea shows up to 40 dots
(C-2 ceiling `BS_MAX_SEA = 105` at S6's top step), a texture convention, not a counted sample of 2.5×10²⁸
real electrons. Confirmed correct as specified; no change.

---

## 3 · DUTY 3 — the S4 drift model, ratified WITH ONE CORRECTION

**Model:** `v_d = μ·E`. **Ratified.**

**μ(Na), derived via σ = n·e·μ (preferred over quoting a bare "electron mobility" figure, because
electron mobility is not a standard tabulated quantity for METALS the way conductivity is — conductivity
is the routinely measured, routinely tabulated number, and mobility is derived FROM it and n, which is
the defensible route):**

- σ(Na) ≈ 2.1 × 10⁷ S·m⁻¹ (from the standard tabulated resistivity of solid sodium at room temperature,
  ρ_resistivity ≈ 4.77 × 10⁻⁸ Ω·m; σ = 1/ρ_resistivity)
- n = 2.5 × 10²⁸ m⁻³ (§2, this document — same ratified value, so the two duties are internally
  consistent)
- e = 1.6 × 10⁻¹⁹ C

```
μ = σ / (n·e) = 2.1×10⁷ / (2.5×10²⁸ × 1.6×10⁻¹⁹)
              = 2.1×10⁷ / 4.0×10⁹
              = 5.25×10⁻³ m² V⁻¹ s⁻¹
```

**Result: μ(Na) ≈ 5.3 × 10⁻³ m² V⁻¹ s⁻¹** — matches the architect's proposal exactly. **Ratified as
proposed, no correction to μ itself.**

**Sanity cross-check (not required, offered because it is cheap and load-bearing):** the same
σ = neμ route applied to COPPER, using the shipped `drift_velocity.json` constants (n = 8.5×10²⁸ m⁻³,
σ_Cu ≈ 5.96×10⁷ S·m⁻¹, a standard tabulated value), gives μ(Cu) ≈ 4.4×10⁻³ m² V⁻¹ s⁻¹ — the same order
of magnitude and within ~20% of sodium's ratified value. Two metals computed by the identical method
landing close together is exactly the internal-consistency signal a ratification should show.

**Dimensional check:** [μ][E] = (m² V⁻¹ s⁻¹)(V m⁻¹) = m s⁻¹. ✓ `v_d` comes out in m/s directly, no
hidden conversion factor.

**Slider → field mapping: field (dimensionless 0–1) → E = 0 → 0.04 V m⁻¹ linearly. Ratified.**
Reasonableness check against an ordinary current-carrying wire (the dispatch's own comparison case):
for copper carrying ~5 A through a 1 mm² cross-section, J = I/A = 5×10⁶ A·m⁻², and
E = J/σ_Cu = 5×10⁶ / 5.96×10⁷ ≈ 0.084 V m⁻¹ — **same order of magnitude (10⁻² V m⁻¹) as the ratified
0.04 V m⁻¹ ceiling.** A sodium wire carrying a comparable current density would sit somewhat higher
(sodium's conductivity is lower than copper's), so 0.04 V m⁻¹ is, if anything, a conservative
(slightly-low) full-scale value for "ordinary household-current" fields — defensible, not inflated.
**Ratified as proposed.**

**⛔ CORRECTION — the reported full-scale `v_d` is wrong by ~2× and must be fixed:**

```
v_d(full scale) = μ × E_max = 5.3×10⁻³ m² V⁻¹ s⁻¹ × 0.04 V m⁻¹
                = 2.12×10⁻⁴ m s⁻¹
```

The skeleton's §4 S4 row and §2 report table both state **"≈1×10⁻⁴ m s⁻¹ full-scale"** — that is an
arithmetic slip in the dispatch brief; the correct value from the SAME ratified μ and the SAME ratified
E_max is **≈2.1 × 10⁻⁴ m s⁻¹**, roughly double what was stated. This does not change the qualitative
story (still order 10⁻⁴ m/s, still "very slow" against the random ~10⁵–10⁶ m/s scale, still the same
misconception-confrontation beat) — but the DIGIT that lands on the HUD must be the corrected one, or
S4 prints a number its own formula cannot produce. **This is the one number in this block that
changes.**

**HUD spec (`drift` line), corrected:**

- At `field = 0`: HUD reads **`v_d = 0 m/s`** — exact zero, live, printed every frame, never `—` and
  never stale (per the skeleton's explicit spec).
- At any `field > 0`: HUD reads **`v_d = N.N × 10⁻⁴ m/s`**, one decimal place (2 significant figures),
  tracking every drag continuously. Full range: `0.0` (just above zero) → `2.1 × 10⁻⁴ m/s` (field = 1.0).
- Never printed as `0.0 × 10⁻⁴ m/s` at exactly zero — the zero case is special-cased to the bare
  `0 m/s` form so a teacher never has to parse "is 0.0 actually zero or just very small."

**Narration + `misconception_watch.visual_counter` stay QUALITATIVE (no digit)** — unaffected by this
correction; they already correctly avoid hand-quoting the number (per the skeleton's own no-hand-quote
discipline). Only the HUD's printed digit needed the fix.

**Cross-link to `drift_velocity.json` (shipped physics concept), verified:** its default state gives
v_d = eEτ/m_e = (1.6×10⁻¹⁹ × 0.02 × 25×10⁻¹⁵) / 9.11×10⁻³¹ ≈ 0.88×10⁻⁴ m/s, against a documented random
speed u = 1.17×10⁵ m/s. Both the copper concept's default drift (~0.9×10⁻⁴ m/s) and this concept's
corrected full-scale sodium drift (~2.1×10⁻⁴ m/s) sit in the **same 10⁻⁴ m/s decade**, against random
speeds five to six orders of magnitude larger — **the cross-link is honest at the order-of-magnitude
level, which is all the one-sentence narration link claims.** No further correction needed there.

**Supplementary finding (NOT part of the scoped Duty 3 ask — flagged, not fixed here):** S7's explore
state puts the SAME `drift` HUD line behind a metal picker (Na/Mg/Al). The skeleton's §6 S7 lesson-7
duty describes "all three metals × field 0 → max (drift HUD tracks live...)" using language that reads
as if ONE mapping serves all three metals. **It does not, physically.** Running the identical
σ = neμ derivation for the other two metals (own ρ, own M, own z, standard tabulated resistivities):

| Metal | n (m⁻³, from §2's method) | σ (S/m, standard tabulated) | μ = σ/(ne) (m² V⁻¹ s⁻¹) |
|---|---|---|---|
| Na | 2.5 × 10²⁸ | ≈2.1 × 10⁷ | ≈5.3 × 10⁻³ |
| Mg | ≈8.6 × 10²⁸ | ≈2.2 × 10⁷ | ≈1.6 × 10⁻³ |
| Al | ≈1.8 × 10²⁹ | ≈3.5 × 10⁷ | ≈1.2 × 10⁻³ |

If E3b reuses the sodium-only μ for Mg and Al (the simplest implementation, and consistent with how
the skeleton's text reads), S7's Mg/Al drift readings will be **physically low by roughly 3–4×** at any
given field slider position — still the same order of magnitude (10⁻⁴ m/s), so the PEDAGOGICAL point
("current is a very slow drift") survives, but the printed digit would not be quantitatively ratified
for Mg/Al the way Na's is. **This table is offered as a low-cost pre-emptive fix, not a formal
ratification of Mg/Al's precision** — these three extra μ values are derived from ONE source class each
and not independently cross-checked the way §1–§3's core duties were. **Recommend one of:** (a) extend
`BS_METALS` with a fourth per-metal `mu` column so the picker is quantitatively honest for all three
metals (small, low-risk C-1 extension), or (b) if descoped, S7's drift HUD note should say the mapping
is calibrated for sodium and is illustrative-only for Mg/Al. **Flagged to quality_auditor and to the
E3b dispatch — not a blocker for S4 (which is sodium-only, core-ring, and fully ratified above).**

---

## 4 · `physics_engine_config` (documentary — `bonding_scene` computes these natively, same departure
Desk 1's block records: this is reference for json_author/quality_auditor, not `PM_interpolate` strings)

```json
{
  "variables": {
    "a_pm_Na": { "name": "sodium bcc cell edge", "unit": "pm", "constant": 429.0 },
    "a_pm_Mg": { "name": "magnesium hcp basal cell edge", "unit": "pm", "constant": 320.9 },
    "a_pm_Al": { "name": "aluminium fcc cell edge", "unit": "pm", "constant": 404.9 },
    "valence_Na": { "name": "free electrons per Na atom", "unit": "dimensionless", "constant": 1 },
    "valence_Mg": { "name": "free electrons per Mg atom", "unit": "dimensionless", "constant": 2 },
    "valence_Al": { "name": "free electrons per Al atom", "unit": "dimensionless", "constant": 3 },
    "dH_at_Na": { "name": "enthalpy of atomisation, Na(s)->Na(g)", "unit": "kJ mol-1 (per mole atoms)", "constant": 107 },
    "dH_at_Mg": { "name": "enthalpy of atomisation, Mg(s)->Mg(g)", "unit": "kJ mol-1 (per mole atoms)", "constant": 146 },
    "dH_at_Al": { "name": "enthalpy of atomisation, Al(s)->Al(g)", "unit": "kJ mol-1 (per mole atoms)", "constant": 326 },
    "mp_Na": { "name": "melting point, sodium", "unit": "K", "constant": 371 },
    "mp_Mg": { "name": "melting point, magnesium", "unit": "K", "constant": 923 },
    "mp_Al": { "name": "melting point, aluminium", "unit": "K", "constant": 933 },
    "n_e": {
      "name": "free-electron number density, sodium", "unit": "m^-3", "constant": 2.5e28,
      "role": "narrated_constant", "note": "derived n = rho*N_A*z/M at 298 K, rho=0.968 g/cm3, M=22.99 g/mol, z=1 (S3 formula surface, this document Duty 2)"
    },
    "mu_Na": {
      "name": "electron mobility, sodium (derived, not measured directly)", "unit": "m^2 V^-1 s^-1", "constant": 5.3e-3,
      "role": "engine_constant", "note": "mu = sigma/(n e), sigma_Na ~2.1e7 S/m, n=2.5e28 m^-3 (this document Duty 3)"
    },
    "field": {
      "name": "applied field control (dimensionless slider)", "unit": "dimensionless", "min": 0, "max": 1, "default": 0,
      "role": "taught_variable", "note": "S4 core; maps LINEARLY to E = 0 to 0.04 V/m"
    },
    "E_field": {
      "name": "electric field inside the block", "unit": "V/m", "min": 0, "max": 0.04,
      "role": "derived", "derived": "field * 0.04"
    },
    "v_d": {
      "name": "electron drift speed", "unit": "m/s", "min": 0, "max": 2.12e-4,
      "role": "computed_output", "derived": "mu_Na * E_field",
      "note": "CORRECTED full-scale value 2.1e-4 m/s (architect proposal of 1e-4 was an arithmetic slip, this document Duty 3). Live v_d=0 m/s exactly at field=0, never dash/stale."
    },
    "shift": {
      "name": "layer-shift offset control (dimensionless slider)", "unit": "dimensionless (fraction of one site)", "min": 0, "max": 1, "default": 0,
      "role": "taught_variable", "note": "S5 core"
    },
    "like_contacts": {
      "name": "like-charge nearest-neighbour contacts CREATED by the shift and left unscreened (D-7 definition)",
      "unit": "count (dimensionless integer)", "min": 0, "max": 0,
      "role": "computed_output", "note": "reads 0 at EVERY offset on the metal (sea screens every contact, before and after) -- design expectation, see Section 11"
    },
    "valence": {
      "name": "free electrons per atom control (S6 stepped slider)", "unit": "dimensionless (integer)", "min": 1, "max": 3, "default": 1, "step": 1,
      "role": "taught_variable", "note": "stepped 1->2->3, never fractional; sea count = 35 x valence dots (35 sites x BS_MAX_SEA-bounded); core charge label steps +1->+2->+3"
    }
  },
  "formulas": {
    "E_field": "field * 0.04   (reference only -- renderer computes natively)",
    "v_d": "mu_Na * E_field",
    "atomisation_trend": "y = dH_at (Na 107, Mg 146, Al 326) plotted against x = valence (1,2,3) -- no fit line authored, points only",
    "sigma_charge_balance_S2": "sum(q_site) + sum(q_released_dot) = 0 at every instant of the release ramp",
    "sigma_charge_balance_S6": "sum(q_core) = 35 x valence ; sum(q_sea) = -(35 x valence) ; net 0 at every step"
  },
  "computed_outputs": {
    "S1": { "a_pm": 429.0, "nn_check_pm": 371.5, "sphere_2r_pm": 372 },
    "S3": { "n_e": 2.5e28 },
    "S4": { "v_d_at_field_0": 0, "v_d_at_field_1": 2.12e-4, "mu_Na": 5.3e-3, "E_at_field_1": 0.04 },
    "S5": { "like_contacts": 0 },
    "S6": { "dH_at_by_valence": { "1": 107, "2": 146, "3": 326 } }
  },
  "constraints": [
    "atoms of each element: LHS = RHS in the S2 half-equation Na -> Na+ + e- (no state symbols -- see Section 5)",
    "total charge: sum(q_sites) + sum(q_released dots) = 0 at every instant of S2's ionisation ramp, and sum(q_core) + sum(q_sea) = 0 at every S6 valence step",
    "n(free electrons released per site) = BS_VALENCE[species] exactly -- never a fractional electron",
    "v_d = mu_Na * E_field holds at every field-slider position, including exactly v_d = 0 m/s (live) at field = 0",
    "like_contacts reads 0 at every shift offset on this cation-only, sea-screened lattice -- any nonzero reading is a build defect (D-7), never a tuning target",
    "dH_at is monotonic in valence (Na < Mg < Al) on the S6 trend axis -- non-monotonicity is a ratification failure, not a display choice",
    "neutral-metal and ionic radii on this scenario share ONE linear-in-pm scale (BS_RADIUS_PM) -- never the legibility-compressed MG_ELEMENTS scale"
  ]
}
```

---

## 5 · Balanced-equation ledger (chemistry variant — RHR N/A)

**S2 — `Na → Na⁺ + e⁻`.**

| | LHS | RHS |
|---|---|---|
| Na atoms | 1 | 1 (as Na⁺) |
| charge | 0 | (+1) + (−1) = 0 |

Atom count and charge both balance. **State-symbol convention, RATIFIED:** no `(s)`/`(g)` on this
half-equation. This is the correct convention for this SPECIFIC pedagogical object, and the reasoning
is worth stating precisely (it is a genuinely different equation from the one that usually DOES carry
state symbols in this topic): the standard **ionisation-energy** half-equation is
`M(g) → M⁺(g) + e⁻`, written with `(g)` on both sides because ionisation energy is BY DEFINITION the
energy for that specific gas-phase process. S2's equation is not that process — it is the electron
LEAVING one atomic core to join the shared sea, entirely INSIDE the solid, with no phase change and no
atom leaving the lattice. Writing `(s)` on the left and something on the right would either be wrong
(the "product" is not molecular NaCl(s) or discrete gas-phase Na⁺(g); it is a lattice site that has
changed its charge state, still `(s)`) or misleadingly borrow the ionisation-energy convention for a
different physical process. **The no-state-symbol convention is therefore correct, not merely
economical — it deliberately avoids implying this is the ionisation-energy reaction.** IGCSE/A-level
textbooks that show this equation in a metallic-bonding context also typically omit state symbols for
the same reason. Ratified as authored.

Oxidation-number labels: not used (per skeleton) — the stepping charge superscripts (`Na` → `Na⁺`) on
the site labels already carry the same information more legibly for a lattice-wide process; redundant
oxidation-number text would violate the one-instrument discipline (D-3). Confirmed correct.

**S6 — Σq balance across the valence ladder.** At each step v ∈ {1, 2, 3} on the 35-site block:

```
sum(q_core)  = 35 x (+v)  =  +35, +70, +105   (v = 1, 2, 3)
sum(q_sea)   = 35 x (-v)  =  -35, -70, -105
net charge   = 0 at every step
```

The engine must hold this exactly at every step (never an intermediate frame with a mismatched sea
count) — this is the S6 analog of gate assertion 2, extended to the stepped-valence case, and it is the
number every one of C-4's consumer requirements (§4 of the skeleton) rests on.

---

## 6 · Per-state motion timeline + control spec (Rule 31) — FINAL, with computed player-clock timing

**Player clock, as shipped (`src/scripts/build_review_site.ts:887-889, 1142-1168`):**
`WPM = 150`, default `rate = 0.9`, `words = chars/5.5`, `ms = (words / (WPM*rate)) * 60000`, floored at
`MIN_SENTENCE_MS = 1400`, sentences separated by `GAP_MS = 280`. `duration = ceil(max(speech_total_ms,
last_relevant_cue_ms) / 1000)`. Every timeline below is computed from the FINAL narration strings in
§7, not the skeleton's word-count estimates — this supersedes the skeleton's "design envelope" durations
per its own explicit instruction ("json-author re-derives from FINAL narration strings; these are
design envelopes"). Differences from the envelope are noted per state; none breach the 25–55 word
budget, the ≤25% static-tail budget, or any authored cue floor (`eye_capture_ms`, `grow`/`release`/
`shift`/`valence_step` end times) — every duration below sits AT OR ABOVE its state's binding cue.

### S1 — `pack-the-lattice` · core · LIVE today (E3a)
- **Motion:** `lattice.grow_at_ms:3000, grow_duration_ms:14000` (ends 17000) — sites grow centre-outward,
  nothing shown moves after. `reveal_hold` declared (jiggle-only tail).
- **Controls:** none.
- **Computed timeline (3 sentences, 42 words):** [0–4606] "Every solid metal..." → `lattice`;
  [4886–12078] "Watch sodium atoms settle into rows..." → `lattice`; [12358–19469] "The block keeps
  this exact pattern..." → `lattice`. Speech ends 19469 ms; grow ends 17000 ms (inside speech).
  **Duration = 20 s.** Tail after grow-end: (20000−17000)/20000 = **15%** — within the 25% budget,
  matches the skeleton's own figure exactly.
- `eye_capture_ms: 17600` — inside the 20 s duration. ✓

### S2 — `release-to-sea` · core · E3b-blocked (C-10 + C-2)
- **Motion:** `sea.release_at_ms:4000, release_duration_ms:15000` (ends 19000); terminal parked pose
  19000→end. `reveal_hold` declared.
- **Controls:** none.
- **Computed timeline (4 sentences, 45 words):** [0–3152] "Sodium holds its outer electron weakly." →
  `lattice`; [3432–8765] "Watch: every atom..." → `electrons`; [9045–15914] "The freed electrons stay
  inside the metal..." → `electrons`; [16194–20719] "Every core is now a positive ion..." → `lattice`.
  Speech ends 20719 ms; release ends 19000 ms (inside speech). **Duration = 21 s** (the skeleton's
  design envelope was 24 s; my finalized narration is slightly shorter — both are valid, this is the
  number to ship). Tail: (21000−19000)/21000 = **9.5%** — comfortably inside budget.
- `eye_capture_ms: 19600` — inside the 21 s duration. ✓

### S3 — `sea-roam` · core · E3b-blocked (C-2 + C-9) · PRIMARY AHA
- **Motion:** opens on S2's terminal parked pose, holds ~3 s, then roam disperses; tagged electron
  (`electron_tag`) crosses several cells from ~4000 ms. Self-sustaining — no `reveal_hold` needed.
- **Controls:** none.
- **Computed timeline (4 sentences, 50 words):** [0–1859] "Now watch one electron." → `electron_tag`;
  [2139–10058] "It moves right across the block..." → `electron_tag`; [10338–16237] "Every free
  electron does this..." → `electrons`; [16517–22901] "The pull between the positive cores..." →
  `lattice`. **Duration = 23 s.**
- `eye_capture_ms: 15600` — inside the 23 s duration. ✓ Formula surface `n(e⁻) ≈ 2.5 × 10²⁸ per m³`
  (ratified, §2).

### S4 — `bias-the-swarm` · core · E3b-blocked · misconception pivot 2
- **Motion:** `field_at_ms:5000`; arrows fade in ~900 ms, bias appears ~800 ms after (Rule 32a gap).
  Random roam continues under the bias.
- **Controls:** `{id:'field', min_ring:'core'}` — drag-seize required.
- **Computed timeline (4 sentences, 55 words — AT the ceiling, do not add):** [0–7111] "Connect this
  metal in a circuit and an electric field appears through the block at once." → `arrows`;
  [7391–16361] "Watch the sea: the same random motion, plus a very slow net drift along the field —
  the counter shows how slow." → `electrons`; [16641–20439] "That slow shared drift is the electric
  current." → `electrons`; [20719–25406] "The same free electrons also carry heat through the metal."
  → `electrons`. Speech ends 25406 ms; field cue (5000+900+800≈6700) sits well inside the first
  sentence's window. **Duration = 26 s.**
- `eye_capture_ms: 13000` — inside the 26 s duration. ✓ HUD `drift` = corrected model (§3): 0 → 2.1×10⁻⁴
  m/s. `misconception_watch` stays qualitative — no digit hand-quoted.
- **Word-count note:** the finalized text is trimmed by one word ("whole block" → "block") from the
  architect's draft specifically to land at exactly 55 words, respecting the stated ceiling (the
  architect's own draft measured 56 by a strict word count — see §12).

### S5 — `layer-shift-hold` ⇄ · core · E3b-blocked · SUPPORTING AHA
- **Motion:** `shift.at_ms:6000, duration_ms:3000` (slide completes 9000); re-seat settle beat
  ~10000–12500. Sea roams through both halves throughout.
- **Controls:** `{id:'shift', min_ring:'core'}` — drag-seize required.
- **Computed timeline (4 sentences, 52 words):** [0–6303] "In salt, this same one-site slide lined up
  like charges and the crystal split." → `layer`; [6583–8846] "Slide the metal's top layer." →
  `layer`; [9126–15267] "The counter stays at zero: the sea sits between the cores at every position."
  → `electrons`; [15547–23385] "The layer settles into the same pattern one row over, so metals can be
  bent and drawn into wires." → `layer`. Slide (6000–9000) sits inside sentence 2's window; re-seat
  (10000–12500) sits inside sentence 3's window — both visible well before the sentence that narrates
  the payoff (sentence 4, starting 15547) finishes. **Duration = 24 s.**
- `eye_capture_ms: 13200` — after the re-seat (12500), inside the 24 s duration. ✓ HUD `like_contacts`
  reads 0 live at every offset (D-7; §5, §11).

### S6 — `valence-ladder` · **extended** · E3b-blocked
- **Motion:** `sea.valence_from:1, valence_at_ms:5000, valence_step_ms:4500` → steps land at 5000 and
  9500 ms exactly as specified.
- **Controls:** `{id:'valence', min_ring:'ext'}` — drag-seize required.
- **Computed timeline (5 sentences, 52 words) — glow map RECONCILED against the final 5-sentence split
  (the skeleton's 4-beat grouping does not divide evenly across these exact sentence boundaries; the
  semantic order step→charges→sea→chart is preserved, every sentence gets an explicit binding per the
  E5 "unbindable sentence" lesson):**
  [0–7273] "Keep the same lattice and change one thing: how many electrons each atom gives to the
  sea." → `lattice`; [7553–9654] "One, then two, then three." → `lattice` (covers the first step at
  5000 and approaches the second step at 9500); [9934–13732] "Each step also raises the charge on
  every core." → `lattice`; [14012–20719] "The chart shows the energy needed to pull one mole of atoms
  out: it climbs steeply." → `trend`; [20999–24070] "More shared electrons, stronger metal." →
  `electrons` (closing beat — the sea is the visual referent of "more shared electrons," giving the
  thickening sea its own focal moment, satisfying Rule 32e). **Duration = 25 s.** Both valence steps
  (5000, 9500) land inside the first two sentences' windows, well before the state ends.
- `eye_capture_ms: 12500` — inside the 25 s duration. ✓ **D-3 one-instrument:** no HUD echo of ΔH_at —
  the trend chart is the only ΔH surface, per the skeleton (confirmed correct, unchanged).

### S7 — Explore · core · `interaction_complete` · E3b-blocked
- 0/open narration; idle auto-sweep keeps it moving (Rule 37). Controls `{metal,core}` `{field,core}`
  `{shift,core}` `{valence,ext}`. HUD `['lattice_a','drift','melting_point',{id:'atomisation',
  min_ring:'ext'}]`. Duration 30 (free-run) — unchanged from skeleton, no narration to re-time.
  **Mg/Al drift-mobility caveat per §3's supplementary finding applies here** — flagged, not fixed.

---

## 7 · Final narration (`text_en`) — word counts + full computed timelines

*(consolidated from §6 for a single reference; every string below is FINAL, ready for json_author.)*

| State | Words | Speech total (ms) | Binding cue (ms) | Duration (s) |
|---|---|---|---|---|
| S1 | 42 | 19,469 | grow ends 17,000 | 20 |
| S2 | 45 | 20,719 | release ends 19,000 | 21 |
| S3 | 50 | 22,901 | (self-sustaining) | 23 |
| S4 | 55 | 25,406 | field cue ≈6,700 | 26 |
| S5 | 52 | 23,385 | re-seat ends 12,500 | 24 |
| S6 | 52 | 24,070 | 2nd valence step 9,500 | 25 |
| S7 | 0/open | — | — | 30 |

**S1:** "Every solid metal is atoms packed in a repeating pattern. Watch sodium atoms settle into rows
— each new atom sits at the same spacing as the last. The block keeps this exact pattern in every
direction, through the whole piece of metal." *(⚑ "settle into rows" — founder-fixed string, unchanged
per instruction.)*

**S2:** "Sodium holds its outer electron weakly. Watch: every atom in the block releases that one
electron at once. The freed electrons stay inside the metal — for now each sits beside the ion it
left. Every core is now a positive ion, smaller than its atom."

**S3:** "Now watch one electron. It moves right across the block, past core after core, and it never
goes back to the atom it left. Every free electron does this — one shared sea through the whole
crystal. The pull between the positive cores and this negative sea is the metallic bond."

**S4 (55 words, at the ceiling — trimmed one word from the draft, see §12):** "Connect this metal in a
circuit and an electric field appears through the block at once. Watch the sea: the same random
motion, plus a very slow net drift along the field — the counter shows how slow. That slow shared
drift is the electric current. The same free electrons also carry heat through the metal."

**S5:** "In salt, this same one-site slide lined up like charges and the crystal split. Slide the
metal's top layer. The counter stays at zero: the sea sits between the cores at every position. The
layer settles into the same pattern one row over, so metals can be bent and drawn into wires."

**S6:** "Keep the same lattice and change one thing: how many electrons each atom gives to the sea.
One, then two, then three. Each step also raises the charge on every core. The chart shows the energy
needed to pull one mole of atoms out: it climbs steeply. More shared electrons, stronger metal." *(⚑
"stronger hold" in the delta cue/annotation only, not this sentence — founder-fixed, unchanged.)*

**S7:** none (explore).

**Rule 41 check:** no idiom, metaphor or personification in any sentence above — the sea does not
"want," "know," or "choose"; "sea of electrons" is the standard chemistry term and stays (per the
skeleton's explicit carve-out). **Rule 35 check:** anchors are a metal spoon (bends) and a charger
cable (S4) — universal, no country-specific reference in any string.

---

## 8 · Notation + dialect ladder (Rule 38c/38d)

- **Core/extended states (S1–S6):** arithmetic and ratio forms only — the S3 electron-density number
  is presented as a stated value (`n ≈ 2.5×10²⁸ m⁻³`), never derived on-screen via logarithms or
  calculus; the S4 drift model (`v_d = μE`) is a bare product, no calculus form (`dv/dt`) anywhere.
  This concept has **no advanced ring** (per the skeleton — the only cut is core vs. core+extended), so
  there is no ring for calculus/log notation to live in even if it were needed — and it is not needed:
  every quantity taught (a, ΔH_at, n, v_d, like_contacts, valence) is arithmetic.
- **Dual-label at first appearance:** "molar mass M" is not used anywhere in this concept (mole
  arithmetic is not part of the taught content — n(e⁻) is a NUMBER DENSITY, not moles); no dual-label
  is owed. "Enthalpy of atomisation ΔH_at" is introduced once, in S6's chart y-axis label
  ("ΔH of atomisation / kJ·mol⁻¹"), and never abbreviated to a bare symbol elsewhere without the words
  — confirmed compliant.
- **IUPAC-first naming:** "sodium," "magnesium," "aluminium" throughout — no common-name variant exists
  for these elements to disambiguate. Confirmed compliant, nothing to add.

---

## 9 · Constraint callouts (unit conversions, scale factors — engine-facing)

- **No unit conversion is hidden from the student anywhere in this concept** — a, ΔH_at, mp, n, v_d
  are all shown in their natural SI-adjacent unit (pm, kJ/mol, K, m⁻³, m/s) with no slider secretly
  operating in a different unit than its readout (unlike, e.g., a °C slider driving a K formula
  elsewhere in the fleet — not the case here).
- **`field` and `shift` are DIMENSIONLESS 0–1 sliders that map internally to a physical quantity** (E in
  V/m; offset in fraction-of-one-site) — the mapping is engine-internal (§3, §5) and the student never
  sees the raw 0–1 number, only the derived readout (`v_d`, `like_contacts`). This is the correct
  pattern (Rule 34b — value-only HUD) and needs no further conversion disclosure.
- **`valence` is a STEPPED integer control (1, 2, 3)** — fractional values are physically meaningless
  (a fractional electron per atom does not exist) and must never be interpolated; the engine's stepped
  closed-form cue (C-4) is the correct mechanism, confirmed.
- **Particle-count scale factor, declared:** the sea shows 35–105 dots (C-2's `BS_MAX_SEA = 105`
  ceiling) standing in for a physical count of order 10²⁸ per cubic metre of real metal. The narration's
  "each dot stands for very many electrons" clause is the required honest framing (§2) — carried
  forward unchanged, confirmed correct. Above ~40 dots the swarm is explicitly TEXTURE, not a counted
  set (D-4) — no counted claim in this concept's narration or `misconception_watch` ever depends on
  counting dots on screen.

---

## 10 · Assessment stems + coverage map

| # | Stem | States | Board coverage |
|---|---|---|---|
| 1 | Describe metallic bonding in terms of positive cores and a delocalised electron sea | S1–S3 | All boards (foundational; CBSE thin/qualitative per the NCERT caveat) |
| 2 | Explain why metals conduct electricity in the solid state while ionic solids do not | S4 (cross-link `ionic_bonding` S8) | IGCSE, A-level, IB full; CBSE partial |
| 3 | Explain why metals are malleable while ionic crystals are brittle | S5 (cross-link `ionic_bonding` S6) | IGCSE (chapter-opener contrast), A-level, IB full; CBSE partial |
| 4 | *(extended)* Explain why the enthalpy of atomisation rises from sodium to magnesium to aluminium | S6 | A-level, IB, AP (quantitative bond-strength boards); not examined at CBSE's current depth |
| 5 | State what happens to each atom's outer electron when a metal forms | S2 | All boards (foundational) |
| 6 | Explain why metals are good conductors of heat, not only electricity | S4 | IGCSE, A-level, IB full; CBSE partial |
| 7 | Define malleable and ductile, and explain both using the layer-slide model | S5 | IGCSE, A-level, IB, AP full; CBSE partial |

(`curriculum_tags` on every non-CBSE cell above carry `needs_teacher_verification: true` per the
skeleton's §13 i-3 — unchanged, this table does not close that gap, it only maps stems to it.)

---

## 11 · Drill-down cluster phrasings (5 per cluster, genuine student voice, no Hinglish)

### S3 — `who_shares_the_electrons`
1. "wait so who owns the electrons now, nobody?"
2. "if no atom owns the electron why doesn't it just float away out of the metal completely"
3. "is the sea the same for every atom or does each atom still have its own electron somewhere"
4. "so which atom does this one electron belong to right now"
5. "how do the electrons know not to leave the metal completely"

### S3 — `sea_vs_covalent_sharing`
1. "isn't this just a really big covalent bond then"
2. "in a covalent bond two atoms share a pair, so why is this called sharing when so many atoms are involved"
3. "what's the actual difference between this sea and a shared pair in a molecule"
4. "why don't we draw dot-and-cross diagrams for metals the way we do for covalent bonds"
5. "if sharing electrons is sharing electrons, why does this get a completely different name"

### S3 — `why_sharing_lowers_energy`
1. "why does spreading the electrons out actually make the metal more stable"
2. "what's actually pulling the atoms together — the electrons or the positive cores"
3. "why doesn't the metal just fall apart if the electrons aren't attached to anything"
4. "does more electrons in the sea always mean a stronger pull, or does it depend on something else"
5. "why does the atom losing an electron make the whole block more stable instead of less stable"

### S4 — `drift_vs_random_speed`
1. "if the electrons move that fast randomly, why does the current still seem slow"
2. "so the electrons aren't really moving forward much at all, are they"
3. "why does the light turn on straight away if the electrons themselves crawl along that slowly"
4. "what's the difference between an electron's own speed and the current's speed"
5. "does the field make the electrons move faster overall, or does it just push them one direction"

### S4 — `why_the_field_acts_everywhere`
1. "how does every electron get pushed at the same time if the wire is really long"
2. "does the field travel down the wire, or does it just appear everywhere at once"
3. "why does flipping the switch affect electrons at the far end of the wire instantly"
4. "is the field the same thing as the electrons moving, or something separate"
5. "why don't the electrons closer to the battery start moving before the ones further away"

### S4 — `metal_vs_molten_salt_conduction`
1. "salt conducts when it's melted, so what's different about a metal conducting while it's still solid"
2. "why does solid salt not conduct electricity but solid metal does"
3. "are the moving charges in molten salt the same kind of thing as the electrons in a metal"
4. "if ions can carry current in molten salt why can't electrons do that in solid salt"
5. "so is it electrons that move in a metal but whole ions that move in melted salt"

### S5 — `bend_vs_shatter`
1. "why does bending a metal not break any bonds but bending salt does"
2. "if the layers slide in both the metal and the ionic solid, why does only one of them break"
3. "what actually stops the metal from splitting apart when the layer slides over"
4. "does the metal lose any bonds at all when you bend it"
5. "why does salt care so much about which charges end up next to each other but the metal doesn't"

### S5 — `why_layers_slide_easily`
1. "why can the layers move past each other so easily in a metal"
2. "doesn't sliding a whole layer of atoms take a huge amount of energy"
3. "why doesn't the metal resist the layers sliding the way I'd expect a solid to"
4. "is there something that holds the layers to one fixed direction, or can they slide any way"
5. "why doesn't the sea get in the way when the layer moves"

### S5 — `why_alloys_are_harder`
1. "if pure metal bends so easily, why does mixing in another metal make it harder"
2. "how does adding an atom of a different size stop the layers from sliding"
3. "why does steel resist bending more than pure iron does"
4. "does the alloy still have a sea of electrons, or does that change"
5. "why do only some elements make good alloys and not others"

---

## 12 · STOP-AND-REPORT — tolerances, named explicitly

**`like_contacts` = 0 → 0 (S5).** This is a derived INTEGER COUNT, not a measurement. **There is no
such thing as a "rounding difference" on an integer count.** Tolerance: **exactly 0 at every offset, on
every frame, for every value of the `shift` slider.** Any reading ≥1, at any offset, on any frame, is a
STOP-AND-REPORT — never a tuning exercise, never a "close enough." (This is the exact failure mode D-7
was written to prevent: a naive like-neighbour count reads 8→8 on this very lattice before the
screening correction — a wrong metric that would look like a small bug is actually the whole lesson
inverted.)

**ΔH_at ladder (S6).** Tolerance: a shipped set of values that stays **within ±5 kJ·mol⁻¹ of this
document's ratified 107 / 146 / 326** (§1's stated literature spread) is a rounding/source difference,
not a defect — ship it as-is. **Two specific failure conditions ARE a STOP-AND-REPORT, never a tuning
exercise:** (a) any ordering other than strictly Na < Mg < Al, and (b) either step (Mg−Na or Al−Mg)
shrinking to within the ±5 kJ·mol⁻¹ noise band (i.e., a step under ~10 kJ·mol⁻¹) — because a small or
reversed step reproduces EXACTLY the melting-point failure the skeleton already had to fix once (a 1%
rise contradicting the "stronger metal" claim). A large, clearly-ordered gap is the whole point of this
state; anything smaller than noise is not evidence of anything.

**§1's a_pm geometry.** No tolerance needed to state — verified exactly against the ratified table
(§1), all three metals' spheres touch within sub-percent rounding. If a FUTURE a_pm value changes
(e.g., a more precise X-ray figure lands), the geometry check must be re-run — flagged as a standing
instruction, not a currently-open item.

**§3's drift correction.** Not a tolerance question — it was a straightforward arithmetic error
(v_d = μE with the stated μ and E_max unambiguously gives 2.1×10⁻⁴, not 1×10⁻⁴). Corrected in §3, §4,
§6, §7. No further tolerance discussion needed; ship the corrected digit.

---

## 13 · Self-review (chemistry_author)

- [x] Duty 1: `BS_METALS`, all 15 cells ratified with named conventions; geometry re-solved and
      confirmed against the ratified a_pm for ALL THREE metals; no correction needed.
- [x] Duty 2: n derived (not quoted), matches proposal exactly; room-temperature-vs-5K discrepancy with
      some published tables explained, not hidden.
- [x] Duty 3: μ(Na) derived via σ=neμ, matches proposal; slider→E mapping ratified with a physical
      reasonableness check against an ordinary copper wire; **full-scale v_d CORRECTED** from the
      skeleton's ≈1×10⁻⁴ to the arithmetically-correct ≈2.1×10⁻⁴ m/s; HUD zero-behaviour spec carried
      forward; Mg/Al mobility gap flagged as supplementary, not formally ratified.
- [x] Every state's chemical-rigour check done, conservation first: S2 atom+charge balance verified,
      state-symbol convention justified (not merely repeated); S6 Σq balance across the valence ladder
      stated as an engine invariant.
- [x] Quantity ledger complete (§4 JSON + narrative units throughout).
- [x] Per-state motion timeline + control spec computed from FINAL narration against the shipped
      player-clock formula, not the skeleton's word-count estimates; every duration checked against its
      binding cue (grow/release/reseat/valence-step/eye_capture_ms) and the ≤25% static-tail budget
      where it applies (S1, S2).
- [x] All 7 states' narration finalized; S4 trimmed to exactly 55 words (the stated ceiling); no digit
      hand-quoted anywhere that the HUD derives on the same canvas; Rule 41/Rule 35 checked per string.
- [x] Notation + dialect ladder: no ring exists below what's needed; no log/calculus notation anywhere
      in this arithmetic-only concept; nothing to flag.
- [x] 45 drill-down phrases (5 × 9 clusters), genuine student voice, no Hinglish, no textbook prose.
- [x] Constraint callouts: no hidden unit conversions; scale-factor convention re-confirmed; stepped
      (never fractional) valence control re-confirmed.
- [x] Assessment stems mapped to states + board coverage (7 stems, matches skeleton §6(f) exactly).
- [x] STOP-AND-REPORT tolerances stated explicitly for both design-expectation numbers (`like_contacts`
      0→0: zero tolerance, it's a count; ΔH_at ladder: ±5 kJ/mol source-spread tolerance, but zero
      tolerance on ordering or step-size collapse).
- [x] `physics_engine_config` block authored (documentary, per the Desk-1 precedent — renderer computes
      natively).
- [x] Engine bug queue: ATTEMPTED, blocked (no `.env.local`; known chemistry false-all-clear) —
      re-flagged to quality_auditor, unchanged from the skeleton.
- [x] Source check line present (NCERT index for scope, Exemplar for beliefs only; nothing imported).
- [x] `aha_moment` chemistry check: PRIMARY (S3, "no electron is attached to any one atom") and
      SUPPORTING (S5, "the sea sits between the cores at every position") are both chemically true and
      both states, as choreographed, actually demonstrate them (tagged-electron crossing for S3;
      live-zero counter + re-seat for S5).

---

## Summary of corrections + open items (for the return value)

**Corrected away from the architect's proposal (ONE digit, plus ONE word-count trim):**
1. **S4 full-scale drift speed:** skeleton stated `v_d ≈ 1×10⁻⁴ m/s` at `field=1.0`; the CORRECT value
   from the same ratified μ=5.3×10⁻³ m² V⁻¹ s⁻¹ and E_max=0.04 V/m is **v_d ≈ 2.1×10⁻⁴ m/s** (a
   straightforward arithmetic slip in the dispatch brief, corrected throughout this document).
2. **S4 narration:** trimmed by one word ("the whole block" → "the block") to land at exactly the
   stated 55-word ceiling rather than 56.

**Ratified UNCHANGED (no correction needed):** all 15 `BS_METALS` cells (a_pm, valence, ΔH_at, mp_K for
Na/Mg/Al); the bcc/fcc/hcp geometry solve; n(e⁻) ≈ 2.5×10²⁸ m⁻³; μ(Na) ≈ 5.3×10⁻³ m² V⁻¹ s⁻¹; the
field→E slider mapping (0→0.04 V/m); the S2 no-state-symbol convention; the S6 Σq-balance invariant.

**Flagged as UNRATIFIED / supplementary, not formally part of this dispatch's three duties:** S7's
explore-state drift readout for magnesium and aluminium, if the surgeon reuses sodium's μ uniformly
across the metal picker, will be physically low by roughly 3–4× (still correct order of magnitude,
10⁻⁴ m/s, so the qualitative lesson survives) — a per-metal μ table (Mg ≈1.6×10⁻³, Al ≈1.2×10⁻³
m² V⁻¹ s⁻¹, both derived here by the same method but not independently cross-checked) is offered as a
low-cost fix, or the alternative is an explicit "calibrated for sodium, illustrative for Mg/Al" caveat
in S7. Not a blocker for S4, which is sodium-only and fully ratified.
