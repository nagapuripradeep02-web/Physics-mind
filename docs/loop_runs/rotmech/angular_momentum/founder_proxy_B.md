# founder_proxy — Checkpoint B (BUILD GATE) · `angular_momentum` · fix cycle 0

**Concept:** `angular_momentum` · **Desk C** (`feat/rotmech-c`)
**Artifacts:** `src/data/concepts/angular_momentum.json` · EYE run `.visual_runs/angular_momentum/20260804-181916/` (23/23) · live site `http://localhost:8112/angular_momentum/`
**No `.founder_runs/` dump existed** — founder-proxy drove the sim itself with Playwright (trusted mouse), which is how P1-2 and P1-3 were measured.

> Persisted verbatim by the dispatching session — founder-proxy is report-only and writes no repo file.

## 1 · VERDICT — `FIX(engine)`, **blocking**

**Do not approve. Hold this concept for the engine fix.**

The teaching design is good and the primary aha genuinely lands — STATE_3 is the best-composed state reviewed on this scenario, and it is immune to the defect below because it deliberately authors `show_l_arrow: false`. But **the L vector — the concept's headline visual, half its own atomic claim, and the chapter's shared axial vector under `APPARATUS_CONTRACT.md` §3 — is not drawn.** Measured: **15 pixels** in STATE_1's frozen frame, none of them the material's own colour. The `THREE.ArrowHelper` shaft is a 1-px `THREE.Line` running along the axle's centreline *inside* an opaque cylinder, and the cone head (radius 0.08) sits inside the axle (radius 0.07), so only a ~0.01-world-unit crescent escapes. What a teacher sees is a grey pole with a small blue letter beside it.

This is **not** F-C7. F-C7 says the arrow "stays pale" because `ArrowHelper` materials lack `.emissive`, so the focal handoff is a silent no-op. That diagnosis is correct about the *symptom* and wrong about the *root cause*, and the difference is load-bearing: **F-C7's own probe** ("sample the arrow's rendered pixel luminance before and after the focal instant; assert a measurable increase") **would PASS on a build where the arrow is still invisible** — 15 blended pixels getting brighter is still 15 pixels. An engine agent working to F-C7's contract can land the fix, satisfy its probe, and the vector will still not be there.

It is also a **recurrence of two FIXED scar classes** (§2), which under Pass-1 doctrine is automatically P1.

Verdict discipline: two unresolved blocking engine findings ⇒ no APPROVE. Three P2/P3 authoring findings ride to the same fix cycle. Not an ESCALATE — the physics is correct throughout.

## 2 · PASS 1 — scar pre-read (recurrence check)

Corpus live: **325 field_3d rows**. `--scenario rigid_body_rotation` and `angular_momentum` both return **zero** — the blind spot eye-walker filed as PASS 13 — so `findings_c.md` + `scar_candidates_c.sql` were read in full as that entry instructs.

