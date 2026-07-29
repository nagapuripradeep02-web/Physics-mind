# Chemistry block — `sigma_pi_bonding` (P4 #17)

Pipeline: architect → **chemistry_author** (this file) → json_author → quality_auditor.
Input: `docs/concepts/chemistry/sigma_pi_bonding_skeleton.md` (read completely). Cross-checked
against `docs/patterns/chemistry.md` (archetype P2, §0 triangle, §5 helpers, §6 sources) and the
structural precedent `src/data/concepts/chemistry/hybridisation_sp_sp2_sp3.json` +
`docs/concepts/chemistry/hybridisation_physics_block.md`.

**Verification performed by this session (independent re-run, not a re-read of the skeleton's
numbers):**
- `node docs/concepts/chemistry/sigma_pi_physics.js` — re-run in full, **ALL CONTROLS PASS**
  (Q1–Q6), reproducing every number the skeleton cites to the same precision (2p 90% tip 482.980 pm;
  Z_eff 3.250; sp²–sp² σ front/back ratio 1.62; S(0)=0.270339 with max deviation from S(0)cos φ =
  2.04×10⁻¹⁸ at 90°).
- `node docs/concepts/chemistry/sigma_pi_mo_builder.js` — re-run in full, **BUILDER VERIFIED**,
  including the twisted-90° "centroid falls OUTSIDE the region" finding that rules out drawing a
  fused surface through the twist.
- **New verification this session** (`sigma_overlap_check.js`, scratch harness, not committed —
  reproducible from the method below): the σ overlap integral S_σ = ∫ψ_A ψ_B dV for the sp²–sp²
  bonding pair at the C=C separation, evaluated with B's hybrid axis rotated by φ about the bond axis
  z ∈ {0°,30°,60°,90°,180°,270°,359°}, returns **S_σ = 0.744949 at every angle tested, to the same
  displayed precision** — not merely numerically stable, but an algebraic identity: `osHybPsi(f, r,
  cosA)` has no azimuthal argument, and B's own hybrid axis is `[0,0,-1]`, i.e. **parallel to the spin
  axis**, so rotating it about z is a no-op on the axis vector itself (`[0,0,-1]` rotated about z is
  `[0,0,-1]` identically); since the field is a function of `(r, cosA)` only, every point's density is
  pointwise invariant under the rotation. This is the exact reason S3's readout provably cannot move,
  and gives S3 a real HUD instrument (`engine_bug_queue` row `gas_box_state4_asserts_unchanged_speed_
  with_no_instrument`, generalised below into S3's HUD design in §4 — **rendered as the
  self-normalised `S/S₀ = 1.000`, not this bare 0.744949; see Revision note item 7**).
- `python3` cross-check of the enthalpy arithmetic, the electron-pair/bond-order ledger, and the
  Slater Z_eff formula, independent of both JS harnesses — all match (§3).

---

## Skeleton gaps and corrections (flagged, not silently patched)

