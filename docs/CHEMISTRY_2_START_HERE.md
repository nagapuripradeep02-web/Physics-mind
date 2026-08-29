# Senior Chemistry (Chemistry-II) — start here

The IPE Answer Book's **sixth subject** and its **first second-year paper**. Everything before
this — Physics-I, Maths-1A, Maths-1B, Chemistry-I, Botany, Zoology — is first year.

Desk: worktree `C:\Tutor\physics-mind-ipe-answerbook-sr-chemistry`, branch
`feat/ipe-answerbook-sr-chemistry`, based on `origin/master`.

## 1. Identity

| | |
|---|---|
| `subject` | `chemistry_2` |
| question ids | `ts_ipe_c2_<unit-abbr>_<slug>` |
| `year_cycle` | `second_year` — **the first non-`first_year` card in the bank** |
| `class_label` | `Intermediate II Year (Class 12)` |
| `board` / `board_label` | `ts_ipe` / `Telangana — Board of Intermediate Education` |
| unit numbers | **1–18**, book order (see §3) |
| unit name suffix | ` (Chemistry-II)` |

**Why a new subject value and not more units under `chemistry`.** One PAPER = one subject
value — the rule the schema states itself, and the reason `mathematics_1b` is not "more units
under `mathematics`". Unit identity is `${subject}-${number}`, so Chemistry-II unit 1 filed under
`chemistry` would collide with Chemistry-I unit 1 and hard-fail the build. `year_cycle` is a
display and filter attribute on top; it does **not** namespace anything.

Marks follow the **unchanged** TS second-year science paper — 60 marks, Section A 10x2, Section B
6-of-8 x4, Section C 2-of-3 x8. So **VSAQ = 2, SAQ = 4, LAQ = 8**, and `paper_section` is
`Section A` / `Section B` / `Section C`.

## 2. The source, and the two checks that are impossible

`C:\Users\PRADEEEP\Downloads\sr.chemistry.pdf` — the chemistry half of **"FAST TRACK IPE for
Sr. Students"**, 59 pages. **PDF p.1 = printed book p.62; book page = PDF page + 61.** It pairs
with `...\Downloads\Telegram Desktop\sr.physics (1).pdf`, the physics half of the same book.

Read the source every time. Never author from a previous session's transcription of it.

**Two structural checks cannot be run for this subject, and that is recorded, not hidden:**

1. **No two-book union check.** The TSBIE Basic Learning Material on hand is physics-only and
   first-year. There is no second book to union against.
2. **No board back-test.** `answer-book/papers/` holds seven TS papers, all `ts_ipe_p1_*`, all
   first year. No second-year chemistry paper exists in the corpus.

Both are the same call made for Chemistry-I and Botany: proceed Fastrack-only and **record the
gap on every card** (`verification.note`), in the `units.json` comment, and here. A later session
must never read "not checked" as "checked and clean".

**This book prints no star ranks at all** so `stars: 0` goes on every manifest entry. The pen
ovals around question numbers in units 12 and 14 are a previous reader's handwriting — confirmed
by the `CSP` and `SAS` marginalia and a stray pen stroke on the same spreads. They are **not**
signal.

**Exactly three questions carry a year citation** in the whole book. Author `appearances` for
these three and `[]` everywhere else:

| Unit | Question | Printed citation | `appearances` |
|---|---|---|---|
| 2 Solutions | VSAQ 16 (define mole fraction) | `(March 2014, June 2015)` | `[{"year":2014},{"year":2015}]` |
| 9 VIIA Group | VSAQ 9 | `(June 2015 TS)` | `[{"year":2015,"board":"ts_ipe"}]` |
| 13 Biomolecules | VSAQ 22 | `(May 2014)` | `[{"year":2014}]` |

## 3. The 18 units

12 numbered chapters, but **18 question-bearing units**: chapters 7 and 12 are pure containers
whose unnumbered shaded sub-boxes **restart numbering at 1**. They are split because `ref` must
be unique within a unit — a merged chapter 7 would carry four `vsaq1` refs and fail the build.

