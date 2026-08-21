# Work order — Desk A → Desk E (`feat/rotmech-0c3`)

**Written 2026-08-05 by Desk A.** Every row below is already in `findings_a.md`; this file is the
*execution* view — grouped into dispatch-sized units, mechanisms corrected, probes written, so no
dispatch has to re-derive what two gate cycles already established.

**Amendment 4 is binding: ONE `bug_class` per `field3d-surgeon` dispatch, ~100-call ceiling.** The
grouping below respects that — each numbered unit is one dispatch. They are ordered by what
unblocks the most; W-1 and W-2 are the only two that block sealing.

**Do not fix these on Desk A.** Desk A never edits a platform file; that is why its merge-back is
conflict-free. This packet is the hand-off.

---

## W-1 · BLOCKING · `field3d_l_arrow_shaft_occluded_by_its_own_axle`

**Blocks:** `conservation_of_angular_momentum` sealing. Kills STATE_6 entirely and degrades STATE_1.
**Owner:** `peter_parker:field3d_surgeon`. **founder-proxy id: E-1. Desk A id: A-11.**

### The mechanism — corrected twice, do not chase the first two diagnoses

- ❌ **NOT a scaling bug.** `RBR_L_ARROW_SCALE = 0.20` runs correctly: 0.918 world units at
  L = 4.59 vs 0.458 at L = 2.29, and the head *does* move ~31 px between states. **Do not touch it.**
- ❌ **NOT a length-floor bug.**
- ✅ **It is occlusion.** `THREE.ArrowHelper` builds its shaft as a zero-width `THREE.Line`. The
  arrow sits on the axle centreline at `(0, ±0.22, 0)` (`:50386–50388`); the axle is an opaque
  `CylinderGeometry(0.07, 0.07, 3.4)` at y = 0.6 (`:50304–50307`) spanning y ∈ [−1.1, 2.3].
  **The shaft is entirely inside the axle.** Only the 0.24-long cone head protrudes, and its size is
  fixed regardless of |L| — so magnitude is communicated by head *position* alone, and STATE_1's
  authored 0–1200 ms draw-in never reads at all.

### Expected fix
Shaft radius > 0.07, **or** offset laterally clear of the axle; plus `depthTest:false`,
`depthWrite:false`, `renderOrder ≥ 998` per the prevention rule on the FIXED row
`pp_probe_and_sheet_arrows_camouflaged_by_translucent_plate_blend`. Plus a reveal path so STATE_1's
0–1200 ms draw-in exists.

### Probe (must be run, not reasoned about)
Capture at L = 4.59 and L = 2.29 **with the axle masked out**; assert the arrow's own drawn pixel
extent differs by ≥ 1.8×.

### Aggravating factor — read before judging STATE_6 "fixed"
STATE_6 authors `repin_cue: {blank_ms: 500}`, a deliberate blank with the `rbr_repin` "restarting"
badge (`:50337–50341`, Addendum C — a discontinuity must read as a restart, never as an uncaused
external torque). Correct by design, **but it lands exactly on the L-flip beat**. Today the whole
reversal is carried by the blue `L` glyph jumping y ≈ 214 → 494 across that blank. Once the arrow
is visible the blank stops being load-bearing — but verify the flip reads *through* the blank, not
around it.

---

## W-2 · BLOCKING · `field3d_pull_arrow_camouflaged_against_rod_tip_overhang`

**Blocks:** the same concept's PRIMARY aha (STATE_2's cause beat).
**Owner:** `peter_parker:field3d_surgeon`. **founder-proxy id: E-2. Desk A id: A-12.**

### The mechanism — corrected, do not tune the floor
- ❌ **NOT below the minimum length.** `rbrArrowLen(3.60 N) = 0.070 × 3.60 = 0.252` world units,
  comfortably above `RBR_ARROW_MIN_LEN = 0.16`. **Do not tune that constant.**
- ✅ **It is camouflage.** 0.252 is almost exactly the rod's own 0.20-unit tip overhang (half-length
  1.0, mass at 0.80). The arrow is drawn tail-outward from the mass onto precisely that overhang
  (`:50692–50698`), in a near-identical pale tone against the same pale rod.

### The inversion that makes it worst where it matters
`F = m·ω²·r` with `ω ∝ 1/I` ⇒ the arrow is **smallest exactly when it must be seen** (the cause
beat, masses still out at r = 0.80, F ≈ 3.6 N) and largest after the slide is over.

### Expected fix
At the guided minimum **F = 3.60 N** the arrow must be unambiguously separable from the rod in
**colour AND depth** — not by length. Verify at the beat's OPENING frame, not at the explore-range
extremes the 0c-1 Addendum D map was tuned for.

