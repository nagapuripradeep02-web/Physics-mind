# Checkpoint A — `conservative_vs_nonconservative_forces` (concept #5) — cycle 0

**VERDICT: `DESIGN_FIX`** · owner `alex:architect` (every finding) · cycle 0 of 2 spent.

Pedagogy is strong and the arithmetic is the cleanest this architect has produced: every stamp value,
loop period, first-crossing time and all four frozen-pin instants were independently re-derived and
**all are correct**. Both `capture_mode: 'every'` semantics claims are **correct at source**. The union
walk is honest and the concept genuinely needs zero renderer edits.

But three states rest on instruments that will not render what the design says they render, and two of
those are the PRIMARY and SUPPORTING aha.

---

## Adjudications requested

### `capture_mode: 'every'` semantics — **the skeleton is CORRECT on both claims.** Verified.

`field_3d_renderer.ts` L46110 in `nlbRunCheckpoints`: `cp.text = nlbCpStampText(...)` — an ASSIGNMENT,
so `'every'` **replaces**. `nlbRenderStamps` (L46271) emits one line per checkpoint. The pass head
(L46226) is `cp.label + (cp.mode === "every" && cp._count > 1 ? (" (pass " + cp._count + ")") : "")` —
exactly as claimed. `capture: ['W']` (L46215–46223) loops **every** `eng.work_state` entry, not the
first. The `_dW` rewind is sound (`_dW` zeroed per step at L46047, accumulated at L46069, so
`(1−f)·_dW` is genuinely this step's share; `nlbCpFrac` clamps to [0,1]). **S2 and S4 are built on a
true premise.**

### The Gate-8 flag — the design is NOT walking into the defect, but the flag's stated reason is WRONG. → F4

### The zero-slider decision — **SOUND. Not routed.**
Not because §3's argument is right (it is over-stated), but because the substance holds and there is
direct in-chapter precedent the skeleton failed to cite: **`kinetic_energy_definition` shipped
`controls_visible: []` on all five guided states** through founder approval and a Checkpoint B APPROVE.
Rule 31 requires *only the relevant* slider, not *a* slider. And the substantive argument is airtight
in a way the skeleton undersells: S2's and S4's stamp values are DoD-asserted and narrated verbatim
(−2.5 / −24.8 / −27.4 / −14.7 / −29.4) — **any live μ, θ or v₀ dial falsifies every one of those
numerals mid-loop.** There is no slider you can put on a stamped-arithmetic round-trip state that does
not break its own narration. (The faraday citation is false — see F7.)

### Incline + energy layer + accumulators — clean; one question is moot.
- **`h_ref_m` / `U_grav`: N/A.** The skeleton authors **no `energy_layer` block anywhere**.
  `eng.energy_active = !!(eng.energy_layer || eng.work_state || eng.checkpoint_state)` (L44504), so work
  bars render off `work_state` alone — the shape #1 and #2 shipped. No `U_grav` bar exists, so `h_ref_m`
  never resolves. The 30° reference question does not arise.
- **SEAM N `N ≥ 0` clamp: inert.** N = mg cos 30° = 42.44 N, no state authors an applied force.
- **All six stamps verified.** `nlbWorkForceAlong` returns `−m·g·sin θ` for `'gravity'` (position-only ⇒
  pass-1 = pass-2, the whole S4 claim) and live signed `b.f` for `'friction'`. −24.5×0.2 = −4.9 ✓ ·
  −12.7306×0.2 = −2.546 → `-2.5` ✓ · −12.7306×1.9488 = −24.807 → `-24.8` ✓ · −12.7306×2.1488 = −27.36 →
  `-27.4` ✓ (independently confirmed by the energy route: ΔK = ½·5·(5.058−16) = −27.35) · −14.7 ✓ · −29.4 ✓.
- **All four frozen-pin instants correct** (re-ran `deriveStateMeta.ts` L3091–3110): S1 2640 · S2 2560 ·
  S3 2000 · S4 3360. The `!phaseFound` branch never runs.

---

## F1 · P1 · **BLOCKING** · S3 · the angle arc does not read 180° after the flip — it DISAPPEARS

`nlbFangDir(eng, b, 'displacement')` (L45835–45838) resolves the **net displacement from the home
pose**, not instantaneous motion:

```js
if (token === "displacement") {
    var dsd = (b.s || 0) - nlbDispOrigin(b);
    if (Math.abs(dsd) < NLB_DISP_MIN_M) return null;
    return nlbSignedDir(axis, dsd);
}
```
`nlbDispOrigin` = `b._dsp0 ?? b.s0` — the seed, −3.6, for the whole guided loop.

On the **down-leg** the block is still above home (`s > −3.6`) so `displacement` still points up-slope,
and friction has just flipped up-slope too. The two are **parallel**. Then at L45924:

```js
var mag = Math.abs(sweep);
if (mag < NLB_FANG_MIN_DEG) {          // NLB_FANG_MIN_DEG = 1.5  (L45697)
    if (arc) arc.visible = false;
    if (al) al.visible = false;
```

**The arc and its label are hidden for the entire down-leg** — including at S3's frozen pin (t = 2000 ms,
phase 750 ms, 347 ms into the descent). Three claims fail: §3's "reads 180° before the flip and 180°
after it", DoD (b)'s "arc label θ, live 180° (S3 only)", DoD (f-6)'s "every narrated number appears on
an instrument".

