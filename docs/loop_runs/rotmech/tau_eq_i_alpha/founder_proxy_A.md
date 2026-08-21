# founder_proxy — CHECKPOINT A (design gate) — `tau_eq_i_alpha`

**Concept:** `tau_eq_i_alpha` (Class-11 Ch.7 rotmech, #7) · **Skeleton:** REV 1, 745 lines
**Desk:** D (`feat/rotmech-d`) · **Cycle:** 1 of max 2 · **Date:** 2026-08-04
**Scope:** design only. Not shipping approval (Rule 17); shipping stays founder-only.

---

## VERDICT: `DESIGN_FIX` → `alex:architect` (cycle 1 of 2)

This is a strong skeleton — arithmetic that closes exactly, a 157-row scar audit that is a real
mechanical superset diff, engine claims cited to file:line and true where I spot-checked them, and a
headline correction (the decay-only integrator) that is the most valuable thing this desk has
produced. Three of its findings I re-verified in the renderer myself and they are correct:
`RBR_RO_META` closes at six rows and skips unknown tokens in silence (`:50152`, `:50162`); `rbrLAt`
subtracts unconditionally with `Math.abs` at both source sites (`:49937`, `:50520`, `:50532`);
`config.slider_controls` really does give a per-concept default/step override (`rbrSc`,
`:50005-50014`).

It does not pass, for one dominating reason and seven supporting ones. **The dominating reason is
that this skeleton and its sibling `rotational_kinematics` — same desk, same engine build, same
turntable, both at Checkpoint A today — have forked on three of the four things they share.** They
render the drive with two different objects, they specify the same bought `alpha` readout with two
different metrics, and each declares itself the canonical definition site for the signed-torque
semantics while instructing the other to consume by reference. Both cite the scar
`two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` and
mark it satisfied. It is satisfied by neither. Desk E freezes 0c-3's scope from these two documents;
if it freezes today it gets two contradictory specs for one build, and per the desk contract no
later gate catches it until chapter-wide Checkpoint C after both concepts are sealed. **This is the
one class of defect this checkpoint exists to catch, and it is catchable only here.**

Second: the design teaches one thing that is false. S6 generalises a friction brake into "an
opposing torque", concludes "never reverses", and §4 claims that beat "structurally kills 'negative
alpha spins it backwards'". That belief is correct physics for a constant opposing torque — which D1
is being bought to make possible, and which the sibling's S9 explicitly declares as real. CoAM's S5,
which S6 mirrors, was careful to write "Brake contract: frictional — opposes omega"; the qualifier
was dropped in the mirroring.

Third: on the prerequisite question the desk raised, my answer is **do not re-sequence — but the
four patches as written are not sufficient.** Detail in P1-5.

Nothing here triggers ESCALATE. The physics doubt in P1-4 is resolvable (a Coulomb brake is not a
constant torque; the design conflates them), and every other finding is inside architect authority.

---

## The five things the dispatch asked me to press on — direct answers

**1. Rule 25 / the prerequisites ruling.** Verified against `4b289d4`: the eight pre-registered Ch.7
ids are #3, #4, #7, #8, #9, #10, #11, #12. **`torque` (#5) and `moment_of_inertia` (#6) are not in
the pre-registration at all** — this is not "not in this wave", it is "not in the build". So the
patches are not a stopgap; they are the permanent state of the concept.

My answer: **the concept is teachable without #5/#6, and I do not recommend re-sequencing.** The
qualitative spine (S1, S2, S3, S6) is fully self-standing under the patches — a torque is a turning
push, the arrow is the push, ω climbs / holds / falls, and none of that needs r F sin θ or Σmr².
That spine carries the primary aha and it survives intact.

But the quantitative spine does not, as written. S4's whole claim is "the equation predicts", and it
predicts using **two oracle numbers**: τ = 0.60 N·m from nowhere and I = 1.50 kg·m² from nowhere. A
relation between two black boxes is not a prediction a student can check, and "the readout computes
it from the masses' positions" (the authored I patch) tells them the box exists without opening it.
The gap is one clause wide in each case and closing it needs no new concept:

- **I at S4** — "half a kilogram for the frame, plus each 2 kg mass at 0.50 m: 0.50 + 0.50 + 0.50 =
  1.50". Arithmetic on two visible masses, algebra-only, no Σ (so Rule 38c and S7's derivation are
  both untouched — S7 owns *why* that sum is I, not the sum itself).
- **τ at S2** — the D4 arrow's own magnitude: force at the rim × the drum radius. The skeleton
  already states this is the honest reading of D4 ("torque = force at the rim × R_drum"); it is in
  no patch, so the number never reaches the student.

