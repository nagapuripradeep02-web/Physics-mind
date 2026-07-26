# founder-proxy — Checkpoint A (design gate) — `phasors` (Ch.7 #4) — **cycle 1**

> Persisted verbatim by the loop session (founder-proxy has no Write tool).
> Re-review of the 44-patch revision applied by the loop session to `docs/loop_runs/ch7/phasors/skeleton.md` (777 lines). Verified against the FILE and against the built renderer source — not against the revision log's prose.

# VERDICT: `DESIGN_OK` — proceed to `alex:physics-author`

**Justification.** All 11 findings landed at the locations the revision log claims, and — the part that matters — 11 of 11 **resolve** rather than restate. I checked the two founder-visible decisions arithmetically against `field_3d_renderer.ts` rather than against the skeleton's citations: the F1 envelope claim is **correct** (185 + 170 = 355 ≤ 360, and the 13 px it borrows below 198 px is the power-graph slot, which this scenario declares empty in every state), and the F4 re-justification is **honest** — it is now explicitly labelled a quality choice with the retired premise recorded for the founder, which is exactly what I asked for. The number lock re-derives clean against the sealed decimals. Nothing previously sound was weakened; one probe (§10j row 1) was correctly narrowed and one new loophole rides in it (R8 below).

The cycle-1 revision introduced substantial new material, and I judged it fresh. Most of it is good: the cue-ARMS/phase-FIRES semantics produce a genuinely observable S6 first crossing (θ₀ 90° short = 1.0 s at 90°/s), the F8 slider ranges match the sealed sliders **verbatim** — including the off-grid defaults, which makes "off-grid initial, snap on first drag" the *already-shipped fleet behaviour* rather than a new judgement call — and the four new §10j pairings are measurable, not aspirational (row 8's "at a non-default f" qualifier is a real catch: at defaults R and L both give exactly 2.00 A, so the naive version would have been vacuous).

**Eight residuals remain. None is design-blocking; all are carried forward by name** so they cannot be silently skipped. Two of them (R1, R2) are sub-geometry consequences of the F1 decision that the engine dispatch's declared ±20 px allowance cannot reach, because the binding-invariant list omits the disc diameter — those go into the §3b engine prompt as binding constraints, not into a second design cycle. I am explicitly **not** parking over them: the F1 decision itself is right in kind, and the fixes are one-sentence sizing allowances that do not re-architect anything.

No escalation trigger: no doubt about the authored physics (every number re-derived below), and no budget breach.

---

## 1 · Patch-landing audit — all 11, verified in the file

| F | Claimed location | Landed? | **Resolves** the finding? |
|---|---|---|---|
| F1 | §0b manifest `:93–97`, req 1 `:106–119`, §10h `:459–461` | ✓ | ✓ — geometry decided in CSS terms, siblings' CSS cited with file:line, "home pose inherited" re-scoped to four surfaces, subsumption declared as a Rule-32d break |
| F2 | §0a `:44`, §0b req 6 `:145–151`, §2 `:231–233`, S2/S4/S6 rows, cue plan `:308–316` | ✓ | ✓ — one declared semantics, timestamps DERIVED, θ₀ offset, upper-crossing-only, S2 stops chronological |
| F3 | §0b req 5 `:141–144`, S2 row `:268` | ✓ | ✓ — strike at 45° (divergent), agreement mark at 90°. §4's row `:332` already said 45° — verified, no contradiction |
| F4 | §0a ×3, §0b req 7, S6/S8 rows, §10b `:417`, i-1/i-2, §10j row 5, planting audit (3), Escalations 1/5/6 | ✓ | ✓ — reactance symbols nowhere in any cut; equality never displayed |
| F5 | §10j `:513–522` | ✓ (6 → 10 rows, counted) | ✓ — all four new rows measurable; see §4 |
| F6 | §0a `:61`, §0b req 5 `:137–140`, §10d `:435–438`, eye-walker pre-refutation `:638–639` | ✓ | ✓ — honest, budgeted, falsifiable ("DO file any freeze exceeding its budget") |
| F7 | §0b req 8 `:176–182`, TTS/EYE block `:531–533`, Escalation 7 `:641` | ✓ | ✓ — probe row confirmed present at `scar_candidates.sql:823`, OPEN, `peter_parker:renderer_primitives` |
| F8 | §0b req 8 `:170–175`, S8 row `:274`, i-2 `:481` | ✓ | ✓ — and better than I asked; see §3 |
| F9 | §0b req 2 `:124–126`, §2 `:225–227`, self-review `:699–702` | ✓ | ✓ — fractions demoted to design-intent notes everywhere |
| F10 | `:248–249`, `:254`, `:277`, `:660` | ✓ | ✓ — `oscillate/track` gone from the reuse list |
| F11 | §10b `:422–425` | ✓ | ✓ — both surfaces now symbolic |

---

## 2 · The two founder-visible decisions

### F1 → combined left-band canvas `phs_band` — **arithmetic checked myself, decision ACCEPTED**

Built code, read directly (not via the skeleton's citations):

| overlay | actual CSS | vertical extent (from bottom) |
|---|---|---|
| `acc_graph_vi` / `acl_` / `acr_` — 320×**150** | `bottom:210px; left:12px` (`:26526` / `:25283` / `:24375`) | **210 → 360** |
| `acc_graph_p` / `acl_` / `acr_` — 320×**110** | `bottom:88px; left:12px` (`:26531` / `:25288` / `:24380`) | **88 → 198** |
| sliders | `bottom:12px; right:12px`, `min-width:230px` | 12 → ~180 (3 rows) |

- **Envelope claim verified.** 185 + 170 = **355 ≤ 360**. Correct. The skeleton's stated 210+150 = 360 reference is the real sealed top edge.
- **The 13 px I checked for.** `phs_band` starts at 185, which is *below* the sealed scope's 210 and intrudes into the power-graph band (top edge 198). The skeleton pre-empts this: the power-graph slot "stays EMPTY in every state (phasors has no power strip)". True — phasors teaches no power. **No collision.**
- **Horizontal.** Band spans x 12–512. Nothing else on the left below `top:52px`. The siblings' left-top panels (`acc_ureadout`/`acl_ureadout`/`acr_twin_readout`, all `top:52px;left:12px`) are top-left, not bottom-left. **Clear.**
- The decision is also the *right* one on the merits: I said at cycle 0 that the shared vertical axis **is** the projection teaching, and the architect chose the one option that keeps the tie-line horizontal and same-canvas. Rejecting "disc above the strip" for that reason is correct reasoning, not post-hoc.

**Accepted.** Two sub-geometry residuals ride on it — R1, R2 in §5.

### F4 → drop the Ω chips — **decision ACCEPTED; the re-justification HOLDS**

The removal is complete and consistent: reactance symbols render nowhere in the sim, in any preset cut (`:478`, `:483`), the planting-audit item (3) is rewritten as *resolved by removal* (`:569–572`), and §10j row 5 is rebuilt so the absence claim is non-vacuous (prove the compose path live on `v_m`/`i_m`, then assert zero `X_L`/`X_C` matches with the same detector). That is the right shape.

**On whether the promotion's re-justified grounds are honest — yes, with one clarification the founder should have.** The three stated grounds are not equal in weight, and the skeleton is right not to pretend they are:

- Grounds (i) `v_m`/`i_m` compose on every state and (ii) S7's chain are **volume**, not **forcing** — a scenario-scoped `phs_` clone would render both identically. The skeleton says exactly this, in the text, twice (`:158–159`, `:601–602`).
- The only real ground is (iii): fleet capability over a local workaround, which is the founder's own Checkpoint-C item-(d) recommendation and the PRIME DIRECTIVE answer.

That is the same conclusion I reached independently at cycle 0 (my report §1, "the concept does not technically require promotion… it is nonetheless the correct choice"). So the grounds are honest and the retired premise is recorded for the founder in the revision log verbatim. **Nothing to fix.**

**One thing the founder should see, because the risk/benefit moved:** with the Ω chips gone, the promotion now buys phasors *nothing the clone wouldn't*, while it still costs the load-bearing regression duty across all three sealed siblings (`:184–188`, `:603–605`). The architect kept that duty load-bearing rather than ceremonial, which is the correct handling — but if the founder would rather not take shared-text-layer risk on a sealed chapter for zero local gain, the clone is now the strictly cheaper path and the skeleton has already stated that it suffices. This is a founder call, pre-authorized either way; I record it, I do not route it.

---

## 3 · New material, judged fresh

**Cue-ARMS / phase-FIRES + the S6 θ₀ offset — sound.** At ω = 90°/s exactly, an i-arrow entering 90° short of the peak line crosses at **t ≈ 1.0 s** — an observable sweep with a real cause-then-effect beat, and v (a further 90° back, i leading for C) at **t ≈ 2.0 s**. Both inside the first turn, both inside a 40–55-word dwell. The reading is declared as *order + the 1.0 s gap*, which survives any arming slip — that is the correct invariant to hang the teaching on. Upper-crossing-only with the trough existence-paired closes the second half of F2.

**The "fires on the next turn" fallback — does blow the budget in the worst case (→ R3).** The skeleton budgets "one extra turn absorbed in the dwell", singular, but S2 arms three stops from three consecutive sentences. If each arms after its θ has just passed, each slips a full turn: **+4.0 s each at defaults, +12 s across S2**, and at the declared f = 0.1 Hz edge corner a single slip is **+10 s**. S4 is safe by construction (all three armed together at s3, so 30°→150°→240° chain inside one turn). This is dwell sizing — physics_author's job, and the skeleton already carries edge-corner FLAGs to that role — but the "one extra turn" phrasing understates it and must not be sized from.

**Freeze contract vs budgets — passes.** ≤1.0 s each / ≤3.0 s total against S2 (35–50 w ≈ 14–20 s) = ≤20% frozen; S4 (45–55 w ≈ 18–22 s) = ≤15%. Acceptable, and it is stated honestly enough for eye_walker to falsify (`:638–639` files over-budget freezes, not declared ones). The claim "a disc-only pause does not exist" is physically right — the pen's y *is* the shadow.

**F8 element-VALUE slider — verified against the sealed sliders, stronger than the skeleton claims.** The ranges are not proposals, they are the sealed rows verbatim:

```
:24400  var scR = acrSc("R", 2, 20, 1, 5.0,      "Resistance R")     → on-grid
:25304  var scL = aclSc("L", 1.0, 10.0, 0.1, 3.1831, "Inductance L") → OFF-grid, SEALED
:26545  var scC = accSc("C", 0.04, 0.40, 0.02, 0.1273, "Capacitance C") → OFF-grid, SEALED
```

So "off-grid initial value, snap on first drag" is **not a new hazard to adjudicate — it is the behaviour the fleet already ships and that passed Checkpoint C on `ac_voltage_capacitor` two commits ago.** Changing the range or step here would make phasors *inconsistent with its own carousel sources*. The architect's answer is right; I'd go further and say the flag can be downgraded from ⚠ to a json_author documentation line. **No change needed.**

**F7 probe as a required Checkpoint-B artifact — correct and the row is real.** `scar_candidates.sql:823`, OPEN, `probe_definition`, owner `peter_parker:renderer_primitives`, and its `probe_logic` prescribes precisely the order/window/overlap assertions S2/S4/S6 need. Adding its implementation to the §0b engine ask (rather than deferring to my live pass, now demoted to backstop) is the PRIME-DIRECTIVE answer.

**The four new §10j pairings — measurable, not prose.** Row 7 (S7→S8 brightness) is a capture-and-compare against pristine S1 values — a positive measurement, which is what "presence is not correctness" demands. Row 8 anticipates the trap I would have sprung: at defaults R and L give *identical* 2.00 A, so the qualifier "at a non-default f" is load-bearing and correct. Rows 9/10 depend on the F7 fillText detector landing — that dependency is declared, so it is a sequenced duty, not an aspiration.

**S6 `Δt = (φ/360°)·T` — good, and an upgrade.** 90/360 × 4.0 = **1.0 s** ✓. Degree-native, algebra-only (38c-clean for an extended state), symbolic not prose (F11 ✓), and it gives S6 genuine quantitative content that isn't reactance — which is exactly what the F4 removal needed to leave behind. One gap: **`T` is not in the §10b symbol table** and has no declared first-appearance state (→ R5).

**S8 `φ = ∠(v, i)` — acceptable.** Symbolic, Unicode (34c ✓), core-ring (38b ✓), gloss spoken (F11 ✓). `∠` is terse for school dialect but it is an angle operator, not calculus, and the arc it labels is on screen beside it.

---

## 4 · Re-checks on what I passed at cycle 0

**Number lock — re-derived independently against the sealed decimals, not trusted:**

| Quantity | My derivation | Skeleton `:225–227` | |
|---|---|---|---|
| ω | 2π(0.25) = 1.5707963 rad/s = **90.000 °/s** | π/2, 90°/s | ✓ |
| T | 360/90 = **4.000 s** | 4.0 s | ✓ |
| R = 5.0 | 10.0/5.0 = **2.0000 A** | 2.0000 A | ✓ |
| L = 3.1831 | ωL = **5.000002 Ω** → **1.999999 A** | 5.0000 Ω → 2.0000 A | ✓ |
| C = 0.1273 | ωC = 0.19996237 → X_C = **5.000941 Ω** → **1.999624 A** | 5.0009 Ω → 1.9996 A | ✓ **now follows from the stated value** |
| θ = 45° @ t = 0.5 s | 10 sin45° = **7.0711 → +7.1 V** | +7.1 V | ✓ |
| i @ 45° (S3, §10b `:412`) | 2 sin45° = **1.4142 → +1.41 A** | +1.41 A | ✓ |
| S6 crossings under θ₀ | 90°/90 °/s = **1.0 s**, then +90° = **2.0 s** | ≈1.0 s / ≈2.0 s | ✓ |
| S6 `Δt` | (90/360)(4.0) = **1.000 s** | 1.0 s | ✓ |

F9 fully closed — the quoted 5.0009/1.9996 now follow from the authored values, and 10/π · 0.4/π appear only as design-intent notes (`:126`, `:227`, `:700`).

**Ring coherence — intact, both cuts re-walked.** S1–S5 core · S6 extended · S7 advanced (contiguous, immediately before explore) · S8 core-neutral. Hide-advanced: S1–S6+S8 survive; no surviving state references radians or ωt-as-derivation, and S4's core clause keeps lead/lag readable. Hide-advanced+extended: S1–S5+S8; the F4 removal *strengthens* this cut — reactance symbols exist nowhere to leak in any cut. `X_C`'s extended-ring placement in `ac_voltage_capacitor` STATE_5 is no longer even a consistency question here. ✓ 38a/38b/38c/38d/38f/38g all re-checked in full; `curriculum_tags` unchanged, every non-CBSE cell carries `needs_teacher_verification`.

One notation wobble the ring cut exposes (→ R4): S1's core surface is `v = v_m sin(ωt)` while S2's is `shadow = v_m sin θ`, and the identity θ = ωt is not stated until **S7 (advanced)**. Under the hide-advanced preset a student meets two symbols for one angle with the identity never stated. The skeleton pre-empts it visually — S1 tags the disc's angle `ωt` (`:422`) — which is the right instinct; it just needs to be binding rather than parenthetical.

**Archetype distinctness — clean at 4 coins.** `projection-trace` · `freeze-and-read` (F10 recoin) · `rigid-pair-rotation` ×2 (declared pair S3/S4, delta names the flip 0°→90°) · `finish-line-read` + reuse `rotate/flip`, `chain-link-derivation`, `drag-sandbox`. `oscillate/track` removed from the reuse list `:254` ✓. `freeze-and-read` vs `finish-line-read` are genuinely distinct — one reads a *stopped* pose against a numeric, the other reads *ordering during motion*; the mild overlap (S6 eases to a stop at the end) is for the end pose, not the signature beat. Eight states, none static, one declared pair, explore-last. ✓

**Word budgets** 40–55 / 35–50 / 35–50 / 45–55 / 30–45 / 40–55 / 45–55 / open — all inside 25–55 ✓. **advance_mode** 7× `manual_click` + 1× `interaction_complete` ✓ Gate 12.

**Misconception beats — both improved, neither weakened.** S2's strike now debuts where the readings genuinely diverge (45°: struck `v = 10 V?` beside true `+7.1 V`, arrow visibly still full length) and the 90° stop carries the agreement mark. That is a *stronger* trap than cycle 0's and it reads correctly sound-off. §4's table row `:332` already cited 45° and needed no patch — verified, no contradiction between §3 and §4. S4's pivot (three freezes, arc reads 90.0° every time) unchanged. Exactly two pivots, both at genuine pivots, contrast beats draw the wrong expectation's consequence first, no predict-pause. ✓ 16a.

**Explore-last / 38b** — S8 four controls, scoreboard and timestamps absent, no reactance to leak ✓.

---

## 5 · Residual findings — real, not design-blocking, each routed

> These are for the loop to fold into the named downstream dispatch. **None warrants spending cycle 2.**

**R1 — P2 — `peter_parker` engine dispatch (§3b prompt, binding).** *S6's scoreboard cannot be legible in the region the zone map assigns it.* §0b req 1 pins the disc region to "~160 px square"; the S6 row `:272` and §10h `:461` both put the three-diagram scoreboard **inside** that region. 160 / 3 = **~53 px per cell**, and each cell carries two arrows plus a label — `90° behind` is ≈60 px at 11 px, i.e. **wider than its own cell**. That is the `canvas_graph_label_collides_with_peak_reference_line` (E9) class arriving at design time. **Named resolution:** at S6, after the crossing beats complete and the disc eases to a stop, the scoreboard is permitted the **full 500 px band width** (the sine strip has already discharged its S6 duty — the crest pulses happen during the crossings, before the split). This preserves every F1 binding invariant. Add "scoreboard footprint ≥140 px per cell" to the binding-invariant list, which currently omits it, so the engine's ±20 px allowance cannot reach a 3× shortfall.

**R2 — P2 — `peter_parker` engine dispatch (§3b prompt, binding).** *The shared y-axis, at the declared disc size, leaves no vertical margin.* Band height 170 px; a 160 px disc means radius 80 px; a shared internal y-axis then forces the trace's peak amplitude to 80 px → **160 px peak-to-peak inside 170 px, ~5 px of margin**. The family's `v_m`/`i_m` gutter lines and their labels, plus S6's timestamps "on clear baselines away from the peak line", have nowhere to go. **Named resolution:** constrain the shared-axis half-height (= disc radius = trace peak amplitude) to **≤ 60 px**, i.e. disc diameter ≤ 120 px inside the 160 px region, leaving ≥25 px top and bottom. Add to the binding-invariant list.

**R3 — P2 — `alex:physics-author`.** *S2's dwell must be sized against the arm-slip worst case, not the stated "one extra turn."* Three sequentially-armed stops can each slip a full turn: **+4.0 s each at defaults (+12 s total), +10 s per slip at the f = 0.1 Hz edge corner** the skeleton itself flags. Either size S2's dwell for the worst case or constrain arming so stops 2 and 3 arm before their θ recurs. S4 is safe (armed together at s3 → chains inside one turn) — no action there.

**R4 — P2 — `alex:physics-author`.** *One angle, two symbols, identity deferred to a hideable ring.* Make S1's `ωt` tagging of the disc angle **binding** (not parenthetical) and add a one-clause S2 identification, or use one symbol on both surfaces. Chapter consistency (all three siblings open on `v = v_m sin ωt`) is the reason to keep `ωt`, so the fix is the tagging, not the formula.

**R5 — P3 — `alex:physics-author`.** *`T` is used before it is tabled.* S6's surface `Δt = (φ/360°)·T` introduces `T` with no row in the §10b symbol-label table and no declared first-appearance state (Rule 25, no untaught term). Add `T` (period, 4.0 s here) with its first state, or render the surface with the number substituted.

**R6 — P3 — `alex:json-author`.** *Wording precision.* §2 `:219` and the S6 row `:272` say the scoreboard carries "ANGLE labels + element glyphs ONLY, NO numerals" — but the angle labels *are* numerals (`φ = 0°`, `90° behind`). §10b `:417` disambiguates correctly. Author to §10b's precise form; do not implement the loose phrasing literally.

**R7 — P3 — `alex:json-author` / note only.** *Narrow-viewport collision, out of scope for the current probes.* Below ~782 px page width, the 500 px band (x 12–512) and S8's **four-row** sliders panel (`right:12px`, `min-width:230px` → left edge ≈ W−270) overlap horizontally, and the 4-row panel's top edge (~212 px) crosses the band's bottom (185 px). `founder_drive` runs at **1280×800** (`src/scripts/founder_drive.ts:108`) so this will not surface at Checkpoint B, and field_3d's mobile fallback only fires below 768 px *and* touch-like (`field_3d_renderer.ts:2478`). Note it; do not engineer for it.

**R8 — P2 — `alex:quality-auditor` + engine.** *F6's honesty opened an exemption the probe must not be able to abuse.* §10j row 1 now asserts bead motion "in S2 **OUTSIDE** the declared freeze windows" — correct and necessary, but the freeze windows are now **phase-fired**, while the skeleton retains authored `at_ms` values "as THE EYE arming fallbacks" (`:316`). If the exemption windows are computed from the authored `at_ms` rather than from the **observed fire log**, the probe will excuse motion at instants when nothing was frozen (and flag legitimate freezes). Bind it: the freeze-window exemption is defined from the F7 fillText/cue fire log, never from authored `at_ms`.

---

## 6 · Candidate scar row

Authored against the **live** CHECK constraints (`severity IN ('CRITICAL','MAJOR','MODERATE')`, 7-value `owner_cluster`, `probe_type IN ('sql','js_eval','manual','vision_model')`) — matching the format of the existing rows in `docs/loop_runs/ch7/_engine/scar_candidates.sql`, not the known-wrong enums in `.agents/founder_proxy/CLAUDE.md`. Checked against all 18 `bug_class` values in that file plus the 3 in my cycle-0 report — no collision.

```sql
INSERT INTO engine_bug_queue
 (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type) VALUES

('skeleton_zone_map_sizes_a_subregion_without_a_content_fit_check',
 'A zone map fixed a sub-region size and separately assigned it content that cannot fit',
 'MODERATE', 'alex:architect',
 'The phasors cycle-1 revision correctly replaced a wrong pane position with a decided one (a single ~500x170 left-band canvas), and the OUTER envelope arithmetic was verified against the built overlay CSS. But two INNER budgets were stated without a fit check: a ~160 px square disc region was assigned S6 three side-by-side labeled mini phasor diagrams (~53 px per cell against a ~60 px label), and a shared internal y-axis with an 80 px disc radius forces the trace peak amplitude to 80 px inside a 170 px canvas, leaving ~5 px for the family gutter lines, their labels and S6 timestamps that the same skeleton requires on clear baselines. The engine fine-tune allowance (+/-20 px) could not reach either, because the binding-invariant list named the canvas, the split and the axis but not the disc diameter or the scoreboard footprint.',
 'A skeleton zone map that fixes an overlay size must state, for the LARGEST content each sub-region carries in any state, a minimum footprint per element and a minimum clear margin, and both must appear in the binding-invariant list handed to the engine dispatch. An outer-envelope check is not a fit check.',
 'manual',
 'For every sub-region in a skeleton zone map, list the states that render into it and the maximum element count plus longest label in each. FAIL if any state divides the region into cells narrower than its own longest label, or if the declared axis mapping consumes more than 90 percent of the region height leaving no margin for gutter labels or reference-line text.',
 'OPEN', ARRAY['phasors']::text[], ARRAY[]::text[],
 'ch7-stage4-phasors-checkpointA-cycle1', 'incident');
```

**Not minted (deliberate):** R3/R4/R5 are ordinary downstream sizing/notation duties, not defect classes. R8 is an instance of the existing `unbound_one_shot_static_at_ms_races_cue_armed_siblings_in_same_state` class (`scar_candidates.sql:728`) — extend that row's `concepts_affected` with `'phasors'` rather than duplicating. My three cycle-0 candidate rows stand as filed in `founder_proxy_report_checkpointA.md` §4 and are unaffected by this revision.

---

## 7 · Evidence pointers (each verifiable in under a minute)

1. `src/lib/renderers/field_3d_renderer.ts:26526` / `:26531` — scope 320×**150** @ `bottom:210px`, power graph 320×**110** @ `bottom:88px`. Confirms 185+170 = 355 ≤ 360 **and** that the 13 px below 198 px is the empty power slot (F1 arithmetic).
2. `src/lib/renderers/field_3d_renderer.ts:25304` and `:26545` — sealed `L 1.0–10.0 step 0.1 default 3.1831`, `C 0.04–0.40 step 0.02 default 0.1273`. The F8 off-grid pattern is **already shipped fleet behaviour**, not a new hazard.
3. `docs/loop_runs/ch7/_engine/scar_candidates.sql:823` — the F7 caption-order probe exists, is OPEN, and is correctly owned; its `probe_logic` matches what S2/S4/S6 need.
4. `skeleton.md:106–119` + `:272` + `:461` — the disc region "~160 px square" vs the S6 three-cell scoreboard placed inside it (R1), and the shared-axis height budget (R2).
5. `src/scripts/founder_drive.ts:108` — `viewport { width: 1280, height: 800 }`; why R7 will not surface at Checkpoint B.

*(No frames exist at Checkpoint A — no image paths to hand the founder this cycle.)*

---

## 8 · Self-review

- **Verified against the file, not the log.** All 11 patch locations opened and read; all four F5 §10j rows counted and judged individually; the two founder-visible decisions re-derived from renderer source rather than from the skeleton's own citations. The revision log's prose matched the file in every case I checked — but I checked.
- **Recurrence check ran and is named:** `canvas_graph_label_collides_with_peak_reference_line` (→ **R1, recurring at design time**), `unbound_one_shot_static_at_ms_races_cue_armed_siblings_in_same_state` (→ **R8**, new exemption surface), `slider_step_grid_offset_when_min_is_nonzero` (→ checked against the sealed sliders, **resolved as fleet precedent, not a defect**), `review_negative_form_check_is_vacuous_without_an_existence_assertion` (→ §10j rows 7–10 judged individually; row 8's non-default-f qualifier makes it non-vacuous), `field3d_dim_apparatus_one_way_with_no_restore_on_state_exit` (→ row 7 is now a measurement), `phase_anchored_caption_authored_as_wallclock_at_ms` (→ closed by DERIVED timestamps), `field3d_hardcoded_sprite_label_prespoils_later_state_reveal` (→ row 10 pairs it), `field3d_duplicate_formula_surface_sprite_label_vs_formula_overlay` (→ one surface per state, list checked), `glow_focal_on_live_driven_object_exempted_becomes_total_noop` (→ exemption keeps a real visual op), `eye_frozen_candidate_offset_falls_outside_engine_display_band` (→ freeze θ inside band, `deriveStateMeta` registration in the same change), `scar_candidate_sql_authored_outside_the_live_column_list` (→ applied to my own row).
- **Rule 38 checked in FULL** — 38a ring order/contiguity/both cuts, 38b explore core-only, 38c notation ladder (and the one wobble it exposed → R4), 38d dialect, 38f anchor, 38g tags-as-claims. Not just 38b.
- **Every residual names exactly one downstream owner** and a concrete resolution, so the loop can fold it into that dispatch instead of spending cycle 2. No `FIX(engine)` routing at Checkpoint A — R1/R2/R8 become engine work, but at design time the deliverable is a constraint line in the §3b prompt.
- **PRIME DIRECTIVE applied to the verdict itself.** I did not approve to avoid parking: R1 and R2 are real and I say so in arithmetic. I also did not park to look rigorous — parking a concept over "make the disc 120 px instead of 160 px" would trade the founder's time for nothing, when the constraint can ride the engine prompt and be verified by probes the skeleton already mandates. On the F4 knock-on I applied the directive in the founder's favour by *recording* that the promotion's cost/benefit moved, rather than quietly letting a retired premise carry a fleet-risk decision.
- **No P1 softened to reach `DESIGN_OK`.** No cycle-0 P1 survives; the two P2 residuals are graded P2 on their merits (both are sizing constraints with named one-line fixes and existing Checkpoint-B probes that will catch a miss), and I would defend that to the founder's face.
- Nothing written, nothing dispatched, no SQL applied, no DB row touched.
