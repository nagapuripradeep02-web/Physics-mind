# The AI Professor — Plain-English Plan

*A one-page, no-code explanation of what's wrong with the live demo and how we fix it. Written to be read by anyone — and to be shared.*

Date: 2026-06-19

---

## The picture to hold in your head

Imagine the simulation is a **science model on a screen** — the moving charge, the arrows, the magnetic field, the little 3D hand.

The AI professor is a **teacher standing next to that screen**, talking and pointing.

For the teacher to teach well, it needs two things — just like a real teacher:

1. **A brain** — to understand what the student is really asking, and decide *"for this question, I should show this part and change this thing."*
2. **Hands** — to actually reach out and *do* that on the screen.

Right now, **both are weak.** That's the whole problem.

---

## What went wrong in the demo

A student asked: *"Explain state seven, and can you control a few parameters?"*

The teacher just replayed its general lecture and changed nothing. Two reasons:

- **Its hands are nearly empty.** Today the teacher can only point a spotlight, flip to a pre-made scene, and show a formula on the side. It has **no way to turn a dial** — it can't change the angle, the field strength, or move the charge. So when the student said *"control a few parameters,"* the teacher reached for a button that doesn't exist. (Like asking a TV host to turn up the volume with only a channel button.)

- **Its brain is rushed.** The system didn't pause to figure out *which* scene "state seven" meant or *what* the student wanted changed. It grabbed its most familiar answer — the full lecture from the start — and replayed it. It didn't really *listen*.

---

## Fix 1 — Give the teacher a proper brain

Make the teacher think in **two quick steps** instead of one rushed guess:

- **Step one (fast):** *"What is this student really asking, and what part of the model does it point to?"* — "state seven" → that scene; "control parameters" → the angle dial. A small, cheap check whose only job is to **point at the right thing**. It invents no physics.
- **Step two (careful):** Now compose the real answer — *"jump to that scene, slowly raise the angle, watch the circle stretch into a spiral, and here's why."*

Splitting these is what makes it answer **the question that was actually asked**.

---

## Fix 2 — Give the teacher real hands

This is the bigger, more exciting one — and it's the instinct you already had.

Today the objects on screen (charge, arrows, hand, field) are basically **painted on**. The teacher can shine a light on them but can't grab them.

We turn every object into a **handle with labelled knobs**:

- the velocity arrow → a dial for its **angle** and **length**
- the magnetic field → a dial for its **strength** and **direction**
- the charge → handles to **move it** or **change its speed**
- the hand → settings to **point it** different ways

Then the teacher can do what a *great* human teacher does: *"watch — I'll slowly increase the angle… see how the circle opens into a spiral?"* — manipulating the model live while explaining.

**The safe part (very important):** the teacher only *chooses the knob settings*. The actual physics — what the path looks like, how strong the force is — is computed by our **trusted, already-correct engine**, never invented by the AI. The teacher turns the knobs; the verified machine draws the truth. So the teacher can manipulate everything freely, and it is still **impossible for it to show wrong physics.**

---

## The order of work

1. **Hands first** — build the knobs on every object (Fix 2).
2. **Brain second** — teach it to listen and pick the right knob (Fix 1).

A smart brain is useless if the hands are empty — which is exactly what the demo showed.

---

## The honest bits

- **We already built the safe skeleton.** The teacher is already kept on a tight leash so it can't invent physics. We're adding more *safe* things it's allowed to touch, and teaching it to listen better before it acts.
- **This is real building work** — several days, not a quick text tweak.
- **It's not a detour.** It's exactly the direction already written down in our own rules ("every object should be controllable"). We've been laying the bricks; this builds the wall.
