# Architect skeleton — `sigma_pi_bonding` (P4 #17)

> Written **before** any renderer or JSON code exists — which is the correction the
> hybridisation session paid for. Its quality-auditor FAILed at Gate 0 because no
> skeleton existed, and the four undelivered motions it predicted are exactly what
> shipped: nothing was anybody's *declared obligation*, so nothing checked them.
>
> Every number in §5 and §7 was solved headlessly first
> (`docs/concepts/chemistry/sigma_pi_physics.js`), against the radial functions
> **pulled from the shipped renderer**, with a control that reproduces a number
> already on master. Nothing here is intended; it is measured or it is flagged.

---

## §1 — Tier and the whiteboard test

**Tier: 💎.** NCERT Class 11 Chemistry Ch.4 §4.7 (valence bond theory — σ and π bonds).

A teacher with a board *can* draw a double bond: two lines. They can even say the
words "one sigma, one pi." What a board **structurally cannot do** is the thing the
concept is actually about:

1. **The two bonds occupy different regions of space.** One is a single lump lying
   *on* the internuclear axis; the other is two lumps *above and below* it, with the
   axis itself sitting in a node. Two parallel lines say the opposite — that they
   are the same thing twice.
2. **The payoff: twist one atom about the bond axis.** The σ overlap is unchanged —
   it is cylindrically symmetric, so rotation is a symmetry of it. The π overlap
   *tears*, reaching zero at 90°. This is a 3-D motion with a live number attached,
   and it is the entire reason alkenes have cis/trans isomers and single bonds
   rotate freely. **No board reaches it.**

The diamond is beat 2. The static "one σ, one π" picture is the demo.

**Prerequisite chain (Rule 25, no untaught term):**
`atomic_orbitals_s_p_d` → `hybridisation_sp_sp2_sp3` → **`sigma_pi_bonding`**.

**Founder decision 2026-07-29, honoured here:** this is its OWN concept, not more
states on #13. It is about *two atoms overlapping*, not one atom's orbitals
rearranging — the apparatus changes completely, so Rule 32d home-pose continuity
would break if merged.

---

## §2 — The misconception (Rule 16a)

**Belief:** *A double bond is two of the same bond — two identical lines, so it
should be exactly twice as strong as a single bond, and it should rotate just as
freely.*

Sourced from NCERT Exemplar Ch.4 as a **belief only** (no prose, figure or worked
example imported).

Every clause of that belief is false and the sim refutes each one with a different
beat: **same shape** → S2/S5, **twice as strong** → S7 (348 vs 266 kJ/mol),
**rotates freely** → S6.

> **CORRECTION (audit round, Rule 38a FAIL).** S1 originally put *all three*
> clauses on canvas, including "Twice as strong?" — but that one is answered only
> in **extended-ring S7**. Hide the extended ring and a surviving core state asks a
> question the reduced lesson never answers, which is exactly what 38a's
> coherent-when-cut check forbids. **Fix: the strength clause is DROPPED from S1's
> canvas and narration** and lives entirely in the extended ring. S1 keeps "Two
> identical bonds?" (answered in core at S2/S5) and "Rotates just as freely?"
> (answered in core at S6). The core cut is now self-contained.

> **CORRECTION (audit round, Rule 16a FAIL).** S1 did not show the wrong belief at
> all — measured, its opening frame was **byte-identical to S2's** (0.00% differing
> pixels). It drew the REAL σ bond's own lobes, ran S2's approach at 3× speed, and
> dissolved; the belief existed only as text, and the label "Two identical bonds?"
> fired at the moment the lobes had merged into ONE. The picture said the opposite
> of the caption.
>
> **Root cause: `orbital_shapes` had no rod/cylinder primitive**, so "two identical
> lines" was never buildable and the state was improvised around what existed.
> **Founder decision: build the primitive** — the line picture IS the misconception
> (a "C=C" drawn as two identical lines is what every student has on the page, and
> Lewis structures are NCERT Ch.4 §4.1), so it is curriculum-defined, not an extra;
> a cylinder between two nuclei is cheap; and every future bonding concept
> (Lewis, VSEPR, SN1/SN2) reuses it. S1 now draws N parallel sticks that LEAD ALONE
> and dissolve on a declared cue before the real σ assembles.

