# CHECKPOINT A — `rotational_kinematics` (rotmech · Desk D · 0b design pass, REV 1)

**VERDICT: `DESIGN_FIX`** — routed to `alex:architect`. Fix cycle **1 of 2**.
founder-proxy, 2026-08-04 · desk `feat/rotmech-d` · reviewed `skeleton.md` (REV 1, 421 lines) against
`rotmech_d_state.md`, `APPARATUS_CONTRACT.md`, `_engine/findings_d.md`, the sibling
`tau_eq_i_alpha/skeleton.md`, the REV-4 `conservation_of_angular_momentum` exemplar, the live
`engine_bug_queue`, and `field_3d_renderer.ts` / `deriveStateMeta.ts` read directly.

---

## The one-paragraph judgment

**The pedagogy is strong and the Rule-25 answer works.** The nine-state arc is a real ladder
(θ → ω → α → the equation → the sign → v = ωr → t² → slope → sandbox), the primary aha is placed at
S4 inside the default entry slice, both misconception beats sit at genuine pivots, every number
re-derives exactly, and the anchors are universal. The motor-drive-wheel device does what it claims:
it gives α a rendered cause without importing τ or I, and no reader-facing string in the document
leaks dynamics vocabulary. If this were only a lesson design it would be close to `DESIGN_OK`.

**It is not only a lesson design.** The desk contract makes the ENGINE REQUIREMENTS section the
authoritative statement of 0c-3's scope, and that section does not survive checking. Eight defects
are P1, and every one of them is in the half of the document Desk E will freeze scope from:
two Desk-D skeletons hand Desk E **two different definitions of the same bought α row** (the exact
scar both documents cite as discharged); the α metric as defined here **prints −0.50 rad/s² on a
turntable that is standing still**, and that frame is the one the S5 pin photographs; **K5's tick
shape cannot place S7's ticks**; **the θ arc has no authorable time origin**, so S1 cannot render as
narrated; **K3 still buys a body marker that already exists** in code, which this desk's own
findings file tells Desk E in bold not to build; **K10 asks Desk E to confirm a thing already
confirmed** and omits the real `deriveStateMeta` obligation that findings_d §6b filed, leaving THE
EYE's D5 gate silent on the three states whose entire content is "it starts moving"; **K7's
per-state slider range does not exist** as a surface; and **K6's declared descope fallback needs an
engine row nobody bought.** None of this is a taste disagreement — each item is a line of renderer
code read this session.

The fix is one revision, not a redesign. The state arc, the numbers, the rings, the anchors and the
scar audit's format all stand.

---

## Per-state design table (Checkpoint-A form)

| State | One idea | Distinct from predecessor? | Ring | Entry config buildable? | Verdict |
|---|---|---|---|---|---|
| S1 | θ = the angle turned, in radians from a start line | baseline (`reveal-build`) | core | r 0.80 · ω +1.50 ✓ home pose | **FIX** — P1-4: the arc/readout reveal sequence cannot render as narrated |
| S2 | ω = radians per second | new quantity; `equal-time-ticks` declared | core | ✓ | OK — see P3-3 (4th tick closes on the start line) |
| S3 | α = the rate ω changes | new quantity + new actuator | core | ω₀ 0 — needs K1 + office item 1 | **FIX** — P2-2 (the 0.7 s post-contact beat is unbuildable); P1-6 (D5 silent) |
| S4 | ω = ω₀ + αt, used to predict — THE aha | the linear↔angular identity; `converge-on-mark` | core | ✓ chip surface is LIVE | OK — thinnest link in the arc (rubric D1) |
| S5 | Slowing down is negative α | sign flip; declared contrast pair of S3 | core | ✓ brake is LIVE | **FIX** — P1-2: α = −0.50 held on a stopped table, and that is the pinned frame |
| S6 | v = ωr — one ω, many speeds | supporting aha; `paired-tangent-ride` | core | ✓ | **FIX** — P2-8 (inner point sits inside the drum), P2-9 (grouped focal has no surface) |
| S7 | θ = ω₀t + ½αt², ticks 1:3:5 | second equation; declared contrast pair of S2 | extended | ω₀ 0 — needs K1 | **FIX** — P1-3: K5 cannot place these ticks |
| S8 | ω = dθ/dt, α = dω/dt — rate IS slope | new representation; `slope-trace` | advanced | ω₀ 0 — needs K1 + K6 | **FIX** — P1-8: the fallback is unpriced and loses the state's idea |
| S9 | Sandbox | explore | core content ✓ | ω₀ 1.50 · α 0 | **FIX** — P1-7: the α slider's per-state range and its sandbox engagement are unbought |

