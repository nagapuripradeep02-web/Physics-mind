# Stage-2 Pilot Catalog — T41 Ray Optics (Reflection + Spherical Mirrors)

**Date authored:** 2026-05-25 (Session 40, paired-batch with T42)
**Sources:**
- NCERT Class 12 Part 2, **Ch.9 Ray Optics and Optical Instruments**, §9.1 Introduction + §9.2 Reflection of Light by Spherical Mirrors (§9.2.1 sign convention, §9.2.2 focal length, §9.2.3 mirror equation)
- HC Verma Vol 1, **Ch.18 Geometrical Optics**, §18.1 Reflection at smooth surfaces, §18.2 Spherical mirrors, §18.3 Relation between u, v and R, §18.4 Extended objects and lateral magnification
- DC Pandey Optics & Modern Physics, **Ch.30 Reflection of Light**, §30.1 Introduction, §30.2 General concepts used in Geometrical Optics, §30.3 Reflection of light, §30.4 Reflection from a spherical surface
- Note: this pilot is the **12th** in the run. It deliberately couples with T42 (Refraction + Lenses + Prism) to open the Optics cluster — first non-mechanical-non-E&M paired batch.

---

## Founder Decisions Applied (RO-G1 … RO-G7, inline)

| # | Decision | Rationale |
|---|---|---|
| RO-G1 | **Laws of reflection / plane mirror / spherical mirror are THREE separate atomics**, not one umbrella. Tempted to collapse since all three relate to "rays bouncing off mirrors." Kept separate because the visual scene differs (flat surface + i=r; flat mirror + image at v=-u; curved mirror + focus + mirror equation), and EPIC-C misconceptions are distinct (laws: "i is between ray and surface" not normal; plane: "image is on the mirror surface"; spherical: "all rays converge regardless of aperture"). | Visual-scene + misconception variety, modal pattern across run. |
| RO-G2 | **`cartesian_sign_convention_mirrors` is its OWN atomic**, not a nano of mirror equation. Reason: in 10+ years of teaching Indian Class 12 students, the #1 reason mirror-equation problems fail is sign-error, not formula misapplication. The convention deserves a 4-state explanation: where is origin, which direction positive, height conventions, the worked sign-table for the 6 cases. High `Required-by` count — every downstream mirror or lens atomic needs this. | Empirical: HCV §18.2 dedicates a full table (Fig.18.5 (a-d) signs of u, v, R, f) and DCP §30.2 spends 4 pages on "10 General concepts" including sign convention; NCERT §9.2.1 also calls it out separately. |
| RO-G3 | **Mirror equation and lens equation are KEPT SEPARATE** across T41 (this catalog) and T42 (sister), even though both have form `1/v ± 1/u = 1/f`. Tempted to unify into one "Gaussian formula" atomic since the math is identical. Kept separate because the derivations use different geometries (single reflection vs double refraction), NCERT uses `1/v + 1/u = 1/f` for mirrors but `1/v - 1/u = 1/f` for lenses (sign difference per convention), and the failure modes are different (mirror: sign of f; lens: sign of u for virtual objects). | Pedagogy: bundling them hides the convention divergence that catches students. |
| RO-G4 | **`image_formation_cases_concave_mirror` is its own atomic with 6 sub-states (one per case)** — object at infinity, beyond C, at C, between F and C, at F, between P and F — plus 1 convex-mirror case as a 7th. Tempted to demote to a nano of mirror equation. Kept atomic because the case-table is the SINGLE thing CBSE board and JEE most-frequently test from mirrors. Each case has distinct image properties (real/virtual, magnified/diminished, erect/inverted). 6 distinct visual scenes = atomic. | Empirical: NCERT Exercise 9.15 + DCP Match-the-Columns + HCV table 18.5 all separately drill the case table. |
| RO-G5 | **`spherical_aberration_mirror` is atomic, NOT a nano of `paraxial_approximation`**. Initially looked like a nano because it's "the failure mode of paraxial." Promoted to atomic because (a) it has a distinct visual (the caustic curve + circle of least confusion from HCV §18.17), (b) it has a high-anchor Indian application (parabolic reflector in automobile headlights — every Indian Bajaj/TVS scooter), (c) the "parabolic mirror is the fix" insight is conceptually rich and JEE-tested. | Anchor + visual + JEE relevance triple-justification. |
| RO-G6 | **`velocity_of_image_in_mirror` stays as an atomic** even though it's JEE-Advanced-only (NCERT Example 9.4 jogger problem is the only NCERT touch). Reason: it's a "sleeper success" topic — students who internalize v_I = m² v_O (longitudinal) and v_I = m v_O (perpendicular) gain 2-3 free JEE marks per year. Cross-cluster bridge to T6 kinematics (relative velocity) and T36 cyclotron (charged particle in moving frame). | Stage-5 priority queue should rank this medium-high for JEE-pathway students specifically. |
| RO-G7 | **Anchor strength: STRONG.** NCERT §9.2 closes with a side-view-mirror jogger example (every Indian auto-rickshaw driver experiences this daily). HCV §18.17 closes with "automobile headlight reflector is parabolic" (Indian Bajaj/TVS scooter universal). DCP §30 reflection examples include security dome convex mirrors (every Indian supermarket + Metro station). Indian-context additions: shaving mirror (concave, magnifying), dental mirror (concave, virtual erect), solar cooker (parabolic concave — SOLBOX program by MNRE, Pune), CCTV dome mirrors in Indian schools/banks. Confirmed strong-anchor — author at 1.0× baseline. | Validates [[feedback-anchor-density-varies-by-topic]] — geometric optics is anchor-rich phenomenology. |

