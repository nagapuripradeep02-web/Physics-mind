# CHEMISTRY BLOCK — `ionic_bonding` (pass 2 of 2)

**Authored by:** `chemistry_author` · 2026-08-03 · against `docs/skeletons/ionic_bonding_skeleton.md` (commit `1b82af0`, Checkpoint A cycle 2) and `docs/notes/bonding_scene_E3b-dispatch.md` (dispatches 1 + 2 committed; 3 + 4 in flight).
**Scope discipline:** the arc, ten states, rings, archetypes, delta cues, S4/S8 misconception pivots and the anchor are BINDING — not reopened here. Everything below is the rigor pass: ledger, quantities, timelines, controls, drill-downs, constraints, assessment, and two chemistry judgment calls.

**Source check line:** Consulted NCERT Chemistry Cl.11 Ch.4 §4.2 (ionic/electrovalent bond) and §4.2.1 (lattice enthalpy) chapter index to confirm scope only. NCERT Exemplar consulted for misconception belief only. No teaching method, example problem, or figure imported. All narration, anchors and drill-down phrasings authored from first principles per Rule 35.

**Engine bug queue consulted (pre-authoring, live query, 2026-08-03):** `--owner alex:chemistry_author` (10 rows, all FIXED — instrument-vs-claim discipline, average-vs-instantaneous narration, cue-consumption checks, noise-vs-effect slider ranges), `--owner alex:physics_author` (10 rows — `concept_ships_zero_narration_glow_bindings` and the three `teach_*` directives on reveal timing / live quantities / colour-by-own-sign transfer to this field_3d concept; the PCPL/dual-panel rows do not apply), `--owner peter_parker:runtime_generation` filtered for `variable`. `--scenario bonding_scene` returns zero rows (no concept has shipped on this scenario yet — expected). All applicable prevention rules satisfied below.

---

## 1 · Balanced-equation / charge ledger

Three ledger rows cover every equation this concept renders. `ionic_bonding` never shows a redox half-reaction — charges already carry the electron-count information (no oxidation-number labels, skeleton §14c).