Ring cut re-walked independently: drop S8 → S1–S7 + S9 coherent, nothing surviving names d/dt or a
graph ✓. Drop S7+S8 → S1–S6 + S9 coherent, nothing names t² or 1:3:5, and S9's two controls both
map to surviving states ✓. Explore surfaces `ω = ω₀ + αt`, stated and performed by S4 (core), under
every preset ✓. 38a monotone with the advanced ring contiguous immediately before explore ✓.
38c: Δ-notation in S3, d/dt confined to S8 ✓. 38d: no board-dialect trap (the document never says
"cell", never dual-labels unnecessarily) ✓. 38g: every non-CBSE cell carries
`needs_teacher_verification` ✓.

---

## FINDINGS

### P1 — blocking. All eight route to `alex:architect`.

**P1-1 · The two Desk-D skeletons define the SAME bought α row two different ways — a live recurrence
of the scar both of them cite as discharged.**
This skeleton's K2: *"α(t) = τ_signed_eff(t)/I(t) while a source is engaged, else 0.00"* (analytic).
The sibling `tau_eq_i_alpha/skeleton.md:433-435` D3: *"α = per-step (ω_k − ω_{k−1})/h on the 16 ms
grid"*, plus *"both BLANK during re-pin blank windows"*. Both documents cite
`two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field`
(live, DIRECTIVE/OPEN) as satisfied; this skeleton goes further and claims ownership
(*"the sibling must QUOTE this verbatim"*), while the sibling claims the mirror
(*"defined ONCE for both Desk-D concepts — rotational_kinematics consumes this row BY REFERENCE,
never redefines it"*). Desk E will read both and build one.
The two definitions are not cosmetic. They disagree in three cases both concepts author:
(a) after a brake drives L to the rest clamp (`field_3d_renderer.ts:49941`, `if (!(mag > 0)) mag = 0`)
the analytic form keeps reading τ/I while the body is motionless; the finite difference reads 0.00;
(b) during an r-drag under a live drive (the sibling's S8) the true α = (τ − ω·dI/dt)/I — the analytic
form is simply wrong there and the sibling says so; (c) across a re-pin the finite difference spikes,
which is why the sibling requires blanking and this document does not.
**Required:** one definition, stated once, consumed by reference in the other document. On the physics
the finite difference is the honest one, and it is what the existing `dLdt` row already does
(`:49975+`, "the per-step finite difference of the engine's OWN integrated L … HONEST FRAMING").
Adopting it also resolves P1-2. Whichever is chosen, the losing document must be edited in the same
cycle — this is a two-file fix.

**P1-2 · S5 photographs α = −0.50 rad/s² on a turntable that has stopped.**
S5: brake engages at 2.0 s, ω falls 1.50 → 0.00 in 3.00 s (τ_brake = 1.53 N·m over I = 3.06 — both
re-derived ✓), rest clamp fires at 5.00 s, *"the table stops and stays stopped"*. The pin table puts
the frozen pin at **6.0 s**. Under K2's analytic metric the source is still engaged at 6.0 s, so the
HUD reads **ω = 0.00, α = −0.50** on a motionless machine. That is false physics in the one frame
THE EYE archives, and it contradicts this state's own `one_line_fix` ("slowing down IS angular
acceleration, with a negative sign") by showing acceleration with no slowing.
**Required:** adopt the finite-difference metric (α → 0.00 the moment the clamp binds) **and** decide
S5's held claim explicitly — either author `release_at_ms` at the stop instant so the pad withdraws
and the state holds "stopped, α = 0.00", or keep the pad engaged and narrate the clamp. Say which;
the pin margin table depends on it.

**P1-3 · K5's `time_ticks` shape cannot place S7's ticks.**
K5 buys `time_ticks: { every_ms, count }` and specifies positions as `rbrThetaAt(k·every_ms)` — a
grid anchored at **state t = 0**. S7 enters at rest, the drive engages at 2.0 s, and the ticks must
land at 1, 2, 3 s **after engagement** to produce 0.30 / 1.20 / 2.70 rad and the 1 : 3 : 5 spacing.
With the bought shape, ticks 1 and 2 land at 1.0 s and 2.0 s where θ = 0 (the body has not moved) and
tick 3 lands at 0.30 rad — the state's entire declared picture, and one half of its contrast pair with
S2, does not occur.
**Required:** `time_ticks: { start_ms?, start_cue?, every_ms, count }` (or bind the grid to the
engagement instant), with the closed-form position restated as `rbrThetaAt(start + k·every_ms)`. It
must be in the K-row, because that row is what Desk E freezes.

**P1-4 · θ has no authorable time origin, so S1's reveal sequence cannot render as narrated.**
θ is integrated from state entry (`rbrThetaAt`, `:49952-49966`, seeded from `eng.theta0` by
`rbrThetaReset`, `:49967-49971`) and the state spins at ω = 1.50 from t = 0. S1 narrates a *sequence*:
start line draws in → marker brightens → *"the θ arc begins growing from line to marker"* → *"the θ
readout starts counting"*. Whatever instant those reveals land on, θ is already 1.5 rad/s × t: an arc
revealed at 1.0 s appears **already at 86°**, at 2.0 s already at 172°, and the readout appears
mid-count rather than counting up from zero. The pin row compounds it — it budgets *"full turn + 2π
sentence ≈ 5.5 s"* while one turn at ω = 1.50 completes at **4.19 s** measured from t = 0, so the
document already assumes a later origin without buying one.
**Required:** choose one and write it down. Either (a) all three reference elements are present and
counting from t = 0 and the narration-sync reveal is glow/label only (cheapest, no engine cost, but
then S1's "begins growing" wording and the 5.5 s budget must change), or (b) K3 buys a θ-zero at a
named reveal instant (`theta_zero_at_ms` / cue) so the arc genuinely starts at zero when it appears.
Note (b) is the same missing capability as P1-3 — one time-origin field could serve both.

**P1-5 · K3 still buys a body-fixed rim marker that already exists, against this desk's own findings.**
`findings_d.md` §3 and §8 say it in bold: *"the body mark ALREADY EXISTS … `rbr_drum_marker` … Desk E:
do not build a second one."* Verified this session: built at `field_3d_renderer.ts:50322-50327` — a
`BoxGeometry(R_drum·W·0.92, 0.03, 0.09)` centred at `(R_drum·W·0.46, 0.11, 0)`, i.e. a radial stripe
running from the axle out to ≈0.506 m on the drum's top face, added to the `spin` group and listed in
`RBR_ALWAYS_ON` (`:50585`). K3(b) nonetheless reads *"a body-fixed rim marker (breaks the
π-symmetry)"* as a required build.
**Required:** K3 shrinks to (a) the fixed base reference ray + (c) the swept arc, both stated relative
to the existing stripe. Two consequences belong in the row rather than left to Desk E: the stripe is
on the **drum** (r ≤ 0.51 m), **not on the rim**, so (i) K5's *"a tick lands on the rim path at the
marker's position"* names a circle the design has not chosen, and (ii) the arc's drawing radius must
be named. Pick one radius for the start line, the stripe reference, the arc and the ticks, and state
it once.

**P1-6 · K10 omits the `deriveStateMeta` obligation findings_d §6b filed; THE EYE goes silent on S3,
S7 and S8.**
K10 reads: *"if 0c-1 left rbr undeclared, THE EYE's D5/D6 motion gates are silently hollow for this
whole chapter … Desk E confirms and declares."* rbr **is** declared —
`src/lib/validators/visual/deriveStateMeta.ts:496-512`. The real defect, already filed by this desk at
findings_d §6b, is the branch body:
`const w0 = Math.abs(asNum(rbrMot.omega0_rad_s, 1.5)); if (w0 >= 0.05) { out[stateId] = true; continue; }`
— motion is declared **from the seed alone**, so a state seeded at rest falls through `undefined` and
D5 **skips**. This concept seeds **three** states at rest (S3, S7, S8), and after K1 lands they are
the states that move the most. K10 must carry §6b verbatim ("declare motion when |ω₀| ≥ 0.05 **or** a
signed applied torque is engaged during the state"), name S3/S7/S8, and state that it ships in the
SAME change as K1 — a K1 that lands without it makes the gate silent on precisely the capability K1
exists to enable.

**P1-7 · K7's per-state slider range does not exist as a surface, and the sandbox engagement is
unbought.**
K7 asks for *"per-state range override for S5's [−0.60, −0.10]"*. Slider ranges resolve through
`rbrSc(token)` → `var o = (config.slider_controls || {})[token] || {};` (`:50005`), and
`slider_controls` is a **top-level, per-concept** block (its type is at `:2181`) — there is no
per-state path. As written, S5 and S9 would share one range. The same row also states *"the applied
drive acts live while the slider is nonzero"* — a sandbox always-engaged semantics with no
`engage_at_ms`, which the current seed does not express (`:50532-50533` sets `brakeOnMs` only from
`engage_at_ms`).
**Required:** buy both as named config shapes (a per-state slider-range override, and the sandbox
engagement rule), or drop S5's restricted range and author one concept-wide α range. The live
directive `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` is the
mirror of this error, and this skeleton cites it as B-sat.

**P1-8 · K6's declared descope fallback is not free and does not preserve S8's idea.**
The fallback is *"an equation-build beside the replayed spin-up with a per-grid Δθ/Δt readout printing
live and visibly equal to the ω readout."* That readout is a **third derived row** — neither `theta`
nor `alpha` — and `rbrRebuildReadout` skips unknown tokens in silence (`:50162-50163`), the exact
silent-seal trap this desk refused to author into. K2 buys two rows; the fallback needs three.
Pedagogically the fallback also deletes the state's declared idea: with no graph there is no slope,
the delta cue *"Slope of θ is ω"* cannot survive, and what remains (Δθ/Δt equals ω) restates S2's own
definition of ω — the advanced ring would survive in name only.
**Required:** either (a) K2 buys the Δθ/Δt row conditionally and S8's fallback restates its title,
delta cue and one idea (instantaneous vs average rate is the only honest surviving claim), or (b) the
honest option — declare that descoping K6 **drops S8**: the concept runs 8 states, extended becomes
the last ring before explore, and the (i-1) ring-cut walk is re-run for that case. Do not leave a
contingency Desk E can trigger without knowing it costs another row.

### P2 — should fix in the same cycle. All route to `alex:architect`.

**P2-1 · K8's "reuse the pad travel machinery" is half-true.** `padEngageMs` / `padReleaseMs` are set
**only** in the brake branch (`:50521-50526`); the `applied_torque` branch (`:50528-50533`) sets
`brakeOnMs`/`brakeOffMs` and leaves `padEngageMs` null, and the actuator render reads
`var eMs = (eng.padEngageMs == null) ? Infinity : eng.padEngageMs;` (`:50732`). So `pad_travel_ms` is
NOT live for the applied source and the drive wheel would never travel. K8's `[LIVE timing, NEEDS
mesh]` should read `[LIVE torque timing; the ACTUATOR timing is unwired for this source — Desk E
wires padEngageMs/padReleaseMs in the applied branch]`.

**P2-2 · The S3 "readable ~0.7 s beat" after contact is unbuildable and physically wrong.** The
actuator translates in over the window `[engage − pad_travel, engage]` (`:50735-50736`) and torque
begins exactly at contact (`brakeOnMs = engage`). There is no mechanism for a 0.7 s delay between
contact and effect, and inventing one would be dishonest — a drive wheel touching a drum accelerates
it immediately. The Rule-32a cause-before-effect beat **is** the travel window; say that, and set
`pad_travel_ms` to the beat you want. S4/S7/S8 inherit the same wording.

**P2-3 · K1 is a semantic redefinition of an existing field, which the preamble's back-compat clause
does not cover.** The preamble says *"every field added is OPTIONAL with absence reproducing today's
behavior byte-identically."* `applied_torque_Nm` is not new: today `+1.84` decays the spin
(`eng.tau = Math.abs(...)`, `:50532`); after K1 it accelerates. Absence-based back-compat is the wrong
test. The right one is that **no current concept authors the field** — verified this session,
`grep -rl applied_torque_Nm src/data/concepts/` returns nothing. State the redefinition plainly and
record the zero-consumer check as the regression argument.

**P2-4 · findings_d §2's loud-warn request is not consumed by K2.** That file calls it *"worth more
than the rows themselves"* — a `console.warn` on an unknown readout token converts the chapter-wide
silent-seal trap into a visible failure for every future rbr concept. K2 must carry it.

**P2-5 · findings_d §7's enum mismatch is not consumed by K1.** `external_torque.source` declares
`'brake' | 'applied_force_at_point' | 'torsion_spring'` (`:1000`) while the implementation resolves
`'applied_torque' | 'brake'` (`:50518`) — the string this concept depends on is not a declared member
of its own enum. K1 is the row that touches that code; close it there.

**P2-6 · Office item 3 asserts a HUD order the engine does not control.** `rbrRebuildReadout` iterates
`rb.readouts` (`:50158-50162`), so HUD order is the **authored array order**, not `RBR_RO_META`'s. The
apparatus contract §3 pins a chapter-wide order per quantity, so the real office item is *where*
`theta` and `alpha` are inserted into `RBR_RO_META` — a decision binding all six turntable concepts
and not this desk's to take. Re-word item 3 to ask for the insertion position. Units/dp are NOT a
fork: the sibling independently specifies `alpha: { label: "α", unit: " rad/s²", dp: 2 }`, identical
to K2.

**P2-7 · Office item 2 names one of two code sites, and the sibling contradicts the request.** The
`omega0` floor lives at `RBR_SLIDER_SPEC` (`:49999`, `min: 0.5`) **and** at `rbrApplyParam`:
`else if (token === "omega0") { if (!(value > 0)) return; }` (`:50075-50077`) — changing only the
slider min leaves a drag to 0 silently rejected. Separately, this skeleton asserts *"tau_eq_i_alpha
will want the same"*; the sibling's D2 says the opposite in writing: *"the ω₀ SLIDER floor 0.5
(`:49999`) stays — no control change."* Resolve inside the desk before the item reaches the office.

**P2-8 · K4's inner marked point sits inside the drum and on top of the existing marker stripe.**
r = 0.40 m is inside `brake_drum_radius_m` 0.55 and inside the stripe's radial extent (0 → 0.506 m,
`:50322-50326`), so the r = 0.40 radius line, its tangent arrow and its `v = 0.60 m/s` label all draw
over the drum face and over an always-on emissive yellow bar. The document's occlusion argument (scar
row 154) covers arrow-vs-arrow separation only. Either move the inner point outside 0.55 m (0.55/1.10
also gives exactly 2:1 at ω = 1.50 — but check r_max 0.90 and the rod half-length 1.00 first), or
declare the layering and colour separation explicitly.

**P2-9 · S6's grouped-pair focal has no surface.** `glow_focal?: string` is a single token (`:1053`)
and the exact-token gate resolves one id. K4 must register a **group token** (e.g. `rbr_v_arrows`)
that lights both arrows together, or the grouped focal that discharges
`state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` is an authoring wish, not
a buildable instruction.

**P2-10 · K6's graph zone is unplaced against an engine-fixed overlay.** The Cambria-Math formula
surface is `position:fixed; top:40%; left:22px; … max-width:330px` (`:50448`) — a fixed left-middle
band. DoD (h) claims distinct zones; name the graph's reserved zone (right half, `top:52px+`) so the
claim is checkable rather than intentional.

**P2-11 · The two Desk-D skeletons buy overlapping engine work under two unrelated numbering schemes
with no union.** K1–K10 here, D1–D8 in the sibling; this concept buys an `alpha` control token, the
sibling buys `tau_app`; this one needs `theta` + `alpha` rows, the sibling needs `alpha` + `tau`. No
document contains the union Desk E must build, and both claim canonical ownership of the
signed-torque paragraph. `findings_d.md` PASS 2 is the right place for the merged list — say so in
the handoff, and have one document yield ownership.

### P3 — notes.

1. **S3 → S4 is the arc's thinnest link (rubric D1).** S3 already shows a constant α driving ω from
   0.00 to 2.40 over 4.0 s — arithmetically the same demonstration S4 repeats with ω₀ = 1.50. S4's
   genuinely new content is the *identification* with v = u + at plus the prediction-first ritual,
   which is real and is the primary aha; but if a state ever has to be cut, this pair is where the
   redundancy lives. Consider keeping S3's beat qualitative (α is the readout that stays constant)
   and letting S4 own the quantitative run.
2. **§2's `teaching_method` column and §4 disagree.** §2 marks only S6 `misconception_confrontation`
   while §4 assigns a `misconception_watch` to S5 as well. Different fields, but the document should
   not read as though S5's watch were an afterthought.
3. **S2's fourth tick lands 0.28 rad (16°) from the start line.** Four ticks at 1.50 rad cover 6.00 of
   6.28 rad, so the last tick nearly closes the circle and can read as coinciding with the start
   line — slightly weakening "equally spaced". Three ticks, or a tick label, removes the ambiguity.
4. **The LIVE visibility flags this concept must author OFF are never declared.** `show_l_arrow`,
   `show_pull_arrows`, `show_r_line`, `show_drum_line`, `show_grip_hand`, `ke_bar` are all live
   surfaces; `show_l_arrow` in particular would print an **L** the §10(b) ledger forbids. The
   "Explicitly NOT required" list should name them.
5. **findings_d §8 item 5 will over-scope Desk E.** It lists `reference_marks[].surface + 'theta'/'alpha'`
   as BLOCKING; this skeleton correctly declares those members out of scope (the only chip rides the
   existing `'omega'` surface, `:1023` ✓). PASS 2 must downgrade item 5 explicitly, or Desk E builds
   enum members nobody consumes.
6. **S9 leaves the drive wheel's visibility at α = 0 unstated.** Withdrawn at zero, engaged when the
   slider moves, is the obvious reading — but K8 says visibility follows per-state flags, not the
   slider.
7. **Rule 41 / Rule 35: clean.** Every title, delta cue, anchor sentence and narration fragment in the
   document is literal, plain, and free of idiom or personification; the ceiling fan and the bicycle
   wheel are both widest-overlap devices with no cultural marking, and no region constant is
   asserted. Formula surfaces are real Unicode throughout (θ ω α ω₀ ½ π ² Δ), algebra-only outside S8.
8. **Gate 0: no TBDs.** Scanned; zero unresolved cells.

---

## What was checked and passed (so the next cycle does not re-litigate it)

- **Arithmetic, every figure re-derived independently:** I(0.80) = 0.50 + 2(2.0)(0.64) = **3.06** ✓ ·
  T = 2π/1.5 = **4.189** ✓ · S3 ω = 0 + 0.60×4 = **2.40**, τ = 3.06×0.60 = **1.836 → 1.84** ✓ ·
  S4 1.50 + 0.60×3 = **3.30** ✓ · S5 τ = 3.06×0.50 = **1.53**, inside [0, 2.0] ✓, stop at
  1.50/0.50 = **3.00 s** ✓ · S6 v = 1.5×0.4 = **0.60**, 1.5×0.8 = **1.20**, ratio **2.00** ✓ ·
  S7 θ = ½(0.6)t² → **0.30 / 1.20 / 2.70**, increments **0.30 / 0.90 / 1.50 = 1 : 3 : 5** ✓ ·
  S2 four ticks 1.50 rad apart ✓. No numeral triple repeats across S3/S4/S5.
- **Pin margins:** all eight rows re-computed against `pin = 0.60R`; every margin ≥ 500 ms and
  ≥ 167 ms ✓ — subject to P1-2 (S5's pin photographs a false α) and P1-4 (S1's origin).
- **Engine citations:** every `[LIVE]` file:line spot-checked. `RBR_RO_META` `:50147` ✓ ·
  `if (!meta) continue` `:50162` and `:50236` ✓ · `rbrNum` typeof `:49828` ✓ · `Math.abs` at the
  applied source `:50532` ✓ · rest clamp `:49941` ✓ · `controls_visible` `:1051` ✓ · `readouts`
  doc-enum `:1043` ✓ · `reference_marks.surface` includes `'omega'` `:1023` ✓ · engagement surface
  `:1002-1006` ✓ · reserved hidden slider slots `:49989-49991` ✓ · `RBR_ALWAYS_ON` `:50585` ✓ ·
  Cambria-Math surface `:50448` (the skeleton cites `:50570-50574`, the rebuild call site — harmless,
  but the styling line is `:50448`).
- **Rule 25, tested hard and passed.** No reader-facing string, formula surface, HUD row, label,
  caption or slider glyph in the document carries τ, I, L or KE. The drive wheel is a rendered cause
  narrated kinematically; the internal τ values are implementation numbers exactly as `pend_k` is.
  The one residual hazard is the planting risk the document already names ("α needs a motor"), and
  S5's brake answers it two states later. **This is the right answer to the ordering problem.**
- **Apparatus contract:** home pose r 0.80 / ω +1.50 / m 2.0 / I_frame 0.50 / rod_half 1.00 /
  drum 0.55 / rod height 0.25 / r ∈ [0.15, 0.90] all honoured; r never moves; S1 opens exactly at the
  home pose. The three declared office items are correctly framed as requests. Two further de-facto
  deviations were found and are filed above as P2-6 (HUD insertion order) and P2-7 (the second
  `omega0` guard site + the sibling's contradiction).
- **Scar-audit format:** the 157-row verbatim table is the exemplar's house format, correctly
  applied. I did not re-run the full superset diff (the format is mechanically reproducible by
  design); I did spot-check that the rows this review touches carry verdicts — rows 3, 6, 27, 114,
  138, 155 and 156 all do.

---

## engine_queue

**Empty by construction.** Every finding above is a defect in a DESIGN DOCUMENT, not in shipped engine
code, and this concept has no built artifact. The engine work the document describes is Desk E's 0c-3
build, dispatched from `findings_d.md`, not from this report. Nothing here is `FIX(engine)` and no
`peter_parker:*` owner is routed. What the dispatching session owes Desk E is the corrected ENGINE
REQUIREMENTS digest **after** this fix cycle closes — copying the current REV 1 into `findings_d.md`
would freeze 0c-3's scope around P1-3, P1-5, P1-6, P1-7 and P1-8.

---

## Candidate scar rows (report-only — the dispatching session files these; founder-proxy applies no SQL)

```sql
-- 1. RECURRENCE of an existing OPEN directive. Do NOT mint a new class: upsert the live row,
--    append this concept, and give it the mechanical probe it lacked.
INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field',
 'Two paired skeletons each cited this row as discharged and still defined the same bought readout two different ways',
 'CRITICAL','alex:architect',
 'Both Desk-D skeletons named the scar and asserted compliance in prose. rotational_kinematics defined the bought alpha row analytically (tau_signed/I while engaged, else 0); tau_eq_i_alpha defined it as a per-step finite difference (omega_k - omega_k-1)/h with blanking across re-pins. The definitions disagree wherever the engine clamps the motion or I changes under a drive. Each document also claimed canonical ownership of the shared semantics paragraph, so neither yielded.',
 'Citing the scar is not discharging it. Exactly ONE document owns the semantics of a shared bought field; the other consumes it BY REFERENCE with a verbatim quote and no restatement. Ownership is named in both documents, in the same words, before either goes to Checkpoint A. Every bought row that produces a NUMBER carries its metric as a single sentence that can be string-diffed between the paired documents.',
 'manual',
 'For each engine row bought by more than one skeleton in the same build: extract the metric sentence from each document and diff them literally. Assert (a) one document declares ownership and the other declares consumption-by-reference, (b) the quoted paragraph is byte-identical, (c) no second definition of the same field exists anywhere in the consuming document. Reference failure 2026-08-04: rotmech 0c-3, the alpha row, K2 vs D3.',
 'OPEN', ARRAY['rotational_kinematics','tau_eq_i_alpha']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_rotational_kinematics_cycle1', 'directive')
ON CONFLICT (bug_class) DO UPDATE SET
  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,
  probe_logic = EXCLUDED.probe_logic, concepts_affected = EXCLUDED.concepts_affected;

-- 2. NEW CLASS — P1-3 + P1-4.
INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('bought_timed_primitive_omits_the_time_origin_the_beat_measures_from',
 'A skeleton bought a timed primitive whose config shape anchors at state t=0 while the beat it serves starts at a later instant',
 'CRITICAL','alex:architect',
 'time_ticks was specified as {every_ms, count} with positions derived at k*every_ms from state entry, but the state it serves enters at rest and starts moving when a torque engages 2 s later, so the first two ticks land where nothing has moved. The same document narrates a theta arc that "begins growing" at a narration-synced reveal while theta has been integrating from state entry, so the arc appears already at 86-172 degrees.',
 'Any bought primitive placed IN TIME declares its time ORIGIN as an explicit field (start_ms / start_cue / a named anchor), never an implicit state-entry grid. At design time, tabulate every timed item as (origin, offset, value at the offset) and evaluate the value at the origin: if the value at the origin is not the value the beat claims, the origin is missing from the buy.',
 'js_eval',
 'For each timed primitive in a skeleton ENGINE REQUIREMENTS row, evaluate the engine metric it reads at the primitive first firing instant under the state entry config. Assert the computed value equals the value the state table claims for that instant. Reference failure 2026-08-04: S7 ticks at 1000/2000 ms with theta=0 (drive engages at 2000 ms), claimed 0.30/1.20 rad.',
 'OPEN', ARRAY['rotational_kinematics']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_rotational_kinematics_cycle1', 'directive');

-- 3. NEW CLASS — P1-2.
INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('derived_rate_readout_keeps_its_driving_value_after_the_engine_clamps_the_motion_to_zero',
 'A derived rate readout was defined from its cause rather than from the motion, so it prints a nonzero rate on a body the clamp has stopped',
 'MAJOR','alex:architect',
 'alpha was defined as tau_signed/I while a source is engaged. The brake source clamps L at zero and holds the body at rest while remaining engaged, so the readout keeps printing -0.50 rad/s2 on a motionless turntable — and the state frozen pin lands 1 s after the clamp, archiving that frame. The state own misconception fix asserts the opposite physics.',
 'Define a derived RATE readout from the quantity that moves, not from the agent that drives it, and evaluate the definition at every clamp, limit and end-of-beat instant the state authors. Where a state holds at a clamp, the pin budget must name what the held frame reads on EVERY visible row, not only the row the state is about.',
 'js_eval',
 'At each state frozen pin instant, read every visible readout and assert internal consistency: a nonzero rate row requires the corresponding quantity to be changing between two adjacent dense frames. Reference failure 2026-08-04: rotational_kinematics S5, pin 6.0 s, rest clamp 5.0 s, omega 0.00 with alpha -0.50.',
 'OPEN', ARRAY['rotational_kinematics']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_rotational_kinematics_cycle1', 'directive');
```

```sql
-- 4. NEW CLASS — P1-7 (the mirror of the live row
--    architect_declares_an_engine_limit_without_checking_the_per_concept_override_path).
INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('skeleton_assumes_a_per_state_override_on_a_surface_the_engine_resolves_per_concept',
 'A control range was authored per state on an engine whose slider ranges resolve once per concept',
 'MAJOR','alex:architect',
 'The design authored a restricted alpha range for one guided state and a full range for the explore state. Slider scale resolves through config.slider_controls, a top-level per-concept block, so both states would share one range. The document cited the per-concept-override-path directive as satisfied while assuming the opposite direction of the same gap.',
 'Before authoring a per-state value for any control property (range, step, default, label), read the resolver and name the object it reads from — per-state block, per-concept block, or engine constant — with file:line. The per-concept-override directive cuts both ways: check that an assumed override EXISTS as well as that a claimed limit is real.',
 'js_eval',
 'For every per-state control property in a skeleton control table, grep the renderer for the resolver and assert it reads the per-state config object. Reference failure 2026-08-04: rbrSc reads (config.slider_controls || {})[token] at field_3d_renderer.ts:50005, not the state block.',
 'OPEN', ARRAY['rotational_kinematics']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_rotational_kinematics_cycle1', 'directive');

-- 5. NEW CLASS — P1-8.
INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('descope_fallback_declared_without_pricing_the_engine_row_it_still_needs',
 'The declared fallback for a descoped engine row required a different unbought row and silently deleted the state idea',
 'MAJOR','alex:architect',
 'The graph panel was named the one descope candidate with a no-graph fallback for its state. The fallback needed a live per-grid derivative readout — a third derived row neither bought nor listed — and without the graph the state declared idea (rate IS slope) collapses into a restatement of an earlier state definition, leaving the advanced ring nominal.',
 'A descope fallback is a design, not a sentence: it states its own engine cost (or declares zero and proves it against the bought row list), its own title, delta cue and one idea, and it re-runs the ring-cut walk for the reduced state set. If the honest fallback is to DROP the state, say that.',
 'manual',
 'For each engine row flagged as a descope candidate, walk its fallback: (a) diff the fallback needs against the bought row list and assert the intersection covers it, (b) assert the fallback states a title/delta/idea distinct from every surviving state, (c) assert the ring-cut walk was re-run for the reduced set. Reference failure 2026-08-04: rotational_kinematics K6/S8.',
 'OPEN', ARRAY['rotational_kinematics']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_rotational_kinematics_cycle1', 'directive');

-- 6. NEW CLASS — P1-5 and P1-6 (one class: the desk own findings file was not consumed by its own skeleton).
INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('skeleton_engine_rows_diverge_from_the_desks_own_verified_findings_file',
 'A skeleton re-specified a primitive its own desk findings file proved already exists, and omitted a correction that same file had already filed',
 'CRITICAL','alex:architect',
 'findings_d.md stated in bold that the rotating body angular marker already exists (rbr_drum_marker, always-on) and that Desk E must not build a second one; the skeleton K3 still required it. The same file corrected the claim that rbr was undeclared in deriveMotionExpectations and filed the REAL gap (motion declared from the seed alone, so at-rest states skip the D5 gate); the skeleton K10 still carried the superseded claim and omitted the real one. Both documents were written in the same session; the skeleton was not re-read against the findings file after the findings file was corrected.',
 'When a desk owns both a findings file and a skeleton citing the same engine surface, the skeleton ENGINE REQUIREMENTS section is diffed against the findings file BOTH DIRECTIONS before Checkpoint A: every skeleton row maps to a findings section or declares why it is new, and every findings section maps to a skeleton row or is explicitly declared out of scope. A correction landing in one file is not landed until the other reflects it.',
 'manual',
 'Diff the skeleton engine row list against the findings file numbered sections in both directions; list unmatched items on each side and assert zero unexplained items. Reference failure 2026-08-04: K3 vs findings_d section 3 (marker already built at field_3d_renderer.ts:50322), K10 vs findings_d section 6b (deriveStateMeta.ts:496-512).',
 'OPEN', ARRAY['rotational_kinematics']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_rotational_kinematics_cycle1', 'directive');
```

Also owed by the dispatching session (append, never fork the key): add `rotational_kinematics` to the
OPEN rows `teach_visual_must_match_narration`,
`derived_readout_asserted_by_value_without_defining_its_metric`, and
`architect_declares_an_engine_limit_without_checking_the_per_concept_override_path`.

---

## Key paths the founder should read first

1. `C:\Tutor\physics-mind-rotmech-d\docs\loop_runs\rotmech\rotational_kinematics\skeleton.md` —
   ENGINE REQUIREMENTS K1–K10. This is the half that fails; the lesson design above it is sound.
2. `C:\Tutor\physics-mind-rotmech-d\src\lib\renderers\field_3d_renderer.ts:50322-50327` + `:50585` —
   the marker K3 still buys. Twenty seconds of reading settles P1-5.
3. `C:\Tutor\physics-mind-rotmech-d\src\lib\validators\visual\deriveStateMeta.ts:496-512` — the
   seed-only motion declaration. Three of this concept's nine states fall through it.
4. `C:\Tutor\physics-mind-rotmech-d\docs\loop_runs\rotmech\tau_eq_i_alpha\skeleton.md:427-435` beside
   this skeleton's K2 — the two α metrics side by side. P1-1 as a direct visual diff.
5. `C:\Tutor\physics-mind-rotmech-d\docs\loop_runs\rotmech\_engine\findings_d.md` §3 and §6b — the
   corrections this desk already made and its own skeleton did not consume.

---

```
RUBRIC (advisory, unratified — docs/EXEMPLAR_RUBRIC.md; did not affect the verdict)
Checkpoint-A subset (D1, D2, D8, D9, D10 — the five answerable from a skeleton)
  D1 2 · D2 2 · D8 2 · D9 2 · D10 1   = 9/10
  weakest: D10 explore earns its place — two dials, one of which (ω₀) is a restart
           seed that cannot reach 0 on the live slider, and the other (α) has no
           buildable per-state range or sandbox engagement semantics
           (evidence: RBR_SLIDER_SPEC omega0 min 0.5 at :49999 plus the !(value > 0)
           guard at :50075; K7's range override resolves per concept at :50005)
           D1 information gain — S4's run is arithmetically S3's run with ω₀ = 1.50;
           its genuine new content is the identification with v = u + at
           (evidence: §2 ground truth, S3 0 → 2.40 at α 0.60 vs S4 1.50 → 3.30 at α 0.60)
```

The score did not move the verdict in either direction. All eight P1s live in the engine-spec surface,
which no rubric dimension touches — the same blind spot the sibling concept's cycle-2 report recorded.
Per the founder's 2026-08-01 report-only ruling, the number is reported and nothing was decided by it.

---

## Gate statement

**`DESIGN_FIX`, cycle 1 of 2, routed to `alex:architect`.** No escalation trigger fired: the physics
is correct wherever it is buildable, and the one wrong-physics finding (P1-2) is a metric definition,
not a doubt about the authored physics itself. `physics_author` is **not** authorised yet, and the
ENGINE REQUIREMENTS digest must **not** be copied into `findings_d.md` until this cycle closes —
copying REV 1 would freeze 0c-3's scope around five of the eight P1s. Nothing above is a shipping
judgment (Rule 17 untouched). founder-proxy edited no skeleton, applied no SQL, touched no `src/`
file, and dispatched no one; every routing and every SQL tuple here is a report field for the
dispatching session.
