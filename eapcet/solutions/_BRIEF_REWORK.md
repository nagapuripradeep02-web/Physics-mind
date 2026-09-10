# Rework brief — completing the mistake entries of a verified solution (strict chapters)

You complete `common_mistakes` on a handful of solutions from ONE strict chapter so that every
wrong option carries an entry. Your dispatch names your SLICE file and the question ids that are
yours. Everything else is here, and the rules of `_BRIEF_AUTHOR.md` still apply to every string
you write.

Input:   the slice file named in your dispatch, under `eapcet/solutions/_slices/` (`…_rework.json`)
Output:  `C:\Tutor\physics-mind-eapcet-corpus\eapcet\solutions\<question_id>.json` — the SAME file,
         edited in place, `common_mistakes` completed, everything else untouched

**Write each file immediately after you finish that question, before starting the next one,
and before your final reply.** A file on disk is the only deliverable that counts.

## What you see, and what you must not go looking for

Each item carries the question, its four options, the solution's content fields, and
`unmapped_options`: the wrong options that carry no entry yet. The solution's own
`final_answer.option` passed the key gate, so you know which option is right; you still never
open `eapcet/bank/`, `eapcet/keys/`, `eapcet/pool/`, `eapcet/solutions/_gate/`,
`eapcet/solutions/_audit/`, or any solution file that is not in your list.

## Method, per question

1. Read the solution as written. Do not change `approach`, `steps`, `final_answer`,
   `concept_tags`, `difficulty` or `mistake_type_hint`. If you believe a step is wrong, say so
   in your reply and do not edit it — a changed line without an audit is a defect, not a fix.
2. For each option in `unmapped_options`, **compute in python** every plausible student slip on
   THIS question — the wrong interval, the wrong body, a dropped ½, a sign, the wrong second,
   the reciprocal, the wrong g — and see which one lands exactly on that option's printed
   value. Name every scratch file with your agent label.
3. Where a slip lands there, write the entry: `{"option": n, "text": "…"}` — the error a
   student makes and the number it produces, at most 35 words, plain literal English, never a
   valid alternative method condemned. **Every entry names an option; `option: null` is not
   allowed in a strict chapter.**
4. Where NO slip lands there after a real search, write
   `{"option": n, "text": "…", "distractor": true}` — at least six words saying what the
   option is not: which nearby slips miss it and what they give instead ("No single slip
   reaches 12: the fresh-fall route gives 32g/8g = 4, the total-by-twelve route gives 9").
   Never invent a slip to avoid a distractor: the app would then tell a student they made an
   error nobody makes, which is the one harm this pass exists to remove.
5. Keep the existing entries unless one is wrong (its text does not produce its option). Then
   fix that entry's text and say so in your reply. Re-order nothing you do not have to; the
   routes sidecar is rewritten after you anyway.
6. The finished list has exactly three entries, one per wrong option, in option order unless
   an existing entry's position matters to you. Run the gate in your head against
   `_BRIEF_AUTHOR.md`: 35-word limit, no markdown, no idiom, real Unicode maths.
7. Update `authored_by` to `{"model", "wave", "agent", "at"}` from your dispatch. The file's
   content sha moves and a blind auditor reads it again — write for that reader.

## Reply

Reply with only: files completed (count), entries added (count) and distractors declared
(count, with the question id and option of each), any existing entry you changed and why, and
any step you believe is wrong. Do not paste JSON.
