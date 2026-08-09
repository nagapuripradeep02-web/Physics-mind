# MATHEMATICS BLOCK — `derivative_as_secant_limit`

> Author: `mathematics_author` · Desk: `Physics-mind-mathematics-derivative` @ `feat/mathematics-derivative`.
> Upstream: `derivative_as_secant_limit_skeleton.md` (founder_proxy Checkpoint A `DESIGN_OK`, cycle 2).
> Adds rigor; does **not** redesign. Every deviation from the skeleton's literal numbers is flagged, never silent.

## Engine bug queue consultation (own sweep, not inherited)

```
query_engine_bug_queue.ts derivative_as_secant_limit          → 0 rows
query_engine_bug_queue.ts --pcpl --open                       → 10 rows (none bind)
query_engine_bug_queue.ts --owner alex:mathematics_author --open → 0 rows
query_engine_bug_queue.ts --owner alex:architect --open       → 61 rows
query_engine_bug_queue.ts unit_circle_to_sine_wave --open     → 19 rows (inherited PCPL digest)
```

| bug_class | Verdict |
|---|---|
| `pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve` (Gate 9(d), FATAL) | **Satisfied.** `u` is never a slider; both doors pass by construction. |
| `pcpl_radians_helper_missing` | **N/A, verified.** No angle/degree expression anywhere — every quantity is unitless. No `radians()`, no `PI/180`. |
| `pm_applychoreography_silently_keeps_only_the_last_entry_per_variable` | **Satisfied.** One entry per variable per state, verified state by state. |
| `correspondence_state_stages_cause_first_as_a_head_start…` | **Satisfied.** No state stages two drivers of an asserted equality at different `start_ms`. S7's surface and S9's `h = xq − x0` chip read the SAME live variables in the same frame (D8). |
| `pcpl_glow_focus_*` (both rows) | **N/A.** No `glow_focus` primitive authored anywhere — emphasis runs entirely through `focal_sequence`/`focal_primitive_id`. Stated so nobody conflates the families. |
| `renderer_pair_panel_b…` | **Satisfied** — `panel_b: "none"`. |
| `concept_schema_assessment_minimum…` | **Satisfied** — 7 items ≥ floor 6. |
| **`state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach`** | **TENSION FOUND → FLAG 1.** Not silently fixed. |

No `FIX(engine)` — nothing requires a renderer edit.

## Source verification (read, not trusted from citation)

Read `parametric_renderer.ts` directly at this desk's HEAD (CP-A…CP-D merged past `994bb8f`, so line numbers were re-read rather than trusted):
- `drawPlotPoint`: `textAlign(LEFT, CENTER); text(resolved.readoutText, px.x + offX, px.y + offY);` — unbounded rightward, defaults `{10,−12}`, `readout.offset` **is** authorable.
- `drawSecantLine`/`drawTangentLine`: same pattern, readout anchored at chord midpoint / tangency point `+10,−12`, **hardcoded, not authorable**. Confirms Note 1's mechanism.
- `PM_secantTangentReadout`: `fmt = spec.readout.format || 'slope = {m}'`; one token, `{m}`. The bare-format fix is legal and supported — no engine change.
- `PM_focalEmphasis`: focal resolution is **pure id-matching** — it does NOT consult `PM_animationGate`/visibility of caller or target. Confirms Note 3's mechanism exactly, and confirms FLAG 1.
- `PM_planeBuildTransform` — k = 80, equal both axes, matches skeleton §11.

---

## 1. `engine_config`

```jsonc
{
  "variables": {
    "x0":    { "name": "P's x-coordinate", "min": -1.6, "max": 1.6, "default": 1 },
    "xq":    { "name": "Q's x-coordinate (explore drag only — guided states derive Q from x0+h, never name xq)", "min": -1.9, "max": 2.0, "default": 1.9 },
    "hlog":  { "name": "log10(h) — choreography convenience, NEVER rendered, NEVER a slider", "min": -3, "max": 0, "default": 0 },
    "hz":    { "name": "S4-only exact-collapse factor (h_eff = hz * 10^hlog)", "min": 0, "max": 1, "default": 1 },
    "u":     { "name": "S8 dedicated sweep parameter — phi-law: never a slider, never drag-bound", "min": -1.6, "max": 1.6, "default": -1.6 },
    "xdraw": { "name": "S1-only curve reveal bound (function_plot x_domain.max_expr)", "min": -2.1, "max": 2.1, "default": -2.1 }
  },
  "formulas": {
    "f_at":          "x*x/2",
    "chord_slope":   "x0 + h/2",
    "tangent_slope": "x0",
    "f_prime":       "x"
  },
  "computed_outputs": {
    "chord_slope_display":   "chord slope, 4 dp, primitive-owned readout ONLY (secant_line.readout) — never duplicated by a label",
    "tangent_slope_display": "tangent slope, 4 dp in S5 / 2 dp in S6 and S9, a PLACED label (x0 is legal at every h, including h=0)",
    "P_coords":  "(x0, x0*x0/2), 2 dp",
    "Q_coords":  "(x0+h, (x0+h)^2/2) in guided states; (xq, xq*xq/2) in S9, 2 dp",
    "h_display": "3 dp, per-state expression — see the h-law table below"
  },
  "constraints": [
    "x is defined for every real number; the plane's visible frame draws x in [-2.4, 2.6] but the curve (function_plot) is plotted only on x in [-2.1, 2.1] — two different intervals, and no caption may conflate them",
    "h != 0 at every rendered chord — the difference quotient is undefined at h = 0 by construction (engine guard |dx| < 1e-12); the S4 exact-zero vanish is choreography-only and never teacher-reachable (drag quantum 1/80 = 0.0125 >> 1e-12)",
    "chord_slope = x0 + h/2 exactly, recomputed every frame from x0 and h — never interpolated, never cached, never duplicated by a second live readout",
    "tangent_slope = x0 exactly, defined and legal to display at every h including h = 0 — this is what un-strands the S5 comparison (P1-2)",
    "canvas pixels = 80 x data units on both axes (equal_scale, k=80 measured), origin at px (252, 294) — the one scale factor, reused verbatim in every *_expr field",
    "f'(x) = x holds for every real x for THIS parent (f = x^2/2 only); the S8 ghost line is drawn only on x in [-1.6, 1.6], matching the trace — no narration or label may generalise this to 'every curve has a linear derivative' (false: f = x^3 => f' = 3x^2)"
  ]
}
```

