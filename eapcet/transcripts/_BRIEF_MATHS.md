# Transcription brief — TG EAPCET mathematics section

You transcribe HALF of the 80 mathematics questions of ONE engineering shift from cropped images.
Your dispatch names the PAPER_ID and your question RANGE, either 1–40 or 41–80. Everything else is
here.

Images:  C:\Tutor\physics-mind-eapcet-corpus\eapcet\crops\<PAPER_ID>\
Output:  C:\Tutor\physics-mind-eapcet-corpus\eapcet\transcripts\<PAPER_ID>__maths_<PART>.json
         where <PART> is `1` for questions 1–40 and `2` for questions 41–80.

Another agent is transcribing the other half of this same paper into the other file. Write only
your own file and never touch theirs. The crops directory also holds that paper's physics
(q081–q120) and chemistry (q121–q160) images. Ignore everything outside your range.

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

Each question prints TWICE: English first, then the same text in a second script (Telugu, or Urdu
on a few papers). Transcribe the ENGLISH ONLY.

## Method

Use the Read tool on each image in turn, across your whole range. Do not skip any. Do not guess at
anything you cannot see. **Never report a file as absent without listing the directory in that
moment** — three agents on the physics pass called a continuation image missing while it sat on
disk, readable, and each sent a wrong answer toward a student bank.

Record per question:

- `q_no` — the integer, inside your assigned range
- `question_en` — the English question text, verbatim. Mathematics is the hard part here: use real
  Unicode throughout — π θ α β Σ ∫ √ ≤ ≥ ≠ ∞ ∈ ⊂ ∪ ∩ ⇒ → ± × ÷ · ∠ ° and superscripts/subscripts
  (x², aⁿ, x₁). Never ASCII transcription like "pi", "sqrt", "^2", "->", "<=", "integral".
  Write fractions inline as a/b when they are simple, and keep the printed grouping exactly:
  (a + b)/(c + d) is not a + b/c + d. Matrices and long expressions must preserve their structure;
  if a layout genuinely cannot be written linearly, describe it precisely and lower the confidence.
- `options_en` — exactly four strings, options 1 to 4 in order
- `marked_correct` — the integer 1 to 4 whose label carries the GREEN TICK
- `chapter` — one string copied exactly from the list below
- `year_cycle` — the paper the chapter belongs to: `"1a"`, `"1b"`, `"2a"` or `"2b"`
- `confidence` — `"high"`, `"medium"` or `"low"`
- `note` — empty string unless something is genuinely wrong. Use exactly `"has diagram"` when a
  figure or graph carries information the text does not. Say plainly if an image is unreadable, if
  no option shows a green tick, if the printed question contradicts itself, or if you joined split
  text. **Never write placeholder prose into an option.** A string like "(option 3 not visible)"
  passes every automatic check and arrives in front of a student as a real choice; a question you
  truly cannot read must fail loudly in `note` and `confidence`.
- If your own working contradicts the option the paper marked, still record the marked option in
  `marked_correct`, and say so in the note. The official key is occasionally wrong and that is
  worth knowing, but it is not yours to overrule.

## Chapters (copy one string exactly)

Maths 1A (`year_cycle` = "1a"): Sets and Relations | Functions | Sequences and Series |
Mathematical Induction | Matrices | Addition of Vectors | Product of Vectors | Trigonometric
Ratios and Transformations | Trigonometric Equations | Inverse Trigonometric Functions |
Hyperbolic Functions | Properties of Triangles

Maths 1B (`year_cycle` = "1b"): Locus | Transformation of Axes | The Straight Line | Pair of
Straight Lines | 3D Coordinates | Direction Cosines and Direction Ratios | The Plane | Limits and
Continuity | Differentiation | Applications of Derivatives

Maths 2A (`year_cycle` = "2a"): Complex Numbers | De Moivre's Theorem | Quadratic Expressions |
Theory of Equations | Permutations and Combinations | Binomial Theorem | Partial Fractions |
Measures of Dispersion | Probability | Random Variables and Probability Distributions

Maths 2B (`year_cycle` = "2b"): Circle | System of Circles | Parabola | Ellipse | Hyperbola |
Integration | Definite Integrals | Differential Equations

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

Write ONE JSON file to your output path, shaped exactly:

    {"paper_id": "<PAPER_ID>", "subject": "maths", "part": <PART>, "questions": [ {...}, ... ]}

all 40 objects of your range, ascending `q_no`. Writing the file is the deliverable — write it
before you reply, then confirm it exists and parses.

Accuracy matters more than speed. This becomes the bank a student studies from, so a wrong
transcription is worse than a flagged one. Never invent a formula, a number or an option you
cannot read. When unsure, set confidence `"low"` and explain in the note.

Reply with only: the count written, the count at each confidence level, and any q_no that gave
trouble. Do not paste the JSON.
