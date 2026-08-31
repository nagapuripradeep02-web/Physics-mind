# Independent examiner pass — Properties of Triangles (15 cards, commit `c0942ca1`)

**Examiner:** independent re-derivation from `question_text` only.
**Rule followed:** no card's `verification.note` was accepted as evidence. Every formula a card
quotes was verified *on its own* before the identity it was used in; every intermediate line was
checked, not only the boxed result.

**Corpus:** exactly the 15 files marked `A` (added) in `git show --name-status HEAD`. 38
`ts_ipe_m1a_pt_*.json` exist on disk; the other 23 were pre-existing and were not examined.

---

## 1. Test triangles

Chosen adversarially. The brief's warning is real: **(3,4,5) is itself in A.P.** (3+5 = 2·4), so it
is useless as a sole witness for anything that collapses on A.P. sides. Four of the five carriers
below are non-A.P.

| Label | Sides | A.P.? | s | Δ | Why chosen |
|---|---|---|---|---|---|
| T1 | (3, 4, 5) | **yes** | 6 | 6 | right-angled at C; the required right-angle witness |
| T2 | (5, 6, 10) | no | 10.5 | 11.399013115178 | scalene, strongly obtuse (C = 130.54°) |
| T3 | (3, 7, 8) | no | 9 | 10.392304845413 | scalene, mildly obtuse (C = 98.21°) |
| T4 | (9, 4, 7) | no | 10 | 13.416407864999 | largest side first — catches subscript swaps |
| T5 | (10, 6, 4.05) | no | 10.025 | 2.455071202506 | near-degenerate (Δ ≈ 2.46 on a perimeter of 20) |

Card-specific hypothesis carriers were added where a card is conditional (listed per card in §4/§5).

## 2. Formula bank — verified independently, before any identity

Each of the 13 formulas below was computed **two or three ways** — from the angles (angles
themselves obtained only from the cosine rule), from the surd half-angle form, and from the Δ form
— on all five triangles. **All agree to 1e-12 on all five.** This is the swapped-subscript gate the
brief asks for.

`tan(A/2)=√((s−b)(s−c)/(s(s−a)))=(s−b)(s−c)/Δ` · `tan(B/2)` · `tan(C/2)` ·
`cot(A/2)=√(s(s−a)/((s−b)(s−c)))=s(s−a)/Δ` · `cot(B/2)` · `cot(C/2)` ·
`cos²(C/2)=s(s−c)/(ab)` · `sin²(C/2)=(s−a)(s−b)/(ab)` ·
`r=Δ/s=4R sin(A/2)sin(B/2)sin(C/2)` · `r₁=Δ/(s−a)=4R sin(A/2)cos(B/2)cos(C/2)=s·tan(A/2)` ·
`r₂=Δ/(s−b)=4R cos(A/2)sin(B/2)cos(C/2)` · `r₃=Δ/(s−c)=4R cos(A/2)cos(B/2)sin(C/2)` ·
`R=abc/(4Δ)=a/(2 sin A)=b/(2 sin B)=c/(2 sin C)`

**No card quotes a swapped-subscript formula. Zero defects in this class.**

---

## 3. Tally

| Band | Count | Cards |
|---|---|---|
| **WRONG** | **0** | — |
| **MISLEADING** | **2** | `r_r1_r2_minus_r3`, `r1_plus_r2_eq_r3_minus_r` |
| **THIN** | **0** | — |
| **CLEAN** | **13** | see §5 |

Both MISLEADING findings are in `common_mistakes` bullets — the exact class the brief flags at
item 7. **No card's mathematics is wrong on any line.** Both are one-line rewordings; neither
touches a marked derivation line.

---

## 4. Findings

### F1 — `ts_ipe_m1a_pt_r_r1_r2_minus_r3` · MISLEADING · the higher-severity one

| | |
|---|---|
| **Step** | `s1_group_into_two_pairs` (2 marks), `common_mistakes[0]` |
| **Exact text** | *"Grouping (r + r₁) and (r₂ − r₃), which leaves no common half-angle."* |
| **What is false** | Both halves of that grouping **do** have a common half-angle, **and the grouping completes the proof correctly** — arguably more neatly than the card's own route. |

Re-derived from the card's own four `4R` forms:

