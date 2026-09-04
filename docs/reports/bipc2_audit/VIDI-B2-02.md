# VIDI-B2-02 — Vidi chatbot audit, Botany-II slice 2 of 7

Source: `.answerbook_logs/audit_ts_ipe_b2.slice-02.md` — 24 cards × 10 asks = **240 replies**.
Graded blind against the ANSWER FACTS shown above each card group, never against outside biology.
Chapters covered: Biotechnology: Principles and Processes (10 cards), Enzymes (6), Molecular Basis
of Inheritance (8).

---

## 1. Per-template table

| template | mean | 0 | 1 | 2 | 3 | N |
|---|---|---|---|---|---|---|
| marks | 2.833 | 0 | 0 | 4 | 20 | 24 |
| whystep | 2.958 | 0 | 0 | 1 | 23 | 24 |
| remember | 2.917 | 0 | 0 | 2 | 22 | 24 |
| explain | 3.000 | 0 | 0 | 0 | 24 | 24 |
| mistakes | 2.917 | 0 | 0 | 2 | 22 | 24 |
| important | 3.000 | 0 | 0 | 0 | 24 | 24 |
| skiplast | 3.000 | 0 | 0 | 0 | 24 | 24 |
| why | **2.583** | 0 | **5** | 0 | 19 | 24 |
| outofbank | 2.875 | 0 | 0 | 3 | 21 | 24 |
| telugu | 2.833 | 0 | 1 | 2 | 21 | 24 |

`[important]` and `[skiplast]` are perfect: every one of the 24 `[important]` replies reported the
STARS rank and the `Asked:` line as two separate facts (or said plainly that no exam years are
listed, on the 8 cards that carry no `Asked:` line), and every `[skiplast]` priced the named step
correctly, including the 0-mark diagram step on the rDNA-processes LAQ.

`[why]` is the one broken template — see §3.

---

## 2. Overall

- **Overall mean: 2.892** (694 / 240)
- **Total replies: 240**
- **Guard replies excluded: 0.** No "I could not answer just now" / "Give me a short moment"
  reply appears anywhere in the slice. The rate limiter never fired; all 240 are persona replies
  and all 240 are graded.
- Grade distribution: 0 × **0**, 6 × **1**, 14 × **2**, 220 × **3**.

---

## 3. Every reply scored 0 or 1

No reply scored **0**. Six scored **1** — five of them the same failure mode.

### 3a. The `[why]` collapse — 5 replies (the dominant defect in this slice)

The `[why]` ask is *"but WHY does this happen in the plant? explain the biology behind it, not just
the steps"*. On 19 cards Vidi handled it exactly right: it noted the topic is not a plant process,
then explained the biology from the card's own WHY fields. On 5 cards it instead **denied having any
question open** and refused. On four of those five the denial is a flat falsehood — the card *was*
open, and its WHY fields were in front of the model.

