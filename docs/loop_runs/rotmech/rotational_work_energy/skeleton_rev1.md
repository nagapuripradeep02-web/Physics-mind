# Skeleton — `rotational_work_energy` (rotmech · Class 11 Ch.7 · Phase-0b design, Desk A)

> **Status:** Phase-0b design artifact for founder-proxy **Checkpoint A**. Design only; no
> physics-block content (no per-state timelines, no variable tables) — that is `alex:physics_author`.
> **Author:** `alex:architect`, 2026-08-07. **Engine:** `rigid_body_rotation` (rbr),
> `src/lib/renderers/field_3d_renderer.ts`, region opens `:50190`. **Already built.**
> **Apparatus:** `APPARATUS_CONTRACT.md` §1 verbatim, zero deviation — `r = 0.80 m · ω₀ = +1.50 rad/s ·
> m = 2.0 kg · I_frame 0.50 · rod_half 1.00 · drum 0.55 · r ∈ [0.15, 0.90]`.
> **Namespace:** `rotational_work_energy` is in neither `src/data/concepts/` (151 JSONs) nor
> `src/data/concepts/chemistry/`. No collision.

---

## ⚠ DESK A VERIFICATION NOTE — read before judging A-28

The architect flagged every numeric figure below **`ASSUMPTION — probe-before-authoring`**, because
they came from a faithful **re-implementation** of `rbrGridWalk`, not from the renderer. Desk A
re-measured **A-28 on the real engine** before this skeleton went to Checkpoint A
(`src/scripts/_scratch_rbr_a28_probe.ts`, reading the rendered dp-2 HUD strings a teacher actually
sees, with liveness asserted first).

**A-28 as filed — "CRITICAL, the printed ledger `KE₀ + W = KE` closes for at most 40 ms anywhere,
so S4's quantitative form is blocked" — is NOT reproduced.** Measured over τ ∈ {0.40, 0.50, 0.75,
1.00}, comparing rendered `ΔKE` against rendered `ΔW` over consecutive 1 s intervals (a
baseline-free test — see below), the residual is **at most 0.010 J, one display quantum, and 0.000
at many samples**. That is the arithmetic of subtracting two independently-rounded dp-2 values, not
a systematic engine bias.

**What IS reproduced is the architect's single most specific claim, and it survives:** at the full
stop the HUD prints **`W = −3.45 J`** while the KE meter has fallen **3.44 J** (τ = 0.75 at
t = 6000 ms; τ = 1.00 at t = 5000 ms). One quantum, on precisely the "brake it to a standstill,
every joule accounted for" frame that would be this concept's most compelling picture.

**So the finding is real, but MODERATE and narrow rather than CRITICAL and pervasive** — the
re-implementation over-estimated the residual by roughly 25×. The design consequence is much
smaller than the architect assumed: **S4 does not have to ship qualitative on ledger grounds.** What
it must avoid is making *the full-stop frame* the quantitative money shot. Restated for Desk E as
**A-28 (revised)** in `findings_a.md`.

**A methodological note kept deliberately, because it cost a measurement:** Desk A's first probe
baselined `KE₀` at t = 200 ms and compared it against `W` accumulated from t = 0. By 200 ms the
brake has already done work, so the "residual" came out *exactly* equal to |W(200)| — 0.13, 0.16,
0.23, 0.31 J at the four torques — and looked like a spectacular confirmation of a CRITICAL. It was
entirely the probe's own offset. The differential form (does the work done over an interval equal
the energy change over the same interval?) needs no baseline and is the sound instrument. **This is
the fifth instrument error on this desk this run, and the same class as the other four: the
instrument was wrong for the question.**

---

## 1. Atomic claim

**A torque acting through an angle does work on a rotating body — W = τθ — and that work is the
change in the body's rotational kinetic energy, KE = ½Iω².**

Not covered: what torque is (`torque`), how I is computed (`moment_of_inertia`), how torque produces
α (`tau_eq_i_alpha`), angular momentum (`angular_momentum`), rolling energy splits (`pure_rolling`,
Desk B). Deferred with reasons in §Deferred: `W = ∫τ dθ` for varying τ, and `P = τω`.

---

## 2. State count + arc — 6 states (5 guided + 1 explore)

**Complexity call: medium (5–6 band).** Five teachable ideas, each needing its own complete motion:

