# PHYSICS BLOCK — `gauss_law_magnetism` (Ch.5 #3 rebuild)

> **Handoff:** architect skeleton (`.agents/proof_run/gauss_law_magnetism_skeleton.md`) + design spec (`docs/superpowers/specs/2026-07-13-gauss-law-magnetism-design.md`) → this block → `json_author`.
> **Engine bug queue consulted live** (`npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts`, run against `gauss_law_magnetism`, `--owner alex:physics_author`, `--owner alex:json_author`, `--field3d --open`). Zero rows keyed to this concept_id yet (expected — new build). Relevant OPEN prevention rules applied below: `teach_reveal_synced_to_narration`, `teach_show_quantity_live_when_named`, `teach_visual_must_match_narration`, `teach_do_not_prespoil_a_later_reveal`, `teach_color_each_element_by_its_own_sign`, `PEDAGOGY_NO_FOCAL`, `PEDAGOGY_INFO_OVERLOAD`, `field3d_state_duration_field_clamps_eye_capture_window`, `ecp_glow_targets_missing_primitives` (all cited inline where they bind a decision below).

---

## 1. Variable declarations (`physics_engine_config.variables`)

Carried over from the old build **unchanged** — these are **GEOMETRY/DEMO variables that control what the surface looks like and where it sits, not physical constants being swept.** The physics answer (net magnetic flux) is **identically 0 for every value of both variables, always** — that invariance is the entire point of S6. No `constant` (like `g`) and no `derived` (like `w = m·g`) apply here; there is no physical quantity that changes with these sliders.

```json
"variables": {
  "surface_shape": {
    "name": "Closed-surface shape (0 sphere, 1 cube, 2 blob)",
    "unit": "index",
    "min": 0,
    "max": 2,
    "default": 0,
    "step": 1
  },
  "surface_pos": {
    "name": "Position of the Gaussian surface along the magnet axis (scene units; magnet half-length ≡ 1.0, pole tips at x = ±1.0)",
    "unit": "scene-units (dimensionless — not SI metres)",
    "min": -1.2,
    "max": 1.2,
    "default": 0,
    "step": 0.05
  }
}
```

