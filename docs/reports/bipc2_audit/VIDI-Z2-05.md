# VIDI-Z2-05 — blind grading read, Zoology-II audit slice 5 of 6

Source: `.answerbook_logs/audit_ts_ipe_z2.slice-05.md` — 25 cards × 10 asks = 250 replies.
Every reply graded 0–3 against the ANSWER FACTS printed above its card. Nothing sampled.

---

## 1. Per-template table

| template | mean | 0 | 1 | 2 | 3 | N |
|---|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 25 | 25 |
| whystep | 3.000 | 0 | 0 | 0 | 25 | 25 |
| remember | 3.000 | 0 | 0 | 0 | 25 | 25 |
| explain | 2.920 | 0 | 1 | 0 | 24 | 25 |
| mistakes | 2.960 | 0 | 0 | 1 | 24 | 25 |
| important | 2.960 | 0 | 0 | 1 | 24 | 25 |
| skiplast | 3.000 | 0 | 0 | 0 | 25 | 25 |
| why | 2.960 | 0 | 0 | 1 | 24 | 25 |
| outofbank | 2.840 | 0 | 0 | 4 | 21 | 25 |
| telugu | 2.920 | 0 | 0 | 2 | 23 | 25 |

---

## 2. Overall

- **Overall mean: 2.956** (739 points / 250 replies)
- **Total replies: 250** (25 cards × 10 templates — verified by count of `**Vidi replies:**`)
- **Guard replies excluded: 0.** No "I could not answer just now…" / "Give me a short moment…"
  reply appears anywhere in the slice; the rate limiter never fired. All 250 are real replies and
  all 250 are in the mean.

Grade distribution: 240 × 3 · 9 × 2 · 1 × 1 · 0 × 0.

---

## 3. Every reply scored 0 or 1

Zero replies scored 0. One reply scored 1.

**`ts_ipe_z2_msk_ear_ossicles` · [explain] · score 1**

> "Simple words: the inner ear has three tiny bones called ossicles. They are the malleus, the
> incus and the stapes."

Against the ANSWER FACTS: the card's own s1 WHY says the three bones "pass the vibration **from the
ear drum to the inner ear** in a chain" — i.e. they sit *between* the ear drum and the inner ear, so
they cannot be *in* the inner ear. The reply states a plain anatomical falsehood (the ossicles are
middle-ear bones) that contradicts the fact block it was given. It stays at 1 rather than 0 because
nothing that carries a mark is wrong — the three names and the three origins are all correct in the
same reply, and the location was never part of the mark split. See CARD DEFECTS row 2: the fact
block never says "middle ear" anywhere, so nothing in the card stopped this.

No other reply in the slice reached 1 or 0.

---

## 4. The four explicit counts

