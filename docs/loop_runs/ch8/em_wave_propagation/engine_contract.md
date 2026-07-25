# ENGINE → JSON CONTRACT — `em_wave_propagation` scenario

> Consolidated by the loop orchestrator from the field3d-surgeon's E1 (commit `961fe87`) and
> E2 (commit `6a0fa7f`) reports. **This is the authoritative surface `json_author` writes against.**
> Engine work for this concept is COMPLETE — no further increment is planned.

**`scenario_type`:** `"em_wave_propagation"` · **per-state config block key:** `em_wave`
**Renderer:** `src/lib/renderers/field_3d_renderer.ts` · **meta:** `src/lib/validators/visual/deriveStateMeta.ts`

---

## Hard requirement — `field_lines` block

A `field_lines` block **MUST** be present in `field_3d_config` — shared init reads `config.field_lines.opacity`
via `createTubeLine`. Author e.g.:

```json
"field_lines": { "count": 0, "opacity": 0.8 }
```

(The propagation axis itself is a plain cylinder, deliberately NOT `createTubeLine`, so the axis never
hard-depends on this block — but other shared init still does.)

---

## Scene objects (stable IDs, Rule 27)

`emw_axis` · `emw_source` · `emw_e_train` · `emw_b_train` · `emw_receiver` · `emw_motes` ·
`emw_relay` · `emw_triad` · `emw_ghostb` · `emw_cursor` · `emw_gates` · `emw_slab` · `emw_formula` · `emw_hud`

`visible_elements` may list `emw_axis emw_source emw_e_train emw_b_train emw_receiver emw_motes` etc.
(or be empty for all) — `applyEmWavePropagationState`'s showMap is authoritative regardless.

---

## Per-state `em_wave` keys

### Core (E1)
| Key | Type / default | Notes |
|---|---|---|
| `wave_mode` | `'pulse' \| 'train'` | S1/S2/S6 = `pulse`; S3/S7/S8/S9/S11 = `train` |
| `nu` | MHz, default `100` | source frequency |
| `E0` | V/m, default `120` | field strength |
| `n` | default `1.5` | refractive index; S10 only |
| `source_on` | bool, default `true` | |
| `source_off_at_ms` | ms | S2 switch-open cue |
| `needle_kick_at_ms` | ms | S1 reveal pin |
| `show_receiver` | bool, default `true` | |
| `show_motes` + `motes_vanish_at_ms` | | S3 |
| `show_nochange` + `nochange_at_ms` | | S3 "no change" chip |
| `show_hud`, `show_lambda`, `show_nu` | bool | HUD lines |
| `show_formula` + `formula` | bool + string | ONE Cambria-Math Unicode string |
| `interactive` | `true` on S11 ONLY | explore-state discriminator; drives `deriveStateMeta`'s hold intent |
| `controls` | subset of `['nu','E0','n','src']` | S6 `nu` · S7/S8 `E0` · S10 `n` · S11 `nu,E0,src` |

### Per-state add-ons (E2)
| Key | Notes |
|---|---|
| **Scene toggles** | `show_relay`, `show_triad`, `show_ghostb`, `show_cursor`, `show_gates`, `show_slab` |
| **DOM toggles** | `show_cursor_ro`, `show_tanks`, `show_ghost_tag`, `show_crest`, `show_stopwatch`, `show_hud`; HUD lines `show_lambda`, `show_nu`, `show_e0`, `show_b0`, `show_ratio` |
| **S2** | `relay_at_ms`, `relay_period_ms` (default `2000` = full E→B→E cycle; 1000 per hand-off) |
| **S4** | `camera_out_at_ms`, `camera_back_at_ms`, `sweep_at_ms`, `trough_at_ms` |
| **S5** | `ghost_tag_text` (default `"✗ expected: B peaks 90° after E"`), `ghost_dissolve_at_ms` |
| **S6** | `gate_a_at_ms` (≈4500), `gate_b_at_ms` (≈7000), `formula_dock: true`, `v_dock_at_ms` (≈9000), `const_dock_at_ms` (≈13500), `match_at_ms` (≈15500), plus `show_formula` + `formula` as a presence string. **The dock CONTENT is engine-driven** — the two-line surface + MATCH chip is emitted internally, so do not try to author both lines. |
| **S9** | `formula_chain: true`, `link1_at_ms`, `link2_at_ms`, `link3_at_ms`, `assembled_at_ms`; `show_formula` + `formula` presence string; author `show_triad` / `show_cursor` as the recalls |
| **S10** | `show_slab`, `show_crest`, `slab_slide_at_ms`, `bunch_at_ms`, `n` (default 1.5), `controls: ["n"]`. Slab geometry is fixed at scene x ∈ [−1.6, +1.6] (physics 3–7 m); phase uses the cumulative piecewise form, so there is no boundary jump. |

