# TG EAPCET question library — start here

The evidence corpus for the competitive-exam product: every question the Telangana engineering
entrance exam has actually asked, transcribed verbatim with its **official answer key**, then
tagged into chapters and question families.

**Status: BUILT — all three subjects, 26 papers, 4,159 questions in the bank (2026-09-07; see 1f).**
What follows below section 1f is the original build brief, kept because its reasoning still governs
the work. It reuses
the pattern already proven by `answer-book/papers/` (seven IPE Physics papers, 100% back-tested,
2026-08-26); read `answer-book/papers/README.md` before starting, because the rules there apply
here almost unchanged.

## 1. Why the library exists

The student product is live-first: a student photographs a question from their own institute's
material and our solver answers it. That solver needs no library. **Everything around it does.**

| What it powers | Why nothing else can |
|---|---|
| The chapter and family map behind every "you are weak in X" | A model guessing the syllabus gives a plausible map; the papers give the true one |
| Diagnostic, mock tests, score-to-rank estimates | Only real exam questions carry real exam difficulty |
| The remediation questions we hand back after a weakness | The doubts are the student's; the fixes must be ours |
| What to study next, ranked | Frequency across years is the only honest priority signal |
| Solver accuracy, per chapter, before a student sees it | Thousands of keyed questions = an automatic regression suite |
| The free tier that gets forwarded on WhatsApp | "Ten years, every question, solved" is the sentence that travels |

## 1b. WHAT IS ALREADY ON DISK (2026-09-07)

**107 Telangana PDFs, 838.6 MB, downloaded and verified** to `pdfs/eapcet/ts/` (that directory is
gitignored, so nothing large enters the repo). `pdfs/eapcet/ts/_manifest.json` carries one row per
file: manabadi title, Google Drive id, parsed year, stream, date, session, language, kind, byte
size and SHA-256. Every file begins with `%PDF`, and no two files share a content hash.

Source: `manabadi.co.in` question-paper section, `SysId=182` (the Telangana list; `SysId=14` is
Andhra Pradesh and was not used). Manabadi links out to Google Drive; the crawler resolved 30
sub-pages down to 107 unique Drive files. Crawler and downloader are in this session's scratchpad.

| Kind | Count |
|---|---|
| Real question papers | 80 |
| Answer keys | 11 |
| Model / mock papers | 16 |

Engineering stream: 60 files, of which **34 are real engineering papers from 2021 to 2025** (31 once
the Urdu editions are set aside). Years present: 2016 to 2025. **2026 is absent** and must come from
the official site.

**The 2021 to 2025 papers are official TSCHE computer-based-test PDFs, which is better than a
scan.** They carry a real text layer with `Question Number`, `Question Id`, `Correct Marks : 1`,
`Wrong Marks : 0`. The option bodies and most mathematics are embedded images, so those still need
vision transcription. **The correct answer is machine-recoverable without any separate key file:**
the page content stream fills the correct option's marker green (`0 0.50196 0 rg`) and the wrong
ones red (`1 0 0 rg`), exactly as the PDF's own notations page states. Extract the colour, get the
key.

Two cautions found by reading the files rather than assuming:
- **The layout differs by year.** 2024 prints a verbose block per question; 2025 prints a compact
  `Q.1 / Ans / Question ID / Chosen Option` form. The extractor needs a per-year profile.
- **2016 to 2018 are scanned bilingual booklets** whose embedded OCR is badly garbled, with Telugu
  rendered as noise. Treat them as low priority, or re-OCR them.

`mineru-service/` already exists in this repo and `npm run mineru` starts it. That is the intended
tool for the image half; do not add a second PDF stack before trying it.

### Engineering coverage, counted as unique shifts

Files are not shifts. Urdu editions and duplicate uploads inflate the file count, so the number that
matters is distinct (date, session) slots.

| Year | Exam days | Shifts held | Shifts held on disk |
|---|---|---|---|
| 2021 | Aug 4, 5, 6 | 6 | **6 — complete** |
| 2022 | Jul 18, 19, 20 | 6 | **6 — complete** |
| 2023 | May 12, 13, 14 | 6 | **6 — complete** |
| 2024 | May 9, 10, 11 | 6 | 5 — missing 11 May afternoon |
| 2025 | May 2 to 5 | 8 | 3 — only 3 May FN/AN and 4 May FN |
| 2026 | May 9 to 11 | — | **0 — see below** |

