# T36 — Moving Charges & Magnetism · Chapter Scope Map

**Purpose.** The Phase-0 "baseline pedagogy" map for the whole chapter, distilled from
the Physics Wallah lecture series (16 lectures, ~14 h) + our own atomic dependency graph
(`docs/exports/chapters/diagrams/chapter-36-moving-charges-magnetism.mmd`). This is the
*scope + sequence + misconception + problem-class* terrain we walk through with the expert
(Venkata) and feed into simulation design.

**IP guardrail (hard).** This file holds **our restructured pedagogy notes only** — atoms,
misconception *beliefs*, what-must-be-seen, problem *types*, primary aha. It must **never**
contain verbatim PW prose, PW's exact problem numbers, or copied sequences. Use exactly like
the DC Pandey rule (CLAUDE.md §8): table-of-contents + problem-taxonomy + misconception-belief
extraction only. Raw transcripts live in temp and are deleted after distillation.

**Source.** PW playlist `PLF_7kfnwLFCF8sjVSdxn3yWAghIgVnw26` (16 lectures). Lecturer is a PW
faculty member (board-driven). Used for *what to teach / in what order / where students fail* —
never for *how we visualise it* (that's our engine's job, and the place we beat the board).

**Legend.** ⭐ Signature · 💎 Diamond · ◻ Standard · status: ✅ deep-done · 🟡 first-pass distilled · 🔻 transcript-pending · ⬜ not started

---

## The chapter in 5 build-clusters (dependency order)

