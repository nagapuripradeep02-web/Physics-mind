# CHECKPOINT A — `rotational_kinematics` (rotmech · Desk D · 0b design pass, REV 2) — CYCLE 2 of 2

**VERDICT: `DESIGN_OK`** — with ONE named, blocking pre-freeze obligation (F-1) and eight recorded
carry items. `physics_author` is authorised. **0c-3's scope must NOT freeze until F-1 lands.**
founder-proxy, 2026-08-04 · desk `feat/rotmech-d` · reviewed `skeleton.md` (REV 2, 459 lines) against
`skeleton_rev1.md`, `founder_proxy_A.md` (cycle 1), the sibling `tau_eq_i_alpha/skeleton.md` (REV 2,
889 lines), `_engine/findings_d.md` (446 lines), `APPARATUS_CONTRACT.md`, and
`field_3d_renderer.ts` re-read directly at the lines the reconciled sentences cite.

---

## The one-paragraph judgment

**The fork is closed in substance on all four reconciled items, and every one of cycle 1's eight P1s
has landed in the body, not just in the response table.** I diffed the two documents item by item:
the α metric now agrees clause for clause (per-step finite difference of ω · same post-step snapshot
· blanked across re-pins) and I re-tested it at every edge both concepts author — rest clamp, live
dI/dt, engage edge, re-pin — and found no case where the two documents' wording produces different
engine behaviour; there is exactly ONE actuator mesh and neither side has reintroduced a second
(the sibling's floating tangential arrow is dropped as the actuator and its rim force arrow is
layered on this wheel; its D7 per-particle arrows are a different family, not an actuator); the
signed-torque semantics live in `findings_d.md` §1 on both sides; and the ω₀ floor is one ask,
two sites (`:49999` + the `:50075` write guard), explore-only, in near-identical text on both sides.
The lesson was genuinely not redesigned — I diffed §2 against REV 1 and the state list, ids, rings,
titles and every number are byte-identical except the two changes the response table declares
(S1 "rim marker" to "drum stripe", S5 gains `misconception_confrontation`).

