# Maths-1A Chapter 5 (Matrices) — gap-fill diff report

Source: `answer-book/sources/chaitanya_m1a_ch05_matrices.json` (83 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1a_ch05_matrices__ours.txt` (55 cards)

## 1. Tally

**83 source questions = 39 matched + 0 elsewhere + 43 missing + 1 uncertain**

### Cross-check against the earlier "38 MISSING" pass

I count **43 missing** (+1 uncertain), not 38. I did not adjust to hit 38 — here is where the
difference almost certainly comes from:

- **Four refs looked matched on stem-shape but are matched to a DIFFERENT source book's numbers.**
  Our bank pulls Matrices cards from at least two source books — this Chaitanya index, and a
  Baby Bullet-Q (Sri Publishers) index used for other chapters/units. Four of our existing cards are
  real Baby Bullet-Q board questions (with genuine `appearances` years) that are structurally
  identical to a Chaitanya question but numerically different:
  - `vsaq2ii` (Chaitanya, row 2 = `2x, 0, z`) vs our `ts_ipe_m1a_mat_vsaq_equality_3x3` (row 2 =
    `0, z−1, 7`) — different matrix, different answer.
  - `vsaq4` (Chaitanya, B row 2 = `4, 2`) vs our `ts_ipe_m1a_mat_vsaq_solve_for_x` (B row 2 = `7, 2`)
    — different matrix.
  - `vsaq13` (Chaitanya trace matrix has fractional entries `1,2,−½ / 0,−1,2 / −½,2,1`) vs our
    `ts_ipe_m1a_mat_vsaq_trace` (matrix `1,3,−5 / 2,−1,5 / 2,0,1`) — different matrix.
  - `laq9v`'s Cramer's-rule ask (Chaitanya, corrected 3rd equation `−x+3y+z=5`, Δ=50) vs our
    `ts_ipe_m1a_mat_cramer_x_minus_y_3z_5` (3rd equation `x+3y+z=5`, Δ=40) — different system
    (confirmed by recomputing Δ for both).
  A pass that matches on stem shape rather than on the actual numbers would likely have called
  all four of these MATCHED. That alone moves 4 refs from matched to missing.
- **Two "solve by three methods" LAQ refs are only partially covered.** `laq9iii` (Cramer's rule +
  Gauss-Jordan asked; we only have the Cramer's-rule card) and `laq9vii` (Cramer's rule + matrix
  inversion + Gauss-Jordan asked; we only have the matrix-inversion card) are each classified MISSING
  here because the ref as printed is not fully answered — a pass that treats "a card for this system
  exists" as sufficient would count these as matched. That accounts for roughly 2 more.
  Together these two effects (4 + 2 ≈ ~5–6) roughly explain a 38-vs-43 gap; I'd rather report my
  own count with the reasoning shown than silently reconcile to 38.
- I also moved **`laq10i` to UNCERTAIN rather than MATCHED or MISSING** (see the UNCERTAIN table) —
  a third possible source of divergence in either direction depending on how the earlier pass judged it.

No ELSEWHERE hits were found — grepped the whole `ts_ipe_m1*` bank for distinctive fragments of every
candidate gap (rank/adjoint/inverse definitions, the Vandermonde determinant, "AAᵀ symmetric", "commute",
"uniquely" symmetric+skew decomposition, "additive inverse", the book-shop word problem, etc.) and found
no genuine off-unit answer for any of them.

---

## 2. MISSING (43)

Paper `ABC_60`: VSAQ = 2 marks, SAQ = 4 marks, LAQ = 8 marks. `proposed_qtype`/`proposed question_id`
default to the source book's own section; flagged otherwise. Verified against
`ls answer-book/questions/ | grep m1a_mat` — none of the ids below collide with the 55 existing cards.

| ref | book section | stars | printed_page | stem (verbatim from source) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| vsaq2ii | VSAQ | 2 | 31 | If [[x−1, 2, y−5], [2x, 0, z], [1, −1, 1+a]] = [[1−x, 2, −y], [2, 0, 2], [1, −1, 1]], find x, y, z and a. | VSAQ | ts_ipe_m1a_mat_vsaq_equality_2x_0_z |
| vsaq4 | VSAQ | 1 | 31 | If A = [[1, 2], [3, 4]], B = [[3, 8], [4, 2]] and 2X + A = B, find X. | VSAQ | ts_ipe_m1a_mat_vsaq_2x_plus_a_eq_b_row42 |
| vsaq9 | VSAQ | 3 (legible min; gutter clipped) | 33 | If A = [[cos α, sin α], [−sin α, cos α]], show that AAᵀ = AᵀA = I. | VSAQ | ts_ipe_m1a_mat_vsaq_rotation_aat_identity |
| vsaq10 | VSAQ | 0 | 33 | If A = [[−2, 1], [5, 0], [−1, 4]] and B = [[−2, 3, 1], [4, 0, 2]], find 2A + Bᵀ and 3Bᵀ − A. | VSAQ | ts_ipe_m1a_mat_vsaq_2a_plus_bt_and_3bt_minus_a |
| vsaq12 | VSAQ | 1 | 33 | If A = [[−1, 2], [0, 1]], find AAᵀ. | VSAQ | ts_ipe_m1a_mat_vsaq_aat_minus1_2_0_1 |
| vsaq13 | VSAQ | 3 | 33 | Define the trace of a matrix, and find the trace of [[1, 2, −1/2], [0, −1, 2], [−1/2, 2, 1]]. | VSAQ | ts_ipe_m1a_mat_vsaq_trace_fractional_symmetric |
| vsaq14 | VSAQ | 0 | 34 | Define symmetric and skew-symmetric matrices. | VSAQ | ts_ipe_m1a_mat_vsaq_define_symmetric_skew |
| vsaq16 | VSAQ | 3 | 34 | If A = [[0, 4, −2], [−4, 0, 8], [2, −8, x]] is a skew-symmetric matrix, find the value of x. | VSAQ | ts_ipe_m1a_mat_vsaq_skew_symmetric_find_x_4_2_8 |
| vsaq17 | VSAQ | 0 | 34 | Is [[0, 1, 4], [−1, 0, 7], [−4, −7, 0]] symmetric or skew-symmetric? | VSAQ | ts_ipe_m1a_mat_vsaq_classify_symmetric_skew |
| vsaq18 | VSAQ | 0 | 34 | For any square matrix A, show that AAᵀ is symmetric. | VSAQ | ts_ipe_m1a_mat_vsaq_aat_is_symmetric_proof |
| vsaq19 | VSAQ | 0 | 34 | Define the rank of a matrix. | VSAQ | ts_ipe_m1a_mat_vsaq_define_rank |
| vsaq20ii | VSAQ | 0 (gutter clipped, unverified) | 35 | Find the rank of [[1, 4, −1], [2, 3, 0], [0, 1, 2]]. | VSAQ | ts_ipe_m1a_mat_vsaq_rank_1_4_neg1 |
| vsaq20iii | VSAQ | 0 (gutter clipped, unverified) | 35 | Find the rank of the 3 × 4 matrix [[1, 2, 0, −1], [3, 4, 1, 2], [−2, 3, 2, 5]]. | VSAQ | ts_ipe_m1a_mat_vsaq_rank_3x4 |
| vsaq20iv | VSAQ | 0 (gutter clipped, unverified) | 35 | Find the rank of the 2 × 3 matrix [[1, 0, −4], [2, −1, 3]]. | VSAQ | ts_ipe_m1a_mat_vsaq_rank_2x3 |
| vsaq20v | VSAQ | 0 (gutter clipped, unverified) | 35 | Find the rank of [[1, 2, 1], [−1, 0, 2], [0, 1, −1]]. | VSAQ | ts_ipe_m1a_mat_vsaq_rank_1_2_1_alt |
| vsaq22 | VSAQ | 0 | 36 | Define the adjoint of a matrix. | VSAQ | ts_ipe_m1a_mat_vsaq_define_adjoint |
| vsaq23 | VSAQ | 0 | 36 | Define the inverse of a matrix. | VSAQ | ts_ipe_m1a_mat_vsaq_define_inverse |
| vsaq25 | VSAQ | 0 | 36 | Find the additive inverse of the matrix [[i, 0, 1], [0, −i, 2], [−1, 1, 5]]. | VSAQ | ts_ipe_m1a_mat_vsaq_additive_inverse_complex |
| vsaq27 | VSAQ | 0 | 36 | Find the minor and the cofactor of the element 5 in [[1, 0, −2], [3, −1, 2], [4, 5, 6]]. | VSAQ | ts_ipe_m1a_mat_vsaq_minor_cofactor_of_5 |
| vsaq28 | VSAQ | 0 | 36 | Define a triangular matrix. | VSAQ | ts_ipe_m1a_mat_vsaq_define_triangular |
| vsaq29 | VSAQ | 0 (gutter clipped) | 37 | Write the definitions of singular and non-singular matrices, and give an example of each. | VSAQ | ts_ipe_m1a_mat_vsaq_define_singular_nonsingular |
| vsaq30 | VSAQ | 1 | 37 | A book shop holds 10 dozen chemistry books, 8 dozen physics books and 10 dozen economics books, selling at Rs. 80, Rs. 60 and Rs. 40 each respectively. Using matrix algebra, find the total value of the books in the shop. | VSAQ | ts_ipe_m1a_mat_vsaq_shop_inventory_value |
| vsaq31 | VSAQ | 1 | 37 | Show that det[[a−b, b−c, c−a], [b−c, c−a, a−b], [c−a, a−b, b−c]] = 0. | VSAQ | ts_ipe_m1a_mat_vsaq_det_cyclic_diff_zero |
| saq4 | SAQ | 3 | 39 | Show that det[[1, a, a²], [1, b, b²], [1, c, c²]] = (a−b)(b−c)(c−a). | SAQ | ts_ipe_m1a_mat_saq_det_vandermonde_1_a_a2 |
| saq8 | SAQ | 3 | 40 | Find the value of x if det[[x−2, 2x−3, 3x−4], [x−4, 2x−9, 3x−16], [x−8, 2x−27, 3x−64]] = 0. | SAQ | ts_ipe_m1a_mat_saq_det_find_x_zero |
| saq9ii | SAQ | 1 | 41 | If A = [[1, 4, 7], [2, 5, 8]] and B = [[−3, 4, 0], [4, −2, −1]], verify that (A + B)ᵀ = Aᵀ + Bᵀ. | SAQ | ts_ipe_m1a_mat_saq_verify_sum_transpose |
| saq9iii | SAQ | 1 | 41 | If A = [[1, 5, 3], [2, 4, 0], [3, −1, −5]] and B = [[2, −1, 0], [0, −2, 5], [1, 2, 0]], find 3A − 4Bᵀ. | SAQ | ts_ipe_m1a_mat_saq_3a_minus_4bt |
| saq10i | SAQ | 3 | 42 | If A = [[3, −4], [1, −1]], show that for every integer n ≥ 1, Aⁿ = [[1+2n, −4n], [n, 1−2n]]. | SAQ | ts_ipe_m1a_mat_saq_an_induction_3_neg4_1_neg1 |
| saq10ii | SAQ | 3 | 42 | If A = [[cos θ, sin θ], [−sin θ, cos θ]], show that for every positive integer n, Aⁿ = [[cos nθ, sin nθ], [−sin nθ, cos nθ]]. | SAQ | ts_ipe_m1a_mat_saq_an_induction_rotation |
| saq11 | SAQ | 3 | 42 | Show that det[[b+c, c+a, a+b], [a+b, b+c, c+a], [a, b, c]] = a³ + b³ + c³ − 3abc. | SAQ | ts_ipe_m1a_mat_saq_det_sum_pairs_row_abc |
| saq12 | SAQ | 0 (gutter clipped, unverified) | 43 | Show that det[[bc, b+c, 1], [ca, c+a, 1], [ab, a+b, 1]] = (a−b)(b−c)(c−a). | SAQ | ts_ipe_m1a_mat_saq_det_bc_ca_ab_column |
| saq15iii | SAQ | 3 | 44 | Find the inverse of A = [[a, 0, 0], [0, b, 0], [0, 0, c]]. | SAQ | ts_ipe_m1a_mat_saq_inverse_diagonal_abc |
| saq16 | SAQ | 0 (gutter clipped, unverified) | 45 | Show that det[[x, a, a], [a, x, a], [a, a, x]] = (x + 2a)(x − a)². | SAQ | ts_ipe_m1a_mat_saq_det_x_2a_x_minus_a_sq |
| saq17 | SAQ | 0 | 45 | If A = [[1, −2, 3], [2, 3, −1], [−3, 1, 2]] and B = [[1, 0, 2], [0, 1, 2], [1, 2, 0]], check whether A and B commute under matrix multiplication. | SAQ | ts_ipe_m1a_mat_saq_check_ab_commute |
| saq18ii | SAQ | 0 | 46 | If A = [[1, 1, 3], [5, 2, 6], [−2, −1, −3]], find A³. | SAQ | ts_ipe_m1a_mat_saq_a_cubed_1_1_3 |
| saq19i | SAQ | 0 | 46 | If A and B are invertible, show that AB is invertible and (AB)⁻¹ = B⁻¹A⁻¹. | SAQ | ts_ipe_m1a_mat_saq_ab_inverse_reverse_order |
| saq19ii | SAQ | 3 (appearance Mar-03) | 46 | Prove that every square matrix can be expressed uniquely as the sum of a symmetric matrix and a skew-symmetric matrix. | SAQ | ts_ipe_m1a_mat_saq_sym_skew_decomposition_proof |
| laq3 | LAQ | 3 | 47 | If det[[a, a², 1+a³], [b, b², 1+b³], [c, c², 1+c³]] = 0 and det[[a, a², 1], [b, b², 1], [c, c², 1]] ≠ 0, show that abc = −1. | LAQ | ts_ipe_m1a_mat_laq_det_condition_abc_neg1 |
| laq8 | LAQ | 3 | 49 | Show that det[[a²+2a, 2a+1, 1], [2a+1, a+2, 1], [3, 3, 1]] = (a − 1)³. | LAQ | ts_ipe_m1a_mat_laq_det_a_minus_1_cubed |
| laq9ii | LAQ | 0 | 51 | Solve x + y + z = 9, 2x + 5y + 7z = 52, 2x + y − z = 0 by matrix inversion, by Cramer's rule and by the Gauss-Jordan method. | LAQ ×3 | ts_ipe_m1a_mat_cramer_x_y_z_9_2x5y7z52, ts_ipe_m1a_mat_inverse_x_y_z_9_2x5y7z52, ts_ipe_m1a_mat_gauss_x_y_z_9_2x5y7z52 |
| laq9iii | LAQ | 0 (label clipped) | 53 | Solve x + y + z = 1, 2x + 2y + 3z = 6, x + 4y + 9z = 3 by Cramer's rule and by the Gauss-Jordan method. **Cramer's-rule part already covered by `ts_ipe_m1a_mat_cramer_x_y_z_1` — only the Gauss-Jordan card is actually missing.** | LAQ | ts_ipe_m1a_mat_gauss_x_y_z_1 |
| laq9v | LAQ | 0 (varies by method header) | 55 | Solve x − y + 3z = 5, 4x + 2y − z = 0, −x + 3y + z = 5 [corrected from the printed −x+3y+3z=5 — see NOTES] by Cramer's rule, by matrix inversion and by the Gauss-Jordan method. **None of the 3 methods for THIS system exist** — our `cramer_x_minus_y_3z_5` card is a different (Baby Bullet-Q) system, see §1. | LAQ ×3 | ts_ipe_m1a_mat_cramer_x_minus_y_3z_5_negx, ts_ipe_m1a_mat_inverse_x_minus_y_3z_5_negx, ts_ipe_m1a_mat_gauss_x_minus_y_3z_5_negx |
| laq9vii | LAQ | varies (inversion ***, GJ * per method header; appearance Mar-2007) | 57 | Solve 3x + y − 4z = 0, −x + 2y + z = 4, 2x − y + 3z = 8 by the Gauss-Jordan method, by Cramer's rule and by matrix inversion. **Matrix-inversion part already covered by `ts_ipe_m1a_mat_inverse_2x_y_3z_8` — only Cramer's rule and Gauss-Jordan are actually missing.** | LAQ ×2 | ts_ipe_m1a_mat_cramer_2x_y_3z_8, ts_ipe_m1a_mat_gauss_2x_y_3z_8 |

**KaTeX flag:** 34 of these 43 stems involve a matrix or determinant that must be typeset as a genuine
2-D array (KaTeX `\begin{bmatrix}`/`\begin{vmatrix}`), not plain Unicode — every numeric matrix/determinant
question above. The 9 that do NOT strictly need it: `vsaq14`, `vsaq18`, `vsaq19`, `vsaq22`, `vsaq23`,
`vsaq28`, `vsaq29` (pure definitions — though the authored answer will likely still show one small
illustrative matrix), and `saq19i`, `saq19ii` (general proofs stated over a generic square matrix A,
no numeric grid required in the stem).

---

## 3. MATCHED (39)

| ref | question_id |
|---|---|
| vsaq1 | ts_ipe_m1a_mat_vsaq_det_equals_45 |
| vsaq2i | ts_ipe_m1a_mat_vsaq_equality_2x2 |
| vsaq3 | ts_ipe_m1a_mat_sqp_construct_3x2 |
| vsaq5 | ts_ipe_m1a_mat_vsaq_3b_minus_2a |
| vsaq6 | ts_ipe_m1a_mat_vsaq_find_k_nilpotent |
| vsaq7i | ts_ipe_m1a_mat_vsaq_i_squared |
| vsaq7ii | ts_ipe_m1a_mat_sqp_i_squared_minus_i |
| vsaq8 | ts_ipe_m1a_mat_vsaq_a_plus_transpose |
| vsaq11 | ts_ipe_m1a_mat_sqp_ab_transpose |
| vsaq15i | ts_ipe_m1a_mat_vsaq_symmetric_find_x |
| vsaq15ii | ts_ipe_m1a_mat_vsaq_skew_symmetric_find_x |
| vsaq20i | ts_ipe_m1a_mat_vsaq_rank_one |
| vsaq21 | ts_ipe_m1a_mat_vsaq_rank_two |
| vsaq24 | ts_ipe_m1a_mat_sqp_rotation_inverse |
| vsaq26 | ts_ipe_m1a_mat_sqp_omega_determinant |
| vsaq32 | ts_ipe_m1a_mat_vsaq_det_of_squares |
| saq1 | ts_ipe_m1a_mat_saq_ai_plus_be_cubed |
| saq2 | ts_ipe_m1a_mat_saq_trig_product_zero |
| saq3a | ts_ipe_m1a_mat_saq_a_squared_minus_4a_minus_5i |
| saq3b | ts_ipe_m1a_mat_saq_a_cubed_identity |
| saq5 | ts_ipe_m1a_mat_sqp_transpose_inverse |
| saq6 | ts_ipe_m1a_mat_saq_inverse_equals_a_cubed |
| saq7 | ts_ipe_m1a_mat_sqp_adj_three_at |
| saq9i | ts_ipe_m1a_mat_vsaq_reverse_law_transpose (authored as a 2-mark VSAQ, not a 4-mark SAQ — see NOTES) |
| saq13 | ts_ipe_m1a_mat_saq_inverse_equals_transpose |
| saq14 | ts_ipe_m1a_mat_saq_inverse_formula_proof |
| saq15i | ts_ipe_m1a_mat_saq_nonsingular_inverse_1_2_1 |
| saq15ii | ts_ipe_m1a_mat_saq_adj_inverse_1_0_2 |
| saq15iv | ts_ipe_m1a_mat_saq_adj_inverse_1_3_3 |
| saq18i | ts_ipe_m1a_mat_sqp_scalar_fourth_power |
| laq1 | ts_ipe_m1a_mat_det_a_minus_b_minus_c |
| laq2 | ts_ipe_m1a_mat_det_sum_2c_cube |
| laq4 | ts_ipe_m1a_mat_det_square_cyclic |
| laq5 | ts_ipe_m1a_mat_det_bc_ca_ab_twice |
| laq6 | ts_ipe_m1a_mat_det_1_a2_a3 |
| laq7 | ts_ipe_m1a_mat_det_powers_abc |
| laq9i | ts_ipe_m1a_mat_cramer_3x_4y_5z_18 + ts_ipe_m1a_mat_inverse_3x_4y_5z_18 + ts_ipe_m1a_mat_gauss_3x_4y_5z_18 (all 3 requested methods present) |
| laq9iv | ts_ipe_m1a_mat_cramer_2x_y_3z_9 + ts_ipe_m1a_mat_inverse_2x_y_3z_9 + ts_ipe_m1a_mat_gauss_2x_y_3z_9 (all 3 requested methods present) |
| laq9vi | ts_ipe_m1a_mat_gauss_infinite_solutions |

---

## 4. ELSEWHERE

None. Matrices is a self-contained unit and every candidate gap was grepped against the full
`ts_ipe_m1*` bank (rank/adjoint/inverse/triangular/singular definitions, the Vandermonde determinant,
"AAᵀ symmetric", "A and B commute", the symmetric+skew "uniquely" decomposition, "additive inverse",
the book-shop word problem) with no genuine off-unit hit.

---

## 5. UNCERTAIN

| ref | reasoning |
|---|---|
| laq10i | "Examine whether x+y+z=3, 2x+2y−z=3, x+y−z=1 is consistent or inconsistent, and if consistent find the complete solution." This is the IDENTICAL system to `laq9vi`, which our `ts_ipe_m1a_mat_gauss_infinite_solutions` card answers by direct Gauss-Jordan elimination to a solution. The source's own note calls laq10i "the same system as laq9vi, but a different ask" — laq10i is framed as a rank-test consistency examination, a distinct technique our bank already treats as its own card type elsewhere (`ts_ipe_m1a_mat_sqp_rank_test`, but for a different system: x+y+z=6, x−y+z=2, 2x−y+3z=9). I cannot confidently say whether reusing the Gauss-Jordan solve counts as answering the consistency-examination ask, or whether TS IPE graders would want a dedicated rank-test presentation (compare rank of A vs rank of [A|B]) for this exact system. Flagging rather than guessing, per instructions — a wrong MATCHED here would silently drop a real gap, and a wrong MISSING would duplicate content that already exists. |

---

## 6. NOTES

**Mathematically wrong / ill-posed stems (both already flagged by the source index, carried forward here):**
- `laq9v` — PRINTED DEFECT. The book prints the third equation as `−x + 3y + 3z = 5`, but every matrix
  the book itself writes for this system uses the row `(−1, 3, 1)`, i.e. `−x + 3y + z = 5`, and only
  that version is consistent with the book's own Δ = 50 and answer (0, 1, 2). The corrected equation is
  used in the MISSING table above. (The book's own Cramer's-rule restatement also mis-sets "x − y + 33 = 5"
  for "x − y + 3z = 5" — a second typo in the same question, also corrected.)
- `saq17` — wording defect, not a math error. The book's instruction reads "verify A and B commute",
  but the book's own working concludes AB ≠ BA — they do NOT commute. Author it as "check whether A and
  B commute" (the source index already renames it this way), not as a "show that they commute" proof.

**Duplicate / overlapping source questions:**
- No two refs share an identical stem. `laq9vi` and `laq10i` share the exact same linear system
  (x+y+z=3, 2x+2y−z=3, x+y−z=1) under two different asks — see the UNCERTAIN entry above; this is an
  overlap in the underlying system, not a literal duplicate question.

**Cross-section authoring precedent worth flagging:** `saq9i` (Chaitanya SAQ, 4 marks) is already
matched in our bank by `ts_ipe_m1a_mat_vsaq_reverse_law_transpose`, authored as a 2-mark VSAQ. This is
apparently a deliberate, defensible call (this transpose-reverse-law question is short enough to appear
as a Section-A VSAQ in some editions/papers), not an error — flagging only so a reviewer isn't surprised
by the qtype mismatch between the source index and the matched card.

**Matrix/determinant KaTeX count:** see the KaTeX flag under the MISSING table — 34 of 43 missing
stems need a real 2-D array typeset in KaTeX (matrices up to 3×4, several with fractional or complex
entries), not plain Unicode; only 9 (pure definitions/general proofs) can plausibly avoid it in the stem.

**Rule 35 (culture-neutral) flag:** `vsaq30` (the book-shop word problem) is the only stem in this
chapter carrying a currency (Rs.) and country-specific framing (a book shop selling chemistry/physics/
economics textbooks) — it will need a neutral restatement (units of stock and a generic currency/price
framing, or drop the shop framing for an equivalent neutral inventory-valuation problem) when authored,
per Rule 35.

**Star-prefix caveat carried from the source index:** several `stars: 0` and "legible minimum" values
above are recorded because the scan's left gutter is clipped on those pages (Chaitanya's own
`star_gutter` convention note) — treat any `0` as "unverified", not "confirmed zero stars", when
prioritizing authoring order.

---

## Verification

83 refs total; 39 (MATCHED table) + 43 (MISSING table) + 0 (ELSEWHERE) + 1 (UNCERTAIN table) = 83.
Every ref from `answer-book/sources/chaitanya_m1a_ch05_matrices.json` appears in exactly one table above.
