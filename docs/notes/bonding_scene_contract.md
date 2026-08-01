# `bonding_scene` — the AUTHORITATIVE JSON contract (E1 + E2 as shipped)

**Source: the E1 (`12cac9a`) and E2 (`096e9c1`) dispatch reports, master.** These supersede the
literal guesses in `docs/CHEMISTRY_PHASE0_BONDING.md` — the doc is the *design*, this file is what
the renderer actually reads. Where they disagree, this file wins.

Renderer: `src/lib/renderers/field_3d_renderer.ts`, `scenario_type: 'bonding_scene'` (~`:45798–46990`).
Gate: `npm run check:bonding-scene`. Validator meta: `src/lib/validators/visual/deriveStateMeta.ts`.

---

## Per-state block

```
state.bonding_scene = {
  placement: 'free' | 'lattice',
  mode: 'assemble'|'transfer'|'dipole_sum'|'approach_link'|'network'|'compare'
      | 'lattice_grow'|'coordination'|'layer_shift'|'electron_sea'|'drift'|'melt'
      | 'explore',                       // 13, CLOSED
                                         // LIVE NOW (E1+E2): assemble · dipole_sum ·
                                         //   approach_link · network · compare · explore
                                         // E3 (NOT YET BUILT): transfer · lattice_grow ·
                                         //   coordination · layer_shift · electron_sea ·
                                         //   drift · melt   -- authoring one is a no-op

  units: [{ id, species, at:[x,y,z], orient:'auto'|[az_deg,el_deg], charge }],
  focal_unit: <int, default 0>,          // arrows / δ labels / electrons attach here
  species: <species>,                    // shorthand when `units` is omitted
  angle_deg: <number>,                   // overrides the molecule's equilibrium angle
  separation: <number>, separation_axis: [x,y,z],
  spin_rate: <rad/s about +y>, spin_start_ms,
  camera: { az, el, dist },              // overrides the SOLVED camera — AVOID

  dipole:   { show_bond_arrows, show_resultant, show_charges, show_charge_values, arrow_scale },
  electrons:{ show: 'none'|'shells'|'pair_glyph', pair_shift: 0..1 },
  thermal:  { T_K, jiggle_scale },
  links:    { enabled, delta_min:{donor,acceptor}, form_pm, break_pm, min_pm,
              angle_window_deg, show_count, pm_per_unit },
  trend:    { show, x_label, y_label, points:[{label,x,y}], extrapolate_from:[...] },

  show_atom_labels: <bool, default true>,
  show_hud, hud_lines: [...],            // CLOSED; RENDERED NOW:
                                         //   'mu' 'delta_chi' 'radius_pm' 'valence'
                                         //   'links' 'links_per_unit' 'bp'
  show_formula, formula,                 // ONE surface, Rule 34b
  controls: [{ id, min_ring }] | [id],   // bare id ⇒ core
  static_readouts: [...],

  // cue times the frozen-pin deriver reads:
  //   spin_start_ms · arrows_at_ms · resultant_at_ms · charges_at_ms
  //   pair_shift_at_ms (+_duration_ms) · approach_at_ms (+_duration_ms)
  //   compare_at_ms (+_duration_ms) · assemble_at_ms (+_duration_ms)
  // other numeric knobs: approach_from · unit_spacing · count_max · label_units · delta_units

  compare_species: <species>,            // ⚠ LIVE (E2, verified at :49287) — the scripted swap
                                         // TARGET. REQUIRES mode:'compare'; it is ignored under
                                         // dipole_sum. Pairs with compare_at_ms/_duration_ms.

  // PARSED + PASSED THROUGH, no behaviour until E3:
  groups, lattice, sea, ions, transfer, shift
}
```

⚠ **Correction 2026-08-01:** an earlier revision of this file listed `compare_species` as
parse-only-until-E3. **That was wrong** — E2 shipped it (`field_3d_renderer.ts:49287`), gated on
`mode === "compare"`. Verified against renderer source, not against the Phase-0 doc.

## Two capability gaps CONFIRMED against renderer source (blocking, routed to E1c)

Found by the `bond_polarity_dipole_moment` skeleton and verified by grep, not taken on report:

1. **No scripted angle ramp.** There is no `angle_at_ms` / `angle_from` / `angle_ramp_ms` anywhere
   in the `bonding_scene` region; `angle_deg` is a **static override only**. The concept's PRIMARY
   aha (S4: water opens linear, then bends to 104.5° while the resultant grows) cannot be authored.
   There is no acceptable fallback — opening at equilibrium with only a slider leaves the state with
   no scripted motion, failing both the headless harness and Rule 31's no-static-state.
2. **No lone-pair lobe.** The `mgFrame` lone-pair machinery belongs to `molecular_geometry` and is
   not drawn by `bonding_scene`. S7's narration points at NH₃'s lone pair; either E1c draws it or
   the wording becomes "the top of the pyramid" — **never narrate what is not drawn.**