**What remains is not a fork between the two skeletons — it is that the file they both point at has
not been updated to hold what they point at it for.** `findings_d.md` §1 still reads *"Desk D's two
skeletons independently specified it two different ways… Which formula wins is a physics call for
the office"* — the unreconciled state, preserved verbatim in the one document Desk E freezes from,
while §8 explicitly invites an early freeze around items 1–5. Both skeletons are self-declared
non-canonical. So today the reconciled α ruling exists in **no canonical location**, and a freeze
taken before PASS 2 could still ship τ/I — the definition this concept retired, and the one that
produced cycle 1's false S5 pin frame. That is a documentation defect in a file whose PASS 2 the
dispatching session already owes (this skeleton's own handoff item 5 names the check), not a design
defect the architect can be sent back for. Hence `DESIGN_OK` with F-1 as a hard gate rather than a
third cycle that would edit the wrong file.

Five smaller cross-document items (F-2 … F-6) are genuine "shared, still described differently"
findings the merge must resolve; three (F-7 … F-9) are carries into `physics_author` / 0d. None
blocks the physics block.

---

## Primary job — the four reconciled items, verified by direct comparison

### 1. α = the per-step finite difference of ω — **AGREES (semantics), does NOT agree (text)**

| | text |
|---|---|
| this skeleton, K2 + §3 metrics (identical in both places) | *"α is the per-step finite difference of ω, published from the SAME post-step snapshot as I, ω, L and KE (`rbrWriteReadouts`, `field_3d_renderer.ts:50219`), and blanked across re-pins exactly as the other rows are."* |
| sibling, D3 | *"α = the per-step finite difference (ω_k − ω_{k−1})/h on the 16 ms grid — the SHARED chapter definition (shared item 1), recorded at findings_d §1… Both publish from the same post-step snapshot as I/ω; both BLANK during re-pin blank windows."* |

- **Changed everywhere in this document:** the analytic τ_signed/I form appears NOWHERE in REV 2 —
  grepped. K2 carries the finite difference, §3's readout-metrics block carries the identical
  sentence, and the §2 ground-truth block carries the correct consequence (*"in every steady drive
  window the finite-difference α equals the internal τ/I exactly… the ONLY behavioural difference is
  at clamps and edges"*). The §3 metrics row was the specific place the dispatch asked me to check;
  it is fixed. ✓
- **Semantically identical.** I tested the two wordings at all four edges: rest clamp (both → 0.00
  the step after the clamp binds), live dI/dt (both honest — the difference of the actual ω), engage
  edge (both → full value one step after contact, which is what S3's narration asserts), re-pin
  (both blank). No divergence. The metric is also implementable closed-form — `rbrWriteReadouts`
  evaluates everything at `tMs` (verified: the function opens at `:50220`, the one-snapshot line is
  `:50230`), so α = (ω(t) − ω(t−h))/h needs no accumulator and stays time-pin exact (Rule 36). ✓
- **NOT string-diffable.** The two sentences differ in wording. This skeleton's row-155 disposition
  and K2 both claim they are *"shared verbatim (string-diffable)"*; the sibling claims the shared
  definition is *"recorded at findings_d §1"*. Neither claim is true today. The skeleton's own
  handoff imposes exactly this test on PASS 2 (*"the two documents' α sentences must string-diff
  equal"*) — as literally written, that precondition **fails right now**. → F-1, F-2.

### 2. ONE motor drive wheel — **AGREES on the mesh, DIVERGES on its visibility rule**

Neither side has reintroduced a second actuator: this skeleton's K8 is the surviving spec ("ONE
torque-agent mesh for both Desk-D concepts"), the sibling's D4 says so in the same words and
explicitly drops REV 1's floating tangential arrow *as the actuator*. Both carry findings_d §4b's
travel-wiring fact identically (`padEngageMs` assigned only in the brake branch `:50521-50526`;
travel gated on `rbr_brake_pad` `:50729-50744`; `eMs` = Infinity). The sibling's D7 tangential force
arrows are per-particle mass arrows for one advanced state — a different family, correctly priced
with D4 on the shared FORCE map, while this concept's K4 velocity arrows ride their OWN map. That
reconciliation is stated on both sides. ✓

**But the two documents hand Desk E two visibility rules for the one mesh** — K8: *"built once at
scene build; **per-state visibility only**"*; D4: *"**visibility follows the SOURCE** like the pad's
does (drive active ⇒ wheel in contact + arrow on; release ⇒ wheel withdraws, arrow leaves with it) —
never a stray overlay."* I walked all 9 states here and all 8 there: no authored state diverges
under either rule, so this is not a live contradiction — but it is one mesh with two build rules in
the merged union. → F-3.

### 3. Signed-torque semantics consumed BY REFERENCE — **the sibling restates nothing; this one does**

The sibling's D1 is clean: it names findings_d §1 as canonical, states *"NEITHER skeleton restates
or redefines them"*, and then lists only the engine-shape requirements its own concept adds.

This skeleton's K1 says *"The canonical semantics live in `findings_d.md` §1 and are consumed here BY
REFERENCE — this document defines nothing"* and then, in the same sentence, paraphrases them:
*"brake = frictional, opposes the spin, keeps the rest clamp, never reverses; applied = signed driven
torque, closed form L(t) = L_anchor + τ_signed·engaged_seconds(t), no rest clamp, may carry L through
zero."* I checked the paraphrase clause by clause against findings_d §1 (`:34-59`, `:91-99`,
`:110-120`) and against the sibling's probe list — **it is faithful**: "may carry L through zero"
matches the sibling's bring-up probe (d) *"assert a smooth sign change with NO clamp event"*, and the
rest clamp as brake-only matches §1's *"The rest clamp must survive as a brake-only behaviour"*. So
there is no semantic fork. But "this document defines nothing" is false of the document that writes
it, and a paraphrase is the exact surface the scar exists to keep out of consuming documents.

**Scar row 155 is NOT dispositioned honestly on this side.** Line 453 asserts *"BOTH skeletons
consume BY REFERENCE and restate nothing; the α metric is ONE reconciled sentence shared verbatim
(string-diffable with the sibling's D3)"* — two claims, both false as written (the K1 paraphrase
exists; the α sentences are not verbatim). The underlying fork IS closed; the disposition overclaims
how. The sibling's row-155 handling (D1's "NEITHER skeleton restates") is accurate for itself and
inaccurate only about this one. → F-2.

### 4. ONE reconciled ω₀ floor ask — **AGREES** ✓

Office item 2 here: *"lower the ω₀ floor to 0 at both sites — `RBR_SLIDER_SPEC.omega0.min` (`:49999`)
AND the live-write guard `if (!(value > 0)) return;` (`:50075`). Explore state only."* Sibling
B.2/D2: identical two-site ask, identical explore-only scope, explicitly *"supersedes REV 1's 'keep
the floor'"*. findings_d §1 (`:76-81`) already carries the same reconciled text. Cycle 1's
contradiction is gone on both sides. Re-verified in code: `omega0.min: 0.5` is at `:49999` ✓; the
write guard is at `:50076` (all three documents cite `:50075`, the branch head — off by one, but
**identically** off on all three sides, so it is not a fork). Both sides also correctly narrow the
*authored* `omega0_rad_s: 0` to "already works today" (`:50497` → `rbrNum` `:49828`). ✓

### Cross-check of the two ENGINE REQUIREMENTS digests beyond the four

Walked K1–K10 against D1–D10. Shared surfaces: the α row (item 1), the actuator mesh (item 2), the
signed integrator (item 3), the ω₀ floor (item 4), `RBR_RO_META` insertion, the `external_torque`
enum, `deriveStateMeta` §6b, the arrow-length maps, the loud warn. Agreements found: loud warn (both
carry findings_d §2's request in intent), `deriveStateMeta` (K10 ≡ D10 — both "ships WITH K1/D1",
both name their own three from-rest states), arrow maps (explicitly reconciled on both sides),
α label/unit/dp (`{ label: "α", unit: " rad/s²", dp: 2 }` — identical), the `readouts` union
(θ + α here, α + τ there — disjoint additions, no conflict), HUD order (both correctly note it is the
authored array order and both refer the `RBR_RO_META` insertion position to the office).

**Three further shared things are still described differently:** the α row's Unicode-minus discipline
(F-4), the `sources[]` vs singular `external_torque` shape (F-5), and the enum-closure scope (noted
inside F-6). All three land in the merge; none is a contradiction between the two designs.

---

## The ruling you asked for: an EMPTY advanced ring under Rule 38a

**Ruling: an empty advanced ring is COMPLIANT. The K6-descope path (8 states, S8 dropped) does not
violate 38a, and the architect's choice — drop the state rather than author the fallback that
collapsed S8's idea into S2's — was right on both counts.**

Read as written, 38a imposes three things: (i) every state carries a `depth_ring`; (ii) the advanced
ring is a contiguous block immediately before the explore state; (iii) hiding advanced (then
advanced+extended) leaves a coherent lesson with no surviving state referencing hidden-ring content.
(i) holds in the 8-state case (S1–S6 core, S7 extended, S9 explore). (ii) constrains the ring's
POSITION when it exists — an empty set is trivially contiguous and there is nothing to place. (iii)
is the clause that actually protects the student, and the skeleton re-walks it: the 8-state cut is
identical to the already-verified hide-advanced cut, nothing surviving names d/dt, a graph or a
slope, `entry_state_map.calculus_graphs` is removed, and `no_calculus` and `full` coincide.

**Precedent settles it empirically, not only by reading.** The shipped fleet already contains
concepts with zero advanced-ring states — `friction_force` (5 states, 0 advanced) and
`equilibrium_of_particles` (7 states, 0 advanced), both post-Rule-38 and both sealed. A reading of
38a that the fleet's own baseline-locked concepts violate is the wrong reading.

**Rider, and it matters more than the compliance question.** Compliant is not the same as as-good.
S8 is this concept's ONLY derivative/graph representation, and ω = dθ/dt is where JEE Advanced,
A-level and AP Physics C actually sit. If K6 is descoped the concept ships teaching-complete for
CBSE/NEET/JEE Main and **short of its ceiling for the international rings** — a real quality loss,
not a neutral scope trim. Per the PRIME DIRECTIVE the correct posture is: build K6 if Desk E can. If
it is descoped, record `rotational_kinematics` as **revisit-when-K6-lands**, not as complete, and
drop the advanced-ring curriculum claims in the same breath (F-7).

---

## Per-state design table (Checkpoint-A form) — every state, including explore

| State | One idea | Distinct from predecessor? | Ring | Entry config buildable? | Cycle-1 defect | Verdict |
|---|---|---|---|---|---|---|
| S1 | θ = the angle turned, in radians from a start line | baseline (`reveal-build`) | core | r 0.80 · ω +1.50 · home pose ✓ | P1-4 | **OK** — origin fixed (all references live from t = 0, glow-sync only, budget re-derived to 4.19 s); carry F-8 |
| S2 | ω = radians per second | new quantity; `equal-time-ticks` | core | ✓ | P3-3 | **OK** — three ticks at 1.50 / 3.00 / 4.50 rad; carry F-6 (tick frame) |
| S3 | α = the rate ω changes | new quantity + new actuator | core | ω₀ 0 authorable today ✓; needs K1 | P2-2, P1-6 | **OK** — the travel window `[1.1, 2.0] s` IS the Rule-32a beat; K10 carries §6b verbatim and names S3/S7/S8 |
| S4 | ω = ω₀ + αt used to PREDICT — the aha | linear↔angular identity; `converge-on-mark` | core | ✓ chip surface LIVE | (D1 note) | **OK** — thinnest link in the arc, unchanged and recorded (F-9a) |
| S5 | Slowing down is negative α | sign flip; declared contrast pair of S3 | core | ✓ brake LIVE | P1-2 | **OK** — finite-difference α reads 0.00 the step after the clamp; `release_at_ms: 5000`, pad parked 5.9 s; the 6.6 s pin photographs *stopped, α 0.00, pad parked* |
| S6 | v = ωr — one ω, many speeds | supporting aha; `paired-tangent-ride` | core | ✓ | P2-8, P2-9 | **OK** — rod-height + colour separation declared; `rbr_v_arrows` group token registered in K4 and named in §4, §10(b), the walk and scar rows 30/61/81 |
| S7 | θ = ω₀t + ½αt², ticks 1:3:5 | second equation; contrast pair of S2 | extended | ω₀ 0; needs K1 | P1-3 | **OK** — `start_ms: 2000` authored in K5 AND the S7 row; re-derived independently: ticks at engine t 3/4/5 s → θ 0.30 / 1.20 / 2.70, increments 1 : 3 : 5 ✓ |
| S8 | ω = dθ/dt, α = dω/dt — rate IS slope | new representation; `slope-trace` | advanced | ω₀ 0; needs K1 + K6 | P1-8 | **OK** — no fallback authored; descope = DROP, ring-cut re-walked; see the 38a ruling + F-7 |
| S9 | Sandbox — ω₀ and α live | explore; core content only ✓ | *(explore)* | ω₀ 1.50 · `engage_at_ms: 0` · τ 0 | P1-7 | **OK** — one concept-wide α range on the per-concept `slider_controls` path (`:50005`, typed `:2181`); no per-state override assumed anywhere; wheel visibility stated (P3-6) |

Ring cuts re-walked independently this cycle for all three cases (drop S8; drop S7+S8; the 8-state
descope): coherent in each, no surviving state references hidden content, both explore controls are
core and survive every cut, and the explore formula surface `ω = ω₀ + αt` is stated and performed by
S4 (core) under every preset ✓. 38b ✓ · 38c ✓ (Δ-notation core, d/dt confined to S8; in the 8-state
case no calculus appears at all) · 38d ✓ (no board-dialect trap; "battery"/"cell" never arises) ·
38f ✓ · 38g ✓ except F-7. Rule 41 re-checked over every changed string (titles, the nine delta cues,
both anchor sentences, every narration fragment): literal, no idiom, no personification ✓. Rule 34:
one formula surface per state, all Unicode except the minus (F-4) ✓. Gate 0: grepped for
TBD / TODO / "to be decided" — **zero** ✓.

---

## FINDINGS

### F-1 · P1 · BLOCKING on the 0c-3 freeze, not on `physics_author`. The canonical file does not contain the ruling both skeletons consume from it.
`_engine/findings_d.md` §1 (`:101-108`) still reads: *"Desk D's two skeletons independently specified
it two different ways — a per-step finite difference of ω, and τ_signed/I… **Which formula wins is a
physics call for the office**; that it is ONE formula is not negotiable."* The desk edited this file
during cycle 1 (the `DESK-D RULING (fix cycle 1, 2026-08-04)` block on the tug is at `:91-99`), so
the α paragraph was simply not updated alongside it. Meanwhile the sibling's D3 asserts the shared
definition is *"recorded at findings_d §1"* — it is not — and both skeletons declare themselves
non-canonical (this one: *"NOT the freeze source"*). Compounding it, §8 (`:445-446`) tells Desk E:
*"if 0c-3's scope must freeze before PASS 2 lands, freeze it around §8 items 1–5."* Item 2 is the
readout rows. A freeze taken on that instruction today inherits an undecided α formula — and τ/I is
the one that prints −0.50 rad/s² on a stopped turntable in S5 (cycle 1's P1-2).

**Required before 0c-3 freezes (dispatching session, in PASS 2):** replace findings_d §1's α
paragraph with the ruling as a single quoted sentence marked canonical, and make both skeletons' α
text a verbatim quote of it. Recommended canonical wording — the sibling's, which is strictly more
specific, plus this document's snapshot citation (line-corrected) and F-4's minus clause:

> *α is the per-step finite difference of ω — (ω_k − ω_{k−1})/h on the fixed 16 ms grid — published
> from the SAME post-step snapshot as I, ω, L and KE (`rbrWriteReadouts`, `field_3d_renderer.ts:50220`;
> the one-snapshot line is `:50230`), blanked across re-pin blank windows exactly as the other rows
> are, and printed with a real Unicode minus (U+2212) on every text path.*

*Owner if this were routable: `alex:architect` (both skeletons) plus the dispatching session
(findings_d). It is deliberately NOT routed as a fix cycle — cycle 2 is the last, and the edit that
closes it is in a file the architect's revision does not own.*

### F-2 · P2 · The response table and scar row 155 claim precision the body does not have.
Three specific overclaims: (a) FIX-CYCLE row Contract-3 — *"this skeleton (like the sibling) consumes
them by reference, **restates nothing**"* — while K1 paraphrases the semantics in the same sentence
that disclaims defining them (the paraphrase is faithful; the claim is not); (b) K2 and §3 —
*"shared **verbatim** with the sibling (string-diffable)"* — the sentences differ in wording; (c) scar
row 155's disposition repeats both. The skeleton's own handoff item (5) makes *"the two documents' α
sentences must string-diff equal"* a PASS-2 precondition, so the false claim is also a gate that
currently fails. **Required:** on adopting F-1's canonical sentence, either delete K1's paraphrase or
re-label it "non-normative summary — findings_d §1 governs", and rewrite row 155's disposition to
what is actually true: *the fork is closed; the semantics live in findings_d §1; each document
quotes, none defines.*

### F-3 · P2 · Two visibility rules for the one shared actuator mesh.
K8 (*"per-state visibility only"*) vs D4 (*"visibility follows the SOURCE… never a stray overlay"*).
No authored state on either side diverges under either rule (walked all 17), so nothing is broken —
but Desk E must not receive two rules for one mesh. **Required in PASS 2, one sentence:** existence
is per-state (the exact-token `visible_elements` gate, `:50581-50587`); contact pose and turning are
driven by the state's torque-source engage window (the lifted `padEngageMs`/`padReleaseMs` travel);
the sibling's rim force arrow is gated on the source so it can never outlive the withdrawal.

### F-4 · P2 · The shared α row carries the Unicode-minus discipline on one side only.
The sibling's D3 requires α and τ *"SIGNED with a real Unicode minus (U+2212) on every text path (the
FIXED `ascii_minus_in_oncanvas_math_from_tofixed` sweep discipline)"*. This skeleton's K2 does not,
and its Rule-34c list (*"θ ω α ω₀ ½ π ² Δ"*) omits the minus — yet this is the concept that prints
α = −0.50 for the whole of S5 and negative α across the S9 slider range, straight out of `toFixed`,
which emits ASCII hyphen-minus. The union will carry it because the sibling does; **PASS 2's merged
α row must state it explicitly** so it cannot be lost in the merge. *(Evidence note: the LIVE
`engine_bug_queue` was unreachable this session — Cloudflare 525 then 522 on two attempts — so that
row's FIXED status is cited from the sibling's verbatim reference, not re-queried.)*

### F-5 · P2 · `sources[]` vs the singular `external_torque` block — the back-compat clause is written nowhere.
The sibling's D1 buys a **structural** change: *"a `sources[]` list (each entry: type, signed τ, its
own engage window) summing to τ_net, `rbrBrakedSeconds` split per source, and every `eng.tau > 0`
guard widened to `!== 0`"*. This skeleton never mentions `sources[]`; all nine of its states author
the existing singular engagement surface (`:1002-1006`, `engage_at_ms` / `release_at_ms` /
`pad_travel_ms`), and its scriptability walk classifies every authored millisecond against that
shape. Neither document says whether the singular block survives. **Required in PASS 2:** a singular
authored `external_torque` remains valid and is exactly equivalent to a one-entry `sources[]` —
otherwise this concept's entire state table is authored against a shape 0c-3 may replace, and
`json_author` discovers it at 0d.

### F-6 · P2 · K5 never says which FRAME the ticks are fixed in.
K5 buys ticks that *"land on the r_ref = 0.50 m circle at the stripe's position"* and persist. If
Desk E adds them to the `spin` group they turn with the body, and S2's whole picture — three marks
standing still, equally spaced, measured against the space-fixed start line — does not occur. This is
the spatial twin of cycle 1's P1-3 (time origin), on the same primitive. **Required in PASS 2:** the
ticks are BASE-frame (space-fixed), like the K3 start line; only the stripe rides the `spin` group.
*(Same paragraph should carry the index range: both consumers imply k = 1…count — S2 `start_ms 0` →
1/2/3 s, S7 `start_ms 2000` → 3/4/5 s — but K5 writes `start_ms + k·every_ms` without saying so.)*
*(Enum-scope note, P3: K1 adds `'applied_torque'` to the `external_torque.source` enum and leaves the
two never-implemented members untouched, while D1 asks to "drop or explicitly defer" them. Compatible
outcomes; name one in the merge.)*

### F-7 · P2 · The descope case drops the advanced ring but not the advanced curriculum claims.
DoD (i-1) handles the 8-state case for coherence and removes `entry_state_map.calculus_graphs`, but
(i-3) still claims *"JEE Main core+extended+advanced"* and *"AP Physics 1 and C"*. Under Rule 38g tags
are CLAIMS; with S8 gone the concept has no derivative or graph content, so those cells become false
claims rather than unverified ones. **Required (json_author at 0d, conditional on Desk E's K6
ruling):** in the 8-state case the advanced-ring curriculum cells are dropped or marked not-covered,
and the concept is recorded as revisit-when-K6-lands, never sealed as complete.

### F-8 · P2 · S1's asserted number is transient; the frozen pin cannot photograph it.
S1 is steady-continuous with R ≥ 10 s and a pin at 0.60R ≥ 6.0 s, but its asserted reveal — *"the
readout shows 6.28 rad"* — is true only at t = 4.19 s. At the pin the readout reads ≈ 9.00 rad and
the arc ≈ 2.72 rad (θ mod 2π). Nothing is wrong physically and the state still reads (start line,
stripe, growing arc, counting readout, the delta cue "θ: the angle turned"), but the pin-margin
table's own contract — *"the budgeted instant is the COMPLETION of the last asserted reveal"* —
implicitly assumes the reveal PERSISTS, which is true for the one-shot-hold states and for S2/S6 and
false for a numeral on a free-running counter. **Carry to `physics_author`:** word S1 so its held
claim is the picture (the arc grows, the readout counts the angle turned) and the 2π identification
is a glow-synced moment inside the run, not the frame the state is pinned on. Add S1 to the §3 list
of states THE EYE must read in DENSE frames.

### F-9 · P3 · Unchanged carries, accepted.
(a) S3 → S4 remains the arc's thinnest link — S3 already shows constant α driving ω 0 → 2.40 and S4
repeats it from ω₀ = 1.50; S4's genuinely new content is the identification with v = u + at plus the
prediction-first ritual (real, and the primary aha). Lesson frozen by instruction; recorded as the
first place to cut if a state ever must go. (b) Citation drift, harmless: `rbrWriteReadouts` is at
`:50220` (snapshot line `:50230`), cited as `:50219`; the ω₀ write guard is at `:50076`, cited as
`:50075` — identically on all three documents, so not a fork. Fix inside F-1's canonical sentence.
(c) findings_d §8 item 5 (θ/α `reference_marks[].surface` members) is still listed BLOCKING while
both skeletons declare those members out of scope; the handoff instructs PASS 2 to downgrade it —
that instruction must actually be executed, because §8's own early-freeze advice names items 1–5.

### Re-verification of every cycle-1 finding (response table vs body)

| Cycle-1 | Claimed | Verified in body |
|---|---|---|
| P1-1 | α reconciled, ownership yielded | ✓ analytic form gone from K2 **and** §3 metrics; residue = F-1/F-2 (location + wording, not semantics) |
| P1-2 | finite-difference α + `release_at_ms: 5000` | ✓ S5 row, §3 pin table (pin 6.6 s, pad parked 5.9 s), §4 watch, scar rows 6/150 |
| P1-3 | `time_ticks { start_ms?, start_cue?, every_ms, count }`, S7 `start_ms: 2000` | ✓ K5 + S7 row + scriptability walk + origin-evaluation check; numbers re-derived independently (0.30 / 1.20 / 2.70; 1 : 3 : 5) |
| P1-4 | option (a), no θ-zero bought, budget re-derived | ✓ S1 row, DoD (d), pin row (4.19 s → margin 1810 ms), scriptability walk (glow only), K3 (*"No reveal cues bought"*); residue = F-8 |
| P1-5 | one r_ref = 0.50 m, existing stripe | ✓ K3, K5, §3 geometry paragraph, S2/S7 rows; grepped "rim" — only the bicycle-wheel anchor prose and the sibling's rim force arrow remain; no state assumes a rim circle |
| P1-6 | K10 = findings_d §6b verbatim, names S3/S7/S8, ships with K1 | ✓ K10 |
| P1-7 | S5 slider dropped, one concept-wide range | ✓ K7, S5 row (controls "none"), Explicitly-NOT-required list, scar row 3 |
| P1-8 | descope = DROP S8, ring-cut re-walked | ✓ K6, DoD (i-1), §7 note; ruled compliant above; residue = F-7 |
| P2-1 … P2-11 | eleven fixes | ✓ all eleven land in the body — K8 tag corrected; the 0.7 s beat gone and `pad_travel_ms: 900` in S3/S4/S5/S7/S8; K1 zero-consumer argument + enum close; K2 loud warn; office item 3 reworded to the insertion position; office item 2 two-site; K4 rod-height layering + `rbr_v_arrows`; K6 right-half `top:52px+` zone; handoff yields ownership |
| P3-1 … P3-7 | six taken, one no-change | ✓ §2 marks S5 `misconception_confrontation`; S2 three ticks; `show_l_arrow` / `show_pull_arrows` / `show_r_line` / `show_grip_hand` / `ke_bar` authored OFF; handoff carries the §8-item-5 downgrade; S9 wheel visibility stated; S3↔S4 recorded |

**Lesson-frozen check:** diffed §2 against `skeleton_rev1.md`. The state list, ids, titles, purposes,
`teaching_method`s, rings and the entire numeric ground-truth paragraph are identical except the two
declared changes (S1 "rim marker" → "drum stripe"; S5's `teaching_method`). The lesson was not
redesigned. ✓

---

## Pass-1 scar check (what was actually checked)

The LIVE `engine_bug_queue` was **unreachable** this session (`query_engine_bug_queue.ts` returned
Cloudflare 525 then 522 from the dev Supabase host on two attempts, 12:45 and 12:47 UTC). Pass 1
therefore ran against cycle 1's own live query (the 157-row verbatim union reproduced in this
skeleton's SCAR AUDIT), the sibling's audit, and my cycle-1 report. Classes checked for recurrence in
REV 2, by name: `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field`
(closed in substance — F-1/F-2 are its residue) · `derived_readout_asserted_by_value_without_defining_its_metric`
(closed) · `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path`
(closed, both directions) · `skeleton_engine_rows_diverge_from_the_desks_own_verified_findings_file`
(**inverted this cycle** — the skeleton is now ahead of findings_d; that is F-1) ·
`bought_timed_primitive_omits_the_time_origin_the_beat_measures_from` (closed; its spatial twin is
F-6) · `descope_fallback_declared_without_pricing_the_engine_row_it_still_needs` (closed by dropping
the state) · `derived_rate_readout_keeps_its_driving_value_after_the_engine_clamps_the_motion_to_zero`
(closed) · `explore_controls_not_ring_gated_survive_the_ring_cut` ✓ ·
`explore_state_formula_surface_asserts_a_relation_no_state_derives` ✓ ·
`state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` ✓ (via `rbr_v_arrows`) ·
`ascii_minus_in_oncanvas_math_from_tofixed` (**recurrence risk — F-4**, and the one class I could not
re-query). **No cycle-1 finding recurs.** The unqueried-table limitation is recorded here rather than
papered over; if the dispatching session can reach the table, re-check F-4's row status before PASS 2.

---

## engine_queue

**Empty by construction.** Every finding is a defect in DESIGN DOCUMENTS; no built artifact exists and
no shipped engine code is implicated. Nothing here is `FIX(engine)` and no `peter_parker:*` owner is
routed. The 0c-3 build is dispatched from `findings_d.md` PASS 2, not from this report — which is
exactly why F-1 through F-6 are written as PASS-2 obligations, with the text they need.

---

## Candidate scar rows (report-only — the dispatching session files these; founder-proxy applies no SQL)

```sql
-- 1. UPSERT the live directive (do NOT mint a new class): cycle 2's lesson is that two documents
--    can reconcile with EACH OTHER while the canonical file they both cite still records the
--    unreconciled state. Extends the probe to check the reference TARGET, both directions.
INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field',
 'Paired skeletons reconciled a shared bought field with each other while the canonical file they both consume it from still recorded the unreconciled state',
 'CRITICAL','alex:architect',
 'Cycle 1 fixed the divergence: both rotmech Desk-D skeletons adopted the finite-difference alpha metric and yielded ownership to the desk findings file. Neither document updated that findings file. Its section 1 still presented both candidate definitions and deferred the choice to the office, while its priority table invited an early scope freeze around the items containing that row. Both skeletons declared themselves non-canonical, so the reconciled ruling existed in no canonical location. One document also declared it restated nothing while paraphrasing the semantics in the same sentence, and both claimed their metric sentences were verbatim-identical when they were only semantically equivalent.',
 'Consuming a shared definition BY REFERENCE has three obligations, not one: (a) the referenced section must CONTAIN the definition as a single quoted sentence marked canonical, (b) each consuming document quotes it byte-identically and paraphrases nothing, not even as a summary, and (c) the reference is verified by reading the target, not by citing it. A reconciliation recorded only in the documents that were forked is not recorded. Any claim of verbatim sharing is a testable claim: test it before writing it.',
 'manual',
 'For every engine row consumed by more than one document: (1) open the cited canonical section and assert the quoted sentence is present, marked canonical, and free of alternatives or deferrals; (2) extract the sentence from each consuming document and diff literally against the canonical - assert zero differences; (3) grep each consuming document for a second statement of the same semantics (a summary, a paraphrase, a bullet gloss) and assert none exists. Reference failures 2026-08-04: rotmech 0c-3 - the alpha row, findings_d section 1 vs skeleton K2 vs sibling D3 (cycle 2); K2 vs D3 divergence (cycle 1).',
 'OPEN', ARRAY['rotational_kinematics','tau_eq_i_alpha']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_rotational_kinematics_cycle2', 'directive')
ON CONFLICT (bug_class) DO UPDATE SET
  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,
  probe_logic = EXCLUDED.probe_logic, concepts_affected = EXCLUDED.concepts_affected;
```

```sql
-- 2. NEW CLASS - F-6 (the spatial twin of cycle 1's time-origin class).
INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('bought_primitive_omits_the_reference_frame_it_is_fixed_in',
 'A bought visual primitive named its radius and its timing but never which frame it is fixed in, so the picture it exists to create depends on an unstated build choice',
 'MAJOR','alex:architect',
 'Equal-time tick marks were bought with a radius, a time origin, a count and a persistence claim, on a scenario whose renderer has both a base group and a spinning body group. The state picture - three marks standing still and equally spaced, measured against a space-fixed start line - only occurs if the ticks are added to the BASE group. Added to the spin group they ride the body and the measurement against the start line is lost, with nothing in the design saying which.',
 'Every bought primitive placed IN SPACE declares the frame it is fixed in (base / body / camera) alongside its position, exactly as a timed primitive declares its time origin. At design time, state for each new element which existing group it joins, and evaluate the state picture under the other choice: if the picture changes, the frame is load-bearing and belongs in the buy.',
 'js_eval',
 'For each new visual element in a skeleton ENGINE REQUIREMENTS row, assert the row names its parent frame or group. Where the element is compared against another element across time (spacing, alignment, sweep), assert both elements name frames and that the comparison is well defined in the pair named. Reference failure 2026-08-04: rotmech K5 time_ticks vs the K3 base start line, field_3d rigid_body_rotation spin group.',
 'OPEN', ARRAY['rotational_kinematics']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_rotational_kinematics_cycle2', 'directive');

-- 3. NEW CLASS - F-7.
INSERT INTO engine_bug_queue (bug_class,title,severity,owner_cluster,root_cause,prevention_rule,
  probe_type,probe_logic,status,concepts_affected,fixed_in_files,discovered_in_session,row_type)
VALUES ('descope_path_drops_a_depth_ring_while_the_curriculum_tags_still_claim_it',
 'A declared descope path removed the only advanced-ring state but left the curriculum tags claiming advanced coverage',
 'MAJOR','alex:architect',
 'The design named one engine row as its descope candidate and honestly declared that descoping it DROPS the single advanced state, re-running the ring-cut walk and removing the matching entry_state_map key. The curriculum_tags block was not re-run for that case, so the reduced concept would still claim coverage for the syllabus rings whose only content had just been removed. Rule 38g makes tags claims; an unrevised claim under a taken descope is a false one, not merely an unverified one.',
 'A descope path is a second version of the concept, and every ring-derived artifact must be re-run for it, not only the state list: the ring-cut walk, entry_state_map, presets AND curriculum_tags. State in the descope declaration which tag cells change and to what. A concept whose descope removes a ring is recorded as revisit-when-the-row-lands, never sealed as complete.',
 'js_eval',
 'For each declared descope or preset case in a skeleton: compute the surviving depth_ring set, then assert no curriculum_tags cell claims coverage of a ring absent from that set. Reference failure 2026-08-04: rotational_kinematics K6 descope drops the only advanced state while (i-3) still claims JEE Main advanced and AP Physics C.',
 'OPEN', ARRAY['rotational_kinematics']::text[], ARRAY[]::text[],
 'founder_proxy_checkpoint_A_rotmech_rotational_kinematics_cycle2', 'directive');
```

Also owed by the dispatching session (append, never fork the key): cycle 1's five candidate rows are
still unfiled as far as this desk's documents show — file them; and append `rotational_kinematics` to
the OPEN rows `teach_visual_must_match_narration`,
`derived_readout_asserted_by_value_without_defining_its_metric` and
`architect_declares_an_engine_limit_without_checking_the_per_concept_override_path`. Re-check the
status of `ascii_minus_in_oncanvas_math_from_tofixed` when the table is reachable (F-4).

---

## Key paths the founder should read first

1. `C:\Tutor\physics-mind-rotmech-d\docs\loop_runs\rotmech\_engine\findings_d.md` lines **101-108** —
   the α paragraph that still defers the choice to the office. This is F-1, and it is the only thing
   standing between this design and a clean handover.
2. `C:\Tutor\physics-mind-rotmech-d\docs\loop_runs\rotmech\rotational_kinematics\skeleton.md` K2
   (line 240) beside `C:\Tutor\physics-mind-rotmech-d\docs\loop_runs\rotmech\tau_eq_i_alpha\skeleton.md`
   D3 (lines 527-544) — the two α sentences side by side. They agree; they are not the same sentence.
3. `C:\Tutor\physics-mind-rotmech-d\docs\loop_runs\rotmech\rotational_kinematics\skeleton.md` line
   **453** (scar row 155's disposition), next to the handoff (line 459) that makes the same claim a
   PASS-2 precondition — the overclaim and the gate it fails.
4. `C:\Tutor\physics-mind-rotmech-d\docs\loop_runs\rotmech\rotational_kinematics\skeleton.md` K6
   (line 244) + DoD (i-1) (line 207) — the descope declaration the 38a ruling above covers, and the
   curriculum-tag consequence it does not.
5. `C:\Tutor\physics-mind-rotmech-d\src\lib\renderers\field_3d_renderer.ts:50220-50232` — the single
   post-step snapshot both documents build α on; the in-code comment already states the invariant.

---

```
RUBRIC (advisory, unratified - docs/EXEMPLAR_RUBRIC.md; did not affect the verdict)
Checkpoint-A subset (D1, D2, D8, D9, D10 - the five answerable from a skeleton)
  D1 2 · D2 2 · D8 2 · D9 2 · D10 2   = 10/10   (cycle 1: 9/10)
  weakest: D1 information gain - S4 is arithmetically S3's run with omega0 = 1.50; its
           genuinely new content is the identification with v = u + at plus the
           prediction-first ritual, which is real and is the primary aha
           (evidence: section 2 ground truth, S3 0 -> 2.40 at alpha 0.60 vs S4 1.50 ->
           3.30 at alpha 0.60; unchanged from cycle 1, lesson frozen by instruction)
           D10 explore earns its place - the two dials are now buildable as specified
           (concept-wide range on the real per-concept path, engage_at_ms 0, the two-site
           omega0 floor ask), but every one of them is contingent on an engine row that
           does not exist yet, so this is a design score and not a built one
           (evidence: K7 vs rbrSc at :50005; RBR_SLIDER_TOKENS at :49995)
```

The score moved from 9 to 10 because P1-7's defect was fixed, not because the bar moved. It decided
nothing: the verdict rests on the four reconciled items and the nine residual findings, none of which
any rubric dimension touches — the same blind spot both cycle-1 reports recorded. Per the founder's
2026-08-01 report-only ruling, the number is reported and nothing was decided by it.

---

## Gate statement

**`DESIGN_OK`, cycle 2 of 2.** No escalation trigger fired: there is no physics-correctness doubt
(both candidate α metrics were analysed to their edges and the desk chose the honest one; every
authored number re-derives independently), and the cycle budget is not the binding constraint — the
residue is not a design defect the architect can be sent back for. `physics_author` is authorised to
write the physics block for the nine-state design as tabled.

**Residual defects I am explicitly ACCEPTING into `physics_author`, on the record:** F-8 (S1's
transient numeral — word the state so its held claim is the picture, not the number) and F-9a (the
S3/S4 thinness, recorded, lesson frozen). Both are wording-level; neither touches a bought engine
surface.

**Residual defects I am NOT accepting into the 0c-3 freeze:** F-1 through F-6 are handover
obligations on the dispatching session's `findings_d.md` PASS 2, and **F-1 is blocking** — if PASS 2
is written, or 0c-3's scope frozen under findings_d §8's early-freeze advice, without the canonical
α sentence in place, the fork this desk closed re-opens inside the build, and the concept should be
parked at that point rather than authored against it. F-7 is conditional on Desk E's K6 ruling and
lands at 0d.

Nothing above is a shipping judgment (Rule 17 untouched). founder-proxy edited no skeleton, applied
no SQL, touched no `src/` file and dispatched no one; every routing and every SQL tuple here is a
report field for the dispatching session.
