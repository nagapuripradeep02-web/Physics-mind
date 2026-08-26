# Quick Learn — Exam-First Strategy & the Exam Notebook Product
*Filed 2026-08-19 from the founder ⟷ Claude strategy session (desk `physics-mind-quick-learn`).*
*Status: PROPOSED — founder engaged and directionally positive; no build decision taken yet except the latency fixes (SHIPPED, see §1). Everything else awaits an explicit founder go.*

---

## 0. Origin — the review that started this

A real student (finished intermediate, entering B.Sc. first year) used Quick Learn and said:
**"I'm able to understand the concept, but it's really boring — the gap while speech is produced is too long."**

Two things in one sentence: the learning works ("I understand"), the packaging was built for the
wrong moment ("boring"). The first half was fixed the same day with engineering (§1). The second
half opened the strategy question this document answers (§2 onward).

---

## 1. SHIPPED — the voice latency fixes (2026-08-19, commits `347db1a` + `b5911b4`)

The measured chain was: DeepSeek answers non-streaming (~2.5 s) → whole message synthesized as
ONE Sarvam bulbul:v3 REST call (~3–5 s) → returned as base64 WAV (~57 KB per spoken second; a
30 s line ≈ 1.7 MB download). Nothing overlapped.

**Fix 1 — pre-rendered clips.** Every scripted line (welcome, mission instructions, hints,
celebrations, replay prompts, explore line — 79 lines across the 3 lessons) is synthesized once
at build time and shipped as a static mp3 the page plays **instantly**. Committed hash-keyed
cache at `tts_audio/quicklearn/<concept>/` (Rule 30h — one Sarvam bill per line, ever; rebuilds
proven 0-new). One spoken-text transform (`qlSpeakable`) is real module code serialized into the
page, so build-time keys and runtime keys are identical by construction. Only free-form DeepSeek
answers remain on the live path. Bonus: the `website/learn` variant (which has no `/api/tts` at
all) gets the real priya voice for the first time.

**Fix 2 — mp3 on the live path.** Probe finding: Sarvam REST silently **ignores** `audio_format`
(the old `'wav'` was a no-op); the honoured param is `output_audio_codec`. Live answers now
return mp3 at ~⅓ the bytes (94,124 → 32,600 measured). KV key prefix bumped v1→v2 so stale WAV
can never serve under the mp3 mime.

**Deliberately deferred (Fixes 3–5):** sentence-chunked TTS · streamed DeepSeek (start speaking
at the first sentence) · bulbul:v2 switch (half price — but **v2 has no `priya` speaker**, so it
changes the product voice; one deliberate by-ear decision covering clips + live together).

**Founder steps outstanding:** ear-walk both lessons · `wrangler deploy -c ql-deploy/wrangler.toml`
(activates mp3 live) · `npm run deploy:cf-site` · re-demo to the same student.

---

## 2. The market question, answered honestly

Founder's framing: TS + AP intermediate ≈ 20 lakh students/year. Maybe 0.5% (5–10k) genuinely
want to *understand* concepts with an AI + simulation. The majority:

| Segment | Size | What they actually want | When they study |
|---|---|---|---|
| A. JEE/EAMCET grinders | ~5–10% | Doubts at 11 pm; concepts coaching rote-fed but never made click | All year (coaching-owned: Sri Chaitanya / Narayana / Aakash) |
| B. IPE last-minute crammers | **majority** | Pass / good marks with minimum time; "important questions" | 1–4 weeks before IPE, quarterly, half-yearly |
| C. Internal-exam-only | rest | Same as B, smaller periodic spikes | Exam weeks |

**The honest position:** students do not buy understanding — they buy marks, rank, and relief
from fear. The 0.5% learner segment is a real beachhead (10k students is viable revenue), but a
product framed as "understand the concept" stays niche forever. **The move is NOT converting
crammers into learners. It is serving the cramming moment and smuggling the understanding
inside it.** No product on earth has made crammers study in October; meet them in February.

**The wedge:** IPE is famously predictable — papers repeat patterns; every student already hunts
"important questions" PDFs. Reframe the same sims behind an exam door:

> "The 7 questions that come every year from this chapter — each explained in 2 minutes with a
> moving picture, plus the exact answer format that gets full marks."

The `pyq_compare` trap-then-truth mechanism and the JEE-2024 proton-vs-deuteron state (built
2026-08-15) are already this pattern for JEE. The IPE 8/4/2-mark bank is the same pattern at
50× the audience.

---

## 3. The Exam Notebook — the crammer product (founder's concept, jointly designed)

### 3.1 The student experience

1. Student uploads a photo of (or picks) an 8-mark / 4-mark / 2-mark question.
2. A **real-notebook UI**: ruled paper, handwriting font (Kalam — Indian Type Foundry, reads
   like an Indian student's hand), ink-blue text.
3. The model answer **writes itself line by line** (typewriter-style reveal per line; true
   stroke animation like vara.js is optional later polish).
4. **Marks accumulate in the left margin** like a teacher's red pen: "state the law **+1**" ·
   "write the formula **+1**" · "complete the derivation **+2**" · "diagram **+1**" — climbing
   to the full 8. This is the most motivating element on the page.
5. If the question demands a diagram, it **draws itself stroke by stroke** on the paper, in the
   order a human would draw it, synchronized with the step that earns its mark (§4).
6. **Click any line** → the tutor explains it + gives the memory tip for that step (reuses the
   existing quicklearn-chat backend, persona, caps, and cost logging — zero new infra).
7. Every step can deep-link into the concept sim ("watch why this formula is true — 90 s") —
   the smuggled understanding.

### 3.2 The confidence loop — the piece that beats the printed guide

Reading feels like studying; **retrieval is studying** (the most evidence-backed learning effect
there is). The night-before terror is not "I don't have the answer" — it is "will it come out of
my pen at 9 am?" So after the answer writes itself:

- **Learn → Hide → Attempt → Score.** "Now you try": steps hidden, student ticks/types/speaks
  what they'd write, revealed step-by-step against the mark scheme — "You'd have scored 5/8;
  you missed the diagram mark and the final substitution. Here's the tip. Try again."
  8/8 on the second attempt at 11 pm IS the confidence.
- **The 6 am re-ping.** "90-second check: can you still write the 4 formula lines?" One
  overnight re-test roughly doubles retention.

### 3.3 Architecture — the bank, not the brain (the critical inversion)

The founder's worry — "how does the AI always know the mark scheme for ANY random question?" —
dissolves once inverted: **the AI doesn't need to know everything; the bank does.** A live LLM
writing mark schemes on the fly WILL be wrong sometimes, and a crammer who memorizes a wrong
answer never trusts us again. Rule 17/18 already forbids it.

The IPE corpus is finite: across Class 11+12 Physics roughly **~50 LAQs (8-mark), ~150 SAQs
(4-mark), ~200 VSAQs (2-mark) ≈ 400 bank entries.** Marking steps are already encoded in every
Vikram/Deepthi-style guide and BIE schemes. Each entry is authored ONCE (agent drafts → human
lecturer verifies — the existing pipeline doctrine) as structured data:

```json
{ "question": "...", "marks": 8, "chapter": "...",
  "steps": [
    { "text": "State the law: ...", "marks": 1, "type": "statement", "memory_tip": "..." },
    { "text": "F = qvB sinθ",       "marks": 1, "type": "formula",   "memory_tip": "..." },
    { "text": "derivation lines...", "marks": 2, "type": "derivation" },
    { "diagram": "diagrams/xyz.svg", "marks": 1, "type": "diagram" }
  ],
  "sim_link": "quicklearn/magnetic_force_moving_charge#STATE_3" }
```

Serving path:
```
photo/text → Gemini Flash vision extracts the question   (already in stack)
           → pgvector embedding match against the bank    (already in stack)
  HIT  (expected 95%+ of real usage): serve the verified entry → notebook renderer
  MISS: "we'll add this — check tomorrow" + it enters the authoring queue
        (every miss = demand telemetry; the bank grows exactly where students ask)
```
Low-confidence matches show the 3 closest questions and let the student tap the right one
(students like seeing "these related ones come too"). If a live-generated draft is ever served,
it wears an explicit **"AI draft — not yet teacher-verified"** badge; verified entries carry a
✅ badge. The crammer's trust is the entire asset.

**Cost:** a bank hit ≈ one embedding + occasional vision call — fractions of a paisa. This is
the pre-solve inversion already priced in the 2026-08-18 session (uncapped photo-solve
₹350–1,164/student/month vs pre-solving the finite corpus ≈ ₹400 one-time).

---

## 4. Diagrams — drawn live on screen, never invented live

The distinction: **real-time drawing (the experience) — always. Real-time inventing (AI deciding
the shape at view time) — never.**

- Each diagram is stored as an ordered **stroke list** (SVG paths), authored offline: an agent
  drafts, a human approves once, frozen forever (Rule 18: AI composes the draft, human gates,
  engine serves deterministically).
- The browser's `stroke-dashoffset` animation reveals each path end-to-end at pen speed —
  indistinguishable from a hand sketching it; full diagram in 3–5 s; pixel-perfect every time;
  zero serve-time cost.
- Strokes are data, so the diagram stays alive: the force-arrow stroke draws at the exact moment
  the "+1 force arrow" step writes; click the θ arc → the tutor explains just that; stroke ORDER
  itself becomes a memory aid (remember what you drew first, second, third).
- Library size is small: IPE questions massively share diagrams (AC generator, cyclotron, meter
  bridge, Young's double slit, transformer, galvanometer…) — **~100–150 distinct diagrams cover
  the whole two-year bank.**
- Out-of-bank fallback, if ever: AI *places* shapes from a reviewed primitive vocabulary
  (arrows, coils, meters, labeled angles — the PCPL mindset), badge-marked. Conductor, not
  composer — the voice-professor pattern.

---

## 5. Differentiation vs the printed guides (Sri Chaitanya / Narayana / Vikram / Deepthi)

If the product is the guide's answer on a screen, **it loses** — the guide is ₹200, offline,
teacher-endorsed, already on the desk. The product is the things paper physically cannot do:

| The guide | Us |
|---|---|
| Shows the answer | **Checks whether YOU can reproduce it** (hide → attempt → score) |
| Frozen text | Click any line → "why?" answered at 11 pm |
| Static diagram | Diagram draws itself in memory-aiding stroke order |
| Same 60 questions for everyone | "12 hours left, 3 weak chapters → these 9 questions, in this order" |
| Measures nothing | Knows which tips worked and which steps you keep forgetting |

### 5.1 Photo-of-the-guide mode — the strategic reframe (founder's idea, endorsed)

Student uploads the guide's own printed answer: *"teach me to write and remember THIS."* We stop
competing with the coaching guides and become **the layer that makes their guide stick**: we
return the step-marks breakdown, memory hooks, the self-test loop, the drawn diagram — on
content the student already trusts. No authoring race; works day one on any question in any
guide. Run it alongside the verified bank (bank = fast + badged; photo-mode = universal
fallback).

**Hard caveat (recorded):** processing a student's own photo for their own study is their use —
but **our stored bank must be authored from the syllabus and past papers, never scraped from
publishers' guides.** Publisher text never becomes our content.

---

## 6. Memory-tip expertise — engineered, not hoped for

1. **A tip taxonomy authored once** and enforced in authoring + the photo-mode prompt:
   first-letter chains for step sequences · story-method for derivation flow · the diagram as
   the memory palace (drawing order) · formula triangles · unit-check recovery ("forgot the
   formula? rebuild it from units") · contrast pairs ("students confuse this with the cyclotron
   derivation — the difference is X") · examiner-eye flags ("the mark most students lose here
   is the negative sign").
2. **Bank tips are written at authoring time and human-reviewed** — live generation only in
   photo-mode, constrained by the taxonomy.
3. **The measured-forgetting loop (a moat):** the self-test reveals which tip actually worked —
   did the student recall the step that tip covered? Failing tips get rewritten. Within one
   exam season: measured memorability per tip per question. Same family as the confusion log.
4. Honest limit: mnemonics excel at sequences/facts, weaker on derivations — there the strongest
   "trick" is seeing the pivotal move happen, i.e. the sim link earns its keep even for crammers.

---

## 7. Supporting features (the rest of the crammer bag)

- **Chapter sprint:** "Chapter 6, 45 minutes left" → auto-playlist of top questions by expected
  marks.
- **Choice math:** IPE gives internal choice — "learn these 5 of the 8 LAQs and you're
  statistically covered" is a sentence crammers screenshot.
- **Writing-time mode:** an 8-mark answer must fit ~10–12 minutes of real handwriting; a timer
  mode that proves you can.
- **The morning sheet:** auto-generated one-page formula + diagram-skeleton per chapter —
  printable, screenshottable, born to be forwarded. The growth loop disguised as a feature.

Full arc: photo/pick → answer writes itself with marks accumulating → diagram draws itself →
tips per step → hide-and-attempt until 8/8 → 6 am re-ping → morning sheet in the pocket.
That doesn't just make them FEEL confident — it makes them CORRECT to feel confident, which is
what brings them back next exam and gets us named in the class WhatsApp group.

---

## 8. Distribution & dependence (TS + AP first, then other states)

Dependence = being there at the moment of panic and being reliably faster than YouTube-at-1.5×,
a senior's notes, or ChatGPT's wall of text.

1. **The exam calendar is the marketing calendar:** quarterlies (Sept) → half-yearlies (Dec) →
   pre-finals (Jan) → IPE (Feb–Mar) → EAMCET (May). Chapter-wise "last-week plans" pushed on
   that rhythm.
2. **WhatsApp is the channel.** Quick Learn is already a one-link lesson; optimize the first
   30 seconds of every page for the "bro this explained the 8-mark rotation question in 2
   minutes" forward.
3. **Lecturers are the trust layer** (the existing students-through-teachers thesis, doubly true
   in exam month — one lecturer's "watch these 5 before the internal" converts a section).
4. **Free during exam fever, paid for depth:** the IPE crammer wave rides free — that's where
   two-state fame comes from ("it saved me before the exam" is the only sentence that matters).
   Monetize the grinder segment: EAMCET/JEE depth, photo-solve beyond a daily cap.

**What NOT to do (recorded):** no gamification (streaks/coins/leaderboards) before the
exam-moment fit is proven · don't try to make crammers study in October · don't confuse famous
with used.

---

## 9. Validation ladder (cheap → committed)

1. **The demo page** *(offered, ~hours)*: one self-contained HTML file — notebook paper, an
   8-mark answer writing itself in Kalam, mark chips accumulating in the margin, the
   moving-charge diagram drawing itself stroke-by-stroke, then "Now you try" scoring the
   attempt. No backend. Settles "is the UI good enough" by looking at it.
2. **The vertical slice** *(one chapter, ~15 bank entries)*: pick a chapter that already has a
   sim (e.g. current electricity) — bank schema + matcher (pgvector) + notebook renderer +
   click-to-explain + one drawn diagram, wired into the existing Quick Learn infra.
3. **The drip test, re-aimed:** the queued 5-student/one-link-a-day plan, recruited deliberately
   across segments — 2 crammers, 2 average, 1 aspirant. Crammers get the exam-framed link,
   the aspirant the concept-framed one. Completion + dwell answers the 0.5% question with
   numbers instead of guesses.

---

## 10. Open founder decisions

| # | Decision | Notes |
|---|---|---|
| 1 | Green-light the demo page (§9.1)? | Cheapest possible look at the whole thesis |
| 2 | Next authoring effort: IPE important-questions layer on the existing 3 lessons, vs a 4th concept? | The crammer test made real |
| 3 | Fixes 3–5 of the latency ladder (chunking, streaming, bulbul:v2 voice change)? | v2 = half price but no `priya` — by-ear decision |
| 4 | Lecturer reviewer for the bank's mark schemes (the Asmi-gate for exam answers)? | The verification badge depends on it |
| 5 | Board-answer format touches Rule 20 (board mode SUSPENDED for the teacher product) — this student surface needs its own explicit carve-out ruling | Doctrine hygiene |
