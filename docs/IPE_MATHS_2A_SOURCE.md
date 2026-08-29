# IPE Maths-2A — source analysis, paper blueprint, notation ledger

> Part-0 for the Senior Inter Maths-2A paper of the Answer Book, done 2026-08-29 on
> `feat/ipe-answerbook-maths-2a`. Companion to `docs/MATHS_2A_START_HERE.md` (identity, procedure,
> registration), `docs/IPE_MATHS_1A_SOURCE.md` (the same publisher's first-year book — every
> convention there transfers) and `docs/SYLLABUS_2026_27.md` §1b (why this paper is 75 marks).

## The source

`C:\Users\PRADEEEP\Downloads\Telegram Desktop\DocScanner 31-Oct-2022 5-49 pm.pdf` — **"SENIOR INTER
MATHS-2A, Baby Bullet-Q"**, Sri Publishers, Machilipatnam (SRI Publishers @STAR-Q). A phone scan
(DocScanner, 31 Oct 2022), 76 MB, ~122 pages, **no text layer** — every fact below was read from the
page images. PDF p.1 is a stray YouTube screenshot; PDF p.2 is the cover.

- **Book page = PDF page − 1.** ⚠ CORRECTED 2026-08-29, after all ten unit agents independently
  reported the same drift: this file first said −2, read off the front matter (PDF p.1 is a stray
  YouTube screenshot, p.2 the cover), and that held only for the first few sheets. From the LAQ
  section onward every agent measured −1 — book p.14 = PDF 15, p.48 = PDF 49, p.55 = PDF 56,
  p.63 = PDF 64, p.73 = PDF 74, p.85 = PDF 86, p.92 = PDF 93, p.111 = PDF 112. Ten readings, no
  disagreement. Every card's `verification.note` cites the **book** page, so the cards are
  unaffected; only a future reader opening the PDF needs this. **Read the page, not the offset.**
- Same series and layout as the Maths-1A source: a question bank organised by mark cut, with
  chapter stars, `TS 17,19` / `AP 15,22` year chips, `[N Marks]` margin tags printed page-by-page
  (never assume from the section — look at the page), `★★★ SSP n ★★★` Super Scoring Page headers,
  "BABY CHAT" / "Dhamaka" coaching register (never enters a card — Rule 41), Telugu-script asides.
- Index (book p.6): **LAQ chapters 1–6** (7M, pp.14–46) · **SAQ chapters 7–11** (4M, pp.48–68) ·
  **VSAQ chapters 12–19** (2M, pp.70–88) · **Star Questions Plus** (pp.89–95) · **Bullet Model
  Paper** (pp.96–110) · **5 Model Guess Papers** (pp.111–120).
- Answer numbering is CONTINUOUS through the book: 1–53 LAQ · 54–104 SAQ · 105–178 VSAQ · 179–~207
  Star Questions Plus, with `.1/.2` sub-numbers where twins share a heading.

## The paper blueprint — 75 marks, 24 questions, 3 hours

From the book's "IPE BLUE PRINT of MATHS-2A" (book p.3, "prepared according to the 'Model Question
Paper' issued by B.I.E.") and confirmed by all five model papers (pp.111–120):

| Section | Questions | Each | Answer | Total |
|---|---|---|---|---|
| A — VSAQ | Q1–Q10 | 2M | all 10 compulsory | 20 |
| B — SAQ | Q11–Q17 | 4M | any 5 of 7 | 20 |
| C — LAQ | Q18–Q24 | 7M | any 5 of 7 | 35 |

**This is the pre-reform maths shape, and it is STILL the second-year paper in 2026-27** — the
60-mark/8-mark-LAQ reform is first year only until 2027-28 (`docs/SYLLABUS_2026_27.md` §1b, two
press sources). So `PAPER_PATTERNS.mathematics_2a` is `ABC_75_MATHS_PRE_REFORM`, a 2A LAQ is
`marks_total: 7`, and when 2A moves to the new shape in 2027-28 every LAQ is re-cut 7 → 8.

