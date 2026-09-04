# VIDI-B2-05 — blind grading read, Botany-II slice 5 of 7

Source: `.answerbook_logs/audit_ts_ipe_b2.slice-05.md` — 24 cards × 10 asks = 240 replies.
Every reply graded 0–3 against the ANSWER FACTS printed above its card, never against
independent biology. Nothing sampled; all 240 read.

---

## 1 — Per-template table

| template | mean | 0 | 1 | 2 | 3 | N |
|---|---|---|---|---|---|---|
| marks | 2.958 | 0 | 0 | 1 | 23 | 24 |
| whystep | 3.000 | 0 | 0 | 0 | 24 | 24 |
| remember | 2.958 | 0 | 0 | 1 | 23 | 24 |
| explain | 2.917 | 0 | 1 | 0 | 23 | 24 |
| mistakes | 2.958 | 0 | 0 | 1 | 23 | 24 |
| important | 2.750 | 1 | 1 | 1 | 21 | 24 |
| skiplast | 3.000 | 0 | 0 | 0 | 24 | 24 |
| why | 3.000 | 0 | 0 | 0 | 24 | 24 |
| outofbank | 2.917 | 0 | 0 | 2 | 22 | 24 |
| telugu | 2.958 | 0 | 0 | 1 | 23 | 24 |

---

## 2 — Overall

- **Overall mean: 2.942** (706 points / 240 replies, 3 dp)
- **Total replies graded: 240**
- **Guard replies: 0** — no "I could not answer just now…" / "Give me a short moment…" appears
  anywhere in the slice, so nothing was excluded. The rate limiter did not fire on this slice.
- Grade spread: 0 × 1 · 1 × 2 · 2 × 7 · 3 × 230.

---

## 3 — Every reply scored 0 or 1

### `ts_ipe_b2_piv_law_of_dominance` · [important] · **0**

> "Yes, this question is important for the exam. The book gives it 3 stars, meaning it is asked
> very often. It has appeared in AP board exams in 2019, 2017, and 2015. So you should definitely
> prepare it well."

The card states `STARS: 0 of 3`. The model invented a 3-star rating and then explained what
3 stars means. This is the one outright fabricated fact in the slice, and it is the exact field
the STARS line spends four sentences guarding ("report each only from the line that states it").
The invented star also flips the recommendation the student acts on.

### `ts_ipe_b2_ph_c3_acceptor_and_first_product` · [important] · **1**

> "Yes, this question is asked often enough that the book gives it no star, but it did appear in
> AP 2022, 2019, and 2018. So it has come in previous exams, but the book does not rank it as very
> frequent."

The opening clause asserts that being asked often is *why* the book gives no star — the inverse
of what `STARS: 0 of 3` means, and precisely the frequency/history conflation the card forbids.
The closing sentence contradicts the opening one, so the reply is self-contradictory as well as
wrong; a student can take away "0 stars = asked often."

### `ts_ipe_b2_ph_chloroplast_diagram` · [explain] · **1**

> "The important step is that every label earns a mark. Your six main labels are outer membrane,
> inner membrane, grana, stromal lamella, stroma, and ribosomes."

The MARK SPLIT prices labels as **"All labels correct 1M"** — one mark for the whole label set in
a 4-mark question. "Every label earns a mark" misprices the answer by a factor of six and, read
literally, would have a student believe six labels alone beat the 4-mark ceiling. The same reply
correctly says the book gives four marks for the figure, which makes the sentence internally
inconsistent too.

---

## 4 — The four explicit counts

**WRONG-STEP — 0 of 48.** All 24 `[whystep]` and all 24 `[skiplast]` replies addressed and priced
the step actually named in the ask. Spot-verified against the step id in every heading, including
the six 0-mark diagram/checklist steps (`ts_ipe_b2_ph_calvin_cycle` s5_diagram,
`ts_ipe_b2_ph_chloroplast_diagram` s2_checklist, `ts_ipe_b2_piv_codominance` s5_diagram,
`ts_ipe_b2_piv_incomplete_dominance` s5_diagram, `ts_ipe_b2_piv_law_of_dominance` s5_diagram,
`ts_ipe_b2_piv_segregation_and_assortment` s5_diagram), each of which was correctly priced at
0 marks with the correct written-step minimum. Clean.

**OUT-OF-BANK ANSWERED — 0 of 24.** No `[outofbank]` reply gave the stages of mitosis, named a
mitotic phase, or sketched the answer. All 24 declined and pointed at the catalog.

