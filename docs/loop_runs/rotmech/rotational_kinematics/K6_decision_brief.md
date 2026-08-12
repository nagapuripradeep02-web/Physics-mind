# K6 — one decision: build the graph state, or ship the concept without it

**Concept:** `rotational_kinematics` (Class 11, Ch.7) · **From:** Desk D · **2026-08-13**
**Blocks nothing today.** It is already decided in practice; this asks you to decide it on purpose.

---

## What happened

`rotational_kinematics` was designed with **9 teaching states**. The last one, **S8**, needs a small
graph panel drawn beside the turntable. The design said in writing: *if that panel is not built, S8
is dropped* — there is no fallback version of the state.

The panel was never put on the engine build list. **Not rejected — never entered.** So the state has
already been dropped, quietly, and the concept now stands at **8 states**. Nothing anywhere records
that, because no one chose it.

Everything else about the concept is sound. Both quality gates passed it, the physics is written,
and it is waiting on a separate engine item (the motor wheel) before it can be built at all.

---

## What S8 does

It is the one state that shows **what "rate of change" actually looks like.**

The turntable spins up exactly as it did two states earlier — but this time a graph draws itself
alongside: the angle curves upward, the speed climbs in a straight line, and a small slope indicator
rides the curve and visibly steepens as the table speeds up. The point the student is meant to walk
away with: *the slope of the angle graph **is** the speed; the slope of the speed graph **is** the
acceleration. That is all the calculus notation means.*

It is the only state in the concept where calculus notation is allowed at all. It sits in the
**advanced** ring — the part of the lesson that a teacher on a simpler syllabus hides.

---

## Option A — build the panel, S8 comes back

**What you get:** 9 states. The derivative-as-slope picture — genuinely good teaching, and the kind
of thing a whiteboard does badly. The panel is **reusable across the whole chapter** (six concepts
share this turntable), so it is not spent on one state forever.

**What it costs:**
- A new engine build item, on a queue that is already **10 items long with 13 more candidates**
  waiting from last week's cross-desk sweep.
- It competes directly with the item this concept is *actually* blocked on — the motor wheel, which
  **11 of 17 states across both my concepts** need before anything can be built. A graph for one
  advanced state ahead of a visible cause for eleven states is the wrong order.
- The design review (Checkpoint A) **reopens**, because the state count and the advanced ring both
  change. That is two gate passes for one state.

---

## Option B — ratify the 8-state form

**What you get:** the decision on record, and the concept moves forward unchanged in every other
respect.

**What it costs:** the slope picture, and the concept's only advanced-ring state.

**Three things make this cheaper than it sounds:**

1. **No exam content is lost.** The concept was designed backwards from a real JEE question, and
   that question resolves completely without S8 — every part traces to states S1, S3, S4, S5, S6 and
   S7. S8 teaches *why* the notation means what it means; it is not load-bearing for a problem.
2. **The 8-state lesson is already proven to hold together.** The design's own preset walk shows the
   8-state cut is *identical* to the "hide advanced" version we already ship to simpler syllabi.
   Nothing in the surviving states refers to the graph or to calculus. It reads as a complete
   lesson, not a truncated one.
3. **An empty advanced ring is already normal here.** Two shipped concepts — `friction_force` and
   `equilibrium_of_particles` — ship with none, and the rule that governs ring structure was
   confirmed satisfied for this case at design review.

**Who actually loses something:** calculus-based syllabi — AP Physics C, IB Higher Level. They lose
their one advanced cell in this concept. CBSE, NEET and JEE Main are unaffected.

---

## My recommendation: **Option B, with a named revisit**

Ratify 8 states now. Not because the graph state is weak — it is one of the better ideas in the
concept — but because of **where it sits in the queue.** This concept cannot be built at all until
the motor wheel lands. Spending an engine slot on a graph for one advanced state, ahead of the
actuator eleven states need, delays the whole concept to add its least load-bearing part.

And the panel is chapter-wide. Building it in the next engine wave costs the same as building it
now, and by then it can serve more than one state.

**So: ship 8 states, and put the graph panel back on the list as a named candidate for the chapter's
next engine wave — not deleted, deferred.** If it lands later, S8 returns as designed; the design is
written and does not expire.

---

## If you choose B, three small things get done (Desk D, no engine work)

1. Record the state count as **8** so it is never rediscovered as a defect.
2. Execute the outstanding rider on the syllabus tags — drop the advanced-ring claims for the
   calculus-based boards and mark them *revisit if the panel lands*.
3. Confirm the ring structure reads correctly with the advanced ring empty (already checked at
   design review; this just records it).

## If you choose A

Say so and I will file the panel as an engine row with the state's exact requirements, and flag that
design review reopens for this concept.

---

**One line either way is enough.** Until then the concept sits at 8 states by accident rather than
by choice, which is the only part of this that is actually wrong.
