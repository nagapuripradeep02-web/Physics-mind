# Independent examiner pass — PR #181 Maths-1A: Sets & Relations + Sequences & Series

**Examiner:** independent pass, 2026-08-31. Corpus: 51 cards (`ts_ipe_m1a_sr_*` ×26, `ts_ipe_m1a_ss_*` ×25).
**Rule of this pass:** `verification.note` is NOT evidence. Every result re-derived from `question_text`.

*(Report written incrementally — sections appear in the order they were examined.)*

---

## Mechanical check 9 — fabricated exam history (all 51 cards)

Both chapters are new to the 2026-27 Telangana syllabus, so no board has examined them.

Machine-checked every one of the 51 files:

- `appearances[]` length = **0 on all 51 cards**.
- The substring `insider_note` appears in **0 of the 51 files** (whole-file JSON scan, not just the top level).

**Result: check 9 PASSES on all 51. No fabricated exam history anywhere in the corpus.**

---

## Chapter 1 — Sets and Relations (`ts_ipe_m1a_sr_*`, 26 cards)

**Tally:** WRONG 0 · MISLEADING 1 · THIN 0 · CLEAN 25.

### Findings

| Card | Line | What it says | What it should say | Numeric evidence |
|---|---|---|---|---|
| `ts_ipe_m1a_sr_subsets_and_power_set_of_1_2_3` | step `s2_list`, `common_mistakes[0]` (file line 131) | "Leaving out ∅ **or** leaving out A itself, which gives only **6** subsets." | Either "…which gives only **7** subsets", or split into two bullets as the sibling card already does. | A = {1,2,3} has 2³ = 8 subsets. Drop ∅ only → {1},{2},{3},{1,2},{1,3},{2,3},{1,2,3} = **7**. Drop A only → ∅,{1},{2},{3},{1,2},{1,3},{2,3} = **7**. Only dropping **both** gives 6. As written with "or", the stated count is wrong for either stated mistake. |

Severity note: the answer mathematics on this card is entirely correct (|A| = 3, |P(A)| = 8, all eight subsets listed, 1+3+3+1 = 8). The defect is confined to one `common_mistakes` bullet, so I banded it MISLEADING rather than WRONG — but a strict reading of "mathematics incorrect on any line" would put it in WRONG, and the fix is one character.

**The sibling card proves the fix already exists in this corpus:** `ts_ipe_m1a_sr_power_set_minus3_0_3` (file lines 129–130) writes the same two mistakes as two separate bullets — "Leaving out ∅, which is a subset of every set." / "Leaving out A itself, which is also a subset of A." — with no count attached, and is correct.

### CLEAN list — Sets and Relations (25 cards, with the checks actually run)

