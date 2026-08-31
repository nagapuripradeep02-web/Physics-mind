# The source book's own numbering, leaking into student-facing text

Found 2026-09-01 by the examiner pass on Maths-1A group A10 (`tr_vsaq_tan160_tan110` cites
"answers 132.1 and 132.2"), then swept across all 2,727 cards from the main session.

## What was swept

Only **reader-facing** fields — `lines`, `mark_note`, `why`, `common_mistakes`, `memory_tip`,
`margin_note`, `insider_note`. `verification.note` is internal, never rendered and never sent
to Vidi, so it is correctly excluded; provenance belongs there.

Every one of the swept fields is emitted into the Vidi prompt, so a leak here is not just
printed — it can be spoken to a student as fact.

## (a) The book's internal answer numbering and page numbers — a real leak

**28 cards.** *(Corrected 2026-09-01. The first pass reported "about 18" and was wrong: its
regex required a decimal point in the answer number, so every bare "answer 33", "answer 67",
"answer 81" reference was invisible to it. Group A08 found one of those by eye — "the formula
from answer 23" — which is what exposed the gap. The corrected sweep matches comparison
language pointing at a numbered answer, plus "book p.NN".)*

| Subject | Cards |
|---|---|
| mathematics_2b | 14 |
| mathematics (1A) | 9 |
| chemistry_2 | 4 |
| mathematics_2a | 1 |
| **mathematics_1b** | **0** |

Examples: *"proved as Unit 6 answer 26.1"*, *"Same cancellation as answer 81"*, *"The formula
from answer 23"*, *"same universal substitution as answer 21"*, *"at 320 atm on book p.111"*.

Maths-2B is the worst affected, not Maths-1A: 14 of its integration cards cross-reference each
other through the book's numbering. **Maths-1B has none at all** — consistent with it being the
paper authored most recently and most directly against this source.

The repair is a rewrite in place: say what the cross-reference *is* ("the same A·Dr′+B split")
rather than where the book keeps it. No mathematics changes.

## (b) The publisher named in reader-facing text — zero

No card names Sri Chaitanya, Baby Bullet, Fast Track or Sri Publishers in any field a student
or the chatbot can see. That boundary is holding, and `npm run check:originality` passes.

## (c) "The source book prints X" — 229 cards, a policy question rather than a bug

A much larger family, and deliberate: the recorded practice is *"the source has errors —
record them, never repeat them"*, so a card that corrects the book explains why.

| Subject | Cards |
|---|---|
| chemistry_2 | 80 |
| botany | 41 |
| physics_2 | 34 |
| chemistry | 21 |
| mathematics_2a / 2b | 15 each |
| zoology | 8 |
| mathematics (1A) / mathematics_1b | 6 each |

These read like *"The source book prints −5774.14 J; that is a digit transposition"* — genuinely
useful examiner guidance, and evidence of independent work rather than copying. But three
things follow that the founder should decide rather than inherit:

1. They are **reader-facing**, so a student sees us discussing a book they may not own, and
   Vidi will quote it back at them.
2. They implicitly tell the reader our answers are derived from one specific coaching book.
3. The maths papers carry only 6 each while Chemistry-II carries 80 — so the convention was
   never applied consistently, which means neither reading of it ("this is our house style" /
   "this is an accident") is currently true.

The cheapest resolution keeps the value and drops the exposure: phrase the correction without
naming a source — *"Some books print −5774.14 J here; that is a digit transposition"* — or move
the attribution into `verification.note`, where it is already supposed to live.

**Nothing here is a mathematical error, and none of it is urgent.** It is recorded because no
gate looks for it and because it was found by accident, through one card in one group.

---

## Addendum (group A11): the leaked cross-references are not just noise — they misdirect

Two Properties-of-Triangles cards (`ts_ipe_m1a_pt_a_cos_sq_half`, `ts_ipe_m1a_pt_r1_over_bc`)
tell the student across five reader-facing strings to look up "**the Unit 6 identity**".

Unit 6 of Maths-1A **in our bank** is Addition of Vectors. The identities named
(sum of sin 2A, sum of sin squared half-angles) live in our **Unit 8**, Trigonometric Ratios
and Transformations. The "Unit 6" is the source book's numbering, carried across unchanged.

So the card, and Vidi repeating it, send a student to the wrong chapter of our own product.
That upgrades this class from cosmetic to a real defect: a leaked cross-reference is not
merely meaningless to the reader, it can be confidently wrong inside our own catalog — and it
will drift again every time unit numbering changes, which it already did once when physics and
maths were renumbered for the 2026-27 books.

Any repair should therefore name the identity, never a unit or answer number.
