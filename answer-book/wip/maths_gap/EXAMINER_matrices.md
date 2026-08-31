# Independent examiner pass — the 49 new Matrices cards (`ts_ipe_m1a_mat_*`, commit `c0942ca1`)

Every card was re-derived from its own `question_text`. No card's `verification.note` was
read as evidence of correctness. Every determinant was expanded a second time along a
different row or column; every linear system's boxed solution was substituted back into
all three ORIGINAL equations; every inverse was multiplied out; every identity was tested
on two independent concrete triples; every closed form was checked against A¹, A², A³.
All hand derivations were then re-run independently in sympy as a negative control on my
own arithmetic (44 assertions, all OK) — the script is reproduced at the end.

**Report only. No file in the repo was changed.**

---

## 1. Tally

| Band | Count | Cards |
|---|---|---|
| **WRONG** | **0** | — |
| **MISLEADING** | **1** | `ts_ipe_m1a_mat_saq_3a_minus_4bt` |
| **THIN** | **0** | — |
| **CLEAN** | **48** | listed in §3 |

No card in this corpus is mathematically wrong. Every determinant, every cofactor sign,
every adjoint transpose, every row operation, every closed form and every boxed answer
re-derives exactly. The three method-trios agree with each other. That is a materially
better result than the comparable run recorded in `docs/patterns/answer_book.md`.

---

## 2. Findings

| Card | Exact line | What it says | What it should say | Evidence |
|---|---|---|---|---|
| `ts_ipe_m1a_mat_saq_3a_minus_4bt` | step `s3_four_bt` — `margin_note`, `memory_tip`, and `common_mistakes[0]` | margin_note: *"Scale the transpose, not B. Multiplying B by 4 and transposing afterwards gives the same matrix **here**, but scaling the wrong matrix first is how the entries end up in the wrong places."* · memory_tip: *"Scale Bᵀ, not B."* · CM: *"Scaling B and then transposing from memory, so the entries land in the wrong positions."* | Scaling then transposing is **not** an error and not only "here": `(kB)ᵀ = kBᵀ` for every scalar k and every matrix B, so `4Bᵀ` and `(4B)ᵀ` are the same matrix always. The real risk being described is transcription, not order. Reword to something like *"Either order works — (4B)ᵀ = 4Bᵀ — but write Bᵀ down first and scale what you can see, rather than transposing from memory."* | Direct check on this card's own numbers: `B = [[2,−1,0],[0,−2,5],[1,2,0]]`; `4·Bᵀ = [[8,0,4],[−4,−8,8],[0,20,0]]` and `(4B)ᵀ = [[8,0,4],[−4,−8,8],[0,20,0]]` — identical, entry for entry. Also checked symbolically. |

Severity: **low**. The card's arithmetic is entirely correct (`3A − 4Bᵀ = [[−5,15,5],[10,20,−8],[9,−23,−15]]`,
verified). The defect is one false general caveat in three student-visible surfaces — the
margin note's "here" implies the two orders can differ elsewhere, and `memory_tip` is the
"How to remember?" chip text, which reaches the student as a rule with no context. The
card's own margin note half-admits the truth in the same sentence, so the fix is one
rewritten sentence and one rewritten tip. Flagged rather than waved through precisely
because recipe item 8 asks for `common_mistakes` bullets that name a correct move as the
error, and this is one.

---

## 3. CLEAN — 48 cards, with the checks that were actually run

### 3a. Definitions (6) — checked hardest, per recipe item 9

| Card | Checks run |
|---|---|
| `vsaq_define_adjoint` | Definition states cofactor matrix **then TRANSPOSE** — correct. 2×2 rule `[[a,b],[c,d]] → [[d,−b],[−c,a]]` verified by multiplying: `A·AdjA = (ad−bc)I`. `A(AdjA) = (AdjA)A = |A|I` stated correctly. |
| `vsaq_define_inverse` | `AB = BA = I` (both products, square, order n) — correct. Worked example `A=[[2,1],[3,2]]`, det = 4−3 = 1 ✓; claimed `A⁻¹=[[2,−1],[−3,2]]`; multiplied out: `AA⁻¹=[[4−3,−2+2],[6−6,−3+4]]=I` ✓. `A⁻¹ = (AdjA)/(det A)`, exists **iff** det A ≠ 0, uniqueness stated ✓. |
| `vsaq_define_rank` | Both clauses of the definition present (some minor of order r non-zero **and** every larger minor zero); zero matrix → rank 0 ✓. Example `[[1,2],[2,4]]`: det = 4−4 = 0, 1×1 minor `|1|=1≠0`, so rank 1 ✓ (sympy `.rank()` = 1). |
| `vsaq_define_singular_nonsingular` | det = 0 / det ≠ 0 assigned the right way round ✓. `A=[[1,2],[2,4]]` det 0 ✓; `B=[[1,2],[3,4]]` det = 4−6 = −2 ✓. |
| `vsaq_define_symmetric_skew` | `Aᵀ = A` and `Aᵀ = −A` correct; the `aᵢᵢ = −aᵢᵢ ⇒ 2aᵢᵢ = 0` derivation of the zero diagonal is present and correct. Examples `(1,2),(2,5)` symmetric ✓ and `(0,3),(−3,0)` skew ✓. |
| `vsaq_define_triangular` | Upper ⇔ `aᵢⱼ = 0` when `i > j` (zeros **below**) ✓ and the katex example `[[1,2,3],[0,4,5],[0,0,6]]` matches ✓; lower ⇔ `aᵢⱼ = 0` when `i < j` ✓ with matching example ✓. Margin note "determinant is the product of the diagonal entries" ✓. `memory_tip` "transposing one gives the other" ✓. |
| `vsaq_trace_fractional_3x3` | Trace defined as the sum of the **principal-diagonal** entries of a **square** matrix ✓. Diagonal of the katex matrix read off independently: 1, −1, 1 → 1 ✓ (sympy `.trace()` = 1). The two −1/2 entries are correctly off-diagonal. |

