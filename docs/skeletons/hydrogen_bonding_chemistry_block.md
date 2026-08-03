# CHEMISTRY BLOCK — `hydrogen_bonding`

Authored by `chemistry_author` · 2026-08-02 · branch `feat/chemistry-polarity-hbonding` · Desk 1,
concept 2 of 2. Companion to `docs/skeletons/hydrogen_bonding_skeleton.md` (Checkpoint A cycle 1,
`DESIGN_FIX`, applied; the S6 engine block E2b landed on master today, unblocking the concept). Same
desk, same `bonding_scene` scenario as `bond_polarity_dipole_moment` — this block is written at the
sibling's depth, reconciles every placeholder cue in the skeleton's §3 against the actual final
narration, and solves the one problem the skeleton could not: how S6 narrates a 298→600 K ramp
without lying about what water does at 600 K.

**Engine bug queue consulted live** (`query_engine_bug_queue.ts`, `.env.local` in this worktree):
`hydrogen_bonding` (6 rows), `--owner alex:physics_author --open` (10 rows), `--owner
alex:json_author --open` (23 rows). Rows load-bearing on this build:
- The 4 `hydrogen_bonding`-tagged `[DIRECTIVE/OPEN]` rows (`phase0_union_table_asserted…`,
  `closed_enum_cannot_name_a_substance…`, `derivation_principle_applied_to_one_beat…`,
  `explore_controls_not_ring_gated…`) are **`alex:architect`-owned** and already discharged by the
  skeleton itself (§0b union walked; `explore_units` diffed against the union — F-E; every explore
  control below carries `min_ring:'core'`; S4's absent link and S7's gap are both derived, never
  authored — D-2). No action needed here beyond confirming compliance (done, per-state table below).
- `hysteretic_state_cannot_be_latched_under_a_time_pin` **[FIXED]** — this is exactly the pattern
  EQ-2's averaging fix reuses (bounded lookback of closed-form samples); it is satisfied by
  construction, not by anything I author.
- `pooled_mesh_lookup_is_linear_scan…` **[MODERATE/FIXED]** — performance only, no authoring action.
- `teach_reveal_synced_to_narration` / `teach_show_quantity_live_when_named` — every cue in §3 below
  was retimed against the FINAL narration's own per-sentence cumulative word timing (2.8 words/sec,
  the fleet constant), not left at the skeleton's placeholder ms values.
- `narration_outruns_choreography` (`FAIL if choreo_end_ms < 0.7 × est_speech_ms`) — checked
  explicitly for all 7 guided states. Six clear it comfortably after retiming; **S4 clears it by only
  450 ms**, and the reason is structural — flagged below rather than faked.
- `state_duration_field_overpadded_vs_reveal` — every state's declared `dur` checked against
  `content_ms = max(reveal_end_ms, est_speech_ms)`; all seven land under the 1.5× ceiling.