That is **26 distinct engineering papers**, roughly 4,160 questions, of which about 1,040 are
Physics. 2021 to 2023 is a complete three-year run on its own and is the right place to start.

### The gap hunt of 2026-09-07, and what it settled

Searched manabadi, Sakshi Education, collegedost, educharcha, allen and the official council site.

- **Sakshi mirrors the same official CBT PDFs** at `education.sakshi.com/sites/default/files/pdf/…`,
  titled "Question Paper with Key". Its 2025 engineering set is the same three shifts we already
  hold, proven by identical SHA-256, plus one extra response sheet for 4 May forenoon (kept).
- **Sakshi's "11 May 2025" engineering paper is mislabelled.** Its content hash is identical to the
  11 May **2024** paper. Caught by hashing, not by reading the title. Verify every mirror by content.
- **collegedost's 2025 "May 2nd" links are not papers.** They are 4 to 10 page teasers carrying
  Agriculture/BiPC instruction text (40 Physics, 40 Chemistry, 80 Biology) and zero questions. They
  were downloaded, inspected, and deleted. `_gapfill_manifest.json` records why.
- **2026 is not publicly downloadable.** The council publishes the 2026 master question paper and
  key only behind a candidate login that wants a hall ticket number, registration number and date of
  birth. No mirror carries it. Getting it needs a real 2026 candidate to pull their own copy — ask a
  student in the pilot cohort, do not try to work around the login.

**The standing rule this produced: verify a mirrored paper by its content hash and by the date
printed inside the PDF, never by the title on the page that linked it.**

## 1c. THE KEY IS SOLVED (2026-09-07) - 4,824 official answers, no OCR, zero cost

**The green marker is not artwork. It is the fill colour of the option-label text span.** The green
tick and red cross icons beside each option are separate images and are a red herring. Read the
colour of the label itself and the key falls out in one pass.

Use `pymupdf` (installed 2026-09-07, version 1.28.2). `pypdf` cannot do this - it neither renders
nor exposes span colour, which is why three earlier attempts failed.

```python
for b in page.get_text("dict")["blocks"]:
    for l in b["lines"]:
        for s in l["spans"]:            # a span like '2.' whose colour is green
            ...                          # is the correct option
```

### Result across the fleet

| | |
|---|---|
| Engineering papers 2021-2025, non-Urdu | 31 |
| Papers perfect at 160 of 160 | **31 - all of them** |
| Question slots | 4,960 |
| Keys extracted | **4,960 (100%)** |

The per-paper answer distribution comes out near-uniform, roughly 40 each across options 1 to 4 out
of 160. That is the strongest evidence the read is right, because a broken extractor skews.

**Verified by eye, not only by counts.** The page holding question 4 of the 9 May 2024 forenoon
paper was rendered: option 2 carries the green tick, options 1 and 3 the red crosses, and the
extractor says 2.

### Three layout profiles, one extractor

| Years | Question marker | Option label | Colours |
|---|---|---|---|
| 2021, 2022, 2024 | `Question Number : N` | `1.` to `4.` | `#008000` / `#ff0000` |
| 2023 | `Question Number : N` | option id glued to the label, e.g. `28393619213.` | `#008000` / `#ff0000` |
| 2025 | `Q.N` | `1.` to `4.` | `#40c64b` / `#f61818` |

Rules that make one extractor cover all three: classify colour by RGB dominance, never by exact hex;
when the printed label is not a bare 1 to 4, take the **ordinal position** of the coloured spans;
and ignore `Chosen Option :`, which is the candidate's own answer, not the key.

**The one bug, found and fixed 2026-09-07.** Two 2025 papers stopped at 99 of 160. The cause was
not letter-spacing, which was the first guess and was wrong. It is that a three-digit question
marker SPLITS ACROSS SPANS: `Q.100` is drawn as a span reading `Q.10` with a bare `0` beneath it,
so the regex captured 10 and every question from 100 up was lost. The fix glues on a following
bare-digit span when doing so restores the expected sequence, which is self-validating and cannot
fire on a correctly-numbered marker. Rendering the page shows the split plainly.