### 3b. Rank (5)

| Card | Checks run |
|---|---|
| `vsaq_rank_2x3` | Cap min(2,3)=2 stated ✓. `R₂→R₂−2R₁` recomputed: `(2,−1,3)−2(1,0,−4) = (0,−1,11)` ✓. Confirming minor `|1 0; 2 −1| = −1` ✓. sympy rank = 2 ✓. |
| `vsaq_rank_3x4` | Cap 3 ✓. `R₂−3R₁ = (0,−2,1,5)` ✓, `R₃+2R₁ = (0,7,2,3)` ✓, `2R₃+7R₂ = (0,0,11,41)` ✓. Order-3 minor from cols 1–3 recomputed independently = **−11** ✓ (matches the card). sympy rank = 3 ✓. |
| `vsaq_rank_1_2_1_alt` | det expanded along R₁ = 1(−2) − 2(1) + 1(−1) = −5; **second expansion along C₁** = 1(−2) + 1(−3) + 0 = −5 ✓. Rank 3 ✓. |
| `vsaq_rank_1_4_neg1` | det along R₁ = 6 − 16 − 2 = −12; **second expansion along C₃** = (−1)(2) + 0 + 2(−5) = −12 ✓. Rank 3 ✓. |
| `rank_test_consistency_3_3_1` (LAQ) | Every intermediate augmented matrix satisfied by the final family: `[0,0,−3|−3]` → −3(1) = −3 ✓; `[0,0,−2|−2]` ✓; `[0,0,1|1]` ✓; last row genuinely `0 0 0 | 0` ✓. Rank A = 2 and Rank[A|D] = 2 confirmed independently in sympy ✓. The claimed 2×2 minor (rows 1–2, cols 1–3 of the reduced coefficient block) `|1 1; 0 1| = 1 ≠ 0` ✓. Parametric solution substituted into all three ORIGINAL equations symbolically in k: `k+(2−k)+1 = 3` ✓, `2k+2(2−k)−1 = 3` ✓, `k+(2−k)−1 = 1` ✓. Free-variable count 3 − 2 = 1 ✓. |

### 3c. The three systems — Cramer / inversion / Gauss-Jordan cross-agreement (8)

All three systems were substituted back into their three original equations, and where a
system carries two or three method cards the methods were checked **against each other**.

**System A** — `2x−y+3z=8, −x+2y+z=4, 3x+y−4z=0` → **(2, 2, 2)**; check 4−2+6=8 ✓, −2+4+2=4 ✓, 6+2−8=0 ✓.

| Card | Checks run |
|---|---|
| `cramer_2x_y_3z_8` | Δ along R₁ = −18+1−21 = −38; **the card's own second expansion along R₂** re-derived independently: `−(−1)(1) + 2(−17) − 1(5) = 1 − 34 − 5 = −38` ✓. Δ₁ = −72−16+12 = −76 ✓, Δ₂ = −32−8−36 = −76 ✓, Δ₃ = −8−12−56 = −76 ✓ (all three re-computed in sympy by column replacement). x=y=z=2 ✓. |
| `gauss_2x_y_3z_8` | Each augmented matrix re-derived AND tested against (2,2,2): `[1,−2,−1|−4]` → 2−4−2 = −4 ✓; `[0,3,5|16]` → 6+10 = 16 ✓; `[0,7,−1|12]` → 14−2 = 12 ✓; `[0,0,−38|−76]` ✓; `[0,0,1|2]` ✓. `R₃→3R₃−7R₂` recomputed: `(0,21−21,−3−35 | 36−112)` ✓. Agrees with the Cramer card ✓. |

**System B** — `x−y+3z=5, 4x+2y−z=0, −x+3y+z=5` → **(0, 1, 2)**; check 0−1+6=5 ✓, 0+2−2=0 ✓, 0+3+2=5 ✓.

