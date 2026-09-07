# Transcription brief — TG EAPCET physics section

You transcribe the 40 physics questions (81–120) of ONE engineering shift from cropped images.
Your dispatch names the PAPER_ID. Everything else is here.

Images:  C:\Tutor\physics-mind-eapcet-corpus\eapcet\crops\<PAPER_ID>\
Output:  C:\Tutor\physics-mind-eapcet-corpus\eapcet\transcripts\<PAPER_ID>.json

## What the images are

One or two PNGs per question, `qNNN_0.png` and, when the question spans a page break,
`qNNN_1.png`. Questions run q081 to q120. Read EVERY part of a question before transcribing it.
When a second image exists the options are usually in it, and an option's text is sometimes
split so that its number and mark sit at the bottom of the first image while its text sits at
the top of the second. Join them by position and say so in the note.

Each question prints TWICE: English first, then the same text in Telugu script. Transcribe the
ENGLISH ONLY. Ignore the Telugu.

An option's TEXT is printed ABOVE its own number-and-mark line, not beside it and not below
it. A line reading `3. ✔` belongs to the text block immediately ABOVE it. Pairing a mark with
the text below it has already produced a wrong answer on one paper, so read upward.

Every option carries a mark: a GREEN TICK on the correct one, a RED CROSS on the other three.
Record which option number carries the green tick. The 2025 papers use a lighter green and a
brighter red than older years, so read the mark's shape as well as its colour.

## Method

Use the Read tool on each image in turn, q081 through q120. Do not skip any. Do not guess at
anything you cannot see.

Record per question:

- `q_no` — integer 81 to 120
- `question_en` — the English question text, verbatim. Real Unicode for maths and units
  (° μ Ω ² ⁻ × ± → and the minus sign U+2212), never ASCII like "deg", "^2" or "->".
- `options_en` — exactly four strings, options 1 to 4 in order
- `marked_correct` — the integer 1 to 4 whose label carries the GREEN TICK
- `chapter` — one string copied exactly from the list below
- `year_cycle` — `"first_year"` or `"second_year"`, matching which list the chapter came from
- `confidence` — `"high"`, `"medium"` or `"low"`
- `note` — empty string unless something is genuinely wrong. Say plainly if an image is
  unreadable, if no option shows a green tick, if the printed question contradicts itself, or
  if you joined split text. Use exactly `"has diagram"` when a diagram or graph carries
  information the text does not.

## Chapters (copy one string exactly)

First year: Physical World and Measurement | Motion in a Straight Line | Motion in a Plane |
Laws of Motion | Work Power Energy | System of Particles and Rotational Motion | Oscillations |
Gravitation | Mechanical Properties of Solids | Mechanical Properties of Fluids | Thermal
Properties of Matter | Thermodynamics | Kinetic Theory | Physics of Emerging Technologies

Second year: Waves | Ray Optics and Optical Instruments | Wave Optics | Electric Charges and
Fields | Electric Potential and Capacitance | Current Electricity | Moving Charges and
Magnetism | Magnetism and Matter | Electromagnetic Induction | Alternating Current |
Electromagnetic Waves | Dual Nature of Radiation and Matter | Atoms | Nuclei | Semiconductor
Electronics | Communication System

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

    {"paper_id": "<PAPER_ID>", "questions": [ {...}, ... ]}

all 40 objects, ascending `q_no`. Writing the file is the deliverable — write it before you
reply, and confirm afterwards that it exists and parses.

Accuracy matters more than speed. This becomes the bank a student studies from, so a wrong
transcription is worse than a flagged one. Never invent a formula, a number or an option you
cannot read. When unsure, set confidence `"low"` and explain in the note.

Reply with only: the count written, the count at each confidence level, and any q_no that gave
trouble. Do not paste the JSON.
