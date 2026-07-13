# Design Spec — `gauss_law_magnetism` rebuild (Ch.5 #3, Socratic → straightforward)

**Date:** 2026-07-13
**Concept:** `gauss_law_magnetism` (NCERT Class 12 Ch.5 §5.3 — Gauss's law for magnetism, ∮B·dA = 0)
**Batch:** #3 of 4 in the founder's 2026-07-12 Ch.5 Socratic→straightforward rebuild directive
(1 ✅ `bar_magnet_as_dipole` · 2 ✅ `bar_magnet_in_uniform_field` · **3 ⏳ this** · 4 `earths_magnetism`).
**Renderer:** `field_3d`, scenario `gauss_law_magnetism` (already exists; reuses the electric-gauss
`gaussShapeGeometry`/`gaussBlobGeometry` surface builders + a bar-magnet closed-loop field).
**Reference shape:** concepts #1/#2 (guided distinct-motion states + all-slider sandbox; straightforward
`misconception_watch` with `visual_counter`; delta-cue captions; one formula surface; value-only HUD).

---

## 1. Why a rebuild (not a retrofit)

The existing `gauss_law_magnetism.json` (schema 2.0.0, 6 states) is **Socratic**: `advance_mode:
"wait_for_answer"` (S1, S4), `pause_after_ms` predict→reveal beats (s1_2 "Does the magnetic field line
ever begin somewhere or end somewhere?", s3_1 "so the flux should be positive?", s4_1 "Does the shape of
the surface change anything?"), and `annotation`-type `scene_composition` overlays that the field_3d
renderer **does not even render** (memory `field3d-oncanvas-text-source`: only `field_3d_config.states.
{label,formula_overlay,caption}` render). Rules 31/32/34 retire that shape: guided states are **ONE idea
+ ONE complete motion**, narration 25–55 EN words, cause-first, ≤5-word delta-cue caption, single glow
focal, one formula surface, value-only HUD, no predict-pause. Per the founder directive this is a
**full-pipeline rebuild kept only if the visual quality holds**, not a retrofit-surgeon Socratic-strip.

The **physics is complete and correct** and carries over unchanged:

**Atomic claim.** The net magnetic flux through *any* closed surface is identically zero, ∮B·dA = 0,
because magnetic field lines are continuous closed loops (no sources or sinks, ∇·B = 0) — so every line
that leaves a surface also re-enters it, Φ_out = −Φ_in — and there is **no magnetic monopole**, so even a
surface enclosing a single pole nets zero. The deep contrast is the electric Gauss law ∮E·dA = q_enc/ε₀,
where field lines start and end on charges (real flux sources) so an enclosed charge gives non-zero flux.

**Cut-line.** SCOPE = the flux LAW + the no-monopole consequence + the electric contrast **only**. No
magnetisation / H-field (that is `magnetisation_and_intensity`), no dipole-field derivation or
axial/equatorial 1/r³ (that is the prerequisite `bar_magnet_as_dipole`, #1). Prerequisites
`bar_magnet_as_dipole` + `gauss_law`. Conceptual-only ship (no `mode_overrides`, Rule 20). EPIC-L-first
(no `epic_c_branches`, 2026-06-10).

## 2. The core misconceptions (this concept's identity)

Each confronted **at its own pivot** via a straightforward `visual_counter` contrast beat (cause shown,
then the real consequence — never a predict-pause). Placed at genuine pivots, not per-state (feedback:
`misconception-hooks-pivots-not-per-state`):

| ID | Wrong belief | Confronted at | Visual counter |
|----|--------------|---------------|----------------|
| M1 | Magnetic field lines **start at N and end at S** (like electric lines start/end on charges) | **S1** | A tracer rides one line all the way around — out of N, around the outside, into S, back through the body to N — a closed loop with no ends |
| M2 | A surface around the magnet catches a **net flux out** (the magnet is a source) | **S2** | The live crossing tally shows Φ_out and Φ_in tick up in lock-step; net holds at 0 |
| M3 | A surface around the N pole encloses **"north magnetic charge"** → positive flux (**the monopole belief**) | **S3** ⭐ | The surface shrinks onto N alone, yet the lines emerging outside re-enter through the magnet **body** (bright cutaway) inside the surface — out still = in, net = 0 |
| M4 | A **bigger or oddly-shaped** surface catches a different amount of flux | **S4** | Sphere→cube→blob morph while the net-flux readout holds dead steady at 0 |
| M5 | Gauss's law **always** gives "enclosed source over a constant", so the magnetic version must too | **S5** | Side by side: the +q's lines pierce its surface outward only (Φ_E ≠ 0) while the magnet's loops cross in and out equally (Φ_B = 0) |

> **Note for quality_auditor:** 5 `misconception_watch` entries (one per guided state S1–S5) sits above the
> usual 1–3/concept guidance. Justified as in concept #2: this concept's whole pedagogical identity *is*
> this ladder of distinct confusions (no-ends → net-out → monopole → shape → electric-contrast), each
> attached to a genuinely different idea/state — not a per-state tic. Auditor to sanity-check, not
> auto-FAIL. (The architect may consolidate M1→M2 if S1 reads as pure setup.)

## 3. The 6-state arc (founder-approved: keep the proven spine)

Each state = one idea + one **distinct** motion archetype (no repeat). Guided states S1–S5 are
motion-driven with **no sliders** (deterministic for THE EYE); the **S6 sandbox** exposes both surface
controls. Narration 25–55 EN words/state (physics_author finalizes). Same state IDs as the old build, so
the carried-over `assessment` mapping (STATE_2/3/4/5) stays valid.

| # | Delta cue (≤5w, `caption`) | One idea | Motion archetype (`gm.mode` / flags) | Formula surface | Live HUD | Misc. |
|---|---|---|---|---|---|---|
| **S1** | "Closed loops, no ends" | A bar magnet's B field is continuous closed loops (out N, around, into S, back through the body) — no line starts or ends | **tracer-circulate**: one bright tracer rides a full loop; m shown (`loops`) | — (small "closed loops" label) | — | **M1** |
| **S2** | "Out equals in" | Wrap any closed surface — every loop out also comes back in → net Φ_B = 0 = ∮B·dA | **surface-envelop + count**: Gaussian surface fades in around the whole magnet; tracers cross; tally ticks (`whole`) | `∮B·dA = 0` | `Φ_out +N · Φ_in −N · net 0` | **M2** |
| **S3** ⭐ | "One pole → still 0" | Shrink onto the N pole alone — lines re-enter through the body inside the surface; no monopole — **PRIMARY aha** | **surface-shrink-onto-pole**: surface slides/shrinks onto N; internal return **brightens (cutaway)** (`pole`) | `no monopole → net Φ_B = 0` | `Φ_out +N · Φ_in −N · net 0` | **M3** |
| **S4** | "Shape doesn't matter" | Reshape sphere→cube→blob — net flux stays pinned at 0, independent of shape & size | **shape-morph**: continuous sphere↔cube↔blob morph (`morph`) | `∮B·dA = 0  (any surface)` | `net Φ_B = 0` | **M4** |
| **S5** | "Electric law ≠ 0" | Contrast: a +q's lines pierce outward only → ∮E·dA = q/ε₀ ≠ 0. Charges have ends; magnets don't | **side-by-side reveal**: magnet (loops, Φ_B=0) left vs +q (radial out, Φ_E≠0) right (`contrast`) | `∮B·dA = 0   vs   ∮E·dA = q/ε₀` | — (Φ_B=0 / Φ_E≠0 on the inset labels) | **M5** |
| **S6** | "Drag — always 0" | Free explore: reshape & slide the surface anywhere, even onto one pole — live net Φ_B stays 0 | **free explore** (`sandbox`, `show_sliders`: shape + position) | `live net Φ_B = 0` | `Φ_out · Φ_in · net 0` | — |

⭐ PRIMARY aha = S3 (`aha_moment.state_id: "STATE_3"`, `primary: true`).

**advance_mode:** S1–S5 `manual_click` (guided beats, Rule 15 — never `wait_for_answer`/`auto_after_tts`
now), S6 `interaction_complete` (explore-last). Two distinct modes → Gate 12 satisfied.

## 4. The two founder-delegated quality decisions (locked to recommendation)

**(A) "Out = in" legibility → live crossing tally.** As the closed-loop tracers cross the Gaussian
surface boundary, a value-only HUD maintains running counts `Φ_out` (lines currently poking out) and
`Φ_in` (lines poking back in), which tick up **in lock-step**, with `net = Φ_out + Φ_in = 0` held. This
turns the concept's core claim from an assertion into something the student watches balance in real time
(Rule 33d — live number + the physical change it tracks). The count is a line-crossing proxy for flux
(each field line carries an equal flux quantum in the viz; the net is exactly 0 by the closed-loop
topology). **Renderer work (§7.1).**

**(B) S3 aha → bright body cutaway.** At the PRIMARY aha the `gm_internal` return path (S→N through the
magnet body) becomes the **bright glow focal** *inside* the shrunk surface, so the student sees the lines
that emerged from N re-entering through the body — making "no isolated pole, out still equals in" visible,
not narrated. Single focal at that instant (Rule 32e); peers dim. **Renderer work (§7.2).**

## 5. On-canvas text (Rule 34) & narration (Rule 30)

- **`caption`** = the ≤5-word delta cue (top pill) — the strings in the §3 table. NOT a prose sentence.
  (The old build left every `caption` empty; populate them.)
- **`label`** = a short student headline (state title), e.g. S3 "One pole enclosed — still zero."
- **One formula surface/state** in `formula_overlay` (Cambria-Math Unicode) — the "Formula" column.
- **HUD = value-only** live numbers (Rule 33d/34b): `Φ_out = +6 · Φ_in = −6 · net = 0` — no formula body
  duplicated in the HUD. Convert the old monospace `gm_readout` to the compact value-only style, cleared
  of the review-chrome "Full screen" button (`top:52px`+, Rule 34d).
- **All math Unicode**: ∮ · ∇ Φ ε₀ · × ⊙ ⊗ ² ≠ → — never ASCII (`Phi`, `epsilon0`, `!=`, `->`, `div`).
  Sweep must cover all three text paths (DOM overlays in the concept JSON, canvas graph text, and the 3D
  sprite labels `createLabelSprite`/`createWideLabelSprite` in `field_3d_renderer.ts` — the S5 contrast
  inset already uses `\\u222e`/`\\u03b5\\u2080` escapes; keep that path Unicode-clean).
- **Narration** 25–55 EN words/state, 2–4 tight sentences; **expand bare symbols to spoken names**
  (B→"magnetic field B", Φ_B→"magnetic flux", E→"electric field E", q→"charge q", ε₀→"epsilon-nought");
  colour words stay English; plain English (no Hinglish, no Socratic questioning). Telugu `text_te`
  authored last via the Sonnet-5 code-mix step (Rule 30g). EN audio on-demand only (Rule 30h).

## 6. Real-world anchor (Rule 35 — universal, already culture-neutral)

Carried over, all culture-neutral (no country-specific content): **(primary)** iron filings sprinkled on a
glass sheet over a bar magnet trace the field as continuous loops that leave N and dive back into S —
imagine any closed bubble drawn around it: each loop that pokes out also pokes back in, so the net flux is
zero; **(secondary)** a magnetic compass always shows *both* a north and a south end — snap it in two and
each piece is again a full magnet, so there is no isolated pole to trap inside a surface. (School lab /
compass / cutting a magnet are universal — no localisation needed.)

## 7. Renderer touches (additive; via quality_auditor → renderer-primitives FAIL-route if needed)

The scenario already supports: `loops`/`whole`/`pole`/`morph`/`contrast`/`sandbox` modes, the flowing
closed-loop tracer stream, the shape-morphable Gaussian surface (`gmApplyShape` sphere/cube/blob + slide
to a pole), the `gm_internal` return tube, the S5 electric-contrast inset, `show_sliders` (shape +
position) with the `PM_gmUserDragged` trusted-drag guard, and a `gm_readout` panel. Expected additive work
(likely to surface as EYE-driven fix rounds — concept #1 took 3, #2 took several):

1. **Live crossing-tally HUD (NEW, decision A):** count tracer/loop crossings of the Gaussian surface
   boundary each frame, maintain running `Φ_out`/`Φ_in` tallies, render value-only. Must be
   frame-rate-independent (Rule 36 — derive from the surface geometry + loop paths, not a per-frame
   increment) and **stable/identical under `SET_TIME_FREEZE`** so THE EYE frozen baselines stay
   byte-stable (compute the tally from the frozen surface position, not accumulated frames). Reads the
   same `net = 0` on S2/S3/S4/S6.
2. **S3 body-cutaway brightening (NEW, decision B):** at `gm.mode === "pole"` promote `gm_internal` (and
   its dot) to the bright glow focal inside the surface; dim the external arcs slightly (single focal,
   Rule 32e/29 — brightness only, never a size pulse). Verify the internal return reads as *inside* the
   shrunk surface (depth/position check — memory `renderer-driver-misses-viewport-bugs`: confirm from
   actual EYE pixels, not the node driver).
3. **Delta-cue `caption` render:** the gm scenario hides the legend (`legendEl.style.display="none"`);
   confirm the shared `#caption` overlay still shows `state.caption` (populate all six). If the gm path
   suppresses it, wire the ≤5-word cue.
4. **Value-only HUD restyle (Rule 34):** `gm_readout` → compact Cambria-Math value-only, `top:52px`+ to
   clear the "Full screen" chrome; hidden on S1 and S5 (S5 shows the two contrast values via the inset /
   formula surface, not the flux HUD).
5. **Per-state single glow focal (Rule 29/32e):** if the gm scenario lacks `applyGlowEmphasis` wiring, add
   a per-state focal (S1 tracer, S2 surface, S3 internal-return cutaway, S4 surface, S5 the piercing +q
   lines) with peers dimmed. Closed focal set — a non-keyed focal silently no-ops (memory pattern from
   ohms_law's closed glow enum).

Every renderer edit: `npm run check:renderer-syntax` (node --check on both emitted templates), **no
backticks inside the emitted template body**, keep the frame-rate-independent clock (Rule 36).

## 8. Registration (8 sites) & schema

The concept already exists and is registered; json_author verifies all 8 and updates any that reference
the old structure: concept JSON · `CONCEPT_PANEL_MAP`/`concept_panel_config` (panelConfig.ts:1341) ·
`CONCEPT_RENDERER_MAP`→field_3d (aiSimulationGenerator.ts:2894) + the id-map (:4308) · `VALID_CONCEPT_IDS`
(intentClassifier.ts:435) · `CLASSIFIER_PROMPT` (intentClassifier.ts:931) · clusters SQL migration
(authored-not-applied, N/A-DORMANT this phase) · seed-cache script (`_seed_gauss_law_magnetism_cache.ts`
exists — re-seed after restructure) · **NOT** `PCPL_CONCEPTS` (field_3d, not PCPL), **NOT**
`PILOT_CONCEPTS` (reviewer-first). Keep `schema_version: "2.0.0"` (matches #1/#2; the "2.2 gates" are
validator gates, not the JSON version string). `renderer_pair` both `field_3d`.

## 9. Verification & ship

1. `npx tsc --noEmit` 0 · `npm run validate:concepts` PASS (target concept).
2. Self-review: Rule 15 (≥2 advance_mode: `manual_click` guided + `interaction_complete` sandbox) ·
   Rule 19 (≥3 primitives/state) · Rule 24/34 (reads sound-off, one formula surface, value-only HUD,
   Unicode) · Rule 31 (one idea+motion/state, distinct archetypes, explore-last) · Rule 32 (cause-first,
   delta-cue caption, home-pose continuity, single focal) · Rule 33d (live crossing tally) · Rule 35
   (universal anchor).
3. Cache-clear (4 tables) → re-seed `_seed_gauss_law_magnetism_cache.ts` → `npm run visual:eyes --
   gauss_law_magnetism` (deterministic, $0) → **dispatch eye-walker + quality-auditor in parallel** (main
   session never loads the ~100 PNGs). Zero new `engine_bug_queue` rows; renderer FAIL-route rounds until
   EYE-clean.
4. **Founder visual review → founder triggers `npm run visual:approve`** (baselines locked per concept; a
   text/HUD de-clutter is an *expected* H2 baseline fail — re-baseline, not a fix cycle, Rule 34e).
5. Telugu `text_te` via a `model: sonnet` sub-agent (Rule 30g code-mix). EN audio **on-demand only**
   (Rule 30h — the sim is a silent visual).
6. `npm run build:review -- gauss_law_magnetism` + serve on :8080 → provide the review link.
7. `PROGRESS.md` session log; NOT pushed / NOT in `PILOT_CONCEPTS` unless the founder promotes it.

## 10. Out of scope / YAGNI

No `mode_overrides` (board/competitive suspended, Rule 20) · no `epic_c_branches` (no real students,
2026-06-10) · no deep-dive/drill-down child states (dormant; the old build's `has_prebuilt_deep_dive`/
`allow_deep_dive` flags on S3/S4 drop) · no new `scenario_type` (reuse `gauss_law_magnetism`) · no
magnetisation/H-field · no PCPL/2D work · Hindi audio not rendered (text-only until a Hindi market). The
`assessment` block (6 MCQs) carries over unchanged — its `teaches_state` mapping (STATE_2/3/4/5) already
matches the kept state IDs.