---

## W-3 · `hysteretic_state_cannot_be_latched_under_a_time_pin` (second instance)

**Owner:** `peter_parker:field3d_surgeon`. **Desk A id: A-6.** Regression of an OPEN scar.

`eng.matched[mid]` (`:50276`) is set once and cleared only at state *apply* (`:50512`), so under a
`SET_TIME_FREEZE` rewind it never clears. Measured: the ω row's ink is `#FFF176` hold-glow across
**all 11 STATE_3 dense frames, t = 0 → 10000** — the co-glow that marks "the live readout *lands* on
the prediction" is already lit while ω reads 6.95 and the chip reads 1.50.

**Two distinct harms:** (a) THE EYE **structurally cannot verify** the one beat STATE_3 exists to
deliver; (b) any frame a reviewer scrubs back to shows a false agreement.

**Fix:** derive `matched` from `tMs ≥ t_match` (a closed form off the ramp), or clear the latch
whenever `tMs` decreases.
**Note for the skeleton's SCAR AUDIT row 40**, which dispositioned this scar "B — satisfied" on the
strength of STATE_5's L(t) closed form: **the match cue is a SECOND hysteretic element and the
disposition missed it.**

**Reference implementation already in the tree:** E1's `rbrRenderFormula` is exactly the right
shape — a pure function of state-local `tMs`, nothing latched, verified by three independent
channels to survive pin/rewind. Copy that discipline.

---

## W-4 · `authored_reveal_channel_missing_so_the_beat_degrades_silently`

**Owner:** `peter_parker:field3d_surgeon`. **Desk A ids: A-7 + A-1.** One dispatch — same class.

This is the class E1 just fixed for the formula surface. Two more surfaces still have no timing:

- **A-7 — pull arrows.** `rbr_pull_arrow: rb.show_pull_arrows` (`:50609`) is boolean-only; no
  `at_ms`. physics_block §3 STATE_2 specifies "4190–4890 ms: `pull_arrows` **appear** … masses NOT
  yet moving". Not expressible. What ships is a *glow onset* at 4190 instead of an appearance —
  legitimate under Rule 29, so Rule 32a survives in substance, but it is not what was authored. Note
  the 700 ms window falls between dense frames (4000/5000), so **no captured frame shows it and
  eye-walker cannot confirm it either**.
- **A-1 — HUD/instrument glow.** `glow_focal`/`phases[].glow_focal` resolve ONLY against `rbrIndex`
  (3D scene meshes) — naming a readout there is a **silent no-op**. `hold_glow[]` reaches the DOM
  rows but is static for the whole state and closed to the six `RBR_RO_META` tokens; it can never
  target `KE_bar`, `KE_tick`, `predicted_omega_chip` or `formula_surface` at all.

**Scope A-1 narrowly** (quality-auditor's amendment): `phases[]` already reaches every *scene mesh*
target with real time windows and delivered this concept's choreography well (18 entries, verified
rendering). What is unreachable is only the **HUD-row and non-mesh** targets listed above. Build
`phases[].hold_glow` for exactly that list; do not over-build a general channel.

---

## W-5 · `authored_token_silently_skipped_when_the_engine_lacks_the_row`

**Owner:** `peter_parker:field3d_surgeon`. **Desk A id: A-8 + the `RBR_RO_META` trap.**
**This unblocks Desk A's wave 2 (`rotational_work_energy`) — and it is Desk E's own E5.**

Two instances of one class — an authored token that no engine row implements is dropped in silence:

1. **`RBR_RO_META` (`:50147`) implements exactly six rows: `I · ω · L · KE · dL/dt · F`.** There is
   no `θ`, `α`, `W` or `v`. `rbrRebuildReadout` (`:50162`) does `if (!meta) continue`. A concept
   authored against a missing row passes Zod, passes `validate:concepts`, seeds, renders, and can be
   **sealed with the taught quantity simply absent.** Nothing automated catches it.
2. **`controls_visible` cannot express `min_ring`.** `bonding_scene` already implements
   `{ id, min_ring }` (`:55484–55492`); rbr's token is a bare string union (`:1051`). So skeleton §3
   ("r core · ω₀ core · m core · brake core · spin-direction **extended**") and §10(i-4) land
   nowhere in the shipped JSON, silently. Nothing is broken today (no preset builder consumes rings
   yet), but the claim must not be sealed as satisfied at Checkpoint C. Cheap — the pattern exists.

**Ask beyond the fix:** make an unknown token **loud**. A `console.warn` at minimum, ideally a
validator gate — this class is the single largest source of silent degradation on this engine
(see the tally in W-9).

