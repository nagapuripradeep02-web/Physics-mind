# VIDI-B2-06 — Vidi chatbot audit, Botany-II slice 6 of 7

Source: `.answerbook_logs/audit_ts_ipe_b2.slice-06.md` — 24 cards × 10 asks = 240 replies.
Every reply graded 0–3 against the ANSWER FACTS printed above it, never against outside biology.
Nothing sampled; all 240 read.

---

## 1. Per-template table

| template | mean | 0 | 1 | 2 | 3 | N |
|---|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 24 | 24 |
| whystep | 3.000 | 0 | 0 | 0 | 24 | 24 |
| remember | 2.875 | 0 | 0 | 3 | 21 | 24 |
| explain | 3.000 | 0 | 0 | 0 | 24 | 24 |
| mistakes | 3.000 | 0 | 0 | 0 | 24 | 24 |
| important | 2.958 | 0 | 0 | 1 | 23 | 24 |
| skiplast | 2.917 | 0 | 1 | 0 | 23 | 24 |
| why | 3.000 | 0 | 0 | 0 | 24 | 24 |
| outofbank | 2.875 | 0 | 0 | 3 | 21 | 24 |
| telugu | 2.958 | 0 | 0 | 1 | 23 | 24 |

The eight 2s and the single 1:

- `ts_ipe_b2_rp_laq_krebs_cycle` · remember — invents a memory pattern the facts do not contain ("the cycle alternates between oxidation, decarboxylation, and hydration"); the actual step types are condensation, dehydration, hydration, oxidation, decarboxylation, oxidation, cleavage, oxidation, hydration, oxidation. Harmless but not grounded, and it drifts off the named step (`s1_define`, definition + site).
- `ts_ipe_b2_sef_scp_fungi` · remember — the mnemonic is empty: "torula rhymes with 'torula'".
- `ts_ipe_b2_tp_ascent_of_sap` · remember — asked on `s1_define` (ascent of sap defined: upward, xylem, against gravity) and never gives the definition; the whole reply is the three physical properties from steps 2–3.
- `ts_ipe_b2_sef_semi_dwarf_rice` · important — correct on stars and on AP 2020, then adds "the low star rank means it is not a priority question for you", advice the facts do not support for a question the book records as asked.
- `ts_ipe_b2_piv_wrinkled_genotype` · telugu — content correct, but markdown leaks to the student as literal asterisks (`**rr**`).
- `ts_ipe_b2_rp_laq_glycolysis` · outofbank — declines correctly, then volunteers open-card content (see §4, SCOPE-CREEP).
- `ts_ipe_b2_rp_respiratory_quotient` · outofbank — same.
- `ts_ipe_b2_sef_hidden_hunger` · outofbank — same.
- `ts_ipe_b2_sef_laq_release_new_variety` · skiplast — scored 1, quoted in §3.

---

## 2. Overall

- **Overall mean: 2.958** (710 points / 240 replies)
- **Total replies graded: 240**
- **Guard replies excluded: 0.** No reply in this slice is a rate-limiter guard ("I could not answer just now…" / "Give me a short moment…"). All 240 are real answers.

---

## 3. Every reply scored 0 or 1

No reply scored 0. One reply scored 1.

**`ts_ipe_b2_sef_laq_release_new_variety` · [skiplast] · step `s6_release`**

> If you skip the last step, "Testing, release and commercialisation," you lose the 1 mark it earns. The minimum you must write is the other four steps: Collection of variability (2 marks), Evaluation and selection of parents (1 mark), Cross hybridisation (1 mark), and Selection and testing of recombinants (2 marks). That still gives you 6 marks from the book's split. Just remember the order ends with release, so skipping it leaves the answer incomplete.

