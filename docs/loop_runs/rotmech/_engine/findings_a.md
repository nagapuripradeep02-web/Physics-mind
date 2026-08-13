# Engine findings — desk A (`feat/rotmech-a`)

---

# ✅ VERIFICATION REPORT #2 — E5 + E7 CONFIRMED (Desk A, 2026-08-06)

**To Desk E.** Containment verified directly, not from a report: `bd89d43` (PR #29), `14b2943`
(E7), `deb764b` (E5 notice) and `7022169` (E1) are **all ancestors of `origin/master`**. E1's
earlier direct-branch merge has become a plain master ancestor exactly as predicted.

## E7 `rbr_arrows_have_no_real_shaft` — **PARTIALLY confirmed. A-12 resolved; A-11 NOT resolved.**

> ### ⚠ RETRACTION — Desk A's first E7 measurement was WRONG. Do not cite it.
> The table originally here reported axle-band ink `26 → 1101 px` and a longest contiguous shaft run
> of `8 px → 167 px` (S1), `4 → 167` (S7), `61 → 233` (S6). **Every one of those numbers is
> garbage**, from two independent bugs:
>
> 1. **int16 overflow.** The mask computed `((band - TARGET)**2).sum(axis=2)` with both operands
>    `int16`. Any channel delta above 181 overflows (`182² = 33124 > 32767`), wrapping negative and
>    collapsing the distance — so the near-black axle `rgb(32,44,50)` scored as a *match* for the
>    blue arrow, and the actual white-hot arrow pixels `rgb(255,255,255)` scored as a *miss*. The
>    "167 px shaft" was the **axle**. Caught by `eye-walker`, whose independent read put the arrow at
>    90 px (y 258–348) where mine claimed 167 px at y 93–259 — disjoint ranges, which is what forced
>    the re-check. A column dump settled it: x=640 is axle `rgb(32,44,50)` from y=100 to y=250, and
>    arrow only from y≈255 to y≈348.
> 2. **The method is unsound even in float.** Re-run in `float64`, PRE-E7 shows *more* arrow-coloured
>    ink than POST-E7 — because pre-E7 the axle itself was light grey `#90A4AE (144,164,174)`, which
>    passes any "bright cyan-ish" test. **A colour-threshold ink comparison cannot separate arrow
>    from apparatus across a change that recoloured the apparatus.** There is no threshold that
>    fixes this; the instrument is wrong for the question.
>
> **What survives:** the arrow's own extent POST-E7, where two independent methods agree —
> `eye-walker` 90 px (y 258–348), Desk A 100 px (y 255–354) on `STATE_1__frozen`. And the contrast
> figures below, which were computed in float from declared colours and are unaffected.

**The contrast half of E7 is real and large** (WCAG on declared colours; float arithmetic, no
overflow):

| Pair | pre-E7 | post-E7 |
|---|---|---|
| L arrow `#42A5F5` vs axle | **1.02 : 1** | **5.54 : 1** |
| pull arrow `#4DD0E1` vs rod | **1.04 : 1** | **7.07 : 1** |

**1.02 : 1 is the real explanation of A-11** — the arrow and the axle had essentially identical
luminance, so even where the arrow *was* drawn it could not be seen. `eye-walker` measured the
rendered result at **13.3 : 1** (arrow L=0.924 vs axle L=0.023), so the declared-colour figure is if
anything conservative. Desk E's 4.36 : 1 is a third basis; all three agree the change is real.

**But contrast was only half the defect, and the other half is untouched — see A-11's status below.**

**E7 also darkened the apparatus, which is the half that was not in the dispatch title** — axle
`#90A4AE` → `#1F2A30`, rod `#B0BEC5` → `#26333A`. That matters more than the geometry:

| Pair | pre-E7 | post-E7 |
|---|---|---|
| L arrow `#42A5F5` vs axle | **1.02 : 1** | **5.54 : 1** |
| pull arrow `#4DD0E1` vs rod | **1.04 : 1** | **7.07 : 1** |

**1.02 : 1 is the real explanation of A-11.** The arrow and the axle had essentially identical
luminance, so even where the arrow *was* drawn it could not be seen. No amount of shaft thickness
would have fixed that alone. (These are WCAG ratios on the DECLARED colours — an upper bound. Desk
E's 4.36 : 1 is presumably measured on rendered pixels including Phong shading and emissive, which
is the tighter and more honest number. Not a conflict; different bases. Where they disagree, trust
Desk E's.)

## E5 `rbr_authored_token_silently_skipped_when_the_engine_lacks_the_row` — **CONFIRMED, both halves**

Probe: `src/scripts/_scratch_rbr_e5_probe.ts`. This concept authors none of the new tokens
(`I/omega/L/KE/dLdt` only), so they are exercised on a scratch config — **the approved concept was
not mutated to make a verification pass.**

**(a) The rows print, with the ruled units.** HUD at t = 3000 under a 0.92 N·m brake:
`θ = 4.17 rad | α = −0.30 rad/s² | τ = −0.92 N·m | W = −1.76 J` — dp 2, SI, real Unicode
(θ U+03B8, α U+03B1, τ U+03C4, · U+00B7, ² U+00B2), and a true U+2212 minus, not an ASCII hyphen.
`RBR_THETA_DISPLAY = { unit: " rad", dp: 2, per_rad: 1 }` matches the founder ruling exactly.

**(b) Liveness, not just presence** — the values are real, not zero-filled placeholders: θ has
accumulated, α is negative under a brake, τ is the resolved (not authored) torque, W is negative
because a brake removes energy.

**(c) THE CONSOLE GATE IS LIVE — proved by negative control, which is the check usually skipped.**
A silent console proves nothing unless the warning is known to fire. Authoring a deliberately bogus
token produces, **once per token per state, not per frame**:

```
[PM_RBR_TOKEN] [STATE_B] readouts names 'definitely_not_a_real_token', which has no RBR_RO_META
row — the quantity is NOT printed anywhere on screen. Known rows: I, omega, L, KE, dLdt, F_pull,
theta, alpha, tau, W.
```

It names the token, carries the state id, lists the known rows, and the *known* token beside it
still renders. **Only because the gate is proved live does the real concept's silence mean
anything** — and it is silent across all 8 states, with zero console errors.

**This closes the largest defect class in the chapter.** Six findings on this desk were one shape —
an authored field the engine silently ignores (A-1 HUD glow targets, A-7 pull-arrow reveal, A-8
`min_ring`, A-9 `masses.r_m` at t = 0, the `RBR_RO_META` skip, A-18 the dead formula assembly). One
warning would have caught five of them at authoring time instead of costing a gate cycle each.

## E1 + E4 — re-confirmed post-E7

E1's timed assembly and E4's brake physics were confirmed pre-E7; both re-checked on this run so
that E7 cannot have silently undone them. Details in Verification Report #1 below.

---

---

# ✅ VERIFICATION REPORT — E1 + E4 CONFIRMED (Desk A, 2026-08-05)

**To Desk E, per `ENGINE_LANDING_NOTICE.md` §5.** Desk A is the named verifier for E1/E4/E5 on
`conservation_of_angular_momentum`. **E1 and E4 are both CONFIRMED WORKING. No defect found in
either.** E5 has not landed; not verified.

**⚠ Read §0 first — the sync instruction in the notice does not work, and one of the notice's own
verification methods is not executable on this concept.**

## §0 — Two corrections to the landing procedure itself

**(a) `npm run desk:sync` cannot deliver PR #29, and never could.** `scripts/desk.js` merges
`origin/master` into each desk **and skips the desk you are standing in** — `feat/rotmech-a` has
never once appeared in its output. On top of that, **PR #29 is still OPEN** (`gh pr view 29` →
`mergedAt: null`), so `7022169` is not an ancestor of `origin/master` and no amount of syncing
would have produced it. This is the third consecutive cycle in which a dispatch was reported to
Desk A as "landed" while it existed only on `feat/rotmech-0c3`. **Desk A obtained E1–E4 by merging
`origin/feat/rotmech-0c3` directly** (dry-run clean, then clean). Verify containment before
believing any landed signal:
`git fetch origin && git merge-base --is-ancestor <sha> origin/master && echo ON_MASTER || echo NOT_ON_MASTER`

**(b) §1's "diff against your OWN earlier frames" works — but ONLY with an amplitude-aware
instrument. Byte-identity and naive thresholds both give false alarms.**

> ### ⚠ CORRECTION — this section originally claimed §1 was "NOT executable" on an rbr concept,
> because the turntable spins and capture is not phase-locked. **The AREA figures below are real and
> reproduce exactly, but that MECHANISM WAS WRONG and the conclusion was overstated.**
> `quality-auditor` challenged it and was right; the geometry IS phase-locked. Corrected below,
> with the measurements that settle it. Desk A published the wrong version first — anyone who read
> it should re-read this.

Measured across two runs with **no change whatsoever** between them, and across the merge:

| Frame | pair | pixels differing at all | pixels differing by >8/255 | **max channel delta** |
|---|---|---|---|---|
| `STATE_2__dense_t07000` | control | 29,038 (3.15%) | 28,524 (3.10%) | **16** |
| `STATE_2__frozen` | control | 27,417 (2.98%) | 26,420 (2.87%) | **11** |
| `STATE_2__frozen` | pre→post merge | 27,407 (2.97%) | **0** | **4** |
| `STATE_7__frozen` | control | 26,879 (2.92%) | **0** | **1** |
| `STATE_7__frozen` | pre→post merge | 27,108 (2.94%) | 26,725 (2.90%) | **32** |
| **`STATE_8__frozen`** | **both pairs** | **0** | **0** | **0** |

**The differences are large in AREA and tiny in AMPLITUDE** — up to 3% of canvas, but a maximum
channel delta of 1–32 out of 255. Nothing has moved; something has changed brightness slightly over
a big object.

**The real mechanism, traced by `quality-auditor` in source:** `applyRigidBodyRotationGlow()`
(`:51391`) calls `glowEmphT(time)` on the **absolute** renderer clock (`glowEmphT(t) = 0.5 +
0.5·sin(t·3.5)`, `:3422`). `SET_TIME_FREEZE` pins *state-local* time — geometry, readouts, ramps and
the formula surface are all deterministic — but the **glow pulse phase reads absolute time and
jitters between runs**. The affected area is exactly the glow-focal body, which on this concept is
often `rbr_drum`, a large solid disc. The comment at `:3525` claims the pin covers "glow phase"; it
does not. **This is the already-filed scar
`field3d_focal_glow_pulse_phase_reads_absolute_time_so_frozen_h2_jitters` (MODERATE/OPEN,
`peter_parker:field3d_surgeon`) — not a new row.**

**The decisive control, and it is beautiful:** `STATE_8` is the ONLY state authoring **no**
`glow_focal`, and its frozen frame is **exactly 0 px different — max channel delta 0 — in both
pairs.** Capture is perfectly deterministic where the glow is not involved. That single fact kills
the spin-phase theory and confirms the glow-phase one.

**So the corrected method:**
- ✅ Cross-run comparison IS valid, with an amplitude-aware measure (pixelmatch, or a max-channel-
  delta threshold well above the glow jitter). The auditor's positive result stands: **7 of 8 frozen
  frames are unchanged across the merge**, which is the strongest available evidence that E1/E4
  disturbed nothing.
- ❌ **Byte-identity / md5 is the WRONG instrument here** — and this cuts against §4.1's advice too
  (see the correction to Desk A's md5 claim in §3 below).
- ⚠ **The existing scar's amplitude bound is ~10× too low.** Its prevention rule says no delta
  "below about 0.3 percent" may be attributed to a code change without a negative control. Measured
  here: the same jitter reaches **2.9–3.1%**, because the focal is a solid body. Anyone applying the
  rule as written would treat 2.9% as real signal and blame the code — which is exactly what Desk A
  did. **Recommend amending that row:** add `conservation_of_angular_momentum`, and restate the
  bound as *"any delta on a state whose glow focal is a solid body, regardless of magnitude."*
- The notice's own "run twice with no change and compare" method is what exposed all of this. It
  works. **Run it before trusting any cross-run diff — and read the AMPLITUDE, not just the area.**

## §1 — E1 `rbr_formula_surface_has_no_timed_reveal` — CONFIRMED WORKING

Verified on **three independent channels that fail differently** (a PASS on this concept's own EYE
run is worthless — §3):

1. **DOM text probe** (`_scratch_rbr_formula_probe.ts`) — S3 reads `I₁ω₁` at t = 500/1000/1599 and
   `I₁ω₁\n= I₂ω₂` from t = 2000; S7 reads `τₑₓₜ` through t = 1999 and `τₑₓₜ\n= dL/dt` from t = 2000.
2. **Rewind determinism** — S3 at 3000 → 500 → 3000 un-reveals the second line and reproduces the
   earlier frame exactly. Independently reproduced by `quality-auditor` from the live pinned DOM by
   a different method (pin 9000 → rewind 1500 removes the line). **The reveal is a pure function of
   `tMs`; it introduces no second instance of the `hysteretic_state_cannot_be_latched_under_a_time_pin`
   scar** — which matters, because A-6 shows this engine already has one.
3. **eye-walker on the pixels** — last one-line frame `dense_t01000`, first two-line
   `dense_t02000`, both states; centre-anchored growth measured off the pixels (single line y≈288,
   two-line block y271/y305); Rule 34d clearance on all sides; true Unicode subscripts.

**Contract note §3 applied:** S3 and S7 originally shipped BOTH `formula` and `formula_lines`. The
string was a silent no-op (the lines win), so it has been dropped from both.

## §2 — E4 `rbr_torque_cannot_spin_a_body_up` — CONFIRMED, and the "brake byte-identical" claim HOLDS

This concept authors **brake-only** torque (S5), no `sources[]`, no `applied_torque_Nm`, no
`omega0 = 0` — so for Desk A, E4's claim is that nothing changes. Tested against the invariants
founder-proxy established at the previous Checkpoint B, reading the **live HUD** on a virtual clock
(`_scratch_rbr_e4_probe.ts`): **ALL CHECKS PASSED.**

| Invariant | Result |
|---|---|
| Every torque-free state holds L = 4.59 wherever the row is revealed | ✅ S1, S2, S4, S6 (\|L\|, spin reversed), S7 — worst deviation 0.000 |
| S3 lands on its authored prediction | ✅ ω = 1.50, L = 4.59 |
| **S5 brake decay** | ✅ 4.59 → 4.59 → 4.13 → 3.21 → **2.29 held** |
| S5 held quadruple | ✅ I 3.06 · ω 0.75 · L 2.29 · KE 0.86 — exactly as recorded pre-E4 |
| Rest clamp (now a property of the `brake` KIND, not the integrator) | ✅ never reverses the body; \|L\| non-increasing throughout |
| All four ramps hold at `to`, 20 s past `end_ms` | ✅ S2 0.200, S3 0.800, S4 0.200, S7 0.200 |
| Console / page errors | ✅ none |

**A false alarm worth recording so the next desk does not chase it:** the probe first reported
STATE_1's L as absent at t ≤ 3000. That is **not** a defect — S1 authors
`readout_at_ms: {I: 2000, omega: 2800, L: 3600}`, so the row genuinely has not been revealed yet
(Rule 25: a quantity is printed only after the sentence defining it). A verifier reading HUD rows on
an rbr concept **must** treat an unrevealed row as N/A, never as a failure.

## §3 — THE EYE, on this concept, is now measurably less blind — and still not evidence

**Desk A's seed script had the §4.2 defect.** It wrote `physics_config: { epic_l_path }` with
`field_3d_config` **absent**, starving `deriveMotionExpectations` (`visual_eyes.ts:68`). Every prior
run of this concept therefore reported `Motion map: ?` and **`[D5]` abstained on all 8 states** —
including the runs that gated the concept through a full authoring cycle. **Fixed** (the notice's
caveat holds: `rigid_body_rotation` HAS a motion branch, so this genuinely re-arms `[D5]`). Now:

- `Motion map: STATE_1=true … STATE_8=true`
- `[D5]` reports real measured motion, 1.36 % – 3.96 % max adjacent diff
- **md5 of every dense series: all-unique** — 9/9, 14/14, 11/11, 11/11, 11/11, 11/11, 12/12, 11/11.

> ### ⚠ CORRECTION — md5 is NOT a sound dead-scene instrument, so the line above does not prove
> what §4.1 says it proves.
> `quality-auditor` demonstrated the flaw: on this concept, `STATE_1/2/4/6` frozen frames have
> **different md5s while being perceptually identical**, and md5 flags 6 of 8 frozen frames as
> "DIFFERS" that an amplitude-aware comparison scores at **0 px**. The glow-phase jitter above
> (plus PNG encoder noise) produces hash uniqueness **on a scene that never moved** — which is the
> precise trap `eye_dense_frames_are_never_hashed_so_a_frozen_state_passes_31_of_31` exists to
> catch. *"All hashes unique ⇒ the scene moved"* **does not follow.**
>
> **The conclusion is still correct — no dead scene — but it needed the sound instrument.**
> Per-state adjacent-frame PIXEL deltas: S1 1.21–1.36% · S2 0.85–3.96% · S3 1.07–3.79% ·
> S4 1.11–1.67% · S5 1.06–2.03% · S6 0.37–0.96% · S7 0.72–3.56% · S8 1.21–1.44%. Every state moves.
> S6 is the quietest at 0.96% — the one to watch on a side-on camera.
>
> **Recommend amending that scar row** to specify PIXEL comparison, not hashing. Owner
> `peter_parker:visual_validator` / office.

**The headline stayed `35 checks · 35 passed` before and after.** The count is identical because a
skipped `[D5]` still emits a passing result — which is exactly why the number carries no
information. **A third reason it is hollow here:** this concept has **no `visual_baselines` entry**
(76 concepts are locked; this is not one), so the H2 regression gate had nothing to compare against
either. Filed on this desk as **A-19**; Desk B's scar row
`eye_dense_motion_gates_all_pass_by_construction_on_a_totally_static_scene` is the same finding.

## §4 — Still blocking this concept, unchanged by PR #29

**A-11 = Desk E's E7** ("the L arrow is still 15 px of ink inside the axle", notice §7) and **A-12**.
Both re-confirmed unchanged. S6's atomic claim — "L is a vector, the arrow flips" — is still carried
by a text label teleporting across the authored 500 ms re-pin blank. **This concept cannot seal
until E7 lands**, and Desk A remains its verifier.

---

Desk E (`feat/rotmech-0c3`) is the sole engine owner. This file is a queue, never a fix list for
this desk. Every row names the surface, what the design asked for, what the frozen contract does,
and who it blocks.

---

## A-1 · No time-windowed HUD/instrument glow channel

**Surface:** `rigid_body_rotation` — `hold_glow[]` vs `glow_focal` / `phases[]`
(`field_3d_renderer.ts`, rbr region).
**Raised by:** `alex:json_author`, authoring `conservation_of_angular_momentum`, 2026-08-04.
**Severity:** authoring-fidelity gap, NOT a ship blocker for this concept.

`physics_block.md` §3's per-state "Narration sync" tables assign a glow target to **every
sentence**, including DOM/HUD targets (`I_readout`, `omega_readout`, `L_readout`, `KE_readout`,
`dLdt_readout`, `KE_bar`, `KE_tick`, `predicted_omega_chip`, `formula_surface`), each with its own
time window. The frozen contract offers only:

- `glow_focal` / `phases[].glow_focal` — time-windowed, but resolves ONLY against `rbrIndex`
  (3D scene meshes). Naming a readout there is a **silent no-op**.
- `hold_glow[]` — reaches the readout DOM rows, but is **static for the whole state** (no `at_ms` /
  `until_ms` anywhere in its authoring surface) and closed to exactly the six `RBR_RO_META` tokens.
  It can never target `KE_bar`, `KE_tick`, `predicted_omega_chip`, or `formula_surface` at all.

So the per-sentence HUD choreography the design specifies is **not expressible**, and the way it
fails is silent — the same failure shape as the readout-row skip this desk was warned about.

**What was authored instead:** one static `hold_glow` pick per state (`["L"]` on S1–S5,
`["L","dLdt"]` on S7, none on S6/S8), with `phases[]` reserved for scene-only targets drawn from
the same narration-sync tables.

**Suggested fix (Desk E's call):** a `phases[].hold_glow` variant, so a phase window can pin HUD
rows the way it already pins a scene focal. Worth building only if a later rotmech concept
genuinely needs true per-sentence HUD choreography — file it, don't rush it.

---

## A-2 · S8: the brake pad never appears on a live `tau_brake` drag

**Surface:** `rbrApplyVisibility(rb)` + the pad-translate block in
`updateRigidBodyRotationFrame`.
**Raised by:** `alex:json_author`, 2026-08-04.
**Severity:** real defect, explore-state only. Physics correct, rendered agent invisible.

`rbrApplyVisibility` computes pad visibility (`padOn`) from the **state-authored**
`external_torque.tau_brake_Nm`, at state entry only; the per-frame pad-translate code is itself
gated on `pad.visible`, so nothing re-evaluates it afterwards.

STATE_8 is authored brake-off at entry (matching the skeleton's ENTRY CONFIG and the
idle-sweep-armed seed). A teacher who drags the S8 `tau_brake` slider up therefore gets **fully
correct physics** — L decays exactly per the closed form — while the brake pad, arm and label
meshes never appear. The external torque is real; its rendered agent is missing.

This is a Rule-24/§10(d) problem ("no stated agent without a rendered object") that only bites in
the sandbox. STATE_5 (guided, brake authored ON at entry) is unaffected.

**Suggested fix:** recompute `padOn` from the live `eng.tau` each frame, or re-run visibility from
`rbrApplyParam('tau_brake', …)`.
**Owner:** `peter_parker:field3d_surgeon`.

---

## A-3 · `masses.r_m`'s fallback is `r_max` (0.90 m), not the chapter home pose (0.80 m)

**Surface:** `rigid_body_rotation` apparatus seeding + `APPARATUS_CONTRACT.md` §1.
**Raised by:** `alex:json_author`, 2026-08-04.
**Severity:** documentation trap for the other five turntable desks. This concept is unaffected
(every state authors `masses.r_m` explicitly).

An omitted `masses.r_m` silently seeds the apparatus at **r = 0.90** (`RBR_DEF_R_MAX`), not at the
contract's home pose of 0.80. `APPARATUS_CONTRACT.md` §1 lists `masses.mass_kg`'s default
correctly but has **no row for `masses.r_m`** — so a desk that reads the contract table rather
than the renderer source can ship a state opening at the wrong radius, and Rule 32d's
"one continuing machine" quietly forks.

**Suggested fix:** one row added to `APPARATUS_CONTRACT.md` §1 (`masses.r_m` = `0.80` at the home
pose, engine fallback `0.90` — author it explicitly). A contract edit is an office decision, not a
desk one (contract §4).

---

## A-1 amendment (2026-08-04, quality-auditor) — narrow the scope

`phases[]` DOES reach every **scene mesh** target with real time windows, and delivered this
concept's narration choreography well (18 entries across 7 states, authored straight from
physics_block §3 and verified rendering). What is genuinely unreachable is only the **HUD-row and
non-mesh** targets: `KE_bar`, `KE_tick`, `predicted_omega_chip`, `formula_surface`, and
per-sentence readout rows. Desk E should scope a `phases[].hold_glow` to exactly that list rather
than over-build a general channel.

## A-3 amendment (2026-08-04, quality-auditor) — explicit authoring is NOT sufficient protection

A-3 as written implies that authoring `masses.r_m` explicitly protects a desk. **It does not, in
any ramped or swept state.** `rbrRAt(0)` returns `ramp.from` (`:50538`) or `sweep.lo` (`:49859`),
never `masses.r_m` — so the authored entry radius is silently dead at t = 0 exactly where the
entry pose matters most. This is the mechanism behind blocker B-1 on this concept (see A-9).
Amend the note to the other five turntable desks accordingly.

---

## A-5 · Sparse slider panel renders full height (confirmed regression of an OPEN scar)

**Scar:** `force_rig_slider_panel_renders_full_height_when_one_row_visible` (MODERATE/OPEN).
**Now reproduced on `rigid_body_rotation`.** `STATE_5__frozen.png`: panel spans y≈458–700 with the
single τ row at y≈620–655 — ~160 px of empty black. `STATE_6__frozen.png`: ~205 px of empty black
above "Reverse spin". S8 (five rows) fills it correctly.

**Tension to resolve, not just a fix:** skeleton E8 mandates `visibility:hidden` over
`display:none` for row-position stability (scar
`field3d_per_state_slider_rows_collapsed_in_a_bottom_anchored_panel_make_shared_rows_jump`) — and
that is exactly what preserves the height. The surgeon must satisfy both.
**Owner:** `peter_parker:field3d_surgeon`.

### Scope note (eye-walker, 2026-08-05) — the same class on a SECOND panel

Not a new row; widen this one. The **readout panel** has the same defect: on S1 and S2 at
t = 0–1000, before the first `readout_at_ms`-staged row lands, it renders as a small **empty black
bar**. Same root shape as the slider panel — a container sized independently of its live content.
Whatever fix satisfies the E8 tension above should be applied to both panels, or the empty-container
class simply moves house. (Measured on the current run: S5 ~165 px of empty slider panel, S6 ~205 px;
S8's five rows fill correctly.)

## A-6 · S3's match cue is latched, not a closed form of t — already fired in every rewound frame

**Severity: the most consequential engine finding on this concept.** Regresses OPEN scar
`hysteretic_state_cannot_be_latched_under_a_time_pin`.

`eng.matched[mid]` (`:50276`) is set once and cleared only at state *apply* (`:50512`). Under a
`SET_TIME_FREEZE` rewind it never clears. Sampled ink colour of the ω row across **all 11 S3 dense
frames**: `rgb(255,241,118)` = `#FFF176` hold-glow at **t = 0 through t = 10000** — the co-glow
that is supposed to mark "the live readout *lands* on the prediction" is already on while ω reads
6.95 and the chip reads 1.50.

Live forward playback is correct. The damage is twofold: (a) THE EYE **structurally cannot
verify** the one beat S3 exists to deliver, and (b) any frame a reviewer scrubs back to shows a
false agreement.

Note this contradicts skeleton SCAR AUDIT row 40, which dispositioned that scar "B — satisfied" on
the strength of S5's L(t) closed form. **The match cue is a SECOND hysteretic element and the
disposition missed it.**

**Fix:** derive `matched` from `tMs ≥ t_match` (closed form off the ramp), or clear the latch
whenever `tMs` decreases. **Owner:** `peter_parker:field3d_surgeon`.

## A-7 · No reveal channel for the pull arrows — S2's cause-before-effect beat is a glow onset, not an appearance

`rbr_pull_arrow: rb.show_pull_arrows` (`:50609`) is boolean-only; there is no `at_ms`.
`STATE_2__dense_t04000.png` shows the arrows already on screen at t = 4000 with the masses still at
r = 0.80. physics_block §3 S2 specifies "4190–4890 ms: `pull_arrows` **appear** … masses NOT yet
moving" — **not expressible today**.

What ships instead is the `cause` phase *glowing* them at 4190 before the 4890 slide, which is a
legitimate Rule-29 cause-first beat, so Rule 32a survives in substance. json_author had no better
option. Note also that the 700 ms window falls between dense frames (4000/5000), so **no captured
frame shows it and eye-walker cannot confirm it either**.
**Owner:** `peter_parker:field3d_surgeon`.

## A-8 · rbr `controls_visible` cannot express `min_ring` — the ring-gated explore claim is a paper claim

`bonding_scene` already implements `{ id, min_ring }` (`:55484–55492`), but rbr's token is a bare
string union (`:1051`). skeleton §3 ("r core · ω₀ core · m core · brake core · spin-direction
**extended**") and §10(i-4) ("controls auto-cut by min_ring") therefore **land nowhere in the
shipped JSON, silently**.

Nothing is broken today (no preset builder consumes rings yet), but the claim must not be sealed as
satisfied at Checkpoint C. Cheap to fix — the pattern already exists.
**Owner:** `peter_parker:field3d_surgeon`.

## A-9 · `masses.r_m` dead at t=0 in ramped/swept states — the mechanism behind blocker B-1

See the A-3 amendment above. `rbrRAt(0)` resolves to `ramp.from` / `sweep.lo`, never
`masses.r_m`. On this concept it made S8 open at r = 0.20 with **L = 0.99 instead of 4.59** for the
whole explore state, because `idle_auto_sweep.range` was authored `[0.20, 0.80]` and the engine
reads `range[0]` as the sweep START, not as a minimum (`:50542`, `:49859`, `:50556`).

The concept-side fix is `range: [0.80, 0.20]` (done). The engine-side question for Desk E is
whether `range` should be order-sensitive at all, or whether `masses.r_m` should win at t = 0.
**Owner:** `peter_parker:field3d_surgeon`.

## A-10 · `R_drum` sprite is an ASCII identifier rendered on canvas

`rbrMakeLabel("R_drum", …)` (`:50340`) is hardcoded in the renderer; visible in
`STATE_5__frozen.png` and `KEYFRAMES_STATE_8__t05512.png`. physics_block callout 2 rules that
"drum" is an internal identifier and every reader-facing string says "turntable".
**Owner:** `peter_parker:field3d_surgeon` (the legend half was concept-side and is fixed).

> **ID-collision note (2026-08-05).** `rotmech_a_state.md`'s Desk-D blocker section and
> `findings_d.md` §6c both instruct this desk to file the timed-formula-surface dependency
> "as **A-11**". **A-11 was already taken** by the row immediately below — the CRITICAL L-arrow
> occlusion defect, which founder-proxy Checkpoint B carries as blocking **E-1**. Re-using the id
> would have merged a blocking engine defect with a separate cross-desk ask in the queue Desk E
> reads. The formula-surface dependency is therefore filed at the next free id, **A-18**, at the
> foot of this file. Anyone arriving here from the state doc looking for "A-11 = formula surface"
> wants **A-18**.

## A-11 · The L arrow is visually indistinguishable from the static axle pole

**Severity: CRITICAL. Raised by `eye-walker` from cross-state pixel comparison, 2026-08-04.**
Independent of the quality-auditor's pass — worth Desk E confirming before acting.

Cropped comparison of `STATE_1__dense_t00000 / 01000 / 02000.png`, and `STATE_1__frozen.png`
(L = 4.59) against `STATE_5__frozen.png` (L = 2.29): the axle pole reads **pixel-identical in
length and colour at every t and at every L value** — no reveal-in animation over 0–1200 ms in S1
(already full length at t = 0), and no length scaling despite L nearly halving by S5.

Renderer source shows a real scaled-length calculation exists (`RBR_L_ARROW_SCALE = 0.20`,
min/max `0.22`/`1.80`, `:49795–49797`), so the likely cause is that the drawn arrow is not visually
separable from the always-present static axle geometry rather than that the maths is wrong.

**Why it matters:** it undermines S1's stated reveal ("the L arrow draws in … length ∝ |L|") and is
far more serious for **S6**, whose entire misconception payload ("L is a vector, not just a
number") depends on a visible arrow flipping direction. What actually flips is the position of a
floating "L" text label relative to an unchanged, symmetric axle pole.

**Prevention rule:** a vector primitive whose length or reveal is claimed in the spec must be
diffed pixel-for-pixel against the same apparatus at two different magnitudes before a scenario is
considered done. Identical pixels at differing physics values = the primitive is not rendering as
specified.
**Owner:** `peter_parker:field3d_surgeon`.

### ⚠ MECHANISM CORRECTED — founder-proxy Checkpoint B, 2026-08-04. **BLOCKING (E-1).**

**The scaling maths is NOT the defect. Do not touch `RBR_L_ARROW_SCALE`.** It runs correctly:
0.20 gives 0.918 units at L = 4.59 and 0.458 at L = 2.29, and the head *does* move (L-label at
y≈279 in `STATE_1__frozen.png` vs y≈310 in `STATE_5__frozen.png`, a ~31 px shift).

**The real defect is occlusion.** `THREE.ArrowHelper` builds its shaft as a zero-width
`THREE.Line`. The arrow sits on the axle centreline at (0, ±0.22, 0) (`:50386–50388`) while the
axle is an opaque `CylinderGeometry(0.07, 0.07, 3.4)` at y = 0.6 (`:50304–50307`) spanning
y ∈ [−1.1, 2.3]. **The shaft is entirely inside the axle.** Only the 0.24-long cone head
protrudes, and its size is fixed regardless of |L| — so magnitude is communicated by head
*position* alone, and S1's authored 0–1200 ms draw-in never reads at all.

**Expected fix:** a shaft with radius > 0.07 or offset laterally clear of the axle, plus
`depthTest:false` + `depthWrite:false` + `renderOrder ≥ 998` per the prevention rule on the FIXED
row `pp_probe_and_sheet_arrows_camouflaged_by_translucent_plate_blend`. Plus a reveal path for
S1's draw-in.
**Probe:** capture at L = 4.59 and L = 2.29 with the axle masked out; assert the arrow's own drawn
pixel extent differs by ≥ 1.8×.

### Aggravating factor found on the 2026-08-05 walk — S6's flip happens ACROSS a blank

Not a new defect and not a reason to change the fix, but the surgeon should know the worst case is
worse than filed. S6 authors a `repin_cue: {blank_ms: 500}` — a deliberate 500 ms blank with the
engine's own `rbr_repin` "restarting" badge (`:50337–50341`, Addendum C: a discontinuity must read
as a restart, never as an uncaused external torque). Correct by design. **But it lands exactly on
S6's L-flip beat.** With the arrow occluded, the entire reversal S6 exists to teach is carried by
the blue `L` glyph jumping from y ≈ 214 (above the disc) to y ≈ 494 (below it) **across that
blank** — nothing visibly rotates through zero. So S6 currently teaches its atomic claim with a
label teleport over a gap. Once the arrow is visible the blank stops being load-bearing; until
then, S6's aha is the casualty of the two interacting.

## A-12 · Pull-arrow minimum-length floor collapses low-force visibility (pre-flagged scar, now CONFIRMED)

**Scar:** `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` — named
prospectively in physics_block §6 callout 4, **now materialized**. Raised by `eye-walker`.

Across the S2 slide (`STATE_2__dense_t04000 / 05000 / 06000 / 07000.png`): at r = 0.80,
F ≈ 3.6 N (t4000, t5000) there is **no visible arrow geometry at all**, only a "pull" text label. A
small cyan chevron becomes visible only from r ≈ 0.35 downward, clearest at r = 0.20, F = 19.35 N.

It bites hardest at **S2's cause beat** (4190–4890 ms, masses still at r = 0.80) — the Rule-32a
cause-precedes-effect moment carrying the concept's PRIMARY aha, where skeleton §9 explicitly
requires "the agent that does the work is nonetheless ON SCREEN as the rendered −r̂ arrows".

A floor exists (`RBR_ARROW_MIN_LEN = 0.16`, `:49795`).
**Owner:** `peter_parker:field3d_surgeon`.

### ⚠ MECHANISM CORRECTED — founder-proxy Checkpoint B, 2026-08-04. **BLOCKING (E-2).**

**The arrow is NOT below the floor. Do not tune `RBR_ARROW_MIN_LEN`.**
`rbrArrowLen(3.60 N) = 0.070 × 3.60 = 0.252` world units — comfortably **above** the 0.16 floor.

**The real defect is camouflage.** 0.252 is almost exactly the rod's own 0.20-unit tip overhang
(half-length 1.0, mass at 0.80); the arrow is positioned tail-outward from the mass onto precisely
that overhang (`:50692–50698`), and renders in a near-identical pale tone against the same pale
rod. `STATE_4__dense_t03000.png` shows it: at the cause beat the only cyan thing on screen is the
*word* "pull".

**And note the inversion that makes it worst where it matters:** `F = mω²r` with `ω ∝ 1/I` means
the arrow is **smallest exactly when it must be seen** (the cause beat, masses still out at
r = 0.80) and largest after the slide is over.

**Expected fix:** at the guided minimum F = 3.60 N the arrow must be unambiguously separable from
the rod in **colour AND depth**, not by length. Verify at the beat's OPENING frame, not at the
explore-range extremes the 0c-1 Addendum D map was tuned for.

---

## A-16 · The sign-colour convention is dead on screen — it reaches the arrow only, and that arrow is invisible

**Raised by `founder-proxy` at Checkpoint B, 2026-08-04. Nobody had filed this.** Ride-along (E-3).

physics_block §6 callout 5 (founder-approved) requires that "a teacher should read the sign from
colour alone before reading the number." In the renderer:

- `RBR_NEG_COLOR` has **exactly one consumer** — `:50708`, `lArrow.setColor` — and that recolours
  the shaft A-11 proves is invisible.
- `rbr_l_label` is built with `RBR_POS_COLOR` (`:50390`) and its update block (`:50719–50720`)
  sets **only `.position`**, never colour.
- The HUD digits take no sign colour anywhere.

Confirmed in `STATE_6__frozen.png`: at ω = −1.50, L = −4.59, the "L" glyph is still cool blue and
the readouts are the same grey as S1's positive ones. **The entire colour channel the design
specified does not exist.**
**Owner:** `peter_parker:field3d_surgeon`.

## A-17 · S4's tick caption overflows its panel and clips off-canvas

**Raised by `founder-proxy`, 2026-08-04.** Ride-along (E-4). Recurrence of the **FIXED** row
`graph_marker_label_clipped`.

`STATE_4__frozen.png` and `STATE_4__dense_t03000.png` show "if energy stayed constant" starting at
x = 0 with its first glyph cut, outside its own panel box (x 20–260).

That row's existing prevention rule reads: "clamp draw-x into `[padL, W-padR]` — never allowed to
overflow the panel edge — **verified especially on the state carrying the concept's aha**."
S4 carries the SUPPORTING aha. Apply the existing rule; do not mint a new class.
**Owner:** `peter_parker:field3d_surgeon`.

## A-13 · "R_drum" and "brake" labels collide during S5's pad-engaged window

Reproduced at `STATE_5__dense_t01000.png`, recurring at t = 3000 / t = 5000 while the pad sits near
the drum edge — the two labels render stacked and unreadable as separate words. Resolves once the
pad retracts (absent from `STATE_5__frozen.png`, which is why the frozen-only read misses it).

Scar `field3d_label_sprite_overlap`. E5's hysteretic decollision machinery — already named for this
concept — needs the **brake-pad label as a decollision participant**, not just r / R_drum / pull / L.
**Severity:** MODERATE. **Owner:** `peter_parker:field3d_surgeon`.

### ⚠ SCOPE WIDENED — eye-walker, fresh capture `20260805-124934`, 2026-08-05

A-13 was filed as a **brake-vs-R_drum, S5-only, pad-engaged-window** collision. The second walk
found the same class in four more places across three more states, so the fix must be general, not
a two-label special case:

| Where | Collision |
|---|---|
| S3 `dense_t03000` | `pull` overprints `L` — renders as an unreadable `pulL` |
| S3 / S4 / S8 frozen | `pull` sits on top of the yellow mass it labels |
| S5 frozen | `brake` overprints the red pad (the original A-13 case) |
| S5 / S8 | `R_drum` overprints the drum ring |

The real class is **world-anchored sprite labels have no de-collision at any orbit angle** — a
label can overprint both its OWN geometry and a peer label. eye-walker proposed it as a new row
(`world_anchored_sprite_labels_overlap_their_own_geometry_and_each_other`); it is **not filed
separately** — it is this row, widened. Suggested prevention rule, adopted from that proposal: a
world-anchored label carries a screen-space offset resolved against the sprite it names AND against
peer labels; anything that would overprint at any orbit angle is nudged, not drawn.

### ⚠ A-10 INDEPENDENTLY CORROBORATED — same walk

eye-walker re-derived the `R_drum` ASCII sprite from the pixels without being told it was filed
(`:50397  rbrMakeLabel("R_drum", …)`, visible on S5 and S8) and reached A-10's conclusion by the
same route: it is the **third text path** (`createLabelSprite`) that a DOM-only Rule-34c sweep
silently skips, and `R_drum` also fails Rule 41 as a non-word. **Not re-filed — this is A-10.**
Two independent derivations raise confidence that the sprite path needs a standing sweep rule, not
a one-off string fix.

### ⚠ MECHANISM PINNED TO SOURCE + SEVERITY ESCALATED — Checkpoint B retry, 2026-08-13 (post master merge)

A-13 was filed twice from PIXELS. This pass pins it to **two source lines**, so the fix is now a
known one-offset change rather than a general de-collision build. quality-auditor reported it as a
new finding `rbr_brake_label_collides_with_the_drum_line_label_at_the_contact_pose`; **it is not
new — it is this row.** Do not mint a second `bug_class`. Line numbers below are post-merge and
supersede A-13's original `:50397` (the region moved ~6.8k lines).

| Site | Line | Position |
|---|---|---|
| `R_drum` label | **`:57222`** | `drumLbl.position.set(0, 0.42, RBR_DEF_DRUM_R * W + 0.34)` |
| pad contact | **`:57782`** | `contactZ = eng.drumR * W + 0.09` |
| `brake` label | **`:57796`** | `padLbl.position.set(0, 0.40, z + 0.20)`, and the engaged branch pins `z = contactZ` |

Engaged ⇒ Δ = **(0, 0.02, 0.05)** between two camera-facing sprites 0.30 and 0.28 tall. The overlap
is **deterministic and unavoidable**, not orbit-angle-dependent, and it lasts the entire
`engage_at_ms 1500 → release_at_ms 4000` window — the whole of S5's taught beat. Verified in source
this session, independently of the agent that reported it.

**Severity MODERATE → BLOCKING for `conservation_of_angular_momentum`**, on three grounds:
S5 is **core ring**, so it survives every preset cut including `core_only`; the skeleton's own scar
audit re-dispositioned `teach_distinct_reference_lines_for_two_radii` from N/A to **BINDING** on the
requirement that `r` and the rim render as two distinctly-labelled lines — and the rim label is
destroyed exactly when the rim is the taught object; and the concept sits on the OPEN
`teach_visual_must_match_narration` row, where `s5_1` names the agent ("A brake pad presses onto the
turntable's rim") while the label naming it is unreadable. **Authoring-side is clean — no field
controls either sprite's position, so this must NOT route to `alex:json_author`.**

### 🔎 NEW, same two lines — the drum ring and its label are pinned to the CONSTANT while the pad tracks the LIVE value

Found while verifying the above; **not previously filed anywhere.** The ring's torus is built at
`RBR_DEF_DRUM_R * W` (`:57215`) and its label at `RBR_DEF_DRUM_R * W + 0.34` (`:57222`) — both the
hardcoded `0.55` (`:55937`) — and neither is ever rescaled. But the pad's `contactZ` reads the LIVE
`eng.drumR`, which resolves as `rbrNum(ap.brake_drum_radius_m, RBR_DEF_DRUM_R)` (`:57453`).

So **`brake_drum_radius_m` moves the pad but not the drawn ring or its label.** A concept authoring
anything other than 0.55 gets a pad engaging at a radius where no ring is drawn — the braked radius
asserted in one place and drawn in another. It is invisible on `conservation_of_angular_momentum`
only because the authored value (`0.55`, four states) happens to equal the default.

**This is the chapter's signature class again** — something authored, accepted by every gate, that
silently does nothing — and it is the exact shape of the SEAM-G `radius_m` pair in
`ENGINE_LANDING_NOTICE.md` §2: *"no-ops on master … but they change what happens the moment you
do."* Whoever fixes the collision is already in these lines; fixing the offset without repointing
the ring and label at `eng.drumR` leaves the trap armed for the next concept. **Owner:
`peter_parker:field3d_surgeon`, same dispatch.**

## A-14 · Two OPEN scars give contradictory instructions on narration glow

`concept_ships_zero_narration_glow_bindings` (MAJOR/OPEN, `alex:physics_author`) wants
`tts_sentences[].glow` bindings. `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state`
(OPEN) says such glows would be **inert** wherever a state authors a `glow_focal` — and marks the
question "FOUNDER DECISION PENDING".

This concept ships 0 `tts_sentences[].glow` and instead moves emphasis on narration windows via 18
`phases[]` entries — the only path that actually renders. Recorded as **satisfied in substance,
not omitted**. No action for Desk E; **this one needs a founder ruling**, not an engine fix.

## A-15 · The schema cannot express "explore state, zero authored narration" — OFFICE item, not Desk E

**Surface:** `src/schemas/conceptJson.ts` — a **Rule 40 platform file**. Not an engine finding and
NOT for this desk or Desk E; it lands on master separately, by the office.

physics_block §4 authors **0 words** for S8, as Rule 31 requires of an explore state. The schema
cannot say that:

```
:73   // advance_mode + teacher_script are now REQUIRED per state.
:100  teacher_script: teacherScriptSchema,              ← required, no .optional()
:25   tts_sentences: z.array(ttsSentenceSchema).min(1), ← array must be non-empty
:15   text_en: z.string(),                              ← no .min(1), so "" is legal
```

The array carries a minimum; the string does not. So the only way to author zero narration is a
single sentence with `text_en: ""`.

**All three consumers handle it safely** (each checked, not reasoned about):
`generate_tts_audio.ts:339–347` skips empty text with a warning, records
`available: false`, and makes **no Sarvam call — no spend, and the shipper does not trip**;
`build_review_site.ts:648` gives `#caption` a fixed `min-height:1.35em` so the strip cannot
collapse; `estSentenceMs('')` clamps to `MIN_SENTENCE_MS` and, S8 being last, `onTimelineEnd`
skips auto-advance and Rule 37's free-run is preserved.

**Why it still deserves a ruling:** this is a **fleet-first precedent**. Of 150 concepts there are
105 `interaction_complete` states and **exactly one** with zero narration words — this one.
`grep -rl '"text_en": ""' src/data/concepts/` returns one file. The idiom will spread by
copy-paste into the next seven rotmech concepts.

**Suggested affordance:** allow `tts_sentences: []` when `advance_mode === 'interaction_complete'`.
**Owner:** office, on master, per Rule 40 — never a chapter-branch edit.

## A-27 · The rim reference line renders no VALUE — narration had to drop a correct number

**Found by Desk A's narration audit, 2026-08-06.** Extends **A-10** (which covers the same sprite
being ASCII); this is the *other* half. Owner `peter_parker:field3d_surgeon`.

skeleton_rev3 §S5 specifies "the rim radius is drawn as **its own labelled reference line**,
visually distinct from the r line". The line is drawn (`show_drum_line: true`) — but its label is
the sprite `rbrMakeLabel("R_drum", …)` (`:50397`), which carries **no number**. Every on-canvas
string in STATE_5, dumped from the live engine at five pinned instants, is:

```
HUD[I = 3.06 kg·m² | ω = 1.50 rad/s | L = 4.59 kg·m²/s | KE = 3.44 J]
FORMULA[τₑₓₜ ≠ 0 ⇒ L changes]   SLIDERS[τ = 0.92 N·m]
```

**0.55 appears nowhere.** So narration asserting "…the rim at zero point five five metres" quoted a
number no instrument shows — Rule 33d, and the same *class* as Desk B's N2 (a spoken number the
canvas cannot confirm), though here the value was *correct* rather than wrong.

**Concept-side action taken:** the number was removed from narration and from the S5 annotation, so
nothing is asserted that a teacher cannot point at. The geometric claim that carries the teaching —
"the masses stay outside this braked radius" — is retained and IS visible (pad at 0.55 inside masses
at 0.80).
**Engine action wanted:** give the rim label its value (`R = 0.55 m`, and per A-10 a reader-facing
word rather than `R_drum`). Then the number can return to narration with an instrument behind it.

## A-25 · The L arrowhead is wider than it is long — it reads as a lampshade, not an arrow

**Both gates found this independently on the post-E7 walk (2026-08-06) and RATED IT DIFFERENTLY —
`eye-walker` MAJOR, `quality-auditor` LOW.** Owner `peter_parker:field3d_surgeon`. Referred to
founder-proxy for the severity call.

The head's radius is 0.279, so it spans **0.558 across against `RBR_L_HEAD_LEN = 0.24` long**. The
`hl = min(headLen, L*0.40)` shrink only helps *short* vectors; at full length, under the default
3/4 camera `[2.74, 3.87, 2.74]`, the head projects as a lampshade threaded on a pole rather than as
an arrowhead. `eye-walker` measured it on `STATE_1__frozen`: **70 px head on a 46 px shaft** — the
head is wider than the visible shaft is long — with the dark axle continuing ~170 px above the tip,
so the eye reads a collar rather than an endpoint.

**Why the disagreement is legitimate:** quality-auditor notes S1 uses the arrow as a MAGNITUDE
indicator by design (direction semantics are taught only at S6), so no taught claim breaks; and the
same primitive reads correctly under S6's side-on camera. eye-walker notes that "reads as a vector"
is the whole point of the E7 programme, and that a viewer who cannot see an arrowhead cannot read a
vector.

**The reference implementation is already in-tree, in this same dump** — S6's arrow renders as
**60 px head on a 74 px flat-shaded shaft**, a crisp triangle. Same primitive family, one legible
instance and seven illegible ones. Whoever takes this has a working target to match, not a design
problem to solve.
**Suggested prevention rule** (eye-walker's, adopted): any arrow primitive must satisfy
`head_width ≤ 0.6 × visible_shaft_length` and must not terminate part-way along a longer collinear
apparatus member.

## A-24 · E7 over-corrected the darkening — the apparatus now sits at 1.37:1 against the background

**Raised by `quality-auditor`, post-E7 audit 2026-08-06. LOW–MEDIUM, NOT blocking (both gates
agree).** Owner `peter_parker:field3d_surgeon`. **Fleet-wide — inherited by all eight Ch.7
concepts.**

E7 darkened the apparatus to buy arrow separation. Measured on rendered pixels against the
`#0A0A1A` background:

| Element | rendered | vs background |
|---|---|---|
| axle | `rgb(32,44,50)` | **1.37 : 1** |
| rod (outboard) | `rgb(44,58,67)` | **1.67 : 1** |
| drum | `rgb(95,124,137)` | 4.42 : 1 |

Readable on a monitor and in every frame inspected; **thin for a classroom projector**, where a
lifted black floor will take the axle above the drum and the rod's outboard ends first. The trade
was over-paid: arrow-vs-axle now measures ~13:1 where separability needs perhaps 6:1, so there is
ample headroom to lift `RBR_AXLE_COLOR` / `RBR_ROD_COLOR` back up while keeping
`RBR_SEP_RADIUS_RATIO` / `RBR_SEP_EMISSIVE_RATIO` unchanged.
**Suggested prevention rule:** structural apparatus must clear 2:1 luminance against the backdrop;
buy arrow separation by lowering saturation, not luminance headroom.

> **⚠ Numbering note.** `quality-auditor` proposed these two as "A-23" and "A-24". **A-23 was
> already taken** by eye-walker's CRITICAL S6 finding, filed earlier the same day. They are renumbered
> here to **A-24** (over-darkening) and **A-25** (arrowhead). This is the second id collision on this
> desk — see the A-11/A-18 note at the head of A-11. Two agents proposing ids in parallel will keep
> colliding; ids are assigned HERE, on write, never by the proposer.

## A-23 · ~~CRITICAL · S6's flip is a RESTART, not a rotation~~ — **WITHDRAWN 2026-08-06 by founder-proxy Checkpoint B**

> ### ⛔ WITHDRAWN. Do NOT file this `bug_class`. Do NOT adopt its prevention rule.
> `sign_reversal_taught_as_a_step_not_a_visible_rotation` **must not enter the corpus** —
> founder-proxy: *"Filing it would poison the corpus for every rotation concept in the chapter."*
>
> **Why the finding was wrong — the instrument, not the reviewer.** eye-walker read motion off
> dense frames sampled at **1 Hz** on a rotor with a **4.19 s period** (ω = 1.5 rad/s) — **86° of rod
> per frame**, on a rod with 2-fold symmetry. At that cadence a steadily spinning rotor is aliased
> into apparent stillness and its direction is *unrecoverable in principle*. eye-walker's own spec
> says motion is judged from the drive dump, and **no `.founder_runs` dump existed in this run**, so
> its instrument could not have returned any other answer. The apparatus does counter-rotate;
> founder-proxy measured θ on a 100 ms grid: `t=100…4400 θ: 0.15 → 6.60` (+1.5 rad/s), then
> `t=4500…10000 θ: 6.75 → −1.46` (−1.5 rad/s).
>
> **And the prescription was physically wrong.** For a **fixed-axis rotor L is always ±ẑ** — an
> arrow at an intermediate tilt would be *incorrect*. The rule demanded either L tilting off a fixed
> axle (unphysical here) or L passing through zero, which **requires an external torque**. The
> latter is exactly what Checkpoint A's finding **F-2 removed**: a teacher would watch L go
> 4.59 → 0 → −4.59 two states before the only torque source is introduced, contradicting the
> concept's atomic claim. **Adopting A-23 would have reintroduced the defect F-2 exists to prevent.**
>
> **Lesson for this desk, worth more than the finding:** a 1 Hz sample cannot measure a 0.24 Hz
> rotation. Before filing a motion defect read off dense frames, check the sampling rate against the
> period. This is the same class as Desk A's own three retracted colour-mask measurements — *the
> instrument was wrong for the question*, four times in one day, by three different agents.

### What was REAL in it — filed instead as **A-26** (below), narrower and source-verified

## A-26 · The restart is marked only in chrome while the body glides continuously through it

**founder-proxy's B-4, 2026-08-06. P2, ride-along. Owner `peter_parker:field3d_surgeon`.**
**Re-measured independently by Desk A** (`src/scripts/_scratch_rbr_theta_probe.ts`) rather than
carried over from the report — and deliberately on a **100 ms grid (42 samples per revolution)**,
because the withdrawn A-23 was produced by 1 Hz sampling on a 4.19 s rotation (4.2 samples/rev,
86° per frame on a 2-fold-symmetric rod), which aliases a steady spin into stillness. Same subject,
sound instrument.

**Source basis first** (read, not inferred, so it is build-independent — unlike anything read off
the stale review bundle): `rbrThetaAt(tMs) = g.th + g.omega·g.rem` off `rbrGridWalk`, a continuous
integration (`:50821`); `rbrThetaReset` — which would seed `_th = theta0` — is called at **state
apply, never at a restart cut** (`:50829`); `rbrSignAt` flips on `rbrRestartCount` parity
(`:50600`) and `rbrEffTime(k) = rbrCutTime(k) + blankMs` (`:50581`).

**Measured on the real engine, STATE_6:**

| t (ms) | θ (rad) | Δθ per 100 ms | "restarting" badge | HUD |
|---|---|---|---|---|
| 3800 → 3900 | 5.688 → 5.832 | **+0.144** | — | ω = 1.50 |
| **4000 → 4400** | 6.000 → 6.576 | **+0.144 — unchanged** | **VISIBLE** | **`I = —  ω = —  L = —  KE = —`** |
| 4500 | 6.744 | +0.168 | — | ω = −1.50 |
| 4600 → 5400 | 6.648 → 5.448 | **−0.144** | — | ω = −1.50 |

**The blank window is t = 4000–4400 and the rod turns forward through all of it at the unchanged
old ω.** The sign flips at 4500 = cut(4000) + blank(500), exactly as `rbrEffTime` predicts.
(founder-proxy independently measured 6.600 / 6.750 / 6.636 at 4400/4500/4600; Desk A gets
6.576 / 6.744 / 6.648 — grid-quantisation difference, identical conclusion.)

θ is **continuous**; only its derivative step-reverses. So **during the 500 ms "restarting" blank the
rod keeps spinning forward at the old ω, then instantaneously reverses.** The apparatus never stops,
never re-poses, never blanks. The restart is asserted by a DOM chip, em-dashed digits and narration
— by text and by the *absence* of numbers — and contradicted by the only thing a student is
watching. A student sees a wheel reverse with nothing touching it: the uncaused-torque reading,
delivered as an infinite α instead of a smooth sweep.

**Fixable without touching the physics:** hold θ frozen (or fade the apparatus) across
`rbrCutTime(k)` → `rbrEffTime(k)`, so the discontinuity is unambiguously a new run. Nothing is
claimed to happen during the blank, so no torque is implied.
**Probe:** sample θ across `[cutTime, effTime]`; assert dθ/dt = 0 for the whole blank window.

**founder-proxy's teaching verdict on S6, for the record:** a teacher *would* succeed — but on the
strength of the grip hand re-curling, the ω sign flipping, and the arrow moving from above the drum
to below it, with the state looping A→B→A every 6500 ms so they can point back and forth. *"That is
a real classroom demonstration — it is what you do with a bicycle wheel. It is not 'the simulation
reset'."*

## ~~A-23 (original text, retained for the record)~~ · S6's flip is a RESTART, not a rotation

**Raised by `eye-walker` on the post-E7 walk (`20260806-021612`), 2026-08-06.**
`bug_class: sign_reversal_taught_as_a_step_not_a_visible_rotation` · **Owner: `alex:architect`**
(design-side; not an engine fix). **This blocks the seal, and it survived E7.**

E7 gave the L arrow real geometry, so S6's flip is no longer carried by a floating text label — that
part of A-11 is genuinely better. **But the flip still does not happen.** eye-walker sampled the
whole state:

```
t=0000 … t=3000   I = 3.06   ω =  1.50   L =  4.59   KE = 3.44    arrow straight UP,   bright cyan
t=4000            I = —      ω = —       L = —       KE = —       + "restarting" chip
t=5000 … frozen   I = 3.06   ω = −1.50   L = −4.59   KE = 3.44    arrow straight DOWN, olive→cream
```

**Not one of the 12 sampled frames shows the arrow at any angle other than exactly up or exactly
down.** No tilt, no rotation through the horizontal, no shrink through zero, no deceleration. The
state's atomic claim — "L is a vector, the arrow flips" — is delivered as *four seconds of nothing,
one glitch frame, six seconds of nothing-with-the-sign-changed*.

`STATE_6__dense_t04000.png` is the **only frame in all 111 entries** carrying the "restarting" chip,
and it is also the only frame where the HUD shows em-dash placeholders. The reversal is implemented
as a sim restart (the authored `repin_cue`), and the instrument blanks at the exact moment a teacher
is looking at the thing the state exists to teach.

This is a live recurrence of the OPEN scar `teach_visual_must_match_narration`.

**Prevention rule:** when a state's claim is that a vector flips, the flip must RENDER as a
continuous change — rotation through, or magnitude through zero — with ≥3 intermediate frames at 1 s
sampling. Two constant plateaus separated by a discontinuity does not teach a flip, whatever the end
frames show.

**Note the interaction with A-22 (same state):** A-22 was deferred *pending E7* on the reasoning that
S6's framing should be re-judged once the arrow was visible. It now is visible — and A-23 says the
framing is not the binding problem. **Fix A-23 first; A-22's camera choice depends on what the
corrected flip actually looks like.**

## A-22 · S6's frozen pin lands on a camera-degenerate rod phase — the held frame CONTRADICTS its own HUD

**Raised by `eye-walker` on the post-PR#29 walk (`20260805-163752`), 2026-08-05. NEW. Severity
MODERATE.** `bug_class: frozen_pin_lands_on_a_camera_degenerate_body_phase_that_contradicts_the_hud`

S6's camera `[0.22, 0.80, 5.85]` sits essentially **in the rod's plane of rotation** — a deliberate
side-on reframe, chosen so the L arrow's direction flip reads. Consequence: twice per revolution the
rod goes edge-on and both masses project onto the axle. **The frozen pin lands on exactly such a
phase.** `STATE_6__frozen.png` shows the two masses collapsed against the axle at (620,320) and
(650,300) with almost no rod visible — **while the HUD reads `I = 3.06 kg·m²`**, the value that means
the masses are out at r = 0.80. The number says "arms extended"; the picture says "arms at the
centre". The state's other dense frames (t = 1000/3000/8000/9000) show the rod broadside and read
correctly, so this bites **only at the held final picture** — which is also the H2 baseline and the
frame a teacher pauses on.

**Two candidate fixes, and a reason to take NEITHER yet:**
- *Concept-side* (`alex:json_author`, cheapest): offset the camera azimuth out of the rotation plane.
- *Engine-side* (`peter_parker:field3d_surgeon`): pin at a non-degenerate phase.

**Do not fix this before E7 lands.** S6's side-on camera exists to make the L arrow's flip legible —
and under **A-11/E7 that arrow is currently invisible**, so the framing is presently optimising for
something that does not render. Choosing the azimuth now would tune the camera against a picture
nobody can see, and would have to be redone once the arrow appears. **Sequence: E7 first, then
re-judge S6's framing against the visible arrow, then fix this.** Recorded now so it is not lost.

**Prevention rule (adopt regardless):** a state whose camera lies within a rotating body's plane of
motion must have its reveal-complete pin verified at a **non-degenerate phase** — the apparatus
geometry that the HUD's numbers describe must be visible in the frozen frame.

## A-20 · rbr's ⚙ teacher-widget labels fall back to internal ids — "Kebar", "Repin", "Spin dir slider"

**Raised by `quality-auditor` at the 2026-08-05 re-audit (its N-1). Rule 39g spot-check, which
applies because `rigid_body_rotation` is a NEW scenario.** Severity MEDIUM.

The ⚙ panel itself works — present, `avail` ✓, hover-ping ✓, Defaults/Save ✓, and auto-discovery
finds every rbr widget (Rule 39f delivers it for free). What fails is that three rows read as code
identifiers to a teacher:

| Shown | Should read | Why it falls back |
|---|---|---|
| **"Kebar"** | "Energy bar" | `pmWgPanelLabel` (`:69824`) has no keyword match for `rbr_kebar`, so `pmWgPanelWords` strips the `rbr` prefix and title-cases the stem |
| **"Repin"** | "Restart badge" | same fallback on `rbr_repin` |
| **"Spin dir slider"** | "Reverse spin" (a BUTTON) | `pmWgRowLabel` (`:69789`) looks for a `<label>` child; `rbr_spin_dir_row` holds a `<button>`, so it uses the id stem and appends `" slider"` |

This is precisely the case Rule 39f carves out: auto-derived labels are the default, and the
curated path is "worth taking only when the auto-derived labels read poorly". Here they read
poorly. The sanctioned fix is the escape hatch already in the engine — a `data-wg-label` attribute
on each of the three elements, which both labelers honour first (`:69825`).

("Annots" comes from the generic `f3d_annots` element and is fleet-wide pre-existing — **not**
attributable to this scenario, this concept or this desk. Do not fix it under this row.)
**Owner:** `peter_parker:field3d_surgeon`.

## A-21 · The review player's narration timeline runs 2.0–2.7× the authored `duration` — and `physics_block`'s sync tables describe a model the player does not implement

**Raised by `quality-auditor` at the 2026-08-05 re-audit (its N-2). Severity MEDIUM, ADVISORY —
explicitly NOT raised to blocking.** Owner `alex:physics_author`; the mechanism sits in
`build_review_site.ts`, a **Rule 40 platform file**, so any code change is an office matter.

`estSentenceMs` (`build_review_site.ts:1142`) estimates each sentence from CHARACTER COUNT at
150 WPM × 0.9; `computeTimeline` (`:1156`) sums those plus a 280 ms inter-sentence gap and
**ignores the authored `duration` entirely whenever sentences exist**. Measured on this concept:

| state | authored `duration` | player narration total | last authored motion event |
|---|---|---|---|
| S1 | 8 000 | 19 501 | 2 000 |
| S2 | 13 000 | 24 958 | 6 890 |
| S3 | 10 000 | 26 978 | 5 200 |
| S4 | 10 000 | 25 567 | 5 200 |
| S5 | 10 000 | 22 578 | 5 000 |
| S6 | 10 000 | 19 749 | 10 500 |
| S7 | 11 000 | 24 355 | 11 000 |

With subtitles on, `s3_2` ("Now the masses slide back out") plays at **8 765 ms** — 3.6 s after the
slide finished; `s7_4` plays at **18 214 ms**, 12.2 s after its slide ended and while the scene has
been frozen for twelve seconds.

**⚠ This corrects a claim Desk A made in writing.** The A-18 authoring note recorded that S7's
`formula_lines` at_ms values "match physics_block §3's narration sync **exactly** — sentence 1 →
0–2000, sentence 2 → 2000–4000". Against the real player that sync **does not exist**: `s7_1`
occupies `[0, 7111)` and `s7_2` starts at **7391 ms**, so the `= dL/dt` line at 2000 ms lands 5.4 s
before the sentence it was supposedly synced to. The values were chosen against a timing model
`physics_block.md:258` describes and the player does not implement.

**The authored values still stand, on a different justification.** The second line lands *inside*
`s7_1`, which itself recites the whole relation, and motion outrunning narration is the permitted
direction under Rule 31 (never the reverse). So the beat is defensible — but as "motion leads
narration", NOT as "synced to sentence 2". Any future desk copying this pattern should know which
claim is true.

**Scope:** systemic and pre-existing, across all 7 guided states and certainly beyond this concept.
Every `readout_at_ms`, `param_ramp` and `formula_lines.at_ms` value in this concept was chosen
against the physics_block model. **Founder decision needed:** re-time the narration to the player,
or accept the hold. Not a Desk E item; not fixable on a chapter branch.

## A-19 · THE EYE's D7 passes a wholly static scene BY CONSTRUCTION — OFFICE/platform item, not Desk E

**Raised by Desk B (2026-08-05), verified in source on this desk. Recorded here so Desk A's own
EYE-trust posture is written down — NOT re-filed as new. Desk B owns the finding.**

**Surface:** `src/lib/validators/visual/pixelGate.ts` — a **Rule 40 platform file**. Lands on
master by the office, never on a chapter branch, and never by Desk E.

`:318–320`:

```ts
const tailFrozen = tail.length >= tailPairs && tail.every(d => d < DENSE_MOTION_EPSILON);
const earlierMoved = earlier.some(d => d >= DENSE_MOTION_EPSILON);
const stuck = tailFrozen && earlierMoved;
```

D7 is "no stuck tail **after earlier motion**". A scene that never moved at all has
`earlierMoved === false`, so `stuck` is false and D7 reports **`OK — no frozen tail`**. The gate
that exists to catch a dead render loop cannot fire on the deadest possible case. Desk B reports
35/35 on a scene that never moved.

**The other lens, and why this concept is not in that hole.** D5 (`:281`) does catch it — but only
when `expectsMotion === true`; otherwise it reports `Skipped — motion expectation unknown`
(`:304`). For `rigid_body_rotation`, `deriveStateMeta:509–515` declares `expectsMotion = true`
whenever `|omega0_rad_s| ≥ 0.05`, and **all 8 states of this concept qualify** (ω₀ = 1.50 on seven,
6.95 on S3) — so a wholly static capture WOULD fail D5 here. Verified state by state, not assumed.

**What this does NOT rescue.** D5 proves the turntable *spun*. It says nothing about whether any
*authored beat* played — a formula assembly, a reveal, a glow onset. A concept can spin merrily
while every scripted beat is dead, and THE EYE will report 35/35. That is exactly how A-18 (S3/S7's
dead assemblies) survived a clean 35/35 through an entire authoring cycle, and it is why the A-18
verification used two channels that fail differently (a DOM-text probe + eye-walker's pixels)
rather than a re-run of the gate.

**Standing consequence for this desk:** a THE EYE PASS is a smoke test, never evidence that a
specific authored beat happened. Any beat whose claim is "X changes at t = N" needs either a
frame-to-frame read or a direct probe of the thing that changes.
**Owner:** office, on master, per Rule 40.

## A-4 · `chapter` / `section` numbering for the rotmech set is unpinned

**Surface:** concept JSON metadata, not the engine.
**Raised by:** `alex:json_author`, 2026-08-04. **Severity:** cross-desk consistency.

Neither the skeleton nor the physics block states an internal chapter number. json_author scanned
the fleet (internal chapters 1–8 already occupied) and authored `chapter: 9`, `section: "9.9"`
(approximating NCERT §7.9). **All eight Ch.7 concepts across five desks must agree**, so this
needs one office ruling rather than five independent guesses.

---

## A-18 · ✅ **RESOLVED 2026-08-05 by Desk E's D1 (`7022169`) + concept-side authoring** — `rbr.formula` had no timed reveal

> **Resolution summary.** Desk E landed `formula_lines` on the rbr scenario — the `nlb` per-line
> shape, ported under the same field name rather than minting `formula_at_ms` (that name already
> means "whole overlay at one instant" on `pef`). **D1 alone changed nothing for this concept:**
> absent `formula_lines` is byte-identical to the legacy string by design, so the two dead beats
> stayed dead until the JSON was re-authored to use it. S3 and S7 now author `formula_lines`;
> both assemblies verified playing on two independent channels (details in `_progress/a.md`,
> 2026-08-05). **No longer blocks Checkpoint B.** E-1 (A-11) and E-2 (A-12) still do.
> Original finding preserved below.

## A-18 (original) · `rbr.formula` has no timed reveal — S3 and S7's authored assemblies play as a single flash at t = 0

**Filed 2026-08-05 as the Desk-A-side record of a CROSS-DESK dependency.** Raised by **Desk D's
architect**, `findings_d.md` **§6c**; the state doc and §6c both name it "A-11", which was already
taken — see the ID-collision note above. Desk D ranks the ask (`formula_at_ms`) **#7, HIGH,
cross-desk** on its 0c-3 priority list, and it is the one item on that list that is not about
Desk D. **Blocks Checkpoint B on `conservation_of_angular_momentum`.**

**Surface:** `rigid_body_rotation` — `rb.formula`, the single Rule-34b Cambria-Math surface.

**What the contract does (re-verified in source on this desk, not taken on report):**

```js
// applyRigidBodyRotationState, field_3d_renderer.ts:50570-50573
var ff = document.getElementById("rbr_formula");
if (ff) {
    ff.textContent = (typeof rb.formula === "string") ? rb.formula : "";
    ff.style.display = (typeof rb.formula === "string" && rb.formula.length) ? "block" : "none";
}
```

Typed `formula?: string` at `:1050`. `#rbr_formula` is created once at `:50447` and — confirmed by
grep — has **exactly three references in the whole renderer** (`:50146` comment, `:50447` create,
`:50570` this write). `updateRigidBodyRotationFrame` never touches it. So the string is written
once, complete, at state entry. **There is no `at_ms`, no term list, no per-line schedule, and no
per-frame update path.** Compare `cap_formula`, which at least re-writes per frame (`:7264`) —
rbr does not even do that.

**What this concept authored against it:**

| State | JSON declares | physics_block §3 times |
|---|---|---|
| S3 | `formula: "I₁ω₁ = I₂ω₂"` (`:829`) | `0–3200 ms: formula_surface assembles I₁ω₁ = I₂ω₂` |
| S7 | `formula: "τₑₓₜ = dL/dt"` (`:983`), **`motion_archetype: "equation-build"`** (`:643`) | `0–4000 ms: formula_surface assembles term-by-term: τ_ext = dL/dt` |

S7 is the sharper case twice over. Its narration-sync table splits the surface across **two**
windows — `1 → 0–2000 → formula_surface (τ_ext term)` and `2 → 2000–4000 → formula_surface
(= dL/dt term)` — so sentence 2 glows a term that has been on screen since t = 0 alongside
sentence 1's. And `equation-build` is S7's **declared Rule-31 archetype**: the assembly is not
decoration on that state, it is the entire reason S7 counts as a distinct state rather than a
restatement of S5. With the assembly dead, S7's archetype claim is unearned.

**The failure is silent, in this engine's now-familiar shape** (cf. A-1 HUD glow, A-7 pull-arrow
reveal, A-8 `min_ring`, and the `RBR_RO_META` unknown-token skip the desk was warned about): the
authored string renders correctly, the state looks right, THE EYE sees a formula on screen, `tsc`
and `validate:concepts` pass, and **nothing anywhere reports that a beat specified as an assembly
played as a flash**. Desk A's own ten findings did not catch it; it took Desk D's architect
reading the contract from the other side.

**The ask: `formula_at_ms`** — a timed reveal on the one existing formula surface. **Rule 40a —
do not build this from scratch; two implementations already exist in this same file:**

- `pef.formula_at_ms` (`:9149`, `:9200`) — a whole-surface reveal instant via `userData._revealAt`,
  defaulting to 0 when absent. This is the minimum viable port and matches S3's need exactly.
- `nlb.formula_lines?: Array<{ text: string; at_ms?: number }>` (typed `:1644`, implemented
  `:45148–45158`, `:45442`, `:46308`) — **per-line staged reveal on the ONE surface**, with the
  typedef's own comment noting it stays Rule-34b-compliant because it is still a single surface.
  This is the shape S7's term-by-term assembly needs.

Porting `formula_lines`-style staging to rbr covers both states; `formula_at_ms` alone covers S3
but leaves S7's declared archetype only half-served. Desk E's call, but the precedent is the
argument for the richer one.

**Backwards compatibility:** every existing rbr state authors a bare `formula` string and must keep
rendering at t = 0 with no edit — absent timing ⇒ present from t = 0, exactly as `readout_at_ms`
(`:1046–1048`) and `pef.formula_at_ms` already behave in this file.

**Probe:** capture S7 at t = 500 and t = 3500 under `SET_TIME_FREEZE`; assert `#rbr_formula`'s
rendered text differs between the two. Today it is byte-identical.

**Owner:** `peter_parker:field3d_surgeon` (Desk E, `feat/rotmech-0c3`).
**Blocks:** Desk A Checkpoint B on `conservation_of_angular_momentum` (S3 + S7).

---

## A-28 (revised) · `W` and ΔKE disagree by ONE display quantum at the full stop

**Raised by `alex:architect` as CRITICAL/blocking during the `rotational_work_energy` 0b design pass
(2026-08-07). RE-MEASURED BY DESK A ON THE REAL ENGINE AND DOWNGRADED to MODERATE, narrow.**
Owner `peter_parker:field3d_surgeon`. Probe: `src/scripts/_scratch_rbr_a28_probe.ts`.

**The original claim:** `rbrGridWalk` composes W as a left-Riemann sum
(`eng._w += rbrTauOf(Lk, tk) * wk * h`, `:50793-50819`), so the printed ledger `KE₀ + W = KE` closes
for **at most 40 ms anywhere** and S4's PRIMARY aha cannot ship quantitative. The architect derived
this from a faithful **re-implementation** of the walk and flagged every figure
`ASSUMPTION — probe-before-authoring`.

**Measured on the renderer, reading the rendered dp-2 strings, τ ∈ {0.40, 0.50, 0.75, 1.00}:**

| Test | Result |
|---|---|
| rendered `ΔKE` vs `ΔW` over consecutive 1 s intervals | **residual ≤ 0.010 J at every sample, 0.000 at many** |
| `‖W‖ − ‖τ·θ‖` across the whole decay | **≤ 0.008, mostly 0.000** — W and θ ride the same walk, so the bias cancels |
| `W` vs ΔKE **at the full stop** | **`W = −3.45 J` against `ΔKE = 3.44 J` — one quantum** (τ = 0.75 @ 6000 ms; τ = 1.00 @ 5000 ms) |

**So the pervasive form does not reproduce; the specific form does.** A residual of one quantum
between two independently-rounded dp-2 values is arithmetic, not bias — but the standstill frame,
where a teacher would say "every joule accounted for", is genuinely off by 0.01.

> ### ⚠ "NARROW" WAS WRONG — corrected by founder-proxy at Checkpoint A, 2026-08-07
> The severity downgrade holds; **the scope claim does not.** Two corrections, both measured:
>
> **1. Desk A never measured the concept's OWN authored torque.** The full-stop case was sampled at
> τ = 0.75 and 1.00 (the only two that reached rest inside the 8 s window). founder-proxy measured
> **τ = 0.40, the authored guided value**: at t = 11480 ms the HUD prints `W = −3.45 J`,
> `θ = 8.62 rad` (raw −3.44730 / 8.61825). Excess = 0.00480 J = `0.40 × 0.0120`, to four decimals.
> **The gap is present at the authored torque too.**
>
> **2. It is not narrow — it is nearly the whole slider.** `KE₀ = 3.4425 J` sits only **0.0025 J**
> below the dp-2 rounding boundary, so the full-stop mismatch appears for **every τ above
> ≈ 0.21 N·m — 36 of the 40 reachable non-zero slider settings.** "Narrow" described the *frame*
> (only the stop), and I wrongly let it describe the *range* as well.
>
> **3. A better result than either of us had, from source.** `_th` and `_w` are accumulated from the
> **same `wk`** in the same loop:
> ```js
> eng._th += wk * h;
> eng._w  += rbrTauOf(Lk, tk) * wk * h;
> ```
> so for constant τ, **`W ≡ τθ` identically, by construction** — S3's whole teaching identity
> *cannot* drift, and Desk A's measured 0.008 residual on it was pure display rounding. `rbrLAt` is
> an exact closed form and `KE = L²/(2I)` is exact, so **the entire error is one shared θ bias:
> ½·h·Δω = 0.012 rad at the full stop**, which predicts both the 8.62-vs-8.61 stopping angle and
> `excess |W| = τ × 0.0120`. One bias, two symptoms, one fix.
>
> **Why the stop specifically:** everywhere else a teacher subtracting two dp-2 numbers has a
> rounding alibi. At the stop the alibi is gone — the meter fell from a printed **3.44** to a
> printed **0.00**, and W prints **3.45**. Nothing to attribute it to.
>
> **Elevated to a Checkpoint C sealing condition** (founder-proxy, engine queue **E-B**): the fix is
> midpoint composition in `rbrGridWalk`'s accumulation loop (`:50801-50806`), which is **exact** for
> the piecewise-linear ω that `rbrLAt` produces. Blast radius today is θ, W and ≤0.7° of rod phase;
> `I`, `ω`, `L`, `KE`, `α`, `τ` never go through the walk, and **no rbr concept is baseline-locked
> yet** (A-19). Free this week, expensive after eight concepts seal. **The contract forbids the
> content workaround** — `ω₀ = 1.50` and hence `KE₀ = 3.4425` are pinned by `APPARATUS_CONTRACT.md`
> §1, which a desk may not change unilaterally.

**Design consequence (folded into the skeleton):** S4 **may** ship quantitative; it must simply not
pin its claim on the full-stop frame. The `W = τθ` identity S3 is built on is unaffected and
comfortably authorable.

**Still worth the one-line fix, for two reasons beyond this concept:** compose W on the midpoint of
each step (`(ω_k + ω_{k+1})/2`) rather than its left edge. θ must stay on its current composition
(E5 bought byte-identity for `conservation_of_angular_momentum`), but **W has no back-compat
consumer** — `rotational_work_energy` would be its first. The same forward-Euler bias also puts the
rendered stopping angle at **8.62 rad** against the board answer **8.61**, so a teacher working the
standard exam question and then reading the meter finds them one hundredth apart.
**Raising the display to dp 3 does NOT fix it** — the bias is several quanta at dp 3.

**Probe for the surgeon:** author a constant brake at constant I; assert rendered `ΔKE` = rendered
`ΔW` within one quantum over every interval **and** that `|W|` at the rest clamp equals the total
`ΔKE` exactly at dp 2.

> **⚠ Method note, recorded because it cost a measurement and is the fifth of its class this run.**
> Desk A's FIRST probe of this claim baselined `KE₀` at t = 200 ms and compared it against `W`
> accumulated from t = 0. By 200 ms the brake has already done work, so the "residual" came out
> *exactly* equal to |W(200)| — 0.13 / 0.16 / 0.23 / 0.31 J at the four torques — and read as a
> spectacular confirmation of a CRITICAL. It was entirely the probe's own offset. **The differential
> form (does the work done over an interval equal the energy change over that same interval?) needs
> no baseline and is the sound instrument.** Same class as the int16 overflow, the two colour masks,
> and eye-walker's 1 Hz sampling of a 4.19 s rotation: *the instrument was wrong for the question.*

## A-29 · A `sources[]`-authored brake brakes with its pad mesh INVISIBLE

**Raised by `alex:architect`, 2026-08-07. MAJOR.** Owner `peter_parker:field3d_surgeon`.

`rbrApplyVisibility` (`:51826`) computes pad visibility from **only the scalar field**:

```js
var padOn = (et2.source || "brake") === "brake" && Math.abs(rbrNum(et2.tau_brake_Nm, 0)) > 0;
```

But when `external_torque.sources[]` is present the resolver takes the list branch, never reads
`tau_brake_Nm`, and sets `eng.padEngageMs` from the first `kind: 'brake'` entry (`:51689`). So a
`sources[]`-authored brake gets a **fully working pad-travel path attached to a hidden mesh** — real
physics, real torque, **no rendered agent, no warning**. This is the chapter's signature defect
shape (something authored, accepted by every gate, silently doing nothing) on a new surface, and a
Rule-24 violation: a stated agent with no rendered object.

**Interim authoring contract, adopted by the `rotational_work_energy` skeleton so it is never
mistaken for an accident:** any state needing a `sources[]` brake authors **both** — the scalar
`tau_brake_Nm` for visibility *and* the list for physics — with the invariant that the scalar equals
the first brake entry's magnitude.

## A-30 · `reference_marks` chip labels have no width clamp — the same class as A-17

**Raised by `alex:architect`, 2026-08-07. MEDIUM.** Owner `peter_parker:field3d_surgeon`.

`rbrRebuildReadout` (`:51210`) emits the chip inline into the readout `<div>` with no clamp against
the panel box. **A-17 already establishes that this engine's mark labels can leave their panel** —
the KE-bar tick caption clips off-canvas at x = 0, a recurrence of the FIXED row
`graph_marker_label_clipped` whose prevention rule reads *"clamp draw-x into [padL, W−padR]"*. **The
chip path was never covered by that rule.**

**This is the doctrine case for auditing by defect CLASS rather than by the field a finding names:**
the tick path and the chip path are one class, and fixing only the path A-17 names leaves the other
live. Desk A reached the same conclusion independently from the narration audit, where a number
fixed only in `text_en` would have survived in `misconception_watch[].visual_counter`.

## A-31 · rbr has no angle marker — the concept whose taught variable is θ cannot show it on the apparatus

**Raised by `alex:architect`, 2026-08-07. MINOR / design ask.** Owner `peter_parker:field3d_surgeon`.

There is no θ arc and no angle marker anywhere in the rbr region; `show_theta_arc` exists on three
*other* scenarios (`:860`, `:900`, `:1922`) and on none of these. θ is HUD-only. The
`rotational_work_energy` design presses `show_r_line` into service as the angle pointer — genuinely
necessary, because **the rod has 2-fold symmetry and without a one-sided marker a student cannot
count turns or see a half revolution** — but its sprite reads `r`, a radius label doing an angle
job. A `show_angle_marker` / θ-arc would let a θ-teaching concept show its own quantity on the
apparatus. Not blocking.

---

## A-32 · **CRITICAL, BLOCKING S6** · A live `tau_brake` drag re-zeroes W while θ keeps counting

**Measured on the real engine by `founder-proxy` at Checkpoint A, 2026-08-07** (its engine-queue
**E-A**) — not deduced. Owner `peter_parker:field3d_surgeon`.
`bug_class: rbr_live_torque_change_rezeroes_the_work_integral_while_theta_continues`

Sandbox, free-running, one `input` event on `rbr_tau_brake_slider`, 0.40 → 0.75 N·m:

```
before drag        KE = 1.47 J | W = −1.97 J | θ = 4.93 rad | τ = −0.40 N·m
immediately after  KE = 1.43 J | W = −0.04 J | θ = 4.99 rad | τ = −0.75 N·m
+4 s after drag    KE = 0.00 J | W = −1.47 J | θ = 6.90 rad | τ = −0.75 N·m
```

**The work counter is wiped. θ is not. KE is not.** After the drag **both taught rules are false on
screen** — not by a quantum, by a factor:

- S3's rule `W = τθ`: |W| = 1.47 against |τθ| = 0.75 × 6.90 = **5.17**
- S4's rule `W = ΔKE`: the wheel has lost 3.44 J; W reads **1.47**
- and at the drag instant the teacher watches work *un-done*, with nothing physical happening

**Root cause, in source.** `rbrApplyParam('tau_brake')` sets `eng.evAnchorT = eng.t_ms` (`:51031`)
so L stays continuous — its own comment says *"the decay already applied is KEPT"*. But
`rbrGridWalk` zeroes `_w` on **any** anchor change (`:50804`), conflating two different kinds:

| Anchor kind | Source | Zeroing W is… |
|---|---|---|
| **restart** | `rbrEffTime(k)` — `restart` / `omega0` / `m` | **correct** (L is re-seeded) |
| **event** | `evAnchorT` — a live torque change | **wrong** (L and θ are deliberately continuous) |

**Fix:** have `rbrAnchor` (`:50611`) report which kind it returned; reset `_w` only on the restart
kind. **Same function region as A-28's midpoint fix — sequence them as ONE dispatch.**
**Probe:** free-run with `theta` + `W`; dispatch an `input` on the slider at t = 4000; assert `|W|`
never decreases across the event and afterwards equals `Σ τᵢ Δθᵢ` within one quantum.

**Why it blocks, and why there is no content workaround:** dropping `W` from S6 leaves a
work-energy concept whose explore state cannot show work; dropping `tau_brake` violates Rule 31
(the explore state must expose the taught variable) and leaves only `omega0`, which restarts
anyway. Both are strictly worse than the fix. **Guided states S1–S5 author no controls, so the
guided arc is unaffected — this blocks S6 only.**

## A-33 · The KE bar has no timed reveal, so it prints its value before the sentence that defines KE

**founder-proxy's E-C, 2026-08-07. MODERATE.** Owner `peter_parker:field3d_surgeon`.
`bug_class: rbr_ke_bar_has_no_timed_reveal_so_it_prints_its_value_before_the_defining_sentence`

`readout_at_ms` gates **only** the `rbr_ro_<token>` row elements (`:51341`). `rbrRebuildKeBar` sets
`rbr_kebar` to `display:block` at state apply (`:51253`), and the frame loop writes
`rbr_kebar_fill.width` and `rbr_kebar_val` **unconditionally** whenever `ke_bar.max_j > 0`
(`:51349-51354`). So a design that stages I → ω → KE still shows the bar, carrying KE numerically,
from frame 0 — **breaking the Rule 25 term-introduction ledger in the very state that authors it.**

This is why the `rotational_work_energy` skeleton's S1 claim "the bar fills to 3.44 J" is
unbuildable as written (its D-2): S1 authors no torque, so KE is constant and the bar is **static at
90.5% from entry**. Another instance of the chapter's signature class — an authored field the engine
silently ignores.
**Ask:** gate `rbr_kebar` on `readout_at_ms.KE` (or add `ke_bar.reveal_at_ms`), defaulting to 0 so
every existing state stays byte-identical.

## A-34 · The brake pad stays in contact at τ = 0 — a rendered agent asserting a cause that is not acting

**founder-proxy's E-D, 2026-08-07. MINOR, note only.** Owner `peter_parker:field3d_surgeon`.

The inverse of **A-2**. `rbrApplyVisibility` computes pad visibility at **state entry only**, and the
travel block parks the pad at `contactZ` for all `tMs ≥ engage_at_ms` (`:51947`). So in a sandbox a
teacher who drags τ to 0 sees the pad **touching the drum while the wheel does not slow** — Rule 24
/ §10(d), a stated agent with no acting cause. Same family as A-2 and E8; fold into whichever
lands first.