---

## W-6 · `world_anchored_sprite_labels_overlap_their_own_geometry_and_each_other`

**Owner:** `peter_parker:field3d_surgeon`. **Desk A id: A-13, widened 2026-08-05.**

Filed originally as brake-vs-`R_drum`, STATE_5 only. The second eye-walker walk found the same class
in four more places across three more states:

| Where | Collision |
|---|---|
| S3 `dense_t03000` | `pull` overprints `L` — renders as an unreadable `pulL` |
| S3 / S4 / S8 frozen | `pull` sits on top of the yellow mass it labels |
| S5 frozen | `brake` overprints the red pad (the original case) |
| S5 / S8 | `R_drum` overprints the drum ring |

**The real class:** world-anchored sprite labels have no de-collision at any orbit angle, against
peers *or their own geometry*.
**Prevention rule:** a world-anchored label carries a screen-space offset resolved against the
sprite it names AND against peer labels; anything that would overprint at any orbit angle is
nudged, not drawn.
**Note:** E5's hysteretic decollision machinery — already named for this concept — must take the
**brake-pad label as a participant**, not just r / R_drum / pull / L.

---

## W-7 · `reader_facing_string_hardcoded_in_the_renderer_escapes_every_sweep`

**Owner:** `peter_parker:field3d_surgeon`. **Desk A ids: A-10 + A-20.** One class, two instances.

1. **A-10 — `rbrMakeLabel("R_drum", …)` (`:50397`)** is hardcoded and rendered on canvas (S5, S8).
   physics_block callout 2 rules that "drum" is an internal identifier and every reader-facing
   string says "turntable". `R_drum` also fails Rule 41 — not a word a student reads. This is
   precisely the **third text path** (`createLabelSprite`) that Rule 34c warns a DOM-only sweep
   silently skips. Independently re-derived from pixels by eye-walker without being told it was
   filed — two derivations, same conclusion.
2. **A-20 — ⚙ widget labels fall back to internal ids.** `pmWgPanelLabel` (`:69824`) has no keyword
   match for `rbr_kebar` / `rbr_repin`, so `pmWgPanelWords` strips the prefix and title-cases the
   stem → **"Kebar"**, **"Repin"**. `pmWgRowLabel` (`:69789`) looks for a `<label>` child;
   `rbr_spin_dir_row` holds a `<button>`, so it emits **"Spin dir slider"** for what is a button.
   Sanctioned fix is the escape hatch both labelers honour first (`:69825`): a `data-wg-label`
   attribute on the three elements. Should read "Energy bar", "Restart badge", "Reverse spin".
   **"Annots" is fleet-wide pre-existing** (generic `f3d_annots`) — not this scenario's, do not fix
   it under this row.

**Prevention rule:** every `rbrMakeLabel` / `createLabelSprite` string and every ⚙ row label is
reader-facing text and takes the same Unicode + plain-language pass as concept JSON. No `X_yyy`
identifier form may reach a sprite or a teacher-visible toggle.

---

## W-8 · Layout — two independent rows, one dispatch if scoped tightly

**Owner:** `peter_parker:field3d_surgeon`. **Desk A ids: A-17, A-5.**

- **A-17 — `graph_marker_label_clipped` (recurrence of a FIXED row).** STATE_4's tick caption
  "if energy stayed constant" starts at x = 0 with its first glyph cut, outside its own panel box
  (x 20–260). That row's **existing** prevention rule already covers it: "clamp draw-x into
  `[padL, W-padR]` — never allowed to overflow the panel edge — verified especially on the state
  carrying the concept's aha." STATE_4 carries the SUPPORTING aha. **Apply the existing rule; do not
  mint a new class.**
- **A-5 — `force_rig_slider_panel_renders_full_height_when_one_row_visible` (confirmed regression).**
  STATE_5: panel spans y ≈ 458–700 with the single τ row at y ≈ 620–655 — ~160 px of empty black.
  STATE_6: ~205 px above "Reverse spin". S8 (five rows) fills correctly.
  **Tension the surgeon must resolve, not just patch:** skeleton E8 mandates `visibility:hidden`
  over `display:none` for row-position stability (scar
  `field3d_per_state_slider_rows_collapsed_in_a_bottom_anchored_panel_make_shared_rows_jump`) — and
  that is exactly what preserves the height. **Both constraints must hold.**

---

## W-9 · `sign_colour_channel_has_no_on_screen_consumer`

**Owner:** `peter_parker:field3d_surgeon`. **Desk A id: A-16.** Ride-along (founder-proxy E-3).

physics_block §6 callout 5 (founder-approved) requires "a teacher should read the sign from colour
alone before reading the number." In the renderer:

- `RBR_NEG_COLOR` has **exactly one consumer** — `:50708`, `lArrow.setColor` — and that recolours
  the shaft W-1 proves is invisible.
- `rbr_l_label` is built with `RBR_POS_COLOR` (`:50390`); its update block (`:50719–50720`) sets
  **only `.position`**, never colour.
- The HUD digits take no sign colour anywhere.

Confirmed in `STATE_6__frozen.png`: at ω = −1.50, L = −4.59 the "L" glyph is still cool blue and the
readouts are the same grey as STATE_1's positive ones. **The entire colour channel the design
specified does not exist on screen.** Fixing W-1 alone will surface it partially; the label and HUD
paths need wiring regardless.

---

# NOT Desk E — routed elsewhere, listed so nothing is assumed covered

| Item | Surface | Owner | Note |
|---|---|---|---|
| **A-19** | `validators/visual/pixelGate.ts:318–320` | **office, master** | `stuck = tailFrozen && earlierMoved` ⇒ D7 passes a wholly static scene by construction. D5 rescues rbr (all 8 states declare motion) but only proves the turntable spun, never that an authored beat played. Desk B's finding; Rule-40 platform file. |
| **A-21** | `build_review_site.ts:1142` `estSentenceMs` | **office / founder ruling** | Player narration runs **2.0–2.7×** the authored `duration` and ignores it entirely when sentences exist. `physics_block`'s "Narration sync" tables describe a model the player does not implement. Advisory, systemic, pre-existing. Re-time the narration, or accept the hold — a decision, not a patch. |
| **A-15** | `schemas/conceptJson.ts` | **office, master** | Cannot express "explore state, zero authored narration"; `tts_sentences` carries `.min(1)` but `text_en` has no `.min(1)`, so `text_en: ""` is the only encoding. All three consumers handle it safely (checked individually). Suggested affordance: allow `tts_sentences: []` when `advance_mode === 'interaction_complete'`. Will spread by copy-paste into the next seven rotmech concepts if left. |
| **A-14** | — | **founder ruling** | Two OPEN scars contradict on narration glow: one wants `tts_sentences[].glow`, the other says such glows are inert wherever a state authors a `glow_focal` and marks it FOUNDER DECISION PENDING. This concept took the only path that renders (18 `phases[]` entries). Not an engine fix. |
| **A-4** | concept metadata | **office ruling** | `chapter`/`section` unpinned for the rotmech set. Desk A authored `chapter: 9`, `section: "9.9"`. **All eight Ch.7 concepts across five blind desks must agree** — one ruling, not five guesses. |
| `prerequisites` | concept JSON | **founder ruling** | Names four in-chapter ids that exist in `VALID_CONCEPT_IDS` with no concept JSON. Rule 23 makes them advisory so nothing fails — but the ruling is open. |
| desk C false alarm | `scripts/desk.js` | **office, tooling** | `desk:sync` reported `CONFLICT in 0 file(s)` for `feat/rotmech-c` and printed resolve-here instructions; that desk is clean, no `MERGE_HEAD`, empty tree. A false alarm that sends someone to fix nothing. |
| `feat/lom-f-momentum` | — | **owning surgeon** | Conflicted on four files including **two Rule-40 platform files** (`field_3d_renderer.ts` 10 hunks, `deriveStateMeta.ts` 3), now showing 176 uncommitted changes. Needs the owning surgeon, never a blind keep-both — a naive resolution once printed two HUD headers per body (PR #10). |

---

# The pattern worth fixing above any single row

Six of the rows above are **one class**: something authored, accepted by every gate, that does
nothing — and fails silently.

`A-1` HUD glow targets no-op · `A-7` no pull-arrow reveal · `A-8` `min_ring` inexpressible ·
`A-9` `masses.r_m` dead at t = 0 in ramped states (this *caused* blocker B-1) · `RBR_RO_META`
unknown-token skip (blocks wave 2) · `A-18` the dead formula assemblies (**fixed by E1**).

Each passes Zod, `validate:concepts`, seeds, renders, and looks correct. And the gate that should
catch them reports 35/35 either way (A-19). **A-18 survived an entire authoring cycle — architect,
physics-author, json-author, quality-auditor, eye-walker, founder-proxy Checkpoint B — at a clean
35/35, and was caught only because Desk D's architect read the contract from the other side.**

The highest-leverage fix in this whole packet is not any single row: it is making an
unhonoured authored field **loud** — warn on an unknown readout token, an unreachable glow target,
an `at_ms` on a surface with no timing. One `console.warn` per class would have caught five of the
six at authoring time, before a gate cycle was spent on them.