---

## Section A — Top-of-Catalog Summary

```
Topic               : T41 Ray Optics — Reflection and Spherical Mirrors
                      (lens content split to T42; optical-instruments overlap noted in §G)
Atomic count        : 13 (target range 12–16; landed at 13 — below mean because lens/refraction goes to T42)
Nano count          : ~24 (mean 1.85 nanos/atomic)
Stage-2 OUT-edges   : 11 (→ T42 ×4 [sign convention, paraxial, mirror→lens, magnification],
                       → T43 ×2 [optical instruments using mirrors — Cassegrain telescope],
                       → T44 ×1 [Huygens needs i=r],
                       → math-tools ×2 [similar triangles, small-angle tan θ ≈ θ],
                       → T6 ×1 [velocity of image bridges to relative velocity],
                       → T36 ×1 [Indian Cassegrain at IIA Bangalore + moving-charge mirror-analogy])
Anchor density      : STRONG (vehicle convex mirrors, parabolic headlight reflector,
                       solar cooker SOLBOX, shaving mirror, dental mirror, Kavalur 2.34m
                       reflecting telescope at IIA Bangalore — see RO-G7)
Author-time         : 1.0× baseline (per RO-G7)
Founder decisions   : RO-G1 … RO-G7 (7 decisions, modal across 12-pilot run)
```

---

## Section B — Cross-Source Coverage Table (3 sources × T41 sections)

