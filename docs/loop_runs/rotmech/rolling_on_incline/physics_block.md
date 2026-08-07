# PHYSICS BLOCK — `rolling_on_incline` (rotmech · Class 11 Ch.7 · 0b)

> Produced by `alex:physics_author` 2026-08-02 against **skeleton REV 6 (as amended)** after founder-proxy Checkpoint A returned **`DESIGN_OK`** (`founder_proxy_A_rev6_final.md`). P1-A is authored; **P2-B was checked and REJECTED with evidence** (see §3). Completes Phase 0b; the 0c-2 `field3d-surgeon` dispatch is authorised on skeleton REV 6 + this block.

**Numerical sanity check (run, reported inline):** at defaults (θ = 25°, g = 9.8) — drive = mg sin θ = **4.1417 N**, N = mg cos θ = **8.8818 N**; disc a = **2.7611 m/s²**, f_s = **1.3806 N**; the four S1 crossing times over the 4.5 m run reproduce **1744.2 / 1805.4 / 1903.1 / 2084.7 ms**; disc μ_min at 40° = **0.2797**, ring μ_min at 40° = **0.4195**; **μ_s = 0.90 holds a static disc to θ = 41.99°**, clearing the 20°–40° slider with margin. Every number in the skeleton's authored ground truth reproduces to the digit.

---

## 1. `physics_engine_config`

