# VIDI-Z2-06 — Vidi chatbot audit, Zoology-II slice 6 of 6

Source: `.answerbook_logs/audit_ts_ipe_z2.slice-06.md` — 22 cards x 10 asks = 220 replies.
Graded blind against the ANSWER FACTS shown above each card, never against outside biology.

Cards in this slice: `ncc_cranial_meninges`, `ncc_organ_of_corti`, `ncc_retina_account`,
`ncc_spinal_cord_ts_diagram`, `ncc_sympathetic_thoracolumbar`, `ncc_synaptic_transmission`,
`oev_atavism`, `oev_biogenetic_law`, `oev_connecting_links`, `oev_disprove_lamarck`,
`oev_genetic_drift_founder_effect`, `oev_genetic_load`, `oev_homologous_vs_analogous`,
`oev_mutation_theory`, `oev_natural_selection_melanism`, `oev_neo_darwinism`, `oev_panspermia`,
`rh_amniocentesis`, `rh_lactational_amenorrhea`, `rh_mtp_legalised`, `rh_population_explosion`,
`rh_prevent_stds` (all prefixed `ts_ipe_z2_`).

---

## 1. Per-template table

| template   | mean  | 0 | 1 | 2 | 3  | N  |
|------------|-------|---|---|---|----|----|
| marks      | 2.909 | 0 | 0 | 2 | 20 | 22 |
| whystep    | 3.000 | 0 | 0 | 0 | 22 | 22 |
| remember   | 2.909 | 0 | 1 | 0 | 21 | 22 |
| explain    | 3.000 | 0 | 0 | 0 | 22 | 22 |
| mistakes   | 3.000 | 0 | 0 | 0 | 22 | 22 |
| important  | 2.955 | 0 | 0 | 1 | 21 | 22 |
| skiplast   | 2.955 | 0 | 0 | 1 | 21 | 22 |
| why        | 2.864 | 0 | 0 | 3 | 19 | 22 |
| outofbank  | 2.727 | 0 | 0 | 6 | 16 | 22 |
| telugu     | 2.727 | 0 | 2 | 2 | 18 | 22 |

Weakest templates: `outofbank` (2.727, all six losses are scope-creep, never a wrong answer) and
`telugu` (2.727, the only two substantive errors in the slice both land here).
`whystep`, `explain`, `mistakes` are clean sweeps at 3.000.

## 2. Overall

- **Overall mean: 2.905** (score sum 639 / 220).
- **Total replies graded: 220.**
- **Guard replies excluded: 0.** No "I could not answer just now" / "Give me a short moment"
  reply appears anywhere in this slice — the rate limiter never fired.
- Grade counts across the slice: **0 x zero · 3 x one · 15 x two · 202 x three**.
- Mechanical flags present: 2 (`OVER_BUDGET(168w/150)` on `oev_genetic_drift_founder_effect`
  [why]; `OVER_BUDGET(92w/90)` on `rh_prevent_stds` [outofbank]). Both flags are correct —
  each is genuinely padded — and each cost the reply a point.

## 3. Every reply scored 0 or 1

No reply in this slice scored **0**. Three scored **1**.

### 3.1 `ts_ipe_z2_rh_mtp_legalised` · [remember] · step `s1_what` · **1**

> The important step is to remember only three reasons: unwanted pregnancy, rape, and danger to
> the mother. These three cases are the complete answer, and each one is a separate point the
> examiner looks for. So when you revise, just repeat those three words in order, and the full
> form "Medical Termination of Pregnancy" comes first automatically.

Against the facts: the open step is `s1_what`, whose entire content is the full form
("MTP means Medical Termination of Pregnancy"), whose REMEMBER line is exactly that, and which
carries its own 1M of a 2M question ("MARK SPLIT: What MTP is 1M · Why it was legalised 1M").
The reply opens by declaring the *other* step's three reasons "the complete answer" and demotes
the open step's whole content to something that "comes first automatically". A student who takes
this away writes the three reasons and drops the expansion — losing the mark the card names
first, and committing the exact mistake the card lists ("Leaving MTP as an abbreviation").

