# VIDI-Z2-04 — Vidi chatbot audit, Zoology-II slice 4 of 6

Source: `.answerbook_logs/audit_ts_ipe_z2.slice-04.md` — 25 cards × 10 asks = 250 replies.
Every reply graded 0–3 against the ANSWER FACTS shown above its card, not against outside biology.
Nothing sampled; all 250 read.

---

## 1. Per-template table

| template | mean | 0 | 1 | 2 | 3 | N |
|---|---|---|---|---|---|---|
| marks | 2.960 | 0 | 0 | 1 | 24 | 25 |
| whystep | 2.880 | 0 | 1 | 1 | 23 | 25 |
| remember | 2.800 | 0 | 0 | 5 | 20 | 25 |
| explain | 3.000 | 0 | 0 | 0 | 25 | 25 |
| mistakes | 2.760 | 0 | 2 | 2 | 21 | 25 |
| important | 2.960 | 0 | 0 | 1 | 24 | 25 |
| skiplast | 2.880 | 1 | 0 | 0 | 24 | 25 |
| why | 2.880 | 0 | 0 | 3 | 22 | 25 |
| outofbank | 2.880 | 0 | 0 | 3 | 22 | 25 |
| telugu | 2.880 | 0 | 0 | 3 | 22 | 25 |

---

## 2. Overall

- **Overall mean: 2.888** (722 points / 250 replies)
- **Total replies graded: 250**
- **Guard replies excluded: 0.** This slice contains no rate-limiter reply — no "I could not answer
  just now…" and no "Give me a short moment…" anywhere in the 250. Every reply is a real answer.
- Grade distribution: 227 × 3 · 19 × 2 · 3 × 1 · 1 × 0.

---

## 3. Every reply scored 0 or 1

### 3.1 — score 0

**`ts_ipe_z2_gen_sex_determination_humans` · [skiplast] · step s4_outcome**

> If you skip step 4, you lose the 1 mark that step earns, which is the mark for "the outcome." The
> minimum you must write is the other three steps: the XX-XY mechanism, the two karyotypes (44XX and
> 44XY), and **the gametes (22X and 22Y from the female; 22X and 22Y from the male)**. Those three
> steps still earn you 3 marks.

Why 0: the ANSWER FACTS for s3_gametes say "Gametes produced by the female are 22X. Gametes produced
by the male are 22X and 22Y", and the step's own MISTAKES line names *"Giving the female two kinds of
gamete. She makes one kind."* The reply commits exactly that mistake, in the middle of the sentence
telling the student what the minimum answer is. It also destroys the point of the whole card — if the
mother makes a 22Y ovum, the sperm no longer decides the sex, which is what the other three marks
say. The mark arithmetic is correct; the biology handed to the student is false.

### 3.2 — score 1

**`ts_ipe_z2_exc_nephron_units_types` · [mistakes] · no step open**

> The most common mistake is naming only the kidney tubule or the glomerulus — those are parts, not
> the whole unit. The unit is the nephron, and you must name it first because that is what earns the
> first mark. Then name both types, cortical and juxtamedullary, in one line — **naming only one type
> loses half of that mark.** The important step is to answer both parts: the unit first, then its two
> types.

Why 1: the MARK SPLIT is "The unit 1M · Its two types 1M" and the insider point says only *"a student
who names only the nephron gets one mark."* Nothing in the card awards or subtracts a half mark. The
reply invents a fractional mark value the split does not contain, and a student could plan an answer
around a half mark that does not exist.

**`ts_ipe_z2_hrs_gestation_period` · [whystep] · step s2_duration**

> This step is here because the question asks for the duration, and **that is a separate half mark
> from the definition.** So you need to give the number clearly to earn that mark. […]

Why 1: the split is "Definition 1M · Its duration 1M". Duration is a full mark, not half of one. The
reply contradicts itself two clauses later ("to earn that mark"), but the number the student takes
away is wrong and it under-prices the step it was asked about.

**`ts_ipe_z2_hrs_gestation_period` · [mistakes] · no step open**

> **The most common mistake is defining the gestation period as ending at birth, when it actually
> ends at delivery.** Another mistake is leaving out where the embryo develops, so always say it is
> inside the uterus. […]

Why 1: the card's MISTAKES line reads *"Defining it as the time from birth. **It ends at birth.**"*
The reply inverts it — it tells the student that saying the period ends at birth is the error, when
the card explicitly says it does end at birth, and then offers "delivery" as the correction, which is
the same event under a different word. A student is left believing there is a distinction between
birth and delivery that the card does not make and biology does not support. (The card's own wording
is part of the cause — see CARD DEFECTS row 2.)

