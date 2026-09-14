# VIDI-B2-07 — Vidi chatbot audit, Botany-II slice 7 of 7

Source: `.answerbook_logs/audit_ts_ipe_b2.slice-07.md`
23 cards × 10 asks = 230 replies. Every reply graded against the ANSWER FACTS shown above its
card, never against outside biology. Blind read — no card file was opened or edited.

Chapters in this slice: Transport in Plants (15 cards), Viruses (8 cards).

---

## 1. Per-template table

| template   | mean  | 0 | 1 | 2 | 3  | N  |
|------------|-------|---|---|---|----|----|
| marks      | 3.000 | 0 | 0 | 0 | 23 | 23 |
| whystep    | 3.000 | 0 | 0 | 0 | 23 | 23 |
| remember   | 3.000 | 0 | 0 | 0 | 23 | 23 |
| explain    | 3.000 | 0 | 0 | 0 | 23 | 23 |
| mistakes   | 3.000 | 0 | 0 | 0 | 23 | 23 |
| important  | 3.000 | 0 | 0 | 0 | 23 | 23 |
| skiplast   | 2.957 | 0 | 0 | 1 | 22 | 23 |
| why        | 2.609 | 0 | 4 | 1 | 18 | 23 |
| outofbank  | 2.870 | 0 | 0 | 3 | 20 | 23 |
| telugu     | 2.957 | 0 | 0 | 1 | 22 | 23 |

Six templates are clean at 3.000 across all 23 cards: `marks`, `whystep`, `remember`, `explain`,
`mistakes`, `important`. The step-addressing machinery is perfect in this slice — 46 step-bound
asks (23 `whystep` + 23 `skiplast`) and not one addresses or prices the wrong step.

The entire loss sits in one template, `why`, and it is not a biology failure — it is a refusal
misfire that happens only on the Viruses cards. See §7.

## 2. Overall

- **Overall mean: 2.939** (676 points / 230 replies)
- **Total replies graded: 230**
- **Guard replies excluded: 0** — no rate-limiter reply ("I could not answer just now…" /
  "Give me a short moment…") appears anywhere in this slice. All 230 are real persona replies,
  so the mean is over the full population.
- Grade spread: 0 × 0 · 1 × 4 · 2 × 6 · 3 × 220.

## 3. Every reply scored 0 or 1

No reply scored 0. Four scored 1, all of them the `[why]` ask, all of them on Viruses cards.

**1. `ts_ipe_b2_vi_chemical_structure_of_viruses` · [why]** — scored 1

> I don't have that question open, so I cannot see its steps or its biology. I have noted it, and
> you can open it from the catalog if it is in the book.

