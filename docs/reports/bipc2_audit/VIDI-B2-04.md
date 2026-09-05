# VIDI-B2-04 — Vidi chatbot audit, Botany-II slice 4 of 7

Source: `.answerbook_logs/audit_ts_ipe_b2.slice-04.md` — 24 cards × 10 asks = 240 replies.
Graded blind against the ANSWER FACTS printed above each card group, never against outside biology.
Rubric: 3 precise · 2 acceptable-but-padded/vague · 1 weak/misleading · 0 harmful.

Cards in this slice (all `|full`):
`mhw_methanogens`, `mhw_microbes_in_biotechnology`, `mhw_nucleopolyhedrovirus`,
`mhw_penicillin_scientists`, `mhw_statins`, `mhw_swiss_cheese_holes`,
`mn_absorption_of_essential_elements`, `mn_amino_acid_synthesis`,
`mn_essential_elements_deficiency`, `mn_hydroponics`, `mn_leghaemoglobin`,
`mn_nitrogen_fixation_equation`, `mn_root_nodule_formation`, `pgd_auxin_applications`,
`pgd_bolting`, `pgd_cytokinin_effects`, `pgd_ethylene_processes`, `pgd_gibberellin_responses`,
`pgd_plasticity`, `pgd_quiescence_vs_dormancy`, `pgd_seed_dormancy`, `pgd_vernalisation`,
`pgd_which_growth_regulator`, `ph_action_vs_absorption_spectrum`.

---

## 1. Per-template table

| template | mean | 0 | 1 | 2 | 3 | N |
|---|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 24 | 24 |
| whystep | 3.000 | 0 | 0 | 0 | 24 | 24 |
| remember | 2.875 | 0 | 0 | 3 | 21 | 24 |
| explain | 2.917 | 0 | 1 | 0 | 23 | 24 |
| mistakes | 2.875 | 0 | 0 | 3 | 21 | 24 |
| important | 3.000 | 0 | 0 | 0 | 24 | 24 |
| skiplast | 3.000 | 0 | 0 | 0 | 24 | 24 |
| why | 2.833 | 0 | 2 | 0 | 22 | 24 |
| outofbank | 2.625 | 0 | 0 | 9 | 15 | 24 |
| telugu | 2.917 | 0 | 1 | 0 | 23 | 24 |

---

## 2. Overall

