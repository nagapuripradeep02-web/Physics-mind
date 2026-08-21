# founder_proxy — CHECKPOINT A (design gate) — `tau_eq_i_alpha` — CYCLE 2 (final)

**Concept:** `tau_eq_i_alpha` (Class-11 Ch.7 rotmech, #7) · **Skeleton:** REV 2, 890 lines
**Desk:** D (`feat/rotmech-d`) · **Cycle:** 2 of 2 — LAST · **Date:** 2026-08-04
**Cycle-1 report:** `founder_proxy_A.md` (`DESIGN_FIX`; 8 P1 · 5 P2 · 8 P3)
**Sibling read for this review:** `docs/loop_runs/rotmech/rotational_kinematics/skeleton.md` REV 2
**Scope:** design only. Not shipping approval (Rule 17); shipping stays founder-only.

---

## VERDICT: `DESIGN_OK` — with ONE P1 carried by explicit instruction (not downgraded)

**The fork is closed.** All four reconciled items agree between the two Desk-D documents, item by
item, and I could not find a fifth. Every cycle-1 P1 is genuinely landed in the body, not merely in
the response table — I diffed each claim against the text it points at, including the two the desk's
own aborted first attempt had faked (P1-4 and the shared-actuator adoption). The arithmetic still
closes exactly, including the new P1-5 recipes and the retimed run A/B. The lesson was NOT
redesigned: same eight state ids, same purposes, same rings; only titles, S6's scoping, archetype
names and numbers moved (diffed against `skeleton_rev1.md`).

I am not, however, signing a clean document. Reject-biased reading of the S6 physics turned up a
defect the fix cycle did not create but did make load-bearing, and it is P1: **the tau readout is
defined as "the signed authored schedule value", so at S6's rest clamp — and at the S8 tug's static
hold — the HUD prints a non-zero tau beside alpha = 0.00 with I on screen, in the one concept whose
atomic claim is tau_net = I*alpha.** S6's frozen pin lands 1.5 s inside that window. The document
contradicts itself here: D1 defines the omega = 0 hold as a state where the brake supplies only what
is needed, while D3's metric prints the brake's full magnitude. The remedy is one sentence, costs no
new engine work, and lands in two documents that are BOTH written after this gate (the physics block;
`findings_d.md` PASS 2). It is stated verbatim in P1-A below.

**I am carrying it rather than escalating**, on the founder's own last-cycle instruction, because:
(a) there is no physics doubt to arbitrate — a friction brake on a stopped drum with nothing driving
exerts zero net torque, and the skeleton's own metric sentence ("a display of the acting torque")
already requires 0.00; only its parenthetical gets it wrong; (b) the correction changes no state, no
arc, no ring, and no engine buy — D1 must resolve that number anyway, so the tau row simply displays
the resolved value instead of the authored one; (c) both landing sites are downstream and both are
diffed at Checkpoint C. **It is recorded here as P1 and must be verified as landed at Checkpoint C —
it is not to be re-graded as polish.** If it reaches a built sim unfixed, the S6 frozen frame will
close the concept at Checkpoint B.

Nothing here triggers ESCALATE.

---

## PRIMARY JOB — is the fork actually closed?

### The four reconciled items, verified by direct comparison

**1 · alpha = the per-step finite difference of omega — AGREED.**
- `tau_eq_i_alpha` §3 readout metrics (L240-247): "`α` = the per-step finite difference
  (ω_k − ω_{k−1})/h on the fixed 16 ms grid (`RBR_GRID_MS`, `:49737`) … the SHARED chapter
  definition … the sibling consumes this same metric and has retired its analytic τ/I form"; "α and
  τ BLANK during every re-pin/restart blank window"; "All rows publish from ONE post-step snapshot
  per frame." Restated identically in D3 (L532-537).
- `rotational_kinematics` §3 metrics (L107) and K2 (L240): "*α is the per-step finite difference of
  ω, published from the SAME post-step snapshot as I, ω, L and KE (`rbrWriteReadouts`,
  `field_3d_renderer.ts:50219`), and blanked across re-pins exactly as the other rows are.*" Its
  cycle-1 response row (L17) records the analytic τ_signed/I form as DELETED.
- Verified in code: `RBR_GRID_MS = 16` at `:49737`; `rbrWriteReadouts` begins at `:50220` (the
  sibling's `:50219` is off by one — navigable). Both sides carry all three load-bearing clauses:
  per-step finite difference of omega · same post-step snapshot · blanked across re-pins.
  **Semantically identical; no fork.** They are NOT literally string-equal — see P3-1, because the
  sibling asserts they are and makes string-equality a PASS-2 freeze condition.

**2 · ONE motor drive wheel, contact = engage — AGREED, and the phantom-arrow beat is gone.**
- Sibling K8 (L246) is the surviving spec and says so: "this is the ONE torque-agent mesh for both
  Desk-D concepts — `tau_eq_i_alpha` drops its floating tangential arrow and layers its rim force
  arrow on THIS wheel."
- `tau_eq_i_alpha` adopts it everywhere the actuator is named: §2 apparatus (L129-133), D4 (L546-571,
  "the MOTOR DRIVE WHEEL … REV 1's floating tangential arrow is DROPPED as the actuator"), §9
  (L337-338), the §10(b) ledger rows (L352-353), the §10(d) motion plan (L375-383).
- **Phantom-arrow beat — gone in all five places it recurred:** S2 "contact IS the engage instant …
  at contact the rim force arrow appears … no frame ever draws a force while τ reads 0.00" (L217);
  S4 "travels in 3.2 → 3.9 s; contact = engage, its arrow `F = 1.09 N` appears at contact" (L219);
  S5 both runs ("contact = engage at 0.5 s" / "at 4.7 s", L220); S7 "travels in 3.8 → 4.5 s
  (contact = engage — P1-1)" (L222); S3's release is the wheel withdrawing with its arrow (L218).
  S8's wheel tracks the drag (L223).
- **No second actuator survives anywhere.** The only other arrows in the document are D7's
  per-particle tangential force arrows at S7 (a derivation overlay riding the masses, not an
  actuator) and the brake pad at S6. I searched the document for a rim-anchored floating actuator
  arrow: none.

**3 · Signed-torque semantics by reference — AGREED here; one honest caveat on the sibling's side.**
- `tau_eq_i_alpha` D1 (L480-483) cites `findings_d.md` §1 as canonical and **restates nothing** —
  everything that follows is additive engine SHAPE (closed form, engage/release knobs, simultaneity,
  the omega = 0 hold, enum closure, absent-field clause, probes). Checked line by line: no brake or
  applied semantics are redefined.
- Scar row 155 (L875) is dispositioned honestly here, naming REV 1's false "satisfied" and the
  cycle-1 finding verbatim. The sibling's row 155 (its L453) is equally honest — "the gate's P1-1
  recurrence closed by removing the definition from both documents, not by winning the argument".
  Row 108 is consistent on both sides.
- Caveat (documentation nit, not a fork): the sibling's K1 declares "this document defines nothing"
  and then summarises the semantics inline after the colon, including the single-term closed form
  `L = L_anchor + tau_signed * engaged_seconds`. That summary is CORRECT for its own concept (no
  simultaneity — `tau_brake` is exposed nowhere in it), and `findings_d.md` §1 now carries the DESK-D
  RULING that `sources[]` is in scope, so Desk E cannot under-build simultaneity by reading the
  sibling first. The cycle-1 failure mode is closed.

**4 · omega0 floor — AGREED: one ask, two sites, explore only.**
- `tau_eq_i_alpha` item B.2 (L101-106) and D2 (L517-525): floor 0.5 → 0 at BOTH
  `RBR_SLIDER_SPEC.omega0.min` (`:49999`) AND the live-write guard `if (!(value > 0)) return;`
  (`:50075`); explore-state-only; REV 1's "keep the floor" superseded.
- Sibling office item 2 (L253): same two sites, same wording, "the sibling `tau_eq_i_alpha` is
  aligned to this identical text — the contradictory REV-1 requests are superseded on both sides."
- Verified in code: the guard exists (the `omega0` branch opens at `:50075`, the guard is its next
  line); an authored `omega0_rad_s: 0` is honoured today through `rbrNum` (`:49828`). Both sides
  correctly narrowed the ask to the SLIDER only.

### Beyond the four — cross-check of the two ENGINE REQUIREMENTS digests

Everything the two lists share, diffed. **Agreements:** the `alpha` row spec (`{ label: "α", unit:
" rad/s²", dp: 2 }`, identical on both sides); the loud `console.warn` on unknown readout tokens;
`'applied_torque'` added to the declared `source` enum; `deriveStateMeta` motion declared from the
torque, shipping in the SAME change (tau D10 "any engaged signed source ⇒ motion true" vs sibling K10
"|ω₀| ≥ 0.05 **or** a signed applied torque is engaged"); no `'theta'`/`'alpha'` mark surfaces;
tangential FORCE arrows on `rbrArrowLen` here vs velocity arrows on their OWN map there (both state
it); accumulator-free closed forms; per-CONCEPT (never per-state) slider ranges via
`config.slider_controls`. **No new fork found.** Three benign asymmetries, all logged as P3s: the
enum ask is a superset here (tau also asks to drop-or-defer the two never-implemented members); the
sibling corrected the formula-surface citation (`:50448` styling vs `:50570-50574` rebuild call site)
and tau did not adopt it; tau's D4 omits `pad_travel_ms` from its scriptable-knob list while
authoring 0.7 s travel windows in six states (field verified LIVE at `:1006`, default 1200 ms at
`:50502`).

**Cross-apparatus number scan, extended to the sibling** (tau's own scan covers CoAM only): no
harmful collision. tau's headline set (5.56 · 6.56 · 5.80 · 1.25 · 1.20 · 0.60 · 0.40 · 1.09 · 2.78 ·
2.32) against the sibling's (4.19 · 6.28 · 2.40 · 3.30 · 0.30 · 1.20 · 2.70 · 0.90 · 0.60 · 2.00 ·
1.84): the two 1.20s and two 0.60s are different quantities in different units in different concepts,
and the sibling never renders tau at all. One genuine coincidence worth KEEPING: tau's S6 brake beat
(1.53 N·m on I = 3.06 → α = −0.50, 1.50 → 0 in 3.00 s) is numerically identical to the sibling's S5
brake beat — same machine, same brake, same result. That is real chapter coherence; a student who
notices it learns something true. Noted for chapter-wide Checkpoint C, not a finding.

---

## THE SEVEN SPECIFIC CHECKS — direct answers

**1 · P1-4, the physics error. The correction is complete and consistent — and S6 still earns its
place.** §2's S6 row: title "Friction brake: negative α"; "Brake contract: frictional — opposes ω
(the CoAM S5 qualifier, restored at P1-4)"; "never-reversing is FRICTION's behaviour, not a law of
opposing torques — a sustained driven opposing torque CAN reverse a spin … out of scope here, owned
by the sibling's sandbox". §3's S6 row carries the same and quotes the narration clause. §4 deletes
the false claim with a tombstone (L284-287). Three further sites are consistent, which is what makes
me believe the fix rather than the table: Block 1's JEE trace (L438-441) reasons about the exam's
"constant retarding torque carries omega through zero" variant and routes it to the sibling; Block
1's planting-risk note (L448-449) names the belief S6 must not plant; scar rows 93 and 147 both
restate the friction scoping. **Cross-document:** the sibling's S9 declares the reversal real,
emergent and never clamped — the two documents now agree instead of contradicting.
**Rule 31 after the re-teach:** S6 still owns four things nothing before it owns — the first negative
alpha and tau, the first opposing-torque case, the sign of alpha following the sign of tau_net, and
the rest hold; its `translate-through` archetype (the pad travelling in) repeats nothing; and its
symmetric claim (the same 1.53 N·m removes speed at exactly the rate it added it) is a good beat. It
earns its place. **What the fix did not touch is the instrument reading at the END of that beat →
P1-A.**

**2 · P1-8, the tau_net tug: KEEP it. I would take the structural buy, not the fallback.**
The atomic claim (§1) is literally "a NET external torque produces angular acceleration in
proportion, tau_net = I*alpha", and S6's formula surface prints `τ_net = Iα`. Cut the tug and the
word "net" has no on-screen referent anywhere in the concept — the sandbox becomes one signed dial
and the lesson quietly degrades from "net torque" to "the torque". The tug is also §10's answer to
"the first thing a teacher tries", and it is a demonstration no whiteboard performs. Against that,
the buy is real but bounded and the skeleton prices it honestly (a `sources[]` list, per-source
engage windows, a split `rbrBrakedSeconds`, widened guards). Two things make me comfortable: the
static hold with breakaway keeps the integrator closed-form and piecewise-linear (a breakpoint at the
crossing), so Rule 36 and the frozen-baseline invariant survive; and `sign(L)` is explicitly never
consulted at 0, which was the undefined corner. Under the PRIME DIRECTIVE this is the engine fix
versus the cheaper content workaround, and the engine fix wins — time is an acceptable cost.
**Take the tug.** Keep the documented fallback as a designed cut rather than a mid-build
improvisation — but it has one hole nobody walked (P2-B).

**3 · P1-5 arithmetic — exact; S7 untouched; the ruling request still visible.**
I = 0.50 (frame) + 2.0 × 0.50² + 2.0 × 0.50² = 0.50 + 0.50 + 0.50 = **1.50** — algebra only, no
sigma. tau at S2: F = 1.53/0.55 = 2.7818 → 2.78 N, and 2.78 × 0.55 = 1.529 → **1.53 N·m**. S4 repeats
the recipe: 0.60/0.55 = 1.0909 → 1.09 N, and 1.09 × 0.55 = 0.5995 → **0.60 N·m**. S7's derivation is
unchanged and still closes exactly (2.0 × 0.64 × 0.50 = 0.64 per mass, 1.28 for two, frame
0.50 × 0.50 = 0.25, total **1.53**), and sigma still appears at S7 only (Rule 38c intact). Home
I = 0.50 + 2 × 2.0 × 0.64 = **3.06**; r = 0.20 → **0.66**; 1.53/0.66 = 2.3182 → **2.32**. The founder
ruling request survives verbatim at item A (L84-87) and is pointed at from §8. My cycle-1
recommendation stands: **accept, do not re-sequence** — #5/#6 are not in the pre-registration at all,
so "wait" means "never", and the patches now compute on on-screen objects instead of announcing a
black box.

**4 · P1-7 — the seam is continuous, and no other state carries a similar jump.**
S2 ends at 1.50 + 0.50 × (13 − 4.89) = 1.50 + 4.055 = **5.56**; S3 enters there and drives to
5.56 + 0.50 × 2.0 = **6.56**. Stated consistently in §2's table, §2's cross-checks, §3's S3 ENTRY
CONFIG and the pin table (S3 now ≥ 8 s, pin 4.8 s, margin 2.3 s — cycle-1 P3-3 taken).
**Full seam walk:** S1→S2 continuous (1.50); S2→S3 continuous (5.56) — fixed; S3→S4 omega 6.56 → 0,
chaperoned by a visible rig change (masses to mid-rod, r-line relabelled 0.50); S4→S5 and S5→S6
likewise pose-chaperoned; **S6→S7 continuous (both at rest) and S7→S8 continuous (1.50 at r = 0.80)**
— two seams I had not noticed in cycle 1, clean by construction. The only residual is S3→S4, where
the omega reset is the largest; one narration clause closes it (P3-6).

**5 · P2-3 — the retiming is correct and the ratio survives.** Run A: 0.50 × 2.5 = **1.25**. Run B:
2.3182 × 2.5 = 5.7955 → **5.80**. Equal-time speed ratio 5.7955/1.25 = 4.6364 → **4.64** = the I
ratio 3.06/0.66 = the alpha ratio 2.32/0.50 — intact, and now genuinely forced by equal drive times.
The 6.95 collision with CoAM's headline pulled-in omega is gone, and the rejected 2.0 s alternative
(→ 4.64, colliding with the ratio itself) is recorded. The cross-apparatus scan against CoAM is
present and correct; I extended it to the sibling myself (above) and it comes out clean.

**6 · Cycle-1 P2s and P3s re-verified against the BODY, not the table.** All five P2s land (P2-1 in
D3; P2-2 in D1; P2-3 in §2/§3/§4/pin table; P2-4 in item B and D2; P2-5 in §3 S5 and §5). Of the
eight P3s, seven land verbatim at their claimed sites, including the two I expected to be fudged
(S7's frame term now says what the 0.25 IS — "the rod's own particles, each m·r²·α, summed the same
way"; and the D4/D7 force-map vs sibling velocity-map note). **One table row over-claims:** the
P3-1…P3-8 row claims "'spin' → 'spin rate' in titles **and cues**" — both titles changed and S2/S3's
cues changed, but S1's delta cue still reads **"No torque: spin unchanged"** (P3-3 below; the fix is
free — "No torque: spin rate unchanged" is 5 words). That is exactly the failure mode the dispatch
told me to hunt, caught. The ten scar rows claimed re-dispositioned (4, 24, 25, 27, 28, 29, 61, 82,
108, 155) all carry their claimed new content; the audit is still a mechanical 157/157 superset diff
on both sides.

**7 · Rules and Gate 0.** Zero literal TBDs (the only "TBD" in either document is the §10 heading).
Rule 25 — the §10(b) ledger with DEFINED/PRINTED columns, `readout_at_ms` enforcing S1's ordering,
four computing cliff patches. Rule 31 — word budgets 25-55 in every guided state, distinct archetypes
with one declared contrast pair, no static state, explore last. Rule 32 — cause-first satisfied by
the wheel's 0.7 s travel with the effect beginning at contact (32a satisfied by the physics, never a
dead beat); one-variable-moves; ≤5-word delta cue first; home-pose continuity; single focal with the
two-channel note and the Checkpoint-B frame check. Rule 34 — one formula surface per state,
value-only HUD, Unicode including U+2212, corners cleared at `top:52px`. Rule 35 — playground
merry-go-round, universal, no collision with the sibling's ceiling fan / bicycle wheel. Rule 38 —
38a rings monotone with advanced (S7) contiguous before explore and both cuts walked; 38b explore
surfaces `τ = Iα` (core) with `tau_brake` cut by min_ring; 38c sigma at S7 only, no calculus; 38d
cross-board wording; 38f widest-overlap anchor; 38g every non-CBSE cell
`needs_teacher_verification: true` — **with one hole in the declared FALLBACK's ring behaviour
(P2-B)**. Rule 41 — titles literal and result-stating, meaning in the first words, with two wording
notes (P3-3, P3-7). **The lesson was not redesigned:** diffed against `skeleton_rev1.md` — same eight
states, same ids, same purposes, same rings, same `entry_state_map`.