Both are Rule-25-clean (on-screen objects only) and neither condescends. That is P1-5.

**2. S2 → S3, and whether the null result reads.** The null result holds, and holds well: S3 has a
real cause motion (the arrow retracts), a real effect (α snaps 0.50 → 0.00, τ → 0.00) and a live
instrument that was visibly ticking upward and stops. Rule 31 is satisfied — the turntable spins
throughout and the beat is physical, not a label reveal. This is the better half of the pair.

The problem is the seam, not the state. S2 ends at ω ≈ 5.56 (1.50 + 0.50 × 8.11 s); S3 enters at
ω = 3.00, same r, same rig, nothing else visibly different. The teacher clicks and the turntable
silently slows by 2.5 rad/s — in the one concept whose entire claim is that nothing but a torque
changes the spin rate. Every other re-pose here is chaperoned by a visible rig change (S4/S5 move
the masses) or an explicit re-pin cue; S2→S3 is the only seam where the reset is invisible and
therefore reads as physics. That is P1-7, and it is cheap: author S3's entry ω as S2's end value and
the two states become one continuous story.

**3. S2's unbounded ω.** Accept it, and the skeleton is right to. At the authored 13 s the end state
is ω ≈ 5.56 rad/s = 0.88 rev/s; the drum marker breaks the rod's π-symmetry so the apparent rate is
0.88 Hz — roughly 68 frames per revolution on a 60 Hz canvas. Fully legible, apparatus unmistakably
the same machine, Rule 32d intact. The S8 corner (F-b, ω ≈ 41 rad/s under a held max drive for 60 s)
is a genuine strobe risk but it is a sandbox corner a teacher creates deliberately and can undo with
the brake — accepting it matches the CoAM posture and I concur. The only gap is bookkeeping: the DoD
claims zero TBDs and S2's end ω is never stated anywhere, on the one state whose claim is that the
value has no end (P3-2).

**4. S5's 4.64.** Coherent, not cargo-culted — and I want to separate two numbers the skeleton
treats as one.

The **4.64 inertia ratio is forced, not borrowed**: r 0.80 → 0.20 on the contract's own rod gives
I 3.06 → 0.66 whatever concept you are authoring. CoAM reaches the same ratio because it uses the
same two poses. Genuine chapter coherence; keep it.