| # | State(s) | Rendered string | LHS atoms | RHS atoms | LHS charge | RHS charge | Verdict |
|---|---|---|---|---|---|---|---|
| L1 | S2 | `Na(g) + Cl(g) → Na⁺(g) + Cl⁻(g)` | Na×1, Cl×1 | Na×1, Cl×1 | 0 + 0 = 0 | (+1)+(−1) = 0 | **Balanced.** Atoms and charge both conserved. This is the gas-phase electron-transfer step only (combined ionisation-energy + electron-affinity event) — NOT the full Born–Haber cycle; lattice formation is a separate, later step at S4, deliberately deferred (ledger row 2). |
| L2 | S4 | `NaCl(s) — Na⁺ : Cl⁻ = 1 : 1` | composition statement, not a transformation | — | — | — | **Electroneutral by construction.** Over any complete formula-unit slice: site count Na⁺ = site count Cl⁻, total charge (+1)+(−1) = 0. Holds for the bulk; the sim never models a surface/edge charge imbalance and must not imply one. |
| L3 | S7 (also the implicit event under S9's NaCl group; MgO's analogous `MgO(s) → MgO(l)` never fires at 1500 K and must not be rendered) | `NaCl(s) → NaCl(l)` | Na×1, Cl×1 | Na×1, Cl×1 | electroneutral | electroneutral | **Balanced — a congruent phase change, not a chemical reaction.** Composition identical both sides (matches the `mp_K` "congruent melt" convention). No ion is created, destroyed, or has its charge altered by melting — only its mobility changes (S8's teaching). |

**Non-ledger formula surface — S9 `E ∝ q₁q₂ ⁄ r`:** a proportionality, not a conservation-checkable equation, so no atom/charge row. Dimensionally and directionally consistent with L1–L3: MgO's |q₁q₂| = 4 vs NaCl's 1 (4×), at a smaller `r` (a = 421.2 vs 564.0 pm, ≈0.75×), both effects reinforcing. Never render as Born–Landé.

**Stoichiometry across all five `BS_ION_PAIRS` (constraint, restated in §6):** NaCl, KCl, LiF are 1+/1− → 1:1. **MgO and CaO are 2+/2− → also 1:1**, because the charge magnitudes are equal on both ions. The "2:2" language sometimes used refers to the ion CHARGES, not the site ratio, which stays 1:1 for every pair in the table. No pair here requires a 2:1 or 1:2 ratio. `coordination` (6:6) is a separate, purely geometric quantity and must never be confused with the stoichiometric ratio.

---

## 2 · Quantity declarations

**Structural note, so json_author does not reach for the wrong contract:** `bonding_scene` is a `field_3d` scenario. Its "formulas" are ENGINE-side closed-form derivations (`f_melt`, `like_contacts`, `coordination`) living in `field_3d_renderer.ts`, not `physics_engine_config.formulas` PM_interpolate strings. The tables below are what maps to `physics_engine_config.variables`. **There is no `formulas` block to author for this concept — do not invent PM_interpolate strings for `f_melt` or `like_contacts`.**

### 2a · Sliders (concept-level `config.slider_controls`, one range serves all states)

| id | name | unit | min | max | default | step | Engine key | Serves |
|---|---|---|---|---|---|---|---|---|
| `temperature` | temperature | K | 300 | 3400 | ⚠ see flag | 25 | `thermal.T_K` (destination-valued) | S7 (1200 K dest), S9 (1500 K shared dest), S10 (must melt MgO 3125 K, CaO 2886 K) |
| `spin` | spin rate | rad/s | 0 | 0.6 | 0.16 | 0.02 | `spin_rate` | S5, S10 |
| `shift` | layer shift | dimensionless (1.0 = one full site) | 0 | 1 | 0 | 0.02 | `shift.offset_sites` | S6 (dest 1.0), S10 |
| `field` | applied field | dimensionless (0–1 normalised bias) | 0 | 1 | 0 | 0.02 | `ions.field` (dest via `field_at_ms`) | S8 (dest 1), S10 |
| `ion_pair` | ion pair | categorical: NaCl · KCl · LiF · MgO · CaO | — | — | NaCl | — | `pairOverride` in `bscSiteList` | S10 only |

**⚠ Range check (the skeleton's claim, verified rather than trusted — it HOLDS):** 300–3400 K covers every scripted destination. S7's 1200 K clears the NaCl knee (1099 K) by 101 K. S9's 1500 K melts NaCl and leaves MgO solid (knee 3150 K) with 1650 K of headroom. S10's ceiling 3400 K clears MgO's knee by 250 K and CaO's (2911 K) by 489 K — **both pairs are genuinely meltable in the sandbox.**

**⚠ Loose end found, flag to json_author + surgeon:** the engine's hardcoded slider default is `defc("temperature", 298, 100, 600)`. The concept-level override supplies `{min, max, step}` but the schema shown carries no `default` key. If the reader applies the override to min/max/step and leaves the raw default (298) unclamped, the slider opens **2 K below its own new floor**. This is exactly the class E3b S-7 was dispatched to guard. **Recommend:** confirm with the S-7 gate that the panel-build default clamps to the new min, or author `default: 300` explicitly if the schema supports it. Non-blocking (S1, the only state at 298 K, exposes no temperature control), but close it before S10's hand-drive duty.

### 2b · Live HUD / computed outputs (engine-printed, never authored)

| Quantity | Unit | Typical range | Format string | Engine item | First live in |
|---|---|---|---|---|---|
| `separation_pm` | pm | ~500 (opening) → 282 (settle) | `d = 282 pm` | D1·S-4 | S3 |
| `radius_pm` | pm | Na 186→102, Cl 99→181 | `r = 102 pm` (per participant) | live | S2 |
| `lattice_a` | pm | 402.6 – 629.3 | `a = 564 pm` | live | S4, S10 |
| `valence` | outer e⁻ count, per site | Na 1, Cl 7 | `outer e⁻: Na 1 · Cl 7` | D1·S-3 | S1 |
| `coordination` | ratio (dimensionless) | 6 : 6 (both counts independently derived) | `coordination = 6 : 6` | D1·S-5 | S5 |
| `like_contacts` | count (dimensionless) | 0 → 6 (a DELTA metric, never a raw count) | `like contacts: 6` | D3·L-2 | S6 |
| `melting_point` | K | 1043 – 3125 | `m.p. = 1074 K` / grouped `NaCl m.p. = 1074 K` | D2·T-3 | S7, S9, S10 |
| `lattice_enthalpy` | kJ·mol⁻¹ | 715 – 3791 | `ΔH = 788 kJ·mol⁻¹` / grouped `NaCl ΔH = 788 kJ·mol⁻¹` | D2·T-3 | S7, S9, S10 |
| `conductivity` | categorical (one ratified digit + a fixed "none" string — never live-computed) | — | `conductivity: none — ions fixed` / `conductivity ≈ 3.5 S·cm⁻¹ (1100 K)` | D4·Q-3 | S8 |

**⚠ Transcription note on `conductivity`:** the molten string's `(1100 K)` is a **fixed reference-citation temperature** (the compilation's stated condition, "just above the melting point"), NOT the group's live `T_K` (S8's `g_melt` is authored at 1150 K for knee margin). Transcribe exactly — do not swap in 1150, and do not make this string derive from live `T_K`. Both numbers are correct for what they each describe; **do not "fix" the apparent mismatch.**

### 2c · Engine constant table (RATIFIED — transcribe exactly, change no digit)

