# CHECKPOINT A — `rolling_on_incline` (rotmech 0b, **REV 6**) — FINAL VERIFICATION

## VERDICT: `DESIGN_OK`

**founder-proxy, 2026-08-02**

RULING 4 landed exactly at the boundary the founder drew. Every authored millisecond in the document was swept and classified independently: **no third timed class was smuggled in, and no per-arrow reveal survives anywhere** — the REV 5 blocking beat (450/900/1350) is genuinely deleted, not renamed. The formula-line field is specified with its `deriveStateMeta` registration; the scope guard names two classes and declares a third the alarm rule in four places. S6's re-authored timing is correct to the digit. All six carry-forwards landed, including the mapping walk, which is a real audit (its third recovered item was re-derived against REV 5 and the claim holds). Everything on the "do not churn" list is untouched — REV 5 was diffed against REV 6 line by line rather than trusted.

**Neither escalation trigger fires.** There is no physics doubt that could not be resolved from the code — the founder-attention note was resolved beyond doubt by reading the renderer, and the answer comes with an in-scope fix that needs nothing the founder has not already bought. So the honest verdict is `DESIGN_OK`, with two P1-class items named below as **blocking on the 0c-2 surgeon dispatch** (not on physics_author, who can start now).

**The founder-attention note's own framing is a false dilemma, and answering it is the highest-value thing in this report — see P1-A.**

---

## The founder-attention note, answered plainly

> *"With arrows static from entry, S6's held disc shows the rolling-case free-body diagram (f_s = 1.3806 N) while its `a` readout reads 0.00. Is that honest teaching or a physics error on screen?"*

**It is a physics error on screen — and it is also not implementable as written.** But the note's premise is wrong: it presents the choice as *declare it* vs *buy the per-arrow reveal the founder refused*. There is a third option that needs **zero new engine capability and zero founder input**, and it makes S6 a better state than either.

**The code fact the note missed.** The escalation established that `eng.arrows` is a static *visibility* map. REV 6 correctly consumed that (R-11 enumerates the hiding path). But the arrow **magnitudes** are not authored at all — `nlbDriveArrowsForBody` (`:40815+`) reads them live off the body every frame, and says so in its own header:

```js
// Drive one body's enabled arrow kinds from the LIVE engine values. Reads
// only; recomputes no physics (seam B owns every number here).
...
if (show.friction) nlbUpdateArrow(b.id, "friction", ..., nlbSignedDir(axis, b.f), b.f, ...);
```

and seam B's rest branch (`field_3d_renderer.ts:45491–45496`):

```js
var maxStat = b.mu_s * N;
var stuck = !boundPin && (Math.abs(b.v) < NLB_STOP_EPS_V) && (Math.abs(drive) <= maxStat);
if (stuck) { a = 0; b.v = 0; f = -drive; }   // static friction: reported, never integrated
```

So for the held disc at 25°: `drive` = mg sin θ = **4.14166 N**, `maxStat` = 0.50 × 8.88182 = **4.44091 N** ⇒ `stuck === true` ⇒ **`b.f` = 4.14166 N**, `_stuck` sets the fₛ glyph, `F_net = 0` (and the net arrow hides natively — `:40860`, *"a statically stuck body has F_net === 0, so the arrow HIDES: exactly the correct teaching picture"*). The engine will **never** produce 1.3806 N for a body at rest. Either the surgeon overrides seam B for held bodies — an authored force fiction the code's own invariant forbids (*"the arrow and the readout can never disagree"*) — or the tabled 0.414 wu is simply wrong for the hold.

**And as authored it is wrong physics.** Three labelled arrows summing to 2.76 N of net force on a motionless disc whose live instrument reads `a 0.00`. The skeleton's declaration ("the derivation's diagram") lives in a document no teacher ever sees; on canvas it is a contradiction, and Rule 34a forbids captioning it away. A teacher pausing at 1200 ms during the glow-walk — the single most likely pause in the state — gets exactly that frame.

**The in-scope fix (P1-A).** Let the held disc run seam B's *statics* path and let the arrows show what it computes:

| | held (0–2500 ms) | released (2500 ms →) |
|---|---|---|
| f_s | **4.1417 N → 1.243 wu**, fₛ glyph | 1.3806 N → 0.414 wu |
| mg sin θ | 4.1417 N → 1.243 wu | same |
| N | 8.8818 N → 2.665 wu | same |
| ΣF | hidden (F_net = 0) | — |
| `a` readout | 0.00 ✓ honest | 2.76 ✓ |

