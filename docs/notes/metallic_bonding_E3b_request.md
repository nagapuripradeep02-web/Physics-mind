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

**Shared with `ionic_bonding` — dispatch ONCE for both:** the `field_at_ms` cue; drag-seize on the
`shift` and `field` rows; the D-7 `like_contacts` metric + HUD line per ionic skeleton §5.2.

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
- **`query_engine_bug_queue.ts` has never been run for this concept** — no `.env.local` on this
  worktree, plus the known chemistry false-all-clear (hardcoded physics concept list). Gate 8 must run
  from a credentialed session before Checkpoint B. It is the only unticked box in the skeleton's §15.

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