**Topic is fixed by question number** (blueprint + the five model papers agree):

| Q | Chapter | | Q | Chapter | | Q | Chapter |
|---|---|---|---|---|---|---|---|
| 1, 2 | Complex Numbers | | 11 | Complex Numbers | | 18 | De Moivre's Theorem |
| 3 | De Moivre's Theorem | | 12 | Quadratic Expressions | | 19 | Theory of Equations |
| 4 | Quadratic Expressions | | 13, 14 | Permutations & Combinations | | 20, 21 | Binomial Theorem (**two** LAQs) |
| 5 | Theory of Equations | | 15 | Partial Fractions | | 22 | Measures of Dispersion |
| 6, 7 | Permutations & Combinations | | 16, 17 | Probability | | 23 | Probability |
| 8 | Binomial Theorem | | | | | 24 | Random Variables |
| 9 | Measures of Dispersion | | | | | | |
| 10 | Random Variables | | | | | | |

Chapter weights (blueprint): Complex Numbers 8 · De Moivre 9 · Quadratic Expressions 6 · Theory of
Equations 9 · P&C 12 · Binomial 16 · Partial Fractions 4 · Dispersion 9 · Probability 15 · Random
Variables 9. The book's own IPE-trend table (p.3) shows real papers deviating slightly
(AP May-22 counted 6 LAQ / 5 SAQ / 9 VSAQ).

## The 10 units — AS COUNTED, not as indexed (book pages; PDF = book + 1)

Authored 2026-08-29, one agent per unit, each walking its own pages to the boundary. The counts
below are what the pages hold, and **five of them disagree with the index this file first carried**
— every disagreement is named. 257 cards.

| Unit | abbr | Name | LAQ 7M | SAQ 4M | VSAQ 2M | Cards | of which Star Q | Stars |
|---|---|---|---|---|---|---|---|---|
| 1 | `cn` | Complex Numbers | – | 10 (pp.48–51, ans 54.1–62) | 28 (pp.70–72, ans 105.1–115) | **38** | 6 VSAQ (p.89, 179–184) | SAQ ★★ · VSAQ ★★★ |
| 2 | `dm` | De Moivre's Theorem | 10 (pp.14–19, ans 1.1–9) | – | 12 (p.73, ans 116–119.2) | **22** | 6 VSAQ (p.90, 185–190) | ★★★ both |
| 3 | `qe` | Quadratic Expressions | – | 7 (pp.52–54, ans 63.1–67) | 17 (pp.74–75, ans 120.1–126.2) | **24** | 1 SAQ + 3 VSAQ (p.91, 191–194) | SAQ ★★★ · VSAQ ★★ |
| 4 | `te` | Theory of Equations | 12 (pp.20–26, ans 10–19 + 1 PQ) | – | 12 (pp.76–77, ans 127–137) | **24** | 1 LAQ + 1 VSAQ (p.92, 195–196) | ★★★ both |
| 5 | `pc` | Permutations & Combinations | – | 12 (pp.55–58, ans 68.1–76 + 1 PQ) | 37 (pp.78–81, ans 138.1–155.2) | **49** | 1 SAQ + 4 VSAQ (p.93, 197–201) | ★★★ both |
| 6 | `bt` | Binomial Theorem | 20 (pp.27–35, ans 20–32) | – | 14 (pp.82–84, ans 156–168) | **34** | 5 LAQ + 1 VSAQ (pp.94–95, 202–207) | ★★★ both |
| 7 | `pf` | Partial Fractions | – | 15 (pp.63–68, ans 92–104 + 2 PQ) | – | **15** | none | SAQ ★★★ |
| 8 | `md` | Measures of Dispersion | 6 (pp.44–46, ans 48–53) | – | 8 (pp.85–86, ans 169.1–172.2) | **14** | none | LAQ ★★ · VSAQ ★★★ |
| 9 | `pb` | Probability | 8 (pp.36–39, ans 33–40) | 15 (pp.59–62, ans 77–91) | – | **23** | none | LAQ ★★★ · SAQ ★★ |
| 10 | `rv` | Random Variables & Probability Distributions | 8 (pp.40–43, ans 41.1–47) | – | 6 (pp.87–88, ans 173–178) | **14** | none | LAQ ★★★ · VSAQ ★★ |
| | | | **64** | **59** | **134** | **257** | **29** | |