1. **The skeleton has no §5/§6/§7 of the architect's own 10-section output contract** (`has_
   prebuilt_deep_dive` states, drill-down `cluster_id`s, `entry_state_map`) — confirmed by grep, zero
   hits for "deep_dive", "entry_state", or "drill" anywhere in the file. This is a genuine coverage
   gap, not a design choice (nothing in §1–§8 explains an intentional omission). Per my role's
   Escalation clause this would normally route back to architect; the dispatching agent explicitly
   asked for drill-down phrasing regardless, so **§5 below proposes 3 `has_prebuilt_deep_dive`
   candidate states + 6 `cluster_id`s (chemistry_author-authored, pending architect confirmation)**.
   `entry_state_map` is NOT supplied here — it is architect's structural/routing artifact, outside
   this role's 6-section output contract, and is flagged separately for the pipeline owner.
2. **S9's word budget (~25) reads as a violation of "explore = 0/open" (Rule 31a) on its face.**
   Resolved as: 0/open sets the FLOOR at zero, not a ceiling ban — a single short orientation
   sentence before the sandbox goes fully live is the shipped convention elsewhere (matches Rule 37's
   "authored as `interaction_complete`... continuous-run" design, which presumes a brief opener). No
   new TEACHING content may live in those ~25 words — orientation only ("try any bond, drag the
   twist, watch σ and π respond" register). Not a defect; noted so json_author doesn't over-invest.
3. **S8's honest-geometry conflict (the real physics error risk in this skeleton).** §6's engine
   contract only scopes sp²–sp² σ + 2p–2p π at the C=C (133.9 pm) geometry — there is no sp-hybrid
   field, no C≡C (120.3 pm) rebuild anywhere in §5/§6. But S8 teaches "a triple bond is one σ and TWO
   π" using the word "triple bond," which a viewer will read as C≡C. **Design decision made here:**
   S8 REUSES the S1–S7 apparatus unchanged (same nuclei, same C=C spacing, same sp²–sp² σ) and adds a
   SECOND, independently-built π pair rotated 90° in azimuth about the bond axis — this needs zero new
   engine capability (it is a second instance of the already-scoped `kind:"mo"` π-field construction
   with `axis=[0,1,0]` instead of `[1,0,0]`, confirmed orthogonal to the first by symmetry, zero cross
   term). The real C≡C bond length (120.3 pm) and enthalpy (839 kJ/mol) are shown **only as text/HUD
   facts**, never as something the rendered geometry embodies. **The on-canvas wording MUST make this
   explicit** — see §4 S8 and §6 constraint callouts. If the founder wants a geometrically honest
   sp-hybrid rebuild instead, that is new engine scope (a third hybridisation type) and must be a
   `peter_parker:renderer_primitives` ask, not something json_author improvises.
4. **The same simplification recurs at S9's `bond=single` toggle** (explore control, per architect's
   table: "bond · twist · σ/π visibility · dots"). Hiding the π MO and calling the remainder "a single
   bond" reuses the SAME sp²–sp² σ rather than rebuilding a true sp³–sp³ σ (which single C–C bonds
   actually have). This is chemically directionally correct for the concept's one teaching point
   (no π ⇒ free rotation, matching real chemistry) but the σ SHAPE shown is not a real single bond's
   shape. Flagged for the same reason as item 3 — an honest simplification, not a silent one.
5. **`physics_engine_config.formulas` dialect note.** The chemistry_author output contract's generic
   guidance ("PM_interpolate syntax... wrap angles in `radians()`") describes the PCPL/parametric
   contract. `sigma_pi_bonding` is `field_3d` (`scenario_type: orbital_shapes`, `kind:"mo"`), which
   does not run PM_interpolate at all (CLAUDE.md §1's PCPL naming-trap note; confirmed by precedent —
   `hybridisation_sp_sp2_sp3.json`'s and `atomic_orbitals_s_p_d.json`'s `formulas` blocks are
   documentation strings, e.g. `"psi_h = -c_s psi_2s + c_p psi_2p, ..."`, read by `loadConstants` for
   chat/explain, never evaluated by a runtime expression engine). §2 below follows that SAME
   documentation-string convention. `radians()` IS the correct dialect for any degree conversion
   written here — confirmed against `engine_bug_queue` row `pcpl_radians_helper_missing`, whose
   `prevention_rule` states explicitly: *"radians() is the field_3d/mechanics_2d dialect... In
   PCPL/parametric expressions ALWAYS convert degrees with `theta * PI / 180`, never radians(theta)"*
   — i.e. the ban is PCPL-only; field_3d is exempt and radians() is correct here.
6. **`render_annotations: true` must be set.** Several states below author `scene_composition`
   annotations (formula surfaces, fact labels, node-plane callouts). Per the hybridisation review
   round's lesson (g) in `docs/patterns/chemistry.md` §1 (P2 authoring lessons, item f): *"scene_
   composition annotations do not reach the renderer unless the concept sets render_annotations:
   true."* json_author must set this at authoring time, not discover it missing in THE EYE.
7. **Cross-state overlap-comparison defect (coordinator review, post-initial-draft) — FIXED in this
   revision.** The first draft had S3 print a bare `S_σ = 0.745` and S6 a bare `S_π` ticking
   `0.270 → 0.000`. Both are ∫ψ_Aψ_B dV over unit-normalised ψ in the SAME ρ units at the SAME Rb,
   two states apart, on the same apparatus, both labelled "overlap" — directly comparable, so a
   viewer reads 0.270/0.745 ≈ 0.36 as "π is 36% as strong as σ." S7 then teaches the strength ratio
   as 266/348 ≈ 0.76 — **the sim would have asserted two different "how much weaker is π" answers,
   differing by more than 2×, across three consecutive states.** Overlap integral is not proportional
   to bond enthalpy (a hybrid orbital and a pure p orbital enter the two integrals, and bond energy
   depends on more than overlap magnitude alone); nothing was on screen to say so, and Rule 34
   forbids fixing it with an on-canvas prose caveat (one formula surface, value-only HUD — no room
   for a footnote). **Fix: every overlap readout is now SELF-NORMALISED (S/S₀), never a bare
   absolute value, and S3/S6/S9 never expose two different bonds' absolute overlaps in the same
   session.** S3 now shows `S_σ/S_σ(0) = 1.000` (constant — proving invariance is exactly as
   legible this way, and still a REAL live instrument, not a hardcoded label, since it is
   recomputed each frame from the current spin angle and demonstrably does not tick). S6 now shows
   `S_π/S_π(0)` ticking `1.000 → 0.707 (45°) → 0.000 (90°)` — the PRIMARY-aha payoff (reaching
   exactly 0.000 at 90°) is UNCHANGED. The absolute values (`S_pi_0 = 0.270339`,
   `S_sigma_0 = 0.744949`) are RETAINED in §2/§3 as derivation provenance — json_author needs them
   to compute the ratios — but are never rendered side by side on canvas. §7 gains an eighth
   constraint forbidding this comparison class outright, and S9's sandbox (which re-creates the same
   trap via the `bond_order` toggle) is fixed the identical way — see §4 S9.

---

## 1. Orbital / electron-count ledger (no stoichiometric reaction is shown)

This concept depicts ONE bond-forming interaction inside a fixed pair of carbon atoms — it is not a
reaction (no LHS species transform into RHS species), so the CLAUDE.md contract's "balanced-equation
ledger... for EVERY reaction the concept shows" is **not literally applicable** (there is no
reaction). The domain-correct substitute, in the same conservation-first spirit, is an
**orbital-count and electron-pair ledger** — every construction beat below conserves the input
orbital count and the input electron count exactly, and the bonding electrons account for the taught
bond order precisely (this is the chemistry fact the whole concept turns on: "bond order = number of
shared electron pairs," not "number of identical lines").

**Orbital-count audit per construction beat (measured against `sigma_pi_mo_builder.js`'s own
component counts, not asserted):**

| Beat (state) | Orbitals IN | MO built | Orbitals/electrons OUT |
|---|---|---|---|
| σ construction (S2) | 2 sp² hybrid lobes (1/carbon, front lobe along the bond axis) | 1 bonding σ MO (ψ_A+ψ_B) — measured 3 components: 1 big spanning lump + 2 small back-lobe stubs (same MO, not a second one) | 2 electrons, 1 shared pair. σ\* antibonding exists but is NOT built (§7 limit 4 — deliberate omission, no state ever implies it is the whole story) |
| π construction (S5) | 2 unhybridised 2p orbitals (1/carbon, perpendicular to bond axis) | 1 bonding π MO (ψ_A+ψ_B) — measured 2 components, EACH spanning both nuclei (the "2 lumps, axis in a node" picture) | 2 electrons, 1 shared pair. π\* antibonding not built (same omission) |
| 2nd π addition (S8) | 2 MORE unhybridised 2p orbitals (1/carbon, perpendicular to BOTH the bond axis and the first π's axis) | 1 second bonding π MO, orthogonal to the first (zero cross-overlap by symmetry — the two π systems never mix) | 2 electrons, 1 shared pair |

**Electron-pair / bond-order ledger (the actual chemistry fact the concept teaches, verified by
counting — independently cross-checked in Python, §3):**

| Bond | σ pairs | π pairs | Total shared pairs | Bond order |
|---|---|---|---|---|
| C–C single | 1 | 0 | 1 | 1 |
| C=C double | 1 | 1 | 2 | 2 |
| C≡C triple | 1 | 2 | 3 | 3 |

This table IS the refutation of the misconception (§2 of the skeleton): a double bond is not "two of
the same," it is 1 σ pair (on-axis) + 1 π pair (off-axis, node on the axis) — different regions of
space, different symmetry, different strength (§4 S7).

**Charge:** every species neutral throughout — 2 carbon nuclei (core charge screened to Z_eff = 3.25
each), no ions anywhere in this concept, LHS = RHS = 0 trivially at every state, every twist angle,
every bond order.

**Redox / oxidation numbers:** **not applicable** (distinct from "out of scope") — there is no
species transformation to assign oxidation states across. No oxidation-number label appears anywhere.

---

## 2. Quantities (`physics_engine_config.variables` / `formulas` / `computed_outputs`)

| Name | Meaning | Unit | Min | Max | Default | Ring(s) used | Role |
|---|---|---|---|---|---|---|---|
| `twist_deg` | twist angle φ of atom B's π-forming p orbital about the bond axis | ° | 0 | 90 | 0 | S6 (live), S9 | independent (slider) |
| `S_pi_ratio` | **THE RENDERED π instrument** — S_π(φ)/S_π(0), self-normalised (Revision note item 7) | dimensionless | 0 | 1 | 1 | S6, S9 (bond=2) | derived: `cos(radians(twist_deg))` — recomputed live each frame, never hardcoded |
| `S_pi_0` | reference π overlap S(0), C=C separation, Z_eff=3.25 — **provenance constant only, NEVER rendered as a bare number** | dimensionless | — | — | constant 0.270339 | internal only | constant (VERIFIED, §5d/Q6, max deviation from cos law = 2.04e-18 at 90°) |
| `S_sigma_ratio` | **THE RENDERED σ instrument** — S_σ(spin)/S_σ(0), self-normalised (Revision note item 7) | dimensionless | 1 | 1 | 1 (proven identity — still computed live from the current spin angle each frame, never hardcoded) | S3, S9 (bond=1) | derived: `S_sigma(spin_angle) / S_sigma_0` ≡ 1.000 |
| `S_sigma_0` | reference σ overlap (any angle — proven invariant) — **provenance constant only, NEVER rendered as a bare number** | dimensionless | — | — | constant 0.744949 | internal only | constant (VERIFIED, this session's harness, exact to the displayed precision at every angle tested) |
| `bond_order` | which bond the apparatus shows | — (1\|2\|3) | 1 | 2 (S9 core-ring cap; 3 permitted only S7/S8) | 2 | all | independent (selector) |
| `d_CC_single` | C–C single bond length | pm | — | — | constant 153.5 | S9 (bond=1) | constant |
| `d_CC_double` | C=C double bond length | pm | — | — | constant 133.9 | S1–S9 (home-pose apparatus separation) | constant |
| `d_CC_triple` | C≡C triple bond length | pm | — | — | constant 120.3 | S8 | constant — **HUD/label fact ONLY, never the rendered separation** (§ Skeleton gaps item 3) |
| `Z_eff` | Slater effective nuclear charge, carbon 2p | dimensionless | — | — | constant 3.25 | all | constant — **display as "Z_eff ≈ 3.25 (Slater)"**, never bare "=" (§7 limit 3: SCF gives ≈3.14, this is a rules-of-thumb approximation) |
| `E_CC_single` | C–C bond enthalpy (ethane, sp³–sp³) | kJ/mol | — | — | constant 348 | S7 | constant — **textbook convention, not a derived quantity** |
| `E_CC_double` | C=C bond enthalpy (ethene, sp²–sp²) | kJ/mol | — | — | constant 614 | S7 | constant — **textbook convention** |
| `E_CC_triple` | C≡C bond enthalpy (ethyne, sp–sp) | kJ/mol | — | — | constant 839 | S8 (fact card only) | constant — **textbook convention** |
| `E_pi_double` | derived π contribution to the double bond | kJ/mol | — | — | — | S7 | `computed_output`: `E_CC_double - E_CC_single` = 266 |
| `enclosure` | iso-surface contour fraction | fraction | — | — | constant 0.5 | all MO surfaces | **authoring constant, NOT student-facing** — 50% only, never 90% (§5b, §7 limit 5: 90% fuses and stops being countable) |
| `show_sigma` | σ surface visibility toggle | 0\|1 | 0 | 1 | 1 | S9 | presentation_only |
| `show_pi` | π surface visibility toggle (π1 only; π2 never exposed in S9, core-ring cap) | 0\|1 | 0 | 1 | 1 | S9 | presentation_only |
| `dots` | measurement-dot swarm size (probability-sampling visualisation, NOT a literal particle count — see §6) | count | 100 | 3000 | 1200 | S3–S9 | presentation_only |

**`formulas` (documentation strings — see Skeleton-gaps item 5 for the field_3d dialect note; these
are read by `loadConstants` for chat/explain, not evaluated by a runtime PM_interpolate engine):**

```
S_pi(twist_deg) = S_pi_0 * cos(radians(twist_deg))
   -- EXACT closed form, verified by direct quadrature to 2e-18 max deviation at every
      sampled angle 0-90 deg (sigma_pi_physics.js Q6). twist_deg in DEGREES; radians()
      is the correct field_3d conversion dialect (see Skeleton-gaps item 5).
      DERIVATION PROVENANCE ONLY -- S_pi itself is never rendered (Revision note item 7).
