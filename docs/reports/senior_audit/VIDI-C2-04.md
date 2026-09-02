# Vidi audit — Chemistry-II, slice 4 of 14 (`audit_r1_ts_ipe_c2.slice-04.md`)

Grading reader pass. 25 question cards × 10 templates (`marks`, `whystep`, `remember`, `explain`,
`mistakes`, `important`, `skiplast`, `why`, `outofbank`, `telugu`) = **250 replies, all graded, no
sampling.** No guard replies ("I could not answer just now" / "Give me a short moment") appeared in
this slice.

## 1. Per-template table

| Template | Mean | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 25 |
| whystep | 3.000 | 0 | 0 | 0 | 25 |
| remember | 3.000 | 0 | 0 | 0 | 25 |
| explain | 3.000 | 0 | 0 | 0 | 25 |
| mistakes | 3.000 | 0 | 0 | 0 | 25 |
| important | 3.000 | 0 | 0 | 0 | 25 |
| skiplast | 3.000 | 0 | 0 | 0 | 25 |
| why | 2.720 | 0 | 1 | 5 | 19 |
| outofbank | 2.920 | 0 | 0 | 2 | 23 |
| telugu | 3.000 | 0 | 0 | 0 | 25 |

## 2. Overall mean

**Overall mean: 2.964** across all **250** replies (0 excluded as guard replies — none found).

## 3. Every reply scored 0 or 1

Only one reply in the whole slice scored below 2.

**`ts_ipe_c2_ck_order_of_reaction` — `[why]`, no step open — score 1**

> The chemistry reason is that the order comes from the slowest step in the reaction mechanism, not
> from the balanced equation. The balanced equation only shows the overall reactants and products,
> but the rate law reflects the actual molecules that must collide in the rate-determining step. For
> N₂O₅, the slow step involves only one molecule of N₂O₅ breaking apart, so the power in the rate law
> is 1, even though the coefficient in the overall equation is 2. So the order is a measured fact
> about the mechanism, and that is why the definition says "experimentally found."

Reason: this invents a specific, unstated mechanistic claim — that the rate-determining step of
N₂O₅ decomposition is a single N₂O₅ molecule breaking apart — that appears nowhere in the ANSWER
FACTS. The bank's own point (INSIDER POINT + `s1`/`s2` WHY) is only that order is *found by
experiment* and can differ from the coefficient; it never grounds this in a hypothesized elementary
step. A student who reproduced this specific "slow step" story in an exam would be presenting a
fabricated mechanistic justification as if it were the book's own reasoning.

No reply scored 0.

## 4. Four explicit counts (each over ALL replies of that template in this slice)

- **WRONG-STEP** (a `whystep` reply that explains a different step than the one named, or misattributes
  its marks): **0 of 25.** Every `whystep` reply in the slice stayed on the exact step named in the
  situation line (verified against `s1`…`s5` step ids across all 25 cards) and cited that step's own
  marks correctly.
- **SCOPE-CREEP** (an `outofbank` reply that declines correctly but then volunteers content of the
  open question): **2 of 25.**
  - `ts_ipe_c2_cel_dettol_constituents` `[outofbank]`: "*For the dettol question that is open, the two
    constituents are chloroxylenol and terpineol, and dettol is an antiseptic.*" — names both
    constituents and the class unprompted.
  - `ts_ipe_c2_cel_tincture_of_iodine` `[outofbank]`: "*For the question I do have open, tincture of
    iodine, the 2-mark answer is: a 2 to 3 per cent solution of iodine in alcohol and water, and its
    uses are cleaning wounds and acting as an antiseptic.*" — hands over the complete 2-mark answer
    unprompted, the more serious of the two.
  Both were scored 2 (correct content, but padded past what the student asked for), not 0/1, since
  the actual out-of-bank question was still declined rather than answered.
- **LITERAL-MARKDOWN** (any reply containing `**`, leading `- ` bullets, `#` headings, or backticks):
  **0 of 250.** Every reply is plain prose in blockquotes; no markdown syntax leaked into any reply.
- **TRUNCATED** (any reply ending mid-sentence or mid-formula): **0 of 250.** Every reply — including
  the long `explain`/`mistakes` ones and every formula-bearing kinetics reply — ends on a complete
  sentence.

## 5. Mechanical flags

No mechanical flag lines are shown under any reply in this slice file — nothing to report here.

## 6. Card ANSWER FACTS that are themselves wrong or self-contradictory

This is the highest-value finding in this slice: **two cards contradict their own printed QUESTION
line**, and the false claim then propagates into several Vidi replies as stated fact.

**`ts_ipe_c2_ck_activation_energy`** — the QUESTION reads:

> QUESTION: Explain the term activation energy of a reaction with a suitable diagram.

Yet the same block's INSIDER POINT says: *"Two marks sit entirely on the words, because the question
does not say draw."* And step `s3_endothermic_profile`'s NOTE repeats: *"The question does not say
draw, so this earns no marks."* Step `s4_exothermic_profile`'s NOTE repeats it again. The question,
printed two lines above, explicitly says "with a suitable diagram" — the INSIDER POINT and both NOTEs
assert the opposite of what is right there in the same card. This false premise is then repeated
verbatim as fact by Vidi's `[marks]`, `[skiplast]`, `[whystep]` (on `s3_endothermic_profile`),
`[explain]`, and `[telugu]` replies — every reply that touches the diagram inherits it.

**`ts_ipe_c2_ck_catalyst_effect_on_rate`** — same defect, same pattern. QUESTION reads:

> QUESTION: Discuss the effect of catalyst on the kinetics of chemical reaction with diagram.

Step `s5_diagram`'s NOTE says: *"The question does not say draw, so this earns no marks."* Again the
question text two lines above literally contains "with diagram." This propagates into Vidi's
`[marks]` ("*The diagram is not marked because the question does not ask for one*") and `[skiplast]`
("*The diagram is not required since the question does not say 'draw'*") replies.

Both cards were graded as though the replies faithfully reflect their given ANSWER FACTS (score 3
for those templates) — the replies are not at fault for repeating what the bank told them — but the
underlying bank text is internally inconsistent on these two cards and should be fixed at the source
(either drop the "with diagram"/"with a suitable diagram" wording from the QUESTION, or drop the
"question does not say draw" claim from the INSIDER POINT/NOTEs and mark the diagram appropriately).

No other equation-balance, mark-split-arithmetic, or WHY/NOTE-contradicts-MARK-SPLIT defects were
found in this slice; all 25 mark splits sum correctly to their stated section marks, and the drawn
chemical structures/equations checked (bithionol, chloramphenicol, saccharin, serotonin, N₂O₅
decomposition, ethene hydrogenation, NH₄NO₂ decomposition, 2HI, 2NO+O₂, ethyl acetate hydrolysis) are
internally consistent and balanced.