```json
{
  "variables": {
    "g": { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "theta": { "name": "incline angle", "unit": "deg", "min": 20, "max": 40, "step": 1, "default": 25 },
    "m":  { "name": "mass of the primary/racing body", "unit": "kg", "min": 0.1, "max": 8, "step": 0.1, "default": 1 },
    "R":  { "name": "radius of the primary/racing body", "unit": "m", "min": 0.05, "max": 0.35, "step": 0.01, "default": 0.15 },
    "m2": { "name": "mass of the comparison body (S4's small sphere / S8's second lane)", "unit": "kg", "min": 0.1, "max": 8, "step": 0.1, "default": 0.5 },
    "R2": { "name": "radius of the comparison body", "unit": "m", "min": 0.05, "max": 0.35, "step": 0.01, "default": 0.10 },
    "mu_s": { "name": "static friction coefficient — S7's live control (and the S7 param_ramp's parameter) and S8's", "unit": "", "min": 0.05, "max": 1.00, "step": 0.05, "default": 0.50 },
    "mu_s_S6": { "name": "static friction, S6's held disc ONLY — authored above the concept default so the hold survives the FULL 20-40 deg theta slider (P1-A condition 1). Never a live control.", "unit": "", "constant": 0.90 },
    "mu_k_S3_block": { "name": "kinetic friction, S3's locked (rotation_locked) skidding block. Identity constant, never a live control.", "unit": "", "constant": 0.15 },
    "mu_s_S3_disc": { "name": "static friction, S3's rolling disc — the concept default 0.50 (needs only >= mu_min = 0.1554 at 25 deg)", "unit": "", "constant": 0.50 },
    "mu_k_S7_ring": { "name": "kinetic friction, S7's ring once it slips (declared separately from the mu_s ramp's endpoint — both 0.05, but physically distinct coefficients that happen to share a value)", "unit": "", "constant": 0.05 },
    "k_solid_sphere": { "name": "shape factor k = I_cm/(m R^2), solid sphere", "unit": "", "constant": 0.4 },
    "k_disc":          { "name": "shape factor k, disc (uniform solid cylinder)", "unit": "", "constant": 0.5 },
    "k_hollow_sphere": { "name": "shape factor k, thin spherical shell", "unit": "", "constant": 0.6667 },
    "k_ring":          { "name": "shape factor k, ring / hoop / thin cylindrical shell", "unit": "", "constant": 1.0 },
    "N":     { "name": "normal force", "unit": "N", "derived": "m * g * cos(radians(theta))" },
    "drive": { "name": "gravity's component down the slope, mg sin(theta)", "unit": "N", "derived": "m * g * sin(radians(theta))" }
  },

  "formulas": {
    "N":                  "m * g * cos(radians(theta))",
    "drive":              "m * g * sin(radians(theta))",
    "a_rolling":          "g * sin(radians(theta)) / (1 + k)",
    "f_s_rolling":        "k * m * a_rolling",
    "mu_min":             "(k / (1 + k)) * tan(radians(theta))",
    "one_plus_k_over_k":  "(1 + k) / k",
    "a_S3_block_sliding": "g * (sin(radians(theta)) - mu_k_S3_block * cos(radians(theta)))",
    "f_k_S3_block":       "mu_k_S3_block * m * g * cos(radians(theta))",
    "f_s_S7_preslip":     "k_ring * m * g * sin(radians(theta)) / (1 + k_ring)",
    "a_S7_postslip":      "g * (sin(radians(theta)) - mu_k_S7_ring * cos(radians(theta)))",
    "f_k_S7_postslip":    "mu_k_S7_ring * m * g * cos(radians(theta))",
    "KE_trans":           "m * g * h / (1 + k)",
    "KE_rot":             "k * m * g * h / (1 + k)"
  },

  "computed_outputs": {
    "a_current":        { "formula": "the active body's live acceleration reading — 0 while stuck, a_rolling once released/rolling, a_S3_block_sliding / a_S7_postslip on their kinetic branches" },
    "f_current":        { "formula": "the active body's live friction reading — |drive| while stuck (never exceeds mu_s*N); f_s_rolling while rolling; f_k_S3_block / f_k_S7_postslip while sliding" },
    "mu_min_current":   { "formula": "mu_min at the body's live k and theta — drives the S7/S8 tick on the mu_s row" },
    "shrink_factor_S6": { "formula": "one_plus_k_over_k for the active shape — the S6 release payoff number, 3.00 for a disc" },
    "KE_split":         { "formula": "KE_trans, KE_rot for S5's two held bodies — both from the SAME mgh, split only by k" }
  },

  "constraints": [
    "a = g*sin(theta)/(1+k) — the rolling acceleration depends ONLY on theta and the shape factor k = I_cm/(m R^2); mass and radius cancel algebraically for every one of the four shapes.",
    "f_s = k*m*a while rolling holds. This is a direct function of m, theta and k — it does NOT depend on mu_s or mu_k. mu_s only gates WHETHER rolling holds (mu_s >= mu_min); once it holds, mu_s never enters the magnitude.",
    "Rolling requires mu_s >= mu_min = (k/(1+k))*tan(theta); below mu_min the contact slips and the branch falls to kinetic friction: f_k = mu_k*N, a = g*(sin(theta) - mu_k*cos(theta)).",
    "N = m*g*cos(theta) at every instant on this incline — normal force never depends on velocity, spin, or shape.",
    "KE_trans + KE_rot = m*g*h always, for a body released from rest and rolling without slipping through a vertical drop h; the SPLIT (ratio 1:k) depends on shape, the TOTAL never does.",
    "S6's disc is authored mu_s = 0.90, not the concept default 0.50 (P1-A). Verified: the hold test tan(theta) <= mu_s must clear the slider's WORST case, theta = 40 deg, tan(40) = 0.8391; 0.90 clears it across the whole 20-40 deg range (holds to theta = 41.99 deg). This changes NO post-release number: mu_min for a disc at 40 deg is only 0.2797, and f_s = k*m*a in the rolling branch never references mu_s.",
    "S3's disc (mu_s = 0.50) and S7's pre-slip ring (mu_s = 0.50) each need only mu_s >= mu_min at 25 deg (0.1554 and 0.2332) — both authored well above, so neither falls to the kinetic branch while rolling is the taught claim.",
    "The rolling branch SUPERSEDES the kinetic-friction branch whenever mu_s >= mu_min holds (branch-priority, `:45497-45499`); theta = 0 is the trivial test case and is never authored as a state here.",
    "Every body in every guided state (S1-S7) is released from rest: v0 = 0 and omega0 = 0. No state in this concept launches a body with a v/omega mismatch — that convergence story is pure_rolling's; this concept's S7 is the OPPOSITE regime switch (rolling -> slipping under falling mu_s)."
  ]
}
```