S_pi_ratio(twist_deg) = S_pi(twist_deg) / S_pi_0 = cos(radians(twist_deg))
   -- THE RENDERED QUANTITY (S6, S9 bond=2). Self-normalised: 1.000 at phi=0, 0.000 at
      phi=90 -- the PRIMARY-aha payoff is unchanged. Removes the false cross-state
      comparison against S_sigma_ratio / S7's enthalpy ratio (Revision note item 7).
S_sigma = 0.744949 (constant for all twist/spin angles)
   -- exact identity: osHybPsi(f, r, cosA) carries no azimuthal argument, and the
      hybrid's own axis coincides with the bond/spin axis, so rotation about it is a
      no-op on the axis vector itself. Not a numerical coincidence.
      DERIVATION PROVENANCE ONLY -- S_sigma itself is never rendered (Revision note item 7).
S_sigma_ratio(spin_angle) = S_sigma(spin_angle) / S_sigma_0 = 1.000 always
   -- THE RENDERED QUANTITY (S3, S9 bond=1). Recomputed live from the current spin
      angle each frame (not a hardcoded "1.000" string) -- a real instrument that
      demonstrably never ticks, satisfying engine_bug_queue row
      gas_box_state4_asserts_unchanged_speed_with_no_instrument.
E_pi_double = E_CC_double - E_CC_single
   -- 614 - 348 = 266 kJ/mol. TEXTBOOK CONVENTION composed from two different
      hybridisations (sp3-sp3 sigma proxy vs the real sp2-sp2 sigma of ethene) --
      an approximation, not an identity (skeleton section 7 limit 2). Must never be
      captioned with false precision (e.g. never "266.0" as if measured to a decimal).
