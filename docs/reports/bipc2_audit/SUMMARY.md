# BiPC second-year IPE Answer Book — audit and repair, 2026-09-04/05

Every card of both second-year Biology papers was examined against NCERT Class 11/12 Biology, the
same method the MPC second-year audit used: an examiner re-derives the answer before reading the
card, then reads every prose field, then the figure. Every card was also driven through the Vidi
chatbot with the standard 10-ask battery and graded blind against the ANSWER FACTS it was actually
given. Full detail sits in the files beside this one (`B2-01..22`, `Z2-01..15`, the figure reviews
`FIG-B2.md`/`FIG-Z2.md`, the chatbot grading `VIDI-B2-01..07`/`VIDI-Z2-01..06`).

## What was found

| Paper | Cards | HARMFUL | WRONG | WEAK |
|---|---|---|---|---|
| Botany-II | 167 | 11 | 120 | 254 |
| Zoology-II | 147 | 13 | 124 | 182 |
| **Total** | **314** | **24** | **244** | **436** |

- **HARMFUL** = wrong content a student would copy into an exam and lose marks for.
- **WRONG** = incorrect but not exam-costing.
- **WEAK** = quality, register, Rule 41.

Figures, read separately: **8 of 17** Botany-II figures had a defect; **13 of 14** Zoology-II
figures had one — worse than either science paper the MPC audit measured. Zoology-II's included a
heart whose great vessels sprang from the atria and a kidney still drawn as a crescent with no
hilum, the exact defect class the Zoology-I handover recorded as caught once already.

## All 24 HARMFUL findings — repaired, every one

Repaired in two commits: text (`c46edaf9`), figures (`690547f3`). Nine text fixes per paper, plus
2 figure-only harmfuls on Botany-II and 4 figure-only harmfuls on Zoology-II (one card, the male
reproductive system, carried two independent figure defects).

Every one shares a shape: a card contradicting itself, or a printed line/leader that says something
its own neighbouring field already says is false.

**Botany-II** — pressure potential claimed "always positive" and gave the ascent of sap as its
example, the textbook case of *negative* pressure potential · gibberellins credited with "promoting
fruit ripening," ethylene's job, four lines above the same card's own "gibberellins DELAY
senescence" · IBA named a synthetic auxin where NCERT isolates it from plants alongside IAA ·
Griffith credited with identifying DNA as the genetic material, which was Avery, MacLeod and
McCarty · the root-nodule steps put the bacteria in the cortex before the infection thread that is
supposed to carry them there · a boxed cry-gene answer where one token, "Ab," stood for two
different genes on either side of a semicolon · "Only Aa × Aa can produce a recessive offspring"
boxed on a card whose own first step works Aa × aa to a 1:1 ratio that includes a recessive class ·
the law of dominance's insider note claiming four statements against the card's own three · the
T-even phage figure drawing five tail pins under a card that says six twice · the lac operon
figure's first phase captioned "the six genes of the operon" for an operon of four genes plus a
promoter and an operator.

**Zoology-II** — asthma called a form of COPD one line after the same card teaches COPD as
chronic bronchitis and emphysema alone · a nephron's two parts given as Bowman's capsule and the
renal tubule, dropping the glomerulus, against the card's own mistakes line · red muscle fibres
said to store oxygen *in the mitochondria*, contradicted by the same step's own WHY line naming
myoglobin · leeches listed as an open-circulation example on a card whose boxed line puts Annelida
in the closed column · "every gene is expressed phenotypically," stated without the X-linkage
qualifier its own carrier-daughter cross needs two lines later · anti-D given "when she is
pregnant," after the sensitisation the card's own earlier steps describe, instead of right after
the first delivery · a transgenic-animal example naming a drug, not an animal · a boxed
hypophysation answer truncated mid-word ("is injected in") that the step's own margin note,
mistakes line and memory tip all say must name the brood fish · a protein-digestion insider note
demanding four separate reaction *lines* the card was never authored to have · the synovial
joint's outer/inner membrane leaders each landing one structure short · the colour-blind daughters
cross drawing four of eight gamete lines to the wrong child, an anatomically impossible diagram ·
the male and female reproductive figures' vas-deferens-through-the-bladder-wall and
myometrium/perimetrium-swap defects.

## All 244 WRONG findings — checked, and repaired where real