**Contrast pair: S1 ↔ S2 (declared).** S1 builds the wrong picture *alone* — two
identical sticks between the nuclei — and states its consequence on canvas. It then
**dissolves** (`ghost_fade_at_ms`) as the real σ assembles in its place.

**The sequencing constraint inherited from #13, non-negotiable:** the ghost and the
real surface must **never share a frame**. Superimposed sets fuse; deleting the
ghost instead trades a legibility defect for a pedagogy one. The wrong picture
LEADS and CLEARS.

---

## §3 — Depth rings (Rule 38)

| ring | states | why |
|---|---|---|
| **core** | S1–S6 | The NCERT §4.7 lesson: the wrong picture, σ by end-on overlap, its cylindrical symmetry, the leftover p, π by sideways overlap, and the rotation lock. |
| **extended** | S7, S8 | Bond *energies* as numbers, and the triple bond. Contiguous, immediately before explore (Rule 38a). |
| **core** | S9 (explore) | Rule 38b — surfaces CORE content only: single/double, the twist dial, σ/π visibility. **No triple, no energy readout.** |

**Coherent-when-cut check (performed, not asserted).** Hide extended ⇒ S1–S6 +
explore still delivers the complete CBSE lesson: what σ is, what π is, how they
differ in shape, and why a double bond cannot rotate. No surviving state references
a bond energy or a second π system. Hiding extended+advanced is N/A — there is
deliberately no advanced ring; the concept's hardest idea (the rotation lock) is
**core**, because it is the reason the concept exists and cutting it would leave the
demo behind.

---

## §4 — The per-state table (REQUIRED artifact, Rule 31)

Home pose (Rule 32d): **two carbon nuclei on the z axis, horizontal on screen, at
the real C=C separation.** Every state is a change to that one apparatus.

| # | ring | teaches | archetype | Δ (≤5 words on canvas) | controls | advance | words |
|---|---|---|---|---|---|---|---|
| 1 | core | the belief: a double bond is two identical lines | `stick-double` — **N real parallel sticks** (bond-stick primitive), leading alone then dissolving | "Two identical lines?" | — | manual_click | ~30 |
| 2 | core | end-on overlap builds ONE bond lying on the axis (**pair with S1**) | `head-on-merge` | "End-on: one σ" | — | manual_click | ~45 |
| 3 | core | σ is cylindrically symmetric — spin it, nothing changes | `axis-spin` | "Spin it: σ unchanged" | — | auto_after_tts | ~35 |
| 4 | core | each carbon keeps one unhybridised p, perpendicular | `perpendicular-rise` | "One p left, sideways" | — | manual_click | ~40 |
| 5 | core | sideways overlap builds π — two lumps, axis in a node | `sideways-fuse` | "Sideways: above and below" | — | manual_click | ~50 |
| 6 | core | **PRIMARY AHA** — the same twist σ ignored kills π's overlap | `torsion-cancel` | "Twist: overlap → zero" | twist | manual_click | ~50 |
| 7 | ext | they are not the same bond: σ 348, π 266 kJ/mol | `dual-value-reveal` | "π is the weaker one" | — | manual_click | ~45 |
| 8 | ext | a triple bond is one σ and TWO π, at 90° | `second-pi-add` | "Triple: one σ, two π" | — | auto_after_tts | ~40 |
| 9 | core | sandbox | `free-explore` | "All yours" | bond · twist · σ/π · dots | interaction_complete | ~25 |

### Declared contrast pairs (the only permitted archetype repeat, Rule 31)

- **S3 ↔ S6 — the load-bearing pair.** *The same input motion, rotation about the
  bond axis, applied to the two bonds, with opposite outcomes.* S3 spins and the σ
  surface is provably unchanged; S6 spins and the π surface pinches, separates and
  reads zero overlap at 90°. Naming them as a pair is what makes the second one
  mean something. **This is the concept.**
