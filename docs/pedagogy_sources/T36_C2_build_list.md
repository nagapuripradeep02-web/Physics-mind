# T36 · Cluster C2 — Force & Motion of a Charge · Build List

**The active build cluster.** Dependency-ordered atoms from PW lectures 07 (force) + 08 (motion),
each tagged with: what it teaches · prerequisite · primary aha · key misconception · what-must-be-seen
· the Venkata capture-ask · build status. This is both the **Venkata walk-through sheet** and our
**build queue**. Source detail in `T36_chapter_scope.md`. IP: our restructured notes only.

**Legend:** ⭐ Signature · 💎 Diamond · ◻ Standard · ✅ have · 🔶 partial · 🔨 build

---

## The queue (basic → advanced)

| # | Atom | Teaches | Tier | Status |
|---|---|---|---|---|
| 1 | **A3** | Lorentz force F=q(v×B), F=qvB sinθ | ⭐ | ✅ our diamond |
| 2 | **A4** | direction (Fleming-L / right-hand-palm / screw) | 💎 | ✅ our diamond |
| 3 | **A6** | v∥B → sinθ=0 → F=0 → straight line | ◻ | ✅ our θ=0 state |
| 4 | **A5** | force ⊥ v → **does no work → speed constant** | 💎 | 🔶 **authored** (STATE_5; tsc + validator PASS; visual gate pending) |
| 5 | **A7** | v⊥B → circular motion (why a circle) | 💎 | 🔨 |
| 6 | **A8** | radius r = mv/qB (derive) | ◻ | 🔨 |
| 7 | **A9** | period T = 2πm/qB (derive) | ◻ | 🔨 |
| 8 | **A10** | **T independent of speed** | 💎 | 🔨 |
| 9 | **N8.1–3** | radius variants: p/qB, √(2mK)/qB, √(2mqV)/qB | ◻ | 🔨 |
| — | ~~PC-1~~ | problem class: *time spent in field* | prob | ⏸ **deferred — future problem layer** |
| — | ~~PC-2~~ | problem class: *angle of emergence* | prob | ⏸ **deferred — future problem layer** |

**Already built:** A3 + A4 + **A5** + A6 (our `magnetic_force_moving_charge` diamond — A5 added 2026-06-09
as STATE_5: speed-frozen / no-work, predict→reveal beat). **To build (conceptual only):** A7, A8, A9, A10 (~4 conceptual sims).
**A5 first** — it's the most-tested idea *and* the bridge from "force" to "why a circle."
**Deferred to the future problem layer (NOT now):** PC-1, PC-2, and the N8.x radius-ratio drills —
per the 2026-06-09 conceptual-core-first call (`T36_chapter_scope.md` §🎯 Conceptual-core-first build
queue). We build *understanding* first; the problem layer comes after the conceptual base is solid.

---

## Per-atom detail (the Venkata capture targets)

### 4 · A5 — magnetic force does no work → speed constant  💎 🔨  *(highest priority)*
- **Aha:** the force only *steers*, never *speeds* — W = F·ds·cos90 = 0 → KE constant → speed constant.
- **Misconception ★:** *"the magnetic force speeds the charge up / does work."* #1 conceptual error.
- **Must see:** velocity vector turning while a **speed readout stays frozen.**
- **Prereq:** A3, A4.
- **Ask Venkata:** *"When you teach that the magnetic force does no work — where do students resist it?
  What makes 'it curves but speed never changes' finally click?"*

### 5 · A7 — circular motion when v ⊥ B  💎 🔨
- **Aha:** a force always ⊥ v *is* centripetal → the path *must* be a circle.
- **Misconception:** students accept "it's a circle" by rote but can't say *why*; some think it spirals/decays.
- **Must see:** force vector staying ⊥ to velocity all the way around, pinning it to the center.
- **Prereq:** A5 (no work) → A7.
- **Ask Venkata:** *"How do you convince a student the path is a perfect circle and not a spiral?"*

### 6 · A8 — radius r = mv/qB  ◻ 🔨  *(derivation-rail sim)*
- **Aha:** qvB = mv²/r → r = mv/qB. Heavier/faster → bigger circle; stronger field/charge → tighter.
- **Misconception:** "faster ⇒ smaller circle" (confusing with force intuition). Actually r ∝ v.
- **Must see:** drag speed up → **radius grows** (R ∝ v), live.
- **Build note:** derivation rail (qvB ↔ mv²/r term-by-term), per the two-zone UI.
- **Ask Venkata:** *"In the r = mv/qB derivation, which single step do students stumble on?"*

### 7 · A9 — period T = 2πm/qB  ◻ 🔨  *(derivation-rail sim)*
- **Aha:** T = 2πr/v = 2πm/qB. The v cancels.
- **Must see:** the v cancelling out in the rail; clock ticking the same regardless of speed.
- **Prereq:** A8 → A9.

### 8 · A10 — T independent of speed  💎 🔨  *(the cluster's headline aha)*
- **Aha:** **faster particle → bigger circle → SAME time.** (Foundation of the cyclotron, L11.)
- **Misconception ★:** *"faster ⇒ quicker lap."* Strong, counterintuitive — students expect speed to matter.
- **Must see:** two charges, slow + fast, racing on small + big circles — crossing the start line *together.*
- **Ask Venkata:** *"How do you make 'same time regardless of speed' believable, not just stated?"*

### 9 · N8.1–3 — radius variants  ◻ 🔨  *(standard, templated)*
- r = p/qB = √(2mK)/qB = √(2mqV)/qB (momentum / kinetic energy / accelerating-potential forms).
- **Exam-critical:** ratio problems (same K or same V → compare radii of p, d, α). Competitive-mode beats.

### 10 · PC-1 — time spent in field  *(problem-class sim)*  🔨
- t = (m/qB)(π−2θ) [small arc] or (π+2θ) [large arc], via unitary method from 2π → 2πm/qB.
- **Misconception ★ (his #1):** students put the circle's center at the **entry point** / assume a
  semicircle. Correct: center lies *toward the force*. → **EPIC-C branch: STATE_1 shows the wrong center.**
- **Must see:** the center *hopping* to the force side; the swept arc highlighting π∓2θ.
- **Ask Venkata:** *"What's the classic mistake students make locating the circle's center?"* (We know the
  answer — this validates him AND confirms the misconception is live.)

### 11 · PC-2 — angle of emergence  *(problem-class sim — the showpiece)*  🔨
- Field slab width d → sinθ = d/R. d<R → exits at θ<90°; d=R → 90°; d>R → loops back, exits 0°.
- **Misconception ★:** sinθ>1 read as "no answer" instead of "**particle loops back.**"
- **Must see (interactive):** drag d → watch emergence angle grow until d=R, then the particle can't
  escape and curls back. **This single interactive decisively beats any static whiteboard.**

---

## How to use this with Venkata (per EXPERT_COLLABORATION_PLAYBOOK)

1. Show him our existing diamond (A3+A4) → *"is this correct / clear / would a student get it?"* (verify).
2. Walk the queue order above → *"does this build correctly, anything out of order?"* (validate sequence).
3. For A5, A7, A10 and PC-1/PC-2, ask the per-atom Venkata question → capture his misconceptions + must-see.
4. We already have strong misconception priors (above) — use them to **test his depth** and **enrich**, not
   to lead him. Weight his paid time toward A5/A7/A10 + the two problem classes (where confusion lives).

**Cluster continuation (after this core):** A11 helix (L09), A13 velocity selector (L10), A14 cyclotron
(L11) — pull those transcripts' detail in just-in-time when this core ships.
