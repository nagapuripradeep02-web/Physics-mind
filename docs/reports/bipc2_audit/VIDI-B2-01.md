# VIDI-B2-01 — Vidi chatbot audit, Botany-II slice 1 of 7

Source: `.answerbook_logs/audit_ts_ipe_b2.slice-01.md`
24 cards × 10 asks = 240 replies. Every reply graded against the ANSWER FACTS shown above its
card, never against outside biology. Blind read — no card file was opened or edited.

Chapters in this slice: Bacteria (10 cards), Biotechnology and its Applications (11 cards),
Biotechnology: Principles and Processes (3 cards).

---

## 1. Per-template table

| template   | mean  | 0 | 1 | 2 | 3  | N  |
|------------|-------|---|---|---|----|----|
| marks      | 2.833 | 0 | 1 | 2 | 21 | 24 |
| whystep    | 3.000 | 0 | 0 | 0 | 24 | 24 |
| remember   | 2.833 | 0 | 1 | 2 | 21 | 24 |
| explain    | 3.000 | 0 | 0 | 0 | 24 | 24 |
| mistakes   | 2.875 | 1 | 0 | 0 | 23 | 24 |
| important  | 2.875 | 0 | 0 | 3 | 21 | 24 |
| skiplast   | 3.000 | 0 | 0 | 0 | 24 | 24 |
| why        | 2.750 | 0 | 1 | 4 | 19 | 24 |
| outofbank  | 3.000 | 0 | 0 | 0 | 24 | 24 |
| telugu     | 2.875 | 0 | 0 | 3 | 21 | 24 |

Three templates are clean at 3.000 across all 24 cards: `whystep`, `skiplast`, `outofbank`
(and `explain`). The step-addressing machinery — which step is open, which mark it earns, what
the minimum is — did not miss once in 48 step-bound asks.

## 2. Overall

- **Overall mean: 2.904** (697 points / 240 replies)
- **Total replies graded: 240**
- **Guard replies excluded: 0** — no rate-limiter reply ("I could not answer just now…" /
  "Give me a short moment…") appears anywhere in this slice. Every one of the 240 is a real
  persona reply, so the mean is over the full population.
- Grade spread: 0 × 1 · 1 × 3 · 2 × 14 · 3 × 222.

## 3. Every reply scored 0 or 1

### 0 — `ts_ipe_b2_bia_bt_cotton` · [mistakes]

> "Good question. The most common mistake is saying Bt cotton is sprayed with insecticide — it
> makes its own insecticidal protein. Also, many students write the toxin is active when eaten,
> but it is an inactive protoxin activated by the insect's alkaline gut. Do not forget the
> alkaline pH step — that is where the mechanism mark is earned. And be careful with the cry
> genes: Cry I Ac and Cry II Ab are for bollworm, Cry I Ab is for corn borer. **The book lists
> no asked years for this question**, so focus on writing the four parts clearly."

**Why 0.** Flat falsehood against the facts. The card's own header reads
`Asked: TS 2022, 2020, 2018, 2017, 2016 · AP 2020, 2015` — seven listed appearances, the
heaviest exam history of any card in the slice. The reply tells the student the opposite of the
one fact that would make them prioritise it. Worse, the same card's `[important]` reply reads
the Asked line correctly and lists all seven years, so this is an inconsistency inside a single
card, not a missing input. The mistake content itself is fine; the exam-history sentence is
unprompted (a `[mistakes]` ask does not require exam history at all) and wrong.

### 1 — `ts_ipe_b2_ba_pleomorphic_bacteria` · [why]

> "I don't have a "why in the plant" for this question — this one is about bacteria, not plants.
> **Pleomorphic bacteria change shape because their cell wall is flexible**, and conditions like
> nutrition or environment alter it.
>
> For your answer, the definition plus Acetobacter is enough for the 2 marks — the book splits it
> as 1 mark for definition and 1 mark for the example."

