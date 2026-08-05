# Engine findings — desk A (`feat/rotmech-a`)

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