Beyond HARMFUL, every WRONG-level finding from both examiner audits was also worked: re-derived
against NCERT, checked against the card (about one proposal in eight needed rewording or a
different fix, matching the rate the MPC audits measured), applied where real, declined where the
proposal was itself wrong, and referred to a teacher where the finding was a genuine convention
dispute rather than a repair. Repaired in five commits (`30a984a7`, `12226ec4` — Botany-II;
`d6daa6da`, `6540f7b4` — Zoology-II; `b4556c84` — one figure defect found only during this pass).

| Paper | WRONG found | Applied | Referred to a teacher |
|---|---|---|---|
| Botany-II | 120 | 117 | 6 |
| Zoology-II | 124 | 113 | 10 |

The dominant shape, both papers: an insider note or margin note asserting a mark-scoring rule the
card's own `mark_split` does not support — "loses two marks straight away," "marked as half an
answer," "the mark is halved," "each is a separate tick." These were removed bank-wide and replaced
with a statement of what the complete answer contains, never what a partial one scores. Second
most common: a flat prohibition banning a real, NCERT-supported exception — chlorosis IS a symptom
of potassium deficiency, a vaccine DOES exist for hepatitis-B, RNA viruses DO include a named
bacteriophage, the pulmonary artery DOES carry deoxygenated blood.

One real defect surfaced only by a repair agent re-deriving a figure from scratch, not by either
examiner audit or the chatbot: the urinary-system figure gave each kidney only one renal vessel (a
vein on one side, an artery on the other) instead of both. Fixed and re-rendered.

Sixteen findings were referred to a Telangana biology teacher rather than resolved, on top of the
teacher-gate questions below — each is a case where the examiner's own finding named a genuine
convention dispute (karyotype notation used both ways in one paper, the seminiferous-tubule count,
which naming convention a figure caption should use) rather than a correctable error.

WEAK-level findings (436 across both papers — register, duplicated prose, Rule 41 wording) are
recorded in the per-group reports but not repaired in this pass; they do not cost a student marks.

## Vidi chatbot score

| paper | replies | mean/3 | out of 10 |
|---|---|---|---|
| Botany-II | 1,670 | 2.908 | **9.69** |
| Zoology-II | 1,470 | 2.918 | **9.73** |

Inside the fleet's 9.6–9.9 band (physics 9.9, chemistry 9.64, Maths-2A 9.94, Maths-2B 9.90,
Physics-II 9.86, Chemistry-II 9.96). **Standing caveat, unchanged from the MPC audits: a slice
graded twice differed by 0.07 in that earlier run** — six times the 0.01 gap between these two
papers — so the enumerated defects are the reliable output of this method, not the third decimal.

Mechanical results across the full 3,140-call battery, both papers: **zero** WRONG-STEP (a
[whystep]/[skiplast] reply pricing the wrong step), **zero** out-of-bank questions actually
answered (the model always declined correctly), **one** invented mark. Six grading defects
independently **confirmed** examiner HARMFUL findings by measuring the model's actual replies
rather than reading the card in isolation — water potential's "always positive" claim (repeated in
all ten replies to that card), the action/absorption spectrum swap, IBA called synthetic,
gibberellins "ripening" fruit, the law of dominance's three-vs-four statements, open-vs-closed
circulation's leech contradiction, the erythroblastosis anti-D timing, the unqualified "every gene
is expressed" line, and the truncated hypophysation answer — cross-instrument confirmation is the
strongest evidence a finding can get.

Two mechanical gaps worth carrying forward: the ONE invented-mark hit in 3,140 calls was missed by
the automated `MARK_SUM` gate, which instead flagged an unrelated, correct card as a false
positive. Four Neural Control cards in Zoology-II hand the model a Musculo-Skeletal question
("triad system") as "this chapter's other most-asked" — a chapter-mates grounding-builder bug,
latent on every one of those four cards, that never fired live in this run.

## What is NOT a defect — verified, not "fixed"

**Botany-II's `stars: 0` on all 167 cards is deliberate**, not a data gap. Verified directly in
`units.json`: every Botany-II entry carries `stars: 0` while 115 of 147 Zoology-II entries are
non-zero. This is documented in `docs/BOTANY_2_START_HERE.md` §3: the Botany-II source book ranks
importance only at chapter level, never per question, unlike the Zoology books — `appearances[]`
(populated on 123 of 167 cards) is the correct per-question signal instead. **Do not populate
`stars` for Botany-II in any future pass.** The Vidi grader's "0 of 3 despite exam years" complaint,
raised independently in all seven Botany-II slices, is real but is a wording issue in the
`[important]` template (which should read `appearances[]`, not `stars`, for its frequency claim) —
a platform/persona fix, out of scope for a content-repair pass.

## Platform work landed alongside the audit