---

## Per-state review table (design gate — judged from the skeleton)

| State | correct | order_ok | labels planned | reads sound-off | clearly different | how a teacher uses it | problem / missing | P |
|---|---|---|---|---|---|---|---|---|
| S1 | Y | Y | Y (ledger §10b, `readout_at_ms` gated) | Y — spin + four rows building + a pinned ω | Y (opening baseline) | "Watch the ω number. Nothing is pushing it and it does not sag." | delta cue still says "spin" where the title says "spin rate" | P3-3 |
| S2 | Y | Y — aha 2nd of 8 | Y (`drive F = 2.78 N` on the contact patch) | Y — constant arrow, climbing ω, pinned α | Y — the only state where a number climbs without end | "The torque is on and stays the same. The speed never settles. The steady number is α." | none — the phantom-arrow beat is gone and the τ recipe now computes | — |
| S3 | Y | Y | Y | Y — wheel withdraws, α/τ snap to 0.00, ω freezes at 6.56 | Y vs S1 (driven-up 6.56 vs never-driven 1.50), declared pair | "The push is gone. Does it stop? The number does not move." | still the arc's thinnest link — real, but the state whose deletion would cost least | rubric only |
| S4 | Y — 0.60/1.50 = 0.40, ω = 1.20 exact | Y | Y (r-line 0.50, chip, formula) | Y — chip printed first, readout sweeps to meet it | Y — fresh pose, first formula surface, first prediction | "I compute α before we run it, then we run it." | ω resets 6.56 → 0 at entry (pose-chaperoned; one clause closes it); the pin lands mid-retraction | P3-6, P2-A |
| S5 | Y — 1.53/0.66 = 2.32; 5.80/1.25 = 4.64 | Y | Y (chip `run A: ω = 1.25` held beside live 5.80) | Y — the pin archives the completed comparison | Y — the only cut-and-rerun state | "Same push. Masses moved in. Same time. Look how much further it got." | the pin lands mid-retraction of the wheel | P2-A |
| S6 | Y for the beat — **N for the instrument at the end of it** | Y | Y (R_drum and r as two labelled lines) | Y — pad travels in, α reads −0.50, ω ramps to rest | Y — first negative value anywhere | "Push the other way and α goes negative — and friction only holds it, it cannot turn it back." | after the rest clamp the HUD prints τ = −1.53 beside α = 0.00 with I = 3.06 on screen — τ = Iα contradicted in the frozen frame | **P1-A** |
| S7 | Y — ledger 0.64 + 0.64 + 0.25 = 1.53 exact | Y — advanced, contiguous, before explore | Y (per-mass `m·r·α` arrows) | Y — arrows reveal per sentence, then a slow replay | Y — the only derivation state | "Every particle needs its own force; add the torques and you get Iα." | the pin lands mid-retraction | P2-A |
| S8 (explore) | Y for the physics — **N for the τ display at the held corner** | Y — explore last | Y | Y — free-running spin until first input | Y | "Drive and brake at once — watch α read the difference." | at the static hold the HUD prints τ_net ≠ 0 with α = 0.00 (the same defect as S6, live, at the named demo); the declared fallback's signed range is not ring-walked | **P1-A**, P2-B |