**Do not work around either one in JSON.** Rule 40: engine changes land on master separately.

**`config.field_lines.opacity` must exist** (an object, even `{}`) — `createTubeLine` reads it
unconditionally. The fleet's blank-scene trap.

**`render_annotations: true`** or `scene_composition` annotations are a silent no-op (they satisfy
Rule 19 with content that cannot exist on screen). Give each `at_ms`/`until_ms`.

## Closed enums

- **controls (13):** `species · molecule · ligand · angle · temperature · count · separation · spin ·
  shift · field · valence · ion_pair · metal`. All 13 rows exist in `#bsc_sliders`; each has a
  `bsc_<id>_row` (Rule 39f discovery — ⚙ works for free).
- **glow keys (10):** `units · central · links · arrows · resultant · charges · electrons · lattice ·
  layer · neighbours`. A non-keyed `glow_focal` dims the whole scene with no focal lit (scar #33).
- **species:** molecules `H2O H2S H2Se H2Te NH3 NF3 CH4 CCl4 CHCl3 CO2 HF HCl HBr HI BF3` · ions
  `Na+ K+ Li+ Mg2+ Ca2+ Al3+ Cl- F- O2-` · atoms `H Li Be B C N O F Na Mg Al P S Cl K Ca Br Se I Te`.

## Numbers you must author against

**Scale: 1 scene unit = 48 pm** (O–H 96 pm drawn at `BS_BOND_LEN` 2.0). A linear hydrogen bond is
2.0 + 3.75 = **5.75 scene units O···O**. Author `units[].at` on that scale.

**Derived per-atom charges** (the link criterion thresholds on these — no element whitelist):

| species | donor H δ+ | acceptor δ− | links? |
|---|---|---|---|
| H₂O | +0.319 | O **−0.638** | yes |
| NH₃ | +0.162 | N −0.485 | yes |
| HF | +0.547 | F −0.547 | yes |
| HCl | +0.206 | Cl −0.206 | no — acceptor fails |
| H₂S | +0.036 | S −0.071 | no — both fail |
| H₂Se | +0.030 | Se −0.060 | no |
| H₂Te | −0.003 | Te +0.003 | no — no donor at all |

Shipped thresholds `donor 0.15 / acceptor 0.30`; emerged acceptor set is exactly **{N, O, F}**.
⚠ 0.319 is the **donor H's** charge, not the oxygen's — an acceptor threshold authored at 0.319
would be wrong by 2×.

**Dipole model** — published bond moments summed vectorially in the `mgFrame`; `BS_LONE_PAIR_D`
ships at **0** because tabulated bond moments are empirically fitted and already absorb the lone-pair
contribution. **The NH₃/NF₃ contrast is a DIRECTION reversal, not an extra vector** — narration must
say so. Model output: HF/HCl/HBr/HI exact · H₂O 1.849 · H₂S 0.945 · H₂Se 0.617 · H₂Te 0.198 ·
NH₃ 1.462 · NF₃ 0.223 · every symmetric species < 1.2e-15 D.
⚠ **CHCl₃ is the one miss: model 1.760 D vs literature 1.04 D** — bond moments are non-additive
across the chloromethanes. A per-molecule override hook exists
(`MG_MOLECULES.CHCl3.bond_moments = { Cl: 0.74 }`); ratifying it is a data edit, not an engine one.

## Authoring traps recorded by E1/E2

1. **`points[].label` must equal the species key** or the `bp` HUD line will not resolve. Labels are
   plain ASCII (`H2S`) — the engine composes `H₂S`.
2. **Mode strings mostly select the solved camera**; behaviour is driven by which blocks are authored
   (`links` / `trend` / `approach_at_ms` / `pair_shift_at_ms`). Do not author `camera` on a counting
   state — the solved cameras exist because a ligand can swing onto the central atom mid-spin.
3. **`controls: ['separation']` alongside a scripted pull is safe** — the slider and the scripted beat
   are joined both ways (re-seed on entry, per-frame sync until a trusted drag seizes).
4. **Link density is an AUTHORING variable.** A loose cubic 30-water box gives ≈1.07 links/molecule;
   the designed ≈3.5 needs tighter `at` spacing and near-tetrahedral `orient` values. **If you see a
   low count, fix the geometry — do not conclude the thresholds are wrong.**
5. The count slider past `units.length` places extras by index-derived shell packing, so growing the
   count never moves a unit already on screen. `count_max` is the explicit override.
6. Explore states force a slow spin when nothing is authored and nothing is dragged, so the sandbox
   moves for the headless harness (no frozen tail).

## Registration

Chemistry registers at **site #1 only** — `src/data/concepts/chemistry/<id>.json`. Sites 2/3/4/7/8
are FORBIDDEN for chemistry ids (Gate 8b is all-or-nothing). Validate with
`npm run validate:chemistry`; `npm run validate:concepts` must never see these files.
