# Examiner accuracy audit — Maths 1A and 1B, complete

Run 2026-08-31 / 2026-09-01. **All 613 cards, all 1,831 steps, in 23 groups.** This is the
first accuracy pass either paper has ever had; Physics, Chemistry, Physics-II, Chemistry-II,
Maths-2A and Maths-2B all had one, and each found real errors.

Method: one examiner agent per group, each re-deriving every answer independently from
`question_text` before reading the card's own steps. A card's own `verification.note` claiming
it was checked was explicitly not accepted as evidence.

Every finding is in the per-group file beside this one (`A01`–`A11`, `B01`–`B12`), as
`question_id · step_id · what is wrong · what it should say`.

## The result

| | Cards | HARMFUL | WRONG | WEAK |
|---|---|---|---|---|
| Maths 1A | 301 | **2** | 62 | 102 |
| Maths 1B | 312 | **5** | 49 | 90 |
| **Total** | **613** | **7** | **111** | **192** |

- **HARMFUL** = wrong mathematics a student would copy into an exam and lose marks for.
- **WRONG** = incorrect but not exam-costing: a false mistakes line, an untrue memory tip, a
  mark note describing work the step does not do.
- **WEAK** = quality, register, Rule 41, cross-references.

## The headline: the mathematics is sound; the teaching prose around it is not

**Not one wrong final answer was found in 613 cards.** Every determinant, every derivative,
every locus, every identity, every mark sum reconciles. Groups re-verified numerically —
identities substituted at concrete angles, Cramer solutions back-substituted into all three
original equations, circumcentres checked by SA² = SB² = SC², cofactor matrices checked entry
by entry — and the working held up.

**310 findings, and 303 of them are in the prose fields.** `common_mistakes`, `memory_tip`,
`why`, `margin_note`, `insider_note`. Those fields are exactly what makes this bank a teaching
product rather than a list of answers — and they are the half nothing checks.

They are also the half the chatbot speaks. `buildVidiContext()` emits every one of them
verbatim, and `insider_note` is Vidi's opening line. **A false line in a prose field is not
inert: it is read aloud to the student as fact.** The Vidi audit scored 9.86/10 for
faithfulness to the bank — which means a confidently wrong card scores *well* while misleading
the reader.

## The seven harmful findings

| # | Card | What it does |
|---|---|---|
| 1 | `ts_ipe_m1a_mat_vsaq_reverse_law_transpose` | Says in three places (insider note, `why`, memory tip) that A′B′ "is not even defined here". A is 2×3, so A′B′ is 3×2 times 2×3 = 3×3 — perfectly defined. The `why` states that size **in the same sentence as denying it exists**. Teaches a false conformability rule. |
| 2 | `ts_ipe_m1a_mat_sqp_adj_three_at` | "The result is symmetric, so the transpose changes nothing" — adj A is not symmetric. A student who skips the transpose submits the cofactor matrix and loses the "show that" and the A⁻¹ mark. |
| 3 | `ts_ipe_m1b_sl_circumcentre_from_sides_x_y_2` | Prints (y−1)² as (y² − 1 + 2y) — wrong in both the sign of the linear term and the constant. The **same card expands that identical bracket correctly two steps earlier**, and the next line is computed from the correct version, so the working does not follow from its own printed line. |
| 4 | `ts_ipe_m1b_sl_vsaq_normal_form_3x_4y_12` | Writes "α = Tan⁻¹(4/3) ∈ Q₃". The principal inverse tangent of a positive number is ≈53°, in Q1. Should be 180° + Tan⁻¹(4/3) ≈ 233°8′, and the same step derived cos α = −3/5, which contradicts it. |
| 5 | `ts_ipe_m1b_sl_vsaq_area_find_a` | Compares 3x + 4y − a = 0 with ax + by + c = 0 and prints "a = 3, b = 4, c = −a", re-using `a` for two different things. Read literally it gives area 9/24 instead of 6; the next line silently switches meaning and reaches the correct ±12. |
| 6 | `ts_ipe_m1b_dif_root_1_minus_x2_plus_root_1_minus_y2` | Brands the **correct** identity sin C − sin D = 2 sin((C−D)/2) cos((C+D)/2) as having "the half angles swapped". A student who believes it writes sin C + sin D and destroys the cancellation the whole question depends on. |
| 7 | `ts_ipe_m1b_ad_profit_150_minus_x_max` | `insider_note` — Vidi's opening line — says "no second-derivative test is needed". Step 3 is worth **a full mark of the 4** for exactly that test, and the card's own mistakes list flags skipping it. |

Five of the seven are in Maths-1B, three of those in The Straight Line.

## The dominant defect: condemning correct mathematics

Found in **every one of the 23 groups**, and easily the most common single shape: a
`common_mistakes` line that marks a mathematically **correct** alternative route or form as an
error. A sample of what students are currently told is wrong:

