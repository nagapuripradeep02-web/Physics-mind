# physics-10 examiner audit — wave B, 2026-09-03

30 newly authored cards audited in two halves, 14 Very Short Answers and 16 Short and Long Answers.
**54 findings across 25 of the 30 cards.**

| severity | VSAQ half | SAQ/LAQ half | total |
|---|---|---|---|
| HARMFUL | 2 | 4 | **6** |
| WRONG | 6 | 10 | **16** |
| WEAK | 8 | 12 | **20** |
| REGISTER | 6 | 6 | **12** |

Every automated gate was green first. Four chapters into wave B, **no finding across 141 cards has
been machine-checkable.**

## The lesson of this chapter: a correction became a prohibition

The brief told authors to state Bernoulli's principle **per unit mass**, because the source book's
own statement says "per unit volume" while the formula it prints is per unit mass. Several cards
then went further than the brief and told students the per-unit-volume statement is an **error**.

It is not. P + ½ρv² + ρgh = constant is the standard board form and a complete answer. Four of the
six harmful findings are this shape, on three different cards, including one that contradicted its
own next step.

**A correction says "write this". It never says "the other is wrong" unless the other really is
wrong.** That rule now heads the repair brief, alongside the three the earlier chapters produced.

## The cut that did not stand alone

The Venturi card is authored once at 8 marks with a 4-mark cut, because the book prints the same
question in both sections. Read on its own, as a student sees it, **the 4-mark cut handed over a
boxed formula whose symbols it never named** — the two areas were identified only in a hidden step,
the density nowhere at all — and its override described the wide-section speed as the throat speed.

This was the exact risk the authoring brief warned about, and it still happened. **A cut must be read
back in isolation before it ships**; the schema checks the arithmetic of a cut but nothing checks
whether it makes sense.

## Where the auditor was right that something was wrong and wrong about the fix

The viscosity-and-raindrop card's question text ends "explain the terminal velocity using a graph",
and no step draws or mentions one. The audit proposed **adding** a velocity-time graph.

Checking the source settled it the other way: the book's stem asks for the definition, Stokes' law,
the conditions under which a raindrop reaches terminal velocity, and the expression — **there is no
graph in the question.** The defect is that the card's question text drifted from the source, so the
fix is to restore the stem, not to author a graph nobody asked for.

**An audit finding is a lead. Check it against the source before acting on the remedy it proposes.**

## Two cards in the same chapter gave different answers

`reynolds_number` says the region from 1000 to 2000 is unsteady, not yet turbulent.
`critical_reynolds_number` said everything below 2000 stays streamline. A student meeting Re = 1500
got two different answers from two cards in the same chapter. Corrected to one boundary set.

## Physics corrected

- **Average pressure is not pressure at a point.** One is the total normal force over a finite area;
  the other is the limit as that area shrinks.
- **"A vector needs one fixed direction" is false** — a vector field's direction varies from place to
  place. Pressure is a scalar because at a point the fluid presses equally whichever way the surface
  faces, so the direction belongs to the surface.
- **Two quantities sharing a unit need not be the same quantity.** A card claimed the unit algebra
  *proves* surface tension equals surface energy. Torque and energy are both newton metres. The
  equality follows from W = T ΔA.
- **Dynamic lift is not always upward** — a card defined it as an upward force and then spent three
  steps on a ball that swerves sideways. It acts perpendicular to the motion.
- **A brake pedal has no relevant area.** The hydraulic pressure is set at the master cylinder.
- **The critical-velocity formula needs the critical Reynolds number**, not the general symbol, or it
  is just the Reynolds definition rearranged and true at any speed.
- **θ = 0° is the accepted value** for pure water on clean glass; a card called writing it an error
  while the chapter's own angle-of-contact card gives exactly that.
- **8° is larger than 0°** — a card called it "a smaller acute angle" than the value it had just
  given.

## Still recurring from earlier chapters

Mark-scheme claims the split does not support, on six cards. Boxed lines that are word-chains rather
than relations, on five. Both rules were established two chapters ago and both keep reappearing,
which suggests they belong in the AUTHORING brief as prominently as they now sit in the repair one.