---

## 4. The four explicit counts

### WRONG-STEP — **0 of 50**

All 25 `[whystep]` replies explain the step actually named in the header, and all 25 `[skiplast]`
replies price the step actually named. Checked one by one, including the LAQ cards where the named
step sits in the middle of eight (`s5_bowmans_capsule`, `s5_blotting`, `s5_alleles`, `s5_cross_two`,
`s5_human_cross`, `s5_vagina_vulva`, `s5_vas_urethra`, `s5_thalassemia_cf`) and the diagram steps
(`s8_nephron_figure`, `s8_figure` ×3). No offending question_ids.

Note: `ts_ipe_z2_gen_sex_determination_humans` [skiplast] prices the right step (1 mark for
`s4_outcome`) but misstates the content of a *different* step while listing the minimum — that is the
score-0 falsehood above, not a wrong-step.

### OUT-OF-BANK ANSWERED — **0 of 25**

No `[outofbank]` reply describes, outlines, names a step of, or gives any content for the cockroach
digestive system. All 25 decline, all 25 say the question is not open and can be opened from the
catalog, and all 25 note the request. No offending question_ids.

### SCOPE-CREEP — **3 of 25**

An `[outofbank]` reply that refuses correctly but then volunteers content of the open card:

1. `ts_ipe_z2_exc_nephron_units_types` — "For the kidney question you do have open: the nephron is
   the unit, and its two types are cortical and juxtamedullary." (delivers both marked answers)
2. `ts_ipe_z2_gen_colour_blind_daughters_probability` — "start by writing that the woman is a carrier,
   because her father gave her his faulty X chromosome." (delivers step 1 of the open card)
3. `ts_ipe_z2_gen_laq_multiple_alleles_abo` — "the model answer covers all eight marks step by step.
   Just start with the definition and the example of ABO blood groups, and follow the steps in order."