| Card | Checks run |
|---|---|
| `sr_a_minus_b_minus_c` | A={1,2,3}, B={2,3,4}, C={3,4,5,6}. B−C: 3,4∈C, 2∉C → {2} ✓. A−{2} = {1,3} ✓. Verified the `why` claim that (A−B)−C = {1}: A−B={1}, {1}−C={1} ✓ — so the non-associativity warning is true and the two answers really do differ. CM "B−C={5,6} is C−B" checked: C−B = {5,6} ✓. |
| `sr_cartesian_product_intersection` | A={1,2,3}, B={2,3}, C={3,4,7}. Enumerated **both** products independently rather than trusting the identity: A×B = 6 pairs, A×C = 9 pairs (counts as the card claims ✓); their intersection by inspection = {(1,3),(2,3),(3,3)} — identical to A×(B∩C) = A×{3} ✓. Identity (A×B)∩(A×C) = A×(B∩C) confirmed as a genuine theorem, not a card-specific coincidence. |
| `sr_cartesian_product_over_union_intersection` | A={2,3,4}, B={4,5}, C={5,6,7}. B∪C={4,5,6,7} ✓, B∩C={5} ✓. (i) 12 pairs enumerated and matched one by one ✓. (ii) 3 pairs ✓. (iii) A×B (6) ∪ A×C (9) with 3 shared pairs → 6+9−3 = 12, and the listed 12 pairs match (i) element for element ✓. CM "6+9=15 by not removing repeats" arithmetically correct ✓. |
| `sr_de_morgan_universal_1_to_7` | U={1..7}, A={1,2,3}, B={3,5,6}. A′={4,5,6,7} ✓, B′={1,2,4,7} ✓. (i) A∪B={1,2,3,5,6} → ′ = {4,7}; A′∩B′ = {4,7} ✓. (ii) A∩B={3} → ′ = {1,2,4,5,6,7}; A′∪B′ = {1,2,4,5,6,7} ✓. CM "4 is in U but in neither A nor B" verified: 4∉A, 4∉B ✓. |
| `sr_de_morgan_universal_1_to_9` | U={1..9}, A={2,4,6}, B={3,5,7}. A′={1,3,5,7,8,9} ✓, B′={1,2,4,6,8,9} ✓. (i) both sides = {1,8,9} ✓. (ii) A∩B=∅ (disjoint ✓), so (A∩B)′=U; A′∪B′ = all nine = U ✓. |
| `sr_define_cartesian_product` | Definition A×B = {(a,b) : a∈A, b∈B} correct, "ordered" present. Example A={1,2}, B={x,y}: 4 pairs enumerated ✓, n(A)·n(B)=4 ✓. The `why`'s claim that B×A = {(x,1),(x,2),(y,1),(y,2)} is a different set — verified ✓. |
| `sr_define_equivalence_relation` | All three properties stated with correct quantifiers/implications. Example A={1,2,3,4}, "same remainder mod 2": enumerated the relation independently — odd class {1,3} gives (1,1),(1,3),(3,1),(3,3); even class {2,4} gives (2,2),(2,4),(4,2),(4,4) = exactly the 8 pairs listed ✓. Reflexive and symmetric verified by enumeration; every transitive join closes ✓. Checked the `memory_tip`'s general claim "same remainder or same value relations are always equivalence relations" — true (any relation of the form f(a)=f(b) is an equivalence relation), so not a false theorem. |
| `sr_define_power_set` | P(A)={X : X⊆A} correct. A={a,b}: enumerated ∅,{a},{b},{a,b} = 4 = 2² ✓. The 2ⁿ claim carries its finiteness condition **in the student-visible line** ("if A is finite with n(A) = n") ✓ — check 12 passes. |
| `sr_define_reflexive_relation` | Definition carries "for every a ∈ A" ✓. Example A={1,2,3}, R={(1,1),(2,2),(3,3),(1,3)}: all three (a,a) present ✓, so reflexive ✓. Verified the card's point that the extra pair (1,3) is irrelevant to reflexivity ✓. |
| `sr_define_relation` | R ⊆ A×B correct. A={1,2}, B={3,4}: A×B enumerated = 4 pairs ✓. R={(1,3),(2,4)}: domain {1,2} ✓, range {3,4} ✓ (both read off the pairs). |
| `sr_define_set_and_cardinality` | Both definitions correct; "well-defined" and "distinct" present. n({2,4,6,8}) = 4 ✓, n(∅) = 0 ✓. CM "confusing n(A) with the number of subsets, which is 2 raised to n(A)" — the quoted rule is correct ✓. |
| `sr_define_symmetric_difference` | AΔB = (A−B)∪(B−A) correct. A={1,2,3}, B={3,4}: A−B={1,2} ✓, B−A={4} ✓, AΔB={1,2,4} ✓; 3 correctly excluded ✓. |
| `sr_define_symmetric_relation` | Implication form correct. Example A={1,2,3}, R={(1,2),(2,1),(3,3)}: reversed every pair — (1,2)↔(2,1) both present ✓, (3,3) self-reverse ✓ → symmetric ✓. Verified the margin note's claim that this R is symmetric but **not** reflexive: (1,1) and (2,2) are indeed absent ✓. |
| `sr_define_transitive_relation` | Implication with three letters correct. Example A={1,2,3}, R={(1,2),(2,3),(1,3)}: enumerated **all** joins, not just the one shown — (1,2)+(2,3)→(1,3)∈R ✓; (1,3) and (2,3) each end at 3 and no pair starts with 3, so no further join exists ✓. The card's line "No pair starts with 3" is therefore true and the check is exhaustive ✓. |
| `sr_distributive_union_over_intersection` | A={0,1,3,5}, B={1,2,4,7}, C={1,2,3,5,8}. A∩C={1,3,5} ✓ (0∉C). LHS = {1,2,3,4,5,7} ✓. A∪B={0,1,2,3,4,5,7} ✓, C∪B={1,2,3,4,5,7,8} ✓, RHS intersection = {1,2,3,4,5,7} ✓ (0 dropped, 8 dropped). Both CMs about 0 and 8 verified against the two unions ✓. Checked the `memory_tip`'s general claim "B is united with both brackets, so every member of B is in the final set" — true (B ⊆ A∪B and B ⊆ C∪B ⇒ B ⊆ their intersection), and true here: {1,2,4,7} ⊆ {1,2,3,4,5,7} ✓. |
| `sr_intersections_three_sets` | A={1..7}, B={2,4,6,7,8,11}, C={1,3,5,7,9}. A∩B={2,4,6,7} ✓, A∩C={1,3,5,7} ✓, B∩C={7} ✓ (checked every member of C against B). Triple = {2,4,6,7}∩C = {7} ✓. CM "union in place of A∩B" quotes {1,2,3,4,5,6,7,8,11} — verified this really is A∪B ✓. CM "A∩(B∪C) instead" verified to give a different set (= A) ✓. |
| `sr_parallel_lines_equivalence` | All three properties argued for arbitrary lines, not one drawing. The self-parallel convention is **stated in the student-visible working before the reflexive check**, not parked in a note ✓ (check 12). Verified the s2 `why`: under the "distinct lines that never meet" convention, l∥m and m∥l would force l∥l by transitivity, which that convention denies — so transitivity, not only reflexivity, depends on the convention. Correct. CM "arguing transitivity only from 'never meet' does not rule out l = n" — correct, since a line does meet itself. |
| `sr_power_set_512_elements` | 2ⁿ = 512 set up correctly. Verified 512 = 2⁹ independently ✓, and the halving check: 512→256→128→64→32→16→8→4→2→1 is exactly 9 halvings, as the `why` claims ✓. Every entry of the memory-tip power table checked: 2⁶=64, 2⁷=128, 2⁸=256, 2⁹=512, 2¹⁰=1024 — all ✓. |
| `sr_power_set_minus3_0_3` | A={−3,0,3}, n(A)=3, 2³=8 ✓. Enumerated all eight subsets independently and matched the card's list exactly ✓. Group sizes 1,3,3,1 sum to 8 ✓. CM "3² = 9 instead of 2³ = 8" — both quoted numbers correct ✓. |
| `sr_relation_2x_plus_y_41_properties` | y = 41−2x; y≥1 ⇒ x≤20 ✓, so 20 pairs ✓. Spot-checked endpoints and interior: x=1→39 ✓, x=3→35 ✓, x=19→3 ✓, x=20→1 ✓. Reflexive: 3x=41 ⇒ x=41/3 ∉ ℕ ✓. Symmetric: (1,39)∈R (2+39=41 ✓) but 2(39)+1 = 79 ≠ 41 ✓. **Transitive counterexample re-derived from scratch:** (12,17) → 24+17 = 41 ✓ in R; (17,7) → 34+7 = 41 ✓ in R; (12,7) → 24+7 = 31 ≠ 41 ✓ not in R. The chain is genuine (both premises really lie in R) — this is the card most exposed to a fabricated counterexample, and it does not carry one. |
| `sr_relation_x_equals_y_domain_range` | A={1,2,5,7,9}; x=y admits exactly the 5 self-pairs ✓. Domain = range = A ✓. CM "giving all 25 pairs of A×A" — 5² = 25 ✓. |
| `sr_relation_x_less_than_y` | A={1,2,3}, B={1,3,6}. Tested all 9 candidate pairs: x=1 keeps 3,6 (1<1 false) ✓; x=2 keeps 3,6 ✓; x=3 keeps 6 only (3<3 false) ✓. R = 5 pairs ✓; 2+2+1 = 5 ✓; |A×B| = 9 ✓. |
| `sr_relation_x_plus_y_5_domain_range_codomain` | A={0,…,5}, B={0,…,4}. Ran y=5−x over all six x: x=0→5∉B rejected ✓; x=1..5 → 4,3,2,1,0 all ∈ B ✓. R = 5 pairs ✓. Domain {1,2,3,4,5} ✓ (0 correctly excluded), range {0,1,2,3,4} ✓, codomain = B ✓. CM "the range and codomain are **not** always equal — they agree here only because every member of B is used" is exactly the true general statement, not a card-local one ✓. |
| `sr_set_builder_form` | {−3,…,3} → {x : x ∈ ℤ, −3 ≤ x ≤ 3} ✓. Both CMs checked: dropping x∈ℤ admits 1/2 ✓; strict inequalities drop −3 and 3, leaving 5 members not 7 ✓. |
| `sr_symmetric_difference_abcde_acfgh` | A={a,b,c,d,e}, B={a,c,f,g,h}. A∩B={a,c} ✓, A−B={b,d,e} ✓, B−A={f,g,h} ✓, AΔB = 6 letters ✓. Independently verified the card's own check: n(A∪B) = 8, n(A∩B) = 2, 8−2 = 6 ✓ — and confirmed n(AΔB) = n(A∪B) − n(A∩B) is a genuine identity, not a coincidence of these sets. |

