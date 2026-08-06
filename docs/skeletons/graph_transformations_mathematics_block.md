# MATHEMATICS BLOCK — `graph_transformations` (mathematics_author)

> Consumes the APPROVED skeleton (`DESIGN_OK`, Checkpoint A cycle 2 —
> `graph_transformations_skeleton.md`). This block adds rigor, narration and per-state
> authoring detail. It does **not** redesign — every P1/P2/P3 fix, the state count, the
> parent-function decision, the ring assignment and the choreography numbers are treated as
> settled and are **transcribed**, never re-derived.

## 0. Engine bug queue consultation — RUN

```sql
SELECT bug_class, prevention_rule, owner_cluster, severity
FROM engine_bug_queue
WHERE status = 'FIXED'
  AND subject IN ('mathematics','subject_neutral')
  AND owner_cluster IN ('alex:mathematics_author','alex:physics_author','alex:chemistry_author',
                         'alex:json_author','peter_parker:runtime_generation');
```

**36 rows returned.** All dispositioned by inheritance through the skeleton's §13 plus this block's
own authoring choices. Rows binding on THIS role specifically:

- `narration_names_a_reference_line_the_scene_never_draws` — every geometric noun phrase in §5 is
  cross-checked against a drawn primitive per state (table §5.1).
- `hud_prints_negative_zero_on_a_value_only_instrument` — S4's `a`-caption crosses zero during the
  ramp; clamp required before format (routed to json_author by the skeleton, restated as binding).
- `rejected_claim_survives_unswept_surface` — swept my own narration for "reasonable" (S3 guess) and
  bare "the peak" (S4) — **zero hits** (§5.1).
- `ascii_minus_in_oncanvas_math_from_tofixed` — S4's `a` readout passes through negative values; a
  live risk for json_author's implementation, not something narration can fix.
- `authored_annotation_asserts_a_value_its_own_state_control_can_falsify` — confirmed none of my
  narration strings assert a value a control in that state can falsify (§5.1).
- `teach_visual_must_match_narration` (OPEN, bound onto this concept by §13) — every claim in my
  narration is checked against a drawn/animated primitive; see §5.1.

`graph_transformations` itself returns **0 rows** (new id, re-confirmed this session).

---

## 1. Domain & validity ledger — THE CENTRAL ARTIFACT

### 1.1 Relations drawn, by state

| Relation | Formula | States | Domain | Range | Excluded points | Drawn interval (x) |
|---|---|---|---|---|---|---|
| Parent | `y = sin x` | S1 (draws in), S2–S8 (dim ghost) | ℝ | `[−1, 1]` | none | `[−6.5, xdraw(t)]` → `[−6.5, 6.5]` in S1; `[−6.5, 6.5]` fixed S2–S8 |
| Full transform | `y = a·sin(b(x−h)) + k` | S1 (identity), S2–S8 | ℝ, for every `(a,b,h,k)` in range (`b ≠ 0` always) | `[k − |a|, k + |a|]` | none | `[−6.5, 6.5]` |
| S3 guess curve | `y = sin(x + hg)`, `hg ∈ [0, 2]` | S3 only | ℝ | `[−1, 1]` | none | `[−6.5, 6.5]` |
| S5 width bracket | data segment `(0, −1.6) → (2π/b, −1.6)`, `b ∈ [1, 3]` | S5 only | — (a drawn segment) | — | — | `x ∈ [0, 2π/b] ⊂ [0, 6.283]`, `y = −1.6` |
| P (parent peak) | `(π/2, 1)` | S1 | — | — | — | inside frame |
| P′ (image of P) | `(π/2/b + h, a + k)` | S2–S8 | every `(a,b,h,k)` in range (`b ≠ 0`) | `x ∈ [−1.48, 5.14]`, `y ∈ [−3.5, 3.5]` over the S8 product | none | inside frame at every reachable combination |

**No relation in this concept has an excluded point, an asymptote, or a discontinuity, anywhere, for
any authored control value.** `sin` is entire; the full transform is `sin` composed with an affine
map plus an affine map, and affine maps preserve "defined everywhere." The only way an excluded
point could appear is `b = 0` — which would degenerate the transform to the constant `k` (a flat
line masquerading as the taught relation, not an excluded point but a worse failure). **This is
prevented structurally, not by convention:** the slider floor is `1.0` on S5 and `0.5` on S8, both
strictly `> 0`, so `b` never reaches its own degenerate value anywhere in the authored ranges.
Consequence: **F9 (D4 break-on-discontinuity) is never exercised by this concept** — a domain fact,
not merely a pixel fact.