**Derivation (first principles — DC Pandey check below).** For a rigid body of mass m, radius R rolling without slipping down an incline θ — translational: mg sin θ − f = ma; rotational about the CoM: f·R = I_cm·α; rolling constraint: a = αR; I_cm = k·mR². Substituting: f = I_cm·α/R = k·mR²·(a/R)/R = **k·m·a**. Then mg sin θ − k·m·a = ma ⇒ **a = g sin θ/(1+k)**, and **f_s = k·m·a = (k/(1+k))·mg sin θ**. That is exactly S6's three-line formula reveal (`f·R = I_cm·α` @1600, `f = k·m·a` @1900, `a = g sin θ/(1+k)` @2200) — no line added or changed, only the algebra it encodes verified.

---

## 2. Per-state `variable_overrides`

| State | Body/ies | Overrides vs. defaults | Justification |
|---|---|---|---|
| S1 | 4 bodies | `m=1`, `R=0.15` for all four; `k` per shape — the shape roster, not an override | Baseline race; no deviation except the four fixed k identities |
| S2 | 1 disc | **`R=0.25`** (not the default 0.15); `s_finish=+0.4` | Recap continuity with `pure_rolling`'s own wheel radius (Rule 32d cross-concept apparatus continuity) |
| S3 | block (`rotation_locked`) + disc | Block: `mu_k=0.15`; `mu_s` moot — `rotation_locked` forces the kinetic branch unconditionally, the static test is never evaluated on this body. Disc: `mu_s=0.50`, **`activate_at_ms=1500`**, seeded s₀=+2.4, v₀=0. State flags: **`single_lane:true`, `lane_gap_m=0`** | Rule-16a contrast, one state, hard cut at activation |
| S4 | large sphere + small sphere | A: `m=5`, `R=0.30` (constants, not sliders); B: `m2=0.5`, `R2=0.10` (live). **Both `k=k_solid_sphere`** | The claim is "m and R cancel for a FIXED shape" — both bodies must share k or the demonstration proves nothing |
| S5 | sphere + ring | `m=1, R=0.15`; `s_finish=+0.034` (d = 2.366 m along-track ⇒ **h = 1.000 m**; verified 2.366·sin 25° = 0.99987) | Isolates the energy split on a clean 1.000 m drop |
| S6 | 1 disc | `k=k_disc`; θ slider 20–40; **`mu_s = mu_s_S6 = 0.90`** (P1-A, the critical value this pass adds); `activate_at_ms=2500`; `visible_before_activation=true` | The held-then-released derivation state; 0.90 keeps the hold genuine across the whole slider |
| S7 | 1 ring | `k=k_ring`; θ=25 fixed (only S6 exposes θ); `mu_s`: **`param_ramp {from:0.50, to:0.05, start_ms:600, end_ms:1600}`**; `mu_k=0.05` (distinct field from the ramp endpoint) | μ_s must actively fall below μ_min mid-state |
| S8 | four shapes, per lane | shape/m/R per lane; θ 20–40; μ_s 0.05–1.00 with the μ_min tick riding the row | Sandbox — every guided override becomes a live default |

---

## 3. Within-state motion timeline + per-state control spec (Rule 31)

| State | t-window | What animates (pure fn of state clock) | Driven by | Live control(s) |
|---|---|---|---|---|
| S1 | 0 → 1744/1805/1903/2085 | Four bodies descend from +2.4; each **halts at its own CoM crossing** of `s_finish = −2.1`, chip stamps 1-2-3-4 | closed-form `a_rolling` per shape | none |
| S2 | 0 → 754 (cusp) → 1204 (halt-latch) | Disc rolls +2.4 → +0.4; rim-dot cycloid cusps at each ground touch; `v`/`Rω` converge and latch equal | closed-form, R = 0.25 | none |
| S3 | 0–1500 (block) / 1500→ (disc) | Phase A: locked block skids +2.4 → −0.76 (never reaches the 1961 ms bound). **At 1500 ms, hard cut**: block retires (hidden, trail cleared), disc activates seeded at +2.4, v = 0 | `a_S3_block_sliding` → `a_rolling` | none |
| S4 | 0 → 1745 | Two spheres (5 kg/0.30 m vs 0.5 kg/0.10 m) descend abreast (centre markers aligned); **both halt in the SAME frame**, double-TIE stamp | `a_rolling`, identical for both | m₂, R₂ |
| S5 | 0 → 1265 → 1512 → held | Sphere and ring drop 2.366 m; readouts count up live; sphere latches first (7.0/2.8 J), ring second (4.9/4.9 J); held side-by-side from 1512 | `KE_trans`, `KE_rot` closed-form | none |
| S6 | 0–2500 (held) / 2500 → 4305 | **Held: seam B solves it every frame** — `f = −drive = 4.1417 N`, `N = 8.8818 N`, ΣF hidden (F_net = 0), `a` reads **0.00**. Formula lines land 1600/1900/2200. **At 2500, release**: friction arrow **1.243 → 0.414 wu** (exactly (1+k)/k = **3×**), `a` jumps **0.00 → 2.76**. Halt 4305 | seam-B statics → `a_rolling`, `f_s_rolling` | θ (20–40°) |
| S7 | 0–600 / 600–1600 (ramp) / ≈1193 (onset) → ≈1968 | Ring rolls; μ_s ramps 0.50 → 0.05; **crosses μ_min = 0.2332 at ≈1193 ms** — contact leaves 0, label flips f_s → f_k, skid trail, spin lags; halt-latches ≈1968 holding the slip picture, `f_k = 0.4441 N` latched | `param_ramp(mu_s)` → `a_S7_postslip` | μ_s (0.05–1.00) |
| S8 | free-run | Teacher-driven race; **synchronised restart** on the last crossing — all bodies re-anchor, v₀ and ω₀ = v₀/R re-seeded; chips re-stamp | live controls | shape/m/R per lane, θ, μ_s |