### 3.2 `ts_ipe_z2_oev_neo_darwinism` · [telugu] · **1** (also the slice's INVENTED MARK)

> ఈ ఐదింటిలో ప్రతి ఒక్కటి ఒక్కో mark కి వస్తుంది, కాబట్టి ఐదింటినీ రాయడం ముఖ్యం.
> ("each one of these five earns one mark each, so writing all five is important")

Against the facts: the MARK SPLIT is four buckets over 4 marks — "Gene and chromosomal mutations
1M · Genetic recombination 1M · Natural selection 1M · Reproductive isolation 1M". Gene mutation
and chromosomal mutation **share** one mark (step 1 is labelled "The two kinds of mutation — 1M").
There is no fifth mark anywhere in the facts. The reply tells the student five factors = five
marks on a 4-mark SAQ. Every English reply on this card got the 4-vs-5 arithmetic right; only the
Telugu one invented the fifth mark.

### 3.3 `ts_ipe_z2_oev_panspermia` · [telugu] · **1**

> సరే, ఇది చాలా సింపుల్. Panspermia అంటే ఒక theory — life మన భూమి మీద మొదలవ్వలేదు, వేరే చోట
> ఉన్నది ఇక్కడికి వచ్చింది అని చెప్పేది.
> ("Panspermia means a theory — it says life did not begin on our earth…")

Against the facts: the INSIDER POINT is unambiguous — "Panspermia is the SPORES, not the theory.
Name both", and the s1 NOTE repeats it: "Say what panspermia ARE, not only what the theory
claims." The s1 MISTAKES line names "Leaving out the word spores" as a mark-losing error. This
reply defines panspermia *as* the theory in its first sentence and never says panspermia are the
resistant spores — it mentions "resistant spores" only as the vehicle in the second paragraph.
It teaches the single misconception the card exists to prevent. All nine English replies on this
card got it right, including [mistakes] and [explain], which state it explicitly.

## 4. The four counts

### WRONG-STEP — **0 of 44**

Every one of the 22 [whystep] and 22 [skiplast] replies addressed the step actually named in the
header. Spot-checked hardest cases, all correct: `ncc_spinal_cord_ts_diagram` [skiplast]
`s2_figure` correctly prices the loss at all 4 marks and correctly says the remaining step
(`s1_regions`, 0M) leaves 0; `oev_neo_darwinism` [skiplast] `s4_isolation` correctly leaves 3;
`ncc_synaptic_transmission` [whystep] `s3_calcium` explains calcium/exocytosis and not a
neighbouring step. No offending question_ids.

### OUT-OF-BANK ANSWERED — **0 of 22**