- **S2 ↔ S5 — end-on vs sideways.** Both fuse two lobes into one surface; they
  differ in the axis of approach and in the topology of the result (one component
  spanning the nuclei vs two components straddling a nodal plane).

### Rhythm is the archetype, not the name (lesson (d) from #13)

Two states animating the same element count deliver the same motion unless their
*per-element timing* differs. Declared obligations, each to be verified by **diffing
dense frames of the two states**, never by reading the archetype names back:

- **S2** — the two lobes translate toward each other and fuse at the moment of
  contact; the fusion is a topology change, not a fade.
- **S5** — ~~the two lobes rise *perpendicular* to S2's axis~~ **CORRECTED (audit
  round): this declared delta was WRONG and unbuildable.** Both S2 and S5 close
  along the internuclear axis — that is physics; two atoms cannot approach along
  two different lines, and inventing a second direction for π would be a lie. The
  REAL and measured distinguishing delta is **contact**: σ's surfaces genuinely
  MEET mid-approach (211.3 pm, 37.6% of travel) and interpenetrate; π's NEVER meet
  (they would touch at 109.0 pm, *inside* the 133.9 pm bond). The two contact
  events straddle the bond length. That is why π needs a molecular-orbital
  description at all, and it is what the HUD's `contact` line makes legible —
  "surfaces touch at: 211 pm" against "— (flanks only)".
- **S3** — rigid rotation, zero shape change (that IS the content).
- **S6** — rotation *with* shape change, monotone in the twist angle, with a live
  numeric overlap falling to 0.00 at 90°. **It must NOT be drawn as "the lumps come
  apart" — see §5f. They never come apart.**

---

## §5 — Physics, settled first (`sigma_pi_physics.js`, all controls pass)

**Control (the reason to trust the rest).** An independent implementation, reading
the radial functions out of the shipped renderer, puts the 2p 90% tip at
**482.98 pm** against the **482 pm** already on master from `atomic_orbitals_s_p_d`.

### 5a — The scale finding: the shipped orbitals cannot be used as they are

The shipped library is hydrogenic **Z = 1**. Against real bond lengths:

| bond | length | tip/bond at Z=1 | tip/bond at Z_eff = 3.25 |
|---|---|---|---|
| C–C single | 153.5 pm | 3.15 | 0.97 |
| **C=C double** | **133.9 pm** | **3.61** | **1.11** |
| C≡C triple | 120.3 pm | 4.01 | 1.24 |
| H–H | 74.1 pm | 6.52 | 2.01 |

At shipped scale **each lobe reaches 3.6 bond lengths past the other nucleus** —
total interpenetration, which is both unreadable and a lie about overlap. With
Slater Z_eff = 3.25 for carbon 2p the lobes reach just past each other: the
chemically correct and visually readable picture. **A per-orbital Z_eff is therefore
a requirement, not a refinement.**

### 5b — "The same pool, translated" is not a picture of a bond

The pattern doc's forward-compat note says an overlap is "the same pool translated."
Measured on a grid at the C=C separation, against the true MO field ψ_A ± ψ_B:

| enclosure | σ — MO | σ — translated | π — MO | π — translated |
|---|---|---|---|---|
| 90% | 3 parts, 1 spanning | 1 part, 1 spanning | 2 parts, 2 spanning | 2 parts, 2 spanning |
| 70% | 3 parts, 1 spanning | 3 parts, 1 spanning | 2 parts, 2 spanning | 2 parts, 2 spanning |
| **50%** | **3 parts, 1 spanning** | 3 parts, 1 spanning | **2 parts, 2 spanning** | **4 parts, 0 spanning** |

The MO field gives the correct textbook topology at **every** enclosure: σ = one
bonding lump spanning both nuclei plus the two outer back lobes; π = two lumps
straddling a nodal plane, each spanning both nuclei.

The translated picture only agrees at the **90%** contour — and 90% is exactly the
contour #13 proved unusable in a multi-lobe scene, because plump contours fuse and
stop being countable. **At the 50% contour a translated-pool π bond is four
disconnected lobes that never touch**: two atoms standing near each other with a
visible gap, under a caption reading "the π bond." That is the misconception this
concept exists to kill, rendered as the lesson.