| # | Idea | Mergeable or droppable? |
|---|---|---|
| 1 | A rotating body has kinetic energy though it travels nowhere; I and ω set the number | No — it is the quantity everything else changes |
| 2 | The energy goes as ω **squared** — halve the speed, three quarters is gone | No — the square is what students get wrong, and it is not derivable from idea 1 |
| 3 | A torque acting through an angle does work: W = τθ; the **angle** is what counts, and the sign says which way the energy went | No — the concept's second formula |
| 4 | The two connect: the work done is the energy the wheel lost | No — the theorem, and the PRIMARY aha |
| 5 | Where W = Δ(½Iω²) comes from | Advanced ring; droppable under a preset, which is why it is ringed advanced |

Nothing is a pause beat, a restatement, or a state derivable from its predecessor (the
`state_idea_distinctness` trap).

**One machine throughout (Rule 32d):** the contract turntable. **The masses never move** — no state
authors `param_ramp`, none authors `idle_auto_sweep`. **I is constant at 3.06 kg·m² in every
state.** Load-bearing, not convenience: it is what makes W = ΔKE exact in principle, and it keeps
the concept off E5's "`tau` equals `I·α` only while I is constant" trap.

**Deliberately absent, each absence buying something:**

| Off | Why |
|---|---|
| `show_l_arrow: false` everywhere | L is not taught here — so this concept never touches **A-25** (lampshade arrowhead), **A-11**, or **A-16** (dead sign-colour channel) |
| `show_drum_line: false` everywhere | the drum sprite is the ASCII `R_drum` with **no value** (**A-10 / A-27**) — nothing here reads a number off a drawn line |
| `show_pull_arrows`, `show_grip_hand: false` | nothing radial, nothing directional is taught |
| **no `reference_marks` with `form: 'tick'`, anywhere** | **B-1 / A-17** — a KE-bar tick caption clips off-canvas at x = 0. Chips on readouts are used instead |
| **no `restart` block, anywhere** | `W` re-zeroes at a run anchor, so a restart would wipe the work ledger under the teacher — and **A-26** would make the restart read as an uncaused torque |
| no `tau_applied` (drive torque), anywhere | **E10 is open: a drive torque has no rendered actuator** (`eng.padEngageMs` is assigned only in the `brake` branch, `:51689`/`:51696`; no drive mesh in the element list `:51789`) |

**The arc:**

| State | Title (Rule 41 — literal; the rail truncates, so first words carry the meaning) | Purpose | Ring |
|---|---|---|---|
| S1 | **Spinning wheel stores energy** | KE = ½Iω² established; nothing travels, yet the meter reads 3.44 J | core |
| S2 | **Half the speed, quarter the energy** | the square law, read live off a brake decay against two pre-placed chips | core |
| S3 | **Work is torque times angle** | W = τθ with all three numbers live — multiply two, get the third | core |
| S4 | **The work is the energy lost** | **PRIMARY AHA** — the energy meter falls as the work counter grows | core |
| S5 | **Where the rule comes from** | W = ∫τ dθ with τ = Iα and dθ = ω dt ⇒ Δ(½Iω²) | advanced |
| S6 | **Try it yourself** | sandbox | *(explore)* |

Rule 38a: qualitative (S1) → quantitative (S2, S3) → theorem (S4) → derivation (S5); rings monotone
core (S1–S4) → advanced (S5), advanced contiguous immediately before explore ✓.
Gate 12: S1–S5 `manual_click`, S6 `interaction_complete` ✓. No `wait_for_answer`, no
`pause_after_ms`, no `narrative_socratic`.

**No extended-ring state exists — declared, not an oversight.** Every quantitative beat here is
board-core in every syllabus this ships to; the only genuinely advanced content is the calculus
derivation. Consequence: **"hide advanced" and "hide advanced + extended" are the same cut**, walked
in §10(i-1).

---

## 3. Per-state choreography + control plan (Rule 31)

### Authored numeric ground truth

```
I  = 0.50 + 2(2.0)(0.80²) = 3.06 kg·m²      (constant in every state)
ω₀ = 1.50 rad/s  →  KE₀ = ½(3.06)(1.50²) = 3.4425 J  → HUD prints 3.44
τ_brake = 0.40 N·m  →  α = −0.1307 rad/s² → prints −0.13 ;  t_stop = 11.48 s
half speed: ω = 0.75 exactly, KE = 0.860625 → prints 0.86 (a quarter of 3.44)
```

**`τ_brake = 0.40 N·m` is forced, not taste.** The `tau_brake` slider is `step 0.05, min 0, max 2.0`
(`RBR_SLIDER_SPEC` `:50877`), so only multiples of 0.05 are reachable by a teacher — a guided value
the explore slider cannot reproduce would fork the lesson. 0.40 also keeps every guided state clear
of the rest clamp at 11.48 s, where `tau` prints `0.00` and would contradict any narration about a
torque still acting.