Worse for Rule 16a: §4's `one_line_fix` is *"its angle to the motion is always 180°"*, and §4 asserts
the CRITICAL row `misconception_beat_whose_own_evidence_confirms_the_wrong_belief` was verified — it was
verified for `b.f` and the ledger, **not for the arc**. The rendered arc goes 180° → *absent*, the one
reading a student can misread as "the opposition ended."

No fix exists inside the arc: the closed enum is
`'applied'|'weight'|'normal'|'friction'|'tension'|'net'|'displacement'|'surface'` (L1923–1924) — **there
is no velocity/motion token.** `'surface'` is the constant up-slope axis (L45816) and reads 180° → 0°,
honest but not the claim.

**PATCH (verbatim, to §3 row S3, DoD (b), DoD (f-6), §4):** delete every reference to `angle_arc` from S3.
Replace §4's S3 `visual_counter` / `one_line_fix` with:

> `visual_counter`: at the turnaround the friction arrow swings 180° to point up-slope while the weight
> arrow holds its direction; the friction bar keeps falling through the reversal instead of climbing back
> `one_line_fix`: friction turns around with the block, so it pushes against the motion on the way down
> as well — its work is negative on both legs

Delete the DoD (b) `angle` row. Delete `angle_arc` from §3's verified glow-id list. Remove `180°` from
the cross-state numeral cross-tab (S3's set becomes `{−9.5, −18.4}`).

---

## F2 · P1 · **BLOCKING** · S2 + S3 · with the arc gone, S3 is a re-render of S2

Apply the test: *if I deleted S3, what could a student no longer answer?*

S2 already authors `arrows.show: ['weight','friction']` (DoD (c)), so **S2 already draws the friction
arrow flipping at its own turnaround**, on the same rough 30° slope. S3 re-runs the identical apparatus
at v₀ = 3 and points narration at a motion S2 already performed:

| | S2 frozen (t = 2560) | S3 frozen (t = 2000) |
|---|---|---|
| arrows | weight + friction (up-slope, post-flip) | weight + friction (up-slope, post-flip) |
| bars | gravity −21.2, friction −16.4 | friction −9.5 |
| stamp | `at the flag: W gravity = −4.9 J · W friction = −2.5 J` | none |
| arc | — | **hidden (F1)** |

**S3's frozen frame is a strict subset of S2's.** Rule 32c fails on the still. This is the
`friction_force` STATE_4 class the founder cut at `a039841`.

The other three states survive: S1 proves closure at the start line; S2 proves friction's does not close
and names the classification; S4 proves the reading at *interior* points is pass-independent — a
statement about every point, which S1's single closure does not contain.

**PATCH (two parts, both required):**

1. **§3 DoD (c), S2 `arrows.show`:** `['weight','friction']` → `['weight']`. Add: *"S2 draws no friction
   arrow: the friction ARROW is S3's one new thing and must not be spent a state early (the same rule
   that keeps N out of every state). S2's friction is carried by its bar, its stamp and the HUD
   `f = 12.7 N`."* Confirm S2's §4 `visual_counter` is unaffected — it cites bars and stamps only.