---

## Chapter 3 — Sequences and Series (`ts_ipe_m1a_ss_*`, 25 cards)

**Tally:** WRONG 0 · MISLEADING 0 · THIN 1 · CLEAN 24.

Every closed form in this chapter was tested at n = 1, 2, 3 and at least one larger n against the term-by-term sum. **No closed form failed at any n.** The recorded failure mode (a wrong constant that survives n = 1 and dies at n = 2) does not occur anywhere in this corpus.

### Findings

| Card | Line | What it says | What it should say | Numeric evidence |
|---|---|---|---|---|
| `ts_ipe_m1a_ss_am_gm_ratio_m_n` | step `s1_componendo`, rendered lines 3–5 | Applies componendo and dividendo to reach `(a + b + 2√(ab))/(a + b − 2√(ab)) = (m + n)/(m − n)`, then takes a square root of both sides — with **no** statement of `a ≠ b` (equivalently `m ≠ n`) and **no** WLOG `a > b`. | Add "Since a ≠ b" (or "m ≠ n") before the division, and "take a > b" before the square root — one clause each, matching what the two AP cards in this same chapter already do. | The denominator `a + b − 2√(ab)` equals `(√a − √b)²`, which is **exactly zero when a = b** — the step divides by zero in the degenerate case. Separately, `√((√a−√b)²) = |√a − √b|`, so the unsigned line `(√a + √b)/(√a − √b) = √(m+n)/√(m−n)` silently assumes `a > b`; with `a < b` the left side is negative and the working yields `b : a`. Zero occurrences of `≠` in the whole file (grep count: 0). |