Not one [outofbank] reply outlines, names, or hints at the cockroach digestive system. All 22
decline with the same shape ("I don't have that question open right now… you can open it from
the catalog if it is in the book"). No offending question_ids.

### SCOPE-CREEP — **6 of 22**

Correct refusal, then unprompted content from the card that *is* open:

| question_id | what it volunteered |
|---|---|
| `ts_ipe_z2_ncc_spinal_cord_ts_diagram` | "all four marks are in the drawing, so keep the grey matter butterfly inside the white matter and label at least eight parts" |
| `ts_ipe_z2_ncc_synaptic_transmission` | "the important step is to follow the impulse in order: arrive, calcium in, vesicles fuse, transmitter out, receptor binds, new potential" |
| `ts_ipe_z2_oev_mutation_theory` | "just remember the four Oenothera forms with their species names — that's where the marks are" |
| `ts_ipe_z2_oev_natural_selection_melanism` | a full paragraph of the before-and-after peppered-moth teaching point |
| `ts_ipe_z2_rh_population_explosion` | "remember to write the four numbered points and expand MMR and IMR once each" |
| `ts_ipe_z2_rh_prevent_stds` | the whole mark split plus the "single line about condoms is only half an answer" insider line (also `OVER_BUDGET(92w/90)`) |

Borderline, **not counted** (they name the open card but volunteer no answer content):
`ncc_sympathetic_thoracolumbar` ("focus on the question in front of you first — the sympathetic
division one"), `oev_atavism` ("let's finish the atavism question… since it's a quick 2-mark
one"), `oev_biogenetic_law`, `oev_disprove_lamarck`, `oev_neo_darwinism`, `rh_mtp_legalised`.
If the standard is "say nothing at all about the open card", those six would push the count to
12 of 22; on content volunteered, it is 6.

### INVENTED MARK — **1 of 220**

`ts_ipe_z2_oev_neo_darwinism` [telugu] — five factors priced at one mark each on a 4-mark
question whose split has four buckets (see §3.2).

Borderline, **not counted**: `ts_ipe_z2_oev_biogenetic_law` [telugu] — "ఒక్కో example ఇస్తే
1 mark వస్తుంది" ("each example gives 1 mark") implies per-example marking where the split pays
one mark for the example step regardless of how many examples are given; the same sentence then
correctly says the 2 marks come from the law plus the example, so the number itself is derivable
and only the distributive wording is loose. Scored 2, listed here for visibility.

## 5. Telugu

- **22 of 22** [telugu] replies are in **Telugu script**. None is romanised Telugu; none is
  all-English.
- **21 of 22** keep the biology terms in **English/Latin script** as required — e.g.
  `cranial meninges`, `Duramater`, `Arachnoid membrane`, `Piamater`, `Organ of Corti`,
  `basilar membrane`, `hair cells`, `synaptic cleft`, `exocytosis`, `Oenothera lamarckiana`,
  `divergent`/`convergent evolution`, `MMR`, `IMR`, `MTP`, `condom`.
- **1 of 22 deviates**: `ts_ipe_z2_rh_amniocentesis` transliterates the biology terms into Telugu
  script instead of leaving them English —
  > మొదటి భాగం: అమ్నియోసెంటెసిస్ అంటే ఏమిటి… శిశువు చుట్టూ ఉండే అమ్నియోటిక్ ద్రవాన్ని తీసి,
  > అందులోని పిండ కణాలను పరీక్షిస్తారు… ఉదాహరణకు డౌన్ సిండ్రోమ్ మరియు టర్నర్ సిండ్రోమ్
  (amniocentesis, amniotic, Down syndrome, Turner's syndrome all rendered in Telugu letters).
  Content correct; house style broken. Scored 2. A student copying this into an English answer
  script has to back-translate every term.
- No reply is romanised Telugu, but **one carries a romanised fragment inside otherwise-Telugu
  script**: `ts_ipe_z2_oev_biogenetic_law` opens "సరే, ఈ answer ని **simple ga** ఇలా రాయచ్చు."
  ("simple ga" in Latin letters). Cosmetic; noted, not penalised separately.
- Minor transliteration slips of non-biology English words, in otherwise clean replies:
  `rh_population_explosion` ("పాపులేషన్"), `oev_natural_selection_melanism`
  ("ఇండస్ట్రియల్ revolution").
- The two Telugu 1s (§3.2, §3.3) are the slice's only substantive errors. Both are cases where
  every English reply on the same card got the point right — the Telugu path is where the
  card's insider constraint dropped out.

## 6. CARD DEFECTS

Defects in the ANSWER FACTS themselves — the card's fault, not the model's.

| question_id | field | what is wrong | what it should say |
|---|---|---|---|
| `ts_ipe_z2_oev_neo_darwinism` | insider note + mark split | "Five named factors, four marks" is asserted but the card never says *which two share a mark*. The split's first bucket is "Gene and chromosomal mutations 1M" and step 1 is labelled "The two kinds of mutation — 1M", so the pairing exists — but only implicitly, and the insider's "five factors" framing is the last thing the model reads. This is what produced the slice's one invented mark (§3.2). | Insider: "Five named factors but only four marks — **gene mutations and chromosomal mutations share one mark**; recombination, selection and isolation take one each. Name all five, but do not expect five ticks." |
| `ts_ipe_z2_oev_panspermia` | step label vs insider note | Self-contradictory. Step 1 is titled "**What the theory says**" and the mark split's first bucket is "What the theory says 1M", while the INSIDER POINT says "Panspermia is the **SPORES, not the theory**" and the NOTE says "Say what panspermia ARE, not only what the theory claims". The step title teaches the mistake the insider forbids; the Telugu reply followed the title (§3.3). | Retitle step 1 and the split bucket "**What panspermia are** 1M", and let the WRITE line lead with the spores: "Panspermia are resistant spores… According to the panspermia theory, life might have existed elsewhere in the universe in this form." |
| `ts_ipe_z2_ncc_synaptic_transmission` | why (step 1) | "**Two neurons never touch**, so the signal has to cross a junction" is contradicted by the card's own s1 WRITE two lines later: "In an electrical synapse the membranes of the two neurons **lie very close and are electrically conductive links**." The model repeated the absolute claim ("Neurons never touch each other") in [explain]. | "The two neurons are not continuous, so the signal has to cross a junction; **at an electrical synapse the membranes lie so close that current passes directly, while at a chemical synapse a gap forces a messenger across**." |
| `ts_ipe_z2_rh_lactational_amenorrhea` | remember (step 1) | Causality inverted. "**No periods while breast feeding, so no ovulation**" makes amenorrhea the cause of anovulation. The card's own WHY has it the right way round: "Breast feeding **suppresses ovulation**, so no ovum is released to be fertilised." A student who memorises the REMEMBER line has the mechanism backwards. | "Breast feeding suppresses ovulation, **and that is why the periods stop** — no ovum, no conception." |
| `ts_ipe_z2_rh_prevent_stds` | mistake (step 1) | "Naming a vaccine. **Most STDs have none**" is listed as a student *mistake*. Hepatitis B and HPV vaccination are real, correct STD-prevention measures; a student is being warned off a right answer. The hedge "most" does not rescue the instruction, which reads as "do not write a vaccine". | "Naming a vaccine **as the general answer** — most STDs have none, so a vaccine cannot be your main measure (**hepatitis B and HPV are the exceptions**)." |
| `ts_ipe_z2_rh_mtp_legalised` | insider note | "The three reasons that follow are **the answer**, and **each is a separate tick**" — but the three reasons sit inside a single 1M bucket ("Why it was legalised 1M"), and the *other* half of the question is the full form. Calling three sub-points "separate ticks" inside one mark, and calling them "the answer", is what pulled the [remember] reply into scoring 1 (§3.1). | "Expand MTP in the first line — that is a mark on its own. The three reasons **together** earn the second mark; give all three, but they are one mark, not three." |
| `ts_ipe_z2_ncc_spinal_cord_ts_diagram` | step 2 label list | The label string reads "Dorsal root · **ganglion** · Spinal nerve · Ventral root" — a stray lowercase "ganglion" that reads as a free-floating twelfth label rather than part of "dorsal root ganglion". [explain] reproduced it verbatim as "Dorsal root, ganglion, Spinal nerve", which a student will copy onto the drawing as an unattached label. | "…Dorsal root · **Dorsal root ganglion** · Spinal nerve · Ventral root" |
| `ts_ipe_z2_rh_population_explosion` | mark split label | The second bucket is named "**Falling death rates** 1M", but step 1's own WRITE already contains "2. Decline in the death rate", so the bucket name overlaps the *first* mark's content. The step-2 EARNS line ("MMR and IMR") is what actually prices it. | Rename the bucket "**MMR and IMR 1M**", matching the EARNS line and the insider's "Name MMR and IMR". |
| `ts_ipe_z2_oev_genetic_load` | mark split label vs EARNS | Split bucket says "**Definition and example** 1M" but step 1's EARNS line says only "Definition" — while that step's MISTAKES list includes "Giving no example". A reply asked to price the example alone has two conflicting anchors. | EARNS: "**Definition and example**" — consistent with the bucket, so the example is visibly inside the first mark, not a third one. |
| `ts_ipe_z2_oev_homologous_vs_analogous` | mark split label | Bucket 4 is "**Examples** of analogous organs 1M" (plural), but the model answer gives exactly one example pair and the NOTE says "**One example** and the closing rule." The plural nudged [marks] into telling the student "give two examples for each type" (scored 2) — extra writing for no extra mark on an 8-minute answer. | "**Example** of analogous organs 1M", matching the NOTE. |
| `ts_ipe_z2_ncc_cranial_meninges` | step 2 label | The label "**What each is like**" is a sentence fragment that breaks when quoted inline. [marks] ended on "…just name all three in order and say each one is like" — a broken sentence a student cannot parse (scored 2). | "**A short description of each** — 1M" (a noun phrase that survives being quoted mid-sentence). |

Not defects, checked and clean: the STARS-vs-Asked separation is honoured on every card
(`oev_disprove_lamarck` correctly carries the "no Asked line" instruction and the model obeyed
it); the two "asked eight times" insider claims (`oev_homologous_vs_analogous` 4M and
`rh_amniocentesis` 2M) both count to exactly 8 in their Asked lines and do not contradict each
other or the 7-appearance `oev_natural_selection_melanism`; `oev_disprove_lamarck`'s
ear-piercing example is phrased culture-neutrally ("in many communities").

## 7. Other observations

**Length.** Only 2 of 220 tripped the word budget, and both are genuinely padded rather than
wrong — `oev_genetic_drift_founder_effect` [why] (168w/150) spends a whole paragraph on
large-vs-small-population statistics that the facts never raise, and `rh_prevent_stds`
[outofbank] (92w/90) is over budget *because* of its scope creep. The unflagged replies are
well-calibrated: VSAQ [marks] answers run 40-70 words, SAQ [explain] answers 150-220, and the
short asks stay short (`rh_lactational_amenorrhea` [marks] is 34 words and complete).

**Markdown leakage.** None. No `**bold**`, no bullet asterisks, no heading marks anywhere in the
220 replies. Five replies use hard line breaks (trailing double-space) inside a paragraph —
`ncc_spinal_cord_ts_diagram` [remember], `oev_disprove_lamarck` [skiplast] — which renders as
intended.

**Internal step-ids.** None spoken. Zero occurrences of `s1_`/`s2_`-style ids in any reply. The
model consistently says "step 2" or quotes the step's human label in quotes ("What it contains",
"Salient features of the theory", "For the baby", "Detection and treatment"). Those quoted
labels are the card's own headings, which is why the two fragment-labels in §6
(`ncc_cranial_meninges` "What each is like", `rh_lactational_amenorrhea` "For the baby") surface
as slightly odd English in the replies.

**Idioms / register.** Clean overall. Occasional teacherly filler ("Okay, let's break it down
simply", "Of course", "Alright, let's walk through the whole answer together", "Best of luck with
your revision for tomorrow") — five or six instances, all harmless and none idiomatic. One
metaphor is inherited from the card and repeated faithfully: `oev_genetic_load`'s "burden" and
`oev_neo_darwinism`'s "Variation proposes, selection disposes" (the model paraphrased this one
into plain words rather than quoting it — good). `oev_genetic_drift_founder_effect` [remember]
builds its own chain mnemonic ("chance → small population → allele lost → less variation →
founder effect") using an arrow character; correct and useful, but an arrow is not a spoken form
if this text is ever voiced.

**Template-mismatch handling.** The [why] template ("why does this happen **in the body**?") is a
poor fit for the whole Organic Evolution chapter and for `ncc_sympathetic_thoracolumbar` (a
naming question). The model handled the mismatch gracefully every time rather than inventing
physiology — `oev_neo_darwinism` opens "I think you are asking about Neo-Darwinism, not about a
body process", and `ncc_sympathetic_thoracolumbar` says plainly "The name is about where the
nerves leave the spinal cord, not about what the body is doing at that moment." Worth keeping.

**The one structural weakness.** All six [outofbank] losses share one shape: a correct, complete
refusal followed by an unrequested paragraph about the open card, usually keyed off the student's
"it is in my exam tomorrow". The refusal itself never failed — 22 of 22 declined, 0 of 22
answered. If the count is to move, the fix is a stop-after-the-decline rule, not a stronger
refusal.