| Coverage area | NCERT 12.2 Ch.9 | HCV1 Ch.18 | DCOM Ch.30 | Notes |
|---|---|---|---|---|
| Particle vs wave model of light (historical) | §9.1 Particle-model box + §10.1 wave introduction | §17.1 history (Ch.17) | §30.1 introduction (geometric vs physical optics) | NCERT historical box best; HCV/DCP terser |
| Laws of reflection (i=r + coplanarity) | §9.2 opening paragraph + Fig.9.1 | §18.1 (a) + (b) | §30.3 + Fig.30.13 | All three identical; HCV gives 3-vector coplanar form |
| Plane mirror image (v=-u, lateral inversion) | §9.2 first paragraph (brief) | §18.1 (Fig.18.1) | §30.4 "Reflection from Plane Surface" (full subsection) | DCP best on multi-image cases (2 mirrors at angle); HCV best on lateral-magnification trick |
| Spherical mirror geometry (C, P, R, axis, aperture) | §9.2 (first half) | §18.2 (Spherical Mirrors) | §30.4 + Fig.30.14 | All three identical conceptually; minor figure variation |
| Paraxial rays + focal length f = R/2 | §9.2.2 (with geometric derivation Fig.9.4) | §18.2 "Focus" subsection + Fig.18.3 | §30.4 (implicit) | NCERT derivation (Eq. 9.1-9.3) is canonical; HCV simpler |
| Cartesian sign convention | §9.2.1 (explicit + Fig.9.2) | §18.2 "Sign Convention" + Fig.18.5 table | §30.2 #7 + Fig.30.5 + Fig.30.7 | HCV table (Fig.18.5 a–d, four cases) is the gold-standard pedagogy |
| Mirror equation 1/v + 1/u = 1/f | §9.2.3 (full derivation Fig.9.5 + Eqs. 9.4–9.7) | §18.3 + Fig.18.6 (full derivation) | §30.4 (Eq. mirror formula) | NCERT derivation uses similar triangles A'B'F and MPF; HCV uses exterior angle. Both rigorous |
| Lateral magnification m = -v/u | §9.2.3 (end) + Eq.9.9 | §18.4 + Fig.18.8 | §30.4 (table 30.3 cases) | All three identical |
| 6 image-formation cases (concave mirror) | NCERT Exercise 9.15 + Fig.9.6 (real + virtual cases shown) | §18.4 + Fig.18.8 (a)+(b) | §30.4 (worked examples + match-the-columns Column-I/II) | NCERT exercises drive depth; DCP exhaustive on Match-the-Columns |
| Convex mirror always virtual+erect+diminished | §9.2.3 (Example 9.4 jogger) + Fig.9.6(b) | §18.4 implicit | §30.4 + Fig.30.7(b) | All three; NCERT jogger example is the canonical real-world anchor |
| Spherical aberration + parabolic mirror solution | absent (NCERT does NOT discuss aberrations for mirrors — covers them for lenses in §9.5) | §18.17 (Defects of images, both lens + mirror) — Fig.18.28 caustic curve | §30 problem 9 (parabolic focal length proof) | HCV §18.17 is the canonical pedagogy; NCERT misses this conceptually-rich topic |
| Velocity of image in mirror | NCERT Example 9.4 (jogger) — implicit | absent in HCV main text | §30 Level 2 Q.13 + Level 2 More-than-One #5 (full v_I = m² v_O treatment) | DCP best on this; NCERT only touches via jogger example; HCV silent. This is JEE-Adv territory |
| Multiple images (2 mirrors at angle) | absent | absent | §30 Subjective Q.5 + Fig.30.8 (two parallel mirrors infinite images) | DCP-only. Worth atomic per RO-G1 — every Indian "two-mirror at θ" exam problem traces here |
| Mirror rotation: ray rotates 2θ | absent | §18-W6 problem (90° prism deviation) | §30 Subjective Q.6 (full proof) + Level 2 Q.7 (problem) | DCP best. Indian-context: barber chair mirror + galvanometer reflector classroom experiment |

---