Every count is the number of CARDS, read back from the authored files, not from the index — a
Star-bank backfill carries a real section, so it is inside its section's count and named again in
the "of which" column. The `.1/.2` twins are separate cards throughout (see correction 5).

**Where the index was wrong** — five corrections, each found by the agent that owned the pages:

1. **Binomial's LAQ chapter runs to answer 32, not 30** (book pp.27–35). Two whole questions were
   outside the range this file first printed.
2. **Binomial's VSAQ chapter runs to 168, not 167** — and answer **168 is Binomial**, not the first
   Dispersion question. Dispersion's VSAQ chapter opens at **169.1** on book p.85, which is why
   unit 8 counts 8 cards (169.1–172.2, four twin pairs) and not the "168–172" first written here.
3. **Partial Fractions starts at answer 92, not 90.** Answers 90 (conditional probability) and 91
   (complements of independent events) are still under the Probability banner on book p.62 — so
   **Probability's SAQ chapter runs 77–91, not 77–89**, and unit 9 holds 15 short answers, not 13.
4. **The Star Questions Plus banners are one page later than assumed for P&C.** The bank runs
   Complex Numbers p.89 · De Moivre p.90 · Quadratic p.91 · **Theory of Equations p.92** · **P&C
   p.93** · Binomial pp.94–95. There is **no banner at all** for Partial Fractions, Measures of
   Dispersion, Probability or Random Variables — four units correctly backfill nothing.
5. **The twins hide the real counts.** "ans 105–115" is 22 cards, not 11: 105–108 and 111 are
   `.1/.2` pairs and **110 is a sextuplet** (110.1–110.6, six modulus-amplitude conversions). Every
   heading in Quadratic's VSAQ chapter (120–126) is a twin, so 7 headings = 14 cards. Read the
   headings, never the range.

Beyond the printed answer numbers, **four unsolved "PQ" practice questions** carry a printed final
answer and no working (one under Theory of Equations answer 16, one under P&C answer 76, two under
Partial Fractions on book p.68). All four are authored as full cards, and each note says the
working is ours and reaches the book's printed answer.

Treatment of the other sections, as executed:
- **Star Questions Plus (pp.89–95)** — folded into the six chapter units that have a banner, section
  classed by shape and length (the banners name the chapter, never the mark cut), each note naming
  "Star Questions Plus, answer N" and saying the section is OURS. **Zero duplicates found** — no
  Star question repeats a chapter question in this book, unlike Maths-1A where two did.
- **Bullet Model Paper (pp.96–110)** — re-solved copies of hit-list questions arranged by paper slot
  Q1…Q24. Not cards. Used as a second, independent solution to cross-check arithmetic on roughly 80
  questions; **every one agreed**. No question exists only there.
- **5 Model Guess Papers (pp.111–120)** — questions only, each cross-referenced to an answer page
  ≤ 95. Used as the "paper position" evidence in every card's note (which of Q1–Q24 the chapter
  fills). Two of their answer-page indices are off by one (recorded below).
- **"IPE 24 QF" (pp.4–5)** — the formula sheet; not questions.

**Two structural checks cannot be run for this subject, and that is recorded, not hidden:** no
two-book union check (no second Maths-2A source in the corpus) and no BOARD back-test
(`answer-book/papers/` holds first-year physics only). Same call as 1A/1B/Chemistry-II: proceed
single-source and say so on every card and in the `units.json` comment. What replaced them here was
the boundary walk (read the page after the one you think is last — it is what found corrections 1–3
above), re-deriving every printed answer, and the model-paper back-test below.