| key | cation | anion | a_pm | mp_K | lattice_kJ (dissociation ΔH, Born–Haber) |
|---|---|---|---|---|---|
| NaCl | Na⁺ | Cl⁻ | 564.0 | 1074 | 788 |
| KCl | K⁺ | Cl⁻ | 629.3 | 1043 | 715 |
| LiF | Li⁺ | F⁻ | 402.6 | 1118 | 1030 |
| MgO | Mg²⁺ | O²⁻ | 421.2 | 3125 | 3791 |
| CaO | Ca²⁺ | O²⁻ | 481.1 | 2886 | 3401 |

Radii (pass-1 ratification, unchanged): Na⁺ 102, Cl⁻ 181, Mg²⁺ 72, O²⁻ 140 pm (Shannon CN6). K⁺/Li⁺/F⁻/Ca²⁺ individual radii are **not needed** — `radius_pm` is authored only for the Na/Cl transfer (S2); the other four pairs need only their `a_pm`/`mp_K`/`lattice_kJ` triple.

---

## 3 · Within-state motion timeline (all 10 states)

Durations recomputed against the **player's** speech model (chars/5.5 at WPM 150 × rate 0.9 ≈ 2.16 w/s ≈ 0.505 s/word), `duration = ceil(max(speech_end, last_cue + settle)/1000)`. Eight states carry the skeleton's numbers unchanged; **S7 and S9 are UPDATED** because their narration is revised in §8.

### STATE_1 — "One spare, one gap" (21 s)
| t (ms) | Event | Driven by |
|---|---|---|
| 0 | Units placed (na −4.5,0,0; cl 4.5,0,0); shell dots render (1 on Na, 7 on Cl, post-D1·S-3); ambient jiggle live (`T_K:298, jiggle_scale:0.5`) | config + D1·S-2 |
| 1500 | `spin_start_ms` → 0.15 rad/s | scripted |
| 3000 | Annotation (x160) "One spare outer electron" | narration-synced |
| 9000 | Annotation (x500) "One space for one more", until state end | narration-synced |
| 10000 | `eye_capture_ms` | frozen-pin |
| ~20200 | Narration ends (40 w) | speech model |
Single reveal beat — Rule 32a cause/effect pairing N/A here.

### STATE_2 — "Electron moves, sizes change" (24 s)
| t (ms) | Event | Driven by |
|---|---|---|
| 0 | Home pose continues (±4.5); **must author `thermal:{T_K:298, jiggle_scale:0.5}`** — see §9 | continuity |
| 5000–13000 | `transfer.at_ms:5000, duration_ms:8000` — electron dot crosses Na→Cl (**cause**) | scripted |
| ~5400 | Radius ramp begins; charge ramps in lockstep, Σq = 0 at every instant (**effect**) | `bscTransferProg`/`bscTransferSite` |
| 14000 | Annotations: "Smaller: it lost a shell" (x160), "Larger: one extra electron" (x500) | narration-synced |
| 15000 | `eye_capture_ms` | frozen-pin |
| ~22700 | Narration ends (45 w) | speech model |
32a: cause precedes effect by ~400 ms — below the ~0.5–1 s guideline, but the offset is engine-internal to `bscTransferProg` and not an authorable JSON field. **Non-blocking observation, recorded not actioned.**

### STATE_3 — "Pull in, then stop" (22 s)
| t (ms) | Event | Driven by |
|---|---|---|
| 0 | Home pose; **must author `thermal:{T_K:298, jiggle_scale:0.5}`** (§9) | continuity |
| 4000–11000 | `approach_at_ms:4000`, ~7000 ms — ions close on the leading-pair `mgRamp` chain toward 282.0 pm (**pull**), decelerating into the settle (**stop**) | scripted, closed-form |
| 11500 | Annotation (x380) "Full shells cannot overlap — they stop here" | narration-synced |
| 12500 | `eye_capture_ms` | frozen-pin |
| ~21200 | Narration ends (42 w) | speech model |
`separation_pm` ramps live through the approach and settles at 282 pm — no authored string types the digit.

### STATE_4 — "More ions keep joining" (25 s) · PRIMARY AHA
| t (ms) | Event | Driven by |
|---|---|---|
| 0 | Opens on S3's lone pair — the wrong-belief picture. **Must author `thermal:{T_K:298, jiggle_scale:0.5}`** (§9), covering the hold AND the post-growth tail | continuity + 16a hold |
| 0–~5000 | Hold on the pair (~4 s) while narration names the belief's expected consequence | 16a contrast beat |
| 5000–14000 | `grow_at_ms:5000, grow_duration_ms:9000` — `bscGrowShown` ramps the site count from the pair to the full 125-site block (**the real physics**) | scripted, closed-form |
| 15000 | Annotation (x380) "The pattern repeats in every direction" | narration-synced |
| 17000 | Annotation (x160) "This block is a tiny corner of one grain" (wordy-not-numeric) | narration-synced |
| 17600 | `eye_capture_ms` | frozen-pin |
| ~24240 | Narration ends (48 w) | speech model |
`misconception_watch` fires here. Hold→growth IS the cause(expectation)→effect(reality) structure Rule 16a requires.