> The "4.00× midpoint density" the harness also prints is **not** evidence — at the
> symmetry point ψ_A = ±ψ_B, so (2ψ)²/ψ² = 4 exactly, by algebra. Recorded so nobody
> later mistakes an identity for a measurement.

### 5c — The field that actually ships: sp²–sp², measured (closes §7 limit 1)

Ethene's σ is **sp²–sp²**, not p–p — the honest continuation of what
`hybridisation_sp_sp2_sp3` just taught, and a *different* field (hybrid ψ from the
shipped `osHybPsi`, not pure 2p). Re-measured rather than assumed:

| enclosure | sp²–sp² MO | translated-atomic |
|---|---|---|
| 90% | 3 parts, 1 spanning | 1 part, 1 spanning |
| 70% | 3 parts, 1 spanning | 3 parts, 1 spanning |
| 50% | 3 parts, 1 spanning | 3 parts, 1 spanning |

Same topology as p–p, all components star-shaped (0.0% re-entry) — **and a
materially better picture.** The back lobes collapse from **1145 → 107 cells**: a
hybrid is directional, so the σ reads as one clean lump spanning both nuclei with
only small stubs behind, instead of p–p's three comparable blobs. Chemistry and
legibility point the same way, so the choice is settled on evidence, not taste.

Front lobe verified POSITIVE (|front|/|back| = 1.62 at ρ = 3), which is what fixes
the bonding combination as **ψ_A + ψ_B**. `OS_HYB_SIGN = −1` re-asserted as a
control — #13's load-bearing minus.

### 5d — S6's live readout is EXACT, not fitted

Twisting one atom by φ about the bond axis resolves its p orbital into a parallel
part (cos φ) and a perpendicular part whose overlap vanishes by symmetry, so

**S(φ) = S(0) · cos φ**

Verified by direct quadrature against the shipped ψ: max deviation **1 × 10⁻¹⁴**
across 0–90° (machine precision), with S(90°) = 0.000000 exactly. S(0) = 0.270339.

So S6 prints a **derived law**, not a tuned curve, and the number a student watches
fall to zero is the real overlap integral. It also means the torsion beat needs no
per-frame field solve: the surface comes off a precomputed twist ladder (the shipped
morph-ladder pattern) while the readout is closed-form.

### 5f — THE DEFECT THAT WOULD HAVE SHIPPED: "the π bond breaks" is not a picture of lumps separating

Found by `sigma_pi_mo_builder.js` before a line of renderer code existed, and it is
the most load-bearing finding of the design gate.

The obvious way to animate S6 is: twist, and the two π lumps tear apart. **They do
not.** Measured up the whole twist ladder at the 50% contour, the total-density
surface holds at **2 components at every angle including 90°** — because A's +x lobe
and B's +y lobe still touch *diagonally* once they are perpendicular. The bond is
gone (overlap exactly 0.000000) while the picture still shows two joined lumps.

Animating the tear would have put a caption reading "the π bond breaks" over a
frame showing it visibly intact — the same class as #13's `node_count` clover:
geometrically right, posed wrong, and green through every gate.

**What actually vanishes is the CONSTRUCTIVE region**, and it vanishes by
*cancellation*, not separation:

| twist | constructive | destructive | net (= S) | net/S(0) | cos φ |
|---|---|---|---|---|---|
| 0° | 0.27034 | 0.00000 | 0.27034 | 1.0000 | 1.0000 |
| 45° | 0.20413 | 0.01297 | 0.19116 | 0.7071 | 0.7071 |
| 75° | 0.12386 | 0.05389 | 0.06997 | 0.2588 | 0.2588 |
| **90°** | **0.08589** | **0.08589** | **0.00000** | 0.0000 | 0.0000 |

At 90° the reinforcing and cancelling regions are **exactly equal and annihilate**.
That is a better lesson than "it snaps," it is true, and it independently reproduces
§5d's cos φ law by a completely different computation.

**So S6 draws sign-coloured atomic lobes plus BOTH overlap regions — never a fused
surface being pulled apart.**