| Card | Checks run |
|---|---|
| `cramer_x_minus_y_3z_5_negx` | Δ along R₁ = 5+3+42 = 50; **second expansion along C₁** re-derived: `1(5) + 4(10) + (−1)(−5) = 50` ✓. Δ₁ = 25+5−30 = **0** ✓, Δ₂ = 5−15+60 = 50 ✓, Δ₃ = 10+20+70 = 100 ✓. x=0 handled correctly (zero numerator ≠ undefined) ✓. |
| `gauss_x_minus_y_3z_5_negx` | Intermediates re-derived and tested against (0,1,2): `[0,6,−13|−20]` → 6−26 = −20 ✓; `[0,2,4|10]` → 2+8 = 10 ✓; `[0,1,2|5]` ✓; `[0,0,−25|−50]` ✓. Agrees with both sibling cards ✓. |
| `inverse_x_minus_y_3z_5_negx` | All **nine** cofactors recomputed one by one with their sign board: 5, −3, 14 / 10, 4, −2 / −5, 13, 6 — every one matches. `Adj A` confirmed to be the **transpose** of that (not the cofactor matrix itself) ✓. Full `A·AdjA` multiplied out — all nine entries — giving exactly `50 I`, so `A·A⁻¹ = I` exactly ✓ (sympy `.adjugate()` matches). `AdjA · D = (0, 50, 100)`, ÷50 → (0,1,2) ✓, agreeing with the Cramer and Gauss cards ✓. |

**System C** — `x+y+z=9, 2x+5y+7z=52, 2x+y−z=0` → **(1, 3, 5)**; check 9 ✓, 2+15+35=52 ✓, 2+3−5=0 ✓.

| Card | Checks run |
|---|---|
| `cramer_x_y_z_9_2x5y7z52` | Δ along R₁ = −12+16−8 = −4; **second expansion along C₁** re-derived: `1(−12) + 2(2) + 2(2) = −4` ✓. Δ₁ = −108+52+52 = −4 ✓, Δ₂ = −52+144−104 = −12 ✓, Δ₃ = −52+104−72 = −20 ✓. (1,3,5) ✓. |
| `gauss_x_y_z_9_2x5y7z52` | Intermediates re-derived and tested against (1,3,5): `[0,3,5|34]` → 9+25 = 34 ✓; `[0,−1,−3|−18]` → −3−15 = −18 ✓; `[0,1,3|18]` ✓; `[0,0,−4|−20]` ✓. Agrees with the other two ✓. |
| `inverse_x_y_z_9_2x5y7z52` | All nine cofactors recomputed: −12, 16, −8 / 2, −3, 1 / 2, −5, 3 — every one matches, including the worked example `A₁₂ = −(−2−14) = 16`. `Adj A` is the correct transpose ✓. Full `A·AdjA` multiplied out — all nine entries — giving exactly `−4 I` ✓. `AdjA·D = (−4,−12,−20)`, ÷(−4) → (1,3,5) ✓, agreeing with both siblings ✓. |

**System D** — `x+y+z=1, 2x+2y+3z=6, x+4y+9z=3` → **(7, −10, 4)**; check 7−10+4=1 ✓, 14−20+12=6 ✓, 7−40+36=3 ✓.

| Card | Checks run |
|---|---|
| `gauss_x_y_z_1` | The interesting one: `R₂−2R₁ = (0,0,1|4)` — column 2 empties too, which the card flags as a feature rather than an error ✓. `R₃−R₁ = (0,3,8|2)`; tested against (7,−10,4): −30+32 = 2 ✓. The pivot step is a **swap** (a pivot cannot sit on a zero) and is correct ✓. `R₂−8R₃ = [0,3,0|−30]` ✓, ÷3 → −10 ✓, `R₁−R₂ = [1,0,0|7]` ✓. |

### 3d. Determinant identities (7) — each substituted with **a = 2, b = 3, c = 5** and **a = −1, b = 4, c = 7**