```
r + r₁  = 4R sin(A/2)[ sin(B/2)sin(C/2) + cos(B/2)cos(C/2) ] = 4R sin(A/2) cos((B−C)/2)
r₂ − r₃ = 4R cos(A/2)[ sin(B/2)cos(C/2) − cos(B/2)sin(C/2) ] = 4R cos(A/2) sin((B−C)/2)
sum     = 4R sin( A/2 + (B−C)/2 ) = 4R sin((A+B−C)/2) = 4R sin(90° − C) = 4R cos C   ✓
```

Numeric evidence — all three lines verified to 1e-12 on all five triangles. T2 (5,6,10) shown:

| quantity | computed from radii | computed from the half-angle form |
|---|---|---|
| r + r₁ | 3.158168135807 | 3.158168135807 |
| r₂ − r₃ | −20.264912204761 | −20.264912204761 |
| (r+r₁)+(r₂−r₃) | −17.106744068954 | 4R cos C = −17.106744068954 |

So the bullet tells a student that a **valid, complete, common-factor-bearing** grouping is an
error. A student who found it — the natural grouping, since it pairs the two terms that share the
vertex A — is told they went wrong.

**Should say:** something true about *why the card's grouping is preferred*, e.g. *"Grouping
(r + r₁) and (r₂ − r₃) also works, but it reaches cos C only through a compound angle in
(A+B−C)/2 — grouping around C gives cos C directly."*
The sibling bullet on the same step (*"Swapping r₂ and r₃ — r₂ keeps sin(B/2), r₃ keeps sin(C/2)"*)
is correct and needs no change.

### F2 — `ts_ipe_m1a_pt_r1_plus_r2_eq_r3_minus_r` · MISLEADING · the lower-severity one

| | |
|---|---|
| **Step** | `s4_finish_with_the_half_angle` (1 mark), `common_mistakes[0]` |
| **Exact text** | *"Using sin²(C/2) = (s−a)(s−b)/(ab) here by mistake."* |
| **What is false** | The formula quoted is **correct**, and using it *here* is a **correct and complete** alternative finish, not a mistake. |

The card's own step 3 ends at `(s−a)(s−b) = s(s−c)` and `ab = 2s(s−c)`. Therefore
`(s−a)(s−b)/(ab) = s(s−c)/(2s(s−c)) = ½`, so `sin²(C/2) = ½` and
`cos C = 1 − 2 sin²(C/2) = 0` — same conclusion, same length.

Numeric evidence on the two hypothesis-satisfying triangles:

| Triangle | (s−a)(s−b)/(ab) = sin²(C/2) | 1 − 2·sin²(C/2) = cos C |
|---|---|---|
| (3,4,5) | 0.500000000 | 0.000000000000 |
| (5,12,13) | 0.500000000 | 0.000000000000 |

**Should say:** name the actual error, which is *mis-assigning the derived ratio*, e.g.
*"Writing sin²(C/2) = s(s−c)/(ab) — that ratio is cos²(C/2); sin²(C/2) uses (s−a)(s−b)/(ab)."*
The `memory_tip` directly above already states both formulas correctly, so the intent is clearly
"don't mix the two up" — but as written the bullet condemns a correct move. The sibling bullet
(*"Reading cos²(C/2) = ½ as C = 45°"*) is correct and important.

---

## 5. CLEAN list — with the checks actually run

Every card below had a dedicated pass: identity verified on ≥ 3 valid triangles to ≥ 9 decimals
with **both sides computed independently from the side lengths**, every quoted formula verified
separately, and every intermediate line checked as its own equation.

**1. `projection_formula` — a = b cos C + c cos B**
Formulas verified alone: `cos C = (a²+b²−c²)/(2ab)`, `cos B = (c²+a²−b²)/(2ca)` — denominators
correctly pair the two sides meeting at the angle. Intermediate lines each checked as equations:
`b cos C = (a²+b²−c²)/(2a)`, `c cos B = (c²+a²−b²)/(2a)`, numerator sum `= 2a²`. On T2 (5,6,10):
b cos C = −3.900000000000 (both sides), c cos B = 8.900000000000, final a = 5.000000000000.
All five triangles agree to 1e-12. Bullets correct (the `2bc` denominator error is real).