## The model-paper back-test (2026-08-29) — 199 of 199, zero mis-cut cards

Run on the sibling Maths-2B session's advice, using the book's OWN papers as a substitute corpus
because no real second-year maths paper exists in `answer-book/papers/`. **This is not a board
back-test** and cannot show what the board asks that this book omits — but it is the only external
check available, and on 2B it caught three cards cut at the wrong marks.

The corpus is **199 slot-instances, not the 144 first assumed**: the five Model Guess Papers give
120 (5 × 24), and the **Bullet Model Paper is not a 24-question paper** — it is a multi-question
paper grouped under the 24 slot headings, carrying **79 questions** with no page pointers, which
makes it *better* evidence than a pointer since it assigns each question to a numbered slot and
therefore to a section and a mark value directly.

**Result: all 199 resolve to an authored card (136 distinct questions), and every one carries the
qtype and marks its slot implies. No card needed re-cutting.** Matching was done on question TEXT,
never on the printed pointer — which mattered, see below. 121 of the 257 cards are exercised by no
paper: that is bank depth beyond the papers, not a gap.

**The two Star-bank cards a paper actually places both CONFIRM the inferred section:** answer 182
(`sqp_locus_mod_z_1`, authored VSAQ/2) sits at Model Paper 4 Q2, a Section A slot; answer 201
(`saq_piston_four_letter_words_repeated`, authored SAQ/4) sits at Model Paper 5 Q13, a Section B
slot.

**The residual risk is seven cards, and it is now written on each of them.** Twenty-two of the 29
Star-bank cards are VSAQ/2 on VSAQ-routed pages and are coherent. Seven are authored non-VSAQ with
no paper placing them, and the back-test found real evidence pointing the other way: **the book
routes readers into the Star pages from its VSAQ chapters**, via a footer verified at four chapter
ends — book p.72 → "Few More VSAQ are in Page 89", p.73 → 90, p.75 → 91, p.81 → 93, p.84 → 94. No
such footer was found from the SAQ chapter end (p.58) or the one LAQ chapter end checked (p.35);
routing into pp.92 and 95 is unverified. Each of the seven now carries a `⚠ COUNTER-EVIDENCE`
paragraph in its `verification.note` giving both readings, following the Maths-1A answer-150
precedent. The weakest is answer 203 (`bt_successive_coefficients_36_84_126`), authored LAQ/7 on a
VSAQ-routed page; kept because its method and length are those of book answer 20, a 7-mark LAQ, and
because Binomial holds two Section-C slots — but a teacher settles it.

**Frequency: the papers are NOT independent**, so cross-paper repetition is a weak signal here. The
Bullet Model Paper is largely the union of the five numbered ones, so "appears in 3 papers" almost
always means "one Model Paper plus the Bullet". Across the five *numbered* papers only two questions
repeat at all — `x/(x² − 5x + 9)` lies between 1 and −1/11 (MP2 Q12, MP5 Q12) and
`(2 − ω)(2 − ω²)(2 − ω¹⁰)(2 − ω¹¹) = 49` (MP3 Q3, MP5 Q3). **The per-answer year chips the book
prints are a far better frequency signal**, and they are already in each card's `appearances`.

One trap for future tooling: the four unsolved **PQ** practice questions share a `book page + answer
number` citation with the numbered answer they sit under (58#76, 68#104, 25#16, 31#25), so any index
keyed on page+answer collides. Match on question text.

## Notation ledger — MEASURED 2026-08-29, quoted in every unit agent's prompt

Measured by rendering each glyph in the page's real font stack (`Kalam, cursive`, 26 px, Google
Fonts) against `cursive` alone, after forcing every `unicode-range` chunk to load. Equal advance
widths in both = the glyph is NOT in Kalam and comes from the system fallback face.

