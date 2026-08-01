# EXEMPLAR_RUBRIC.md — the ceiling-raising ledger
# **[UNRATIFIED DRAFT — v0.1, 2026-08-01 — GOVERNS NOTHING]**

# PIPELINE_V2_PLAN.md §2 Phase 4. Counterpart to `engine_bug_queue`: the scar list
# ratchets the FLOOR, this is the intended CEILING ratchet — once the founder ratifies it.

---

## ⚠ READ THIS BEFORE USING ANY PART OF THIS FILE

**This file is not doctrine. It was drafted by an agent, and the founder has not reviewed it.**
It is NOT a gate, NOT a rule, and it is cited by no spec. `.agents/founder_proxy/CLAUDE.md` is
**unchanged** — founder_proxy does not read this file and does not score against it. Nothing in the
pipeline behaves differently because this file exists.

Its sections are not equally trustworthy. Know which you are reading:

| § | What it is | Trust level |
|---|---|---|
| **§1** | Structure **measured** from the three exemplar JSONs on 2026-08-01 (sentence counts, glow bindings, word counts, aha positions) | **Fact.** Re-measurable; if you doubt a number, re-run it rather than believing it. |
| **§2** | Founder rejections **quoted verbatim** from the commits that fixed them, each with its SHA | **Fact.** The founder's actual words, verifiable with `git log -1 <sha>`. |
| **§3** | A scored sheet — the ten dimensions, the 0/1/2 anchors, and the thresholds | **PROPOSAL, invented by an agent.** The dimensions are derived from §1/§2 and are arguable; **the thresholds and the weighting are guesses with no founder input at all.** |
| **§4** | The fence — where the exemplars conflict with current rules | **Fact**, but each row is a rule-vs-artifact comparison worth re-checking against live CLAUDE.md. |
| **§5** | How the ledger is meant to grow | **Proposal.** |
| **§6** | The four open questions | The actual status. Read it before §3. |

**Do NOT, on the strength of this file:** score a concept and report the number as if it carried
authority · fail, block, or FIX a concept for a low score · cite a "threshold" to the founder as a
standard · quote §3 as a rule in an agent dispatch · treat the three exemplars as approved templates
without reading §4 first.

**Do use it for:** the measured facts in §1, the rejection history in §2, and the fence in §4 —
all three are evidence and stand on their own regardless of whether §3 is ever ratified.

Only the founder can lift this banner, by settling §6. Until then, treat §3 as a conversation
starter someone left on the table — not as a standard anyone agreed to.

---

## §0 — Why this exists

`engine_bug_queue` turns every defect the reviewer ever caught into a permanent probe, so the same
mistake cannot ship twice. It compounds. There is no equivalent for excellence: every gate answers
*"is this broken?"*, and only the founder answers *"is this excellent?"* — an answer that evaporates
when the session ends.

founder_proxy plays that review, but its Pass-4 list (`.agents/founder_proxy/CLAUDE.md`) is **entirely
a defect list** — 15 bullets, every one of them "X is wrong". Nothing in the pipeline describes what
GOOD looks like. A sim can clear every bullet and still be mediocre.

This file is the positive half. Two inputs, both evidence:

1. **What the three exemplars actually share**, measured from their JSON — not remembered.
2. **What the founder has actually rejected**, quoted from the review commits that fixed it.

Every row cites its source. A row with no exemplar and no rejection behind it does not belong here.

---

## §1 — What the exemplars measurably share

Measured 2026-08-01 across `faraday_law_induction`, `resistivity`, `magnetisation_and_intensity`:

| | faraday | resistivity | magnetisation |
|---|---|---|---|
| states | 6 (5 guided + explore) | 6 (5 guided + explore) | 6 (5 guided + explore) |
| primitives / state | 3, 3, 3, 3, 3, 3 | 3, 3, 4, 4, 4, 3 | 3, 3, 3, 3, 3, 3 |
| narration sentences / state | 3 | 3 (explore 1) | 3 |
| sentences with a `glow` binding | **3/3 every state** | **3/3 every state** | **3/3 every state** |
| EN words / guided state | 67–94 | **40–56** | 54–71 |
| aha lands at | STATE_2 of 6 | STATE_3 of 6 | STATE_3 of 6 |
| `misconception_watch` states | 5 of 6 | 3 of 6 | 2 of 6 |
| final state | `interaction_complete` | `interaction_complete` | `interaction_complete` |