**2. `b_plus_c_3a_cot_half` — b + c = 3a ⇒ cot(B/2)cot(C/2) = 2**
Hypothesis is **not vacuous and not universal**. Four independent b+c=3a triangles found, three
of them **not** in A.P.: (4,5,7) [not A.P.], (5,7,8) [not A.P.], (4,6,6) [not A.P.], (2,3,3);
each gives cot(B/2)cot(C/2) = 2.000000000000 and s/(s−a) = 2.000000000000. The general lemma
`cot(B/2)cot(C/2) = s/(s−a)` was verified separately on all five carriers (T2: 1.909090909091
both sides) so the constant 2 is not an artefact of the constraint. `s > a` justification is on
the page. Bullets correct.

**3. `b_minus_c_sq_cos_half` — (b−c)²cos²(A/2) + (b+c)²sin²(A/2) = a²**
Grouping line checked as its own identity against `(b²+c²) − 2bc[cos²(A/2) − sin²(A/2)]`;
`cos²(A/2) − sin²(A/2) = cos A` checked alone (T2: 0.925000000000 both sides); final = a²
(T2: 25.000000000000 both sides). All five triangles to 1e-12. Bullets correct.

**4. `cot_half_ap_sides_ap` — cot halves in A.P. ⇒ sides in A.P.**
`cot(A/2) = s(s−a)/Δ` verified alone (T2: 5.066228051190 three ways). **Hypothesis checked both
ways:** it HOLDS on (3,4,5), (2,3,4), (5,6,7) — all of which do have 2b = a+c — and FAILS on the
non-A.P. T2 (8.290191 vs 5.526794), T3 (3.464102 vs 6.062178), T4 (8.944272 vs 2.981424).
Not vacuous, not universal, and the card proves the direction the stem asks. The bullet
*"cot(A/2) = (s−b)(s−c)/Δ, which is tan(A/2)"* is correct — that IS tan(A/2), verified.

**5. `tan_half_bc_diff` — tan((B−C)/2) = ((b−c)/(b+c)) cot(A/2)**
Five separate lines each verified as its own equation on all five triangles: the sine-rule ratio,
`sinB − sinC = 2cos((B+C)/2)sin((B−C)/2)`, `sinB + sinC = 2sin((B+C)/2)cos((B−C)/2)`,
`(b−c)/(b+c) = cot((B+C)/2)tan((B−C)/2)`, `cot((B+C)/2) = tan(A/2)`. T2 values:
−0.250000000000, −0.303973683071, 1.215894732286, −0.250000000000, 0.197385508488; final
tan((B−C)/2) = −1.266557012798 both sides. The negative T2/T4 values exercise the sign, which a
symmetric test set would have hidden. Bullets correct.

**6. `tan_half_sum` — Σ tan(half) = (bc + ca + ab − s²)/Δ**
`tan(A/2) = (s−b)(s−c)/Δ` verified alone. The zero-mark middle step was checked as a standalone
algebraic identity — `N = 3s² − 2s(a+b+c) + (ab+bc+ca)` — and then `N = ab+bc+ca−s²`; on T2 both
give 29.750000000000. Final: 2.609875056674 both sides on T2, agreeing to 1e-12 on all five.
Bullet *"tan(A/2) = s(s−a)/Δ, which is cot(A/2)"* correct.

**7. `incircle_excircle_areas` — 1/√A₁ + 1/√A₂ + 1/√A₃ = 1/√A**
**Brief item 6 satisfied:** the A-as-area collision is disambiguated **on the page**, not only in
the note — `lines[1]` of step 1 reads *"Here A, A₁, A₂, A₃ are AREAS, not angles."* and step 1 then
names r and r₁…r₃ explicitly. Lemma `1/r₁+1/r₂+1/r₃ = s/Δ = 1/r` verified alone (T2: 0.921132372944
both sides). Final built from actual πr² areas: 0.519693289883 both sides on T2, 1e-12 on all five.
Positivity of the radii is stated on the page. Bullets correct.