**Google Fonts serves Kalam as three `unicode-range` chunks — latin, latin-ext, devanagari — and
NOTHING above U+02FF.** So the only super/subscripts drawn in Kalam's hand are `¹ ² ³` (Latin-1).
Every other superscript and subscript (`⁴ ⁵…⁹ ⁰ ⁿ ᵏ ⁺ ⁻ ⁽ ⁾ ₀…₉ ᵣ ₙ ᵢ ᶜ`), all Greek
(`ω θ λ σ μ π α β γ Δ Σ`), and `√ ∞ ⇒ ∴ ≠ ≤ ≥ ∩ ∪ ∈ ⋯ x̄` fall back to the same upright system face —
**on every machine, including the `ⁿ` and `₂` that hundreds of shipped 1A/1B cards already use**.
This CORRECTS `docs/IPE_MATHS_1A_SOURCE.md` §Kalam, whose "in Kalam" list (`⁴ ⁿ ᵏ ⁺ ₂ ⇒ √ ∞`) was
measured on a Mac with a locally installed full Kalam; the served font is the subset. The practical
consequence is the opposite of the 1A worry: subscript letters are exactly as legitimate as `ⁿ`.
In Kalam: `¹ ² ³ − · × | ! … °` and all Latin letters/digits. Modifier letters `ʳ ˢ ᵗ` (U+02B0–02FF,
latin-ext) ARE in Kalam.

Rendered check (`scratchpad/glyph/notation.png`, 2026-08-29): `ⁿCᵣ = n!/(r!(n − r)!)`, `³⁴C₅ + ³⁸C₄`,
`C₀ + C₁ + … + Cₙ = 2ⁿ`, `Tᵣ₊₁ = ⁿCᵣ xⁿ⁻ʳ aʳ`, `x̄ = Σxᵢ / n`, `σ² = Σ(xᵢ − x̄)² / n`,
`P(A ∩ B) = P(A)·P(B)`, `P(Aᶜ)`, `P(A|B)`, `|z| = √(a² + b²)`, `r cis θ`, `Arg z = Tan⁻¹(b/a)`,
`ω³ = 1, 1 + ω + ω² = 0` — all legible plain Unicode.

**The rules, per topic:**

| Need | Write | Not |
|---|---|---|
| combinations / permutations, symbolic | `ⁿCᵣ`, `ⁿPᵣ`, `ⁿCᵣ = n!/(r!(n − r)!)`, `⁽ⁿ⁺¹⁾Cᵣ`, `ⁿCᵣ₋₁` | `C(n,r)`, `nCr`, KaTeX |
| combinations, numeric | `³⁴C₅`, `¹²P₃`, `¹³C₂ = (13·12)/(1·2) = 78` | `34C5` |
| binomial coefficients as C's | `C₀ + C₁ + C₂ + … + Cₙ = 2ⁿ`, `C₀·Cᵣ + C₁·Cᵣ₊₁` | subscript-free `C0` |
| general term | `Tᵣ₊₁ = ⁿCᵣ xⁿ⁻ʳ aʳ` (modifier `ʳ` U+02B3 for a superscript r; `ˢ ᵗ` likewise) | `x^(n-r)` |
| exponent that is a FRACTION or contains a fraction | **KaTeX**: `2^{(n+2)/2}`, `(p^2+q^2)^{1/2n}`, `(1+x)^{-p/q}` | `2⁽ⁿ⁺²⁾/²` (reads as division) |
| exponential with a Greek exponent (Poisson) | **KaTeX**: `P(X=r) = \dfrac{e^{-\lambda}\lambda^{r}}{r!}` | `e⁻λ` (no superscript λ exists) |
| complex numbers | `z = x + iy`, `|z| = √(x² + y²)`, `z̄` → write `conjugate of z` or `z̄` only if measured; `Arg z`, `r cis θ`, `r(cos θ + i sin θ)`, `ω, ω²` | `\bar z` outside KaTeX |
| fractions on one line | `(2 + 11i)/25`, `x = Δ₁/Δ`, `1/(1 + ω)` — parenthesise the numerator and denominator | stacked `\frac` unless the line is already KaTeX for another reason |
| products | `1·3·5`, `5·10·15` — the middle dot (settled founder decision 2026-08-21) | the book's `1.3.5` period |
| series | `1 + 1/5 + (1·3)/(5·10) + (1·3·5)/(5·10·15) + …` | `\cdots` |
| statistics | `x̄`, `xᵢ`, `fᵢ`, `Σfᵢxᵢ`, `Σ|xᵢ − x̄|`, `σ² = Σfᵢ(xᵢ − x̄)²/N`, `M.D.`, `S.D.` | KaTeX for a plain sum |
| probability | `P(A ∩ B)`, `P(A ∪ B)`, `P(Aᶜ)`, `P(A|B)`, `P(E₁)`, `P(A/E₁)` as the book writes Bayes | `P(A')` |
| random variables | `P(X = r) = ⁿCᵣ qⁿ⁻ʳ pʳ`, `μ = np`, `σ² = npq`, `P(X ≥ 1) = 1 − P(X = 0)` | |
| inequalities, sets | `≤ ≥ ≠ ∈ ∞`, `x ∈ (−∞, 2) ∪ (3, ∞)` | |
| matrices / determinants | **KaTeX** `\begin{bmatrix}` / `\begin{vmatrix}` (none expected in 2A) | |
| minus sign | U+2212 `−` everywhere in the hand; a hyphen only inside a word | `-` |