Four things are unanimous and are the spine of this rubric:

**1. Every narration sentence points at exactly one on-canvas element.** Measured across all three
concepts: **52 sentences, 0 without a `glow` binding.** Not "most" — all of them. This is the single
most consistent property of the fleet's best work, and nothing in the pipeline currently checks it.

**2. Element economy — excellence is not more stuff.** The exemplars sit AT Rule 19's floor of 3
primitives, not above it. `resistivity` reaches 4 only in the three states that carry a live
instrument. A cluttered state is not a richer state.

**3. The payoff comes EARLY.** The aha lands at state 2 or 3 of 6 — the first half, never the
climax. The states after it extend and qualify the result; they do not build suspense toward it.
This is counter-intuitive and it is unanimous.

**4. One new quantity or relationship per state, introduced in the order the equation is built.**

- `resistivity`: vary L → vary A → **the invariant (R = ρL/A: geometry moved, ρ did not)** → what ρ
  is → what moves ρ → explore. *Vary the things that don't matter first, then reveal the thing that
  doesn't move.*
- `faraday`: define the quantity → the effect appears → the effect reverses → why the sign → what
  sets the size → explore.
- `magnetisation`: cause alone → insert the object → the mechanism → the combined law → the taxonomy
  → explore.

Where they DISAGREE, follow the later two: `faraday` tags `misconception_watch` on 5 of 6 states,
while `resistivity` and `magnetisation` place it at 2–3 genuine pivots. Sprayed misconception tags
are vintage, not craft.

---

## §2 — The rejection ledger

Real founder rejections, verbatim, with the commit that fixed each. This is the section that GROWS —
every future rejection appends a row. Six entries at birth:

| # | Founder's actual words / verdict | Principle it establishes | Commit |
|---|---|---|---|
| R1 | *"S3 and S4 taught the same thing… No new physics entered."* The state was **cut**, not fixed. | **A state must not be derivable from the state before it.** The fixing commit says so outright: *"Nothing in the pipeline asks whether a state is derivable from the state before it. Worth a rule."* | `a039841` |
| R2 | *"the block rendered as translucent glass… the force vectors read as too short/timid to teach with"* | **Physical objects stay solid; only overlays may dim.** The taught object must be readable from the back of a classroom. | `35fab8a` |
| R3 | *"After releasing from the spring the block is not moving away… It should have a little bit free motion after the spring releases."* | **Motion is physically complete** — the aftermath is part of the lesson, not just the event. | `5a25b5b` |
| R4 | The interaction lasted 420 ms of an ~11 s state; *"for 96% of the state there was nothing on screen"* — and the canonical reviewer frame landed in that dead zone. | **The lesson occupies the state's duration**, and the canonical frame lands on content. | `166d4d4` |
| R5 | *"the apparatus fills the frame instead of floating in empty canvas — the single biggest contributor to 'the vectors are not really visible'"* | **Framing is a teaching decision.** Loose framing shrinks everything regardless of how well the elements are authored. | `1acd7a1` |
| R6 | *"The spring is moving with the block. It should be locked to the wall."* · *"You did not define m1, m2 with the numbers. You gave two unequal masses, but which one is heavier?"* | **Apparatus is anchored to whatever physically holds it, and every quantity the lesson depends on is on screen with its number.** | `3994084` |

Note R1's importance: it is the only one of the six that **every automated gate passed**. Rule 31
requires a distinct motion *archetype* per state, not a distinct *idea* — so a state that re-taught
its predecessor cleared Gate 3e/3f, eye-walker and quality_auditor. That is precisely the class of
failure this rubric exists to catch.

---

## §3 — The scored sheet  **[UNRATIFIED — an agent's proposal, not a standard]**