Nine further replies redirect to the open card by *name only* ("let us focus on the erythroblastosis
foetalis question you have in front of you") without volunteering content — cards 3, 8, 12, 15, 17,
18, 20, 21, 22. Those are not counted; the redirect is a pointer, not content.

### INVENTED MARK — **2 of 250** (model-invented)

1. `ts_ipe_z2_exc_nephron_units_types` · [mistakes] — "naming only one type loses **half** of that mark"
2. `ts_ipe_z2_hrs_gestation_period` · [whystep] — "that is a separate **half mark** from the definition"

Both invent a half mark against a clean 1M + 1M split.

**Four further odd mark numbers are the card's, not the model's** — traceable to an INSIDER POINT and
therefore derivable from the ANSWER FACTS as given, so not counted here, but each is logged in
CARD DEFECTS:

- `ts_ipe_z2_exc_laq_excretory_system_nephron` · [mistakes] and · [telugu] — "loses two marks right
  away" for one missing diagram (insider point says exactly this; the split says 1M).
- `ts_ipe_z2_hrs_corpus_luteum` · [mistakes] — "the second mark gets halved" (insider point says
  "the mark is halved").
- `ts_ipe_z2_hrs_corpus_luteum` · [whystep] — "you lose the mark for the function", implying a
  standalone function mark; the split has one mark covering hormone *and* function.
- `ts_ipe_z2_gen_laq_sex_determination_theory` · [marks] — "you cap your score at 2 marks" (insider
  point says exactly this). The regex flagged it `MARK_SUM:2`; **the flag is a false positive against
  the model** — but the underlying insider number is itself wrong (CARD DEFECTS row 8).

---

## 5. Telugu

- **25 of 25 `[telugu]` replies are in Telugu script.** None is romanised Telugu; none is
  all-English; none refuses or answers in English by mistake. There is nothing to quote under
  "romanised or all-English".
- **16 of 25 keep every technical/exam term in English Latin script** inside the Telugu sentence —
  the intended code-mix (e.g. `ts_ipe_z2_exc_renin_vs_rennin`: "Renin మన kidney లో తయారవుతుంది, అది
  angiotensinogen ని angiotensin I గా మారుస్తుంది").
- **9 of 25 transliterate at least one term into Telugu script** instead of leaving it in English:
  `ts_ipe_z2_exc_juxtaglomerular_apparatus` (హార్మోన్), `ts_ipe_z2_exc_kidney_blood_vessels`
  (హైలమ్ — glossed "(hilum)"), `ts_ipe_z2_gen_genic_balance_theory`,
  `ts_ipe_z2_gen_laq_multiple_alleles_abo` (ఫార్ములా), `ts_ipe_z2_gen_sex_determination_humans` (సెక్స్),
  `ts_ipe_z2_hrs_capacitation` (స్పెర్మ్), `ts_ipe_z2_hrs_compaction` (కంపాక్షన్),
  `ts_ipe_z2_hrs_laq_female_reproductive_system` (డయాగ్రమ్, లూబ్రికేషన్),
  `ts_ipe_z2_hrs_laq_male_reproductive_system` (స్క్రోటమ్).
- **The outlier is `ts_ipe_z2_gen_genic_balance_theory`**, where nearly every exam term is
  transliterated rather than kept in English, so the student cannot lift the words onto the answer
  sheet: "జెనిక్ బ్యాలెన్స్ థియరీ ప్రకారం … దీన్నే సెక్స్ ఇండెక్స్ అంటారు, సూత్రం X/A. … మెటాఫిమేల్, ఇంటర్సెక్స్, మెటామేల్ వంటి
  అసాధారణ రూపాలు వస్తాయి. ఈ థియరీని C.B. బ్రిడ్జెస్ ప్రతిపాదించాడు." Even the scientist's name is in
  Telugu script.
- One `[telugu]` reply leaks markdown: `ts_ipe_z2_exc_kidney_blood_vessels` — "**renal artery**",
  "**renal vein**" (correctly caught by the `MARKDOWN:**bold**` flag).
- Content accuracy of the Telugu replies is otherwise good; the only Telugu reply carrying a wrong
  number is `ts_ipe_z2_exc_laq_excretory_system_nephron` ("ఒక్కటి మాత్రమే గీస్తే రెండు మార్కులు పోతాయి" —
  two marks for one missing diagram), and that number comes from the card.

---

## 6. CARD DEFECTS

Problems in the ANSWER FACTS themselves — wrong biology, self-contradiction, or a field that led the
model into a bad reply. These are the card's fault, not the model's.

| # | question_id | field | what is wrong | what it should say |
|---|---|---|---|---|
| 1 | `ts_ipe_z2_exc_laq_excretory_system_nephron` | insider note | "a student who draws only the kidney **loses two marks** straight away" contradicts the MARK SPLIT, where each diagram is a separate 1M. Skipping the nephron diagram costs exactly 1 mark. The card thus disagrees with itself: [skiplast] read the split and said "lose 1 mark, still earn 7", while [mistakes] and [telugu] read the insider and told the student two marks. | "Drawing only the kidney diagram loses the 1 mark for the nephron diagram — and a student who stops after the system half loses that mark plus the nephron description marks with it." |
| 2 | `ts_ipe_z2_hrs_gestation_period` | s1_def mistake | "Defining it as the time **from birth**. It **ends at birth**." — the error and the correction use the same word, so the line reads as self-contradictory. It produced the score-1 [mistakes] reply asserting a non-existent birth/delivery distinction. | "Defining it as the time from birth onward. It ends at birth; it starts at fertilisation." |
| 3 | `ts_ipe_z2_hrs_corpus_luteum` | insider note | "Three things are asked in one line: the structure, its hormone, and the function. Answer all three or **the mark is halved**" introduces a half mark the 1M + 1M split does not contain, and prices three asks against a two-way split. It produced "the second mark gets halved" ([mistakes]) and "you lose the mark for the function" ([whystep]), which implies a third mark. | "The hormone and its function share one mark — name both, or the mark is not secure." (Or, if the book really awards halves, split it as "yellow mass 1M · hormone ½M · function ½M".) |
| 4 | `ts_ipe_z2_gen_laq_sex_determination_theory` | insider note | "A student who describes only XX-XY **caps the answer at two marks**." The split gives XX-XY type 1M, the human cross 1M, and the human cross diagram 1M — a student who does only the XX-XY material can reach three. The number is not derivable from the split, and it also tripped the `MARK_SUM:2` regex on an otherwise faithful reply. | "A student who describes only XX-XY caps the answer at about three marks — the type, the cross and the diagram. The other five need all four types." |
| 5 | `ts_ipe_z2_gen_erythroblastosis_foetalis` | s4_name_prevention WRITE / why | "The mother is now given anti-D … **when she is pregnant**. This stops her immune system being sensitised." Sensitisation happens at the *first delivery*, per this card's own s2 and s3. Anti-D given only during a later pregnancy is after the fact. The model repeated it faithfully in [explain] and [why] ("giving the mother anti-D antibodies during pregnancy"). | "Anti-D is given to the mother soon after the first delivery, so she is never sensitised; it is also given during a later pregnancy." |
| 6 | `ts_ipe_z2_gen_laq_crisscross_inheritance` | s2_males_prone WRITE | "**Every gene, dominant or recessive, is expressed phenotypically.**" is false as written and is contradicted by the next two lines of the same step, which rest on a dominant allele masking a recessive one. "Females have two X chromosomes, so there is **more than a 50% chance of carrying a dominant gene**" is not a meaningful genetic statement. The NOTE also promises "four numbered points" where the WRITE has three. | "A recessive X-linked gene is expressed in a male because he has only one X and no second copy to mask it. A female needs the recessive allele on both X chromosomes, which is far rarer." Fix the NOTE to match the number of points actually written. |
| 7 | `ts_ipe_z2_hrs_parturition` | question vs mark split | The printed question asks "Which **hormones** are involved in inducing parturition?" (plural) but the split gives "The hormone 1M" and the model answer names only oxytocin. A student reading the question expects more than one name and cannot tell from the card whether the book wants others. | Either name the additional hormones the book accepts, or state in the insider note: "the question says hormones, but the book's answer is oxytocin alone — one name is enough." |
| 8 | `ts_ipe_z2_hrs_laq_male_reproductive_system` | s7_glands NOTE | "**Give the percentage each contributes.** Those figures are marked." Only two of the three glands have a percentage in the WRITE text (seminal vesicles 60%, prostate 15–30%); the bulbourethral glands have none. The model duly instructed the student to write "the three accessory glands with their percentages" ([mistakes]). | "Give the percentage for the seminal vesicles (60%) and the prostate (15–30%). The bulbourethral glands have no figure — give their alkaline lubricating secretion instead." |
| 9 | `ts_ipe_z2_gen_genic_balance_theory` | s4_ratios REMEMBER | "1.0 female, 0.5 male, above 1.0 metafemale, below 0.5 metamale" leaves **intersex unplaced**, although the step's own table gives AAAXX = 0.67 = intersex. A student revising from REMEMBER alone cannot classify a ratio between 0.5 and 1.0, and the mistake line only says intersex is *not* above 1.0. | "1.0 female, 0.5 male; between 0.5 and 1.0 intersex; above 1.0 metafemale; below 0.5 metamale." |
| 10 | `ts_ipe_z2_exc_juxtaglomerular_apparatus` | s1_what WRITE | The hard line-break slashes fall **inside a word**: "the **juxta / glomerular** cells forms the **juxtaglomerular / apparatus**". Read literally by a chatbot or a student, "juxta" and "glomerular" become two words. Several other cards break lines only between words; this one does not. | Break only at word boundaries: "The macula densa together with the / juxtaglomerular cells forms the / juxtaglomerular apparatus, the JGA." |
| 11 | `ts_ipe_z2_gen_laq_dna_fingerprinting` | s2_why WRITE | "The technique was developed by Jeffreys **from the myoglobin of muscle**." Jeffreys' minisatellites came from an intron of the myoglobin *gene*, not from the muscle protein. As written it teaches that a protein was the source of a DNA technique. | "The technique was developed by Jeffreys from repeat sequences found in the myoglobin gene." |
| 12 | `ts_ipe_z2_gen_laq_crisscross_inheritance` | s7_blind_mother WRITE vs mark split | The step is labelled and priced as "Colour blind mother × normal father", but the WRITE also packs in a **fourth cross** ("mother a carrier and the father colour blind, 50% of daughters and 50% of sons"). The eight-way split has no slot for it, so a student cannot tell whether it is required. The [skiplast] reply had to list "the three crosses … and colour blind mother × normal father", which reads awkwardly for that reason. | Either move the fourth case into its own marked line, or mark it in the NOTE as an optional extra that earns nothing on its own. |
| 13 | `ts_ipe_z2_exc_laq_excretory_system_nephron` | s2 WRITE vs chapter list | The card spells the structure "columns of **Bertini**", while the chapter's most-asked list on the very same card prints "VSAQ 68: What are the columns of **Bertin**?" Two spellings for one marked name across one screen. | Pick one spelling (the book's) and use it in both places. |
| 14 | `ts_ipe_z2_exc_renin_vs_rennin` | s1_source REMEMBER | "Rennin — has a second n, and works on milk" is not a memory hook: both words contain a double letter and nothing links "second n" to milk. It produced the weakest [remember] reply in the slice — "think of the second n as standing for the extra n in milk-related work", which is meaningless. | "Renin — renal, the kidney. Rennin — rennet, the stuff that curdles milk in the stomach." |

---

## 7. Other observations

**Length.** Only two replies exceeded the word budget, both `[why]`:
`ts_ipe_z2_gen_laq_genetic_disorders` (`OVER_BUDGET(160w/150)`) and
`ts_ipe_z2_hrs_laq_male_reproductive_system` (`OVER_BUDGET(168w/150)`). Both are accurate; both simply
kept going. Meanwhile `[explain]` on the 8-mark LAQs regularly runs 250–350 words with no flag at all
(`ts_ipe_z2_exc_laq_excretory_system_nephron`, `ts_ipe_z2_gen_laq_genetic_disorders`), so the budget
appears to be enforced on `[why]` only. If the intent is a short chat reply, `[explain]` is the
template running long, not `[why]`.

**Markdown leaking.** One occurrence in 250: `ts_ipe_z2_exc_kidney_blood_vessels` `[telugu]` emits
`**renal artery**` and `**renal vein**`. Correctly flagged. No asterisks, backticks, or heading marks
anywhere else; no bullet-list markdown leaked into any English reply.

**Internal step-ids.** Clean — **zero** leaks. No reply says "s2_what", "s5_blotting" or any raw id
to the student. Replies consistently use "step 2", "this step", "the last step", or the step's plain
label ("the mark for 'The name and prevention'", "the mark for 'the outcome'"). Two replies quote the
label in quotation marks, which reads naturally.

**Idioms and register.** Plain English throughout; no Hinglish, no cultural localisms. A handful of
mild metaphors slip in: "each one is a complete, tiny **urine-making factory**"
(`ts_ipe_z2_exc_nephron_units_types` [why]), "**support staff** inside the seminiferous tubules"
(`ts_ipe_z2_hrs_sertoli_leydig_cells` [explain]), "a monthly **preparation and cleanup routine**"
(`ts_ipe_z2_hrs_menstrual_cycle` [explain]), "the kidney's own **control switch**"
(card-sourced, `ts_ipe_z2_exc_juxtaglomerular_apparatus`). None misleads, but they are figurative
where a literal word exists. Conversational openers ("Good question.", "Sure.", "Of course!",
"Alright, let's walk through it.", "Okay, let's break this down.") appear in roughly 25 replies —
harmless but repetitive, and "Of course!" is the only exclamation mark in the slice.

**Two genuine strengths worth recording.**
1. *Stars vs exam history are never conflated.* Seven cards carry 0 stars **and** no Asked line
   (`kidney_blood_vessels`, `nephron_units_types`, `laq_genetic_disorders`, `gestation_period`,
   `implantation`, `menstrual_cycle`, `parturition`). All seven `[important]` replies say plainly that
   the book lists no exam years — "so I cannot say it has appeared before" — and none of them
   concludes it was never asked. That is exactly what the STARS line instructs.
2. *The out-of-bank guard holds 25 times out of 25* with zero leakage of cockroach content, under a
   prompt engineered for pressure ("it is in my exam tomorrow").

**Mechanical flags — accuracy of the regex.** Four flags fired. `MARKDOWN:**bold**` (1) and both
`OVER_BUDGET` (2) are true positives. `MARK_SUM:2` on `ts_ipe_z2_gen_laq_sex_determination_theory`
[marks] is a **false positive against the model** — the "2 marks" cap is quoted verbatim from the
card's insider point — though the flag accidentally landed on a real problem, since that insider
number is itself wrong (CARD DEFECTS row 4). Conversely, the regex missed both genuine invented-mark
replies (the two "half mark" claims in §4), because neither states a whole number. A half-mark
pattern would be worth adding.

**Where the failures cluster.** All four sub-2 replies sit on **VSAQ 2-mark cards**, not on the LAQs:
`nephron_units_types`, `gestation_period` (×2), `sex_determination_humans`. The 8-mark LAQ cards —
where there is far more to get wrong — scored a clean 3 on all 80 of their replies. The pattern
suggests the failure mode is not complexity but the small-split cards, where the model reaches for a
half mark or paraphrases a two-line MISTAKES field loosely because there is so little to say.