- **PR #200** (merged into this desk): the Vidi subject ladder gains botany / botany_2 / zoology /
  zoology_2 — previously all four fell through to `physics`, in both the deployed Edge Function's
  mirror and the audit harness (`vidi_audit.ts`), so a biology student's Telugu reply was steered
  by the physics term whitelist and a biology audit would have run the ideal-gas bait.
- **The `bipc_2` stream**: `--stream=bipc_2` now builds a standalone Senior Inter BiPC artifact
  (Botany-II, Zoology-II, Physics-II, Chemistry-II — matching the door's existing promise). A
  combined door build (`mpc,mpc_2,bipc_2`) needs a founder decision: physics_2/chemistry_2 would be
  claimed by two streams inside one artifact, which the build's own guard correctly refuses today.

## What gates cannot see, that this audit found by hand

- A leader line ending one structure short of its target, found on five separate figures across
  both papers (nephron, synovial joint, myometrium, root nodule, lac operon) — `figlib.check()` has
  no leader-endpoint test.
- Neither paper has any of its figure label strings measured in `label_widths.json` — every width
  check ran on the ~30%-inflated `9.9u/char` fallback in all 31 figures across both papers.
- A card asserting three different counts of the same thing in three of its own fields
  (`pea_plant_advantages`: "seven reasons" in the insider note, nine numbered lines in WRITE, a
  floor of six in MISTAKES).
- The four-way collinear-stroke defect on the T-even phage (sheath/stria/core drawn as one
  unbroken line) and the drum-shaped TMV rod — both passed every structural gate because nothing
  checks aspect ratio against a card's own printed dimensions.

## Teacher-gate questions

Roughly 90 conventions raised across both papers' reports — genuinely contested between NCERT and
the Indian guide texts these books are built from, or mark splits with no board paper to confirm
them against. None are repairs; each needs a Telangana biology teacher's ruling. Representative
examples: karyotype notation used both ways (44XX/22X *and* 46,XX/23,X) inside the same Zoology-II
group; ATP-or-GTP at the Krebs cycle's seventh step; three-or-four papillae types; whether IBA
counts as natural or synthetic in the board's own key (settled here per NCERT, flagged for
confirmation); the Calvin-cycle-at-4-marks question (already settled by the founder 2026-08-29 —
not reopened).

## Verification run

`tsc --noEmit` 0 · `vitest run` 459/459 · `check_cards` 167/167 (b2) + 147/147 (z2) · `check_figure_pace
--strict` PASS on all seven prefixes including both papers · `backtest:botany2` / `backtest:zoology2`
PASS · `check:papers` / `check:xrefs` / `check:originality` PASS · `build:answers` 3,290 cards ·
`find_label_clashes` on the whole built book: 4 → 1 (the remainder is a pre-existing Maths-2A card
outside this audit) · `measure_wrap` zero regressions on either paper · a five-card spot-check of
the built page (three text-only fixes, two rebuilt figures) confirms zero console errors and the
corrected text embedded correctly.

## Is the second-year BiPC book ready for students? — the honest answer

**Content: yes, for what a careful re-derivation can certify.** Every HARMFUL finding — the kind a
student would copy into an exam and lose marks for — is fixed and verified against NCERT, in both
the text and the figures. Every WRONG finding was also worked, not just recorded: 230 of 244 fixed,
the rest correctly referred to a teacher rather than resolved by guessing. The chatbot is faithful
to the now-corrected bank at 9.7/10 on both papers, with zero critical flags (no invented mark
reaching a student, no wrong-step pricing, no out-of-bank content ever actually answered) across
the full battery.

**Three gaps this audit does not close, matching the MPC precedent exactly:**
1. **No teacher has verified a single card.** `needs_teacher_verification: true` stands on all 314.
   The ~90 teacher-gate questions above are the concrete list a Telangana biology teacher would work
   through first.
2. **Every mark split is the bank's own claim.** No Telangana Botany-II or Zoology-II board paper
   exists to back-test against — both papers' back-tests (`backtest:botany2`, `backtest:zoology2`)
   check coverage against their own guide-book's model/guess papers only, which is the strongest
   check available for a single-source paper, not a substitute for a real board paper.
3. **This audit checked that what is there is correct.** It did not re-run a fresh coverage
   transcription against the source books' full index — both back-tests still pass, so no new
   coverage gap was found, but neither is a from-scratch re-transcription.

**Not deployed.** No Edge Function redeploy, no `content:push`, no `deploy:answers` — deploying
remains the founder's gate (Rule 17).
