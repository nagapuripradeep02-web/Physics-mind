# Vidi (DeepSeek) audit — Maths 1A / 1B, 2026-08-31

First measurement of the answer-book chatbot on either maths paper. Method matches the
runs that measured physics (9.9), chemistry (9.64), Maths-2A (9.94) and Maths-2B (9.90),
so the numbers are comparable: `vidi_audit.ts`, the 10-ask student battery, fired at the
LOCAL mirror, graded blind by eight reader agents against the ANSWER FACTS the model was
actually given — never against the grader's own knowledge of mathematics.

## Sample

40 cards (20 per paper), stratified — not `--limit`, which takes the first N contexts in
file order and would have concentrated the sample in one chapter. The subset spans all 22
units, all three lengths (12 VSAQ / 15 SAQ / 13 LAQ), the 6 cards carrying figures, the 4
cards with no `insider_note` (the two new 1A chapters), and the widest contexts in the bank.

`vidi_audit.ts` gained one argument for this: `--contexts=<path>`, so a filtered dump can
be audited. It is a harness, not a gate.

420 calls, $0.1217 total (about Rs 11.4).

## Scores

| | Replies graded | Mean | Out of 10 | 3 | 2 | 1 | 0 |
|---|---|---|---|---|---|---|---|
| Maths 1A | 200 | 2.945 / 3 | **9.82** | 191 | 8 | 0 | 1 |
| Maths 1B | 194 | 2.974 / 3 | **9.91** | 189 | 5 | 0 | 0 |
| **Both** | **394** | **2.959 / 3** | **9.86** | 380 | 13 | 0 | 1 |

Six guard replies were excluded from scoring (see below). For comparison: physics 9.9,
chemistry 9.64, Maths-2A 9.94, Maths-2B 9.90. **Maths 1A/1B lands inside the fleet's band
on its first measurement.**

## The one reply scored 0 — and it is the CARD's fault, not the model's

`ts_ipe_m1a_mat_det_square_cyclic`, ask "if i skip this last step how many marks will i
lose?" — Vidi said "all 7 marks that the book assigns". The card is worth 8. The mechanical
`inventedMarks` check caught it independently (`!MARK_NOT_IN_BANK:7`) and the grader
confirmed it as a true positive.

**Corrected after checking the context that was actually sent.** This was first written up
as the model's own arithmetic slip. It is not. The card's step `s6_conclude` carries the
margin note *"No separate mark — the seven are already spent — but write the line"* — a
stale relic of the 7-mark paper that survived the 2026-08-28 re-cut to 8 — and `margin_note`
is emitted into the prompt as NOTE. **The bank told the model seven.** The model repeated
what it was given, which is exactly what it is supposed to do.

A sweep of all 613 maths cards for a reader-facing mark TOTAL that disagrees with
`marks_total` found this one card and no other. It is the only place in either paper where
a student can be told the wrong total, and it took a live model reply to surface it — no
gate looks at prose that names a number held in structured data.

## Other findings

- **One truncated reply.** `ts_ipe_m1b_dif_cos_inverse_a_cos_x_plus_b` — the bank's widest
  1B context — was cut mid-formula at "The constant k(a +", just before the step that shows
  the constant cancels. Cause is the per-request `max_tokens` cap: 500 for a walkthrough ask
  (`index.ts:402`), not the context slice. Everything said before the cut was accurate.
  Only 1 of 40 walkthrough replies was affected, all of them on the longest cards.
- **Context sizes are safe.** All 613 maths contexts measured against the 14,000-char slice
  at `index.ts:296`: max 8,619 (`ts_ipe_m1a_mat_det_powers_abc`), median 3,334, and **zero**
  cards even reach the 12,000-char warning threshold. Nothing is being silently cut on the
  way in. (Bank-wide the widest is 10,421, a Physics-II card.)
- **Six guard replies** ("I could not answer just now") came from `fetch failed` — a
  transport error between the local mirror and DeepSeek, about 2.4% of calls. They clustered
  on two cards in the first run, which looked card-linked; a deliberate retry moved the
  failures to different asks on a different card, so it is transient network flakiness, not a
  card defect. The deployed Edge Function runs on a different network path.
- **Telugu replies are correct behaviour, not a Rule 30i violation.** One grader flagged
  them. Checked: `index.ts:303` switches to Telugu only when the STUDENT writes in Telugu
  script or types "telugu/telugulo/cheppu". Rule 30i retired Telugu as an authored and voiced
  language (no `text_te`, no audio, no language picker); it never barred answering a student
  who asks in Telugu. No change needed.
- **Two card-side artifacts** surfaced through the replies rather than through any gate: a
  locus card whose `common_mistakes` cites a bracket belonging to a different problem, and a
  `why` line whose final paragraph is duplicated verbatim. Both are in the per-slice reports
  and belong to the examiner pass, not to the model.

## What this does and does not prove

It proves the chatbot is faithful to the bank: with the right facts in front of it, it
answered 394 student questions with one arithmetic slip and no invented steps, no invented
mark values, and nothing answered out of bank. **It does not prove the bank is right** — a
grader marking against the ANSWER FACTS will happily pass a fluent explanation of a wrong
card. That is what the examiner accuracy pass is for, and it has still not run.