Severity note: this is banded **THIN**, not WRONG — every line of algebra is correct, and I verified the result end to end (see the CLEAN-list entry logic below: with `a : b = (3+2√2) : (3−2√2)`-style substitution the identity holds). It is the omission of a condition, not an error.

**Why this is a real finding and not examiner pedantry — the corpus contradicts itself:** the two structurally identical AP cards in this same chapter both write the condition into a **rendered, student-visible line**:

- `ts_ipe_m1a_ss_ap_mth_1_over_n_nth_1_over_m` — "**Since m ≠ n**, divide by (m − n): d = 1/(mn)"
- `ts_ipe_m1a_ss_ap_mth_n_nth_m_shows_zero` — "**Since m ≠ n**, divide by (m − n): d = −1", and it goes further, listing "*Cancelling (m − n) without stating m ≠ n*" as a `common_mistakes` bullet.

So this bank's own house standard is *name the non-degeneracy condition before you divide by it*. The AM/GM ratio card divides by a quantity that can be zero and does not. A student who has been taught by the AP card that omitting `m ≠ n` is a marked mistake will read the AM/GM card as licence to omit it.

### Check 7 — the `|r| < 1` condition (all four infinite-GP cards): PASSES

Machine-verified that the condition sits in a **rendered `lines` entry** — the text the student actually reads — and not merely in `verification.note` or a `why`:

| Card | The rendered line carrying the condition |
|---|---|
| `ss_infinite_gp_one_third_minus_two_ninths` | `s1_ratio_and_condition`: "\|r\| = 2/3 < 1, so the infinite sum exists and S∞ = a/(1 − r)" |
| `ss_infinite_gp_one_third_ratio` | `s1_condition`: "\|r\| = 1/3 < 1, so the sum to infinity exists" |
| `ss_infinite_gp_sum_one_third_first_one_fourth` | `s2_write_gp`: "\|r\| = 1/4 < 1, so an infinite sum does exist for this ratio" |
| `ss_infinite_sum_n_over_2_power` | `s2_finish`: "This is a G.P. with a = 1 and r = 1/2, and \|r\| < 1, so" |

### CLEAN list — Sequences and Series (24 cards, with the checks actually run)