> **Every figure in §3 and §4 remains `ASSUMPTION — probe-before-authoring` except A-28's, which Desk
> A has now measured.** `physics_author`'s first obligation is DoD (j).

### Measured: which printed identities hold

| Identity | Status |
|---|---|
| `W = τ × θ` | **AUTHORABLE.** Desk A measured `‖W‖ − ‖τθ‖ ≤ 0.008` across the whole decay at four torques, mostly 0.000 — W and θ ride the same walk, so the bias cancels. S3 is built on it. |
| `ΔKE = ΔW` over an interval | **AUTHORABLE within one display quantum** (Desk A, measured). Not the 40 ms window the architect's re-implementation predicted. |
| `KE₀ + W = KE` **at the full stop** | **OFF BY ONE QUANTUM** — prints `W = −3.45` against `ΔKE = 3.44`. **Do not make the full-stop frame the quantitative money shot** (A-28 revised). |

### Coined archetypes (two, each justified once)

- **`accumulate-through-turn` (S3)** — the apparatus holds an already-established motion while **two
  counters integrate it on screen**. The new picture is not an object moving; it is θ and W climbing
  in lockstep with the rod's sweep. No seed archetype describes "the new thing is an integral
  becoming visible".
- **`mirror-fall` (S4)** — two instruments move in **opposite directions by the same amount**: the
  energy bar drops as the work counter grows. The mirroring itself is the picture. Deliberately not
  the sibling's `diverge-from-mark`: nothing here diverges from a mark.

**Vehicle-vs-archetype note:** the brake decay is this apparatus's only way to change rotational KE,
so it is the *vehicle* in S2–S5. Each state's declared archetype names its own **new on-screen
picture**, and no two are the same picture: S2 = pad travelling in + bar collapsing; S3 = two
counters integrating with the energy meter absent from screen entirely; S4 = the energy meter
returning and mirroring the counter; S5 = the equation assembling beside the same decay.
**Declared-archetype repeats: none.**

### The control table

| S | Teaches (one idea) | Archetype | Authored beat (cause → effect) | Delta cue (≤5 words = on-canvas caption) | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|
| **S1** | A body that turns has kinetic energy, even though it goes nowhere | `reveal-build` | Already turning at ω = 1.50 (home pose, no torque, pad parked off). The `r` line is on from frame 0 and is defined by the sentence naming I. Instruments build one at a time via `readout_at_ms`, each only after the sentence defining it: I → ω → KE, then the bar fills to 3.44 J and holds. | **"Spinning stores energy"** | none | 30–45 | core |
| **S2** | The energy goes as the **square** of the speed | `translate-through` | CAUSE FIRST: the pad translates in (`pad_travel_ms` ≈ 800) and touches at t = 800 ms, alone, nothing else altering. After a readable beat the EFFECT: the spin slows and **the bar collapses far faster than the speed does**. Two chips revealed early and held: `omega` chip 0.75 "half of 1.50"; `KE` chip 0.86 "quarter of 3.44". Live readouts walk down onto them (match ≈ 6537 ms). **The chips carry the numbers; the pin need not land on the match.** | **"Brake on: energy drops fast"** | none | 40–55 | core |
| **S3** | Work = torque × angle, and the sign says which way the energy went | `accumulate-through-turn` | Opens from S2's end pose — **pad already in contact**, so the brake engages at t = 0 and **θ is exactly the angle turned while the torque acted**. Energy instruments **off screen entirely**: readouts are τ, θ, W only. The rod sweeps (the `r` line breaks 2-fold symmetry so turns are countable) while θ and W climb together, W negative from its first nonzero value. Narration names the *operation*, never a fragile figure. | **"Count the angle turned"** | none | 35–50 | core |
| **S4** | **THE AHA.** That work is the energy the wheel lost | `mirror-fall` | Same machine, same brake, same run. The energy meter and bar **return** beside the still-running work counter. As W grows more negative the bar falls by the same amount, beat for beat. **Quantitative is now permitted** (A-28 revised) provided the claim is not pinned on the full-stop frame. | **"Energy meter mirrors work"** | none | 35–50 | core |
| **S5** | Where W = Δ(½Iω²) comes from | `equation-build` | The single formula surface assembles line by line (`formula_lines[].at_ms` — runtime-verified on this desk, findings_a §1) beside a slower replay of the same decay. Readouts I, ω, α, τ, W — so the derivation's first step is checkable on two rendered rows: I × α = 3.06 × 0.13 → prints 0.40, and τ prints −0.40. Calculus notation permitted here and **only** here (Rule 38c). | **"Build the rule"** | none | 40–55 | advanced |
| **S6** | Sandbox | `drag-sandbox` | `mode: 'sandbox'`, free-running (Rule 37). Entry authors `tau_brake_Nm: 0.10`, `engage_at_ms: 0`, so the pad is **rendered and in contact at entry** — the design-side workaround for **A-2**. Slow decay (t_stop ≈ 46 s) so the sandbox keeps moving. `ω₀` re-anchors the run and re-zeroes W, which is correct for a work ledger and is stated in the DoD. | **"Try it yourself"** | **ALL, ring-gated:** `tau_brake` *(core)* · `omega0` *(core)* | 0 / open | *(explore)* |

