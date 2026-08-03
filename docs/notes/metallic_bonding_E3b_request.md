# `metallic_bonding` — E3b CAPABILITY REQUEST + CONTRACT AMENDMENTS

**Written by:** Desk 3 (`feat/chemistry-metallic-bonding`), 2026-08-03.
**For:** the founder, to hand to **Session A** — which owns the E3b `field3d-surgeon` dispatch and the
shared Phase-0 contract. **Desk 3 built none of this** (Rule 40: two surgeons in
`field_3d_renderer.ts` at once is the PCPL focal-glow origin story), and deliberately did **not** edit
`docs/CHEMISTRY_PHASE0_BONDING.md` — Session A is authoring against that same file, so the amendment
text below is offered ready-to-paste rather than applied unilaterally.

**Source artefacts (both sealed on this branch):**
- `docs/skeletons/metallic_bonding_skeleton.md` — architect, **founder-proxy Checkpoint A DESIGN_OK,
  cycle 2 of 2**. §4 is the full per-state engine-block map with source line numbers.
- `docs/skeletons/metallic_bonding_chemistry_block.md` — chemistry-author, three ratification duties
  discharged.

---

## 0 · The blocker, in one paragraph

The dispatch brief said "author S1–S3 now, wait for E3b for S4–S7." That is not reachable. Verified by
grep three times independently (architect, founder-proxy, dispatching session):
`BS_MODES_DEFERRED = ["layer_shift","electron_sea","drift","melt"]` (`field_3d_renderer.ts:51629`);
`bscSea` and `BS_METALS` each have **zero hits**; and the four controls this concept needs —
`field`, `valence`, `metal`, `shift` — are seeded at `:53547–53552` (`window.PM_bscField` etc.) and
**read nowhere**, i.e. write-only (`check_bonding_scene.ts:4002` `NO_DRIVER` confirms the same four).
**Only S1 is buildable today.** S2 additionally needs a mechanism nobody had scoped: a whole-lattice
ionisation ramp (today's `mode:'transfer'` resolves a single from/to PAIR by `units[].id`, `:54373–54375`,
while lattice sites carry `unit: null`, `:52810`).

---

## 1 · PART A — five CONTRACT AMENDMENTS, needed BEFORE json-author opens

The Phase-0 enum-freeze rule says an E3 amendment "is written into this doc **before** Desk 1 authors
against them — otherwise Desk 1's JSON is written against a moving contract." Five items are currently
undecided. Desk 3 stopped rather than author against them. Paste-ready:

**A-1 · New `sea` cue keys** (the block is parsed-and-passed-through today, `:51097`):
```
sea: { count, speed, field, show_drift,
       release_at_ms, release_duration_ms,        // C-10, S2
       valence_from, valence_at_ms, valence_step_ms }   // C-4, S6
```

**A-2 · `hud_lines` accepts the ring-gated object form**, exactly as `controls` already does:
`hud_lines: [ 'lattice_a', { id: 'atomisation', min_ring: 'ext' } ]` — bare string ⇒ core.
*Descope fallback, so Rule 38b can never break silently: if this is not built, `atomisation` leaves
the S7 HUD entirely and 38b holds by removal instead of gating.*

**A-3 · A twelfth glow key `electron_tag` → elementType `bsc_electron_tag`.** Precedent: E5 added the
eleventh key `trend` for exactly this reason (`:55310–55317` — "two of hydrogen_bonding S7's sentences
had nothing to glow"). Without it, `glow_focal:'electrons'` on S3 lights **all 40 dots**
(`applyBondingSceneGlow` glows every visible object of a focal elementType, `:55321–55333`) — a Rule 32e
violation, and S3's entire "watch ONE electron" beat has no mechanism. Instance-level focal resolution
is an acceptable alternative; either route must land in the contract.

**A-4 · The S5 re-seat settle beat has no authorable key.** After a full one-site slide the metal's
layer re-seats into equivalent sites — this is the state's only *positive, moving* payoff (see §3
below). Decide and declare either `shift.settle_at_ms` / `shift.settle_ms`, or a fixed derivation from
`shift.at_ms + duration_ms`. Undeclared, it is the alarm-rule class exactly.