**WRONG-STEP — 0 of 50.**
All 25 `[whystep]` replies explain the exact step named in the header, and all 25 `[skiplast]`
replies price the exact step named. Checked one by one, including the three cards where the named
last step is worth more than 1M: `ts_ipe_z2_hrs_sperm_diagram` (s2_figure priced at the full 2M,
correct), `ts_ipe_z2_msk_pelvic_girdle_diagram` (s2_figure priced at the full 4M, "you would score
zero", correct) and `ts_ipe_z2_msk_synovial_joint` (s4_figure = 1M, "capped at 3 marks", correct).
Offending question_ids: none.

**OUT-OF-BANK ANSWERED — 0 of 25.**
No `[outofbank]` reply describes, outlines, names steps of, or gives any content from the cockroach
digestive system. All 25 decline, note the request, and point at the catalog. Offending
question_ids: none.

**SCOPE-CREEP — 4 of 25.**
Refuses correctly, then volunteers content of the *open* card unasked:
- `ts_ipe_z2_imm_complement_proteins` — "For the question you are looking at now, complement
  proteins: write that they are inactive plasma proteins, and when activated they form membrane
  attack complexes that make pores in the cell membrane, so the cell bursts."
- `ts_ipe_z2_imm_perforins_vs_granzymes` — "For the question in front of you, just remember the
  order: perforins make the pores in the infected cell's membrane, then granzymes enter through
  those pores and trigger cell destruction. That order is what makes the difference clear, and each
  earns one mark."
- `ts_ipe_z2_ncc_all_or_none_principle` — "For the all-or-none principle you have open: the first
  mark comes from naming the threshold stimulus, and the second from saying the impulse cannot be
  stopped part way."
- `ts_ipe_z2_ncc_corpus_callosum` — "For the corpus callosum question in front of you, just remember
  to write what it joins and what it does — that covers both marks."

All four volunteered blocks are *accurate*, so each scored 2, not 1. Note the distinction I applied:
seven other `[outofbank]` replies merely *name* the open card ("I can only see the spermiogenesis
and spermiation one", "focus on the synovial joint question in front of you first",
"Let us focus on the triad system question you have in front of you for tomorrow") without
volunteering any of its content — those are not scope-creep and scored 3.

**INVENTED MARK — 0 of 250.**
Every mark number spoken is derivable from the split. The near-misses I checked and cleared:
"one blob labelled 'head' earns only half a mark" (`hrs_sperm_diagram`, from the insider point);
"the diagram and structure carry half the marks" (`imm_immunoglobulins`, 1M + 1M of 4M);
"a paragraph … usually loses one mark" (`msk_actin_vs_myosin`, from the insider point);
"the book counts a colour without its cause as half a point" (`msk_red_vs_white_fibres`, from the
insider point); "capped at 3 marks" (`msk_synovial_joint`, from the insider point).
Offending question_ids: none.

---

## 5. Telugu

**24 of 25 `[telugu]` replies are in Telugu script with the biology terms left in English.**
Zero are romanised Telugu. Zero are all-English. The code-mix is consistently right: Telugu
connective prose carrying Latin-script `acrosome`, `seminiferous tubule`, `IgA`, `membrane attack
complex`, `reverse transcriptase`, `provirus`, `H₂L₂`, `Fab end`, `tunica albuginea`, `sarcoplasmic
reticulum`, `terminal cisternae`, `obturator foramen`, `myoglobin`, `threshold`, `corpus callosum`.

**The one exception — `ts_ipe_z2_msk_synovial_joint` [telugu]** (scored 2). It is Telugu script, but
it transliterates the technical vocabulary into Telugu script instead of keeping it in English, and
it answers with the mark ledger rather than a simple explanation:

> "సరే, ఈ ప్రశ్నకు సమాధానం తెలుగులో సింపుల్ గా చెప్తాను. ఈ అంశం 2 స్టార్లు, అంటే మీ పుస్తకం ప్రకారం ఇది మీడియం ఫ్రీక్వెన్సీ ప్రశ్న.
> మార్కులు ఇలా పంచబడ్డాయి: సినోవియల్ జాయింట్ అంటే ఏమిటి 1 మార్కు, క్యాప్సూల్ యొక్క బయటి పొర 1 మార్కు, లోపలి పొర మరియు సినోవియల్ ఫ్లూయిడ్
> 1 మార్కు, లేబుల్డ్ డయాగ్రమ్ 1 మార్కు. …"

`సినోవియల్ జాయింట్` / `క్యాప్సూల్` / `సినోవియల్ ఫ్లూయిడ్` / `లేబుల్డ్ డయాగ్రమ్` / `ఫ్రీక్వెన్సీ` should have stayed
`synovial joint` / `capsule` / `synovial fluid` / `labelled diagram` / (no English needed) — a
student revising for an English-medium paper cannot copy a Telugu-script "సినోవియల్" onto the answer
sheet. It is also the only `[telugu]` reply that never explains what the structure actually is; the
student asked "cheppu" (tell me), and got a mark split.

One other, scored 2 for a cosmetic artifact rather than the language rule —
**`ts_ipe_z2_hrs_testes_location_coverings` [telugu]** glosses English with English:
"మగవారిలో **testes (testes)** ఉదరం (abdomen) వెలుపల… ప్రతి **testis (testis)** చుట్టూ…". The parenthetical
gloss pattern misfired; content is fully correct.

Two replies render generic (non-technical) words in Telugu while keeping the marked terms in
English — `msk_red_vs_white_fibres` (ఆక్సిజన్, ఫైబర్స్ alongside `myoglobin` / `aerobic` /
`anaerobic muscles`) and `ncc_arbor_vitae` ("తెల్లని పదార్థం (white matter)", "బూడిద రంగు పదార్థం
(grey matter)" alongside `Arbor vitae` / `cerebellum`). Both keep every *marking* word in English,
so both scored 3.

---

## 6. CARD DEFECTS

| question_id | field | what is wrong | what it should say |
|---|---|---|---|
| `ts_ipe_z2_msk_red_vs_white_fibres` | step s1_red WRITE (vs its own WHY) | **Wrong biology, self-contradictory inside one step.** WRITE says "They use the oxygen **stored in the mitochondria**." The WHY two lines below says "**Myoglobin stores oxygen** and mitochondria use it." Mitochondria do not store oxygen — myoglobin does; mitochondria consume it. A student copying the WRITE line onto the answer sheet writes the error the card's own WHY corrects. | "They use the oxygen stored by myoglobin, which the mitochondria then consume to release energy." |
| `ts_ipe_z2_msk_ear_ossicles` | step s1_names WHY / whole fact block | **Omission that produced the slice's only 1-score.** The block never states where the ossicles are — s1 WHY only says they pass vibration "from the ear drum to the inner ear". With no "middle ear" anywhere to anchor on, the model filled the gap in `[explain]` with "the inner ear has three tiny bones called ossicles", which is false and contradicts the WHY line itself. | s1 WRITE/WHY should read "The three ear ossicles — malleus, incus and stapes — lie in the **middle ear** and pass vibration from the ear drum to the inner ear in a chain." |
| `ts_ipe_z2_ncc_all_or_none_principle`, `ts_ipe_z2_ncc_arbor_vitae`, `ts_ipe_z2_ncc_blind_spot_vs_yellow_spot`, `ts_ipe_z2_ncc_corpus_callosum` | "SOME OF THIS CHAPTER'S OTHER MOST-ASKED (3-star) QUESTIONS" line | **Cross-chapter leakage on all four Neural Control and Coordination cards.** Each is `CHAPTER: Neural Control and Coordination`, yet each is handed "VSAQ 75: What is triad system?" as one of *this chapter's* other most-asked questions. Triad system is a **Musculo-Skeletal System** question — it is the 3-star MSK card sitting eleven cards earlier in this same slice. Any reply that had steered a student toward "the other 3-star questions in this chapter" would have sent them to the wrong chapter. (It did not fire this slice — no NCC reply cited it — so this is a latent defect, not a scored failure.) | List the NCC chapter's own 3-star questions, or emit the line empty if the chapter has none ranked. |
| `ts_ipe_z2_hrs_spermiogenesis_spermiation` | step s2_spermiation WRITE + MISTAKES (pairing) | **Ambiguous marked wording that split the model against the card.** WRITE: "Spermiation is their release **from** the tubules"; MISTAKES: "Saying the sperm are released **into the epididymis**. They are released **from** the tubule." The pair frames the tubule as the thing being left. Spermiation is the release of spermatozoa from the Sertoli cells **into the lumen of the seminiferous tubule**. The `[why]` reply, following the card's own WHY ("held by the Sertoli cells until they are ready"), wrote "let go from the Sertoli cells **into the tubule**" — correct physiology, now in direct conflict with the card's marked phrase. | "Spermiation is the release of the mature spermatozoa from the Sertoli cells into the lumen of the seminiferous tubule." Keep the epididymis mistake, which is about what happens *next*. |
| `ts_ipe_z2_hrs_sperm_diagram` | MARK SPLIT vs step pricing | **Split and step list disagree on granularity.** MARK SPLIT names two priced halves ("Head with acrosome and nucleus 1M · Neck, middle piece and tail with labels 1M") but the step list prices the whole figure as one block, `[s2_figure] Diagram — a sperm — **2M**`. Nothing in the card lets a partial figure be priced, so any ask about drawing only part of the sperm has no derivable answer. (The model handled it by pricing the whole figure — the safe read — so it did not fail here.) | Either split s2_figure into two 1M sub-rows matching the MARK SPLIT, or restate the split as "Labelled figure 2M" so the two documents agree. |
| `ts_ipe_z2_ncc_blind_spot_vs_yellow_spot` | step s2_yellow WRITE | **Loose biology (low severity).** "The yellow spot is the posterior portion of the retina" describes the whole back of the retina; the yellow spot (macula lutea) is a small yellowish area at the posterior pole. The model repeated it faithfully ("a small area in the posterior, or back, portion of the retina"), so it caused no wrong reply — but the sentence as written is not a definition. | "The yellow spot (macula lutea) is a small yellowish area at the posterior pole of the retina, on the visual axis." |
| `ts_ipe_z2_imm_immunoglobulins` (s4_figure) and `ts_ipe_z2_msk_synovial_joint` (s4_figure) | figure label list | **Duplicated labels in the flat label string.** Immunoglobulins: "…· Paratope · Light chain · Heavy chain · Fc end · **Paratope · Light chain · Heavy chain**". Synovial joint: "**Bone** · Ligament · Outer membrane · Inner membrane · **Bone** · Articular capsule…". The repetition is presumably one entry per arm / per bone end, but as a flat list it inflates any "label at least N parts" count and reads as an authoring slip. | Deduplicate, or write the repeated pair explicitly ("Heavy chain (×2)", "Bone (upper and lower)"). |

---

## 7. Other observations

**Length.** Mean words per reply, by template: explain 128 (83–213) · why 80 · whystep 76 ·
mistakes 75 · remember 62 · telugu 61 · marks 57 · important 54 · skiplast 48 · outofbank 46.
`[skiplast]`, `[marks]` and `[outofbank]` are tight and appropriate. `[explain]` runs long on the
4-mark cards — `msk_pelvic_girdle_diagram` 213 words, `imm_immunoglobulins` 195,
`ncc_blind_spot_vs_yellow_spot` 173 (a 2-mark VSAQ answered in 173 words) — but the length is
structured, never padded, so none of it dropped a grade.

**Markdown leaking as asterisks: none.** Grepped every reply line for `*`, `_emphasis_`, heading
marks and link syntax — zero hits across 250 replies. Paragraph breaks are plain blank lines.

**Internal step-ids spoken to the student: none.** Grepped every reply line for the `s<digit>_<word>`
pattern — zero hits. Replies say "step 2", "the diagram step", "Step 4 … 'Memory and plasma cells'",
never `s2_what`. This is clean across the whole slice.

**Idioms and personification.** Mild and mostly borrowed from the cards' own REMEMBER lines
("perforins **open the door**, granzymes **walk through it**"; "the infected cell **shouts a warning**";
"antibody and antigen fit like a **lock and key**"). One reply reaches further than any card asked:
`imm_hiv_aids_mechanism` `[why]` — "the virus removes your **army's generals**, leaving your body
defenceless". `imm_b_cells` `[why]` has plasma cells that "**pump out**" antibodies. None of it is
wrong, and a Class-12 reader will follow all of it, but the army-generals line is the model's own
invention on top of a card that never used a metaphor.

**Star / exam-history discipline: perfect.** The fact blocks carry an explicit instruction to keep
frequency rank and exam history separate, and to say plainly that no years are recorded rather than
concluding a question was never asked. All four zero-star cards (`hrs_sperm_diagram`,
`hrs_testes_location_coverings`, `imm_mature_vs_functional_b_cells`, `msk_motor_unit`) and every
starred card got both halves right in `[important]`, including the careful "the book also does not
list any past exam years for it, **so I cannot say whether it appeared** in previous exams". Not one
reply invented a year or converted "no stars" into "never asked".

**One small source mis-count.** `imm_innate_immunity_barriers` `[mistakes]` opens "The book lists
**three** common mistakes" — the card lists eight (two per step × four steps). Everything it then
says is accurate, and it covers the three highest-value ones, but the count is wrong and it silently
drops the cytokine mistake ("writing that cytokines kill the virus directly"). Scored 2.

**One off-ask opening.** `imm_mature_vs_functional_b_cells` `[important]` was asked "is this question
important? did it come in previous exams?" and opens with two sentences of answer content before
reaching the stars and the no-years fact. It does answer both halves correctly; the lead is padding.
Scored 2.