## Section C — Atomic + Nano Catalog (the canonical 8-column table)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A1** | `laws_of_reflection` | atomic | ✅ | — | — | A2, A3, A4, [T42:snells_law (analogy)], [T44:huygens_reflection] | i=r + normal-incidence + coplanarity. Atomic per RO-G1. EPIC-C STATE_1 wrong belief: "angle of incidence is measured from the mirror surface, not the normal" — universal Class 12 error |
| ↳ N1.1 | normal_to_curved_surface | nano | ✅ | — | — | A1, A4 | Normal at any point on a sphere = the radius (line from C through point). Bridge to A4 spherical-mirror geometry |
| ↳ N1.2 | coplanarity_of_incident_normal_reflected | nano | ✅ | — | — | A1 | All three lie in the plane of incidence. Pedagogically subtle — students draw 3D crossings |
| **A2** | `plane_mirror_image_formation` | atomic | ✅ | — | A1 | A3, A10 | v = -u (image distance = object distance on opposite side); lateral inversion; image is virtual, erect, same size. EPIC-C STATE_1 wrong belief: "image is on the mirror surface" — students locate image AT the glass |
| ↳ N2.1 | lateral_inversion_left_right | nano | ✅ | — | — | A2 | Right-hand becomes left-hand. Ambulance "AMBULANCE" mirror-inversion painted text is the Indian-context anchor |
| ↳ N2.2 | minimum_mirror_height_for_full_image | nano | ✅ | — | — | A2 | h_min = H/2 for full-body view. NCERT Exercise + DCP Q.8 canonical. Indian-context: bathroom mirror sizing |
| ↳ N2.3 | multiple_images_two_mirrors_at_angle | nano | ✅ | — | — | A2, A1 | N = 360°/θ - 1 (or 360°/θ if asymmetric). Indian-context: kaleidoscope toy + 2-mirror parallel barber-shop infinite reflection |
| ↳ N2.4 | mirror_rotation_ray_rotates_2theta | nano | ✅ | — | — | A2, A1 | When mirror rotates by θ, reflected ray rotates by 2θ. Classroom galvanometer-scale demonstration; JEE-tested annually |
| **A3** | `spherical_mirror_geometry` | atomic | ✅ | — | A1, N1.1 | A4, A5, A6, A7, [T42:refraction_at_spherical_surface] | Pole P, centre of curvature C, radius of curvature R, principal axis, aperture, focal plane. Foundation atomic for all mirror-related math. EPIC-C STATE_1 wrong belief: "the pole is the centre of curvature" — common confusion |
| ↳ N3.1 | concave_vs_convex_distinction | nano | ✅ | — | — | A3 | Concave: silvered on outside, reflects on inside (caves inward toward C). Convex: silvered on inside, reflects on outside (bulges toward observer). Indian-context: shaving (concave) vs scooter rear-view (convex) |
| ↳ N3.2 | aperture_must_be_small_for_clean_focus | nano | ✅ | — | — | A3, A11 | Bridge to A11 spherical aberration: if aperture is large, paraxial approximation fails |
| **A4** | `focal_length_f_equals_R_over_2` | atomic | ✅ | — | A3, [math:tan_theta_approx_theta] | A5, A6, A7, A8 | NCERT §9.2.2 derivation via Fig.9.4 geometry. For paraxial rays, f = R/2. The "1/2" surprise — students expect f = R or f = 2R |
| ↳ N4.1 | concave_mirror_real_focus | nano | ✅ | — | — | A4 | Parallel rays converge to a real F in front of the mirror. Sign: f negative per Cartesian convention |
| ↳ N4.2 | convex_mirror_virtual_focus | nano | ✅ | — | — | A4 | Parallel rays appear to diverge from a virtual F behind the mirror. Sign: f positive |
| **A5** | `cartesian_sign_convention_mirrors` | atomic | ✅ | — | A3, A4 | A6, A7, A8, A9, [T42:sign_convention_lenses (analogous)], [T42:sign_convention_refraction_spherical] | Per RO-G2: own atomic. Pole as origin; incident-light direction positive; heights upward positive. The sign table for the 6 image-formation cases. Most common failure point in mirror-formula problems |
| ↳ N5.1 | direction_of_incident_light_sets_positive_x | nano | ✅ | — | — | A5 | If light travels left-to-right, +x is rightward (and distances toward mirror are positive). If light is reversed (multi-element systems), sign convention can flip mid-problem |
| ↳ N5.2 | real_image_in_front_of_mirror_negative_v | nano | ✅ | — | — | A5, A6 | For concave mirror with real object: v negative (image on the same side as object, opposite to incident-light direction beyond pole) |
| **A6** | `mirror_equation` | atomic | ✅ | — | A3, A4, A5, [math:similar_triangles] | A7, A8, A12, [T42:lens_equation (analogous)] | 1/v + 1/u = 1/f. NCERT derivation via similar triangles A'B'F and ABP. HCV derivation via exterior angle. Per RO-G3: distinct atomic from lens equation despite similar form |
| ↳ N6.1 | derivation_via_similar_triangles | nano | ✅ | — | — | A6 | The MPF ~ A'B'F similarity is the key insight. Pedagogically rigorous |
| **A7** | `lateral_magnification_mirror` | atomic | ✅ | — | A5, A6 | A8, A12, [T42:magnification_lens] | m = h'/h = -v/u. Negative m ⇒ inverted (real image); positive m ⇒ erect (virtual image). Per RO-G3 split: lens magnification is m = +v/u (sign convention difference) — common confusion |
| ↳ N7.1 | sign_of_m_tells_image_orientation | nano | ✅ | — | — | A7 | Negative m means inverted; positive m means erect. Magnitude tells size |
| **A8** | `image_formation_cases_concave_mirror` | atomic | ✅ | — | A6, A7 | A9, [T42:lens_image_cases] | Per RO-G4: 6-state atomic. Cases: (i) ∞ → F (real, dim, inv); (ii) beyond C → between F-C (real, dim, inv); (iii) at C → at C (real, same-size, inv); (iv) between C-F → beyond C (real, mag, inv); (v) at F → ∞; (vi) between P-F → virtual, behind mirror, erect, mag. Plus +1 convex case (A9). The CBSE-board canonical case-table |
| **A9** | `convex_mirror_image_always_virtual` | atomic | ✅ | — | A6, A7, A8 | A10, [T43:traffic_safety_optics] | For any real object: image is virtual, erect, diminished, behind the mirror. Single visual scene. EPIC-C STATE_1 wrong belief: "convex mirror can form a real image with a real object" — fails dimensional check |
| ↳ N9.1 | scooter_side_mirror_anchor | nano | ✅ | — | — | A9 | Indian-context anchor: every Bajaj/TVS scooter, every auto-rickshaw rear-view. "Objects in mirror are closer than they appear" (the diminished image makes them seem far) |
| ↳ N9.2 | security_dome_mirror_anchor | nano | ✅ | — | — | A9 | Convex dome mirrors at supermarket corners + Metro station ceilings + bank ATM vestibules. Wide field of view at cost of magnification |
| **A10** | `plane_mirror_velocity_image` | atomic | ✅ | — | A2, [T6:relative_velocity] | A12 | If object moves with velocity v⃗ relative to mirror, image moves with v⃗ reflected across the mirror plane (parallel component preserved, perpendicular component reversed). Bridge to T6 kinematics. JEE-tested. EPIC-C STATE_1 wrong belief: "image moves at same speed as object" — only true for perpendicular motion |
| **A11** | `spherical_aberration_mirror` | atomic | ✅ | — | A3, A4 | [T42:lens_aberrations], [T43:reflecting_telescope] | Per RO-G5: own atomic. Marginal rays focus closer to mirror than paraxial rays; produces caustic curve + circle of least confusion. Fix: parabolic mirror (all parallel rays focus at one point). Indian anchors: automobile headlight reflector (Bajaj/TVS), solar cooker (MNRE SOLBOX program), satellite dish parabola |
| ↳ N11.1 | parabolic_mirror_perfect_for_parallel_rays | nano | ✅ | — | — | A11 | Geometric proof: parabola defined as locus equidistant from focus + directrix ⇒ all parallel rays parallel to axis converge at focus exactly |
| ↳ N11.2 | reflecting_telescope_uses_parabolic_primary | nano | ✅ | — | — | A11, [T43:cassegrain] | Cassegrain telescope: parabolic primary + hyperbolic secondary. Indian anchor: 2.34m reflecting telescope at Kavalur, IIA Bangalore (NCERT §9.9.3 §"Cassegrain") |
| **A12** | `velocity_of_image_in_curved_mirror` | atomic | ✅ | — | A6, A7, A10 | [T6:relative_velocity_in_optical_systems], [T36:moving_charge_radiation_analogy] | Per RO-G6: own atomic. v_I_longitudinal = m² v_O; v_I_perpendicular = m v_O. JEE-Adv staple. Derived by differentiating mirror equation. NCERT Example 9.4 (jogger in side mirror) is the entry-level case |
| ↳ N12.1 | differentiate_mirror_eq_to_get_dv_du | nano | ✅ | — | — | A12 | d/dt(1/v + 1/u = 1/f) ⇒ -1/v² dv/dt - 1/u² du/dt = 0 ⇒ dv/dt = -(v²/u²) du/dt = -m² (du/dt) |
| **A13** | `paraxial_approximation_for_mirrors` | atomic | ✅ | — | A1, A3, [math:small_angle_approx] | A4, A6, A11 | All mirror formulas assume rays close to principal axis and small angles (sin θ ≈ tan θ ≈ θ). The justification atomic for f = R/2 and 1/v + 1/u = 1/f. When violated → A11 spherical aberration. EPIC-C STATE_1 wrong belief: "mirror formula works for any aperture" — fails for large-aperture beams |

