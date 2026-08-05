# MATHEMATICS_DISCUSSIONS.md — strategy & decisions log

> Sibling of `docs/CHEMISTRY_DISCUSSIONS.md` and `docs/DISCUSSIONS.md`. Newest session first.
> Mathematics opened 2026-08-04 on branch `feat/mathematics-foundation`.
>
> **Companion docs:** `docs/MATHEMATICS_ARCHITECTURE.md` (design — extend, don't duplicate) ·
> `docs/MATHEMATICS_BUILD_PLAN.md` (phase mechanics + tracker) · `docs/patterns/mathematics.md`
> (architect pattern library) · `.agents/mathematics_author/CLAUDE.md` (the rigor role) ·
> `PROGRESS_MATHEMATICS.md` (build log).

---

## Session M1 — The whiteboard test applied to mathematics; the intersection-first ranked list; and the finding that the most fundamental math visual does not exist yet (2026-08-04, branch `feat/mathematics-foundation` — design only, no concept authored)

> Founder asked to open mathematics as the third subject, built the way **chemistry** was built —
> **intersection-first across Indian and international curricula**, not NCERT-only the way physics is —
> with each sim's states laid out easy → intermediate → advanced so one file serves every syllabus.

**Bottom line, three findings, in the order they matter:**

1. **The "easy → intermediate → advanced covering both syllabi" mechanism already exists as law.**
   It is **Rule 38** (`CLAUDE_RULES.md:63`), proven on the `capacitance` proof-run and shipped on all
   10 chemistry concepts: `depth_ring: core | extended | advanced` per state, the advanced ring a
   contiguous block immediately before the explore state, **both reduced cuts must leave a coherent
   lesson**, a notation ladder (algebra in core/extended; calculus and formal notation in advanced
   only), and `curriculum_tags` carried as **claims, never facts** (38g). Mathematics needs no new
   rule — it needs the ranked list below and an author role that applies Rule 38 to math.

2. **Mathematics is the harshest subject the whiteboard test has been applied to, and that is the
   point.** More than half of school mathematics is *better* on a board. The demo tier (§5) is larger
   here than in chemistry. What survives is a small, sharp set — and every survivor is genuinely
   irreplaceable.

3. **The load-bearing finding, made BEFORE any code: the single most fundamental mathematics visual —
   a coordinate plane with numeric axes and a plotted curve that responds to a slider — does not
   exist in any renderer the teacher product can ship.** This was measured, not assumed, and it
   corrects the working hypothesis that math would be the cheapest subject on engine cost. It is the
   cheapest in its *geometry* half and blocked in its *graphing* half. Details in §3.

---

### 1. The whiteboard test — inherited verbatim, not re-derived

> **If a good teacher with a whiteboard and 60 seconds produces the same understanding, it is not a
> diamond — and we should not spend a build on it.**

Locked for chemistry 2026-07-27 (`CHEMISTRY_DISCUSSIONS.md` §C5.1) after the founder watched
`law_of_conservation_of_mass` come off the line and asked which simulations are actually *impactful*
and *dependable*. It applies unchanged to mathematics, and it bites harder here.

**Why it bites harder.** Chemistry's demo tier is bookkeeping (stoichiometry, nomenclature).
Mathematics' demo tier is *most of the syllabus*: algebra, identities, series, counting, matrix
arithmetic, mensuration. A board with chalk is already an excellent mathematics instrument — it is
the medium the subject was designed around. A mathematics sim must therefore justify itself against
a **stronger** incumbent than a chemistry sim did.

**The corollary, stated plainly so it is not rediscovered later:** a large, cheap mathematics catalog
is the single most likely failure mode of this subject. Concept count is not the buy-trigger;
coverage of concepts that *needed* a simulation, plus classroom reliability, is (`CLAUDE.md` §3).

---

### 2. The four capabilities, applied to mathematics

A concept earns a build only if it needs at least one (`CHEMISTRY_DISCUSSIONS.md` §C5.2):

| # | Capability | Strength in mathematics |
|---|---|---|
| 1 | **Show the invisible at scale** | **Weak, with one strong exception.** Math has no "500 particles" — but it has *many trials*: 10,000 samples, a random walk, a Riemann sum with n = 1000. Where it applies it is decisive. |
| 2 | **Run "what if" with guaranteed-correct maths** | **This is mathematics' dominant claim.** Drag a parameter and the whole curve / vector / solid responds, continuously, always correct. A teacher redraws two cases and asserts the trend between them; the sim shows the entire *family*. |
| 3 | **Hold 3D spatial structure** | **Strong and narrow.** 3D coordinate geometry, vectors in space, solids of revolution — exactly where a 2D board fails and hand-waving is worst. |
| 4 | **Make a counterintuitive result believable** | **Strong and narrow.** Limits, conditional probability against base rates, an unbounded region with finite area. The student's intuition says X, the truth is Y, and only watching changes the belief. |

**A concept that claims only "it makes the algebra prettier" claims nothing.** That is the whole demo
tier.

---

### 3. Renderer reality-check — MEASURED against the live tree, 2026-08-04

`docs/patterns/chemistry.md` records the costliest scheduling error this project has made:
`CHEMISTRY_ARCHITECTURE.md` §5c *"named a new FILE where a new CASE would do"*, and the phase table
then founder-gated the whole subject behind a renderer that was never needed —
`field_3d_renderer.ts` was already Three.js. Its instruction: **re-read any "we need a new renderer"
claim against what the existing renderer already is.** So this section is measurement, not survey.

**What the teacher product can actually ship.** `build_review_site.ts:3603` accepts exactly three
engine blocks and exits non-zero on anything else:

```
field_3d_config | particle_field_config | physics_engine_config (PCPL/parametric)
```

**⚠ Finding 3a — `graph_interactive` is NOT a teacher-product render surface.**
`src/lib/renderers/graph_interactive_renderer.ts` (504 lines, Plotly) is a genuine Cartesian plotter:
`x_axis`/`y_axis` with min/max, gridlines, zero-lines, numeric ticks, axis titles, `makeEvaluator(expr)`,
slider-bound variables and annotations. **48 shipped concepts already name it** as `renderer_pair.panel_b`
(44 paired with `mechanics_2d`, 4 with `parametric`). But `build_review_site.ts` assembles **panel A
only** — it has no `panel_b` branch at all, and `graph_interactive` is absent from `CLAUDE.md` §1's
list of live renderers. So on 48 concepts this is authored metadata the teacher product never renders.
This is the same class as the filed chemistry scar `review_site_missing_renderer_family_branch`.

**⚠ Finding 3b — the PCPL `axes` primitive is not a graph.** `drawAxes` (`parametric_renderer.ts:2668`)
draws two arrows of a fixed pixel length with an `x`/`y` label at the tips. No gridlines, no tick marks,
no numeric scale, no data-to-pixel transform. It is a free-body-diagram orientation indicator inherited
from physics. **Nothing in the shippable renderers draws a coordinate plane a mathematics teacher would
recognise.**

**✅ Finding 3c — but PCPL can already trace an arbitrary curve that responds live to a slider.**
`locus_trace` (`parametric_renderer.ts:2356`) takes `x_expr` / `y_expr`, samples them across the state
clock, and draws the path. Critically, its sampler calls `PM_choreoVarsAtTime` (`:2311`), which merges
**live slider values** under the drag-seize guard (`PM_userTouched`). So *drag a slider → the whole
traced curve redraws* — Capability 2 — works on the shipped engine today. What is missing around it is
the **frame**: axes with scale, ticks, numbers, and a data↔pixel mapping. Coordinates are raw pixels,
so every authored expression would otherwise carry its own scale factor by hand.

**✅ Finding 3d — the 3D half is genuinely near-free.** `field_3d_renderer.ts` carries 193 occurrences
of `crossProduct` / `PlaneGeometry` / `ArrowHelper` — the vector, arrow and plane machinery built for
magnetism is directly reusable for 3D coordinate geometry and vector products.

**Rule 40a sweep** (`git fetch origin` + `git log --all -S`, 1062 commits across all branches, run
2026-08-04) — **0 hits each**: `cartesian_plane`, `function_plot`, `graph_paper`, `axis_ticks`,
`riemann`, `secant_slope`, `tangent_line`, `solid_of_revolution`, `unit_circle`, `argand`,
`slope_field`, `sampling_box`. Nothing is being built twice. (`cross_product` 19 hits and
`dot_product` 14 are the existing physics machinery — the reuse in 3d, not a duplicate.)

**The corrected cost picture:**

| Half of mathematics | Surface | Status |
|---|---|---|
| Geometry, vectors, 3D coordinate geometry, solids of revolution | `field_3d` (reuse the magnetism vector/plane machinery) | **[LIVE] / thin scenario** |
| Loci, conics, geometric constructions, the unit circle | `parametric` (PCPL — `locus_trace` + `animated_path` + canvas `slider`) | **[LIVE]** |
| Everything that lives on a graph — derivative, integral, transformations | *nothing shippable* | **[NEEDS-SCENARIO] — `cartesian_plane`** |
| Sampling, randomness at scale | `particle_field` (`gas_box` is the nearest shape) | **[NEEDS-SCENARIO]** |

**Consequence for scheduling, stated as the chemistry lesson demands:** the highest-intersection
mathematics diamonds (§6, P1) all live on a graph, so **one foundational scenario — `cartesian_plane`
— gates the front of the ranked list.** That is a modest scenario build in the shape of chemistry's
`gas_box`, not a new renderer file. It must land on **master separately** (Rule 40), before any
concept desk opens.

---

### 4. The curriculum-intersection method (the founder's specific ask)

Physics is authored NCERT-first. Chemistry is authored on the Indian ∩ international intersection.
**Mathematics follows chemistry.** The ordering formula changes accordingly:

> **Chemistry:** (irreplaceability tier) × (curriculum weight) ÷ (renderer dependency)
> **Mathematics:** (irreplaceability tier) × (**intersection breadth**) ÷ (renderer dependency)

Boards scored: **CBSE/NCERT · ICSE/ISC · JEE (Main+Advanced) · IB DP (AA/AI, SL/HL) · AP (Calculus
AB/BC, Precalculus, Statistics) · Cambridge IGCSE (0580 Extended + 0606 Additional Maths) ·
A-level (Edexcel/AQA/CAIE Pure, Mechanics, Statistics)**.

**⚠ Rule 38g governs every cell below: these are CLAIMS, not facts.** Only the CBSE/NCERT column may
be authored `verified: true`. Every other cell ships `needs_teacher_verification: true`, and **no
curriculum preset becomes teacher-visible until a real teacher of that board confirms it.**

#### The intersection table — candidates that survived §1 and §2

`F` = full · `P` = partial · `—` = absent

| Candidate | CBSE | ICSE | JEE | IB DP | AP | IGCSE | A-lvl | Breadth | Capability |
|---|---|---|---|---|---|---|---|---|---|
| **Graph transformations** `y = a·f(b(x−h))+k` | F | F | P | F | F (Precalc) | F (0606) | F | **7/7** | 2 |
| **Derivative as a limit of secant slope** | F | F | F | F | F (Calc AB/BC) | F (0606) | F | **7/7** | 2, 4 |
| **Definite integral as accumulated area** | F | F | F | F | F (Calc AB/BC) | P (0606) | F | **6.5/7** | 1, 2, 4 |
| **The unit circle → sine & cosine unrolled** | F | F | P | F | F (Precalc) | F (0606) | F | **7/7** | 2 |
| **Conditional probability & Bayes / base rates** | F | F | P | F | F (Stats) | P (0580) | F | **6.5/7** | 1, 4 |
| **Vectors in 3D — dot & cross product** | F | F | F | F (HL) | P (Phys C) | — | F | **5.5/7** | 3 |
| **Normal distribution, sampling & the CLT** | P | P | — | F | F (Stats) | P | F | **4.5/7** | 1, 4 |
| **3D coordinate geometry — lines & planes** | F | F | F | F (HL) | — | — | P | **4.5/7** | 3 |
| **Solids of revolution (volume by integration)** | F | P | F | F (HL) | F (Calc AB/BC) | — | F | **5.5/7** | 3, 2 |
| **Conic sections as loci** | F | F | F | — | F (Precalc) | — | P | **4/7** | 2, 4 |
| **Complex numbers & the Argand plane** | F | F | F | F (HL) | — | — | P (FM) | **4/7** | 2 |
| **Differential equations & slope fields** | F | P | P | F (HL) | F (Calc BC) | — | F | **5/7** | 2 |

**What the table says, and it is the answer to the founder's question:** the widest Indian ∩
international overlap in school mathematics is **the calculus core plus graph behaviour plus
probability** — not the topics an Indian-only ranking would put first. Coordinate geometry of the
straight line, sequences and series, and matrix algebra all rank high in CBSE/JEE and **fail either
the intersection test, the whiteboard test, or both**.

**Two curriculum notes worth recording now rather than discovering mid-build:**
- **Graph transformations is the highest-value single concept in school mathematics by intersection
  breadth — 7/7, every board, every level** — and it is *pure Capability 2*. It has no Indian-only
  competitor anywhere on the list.
- **3D coordinate geometry is the mirror image:** strong CBSE/JEE/IB-HL, **absent from AP and IGCSE**.
  It is a JEE/CBSE depth play, not an international one. Build it deliberately for that, never by
  momentum (Rule 38f).

---

### 5. The demo tier — what mathematics will NOT build

Recorded explicitly so it is not re-proposed. Each fails all four capabilities: a teacher with a
board produces the same understanding, usually better, because they control pace and can read a
confused face.

- Algebraic manipulation, factorisation, the quadratic formula
- Arithmetic & geometric sequences and series (the arithmetic is better on a board)
- Trigonometric identities and their proofs (symbol manipulation)
- Matrix arithmetic — addition, multiplication, determinants, inverses
- Binomial theorem expansion
- Permutations & combinations counting
- Sets, relations & functions — definitions and notation
- Mensuration formulae
- Straight-line equation forms (`y = mx + c` rearrangement) — **but see the caveat below**
- Statistics summary measures (mean/median/mode, standard deviation by formula)

**Caveat on the boundary cases.** "Slope of a straight line" fails as a *concept build* and succeeds
as a *state* inside the derivative diamond. The demo tier is a ban on spending a whole concept, not a
ban on the idea appearing. This is the same reading `law_of_conservation_of_mass` got: its problem was
queue position, not existence (`CHEMISTRY_DISCUSSIONS.md` §C5.4).

**State count stays complexity-driven** (Rule 11; the tier-cap proposal was made and rejected for
chemistry 2026-07-27). Tier decides *whether and when* we build. Complexity decides *how many states*
once we have decided to build. A scheduled mathematics concept gets the full traditional treatment.

---

### 6. THE RANKED PRIORITY LIST

> **⚠ THE ORDER IS FLEXIBLE — a default, not a contract**, on the identical terms the chemistry list
> carries (`CHEMISTRY_DISCUSSIONS.md` §C5.6). If the founder asks for a concept out of order, build
> it. What is durable is the *reasoning* (§1–§5); the sequence is that reasoning applied to today's
> facts, and facts move.

**P0 — the engine gate (not a concept).**

| # | Item | Why it is first |
|---|---|---|
| 0 | **`cartesian_plane` scenario** — axes with numeric ticks, a data↔pixel transform, `y = f(x)` plotting over a range, shaded regions, a movable point with live readout | Every P1 concept below is blocked on it. Lands on **master separately** (Rule 40), one `bug_class`, before any concept desk opens. Phase-0 survey first, per `docs/CHEMISTRY_PHASE0_BONDING.md` precedent. |

**P1 — the diamonds (highest intersection × highest irreplaceability).**

| # | Concept | Breadth | Capability | Surface |
|---|---|---|---|---|
| 1 | **Graph transformations** — one curve, four live parameters, the family made visible | 7/7 | 2 | `cartesian_plane` |
| 2 | **Derivative as the limit of a secant slope** — h → 0 continuously, slope read live, tangent falls out | 7/7 | 2, 4 | `cartesian_plane` |
| 3 | **Definite integral as accumulated area** — n = 4 → 1000, the sum converging on screen | 6.5/7 | 1, 2, 4 | `cartesian_plane` |
| 4 | **The unit circle unrolled into sine & cosine** — rotation becomes a wave in one continuous motion | 7/7 | 2 | `parametric` **[LIVE]** |

**P2 — strong, and the cheapest available (no new engine).**

| # | Concept | Breadth | Capability | Surface |
|---|---|---|---|---|
| 5 | **Vectors in 3D — dot & cross product** | 5.5/7 | 3 | `field_3d` (reuse — Finding 3d) |
| 6 | **Conditional probability & base rates** | 6.5/7 | 1, 4 | `parametric` (grid of 1000) |
| 7 | **Conic sections as loci** — the defining condition traced, then morphed | 4/7 | 2, 4 | `parametric` `locus_trace` **[LIVE]** |

**P3 — real diamonds, narrower or costlier.**

| # | Concept | Breadth | Capability | Surface |
|---|---|---|---|---|
| 8 | **Solids of revolution** | 5.5/7 | 3, 2 | `field_3d` (new scenario) |
| 9 | **3D coordinate geometry — lines & planes** | 4.5/7 | 3 | `field_3d` (reuse) |
| 10 | **Normal distribution, sampling & the CLT** | 4.5/7 | 1, 4 | `particle_field` (new scenario) |
| 11 | **Complex numbers & the Argand plane** | 4/7 | 2 | `cartesian_plane` |
| 12 | **Differential equations & slope fields** | 5/7 | 2 | `cartesian_plane` |

**The one recommendation on record:** open with **#4, the unit circle**, not #1. It is 7/7 on
intersection, a genuine diamond, and it is the only P1-grade concept that runs on a **[LIVE]**
surface today — so it proves the whole mathematics path end-to-end (agent → validator → THE EYE →
baselines) with **zero engine spend**, exactly as `bohr_model_energy_levels` did for chemistry on the
same `parametric` renderer. Then dispatch `cartesian_plane` and take #1–#3 in order.

---

### 7. Open items, recorded honestly

1. **Every international cell in §4 is unverified, and ten chemistry concepts deep not one
   international mapping has ever been teacher-confirmed** (`PROGRESS_CHEMISTRY.md:172`). Rule 38g
   therefore blocks every non-CBSE preset from being teacher-visible in mathematics too, from day
   one. An intersection-first subject whose intersection claims are all unverified is a thesis, not a
   product feature. **What would close it:** one teacher per board reviewing the coverage column —
   the same ask as the Asmi gate, widened.
2. **The professor gate has still never run on any subject outside physics.** Ten chemistry concepts
   have passed every machine gate and none has passed Asmi's review — the stated bottleneck for six
   consecutive sessions. Mathematics starts behind that same closed gate. Worth an explicit founder
   decision on whether the first mathematics concept is sequenced *behind* the first professor review
   rather than ahead of it.
3. **`graph_interactive` on 48 shipped physics concepts renders nowhere** (Finding 3a). Not a
   mathematics regression — a pre-existing gap this survey surfaced. It is a scar-row candidate and a
   founder call: either wire a `panel_b` branch into `build_review_site.ts`, or drop the field from
   those concepts so the JSON stops claiming a panel that never paints.
4. **`cartesian_plane` needs its own Phase-0 survey before dispatch**, on the
   `docs/CHEMISTRY_PHASE0_BONDING.md` model: which of #1/#2/#3/#11/#12's states each engine feature
   serves, so the union check is made checkable before a line of renderer code.