Why it is wrong against the ANSWER FACTS: the MARK SPLIT is `The five steps 1M · Collection of variability 2M · Evaluation and selection of parents 1M · Cross hybridisation 1M · Selection and testing of recombinants 2M · Testing, release and commercialisation 1M` = 8. Dropping `s6_release` (1M) leaves **7**, not 6 — the reply silently drops the `s1_five` heading-list mark from its tally, even though it is not the step being skipped. Every individual mark it quotes is right; only the total is invented. A student following this reply would under-write, believing the remaining answer caps at 6 of 8. (Card-side cause: §6 row 3.)

---

## 4. The four explicit counts

**WRONG-STEP — 0 of 48.**
All 24 `[whystep]` replies explain the step named in the header, and all 24 `[skiplast]` replies price the step named in the header. Verified step by step (s2_use, s3_design, s2_sig, s2_why, s4_phase1, s4_steps2, s3_example, s2_examples, s2_why, s2_why, s4_hybridisation, s5_organogenesis, s2_somaclones, s2_scp, s2_why, s2_contributed, s2_explant, s2_reason, s2_achieved, s2_close, s2_symplast, s3_pull, s2_pull, s2_number for whystep; the matching last steps for skiplast). No offending question_ids.

*(Off-step drift does occur in `[remember]`, which is outside this count: `ts_ipe_b2_tp_ascent_of_sap` answers steps 2–3 when asked on `s1_define`, and `ts_ipe_b2_rp_laq_krebs_cycle` answers the whole cycle when asked on `s1_define`. Several others — `ts_ipe_b2_piv_test_cross_name_and_use`, `ts_ipe_b2_piv_wrinkled_genotype`, `ts_ipe_b2_rp_respiratory_quotient`, `ts_ipe_b2_sef_hidden_hunger`, `ts_ipe_b2_sef_semi_dwarf_rice`, `ts_ipe_b2_sef_sugarcane_species` — answer the named step and then continue into the next one.)*

**OUT-OF-BANK ANSWERED — 0 of 24.**
No `[outofbank]` reply gives, names, hints at or partially lists the stages of mitosis. All 24 decline and point to the catalog. No offending question_ids.

**SCOPE-CREEP — 3 of 24.**
- `ts_ipe_b2_rp_laq_glycolysis` — "For the glycolysis question in front of you, the important step is to answer in the order asked: what, where, end products, fate, then the ten steps. Say 'cytoplasm' for where it occurs — that is worth part of the first mark."
- `ts_ipe_b2_rp_respiratory_quotient` — "For the question that is open, RQ, the book splits the 4 marks as: definition and formula 1 mark, what the value tells you 1 mark, the worked example 1 mark, and why it never exceeds one for fats 1 mark."
- `ts_ipe_b2_sef_hidden_hunger` — "For the question in front of you, hidden hunger, the whole point is that the deficiency is real but no symptom shows yet, so that is why it is called hidden."

Borderline, not counted: `ts_ipe_b2_tp_c4_water_efficiency` ends "focus on the C4 efficiency question in front of you, which is a 2-mark VSAQ" — metadata already on the student's screen, not answer content. Fourteen other `[outofbank]` replies name the open card ("I only have the wheat varieties question in front of me") without volunteering any of it; that is orientation, not creep.

**INVENTED MARK — 1 of 240.**
- `ts_ipe_b2_sef_laq_release_new_variety` · [skiplast] — "That still gives you 6 marks from the book's split." The split yields 7. Quoted in full in §3.

Every other mark statement in the slice was extracted and checked against its card's MARK SPLIT (79 sentences across all ten templates): all derivable. Notably correct: glycolysis skiplast "the remaining 7 marks"; krebs skiplast "together earn 6 marks" and krebs marks "8 marks in total, split as 1, 1, 2, 2, and 2"; tissue_culture skiplast "steps 1 through 6, which earn 6 marks total"; test_cross skiplast "0 marks … That still earns you the full 4 marks"; ascent_of_sap skiplast "steps 1, 2, and 3 … earn 3 marks".

*The mechanical `MARK_SUM:6` flag on `ts_ipe_b2_sef_laq_tissue_culture` · [marks] is a false positive:* "The book splits it as 6 marks for the six technique steps and 2 marks for the advantages" is exactly the card's six 1M steps plus the 2M advantages = 8. The regex saw a "6 marks" on an 8-mark card. The one genuinely wrong total, on `release_new_variety`, carries **no** flag — the regex missed it.

