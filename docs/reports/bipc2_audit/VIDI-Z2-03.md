# VIDI-Z2-03 — blind grading, Zoology-II slice 3 of 6

Source: `.answerbook_logs/audit_ts_ipe_z2.slice-03.md` — 25 cards × 10 asks = 250 replies.
Chapters covered: Digestion and Absorption (9 cards), Endocrine System (12), Excretory Products
and their Elimination (4). Every reply graded against the ANSWER FACTS printed above its card,
not against outside biology.

---

## 1. Per-template table

| template | mean | 0 | 1 | 2 | 3 | N |
|---|---|---|---|---|---|---|
| marks | 2.840 | 0 | 0 | 4 | 21 | 25 |
| whystep | 2.960 | 0 | 0 | 1 | 24 | 25 |
| remember | 2.920 | 0 | 0 | 2 | 23 | 25 |
| explain | 3.000 | 0 | 0 | 0 | 25 | 25 |
| mistakes | 2.840 | 0 | 0 | 4 | 21 | 25 |
| important | 2.960 | 0 | 0 | 1 | 24 | 25 |
| skiplast | 3.000 | 0 | 0 | 0 | 25 | 25 |
| why | 2.960 | 0 | 0 | 1 | 24 | 25 |
| outofbank | 2.880 | 0 | 0 | 3 | 22 | 25 |
| telugu | 2.720 | 0 | 1 | 5 | 19 | 25 |

---

## 2. Overall

- **Overall mean: 2.908** (727 points / 250 replies)
- **Total replies graded: 250**
- **Guard replies excluded: 0** — no "I could not answer just now…" / "Give me a short moment…"
  reply appears anywhere in the slice. The rate limiter never fired.
- Grade distribution: 228 × 3 · 21 × 2 · 1 × 1 · 0 × 0.

The two templates that carry the exam contract — `skiplast` (what a skipped step costs) and
`explain` — are clean at 3.000 across all 25 cards. Every weak reply in the slice is either a
Telugu-rendering defect or a small over-claim about the card's own metadata.

---

## 3. Every reply scored 0 or 1

Zero replies scored 0. One reply scored 1.

**ts_ipe_z2_end_pituitary_secretions · [telugu]**

> సరే, సింపుల్ గా చెప్తాను. ఈ ప్రశ్నకు 4 మార్కులు వస్తాయి, మూడు భాగాలుగా రాయాలి.
>
> ముందు "master gland" అని రాసి, పిట్యూటరీ గ్రంధికి మూడు భాగాలు ఉన్నాయని చెప్పు — anterior
> pituitary, pars intermedia, posterior pituitary.
>
> తర్వాత anterior pituitary లోని ఆరు hormones ని రెండేసి చొప్పున రాయి: GH, LTH ఒక మార్కు; TSH,
> ACTH ఒక మార్కు; **FSH, LH ఒక మార్కు**. ప్రతి hormone పేరు పక్కన దాని పని ఒక లైనులో రాయడం ముఖ్యం
> — పేరు మాత్రమే కాదు, పనే మార్కులకు లెక్క.
>
> **చివరి మార్కుకు** pars intermedia (MSH) మరియు posterior pituitary (oxytocin, vasopressin)
> గురించి రాయి. ఈ ప్రశ్న TS 2022, 2019, 2017 లలో వచ్చింది, కాబట్టి బాగా సాధన చేయి.