**8. `cos_sum_1_plus_r_over_r` — cos A + cos B + cos C = 1 + r/R**
Each of four marked lines verified as its own identity on all five triangles:
`cosA+cosB = 2 sin(C/2)cos((A−B)/2)` (T2: 1.815000000000), `cosC = 1−2sin²(C/2)` (−0.650000000000),
`cos((A−B)/2) − cos((A+B)/2) = 2 sin(A/2)sin(B/2)` (0.090829510623),
`sum = 1 + 4 sin(A/2)sin(B/2)sin(C/2)` (1.165000000000). The quoted in-radius formula
`r = 4R sin(A/2)sin(B/2)sin(C/2)` verified against r = Δ/s independently (T2: 1.085620296684).
Final 1.165000000000 both sides. Bullets correct — including that `4R cos(A/2)cos(B/2)cos(C/2)`
is not r.

**9. `r1_r2_r3_over_sqrt` — r₁(r₂+r₃)/√(r₁r₂+r₂r₃+r₃r₁) = a**
Both intermediates verified independently, not just the boxed result: `r₁(r₂+r₃) = as`
(T2: 52.500000000000 both sides) and `r₁r₂+r₂r₃+r₃r₁ = s²` (110.250000000000 both sides), plus
`(s−a)(s−b)(s−c) = Δ²/s` (12.375000000000). Final = a exactly on all five (T2: 5.000000000000,
T4: 9.000000000000). The step-3 bracket bookkeeping — r₁r₂ leaving (s−c) on top, r₂r₃ leaving
(s−a), r₃r₁ leaving (s−b) — is written correctly, which is the easiest place in this card to swap
a subscript. The `s > 0` justification for the root sign is on the page. Bullets correct.

**10. `cos_sum_3_2_equilateral` — Σcos = 3/2 ⇒ equilateral**
Quadratic re-derived from scratch: `4sin²(C/2) − 4cos((A−B)/2)sin(C/2) + 1 = 3 − 2(cosA+cosB+cosC)`
verified as an identity on all five triangles (T2: 0.670000000000 both sides), which confirms both
the multiply-by-2 and the rearrangement. Discriminant `16cos²((A−B)/2) − 16` is the correct
`b²−4ac`. **Hypothesis not vacuous and not universal:** holds on (1,1,1) and (2,2,2)
[1.500000000000]; fails on (3,4,5) 1.400000000000, (4,5,6) 1.437500000000, T2 1.165000000000,
T3 1.285714285714, T4 1.285714285714. The `(A−B)/2 ∈ (−90°, 90°)` justification for taking
cos = +1 (not −1) is on the page, and the −1 branch is explicitly closed in a bullet.

**11. `sum_squares_8r2_right_angled` — a²+b²+c² = 8R² ⇒ right angled**
Every line verified separately on all five triangles: `sin²A+sin²B = 1 − cos(A+B)cos(A−B)`
(T2: 0.352275000000), `= 1 + cosC cos(A−B)` (same), `Σsin² = 2 + 2cosAcosBcosC` (0.929775000000),
`cos(A−B) − cosC = 2cosAcosB` (1.646500000000), `a²+b²+c² = 4R²Σsin²` (161.000000000000).
**Hypothesis not vacuous and not universal:** HOLDS on (3,4,5) 50 = 50, (5,12,13) 338 = 338,
(7,24,25) 1250 = 1250 — all with a 90° angle; FAILS on acute (4,5,6) 77 vs 73.1429 and (7,8,9)
194 vs 176.4000, and on obtuse T2 161 vs 346.3203, T3 122 vs 130.6667, T4 146 vs 176.4000. The
failure has opposite sign for acute vs obtuse, so the condition really does pin 90°. The
**symmetry** claim was checked too: (5,4,3) and (5,3,4) both satisfy 50 = 8R² with the right angle
at A, confirming the card's bullet that concluding "C = 90° only" is wrong. Bullet *"Cancelling
cos C out of the product; cos C may itself be zero"* is exactly right.