| Card | Checks run |
|---|---|
| `ss_am_10_gm_8_find_numbers` | a+b = 20 ✓, ab = 64 ✓. x²−20x+64 = 0 → (x−4)(x−16) ✓. Back-substituted: (4+16)/2 = 10 ✓, √(4·16) = 8 ✓. CM "(x−8)(x−8) fits the product but not the sum" verified: 8·8 = 64 ✓ but 8+8 = 16 ≠ 20 ✓. |
| `ss_am_34_gm_16_find_numbers` | a+b = 68 ✓, ab = 256 ✓. Discriminant re-computed independently: 68² = 4624, 4×256 = 1024, 4624−1024 = **3600**, √3600 = 60 ✓. x = (68±60)/2 = 64, 4 ✓. Back-substituted: 64+4 = 68 ✓, √256 = 16 ✓. |
| `ss_am_x_two_gm_y_z_identity` | a+b = 2x ✓; a,y,z,b in G.P. gives y² = az and z² = yb ✓. y³ = y·y² = ayz ✓, z³ = z·z² = byz ✓, sum = yz(a+b) = 2xyz ✓. CM "y² = ab is the rule for a **single** geometric mean" — correct ✓. |
| `ss_ap_10th_term_3_5_7_9` | a = 3, d = 2 ✓. **Term-by-term:** 3,5,7,9,11,13,15,17,19,**21** — 10th = 21, matching a+9d ✓. CM "aₙ = a + nd gives the 11th term": 3+10(2) = 23, and the 11th term really is 23 ✓. |
| `ss_ap_35th_term_69_sum_69` | S₆₉ = (69/2)[2a+68d] = 69(a+34d) = 69·69 ✓. 69² = **4761** re-computed ✓. Checked the tip's general claim "with 69 terms the 35th is the middle one": (69+1)/2 = 35 ✓, and for an odd-length A.P. the sum really is n × middle term ✓. Checked the `why`'s claim that a and d cannot be found: one equation, two unknowns ✓. |
| `ss_ap_cd_3_15th_term_37_second_term` | a + 14(3) = 37 → a = **−5** ✓ (14 gaps, not 15). a₂ = −5+3 = −2 ✓. Verified the card's own check: −2 + 13(3) = 37 = the given 15th term ✓. Both CM numbers checked: 15d route gives 37−45 = −8 ✓; subtracting d gives −5−3 = −8 ✓. |
| `ss_ap_mth_1_over_n_nth_1_over_m` | Subtraction: (m−n)d = 1/n − 1/m = (m−n)/(mn) ✓ → d = 1/(mn) ✓. a = m/(mn) − (m−1)/(mn) = 1/(mn) ✓. (mn)th term = 1/(mn) + (mn−1)/(mn) = 1 ✓. **Numeric instance m=2, n=3:** a₂ = 1/3, a₃ = 1/2 → d = 1/6 = 1/(mn) ✓, a = 1/3 − 1/6 = 1/6 ✓, a₆ = 1/6 + 5/6 = **1** ✓. Condition `m ≠ n` stated in a rendered line ✓. |
| `ss_ap_mth_n_nth_m_shows_zero` | (m−n)d = n−m → d = −1 ✓. a = n + m − 1 ✓. a₍m+n₎ = (m+n−1) + (m+n−1)(−1) = **0** ✓. **Numeric instance m=2, n=5:** a₂ = 5, a₅ = 2 → d = −1 ✓, a = 6 = m+n−1 ✓, a₇ = 6 − 6 = 0 ✓. Condition `m ≠ n` stated in a rendered line, and its omission listed as a common mistake ✓. |
| `ss_gp_5th_term_4_8_16` | a = 4, r = 2 ✓. **Term-by-term:** 4,8,16,32,**64** ✓ = ar⁴. CM "arⁿ returns the 6th term": 4·2⁵ = 128, and the 6th term is 128 ✓. |
| `ss_gp_third_term_4_product_first_five` | Symmetric naming a/r², a/r, a, ar, ar² with a = 4 ✓. Powers of r: −2,−1,0,1,2 sum to 0 ✓. Product = 4⁵ = **1024** ✓. **Independent numeric test with r = 2:** terms 1,2,4,8,16, product = 1·2·4·8·16 = 1024 ✓ — confirming the answer really is r-independent as the card claims. Verified the `why`'s alternative-naming claim: a,ar,ar²,ar³,ar⁴ gives a⁵r¹⁰ ✓ (exponents 0+1+2+3+4 = 10). |
| `ss_gp_three_numbers_sum_43_product_216` | a/r, a, ar → product a³ = 216 → a = 6 ✓. Sum → 6/r + 6r = 37 → 6r² − 37r + 6 = 0 ✓. Factorisation re-derived: 6r²−36r−r+6 = 6r(r−6) − 1(r−6) = (r−6)(6r−1) ✓ → r = 6, 1/6 ✓. **Both conditions back-checked:** 1+6+36 = 43 ✓, 1·6·36 = 216 ✓. Roots are reciprocals (product = 6/6 = 1) ✓, so the reversal claim is true. |
| `ss_gp_which_term_is_320` | a = 5, r = −2 ✓ (verified on the second pair too: 20/(−10) = −2 ✓). 5(−2)ⁿ⁻¹ = 320 → (−2)ⁿ⁻¹ = 64 = (−2)⁶ → n = **7** ✓. **Term-by-term:** 5, −10, 20, −40, 80, −160, **320** — the 7th ✓, and positive as the sign argument requires. CM "n = 6 from solving rⁿ = 64" checked: (−2)⁶ = 64 ✓, so that is indeed the slip described. |
| `ss_infinite_gp_one_third_minus_two_ninths` | r = (−2/9)÷(1/3) = **−2/3** ✓; verified on the next pair: (4/27)÷(−2/9) = −2/3 ✓. \|r\| = 2/3 < 1 ✓ (rendered line). S∞ = (1/3)/(5/3) = **1/5** ✓. CM "1 − 2/3 = 1/3 gives 1 as the sum" checked: (1/3)/(1/3) = 1 ✓. |
| `ss_infinite_gp_one_third_ratio` | a = 1, r = 1/3 ✓ (verified on the next pair: (1/9)/(1/3) = 1/3 ✓). \|r\| < 1 ✓ (rendered line). S∞ = 1/(2/3) = **3/2** ✓. Partial sums 1, 1.333, 1.444, 1.481 → climbing to 1.5 ✓. |
| `ss_infinite_gp_sum_one_third_first_one_fourth` | 1/3 = (1/4)/(1−r) → 1−r = 3/4 → r = **1/4** ✓. Back-checked: (1/4)/(3/4) = 1/3 = the given sum ✓. Terms 1/4, 1/16, 1/64, 1/256 ✓ (each ×1/4). CM "1−r = (1/3)÷(1/4) = 4/3 gives r = −1/3" checked: 1 − 4/3 = −1/3 ✓. Verified the tip's rule "first term divided by the sum gives 1 − r": a/S∞ = 1−r ✓, and (1/4)/(1/3) = 3/4 ✓. |
| `ss_infinite_sum_n_over_2_power` | Shift-and-subtract re-derived: S − S/2 = 1 + 1/2 + 1/4 + … ✓, so S/2 = 2 and **S = 4**. Cross-checked against the closed form Σ k x^(k−1) = 1/(1−x)² at x = 1/2: 1/(1/4) = **4** ✓. **Verified the card's own partial-sum sanity line digit by digit:** 1 + 1 + 0.75 + 0.5 + 0.3125 = **3.5625** ✓ (terms 1, 2/2, 3/4, 4/8, 5/16) — the arithmetic is right and 3.5625 does approach 4 ✓. CM "treating it as a G.P. with r = 1/2 gives 2" checked: 1/(1−1/2) = 2 ✓. |
| `ss_insert_five_am_between_8_and_26` | 5 means → **7** terms ✓, so 26 = a + 6d → 8 + 6d = 26 → d = 3 ✓. Means 11, 14, 17, 20, 23 ✓, and the card's closing check 23 + 3 = 26 ✓. CM "a + 5d = 26 leaves out one gap" — correct, that would give d = 3.6 ✓. |
| `ss_insert_three_gm_between_1_and_81` | 3 means → **5** terms ✓, ar⁴ = 81 → r⁴ = 81 → r = **±3** ✓. r = 3: 3, 9, 27, then 27·3 = 81 ✓. **r = −3 branch checked independently:** 1, −3, 9, −27, and −27·(−3) = **81** ✓ = (−3)⁴ ✓ — so the card is right that both sign choices give a genuine G.P. ending at 81. CM "3, 9, 27, 81 called four means" — 81 is an endpoint, not a mean ✓. |
| `ss_one_gm_two_am_identity` | g² = ab ✓; a, p, q, b in A.P. with p = a+d, q = a+2d, b = a+3d ✓. 2p − q = 2a+2d−a−2d = **a** ✓; 2q − p = 2a+4d−a−d = a+3d = **b** ✓; product = ab = g² ✓. **Numeric instance a=1, b=4:** d = 1, p = 2, q = 3, g² = 4. (2·2−3)(2·3−2) = 1×4 = **4** = g² ✓. |
| `ss_sum_0_7_0_77_0_777_n_terms` | Derivation re-done: ×(7/9) gives 0.9, 0.99, … = 1 − 10⁻ᵏ ✓; the inner G.P. sums to (1/9)(1 − 10⁻ⁿ) ✓; both boxed forms are algebraically the same ✓. **Closed form tested against term-by-term at four values of n:** n=1 → (7/81)(8.1) = **0.7** vs 0.7 ✓; n=2 → (7/81)(17.01) = **1.47** vs 0.7+0.77 = 1.47 ✓; n=3 → (7/81)(26.001) = **2.247** vs 2.247 ✓; n=5 → (7/81)(44.00001) = **3.80247** vs 0.7+0.77+0.777+0.7777+0.77777 = 3.80247 ✓. |
| `ss_sum_1_2_2_3_3_4_n_terms` | tₙ = n(n+1) ✓. Both standard sums verified independently before use: Σn = n(n+1)/2 ✓, Σn² = n(n+1)(2n+1)/6 ✓. Factorisation re-derived: n(n+1)[(2n+1)+3]/6 = n(n+1)(2n+4)/6 = n(n+1)(n+2)/3 ✓. **Closed form tested against term-by-term:** n=1 → 2 vs 1·2 = 2 ✓; n=2 → 8 vs 2+6 = 8 ✓; n=3 → 20 vs 2+6+12 = 20 ✓; n=4 → 40 vs 20+20 = 40 ✓. CM "treating 2, 6, 12, 20 as an A.P." — those are the correct first four terms ✓. |
| `ss_sum_2_3_5_6_8_9_2n_terms` | Split verified against the actual sequence 2,3,5,6,8,9,11,12,…: odd positions 2,5,8,11 (a=2, d=3) ✓, even positions 3,6,9,12 (a=3, d=3) ✓, n terms each ✓. Sums (n/2)(3n+1) and (n/2)(3n+3) re-derived ✓; total = (n/2)(6n+4) = **n(3n+2)** ✓. **Closed form tested against term-by-term:** n=1 (2 terms) → 5 vs 2+3 = 5 ✓; n=2 (4 terms) → 16 vs 2+3+5+6 = 16 ✓; n=3 (6 terms) → 33 vs 33 ✓; n=4 (8 terms) → 56 vs 56 ✓. The card's own margin check (n=2 → 3(4)+2(2) = 16) is arithmetically right ✓. |
| `ss_sum_6_times_gm_ratio` | a+b = 6√(ab) → (a+b)/(2√(ab)) = 3/1 ✓. C&D → (√a+√b)²/(√a−√b)² = 4/2 = 2 ✓. Second C&D → √a/√b = (√2+1)/(√2−1) ✓. Squared: (√2+1)² = 3+2√2 ✓, (√2−1)² = 3−2√2 ✓. **Back-substitution check:** with a : b = (3+2√2) : (3−2√2), ab ∝ (3+2√2)(3−2√2) = 9−8 = **1** and a+b = **6**, so a+b = 6√(ab) holds exactly ✓. Note the degeneracy that sinks the sibling card is *forced away* here: a = b would give 2a = 6a, impossible for a > 0 — so this card needs no extra condition. Rule statement "p/q = r/s ⇒ (p+q)/(p−q) = (r+s)/(r−s)" is correct ✓. |
| `ss_sum_8_88_888_n_terms` | ×(8/9) gives 9, 99, 999 = 10ᵏ − 1 ✓. G.P. of powers of 10 (a = 10, r = 10) sums to 10(10ⁿ−1)/9 ✓; 10(10ⁿ−1) − 9n = 10ⁿ⁺¹ − 9n − 10 ✓, so both boxed forms agree ✓. **Closed form tested against term-by-term:** n=1 → (8/81)(81) = **8** ✓; n=2 → (8/81)(972) = **96** vs 8+88 = 96 ✓; n=3 → (8/81)(9963) = **984** vs 984 ✓; n=4 → (8/81)(99954) = **9872** vs 984+8888 = 9872 ✓. CM "r = 11 already fails at the third term" verified: 88/8 = 11 but 888/88 = 10.09… ✓. |

