# Architect skeleton — `hybridisation_sp_sp2_sp3` (P4 #13)

> **Written after the build, not before it — and that is the finding.** The
> quality-auditor FAILed this concept at Gate 0 because no skeleton existed, and
> the consequence it predicted is exactly what happened: three states declared
> three motion archetypes and delivered one uniform swell, a fourth declared a
> cutaway that was inert, and none of it was anybody's *declared obligation*, so
> nothing checked it. The physics block (`hybridisation_physics_block.md`) is the
> physics_author artifact and is excellent; it is not this.
>
> This skeleton is therefore back-filled to be TRUE of the shipped concept, and
> every row of §4 has been verified against the built page rather than intended.

---

## §1 — Tier and the whiteboard test

**Tier: 💎.** NCERT Class 11 Chemistry Ch.4 §4.6 (valence bond theory — hybridisation).

A teacher with a whiteboard and 60 seconds *can* draw the three static pictures:
two lobes at 180°, three at 120°, four at 109.5°. What no board can do is **sweep
the parameter between them**. The concept's whole claim is that s-character is one
continuous physical dial that sets the lobe shape *and* the angle simultaneously,
via `cos θ = −f/(1−f)` — so 109.5° stops being a number to memorise and becomes
what the law returns at f = ¼. That sweep is the diamond; the three stops are the
demo.

Second irreplaceable element: the front/back asymmetry of a hybrid is a
**3-dimensional, quantitative** fact (82.5% of the electron on the bonding side),
and it is why hybrid orbitals bond better than the orbitals they came from.

**Prerequisite:** `atomic_orbitals_s_p_d` — orbitals are what hybridisation
hybridises (Rule 25, no untaught term).

---

## §2 — The misconception (Rule 16a)

**Belief:** *Carbon bonds using its 2s and three 2p orbitals exactly as they are,
so methane should have three bonds at 90° from the p orbitals plus one different
bond from the s.*

Sourced from NCERT Exemplar Ch.4 as a belief only (no prose, figure or worked
example imported).

**The contrast beat is a declared PAIR: STATE_1 ↔ STATE_5.** S1 builds the wrong
picture and states its consequence on canvas; S5 re-shows that same picture in
grey, lets it dissolve, and assembles four identical hybrids in its place.

**The sequencing constraint that this pair taught (and cost two rounds):** the
ghost and the real set must **not share the frame**. Ghost lobes land in the
angular gaps between the real ones and the union fuses into a ball — the same
geometry that forced `front_only`. The wrong picture must LEAD and clear. That is
also the correct Rule-16a order: the wrong expectation's consequence, *then* the
real physics.

---

## §3 — Depth rings (Rule 38)

| ring | states | why |
|---|---|---|
| **core** | S1, S2, S3, S4, S5 | The NCERT §4.6 lesson: the mismatch, the mixing, sp, sp², sp³. |
| **advanced** | S6, S7 | The continuous sweep and the back lobe — genuinely beyond syllabus. Contiguous, immediately before explore. |
| **core** | S8 (explore) | Rule 38b: surfaces CORE content only — the hybrid picker, not the s-character dial. |

**Coherent-when-cut check.** Hide advanced ⇒ S1–S5 + explore still delivers the
whole CBSE lesson (sp, sp², sp³ and their angles) and no surviving state references
the sweep or the back lobe. Hide advanced+extended is N/A — there is no extended
ring, deliberately: an earlier draft tagged sp² and sp³ *extended*, which made the
core cut of a concept titled "sp, sp², sp³" stop before sp³. **Ring assignment is a
correctness question, not a labelling one.**

---

## §4 — The per-state table (REQUIRED artifact, Rule 31)

Every archetype below was verified as *delivered* against dense frames, not merely
named. `Δ` is the one-line delta cue.

| # | ring | teaches | archetype | Δ (≤5 words on canvas) | controls | advance | s |
|---|---|---|---|---|---|---|---|
| 1 | core | carbon's own orbitals predict 90°, and methane isn't | `axis-populate` | "Three p, all 90°" | — | manual_click | 20 |
| 2 | core | mixing one s with one p makes a NEW, lopsided shape | `merge-morph` | "One s + one p" | — | auto_after_tts | 22 |
| 3 | core | there are TWO of them, 180° apart, 87% forward | `partner-bloom` | "Its partner, opposite" | — | manual_click | 20 |
| 4 | core | one s + two p ⇒ three coplanar lobes at 120° | `plane-populate` | "Three, at 120°" | — | auto_after_tts | 20 |
| 5 | core | one s + three p ⇒ four identical at 109.5° (**contrast pair with S1**) | `tetra-assemble` | "Four, at 109.5°" | — | manual_click | 22 |
| 6 | adv | **PRIMARY AHA** — one dial sets shape *and* angle | `parameter-sweep` | "More s, wider angle" | — | manual_click | 26 |
| 7 | adv | the omitted back lobe is real; 82.5% / 17.5% | `back-lobe-grow` | "The back lobe is real" | — | manual_click | 20 |
| 8 | core | sandbox | `free-explore` | "All yours" | orbital · dots · spin | interaction_complete | 24 |