**A-5 · `sea.speed` needs a declared type.** The skeleton drafts `sea.speed: 'moderate'`, which is an
undeclared enum member — and the renderer's own comment is binding: "a member absent from these is a
CONFIG ERROR, not a silent no-op" (`:51617–51621`). Declare it as a number, or as a closed enum.

---

## 2 · PART B — the capability list

Full per-state map with line numbers: **skeleton §4**. Summary of what is NEW beyond what the
`ionic_bonding` skeleton already asked for:

| | Capability | Consumed by |
|---|---|---|
| C-1 | `BS_METALS` property table (data in §3 below) | S6, S7 |
| C-2 | The electron sea itself — dot substrate, deterministic roam, drift, screening | S2–S7 |
| C-3 | `drift` + `atomisation` HUD lines | S4, S7 |
| C-4 | Scripted valence STEP cue + valence-row consumer + drag-seize | S6, S7 |
| C-5 | `valence` HUD generalised from the molecule path (`:55082`) to the live lattice site species | S2 |
| C-6 | Ring-gated `hud_lines` (= A-2) | S7 |
| C-7 | Explore valence-drag detach semantics (unlabelled "model metal") | S7 |
| C-8 | Trend-panel live highlight following `PM_bscValence` | S6 |
| C-9 | Tagged-electron focal (= A-3) | S3 |
| C-10 | **Whole-lattice ionisation ramp + per-site outer-electron dots** | S2 |
| **C-11** | **Points-only trend chart** (NEW — found by THE EYE walk, 2026-08-03; see §2.1) | S6 |
| **C-12** | **Solved cameras for the four deferred modes + `fit` on the default** — ⚠ BLOCKING (§2.2) | S2–S6 |
| **C-13** | **`BS_FIT_MARGIN` is the orthographic bound, not the perspective one** — ⚠ BLOCKING (§2.2) | S1, all lattice states |
| **C-14** | **`thermal.jiggle_scale` never reaches lattice sites** (§2.2) | S1–S6 |
| **C-15** | **`lattice.radius_scale` no-ops unless a reveal mode is authored** (§2.2) | S1 |

**Shared with `ionic_bonding` — dispatch ONCE for both:** the `field_at_ms` cue; drag-seize on the
`shift` and `field` rows; the D-7 `like_contacts` metric + HUD line per ionic skeleton §5.2.

### 2.1 · C-11 — the trend panel cannot draw a points-only chart (found by THE EYE, 2026-08-03)

**Symptom.** S6's row-O trend panel renders correct axes, correct tick values and correct Unicode
labels — with a y-range (76–357) visibly derived from the real ΔH data — and **zero data-point
markers**, across all 25 dense frames and the frozen pin. The state's ONE instrument (D-3) is
pedagogically empty.

**Root cause, from source — this is NOT a missing draw call.** `bscDrawTrend` splits `tr.points` into
`fam` (labels listed in `tr.extrapolate_from`) and `odd` (everything else). The marker loop is
`for (i = 0; i < fam.length; i++)` (`field_3d_renderer.ts:55268`), so **only `extrapolate_from`
members ever get a marker**. `odd` markers are drawn solely inside
`if (fit && odd.length && rev > 0.55)` (`:55278`), and `bscTrendFit` returns `null` for a family of
fewer than two points (`:52958`). With no `extrapolate_from`: `fam = []` → no markers → `fit = null`
→ the `odd` branch never fires either. Axes still draw, because they are computed from `pts`.

**Why the obvious workaround is wrong.** Authoring `extrapolate_from: ["Na","Mg","Al"]` would populate
`fam` and produce markers — but it also draws a least-squares line through the three points. ΔH_at is
107 / 146 / 326 kJ mol⁻¹, which is emphatically **not** linear: the fit predicts Mg at ≈207 and misses
the real 146 by ~61 kJ mol⁻¹, drawing a straight line that visibly bypasses its own middle data point.
S6's claim is "it climbs steeply", never "it is linear". So the workaround would trade an empty chart
for a chart that teaches something false. **Not taken.**

**The ask.** `trend` must support a points-only chart: render a marker + label for every entry in
`tr.points` regardless of `extrapolate_from` membership, with the fitted line drawn only when
`extrapolate_from` is authored. Gate on **marker draw-call count == `points.length`**, not on axis
presence — the axes drawing correctly is exactly what made this invisible to a 31/31 green EYE run.

