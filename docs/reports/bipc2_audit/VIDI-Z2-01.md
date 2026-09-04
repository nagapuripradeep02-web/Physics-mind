# VIDI-Z2-01 — blind grading, Zoology-II slice 1 of 6

Source: `.answerbook_logs/audit_ts_ipe_z2.slice-01.md` — 25 cards × 10 asks = 250 replies,
all from the Applied Biology chapter (`ts_ipe_z2_abio_*`). Every reply graded 0–3 against the
ANSWER FACTS printed above its card, never against outside biology. Nothing sampled.

---

## 1 — Per-template table

| template | mean | 0 | 1 | 2 | 3 | N |
|---|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 25 | 25 |
| whystep | 3.000 | 0 | 0 | 0 | 25 | 25 |
| remember | 2.880 | 0 | 0 | 3 | 22 | 25 |
| explain | 2.880 | 0 | 1 | 1 | 23 | 25 |
| mistakes | 2.920 | 0 | 0 | 2 | 23 | 25 |
| important | 3.000 | 0 | 0 | 0 | 25 | 25 |
| skiplast | 3.000 | 0 | 0 | 0 | 25 | 25 |
| why | 2.640 | 0 | 3 | 3 | 19 | 25 |
| outofbank | 2.880 | 0 | 0 | 3 | 22 | 25 |
| telugu | 2.880 | 0 | 1 | 1 | 23 | 25 |

## 2 — Overall

- **Overall mean: 2.908** (727 points / 250 replies)
- **Total replies graded: 250** (25 per template, 10 per card)
- **Guard replies excluded: 0.** No "I could not answer just now…" / "Give me a short moment…"
  reply appears anywhere in this slice — the rate limiter never fired.
- Distribution: 232 × 3 · 13 × 2 · 5 × 1 · 0 × 0.

## 3 — Every reply scored 0 or 1

No reply scored 0. Five scored 1.

**1. `ts_ipe_z2_abio_aquaculture_vs_pisciculture` · [why] · score 1**

> I do not have that question open. I have noted your question, and you can open it from the
> catalog if it is in the book. Since I cannot see it, I do not know its steps or the biology
> behind it.

