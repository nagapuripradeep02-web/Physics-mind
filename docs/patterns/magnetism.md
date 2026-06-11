# Magnetism patterns library

**Source:** Diamond #1 (`magnetic_field_wire`, archetype A) + Diamond #2 (`magnetic_force_moving_charge`, archetype B) + Diamond #3 (`torque_on_current_loop_in_field`, archetype C — see §9) + Diamond #5 (`biot_savart_law`, archetype A-meta — the *derivation* variant of A; added 2026-06-11). Diamond #4 (`magnetic_field_solenoid`) reuses archetype A and added no new primitives.

**Consumers:** (1) the future `scene_designer` agent (`.agents/scene_designer/CLAUDE.md`, M3) reads this when working any magnetism concept, (2) the M3.5 autoresearch loop scores generated outputs against the "required-primitives-per-archetype" table at the bottom, (3) any human authoring a new magnetism atomic/nano concept reads this before writing the concept JSON or a `program.md`.

**Maintenance rule:** when a diamond session discovers a new visual primitive or choreography, the same PR that ships the diamond also extends this file. Patterns that are not in this file do not exist for downstream agents.

**Reading code anchors:** every `file:line` reference cites a function name confirmed to exist in [field_3d_renderer.ts](../../src/lib/renderers/field_3d_renderer.ts) at the time of writing. Line numbers drift across refactors — if a function moves, grep for the function name, not the line.

---

## 1. Archetype catalog

Three archetypes ship in V1. The fourth (D — atomic/materials) is deferred to M9.

### A — Field visualization

- **Diamond exemplar:** `magnetic_field_wire`.
- **Visual signature:** a source (wire, solenoid, loop, magnet) embedded in 3D space; field lines radiate or curl around the source; a compass probe demonstrates the field direction at a point.
- **Default state arc:** setup at rest → reveal field → polarity case A → polarity case B → single-point analysis (compass at one position) → top-down view (⊗/⊙ pattern) → free explore.
- **Default extras:** `compass`, `right_hand`, `highlighted_point`, source-current-direction-indicator. Field-line geometry built per scenario.
- **Concepts that use it:** straight wire, solenoid, circular loop, moving point charge, bar magnet, Earth's magnetism.

### A-meta — Field *derivation* (the law behind the field)