**Scope note:** no `ionic_bonding` state uses `trend`, so this gap is not in Session A's dispatch and
will not be found by it. It is `metallic_bonding`-only and must be added explicitly.

### 2.2 · C-12…C-15 — four camera/motion defects found at Checkpoint B (2026-08-03)

All four are in LIVE machinery, all four survive E3b unless fixed with it, and **none was in this
document before Checkpoint B measured them.** C-12 and C-13 are BLOCKING for the post-E3b picture.

**C-12 · Five states are rendered from INSIDE the lattice block. ⚠ BLOCKING.**
`BS_CAMERAS` (`:51843–51975`) holds exactly nine keys — `dipole_sum, explore, assemble, approach_link,
network, compare, transfer, lattice_grow, coordination`. The four deferred modes `electron_sea`,
`drift`, `layer_shift` and `melt` have **no entry**, so `bscSolvedCamera` (`:52215`) falls through to
`BS_CAMERA_DEFAULT = {az:35, el:28, dist:7.0}` (`:51975`) — which carries **no `fit`**, so the E3a
auto-fit (gated on `cam.fit`, `:53666`) never runs. The block's bounding radius is 17.6–19.4 units
against a camera distance of 7.0: **the camera is 10.6–12.4 units inside the block.** Measured by
replicating the shipped projection: a sphere at the origin draws a predicted 199 px radius against
~195 px measured in `STATE_3__frozen.png`, and a predicted 414 px on S2 against a sphere that
overflows the 720 px canvas.
**This is independent of the deferred physics.** When E3b implements the sea, the drift and the layer
shift, every one of them will be rendered from inside the block unless a camera is added in the same
change. *Fixed* = solved camera entries for all four deferred modes, **plus `fit: true` on
`BS_CAMERA_DEFAULT`** so no future mode can silently inherit an unfitted 7.0. Probe: assert
`BS_CAMERAS` covers every member of the mode enum, and that the resolved distance ≥ `bscSiteExtent` × 2.0.
**Invisible to Session A:** `ionic_bonding`'s `transfer` and `lattice_grow` modes both HAVE cameras, so
that dispatch will not surface this — the same blind spot as C-11.

**C-13 · `BS_FIT_MARGIN = 1.90` is the orthographic bound under a perspective camera. ⚠ BLOCKING.**
`:51686–51689` reasons: "half-height visible at distance d is d·tan(30°) … fitting an extent e
therefore needs d ≥ e/0.5774 = 1.732·e; 1.90 is that with margin." That is correct for a **planar**
extent in the origin plane. But `bscSiteExtent` (`:52862`) returns a **bounding-sphere radius**, whose
perspective bound is `d ≥ e/sin(30°) = 2.0·e`. At 1.90 the fit is 5% short: S1 lands at worst
`|NDC.y| = 1.000` — exactly tangent — and clips at the bottom canvas edge (`STATE_1__frozen.png`,
`STATE_1__dense_t20000.png`). Same reasoning error as the OPEN scar
`orthographic_separation_metric_underpredicts_perspective_overlap`, whose own prevention rule notes
such a metric "can only be OPTIMISTIC". **Affects every lattice state on this scenario, `ionic_bonding`
included.** *Fixed* = `BS_FIT_MARGIN ≥ 2.0`, gated by an assertion that worst `|NDC|` < 1.0 over all sites.

**C-14 · `thermal.jiggle_scale` is a silent no-op on `placement: 'lattice'`.**
`bscJiggle` is defined at `:52444` and called at **exactly one site** — `:54095`, inside the molecular
**unit** loop. Lattice sites never receive it. `metallic_bonding` authors `jiggle_scale: 0.5` on all six
guided states and it does nothing: S1's tail is byte-identical (`t18000 ≡ t19000`), and S3/S4/S5 are
byte-identical to one another across the entire 3D region (0 of 361,900 px).
Load-bearing twice: the skeleton's whole "no static state" guarantee (§3) rests on this key, and
`deriveStateMeta:284–287` reads it to **declare motion = true** — so the validator declares motion on
the strength of a key with no consumer. *Fixed* = apply jiggle on the site pass, or reject the key as a
config error on lattice placement. A silent no-op is the one unacceptable outcome.