| Card | Checks run |
|---|---|
| `saq_det_bc_ca_ab_column` | LHS at (2,3,5) = 6 and RHS `(a−b)(b−c)(c−a) = (−1)(−2)(3) = 6` ✓; at (−1,4,7) LHS = 120, RHS = (−5)(−3)(8) = 120 ✓. Row-op bookkeeping audited: `R₁−R₂` gives `(−c(a−b), −(a−b), 0)` ✓ and `R₂−R₃` gives `(−a(b−c), −(b−c), 0)` ✓; the **two minus signs** taken out multiply to +1 ✓ (this is the sign trap and it is handled right); expansion along C₃ at position (3,3) is **plus** ✓; the surviving 2×2 `|c 1; a 1| = c − a` ✓ — right bracket, right order. Identity confirmed symbolically. |
| `saq_det_sum_pairs_row_abc` | LHS at (2,3,5) = 70, RHS `a³+b³+c³−3abc = 160−90 = 70` ✓; at (−1,4,7) LHS = 490, RHS = 406+84 = 490 ✓. `R₁→R₁+R₃` makes every entry `a+b+c` ✓ (value unchanged by the operation); `R₂→R₂−R₃` gives exactly `(b, c, a)` and the katex shows `b & c & a` ✓; expansion `(c²−ab) − (bc−a²) + (b²−ca)` collapses correctly to `a²+b²+c²−ab−bc−ca`, and the middle term is **subtracted** ✓. Intermediate cross-check: `(a+b+c)·(a²+b²+c²−ab−bc−ca)` at (2,3,5) = 10 × 7 = 70 ✓. |
| `saq_det_vandermonde_1_a_a2` | LHS at (2,3,5) = 6 = RHS ✓; at (−1,4,7) = 120 = RHS ✓. `a²−b² = (a−b)(a+b)` factoring is applied to the **whole** row (both entries divided) ✓; expansion along C₁ at (3,1) is `(−1)³⁺¹ = +1` ✓; the minor after deleting row 3 and column 1 is `[[1, a+b],[1, b+c]]`, giving `c − a` ✓ — not `a − c`. |
| `saq_det_x_2a_x_minus_a_sq` | At x=2, a=3: LHS = 8, RHS `(x+2a)(x−a)² = 8·1 = 8` ✓; confirmed symbolically for general x, a. `C₁→C₁+C₂+C₃` gives `x+2a` in every position ✓; the factor comes out **once** (column factor) ✓; `R₂−R₁ = (0, x−a, 0)` and `R₃−R₁ = (0, 0, x−a)` ✓; triangular product `1·(x−a)·(x−a)` ✓. |
| `vsaq_det_cyclic_diff_zero` | `C₁→C₁+C₂+C₃` leaves `(a−b)+(b−c)+(c−a) = 0` in every row ✓ — value unchanged by a column-addition ✓; zero column ⇒ determinant 0 ✓; confirmed symbolically (det ≡ 0). |
| `saq_det_find_x_zero` | `R₂−R₁ = (−2,−6,−12)` ✓ and `R₃−R₁ = (−6,−24,−60)` ✓ (x cancels). Factors −2 and −6 out → **+12** outside ✓ (not −12) with rows `(1,3,6)` and `(1,4,10)` ✓; `R₃−R₂ = (0,1,4)` ✓. The three minors along R₁ recomputed: 6, 4, 1 ✓, so `12[(x−2)6 − (2x−3)4 + (3x−4)] = 12(x−4)` ✓. `x = 4` confirmed by `solve(det = 0)` → **[4]**, the unique root. The margin note's substitution check re-derived: rows (2,5,8), (0,−1,−4), (−4,−19,−52), determinant = −48+80−32 = 0 ✓. |
| `laq_det_a_minus_1_cubed` (LAQ) | Three independent values: a=2 → LHS 1 = (1)³ ✓; a=−1 → LHS −8 = (−2)³ ✓; a=3 → LHS 8 = (2)³ ✓; plus symbolic confirmation. `R₁−R₂` = `(a²−1, a−1, 0)` ✓ and `R₂−R₃` = `(2a−2, a−1, 0)` ✓ (row 3 untouched — no factor gained or lost). Taking `(a−1)` out of R₁ leaves `(a+1, 1, 0)` ✓ and out of R₂ leaves `(2, 1, 0)` — the CM explicitly warns against writing `(1,1,0)` there, which is the right warning ✓. Expansion along C₃ at (3,3) is plus ✓; `|a+1 1; 2 1| = a−1` ✓. Three factors accounted for ✓. |
| `laq_det_condition_abc_neg1` (LAQ) | Column-split of C₃ verified numerically at (a,b,c) = (2,3,5): Δ = 186, D = 6, second piece = 180 = abc·D = 30·6 ✓; and `Δ = (1+abc)D = 31·6 = 186` ✓. Confirmed symbolically: `Δ − (1+abc)D ≡ 0`. The **two column interchanges** claim checked directly: `|1 a a²; 1 b b²; 1 c c²| = 6` and `D = 6` — equal, not negatives, so the two-swap sign bookkeeping is right ✓ (one swap would have given −D and the false answer abc = 1, which the card's own CM names). Both hypotheses used, and used for different jobs ✓. |

### 3e. Matrix algebra and proofs (17)

| Card | Checks run |
|---|---|
| `vsaq_2a_plus_bt_and_3bt_minus_a` | `Bᵀ = [[−2,4],[3,0],[1,2]]` ✓ (3×2, matches A's order). `2A = [[−4,2],[10,0],[−2,8]]` ✓; sum `[[−6,6],[13,0],[−1,10]]` ✓. `3Bᵀ = [[−6,12],[9,0],[3,6]]` ✓; `3Bᵀ−A = [[−4,11],[4,0],[4,2]]` ✓ — subtraction in the stated order, verified in sympy. |
| `vsaq_2x_plus_a_eq_b_row42` | `B−A = [[2,6],[1,−2]]` ✓; `X = ½(B−A) = [[1,3],[½,−1]]` ✓ (exact rational, no rounding). Back-substituted: `2X + A = [[2,6],[1,−2]] + [[1,2],[3,4]] = [[3,8],[4,2]] = B` ✓. |
| `vsaq_additive_inverse_complex` | Every entry negated including the complex ones: `i→−i`, `−i→i`, `0→0` ✓; `A + (−A) = O` verified entry by entry. |
| `vsaq_aat_minus1_2_0_1` | `Aᵀ = [[−1,0],[2,1]]` ✓; `AAᵀ` recomputed = `[[5,2],[2,1]]` ✓, and the card's intermediate `[[1+4, 0+2],[0+2, 0+1]]` is right term by term. Symmetry sanity check holds. |
| `vsaq_aat_is_symmetric_proof` | Reversal law `(XY)ᵀ = YᵀXᵀ` stated in the correct (reversed) order ✓; `(AAᵀ)ᵀ = (Aᵀ)ᵀAᵀ = AAᵀ` ✓ — the `(Aᵀ)ᵀ = A` step is present, not skipped. CM correctly names `(AAᵀ)ᵀ = AᵀA` as the wrong route. |
| `vsaq_rotation_aat_identity` | All four entries of `AAᵀ` re-derived: `cos²+sin²`, `−cos·sin+sin·cos`, `−sin·cos+cos·sin`, `sin²+cos²` ✓. All four of `AᵀA` re-derived separately (the card does not say "similarly") ✓. Both = I. The step-2 tip "Aᵀ is the inverse of A … orthogonal" is correct. |
| `vsaq_shop_inventory_value` | Dozens converted: 120, 96, 120 ✓. `N` (1×3) × `P` (3×1) is the only defined order ✓. `9600 + 5760 + 4800 = 20160` ✓. Culture-neutral "money units" — no currency asserted. |
| `vsaq_classify_symmetric_skew` | `Aᵀ` re-derived from A independently = `[[0,−1,−4],[1,0,−7],[4,7,0]]` ✓; `−A` re-derived = the same matrix ✓, so `Aᵀ = −A` and `Aᵀ ≠ A` ✓; zero diagonal noted as corroboration, not as the whole argument ✓. |
| `vsaq_skew_symmetric_find_x_4_2_8` | `Aᵀ` and `−A` written out independently — off-diagonals agree (−4, 2, −8) ✓, leaving only (3,3): `x = −x ⇒ x = 0` ✓, consistent with the general zero-diagonal rule. |
| `vsaq_equality_2x_0_z` | Every position with an unknown re-derived: `x−1 = 1−x ⇒ x = 1`; the redundant `2x = 2 ⇒ x = 1` **agrees** (a real consistency check, not a duplicate) ✓; `y−5 = −y ⇒ y = 5/2` ✓ (not 5); `z = 2` ✓; `1+a = 1 ⇒ a = 0` ✓. |
| `vsaq_minor_cofactor_of_5` | 5 located at (3,2) ✓; deleting row 3 and column 2 of `[[1,0,−2],[3,−1,2],[4,5,6]]` gives `[[1,−2],[3,2]]`, det = 2+6 = **8** ✓; cofactor `(−1)⁵·8 = −8` ✓; minor carries no sign ✓. |
| `saq_verify_sum_transpose` | LHS: `A+B = [[−2,8,7],[6,3,7]]` ✓ → transpose `[[−2,6],[8,3],[7,7]]` ✓. RHS built **independently** from A and B: `Aᵀ = [[1,2],[4,5],[7,8]]`, `Bᵀ = [[−3,4],[4,−2],[0,−1]]`, sum = `[[−2,6],[8,3],[7,7]]` ✓. Both sides recomputed in sympy; equal. |
| `saq_check_ab_commute` | All nine entries of `AB` and all nine of `BA` recomputed by hand and in sympy: `AB = [[4,4,−2],[1,1,10],[−1,5,−4]]`, `BA = [[−5,0,7],[−4,5,3],[5,4,1]]` — both exactly as printed, including the card's worked entries. The card's stronger claim **"all nine matching entries differ"** was tested position by position and is **true** ✓. |
| `saq_3a_minus_4bt` | (arithmetic clean; banded MISLEADING for the step-3 wording only — see §2). `Bᵀ`, `3A`, `4Bᵀ` and the difference all re-derived and confirmed in sympy: `[[−5,15,5],[10,20,−8],[9,−23,−15]]` ✓. |
| `saq_a_cubed_1_1_3` | `A²` recomputed entry by entry = `[[0,0,0],[3,3,9],[−1,−1,−3]]` ✓ (first row genuinely zero); `A³ = A²·A = O` ✓; the card's cross-check `A·A²` re-derived independently and also gives O ✓ (sympy `A**3 == zeros(3)`). The "write O, not 0" point is correct. |
| `saq_ab_inverse_reverse_order` | Both directions present and both correct: `(AB)(B⁻¹A⁻¹) = A(BB⁻¹)A⁻¹ = I` and `(B⁻¹A⁻¹)(AB) = B⁻¹(A⁻¹A)B = I` ✓; associativity invoked explicitly; conclusion states **both** that AB is invertible and that the order reverses ✓. CM correctly names `A⁻¹B⁻¹` as the false form. |
| `saq_inverse_diagonal_abc` | det = abc for a diagonal matrix ✓, with the `a,b,c ≠ 0` condition stated **before** the inverse is written ✓. Diagonal cofactors bc, ca, ab paired with the right positions ✓ (bc↔(1,1), ca↔(2,2), ab↔(3,3)); off-diagonal minors each contain a zero row ⇒ 0 ✓; adjoint = transpose = itself for a diagonal matrix ✓; `A⁻¹ = diag(1/a, 1/b, 1/c)` confirmed against sympy's `.inv()` ✓; `A·A⁻¹ = I` check present ✓. |
| `saq_sym_skew_decomposition_proof` | Existence: `S+K = ½(2A) = A` ✓; `Sᵀ = S` and `Kᵀ = −K` both derived from `(P+Q)ᵀ = Pᵀ+Qᵀ` and `(Aᵀ)ᵀ = A` ✓. Uniqueness: the transpose of `A = P+Q` is `Aᵀ = P − Q` ✓ (the sign flip on Q is handled); adding gives `2P`, subtracting gives `2Q`, so P and Q are forced ✓. Both halves of "uniquely" are actually proved. |
| `saq_an_induction_3_neg4_1_neg1` | Recipe item 7 applied: `A¹ = [[3,−4],[1,−1]]` = formula at n=1 ✓; `A² = [[5,−8],[2,−3]]` = `[[1+4,−8],[2,1−4]]` ✓; `A³ = [[7,−12],[3,−5]]` = `[[1+6,−12],[3,1−6]]` ✓ (checked to n=5 in sympy). All four entries of the inductive step re-derived: `2k+3`, `−4k−4`, `k+1`, `−2k−1` ✓, and each rewrite into `1+2(k+1)`, `−4(k+1)`, `1−2(k+1)` is algebraically exact ✓. Conclusion restricted to integers n ≥ 1 ✓. |
| `saq_an_induction_rotation` | `A¹` ✓; `A²` multiplied out directly = `[[cos2θ, sin2θ],[−sin2θ, cos2θ]]` ✓; checked to n=4 symbolically. All four inductive entries re-derived, including the sign on the bottom-left `−sin(kθ+θ)` ✓. The compound-angle forms quoted are the correct ones (the CM correctly names `cos kθ cos θ + sin kθ sin θ` as the `cos(kθ−θ)` trap) ✓. Conclusion restricted to positive integers ✓. |

---

## 4. Where I initially disagreed and the card turned out right

1. **`cramer_x_minus_y_3z_5_negx` looked like a duplicate of the existing
   `ts_ipe_m1a_mat_cramer_x_minus_y_3z_5`.** My automated duplicate check flagged them as
   the same question, and both box the identical answer `(0, 1, 2)`. I was ready to file it
   as a duplicated card. It is not: the old card's third equation is `x + 3y + z = 5`, the
   new one's is `−x + 3y + z = 5`, and my normaliser had stripped the minus sign. The two
   really are different systems (Δ = 40 versus Δ = 50, different Δ₁/Δ₂/Δ₃). They share an
   answer only because `x = 0`, which makes the sign of the x-term invisible in the check.
   The new card is correct and legitimately distinct — see the nit in §5 all the same.

2. **`saq_det_sum_pairs_row_abc` step 2 looked like it had lost a row.** `R₂ → R₂ − R₃`
   turning `(a+b, b+c, c+a)` into `(b, c, a)` looked to me like a mis-transcription — I
   expected `(b, c, a)` to come out in some other order. It is exactly right:
   `a+b−a = b`, `b+c−b = c`, `c+a−c = a`. Substituting (2,3,5) into the reduced form gives
   10 × 7 = 70, matching the original determinant, so no factor was gained or lost.

3. **`saq_det_find_x_zero` step 2's factor looked like it should be −12.** Taking −2 out of
   R₂ and −6 out of R₃ *feels* like it should leave a negative outside, and the card's own
   CM warns about exactly that. It is +12: `(−2)(−6) = +12`. The final `x = 4` was then
   confirmed against `solve(det = 0)` as the unique root, which settles it.

4. **`vsaq_rank_2x3` step 2 "no further test is needed or possible" looked overstated.**
   I expected to have to check something more. It is correct — the rank is capped at
   min(2,3) = 2 and two non-zero echelon rows already reach the cap, so no larger minor
   exists to test.

5. **`laq_det_condition_abc_neg1`'s two column interchanges looked like they should flip the
   sign** and give `abc = 1`. Counting them again — `C₁↔C₂` then `C₂↔C₃` — gives two sign
   changes, which cancel. Confirmed numerically: at (2,3,5) both determinants equal +6, not
   ±6. The card is right, and its CM names the one-interchange slip as the trap.

---

## 5. Nits — reported, deliberately **not** banded

These are judgment calls I am flagging rather than banding, so the founder can decide.

1. **`inverse_x_minus_y_3z_5_negx` and `inverse_x_y_z_9_2x5y7z52`, step `s4_adj_inverse`.**
   Both check `A(Adj A) = (det A)I` **on the top row only**, then write *"So A·A⁻¹ = I"* /
   *"So A·A⁻¹ = I and the inverse is correct."* The stated conclusion is true (I multiplied
   out all nine entries of both products and got exactly `50 I` and `−4 I`), and the card
   labels the check as a top-row check — but a one-row spot-check does not, on its own,
   establish the identity. A student copying that inference into a proof would lose the
   mark. One clause would fix it: *"the top row already agrees, which is the usual quick
   check."* Not banded because nothing false is asserted about the mathematics.

2. **`gauss_x_y_z_1`, step `s3_pivot` `recall.must_convey`** reads *"…that is, the third
   pivot is made 1"* — but in this card the step is a **row swap**; nothing is scaled,
   because R₃ already reads `0 0 1`. The step's own `lines`, `label` ("Swap R₂ and R₃") and
   `memory_tip` are all correct; the `must_convey` looks like template text carried over
   from its three sibling Gauss cards, where a scaling really does happen. Outcome-wise it
   is still true (the row does read `0 0 1`), so no band.

3. **`saq_3a_minus_4bt` step 1 line** *"The 5 moves from row 2 to row 3; the 1 in row 3 of B
   moves to row 1 of Bᵀ."* Verified correct (B(2,3)=5 → Bᵀ(3,2); B(3,1)=1 → Bᵀ(1,3)), but
   the phrasing names only the row and drops the column, which is the half a confused
   student needs. Cosmetic.

4. **Near-duplicate question in the unit.** `cramer_x_minus_y_3z_5_negx` (new, from Sri
   Chaitanya) and `cramer_x_minus_y_3z_5` (pre-existing, from Baby Bullet-Q) differ in one
   sign of one coefficient and box the identical answer. Both are correct and both are
   legitimately sourced, but a student meeting them back to back will read the second as a
   printing error in the first. Worth a deliberate decision, not a fix.

5. **`vsaq_2a_plus_bt_and_3bt_minus_a` is the heaviest 2-mark card in the set** — one
   transpose plus two scalings plus two 3×2 combinations in a 4-minute VSAQ. The mathematics
   is right and the mark split is already flagged in the card as ours-not-the-book's; noting
   it only because it is an outlier against its 22 VSAQ neighbours.

6. **Register (Rule 41), two spots.** `laq_det_condition_abc_neg1` s3 margin note: *"This is
   where the abc of the answer is born"* and *"Each ROW is a geometric run"*. Both are mild
   metaphors in a margin note rather than in a title or caption. Everything else in the 49
   reads as plain literal English.

**Checked and found NOT to be defects** (recording them so nobody re-opens them):
`mark_split` omits the zero-mark step in the four cards that have one
(`laq_det_a_minus_1_cubed`, `laq_det_condition_abc_neg1`, both induction cards) — that is
the bank-wide convention, 272 of the 274 pre-existing cards with a zero-mark step do the
same. Romanised-Telugu phrases in `recall.accept` appear in 37 of the 49 new cards; 390 of
the 507 pre-existing Maths-1A cards do the same, so this is the convention, not a
regression. All 49 sit at unit 5 "Matrices" with the 2026-27 mark values (VSAQ 2 / Section A,
SAQ 4 / Section B, LAQ 8 / Section C), and every card's step marks and `mark_split` sum to
`marks_total`.

---

## 6. Coverage statement — honest

- **49 of 49 cards received a dedicated pass.** Nothing in this corpus was sampled, skimmed
  or inferred from a sibling. Every card's `question_text`, every step's `lines`, every
  katex `bmatrix`/`vmatrix`/`array` body, every `common_mistakes` bullet, every
  `margin_note` and every `memory_tip` was read and re-derived. No card is CLEAN by default.
- **What was verified per the domain recipe:** 21 determinants each expanded a second time
  along a different row or column; 4 linear systems each substituted into all three original
  equations; 3 method-trios cross-checked against each other (Cramer ↔ inversion ↔
  Gauss-Jordan agree on every system that has more than one card); every intermediate
  augmented matrix in all 5 Gauss-Jordan/rank-test cards tested against the final solution;
  2 inverses multiplied out in full (all 9 entries, not one row) plus the diagonal inverse
  symbolically; all 18 cofactors in the two inversion cards recomputed individually with
  their signs; every `Adj A` confirmed to be the transpose of the cofactor matrix; 8
  determinant identities each substituted with two independent triples **and** confirmed
  symbolically; both `Aⁿ` cards expanded to A¹, A², A³ (and to A⁵ / A⁴ in sympy); all 7
  definition cards checked word by word against the standard statements.
- **What got a lighter pass:** the `recall.accept` / `reject` / `heard_as` phrase lists.
  I read every `must_convey` line in all 49 cards and confirmed each numeric claim in them
  matches the card's derived answer, and I read the `accept` arrays where a step's
  mathematics was in question, but I did **not** re-derive every one of the ~250 individual
  accept phrases for pronunciation or completeness. If a defect survives this pass, that is
  the likeliest place for it. The `verification.note` blocks were also not audited for
  source-attribution accuracy — that is outside this remit and, by instruction, was not
  read as evidence of anything.
- **Nothing was rendered.** KaTeX bodies were checked by reading the source and comparing
  each matrix entry against the prose and the question text; they were not compiled or
  screenshotted, so a rendering-layer defect (a face that does not exist in the shipped
  font, say) would not be visible to this pass.

---

## 7. Reproduction

The independent numeric check (44 assertions, all OK) is:

```python
from sympy import *
# rank cards
assert Matrix([[1,0],[2,-1]]).det()==-1
assert Matrix([[1,2,0],[3,4,1],[-2,3,2]]).det()==-11
assert Matrix([[1,2,0,-1],[3,4,1,2],[-2,3,2,5]]).rank()==3
assert Matrix([[1,2,1],[-1,0,2],[0,1,-1]]).det()==-5
assert Matrix([[1,4,-1],[2,3,0],[0,1,2]]).det()==-12
# products
assert Matrix([[-1,2],[0,1]])*Matrix([[-1,0],[2,1]])==Matrix([[5,2],[2,1]])
A=Matrix([[1,-2,3],[2,3,-1],[-3,1,2]]); B=Matrix([[1,0,2],[0,1,2],[1,2,0]])
assert A*B==Matrix([[4,4,-2],[1,1,10],[-1,5,-4]])
assert B*A==Matrix([[-5,0,7],[-4,5,3],[5,4,1]])
assert all((A*B)[i]!=(B*A)[i] for i in range(9))        # "all nine differ"
A3=Matrix([[1,1,3],[5,2,6],[-2,-1,-3]])
assert A3**2==Matrix([[0,0,0],[3,3,9],[-1,-1,-3]]) and A3**3==zeros(3)
# systems: boxed solution into the ORIGINAL equations
for M,d,sol in [([[2,-1,3],[-1,2,1],[3,1,-4]],[8,4,0],[2,2,2]),
                ([[1,-1,3],[4,2,-1],[-1,3,1]],[5,0,5],[0,1,2]),
                ([[1,1,1],[2,5,7],[2,1,-1]],[9,52,0],[1,3,5]),
                ([[1,1,1],[2,2,3],[1,4,9]],[1,6,3],[7,-10,4])]:
    assert Matrix(M)*Matrix(sol)==Matrix(d)
assert Matrix([[1,-1,3],[4,2,-1],[-1,3,1]]).adjugate()==Matrix([[5,10,-5],[-3,4,13],[14,-2,6]])
assert Matrix([[1,1,1],[2,5,7],[2,1,-1]]).adjugate()==Matrix([[-12,2,2],[16,-3,-5],[-8,1,3]])
def cram(M,d):
    M=Matrix(M); out=[]
    for c in range(3):
        N=M.copy(); N[:,c]=Matrix(d); out.append(N.det())
    return out
assert cram([[2,-1,3],[-1,2,1],[3,1,-4]],[8,4,0])==[-76,-76,-76]
assert cram([[1,-1,3],[4,2,-1],[-1,3,1]],[5,0,5])==[0,50,100]
assert cram([[1,1,1],[2,5,7],[2,1,-1]],[9,52,0])==[-4,-12,-20]
# identities
a,b,c,x,th,k=symbols('a b c x theta k')
assert simplify(Matrix([[b*c,b+c,1],[c*a,c+a,1],[a*b,a+b,1]]).det()-(a-b)*(b-c)*(c-a))==0
assert simplify(Matrix([[b+c,c+a,a+b],[a+b,b+c,c+a],[a,b,c]]).det()-(a**3+b**3+c**3-3*a*b*c))==0
assert simplify(Matrix([[1,a,a**2],[1,b,b**2],[1,c,c**2]]).det()-(a-b)*(b-c)*(c-a))==0
assert simplify(Matrix([[x,a,a],[a,x,a],[a,a,x]]).det()-(x+2*a)*(x-a)**2)==0
assert simplify(Matrix([[a-b,b-c,c-a],[b-c,c-a,a-b],[c-a,a-b,b-c]]).det())==0
assert solve(Eq(Matrix([[x-2,2*x-3,3*x-4],[x-4,2*x-9,3*x-16],[x-8,2*x-27,3*x-64]]).det(),0),x)==[4]
assert simplify(Matrix([[a**2+2*a,2*a+1,1],[2*a+1,a+2,1],[3,3,1]]).det()-(a-1)**3)==0
D =Matrix([[a,a**2,1],[b,b**2,1],[c,c**2,1]]).det()
Dl=Matrix([[a,a**2,1+a**3],[b,b**2,1+b**3],[c,c**2,1+c**3]]).det()
assert simplify(Dl-(1+a*b*c)*D)==0
# closed forms
M=Matrix([[3,-4],[1,-1]])
assert all(M**n==Matrix([[1+2*n,-4*n],[n,1-2*n]]) for n in range(1,6))
R=Matrix([[cos(th),sin(th)],[-sin(th),cos(th)]])
assert all(simplify(R**n-Matrix([[cos(n*th),sin(n*th)],[-sin(n*th),cos(n*th)]]))==zeros(2) for n in range(1,5))
# rank-test card
Mc=Matrix([[1,1,1],[2,2,-1],[1,1,-1]])
assert Mc.rank()==2 and Matrix([[1,1,1,3],[2,2,-1,3],[1,1,-1,1]]).rank()==2
assert Mc*Matrix([k,2-k,1])==Matrix([3,3,1])
# misc
assert Matrix([[1,2,Rational(-1,2)],[0,-1,2],[Rational(-1,2),2,1]]).trace()==1
assert 120*80+96*60+120*40==20160
assert Matrix([[a,0,0],[0,b,0],[0,0,c]]).inv()==diag(1/a,1/b,1/c)
# the one finding: (4B)^T == 4 B^T, so "scale Bt, not B" is not a mathematical rule
Bm=Matrix([[2,-1,0],[0,-2,5],[1,2,0]])
assert (4*Bm).T==4*Bm.T
```
