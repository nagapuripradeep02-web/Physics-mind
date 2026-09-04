# Vidi audit — slice 7 of 14 — Chemistry-II (grading pass)

Slice file: `C:\Tutor\physics-mind\.answerbook_logs\audit_r1_ts_ipe_c2.slice-07.md`
25 question groups × 10 templates = 250 replies. All 250 graded (no sampling). 0 guard replies found.

## 1. Per-template table

| Template | Mean | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 25 |
| whystep | 2.880 | 1 | 0 | 0 | 24 |
| remember | 2.520 | 0 | 1 | 10 | 14 |
| explain | 3.000 | 0 | 0 | 0 | 25 |
| mistakes | 3.000 | 0 | 0 | 0 | 25 |
| important | 3.000 | 0 | 0 | 0 | 25 |
| skiplast | 3.000 | 0 | 0 | 0 | 25 |
| why | 2.960 | 0 | 0 | 1 | 24 |
| outofbank | 2.880 | 0 | 0 | 3 | 22 |
| telugu | 3.000 | 0 | 0 | 0 | 25 |

## 2. Overall mean

**Overall mean: 2.924** (sum 731 / 250 replies). Reply count: **250**. Guard replies ("I could not answer just now" / "Give me a short moment"): **0** (none found; not excluded from the mean above since none exist).

## 3. Every reply scored 0 or 1

**Score 0 — `ts_ipe_c2_hal_wurtz_reaction` | `whystep` | step `s2_example_and_limits`**

> "This step is here because the book gives one full mark for a worked example and one full mark for the limitations. The example shows the doubling clearly, and the limitations stop you from writing a wrong reaction. The important point to remember is that aryl halides like chlorobenzene do not react in Wurtz, because their carbon-halogen bond is too strong."

Reason: the card's MARK SPLIT is "Definition and general equation 1M · Example and limitations 1M" — step `s2_example_and_limits` earns exactly **1M total** (example + limits combined, per its own `EARNS THE MARK FOR: Example and limits`). The reply instead describes "one full mark for a worked example AND one full mark for the limitations," i.e. 2 marks for a step that only carries 1. This invents a mark value not in the source (0-criterion).

**Score 1 — `ts_ipe_c2_met_cryolite_role` | `remember` | step `s1_problem`**

> "The important step is to remember that cryolite does two things, not one. Think of it as a numbered pair: first it lowers the melting point, and second it makes the melt conduct electricity. A simple way is to say 'down and up' — melting point goes down, conductivity goes up. Write both effects on one line and you have the second mark. Also, remember that cryolite is not the source of aluminium. The aluminium comes from alumina; cryolite only helps the process run at a lower temperature."

Reason: the student asked how to remember step `s1_problem` ("The problem with pure alumina" — melts above 2300 K, molten alumina is a poor conductor). The reply gives no memory aid for that content at all — it is entirely about step `s2_effects` (cryolite's two effects), and explicitly says "you have the second mark" while step 1 is the one open. A student following this tip would memorize the wrong step's content and get no help remembering the step actually asked about.

## 4. Four counts

- **WRONG-STEP** (whystep explains a different step, or misattributes marks): **1 of 25** — `ts_ipe_c2_hal_wurtz_reaction` s2 (see above; explains the correct step but invents a second mark for it).
- **SCOPE-CREEP** (outofbank declines correctly but then volunteers content of the open question): **3 of 25**
  - `ts_ipe_c2_met_alloy_compositions`: "For the alloy question that is open, the important step is to write brass as copper and zinc, bronze as copper and tin, and German silver as copper, zinc, and nickel — with no silver in it." (gives the actual composition answer, unrequested)
  - `ts_ipe_c2_met_c_vs_co_for_zno`: "For the question I do have open, the better reducing agent for ZnO is carbon (coke), and the reason is the Ellingham diagram above 983 K." (gives the actual answer + reason, unrequested)
  - `ts_ipe_c2_met_roasting_vs_calcination`: "...the important step is to write the definition with 'presence of air' for roasting and 'absence of air' for calcination. Each definition earns one mark, and each set of examples earns one mark." (gives content + mark allocation, unrequested)
  - (22 of 25 outofbank replies are bare offers naming only the open question's topic/title — not creep.)
- **LITERAL-MARKDOWN** (`**`, leading `- `, `#`, backticks): **1 of 250** — `ts_ipe_c2_hal_racemic_retention_enantiomers` telugu reply uses `**Racemic mixture**`, `**Retention of configuration**`, `**Enantiomers**` (already self-flagged in the file as `MARKDOWN:**bold**`).
- **TRUNCATED** (ends mid-sentence/mid-formula): **0 of 250**.

## 5. Mechanical flags judged WRONG

- **`MARK_SUM:2`** on `ts_ipe_c2_met_refining_methods` "marks" reply — the flag is a false positive. The reply never states a wrong total; the "2" it fires on is a correct hypothetical ("Writing a long essay on only two methods will give you only 2 marks"), consistent with 1 mark × 4 methods.
- **`MARK_SUM:3`** on `ts_ipe_c2_hal_racemic_retention_enantiomers` "explain" reply — also a false positive. The reply correctly states this is a 4-mark question and that "the definitions alone only cover 3 marks" (3 of the 4, before the 4th connecting-paragraph mark) — an accurate partial count, not a wrong total.
- `MARKDOWN:**bold**` (racemic telugu) and both `OVER_BUDGET` flags (refining_methods "why" 154/150; roasting_vs_calcination "outofbank" 94/90) are accurate, not wrong — left out of this list.

## 6. Cards whose ANSWER FACTS are themselves defective

**`ts_ipe_c2_met_alloy_compositions`** — step `s2_german_silver`. The WRITE line gives:

> "Cu 25 to 40 %, Zn 25 to 35 %, Ni 40 to 50 %."

and the step's own WHY text admits the defect directly: "the printed ranges are the book's own and they do not add to 100 % at either end (25 + 25 + 40 = 90 %, and 40 + 35 + 50 = 125 %), so at least one bound is loose... the disagreement is recorded for a teacher to settle." This is an unresolved internal inconsistency shipped as fact to the model — the three composition ranges cannot both be taken as tight bounds and be chemically coherent (a composition must sum to 100%), and the card says so itself without fixing it. Every reply that reproduces these ranges (marks, remember, mistakes, explain, telugu) is faithfully passing along a bank defect, not a reply defect. This is a single card issue, not one affecting the wider fleet in this slice — no other card in this slice was found with an unresolved WHY/NOTE-vs-MARK-SPLIT contradiction, unbalanced equation, or two sibling statements reaching opposite conclusions (several other cards document a source-book error but immediately supply a corrected, self-consistent WRITE line — those are not counted here since what the model was actually given to teach is clean).