### Checks that looked convincing and were not

**Read this before trusting any check in this document.** Everything in the list below
passed while 242 of the 4,960 keys were wrong - about a quarter of every 2023 paper. The
extractor sorted a question's coloured option marks by `y` alone, so options printed at the
top of the next page sorted ahead of options at the bottom of the previous one. Reading
order is `(page, y)`. Only 2023 broke, because 2023 is the one profile that falls back to
the green mark's ordinal position.

Each check below was blind to it **by construction**, which is the part worth remembering:
duplicate shifts share the bug, a permutation leaves the distribution as uniform as it was,
and the two pages read by eye happened to be 2024 and 2025. A measure computed from the
same reading cannot audit that reading. Fixed in `52b1ddea`.

The checks, kept as written so the lesson stays legible:

- **Five shifts exist as two separate uploads each.** All five pairs extract to **identical** keys,
  including the 2022 pairs where one file is the plain edition and the other the `(Eng)` edition.
- **Corpus-wide answer distribution** across 4,960 keys is 1219 / 1315 / 1301 / 1125 for options
  1 to 4, close to uniform. A broken extractor skews.
- **Two pages rendered and read by eye.** Question 4 of the 9 May 2024 forenoon paper: option 2
  green, detector says 2. Question 100 of the 3 May 2025 forenoon paper, in the range that used to
  fail: option 1 green, detector says 1.
- **`Chosen Option` is visibly not the key.** On that 2025 page the candidate chose 4 while the
  green tick sits on 1. The extractor ignores that field by design.

**What actually caught it:** a second process reading the same fact a different way. The vision
pass reads the green tick off the rendered image; the extractor reads the fill colour of the text
span. They disagreed on 7 of one 2023 paper's 40 physics questions and the physics said the vision
pass was right every time. Budget the second reader as part of the build.

### Artifacts on this desk

`scripts/eapcet/extract_key.py` - the extractor.
`eapcet/keys/_extracted.json` - 31 papers, 4,824 keys.
`eapcet/keys/_summary.json` - per-paper counts.

## 1d. CONTENT EXTRACTION - costed and quality-checked (2026-09-07)

The remaining work is the question and option bodies, which are images. Tested on the Physics
section of the 9 May 2024 forenoon paper before committing to the whole corpus.

**Subject ranges, confirmed by reading real questions rather than assuming.** Question 4 is
matrices, question 81 is fundamental forces, question 121 is quantum numbers. So Mathematics is
1-80, Physics 81-120, Chemistry 121-160.

**Method: crop the page region per question, do not pull image XObjects.** A question's region runs
from its marker to the next one, spilling onto the following page when needed. Cropping preserves
layout and mathematics; extracting the embedded images shreds it.

| Physics section, 40 questions | |
|---|---|
| Images produced | 69, or 1.73 per question |
| Questions spanning a page break | 29 of 40 |
| Median size per question | 253 KB at 150 dpi |

**Cost, at DeepSeek V4 Flash rates verified 2026-09-07** (an image bills at up to 384 tokens; add
roughly 250 prompt and 320 output tokens per question):

| Scope | Questions | Off-peak |
|---|---|---|
| One question | 1 | Rs 0.035 |
| Physics across 26 papers | 1,040 | about Rs 36 |
| Physics and Chemistry | 2,080 | about Rs 73 |
| All three subjects | 4,160 | **about Rs 146** |

Peak rates double it. Peak is roughly 06:30-09:30 and 11:30-15:30 India time, so a scheduled
overnight run pays the lower rate.

**Quality, checked by reading the crops.** Question 84 comes out complete and legible in a single
image: the English text, the Telugu text, and all four options with their markers. Its green tick
sits on option 2, the extractor's key says 2, and the physics is independently right - two bodies
at 30 degrees to the horizontal and 30 degrees to the vertical with equal ranges give a height
ratio of 1 to 6. Question 81 spans a page break and is complete across its two parts.

**The one thing the pipeline must respect:** a question that spans a page break produces two images
and both must be sent in the same request, or the options are lost.

**Conclusion: content extraction is not the expensive step.** At roughly Rs 150 for the entire
engineering corpus, cost is not a reason to stage the work. The real cost is the review pass that
confirms the transcriptions, which is human time, not tokens.