The **6.95 is a coincidence and the skeleton celebrates it as a feature** ("S5's 6.95 equals CoAM's
pulled-in ω — deliberate chapter coherence"). It is not the same quantity: in CoAM 6.95 rad/s is
what conservation gives when you pull the masses in with no torque; here it is what a 1.53 N·m
torque gives from rest in 3.0 s at r = 0.20. Same machine, same headline number, two unrelated
mechanisms — a teacher or student who notices learns something false. It is also the one number here
that is free: run B's 3.0 s duration was chosen, and 2.5 s (→ 5.80) removes the collision at zero
cost. The skeleton runs a rigorous numeric-collision scan *within* each state; the same scan across
the shared apparatus is what it is missing. P2-3.

**5. S7's ledger and Rule 38c.** The arithmetic closes exactly: per-mass m·r²·α = 2.0 × 0.64 × 0.50
= 0.64, two masses 1.28, frame 0.50 × 0.50 = 0.25, total 1.53 — and 1.53 is S2's own drive torque, a
nice closing of the loop. The per-mass tangential force 0.80 N = m·r·α checks too. Ring discipline is
correct: Σ appears only at S7 (advanced), no calculus appears anywhere, core and extended surfaces
are algebra-only. 38c ✓.

One honesty note: two of the three ledger terms are derived from the per-particle picture and the
third (0.25) is a lumped constant asserted. The skeleton says the frame's share is "named honestly",
which is the right instinct, but a derivation state that sums particles should say what that term
*is* — the rod's own bits, summed the same way — rather than only that it exists. P3-4.

---

## Per-state review table (design gate — judged from the skeleton)

| State | correct | order_ok | labels planned | reads sound-off | clearly different | how a teacher uses it | problem / missing | P |
|---|---|---|---|---|---|---|---|---|
| S1 | Y | Y | Y (ledger §10b, `readout_at_ms` gated) | Y — spin + four building rows + a pinned ω | Y (opening baseline) | "Watch the ω number. Nothing is pushing it and it does not sag." | τ and α are defined by naming only; the τ = 0.00 row is honest but τ is never given a magnitude a student can check | P1-5 |
| S2 | Y | Y — aha 2nd of 8, first half | Y (arrow labelled "drive") | Y — constant arrow, climbing ω, pinned α | Y — the only state where a number climbs without end | "Torque is on and stays the same. The speed never settles. The steady number is α, not ω." | the arrow appears 0.7 s before the torque engages, so for 0.7 s a force is drawn while τ reads 0.00 — the screen contradicts its own instrument; end ω never stated | P1-1, P3-2 |
| S3 | Y | Y | Y | Y — retract, then α/τ snap to 0.00 and ω freezes | Y vs S1 (driven-up vs never-driven), declared pair | "The push is gone. Does it stop? The number does not move." | entry ω 3.00 vs S2's end ≈ 5.56 — an unnarrated slowdown at the click, in the concept that says only a torque changes ω; and the state's idea is close to a re-application of S1's rule | P1-7, D1 note |
| S4 | Y — 0.60/1.50 = 0.40, ω = 1.20 exact | Y — quantitative after qualitative | Y (r-line at 0.50, chip, formula) | Y — chip printed first, readout sweeps to meet it | Y — fresh pose, first formula surface, first prediction | "I compute α before we run it, then we run it." | predicts from two numbers the student cannot obtain: I = 1.50 and τ = 0.60 both arrive as oracle values | P1-5 |
| S5 | Y — 1.53/0.66 = 2.32, 4.64 ratio both ways | Y | Y (chip "run A: ω = 1.50" held beside live) | Y — the pin archives the completed comparison, chip beside live value | Y — only cut-and-rerun state | "Same push. Masses moved in. Same three seconds. Look how much further it got." | ω = 6.95 collides with CoAM's headline pulled-in ω for unrelated physics; 4.64 is not derivable from the visible geometry (frame inertia dilutes r²) and narration must not invite r² reasoning | P2-3, P2-5 |
| S6 | **N — the generalisation is false** | Y | Y (R_drum and r as two labelled lines — CoAM discipline correctly inherited) | Y — pad translates in, α reads −0.50, ω ramps to rest | Y — first negative value anywhere | "Push the other way and α goes negative." | teaches "an opposing torque never reverses the spin" from a friction brake; true of Coulomb friction, false of the constant opposing torque D1 is being bought to enable, and contradicted by the sibling's S9 | **P1-4** |
| S7 | Y — ledger 0.64 + 0.64 + 0.25 = 1.53 exact | Y — advanced, contiguous, immediately before explore | Y (per-mass `m·r·α` arrows) | Y — arrows reveal per sentence, then a slow replay | Y — only derivation state | frame term asserted rather than summed; same 0.7 s phantom-arrow beat as S2 | P1-1, P3-4 |
| S8 (explore) | Y | Y — explore last | Y | Y — free-running spin until first input | Y | "Drive and brake at once — watch α read the difference." | the named headline demo is undefined at ω = 0 with both sources engaged, and the engine holds ONE `eng.tau` and ONE engage window, so "both at once" is structurally larger than D1 prices | **P1-8** |

---

## FINDINGS

### P1 — must be resolved before `DESIGN_OK`

**P1-1 · The drive actuator is forked across the two Desk-D skeletons, and this skeleton's version
asserts a force the model does not yet contain.**
*Owner:* `alex:architect` (both skeletons; chapter-wide decision under APPARATUS_CONTRACT §4).
*Evidence:* this skeleton D4 (L441-452) — "a tangential force arrow at the drum rim … label 'drive'",
no mesh, no travel. Sibling `rotational_kinematics/skeleton.md` K8 — "**Visible motor drive wheel** …
translates in to contact the drum … visibly TURNING while engaged … mirror of the brake pad
translate-in". Two different rendered causes for the same actuation on the shared turntable.
APPARATUS_CONTRACT §3 requires one presentation per quantity across all eight concepts; §4 forbids a
local deviation. Desk E would build both meshes for one job — the exact duplication `findings_d.md`
§4 warns against ("price ONE tangential-vector mechanism with two consumers, not two mechanisms").

Second defect in the same row, independent of the fork: this skeleton's §3 S2 reads "the **drive
arrow** appears at the drum rim … static for a 0.7 s beat. THEN τ = +1.53 engages". For 0.7 s a force
arrow is drawn while the τ readout says 0.00 and ω is constant. That is a rendered claim the model
contradicts on screen — the class of defect that closes concepts at Checkpoint B. It recurs
identically in S4 (3.9 s engage after a 0.7 s arrow beat), S5 and S7. CoAM's S5 does not have this
problem because the pad *travels* and contact **is** the engage instant, so cause-motion and effect
onset are the same physical event (Rule 32a satisfied by the physics, not by a dead beat).

*Both defects have one fix:* adopt the sibling's motor drive wheel as the shared chapter actuator —
it travels, contact is the engage instant, and it is narratable without the word torque (which is why
the sibling needs it under Rule 25). This concept then **adds** the tangential force arrow at the rim
as a labelled layer on the contact patch while the drive is live — which is what a τ concept should
show, and which makes τ = F × R legible for P1-5. One mesh, two consumers, both concepts stronger. If
the architect prefers the arrow-only route, it must be written up as a chapter-wide deviation under
§4 and the sibling changed to match — it may not be settled per-desk.

**P1-2 · The `alpha` readout row is specified with two different metrics by the two skeletons.**
*Owner:* `alex:architect` (both skeletons; resolve in `findings_d.md` PASS 2, one metric).
*Evidence:* this skeleton §3 Readout metrics (L180-183) — "**α = the per-step finite difference
(ω_k − ω_{k−1})/h** on the fixed 16 ms grid". Sibling K2 — "**α metric (defined):** α(t) =
τ_signed_eff(t)/I(t) while a source is engaged, else 0.00". Same bought `RBR_RO_META` row, two specs.
They agree only where I is constant and away from engage/release edges; they disagree during an
r-drag (this skeleton's S8 permits exactly that and calls the divergence "honest") and by one step at
every engagement instant. Desk E cannot implement both.

*My read, for the architect, not a ruling:* the finite difference is the more honest instrument — it
measures what the body is doing rather than restating the authored input, and it is the only one of
the two that tells the truth during an S8 r-drag. It also pays for the blanking discipline this
skeleton already specifies (α and τ blank across every re-pin), which the τ/I form would not need.
Whichever wins must be stated once and quoted, not restated.

**P1-3 · Both skeletons claim to be the canonical definition site for the signed-torque semantics;
neither quotes the other.**
*Owner:* `alex:architect`.
*Evidence:* this skeleton D1 — "**Semantics, defined ONCE for both Desk-D concepts** (scar
`two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` —
`rotational_kinematics` consumes this row BY REFERENCE, never redefines it)". Sibling K1 —
"**CANONICAL SEMANTICS PARAGRAPH (the sibling `tau_eq_i_alpha` skeleton must QUOTE THIS verbatim,
never restate** — [same scar])". Each names the other as the consumer. Scar row 155 in this
skeleton's audit is marked `B` on that basis; the sibling marks its own equivalent satisfied. The
scar is satisfied by neither, and it is the precise failure the scar describes.