**S8 lane-binding note (flagged for json_author / field3d-surgeon — not resolvable from physics alone):** the DoD walk example ("pit a marble against a huge ring") and U4's "four meshes" both survive as authorable readings. The PHYSICS contract is unambiguous either way: each racing body's `k` is looked up per lane from `{solid_sphere: 0.4, disc: 0.5, hollow_sphere: 0.6667, ring: 1.0}`, `m`/`R` are independently settable per lane within the §1 ranges, and `theta`/`mu_s` are shared (one incline, one surface). The UI binding (shared vs per-lane control rows) is an engine-wiring decision inside U4/U1's scope.

### Control spec

| State | Control | Default | Min | Max | Step |
|---|---|---|---|---|---|
| S4 | m₂ | 0.5 kg | 0.1 | 8 | 0.1 |
| S4 | R₂ | 0.10 m | 0.05 | 0.35 | 0.01 |
| S6 | θ | 25° | 20° | 40° | 1° |
| S7 | μ_s | 0.50 (ramps 0.50 → 0.05 on entry; drag seizes) | 0.05 | 1.00 | 0.05 |
| S8 | shape (per lane) | S1 roster | 4-way enum | | |
| S8 | m (per lane) | 1 kg | 0.1 | 8 | 0.1 |
| S8 | R (per lane) | 0.15 m | 0.05 | 0.35 | 0.01 |
| S8 | θ | 25° | 20° | 40° | 1° |
| S8 | μ_s | 0.50 | 0.05 | 1.00 | 0.05 |

### Narration (`tts_sentences[].text_en` + one `glow` target each)

**S1 — 47 words:**
1. "Four different shapes start together on the same ramp." (9) — glow `start_line`
2. "Every time, they finish in the same order: solid sphere, disc, hollow sphere, ring." (14) — glow `finish_chips`
3. "The order never changes, no matter how many times we run it." (12) — glow `finish_line`
4. "Try it at home: a food can beats a roll of tape." (12) — glow `finish_chips`

**S2 — 45 words:**
1. "This disc rolls exactly as before: its centre speed v and turn rate omega, set by radius R, move together." (20) — glow `v_omega_readouts`
2. "Watch the marked point on the rim: it stops dead each time it touches the ground." (16) — glow `rim_dot_cycloid`
3. "v and R times omega read the same number." (9) — glow `v_omega_readouts`

**S3 — 53 words. Sentence 3 is the bridge across the hard cut at 1500 ms:**
1. "Watch this block slide down with its brakes locked: it drags and slows." (13) — glow `skid_trail`
2. "That drag is kinetic friction, and it leaves a mark." (10) — glow `f_k_readout`
3. "Now the same slope, a rolling disc: no sliding at the contact, so no mark." (15) — glow `disc_body`
4. "The contact point stays still for an instant, so this friction is static, not kinetic." (15) — glow `contact_readout`