- `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` — every guided state's
  claim here is a property of ONE object (a bond's charge, a link, a comparison result), never a
  two-sided relation needing both sides lit — a single `glow_focal` is the right call throughout;
  S7 correctly authors none (F-F, no keyed focal exists for the trend panel).
- `prose_annotation_encroaches_delta_cue_band` / `shipped_concept_authors_annotations_without_the_flag_that_renders_them`
  — every delta cue stays ≤5 words (FIXED table), `render_annotations: true` is authored on every
  state, and no annotation text duplicates prose outside the caption band.

**Source check line:** Consulted the NCERT Chemistry Class 11 Ch.4 §4.9 chapter index to confirm
scope (hydrogen bonding, criteria, the boiling-point anomaly). Consulted NCERT Exemplar Ch.4 for the
two misconception beliefs only (§4 of the skeleton). No teaching method, worked example, or figure
imported. All narration and anchors are first-principles.

---

## 0. What changed since the skeleton — E2b landed, S6 is now buildable

`field3d-surgeon` shipped `docs/notes/bonding_scene_E2b-engine-fix-spec.md` on master today:
**EQ-1** (scripted `thermal.T_from`/`T_at_ms`/`T_ramp_ms`, closed-form, drag-seized), **EQ-2** (a
640 ms time-averaged `links_per_unit` — `'links'` stays instantaneous), **EQ-3** (`network:{…,
fit:true}` — the solved `network` camera now sees molecular units, so the 30-unit cluster's radius
12.84 no longer bleeds past the frame; nothing for me to author, `camera` stays forbidden everywhere).
This block authors S6 against EQ-1+EQ-2's shipped behaviour, using the exact numbers given in the
dispatch prompt (298 K: mean 3.40, range 3.19–3.59 · 600 K: mean 2.85, range 2.59–3.16), which
supersede Appendix A's pre-E2b raw-instant table.

---

## 1. Quantity declarations (`physics_engine_config.variables`)

Same departure the sibling block noted: `bonding_scene` is not PCPL — `μ`-style quantities here
(`delta_chi`, per-atom charge, `links_per_unit`, `bp`) are computed natively inside the renderer, not
via `PM_interpolate`. `formulas` below is reference documentation for json_author/quality_auditor, not
runtime expression strings.

```json
{
  "variables": {
    "chi_H": { "name": "electronegativity of hydrogen", "unit": "Pauling scale (dimensionless)", "constant": 2.20 },
    "chi_O": { "name": "electronegativity of oxygen",   "unit": "Pauling scale (dimensionless)", "constant": 3.44 },
    "chi_S": { "name": "electronegativity of sulfur",   "unit": "Pauling scale (dimensionless)", "constant": 2.58 },
    "delta_chi": {
      "name": "electronegativity difference between H and the bonded atom",
      "unit": "Pauling scale (dimensionless)", "min": 0, "max": 2.0,
      "derived": "abs(chi_H - chi_X)", "role": "read_only_hud"
    },
    "donor_charge": {
      "name": "partial positive charge on the donor hydrogen",
      "unit": "elementary charge e (dimensionless fraction)", "min": -0.6, "max": 0.6,
      "role": "engine_constant", "note": "H2O +0.319 · H2S +0.036 · H2Se +0.030 · H2Te −0.003 (no donor). Donor threshold 0.15."
    },
    "acceptor_charge": {
      "name": "partial negative charge on the acceptor atom",
      "unit": "elementary charge e (dimensionless fraction)", "min": -0.7, "max": 0.7,
      "role": "engine_constant", "note": "H2O O −0.638 · H2S S −0.071 · H2Se Se −0.060 · H2Te Te +0.003. Acceptor threshold 0.30 ⇒ {N,O,F} emerges, no whitelist."
    },
    "E_hbond": {
      "name": "hydrogen-bond dissociation energy (tabulated mean, published)",
      "unit": "kJ·mol⁻¹", "constant": 20, "role": "narrated_constant",
      "note": "S3 formula surface. Convention: tabulated MEAN BOND ENTHALPY, the same convention as E_OH below. Sits inside NCERT §4.9's own 10–40 kJ·mol⁻¹ band for hydrogen bonds."
    },
    "E_OH": {
      "name": "O−H covalent bond dissociation energy (tabulated mean, published)",
      "unit": "kJ·mol⁻¹", "constant": 464, "role": "narrated_constant"
    },
    "H_link_pm": {
      "name": "H···O hydrogen-bond distance",
      "unit": "pm", "min": 90, "max": 432,
      "role": "engine_constant", "note": "forms ≤210 pm, breaks ≥260 pm (hysteresis); measured linear bond 180.0 pm at 179.9° at the authored 5.75-unit separation"
    },
    "links_per_unit": {
      "name": "mean hydrogen-bond links per molecule (mean degree, 2L/N)",
      "unit": "links per molecule (dimensionless)", "min": 0, "max": 4,
      "role": "computed_output", "note": "298 K mean 3.40 (range 3.19–3.59, 640 ms averaged) · 600 K mean 2.85 (range 2.59–3.16). NEVER multiply this figure directly by E_hbond — see the F9 guard in §6."
    },
    "T_K": {
      "name": "temperature",
      "unit": "kelvin (K)", "min": 100, "max": 600, "default": 298, "step": 1,
      "role": "taught_variable", "note": "live on S6 (scripted ramp 298→600, drag-seized) and S8 (all core); static 298 elsewhere"
    },
    "count": {
      "name": "number of water molecules in the network",
      "unit": "molecules (dimensionless)", "min": 2, "max": 30, "default": 30,
      "role": "taught_variable", "note": "live on S5 and S8 only; centre-outward growth, shrinking never moves a survivor"
    },
    "boiling_point": {
      "name": "boiling point of the displayed species",
      "unit": "kelvin (K)", "role": "computed_output",
      "note": "H2O 373 · H2S 213 · H2Se 232 · H2Te 271; the S7 trend LEAST-SQUARES-extrapolates 180.4 K and derives the +193 K gap — neither is authored"
    }
  },
  "formulas": {
    "delta_chi": "|chi_H - chi_X|  (reference only — renderer computes natively)",
    "hbond_link_criterion": "forms when H···O ≤ 210 pm AND donor_charge ≥ 0.15 AND acceptor_charge ≥ 0.30 AND D–H···A angle within the 40° window; breaks at H···O ≥ 260 pm (hysteresis)",
    "links_per_unit": "2 * L / N  (L = total links, N = molecule count — the mean DEGREE, not links owned per molecule; see F9)",
    "boiling_trend": "least-squares fit of (period_x, boiling_point_y) over {H2S, H2Se, H2Te}; water's y-value minus the fitted line's value at water's x = the gap"
  },
  "computed_outputs": {
    "S1": { "delta_chi_H2O": 1.24 },
    "S3": { "E_hbond": 20, "E_OH": 464, "ratio": "≈1:23" },
    "S4": { "delta_chi_H2O": 1.24, "delta_chi_H2S": 0.38, "donor_H2O": 0.319, "acceptor_H2O": -0.638, "donor_H2S": 0.036, "acceptor_H2S": -0.071 },
    "S5": { "links_per_unit_298K_mean": 3.40, "links_per_unit_298K_range": [3.19, 3.59] },
    "S6": { "links_per_unit_600K_mean": 2.85, "links_per_unit_600K_range": [2.59, 3.16], "jiggle_amplitude_ratio": 1.42 },
    "S7": { "H2S_bp": 213, "H2Se_bp": 232, "H2Te_bp": 271, "extrapolated_water_bp": 180.4, "actual_water_bp": 373, "gap_K": 193 }
  },
  "constraints": [
    "the O-H covalent bond length is invariant under every authored motion in this concept — no intra-unit bond-break machinery exists anywhere in bonding_scene (check:bonding-scene §9(b) asserts this)",
    "the hydrogen-bond link criterion depends only on donor/acceptor partial-charge thresholds (donor ≥0.15, acceptor ≥0.30) crossed by whatever species is on screen — never a hardcoded element whitelist",
    "a hydrogen bond forms at H···O ≤ 210 pm and breaks at H···O ≥ 260 pm — hysteresis, not a single threshold",
    "links_per_unit = 2L/N is the mean DEGREE; only half that figure (≈1.70 at 298 K) is 'owned' per molecule — never multiply links_per_unit directly by E_hbond (F9 guard, §6)",
    "electronegativity differences and derived partial charges are fixed per species (Pauling scale) — independent of the temperature or count sliders",
    "no chemical reaction, state symbol, oxidation number, or mole-scale factor appears anywhere in this concept — see §2"
  ]
}
```

---

## 2. Balanced-equation ledger — N/A, stated explicitly

No reaction, no state symbols, no oxidation numbers, no charge-balance table apply to this concept.
Every species shown (H₂O, H₂S, H₂Se, H₂Te) is a single stable molecule, never transformed into
another substance on-screen — S4's H₂O→H₂S is a scripted scene-wide **substitution** for teaching
purposes, narrated as "swap," never "react." The conservation-discipline analog for this concept is
the **link grammar + hysteresis + charge-threshold discipline** captured in `constraints` above: a
sign flip on a partial-charge table entry, or a threshold moved off its published value, would render
a normal-looking link while teaching the reverse of the truth, or would smuggle a whitelist where a
threshold belongs — exactly the `closed_enum_cannot_name_a_substance_the_design_teaches` and
`derivation_principle_applied_to_one_beat_but_not_its_sibling` scars the engine bug queue already
carries for this concept. This is a real correctness discipline even without a reaction.

---

## 3. S3's energy figures — ratified, calibration shown

**Task item 1.** The formula surface reads `E(H···O) ≈ 20 kJ·mol⁻¹ ≪ E(O−H) = 464 kJ·mol⁻¹`.

**Convention named:** both figures are **tabulated mean bond enthalpies** — the standard textbook
convention for both covalent and intermolecular bond strengths, the same convention used for every
other bond-moment/bond-energy figure in this bonding wave (the sibling's `BS_BOND_MOMENT_D` table is
the dipole analog of this same "tabulated, published, not re-derived" discipline). 464 kJ·mol⁻¹ is the
standard tabulated mean O−H bond enthalpy (water); 20 kJ·mol⁻¹ is a representative, rounded value for
the water···water hydrogen bond, chosen because it sits cleanly inside **NCERT §4.9's own stated
10–40 kJ·mol⁻¹ range** for hydrogen-bond strength (already asserted in the skeleton's S3 authoring
detail — I am ratifying that existing claim, not introducing a new NCERT figure).

**Calibration shown, not asserted:** `464 ÷ 20 = 23.2`, which rounds to the FIXED design's own stated
ratio, **≈1:23**. ✅ Ratified — the two numbers on the formula surface are internally consistent with
the ratio the design names, and both individually sit inside their respective published conventions.

---

## 4. Per-state motion timeline + control spec (Rule 31)

`words / 2.8 wps → ms/word ≈ 357.14`, the fleet's estimated-speech constant (matches
`narration_outruns_choreography`'s own probe). Every cue below was retimed from the skeleton's
placeholder ms values against the FINAL narration text's own cumulative word timing — this is the
retiming exercise the role explicitly asks for.

### S1 — "Bare positive hydrogen" (core · `pair-shift` ⇄ declared cross-concept repeat · 41 words)

Narration sentence boundaries (cumulative word → ms): "…hydrogen" (10w, 3571ms) · "…1.24." (15w,
5357ms) · "…oxygen." (21w, 7500ms) · "…delta plus." (37w, 13214ms) · "…delta minus." (41w, 14643ms).

| cue | ms | synced to |
|---|---|---|
| `pair_shift_at_ms` | 5700 | as "Watch the pair slide" begins (sentence 2 opens 5357ms) |
| `pair_shift_duration_ms` | 1800 (ends 7500) | finishes exactly as sentence 2 ends ("…oxygen.") |
| `charges_at_ms` | 12857 | as "delta plus" is spoken (readable ≥5s gap after the pair-shift settles, Rule 32a) |

Last cue 12857ms. **`eye_capture_ms: 15200`** (≥12857+2000). Declared `dur: 16s`; est. speech
41w→14643ms; `content_ms=14643`; `16000/14643=1.09×` — no overpad. `narration_outruns_choreography`:
`0.7×14643=10250`; last cue 12857 ≥10250 ✓ (margin 2607ms — this RETIMES the skeleton's original
placeholder, which pinned `charges_at_ms` at 7500 and would have failed the probe by 2750ms).

Controls: none (core, watch-only). Glow focal: `electrons` (0–7500ms) → `charges` (12857ms→).

**Final narration (41 words):** "Oxygen pulls the shared electron pair much harder than hydrogen —
the electronegativity difference is 1.24. Watch the pair slide toward oxygen. Hydrogen has no other
electrons, so what remains is an almost bare, positive proton: delta plus. Oxygen becomes delta
minus."

### S2 — "Second molecule attaches" (core · `approach-and-link` · 45 words)

Sentence boundaries: "…molecule." (12w, 4286ms) · "…molecule." (36w, 12857ms) · "…forms." (40w,
14286ms) · "…bond." (45w, 16071ms).

| cue | ms | synced to |
|---|---|---|
| `approach_at_ms` | 1500 | as "The second molecule turns" begins (start of sentence 2) |
| `approach_duration_ms` | 10500 (ends 12000) | spans the whole settling description |

Units + `separation_axis` = Appendix A1 verbatim (`hb_donor`/`hb_acceptor`, `orient [190,69]`/`[180,0]`
— measured direction cosines 1.0000 both). `approach_from: 12.0`, `separation: 5.75` (unchanged from
the skeleton). **Snap timing, computed:** `form_pm 210 → H···O 210pm → O···O 306pm = 6.375 units`;
fraction of travel `= (12.0−6.375)/(12.0−5.75) = 0.9`; snap at `1500 + 0.9×10500 = 10950ms` — inside
sentence 2's own window (4286–12857ms), lands as the molecule is still visibly settling into its final
180 pm bond. (Retimed later than the word "180 picometres" itself, ~9286ms, by design — see the
margin note below; the alternative sync-exact timing fails the probe outright.)

Last cue 12000ms. **`eye_capture_ms: 14200`** (link formed, settled at 276 pm). Declared `dur: 16s`;
est. speech 45w→16071ms; `content_ms=16071`; `16000/16071=0.996×` — essentially exact parity (the
skeleton's own 45-word target at 16s is already tuned to the 2.8 wps constant). `narration_outruns_choreography`:
`0.7×16071=11250`; last cue 12000 ≥11250 ✓ (margin 750ms — this retimes the original `approach_at_ms
3000/duration 2600`, which snapped at 5100ms and would have failed the probe by ~6150ms).

Controls: none (core, watch-only — the FIXED §0b table shows S2 controls = `—`). Glow focal: `units`
(0–10950ms) → `links` (10950ms→).

**Final narration (45 words):** "The delta-plus hydrogen attracts the delta-minus oxygen of a second
water molecule. The second molecule turns and settles in a straight line: hydrogen to oxygen, 180
picometres — almost twice the 96-picometre O–H bond inside each molecule. A dashed link forms. This
is a hydrogen bond."

### S3 — "Weak link breaks first" (core · `pull-to-break` · MISCONCEPTION BEAT 1 · 45 words)

Home pose = S2's end. Sentence boundaries: "…apart." (5w, 1786ms) · "…unchanged." (20w, 7143ms) ·
"…464." (37w, 13214ms) · "…weaker." (45w, 16071ms).

**F6 applied: `separation: 8.0`, not 9.0** (the separation slider's default max is 8, joined every
frame to the scripted pull — a 9.0 destination would clamp the thumb while the scene sat past it, the
D-3 one-instrument scar).

| cue | ms | synced to |
|---|---|---|
| `approach_at_ms` | 1000 | right after "Pull the two molecules apart" (sentence 1 ends 1786ms) |
| `approach_duration_ms` | 11500 (ends 12500) | spans almost the whole state — the pull is a continuous separation, not a quick tug |

**Break timing, recomputed against F6's 8.0 destination** (Appendix A's 5800 ms figure was measured
against the SUPERSEDED 9.0 destination and no longer applies): `break_pm 260 → H···O 260pm → O···O
356pm = 7.41667 units`; fraction of travel `= (7.41667−5.75)/(8.0−5.75) = 0.740741`; break at
`1000 + 0.740741×11500 = 9518ms` — lands just after "…unchanged." (7143ms) finishes and well before
"…464." (13214ms), i.e. the link visibly fails DURING the narrator's explanation of the energy scale,
both O–H sticks holding pose throughout (contract-guaranteed, no intra-unit break machinery).

**Formula surface introduced here**, persists S3–S6 and S8, hidden S7 (Rule 34d): `E(H···O) ≈
20 kJ·mol⁻¹ ≪ E(O−H) = 464 kJ·mol⁻¹` (calibration in §3 above).

Last cue 12500ms. **`eye_capture_ms: 14700`** (post-break: link gone, sticks intact, formula surface
up). Declared `dur: 18s`; est. speech 45w→16071ms; `content_ms=16071`; `18000/16071=1.12×` — no
overpad. `narration_outruns_choreography`: `0.7×16071=11250`; last cue 12500 ≥11250 ✓ (margin 1250ms
— retimes the original 4000/3500 placeholder, which ended at 7500ms and would have failed by 3750ms).

Controls: `[{id:'separation', min_ring:'core'}]`, drag-seized (contract trap 3). Glow focal: `links`
throughout.

**Final narration (45 words):** "Pull the two molecules apart. The dashed link stretches and breaks
at about 260 picometres — both O–H bonds are unchanged. A hydrogen bond takes about 20 kilojoules per
mole to break; a covalent O–H bond takes 464. This link is more than twenty times weaker."

### S4 — "Sulfur is not negative enough" (core · `species-swap` · 43 words · ⚠ FLAGGED, see below)

Home pose: two linked H₂O (S2's end, `separation: 5.75`, no approach cues). Sentence boundaries:
"…sulfur." (4w, 1429ms) · "…it." (26w, 9286ms) · "…forms." (29w, 10357ms) · "…fluorine." (43w, 15357ms).

| cue | ms | synced to |
|---|---|---|
| `compare_at_ms` | 1200 | right as "Swap" is spoken |
| `compare_duration_ms` | 10000 (ends 11200) | a slow scene-wide morph — see reasoning below |

Scene-wide swap per F-B (`:53695`) — both units follow the base species, no per-unit overrides. Under
a linear-interpolation assumption (charge magnitude sliding from 0.638→0.071 over the transition,
**not independently measured — flagged for THE EYE to confirm at Checkpoint B**), the acceptor charge
crosses the 0.30 threshold at fraction `(0.638−0.30)/(0.638−0.071)=0.596` of the way through, i.e.
around `1200+0.596×10000≈7160ms` — well before "No link forms" is spoken (9643ms), a comfortable
Rule-32a gap. The swap fully settles (Δχ 1.24→0.38) around `11200ms`, right as the final generalizing
sentence begins (10714ms) — chosen deliberately slow (matching the sibling's own S7 precedent for a
transformation state) rather than a quick cut, so the Δχ HUD is seen ticking down live as "the small
charges fall with it" is spoken (Rule 33d).

`dipole: {show_charges:true, show_charge_values:true}` — the values ARE the lesson (H +0.319/O
−0.638 → H +0.036/S −0.071; ⚠ 0.319 is the donor H's charge, never oxygen's). `hud_lines:['delta_chi']`.

**Final narration (43 words):** "Swap oxygen for sulfur. Sulfur pulls only slightly harder than
hydrogen — the electronegativity difference falls from 1.24 to 0.38, and the small charges fall with
it. No link forms. A hydrogen bond needs a strongly negative partner: in practice nitrogen, oxygen, or
fluorine."

> **⚠ EDITORIAL NOTE — dispatching session, 2026-08-02.** The chemistry_author's reply was delivered
> in two parts and a fragment of ~1–2 sentences was lost in transit at exactly this point: the
> opening of the S4 `narration_outruns_choreography` flag paragraph. Nothing else is missing; the
> text resumes verbatim below, mid-sentence. From the author's own self-review and the surviving
> text, the lost opening established that **S4's last cue is 11200 ms against a
> `0.7 × 15357 = 10750 ms` threshold — a PASS with only a 450 ms margin**, because the final
> generalising sentence ("A hydrogen bond needs a strongly negative partner…") plays over a settled
> picture. `quality_auditor` should re-derive this figure independently rather than rely on the
> reconstruction.

needs a strongly negative partner…") describing WHY, not new pixels. Unlike the sibling's S4 (which
had a physically-motivated spin available to fill the gap — S4 here has no equivalent capability
without inventing motion, which Rule 40 forbids), there is no legitimate fix short of an engine ask,
and the margin (450ms) is close enough that the state does not read as visually dead — the Δχ HUD
value simply sits at its settled 0.38 for the closing sentence, exactly as S3's formula surface sits
static through its own closing sentence. Recorded, not silently patched.

Controls: `[{id:'species', min_ring:'core'}]`, drag-seized (`:53457`). Glow focal: `charges`
throughout.

### S5 — "Links keep re-forming" (core · `network-flicker` · 45 words)

30-unit diamond network = Appendix A2 verbatim (coordinates + orients, unchanged). `thermal: {T_K:298,
jiggle_scale:0.9}` — no ramp. `links:{enabled:true}`. `hud_lines:['links_per_unit']` — **now the EQ-2
averaged value**: mean **3.40**, range **3.19–3.59** (the task-authoritative smoothed figures,
superseding Appendix A's pre-E2b raw-instant 3.38/3.13–3.73).

No scripted at_ms cues — the flicker is continuous and self-sustaining from state entry through the
whole narration. `narration_outruns_choreography` does not bind here by construction, exactly as the
sibling's S5 spin state: there is no completion point after which the picture goes static — the
network is jiggling and links are forming/breaking every frame of the state's life.

**`eye_capture_ms: 8200`** (Appendix A's representative pin — chosen as nearest to the state's own
mean; unaffected by EQ-2 since the averaged reading at a state held at constant T=298 for its whole
life converges to the same mean regardless of exactly when it's sampled, once the 640ms lookback
window is filled, which it is by 8200ms). Declared `dur: 16s`; est. speech 45w→16071ms;
`content_ms=16071`; `16000/16071=0.996×` — parity.

Controls: `[{id:'count', min_ring:'core'}]`. Glow focal: `links` throughout.

### S6 — "Heat breaks links only" (core · `heat-the-network` · MISCONCEPTION BEAT 2 · **44 words, drafted fresh**)

**⚠ The honesty problem, solved explicitly (task item 2).** The sim shows a hydrogen-bonded network
still present at 600 K, but real water at 1 atm boils at 373 K, so 600 K is superheated steam with
essentially no hydrogen-bond network — and the shipped model is isochoric (fixed positions + √T
jiggle; molecules never separate or diffuse). **The fix: the narration never states the number 600 in
speech at all.** It says "Heat the network" — an instruction to the model — and lets the temperature
slider/HUD carry the actual K value live, exactly the way S1's HUD honestly reports Δχ=1.24 without
narrating "at 298 kelvin water is…". Every remaining sentence states only what the engine actually
draws: the jiggle amplitude visibly increasing, the averaged link count visibly falling, and — the
engine-guaranteed fact that carries the misconception confrontation — not one O–H stick ever moving.

**Why this is honest, spelled out:**
1. The narration never asserts that 600 K is a real, stable configuration of liquid water (it isn't).
   It never says "this is water at 600 kelvin" — it says "heat the network," a manipulation of the
   model, and the number lives only on the live slider/HUD instrument.
2. Every spoken claim is a claim about pixels the engine actually computes: `jiggle_scale × √(T/298)`
   amplitude rising (measured ×1.42 at the endpoints), `links_per_unit` (now EQ-2-averaged, so the
   claimed decline is real signal, not flicker noise) falling from a mean of 3.40 to a mean of 2.85,
   and the O–H bond length being invariant (engine-guaranteed: no intra-unit stick-break machinery
   exists anywhere in `bonding_scene`, asserted by `check:bonding-scene` §9(b)).
3. The narration never narrates a phase change, boiling, or vaporisation at S6 — that claim, and the
   real single correct number for it (373 K), is reserved for S7, where it is spoken honestly and
   accurately. S6 and S7 are never conflated.
4. It states a relationship (heat weakens hydrogen bonds, never covalent bonds) that stays true of
   this isochoric network at ANY T_K the model renders — it does not depend on 600 K representing a
   real phase of water, so nothing narrated becomes false even though 600 K itself is not a
   physically realizable liquid-water state.

**Final narration (44 words):** "Heat the network. Every molecule jiggles harder, and the average
number of links each one holds falls — from about 3.4 down to about 2.8. Not one O–H bond breaks.
Heat weakens the hydrogen bonds between molecules; it never touches the covalent bonds inside them."

Sentence boundaries: "…network." (3w, 1071ms) · "…2.8." (24w, 8571ms) · "…breaks." (29w, 10357ms) ·
"…them." (44w, 15714ms).

| cue | ms | synced to |
|---|---|---|
| `T_from` | 298 | destination-ramp start value |
| `T_K` | 600 | destination |
| `T_at_ms` | 900 | right after "Heat the network" is spoken |
| `T_ramp_ms` | 11000 (ends 11900) | spans almost the entire state — heating is continuous through the whole explanation, not a jump |
| `jiggle_scale` | 0.9 | unchanged from S5, per the σ/π one-instrument discipline — ONLY `thermal.T_K` changes between S5 and S6 |

Controls: `[{id:'temperature', min_ring:'core'}]` — the slider row IS the temperature instrument
(Rule 33d + D-3: it already tracks the live ramped `T_K` per frame, `:54592–54593`), drag-seized to
the ramp (`PM_bscTempDragged`, EQ-1 req 3). `hud_lines:['links_per_unit']` — **EQ-2 averaged**: falls
live from mean 3.40/range 3.19–3.59 toward mean 2.85/range 2.59–3.16. `links:{enabled:true}`. Formula
surface persists (the 20 vs 464 kJ·mol⁻¹ scale IS the explanation for why heat can break links but not
bonds).

Last cue (ramp end) 11900ms; register candidate (E2b item 5) `= 900+11000+600 = 12500`.
**`eye_capture_ms: 14200`** (≥11900+2000 and ≥12500 — well past the ramp end plus EQ-2's own 640ms
lookback, so it reads the fully-settled 600 K average, not a mid-ramp transient). Declared `dur:
18s`; est. speech 44w→15714ms; `content_ms=max(12500,15714)=15714`; `18000/15714=1.15×` — no overpad.
`narration_outruns_choreography`: `0.7×15714=11000`; last cue 11900 ≥11000 ✓ (margin 900ms).

Glow focal: `links` throughout.

### S7 — "Water boils far higher" (core · `trend-break` · PRIMARY AHA · 54 words · F4+F2 applied)

Home pose = S6's cooled state, `T_K: 298` (thermal returns to the S5 baseline — links back).
`thermal: {T_K:298, jiggle_scale:0.9}` (no ramp; the backdrop self-sustains). No `compare_species`
authored (F-F: the swap machinery stays dark — this is a trend reveal, not a species swap).

**F5 applied (founder-decided, binding):** delta cue is **"Water boils far higher"** (4 words,
`docs/CHEMISTRY_PHASE0_BONDING.md` §0b amended in the same change — literal, ESL-safe, does not
figuratively reuse "break," and states the result rather than naming an unseen graph).

**Final narration (54 words, F4 + F2 both applied verbatim):** "Compare water's family: hydrogen
sulfide 213 kelvin, hydrogen selenide 232, hydrogen telluride 271. The trend predicts water near 180
kelvin, yet it boils at 373. That 193-kelvin gap is there because those hydrogen bonds have to be
broken first. Without them, water would be a gas everywhere on Earth — there would be no oceans."

- **F4 applied** — replaces the rejected "The 193-kelvin gap is the energy needed to break its
  hydrogen bonds" (a temperature difference is not an energy) with the founder-ratified sentence
  verbatim: *"That 193-kelvin gap is there because those hydrogen bonds have to be broken first."*
- **F2 applied** — the Rule-35 anchor now reaches a spoken line, verbatim: *"Without them, water would
  be a gas everywhere on Earth — there would be no oceans."*

Sentence boundaries: "…271." (13w, 4643ms) · "…373." (25w, 8929ms) · "…first." (39w, 13929ms) ·
"…oceans." (54w, 19286ms).

```
trend: { show: true,
         x_label: "Period of central atom",
         y_label: "Boiling point / K",
         points: [ {label:'H2O', x:2, y:373}, {label:'H2S', x:3, y:213},
                   {label:'H2Se', x:4, y:232}, {label:'H2Te', x:5, y:271} ],
         extrapolate_from: ['H2S','H2Se','H2Te'] }
```

| cue | ms | synced to |
|---|---|---|
| `compare_at_ms` | 1200 | right as "Compare" is spoken (fires the trend reveal regardless of mode — no swap) |
| `compare_duration_ms` | 13000 (ends 14200) | a slow graph draw-on, landing the fully-derived line + extrapolation + gap exactly as "…broken first" finishes (13929ms) |

The engine least-squares fits the three family points and DERIVES the extrapolation (180.4 K) and the
gap (193 K) itself — nothing about the anomaly is authored. `hud_lines:['bp']` — resolves 373 for the
live species H₂O. No glow authored (F-F — no keyed focal exists for the trend panel; a non-keyed
`glow_focal` would dim the whole scene with nothing lit, scar #33). Formula surface HIDDEN this state
(Rule 34d — the trend panel occupies that zone; the engine already re-anchors `#bsc_formula`
appropriately when it's shown elsewhere, F3). `reveal_hold` declared so the settled panel persists
through the closing two sentences.

Last cue 14200ms. **`eye_capture_ms: 16400`** (photographs the fully-settled panel; the panel is done
drawing by 14800ms and holds). Declared `dur: 20s`; est. speech 54w→19286ms; `content_ms=19286`;
`20000/19286=1.04×` — no overpad. `narration_outruns_choreography`: `0.7×19286=13500`; last cue 14200
≥13500 ✓ (margin 700ms).

Controls: none. Glow focal: none (F-F, deliberate).

### S8 — "Explore hydrogen bonds" (core · `interaction_complete`)

No scripted cues — user-driven, engine idle-spins per contract trap 6 (no frozen tail, Rule 37).
Controls (ALL, Rule 31c): `[{id:'species',min_ring:'core'}, {id:'count',min_ring:'core'},
{id:'temperature',min_ring:'core'}]`. `links:{enabled:true}`, `thermal:{T_K:298, jiggle_scale:0.9}`,
`hud_lines:['links_per_unit']` (EQ-2 averaged). Formula surface = the S3 surface, returns.
`config.explore_units: ["H2O","H2S","H2Se","H2Te"]` — authored explicitly per F-E/Rule 38b; **NH₃ and
HF stay dropped** (NH₃ measured 4.42, an engine artifact — no acceptor saturation — that would hand a
teacher the opposite of S7's argument; HF measured 0.00 — its donor H sits at the unit origin in
`MG_MOLECULES`, so the water-solved lattice presents it no acceptor). Both remain TAUGHT in S4's
narration and the `nh3_hf_same_anomaly` drill-down, never offered in the sandbox. No
`narration_outruns_choreography` check applies (explore states are not guided).

---

## 5. Notation + dialect ladder

This concept never needs the calculus/log/quantum tier at any ring — every state stays
arithmetic/ratio notation (`E(H···O) ≈ 20 kJ·mol⁻¹ ≪ E(O−H) = 464 kJ·mol⁻¹`; the trend axis is
linear K vs period; `Δχ` is a bare Pauling-scale difference). Trivially compliant with 38c.

Dual-labels (38d): "electronegativity" is spoken in full, never shown as a bare canvas symbol (no
dual-label needed — it is simply never abbreviated on-canvas). "hydrogen bond" is named in full at
first use (S2) before any shorthand notation (H···O, the dashed link) is relied on. "picometres" is
spoken in full at first use (S2); "kelvin" spoken in full at first use (S7); both then used bare in
later states/HUD. IUPAC-primary naming applies trivially — every species named (water, hydrogen
sulfide, hydrogen selenide, hydrogen telluride) already uses its systematic/common convergent name;
no exception needed.

---

## 6. Constraint callouts

- **Scale:** 1 scene unit = 48 pm, unchanged from the sibling's contract (`BS_BOND_LEN` 2.0 = 96 pm
  O–H). No particle-count representative-sample scale applies in the two-molecule states (S1–S4) —
  each molecule is drawn at true relative geometry. **The 30-unit network (S5–S8) IS representative,
  not an Avogadro-scale depiction** — declare this explicitly: 30 molecules stand in for a real liquid
  sample of ~10²⁵ molecules; no label anywhere may claim the canvas shows a real bulk count.
- **No unit conversions hidden behind a slider.** `T_K` is authored, displayed, and computed in kelvin
  throughout (no °C↔K conversion anywhere). ⚠ **`S7`'s "one hundred degrees Celsius" clause was CUT**
  from the original draft to make room for the F2 anchor and the F4 correction, both binding. The
  Celsius equivalence is therefore not spoken in the shipped narration, only kelvin — **flagged for
  the founder / quality_auditor as a minor loss against Rule 38e's "resolved in narration" intent**,
  traded deliberately. `E_hbond`/`E_OH` are authored, displayed, and narrated in kJ·mol⁻¹ throughout —
  no conversion.
- **Slider steps:** `T_K` step 1 K (fine enough for the ramp's own 298→600 destination and for a
  teacher's manual drag on S8). `count` is a discrete molecule-count integer, no fractional step.
  `species` is a categorical enumeration, no step applies.
- **No log-scale display anywhere** in this concept — `links_per_unit`, `Δχ`, and the boiling-point
  axis are all linear-scale HUD/graph reads.
- **⚠ F9 — the numeric guard (task item 4), recorded, never drafted as a line.** `links_per_unit`
  (`2L/N`) is the mean DEGREE — the average number of links touching each molecule. Because every
  hydrogen bond is an edge shared between two molecules, only **half** that figure (≈1.70 at 298 K,
  ≈1.43 at 600 K) is *owned* per molecule in energy-bookkeeping terms. **Any line multiplying
  `links_per_unit × E_hbond` directly (e.g. 3.40 × 20) is 2× wrong.** The honest per-molecule product
  is `(links_per_unit / 2) × E_hbond ≈ 1.70 × 20 ≈ 34 kJ·mol⁻¹`, which sits in striking agreement with
  water's ΔH_vap ≈ 40.7 kJ·mol⁻¹ — a genuinely nice number, but per the Checkpoint-A instruction **no
  narration, HUD, formula surface, or assessment line in this concept states this product**, and none
  should be added later without first halving `links_per_unit`. This paragraph is the guard, not a
  script line — it exists so a future author doesn't reintroduce the 2× error.
- **Link length = the same table value used for the HUD read** (Rule 29/D-3, one instrument):
  the dashed link's on/off state and the `links`/`links_per_unit` HUD lines are driven off the
  identical donor/acceptor charge computation — never a separately-tuned "display" threshold.

---

## 7. Assessment items (4, `depth_ring: core`) + coverage_map + misconception_watch

**Item 1 — `core`** (S4, S1): *"Which of H₂O, H₂S, HCl, and CH₄ shows hydrogen bonding, and why?"*
- Correct: **H₂O**. Its donor hydrogen (δ+0.319) clears the 0.15 donor threshold and its acceptor
  oxygen (δ−0.638) clears the 0.30 acceptor threshold — both conditions must hold, and only N, O, F
  as the electronegative partner ever produce a strong enough pair.
- Distractor "HCl" — misconception: chlorine is electronegative enough on its own to hydrogen-bond
  (ignores that HCl's donor AND acceptor charges both fall short of the thresholds — the criterion is
  quantitative, not "any electronegative atom").
- Distractor "CH₄" — misconception: any molecule with a δ+ hydrogen can hydrogen-bond (methane's C–H
  bonds are barely polar at all — carbon is not electronegative enough to create a meaningful δ+ H).
- Distractor "H₂S" — misconception: sulfur, being in the same group as oxygen, should behave the same
  way (S4's own lesson — sulfur's electronegativity difference with hydrogen is 0.38 against oxygen's
  1.24, far too small).

**Item 2 — `core`** (S7, S1, S4): *"Explain why water boils 160 kelvin above hydrogen sulfide, even
though H₂S is the heavier molecule."*
- Correct: water forms extensive hydrogen bonds (H₂O's donor/acceptor charges both clear their
  thresholds) that H₂S cannot (both charges fail); breaking these hydrogen bonds before boiling costs
  real energy that H₂S's molecules never have to pay, so water's boiling point is anomalously high
  relative to its own molecular-mass trend.
- Distractor "water is a heavier molecule so it needs more energy to boil" — misconception: gets the
  mass comparison backwards (H₂S, at 34 g/mol, is heavier than H₂O at 18 g/mol).
- Distractor "water's O–H bonds are unusually strong" — misconception: confuses the strong covalent
  O–H bond (464 kJ·mol⁻¹, unbroken by boiling) with the weak intermolecular hydrogen bond (20
  kJ·mol⁻¹, what actually gets broken) — the exact misconception S6 exists to confront.
- Distractor "water has a higher vapour pressure at the same temperature" — misconception/circular:
  restates the observation (higher boiling point ⇔ lower vapour pressure at a given T) without
  explaining the underlying cause.

**Item 3 — `core`** (S3, S6): *"When water boils, which attractions break, and which do not?"*
- Correct: the hydrogen bonds BETWEEN water molecules break (letting molecules separate into vapour);
  the covalent O–H bonds WITHIN each water molecule do not break — the steam above a boiling pot is
  still H₂O, never H and O separately.
- Distractor "the O–H bonds break, releasing hydrogen and oxygen gas" — misconception: conflates
  boiling (a physical change, breaking only the weak intermolecular attraction) with electrolysis or
  combustion (a chemical change, breaking the covalent bond) — the exact belief S6 confronts.
- Distractor "nothing breaks — the molecules just move faster" — misconception: correctly senses that
  no covalent bond breaks but misses that the intermolecular hydrogen-bond NETWORK does have to be
  disrupted for the molecules to separate into a gas.
- Distractor "both the hydrogen bonds and the O–H bonds break" — misconception: assumes boiling is a
  total structural breakdown rather than a selective one.

**Item 4 — `core`** (S3): *"Roughly compare the energy needed to break one hydrogen bond with the
energy needed to break one covalent O–H bond."*
- Correct: a hydrogen bond takes about 20 kJ·mol⁻¹ to break; a covalent O–H bond takes about
  464 kJ·mol⁻¹ — the covalent bond is roughly 23 times stronger.
- Distractor "they take about the same energy, since both involve hydrogen" — misconception: the
  exact belief S3's contrast beat exists to confront (§4).
- Distractor "the hydrogen bond is stronger, since it holds two whole molecules together" —
  misconception: confuses the NUMBER of things held together with the STRENGTH of each individual
  attraction.
- Distractor "you can't compare them — one is intermolecular and one is intramolecular" —
  misconception/evasion: both are still bonds with well-defined dissociation energies on the same
  scale; the comparison is exactly what the formula surface makes possible.

**coverage_map:**

| item | states | depth_ring |
|---|---|---|
| 1 (which species H-bonds, why) | S4, S1 | core |
| 2 (boiling-point anomaly, mass-backwards trap) | S7, S1, S4 | core |
| 3 (what breaks / doesn't when water boils) | S3, S6 | core |
| 4 (energy comparison, H-bond vs covalent) | S3 | core |

Single ring (all 8 states `core`) — every item survives under every preset trivially (38i-4).

**misconception_watch (exactly the 2 FIXED pivots, §4 of the skeleton):**

| # | belief | state | visual_counter | one_line_fix (narration quote) |
|---|---|---|---|---|
| 1 | "A hydrogen bond is a bond like any other — as strong and as permanent as a covalent bond." | S3 | The dashed link is given its honest evidence first (forms at 180 pm, holds through S2), then breaks at ~260 pm under the pull while both solid O–H sticks stay byte-identical throughout; the formula surface lands the 20 ≪ 464 kJ·mol⁻¹ scale in the same beat. | "A hydrogen bond takes about 20 kilojoules per mole to break; a covalent O–H bond takes 464. This link is more than twenty times weaker." |
| 2 | "Boiling water breaks its O–H bonds — boiling splits water into hydrogen and oxygen." | S6 | Heating raises the jiggle amplitude and lowers the averaged link count live on the HUD, while every O–H stick in every one of the 30 molecules stays pixel-identical through the entire ramp (engine-guaranteed — no intra-unit break machinery exists). | "Not one O–H bond breaks. Heat weakens the hydrogen bonds between molecules; it never touches the covalent bonds inside them." |

Belief source: NCERT Exemplar Ch.4 (belief only, per §6 source-role table).

---

## 8. Drill-down cluster phrasings (5 per cluster, student voice, no Hinglish)

**`hbond_vs_covalent_strength`** (S3):
1. "if a hydrogen bond is 20 times weaker why does it even have a name like a real bond"
2. "why does it look exactly the same as a stick bond if it's so much weaker"
3. "does the hydrogen bond break every single time or only when you pull on it"
4. "how do they even measure how strong a hydrogen bond is if it keeps breaking and reforming"
5. "is 20 kilojoules per mole a lot or a little compared to stuff I already know"

**`intermolecular_vs_intramolecular`** (S3):
1. "so there are two totally different kinds of bonds happening in the same picture"
2. "why does one dotted line connect molecules and the solid lines stay inside one molecule"
3. "if I broke every hydrogen bond in a glass of water would it still be water"
4. "why isn't the hydrogen bond just called a weak covalent bond instead of its own thing"
5. "does every liquid have this dotted-line kind of bond or just water"

**`what_breaks_when_water_boils`** (S3):
1. "so when I see steam coming off a pot, is that still made of water molecules"
2. "if the O-H bonds never break, why does the water disappear when it boils"
3. "what exactly turns liquid water into water vapor if the molecules don't change"
4. "is boiling the same kind of breaking as when the link snapped when you pulled it apart"
5. "why does it take so much heat to boil water if the bonds being broken are the weak ones"

**`boiling_point_family_trend`** (S7):
1. "why does the graph only use three points to predict where water should be"
2. "how do you know the trend line is right instead of water just being random"
3. "why does the size of the atom even affect the boiling point in the first place"
4. "if I didn't know about hydrogen bonds, what would I think caused the 193 kelvin gap"
5. "does every property follow this same kind of family trend, or just boiling point"

**`nh3_hf_same_anomaly`** (S7):
1. "does ammonia have the same kind of gap above its family trend that water does"
2. "why does hydrogen fluoride hydrogen-bond if fluorine only has one bond to give"
3. "is water's anomaly bigger or smaller than ammonia's or hydrogen fluoride's"
4. "why can't I pick ammonia in the explore mode if it's part of this same story"
5. "do all three of these follow the same rule, or is each one anomalous for a different reason"

**`hbonds_hold_dna_strands`** (S7):
1. "wait, is this the same hydrogen bond that holds DNA's two strands together"
2. "if hydrogen bonds are so weak, how do they hold something as important as DNA together"
3. "why would DNA use a weak bond instead of a strong one to hold its strands"
4. "does DNA's hydrogen bond break and reform the same way the ones in water do"
5. "is that why DNA can unzip for copying, because the bonds holding it are weak"

---

## Self-review (chemistry_author)

Consulted NCERT Chemistry Class 11 Ch.4 §4.9 chapter index for scope; NCERT Exemplar for the two
misconception beliefs only. No teaching method, worked example, or figure imported. Engine bug queue
consulted live (6 concept-tagged rows + 10 physics_author-open + 23 json_author-open); every
load-bearing prevention rule satisfied or the one genuine exception (S4's
`narration_outruns_choreography` 450 ms margin) explicitly flagged, not papered over. S3's energy
ratio ratified with the calibration shown (464÷20=23.2≈1:23), not merely asserted. S6's honesty
problem solved explicitly with a stated, defensible reasoning (§4, S6 subsection), never smuggled.
F4/F2/F9 Checkpoint-A corrections all applied verbatim (F4/F2 quoted exactly in S7's shipping
narration; F9 recorded as a guard with the arithmetic shown once as internal verification, never as a
drafted narration/HUD/assessment line). Every quantity referenced in narration appears in `variables`
with a unit. Rule 31 timeline authored and RETIMED (not left at skeleton placeholders) for all 8
states, each state's `narration_outruns_choreography` check run against the actual final narration
text. Word budget: all 7 guided states 41–54 words (within 25–55). Notation ladder: no log/calculus/
quantum notation anywhere — trivially compliant. Drill-down phrasings: 30 total (5×6 clusters), plain
student voice, no Hinglish. Constraints: 6, conservation-analog first, F9 guard recorded separately.
Numerical sanity check RUN: S3's ratio (464/20=23.2), S3's break-time recompute against F6's 8.0
destination (fraction 0.740741, break at 9518ms — shown, not eyeballed), S2's snap-time recompute
(fraction 0.9, snap at 10950ms). No balanced-equation ledger needed — stated explicitly, not left
blank. Did not write or edit any concept JSON. `config.explore_units` unchanged from the skeleton's
F-E-discharged table (`["H2O","H2S","H2Se","H2Te"]`) — NH₃/HF confirmed still dropped, still taught.

---

## OPEN ITEMS FOR `quality_auditor` / founder-proxy Checkpoint B

1. **S4 `eye_capture_ms` is NOT stated by chemistry_author** and must be derived by `json_author`:
   the swap ends at 11200 ms, so the pin must be ≥ 13200 ms (last cue + 2000). The skeleton's
   original 10000 ms is SUPERSEDED and would photograph a mid-swap frame.
2. **S4's `narration_outruns_choreography` margin (450 ms)** — re-derive independently; see the
   editorial note in §4.
3. **S4's threshold-crossing time (~7160 ms) is a linear-interpolation ASSUMPTION**, not a
   measurement — chemistry_author flagged it for THE EYE to confirm.
4. **S7's Celsius clause was cut** — a deliberate trade against Rule 38e's "resolved in narration"
   intent. A cheap restoration exists: tightening the anchor sentence to "Without them, Earth would
   have no oceans" frees 8 words, enough for "373 kelvin, one hundred degrees Celsius" and still
   lands under the 55-word budget. Narration text does not affect THE EYE's canvas baselines, so
   this can be settled after the first frames without a re-baseline.