Nothing timed is added: the change rides the **bought** `activate_at_ms = 2500` instant. Arrows stay visible from t = 0 and stay static in the ruling's sense (never timer-revealed) — RULING 4 is preserved exactly.

**It teaches better.** The held frame is now a correct, balanced statics picture — friction and gravity's component drawn *equal and opposite*, which is what a Class-11 student must see first. At release the friction arrow **shrinks by exactly 3×** (1.243 → 0.414) while `a` jumps 0.00 → 2.76. That 3 is (1+k)/k for a disc — the very factor the derivation produces two lines earlier. The state ends with the formula's own coefficient acted out on screen. That is a stronger derivation state than a static diagram, and it costs one paragraph.

**Two conditions the fix carries:**
1. **The θ slider breaks the hold above 26.57°.** `stuck` requires tan θ ≤ μ_s; at μ_s = 0.50 that is θ ≤ **26.565°**, and S6's slider is **20°–40°**. Above it the held body is not in equilibrium and seam B falls to the kinetic branch (fₖ glyph, a ≠ 0 on a motionless body) — the same contradiction, now genuine. Fix: author S6's disc **μ_s ≥ tan 40° = 0.839** (use 0.90). Verified harmless: rolling needs only μ_s ≥ μ_min = (k/(1+k))tan θ = 0.2797 at 40°, and the rolling-branch f_s = k·m·a is μ_s-independent, so every post-release number in the document is unchanged.
2. **"Not integrated" must be defined as *s and v do not advance*, not *forces are not solved*.** One clause in U10/E9's expectation — otherwise the surgeon skips the body's seam-B pass entirely and `b.f` renders as a stale zero (zero-marker or floor), which is not the tabled picture either.

**Pass-1 note:** this is a partial recurrence of the widened row `skeleton_authors_a_multi_phase_state_on_an_engine_with_no_per_body_activation_time`, whose clause now reads *"Run the SAME reader check on every OVERLAY the state schedules."* REV 6 ran that check on the overlay's **visibility** path and stopped there; the **value** path is two lines further down the same function.

---

## Verification of the ruling boundary

**Authored-millisecond sweep — every mark in the document, classified independently.**

| class | marks |
|---|---|
| physics events (closed-form, never authored) | S1 crossings 1744/1805/1903/2085 · S2 cusp 754, halt 1204 · S3 block-clamp check 1961 · S4 tie 1745 · S5 latches 1265/1512 · S6 halt 4305 · S7 onset 1193, halt 1968 |
| `phases[].glow_focal` windows (existing channel `:45296–45310`) | S6 400–800 / 800–1200 / 1200–1600 / 1600–1900 / 1900–2200 / 2200–2500 / 2500→ · S1/S3/S4/S5 windows |
| **bought class 1** — `bodies[].activate_at_ms` | S3 1500 · S6 2500 |
| **bought class 2** — `formula_overlay[].at_ms` | S6 1600 / 1900 / 2200 |
| pre-existing engine fields | `loop_reset_ms` values + derived 0.60R pins · **S7 `param_ramp` 600–1600** |
| acceptance/probe times, not content | 1550/1700/2300 (U16 expectation), 100 ms sampling, margin figures |
| references to #11's deleted dissolve | 1400 (R-6, handoff) — annotations only, not authored here |

**No per-arrow reveal survives anywhere** — the only occurrences of `show_at_ms` are the four prohibitions. **No third NEW timed class.** ✓

**Formula-line field.** Specified as `{text, at_ms?}` on the ONE surface (`:44801`, Rule 34b intact); pure function of state-local t; legacy string ⇒ byte-identical; stamper appends after the last line; presence by `typeof`; **and registered in `deriveStateMeta.ts:2739–2994`** with the last line's `at_ms` joining max-reveal. That region was verified as the right one, and a registered reveal both pushes a candidate and sets `phaseFound` (`:2770`, the `param_ramp` precedent) — so the registration requirement is real and correctly stated.

**S6 timing, re-derived from scratch:** 0.60 × 4600 = **2760 exactly** ✓ · pin − final line = **560 ms** ✓ · pin − release = **260 ms** ✓ · 2200/4600 = 47.83% ✓ · 2500/4600 = 54.35% ✓ · s at pin = **+2.3067** ✓ · halt = 2500 + 1805 = **4305** ✓ · held finish 295 ms ✓. Glow windows tile contiguously with no overlap (one focal per instant, 32e ✓). U16's probe expectations (1550 zero / 1700 one / 2300 three) are consistent with 1600/1900/2200 ✓.

