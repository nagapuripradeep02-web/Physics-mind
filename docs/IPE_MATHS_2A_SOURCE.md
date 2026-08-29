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

- **Book page = PDF page − 2** (book p.5 "IPE 24 QF" = PDF p.7; book p.14 = PDF p.16; book p.111 =
  PDF p.113). Verified at four points; watch for ±1 drift.
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

## The 10 units — book pages (PDF = book + 2)

`unit.number` = the blueprint/syllabus order, NOT the book's section-chapter numbers.

| Unit | abbr | Name | LAQ (7M) | SAQ (4M) | VSAQ (2M) | Star Q Plus | Chapter stars |
|---|---|---|---|---|---|---|---|
| 1 | `cn` | Complex Numbers | – | pp.48–51 (ch.7, ans 54–62) | pp.70–72 (ch.12, ans 105–115) | p.89 (179–184) | SAQ ★★ · VSAQ ★★★ |
| 2 | `dm` | De Moivre's Theorem | pp.14–19 (ch.1, ans 1–9) | – | p.73 (ch.13, ans 116–119.2) | p.90 (185–190) | LAQ ★★★ · VSAQ ★★★ |
| 3 | `qe` | Quadratic Expressions | – | pp.52–54 (ch.8, ans 63–67) | pp.74–75 (ch.14, ans 120–126) | p.91 (191–194) | SAQ ★★★ · VSAQ ★★ |
| 4 | `te` | Theory of Equations | pp.20–26 (ch.2, ans 10–19) | – | pp.76–77 (ch.15, ans 127–137) | p.92 (check) | LAQ ★★★ · VSAQ ★★★ |
| 5 | `pc` | Permutations & Combinations | – | pp.55–58 (ch.9, ans 68–76) | pp.78–81 (ch.16, ans 138–155) | pp.92–93 (195–201) | SAQ ★★★ · VSAQ ★★★ |
| 6 | `bt` | Binomial Theorem | pp.27–35 (ch.3, ans 20–30) | – | pp.82–84 (ch.17, ans 156–167) | pp.94–95 (202–207) | LAQ ★★★ · VSAQ ★★★ |
| 7 | `pf` | Partial Fractions | – | pp.63–68 (ch.11, ans 90–104) | – | (check) | SAQ ★★★ |
| 8 | `md` | Measures of Dispersion | pp.44–46 (ch.6, ans 48–53) | – | pp.85–86 (ch.18, ans 168–172) | (check) | LAQ ★★ · VSAQ ★★★ |
| 9 | `pb` | Probability | pp.36–39 (ch.4, ans 33–40) | pp.59–62 (ch.10, ans 77–89) | – | (check) | LAQ ★★★ · SAQ ★★ |
| 10 | `rv` | Random Variables & Probability Distributions | pp.40–43 (ch.5, ans 41–47) | – | pp.87–88 (ch.19, ans 173–178) | (check) | LAQ ★★★ · VSAQ ★★ |

These ranges come from the index and page samples. **They are hints. Each unit agent walks its own
pages to the boundary (read the page AFTER the one you think is last), counts its own unit, and
reports the count** — the Chemistry-II index was wrong by two at a column break, and the 1A "TOP 40
SAQ" hit list missed two questions because a hit list is a selection, not an inventory. Reading
order is left column then right column; a chapter can hand over mid-column. Where this table and the
page disagree, the page wins and the disagreement is recorded here.

Treatment of the other sections:
- **Star Questions Plus (pp.89–95)** — extra questions organised by chapter banner, no mark cut
  printed. Folded INTO the chapter units as backfill (1A founder decision 2026-08-22), classed by
  shape and length; the note names "Star Questions Plus, answer N" and says the section is OURS.
  Skip only a genuine duplicate of a question already authored, and record which.
- **Bullet Model Paper (pp.96–110)** — the hit-list questions re-solved compactly, arranged by
  paper slot Q1…Q24 (verified: pp.96–99 repeat VSAQ 105–108, 116–118, 138–141, 152, 154, 158, 163,
  165, 169…). NOT new cards. A second solution for arithmetic cross-checks; a question found ONLY
  here becomes a card whose note says so.
- **5 Model Guess Papers (pp.111–120)** — questions only, each cross-referenced to an answer page
  ≤ 95. Evidence for "paper position" in notes.
- **"IPE 24 QF" (pp.4–5)** — the formula sheet; not questions.

**Two structural checks cannot be run for this subject, and that is recorded, not hidden:** no
two-book union check (no second Maths-2A source in the corpus) and no board back-test
(`answer-book/papers/` holds first-year physics only). Same call as 1A/1B/Chemistry-II: proceed
single-source and say so on every card and in the `units.json` comment.

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

## Where this book is wrong — appended as units land

(Every case is written correctly on the card that answers it, with the book's printed claim recorded
in that step's `why` and in `verification.note` — never silently followed, never silently fixed.)

- *pending — unit agents append here via their reports*