**Archetype audit:** reveal-build · translate-through · accumulate-through-turn · mirror-fall ·
equation-build · drag-sandbox. Six states, six archetypes, no repeat, no static state ✓.

### Rule 32 legibility plan

- **32a** — S2 is the only state introducing a cause, and it does so alone (~800 ms of pad travel
  with nothing else altering, and the slowing imperceptible for a further ~1 s). S3/S4/S5 open with
  the pad **already in contact**: a declared variance — their cause was delivered in S2 and persists
  as a rendered object, which is 32d continuity, not a skipped cause beat.
- **32b** — no state ramps r, flips spin, or restarts. Between states the *instrument set* changes;
  the *machine* never does.
- **32c** — the delta cue is the on-canvas caption, ≤5 words, exactly as tabled. Prose lives in the
  strip below the canvas (34a).
- **32d** — one continuing machine, one home pose, one camera. The only object that moves relative
  to the apparatus is the brake pad, and it moves once.
- **32e** — exactly one glow focal at any instant, **bound to the element carrying the claim AT THAT
  INSTANT.** This is where the sibling lost three findings (B-6/B-7/B-8) to focals bound to ms
  windows that had drifted off the claim, so the binding is stated per phase:

| S | phase window | `glow_focal` | carries |
|---|---|---|---|
| S1 | 0 → first readout | `rbr_rod` | the thing that is turning |
| S1 | after the KE row lands | *(none — `hold_glow: ["KE"]`)* | |
| S2 | 0 → contact | `rbr_brake_pad` | the cause, travelling |
| S2 | contact → end | `rbr_drum` | where the torque acts |
| S2 | whole state | `hold_glow: ["omega","KE"]` | the rows the chips sit on |
| S3 | whole state | `rbr_r_line` + `hold_glow: ["W"]` | the pointer that makes the angle countable |
| S4 | whole state | `rbr_brake_pad` + `hold_glow: ["KE","W"]` | the agent doing the work; the two mirrored rows |
| S5 | whole state | `rbr_rod` + `hold_glow: ["W","KE"]` | |
| S6 | none | | sandbox |

> **Carried, not hidden (A-1):** `glow_focal` resolves only against 3D scene meshes; HUD rows are
> reachable only through `hold_glow`, which is **static for the whole state**. Per-sentence HUD
> choreography is **not expressible**, and the table above is already the best available.
> `json_author` must verify every named id against the element list (`:51789`) — a `glow_focal`
> naming a row is a **silent** no-op.

### Rule 33

**N/A with justification.** θ, W and KE are properties of the macroscopic body and are visible where
they happen. No microscopic mechanism is taught. **33d satisfied:** every instrument shows a live
numeric reading and the KE bar tracks, rather than decorating.

### Rule 34 canvas budget

| S | Formula surface |
|---|---|
| S1 | `KE = ½Iω²` |
| S2 | `KE ∝ ω²` |
| S3 | `W = τθ` |
| S4 | `W = ΔKE` |
| S5 | `formula_lines`: `W = ∫τ dθ` → `τ = Iα,  dθ = ω dt` → `W = ∫Iω dω = Δ(½Iω²)` |
| S6 | `W = τθ` *(core-ring only — 38b)* |

Real Unicode throughout (½ ω ² τ θ Δ ∝ ∫ α · −). The rbr formatter emits a **true U+2212 minus**
(verified on this desk in the E5 report), which matters in a concept whose central quantity is
negative throughout. Caption = delta cue only; HUD value-only; new DOM panels clear `top:52px`.

### Pin-margin discipline

| S | Beat completes | Pin must land | Why |
|---|---|---|---|
| S1 | ≈ 4.0 s | ≥ 4.8 s | held pose |
| S2 | chip match ≈ 6.54 s | anywhere ≥ 3.0 s | **the chips carry the numbers** |
| S3 | — | **inside the measured `W = τθ` window** | identity must hold at the pinned instant |
| S4 | bar visibly fallen ≈ 5.0 s | ≥ 5.0 s, **and NOT at the full stop** | A-28 revised |
| S5 | assembly ≈ 5.0 s, replay ≈ 8.0 s | ≥ 6.0 s | the last line must be on screen |
| S6 | — | n/a (Rule 37 free-run) | |