- Building a coplanarity determinant as [PQ QR RS] — identical to [PQ PR PS], two row
  operations apart. **All four coplanarity cards carry this.**
- Naming GP terms a, ar, ar², ar³, ar⁴ — "leaves two unknowns and no way to remove r", when the
  product is (ar²)⁵ = 1024 in one line.
- The exact decimal 1.5, called a "rounding" mistake.
- Solving cos5θ = 0 as 2nπ ± π/2 — the same solution set the card's own form gives.
- Factorising k² − k as k(k−1).
- Skipping a transpose on a symmetric matrix, where it genuinely changes nothing.
- √9·√22 — condemned on a card that does exactly that one line earlier.
- Substituting x = y²/4 into the circle — a valid route to the same answer.
- Giving 0.0601 — the exact number the same card's margin note tells the student to write.

This is the worst-shaped defect in the bank. It does not merely fail to help: it argues a
student **out of correct working**, in the voice of an examiner, and the chatbot repeats it.

## Second pattern: the card contradicting itself

Nearly every group found a card arguing with itself in front of the reader — an `insider_note`
against its own steps, a `margin_note` naming a route the step never takes, a `why` refuting
the sentence it sits in, a mnemonic that is backwards ("the word with more letters, subnormal,
is the product" — subtangent has ten letters, subnormal nine), a claim that "each part alone
increases without bound" where both go to −∞ and the step's own `why` says so.

The mechanism is nearly always the same: **prose cloned from a sibling card.** Cards in a unit
share a shape, so a mistakes line true of one is pasted onto a neighbour where it is false.
B02 traced 14 of its 18 findings to this; A05 traced 6 of 16. Two Locus cards carry a mistake
about expanding "(y − 4)²" cloned from the one card that actually expands it.

A related trap for whoever repairs this: **the same false claim usually repeats across two or
three prose fields of the same step**, so a fix must sweep `why`, `memory_tip`,
`common_mistakes` and `margin_note` together, not patch one field.

## Two machine-detectable classes, swept bank-wide

Both were found by accident, through one card in one group, and then swept across all 2,727
cards. Neither is checked by any gate. Details and the proposed gates:

- `ORDINAL_MARK_NOTES.md` — **40 cards** whose margin note names a mark number that disagrees
  with the marks the step actually earns, in three shapes (ordinal, cardinal, total). Sixteen
  are fallout from the 2026-08-28 re-cut from 7 marks to 8; the rest were authored wrong. One
  of them, `mat_det_square_cyclic`, is what made Vidi tell a student the wrong mark total.
- `SOURCE_BOOK_LEAKS.md` — **28 cards** citing the source book's own answer numbering or page
  numbers in student-facing prose ("proved as Unit 6 answer 26.1"). Not merely meaningless to
  the reader: our unit numbering differs from the book's, so two cards send the student to
  Addition of Vectors for a trigonometric identity.

## Where the bank is strongest, and why it matters

| Group | Cards | Findings |
|---|---|---|
| B10 Applications of Derivatives (1/3) | 30 | **0 · 0 · 8** |
| B07 Differentiation (1/3) | 24 | 0 · 1 · 5 |
| B12 Applications of Derivatives (3/3) | 29 | 0 · 3 · 3 |
| B05, B06 Limits and Continuity | 43 | 0 · 4 · 16 |

Those are exactly the units authored **most recently and directly against the Sri Chaitanya
book** — the same units the coverage diff found to be a clean 1:1 with it. B07 and B12 show no
cloned boilerplate at all.

The oldest units carry the defects. That is an encouraging finding: the authoring process got
better, and the remaining work is a cleanup of legacy prose rather than a rebuild.

## What this does not cover

No card was edited. These are findings only; the repairs are a separate, approved pass.

`verification.status` remains `unverified` and `needs_teacher_verification: true` on all 613.
This audit is a careful re-derivation, not a board teacher's sign-off, and it does not license
flipping that flag.

---

## Repairs applied 2026-09-01 — all seven harmful findings fixed

All 7 are repaired on master. Verified: `check:cards` 0 (301 + 312), `build:answers` 0,
`check:originality` 0, `tsc` 0, `vitest` 443/443. Seven card JSONs changed, nothing else.

| Card | Repair |
|---|---|
| `mat_vsaq_reverse_law_transpose` | Four places claimed A′B′ "is not even defined". Now: it can be formed but comes out 3×3 against a 2×2 (AB)′, so the order is forced by the reversal law, not by conformability. |
| `mat_sqp_adj_three_at` | Two places said the cofactor matrix is symmetric "so the transpose changes nothing". It is not symmetric. Now says the transpose does change it and skipping it gives the wrong matrix — agreeing with the card's own mistakes line. |
| `sl_circumcentre_from_sides_x_y_2` | `(y² − 1 + 2y)` → `(y² + 1 − 2y)`. The line now follows from the one above and matches the same card's correct expansion two steps earlier. |
| `sl_vsaq_normal_form_3x_4y_12` | `α = Tan⁻¹(4/3) ∈ Q₃` → `α = 180° + Tan⁻¹(4/3)`, in three places: the working line, the boxed answer, **and the recall rubric**. |
| `sl_vsaq_area_find_a` | The unknown `a` collided with the general form's `a`, printing "a = 3 … c = −a". Renamed the general form to px + qy + r = 0 with Δ = r²/(2\|pq\|). Ten replacements including the recall rubric. |
| `dif_root_1_minus_x2_plus_root_1_minus_y2` | The mistakes line condemned 2 sin((C−D)/2) cos((C+D)/2) as "half angles swapped" — that is the card's OWN correct formula with the factors in the other order, since multiplication commutes. Replaced with the genuine error (the sine on the half SUM, which is sin C + sin D), and the memory tip reworded to name which half carries which function rather than a writing order. |
| `ad_profit_150_minus_x_max` | The `insider_note` — Vidi's opening line — said "no second-derivative test is needed" on a card paying 1 of 4 marks for that test. Now keeps the useful observation (the negative x² coefficient shows it is a maximum) and tells the student to write P″ = −2 < 0 anyway because it carries its own mark. |

**Two of the seven had the false claim in the `recall` rubric as well as in the visible text**
(`sl_vsaq_normal_form_3x_4y_12`, `sl_vsaq_area_find_a`). Nothing flagged that; it surfaced only
because a replacement matched twice instead of once and the script refused to write. The recall
rubric is grader-side, so a wrong one silently marks a correct student answer wrong — any
future repair pass must sweep `recall.must_convey` alongside the five prose fields.

Five of the seven were live on answers.viditra.co at the time of the audit. The next
`deploy:answers` therefore ships zero known-harmful maths cards, and simultaneously delivers
the 204 Maths-1B calculus cards the live site is missing. Deploy remains founder-only (Rule 17).

**Still open: the 111 WRONG and 192 WEAK findings.** No card outside these seven was touched.

---

## Prose repair pass, 2026-09-01 — all 111 WRONG findings closed

Repaired across 14 group passes plus main-session work. Every gate green afterwards:
`check:cards` on all 11 prefixes, `build:answers` 0, `check:originality` 0, `tsc` 0,
`vitest` 443/443.

**Scope discipline.** `lines[]` was off limits except where a PRINTED line was itself false —
five cases, each re-derived first: the tautology `7(2x−2y)+8 = 14x−14y+8`; a factorisation
whose sign was wrong; `(a−b) = √((a+b)²−4ab)` missing its modulus and reusing the pair's own
letters; a log split declared valid on `4x²−9 > 0` when both factors are negative for
x < −3/2; and a false statement about behaviour sitting inside the working. Where a report
recommended a `lines[]` change that was not a printed falsehood, the correction went into
`why` instead and was reported as such.

**The `recall` rubric was the hidden half.** Adding it to the sweep found rubrics that would
have marked CORRECT student answers wrong: two `recall.accept` entries describing a different
card's substitution ("x minus two and y minus three" on a card that is x−3, y+4); a
`must_convey` demanding the factored form of a derivative when the three-term form is complete;
another requiring the ± on a question asking for *a* triad; another accepting only one of two
equivalent general solutions. Nothing in the build looks at these fields.

**Corrections to the audit itself.** Three reports cited a step that did not hold the defect,
and several findings were already fixed by the earlier sweeps; each was verified against the
current text rather than re-edited. One report's recommendation was declined on the mathematics
(a third copy of a warning already on two neighbouring steps).

**Two findings referred out, not fixed:**
- `ts_ipe_m1a_fn_domain_root_9_minus_x2` — the book also asks for the range. Fixing it needs a
  `question_text` change or a sibling card, which is a content decision, not a repair.
- Three `mark_split` labels on half-angle cards read "sum to product" for a step that uses the
  Pythagorean identity. `mark_split` is structural and paired with the step label, so a re-cut
  needs both changed together.

**Source-book cross-references: 1A/1B now zero.** Four sweeps were needed because each regex
was narrower than the defect. The shapes found only by the later passes: bare "Unit 6
identity" with no answer number; "chapter answer 8"; "the facing answer"; "on this page";
"question 95.1"; and "answer NN" without the comparison wording the refined pattern required.
Two physics cards referenced the BOOK's unit numbers and were wrong against ours — a Laws of
Motion card calling itself "Unit 5" (our unit 5 is Work Power Energy) and a rotational card
attributing the work-energy theorem to "Unit 6" when it is our unit 5.

**Still open: Maths-2B carries about 20 such cross-references** ("answer 27", "answer 127",
"answer 53.2"), far more than the first sweep's count. That is second-year material and a
separate job. The 192 WEAK findings are also untouched.