**Per-state `h` semantics (never one global expression — the skeleton's h-law):**

| State | `h` expression | Notes |
|---|---|---|
| S1 | n/a (no chord) | — |
| S2 | literal `1.000` | static entry, no choreography |
| S3 | `pow(10, hlog)` | hlog choreographed 0→−2 |
| S4 | `hz * pow(10, hlog)` | hlog −0.39794→−3, then `hz` 1→0 over the final 100 ms — ONE declared expression, used identically in `to_expr` and the h chip |
| S5 | `pow(10, hlog)` | hlog −0.398→−3 |
| S6 | n/a (chord retired, tangent only) | — |
| S7 | literal `0.800` | declared static entry |
| S8 | n/a (`u` drives f/f′ instead) | — |
| S9 | `xq − x0` | both live/drag-bound; −0 clamp guards the display only (never fires under drag quantum 0.0125) |

---

## 2. Domain & validity ledger

### 2a. The function

`f(x) = x²/2`. **Domain: all reals, no exclusions.** Range `[0, ∞)`, minimum at `(0,0)`. A polynomial — continuous and differentiable at EVERY real `x`; no asymptotes, no removable discontinuities, no corner or cusp. This concept authors no deliberate non-differentiability contrast, and claims none.

**Drawn intervals — stated separately, because they are NOT the same interval:**

| What | Interval | Where |
|---|---|---|
| Plane's visible frame | `x ∈ [−2.4, 2.6]`, `y ∈ [−1.95, 2.70]` | chord/tangent `extend:"frame"` clips against THIS rect |
| The curve (`function_plot.x_domain`) | `x ∈ [−2.1, 2.1]` (S1 animated in via `xdraw`; S2–S9 literal) | skeleton §10c |
| P's drag range (`x0`) | `[−1.6, 1.6]` | S6, S9 |
| Q's drag range (`xq`) | `[−1.9, 2.0]` | S9 |
| S8 ghost `f′(x) = x` | `[−1.6, 1.6]` — matches the trace, NOT the curve's `[−2.1, 2.1]` | S8 |

The interval-honesty risk here is **not** x-domain truncation; it is **function-class** generalisation (2c).

### 2b. The central exclusion: `h ≠ 0` — an exclusion, not an oversight

The difference quotient `(f(x₀+h) − f(x₀))/h` is **algebraically undefined at h = 0** for ANY function (0/0), independent of `f` and of the renderer. `f` itself has no excluded point at `x₀`; the exclusion belongs to the QUOTIENT. This is exactly why S4 is a separate state from S3.

> **Definition (derivative as a limit).** `f′(x₀) := lim_{h→0} [f(x₀+h) − f(x₀)]/h`, defined precisely when that two-sided limit exists.
> **Hypothesis:** `f` defined on an open interval containing `x₀`.
> **This setup:** `f = x²/2` is a polynomial on all of ℝ; for every `x₀` the P-drag reaches (`[−1.6,1.6] ⊂ ℝ`) the hypothesis is trivially satisfied at every rendered frame, and the limit exists at every `x₀`. No hidden violation anywhere in the drawn range.

**Approaching is not reaching — checked two-sided, not asserted:** for `x₀ = 1`, `m(1,h) = 1 + h/2`. For `h > 0`, `m > 1` strictly; for `h < 0`, `m < 1` strictly; both one-sided limits equal 1. **The chord slope equals `1.0000` at no rendered `h ≠ 0`, ever** — so assessment item 2's "never equals it at any h > 0" is exactly true, not rhetoric.

**Engine mechanism (distinct from the mathematics, both true):** the guard is `|Δx| < 1e-12`; the drag quantum is `1/80 = 0.0125` — ten orders of magnitude coarser. **A teacher cannot reach the guard.** S4's vanish is choreography-only (`hz: 1→0`). **Narration duty, binding:** never say the teacher can make the chord vanish; S9's payoff is that however close Q parks, a chord still exists and its number is still not `1.0000`.

### 2c. Every generalisation claim, traced

| Claim | Named fact | Scope check | Verdict |
|---|---|---|---|
| S8: "those heights line up on a straight line" | `f′(x) = x` for `f = x²/2` | `m(x₀,h) = x₀ + h/2 → x₀` as h→0, for EVERY real x₀ (the algebra doesn't care what window is drawn) | **TRUE for all real x₀, but about THIS parent only.** `f = x³ ⟹ f′ = 3x²` (not linear); "derivatives are always lines" would be false. Narration says **"for this curve"** explicitly. |
| Item 2: "approaches 1, never equals it at any h > 0" | two-sided limit at x₀=1; quotient ≠ limit for any h≠0 | checked algebraically (2b) | **TRUE**, both sides |
| Item 7 (`f = 3x`): "3, for every h" | for a linear function the difference quotient is CONSTANT | `(3(1+h) − 3)/h = 3` for every h ≠ 0; verified at h ∈ {1, 0.5, 0.1, 0.001} | **TRUE**, and a genuinely different (trivial, no-limit-needed) case — the counterexample for a student who thinks the settling always needs a shrinking gap |
| Item 1: average rate on `[1,3]` | uses x = 3, OUTSIDE the drawn window | deliberate transfer; `f` is defined and correct there (domain ℝ) — the window is a DRAWING choice | **Legitimate; do not "fix" the drawn range to cover it** |
| S3/S5 contrasts (M1, M3) | state-local, not "for all x" | n/a | no generalisation risk |

### 2d. Exact-before-decimal is by construction

Every displayed number is a **terminating decimal by algebraic construction** (rational coefficients; `h` a power of ten or a finite drag step). **There is no irrational value anywhere in this concept** (no π, no √2), so "exact vs decimal" reduces to display granularity, not truncation error. Verified: `m(1,1)=1.5`, `m(1,0.1)=1.05`, `m(1,0.01)=1.005`, `m(1,0.001)=1.0005`, `m(1,0.0125)=1.00625` — all exact at 4 dp. The 4 dp / 2 dp split is a pedagogical instrument decision, never error mitigation.

---

## 3. Timeline + control spec + narration (Rule 31)

**Primitive ids (canonical):** `plane`, `curve`, `P`, `Q`, `sec`, `tan`, `tan_label`, `row1…row6` (S4 ladder), `line1…line4` (S7 ladder), `fs` (formula surface), `x0_chip`/`h_chip`, `marker8`, `seg_tan`, `fprime_head`, `fprime_trace`, `ghost_fprime`.

**Precision doctrine:** chord `sec.readout.decimals = 4` in every state it appears. Tangent (`tan_label.text_expr`) 4 dp in S5, 2 dp in S6/S9. `h` 3 dp. Coordinates 2 dp.

**Note 1, binding in every state:** `sec.readout.format` is **always** `"slope = {m}"` (bare, ≤14 chars, right edge ≤494 px — clears the new 510 px column by ≥16 px). `tan` authors **no** `readout` anywhere. **Every column overlay starts at x = 510**, not 480 — all column x-coordinates below are shifted accordingly; y unchanged except S5 (Note 5).

### STATE_1 — "The Curve and One Point"
`trace-locus` · cue "The curve, one point." · core · `manual_click` · no controls.
**Motion:** `xdraw` −2.1→2.1, start 1500, dur 7000 (ends `2.1000` @8500). `x0` −1.2→1.0, start 10000, dur 6000 (`x0(13000) = −0.1000`, `x0(16000) = 1.0000`, both re-derived exact).
**Focal:** `focal_sequence` — `curve` (0–10000) → `P` (10000–20000). Reveal-tracking.
**Primitives:** `plane`, `curve`, `P` (readout 2 dp, offset `{12,20}`). No `sec`/`tan` (P2-9's correction: S1 shows the apparatus and the question).
**Narration (36 words; anchor embedded verbatim):**
> "Here is a curve, and one point P on it. A car's speedometer shows your speed at this instant — one moment, not an average over the whole trip. What single number means steepness at P?"

### STATE_2 — "A Chord Through Two Points"
`decompose` · cue "Two points make a chord." · core · no controls.
**Motion:** reveals only, `h` static at `1.000`. `Q` @2500; dashed `run` @7000; `rise` @11000; `sec` @15000 (+600).
**Focal:** `focal_sequence`, 5 windows tracking the reveal exactly (P2-8): `P` (0–2500) → `Q` (2500–7000) → `run` (7000–11000) → `rise` (11000–15000) → `sec` (15000–22000). Sums to 22000 = S2's duration.
**Primitives:** `plane`, `curve`, `P`, `Q` (readout 2 dp, offset `{12,−30}`), `run` + label, `rise` + label, `sec` (bare readout, 4 dp).
**Note 1 authoring — the dual-labels, NOT as a live readout:**
- `sec.readout.format = "slope = {m}"` (bare). At h=1, x₀=1: chord midpoint px `(372,194)`, readout anchor `(382,182)`, `"slope = 1.5000"` (14 ch) → right edge ≈494 px, clear of P/Q readouts and the x=510 column.
- One-time `label` `chord_dual_label`, literal `"chord (secant line)"`, literal position ≈`(367, 234)` (perpendicular ~18 px off the P→Q segment, matching the fixed rise/run offset pattern), `appear_at_ms: 15000, animate_in_ms: 600`.
- One-time `label` `slope_dual_label`, literal `"slope (gradient)"` (**term only, no number in this string**), at `(382, 166)`, same timing. The live bare readout renders the number directly below, so the number exists on screen exactly once.
- **⚠ ASSUMPTION — probe-before-authoring (FLAG 2):** these two positions are hand-computed from the plane transform, NOT measured with p5 `textWidth()`. Verify no collision at THE EYE before sign-off — new content Checkpoint A's pixel math never covered.
**Narration (39 words; carries the Block-1 prerequisite patch and plants M1):**
> "A point Q appears, a gap h from P. The chord's slope is rise divided by run — how far the curve climbs between the points, divided by the gap h. The average rate — not yet at P."

### STATE_3 — "The Second Point Slides Closer" (PRIMARY AHA)
`limit-approach` · cue "The gap shrinks." · core · no controls · **`misconception_watch`: M1.**
**Motion:** `hlog` 0→−2, start 1500, dur 15000, holds `{−0.30103, 2000}` and `{−1, 2000}`. Segments re-derived independently this session, matching to the ms: ramp `[1500→3757.7]` · hold `[→5757.7]` · ramp `[→11000]` · hold `[→13000]` · ramp `[→20500]`.
**Checked:** `t=14400: hlog=−1.186667, h=0.065063, m=1.032531 → "1.0325"` · `t=20500: h=0.01 exact, m=1.0050` · holds render `1.2500` and `1.0500`.
**Focal:** static `focal_primitive_id: "sec"` (present from entry).
**Primitives:** `plane`, `curve`, `P`, `Q`, `sec` (bare readout, 4 dp).
**Narration (47 words; confronts M1 as a straightforward contrast beat, Rule 16a):**
> "Watch h shrink. At h equals one, the chord reads 1.5000 — if that were the answer, we would be done. But as Q slides toward P, the number keeps moving, then stops: it settles near 1.0050. That value, not any gap's average, belongs to the point."

`one_line_fix`: "A chord's slope is an average over its gap; the point's slope is the number those averages settle on."

### STATE_4 — "At h = 0 There Is No Chord"
`null-result-hold` · cue "h = 0: no chord." · core · no controls · **`misconception_watch`: M2.**
**Motion:** `hlog` −0.39794→−3, start 3000, dur 10000 (crossings re-verified: `h=0.1 @5313.8`, `h=0.01 @9156.9`, `h=0.001 @13000`). `hz` 1→0, start 13400, dur 100 → `h_eff(13500) = 0` exactly, guard trips, `sec` and its readout vanish together. Ladder: `row1` @3000, `row2` @5313.8, `row3` @9156.9, `row4` @13000, `row5` @14300, `row6` @17500 (+600).

| Row | text |
|---|---|
| row1 | `h = 0.4 → slope 1.2000` |
| row2 | `h = 0.1 → slope 1.0500` |
| row3 | `h = 0.01 → slope 1.0050` |
| row4 | `h = 0.001 → slope 1.0005` |
| **row5** | **`h = 0 → no chord`** (Note 2 — never `0/0`; the formula surface already owns that symbol) |
| row6 | `slopes → 1.0000 — the limit` |

**Focal — Note 3 mechanism, DECLARED not merely described:** `focal_sequence`: window 1 (0–13500) → `sec`; **window 2 (13500–14300, 800 ms) → `row5`, authored BEFORE `row5.appear_at_ms: 14300`** — `PM_focalEmphasis` matches ids only and never checks visibility (confirmed by reading the body), so for these 800 ms **nothing glows** and every visible peer sits at `alphaMul: 0.6`. **This is the intended void beat — the frame dims the instant the chord is gone, before the ladder names why. Do not re-time this window to "fix" it.** Window 3 (14300–24000) → `row6`.
**Distinct from an unrelated OPEN scar:** `pcpl_glow_focus_renders_a_halo_before_its_target_body_has_appeared` concerns the separate `glow_focus` PRIMITIVE (its own gate check), **none authored here**. Different code path, different defect shape. Do not route this state's intent against that row.
**Primitives:** `plane`, `curve`, `P`, `fs` (`(f(x₀+h) − f(x₀))/h at h = 0 → 0/0`), `row1`–`row6`. `sec` present 0–13500 then gone.
**Narration (45 words; Note 4 applied — names the re-opened gap; confronts M2):**
> "Open the gap again and watch each value pass. Two points become one: no chord, no slope — zero over zero is not a number. Yet the values were approaching one number: 1.0050, 1.0005, closer to 1.0000 — the limit, the slope at the point."

`one_line_fix`: "h = 0 is excluded; the derivative is the number the slopes approach, not the slope you compute there."

### STATE_5 — "The Tangent: One Line Remains"
`limit-approach` — declared companion/contrast of S3 (S3 converges a NUMBER, S5 converges the PICTURE) · cue "One line remains." · core · no controls · **`misconception_watch`: M3.**
**Motion:** `tan` reveals @1500 (+800). `hlog` −0.398→−3, start 4000, dur 12000.
**Checked:** `t=13200 (pin): hlog=−2.393133, h=0.0040452, sec=1.0020226 → "1.0020"` · `t=16000: h=0.001, sec=1.0005` · line separation at the pin ≈0.55 px at k=80 (under one pixel — confirms the merge claim).
**Focal (transcribed as approved — see FLAG 1 for a tension found here, NOT silently changed):** `focal_sequence`: `P` (0–1500) → `tan` (1500–4000) → `sec` (4000–14000) → `tan` (14000–22000).
**Note 5 applied (taken — strictly better):** `tan_label` (4 dp) repositioned to **`(510, 242)`**, matching the S5 pin's `sec.readout` y (241.8 measured), rather than the original `(480, 195)`. This puts `1.0020` and `1.0000` on ONE horizontal read — the exact saccade the state's claim depends on. (x also moves 480→510 per Note 1b.)
**Primitives:** `plane`, `curve`, `P`, `sec` (bare readout, 4 dp), `tan` (no readout — P1-2), `tan_label` at `(510, 242)`, 4 dp.
**Narration (39 words; never claims the chord "becomes" the tangent):**
> "The tangent appears at P. As h shrinks again, the chord rotates toward it — the two lines are impossible to tell apart. But look at the numbers: chord 1.0020, tangent 1.0000. The picture merges. The numbers never do."

`one_line_fix`: "The chord approaches the tangent; only the limit IS the tangent."

### STATE_6 — "A Different Point, a Different Slope"
`parameter-sweep` · cue "Each point, its own slope." · core · **draggable P** (`x0 ∈ [−1.6, 1.6]`).
**Motion:** `sec` fades out 0–1500. `x0` −1.4→1.4, start 2000, dur 13000.
**Checked:** `t=12000: x0=0.753846` → 2 dp render `"0.75"` · `t=15000: x0=1.4000 exact` · valley `x0=0 ⟹ slope=0` exactly (parabola vertex — `"0.00"` is exact, not a rounded near-zero).
**Focal:** static `focal_primitive_id: "tan"` (the tangent is the tracked story, not P).
**Primitives:** `plane`, `curve`, `P` (draggable), `tan` (extend `"frame"`, no readout), `tan_label` (2 dp).
**Narration (31 words):**
> "Drag P anywhere on the curve. The tangent follows, tilting down, then flat, then up. Each point has its own slope — at the valley floor, the slope is exactly 0.00."

### STATE_7 — "The Algebra Behind the Number" (advanced)
`reveal-build` · cue "Cancel h, then shrink it." · advanced · no controls.
**Motion:** `sec` restored, declared entry `h=0.8, x0=1`, revealed @1000. Four lines @3000/8000/13000/18000 (+600 each).

| Line | Content |
|---|---|
| line1 @3000 | `(f(x₀+h) − f(x₀)) / h` |
| line2 @8000 | `= x₀ + h/2` (the cancellation) |
| line3 @13000 | `lim_{h→0} (x₀ + h/2)` — **first appearance of formal `lim` notation anywhere in this concept** |
| line4 @18000 | `f′(x₀) = x₀` |

**Checked:** `x0=1.00, h=0.800 ⟹ x0+h/2 = 1.4000` — matches `sec.readout` at this entry exactly (verifiable on screen via the x₀/h chips, P3-12).
**Focal:** `focal_sequence`, 5 windows: `sec` (0–3000) → `line1` (3000–8000) → `line2` (8000–13000) → `line3` (13000–18000) → `line4` (18000–24000).
**Primitives:** `plane`, `curve`, `P`, `sec` (bare readout, 4 dp), `line1`–`line4`, `x0_chip` (`x₀ = 1.00`, x=510), `h_chip` (`h = 0.800`, x=510).
**Narration (46 words; the ONLY state below explore permitted formal-limit language):**
> "Expand the chord's slope algebraically: x-naught plus half of h — the extra half-h is the gap's cost. At x-naught equals one, h equals 0.800, this gives 1.4000, matching the chord. Only the limit, as h shrinks to zero, removes that term and names the derivative."

### STATE_8 — "Every Slope Collected: a New Function" (advanced)
`accumulate` · cue "Slopes drawn as heights." · advanced · no controls (φ-law: `u` never a slider).
**Motion:** `curve` dims 0–2500. `u` −1.6→1.6, start 2500, dur 14000. `ghost_fprime` reveals @17000.
**Checked:** `t=14400: u=1.12 → marker8=(1.12, 0.6272) → "(1.12, 0.63)"; fprime_head=(1.12, 1.12)` · `t=16500: u=1.6000 exact` · trace samples 176 ≤ 240.
**Focal:** static `focal_primitive_id: "fprime_head"` (present from t=0).
**Primitives:** `plane`, `curve` (dimmed), `marker8` (`body`, `position_expr {x:"u", y:"u*u/2"}`), `seg_tan` (`tangent_line`, `extend:"segment"`, `at_expr {x:"u",y:"u*u/2"}`, `slope_expr:"u"`, no readout), `fprime_trace` (`locus_trace`, `x_expr:"u"`, `y_expr:"u"`), `fprime_head` (`body` at `(u,u)`), `ghost_fprime` (`function_plot`, `y_expr:"x"`, `x_domain {min:−1.6, max:1.6}`, style `"dashed"`, `appear_at_ms: 17000`).
**Interval honesty executed in the text:** the narration says **"for this curve"** — not "for every curve".
**Narration (43 words):**
> "Now watch the slope itself, not the curve. As u sweeps, its slope at each point is traced as a new height. For this curve, those heights line up on a straight line — the derivative, collected as its own function."

**Recommended (not authored) reveal-timing safety:** bind `ghost_fprime` to the narration's final clause via the engine's cue mechanism rather than a bare `appear_at_ms: 17000`, so a pacing trim cannot desync the claim from the line's appearance. THE EYE never posts `SET_CUE_TIME`, so frozen baselines stay on the authored fallback — no determinism risk.

### STATE_9 — "Explore: Drag Both Points"
`drag-sandbox` · core · **ALL controls**: draggable Q (`xq ∈ [−1.9, 2.0]`), draggable P (`x0 ∈ [−1.6, 1.6]`) · `interaction_complete` · **narration 0 words / open** (Rule 31; Rule 37 — clock free-runs, never auto-freezes).
**Motion:** `xq` ping_pongs 1.9↔1.1, start 2500, 8000 ms/leg, until seized. **`Q` authored BEFORE `P`** in `scene_composition` so Q wins the press claim near P (P3-13; hit radius ≈20 px, earlier-in-scene wins).
**Checked:** drag quantum `1/80 = 0.0125` → min reachable `|h| = 0.0125` → `slope = 1.00625` → `toFixed(4) = "1.0063"` (node-verified). The −0 clamp threshold (0.0005) < quantum (0.0125), so it never fires under drag — h always reads a real non-zero value at the finest reachable park.
**Primitives:** `plane`, `curve`, `P` (draggable), `Q` (draggable), `sec` (bare readout 4 dp, `to_expr.x = "xq"`, NOT `"x0+h"`), `tan` (no readout), `tan_label` (2 dp), `h_chip` (`h = xq − x0`, 3 dp).
**No narration** — the M3 payoff is delivered by the teacher's own drag: however close Q is parked, `sec` still draws and its readout never reaches `1.0000`.

---

## 4. Notation ladder (Rule 38c)

**Core + extended (S1–S6, S9): algebra and geometric forms ONLY.** "Rise divided by run", "the chord's slope", "the point's slope", `x₀ + h/2` as prose algebra, "the number the values are approaching". **No `lim`, no ε-δ, no derivative-operator notation (`f′`, `dy/dx`) anywhere in S1–S6 or S9.**
**Advanced (S7, S8) ONLY:** `lim_{h→0}(…)` (S7 line3, first and only appearance); `f′(x₀)`, `f′(x)` (S7 line4, S8's surface). No vector-operator notation, no induction.
**Cut-coherence (38a/38b), re-verified sentence by sentence:** hiding S7+S8 leaves S1–S6, S9 — no survivor renders `lim`, `f′`, or the `x₀+h/2` chip, and no core narration forward-references S7/S8 content. Explore surfaces core content only (chord/tangent/readouts, rise-over-run register) — no `f′`, no `lim` (38b). Extended ring empty by design; Cut 2 ≡ Cut 1 by identity.
**Dialect (38d), once then bare:** "chord (secant line)" — S2 only. "slope (gradient)" — S2 only, term-only, no live number in that string. Every later state uses bare "chord"/"slope".
**Interval notation:** never used on canvas — no board-dialect conflict to declare.

---

## 5. Drill-down clusters (9 × 5)

**S3 — `average_rate_vs_point_rate`**
1. "isn't the chord's slope just the average speed over that bit, not the real speed at the point?"
2. "why does picking a different second point change the answer if we're still measuring at the same P?"
3. "how is 'the slope at one point' even a thing if slope needs two points to begin with?"
4. "if I use a huge gap I get a totally different number — so which one is the real slope?"
5. "does it matter which side I slide Q in from, left or right?"

**S3 — `does_it_ever_stop_changing`**
1. "how do I know the number has actually settled and isn't still slowly changing?"
2. "what if it looks like it's settling but then changes again further out?"
3. "why does it matter that the number keeps getting closer instead of just jumping straight to the answer?"
4. "could the number settle on a different value if I zoom in more carefully?"
5. "is there a smallest h where the number finally becomes exact?"

**S3 — `which_number_is_the_real_slope`**
1. "why isn't the very first reading, at the biggest gap, good enough?"
2. "so is 1.0050 the actual slope, or is it still just close?"
3. "why do we trust the number the chord is heading toward instead of any number it actually shows?"
4. "does the settling number belong to the chord or to the point P?"
5. "if the readout never lands exactly on the answer, how do we know what the answer even is?"

**S4 — `why_cant_we_just_plug_in_zero`**
1. "why can't I just put h equals zero into the formula and get the answer directly?"
2. "the top and bottom both go to zero — doesn't that just cancel out to a normal number?"
3. "in every other formula plugging in a value works, so why not here?"
4. "isn't zero divided by zero technically just zero?"
5. "if the formula breaks at h equals zero, how can the slope AT that point even exist?"

**S4 — `what_does_undefined_actually_mean`**
1. "is 'undefined' the same as saying the slope is zero?"
2. "if something is undefined, doesn't that just mean it's a really big number?"
3. "why is zero over zero different from just being zero, or just being infinite?"
4. "does undefined mean the curve has no slope there at all?"
5. "why does two points becoming one point break the whole calculation?"

**S4 — `limit_as_a_target_not_a_value_there`**
1. "if the value never actually happens at h equals zero, how can we call it the answer?"
2. "isn't a limit just a guess about what the number would be?"
3. "why do we trust a number the chord never actually reaches?"
4. "how is 'the values were getting closer to 1.0000' different from just saying it equals 1.0000?"
5. "does the limit change if we approach from the other side, with h negative?"

**S5 — `does_the_chord_become_the_tangent`**
1. "if the lines look exactly the same, why do we say they're two different lines?"
2. "at some point doesn't the chord just turn into the tangent line?"
3. "why do the numbers matter if the picture already shows one line?"
4. "how can two lines be different if I genuinely cannot see any gap between them?"
5. "is the tangent just the chord at the smallest possible h?"

**S5 — `why_a_new_line_at_all`**
1. "if the slope number already tells us the answer, why do we need to draw a whole tangent line?"
2. "what does the tangent line actually add that the number by itself doesn't?"
3. "is the tangent line just there to look nice, or does it mean something specific?"
4. "why is the tangent drawn touching only at P and nowhere else nearby?"
5. "could there be more than one line with the same slope through P?"

**S5 — `what_makes_tangent_special`**
1. "what actually makes a line 'the' tangent instead of just some line through P?"
2. "why does the tangent only touch the curve at one point here, when curves can cross lines twice?"
3. "is this the same idea as a tangent to a circle?"
4. "if I picked a slightly different slope, would the line still look tangent to my eye?"
5. "why can't the tangent just be defined as the closest line to the curve near P?"

---

## 6. Constraint callouts (domain first)

1. **`h ≠ 0` at every rendered chord.** The quotient is undefined at h = 0; `f` has no excluded point anywhere. S4's exact-zero collapse is choreography-only, never teacher-drivable.
2. **`chord_slope` has exactly ONE live readout, ever** (`sec.readout`, bare `"slope = {m}"`, 4 dp). No label/`text_expr` may render the chord slope — this keeps the h=0 safety intact. `tangent_slope = x0` is legal at every h including 0 and IS the one quantity a placed label may carry.
3. **Column content starts at x ≥ 510, not 480** (binding on S4, S5, S6, S7, S9). S5's tangent label additionally moves to y ≈ 242 (Note 5).
4. **Pixel↔data scale factor, declared once, reused verbatim:** `k = 80 px/unit`, both axes, origin px `(252, 294)`. Every `*_expr` uses this via `plane_id` — no expression ever hand-derives a pixel coordinate.
5. **h-law + φ-law + one-choreography-entry-per-variable** (verified per state; zero duplicate-variable entries). `u` is never a slider, never drag-bound (both Gate 9(d) doors pass by construction).
6. **No slider anywhere in this concept** (the caption trap `toFixed(step<1?1:0)` would print `h: 0.0`).
7. **No `radians()` anywhere** — every quantity is unitless and angle-free.
8. **Reader-facing nouns:** "chord (secant line)" once (S2), bare after; "slope (gradient)" once (S2, term-only), bare after; "gap", "tangent" plain.
9. **Every geometric noun in narration maps to a drawn primitive in that same state** — audited state by state; no violation found.
10. **Precision never changes mid-concept for a given instrument:** chord always 4 dp; tangent 4 dp only in S5, 2 dp in S6/S9; coordinates 2 dp; h 3 dp.

---

## Numerical sanity check — full log (run, not eyeballed)

```
closed form (hand algebra, verified): f(x0+h) = (x0^2+2x0h+h^2)/2; minus f(x0)=x0^2/2; over h => m(x0,h) = x0 + h/2  [exact]
tangent_slope = lim_{h->0}(x0+h/2) = x0 ; f'(x)=x
S2  h=1,x0=1                 -> m=1.5000
S3  hold h=0.5               -> m=1.2500
S3  hold h=0.1               -> m=1.0500
S3  pin  t=14400, h=0.065063 -> m=1.0325
S3  end  t=20500, h=0.01     -> m=1.0050
S4  crossings: h=0.1@5313.8ms, h=0.01@9156.9ms, h=0.001@13000ms; h_eff(13500)=0 exact, valid=FALSE
S5  pin  t=13200, h=0.0040452 -> sec=1.0020 ; tan=1.0000 ; separation ~0.55px
S5  end  t=16000, h=0.001    -> sec=1.0005
S6  t=12000: x0=0.753846 -> "0.75" (2dp render) ; t=15000: x0=1.4000 exact ; valley x0=0 -> 0.00 exact
S7  x0=1, h=0.8 -> m=1.4000000000000001 -> "1.4000"
S8  t=14400: u=1.12 -> marker8=(1.12,0.6272)->"(1.12,0.63)"; fprime_head=(1.12,1.12) ; t=16500: u=1.6000 exact
S9  quantum=1/80=0.0125 -> slope=1.00625 -> toFixed(4)="1.0063" [node-verified]
item1: (f(3)-f(1))/(3-1) = 2.0 ; item5: f'(-1) = -1 ; item6: f'(x) = x
item7: f=3x, chord slope = 3.0 for h in {1, 0.5, 0.1, 0.001} [floating-point noise <= 3e-13]
domain/range of f: R / [0,inf), vertex (0,0)
```

---

## Self-review checklist

- [x] Every quantity in the skeleton's narratives is declared with a domain matching §2 (`h` documented as a per-state expression, not a raw variable — matches the h-law).
- [x] Domain & validity ledger complete; every "for all"/"always"/"never" claim traced to a named fact with hypotheses checked against THIS setup.
- [x] No caption/narration generalises beyond scope — S8 says "for THIS curve".
- [x] Every state's archetype is [LIVE] on the merged `cartesian_plane`; none needs an unbuilt scenario.
- [x] Rule 31 timeline per state, pure function of the state clock; the S3/S5 contrast pair is the only shared archetype; no static state; controls match the architect table; explore = ALL controls, 0 narration.
- [x] Rule 32 sequencing verified per state (cause-before-effect via reveal order, never staggered drivers — checked explicitly against the correspondence scar). Rule 33 register-triangle + a real number per state. Rule 34 one surface per state, transcribed.
- [x] Word budget verified per state against its skeleton window (S1 36 · S2 39 · S3 47 · S4 45 · S5 39 · S6 31 · S7 46 · S8 43 · S9 0/open).
- [x] Notation ladder: no `lim`/`f′` below S7/S8; dialect dual-labels exactly once (S2).
- [x] Pixel↔data scale factor declared once (k=80, origin (252,294)) and reused verbatim.
- [x] Exact-before-decimal: no irrational value anywhere (2d) — the doctrine is display granularity, not truncation risk.
- [x] 45 drill-down phrasings across 9 clusters — plain English, real student voice, no Hinglish, no textbook prose.
- [x] `constraints`: 6 in the engine_config proper + 10 state-specific callouts, domain-first.
- [x] Numerical sanity check RUN via python3/node — full log above; every skeleton-cited pin independently reproduced to the digit.
- [x] Engine bug queue consulted (own sweep); every relevant prevention_rule satisfied except one genuine tension, FLAGged rather than silently resolved.
- [x] Rule 41 sweep: no idioms, no personification. "Settle"/"rotate"/"approach" retained as literal, precedented house vocabulary; the forbidden M3 phrasing ("the chord reaches/becomes the tangent") appears nowhere.
- [x] Assessment answers re-verified (7/7, python-checked); every distractor traces to a named misconception.

**Source check line:** *Consulted the NCERT Class-11 Mathematics chapter index (Limits and Derivatives) and the named international specifications (IB DP AA guide, AP Calculus CED, Cambridge 0606, A-level Pure) for SCOPE only, feeding the skeleton's `curriculum_tags` (unchanged by this pass — no new curriculum claim authored). NCERT Exemplar for misconception belief only. No teaching method, example, or figure imported. HC Verma / DC Pandey not consulted (physics-only).*

---

## FLAGS

**FLAG 1 — S5's focal plan dims one side of the exact relation the state exists to teach.** Found via the engine bug queue, **not silently fixed.** The prevention rule `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` reads: *"if the state's claim is a RELATION between two overlays, author no glow_focal… After ANY restructure, re-run this test over the NEW state list."* S5's whole claim (M3: picture-merges / numbers-refuse) is exactly that kind of relation. The approved `focal_sequence` (`P→tan→sec→tan`) puts window 3 (`sec`, 4000–14000) over the state's own pin (13200). At that instant `sec` glows at full brightness while `tan` AND `tan_label` (a different primitive id) both sit at `alphaMul: 0.6` — **the exact frame where the payoff "chord 1.0020 vs tangent 1.0000" is captured for THE EYE renders one half of the comparison dimmed.** This was checkpoint-approved with zero P1/P2 at cycle 2, so either it was judged acceptable (0.6α is dimmed, not hidden — both numbers remain legible, just unequal in emphasis) or it was not cross-referenced against this scar row, which lives on an unrelated physics build.
**Candidate fix, NOT authored here — for founder_proxy/quality_auditor to weigh:** split window 3 into `sec` (4000–12800) → a bridging window with NO `highlight_primitive_id` (12800–14000, bracketing the pin — falls through to "no focal declared", nobody dims) → `tan` (14000–22000, unchanged). Every other window identical; emphasis is removed only during the exact comparison beat.

**FLAG 2 — probe-before-authoring on the two new S2 dual-label positions.** `chord_dual_label` and `slope_dual_label` were designed by hand-computing the plane transform, not by executing p5 `textWidth()` against the live P/Q readouts. The estimate shows ≥20 px clearance against every existing readout, but that is arithmetic, not a render. Recommend a THE EYE collision check on S2 specifically before sign-off — genuinely new content Checkpoint A's pixel math never covered.

**FLAG 3 (informational, not a defect) — `PEDAGOGY_NO_FOCAL`.** A generic gate ("every state declares `focal_primitive_id`") exists against `alex:json_author`. S9 (explore) authors no focal, per the skeleton's own Rule-32 plan and the explore-exempt convention used elsewhere in this codebase. Noted so the gate firing is treated as needing an explore-state exemption, not as a defect in this design.