> **CORRECTION (2026-07-29, caught by the engine build).** An earlier draft of this
> section said the constructive region "shrinks to nothing." **It does not** — the
> table directly above says 0.08589 at 90°, and the prose contradicted its own data.
> What reaches zero is the **net**. Measured in the shipped engine at a level solved
> once and held, the constructive region goes **489.25 → 106.25 (−78%)**: a strong
> visible shrink, not a disappearance.
>
> The engine's resolution is better than what this skeleton specified: draw **both**
> regions. The cancelling one is *exactly* absent below ~70° and grows to *exactly*
> equal the constructive at 90°. That makes "they annihilate" a **picture** rather
> than a caption. The iso-level must be solved once and **held** — a per-rung
> re-solve collapses the shrink to 40% and paints a phantom cancelling region at 0°
> (negative control 4 in `check:sigma-pi`).
>
> **Second correction.** The "L-shaped centroid falls outside" claim reproduces, but
> it is about the **total-density** field, not the constructive one. Measured against
> each component's own voxel mask, the constructive components are **0.00% re-entrant
> at every rung including 90°** — the root-table pipeline represents them perfectly.
> The conclusion (do not draw a fused surface through the twist) is unchanged; the
> reason is narrower than originally written.

### 5e — Engine cost: star-shaped, so no marching cubes

Per-component ray casting from each component's own centroid, at the 50% contour:

| field | components | re-entry rate | verdict |
|---|---|---|---|
| σ | 3 (12271 / 1145 / 1145 cells) | 0.0% | star-shaped |
| π | 2 (14154 / 14154) | 0.1% (max 2, grid-edge grazing) | star-shaped |

**Every component is star-shaped about its own centroid**, so the shipped
`osLobeGeometry` (delta, azimuth) → radius mesh pipeline is reusable. Marching cubes
is **not** required.

---

## §6 — Engine contract (a NEW capability, honestly sized)

`field_3d` · `scenario_type: "orbital_shapes"` · new **`kind: "mo"`**, additive; the
s/p/d and hybrid paths untouched.

The pattern doc's estimate — *"#17 needs only a per-lobe origin offset (one line)"* —
**does not survive the measurements above.** The real ask, in dependency order:

1. **Signed two-centre field.** The shipped path only ever needs |ψ|² about one
   centre; an MO needs ψ with its sign, because the whole point is that the lobes
   add or cancel.
2. **A 2-D root table over (delta, azimuth).** #13's replacement for `osRhoOuter`
   was a 1-D table over `c`, valid because a hybrid is a surface of revolution about
   its own axis. **A π sausage is not** — its cross-section perpendicular to the bond
   axis is not circular. One dimension wider; same build-once, pure-lookup discipline,
   so the `SET_TIME_FREEZE` byte-identical guarantee is untouched.
3. **A per-component origin.** `osAimFrame` hardcodes `mesh.position.set(0, 0, 0)`
   (`field_3d_renderer.ts:43892`). It needs the component centroid — **and the
   centroid must be spun by `osSpun`**, or an off-origin component will rotate about
   its own centre instead of orbiting the scene.
4. **Z_eff per orbital** (§5a) — a length scale, not a cosmetic.
5. **A second nucleus.** The pool is currently exactly one (`os_nucleus`, ~44035).
6. **The torsion beat.** S6's twist is a *new* motion: the existing spin is a rigid
   rotation of the whole picture; this rotates one atom's contribution relative to
   the other and rebuilds the surface. It is the concept's payoff, so it is not
   optional. **Cost is bounded** — §5d shows the readout is closed-form (cos φ) and
   the surface comes off a precomputed twist ladder, exactly the shipped
   morph-ladder pattern, so no field is solved in a frame and the
   `SET_TIME_FREEZE` byte-identical guarantee is untouched.

**Rule 40 — this is PLATFORM.** It lands on master separately and immediately, never
bundled inside this concept's branch.

**Rule 40a sweep, performed:** `git log --all -S` on `sigma_pi`, `origin_offset`,
`lobe_origin`, `bond_axis` returns **zero** engine hits across all history (the
`sigma` hits in `field_3d_renderer.ts` are Gauss-law surface charge σ = Q/A,
unrelated). Nothing has been built twice.

