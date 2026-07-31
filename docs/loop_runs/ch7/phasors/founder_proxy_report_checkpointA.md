# founder-proxy — Checkpoint A (design gate) — `phasors` (Ch.7 #4)

> Persisted verbatim by the loop session (founder-proxy has no Write tool). Dispatch: Checkpoint A,
> cycle 0, on `docs/loop_runs/ch7/phasors/skeleton.md` as first written by architect.

# VERDICT: `DESIGN_FIX` — 5 × P1, 4 × P2, 2 × P3 → `alex:architect` (fix cycle 1 of 2)

**Justification.** This is the strongest skeleton of the four so far on the dimensions the loop has been burned on: the engine triage is honest (Class-A evaluated and rejected with four named gaps), §10j is the first existence-assertion table the chapter has produced, the archetype/ring/budget discipline is clean, the anchor is genuinely excellent, and the withholding contract with `series_lcr_circuit` is precise. **It is not approvable as written for five reasons that are each verifiable in under a minute.** The concept's central mechanism — the projection tie-line from the disc to the scope pen, on which the SUPPORTING AHA (S1) and therefore the PRIMARY AHA (S4) both rest — is specified against a **home pose that does not exist in the built code**: all three sealed siblings put the scope at `bottom:210px; left:12px`, not "right", and there is no screen space to the left of it. Separately, six of the design's most load-bearing beats are **over-constrained** (specified both by a phase target and by a narration cue, which cannot both hold), and two of those quote instants that are physically unobservable. And two on-canvas beats are actively wrong sound-off (Rule 24): a strike-through applied to a value that is correct at that instant, and three equal `5.0 Ω` chips asserting an unqualified identity that is in fact the resonance condition the chapter is deliberately withholding.

No escalation trigger fires: no doubt about the authored physics (every number I re-derived is right where it is quoted against the sealed defaults), and this is cycle 0 → 1.

---

## 1 · Number lock — independently re-derived, not trusted