## 1e. THE PHYSICS BANK IS BUILT (2026-09-07)

All 26 distinct engineering shifts, 2021 to 2025, physics section transcribed. Run by
`model: sonnet` sub-agents on the subscription, one paper per agent, all working from the single
brief at `eapcet/transcripts/_BRIEF_PHYSICS.md` (named `_BRIEF.md` when only physics existed).
Concurrency ceiling is 20 sub-agents.

| Measure | Result |
|---|---|
| Papers | 26 |
| Questions | 1,040 |
| Chapters represented | 30 of 30 |
| Vision reading agrees with the official key | 1,039 of 1,040, 99.9% |
| Answers disputed by the physics | 4 |
| Questions where the figure carries information the text does not | 84, 8% |

**The answer of record is the key from the PDF, never the vision pass.** The vision pass's reading
of the green tick is kept beside it in every row. That is the only reason a disagreement is visible
at all; drop it and the bank looks certain when it is not.

**The official key is not infallible.** Four questions carry a recomputation that contradicts the
option the paper marked, and by hand all four hold up. Two are typos in the printed question or
option: the 6 Aug 2021 afternoon Q84 needs an initial velocity of 5 m/s for its marked 18 m, not the
printed 10; the 18 Jul 2022 afternoon Q97 prints 1.116 kg where the arithmetic gives 1.167. Two are
simply wrong keys: the 19 Jul 2022 afternoon Q103 marks 0.9 degrees where dividing by the refractive
index gives 0.09; the 10 May 2024 forenoon Q106 marks 0.7e-6 where conductivity gives 0.7e5, which
was confirmed by reading the page. A wrong official key still scored marks in the real exam, so the
row keeps it, flagged, in `eapcet/bank/_review_queue.json`, and it is never shown unreviewed.

### The three gates, each added after something got past the previous ones

- **structure** - 81 to 120 present once each, four options, none empty.
- **placeholder** - an option reading `(option 3 not visible)` is not a transcription. It passes
  every emptiness check and arrives in front of a student as a real choice.
- **absent-claim** - a note saying an image was missing is checked against the real crop count.
  Three separate agents reported a continuation image as non-existent while it sat on disk,
  readable. All three were re-dispatched and corrected. Never take an agent's word that content
  was unavailable; look at the disk.

### Artifacts

`scripts/eapcet/crop_fleet.py` - crops questions 81 to 120 for every shift (renamed from
`crop_physics_fleet.py` and made subject-agnostic when chemistry and maths opened).
`scripts/eapcet/check_transcripts.py` - the gates, the key agreement score, the chapter table.
`scripts/eapcet/build_bank.py` - merges transcripts and keys into the bank.
`eapcet/transcripts/*__physics.json` - 26 papers. `eapcet/transcripts/_BRIEF_PHYSICS.md` - the
agent brief.
`eapcet/bank/physics_v1.json` - the bank. `eapcet/bank/_review_queue.json` - what needs a human.
`eapcet/crops/` is gitignored and re-derivable in one command.

**Next:** the same pass for Chemistry, questions 121 to 160, and Maths, questions 1 to 80.

## 1f. THE CORPUS IS COMPLETE - all three subjects, 4,159 questions (2026-09-07)

Chemistry (121 to 160) and Maths (1 to 80) finished the same way physics did: `model: sonnet`
sub-agents on the subscription, working from `_BRIEF_CHEMISTRY.md` and `_BRIEF_MATHS.md`, never
allowed to open the extracted key. Maths ran in halves, two agents per paper, because 80 questions
does not fit one agent's budget; `check_transcripts.py` derives subject from the question number,
so the halves merge with no seam.

| Subject | Papers | Questions | Agrees with the official key | Structural defects |
|---|---|---|---|---|
| Maths | 26 | 2,080 | 2,080 of 2,080, **100.0%** | 0 |
| Physics | 26 | 1,040 | 1,039 of 1,040, 99.9% | 0 |
| Chemistry | 26 | 1,040 | 1,037 of 1,039, 99.8% | 1 |
| **Total** | **26** | **4,160** | **4,156 of 4,159, 99.93%** | **1** |