---

## Overall tally

| Chapter | Cards | WRONG | MISLEADING | THIN | CLEAN |
|---|---|---|---|---|---|
| Sets and Relations (`sr`, unit 1) | 26 | 0 | 1 | 0 | 25 |
| Sequences and Series (`ss`, unit 3) | 25 | 0 | 0 | 1 | 24 |
| **Total** | **51** | **0** | **1** | **1** | **49** |

**Nothing in this corpus is mathematically wrong, and nothing fabricates exam history.** Both findings are one-line prose/condition defects sitting beside correct mathematics — the shape the companion pass predicted. Both have an in-corpus sibling that already does it right, so both fixes are copy-paste.

### The two findings, ranked

1. `ts_ipe_m1a_sr_subsets_and_power_set_of_1_2_3` — MISLEADING. A `common_mistakes` bullet says dropping ∅ **or** A gives "only 6 subsets"; either single omission gives **7**. Fix: change 6 → 7, or split into two bullets as `sr_power_set_minus3_0_3` already does.
2. `ts_ipe_m1a_ss_am_gm_ratio_m_n` — THIN. Divides by `(√a − √b)²` (zero when a = b) and takes an unsigned square root, without stating `a ≠ b` / `m ≠ n` or WLOG `a > b`. Fix: one clause, matching the two AP cards in the same chapter that already write "Since m ≠ n".