**Archetype distinctness is a claim about MOTION, not about names.** S3/S4/S5 all
grow a set of lobes; they are distinguished by *rhythm*, and that had to be built:
- S3 `bloom_from: 1` — member 0 carries forward from S2 at full pose, only the
  partner grows. (Without it the state blanked and both grew together.)
- S4 `bloom_offsets_ms: [0, 1600, 3200]` — an even cascade around the plane.
- S5 `bloom_offsets_ms: [0, 1200, 2400, 7000]` — three settle, then a long pause,
  then the fourth lifts out. That pause IS the archetype.

---

## §5 — Engine contract

`field_3d` · `scenario_type: "orbital_shapes"` · the `kind: "hybrid"` capability
(built this session; see the physics block §7 for the derivation and the commit
for the camera solve). New authorable fields it introduced:

`morph{from,to,at_ms,duration_ms}` · `angle_track` · `members` · `front_only` ·
`back_reveal{at_ms,duration_ms}` · `bloom_from` · `bloom_offsets_ms[]` ·
`ghost_fade_at_ms`/`ghost_fade_duration_ms` · `render_annotations` (config-level).

**Solved cameras** (measured, not chosen — §7 of the physics block): all three
hybrid views land at dist 6.0 with a ~250 px orbital radius, so the apparatus keeps
one home pose (Rule 32d). The shipped `p_set` camera is REJECTED for sp³ — it
foreshortens one of the four lobes to exactly 0.000.

---

## §6 — Definition of Done (Gate 0 — zero TBDs)

- [x] 8 states, complexity-driven; 8 distinct declared archetypes, **each verified
      delivered in dense frames** (not merely named)
- [x] Rule 16a contrast pair S1↔S5, with the wrong belief **shown on canvas**, not
      only narrated — and the ghost sequenced to lead-and-clear, never co-resident
- [x] Word budget 25–55 EN per state; ≤5-word delta cue on canvas; prose in the strip
- [x] ≥2 distinct `advance_mode` (3 present); explore last, `interaction_complete`
- [x] Rings core/advanced/core with the coherent-when-cut check performed
- [x] Rule 38b — explore surfaces CORE content only (hybrid picker, no s-character dial)
- [x] Every on-canvas number DERIVED and, where the HUD prints it, MEASURED from
      the seeded sample rather than asserted
- [x] Rule 34c — all on-canvas math real Unicode; ONE formula surface (S6 only)
- [x] Rule 35 — universal anchor (graphite vs diamond; water, fats, proteins)
- [x] `curriculum_tags` authored as CLAIMS; only CBSE verified, all others carry
      `needs_teacher_verification`
- [x] Registered at site #1 ONLY (chemistry isolation); `validate:concepts` 141/141
      without seeing this file
- [x] `scene_composition` annotations actually PAINT (`render_annotations`), and
      each is timed so no label states a thing before it has happened
- [x] THE EYE run and **frames read**; `check:hybrid-orbitals` 26/26
- [ ] **Founder visual approval → `visual:approve` (baselines NOT locked)**
- [ ] **Asmi professor review** — the standing bottleneck, now six concepts deep

---

## §7 — Known limits, recorded rather than hidden

1. **`front_only` is an OMISSION.** S4/S5/S8 draw only the big lobe of each hybrid,
   because four full sp³ surfaces fuse into a featureless ball. Every drawn vertex
   still stands on the real iso-density contour — nothing is shrunk or displaced —
   and **S7 turns the omission off and shows exactly what was left out**. No caption
   in an omitting state claims the whole orbital.
2. **The mesh spans origin→outer root**, so it swallows a ~10 pm node shell at ~7%
   of the lobe length (physics block §4b). No state claims the lobe is solid to the
   nucleus.
3. **Promotion (2s²2p² → 2s¹2p³) is never taught.** S1's belief statement
   presupposes it. This is a genuine coverage gap and a founder call: either a new
   S0, or an explicit prerequisite. **Not silently closed.**
4. **`render_annotations` is opt-in.** Making annotations paint fleet-wide would put
   never-reviewed text on ~41 baseline-locked concepts and move every baseline in
   one commit. That decision is the founder's; the capability now exists without
   taking it.