| Unit | abbr | Book ch. | Name | PDF pp | VSAQ | SAQ | LAQ | Cards |
|---|---|---|---|---|---|---|---|---|
| 1 | `ss` | 1 | Solid State | 1–3 | 13 | 7 | – | 20 |
| 2 | `sol` | 2 | Solutions | 4–7 | 16 **+3** | 5 **+1** | – | 25 |
| 3 | `ec` | 3 | Electro Chemistry | 8–11 | 10 **+1** | 4 | 6 | 21 |
| 4 | `ck` | 4 | Chemical Kinetics | 12–15 | 12 | – | 6 | 18 |
| 5 | `sc` | 5 | Surface Chemistry | 15–18 | 16 | 8 | – | 24 |
| 6 | `met` | 6 | Metallurgy | 18–21 | 11 | 7 | – | 18 |
| 7 | `va` | 7a | VA Group Elements | 22–23 | 15 | 1 | 2 | 18 |
| 8 | `via` | 7b | VIA Group Elements | 23–25 | 8 | 1 | 1 | 10 |
| 9 | `viia` | 7c | VIIA Group Elements | 25–28 | 9 | 2 | 2 | 13 |
| 10 | `ng` | 7d | Noble Gases | 28–29 | 9 | 3 | – | 12 |
| 11 | `df` | 8 | d & f Block Elements | 30–33 | 12 | 8 | – | 20 |
| 12 | `pol` | 9 | Polymers | 34–37 | 24 | – | – | 24 |
| 13 | `bio` | 10 | Biomolecules | 38–43 | 23 | 14 | – | 37 |
| 14 | `cel` | 11 | Chemistry in Everyday Life | 44–45 | 17 | 3 | – | 20 |
| 15 | `hal` | 12a | Halo Alkanes & Halo Arenes | 46–47 | 6 | 3 | – | 9 |
| 16 | `ape` | 12b | Alcohols, Phenols and Ethers | 47–51 | 5 | 10 | 2 | 17 |
| 17 | `akc` | 12c | Aldehydes, Ketones and Carboxylic Acids | 51–54 | 8 | 5 | 1 | 14 |
| 18 | `ocn` | 12d | Organic Compounds Containing Nitrogen | 54–59 | 9 | 10 | 1 | 20 |
| | | | **Total** | | **227** | **92** | **21** | **340** |

The bold **+n** cells in units 2 and 3 are the five PROBLEMS (§ below), which carry no printed
section of their own — they are the only cards in the subject whose section is inferred.

**This table was wrong once, and the unit agent caught it.** It first read unit 16 as VSAQ 1–3
and the subject as 333 cards. The agent authoring that unit counted 1–5 and named the two it
found — "Identify the reactant needed to form t-butyl alcohol from acetone?" and "Give the
reagents used for the preparation of phenol from chlorobenzene?" — both in the LEFT column of
book p.109, while the right column had already begun "Short Answer Questions: 1". Checked against
the page and confirmed: the index had stopped at a column break. The reading order in this book
is left column then right column, and a chapter can hand over mid-column.

So: **count your own unit yourself and report the number.** If it disagrees with this table, say
so rather than trusting either. Seventeen of eighteen units matched; the eighteenth is the reason
the instruction exists.

Shape facts that are NOT uniform, so never assume:

- **Only 8 of 18 units have a Long Answer section** — units 3, 4, 7, 8, 9, 16, 17, 18. Author no
  8-mark form anywhere else.
- **Units 4 and 12 have no Short Answer section.** Unit 12 (Polymers) is VSAQ-only.
- **Unit 11 (d & f Block) prints Short Answer `6` twice**, on book pp.93 and 94 — 8 real SAQs
  behind a highest-printed-number of 7. Use refs `saq6` and `saq6b`, and say so in the manifest.
- Six units start **mid-page**, under the tail of the previous one. Walk from the question that
  CLOSES the previous unit to the one that OPENS the next.
