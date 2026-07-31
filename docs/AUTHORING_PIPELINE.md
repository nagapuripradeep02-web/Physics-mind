# AUTHORING_PIPELINE.md — How every PhysicsMind simulation gets built

# Canonical SOP — v1.1 | 2026-06-10 (v1.1 2026-07-31: §0 Phase-0 chapter doctrine +
# engine-dispatch discipline + founder-proxy checkpoints, graduated from the chapter-loop trial)
# The end-to-end process for authoring ONE new simulation, from source to ship.
# Locked with founder (Pradeep) on 2026-06-10. Every session follows this exactly.

> **One frame:** Source the *pedagogy* from the best teacher → design the states →
> **look** (visual testing) → **professor gate** (before any student) → student.
> Every bug, fix, and lesson logged with a `prevention_rule` so the architecture
> compounds value from day 1 to day N.

This SOP is the *process* spine. It does not replace the deeper specs — it sequences them:
- **Pedagogy distillation** → `docs/pedagogy_sources/` (e.g. `T36_chapter_scope.md`)
- **Concept JSON authoring** → CLAUDE.md §6 + the Alex agent pipeline (architect → physics_author → json_author → quality_auditor)
- **Visual testing** → `docs/VISUAL_VALIDATOR_SPEC.md`
- **Patterns library** → `docs/patterns/<chapter>.md`
- **Compounding / feedback loops** → Session 59 audit (DISCUSSIONS.md Topic 3)

---

## The pipeline

```
For every NEW simulation:

①  SOURCE THE PEDAGOGY
    Pick a best, high-viewing YouTube professor explaining that concept.
    Pull the transcript → extract HOW he teaches it:
      what he stresses · the misconception he fights · the must-see moment · his teaching order.
      (Same role DC Pandey plays — we mine the TEACHING, never the words. See IP guardrail.)
        │
        ▼
②  DESIGN THE STATES
    Decide how to SHOW it to a cold student — the relationship in each state,
    state by state — then build it to the v2 gold-standard spec. Build it perfectly.
        │
        ▼
③  VISUAL TESTING — the eye  (MANDATORY, non-optional)
    Run the Visual Validator AND render every frame into Claude's own view.
    Confirm: what was DESIGNED == what was SHIPPED. Every issue visible, minor → major,
    nothing hidden behind a "ships with warning." Gap found → fix → re-test. No skipping.
        │
        ▼
④  PROFESSOR GATE  (before any student ever sees it)
    The reviewing professor (Asmi Singh) reviews the PEDAGOGY:
      "Is anything wrong, unclear, or out of order? Where will a student trip?"
    Take the feedback → update the simulation → re-run ③.
    The professor's lesson is ALSO logged to the queue with a prevention_rule (see below).
        │
        ▼
⑤  STUDENT  (later — only once the sim is proven correct + professor-approved)

   ┌──────────────────────────────────────────────────────────────────────┐
   │  RUNNING ALONGSIDE EVERY STAGE: engine_bug_queue + patterns library   │
   │  every bug / fix / professor-lesson → logged WITH a prevention_rule    │
   │  → every FUTURE simulation inherits it automatically                   │
   │  → value compounds, day 1 → day N                                      │
   └──────────────────────────────────────────────────────────────────────┘
```

**founder-proxy checkpoints (graduated 2026-07-31 — proven in the Ch.7/Ch.8 chapter-loop trial):**
the taste gate rides the pipeline at three points, in interactive builds as much as in the loop.
**Checkpoint A** — after the architect skeleton, BEFORE physics-author: dispatch `founder-proxy`
on every NEW skeleton (the highest-ROI quality slot; a mediocre design caught here saves the whole
build). **Checkpoint B** — after quality-auditor PASS + eye-walker: the four-pass build review
(`APPROVE` = authoring sign-off only, never shipping). **Checkpoint C** — before the concept is
sealed: diff the claimed fixes, no silent skips. Shipping stays founder-only (Rule 17) — the proxy
approves authoring, never releases. Full contract: `.agents/founder_proxy/CLAUDE.md`.