### 1.2 The drawn interval is not the domain — stated per state

Every curve's **mathematical domain is ℝ**. The **drawn interval is `x ∈ [−6.5, 6.5]`** (S2–S8) or
growing toward it (S1). This gap is exactly where false generalization lives, so:

- **No caption, chip, or narration sentence may say or imply "for all x," "everywhere," or "always"
  about the shape repeating or the curve continuing.** None does — checked against every narration
  string in §5 and every chip/label the skeleton authored (S6's two claim chips, S7's four
  arithmetic chips, S5's bracket label).
- **Boundary behaviour at `x = ±6.5`:** the curve simply **stops being drawn** — a viewport fact,
  not a mathematical one. `sin` is exactly as finite, continuous and defined at `x = 6.51` as at
  `x = 6.49`. This must never be narrated as the function "ending."
- **S1's boundary is time-varying:** nothing drawn before 1000 ms; `[−6.5, xdraw(t)]` while `xdraw`
  ramps 1000→13000 ms; full `[−6.5, 6.5]` from 13000 ms. A pacing choice — S1's narration describes
  the ANIMATION, never the function's extent.

### 1.3 Every "for all"/"always"/"never" claim — theorem, hypotheses, hypothesis-check

| # | Claim (where) | Theorem underneath | Hypotheses | Verified against this setup |
|---|---|---|---|---|
| T1 | Atomic claim / concept name: "four numbers reshape **any** graph" | **Graph transformation under affine argument substitution.** For any `f`, any reals `a, k`, and any reals `b ≠ 0, h`: the graph of `y = a·f(b(x−h)) + k` is obtained from `y = f(x)` by the point map `(x₀, f(x₀)) ↦ (x₀/b + h, a·f(x₀) + k)`. A direct algebraic consequence of substitution (solve `u = b(x−h)` for `x`), never an empirical fact about a particular `f`. | `b ≠ 0` (else the map is not invertible and the inside operations degenerate) | **Satisfied structurally**: `b`'s floor is `≥ 0.5` everywhere, so `b ≠ 0` is guaranteed, not assumed. The theorem is DEMONSTRATED on the one parent drawn (sine) and **licensed for any f** only via S7's abstract surface `f(x) → a·f(b(x−h)) + k` — which is why P1-3's fix and S7's first narration sentence are load-bearing, not decorative: they are the ONLY mechanism discharging the generality claim. **Scope boundary (matches §1 of the skeleton):** this concept never shows the DOMAIN half of the transform for a restricted-domain parent (`√x`, `log x`) — only the point-mapping half, which is domain-agnostic by construction. No narration claims anything about domain transformation for any parent but sine (domain ℝ, so the question never surfaces on screen). |
| T2 | S6 chips: "outside — acts on y, same direction" / "inside — acts on x, opposite direction" (PRIMARY aha) | `k` outside-additive: shifts vertically by exactly `k`, same sign — literal reading matches effect. `a` outside-multiplicative: heights scale by exactly `a` — literal reading matches. `h` inside-additive: shifts horizontally by `+h` — the OPPOSITE of the naive reading of the written `−h`. `b` inside-multiplicative (`b > 0` here): width scales by `1/b` — the RECIPROCAL of the written `b`. | `b > 0` for the width half to read as a simple "opposite" (for `b < 0` the transform also reflects, compounding with `a`'s reflection — deferred scope) | **Satisfied**: `b ∈ [0.5, 3]` (S8) / `[1, 3]` (S5), strictly positive wherever this claim is made or explored. `a = 0` and `h = 0` are reachable on S8 (both degenerate: `a=0` collapses to `y=k`; `h=0` is no shift) — neither is a FALSE instance, both are the trivial case with no motion to compare a direction against. No chip or narration asserts the claim AT those points; the chips fire at S6's pin where `k=1, a=1.5, h=1, b=2` — all four non-degenerate. |
| T3 | S3 misconception fix (M1): "x − h asks for a larger x to give the old value — the curve moves right" | Special case of T1's inside-additive half. The point at `x₀` on the parent reappears on `y = f(x−h)` at `x = x₀ + h`; for `h > 0` strictly to the right. | none beyond T1's | S3's choreographed `h` ramps `0 → 2`, always `≥ 0` — "moves right" is asserted only for the sign actually shown, never generalized to `h < 0`. (`h < 0` IS reachable in S8's `[−2,2]`, where the correct — and unstated, S8 carrying no narration — behaviour is a left shift, fully consistent with T1.) |
| T4 | S5 misconception fix (M2): "b multiplies x before sin acts — the width divides by b" | Period of `sin(b(x−h))` is `T = 2π/b` for `b > 0` (solve `bT = 2π`). | `b > 0` | **Satisfied** (S5 floor 1.0). Bracket labels `6.28 → 4.19 → 3.14 → 2.51 → 2.09` for `b = 1, 1.5, 2, 2.5, 3` verified independently (§6). |
| T5 | S4 design note: `a = −1` is visually identical to `h = π` | `sin(x − π) = −sin(x)` (angle subtraction: `sin x cos π − cos x sin π = −sin x`). | none (holds for all real `x`) | **Verified numerically** (§6): `−sin(1.0) = −0.8414709848…`, `sin(1.0 − π) = −0.8414709848…`, agree to float precision. **Note, not a defect:** `h`'s range tops out at `2 < π ≈ 3.14159`, so a teacher can never reproduce this coincidence on screen with both sliders. The disambiguation (P′ travels a straight vertical line in S4, which an h-shift could never do) addresses the student's general trig intuition, not something reachable inside this concept's control ranges. Stated so json_author does not read the coincidence as something the sim must visually resolve within its own bounds — it cannot occur there. |

**No claim in this concept is true only on the drawn interval and false off it** — every theorem is a
true statement about functions/transformations, not about a windowed picture, and every hypothesis
(chiefly `b ≠ 0`, `b > 0`) is satisfied **structurally** by the authored slider floors.

---

## 2. Quantity declarations — `engine_config` (UNITLESS)

**Design decision, explicit (fills a gap the skeleton left open):** all four parameters use
**step = 0.5** uniformly. The skeleton states step 0.5 for `a`, `h`, `k` but leaves `b`'s step
unstated. I extend the same step to `b` because (1) it is the only step under which **every**
node-probed hold/pin value in §12 (`b = 1.0, 1.5, 2.0, 2.5, 3.0`) sits exactly on the 1-dp
slider-caption display grid, directly satisfying the bound scar
`choreography_hold_value_off_the_slider_caption_grid_contradicts_the_coordinate_readout`; and
(2) three sliders snapping at 0.5 with a fourth dragging continuously would be a UI inconsistency
with no pedagogical purpose. This touches no authored RANGE — only granularity.

**Ruling made explicitly:** `a scales every height` replaces `a rescales every height` on S4's delta
cue. `rescales` is not wrong, but `scales` is plainer (Rule 41c — a Class-11 ESL reader parses
`scale` directly off the noun "scale factor" already in use; `re-` adds a parsing step for no gain
in precision). My S4 narration uses `scales` for consistency.

```jsonc
// physics_engine_config.variables — the four sliders. "step" is NOT a field
// this schema reads (confirmed: zero hits for "step" in conceptJson.ts's
// variable shape) — it belongs on the scene_composition slider PRIMITIVE per
// state, not here. Deliberately kept OUT of this JSON (the wrong-nesting-level
// scar, §0); listed in the table below for json_author's slider authoring.
"variables": {
  "a": { "name": "vertical stretch factor", "min": -2, "max": 2, "default": 1 },
  "b": { "name": "horizontal stretch factor (compresses the input before sin acts)", "min": 0.5, "max": 3, "default": 1 },
  "h": { "name": "horizontal shift", "min": -2, "max": 2, "default": 0 },
  "k": { "name": "vertical shift", "min": -1.5, "max": 1.5, "default": 0 },

  // Choreography-only — NEVER authored as sliders anywhere in this concept.
  // (This concept authors zero locus_trace primitives so the phi-LAW does not
  // literally apply — these are ordinary function_plot domain/offset drivers,
  // still never slider-bound.)
  "xdraw": { "name": "S1 draw-in edge — the parent's growing right boundary", "min": -6.5, "max": 6.5, "default": -6.5 },
  "hg":    { "name": "S3 guess-curve offset (the WRONG sweep, never the real h)", "min": 0, "max": 2, "default": 0 }
},
"formulas": {
  "transform_y": "a*sin(b*(x-h))+k",
  "parent_y": "sin(x)",
  "guess_y": "sin(x+hg)",
  "p_prime_x": "PI/2/b + h",
  "p_prime_y": "a*sin(PI/2) + k",
  "bracket_width": "2*PI/b"
},
"computed_outputs": {
  "p_prime_x":     { "formula": "PI/2/b + h" },
  "p_prime_y":     { "formula": "a*sin(PI/2) + k" },
  "bracket_width": { "formula": "2*PI/b" }
},
"constraints": [ /* §9 below — domain-first, 6 assertions */ ]
```

**`variable_overrides`, documented:**

| State | Override | Why |
|---|---|---|
| S5 | `b.min: 1.0` (global default `0.5`) | S5 teaches squeezing only; `b < 1` is not its content, and at `b = 0.5` the bracket (`2π/0.5 = 12.57`) would exceed the 13-unit frame (P2-3). Narrowing S5's own floor is what makes the containment walk hold. |
| S5 | `b.max: 3.0` (same as global) | No change; listed for completeness against the control table. |

**Symbol precision** (transcribed from §11b as the contract this block relies on): `a, b, h, k` render
at **1 dp** via the slider caption (hardcoded `toFixed(step<1?1:0)`, step 0.5 ⇒ 1 dp, @4580); P′'s
coordinate readout at **2 dp** (`plot_point.readout.decimals: 2`); the S5 bracket's
`width = 2π/b = {…}` label at **2 dp**. **No quantity has two readouts at different precision** —
one quantity, one readout, everywhere.

---

## 3. Within-state motion timeline + per-state control spec (Rule 31)

**Transcribed verbatim from the skeleton's §4/§12 (node-probed; no number changed.)**

| St | t-window (ms) | What animates | Driven by (exact profile) | Live controls | `eye_capture_ms` |
|---|---|---|---|---|---|
| S1 | 0–1000 frame reveal; 1000–13000 parent draws left→right; 13500 P + label | `function_plot` (parent), `x_domain.max_expr` following `xdraw` | `xdraw`: −6.5→6.5, once, start 1000, dur 12000 | none (watch beat) | `14500` |
| S2 | 0–1200 surface+term reveal; 1500–15500 lift, hold 9500–11500 at `k=1.0` | bright transform curve + P′ | `k`: 0→1.5, once, start 1500, dur 12000, holds `[{1.0, 2000}]` | **k slider** | `10500` |
| S3 | 1200–4200 guess slides left, frozen 4200–11000 (+800 fade); 6800–15800 real slides right (overlap 6800–11000, 4.2 s) | dashed guess curve (`hg`), bright transform curve + P′ (`h`) | `hg`: 0→2, once, start 1200, dur 3000 (then static — `once` holds its terminal value); `h`: 0→2, once, start 6800, dur 9000 | **h slider** | `13000` |
| S4 | 0–1200 surface; 1500–15500 sweep, zero-cross ≈5500 (pass-through, never dwelt), hold 9500–11500 at `a=−1.0` | bright transform curve + P′ (vertical line) | `a`: 1→−2, once, start 1500, dur 12000, holds `[{−1, 2000}]` | **a slider** | `12000` |
| S5 | 0–1200 surface; stepped: ramp→1.5@4500 dwell→5500; →2@8500 dwell→10500; →2.5@13500 dwell→14500; end 3@17500 | bright transform curve + width bracket + label | `b`: 1→3, once, start 1500, dur 12000, holds `[{1.5,1000},{2,2000},{2.5,1000}]` — ONE entry, hold LIST | **b slider [1, 3]** | `9500` |
| S6 | GROUPED: k 2000–5000 · a 7000–10000 · outside-chip 10500 · h 12000–15000 · b 17000–20000 · inside-chip 20500 | bright transform curve building through all four | four `once` ramps, one entry per variable, order `k, a, h, b` | none (timed build) | `21500` |
| S7 | b 2000–4500 · chip 4700 · h 6500–9000 · chip 9200 · a 11000–13500 · chip 13700 · k 15500–18000 · chip 18200 | one point hopping through 4 positions; curves dimmed to ghost | four `once` ramps, one per variable, order `b, h, a, k` | none (timed build) | `19500` |
| S8 | 0–2500 settle; k `ping_pong` 0.5↔1.5, 4 s/leg, from 2500, until any genuine drag | all live; k self-animates until seized | `k`: `ping_pong` 0.5↔1.5 (a, b, h at default `1, 1, 0` until dragged) | **ALL: a · b · h · k** (b ∈ [0.5, 3]) | none (`interaction_complete` skips the pin, Rule 37) |

**Rule 32 compliance (transcribed):** cause = reveal order (formula surface + the state's term reveal
at 0–1200 ms, before any ramp starts); only the taught variable's motion changes per guided state
(S3's overlap window moves only `h` — the guess is FROZEN, not moving); one focal per state
(`focal_primitive_id`): S1 pen→P · S2–S3 transform curve · S4 P′ · S5 transform curve · S6 transform
curve · S7 P′ · S8 none.

---

## 4. Notation ladder (Rule 38c)

**Compliant, no new content needed.** Core/extended states (S1–S6, S8) carry algebra-only forms:
`y = sin x`, `y = sin x + k`, `y = sin(x−h)`, `y = a·sin x`, `y = sin(bx)`,
`y = a·sin(b(x−h))+k`. **`f`-notation appears on exactly one surface, S7's, advanced ring.** No
derivative operator, no integral sign, no vector-operator form, no induction anywhere — none is
needed by the atomic claim. Dialect (38d): "parent curve (the base graph)" dual-labelled once, in
S1's narration, bare everywhere after. No interval notation (`[a,b]`) is ever rendered on canvas —
it lives only in this authoring document. No board-dialect conflict found.

---

## 5. Narration (`text_en`) — per state

**Authoring convention, ruled:** `P′` is written as the prime glyph (matching the skeleton's own
prose), not spelled out "P prime." **Flag to json_author / the TTS step (Rule 30g/30h, on-demand,
NOT a blocker now):** verify Sarvam bulbul:v3 pronounces `P′` intelligibly; if not, substitute
"P prime" at that stage only — a downstream audio concern, not a JSON or THE EYE blocker, since
audio is on-demand and `text_en` is correct either way.

| St | `text_en` | Words | Ceiling |
|---|---|---|---|
| S1 | *"Parent curve — the base graph. This is the sine curve — the height of a circling point, laid out flat. Whistle a steady note at a phone — its display shows this same wave shape."* | 33 | 33 |
| S2 | *"The dim ghost is the parent, sin x, held still. The bright copy is sin x plus k: as k rises from zero, the copy slides straight up by k. P′ rises with it — the peak's image."* | 37 | 38 |
| S3 | *"The dashed guess curve slides left, then freezes — the wrong direction. The real copy slides right instead: x minus h equals the old value only when x is larger. Both sit apart on screen until the guess fades."* | 38 | 39 |
| S4 | *"Outside multiplication differs from outside addition: a scales every height, not the position. As a runs from one to negative two, the copy shrinks, flips, grows twice as tall upside down. P′, the peak's image, travels straight down."* | 38 | 38 |
| S5 | *"Bigger b does not mean a wider curve — it means narrower. As b increases from one to three in counted steps, the width bracket shrinks: two pi over b. b multiplies x before sine acts, so the width divides by b."* | 41 | 42 |
| S6 | *"Two outside numbers move first: k lifts the curve, then a stretches it — both act on y, in the direction their sign says. Two inside numbers follow: h shifts the curve right, b squeezes it narrower — both act on x, in the opposite direction."* | 44 | 50 |
| S7 | *"Write f for whatever curve you started with — here it was sine. One point moves in four hops: divide its x by b, then add h; multiply its y by a, then add k. Order matters — divide first, then add."* | 40 | 45 |
| S8 | *(none authored — `interaction_complete`, teacher-driven, 0/open per Rule 31)* | 0 | 0 |

Every count is a manual token split (spaces; punctuation excluded), performed twice per state for
S1–S5 after a first draft overran. All within the 25–55 law and within each architect ceiling; none
padded to the ceiling where fewer words carried the idea (S6, S7 in particular).

### 5.1 Reference-noun sweep (`narration_names_a_reference_line_the_scene_never_draws`)

| St | Geometric nouns named in narration | Matches a drawn primitive in that state? |
|---|---|---|
| S1 | "parent curve", "sine curve" | ✓ `function_plot` (parent, drawing in) |
| S2 | "dim ghost", "parent", "bright copy", "P′" | ✓ ghost `function_plot`, transform `function_plot`, `plot_point` |
| S3 | "dashed guess curve", "real copy", "x minus h" (formula term) | ✓ guess `function_plot`, transform `function_plot`, `formula_box` term |
| S4 | "the copy", "P′" | ✓ transform curve, `plot_point` |
| S5 | "the width bracket" | ✓ `vector` (bracket) with its label |
| S6 | "the curve" (implicit, being built) | ✓ transform `function_plot`, mid-build |
| S7 | "one point" | ✓ `plot_point` hopping through its four positions |

**Zero unmatched references.** Also swept for the two forbidden phrasings: `"reasonable"` (S3 guess)
— 0 hits; bare `"the peak"` for P′ — 0 hits (every reference is `"the peak's image"` or `"P′"`).

---

## 6. Numerical sanity check — RUN (python3, not eyeballed)

```
S7 chain exact: pi/2 / 2 = 0.7853981633974483 -> +1 = 1.7853981633974483   y: 1*1.5=1.5 -> +1 = 2.5
  rendered: x: pi/2 / 2 = pi/4 ~= 0.79 -> +1 ~= 1.79 | y: 1 x 1.5 = 1.5 -> +1 = 2.5 -> P' = (1.79, 2.50)  OK
S2 endpoints: k=0 -> P'=(1.5707963267948966, 1.0);  k=1.5 -> P'=(1.5707963267948966, 2.5)  OK
S3: sin((pi/2+2)-2) = 1.0 == sin(pi/2) = 1.0  OK (the point at x=pi/2 reappears at x=pi/2+2)
S4 coincidence: -sin(1.0) = -0.8414709848078965; sin(1.0-pi) = -0.8414709848078966  OK float precision
S5: b=2 period = 3.141592653589793 (half of parent 2*pi = 6.283185307179586)  OK matches label 3.14
S8 worst-case |a|+|k| = 3.5 <= 4.0  OK 12.5% headroom, matches the containment table
S5 bracket at b=1 (S5's floor): width = 6.283185307179586, frame margin = 0.2168...  OK matches P2-3
Range [k-|a|, k+|a|] checked across every (a,k) the concept authors — every one inside [-4,4]  OK
```

Every number the skeleton claims in §⓿/§12 that touches actual MATHEMATICS (as opposed to pure pixel
measurement, the skeleton's own node-probe territory, not re-derived per instruction) reconciles
exactly against an independent computation.

---

## 7. Drill-down cluster phrasings — 5 per cluster, 9 clusters, 45 total

**S3 — `why_minus_h_moves_right`**
1. "Why does x minus h move the graph right? Minus should mean left."
2. "I thought subtracting a number always slides things backward, so why does the curve go forward?"
3. "If it's f of x minus h, shouldn't the curve just move left by h?"
4. "My teacher said inside the bracket everything flips — why does it actually go right here?"
5. "How is x minus 2 the same shape as x but pushed to the right? That feels backward."

**S3 — `inside_shift_direction`**
1. "Why does something inside the brackets move the whole curve sideways instead of up or down?"
2. "I get that k moves it up, but why does h inside do something totally different?"
3. "Does the graph move the same way the number moves, or the opposite way?"
4. "Why can't I just look at the sign of h and know which way it goes, the way I do for k?"
5. "If h is positive, why doesn't the curve just move in the positive direction like everything else?"

**S3 — `moving_curve_vs_moving_axes`**
1. "Is the curve actually moving, or is it the axes that are moving under it?"
2. "When we shift x by h, are we moving the graph or relabeling where zero is?"
3. "I keep imagining the y-axis sliding instead of the curve — which one is really moving?"
4. "If I moved the axes left instead of the curve right, would I get the same picture?"
5. "Why does shifting the input feel like moving the whole coordinate system to me?"

**S5 — `why_b_squeezes`**
1. "Why does multiplying x by a bigger number make the graph narrower instead of wider?"
2. "If b is 2, shouldn't the graph stretch out to twice the size, not shrink?"
3. "I multiply things to make them bigger everywhere else — why does this make the curve squeeze in?"
4. "How can multiplying x by 2 make the wave finish faster?"
5. "Doesn't a bigger number always mean a bigger graph? Why not here?"

**S5 — `period_from_b`**
1. "Why is the new period 2 pi over b and not just 2 pi times b?"
2. "Where does the divide-by-b in the period formula actually come from?"
3. "If b doubles, why does the period cut in half instead of doubling too?"
4. "I don't get why the period formula has b on the bottom, not the top."
5. "How do I find how many waves fit in the same space once b changes?"

**S5 — `horizontal_factor_is_one_over_b`**
1. "Why is the horizontal scale factor 1 over b and not just b?"
2. "If a stretches the graph by a, why doesn't b stretch it by b the same way?"
3. "Why do I have to flip b upside down to get the actual horizontal stretch?"
4. "I thought the number in front of x tells you the stretch directly — why is it inverted?"
5. "Is there a quick way to remember that inside numbers get flipped and outside ones don't?"

**S6 — `inside_vs_outside_rule`**
1. "How do I remember which numbers are outside and which are inside the function?"
2. "Is a outside or inside — I keep mixing it up with b."
3. "Why do outside numbers act on y directly but inside numbers act on x differently?"
4. "What's the actual rule for telling outside from inside just by looking at the equation?"
5. "If a number touches x before the function is applied, is that always inside?"

**S6 — `which_number_does_what`**
1. "With four letters — a, b, h, k — how do I keep track of which one does what?"
2. "Which of the four numbers changes the height, and which changes the width?"
3. "I always mix up h and k — which one moves it sideways and which one moves it up?"
4. "Is there an order I should check the four numbers in, or does it not matter?"
5. "How do I tell from the equation alone whether the graph got taller or wider?"

**S6 — `order_of_transformations`**
1. "Does it matter whether I stretch first or shift first, or do I get the same graph either way?"
2. "If I do the shift before the stretch, will the graph land in the wrong place?"
3. "Why do I have to divide by b before adding h, and not the other way around?"
4. "Is there a fixed order to apply a, b, h and k, or can I do them in any order?"
5. "When I map one point through all four numbers, which operation do I do first?"

---

## 8. `aha_moment` — authored to the schema's ≤15-word gate

The skeleton's Block 2 statement of the PRIMARY aha (21 words) is the pedagogical description; it
exceeds the **hard-enforced** `aha_moment.statement` gate (`conceptJson.ts` ~line 494, `wordCount > 15`
FAILS validation). Schema-compliant field:

```jsonc
"aha_moment": {
  "state_id": "STATE_6",
  "statement": "Outside numbers move y the way they say; inside numbers move x the opposite way.",   // 15 words
  "visual_confirmation": "the k-then-a pair completes before the 'outside acts on y' chip; the h-then-b pair completes before the 'inside acts on x' chip"
}
```

---

## 9. Validity constraints (domain-first, 6 assertions)

```json
"constraints": [
  "the full transform y = a*sin(b*(x-h)) + k is defined for every real x and every (a,b,h,k) in their authored ranges, with zero excluded points — the slider floor b >= 0.5 everywhere keeps b(x-h) from degenerating into a constant, structurally, not by convention",
  "the drawn interval is x in [-6.5, 6.5] in S2-S8 (S1 draws the same interval progressively); the underlying relation is defined on all of R — no caption, chip or narration string may claim the curve stops existing at the frame edge",
  "range of the drawn transform = [k - |a|, k + |a|], contained in [-4, 4] for every (a,k) in the full explore control product (worst case |a|+|k| = 3.5, 12.5% headroom) — D4 break-on-range-exit is never exercised by this concept",
  "P' = (pi/2/b + h, a + k) is the image of the parent's peak P = (pi/2, 1) under the full transform, recomputed fresh every frame from a, b, h, k — never accumulated, never interpolated between frames",
  "the S5 width bracket spans [0, 2*pi/b] in data x at fixed y = -1.6; at S5's own slider floor b = 1 this is 6.283 data units against a 13-unit-wide frame, an 0.217-unit margin — S5's b-range is deliberately narrower than S8's for exactly this reason",
  "every choreographed hold and every eye_capture_ms pin lands on a value exactly representable at 1 decimal place (the slider-caption display grid) — enforced by choosing all four parameters' step = 0.5, uniformly, a mathematics_author decision extending the architect's a/h/k step to b"
]
```

**Pixel↔data scale factor — explicitly N/A, stated rather than silently skipped.** The generic
hazard-7 discipline ("declare the pixel↔data scale factor once, reuse it verbatim") governs
PRE-`cartesian_plane` PCPL concepts, where every coordinate is a hand-carried pixel literal. This
concept is P0's first consumer: **every coordinate in every expression above is a DATA coordinate**,
resolved through the plane's registered transform (`PM_planeRegistry`/`PM_planeResolve`). No authored
expression in this block contains a pixel literal, and none should — this is precisely what Phase 0
was built to remove. **Degree↔radian conversion — N/A**: no slider represents an angle; `x` is sine's
native argument, never converted. **Log-scale display — N/A.** **Guard value at every excluded point
— N/A by construction**: §1.1 establishes there are zero excluded points anywhere.

---

## Self-review checklist (mathematics_author)

- [x] Every quantity in the skeleton's narratives (`a, b, h, k, xdraw, hg`) appears in §2, domain agreeing with §1.
- [x] Domain & validity ledger complete (§1): domain/range/excluded-points/drawn-interval/boundary for every relation; five claims (T1–T5) traced to a named theorem with hypotheses checked against the ACTUAL control ranges.
- [x] No caption or narration generalizes beyond the drawn interval (§1.2).
- [x] Every state's motion cites its skeleton-declared archetype (transcribed §3); archetype A, [LIVE], merged.
- [x] Rule 31 timeline transcribed exactly from the node-probed §12; word budgets checked per state (§5), each ≤ its ceiling and inside 25–55.
- [x] Rule 32 transcribed unchanged; no narration string contradicts the sequencing.
- [x] Rule 33 register-triangle + the real number per state carried from §4; narration never leads with the symbolic register on a core state (S7's `f`-lead is the sole advanced-ring exception, by design).
- [x] Rule 34 canvas budget untouched (this deliverable is narration + engine_config, not scene composition).
- [x] Notation ladder (§4): no formal notation below advanced; `f` confined to S7.
- [x] Pixel↔data scale factor explicitly discharged as N/A (§9) with the reason stated.
- [x] Exact forms on symbolic surfaces (`π/4`, `2π/b`), decimals in HUD/chips, `≈` exactly where P1-1 requires it — relied upon, never re-litigated.
- [x] Drill-down phrasings (§7): 45 total, genuine student-voice, plain English, no Hinglish, no textbook prose.
- [x] `constraints` (§9): 6 assertions, domain-first.
- [x] Numerical sanity check RUN via `python3` (§6), not eyeballed — every value reconciles.
- [x] Engine bug queue consulted (§0); every relevant `prevention_rule` satisfied or dispositioned.
- [x] Plain-language sweep (Rule 41) over every narration string: no idioms, no metaphors, no personified curves or numbers; two low-stakes rulings recorded (`scales` over `rescales`; `P′` glyph, flagged for a downstream TTS check).
- [x] `aha_moment` (§8): ≤15-word statement authored to the hard schema gate, mathematically true, tied to STATE_6 and its actual visual.

**Source check line:** *Consulted the NCERT Class-11 Mathematics chapter index (Relations & Functions;
Trigonometric Functions) and the named international specifications for SCOPE only (unchanged from the
architect's §11(i-3) tags, which I did not re-touch). NCERT Exemplar consulted for the M1/M2
misconception BELIEFS only (already fixed by the architect; I verified their mathematics, not their
sourcing). No teaching method, no example problem, no figure imported. HC Verma and DC Pandey not
consulted — physics-only, forbidden here.*

## Escalation

**None required.** No mathematical error found in the approved skeleton; no theorem cited outside its
hypotheses; no edge case (division by zero, discontinuity inside the drawn interval, one-sided-
nonexistent limit) surfaced — this concept genuinely has none, structurally, as §1 establishes. The
two low-stakes wording rulings requested were made explicitly (§2, §5) rather than silently decided.