Why 1: the ANSWER FACTS split is `The three parts 1M · GH and LTH 1M · TSH and ACTH 1M ·
FSH, LH and the posterior lobe 1M`. This reply hands the "three parts / master gland" line **no
mark at all**, gives FSH+LH a mark of their own, and then invents a **fourth, separate mark** for
pars intermedia + the posterior lobe. A student following it would drop the first marked point
(the one the card's own MISTAKES call out: "Leaving out the phrase master gland") and would price
the last mark against the wrong content. The English `[marks]` reply on the same card states the
split correctly, so this is a Telugu-path-only distortion.

---

## 4. The four explicit counts

**WRONG-STEP — 0 of 50.** All 25 `[whystep]` replies explain the step named in the header, and all
25 `[skiplast]` replies price the step named in the header, using the mark value the ANSWER FACTS
give it. The awkward case, `ts_ipe_z2_da_tooth_ls_diagram · [skiplast] s2_figure`, is correct: the
card prices `s1_regions` at 0M and `s2_figure` at 4M, so "you would not earn any marks" is what the
facts say (the card's split disagrees with itself — see defect 2, not the model's fault).

**OUT-OF-BANK ANSWERED — 0 of 25.** No `[outofbank]` reply describes, outlines, or names any part of
the cockroach digestive system. All 25 decline and point at the catalog.

**SCOPE-CREEP — 3 of 25:**
- `ts_ipe_z2_da_dental_formula` — declines, then "For now, let's finish the dental formula question
  in front of you — **write it as a fraction, upper jaw over lower, and expand what each digit
  means**."
- `ts_ipe_z2_da_liver_functions` — declines, then "focus on the liver question you have in front of
  you — **it's a 2-star question asked in TS 2020, 2019, and 2015**, so it's worth preparing well."
- `ts_ipe_z2_exc_gfr` — declines, then "For the question you do have open, **the GFR answer needs the
  definition first and the value 125 mL per minute second**."

(Six other `[outofbank]` replies redirect by *naming* the open card — "focus on the papillae question
in front of you" — without volunteering its content. Not counted.)

**INVENTED MARK — 2 of 250:**
- `ts_ipe_z2_end_androgens · [whystep] s2_cells` — "the question has **two separate 2-mark parts**,
  and each part earns one mark." The split is `What they are 1M · Which cells make them 1M`; there is
  no 2-mark part. Self-corrected in the same sentence ("full 2 marks"), so graded 2, not 0.
- `ts_ipe_z2_end_pituitary_secretions · [telugu]` — the mark reallocation quoted in §3.

Every other mark number in the slice (1M / 3 of 4 / "the whole 4 marks are in the diagram" / "half
the marks") is derivable from the printed split.

---

## 5. Telugu

**25 of 25 `[telugu]` replies are in Telugu script.** None is romanised Telugu; none is all-English.

**23 of 25 keep the exam-marking biology terms in Latin script** (emulsify, bile salts, lipase,
micelles, chylomicrons, Leydig cells, neurohypophysis, exophthalmic goitre, vasa recta, adenylate
cyclase, hyposecretion/hypersecretion, …) inside Telugu sentences — exactly the code-mix a student
needs to lift into an English answer book.

Two replies **transliterate the marking words into Telugu script instead of keeping them in
English**, which strands the student with words they cannot copy into the paper:

- `ts_ipe_z2_da_chyme` — "సరే, **చైమ్** అంటే కడుపులో ఏర్పడే **ఆమ్లంగా ఉండే పాక్షికంగా జీర్ణమైన
  ద్రవ** ఆహారం…" — the card's own two marking words (*chyme*, *acidic / semi digested*) are all in
  Telugu; only "gastric juice" survives in English (12 Latin characters in the whole reply).
- `ts_ipe_z2_exc_gfr` — "**గ్లోమెరులర్ ఫిల్ట్రేషన్ రేట్** అంటే రెండు **కిడ్నీలు** కలిపి ఒక నిమిషంలో
  ఎంత **ఫిల్ట్రేట్** తయారు చేస్తాయో అది." — GFR, kidney and filtrate transliterated; only the number
  "125 mL per minute" stays English (11 Latin characters).

Two further Telugu replies leak raw markdown to the student as literal asterisks (see §7), and one
is incomplete: `ts_ipe_z2_end_hormone_action_mechanism · [telugu]` covers steps 2–4 but silently
drops step 1 (hormones act on **target cells**), which is a full mark of the four.

---

## 6. CARD DEFECTS

| question_id | field | what is wrong | what it should say |
|---|---|---|---|
| ts_ipe_z2_da_tooth_ls_diagram | step s2_figure · NOTE | NOTE says "Label all **eight** parts" but the same step's label list names **eleven** (Crown · Neck · Root · Enamel · Dentine · Pulp cavity · Gum · Blood vessels · Nerve · Jaw bone · Periodontal membrane). Drove the `[marks]` and `[mistakes]` replies to say "Label all eight parts:" and then list eleven. | "Draw it large, one third of the page. Label all eleven parts." (or cut the list to the eight that actually carry marks) |
| ts_ipe_z2_da_tooth_ls_diagram | mark split vs step marks | The MARK SPLIT prices four 1M rows (crown/neck/root outline · enamel, dentine, pulp · blood vessels and nerve · gum, jaw bone and labels), but the steps price `s1_regions` at **0M** and put all **4M** on `s2_figure`. The `[skiplast]` reply therefore told the student the crown/neck/root step "earns 0 marks on its own", contradicting the split's first row. | Either price `s1_regions` at the split's first 1M, or state in the step that all four split rows live inside the figure and the written orientation line earns nothing. |
| ts_ipe_z2_exc_columns_of_bertin | step s1_what · NOTE | "One sentence carries both marks if it is complete" contradicts the MARK SPLIT (`What they are 1M · What they do 1M`) and s2's own MISTAKES ("Leaving out the pyramids. Separating them is the point"). It pushed the `[remember]` reply to tell the student "That one image carries **both marks**" — advice that would cost the second mark. | "One sentence names them. The second mark needs its own line saying they separate the renal pyramids." |
| ts_ipe_z2_end_pituitary_secretions | mark split row 1 vs step s1_parts · EARNS line | The split calls the first mark "**The three parts**"; the step's EARNS THE MARK FOR says "**Master gland**"; the step's MISTAKES treat both as marked. The ambiguity is what the `[telugu]` reply fell through — it dropped the first mark and invented a new one for pars intermedia + posterior lobe. | Make the two agree: "Master gland and its three parts 1M" in the split, same wording in the step's EARNS line. |
| ts_ipe_z2_da_salivary_glands | step s1_pairs · WHY | "They are named by where they **open into the mouth**" is wrong. They are named for where they **lie** — the parotid duct opens opposite the upper second molar, nowhere near the ear lobe the name refers to. | "They are named for where they lie, so the name and the place belong together." |
| ts_ipe_z2_end_antidiuretic_hormone | step s2_gland · NOTE vs WRITE | NOTE says "Give **both** names of the gland" but the WRITE line gives only one: "It is secreted by the neurohypophysis". A student copying the WRITE line follows the model answer and still fails the note. | WRITE: "It is secreted by the neurohypophysis, the posterior lobe of the pituitary." |
| ts_ipe_z2_end_thymus_gland | step s1_gland · WRITE vs the QUESTION | The question asks for the gland that "decreases in size **during adulthood**"; the model answer says "It degenerates **in old persons**" and never covers the adulthood half the question names. | "The thymus gland increases in size during childhood, is largest at puberty, and then shrinks through adulthood, degenerating in old age." |
| ts_ipe_z2_exc_glomerular_filtration | step s2_passive · WRITE | "This needs no energy: it is glomerular filtration" is a fragment whose second clause restates the term instead of stating the marked fact. The step is a whole mark and the student is told to copy this line verbatim. | "This process consumes no energy, so glomerular filtration is a passive process." |
| ts_ipe_z2_da_bile_no_enzymes (also ts_ipe_z2_da_butter_digestion_absorption) | step s1_emulsify · WRITE (and s2_bile_lipase · WRITE) | "bile salts emulsify fats into very small droplets **called micelles**" / "emulsify fats into very small **micelles**". Emulsification makes fat **droplets**; micelles are the later bile-salt carriers formed after lipolysis — which is how the butter card's own `s3_micelles` uses the word, for **absorption**. One word, two meanings, two steps apart. **Low priority: this is NCERT's own wording**, so it is safe for the board. | Keep the board wording but disambiguate: "…emulsify fats into very small droplets (the book calls these micelles)", and leave `s3_micelles` as the absorption-stage micelle. |

---

## 7. Other observations

**Length.** Mean words per reply: explain 128 (max 208) · mistakes 83 · why 83 · whystep 74 ·
telugu 73 · remember 69 · marks 60 · important 58 · skiplast 49 · outofbank 45. The short templates
are correctly short; `explain` runs long but the ask invites it. Nothing in this slice is padded to
the point of costing a grade, and the terse end is a bigger risk than the long end:
`ts_ipe_z2_exc_cortical_vs_juxtamedullary · [marks]` (24 words) answers "how much should I write?"
with only the mark split and never says what or how much to write.

**Markdown leaking as asterisks — 2 replies, both Telugu:**
`ts_ipe_z2_end_antidiuretic_hormone` ("**Vasopressin**", "**neurohypophysis**") and
`ts_ipe_z2_end_thymus_gland` ("**thymus gland**", "**T-lymphocytes**", "**cell mediated
immunity**", "**humoral immunity**"). Both are flagged mechanically in the log
(`_flags: MARKDOWN:**bold**_`) and both flags are correct. No English reply leaks markdown, so the
Telugu path is where the formatter is escaping.

**Internal step-ids: clean.** Zero replies speak an id like `s2_what` or `s1_emulsify` to the
student. Steps are always referred to as "step 2" / "the last step" / by their English label.

**Internal field names leaking — 2 replies.** `ts_ipe_z2_end_diabetes_insipidus_vs_mellitus ·
[important]`: "the **insider point** says it is asked more often than any other two-mark question";
`ts_ipe_z2_end_hypothalamus_neuroendocrine · [mistakes]`: "And remember the **insider point**: say
plainly that it is nerve tissue that makes hormones." The content is right; the card's field name
should not reach a student. Say "the book's own tip" or state it flat.

**"The book lists three common mistakes" — 3 replies over-claim a count.** On
`ts_ipe_z2_da_liver_functions` (the card lists **eight** — two per step),
`ts_ipe_z2_end_hypothalamus_neuroendocrine` and `ts_ipe_z2_end_pituitary_secretions` (eight each),
the reply announces "three" and then lists more than three anyway. Harmless to the answer, but it
tells the student the mistake list is shorter than it is.

**Stock opener.** "The important step is…" opens 29 replies, concentrated on `[remember]` and
`[whystep]`. It reads as a tic rather than an idiom, and it is literal English, so nothing here
trips the plain-language bar.

**Idioms:** none worth flagging. The figurative language that does appear is inherited from the
cards' own REMEMBER lines ("Bile is the soap of the gut", "Cushing is the cushion", "chyme is in the
stoMach") and each is immediately unpacked in literal words. The one invention of the model's own,
`ts_ipe_z2_da_tongue_papillae · [remember]` — "'fungi' sounds like 'fun' at the tip" — is an
arbitrary hook that carries no meaning; graded 2.

**Exam-history handling is exact.** All three zero-star / no-Asked-line cards
(`end_hormone_action_mechanism`, `end_hypothalamus_neuroendocrine`, `exc_gfr`) report the star rank
and the missing exam years as **separate** facts and say plainly that the book records no years,
exactly as the ANSWER FACTS instruct — never collapsing "no years listed" into "never asked". No
card in the slice has its stars and its Asked line conflated in either direction.