**C-15 · `lattice.radius_scale` no-ops unless a reveal mode is authored.**
`:54416` computes `rsNow = 1 + (rsTarget - 1) * revF`, and `revF` is hard 0 when `revMode === "none"`
(`:54412`). So `radius_scale` — used and documented as an independent knob — does nothing on any state
authoring `reveal: 'none'`, with no warning. This is exactly the lever identified to fix S1's
legibility, and pulled alone it would have failed silently. *Fixed* = apply `radius_scale`
independently of `revF`, or reject the combination as a config error.

### 2.3 · A separate, non-`field_3d` dispatch — the visual gate itself

Not `field3d-surgeon`'s: owner `peter_parker:visual_validator`, on **master**, separate from E3b.
THE EYE returned **31/31 over four byte-static states and a chart plotting nothing**. Three holes:
1. **D5 reduces adjacent-pair diffs with `Math.max`** (`pixelGate.ts:273`), so ONE pair anywhere in the
   state clearing the 0.1% canvas floor certifies the whole state. A DOM annotation appearing is
   ~4,300 px of 921,600 = **0.47%, five times the floor**. Measured here: S3/S4/S5/S6 changed zero
   scene pixels across 24–27 dense frames each, and every change instant landed exactly on an
   annotation `at_ms`/`until_ms` boundary. Four false passes. Renderer-agnostic and fleet-wide, because
   annotations are shared machinery. *Fixed* = diff the canvas region only, excluding overlay bands,
   and report the fraction of pairs that moved rather than the max.
2. **A skipped check is pushed as `passed = true`** (`pixelGate.ts:302–305`), and every scenario branch
   in `deriveStateMeta` declares its explore state static — so **D5 can never catch a frozen explore
   state on any concept on any renderer.** That is the Rule-37 defect class, and it is exactly the
   defect this desk found by hand. *Fixed* = report skipped as SKIPPED, never as a pass, and give
   Rule 37 its own probe (byte-compare two late frames on any `interaction_complete` state).
3. The motion **declaration input** is itself a no-op (C-14 above).

### Two couplings that will otherwise be discovered mid-build

1. **The metal picker's options are ENGINE-OWNED.** The three `<option>` values are hardcoded in the
   DOM string (`:53419`), so `BS_METALS` keys must be exactly `{Na, Mg, Al}` — a fourth table row
   silently never appears unless the dispatch also rebuilds the row from the table.
   *(Note for whoever reads Desk-1 lesson 9, "author `config.explore_species`/`explore_units`": those
   keys feed the **molecule** and **species** dropdowns, `:53377–53378` / `:53397–53398` — authoring
   `explore_species: ["Na","Mg","Al"]` would put three bogus entries in the molecule picker. Desk 3
   removed that instruction after verifying it.)*
2. **C-10 modifies E3a-shipped code that `ionic_bonding` depends on.** Regression guard, required:
   the existing `mode:'transfer'` path with `trFrom`/`trTo` must render **byte-identical** before and
   after — a gate-1 determinism assertion pinned on `ionic_bonding` S2's frames. Also: C-10 must drive
   `siteRU[i]`, not fight `rsNow` — the site draw is `sm2.scale.setScalar(siteRU[i] * rsNow)` (`:54441`),
   and `rsNow` stays 1 on S2 because `lattice.radius_scale` is unauthored and the mode is not
   `coordination` (`:54417–54419`). Verified compatible; stated so it is not rediscovered.

---

## 3 · PART C — the ratified data the surgeon builds from

Discharged by `chemistry-author`; full calibrations and source classes in the chemistry block §1–§3.
Convention: the gate **PRINTS** table-vs-literature with a ratify flag (the E1 dipole-table pattern);
it never asserts unratified digits.

**`BS_METALS` (15 cells).** ΔH_at = standard enthalpy of atomisation of the solid element at 298 K, in
kJ per **mole of atoms**; `a_pm` = conventional cell edge, X-ray, ~298 K (for hcp, the **basal** edge at
the ideal axial ratio `BS_HCP_C_OVER_A` = √(8/3), `:51649`); mp at standard pressure.

```
Na: { cell:'bcc', a_pm:429.0, valence:1, dH_at_kJ:107, mp_K:371 }
Mg: { cell:'hcp', a_pm:320.9, valence:2, dH_at_kJ:146, mp_K:923 }
Al: { cell:'fcc', a_pm:404.9, valence:3, dH_at_kJ:326, mp_K:933 }
```