`render: "katex"` stays the exception: use it for the three cases above and for nothing that reads
honestly on one plain line — every typeset line is a small break in the handwriting illusion.
KaTeX lines skip the wrap gate (`measure_wrap.mjs`) and are typeset at build time, so a bad macro
fails `check:cards` naming the card.

## Where this book is wrong

Every case below is written correctly on the card that answers it, with the book's printed claim
recorded in that step's `why` and in `verification.note` — never silently followed, never silently
fixed. Ten units re-derived every printed answer; the book is **markedly cleaner than the Senior
Chemistry Fastrack** (~130 findings there), and four units found nothing mathematical at all
(Partial Fractions, Probability, Binomial, Random Variables — only typographic slips).

**Wrong mathematics.**
- **p.71, ans 110.3 (Complex Numbers)** — the modulus-amplitude form of −1 − i is printed with
  θ = 3π/4, i.e. √2(cos 3π/4 + i sin 3π/4). That is **−1 + i**, a different number, and
  tan(3π/4) = −1 ≠ +1. The point is in the third quadrant, so the principal amplitude is **−3π/4**.
  The book's own answer 110.6 uses (−π, π] correctly, so it is a slip, not a convention.
- **p.76, ans 131 (Theory of Equations)** — the equation is printed `x³ − 2x² + 5x + 6 = 0`, for
  which 1 is not a root (f(1) = 10) and the book's own answer 3, −2 fails the coefficient relations.
  The question is `x³ − 2x² − 5x + 6 = 0`. **The same misprint is reproduced twice more** — in the
  Bullet Model Paper (p.97) and in Model Paper 4 (p.117) — so it is set once and copied.
- **p.89, ans 184 (Complex Numbers)** — "Locus is x − 1 = 0", the whole vertical line.
  Arg(z − 1) = π/2 also forces **y > 0**; the lower half-line has argument −π/2, and z = 1 is
  undefined. The card gives x = 1 with y > 0.
- **p.79, ans 145.2 (P&C)** — `⁹C₃ + ⁹C₅ = ¹⁰Cᵣ` is answered r = 4 only. Since ¹⁰C₄ = ¹⁰C₆,
  **r = 6 satisfies it too** (both sides 210). The book gives both values on the neighbouring 144.2,
  so the omission is inconsistent as well as incomplete.