| # | question_id | template | reply (quoted) | why it is wrong, against the ANSWER FACTS |
|---|---|---|---|---|
| 1 | `ts_ipe_b2_bpp_laq_rdna_tools` | why | "You are asking about a Botany question, but the biology you want explained — like why a plant does something in diffusion or photosynthesis — is not the question I have open in front of me. I only have the recombinant DNA tools question here. If you want a different question explained, open it from the catalog and I will help you with that one." | The rDNA-tools card **is** open and carries six WHY fields ("Cutting at a palindrome off-centre leaves short single-stranded overhangs…", "Amplification comes before cloning because a single copy of a gene is too little to work with…", "A vector must open at exactly one place…", "A host cell has to be persuaded to let DNA through its wall…"). Vidi had everything needed and volunteered nothing. It also invents a premise — the student never mentioned diffusion or photosynthesis. Compare the same ask on `bpp_exo_vs_endonucleases`, where Vidi correctly said "these are tools used in genetic engineering in a lab, not processes inside a plant" and *then* explained. |
| 2 | `ts_ipe_b2_en_apoenzyme_vs_cofactor` | why | "I think you may be looking at a different question than the one I have open. I only have the apoenzyme and cofactor question with me. If you want the biology behind why a plant does something, you can open that question from the catalog. I have noted your request." | The card supplies two WHY fields — "The apoenzyme carries the shape of the active site but cannot work alone, which is why the cofactor is needed at all" and "The equation at the end is the cleanest statement of the difference, because it shows the two parts are complements rather than alternatives". Both directly answer "explain the biology behind it". Refusing here teaches the student that Vidi cannot explain the card it is holding. |
| 3 | `ts_ipe_b2_en_enzyme_inhibitors` | why | "I don't have that question open, so I cannot see its steps or explain it. I have noted your request, and you can open that question from the catalog if it is in the book." | Outright false: the enzyme-inhibitors card is the open card, with four WHY fields ("The inhibitor works only because it looks like the substrate…", "Changing the enzyme's shape from somewhere else disables the active site indirectly, which is why adding more substrate cannot overcome this kind of inhibitor…", "The product itself is the signal, so the cell needs no separate sensor to know when to stop"). The student is told, wrongly, that nothing is loaded. This is the worst of the five — it does not even name the open card. |
| 4 | `ts_ipe_b2_en_prosthetic_group_vs_cofactor` | why | "I do not have that question open, so I cannot see its steps or its biology. Your question has been noted, and you can open it from the catalog if it is in the book." | Same falsehood. The card is open and its WHY fields ("Prosthetic groups are one of the three kinds of cofactor, so their definition is narrower than the general term…", "The general term covers three kinds, and prosthetic groups are only one of them — which is the actual difference the question is asking about") are exactly the requested biology. |
| 5 | `ts_ipe_b2_en_types_of_cofactors` | why | "I don't have that plant-biology question open, so I cannot explain why it happens in the plant. Your question has been noted, and you can open it from the catalog if it is in the book." | Same. The card is open with four WHY fields, including the one that answers the ask head-on: "Being tightly bound means the group stays with the enzyme through the reaction, which is the one thing that separates it from a coenzyme." Vidi has re-read the student's ask as a request for a *different* card and declined it as out-of-bank. |

Pattern: **4 of the 5 are in the Enzymes chapter** (`en_*`) — every Enzymes card except
`en_feedback_inhibition` and `en_michaelis_constant` failed this ask. The Enzymes cards' WHY fields
are short and abstract ("The apoenzyme carries the shape of the active site but cannot work alone")
rather than mechanistic, which appears to give the model nothing it recognises as "biology" and
push it into the out-of-bank refusal script. This is a **card-shape** problem as much as a model
problem, and it is recorded again in §6.

### 3b. Telugu — 1 reply

| # | question_id | template | reply (quoted) | why it is wrong |
|---|---|---|---|---|
| 6 | `ts_ipe_b2_bpp_palindromic_sequence` | telugu | "పాలీండ్రోమిక్ సీక్వెన్స్ అంటే DNA లో ఒక నిర్దిష్టమైన base pairs క్రమం, అది రెండు strands లోనూ ఒకేలా చదివినప్పుడు ఒకే విధంగా ఉంటుంది, కానీ రెండింటినీ ఒకే 5' to 3' దిశలో చదవాలి. // ఉదాహరణకు EcoRI site: 5'-GAATTC-3' — ఈ సీక్వెన్స్ రెండు strands లోనూ ఒకేలా ఉంటుంది. // ముఖ్యమైన విషయం ఏంటంటే, definition లో "ఒకే 5' to 3' దిశలో" అనే phrase తప్పకుండా రాయాలి…" | The card's step 2 MISTAKES says in terms: *"Giving a single strand. A palindrome needs BOTH strands written."* and its NOTE says *"Both strands, then the check spelled out. This is what earns the mark."* The Telugu reply hands the student **one strand only** as "the example" — the exact mistake the card flags, in the one language reply where the student is most likely to copy verbatim. A student following it loses the example mark (1 of 2). Secondary: "palindromic sequence" is transliterated into Telugu script (పాలీండ్రోమిక్ సీక్వెన్స్) instead of being left in English, against the code-mix convention every other Telugu reply follows. |

---

## 4. The four explicit counts

### WRONG-STEP — **0 of 48**
Every `[whystep]` (24) and `[skiplast]` (24) reply addressed the step actually named in the ask.
Verified one by one against the step id in each header. Notable correct cases:

- `ts_ipe_b2_bpp_laq_rdna_processes` · skiplast · `s9_diagram` — correctly priced at **0 marks**
  ("you lose 0 marks, because the book gives it no marks — the question only says 'explain'"), then
  correctly re-listed all eight 1-mark steps as the true minimum. This is the single easiest place
  in the slice to invent a mark, and Vidi did not.
- `ts_ipe_b2_bpp_laq_rdna_tools` · skiplast · `s6_host` — correctly summed the surviving steps
  (1 + 2 + 1 + 1 + 2) to **7 marks** across an uneven split.