2. **Give S3 a frame-stable instrument S2 does not have** — a two-pass flag just below the apex, latching
   *same place, motion reversed, friction's ledger still falling*. Worked option (**re-derive before
   adopting**): keep `s₀ = −3.6`, `v₀ = 3`, `μ = 0.3`; author
   `checkpoints: [{ s_m: initial_position_m + 0.55 = −3.05, capture: ['W'], capture_mode: 'every', label: 'the same spot' }]`
   and set `loop_reset_ms: 1350` (was 1250). Out crossing 282 ms (< 0.55R = 743 ✓) stamps
   `W friction = −7.0 J`; return crossing 618 ms stamps `the same spot (pass 2): W friction = −8.4 J`;
   pin at 0.60 × 1350 = 810 ms → **margin 192 ms ≥ 167 ✓, pass-2 stamp in the frozen frame**; loop end
   s = −4.05, inside ±5.4 ✓. Update §"Arithmetic", DoD (d), §3 delta cue.

**If part 2 cannot be made to land in S3's own frozen frame, CUT S3** and fold its mechanism sentence
into S2's narration. Four states is a legitimate count; a state that cannot show its own claim in a still
is not worth its click.

---

## F3 · P1 · **BLOCKING** · S1 + S2 · "0.0 J at the recross" is not renderable at the authored speed

`nlbEnFx` (L44876–44881) rounds to 1 dp with a `|x| < 0.05` clamp, so the bar reads `0.0 J` only while
`|W| < 0.05 J`.

- **S1:** at the recross v = 4.0 m/s, ledger moves `24.5 N × 4.0 m/s × 16.7 ms = 1.634 J per frame`. The
  `0.0 J` window is `|Δs| < 0.00204 m` = **1.0 ms wide**. Chance any 60 Hz frame lands inside it ≈
  0.1/1.634 = **6%**. The bar steps from ≈ −0.8 J to +0.8 J across one frame. **94% of playthroughs never
  display the number the state is named after.**
- **S2:** v = 2.25 m/s → 0.919 J/frame → ≈ **11%**. The "aha frame" (gravity 0.0 J and friction −27.4 J
  together) is a one-in-nine event.

And the frozen baselines — the only artifact eye-walker, THE EYE and the founder look at — carry the
OPPOSITE picture, by the skeleton's own DoD (d):

- **S1 frozen:** caption *"Round trip: total zero"*, formula `W(up) + W(down) = 0`, and a bar reading
  **−38.2 J** in red. No stamp exists in S1 by design.
- **S2 frozen:** caption *"Friction: negative both ways"*, **two red bars**, pass-1 stamp with both
  numbers negative. Nothing on that screen says gravity behaves differently from friction.

§"capture-semantics acceptance" concedes this and argues live recurrence — insufficient under Rule 24
(reads sound-off), and exactly the `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` class the
skeleton claims to honour in DoD (f-6).