Note for `json_author`/Gate 8 (bug #1, `default_variables_only_first_var_merged`): both variables must be **explicitly wired**, not just the first — `surface_shape` alone is not sufficient. Both are non-`1` defaults (both are `0`) so neither risks the "silent fallback to 1" trap literally, but both must still resolve through the runtime merge layer; verify both sliders move independently in S6 (`gm_s_slider` / `gm_o_slider`, already implemented — confirm the merge doesn't collapse one onto the other).

---

## 2. The crossing-tally invariant spec (decision A) — the physics core

### 2.1 The rigorous claim

Every magnetic field line is a **closed loop** with no start and no end (∇·B = 0, no magnetic monopole). Take any closed surface S (any shape, any size, any position) and any single closed field-line loop L. Walk along L and mark, at every point, whether that point is inside or outside S. Because L is a **closed** curve, this sequence of inside/outside marks is **cyclic** — it must return to its starting value. A cyclic boolean sequence that alternates has an equal number of `true→false` transitions ("crossing outward") and `false→true` transitions ("crossing inward") — every maximal run of "inside" is opened by exactly one inward crossing and closed by exactly one outward crossing, and inside-runs and outside-runs alternate around the cycle in equal number. **This is a combinatorial fact about closed curves and closed surfaces, not a coincidence of the numbers below** — it holds for a sphere, a cube, a lumpy blob, at any radius, at any position, whether the surface encloses the whole magnet, one pole, empty space, or nothing at all.

So: for every loop, `crossings_out(L, S) = crossings_in(L, S)`, always. Summed over all rendered loops, `Φ_out = Φ_in`, hence **net = Φ_out − Φ_in ≡ 0 identically**, independent of `surface_shape` and `surface_pos`.

**Crucially, this reasoning survives even when S encloses ONLY one pole** (S3's aha): the external portion of a loop that emerges from N and heads toward S will cross *out* through a small surface wrapped around N alone — but the *same closed loop*'s return leg (through the magnet's own body) must cross back *in* through that same small surface as it approaches N again from the far side. There is no way to "trap" a loop's outward crossing without also trapping its inward return, **because the loop has no other option — it has nowhere else to go, having no end.** This is the precise mechanism of "no magnetic monopole": a monopole would be a point where field lines truly terminate (an inside→outside transition with no matching return), and Gauss's law for magnetism is exactly the topological statement that closed field lines admit no such unmatched termination.

### 2.2 The tally is a **line-crossing proxy for flux**, not a fabricated SI number

**No physical flux magnitude (Weber) is ever computed or displayed.** Each of the 12 rendered field lines stands in for one representative flux "quantum" in the visualization — the tally counts *how many drawn lines currently cross the surface, in each direction*, not an integrated `∫∫B·dA` in teslas·m². The honest readout is the **balanced integer count**:

```
Φ_out = +N   ·   Φ_in = −N   ·   net = 0
```

where `N` is the number of loops geometrically crossing outward (always equal to the number crossing inward, by §2.1). This is exactly how the skeleton's DoD (§10b symbol-label table) already frames it — `Φ_out`, `Φ_in`, `net Φ_B = 0` are labeled as counts, never given a Tesla·m² unit anywhere on canvas.

### 2.3 Concrete counts for the CURRENT renderer geometry (verified independently)

The field is built as `AZ = 6` azimuths × `KH = 2` heights (`heights = [0.65, 1.3]`) = **12 external arches** (`bmArch2D(GM_TIP_N=1.0, GM_TIP_S=-1.0, h, ±1, 26)`), each paired with a straight-line internal return (`GM_TIP_S → GM_TIP_N` at y=z=0) into one **full closed loop** already stored per-loop in `gmLoopPaths` (used today only to drive the flowing tracer dots — `ext.concat(ret)`, `field_3d_renderer.ts:18598-18601`). I verified crossing counts by walking each arc's/loop's `(x, y)` coordinates in Python against the exact same formulas the renderer uses (`bmArch2D`, `gaussShapeGeometry`):

**Whole-magnet surface, S2 (`sphere`, R = 1.5 — the OLD build's value, offset = 0, centered on the magnet):**
```
Φ_out = 0   Φ_in = 0   net = 0
```
Every one of the 12 loops has its maximum radial excursion from the origin bounded by `max(pole-tip distance, h) = max(1.0, 1.3) = 1.3`, which is **less than R = 1.5** — so at the old radius, all 12 loops sit **entirely inside** the surface and none of them ever touches its boundary. The law still holds (`0 = 0`), but nothing crosses, so nothing can visibly "tick."

**⚠ FLAG for `json_author`/renderer (decision-A fidelity gap):** Decision A's stated visual — *"tracers cross it and the live tally HUD ticks Φ_out and Φ_in up in lock-step"* — **does not occur at R = 1.5**, because nothing crosses. **Recommendation: shrink S2's (and S4's) `gm.surface_R` from `1.5` to `1.15`.** Verified: at R = 1.15, the magnet body (farthest box corner at `√(1² + 0.25² + 0.25²) = 1.0607`) is still fully enclosed (1.15 > 1.061, safe margin), while the 6 loops at `h = 1.3` now genuinely poke past the boundary once on the way out and once on the way back (their peak excursion 1.3 > 1.15), and the 6 loops at `h = 0.65` (max excursion exactly 1.0, at the pole tips themselves) remain fully enclosed:
```
Φ_out = +6   Φ_in = −6   net = 0     (R = 1.15, offset = 0)
```
This is a **data-only change** (`field_3d_config.states.STATE_2.gm.surface_R: 1.15` and `STATE_4.gm.surface_R: 1.15`), **not renderer code** — no engine work required for the radius itself, only for the new tally-computation function (§2.4). If the team prefers the simpler "surface swallows everything, trivially 0/0" framing for S2 instead, that remains **physically valid** (0=0 is still Gauss's law) — flag both options to `quality_auditor` and let founder/renderer choose; my recommendation is R=1.15 because it is what decision A's prose promises. **[CONTROLLER DECISION 2026-07-13: adopt R=1.15 — it is the correct realization of founder-locked decision A.]**

**One-pole surface, S3 ⭐ (`sphere`, R = 0.72, offset = +1.0 onto the N tip — UNCHANGED from the old build):**
```
Φ_out = +12   Φ_in = −12   net = 0
```
Verified: every one of the 12 loops' **external arc** starts exactly at the N tip (distance 0 from the surface center, inside) and exits the R=0.72 boundary exactly **once** on its way toward S (an out-crossing) — the arc never dips back inside before reaching S. Every loop's **internal return leg** starts far away near the S tip (distance ≈2.0, outside) and crosses the R=0.72 boundary exactly **once** on its way back to N (an in-crossing). So: **12 out, 12 in, net 0** — already correct at the existing radius, **zero geometry change required for S3.** This is the single cleanest, most dramatic, already-working number in the whole build — it is the exact payoff decision B's bright cutaway is meant to make legible: *those 12 outward pokes near N are matched by 12 inward returns through the body, visible as the brightened `gm_internal` tube.*

**⚠ Implementation trap to flag explicitly (do not undercount):** the renderer draws only **ONE** visible internal-return tube (`gm_internal`, a single generic mesh representing "the body return path," `field_3d_renderer.ts:18605-18616`) — it is **not** 12 separate tubes. **The crossing tally must be computed from the 12 abstract `gmLoopPaths` polylines (each already a full closed loop, ext+ret, built at `field_3d_renderer.ts:18577-18603`), never from literally detecting crossings of the single visible `gm_internal` mesh.** Counting the one visible tube would give `Φ_in = 1` against `Φ_out = 12` — a fabricated, unbalanced, physically wrong number that would visibly break the law on-screen. `gm_internal`'s job is purely the **visual cutaway** (decision B, brightness only); `gmLoopPaths` is the **computational** source of truth for the tally (decision A). These are two different objects serving two different purposes and must not be conflated.

**S6 sandbox — verified across the full slider range (R = 1.5 unchanged, offset swept):**
```
offset ∈ [-0.5, +0.5]  →  Φ_out = 0,  Φ_in = 0,  net = 0
offset outside ±0.5 (up to the slider limits ±1.2)  →  Φ_out = +12,  Φ_in = −12,  net = 0
```
The threshold is exactly `|offset| > R − |x_tip| = 1.5 − 1.0 = 0.5`: once the surface center slides far enough that the *far* pole's tip pokes outside the (fixed) R=1.5 sphere, **all 12 loops simultaneously flip** from fully-enclosed (0/0) to crossing (12/12) — a clean, legible, always-balanced step function. **No renderer geometry change needed for S6.** The existing idle auto-sweep (`offsetX = 0.9·sin(0.8t)`, `field_3d_renderer.ts:18780`) already sweeps through this threshold twice per ~7.85 s cycle, so the tally will visibly and correctly oscillate between `0/0/0` and `+12/−12/0` even before a teacher touches the slider — a genuinely dynamic, physically honest idle demo for free.

### 2.4 The tally computation — pure function, frame-rate independent, `SET_TIME_FREEZE`-stable

This is **new renderer work** (skeleton §10 engine-delta item 1; design spec §7.1). Spec for `peter_parker:renderer_primitives` (routed via `quality_auditor` FAIL, never called directly):

```
function gmComputeCrossingTally(shape, R, offsetX):
    Φ_out = 0, Φ_in = 0
    for each loop in gmLoopPaths (12 closed polylines, built once at scenario build time):
        inside[i] = insideSurfaceTest(loop[i], shape, R, offsetX)   // point-in-solid test
            sphere (shape≈0): |p - (offsetX,0,0)| ≤ R
            cube   (shape≈1): max(|dx|,|dy|,|dz|) ≤ R          // axis-aligned box half-width R
            blob   (shape≈2): same bump formula as gaussBlobGeometry(R), tested against |p - center|
        for i in 0..loop.length-2:
            if inside[i] and not inside[i+1]: Φ_out += 1
            if not inside[i] and inside[i+1]: Φ_in  += 1
    return { out: Φ_out, in: Φ_in, net: Φ_out - Φ_in }   // net is ALWAYS 0 by §2.1 — assert this, never trust it silently
```

**Must be a pure function of `(shape, R, offsetX)` — the CURRENT surface geometry — never a per-frame accumulator.** This is both a Rule 36 requirement (frame-rate independence: the same geometry must give the same tally at 60 Hz or 120 Hz) and a THE-EYE requirement (byte-stable under `SET_TIME_FREEZE`: a frozen frame must show the same numbers no matter which instant it froze on, as long as the surface geometry at that instant is the same). For **static** guided states (S2, S3) `shape/R/offsetX` don't change during the state at all, so the tally is a single fixed pair of integers computed once on state entry. For **S4** (continuous morph) and **S6** (slider-driven / idle-sweep), `shape/R/offsetX` are themselves pure functions of `t = time − stateStartTime` (or of the trusted slider value) — so the tally, being a pure function of THOSE, is transitively still a pure, deterministic, replayable function of the state clock. No `Math.random`, no incrementing "count so far" state — recompute from scratch every time it's read.

### 2.5 Numeric-lock / no-corruption note (task item 6)

`applyGaussLawMagnetismState(stateDef)` (`field_3d_renderer.ts:18710-18743`) already **resets** `window.PM_gmShape`, `window.PM_gmOffset`, and `PM_gmUserDragged = false`, and **reseeds** the surface from that state's own authored `gm.surface_shape` / `gm.surface_R` / `gm.surface_offset_x` on *every* state entry — this is existing, verified code, not something new to build. Because the crossing tally (§2.4) is a pure function of the CURRENT `(shape, R, offsetX)` and nothing else, and because state entry always resets those three values from the state's own authored `gm` block, **a teacher dragging S6's sliders and then clicking back to any guided state (S1–S5) cannot corrupt that state's tally** — the guided state's numbers are re-derived fresh from its own authored geometry every time, exactly the same defensive pattern as `hinge_force.json` STATE_4's `variable_overrides: { F_ext: 0 }` and `field_forces.json` STATE_5's `variable_overrides: { m: 1 }`.

---

## 3. The S5 electric-contrast asymmetry (task item 3)

### 3.1 Why the electric case is genuinely structurally different

A point charge +q's field lines are **not closed loops** — they are **open rays**, anchored at one end **on the charge itself** (a real source) and extending to infinity at the other end, never returning. Apply the exact same cyclic-crossing argument from §2.1, but now to an *open* curve instead of a closed one: walk from the charge (inside any surface that encloses it) outward to infinity. This sequence of inside/outside marks is **not cyclic** — it starts `inside` (at the charge) and, once it crosses the surface boundary heading outward, it **never returns**, because there is nowhere for it to return *to* — the line simply doesn't have another end. So every one of these lines contributes exactly **one out-crossing and zero in-crossings.** There is no possible "return leg" for a line that starts on a real source and only terminates at infinity.

This is the single structural fact the whole concept builds to: **charges are real flux sources (lines start/end there); magnets are not (lines only pass through, closed on themselves).** ∮E·dA = q_enc/ε₀ is non-zero precisely because the enclosed charge is a genuine termination point that ∮B·dA's closed loops can never have.

### 3.2 Concrete counts for the S5 inset (verified against `efluxRadialDirs()`)

The renderer already builds the +q inset with **14 radial arrows** (`field_3d_renderer.ts:17368-17373` — 6 axis directions + 8 octant-diagonal directions, all strictly *outward* from the charge, `ArrowHelper` direction vectors like `[1,0,0]`, `[0.577,0.577,0.577]`, etc.):
```
Φ_out = +14   Φ_in = 0   net = +14   (line-count units — proxy for q/ε₀ ≠ 0, not a real Coulomb/permittivity value)
```
versus the magnet inset (2 small closed loops built at `field_3d_renderer.ts:18652-18656`, same closed-loop topology as the main scene, at the inset's own scale):
```
Φ_out = 0 (or a small balanced N)   Φ_in = matching   net = 0
```
**The exact inset magnet-loop count is not load-bearing** — whatever it is, §2.1 guarantees it's balanced. What matters pedagogically, and what must be legible on-canvas, is the **qualitative asymmetry**: the charge's arrows are ALL pointing the same way (out, out, out, …) while the magnet's loops visibly go out-and-back. This is exactly why S5's HUD stays symbolic (no live numeric readout on the flux HUD, per skeleton §10h) — the inset labels carry the words, not a number:

**Label values (already correctly Unicode-escaped in the existing code, `field_3d_renderer.ts:18659,18674`):**
```
magnet: ∮B·dA = 0
charge: ∮E·dA = q/ε₀ ≠ 0
```

---

## 4. Per-state within-state motion timeline (Rule 31/32, task item 4)

Every row is a pure function of `t = time − stateStartTime` (Rule 26/36). Glow focal per Rule 32e/29 (brightness only, `applyGaussLawMagnetismGlow`, `field_3d_renderer.ts:18868-18878`, closed enum on `sud.id`/`sud.elementType` with the `gm_` prefix — see the ⚠ flag under S5 below for a gap in this enum). `⚠` marks a flag to `json_author`/`peter_parker:renderer_primitives`.

| State | t-window | What animates (pure fn of state clock) | Driven by | Live controls |
|---|---|---|---|---|
| **S1** | 0 – ~5.8 s per lap, looping forever | ONE (of 12) closed-loop family circulates continuously: out of N → arcs around outside → into S → visibly continues through the magnet body (front-offset return tube, already visible per old build) back to N. Speed constant `t_loop += 0.18·0.016·__pmSteps/frame` ⇒ full circuit ≈ `1/0.1728 ≈ 5.8 s` — **verified from the actual constant in code**, giving ≥2 full laps within the ~14–16 s narration dwell. `m` arrow static (home pose). | tracer parametric position `gmLerpPath3(path, t_loop)` | none |
| **S2** | CAUSE 0 – 0.8 s: `gm_surface`+`gm_surface_wire`+`gm_surface_label` fade in (opacity 0 → settled baseline) around the whole magnet, sphere, R=1.15 (adopted; see §2.3), offset 0. EFFECT (readable ~0.6 s gap, Rule 32a) from ~1.4 s: HUD fades in showing the SETTLED (time-independent) tally `Φ_out=+6 · Φ_in=−6 · net=0`. Continuous: tracers keep circulating past the translucent shell, visibly piercing it for the 6 crossing loops. | surface fade-in ramp (new, ~0.8s) → tally is a pure fn of the now-fixed surface geometry, NOT of t | none |
| **S3** ⭐ | CAUSE 0 – ~1.0 s: `gm_surface`(+wire+label) slides+shrinks from its S2-equivalent home pose onto the N pole (R: →0.72, offset: →1.0), smoothstep. EFFECT (readable ~0.6 s gap) from ~1.6 s: `gm_internal`(+dot) BRIGHTENS as the **sole** glow focal (decision B) — peers (`gm_field_line`, `gm_surface`) dim relatively; the dot visibly traces S→N through the body. Tally settles/re-displays `Φ_out=+12 · Φ_in=−12 · net=0` (unchanged geometry from old build — verified §2.3). | surface shrink+slide ramp (~1.0s) → `gm_internal` glow toggle keyed to `gm.mode==="pole"` | none |
| **S4** | 0 – 1.5 s: settle at sphere pose (R=1.15 adopted, offset 0 fixed). From 1.5 s onward: CAUSE — continuous triangle-wave morph sphere(0)→cube(1)→blob(2)→cube(1)→sphere(0)… (`gm.morph`, `duration_ms:3200` per leg, existing code, `at_ms:1500`) + continuous slow spin (`PM_gmSpin += 0.014/frame`) + opacity "breathing." EFFECT: `net Φ_B = 0` readout holds dead steady throughout — the *instantaneous* out/in split may fluctuate with shape/orientation (sphere uses Euclidean-radius test, cube uses Chebyshev/max-norm, blob uses the bump-modulated radius — three different point-in-solid tests) but §2.1's crossing-parity theorem guarantees `Φ_out=Φ_in` for **any** of the three, at **any** instant, so `net` never moves off 0 even as the raw counts change. Only `net Φ_B = 0` is shown on the HUD (per skeleton §10h) — deliberately hiding the fluctuating split so the invariant, not the noise, is what reads. | `gm.morph` triangle-wave on t (deterministic, no randomness) | none |
| **S5** | 0 – ~0.6 s: LEFT panel (magnet inset, home pose, camera pulled back per Rule 32d — no teleport) already visible. Readable ~0.6 s gap. From ~1.2 s: CAUSE→EFFECT — RIGHT panel (+q + 14 outward arrows) reveals; the 14 arrows pulse in staggered brightness (existing `pulse()` fn, `field_3d_renderer.ts:18837-18849`, brightness only, Rule 29) reading as "these flow outward and never return." LEFT loops keep their static home-pose pulse-free continuity (no competing motion). | inset group opacity/pulse on `t` | none |
| **S6** | 0 (state entry): idle auto-sweep begins immediately, `offsetX(t)=0.9·sin(0.8t)` — verified (§2.3) this sweeps through the ±0.5 crossing threshold twice per ~7.85 s cycle, so the tally **already oscillates 0/0/0 ↔ +12/−12/0** before any drag. On first `ev.isTrusted` drag (`PM_gmUserDragged=true`): idle sweep stops, teacher's `surface_shape`/`surface_pos` slider values drive the surface directly; tally recomputes live from the same pure §2.4 formula — instantly consistent, no lag. Tracers keep circulating regardless (Rule 37 — never auto-freezes). | idle sweep OR trusted slider value | `surface_shape` (0/1/2), `surface_pos` (−1.2…+1.2) — ALL |

**⚠ Flag — S5 glow-focal gap (Rule 32e / `PEDAGOGY_NO_FOCAL` / `ecp_glow_targets_missing_primitives`):** the skeleton's control table names *"the +q's outward-piercing lines"* as S5's single glow focal. Checked `applyGaussLawMagnetismGlow` (`field_3d_renderer.ts:18868-18878`): it only iterates objects whose `userData.elementType` starts with `"gm_"`. The 14 individual radial `ArrowHelper`s inside `gm_contrast`'s RIGHT group carry only `userData = { gmContrastRadial: true }` — **no `elementType`/`id` at all** — so the formal `applyGlowEmphasis` mechanism cannot currently target them individually (only the whole `gm_contrast` group, via `id:"gm_contrast"`, could be glow-toggled as one unit, which would NOT distinguish RIGHT from LEFT). **Mitigating factor:** the existing bespoke `pulse()` animation (`field_3d_renderer.ts:18839-18849`) already gives *only* the RIGHT-side arrows a distinctive staggered brightness wobble (the LEFT magnet-inset loops are static, no per-frame update targets them) — so attention is *already* visually drawn to the RIGHT side by its own unique motion, even without the formal glow API. **Recommend to `json_author`/renderer:** either (a) accept the existing pulse-only distinction as satisfying Rule 32e's intent (cheapest, zero code change), or (b) tag the RIGHT group's children with their own `elementType` (e.g. `"gm_contrast_q"`) so `applyGlowEmphasis` can formally brighten them and dim the LEFT inset as true peers. Quality_auditor's Gate 3f / eye_walker "delta visible?" probe should judge which is needed — flagging both options rather than mandating renderer surgery.

---

## 5. Per-state value-only HUD spec (Rule 33d/34b)

All Unicode (∮ Φ ε₀ · ≠ →), value-only, no formula body duplicated in the HUD (the formula body lives in the separate `formula_overlay`, one per state, per Rule 34b):

| State | HUD (`gm_readout`, restyled value-only per Rule 34) |
|---|---|
| S1 | **hidden** (`gm.show_readout: false`) — small `formula_overlay`/`label` reads "closed loops" only, no flux numbers yet (Rule 25/`teach_do_not_prespoil_a_later_reveal` — the ∮ symbol hasn't been introduced) |
| S2 | `Φ_out = +6 · Φ_in = −6 · net = 0` (with the R=1.15 tuning adopted in §2.3) |
| S3 ⭐ | `Φ_out = +12 · Φ_in = −12 · net = 0` |
| S4 | `net Φ_B = 0` (split deliberately NOT shown — see §4 S4 row for why) |
| S5 | **hidden** on the flux HUD — the two contrast values live symbolically on the inset labels: `magnet: ∮B·dA = 0` / `charge: ∮E·dA = q/ε₀ ≠ 0` |
| S6 | live `Φ_out = +N · Φ_in = −N · net = 0`, `N ∈ {0, 12}` (or intermediate transient values during a cube/blob drag, per §2.4) — updates every frame from the pure tally function |

`formula_overlay` per state (ONE surface, Cambria-Math Unicode, unchanged from old build — already correct):
```
S1: (small "closed loops" label only, no ∮ yet)
S2: ∮B·dA = 0
S3: no monopole → net Φ_B = 0
S4: ∮B·dA = 0  (any surface)
S5: ∮B·dA = 0   vs   ∮E·dA = q/ε₀
S6: live net Φ_B = 0
```

---

## 6. Physical constraints (`physics_engine_config.constraints`)

Carried forward and sharpened with the crossing-tally invariant (M1–M5 mapping preserved for the `misconception_watch` cross-reference):

```json
"constraints": [
  "Magnetic field lines are continuous CLOSED loops — no start, no end (∇·B = 0, no magnetic monopole); so for ANY closed surface, the number of outward crossings equals the number of inward crossings, per loop, always (M1).",
  "Because every closed field-line loop that crosses a closed surface must cross it an equal number of times in each direction, the net magnetic flux through ANY closed surface is identically zero: Φ_out + Φ_in = 0, i.e. ∮B·dA = 0 (M2).",
  "Even a closed surface around a SINGLE pole nets zero flux — the lines that emerge outside the shrunk surface pass back in through the magnet's own BODY, still inside that surface; verified for the current renderer geometry (R=0.72, offset=1.0 onto the N tip): 12 loops out, 12 loops in, net 0 (M3).",
  "The zero-net result is independent of the closed surface's shape, size, and position — sphere, cube or blob, centered anywhere, enclosing the whole magnet, one pole, or nothing: the crossing-parity argument (any closed loop vs any closed surface) holds regardless (M4).",
  "This is the structural contrast with the electric Gauss law: a point charge's field lines are OPEN rays anchored on the charge (a real flux source) and never returning, so every line crosses an enclosing surface exactly once, always outward — Φ_out=+14, Φ_in=0 for the 14 rendered lines in the S5 inset — giving ∮E·dA = q/ε₀ ≠ 0, unlike the magnetic case which has no such source to anchor a line's other end (M5).",
  "The crossing tally (Φ_out, Φ_in) is a LINE-COUNT PROXY for flux, never a fabricated SI (Weber) magnitude — no Tesla·m² value is computed or displayed anywhere in this concept; only the balanced integer counts and the symbolic law ∮B·dA = 0."
]
```

---

## 7. Per-state `variable_overrides` (task item 2 / geometry seed notes)

Guided states S1–S5 expose **zero sliders** (Rule 31 — deterministic for THE EYE), so these are **narrative-locked geometry values baked into each state's `field_3d_config.states.STATE_N.gm` block**, following the same defensive pattern as `hinge_force.json` STATE_4's `variable_overrides: { F_ext: 0 }` — even though no slider exists to leak a wrong value in a guided state, the value must still be explicitly authored so a stale/previous state's geometry (e.g., left over from S6 sandbox exploration, or from `applyGaussLawMagnetismState`'s reseed) cannot bleed through:

| State | `surface_shape` | `surface_pos` (→ `gm.surface_offset_x`) | `gm.surface_R` | Justification |
|---|---|---|---|---|
| S1 | N/A — no surface built/shown yet | N/A | N/A | `gm.mode: "loops"`; surface stays hidden this state |
| S2 | `0` (sphere — override, matches slider default but MUST still be explicit) | `0` (centered — override) | **`1.15`** (adopted; over the old `1.5` — see §2.3) | Whole-magnet enclosure; narrative requires a genuinely-crossing, non-degenerate tally |
| S3 ⭐ | `0` (sphere — override) | `1.0` (onto the N tip — override; unchanged from old build) | `0.72` (unchanged) | PRIMARY aha; geometry already verified correct, zero change |
| S4 | animated `0 → 2 → 0` via `gm.morph` (this IS the taught variable in motion, not a static override) | `0` (fixed — override; the morph must NOT also drift position, else it conflates two variables at once, violating Rule 32b "only the taught variable moves") | **`1.15`** (adopted; same reasoning as S2) | Shape-only variation; position pinned so the demo isolates shape exactly |
| S5 | N/A — different scene entirely (`gm_contrast` inset group) | N/A | N/A | `gm.mode: "contrast"`; `surface_shape`/`surface_pos` don't apply to the inset's own fixed-radius mini-surfaces |
| S6 | LIVE slider, default `0` | LIVE slider, default `0`; idle auto-sweep `0.9·sin(0.8t)` until first trusted drag | `1.5` (unchanged — verified to work via the ±0.5 threshold, §2.3) | Explore-last; no override, genuine teacher control |

**Duration flag (`field3d_state_duration_field_clamps_eye_capture_window` prevention rule, live-queried from `engine_bug_queue`):** the trimmed 25–55-word narration will run **shorter** than the old build's 70–104-word scripts, but THE EYE's dense-capture window is clamped to the authored `duration` field, not to actual narration length — a `duration` too short blinds the gate to the tail of a state's choreography. Recommend `duration` ≥ narration_seconds + motion-tail-seconds + 1s buffer:

| State | Target narration | ≈narration sec (words/2.5) | Motion tail | Recommended `duration` |
|---|---|---|---|---|
| S1 | ~35 words | ~14 s | continuous loop (needs ≥1 lap, ~5.8s, already inside 14s) | **16 s** (old: 15) |
| S2 | ~45 words | ~18 s | 0.8s fade + 0.6s gap ≈ 1.4s (inside narration) | **19 s** (old: 17 — bump) |
| S3 ⭐ | ~50 words | ~20 s | 1.0s shrink + 0.6s gap ≈ 1.6s (inside narration) | **21 s** (old: 19 — bump) |
| S4 | ~40 words | ~16 s | continuous morph (6.4s/full cycle, inside narration) | **17 s** (old: 17 — sufficient, keep) |
| S5 | ~50 words | ~20 s | 0.6s settle + 0.6s gap ≈ 1.2s (inside narration) | **21 s** (old: 18 — bump) |
| S6 | 0/open invitation | n/a | continuous, never freezes (Rule 37) | open/long, match the convention already used on `faraday_law_induction`/`magnetisation_and_intensity`'s final explore state — defer to `json_author`'s established pattern |

---

## 8. Board-mode mark scheme + derivation sequence

**DEFERRED** (Rule 20 [D] — conceptual-only directive active, founder 2026-06-11). Skipped entirely per instructions; no board content drafted for this build.

---

## 9. Drill-down cluster phrasings (task item 5 / output-contract §5)

**DORMANT this phase** (clusters SQL migration authored-not-applied, per skeleton §6 — N/A-DORMANT, do not FAIL-route on the registry probe). Phrases authored now for the future revival, matching the architect's candidate cluster IDs:

**`monopole_enclosure_confusion` (S3):**
1. "why isn't the flux positive around just the N pole"
2. "if I only wrap the north end doesnt it have to be positive"
3. "shouldnt one pole alone act like a positive charge"
4. "why does zero still happen when I shrink the surface"
5. "isnt the north pole a source of field lines by itself"

**`lines_inside_the_magnet` (S3):**
1. "does the field line really go through the magnet"
2. "I thought field lines only exist outside the magnet"
3. "whats happening to the line once it enters the metal"
4. "why does the line keep going once it hits the pole"
5. "is there field inside a solid bar magnet"

**`cutting_magnet_isolates_pole` (S3):**
1. "what if I cut the magnet in half at the middle"
2. "if I saw the magnet apart do I get a lone north"
3. "why cant I ever get just one pole by breaking it"
4. "does cutting a magnet ever give a single charge like pole"
5. "if you keep cutting forever do you eventually get one pole"

**`two_gauss_laws_conflation` (S5):**
1. "why does the electric one have charge over epsilon but the magnetic one doesnt"
2. "shouldnt magnetism have its own version of q over epsilon nought"
3. "whats the magnetic equivalent of enclosed charge"
4. "why is there no q_m in the magnetic law"
5. "are these two laws really saying different things"

**`flux_vs_field_zero` (S5):**
1. "if net flux is zero does that mean B is zero outside"
2. "net flux zero but the field isnt zero right"
3. "how can flux be zero when I can clearly see field lines"
4. "does zero flux mean no field at all"
5. "whats the difference between the field being zero and the flux being zero"

---

## 10. Constraint callouts (output-contract §6)

- **No angle conversion needed** — this concept has no `radians()`/`degrees()` formula arguments anywhere (no angular variable is taught).
- **`surface_shape` slider step = 1** (integer index; renderer rounds via `Math.round(shape)` in `gmApplyShape`, `field_3d_renderer.ts:18533` — confirmed this already handles the morph's continuous `0–2` float sweep correctly by rounding only at the mesh-swap decision, not at the crossing-tally computation, which should use the **continuous** float shape value for its point-in-solid test during S4's morph, not the rounded integer — flag this distinction to renderer: §2.4's `insideSurfaceTest` should interpolate/blend between sphere/cube/blob geometries proportionally to the continuous morph value if a mid-morph tally is ever sampled, OR simply snap to the nearest of the 3 discrete tests each frame (acceptable simplification since `net=0` is guaranteed either way — recommend the simpler snap-to-nearest for engine cost).
- **`surface_pos` slider step = 0.05**, range `−1.2…+1.2` — no rescaling needed, this maps 1:1 to `gm.surface_offset_x` in scene units (magnet half-length ≡ 1.0).
- **No `scale_pixels_per_unit` magnitude scaling** anywhere in this concept (no vector-length-encodes-magnitude primitive is used for the taught variable — the tally is a discrete integer count, not a scaled arrow).
- **`gm_internal` visual offset (z=0.34) vs `gmLoopPaths`' computational return leg (z=0) are two different objects** — see the ⚠ flag in §2.3; do not let the crossing-tally computation read the visually-offset mesh position.

---

## Self-review checklist

- [x] Every symbol in the skeleton's state narratives (`B`, `m`, `N`, `S`, `Φ_out`, `Φ_in`, `net Φ_B`, `∮B·dA`, `+q`, `E`, `ε₀`) appears in the DoD symbol-label table (§10b of skeleton) and is accounted for above.
- [x] No `radians()`/angle formulas needed — N/A, verified no angular variable taught.
- [x] Live controls declared per state exactly matching the architect's control table (S1–S5 none, S6 both, ALL).
- [x] `variable_overrides` documented for every state that needs one (§7), each justified with a one-liner, following the `hinge_force`/`field_forces` precedent.
- [x] Board mode section explicitly SKIPPED (Rule 20 [D]).
- [x] Drill-down cluster phrasings — 5 per cluster × 5 clusters, real-student voice, plain English, no Hinglish, no teacher-prose (§9).
- [x] `constraints` block: 6 short factual assertions (§6), including the new no-SI-fabrication callout.
- [x] Numerical sanity check run independently via Python (not hand-waved) — S3's 12-out/12-in, S2's 0-out/0-in (old R) vs 6-out/6-in (tuned R), S5's 14-out/0-in, all cross-checked against the actual renderer functions `bmArch2D`/`gaussShapeGeometry`/`efluxRadialDirs`, not assumed.
- [x] Within-state motion timeline written for all 6 states (§4), every branch a pure fn of the state clock, no two states share a motion (matches skeleton's declared archetypes), no state static.
- [x] Rule 32 sequencing verified per state: cause (surface appears/shrinks/reveals) before effect (tally/cutaway/pulse), readable ~0.6–1.0 s gap named explicitly per state; only the taught variable's motion changes per state (S4's morph pins position fixed specifically to satisfy this).
- [x] Word budget: narration targets given per state (35/45/50/40/50/open words) sit inside the 25–55 range; duration recommendations in §7 sized to cover them.
- [x] Engine bug queue consulted **live** (not skipped) — 6 rows for `alex:physics_author`, 53 for `alex:json_author`, 22 open field_3d rows reviewed; every relevant prevention rule cited inline (§4's glow-focal flag, §7's duration flag, §2.3's reveal-synced/tally flags).
- [x] DC Pandey check: no formula, derivation, or example imported from any book. §2.1's crossing-parity argument, §2.3's numeric verification, and §3.1's open-vs-closed-curve argument are derived here from Newton/Maxwell first principles (∇·B=0, closed-curve topology) and independently checked against the renderer's own code, never copied from a textbook's proof.

---

## Escalation notes to `quality_auditor`

1. **Decision-A fidelity gap at S2/S4's old R=1.5** (§2.3) — RESOLVED by controller: adopt the tuned R=1.15 (gives a genuine ticking tally, the correct realization of founder-locked decision A). Not a founder escalation.
2. **S5 glow-focal mechanism gap** (§4 flag) — the formal `applyGlowEmphasis` enum cannot currently isolate the RIGHT-side (+q) arrows from the LEFT-side (magnet) inset; the existing bespoke pulse already provides a substitute distinction. Recommend `quality_auditor`/`eye_walker` judge from actual rendered frames whether this satisfies Rule 32e before routing a renderer delta.
3. **`gm_internal` (visual, ONE object) vs `gmLoopPaths` (computational, 12 loops) must not be conflated** in the tally implementation (§2.3) — this is the single most likely place a naive implementation would silently produce a physically wrong, unbalanced tally (12 vs 1) on screen.