- **The PROBLEMS sections ARE authored for this subject** (founder call, 2026-08-29), lifting the
  standing 2026-08-20 deferral here only. Unit 2 has four (`Problems : In text Questions`, book
  p.68) and unit 3 has one (`PROBLEM`, book p.72). With those five, **every printed question in the
  59 pages is in the bank.**
  - **No engine change was needed and none was made.** They ship as ordinary VSAQ/SAQ with **no
    `source` value** — the same as the 1,144 other entries that simply come from their book —
    rather than inventing a fourth `section` value across the build, the player and the gates,
    which is what the physics deferral was protecting against. A new `source` string would also
    have failed `check:papers`, whose `KNOWN_SOURCES` is a closed set.
  - **Their section and marks are the only inferred claims in the subject.** A PROBLEM belongs to
    no printed paper section, so the placement is authored, not read, and every one of the five
    says exactly that in its own `verification.note`. Four are VSAQ at 2 marks (single-formula
    calculations, the shape this book already asks as Very Short Answers in the same units); the
    vapour-pressure molar-mass one is SAQ at 4, matching unit 2's existing Short Answer 4, which
    uses the same relation.
  - **This follows the CHEMISTRY precedent, not the physics one.** Chemistry-I records that
    chemistry numericals sit inside the VSAQ and SAQ lists and *are* the asked bank, so the
    "belongs to no section" objection is weaker here than for a physics practice problem.

## 4. The bar a card must clear

Build-enforced, so this is not advisory. `npm run build:answers` fails on any of it:

- marks sum to the total — per question and per cut, in `steps[].marks` and in `mark_split[]`
- **every** step has `why` and a non-empty `common_mistakes`
- every step with `marks > 0` has `mark_note`; a step with `marks: 0` must have **no** `mark_note`
- `memory_tip` and `margin_note` are **all steps or none** per question — chemistry authors both
  on every step of every card
- `insider_note` on every card
- **Rule 41 plain language** in every string a student reads. Chemistry is unusually prone to
  breaking it: a reaction never "wants" to go right, electrons never "prefer" an orbital, an atom
  is never "happy", a system never "fights back", a bond never "holds on". The build's own check is
  `idiomsIn()`, a list of SIXTEEN chat phrases ("piece of cake", "nail it") written to grade Vidi's
  replies — it catches essentially none of the ways science prose breaks the rule. Run
  `npm run scan:register -- ts_ipe_c2`, which reports candidates for a human to judge, and read the
  prose as well. Real hits from unit 1, all of which passed every automated gate: "the ion moves
  house inside the crystal", "Lattice = the whole wall. Unit cell = one brick", "nowhere to get
  stuck", "shared with nobody", and four uses of "decides" where "determines" is the literal word.
  Chemistry's OWN vocabulary is not a violation (Rule 41b): a base donates a pair, an acid accepts
  one, charges attract and repel, atoms share electrons, an electron jumps to the conduction band,
  occupies an orbital, is trapped at a vacancy. Use the word the formula uses.
- `recall` blocks and `recall_prompt` are NOT authored; that feature is dormant.
- `verification.needs_teacher_verification` is `true` on every card (the merge script checks it).

### Notation

- **`render: "katex"` is not used by chemistry at all.** Chemical notation is expressible in
  Unicode: H₂SO₄, Fe³⁺, ⇌, →, ΔH, ΔG, ΔS, σ, π, °, ½, ×, α, β, ν. Chemistry-I added **zero**
  katex lines. Check the katex count before and after your unit; it must not move.
- **Unicode has a subscript x but none for y, z, p, c, v or w.** So write plain `px, py, pz, dxy,
  dz², Cp, Cv, Kp, Kc, Kw, Kf, Kb` — never a Unicode subscript mixed with plain letters. Same call
  as the plain i, j, k axis vectors in the mathematics cards.
- Organic structures are written as **linear Unicode**: `C₆H₅–NH₂ + CHCl₃ + 3KOH → C₆H₅–NC +
  3KCl + 3H₂O`. Reagents go over the arrow in words where the book does that. See §6 for when a
  structure earns a drawn figure instead.

### The cut limit you cannot author around

`applyCut` in `answer-book/notebook.js` overrides only `marks`, `label`, `lines`, `margin_note`,
`why`, `memory_tip`, `mark_note`. **`common_mistakes` and `insider_note` are NOT cut-overridable**
— a cut-level key for either is silently dropped. A card served at two lengths must have BASE text
that is true at every length. Chemistry-I shipped four cards whose 4-mark insider note reached
2-mark students.