**S4 — 50 words. Sentence 3 is the `one_line_fix` — answers mass AND radius, formula-free, ring-safe:**
1. "One sphere is five times heavier and three times wider." (10) — glow `mass_radius_labels`
2. "Released together, they stay side by side down the slope: a tie." (12) — glow `centre_markers`
3. "A bigger mass is pulled down harder but resists speeding up just as much, and a bigger radius adds equal turning push and turning resistance, so both cancel." (28) — glow `k_chips`

**S5 — 53 words:**
1. "A sphere and a ring drop the same height and end with equal total kinetic energy." (16) — glow `drop_height_marker`
2. "The sphere sends most into forward motion: seven joules moving, two point eight spinning." (14) — glow `sphere_ke_pair`
3. "The ring splits it evenly, four point nine joules each way." (11) — glow `ring_ke_pair`
4. "More spin means less speed, so the sphere reaches the line first." (12) — glow `finish_chips`

**S6 — 53 words. Sentence 3 is the P1-A payoff — the 3× shrink and the a-jump are ONE verified event:**
1. "This disc is held: gravity's pull down the slope and the friction holding it balance exactly, so acceleration reads zero." (20) — glow `f_s_arrow`
2. "The turning equation and Newton's second law combine into one formula for acceleration." (13) — glow `formula_surface`
3. "Release it: the friction arrow shrinks to a third, and the acceleration jumps to the value the formula just predicted." (20) — glow `f_s_arrow`

**S7 — 50 words:**
1. "This ring rolls normally while we lower the available friction." (10) — glow `contact_readout`
2. "Once friction drops below what rolling needs, the contact point starts to slide." (13) — glow `contact_readout`
3. "The label switches from static to kinetic, and a skid trail appears." (12) — glow `friction_label`
4. "The spin now lags behind, and kinetic friction settles at zero point four four newtons." (15) — glow `f_k_readout`

**S8 — 0/open:** no scripted `tts_sentences`; opening caption only ("All controls live"), no glow binding required.

### P2-A — glow-plan correction (S2 and S7 must NOT author a state-level `glow_focal`)

Both claims are relations (S2: two readouts equal; S7: the held slip picture including the latched `f_k` readout the honest-by-scope declaration depends on). Corrected to `phases[]` windows with hand-back, replacing the skeleton's state-level rows:

| State | Window | Element | Hand-back complete by |
|---|---|---|---|
| S2 | 0–754 ms | rim dot + cycloid trace (through the cusp) | — |
| S2 | 754–1204 ms | `v` / `Rω` readout pair | **1204 ms**, 596 ms before the 1800 pin ✓ |
| S7 | 0–1193 ms | contact readout (holding 0.00, then leaving it) | — |
| S7 | 1193–1968 ms | friction label (flip) + `f` readout (climbing to 0.4441 N) | **1968 ms**, 432 ms before the 2400 pin ✓ |

Matches S4/S5/S6's existing pattern; no overlay the pin's claim depends on sits dimmed at capture.

### P2-B — CHECKED AND REJECTED: `force_min_len` stays 0.25

The report proposed lowering `force_min_len` to ≈0.09 so S7's post-slip f_k (0.4441 N) renders true instead of clamped, **conditional on confirming the arrowhead does not degenerate below ~0.15 wu**. It does.

`NLB_COMP_HEAD_LEN = 0.14` wu (`field_3d_renderer.ts:39729`); the composite-arrow shaft is `Math.max(0.02, len − NLB_COMP_HEAD_LEN)` (`:40804`). At `force_min_len ≈ 0.09`: shaft = `max(0.02, 0.09 − 0.14)` = **0.02 wu** — the shaft collapses to the hard floor and the arrow renders as a bare cone with no visible shaft. **The check fails, so the floor stays 0.25** and S7's clamp declaration (R-7) **stands as written**: the taught regime switch rides the label flip, the skid trail, the spin lag, the contact readout leaving 0.00, and the live latched `f_k 0.44 N` readout — never a length ratio. For contrast, at the current 0.25 the shaft is 0.11 wu — small but non-collapsed, a pre-existing accepted condition, not a new one.

---

## 4. Board-mode mark scheme

**DEFERRED** — Rule 20 [D], conceptual-only directive active. The skeleton authors no `mode_overrides` and neither does this pass.

---

## 5. Drill-down cluster phrasings (6 clusters × 5, student voice)

