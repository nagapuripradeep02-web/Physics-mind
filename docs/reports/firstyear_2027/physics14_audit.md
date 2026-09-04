# physics-14 examiner audit — wave A, 2026-09-02

15 cards audited card by card: question, mark split, every printed line, and every `why`,
`common_mistakes`, `memory_tip` and `margin_note`. **23 findings across 13 of the 15 cards.**
`ts_ipe_p1_pet_ai_ml_in_astrophysics` and `ts_ipe_p1_pet_mri_principle` were clean.

| severity | count |
|---|---|
| HARMFUL | 7 |
| WRONG | 8 |
| WEAK | 5 |
| REGISTER | 3 |

Every automated gate was green before this audit ran — `check:cards`, `build:answers`,
`check:originality`, `check:xrefs`, `check:papers`, `backtest:physics`, `vitest`, `measure:wrap`.
**None of the 23 findings is machine-checkable**, which is the whole argument for auditing each
wave before it merges rather than trusting a green gate chain.

## The defect shape, again

Six of the seven HARMFUL findings are the same shape the second-year audit found: **a prose field
contradicting its own card**. Here it is `common_mistakes` calling a correct, mark-earning answer a
mistake, usually contradicting the `margin_note` sitting two lines below it. A student following
those lines would delete a correct answer.

- `ai_ml_other_field` marked "naming a field with no stated reason" a mistake on step 1, when the
  reason is step 2's mark.
- `fusion_copies_stars` marked "naming only the Sun" a mistake while its own margin accepted
  exactly that.
- `photonics_technologies` marked "naming the internet" a mistake while its own margin accepted
  broadband internet as the same answer worded differently.
- `quantum_supremacy` required the synonym "quantum advantage" for the mark, penalising a complete
  correct definition.
- `qubit_superposition` marked the standard phrasing a mistake — nearly the card's own answer line.
- `physics_areas_in_robots` marked thermodynamics a mistake, when the student's own printed key may
  well say thermodynamics.

## The seventh HARMFUL is false physics

`walking_robot_newton_laws` told a student that Newton's **first** law "does not apply to a moving,
balancing robot". It applies to every body, and a robot standing balanced is exactly first-law
equilibrium. The correct point is narrower: the first law is true but does not give the joint force
and torque, and the second law is what supplies them.

## Physics findings worth keeping in view

- **The action-reaction misconception nearly shipped.** The same card's `why` said the ground's
  reaction force "is what keeps the robot from falling". The pair is equal and opposite whether the
  robot stands or topples, so it cannot by itself prevent falling.
- **A single qubit carries one classical bit.** The card claimed superposition lets one qubit "hold
  more information than a single 0 or 1". The advantage is collective: n qubits represent all 2ⁿ
  combinations at once.
- **A bare glass rod is a light pipe.** A margin accepted "light escaping through the side of an
  ordinary glass rod" as the contrast to a fibre. A plain rod also guides light by total internal
  reflection; the cladding's job is to keep the reflecting surface clean and protected.
- **Indium tin oxide is a metal oxide and IS the standard transparent conductor.** A mistake line
  told students not to name a metal oxide, which is backwards — graphene is the flexible alternative
  to it.
- **Nanotube confinement is circumferential.** "Energy levels become separated, not continuous" is
  too blunt: confinement around the tube splits the states into sub-bands while states along the
  axis stay continuous, and many nanotubes conduct like metals.
- **Fusion past hydrogen burning is real.** "Naming a heavier element than helium as the product"
  is only a mistake for the Sun's own reaction; later-stage stars do fuse up to iron.
- **Targeted delivery is not perfect delivery.** "The drug releases only at the tumour" overstated
  it and contradicted the next line, which admits healthy tissue receives less, not none.

## Two auditor findings were not applied, and why

- **Lead answer for "another field of physics".** The auditor wanted particle physics to replace
  materials science, on the ground that materials science is not squarely a field of physics.
  Materials science is what the study material prints, so it is what the examiner's key will say,
  and it is a genuine application of condensed-matter physics. It stays the lead; particle physics
  stays named as an equally acceptable answer.
- **Optics on the sunshield card.** The auditor wanted optics dropped because optics alone describes
  nothing the shield does. That last part is right and the margin claiming "optics alone earns
  partial credit" was corrected — but the printed key pairs thermal physics with optics, so optics
  stays in the answer.

## Provenance defect found separately

Four cards cited "printed p.143" when questions 12-15 are printed on p.144. Fixed before the audit
ran. The provenance line is the point of the originality boundary, so a wrong page in it is not
cosmetic.