---

## FINDINGS

### P1 — carried into `physics_author` + `findings_d.md` PASS 2 by explicit instruction

**P1-A · The `τ` readout is defined as the authored schedule value, so it contradicts τ = Iα at every
instant the brake holds a stopped wheel.**
*Owner:* `alex:physics_author` (the metric statement plus the S6 and S8 rows in the physics block) —
and the dispatching session must carry the corrected sentence into `findings_d.md` PASS 2, since
Desk E freezes D3's metric from there.
*Evidence:*
- §3 readout metrics, L240-241: "**`τ` (net) = the signed authored schedule value at t** — a display
  of the acting torque, not a measurement (+drive − brake; 0 when nothing engaged)."
- §3 S6, L221: "Rest clamp at 4.5 s: ω holds 0.00, α returns 0.00 **while the pad stays on**." With
  the pad engaged, "+drive − brake" evaluates to −1.53, so the HUD reads I = 3.06 · ω = 0.00 ·
  α = 0.00 · τ = −1.53.
- Pin table L269: the S6 pin is at **6.0 s**, the rest clamp at 4.5 s — **the frozen frame sits 1.5 s
  inside the broken window.** The archived S6 frame contradicts the concept's atomic claim.
- §3 S8, L223: the static hold pins L at 0 and α reads 0.00 while both sources are engaged — by the
  same metric τ_net prints τ_app − τ_brake ≠ 0. This is the *named* teacher demonstration (§10
  usability walk), live, at the first corner a teacher reaches.