---

## Where I initially disagreed with a card and it turned out right

Six of these. Recording them because each is a place a faster pass would have filed a false positive.

1. **`sr_define_equivalence_relation`, memory_tip: "Relations of the form same remainder or same value are **always** equivalence relations."** I flagged this immediately as the item-11 shape — a card-local truth dressed as a theorem. It is not: any relation of the form `f(a) = f(b)` (the kernel of a function) is provably reflexive, symmetric and transitive, and both "same remainder" and "same value" are of that form. "Always" is literally correct. **What changed my mind:** writing out the general proof rather than testing the card's own example.

2. **`sr_parallel_lines_equivalence`, s2 `why`: "…would force l ∥ l, which that convention denies."** On first read I took "that convention" to point back to the self-parallel convention named two lines earlier, which would make the sentence contradict itself. It points to the *rejected* distinct-lines convention, and the argument is then correct and non-obvious: under distinct-lines, transitivity applied to `l ∥ m` and `m ∥ l` yields `l ∥ l`, which that convention forbids — so **transitivity** breaks too, not just reflexivity. **What changed my mind:** working the failure through under the rejected convention instead of parsing the pronoun. The sentence is referentially tangled but mathematically right, and it is making a point most textbook answers skip.

3. **`ss_sum_2_3_5_6_8_9_2n_terms`.** The question asks for `2n` terms and the answer is `n(3n+2)` — I suspected a term-count error of exactly the kind the brief warns about. Wrong: the split gives `n` terms to each A.P., `2n` in total, and the formula is right. **What changed my mind:** term-by-term at n = 1,2,3,4 → 5, 16, 33, 56, matching the formula exactly. The card's own margin note is explicit ("n = 2, which is 4 terms").

4. **`ss_sum_0_7_0_77_0_777_n_terms`, the `+(1/10)ⁿ` in `(7/81)[9n − 1 + (1/10)ⁿ]`.** That sign is the standard casualty in this derivation and I expected to find it flipped. It is correct. **What changed my mind:** four numeric tests (n = 1, 2, 3, 5) that agreed with the term-by-term sum to the last digit (3.80247 at n = 5).