The aquaculture card *is* open, and its facts carry exactly the material the ask wants
(WHY on s1: "Aquaculture covers every farmed water animal"; WHY on s2: "Pisces means fish, so
pisciculture is the fish-only part of aquaculture"). The student is told nothing is open, which is
false about the state of the app and leaves the ask unanswered when the answer was on the card.

**2. `ts_ipe_z2_abio_dairying_factors` · [why] · score 1**

> The biology here is about how the body turns the animals into the milk product. Breeding and
> feeding decide the animal's health and how much milk it can give. Production and processing are
> what happen after the milk leaves the animal, turning it into something usable. …

The card holds no body process at all — its two WHY fields are economic ("Milk yield depends first
on which animals are kept"; "Dairying is an industry"). The opening sentence, "how the body turns
the animals into the milk product," is not a statement about anything; it manufactures a pseudo-
mechanism to satisfy the template rather than saying the question has no body process in it.

**3. `ts_ipe_z2_abio_honey_bees_economic` · [why] · score 1**

> I do not have that question open, so I cannot tell you the biology behind it. Your question has
> been noted, and you can open it from the catalog if it is in the book.

Same false premise as (1). The honey-bees card is open and its s3 WHY — "Many crops set little or
no seed without insect pollination" — is a real biological mechanism the student was asking for.
Nothing at all is given back.

**4. `ts_ipe_z2_abio_fish_by_products` · [explain] · score 1**

> Sure. This question asks you to name four useful products that come from fish, other than the
> fish meat we eat. **Each product is worth half a mark**, so two products together earn one mark,
> and the other two earn the second mark.

The MARK SPLIT is "Oils 1M · Other products 1M". A half-mark per by-product exists nowhere in the
facts. A student who believes it will think two of the four items still bank 1 mark in any
combination — including one oil plus one non-oil, which earns neither of the book's two marks.

**5. `ts_ipe_z2_abio_direct_vs_indirect_elisa` · [telugu] · score 1**

> Indirect ELISA అంటే antibody ని detect చేస్తుంది, అంటే **మన శరీరం చేసిన రక్షణ కణాలను** వెతుకుతుంది.

"రక్షణ కణాలు" means *protective cells*. The card's own WHY calls the antibody the patient's
antibody, and the neighbouring `indirect_elisa` card calls antibodies proteins. The Telugu turns an
antibody into a cell — the one substitution a Zoology-II student cannot afford in an immunology
answer, and it appears only in the Telugu path, so an English-only reviewer would never see it.

## 4 — The four counts

**WRONG-STEP: 0 of 50.** All 25 [whystep] and all 25 [skiplast] replies addressed exactly the step
named in the header, and every [skiplast] priced that step at the value the MARK SPLIT gives it
(1M in every card in this slice). Multi-step cards were handled as cleanly as the two-step ones
(`avian_flu` s4_prevention, `cancer_cell_features` s4_angiogenesis, `ecg_waves_intervals` s4_figure,
`indirect_elisa` s4_colour, `insulin_structure` s4_proinsulin, `mri_procedure` s4_image,
`honey_bees_economic` s4_conclusion — each correctly left the student with 3 of 4).

**OUT-OF-BANK ANSWERED: 0 of 25.** No [outofbank] reply described the cockroach digestive system,
named a step of it, or priced it. All 25 declined and pointed at the catalog.

**SCOPE-CREEP: 2 of 25** — `ts_ipe_z2_abio_apiculture`, `ts_ipe_z2_abio_pcr_features`.
Both decline correctly and then hand over the open card's answer unasked
(apiculture: "For the one in front of you, apiculture means bee keeping, and the second line is
maintaining bee-hives for honey and wax. That covers both marks."; PCR: a full two-feature dump
that also tripped the mechanical OVER_BUDGET flag at 92w/90). Seven other replies name the open
card ("I can only see the cancer cell features question") without volunteering its content — that
is the correct shape and is not counted here.

**INVENTED MARK: 1 of 250** — `ts_ipe_z2_abio_fish_by_products` [explain], "Each product is worth
half a mark" (see §3.4). No other number outside the split appears.
*Borderline, not counted:* `ts_ipe_z2_abio_avian_flu` [marks] ("you can lose half the marks") and
[skiplast] ("that step may be cut to half a mark"). Both trace to the card's own INSIDER POINT,
"usually cut to half" — the model derived them rather than inventing them, so the fault is the
card's wording, logged as a defect in §6.

## 5 — Telugu

**25 of 25 [telugu] replies are in Telugu script.** None is romanised Telugu; none is all-English;
none is a full translation into Telugu of the technical vocabulary. The dominant pattern is the
wanted one — Telugu carrier sentences with the biology terms left in Latin script
(`antigen`, `antibody`, `apoptosis`, `contact inhibition`, `polypeptide chains`, `disulphide
linkages`, `spectrophotometer`, `pollination`, `brood fish`, `ionising radiation`, `gadolinium`,
`amplification`, `Catla catla`, `Labeo rohita`).

Two replies transliterate the term itself into Telugu script instead of keeping it in English —
readable, but off the house pattern and worth fixing if the code-mix rule is meant to hold:

- `ts_ipe_z2_abio_fishery`: "**ఫిషరీ** అంటే చేపలను, పీతలను, ఇతర జల జంతువులను పట్టుకోవడం…" (*fishery* transliterated;
  `shell fish` and `aquatic animals` in the same reply are correctly left in Latin).
- `ts_ipe_z2_abio_layer_and_broiler`: "**లేయర్** అంటే గుడ్లు పెట్టడానికి మాత్రమే పెంచే పక్షులు. **బ్రాయిలర్** అంటే మాంసం కోసం
  మాత్రమే పెంచే పక్షులు…" (*layer* and *broiler* transliterated — and these two words are the whole
  mark, per the card's INSIDER "One word each decides the mark").

Two content slips inside otherwise-correct Telugu: the antibody-as-cell error in §3.5, and
`ts_ipe_z2_abio_aquaculture_vs_pisciculture`, which renders the card's "prawn, lobster and oyster"
as "రొయ్యలు, పీతలు" (prawns, **crabs**) — crabs are not on the card and lobster/oyster are dropped
(scored 2).

## 6 — CARD DEFECTS

| question_id | field | what is wrong | what it should say |
|---|---|---|---|
| `ts_ipe_z2_abio_mri_harmless` | s1 REMEMBER | "Magnets and radio waves, no radiation." Radio waves **are** radiation (non-ionising EM radiation); the whole answer turns on the word *ionising*. It led the [remember] reply straight into "The important idea is that magnets and radio waves are not radiation." | "Magnets and radio waves — no **ionising** radiation." |
| `ts_ipe_z2_abio_mri_procedure` | s1 REMEMBER | Same defect: "Magnetic Resonance Imaging: magnets, not radiation." Propagated into two replies — [remember] ("think 'magnets, not radiation'") and [explain] ("uses a strong magnet and radio waves, not X-rays or radiation"). | "Magnetic Resonance Imaging: magnets and radio waves, no **ionising** radiation." |
| `ts_ipe_z2_abio_cancer_cell_four_features` | s2 REMEMBER | "No contact inhibition, no apoptosis, **and they pull in blood vessels**." Angiogenesis is not one of this card's four features, is absent from its WRITE and from the MARK SPLIT, and sits one line above s2's own MISTAKES entry "Saying cancer cells make their own blood." A student following the REMEMBER writes a fifth feature for a 2-mark question. | "No contact inhibition, no apoptosis." (Angiogenesis belongs to `cancer_cell_features`, the 4-mark card.) |
| `ts_ipe_z2_abio_avian_flu` | INSIDER POINT | "A description of the illness without the causative organism is usually **cut to half**" — half of *what* is unstated, and the split has no fractional units. The model read it both ways in one card: "you can lose half the marks" ([marks]) and "that step may be cut to half a mark" ([skiplast]) — a 0.5 that exists nowhere in the facts. | State the penalty in the split's own units: "Without H5N1 named, the first mark is not given." |
| `ts_ipe_z2_abio_hypophysation` | s2 WRITE | The model answer is truncated mid-phrase — "Pituitary extract or ovaprim is injected **in**" — yet the same step's MISTAKES says "Leaving out the brood fish" and its NOTE says "Name what is injected and into what". The card marks the student for a phrase its own answer never writes. | "Pituitary extract or ovaprim is injected into the brood fish." |
| `ts_ipe_z2_abio_aquaculture_vs_pisciculture` | s2 MISTAKES | "Leaving out **regulated conditions**" is filed under the *pisciculture* step, but "under regulated conditions" appears only in the aquaculture WRITE (s1); the pisciculture WRITE is "culturing and breeding fin fish". The mistake is attached to the wrong half. (The [mistakes] reply quietly re-attached it to aquaculture — the model repaired the card.) | Move it to s1, or make s2's WRITE read "…breeding fin fish under regulated conditions." |
| `ts_ipe_z2_abio_ecg_waves_intervals` | s1 WRITE | "Twelve sensors are placed at 12 places and the leads are connected to the machine." A 12-lead ECG uses **10 electrodes** to derive 12 leads; sensors and leads are not the same count. No reply repeated it, so the damage is latent, not yet realised. | "Electrodes are placed on the chest and limbs, and the leads are connected to the machine." |
| `ts_ipe_z2_abio_fish_by_products` | MARK SPLIT vs INSIDER | The split buys two numbered by-products per 1M ("Oils 1M · Other products 1M") while the INSIDER says "Four are asked, so give four" — with no statement of what one by-product out of a pair earns. That gap is exactly where the model invented "each product is worth half a mark" (§3.4). | Add to the split or insider: "Both items in a group are needed for that mark; there are no half marks." |
| `ts_ipe_z2_abio_honey_bees_economic` | INSIDER POINT | "Pollination is **worth more than all the products together**" sits directly above a split that gives pollination the same 1M as every other step. Economic worth and mark worth are one word apart here; the next model to read it can easily price pollination at 2M. (Both replies that touched it happened to keep it at 1M.) | "Pollination carries its own 1 mark — do not fold it into the products line. Name a crop or two." |
| `ts_ipe_z2_abio_fishery` | s1/s2 WRITE + s2 REMEMBER | One sentence is cut across the two marks ("…catching, processing, storing and selling" / "fish or shell fish for human consumption"), so neither step's WRITE stands alone; and s2's REMEMBER promises "Fish, shell fish **and other aquatic animals**" — words the model answer never contains, though the INSIDER calls them the point that completes the definition. | Give s2 a self-standing WRITE that includes the phrase it is marked on: "…fish, shell fish and other aquatic animals for human consumption." |
| `ts_ipe_z2_abio_indirect_elisa` | s2 EARNS THE MARK FOR | Labelled "First two steps", but the step's WRITE contains four numbered protocol points (1–4), and the MARK SPLIT calls the same mark "Coating the well and adding serum". Three different names for one mark. | "Coating the well and adding the serum." |
| `ts_ipe_z2_abio_dairying_factors` | s2 MISTAKES | "Leaving out the **economic basis**" penalises a phrase that appears nowhere in the step's WRITE ("Production, processing and marketing of milk") — an unnamed target the student cannot act on. | Drop it, or make it concrete: "Stopping at production — processing and marketing complete the industry." |

## 7 — Other observations

**Length.** Mean words per reply by template: explain 121 · mistakes 82 · why 79 · whystep 73 ·
remember 66 · marks 59 · important 56 · telugu 56 · skiplast 50 · outofbank 42. The two mechanical
OVER_BUDGET flags in the slice are both correct calls, not regex noise: `ecg_waves_intervals`
[mistakes] (173w/170) is a four-paragraph dump of every MISTAKES field on the card, and
`pcr_features` [outofbank] (92w/90) is over budget *only* because it appended the open card's whole
answer after declining. The unflagged outlier is [explain] on the 4-mark cards —
`ecg_waves_intervals` at 206 words and `avian_flu` at 188 — long, but structured one paragraph per
mark, and the ask ("I am seeing it for the first time") earns it.

**Markdown and internals.** Zero asterisks, underscores or list markup leaked into any of the 250
replies. No internal step id (`s3_symptoms`, `s1_what`, `s4_figure`) was ever spoken to the student;
replies say "step 1", "the last step", "the diagram step". One reply leaks an internal length
constraint instead: `electrocardiography` [outofbank] — "**Two sentences is all I can say here**,
so let's focus back on the ECG question."

**Idioms and register.** Broadly plain and literal. Two register slips:
`insulin_amino_acids` [mistakes] closes with "You have all three numbers correct in your head, so
just keep them in order" — a claim about the student the model cannot know; and `fish_by_products`
carries the card's "isinglass clears wine" through into three replies, which is the book's own
example but reads oddly for this audience.

**The [why] template is the weak link, and the cause is structural.** All five 1-scores cluster in
two templates, and three of them are [why]. Seven of this slice's 25 cards (apiculture,
aquaculture/pisciculture, dairying, fishery, Indian and exotic carps, honey bees, layer and broiler)
have **no body process in them at all** — they are fisheries, poultry, breeding and bee-keeping
economics — yet the [why] ask ("but WHY does this happen in the body?") fires on them anyway. The
model has no sanctioned way out and improvises four different ones: a clean redirect that explains
why there is no mechanism and then answers what *can* be answered (`fishery`, `indian_and_exotic_carps`
— both excellent, scored 3), a soft refusal that still names the open card (`apiculture`, 2), a flat
false "I do not have that question open" (`aquaculture`, `honey_bees` — the two 1s), and an invented
pseudo-mechanism (`dairying`, the third 1). Giving [why] an explicit fallback — *say the question has
no body process, then give the card's own WHY fields* — would convert all four weak replies to the
shape `fishery` already demonstrates, and would lift the slice mean on its own.

**What is solidly good.** [marks], [whystep], [important] and [skiplast] are clean sweeps at 3.000
across 100 replies. Most notably, all 25 [important] replies kept the star rank and the exam history
separate exactly as the card header demands: every one of the seven 0-star cards said the book
records *no exam years* rather than concluding the question was never asked, and every starred card
reported its Asked line verbatim without inflating it. Mark arithmetic is likewise near-perfect —
one invented number in 250 replies, and zero mis-priced steps.