**Geometry solved for all three metals** on the shared linear-pm scale (`BS_RADIUS_PM`: Na 186, Mg 160,
Al 143) — every picker metal renders touching spheres, so the picker is geometrically sound:

| metal | nn distance | 2r |
|---|---|---|
| Na bcc | a·√3⁄2 = 371.5 pm | 372 |
| Mg hcp | a = 320.9 pm | 320 |
| Al fcc | a⁄√2 = 286.3 pm | 286 |

**Free-electron density (S3 formula surface):** n = ρN_A z/M = **2.5×10²⁸ m⁻³** for sodium at room
temperature. Ships as ratified DATA, never as a count derived from the 35–105 on-screen dots — the
narration carries the scale-factor clause ("each dot stands for very many electrons").

**Drift model (S4 `drift` HUD) — `v_d = μE`:**
- μ(Na) ≈ **5.3×10⁻³ m² V⁻¹ s⁻¹**, derived via σ = neμ from σ(Na) ≈ 2.1×10⁷ S m⁻¹ and the ratified n.
- Slider (dimensionless 0–1, `:53416`) maps to **E = 0 → 0.04 V m⁻¹**; sanity-checked against a copper
  wire carrying a few amps (~0.08 V m⁻¹ — same order).
- **Full-scale v_d ≈ 2.1×10⁻⁴ m s⁻¹.** ⚠ This CORRECTS the skeleton's stated ≈1×10⁻⁴ (an arithmetic
  slip: 5.3×10⁻³ × 0.04 = 2.12×10⁻⁴). Order of magnitude 10⁻⁴ m/s is unchanged, so the teaching claim
  and the cross-link to the shipped physics concept `drift_velocity` both stand.
- **At `field = 0` the HUD must print a live `v_d = 0 m/s`** — never "—", never stale. (Distinct from
  C-7's detach behaviour, where the element-tied table lines `melting_point`/`atomisation` *do* blank
  to "—", because they have no referent once the metal is unlabelled.)
- **Unratified, offered not asserted:** if the surgeon reuses sodium's μ for Mg/Al in the explore
  sandbox, their drift readings are low by ~3–4× (still 10⁻⁴ m/s). Supplementary single-source-class
  values μ(Mg) ≈ 1.6×10⁻³, μ(Al) ≈ 1.2×10⁻³ m² V⁻¹ s⁻¹ are available as a low-cost fix; they were not
  cross-checked to the standard of the three core duties, so they are flagged, not ratified.

---

## 4 · PART D — gate assertions to add to `check:bonding-scene`

Sections 8/13/14 are already declared E3b stubs. These are the metallic-specific additions:

1. **Charge conservation across the whole-lattice release (C-10):** Σq(sites) + Σq(released dots) = 0
   at **every instant** of the ramp, not only at its endpoints (the gate-2 analog).
2. **Σq balance across the valence ladder (C-4):** the sea's total negative charge tracks the cores'
   total positive charge at each step 1 → 2 → 3.
3. **`transfer` regression:** `ionic_bonding` S2 renders byte-identical before and after C-10.
4. **D-7 disagreement case — this concept IS it.** A naive like-neighbour count on the cation-only bcc
   lattice is non-zero **before any shift** (8 per interior site), while the shipped screened,
   change-based metric must read **0**. That is the assertion that proves the metric is the real one
   rather than a raw count that happens to print the right pair of numbers.
5. **Determinism (D-1):** the sea is a closed-form function of state-local t — byte-identical under
   `SET_TIME_FREEZE`, and unchanged by a `count`/`valence` slider move for dots already on screen.
6. **`drift` live-zero:** at `field = 0` the HUD prints `0`, not "—".

---

## 5 · PART E — two Checkpoint-B risks to look at first, and one open box

- **S6 at valence 3 (105 dots).** The render convention that makes the sea unoccludable — electron dots
  ship `depthTest:false, depthWrite:false, renderOrder 998` (`:53235–53252`) — also means every dot
  *behind* the block draws in front of it. At the top step the swarm may read as flat confetti over the
  block rather than a 3D sea inside it. Decide during the build (depth-sorted alpha, or `depthTest:true`
  for sea dots once the block is open). **Look at the S6 valence-3 frames before anything else.**