- `ts_ipe_b2_en_types_of_cofactors` · skiplast · `s4_metal` and `ts_ipe_b2_mbi_dna_vs_rna` ·
  skiplast · `s4_types` — both correctly returned 3 of 4.

### OUT-OF-BANK ANSWERED — **0 of 24**
No `[outofbank]` reply gave the stages of mitosis, named a stage, or hinted at one. All 24 declined.

### SCOPE-CREEP — **2 of 24**
An `[outofbank]` reply that declines correctly and then volunteers content of the *open* card:

- `ts_ipe_b2_bpp_downstream_processing` — "For the question you do have open, downstream processing,
  the two marks come from the definition and what it includes — separation and purification are the
  two words to remember."
- `ts_ipe_b2_en_apoenzyme_vs_cofactor` — "For the question in front of you, just remember the
  contrast: apoenzyme is the protein part, cofactor is the non-protein part."

Not counted (correct behaviour, kept for the line between the two): eight replies that merely
*name* the open card or *offer* to return to it without teaching it —
`bpp_ecori` ("I can only see the EcoRI one in front of us"), `bpp_laq_rdna_processes` ("If you want,
I can help you with the recombinant DNA technology question you have open right now instead"),
`bpp_molecular_scissors`, `mbi_capping_and_tailing`, `mbi_charging_of_trna`, `mbi_codon_aug`,
`mbi_complementary_and_mrna`, `mbi_dna_polymerase_function`.

### INVENTED MARK — **0 of 240**
Every mark number quoted anywhere in the slice is derivable from that card's MARK SPLIT. Checked
across the three uneven splits (`bpp_laq_rdna_tools` 1/2/1/1/2/1, `bpp_laq_rdna_processes` eight
× 1M, the 0M diagram step) and all 21 even 1M+1M / 4 × 1M splits. The nearest miss is
`en_apoenzyme_vs_cofactor` · whystep, which says *"That equation is worth the 1 mark for the
cofactor half"* — the 1M is real, but it belongs to the whole step, not to the closing equation
alone; scored 2, not counted as invented.

---

## 5. Telugu

- **24 of 24 `[telugu]` replies are in Telugu script** with the biology terms left in English/Latin
  (restriction endonuclease, sticky ends, palindrome, apoenzyme, cofactor, holoenzyme, Chargaff's
  rule, mRNA, splicing, Taq polymerase, poly-A tail, …). This is the intended code-mix and it holds
  across the whole slice.
- **0 replies are romanised Telugu.** **0 replies are all-English.**

Two register slips worth fixing, neither of which changes the verdict above:

1. **Romanised Telugu particles inside otherwise-Telugu-script replies** (2 replies):
   - `ts_ipe_b2_bpp_exo_vs_endonucleases` — "ఈ question **lo** రెండు marks ఉన్నాయి — Exonucleases
     **ki** 1 mark, Endonucleases **ki** 1 mark."  (`lo`, `ki` written in Latin instead of లో / కి)
   - `ts_ipe_b2_bpp_recombinant_dna` — "సరే, ఈ answer ని **simple ga** ఇలా రాయచ్చు:"
     (`simple ga` written in Latin)

2. **Biology/English terms transliterated INTO Telugu script** instead of being left in English —
   the opposite of the convention, and the more damaging slip because it hides the exam word from
   the student (7 replies): `bpp_palindromic_sequence` (పాలీండ్రోమిక్ సీక్వెన్స్ = palindromic
   sequence), `mbi_charging_of_trna` (చార్జింగ్ = charging), `bpp_pcr` (టెస్ట్ ట్యూబ్ = test tube),
   `mbi_dna_polymerase_function` (ఎంజైమ్, స్ట్రాండ్ = enzyme, strand),
   `en_apoenzyme_vs_cofactor` (ఎంజైమ్), `mbi_capping_and_tailing` (న్యూక్లియోటైడ్ = nucleotide),
   `bpp_laq_rdna_processes` (స్టెప్పులను, ఎంజైమ్లతో).

Longest/shortest: the `mbi_dna_vs_rna` Telugu reply covers all four mark groups and all 13 table
rows — the best in the slice. The `bpp_molecular_scissors` and `mbi_exons_and_introns` Telugu
replies are three lines and skip the second-mark detail (methylation; the word *splicing* is kept,
so both still pass).

---

## 6. CARD DEFECTS

The most valuable section: faults in the ANSWER FACTS themselves, not in the model.

| # | question_id | field | what is wrong | what it should say |
|---|---|---|---|---|
| D1 | **all 24 cards** | STARS | Every single card in the slice reads `STARS: 0 of 3`. Sixteen of them carry an `Asked:` line showing 2–7 board appearances (`bpp_laq_rdna_processes` = TS 2019/2017/2016 + AP 2022/2019/2017/2016). A frequency field that is 0 for 100% of a 24-card sample is unpopulated data, not a rank. It forces every `[important]` reply into the same self-contradicting shape — "the book gives it 0 stars… but it appeared seven times" — and `bpp_laq_rdna_processes` · important actually has to write "That is a strong history, so even though the star rank is low, it has been asked many times before." | Either populate STARS from the source book for Botany-II, or drop the field from the Botany-II prompt entirely and let the `Asked:` line carry importance on its own. Vidi handled the contradiction correctly all 24 times, so this is a data-quality fix, not a prompt fix — but it is spending a paragraph of every `[important]` answer on an artefact. |
| D2 | `ts_ipe_b2_bpp_laq_rdna_tools` | step label + WRITE (`s2_restriction`) | "RESTRICTION ENZYMES belong to a larger class called NUCLEASES. **They** are of two kinds: (i) EXONUCLEASES… (ii) ENDONUCLEASES…" — the antecedent of "They" reads as *restriction enzymes*, so the card states that restriction enzymes come in an exo- and an endo- kind. That directly contradicts `bpp_ecori`, whose MISTAKES field says "Saying EcoRI is an exonuclease. It is an ENDOnuclease", and `bpp_exo_vs_endonucleases`, which says restriction endonucleases are endonucleases. A student reading both cards is taught the exact error a sibling card warns against. | "Restriction enzymes belong to a larger class of enzymes called NUCLEASES. **Nucleases** are of two kinds: exonucleases… and endonucleases… **Restriction enzymes are endonucleases**, which is why they are called restriction endonucleases." One word fixes it and removes the cross-card contradiction. |
| D3 | `ts_ipe_b2_mbi_dna_vs_rna` | insider note | "**Ten rows in the book**, four marks on the paper… get at least eight differences down." The model answer under it contains **thirteen** numbered rows (1–13). The card contradicts itself about how much the student is aiming at. | "Thirteen rows below, four marks on the paper — tabulate and get at least eight down." This produced the only sub-3 `[marks]` reply on a 4-mark card: Vidi wrote "that is 13 rows total… The insider point says at least eight differences, but full marks come from covering every row", visibly reconciling two numbers the card should not have disagreed on. |
| D4 | `ts_ipe_b2_en_enzyme_inhibitors` | insider note | "**Three types, three examples.** Malonic acid against succinate is the example every examiner expects, so write it even if the other two examples are shorter." The model answer supplies only **two** examples — malonic acid (s2) and copper/mercury ions (s3). Step `s4_feedback` has no example at all. The insider note promises a third example the answer never delivers. | Either add the standard example to `s4_feedback` (e.g. the end product of a named pathway inhibiting the first enzyme of that pathway), or rewrite the note as "Three types, two named examples — malonic acid against succinate is the one every examiner expects." |
| D5 | `ts_ipe_b2_bpp_laq_rdna_processes` | why (`s6_insertion`) | "A **bacterial cell wall** does not normally let DNA through, so **every method** is a different way of forcing or persuading it across." Two of the three methods listed in that same step are not bacterial: MICROINJECTION is stated in the WRITE as going "directly into the nucleus of an **animal** cell" (animal cells have no wall at all), and the GENE GUN is the plant-cell method. The reason given does not cover the methods it claims to explain. | "A cell will not normally take up naked DNA, so each method is a different way of getting it across the boundary — calcium and heat shock for bacteria, a needle for an animal cell, gold particles for a plant cell." |
| D6 | `ts_ipe_b2_en_types_of_cofactors` | WRITE (`s2_prosthetic`) | "Example: the haem part of peroxidase. **Peroxidase breaks hydrogen peroxide into water and oxygen.** 2H2O2 --peroxidase--> 2H2O + O2". Strictly this is **catalase's** reaction; a peroxidase uses H₂O₂ to oxidise a second substrate and does not release O₂. NCERT prints peroxidase and catalase together on this reaction, so the card is faithful to its source — flagging it as a known-soft claim rather than a hard error. Low priority. | If kept for board fidelity, leave it; if tightened, "Example: the haem part of peroxidase and catalase, the enzymes that break hydrogen peroxide down: 2H₂O₂ → 2H₂O + O₂." Also: the equation is written in ASCII (`2H2O2`, `-->`) where every other card in the slice uses real Unicode (`5'`, `≡`, `→`); it should be `2H₂O₂ → 2H₂O + O₂`. |
| D7 | Enzymes chapter — `en_apoenzyme_vs_cofactor`, `en_enzyme_inhibitors`, `en_prosthetic_group_vs_cofactor`, `en_types_of_cofactors` | why (all steps) | The WHY fields on the Enzymes cards are definitional restatements rather than mechanism ("The apoenzyme carries the shape of the active site but cannot work alone, which is why the cofactor is needed at all"; "The general term covers three kinds, and prosthetic groups are only one of them"). Four of these six Enzymes cards are exactly where the `[why]` template collapsed into "I don't have that question open" (§3a) — the only four such failures outside `bpp_laq_rdna_tools`. The card gives the model nothing that reads as *biology*, and it falls back on the out-of-bank refusal script. | Give each Enzymes step a WHY that names a physical mechanism, the way the Biotechnology cards do ("Cutting off-centre on both strands leaves overhangs that can base pair…"). E.g. for the cofactor step: "A protein chain alone cannot carry a metal ion or a redox-active ring, so the non-protein part supplies the chemistry the amino acids cannot — which is why the two halves are complements, not alternatives." |
| D8 | 6 cards — `en_charging_of_trna` (`s2_why`), `bpp_laq_rdna_processes` (`s3_isolate_fragment`), `bpp_downstream_processing` (`s1`/`s2`), `bpp_ecori` (`s1`/`s2`), `bpp_molecular_scissors` (`s2_where`), `mbi_base_percentages` (`s1`) | step label vs mark split | The `MARK SPLIT` label and the step's `EARNS THE MARK FOR:` label disagree, so the two names for the same mark differ. `charging_of_trna`: split says "Why it matters", the step earns "Significance". `laq_rdna_processes` s3: split says "Isolating the desired fragment", the step earns "Separation". `downstream_processing`: split "What it includes" vs earns "Includes". `ecori`: split "What it is" vs earns "What it is" ✓ but "How it cuts" vs "How it cuts" ✓ — the drift is worst on the first two. Vidi propagates whichever it happens to pick, so the same mark is called two things across a session (`charging_of_trna` · skiplast quotes "the full mark for 'Significance'", while `charging_of_trna` · important quotes "1 for why charging matters"). | Make `EARNS THE MARK FOR:` copy the MARK SPLIT cell verbatim. The student should hear one name per mark. |
| D9 | `ts_ipe_b2_bpp_pcr` | WRITE (`s2_uses`) | The three "uses" are "1. DNA cloning 2. **gene amplification** 3. DNA fingerprinting". *Gene amplification* is what PCR **is**, not a use of it — the list is circular, and the WHY under it ("All four uses need many copies of one small piece of DNA") silently admits it by counting four items where the insider note counts three. | If the source book prints it, keep it but mark it: "the book's three uses (note that 'gene amplification' is PCR itself — write it because the book does)". Otherwise replace with a genuine third use, e.g. gene expression studies or prenatal/pathogen diagnosis, and keep the disease-detection line as the fourth. |

Cards with **no** defect found: `bpp_exo_vs_endonucleases`, `bpp_palindromic_sequence`,
`bpp_recombinant_dna`, `bpp_visualise_dna_on_gel`, `en_feedback_inhibition`,
`en_michaelis_constant`, `mbi_capping_and_tailing`, `mbi_codon_aug`,
`mbi_complementary_and_mrna`, `mbi_dna_polymerase_function`, `mbi_exons_and_introns`.

Two cards deserve positive mention for *catching* their source book's errors rather than
propagating them — `bpp_ecori` ("The guide's VSAQ answer is wrong here", on GAA vs GAATTC),
`mbi_complementary_and_mrna` ("That is the guide's printed answer and it is wrong", on the mRNA
being copied from the coding strand). Both sequences check out: complement of
5'-AATGCAGCTATTAGG-3' is 3'-TTACGTCGATAATCC-5' ✓ and the mRNA is 5'-AAUGCAGCUAUUAGG-3' ✓.
`mbi_dna_vs_rna` s4 does the same for the "RNA is never genetic material" claim.

---

## 7. Other observations

**Formatting — clean.**
- **No markdown leaked as asterisks.** Zero `*` characters appear in any of the 240 replies.
- **No internal step-ids spoken to the student.** Zero occurrences of `s1_`, `s2_what`,
  `s9_diagram` etc. in reply text. Vidi consistently says "step 2", "the last step", or the human
  label ("How it cuts", "Where they come from"). This is a notable pass — the step ids are in every
  ask header, and none leaked.
- One reply uses trailing-double-space line breaks (`en_types_of_cofactors` · skiplast), which
  render as four separate lines. Harmless but inconsistent with the blank-line paragraphs everywhere
  else.

**One truncation.**
`ts_ipe_b2_bpp_laq_rdna_processes` · telugu is flagged `_flags: !TRUNCATED_` and stops mid-word at
step 6 of 8 — "…తరువాత heat shock, microinjection **లేద**". The student loses steps 6, 7 and 8
(3 of the 8 marks) with no indication anything is missing. Scored 2 (everything present is correct),
but it is the longest reply in the slice and the only one cut off; the Telugu path on 8-mark LAQs
needs either a higher cap or an instruction to compress.

**Length — bimodal, and the wrong way round on `[why]`.**
- `[explain]` runs 3–5 paragraphs consistently, which suits the ask ("i am seeing it for the first
  time"). Reasonable.
- `[marks]`, `[skiplast]`, `[whystep]` are tight — usually 2–5 sentences. Good.
- `[why]` swings from four full paragraphs (`bpp_ecori`, `bpp_pcr`) to a two-line refusal on the
  five failures in §3a. The same ask should not produce a 250-word explanation on one card and
  "I don't have that question open" on the next.
- `[telugu]` swings from 5 paragraphs (`mbi_dna_vs_rna`) to 3 lines (`bpp_molecular_scissors`)
  with no relation to the card's mark weight — the 8-mark `bpp_laq_rdna_tools` Telugu reply is
  shorter than the 2-mark `mbi_base_percentages` one.

**Idiom and metaphor — mostly inherited from the cards, not invented.**
The cards' own REMEMBER fields carry the register violations: "It does not take the seat; **it bends
the chair**" (`en_enzyme_inhibitors` s3), "The product **feeds back and shuts the tap**"
(`en_feedback_inhibition`), "A cap goes on the **head**" (`mbi_capping_and_tailing`), "**Scissors
cut, glue joins**", "An **empty** tRNA has nothing to give". Vidi echoed these only twice
(`en_charging_of_trna` · whystep quotes "an empty tRNA has nothing to give"; `bpp_laq_rdna_tools` ·
explain repeats "molecular glue"/"molecular scissors", which are the card's own terms). It invented
one of its own — "polymerase enzymes… are like **molecular photocopiers**"
(`bpp_laq_rdna_tools` · explain) — and one personification, "why a plant does something"
(`bpp_laq_rdna_tools` · why). Under the plain-language law these belong in the cards' fix list, not
Vidi's.

**Mark arithmetic on uneven splits — a strength.**
The two 8-mark LAQs are the hardest cards in the slice and Vidi got every number right on both:
the eight × 1M structure, the 0M diagram, the 1/2/1/1/2/1 split, the 7-mark remainder, and the
"do not merge two steps to save time" insider point (relayed correctly in `bpp_laq_rdna_processes` ·
mistakes as "merging two steps into one… costs you a whole mark").

**Line-count advice — the weakest habit.**
Four of the six sub-3 `[marks]` replies are line-count drift against the cards' explicit NOTE
counts: `bpp_visualise_dna_on_gel` says "about four lines total" where the NOTEs imply nine;
`en_charging_of_trna` says "about six lines total" where step 1 alone is six;
`bpp_recombinant_dna` says "one or two lines" for a step the NOTE calls four lines. Where the card
does give counts, Vidi is exact and impressive — `bpp_downstream_processing` computes
5 + 6 = "about 11 lines total", and `mbi_base_percentages` computes 3 + 5 = "about eight lines
total". The failure mode is guessing a count when only one step carries a NOTE number, not
misreading one that is printed.

**`[remember]` bleed.**
Two `[remember]` replies open on the *other* step's content before circling back to the step named
in the ask: `mbi_complementary_and_mrna` · `s1_complement` opens "the mRNA is a copy of the coding
strand" (step 2's point) before covering the complement; `bpp_downstream_processing` · `s1_define`
closes with "the whole answer fits in one line", which sits badly beside its own `[marks]` reply's
"about 11 lines". Neither is a WRONG-STEP under the §4 definition (that flag covers whystep and
skiplast only), but both are the same drift.