---

## Glow enum (CLOSED — a non-keyed value silently dims the whole scene with nothing bright)

`source · relay · motes · triad · cursor · gates · ratio · tanks · formula · slab · receiver`

**Live scene objects:** `source · motes · receiver · relay · triad · cursor · gates · slab`.
**DOM-only, deliberate clean no-ops:** `ratio · tanks · formula` — these are valid authored values but are
intentionally absent from `EMW_GLOW_ELS` to avoid the total-dim-with-nothing-bright scar (#33); they carry
their own DOM prominence instead.

---

## Engine-side behaviors json_author should NOT re-author

- **FL1 — S10 clock un-pin:** the `emw_n_row` trusted-drag seize sets `freezeAtTime = null`, so S10's
  `manual_click` clock un-pins and the n-drag drives live continuous crest-bunching. Already wired.
- **Physics:** phase `x − v·t`, `v = c/n`; `E = E₀·sin(k(x−vt))` on ŷ; `B = E/c` on ẑ; `ω = 2πν`
  region-independent; `c = 2.998×10⁸`. All values are closed-form functions of state-local ms
  (Rule 26/36) — byte-stable under `SET_TIME_FREEZE`.
- **S6 dock composition** (see the S6 row above).
- **Receiver gauge semantics:** shows the arriving PEAK amplitude (steady `120 V/m` for a train,
  ramping 0→120→0 for a pulse — that IS the S1 needle-kick-after-delay); the needle tracks the signed
  instantaneous value.
- **Slider rows** (built once, shown/hidden per state via `controls`): `emw_freq_row` ν 50–200 MHz step 5
  default 100 · `emw_e0_row` 40–200 V/m step 5 default 120 · `emw_n_row` n 1.0–2.0 step 0.05 default 1.5 ·
  `emw_src_row` source toggle. All four have trusted-drag seize.

---

## Open verification items carried to Checkpoint B

1. **FL4 crest value.** E2's smoke proved the twin tanks render an IDENTICAL string (`identical=true`) but
   sampled `6.31×10⁻⁸` — a near-crest instant, not a true crest. The locked CREST display is
   **`6.38×10⁻⁸ J/m³`**. Checkpoint B must confirm both tanks read exactly that at a genuine crest;
   identity alone is not the full requirement. (E2's own scar candidate
   `field3d_equal_quantity_pair_needs_shared_exact_constant_not_rounded_display` is about precisely this
   divergence risk — u_B must derive from the EXACT `c = 1/√(μ₀ε₀)`, never a rounded display `c`.)
2. **S3/S5/S8 wrong-expectation cues must PAINT on the `__frozen.png`** — the recurrence check for the
   still-OPEN fleet-wide scar `field3d_scene_composition_annotation_silent_noop`.
3. **S6 `overlayCollisions = []`** at end pose (Checkpoint-A finding F3 / skeleton §10(h) zone map).
4. **n = 2.0 crest-spacing legibility** — read via THE EYE DENSE frames, not the frozen end-frame alone
   (physics_block §6d).
5. **`emw_receiver` on S10** must read POST-slab (x > 7.0 m, vacuum) values only, never an in-slab reading,
   so the "no E/B ratio surfaced" claim holds mechanically (physics_block §3.10).
6. **`emw_formula` font path** — confirm it rides the Cambria-Math-serif special-cased path, not the generic
   13px-monospace `#formula_overlay` fallback (OPEN scar `field3d_formula_overlay_generic_not_cambria_math`).
