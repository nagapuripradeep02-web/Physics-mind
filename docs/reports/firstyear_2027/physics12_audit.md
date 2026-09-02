# physics-12 examiner audit — wave B, 2026-09-02

37 newly authored cards audited in two halves, 22 Very Short Answers and 15 Short and Long Answers.
**51 findings across roughly 30 of the 37 cards.**

| severity | VSAQ half | SAQ/LAQ half | total |
|---|---|---|---|
| HARMFUL | 3 | 4 | **7** |
| WRONG | 8 | 6 | **14** |
| WEAK | 3 | 10 | **13** |
| REGISTER | 10 | 7 | **17** |

Every automated gate was green before either audit ran. Three chapters into wave B, **not one finding
across 111 cards has been machine-checkable, and not one number has been wrong.**

## The load-bearing physics step that was missing from three cards

Going from ΔQ = C_P ΔT = ΔU + PΔV to C_P ΔT = C_V ΔT + RΔT silently replaces ΔU with C_V ΔT inside a
**constant-pressure** process. That is legitimate only because the internal energy of an ideal gas
depends on temperature alone, so ΔU = C_V ΔT holds in *any* process for the same ΔT.

**That sentence is the whole reason the derivation works, and it appeared in none of the three cards
that derive or use the result** — not in the printed lines, not in the `why`, not in the mistakes.
One card even tied C_V to zero work in an earlier step and then used it where work is done, without
comment. Added explicitly, in the lines a student writes, before the substitution.

## The harmful seven

- **The sign-convention card was wrong twice, and it is what every other card defers to.** Its `why`
  said the first law "adds Q and W together on the same side", against its own printed ΔQ = ΔU + ΔW.
  Its memory tip said work follows the "same pattern as Q: outward is positive" — but heat outward is
  negative and work outward is positive. The two patterns run in opposite senses, which is exactly why
  the law reads ΔU = ΔQ − ΔW.
- **"Heat never flows from a colder body to a hotter one."** It does, in every refrigerator and heat
  pump, both of which appear in this same chapter. Only the *spontaneous* flow is forbidden.
- **A card boxed ΔU ≠ 0 for a non-cyclic process and called writing ΔU = 0 a mistake** — while its own
  worked example is a single isothermal expansion, where ΔU is exactly zero, and a neighbouring card
  boxes ΔU = 0 for that very process.
- **"The word SLOWLY is the definition"** in a margin, directly against the same step's own mistake
  line saying slowness alone is not the definition.
- **The zeroth-law card** made naming the thermometer the only wording that earns the mark, and called
  the standard significance — that the law gives temperature its meaning — an error, which the next
  card teaches as correct.
- **η = 1/3 called incomplete** for want of a percentage sign, when it is the card's own boxed value.

## Physics corrected beyond that

- **Absolute zero is unattainable by the THIRD law, not the second.** A margin attributed it to the
  second. The second law bears on 100% efficiency through Kelvin-Planck and the Carnot bound.
- **Kelvin-Planck forbids complete conversion, not near-complete.** A card called "an engine can
  approach 100% with enough care" a mistake. Efficiency does approach 1 as the sink temperature falls.
- **Internal energy is not "fixed by the heat supplied and the work done".** It is a state function
  precisely because it is not; only its change is fixed.
- **PV = nRT needs negligible molecular volume too**, not just zero attraction.
- **A cycle has no unique starting point**, so beginning the Carnot description at a different process
  is not an error.
- **Q = mcΔT is standard notation.** A card called the lower-case c an error; the real error is
  pairing the *molar* C with a mass.
- **PV = RT is correct for one mole.** A card called leaving out n a mistake.
- **"Yes" is simply the wrong answer** to whether an open refrigerator cools a room, not an answer
  that needs better bookkeeping.
- **Zero work in an isochoric process is not "nothing to push against"** — the gas does press on the
  walls; the work is zero because there is no displacement.
- **An adiabatic process is not simply "fast"** — it is rapid enough that no appreciable heat crosses
  the walls, yet still quasi-static, which is why PV^γ = constant can be drawn as a curve at all.

## The three rules this chapter kept breaking

They now appear at the top of the repair brief, because each recurred across many cards rather than
once:

1. **Never claim what a mark scheme awards or refuses** unless the card's own mark split says so. This
   rule was established one chapter earlier and produced findings on eight cards here.
2. **Never name another card by its internal id.** Several cards said "see vsaq6" or "the molar
   specific heat of vsaq8" in text the companion speaks aloud, where it means nothing to a student.
3. **An `[eq]` or `[boxed]` line must be a real relation.** Unit statements, hedged inequalities and
   sentences were being boxed.

## Recall coverage is now mixed *within* a chapter

27 of the 39 cards in physics-12 carry a `recall` rubric and 12 do not, because parallel authoring
agents made different choices about an optional field. Recorded, not fixed: the spoken-recall grader
endpoint is a standing founder-level blocker, and `recall_available` degrades gracefully. Future
briefs should state one way or the other rather than leaving it to each agent.