## 5. Four ways a card contradicts itself

From the 2026-08-25 seven-examiner audit of all 196 Chemistry-I cards: 11 errors, 36 ambiguities,
54 gaps — and the **arithmetic was sound in all 76 numerical cards**. Every single error was in
the explanation layer, which is the layer Vidi is grounded on and no gate reads.

1. **A `common_mistakes` entry that names the CORRECT move as the error.** Four separate cases,
   including one card listing its own boxed formula as the mistake. **Read every mistakes entry
   back against that step's own marked lines before you finish.**
2. **`insider_note` contradicting its own `mark_split`** — claiming three of four marks sit on a
   step the split gives 2. The insider note is prose written last and checked by nothing.
3. **A trend stated as absolute while a sibling card boxes the exception.** Silence about an
   exception is what makes an AI state a trend backwards. In this book that risk is highest on the
   VA/VIA/VIIA group-trend cards and on the d-block ionisation-energy and colour cards.
4. **A count that disagrees with the card** — "four numbered points" written on a five-point
   answer.

**The book teaches what is MARKED, not what is true.** Where the source is wrong or sloppy, write
the correct chemistry on the card and record the book's printed position in that step's `why` and
in `verification.note`. Never silently follow an error, and never silently correct one either.
The senior Fastrack is known to contain outright typos — its physics half prints "In controlled
chain reaction, K > 1" and calls fission "fusion". Expect the same rate here and log what you find
in §9.

Sign conventions: use `ΔU = q + w` with w = work done **on** the system, `ΔH = ΔU + Δn(g)RT`
counting gaseous moles only, `ΔG = ΔH − TΔS`, and `ΔG° = −nFE°cell`. If the book uses the older
"work done by" convention anywhere, write the NCERT one and record the difference.

## 6. Figures — draw only what the question asks for

Founder decision for this subject. Chemistry-I authored **12 figures across 196 cards**; the
notation carried everything else. Target here is roughly **30–45 figures across 333 cards**.

Author a real figure only where the question says "draw the structure / shape / diagram", or
where the diagram *is* the mark. Everything else — reaction schemes, conversions, mechanisms — is
linear Unicode text. Likely figure sites: the Bragg diagram and band-theory pairs (unit 1), the
Daniel cell and standard hydrogen electrode (unit 3), the energy profiles (unit 4), the micelle
and dialysis apparatus (unit 5), froth flotation and the bauxite flow chart (unit 6), the
Xe/S/interhalogen shapes XeF₂, XeF₄, XeO₃, XeOF₄, SF₆, SF₄ (units 7–10), crystal-field splitting
and the cis/trans pair (unit 11), and the four drug structures in unit 14 SAQ 3.

**Diagram marks follow the ASKED question.** Only "draw a neat labelled diagram of ..." carries
diagram marks. Elsewhere the diagram step takes `marks: 0` and — because the schema forbids a
`mark_note` at zero — carries none, with the whole split on the written steps and that said in
`margin_note`.

**Pacing.** Give every stroke a real positive `ms` — the schema is `z.number().int().positive()`,
so a placeholder `"ms": 0` FAILS validation. Any plausible value will do; the orchestrator then runs
`npm run pace:figures -- --prefix ts_ipe_c2 --force --write` to retime every stroke to a uniform
70 u/s from its measured path length. `npm run check:figure-pace -- ts_ipe_c2` gates 40–160 u/s over `ts_ipe_c2` (the prefix became an argument on 2026-08-29; bare `check:figure-pace` is report-only).

**The phase constraint.** The zoology branch's phased-figure `pause` element is NOT on master —
`figureSchema` admits only `stroke` and `label`, so authoring a pause fails the build. The pace
gate demands phases above **16 drawn elements**, so keep every figure under 16. If a figure needs
more, split it across two diagram steps rather than raising the threshold.

**The renderer draws OUTLINES ONLY — no fills, no occlusion**, so "in front of" is impossible. A
later stroke adds lines; it never hides them. Depth comes from giving a structure its own clear
lane or drawing the part behind in dashed pencil.