**All three disagreements were adjudicated by hand, and the official key was right all three times.**
They are kept in the transcripts with the losing reading intact, tagged `adjudication`, so the
disagreement rate stays an honest measure of the vision pass rather than one quietly laundered by
its own corrections. The three: 20 Jul 2022 FN Q106 (only Statement III is true - resistivity does
depend on temperature, and a wire drawn to four times its length has R proportional to L squared, so
96 ohms, not the printed 48); 13 May 2023 AN Q127 (12.0 + 19.034 + 2.0143 is limited by one decimal
place, so 33.0, three significant figures); 4 May 2025 FN Q159 (alkali-metal superoxides are
coloured, so "colourless" is the incorrect statement).

### The decoy field, and why only a second reader could find it

Some 2025 sheets print a box reading `Chosen Option : N`. **That is the real candidate's answer from
the exam, not the key.** It agrees with the correct answer only when that candidate happened to be
right, so an agent reading it produces a row that is structurally perfect - four real options, a
legal answer index, high confidence - and silently wrong. One chemistry question was recorded that
way. Nothing but the disagreement with the extracted key could have caught it.

Two things this settles. A page can print a decoy that looks like the answer, so a brief must name
what the answer is NOT, not only what it is. And the layout is not uniform within a year: 3 May 2025
AN has no such box while 4 May 2025 FN does, so never generalise a layout from one paper of its
year. All three briefs now carry the warning. It was worth carrying: on one 2025 paper the box and
the tick disagreed on roughly two-thirds of the questions.

### The one question held out of the bank

`tg_eapcet_2023_20230513_an` Q121 asks for the ground-state angular momentum of the electron in
hydrogen. **Option 3's text is absent from the official source PDF**, not from our crop, confirmed
three independent ways on page 91: the rendered crop shows the label and green tick with nothing
beside them; the PDF text layer holds all four option LABELS as text spans but no value text for
option 3; and the option VALUES are raster images, of which the page carries three, at options 1, 2
and 4 only. The answer is not in doubt - key and vision pass both read option 3, and h/2pi is
1055e-37 J s, exactly the value the three printed distractors are built around. That string is still
not written into `options_en`, because deriving a value is not transcribing one. The question sits in
`eapcet/bank/_gaps.json` with the full diagnosis; promoting it means a human deciding to print a
reconstructed option.

### What the frequency tables say, and it differs by subject

**Maths is flat and cannot be short-cut.** No chapter exceeds 5.0%; the top ten of forty chapters
are 41.7% between them. The four source papers are balanced almost exactly: 1A 24.5%, 1B 26.1%,
2A 25.0%, 2B 24.5%. Heaviest: Applications of Derivatives 5.0%, Matrices 4.8%, Integration 4.5%,
Differentiation 4.3%, The Straight Line 4.1%. The ten smallest chapters together are 9.0%, so even
abandoning a quarter of the syllabus buys back under one question in ten.

**Physics is flat too** - max 5.3%, top ten about 46%, first year 48% against second year 52%.

**Chemistry is the exception, and organic is the reason.** Organic chemistry is 329 questions,
**31.7% of the chemistry paper**, roughly 12.7 of its 40. General Organic Chemistry alone is 8.6%,
Aldehydes/Ketones/Carboxylic Acids 6.0%, Alcohols/Phenols/Ethers 4.6%. The top ten chapters are
48.3%. Year split is 47.9% first year to 52.1% second year.

The product consequence: a "study these five chapters" promise is honest in chemistry and dishonest
in maths and physics. Ranking by frequency is still right; promising a short path is not.

### Artifacts

`scripts/eapcet/crop_fleet.py` - crops any subject for every shift (`SUBJECTS` names the ranges).
`scripts/eapcet/chapters.py` - the one taxonomy for all three subjects, and `subject_of(q_no)`.
`scripts/eapcet/check_transcripts.py` - the gates, the agreement score, the chapter tables.
`scripts/eapcet/build_bank.py` - merges transcripts and keys into one bank per subject.
`eapcet/bank/{maths,physics,chemistry}_v1.json` - the banks, 4,159 questions.
`eapcet/bank/_review_queue.json` - what still needs a human, and what has already been adjudicated.
`eapcet/bank/_gaps.json` - held out rather than shipped with a hole.

