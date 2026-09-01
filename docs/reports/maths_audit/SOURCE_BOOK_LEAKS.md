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

---

## Addendum 2 (2026-09-01, later the same day): family (a) is CLOSED, and the count was wrong twice

Family (a) now reports **zero** across all four maths papers and both chemistry papers. Getting
there took two more passes, and both are worth recording because the same mistake was made twice
in opposite directions.

### The count was 28. It was actually 43, in two instalments.

**Instalment 1 — 14 card-level `insider_note`s (Maths-2B).** These are what the original table
counted, and they were repaired first: each note now names the mathematics it points at rather
than where the book keeps it, e.g.

  "the same t=Tan-1x idea from answer 154"  ->  "the same idea as the substitution t = Tan-1x"
  "This proof and answer 14's share ..."    ->  "... the triangle formed by the three points of contact"

**Instalment 2 — 29 more strings in 14 cards, at STEP level.** Found only because a spot-check of
the served bundle still matched "answer 186" on a card whose `insider_note` had just been fixed.
The second occurrence was in `answer.steps[1].memory_tip`.

**The cause was a traversal bug in the re-sweep, not a regex.** The scan walked `card.steps`,
which does not exist — steps live under `answer.steps` — so it silently read card-level fields
only and reported a clean Maths-2B while a step-level `memory_tip` still leaked. The failure mode
is the one this file already records ("each regex was narrower than the defect"), except the
narrowing was in the WALK, and a walk that finds nothing looks exactly like a walk that finds
nothing wrong. **A sweep must be proved against a known-positive before its zero is believed.**

That instalment also corrected the claim that Maths-1A was at zero. It was not:
`ts_ipe_m1a_tr_cos_s_minus_a` still carried "the same tactic used in answers 26.2 and 28" in a
step-level `why`.

### Two false-positive families, both of which nearly caused harm

- **`Q1`-`Q4` are QUADRANTS, not question numbers.** A `\bQ\d+\b` pattern flags "sin θ is positive,
  so θ is in Q1 or Q2" — correct, standard trigonometry wording on at least three cards. The
  pattern now matches `Q5`+ only. Rewriting those would have damaged correct mathematics.
- **"answer" as a VERB.** "A student who compared only the two critical values would answer 1.9132
  and 1.2284" is not a cross-reference. Likewise "the answer 1.4π", "the answer 7.5 each" — the
  number is the RESULT, not an index. The pattern now requires locational wording
  (`as|from|in|like|of|to|with|than|see` + `answer NN`, or `(answer NN)`, or `answer NN's`).

### What is deliberately left

Two `physics_2` cards remain, and they are family (c), not (a):
`ts_ipe_p2_sem_nand_and_nor_gates` ("on page 56 it repeats the NAND caption") and
`ts_ipe_p2_sem_transistor_circuit_symbols` ("The book prints the two symbols swapped on page 54").
Both are genuinely useful examiner guidance about a printing error, and both name a book to a
student. They belong to the 229-card policy question in section (c) above, which is the founder's
to decide — not something to sweep away while closing (a).