- **p.86, ans 172.2 (Dispersion)** — σ = √24.25 printed as ≅ 4.95. It is **4.92** (4.95² = 24.50).
- **p.74, ans 123.2 (Quadratic)** — the maximum of 2x − 7 − 5x² is printed 34/5; with a = −5 < 0 and
  Δ < 0 the expression is negative everywhere, and its maximum is **−34/5**. Possibly a lost minus
  in the scan, but the printed value is unusable as it stands.
- **p.74, ans 120.2 (Quadratic)** — concludes "Δ is positive" for Δ = (a − b)² + 4h²; it is **≥ 0**
  (zero when a = b and h = 0, giving equal roots). The conclusion "the roots are real" still holds.

**Dropped symbols and copy slips that change the meaning.**
- **p.16, ans 5 (De Moivre)** — the last line prints `(p + iq)^(1/n) + (p − q)^(1/n)`: the **i is
  missing** from the second bracket, which is the conjugate the whole proof depends on.
- **p.26, ans 19 (Theory of Equations)** — one line reads "roots 2 + √3, 2 − √3"; the i is dropped
  (the sum and product used on the same page are those of 2 ± i√3).
- **p.22, ans 13 (Theory of Equations)** — the last entry of a synthetic-division row prints 2 where
  it must be −2; the zero remainder that justifies the factor depends on it.
- **p.44, ans 49 (Dispersion)** — the table header prints `dᵢ = (xᵢ − 25)/10`, copied from answer 48,
  while the text and every number in the column use **A = 35**.
- **p.76, ans 126.1 (Quadratic)** — the step α = 1 needs **b ≠ c**, which is not stated.
- **p.84, ans 164 (Binomial)** — gives r = 0 and r = 3; r = 0 makes the two terms the same term, so
  only r = 3 is a real answer.
- **p.45, ans 51 (Dispersion)** — "Median deviation about median" for *mean* deviation.
- **p.109, ans 47 (Random Variables)** — prints `2ᴷ` with a capital K mid-expression.

**Its own cross-references are wrong in EIGHT places** — four found during authoring, four more by
the 2026-08-29 back-test, every one confirmed against the source page. None misroutes a card's
section; the affected slots' true cards already carry the right marks.

| Slot | Book prints | Actual |
|---|---|---|
| MP2 Q2 | `[P 72(111.1)]` | **111.2** — p.72 prints 111.1 as `z₂ = −i, Arg(z₁z₂)`, 111.2 as `z₂ = i, Arg(z₁/z₂)` |
| MP2 Q11 | `[P 49(55)]` | **49(56)** — 55 is the Argand rhombus, 56 is `(x − iy)^(1/3)` |
| MP2 Q22 | `[P 45(50)]` | **44(49)** |
| MP3 Q18 | `[P 15(3)]` | **16(4)** |
| MP4 Q18 | `[P 16(4)]` | **16(5)** |
| MP4 Q21 | `[P 33(28)]` | **35(31)** — 33(28) is the unrelated `1.3/3.6` series |
| Bullet p.106 | bullet labelled `22.` | answer **24** |
| Bullet p.107 | bullet labelled `29.` | answer **30** |

A wrong pointer is **not** a missing card — in all eight cases the correct card exists. Resolve by
the mathematics before recording a gap (the sibling 2B session reached the same conclusion from
three of its own book's bad pointers). Note also that the scan's "Ans-Page Index" column is offset
by one row against its questions; resolving by ordinal position and cross-checking against
answer-number order is what made all 120 pointers readable.

**Year chips printed twice** (AP 18,18 · AP 17,17 · TS 15,15 · TS 16,16 · AP 16,16 · AP 19,19 and
others) are recorded ONCE in `appearances` with the doubled chip quoted in the note — two papers in
one year is possible, but a repeated chip is more likely a setting artefact, and the card should not
silently assert either.

**Where our numbers come from.** Unlike the chemistry book, this one is almost entirely
self-contained: every value on these cards is derived on the card itself. Nothing was imported from
an outside table, so a verifying teacher's highest-value checks are the seven wrong-mathematics
items above and the four PQ practice questions, whose working is ours.