**SCOPE-CREEP — 3 of 24.**
- `ts_ipe_b2_ph_photorespiration` — the substantive one: "For photorespiration, you're ready to
  start — just begin with RuBisCO binding both CO2 and oxygen." That is step s1's content handed
  over inside the refusal.
- `ts_ipe_b2_piv_phenotype_and_genotype` — "For tomorrow, focus on the answer you have here:
  phenotype and genotype, each with a definition and an example." Volunteers the open card's
  answer shape.
- `ts_ipe_b2_piv_phenotypic_ratios` — "For each cross, write the offspring genotypes, then convert
  them to the ratio." Volunteers the open card's method.

Three further replies (`ts_ipe_b2_ph_c3_vs_c4`, `ts_ipe_b2_ph_c4_acceptor_and_first_product`,
`ts_ipe_b2_ph_photolysis_of_water`) name the open question and its mark value ("a clean 4-mark
question", "a quick 2-marker") but give no content; not counted.

**INVENTED MARK — 0 of 240.** Every mark number spoken in the slice is derivable from its card's
MARK SPLIT: the 1M+1M VSAQs, the four 1M SAQ blocks, the 0M diagram/checklist steps, the 4M
single-step chloroplast drawing, and the "half a mark each" in `ts_ipe_b2_piv_phenotypic_ratios`
(from its INSIDER POINT "Four ratios, half a mark each"). The one fabricated *number* in the slice
is a **star** rating, not a mark — `ts_ipe_b2_piv_law_of_dominance` [important], listed in §3.

---

## 5 — Telugu

All **24 of 24** `[telugu]` replies are in Telugu script. None is romanised Telugu; none is
all-English. Nothing to quote under either failure mode.

**22 of 24** keep the biology terms in Latin/English inside the Telugu sentence, which is the
intended code-mix (e.g. `ts_ipe_b2_ph_photorespiration`: "…RuBisCO. దాని active site రెండు
వాయువులను bind చేయగలదు — CO₂ మరియు O₂ రెండింటినీ, కానీ CO₂ పట్ల దానికి ఎక్కువ affinity ఉంటుంది.").

**2 of 24 transliterate the technical vocabulary into Telugu script instead of keeping it in
English** — still Telugu script, so not a romanisation failure, but off-convention and harder to
map back to the written exam answer:

- `ts_ipe_b2_ph_photolysis_of_water` — "ఫోటోలైసిస్ ఆఫ్ వాటర్ అంటే నీటి విచ్ఛిన్నం. ఇది
  క్లోరోప్లాస్ట్ లోని గ్రానా లో జరుగుతుంది, అది కూడా లైట్ రియాక్షన్ సమయంలో మాత్రమే… ఎలక్ట్రాన్లను
  మరియు ప్రోటాన్లను కూడా సరఫరా చేస్తుంది." Every term — photolysis, chloroplast, grana, light
  reaction, oxygen, electrons, protons — is transliterated; not one is left in English.
- `ts_ipe_b2_piv_chromosomal_and_gene_mutations` — "మ్యుటేషన్ … క్రోమోజోమల్ మ్యుటేషన్ … జీన్
  మ్యుటేషన్ అంటే DNA లో ఒకే ఒక్క బేస్ పెయిర్ మారడం … తేడా స్కేల్ మాత్రమే." Only "DNA" survives in
  Latin; mutation, chromosomal, gene, base pair and scale are all transliterated.

One presentation defect: `ts_ipe_b2_ph_c4_acceptor_and_first_product` [telugu] leaks raw markdown
into the spoken text — "**PEP**", "**PEP carboxylase**", "**OAA**" — the only mechanically flagged
reply in the slice (`MARKDOWN:**bold**`), and the only [telugu] scored 2.

---

## 6 — CARD DEFECTS

The card's fault, not the model's. Ordered by how much a student loses.

| question_id | field | what is wrong | what it should say |
|---|---|---|---|
| **all 24 cards** | STARS | Every card in the slice reads `STARS: 0 of 3`, including questions the same card records as asked in five and six past papers (`piv_chromosome_theory` TS 2022, 2020 · AP 2022, 2019, 2017; `piv_phenotype_and_genotype` TS 2022, 2018, 2017 · AP 2019, 2017, 2016; `piv_incomplete_dominance` TS 2019, 2018, 2017, 2015). 24/24 at zero is a field that was never populated for Botany-II, not a book that starred nothing. Every `[important]` reply therefore tells the student "the book does not rank it as frequently asked" — a claim about the source book that is probably false, repeated 24 times. It is also what the one 0-grade reply was reaching around. | Populate the star rank from the source book, or drop the STARS line for Botany-II and let `[important]` speak only from the Asked line. Do not ship a default of 0 that reads as a positive statement about the book. |
| `ts_ipe_b2_ph_calvin_cycle` | s3_reduction WRITE / s4_regeneration WRITE | Arithmetic contradiction inside one card. s3 ends "Fixing ONE CO2 needs 3 ATP and 2 NADPH", then s4 says regeneration "needs ONE more ATP" and its MISTAKES insists "Regeneration costs one more ATP per RuBP." Read in order that totals **4 ATP per CO2**, and contradicts `ts_ipe_b2_ph_atp_nadph_per_co2`, whose whole answer is 3 ATP. The 3rd ATP *is* the regeneration ATP (12 ATP in reduction + 6 in regeneration = 18 ATP for 6 CO2 = 3 each); the card mislocates the whole-cycle total inside the reduction step. | Move the ratio line out of s3: reduction costs 2 ATP + 2 NADPH per CO2, regeneration 1 more ATP, "so the cycle spends 3 ATP and 2 NADPH per CO2 in total." |
| `ts_ipe_b2_piv_dominant_recessive_homozygous` | s4_heterozygous MISTAKES | "Saying a heterozygote shows both characters. It shows the DOMINANT one only." Stated as an absolute, this is false for two other cards in the same chapter of the same paper: in `piv_codominance` the heterozygote CˢCᴰ shows **both** characters, and in `piv_incomplete_dominance` Rr shows **neither** parent's character. The model repeated the absolute verbatim in this card's `[mistakes]` reply, so the student is taught a rule the next card contradicts. | "Under complete dominance a heterozygote shows the dominant character only — but under co-dominance it shows both, and under incomplete dominance it shows an intermediate." |
| `ts_ipe_b2_ph_c3_vs_c4` | s1–s4 WRITE (row numbering) vs INSIDER POINT / NOTE | The question asks for **eight** differences and the INSIDER POINT and s4 NOTE both say "Eight numbered rows is the target." The model answer's own rows are numbered **1 to 9** (1–2 in s1, 3–4 in s2, 5–6 in s3, 7–8–9 in s4). A student copying the card writes nine rows under a heading that told them eight. | Cut or merge one row so the WRITE text ends at 9 → 8, or change the target wording to "eight or more, numbered". |
| `ts_ipe_b2_piv_pea_plant_advantages` | INSIDER POINT vs s1–s4 WRITE (reason numbering) | Same class of defect: INSIDER POINT says "**Seven** reasons in the book, four marks on the paper", while the WRITE text numbers **nine** reasons (1 in s1, 2–4 in s2, 5–7 in s3, 8–9 in s4). s4 MISTAKES then sets a floor of "fewer than six reasons in total", a third number. Three different counts in one card. | Fix on one count — nine numbered reasons, four mark blocks, minimum six — and make the INSIDER POINT and the MISTAKES floor agree with the numbering in the WRITE text. |
| `ts_ipe_b2_ph_chloroplast_diagram` | MARK SPLIT vs step pricing | The MARK SPLIT enumerates four separate components (outline 1M · grana and lamellae 1M · stroma 1M · all labels 1M) but the step list collapses all of it into a single `s1_diagram — 4M`. There is no per-component price for a template to quote, and the INSIDER POINT ("The word 'labelled' is worth a full mark on its own. Six labels … turn a sketch into an answer") sits next to it. That combination produced the slice's only `[explain]` 1: "every label earns a mark." | Split s1 into the four components the MARK SPLIT already names, each at 1M, or state explicitly in the step that the six labels together earn one mark. |
| `ts_ipe_b2_piv_phenotypic_ratios` | s1_ab / s2_cd WRITE (ratio notation) | Parts (b) and (d) are written as "Phenotypic ratio **1 : 0**". A ratio with a zero term is not a ratio, and no board scheme prints one; an examiner expects "all dominant" or "100% dominant, no recessive". The card then reinforces it through MISTAKES ("Giving 1:1 for (b)"), so every reply in the group repeats 1:0 as if it were the marking answer. | "AA × aa → all offspring Aa, all show the dominant character (no phenotypic ratio — a single class)." Keep 1:0 only as an optional shorthand, not the stated answer. |
| `ts_ipe_b2_piv_law_of_dominance` | INSIDER POINT vs s3_law REMEMBER | INSIDER POINT: "The law has **FOUR** statements and the examiner is counting them." s3_law lists three and its REMEMBER says "Discrete, paired, one dominating: **three** statements"; the fourth lives in s4_explains numbered "4." A student reading the insider note looks for four statements inside step 3 and finds three. | Say it once: "the law is written as four numbered points — three in the statement, the fourth is what it explains (step 4)." |
| `ts_ipe_b2_piv_codominance` | MARK SPLIT label vs s2_example | The mark is labelled "**The lentil example** 1M", but the step's WRITE leads with ABO blood groups as "Example 1" and lentil as "Example 2", and its WHY, REMEMBER and NOTE all push the blood group as "the strongest" / "the clearest case in the whole of genetics". The label and the step disagree about which example the mark is for. | Either rename the mark "The example 1M" or make lentil Example 1 in the WRITE, so the marked example and the recommended example are the same one. |
| `ts_ipe_b2_piv_linked_genes` (also `piv_codominance` s4_f2 / s5_diagram) | MISTAKES | Source-book meta-commentary leaks into a student-facing field: "Leaving out the word 'together'. **The guide's own sentence drops it and reads as a fragment**"; "A 2 by 2 square gives 1:2:1, never 1:2:3. **The guide misprints this**"; "the square is what protects you from the wrong ratio **the guide prints**." MISTAKES is read as "mistakes students make", not "errata in the printed guide". No reply broke on it here, but the field is being used for two different jobs. | Keep MISTAKES to what the student does wrong ("writing 1:2:3 for the F2 — four boxes cannot give six offspring") and move the errata note to the insider/NOTE field. |

---

## 7 — Other observations

**Length.** Well controlled overall. `[why]`, `[remember]` and `[explain]` run 3–5 short paragraphs
where the card is 4-mark and 1–2 paragraphs where it is 2-mark, which is the right shape. The two
longest replies in the slice — `ts_ipe_b2_piv_law_of_dominance` [explain] and
`ts_ipe_b2_piv_pea_plant_advantages` [explain] — are both on 4-mark list questions and stay
readable. No reply was long enough to score down for padding on its own.

**Markdown leaking.** One instance, the only mechanical flag in the slice:
`ts_ipe_b2_ph_c4_acceptor_and_first_product` [telugu] renders "**PEP**", "**PEP carboxylase**",
"**OAA**". The other 239 replies are clean of asterisks, and the flag is a true positive.

**Internal step-ids spoken to the student.** Zero. No reply says "s2_what" or "s3_products". The
replies consistently translate the id into the human step name ("step 2, the numbers", "the
diagram step", "what a mutation is"). This is the cleanest dimension in the slice.

**Idioms / register.** Three metaphors reach the student, all mild and none misleading:
"Think of a chromosome as one bus" (`piv_linked_genes` [remember]), "the genes are the blueprint,
and the visible trait is the built result" (`piv_phenotype_and_genotype` [why]), and "one base pair
is like one letter in a long genetic code" (`piv_point_mutation_inheritance` [explain]). The
last two are standard teaching analogies; the bus one is invented but harmless. Nothing in the
register bin needs a fix.

**Leaked length instruction.** One reply speaks its own formatting rule aloud —
`ts_ipe_b2_ph_phloem_transports_food` [outofbank]: "**Two sentences is all I can give you here** —
if you want, tap back to this question and I will help you with it." The refusal itself is correct;
the sentence reads to a student as an arbitrary restriction rather than a boundary. Scored 2.

**Off-step drift on `[remember]`.** One case:
`ts_ipe_b2_piv_chromosomal_and_gene_mutations` [remember] opens on s1_what but teaches s4's scale
idea and the two examples, never touching the card's own s1 hook ("Sudden, heritable, and of two
sizes"). Nothing wrong is said; the open step's memory aid is simply not given. Scored 2.

**Non-plant content in a Botany paper.** Three cards route the student through human examples —
sickle cell anaemia (`piv_point_mutation_inheritance`, `piv_chromosomal_and_gene_mutations`) and
ABO blood groups (`piv_codominance`). The model handled the mismatch well each time: the
`[why]` replies on `piv_point_mutation_inheritance` and `piv_dominant_recessive_homozygous` both
open by naming the mismatch ("I think you are asking about the biology behind point mutation, not
about a plant. This question is about human genetics.") rather than inventing a plant story. That
is the right behaviour and worth keeping.

**Two `[explain]` replies describe gametes as "sex cells (like sperm and egg)"**
(`piv_segregation_and_assortment`). For a Botany-II paper, pollen and egg cell is the closer pair.
Not graded down — it is not wrong — but it is a small register slip toward the zoology framing.