**12. `altitudes_reciprocal_squares` — 1/p₁²+1/p₂²+1/p₃² = (cotA+cotB+cotC)/Δ**
**Brief item 5 satisfied.** The card authored the **lengths** reading — `p₁ = 2Δ/a` from
`Δ = ½ a p₁`, verified (T2: p₁ = 4.559605246071) — and the stem the student reads says *"the
lengths of the altitudes"*. The book's printed *"centers of altitudes"* is recorded verbatim in
`verification.note` under an explicit `PRINTED DEFECT, AUTHORED AGAINST:` heading rather than being
silently repaired. Correct handling on both halves.
Each cotangent verified alone against 1/tan of the cosine-rule angle: cot A = (b²+c²−a²)/(4Δ)
(T2: 2.434421271351), cot B (1.951923361714), **cot C (−0.855337203448 — negative, because T2 is
obtuse; the identity survives a negative cotangent, which an all-acute test set would not have
shown)**. `Σcot = (a²+b²+c²)/(4Δ)` (3.531007429617) and LHS = (a²+b²+c²)/(4Δ²) (0.309764309764)
each checked separately; final agrees to 1e-12 on all five.

**13. `tan_half_5_6_2_5` — tan(A/2)=5/6, tan(C/2)=2/5 ⇒ a + c = 2b**
`tan(A/2)tan(C/2) = (s−b)/s` verified as a general lemma on all five carriers (T2: 0.428571428571
both sides) — so the "missing bracket" claim is not an artefact of the given numbers. Arithmetic
re-done: (5/6)(2/5) = 1/3 → 3(s−b) = s → 2s = 3b → a+c = 2b. The zero-mark check step was
re-derived independently and is **fully correct**: Σ pairwise tan-half products = 1 verified on all
five (exactly 1.000000000000); 5/6 + 2/5 = 37/30 = 1.233333333333; tan(B/2) = (2/3)/(37/30) = 20/37
= 0.540540540541. The claimed triangle **87 : 74 : 61 was reconstructed from scratch** via
(s−a):(s−b):(s−c) = 24:37:50, s = 111, then verified forwards: tan(A/2) = 0.833333333333 = 5/6,
tan(C/2) = 0.400000000000 = 2/5, tan(B/2) = 0.540540540541 = 20/37, (s−b)/s = 0.333333333333,
87 + 61 = 148 = 2 × 74. Bullet *"tan(A/2)+tan(B/2)+tan(C/2) = 1 is not a standard result"* is
correct — that sum is 1.833333, 1.789032, 1.732051, 2.012461 on the triangles tried, never 1.

---

## 6. Where I initially disagreed with a card and it turned out right

**(a) `r1_plus_r2_eq_r3_minus_r`, step 4, the line `cos C = 2cos²(C/2) − 1 = 1 − 1 = 0`.**
I read `= 1 − 1` as a dropped factor — it looks like the 2 never got applied. It is exactly right:
2 × ½ = 1, then 1 − 1 = 0. The card is compressing one substitution, not losing one. No finding.

**(b) `cos_sum_3_2_equilateral`, step 2 bullet, *"Treating cos((A−B)/2) as the unknown instead of
sin(C/2)."*** My first read was that this is the same defect class as F1 — a correct alternative
labelled an error — because solving for cos((A−B)/2) gives `cos((A−B)/2) = sin(C/2) + 1/(4 sin(C/2))`,
and AM–GM makes that ≥ 1 with equality at sin(C/2) = ½, which closes the proof. I verified that
numerically (on (1,1,1) both sides are exactly 1.000000000000; on (4,5,6) 0.992157 vs 1.039402;
on (9,4,7) 0.758175 vs 1.020621). **I changed my mind:** the equation is *linear* in
cos((A−B)/2), so choosing it as the unknown leaves no discriminant to take — the bullet is about
the choice of unknown *for the method the card is teaching*, and within that method it is a genuine
wrong turn. The AM–GM finish is a different method, not "treating cos as the unknown of a
quadratic". Defensible. No finding.

**(c) `altitudes_reciprocal_squares`, step 3 bullet, *"Using sin A = a/(2R) here, which brings in R
and does not cancel bc."*** I expected this to be false, since that route does reach the right
cot A. It does — confirmed numerically ((4,5,6): 1.133893419028 either way; (3,7,8):
2.501851166488). But it only gets there via the extra step abc = 4RΔ, and bc genuinely does not
cancel at that point. The bullet's claim is literally true. No finding.

**(d) `projection_formula`.** I first flagged proving a = b cos C + c cos B *from* the cosine rule
as circular, since the cosine rule is often derived from the projection formula. It is not circular
here: the cosine rule is an independently established prior result in this chapter, and this is the
standard IPE route. The bullet *"Starting from the left side, which has nothing to expand"* is a
strategy note, not a false claim. No finding.

