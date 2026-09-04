# VIDI-Z2-02 — Vidi chatbot audit, Zoology-II slice 2 of 6

Source: `.answerbook_logs/audit_ts_ipe_z2.slice-02.md` — 25 cards × 10 asks = 250 replies.
Graded blind against the ANSWER FACTS shown above each group, never against outside biology.
Chapters covered: Applied Biology (6 cards), Breathing and Exchange of Gases (11), Body Fluids and
Circulation (8).

---

## 1. Per-template table

| template | mean | 0 | 1 | 2 | 3 | N |
|---|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 25 | 25 |
| whystep | 3.000 | 0 | 0 | 0 | 25 | 25 |
| remember | 2.920 | 0 | 0 | 2 | 23 | 25 |
| explain | 2.880 | 0 | 1 | 1 | 23 | 25 |
| mistakes | 3.000 | 0 | 0 | 0 | 25 | 25 |
| important | 2.920 | 0 | 0 | 2 | 23 | 25 |
| skiplast | 2.960 | 0 | 0 | 1 | 24 | 25 |
| why | 2.920 | 0 | 0 | 2 | 23 | 25 |
| outofbank | 2.920 | 0 | 0 | 2 | 23 | 25 |
| telugu | 2.880 | 0 | 0 | 3 | 22 | 25 |

## 2. Overall

- **Overall mean: 2.940** (735 points / 250 replies)
- **Total replies graded: 250** (25 cards × 10 templates, all present — verified mechanically)
- **Guard replies excluded: 0.** No "I could not answer just now" / "Give me a short moment" reply
  appears anywhere in the slice. The rate limiter did not fire once in 250 asks.
- Score distribution: 236 at 3 · 13 at 2 · 1 at 1 · **0 at 0**.

## 3. Every reply scored 0 or 1

Only one reply in the slice fell below 2.

**`ts_ipe_z2_beg_respiratory_disorders` · [explain] · score 1**

> "Pneumonia is an infection of the lungs by Streptococcus pneumoniae, causing fluid in the alveoli.
> Occupational disorders come from dust exposure at work, and you must name the disease with its
> industry, like asbestosis for asbestos workers and silicosis for miners. **Each of these five earns
> one mark, so covering all of them gives you the full four marks.**"

Why, against the ANSWER FACTS: the MARK SPLIT is four 1M cells — *Asthma 1M · Bronchitis and
emphysema 1M · Pneumonia 1M · Occupational disorders 1M*. Bronchitis and emphysema **share** one
mark. "Each of these five earns one mark ... gives you the full four marks" is arithmetically
self-contradictory and not derivable from the split; a student takes away that emphysema is
separately worth a mark and that five separate 1M cells add to 4. The rest of the reply is accurate.
Note this is largely the card's fault — see CARD DEFECTS row 2.

Everything else scored 2 or 3. The thirteen 2s, for the record (none of them wrong, all of them
padded, thin, or mis-focused):

- `beg_respiration_up_a_hill` [remember] on s1_po2 — opens with s2's content ("two things rise
  together") and only reaches s1's fall in pO₂ in the last line.
- `beg_respiratory_disorders` [remember] on s1_asthma — walks all four steps at length for a
  one-step ask.
- `abio_types_of_cancers` [explain] — opens "a list of six types, and each one is named by the
  tissue it starts in", which is false for familial/sporadic; self-corrects at the end (card defect
  row 3 is the cause).