> **If you arrived here directly, read the banner at the top of this file first.** Nothing below is
> agreed doctrine. founder_proxy does NOT use this sheet — its spec does not reference this file.
> The ten dimensions are derived from the evidence in §1/§2 and are arguable; **the 0/1/2 anchors
> and especially the thresholds are invented, with zero founder input.** Do not score a concept and
> present the number as authoritative, and do not fail anything on it.

Once ratified, founder_proxy would fill this at **Checkpoint A** (design — D1/D2/D8/D9/D10 are all
answerable from a skeleton) and again at **Checkpoint B** (build — all ten). Score each 0 / 1 / 2:

> **0 = the founder would reject it · 1 = acceptable, unremarkable · 2 = exemplar-grade**

| # | Dimension | 0 | 1 | 2 | Source |
|---|---|---|---|---|---|
| **D1** | **Information gain** — is any state derivable from the one before it? | a state re-teaches its predecessor with new staging | every state adds something, one is thin | every state is load-bearing; cutting any one breaks the lesson | R1 |
| **D2** | **Arc grammar** — one new quantity/relationship per state, in the order the equation is built | states could be reordered without loss | mostly ordered, one state out of place | the order IS the derivation; the aha lands in the first half | §1.3, §1.4 |
| **D3** | **Narration→canvas binding** — every sentence points at exactly one element | sentences with no `glow` | most bound | **100% bound**, one focal per sentence | §1.1 |
| **D4** | **Element economy** | >5 primitives, or elements that teach nothing | 4–5, all justified | 3–4, each load-bearing | §1.2 |
| **D5** | **Apparatus conviction** — solid objects, anchored, frame-filling | translucent/floating/unanchored apparatus; timid vectors | readable but loose | solid, anchored to what holds it, fills the frame | R2, R5, R6 |
| **D6** | **Quantity legibility** — every quantity the lesson depends on is on screen with its number | the state's central quantity is unlabelled or unnumbered | present but small/awkward | every named quantity has a live number where a teacher glances | R6 |
| **D7** | **Motion completeness** — the physical aftermath, and the lesson occupies the duration | dead zone over most of the state; motion truncated | brief dead zone; aftermath clipped | motion runs to its physical conclusion and repeats; canonical frame on content | R3, R4 |
| **D8** | **Misconception placement** | none, or sprayed across every state | present, loosely placed | at 2–3 genuine pivots where the wrong belief actually bites | §1 table |
| **D9** | **Title as a teaching claim** — states the result, in plain literal English | topic label ("Length"), OR idiom/metaphor/authoring scaffolding | states the result, wording adequate | states the result in Rule 41 plain English, meaning in the first words | §4 below |
| **D10** | **Explore earns its place** | a sixth guided state wearing an explore label | all sliders, little to discover | every dial changes something a teacher would actually demonstrate | §1 table |

**Threshold SKETCH — invented numbers, no founder input, currently binding on nothing (§6.1):**

These are a starting point for a conversation, not calibrated values. They were not derived from
anything — no scored corpus exists yet, and no past concept has been run through this sheet. Read
them as "roughly this shape, argue with the numbers":

- Any **0** — the sketch treats this as disqualifying. Unverified: whether a single 0 in a minor
  dimension really matches what the founder would reject is exactly what §6.1 asks.
- **< 13/20** — sketch value for "not exemplar-grade".
- **≥ 17/20 with no dimension below 1** — sketch value for "exemplar-grade".

All three numbers are guesses, and the weighting question underneath them (is D1 worth more than
D4?) is untouched. **Do not quote these figures to anyone as a standard.**

Even ratified, the intended design is **report-only**: founder_proxy would still return its normal
verdict, and the sheet's job would be to make "this is fine but not good" a reportable finding
instead of a silent APPROVE. Whether it ever gates anything is §6.4, and is the founder's decision.

---

## §4 — The fence: what NOT to clone from the exemplars

**This section is as important as §1.** All three exemplars predate the rules now in force. An agent
told "score against these three" without this fence will learn the wrong lessons — it would reward
retired Telugu text, 90-word narration, and metaphorical titles.

Measured, not assumed:

| Dimension | Exemplar state | Current law | Verdict |
|---|---|---|---|
| Narration length | faraday 67–94 words, magnetisation 54–71 | Rule 31: **25–55 EN words** | ✗ Do not clone. `resistivity` (40–56) is the only compliant one. CLAUDE.md §5 already carries this warning. |
| `depth_ring` | **absent in all three** | Rule 38a: every state tagged `core\|extended\|advanced` | ✗ Do not clone. New concepts must ring-tag. |
| `curriculum_tags` | **absent in all three** | Rule 38g: authored as claims + `needs_teacher_verification` | ✗ Do not clone. |
| `text_te` | **present in all three** | Rule 30i: Telugu **RETIRED**; Hindi is the second language | ✗ Do not clone. Retired-not-purged — leave theirs alone, author `text_hi`. |
| Titles | `resistivity`: *"Longer chokes…"*, *"Wider frees…"*, *"geometry dances, resistivity never moves"* | Rule 41a: no idiom, metaphor, or personification | ✗ **Do not clone.** A wire does not choke; geometry does not dance. These would fail Rule 41 today. |
| Titles (named ban) | `resistivity` STATE_7: *"Explore — all four dials **yours**"* | Rule 41a bans **"All yours"** by name | ✗ Do not clone — a direct hit on a rule example. |
| Title scaffolding | `resistivity` STATE_3 title literally begins **"PRIMARY aha — "** | Rule 41d: titles short and literal; the rail truncates | ✗ Do not clone. Authoring metadata leaking into a reader-facing string the teacher sees in the rail. |

**Clone their arc, their control design, and their binding discipline. Not their sentences and not
their titles.**

A useful consequence: `resistivity` is the closest to modern law (compliant word budget, the Rule 33
macro↔micro reference) but has the worst Rule 41 titles. No single concept is exemplary on every
axis — which is exactly why this is a dimensioned rubric and not "copy the good one".

---

## §5 — How this file ratchets

The scar list grows one row per defect. This grows one row per **rejection or promotion**:

1. **Every founder rejection appends a §2 row** — verbatim words, the principle, the fixing commit.
   Same discipline as a scar row: no row without evidence a founder could re-verify.
2. **A rejection that no §3 dimension would have caught adds a DIMENSION**, not just a row. R1 is the
   worked example: every gate passed it, so "information gain" became D1.
3. **A concept scoring ≥17/20 that the founder approves is a candidate exemplar.** Promoting it
   re-measures §1 — if the new member breaks a unanimous property, the property was vintage, not craft.
4. **When a §4 fence row is retired** (e.g. an exemplar is re-authored to Rule 41), move it out of the
   fence. The fence should shrink over time; if it grows, the exemplar set is aging out.

Calibration cadence: alongside any concept build (Phase 4 is costed at ~1 founder session precisely
because it rides along).

---

## §6 — What needs the founder's ruling before this goes live

Everything above §3's thresholds is derived from measured evidence and defensible on its own. These
four are genuinely taste calls that no amount of file-reading settles:

1. **The thresholds** (<13 not-exemplar, ≥17 exemplar, any 0 = reject). Invented as a starting point.
   Weighting is the real question: is D1 worth more than D4? My read is yes — D1 is the one that
   every automated gate missed — but that is the founder's call.
2. **Is the exemplar set still right?** All three are Ch.3/Ch.4-era. `capacitance` (the Rule 38
   proof-run) and the newer LoM sims may now be better exemplars of *current* doctrine, even if they
   are less beloved.
3. **D9 vs the fence.** The rubric asks for plain-English titles that state the result, but the
   exemplar that best states results has the worst Rule 41 wording. Does the founder want
   `resistivity`'s titles retrofitted — which re-baselines it — or left as vintage?
4. **Does the score gate anything?** Drafted as report-only. Making a 0 blocking at Checkpoint A is a
   real behaviour change to founder_proxy and should be an explicit decision, not a side effect.

**Not yet wired in.** `.agents/founder_proxy/CLAUDE.md` Pass 4 is unchanged until these are settled;
wiring it is a one-paragraph edit plus `npm run sync:agents`.