---

## 5. Telugu

**24 of 24 `[telugu]` replies are in Telugu script with the biology terms left in English.** Measured: every reply is 46–88% Telugu characters, with the technical vocabulary (test cross, genotype, homozygous, heterozygous, glycolysis, cytoplasm, pyruvic acid, Krebs cycle, matrix, NADH, FADH2, RQ, carbohydrates, fats, organic acids, biofortification, germplasm collection, allele, breeding programme, tissue culture, explant, callus, totipotency, somaclones, micropropagation, apoplast, symplast, plasmodesmata, membrane, cohesion, adhesion, transpiration pull, xylem, guard cells, turgor, water potential, ABA, K+, C3/C4, Candida utilis, Saccharomyces cerevisiae, Jaya, Ratna, Sonalika, Kalyan Sona, Saccharum barberi, Saccharum officinarum, Atlas 66, golden rice) carried in Latin script.

**None are romanised Telugu. None are all-English.** Nothing to quote under either failure.

Two notes worth carrying forward, neither a failure of the ask:
- Two replies transliterate a technical term into Telugu script instead of leaving it Latin, against the pattern of the other 22: `ts_ipe_b2_piv_test_cross` opens "సరే, **టెస్ట్ క్రాస్** అంటే…" and `ts_ipe_b2_sef_biofortification` opens "**బయోఫోర్టిఫికేషన్** అంటే…". Both also use the Latin form elsewhere in the same reply.
- `ts_ipe_b2_sef_micropropagation_somaclones` writes "చాలా **మంది** plants" — `మంది` is the Telugu counter for people, not plants; it should be "చాలా మొక్కలు" or "చాలా plants".

---

## 6. CARD DEFECTS

Defects in the ANSWER FACTS themselves — the card's fault, not the model's.