- Internal contradiction: D1 (L499-501) defines the hold as the brake supplying exactly what is
  needed (`sign(L)` never consulted); D3 prints the brake's full magnitude. One document, two rules.
*Physics, not in doubt:* a friction brake on a stopped drum with nothing driving exerts **zero** net
torque — τ_brake is a capacity, not a torque. During S6's decay the display is already exact
(−1.53 = 3.06 × −0.50); the break is only at and after the clamp.
*Remedy — one sentence, verbatim for the physics block and for PASS 2:*
> **`τ` displays the NET torque the integrator actually resolved at t** — the same signed value the
> closed form used, including the brake's `−sign(ω)` factor and the static-hold zero — **not the
> authored schedule value.** It therefore satisfies τ = I·α identically on the HUD at every instant,
> including the rest clamp (τ → 0.00 with α → 0.00 while the pad stays on) and the S8 static hold
> (τ_net → 0.00 while the wheel is held).
*Cost:* none beyond D1's own work — D1 must resolve that number in order to integrate. The change
REMOVES a rule rather than adding one.
*Carry decision:* recorded as P1, not downgraded. **Checkpoint C must diff both landing sites** (the
physics block's metric statement, and PASS 2's merged D3/K2 row). If either is missing this becomes a
Checkpoint-B blocker on the S6 frozen frame.