**Then render every figure and LOOK**: `npm run figures:gallery -- ts_ipe_c2`. The gates catch
label overlap and clipped construction lines. They cannot catch a wrong shape, an off-canvas
label, or a label pointing at the wrong structure — Chemistry-I shipped a `dz²` orbital that
rendered as `dx²−y²`, and botany needed four iterations on a DNA helix, with every gate green
throughout. Leave **at least 40 figure units** of vertical clearance between labels whose
horizontal extents overlap; 28 fails.

This subject added four more proofs of the same point, all with every gate green: two Schottky
leader lines struck through the `+` and `−` signs they pointed at; XeF₆ drew six evenly spaced
bonds — a REGULAR octahedron — on a card whose own `common_mistakes` said the bonds are not evenly
spaced; the cyclic glucose ring bond ran to the anomeric `–OH` instead of the C1 carbon; and
carbon 6, the whole `CH₂OH` group, was simply missing from that structure.

**`figures:gallery`'s bounds check is optimistic and must not be trusted alone.** It estimates an
`sm` label as `8.5 × len × 0.8`, which under-measures real Kalam by roughly 10%. It reported "no
out-of-bounds labels" on a saccharin caption that was clipped at the canvas edge — the string
needed about 346 units against a 320 canvas. Leave real margin, or look.

## 7. Orchestration — one agent per unit, and nobody touches units.json

Each unit agent:

1. reads **its own PDF pages** from `sr.chemistry.pdf` (never another agent's transcription);
2. writes only `answer-book/questions/ts_ipe_c2_<abbr>_*.json` — its own unit's cards;
3. writes one manifest **fragment** to the scratchpad, `<scratch>/c2frag/unit_<NN>.json`;
4. touches **no** shared file — not `units.json`, not `package.json`, not the schema, not a doc.

Order the work **cards first**. An interrupted run loses everything that is not a finished card;
the zoology pilot was killed after building tooling and before writing a single one.

Fragment shape:

```json
{
  "number": 1,
  "name": "Solid State (Chemistry-II)",
  "subject": "chemistry_2",
  "questions": [
    { "ref": "vsaq1", "section": "VSAQ", "number": 1, "stars": 0,
      "text": "Define the term amorphous.",
      "question_id": "ts_ipe_c2_ss_amorphous_solid_definition" }
  ]
}
```

The orchestrator alone merges, sequentially:

```bash
python answer-book/tools/merge_units.py --subject chemistry_2 --prefix ts_ipe_c2 \
    --suffix "(Chemistry-II)" --fragments <scratch>/c2frag --stars-zero [--write]
```

It validates both directions (listed-but-missing, authored-but-unlisted), cross-bank id
collisions, per-file subject and unit agreement, and refuses to write unless `units.json`
round-trips byte-identically — so it can only ever touch this subject's units. Do **not** pass
`--no-appearances`: three cards legitimately carry years (§2).

**Stage a NAMED file list, never a directory.** A desk shared by nine agents always has in-flight
files, and one previous session committed a `units.json` listing 50 cards whose files were not
staged — a tree that fails the build.

## 8. Two sweeps no gate performs

- **Sweep every card against the WHOLE bank, not just this subject.** Nothing automatic catches
  cross-unit or cross-subject duplication; the drift gate only checks that an entry resolves to a
  file. The known collision is **unit 13 Biomolecules vs Junior Botany** — the botany session
  explicitly flagged "recheck when Chemistry-II opens". Units 1–2 may also brush Chemistry-I's
  `chemistry-4` States of Matter, and unit 3 may brush Physics-I on cells and resistance.
- **Line wrap.** `npm run measure:wrap -- ts_ipe_c2` renders every authored line in real Kalam
  26px and reports overruns. Budgets: `boxed` 535px, `eq` and `indent` 568px, everything else
  624px. One line must equal one ruled row. Chemistry-I shipped at 4.1%, the worst in the bank;
  botany reflowed to 1.3%. Reflow at word boundaries — a wrapped-but-correct answer beats a
  fitting-but-wrong one, so never shorten away a required term.

## 9. Where this book is wrong

Every case below is written correctly on the card that answers it, with the book's printed claim
recorded in that step's `why` and in `verification.note` — never silently followed, never silently
fixed. Roughly 130 findings across the 18 units; these are the classes that matter, with the worst
example of each.

**Wrong chemistry that a gate can never catch, because it balances or parses.**
- Unit 7 VSAQ 13: `Fe + 2HNO₃ → FeO + H₂O + 2NO₂`. The equation balances; the product does not.
  Concentrated nitric acid cannot leave iron at +2. Written as `3Fe + 8HNO₃ → Fe₃O₄ + 8NO₂ + 4H₂O`.
- Unit 11 VSAQ 2: a transition element is tested for by "an unpaired d electron in the penultimate
  shell". That gets zinc right by accident and **copper wrong** — Cu is 3d¹⁰4s¹ with no unpaired d
  electron, yet Cu²⁺ is 3d⁹. This is the definition the whole chapter rests on.
- Unit 11 SAQ 5: FeO offered as an interstitial compound. It is ionic rock-salt; its
  non-stoichiometry comes from cation vacancies.
- Unit 10 VSAQ 8: the closed shell printed "(ns² ns⁶)" — there is no ns⁶ sub-shell — and the
  electron gain enthalpy called "nearly zero" when it is large and **positive** for every noble gas.
- Unit 12 VSAQ 11 and VSAQ 3: a polyamide repeat unit `[NH₂–CHR–CO]ₙ` (nitrogen with four bonds and
  a charge) and a PHBV unit with five bonds on one carbon.

**The book contradicting itself, usually within two pages.**
- Unit 9: Deacon's process printed `4HCl + O₂ → 2Cl₂ + 3H₂O` on p.86 — unbalanced — and correctly
  with `2H₂O` on p.88.
- Unit 4: "Rate of reaction ∝ temperature" printed four lines above the Arrhenius equation.
- Unit 3: a galvanic cell "connected by external battery", contradicting the book's own figure on
  the same page; the lead-acid electrolyte given as 20% in one point and 40% in the next.
- Unit 6: the **smelting** paragraph printed verbatim under the **Roasting** heading.
- Unit 13: D-glucose said not to react with hydroxylamine, while the same book's table lists that
  oxime as evidence for the open chain.
- Unit 16: Dow's process at 300 atm on p.109 and 320 atm on p.111.

**Answers that do not answer the question.** Unit 1 SAQ 4 asks for two coordination numbers and
never gives them; unit 11 SAQ 3's question never lists what "the following" are (the eleven names
appear only inside the answer); unit 16 VSAQ 1 prints one molecule in the question and draws a
different one in the answer.