| # | question_id | field | what is wrong | what it should say |
|---|---|---|---|---|
| 1 | `ts_ipe_b2_rp_laq_krebs_cycle` (also `ts_ipe_b2_rp_laq_glycolysis`) | `s1_define` WRITE / `s3_fate` WRITE | "acetyl coenzyme A is completely oxidised to **CO2 and H2O**" (krebs), and "pyruvic acid is COMPLETELY oxidised to **CO2 and H2O** through the Krebs cycle" (glycolysis). Water is not a product of the Krebs cycle. It forms in the electron transport system, where oxygen is the final electron acceptor. The model repeated the claim verbatim in [explain] on both cards ("completely break down … into carbon dioxide and water"). | "…completely oxidised to CO2, with the NADH and FADH2 it produces passing to the electron transport system, where oxygen accepts the electrons and water is formed." |
| 2 | `ts_ipe_b2_rp_laq_glycolysis` | `s7_net` WRITE | "Glycolysis alone releases only a small part of the energy in glucose; **the rest is released in the Krebs cycle**." This contradicts the Krebs card's own `s6_yield` MISTAKES, which says flatly: "Saying the Krebs cycle makes most of the ATP directly. It makes only ONE ATP per turn; the NADH and FADH2 do the rest, later." Two cards in the same chapter tell a student opposite things. | "…the rest is released later, mostly in the electron transport system, from the NADH and FADH2 the Krebs cycle hands on." |
| 3 | `ts_ipe_b2_sef_laq_release_new_variety` | MARK SPLIT / step structure | The question is a FIVE-step answer but the card has SIX steps, because `s1_five` (1M) is a mark for listing the same five headings that steps `s2`–`s6` then carry. Nothing in the split says the heading-list mark survives when one detailed step is dropped — and that is exactly where the model broke: its [skiplast] tallied only `s2`–`s5` (2+1+1+2 = 6) and lost the `s1_five` mark, producing the slice's only score-1 reply. | Either fold the list mark into `s2_variability`, or make the split explicit — "The numbered list of all five headings 1M (earned separately from the five step marks)" — and add a NOTE on `s1_five` saying it stands whichever later step is dropped. |
| 4 | `ts_ipe_b2_tp_apoplast_and_symplast` | `s2_symplast` WRITE + REMEMBER | "The symplast is the path … that **DOES cross membranes**. Water moves through the living cytoplasm, from cell to cell **through plasmodesmata**." These two clauses fight each other: plasmodesmata are precisely the route that avoids crossing a membrane between cells. What is slow is the single crossing of the plasma membrane on the way IN. The model propagated the conflation three times on this card — [remember] "passing through plasmodesmata, which takes time because it crosses membranes", [explain] and [why] the same. | "Water must cross the plasma membrane to enter the symplast, and that crossing is what makes this route slow; once inside, it passes from cell to cell through plasmodesmata." |
| 5 | `ts_ipe_b2_sef_biofortification` | INSIDER POINT vs `s2_examples` NOTE vs `s2_examples` MISTAKES | Three different counts for the same 1-mark half: INSIDER POINT says "at least **two** named examples", the NOTE says "At least **three** named examples", the MISTAKES say "Naming one example. The book gives **four**." The model followed the insider point and advised two. | Fix on one number and repeat it in all three fields — "the book gives four; write at least two, each with the nutrient it supplies." |
| 6 | `ts_ipe_b2_piv_test_cross_name_and_use` | INSIDER POINT vs `s2_use` NOTE | The same 1-mark half is budgeted twice, differently: INSIDER POINT says "**one sentence** for the use"; the step NOTE says "Purpose plus both outcomes. **Five lines.**" The model's [marks] reply took "one or two sentences", its [mistakes] reply took "about five lines" — the card made it contradict itself across two answers. | Pick one budget (five short lines covering purpose + both outcomes reads correct for 1M in a VSAQ) and state it in both fields. |
| 7 | `ts_ipe_b2_piv_test_cross` | `s5_diagram` label list, and allele symbols across `s2`/`s3`/`s5` | (a) The gamete labels read "W · w · w · W · w · w" — six gamete labels for a one-row square that needs W and w along the top (from Ww) and a single w down the side (from ww); as printed it cannot be drawn. (b) The card switches symbol sets mid-answer: `s2_use` uses T/t ("HOMOZYGOUS (TT) or HETEROZYGOUS (Tt)"), `s3_design` and `s5_diagram` use W/w (violet/white). | (a) "Ww × ww · gametes W, w (top) · gamete w (side) · progeny Ww, ww". (b) Use one symbol pair through the whole card — W/w, since the design and the diagram are both built on violet/white. |
| 8 | `ts_ipe_b2_rp_laq_glycolysis` | `s4_phase1` step label / WHY | The half that SPENDS 2 ATP is labelled the "**energy acquiring** phase", and the step's own WHY has to apologise for it — "which is why this half is called the energy acquiring phase even though it produces no energy". A student who meets the standard term elsewhere will not connect the two. | Keep the source book's label if the board uses it, but gloss it once: "the energy acquiring (preparatory / energy investment) phase — the five steps that SPEND 2 ATP to prepare the sugar for splitting." |
| 9 | `ts_ipe_b2_rp_laq_krebs_cycle` | `s1_define` WRITE | Two clauses in the same step contradict each other: "occurs in **ALL AEROBIC organisms**" and "takes place in the **MATRIX of the mitochondrion**". Aerobic bacteria run the cycle and have no mitochondria. | "It occurs in all aerobic organisms; in eukaryotes it takes place in the matrix of the mitochondrion." |
| 10 | `ts_ipe_b2_sef_scp_fungi`, `ts_ipe_b2_sef_semi_dwarf_rice`, `ts_ipe_b2_sef_wheat_varieties`, `ts_ipe_b2_sef_sugarcane_species` | MARK SPLIT (pattern across four cards) | Each question asks only for names — "Give two examples of fungi used in SCP production", "Name two semi-dwarf varieties of rice", "Give two examples of wheat varieties", "Which two species of sugarcane were crossed" — yet half the marks sit on content the question never asks (what SCP is / why semi-dwarf / what they achieved / what each contributed). A student who answers exactly what is printed scores 1 of 2. All four carry the VERIFICATION caveat, so nothing is asserted falsely, but they are the four splits most in need of a board teacher's eye. | Flag these four for teacher verification before they ship; if the split is real, add one line to the INSIDER POINT of each saying plainly that the printed question under-states what the examiner wants. |
| 11 | `ts_ipe_b2_sef_laq_tissue_culture` | `s8_advantages` MISTAKES | "Saying tissue culture produces variation. It produces SOMACLONES — genetically IDENTICAL plants." Stated flatly, while `ts_ipe_b2_sef_micropropagation_somaclones` `s2_somaclones` handles the same point with the correct caveat — "(Somaclonal VARIATION is a separate, rarer phenomenon.)". As printed the two cards read as contradicting each other. | Add the same parenthesis here: "…genetically IDENTICAL plants. (Somaclonal variation is a separate, rarer phenomenon.)" |