E_pi_triple_avg = (E_CC_triple - E_CC_single) / 2
   -- 245.5 kJ/mol. COMPUTED HERE FOR THE RECORD ONLY -- NOT a computed_output, NOT
      displayed on any canvas. It disagrees with E_pi_double (245.5 vs 266) purely from
      mixing three different hybridisations in one subtraction chain -- exactly why S8
      is designed with NO energy readout (DoD requirement, independently justified by
      this arithmetic: the decomposition is internally inconsistent, so asserting either
      number as "the" pi energy of a triple bond would be a false-precision claim).
```

**`computed_outputs`:** `S_pi_ratio, S_sigma_ratio, E_pi_double` (exactly these three; bare
`S_pi`/`S_sigma` and `E_pi_triple_avg` are explicitly EXCLUDED — if any of them ever reaches a
rendered field, that is a defect, not a feature; see Revision note item 7 and §7 constraint 8).

---

## 3. Number lock (sanity checks RUN, not eyeballed)

**S(φ) = S(0)·cos φ at the seven table angles** (matches `sigma_pi_physics.js` Q6 exactly, and my
independent Python re-check). **The absolute column is internal derivation provenance ONLY — NEVER
rendered on canvas (Revision note item 7, coordinator review).** The ratio column is the actual
ON-CANVAS instrument (S6, S9 bond=2):

| φ | S_pi absolute (provenance only, not rendered) | **S_pi_ratio = S_pi/S_pi_0 (ON-CANVAS)** |
|---|---|---|
| 0° | 0.270339 | **1.000** |
| 15° | 0.261127–0.261128 (sub-ppm rounding between quadrature and closed form) | 0.966 |
| 30° | 0.234120–0.234121 | 0.866 |
| 45° | 0.191159 | **0.707** |
| 60° | 0.135170 | 0.500 |
| 75° | 0.069969 | 0.259 |
| 90° | **0.000000** | **0.000** |

**S_σ = 0.744949 at φ = 0°, 30°, 60°, 90°, 180°, 270°, 359°** — identical to the displayed precision
at every angle (this session's harness); **absolute value is provenance only, NEVER rendered.**
**S_sigma_ratio = S_σ(spin)/S_σ(0) = 1.000 at every one of those angles — this IS the ON-CANVAS
instrument (S3, S9 bond=1).** S3's HUD shows `S/S₀ = 1.000` with total confidence that it will never
move, because it cannot: the identity is proven above, not merely observed.

**Bond-enthalpy arithmetic (Python-independent, §2):** `614 − 348 = 266` ✓ matches the skeleton's
"π is the weaker one: σ 348, π 266 kJ/mol" exactly. Electron-pair ledger: double bond = 1σ+1π = 2
pairs = bond order 2 ✓; triple = 1σ+2π = 3 pairs = bond order 3 ✓ — both match the textbook
definition of bond order as shared-pair count, which is the concept's actual payoff number.

**Z_eff = 6 − (3×0.35 + 2×0.85) = 3.25** ✓ (Python-independent re-derivation of Slater's rule,
matches both harnesses and the skeleton).

**2p 90% tip at Z_eff: 483.0 pm / 3.25 = 148.6 pm** ✓ (Python re-check matches `sigma_pi_physics.js`
Q2's printed 148.6 pm exactly).

---

## 4. Within-state motion timeline (Rule 31) + per-state control spec

**Home pose (Rule 32d, inherited from skeleton §4):** two bare carbon nuclei on the z axis,
horizontal on screen, at the C=C separation (133.9 pm-equivalent world units) for S1–S8; S9's `bond`
selector is the only control that ever changes the apparatus scale (toggling to `d_CC_single`).
**Cause leads effect by ~0.8 s** (Rule 32a) in every state that has a genuine cause/effect physics
pair; construction/reveal-only beats (S1, S4, S8) are paced by a build rhythm instead, still with a
clear beat-to-beat readable gap. **Durations computed from the architect's own word budgets**
(`state_duration_field_overpadded_vs_reveal`: `duration = max(reveal_complete_ms, words/2.8*1000) +
~2000ms settle`, never 1.5–2× that) — given as a target for json_author, not a hard mandate.

| State | Advance | Controls | Target duration |
|---|---|---|---|
| S1 `stick-double` | manual_click | none | ~13000 ms |
| S2 `head-on-merge` | manual_click | none | ~18000 ms |
| S3 `axis-spin` | auto_after_tts | none | ~14500 ms |
| S4 `perpendicular-rise` | manual_click | none | ~16300 ms |
| S5 `sideways-fuse` | manual_click | none | ~19900 ms |
| S6 `torsion-cancel` | manual_click | `twist_deg` (live after ~11800 ms) | ~20000 ms + open hold |
| S7 `dual-value-reveal` | manual_click | none | ~18000 ms |
| S8 `second-pi-add` | auto_after_tts | none | ~16300 ms |
| S9 `free-explore` | interaction_complete | `bond_order`, `twist_deg`, `show_sigma`, `show_pi`, `dots` (ALL) | ~9000 ms intro, then continuous (Rule 37) |

### S1 — `stick-double` (the wrong belief, LEADS alone)

| Window (ms) | Beat | What moves | Driven by |
|---|---|---|---|
| 0–800 | home pose: two bare nuclei | idle-settle only | literal |
| 800–2600 | rod 1 ("bond") grows from A to B on the axis | 1 cylinder primitive | literal |
| 2600–3400 | gap/hold | — | |
| 3400–5200 | rod 2 grows, parallel-offset to rod 1, IDENTICAL colour/thickness to rod 1 (the misconception rendered literally: two of the same thing) | 1 cylinder primitive | literal |
| 5200–6200 | on-canvas consequence annotation: "Two identical bonds — twice the strength, free rotation?" | annotation | |
| 6200–7000 | hold, glow_focus on both rods together (still ONE focal group, Rule 32e) | | |
| **11000–13000** (`ghost_fade_at_ms`) | **both rods dissolve together**, leaving bare nuclei — S1 LEADS and CLEARS alone; nothing here ever shares a frame with S2's real σ | opacity → 0 | literal |

### S2 — `head-on-merge` (real σ; declared contrast/pair partner of S1)

Per-element rhythm (declared obligation, skeleton §4): **both lobes translate/grow simultaneously and
fuse at the moment of contact — a topology change, not a fade.**

| Window (ms) | Beat | What moves | Driven by |
|---|---|---|---|
| 0–600 | opens on the bare nuclei S1 left behind (continuity) | — | |
| 600–2200 (CAUSE) | A's sp² front lobe AND B's sp² front lobe grow outward toward each other, SAME window, symmetric | 2 lobe primitives | literal |
| 2200–3000 (gap ~0.8 s) | hold, lobes nearly touching | | |
| **3000** (EFFECT, discrete) | **topology snap**: the two lobes fuse into ONE bonding σ lump spanning both nuclei (not a cross-fade — an instantaneous mesh-topology change, matching the measured "3 parts, 1 spanning" result) | mesh rebuild | literal |
| 3000–4200 | the two small back-lobe stubs (107 cells each, per Q5) fade in behind each nucleus, completing the real σ MO | 2 stub primitives | literal |
| 4200–5200 | formula surface: "σ (sp²–sp²): ONE bond, on the axis" | formula_box | |
| 5200–6200 | delta annotation contrasting S1: "One bond, not two" | annotation | |
| 6200–18000 | hold, narration closes | | |

### S3 — `axis-spin` (contrast pair with S6; auto-scripted, NO live control)

Per-element rhythm: **rigid rotation, zero shape change — that IS the content.** Since a rotation of a
field that depends only on `(r, cosA from its own axis)` about that SAME axis is a pointwise
no-op (§ this session's verification), the σ mesh is NOT rebuilt frame-to-frame — cheap, and honest,
since nothing physically changes.

| Window (ms) | Beat | What moves | Driven by |
|---|---|---|---|
| 0–1000 | home pose, σ MO from S2 held over (continuity) | — | |
| 1000–1800 | a small coloured reference marker appears near nucleus B, offset at a fixed small radius off the bond axis | marker fade-in | |
| 1800–2600 | glow_focus on the marker (single focal, Rule 32e) — "watch this spin" | | |
| **2600–11400** (scripted, one full 360° revolution, ~8.8 s) | the marker sweeps a full circle around the bond axis; the σ MO surface's SILHOUETTE stays pixel-identical every frame (no rebuild) | marker orbit (rigid) | literal, state-clock driven |
| 11400–12200 | glow_focus moves to the `S/S₀ = 1.000` HUD readout — it never changed | HUD emphasis only | |
| 12200–13000 | formula surface: "S_σ/S_σ(0) = 1 — cylindrically symmetric, unchanged" | formula_box | |
| 13000–14500 | hold, narration closes | | |

### S4 — `perpendicular-rise`

Per-atom staggered reveal (distinct from S2's simultaneous-both and S5's simultaneous-both — this
state is the ONLY one that shows the two atoms' construction sequentially, one at a time, because the
point is "EACH carbon, independently, still has one leftover p" — simultaneity would blur that).

| Window (ms) | Beat | What moves | Driven by |
|---|---|---|---|
| 0–1000 | home pose, σ MO held (continuity) | — | |
| 1000–1800 | small connector/label points at nucleus A | annotation | |
| 1800–3600 | one unhybridised 2p pair (above+below, ⊥ to the bond axis AND the molecular plane) extrudes out of nucleus A ONLY | 2 lobe primitives | literal |
| 3600–4400 | gap/hold — B is still bare, deliberately, to show these are two SEPARATE, not-yet-interacting orbitals | | |
| 4400–6200 | the SAME 2p pair extrudes out of nucleus B | 2 lobe primitives | literal |
| 6200–7000 | label: "unhybridised 2p — perpendicular, not yet touching" | annotation | |
| 7000–16300 | hold, narration closes | | |

### S5 — `sideways-fuse` (declared contrast pair with S2, per skeleton §4)

Per-element rhythm (declared obligation, skeleton §4): **the two lobes RISE perpendicular to S2's
approach axis and fuse LATERALLY into two separate components** — different axis, different
direction, different topology result than S2.

| Window (ms) | Beat | What moves | Driven by |
|---|---|---|---|
| 0–800 | home pose, both perpendicular 2p pairs visible from S4 (continuity) | — | |
| 800–1600 (CAUSE) | A's near-side lobe AND B's near-side lobe tilt/grow toward each other laterally (sideways, not along the bond axis) | 2 lobe primitives | literal |
| 1600–2400 (gap ~0.8 s) | hold | | |
| **2400–3400** (EFFECT) | lateral fusion snap — BOTH the upper pair and the lower pair fuse simultaneously into 2 continuous π lumps, each spanning both nuclei (matches the measured "2 parts, 2 spanning") | mesh rebuild ×2 | literal |
| 3400–4200 | a thin translucent plane containing the bond axis is highlighted: "node — zero density on the axis" | plane + annotation | |
| 4200–5000 | formula surface: "π (2p–2p): TWO lumps, node on axis" | formula_box | |
| 5000–19900 | hold, narration closes | | |

### S6 — `torsion-cancel` (PRIMARY aha; declared contrast pair with S3; live `twist_deg`)

Per-element rhythm (declared obligation, skeleton §4): **rotation WITH shape change, monotone in the
twist angle, with a live numeric overlap falling to 0.00 at 90°. NEVER drawn as the lumps separating**
(§5f) — the total-density surface stays 2 components at every angle including 90° (the four lobes
still touch diagonally); what shrinks is the CONSTRUCTIVE overlap sub-region.

| Window (ms) | Beat | What moves | Driven by |
|---|---|---|---|
| 0–1000 | home pose, π MO from S5 at φ=0 (continuity) | — | |
| 1000–1800 | π MO switches from one neutral colour to TWO sign colours (e.g. blue/red phase) | recolour | |
| 1800–2600 | the CONSTRUCTIVE overlap sub-region (where the phases reinforce) is highlighted distinctly (glow zone) | glow region | |
| **2600–11000** (scripted first pass, 0°→90° over ~8.4 s) | `twist_deg` auto-animates 0→90; the glow (constructive) zone visibly SHRINKS — never separates, the atomic lobes stay touching at every angle | mesh rebuild from precomputed twist ladder (§5d — closed-form readout, no per-frame field solve) | `twist_deg` (state-clock driven) |
| (live, same window) | HUD ticks S/S₀: 1.000 → 0.707 (45°) → 0.000 (90°) — VALUE-ONLY, the symbolic formula `S_π/S_π(0) = cos φ` sits in a SEPARATE static formula overlay (Rule 34b); the PRIMARY-aha payoff (reaching exactly 0.000 at 90°) is unchanged from the pre-revision draft | HUD text | `S_pi_ratio` |
| 11000–11800 | hold at 90°, HUD reads "S/S₀ = 0.000 — overlap gone", glow_focus on the readout | | |
| **11800 onward** | `twist_deg` slider becomes LIVE/seizable — student replays the same physics by dragging it themselves | live | `twist_deg` |

### S7 — `dual-value-reveal` (confronts "twice as strong" directly)

| Window (ms) | Beat | What moves | Driven by |
|---|---|---|---|
| 0–1000 | home pose, twist reset to 0°, σ+π both built (continuity) | — | |
| 1000–1800 (CAUSE) | "σ only" bar stamps: **348 kJ/mol** (labelled: C–C single, ethane, sp³–sp³) | bar/label | literal |
| 1800–2600 (gap ~0.8 s) | hold | | |
| **2600–3400** (EFFECT) | "σ+π" (double bond) bar stamps: **614 kJ/mol** (C=C, ethene) | bar/label | literal |
| 3400–4200 | derivation_step builds live: "π = 614 − 348 = 266 kJ/mol" | derivation text | |
| 4200–5000 | comparison_panel: σ(348) vs π(266) bars side by side, visibly UNEQUAL height — the direct misconception refutation | comparison_panel | |
| 5000–5800 | small caveat annotation: "approximate — mixes bond types" (skeleton §7 limit 2) | annotation | |
| 5800–18000 | hold, narration closes | | |

### S8 — `second-pi-add` (auto_after_tts; reuses the S1–S7 apparatus, per Skeleton-gaps item 3)

| Window (ms) | Beat | What moves | Driven by |
|---|---|---|---|
| 0–1000 | home pose, S7's σ+π(0°) apparatus held (SAME C=C spacing — see honesty note) | — | |
| 1000–1800 | label: "a third bond: rotate 90°, add a second π" | annotation | |
| 1800–2600 (CAUSE) | a faint outline previews where the second π will sit, rotated 90° azimuthally about the bond axis | ghost outline | literal |
| 2600–3400 (gap ~0.8 s) | hold | | |
| **3400–5200** (EFFECT) | second π MO grows in as ONE continuous reveal beat (not S5's two-stage rise-then-fuse-with-gap — a deliberate rhythm difference), coloured distinctly from π1 for countability | mesh build | literal |
| 5200–6000 | ONE formula surface: "1σ + 2π = 3 shared pairs — triple bond"; a compact value-only HUD line alongside it (not a second formula) reads: "C≡C (real): 120.3 pm · 839 kJ/mol" **captioned "shown at the C=C spacing for continuity"** so no viewer reads the on-screen bond length as literal | formula_box + HUD | |
| 6000–16300 | hold, narration closes | | |

### S9 — `free-explore` (sandbox, ALL controls, Rule 37 continuous-run)

| Window (ms) | Beat | What moves | Driven by |
|---|---|---|---|
| 0–~9000 | one short orientation line only (no new teaching content, §Skeleton-gaps item 2) | | |
| continuous | `bond_order` {1: σ only, free rotation, π hidden — reusing the SAME sp²–sp² σ, honesty-flagged item 4; 2: σ+π, twist replay} | mesh swap | `bond_order` |
| continuous | **the overlap HUD SWITCHES instrument with `bond_order`, never shows both at once (Revision note item 7 — this is the SAME S9-sandbox trap the coordinator flagged, fixed the same way):** `bond_order=1` → `S_sigma_ratio` (constant 1.000, proving free rotation — twisting a single bond changes nothing, the identical identity as S3); `bond_order=2` → `S_pi_ratio` (twist_deg-driven, 1.000→0.000, the identical live payoff as S6). Both are self-normalised (S/S₀), so toggling `bond_order` back and forth IS the pedagogical contrast (one instrument holds at 1.000, the other falls to 0.000) rather than an invitation to compare two absolute overlap numbers | `twist_deg`, `bond_order` | live |
| continuous | `show_sigma`/`show_pi` toggle surface visibility; `dots` toggles the measurement-dot swarm | display pass | live |
| loop | motion phase wraps `% 1` (Rule 37) — never freezes | | |

All nine states: apparatus never teleports (Rule 32d); exactly one glow-focal element at any instant
(Rule 32e); only the taught variable's motion changes per guided state (Rule 32b).

---

## 5. Drill-down cluster phrasings (chemistry_author-proposed — see Skeleton-gaps item 1)

The architect skeleton names no `has_prebuilt_deep_dive` states or `cluster_id`s. Proposed here from
the concept's own misconception plan (§2) and PRIMARY-aha designation, **pending architect
confirmation**: S2 (what σ actually is), S6 (the PRIMARY aha — the rotation lock mechanism), S7 (bond
energies). 6 clusters × 5 phrases = 30, matching the `law_of_conservation_of_mass` precedent's
density.

**Cluster `two_lines_vs_one_bond` (S2):**
1. "if a double bond is really just one thing why do we draw it as two lines"
2. "so the two lines on paper dont mean two separate bonds"
3. "why does chemistry even bother with sigma and pi if its still just one double bond"
4. "is the textbook double line just a drawing trick or does it mean something real"
5. "how is one fused blob the same as what i learned as two bonds"

**Cluster `what_is_a_sigma_bond_really` (S2):**
1. "whats actually different about a sigma bond compared to a normal bond"
2. "is sigma just a fancy name for a regular single bond"
3. "why does the sigma bond sit exactly on the line between the two atoms"
4. "do all bonds have a sigma bond hiding inside them"
5. "whats the difference between the sigma bond and just orbitals touching"

**Cluster `why_does_twisting_kill_the_pi_bond` (S6, PRIMARY aha):**
1. "why does turning one carbon make the pi bond disappear"
2. "the atoms dont move apart when i twist so why does the bond die"
3. "how can the overlap go all the way to exactly zero and not just get weaker"
4. "if the pi lobes are still touching at 90 degrees why is the bond gone"
5. "does the pi bond come back if i twist it back to zero"

**Cluster `why_doesnt_sigma_break_too` (S6, contrasts S3):**
1. "if im twisting the same molecule why does only one of the two bonds break"
2. "why is the sigma bond fine with rotation but the pi bond isnt"
3. "whats special about the sigma bond shape that lets it survive spinning"
4. "so is the sigma bond just weaker at resisting the twist or is it a totally different reason"
5. "if i twist far enough does the sigma bond ever weaken even a little"

**Cluster `is_double_bond_twice_as_strong` (S7):**
1. "if a double bond is two bonds shouldnt it just be exactly twice as strong"
2. "why isnt 2 times the single bond energy the same as the double bond energy"
3. "is a triple bond three times as strong as a single bond then"
4. "the numbers dont double so is one of the bonds not actually a full bond"
5. "why would chemists ever call it a double bond if the math doesnt double"

**Cluster `why_is_pi_weaker_than_sigma` (S7):**
1. "why is the pi bond specifically the weaker one and not the sigma"
2. "does the pi bond being weaker have to do with the sideways overlap"
3. "is a weaker bond the same as a shorter bond"
4. "so is a pi bond basically a half-strength bond"
5. "why do people say the pi bond breaks first in reactions if its part of the same double bond"

---

## 6. Notation + dialect ladder (Rule 38c/38d)

- **No advanced ring exists in this concept** (skeleton §3, deliberate — the rotation-lock idea IS
  the core lesson). Rule 38c's ban targets logarithms, calculus rate forms, and quantum notation
  (n, l, m quantum numbers) — **none of those appear anywhere** in this concept. The one borderline
  case: `S(φ) = S(0)·cos φ` (S6, core ring) uses trigonometry. **Judgment call, stated explicitly:**
  cosine is Class 10 board mathematics, not advanced CHEMISTRY notation (unlike logs/calculus/quantum
  numbers, which are genuinely post-core chemistry ideas) — Rule 38c's intent is to gate
  chemistry-specific advanced notation, not general pre-requisite math the student already has. If
  the founder disagrees, this is the ONE line in the whole concept that would need to move behind an
  advanced-ring gate that doesn't otherwise exist — flagged rather than silently assumed.
- **Dual-label once, then bare:** "σ (sigma) bond" and "π (pi) bond" at first appearance in S2/S4
  respectively, bare thereafter. "Overlap integral S" dual-labelled once at S3 (or S6, whichever
  fires first in the authored order), bare thereafter.
- **IUPAC-first naming, common name once in parentheses:** "ethene (ethylene)" at first use (S1 or
  S2), "ethyne (acetylene)" at first use (S8) — bare IUPAC name thereafter, matching NCERT's own
  convention (NCERT already teaches IUPAC-first at this level, so no conflict).
- **Z_eff display convention:** always "Z_eff ≈ 3.25 (Slater)" — the "≈" and the parenthetical are
  both load-bearing (§7 limit 3: SCF gives ≈3.14; asserting bare "=" claims a precision the number
  doesn't have).

---

## 7. Constraint callouts

```json
"constraints": [
  "electron-pair count = bond order at every state: single 1 (1sigma+0pi), double 2 (1sigma+1pi), triple 3 (1sigma+2pi) -- verified by counting the built MOs, never asserted by label alone",
  "S_sigma_ratio (= S_sigma/S_sigma_0) is EXACTLY 1.000 under rotation about the bond axis for every twist/spin angle (proven: the hybrid axis coincides with the rotation axis, so the field is pointwise unchanged) -- S3's and S9's (bond=1) readout must never tick, even by a rounding artifact",
  "S_pi_ratio(phi) = cos(radians(phi)) exactly, reaching 0.000 at 90 degrees -- verified by direct quadrature to 2e-18 max deviation; S6/S9 must MEASURE this from the field's precomputed twist ladder, never hardcode a cosine string as decoration",
  "enclosure is fixed at 0.5 (50%) for every MO surface in every state -- 90% is never used anywhere in this concept (skeleton section 7 limit 5: 90% fuses adjacent lobes and stops being countable)",
  "S6/mo builder: the twisted pi surface is drawn as sign-coloured atomic lobes + a shrinking constructive-overlap region -- NEVER as two lumps visibly separating (the total-density surface stays 2 components, touching diagonally, at every angle including 90 degrees -- see sigma_pi_mo_builder.js)",
  "S8's rendered bond length is the C=C separation (133.9 pm) at every twist/bond-order state including the triple-bond beat -- the real C#C length (120.3 pm) and enthalpy (839 kJ/mol) are HUD/label facts only and must never be implied by the rendered geometry (Skeleton-gaps item 3)",
  "no computed_outputs field named E_pi_triple_avg (or equivalent) may ever be wired to a rendered text/label -- the triple-bond pi decomposition is internally inconsistent (245.5 vs 266 kJ/mol) by construction and must never be displayed as a fact",
  "no state ever renders the sigma and pi overlap magnitudes in directly-comparable absolute form (e.g. a bare 'S_sigma=0.745' beside a bare pi-overlap number) -- the two integrals are taken over different orbital shapes (a hybrid vs a pure p) and are NOT proportional to bond enthalpy (the raw pi range 0.270->0.000 implies a ~0.36 strength ratio that conflicts with S7's true 266/348 (approx 0.76) by more than 2x), so a bare side-by-side reading invites a false 'how much weaker is pi' answer; every overlap HUD (S3, S6, S9) renders ONLY the self-normalised S/S0 ratio, and S9 never shows the sigma-side and pi-side ratios simultaneously (Revision note item 7)"
]
```

(8 assertions — two over the usual 4–6 ceiling, kept because three are load-bearing negative
constraints [items 6/7/8] specific to this concept's honesty risk, not generic boilerplate.)

---

## Self-review

- Every quantity named in §4's timelines traces to a named `variables`/`formulas`/`computed_outputs`
  entry in §2, unit-tagged — no orphan numbers. `S_pi_0`/`S_sigma_0` (provenance, never rendered) and
  `S_pi_ratio`/`S_sigma_ratio` (the rendered instruments, Revision note item 7), all three bond
  lengths, all three bond enthalpies, `Z_eff`, `enclosure` all declared with role + which states/rings
  use them.
- Ledger complete in its domain-correct form (§1: orbital-count audit + electron-pair/bond-order
  table, since no stoichiometric reaction exists here) — charge trivially 0=0 throughout, no oxidation
  numbers (not applicable, not merely deferred).
- Every state (§4) declares its archetype (from the skeleton's own §4 table), a t-window per beat,
  cause-before-effect with the ~0.8 s gap where a genuine cause/effect physics pair exists, and
  controls matching the skeleton's table exactly (only S6 and S9 carry live sliders — S3's rotation is
  deliberately auto-scripted, not draggable, since proving invariance doesn't need the student's own
  input, unlike S6's payoff which is deliberately hands-on). No two states share a motion; the
  declared rhythm differences (S2 vs S5 approach-axis/topology; S3 vs S6 shape-change; S4's per-atom
  stagger vs S2/S5's simultaneity; S8's one-beat reveal vs S5's two-stage rise-then-fuse) are stated
  explicitly, not left to be assumed from the archetype name alone (per the hybridisation lesson: "an
  archetype is a claim about rhythm, not a label").
- Word budgets respected per the skeleton's per-state ranges (25–55 EN words); S9's ~25-word
  orientation line addressed explicitly (§Skeleton-gaps item 2) as within the "0/open" spirit.
- Notation ladder: no logs/calculus/quantum notation anywhere; the one trig function (cos φ, S6) is
  flagged as a judgment call rather than silently allowed through Rule 38c's letter.
- Particle/measurement-dot scale factor declared: `dots` is explicitly NOT a literal particle count
  (it is a probability-sampling visualisation, same convention as `atomic_orbitals_s_p_d`'s seeded
  dot swarm) — stated in §2's variable description to prevent a false "N atoms shown" reading.
- 30 drill-down phrases (5 × 6 clusters) in real student voice, no textbook phrasing, no Hinglish —
  but flagged as chemistry_author-PROPOSED, not architect-confirmed, since the skeleton supplied no
  `cluster_id`s (§Skeleton-gaps item 1).
- Numerical sanity check **run three independent ways**, not eyeballed: both shipped JS harnesses
  re-executed in full this session (all PASS), a NEW harness written and run to establish S_σ's
  invariance (the number S3 needed and didn't have), and a Python cross-check of the enthalpy
  arithmetic, Slater Z_eff, and the electron-pair ledger (§3).
- **Cross-state overlap-comparison defect caught in coordinator review, fixed in this revision**
  (Skeleton gaps item 7): S3, S6 and S9's overlap HUDs previously rendered bare absolute
  `S_σ`/`S_π` values that were directly comparable (same ρ units, same Rb) yet not proportional to
  bond enthalpy — their implied ratio (0.270/0.745 ≈ 0.36) silently conflicted with S7's true
  strength ratio (266/348 ≈ 0.76) by more than 2×. Every overlap instrument now renders ONLY the
  self-normalised `S/S₀` ratio (§2 `S_pi_ratio`/`S_sigma_ratio`); the absolute values survive purely
  as derivation provenance (§2/§3); §7 gained an eighth constraint forbidding the comparison class
  outright; S9's sandbox — the same trap re-entering via the `bond_order` toggle — is fixed
  identically (§4 S9). S6's PRIMARY-aha payoff (reaching exactly 0.000 at 90°) is unchanged.
- Two design decisions NOT resolvable from the skeleton alone (S8's geometry-reuse honesty; S9's
  single-bond σ-reuse honesty) made explicitly here with reasoning, not silently patched, mirroring
  the `law_of_conservation_of_mass` precedent's "corrections to the skeleton" convention.
- Engine bug queue consulted (`alex:chemistry_author` 3 rows, `alex:physics_author` 7 rows,
  `alex:json_author` ~35 rows, `peter_parker:runtime_generation` filtered to `bug_class LIKE
  '%variable%'` → 1 row): every relevant `prevention_rule` applied —
  `superposed_orbital_sign_convention_inverts_the_taught_direction` (the sp²–sp² sign is already
  settled and re-verified, §Verification); `gas_box_state4_asserts_unchanged_speed_with_no_instrument`
  generalised directly into S3's `S_σ/S_σ(0)` HUD requirement (§4, per the Verification section
  above — this instrument survived the coordinator's overlap-comparison fix unchanged in spirit,
  only its display form moved from absolute to self-normalised, Revision note item 7);
  `pcpl_radians_helper_missing` resolved as NOT applicable (field_3d dialect, radians() correct here,
  §Skeleton-gaps item 5); `default_variables_only_first_var_merged` noted as a reminder that every
  declared variable in §2 needs a real `default`, which all of them have.
- Source check line: *"Consulted NCERT Chemistry chapter index (Class 11, Ch.4 §4.7) to confirm
  scope. No teaching method, no example problem, no figure imported. NCERT Exemplar consulted for
  the misconception belief only (skeleton §2), no problem text imported."*