5. **`sr_power_set_minus3_0_3`, CM: "Saying there are **6** subsets after counting only the non-empty ones with fewer than three members."** Having just found a wrong "6" on the sibling power-set card, I flagged this one on sight. It is correct: 3 singletons + 3 pairs = 6. **What changed my mind:** enumerating the *described* mistake rather than pattern-matching the number. The same figure is wrong on one card and right on the other — nothing but enumeration separates them, which is a useful warning about grep-driven auditing.

6. **`sr_relation_2x_plus_y_41_properties`, memory_tip: "To reject a property you need one pair."** Rejecting transitivity needs a *chain* — two pairs present and one absent — as the card itself demonstrates with (12,17), (17,7), (12,7). I drafted this as a MISLEADING finding, then withdrew it: the same step's `why` says "For transitivity that means finding a chain (x, y) and (y, z) both inside R first, which is why 17 is used twice", and the worked lines show the chain in full. The loose phrase is corrected inside the reader's line of sight, on the same step. **Not banded** — but "one counterexample" would be a strictly better word than "one pair", if the card is ever touched for another reason.

---

## Coverage statement

**Dedicated pass on all 51 cards. No card was sampled, skimmed, or inferred from a sibling. Nothing is counted CLEAN that I did not personally check.**

What "dedicated" means here, concretely. For each of the 51 I extracted and read the complete rendered content — `question_text`, `mark_split`, and for every step the full `lines` array, `margin_note`, `why`, every `common_mistakes` bullet, `memory_tip`, and the `recall` block's `must_convey` and `accept` phrases — and then:

- **re-derived every numeric result from the `question_text`**, never from the card's working and never from `verification.note`;
- **enumerated every set operation element by element** (Sets and Relations: all complements, unions, intersections, differences, Cartesian products and power sets were listed out, and the two Cartesian-product identity cards were checked by enumerating both products independently rather than trusting the identity);
- **tested every closed form at n = 1, 2, 3 and at least one larger n** against the term-by-term sum (Sequences and Series: 4 closed-form cards, 16 numeric tests, 0 failures);
- **verified every relation verdict by its own standard** — an equivalence verdict by establishing all three properties, a "not transitive" claim by confirming both premise pairs genuinely lie in R and the conclusion pair genuinely does not (`sr_relation_2x_plus_y_41_properties` was the card most exposed here; its chain (12,17), (17,7) is real);
- **read every `common_mistakes` bullet back against its own step's marked lines**, and checked the arithmetic of every number quoted inside a bullet (this is what surfaced the one MISLEADING finding — the defect was in a bullet, not in an answer);
- **checked every general claim in `why` / `memory_tip` prose as a theorem**, not against the card's own numbers (this is what cleared items 1, 2 and 5 in the section above).

Machine sweeps run across all 51 as a backstop, not as a substitute:

- `appearances[]` length and a whole-file scan for `insider_note` → **0 and 0 on all 51** (check 9);
- a regex sweep for absolute quantifiers (`always` / `never` / `only` / `every` / `unique` / `cannot` / `must be` / `impossible`) in every `why`, `memory_tip`, `margin_note` and `common_mistakes` string — **every hit read individually** (that is 100+ sentences; all resolved true, with the one withdrawal recorded above);
- marks arithmetic: `steps[].marks` sum and `mark_split[].marks` sum against `marks_total` → **all 51 internally consistent**;
- a condition-parking scan comparing `verification.note` against the rendered answer body → **no condition appears only in the note** (check 12); the single flag was `sr_parallel_lines_equivalence`, whose note merely *describes* that the convention is on the page, which I confirmed it is;
- placement of `|r| < 1` on all four infinite-GP cards → present in a **rendered `lines` entry** on each (check 7), table in the chapter section above.

### What this pass did NOT cover — do not read these as checked

- **Rendering.** I read JSON, not the built player. Line wrap, overflow, figure geometry, and how any of this lays out on screen are unexamined. (This matters: the project's own record has 20.7% line wrap and 9 bad figures passing every gate.)
- **Gate runs.** I ran no `check:cards`, `validate:*`, `backtest:*` or build. This was a mathematics and content pass; a green gate is neither claimed nor implied.
- **Provenance.** I did not verify any `verification.note` sourcing claim (which book, which page, which question number). Per the brief, notes were treated as non-evidence throughout — that cuts both ways, and their accuracy is untested here.
- **Telugu-transliterated `accept` phrases.** Read for mathematical content and confirmed to assert the same fact as their English siblings; I am not a Telugu reviewer and did not judge their idiom or spelling.
- **Mark-split realism.** I verified the marks arithmetic is internally consistent on all 51, but made no judgement on whether a 1+1 split is what a Telangana IPE examiner would actually award. Every card in this corpus already carries `needs_teacher_verification: true` and says the split is the bank's own — that gap stands, unaffected by this pass.
- **Originality.** Not in scope; no comparison against source books was made.