**One number reproduced wrong on purpose.** Unit 6 VSAQ 2 gives German silver as Cu 25–40%,
Zn 25–35%, Ni 40–50% — lower bounds summing to 90 and upper to 125. It is kept because it is what
the book marks, with the impossibility named on the card. The only such case.

**A judgement split, deliberately.** Unit 2 VSAQ 12 overrides the book (its "0.617 M" is the
molality, printed with the unit M) because the correct value is defensible and the error is gross.
Unit 2 SAQ 4 does **not** override (8 g from the dilute approximation, where exact Raoult gives
10 g) because NCERT prints 8 g too and a student should not hand an examiner a number nobody
expects. Both are recorded; a teacher settles both.

**What the five PROBLEMS added.** Unit 3's problem prints the equivalent mass of copper as **31**
where 63.5/2 = **31.75**, so its printed 0.39 g should be 0.395 g. Unit 2's problem 2 does the
opposite — it **settles** a contradiction, dividing by the volume of SOLUTION (the correct route)
where the book's own VSAQ 12 three pages earlier divides by the volume of WATER and prints the
resulting molality as a molarity. And problem 4 uses the dilute approximation where it is genuinely
**sound** (relative lowering 0.0059; exact 169.0 against approximate 170), the mirror image of unit
2's SAQ 4, where the same shortcut is applied at a relative lowering of 0.2 and the exact answer
differs by a quarter. Those two cards now cross-reference each other, so a student can see when the
shortcut is safe and when it is not.