- **S5's re-seat frame** must actually read as "the same pattern, one row over" and not as "nothing
  happened". This is the state's whole payoff: `like_contacts` reads 0 at *every* position of the only
  slider the state exposes, so it is a needle that never tracks (Rule 33d) and cannot be the payoff by
  itself.
- **`query_engine_bug_queue.ts` — RESOLVED 2026-08-03.** A gitignored `.env.local` was placed on this
  worktree and the query ran: **6 OPEN rows** naming `metallic_bonding`, all `row_type=directive`,
  all addressed by the build (one — `explore_controls_not_ring_gated_survive_the_ring_cut` — caught a
  real blocking defect, since fixed). The chemistry false-all-clear was also root-caused rather than
  merely restated: `loadConceptIndex()` does a **non-recursive** `readdirSync` on
  `src/data/concepts/` (`query_engine_bug_queue.ts:52`), so `src/data/concepts/chemistry/` is invisible
  to it. Consequence, precisely: the `--field3d` / `--scenario` **fleet flags are blind to every
  chemistry concept** and a clean sweep from them is worthless; the positional `<concept_id>` path is
  sound (a pure DB `contains` predicate with no dependence on the local index). Residual blind spot:
  wildcard rows whose `concepts_affected` is empty or names only physics siblings. Seven named scars
  were therefore hand-checked — all clear, or unverifiable only because the engine is absent.

### 5.1 · One engine premise confirmed false (already inside Session A's scope — do not double-build)

`field_3d_renderer.ts:53967–53968` stands the Rule-37 forced idle spin down whenever
`thermal.jiggle_scale > 0`, on the stated premise that "jiggle_scale > 0 is already continuous
motion". **That premise does not hold for `placement: 'lattice'`** — `bscJiggle` is called only on
the free-unit path (`:54095`); there is no jiggle call anywhere in the lattice-site draw path. A
lattice explore state authoring `jiggle_scale > 0` therefore gets neither spin nor jiggle and freezes
completely. Confirmed empirically: `metallic_bonding` S7 was byte-identical across a full 30 s dense
capture (max pixel delta 0, all five keyframes identical).

Session A's `ionic_bonding` S10 spec already scopes the fix ("authored `jiggle_scale` is REAL post
D1·S-2, and the idle-spin fallback stands down only on a live motion signal, D1·S-6"), so **no
separate engine bug is filed here** — this is the concrete manifestation and the empirical evidence
for that work. `metallic_bonding` S7 carries an explicit `spin_rate` in the meantime, which remains
correct after the fix lands. **Note for Session A: `ionic_bonding` S10 is `placement:'lattice'` +
explore and will hit exactly this today if it authors `jiggle_scale` without a `spin_rate`.**

---

## 6 · Two ⚑ FOUNDER CALLS (arc-fixed strings — escalated, deliberately not changed)

Both change `docs/CHEMISTRY_PHASE0_BONDING.md` §0b table strings, so they are the founder's call and
neither the architect nor chemistry-author touched them:

1. **S1's delta cue "Atoms pack in rows"** (and the narration "settle into rows") is slightly untrue
   for bcc — the body-centre sites are not in the corner sites' rows, and that is visible in the grown
   block. *"Atoms pack in a pattern"* is four words and true.
2. **S6's "stronger hold"** (title, delta cue, annotation) uses the noun register Rule 41a bans beside
   "grip". *"stronger metal"* — the arc's own title wording — is literal.

---

## 7 · What Desk 3 did NOT do, and why

- **Did not author `src/data/concepts/chemistry/metallic_bonding.json`.** Five contract items (§1) are
  undecided and six of seven states have no engine behind them. Authoring now would be authoring
  against a moving contract — the specific failure the freeze rule exists to prevent, and the shape of
  Desk 1's most expensive defects.
- **Did not touch `src/lib/`, `src/scripts/`, or the Phase-0 doc.** Rule 40, and Session A owns both.
- **Did not run THE EYE, eye-walker, quality-auditor, Checkpoint B, or `visual:approve`.** With one of
  seven states renderable there is nothing for them to read; a green EYE on six static unit scenes
  would be actively misleading (Desk-1 lesson 2).