The two texts are close but not identical, and the difference is load-bearing: the sibling's closed
form is single-term (`L = L_anchor + τ_signed·engaged_seconds`); this skeleton's is two-term with a
simultaneous brake (`L = L_anchor + τ_app·s_app − sign(L)·τ_brake·s_brake`). Desk E reading the
sibling first will not build simultaneity, and S8's headline demo dies silently. Pick one document as
the definition site, put the paragraph there, and have the other quote it verbatim.

**P1-4 · S6 teaches a false generalisation.**
*Owner:* `alex:architect`.
*Evidence:* §2 state table S6 — "An opposing torque is a NEGATIVE α: ω falls at a steady rate, stops
and HOLDS (never reverses)". §4 — "S6's never-reverses beat kills 'negative α spins it backwards'
structurally". The rendered agent is the friction brake pad with the engine's rest clamp (`:49942`,
verified: `if (!(mag > 0)) mag = 0`). A Coulomb friction brake does not reverse a body because its
torque tracks sign(ω) and vanishes at rest — that is a property of *friction*, not of *an opposing
torque*. A constant opposing torque does carry ω through zero and reverse it: it is D1's own stated
semantics ("it may legitimately carry L through zero — a drive is not friction"), it is the sibling's
S9 declared behaviour ("a sustained negative α CAN take ω through zero and reverse the spin — that is
real physics for a driven wheel"), and it is the standard exam item ("a constant retarding torque
acts for 10 s; find ω"). So the belief S6 claims to kill is the correct belief, this concept
contradicts its sibling on the same machine, and a student who generalises S6 gets the exam question
wrong.

CoAM, which S6 mirrors, did not make this error: its S5 row states "**Brake contract:** frictional —
opposes ω … NEVER reverses spin at any reachable slider value", and its title claims only "External
torque changes L". The mirroring copied the beat and dropped the qualifier.

*Fixes, either is fine:* (a) keep the brake and scope the claim honestly — S6 teaches that a brake
gives negative α and the rest clamp is *the brake's* behaviour, with the reversal question named as
out of scope; or (b) drive S6 with the signed applied source D1 now provides, in which case the
reversal is real and either shown or explicitly deferred. Route (b) is the stronger teaching and
costs no extra engine work. Whichever is chosen, §4's claim to kill "negative α spins it backwards"
must be deleted — it is not a misconception.

**P1-5 · The prerequisite patches for `I` and `τ` name the quantities where they must compute them.**
*Owner:* `alex:architect`. *(The skeleton requested a founder ruling. My recommendation is inside
this finding; the sequencing decision itself remains the founder's.)*
*Evidence:* Checkpoint-A item A patch table (L42-47): the I patch is "moment of inertia I measures
how spread out the mass is — the readout computes it from the masses' positions"; the τ patch is "a
torque is a turning push about the axle". §2 numeric table: S4 asserts I = 1.50 and τ = 0.60; S5
asserts the 4.64 factor. `4b289d4` confirms `torque` (#5) and `moment_of_inertia` (#6) are not among
the eight pre-registered ids, so the situation is permanent, not temporary.

S4 is the concept's quantitative pivot and it predicts from two numbers the student cannot obtain or
check. The α and ω = αt patches are genuinely sufficient as written — they define complete ideas in
one breath. The I and τ patches are not: they announce that a black box exists. Both close with one
computing clause on on-screen objects (exact wording shape in "the five things" §1 above), neither
uses Σ, neither pre-empts S7's derivation, and both fit inside the existing 40-55 word budget if S4's
prose is tightened.

I recommend **accepting the unbuilt-prerequisite situation with strengthened patches** rather than
re-sequencing: #5 and #6 are not in the build at all, so "wait" means "never", and the qualitative
spine — which carries the primary aha — is genuinely self-standing today.

**P1-6 · The engine requirements omit `findings_d.md` §6b, and this concept authors exactly the three
states §6b is about.**
*Owner:* `alex:architect` (add the D-row; the fix itself is Desk E's).
*Evidence:* `findings_d.md` §6b — `deriveStateMeta.ts:496-508` declares rbr motion from the seed
alone (`if (w0 >= 0.05) out[stateId] = true`), so a state seeded at rest falls through `undefined` and
THE EYE's D5 motion gate skips; findings_d ranks it "HIGH — must ship WITH §1" precisely because
signed torque creates from-rest states that move a great deal while `omega0_rad_s` is still 0. This
skeleton authors **S4, S5 and S7 from rest** (deviation B). Its D-list has no row for it: D4's
"`deriveStateMeta` co-edited in the SAME change if reveal keys are added" is the reveal-keys co-edit,
and scar row 28 disposes only
`derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl`.

The desk state file §next-3 makes these skeletons "the authoritative statement of what 0c-3 must
build", and the walk table claims completeness in both directions. findings_d carries the item, so it
is not lost — but the document Desk E freezes scope from does not, and the result would be that THE
EYE goes silent on precisely the three states 0c-3 exists to enable. Add it as a D-row.

**P1-7 · The S2 → S3 seam changes ω with no torque and no visible cause.**
*Owner:* `alex:architect`.
*Evidence:* §3 S2 — drive engages 4.89 s, never releases, α = +0.50, duration 13 s ⇒ end
ω = 1.50 + 0.50 × 8.11 = **5.56 rad/s**. §3 S3 ENTRY CONFIG — `0.80 · +3.00 · +1.53 (engaged at
entry)`. Same r, same masses, same arrow state, no rig change: at the click the turntable silently
loses 2.5 rad/s. Rule 32d requires that at every click the only visible change IS the new thing, and
here the invisible change is *the exact quantity the concept says only a torque can change*. Every
other re-pose in the concept is chaperoned (S4/S5 move the masses visibly; S8 fires a re-pin cue),
which is why this seam in particular reads as physics rather than as a reset.

*Fix:* author S3's entry ω as S2's end value (S3's α, cue times and hold structure are unchanged —
only the printed numbers move), or state explicitly that state entry fires the re-pin cue and blank.
The first is better: S2 → S3 then reads as one continuous story, which is what the pair is for.

**P1-8 · S8's headline teacher demonstration lands in undefined behaviour, and its engine cost is
under-priced.**
*Owner:* `alex:architect` (specify the semantics in D1; Desk E builds it).
*Evidence:* §3 S8 — "**both at once = a live τ_net tug — the α readout shows the difference**, the
teacher's own net-torque demonstration"; §10's teacher-usability walk names this as the answer to
"first thing a teacher tries after the aha". D1's form is
`L = L_anchor + τ_app·s_app(t) − sign(L)·τ_brake·s_brake(t)` and probe (c) asserts
`dω/dt = (τ_app − τ_brake·sign(ω))/I` segment-wise.

Two gaps:
- **ω = 0 with both sources engaged is unspecified.** The most obvious thing a teacher does is raise
  the brake above the drive and watch it stop — landing exactly there. `sign(L)` is undefined at
  L = 0 and the segment-wise rule produces a limit cycle about zero, not a stationary wheel. Real
  friction holds it at rest until the drive exceeds breakaway. The rule must be written down (a
  stated static hold: while the drive is engaged and |τ_app| ≤ τ_brake, L is held at 0) or the demo
  chatters on the founder's screen.
- **Scope.** Verified in the renderer: `applyRigidBodyRotationState` (`:50518-50533`) sets a single
  `eng.tau` and a single `eng.brakeOnMs`/`brakeOffMs` window, and `rbrBrakedSeconds` (`:49927`)
  early-returns unless `eng.tau > 0`. "Both sources may be active simultaneously" is therefore not a
  generalisation of the closed form — it splits the engine record into two (τ, window) pairs, splits
  `rbrBrakedSeconds`, and turns every `eng.tau > 0` guard into `!== 0` for the signed source. D1
  should say so, or Desk E under-prices it and drops simultaneity as the cheap cut.

### P2 — should fix in this cycle

**P2-1 · `findings_d.md` §2's loud-warn request is absent from the D-list.** findings_d asks that an
unknown readout token `console.warn` once per state and says "**that warning is worth more than the
rows themselves** … it converts an invisible authoring class of error into a visible one for every
future rbr concept". D3 asks only for the two rows. This desk exists because of that silent skip; the
scope-freeze document should carry the item, not only the findings file. *Owner:* `alex:architect`.

**P2-2 · The `external_torque.source` declared/live mismatch is not consumed.** findings_d §7 and
APPARATUS_CONTRACT §1 both record it; verified — the interface declares
`'brake' | 'applied_force_at_point' | 'torsion_spring'` while the implementation resolves
`'applied_torque' | 'brake'` (`:50518`). This concept's whole physics rides the string that is not a
declared member of its own enum. It is navigable (the resolver defaults to `'applied_torque'` when
`applied_torque_Nm` is a number, so json_author can omit `source`) but it should be closed in the
same change, and D1 should say so in one line. *Owner:* `alex:architect`.

**P2-3 · ω = 6.95 collides with CoAM's headline number for unrelated physics, and the skeleton
presents the collision as coherence.** §2 cross-checks — "S5's 6.95 equals CoAM's pulled-in ω". The
in-state pairwise-distinct scan is rigorous; the same scan is not run across the shared apparatus.
Run-B duration is the free parameter (2.5 s → 5.80 removes it at zero cost; avoid 2.0 s, which gives
4.64 and collides with the ratio instead). Keep the 4.64 inertia ratio — that one is forced by the
contract's own poses and is real coherence. *Owner:* `alex:architect`.

**P2-4 · The two Desk-D skeletons send the office contradictory `omega0` slider requests.** This
skeleton D2 — "the ω₀ SLIDER keeps its 0.5 floor (`:49999`) — the deviation is authored-entry-only,
no control change". Sibling office item 2 — "**`omega0` slider min 0.5 → 0** … `tau_eq_i_alpha` will
want the same. Chapter-wide decision." One desk, two positions, one office queue. Reconcile before
either goes to the office. (Verified `RBR_SLIDER_SPEC.omega0.min = 0.5` at `:49999`.)
*Owner:* `alex:architect`.

**P2-5 · S5's 4.64 is not derivable from the visible geometry, and the concept flirts with inviting
the derivation.** Moving the masses 0.80 → 0.20 is 4× closer and 16× less mass-term inertia; the
readout says 4.64× because I_frame = 0.50 dilutes it. §4's one_line_fix is safely worded ("I depends
on where the mass sits"), but §5's deep-dive hint names r² explicitly ("students carry m into τ = Iα
without r²"), and narration drifting toward r² produces a visible contradiction with the HUD. Add an
explicit instruction to physics_author: S5 reads the ratio off the instruments and never invites an
r² computation (that is #6's job). *Owner:* `alex:architect` (note into the physics block).

### P3 — notes

**P3-1 · Archetype vocabulary forks across the chapter.** This skeleton coins `converge-to-mark`; the
sibling coins `converge-on-mark` for the same chip-and-match picture. And `cycle-compare` is reused
from CoAM S6 — where it is defined as "**The ONLY looping state**", two runs repeating — for this
skeleton's S5, which is explicitly "one-shot A→cut→B, then HELD — not looping". Rule 31's archetype
names are the chapter's distinctness vocabulary; one name must not cover both a looping and a
non-looping picture. Rename S5's (e.g. `two-run-compare`) and settle one spelling for the chip
archetype.

**P3-2 · S2's end ω is never stated** (≈ 5.56 rad/s), on the one state whose claim is that the value
does not stop growing, in a document whose DoD asserts zero TBDs. physics_author needs it, and P1-7's
fix needs it.

**P3-3 · S3 holds for ~75% of its duration** (beat done at ~2.5 s of ≥ 10 s) against S1's ~45%. The
hold IS the claim, so this is not a defect — but ≥ 8 s would read tighter and the pin still lands
clean at 0.60R.

**P3-4 · S7's frame term.** 0.25 is asserted where 0.64 and 0.64 are derived. Say what it is — the
rod's own bits, summed the same way — rather than only that it is named honestly.

**P3-5 · Rule 41 micro-note.** "the spin keeps speeding up" (S2 title) and "the spin does not change"
(S1) are loose: a spin does not speed up, the spin *rate* rises. 41b says use the word the formula
uses. Every other title, and all eight delta cues, are clean and within budget (longest is 4 words).

**P3-6 · Two glow channels at one instant.** §10(b) has S2 glowing the drive arrow (scene) while the
ω row carries instrument hold-glow. The reasoning is sound (Rule 32e vs the
`state_glow_focal_dims_one_half_of_the_relation` scar) and it is the established chapter pattern —
flagged only so Checkpoint B reads an actual frame and confirms one focal reads on screen.

**P3-7 · Under `core_only`, §10's teacher-usability answer disappears.** The τ_net tug needs the
extended-ring `tau_brake`. The ring cut is correctly walked; the usability walk should also name the
core-only answer (drag `tau_app`, watch α jump and ω integrate it).

**P3-8 · findings_d §4's "one tangential mechanism, two consumers" note is not referenced by D4/D7.**
Both are on the force map (`rbrArrowLen`) and the sibling's K4 is on its own velocity map — correct
per the scar `velocity_arrows_routed_through_a_force_arrow_map_collapse_their_ratio` — but saying so
in D4/D7 saves Desk E the reconciliation.

---

## Engine-requirements review (the second first-class deliverable)

**Cross-check against `findings_d.md`, both directions.**

| findings_d | consumed by the skeleton? |
|---|---|
| §1 signed torque | ✓ D1 — correctly identified as the headline; the correction to `:947-949` is the desk's best work |
| §2 `theta` + `alpha` rows | ✓ partially — D3 buys `alpha` + `tau`; `theta` correctly not needed here. **The loud-warn request is dropped → P2-1** |
| §3 angular reference | ✓ correctly not consumed (kinematics only) |
| §4 tangential vectors | ✓ D7 (force form) + D4; the "one mechanism, two consumers" note not referenced → P3-8 |
| §5 mark surfaces + applied-torque control | ✓ D5; D9 correctly declares no α/θ mark surface is needed (both predictions land on `omega`, which IS in the live enum — verified `:1024`) and this **agrees** with the sibling's K2 |
| §6b motion declared from torque | ✗ **absent → P1-6** |
| §6c static formula surface | ✓ D8, well handled — the minimum buy is pinned, the richer form is upside, and the CoAM cross-desk consequence is correctly escalated |
| §6 per-run restart overrides | ✓ D6, correctly scoped as a run script up front |
| §7 `source` enum mismatch | ✗ **absent → P2-2** |
| §7 no graph surface in rbr | ✓ §10(i-5) excludes graphs deliberately, with a real pedagogic reason |

**Skeleton-side additions findings_d does not yet carry** — all correct, and they belong in PASS 2:
D4 a rendered drive actuator; D1's simultaneous drive+brake (with P1-8's caveats); D3's
blank-across-re-pin discipline for α/τ; D8's `formula_at_ms` minimum buy; the entry-ω = 0 contract
deviation.

**Verified `[LIVE]` claims (spot-check, this session).** `RBR_RO_META` closes at six with
`if (!meta) continue` ✓ (`:50152`, `:50162`). `rbrLAt` decay-only with `Math.abs` at both source
sites ✓ (`:49937`, `:50520`, `:50532`). `config.slider_controls` per-concept override via `rbrSc` ✓
(`:50005-50014`) — so S6's tau_brake default/step override is real. `restart` carries only
`at_ms`/`every_ms`/`flip_spin`/`cue` ✓ (`:1032`, `:50544`). `reference_marks.surface` excludes α/θ ✓
(`:1024`). `RBR_SLIDER_TOKENS` closes at five ✓ (`:49995`). `omega0` slider floor 0.5 ✓ (`:49999`).

One claim I can **relax**: HUD row order is driven by the per-state `readouts` array, not by
`RBR_RO_META` declaration order (the `rbrRebuildReadout` loop iterates `rb.readouts`), so
APPARATUS_CONTRACT §3's fixed-order clause is independently satisfiable by both Desk-D concepts —
no finding, recorded so nobody re-derives it.

**Rule 38 full check (not only 38b).** 38a rings monotone, advanced (S7) contiguous immediately
before explore, both cuts walked with no surviving state referencing hidden-ring content ✓. 38b
explore surfaces core content only — S8's formula is `τ = Iα`, stated at core S4, and `tau_brake` is
cut with its ring ✓. 38c notation ladder — Σ at S7 only, no calculus anywhere, core/extended surfaces
algebra-only ✓. 38d dialect — "battery/cell" N/A; "moment of inertia", "angular acceleration",
"torque" are the cross-board words ✓. 38f anchor — a playground merry-go-round is the widest-overlap
device and is explicitly blessed by APPARATUS_CONTRACT §3 ✓. 38g tags-as-claims — CBSE marked
verified, every non-CBSE cell `needs_teacher_verification: true` ✓.

**Rule 35.** Anchor is universal, no country-specific place/brand/festival/currency, no asserted
region constant ✓. No collision with the sibling's anchors (ceiling fan, bicycle wheel) ✓.

**Gate 0 / zero TBDs.** No literal TBD in the document. Two items are legitimately open and correctly
routed rather than left blank: the entry-ω = 0 contract deviation (raised under §4, as the contract
requires) and D8's richer-form option (pinned to a minimum buy that the design is authorable
against). Neither is a TBD. P3-2's missing S2 end ω is the one genuinely underspecified cell.

---

## RUBRIC (advisory, unratified — `docs/EXEMPLAR_RUBRIC.md`; did not affect the verdict)

Checkpoint-A subset (D1/D2/D8/D9/D10 are the five answerable from a skeleton).

```
D1 1 · D2 2 · D8 1 · D9 2 · D10 2   = 8/10
```

**Weakest two:**

- **D1 information gain** — S3 is thin. S1 already establishes "no net torque ⇒ ω constant" as a
  general fact, so a student holding S1 can answer S3's own JEE distractor ("the torque stops — does
  the wheel stop?") by applying it. The declared S1/S3 contrast pair separates them by *staging*
  (never-driven 1.50 vs driven-up 4.00), not by idea. It is not empty — "the speed the torque built
  is kept" is a real second half — but it is the one state where deletion would cost least.
  (Evidence: §2 S1 purpose "τ = 0 ⇒ α = 0 ⇒ ω constant" vs §2 S3 purpose "removing τ removes the
  CHANGE, not the motion"; §3 archetypes both `null-result-hold`.)
- **D8 misconception placement** — the three listed beats are exemplary and land at genuine pivots
  (S1 everyday friction, S2 the force→velocity carryover, S5 the I-dependence). The score drops for
  the *unlisted fourth*: §4's closing claim that "S6's never-reverses beat kills 'negative α spins it
  backwards' structurally, without a watch entry". That belief is correct physics for a constant
  opposing torque, so the design places an unwatched beat that teaches against a true statement
  (P1-4).

This section did not change the verdict; the verdict is what it would have been without it. No
threshold is quoted and no grade is claimed — `EXEMPLAR_RUBRIC.md` §6.1's numbers are unratified.

---

## Handoff

Route to `alex:architect` for REV 2. **P1-1, P1-2 and P1-3 cannot be closed inside this document
alone** — they are agreements with `rotational_kinematics`, which is at Checkpoint A in the same desk
right now. The efficient path is one architect pass over both skeletons together, landing the three
shared decisions (drive actuator · α metric · one canonical signed-torque paragraph) in whichever
document is chosen as the definition site, with the other quoting it verbatim.

Two items go to the office rather than the architect, and should be copied into
`docs/loop_runs/rotmech/_engine/findings_d.md` regardless of the verdict, since Desk E's scope may
freeze before REV 2 lands: the APPARATUS_CONTRACT §4 deviation request for entry ω = 0 (Checkpoint-A
item B — I support it: the contract's §1 language pins the pose a teacher *opens* on, and this
concept does open there in S1/S2/S6/S8), and the reconciled `omega0` slider-floor position (P2-4).

The founder ruling the skeleton requests on prerequisites is answered in P1-5 as a recommendation
only: accept the unbuilt state with strengthened patches, do not re-sequence. That recommendation is
mine; the sequencing call remains the founder's.

**No repo file other than this report was written. No agent was dispatched, no SQL applied, no `src/`
file touched.**