**(e) `b_plus_c_3a_cot_half`.** I nearly rejected my own check on discovering that (3,4,5) — my
right-angle carrier — happens to satisfy b + c = 3a, i.e. the exact A.P. contamination the brief
warns about. I re-ran on (4,5,7), (5,7,8) and (4,6,6), none of which is in A.P., and all give 2
exactly. The card survives a clean test set.

---

## 7. Other checks run (all clean, no findings)

- **Conditions parked out of sight (brief item 8):** every positivity / range restriction a card
  relies on appears in a rendered `lines` entry, not only in `verification.note` — `s > a`
  (b_plus_c_3a), `s > 0 and Δ > 0` (cot_half_ap), `Δ > 0 and c > 0` (r1_plus_r2), `s > 0 so the
  root is +s` (r1_r2_r3), `(A−B)/2 between −90° and 90°` (cos_sum_3_2), `each angle between 0° and
  180°` (sum_squares_8R2), `s > b` (tan_half_5_6_2_5), `every radius is positive`
  (incircle_excircle). The six cards with no on-page condition text (projection, b_minus_c,
  tan_half_bc_diff, tan_half_sum, r_r1_r2_minus_r3, altitudes) are unconditional identities that
  need none. Nothing is hidden in a note.
- **Every `common_mistakes` bullet read back against its own step's marked lines** — 62 bullets
  across 15 cards. Two defects (F1, F2); the other 60 name real, recognisable errors.
- **Structure:** all 15 cards have step marks summing to `marks_total` and matching `mark_split`;
  `mark_split` labels match the marked steps' labels exactly on all 15; every card ends in a
  `boxed_final` step containing a `boxed` line; no step is missing `memory_tip`, `why`,
  `margin_note`, `recall` or `common_mistakes`.
- **Rule 41 (plain language):** no idiom, metaphor or personification found in any reader-facing
  string across the 15 cards.
- **Typography:** longest rendered line is 49 characters (`incircle_excircle_areas`); all 15 are
  well inside the wrap budget. The apparent ASCII-math hits ("delta", "pi r squared") are all
  inside `recall.accept` spoken-phrase lists, where spoken form is intended — none is on a
  rendered line.
- **Provenance:** the sibling card `ts_ipe_m1a_pt_saq_r_r3_r1_minus_r2` referenced by
  `r_r1_r2_minus_r3`'s note does exist.
- **The authors' own numeric claims** were independently reproduced where a note stated one
  (cos_sum → 1.437500 / 1.312500; r_r1_r2 → 1.511858 / −2.065591 / 0; altitudes → 0.347222222 =
  25/72 and 0.195555556; r1_plus_r2 → 6.803361 / 5.291503 and 3.098387 / 5.163978;
  sum_squares → 77 vs 73.1429 and 194 vs 176.4). All correct. Reported as an observation only —
  per the brief, none of it was treated as evidence.

---

## 8. Coverage statement

**All 15 cards received a dedicated pass. None was swept.**

Each card had: (i) every formula it quotes verified in isolation against two or three independent
computations on 5 triangles; (ii) every intermediate line checked as its own equation on those same
5 triangles to 1e-12; (iii) both sides of the boxed identity computed independently from the side
lengths — never one side derived from the other; (iv) every `common_mistakes` bullet read back
against its own step's marked lines.

The four conditional cards (`cot_half_ap_sides_ap`, `r1_plus_r2_eq_r3_minus_r`,
`cos_sum_3_2_equilateral`, `sum_squares_8r2_right_angled`) additionally had their hypothesis tested
for vacuity and universality with **at least three satisfying and at least four failing triangles
each**, and the proved direction was checked against the direction the stem asks. The one
constrained-family card (`b_plus_c_3a_cot_half`) was tested on four distinct b+c=3a triangles,
three of them not in A.P.

**Limits of this pass, stated honestly:** it is a numeric and logical re-derivation. It does not
verify the source attributions (book, page, question number) — those cannot be checked without the
book. It does not verify the `mark_split` values, which every card correctly declares as the answer
book's own work with `needs_teacher_verification: true`. It does not render the cards, so nothing
here is a statement about how they look on the page.