**Why 1.** The mechanism is invented. Nothing in the ANSWER FACTS names a cause: the card's
s1 WHY line is a naming rationale ("Most bacteria hold one shape for life, so the ones that do
not need a name of their own"), not biology. A student who takes "the cell wall is flexible"
into the exam is writing a sentence the book does not contain and cannot defend. The mark-split
half of the reply is correct, which is why this is 1 and not 0. See CARD DEFECTS — the card gave
the model nothing to ground a `[why]` on.

### 1 — `ts_ipe_b2_bia_bt_cotton` · [remember] step s1_what

> "The important step is to remember that Bt cotton makes its own insecticide — it is not sprayed.
> Bt is short for the bacterium Bacillus thuringiensis.
>
> **To remember the three insect groups it kills, think of them as leaf-eating pests:
> lepidopterans (like bollworms), coleopterans (beetles), and dipterans (flies).** You can just
> remember the order as L, C, D. […]"

**Why 1.** The mnemonic is factually wrong and the card contradicts it. The facts say the three
groups are "lepidopterans (tobacco budworm), coleopterans (beetles) and dipterans (flies,
mosquitoes)". Calling flies and mosquitoes "leaf-eating pests" is false, and the mnemonic teaches
a wrong unifying idea to a student meeting the list for the first time. It also silently drops
mosquitoes and swaps the card's named lepidopteran (tobacco budworm) for bollworm. The rest of
the reply is correct and on-step.

### 1 — `ts_ipe_b2_bia_transgenic_plant_benefits` · [marks]

> "For full marks, cover all five headings: pest and pathogen resistance, food processing,
> nutritional value, hybrid seed, and abiotic stress tolerance. **Each heading is worth one mark,
> so you must write all five.** Every heading needs a named crop — the book says Bt cotton, Flavr
> Savr, and golden rice must appear. Keep each heading to two or three lines with the crop and its
> specific benefit, like papaya against the ring spot virus."

**Why 1.** Invented mark arithmetic. The MARK SPLIT is four 1M cells over four steps, and step 4
bundles headings 4 and 5 into a single mark. "Each heading is worth one mark, so you must write
all five" prices a 4-mark SAQ at 5 marks. The same card's `[explain]` reply gets it right —
"Fourth and fifth … Together these earn the final 1 mark" — so the model can see the bundling; the
`[marks]` reply, the one place a student goes for exactly this number, is where it broke. The
practical instruction (write all five headings) is correct, which keeps this at 1.

---