### STATE_5 — "Six neighbours, every ion" (21 s)
| t (ms) | Event | Driven by |
|---|---|---|
| 0 | Packed home pose (S4's grown block, re-solved fit); spin live from state start | continuity |
| 3500 | `reveal_at_ms:3500` → peer-fade + `BS_COORD_RADIUS_SCALE` opens the focal site to ball-and-stick, six rods appear | scripted |
| 8000 | Annotation (x380) "Count the six rods" — true across the full spin window (D-4) | narration-synced |
| 9000 | `eye_capture_ms` | frozen-pin |
| ~20200 | Narration ends (40 w) | speech model |

### STATE_6 — "One shift, it splits" (24 s) · declared contrast pair
| t (ms) | Event | Driven by |
|---|---|---|
| 0 | Packed home pose reopens; **must author `thermal:{T_K:298, jiggle_scale:0.5}`** (§9) | continuity |
| 6000–9000 | `shift.at_ms:6000, duration_ms:3000, offset_sites:1` — upper half slides one site (**cause**) | scripted, drag-seize |
| ~9000–10000 | ~1 s hold; like-charge interface pairs are glow focal (`layer`) | derived |
| 10000–15000 | Derived split ramp — halves separate under like-charge repulsion (**effect**, D-2, never authored) | closed-form |
| 9200 | Annotation (x380) "A one-site slide lines up like charges" | narration-synced |
| 15500 | Annotation (x380) "Like charges push the halves apart" | narration-synced |
| 16000 | `eye_capture_ms` | frozen-pin |
| ~22700 | Narration ends (45 w) | speech model |
`like_contacts` ramps 0→6 (derived, HUD only, never typed into an annotation).

### STATE_7 — "Heat frees the ions" (**28 s — UPDATED, see §8b**)
| t (ms) | Event | Driven by |
|---|---|---|
| 0 | Packed home pose reopens | continuity |
| 4000–14000 | `T_from:300, T_at_ms:4000, T_ramp_ms:10000, T_K:1200, jiggle_scale:1` — heat + jiggle rise visibly (**cause**) | scripted |
| ~12880 | NaCl crosses its knee (1099 K) — ions begin leaving sites (**effect**, ~8.9 s after the cause begins) | derived `f_melt` |
| 13000 | Annotation (x380) "Ions become free at the melting point" | narration-synced |
| 15500 | Annotation (x160) — **revised, §8b**: "No single bond breaks alone" | narration-synced |
| 16000 | `eye_capture_ms` | frozen-pin |
| ~27775 | Narration ends (**55 w, revised**) | speech model |
**Duration 24 → 28 s.** Last cue + settle (~16.5 s) stays well under narration end, so narration still dominates the timeline — only the number changes.

### STATE_8 — "Free ions carry charge" (26 s)
| t (ms) | Event | Driven by |
|---|---|---|
| 0 | `g_solid` (T_K 300, jiggle 0.6) and `g_melt` (T_K 1150, jiggle 1) placed; `g_melt` opens **already molten** (closed-form `f_melt(1150) = 1`, no latch) | scene config |
| 6000 | `field_at_ms:6000` — field arrows fade in, scene-level, inherited by BOTH groups (**cause**) | scripted, drag-seize |
| ~6800 | Melt's ions begin a slow biased drift (**effect**, ~800 ms gap); solid's ions jiggle in place, never translate (negative control, load-bearing) | derived |
| 8000 | Annotation over g_solid (x160) "Held in place — no current" | narration-synced |
| 10500 | Annotation over g_melt (x500) "Free ions drift — current flows" | narration-synced |
| 13000 | `eye_capture_ms` | frozen-pin |
| ~25250 | Narration ends (50 w) | speech model |
`misconception_watch` pivot #2 fires here.

### STATE_9 — "Double charge, far stronger" (**28 s — UPDATED, see §8a**) · advanced
| t (ms) | Event | Driven by |
|---|---|---|
| 0 | `g_nacl` (a 564.0) and `g_mgo` (a 421.2) placed, no per-group thermal override; **must add scene-level `jiggle_scale:1`** (§9) | scene config |
| 4000–14000 | Scene-level `T_from:300, T_at_ms:4000, T_ramp_ms:10000, T_K:1500` — one shared heater (**cause**) | scripted |
| ~10660 | NaCl crosses its knee (1099 K) — begins melting (**effect**, ~6.7 s gap) | derived |
| — | MgO's knee (3150 K) is never reached at 1500 K — MgO holds, jiggling only | derived (non-event) |
| 12000 | Annotation over g_nacl (x160) "Single charges — already molten" | narration-synced |
| 14000 | Annotation over g_mgo (x500) "Double charges, closer — still solid" | narration-synced |
| 15000 | `eye_capture_ms` | frozen-pin |
| ~27270 | Narration ends (**54 w, revised**) | speech model |
**Duration 24 → 28 s**, same reason as S7.

### STATE_10 — "Explore the lattice" (30 s nominal; Rule 37 free-runs beyond)
`placement:'lattice'` + `lattice:{cell:'rock_salt', n:[3,3,3], a_pm:564.0}` MANDATORY (else the state falls through to free placement and renders no lattice). `ion_pair` picker drives `pairOverride`; all five sliders live core. Idle motion: authored `jiggle_scale` is real post-D1·S-2, and the idle-spin fallback carries the corrected D1·S-6 guard. HUD `['lattice_a','melting_point','lattice_enthalpy']`, no formula surface. Narration 0/open. **Lesson-6 hand-drive duty (all five pairs through the full ranges) applies before approval — a json_author / quality_auditor duty this document does not discharge.**

---

## 4 · Per-state control spec (Rule 31) + drag-seize

| State | Controls live | Drag-seize required? |
|---|---|---|
| S1 | — | n/a |
| S2 | — | n/a |
| S3 | — | n/a |
| S4 | — | n/a |
| S5 | `spin` (core) | No — spin has no competing scripted destination in this state |
| S6 | `shift` (core) | **Yes** — the scripted `shift` beat and the slider share the quantity |
| S7 | `temperature` (core) | **Yes** — the scripted `T` ramp and the slider share the quantity |
| S8 | `field` (core) | **Yes** — the scripted `field_at_ms` destination and the slider share the quantity |
| S9 | — | n/a (watch-this beat) |
| S10 | `ion_pair`, `spin`, `temperature`, `shift`, `field` (all core) | **Yes** on `ion_pair`, `shift`, `field`, `temperature` per E3b standing rule 5; `spin` not listed, none needed |

**Drag-seize contract (cited so json_author authors against the right definition):** re-seed the DOM control to the scripted/default value on state entry; track per-frame until a trusted user drag seizes it; once seized, the scripted cue defers to the live value for the rest of that state. This is the `scripted_change_desyncs_the_dom_control_that_shares_it` class.

---

## 5 · Drill-down cluster phrasings (9 clusters × 5, real student voice)

### S2 clusters

**`why_cation_shrinks`**
1. "why does sodium get smaller when it loses just one electron"
2. "shouldn't losing an electron make the atom bigger since there's less stuff pushing back"
3. "if Na has three shells and Na⁺ still has electrons why does it look like it lost a whole shell"
4. "Na⁺ has fewer electrons but the same protons so why does that shrink it"
5. "I thought removing an electron would make the atom less crowded, not smaller"

**`why_anion_grows`**
1. "why does chlorine get bigger when it only gains one electron"
2. "chlorine already has seven electrons in that shell so why does one more make it so much bigger"
3. "same number of protons, so why does adding an electron change the size at all"
4. "does the shell actually get bigger or does it just look bigger with more electrons in it"
5. "why does gaining one electron do more to the size than losing one did"

**`isoelectronic_size_compare`**
1. "Na⁺ and Ne have the same number of electrons so why aren't they the same size"
2. "if Na⁺ and Mg²⁺ have the same electron count why is Mg²⁺ smaller"
3. "how can two ions with the exact same electrons end up different sizes"
4. "is it just the number of protons that decides the size once the electron count matches"
5. "why does more positive charge pull the same electrons in tighter"

### S4 clusters

**`formula_unit_vs_molecule`**
1. "so is NaCl a molecule or not, because my textbook draws it like one"
2. "what's the difference between a formula unit and a molecule then"
3. "if there's no NaCl molecule then what is the little pair diagram actually showing"
4. "why do we even write NaCl as one unit if it's really a giant lattice"
5. "does 'formula unit' mean something different from 'molecule' or is it the same idea with a different name"

**`lattice_repeat_pattern`**
1. "does the lattice pattern actually go on forever or does it stop somewhere"
2. "how do the ions know to keep alternating plus minus plus minus in every direction"
3. "is every crystal of salt one giant connected lattice, or lots of small ones"
4. "why does the pattern repeat exactly the same way in all three directions"
5. "what stops the lattice from growing forever if nothing seems to stop it"

**`why_one_to_one_ratio`**
1. "why is it always one sodium to one chlorine and never two to one"
2. "does the 1:1 ratio come from the charges or is it just how they pack"
3. "would the ratio change if the charges were different, like magnesium and oxygen"
4. "why can't there be extra sodium ions squeezed in somewhere"
5. "is the ratio about how many ions fit in the space or about balancing charge"

### S6 clusters

**`cleavage_flat_faces`**
1. "why does a salt crystal always break in a straight flat line instead of crumbling"
2. "if I hit the crystal from a different angle does it still split flat"
3. "why does hitting it make a clean split instead of just crushing it"
4. "does every ionic crystal split the same way, or is this just salt"
5. "how does the crystal know exactly where to split"

**`brittle_vs_malleable`**
1. "why does salt shatter but a metal spoon just bends"
2. "metals have a lattice too, so why doesn't the metal split the same way"
3. "if both are made of a repeating pattern of atoms why is one brittle and one bendy"
4. "does the type of bond decide if something is brittle, or is it something else"
5. "why doesn't bending a metal push charges into each other the same way"

**`like_charge_repulsion_scale`**
1. "how big does the shift have to be before the crystal actually splits"
2. "does a tiny nudge of the layer already cause a split, or does it need to go all the way"
3. "why does moving the layer by just one position make such a big difference"
4. "is the repulsion strong enough to push the whole layer apart, or does something else do that"
5. "if I shift it less than one full position does anything happen at all"

---

## 6 · Chemical-validity constraints (conservation first)

```
"constraints": [
  "charge is conserved at every instant: Sigma q = 0 before, during, and after the S2 transfer ramp (charge and radius ramp in lockstep, never independently)",
  "every ion-pair formula unit is 1:1 across all five BS_ION_PAIRS entries (NaCl, KCl, LiF, MgO, CaO) -- MgO and CaO's higher ionic charge (2+/2-) changes lattice strength, never the site-count ratio",
  "like_contacts is a delta against the unshifted reference lattice at the same t, never a raw nearest-neighbour count -- reads 0 pre-shift and settles at a derived count post-shift; if the engine's derived count differs from the Phase-0 design expectation of 6, that is a Phase-0 arc discrepancy to report, never to tune toward",
  "f_melt is derived solely from (T_K, pair.mp_K, site index, state-local t) -- no state JSON in this concept may assert that a pair has melted",
  "coordination prints two independently-derived neighbour counts (cation-neighbours : anion-neighbours) -- never a hard-coded pair and never one count doubled to produce the other",
  "rock-salt coordination is 6 for every interior site across all five ion pairs -- geometry sets this number, not charge magnitude",
  "no BS_ION_PAIRS digit (a_pm, mp_K, lattice_kJ) is altered from the ratified table; lattice_kJ is always the Born-Haber-derived dissociation value, never a Born-Lande/Kapustinskii calculated substitute",
  "no authored string in this concept types a separation digit, a like_contacts digit, a coordination digit, or a solid-side conductivity digit -- those HUD lines are the only instrument, and the conductivity HUD never quotes a molten:solid ratio"
]
```

---

## 7 · Assessment stems + coverage_map

**1 (S2) — why Na⁺ is smaller than Na.** Stem: *"Why is a sodium ion (Na⁺) smaller than a sodium atom (Na)?"*
- **Correct:** Losing the outer electron removes a whole electron shell, so the remaining electrons sit closer to the same 11 protons.
- Distractor: "The nucleus loses a proton along with the electron, so there is less attraction." — confuses electron loss with proton loss.
- Distractor: "Losing one electron just makes the atom less crowded, so it should not change size much." — `why_cation_shrinks` belief; underweights shell removal.
- Distractor: "The ion is smaller because it now has a negative charge pulling electrons in." — wrong-signed charge.

**2 (S4) — why "NaCl" does not name a molecule.** Stem: *"A student writes 'one molecule of NaCl.' What is wrong with this statement?"*
- **Correct:** NaCl is not made of discrete pairs; it is a 1:1 ratio of ions repeated through an endless lattice, so there is no single bounded "molecule."
- Distractor: "Nothing is wrong — NaCl is a small molecule like H₂O." — `formula_unit_vs_molecule`.
- Distractor: "NaCl is wrong because the real formula should be Na₂Cl₂." — confuses the simplest ratio with a doubled formula.
- Distractor: "NaCl only forms a molecule in the gas phase, never as a solid." — conflates S2's gas-phase step with the solid lattice (deliberately tricky: gas-phase NaCl pairs ARE molecular, but the question is about the solid).

**3 (S5) — predict the coordination number of an interior ion.** Stem: *"In the rock-salt structure, how many nearest neighbours of the opposite charge surround an interior ion?"*
- **Correct:** 6. · Distractor 4 — confuses with a tetrahedral (4:4) structure. · Distractor 8 — confuses with body-centred (8:8). · Distractor 1 — still picturing NaCl as a bonded pair (the S4 belief recurring).

**4 (S6) — explain brittleness via the layer shift.** Stem: *"Why does an ionic crystal shatter along a flat plane when struck, instead of bending?"*
- **Correct:** A small shift lines up ions of the same charge, and the resulting repulsion pushes the layers apart.
- Distractor: "The crystal is simply weaker than a metal, with fewer bonds holding it together." — `brittle_vs_malleable`.
- Distractor: "Heat generated by the impact melts the ions apart locally." — conflates fracture with a thermal event.
- Distractor: "The ions are only held by gravity, so any sideways force breaks them apart." — ignores the electrostatic bond.

**5 (S8) — why molten NaCl conducts and solid does not.** Stem: *"Both solid and molten NaCl contain the same ions. Why does only the molten sample conduct electricity?"*
- **Correct:** In the solid, ions are fixed at lattice sites and cannot move; in the melt, ions are free to drift and carry charge.
- Distractor: "Solid NaCl has no charged particles; melting creates the ions." — thinks melting creates ions rather than freeing them.
- Distractor: "The melt conducts because heat itself carries the current." — confuses thermal energy with a charge carrier.
- Distractor: "Solid NaCl does conduct, just more weakly than the melt." — the exact S8 pivot belief.

**6 (S3/S9, advanced) — rank melting points using E ∝ q₁q₂/r.** Stem: *"Using E ∝ q₁q₂/r, explain why MgO has a far higher melting point than NaCl."*
- **Correct:** MgO's ions carry double the charge of NaCl's and sit closer together, so the electrostatic attraction — and the energy needed to disrupt it — is far greater.
- Distractor: "MgO has a higher melting point simply because oxygen is heavier than chlorine." — substitutes atomic mass for charge/spacing.
- Distractor: "MgO and NaCl should have similar melting points because both are 1:1 ionic solids." — ignores that charge enters as a product.
- Distractor: "MgO melts lower because its ions are smaller and weaker." — inverts the radius relationship.

```
"coverage_map": {
  "why_na_plus_smaller": ["STATE_2"],
  "nacl_not_a_molecule": ["STATE_4"],
  "coordination_number_predict": ["STATE_5"],
  "brittleness_layer_shift": ["STATE_6"],
  "molten_vs_solid_conduction": ["STATE_8"],
  "melting_point_ranking_charge_size": ["STATE_3", "STATE_9"]
}
```

---

## 8 · Two chemistry judgment calls

### 8a · S9 — melt race + ΔH readout side by side: honest, WITH one guard clause

**Verdict: honest, but needs a one-clause qualifier.**

Lattice enthalpy (`MX(s) → M⁺(g) + X⁻(g)`) and melting point (`MX(s) → MX(l)`) are genuinely different processes with different magnitudes: melting disrupts only long-range order (the liquid retains substantial short-range coordination), while lattice-dissociation enthalpy breaks the lattice all the way to isolated gaseous ions. Both correlate strongly for two same-structure rock-salt solids because both derive from the same underlying `q₁q₂/r` attraction — that correlation is real and is exactly what S9 teaches. But printing both numbers side by side unqualified invites "higher ΔH ⇒ higher m.p." as a general law, which fails where packing, polarisability or covalent character decouple them (comparisons across different crystal structures — outside this concept's scope, but the risk is in the general inference).

The advanced ring affords the clause. **Revised narration (54 w, inside budget):**

> "Same heater, two crystals. Salt's ions carry single charges; magnesium oxide's carry double charges, at a smaller spacing. Both its melting point and its lattice-dissociation energy are far higher — different measurements of the same stronger attraction, not the same quantity. Salt melts on the way up; magnesium oxide stays solid far past that point."

HUD strings, delta cue and both annotations are unchanged — the guard is purely narrational, so no E3b-decided string is touched.

### 8b · S7 — "the whole lattice must fail at once": NEEDS REPLACING

The intuition the state wants ("there is no single weak bond to exploit — every ion is held by a full network of full-strength ionic bonds, which is why the melting point is high") is correct and is the right reason ionic melting points are high. But *"the whole network fails at once"* is a literal overstatement: melting is a threshold phenomenon (nucleation and progressive disordering), not a single simultaneous event across a macroscopic crystal — **and it does not match what is on screen**, since the engine's own `f_melt` law mobilises sites progressively across a 25 K window by site index. The secondary annotation carries the identical overstatement in fewer words.

**Revised narration (55 w, at the ceiling):**

> "Heat the crystal and every ion shakes harder, but each is held by six neighbours, and those by six more — no single weak bond breaks first. An ion is freed only once that whole surrounding pull is overcome. That is why the melting point is so high — the HUD shows the temperature and energy needed."

**Revised secondary annotation (x160, was "Every bond in the block must fail, not one"):**

> "No single bond breaks alone"

Both keep the correct intuition (no weak link; the whole local bonding environment resists) while dropping the false simultaneous-whole-crystal claim. Neither touches the delta cue ("Heat frees the ions" — binding) or any HUD string.

**Duration consequence:** S7 ~45 → 55 w (22.7 → 27.8 s); S9 ~46 → 54 w (23.2 → 27.3 s). Both `duration` values become **28**. This is the only numeric consequence — no cue timing, HUD format, or formula surface changes.

---

## 9 · Motion-continuity gap (MUST-AUTHOR before json_author ships)

Skeleton §3 directs that "every S1–S9 state AUTHORS `jiggle_scale` > 0 and/or carries a scripted ramp" with "no static run > ~25% of any state's timeline." Checking §7's per-state authoring detail against that directive: **S2, S3, S4, S6 and S9 do not restate an explicit `thermal:{T_K, jiggle_scale}` block**, though §4's dispatch table lists D1·S-2 (site jiggle) as applicable to every one of them. Without it, those five states rely entirely on their scripted beat for motion — and each has a pre-beat and/or post-beat window well over 25% of its own timeline (worked in §3), which would silently fail the no-static-state guarantee **exactly the way the pre-E3b `jiggle_scale` no-op did**.

| State | Required addition |
|---|---|
| S2 | `thermal:{T_K:298, jiggle_scale:0.5}` (continues S1's ambient — Rule 32d) |
| S3 | `thermal:{T_K:298, jiggle_scale:0.5}` |
| S4 | `thermal:{T_K:298, jiggle_scale:0.5}` |
| S6 | `thermal:{T_K:298, jiggle_scale:0.5}` |
| S9 | add `jiggle_scale:1` to the existing scene-level `thermal` block — needed for the "MgO holds with growing jiggle" visual the Phase-0 arc promises and the skeleton's §7 snippet omits |

S1, S5, S7, S8, S10 already carry an explicit motion source and need no change. These are continuity values, not ratified digits — json_author may adjust the scale but **must not leave any of the five absent or at 0.**

---

## 10 · Other observations (non-blocking)

- **S2's ~400 ms cause→effect gap** is engine-internal to `bscTransferProg`, not authorable, and sits slightly under the ~0.5–1 s Rule 32a guideline. Recorded, not actionable at the JSON layer.
- **S1's `T_K:298`** sits 2 K below the new concept slider floor (300 K) — harmless (S1 exposes no temperature control) but worth resolving with the §2a slider-default flag so the concept's temperature story is internally consistent.
- **`explorer_id: "ionic_bonding_explorer"`** is correctly authored explicit in skeleton §7.0 — noted only because it is the kind of field a careless review misses.

---

## 11 · Self-review

- [x] Every quantity in the narratives appears in §2 with a unit (including `shift` and `field`, marked dimensionless-normalised rather than given a false physical unit).
- [x] Balanced-equation ledger complete (§1): atom counts + charge totals for all three rendered equations; 1:1 stoichiometry verified for all five pairs including the 2+/2− cases.
- [x] Every state's motion maps to a committed `bonding_scene` capability (dispatches 1+2 live; 3+4 named per state) — no state asks for an unbuilt render surface.
- [x] Rule 31 timeline for all ten states (§3), pure function of state-local t; controls match the architect table exactly (§4).
- [x] Rule 32 sequencing verified per state (cause→effect gaps computed, not assumed); the one sub-500 ms gap (S2) is engine-internal, recorded. Rule 33: the crystal IS both macro object and micro story (skeleton §14g), each state's real number carried through §3.
- [x] Word budget: the eight unchanged states sit inside 25–55; the two revised (S7 55, S9 54) land inside the ceiling, not over.
- [x] Notation ladder: core states stay shell-count/arithmetic; only S9's `E ∝ q₁q₂/r` is algebraic, correctly gated to the advanced ring.
- [x] Drill-down phrasings: 45 total (9 × 5), real student voice, no textbook phrasing, no Hinglish.
- [x] `constraints` block (§6): 8 assertions, conservation first.
- [x] Numeric checks run, not eyeballed: L1 charge balance, L2 ratio arithmetic across all five pairs, S9's charge-product ratio against the ratified digits, every knee/headroom figure in §2a.
- [x] Engine bug queue consulted live (three owner queries); applicable prevention rules satisfied, non-applicable ones excluded with reasoning.
- [x] Source check line present.
- [x] `aha_moment` chemistry check: S4's PRIMARY aha is chemically true and demonstrated by the growth beat; S8's contrast is chemically true and demonstrated by the negative control. Every assessment answer verified correct; every distractor is a real named wrong belief.

**Disagreements with the skeleton:** none at the arc / state / ring / archetype / delta-cue / anchor level — that content is sound and BINDING. Two narration-level chemistry corrections (§8a, §8b), both scoped to narration + one secondary annotation, neither touching a binding string. One authoring completion flagged as must-fix before json_author ships (§9) — a compliance gap against the skeleton's own no-static-state directive, not a disagreement with the chemistry or the design.