| scar class | status | result here |
|---|---|---|
| `field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line` | MAJOR/**FIXED** | **RECURRED** — see P1-1 |
| `nlb_force_arrow_anchored_at_body_centre_so_the_occluded_root_destroys_the_authored_length_ratio` | CRITICAL/**FIXED** | **RECURRED** — its rule ("validate the DRAWN length, never the computed one") was never applied to rbr |
| `force_arrow_length_exceeds_the_apparatus_line_it_lies_along` | MAJOR/FIXED | clear |
| `teach_visual_must_match_narration` | OPEN | **violated** — s1_4 names "the arrow on the axle" |
| `concept_ships_zero_narration_glow_bindings` | MAJOR/OPEN | 0/18 — mitigated on S1–S3 by `phases[]`, **live gap on S4/S5** (P2-1) |
| `authored_state_glow_focal_silently_voids_every_tts_sentence_glow` | MAJOR/OPEN | N/A — no sentence glows authored |
| `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` | DIRECTIVE/OPEN | **not** triggered — measured, no peer dimming occurs |
| `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` | DIRECTIVE/OPEN | **cleared, and well** — see §5 |
| `ghost_compare_cause_invisible_slider_frozen` / F-C1 | MAJOR/OPEN | correctly dodged — `tau_brake` excluded everywhere |
| A3 `contrast_state_chips_the_constant…` | cycle-2 candidate | **fix landed** — S3 carries both chips |
| B3 / PASS 7 `theta0_rad` mislabelled inert | cycle-2 candidate | **exploited correctly** — C1 landed |

The existing prevention rule already spells out the fix this scenario needed and did not get:

> *"An arrow that is collinear with apparatus geometry needs REAL GEOMETRY, not depth or colour tricks. (a) The shaft is a mesh cylinder parented to the ArrowHelper group… (b) The apparatus line is then made THINNER AND DIMMER than that shaft by construction, with the ratio written into the constants… (d) The z-offset alone is NOT a fix for this class."*

`rigid_body_rotation` was built with a raw `ArrowHelper` collinear with an axle *thicker than the arrow's own head*. The ratchet was available and was not turned.

## 3 · PASS 2 + 3 — evidence

**Geometry (source):** `:50386` — `ArrowHelper(dir(0,1,0), origin(0,0.22,0), len, RBR_POS_COLOR, headLength 0.24, headWidth 0.16)`. Three.js builds the shaft as a `THREE.Line` (1 px, no thickness) and the cone from `CylinderGeometry(0, 0.5, 1, 5)` scaled by `headWidth` ⇒ cone radius **0.08**. The axle at `:50304` is `CylinderGeometry(0.07, 0.07, 3.4, 20)` — radius **0.07**, opaque, same centreline.

**Pixels (frozen frames, 1280×720).** The arrow's materials are unlit, so its pixels are colour-exact — anything blended is occlusion:

| frame | L-arrow ink on the axle | bbox |
|---|---|---|
| `STATE_1__frozen.png` | **15 px** | 11×6 |
| `STATE_2__frozen.png` | **15 px** | 11×5 |
| `STATE_4__frozen.png` (flipped, amber) | **~6 px** | y 418–421 |

Scanline across the axle at the arrowhead, STATE_1 (`x = 628…652`):

```
y=285: … #879aa3 #90a5af #96abb5 #99aeb8 #99aeb8 #97abb6 #92a7b1 …   ← pure axle grey
y=295: … #67abe1 #90a4ae #96abb5 #99aeb8 #99aeb8 #97abb6 #92a6b1 #5cb1f6 …
y=297: … #71a5cc #76abd2 #96abb5 #99aeb8 #99aeb8 #97abb6 #77acd4 #5cb1f6 …
y=300: … #8698a1 #90a4ae #96abb5 #99aeb8 #99aeb8 #97abb6 #92a6b1 …   ← pure axle grey
```

Two rows, one or two blended pixels each, at the axle's edges. The material colour `#42A5F5` never appears anywhere on screen.

**The explore state, both slider extremes** (clock pinned, only L differs):

| m | L | arrow ink on axle | span |
|---|---|---|---|
| 0.5 | 1.14 | **9 px** | y 341–345 |
| 3.0 | 6.51 | **19 px** | y 266–272 |

A **5.7× change in the taught quantity** moves a 7-px smear 75 px up a pole.

**STATE_1's climactic focal handoff is a total no-op.** Measured across `s1_p4` (`at_ms: 15200`):

```
t14000  meanLum=134.0  massPx=684  markerPx= 796
t15000  meanLum=139.6  massPx=762  markerPx= 819
t17000  meanLum=139.5  massPx=765  markerPx=1150   ← after the handoff
t21000  meanLum=138.5  massPx=727  markerPx=1163
```

Nothing brightens (F-C7: no emissive channel) and nothing dims (`rbr_axle`/`rbr_drum`/`rbr_drum_marker` are in the brighten-only carve-out). Corollary: the DIRECTIVE `state_glow_focal_dims_one_half…` is **not** triggered, so F-C7 in isolation is genuinely near-cosmetic. **All the damage is the occlusion.**

**Live drive** (Playwright, trusted mouse — `PM_rbrSeized: true` confirms the seize):

- **Rule 37 explore motion: PASS** — 0.557 % pixel change sampled 10 s+ after narration ends.
- **Per-state control visibility: exactly as authored** (`visibility`, not `display`): S1/S2/S3 all hidden · S4 → `spin_dir` only · S5 → `m` + `omega0`, **`spin_dir` hidden**. The Rule 38b ring-cut discharge is real.
- **Slider physics correct:** m 2 → 3 ⇒ I 3.06 → 4.34, L 4.59 → 6.51.
- **S4 reverse-spin works:** ω +1.50 → −1.50, L +4.59 → −4.59.
- **F-C3 confirmed live and severe:** the L readout reads `—` on **10 of 10 samples** through the entire trusted drag, returning ~90 ms after release.
- **Zero console errors**, all five states reached in < 70 ms.

## 4 · Per-state table

| state | correct | order_ok | labels_present | reads_sound_off | clearly_different | how_i_would_use | problem_or_missing | pri |
|---|---|---|---|---|---|---|---|---|
| **S1** A spinning body carries angular momentum | Y | Y | **N** | **N** | Y | "Here's the machine — mass spread out here, spinning at this rate, and *this* is what it carries." | s1_4 says "the arrow on the axle shows how much"; the arrow is 15 px inside the axle | **P1** |
| **S2** Slower spin, smaller L | Y | Y | Y | Y | Y | "Watch the predicted number, then watch the brake land on it." | Survives on HUD + chip. The arrow should visibly shrink 4.59 → 1.53 and does not | P2 |
| **S3** Mass position changes L | Y | Y | Y | **Y** | Y | "Same speed — point at that chip. Different L — point at that one." | None material. Best state in the sim; immune by `show_l_arrow: false` | — |
| **S4** L points along the axis | Y | Y | **N** | **N** | **N** | *Cannot be used as designed.* | Title, caption, delta cue and all four sentences are about the arrow's direction. On the flip the only change is a 20-px italic "L" relocating and ~6 px changing hue. Also one static focal across 4 sentences / 22 s, on the invisible object | **P1** |
| **S5** Try it yourself | Y | Y | Y | **N** | Y | "Drag the mass out — let go — read L." | During every drag *both* channels for L are dead: readout `—` (10/10), arrow 9→19 px across 5.7×. A discrete before/after calculator, not a live instrument (Rule 33d) | **P1** |

## 5 · What landed and is good (recorded so Checkpoint C does not re-derive it)

- **C1 binding condition landed** — `theta0_rad: 1.739` on S3; the rod sits broadside and the slide reads as motion *along* the rod.
- **A4 closed, elegantly.** The explore slider band was solved so all reachable L stays inside the faithful arrow range: L ∈ [1.14, 6.51] ⇒ drawn length ∈ [0.228, 1.302] against clamp floor 0.22 / ceiling 1.80. Careful work — invisible until P1-1 lands.
- **A3 closed** — S3 carries both the changed quantity (`before: 4.59`) and the held one (`same speed: 1.50`).
- **F4 closed** — all five `label` strings are the approved Rule 41 titles; no authoring-note leakage.
- **F5 closed** — `spin_dir` genuinely hidden in S5 (measured, not assumed).
- **PASS 14 fix real** — D5 armed on 5/5 states (0.49 %–0.98 %).
- **Rule 31 clean** — narration 54/46/53/52/11 words; five distinct archetypes; delta cues 4/5/4/5/3 words; 2 distinct advance modes.
- **The primary aha lands.** Stop (7.4 s) → chip at 7.8 s → slide 9–16 s at rest → restart 17.5 s → `L = 0.99` beside `before: 4.59` with `ω = 1.50` beside `same speed: 1.50`. To someone watching once, it reads. The `every_ms: 99000` workaround is doing its job.

## 6 · Findings

### P1-1 · **BLOCKING** · engine · the L vector is not drawn
`FIX(engine)` → **`peter_parker:field3d_surgeon`**
Evidence: `:50386` vs `:50304`; `STATE_1__frozen.png` 15 px / 11×6; scanline §3; `STATE_4__frozen.png` ~6 px; explore extremes 9 px → 19 px across 5.7× L.
Recurrence of `field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line` (MAJOR/FIXED) and of the pixel-scan rule in `nlb_force_arrow_anchored_at_body_centre…` (CRITICAL/FIXED).
**Fix shape** is already written in the existing scar's `prevention_rule` (a)+(b)+(d) — mesh-cylinder shaft parented to the ArrowHelper group, head refitted to `len − headLen`, apparatus line made thinner **and** dimmer with the ratio in the constants. The axle is currently *thicker* than the arrow's head, so (b) requires touching `RBR_AXLE` geometry, not only the arrow.

**Acceptance criteria for re-review** (objective — no second taste pass needed):
1. S1 frozen: hue-gated `rbr_l_arrow` ink **≥ 400 px** (15 today).
2. Drawn-length fidelity: `len(L=6.51)/len(L=1.14) = 5.71 ± 0.10` measured **in pixels**, fitted intercept **< 1 px**.
3. Arrow stroke contrast **≥ 3:1** against the axle behind it.
4. S4: flipping the spin changes **≥ 300 px** in the axle column.

### P1-2 · **BLOCKING (conditionally)** · engine · every readout blanks for the whole explore drag
`FIX(engine)` → **`peter_parker:field3d_surgeon`** — already filed as **F-C3** (PASS 3) / candidate **A5**.
Evidence: 10/10 samples read `—` through a trusted drag; returns ~90 ms after release. `rbrRestartNow` → `evRepinT` → `rbrBlanked` fires on every `input` event (`:50074`/`:50078`).
**Routing note:** blocking *jointly* with P1-1. If P1-1 lands and the arrow carries L continuously through a drag, this degrades from fatal to annoying — will be downgraded to ride-along at re-review, on evidence. Sequence P1-1 first.

### P2-1 · authoring · S4 holds one static focal across 4 sentences / 22 s
`FIX` → **`alex:physics_author`**
`STATE_4.rigid_body_rotation` has `glow_focal: "rbr_l_arrow"` and **no `phases[]`**; 0/18 sentences carry `glow` (inert on rbr per F-C5, so `phases[]` is the working channel — used correctly in S1/S2/S3, absent in S4/S5). Widens OPEN scar `concept_ships_zero_narration_glow_bindings`.
Ask: give S4 a `phases[]` tracking its narration — `rbr_grip_hand` during s4_2, `rbr_l_arrow` during s4_3, `rbr_mass` during s4_4. Both other tokens are real and **visible today**, so this improves S4 independently of P1-1.

### P2-2 · authoring · Rule 38g — the CBSE tag asserts `verified: true` with no teacher record
`FIX` → **`alex:json_author`**
`curriculum_tags.entries[0]` = `verified: true, needs_teacher_verification: false`; the other six correctly carry `true`. Tags are CLAIMS; the home board is not exempt.

### P3 · minor
- **`s2_4` idiom** — "falls **in step with**" → "**in proportion to**". Plainer (41a) and more precise: with I fixed, L ∝ ω exactly. → `alex:physics_author`
- **`theta0_rad` omitted on STATE_2 only** — inert, cosmetic. → `alex:json_author`
- **Ring-cut orphans** — cutting the extended ring (S4) leaves `coverage_map.by_state.STATE_4` = `[q5, q6]` orphaned and `entry_state_map.vector_direction` dangling. The cut is coherent *on canvas*; these two blocks are not cut with it. → `alex:architect`
- **`every_ms: 99000` must be dropped when F-C6 lands** — provenance recorded in PASS 12; re-stated so it rides the same engine pass.

## 7 · `engine_queue`

| # | finding | owner | tag |
|---|---|---|---|
| 1 | **P1-1** L arrow occluded by the axle | `peter_parker:field3d_surgeon` | **blocking** — widen the existing arrowhelper class, do not mint a new one |
| 2 | **P1-2 / F-C3** re-pin blank on every `input` | `peter_parker:field3d_surgeon` | **blocking**, re-evaluate after #1 |
| — | F-C7 (emissive) | `peter_parker:field3d_surgeon` | ride-along — **do not fix alone; its probe passes while the arrow stays invisible.** A mesh shaft with `MeshPhongMaterial` closes both at once |
| — | F-C6 (one-shot `restart` → NaN) | `peter_parker:field3d_surgeon` | ride-along (filed) — on landing, drop `every_ms: 99000` |
| — | F-C5 (no `glowTargets` fallback) | `peter_parker:field3d_surgeon` | ride-along (filed) |

## 8 · Candidate scar rows

**Row A — AMENDMENT, not an INSERT** (`bug_class` is the upsert key and this class exists):
`field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line` → status `OPEN`, severity `CRITICAL`, `concepts_affected` widened to include `angular_momentum` + `conservation_of_angular_momentum`; `root_cause` appended with the recurrence and the new two-sided constraint (apparatus line thicker than the arrow head); `prevention_rule` appended with "clause (b) is TWO-SIDED — the head must clear the apparatus silhouette; verify with a pixel scan before the first Checkpoint B, never from the material or the computed length."

**Row B — NEW class:** `arrow_invisibility_root_caused_from_material_properties_without_a_pixel_scan_so_the_filed_fix_would_not_have_restored_it` (MAJOR, `peter_parker:field3d_surgeon`). Prevention: measure on-screen ink before proposing a mechanism; **pair every delta assertion with an absolute floor**, since a delta probe cannot detect absence.

**Row C — NEW class:** `curriculum_tag_asserts_verified_true_for_the_home_board_with_no_teacher_record` (MODERATE, `alex:json_author`, `row_type: directive`).

**Widenings:** `concept_ships_zero_narration_glow_bindings` — add `angular_momentum` (S4/S5 carry neither channel). Candidate **A5** — append the live measurement (10/10 `—` under a trusted drag).

## 9 · Five frames to look at first

1. `.visual_runs/angular_momentum/20260804-181916/STATE_4__frozen.png` — the state whose entire payload is L's direction. The "vector" is an italic letter below the drum.
2. `<scratchpad>/s1_axle.png` — 6× crop of the STATE_1 axle. The whole finding in one image.
3. `.visual_runs/angular_momentum/20260804-181916/STATE_3__dense_t17000.png` — the best-composed frame, and why this concept is worth holding for the fix.
4. `.visual_runs/angular_momentum/20260804-181916/STATE_3__dense_t19000.png` — the aha, landed.
5. `.visual_runs/angular_momentum/20260804-181916/STATE_1__frozen.png` — "the arrow on the axle shows how much," said over a bare grey pole.

---

```
RUBRIC (advisory, unratified — docs/EXEMPLAR_RUBRIC.md; did not affect the verdict)
  D1 2 · D2 1 · D3 1 · D4 2 · D5 2 · D6 2 · D7 2 · D8 2 · D9 1 · D10 2   = 17/20

  weakest: D3 narration→canvas binding — 0 of 18 sentences carry a glow. The channel is
           provably inert on this scenario (F-C5) and phases[] is used well in S1/S2/S3,
           but S4 and S5 carry neither.
           D9 curriculum-flex — rings and the cut are genuinely coherent and the explore
           state is core-only (verified live), but the CBSE cell asserts verified:true
           against Rule 38g, and cutting the extended ring orphans coverage_map q5/q6 and
           entry_state_map.vector_direction.
  also 1:  D2 arc — the aha sits at 60% (state 3 of 5); exemplars land at 33–50%. S1 and
           S2 are both load-bearing, so neither should be cut; noting, not asking.
```

**Reporting only** — no file edited, no SQL applied, no agent dispatched, nothing touched in `visual:approve` / TTS / `PILOT_CONCEPTS` / deploy. The APPROVE this concept eventually earns will be authoring sign-off only; shipping stays founder-only under Rule 17.

**Next step:** dispatch `peter_parker:field3d_surgeon` (via Desk E) on engine-queue item 1 as a single `bug_class` — the amendment to `field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line` — then return for re-review against the §6 acceptance criteria. Fix cycle 1 of 3.