*No other reply in the slice scored below 2. The fourteen 2s are listed compactly:*
`marks`: ba_pleomorphic_bacteria (tells the student the fixed-shape contrast is "not required",
contradicting the step's own NOTE), bia_cry_genes ("write all three parts" for a two-part split).
`remember`: ba_genophore, ba_occurrence_of_microorganisms (both open on step 1 but lead with step
2's mnemonic). `important`: ba_pleomorphic_bacteria ("important because the book gives it 2
marks" — every Section A question is 2 marks), bia_green_revolution (reports the Asked years but
omits the 0-star rank the card asks to be reported separately), bia_transgenic_plant_benefits
("the book gives it full marks for this chapter" is meaningless). `why`: ba_conjugation,
ba_ecoli_in_intestine, ba_microbiology_definition (all three refuse the "plant" framing and then
give the student little or nothing about the open card's biology),
bpp_define_biotechnology (opens "You wrote a clear definition, but you have not explained the
biology behind it yet" — addressing the student as the author of the model answer).
`telugu`: ba_plasmid, bia_bt_cotton, bia_gm_biosafety_issues (see §5).

## 4. The four counts

**WRONG-STEP — 0 of 48.**
All 24 `[whystep]` and all 24 `[skiplast]` replies address exactly the step named in the header.
Every `[skiplast]` prices the loss at the named step's own 1M and names the correct remainder
(1 of 2 on the VSAQs; 3 of 4 on the four SAQs — bia_bt_cotton s4_cry, bia_gm_biosafety_issues
s4_pollution, bia_pest_resistant_plants s4_defeat, bia_transgenic_plant_benefits s4_hybrid).
Offending question_ids: none.

**OUT-OF-BANK ANSWERED — 0 of 24.**
No `[outofbank]` reply names a single stage of mitosis. All 24 decline, note the request, and
point to the catalog. Offending question_ids: none.

**SCOPE-CREEP — 0 of 24.**
Eleven of the 24 name the open card while declining ("I only have the Bt cotton question in front
of me", "it is a different question from the genophore one"), which is identification, not
content — none volunteers a step, a mark, a definition or a species name from the open card.
The closest is `ts_ipe_b2_bpp_define_biotechnology`, which adds "focus on the biotechnology
definition you have in front of you — it is a short two-mark answer": a mark value, not biology,
and it is the card's own section metadata. Counted as clean. Offending question_ids: none.

**INVENTED MARK — 1 of 240.**
`ts_ipe_b2_bia_transgenic_plant_benefits` · [marks] — "Each heading is worth one mark, so you must
write all five" against a four-cell 1M split (full quote in §3).

*Two near-misses reviewed and cleared:* `ts_ipe_b2_bpp_cloning_vectors` [whystep] "would only get
you half the marks" (half of 2M = 1M, derivable); `ts_ipe_b2_bia_transgenic_plant_benefits`
[remember]/[mistakes] "half a mark / half a point" for a benefit with no named crop — that
half-mark granularity comes from the card's own INSIDER POINT, so it is a card defect (§6), not
a model invention.

## 5. Telugu

**24 of 24 `[telugu]` replies are in Telugu script.** Zero romanised Telugu. Zero all-English.
No reply answered the Telugu ask in English.

**21 of 24 hold the intended shape** — Telugu script sentences with the biology terms left in
Latin/English (`conjugation`, `sex pilus`, `Escherichia coli`, `plasmid`, `cloning vectors`,
`beta-carotene`, `RNA interference`, `Agrobacterium`, `Flavr Savr`, `Golden rice`, `GEAC`,
`Genetic Engineering Approval Committee`, `Meloidogyne incognita`, `cry genes`).

**3 deviate by pulling the technical terms into Telugu script** (script is right, term-handling
is not — this is what cost them the 2):

- `ts_ipe_b2_ba_plasmid` — transliterates the whole definition instead of keeping the terms in
  Latin: "ప్లాస్మిడ్ అంటే బ్యాక్టీరియాలో ఉండే ఒక చిన్న DNA ముక్క. అది సెల్ఫ్-డూప్లికేటింగ్, నేకెడ్,
  సర్క్యులర్, డబుల్ స్ట్రాండెడ్ గా ఉంటుంది, మరియు జెనోఫోర్ కి విడిగా ఉంటుంది." The four adjectives
  a student must write in the exam (self-duplicating, naked, circular, double stranded) and the
  contrast term (genophore) are all transliterated — the student cannot copy them out of this reply.
- `ts_ipe_b2_bia_gm_biosafety_issues` — the most translated of the 24; not one technical term
  survives in Latin: "జన్యుమార్పిడి పంటల", "జీవవైవిధ్యానికి", "టాక్సిన్కి", "పరిణామ క్రమంలో",
  "సూపర్ వీడ్స్గా", "జన్యు కాలుష్యం". "Gene pollution" and "super weeds" are the two terms the
  card calls the strongest mark, and both reach the student only in Telugu.
- `ts_ipe_b2_bia_bt_cotton` — mostly correct (Bt cotton, Bacillus thuringiensis, protein
  crystals, protoxin, alkaline pH, cry genes all in Latin) but transliterates "మిడ్గట్" for
  midgut. Minor; it also drops Cry I Ab / corn borer, leaving the specificity contrast incomplete.

Markdown leaked as literal asterisks in exactly two Telugu replies (both mechanically flagged):
`ts_ipe_b2_ba_genophore` ("**Step 1 (1 mark):**", "**Step 2 (1 mark):**") and
`ts_ipe_b2_bia_basmati_patent` ("**Basmati**", "**biopiracy**"). Content in both is correct; the
asterisks will render raw to the student.

## 6. CARD DEFECTS

The rows below are faults in the ANSWER FACTS, not in the model. Ordered by how much damage each
did or can do.

| question_id | field | what is wrong | what it should say |
|---|---|---|---|
| `ts_ipe_b2_bia_transgenic_plant_benefits` | mark split ↔ insider note | The MARK SPLIT is four 1M cells but the INSIDER POINT says "**Five headings**, and each needs a NAMED crop", and step 4 silently bundles headings 4 and 5. Nowhere does the card state that five headings map to four marks. **This is what produced the slice's only INVENTED MARK** ("Each heading is worth one mark, so you must write all five"). | State the bundling in the insider note: "Five headings, four marks — headings 4 (hybrid seed) and 5 (abiotic stress tolerance) share the last mark. Each heading still needs a named crop." |
| `ts_ipe_b2_bia_transgenic_plant_benefits` | insider note | "A benefit without a named plant is **half a point**" introduces half-mark granularity that the MARK SPLIT (whole 1M cells) does not support, and the model repeated it twice as fact ("earns only half a mark"). A student cannot be told they lose half of a mark that is only ever awarded whole. | "A benefit with no named crop will not hold the mark on its own — attach a crop to every heading." Drop the fractional value. |
| `ts_ipe_b2_ba_transformation` | s2 WRITE line | "His experiment is **the one that first pointed to DNA as the genetic material**." Griffith (1928) demonstrated a *transforming principle*; Avery, MacLeod and McCarty (1944) identified that principle as DNA. The card asserts the imprecise version and **the model repeated it twice** — in `[explain]` ("His experiment was the first to point toward DNA as the genetic material") and in `[why]` ("which is why Griffith's experiment pointed to DNA as the genetic material"). | "His experiment showed that a 'transforming principle' passes between cells; Avery, MacLeod and McCarty later showed that principle is DNA. That is why Griffith is the starting point of the molecular biology chapter." |
| `ts_ipe_b2_bpp_cloning_vectors` | s2 MISTAKES ↔ question ↔ insider note | Three-way contradiction. The QUESTION asks "Give **an** example" (singular); the INSIDER POINT demands "at least **two** examples"; the MISTAKES line says "**Naming one example.** The question asks for at least one but a list scores better" — i.e. it files as a mistake the very thing it then calls sufficient. The confusion leaked into `[skiplast]`, which first sets the minimum at the definition alone, then reverses ("writing at least one … is safer for the full 2 marks"), and into `[mistakes]` ("naming only one example is weak"). | Pick one rule and state it once: "One example earns the mark; a list of plasmids, phages, cosmids, BAC and YAC scores better, and the Ti plasmid should appear because this is a botany paper." Remove "Naming one example" from MISTAKES. |
| `ts_ipe_b2_bia_cry_genes` (also `ts_ipe_b2_bia_bt_cotton` s4 REMEMBER) | s2 WRITE lead line / REMEMBER | "**Ac and Ab for cotton; Ab alone for corn**" is self-colliding: the cotton pair is Cry I Ac + Cry **II** Ab and the corn gene is Cry **I** Ab, so "Ab" sits on both sides of the mnemonic. It is the roman numeral that separates them, not the letters. The model propagated the ambiguity into `[remember]`: "when you see 'Ab,' check if it is with Ac (cotton) or alone (corn)" — a rule that cannot distinguish Cry II Ab from Cry I Ab. | "Cry I Ac and Cry **II** Ab → cotton bollworm. Cry **I** Ab → corn borer. The roman numeral is the difference: II Ab is cotton, I Ab is corn." |
| `ts_ipe_b2_ba_pleomorphic_bacteria` | s1 WHY | The WHY gives a *naming* rationale ("Most bacteria hold one shape for life, so the ones that do not need a name of their own"), not a biological cause. A `[why]` ask therefore has nothing grounded to stand on — **and the model filled the vacuum by inventing "their cell wall is flexible"**, the slice's other 1-scored biology error. | Give the cause the card wants written, or say plainly that the book gives no mechanism: "The book gives no mechanism — shape here varies with growth conditions and nutrition, and that variation is all the definition claims." |
| `ts_ipe_b2_ba_pleomorphic_bacteria` | s2 mark split ↔ NOTE | MARK SPLIT says "Example 1M" and EARNS THE MARK FOR says "Example", but the step NOTE demands "One named example **plus the contrast with fixed-shape bacteria**". The model resolved the tension by telling the student the contrast is "extra, not required for the marks" — advice that contradicts the card's own NOTE. | Decide which it is. If the contrast is required, say so in the split label ("Example with the fixed-shape contrast 1M"); if it is enrichment, drop it from the NOTE. |
| `ts_ipe_b2_bia_early_disease_detection` | s1 WHY | "Both techniques detect **the pathogen itself rather than the body's reaction to it**." True of PCR; not reliably true of ELISA, which in routine serodiagnosis detects the antibodies the body raised — i.e. exactly the body's reaction. The card's own s2 line is correctly neutral ("the pathogen's antigen binds a specific antibody"), so the WHY overstates its own step. The model repeated the overstatement in `[why]`: "detect the pathogen directly, not wait for your body's reaction." | "PCR multiplies the pathogen's own DNA until it is detectable. ELISA detects the antigen–antibody binding, which can be found before symptoms appear. Either way the test looks for molecular evidence, not for symptoms." |
| `ts_ipe_b2_ba_microbiology_definition` | s1 WRITE ↔ s2 WRITE / WHY | Self-contradictory scope. s1 defines the subject by size ("organisms too small to be seen with the unaided eye") and the s2 WHY reinforces it ("The groups listed have nothing in common but their size") — but the s2 list includes **ALGAE**, many of which (seaweeds) are plainly visible, and **VIRUSES**, which are not organisms at all while s1 says "organisms". The card inherits this from the source book; no reply tripped on it, but it will not survive a sharp student. | Keep the list, guard the claim: "…deals with micro organisms — those too small to be seen with the unaided eye — together with viruses, and with the microscopic forms of algae and fungi." |
| `ts_ipe_b2_bpp_artificial_plasmids` | s2 REMEMBER | "p for plasmid, then the initials of **whoever built it**" contradicts the card's own WRITE line one paragraph above, where pUC19 is named for the University of California — a *place*, not a builder. The model had to patch it live ("the initials of the people **or place** that built it"). | "p for plasmid, then the initials of the people or the place that made it — BR for Bolivar and Rodriguez, UC for the University of California." |
| `ts_ipe_b2_bia_geac` | s1 WRITE / MISTAKES | Book-faithful but factually outdated, flagged for a founder call rather than a fix: GEAC has been the Genetic Engineering **Appraisal** Committee since 2010, not "Approval Committee", and the MISTAKES line sets up "Advisory" as the wrong alternative when the real live name is neither. For the TS IPE exam the card is correct as written and should probably stay — but the VERIFICATION line ("not yet confirmed by a board teacher") is the right place to record the conflict. | Keep "Approval Committee" as the answer the board wants; add to VERIFICATION: "The committee was renamed Genetic Engineering *Appraisal* Committee in 2010 — write APPROVAL for this board unless a teacher says otherwise." |
| `ts_ipe_b2_bia_transgenic_examples` (also `..._transgenic_plant_benefits` s3) | s2 WRITE | "GOLDEN RICE, from **the Taipei rice variety**" — the cultivar is *Taipei 309*. Loose but consistent across both cards, and no reply garbled it. Lowest severity row here. | "GOLDEN RICE, developed in the Taipei 309 rice variety". |

Nine cards are clean of defects: `ba_conjugation`, `ba_ecoli_in_intestine`, `ba_genophore`,
`ba_occurrence_of_microorganisms`, `ba_plasmid`, `ba_sex_pilus`, `ba_transduction`,
`bia_basmati_patent`, `bia_bt_cotton`, `bia_gm_biosafety_issues`, `bia_green_revolution`,
`bia_pest_resistant_plants`, `bia_tobacco_nematode`, `bpp_define_biotechnology`.

## 7. Other observations

**Length.** Nothing runs away. The `[mistakes]` replies cluster at 85–100 words, which is right
for the ask. The one mechanical OVER_BUDGET flag — `bia_transgenic_plant_benefits` `[why]`
(162 w / 150) — **is a false positive**: the ask is "explain the biology behind it" on a card with
five distinct benefits, and the reply spends one tight paragraph on each. The regex is measuring
words, not the number of things that had to be explained. The genuinely long replies are the
`[explain]`s on the four 4-mark SAQs (`bia_transgenic_plant_benefits` runs ~300 words across five
headings), and those are earned — a student "seeing it for the first time" on a 4-mark answer needs
them. No reply was padded to the point of costing a grade on length alone.

**Markdown leaking as asterisks.** Two replies, both Telugu, both flagged (§5). Both are the same
pattern: the model reaches for `**bold**` when it wants to isolate a term the student must copy
exactly (`**Basmati**`, `**biopiracy**`, `**Step 1 (1 mark):**`). Worth fixing at the renderer or
the prompt, since the impulse behind it is a good one.

**Internal step-ids.** Zero leaks. A grep for `s1_` / `s2_` / `s3_` / `s4_` across all 240 reply
bodies returns nothing — the model always says "step 1" / "step 2" / "the last step" / the step's
human label ("Its use", "Scope", "Who and where"), never `s2_what`. This is clean fleet-wide and
worth keeping as a regression check.

**Idiom and personification.** Mostly inherited from the cards rather than invented, and mild:
"think of the virus as **the postman**" (`ba_transduction` — the card's own REMEMBER line),
"Acetobacter … **refuses to hold** a single fixed shape" (`ba_pleomorphic_bacteria` — again the
card's own "the one that will not hold a shape"). Three are the model's own additions and are the
ones to watch, because they are the register the plain-language law bans:
the phage "injects that **stolen** DNA" (`ba_transduction` `[why]`), microbes living inside other
organisms "as harmless **guests**" (`ba_occurrence_of_microorganisms` `[why]`), and "after … your
immune response **kicks in**" (`bia_early_disease_detection` `[why]`). "Lock-and-key" for
antigen–antibody (`bia_early_disease_detection` `[remember]`) is standard biology vocabulary, not
an idiom, and should stay.

**The `[why]` template is the weak one and the reason is structural.** It is the lowest-scoring
template (2.750) and it carries five of the eighteen sub-3 grades. The student's ask —
"but WHY does this happen in **the plant**?" — is a mismatched probe on cards about bacteria,
committees, patents and laboratory plasmids, and the model splits three ways on it:
it explains the open card's biology anyway (best, 19 replies), it refuses the plant framing and
then gives the student nothing (`ba_ecoli_in_intestine`, `ba_microbiology_definition` — correct
but a dead end), or it treats "the plant" as naming a *different, unopened question* and declines
that (`ba_conjugation`: "I do not have that **other question** open"). The first behaviour is the
right one — it is what `ba_genophore`, `bia_geac` and `bia_basmati_patent` do, each redirecting in
one sentence and then teaching. The refusals are not wrong, they are just wasted turns.

**What is working.** The star-versus-Asked separation the cards ask for is honoured in 23 of 24
`[important]` replies, including all four cards with no Asked line, where every reply says plainly
that the book records no exam years rather than concluding the question was never asked. The
step-bound templates are perfect. And the out-of-bank refusal is uniformly disciplined: 24 declines,
24 catalog pointers, zero mitosis content, zero volunteered content from the open card.