| Quantity | My derivation | Skeleton | Verdict |
|---|---|---|---|
| ω | 2π(0.25) = **1.5707963 rad/s** = **90.000 °/s** | π/2 rad/s, 90°/s | ✓ |
| T | 360/90 = **4.000 s** | 4.0 s, one turn = one cycle | ✓ |
| θ at t = 0.5 s | 45.0° → v = 10 sin45° = **7.0711 → +7.1 V** | +7.1 V | ✓ |
| R branch | 10.0/5.00 = **2.0000 A** | 2.00 A | ✓ |
| L branch (sealed `L = 3.1831 H`) | ωL = **5.000002 Ω** → iₘ = **1.999999 A** | 5.0000 Ω → 2.0000 A | ✓ |
| C branch (sealed `C = 0.1273 F`) | ωC = 0.19996237 → X_C = **5.000941 Ω** → iₘ = **1.999624 A** | 5.0009 Ω → 1.9996 A | ✓ **as against the sealed default** |
| C branch (skeleton's stated lock `C = 0.4/π F`) | ωC = **0.2000000** → X_C = **5.000000 Ω** → iₘ = **2.000000 A** | — | ✗ **contradicts its own quoted 5.0009 / 1.9996** |
| v peak-line crossing | ωt = 90° → **t = 1.0 s** | 1.0 s | ✓ |
| L's i crossing (lag 90°) | ωt = 180° → **t = 2.0 s** | 2.0 s | ✓ |
| C's i crossing (lead 90°) | ωt = 0° → **t = 0.0 s** | 0.0 s | ✓ arithmetically — but see **F2** |

Sealed defaults read directly from JSON: `vm 10.0 / R 5.0 / f_demo 0.25` (resistor), `L 3.1831` (inductor), `C 0.1273` (capacitor) — all `min 2 max 20 step 1` on vₘ, `0.1–0.5 step 0.05` on f_demo, so the skeleton's inherited slider ranges are correct.

**Home pose, colour, no-re-teach, sibling-independence — checked and clean:**
- **Colour law is correct and genuinely sibling-independent.** Built code: `ac_resistor` beads `#FFB300` (amber, `:24288`), `ac_capacitor` beads `#FFB300` (`:26361`), `ac_inductor` beads `#4FC3F7` (cyan — the known defect, `:25190`); scope traces cyan `#E0F7FA`/`#4DD0E1` for v, amber `#FFB300` for i. The skeleton's "force amber on this scenario's cloned coil asset regardless of the sibling" is right, matches 2 of 3 siblings, and consumes no open founder ruling. ✓ constraint 5.
- **No re-teaching.** Every element fact arrives as a one-clause callback riding its ghost trace (Block 1 cliff patches); the new load in S3/S4/S5 is the *arrow lock*, not the mechanism. ✓ constraint 3.
- **Compose-routine promotion.** Honest answer to the dispatch's question: the concept does **not technically require** promotion — a scenario-scoped `phsComposeSegments` clone would render `X_L`/`X_C` side by side just as well. The skeleton's "MUST be promoted" is a quality choice, not a technical necessity. **It is nonetheless the correct choice** (PRIME DIRECTIVE: the fleet-wide engine capability over the local workaround; it is also the founder's own Checkpoint-C item (d) recommendation), and it correctly migrates **zero sealed call sites**, so it does not depend on any sibling being modified. ✓ constraint 4 — with the caveat in **F4** that its stated *forcing frame* (the S6 scoreboard) is itself a defect.
- **Ring coherence with siblings verified:** `X_C` first appears in `ac_voltage_capacitor` STATE_5, `depth_ring: extended`; this skeleton puts `X_L`/`X_C` in S6, extended. Consistent. Advanced ring (S7) contiguous, immediately before explore. Both cuts checked. ✓ 38a/38b/38c.

---

## 2 · Design-gate per-state check

| S | ring | archetype | budget | controls | one-new-thing distinct? | findings |
|---|---|---|---|---|---|---|
| S1 | core | `projection-trace` (coin) | 40–55 | none | ✓ pen-wiring + congruence | **F1** (geometry) |
| S2 | core | `oscillate/track` | 35–50 | vₘ live | ✓ length/shadow split | **F3**, F6, F9, P3-11 |
| S3 | core | `rigid-pair-rotation` (coin) | 35–50 | f live | ✓ second arrow + arc | F5 (f-blind vacuity) |
| S4 | core | `rigid-pair-rotation` (declared pair) | 45–55 | none | ✓ angle opens 0°→90° | **F2**, F6 |
| S5 | core | `rotate/flip` | 30–45 | none | ✓ mirror flip | — |
| S6 | extended | `finish-line-read` (coin) | 40–55 | none | ✓ crossing order + scoreboard | **F2**, **F4**, F6, F7, P3-11 |
| S7 | advanced | `chain-link-derivation` | 45–55 | none | ✓ algebra chain | F5 (dim-restore) |
| S8 | core | `drag-sandbox` | open | vₘ·f·element | ✓ | F5, F8 |

Word budgets all inside 25–55 ✓. `advance_mode` 7 × `manual_click` + 1 × `interaction_complete` = 2 distinct ✓ (Gate 12). Exactly one declared contrast pair ✓. No static state *as declared* — but see **F6**. Explore last with all controls ✓ (but see **F8**). Two 16a pivots at genuine pivots, contrast beats, no predict-pause ✓.

---

## 3 · Findings

### F1 — P1 — The disc/scope geometry is specified against a home pose that does not exist. `alex:architect`

The skeleton's REUSE manifest (`skeleton.md:93`), §10h (`:408`) and §0b req 1 (`:101–103`) all place the **"scope pane right"** and dock the new disc pane **"immediately LEFT of the scope, sharing the scope's vertical value axis."**

Built code, all three sealed siblings:

| overlay | actual CSS | file:line |
|---|---|---|
| scope (v–i graph, 320×150) | `position:fixed; bottom:210px; **left:12px**` | `field_3d_renderer.ts:26526` (acc), `:25283` (acl), `:24375` (acr) |
| power graph | `bottom:88px; left:12px` | `:26531` |
| primary HUD readout | `top:52px; right:12px` | `:26521`-adjacent / `:24365`, `:25276` |
| formula panel | `top:40%; right:22px` | `:26534` |
| sliders | `bottom:12px; right:12px` | `:26543` |

The scope is a **bottom-left 320×150 DOM canvas**, not a right-hand pane. "Immediately left of it" is 12 px of screen edge. The phrase "scope pane right" is inherited boilerplate that was harmless in the three siblings (nothing depended on it) and becomes **load-bearing** here, because the tie-line-to-pen adjacency is the mechanism the whole concept rests on. §10h's "engine computes exact placement" defers the one genuinely new spatial decision in a DoD that claims zero TBDs.

*What a founder would say:* "You've put the circle where there's no room, and you've described a layout you never opened."

**Fix:** decide the geometry at design time and state it in CSS terms. Note the real free real estate: phasors needs no power graph, so `bottom:88–198px` on the left is available — a circle **above** the sine strip, or a single combined left-band canvas holding disc + scope, are both viable. Then re-state honestly what "home pose inherited" means when a pane is added (Rule 32d at chapter scale is a deliberate, declared break, not a claim of pixel-consistency).

### F2 — P1 — Phase-determined events are authored as both phase targets and narration cues; two quoted instants are unobservable. `alex:architect`

The skeleton binds **all** one-shots to `scenario_cue` (`:44`, `:268`) while simultaneously pinning them to specific θ / absolute t. These over-determine the moment and cannot both hold.

- **S2 stops** are specified at θ = 90°, 45°, 180° *in that narrative order* (`:225`). Chronologically in the first turn those are t = 1.0 s, **0.5 s**, 2.0 s — the second stop **precedes** the first. Cue-binding to sentences 2/3/4 gives a third, different ordering.
- **S6 crossings** (`:229`): C's i-arrow crosses the peak line at **t = 0.0 s** — the state's opening instant. The arrow *starts on the line*; there is no sweep to watch, no cause-then-effect beat (32a), and a cue bound to sentence 2 fires seconds after the event it labels. The authored labels `t = 0.0 s` / `t = 1.0 s` are also only true on the first turn; the next observable pair is 4.0 s / 5.0 s.
- The **finish line is vertical through the centre**, so each arrow crosses it **twice per turn** — the lower half is the trough, not the peak. Unspecified. A sound-off reader watching flashes fire at troughs is misled.

This is a design-time recurrence of the class already filed as `phase_anchored_caption_authored_as_wallclock_at_ms` + `unbound_one_shot_static_at_ms_races_cue_armed_siblings_in_same_state` → **P1 by the Pass-1 recurrence rule.**

**Fix:** state one arming semantics explicitly — recommended: **cue ARMS, phase FIRES** (the one-shot waits for the next occurrence of its θ target after its sentence opens), with the displayed timestamp **computed from the actual crossing instant**, never authored as a literal. Give S6 a state phase offset θ₀ so the first C crossing lands ~0.5–1.0 s in, and restrict the flash to the upper half of the peak line. Re-order S2's stops chronologically or accept a full extra turn and say so in the dwell budget.

### F3 — P1 — S2 strikes through a reading that is correct at that instant (Rule 24 sound-off). `alex:architect`

`skeleton.md:225`: at the θ = 90° freeze, *"a struck wrong-readout appears first (`v = 10 V?` struck through) and the HUD answers `v = +10.0 V` (here they agree — the trap)"*.

On screen with sound off: a crossed-out `10 V` beside `+10.0 V`. Strike-through means "this is wrong". At θ = 90° it is **right**. The visual contradicts itself at the exact beat carrying misconception pivot #1, and narration is the only thing resolving it — which Rule 24 forbids as a load-bearing mechanism.

**Fix:** at θ = 90° show the naive length-reading **unstruck with an agreement mark** ("length says 10 V ✓ — only here"); introduce the strike at the θ = 45° stop where the two genuinely diverge. This *strengthens* the trap and reads correctly sound-off.

### F4 — P1 — S6's scoreboard asserts `R = X_L = X_C = 5.0 Ω` sound-off, unqualified — and that identity is the resonance fact the chapter is deliberately withholding. `alex:architect`

`skeleton.md:229`, `:370`: three chips `R = 5.0 Ω` · `X_L = 5.0 Ω` · `X_C = 5.0 Ω`, with the design's stated mitigation being *narration silence* ("narration reads the angles, NOT the equal oppositions").

The skeleton's own planting audit item (3) (`:508`) identifies exactly this hazard and then declares it prevented by not talking about it. **Narration silence is not a visual prevention** — sound-off it is the *worst* option, because the equality is displayed with nothing on canvas to condition it. And per the Checkpoint-C packet, this equality is not a coincidence: f_res = 1/(2π√(LC)) = 0.25002 Hz against a default f = 0.25 Hz — **the chapter's default operating point is the resonance point**, which `series_lcr_circuit` is supposed to open with. Displaying it silently pre-spoils it in the least useful form and plants "R, X_L, X_C are always the same kind of thing, and equal."

Note the knock-on: the scoreboard's Ω chips are the skeleton's **sole stated forcing reason** for the compose-routine promotion (`:45`, `:129`). Removing them does not remove the promotion's justification (`v_m`/`i_m` compose everywhere, and the founder already named it the highest-leverage fleet fix), but the architect must re-justify it on those grounds rather than on a beat that is itself being fixed.

**Fix (pick one, state it):** (a) drop the Ω values — S6's teaching is *angles*, and the chips add nothing to "ahead in rotation ⇒ peaks first"; or (b) keep them but render the operating condition on canvas beside them (`at f = 0.25 Hz`) so the equality is visibly conditional. (a) is the founder-taste answer.

### F5 — P1 — §10j is missing the pairings for the negative claims that already cost this chapter. `alex:architect`

§10j (`:454–464`) is a genuine advance — six pairings, all sound. But four load-bearing absence claims in this design have **no** paired existence assertion, and the first is the exact defect that shipped on concept 3 and was baked into THE EYE's own baseline:

1. **"S8 reached through S7 must ship BRIGHT"** (`:42`). This is the `field3d_dim_apparatus_one_way_with_no_restore_on_state_exit` class — the permanently-dimmed sandbox. §0a names the clone duty; §10j carries **no measurement**. Required pairing: *in a run that traverses S7 first, S8's apparatus material opacity/colour is captured and compared equal to the pristine S1 values* — a positive measurement, not "we cloned the pattern."
2. **"iₘ never moves / the lock never opens" during the S3 f-drag** (`:226`). Vacuously true if the i-arrow's length is never bound to iₘ at all — precisely the invisible-charge-layer class. Required pairing: *the i-arrow length IS iₘ-driven (proved by an element change in S8 changing it measurably) AND is invariant under f-drag in S3.*
3. **"Scoreboard, timestamps, `X_L`/`X_C` absent from S8"** — row 5 covers `X_L`/`X_C` only; the scoreboard and crossing timestamps have no presence-in-S6/absence-in-S8 pair.
4. **"No sprite label pre-spoils φ / X_L / X_C / lead-lag before its state"** (`:47`, `:57`) — negative-only; needs the paired "the label exists, composed, in its own state."

### F6 — P2 — A freeze stops **both** panes; §10d's "with the scope/HUD alive" is false, and up to 4.5 s per state is fully static. `alex:architect`

§10d (`:387`) and §0b req 5 (`:122–124`) claim the freezes are *"pauses of the disc only, with the scope/HUD alive"* and *"the scope pen keeps its already-drawn trace."* But the pen's y-position **is** the arrow's shadow (that wiring is the concept's teaching), and the HUD reads v = vₘ sin θ. If θ stops, the pen stops and the HUD digits stop. Nothing on screen moves except the caption. S2 and S4 each carry three ≤1.5 s freezes → up to **4.5 s of a ~15–20 s state fully frozen**; S6 additionally "eases to a stop" and ends static.

That may well be the right pedagogy (a snapshot is the point), but it must be declared honestly, because three downstream parties are being told something untrue: physics_author sizing dwell, json_author wiring the pen, and eye_walker, whose pre-refutation (`:570`) tells it these are "not stalled motion."

**Fix:** state that a freeze halts disc + tie-line + pen + HUD together, cap total frozen time per state (suggest ≤3.0 s), name what *is* alive (the circuit-band beads, which are independent of θ only if they too are not θ-driven — resolve and state which), and correct the §10d and eye-walker-pre-refutation wording.

### F7 — P2 — The caption-ORDER evidence gap is deferred to a manual pass when a filed probe already exists. `alex:architect`

The dispatch asked me to name, at design time, where load-bearing meaning sits in caption sequence and canvas text, and what evidence substitutes. **This design puts more there than any concept in the chapter:** six cue-armed freeze captions (S2 ×3, S4 ×3), S6's two ordered crossing timestamps, and S6's entire claim, which *is* an ordering claim. THE EYE posts no cue times; founder_drive's DOM collision probe cannot see canvas-internal text (which is why the sealed inductor's E9 defect survived its own Checkpoint C).

The skeleton's answer (`:571`) is *"founder-proxy must live-check the freeze-caption sequence in the player"* — a manual pass, at the exact scale where manual stops working. But `docs/loop_runs/ch7/_engine/scar_candidates.sql:824` already contains an **OPEN `probe_definition`**, `live_player_caption_order_probe_via_filltext_interception`, owned by `peter_parker:renderer_primitives`, whose `probe_logic` prescribes exactly the deterministic check needed (fillText interception stamped with `PM_simTimeMs`, 250 ms coalescing, ≥2 periods, order/window/overlap assertions).

**Fix:** name that probe as a **required Checkpoint-B artifact** for S2/S4/S6, and add its implementation to the §0b engine ask. Separately, name the substitute for canvas-internal collision (E9 class): a cropped-frame pixel inspection duty on S6's timestamps and scoreboard, since no DOM probe will see them.

### F8 — P2 — The sandbox cannot demonstrate the concept's own core claim. `alex:architect`

S8 exposes vₘ, f, and the R/L/C picker. It does **not** expose the selected element's magnitude. The single most convincing sandbox demonstration of the atomic claim — *drag L or C, watch the arrow length change while the 90° holds dead still* — is unavailable. The skeleton's own JEE-backwards trace item (v) is a question of exactly this shape. The engine already computes iₘ live from the element value, so the marginal cost is one slider row.

**Fix:** add a fourth control to S8 — the selected element's value, ranges inherited from the sibling JSONs (`R 2–20 Ω step 1` · `L 1.0–10.0 H step 0.1` · `C 0.04–0.40 F step 0.02`), row swapping with the picker.

### F9 — P2 — The number lock states a C value that is not the sealed default, and its own quoted derivation does not follow from it. `alex:architect`

`skeleton.md:112` and `:188` prescribe *"chapter-locked L = 10/π H, **C = 0.4/π F**"* as the values the carousel consumes, and in the same sentence quote *"1/(ωC) = 5.0009 Ω → 1.9996 A."* Re-derived above: **C = 0.4/π gives exactly 5.000000 Ω and 2.000000 A**; the quoted 5.0009 / 1.9996 follow only from the **sealed default `C = 0.1273 F`**. (L is unaffected: 10/π and the sealed 3.1831 agree to 6 s.f.)

Impact on pixels is nil (both render `5.0 Ω` / `2.00 A`, and the 0.02 % amplitude gap is far below any congruence tolerance) — but the dispatch's standard is that the lock is re-derived, and json_author implementing the literal instruction would author a default that differs from the sibling it is claiming to reproduce.

**Fix:** pin the carousel to the **sealed decimals** `R = 5.0`, `L = 3.1831`, `C = 0.1273`, and either drop the 10/π · 0.4/π fractions or mark them explicitly as the design intent behind the rounded sealed values.

### F10 — P3 — S2's archetype label. `alex:architect`
`oscillate/track` (`:225`) mislabels a state whose signature beats are three **freezes** plus a slider-driven length rescale. Nothing oscillates that wasn't already oscillating. Suggest a coin (`freeze-and-read`) or `reveal-build`. Cosmetic to the build, but the archetype table is the Rule-31 distinctness artifact and should be true.

### F11 — P3 — Two formula surfaces carry English prose. `alex:architect`
S6 `ahead in rotation ⇒ peaks first` and S8 `angle between arrows = phase difference` (`:375–376`) are sentences rendered on the Cambria-Math surface (Rule 34a/34b: the formula surface holds the symbolic equation; prose lives in the capStrip). Suggest `φ > 0 ⇒ i peaks first` and `φ = angle(v, i)` with the gloss spoken.

**Not a finding, noted:** `curriculum_tags` marks CBSE/NCERT *"✓ full — verified"* without a teacher, which is a mild 38g overstep — but it matches both sealed siblings exactly, so it is a chapter-consistency item for the founder, not a phasors defect.

---

## 4 · Candidate scar rows

Authored against the **live** CHECK constraints (`severity IN ('CRITICAL','MAJOR','MODERATE')`, 7-value `owner_cluster`, `probe_type IN ('sql','js_eval','manual','vision_model')`), **not** against `.agents/founder_proxy/CLAUDE.md`, whose severity and probe_type enums are known-wrong and already filed for founder correction. Checked against all 40 `bug_class` values in `docs/loop_runs/ch7/_engine/scar_candidates.sql` — no collisions.

```sql
INSERT INTO engine_bug_queue
 (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type) VALUES

('skeleton_zone_map_asserts_pane_geometry_never_checked_against_built_overlay_css',
 'A skeleton zone map inherited a wrong pane position from its siblings and a new pane was specced against it',
 'MAJOR', 'alex:architect',
 'All four Ch.7 ac_* skeletons state "scope pane right" in their Rule-34 canvas budget. In the built renderer the v-i scope is a 320x150 DOM canvas at bottom:210px;left:12px (field_3d_renderer.ts:24375/:25283/:26526) and the top-right corner holds the HUD readout. The phrase was harmless boilerplate in the three sealed siblings because nothing depended on it. In phasors it became load-bearing: the new phasor disc was specced "immediately LEFT of the scope, sharing its vertical axis", i.e. into 12 px of screen edge, and that adjacency carries the concept SUPPORTING AHA (the projection tie-line to the scope pen).',
 'Any skeleton that positions a NEW overlay RELATIVE to an existing one must cite the existing overlay actual CSS (file:line) in its zone map, not a prose memory of it. Relative placement claims are verified against the renderer source at Checkpoint A.',
 'manual',
 'For each relative-placement claim in a skeleton zone map, grep the renderer for the referenced overlay id and read its inline position/left/right/top/bottom. FAIL if the claimed side does not match, or if the free space in the claimed direction is less than the new overlay stated width.',
 'OPEN', ARRAY['phasors']::text[], ARRAY[]::text[],
 'ch7-stage4-phasors-checkpointA-cycle0', 'incident'),

('one_shot_over_constrained_by_both_phase_target_and_narration_cue',
 'A physically phase-determined one-shot authored as cue-bound AND pinned to a theta/absolute-t target',
 'MAJOR', 'alex:architect',
 'The phasors design specifies six freeze stops and two finish-line crossing flashes as scenario_cue-bound while also pinning each to a specific rotation angle or absolute state time. A cue fires when its sentence starts; a crossing happens when the rotation reaches the angle. The two cannot both hold, so the implementer silently picks one. Two of the quoted instants are additionally unobservable: S6 first C crossing at t = 0.0 s is the state opening frame (arrow starts on the line, no sweep), and S2 three stops are narrated 90 deg then 45 deg then 180 deg, which is not chronological within one turn.',
 'A one-shot whose trigger is a PHYSICAL event must declare arm-vs-fire semantics explicitly (cue ARMS, phase FIRES at the next occurrence) and must derive any displayed timestamp from the actual firing instant, never author it as a literal. Any authored instant at t = 0 of a state is rejected: it cannot show a cause-then-effect beat (Rule 32a).',
 'js_eval',
 'In the live player, log each one-shot fire with {id, PM_simTimeMs, theta}. FAIL if any fire time is < 0.3 s from state start, if a displayed timestamp differs from its logged fire time, or if the fire order differs from the authored narration order.',
 'OPEN', ARRAY['phasors']::text[], ARRAY[]::text[],
 'ch7-stage4-phasors-checkpointA-cycle0', 'incident'),

('oncanvas_numeric_coincidence_shown_unqualified_with_only_narration_as_guard',
 'Equal numeric chips assert an unintended general identity sound-off; narration silence is not a visual guard',
 'MODERATE', 'alex:architect',
 'The phasors S6 scoreboard renders R = 5.0 ohm, X_L = 5.0 ohm, X_C = 5.0 ohm side by side. The equality is an artifact of the chapter locked operating point (which is in fact the resonance point, f_res = 0.25002 Hz vs default 0.25 Hz) and is the very fact deferred to series_lcr_circuit. The design mitigation was to leave it unspoken, which under Rule 24 (the sim reads sound-off) is the weakest option: the identity is displayed with nothing on canvas to condition it.',
 'When a state renders numerically equal values whose equality is an artifact of the default operating point, either omit the numerals or render the operating condition beside them on canvas. Narration silence is never accepted as the guard for a sound-off misreading.',
 'manual',
 'In every frozen frame, list numerically equal on-canvas values belonging to different physical quantities. FAIL if any such set is rendered without an on-canvas condition label and the concept does not teach the equality.',
 'OPEN', ARRAY['phasors']::text[], ARRAY[]::text[],
 'ch7-stage4-phasors-checkpointA-cycle0', 'incident');
```

**Not minted (deliberate, per bug_class discipline):** F5 is a design-time recurrence of the existing row `review_negative_form_check_is_vacuous_without_an_existence_assertion` — extend that row's `concepts_affected` with `'phasors'` rather than minting a duplicate. F7 needs no new row — `live_player_caption_order_probe_via_filltext_interception` (`scar_candidates.sql:824`) already prescribes the mechanism and is OPEN; it should be pulled into this concept's engine ask.

---

## 5 · Evidence pointers (verifiable in under a minute each)

1. `src/lib/renderers/field_3d_renderer.ts:26526` — `acc_graph_vi` at `bottom:210px;left:12px`. The scope is bottom-LEFT (F1). Same at `:25283`, `:24375`.
2. `docs/loop_runs/ch7/phasors/skeleton.md:101–103` + `:408` — "immediately LEFT of the scope … scope pane right" (F1).
3. `skeleton.md:188` vs `src/data/concepts/ac_voltage_capacitor.json` `variables.C.default = 0.1273` — `0.4/π` gives 5.0000 Ω exactly, not 5.0009 (F9).
4. `skeleton.md:229` — S6 crossing at `t = 0.0 s`, and the three `5.0 Ω` scoreboard chips (F2, F4).
5. `docs/loop_runs/ch7/_engine/scar_candidates.sql:824` — the caption-order probe that already exists and is unclaimed by this design (F7).

---

## 6 · Self-review

- **Recurrence check ran and is named, not asserted.** Checked this design against, by class: `field3d_dim_apparatus_one_way_with_no_restore_on_state_exit` (→ F5.1, gap), `review_negative_form_check_is_vacuous_without_an_existence_assertion` (→ F5, gap), `field3d_scenario_declares_bead_element_but_never_builds_the_meshes` + `field3d_child_mesh_never_registered_in_sceneobjects` (→ §10j covers, ✓), `phase_anchored_caption_authored_as_wallclock_at_ms` + `unbound_one_shot_static_at_ms_races_cue_armed_siblings` (→ F2, recurrence), `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (→ closed-form θ(t), ✓), `field3d_canvas_caption_text_not_cleared_between_sequential_reveals` (→ F1 pattern declared, ✓), `field3d_readout_hud_emits_untaught_ring_quantity` (→ ring-gate declared, ✓), `canvas_graph_label_collides_with_peak_reference_line` (→ declared but unverifiable by any existing probe, F7), `glow_focal_on_live_driven_object_exempted_becomes_total_noop` (→ exemption declared with a real visual op, ✓), `field3d_hardcoded_sprite_label_prespoils_later_state_reveal` (→ declared, existence pairing missing, F5.4), `field3d_duplicate_formula_surface_sprite_label_vs_formula_overlay` (→ ✓), `field3d_createtubeline_undefined_field_lines_throws` (→ conditional duty, correctly deferred to the engine JSON contract), `ghost_compare_cause_invisible_slider_frozen` (→ correctly N/A, no scripted ramps), `slider_step_grid_offset_when_min_is_nonzero` (→ becomes live if F8 is accepted; flag the element-value slider's `min`/`step` grid), `scar_candidate_sql_authored_outside_the_live_column_list` (→ applied to my own rows above).
- **Rule 38 checked in full**, not just 38b: 38a ring order + contiguity + both cuts ✓; 38b explore core-only ✓; 38c notation ladder (degrees core/extended, radians confined to S7) ✓; 38d dialect ("phase difference φ" dual-labelled once) ✓; 38f anchor is a genuine widest-overlap device ✓; 38g every non-CBSE cell carries `needs_teacher_verification` ✓ (CBSE self-verification noted as a chapter-consistency item, not a finding).
- **Every finding names exactly one owner** (`alex:architect` throughout — correct at Checkpoint A, where physics_author has not run and the engine ask is not yet dispatched). No `peter_parker:*` routing: F1 and F7 will *become* engine work, but at design time the deliverable is the architect specifying them, so `FIX(engine)` does not apply yet.
- **PRIME DIRECTIVE check on every finding.** F1's cheap workaround (let the engine put the disc anywhere and drop the axis-sharing) is rejected — the shared vertical axis *is* the projection teaching. F7's cheap workaround (manual founder-proxy pass) is rejected in favour of implementing the filed probe. F4's cheap workaround (add a narration clause) is rejected in favour of an on-canvas fix, per Rule 24. F8 costs engine work and is still asked for.
- **No P1 softened to reach a friendlier verdict**, and none manufactured: the skeleton's engine triage, ring discipline, misconception selection, planting audit, withholding contract and anchor were examined and found **sound**, and are recorded as such rather than padded into findings. F10/F11 are honestly graded P3 and would not by themselves have moved the verdict.
- Nothing written, nothing dispatched, no SQL applied, no DB row touched.