## 2. The source, and the one advantage over the IPE bank

TGCHE releases, after each exam, on `eapcet.tgche.ac.in`: the **master question paper** per shift,
the **preliminary answer key**, an objection window, and then the **final key**. Sakshi Education
and similar sites mirror the same PDFs.

**This is the big difference from the IPE bank.** IPE papers arrived as founder scans with no
official answers, so truth had to be audited by reading every card (198 physics cards, 15 real
errors). Here every question ships with the exam authority's own answer. That makes the solution
gate **mechanical**: our worked solution must land on the official key, or the card is flagged
before a student sees it.

It does not make the audit disappear. A solution can reach the right letter by wrong reasoning.
The key checks the destination, a reader still checks the road.

**Use the FINAL key, never the preliminary one.** Objections change answers. Every question records
which key it came from.

**To verify before transcription starts (do not assume):**
1. Which years are downloadable without a candidate login. The master papers and keys were public
   in recent years; older years may only exist on mirrors.
2. The printed subject order and question ranges in an actual engineering paper. The pattern is
   160 questions, Mathematics 80, Physics 40, Chemistry 40, one mark each, no negative marking.
   Read the ranges off the paper rather than trusting a coaching site's summary.
3. Whether a shift's paper and its key use the same question numbering. Some keys are published
   per booklet code with shuffled ordering.

## 3. Scale

Engineering runs two sessions a day across three days, so roughly **six shifts a year**.

| Span | Shifts | Questions |
|---|---|---|
| One shift | 1 | 160 |
| One year | ~6 | ~960 |
| 2022 to 2026 (start here) | ~30 | ~4,800 |
| Ten years | ~60 | ~9,600 |

Start with **Physics, 2022 to 2026**. Physics is 40 of the 160, so the first pass is roughly
1,200 questions, which is the size of a wave the authoring fleet already handles. Maths and
Chemistry follow; older years follow after that.

## 4. Layout

```
eapcet/
  papers/                     one file per shift, verbatim evidence
    tg_eapcet_2026_05_09_fn.json
    ...
    README.md
  tags.json                   the reviewed per-question tagging (chapter, family, difficulty)
  families.json               the family list, derived from tags.json and confirmed
```

**A new top-level directory, not a subfolder of `answer-book/`.** The Answer Book build does a
non-recursive read of `answer-book/questions/` and nothing globs `answer-book/**`, which is exactly
why `answer-book/papers/` is a sibling. A different product with a different schema and different
gates gets its own root rather than riding that exemption.

## 5. Schema `eapcet_paper_v1`

One file per shift. Example shape, not a real paper:

```jsonc
{
  "schema_version": "eapcet_paper_v1",
  "paper_id": "tg_eapcet_2026_05_09_fn",
  "exam": "tg_eapcet",
  "exam_label": "Telangana — Engineering, Agriculture and Pharmacy Common Entrance Test",
  "stream": "engineering",
  "year": 2026,
  "date": "2026-05-09",
  "session": "FN",                      // FN | AN
  "booklet_code": "...",                // as printed, or null
  "provenance": {
    "source_pdf": "TG_EAPCET_2026_Engg_09May_FN_QP.pdf",
    "key_pdf": "TG_EAPCET_2026_Engg_09May_FN_FinalKey.pdf",
    "key_source": "final",              // final | preliminary — final is required to publish
    "downloaded_from": "eapcet.tgche.ac.in",
    "transcribed_on": "2026-09-__",
    "transcribed_from": "the PDF itself, read page by page — never a prior transcription"
  },
  "exam_pattern": {
    "total_questions": 160,
    "duration_minutes": 180,
    "marks_correct": 1,
    "marks_wrong": 0,
    "subjects": [
      { "subject": "mathematics", "count": 80, "q_range": [1, 80] },
      { "subject": "physics",     "count": 40, "q_range": [81, 120] },
      { "subject": "chemistry",   "count": 40, "q_range": [121, 160] }
    ]
  },
  "questions": [
    {
      "q_no": 81,
      "subject": "physics",
      "text": "…the question exactly as printed…",
      "options": { "A": "…", "B": "…", "C": "…", "D": "…" },
      "key": "C",
      "key_note": null                  // set when the final key changed the preliminary answer
    }
  ]
}
```

