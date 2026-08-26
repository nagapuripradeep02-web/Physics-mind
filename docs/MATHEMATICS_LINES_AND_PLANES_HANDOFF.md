# HANDOFF — `lines_and_planes_in_space` (#9), banked 2026-08-09 after an xhigh review

> **Read this file completely before touching anything.** It is the whole state: what is merged, what
> is open, what is broken, and the exact order to fix it in. Written because every finding below
> otherwise exists only in a chat log — the failure mode this chapter has now recorded five times.
>
> **Status (2026-08-26 night): ✅ MERGED TO MASTER. Both PRs are in — #143 (engine) at `33b1e11b`, then
> #96 (concept) at `954cdc9f`, in that order. Baselines and 37 EN clips ship with the concept.**
> ~~Status: BASELINE-LOCKED AND VOICED … NOT MERGED. Remaining: two PRs.~~ (superseded)
> ~~Status (2026-08-26 late): `founder_proxy` CHECKPOINT B = APPROVE — AUTHORING SIGN-OFF COMPLETE.~~
> F-2 · F-3 · F-7 and the P1 that F-7's fix introduced are all CLOSED. **NOT SHIPPED: no founder visual
> approval, no `visual:approve`, no baselines, NEVER VOICED, NOT MERGED.** Every remaining step is
> founder-gated (Rule 17).
> ~~Status (2026-08-26): ALL THREE CHECKPOINT-B P1s FIXED AND PIXEL-VERIFIED · NOT RE-GRADED~~ (superseded by the pass below)
> ~~Status (2026-08-22): REPAIRED · GATED GREEN · quality_auditor PASS~~ (still accurate, superseded by the fix round)
> ~~AUTHORED, WALKED TWICE, REVIEWED, NOT MERGED, NOT APPROVED~~ (the 2026-08-09 record)
> Concept JSON is complete and gated green; a 60-agent review then found **15 confirmed defects**, none
> fixed. **PR #96 must NOT merge as-is.**
>
> **⚠ SUPERSEDED 2026-08-10 — the fix round below (§0.1) EXECUTED this file's §2 list.** §2a/§2b/§2c
> are done and committed; four §2c rows became six engine PRs (#108→#114) which are now **MERGED to
> master**, their authoring follow-ups landed, and a re-audit round closed two further defects. The
> queue reads **13 OPEN for this concept, down from 26**. Read §0.1 FIRST; the sections below it are
> the 2026-08-09 record, kept verbatim.
>
> **⚠ START AT §0.00000 (2026-08-26 late) — IT IS THE FIRST-ACTION BLOCK.** The Checkpoint B
> verification pass RAN and returned **FIX**: F-2 and F-3 CLOSED, but F-7's fix introduced a P1 —
> the explore state's "skew pair" view animated the two lines through an exact intersection twice per
> loop while its own caption said they miss each other. Fixed (two numbers), gated, and verified LIVE
> against founder_proxy's own criterion; a re-grade of that one finding is in flight. §0.00000 also
> records the round's biggest structural find: **no automated gate ever enters a partitioned explore
> state's second scene_group**, and `founder_drive`'s Rule-37 probe cannot fail.
>
> ~~START AT §0.0000~~ (superseded; still accurate for the three-P1 fix record)
> **⚠ §0.0000 (2026-08-26).** Checkpoint B cycle 3 ran and
> returned **FIX**, the founder authorised a fix round overriding the spent cycle budget, and all three
> P1s (F-2 · F-3 · F-7) are now fixed and verified in pixels. **The concept has NOT been re-graded —
> Checkpoint B's standing verdict is still FIX until founder_proxy looks again.** §0.0000 opens with
> the exact first action for a fresh session (a founder_proxy verification pass), then the full ordered
> sequence that follows it through to TTS and the two PRs.
>
> ~~START AT §0.000~~ (superseded; still accurate for the 2026-08-22 repair record)
> **⚠ §0.000 (2026-08-22).** The concept is **REPAIRED and GREEN** — `quality_auditor`
> returned **PASS**, all three blockers (B1/B2/B3) are closed, and it is cleared for `founder_proxy`
> Checkpoint B **cycle 3 of 3**. Nothing is in flight; nothing is committed. §0.000 carries the exact
> uncommitted state of both desks, the verify chain, one optional pre-TTS fix, and the corrections to
> earlier findings that must NOT be re-fixed.
>
> ~~START AT §0.00~~ (superseded; still accurate for the cycle-2 record)
> **⚠ §0.00 (2026-08-21 late).** CP-B **cycle 2** returned FIX(engine) BLOCKING + one
> authoring FIX; both were dispatched and TWO AGENTS WERE STILL IN FLIGHT when the session ended — their
> EDITS ARE ON DISK, their reports are not. §0.00 says exactly where to find each and what to re-verify
> before committing. Cycle 3 is the LAST before ESCALATE.
>
> ~~START AT §0.01~~ (superseded; still accurate for the cycle-1 record)
> **⚠ §0.01 (2026-08-21) — it is the paste-and-go resume.** CP-B cycle 1's three P1s are
> APPLIED and pushed; the next action is ONE quality-auditor dispatch, then a fresh founder_drive, then
> founder-proxy Checkpoint B **cycle 2 of 3**. The engine half is **PR #133, CI green, unmerged — a
> founder call.** ~~PR #133 unmerged~~ — **MERGED 2026-08-21 as `91c55b0f`; the engine half is on master.**
> §0.02 is the cycle-0 record; §0.03 is the round that got the build to Checkpoint B.
>
> **⚠ CHECKPOINT B HAS RUN — read §0.02 FIRST (2026-08-21).** founder_proxy returned **FIX**,
> not APPROVE, on two P1s: STATE_6 printed an angle its own formula surface forbids (115° where the
> equation gives 65°), and s8_4 mis-named a labelled HUD number. Both fixed; the first became the
> state's best beat and a fourth misconception_watch. The engine half is **PR #133, unmerged — a
> founder call.** §0.03 below is the round that got the build TO Checkpoint B.
>
> **⚠ SUPERSEDED AGAIN 2026-08-20 (evening) — read §0.03 FIRST.** CP-B round 1 ran: two audits
> (pass 4 FAIL, pass 5 FAIL on one finding), a full architect → mathematics-author → json-author fix
> round, and a second carrier fix for STATE_6. `founder_proxy` was **never dispatched** — §0.05's
> dispatch ③ is still the next action, with the corrections in §0.03d.
>
> Companions: `docs/skeletons/lines_and_planes_in_space_skeleton.md` (amended — read its STATUS block
> FIRST) · `docs/skeletons/lines_and_planes_in_space_mathematics_block.md` ·
> `docs/MATHEMATICS_VECTOR_PRODUCTS_HANDOFF.md` (Act I, #7 — still banked).

---

## 0.00000 RESUME 2026-08-26 (late) — CHECKPOINT B = APPROVE. THE NEXT STEP IS THE FOUNDER'S. Read this first.

**Status: `founder_proxy` returned APPROVE — authoring sign-off, and authoring sign-off ONLY (Rule 17).**
The verification pass first returned **FIX**: F-2 and F-3 CLOSED, but **F-7's fix had introduced a P1**
in the same state. That P1 is now fixed (two numbers), gated, verified live against founder_proxy's own
pre-written criterion, and **re-graded CLOSED by founder_proxy on a build it hash-verified itself.**
**Nothing is committed on either desk. Nothing is shipped.**

---

### THE FINDING F-7's FIX INTRODUCED — and why every gate missed it

`M2.offset.along` is `[0.287668, −0.838664, −0.462482]`, which is **exactly the unit common perpendicular**
`d₁×d₂/‖d₁×d₂‖` (verified independently: dot with `unit(cross(d₁,d₂))` = 1.0, norm = 1.0). So the
`line2_offset` knob translates M2 along **the very axis `skew_distance` is measured on**:

```
D(t) = |1.800 + t|        zero at t = −1.800
```

F-7 copied `lambda`'s window shape **and its amplitude (±2.5)**. The window shape was transferable between
knobs; **the amplitude was not** — it had to be derived from the geometry the knob drives. ±2.5 straddles
−1.800, so the explore state's "skew pair" view animated the two lines **through an exact intersection
twice per 18 s loop**, at t ≈ 1260 ms and t ≈ 16740 ms — the first 1.3 s after the view opens, unattended.

At the crossing: the lines visibly meet at one point, the green `common_perp` (the object carrying
STATE_8's entire "the gap runs along d₁ × d₂" lesson) collapses to nothing, the HUD reads
`shortest distance = 0.047`, the picker reads `view: skew pair`, and the caption reads *"the two lines
that **miss each other**"*. `q5`'s distractor B is *"intersecting — every non-parallel pair meets"*; the
idle loop demonstrated the distractor. Second half of the same defect: the sweep started at −2.5, so the
view **opened at D = 0.700** instead of the **D = 1.800** STATE_8 teaches with byte-identical M1/M2 anchors
— a Rule 32d home-pose break across the S8→S9 cut.

**THE FIX (data only, both halves, two numbers).** `line2_offset` sweeps **`0.0 → +2.5` then `+2.5 → 0.0`**;
windows `[0,9000]`/`[9000,18000]` and `linear` unchanged. `D ∈ [1.800, 4.300]` — never degenerate, opens on
STATE_8's taught value, and closes the loop on the authored `zero: 0` so the `t=1000 ≡ t=19000` argument
survives verbatim. `lambda` untouched, `animate_loop_ms` still 18000. The **slider range stays −2.5…2.5**
deliberately: a teacher dragging the pair into contact is a good teaching move; the defect was the *idle
loop* doing it unbidden.

> **Verified LIVE, not analytically** — founder_proxy's own prescribed probe (drive to STATE_9, select
> `skew pair`, sample `skew_distance` every 300 ms across the loop). 80/80 samples carried a reading over
> ~23 s: **min 1.804 · max 4.276**; trough at t=18016 ms (the loop wrap, `line2_offset = 0`); wrap
> continuity 17728: 1.876 → 18016: 1.804 → 18304: 1.884. **The bar was "never below ~1.7".**

**Also applied, the P3 residual F-3 missed:** `assessment.mastery_definition` still read *"classify a
line-plane pair as meeting once or never"* — the sixth instance of the exact claim F-3 corrected on five
rendered surfaces. It renders nowhere (0 hits in built `index.html`/`sim.html`), so it reached no student,
but it is the spec a future author reads. Now *"classify a line off the plane as meeting it once or never"*.
`q4` had been correctly scoped all along.

---

### ⚠ THE BIGGEST THING THIS ROUND FOUND — the group-B half of STATE_9 is UNGATED

**`founder_drive` never enters scene_group B.** `dragVisibleSliders` selects `input[type="range"]:visible`,
and the group-B rows are `display:none` while A is selected — so `line2_offset` and `theta_deg` appear in
**zero** of its 11 recorded drags, and the Rule-37 motion probe measures group A. THE EYE likewise captures
STATE_9 at the authored `scene_group: "A"` only. **Neither harness operates the `<select>`.**

Consequence, stated plainly: **every automated gate in the pipeline reports on half of this explore state.**
That is why F-7's original freeze survived to cycle 3, and why the P1 above would have shipped.

**And the Rule-37 probe cannot fail.** `founder_drive` shoots its two motion-probe frames *after* its own
drag pass, so on any concept whose only animated explore knob is also a slider it measures a scene the
harness itself froze by drag-seize. Measured: group A moved 838 px/3 s **before** a `lambda` drag and
**0 px/3 s and 0 px/4 s after** it — while the same run's manifest recorded `bytesEqual: false`, i.e.
"alive". **A `founder_drive` manifest reading `motionProbe.bytesEqual: false` is NOT evidence that an
explore state moves.** Both are `peter_parker` harness fixes (E-1, E-2 in the scar drafts), unaddressed.

---

### F-2's REAL NUMBER — the margin, not the overlap

`arc_plane_tag` → `"θ = 35.0°"` is **CLOSED** and correct: it is the only binding of θ in the state
(narration says "thirty-five degrees", never "theta"), and binding the 35° tag rather than the 55° one is
right because `|d·n|/(‖d‖‖n‖) = cos 55° = sin 35°`.

But the earlier pixel check verified **absence of overlap**, which is a different question from the one
`json_author` refused to certify. Per-column measurement of clear background gives **7 px** at
t=14700/16100/frozen and **6 px** at t=19600/23800 — against the placement note's own recorded **16.1 px**
and this concept's declared **12 px collision bar**. A 56 % erosion, below its own bar. Graded **P3**, not
higher: at 10× there is zero overlap, zero clipping, full contrast, and it reads instantly at 1×. Recorded
so the number is on the table. If it is ever moved, extend the 0.950/0.100 offset coefficients outward —
**not** drop the ` = `, which would weaken the binding the fix exists to make.

**Rule to carry forward:** when a label's POSITION was solved against a measured margin, changing its TEXT
invalidates that measurement. "No overlap" does not answer it.

---

### GATES AFTER THE P1 FIX (run by the session, not reported by an agent)

```
npx tsc --noEmit              0 errors
validate:mathematics          5/5 PASS — lines_and_planes PASS, ZERO warnings on target
check:renderer-syntax         OK (both desks)
THE EYE  20260826-183041      40 checks · 39 passed · 1 skipped (H2, expected) · 1 failed
                              failed_ids: ["STATE_9:D5"] — known FP, SEVENTH consecutive run
```

**Fixture parity restored BEFORE THE EYE** (mandatory — the staleness gate hard-fails by design):
both desks `sha256 9ebe0e7d4156b0e7537c7aa4c90a2d9659df73f85753bc1c6b4bec261a6afe67`,
`_seed_subject_cache.ts` re-run, engine-desk `review-site` rebuilt.

`check:vector-geometry-3d` remains RED on the engine desk — **pre-existing, out of scope, blocks the ENGINE
PR only.** Reconfirmed this session: 4 failures, first divergence **4900 ms (STATE_2)** and **9500 ms
(STATE_4)**, exactly the pre-B2-repair reveal windows. `field3d_surgeon` work; the §31 sample times must be
re-derived because the handover gap moved 9500–10300 → 12000–13300 ms.

---

### ⚠ THE SERVER TRAP SPRUNG AGAIN, DIFFERENTLY — there are TWO stale listeners, not one

A fresh `http-server` on **8091** died with `EADDRINUSE`; **PID 69160** (started Aug 26 13:41, rooted on the
**engine desk**) answered instead. The previously recorded **PID 29337** (Aug 21, rooted on the **main repo**)
still holds **8087**. Both return 200.

**The content check caught it, and the content check is the only thing that will.** `curl -s <url> | shasum -a 256`
against the desk's own `review-site/<id>/sim.html`. In this instance the interloper happened to serve the
*correct* build, which is precisely why a status code proves nothing. Note `index.html` was **byte-identical
across both desks** while `sim.html` differed by ~6.8 KB (the engine desk bakes in the unmerged F1 renderer
fix) — so **hashing `index.html` alone would have passed a stale sim.** Hash `sim.html`.

---

### THE RE-GRADE — APPROVE, measured not accepted

`founder_proxy` re-ran its own criterion against the rebuilt build, content-verified
(`sim.html` = `sha256 1095e539295199f6cb…`, and **a different hash from the build it measured pre-fix**
(`c2b5b516…`) — so it knew it was looking at the edit, which is the discipline the server trap exists to force).

```
85/85 samples carried a reading
MIN skew_distance = 1.800  at t=36000 ms (line2_offset = 0.00)   ← the bar was 1.7
MAX skew_distance = 4.262
wrap: t=35664 → 1.898 | t=36000 → 1.800 | t=36368 → 1.898       ← clean V, no discontinuity
```

Since `D(t) = |1.800 + t|` with `t ∈ [0, 2.5]`, **the wrap IS the minimum by construction as well as by
measurement.** Worst-case frame now reads `shortest distance = 1.809` with the green common perpendicular
clearly drawn and the two lines plainly apart — the caption "the two lines that miss each other" is true at
the tightest instant of the loop.

**Nothing introduced.** Group A unaffected (849 px / 3 s against a 597–838 baseline). **All nine states'
narration timing byte-identical** to the pre-edit table (STATE_4 still 30834 ms @ rate 0.7 vs 31000 = 166 ms).
F-2/F-3 surfaces intact; `arc_normal_tag` correctly still bare. `lambda`, `animate_loop_ms`, `M2.offset.along`,
`zero` and `control_ranges` all untouched. `line2_offset` drags 0.2 → 1.85 and holds, `D = 3.650 = |1.800 + 1.85|`
— arithmetic exact. Per-knob seize intact. 0 console / page errors.

> **ONE TRADE, PRICED NOT HIDDEN.** Bounding the sweep halved its amplitude (5.0 → 2.5 wu), so view B's motion
> halved: **1291–2240 px / 3 s**, down from 2988 / 2834. Judged acceptable and defended: the readout still
> swings 1.800 → 4.262, the translation is obvious frame-to-frame, and a smaller CORRECT motion beats a larger
> one that contradicts its own caption. Not a finding — but the number moved, and the founder should know it did.

**Scar-row amendments before filing.** Two of the five drafts are now historical, not open:
row 1 (the degenerate-configuration sweep) and row 5 (the `mastery_definition` miss) → `status = 'FIXED'`,
`fixed_in_files = ARRAY['src/data/concepts/mathematics/lines_and_planes_in_space.json']::text[]`. Their
`prevention_rule` and `probe_logic` are the parts worth keeping — the CLASS is what ratchets, and row 1's
probe is exactly the check that cleared it. Rows 2 (E-1), 3 (E-2) and 4 (the label-margin class) stay `'OPEN'`.

**FYI recorded, deliberately NOT fixed.** `mastery_definition` ends "…from the **sign** of n·d", which is
loose — the classification turns on whether `n·d` is *zero*, not on its sign. Unrendered, predates every fix
round, cannot reach a student. **Left alone on purpose: the concept has just been given authoring sign-off,
and editing the approved artifact to chase an unrendered wording nit re-opens "is this the approved build?"
for no student-visible gain.** Sweep it on next touch.

---

### ⚠ SHIPPING AUDIO CHANGED THE PACING MODEL — read before trusting any rate-based finding

**`build_review_site.ts:1862`: `if (HAS_AUDIO && rateEl) { rateEl.disabled = true; }`** — *"Baked audio
can't be re-paced by the slider — disable it when clips exist."* And `sentDurMs` (~:1122) returns the
**real clip duration** whenever a clip is available, falling back to `estSentenceMs` only when one is missing.

**So rendering the 37 clips replaced this concept's estimator-driven, rate-scalable narration timeline with
fixed measured durations, and REMOVED the Speed slider.** Every "worst case at rate 0.7 / 1.1" figure in
this file was computed under the pre-audio model and no longer describes the shipped product.

Measured from the real manifest (clip durations + `GAP_MS` 280), narration end vs authored `duration`:

| state | duration | narration end | margin |
|---|---|---|---|
| STATE_1 | 23000 | 20893 | **+2107** |
| STATE_2 | 27000 | 16883 | +10117 |
| STATE_3 | 29000 | 20296 | +8704 |
| STATE_4 | 31000 | 20491 | **+10509** (the estimator said 166) |
| STATE_5 | 28000 | 20149 | +7851 |
| STATE_6 | 30000 | 20467 | +9533 |
| STATE_7 | 24000 | 16199 | +7801 |
| STATE_8 | 30000 | 20662 | +9338 |
| STATE_9 | 20000 | 11629 | +8371 |

**Every state now ends narration INSIDE its authored duration**, tightest +2.1 s. Consequences:

- **F-1 is CLOSED by the audio.** It was "STATE_1's duration under-declares its narration at rate 0.7
  (29.1 s vs 23 s)". At real clip durations STATE_1 ends at **20893 ms**, +2.1 s inside. The rate-0.7 case
  no longer exists — the slider is gone. **Do not "fix" F-1.**
- **F-3's 166 ms margin is obsolete** — the real margin is **10.5 s**. The `−9/+9` character-neutrality
  constraint that governed the F-3 fix no longer binds anything. It was correct under the model in force
  when it was applied.
- **F-5's grading is now unmeasurable as written** — "empty 94 % of its window at rate 1.1, 46 % at 0.9"
  cites rates that cannot be selected. If F-5 is revisited, re-measure against the fixed audio timeline.
- **B2's guarantee is now stronger than when it was repaired**, and no longer depends on rate at all.

**This cuts both ways: `duration` is now the binding constraint, not narration.** Every state holds its
final picture for 2–10 s after the last word. That is Rule 26-correct for guided states (and STATE_9 is
`interaction_complete`, so Rule 37 free-runs it), but it is a real change in feel that no gate measures.
**Founder should watch STATE_2/4 end-to-end once with sound on.**

### THE BASELINE LOCK — and the F1 coupling it exposed

`npm run visual:approve -- lines_and_planes_in_space` → **9 baselines**, from run `20260826-183041`:
each state stored twice, `compare:false` on the animated capture (reference only) and
**`compare_frozen:true`** on the deterministic pinned frame. So H2 rides on the FROZEN frames.

**They live on the ENGINE desk (`fix/vg-readout-subject-label/visual_baselines/`), and that is forced, not
chosen.** Approving from the chapter desk was attempted first and the staleness gate **correctly refused**:

```
cached  c39bedc6f8ea  (5094599 chars)   ← engine desk build, carries the F1 fix
source  ff3b07c3cbd6  (5087842 chars)   ← chapter desk build, does NOT
```

That 6.8 KB is F1. **`vgDotLabelText` count: engine desk 4 · chapter desk 0 · `origin/master` 0.** F1 changes
STATE_4's HUD row label (`n·d` → derived from the resolved subject), which is **pixel-visible in a frozen
frame**. So:

> **The approved baseline encodes a renderer state that is NOT on master.** The concept was graded on the
> engine build, so baselining anything else would approve a picture nobody reviewed — but it means the
> concept's baseline and the engine PR are coupled. **Merge the engine PR (`fix/vg-readout-subject-label`)
> BEFORE or WITH the concept PR**, or STATE_4's frozen H2 will diff on master. The engine PR is itself
> blocked on the §31 gate. Do not "resolve" this by re-baselining on the chapter desk — that would lock in
> the very defect F1 fixes (the readout naming the wrong line).

Baselines are untracked on the engine desk and **must NOT be staged into the engine PR** (Rule 40 — stage
exactly the four non-fixture paths). They belong to the concept PR once master carries F1.

### TTS — DONE, English-only

`npm run tts:generate -- lines_and_planes_in_space --langs=en` · `bulbul:v3` / `priya` / `en` (Rule 30/30i).

**37 sentences, not the 38 this file has said throughout** — `s5_6` was deleted in the 08-22 repair and the
count was never corrected. **37/37 available, 0 stale, 0 unavailable, 159.8 s of audio.**

- **First run: 36 written, 1 FAILED — `s1_1_en`, the concept's opening sentence.** Re-run fetched only it
  (36 skipped as existing), so exactly one clip was re-billed. **Always check the failure count, not just
  the "✓ N clips in manifest" line** — the manifest lists a failed clip with `available:false, duration_ms:0`,
  so the headline count is 37 either way.
- **There is no system `ffmpeg` on this machine** — the `ffmpeg-static` fallback (`resolveFfmpeg()`) carried
  the render. That guard is what stopped this becoming the recorded `definite_integral` failure (all clips
  billed, none kept). It works; do not remove it.
- Durable copy: **`tts_audio/lines_and_planes_in_space/` (37 mp3 + manifest) — git-tracked, and the ONLY
  cache.** `review-site/` is gitignored. Commit it with the concept PR; a re-render is real Sarvam spend.
- `text_hi` = 0 across all 37 — an FYI, never a refusal (Rule 30i).

---

### ✅ MERGED — the sequence is complete (2026-08-26 night)

| PR | what | merged as |
|---|---|---|
| **#143** | `fix(field_3d)`: a readout row that names an authored object derives that name from the object | **`33b1e11b`** |
| **#96** | `feat(mathematics)`: lines_and_planes_in_space #9 — Checkpoint B APPROVE, voiced | **`954cdc9f`** |

**#143 went first, and the order mattered.** Its `vgDotLabelText` changes STATE_4's HUD row label, which
is pixel-visible in a frozen frame, and the approved baselines were captured on that build.

**The coupling was then discharged empirically, not asserted.** After #143 landed, master was merged into
the chapter desk, the cache re-seeded from THAT desk, and THE EYE re-run with the baselines in place — so
H2 **RAN** instead of skipping:

```
57 deterministic checks · 56 passed · 1 failed · 9 skipped (compare:false animated states, by design)
ALL NINE __frozen comparisons: 0.00% pixels differ vs approved baseline (tolerance 2.0%)
the single failure is STATE_9:D5 — the known false positive, EIGHTH consecutive run
```

0.00 % on STATE_4's frozen frame is the proof: master reproduces the approved baseline byte-for-byte.
**The baselines were deliberately held out of #96 until #143 was on master** — committing a baseline master
could not reproduce would have been the defect, not the fix.

**The §31 gate that blocked #143 is repaired and green (1186 PASS).** It was NOT a copy-paste: the B2
re-budget moved every reveal window, the handover gap moved 9500–10300 → **12000–13300 ms**, `17500` became
the exact `X_live`→`X` boundary where printing NO row is correct, and STATE_2's segment windows moved
6500–11200 / 11150+ → **4800–15300 / 15250+** (its "moving number" probe had to straddle both windows,
because in-plane `n·v` is 0 **by construction** and two in-plane samples can never differ). The planted
negative control is untouched and still fires at all 7 samples — green on merit, not by relaxation.

**One Rule-40 artefact found in passing:** the chapter desk carried a 1-line §28 fixture addition that had
been authored **independently and identically** on the engine desk. Same tooling line, twice, on two desks
that had not pushed — the exact origin story Rule 40 was written for. The chapter copy was discarded; #143
delivers it.

**Still open, deliberately:** **12 scar rows drafted and unfiled** (applying is a founder action), including
E-1 (no gate reaches a non-default `scene_group`) and E-2 (the Rule-37 probe fires after its own drags).
F-5, F-6 and the three P3s remain graded and unfixed. **F-1 is closed by the audio** (see the pacing block).

---

### THE ORDERED SEQUENCE FROM HERE

1. ~~`founder_proxy` re-grade of the STATE_9 P1~~ — **DONE: APPROVE.** It pre-authorised the cheap path: the
   `skew_distance` probe above, no full cycle.
2. ~~Founder visual approval → `npm run visual:approve`~~ — **DONE 2026-08-26** (9 baselines, engine desk)
   (founder-triggered). **Expect a FULL re-baseline**; there is no `visual_baselines/` entry on the engine desk, which is why H2 skips.
3. ~~TTS~~ — **DONE 2026-08-26**: 37/37 EN clips, 0 stale, 159.8 s. See the TTS block above.
4. **← YOU ARE HERE. Two PRs.** Chapter desk → its own PR (**PR #96 predates the entire repair and must
   NOT merge as-is**); it must carry `tts_audio/lines_and_planes_in_space/`. Engine desk
   (`fix/vg-readout-subject-label`) → its own PR, Rule 40 — **blocked on the §31 gate**, and now also
   **gating the concept's H2 baseline** (see the F1 coupling above). Merge order matters.

**Desk sync warning:** the chapter desk is **275 commits behind `origin/master`** (269 on 08-22; master keeps
moving). `npm run desk:sync` before PR'ing; expect the Rule-40 conflict hazard.

### SCAR ROWS — 12 DRAFTED AND UNFILED, 1 FILED

The seven from cycle 3, plus **five new ready-to-run rows** from this pass (in the verification-pass report):
the degenerate-configuration sweep (the P1) · every visual gate capturing only the default scene_group (E-1) ·
the Rule-37 probe running after its own drags (E-2) · a widened label certified by absence-of-overlap
instead of against its margin (F-2 residual) · a corrected claim surviving in the unrendered spec field
(the `mastery_definition` miss). **None is applied — applying is a founder action.**

### ADDITIONS TO THE DO-NOT-RE-FIX LIST

- **F-2 and F-3 are CLOSED.** Do not re-open. F-3's five surfaces are complete and no sixth *rendered*
  surface exists; `q4` was already correctly scoped.
- **STATE_9's post-drag stillness is NOT a defect.** After a drag seizes the only animated knob, the view
  goes to 0 px. Control experiment: group A does the same (838 px/3 s → 0 px after a `lambda` drag). It is
  the documented `knob()` drag-seize contract (`field_3d_renderer.ts:15216`), fleet-wide, predating F-7, and
  correct — a teacher who sets a value wants it held.
- **F-3's timing claim is right but "by construction" overstates it.** `estSentenceMs` rounds per sentence,
  so equal total chars can shift the total ±1 ms. Both halves land on 13922 ms exactly; narration end is
  30834 ms at rate 0.7 before and after, margin 166 ms. The result holds.
- **F-1, F-5, F-6 and the three P3s stay open and deliberately unfixed.** Each was checked only for whether
  a fix made it worse. None did.

---

## 0.0000 RESUME 2026-08-26 — THREE P1s FIXED. START BY RE-GRADING THEM. Read this first.

**Status: F-2, F-3 and F-7 are fixed, gated, and verified in pixels by the session that made them.
`founder_proxy` has NOT seen them. Checkpoint B's standing verdict is therefore still FIX.
Nothing is committed on either desk. Nothing is in flight.**

---

### ▶ FIRST ACTION ON RESUME — dispatch `founder_proxy`, Checkpoint B VERIFICATION PASS

Not a fresh cycle. The 3-cycle budget was spent at cycle 3; the founder then authorised a fix round
explicitly, on the record, overriding it. This dispatch asks one question: **do the three fixes close
their findings, and did they introduce anything?** Give it:

- **Scope: F-2, F-3, F-7 only** — plus anything it finds that the fixes themselves caused. It should
  NOT re-open settled items (see the do-not-re-fix list in §0.000 and the additions below).
- **The fresh artifacts** (all 2026-08-26, all produced by the dispatching session, none second-hand):
  - THE EYE: `.visual_runs/lines_and_planes_in_space/20260826-163907/` on the ENGINE desk —
    **40 checks, 39 passed, 1 skipped, 1 failed.** The failure is `STATE_9:D5`, now the **SIXTH**
    consecutive run of the confirmed false positive. Do not re-litigate. The skip is H2 (no
    `visual_baselines/` on that desk — expected).
  - `founder_drive`: `.founder_runs/lines_and_planes_in_space/2026-08-26T11-41-23-742Z/` —
    11/11 drags moved, 0 reverted, 0 collisions, 0 console errors. **⚠ This dump PREDATES the three
    fixes.** If cycle-3's verdict turns on drag behaviour, re-run it first — and see the server trap
    below, which invalidated the previous one.
- **The reminder that its APPROVE is authoring sign-off ONLY** — shipping stays founder-only (Rule 17).

**⚠ THE SERVER TRAP — read before running any `founder_drive`.** A `founder_drive` on 2026-08-26
recorded 11/11 clean drags **against a five-day-old build**. `npx http-server … -p 8087` had died with
`EADDRINUSE`, `curl` returned **200** from a pre-existing listener (PID 29337, started Aug 21, rooted on
a different desk), and the 200 was read as proof. **Verify the CONTENT, never the status code:** diff
`curl -s <url> | shasum -a 256` against the `review-site/<id>/index.html` of the desk under review, and
check the embedded per-state `duration` list. The repaired build reads `23, 27, 29, 31, 28, 30, 24, 30, 20`.
Note also that `field_3d_config` lives in **`sim.html`**, not `index.html` — a grep for vg content in
`index.html` returns nothing and does not mean the build is stale.

---

### WHAT THIS SESSION DID (2026-08-26)

**① The optional pre-TTS pass from §0.000 — DONE.** All four items applied:
`s2_3` → `"the reading is not zero"` (byte-identical length, so STATE_2's +302 ms margin is untouched);
`glow` deleted on `s2_3`, `s3_3`, `s4_3b`, `s5_1` (C-1); `STATE_2.focal_primitive_id` `P1_normal` →
`P1.normal` (audited: STATE_2 was the only state of nine whose focal id resolved to no vg object);
`real_world_anchor.secondary` "runs over" → "passes above", matching `s5_2`.

**② Checkpoint B cycle 3 ran → FIX.** Four P1s initially. Then, on a corrected drive, founder_proxy
**downgraded its own F-1 to P2** (it had claimed a 7.1 s frozen tail on STATE_1; measured, λ holds ~3 s
then moves again) and **added F-7**, which was undiscoverable until the drive was fixed. It also
**withdrew both of its cycle-2 findings** (`par_tag`, `variable_choreography`) after re-deriving them.

**③ The founder authorised a fix round.** F-2, F-3, F-7 applied by `json_author` in ONE pass so
STATE_4's narration budget was solved once, holistically.

**④ Two engine PRs, one merged.** See "PRs" below.

---

### THE THREE FIXES, AND HOW EACH WAS VERIFIED

**F-3 — STATE_4's false dichotomy (5 surfaces).** `mathematics_author` ruled: **scope the third case
out honestly, do not teach it.** STATE_4's picture holds two lines both built off the plane and has no
visual referent for containment, so naming it would assert an unshown case (Rule 25). It verified case C
is genuinely *reachable* — re-anchoring `Lpar` onto its own foot gives `n̂·(p−a) ≈ 0` — so this was a
false universal, not a vacuous edge case. Fix is one qualifier, **"a line off the plane"**, reusing
wording already taught in `s2_3`/`s2_4`/`s3_1`. Also fixed the same defect one level down in
`one_line_fix`. Surfaces: state `title`, `field_3d_config` `label`, `one_line_fix`, `s4_4`, and `s4_1`
trimmed to fund it.

> **Timing, verified twice independently (session + json_author):** net character delta **exactly 0**
> (−9 on `s4_1`, +9 on `s4_4`). Rate-0.7 margin **166 ms before and after**; 0.9 → 6770 ms; 1.1 →
> 10970 ms. Words 51 → 52. **B2 stays closed by construction, not by luck.**

**F-2 — STATE_7's unbound θ.** `arc_plane_tag.label` `"35.0°"` → **`"θ = 35.0°"`**, binding the
`sin θ = |d·n| ⁄ (‖d‖‖n‖)` surface to the angle-to-plane arc (the 35° one it names; the numerator
`|d·n|` visually cues the wrong one). Labels are not on the narration timeline, so this cost zero budget.
`json_author` **refused to certify the placement** — the label grows from a centred anchor, so ~half the
added width eats the recorded 16.1 px margin, and this concept's analytic estimates have run ~55 px
optimistic before. **Discharged in pixels by the session:** at 5× on `STATE_7__frozen.png` the label sits
clear below the shadow-line stroke with no clipping, and the contact sheet confirms it holds at every
frame from its reveal (~13300 ms) onward.

**STATE_6 deliberately left unbound** — and the reason is better than "non-blocking": its arc measures a
**live, animating** θ (69.3846° → 115°), while `points[].label` is a hardcoded static string
(`label: o.label || null` in `vgResolveLinesPlanes`, no value substitution). A static `θ = …` tag would
go wrong the instant the angle moves. Printing θ in the HUD row instead needs `VG_READOUT_LABEL`
(`field_3d_renderer.ts` ~:14163) — engine code, Rule 40, a separate PR. **Do not "fix" STATE_6 by
authoring a static tag.**

**F-7 — STATE_9's frozen explore view B.** Two `line2_offset` entries appended, mirroring `lambda`'s
window shape exactly (`[0,9000]` / `[9000,18000]`, linear, ±2.5). `M2` already carries
`offset: {knob: "line2_offset"}`, so this drives the skew line and the live `skew_distance` readout.

> **Measured, untouched, past narration end, 3 s windows:**
> view A `line + plane` 1520 / 834 px **before** → 9235 / 42776 px after (group A unaffected);
> view B `skew pair` **0 / 0 px before → 75671 / 80599 px after.**
> Loop integrity: `animate_loop_ms` stays 18000 and is applied to `stateMs` once upstream of every knob
> lookup in `vgAnimValue`, so `t=1000 ≡ t=19000` holds for any knob **by construction**. `lambda`'s two
> entries are byte-for-byte unchanged.

---

### GATES AS OF SESSION CLOSE (run by the session, not reported by an agent)

```
npx tsc --noEmit             0 errors
npm run validate:mathematics 5/5 PASS — lines_and_planes PASS, ZERO warnings on target
check:renderer-syntax        OK (all three renderers)
THE EYE 20260826-163907      40 checks · 39 passed · 1 skipped (H2, expected) · 1 failed (STATE_9:D5, known FP)
```

**⚠ `check:vector-geometry-3d` is RED on the ENGINE desk — 4 failed assertions. PRE-EXISTING, and it
blocks the ENGINE PR, not the concept.** Proven unrelated: the identical 4 failures reproduce against the
byte-identical pre-repair JSON (`sha256 e5420e8f…`). Cause: the §31 fixtures (`STATE_2_VG` ~:7392,
`STATE_4_VG` ~:7371 in `check_vector_geometry_3d.ts`) still carry PRE-B2-repair reveal windows
(STATE_2 `test_v_inplane` 6500/11200 vs the shipped 4800/15300; STATE_4's three intersections retimed).
The gate is doing its job — its own comment says it must fail on "a retimed reveal". **Fixing it is NOT a
copy-paste:** §31's hardcoded sample times must be re-derived, because the authored handover gap moved
from 9500–10300 ms to 12000–13300 ms. `peter_parker:field3d_surgeon` work.
**The earlier "ALL SECTIONS PASSED / 1186 PASS" record was taken on the CHAPTER desk, whose copy of the
gate has no §31 section at all.** Run engine gates on the engine desk.

---

### THE ORDERED SEQUENCE FROM HERE

1. **`founder_proxy` verification pass** — the first action above.
2. **If it returns FIX:** route each finding to ONE owner, fix, re-verify, re-run THE EYE, re-dispatch.
   **If it APPROVES:** that is authoring sign-off only. Continue to 3.
3. **Founder visual approval**, then `npm run visual:approve -- lines_and_planes_in_space`
   (founder-triggered). **Expect a FULL re-baseline** — all eight guided states changed timing in the
   08-22 repair, and STATE_4/7/9 changed again on 08-26. There is no `visual_baselines/` entry for this
   concept on the engine desk today, which is why H2 skips.
4. **TTS** — `shipper`, `tts:generate --langs=en`. English-only (Rule 30i). **38 sentences; the concept
   has NEVER been voiced and no audio manifest exists.** Each render is real paid Sarvam spend with no
   free restore, so narration text MUST be final first. `text_hi` = 0 is an FYI, never a refusal.
5. **Two PRs.** The chapter desk → its own PR (PR #96 is open, predates the entire repair, and must NOT
   merge as-is). The engine desk (`fix/vg-readout-subject-label`, the F1 fix) → its own PR against
   master, Rule 40 — **blocked until the §31 gate above is repaired.**

**Desk sync warning:** the chapter desk is **~269 commits behind `origin/master`** (it read 0 behind on
08-22; master has moved). `npm run desk:sync` before PR'ing, and expect the Rule-40 conflict hazard.

---

### WHERE THE WORK SITS (nothing committed, nothing pushed)

**Chapter desk — `feat/mathematics-lines-and-planes`** @ `64d48d2d`, at
`/Users/karthikyerragadda/Desktop/Viditra/Physics-mind-mathematics-lines-and-planes`

| path | state |
|---|---|
| `src/data/concepts/mathematics/lines_and_planes_in_space.json` | M — the 08-22 repair + the 08-26 pass + all three P1 fixes |
| `docs/MATHEMATICS_LINES_AND_PLANES_HANDOFF.md` | M — this file |
| `PROGRESS.md` | M |
| `src/scripts/check_vector_geometry_3d.ts` | M (+1 line) |
| `docs/skeletons/lines_and_planes_in_space_repair_2026-08-22.md` | ?? |
| `src/scripts/_seed_engine_bug_queue_lines_and_planes_cpb2_f2_migration.ts` + its SQL | ?? |

**Engine desk — `fix/vg-readout-subject-label`** @ `91c55b0f`, at
`/Users/karthikyerragadda/Desktop/Viditra/Physics-mind-fix/vg-readout-subject-label`
— `field_3d_renderer.ts` M +112 (the F1 fix, **DO NOT TOUCH**) · `check_vector_geometry_3d.ts` M +530 ·
the scar seed + SQL (??) · **two concept JSONs (??) that are THE EYE FIXTURES — NEVER STAGE, NEVER DELETE.**
Stage EXACTLY the four non-fixture paths. Never `git add -A` on this desk.

**Fixture parity: both concept copies are `sha256 04fa806b7613d687f572…` and `simulation_cache` was
re-seeded from that exact source.** If you edit the JSON you MUST re-copy it to the engine desk and re-run
`npx tsx --env-file=.env.local src/scripts/_seed_subject_cache.ts lines_and_planes_in_space`
before THE EYE, or the staleness gate hard-fails by design.

---

### PRs

| PR | what | state |
|---|---|---|
| **#139** | `fix(field_3d)`: a teacher's force-shown slider row is a live control (Rule 39b) | **MERGED to master `631fcaab`** |
| **#140** | `fix(desk)`: ahead/behind measured against `origin/master`, never the local ref | **OPEN — founder merge call** |
| **#96** | the concept PR | OPEN, predates the repair, **must NOT merge as-is** |

**PR #139 — what it fixed, because it changes how every field_3d concept behaves.** `knob()` in
`updateVectorGeometry3DFrame` gated the drag-seize branch on `stateDef.show_sliders`, so on any state
omitting that key (here: STATE_3/4/5/7/8) a teacher's drag was discarded. `field3d_surgeon` found two
more clauses of the same shape — `vgApplyControlRows` set `slEl.disabled = !(key in controls)` (the one a
teacher hits FIRST: the row arrives greyed, no `input` event fires at all) and `vgSyncRampedRows` skipped
the drag-owned row only `if (showSliders && …)`. It **rejected** the dispatching session's proposed
visibility-based gate in favour of the trusted-drag flag, correctly: a visibility test can be true with
no user action, and hiding a row mid-state would release the seize and snap geometry under the teacher's
hand. Fleet-verified; THE EYE cannot reach either branch (no `SET_WIDGET_VIS` / `mouse.down` / `Dragged`
anywhere in `visual_eyes.ts` or `validators/visual/`), so **no re-baseline was needed.**

---

### NOT FIXED — open, graded, deliberately left

| id | pri | what |
|---|---|---|
| **F-1** | P2 | STATE_1's `duration` (23 s) under-declares its narration at rate 0.7 (29.1 s); measured ~3 s hold at the λ endpoint. Fix = extend the ping-pong past 29099 ms and raise `duration`. |
| **F-5** | P2 | `s4_3a`'s `glow` is the **fifth** C-1 row and was NOT deleted with the other four. Empty 94 % of its window at rate 1.1, 46 % at 0.9. One key deletion; grading it differently from its four siblings is inconsistent. |
| **F-6** | P2 | STATE_4 label hierarchy inverted — `d`/`d′` render **11 ink px** each against a **480 ink px / 20 px cap** `n·d′ = 0` tag. The tag's own `_design_note` claims a 73 px `n` separation; the rendered frame gives **17 px**. Open row `label_separation_is_a_function_of_the_authored_camera…`. |
| — | P3 | STATE_7's `sin θ` formula is on canvas from **t=0** while `θ = 35.0°` reveals at **~13300 ms** — a ~13 s window where the formula still names an unbound θ. Open engine row `vg_formula_overlay_has_no_timed_reveal…`; a label fix cannot reach it. |
| — | P3 | `focal_primitive_id` has **no consumer at all** (schema-only, `conceptJson.ts:102`); STATE_6/STATE_7 name angle-arc ids, and arcs are never stamped. Harmless today. |
| — | P3 | STATE_7 preposition drift: title/`s7_4` say "Measure **to** the normal", caption says "**from**". |
| — | — | `parallel_currents_force`: **13 stale H2 baselines** drifting 2.07–3.69 %, states flipping across the 2 % line between runs. Proven pre-existing by a revert control. **Founder re-baseline call, still open.** |

### SCAR ROWS — 7 DRAFTED AND UNFILED, 1 FILED

`founder_proxy` drafted **seven** rows (cycle 3 + supplementary) as ready-to-run SQL; **none is applied** —
applying is a founder action. They cover: the timeline re-budget that swept 8 of 9 states · THE EYE
sampling `duration` instead of `timelineTotal` · the Latin-only symbol sweep that missed Greek · a case
split narrated as exhaustive · `founder_drive` targeting a stale server root · `focal_primitive_id`
having no consumer · a group-partitioned explore state freezing on its other view.
`field3d_surgeon` **filed one** under its own contract:
`teacher_forced_slider_row_is_inert_because_the_authored_state_flag_still_owns_the_control` (FIXED).

### ADDITIONS TO THE DO-NOT-RE-FIX LIST (extends §0.000's)

- **`par_tag` and `variable_choreography` are settled twice over.** founder_proxy filed both, then
  withdrew both at cycle 3 after re-deriving them itself: `par_tag`'s perpendicular residual is
  ~4.8e-5 wu at its terminal knob value, and the 2.50 wu figure corresponds to `t ≈ 3384 ms` — 8.6 s
  before the tag reveals at 12000. `variable_choreography` has **0** consumers in `field_3d_renderer.ts`
  against 17 in `parametric_renderer.ts`.
- **STATE_4's "near-end-on `Lpar` (~30 px stub)" founder-taste item is STALE** — measured 117 px wide
  (x608–725), 800–1000 ink px after ghosting, steady t=12600→30800. Not a finding.
- **`arc_plane_tag` is NOT outside its wedge** (§0.000), and its label is now `θ = 35.0°` — verified
  clear in pixels at 5×. Do not "re-place" it without a rendered-frame measurement.

---

## 0.000 RESUME 2026-08-22 — REPAIRED AND GREEN. `quality_auditor` PASS, cleared for Checkpoint B. Read this first.

**Status: `quality_auditor` returned PASS (with non-blocking Concerns). All three blockers CLOSED.
Nothing is in flight. Nothing is committed. Two desks hold uncommitted work — exact paths below.**

### The one-line state
B1, B2 and B3 are fixed and verified. The concept is cleared for `founder_proxy` Checkpoint B **cycle 3
of 3** (the last before ESCALATE). After that: founder visual approval → `visual:approve` → **TTS**
(38 English clips; the concept has NEVER been voiced — no audio manifest exists).

### FIRST DECISION ON RESUME — take it or skip it, but decide deliberately
A short `json_author` pass was RECOMMENDED and NOT YET RUN. Four items, all non-blocking:

1. **`s2_3` wording — the only one that matters.** It reads *"the reading leaves zero"*, which an ESL
   student parses as "results in zero" — the OPPOSITE of the intent. **This phrase was introduced by
   the 2026-08-22 repair itself**, and TTS will make it permanent.
   **CONSTRAINT: the fix MUST be character-neutral.** STATE_2's B2 margin is **+302 ms at rate 0.7**;
   the auditor's suggested rewording adds ~7 chars ≈ **+727 ms** of narration and would SILENTLY
   RE-OPEN B2. Use **`"the reading is not zero"`** — byte-identical length to `"the reading leaves
   zero"`, +1 word (STATE_2 49 → 50, still in budget).
2. **C-1, four `glow` deletions** — delete the `glow` key on `s2_3`, `s3_3`, `s4_3b`, `s5_1`. See below.
3. **C-4, one typo** — `STATE_2.focal_primitive_id` is `"P1_normal"`; the stamped id is `"P1.normal"`.
   Inert today, but it has no referent under any future fix.
4. **Doc drift** — `real_world_anchor.secondary` still carries the retired phrase *"one runs over the
   other"* (fixed in `s5_2`, missed here).

Any wording change must be **character-neutral or shorter**, or it eats a B2 margin. Margins are thin:
S4's is **166 ms**.

### WHERE THE WORK SITS (nothing committed, nothing pushed)

**Engine desk — `fix/vg-readout-subject-label`** @ `91c55b0f`, at
`/Users/karthikyerragadda/Desktop/Viditra/Physics-mind-fix/vg-readout-subject-label`

| path | state |
|---|---|
| `src/lib/renderers/field_3d_renderer.ts` | M, **+112** — the F1 fix. DO NOT TOUCH. |
| `src/scripts/check_vector_geometry_3d.ts` | M, **+530** — F1 section + rewritten fixtures |
| `src/scripts/_seed_engine_bug_queue_vg_readout_subject_label.ts` | ?? new — the scar row |
| `supabase_migrations/supabase_2026-08-21_seed_engine_bug_queue_vg_readout_subject_label_migration.sql` | ?? new |
| `src/data/concepts/mathematics/*.json` (×2) | ?? **THE EYE FIXTURES — NEVER STAGE, NEVER DELETE** |

**Stage EXACTLY the four non-fixture paths. Never `git add -A` on this desk.** Then commit, push,
`gh pr create` against master (Rule 40: its own PR).

**Chapter desk — `feat/mathematics-lines-and-planes`** @ `64d48d2d`, **0 behind master**, at
`/Users/karthikyerragadda/Desktop/Viditra/Physics-mind-mathematics-lines-and-planes`
- `src/data/concepts/mathematics/lines_and_planes_in_space.json` — M, **+147/−77** (the whole repair)
- `docs/skeletons/lines_and_planes_in_space_repair_2026-08-22.md` — ?? the architect's design artifact
- `src/scripts/_seed_engine_bug_queue_lines_and_planes_cpb2_f2_migration.ts` + its SQL — ?? (F2 round)

**Fixture parity: both concept copies are sha256 `e5420e8f…`. `simulation_cache` was re-seeded from
that exact source.** If you edit the JSON, you MUST re-copy it to the engine desk and re-run
`npx tsx --env-file=.env.local src/scripts/_seed_subject_cache.ts lines_and_planes_in_space`
before THE EYE, or the staleness gate hard-fails (by design).

### VERIFY CHAIN — all green as of 2026-08-22, run by the session, not reported by an agent
```
check:renderer-syntax        exit 0    (all three renderers)
npx tsc --noEmit             exit 0
check:vector-geometry-3d     exit 0    ALL SECTIONS PASSED (1186 PASS)
validate:mathematics         exit 0    lines_and_planes PASS, zero warnings on target
THE EYE  20260822-020702      40 checks, 39 passed, 1 failed
```
The single EYE failure is **`STATE_9:D5`** — now the **FOURTH consecutive run**, independently
confirmed a FALSE POSITIVE by `quality_auditor` from slider evidence (λ −3.44 → 2.16, thumb moves
75 → 212 px, marker translates ~370 px). Filed as
`visual_eyes_d5_ink_relative_lens_is_diluted_by_static_chrome_on_explore_states`. **Do not re-litigate.**
H2 skips: this desk has no `visual_baselines/` entry. Expected.

### WHAT THE 2026-08-22 REPAIR DID (all three blockers closed)

**B2 — the big one.** Reveal times had been budgeted against each state's authored `duration` (18–22 s),
but the player computes `Math.max(narrationEnd, duration*1000)` and narration runs 21.5–27 s — so
`duration` was **dead metadata** and all eight guided states ended with 6–11 s of narration over a
frozen picture. Worst case: STATE_2 HEARD *"a vector in the plane gives zero dot product"* while the
screen SHOWED the vector tipping out and the readout going nonzero — Rule 32a inverted for 3.1 s, and
it did not tune away across the Speed range. Re-budgeted in all 8 states, narration trimmed in 7,
`s5_6` deleted, every state given a terminal motion so motion outlasts narration at every rate.
Verified in pixels: `n·v = 0.000` holds through 14700 ms, tip-out first registers at 15400.

**B1** — closed by DROPPING `numerator_triple_product` and `cross_norm` from STATE_8's `value_readouts`
(leaving `["skew_distance"]`), not by pulling `cross_vec` earlier — pulling it would have destroyed the
build-then-slide beat that IS s8_2/s8_3. The scar's failure mode is now **unrepresentable**, not merely
rescheduled. **When Δ12 lands, restore both tokens gated on their own vectors' arrivals.**

**B3** — STATE_7's two angle tags were placed with a RADIAL margin from the apex, which buys almost no
clearance from the stroke in a narrow wedge (for the 35° angle the bisector is only 17.5° off the `d`
line ⇒ ~0.38 wu perpendicular clearance). Recomputed for **screen-perpendicular** clearance.
eye-walker and the auditor both confirm no overlap at either camera pose.

### CORRECTIONS TO EARLIER SESSIONS' FINDINGS — do not re-fix these
- **`par_tag` was NEVER misplaced.** founder_proxy cycle 2 filed it "2.50 wu off the line it tags".
  Its perpendicular distance is **4.9e-7 wu at every instant it is visible**. The 2.50 wu figure
  corresponds to `aux_a ≈ 0.049`, reached at **t ≈ 3104 ms** — 6.4 s before the tag reveals at 9500.
  The filed item measured a distance at a time when the tag does not exist. Confirmed independently
  by `json_author` and `quality_auditor`.
- **`variable_choreography` must NOT be authored here.** 0 consumers in `field_3d_renderer.ts`, 17 in
  `parametric_renderer.ts`. All SIX siblings carrying it are `panel_a: parametric`; this and
  `vector_products_in_space` are the only `field_3d` ones and both carry zero. Its native equivalent
  `vg.animate` is already authored on every state that needs it.
- **`arc_plane_tag` is NOT outside its wedge** (a mid-session claim, since disproved). Its in-plane
  component sits **6.0° from the shadow leg, inside the 0–35° wedge**, at its arc's own radius. The
  "below the shadow line" look comes from the `−0.925·f̂` term, and `f̂ = n̂ × ŝ` lies IN the plane —
  the tag is slid sideways along the plane surface, not pushed out of the angular region.

### C-1 — a NEW defect class, real and structurally invisible to THE EYE
`applyReveal()` sends the glow for a whole sentence window; the renderer dims every non-focal element
to 0.4 and skips the named object when it is not yet revealed or already hidden — so the scene **dims
with nothing brightened**. Percentage of each sentence for which its own glow target does not exist:

| sentence | glow | @0.7 | @0.9 | @1.1 |
|---|---|---|---|---|
| `s2_3` | `test_v_offplane` | 0 % | **81 %** | **100 %** |
| `s4_3b` | `X` | 0 % | **70 %** | **100 %** |
| `s3_3` | `cmp` | **100 %** | 41 % | 0 % |
| `s4_3a` | `Lcut` | 0 % | 46 % | **94 %** |
| `s5_1` | `crossing_mark` | 64 % | 62 % | 76 % |

THE EYE cannot see this — glow targets stay empty under capture (renderer `:7744`). Cheap fix: delete
those four `glow` keys. **More valuable: seed it as a queue row so it becomes a permanent fleet probe —**
`a_sentence_glow_names_an_object_that_is_not_on_screen_during_its_own_window_so_the_scene_dims_with_no_focal`
— probe: for each state × rate ∈ {0.7, 0.9, 1.1}, assert the named object's visible interval covers
≥ 60 % of its sentence window.

### THE REMAINING SEQUENCE
1. (optional) the short `json_author` pass above → re-verify → re-sync fixture → re-seed → THE EYE
2. `founder_proxy` Checkpoint B **cycle 3 of 3**. Narrowed list: STATE_4, STATE_7, and its own two
   refuted findings (`par_tag`, `variable_choreography`) for adjudication. **Its APPROVE is authoring
   sign-off ONLY — shipping stays founder-only (Rule 17).**
   **NOTE: the `founder_drive` dump on record (11/11 drags, 0 errors) PREDATES the repair and was not
   re-run.** If cycle 3's verdict depends on drag behaviour, re-run it first.
3. Founder visual approval → `visual:approve` (founder-triggered; expect a FULL re-baseline — all eight
   guided states changed timing)
4. **TTS**: `shipper`, `tts:generate --langs=en`. English-only (Rule 30i). 38 sentences, `text_hi` = 0
   (an FYI, never a refusal). Each render is real paid Sarvam spend with no free restore — so the
   narration text MUST be final first. That is why item 1 above matters.
5. Engine desk → its own PR against master (Rule 40).

### FOR CONCEPT #10 — the process change the founder asked for
**Have the architect compute the narration timeline at DESIGN time and budget `reveal_at_ms` against
it**, instead of against `duration`. Nothing enforces this today; B2 was found only by audit, after the
concept was otherwise gated green. A rebuild by the same pipeline reproduces the same defect.
Model: `build_review_site.ts` ~857-872 / ~1111-1155 — `max(1400, round(chars/5.5/(150·rate)·60000))`,
GAP 280, `timelineTotal = max(narrationEnd, duration·1000)`. Rate slider is 0.7–1.1, default 0.9, so
**0.7 is the binding case**.

**The deeper fix (Rule 40, platform, separate master PR):** the vg region consumes **no cue time** —
`vgRevealFrac` reads `o.reveal_at_ms` directly, so every reveal is an absolute constant while narration
scales 1/rate. Perfect per-sentence sync at every rate is therefore *arithmetically impossible* past
about the second sentence. Routing vg reveal/animate anchors through `cueTriggerMs` (as 225 other sites
already do) would make it correct at every rate automatically, with the authored ms as THE EYE's
deterministic fallback.

---
## 0.1 SESSION 2026-08-10 — the fix round (read this first)

**On the chapter branch** (`feat/mathematics-lines-and-planes`, commits `5a97b1c → 64690fb → bf72027
→ d6eb38f` + the fix-round queue commit): §2a seed-guard retrofit + round-2 corrections migration
(replay-verified against the live queue, write-set parity probe + negative control); §2b both fixes;
§2c authoring half (S5 counter at 1620 ms — computed against `reveal + 0.9·grow` through the
ease-out cubic; S2 half_extent-growth seam; four dead tokens swept — S1/S9 `lambda` **plus S2
`n_norm` and S9 `angle_lines_deg`**; S9 advanced strip; distance = capital **D** everywhere).

**quality_auditor's FIRST-ever pass FAILED the build and was right**: the cross_vec OBJECT had
survived the token strip (invisible to THE EYE — group B is never captured); STATE_6 opened at
θ=25° (`vgAnimValue` pre-rolls the ramp's `from` — the authored 69.3846 was dead config; a holding
window now precedes a 69.3846→115 ramp); two epic mirrors still said `d =`; and the missing d₁
label was **FRAMING** (camera r=5.0 sat outside `VG_SCENE_RADIUS` 4.5; label point 47.4° off-axis)
— fixed by authoring (camera → sibling r=13), pixel-verified, `vg_lp_line_label…` CLOSED with the
root cause proven. eye-walker verified 6/7 fixes from pixels; its two refutations were themselves
refuted with evidence (the high-θ detachment does not reproduce on the new camera at the exact
filed control angle 115.0°; STATE_4's "swap" is a 600 ms grow under 1 s sampling plus the
DELIBERATE disjoint-window gap of §5 — one design-record sentence fixed).

**The engine stack (founder-authorized, Rule 40, ONE bug_class each, sequential+stacked off
master 63ae197 — gate 712 → 1015 PASS across it):**
| PR | mechanism | queue row |
|---|---|---|
| **#108** | projection defers an angle token its arc owns (ownership at arc RESOLUTION — the perpendicular-line 90/0 promise survives) | `vg_projection_…` CLOSED (its own script rides the PR) |
| **#109** | `segment_length` token — the borrow is unrepresentable; latent co-arrival overwrite killed | `vg_segment_length_…` CLOSED |
| **#110** | θ row label DERIVED from what the knob rotates (never a per-mode literal); bare θ where nothing rotates | `vg_theta_deg_…` CLOSED |
| **#112** | norm bars: the defect was the FONT (serif has no usable U+2016 — both strokes merged at 13px; the string was always correct, `git log -S` proves it); panel fallback → monospace | NEW row `vg_readout_norm_bars_merge_to_one_stroke_in_the_readout_font_stack` filed FIXED |
| **#113** | authored `animate_loop_ms` (wrap inside `vgAnimValue` — reveals structurally unwrappable; first-cycle pin + D7 refuses `reveal_hold` on a looping state; deriveStateMeta same commit) | `vg_explore_animate_windows_…` OPEN pending S9 authoring |
| **#114** | authored `group_controls` (flat fallback; picker-path display re-run only; scene_group unpartitionable; inertness counts corrected — A=2, B=4, the filed row had them swapped) | `vg_explore_controls_…` OPEN pending S9 authoring |

**ALL SIX MERGED** in that order (founder-run, each child retargeted to master before its merge so
no base was ever deleted under an open child — the #92 incident). Branches deleted after.

**The merge-gated authoring follow-ups then LANDED** (they were blocked until the merges — the Δ7
scar forbids authoring against an unmerged mechanism): STATE_3 `value_readouts` gained
`segment_length`; STATE_9 collapsed to the closed two-window ping-pong + `animate_loop_ms: 18000`
and authored `group_controls { A: [lambda, lambda_span, half_extent, q_height], B: [theta_deg,
line2_offset] }`. Gate §27(i)/§28(h) — deliberate forcing functions that hard-FAILED until then —
now PASS. **Re-baseline note still live:** #112 changed the norm-bar glyph, so any state printing
`‖n‖`/`‖d₁×d₂‖` differs from a pre-#112 baseline BY DESIGN (Rule 34e, founder decision).

**RE-AUDIT ROUND (same day, after the merges).** quality_auditor re-ran: every prior fix HELD
(F1/F3/F4/F5 + all three follow-ups verified from pixels; S3's label flips `segment length` → `distance`
on the SAME number, so the relabel is honest; S9's loop proved BYTE-IDENTICAL t=1000 ≡ t=19000). It then
FAILED the build on two defects **both** audits had missed, now fixed (`f808dfe`): the anchor **`a`** was
named on three formula surfaces and labelled in no state — STATE_1 now draws it, revealed before the line
grows out of it — and **both ring cuts ended on a promise of a state their preset hides** (the skeleton's
per-preset remedy is UNAUTHORABLE: `presets` carry only `hidden_states`), now cut-safe in one sentence
each. Both filed as new FIXED rows with prevention rules. A stale STATE_6 note (25°→115°) corrected in the
JSON and the skeleton. eye-walker's 4th walk: CLEAN, 0 new findings; its one refutation (S6 apex at θ=115°)
was itself refuted by measurement — apex-to-arm distance is **0.000000 at every sampled instant**, since
each `offset.along` is parallel to its own `dir`; the row is scope-corrected, not reopened.

**Queue now: 13 OPEN for this concept** (from 26). Nothing left OPEN is a defect this concept introduced —
they are engine/gate classes it reproduces, the two documented residues, and one scope-corrected row.

**Founder-taste items, no rows filed:** the S1→S2 patch-shrink at the seam (auditor F7 — the
normal is safe, the plane's opening frame is a taste call); STATE_4's near-end-on Lpar (~30 px
stub); STATE_7's two arcs visually indistinguishable at 55°/35°; Gate-20 warning
`parallel_form_stem` missing on q3–q7. **Still OPEN with residue:** `vg_offset_animate_…` (a θ
drag during [0, 8000) detaches the arc — the slide beat's aux ramp is un-seizable; probe must
sample that window).

---

## 0.00 RESUME 2026-08-21 (late) — CP-B cycle 2 verdict is in. TWO AGENTS WERE IN FLIGHT. Read this first.

**Status: `founder_proxy` Checkpoint B cycle 2 returned `FIX(engine)` BLOCKING + one authoring FIX.
Both were dispatched. The dispatching session ran out of context before their reports landed.**

### ⚠ FIRST: recover the in-flight work

Two agents were working when the session ended. **Their edits are on disk; their reports are lost.**

**(a) `field3d-surgeon` — F1, the blocking engine fix.** Desk:
`/Users/karthikyerragadda/Desktop/Viditra/Physics-mind-fix/vg-readout-subject-label`
(branch `fix/vg-readout-subject-label`, cut from `91c55b0f`). It was told to hand back **uncommitted**.
```bash
cd /Users/karthikyerragadda/Desktop/Viditra/Physics-mind-fix/vg-readout-subject-label
git status --short && git diff --stat
```
Expect: a modified `src/lib/renderers/field_3d_renderer.ts`, a modified
`src/scripts/check_vector_geometry_3d.ts` (new section + negative controls), a new
`src/scripts/_seed_engine_bug_queue_vg_readout_subject_label.ts` and its migration, and **two untracked
concept JSONs** (`mathematics/lines_and_planes_in_space.json`, `vector_products_in_space.json`) that are
THE EYE fixtures — **never stage those.** Re-run the verify chain yourself before committing; do not
trust an unseen report. Then commit, push, `gh pr create` against master (Rule 40: its own PR).

**(b) `json-author` — F2, the authoring fix.** It edits
`<CHAPTER DESK>/src/data/concepts/mathematics/lines_and_planes_in_space.json` **in place**, so its work is
simply there. `git diff` in the chapter desk shows what landed. Re-verify (`tsc`,
`validate:mathematics`, `check:vector-geometry-3d`, rebuild, re-seed, THE EYE) and commit.

### State

| | |
|---|---|
| Chapter branch | `feat/mathematics-lines-and-planes` @ **`4f8950e2`** + whatever json_author added, **0 behind master** |
| Engine desk | `fix/vg-readout-subject-label` @ `91c55b0f` + uncommitted F1 work |
| PR #133 | **MERGED** (`91c55b0f`) — the acute fold + the θ control row are on master |
| Merged desk to close | `npm run desk:close -- fix/vg-acute-line-angle` (its job is done) |
| THE EYE | `.visual_runs/lines_and_planes_in_space/20260821-181625/` — 39/40 (`STATE_9:D5` false positive) |
| founder_drive | `.founder_runs/…/2026-08-21T15-20-21-596Z/` — 11/11 drags moved, 0 errors |
| `quality_auditor` | **PASS** (on the pre-F1/F2 build) |

### CP-B cycle 2 — what it found

**F1 · BLOCKING · engine.** `field_3d_renderer.ts` hardcodes `d_dot_n: "n·d"`, and the comment above the
resolver states the premise it rests on: *"on the state this exists for, both lines carry the same generic
label d."* That was true until **cycle 1's own P1-B fix** renamed `Lpar` to `d′` (to fix two lines both
called `d`). So for STATE_4's first 9.5 s the HUD prints `n·d = 0.000` while the only line on screen is
`d′` — on the state whose declared misconception IS what `n·d = 0` means. Fix: derive the row label from
the subject's authored label (`arrivedMeets[0].line` already carries it at the publish site).

**F2 · P1 · authoring.** Rule 25 is scored **per state**, not per concept. S2/S3/S9's formula surfaces name
`a` and none draws it; `r` is named by three surfaces and labelled nowhere (the λ marker IS `r` — label
the marker, don't add an object); S3's formula says `D` while the HUD says `distance`; `par_tag` is
**2.50 wu off** the line it tags.

**F3 · ride-along · engine.** Label sprites are scaled in WORLD units (`pmCreateAutoLabel`), so on-screen
glyph size is purely `1/distance`. The letter `d` renders **137 ink px in S1 and 7 in S4** — a 19× range
for one glyph in one concept — and `par_tag` renders 411 px beside them. Every framing pass silently
rescales every label. **This is why the interim matters:** if F1 lands without F3, STATE_4 prints a correct
`n·d′` beside a 7-pixel `d′`.

**F4–F7 · P2/P3.** 16 of 38 sentences carry no `glow` (S5 binds 1 of 6 — its whole skew-lines beat is
unbound) · S7's `55°`/`35°` sit ~660 px from the arcs they describe · four Rule-41 register slips
("return from", "leaves zero", "settles") · no `variable_choreography` in the JSON (all four sibling
mathematics concepts have it; the Rule-31 table does exist in skeleton §3).

**Tooling scar, worth fixing on its own:** `query_engine_bug_queue.ts --scenario` / `--field3d` return
**zero rows** for every mathematics and chemistry concept, because `loadConceptIndex()` reads only
top-level `src/data/concepts/*.json`. Query by concept id until fixed.

### THE PATTERN THIS CONCEPT KEEPS PRODUCING — five instances now

**A value in one file that is a function of a value in another, with the link recorded only in prose.**
1. S5's crossing marker ← camera centre (broke when the camera moved; **31.4 px off an 11 px crossing**)
2. the same marker again ← the second camera move
3. S5's `camera_steps` target ← S8's entry pose (moving one end breaks the seam)
4. S2 ↔ S7's shared entry camera ← a deliberate home-pose callback
5. **F1**: the engine's readout constant ← the concept's line label

**Nothing failed in any of them.** Not THE EYE, not the validator, not the scenario gate — every frame
stayed internally consistent. All five are now recorded in `physics_engine_config.constraints` beside the
values, with the rule: *a camera literal shared between two states is ONE value whichever fields hold it.*

`founder_proxy` widened it correctly and it is worth carrying: my proposed `derived_from_camera` stamp is
**too narrow** — F1's function is `engine constant ← concept label` and F3's is `legibility ← camera
radius`, neither of which is a camera literal. The honest form is
**`derived_from: {source, field, value_at_authoring}`**. Schema/founder call, does not gate this concept.

### Next actions, in order
1. Recover and commit both in-flight results (above). F1 gets its own PR.
2. Re-run `quality_auditor` on the combined result.
3. Re-dispatch `founder_proxy` **cycle 3 of 3** — it asked specifically for a fresh EYE run of STATE_4 and
   said it will re-review that state; F3's ride-along and F4–F7 do **not** need another round from it.
   **Cycle 3 is the last before ESCALATE.**

### Standing constraints — treat as binding
- **S5's radius is at its exact minimum.** 9.5 works; 9.4 loses 755 ms of label visibility. Any change to
  S5's ease endpoints, `ease_ms`, `scene_radius`, or the `d₁`/`d₂` label strings re-opens F3.
- **S8's `d₁×d₂` ↔ `a₂−a₁` gap is 13.5 px** — tightest in the concept, 1.5 px of margin. No further S8 pull-back.
- **S2 ↔ S7 share one camera literal.** S2 is the second-widest state at 63.9%, i.e. what a framing pass
  reaches for. Decide the pair together or the callback dies silently.

---

## 0.01 RESUME 2026-08-21 — paste-and-go. Everything is pushed; nothing is in flight.

**State: CP-B cycle 1's three P1s are APPLIED. The next action is one audit, then CP-B cycle 2.**

### Where things are

| | |
|---|---|
| Chapter branch | `feat/mathematics-lines-and-planes` @ **`529b592f`**, clean, pushed |
| Engine branch | **MERGED** — PR #133 landed on `master` 2026-08-21 as merge commit **`91c55b0f`** (both `f95347f0` the acute fold and `a7d1f334` the θ row label). The desk `Physics-mind-fix/vg-acute-line-angle` can be closed (`npm run desk:close -- fix/vg-acute-line-angle`); its only remaining content is two untracked THE EYE fixture JSONs. |
| Office | on `master`, clean (desks are visited, per `GIT_WORKFLOW §7`) |
| desk:audit | `0 commits exist only on this machine` |
| THE EYE (current) | `.visual_runs/lines_and_planes_in_space/20260821-160907/` — 39/40 (`STATE_9:D5` = dispositioned false positive) |
| founder_drive | `.founder_runs/lines_and_planes_in_space/2026-08-21T09-13-40-278Z/` — **STALE**, predates the cycle-1 fixes; re-run before CP-B |

### FIRST COMMAND ON RESUME

```bash
cd /Users/karthikyerragadda/Desktop/Viditra/Physics-mind-mathematics-lines-and-planes
git fetch origin && git status -sb          # expect: up to date with origin, clean
npx --yes http-server review-site -p 8087 -c-1 &    # CP-B reads the served page
```
The desk already has `node_modules` and `.env.local` linked. If the desk is gone:
`git worktree add <path> feat/mathematics-lines-and-planes`, then symlink both from the office.

### THE NEXT ACTION — one `quality-auditor` dispatch, then CP-B cycle 2

A `quality_auditor` pass on the cycle-1 fixes was **dispatched and stopped mid-run** (no verdict, no files touched — it is report-only). **Re-dispatch it.** It must verify:

1. **P1-A** — `vgThetaRowLabel` now reads `turn d₂`, agreeing with the readout across the whole slider range on STATE_6 **and** STATE_9 group B (which has no angle readout at all, so the row was previously uncontradicted).
2. **P1-B** — STATE_4: `Lpar` = `d′` (U+2032), `Lcut` keeps `d`; `par_tag` (a `size: 0` point, label-only) carries `n·d′ = 0`; `X_live` (`10300`–`15000`) closes the blank HUD from 6.0 s to 0.6 s — **the windows must stay disjoint from `X` (~15600)** or the panel publishes nothing and records a conflict. STATE_4 = 55 words.
3. **P1-C** — framing: before `31/34/29/28/34/35/29/34/30` → after `64/64/41/41/68/48/47/68/43`. **S3, S4, S9 remain under 45% as documented refusals** (their worst vertex clips before the radius gets smaller). Judge the refusals; overturning one is a legitimate outcome.
4. No regression on the cycle-0 fixes (F1–F11) and all nine word budgets.

**Tell it the measurement caveat** — founder_proxy and I both measured S4/S9 at ~60% and were both wrong, because our masks stopped at `y < 120` while STATE_4's HUD runs to y≈135 and S9's explore panel is taller. Use a **per-state** chrome mask (HUD box, slider box incl. S9's view dropdown, caption pill, formula box); a blanket `x < 360` column under-reports instead, by truncating real geometry.

**Then** re-run `founder_drive` (the dump above is stale) and dispatch `founder-proxy` **Checkpoint B, fix cycle 2 of 3**.

**Consequence of the merge for this branch:** the chapter branch carries the two engine commits as
cherry-picks (`b596a343`). They now exist on master too, so the next `desk:sync` will reconcile them —
expect the cherry-picks to drop out cleanly. The branch is **38 behind master**; that sync is owed before
PR #96 can merge and should be its own deliberate `git-steward` step with the conflict-stop rule live
(above all on the six Rule-40 platform files), not folded into a fix round.

### Carry into CP-B cycle 2 as known-open (all dispositioned; none authorable)

- ~~PR #133's merge~~ — **DONE**, merged as `91c55b0f`. The acute convention is now platform-wide: every `vector_geometry_3d` concept gets the folded readout and the honest control-row label, and `vector_products_in_space` inherits it with its obtuse `θ (a, b)` untouched (proven byte-identical across 261 frames pre-merge).
- **Two unstamped pools** — `vg_lp_arc` AND `vg_lp_right_angle` never call `stamp()` and are absent from `brightenOnly`, so both are force-dimmed to 0.4 whenever ANY glow is active. STATE_7's two arcs carry the only two numbers that state teaches. Filed; the row was corrected on 2026-08-21 (my first version said "one pool" and understated it). `peter_parker:field3d_surgeon`.
- **Multiplicative peer-dim, BOTH branches** — `GLOW_DIM_OPACITY = 0.4` is absolute, so a 0.28 plane's "dim" makes it brighter; the focal branch's `opacity = 1.0` discards authored `ghost`. Should scale against `_glowBaseOp`.
- **F6** — `aux_a` has no slider path in `LP_KNOBS`, so the concept's own aha cannot be re-run by hand. S9 recipe is written into the skeleton, ready.
- **S9's pairwise-separation metric** — solved at the old R14/R13, not re-run at the new R10/9.8. Nothing looks collinear; unverified rather than verified.
- S5's pulse co-location (Rule 25) · Δ11 · Δ12 · the ghost-arrow row · `vg_lp_angle_arc_apex_…` still open on S4 · STATE_1's `λ: -0.00` · S8's `s8_1` lead-in miss · FLAGs 1/4/6/8.
- **Not defects:** mathematics isolation (registers NOWHERE); no `audio_manifest.json` (Rule 30h); no `text_hi` (Rule 30i); `STATE_9:D5`; H2-no-baseline.

### Two lessons this round earned — apply them, don't rediscover them

1. **Where a mechanism is invisible to THE EYE — glow, TTS-driven reveals, teacher drags — a green EYE run is not evidence about it.** A 39/40 sat on top of a live glow defect for a full round. The authoring check IS the gate there, so it gets a machine probe, not a prose assurance.
2. **Two independent measurements agreeing can still be identically wrong.** founder_proxy and I both read left-hand chrome as geometry. When a number decides work, re-derive it with a different instrument, not a second opinion using the same method.

---

## 0.02 SESSION 2026-08-21 — CHECKPOINT B CYCLE 0 RAN. Read this before §0.03.

**`founder_proxy` Checkpoint B was finally dispatched** (the thing §0.03/§0.05 could never reach) and
returned **FIX**, not APPROVE. Its headline finding is the most valuable thing this concept has produced.

### 0.02a — the 115° bug: what thirteen audit passes could not see

STATE_6 printed `angle = 115.0°` beside its own formula surface `cos θ = |d₁·d₂| ⁄ (‖d₁‖‖d₂‖)`, whose
absolute value **defines** the between-lines angle as acute. The equation on screen gives **65.0°**.
A Class-12 student taking 115° into a CBSE paper is marked wrong.

It survived 13 `quality_auditor` passes, 2 `eye_walker` walks, `check:vector-geometry-3d`, and THE EYE
because **no gate compares a formula surface against the RANGE its own readout can reach**. The geometry
was right, the rendering was right, the number was wrong.

Root cause was one line: `vgResolveLinesPlanes`'s line-line arc branch took `val = vgAngleDeg(u0, u1)`
raw, while the two sibling branches (`.normal`, plane) fold and say so in a comment.

**The founder chose the engine fold over capping the sweep, and the architect turned it into the state's
best beat:** the direction still turns 115° while the reported angle rises to 90° and comes back DOWN to
65° — the one place the `|·|` becomes visible motion rather than notation. It earned a **fourth**
`misconception_watch` (M4) on a concept that had exactly three genuine pivots.

- Engine: **PR #133** (`fix/vg-acute-line-angle` @ `f95347f0`) — MERGEABLE/CLEAN, CI green, vitest 386/386.
  One statement; `check_vector_geometry_3d.ts` gains **§30** with negative controls that rebuild the
  resolver MINUS the fold and fire on every claim, plus an assertion that the folded value EQUALS
  `acos(|d₁·d₂|/…)` at 91 samples (so a lazy `min(v,90)` clamp fails). **Not merged — founder's call.**
- Chapter branch carries it as a **cherry-pick** (`b596a343`), identifiable as such; it drops out on the
  next master sync.

### 0.02b — the second P1, and the eleven others

**F2** — `s8_4` called the 1.685 triple product *"how far the lines start apart"* while the magenta
`a₂−a₁` beside it is drawn **2.308** long. Now *"the gap between the starting points, measured along this
direction"*, which reproduces **1.7999996**. **F3** S4's `Lpar` ghosts instead of hiding, so the pinned
frame carries both halves of "Crosses, or never touches". **F4** S7's `Lcut` re-anchored to its own
intersection with P1 — **`vg_lp_angle_arc_apex_…` is now CLOSED on S7** (still open on S4: partial
discharge, do not read "fixed" as fleet-wide). **F5** the CBSE tag shipped `verified: true` beside
evidence reading "NOT a teacher confirmation". **F8/F9/F10/F11** titles, dialect, ghost opacity, dead keys.

### 0.02c — the glow batch: fixed three times, wrong twice

CP-B's **F7** asked for glow bindings on 33 unbound sentences. 26 were authored and reported as *"ids
verified against the `stamp()` call sites"* — a report specific enough to be believed (it correctly caught
that normals stamp as `P1.normal`, and that the λ marker generates as `L1_lambda`). **Both true.** But it
answered *"does an object with this id exist?"* rather than *"is an object of this TYPE ever stamped?"*

Three rounds, each finding what the previous checker did not model:

1. **Stampability.** 5 bindings named ANGLE ARCS. Arcs are the one vg pool that never calls `stamp()`,
   and `vg_lp_arc` is absent from `brightenOnly` — so an arc is an unmatched PEER that takes `touchOp` →
   `GLOW_DIM_OPACITY = 0.4`. Naming an arc **INVERTS**: the one object the sentence is about is the one
   object that dims. On the two states whose entire subject IS an arc.
2. **Visibility at sentence time.** `s5_3 → crossing_mark` could never fire — marker hides at 3500 ms,
   sentence plays at 9.45 s.
3. **Element type safe as a focal.** `s2_4 → P1` would have made the plane **fully opaque** — the focal
   branch writes `opacity = 1.0` under `touchOp`, against a plane base of 0.28.

**22 bindings survive**, verified on all three axes. **THE EYE cannot see any of this by construction** —
its capture path never sends `SET_GLOW` — so a green 39/40 sat on top of a live product defect for a full
round. `build_review_site` fires the glow on the STATE CLOCK, narration on or off.

Rows filed (`f0b97bc0`): the ENGINE gap (OPEN, `field3d_surgeon`, founder call) and the AUTHORING instance
(FIXED). Prevention rules worth carrying: **enumerate the id-PRODUCING sites, not the consuming ones**; a
claim that ids were "verified against the engine" **names which sites it read and what legal set resulted**;
and **where a mechanism is invisible to THE EYE, a green EYE run is not evidence about it** — the authoring
check IS the gate, so it gets a machine probe, not a prose assurance.

### 0.02d — founder calls now stacked (none authorable)

| item | owner | note |
|---|---|---|
| **PR #133 merge** | founder | the acute fold; unblocks #96 |
| arc `stamp()` + `vg_lp_arc` in `brightenOnly` | `field3d_surgeon` | makes arcs glowable fleet-wide; the concept's own `focal_primitive_id` is `"arc1"` |
| **multiplicative peer-dim** | `field3d_surgeon` | wider than the arc row: a NON-focal plane goes 0.28 → 0.4, so the "dim" makes it MORE opaque on S1/S2/S3/S4/S7. An absolute constant is wrong for any element whose base sits below it |
| θ slider label vs HUD | founder routing | row reads the ROTATION knob (`112°`) beside the measured angle (`67.5°`); correct before the fold |
| F6 — `aux_a` slider path | `field3d_surgeon` | the concept's own aha cannot be re-run by hand; S9 recipe is written into the skeleton, ready |
| S5 pulse co-location | `alex:architect` | pulse fires 2.0–3.5 s, ~6 s before the sentence naming it (Rule 25) |
| Δ11 · Δ12 · ghost-arrow row · S1 ghost contrast | as filed | unchanged |

### 0.02e — state

Branch `feat/mathematics-lines-and-planes` @ `276a29fb`, pushed, 0 local-only. Word budgets S1 52 · S2 55 ·
S3 54 · S4 55 · S5 55 · S6 54 · S7 47 · S8 54 (all inside Rule 31). THE EYE `20260821-092650` 39/40 (the
known `STATE_9:D5` false positive). `eye_walker` CLEAN, 0 new rows. Nothing baselined, nothing in
`PILOT_CONCEPTS`, **PR #96 must not merge.**

---

## 0.03 SESSION 2026-08-20 (evening) — CP-B ROUND 1: the audit fix round. READ THIS FIRST.

**What happened:** the §0.05 CP-B dispatch could not run as written. Its dispatch ③ (`founder_proxy`
Checkpoint B) has an entry condition — *"after quality_auditor PASS + eye_walker + the drive dump"* —
and `quality_auditor`'s standing verdict was **FAIL**. Dispatches ① and ② were run; ① FAILed again on
new findings; a full fix round followed. **`founder_proxy` was never dispatched this session.** The
CP-B dispatch text in §0.05 is still valid and still the next action — with the corrections in §0.03d.

### 0.03a — the two audits

| pass | verdict | findings |
|---|---|---|
| 4 (re-audit of the stale FAIL) | **FAIL** → `alex:architect [reason: pass-1]` | F1 MAJOR (S6 zero-pixel beat + S9 inert slider), F2 MAJOR (motion floor on 6/8), F3–F5 MODERATE (record integrity), F6 MODERATE (Rule 41 idioms), F7/F8 report-only |
| 5 (post-fix-round) | **FAIL** → same route | **7 of 8 closed with machine evidence**; F1a alone survived — the *replacement* carrier was also invisible |

The three prior findings (#118 tube radius, S6 pacing cell, S4 d/n collision) all **held**.

### 0.03b — what was fixed, and the one that took two attempts

**S6's slide beat, twice wrong for two different reasons — the round's real lesson.**
1. *Original:* `offset.along` authored **exactly parallel** to `dir` (|dot| = 1.000000) on a
   scene-clipped line. Provably invariant: endpoints are `anchor + d·(−b±s)`, `b = anchor·d`;
   translating `anchor → anchor + t·d` leaves the discriminant unchanged. **0–3 px/s.**
2. *First fix (`show_dir_arrow`)* — the architect's declared carrier, flagged
   `ASSUMPTION — probe-before-authoring`. Falsified: `THREE.ArrowHelper` draws **collinear with and in
   the same colour as** its tube (`field_3d_renderer.ts:14559-14566`). **52–99 px/s** — an order of
   magnitude *under* THE EYE's own D5 floor. The assumption flag was right to be there.
3. *Shipped:* `lambda_span: [-4.5, 4.5]` (= `VG_SCENE_RADIUS`, so the rest pose is pixel-identical —
   Rule 32d home pose kept) + a neutral point `a1` riding M1's anchor on the same knob (STATE_3's
   `foot_sweep` pattern). **261–560 px/s.** Verified run `20260820-211735`.

**Also closed:** S9's `line2_offset` now moves M2 along `n̂c = normalize(d₁×d₂)` so `skew_distance`
tracks live (1.800 → 0.800 → 0.000 → 3.500, **trusted-event** drive); the **OPEN MAJOR apex scar**
(M2 now carries no offset — rotate only; full θ×aux_a sweep reads **0.0000 wu**); five durations
re-timed with three genuinely missing beats added (S4 arrival slide, S7 `normal_part`, S8 staged
reveals); the lowercase-`d`-as-distance sweep across three files; two Rule 41 idioms.

### 0.03c — the four things no gate could see

Each was found by a hand pixel-diff or a trusted-input drive, never by THE EYE (39/40 on **every**
capture this round — the 1 is always the known `STATE_9:D5` false positive):

1. **S6's taught beat was invisible inside a passing state** — D5 scores a whole state, and the later
   rotation (1700–2100 px/s) lifted the average past the floor. Twice.
2. **A synthetic-event slider drive reports the authored static** — `quality_auditor`'s first S9 drive
   read `1.800` at *every* value including ±2.5. vg sliders need `ev.isTrusted`. **Any drive dump built
   on synthetic events is evidence about nothing.**
3. **A number preceded the vector it names by 11–13 s** (S8) — created *by* the F2 re-timing.
4. **The eye-walker's θ=115° apex claim was wrong** — `vgAnimValue` holds a knob at its final value, so
   `aux_a` sat at 0 through the rotation; a pixel fit put the crossing at (639.5, 359.5) ±0.05 px
   throughout. The scar is real but fires **only under a teacher θ-drag during the slide** — which THE
   EYE never performs and the drive dump never reached.

### 0.03d — corrections to §0.05's dispatch text, apply before re-using it

- **Run dir** is now the latest under `.visual_runs/lines_and_planes_in_space/` (`20260820-211735` or
  later) — **not** `20260820-183954`, and the drive dump `2026-08-20T16-57-52-257Z` is **pre-fix**:
  its 11 drags never touched `theta_deg` or `line2_offset`. Re-run `founder_drive` before CP-B.
- **Do not repeat** §0.05's "two deliberate scope corrections" line for the apex row: it is now
  **FIXED**. The row to *not* re-report at S6 remains `vg_lp_angle_arc_apex_…`, which is confirmed
  live at **S7** (both arcs anchored at Lcut's anchor, ~250 px from the normal they measure to).
- **Two new founder calls to pre-explain** so CP-B doesn't spend a cycle routing them: **Δ11** (vg
  `#formula_overlay` has no timed reveal → the PRIMARY-aha formula is on screen from frame 0) and
  **Δ12** (F13b publishes all three readouts on the common perpendicular's arrival → `cross_norm`
  leads `cross_vec` by 4 s under the shipped interim). Both `[owner: peter_parker:field3d_surgeon]`,
  both Rule 40 platform files, neither dispatched.
- **S6 ships at camera R 13**, not the §5 R-5 solve — a ±4.5 line overflows the frame at R 5 and the
  endpoint carrier leaves the screen. The ≈6° arc-fidelity residual is accepted, readout authoritative.

### 0.03e — bookkeeping

Scar script: `src/scripts/_seed_engine_bug_queue_lines_and_planes_cpb_round1.ts` (5 new OPEN rows —
all engine/tooling founder calls; 2 new rows filed already FIXED; 1 existing MAJOR closed; 4
annotations). Files touched this round: the concept JSON, the skeleton, the mathematics block.
**Nothing baselined, nothing in `PILOT_CONCEPTS`, PR #96 still must not merge.**

---

## 0.05 RESUME 2026-08-20 — the CP-B dispatch, paste-and-go

**Start the session IN `physics-mind/`, not in the `Viditra` parent** — a parent-folder session loads
**zero** project agents, so `founder-proxy` / `quality-auditor` / `eye-walker` silently fall back to
general-purpose. That is what blocked CP-B on 2026-08-20.

```bash
cd /Users/karthikyerragadda/Desktop/Viditra/Physics-mind
git fetch origin && git checkout feat/mathematics-lines-and-planes && git pull
npm run build:review -- lines_and_planes_in_space
npx --yes http-server review-site -p 8087 -c-1 &     # CP-B reads the served page
```

**Run the three dispatches IN THIS ORDER.** B's entry condition is *"after quality_auditor PASS +
eye_walker's verdict table + the founder_drive dump"*, and as of 2026-08-20 the first two are stale:
`quality_auditor`'s last verdict was **FAIL** (pass-3 audit; findings fixed by #118 + `fab6235`, never
re-run to PASS), and `eye_walker`'s 4th-walk CLEAN verdict **predates #118**, so it certifies hairline
pixels. The drive dump is current and is the only one of the three already in place.

### ① `quality-auditor`
> Audit `lines_and_planes_in_space` (mathematics, 9 states, `vector_geometry_3d` / `mode:"lines_planes"`).
> Branch `feat/mathematics-lines-and-planes`. This is a re-audit: your previous pass FAILED the build on
> three findings, all since fixed — the tube-radius defect became engine PR #118 (merged), and the stale
> S6 pacing cell plus STATE_4's d/n label collision landed in `fab6235`. Verify those held, then audit the
> four defects fixed on 2026-08-20 by the post-#118 walk and their two sweeps: STATE_3's hand-off
> (`perp` now `reveal_at_ms: 8950` + `grow_ms: 0` against `cmp`'s `hide_at_ms: 9000`), STATE_2's `v`
> label and its matching hand-off at 11150, STATE_7's stepped arc radii (0.62 / 0.95), and five corrected
> skeleton pacing rows. Concept JSON: `src/data/concepts/mathematics/lines_and_planes_in_space.json`.
> Skeleton: `docs/skeletons/lines_and_planes_in_space_skeleton.md`. Mathematics block:
> `docs/skeletons/lines_and_planes_in_space_mathematics_block.md`. Query the live `engine_bug_queue`
> (14 OPEN for this concept). Verdict: PASS / FAIL with routed findings.

### ② `eye-walker`
> Walk `lines_and_planes_in_space` and return your verdict table. Run dir:
> `.visual_runs/lines_and_planes_in_space/20260820-183954/` (post-#118, 40 checks · 39 passed · 1 skip
> · 1 failure). **The single failure is STATE_9 D5 and it is a known false positive** — a direct
> pixelmatch of its 21 dense frames reads 332–374 changed px on every adjacent pair, bbox marching
> x[482→744] and back in a palindrome about t=9000; the row is
> `visual_eyes_d5_ink_relative_lens_is_diluted_by_static_chrome_on_explore_states`. **The skip is H2, no
> baseline, and is correct — this concept has never been baselined.** Every pre-#118 pixel observation on
> this branch is VOID (a tube's radius was applied twice, so every line drew at ~4 % of intended ink), so
> judge only from this run dir and do not carry forward any earlier walk's findings.

### ③ `founder-proxy` — **CHECKPOINT B, fix cycle 0**
> Checkpoint **B**, `concept_id: lines_and_planes_in_space`, **fix cycle 0** (first B review).
> Review page: `http://localhost:8087/lines_and_planes_in_space/` (served).
> Concept JSON: `src/data/concepts/mathematics/lines_and_planes_in_space.json`
> Architect skeleton: `docs/skeletons/lines_and_planes_in_space_skeleton.md`
> Mathematics block: `docs/skeletons/lines_and_planes_in_space_mathematics_block.md`
> `eye_walker` report: *(from dispatch ② above)*
> THE EYE run dir: `.visual_runs/lines_and_planes_in_space/20260820-183954/`
> founder_drive dump: `.founder_runs/lines_and_planes_in_space/2026-08-20T16-57-52-257Z/`
> (9 states · 27 shots · **11 drags, all moved, none reverted** · 0 collisions · 0 flags · 0 console errors)
> Scar input: query the live `engine_bug_queue` — **14 OPEN** for this concept, and read the FIXED rows as
> the ratchet. Note two rows carry deliberate scope corrections you should not re-report:
> `vg_explore_state_is_a_still_picture_…` is discharged for this concept and narrowed to
> `vector_products_in_space`, and `vg_lp_angle_arc_apex_…` is scope-corrected away from STATE_6.
> **Context you need for Pass 1:** the 2026-08-09 xhigh review's 15 defects are all cleared; the
> 2026-08-20 walk found and fixed four more. Nothing here is baselined, nothing is in `PILOT_CONCEPTS`,
> and **PR #96 must not merge** before your verdict.

**Known-open going in, so they are not surprises:** S8's `d₁×d₂` / `a₂−a₁` labels sit at an **8 px** box
gap against a 12 px floor — the remedy is analysed on its row and is *not* a camera nudge (S8's pose is
S5's easing target; the whole nudge budget buys ~2 px). Δ1, Δ7 and Δ9 are absent from renderer and gate.
A fleet-wide minimum-ink check and a real label-separation gate are both still unbuilt. All three need a
Rule-40 engine dispatch, i.e. a founder call, not an authoring fix.

---

## 0. FIRST COMMAND ON RESUME

```bash
git fetch origin && git checkout feat/mathematics-lines-and-planes && git pull
npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts lines_and_planes_in_space --open
```
`.env.local` must be present in whatever desk you work from. Master is `bb73ee8`+; the branch is
`feat/mathematics-lines-and-planes` (PR **#96**, OPEN).

---

## 1. WHAT IS DONE AND MERGED — the durable asset

**Five platform fixes landed on master today, each separately per Rule 40.** Every one was found by
authoring and *walking* this concept, and every one was invisible to the deterministic gates.

| PR | fix | why it mattered |
|---|---|---|
| **#90** | D5 read `cached.physics_config` | A hand-seeded chemistry/mathematics cache row carries only `epic_l_path` — no states — so `deriveMotionExpectations` returned `{}`. **The motion gate had never run on ANY chemistry or mathematics concept.** First run of #9 read `39 checks · 39 passed` with **nine skips inside it**. Also explains why registering `vg` during the #7 wave "did not take": the registration was correct and *unreachable* |
| **#91** | `vg_vector_a`/`vg_vector_b` never hidden in `lines_planes` | Act I's explorer vectors rendered on **all 9 states**. Visibility is written TWICE (apply pass + per-frame updater); an apply-only fix would have been undone one frame later. 6 sites, one predicate |
| **#93** | readouts published before their subject existed | **19 sites across 7 constructs.** A panel-side fix would have been a **total no-op** |
| **#94** | `d.intersection` → `intersections[]` | Collision resolved by **REFUSAL, not precedence** — the tokens are names, not addresses |
| **#95** | reveal pin blind to `intersections[]` | The migration dropped STATE_4's pin **15900 → 10400 ms**. **Nothing would have failed**; the run goes green against the wrong frame |

`check:vector-geometry-3d`: **570/60 → 716 assertions / 85 negative controls.**

---

## 2. THE FIX LIST — in the order agreed with the founder

**All 13 rows are live and OPEN** (`discovered_in_session = session_2026-08-09_lines_and_planes_xhigh_review`),
plus 2 pre-existing rows this concept reproduces. Query them; each carries its own prevention rule and probe.

### 2a · FIRST — the scar-queue bookkeeping (mechanical, and it corrupts the record on every replay)
- `scar_seed_script_upsert_downgrades_a_row_that_was_fixed_after_it_was_authored` — **CRITICAL**
- `scar_migration_header_advertises_an_update_the_file_does_not_contain` — MAJOR

**The problem in one sentence:** the round-2 corrections (a `FALSE_POSITIVE` retraction, a CRITICAL
escalation, six PR-fix annotations) exist **only in the live DB**, while the committed scripts and
migrations still assert the round-1 state through unguarded full-row upserts — so replaying any of them
reverts FIXED rows to OPEN and resurrects a row this same session proved false.

**The fix, and it is already written down:** `src/scripts/_seed_engine_bug_queue_lines_and_planes_xhigh_review.ts`
**carries the guard the others lack** — copy its `PROTECTED` check and its
`WHERE engine_bug_queue.status NOT IN ('FIXED','FALSE_POSITIVE')` conflict predicate into the three
earlier scripts and regenerate their migrations. Then commit the round-2 corrections as their own
migration; a correction living only in a database is not in the record at all.

### 2b · SECOND — the two one-line-per-site authoring fixes
- `vg_state_authors_controls_without_show_sliders_so_the_row_is_unreachable` — add `show_sliders: true`
  to STATE_1, STATE_2, STATE_6. Their `controls` and `control_ranges` are dead config today; on STATE_6
  the narration says *"Now turn one direction"* and there is nothing to turn.
- `vg_offset_animate_ends_off_zero_so_a_rotated_line_leaves_its_shared_arc_apex` — STATE_6's second
  `aux_a` window must end at **0**, not −1.5. Measured: distance from origin to M2 is 0.000 at
  θ = 69.3846° but **1.049 at θ = 25° and 1.072 at θ = 115°**, so the arc's second arm detaches from
  its own apex for most of the state and on every teacher drag.

### 2c · THIRD — the timing / readout re-authoring (do LAST; it interacts with the reveal-gating shipped today)
- `vg_misconception_counter_number_arrives_after_the_false_picture_is_gone` — **CRITICAL.** STATE_5's
  `skew_distance` arrives ~5780 ms (`vgArrived` ≥ 0.999 through the easing, *not* `reveal_at_ms`) while
  `crossing_mark` hides at 3500 ms. **They are never co-present**, so the M3 rebuttal never happens.
- `vg_segment_length_readout_borrows_the_point_plane_distance_label` — **CRITICAL.** STATE_3's sweeping
  segment prints under the label **"distance"** for 9 s, asserting on screen the exact belief the state
  exists to break (and matching assessment q3's own distractor).
- `vg_projection_publishes_both_angle_tokens_before_either_arc_is_drawn` — STATE_7's answer is on the HUD
  ~11 s before the beat that derives it.
- `vg_readout_token_authored_on_a_state_whose_constructs_never_publish_it` — STATE_1/STATE_9's `lambda`
  row never renders at all. **Legality ≠ reachability**: the token is in the closed enum, so the enum
  cannot catch it.
- `vg_plane_reveal_fraction_scales_its_normal_so_a_carried_normal_is_deleted_and_regrown` — the chapter
  seam the skeleton forbids **by name**, reintroduced through a parent/child coupling invisible from the JSON.
- `vg_explore_controls_are_not_group_aware_so_half_the_sliders_are_inert`
- `vg_explore_animate_windows_are_finite_so_the_free_running_sandbox_freezes` — stops dead at 72 s.
  **Not fixable by adding windows** (a free-running clock has no end); needs an engine wrap/`ping_pong`
  or an idle sweep.
- `vg_explore_state_surfaces_advanced_ring_content_under_a_reduced_preset` — Rule 38a/38b, which the
  skeleton claims discharged in a section written before the explore state had two groups.
- `vg_one_symbol_carries_two_meanings_across_states_of_one_concept` — `d` is the direction for four
  states, then the distance in STATE_8's formula beside `d₁`/`d₂`.

### 2d · Pre-existing OPEN rows this concept reproduces (engine, not authoring)
- `vg_lp_plane_ghost_multiplier_applies_to_the_quad_but_not_to_its_normal_arrow` — STATE_1, breaks Rule 32e.
- `vg_lp_line_label_does_not_render_on_an_offset_animated_line_although_it_is_authored` — STATE_6's `d₁`
  is authored and never drawn. **Root cause UNPROVEN** — the row carries three discriminating tests;
  the eye-walk's dir1+offset attribution rests on n=1.
- Also open, found this session, not yet scheduled: `vg_theta_deg_slider_row_is_labelled_for_products_mode_objects_in_every_mode` ·
  `vg_readout_panel_is_unhidden_at_state_entry_before_any_frame_writes_its_rows` ·
  `vg_lambda_token_names_both_the_intersection_parameter_and_the_slider_knob` ·
  `visual_eyes_d5_ink_relative_lens_is_diluted_by_static_chrome_on_explore_states` (a gate FALSE POSITIVE
  — STATE_9's D5 failure is **not** a content defect) · `skeleton_discharges_a_scar_against_an_engine_delta_that_was_never_built` (Δ7 was never built).

---

## 3. AFTER THE FIXES — the verify chain, in order

```bash
npx tsc --noEmit                                   # 0
npm run validate:mathematics                       # 5/5 PASS, and READ THE WARN LIST — warnings do not fail the run
npm run check:vector-geometry-3d                   # ALL SECTIONS PASSED (716/85)
npx tsx --env-file=.env.local src/scripts/_seed_subject_cache.ts lines_and_planes_in_space
npm run visual:eyes -- lines_and_planes_in_space   # $0
```
**⚠ Re-seed the cache after ANY renderer or JSON change** — mathematics concepts are hand-seeded and
`assertCacheMatchesSource` hard-fails on drift (it exists because a session once walked 35 checks over
entirely pre-fix pixels).

**⚠ Check the skip list explicitly.** THE EYE's headline counts skips as passes. Expect exactly **1**
skip (H2, no baseline) and **1** failure (STATE_9 D5, the known false positive above).

Then: `quality_auditor` (never run on this concept) → `eye-walker` → founder review.

---

## 4. WHAT IS EXPLICITLY NOT DONE

No `quality_auditor` pass · no founder review · **no `visual:approve`, no baseline, no `PILOT_CONCEPTS`
entry, no TTS** · Checkpoint C not run. **Merging PR #96 is a founder decision and the review says not yet.**

---

## 5. MEASUREMENTS WORTH NOT REPEATING

- **Act I's chapter-seam camera is `[0.0, 8.0, 13.8564]` — R 16**, az 90 / el 30. The skeleton said R 9;
  az/el matched and the radius was *assumed*. A partial match is the most convincing way to ship a wrong pose.
- **`n·d` renders `0.574`, never `0.624`.** `vgLinePlaneMeet` normalizes both operands, so the token is a
  cosine: `cos 55° = sin 35° = 0.5736`.
- **`Lpar.dir` must be `[1, -0.35, 0]`, not a hand-normalized 6-dp form.** The rounded version gives
  `d̂·n̂ = 2.756e-07` — **276× the 1e-9 guard** — so the parallel branch never fires and the HUD prints
  `λ = −5,080,022` with a meeting point 4.8 M units away. Every gate was green while that was on screen.
- STATE_4's two intersections rely on **disjoint reveal windows** (Lpar 1000→9500, Lcut 15000+) so the
  engine's collision refusal is never reached. Widening either window silently blanks the readouts.

---

## 6. THE WORKING RULES THIS SESSION EARNED — apply them, don't rediscover them

1. **A check invariant under your likely error is not evidence.** I filed a `scene_group`-inert row after
   testing a *singular* `group` key; the JSON authors `groups` (plural), which is what the engine reads.
   Retracted as `FALSE_POSITIVE` — kept, not deleted, because the inference error is the lesson.
2. **A gate that is SKIPPED is not a gate that passed**, and a headline that aggregates skips into passes
   will read `39/39` over zero coverage.
3. **Reading frames finds what gates cannot.** Every MAJOR across three walks was one shape — *a text
   surface disagreeing with the picture beside it.* 716 assertions were blind to all of them.
4. **Fixing one surface exposes the one beneath it** — three times today. **Re-walk after removing an
   occluding element**; never assume the space it vacated is correct.
5. **Invite refutation and mean it.** Agents overturned me on the a/b fix (6 sites, not 1), the readout
   fix (19 sites, not 1), and the `groups` key. Every one was right.
6. **Rule 40**: engine/tooling files land on master **separately and immediately**, one `bug_class` per
   dispatch. Never `--delete-branch` on a PR that a stacked child is based on — it auto-closes the child,
   and a closed PR whose base is gone **cannot be reopened or retargeted** (cost one rebuild today, PR #93).
7. **A scar-queue write never downgrades**, and a correction applied only to the live DB is not in the record.

*Banked by founder decision. The engine ships; the concept waits — again, and for better reasons than last time.*