Against the facts: the card IS open, and it is the card the student is looking at. The ANSWER
FACTS carry a full four-step answer with a WHY line on every step ("A virus is nothing but genetic
material in a protein box…", "Because the capsomere count is fixed for each virus…") — exactly the
material the ask wants. The model mistook the ask's hardcoded phrase "in the plant" for a request
about a different card and declined the card in front of it. The student is told, falsely, that
their own open question is not loaded.

**2. `ts_ipe_b2_vi_ictv_and_naming` · [why]** — scored 1

> I don't have that question open, so I can't explain its biology. I've noted your question, and
> you can open it from the catalog if it's in the book.

Same misfire. The card supplies a WHY for every step ("Viruses are not living cells, so the
ordinary rules of biological nomenclature do not fit them…", "Each suffix marks its level
unambiguously…"). Nothing was withheld by the facts; the model withheld it.

**3. `ts_ipe_b2_vi_lysozyme` · [why]** — scored 1

> I do not have that question open — I only have the lysozyme question in front of me. You have
> asked about a plant biology question, and I cannot see its steps or biology. Open it from the
> catalog if it is in the book, and then I can help you with it.

Worse than 1 and 2 because it invents a second question: it asserts the student "asked about a
plant biology question", when the ask is the standard `[why]` follow-up on the open card. The card
carries the answer it refuses to give ("The phage has to bring its own way out, because a
bacterium would not make an enzyme that destroys itself").

**4. `ts_ipe_b2_vi_tmv_shape_and_genome` · [why]** — scored 1

> You are asking about a Botany-II question, but the biology behind it is not in the answer I have
> open. I have noted your question, and you can open it from the catalog if it is in the book.
> That is all I can say about it.

"The biology behind it is not in the answer I have open" is false against the facts: s1's WHY is
"The rod shape comes from its capsomeres being stacked in a helix rather than packed into a
sphere," and s2's WHY is "TMV is one of the standard examples of an RNA virus." Both answer the
ask directly. This one is also internally incoherent — it correctly identifies the ask as a
Botany-II question and then declines it as out of bank.

### The six replies scored 2 (for completeness — none is a content error)

| question_id | template | why 2 |
|---|---|---|
| `ts_ipe_b2_tp_plasmolysis` | telugu | Says microbes "చనిపోతాయి" (die); the facts say microbes "lose water and cannot grow". Also the only reply besides `source_and_sink` that puts the technical terms in Telugu script rather than English. |
| `ts_ipe_b2_tp_transpiration_at_night` | outofbank | Declines correctly, then volunteers the open card's model answer unasked (scope-creep, §4). |
| `ts_ipe_b2_tp_transpiration_vs_evaporation` | outofbank | Declines correctly, then volunteers the open card's mark split and table advice (scope-creep, §4). |
| `ts_ipe_b2_tp_transport_saturation` | outofbank | Declines correctly, then volunteers the open card's two-mark split (scope-creep, §4). |
| `ts_ipe_b2_vi_lytic_cycle` | skiplast | Prices the right step (release, 1M) and the right remainder (3M), but miscounts: "the minimum you must write is the other **four** steps" and then lists three. |
| `ts_ipe_b2_vi_tmv_structure` | why | Opens with the same false "I do not have that other question open", then recovers and answers the TMV biology correctly in the next paragraph. Half-misfire, not a refusal. |

## 4. The four explicit counts

### WRONG-STEP — **0 of 46**

A `[whystep]`/`[skiplast]` reply that explains or prices a step other than the one named.
All 23 `[whystep]` replies address the named step and all 23 `[skiplast]` replies price the named
step. Verified individually:

- `whystep`: s2_factors ✓ · s2_closing ✓ · s2_transpiration ✓ · s2_reason ✓ · s2_diffusion ✓ ·
  s3_cell ✓ · s2_role ✓ · s2_sink ✓ · s3_closing ✓ · s2_example ✓ · s2_disadvantages ✓ ·
  s3_cost ✓ · s2_evaporation ✓ · s2_effect ✓ · s3_pressure ✓ · s3_genome ✓ · s3_rules ✓ ·
  s2_function ✓ · s3_biosynthesis ✓ · s3_tail ✓ · s2_genome ✓ · s3_capsid ✓ · s2_temperate ✓
- `skiplast`: every one names the step's own mark value. The three 0-mark diagram steps
  (`tp_stomata_structure_mechanism` s5_diagram, `vi_t_even_phage_structure` s5_diagram,
  `vi_tmv_structure` s5_diagram) are each correctly priced at **0 marks lost**, with the reason
  the card gives ("the question says explain, not draw"). That is the hardest case in the template
  and it is 3 for 3.

The one blemish is `vi_lytic_cycle`'s "other four steps" miscount above — the step priced is still
the named one, so it is not a WRONG-STEP.

### OUT-OF-BANK ANSWERED — **0 of 23**

No `[outofbank]` reply gives the stages of mitosis, names one of them, or hints at their order.
All 23 decline and point to the catalog.

### SCOPE-CREEP — **3 of 23**

An `[outofbank]` reply that refuses correctly but then volunteers content of the open card.

1. `ts_ipe_b2_tp_transpiration_at_night` — "For the transpiration question you have open, remember
   to write "Yes, transpiration occurs at night" plus the reason about stomata, and then name
   Bryophyllum and cacti for the example."
2. `ts_ipe_b2_tp_transpiration_vs_evaporation` — "For the transpiration and evaporation question in
   front of you, the book gives 1 mark for transpiration and 1 mark for evaporation, and suggests a
   two-column table with four contrasts."
3. `ts_ipe_b2_tp_transport_saturation` — "For the question you do have in front of you — transport
   saturation — remember the two marks come from defining saturation and stating its effect on
   facilitated diffusion."

Not counted as scope-creep (correctly): the seven replies that only *name* the open card to make
the refusal concrete ("only the T-even bacteriophage one is in front of me right now",
"I can only see the plasmolysis one in front of us") or offer to talk about it ("Let me know if
you want to discuss the porins question instead") without stating any of its content.

### INVENTED MARK — **0 of 230**

Every mark number spoken in the slice is derivable from its card's MARK SPLIT. Spot-checked across
all 23 `[marks]`, all 23 `[skiplast]` and every `[explain]`/`[important]` that names a figure:
2-mark cards priced 1+1, the 4-mark SAQs priced 1+1+1+1 except `tp_transpiration_necessary_evil`
which is correctly priced 2+2, and the three diagram steps correctly priced 0. No reply invents a
half-mark, a bonus mark, or a total other than the section total.

## 5. Telugu

**23 of 23** `[telugu]` replies are in **Telugu script**. **Zero** are romanised Telugu and
**zero** are all-English. The template is the second-cleanest in the slice.

**21 of 23** also keep the biology terms in English (Latin script) as intended — e.g.
`vi_lytic_cycle`: "ఈ cycle లో 5 steps ఉంటాయి: attachment, penetration, biosynthesis, maturation,
release … దాన్ని ghost అంటారు … దీన్నే eclipse period అంటారు"; `tp_water_potential`: "solute
potential (psi s), ఇది ఎప్పుడూ negative గా ఉంటుంది".

Two replies break that convention by transliterating or translating the terms into Telugu script
instead of leaving them in English:

1. **`ts_ipe_b2_tp_source_and_sink`** — the only reply in the slice with **no Latin script at all**;
   both key terms are transliterated:
   > సోర్స్ అంటే మొక్కలో ఆహారం తయారయ్యే చోటు. ఉదాహరణకి ఆకు. సింక్ అంటే ఆహారం నిల్వ అయ్యే లేదా వాడుకునే చోటు.
   "సోర్స్" / "సింక్" should have stayed **source** / **sink** — those are the two words the
   examiner scans for, and a student copying this reply cannot lift the exam word from it.
2. **`ts_ipe_b2_tp_plasmolysis`** — transliterates the head term and glosses the rest:
   > ప్లాస్మోలిసిస్ అంటే … కణ త్వచం (cell membrane) గోడ నుంచి విడిపోయి … ఇది హైపర్టానిక్ ద్రావణంలో
   > (hypertonic solution) జరుగుతుంది
   "ప్లాస్మోలిసిస్" / "హైపర్టానిక్" should be **plasmolysis** / **hypertonic**. It at least
   parenthesises the English for two of the three.

Neither is romanised Telugu and neither is all-English, so both stay inside the Telugu-script
requirement; they are a terminology-register slip, not a language slip.

## 6. CARD DEFECTS

The most valuable section: defects in the ANSWER FACTS themselves — the card's fault, not the
model's. Ordered by how much damage each does.

| question_id | field | what is wrong | what it should say |
|---|---|---|---|
| `ts_ipe_b2_tp_water_potential` | s3_pressure — WRITE + MISTAKES + REMEMBER | **"It is always positive"** is wrong, and the card doubles down in MISTAKES ("Writing pressure potential as negative. It is POSITIVE") and REMEMBER ("Pressure pushes the value up"). Pressure potential is strongly **negative** in the xylem — that tension is the whole mechanism of the ascent of sap. The model repeated "always positive" in all ten replies on this card. | Keep the board line but bound it: "In a turgid cell the pressure potential is positive. In the xylem it is negative (tension)." NCERT itself carries the xylem exception. |
| `ts_ipe_b2_tp_water_potential` | s3_pressure — WRITE, last line | **"It is seen in the ascent of water through the stem"** attaches *positive* pressure potential to the ascent of sap. The ascent of sap is driven by negative pressure (transpiration pull); positive root pressure moves water only a few metres. Directly contradicts `tp_transpiration_necessary_evil` s1 ("It creates the transpiration pull that absorbs and transports water") and `tp_transpiration_photosynthesis_compromise` s3 ("The loss of water pulls more water up from the soil, through the xylem"). | "It is seen in a turgid cell pressing on its wall" — and drop the stem/ascent claim, which belongs to transpiration pull, not to ψp. |
| `ts_ipe_b2_tp_osmosis_vs_diffusion` | s2_diffusion — WRITE | **"Diffusion is the movement of SOLUTE molecules"** restricts diffusion to solute. It contradicts this slice's own `tp_diffusion_definition_factors` s1 ("Diffusion is the movement of **molecules** from a region of higher concentration…", whose worked examples are gases) and `tp_porins` s2 ("Molecules move through it by simple diffusion"). The model faithfully taught "diffusion moves solute" ten times on this card, one card after teaching that diffusion moves gases. | "Diffusion is the movement of **any molecules** — solute or gas — from higher to lower concentration. In this comparison the contrast is that osmosis moves the solvent through a membrane." |
| `ts_ipe_b2_tp_osmosis_vs_diffusion` | s1_osmosis — REMEMBER + s2 MISTAKES | **"Osmosis moves water toward the stronger side"** and "Osmosis is low to high solution; diffusion is high to low" sets up the classic misconception that osmosis runs uphill while diffusion runs downhill. Water in osmosis still moves down **its own** gradient (high water potential → low). The card never says this, so the student meets `tp_water_potential` two cards later with a contradiction already installed. | Add one line to s1's WHY: "The solution gets stronger, but the water itself still moves from where water is more concentrated to where it is less — down its own gradient." |
| `ts_ipe_b2_tp_stomata_structure_mechanism` | s4_stress — WRITE | **"Organic acids collect at night and make the guard cells turgid, so the stomata open at NIGHT."** In CAM plants malate accumulates in the **mesophyll** vacuoles, not the guard cells, and night opening is driven by CO₂ fixation, not by acid-driven turgor. As written it also contradicts `tp_guard_cell_ph`, whose whole answer is that an **open** pore means guard-cell pH has **risen** — acid collecting in the guard cells would lower it. | "In succulent (CAM) plants the pattern is reversed: they fix carbon dioxide as organic acids at night, so the stomata open at NIGHT and close by day." Keep the acids in the plant, out of the guard cells. |
| `ts_ipe_b2_vi_lysozyme` | s1_what — MISTAKES | Student-facing MISTAKES text carries an editorial provenance note with page numbers: **"The guide contradicts itself on this between p.29 and p.51."** A student reading the `[mistakes]` ask is handed a page reference to a book they may not have, about an internal editorial dispute. (The model filtered it out — no reply leaked it — so this is latent, not live.) | Move the provenance to the INSIDER POINT or a non-rendered note. MISTAKES should read: "Calling it a host enzyme. It is VIRAL — the phage codes it." |
| `ts_ipe_b2_vi_lytic_cycle` | s4_release — MISTAKES | Same defect: **"The guide says host here and viral two pages later."** | "Calling lysozyme a host enzyme. It is coded by the PHAGE." |
| `ts_ipe_b2_vi_ictv_and_naming` | s4_example — MISTAKES | Same defect: **"The guide misprints this."** | "Writing 'Genes' for GENUS. The level is genus." |
| `ts_ipe_b2_vi_chemical_structure_of_viruses` | s3_genome — MISTAKES | Same defect: **"The guide's own answer contradicts itself here."** | "Giving only DNA. RNA viruses include TMV, polio and HIV." |
| `ts_ipe_b2_tp_transpiration_vs_evaporation` | s1/s2 — WRITE, point 2 + INSIDER POINT | The INSIDER POINT promises four mirrored contrasts, but point 2 does not mirror: transpiration "**It happens within the plant**" against evaporation "**It is a surface level process**". Those are not opposites — one is a location, the other is a depth, and transpiration is itself surface evaporation from mesophyll walls. The card's NOTE then orders "Mirror the four numbered points exactly", and the model duly taught the non-contrast: its `[remember]` reply flips "within the plant" → "surface level" as if they were a matched pair. | Make point 2 a real contrast of place: "It happens only from the living tissue of a plant" against "It happens from any exposed water surface, living or not" — or drop point 2 and let the INSIDER POINT promise three contrasts. |
| `ts_ipe_b2_vi_ictv_and_naming` | s2_levels — WRITE | **"ICTV uses THREE hierarchical levels: FAMILY, GENUS, SPECIES"** and "This is shorter than the seven levels used for plants and animals" is outdated — ICTV's current taxonomy runs 15 ranks (realm down to species), and since 2021 species names are binomial, not "a common English expression" (s3_rules). | This is almost certainly the board's own answer, so **do not change it without a teacher's sign-off** — flagged here only so the mismatch with current ICTV is on the record if a student cites a modern source. |
| `ts_ipe_b2_tp_guttation_vs_transpiration` | s1_guttation — WRITE + MISTAKES | "It occurs at NIGHT" is stated absolutely and "Saying it happens by day" is marked a mistake. Guttation is observed at night **and in the early morning**, whenever root pressure is high and transpiration is low. Minor, and board-standard. | "It occurs at NIGHT and in the early morning, when root pressure is high and transpiration is low." Low priority. |

Nothing else in the 23 cards is wrong biology. The Viruses cards in particular are internally
consistent: `vi_lysozyme` and `vi_lytic_cycle` both say phage-coded, `vi_chemical_structure` and
`vi_tmv_structure` agree on 2,130 capsomeres, and `vi_tmv_shape_and_genome` and `vi_tmv_structure`
agree on ~6,500 nucleotides. `tp_transport_saturation`'s INSIDER POINT is a model of the right
behaviour — it names the printed guide as wrong and states the correct physics ("Saturation LIMITS
the rate… Write the ceiling"), and the model got all ten replies right because of it.

## 7. Other observations

**The `[why]` ask is hardcoded to plants and misfires on every Viruses card.** This is the single
biggest finding in the slice and it is a harness defect, not a card defect. The ask reads "but WHY
does this happen **in the plant**?" — meaningless on the eight `CHAPTER: Viruses` cards. Of those
eight, four refused outright (§3), one refused then recovered (`vi_tmv_structure`), and three
handled it gracefully:

- `vi_lytic_cycle`: "I think you may be asking about the lytic cycle in viruses, not about plants."
- `vi_virulent_vs_temperate_phages`: "You are asking about why virulent and temperate phages behave
  differently, not about a plant. So I will answer that biology."
- `vi_t_even_phage_structure`: ignored the mismatch and answered ("The biology behind the tadpole
  shape is division of labour").

Same model, same ask, 3-vs-1 outcome on a coin flip. Every one of the 15 Transport-in-Plants cards
scored 3 on `[why]`. Fix the ask (drop "in the plant", or template it per chapter) and this slice's
overall mean goes from 2.939 to 2.974 with no change to a single card.

**No markdown leaked.** Zero asterisk pairs in any of the 230 replies; emphasis is carried by
capitalisation ("write VIRAL, not host enzyme") the way the cards do it.

**No internal step-ids spoken.** Zero occurrences of `s1_define`, `s2_what` or any raw id in a
reply. The model consistently says "step 1", "step 2", "the diagram step" or the human label in
quotes ("you lose the 1 mark for 'During closing'"). This is clean across all 46 step-bound asks.

**Length.** Well-calibrated. `[marks]` and `[skiplast]` are 2–4 sentences; `[explain]` runs 2–4
short paragraphs, which is right for "I am seeing it for the first time". The shortest reply in the
slice is `tp_water_potential` `[marks]` at two sentences — and it is correct and complete, so it
scored 3. Nothing is padded to the point of costing a grade.

**Idiom / plain-language.** Clean. The cards' own REMEMBER lines are the only figurative language
("A full car park does not fill faster because more cars arrive", "The phage brings its own key to
the door", "The wall stays, the bag inside pulls away") and the model reuses them verbatim rather
than inventing new ones — the correct behaviour, since the card authored them deliberately. The one
place it improvised is `tp_porins` `[remember]`: "think of a big open door that is always
unlocked", which is a clean literal image and consistent with the card's own "A hole does not push;
things fall through it on their own."

**One stock phrase is near-universal.** "The important step is…" appears in **22 of the 23**
`[remember]` replies — it is effectively the template's fixed opener — and leaks into five replies
on templates where **no step is open**: `tp_source_and_sink` and `vi_virulent_vs_temperate_phages`
`[important]` ("the important step is to write one point for virulent phages…"),
`tp_transpiration_necessary_evil` and `vi_virulent_vs_temperate_phages` `[explain]` ("So the
important step is to split your page into two halves"), and `vi_lytic_cycle` `[mistakes]` ("The
important step is to write the named terms clearly"). In a `no step open` ask, "the important
step" reads as if a step were open. Cosmetic — it cost no grade — but worth a prompt tweak, and
the 22-of-23 uniformity on `[remember]` makes the persona sound scripted.

**One unverified UI affordance.** `vi_ictv_and_naming` `[outofbank]` tells the student to "tap
'Change my plan' under this chat if you want to adjust your revision list." No other reply in the
slice mentions it. If that control does not exist in the shipped chat, it is a fabricated
affordance and should be caught; if it does, it is fine and the other 22 replies are simply not
using it.

**One typo.** `tp_water_potential` `[outofbank]`: "**you** have noted it" for "I have noted it".
Harmless — the refusal itself is correct.