- **Diamond exemplar:** `biot_savart_law` (Diamond #5).
- **Visual signature:** archetype A's source + field, but the field is **not given** — it is *built from one current element outward*. A single bright `dl` element on the wire, the geometry to a field point P (`r̂`, angle θ), the vector product `dl × r̂`, the contribution `dB` at P, then **many `dB`s accumulate** until the familiar circular field assembles itself.
- **Default state arc (derivation-progression):** show the result you already know → isolate ONE element `dl` → set up the geometry (`r̂`, θ) → build the law from proportionalities (`dB ∝ I·dl·sinθ/r²`) → cross-product direction of `dB` → predict-the-direction practice → **AHA: the circle assembles from Σ dB** → why far ends barely matter (sinθ/r² weighting) → recover `B = μ₀I/2πr` → free explore. (10 states; the two hardest jumps — the cross-product *direction* and the sinθ-weighting/formula assembly — each get their own beat.)
- **Default extras:** *none* of archetype A's compass / right-hand HTML overlays. Instead a per-state `biot_element` block drives `dl` / `r̂` / θ / `dl×r̂` / `dB`, plus in-scene **symbol labels** (`dl`, `r`, θ, `P`, `dl×r̂`, `dB`, `I`, `B`).
- **A-meta vs A — when to use which:** plain A *shows* a field and probes its direction with a compass; A-meta *derives* the field from its source law. Use A-meta for any "where does this field formula come from?" concept — Biot-Savart, the Ampère's-law derivation of the solenoid/toroid field, the on-axis loop field `B = μ₀IR²/2(R²+x²)^{3/2}`.
- **PRIMARY aha = the accumulation state** (the circle assembles itself), never the formula-recovery state. The integral *being* the circle is the insight; the closed-form algebra is the receipt.
- **Two right-hand rules live in this one concept — put the right rule on the right state.** The **grip / thumb rule** (thumb = I, curled fingers = B circulation) answers "which way does the *whole circle* go" → use it on the result-recall state (STATE_1) and the reconciliation state (STATE_9), where it bookends "the thumb rule you already know" → "it was the same rule all along". The **cross-product rule** (flat fingers along dl, curl toward r̂, thumb = dB) answers "which way does *one element's* dB point" → use it on the direction-teaching state (STATE_5) and the apply-it state (STATE_6). **Never put the grip rule on the per-element states** — a single dB is the cross product, not the grip rule; doing so reinforces the `db_radial` / `db_along_wire` misconceptions the EPIC-C branches exist to kill. The other states (zoom-in, geometry, magnitude/proportionality, sinθ-weighting, explore) carry *no* hand — a hand on a magnitude/setup beat is noise. Net: ~4 of 10 states, not all.

### B — Force in field

- **Diamond exemplar:** `magnetic_force_moving_charge`.
- **Visual signature:** an ambient uniform B grid (no source); one charged particle moving through it; v and F arrows that update per frame; trajectory traced as straight line, circle, or helix depending on θ.
- **Default state arc (θ-progression):** STATE_1 θ = 0° (F = 0, baseline drift) → STATE_2 θ = 10° (F appears, small) → STATE_3 θ = 45° (helix tightens, F over 4× bigger) → STATE_4 θ = 90° (pure circle, F max, r and T appear) → STATE_5 Fleming's left-hand reconciliation (Class-10 mnemonic bridge, optional skip via `manual_click`) → STATE_6 "why sin θ" decomposition (v_∥ + v_⊥) → STATE_7 interactive sliders.
- **Default extras:** `ambient_field`, `particle` (with `charge-sign badge`), `velocity_vector`, `force_vector`, `particle_trail`, `palm_rule {show_3d_hand: true}`, `vector_decomposition` (only on the "why" state).
- **Concepts that use it:** Lorentz force on moving charge, force on current-carrying wire, mass spectrometer, cyclotron, velocity selector.

### C — Dipole in field

- **Diamond exemplar (TBD):** `torque_on_current_loop_in_field` (Diamond #3, M2).
- **Visual signature:** external uniform B; a closed-loop / bar-magnet dipole sits in it; opposing forces on opposite sides of the loop produce a torque couple → rotation or oscillation about an axis.
- **Default state arc:** TBD after M2.
- **Concepts that use it:** torque on current loop, bar magnet in field, vibration magnetometer, moving-coil galvanometer.

### D — Atomic / materials (deferred to M9)

Hysteresis, domain walls, electron spin. Different visual primitives entirely; do not retro-fit into archetypes A/B/C.

---

## 2. Primitives — extras catalog

Every primitive in this catalog is a `field_3d_config` block that the renderer recognizes. The shape on the left is what the concept JSON writes; the right column names the function that builds it.

### Shared primitives (both archetypes)

| Primitive | Config shape | Builds at |
|---|---|---|
| `extras.highlighted_point` | `{ position: [x,y,z], label, color, radius }` | [createHighlightedPoint:1207](../../src/lib/renderers/field_3d_renderer.ts:1207) |
| 3D label sprite (canvas texture, always faces camera, draws on top) | `createLabelSprite(text, color, scale)` — used internally by labels + charge badge + v/B/F hand labels. `depthTest:false`, `renderOrder:999`. | [createLabelSprite:1179](../../src/lib/renderers/field_3d_renderer.ts:1179) |
| `equation_panel` (TTS-driven math overlay) | State-level field `equation_panel_anchor: 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` (default `'bottom-left'`). Each `tts_sentence` may declare `math_show: "<LaTeX>"` + `math_persist: true/false`. KaTeX-rendered, fades in per sentence; `math_persist: true` accumulates a derivation chain with earlier lines dimmed. Cleared automatically on state entry. | `#equation_panel` HTML element + `SET_MATH` handler in [setupPostMessage:2867](../../src/lib/renderers/field_3d_renderer.ts:2867); per-sentence dispatch in [_TtsPlayButton.tsx](../../src/app/admin/test-magnetic-force-moving-charge/_TtsPlayButton.tsx) |

### Archetype A (Diamond #1) primitives

| Primitive | Config shape | Builds at |
|---|---|---|
| `extras.right_hand` | `{ case: 'A'|'B'|'both', position, scale }` — HTML/CSS overlay with emoji + curl SVG, visibility classes `rhr-show-a-only` / `rhr-show-b-only` toggled per state via [applyState:2032](../../src/lib/renderers/field_3d_renderer.ts:2032) substring matcher. | [createRightHand:812](../../src/lib/renderers/field_3d_renderer.ts:812) |
| `extras.compass` | `{ position, radius, animate_swing, swing_delay_ms, approach_from, approach_duration_ms }` | [createCompass:894](../../src/lib/renderers/field_3d_renderer.ts:894) + animate loop |
| Source-current-direction indicator | State-level flag `current_direction_indicator: 'up'|'down'` | inside `buildStraightWireField` etc. |
| Field-line geometry around source | Per-scenario `build*Field()` function | [buildStraightWireField:1667](../../src/lib/renderers/field_3d_renderer.ts:1667), [buildSolenoidField:1547](../../src/lib/renderers/field_3d_renderer.ts:1547), [buildBarMagnetField:1602](../../src/lib/renderers/field_3d_renderer.ts:1602), [buildDipoleField:1433](../../src/lib/renderers/field_3d_renderer.ts:1433) |
| State-level flags | `field_rotation_direction: 'cw'|'ccw'`, `current_direction_indicator: 'up'|'down'`, `show_sliders`, `formula_overlay` | consumed in `applyState`/animate loop |

### Archetype B (Diamond #2) primitives — NEW

| Primitive | Config shape | Builds at |
|---|---|---|
| `ambient_field` | `{ direction: [x,y,z], magnitude, density: [nx,ny,nz], color, opacity }` — lattice of parallel arrows representing uniform B. No source. | inline in [buildLorentzForceField:1808](../../src/lib/renderers/field_3d_renderer.ts:1808) |
| `particle` + charge-sign badge | `{ charge_sign, mass_kg, color, radius }` at top level (NOT inside `extras`). The sphere is the proton/electron; a child sprite of the sphere shows `+` or `−` and live-flips on q-toggle. The animate loop rebuilds the badge canvas only on a sign flip, not per frame. | inline in `buildLorentzForceField`; badge uses `createLabelSprite` |
| `extras.velocity_vector` | `{ show, color, scale }` — `THREE.ArrowHelper`. Direction set per frame from `vDir`; length = `scale * glowFactor('v')`. | inline in `buildLorentzForceField` |
| `extras.force_vector` | `{ show, color, scale }` — `THREE.ArrowHelper`. Direction set per frame from `F = q (v × B)`, sign flipped for negative q. Length scales with `sin θ` and, in STATE_6, with the v·B slider product. | inline in `buildLorentzForceField` |
| `extras.vector_decomposition` | `{ show, color_parallel, color_perp, scale }` — emits two extra arrows `v_∥ = (v·B̂)B̂` and `v_⊥ = v − v_∥`. Used on the "why sin θ" state only. | inline in `buildLorentzForceField` |
| `extras.particle_trail` | `{ show, color, equal_arc }` — `THREE.Line` with 600-point buffer. Capped trail by default (one full orbit then stop); becomes a circular buffer with reset-on-slider-edit when the containing state has `show_sliders: true`. | inline in `buildLorentzForceField` animate loop |
| `extras.palm_rule` | `{ show_3d_hand: true, hand_position: [x,y,z], hand_scale: float }` — invokes the 3D right-hand mesh. Empty `{}` means no hand (used on states where the rule is not the focus). | [createLorentzHand:1027](../../src/lib/renderers/field_3d_renderer.ts:1027) |
| `extras.fleming_left_hand` | `{ show: true }` — static SVG overlay (top-left) showing Fleming's left-hand rule with three orthogonal fingers (ForeFinger=B, seCond=v, thuMb=F). **Reconciliation-only primitive: opt-in on exactly one state per concept, never combined with the 3D right-hand mesh.** Pair with `palm_rule: {}` (empty) on the same state so the 3D hand stays hidden. | `#fleming_overlay` HTML element built inline in `assembleField3DHtml()`; toggled in `applyExtras` |
| 3D right-hand mesh contents | Palm (squashed sphere), two-segment thumb (proximal + distal cylinders with anatomical bend), wrist stub, 4 fingers regenerated per frame via `lorentzFingerPoints`, 4 fingernail spheres tracking live fingertips, 3 label sprites (v / B / F), 3 ArrowHelpers (v / B / F) — all children of the hand group. | [createLorentzHand:1027](../../src/lib/renderers/field_3d_renderer.ts:1027) + [lorentzFingerPoints:981](../../src/lib/renderers/field_3d_renderer.ts:981) |
| State-level flags | `trajectory_mode: 'static'|'straight'|'circle'|'helix'`, `theta_deg`, `charge_sign` (override), `show_sliders`, `formula_overlay` | consumed in `buildLorentzForceField` animate loop |
| Slider controls (state-6 only) | Top-level `slider_controls: { q_sign, v, B, theta_deg }` each with `{ min, max, step, default, label }` | [setupSliders:2210](../../src/lib/renderers/field_3d_renderer.ts:2210) |

### Archetype A-meta (Diamond #5) primitives — NEW

All driven by a per-state `biot_element` block (NOT `extras`). Every vector is a **grow-from-origin group** so the animate loop can draw it outward from its tail on a per-state schedule.

| Primitive | Config shape | Builds at |
|---|---|---|
| Top-level `biot_defaults` | `{ field_point_P: [x,y,z], wire_half_length, num_elements }` — scene-constant geometry shared by every state. | read in [buildBiotSavartField:2279](../../src/lib/renderers/field_3d_renderer.ts:2279) |
| Per-state `biot_element` | `{ accumulate_mode: 'single'|'sequence'|'integrated', show_rhat, show_theta, show_cross, show_dB, show_current_flow, direction_practice, weight_by_sin_theta, circle_opacity, reveal_at_ms, reveal_stagger_ms, reveal_fade_ms }` | applyState reset [:3665](../../src/lib/renderers/field_3d_renderer.ts:3665) + animate loop [:4402](../../src/lib/renderers/field_3d_renderer.ts:4402) |
| `dl` current element | short, fat, emissive `createWire` segment at the wire origin (id `bs_dl`) — reads as "this one piece". | inline in `buildBiotSavartField` |
| `r̂` arrow + angle arc θ | grow-from-origin `bsArrow` element→P (id `bs_rhat`) + a `TorusGeometry` arc between `dl` and `r̂` (elementType `biot_theta`, id `bs_theta`). | `bsArrow` + inline arc |
| `dl × r̂` and `dB` | two grow-from-origin `bsArrow`s (ids `bs_cross`, `bs_dB`); `dB` sits at P, ⊥ to both, tangent to the circle. | `bsArrow` |
| Accumulation elements | N `biot_accum` groups (one per element along the wire), each carrying `userData.sinThetaWeight` + `userData.elemIndex` so the sequence reveal + sinθ-weight emphasis can address them individually. | inline loop in `buildBiotSavartField` |
| Assembled circle | 3 ring `biot_circle` lines at radius `rP` + a tangent arrow (id `bs_circle_arr`, with `userData.orbitRadius`) that orbits to show circulation. | inline in `buildBiotSavartField` |
| Current-flow dots | 7 emissive spheres (elementType `biot_flow`) that march up the wire when the state sets `show_current_flow`. | inline + animate block (2) |
| Orbit arrow (top-down practice) | `biot_orbit` tangent arrow circulating the wire when `direction_practice: true` — gives the otherwise-sparse top-down ⊙/⊗ state live motion. | inline + animate block (5) |
| Scan ring | `biot_scan` torus that travels down the wire during the `weight_by_sin_theta` state, sweeping attention element-to-element. | inline + animate block (6) |
| In-scene symbol labels | `bsLabel(text, pos, color, id, revealAt)` → camera-facing `createLabelSprite` at scaleFactor 0.5, `userData { elementType:'biot_label', isLabel:true, grows:true, fadeChildren:false }`. **Label id = `<element_id>_label`** (e.g. `bs_dl_label`) so the host element's existing `visible_elements` token (`bs_dl`) auto-matches it by substring — zero extra per-state JSON. Non-ASCII glyphs MUST be emitted as `\uXXXX` escapes in the template-literal source (the renderer is serialized to an HTML string and browser-eval'd): theta = `\\u03b8`, cross/times = `\\u00d7`, combining-hat (for r-hat) = `\\u0302`. | [bsLabel:2513](../../src/lib/renderers/field_3d_renderer.ts:2513) → [createLabelSprite:1179](../../src/lib/renderers/field_3d_renderer.ts:1179) |
| Grip / thumb-rule hand (ANIMATED) | Reuses the Diamond-#2 animatable mesh `createLorentzHand` at **identity orientation** — which already IS the grip gesture for a +y wire: thumb +y = I, and the finger sweep −z→−x is a positive rotation about +y = the B circulation sense for current up. Relabeled: thumb arrow recolored amber = I, curl arrow green = B; "I"/"B" sprites at the f/b label landmarks. **2-beat curl cycle (7 s)**: flat hold ("I" on thumb) → curl → full-curl hold ("B" on the curled fingertips) → uncurl. elementType `biot_grip_hand`; shown via per-state `biot_element.show_grip_hand`. | `createLorentzHand` + biot animate block (7) |
| Cross-product hand (ANIMATED) | Reuses the Diamond-#2 mesh `createLorentzHand` **relabeled** v/B/F → dl / r-hat / dB and **re-oriented** to the biot frame via `Matrix4.makeBasis(-curlDir, dB, -dl)` (flat fingers −z → dl, curled tips −x → r-hat side, thumb +y → dB; det = +1, so never a mirrored/left hand). **3-beat curl cycle (9 s, Diamond-#2 timing)**: flat hold ("dl") → curl → mid-curl hold ("r̂") → curl → full-curl hold ("dB" on thumb) → snap back. Fingers regenerate per frame via `lorentzFingerPoints`; nails track live fingertips. elementType `biot_cross_hand`; shown via `show_cross_hand`. | `createLorentzHand` + `lorentzFingerPoints` + biot animate block (7) |
| Per-state hand position | `biot_element.grip_hand_position` / `cross_hand_position` ([x,y,z]) override the hand's build-time `userData.homePos`, set in applyState when the hand is shown. **Needed because front-view and top-down states frame the same hand differently** — compute the target from the camera basis (screen-right ≈ `normalize(viewDir × up)`; note its z-component is negative for the default camera, so increasing world-z moves the hand *left*). | applyState hand block [:3665+](../../src/lib/renderers/field_3d_renderer.ts:3665) |

---

## 3. Choreographies — named animation idioms

A choreography is a state-to-state or per-frame animation pattern that has a name and a behavior contract. JSON declares it; the renderer implements it.

### Archetype A (Diamond #1)

- **`compass-approach-then-deflect`** — probe glides from `approach_from` to its final position over `approach_duration_ms`, then waits `swing_delay_ms`, then the needle swings to the physics-correct B direction. Implemented in [createCompass:894](../../src/lib/renderers/field_3d_renderer.ts:894) + animate loop.
- **`field-circle-rotation`** — field-line arrows orbit the source axis at a fixed angular velocity; sense controlled by state-level `field_rotation_direction`.
- **`current-flow-dots`** — yellow spheres interpolate along the source path to visualize conventional current.

### Archetype B (Diamond #2) — NEW

- **`closed-form-trajectory`** — particle position parameterized by `t_local = time − stateStartTime`. No numerical integrator. Modes:
  - `static` — particle at origin; `vDir = bUnit·cos θ + u1·sin θ`. Used on states where motion would distract.
  - `straight` — particle drifts along B when θ < 30°, else along u1; `vDir = drift axis`. Used on STATE_1.
  - `circle` — `pos = R·(cos φ, sin φ, 0)` in the (u1, u2) plane; `vDir = (−sin φ, cos φ, 0)`; phase φ = `ω · t_local · sign(q)`. Used on STATE_4.
  - `helix` — circle in (u1, u2) plus drift `axial ∝ cos θ` along bUnit; `Rperp = R · max(0.05, sin θ)`. Used on STATE_2, STATE_3, STATE_5, STATE_6.
  - Visual constants `R = 1.5`, `ω = 0.75` by default; both scaled by sliders in STATE_6 (see `slider-driven-physics` below).
- **`3-phase-pause-animation`** — 9-second cycle for the 3D right-hand. `curlT` smooth-stepped through three holds where the matching label + arrow are visible:
  - 0–15% hold flat (curlT = 0), **v phase** — v label + v arrow visible at fingertips.
  - 15–35% curl 0 → 0.5 (no label).
  - 35–50% hold mid-curl (curlT = 0.5), **B phase** — B label + B arrow visible.
  - 50–70% curl 0.5 → 1 (no label).
  - 70–92% hold full curl (curlT = 1), **F phase** — F label + F arrow visible at thumb tip.
  - 92–100% uncurl 1 → 0.
  - Finger geometry regenerated per frame; nails track live fingertip positions; hand is oriented every frame so that thumb aligns with `F_world` and `−z_local` aligns with `+v_world`.
- **`slider-driven-physics`** (STATE_6 only) — read v and B sliders, normalize against `slider_controls.{v,B}.default` to get `vFactor` and `BFactor`. Map to:
  - `R_visual = 1.5 · vFactor / BFactor` clamped to [0.35, 2.4] world units (matches r = mv/qB).
  - `ω_visual = 0.75 · BFactor` clamped to [0.20, 3.00] rad/s (matches ω = qB/m).
  - F-arrow length = `fLenRaw · vFactor · BFactor` clamped to 2.0 (matches |F| = qvB sin θ).
- **`trail-reset-on-slider-edit`** (STATE_6 only) — any input event on v/B/θ/q-toggle sets a module-scope `lorentzTrailResetPending = true`. The next animate tick resets `filled = 0`, `write_index = 0`, `drawRange = 0`, so the old curve disappears and the new orbit draws cleanly from the current particle position.
- **`tts-driven-glow-pulse`** — `glowTargets` is an ARRAY of strings (was a single string until 2026-05-14 — co-glow iteration). Values: `'v' | 'f' | 'v_parallel' | 'v_perp' | 'b' | 'trail' | 'hand' | 'fleming' | 'sliders' | 'fleming_index' | 'fleming_middle' | 'fleming_thumb'`. Set via `SET_GLOW` postMessage which accepts either a single string OR an array; the renderer normalises to an array internally. `glowFactor(target)` returns the pulse if `target ∈ glowTargets`. 3D-scene elements (vector arrows, vector labels, ambient B-field grid, particle trail, 3D right-hand mesh) pulse via scale formula `1.35 + 0.35·sin(time·3.5)`, range `[1.0, 1.7]`, ~1.8-second cycle. **DC-offset design**: the formula sits ABOVE the un-glowed baseline (1.0) for its entire active duration, so a glowing element is conspicuously enlarged the whole time, with a soft pulse on top. HTML overlays (`#fleming_overlay`, `#lorentz_sliders`) glow via a CSS `.glow-pulse` class — `@keyframes overlayGlowPulse` provides a matching amber box-shadow that is visible at every keyframe (18px / 5px / 55% opacity at 0%/100%, peaks at 36px / 12px / 100% opacity at 50%) + border-color pulse at the same 1.8-second period. Founder calibration log 2026-05-12: ±35% / 1 Hz read as a hard throb; ±12% / 3 s invisible; ±30% / 2.4 s still too subtle; ±55% / 1.8 s centered-on-1.0 — visible only at peak, invisible at trough; **`1.35 + 0.35·sin` always-elevated** — clearly visible at every phase. Trail pulses via `material.opacity` (geometry unchanged); particle sphere itself does not glow (the v/F arrows attached to it already do when their targets fire).
- **`tts-driven-hand-phase-freeze`** (Diamond #2 — founder note 2026-05-14) — when a sentence narrates one step of the right-hand rule ("flat palm shows v", "curl through B", "thumb along F"), the 3D right-hand mesh locks at the matching curl phase instead of cycling on its own 9-second clock. Schema: `hand_phase?: 'v' | 'b' | 'f' | null` on each TTS sentence; `SET_HAND_PHASE` postMessage sets a module-scope `heldHandPhase`. In the `curlT` calc, `heldHandPhase` short-circuits the cycle: `'v' → curlT=0`, `'b' → curlT=0.5`, `'f' → curlT=1`. Glow + label-toggle + finger geometry regeneration all keep running normally — only the phase advance is frozen. Used by s4_3b/c/d and s6_6b/c/d.
- **`tts-driven-proton-freeze`** (Diamond #2 — founder note 2026-05-14) — when a sentence narrates a property of the F or v arrow on the moving proton ("F appears, perpendicular to both v and B", "F has grown to 71%", "F always points to centre"), the proton's trajectory time is held at the snapshot value so its position (and therefore the arrow base) stops drifting across the canvas mid-sentence. Schema: `freeze_proton?: boolean` on each TTS sentence; `SET_FREEZE_PROTON` postMessage sets a module-scope `protonFreezeAt = (frozen ? t_local_now : null)`. Inside the trajectory math, `tLocal = (protonFreezeAt != null ? protonFreezeAt : time − stateStartTime)`. Glow pulse, hand cycle, and camera continue ticking — only the proton position is frozen. Used by s2_2, s2_3, s3_2, s4_2b.
- **`co-glow-multi-target`** (Diamond #2 — founder note 2026-05-14) — for sentences that genuinely name two co-equal scene elements at once ("v cosθ along B", "cross product of B with anything along B is zero"), `glow` accepts a JSON array — both elements pulse simultaneously. Splitting the sentence would chop the physics, so this is the cleaner option. Renderer stores `glowTargets[]` and every per-element check uses `glowTargets.indexOf(t) >= 0`. Used by s2_2, s3_1, s5_2a/b/c, s6_2, s6_3a, s6_4a.
- **`fleming-per-finger-glow`** (Diamond #2 — founder note 2026-05-14) — STATE_5 narrates the three Fleming fingers one at a time ("Index along B", "Middle along v", "Thumb along F"). Glowing the whole panel for all three is no better than glowing nothing. Each finger is wrapped in a `<g id="fleming_{index|middle|thumb}_finger">` group containing the phalanx line, nail ellipse, fingertip arrow, arrowhead polygon, and finger label. New CSS keyframe `@keyframes flemingFingerGlow` uses `filter: drop-shadow(amber)` (NOT box-shadow — that doesn't work on inline SVG children) + a subtle `transform: scale(1.05)` to make the active finger pop. 1.8s period matches the `.glow-pulse` overlay halo for perceptual sync. Combined with scene co-glow via the array form: s5_2a → `["fleming_index", "b"]`, s5_2b → `["fleming_middle", "v"]`, s5_2c → `["fleming_thumb", "f"]`.
- **`entry-phase-trajectory`** (Diamond #2 — founder note 2026-05-14, STATE_3 first) — for closed-form helix states, optional `entry_duration: number` (seconds) on the state config inserts a straight-line approach BEFORE the helix begins. The proton flies in from outside the field along the helix's tangent vector at `tJoin = 0`, arriving at the helix-start position exactly when `tLocal = entry_duration`. Approach speed = `√((ω·R⊥)² + (0.35·cosθ)²)`, matching the helix tangent magnitude so there is no visual jolt at the join. Inside the helix branch: `tJoin = max(0, tLocal − entryDur)`; for `tLocal < entryDur`, `newPos.addScaledVector(vDir, −entrySpeed · (entryDur − tLocal))`. Companion `RESET_TRAJECTORY` postMessage (fired automatically by `_TtsPlayButton.play()`) resets `stateStartTime = time` and queues a trail clear, so the entry phase replays in sync with sentence 1. Used by STATE_3 with `entry_duration: 2.6`, narrated by s3_1a / s3_1b.

### Archetype A-meta (Diamond #5) — NEW

- **`grow-from-origin-arrow`** — every Biot-Savart vector (`dl`, `r̂`, `dl×r̂`, `dB`) is a `THREE.Group` positioned at its tail, with the shaft tube + cone head built in LOCAL coords (origin→tip). The animate loop draws it *outward* by scaling the group `0→1` via `smooth01((localMs − revealAt·revFactor) / growMs)` and fades the children through their stored `baseOpacity`. `revFactorB = (mode==='single') ? 1 : 0.28` and `growMsB = (mode==='single') ? 720 : 450` — single-element teaching states get a slow, deliberate draw-on; sequence/integrated states reveal fast so the narrative beat isn't held up. Built by [bsArrow:2312](../../src/lib/renderers/field_3d_renderer.ts:2312); reveal logic = animate block (1) at [:4428](../../src/lib/renderers/field_3d_renderer.ts:4428). **Reusable for any "construct a vector while narrating it" beat**, not just Biot-Savart.
- **`staggered-element-accumulation`** (the AHA) — `accumulate_mode: 'sequence'` lights up N `biot_accum` elements along the wire on a stagger: element `i` fades in over `reveal_fade_ms` starting at `reveal_at_ms + i·reveal_stagger_ms`. The assembled `biot_circle` opacity ramps in lockstep with how many elements have appeared (`progB` from `revealAt` → `lastStart`), so the student watches the circle **build from contributions** instead of appearing whole. Conceptually cloned from archetype A's solenoid `per_turn_field_circles` reveal timing. Animate blocks (3)+(4) at [:4462](../../src/lib/renderers/field_3d_renderer.ts:4462).
- **`sin-theta-weighted-contribution`** — `weight_by_sin_theta: true` scales each accumulation element's wire marker by `mkScale = 0.4 + 1.6·sinThetaWeight` (weight = sinθ/r², precomputed into `userData.sinThetaWeight`). The element level with P swells; the near-collinear far ends visibly shrink toward nothing — making "the ends barely matter" something the student *sees*, not a claim they're told. Pair with the `biot_scan` ring travelling the wire to direct attention element-by-element. Animate blocks (3)+(6).
- **`element-label-substring-match`** — in-scene symbol labels reuse the host element's `visible_elements` token by naming the label id `<element_id>_label`. The renderer's substring matcher (`ud.id.indexOf(token) >= 0`) shows/hides + reveals the label automatically with its element, so a state that already lists `bs_dl` gets the `dl` glyph for free — adding a labelled vector costs zero new JSON. Reset/reveal split: labels fade via `material.opacity` (the `isLabel` branch), vectors scale `0→1` — see the `bud.isLabel` fork in animate block (1). **Generalizes to any labelled-primitive renderer** where labels should track their host's visibility.
- **`orbiting-tangent-arrow`** — for the otherwise-static top-down direction-practice state (`direction_practice: true`) and the result circle, a single tangent arrow circulates the wire (`pos = r·(cosφ, 0, −sinφ)`, oriented to the path tangent via `Quaternion.setFromUnitVectors`) so a top-down ⊙/⊗ scene has live motion instead of a frozen diagram. Animate block (4) `bs_circle_arr` + block (5) `biot_orbit`.
- **`grip-rule-2-beat-curl`** — the grip/thumb-rule variant of Diamond-#2's `3-phase-pause-animation`, for hands that teach circulation rather than a cross product. 7-second cycle: flat hold 0–22% (thumb arrow + "I" visible) → smoothstep curl 22–45% → full-curl hold 45–88% (curl arrow + "B" visible at the fingertips) → uncurl 88–100%. Same per-frame `lorentzFingerPoints` regeneration, so the closing fist reads anatomically. The cycle clock is `localMs` (state-entry-relative), so the story always begins flat. Biot animate block (7). **Reusable for any grip-rule concept** — solenoid axis-field, circular loop μ direction, toroid.

---

## 4. Overlay patterns

How chrome (text, sliders, formulas, labels) lays out around the 3D scene.

### Archetype A (Diamond #1)

- Two-case A/B HTML/CSS RHR overlay with visibility classes `rhr-show-a-only` / `rhr-show-b-only` toggled by [applyState:2032](../../src/lib/renderers/field_3d_renderer.ts:2032)'s substring matcher.
- Sliders + B-readout panel anchored top-right when `show_sliders: true`.
- Multi-line monospace formula overlay top-right (`formula_overlay` state field).

### Archetype B (Diamond #2) — NEW

- **3D label sprites** built via `createLabelSprite`. `depthTest:false` + `renderOrder:999` so they always draw on top of arrows. Used for v/F/v cos θ/v sin θ labels next to scene arrows AND for v/B/F labels on the hand.
- **Charge-sign badge** is a child sprite of the particle mesh. Canvas redrawn only on sign flip (cheap, not per-frame). Tracks the particle through every trajectory automatically.
- **Phase-gated label/arrow visibility** inside `createLorentzHand`'s child group: v label + v arrow visible only when `phaseLabel === 'v'`; same for B and F. Toggled per frame by the animate loop reading `phaseLabel` from the 9-second cycle.
- **STATE_6 sliders panel** — q-toggle button (+e / −e) + three range inputs (|v|, B, θ) + live F-readout in femto-Newtons. Anchored top-right. Formula overlay (F = qvB sin θ / r = mv/qB / T = 2πm/qB) anchored bottom-right so it never overlaps the sliders.

### Collision rule

When a state declares both `show_sliders: true` AND has a 3D overlay (palm_rule or right_hand), the 3D overlay MUST sit on the opposite corner from the slider panel. Diamond #2 learned this the hard way in mid-session — STATE_5 originally had both at top-right and they overlapped.

---

## 5. Physics helpers

These are NOT separate functions — they're inlined directly in the relevant `build*Field` animate loop. Documented here so future authors can find the formulas without re-deriving them.

### Orthonormal basis from B direction

Used in `buildLorentzForceField` to build a stable frame for trajectory math regardless of which direction `ambient_field.direction` points:

```
bUnit = normalize(direction)
u1    = (1,0,0) − (bUnit · (1,0,0)) · bUnit;  if (|bUnit · (1,0,0)| > 0.99) use (0,1,0) instead
u1    = normalize(u1)
u2    = normalize(cross(bUnit, u1))
```

### Lorentz force direction

```
fVec   = cross(vDir, bUnit)
if (q < 0) fVec *= −1
fLen   = |fVec|         // equals sin θ for unit-length vDir and bUnit
fDir   = normalize(fVec)
```

### STATE_6 slider scaling (already in `slider-driven-physics` choreography above)

```
vFactor = v_slider_value / slider_controls.v.default
BFactor = B_slider_value / slider_controls.B.default
R       = clamp(1.5 · vFactor / BFactor,           0.35, 2.4)
ω       = clamp(0.75 · BFactor,                    0.20, 3.00)
|F|     = clamp(|F|_raw · vFactor · BFactor,        0,    2.0)
```

### Right-hand mesh handedness convention (Archetype B)

The 3D right-hand mesh in `createLorentzHand` uses this local frame:

| Local axis | Physical meaning | Why |
|---|---|---|
| `+y_local` | thumb = F | Thumb sticks up from the palm sphere. |
| `−z_local` | flat fingers = v | At `curlT = 0`, fingers extend in the `−z` direction. |
| `−x_local` | curled fingertips = B | At `curlT = 1`, fingertips arc around to point `−x`. |

Verification: `(−z) × (−x) = (z × x) = +y` ✓ matches right-hand rule.

`lorentzFingerPoints` uses **negative** `sweepTheta = −π/1.8 · fingerLength` so the curl goes from `−z` to `−x` (not `−z` to `+x`, which would be the wrong handedness). The orientation logic in the animate loop aligns `−z_local` with `+v_world` via a quaternion twist around the thumb-aligned axis.

---

## 6. Pedagogy patterns

State-arc and per-state authoring conventions that survived the diamond review for both Diamond #1 and Diamond #2.

### Universal (both archetypes)

- **Per-state caption names the *why*, not the *what*.** A bad caption: "θ = 45°, helix visible." A good caption: "θ = 45°. F has grown to 71% of max — over 4× the force at 10°. Helix tightens; circular motion dominates the drift."
- **`advance_mode` variety** — every concept must use ≥ 2 distinct `advance_mode` values across its EPIC-L states (CLAUDE.md Rule 15). Diamond #2 uses 4: `auto_after_tts`, `manual_click`, `wait_for_answer`, `interaction_complete`.
- **`allow_deep_dive: true`** on the 2–3 hardest states only. Diamond #2 sets it on STATE_4 (full RHR application) and STATE_6 (interactive, where students can produce unexpected geometries).
- **`aha_moment` placement** — on the first state where the concept's defining insight becomes visible. Diamond #1: when field-line direction is revealed by the compass. Diamond #2: STATE_2, the first state where F appears. Statement length ≤ 15 words.

### Archetype A pedagogy

- **State arc:** setup at rest → reveal field → polarity A → polarity B → single-point analysis → top-down view → free explore.
- Compass appears AFTER the field, not before — student needs to see the field exists, then ask "what direction at this point?" then the probe answers.

### Archetype B pedagogy — NEW

- **θ-progression state arc** (default for archetype B): 0° → small θ → 45° → 90° → "why sin θ" decomposition → interactive. The progression makes `F = qvB sin θ` and the v∥/v⊥ decomposition emergent rather than declared.
- **Motion in every state.** The founder explicitly rejected passive "setup with no motion" states. Even STATE_1 (F = 0) has visible drift along B so the student sees that an unforced charged particle still moves.
- **The "why" state separates from the "what" state.** STATE_4 ends the descriptive arc ("F max, pure circle, r = mv/qB"). The "why sin θ" state starts the explanatory arc ("but where does sin θ come from? decompose v"). Do not collapse them — students who don't ask "why sin θ" still see the math; students who do ask get a dedicated visual.
- **Reconciliation states bridge prior mnemonics — short, optional, isolated.** Indian Class-10 boards teach Fleming's left-hand rule for the motor effect; Class-11/12 NCERT + JEE/NEET use the right-hand cross product. Diamond #2 places a dedicated Fleming reconciliation state (STATE_5, between θ=90° and "why sin θ") that (a) reuses the same θ=90° scene continuing in the background, (b) hides the 3D right-hand mesh so the Fleming SVG sits alone in the top-left, (c) is `manual_click` so students who don't need the bridge skip in 2 seconds, (d) carries no `math_show` — pure verbal bridge. **Footnote the scope explicitly:** Fleming's left-hand only works for positive charge and θ=90°; the right-hand rule stays canonical for negative q and any θ. Apply the same pattern any time a chapter has a Class-10 mnemonic that competes with the v×B framework.
- **Interactive state always last.** STATE_6 invites the student to break the picture. Place it after every prior state has explained one axis (θ, v, B, q) so the slider edits feel motivated.

### State-count decomposition rubric (how to derive the arc for a NEW concept)

The number of EPIC-L states is **never copied from another concept**. Diamond #1 has 7 states because B-field-around-a-source has 7 natural sub-truths; Diamond #2 has 6 because Lorentz force has 6. The next concept's count emerges from its own sub-truth list.

**The 2-minute student-first-pass contract.** Every atomic concept — diamonds and the ~14 atomic M5 concepts — must convey its core insight in ≤ 2 minutes on the first watch. Nano concepts stay at 2 states per [CLAUDE.md SECTION 7](../../CLAUDE.md). Students who need more depth click into deep-dive on any state flagged `allow_deep_dive: true`; deep-dive runs longer (60–90s typical per parent) and is opt-in, so it does not consume the 2-minute budget.

At ~15–25 seconds per state (TTS + visual + advance time), 2 minutes implies **5–8 states**. If your sub-truth list demands more, the surplus moves into deep-dive, not into the parent arc.

**Five-step decomposition method** (Claude drafts, founder reviews):

1. **Enumerate sub-truths from the source.** Read the DC Pandey section table-of-contents and the `physics_engine_config.formulas` in the concept JSON. Write a numbered list of every belief the student must hold by the end of the concept — only include sub-truths that change a prediction or a behavior. Don't pad with restatements.

2. **Cluster sub-truths that share a visual.** Each cluster of sub-truths that can be taught with one camera, one set of primitives, and one piece of motion becomes one state. Sub-truths that need their own primitives or their own camera get their own state.

3. **Runtime audit.** `state_count × 20s` should land between 90s and 120s. If over, push the lowest-priority sub-truth(s) into deep-dive on the most relevant parent state. If under 90s, the concept is probably under-explained — either a sub-truth is missing or the concept belongs as a nano.

4. **Logical-flow check.** Each state must answer "why are we looking at this *next*?" with a reason that ties back to the previous state. If two states can be swapped without breaking the flow, the arc isn't strong enough — re-cluster.

5. **Tag deep-dive parents.** Mark 2–3 states where students typically lose grip (geometric handedness, math-heavy derivations, interactive break-the-picture states) with `allow_deep_dive: true`. The actual child states are M5+ work and not required for the parent to ship.

**Worked example — `magnetic_field_solenoid` (archetype A, atomic, M5):**

Sub-truths from DC Pandey §26.7:
1. A solenoid is a long coil of wire with current running through each turn.
2. The B-field inside the solenoid is uniform and parallel to the axis.
3. The B-field just outside the solenoid is approximately zero.
4. `B_inside = μ₀ · n · I` where `n` is turns per unit length.
5. Increasing current or turn density both raise B linearly.
6. An iron core multiplies B by relative permeability μ_r (real solenoids use this).
7. Real-world anchor: MRI machine at an Indian hospital.

Clustering → states:
- STATE_1 (sub-truth 1): wire wraps into a coil, current flows through each turn. Visual: animated current-flow dots along the wire path.
- STATE_2 (sub-truths 2 + 3): reveal field — dense parallel arrows inside the coil, fading to ~zero outside.
- STATE_3 (sub-truth 4): formula appears with right-hand-rule curled-fingers overlay. **aha_moment** state.
- STATE_4 (sub-truth 5): sliders for I and n; B-readout updates live. **`allow_deep_dive`** (students will want the Ampèrian-loop derivation).
- STATE_5 (sub-truth 6): toggle iron core on/off, watch B multiply by μ_r ≈ 1000 for soft iron.
- Sub-truth 7 is the caption anchor on STATE_1, not its own state.

Final: **5 states, ~100s runtime.** Deep-dive on STATE_4 elaborates Ampère's-law derivation in 4–5 child states.

**Worked example — `velocity_selector` (archetype B, atomic, M5):**

Sub-truths from DC Pandey §26.5:
1. A velocity selector crosses an E-field and a B-field perpendicularly.
2. A charged particle in the region feels `F_E = qE` and `F_B = qv × B` simultaneously.
3. The two forces cancel exactly when `v = E/B` — that particle travels straight through.
4. Particles with `v > E/B` deflect one way; `v < E/B` deflect the other way.
5. Used as the front-end filter in mass spectrometers (anchor: ISRO LDMS instruments).

Clustering → states:
- STATE_1 (sub-truths 1 + 2): setup — E-field (vertical arrows), B-field (into page), one particle entering. Both force vectors visible. **aha_moment** is queued.
- STATE_2 (sub-truth 3): at exactly `v = E/B`, F_E and F_B sum to zero, particle goes straight. **aha_moment** state.
- STATE_3 (sub-truth 4): three particles enter at `v_slow`, `v_match`, `v_fast`. Only the match-velocity one exits the slit.
- STATE_4 (sub-truth 5): interactive — slider for entering `v`, exit slit either lets the particle through or deflects it away. **`allow_deep_dive`** for the algebraic derivation of `v = E/B`.

Final: **4 states, ~80s runtime.** Tight because the concept itself is tight — no need to pad.

**Counterexample — when count grows past 6:**

`mass_spectrometer` would naturally need: velocity selector front-end + ion entry into a uniform B → semicircular path + radius depends on m/q + detector position records the mass + multiple isotopes produce multiple peaks. That's 5 distinct visual stages plus an interactive state = 6 minimum. If a 7th "molecular vs atomic ions" sub-truth surfaces, push it to deep-dive on the isotope-peaks state or split into a sibling concept. Do not stretch the parent arc past 8 states even if the sub-truth list demands it — at that point, you have two concepts pretending to be one.

**Sub-truth list authoring**: I (Claude) read the DC Pandey section and the concept's `physics_engine_config` formulas, then propose the numbered sub-truth list before authoring any state. Founder review approves or edits the list. Once approved, the clustering and state authoring follow mechanically. This decouples "what should the student believe?" (pedagogical judgement, founder-gated) from "how do we visualize each belief?" (Claude's job).

### Deep-dive authoring contract

Deep-dive is the opt-in elaboration of a single parent state — 4–6 child states per parent ([CLAUDE.md SECTION 7](../../CLAUDE.md)), triggered by the student clicking the "Explain step-by-step" button. Cache key: `concept_id | state_id | class_level | mode`.

**Scope restriction — deep-dive applies to atomic and diamond concepts only. NEVER to nano concepts.** Nano is defined in CLAUDE.md SECTION 7 as ALWAYS exactly 2 states (one symbol or formula term) — it is already the smallest teaching unit in the system. Decomposing a 2-state nano into 4–6 child states either repeats the same content with finer chunks (no pedagogical gain) or escapes the concept itself (meaning the original was the wrong granularity and should have been authored as atomic instead). Concretely:

- Never set `allow_deep_dive: true` on a nano JSON's two states.
- Do not schedule a hand-authored deep-dive for a nano at M2.5 or any other milestone.
- The Sonnet on-demand deep-dive path (Rule 18) must not fire on a nano `concept_id`. The cache-miss handler should respond with the standard 2-state nano content, not generate child states.
- If a nano feels like it needs deep-dive, re-classify it as atomic and re-author at atomic granularity (5–6 states with the 2-minute budget) — do not bolt deep-dive onto a nano.

**Authoring policy — analytics-driven, ship without deep-dive (decision 2026-05-11).**

V1.0 ships with **zero authored deep-dive content** — not for diamonds, not for atomic concepts, not for nano (nano never gets deep-dive at all per the scope restriction above). The runtime Sonnet on-demand path that [CLAUDE.md SECTION 5 Rule 18](../../CLAUDE.md) currently permits is retired for deep-dive: runtime LLM generation cannot hit diamond bar in one shot under a spinner, and shipping mediocre elaborations on a state the student is already confused about destroys trust faster than no elaboration at all.

**What ships in V1.0:**

- Atomic and diamond concepts may set `allow_deep_dive: true` on the 2–3 states most likely to confuse, based on authoring judgement.
- Clicking the **"Explain step-by-step" button on a flagged state opens a one-sentence feedback form** ("Tell me what's confusing here"), NOT a simulation. The form writes a row to `feedback_unified` keyed by `(concept_id, state_id, class_level, mode, freeform_text)`.
- No deep-dive simulation appears in V1.0. The button is a listening surface, not a content surface.

**The analytics-driven authoring queue:**

Two signals per `(concept_id, state_id)` are tracked from launch:

1. **Median dwell time** before the student advances past the state or abandons the session.
2. **Feedback-form submission count** plus full text.

A `(concept_id, state_id)` enters the deep-dive author queue when EITHER signal crosses a threshold:

- ≥ 10 feedback-form submissions with confusion text, OR
- Median dwell > 60 s with ≥ 50 sessions (statistically meaningful linger).

Hand-author the top of the queue at ~1 deep-dive per week. The feedback text gives a precise spec — you build exactly what students asked for, not what you guessed they might want. Patterns library + parent scene primitives keep authoring effort to ~3–4 hours per deep-dive after the first.

**Why this beats both runtime-Sonnet and pre-authored exemplars:**

- **Authoring effort targets actual confusion.** Most flagged states will never accumulate threshold traffic and will not need deep-dive content. The handful that do, you author with diamond-bar quality from real student input.
- **No founder review treadmill** for runtime-generated mediocrity.
- **No upfront speculation cost** authoring deep-dives for states that turn out not to be the hardest.
- **Quality floor stays at diamond bar** for every deep-dive that ships.

**Child-state structure rules (apply when authoring from the queue):**

- 4–6 child states per parent, count emerges from the parent state's sub-truth list per the State-count decomposition rubric above.
- **Reuse the parent's scene wherever possible** — same camera, same primitives, same trajectory mode. Deep-dive zooms in on one aspect of the parent; it does not introduce new scenery. The student opened deep-dive because they wanted *more about this state*, not a new state.
- Each child state covers exactly one sub-truth of the parent. Example for Diamond #2 STATE_4: (a) why does v ⊥ B force circular motion? (b) centripetal derivation `qvB = mv²/r → r = mv/qB`, (c) period `T = 2πm/qB` and why it's independent of v, (d) constant speed because F ⊥ v, (e) handedness depends on `q` sign.
- Child states inherit the parent's `advance_mode` variety rule. Runtime budget is **60–90 s typical** (looser than the parent's 2-minute first-pass — the student opted in by clicking).
- The last child state ends with a "back to parent" affordance so the student returns to the EPIC-L arc, not a dead end.

**Effort:** 0 hours upfront. ~3–4 hours per deep-dive once the analytics queue flags it.

---

## 7. TTS / glow contract

### Per-sentence schema

Every `teacher_script.tts_sentences[]` entry carries:

- `text_en: string` — the spoken text (required).
- `glow: 'v' | 'f' | 'v_parallel' | 'v_perp' | 'b' | 'trail' | 'hand' | 'fleming' | 'sliders' | null` — which on-screen element to pulse-highlight while speaking. Vector targets (`v`, `f`, `v_parallel`, `v_perp`) pulse the corresponding arrow + label; `b` pulses every B-field grid arrow; `trail` pulses the particle's orbital line; `hand` pulses the 3D right-hand mesh; `fleming` pulses the Fleming-overlay HTML element; `sliders` pulses the STATE_7 sliders panel. Future diamonds extend this enum (`'mu'` for dipole moment in Diamond #3, `'rhr'` for the archetype-A 2D right-hand overlay, etc.).

  **Glow-target chooser rule (mandatory for Diamond #2; founder note 2026-05-12):** every sentence that names a visible element MUST set `glow` to that element's enum value — one target per sentence, no exceptions. If a sentence references *multiple* elements sequentially (e.g., "Flat palm shows v. Curl through B. Thumb along F"), **split it into shorter sub-sentences** — each speaks ~2-4 seconds, each carries its own focused glow. This is the s4_3a/b/c/d pattern: the student's eyes land on the right element exactly when the narration names it. The renderer's pulse is calibrated to be clearly visible at every phase (range [1.0, 1.7] scale, ~1.8-second period — always elevated above baseline while active). Leave `glow: null` only when the sentence is pure teaser/transition with no visible referent.
- `math_show?: string` — optional LaTeX expression rendered in the iframe's `#equation_panel` while this sentence speaks. KaTeX-rendered, fades in. Cleared automatically when the next sentence arrives (unless that sentence sets `math_persist: true`).
- `math_persist?: boolean` — when `true`, this sentence's `math_show` **appends below** the previous equation(s) instead of replacing them. Use this for derivations where each step builds on the last (e.g., Diamond #2 STATE_4 chain `qvB = mv²/r → r = mv/qB → T = 2πm/qB`).

**Rule of thumb for math content** (Diamond #2 retrofit lesson):

Any equation the TTS narrates aloud MUST also appear visually via `math_show`. Spoken math is the opposite of concrete — students cannot mentally render `qvB = mv²/r` faster than the TTS speaks it. The visual sync is non-optional for diamond bar. A single TTS sentence should reference at most one equation; if a derivation has three algebraic steps, split into three short sentences each with its own `math_show`, the second and third using `math_persist: true`.

### PostMessage protocol

The admin TTS button ([_TtsPlayButton.tsx](../../src/app/admin/test-magnetic-force-moving-charge/_TtsPlayButton.tsx)) and any production TTS player must:

1. Before speaking a sentence, post `{type:'SET_GLOW', target}` to the iframe.
2. On the `SpeechSynthesisUtterance`'s `onend`, post `{type:'SET_GLOW', target:null}` to clear.
3. On `cancel()` (user pressed Stop), post `{type:'SET_GLOW', target:null}`.

The renderer's `setupPostMessage` ([setupPostMessage:2867](../../src/lib/renderers/field_3d_renderer.ts:2867)) handles `SET_GLOW`, `SET_STATE`, `INIT_CONFIG`, and `PING`. The pulse decays naturally via the `tts-driven-glow-pulse` choreography.

### TTS-visual sync rule

**Every `glow` target referenced in a state's TTS must correspond to a visible element rendered by that state.** Diamond #2 violated this once: STATE_1's TTS referenced "right-hand rule overlay on the left" when no overlay was rendered in STATE_1 (the 3D hand only ships in STATE_4 / STATE_5). The deviation was fixed mid-session by rewriting the TTS, not by adding an overlay.

`// TODO`: lift this into the [Visual Validator](../VISUAL_VALIDATOR_SPEC.md) as a new Category H check: for each (state, sentence) pair, vision-model verifies that the sentence's `glow` target is visible on screen at that moment. Until then, the rule is enforced by founder review.

### Sentence count

Concept-driven, not fixed. Diamond #2 ranges 2–6 sentences per state. Keep individual sentences ≤ 30 spoken seconds (~75 words at normal English TTS rate) so the student can re-listen without losing context.

---

## 8. Code anchors — pattern → file:function

| Pattern | File | Function / block |
|---|---|---|
| `Field3DConfig` interface | [field_3d_renderer.ts](../../src/lib/renderers/field_3d_renderer.ts) | top-of-file `Field3DConfig` type |
| Compass approach + swing | field_3d_renderer.ts | [createCompass:894](../../src/lib/renderers/field_3d_renderer.ts:894) + animate loop |
| Biot-Savart B-direction at compass position | field_3d_renderer.ts | animate loop, `compass.animate_swing` block (computes B-field from source geometry to drive needle swing) |
| Per-state visibility tokens (`rhr-show-a-only`, `palm-show-pos-only`, etc.) | field_3d_renderer.ts | [applyState:2032](../../src/lib/renderers/field_3d_renderer.ts:2032) — substring matcher on `PM_currentState` |
| Right-hand HTML overlay (Archetype A) | field_3d_renderer.ts | [createRightHand:812](../../src/lib/renderers/field_3d_renderer.ts:812) + `assembleField3DHtml()` `#rhr_overlay` block |
| Highlighted point | field_3d_renderer.ts | [createHighlightedPoint:1207](../../src/lib/renderers/field_3d_renderer.ts:1207) |
| Lorentz scene build (Archetype B) | field_3d_renderer.ts | [buildLorentzForceField:1808](../../src/lib/renderers/field_3d_renderer.ts:1808) |
| 3D right-hand mesh + animated curl | field_3d_renderer.ts | [createLorentzHand:1027](../../src/lib/renderers/field_3d_renderer.ts:1027) + [lorentzFingerPoints:981](../../src/lib/renderers/field_3d_renderer.ts:981) |
| Fleming's left-hand-rule SVG overlay (reconciliation) | field_3d_renderer.ts | `#fleming_overlay` HTML/CSS in `assembleField3DHtml()`; toggled in `applyExtras` via `extras.fleming_left_hand.show` |
| 3D label sprites (canvas-textured, always-on-top) | field_3d_renderer.ts | [createLabelSprite:1179](../../src/lib/renderers/field_3d_renderer.ts:1179) |
| `extras` dispatch (per-state opt-in primitives) | field_3d_renderer.ts | [applyExtras:1268](../../src/lib/renderers/field_3d_renderer.ts:1268) |
| Slider wiring (Lorentz + Biot-Savart panels) | field_3d_renderer.ts | [setupSliders:2210](../../src/lib/renderers/field_3d_renderer.ts:2210) (`refreshLorentzLabels` inside) |
| State switching | field_3d_renderer.ts | [applyState:2032](../../src/lib/renderers/field_3d_renderer.ts:2032) |
| Legend / caption updater | field_3d_renderer.ts | [updateLegend:2115](../../src/lib/renderers/field_3d_renderer.ts:2115) |
| Scenario dispatch | field_3d_renderer.ts | [buildScenario:1966](../../src/lib/renderers/field_3d_renderer.ts:1966) |
| Per-scenario field builders | field_3d_renderer.ts | [buildStraightWireField:1667](../../src/lib/renderers/field_3d_renderer.ts:1667), [buildSolenoidField:1547](../../src/lib/renderers/field_3d_renderer.ts:1547), [buildBarMagnetField:1602](../../src/lib/renderers/field_3d_renderer.ts:1602), [buildDipoleField:1433](../../src/lib/renderers/field_3d_renderer.ts:1433), [buildPointChargeField:1369](../../src/lib/renderers/field_3d_renderer.ts:1369), [buildParallelPlatesField:1497](../../src/lib/renderers/field_3d_renderer.ts:1497), [buildChangingFluxField:1744](../../src/lib/renderers/field_3d_renderer.ts:1744) |
| Biot-Savart scene build (Archetype A-meta) | field_3d_renderer.ts | [buildBiotSavartField:2279](../../src/lib/renderers/field_3d_renderer.ts:2279) |
| Grow-from-origin vector arrow | field_3d_renderer.ts | [bsArrow:2312](../../src/lib/renderers/field_3d_renderer.ts:2312) |
| In-scene symbol label (dl / r / θ / P / dB …) | field_3d_renderer.ts | [bsLabel:2513](../../src/lib/renderers/field_3d_renderer.ts:2513) → [createLabelSprite:1179](../../src/lib/renderers/field_3d_renderer.ts:1179) |
| Biot-Savart accumulation + sinθ-weighting + circle assembly | field_3d_renderer.ts | applyState reset [:3665](../../src/lib/renderers/field_3d_renderer.ts:3665) + animate loop biot block [:4402](../../src/lib/renderers/field_3d_renderer.ts:4402) (6 numbered sub-blocks) |
| PostMessage contract (parent ↔ iframe) | field_3d_renderer.ts | [setupPostMessage:2867](../../src/lib/renderers/field_3d_renderer.ts:2867) — handles `SET_STATE`, `SET_GLOW`, `INIT_CONFIG`, `PING` |
| Mobile 2D SVG fallback | field_3d_renderer.ts | [renderMobileSVG:2919](../../src/lib/renderers/field_3d_renderer.ts:2919) |
| Admin TTS button + glow dispatch | [_TtsPlayButton.tsx](../../src/app/admin/test-magnetic-force-moving-charge/_TtsPlayButton.tsx) | Web Speech API + `SET_GLOW` postMessage |

---

## 9. Required-primitives-per-archetype checklist

The M3.5 Visual Validator and `scene_designer` agent both consult this table. A concept that fails to include a required primitive for its archetype is a hard fail for archetype conformance.

### Archetype A required

- At least one of `extras.compass` (with `animate_swing: true`) or `extras.right_hand` on the field-direction-reveal state.
- Field-line geometry — at least one of `buildStraightWireField`, `buildSolenoidField`, `buildBarMagnetField`, `buildDipoleField`, `buildPointChargeField`, or a chapter-extension. Empty scene is a fail.
- A current-direction-indicator on the source primitive (arrow, ⊙/⊗ glyph, or directed flow dots) whenever current direction is pedagogically relevant.
- Polarity-case visibility tokens (`rhr-show-a-only` / `rhr-show-b-only`) on multi-polarity states.

### Archetype B required

- Top-level `ambient_field` block (`direction`, `magnitude`, `density`, `color`, `opacity`).
- Top-level `particle` block (`charge_sign`, `mass_kg`, `color`, `radius`) with a charge-sign badge child sprite. The badge is mandatory in every state — students must always see which charge they are watching.
- `extras.velocity_vector: { show: true }` on every motion state (everything except a degenerate `F = 0` setup, if any).
- `extras.force_vector: { show: true }` on every state where `θ > 0`. STATE_1-style "F = 0 baseline" states may omit it.
- `extras.particle_trail: { show: true }` on every motion state. `equal_arc: true` only on circular-motion states (STATE_4-style "magnetic force does no work" lesson).
- `extras.palm_rule: { show_3d_hand: true, ... }` on at least: (1) the F-reveal state and (2) the "why sin θ" decomposition state. Pure-narrative states may use `palm_rule: {}` (the empty form, which renders no hand).
- A `trajectory_mode` declared on every state. Default is `static`; explicit choice is required for motion.
- An interactive state with `show_sliders: true` and `slider_controls` block including at minimum `v`, `B`, `theta_deg`. `q_sign` is required when negative-charge cases are pedagogically relevant.

### Archetype C required (extracted from Diamond #3, M2)

Archetype C = closed-loop rotational dynamics. A planar current loop (or
equivalent magnetic dipole) sits in a uniform external B. Pedagogy hinges on
ΣF = 0 but Στ ≠ 0 — the couple rotates the loop. τ = μ × B is the destination
formula; μ = NIA is the new vector quantity.

**Renderer extension shipped (`field_3d_renderer.ts`):**
- `buildTorqueLoopInField()` — ambient B grid (reused pattern) + rectangular
  loop wire (4 cylinder segments) + per-side current-direction arrows +
  hidden-by-default F arrows on the two force-bearing sides + μ vector arrow
  through loop face + world-frame τ vector along the rotation axis +
  ΣF = 0 text sprite + faint rotation-axis reference line.
- `applyTorqueLoopState(stateDef)` — toggles per-state visibility of force /
  μ / τ / ΣF=0 elements from `stateDef.extras`; seeds rotation_mode,
  theta_deg, and oscillation parameters.
- `updateTorqueLoopFrame(dt)` — drives rotation animation per frame for
  `rotation_mode ∈ {static, slow_rotation, theta_controlled, oscillation,
  manual}`; scales τ-arrow length by |sin θ| live.
- `SET_LOOP_ANGLE` postMessage — external `{ type: "SET_LOOP_ANGLE",
  theta_deg }` cancels auto-rotation and snaps the loop to that angle.

**Required scene_composition for archetype C:**
- Top-level `loop` block (`shape`, `side_length`, `current_amps`, `turns`,
  `color`, `current_arrow_color`).
- Top-level `ambient_field` block (same shape as archetype B).
- Per-state `theta_deg` is mandatory — sets the loop's initial angle.
- Per-state `rotation_mode` ∈ {static, slow_rotation, theta_controlled,
  oscillation, manual}.
- Per-state `extras` toggles visibility: `force_vectors: { show_left,
  show_right, color }`, `mu_vector: { show, color }`, `tau_vector: { show,
  color }`, `sum_force_badge: true`, `field_vector: { show, color }`.
- An interactive state (typically STATE_6 / STATE_7) with `show_sliders`
  list naming which of `{N, I, L_side, B, theta_deg}` are exposed.

**Choreography patterns extracted from Diamond #3:**

#### `closed-loop-force-pair-animation`
STATE_2 reveals F₁ on the LEFT side first (after a Socratic prediction beat).
STATE_3 reveals F₂ on the RIGHT side, anti-parallel — surface ΣF = 0
explicitly with a text-sprite badge that appears alongside the second force
arrow. The visual "ΣF = 0 AND τ ≠ 0" simultaneity in STATE_4 IS the aha
moment.

#### `mu-cross-B-rotation`
STATE_4 sets `rotation_mode: "slow_rotation"` with `rotation_target_deg`
20–40° away from current θ. Loop visibly rotates over ~3 seconds toward
μ ∥ B. The τ-arrow becomes visible at the same instant — students see
"torque caused this rotation" in real time, not as a static label.

#### `oscillation-around-equilibrium`
STATE_7 sets `rotation_mode: "oscillation"` with `oscillation_amplitude_deg`
and `oscillation_period_s`. Loop swings sinusoidally about θ = 0 (stable
equilibrium). Pair with `bar_magnet_swap` extras flag for the loop ↔ dipole
visual unification.

#### `dipole-moment-vector-arrow`
μ renders as a yellow ArrowHelper through the loop's centre, in loop-local
+z. Because it lives inside the loop THREE.Group, it rotates rigidly with
the loop — students tilting the camera always see μ locked through the
face. Direction is RHR-derived from the current's circulation sense
(CW viewed from +z → μ points +z). Accompanying `mu_arrow_label`
annotation explains the RHR procedure in plain text ("curl fingers along I,
thumb gives μ").

#### `current-flow-dot-animation`
**Pattern for Pass 2 — making the invisible visible.**
Current in a wire is invisible. Static current-direction arrows convey
information but don't make the student FEEL current flowing. The dot
animation remedies this.

Implementation (`buildTorqueLoopInField`): 8 sphere meshes (2 per side,
radius 0.048, MeshPhongMaterial orange #FFAB40, emissiveIntensity 0.80).
Each mesh carries userData `{ sideStart, sideEnd, t, speed }`. In
`updateTorqueLoopFrame`, t increments by `speed × dt` each frame and wraps
at 1.0. Position is lerped between sideStart and sideEnd. The two dots per
side are staggered by 0.5 so the visual spacing is uniform and the CW flow
direction is unambiguous.

**Required in all archetype-C concepts** that teach force/torque from
current direction — the student must see the current flowing before they
are asked to predict the force direction.

Extras contract: no extras field needed. Dots are always visible (parented
to loopGroup, rendered whenever the loop is visible). If future concepts
need to hide dots for a specific state, add `current_dots_visible: false`
to extras and handle in `applyTorqueLoopState`.

Timing note: dots should begin from STATE_1 (the setup state) before any
force-prediction state. The student's brain registers direction from ~2
seconds of observation.

#### `rhr-ibf-triad`
**Pattern for Pass 2 — the hand does what text cannot.**
When a state's narration says "right-hand rule," a text explanation is
insufficient. The student's brain needs a visual to mirror with their hand.

Implementation (`buildTorqueLoopInField`): two `buildRHRGuide` groups in
world space — one for each force-bearing side (left: I=+y, F=-z; right:
I=-y, F=+z). Each group contains three ArrowHelpers (I orange, B blue,
F green) + sprite labels ("I", "B", "F") + a title sprite ("F = I × B").
Groups live in world space (not loopGroup) so they don't rotate with the
loop. Hidden by default.

Show/hide: `extras.rhr_guide.side` = `"left"` | `"right"` | absent.
`applyTorqueLoopState` sets `rhrGuideLeft.visible` and `rhrGuideRight.visible`
from this field.

**Pedagogical sequence rule:** the RHR guide must be visible BEFORE the
force arrow fades in. Sequence:
1. Current dots visible (student sees I direction)
2. Narration asks student to predict
3. Pause beat (3s minimum)
4. RHR guide appears (student's hand follows the three arrows)
5. Force arrow fades in as confirmation, not as information

TTS glow target: `"rhr_guide_left"` or `"rhr_guide_right"` pulses the
entire guide group when the narration names the guide.

Position: place guides at world (2.4, 1.0, 0.5) — upper-right quadrant
from camera position [3.5, 2, 4]. Adjust for concepts where B direction
or loop orientation differs from the archetype-C default.

### Archetype A-meta required (extracted from Diamond #5)

A-meta = derive a field from its source law. The scene must let the student *see the field built*, not just shown.

- Top-level `biot_defaults` block (`field_point_P`, `wire_half_length`, `num_elements`).
- A per-state `biot_element` block on every state with an explicit `accumulate_mode` (`single` | `sequence` | `integrated`).
- At least one `single`-mode state that isolates ONE element and its geometry (`dl`, `r̂`, θ) **before** any accumulation — the law is about one element first.
- At least one `sequence`-mode state that accumulates Σ dB into the assembled field (the PRIMARY aha). An instant/whole circle is a fail — the circle must build from contributions.
- A `weight_by_sin_theta` state so the sinθ/r² falloff is *shown*, not asserted.
- In-scene symbol labels for every vector the narration names (`dl`, `r`/`r̂`, θ, `P`, `dl×r̂`, `dB`), via the `<element_id>_label` convention.
- The result-recovery state must name the familiar closed form it reduces to (`B = μ₀I/2πr` for the straight wire) so the derivation lands on known ground.
- **Where field *direction* is taught** (not just magnitude): the cross-product-rule hand on the per-element direction state(s), and — when the concept also carries the integrated field — the grip-rule hand on the result-recall + reconciliation states. Right rule on the right state (see §1 A-meta pedagogy). Magnitude/geometry/setup states carry no hand.

### Schema-mechanical checks (any archetype)

These are enforced by `npm run validate:concepts` against the JSON schema, not by visual inspection:

- `aha_moment.statement` ≤ 15 words.
- At least 2 distinct `advance_mode` values across the `epic_l_path.states`.
- Each EPIC-C branch's STATE_1 visually shows the wrong belief (not a neutral baseline).
- Every state's `scene_composition.primitives` length ≥ 3.
- Real-world anchor uses Indian context, plain English (no Hinglish).
- `prerequisites` array references concepts that exist in `VALID_CONCEPT_IDS`.

---

*Diamond #3 (`torque_on_current_loop_in_field`) will extend this file at M2. When it does, expect archetype C to gain its own primitive table, choreography list (likely `dipole-torque-oscillation`, `loop-rotation-about-axis`), and pedagogy section.*
