# Checkpoint A — `work_energy_theorem` (concept #4) — cycle 0

**VERDICT: `DESIGN_FIX`** · owner `alex:architect` (every finding) · cycle 0 of 2 spent.

Strong skeleton — dense arithmetic, real scar work, and S3 is the best-designed state in the chapter
so far. Not shippable as written: three load-bearing numeric claims are wrong in ways that would fire
the concept's own zero-warning assertion, and the reflow claim is false everywhere except one browser
window size. All fixable at design time. No physics doubt, so not an ESCALATE.

---

## F1 · P1 · all states · reflow uniformity is ASSERTED, not constructed

Measured by reproducing the panel DOM from `field_3d_renderer.ts` L44924-45032 and running the real
fit ladder (L45119-45141) in headless Chromium:

| panel content | bottom @ step 0 | bottom @ step 1 | caption lines |
|---|---|---|---|
| K group + one bar captioned `net` (S1/S2/S4/S5) | **545.6 px** | 439.3 px | 1 |
| K group + `by the pull` / `by friction` / `net` (S3/S6) | **560.5 px** | 453.1 px | **2** |
| K group + `pull` / `friction` / `net` (PROPOSED) | **545.6 px** | 439.3 px | 1 |

Limit is `window.innerHeight − 12` **of the iframe** (L45123). The iframe is responsive
(551 / 599 / 731 / 911 px) and **THE EYE captures at 1280×720**:

- **≥573 px iframe (incl. THE EYE's 720):** both classes at step 0, `trk 186`
- **≤557 px (incl. 1052×551):** both at step 1, `trk 138`
- **≈558–572 px:** S1/S2/S4/S5 at 186 while S3/S6 at 138 — the scar, live, in a band **no baseline
  can ever photograph**

"By construction" is wrong reasoning: the same panel *class* does not fix panel *height* — height is
set by the tallest work caption's **line count**.

**FIX: single-word captions in every state — `pull` · `friction` · `net`.** All six states then bottom
at 545.6 px / 439.3 px — identical geometry at every viewport height, so whichever rung the teacher's
window selects, all six states select it together. This ALSO closes F8.

Replace the `**PANEL LAYOUT AND THE 551 px ARITHMETIC…**` block in §3 with the corrected version
stating the iframe RANGE (not one size), THE EYE capture height separately, and these binding
consequences: (a) no narration/caption/title/aha may compare bar HEIGHT across states, and within a
state the work bars and K bar are DIFFERENT instruments — **W_net = ΔK is always read from the
NUMERALS**; (b) probe for physics-author: *at iframe heights 551, 720 and 911, assert every state's
`.nlb_en_trk` computed height is IDENTICAL across all six states; never assert a particular value.*

Also patch: §10(b) bar-caption row, §3 caption list, §371 json-author line, Rule 41 audit "Bar
captions" line, and **delete RISK-A's `expected 138 px` clause** (it cannot pass under THE EYE).

---

## F2 · P1 · S4 · loop-end numbers derived at a different `t` than the travel table; `work_scale_J` overflows

S4: m = 4, v₀ = −3, F = +12, a = +3, s₀ = +1.6, R = 2600.

- Travel table correct: `s(2.6) = 1.6 − 7.8 + 10.14 = +3.94 m` ✓
- But `v(2.6) = −3 + 3(2.6) = **+4.8 m/s**`, not the tabled **+3.8** (which is t ≈ 2.267 s)
- So `K(2.6) = ½·4·4.8² = **46.08 J**` (skeleton: 28.9) and `W_net(2.6) = 12 × (3.94 − 1.6) = **+28.08 J**`
  (skeleton: +10.9). ΔK = 46.08 − 18.0 = 28.08 ✓ consistent at the corrected value.
- **Peak |W| = 28.08 J vs authored `work_scale_J: 25` → frac 1.12 > 1 → bar clamps and
  `[PM_NLB_ENERGY_SCALE]` fires (L46386-98)** in a guided state §10(f-2) claims cannot reach the warn.
  THE EYE's console audit asserts zero occurrences.
- K survives: 46.08 J on `bar_max_J: 55` = 83.8%. Pin values unaffected and correct.

Patches: §3 S4 row → `+28.1 J` by t = 2.6 s · §10(d) S4 row → `s(2.6) = +3.94, v = +4.8` ·
§10(d) key numbers → `K: 18.0 → 0 → 46.1 J; W_net: 0 → −18.0 → +28.1 J` ·
§3 Scales + §10(f-2) → `work_scale_J` per state `55 · 55 · 110 · **40** · 55 · 400`;
S4 peak deflections `−45.0% → +70.2%`.

---

## F3 · P1 · S6 · explore envelope computed on the seed lap (11.4 m), not the wrap span (12.0 m)

`nlbBoundsM` (L47150-67) returns `{lo: −length_m, hi: +length_m}` → with `length_m: 6` the span is
**12.0 m**. The wrap (L48204-05) sets `s1 −= span`, re-seeds `v = b.v0`, re-zeroes ledgers. So 11.4 m
is only the FIRST lap; every later lap is the full 12.0 m.

- K is monotonically DECREASING in m (`½v₀² − μgd = 8 − 35.28 < 0`), so the worst corner is the
  LIGHTEST mass: m = 2, F = 30, v₀ = 4 → `K = 16 + 289.44 = **305.44 J > bar_max_J 300`** → clamp +
  `[PM_NLB_ENERGY_SCALE]`. (Even the skeleton's own 11.4 m figure left only 3% margin.)
- `W_pull = 30 × 12 = **360.0 J** = work_scale_J 360 exactly` — full deflection, and per-step
  accumulation overshoots the wrap point, so the warn fires on the wrong side of the epsilon.
- W_friction ≤ 211.7 ✓ · W_net ≤ 289.4 ✓

Patch §10(f-3): span is the FULL track `hi − lo = 2 × length_m = 12.0 m`; max K = **305.4 J →
`bar_max_J: 340`** (10% headroom); max |W| pull = **360.0 J → `work_scale_J: 400`**. Default-run
legibility (F=20, m=4, v₀=0): K 98.9 J (29%), pull 240 J (60%), friction −141.1 J (35%), net 98.9 J (25%).
Also patch §371 json-author line, §10(f-1) S6 mention, §3 Scales paragraph.

---

## F4 · P1 · S6 · the CRITICAL reversal row's probe clause selects S6, which is undispositioned

**S4's argument is SOUND** — adjudicated. The row's DO clause offers two branches and S4 takes the
second verbatim (`controls_visible: []`, `loop_reset_ms = 2600`, state ends and re-plays identically);
and S4's claim is not "the sign of a constant force's work" but "the ledger tracks K − K₀ through the
turn", so the unwind is the taught beat, not the erasure the row describes. **Not the scar's failure mode.**

But §0 says *"every guided state here authors `controls_visible: []`"* — quietly excluding **S6, the
one state the probe clause actually selects** (work accumulators + `F`, `m`, `v0`). And the envelope
was run only on the co-directional corner. The opposing corner (`F > 0` with `v0 < 0`) is unexamined;
at F = 30 / m = 2 / v₀ = −4 the turn-around distance is 16/35.88 = 0.45 m ≪ 12 m span, producing
repeated boundary wraps and a ledger re-zeroing several times a second.

Patches: §0 — append the S6 disposition (S6 makes NO sign claim, the wrap re-zeroes every ledger by
contract, and the probe's assertion is inapplicable to a wrapping sandbox by design — state it for
quality-auditor rather than leaving it to inference). §10(f-3) slider block —
**`v0 {min 0, max 4, step 1, default 0}`**, which removes the reversal corner entirely and costs the
sandbox nothing (no state teaches a backward launch; S4 owns the reversal). If −4 is kept, the
opposing corner must be computed and its wrap behaviour declared, per the row's symmetric-pair clause.

---

## F5 · P2 · S4 · the 16a `visual_counter` duplicates S2's end pose

§4 aims S4's confrontation at the turn: *"K reads 0.0 J and net reads −18.0 J — not zero."* **S2
already renders exactly that** (K = 0.0 with net = −40.0, held for the last half of its loop). The
refutation only S4 can make needs BOTH numerals nonzero and different — which exists at the loop end
once F2 is corrected.

Patch §4 S4 `visual_counter`: at the end of the run K reads 46.1 J while net reads +28.1 J — two
different nonzero numbers on one screen; the change is 46.1 − 18.0 = 28.1, measured from the starting
18.0 J, and the net bar reads the CHANGE, never the total. (Keep the turn instant as the sign beat;
the confrontation lands at the end pose, because S2 already shows K = 0 with a nonzero net bar.)

---

## F6 · P2 · RISK-D is resolvable at source — discharge it, don't carry it

`field_3d_renderer.ts` L48194-48205 (SEAM J sandbox branch):

```js
if (s1 > bd.hi) { s1 -= span; v1 = (b.v0 != null) ? b.v0 : 0; nlbEnergyOnWrap(eng); b._dsp0 = s1; nlbRollWrapSeed(eng, b); }
else if (s1 < bd.lo) { s1 += span; v1 = (b.v0 != null) ? b.v0 : 0; nlbEnergyOnWrap(eng); b._dsp0 = s1; nlbRollWrapSeed(eng, b); }
```

All three claims land in one statement: `v` re-seeds to authored `v0`, `nlbEnergyOnWrap` re-zeroes the
ledgers, `b._dsp0 = s1` re-anchors `d`. Downgrading was defensible, but the whole S6 envelope was hung
on it and it was two lines away. Replace RISK-D's "confirm at source (or by drive)" clause with the
citation; keep only the 30 s zero-warn drive as verification, not a gate. Delete "**The whole (f-3)
block depends on RISK-D**".

---

## F7 · P2 · S2 · archetype misdeclared — and that is what makes S1/S2 look like a sign flip

S2's authored beat (launched onto a rough floor, decelerating to a standstill under an opposing force
while a signed bar counts down, rest pose = the closing claim) is **exactly `decay-to-rest`**, which
concept #2 coined and **registered for Ch.6** (`positive_negative_zero_work/skeleton.md` L57), and
which the registry permits when the slow-down IS the taught content — as it is here. Declaring it
`translate-through` forces a contrast pair the pictures do not need.

Patch §3 S2 archetype: `decay-to-rest` (Ch.6-registered by #2; the slow-down to a standstill IS this
state's taught content — the rest pose with K exactly 0.0 and the ledger held at −40.0 is the claim).
Patch §3 archetype audit: `translate-through` ×1 (S1) · `decay-to-rest` ×1 (S2) · `null-result-hold`
(S3) · `cycle-compare` (S4) · `flow-along-path` (S5) · `drag-sandbox` (S6). **No archetype repeat at
all — the declared contrast pair is no longer needed.**

---

## F8 · P2 · THE CALCULATOR statement is stale, and a residual survives that F1 also closes

Channel B **has landed** in this desk (`readoutHarvest.ts` L180-202) — it composes
`<div class="nlb_en_sym">K</div>` + `<div class="nlb_en_val">40.0 J</div>` into `"K 40.0 J"` for
`CHIP_RE`, so the K bar harvests in all six states. **But the gate requires the symbol node to be
bare: `!/\s/.test(direct)` (L192).** The work bars reuse `nlb_en_sym`/`nlb_en_val` (L45025-26), so:

- `net` → no whitespace → harvested ✓ (values use ASCII `-` from `toFixed` → passes `/^[+-]?[0-9]/` ✓)
- `by the pull`, `by friction` → whitespace → **skipped** — precisely the two numerals carrying S3's
  ±98.0 J claim, the misconception state.

Adopting F1's single-word captions makes all three harvestable. Patch §0 row 41 + Handoff dependency 1
accordingly, and hand physics-author: author `computed_outputs` keys so the harvested
`pull` / `friction` / `net` / `K` readings have ground truth. **A SKIP is still not a pass.**

---

## P3 (fix if cheap, no cycle owed)

- **S5's stamp string is not what the engine renders.** `nlbCpStampText` L46217-23 emits
  `"W " + wk[w].label + " = " + value` for EVERY accumulator. With `label: "net"` the real string is
  `flag:  W net = 10.0 J  ·  K = 20.0 J` (36 chars), not the asserted `flag:  W = 10.0 J  ·  K = 20.0 J`.
  Correct §0, §3, §10(b), RISK-E, and re-check the 34-char one-line precedent (36 > 34).
- **S4's title truncates badly.** "The change is measured from the starting energy" → "The change is
  meas…". Rule 41d: `Change measured from the starting energy`.
- **Add `drain`/`drains` to the §10 banned-register list** — a bar does not drain (Rule 41a).
- **S2 is at rest ~51% of its loop** (1033 → 2100 ms). Declared, precedented on #3's S5, rest pose is
  the claim — accepted, but the weakest half and the thing a founder would poke at.

---

## Per-state design-gate table

| # | idea distinct? | archetype honest? | ring | controls | arithmetic | verdict |
|---|---|---|---|---|---|---|
| S1 | yes — the theorem itself, two instruments one number | `translate-through` ✓ | core | none ✓ | a = 2, d = 4.0, K = W = 40.0 ✓ | OK |
| S2 | **thin** — sign flip, carried by friction + the exact-zero landing | **misdeclared (F7)** | core | none ✓ | a = −3.92, rest at 2.041 m, W = −40.0 ✓ | FIX F7 |
| S3 | yes — work-by-a-force ≠ net work; best state in the concept | `null-result-hold` ✓ and genuinely moving | core | none ✓ | F = μmg = 19.6 exactly, K flat 15.6 ✓ | OK (F1 caption) |
| S4 | yes — ΔK from a nonzero start through a reversal | `cycle-compare` ✓ | extended | none ✓ | **WRONG (F2)** | FIX F2/F5 |
| S5 | yes — derivation + stamped check | `flow-along-path` ✓ | advanced | none ✓ | flag at −3.4, t = 0.828, K 10→20, W 10.0 ✓ | OK (P3 stamp) |
| S6 | yes — three live dials over the taught relation | `drag-sandbox` ✓ | core (38b ✓) | F, m, v0 | **WRONG (F3), corner unchecked (F4)** | FIX F3/F4 |

---

## Answers to the six questions asked

1. **Distinct ideas.** S2 is the weak one — the theorem-is-signed idea is real (#2 taught the sign of
   *a force's* work, not of ΔK), so it earns its place by content, not by picture; F7's misdeclaration
   is what makes the picture look derivative. **S4 vs S2 is genuinely distinct** (ΔK ≠ ±K_final needs
   a nonzero start *and* end) — but its 16a beat aims at the one instant S2 already renders (F5).
2. **Reflow arithmetic.** Wrong as reasoning, right by luck at exactly one viewport. F1 makes it true
   by construction at every height.
3. **S3's exact balance.** Survives: S3 authors no sliders so the balance cannot be broken; the float
   residual (`0.4·5·9.8 = 19.600000000000005`) is ~4e-15 N → a ≈ 8e-16 m/s², invisible at
   `precision: 1` and inside the `−0.0` clamp (L44879). And it emphatically **moves** — crate crosses
   5.0 m, `d` grows, two bars sweep ±98.0 J while K holds. Keep untouched.
4. **S4 vs the CRITICAL scar — sound for S4.** The defect is that the same sentence leaves **S6**
   undispositioned and the symmetric-pair envelope was never run. → F4.
5. **RISK-D.** Downgrading was procedurally acceptable, but the answer is two lines at L48204-05.
   Discharge it. Does not block.
6. **Rules 41 / 35 / 38.** Rule 41 clean apart from the two P3s. Rule 35 clean — braking a vehicle and
   catching a ball are universal. Rule 38 rings correct, advanced contiguous, **both cuts verified
   coherent independently**; under Cut 2 the only survivor referencing hidden-ring content is the S6
   `v0` slider glyph, mitigated by S2's core-ring wording — thin but declared and acceptable.

---

## RUBRIC (advisory, unratified — did not affect the verdict)

```
D1 1 · D2 2 · D8 2 · D9 2 · D10 2   (Checkpoint-A subset)
weakest: D1 information gain — S2's new idea is a sign flip delivered by the same
         picture as S1; its distinctness rests on narration and on the friction agent,
         not on the motion.
         D9 title as a teaching claim — S4's buries the result behind "The change is
         measured from…" and the rail truncates the first words (47 chars).
```

D2/D8/D10 are the skeleton's strengths: the qualitative → quantitative → derivation → sandbox order
*is* the derivation, the two misconception beats sit at genuine pivots (the "watch the force's bar"
habit is deliberately built by S1/S2 and broken by S3 — real design), and every S6 dial changes
something a teacher would demonstrate.

**Budget: cycle 0 of 2 spent. Cycle 1 should be a verification read of the nine patch sites, not a new hunt.**