**⧉ LAND — the repo step that closes every build (added 2026-08-01).** Not a new numbered stage: a
companion to the checkpoints, run once a concept is sealed (Checkpoint C) — *before* the professor
gate ④, because Asmi cannot review what is not on GitHub. Committing is not backing up; a commit
that is never pushed exists on exactly one hard drive.

```bash
npm run check:renderer-syntax && npx tsc --noEmit && npm run validate:concepts && npx vitest run
git status && git add <the named paths> && git diff --cached   # NEVER `git add -A`
git commit -m "feat(<id>): <what>" && git push
gh pr create --title "…" --body "…"
npm run desk:audit          # must print: commits existing ONLY on this machine: 0
```

Delegate the whole step to the **`git-steward`** agent when the desk has drifted or the staging list
is long — it runs the verify chain, stages only what it was named, pushes, and opens the PR. Its one
hard boundary: **a merge conflict in any file under `src/` — above all the six Rule-40 platform
engine files — stops it dead and routes to the owning surgeon** (`field_3d_renderer.ts` →
field3d-surgeon; parametric / particle_field / premium_primitives → pcpl-surgeon). PR #10 is why:
nine hunks there looked like ordinary keep-both conflicts, and a naive resolution would have shipped
two HUD headers per body. It never merges to master, and it never touches `visual:approve`, TTS,
`PILOT_CONCEPTS`, or any deploy — Rule 17 shipping stays founder-only.

Desk hygiene is mechanical and belongs to `npm run desk:audit | sync | new | close`
(`docs/GIT_WORKFLOW.md` §7), not to memory: one desk = one branch = one job, opened when the job
starts and **closed when it merges**.

---

## §0 — Chapter opening: the Phase-0 doctrine (graduated 2026-07-31 from the chapter-loop trial)

Runs ONCE per chapter, BEFORE the per-concept pipeline above. Evidence: Ch.1–6 reused mature
scenarios and authored concepts as pure JSON (cheap); Ch.7 built its engine piecemeal per concept
— ~1,296M tokens for 6 concepts. Ch.8, with this doctrine + the engine-dispatch discipline below,
did equivalent work in ~177M. The cost driver of a chapter is UNPLANNED engine work (~42% of Ch.7
spend), so plan it once:

```
0a  CHAPTER SURVEY (cheap — architect-level)
    List EVERY concept in the chapter. For each: apparatus, what moves, what's
    measured, the explore state. → the UNION of engine needs.
    FIRST question: does an existing scenario family stretch? (Ch.3's CIRCUIT
    engine ended up serving seven concepts incl. wheatstone + potentiometer.)
    The cheapest Phase 0 is the one you discover you don't need.
        │
        ▼
0b  DEEPEST-CONCEPT DESIGN
    Full skeleton + physics block (EXACT functional forms) for the chapter's most
    demanding concept — this is the engine's real spec.
    → founder-proxy Checkpoint A on this skeleton BEFORE any engine code.
        │
        ▼
0c  ENGINE ONCE (only if 0a found a real gap)
    The owning surgeon (field3d-surgeon / pcpl-surgeon) builds ONE CONFIGURABLE
    scenario against the 0a union, specced by 0b's physics. The dispatch REPORT's
    closed enums are the authoritative JSON contract for json-author — they
    supersede the skeleton's literal guesses.
        │
        ▼
0d  CONCEPTS 1..N AS PURE JSON through the ① – ④ pipeline above.
    SUCCESS TEST: concepts 2..N require ZERO renderer edits.

⚠  ALARM RULE: a later concept forcing an engine edit means Phase 0
   under-generalized — STOP and re-scope the scenario with the surgeon.
   Never extend the engine per concept; that is exactly how Ch.7 got expensive.
```

## Engine-dispatch discipline (Amendment 4 — standing doctrine, graduated 2026-07-31)

Applies to EVERY engine dispatch, interactive or loop:

- **Route to the specialist:** field_3d root causes → `field3d-surgeon`
  (`peter_parker:field3d_surgeon`); parametric/particle_field → `pcpl-surgeon`
  (historical tag `peter_parker:renderer_primitives`); generator/serving/cache →
  `runtime-generation`. Never general-purpose for field_3d work (~25M tokens/dispatch
  re-exploring the renderer vs ~3.4M for the specialist — measured 2026-07-25).