- **Overall mean: 2.904** (697 points / 240 replies)
- **Total replies graded: 240**
- **Guard replies excluded: 0.** No reply in this slice is a rate-limiter guard ("I could not
  answer just now…" / "Give me a short moment…"). Every one of the 240 asks got a real answer.
- Grade distribution: 0 → **0**; 1 → **4**; 2 → **15**; 3 → **221**.

The two perfect templates that matter most for trust — `marks` and `skiplast` — are 24/24 at 3,
including the one hard case in the slice (`mn_root_nodule_formation` `s5_diagram`, a 0-mark
diagram step, which Vidi priced correctly at **0 marks lost**).

---

## 3. Every reply scored 0 or 1

No reply scored 0. Four scored 1.

**3.1 · `ts_ipe_b2_mhw_microbes_in_biotechnology` · [why]**

> You are asking about a biology question, but the question I have open is about naming two
> microbes used in biotechnology. That is a different topic. I do not have that plant-biology
> question open, so I cannot explain its steps or biology. You can open it from the catalog if
> it is in the book, and then I can help you with it.

Why 1: the student asked for the biology *behind the open answer*. The ANSWER FACTS hand Vidi
exactly that material in two `WHY` fields ("A host that divides every twenty minutes turns one
recombinant cell into millions overnight…"; "Agrobacterium already had a natural mechanism for
pushing its own DNA into plant cells…"). Vidi mis-parsed the ask as an out-of-bank request and
refused a question it was fully equipped to answer. The student is left believing there is no
biology to explain and that Vidi cannot help. 22 of the other 23 `[why]` replies handled the same
"in the plant" phrasing correctly — note the mismatch and then give the open card's biology.

**3.2 · `ts_ipe_b2_mhw_statins` · [why]**

> I don't have that question open — the one in front of you is about statins and Monascus
> purpureus, not about plants. Your question has been noted. If it is in the book, you can open
> it from the catalog.

Why 1: same failure as 3.1 and worse — a flat refusal with no content at all. The facts supply the
mechanism `WHY` ("Statins are a real example of the competitive inhibition defined in the enzymes
chapter") and the s2 `WRITE` lines. A student asking "why does the statin stop the enzyme?" gets
nothing.

**3.3 · `ts_ipe_b2_pgd_cytokinin_effects` · [explain]**

> […] Their effects are four. First, they promote cell division and help form new leaves and
> chloroplasts. Second, they delay leaf senescence… Third, they overcome apical dominance…
> For your answer, write the four effects numbered one to four.

Why 1: it announces **four** effects, lists **three**, and then instructs the student to write four.
The question is literally "Write any FOUR physiological effects of cytokinins." A student following
this reply writes three effects, believes they wrote four, and drops a mark. (The root cause is a
card defect — see §6.1 — but the reply is still the one a student reads.)

**3.4 · `ts_ipe_b2_pgd_cytokinin_effects` · [telugu]**

> […] నాలుగు ప్రభావాలు ఇవి:
> 1. Cell division ని ప్రోత్సహిస్తాయి…
> 2. Leaf senescence ని ఆలస్యం చేస్తాయి…
> 3. Apical dominance ని అధిగమిస్తాయి…
> ముఖ్యమైన విషయం: ఈ ప్రశ్నలో నాలుగు ప్రభావాలు అడిగారు కాబట్టి, మీరు రాసేటప్పుడు 1 నుంచి 4 వరకు నంబర్ వేసి రాయండి.

Why 1: the identical defect in Telugu — "these are the four effects" followed by three numbered
items, closing with "number them 1 to 4". Same card, same miscount, reproduced in both languages,
so it is a reliable failure rather than a one-off.

---

## 4. The four explicit counts

### WRONG-STEP — **0 of 48**

All 24 `[whystep]` replies explain the step named in the header, and all 24 `[skiplast]` replies
price the step named in the header. Checked step by step; no drift anywhere. Notable correct hard
cases: `mn_root_nodule_formation` `[skiplast] s5_diagram` ("you lose 0 marks because the book gives
it no marks… all 4 marks come from the written steps"), and every 4-mark card's `skiplast`
arithmetic (lose 1, keep 3) which is right in all seven instances.

### OUT-OF-BANK ANSWERED — **0 of 24**

No `[outofbank]` reply gives the stages of mitosis, names a mitotic phase, or hints at one. All 24
decline and offer the catalog. This is the cleanest result in the slice.

### SCOPE-CREEP — **8 of 24**

`[outofbank]` replies that decline correctly and then volunteer content of the *open* card the
student did not ask about:

`ts_ipe_b2_mhw_methanogens` · `ts_ipe_b2_mhw_nucleopolyhedrovirus` ·
`ts_ipe_b2_mhw_penicillin_scientists` · `ts_ipe_b2_mn_absorption_of_essential_elements` ·
`ts_ipe_b2_mn_essential_elements_deficiency` · `ts_ipe_b2_mn_hydroponics` ·
`ts_ipe_b2_mn_leghaemoglobin` · `ts_ipe_b2_pgd_vernalisation`

Worst instance (`mn_hydroponics`, also the one the regex flagged `OVER_BUDGET(93w/90)`):

> Since your exam is tomorrow, focus on the question in front of you now — hydroponics. For this
> one, the important step is to write the definition clearly, including the words "nutrient
> solution" and "without soil". Then add one line on what it is used for… That covers both marks.

Bluntest content dump (`mhw_methanogens`):

> For today's question, the answer is methanogens — that group of bacteria is found in both the
> rumen of cattle and the anaerobic sludge of sewage treatment.

Not counted as creep: replies that merely redirect attention without content
(`mn_amino_acid_synthesis`, `mn_root_nodule_formation`, `pgd_auxin_applications`,
`pgd_seed_dormancy`, `pgd_which_growth_regulator`, `ph_action_vs_absorption_spectrum` — "focus on
the question in front of you", "best of luck"). Those are fine and read as good tutoring.

### INVENTED MARK — **0 of 240**

Every mark number spoken to a student is derivable from that card's MARK SPLIT. Audited exhaustively:
104 uses of "1 mark" (all on 1M steps), 28 of "2 marks" (all on the 2-mark VSAQ cards), 20 of
"4 marks" (all on the 4-mark SAQ cards), 7 of "3 marks" (all correct 4−1 skiplast arithmetic),
1 of "0 marks" (the correctly-priced `s5_diagram`). No fractional or half-mark value was ever
invented; the only "half a mark" in the file is the card's own INSIDER POINT on
`pgd_which_growth_regulator`, which Vidi did not repeat as an award.

*Adjacent but not counted:* `pgd_cytokinin_effects` `[marks]` says "you need to write all four
effects clearly… Each effect earns one mark." The numbers (1M ×4) are the card's; only the labels
are shifted, because the card's first mark is for the definition, not an effect. Card defect §6.1,
not an invented number.

---

## 5. Telugu

**24 of 24 `[telugu]` replies are in Telugu script.** None is romanised Telugu; none is all-English.
**21 of 24** also meet the intended code-mix — Telugu script carrying the biology terms in English
(`METHANOGENS`, `anaerobic`, `cloning vectors`, `Ti plasmid`, `nitrogenase`, `apical dominance`,
`respiratory climactic`, `heterophylly`, `GA3`, `2,4-D`, `stratification`, `wavelength` …).

Three deviate by transliterating technical terms into Telugu script instead of keeping them English:

- **`ts_ipe_b2_mn_hydroponics`** — the only reply with *zero* English terms. Everything is Telugu,
  including the answer word itself: "హైడ్రోపోనిక్స్ అంటే మొక్కలను నేల లేకుండా, ఒక నిర్దిష్టమైన పోషక
  ద్రావణంలో పెంచే పద్ధతి." A student revising for an English-medium paper cannot lift "hydroponics /
  nutrient solution / without soil" out of this.
- **`ts_ipe_b2_mhw_penicillin_scientists`** — all three examinable names transliterated:
  "అలెగ్జాండర్ ఫ్లెమింగ్ … ఎర్నెస్ట్ చైన్ మరియు హోవార్డ్ ఫ్లోరీ … పెన్సిలిన్". The names are the
  entire answer, so this is the costliest of the three.
- **`ts_ipe_b2_mn_root_nodule_formation`** — "ఇన్ఫెక్షన్ థ్రెడ్", "కార్టెక్స్", "రూట్ నాడ్యూల్",
  "వాస్కులర్ కనెక్షన్", "లెగ్యూమ్", "నైట్రోజన్ ఫిక్సింగ్" all transliterated; only *Rhizobium*
  survives in Latin. "Infection thread" is explicitly the mark-earning phrase on that card.

Partial, acceptable: `pgd_ethylene_processes` transliterates only the hormone name ("ఎథిలీన్") and
keeps everything else English; `mhw_swiss_cheese_holes` transliterates "బ్యాక్టీరియా" but keeps
CARBON DIOXIDE and PROPIONIBACTERIUM in Latin.

---

## 6. CARD DEFECTS

The highest-value section: problems in the ANSWER FACTS themselves, not in the model.

| # | question_id | field | what is wrong | what it should say |
|---|---|---|---|---|
| 6.1 | `ts_ipe_b2_pgd_cytokinin_effects` | mark split + insider note + WRITE numbering | The question asks for **four physiological effects**, but 1M of the split goes to "What cytokinins are and where they are made" — a definition, not an effect — leaving only three effect steps. The INSIDER POINT then says "Number them one to four and stop", while the WRITE fields actually number **five** effects (1,2,3 in `s2`, 4 in `s3`, 5 in `s4`). Three mutually incompatible counts on one card. **This directly produced both grade-1 replies in the slice** (`[explain]` and `[telugu]` each announce four effects and list three). | Either re-cut the split as four *effects* (cell division · new leaves & chloroplasts · delaying senescence · overcoming apical dominance) with the definition folded into the opening line of step 1; or keep the definition mark but rewrite the insider note to "one mark for what they are, then number the effects 1–4 and stop", and renumber the WRITE fields so exactly four effects are numbered. |
| 6.2 | `ts_ipe_b2_ph_action_vs_absorption_spectrum` | `s2_absorption` WRITE, lead line | The step's own lead line reads **"Rate of photosynthesis against light absorbed"** — that is the *action* spectrum's quantity, and it contradicts the very next line of the same step ("the graph showing the ABSORPTION OF LIGHT by pigments") and the step's own MISTAKES entry ("Saying the absorption spectrum plots the rate of photosynthesis. It plots ABSORPTION"). A trap in the card that Vidi happened to step around in all 10 replies. | "Light absorbed by pigments, against wavelength" — mirroring the `s1_action` lead line, per the card's own NOTE ("Mirror the first half"). |
| 6.3 | `ts_ipe_b2_pgd_gibberellin_responses` | `s2_stem` WRITE, item 3 | "**3. They promote fruit ripening.**" contradicts `s4_senescence` on the same card ("Gibberellins DELAY senescence, so fruits can be left on the tree longer and still be transported") and its REMEMBER line ("Gibberellin delays the end; ethylene brings it on"). It also collides with the sibling card `pgd_which_growth_regulator`, where "quickly ripen a fruit" is answered **ETHYLENE** and answering it with anything else is listed as a mistake. The card already flags the guide as self-contradicting on senescence but not here. | Drop item 3, or replace with the delaying framing the rest of the card teaches — e.g. "3. They delay ripening and senescence, so fruit can be held on the tree longer." If the source guide really prints "promotes ripening", add a NOTE saying so and telling the student to write the delay. |
| 6.4 | `ts_ipe_b2_pgd_ethylene_processes` | `s2_ripening` WRITE + NOTE ("respiratory climactic") | The term is the **respiratory climacteric**. "Climactic" is a different English word and is not the physiological term. It appears 7 times in this card group and Vidi faithfully repeated it in `[explain]`, `[mistakes]` and `[telugu]` — so a student writes the wrong word in the exam because the card taught it. | "This rise is called the RESPIRATORY CLIMACTERIC." (Same fix in the NOTE line.) |
| 6.5 | `ts_ipe_b2_pgd_auxin_applications` | `s1_what` WRITE | "**2,4-D and IBA are synthetic auxins.**" IBA is one of the auxins isolated from plants; the standard textbook pairing is IAA and IBA natural, NAA and 2,4-D synthetic. The slice contradicts itself: `pgd_which_growth_regulator` `s1_ab` writes "AUXIN, such as IBA or NAA" for rooting a twig. Vidi repeated "2,4-D and IBA are synthetic" verbatim in `[explain]` and `[telugu]`. | "The natural auxins are indole-3-acetic acid (IAA) and indole butyric acid (IBA). NAA and 2,4-D are synthetic auxins." |
| 6.6 | `ts_ipe_b2_mhw_swiss_cheese_holes` | `s2_bacterium` WRITE (species name) | "*Propionibacterium **sharmanii***" — the organism is named for Sherman; the correct form is *P. shermanii* (*Propionibacterium freudenreichii* subsp. *shermanii*). The card teaches a misspelling as the species name and its NOTE tells the student to write "the species if you know it". | "PROPIONIBACTERIUM (*P. shermanii*)". If the source book prints "sharmanii", keep the genus as the answer and add a NOTE that the book's spelling differs from the correct *shermanii*. |
| 6.7 | `ts_ipe_b2_mhw_penicillin_scientists` | mark split | The question asks only "Name the scientists who were credited for **showing the role** of penicillin as an antibiotic", but the split spends a whole mark on "Who discovered it 1M" (Fleming). The card's own INSIDER POINT admits it — "The question asks about the second pair." So a student who answers the question exactly as asked (Chain and Florey) is told by `[skiplast]` and `[marks]` that they hold only 1 of 2 marks. | Either re-cut as "Both names 1M · The Nobel/wartime context 1M" for the question as printed, or add `needs_teacher_verification` on the discovery mark with a NOTE that Fleming is context the board rewards but the question does not ask for. |
| 6.8 | **all 24 cards** | STARS | Every card in the slice carries "**STARS: 0 of 3**", including `mhw_swiss_cheese_holes` (6 recorded appearances: TS 2020/2018/2017, AP 2020/2018/2016), `pgd_auxin_applications` (5), `mhw_statins` (5), `mn_root_nodule_formation` (5). A frequency rank of zero on a six-time repeat is not credible; the star data most likely failed to import for this chapter block. The cost is real: all 24 `[important]` replies are forced into the awkward "the book does not rank it as frequently asked, **but** it came in six exams" shape, which reads as Vidi arguing with itself. | Re-import the star ranks for this block. Until then, when an Asked line lists ≥3 years, suppress the "not frequently asked" clause and let the exam history speak, or mark the STARS field unverified. |
| 6.9 | `ts_ipe_b2_mn_amino_acid_synthesis` | `s4_enzyme` WRITE, last line | "Between them the plant builds **all twenty** amino acids it needs." Reductive amination plus transamination is the nitrogen-entry route, not the full biosynthetic account of twenty amino acids (carbon skeletons come from several distinct pathways). It over-claims what the two named enzymes do. | "Between them the plant brings nitrogen in and passes it on to build its amino acids." |

---

## 7. Other observations

**Length.** Only 2 of 240 replies tripped the length regex, both marginally:
`mn_hydroponics [outofbank]` at `OVER_BUDGET(93w/90)` and `pgd_ethylene_processes [why]` at
`OVER_BUDGET(157w/150)`. The hydroponics one is over budget *because* of the scope creep in §4 —
the refusal is two sentences and the volunteered card content is the rest. Fixing scope creep fixes
that flag. The ethylene one is 7 words over on a genuinely four-part question and is not a problem.
The real length pattern the regex misses is the other direction: `[remember]` on a 2-mark card
regularly runs three or four paragraphs when the ask was "how do i remember this?" about one named
step (`mhw_nucleopolyhedrovirus`, `mn_hydroponics`, `mn_root_nodule_formation`,
`mn_absorption_of_essential_elements` each walk steps the student did not open).

**Markdown leaking as asterisks.** 3 replies carry `MARKDOWN:**bold**`, all of them `[telugu]`:
`mhw_methanogens`, `mhw_microbes_in_biotechnology`, `mn_absorption_of_essential_elements`. If the
Telugu surface renders literally, a student sees `**METHANOGENS**`. The English replies are clean —
this is a Telugu-path-only leak, which suggests the bold is coming from the translation step rather
than the answer composer.

**Internal step-ids.** Zero leaks. No reply says `s2_do`, `s1_group`, `s4_flux` or any other raw id
to the student. Vidi consistently speaks the human step label instead ("the 1 mark for 'What they
make'", "the mark for 'Flux, influx and efflux'", "the 'Breaking it' mark"). Quoting the label in
quotation marks is a nice touch and reads as a real teacher citing a marking scheme.

**Idioms and register (Rule 41 territory).** Mostly clean literal English, but the cards themselves
seed several figures of speech that Vidi then repeats to the student: "quiescence is **the
weather's fault** / dormancy is **the seed's own fault**" (both cards, echoed in `[remember]`,
`[mistakes]`, `[explain]`, `[why]`), "the bacteria give the signal, **the plant builds the room**"
(`mn_root_nodule_formation`, echoed in `[whystep]` and `[remember]`), "**No pipe, no profit**",
"the root **advertises** with sugar", "it sits in **the enzyme's seat**" (`mhw_statins`), "**some
seeds carry their own brake**". A couple of Vidi's own additions personify further: "the cold
treatment is **the plant's way of** making sure growth comes before reproduction"
(`pgd_vernalisation [why]`), "the seed **pauses itself for its own survival**"
(`pgd_seed_dormancy [why]`), "**one process, two useful outcomes**". None is wrong and most are
genuinely memorable, but they are card-authored register, so if plain-literal wording is the
standard, fix the REMEMBER fields, not the model.

**Mistake-count claims.** Three `[mistakes]` replies open by counting the card's traps and get the
count wrong — "The book lists **five** common traps" (`mn_root_nodule_formation`, the card holds 8
across four steps plus 3 on the diagram), "The book lists **three** common mistakes"
(`pgd_cytokinin_effects`, the card holds 8), "The book lists **three** common mistakes here"
(`pgd_plasticity`, the card holds 4). The mistakes listed are always real; only the announced count
is invented. Cheapest fix is to stop announcing a number.

**One small chapter slip.** `mhw_microbes_in_biotechnology [outofbank]`: "I do not have that
question open right now — **it is a different one from this chapter**." Mitosis is not in Microbes
in Human Welfare. Read literally it tells the student mitosis lives in the chapter they are already
in. Every other `[outofbank]` says "if it is in the book", which is the right hedge.

**What is working.** `marks`, `whystep`, `skiplast` and `important` are 24/24 at 3 — the templates
where a wrong answer costs a student real marks are the ones with no defects at all. `important`
in particular handles the STARS/Asked split exactly as instructed on all 24 cards: it reports the
rank and the exam history from their own lines, and the 5 cards with no Asked line all get the
required "the book records no exam years for it, so I cannot say it appeared" rather than "it was
never asked". The out-of-bank refusal holds 24/24; the only weakness there is talking too much
after the refusal, not breaking it.