| Cluster | Lectures | Theme | Big atoms |
|---|---|---|---|
| **C1 — Field creation** | 01–06 | what *makes* a B field | Biot–Savart A20💎, straight wire A21⭐, Ampère A26💎, solenoid A27💎 |
| **C2 — Force & motion** ← *start here* | 07–11 | what a B field *does* to a charge | Lorentz A3⭐, no-work A5💎, circle A7💎, helix A11💎, cyclotron A14💎 |
| **C3 — Force on conductors** | 12–13 | force on *currents* | F=IL×B A15💎, parallel currents A18💎 |
| **C4 — Dipole & torque** | 14–15 | loop *as* a magnet | moment A29💎, torque A30⭐ (**Diamond #3**) |
| **C5 — Application** | 16 | the instrument | galvanometer |

**We have already built A3+A4 (our `magnetic_force_moving_charge` diamond) and deeply mined
C2's lectures 07+08. C2 is the active build cluster.**

---

## Per-lecture map

| # | Lecture | Dur | Atoms | Tier | Status |
|---|---|---|---|---|---|
| 01 | Biot–Savart · B of straight wire | 1:23 | A20, A21, A22, A25, A2 | 💎/⭐ | 🟡 |
| 02 | B of circular loop & arc | 1:14 | A24, A20, A22, A25, N24.x | ◻/💎 | 🟡 |
| 03 | B on axis of circular loop | 0:36 | A23, A24, A20, A22 | ◻ | 🟡 |
| 04 | Ampère's law (wire, cylinder) | 0:58 | A26, A21, A20, +J=J₀r | 💎 | 🟡 |
| 05 | Solenoid | 1:01 | A27, A26, A23, A22 | 💎 | 🟡 |
| 06 | Toroid | 0:28 | A28, A26, A27 | ◻ | 🟡 |
| **07** | **Force on a moving charge** | 0:51 | **A3, A4, A5, A6, N3.x, N4.x** | **⭐/💎** | **✅** |
| **08** | **Motion of a charged particle** | 1:10 | **A7, A8, A9, A10, N7.1, N8.x** | **💎** | **✅** |
| 09 | Helical path | 0:44 | A11, A12, A4, A6, A7, A8, A9, A10 | 💎 | 🟡 |
| 10 | Lorentz E+B · velocity selector | 0:45 | A34, A13, A3–A8, A11, A12 | 💎 | 🟡 |
| 11 | Cyclotron | 0:52 | A14, A5, A8, A7 (uses A10) | 💎 | 🟡 ⚠️ partial |
| 12 | Force on current conductor | 1:19 | A15, A16, A17, A3, A4, +T=IBR | 💎 | 🟡 |
| 13 | Force between parallel currents | 0:25 | A18, A19, A15, A21, A22, A4 | 💎 | 🟡 |
| 14 | Magnetic moment · loop as dipole | 1:06 | A29, A31, A33 | 💎 | 🟡 |
| 15 | Torque on current loop | 0:35 | A30, A29, A31, A17, A15 | ⭐ | 🟡 (Diamond #3 exists) |
| 16 | Moving-coil galvanometer | 1:01 | GALV, A30, A29, A15 | ◻ | 🟡 |

---

## ✅ Lecture 07 — Force on a moving charge  *(deep-done; matches our diamond)*

**Atoms:** A3 (Lorentz F=q(v×B)) ⭐ · A4 (direction rule) 💎 · A5 (no work, KE const) 💎 · A6 (v∥B→F=0)

**1 · Sequence (→ states):** rest-vs-moving contrast → F=qvB sinθ & F=q(v×B) → when F=0 (q,v,sinθ) →
direction (screw + Fleming-left-hand + right-hand-palm) → orientation drills → v×B determinant numeric →
F⊥B trick (a·B=0) → **work=0 → speed constant**.

**2 · Hook:** stationary charge in a field feels **nothing**; only a *moving* charge deflects. (We currently
open at θ=0 — adopting this rest-vs-moving contrast is a stronger hook.)

**3 · Misconceptions ★:**
- *"A stationary charge feels a magnetic force."* → No — motion is required.
- **★ "The magnetic force does work / speeds the charge up."** → **No: W=0 always, speed is constant**,
  only direction turns. The #1 conceptual error of the whole topic. (→ `misconception_watch` + EPIC-C.)
- Fleming finger-assignment confusion; **forgetting to flip force for a negative charge.**

**4 · What must be seen:** the velocity vector *turning* while a **speed readout stays frozen** (visualises no-work).

**5 · Exam-critical:** the i,j,k **determinant** for v×B; the **a·B=0** MCQ trick; "speed unchanged" conceptual MCQ.

**6 · Primary aha:** **the magnetic force only steers, never speeds — it does zero work.**

**Gap vs our diamond:** our 7 states (θ=0→10→45→90→Fleming→decomposition→interactive) cover A3+A4 well and
**beat the board on 3D + angle-sweep**, but are **missing A5 (no-work/speed-constant)** — the most-tested idea
*and* the bridge into L08's circular motion. Highest-priority addition.

---

## ✅ Lecture 08 — Motion of a charged particle  *(deep-done; the next atoms)*

**Atoms:** A7 (circle ⊥) 💎 · A8 (r=mv/qB) · A9 (T=2πm/qB) · A10 (T independent of v) 💎 · N7.1, N8.1–3
**+ two problem classes:** "time spent in field" and "angle of emergence". *(No helix here — that's L09.)*

**1 · Sequence:** Case I θ=0/180 → straight · Case II θ=90 → circle → derive R=mv/qB → derive T=2πm/qB
(T independent of v) → radius variants (p, √2mK, √2mqV) → ratio problems → time-spent geometry → angle-of-emergence.

**3 · Misconceptions ★ (verbalised — "बच्चे यही गलती करते हैं"):**
- **★ Center-placement error:** in time-spent problems students put the circle's center at the *entry point* /
  assume a semicircle (180°). Correct: center lies *toward the force*; geometry gives **π−2θ**.
- **Negative-charge:** forget to reverse force → center on wrong side.
- **Small vs large arc:** confuse **π−2θ** (small) vs **π+2θ** (large).
- **sinθ = d/R > 1 → "not possible"** is mis-read as "no answer"; it means the particle **loops back** (exits 0°).

**4 · What must be seen:** R growing as you throw faster (R∝v); the velocity turning at constant speed; the
center hopping to the force side; the d-slider sweeping emergence angle until the particle can't escape.

**5 · Exam-critical:** R=mv/qB=p/qB=√(2mK)/qB=√(2mqV)/qB; T=2πm/qB; ratio problems (same K / same V);
time-spent t=(m/qB)(π∓2θ); angle-of-emergence sinθ=d/R with the d<R / d=R / d>R cases.

**6 · Primary aha:** **T is independent of speed** — faster particle, bigger circle, *same time*.

**Build note:** A10 (T independent of v) is the aha; A8's must-see is R∝v. The angle-of-emergence
"not-possible/loops-back" interactive is a sim that **decisively beats a static whiteboard**.

---

## ✅ Lecture 01 — Biot–Savart law & B of a straight wire  *(first-pass distilled)*

**Atoms:** A20 (Biot–Savart dB) · A21 (B of long straight wire) · A22 (right-hand thumb rule) · A25 (finite-wire sinφ₁+sinφ₂) · A2 (current makes B)

**1 · Sequence:** compass deflects near a live wire, flips when current flips → contrast E (acts on any charge) vs B (acts only on a *moving* charge) → name the unit (tesla = N/A·m = Wb/m²) → state Biot–Savart in vector then scalar form, μ₀/4π = 10⁻⁷ kept un-cancelled → stress the law is for an *element* dL, the whole wire needs integration → direction by dL×r screw + right-hand thumb shortcut, drill on dot/cross orientations → derive the finite-wire master result **B=(μ₀/4π)(I/a)(sinφ₁+sinφ₂)** → apply to single wire, square/triangle centre (N× one side), point along the wire (B=0), infinite (both angles 90°), semi-infinite → close on two off-foot trap problems.

**2 · Hook:** a magnetic compass next to an ordinary household wire deflects — and reverses when the current reverses. So a current must build a field around itself, and unlike the electric field it only pushes a charge once that charge is moving.

**3 · Misconceptions ★:**
- ★ *"The formula gives the whole wire's field — plug the full length straight in."* → No; it is for an element dL only, integrate.
- ★ *"The distance in the formula is the P-to-end distance in the figure."* → It is the **perpendicular** distance `a`; convert via a=D·cos(angle). *(Flagged the #1 forgotten point.)*
- ★ *"Read φ₁,φ₂ off whatever angles the figure shows, both on the same side."* → Measured from the perpendicular line in **opposite** senses; same-side ⇒ one becomes 360−θ (negative sine).
- ★ *"A dot or cross always means field direction."* → Generic into/out-of-page marker; can equally mean current. Read context.
- ★ *"B acts on a stationary charge like E does."* → Zero force at rest; force only once the charge moves.
- ★ *"Drop the perpendicular so it lands inside the drawn segment."* → If the foot falls outside, the wire must be extended to drop a true perpendicular.
- ★ *"A wire makes a field at points on its own line."* → Along the wire dL∥r, sinθ=0, B=0.

**4 · What must be seen:** compass flipping with current reversal; right-hand thumb sliding to current while curling fingers trace circular B (in/out symbol at P updating live); a single dL element with its r, θ, and dB, then θ sweeping −φ₂→+φ₁ so element fields accumulate into total B (r and θ visibly co-varying — why r→a/cosθ); the perpendicular-foot construction with both angles opening in opposite senses (wire extended when the foot is off-segment); infinite-wire limit (end angle → 90° as the wire lengthens); B→0 as the point slides onto the wire's line.

**5 · Exam-critical:** finite wire with two end-angles → B=(μ₀/4π)(I/a)(sinφ₁+sinφ₂); infinite (both 90°) → 2I/a form; semi-infinite (90°+0°) → I/a form; regular-polygon centre (one side × side-count by symmetry); point along the wire → B=0 by inspection; trap — given distance not perpendicular (a=D·cos); trap — same-side angles (one becomes 360−θ); direction across current-up / dot / cross orientations.

**6 · Problem-classes:** *Two-angle perpendicular read* · *Off-foot / same-side angle trap (360−θ negative sine)* · *Perpendicular-foot off the wire body (extend-the-wire)* · *Polygon-centre superposition* · *Element-sweep integration intuition*.

**Aha:** every straight segment reduces to one compact formula B=(μ₀/4π)(I/a)(sinφ₁+sinφ₂) — get the perpendicular distance and the two opposite-sense angles right and every case (finite, infinite, semi-infinite, polygon side, off-axis trap) falls out of it.

**Discovery vs catalog:** atoms confirm the catalog was roughly complete, but it teaches the **finite-wire formula first as the master result** with infinite as its both-angles-90° special case (reverse of catalog ordering, pedagogically better). Genuine discovery: the off-foot same-side angle trap, the must-extend-the-wire case, the ranked perpendicular-vs-given-distance and dot/cross misconceptions, and B=0-along-the-wire — none of which a flat atom list encodes.

---

## ✅ Lecture 02 — B at the centre of a circular loop & arc  *(first-pass distilled)*

**Atoms:** A24 (centre of loop μ₀I/2a) · A20 (Biot–Savart) · A22 (curl direction) · A25 (straight-wire recap) · **+ arc-nano N24.x** (general arc B=μ₀Iθ/4πa)

**1 · Sequence:** recap Biot–Savart + curl direction → on a loop dL⊥r so θ=90° everywhere and direction is the same at the centre for every element → integrate, ∫dL=2πa → **B=μ₀I/2a** → halve for semicircle, quarter for quadrant → generalise to an arc via ∫dL=aθ → **B=μ₀Iθ/4πa**, reframed as the unitary shortcut B=(μ₀I/2a)(θ/2π) → warn θ must be radians → concentric-loop superposition (add/subtract by direction) → recap straight-wire formula + the point-along-the-wire B=0 filter + semi-infinite special case → mix arcs with semi-infinite straight legs, dropping along-the-wire legs as zero → lift to 3D with î/ĵ/k̂ component combining → close on a current-splitting arc whose B_net at centre = 0 by parallel-resistance reasoning.

**2 · Hook:** the natural sequel to the straight-wire lecture — now bend the wire into a circle, semicircle, quadrant or arbitrary arc and ask how much field appears *at the centre*, teasing that every standard shape is one formula scaled by its fraction of a full circle.

**3 · Misconceptions ★:**
- ★ *"Plug the arc-angle θ in degrees."* → Radians only; convert ×π/180. **The single most-emphasised trap.**
- ★ *"A straight wire always (or never) gives zero field."* → B=0 *only* when the point lies on the wire's own line; otherwise non-zero.
- ★ *"Read the right-hand direction at the element."* → Read the curl **at the target point O**, where it can be the opposite sign.
- ★ *"Scalar-add contributions pointing along different axes in 3D."* → Keep −ĵ and −k̂ as separate components; combine via √(Bx²+By²+Bz²).
- ★ *"In a current-split loop the bigger arc carries more current so dominates."* → Larger arc has higher resistance → less current; the two effects exactly cancel → B=0.
- ★ *"You can eyeball which of two opposite-field coils wins."* → Assume one larger, write B₁−B₂, let a negative answer flip the assumed direction.
- ★ *"The loop/arc formula gives the field everywhere."* → Centre only; off-centre is deferred to the axis lecture.

**4 · What must be seen:** an element tangent to the loop with r to the centre, the 90° staying fixed as it slides; the curl read *at O* vs at the wire; an arc continuously sweeping θ from sliver → quadrant → semicircle → full circle while the value scales as θ/2π; two concentric opposing-current loops with their centre arrows resolving; a composite figure where only the arc lights up and the collinear straight legs contribute nothing; a 3D figure assembling coloured −ĵ/−k̂ vectors head-to-tail; the current-split loop where the brighter short arc and the wider long arc cancel to zero.

**5 · Exam-critical:** arc of angle θ → (μ₀I/2a)(θ/2π), θ in radians; two concentric opposite-current loops → B₁−B₂; composite arcs + straight legs → discard along-the-wire legs, sum arcs; semi-infinite straight wire opposite one end → μ₀I/4πa; mixed semi-infinite + semicircle/quadrant figures; 3D version → resolve into î/ĵ/k̂ and report vector + magnitude; current-splitting loop → B_net=0 by I∝1/length.

**6 · Problem-classes:** *Arc as a fraction of a circle* · *Point-along-the-wire zero filter* · *Opposite-current superposition with unknown dominance* · *2D-to-3D direction lift* · *Current-split arc cancellation*.

**Aha:** every loop, semicircle, quadrant and arbitrary arc at the centre is the same single formula μ₀I/2a scaled by the angular fraction θ/2π — memorise only the circle and read every other shape off by its fraction.

**Discovery vs catalog:** richer than the bare A24 ("centre = μ₀I/2R"). New: the general-arc field B=μ₀Iθ/4πa (the **N24.x** nano) and the unitary θ/2π mental model that is the lecture's whole spine. Two showpieces are textbook-implicit: the point-along-a-wire-⇒-B=0 by-inspection filter, and the cross-topic current-split cancellation (needs current-electricity parallel-resistance reasoning — no single-topic catalog surfaces it). A23 (on-axis) is explicitly *deferred* — out of scope here.

---

## ✅ Lecture 03 — B on the axis of a circular loop  *(first-pass distilled)*

**Atoms:** A23 (axial field) · A24 (centre as x=0 case) · A20 (Biot–Savart, vector form) · A22 (curl direction)

**1 · Sequence:** recap wire→B, Biot–Savart, prior loop-centre result → draw loop radius R, axial point P at distance x → chop element dl along the current → dl⊥r so θ=90°, dB=(μ₀/4π)(I dl)/r² → argue the hand rule can't pin the direction → introduce the **vector form dB ∝ (dl×r)**, so dB⊥ both dl and r → pair with the diametrically-opposite element to set up the cone of dB vectors → resolve into axial + radial components → radial parts of opposite elements cancel, only axial survives → integrate **only the surviving component**, ∫dl=2πR → **B=μ₀IR²/[2(R²+x²)^(3/2)]** → x=0 recovers centre μ₀I/2R → ×N for N turns → direction same on both sides, along the axis → draw the symmetric, single-signed B-vs-x bell curve.

**2 · Hook:** continues the build — L1 did the straight wire, L2 the loop centre; now the axis. *(No standalone hook stated; the sequel framing carries it.)*

**3 · Misconceptions ★:**
- ★ *"The hand rule alone pins the exact dB direction on the axis."* → Only a rough sense; the precise direction needs the vector form dl×r.
- ★ **KEY HIDDEN POINT** *"The axial field points opposite ways on the two sides (in one side, out the other)."* → It is the **same direction on both sides**. *(Teacher: the thing textbooks hide.)*
- ★ *"Integrate the whole dB."* → Integrate only the surviving axial component; the radial one is killed by the opposite element.
- ★ *"On the B-vs-x graph the field flips sign across the centre."* → It stays single-signed (never crosses zero); the sign-flip graph is the MCQ decoy.
- ★ *"The angle between dl and r is not 90°."* → It is exactly 90° (dl into the plane, r in it), so sin90=1 from the start.
- ★ *"Pair opposite elements (2 dB sinθ) and still integrate the full ring."* → Then you must integrate over **half** the ring or you double-count.

**4 · What must be seen:** an element dl with its r to P and the 90° highlighted in 3D (felt, not asserted); the dB drawn genuinely ⊥ to *both* dl and r (rotate to prove it isn't just "into the page"); the opposite element's dB resolved alongside, the radial pair visibly cancelling and the axial pair adding; the element sweeping the ring so dB vectors trace a cone and the axial parts stack; the B-vs-x curve building live — peak at centre, symmetric falloff, asymptote to zero, **staying on one side of the axis**; flipping the current and watching the whole field + graph flip together on both sides at once.

**5 · Exam-critical:** 3-mark derivation of B=μ₀IR²/[2(R²+x²)^(3/2)]; centre as x=0; ×N for an N-turn coil; direction MCQ (same on both sides — looks free, traps on direction); graph-match MCQ (single-signed bell vs sign-flip decoy); limits (max at centre, →0 at infinity); vector-form computation when dl,r given as i-j-k.

**6 · Problem-classes:** *Axial-field direction / same-on-both-sides identification* · *B-vs-x graph selection* · *Centre-as-limit (x=0) & N-turns scaling* · *Far-field on-axis limit behaviour*.

**Aha:** by symmetry every element's radial component is annihilated by its diametric twin, so only the axial component survives — and it points the **same way on both sides**, giving a single-signed bell-shaped B(x) that peaks at the centre.

**Discovery vs catalog:** A23 is correct but **under-ranked on pedagogy**. The high-yield payload is not the formula but the *direction* claim ("same on both sides") + the graph-sign MCQ — both should be the headline EPIC-C branch and headline must-see, which a formula-first catalog entry would never rank first. Vector-form dl×r and N-turns scaling are minor extensions worth flagging.

---

## ✅ Lecture 04 — Ampère's circuital law (wire & cylindrical conductors)  *(first-pass distilled)*

**Atoms:** A26 (Ampère's law) · A21 (straight-wire field, re-derived) · A20 (Biot–Savart, contrast method) · **+ non-uniform-J ring integration (no catalog atom)**

**1 · Sequence:** frame as the magnetic analogue of Gauss's law (length-integral replaces area-integral) → state ∮B·dl=μ₀I_enc → introduce the self-chosen 2D Amperian loop through the target point → loop direction by curl rule fixes each enclosed current's sign → state the three usefulness conditions (B tangential & constant / B ⊥ / B=0) → stress the law is valid everywhere but useful only under symmetry → clarify B in the integral is from **all** currents, only I_enc on the right → derive B=μ₀I/2πr for an infinite wire → extend to hollow cylinder (B=0 inside, μ₀I/2πr outside) → solid cylinder via J=I/A (B∝r inside, B∝1/r outside) → build the full B-vs-r graph → escalate to non-uniform J=J₀r requiring ring-by-ring integration of dI=J·dA.

**2 · Hook:** positions the law as the "cousin" of Gauss's law students already used for spheres/cylinders in electrostatics — the exact magnetic parallel, a symmetry-only shortcut contrasted with the three prior Biot–Savart lectures.

**3 · Misconceptions ★:**
- ★ *"B in the line integral comes only from the enclosed current."* → B is from **all** currents; only I_enc appears on the right.
- ★ *"Multiply J by total area even when J varies."* → Only valid for constant J; for J=J₀r integrate J·dA over rings.
- ★ *"Use the wire's full radius R in the enclosed-area term."* → Both ∮B·dl and the I_enc area use the **loop** radius small-r, not the wire radius R.
- ★ *"Ampère's law is only *valid* where symmetry holds."* → Valid everywhere, merely *useful* only under symmetry (Griffiths) — still give NCERT's conditions if a board asks.
- ★ *"Always choose a loop direction and split currents ±."* → Only needed when two opposite currents are present.
- ★ *"The Amperian loop is a 3D surface like the Gaussian sphere."* → A 2D closed path; the integral runs along its length.
- ★ *"There must be a thin central wire, since the outside field looks like an infinite wire's."* → That's just the external appearance, not the real geometry.

**4 · What must be seen:** the self-chosen loop drawn through P, shown edge-on vs top-view; B vectors tangential and equal-magnitude all the way around (the symmetry that lets B leave the integral); the enclosed region growing as the loop radius grows; the piecewise B-vs-r graph assembling live (flat-zero-then-1/r hollow; rising-linear-then-1/r peak-at-surface solid; r²-rising for J=J₀r); a thin ring of radius x width dx unrolled into a 2πx strip accumulating dI as it sweeps outward; curl fingers along the loop, thumb fixing the positive current.

**5 · Exam-critical:** derive B=μ₀I/2πr via Ampère's law; hollow cylinder (0 inside, μ₀I/2πr outside) + graph; solid uniform cylinder (B=μ₀Ir/2πR² inside, 1/r outside, peak at r=R); non-uniform J=J₀r → integrate to B=μ₀J₀r²/3 inside; convert inside-solid to B=μ₀Jr/2; state the usefulness conditions; B-vs-r graph as a standalone question across all four geometries; multiple opposite currents → signed I_enc.

**6 · Problem-classes:** *B-vs-r profile across a conductor cross-section* · *Growing Amperian loop enclosing variable current* · *Ring-integration of a non-uniform current density* · *Inside-vs-outside field identity puzzle*.

**Aha:** Ampère's law turns a hard Biot–Savart integral into one line when symmetry is present — choose your own loop and ∮B·dl=μ₀I_enc collapses to B·(2πr)=μ₀I_enc — and only the *enclosed* current sets the magnitude, even though the field is built by every current in space.

**Discovery vs catalog:** the flat single atom A26 badly under-weights a **ladder of three cylinder geometries** (hollow → uniform-solid → non-uniform J=J₀r, the last NOT in the catalog) each with a distinct B-vs-r law and graph. Three discovery-grade misconceptions (B-from-enclosed-only; small-r-vs-R area; can't-multiply-J-when-varying). The J=J₀r ring-integration is a standard JEE escalation the catalog omits. **A26 should be sub-atomised by geometry.** Solenoid/toroid explicitly deferred.

---

## ✅ Lecture 05 — Solenoid  *(first-pass distilled)*

**Atoms:** A27 (solenoid B=μ₀nI) · A26 (Ampère re-derivation) · A23 (single-ring axial field, reused) · A22 (curl direction) · **+ finite-solenoid (μ₀nI/2)(cosθ₁−cosθ₂) (no catalog atom)**

**1 · Sequence:** define a solenoid (insulated wire close-wound on a non-conducting tube); show a current-carrying solenoid behaves like a bar magnet (parks N-S, flips 180° on current reversal) → cut-through 2D view (dots top, crosses bottom) → introduce n=N/L as the master quantity → recall the single-ring axial field → slice into elemental rings of length dx, each with effective current **I′=(n dx)I** → write dB, switch the variable x→axis-angle θ (x=R cotθ) → integrate θ₂→θ₁ → **B=(μ₀nI/2)(cosθ₁−cosθ₂)** → ideal (infinite) limit θ₁→180°, θ₂→0 ⇒ **B=μ₀nI** → exact end (180°,90°) ⇒ **μ₀nI/2** → field outside ≈0 → B-vs-distance graph → re-derive μ₀nI from Ampère's law on a rectangular loop, killing three of the four legs.

**2 · Hook:** a thread-spool analogy (wire wound like thread on a bobbin), then the showstopper — freely suspend the current-carrying solenoid and it parks itself N-S like a magnet, reversing 180° the instant you flip the battery. "It *is* a magnet" justifies studying it here.

**3 · Misconceptions ★:**
- ★ *"Each slice carries only the single-wire current I."* → Each elemental ring is a bundle of turns; effective current is **I′=n·dx·I** (the conceptual crux).
- ★ *"Integrate over x."* → Switch to the axis angle θ so limits become the two clean end-angles.
- ★ *"θ₁,θ₂ are the small acute angles you see at each end."* → Measure both from the same positive axis direction; the far end is **obtuse** (e.g. 180−30).
- ★ *"Field at the very end equals μ₀nI."* → At the exact edge it is **half**, μ₀nI/2.
- ★ *"'Ideal' means an infinitely long coil."* → Ideal just means length ≫ radius with high N; a ~1 m coil already behaves ideal.
- ★ *"The field is strong outside too."* → Outside ≈0; adjacent coils' external fields cancel.
- ★ *"Interior field is μ₀nI only on the exact axis."* → Uniform μ₀nI at **any** interior point (axis or off-axis), except at the edge.
- ★ *"The minus sign from Ampère (cos180) means a negative field."* → It only reflects loop-traversal direction; magnitude is μ₀nI.
- ★ *"Assign lengths to the perpendicular Ampère-loop sides."* → Their contribution is zero regardless of length; only the inside leg survives.

**4 · What must be seen:** the solenoid suspended, settling N-S, then snapping 180° on current reversal; the cut-open cross-section (dots top, crosses bottom) with field arrows building between; an elemental ring lighting up and expanding to reveal it contains several turns, labelled I′=n·dx·I; the angle θ sweeping slice-by-slice from θ₂ to θ₁; θ₁ drawn as the **obtuse** far angle beside the acute θ₂ (the 180−angle convention made unmistakable); the B-vs-distance graph (flat μ₀nI plateau, halving at each end); field lines tight inside, fanning at the mouths; two neighbouring coils' external arrows cancelling; the Ampère loop ABCD with three legs greying out, only the inside leg live.

**5 · Exam-critical:** finite solenoid at an axial point — read θ₁ (obtuse far), θ₂ → B=(μ₀nI/2)(cosθ₁−cosθ₂); ideal → μ₀nI (default when no L,R given); exact end → μ₀nI/2; board derivation from Ampère's law with the stated assumptions (B outside=0; B inside straight/parallel/uniform); direction by curl rule and current reversal; "length ≫ radius, high N" as the ideal condition.

**6 · Problem-classes:** *Finite-solenoid field via the two end-angles* · *Limit-collapse: finite → ideal & → end-point* · *Field-line density vs magnitude inside vs at the mouths* · *Ampère-loop segment audit*.

**Aha:** a solenoid's on-axis field is just the superposition of many ring-fields — chop it into rings, give each its **true bundled current n·dx·I** (not I), integrate over the axis angle → B=(μ₀nI/2)(cosθ₁−cosθ₂), collapsing to μ₀nI ideal and μ₀nI/2 at the ends. Turns-per-unit-length n converts a one-wire current into the per-slice current that drives the field.

**Discovery vs catalog:** A27 badly under-represents the topic. The real teaching object is the **finite-solenoid angle form** (μ₀nI/2)(cosθ₁−cosθ₂) — A27 lists only the ideal limit. The **obtuse far-end-angle convention** is a teacher-flagged high-frequency error and the best sim showpiece (drag-P-and-watch-θ). End=μ₀nI/2 and outside≈0 are distinct memorisable results A27 folds invisibly. Also: A27 is taught twice (ring-superposition AND Ampère's law) — A26's canonical worked example *is* the solenoid. Catalog was NOT complete here.

---

## ✅ Lecture 06 — Toroid  *(first-pass distilled)*

**Atoms:** A28 (toroid field) · A26 (Ampère's law) · A27 (solenoid analogy)

**1 · Sequence:** define a toroid (hollow ring densely wound) and reframe it as a solenoid bent into a circle → declare three target points (inside the hole / outside / within the core) → apply Ampère's law at the hole (I_enc=0 → B=0) → at the outside point (out-currents and in-currents pierce in equal counts → net I_enc cancels → B=0) → at the core (only the inner-edge current threads the loop once per turn → no cancellation) → argue B tangential (curl rule) and constant by symmetry → pull B out, ∮dl=2πr → I_enc=N·I → **B=μ₀NI/2πr** → introduce n=N/2πr → rewrite **B=μ₀nI** for an ideal thin toroid, flagging the thin-core assumption.

**2 · Hook:** physically reframes a familiar object — take the solenoid you already know and bend it into a ring; then poses the puzzle of finding B at three distinct locations.

**3 · Misconceptions ★:**
- ★ *"There's a field in the hollow centre."* → Inner loop encloses zero current → B=0.
- ★ *"There's a field outside the toroid."* → Outward and inward currents cancel → net I_enc=0 → B=0.
- ★ *"Enclosed currents always simply add (no sign)."* → Pick a loop direction; one pierce sense is +, the other −; this is why the outside field cancels.
- ★ *"The cancellation that gave B=0 outside also applies at the core."* → At the core only the inner edge threads the loop, no cancelling return current → I_enc genuinely non-zero.
- ★ *"B=μ₀nI is the primary toroid formula, like a solenoid."* → B=μ₀NI/2πr is the exact ("100% correct") result; μ₀nI is valid only for an ideal thin toroid.
- ★ *"The radii R₁, R₂, mean-r are interchangeable."* → They differ; only in the ideal thin limit (D≪R) are they treated as equal.
- *"n here means per-straight-length like in a solenoid."* → Here unit length is the circumference 2πr, not a straight axis. *(Not verbalized.)*

**4 · What must be seen:** the solenoid bending into a closed ring; an Amperian circle through each of the three points with the enclosed current highlighting; current piercing the loop as dots/crosses around the ring (equal counts cancelling for the outside loop); at the core, only the inner-edge current threading once per turn with no partner; curl-rule tangential B circulating inside the core; B drawn tangent and equal-magnitude around the circle; N turns each adding one I-pierce to N·I; shrinking the core thickness D→0 so R₁,R₂,r collapse to one radius (the ideal limit).

**5 · Exam-critical:** compute core B=μ₀NI/2πr given N,I,mean-r; state/prove B=0 in the hole and outside; convert between μ₀NI/2πr and μ₀nI (n=N/2πr); toroid-vs-solenoid comparison; identify when the ideal μ₀nI is valid (D≪R); field-ratio problems using mean vs inner/outer radius.

**6 · Problem-classes:** *Three-point field probe (hole / outside / core)* · *Current-piercing sign-cancellation visual* · *Ideal-toroid thickness limit*.

**Aha:** the toroid confines its entire field inside the core — zero in the hole, zero outside — because only at the core does an Amperian loop enclose uncancelled current (N·I), giving B=μ₀NI/2πr. The field is trapped within the ring.

**Discovery vs catalog:** well beyond a bare "A28 toroid" stub. New/under-weighted: the **three-point probe** (the two B=0 results taught as deliberate misconception-busters, not footnotes); the **sign-convention cancellation** as the load-bearing idea (outside-zero is the same dots-vs-crosses cancellation that does *not* happen at the core); the exact-vs-ideal two-formula distinction (μ₀NI/2πr exact; μ₀nI only thin-limit, validity D≪R); and the R₁≠R₂≠r radius distinction that collapses only in the ideal limit.

---

## ✅ Lecture 09 — Helical path of a moving charge  *(first-pass distilled)*

**Atoms:** A11 (helix) · A12 (pitch) · A4 (direction) · A6 (v∥B→straight) · A7 (circle ⊥) · A8 (r=mv/qB) · A9 (period) · A10 (period speed-independent)

**1 · Sequence:** recap F=qvB sinθ + palm rule → recap the two special cases (θ=0/180 straight; θ=90 circle, r=mv/qB, T=2πm/qB) → introduce the arbitrary-angle case → resolve v into v∥=v·cosθ and v⊥=v·sinθ → v∥ drives uniform straight drift, v⊥ drives the circle → superpose → helix → derive **r=m·v·sinθ/qB** (force=centripetal with v⊥) → show **T=2πm/qB is unchanged** (speed-independent) → derive **pitch p=v∥·T=v·cosθ·(2πm/qB)** → formula and vector-form numeric examples → close on a trick case where the whole velocity is perpendicular (pure circle, zero pitch).

**2 · Hook:** a charge "walking carefree in a park" nudged off-course; frames the two known cases (straight at θ=0, circle at θ=90) as the boundaries, then the cliff-hanger: what about 30, 45, 60, 120 — building to the helix reveal.

**3 · Misconceptions ★:**
- ★ *"Plug the full speed v into the radius formula."* → Radius uses v·sinθ (v⊥), not v.
- ★ *"The period depends on speed or angle."* → T=2πm/qB is independent of both.
- *"Pitch uses the perpendicular component."* → Pitch is the forward distance, uses v∥=v·cosθ. *(Not verbalized — but easy to swap.)*
- ★ *"Any charge at an angle to B traces a helix."* → If both given components are ⊥ to B, net v⊥B → pure circle, zero pitch.
- ★ *"The v∥ component also gets bent/circled."* → v∥ is untouched — constant-speed straight drift; only v⊥ circles.
- *"v∥ is always horizontal, v⊥ always vertical."* → In vector problems decide parallel/perpendicular relative to B's actual i/j/k direction. *(Not verbalized.)*

**4 · What must be seen:** the velocity splitting into v·cosθ (along B) and v·sinθ (⊥ B) as θ varies on a slider; the ⊥ component tracing a circle while the ∥ component drags the circle's centre forward, superposing into a 3D helix; the helix advancing exactly one pitch per loop; period staying constant while speed/radius change (two helices side by side, different radii, same T); the degenerate case (v∥→0 collapses the helix to a flat circle); the force vector always pointing to the helix axis.

**5 · Exam-critical:** given v,B,θ,q,m compute r=m·v·sinθ/qB, T=2πm/qB, p=v·cosθ·T; vector-form velocity → identify which component is ∥ vs ⊥ to B then apply; pitch = v∥×T; degenerate trick (net v⊥B → pure circle, no pitch); composing net speed from ⊥ components (Pythagoras) before the ∥/⊥ split; period speed- and angle-independent.

**6 · Problem-classes:** *Helix three-parameter solve* · *Pitch as forward-distance-per-loop* · *Vector-form parallel/perpendicular triage* · *Degenerate trick — helix collapses to circle* · *Angle/speed sweep at constant period*.

**Aha:** an arbitrary-angle velocity is just the superposition of the two known cases — v∥ flies straight (untouched by B) while v⊥ circles — add them for a helix, where radius is set by v⊥ but the period is set only by m, q, B.

**Discovery vs catalog:** confirms A11/A12 and reinforces A8/A9/A10, but the catalog under-weights: two policed misconceptions (full-v-in-radius; period-depends-on-speed), the pitch-vs-radius component swap, the **degenerate trick** problem-class (a vector question engineered so the "helix" is a pure circle — an interactive drive-v∥-to-zero sim teaches it), and the vector-form ∥/⊥ triage the catalog treats as trivial. Catalog atoms complete; the misconception ranking + degenerate/triage problem-classes are the additions.

---

## ✅ Lecture 10 — Lorentz force in combined E & B · velocity selector  *(first-pass distilled)*

**Atoms:** A34 (combined Lorentz qE+qv×B) · A13 (velocity selector v=E/B) · A3 (qv×B) · A4 (palm direction) · A5 (no work) · A6 (v∥B→F=0) · A7 (circle ⊥) · A8 (r=mv/qB) · A11 (helix) · A12 (pitch)

**1 · Sequence:** recall qE (acts at rest or moving) and qvB sinθ (only moving), combine into the **Lorentz force** → **CASE A E∥B**: A1 charge at rest (straight accelerated, v linear, displacement ∝ t²); A2 launched ∥ (magnetic force still 0, straight with v₀); A3 launched ⊥ (E boosts axial speed, B circles v⊥ → helix with **growing pitch** P₃>P₂>P₁, radius fixed); A4 arbitrary angle (split v, ∥ drifts + E-accelerated, ⊥ circles → variable-pitch helix; E off → constant pitch) → **CASE B E⊥B** (headline): parallel-plate E crossed with inward B, charge ⊥ both, so E-force and B-force act along the **same line** opposing → three sub-cases (Fe>Fb one parabola, Fe<Fb the other, Fe=Fb straight) → derive **v=E/B** (q cancels) → explain the velocity selector (only v=E/B exits the slit; faster/slower deflect opposite ways), anchored to beta particles → close with the cycloid (rest-start in E⊥B, stated and felt, flagged beyond syllabus).

**2 · Hook:** two chapters collide — the electric force (qE, any charge) meets the magnetic force (qvB, moving only). When BOTH fields share a region, what force and what path? The teased payoff is the velocity selector — the one case where the forces fight to a standstill.

**3 · Misconceptions ★:**
- ★ *"Any moving charge in B gets a force."* → v∥B → sinθ=0 → force 0 despite moving.
- ★ *"At an angle, the whole speed feeds the magnetic force."* → Only v·sinθ (⊥ part) does; the ∥ part is "forgiven."
- ★ *"A helix always has equal-spaced turns (constant pitch)."* → With E accelerating the axial speed, pitch grows every loop (P₁<P₂<P₃); the MCQ hides two helical decoys.
- ★ *"The magnetic force changes speed / does work."* → It only bends direction; E speeds the axial motion.
- ★ *"In crossed fields the E and B forces are perpendicular like before."* → In E⊥B-with-v⊥both they act along the **same line** and oppose.
- ★ *"Faster and slower particles deflect the same way in the selector."* → Faster → one parabola, slower → the other (depends on v vs E/B).

**4 · What must be seen:** rest charge in E∥B accelerating with a v-vs-t straight line drawing itself; the ⊥-launch case combining circular turning + axial march LIVE into a 3D helix; **the helix pitch visibly stretching loop-by-loop** (P₁<P₂<P₃) because E keeps boosting the axial speed (the key animation of the E∥B half); a tilted launch velocity splitting into a B-∥ component (ignored) and a B-⊥ component (circles); the E⊥B setup with E-force and B-force arrows on the SAME charge pointing OPPOSITE along one line; the velocity selector — a fan of mixed speeds entering, v=E/B shooting straight through the slit while faster/slower bow opposite ways; a slider tying v vs E/B to the deflection; the cycloid from rest.

**5 · Exam-critical:** identify the path (straight/circle/parabola/helix-constant/helix-variable/cycloid) from the E,B,launch orientation; variable-pitch helix (E along axis → pitch grows, radius fixed; vs constant when E off — a two-decoy MCQ); v=E/B and q cancelling in QE=QvB; three-way deflection classification; "path when E is switched off" (helix reverts to constant pitch); component resolution before computing r and p; right-hand palm per diagram (re-derive, don't memorize the sign).

**6 · Problem-classes:** *Variable-pitch helix in E∥B* · *Three-way force-balance deflection in crossed E⊥B* · *Velocity selector filtering a speed spread* · *Angle-launch decomposition (helix from a tilted entry)* · *Cycloid from rest in crossed fields*.

**Aha:** in crossed E and B the electric and magnetic forces act along the same line and oppose, so there is exactly ONE speed v=E/B at which they cancel and the charge sails straight through — every other speed gets bent. That single balanced speed is the whole idea of the velocity selector.

**Discovery vs catalog:** more than confirmation. A13 is listed as a bare formula, but it is best taught as the **third of a three-way force-balance triptych** (the parabolic-deflection cases ARE the pedagogy that makes v=E/B click, and aren't their own atom). The **variable-pitch helix** is a genuine discovery target — A11/A12 cover pure-B constant-pitch, but here E continuously stretches the pitch loop-by-loop. New/unmapped: the cycloid from rest (flagged beyond syllabus) and the beta-particle anchor. The E∥B case-ladder (rest/parallel/perpendicular/arbitrary) is an un-enumerated taxonomy.

---

## ✅ Lecture 11 — Cyclotron  *(first-pass distilled)*

**⚠️ Partial transcript:** only the first ~half is present. The exit-energy derivation **KE=q²B²R²/2m**, the resonance / period-independence condition **f=qB/2πm** (the A10 punchline), and the uses/limitations summary are in the un-transcribed second half and could NOT be distilled. Everything below is the present first half: motivation, the two-problem reframe, construction, and the qualitative working cycle.

**Atoms:** A14 (cyclotron) · A5 (B does no work — prerequisite) · A8 (r=mv/qB — prerequisite) · A7 (circular when v⊥B) · *(A10 frequency-independence almost certainly in the missing half)*

**1 · Sequence:** what a cyclotron is (accelerate charges to high speed/energy) and why (penetrate nucleus, ion implantation, trigger decay) → ask how to speed up a charge, rule out B (changes direction not speed, KE constant), conclude E accelerates → single plate-pair gives QE → a=QE/m, speed rises the longer it stays in the field → expose the two failures of just enlarging the gap (machine balloons; E=V/d collapses) → reframe: keep the particle in the SAME small strong gap longer → add B to bend it back into the gap repeatedly → build the construction (two hollow semicircular dees, central source S, high-V high-f AC oscillator, horseshoe magnet, exit deflector) → walk the cycle: accelerate across the gap, enter a dee where E=0 (metal shields) so it only circles, exit, AC polarity flips just in time, accelerate again, larger circle each pass (r=mv/qB), spiral outward; frequency tuned to the flip; deflector ejects at the rim. *(Transcript cuts off here.)*

**2 · Hook:** frames the topic as a "story" you listen to and write down — exam questions come straight from the narrative. Motivates by asking WHY anyone needs ultra-fast charged particles (smash the nucleus, implant ions, trigger decay), then poses it to students: "how would YOU speed a charge up?" — letting first wrong guesses (magnetic field, throw harder, bigger machine) drive the design.

**3 · Misconceptions ★:**
- ★ *"A magnetic field can speed up the charge / raise its KE."* → No — B only changes direction; speed and KE constant. (The load-bearing misconception that motivates the whole design.)
- ★ *"To accelerate longer, just make the machine bigger / move the plates apart."* → Two failures: size balloons, and E=V/d collapses as d grows. Re-use one small gap instead.
- ★ *"E still acts inside a dee."* → E=0 inside the hollow metallic dee (conductor shielding); speed can't rise there.
- ★ *"The particle traces one fixed circle and loops forever."* → Each crossing adds speed → radius grows → it spirals outward.
- ★ *"Speed rises continuously."* → Constant during each semicircle; jumps only during the brief gap-crossing (step-wise).

**4 · What must be seen:** the same accelerating gap re-used many times (cross, circle in a dee, cross again); AC polarity flipping in sync exactly as the particle exits a dee; speed staying CONSTANT during each arc and jumping only at the gap (step-wise); radius growing each pass → outward spiral from r=mv/qB; E vanishing the instant the particle enters the hollow dee (conductor shielding); a contrast demo — B bending without changing speed vs E changing speed, side by side.

**5 · Exam-critical:** time-in-field / number of revolutions before exit; max speed & KE at the rim from r=mv/qB with r=R (the canonical KE=q²B²R²/2m — *in the missing half*); resonance condition f=qB/2πm (*likely missing half*, high-yield); why B can't accelerate (B does no work); why E=0 inside a dee; radius at the n-th pass / spacing of semicircles; effect of changing B, V, mass/charge on max energy and required frequency.

**6 · Problem-classes:** *Step-wise speed build-up across passes* · *Growing-radius outward spiral from r=mv/qB* · *AC polarity / particle-exit timing handshake* · *Field-shielding inside the dee (E=0 region)*.

**Aha:** a cyclotron doesn't need a bigger field or a longer gap — it traps the particle in ONE small strong electric gap and re-uses it dozens of times, because the magnetic field bends it back to the gap after every crossing while the AC polarity flips in perfect sync, so speed builds up step by step and the path spirals outward.

**Discovery vs catalog:** A14 ("device, KE=q²B²R²/2m") under-specifies the **design-motivation narrative** the formula hides — a ranked misconception chain (B-can-speed-it → make-it-bigger → E-acts-in-the-dee → fixed-circle → smooth-speed-rise), none in the atom list and all stated by textbooks as facts rather than student errors. The step-wise speed must-see and the "why not just enlarge it" failure mode (size + E=V/d) are genuine discovery. Notably the lecture frames the two fields as "crossed fields" doing distinct jobs in **separate regions** — NOT the combined Lorentz A34 (E and B act sequentially, never simultaneously). **Honest gap:** the catalog-defining exit-energy + resonance pieces are in the missing half and cannot be confirmed from this transcript.

---

## ✅ Lecture 12 — Force on a current-carrying conductor  *(first-pass distilled)*

**Atoms:** A15 (F=IL×B) · A16 (curved wire = straight endpoint chord) · A17 (closed loop net force 0) · A3 (per-charge force) · A4 (palm direction) · **+ ring tension T=IBR & non-uniform-field force (no catalog atoms)**

**1 · Sequence:** a current-carrying wire = many moving charges (recall I=nev_dA) → replace electron drift with an imaginary positive charge along the current → force on one charge = q(v_d×B) → count charges in an elemental volume (N=n·A·dL), sum, integrate → the nev_dA factor collapses to I → **F=IL×B=IBL sinθ** → fix the sign by testing L×B vs B×L against the actual inward force → θ is the angle between the **L-vector and B** (not the drawn angle); max IBL when wire⊥B → direction by palm / Fleming-left → curved/bent wire: ∫dL=displacement, use the **endpoint chord** → closed loop: displacement 0 → net force 0 in uniform field → but net 0 ≠ tension 0 → derive **ring tension T=IBR** from a dθ element → non-uniform field (near an infinite wire): cut a dx element, use local B(x), integrate; a closed square loop here has **non-zero** net force.

**2 · Hook:** contrasts with prior lectures — until now a single moving charge felt a force, but a wire is just many moving charges, so the whole wire should deflect. Promises to derive the formula from scratch, not just state it.

**3 · Misconceptions ★:**
- ★ *"θ in IBL sinθ is the drawn figure angle between the wire and a baseline."* → It is the **L–B angle**; with B into the page and L in-plane it's 90°, so IBL not IBL·sin30. **The showpiece trap (deliberately drawn to confuse).**
- ★ *"For a bent/curved wire add up each segment separately."* → The "donkey" method; ∫dL=displacement, only the endpoint chord matters.
- ★ *"For a curved wire use the actual path length (πR for a semicircle)."* → Use the displacement length (2R), not arc length.
- ★ *"Net force 0 on a closed loop means tension 0 too."* → Net force 0 but every element is pushed outward → real tension T=IBR. (Most students answer 0.)
- ★ *"IL×B or IB×L — either ordering is fine."* → Only L×B gives the correct inward direction; B×L is wrong.
- ★ *"In a non-uniform field just plug the mid-point B into IBL."* → Mid-point only works for linear B; for B∝1/x you must integrate.
- ★ *"A closed loop always has zero net force."* → Only in a **uniform** field; near an infinite wire the near/far arms differ → non-zero net.
- ★ *"Current is a vector."* → I is not a vector; the length L is the vector, along the current.

**4 · What must be seen:** discrete charges drifting with an imaginary positive charge running along the current (substitution visible); all per-charge force arrows pointing the same way, adding to one net wire force; the L-vector and B with the TRUE angle highlighted while a decoy 30° figure-angle is shown separately; a bent/zig-zag wire collapsing onto the single displacement chord with the force unchanged; a semicircle's arc-length (πR) crossed out, the diameter chord (2R) lit; four outward force arrows on a square loop summing to zero; a current ring stretched taut with a zoomed dθ element (IB·dL outward vs 2T sin(dθ) inward); field lines thinning with distance from an infinite wire, near arm feeling more force than the far arm.

**5 · Exam-critical:** decoy-angle wire in an into/out-of-page field → real angle 90°, answer IBL; bent/arc/semicircular wire → replace with the endpoint chord; net force on any closed loop in uniform field = 0; ring tension T=IBR; force on a finite wire parallel to an infinite wire → dx integration giving (μ₀I₁I₂/2π)·ln((a+L)/a); net force on a square loop near an infinite wire → ∝ μ₀I₁I₂d²/[2πa(a+d)], attract/repel by current sense; direction drills with dot/cross symbols.

**6 · Problem-classes:** *Decoy-angle in a perpendicular field* · *Bent-wire = displacement length* · *Closed-loop net force = 0* · *Ring tension from a dθ element* · *Non-uniform field integration (finite wire near infinite wire)* · *Closed loop in non-uniform field (square near infinite wire)*.

**Aha:** the integral of dL over a wire is its displacement, so the force on ANY shaped current segment in a uniform field depends only on the straight line joining its endpoints — which instantly explains why a closed loop has zero net force, and turns ugly bent-wire problems into one-line answers.

**Discovery vs catalog:** the catalog lists A15/A16/A17 as three flat facts, but they are **one idea — ∫dL=displacement**; the displacement-length "shortcut vs donkey" is a high-value problem-class the taxonomy misses. Two genuinely new items beyond A1–A34: the **ring tension T=IBR** ("net force 0 ≠ tension 0") and **force in a non-uniform field** (finite wire & closed loop near an infinite wire, where a closed loop has NON-zero net force — directly contradicting the naive reading of A17, exposing the mid-point-B trap). The "θ is the L–B angle, never the drawn figure angle" trap is the single highest-yield error.

---

## ✅ Lecture 13 — Force between two parallel currents  *(first-pass distilled)*

**Atoms:** A18 (force between parallel currents) · A19 (ampere definition) · A15 (F=IL×B, applied) · A21 (B of long wire, applied) · A22/A4 (right-hand rules)

**1 · Sequence:** observe — same-direction currents attract, opposite repel (wires act magnet-like) → wire-1's field at wire-2 is B=μ₀I₁/2πd → wire-2 sits in it, feels F=BI₂L sinθ, θ=90° always (field⊥wire) → can't use total length (infinite) → switch to **force per unit length F/L=μ₀·2I₁I₂/4πd** → direction by palm rule → re-derive the force ON wire-1 DUE TO wire-2 → identical magnitude (**Newton's third law F₂₁=−F₁₂**) → flip one current to show repulsion (same magnitude, only direction changes) → use the attraction to **define 1 ampere** (1 A, 1 m apart → 2×10⁻⁷ N/m) → close on a 3-wire net-force worked type (signed superposition).

**2 · Hook:** starts from a concrete observation, not a formula — place two parallel wires close: same-direction current attracts, opposite repels, exactly like magnets. Then asks "why?" and "how much?", motivating the derivation as a post-mortem of a real phenomenon.

**3 · Misconceptions ★:**
- ★ *"The wires will visibly stick / snap together."* → The force is tiny (2×10⁻⁷ N/m); friction/tension/mounting holds household wires in place.
- ★ *"1 ampere is a small current."* → It is large — anchored to household max permissible current.
- ★ *"Attract vs repel changes the magnitude."* → Magnitude is identical (μ₀·2I₁I₂/4πd) in both; only the direction flips.
- ★ *"You can compute the total force on an infinite wire."* → Impossible (L→∞ ⇒ F→∞); the quantity is force PER UNIT LENGTH.
- ★ *"θ in F=BIL sinθ is arbitrary / re-worked each time."* → Field is into-page, wire vertical → θ=90° here; usually 90° but must be checked.
- *"F₂₁ and F₁₂ might differ because the currents differ."* → Re-derive the second force; it equals the first regardless. *(Pre-empted; not strongly verbalized.)*

**4 · What must be seen:** two parallel wires; toggling both currents to SAME direction pulls them together, OPPOSITE pushes them apart (the central cause-effect); wire-1's circular field rendered, with its value at wire-2 shown as ⊗ (wire-2 sitting inside wire-1's field); palm-rule animation producing the force from wire-2 toward wire-1; the symmetric mirror — wire-2's field at wire-1 is ⊙, force points back, equal-and-opposite arrows appear simultaneously (third law); the force-per-unit-length idea (highlight an L-segment, force per metre, can never shade the whole infinite wire); the 1-ampere scene (1 m apart, 1 A, meter reading 2×10⁻⁷ N/m, slider showing force shrinking with distance); the 3-wire scene (A attracts B, C repels B, both arrows on B add).

**5 · Exam-critical:** compute F/L given I₁,I₂,d (=μ₀I₁I₂/2πd); attract vs repel from current directions; net F/L on a middle wire among 3+ (signed superposition); convert per-unit-length to a finite length (×metres) — guards the infinite-wire trap; state/apply the SI 1-ampere definition; verify F₂₁=−F₁₂ even when I₁≠I₂.

**6 · Problem-classes:** *Three-wire net force on the middle wire* · *Attract-vs-repel toggle* · *Distance / current sensitivity of the force*.

**Aha:** the force between two parallel wires is NOT a new fundamental force — it is one wire sitting inside the other's magnetic field and feeling the ordinary F=IL×B. Same direction → attract; opposite → repel; and by Newton's third law the two forces are always equal and opposite, whichever current is larger.

**Discovery vs catalog:** the catalog lists A18 as a formula; the lecture adds the "why don't they visibly stick" misconception (tied to the smallness of the force), the "1 A is NOT small" anchor, the **three-wire net-force** problem-class (signed attract+repel superposition — the main worked type and explicit homework), and the "can't compute total force on an infinite wire → use F/L" conceptual gate. Teaching-order insight the flat catalog hides: A18 is **A15 applied to A21's field**, not fundamental.

---

## ✅ Lecture 14 — Magnetic moment · loop as a dipole  *(first-pass distilled)*

**Atoms:** A29 (m=NIA) · A31 (loop = magnetic dipole) · A33 (revolving-electron moment, m/L=e/2m) · **+ Bohr quantization & continuous-body L=Iω (cross-topic)**

**1 · Sequence:** recall electric dipole moment p (−→+) → magnetic dipole = bar magnet, moment points S→N → monopoles don't exist (cut a magnet → two magnets) → a current loop builds bar-magnet field lines (curl rule) → inside the magnet field runs S→N so loop faces are S/N (clockwise-viewed=S, anticlockwise=N) → define **m=I·A** (area vector), direction S→N → right-hand-curl shortcut, works for any loop shape → m=I·A numerics with î/ĵ/k̂ → bent two-plane loop: split into two co-planar loops (shared branch carries zero net current) → tilted loop: area-vector = cross product of two sides → revolving electron: orbiting charge = current I=e/T=ev/2πr → m=IA=evr/2 → L=mvr (or Iω) → ratio **m/L=e/2m** (anti-parallel → minus sign) → apply Bohr L=nh/2π → m=neh/4πm, n=1 = Bohr magneton → close on a charged rotating ring (L=Iω=MR²ω → m/L=Q/2M).

**2 · Hook:** relates the brand-new "magnetic moment" to the already-familiar electric dipole moment from electrostatics — the magnetic twin of p — then drops the surprise that a humble current loop is secretly a tiny bar magnet.

**3 · Misconceptions ★:**
- ★ *"Monopoles exist — cut a magnet to isolate one pole."* → Cutting yields two complete magnets; never an isolated pole.
- ★ *"The moment points N→S like the external field lines."* → S→N (inside the magnet), analogous to −→+ for the electric dipole.
- ★ *"m=IA works only for circular loops."* → Any shape — square, triangle, arbitrary closed loop.
- ★ *"For a tilted/non-planar loop read the direction off by inspection."* → Use area-vector = cross product of two consecutive sides; eyeballing fails when tilted.
- ★ *"The area-vector direction / cross-product order can be set freely."* → Must be the S→N (right-hand-curl-with-current) sense; sign matters.
- ★ *"A revolving electron's angular momentum can be any value."* → Bohr quantization: L is an integer multiple of h/2π only.
- ★ *"Use r×p for a continuous rotating body."* → Single particle → L=mvr; continuous body → L=Iω.
- ★ *"m and L point the same way."* → Anti-parallel (electron charge negative) → m/L=−e/2m.

**4 · What must be seen:** a current loop overlaying a bar magnet with field lines threading continuously S→N inside; right-hand curl — fingers along current, thumb popping out as m / area-vector; flip-the-loop view (clockwise→S, anticlockwise→N face labels); the bent two-plane loop separating into two co-planar loops with the shared middle branch's opposite currents cancelling; a tilted (e.g. 60°) loop's area vector built as a cross product, resolved into î/ĵ/k̂; a single orbiting electron re-drawn as a steady ring current with m and L appearing anti-parallel; Bohr shells (n=1,2,3) lighting up to show L jumping in discrete h/2π steps.

**5 · Exam-critical:** m=I·A with vector direction (±k̂ via curl); N/S face from the viewed current sense; net moment of a bent two-plane loop (split, vector-add the two IA, take magnitude, √2·IA type); tilted-loop moment via area-vector cross product; revolving-electron m=evr/2; the gyromagnetic ratio m/L=e/2m; Bohr L=nh/2π → m=neh/4πm, n=1 = one Bohr magneton (recall the value); charged rotating ring/disc m/L=Q/2M via L=Iω.

**6 · Problem-classes:** *Bent loop across two planes* · *Tilted-plane area vector* · *Revolving-electron → equivalent current* · *Charged rotating ring/disc gyromagnetic ratio*.

**Aha:** a current loop is literally a magnetic dipole — it makes a bar-magnet field, has N/S faces set by the current's rotational sense, and a moment m=I·A pointing S→N (right-hand curl) — and the same idea applied to a revolving electron yields the universal gyromagnetic ratio m/L=e/2m.

**Discovery vs catalog:** the flat A29/A31/A33 atoms never name two sim-worthy 3D tricks — the **bent-loop-in-two-planes split** (add equal-opposite current to the shared branch) and the **tilted-plane area-vector-via-cross-product** — both the heart of exam questions. Plus a misconception priority (monopoles, moment-S→N, the r×p-vs-Iω trap) and the "loop overlays bar magnet, lines thread S→N" must-see that makes A31 click. **Note:** torque τ=m×B (A30) and PE U=−m·B (A32) are explicitly **deferred** — a clean A29/A31/A33 lecture.

---

## ✅ Lecture 15 — Torque on a current loop  *(first-pass distilled)*

**Atoms:** A30 (τ=m×B) ⭐ · A29 (m=NIA) · A31 (loop=dipole) · A17 (closed-loop net force 0) · A15 (per-side F=IL×B)

**1 · Sequence:** recap loop = dipole, m=IA, m direction by curl → baseline: rectangular loop in uniform inward field, plane⊥B so m∥B (angle 0) → force F=IBL on each of the four sides, all equal-opposite pairs → net force 0, net torque 0 (opposing forces share a line of action — pure stretch) → tilt by θ → m rotates by the same θ, so the m–B angle is θ (not 90−θ) → after tilt the two ⊥ sides keep force IBA, the inclined two do not → one pair still cancels on the same line; the other pair is equal-opposite on **different** lines → a couple → net force still 0, net torque appears → top view: moment arm (b/2)sinθ → τ=2·F·(b/2)sinθ=**IAB sinθ** → replace IA with m → **τ=mB sinθ=m×B** (pick m×B, not B×m, by r×F) → generalise to N turns τ=NIAB sinθ → τ_max at θ=90, τ=0 at θ=0/180 → tie to the electric-dipole analogue τ=P×E.

**2 · Hook:** reminds students a current loop acts like a magnetic dipole (from L14), then frames the topic as the magnetic twin of a result they met in electrostatics — torque on an electric dipole P×E. Same shape of physics, with a clean visual derivation.

**3 · Misconceptions ★:**
- ★ *"The angle is between the loop's plane (or sides) and B."* → θ is between **m and B**, not the loop face; students confuse it with 90−θ.
- ★ *"When tilted, the inclined sides still carry force IBb."* → Wrong — those wires are no longer ⊥ B.
- *"Net force is zero only in the perpendicular position."* → Net force is ALWAYS zero in a uniform field, any tilt, any shape. *(Not verbalized.)*
- ★ *"Equal-and-opposite forces always cancel completely (no torque)."* → Same line of action → cancel; **different** lines → a couple that rotates the loop. (The core aha.)
- ★ *"Net force zero implies net torque zero."* → In the tilted case net force 0 yet net torque ≠ 0.
- ★ *"m×B or B×m, either works since both give mB sinθ."* → Only m×B points along the actual torque (checked against r×F).
- ★ *"When the loop tilts, m stays where it was."* → m is rigidly ⊥ the loop, rotates by exactly the same θ.

**4 · What must be seen:** the m arrow sticking ⊥ the loop and rotating rigidly WITH it as it tilts, so the m–B angle visibly becomes θ; all four side-forces drawn live, updating as the loop tilts (the ⊥ sides keep their force, the inclined ones change); two equal-opposite forces sharing one line (cancel) vs the same pair on two parallel lines (couple) — the line-of-action shift is the whole point; the top-view collapse (loop edge-on as a rotating line, moment arm (b/2)sinθ dropping ⊥ the axis); the loop rotating about its axis once the couple appears, torque opposing the tilt; a θ sweep 0→90→180 with torque tracking sinθ.

**5 · Exam-critical:** τ=NIAB sinθ with the angle trap (loop-plane vs m–B); identify max-torque (m⊥B, plane∥B) and zero-torque (m∥ or anti-∥ B, θ=0/180) orientations; net force on any closed loop in uniform field always 0; torque direction via m×B (verified =r×F sense); map P×E onto m×B; N-turn coils → N via m=NIA.

**6 · Problem-classes:** *Tilt-angle force audit* · *Same vs different line of action* · *Top-view moment-arm extraction* · *Torque-vs-angle sweep*.

**Aha:** equal-and-opposite forces do not always cancel — when the loop tilts, one pair keeps the SAME line of action (pure cancellation) while the other straddles the axis (a couple). That couple is the torque, giving τ=NIAB sinθ=m×B, with θ the angle between m and B (never the loop-plane angle).

**Discovery vs catalog:** the catalog flattens A30 into a one-line formula. Three discovery targets it misses: the **line-of-action** mechanism (why a balanced-force loop still spins), the **angle trap** (loop-plane vs m–B, the 90−θ confusion the formula hides), and the **top-view moment-arm** problem-class (collapse the 3-D tilt to read off (b/2)sinθ). The lecture also cleanly separates net-force-zero (always) from net-torque-zero (only θ=0/180). **Note:** A32 (dipole PE U=−m·B) is NOT taught here — it locates θ=0/180 only as zero-torque roots, never as energy states.

---

## ✅ Lecture 16 — Moving-coil galvanometer  *(first-pass distilled)*

**Atoms:** GALV (application) · A30 (τ=m×B→NIAB sinθ) · A29 (m=NIA) · A15 (force-on-wire, chained reference) · **+ torsional constant, radial field, sensitivities (no magnetism A-ID)**

**1 · Sequence:** a galvanometer detects/measures very small currents (mA) → principle: torque on a current loop in B → design goal: deflection ∝ current → construction (many-turn insulated coil hung by a fine phosphor-bronze wire between cylindrical poles, a spring, two terminals) → current → τ=NIAB sinθ rotates the coil → m=NIA so τ=MB sinθ, θ = angle between area vector and B → the fine wire + spring twist, building an opposing **restoring torque = C·φ** (torsional constant C) → at equilibrium applied = restoring → I=C·φ/(NAB sinθ), so I ∝ φ/sinθ → flag the problem: sinθ keeps the reading non-linear → fix with a **radial field** (cylindrical poles + soft-iron core) that pins θ=90 always → **I=C·φ/(NAB), so I∝φ** → core also strengthens B → current sensitivity φ/I=NAB/C and four ways to raise it → voltage sensitivity φ/V=NAB/CR → show the trap (doubling N doubles current sensitivity AND R, so voltage sensitivity is unchanged) → close on a two-galvanometer ratio example.

**2 · Hook:** the everyday image of the lab box marked "G" whose scale tops out at 30–50 mA — the tiny-current detector students have physically seen but never understood. Frames the lecture as "how would a scientist design this so that more current shows more deflection?"

**3 · Misconceptions ★:**
- ★ *"A galvanometer can measure any current (1–2 A)."* → Only mA; to read larger currents it must first be converted to an ammeter (next lecture).
- *"The coil keeps rotating freely until it spins all the way."* → Rotation stops where restoring torque balances applied torque — that equilibrium angle IS the reading. *(Not verbalized.)*
- ★ *"The coil plane should sit along (parallel to) B."* → Then sinθ=0, no torque; the plane must be tilted — the radial field fixes θ=90.
- *"θ in NIAB sinθ is measured from the loop's plane / field direction."* → θ is between the **area vector** (⊥ the plane) and B, not the plane itself. *(Stressed "very important"; not strongly verbalized as an error.)*
- ★ *"Raising current sensitivity automatically raises voltage sensitivity."* → Doubling N doubles current sensitivity AND R, so φ/V=NAB/CR is unchanged. (The NCERT line students misread — the exam trap.)
- *"The radial field exists only to make B stronger."* → Its PRIMARY purpose is pinning θ=90 so sinθ drops out and the scale is linear; field-strengthening is a secondary bonus. *(Not verbalized.)*
- ★ *"NCERT's bare I=(NAB/C)φ is the whole story."* → NCERT hides the sinθ stage; the linear form is valid only BECAUSE the radial field killed sinθ.

**4 · What must be seen:** the coil rotating in the gap while the suspension wire and bottom spring twist, rotation HALTING at the balance angle with a pointer landing on a scale; the restoring torque climbing with the twist until it meets the constant applied torque (the balance point); top-down view — as the coil turns, the area-vector swinging and θ changing, driving sinθ up and down (the non-linearity); same view WITH radial field on — curved lines hugging the soft-iron core so θ stays pinned at 90 in **every** position; a side-by-side of one current step giving a non-linear deflection (uniform field) vs a linear one (radial); reversing current flipping the deflection across a zero-centre scale; sensitivity sliders — increasing N (and watching R rise with it) so current sensitivity rises while voltage sensitivity stays put.

**5 · Exam-critical:** state the principle (torque on a loop); derive I=(C/NAB)φ from torque-balance (NIAB sinθ=Cφ, then θ=90); use of the radial field (pins θ=90 so deflection∝current — "very very important for board"); how a radial field is produced (concave/cylindrical poles + soft-iron core); current sensitivity=NAB/C and four ways to raise it; voltage sensitivity=NAB/CR and why raising current sensitivity via N need NOT raise it (R doubles); two-galvanometer ratio numerical; why phosphor-bronze (small C → higher sensitivity).

**6 · Problem-classes:** *Torque-balance equilibrium reading* · *Radial-field θ-pinning (uniform vs radial comparison)* · *Current- vs voltage-sensitivity divergence* · *Current-reversal / zero-centre deflection*.

**Aha:** the whole device is engineered around one equilibrium — applied torque (NIAB sinθ) equals restoring torque (C·φ); the reading is the twist angle where they balance. The radial field is a deliberate trick that pins θ=90 in every coil position, eliminating sinθ so current and deflection become directly proportional — turning a non-linear toy into a usable scale.

**Discovery vs catalog:** the GALV atom is a black box; the lecture shows it is **an application of earlier atoms chained** — A29 (m=NIA), A30 (NIAB sinθ), A15 (force-as-torque-origin) — plus a non-catalog mechanical layer (restoring torque, torsional constant C). The radial field (kill sinθ, not just strengthen B) is the highest-value insight and a documented blind spot; the current-vs-voltage sensitivity cancellation is a ranked verbalized exam trap NCERT buries in one sentence. **Boundary call: the galvanometer mechanism belongs in T36** (it chains only T36 atoms and is the chapter's closing lecture); only the downstream conversion-to-ammeter/voltmeter material belongs in T37.

---

## 🎯 Conceptual-core-first build queue (founder priority — 2026-06-09)

**Priority:** build the maximally-reusable conceptual diamonds first — the magnetism atoms common to NCERT *and* A-level / AP / IB — going deep on understanding, not problems. Problem-classes are parked for a future layer. *(Reclassification: 21 UNIVERSAL_CORE · 11 India-standard · 6 deferred. IP-clean, cross-curriculum-verified.)*

| Atom | Concept | Aha (the understanding) | Misconception it fixes | Must-see | Curricula |
|------|---------|-------------------------|------------------------|----------|-----------|
| A2 | Oersted — current makes B | A current instantly wraps a magnetic field around its wire; reverse the current and the whole field flips. | Electricity and magnetism feel unrelated; a plain wire isn't expected to be magnetic. | Compass near a live wire swings off north, then snaps the other way when the current reverses. | NCERT + A-level + AP2 + APC + IB SL/HL |
| A1 | Magnetic field B | A real vector region currents set up in space, separate from E, that only pushes charges that are *moving*. | Treated like an E-field — a charge just sitting in it should feel a force. | Region lights up with arrows; a still test charge feels nothing, then gets pushed once it moves. | NCERT + A-level + AP2 + APC + IB SL/HL |
| A21 | B of a straight wire (μ₀I/2πr) | The field is perfect circles around the wire; halve the distance, double the field — no preferred side. | Pictured as straight lines shooting outward (like E from a charge); 1/r falloff forgotten. | Concentric circles packed near the wire, fanning out; readout drops as the point slides outward. | NCERT + A-level + AP2 + APC + IB SL/HL |
| A22 | Right-hand thumb rule (around a wire) | Thumb along the current, curling fingers trace how the field circles — one gesture fixes into/out of page. | Confused with the separate right-hand rule for force on a moving charge. | Hand grips the wire, fingers curl; the into/out-of-page symbol updates live as current flips. | NCERT + A-level + AP2 + APC + IB SL/HL |
| A3 | Lorentz force F = q(v × B) | A field only grabs a *moving* charge, and the push is sideways — square to both v and B. | A charge sitting in a field feels a force, like in an E-field. | Still charge → zero force arrow; set it moving → force pops out sideways to both v and B. | NCERT + A-level + AP2 + APC + IB SL/HL |
| A4 | Direction of the force (hand / screw rule) | The sideways push has a readable direction — and it flips the instant the charge turns negative or v reverses. | A negative charge is pushed the same way as a positive one. | Hand predicts the force; flip the charge's sign and the arrow snaps to the opposite side. | NCERT + A-level + AP2 + APC + IB SL/HL |
| A5 | Force ⟂ v → no work → speed constant | A sideways-only push can only steer, never speed up or slow down — speed is frozen while direction turns. | A force is a force, so it must do work and change the speed. | Velocity arrow swings around while the speed readout stays frozen on one number. | NCERT + A-level + AP2 + APC + IB SL/HL |
| A6 | Force is zero when v ∥ B | Fly straight along the field lines and the field has no sideways grip — zero force, even at high speed. | Any moving charge in a field must feel a force, whatever its heading. | Charge along the lines sails through force-free; angle it across and the force grows as the angle opens. | NCERT + A-level + AP2 + APC + IB SL/HL |
| A7 | Circular motion (v ⟂ B) | A force kept sideways to the motion can't speed it up — it locks the charge into a circle at constant speed. | Force seen as a push from behind → expect a speeding-up curve or a spiral. | Velocity turning, speed frozen, force always pointing inward, particle closing a full circle. | NCERT + A-level + AP2 + APC + IB HL |
| A8 | Radius r = mv/qB | A tug-of-war: more momentum widens the circle, a stronger field tightens it — faster carves a *bigger* loop. | Faster particle must turn tighter ('feels more force'); inertia winning is missed. | Speed slider widens the loop as v rises; field slider tightens it — the loop breathes live. | NCERT + A-level + AP2 + APC + IB HL |
| A9 | Period T = 2πm/qB | One loop's time depends only on m, q, B — the speed has quietly cancelled out. | A bigger circle must take longer per loop. | Fast (wide) and slow (tight) particles cross the start line together every loop. | NCERT + A-level + AP2 + APC + IB HL |
| A10 | Period independent of speed | Faster means a bigger circle, not a quicker lap — same beat at any speed (the cyclotron's secret). | A faster particle 'goes round faster' and finishes sooner. | Same particle accelerated step by step — circle grows, stopwatch reads the identical lap time. | NCERT + A-level + AP2 + APC + IB HL |
| A11 | Helical motion | Along-B motion flies straight and untouched while across-B motion circles — the two stack into a corkscrew. | The whole velocity gets bent into one tilted circle; the along-B part is ignored by the force. | Velocity splits into along-B and across-B arrows; the circle is dragged forward into a 3D helix. | NCERT + A-level + AP2 + APC + IB HL |
| A13 | Velocity selector v = E/B | Crossed E and B make two forces fight on one line; exactly one speed ties them and sails straight through. | Expect E and B forces at right angles; balance speed thought to depend on charge/sign. | Mixed-speed spray; the balance-speed charge goes dead straight, faster/slower bow opposite ways. | NCERT + A-level + AP2 + APC + IB HL |
| A15 | Force on a wire F = I L × B | A wire is a bundle of moving charges; every qv×B push sums into one force — that's why the wire jumps. | The angle is read off the figure, not the true L-to-B angle (decoy 30° really is 90°). | Drifting charges each with a force arrow summing to one; TRUE angle vs a decoy figure-angle. | NCERT + A-level + AP2 + APC + IB SL/HL |
| A17 | Closed loop in uniform field → net force 0 | Same start and end → zero net displacement → any-shape loop feels zero net force; it can only be twisted. | Loop gets shoved bodily through the field; zero net force read as zero internal force. | Four outward arrows summing to zero, beside a ring drawn taut — zero net, real tension. | NCERT + A-level + AP2 + APC + IB SL/HL |
| A18 | Force between parallel currents | Not a new force — each wire sits in the other's field and feels F = IL×B; same way attract, opposite repel. | Expect repulsion by analogy with like charges; the surprise is like currents *attract*. | Toggle both currents same → pull together; opposite → push apart; one wire's field shown at the other. | NCERT + A-level + AP2 + APC + IB SL/HL |
| A27 | Solenoid B = μ₀ n I | Stacked loops reinforce into one uniform field down the tube; outside fields cancel to nearly nothing. | Field thought strong outside, and uniform only on the axis — not everywhere inside. | Suspended coil settles N-S like a bar magnet; cut-open dots/crosses build a tight even inside field; neighbour turns' outside arrows cancel. | NCERT + A-level + AP2 + APC + IB HL |
| A29 | Magnetic dipole moment m = NIA | A flat loop is a tiny bar magnet; its magnetism collapses to one arrow out of the face (S→N, right-hand curl). | Arrow thought to point N→S (external lines); m = IA thought to work only for circles. | Loop dissolves into a bar magnet; thumb-out m arrow; N/S face flips with current; IA works for square and triangle too. | NCERT + AP2 + APC + IB HL |
| A30 | Torque τ = m × B | Equal-opposite forces needn't cancel — a tilted loop's surviving pair makes a couple, τ = mB sinθ (θ = m-to-B). | θ put between the loop's plane and B (so 90−θ); zero net force read as zero torque. | m glued ⟂ to the loop rotating to show θ; the two forces split onto parallel lines; torque tracks sinθ. | NCERT + A-level + AP2 + APC + IB HL |
| GALV | Moving-coil galvanometer | Coil twists till spring torque balances magnetic torque; a radial field pins the angle at 90° so reading ∝ current. | Radial field thought to be only for strength; the linearity (sinθ dropping out) is missed. | Coil twists to its balance angle; plain field gives unequal steps (non-linear) vs radial field's equal steps (linear). | NCERT + A-level + AP2 + IB SL/HL |

### India-standard (build after core)
- **A20 — Biot–Savart law** — element-by-element field mechanism; underpins A21/A23/A24. Author right after the C1a core.
- **A26 — Ampere's circuital law** — "only enclosed current sets the size." Author before/with the solenoid derivation.
- **A23 — B on the axis of a circular loop** — single-signed axial hump (not sign-flipping across centre).
- **A24 — B at the centre of a loop (μ₀I/2R) + arc fraction** — centre value, arc scaling, current-split cancellation.
- **A28 — Toroid field** — zero in the hole, zero outside, field only in the core (enclosed-current argument).
- **A31 — Current loop = magnetic dipole** — no monopole; far-field looks like a bar magnet. Fold into the C4 dipole build.
- **A34 — Combined Lorentz force q(E + v×B)** — always-on E push added to the motion-only B push.
- **A12 — Helix pitch** — set by the along-B component; author right after A11.
- **A14 — Cyclotron** — re-using one small gap in sync, because the period is speed-independent.
- **A32 — Dipole energy U = −m·B** — parallel stable, anti-parallel unstable.
- **A33 — Revolving-electron moment (m/L = e/2m)** — orbiting electron as a ring current; m and L anti-parallel.

> **Deferred — future problem layer (NOT now):**
> - **A25 — B of a finite straight wire** (two-end-angle geometry; infinite-wire A21 is the universal core).
> - **A16 — Force on a bent/curved wire** (collapse path to the endpoint chord — a problem shortcut, no base-curriculum presence).
> - **Time-spent-in-field** problem class (computational drill on A7/A9).
> - **Angle-of-emergence / exit-angle** problem class (geometry drill on the circular arc).
> - **Chord / entry-exit geometry** problem class (coordinate geometry over r = mv/qB).
> - **A19 — Historical pre-2019 ampere definition** (definitional footnote; revisit once the C3 core ships).

**Build order:** (1) patch `magnetic_force_moving_charge` to add **A5** · (2) complete **C2a** force-on-a-charge set (A3·A4·A5·A6) · (3) **C1a** field-around-a-wire (A2→A1→A21→A22) · (4) **C2b** motion (A7→A8→A9→A10→A11→A13) · (5) **C3** conductors (A15→A17→A18) · (6) **C4+C5** dipole/torque/galvanometer (A29→A30→GALV, fold in A31) · (7) then the India-standard mechanism layer (A20, A26, A23/A24, A27, A28). Defer all problem-classes.

---

## 🧭 Chapter-level synthesis — reference detail & the deferred problem layer

> **Priority note (2026-06-09):** the active build priority is the **conceptual-core queue above**. The problem-class catalogue in this section (PC-3 → PC-43) is the **future problem layer — deferred, not now**, kept as reference for when the conceptual base is solid. The convergence-zones and per-cluster build-readiness sub-sections below remain useful for sequencing the *conceptual* builds.

### 1 · New problem-classes (sim-showpieces beyond the C2 build list's PC-1/PC-2) — *deferred problem layer*

| PC | Name | Lecture / atom | Why a sim beats the board |
|---|---|---|---|
| **C1 — Field creation** |||
| PC-3 | Off-foot / same-side angle trap | L01 · A25 | drag P past the wire end, one angle swings through 180/360 and the sine flips — the sign error is invisible statically. *Teacher's #1 failure.* |
| PC-4 | Two-angle perpendicular read | L01 · A25 | animate the two angles opening in opposite senses — the opposite-sense rule self-evident, not memorized |
| PC-5 | Element-sweep integration | L01–03 · A20/A23 | slide the dL element, r and θ co-vary, running ∫dB fills to the closed form — motivates r=a/cosθ |
| PC-6 | Arc-as-fraction-of-circle | L02 · A24+arc-nano | slider sweeps θ, readout tracks θ/2π live — "any arc is a fraction of the circle" made visceral |
| PC-7 | Point-along-the-wire zero filter | L02 · A21 | tap collinear legs in a composite figure, they light up as zero — trains by-inspection elimination |
| PC-8 | Current-split arc cancellation | L02 · cross-topic | smaller arc glows brighter, wider arc subtends more angle, the two centre-fields annihilate → B=0 |
| PC-9 | Axial "same-on-both-sides" | L03 · A23 | drag the field point left→right of the loop, the axial arrow keeps its direction — un-drawable on one snapshot |
| PC-10 | B-vs-x graph-sign selection | L03 · A23 | plot B live as the point crosses centre — never crosses zero; kills the sign-flip MCQ decoy |
| PC-11 | B-vs-r profile across a conductor | L04 · A26 | sweep the test point outward, draw B live — rise inside, peak at surface, 1/r outside |
| PC-12 | Growing Amperian loop / variable I_enc | L04 · A26 | expand the loop, tally captured current live — kills the small-r-vs-R area error |
| PC-13 | Ring-integration of non-uniform J | L04 · J=J₀r (no atom) | unroll each ring into a strip, sweep outward, accumulate dI — animates the integral setup |
| PC-14 | Solenoid finite→ideal limit collapse | L05 · A27 | drag P to the exact mouth; θ₁,θ₂ update live (far auto-obtuse), B traces plateau→halving; the end=half is *felt* |
| PC-15 | Ampère-loop segment audit | L05/L06 · A26 | traverse the loop leg-by-leg, each contribution → 0 or B·L — a checkable interactive proof |
| PC-16 | Toroid three-point probe | L06 · A28 | place the loop at hole/outside/core, live-count dots vs crosses — the cancellation feels inevitable |
| PC-17 | Toroid ideal-thickness limit | L06 · A28 | thickness slider; R₁,R₂,r converge as D→0, μ₀NI/2πr → μ₀nI |
| **C2 — Charge motion** |||
| PC-18 | Variable-pitch helix | L10 · A11/A12 ext | E∥B stretches the pitch loop-by-loop (P₁<P₂<P₃), radius fixed; toggle E off → constant pitch |
| PC-19 | Three-way force-balance deflection | L10 · A13 | speed slider sweeps parabola→straight→other parabola; v=E/B is a visible knife-edge |
| PC-20 | Velocity selector filtering a spread | L10 · A13 | a beam of mixed speeds fans out, only v=E/B threads the slit — inherently a population animation |
| PC-21 | Cycloid from rest in E⊥B | L10 · beyond-syllabus | rise-curl-repeat — defined by its time evolution, only animation reveals the forward loop |
| PC-22 | Helix degenerate trick | L09 · A11 | drive v∥→0, the helix flattens to a pure circle (zero pitch) |
| PC-23 | Cyclotron step-wise speed staircase | L11 · A14 | speed flat inside each dee, jumps only at the gap — "energy per crossing, not continuous" |
| PC-24 | Cyclotron AC-timing handshake | L11 · A14 | run the AC waveform beside the orbiting particle, de-sync visible when frequency is wrong |
| **C3 — Conductors** |||
| PC-25 | Decoy-angle in a perpendicular field | L12 · A15 | render L and into-page B in 3D, rotate to expose the real 90° behind a drawn 30°. *Highest-yield trap.* |
| PC-26 | Bent-wire = displacement length | L12 · A16 | the bent segments collapse onto the endpoint chord, force identical — ∫dL=displacement made visible |
| PC-27 | Closed-loop net force = 0 | L12 · A17 | morph the loop shape freely, outward arrows always sum to zero |
| PC-28 | Ring tension from a dθ element | L12 · T=IBR (no atom) | zoom a dθ arc, 2T·sin(dθ) balances outward IB·dL. *"Net force 0 ≠ tension 0."* |
| PC-29 | Non-uniform-field integration | L12 · no atom | finite wire near an infinite wire, B∝1/x, dx-element → log force; kills the mid-point-B shortcut |
| PC-30 | Closed loop in non-uniform field | L12 · contradicts A17 | square loop near an infinite wire, near/far arms unequal → non-zero net force |
| PC-31 | Three-wire net force on the middle wire | L13 · A18 | A attracts B, C repels B; toggle directions, watch the net arrow flip and rescale |
| PC-32 | Attract/repel toggle, fixed magnitude | L13 · A18 | flip relative current direction — only direction changes; kills "opposite changes the magnitude" |
| PC-33 | 1/d & I₁I₂ force sensitivity | L13 · A18 | d-slider, force-per-metre blows up as d→0; grounds "why don't household wires stick" |
| **C4 — Dipole/torque** |||
| PC-34 | Bent loop across two planes | L14 · A29 | phantom equal-opposite current splits the shared branch into two clean loops; the two IA vectors add at right angles |
| PC-35 | Tilted-plane area vector | L14/L15 · A29 | rotatable sim shows the normal tilt and î/ĵ/k̂ components emerge from the cross product |
| PC-36 | Revolving-electron → equivalent current | L14 · A33 | one charge sweeping past a fixed cross-section once per T → I=e/T — a time-based idea |
| PC-37 | Charged rotating ring gyromagnetic ratio | L14 · A33 | side-by-side single-particle vs distributed-charge makes the L=Iω-not-r×p switch visible |
| PC-38 | Tilt-angle force audit / line of action | L15 · A30 | tilt continuously; the two arrows split onto separate lines exactly when torque switches on. *Best torque showpiece.* |
| PC-39 | Top-view moment-arm extraction | L15 · A30 | pivot camera oblique→top-down, overlay the (b/2)sinθ moment arm |
| PC-40 | Torque-vs-angle sweep | L15 · A30 | θ slider, torque tracks sinθ, peaks at 90, zero at 0/180, visibly opposes the tilt |
| **C5 — Application** |||
| PC-41 | Torque-balance equilibrium reading | L16 · GALV | coil rotates, restoring torque climbs until it meets applied — shows *why* motion stops |
| PC-42 | Radial-field θ-pinning (uniform vs radial) | L16 · GALV | rotate the coil; θ stays locked at 90 as curved lines hug the soft-iron core. *Best application animation.* |
| PC-43 | Current- vs voltage-sensitivity divergence | L16 · GALV | N-slider doubles current sensitivity AND R, so voltage sensitivity stays flat — the #1 galv exam trap |

### 2 · Atom-coverage deltas

**PROMOTE (videos weight far above catalog tier):**
- **A5 (B does no work → speed constant)** — confirmed by C2 as the topic's **#1 conceptual misconception**; **our shipped `magnetic_force_moving_charge` diamond MISSES it** (covers A3+A4+A6 only). The single most important coverage gap. Reappears as the design-motivating quiz in L11 ("can B speed it up?").
- **A23 (axial loop field)** — catalog is formula-first; the high-yield payload (L03) is the *direction* claim "same on both sides" (the thing textbooks hide) + the graph-sign MCQ.
- **A26 (Ampère's law)** — one flat atom; L04 shows a **3-geometry ladder** (hollow / uniform-solid / non-uniform-J). Sub-atomise by geometry.
- **A27 (solenoid)** — catalog lists only the ideal μ₀nI; the real teaching object is the **finite form (μ₀nI/2)(cosθ₁−cosθ₂)** + end=μ₀nI/2 + obtuse-far-angle convention.
- **A30 (τ=m×B)** — L15 ranks the line-of-action mechanism and the m–B-vs-loop-plane angle trap far above the bare formula.

**NEW — taught, maps to NO catalog atom (add to inventory):**
- General-arc centre field **B=μ₀Iθ/4πa** + unitary θ/2π model (L02) — the N24.x arc-nano.
- **Non-uniform J=J₀r ring-integration** (L04) — standard JEE escalation.
- **Ring/loop tension T=IBR** in a uniform field (L12) — classic JEE type.
- **Force in a non-uniform field** (finite wire & closed loop near an infinite wire; closed loop has NON-zero net force) (L12) — contradicts naive A17.
- **Variable-pitch helix** (E∥B) and **cycloid** (E⊥B from rest) (L10) — extensions of A11/A12; cycloid beyond syllabus.
- **Galvanometer mechanical layer** — torsional constant C, restoring torque=Cφ, radial field, current/voltage sensitivity (L16).
- Cross-topic: **Bohr quantization L=nh/2π → m=neh/4πm + Bohr magneton** (L14).

**COMPRESS / supporting:** vector-form Biot–Savart dB=(μ₀/4π)I(dl×r)/r³ is a direction sub-skill (L03), a refinement of A20 not its own diamond. A9/A10 (period & speed-independence) are leaned on as prerequisites in L09–11, not freshly taught — keep supporting.

### 3 · Galvanometer boundary call

**Move the moving-coil galvanometer INTO T36.** The entire derivation rests on T36 atoms — A30 (τ=NIAB sinθ), A29 (m=NIA), A15 (force-on-wire as torque origin) — plus one non-catalog mechanical element (torsional constant C). It is literally the chapter's closing lecture and chains *only* T36 physics. **Only the downstream conversion-to-ammeter/voltmeter (shunt/multiplier) material — explicitly deferred to the next, current-electricity lecture — belongs in T37.** Split at "galvanometer mechanism (T36) vs galvanometer→ammeter/voltmeter conversion (T37)."

### 4 · Convergence zones (books AND videos independently flag → highest-confidence diamond bets)

| Cluster | Atom | Books | Videos | Bet |
|---|---|---|---|---|
| C2 | **A5** | EPIC-C target | #1 conceptual misconception + L11 design-quiz | **HIGHEST — and currently un-shipped** |
| C2 | **A10** | EPIC-C target | "faster = quicker lap" error; cyclotron frequency basis | High |
| C3 | **A17** | EPIC-C target | L12 "net force 0 ≠ tension 0" + non-uniform-field exception | High |
| C3 | **A18** | EPIC-C target | L13 attract/repel-magnitude + "why don't they stick" + 3-wire | High |
| C1 | **A20** | EPIC-C target | L01 "whole-wire plug-in" + perpendicular-distance traps | High |

Five double-validated bets. **A5 is the standout** — flagged by books, confirmed the topic's #1 conceptual error by the video corpus, AND missing from our only shipped C2 diamond. Build/patch it first.

### 5 · Surprises (the catalog would never have surfaced)

- **L02 current-split arc cancellation → B=0** via parallel-resistance reasoning (larger arc carries LESS current; effects exactly cancel) — a magnetism answer that needs current-electricity.
- **L03 "axial B is the SAME direction on both sides of the loop"** — the thing textbooks hide; students universally assume in-one-side-out-the-other. A formula-first A23 would never rank a *direction* claim as the headline.
- **L12 decoy-angle trap** — a wire drawn at 30° in an into-page field where the true L–B angle is 90°, *deliberately drawn to confuse*. No textbook ranks "the drawn angle is a trap" as the #1 error.
- **L12 ring tension T=IBR with net force 0** — "most students answer tension=0"; A17 actively *causes* this by stopping at net force.
- **L12 closed loop in a non-uniform field has NON-zero net force** — contradicts the naive reading of A17; the mid-point-B substitution is a "deceptive textbook answer."
- **L05 obtuse far-end-angle convention** in the finite solenoid (far angle = 180−something) — a high-frequency numerical error no atom encodes.
- **L10 variable-pitch helix** — E stretches the pitch loop-by-loop; the MCQ has two helical decoys. Pure-magnetism atoms can't produce it.
- **L16 radial field's real purpose is to kill sinθ, not strengthen B** — a documented blind spot the NCERT one-liner buries; plus the current-vs-voltage sensitivity cancellation.
- **L01 "dot/cross means field direction"** — actually a generic into/out-of-page marker that can equally mean *current*. Read context.

### 6 · Per-cluster build-readiness

**C1 (field creation)** — Aha: every straight segment is B=(μ₀/4π)(I/a)(sinφ₁+sinφ₂); every arc is the circle scaled by θ/2π. #1 misconception: the given distance is NOT the perpendicular distance; same-side angle 360−θ sign flip (L01 · A25). Best must-see: **PC-3**.

**C3 (conductors)** — Aha: ∫dL=displacement — force on any shaped segment in uniform B depends only on the endpoint chord; this is why a closed loop has zero net force. #1 misconception: θ in IBL·sinθ is the drawn figure angle (it's the L–B angle, 90°) (L12 · A15). Best must-see: **PC-25**.

**C4 (dipole/torque)** — Aha: equal-opposite forces don't always cancel — one pair keeps its line of action, the other forms a couple → τ=NIAB·sinθ=m×B, θ between m and B. #1 misconception: θ is the loop-plane-to-B angle (the 90−θ confusion) (L15 · A30). Best must-see: **PC-38**.

**C5 (application)** — Aha: the reading is the twist angle where applied torque NIAB·sinθ = restoring torque Cφ, and the radial field pins θ=90 so I∝φ. #1 misconception: raising current sensitivity raises voltage sensitivity (doubling N also doubles R) (L16 · GALV). Best must-see: **PC-42**.

### 7 · Updated verdict — books vs videos

**Confirmed, with one material correction.** Across all 16 lectures the books' breadth holds: nearly every taught idea maps to an existing A1–A34 atom or a catalog nano, the dependency DAG is sound, and the videos add the predicted pedagogy layer — ranked/verbalized misconceptions, must-see visuals, and ~43 sim-showpiece problem-classes the flat atom list can't express. "Books = complete skeleton, videos = pedagogy layer" survives full distillation.

**But the 2-of-16 extrapolation under-counted two things:**
1. **The books are NOT structurally complete at the problem-class grain.** At least six genuinely new content items map to NO catalog atom — ring tension T=IBR, non-uniform-J ring integration, force/net-force in non-uniform fields (which *contradicts* naive A17), variable-pitch helix, cycloid, and the entire galvanometer mechanical layer. These are not pedagogy garnish; they are standard JEE problem-types the 3-book catalog omitted. The skeleton has real holes at the JEE-escalation tier.
2. **Two catalog scoping calls are wrong:** the galvanometer belongs in T36 (only ammeter/voltmeter conversion is T37), and A26 should be sub-atomised by geometry.

**Net honest verdict:** books = ~90% complete skeleton (not 100%), videos = the pedagogy layer AND a JEE-problem-class layer the books missed. **The single most actionable finding is a gap in shipped product: A5 ("magnetic force does no work / speed constant") is the topic's #1 conceptual misconception, double-flagged by books and videos, and absent from our only shipped C2 diamond. Patch `magnetic_force_moving_charge` to cover A5 before building anything new.** Highest-confidence net-new diamonds: the L12 conductor cluster (decoy-angle + ring tension + non-uniform field, all convergence-grade) and the L16 galvanometer radial-field pinning.

---

**Cross-references:**
- Atomic dependency graph: `docs/exports/chapters/diagrams/chapter-36-moving-charges-magnetism.mmd`
- Collaboration model: `docs/EXPERT_COLLABORATION_PLAYBOOK.md`
- Magnetism proof-of-concept charter: `docs/MAGNETISM_ARCHITECTURE.md`