**What is deliberately NOT in this file:** chapter, concept, family, difficulty, skill, our
solution. The paper file is evidence and must stay a faithful copy of a public document. Every
judgement we add lives in `tags.json`, which a human confirms row by row, exactly as
`answer-book/papers/matches.json` does for the IPE corpus.

## 6. The three gates

Mirror the IPE scripts, which already encode the hard-won failure modes.

| Script | Fails on |
|---|---|
| `check:eapcet` (from `check_ipe_papers.ts`) | schema version, filename mismatch, duplicate shift, missing provenance, question count against the declared pattern, gaps or duplicates in numbering, a question outside its subject range, an empty option, a key that is not A–D, ASCII maths where Unicode is required |
| `backtest:eapcet` (from `backtest_ipe_papers.ts`) | a corpus question with no tag row, a tag pointing at a family that does not exist, a family claimed in `families.json` that no question supports |
| `solve:eapcet --verify` (new) | our worked solution reaching an answer other than the official key |

The third gate is the one this corpus makes possible and the IPE bank never had.

## 7. Order of work

1. **Source (founder, about an hour).** Download master papers and final keys for 2022 to 2026
   into one folder, named by shift. This is the only step that cannot be delegated, and it is the
   only thing blocking step 3.
2. **Schema and gates (one session).** Create `eapcet/papers/`, port the two check scripts, add the
   npm entries. Nothing to transcribe against yet, so the gates are written before the content, not
   after.
3. **One shift, by hand, all 160 questions.** Verify every question and every key against the PDF.
   Measure how long it took. This is the pilot that prices the whole corpus, and it will find the
   schema fields this document guessed wrong.
4. **Fan out the remaining shifts.** One agent per shift, `model: sonnet` for transcription work
   per the standing lesson, then run the whole-corpus gates after each wave. A per-agent check is
   not the gate; measure the corpus, not the shift.
5. **Tag, then derive families.** Chapter and concept per question, proposed by an agent, confirmed
   by a human. Cluster into families. Publish the chapter frequency table. **This is the first
   output with product value** and it arrives before a single solution is written.
6. **Solve.** Our own worked solution per question, every one checked against the official key by
   the gate, with a reading audit on a sample for right-answer-wrong-reasoning.

Steps 1 to 5 are the useful half. A frequency-ranked family map with no solutions already powers
the diagnostic, the weakness card and the study priority. Solutions are what make the library a
browsable free tier.

## 8. Rules

1. **Transcribe from the PDF, every time.** Never from a previous transcription, never from a
   coaching book's reproduction of a paper.
2. **Verbatim.** Keep the exam's own wording and its inconsistencies. Normalising destroys evidence
   about how the paper is written.
3. **Unicode, never ASCII maths.** `ms⁻¹`, `10√2`, `60°`, `ω`, `μ`, `−` (U+2212). Same rule as the
   cards, and `check:eapcet` enforces it.
4. **The final key, or the question is not publishable.** A preliminary key may be transcribed, but
   `key_source` must say so and the solve gate must not run against it.
5. **Our restatement is what ships.** The corpus is the evidence file. Anything a student sees is
   our own wording and our own solution, the same rule the Answer Book already runs under.
6. **One shift per file, one question per row, no exceptions.** A half-transcribed paper is the
   failure the gates exist to prevent.
7. **State is a field, not a fork.** AP EAPCET runs the same 160-question pattern on the same
   subjects. `exam: "ap_eapcet"` is a second value, never a second codebase.

## 9. What this does NOT do

- It does not answer student doubts. Institute questions are unbounded and are solved live; the
  cache that saves money is built from student uploads, not from this corpus.
- It does not make the product legal to republish coaching material. Nothing from Sri Chaitanya,
  Narayana, Resonance or a local institute enters this directory.
- It is not a launch blocker for the doubt loop. The two tracks are independent and can run in
  parallel.

## 10. Related

`answer-book/papers/README.md` (the pattern this copies) · `src/scripts/check_ipe_papers.ts` ·
`src/scripts/backtest_ipe_papers.ts` · `docs/patterns/answer_book.md` (the enumeration thesis and
why back-testing the grid is not back-testing the output).