**Comparable size:** the `kind: "hybrid"` build, not a one-line offset.

### §6a — Founder decisions, 2026-07-29

1. **S8 keeps the captioned C=C reuse.** The triple bond renders at the ethene
   spacing (133.9 pm) with C≡C's real length and enthalpy as HUD/label facts only,
   captioned so no viewer reads the rendered length as literal. No sp-hybrid rebuild,
   no real C≡C geometry. S8 is extended-ring and cuttable, and the alternative is a
   second engine build for one hideable state.

2. **The S2/S5 approach-and-overlap beat IS built — by the cheap path only.**
   Founder criterion: build more engine only where it is *necessary*,
   *curriculum-defined* (not above-syllabus), and *high value for teacher and
   student*. This passes all three — NCERT §4.7 defines a σ bond as formed by
   **head-on overlap** and a π bond by **sideways overlap**, so the approaching
   motion is the syllabus's own language, and it is the whole basis of the
   "end-on vs sideways" distinction that refutes the misconception. A student shown
   only end-states receives labels instead of an observed fact.

   **The marching-cubes topology morph is explicitly REJECTED** — it delivers the
   same teaching value at a much larger cost, failing the "necessary" half of the
   test. The shipped beat translates the already-built atomic sign-lobes together
   (nuclei travelling with them) and cross-fades to the fused MO at contact.

   S2 and S5 must be *distinguishable* motions — lobes closing along their own axis
   vs perpendicular to it — verified by diffing dense frames, never by reading
   parameter names (#13 lesson (d)).

### §6b — The audit round: what the machine gates could not see

`quality_auditor` returned **FAIL** with 7 blocking defects; `eye_walker` independently
found 5. **THE EYE was green 39/39 on every one of those frames** — the fourth
consecutive concept where the deterministic suite passed frames containing critical
errors. Two of the blocking defects were **regressions of scars already marked FIXED**.

The three that generalise beyond this concept:

1. **A silent identity fallback poisons everything downstream.** `os.orbital` is
   unset on an `mo` state (the id lives under `os.mo`), so `baseId = os.orbital ||
   "1s"` activated the 1s ATOMIC orbital in all nine states — painting both a large
   "1s" label and a **1200-dot hydrogen-1s probability swarm over every molecular
   orbital**. The engine's own comment already declared that "an MO simply has no
   swarm"; the fallback defeated its own stated intent. A default that is *valid*
   is more dangerous than one that throws.
2. **An authored field that no-ops produces a state that lies.** All nine
   `orbital_shapes.mode` strings are decoration — `mode` is read only for a camera
   lookup this concept overrides. Three states were consequently byte-static under
   captions describing motion, and **only 4 of 9 declared archetypes were
   delivered**. This is #13's failure recurring against the very scar row whose
   prevention rule says to verify by diffing dense frames rather than reading names.
3. **Two instruments for one quantity will eventually disagree.** S6's slider
   printed `S/S₀ = 1.000` while the HUD 500 px above read `π S/S₀ = 0.000`, in the
   same frame, on the state the concept exists for — because the slider resolved
   against the *primary* MO (σ) and ignored the state's `overlap_of`. A teacher
   reading the slider would have learned the exact opposite of the lesson.

**What held, and is not to be touched in the fix round:** the normalised
overlap-ratio design (§5d — the defect caught mid-pipeline; no state renders a bare
absolute integral and 0.745/0.270 reach no rendered field), S8's honesty disclosures
(§6a.1), Rule 38b explore-core-only, the solved camera (§ below, independently
reproduced at √(2/3)), the chemistry ledger, and all four harnesses.

### Cameras — TO BE SOLVED, never chosen

#13's most transferable camera lesson: the shipped `p_set` camera foreshortened one
of four sp³ lobes to **exactly 0.000** under a caption counting four. This concept
has the identical hazard at S8, where the two π systems are **90° apart** and any
view down one of them collapses it. **Every camera is a measurement.** A view is
rejected unless both π systems subtend a measurable on-screen extent simultaneously.

**And the hazard is worse than this skeleton first assumed** (measured during the
engine build): Z_eff = 3.25 makes the whole MO picture roughly **4× smaller in world
units** than an atomic-orbital picture at the same camera — σ lit only **4110 px**
against π's **19,610** at dist 3.2. So the σ states and the π states cannot share one
camera distance without one of them being unreadable, and Rule 32d home-pose
continuity has to be bought with a solved per-state distance rather than one fixed
value. Every distance is a measurement too, not just every angle.

---

## §7 — Known limits, recorded rather than hidden

1. ~~**The σ measured in §5b is p–p head-on; ethene's real σ is sp²–sp².**~~
   **CLOSED — §5c.** Re-measured on the sp²–sp² field; same topology, all components
   star-shaped, and a cleaner picture (back lobes 1145 → 107 cells). **The concept
   ships sp²–sp²** (founder direction 2026-07-29: finish σ/π as planned, and the
   prerequisite chain is the point). The unhybridised 2p_y forming the π is unchanged
   from §5b, so that measurement still stands as made.
2. **The bond-energy comparison mixes hybridisations.** σ 348 kJ/mol is the C–C bond
   in ethane (sp³); π 266 is C=C (614) − C–C (348). This is the standard textbook
   construction and it is an approximation, not an identity. S7's on-canvas wording
   must not claim more precision than that.
3. **Z_eff = 3.25 is Slater's rules**, an approximation; SCF values for carbon 2p are
   nearer 3.14. Whichever ships must be *declared* on canvas or in the HUD, and the
   HUD must not print a false precision.
4. **Only the BONDING combination is shown.** σ*/π* antibonding are out of NCERT
   scope and would roughly double the state count. Recorded as a deliberate omission
   so no caption implies the bonding MO is the whole story.
5. **Enclosure must be 50%, not 90%** (§5b). At 90% the surfaces fuse and stop being
   countable — #13's `front_only` lesson, in a new place.
6. **Universal anchor (Rule 35): vision.** The π bond's rotation lock is why retinal
   holds its 11-cis shape until a photon supplies the energy to break the π bond and
   let it snap to all-trans — the primary event in seeing. Universal, true, and it is
   this concept's payoff rather than a decoration. Secondary: why cis/trans fats are
   different substances. **No country-specific content anywhere.**

---

## §8 — Definition of Done (Gate 0 — zero TBDs)

- [ ] 9 states; 9 declared archetypes, **each verified delivered in dense frames**,
      with S3↔S6 and S2↔S5 declared as contrast pairs
- [ ] Rule 16a: the wrong belief **shown on canvas** at S1, leading alone and
      clearing via `ghost_fade_at_ms` before the real σ assembles
- [ ] Word budget 25–55 EN per state; ≤5-word delta cue on canvas; prose in `#capStrip`
- [ ] ≥2 distinct `advance_mode` (3 present); explore last, `interaction_complete`
- [ ] Rings core/extended/core; coherent-when-cut check performed; Rule 38b — explore
      exposes no triple bond and no energy readout
- [ ] Every on-canvas number DERIVED; the overlap readout **MEASURED** from the field,
      never asserted
- [ ] Rule 34c — all on-canvas math real Unicode (σ π Δ ° ⟂ …); ONE formula surface
- [ ] Rule 35 — universal anchor (vision / retinal)
- [ ] `curriculum_tags` authored as CLAIMS; only CBSE verified, all others carry
      `needs_teacher_verification`
- [ ] Registered at site **#1 only** (chemistry isolation); `validate:concepts` still
      141/141 without ever seeing this file
- [ ] `render_annotations: true` if any `scene_composition` annotation is authored —
      otherwise they satisfy Rule 19 with content that cannot exist on screen (#13
      lesson (f))
- [ ] `npm run check:sigma-pi` — a headless gate on the shipped function bodies, in
      the shape of `check:hybrid-orbitals`
- [ ] `check:renderer-syntax` + `check:renderer-backticks` clean
- [ ] THE EYE run and **frames read** by eye-walker; quality-auditor PASS
- [ ] **Founder visual approval → `visual:approve`**
- [ ] **Asmi professor review** — the standing bottleneck, now eight concepts deep