THE EYE must read **dense** frames across S2's decay and S3's window, never the frozen frame alone.

---

## 4. Per-state readout / instrument table — every number narration may speak

> **This table exists because of the sibling's most expensive lesson.**
> `conservation_of_angular_momentum` shipped two spoken numbers with nothing on screen showing them
> — "zero point five five metres" (the rim radius: the line renders, the value does not — A-27) and
> a derived ratio — and **both had propagated into `misconception_watch[].visual_counter` and a
> `scene_composition` annotation**, so fixing the narration alone would have left the claim alive.
> **The number must exist on screen before it is spoken, and the instrument is named at design time.**

| S | Readout rows | Bar | Chips | Numbers narration MAY speak, and the instrument carrying each |
|---|---|---|---|---|
| S1 | `I`, `ω`, `KE` (staged) | `ke_bar.max_j: 3.80` | — | **3.06** → `I` · **1.50** → `ω` · **3.44** → `KE` + bar |
| S2 | `I`, `ω`, `KE` | yes | `omega` 0.75 "half of 1.50" · `KE` 0.86 "quarter of 3.44" | **1.50 / 3.44** live at entry · **0.75** ω chip + live ω · **0.86** KE chip + live KE. "Half" and "quarter" are carried by the **chip labels**, so the comparison is on screen too |
| S3 | `tau`, `theta`, `W` | no | — | **0.40** → `τ` (prints −0.40). **θ and W are named as meters, never quoted** — "multiply the torque meter by the angle meter and you get the work counter" |
| S4 | `theta`, `W`, `KE` | yes | *(optional post-A-28 chip)* | the mirrored motion of two live instruments carries the claim; any number spoken must come off `KE` or `W` at a **non-full-stop** instant |
| S5 | `I`, `ω`, `alpha`, `tau`, `W`, `KE` | no | — | **3.06** → `I` · **−0.13** → `α` · **−0.40** → `τ`; the step `I × α = τ` is checkable on the rendered numbers |
| S6 | `I`, `ω`, `KE`, `theta`, `tau`, `W` | yes | — | none (0 authored words) |

**Hard prohibition, carried into the DoD.** `m` (2.0 kg), `r` (0.80 m) and the drum radius (0.55 m)
have **no value instrument anywhere in this engine** — `RBR_RO_META` (`:51107`) has no `m` row and
no `r` row; the `r` sprite is the bare symbol; the drum sprite is `R_drum` with no number
(A-10/A-27). **These three values must never be spoken, in any state, in any language.** They may be
named ("the masses", "the distance r from the axle", "the rim") but never quoted.

**Chip-label length budget (A-30).** Chip labels render inline in the readout `<div>` with no width
clamp (`:51210`) — the same unclamped-label class as A-17. Both labels here are ≤ 14 characters by
construction; `json_author` verifies against the rendered panel width at build.

---

## 5. Misconception plan (Rule 16a — three, at pivots)

S4, S5 and S6 carry **no** `misconception_watch` — straightforward teaching and a sandbox;
manufacturing a fourth would be the per-state tic the founder guardrail forbids.

| Wrong belief | At | Beat (contrast, no predict→pause) |
|---|---|---|
| "Kinetic energy means going somewhere. This wheel stays put, so it has none." | **S1** | *counter:* the centre never moves, the masses trace circles at real speed, and the meter reads 3.44 J throughout · *fix:* every part of the wheel is moving, so the wheel has kinetic energy — for a turning body it is ½Iω² |
| **"Take away half the speed and you take away half the energy."** | **S2** | *counter:* the chips are placed first — "half of 1.50" on the speed row, "quarter of 3.44" on the energy row — then the live readouts walk down onto them, and the bar is three quarters empty when the speed has only halved · *fix:* the energy depends on the speed squared |
| "The wheel is slowing, so nothing is doing work — work only happens when something speeds up." | **S3** | *counter:* the work counter is running, and every value carries a minus sign · *fix:* the brake is doing work; the minus sign says it is taking energy out |

**Named primitive for each wrong picture:** S1 → KE row + `ke_bar` (`:51220`) ✓ live · S2 →
`reference_marks` chip form (`:51204`) ✓ live · S3 → the `W` row with a true minus (`:51124`) ✓ live.
**EPIC-C branches: zero.**

---

## 6. `has_prebuilt_deep_dive` (2)

**S3** — "why the *angle* and not the time?" is where students stall, and where W = F·d must be
re-seated. **S4** — energy bookkeeping is where exam mistakes concentrate, and it carries the
PRIMARY aha. V1.0 ships **zero** authored deep-dives (Rule 18); the flag marks investment priority.

