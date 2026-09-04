# Second-year IPE Answer Book — audit and repair, 2026-09-02

Every card of all four second-year papers was examined: **1,124 cards in 73 group reports**. Per-group
detail sits in the files beside this one (`C2-01..32`, `P2-01..15`, `M2A-01..13`, `M2B-01..13`), the
figure reviews in `FIG-*.md`, and the chatbot grading in `VIDI-*.md`.

## What was found

| Paper | Cards | HARMFUL | WRONG | WEAK |
|---|---|---|---|---|
| Chemistry-II | 340 | 11 | 97 | 167 |
| Physics-II | 256 | 3 | 15 | 40 |
| Maths-2A | 257 | 1 | 30 | 9 |
| Maths-2B | 271 | 7 | 37 | 16 |
| **Total** | **1,124** | **22** | **179** | **232** |

- **HARMFUL** = wrong content a student would copy into an exam and lose marks for.
- **WRONG** = incorrect but not exam-costing — a false mistakes line, an untrue tip, a note describing
  work the step does not do.
- **WEAK** = quality, register, Rule 41.

## Two different jobs, and they must not be described as one

**Chemistry-II got a full truth audit — its first ever.** The paper was authored in August 2026 and
every card's `verification.note` records that the two structural source checks were impossible for it
(no second chemistry book, no second-year chemistry board paper in the corpus). Its only prior content
corrections came from Vidi reply graders, not from a card pass. That is why it holds more than twice
the findings of the other three papers combined.

**Physics-II, Maths-2A and Maths-2B got a PROSE-AND-CONSISTENCY pass**, not a fresh re-derivation.
Their answers were re-derived at authoring time (commits `ec4efa2f`, `6a633877`, `0040b469`), and this
session checked the printed working for self-consistency, recomputed the numbers, and then audited the
teaching prose those passes never covered. Do not report these three as "re-derived from scratch".

## The defect shapes worth remembering

**In the maths papers the harmful defect is almost always the `insider_note`** — the line the chatbot
speaks to the student BEFORE anything else — contradicting its own card's working. Six of the seven
Maths-2B harmful findings are of exactly this shape: a point of contact with the wrong signs, a claim
that skipping a division "doubles every coefficient" when it makes the result non-linear, a focal-chord
exception that does not exist, a latus rectum said to move with the centre, and a fraction chain giving
3π/512 under a boxed 3π/128.

**Three of those notes call a VALID alternative method a mistake.** That is the same dominant defect
the Maths 1A/1B audit found — prose that argues a student out of correct working, in an examiner's
voice — and it is worse in an `insider_note` because that is the first thing said.

**In Chemistry-II the harmful findings are chemistry**, not register: a memory tip dropping p⁰ from the
molar-mass formula (reciting it gives 200 instead of 170 g/mol), a card citing Nessler's reagent as a
source of ammonia when it is a test for it, an insider note pointing at the wrong one of three copper
products, and a card asserting 300 atm "is the NCERT value" when NCERT prints 320 — while marking the
NCERT figure as a student error.

## Figures

All 146 second-year figures were rendered and looked at, not merely gate-checked. Six were drawn
wrong rather than merely mislabelled, and all six are repaired:

| Figure | What was wrong |
|---|---|
| `p2_ray_critical_angle_total_internal_reflection` | reflected angle 54.5° against an incident 61.0° — the law of reflection visibly violated |
| `p2_ray_formation_of_rainbow` | primary and secondary bows drawn the wrong way round, contradicting the card's own 40–42° / 50–53° text |
| `c2_df_colour_of_transition_metal_ions` | crystal-field barycentre inverted: the drop was 1.46× the rise where the rise must be 1.5× the drop |
| `m2b_ell_tangent_intercepts_cm_cn_identity` | the "tangent" was a secant; the drawing gave 1.070 for an identity the card proves equals 1 |
| `m2b_ell_tangent_normal_end_latus_rectum` | tangent slope 0.28 against the true 0.66, and the normal inherited the error |
| `m2b_par_standard_form_derivation` | flat vertex instead of the vertical tangent y² = 4ax requires; SP = 67.1 against PM = 100.0, so the drawn point was on no parabola |

About two dozen further label defects (collisions, missing point markers, a leader ending inside the
circle it points at, a lone pair the caption depended on but which was never drawn) are listed in the
`FIG-*.md` reports and were repaired with them.

## What the repair agents taught us

Roughly **one auditor suggestion in eight was itself wrong**, exactly as the repair brief warned, and
the agents caught them. Two would have introduced NEW errors:

- the proposed fix for `c2_hal_pcl5_reactions_vsaq` had the Lucas reagent inverted, teaching that a
  tertiary alcohol needs anhydrous ZnCl₂ when it is primary and secondary that do;
- the proposed `why` for the German-silver card would have rebuilt the card's contradiction facing the
  other way, asserting copper-major against the boxed ranges.

A third suggestion, on five Maths-2A reciprocal-equation cards, would have condemned use of the
quadratic formula — the very "condemning correct work" defect the audit exists to find, and against
those cards' own `recall.accept`.

One agent also **disputed a premise in its own dispatch**: `cel_antihistamines` appeared in the repair
queue as harmful only because another card's finding row mentions it. The card is clean. The queue's
severity counts are a routing aid; **the report headers are the authoritative count.**

## Marking scheme

Nothing needed changing. `PAPER_PATTERNS` correctly pins Physics-II and Chemistry-II to the 60-mark
ABC_60 shape (LAQ 8) and both maths papers to `ABC_75_MATHS_PRE_REFORM` (LAQ **7**), because the
2026-27 reform is first-year only and second year switches in 2027-28. Every card's step marks and
`mark_split` sum correctly and the schema enforces it. What is NOT verified is whether the splits
themselves match the board's: they are the bank's own claim on every second-year card, and no
second-year board paper exists in the corpus to test them against.

## Left for a teacher, not settled here

Every group report carries a "Teacher-gate questions" section, and the repairs deliberately did not
pick sides on any of them. The recurring ones: Popoff's rule direction, thiocyanato vs isothiocyanato,
the Dow-process pressure (300 vs NCERT's 320 atm), German silver's composition, pine oil as collector
or frothing agent, ligand-name dialect (chlorido vs chloro), the vitamin E deficiency wording, the
octane 8 g vs 10 g answer, "Daniel" vs "Daniell", and whether a diagram earns a mark on questions that
say "with a suitable diagram". `verification.status` remains `unverified` on all 1,124 cards.