- `abio_vaccine` [skiplast] — correct, then a confusing trailing hedge ("The book does not list an
  official total beyond this split").
- `bfc_av_valves` [important] — opens "Yes, this question is..." to an "is it important?" ask, then
  states 1 star / not asked often. The affirmative opener contradicts the rank it reports.
- `bfc_cardiac_cycle_output` [important] — "This question is important because it is a 2-mark VSAQ
  in Section A"; being a 2-mark VSAQ is not a reason for importance, and the 1-star rank follows in
  the next sentence.
- `bfc_cardiac_cycle_output` [why] — answers only for the cardiac cycle, never touches cardiac
  output, and the closing reason ("the number matters because it shows the heart works continuously")
  is not in the facts.
- `bfc_laq_heart_working` [why] — covers the SAN and one-way flow only; eight marked sub-parts, two
  addressed.
- `beg_inspiration_expiration` [outofbank] — refuses correctly, then volunteers the open card's
  2-star rank and TS 2022/2015 exam years (scope creep, §4).
- `bfc_san_pacemaker` [outofbank] — refuses correctly, then volunteers that the open card is "a good
  quick 2-mark answer" (marginal scope creep, §4).
- `beg_occupational_disorders` [telugu] — content correct, but markdown `**bold**` leaks around
  `**Asbestosis**` and `**Black lung disease**`.
- `beg_respiratory_disorders` [telugu] — lists five disorder names, then "4 marks, 1 mark per part";
  same five-vs-four ambiguity as the [explain], though the numbers it states are derivable.
- `bfc_laq_heart_working` [telugu] — stops after phases 1–2 of an 8-mark card; correct as far as it
  goes, but leaves cardiac output and double circulation unmentioned.

## 4. The four explicit counts

### WRONG-STEP — **0 of 50**
All 25 [whystep] and all 25 [skiplast] replies address exactly the step named in the header, and
price it at exactly the mark its cell carries. Checked pair by pair, including the two LAQ cards
where the step id is one of eight (`s5_ventricles`, `s8_figure`, `s5_heart_sounds`,
`s8_double_circulation`). Offending question_ids: none.

### OUT-OF-BANK ANSWERED — **0 of 25**
No [outofbank] reply describes, outlines, or hints at the cockroach digestive system. Every one of
the 25 declines and points to the catalog. Offending question_ids: none.

### SCOPE-CREEP — **2 of 25**
- `ts_ipe_z2_beg_inspiration_expiration` — "...let us focus on the inspiration and expiration
  question in front of you, **which is a 2-star question asked in TS 2022 and 2015**." Volunteers the
  open card's star rank and exam history unasked.
- `ts_ipe_z2_bfc_san_pacemaker` — "...**this SAN one is a good quick 2-mark answer to revise**."
  Marginal: volunteers only the open card's mark value.

Nine other replies name the open card ("only the cancer types question is in front of me", "focus on
the conchae answer") without stating any of its content — correct behaviour, not counted.

### INVENTED MARK — **1 of 250**
- `ts_ipe_z2_beg_respiratory_disorders` [explain] — "Each of these five earns one mark, so covering
  all of them gives you the full four marks." Five 1M cells is not derivable from a split that has
  four.

No reply anywhere invented a total, a per-step value, or a section weight beyond this one. All
2/4/8-mark totals and every per-step 1M price quoted across the slice match the ANSWER FACTS.

## 5. Telugu

**25 of 25 [telugu] replies are in Telugu script with the biology terms kept in English (Latin
script).** Zero romanised-Telugu replies, zero all-English replies — nothing to quote under either
failure mode.

The code-mix is consistent and correct throughout: `antigen`, `antibody`, `P-R interval`,
`SA node`/`AV node`, `tomogram`, `CAT scan`, `transgenic animal`, `genome`, `carcinoma`, `sarcoma`,
`leukemia`, `lymphoma`, `liquid tumour`, `vaccine`, `chloride shift`, `bicarbonate`,
`carbonic anhydrase`, `haemoglobin`, `alveoli`, `conchae`/`turbinals`, `diaphragm`,
`external intercostal muscles`, `thoracic cavity`, `asbestosis`, `black lung disease`, `coal dust`,
`asthma`, `bronchitis`, `emphysema`, `pneumonia`, `Streptococcus pneumoniae`,
`respiratory rhythm centre`, `pneumotaxic centre`, `chemosensitive area`, `tidal volume`,
`vital capacity`, `VC = TV + ERV + IRV`, `arteries`/`veins`, `bicuspid`/`tricuspid valve`,
`cardiac cycle`, `cardiac output`, `double circulation`, `pulmonary`/`systemic circulation`,
`pericardium`, `nodal tissue`, `SAN`, `capillaries`, `sinuses`, `Annelida`, `Cephalopoda`,
`Vertebrata` all stay in Latin script; numbers and units (`0.12 to 0.2 seconds`, `500 mL`,
`0.8 seconds`, `5 litres per minute`, `3,60,000`) stay as written in the facts.

One presentation defect (not a language defect): `ts_ipe_z2_beg_occupational_disorders` [telugu]
carries raw markdown — `మొదటిది **Asbestosis** —` and `రెండవది **Black lung disease** —`.

## 6. CARD DEFECTS

The card's fault, not the model's. Ordered by how much damage each does.

| # | question_id | field | what is wrong | what it should say |
|---|---|---|---|---|
| 1 | `ts_ipe_z2_bfc_open_vs_closed_circulation` | s1 WRITE (examples) vs s2 WRITE (examples) | **Direct self-contradiction.** s1 lists *leeches* as an OPEN-circulation example; s2 lists *Annelida* as a CLOSED-circulation example. Leeches are annelids. The card gives no note reconciling this, and s2's MISTAKES line warns only about arthropods. Every model reply faithfully reproduced both lists side by side, so a student writing "Annelida — closed" and "leeches — open" in the same 2-mark answer looks self-contradictory to an examiner. | Either drop *leeches* from the open list, or keep it and add the reconciling note the biology needs: "Hirudinea (leeches) are the annelid exception — they have an open-type haemocoelic system, while other Annelida are closed." |
| 2 | `ts_ipe_z2_beg_respiratory_disorders` | insider note + s1 WRITE vs MARK SPLIT | **"Five groups, four marks."** The MARK SPLIT has four 1M cells (bronchitis and emphysema share one), but the insider note says "Name all five groups first" and s1's WRITE lists five. Nothing anywhere says the two share a cell. This is the direct cause of the slice's only 1-scored reply. | "Five named disorders, grouped into four mark cells — bronchitis and emphysema are marked together as one. Name all five; the marks are four." |
| 3 | `ts_ipe_z2_abio_types_of_cancers` | insider note | "Cancers are named by the tissue they start in. Give the tissue beside **every** name and the answer almost writes itself." This contradicts the card's own s4 WHY, which says familial and sporadic "are not named by tissue but by whether the risk was inherited". The model's [explain] opened with the false generalisation before self-correcting. | "The first four are named by the tissue they start in — give the tissue beside each. The last two, familial and sporadic, are named by family history instead, and cut across the other four." |
| 4 | `ts_ipe_z2_beg_respiratory_regulation` | s4_receptors MISTAKES | "Leaving out the role of oxygen here. These receptors also watch it." No WRITE, EARNS or REMEMBER line for s4 mentions oxygen, and s3's REMEMBER says the opposite ("Carbon dioxide, not oxygen, is what the brain measures"). The mistake line is therefore unusable — all ten replies correctly followed the WRITE line and dropped oxygen, so the card is flagging as a mistake something it never lets the student write. | Either add it to the WRITE line ("...and to a fall in O₂ in the blood") or delete the mistake line. As written it is a trap with no exit. |
| 5 | `ts_ipe_z2_abio_tomogram` | s1 WRITE + REMEMBER + MISTAKES | "A tomogram is a **3-D cross sectional** picture" is self-contradictory — a cross-section is a slice, i.e. two-dimensional — and the MISTAKES line then forbids the student from calling it two-dimensional at all. The confusion propagated into the model's [explain], [why] and [telugu] replies verbatim. | "A tomogram is a cross-sectional image of a body part produced by a CAT scan, which combines several X-ray beams taken from different angles; a stack of such slices can be built into a three-dimensional view." Rewrite the mistake as "Calling it an ordinary flat X-ray shadow — it is a computed slice." |
| 6 | `ts_ipe_z2_beg_inspiration_expiration` | s2_insp_volume WRITE | "The external intercostal muscles contract and **raise the ribs sideways**. This increases the thoracic volume in the **dorso-ventral** axis." Sideways is the transverse axis; the dorso-ventral increase comes from the ribs and sternum being lifted up and forward. The two halves of the sentence name different axes. | "The external intercostal muscles contract and lift the ribs and sternum upward and forward. This increases the thoracic volume in the dorso-ventral axis." (NCERT wording.) |
| 7 | `ts_ipe_z2_abio_transgenic_animal` | s2 WRITE vs step label + MISTAKES | The step is labelled "An example" and its MISTAKES line prices "Naming a naturally occurring **animal**" — so the mark is for an animal — but the WRITE line names only a protein and a disease ("α-1 antitrypsin treats emphysema"). A student copying the WRITE line names no animal at all. The model had to paper over the gap ("α-1 antitrypsin, a human protein made by a transgenic animal"). | "Example: a transgenic sheep that produces human α-1 antitrypsin, used to treat emphysema." |
| 8 | `ts_ipe_z2_bfc_av_valves` | s1 WHY + s2 WHY | Invented causal claim: "The left valve has two flaps **because** the thick left ventricle needs a smaller, stronger opening to hold against high pressure" / "Three flaps close the wider right opening, where the pressure ... is lower." Cusp count is not caused by ventricular pressure; this is an exam-hall rationalisation with no textbook behind it. It fed the model's [why] reply straight through ("A two-flap bicuspid valve closes more strongly..."), which a teacher would mark wrong. | State the fact without the false cause: "The left AV aperture is guarded by the two-cusped bicuspid (mitral) valve, the right by the three-cusped tricuspid. The cusp count is simply how each valve is built — do not tie it to the pressure." |
| 9 | `ts_ipe_z2_bfc_laq_heart_working` | s5_heart_sounds step label vs WRITE | The step is labelled and marked as "The heart sounds" (plural), but its WRITE body contains only the first sound, 'lub'; 'dup' appears in s6 (Cardiac diastole). The step's own MISTAKES and REMEMBER lines teach both sounds. A student writing exactly what s5's WRITE says delivers half of what the mark cell is named for. | Either move the 'dup' sentence into s5 and rename s6 to "Cardiac diastole (relaxation and refilling)", or rename s5 to "First heart sound and the semilunar valves opening" so the label matches its body. |
| 10 | `ts_ipe_z2_bfc_laq_heart_structure` | insider note | "Eight marks, eight headings. Write the **four** parts as numbered headings first — an examiner marking a wall of prose cannot find the **seven** points, and the diagram carries the eighth mark." Four / seven / eight in three consecutive clauses, with no statement that the fourth part (internal structure) is what expands into four of the mark cells. The model's [telugu] reply reproduced the muddle, telling the student to write eight sections and then to write four headings. | "Eight marks, eight cells. The heart has four parts; the fourth, internal structure, splits into atria, ventricles, nodal tissue and aortic arches — that makes seven written cells. The labelled diagram carries the eighth." |
| 11 | `ts_ipe_z2_beg_co2_transport` | s1 + s2 WRITE ("About 7% as carbonic acid") | The 7% share is CO₂ carried **dissolved in the plasma**; only a very small part of that dissolved gas actually exists as carbonic acid. Naming the whole 7% "as carbonic acid" also collides with s4, where carbonic acid is the intermediate on the 70% bicarbonate route — so the card uses the same compound as the label for the smallest route and as a step inside the largest. | "About 7% is carried dissolved in the plasma (a small part of it as carbonic acid)." Keep the 7 / 20–25 / 70 figures — those are correct and are what the mark cell prices. |
| 12 | `ts_ipe_z2_bfc_laq_heart_structure` | s7_aortic_arches WRITE | "There are **two aortic arches** in man." Standard anatomy gives one aortic arch; the pulmonary trunk is not an aortic arch. The model repeated the claim in its [explain] and [why]. **This may be deliberate Telangana-board terminology** (systemic arch / pulmonary arch, from the embryonic aortic arches) — verify with a board teacher before changing, since the mark cell is literally named "Aortic arches". | If the board wants the term, keep it but tag it: "The two great vessels leaving the heart — the board calls these the two aortic arches — are the pulmonary arch and the systemic arch." If not, rename the cell "Great vessels leaving the heart". |
| 13 | `ts_ipe_z2_beg_conchae` | s1 WRITE vs s1 MISTAKES | WRITE says "**three** spirally twisted bones in the ... nasal chamber" (reading as three in total); MISTAKES says "Giving no number. There are three **on each side**." The model's [explain] printed both sentences one after the other. | Make the WRITE line carry it: "Conchae, also called turbinals, are three spirally twisted bones on each side of the respiratory part of the nasal chamber." Then delete the clarification from MISTAKES. |
| 14 | `ts_ipe_z2_abio_prolonged_pr_interval` | s2 WRITE vs s1 WHY | s1's WHY says the P-R interval "measures how long the signal takes to travel **from the atria to the ventricles**", but s2 prices the answer as "delay **from SA node to AV node**" and MISTAKES locks it in ("Naming the wrong nodes"). The interval spans SAN firing through to ventricular depolarisation, and the delay that prolongs it sits **at** the AV node, not on the way to it. The model's [why] quietly corrected the card ("usually at the AV node"). | "A long P-R means the impulse is delayed in reaching the ventricles, most often at the AV node." Keep both node names as accepted marking words, but stop asserting the delay is only on the SAN→AVN leg. |
| 15 | `ts_ipe_z2_beg_respiratory_disorders` | s3_pneumonia WRITE | "Viruses, fungi, protozoans and mycoplasmas also cause **further infection**" is garbled — they are alternative causal organisms, not a secondary infection on top of the first. | "Viruses, fungi, protozoans and mycoplasmas can also cause pneumonia." |

## 7. Other observations

**Length.** Median reply 65.5 words; the whole slice sits in a sensible band. Longest is
`bfc_laq_heart_structure` [explain] at 286 words for an 8-mark LAQ with eight mark cells —
proportionate, not padding. The shortest are the [outofbank] declines (27 words) and
`beg_conchae` [remember] / [telugu] (31 / 30 words), all appropriately terse. No reply was
short enough to be unhelpful and none was long enough to bury its own answer.

**Mechanical flags — one right, one wrong.**
- `MARKDOWN:**bold**` on `beg_occupational_disorders` [telugu] is a **true positive**: raw `**` reaches
  the student around `**Asbestosis**` and `**Black lung disease**`.
- `OVER_BUDGET(166w/150)` on `bfc_laq_heart_structure` [why] is a **false positive worth fixing**:
  the regex applies a flat 150-word budget regardless of the card's mark value. 166 words answering
  "why" across eight marked sub-parts of an 8-mark LAQ is the right length. Scale the budget by
  section — e.g. ~90 w for a 2-mark VSAQ, ~150 for a 4-mark SAQ, ~250 for an 8-mark LAQ — or the flag
  will keep firing on exactly the answers that deserve their length.
- **The markdown regex missed one.** `abio_prolonged_pr_interval` [whystep] contains
  `what a prolonged P-R interval *indicates*` — single-asterisk italics, unflagged. Extend the
  pattern from `\*\*` to a bare `\*`.

**Internal step-ids.** Clean — **zero** occurrences of `s1_what`, `s2_why`, `s4_familial_sporadic`
or any other raw id in the 250 replies. Vidi consistently says "step 2", "the last step", "the
Secondary antibodies step", "the diagram step". This is working as intended and needs no action.

**Idioms and register.** Mostly plain, but a handful of figurative phrases slipped through and are
worth a sweep against the plain-language rule:
- `beg_respiratory_disorders` [why] — "each disorder attacks a different part of the breathing
  **machinery**"; "air **struggles** to move in and out".
- `beg_co2_transport` [skiplast] — "the enzyme carbonic anhydrase, which are **the heart of** the
  bicarbonate route"; [whystep] — "it does not **fight with** oxygen for the same spot".
- `beg_tidal_volume` [mistakes] — "the **big trap** is stopping at the value per minute".
- `beg_chloride_shift` [whystep] — "the examiner **wants** you to say why".
- `bfc_arteries_more_elastic` [whystep] — "the answer **feels incomplete**".
- "the whole point" appears in three replies (antibodies, pr_interval, respiratory_regulation).
None of these mislead, and none cost a grade — but for a Class-12 reader with English as a second
language, "the heart of the route", "the big trap" and "machinery" are all replaceable with the
literal word.

**Two recurring soft patterns worth a prompt tweak.**
1. **The [important] "Yes" reflex.** On two 1-star cards (`bfc_av_valves`, `bfc_cardiac_cycle_output`)
   the reply opens affirmatively — "Yes, this question is..." / "This question is important
   because it is a 2-mark VSAQ" — and only then reports the low star rank. The star line and the
   verdict line should agree from the first word. Handling of the star/Asked distinction was
   otherwise flawless: all nine 0-star cards correctly said "the book records no exam years for it"
   rather than "it was never asked", exactly as the facts instruct.
2. **[remember] drifting off its named step.** Twice (`beg_respiration_up_a_hill` s1_po2,
   `beg_respiratory_disorders` s1_asthma) the tips answer starts on a different step's content. The
   [whystep] and [skiplast] templates never drift — they are anchored by an explicit step header, and
   [remember] gets the same header. Worth mirroring [whystep]'s step-anchoring instruction into the
   [remember] prompt.

**What is working.** [marks], [whystep], [mistakes] and [skiplast] are clean at 3.000 / 3.000 /
3.000 / 2.960 across 100 replies — every mark value, every step attribution, every mistake quoted
back correctly from the card. The out-of-bank refusal is solid: 25 for 25 declined, none answered,
and the two scope-creep cases leak only metadata, never the cockroach content. The Telugu code-mix
is the strongest single behaviour in the slice: 25 for 25 in Telugu script with the biology in
English, no transliteration anywhere.