- **ONE `bug_class` per dispatch.** Bundles are BANNED — a ten-bug bundle once burned
  156M tokens in 91 minutes (a long conversation re-bills its accumulated context every
  turn; ten short dispatches are far cheaper than one long one). Sole exception: same
  file AND same root cause.
- **~100-tool-call / ~45-min ceiling** per dispatch, then a clean handoff note and a
  fresh dispatch — never "push through to finish".
- **Diagnosed root cause ⇒ minimal re-exploration.** State it in the dispatch prompt so
  the agent executes instead of re-deriving.
- **Scoped cache clears:** when testing one concept, `npm run cache:clear:scoped -- <id>`
  (never a full-table wipe another session might be relying on).

---

## The `engine_bug_queue` lifecycle — before / during / after (the compounding circle)

The box above ("RUNNING ALONGSIDE") is the *what*; this is the *when*. `engine_bug_queue` is the
durable **scar list** — every past bug + a `prevention_rule` + an automated probe. It threads through
the pipeline at three moments, and reviewer feedback (`reviews/<slug>/<concept_id>/feedback.md`)
connects to it at the end. Mental model: a kitchen's "mistakes book" on the wall — read before every
dish, added to whenever a new mistake is found.

**BEFORE — design (stages ①–②).** The architect and the other Alex agents **read** the queue first:
it's the "mistakes never to repeat" checklist laid *over* the pedagogy sources. The queue does **not**
supply the sim's content (that's the professor video + HCV + NCERT + DCP) — it supplies the accumulated
lessons so the new design sidesteps every known trap. *(Architect spec carries a "consult the bug queue
before producing any artifact" contract.)*

**DURING — build + visual gate (stage ③).** The pre-flight auditor **replays** every relevant probe
against the candidate (Gate 8 = regression check). Any *new* bug found and fixed during the 1–2 build
rounds is **written** to the queue (`npm run log:lesson`, with a `prevention_rule`). Content bugs → fixed
by Alex; true engine bugs → Peter Parker.

**AFTER — professor gate (stage ④).** The reviewer (Asmi) returns two channels → we extract into
**`feedback.md`**, the per-sim inbox (see `reviews/README.md` + `reviews/REVIEWER_GUIDE.md`). Then the
4-bucket filter decides what — if anything — graduates *out* of `feedback.md`:

| A `feedback.md` item that is… | Goes to | Reaches the queue? |
|---|---|---|
| a fix for **this sim only** (a label, a state, an order tweak) | Alex edits this sim's JSON; stays in `feedback.md` | ❌ no |
| a **true engine bug** (renderer wrong for *all* sims) | Peter Parker fixes the engine **+ logs a probe** | ✅ yes |
| a **recurring mistake-class** (any sim could hit it) | `npm run log:lesson` → a queue probe | ✅ yes |
| a **teaching principle**, corroborated by a 2nd reviewer or doctrine | a numbered **CLAUDE.md rule** (founder approval) | ➡️ rulebook |
| one-off reviewer taste, not yet repeated | `reviews/README.md` candidate list (awaits reviewer #2) | ❌ not yet |

So **most reviewer feedback stays in `feedback.md`** (this-sim content fixes routed to Alex —
`json_author` / `physics_author` / `architect`); only the *"must never happen in ANY sim again"* slice
climbs into the queue. (For the full lesson-type → home mapping, see "Where every lesson gets filed"
below.)

**The circle (why it compounds).** Because the queue is read at the *start* of every new sim and
written to *during* + *after*, it grows each cycle — so sim #N+1 is born knowing every mistake sims
#1…#N (and their reviews) taught. Fewer mistakes → fewer iterations → the engine gets harder to break
every week.

```
   engine_bug_queue (scar list) ──read before──▶  ①② design a new sim
        ▲             ▲                                    │
        │             │                                    ▼
   written during ────┤                              ③ build + visual gate (Gate 8 replays probes)
   (build-time bugs)  │                                    │
        │             │                                    ▼
        │      written after ◀── 4-bucket filter ◀──  ④ Asmi → feedback.md
        │      (the "never-again" slice only)              │
        └────────────────────────────────────────────▶  (⑤ next sim starts smarter)
```

---

## Stage ② — the Definition of Done (build the COMPLETE version in ONE pass)

"Build it perfectly" only collapses the iteration count if you decide what *complete* means **before** building, then build to all of it at once. The `biot_savart_law` sim (2026-06-11) took ~7 founder turns because the spec arrived piecemeal — concept, then "add the symbols," then "add the right-hand rule," then "animate the hand" — each a separate round. Labels, the rule, and motion are **table stakes** for a direction-teaching field sim, not surprises. They belong in v1.

**Before building any sim, write its Definition of Done — the full list of what a finished version contains — and build to ALL of it before the first founder showing:**

- [ ] **The per-state control table FIRST (Rule 31 — required design artifact):** one row per state — *state × what it teaches × its motion archetype (named, from the Rule 31b vocabulary; no repeat except a declared contrast pair) × its DISTINCT motion (no two states alike, none static) × its delta (one line, "what changed vs the previous state" — becomes the state's ≤5-word caption cue, Rule 32c) × its live control(s) × narration budget*. Guided beats are straightforward — ONE idea + ONE complete motion, **25–55 EN words (2–4 tight sentences ≈ 10–20s; >55 = split, <~20 = merge)**, no Socratic predict→reveal; each state exposes ONLY its own relevant slider(s); the final explore state exposes ALL (`interaction_complete`). The panel is built ONCE in the scenario, rows shown/hidden per state; a shared slider keeps its screen position. **Legibility (Rule 32):** cause moves before effect (readable beat) · only the taught variable moves · same apparatus from a home pose (no teleport-rebuild) · one glow focal at a time. Shape exemplars: `faraday_law_induction` (S1–S4 none · S5 speed+turns · S6 all), `magnetisation_and_intensity` — clone their arc/controls, not their sentence length (their narration predates the word budget).
- [ ] Every EPIC-L state designed (count derived from the sub-truth list, never copied).
- [ ] Every vector/quantity the narration names has an in-scene **symbol label** (dl, r̂, θ, dB, B, F, v, μ, …).
- [ ] Where **direction** is taught: the correct **right-hand rule** on those states — grip rule for circulation, cross-product rule for a single dB/F. Right rule on the right state (see `patterns/magnetism.md`).
- [ ] **Motion wherever something moves or a rule is performed** — no static diagram where an animation teaches better (curling hand, flowing current, assembling field, orbiting tangent). The founder rejects passive states.
- [ ] **Conceptual mode ONLY** (founder directive 2026-06-11, CLAUDE.md Rule 20 suspension): do NOT author `mode_overrides.board` / `mode_overrides.competitive` — board + competitive are dropped for the current phase and resume later as dedicated retrofit phases.
- [ ] `misconception_watch` at **1–3 genuine pivots only** (founder 2026-07-04 — never a per-state tic; it's unrendered metadata). `assessment` + `coverage_map` are deferred this phase.
- [ ] **Narration text + audio (Rules 30g/30h/30i — 30i makes the product English-only and retires Telugu):** author **`text_hi`** for every tts_sentence via the Rule-30g **Sonnet-5 sub-agent** (subscription-billed, code-mixed per Rule 30 — NEVER `npm run tts:translate`, which bills the metered API keys). **Never author `text_te`** — Telugu is retired; existing concepts keep theirs as dormant history. Hindi is a **text-only** future-market seed: authored, never voiced. AUDIO is **ON-DEMAND, never a ship gate** and **English-only**: the sim ships silent-but-complete on baseline-locked visuals (Rule 24 — the teacher narrates); render EN (`npm run tts:generate -- <id> --langs=en`, foreground — also the script's default now) only when the pilot needs narration. Every render is real Sarvam spend — never render mid-iteration or speculatively. Missing `text_hi` never blocks a ship (the old `text_te` gate is removed).

**Compute, don't guess.** Every placement, timing, and orientation is derivable up front — guess-and-recapture costs more than the math:
- **Screen position** of an overlay/hand → from the camera basis: screen-right ≈ `normalize(viewDir × up)`. Its z-component is negative for the default +x+y+z camera, so increasing world-z moves an object **left**, not right. Prefer **camera-relative anchoring** (position computed from `stateDef.camera_position`) over per-state hand-tuned world coords — framing-correct by construction, zero tuning.
- **Timing** (curl, reveal, stagger) → explicit phase fractions, not eyeballed.
- **Orientation** → `makeBasis` / quaternion with a determinant/handedness check (det = +1 = a true right hand, never mirrored — a mirrored RHR teaches the wrong physics).

**PCPL / parametric variant (the Class-11 Vectors track — `parametric_renderer.ts`, reference `scalar_vs_vector`).** The Vectors chapter is a flat, pure-JSON, **pixel-coordinate 760×500** 2D canvas, NOT a 3D field sim — so the three field_3d compute rules above map differently:
- **Screen position** → author **pixel coordinates directly** (origin top-left, x∈[40,720] y∈[40,460] to stay on-canvas), or better, a **zone anchor** — `zone: "CALLOUT_ZONE_R", anchor: "top_left"` over MAIN_ZONE / CALLOUT_ZONE_R / FORMULA_ZONE / CONTROL_ZONE / TITLE_ZONE (PM_ZONES) — which survives layout changes. There is **no camera and no zoom**: never author a "zoom into X" beat; use a `comparison_panel` split or a banner annotation, or escalate to `renderer_primitives`.
- **Orientation** → there is **no 3D handedness**; the RHR/`makeBasis` DoD row is **N/A**. A vector's `direction_deg` / `from`→`to` endpoints are authored in the 2D plane.
- **Motion** → each moving body names an `animation.type` from the whitelist (`free_fall`/`pendulum`/`atwood`/`translate`/`slide_horizontal`/`projectile`/`rotate_continuous`/…) or a `variable_choreography` sweep (`loop`/`ping_pong`/`once`); emphasis is **brightness-only** (`PM_focalEmphasis`, Rule 29) — never size/zoom.
- **Routing** → write `renderer_pair.panel_a:"mechanics_2d"` AND add the concept_id to `PCPL_CONCEPTS` (registration site #7) + a `computePhysics_<id>` in `parametric_renderer.ts`; the `"mechanics_2d"` string does NOT select `mechanics_2d_renderer.ts` (PCPL_CONCEPTS overrides it), but MISS site #7 and the concept silently falls back to the legacy renderer.
- **Verify** → THE EYE (`visual:eyes`) runs on parametric at full parity (sim-time-pinned dense + frozen frames); clone `scalar_vs_vector`'s shape, not a field_3d skeleton.

**Iteration budget.** The irreducible loop is ONE compute + ONE visual-verify pass (stage ③ requires actually looking — you cannot trust framing you have not rendered). Target **2–3 rounds total, not 7.** Iteration is the *method*; guess-and-recapture and piecemeal-spec are the *waste*.

---

## The three rules that make this work

### 1. IP guardrail — extract pedagogy, never prose
From the YouTube professor (and DC Pandey) we take only: the **misconception** he targets,
the **must-see** moment, the **teaching order**, where students **resist**. We **never** copy
his words, exact phrasing, exact example values, or exact sequence verbatim. Our restructured
teaching notes only. **Plain English. No Hinglish. No Devanagari.** (Extends CLAUDE.md §8 to YouTube.)

### 2. The video is the delivery layer — the books are the skeleton
The YouTube professor is the **nervous system** (pacing, emphasis, what makes it click). The
**skeleton** still comes from the source triad — don't let one charismatic video become the sole source:
- **HC Verma** → teaching sequence / derivation order
- **DC Pandey** → problem types + misconception beliefs (the belief only)
- **NCERT** → syllabus coverage + sequencing (its Indian-context examples are NOT imported — anchors are universal per Rule 35, 2026-07-10)
Cross-check the video against the skeleton so nothing required is missing.

### 3. Visual testing means Claude actually LOOKS — every time
Stage ③ only works if the validator **auto-runs and renders every frame into Claude's own eyes
before showing the founder** — not "glanced at a screenshot and called it done." This is the most
common failure mode (e.g. A5 on 2026-06-10 shipped to founder review without a validator run).
The fix is discipline + automation, not a new check. See `VISUAL_VALIDATOR_SPEC.md`.

**THE EYE protocol (operational, built 2026-06-10):**
```bash
npm run visual:eyes -- <concept_id>     # $0 — captures EVERY state + dense ~1s frames,
                                        # runs all deterministic gates (D1p/H1/D5/D6/D7/H2),
                                        # dumps every PNG to .visual_runs/<id>/<timestamp>/
# → dispatch EYE-WALKER to read EVERY printed PNG path in its own context (never read
#   the ~100 frames in the main session). Only then founder review.
npm run smoke:visual-validator -- <concept_id> --dense   # PAID escalation ONLY — run when
                                        # THE EYE is inconclusive or the founder asks
                                        # (cost ladder: Gemini Flash → Sonnet → Opus-flag)
npm run visual:approve -- <concept_id>  # after founder approval → lock regression baselines
```
Surface-everything rule: both scripts print EVERY check result, pass AND fail, full failure
evidence — nothing summarized away.

**THE CALCULATOR — the numeric half of the same gate ($0, ADVISORY as of 2026-07-31):**
```bash
npm run numeric:calc -- <concept_id>    # $0 — drives every state headlessly, reads the
                                        # HUD/probe/readout values the sim actually PAINTS,
                                        # and asserts them against the physics recomputed from
                                        # the concept's own declared variables.
                                        # N1 readout-matches-formula · N2 conservation ·
                                        # N3 slider-response direction. Writes
                                        # .calc_runs/<id>/<timestamp>/readings.json
```
THE EYE proves the pixels moved; THE CALCULATOR proves the NUMBERS are right — the two are
complementary and neither substitutes for the other. It needs no `.env.local`: sim HTML is
assembled from source, so a stale `simulation_cache` row cannot silently pass it.

**Advisory, not yet blocking.** Read its failures, but a FAIL is a triage item, not a stop:
every finding must be hand-confirmed against the sim before it is believed. Promotion to a
blocking gate (and to `verify.yml`) is a separate decision, gated on the fleet SKIP census.
Its SKIP list is as informative as its failures — it measures how much of a concept's declared
physics is machine-checkable at all.

---

### Logging a professor lesson (stage ④ → the queue)

Every professor/founder lesson goes into `engine_bug_queue` WITH a prevention rule, so it
protects every future concept — not just the one reviewed:

```bash
npm run log:lesson -- \
  --bug-class FLEMING_SCOPE_UNSTATED \
  --title "Fleming overlay shown without its +q / 90° scope caveat" \
  --severity MODERATE \
  --owner alex:json_author \
  --root-cause "Authored the Class-10 mnemonic panel without stating its limits." \
  --prevention-rule "Any Fleming overlay must state: works for +q only; right-hand rule stays canonical." \
  --concept magnetic_force_moving_charge
```

`--prevention-rule` is mandatory — a lesson without a prevention rule does not compound.
(SQL fallback: INSERT into `engine_bug_queue` with `probe_type='manual'`.)

---

## What compounds NOW vs LATER (no illusion)

| Channel | Compounds when? | Mechanism |
|---|---|---|
| **Bug-prevention** | ✅ Day 1 (live) | `engine_bug_queue` — 38 incident rows (25 fixed, 8 open, 3 deferred, 2 not-reproducing as of 2026-06-11, verified post-migration), 100% carry a `prevention_rule`. Every fix protects all future concepts. (The 38 vision-probe check definitions live separately as `row_type='probe_definition'` — see `supabase_migrations/supabase_2026-06-11_engine_bug_queue_row_type_migration.sql`.) |
| **Pedagogy rules** | ✅ Day 1 (live) | Professor lessons + diamond lessons → patterns library. Diamond #N is born knowing everything #1…#N-1 learned. |
| **Comprehension** ("did a cold student learn?") | ⏳ Later (needs students) | pre/post quiz → `comprehension_result` → Tier-8 Proposer → `proposal_queue`. Currently **0 rows** — lights up at stage ⑤. |

The day-1 compounding is genuine — it compounds on **correctness + pedagogy** now, and **adds
comprehension** once students exist. You are not waiting for the flywheel to start; half of it
already turns.

---

## Where every lesson gets filed (routing rule — added 2026-06-11)

A lesson that stays in chat does not compound. The 2026-06-11 harness audit found the cost of
skipping this: the Definition-of-Done lesson lived in this file + memory but in ZERO agent specs,
and the physics_author spec sat two upgrades stale. **File every lesson in the SAME session it was
learned, in exactly ONE home (link from elsewhere — never copy):**

| Lesson type | Its ONE home |
|---|---|
| Bug / incident (something broke) | `engine_bug_queue` row WITH `prevention_rule` (`npm run log:lesson`) |
| Reusable visual / choreography / physics idiom | `docs/patterns/<chapter>.md` |
| Authoring contract change (what an agent must produce) | the owning `.agents/<role>/CLAUDE.md` → regenerate its emission in the same session |
| Process change (how this pipeline runs) | this file (AUTHORING_PIPELINE.md) |
| Never-violate rule | root `CLAUDE.md` (founder approval required; rule numbers are permanent — append, never renumber) |
| Strategy discussion / decision context | `docs/DISCUSSIONS.md` |

**The end-of-session check:** if the founder corrected anything this session, name the row above
it was filed under before wrapping up. "It's in the chat" = not filed.

---

## The hard floor (never bends — Rule 18 / The Learning Model)

Every feedback-driven change is **offline, written as a reviewable artifact, and human-gated**
(founder approves now; graduates to auto-promote only when Tier-9 gates earn trust and
comprehension does not regress). **No un-reviewed generative process ever decides the physics a
student sees at runtime.** The loop compounds quality without ever letting the machine secretly
rewrite a lesson.

---

*Status of the loop today: Part 1 (authoring) ~65% built and battle-tested; Part 2 (production /
student) wired but empty — 0 students; `proposal_queue` and `engine_bug_queue` tables EXIST
(migrations 2026-06-10 / 2026-04-25), Tier-8 agents are markdown specs. The professor gate (④) is the human comprehension/pedagogy gate that lets the loop
close NOW on 1–2 reviewers instead of waiting for 2,000 students. See Session 59 audit.*

---

## Chemistry addendum (2026-07-23 — CHEMISTRY_BUILD_PLAN.md Phase 2.5)

The SOP above applies to CHEMISTRY concepts (`src/data/concepts/chemistry/`) with three
substitutions; full doctrine in `docs/CHEMISTRY_ARCHITECTURE.md` + `docs/CHEMISTRY_BUILD_PLAN.md`:

1. **Pipeline:** `architect → chemistry_author → json_author → quality_auditor` —
   `chemistry_author` substitutes at position #2 (`.agents/chemistry_author/CLAUDE.md`); its output
   is a "chemistry block" (balanced-equation ledger, quantities with chemistry units, Rule 31
   timelines) consumed by json_author identically to a physics block.
2. **Source roles (Stage ①):** NCERT **Chemistry** = syllabus backbone (chapter indexes only) ·
   NCERT **Exemplar** = misconception beliefs (belief only) · teaching authored from first
   principles; universal anchors per Rule 35 (rusting, soda fizz, electroplating). The HCV/DCP
   triad is physics-only.
3. **Stage ② DoD chemistry variant:** the right-hand-rule plan is replaced by the
   balanced-equation-ledger plan (state symbols, oxidation numbers where redox, particle
   scale-factor label); archetypes declared from `docs/patterns/chemistry.md` §1 ([LIVE] only until
   Phase 5). Stage ③ THE EYE + eye_walker run unchanged, with the chemistry visual-sanity checklist
   in `.agents/eye_walker/CLAUDE.md` §Chemistry; validation = `npm run validate:chemistry`
   (the flat `validate:concepts` never scans the chemistry dir, by design).
