# field_3d scenario authoring checklist (the scar pre-flight)

**Read this BEFORE authoring or auditing any `field_3d` concept** (gauss_law*, electric_flux,
charge_distribution, dipole, magnetism diamonds, …). It is the human-readable distillation of the
`engine_bug_queue` field_3d `incident` + `directive` rows — the scars we already paid for. The live,
authoritative source is the table; query it headlessly:

```bash
npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts <concept_id>
npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --field3d --open   # unresolved scars
```

> Why this exists: every `engine_bug_queue` incident before 2026-06-25 was mechanics/PCPL — there were
> **zero field_3d scars**, so the gauss_law_sphere build re-discovered all of these the hard way. Don't
> repeat them. (Seeded by `_seed_engine_bug_queue_field3d.ts`.)

---

## For the architect / physics-author (the `directive` rows — pedagogy)
- **Concrete before abstract.** When a derived result equals a simpler known one, show the simple case
  ALONE first, then bring the complex case in beside it, then highlight that the formulas match.
- **Reveal synced to narration.** Tune each timed reveal's `at_ms` to the narration beat that introduces
  it — no early pop, no static wait. (Motion stays on the sim clock per Rule 26; tune the times to the script.)
- **Coordinate sim + graph.** A state with both a 3D sim and a graph must drive ONE live parameter that
  moves both together (e.g. sphere radius ↔ graph dot). Never ship a static curve.
- **Show a quantity live when it's named.** When narration first says "radius r" / "the field E", draw or
  grow its visual on that beat so the word maps to the picture.
- **Distinct reference lines for two radii.** When R (shell) and r (field point) both appear, draw two
  separate, clearly-labelled lines so students never conflate them.
- **The visual must match the narration.** `trajectory_mode` matches "round and round"; "outside ≈ 0" must
  be SHOWN (a fade/cancellation), not just said.
- **Don't pre-spoil a later reveal.** Gate on-canvas quantities/formulas to the state that teaches them
  (e.g. ε₀ first at STATE_2, never STATE_1; earlier states use the ∝ form).
- **Colour each element by its own sign/identity.** Only aggregates (net field lines, readout) follow the net.

## For json-author
- **Carry every `pause_after_ms` from the physics block.** The classic cross-agent regression is cloning
  electric_flux (which has none) and silently dropping the prediction pauses. field_3d DOES consume them
  via `deriveStateMeta` — Gate 3c will NOT catch the loss (it doesn't run on field_3d; Gate 15 does).
- **Side-by-side offsets > object radius.** Compare offsets must exceed each object's extent (a Gaussian
  sphere of radius 2.4 needs offsets well past ±2.4); shrink groups (`compare_scale`) + widen + pull camera back.
- **Specific `visible_elements` tokens.** The matcher is substring-based — `"wire"` also matches
  `fl_wire_*`/`arr_wire_*`. Use `wire_main`, `curr_arr`, etc.
- **Don't narrate what isn't drawn** (e.g. a STATE_7 hand-flip with no hand object), and don't point
  `focal_primitive_id` at the title label.
- **Interactivity / sliders in the LAST state only.**

## For renderer-primitives (the engine `incident` rows)
- **Register a NEW scenario in `deriveStateMeta.ts` in the SAME change.** Add its per-state
  reveal/hold/motion recognition (maxRevealForField3dState + deriveHoldExpectations) or THE EYE
  mis-classifies every state at the 1500 ms default and false-fails D7/D1p.
- **No frozen tail.** Every reveal must sustain ≥0.1%/frame motion OR the state must be `reveal_hold`.
  One-shot text/opacity fades are too subtle for D7 — declare reveal_hold.
- **Explorers must move.** A slider / `interaction_complete` state needs an idle auto-sweep OR an
  `interactive` hold-intent classification, or D1p fails (the headless harness never drags).
- **Don't gate visuals on the clock in slider states.** The player freezes the clock at the opening frame;
  slider-driven visuals must render at full immediately and track the slider live (the emergence ramp is
  for guided states only).
- **Billboard position/radius vectors to camera-right** so they read horizontal under the 3/4 cameras
  (a fixed world axis foreshortens into a diagonal toward the viewer).
- **Overlays over busy geometry:** `depthTest:false` + high `renderOrder` so thin lines read on top.
- **One-shot elements hold their end pose** (don't let opacity/scale fall to 0 at completion).
- **A radius line that touches a sphere** = length(live radius), placed near the equator so the tip lands
  on the silhouette as the radius changes.
- **Radius-varying orbits draw a full ring each frame about a FIXED centre** — never accumulate a trail
  (it spirals, the centre drifts, a stray self-crossing X appears).
- **Deterministic geometry** for morph/blob surfaces (seeded sin/cos, no per-frame randomness → no flicker).
- **Rule 29:** emphasis = brightness only (`applyGlowEmphasis`/emissive shimmer); a length changes ONLY
  for a real physical magnitude (e.g. `tauThrob`). No size/zoom pulse.
- **Direction-only concepts (RHR / no-work):** never show a magnitude, `r=mv/qB`, or period T; hide F at
  v∥B (no zero stub); honour per-state `ambient_field` and derive the ⊗/⊙ glyph from the SAME `bEff` as F.
- **Suppress the generic B-field legend** per scenario (Rule 24 silent-visual).

## For quality-auditor (Gate 8)
- Run `query_engine_bug_queue.ts <concept>` (and `--field3d --open`) as the Gate 8 regression pass —
  every OPEN row is a known scar to re-check on the new concept; flag any reintroduced class.
- field_3d cognitive flow is audited by **Gate 15** (Pass-2 four-question), NOT Gate 3c.
- THE EYE must read **dense** frames for any radius/parameter ramp, not only the frozen end-state
  (the orbit-spiral and the time-gated-slider bugs are invisible in a single frozen frame).

## Routing / serving (runtime-generation)
- A concept with a `field_3d_config` block must assemble via `assembleField3DHtml` (engine `threejs`) —
  including in the strict-engines bypass — or it silently downgrades to mechanics_2d (p5.js).
- Concept ids with a capital suffix (`…_B`) need the classifier regex `^([a-z][A-Za-z0-9_]*)`.