## 7. Drill-down clusters

**S3:** `why_angle_not_time` · `negative_work_sign` · `torque_times_angle_is_joules` (N·m × rad = J,
and why the radian carries no unit). **S4:** `where_does_the_lost_energy_go` ·
`rotational_work_energy_theorem` · `energy_falls_faster_than_speed`.

## 8. `entry_state_map`

```
foundational:  STATE_1 → STATE_4
derivation:    STATE_5
```
Default `foundational`. **PRIMARY aha (S4) is inside the foundational range ✓.**

## 9. Prerequisites (advisory — Rule 23)

| Concept | Shipped? | Note |
|---|---|---|
| `work_done_by_constant_force` | **YES** | Ch.6 — the translational analogue W = F·d, the only prerequisite that actually exists |
| `moment_of_inertia` · `torque` · `rotational_kinematics` · `rigid_body_rotation` | **NO** | in `VALID_CONCEPT_IDS`, no JSON |

No beat is incomprehensible without the four unbuilt ones; each dependency is patched in one clause
inside the state that needs it (Block 1). Explicitly flagged as borrowing: **S3's use of "torque"**
(patched by naming the pad's push at the rim, with the τ meter beside it) and **S5's use of α**
(advanced ring). Nothing assumes `angular_momentum` — this concept never displays L.

## 10. Real-world anchor (Rule 35 / 38f — universal)

**Primary: a bicycle wheel spun by hand, then slowed by squeezing its brake** — assigned to **S2**,
~8 words. It is the *exact* system rendered, so anchor and apparatus are the same object.
**Secondary: a potter's wheel slowed by a hand pressed to its rim** — **S4**, ~8 words; the hand
gets warm, which answers "where did the energy go". Both are in `APPARATUS_CONTRACT.md` §3. No
place, festival, brand, currency or name anywhere; no region-dependent constants.

---

## 11. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the six of §2, exactly as tabled in §3.

**(b) Symbol-label table + term-introduction ledger:**

| Quantity | On-canvas label | DEFINED at | First PRINTED at | ✓ |
|---|---|---|---|---|
| Moment of inertia | `I` (HUD `kg·m²`) | S1, sentence naming I | S1, after it | ✓ |
| Angular speed | `ω` (HUD `rad/s`) | S1, same passage | S1, after it | ✓ |
| Mass radius | `r` (line label, **no value**) | **S1**, the sentence naming I | S1 — `show_r_line: true` from frame 0 | ✓ |
| Rotational KE | `KE` (HUD `J` + bar) | S1, its own sentence | S1, after it | ✓ |
| Torque | `τ` (HUD `N·m`) | **S3**, first sentence — never named in S2 | S3 | ✓ |
| Angle turned | `θ` (HUD `rad`) | S3, its own sentence | S3 | ✓ |
| Work | `W` (HUD `J`) | S3 | S3 | ✓ |
| Change in | `Δ` (formula surface) | S4 | S4 | ✓ |
| Angular acceleration | `α` (HUD `rad/s²`) | S5 (advanced) | S5 only | ✓ |
| Chip labels | "half of 1.50", "quarter of 3.44" | S2, the sentence they answer | S2 | ✓ |

**No symbol is printed before the state that defines it.** Note the deliberate S1 placement of `r`:
the sibling's ledger claimed `r` first printed at S2 while the JSON showed S1 (its ✎2 correction).
This design authors the definition where the print is, rather than the reverse.

**(c) Right-hand-rule plan: N/A with reason.** Scalars on a fixed axis; **no axial vector is drawn**
(`show_l_arrow: false`, `show_grip_hand: false`). The replacement convention: W is negative
throughout the guided arc, the minus is on the digits (true U+2212), and S3 names what it means.
The sign is **not** carried by colour — `RBR_NEG_COLOR` reaches only the L arrow shaft, which this
concept does not draw (A-16).

**(d) Motion plan — nothing is passive.** Every stated agent (the brake) is a rendered object that
visibly moves; every spoken number is in §4's table; **no positive work is claimed anywhere**,
because nothing on screen could do it (§E10).

**(e) Modes:** conceptual-only (Rule 20 [D]). No `mode_overrides`.
**(f)** `assessment` + `coverage_map` authored; `misconception_watch` exactly the three of §5.
**(g)** Macro↔micro N/A per §3; 33d satisfied.
**(h)** Canvas budget per §3.

**(i) Curriculum-flex (Rule 38):**
- **(i-1)** *Hide advanced (drop S5):* S1–S4 + S6 survive; no surviving surface names ∫, dθ, dω or α
  — **α is authored in S5 only**. S6's `W = τθ` is core ✓. *Hide advanced + extended:* **identical,
  because no state sits at the extended tier** (declared in §2).
- **(i-2)** 38b — S6's formula is `W = τθ`; its readouts are all established in S1–S4; **no α row,
  no calculus.** Every symbol on the explore surfaces is defined by a state surviving every cut ✓.
- **(i-3)** Explore controls ring-gated: `tau_brake` *(core)* → taught S2/S3/S4 ✓ · `omega0`
  *(core)* → S1 ✓. **`r` and `m` are deliberately NOT exposed** — no guided state teaches the
  I-dependence of KE, so a slider for it would be exactly the control-with-no-surviving-lesson that
  scar exists to prevent. I-dependence belongs to `moment_of_inertia`.
- **(i-4)** `curriculum_tags` are CLAIMS: CBSE/NCERT Class 11 may be `verified` at authoring; **JEE
  Main · JEE Advanced · NEET · IB DP · A-level · AP Physics 1 · AP Physics C all ship
  `needs_teacher_verification: true`.**
- **(i-5)** Presets: `full` = S1–S6 · `no_derivation` = hide S5 · `core_only` = hide S5 (identical,
  declared).
- **(i-6)** Graph axes **N/A by design** — no graph in any ring (a W-vs-θ graph is noted as an
  engine ask in §Deferred).
- **(i-7)** Dialect: "turning effect (torque τ)" dual-labelled once in S3, then bare `τ`. "Wheel"
  throughout, never "drum".

**(j) The measurement obligation — a build gate handed to `physics_author`.** Before any figure in
§3 or §4 reaches narration or a `reference_marks.value`, run a Playwright probe on the **real
renderer** (clone `_scratch_rbr_a28_probe.ts`'s harness) that: (1) pins S3 across its window and
asserts the **rendered strings** satisfy `|W| = τ × θ`; (2) pins S2 at the match instant ± 200 ms
and asserts rendered `ω` and `KE` read 0.75 and 0.86 against their chips; (3) asserts `I × α` rounds
to `τ` on S5's rendered strings; (4) asserts S4's chosen pin instant is **not** at the full stop and
that `ΔKE` and `ΔW` agree there within one quantum; (5) reads the console and asserts **zero**
`[PM_RBR_TOKEN]` warnings across all six states. **Any disagreement is the probe winning, not the
skeleton.**

**Teacher-usability walk.** (1) *Does anything state the rule in the assessed representation?* S3
shows `W = τθ` with all three quantities live; S4 states `W = ΔKE`; S5 derives it. (2) *First thing
a teacher tries after the aha?* "What if I brake harder?" — S6's `tau_brake` over 0–2.0 N·m with W
and KE live. (3) *Definition precedes use?* Ledger (b).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `moment_of_inertia` → **S1** (patched: I is what the meter reads — how hard
this wheel is to get spinning — set by the masses sitting a distance r from the axle, with the `r`
line on screen as that clause is spoken). `torque` → **S3** (patched as the pad's push at the rim,
τ meter beside it; the concept's only load-bearing borrow). `rotational_kinematics` → **S5**
(advanced ring, one clause). `work_done_by_constant_force` (**shipped**) → **S3**: straight-line
work is force times distance; turning work is torque times angle — a bridge, not a repeat.

**JEE-backwards trace.** *"A flywheel of I = 3.06 kg·m² turns at 1.50 rad/s. A brake applies a
constant opposing torque of 0.40 N·m. Find (i) its rotational kinetic energy, (ii) the work done by
the brake in bringing it to rest, (iii) the angle turned before stopping."* (i) 3.44 J → **S1**.
(ii) −3.44 J → **S4**. (iii) θ = |W|/τ = 8.61 rad → **S3**. **No missing piece.** Caveat worth
Checkpoint A's attention: the *rendered* stopping angle is **8.62 rad**, one hundredth from the
board answer — the same forward-Euler bias as A-28 surfacing a second time, and a second argument
for the one-line fix.

**Misconception entry mapping.** All three confronted proactively inside EPIC-L. **Planting risk:**
S2 could plant "the brake destroys the energy" if narration says it "disappears".
`physics_author` writes "the brake takes the energy out of the wheel", and S4 names where it went —
which is why the potter's-wheel anchor (a warm hand) sits at S4.

---

## Block 2 — Aha-moment designation

- **PRIMARY, S4:** *the work the brake does is not merely related to the energy the wheel loses — it
  **is** that energy, and you can watch one meter fall as the other grows.*
- **SUPPORTING, S2:** *slowing a wheel to half speed does not remove half its energy — it removes
  three quarters of it.* **Cohesion:** S2 sets up S4 directly — a student holding a fresh,
  quantitative picture of the *energy* side is exactly who S4 then balances against the *work* side.
- **Wrong-belief setup.** *Primary:* S2 and S3 build two separate stories — "the brake is slowing
  the wheel" and "the counter is adding something up" — deliberately kept apart, with **S3 removing
  the energy meter from the screen entirely** so the two ledgers are never on screen together until
  S4 puts them there. *Supporting:* S1 builds "3.44 joules, and the speed is 1.50" as a comfortable
  pair, so the confident linear expectation is fully formed before S2 breaks it.
- **Foundational coverage:** S4 ∈ `foundational` ✓.

---

## Deferred, with the reason

| Survey item | Status | Reason |
|---|---|---|
| `W = ∫τ dθ` for a **varying** τ | **Unbuildable today** | `param_ramp` supports **only `r`** (`:50548`); there is no ramped-torque surface. A stepped τ via two `sources[]` brake entries gives varying torque but **one pad** — A-29's defect deliberately authored. The idea survives as S5's formula line, which is honest: the integral is the general rule, the constant-τ case is what the screen demonstrates |
| `P = τω` | **No instrument** | `RBR_RO_META` has no power row. Speaking a power value with no meter is precisely what §4 exists to prevent. Needs one E5-shaped row |
| A `W`-vs-`θ` graph (area = work) | **Engine ask** | The standard exam picture; rbr has no graph surface. Recorded so a future desk finds it rather than re-deriving it |

---

## ENGINE FIT CHECK — per-state × capability, both directions

| # | Capability | Verified at | Tier |
|---|---|---|---|
| C1 | rbr apparatus + contract home pose | `:990-1010`, contract §1 | **[LIVE]** |
| C2 | scalar brake `tau_brake_Nm` + `engage_at_ms` + `pad_travel_ms`; pad travels, holds contact | `:51693-51702`, `:51826`, `:51938-51957` | **[LIVE]** |
| C3 | HUD rows `I ω KE θ α τ W`, dp 2, SI, Unicode + U+2212 | `:51107-51125`, `rbrRoFx` `:51184` | **[LIVE]** (E5, verified this desk) |
| C4 | `ke_bar.max_j` with live fill | `:51220-51254` | **[LIVE]** |
| C5 | `reference_marks` **chip** on a readout + `match_tolerance` | `:51204-51213`, type `:1058-1072` | **[LIVE]** *(A-6 latch caveat)* |
| C6 | single `formula` string surface | `:51570`, type `:51050` | **[LIVE]** |
| C7 | `formula_lines: [{text, at_ms}]` staged assembly | E1; runtime-verified this desk (findings_a §1) | **[LIVE]** |
| C8 | `phases[].glow_focal` | `:51850-51860` | **[LIVE]** *(scene meshes only — A-1)* |
| C9 | `hold_glow[]` HUD emphasis | `:51255+` | **[LIVE]** *(static per state — A-1)* |
| C10 | `show_r_line` | `:1082` | **[LIVE]** |
| C11 | `controls_visible: [{id, min_ring}]` | `rbrControlList` `:50898-50905`, type `:1139` | **[LIVE]** (E5) |
| C12 | `mode: 'sandbox'` free-run | `:993` | **[LIVE]** |
| C13 | `readout_at_ms` staged reveal | `:1046-1048` | **[LIVE]** |
| C14 | signed `W = ∫τ dθ`, re-zeroing at the run anchor | `rbrGridWalk` `:50793-50819`, `rbrWorkAt` `:50825` | **[LIVE]** *(A-28 revised: one quantum at the full stop)* |

**Forward:** S1 → C1,C3,C4,C6,C8,C9,C10,C13 · S2 → C1,**C2**,C3,C4,**C5**,C6,C8,C9,C10 · S3 →
C1,C2,C3,C6,C8,C9,C10,**C14** · S4 → C1,C2,C3,C4,C6,C8,C9,C10,C14 · S5 →
C1,C2,C3,**C7**,C8,C9,C10,C14 · S6 → C1,C2,C3,C4,C6,C10,**C11**,**C12**,C14.
**Reverse:** every capability is claimed by ≥1 state; every state claims ≥1 capability; no state
requires a capability not listed ✓.

**Registration note for 0d:** `json_author` inserts the `concept_panel_config` row and the other
seven sites. **`chapter`/`section` numbering across the eight Ch.7 concepts is still unpinned
(A-4)** — an office ruling, not a desk guess.

---

*Handoff: → founder-proxy **Checkpoint A**. On `DESIGN_OK` → `alex:physics_author`, whose first
obligation is DoD (j).*