**Where our numbers come from.** This book prints almost no numeric data. Nearly every value on
these cards — electron gain enthalpies, bond enthalpies, pKa and pKb, boiling points, magnetic
moments, reaction conditions — is standard NCERT Class 12, and **NCERT is not in this corpus**.
Those are the highest-value cells for a verifying teacher to spot-check.

## 10. Verify

```bash
npm run build:answers                  # marks, completeness, Rule 41, katex, unit keys, drift
npx tsc --noEmit                       # 0
npx vitest run
npm run check:figure-pace -- ts_ipe_c2 # 40-160 u/s over ts_ipe_c2
npm run measure:wrap -- ts_ipe_c2
npm run figures:gallery -- ts_ipe_c2   # then LOOK at the gallery
npm run smoke:answers                  # ~30 min at this fleet size
npm run serve:answers                  # localhost:8100
```

Two traps:

- **`dist` is shared and the smoke suite asserts the OFFLINE build.** Order is `build:answers`
  then test then `build:answers:mpc` then serve. `beforeAll` refuses to run against a hosted dist.
- **One gate is about 10 s** against a ~30 min full suite:
  `npx playwright test e2e/answer_book.spec.ts -g "<name>"`. A cold `page.goto` of the multi-MB
  page hangs about once per full run and passes in isolation — re-run the single gate before
  believing a failure. Stream long runs with `--reporter=line`; piping to `tail` buffers
  everything, so a killed run leaves no output.

**Registration is deliberately LAST** — see §11. Until it lands, `npm run build:answers` will
reject `chemistry_2` as an unknown subject. That is expected while cards are being authored.

**Never deploy.** `npm run deploy:answers` publishes to answers.viditra.co and is the founder's
call alone (Rule 17).

## 11. Registration — the last step, not the first

The senior-**physics** desk is building the shared second-year seam (`physics_2`, an `mpc_2`
stream carrying a `year` field, `window.PM_YEAR`, and the de-hardcoding of "First year" from the
eyebrow, door foot and OG card). Merge `origin/master` and take whatever has landed before adding
anything here. The `chemistry_2` delta on top:

| Class | Site |
|---|---|
| Build-blocking | `src/scripts/build_answer_book.ts` `SUBJECTS`; `src/schemas/answerBook.ts` `subject` enum |
| **Silent if missed** | `answer-book/notebook.js` `subjectWord` — falls through to `'physics'`, so every card would read *"The physics and the method are checked."* No gate catches this |
| Visibly wrong | `notebook.js` `SUBJ_LABEL` (prints the raw key `chemistry_2`); the meta-chip map (prints `Chemistry_2`); `notebook.js` `chapterLabel()` strip regex — widen to `Chemistry(?:-II)?` or the ` (Chemistry-II)` suffix shows in the chapter picker |
| Wrong grounding | the Vidi subject router keys on the **id prefix** in three places that must all learn `ts_ipe_c2_`: `src/scripts/answerbook_vidi_server.ts`, `supabase/functions/answerbook-vidi-chat/index.ts` (**keep byte-identical**), `src/scripts/vidi_audit.ts` plus its `SUBJECTS` cfg and a new out-of-bank probe in `src/lib/answerBook/vidiChecks.ts`. That probe **cannot be `NERNST_PROBE`** — Nernst *is* second-year chemistry, so the bait would be in-bank |
| Stream and copy | add `chemistry_2` to the `mpc_2` stream's `subjects`; update `mpc_2.blurb` and `build_og_card.ts` `subjects` (the blurb describes the artifact, not the ambition); `website/students.html` |
| Gates | raise the three fleet sweeps in `e2e/answer_book.spec.ts` from `1_200_000`. At ~0.8–0.9 s per entry, ~1,340 entries lands at ~1,080 s against a 1,200 s budget, so **`1_800_000`**. Never trim a sweep |

**Then grep every student-facing string for the previous subject's name and for the year.** Adding
Chemistry-I to a physics-only book left "Telangana IPE · **Physics** · First year" in the catalog
eyebrow and "your **Physics** exam" in Vidi's onboarding — both found only by looking at the
rendered page, one of them live.