---

## 7. Other observations

**Length.** Mean 77 words per reply; the distribution is healthy. The four longest are all `[explain]` on 8-mark LAQs — `release_new_variety` 273 w, `tissue_culture` 270 w, `glycolysis` 223 w, `krebs_cycle` 195 w — which is defensible for "explain the whole answer, I am seeing it for the first time" on an 8-mark question, but they are walls of text on a phone. The shortest are 27–34 w and all land correctly. Two mechanical OVER_BUDGET flags fired (`krebs_cycle` [why] 153 w/150, `tissue_culture` [important] 126 w/120); both are 4–5% over and both replies are correct — the flags are real but not worth acting on.

**Markdown leaking.** One occurrence in 240: `ts_ipe_b2_piv_wrinkled_genotype` · [telugu] ships `**rr**`, which reaches the student as literal asterisks. Correctly flagged by the regex. No bullet lists, headings or other markdown leaked anywhere else; several replies use numbered lists in plain prose, which renders fine.

**Internal step-ids.** Zero leaks. Grepped every reply for `s<n>_<word>` patterns: no `s2_use`, `s4_phase1`, `s8_advantages` etc. ever reaches the student. The replies say "step 2", "the last step", or the step's human label ("Why it matters", "The measured comparison") — which is the right behaviour.

**Idioms and register (Rule 41 flavour).** Mostly clean literal English, but three replies reach for figures of speech the plain-language law would reject:
- `ts_ipe_b2_tp_apoplast_and_symplast` · [explain] runs an extended metaphor — "Think of a plant like a city, and water is the delivery van… the highway outside the buildings… tiny doorways called plasmodesmata". Vivid, and the physics survives, but it is exactly the metaphor register 41a bans.
- `ts_ipe_b2_sef_scp_fungi` · [remember] — "torula rhymes with 'torula'" (empty, quoted in §1).
- `ts_ipe_b2_sef_wheat_varieties` · [remember] — "repeat the pair 'Sonalika and Kalyan Sona' as one unit, like a single word" is fine, but the surrounding "remembering one name should bring the other to mind" is filler.

**Star / exam-history discipline.** Excellent, and this is the card fleet's win, not the model's: all 24 `[important]` replies keep the 0-star frequency rank and the Asked line as separate facts, and all five cards with no Asked line (`biofortification`, `micropropagation_somaclones`, `sugarcane_species`, `totipotency_and_explant`, `c4_water_efficiency`) say plainly that the book records no exam years rather than concluding it was never asked — which is exactly what the STARS field instructs. Zero failures on the trap the cards were built to catch.

**Refusal quality.** All 24 `[outofbank]` replies decline and route the student to the catalog; 14 also name the open card, which reads helpful rather than evasive. The three scope-creep cases in §4 are the only ones that turn a refusal into an unrequested mini-lesson.