### P2 — carried, with named remedies

**P2-A · The pin budget stops at the actuator's release instant and never budgets its retraction, so
three states declared HELD pin a wheel in mid-motion.**
*Owner:* `alex:physics_author` (the skeleton already delegates: "physics_author recomputes at the
engine grid").
*Evidence:* the retraction is ANIMATED over `padTravelMs` — verified at `field_3d_renderer.ts`
`:50737-50739` (`u2 = Math.min(1, (tMs − relMs) / eng.padTravelMs)`), and `pad_travel_ms` is a live
authored field (`:1006`, default 1200 ms at `:50502`). tau authors ~0.7 s travel windows (S2:
4.2 → 4.89 s). Pin table L267-270: S4's last event is "match + withdraw **6.9 s**", pin **7.2 s** —
the wheel is 43% of the way home; S5 "withdraw **7.2 s**", pin **7.8 s** — 86%; S7 "replay end
**7.5 s**", pin **7.8 s** — 43%. §3's own beat-termination contract says each one-shot state "HOLDS
its end configuration for the remainder" — a retracting wheel is not the end configuration. The
sibling budgets this explicitly in every one-shot row ("wheel parked 7.4 s", pin 7.8 s), so this is
also a cross-document divergence on shared mechanism behaviour.
*Why P2 and not P1 (stated so this is not read as a downgrade):* every ASSERTED claim is true at the
pin — τ 0.00, α 0.00, ω held, chip matched. The defect is that the apparatus is mid-motion in a state
declared held; nothing false is taught.
*Remedy:* budget the last asserted event as **release + `pad_travel_ms`** and lengthen: S4 12 → 14 s
(park 7.63, pin 8.4, margin 0.77), S5 13 → 14 s (park 7.93, pin 8.4, margin 0.47), S7 13 → 15 s
(park 8.23, pin 9.0, margin 0.77) — or release earlier. Either way, author `pad_travel_ms`
explicitly; D4's scriptable-knob list omits it (P3-5).
*If unfixed:* Checkpoint B will see it in three frozen frames and I will raise it there.

**P2-B · The declared fallback exposes a signed drive control in a core-ring sandbox, and its ring
behaviour was never walked.**
*Owner:* `alex:architect`, via a one-line note into the physics block (the fallback is contingent).
*Evidence:* §3 S8's control list (L223) marks `tau_app` *(core — the taught variable, D5)*. D5
(L580-582): "Under D1's declared fallback (simultaneity cut), this token becomes the signed range
**[−2.0, +2.0]**." Negative torque and negative α are **extended-ring** content, taught only by S6,
which the `core_only` preset hides (§10 i-1, L398-402). So under fallback + `core_only` the explore
sandbox exposes a dial whose negative half no surviving state teaches — a direct Rule 38b breach in
the one preset the ring machinery exists to protect. §10(i-1)'s cut walk covers only the primary
design.
*Remedy (one line):* under the fallback, clamp `tau_app` to [0, 2.0] in the `core_only` preset — or
declare the signed half `min_ring: extended` so it is cut with S6, exactly as `tau_brake` is today.
*Related:* under the fallback S6's `τ_net = Iα` surface also loses its only referent (P3-4).

### P3 — notes and one-clause instructions (all carryable)

**P3-1 · The α sentence is not literally string-equal, and the sibling makes string-equality a PASS-2
gate.** Sibling handoff item (5): "verifies the sibling's parallel fix landed the IDENTICAL
Contract-1/2/3/4 text before PASS 2 freezes (the two documents' α sentences **must string-diff
equal**)." They do not — tau gives the grid formula and cites `:49737`, the sibling gives the publish
site and cites `:50219`. All three load-bearing clauses match, so there is no fork, but a literal
application of the sibling's own gate fails. *Remedy:* PASS 2 records ONE sentence and both documents
consume it — which is what both already claim to do. Suggested merged text: *"α is the per-step
finite difference of ω on the fixed 16 ms grid (`RBR_GRID_MS`, `:49737`), published from the same
post-step snapshot as I, ω, L and KE (`rbrWriteReadouts`, `:50220`), and blanked across re-pins
exactly as the other rows are."*

**P3-2 · `findings_d.md` §1 does not yet record the α decision both skeletons cite it for.** Its
current text (L101-108) says the two skeletons specified α two different ways, recommends the
post-step snapshot, and leaves the formula open: *"Which formula wins is a physics call for the
office."* Both REV-2 documents cite §1 as the site where the finite difference is "recorded". Since
Desk E freezes from PASS 2 (not yet written), this is a documentation obligation rather than a fork —
but PASS 2 must actually carry the decision, or the freeze source stays silent on the metric.

**P3-3 · S1's delta cue still says "spin", against the response table's claim.** §3 S1's cue is
"**No torque: spin unchanged**"; the FIX-CYCLE table claims titles **and cues** were converted to
"spin rate". "No torque: spin rate unchanged" is 5 words and fits the budget.

**P3-4 · S6 prints `τ_net = Iα` while only one torque acts, and §3 calls "net" the state's one new
thing** (L254-255) — while the title and delta cue say the new thing is the negative SIGN. The word
"net" gets an on-screen referent only at S8's tug, which the `core_only` preset cuts along with S6
(so the presets stay coherent) and which disappears entirely under the P1-8 fallback.
*Instruction for physics_author:* at S6 the new idea is the SIGN; narration must not present "net" as
the new idea, and under the fallback the surface degrades to `τ = Iα`.

**P3-5 · D4's scriptable-knob list omits `pad_travel_ms`** ("engage/release, arrow label text, park
pose") while six states author a 0.7 s travel and the engine default is 1200 ms (`:50502`). The field
is LIVE (`:1006`), so this is not a buy — but D4 is the row Desk E reads when it lifts the travel
logic off the brake-pad mesh, and the knob belongs in it.

**P3-6 · S3 → S4 resets ω 6.56 → 0 with the rig visibly re-posed.** Chaperoned and acceptable (the
class cycle 1 accepted for S4/S5), but one opening clause makes it airtight: name the fresh start
("a fresh run — this time from rest, with the masses moved in"), so the largest ω reset in the
concept is narrated rather than merely accompanied.

**P3-7 · Rule 41a wording in two authored strings.** S6's narration clause (L221) reads "at rest it
only **grips**" — "grip" is named explicitly in Rule 41a's ban list; "at rest it only holds the wheel
still" is the plain replacement. §3 S5's beat prose says "ω **races** 0 → 5.80"; that is authoring
prose, but physics_author must not echo it into narration.

**P3-8 · The formula-surface citation the sibling corrected was not adopted here.** tau's D8 cites
`:50570-50574` as where the static per-state string is set; the sibling's P2-10 records `:50448` as
the styling site and `:50570-50574` as the **rebuild call site**. Same fact, sharper citation — worth
aligning in PASS 2 so Desk E does not reconcile it twice.

### `engine_queue`

**Empty.** Every finding above is authoring-side (`alex:*`) or a documentation obligation on the
dispatching session. P1-A has an engine CONSUMER (D3's τ row, built by
`peter_parker:field3d_surgeon` at 0c-3), but the defect is in the AUTHORED metric, so it routes to
`alex:physics_author` and reaches Desk E through PASS 2 — not through an engine dispatch. No
`FIX(engine)` verdict, blocking or ride-along, is filed at this checkpoint.

---

## Candidate scar rows (report-only — the dispatching session files these)

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES (
  'readout_displays_the_authored_input_where_the_physics_resolves_a_different_value',
  'A HUD row defined as the authored schedule value contradicts the concept own law at the instants where the engine resolves something else',
  'CRITICAL',
  'alex:architect',
  'The tau readout in tau_eq_i_alpha REV 2 is specified as the signed AUTHORED schedule value (+drive - brake). At a friction rest clamp, and at the explore state static hold, the physics resolves net tau = 0 while the display prints the brake full magnitude beside alpha = 0.00 - so the frozen S6 pin archives tau != I*alpha in the concept whose atomic claim is tau_net = I*alpha.',
  'Every readout row naming a quantity the engine also USES must display the value the integrator resolved at t, never the value the JSON authored. A skeleton defining a readout as the authored value must walk every instant where the resolved value differs (clamps, holds, sign flips) and show the taught law still reads true on the HUD.',
  'js_eval',
  'At each state frozen pin, read the HUD rows and assert the taught relation holds among them to display precision (here |tau - I*alpha| <= 0.01). Any state where the relation fails is a defect, including states where both sides are near zero.',
  'OPEN',
  ARRAY['tau_eq_i_alpha']::text[],
  ARRAY[]::text[],
  'founder_proxy Checkpoint A cycle 2, tau_eq_i_alpha, 2026-08-04',
  'incident'
);

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES (
  'pin_budget_ends_at_the_actuator_release_instant_and_omits_its_animated_retraction',
  'A one-shot state declared HELD pins its frozen frame while the actuator is still travelling back to park',
  'MAJOR',
  'alex:architect',
  'The rbr actuator retraction is animated over padTravelMs (field_3d_renderer.ts:50737-50739). tau_eq_i_alpha REV 2 budgets pin margins from the RELEASE instant, so S4/S5/S7 pin 43-86 percent through the retraction - contradicting the document own beat-termination contract that each one-shot state holds its END configuration.',
  'For any actuator with an animated travel, the last asserted event is release + travel_ms (the PARKED pose), not the release instant. Pin margins are computed from the parked instant and state durations sized so 0.60R lands after it.',
  'js_eval',
  'At the frozen pin, assert every actuator mesh sits at either its park pose or its contact pose within one grid step - never strictly between them.',
  'OPEN',
  ARRAY['tau_eq_i_alpha']::text[],
  ARRAY[]::text[],
  'founder_proxy Checkpoint A cycle 2, tau_eq_i_alpha, 2026-08-04',
  'incident'
);
```

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES (
  'declared_descope_fallback_is_never_walked_through_the_ring_cuts_it_survives_into',
  'A designed fallback changes an explore control range and no preset-cut walk is re-run for the fallback case',
  'MAJOR',
  'alex:architect',
  'tau_eq_i_alpha REV 2 documents a fallback in which the explore state core-ring tau_app control becomes signed [-2.0, +2.0]. Negative torque is extended-ring content (taught only by S6, hidden under core_only), so the fallback breaks Rule 38b in the preset the ring machinery exists to protect. The ring-cut walk covers only the primary design.',
  'A declared fallback is a design, not a footnote: re-run the ring-cut walk, the explore-controls gate and the formula-surface check for the fallback case, or state that the fallback inherits them unchanged and show why.',
  'manual',
  'For each declared fallback in a skeleton, re-read section 10 (i-1)/(i-2) substituting the fallback controls and surfaces; every surviving control must map to a surviving state in every preset.',
  'OPEN',
  ARRAY['tau_eq_i_alpha']::text[],
  ARRAY[]::text[],
  'founder_proxy Checkpoint A cycle 2, tau_eq_i_alpha, 2026-08-04',
  'incident'
);

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES (
  'paired_documents_assert_verbatim_identity_for_a_sentence_that_is_not_string_equal',
  'A reconciliation is declared string-diffable and made a freeze gate while the two copies differ in wording and citation',
  'MODERATE',
  'alex:architect',
  'Both Desk-D skeletons carry the reconciled alpha metric and one makes string-equality a PASS-2 freeze condition, but the two sentences differ (grid formula + :49737 versus publish site + :50219). The semantics agree on all three clauses so the fork is closed - but the stated verification fails on a literal read, and a later reader cannot tell agreement from drift.',
  'When two documents must agree on a shared definition, put the sentence in ONE third document and have both quote it by reference. Never assert verbatim identity between two copies unless a diff was actually run.',
  'manual',
  'Extract the declared-shared sentence from each document and diff them; any difference beyond whitespace either fails the claim or must be recorded as a deliberate variant.',
  'OPEN',
  ARRAY['tau_eq_i_alpha','rotational_kinematics']::text[],
  ARRAY[]::text[],
  'founder_proxy Checkpoint A cycle 2, tau_eq_i_alpha, 2026-08-04',
  'incident'
);
```

---

## RUBRIC (advisory, unratified — `docs/EXEMPLAR_RUBRIC.md`; did not affect the verdict)

Checkpoint-A subset (D1/D2/D8/D9/D10 are the five answerable from a skeleton).

```
D1 1 · D2 2 · D8 2 · D9 2 · D10 2   = 9/10
```

**Weakest two:**

- **D1 information gain (1)** — unchanged from cycle 1 and unchangeable this cycle (the lesson was
  frozen by instruction). S3 remains the state whose deletion would cost least: S1 already
  establishes "no net torque ⇒ ω constant" as a general fact, so a student holding S1 can answer S3's
  own distractor. The P1-7 continuity fix does improve it — S3 now holds a *driven-up* 6.56 rather
  than a re-posed 3.00, so "the speed the torque built is kept" is a visibly different claim from
  S1's "the speed it always had is kept". (Evidence: §2 S1 vs S3 purposes; §3 both `null-result-hold`,
  declared contrast pair. The sibling independently records its own S3↔S4 link as its thinnest, so
  the chapter has one thin link per concept rather than a pattern of padding.)