**This is the third time in this chapter (concept #1 F11, concept #2 S4) that a state ships a claim its
own picture contradicts. It is the chapter's signature defect and must not survive Checkpoint A again.**

**The engine already has the right instrument and §0.5 threw it away.** The skeleton avoids a flag at the
home pose ("a body seeded exactly ON a flag adopts an ambiguous side"). Traced: not a hazard — it is
precisely the wanted behaviour. At t = 0, `side = (b.s >= cp.s_m) ? 1 : -1` gives `+1` at equality and
`cp._side == null` **adopts without firing** (L46106–46107). The flag then fires exactly once per loop on
the down-crossing, and `nlbCpFrac` interpolates to `s_m` so `wv -= (1−f)·_dW` yields **exactly
`W gravity = 0.0 J`** — and it **latches** in `cp.text` until the loop reset. The closure, in
frame-stable text, for free.

**PATCH (§3 control table S1/S2, DoD (d), §"Arithmetic"):** author on S1 and S2 a checkpoint at the
home-pose coordinate — `{ s_m: initial_position_m, capture: ['W'], capture_mode: 'first', label: 'back at the start' }`
(`'first'` suffices: fires once per cycle, re-arms on reset, L44746–44750). Re-size each loop so the
firing precedes the `0.60R` pin by ≥167 ms **and** the loop end stays inside ±5.4, adjusting
`initial_position_m` up-track to buy tail room. Worked S2 option (**re-derive**): `s₀ = +0.1`, `v₀ = 4`,
`μ = 0.3`, `loop_reset_ms: 2900` → recross 1493 ms, pin 1740 ms (margin 247 ms ✓), loop end s = −5.39 ✓,
apex +1.17 ✓, and the frozen frame carries
**`back at the start:  W gravity = 0.0 J  ·  W friction = −27.4 J` — the entire PRIMARY aha in one latched line.**

Two consequences to write into the skeleton rather than discover later:
- The green tail grows. At any pin ≥167 ms past closure the block is below its start line and gravity has
  genuinely done positive work; in the S2 option ≈ +15.4 J (22% of a 70 J scale) beside a −35.3 J friction
  bar. **This is honest and it teaches** — the stamp says what happened *at* the start line, the bars what
  is happening *now*, both true. But §"capture-semantics acceptance"'s bound ("≤ +7.5 J, below 9% of
  scale") must be recomputed and re-declared.
- Every downstream numeral changes (peaks, `work_scale_J`, fill fractions, the cross-state uniqueness
  cross-tab). Re-run §"Arithmetic" end to end.

If after re-derivation no loop satisfies all three constraints, the honest alternative is to **change the
claim to one the still supports** — S1's caption and formula become the two-pass endpoint statement rather
than the zero-sum statement — and to say so explicitly rather than narrate a number the renderer will not show.

---

## F4 · P2 · §3 CRITICAL-scar section · the Gate-8 flag's justification is wrong

The row's PROBE opens: *"For each state authoring `work_accumulators` **with a non-empty
`controls_visible`**…"*. S1–S4 author `controls_visible: []`. **The probe never reaches them.** The
skeleton's claim that it "would false-fail every round-trip state on the gravity ledger" is false — it
would not run on them at all. It *does* reach S5 and *would* false-fail there, because the sandbox wrap
re-zeroes both ledgers each lap and gravity's bar changes sign at the wrap anchor. But the row's own
failure mechanism (a seized loop that never re-arms) is structurally absent from `mode: 'sandbox'`, where
`loop_reset_ms` is inert by design.

**PATCH — replace the final sentence of §3's CRITICAL-scar section with:**

> The row's PROBE is gated on *"each state authoring `work_accumulators` **with a non-empty
> `controls_visible`**"*, so it never reaches S1–S4 — the zero-guided-slider decision is what makes it
> inapplicable, not an exception anyone must grant. It DOES reach S5, and false-fails there: the sandbox
> wrap re-zeroes both ledgers each lap (so `|W|` returns to 0) and gravity's bar changes sign at the wrap
> anchor. That is the wrap, not a seized loop; `loop_reset_ms` is inert in `mode: 'sandbox'`, so the row's
> own failure mechanism cannot occur. **FLAG for quality-auditor Gate 8:** exempt S5 from this probe with
> the reason above, and assert instead — friction ledger monotone non-increasing between resets/wraps
> (S2/S3/S5); gravity ledger stamps 0.0 J at the authored start-line flag on S1/S2; no guided state seizable.

---

## F5 · P2 · DoD (b) · the engine emits an ASCII hyphen-minus, not U+2212

DoD (b) asserts *"numeric bare with U+2212 minus"*. `nlbEnFx` is `return x.toFixed(d) + " J";` —
`toFixed` emits `U+002D`, and there is no substitution on the nlb path. (Other scenarios DO substitute —
`.replace("-", "−")` at L65426 and L65576 — which makes the nlb omission a real engine gap, not a
house style.) The −0.0 clamp claim IS correct.

Engine-owned and already shipped on #1/#2/#3, so a **ride-along**, not a blocker. But leaving the false
claim hands physics-author and quality-auditor a Rule-34c line they will "verify" as passing.

**PATCH — DoD (b) parenthetical →** `numeric bare, engine-formatted by nlbEnFx (ASCII hyphen-minus — the
nlb path does no U+2212 substitution; filed as an engine ride-along, not this concept's defect), with the
−0.0 clamp`.

---

## F6 · P2 · Rule 41 — two register breaks the skeleton's own sweep missed
- **S1 title "Gravity: a round trip gives zero total work"** — "gives" is personification (41a).
  → `Gravity's total work over a round trip is zero`.
- **"account" / "closes"** — banking metaphor, in Block 2 ("friction's account does not return") and S5's
  discoverables ("gravity's account closes every pass"). Replace with "ledger"/"reading"/"total"; add
  `account`, `closes`, `pays`, `owes` to the DoD (f-2) banned-word list.

## F7 · P3 · §0.8 and §3 · the faraday precedent is FALSE
`faraday_law_induction.json` authors `"show_sliders": true` on all six states. **PATCH — replace
"faraday S1–S4 precedent" with:** *"`kinetic_energy_definition` (this chapter, concept #3) shipped
`controls_visible: []` on all five guided states through founder approval and a Checkpoint B APPROVE —
the direct precedent."*

## F8 · P3 · DoD (h) · the iframe literal is wrong
`#sim` is `width:100%;height:100%` in a flex stage; measured 551 px (1280×720 window) → 599 → 731 →
911 px (1920×1080), and `visual_eyes.ts` passes no viewport so THE EYE photographs at the 720 default. The
skeleton's percentage-invariance discipline already makes the number moot (hence P3) — but the literal
will be inherited by #9, which authors five-slot groups. **PATCH:** replace
`**Iframe budget (the corrected reflow scar): 1052×551.**` with `**Iframe budget: the sim iframe is
RESPONSIVE (measured 551–911 px tall across common teacher windows; THE EYE photographs at the 720
default). No claim in this skeleton may depend on landing on a particular reflow rung — every claim is
anchored on numerals and fill fractions (nlbEnPct percentage invariance).**`

## F9 · P3 · DoD · Rule 19 has no plan
Concept #2's lesson was that its Rule-19 count was satisfied entirely by annotations field_3d never
paints. **PATCH — add DoD (j):** *"Rule 19: each state declares ≥3 primitives actually DRAWN by
`newtons_laws_body` (body, slab/surface, force arrows, work bars, `d` arrow, checkpoint flags) — never
`annotations`, which field_3d does not paint (concept #2 finding)."*

---

## What is already right — do not touch in cycle 1

Atomic claim and its seven boundaries · the 5-state count and its justification · the S1→S2 16a delivery
(consequence first, no predict-pause) · both anchors (bag onto a shelf; box dragged out and back —
universal, brand-free, physics-true at depth) · the Rule 38 ring plan, both cuts, the S5 narration
constraint, the explore-control ring audit and tags-as-claims · the spring exclusion (correct: `'spring'`
is genuinely not in the `work_accumulators` enum, L46012–46019) · `work_scale_J` shared at 70 across
guided states · the accumulator-order rule · the zero-`work_bar_*`-focal decision (verified:
`nlbEnergyApplyGlow` L45302–45304 gates on `energy_bar_`/`energy_seg_`/`energy_col_E` only — `work_bar_*`
is inert) · the relation-states-author-no-focal call · every flag authored as `initial_position_m + d`
arithmetic · the entry_state_map, deep-dive picks and drill-down clusters.

---

## RUBRIC (advisory, unratified — did not affect the verdict)

```
D1 1 · D2 2 · D8 2 · D9 1 · D10 2   = 8/10
weakest: D1 information gain — S3 is a re-render of S2 once its only distinct
         instrument is removed; the two frozen frames differ by one bar and one
         stamp, both of which S2 has and S3 lacks.
         D9 title as a teaching claim — S1's title personifies the force ("gives"),
         Rule 41a; the other four state the result in plain literal English.
```

Note against §4's fence: this skeleton is *cleaner* than the exemplars on Rule 41 and Rule 38 — do not let
the exemplars' own titles ("Longer chokes", "geometry dances") be cited back at it.

**Budget: cycle 0 of 2 spent.**