**`why_mass_cancels` (S4):** "why doesnt the heavier ball go faster" · "shouldnt more weight make it speed up" · "if its heavier why does it not win" · "how does a 5kg ball tie a 0.5kg ball" · "does mass really not matter for rolling"

**`shape_factor_table` (S4):** "whats the k value for a hollow ball" · "why does a ring have k equal to 1" · "list the k for sphere disc and ring" · "why is a hoop k different from a disc" · "what does k actually stand for"

**`same_shape_always_ties` (S4):** "will two solid spheres always tie no matter the size" · "if both are discs do they always finish together" · "why does changing the radius not change the result" · "does a huge sphere still tie a tiny sphere" · "why does dragging the mass slider not break the tie"

**`torque_about_contact_point` (S6):** "why use torque about the contact point instead of the centre" · "does it matter which point i take torques about" · "whats the moment arm for friction here" · "can i solve this without picking a pivot point" · "why does friction cause the spin"

**`why_one_plus_k` (S6):** "where does the 1 plus k come from" · "why is the denominator 1 plus k and not just k" · "what happens to a if k is zero" · "why does a bigger k mean a slower body" · "is the 1 the moving part and k the spinning part"

**`rolling_vs_frictionless_slider` (S6):** "what if the slope had no friction at all" · "would it just slide without spinning" · "why does rolling need friction if friction does no work" · "does friction slow the ball down here" · "why is the friction static and not draining energy"

---

## 6. Constraint callouts

1. **Angle conversion.** Every `theta` argument to `sin`/`cos`/`tan` in any interpolated label or HUD string must be wrapped `radians(theta)` — θ is authored in degrees on the slider, and no formula above is exempt.
2. **S6 μ_s override (P1-A).** `mu_s_S6 = 0.90` is a **per-body constant** — never the generic `mu_s` slider, never `mu_s_S3_disc` (0.50) or the S7 ramp. Wire it `typeof`-checked (R-14 falsy discipline) since it differs from the concept's other 0.50 defaults.
3. **S6 machine-checkable expectation (carry verbatim into the surgeon's acceptance):** *"at 1000 ms the friction arrow measures 1.243 wu and the `a` readout reads 0.00; at 2600 ms the friction arrow measures 0.414 wu and `a` reads 2.76."*
4. **S7 force channel.** `force_min_len` stays **0.25** wu — see §3 P2-B. Do not lower it for this concept.
5. **Branch priority.** The rolling branch supersedes the kinetic branch at every instant `mu_s ≥ mu_min` holds; θ = 0 is never authored as a state here (test case only).
6. **Value-only HUD (Rule 33d/34b).** Every readout (`a`, `f`, `N`, `KE_trans`, `KE_rot`, `contact`, `Rω`) shows the live NUMBER only — never re-derives the formula inline. The ONE formula surface in this concept is S6's.
7. **Slider steps.** θ 1° · μ_s 0.05 (matches the engine's existing generic row) · m/m₂ 0.1 kg · R/R₂ 0.01 m — no silent defaults.
8. **Three distinct μ_s-class fields exist and MUST NOT be collapsed** into one shared variable: `mu_s_S3_disc = 0.50` (constant), `mu_s_S6 = 0.90` (constant), and `mu_s` (the S7/S8 live slider/ramp, default 0.50). Collapsing them breaks S6's hold **silently** the moment a teacher drags S7's slider in a shared session.
9. **All guided-state bodies release from rest** (v₀ = 0, ω₀ = 0) — no `omega0_rad_s` token is needed anywhere in this concept, unlike `pure_rolling`'s S7.

---

**DC Pandey check:** the derivation in §1 is rebuilt from Newton's second law + the rotational analogue + the rolling constraint. DC Pandey / HC Verma / NCERT consulted for scope only (chapter table of contents, §7.14 topic placement) — never for phrasing, sequence, examples or figures.

**Word budgets:** S1 47 · S2 45 · S3 53 · S4 50 · S5 53 · S6 53 · S7 50 — all inside their assigned ranges; S8 0/open.

*Phase 0b for `rolling_on_incline` is COMPLETE (skeleton REV 6 `DESIGN_OK` + this block). P1-B and P2-C are `pure_rolling`'s items, noted not actioned here.*
