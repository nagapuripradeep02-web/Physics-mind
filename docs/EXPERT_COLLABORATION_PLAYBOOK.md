# Expert Collaboration Playbook — Physics Content Partner

*How we work with a subject-matter expert to build high-quality, conceptually deep
simulations — **without ever asking them to design.***

Created 2026-06-08 · First partner: **Venkata Vijaya Kumar Veluri** (UrbanPro, Vizag) ·
First chapter: **Magnetism (Class 12)** · Trial: Mon 8 June 09:30 CEST.

---

## THE ONE PRINCIPLE (read this first)

The expert provides the **teaching**. We provide the **design**. He **never designs** —
he **teaches and reviews**. That is the entire model.

| Layer | Who | What it is |
|---|---|---|
| Physics + pedagogy | **Venkata** | the sequence, the misconceptions, what students must SEE, exam-critical points |
| Simulation design | **Founder + Claude + engine** | states, primitives, choreography, animation |
| Verification | **Venkata reviews** | "is this simulation correct? is it clear? would a student get it?" |

He speaks **pedagogy**; we speak **primitives**. We ask *teaching* questions and translate
the answers into *design*. He never touches the design vocabulary — that is a foreign
language to him, and always will be. **That is fine. Design is our job.**

---

## PART A — What we tell Venkata (his role, in plain words)

*Can be said in Telugu. Keep it warm and simple — he is a senior teacher; respect that.*

> "Sir, here is how I'd love to work with you — and it is nothing technical, nothing for
> you to design or build.
>
> I build interactive physics simulations for students. **My** job (with my tools) is to
> build the animation. **Your** job is the part only an experienced teacher can do:
>
> 1. **Teach me each concept** the way you teach a student — your sequence, your examples,
>    your board work.
> 2. **Tell me where students get confused** — the mistakes they always make, the wrong
>    answer they give.
> 3. **Tell me what a student needs to SEE** to understand it — the one thing that, if they
>    could watch it happen, would make it click.
> 4. **After I build the simulation, you watch it and tell me** — is it correct? is it
>    clear? would a student understand?
>
> That's it. You teach the way you always do; I turn it into the simulation; you check my
> work. No forms, no design, no technical work. I'll pay for your time through UrbanPro,
> same as a class."

This framing is one a 30-year master teacher will happily say **yes** to — because it asks
for his genius (teaching) and nothing he can't do (design).

---

## PART B — The workflow (4 phases, repeating)

**Phase 0 — Agree the concept list & order** *(first paid session)*
- We bring **~25–30 magnetism concepts**, arranged **basic → advanced (dependency order)**.
- He **sanity-checks the order**: *"Does this build correctly? What must come before what?
  Am I missing a prerequisite?"*
- Bonus: this is also how we test his JEE judgment, and how he sees the scope.

**Phase 1 — Pedagogy capture** *(paid sessions, ~2–3 concepts per hour)*
- For each concept, we ask the **6 questions** (Part C). **He teaches; we record + write
  it down.**

**Phase 2 — We build** *(no expert time)*
- Founder + Claude + the engine turn his teaching into the simulation.

**Phase 3 — Review** *(short paid session)*
- We show him the **built simulation**. He says: correct? clear? what's missing?
- We fix. **Loop.**

> The loop is the moat: day-1 simulation ≠ day-30 simulation. His review + student feedback
> make every sim better over time.

---

## PART C — The per-concept capture sheet (OUR tool; HIS answers)

For **every concept**, we capture these six. We ask in plain teaching language; we fill the
sheet from what he says.

| # | What we capture | The question we ask him | → becomes |
|---|---|---|---|
| 1 | **SEQUENCE** | "If you teach this from scratch, what's the ORDER — step 1, 2, 3…?" | the simulation's **states** |
| 2 | **HOOK** | "How do you make a student first *get* it — what example or question do you open with?" | the **opening + real-world anchor** |
| 3 | **MISCONCEPTIONS** ★ | "Where do students ALWAYS go wrong? What wrong answer do they give?" | the **correct-the-mistake** beats (our moat) |
| 4 | **WHAT MUST BE SEEN** | "If a student could SEE just one thing move or happen, what would make this click?" | **what we animate** (focal primitive) |
| 5 | **EXAM-CRITICAL** | "For JEE/NEET, what must they know — which derivation gets asked, where are the marks?" | **exam mode / mark scheme** |
| 6 | **THE AHA** | "What's the one insight that, once it lands, unlocks the whole concept?" | the **primary aha** the sim must deliver |

**+ verbatim field:** *"In his own words"* — capture his exact analogy/phrasing. A great
teacher's one-line analogy is pure gold; don't paraphrase it away.

### Copy-paste capture block (one per concept)

```
CONCEPT: ____________________   (dependency level: basic / mid / advanced)
1. SEQUENCE:        1) ...  2) ...  3) ...
2. HOOK:            ...
3. MISCONCEPTIONS:  - students think ...  - common wrong answer: ...
4. MUST SEE:        ...
5. EXAM-CRITICAL:   derivation: ...  marks: ...
6. AHA:             ...
HIS WORDS (verbatim analogy): "..."
```

---

## PART D — Format: he TALKS, we CAPTURE (not a form, not design-on-paper)

Your exact question — *form vs free-hand vs design-on-paper?*

- ❌ **NOT a form for him to fill.** Master teachers give shallow answers to forms, and a
  senior teacher won't do "homework." Low compliance, low quality.
- ❌ **NOT "design the simulation on paper."** That's the **Radhika mistake** — he can't,
  and the ask itself freezes the relationship.
- ✅ **He TEACHES freely** — whiteboard, paper, screen, whatever he likes. **Free hand on
  the *teaching*.**
- ✅ **WE bring the structure** (the 6 questions) and **WE capture** into the template
  (recording with permission + notes).
- ✅ **WE translate** his teaching into the design.

**The structure comes from OUR consistent questions — not from constraining HIM.**
He talks; we shape. That is how you get both *freedom* (his best teaching) and *structure*
(what we need to build).

---

## PART E — First real session agenda (60 min, after trial is accepted)

1. **(5 min) Warm open** — Telugu, rapport, confirm the working model (Part A).
2. **(10 min) Phase 0** — walk the dependency-ordered concept list; he validates the order.
3. **(35 min) Phase 1** — capture **2–3 concepts** using the 6-question sheet, starting at
   the basic end (e.g., *magnetic field of a moving charge → force on a moving charge →
   F = qvB sinθ*). He teaches; we record + fill the block.
4. **(5 min) Close** — confirm next session, pay through UrbanPro, thank him.

> Don't try to do all 25–30 at once. ~2–3 concepts per paid hour, sustainably. At €4/hr
> the whole capture for a chapter costs a few tens of euros.

---

## Companion artifacts (generate next)

- **The dependency-ordered 25–30 magnetism concept list** (basic → advanced), extracted
  from the chapter dependency graph — the input for Phase 0.
- A **fillable capture sheet** (Google Doc / Notion) mirroring Part C.

---

## Hard rules (carry forward from Radhika / Bhawesh)

1. **Hire the teaching, not the design.** Never ask him to design states/primitives/animation.
2. **Pay through UrbanPro; never share personal contact** — account-termination risk
   (same trap that likely froze Radhika).
3. **Guard the business strategy.** Discuss physics + teaching only. Not the moat, GTM,
   pricing, or roadmap. (He's a content partner, not a co-founder.)
4. **Narrow, paid, small steps.** One chapter, a few concepts per session. Prove the loop
   before scaling.
5. **Telugu rapport is the multiplier — competence is the base.** Verify M.Sc Physics +
   conceptual teaching before committing volume.