---

## Section D — Subsection-level breakdown of source material

### D.1 NCERT §9.1: Introduction
- "Particle model of light" historical box (Newton's corpuscular model + its failure on partial reflection + Huygens wave model preview)
- Bridges to A1 via "ray = path of energy propagation in geometric-optics limit"

### D.2 NCERT §9.2: Reflection of Light by Spherical Mirrors (FULL — 5 pages)
- §9.2 opening: laws of reflection + plane-mirror brief (→ A1, A2)
- §9.2.1 Sign convention with Fig.9.2 (→ A5)
- §9.2.2 Focal length of spherical mirrors with Fig.9.3 + 9.4 geometric derivation (→ A3, A4, A13)
- §9.2.3 Mirror equation with Fig.9.5 derivation + Fig.9.6 ray diagrams + Example 9.1-9.4 (→ A6, A7, A8, A9, A10, A12)

### D.3 HCV §18.1-18.4 (FULL — 4 sections)
- §18.1 Reflection at smooth surfaces (laws + plane-mirror image — Fig.18.1, 18.2 → A1, A2)
- §18.2 Spherical mirrors (geometry + sign convention table Fig.18.5 → A3, A5; focal length → A4)
- §18.3 Relation between u, v and R (mirror equation derivation Fig.18.6 → A6)
- §18.4 Extended objects and lateral magnification (Fig.18.8 → A7, A8)
- §18.17 Defects of images (caustic curve Fig.18.28, monochromatic vs chromatic aberration → A11)

### D.4 DCP Ch.30 §30.1-30.4 (FULL chapter)
- §30.1 Introduction (geometric vs physical optics)
- §30.2 "10 General Concepts" — sign convention #7 + #8 + #9, multi-element sign flipping, real vs virtual objects + images, visual angle (→ A5)
- §30.3 Reflection of light (i=r laws + two important points → A1)
- §30.4 Reflection from spherical surface (plane mirror + multiple-mirror images + Fig.30.7 sign cases → A2, A6, A7, A10)
- Level-1 + Level-2 problem sets: 6 image-formation cases drilled in Match-the-Columns + Comprehension passages (→ A8, A9, A12)
- Level-2 Q.6 + Q.7 + Subjective Q.6 (mirror rotation 2θ proof + parabolic mirror focal-length proof → A11, N2.4)

### D.5 Indian real-world anchors (the strong-anchor section per RO-G7)

| Anchor | Source | Notes |
|---|---|---|
| Scooter / auto-rickshaw rear-view convex mirror | NCERT Example 9.4 (jogger) + DCP Subjective Q.7 (thief in police-jeep convex mirror) | Universal Indian commuter experience. "Side mirror" cap-warning text is anchor |
| Shaving mirror (concave, magnifying) | Universal Indian morning routine — Cinthol/Wilkinson context | Concave mirror with object between P and F: virtual, erect, magnified |
| Dental mirror | Indian dentist clinic universal artifact | Same as shaving — concave, virtual erect mag image, but used to look around teeth |
| Parabolic automobile headlight | NCERT §9.2 implicit + HCV §18.17 "automobile headlights" | Bulb at focus of parabolic mirror ⇒ collimated beam. Indian Bajaj/TVS scooter universal |
| Solar cooker (parabolic concave) | (general Indian-context) — MNRE SOLBOX program | Indian rural solar cooker; sun's rays converge to focal point. Anchor for A11 parabolic-mirror |
| Security dome convex mirror | (general Indian-context) — supermarkets, Metro stations, ATM vestibules | Convex mirror with wide field of view |
| Kavalur 2.34m reflecting telescope | NCERT §9.9.3 (named explicitly) — IIA Bangalore | Cassegrain design. India's largest optical telescope. Anchor for A11 + bridge to T43 instruments |
| Galvanometer reflecting scale | DCP Subjective Q.6 + Indian physics-lab universal | Mirror rotates → light spot moves 2× the angle on scale. Anchor for N2.4 (rotation 2θ) |
| Kaleidoscope (Indian children's toy) | General children's-toy context | 3 mirrors at 60° → 5 images visible + endless pattern. Anchor for N2.3 (multiple images) |
| Bathroom / dressing mirror sizing | NCERT Exercise 9.18 + Indian household | Indian middle-class home: small bathroom mirror — anchor for N2.2 (h_min = H/2) |

---

## Section E — Stage-1 commonality flag

T41 was correctly identified in `stage-1-chapter-commonality.md` as triple-covered (matrix row "41 Ray Optics (Mirrors)"). The current pilot validates that the NCERT-vs-HCV-vs-DCP coverage is heavy overlap with one notable divergence: **NCERT does NOT discuss spherical aberration for mirrors** (only for lenses in §9.5), while HCV §18.17 and DCP §30 do. A11 atomic exists because HCV+DCP cover it; NCERT bridges to it only implicitly via "paraxial" mention.

**Topic-numbering recovery:** I referenced "T39 Reflection / T40 Refraction" in DISCUSSIONS Session 39 as the next-batch option name. The matrix-canonical numbering is **T41 + T42**. This pilot file uses T41. Stage-4 reconciliation will sweep all "T32/T33" (and "T39/T40") loose references and align them to matrix-canonical IDs.

---

## Section F — V1 priority flag

Per [[feedback-v1-priority-deferred-to-stage-5]], V1 priority assignment is deferred. Inline flag for stage-5 input: **A1 + A5 + A6 + A8 are top candidates for V1 priority queue** (high `Required-by` count + foundational for all downstream optical instruments). A11 (spherical aberration) and A12 (velocity of image) are JEE-pathway-priority but lower-priority for boards-only students — Stage-5 will need to split priority by student-pathway.

---

## Section G — Cluster role + Optical Instruments separation

T41 is the **upstream root** of the Optics cluster. T42 (refraction + lenses) builds directly on T41's sign-convention atomic (A5) and mirror-equation derivation pattern (A6).

**Optical Instruments overlap:** NCERT §9.9 bundles all optical instruments (eye, microscope, telescope) INTO Ch.9 (Ray Optics). The stage-1 matrix has T43 as a separate "Optical Instruments" topic. **Decision:** T41 + T42 catalog the underlying mirror/lens physics; T43 (when authored) will catalog the instrument-level integration (eye accommodation, compound microscope magnification, refracting vs reflecting telescopes). Cassegrain telescope sits at the T41↔T43 bridge — atomic A11 (parabolic mirror) is here in T41; the instrument-level "Cassegrain design" details go to T43.

---

## Section H — Atomic-count restraint check

13 atomics. The 12-pilot mean is ~26 atomics; T41 is below mean because (a) lens/refraction content is split to T42 (paired), (b) optical instruments are deferred to T43. If T41 had absorbed both, it would have hit ~28 — within range.

**Atomic-count justification:** Each of the 13 has either a unique misconception, a distinct visual scene, or a downstream `Required-by` count ≥ 2 — meeting the diamond-bar threshold. A11 (spherical aberration) has the lowest Required-by but is justified by anchor strength + JEE relevance (RO-G5). A12 (velocity of image) has narrow scope but is justified by sleeper-success criterion (RO-G6).

---

## Section I — Open questions / Stage-4 candidate-micro flags

- **A1 (laws_of_reflection)** is borderline-trivial — the i=r + coplanarity is a 1-state insight. Stage-4 may demote to a "candidate micro" tier (per the granularity DAG plan). Flag as `granularity_question: candidate_micro_for_law_statements`.
- **N1.1 (normal_to_curved_surface)** could be elevated to atomic because it cross-applies to T42 spherical refraction. Currently nano under A1; revisit at Stage-4.
- **A10 + A12 (velocity of image)** are borderline — A10 is plane, A12 is curved. Could collapse into one velocity-of-image atomic with two cases. Kept separate for now because the math differs (plane: vector reflection; curved: m² factor).
- **A11 (spherical aberration)** sits at the boundary between T41 (mirror-version) and T42 (lens-version). Stage-4 may unify aberrations into a single "aberration physics" atomic spanning both mirror and lens contexts.

---

## Section J — Matrix update payload

```
Topic ID                : T41
Atomic count            : 13
Nano count              : ~24
Stage-2 OUT-edges (9)   : T41 → T42 (×4: sign_convention_lenses, paraxial_for_lenses,
                                       mirror_eq_to_lens_eq_analogy, magnification_lens)
                        : T41 → T43 (×2: reflecting_telescope_cassegrain,
                                       traffic_safety_optics_dome_mirrors)
                        : T41 → T44 (×1: huygens_principle_predicts_i_equals_r)
                        : T41 → T6 (×1: velocity_of_image_uses_relative_velocity)
                        : T41 → T36 (×1: Kavalur_IIA_Cassegrain_anchor +
                                       moving-charge-mirror-analogy speculative)
Math-tools OUT-edges (2): similar_triangles (mirror-equation derivation),
                          small_angle_approximation tan θ ≈ θ (paraxial)
Anchor strength         : STRONG
Founder decisions       : 7 (RO-G1 ... RO-G7)
```

---
