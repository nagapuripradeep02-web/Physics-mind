# Transcription brief — TG EAPCET chemistry section

You transcribe the 40 chemistry questions (121–160) of ONE engineering shift from cropped images.
Your dispatch names the PAPER_ID. Everything else is here.

Images:  C:\Tutor\physics-mind-eapcet-corpus\eapcet\crops\<PAPER_ID>\
Output:  C:\Tutor\physics-mind-eapcet-corpus\eapcet\transcripts\<PAPER_ID>__chemistry.json

The crops directory also holds that paper's maths (q001–q080) and physics (q081–q120) images.
Ignore them. Read only q121 to q160.

## What the images are

One or two PNGs per question, `qNNN_0.png` and, when the question spans a page break,
`qNNN_1.png`. Read EVERY part of a question before transcribing it. When a second image exists the
options are usually in it, and an option is sometimes split so its number and mark sit at the
bottom of the first image while its text sits at the top of the second. Join them by position and
say so in the note.

**An option's TEXT is printed ABOVE its own number-and-mark line, not beside it and not below it.**
A line reading `3. ✔` belongs to the text block immediately ABOVE it. Pairing a mark with the text
below it has already produced a wrong answer on another paper, so read upward.

Every option carries a mark: a GREEN TICK on the correct one, a RED CROSS on the other three. The
2025 papers use a lighter green and a brighter red than older years, so read the mark's shape as
well as its colour.

**The 2025 papers print a box reading `Chosen Option : N`. That is NOT the answer.** It is the
option the real candidate picked when they sat the exam, so it matches the key only when that
candidate happened to be right. Ignore the box completely. The only thing that decides
`marked_correct` is which option label carries the GREEN TICK. This has already produced one wrong
answer on a chemistry paper, caught only because a second reader disagreed.

Each question prints TWICE: English first, then the same text in a second script (Telugu, or Urdu
on a few papers). Transcribe the ENGLISH ONLY.

## Method

Use the Read tool on each image in turn, q121 through q160. Do not skip any. Do not guess at
anything you cannot see. **Never report a file as absent without listing the directory in that
moment** — three agents on the physics pass called a continuation image missing while it sat on
disk, readable, and each sent a wrong answer toward a student bank.

Record per question:

- `q_no` — integer 121 to 160
- `question_en` — the English question text, verbatim. Real Unicode throughout: subscripts and
  superscripts in formulas (H₂SO₄, Ca²⁺, NO₃⁻), the degree sign, Δ, →, ⇌, ⁻¹, and the minus sign
  U+2212. Never ASCII transcription like "H2SO4", "->", "<=>", "deg" or "^2".
- `options_en` — exactly four strings, options 1 to 4 in order
- `marked_correct` — the integer 1 to 4 whose label carries the GREEN TICK
- `chapter` — one string copied exactly from the list below
- `year_cycle` — `"first_year"` or `"second_year"`, matching which list the chapter came from
- `confidence` — `"high"`, `"medium"` or `"low"`
- `note` — empty string unless something is genuinely wrong. Use exactly `"has diagram"` when a
  structure, graph or apparatus figure carries information the text does not. Say plainly if an
  image is unreadable, if no option shows a green tick, if the printed question contradicts
  itself, or if you joined split text. **Never write placeholder prose into an option.** A string
  like "(option 3 not visible)" passes every automatic check and arrives in front of a student as
  a real choice; a question you truly cannot read must fail loudly in `note` and `confidence`.
- If your own chemistry contradicts the option the paper marked, still record the marked option in
  `marked_correct`, and say so in the note. The official key is occasionally wrong and that is
  worth knowing, but it is not yours to overrule.

## Chapters (copy one string exactly)

First year: Atomic Structure | Classification of Elements and Periodic Properties | Chemical
Bonding | Stoichiometry | Thermodynamics | Chemical Equilibrium, Acids and Bases | s-Block
Elements | p-Block Elements: Group 13 | p-Block Elements: Group 14 | General Organic Chemistry |
States of Matter | Environmental Chemistry | Hydrogen and its Compounds

Second year: Solid State | Solutions | Electrochemistry | Chemical Kinetics | Surface Chemistry |
Metallurgy | VA Group Elements | VIA Group Elements | VIIA Group Elements | Noble Gases | d and f
Block Elements | Coordination Compounds | Polymers | Biomolecules | Chemistry in Everyday Life |
Haloalkanes and Haloarenes | Alcohols, Phenols and Ethers | Aldehydes, Ketones and Carboxylic
Acids | Organic Compounds Containing Nitrogen

## Do not look at the answer key

There is a file in this repository holding the official answers, extracted from the PDF by a
different method. **Do not open it, and do not let any answer influence what you record.** Your
reading of the green tick is only worth having because it is independent. The two readings get
compared afterwards, and a disagreement is how a defect gets found - that already caught a bug
that had a quarter of one year's answers wrong. An agent that checks itself against the key
turns that comparison into a rubber stamp.

Record what the page shows. If your own working disagrees with the mark, that is a finding: keep
the mark and say so in the note.

## Output

Write ONE JSON file to the output path, shaped exactly:

    {"paper_id": "<PAPER_ID>", "subject": "chemistry", "questions": [ {...}, ... ]}

all 40 objects, ascending `q_no`. Writing the file is the deliverable — write it before you reply,
then confirm it exists and parses.

Accuracy matters more than speed. This becomes the bank a student studies from, so a wrong
transcription is worse than a flagged one. Never invent a formula, a number or an option you
cannot read. When unsure, set confidence `"low"` and explain in the note.

Reply with only: the count written, the count at each confidence level, and any q_no that gave
trouble. Do not paste the JSON.