**"Do not churn" — diffed, not trusted.** REV 5 → REV 6 differs only in the ruling response and the named carry-forwards. Finish semantics ¶ identical minus one clause; U5's four line-numbered checkpoint reasons intact; U6 synchronised restart + ω re-seed intact; force channel `0.30`/`0.25` and every value byte-identical; glow ruling for S4/S5 intact; timing rows S1/S2/S3/S4/S5/S7 **unchanged to the digit**; framing plan values unchanged; home pose unchanged. ✓

**Carry-forwards.** P2-1 ✓ (U14/E19 + U15/E20 restored; the (b)-1…(b)-19 → U walk maps all nineteen and the state-primitives walk covers all eight states; **the μ_min-tick claim verified** — REV 5 names it at its S7 row, its S8 control table and its slip envelope, and REV 5's U1 does not carry it, so the walk genuinely recovered an unrowed item: an audit, not an assertion). P2-2 ✓ on #12's side (see P1-B for #11's). P2-3 tabled ✓. P2-4 ✓ (E7b retired into E10; U3's E7a is a different item and correctly survives). P2-5 ✓ — re-quoted against the row's live DO, "recorded wobble band" gone. P3-1 ✓ `single_lane: true`. P3-2 ✓ whole-body hiding. P3-3 ✓ — the enum at `:1336` verified as exactly `'N'|'f'|'a'|'v'|'T'|'F_net'|'F_applied'|'T1'|'T2'|'P'|'P_avg'`, so R-12's diff is accurate.

---

## One-contract check — the two documents do **not** yet describe one contract

REV 6's header asserts *"#11's REV 3 quotes them verbatim."* Both paragraphs were diffed field by field. **It does not**, in three places, one of them material.

| point | #12 REV 6 (declared canonical) | #11 REV 3 (claimed verbatim) |
|---|---|---|
| **retirement trigger** | **`single_lane: true` state flag**, explicitly *"never inferred from `lane_gap_m === 0`"* | *"in a **`lane_gap_m = 0`** state, a body is live … until the NEXT body's"* — the REV 5 rule. **#11 never authors `single_lane: true` anywhere** |
| pre-activation hiding | enumerates mesh, arrows (`nlbDriveArrowsForBody`), labels, trail, readout rows (R-11) | *"NOT integrated and, by default, hidden"* — no enumeration |
| presence resolution | *"by `typeof`, never truthiness — authored 0 ≡ absent"* inside the ¶ | absent from the ¶ (carried elsewhere) |

**Consequence, and it is not cosmetic.** Under #12's canonical rule, #11's S3 does not retire: the skidding locked wheel — stopped at s = +1.38 since 1020 ms — stays on screen, z-coincident with the rolling wheel that activates at 1500 and rolls straight through it. That destroys #11's 16a contrast state and falsifies its own pin claim at 2400 ms (*"no trail anywhere, no skidder"*).

This is a **recurrence** of `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field`, now filed and OPEN. Automatic P1 under Pass 1. The irony is exact: **R-10 (the fix for this reviewer's own P3-1) re-opened the divergence it was adjacent to**, because #12 edited the canonical paragraph after #11 had imported it, then asserted conformance instead of diffing.

It needs no founder decision — a two-line conformance edit on #11 under the founder's own ruling. **Blocking on the 0c-2 dispatch**, because the surgeon's contract is the union of both documents.

---

## Findings

### P1 — must land before the 0c-2 surgeon dispatch

**P1-A · S6's held-phase free-body diagram contradicts the engine that draws it.** `[alex:physics_author` for the values + a one-clause U10/E9 expectation`]` Evidence and fix above.

**P1-B · The canonical ACTIVATION SEMANTICS paragraph is not the one #11 carries; #11's S3 does not retire under it.** `[alex:architect` — on `pure_rolling` REV 3`]` Import #12's ¶ verbatim (all three deltas) and author `single_lane: true` alongside S3's `lane_gap_m = 0`.

### P2 — carry-forward

**P2-A · #12 never re-ran the glow relation rule over S2 and S7; #11 did.** `state_glow_focal_dims_one_half_of_the_relation…` says *"After ANY restructure … re-run this test over the NEW state list from scratch."* #12 applied it at REV 4 to S4/S5 only. **S2** authors a state-level focal on the rim dot while its delta cue is *"v equals R ω"* — a relation between two readouts — and its pin asserts *"equal latched readouts"*, which would sit dimmed. **S7** authors a state-level focal on the friction label while its pin asserts the held slip picture including the latched `f_k 0.44 N`. This compounds with R-7: the honest-by-scope declaration rests on *"the live `f_k 0.44 N` readout, which carries the true magnitude the arrow cannot"* — and a state-level focal dims exactly that readout at the pin.

**P2-B · S7's post-slip clamp is avoidable with the knob RULING 2 already bought.** f_k = 0.4441 N → 0.1332 wu, clamped at the 0.25 floor, 1.88× overstated. The declaration's *reasoning* is legitimate. But it is the **lower-quality resolution**, and `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` (OPEN) is the row that bites: `force_min_len` is itself authorable under U7. Authoring **`force_min_len ≈ 0.09`** (need ≤ 0.0888 for the row's 1.5× margin) renders S7's f_k true at ~48 px, and changes **nothing else** — every other force arrow is already above 0.25, and no authored force falls in the newly-exposed band. Then the scar row closes outright. **One check before adopting:** confirm the arrowhead geometry does not degenerate below ~0.15 wu (`NLB_COMP_HEAD_LEN`) — if it does, keep 0.25 and the declaration stands.

**P2-C · E9's classification-sweep acceptance would false-alarm on #12's `param_ramp`.** #11 authors the shared acceptance as *"no authored ms in either skeleton that is not a reveal-window, a physics event, or one of the two bought fields."* #12's S7 authors `param_ramp` 600–1600 ms — a **pre-existing** nlb field (`:1576`, registered at `deriveStateMeta.ts:2770`). Under the acceptance as written the surgeon trips the alarm rule and stops a correct build. Add a fourth allowed class: *pre-existing authored-time engine fields (`param_ramp`, `loop_reset_ms`)*.

**P2-D · #11's dispatch list omits E19, which its own S3 consumes.**

### P3

- **P3-A · REV 6's scar audit is stale as of today.** It states three times that both concepts *"return 0 rows"* and that all candidates *"remain UNFILED"*. As of the tooling change today, each returns **16 rows**, including all three of the escalation's candidates and the widened multi-phase row. Do not re-file them. The next sweep should use `--scenario newtons_laws_body` — it resolves to exactly the same eleven ids the document's grep produced, so REV 6's coverage is correct even though its method predates the flag.
- **P3-B · #12 carries no authored-millisecond classification sweep paragraph**, though the shared E9 acceptance demands one *"in either skeleton"*. It was run here (table above) and is clean; one paragraph closes the gap.
- **P3-C · "no union row is unclaimed" holds only across both consumers** — U11 is #11-only and U13 is a cross-cutting registration duty. Accurate in the consumed-by column, imprecise in the closing sentence.

---

## Per-state table

| state | correct | order_ok | labels_present | reads_sound_off | clearly_different | how_i_would_use | problem_or_missing | pri |
|---|---|---|---|---|---|---|---|---|
| S1 | Y | Y | Y (chips, k, m) | Y | Y (four bodies, lineup) | "Same ramp, same start — the order never changes." | none new; E2 occlusion probe still the acceptance | — |
| S2 | Y | Y | Y (v, Rω, contact) | Y | Weak vs #11's own recap (D1) | "One wheel: the bottom point stops dead each time it touches." | state-level focal dims the equal readouts the pin asserts | P2-A |
| S3 | Y | Y | Y (f_k, f_s, contact) | Y | Y (skid → roll, hard cut) | "The skid mark is the difference — the roller leaves none." | retirement semantics now diverge from #11's | P1-B |
| S4 | Y | Y | Y (m, R, k chips, TIE) | Y | Y (declared contrast pair with S1) | "Heaviest and biggest against lightest and smallest — dead tie." | E6 still the blocking precondition; U15 restored ✓ | — |
| S5 | Y | Y | Y (KE pairs latched) | Y | Y (freeze-and-read) | "Same total, different split — the ring spends more on spinning." | none new | — |
| S6 | **N during the hold** | Y | Y (three arrows, three lines) | Y | Y (held → released) | "Build it once: three forces, one line, one answer — then let it go." | **held FBD is unbalanced and un-renderable as tabled; θ range breaks the hold above 26.6°** | **P1-A** |
| S7 | Y | Y | Y (μ_min tick, f label) | Y | Y (regime switch) | "Drop the friction and rolling gives up — watch the contact leave zero." | clamp avoidable via the bought floor; state-level focal dims the readout the declaration relies on | P2-A, P2-B |
| S8 | Y | Y | Y (core-ring only) | Y | Y (sandbox) | "Pit a marble against a huge ring — every lap starts level." | none | — |

---

## `engine_queue` — status at DESIGN_OK

E1–E20 stand as REV 6 tags them (E1 → **pcpl-surgeon**; E14 likewise; E2/E3/E4/E6/E9/E10/E11/E12/E15/E16/E17/E18/E19/E20 blocking under `field3d_surgeon`; E8/E13 ride-along; E7b retired into E10 ✓). **E18 is correctly scoped to RULING 4's bought half**, and its `deriveStateMeta` registration is a named acceptance line — without it the pin arithmetic is unprotected.

**Two additions before dispatch (both from P1, neither new capability):**
- **E9/U10 expectation** — *"a body held by `visible_before_activation: true` does not advance s or v, but IS solved by seam B every frame: its arrows and readouts carry the live statics values (`stuck ⇒ f = -drive`, `F_net = 0`, fₛ glyph). #12 S6: at 1000 ms the friction arrow measures 1.243 wu and the `a` readout reads 0.00; at 2600 ms the friction arrow measures 0.414 wu and `a` reads 2.76."* Machine-checkable.
- **E9 acceptance** — add the fourth allowed class to the classification-sweep grep (P2-C).

---

## Candidate scar rows (report-only)

```sql
-- 1 (NEW)
('skeleton_authors_static_overlay_VALUES_without_reading_the_engine_that_computes_them',
 'A held or pre-release body is authored with the post-release force values, but the renderer draws every arrow from the live physics solve',
 'MAJOR','alex:architect',
 'A derivation state holds a body at its home pose and authors its free-body arrows at the values the body will have AFTER release. The scenario draws arrow magnitudes from the live per-body solve, not from config: a body at rest that passes the static test reports f = -drive (gravity component), so the engine renders a BALANCED diagram while the skeleton asserts an unbalanced one. On screen this is three labelled arrows with a non-zero vector sum on a motionless body whose own live readout reads a = 0.00 - a contradiction a teacher pausing mid-state will read as an error, and one the renderer cannot produce without overriding its own single-source-of-truth for force numbers.',
 'The overlay reader check has TWO halves. After confirming WHETHER an overlay can be shown or hidden at a time, read WHERE ITS NUMBER COMES FROM: if the draw call passes a live body field, the authored value is a prediction, not an instruction. Compute what the engine will report in EVERY phase the state authors - including held, stuck and pre-activation phases - and table the value per phase. Where a held body must satisfy a static test, check the test across the whole authored slider range, not only at the default.',
 'js_eval',
 'For each state authoring a held or pre-activation phase with force arrows: drive the state to mid-hold, read each rendered arrow world length, and assert it matches the magnitude the engine solve reports for that phase; assert the along-surface components sum to zero whenever the acceleration readout reads zero.',
 'OPEN', ARRAY['rolling_on_incline']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech REV6 2026-08-02', 'directive'),

-- 2 (NEW)
('a_static_equilibrium_picture_is_authored_without_checking_it_across_the_states_own_slider_range',
 'A held-on-incline beat is verified at the default angle only, and the body ceases to be in static equilibrium partway up its own slider',
 'MAJOR','alex:physics_author',
 'A state holds a body on an incline and authors a friction coefficient that satisfies the static condition at the default angle. Its angle slider extends past arctan(mu_s), where the same body is no longer in equilibrium: the engine falls to the kinetic branch, the friction glyph flips, and the acceleration readout goes non-zero on a body that is not moving. The defect is invisible at the authored point and appears only when the teacher drags.',
 'Any state that HOLDS a body in static equilibrium must state the equilibrium condition as an inequality over the FULL authored range of every slider that enters it, and author the coefficient from the worst-case end of that range, not from the default. Quote the engine static test and its inputs by line number.',
 'js_eval',
 'For each state holding a body in equilibrium with an angle or coefficient slider: sweep the slider across its authored range, and at each end assert the stuck flag is true, the acceleration readout is zero, and the friction glyph is the static one.',
 'OPEN', ARRAY['rolling_on_incline']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech REV6 2026-08-02', 'directive'),

-- 3 (NEW)
('a_shared_acceptance_grep_enumerates_allowed_classes_from_one_document_and_false_alarms_on_the_other',
 'A cross-document acceptance test lists the timed-field classes present in one skeleton, so a pre-existing engine field in the sibling trips the scope alarm',
 'MODERATE','alex:architect',
 'Two skeletons drive one engine build under a scoped buy, and the acceptance is a sweep asserting every authored millisecond is a physics event, a glow window or one of the bought fields. That enumeration was written from the document that happens to author no other timed field. The sibling authors a PRE-EXISTING timed engine field, which the sweep classifies as an unbought timed action and reports as the scope alarm firing - stopping a correct build.',
 'A classification sweep''s allowed-class list must be derived from BOTH documents and must include a class for pre-existing engine fields that already carry authored times, named individually. Run the sweep against every consuming document before writing it into an acceptance.',
 'manual',
 'Run the classification sweep over every consuming skeleton before the acceptance is signed; any authored millisecond that does not fall in a named allowed class is either a real scope breach or a missing class - decide which in writing.',
 'OPEN', ARRAY['rolling_on_incline','pure_rolling']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech REV6 2026-08-02', 'directive')
```

**UPSERT, do not re-mint:**
- `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` — add: *"the divergence recurs when the canonical document EDITS the paragraph after the sibling imported it; any edit to a paragraph declared canonical is a paired edit, and 'the sibling quotes this verbatim' is a claim to be diffed, never asserted."*
- `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` — no text change; its re-run clause bit again on `rolling_on_incline` S2/S7 (P2-A).
- `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` — add: *"the inverted form also binds when the override path is one the SAME design just bought — a clamp declared unavoidable while the design itself makes the clamp threshold authorable."* (P2-B).

---

## Key artefacts — the five reads that matter

1. `src/lib/renderers/field_3d_renderer.ts:40815–40845` — `nlbDriveArrowsForBody` reads live `b.f`; the line that decides the founder-attention note.
2. `src/lib/renderers/field_3d_renderer.ts:45489–45496` — the static test and `f = -drive`; the value the held disc actually renders (4.1417 N, not 1.3806).
3. `docs/loop_runs/rotmech/rolling_on_incline/skeleton.md` §3 S6 row + arrow-map table — the tabled 0.414 wu asserted for the hold.
4. `docs/loop_runs/rotmech/pure_rolling/skeleton.md:63–65` against `rolling_on_incline/skeleton.md:88–90` — the two "verbatim" paragraphs, side by side, differing on the retirement gate.
5. `src/lib/validators/visual/deriveStateMeta.ts:2765–2775` — the `param_ramp` reveal-candidate precedent: the shape E18's registration must copy, and the field P2-C's acceptance would false-alarm on.

---

```
RUBRIC (advisory, unratified — docs/EXEMPLAR_RUBRIC.md; did not affect the verdict)
  Checkpoint A subset:  D1 1 · D2 2 · D8 2 · D9 2 · D10 2   = 9/10   (unchanged from REV 5)
  weakest: D1 information gain — S2 remains the one state adding no idea this concept
           owns: a recap of #11's core claim, on #11's own wheel radius. Defensible
           under Rule 23 and genuinely consumed by S3's contact-0.00 claim and S5's
           energy route. Unchanged since REV 2.
           D10 explore earns its place — 2, with the residual noted at REV 5: under the
           deepest cut S8 keeps only shape/m/R.
  D2 (2): both ring cuts re-run independently against the REV 6 deltas — the restored
          U14/U15, the single_lane flag and the formula-line field are all ring-neutral.
  D8 (2): exactly two beats, at genuine pivots, both naming their primitives.
  D9 (2): all eight titles literal, result-stating, meaning in the first words.
```

---

**Handover.** `DESIGN_OK` — **physics_author may start on `rolling_on_incline` now.** Before the **0c-2 surgeon dispatch**, three things must land, none needing the founder: (1) **P1-A** — S6's held-phase statics values + μ_s ≥ 0.84 + the E9/U10 expectation clause; (2) **P1-B** — `pure_rolling` imports the current canonical ACTIVATION SEMANTICS paragraph and authors `single_lane: true`; (3) **P2-C** — the fourth allowed class in E9's sweep acceptance. P2-A, P2-B and P2-D are carry-forward for the physics_author / json_author pass. The scar rows for this pair are **already filed** — REV 6's "0 rows / unfiled" statements are stale; file only the three new candidates and the three upserts above.
