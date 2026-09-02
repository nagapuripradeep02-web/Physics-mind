# Vidi audit — Physics-II, slice 2 of 11

Slice file: `.answerbook_logs\audit_r1_ts_ipe_p2.slice-02.md`
24 question cards × 10 templates = 240 replies graded (every reply, no sampling).
0 guard replies ("I could not answer just now" / "Give me a short moment") found.

## 1. Per-template table

| Template | Mean | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 24 |
| whystep | 2.833 | 0 | 2 | 0 | 22 |
| remember | 3.000 | 0 | 0 | 0 | 24 |
| explain | 3.000 | 0 | 0 | 0 | 24 |
| mistakes | 3.000 | 0 | 0 | 0 | 24 |
| important | 3.000 | 0 | 0 | 0 | 24 |
| skiplast | 3.000 | 0 | 0 | 0 | 24 |
| why | 2.917 | 0 | 0 | 2 | 22 |
| outofbank | 2.875 | 0 | 0 | 3 | 21 |
| telugu | 3.000 | 0 | 0 | 0 | 24 |

## 2. Overall mean

**Overall mean: 2.963** (711 / 240), reply count **240**, guard replies **0** (excluded from the mean as instructed; none occurred in this slice).

## 3. Every reply scored 0 or 1

Two replies scored 1. None scored 0.

**`ts_ipe_p2_cur_colour_code_350_mega_ohm`, [whystep] step s2_code — score 1**

> This step is here because the colour code only has two bands for digits. Since 350 has three digits, you cannot fit 3, 5, and 0 all into the code. So you move one zero into the multiplier, turning 350 × 10⁶ into 35 × 10⁷. That way you get two clean digits, 3 and 5, and the multiplier becomes 10⁷. The colours then follow directly from the table: 3 is Orange, 5 is Green, and 10⁷ is Violet.

Reason: `s2_code` is the "four-band code" step, worth 1M for **Orange, Green, Violet, Gold** — the ANSWER FACTS' own MISTAKES line for this step warns explicitly: "Forgetting the Gold band — the question asks for the 5% tolerance too." This reply commits exactly that mistake: it names only three colours and never mentions the tolerance band at all. A student reading this explanation would come away thinking three colours are the whole answer.

**`ts_ipe_p2_cur_colour_code_350_milli_ohm`, [whystep] step s2_colours — score 1**

> This step is here because the resistor value must be shown as two digits times a power of ten before you can read the colour bands. The first two bands on a resistor can only represent two digits, so 350 mΩ has to become 35 × 10⁻² Ω. That rewriting is what the first mark pays for, and it is the necessary setup for reading the colours in this second step.

Reason: the open step is `s2_colours` (the four colours: Orange, Green, Silver, Silver — 1M). The reply spends its entire length justifying step 1's reshaping (`s1_form`) and never actually states what the colours are or why step 2 itself earns its mark. The student's actual question — "why is *this* step here" — is left unanswered; this is the WRONG-STEP failure mode named in item 4.

## 4. Four counts

- **WRONG-STEP**: 1 of 24 whystep replies — `ts_ipe_p2_cur_colour_code_350_milli_ohm` [whystep] step s2_colours (explains step s1_form instead of the open step s2_colours; see item 3).
- **SCOPE-CREEP**: 3 of 24 outofbank replies — after correctly declining the ideal-gas-equation question, these three volunteer unrequested content/marks/values of the currently open card:
  - `ts_ipe_p2_com_world_wide_web`: "...the answer is short: first mark for defining it as a large store of information on internet-connected computers, second mark for saying anyone can access it anytime through a computer on the internet."
  - `ts_ipe_p2_cur_bulb_100w_200v_resistance`: "...the answer is 400 Ω, not the 484 Ω that appears in the book's own slip."
  - `ts_ipe_p2_cur_manganin_standard_resistors`: "...the answer is two marks: first, manganin has a very small temperature coefficient of resistance (α)... Second, because a standard resistor must keep the same value even when current heats it during use, manganin's constant resistance means the marked value stays true." (this one also carries the OVER_BUDGET(97w/90) flag)

  All three are otherwise factually correct, so they were scored 2 (padded/over what the ask deserved), not 0/1. A bare one-line offer to help ("I can help you with X if you want") appeared correctly in the other 21 outofbank replies and was NOT counted as creep.
- **LITERAL-MARKDOWN**: 0 of 240 (verified by regex over every `>`-quoted reply line — no `**`, leading `- `, `#`, or backticks anywhere in an actual Vidi reply; the only `**`/backtick hits in the raw file are the rubric header and the `**Vidi replies:**`/`**Student asks:**` scaffolding, not reply content).
- **TRUNCATED**: 0 of 240 — every reply ends on a complete sentence or formula.

## 5. Mechanical flags on replies judged WRONG

None. Only three mechanical flags fired anywhere in this slice, all `OVER_BUDGET`:

- `ts_ipe_p2_atm_thomson_model_limitations` [why]: `OVER_BUDGET(155w/150)`
- `ts_ipe_p2_cur_bulb_100w_200v_resistance` [why]: `OVER_BUDGET(174w/150)`
- `ts_ipe_p2_cur_manganin_standard_resistors` [outofbank]: `OVER_BUDGET(97w/90)`

All three fired on replies that were factually correct and grounded (scored 2 for length/padding, not WRONG). Neither of the two replies actually judged WRONG (item 3) carries any mechanical flag — the regex checks in this run do not catch a step-explanation that answers the wrong step or drops a required band, so this is itself worth flagging: the two real content defects found in this slice were invisible to the mechanical layer and would not have been caught without a full human read.

## 6. ANSWER FACTS defects

None found. Every mark split in this slice sums to the section's stated total (2M for every VSAQ, 4M for every SAQ, 8M for the Kirchhoff/Wheatstone LAQ). Every worked formula was checked and balances:

- Battery/terminal voltage: R = ε/I − r = 20 − 3 = 17 Ω; V = ε − Ir = 10 − 1.5 = 8.5 V; cross-check V = IR = 0.5 × 17 = 8.5 V. Consistent.
- Bulb: R = V²/P = 200²/100 = 400 Ω (the book's own 220 V/484 Ω slip is correctly flagged as the book's error, not asserted as fact).
- All four colour-code cards: digit/multiplier/tolerance mappings match the standard resistor colour table (2=Red, 3=Orange, 5=Green, 7=Violet; Gold=10⁻¹/±5%, Silver=10⁻²/±10%) with no swaps.
- Speech bandwidth: 3100 − 300 = 2800 Hz. Correct.
- Kirchhoff/Wheatstone bridge: independently re-derived the four junction/loop equations from the stated current directions (i₁=i₅+i₃; i₂+i₅=i₄; −i₁P−i₅G+i₂R=0; −i₃Q+i₄S+i₅G=0) — all sign conventions are self-consistent with the described current directions, and setting i₅=0 correctly yields i₁=i₃, i₂=i₄, and P/Q=R/S. No error.
- The two "household appliances in parallel" cards intentionally duplicate the same question with different (but mutually consistent) reasons per their own INSIDER POINT notes — not a defect.
- The ionosphere card's corrected region placement (D/E in mesosphere/lower-thermosphere, F₁/F₂ in thermosphere, none in the stratosphere) is internally consistent between its WRITE, WHY, and REMEMBER fields.

No step's WHY/NOTE contradicted its own MARK SPLIT, no equation failed to balance, and no subject-content claim was found false, in this slice.