- **D10 explore earns its place (2, with a caveat)** — every dial is load-bearing and ring-gated, and
  the τ_net tug is a demonstration no whiteboard performs. The caveat is not the dials: the named
  headline demo currently renders a HUD that contradicts the taught law at its most reachable corner
  (P1-A), and the documented fallback is not ring-walked (P2-B). Both are fixable outside the design.

This section did not change the verdict; the verdict is what it would have been without it. No
threshold is quoted and no grade is claimed — `EXEMPLAR_RUBRIC.md` §6.1's numbers are unratified.

---

## Handoff

`DESIGN_OK`. The skeleton proceeds to `alex:physics_author`, and the sibling may proceed against the
identical shared-contract text.

**Carried into the physics block — physics_author must land all five:**
1. **P1-A** — the τ metric sentence, verbatim above, plus the S6 and S8 rows it corrects.
2. **P2-A** — recompute the pin table with release + `pad_travel_ms` as the last asserted event;
   S4 → 14 s, S5 → 14 s, S7 → 15 s (or release earlier).
3. **P2-B** — one line on the fallback's ring behaviour.
4. **P3-3 / P3-4 / P3-6 / P3-7** — S1's delta cue; "net" is not S6's new idea; the S3 → S4 fresh-start
   clause; "grips" → "holds the wheel still".
5. The standing cycle-1 P2-5 instruction (S5 reads the 4.64 off the instruments and never invites an
   r² computation).

**Carried into `findings_d.md` PASS 2 — the dispatching session:** the corrected τ metric (P1-A) as
the merged D3/K2 row's definition; the ONE α sentence (P3-1) so both skeletons' by-reference claims
become true by construction; the record that §1 now carries the α decision it is cited for (P3-2);
the `pad_travel_ms` knob in the actuator row (P3-5); the sharper formula-surface citation (P3-8).

**Checkpoint C must diff, not accept:** P1-A at both landing sites; P2-A's recomputed durations;
P2-B's ring line. P1-A is the one that closes the concept at Checkpoint B if it is silently skipped.

**Founder ruling still open (unchanged from cycle 1):** accept the unbuilt `torque` /
`moment_of_inertia` prerequisites with the computing patches (my recommendation), or re-sequence the
wave. The sequencing call is the founder's.

**No repo file other than this report was written. No agent was dispatched, no SQL applied, no `src/`
file touched.**
