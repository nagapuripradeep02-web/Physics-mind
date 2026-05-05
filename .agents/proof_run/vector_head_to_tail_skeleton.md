# vector_head_to_tail — Architect Skeleton (session 56 proof run, Sim 1)

Produced by: architect agent (session 56.a, 2026-05-05)
Upstream inputs: project CLAUDE.md, .agents/architect/CLAUDE.md, plan file [read-and-analyze-chart-inherited-seal.md](C:/Users/PRADEEEP/.claude/plans/read-and-analyze-chart-inherited-seal.md)
Target file: `src/data/concepts/vector_head_to_tail.json` (NEW — does not exist yet)
Chapter: 5 (Vectors), section 5.4 (Vector addition — geometric methods)
Class level: 11

**Why this concept exists**: Phase 0 validation demo, Sim 1. Three flagship simulations + 10-student validation before resuming infrastructure work (session-55 strategic pivot). This is the gateway concept to all of mechanics — projectile motion, relative motion, force balance — every one assumes the student can mentally stack arrows tip-to-tail.

**Why this name** (not `vector_head_to_tail_rain` per the plan): the rule is general, the anchor is specific. Naming the concept after the anchor would clutter the catalog. Existing siblings `apparent_rain_velocity` (magnitude) and `umbrella_tilt_angle` (tilt direction) both depend on this concept's rule — both will become forward-prerequisites once `vector_head_to_tail` ships.

---

## 1. Atomic claim

This concept teaches **the head-to-tail rule for adding two vectors geometrically**: place the tail of the second vector at the head of the first, then draw the resultant from the start of the first to the tip of the second. It does NOT cover:

- The **magnitude** of the resultant via the Pythagorean / law-of-cosines formula (deferred to `resultant_formula` — already shipped, gold-standard).
- The **direction angle** of the resultant via arctan (deferred to `direction_of_resultant` — already shipped, gold-standard).
- Vector subtraction (deferred to a future `vector_subtraction_head_to_tail` atomic concept).
- More than two vectors at a time (deferred to `vector_chain_addition` — not yet scoped).

## 2. State count + arc — 5 states

Borderline simple/medium concept (sanity band: 4–5 states). State count is justified by the pedagogical narrative: hook → name the two vectors → tip-to-tail moment → reveal the resultant → student-driven exploration. Each state has one job.

| State | Purpose | `teaching_method` |
|---|---|---|
| **STATE_1** | Hook — Mumbai monsoon. You walk through vertical rain. Why does the umbrella tilt **forward** (toward your walking direction), not straight up? Three intuitions shown side by side: straight up, tilt back, tilt forward. Question: which keeps you dry, and what tells the umbrella how much to tilt? | `narrative_socratic` |
| **STATE_2** | Name the two velocities. Show the rain's velocity (downward arrow at your head) and your walking velocity (forward arrow at your feet) **as two separate arrows in two separate places**. Each arrow is glow-focused in turn. The student now knows there are EXACTLY two velocities at play. | `narrative_socratic` |
| **STATE_3** | **The tip-to-tail moment** (THE pedagogical bottleneck). Slide the rain arrow over: tail of rain arrow lands on head of walking arrow. Sound cue (whoosh) on the slide. The two vectors now form a connected chain. **`has_prebuilt_deep_dive: true`**. | `narrative_socratic` |
| **STATE_4** | The resultant reveals itself. Draw the diagonal arrow from the origin (tail of walking arrow) to the tip (head of rain arrow). Sound cue (ding) on completion. Label: "This diagonal is the apparent velocity of the rain — what you actually feel." Connects forward to `apparent_rain_velocity` and `umbrella_tilt_angle`. **`has_prebuilt_deep_dive: true`**. | `narrative_socratic` |
| **STATE_5** | Try-it. Slider for walk speed (0 → 8 m/s); rain speed fixed at 5 m/s for narrative consistency. Resultant arrow updates in real time. Edge cases visible: walk speed = 0 → resultant equals rain (vertical); walk speed = 8 → resultant nearly horizontal. The "feel" of the rule. | `exploration_sliders` |

**Quality test**: A student who watches all 5 states can answer: "A cyclist moves east at 12 m/s. Wind blows south at 5 m/s. Draw the wind's velocity as the cyclist feels it." → tip-to-tail addition produces a southwest arrow ≈ 13 m/s. YES, deliverable from these 5 states.

**Why not 6 states?** Considered adding a "name the parts" state (origin, head, tail, diagonal). Decided against — would dilute STATE_3's punch. The terminology is introduced inside STATE_3's TTS sentences. If 10-student validation surfaces vocabulary confusion, add as STATE_2.5.

## 3. Within-state Socratic-reveal plan

### STATE_1 — Hook (no new physics revealed; pure setup + question)

```
t=0     Three side-by-side mini-panels: straight-up umbrella (front gets soaked),
        tilt-back umbrella (back gets soaked), tilt-forward umbrella (dry).
        Below each: a small Mumbai-commuter sprite in walking pose.
        TTS1: "You're walking through monsoon rain. Three students try three
               umbrella tilts. Watch what happens."
[pause 1s]
t=1.5s  Animated rain droplets fall vertically across all three panels.
        Front-soak / back-soak / dry outcomes show within ~1.5s each.
        TTS2: "The forward-tilt student stays dry. Why? The rain falls
               straight down — but as you walk forward, it FEELS like it's
               coming from in front."
[pause]
t=4s    Glow_focus pulses on the forward-tilt panel.
        TTS3: "The umbrella tilts toward where the rain feels like it's
               coming from. Today's question: how do we figure out that
               direction, exactly?"
```

No new primitive revealed — STATE_1 is pure framing. `teaching_method: narrative_socratic` because of the prediction-then-reveal of which panel stays dry.

### STATE_2 — Two velocities, named separately

```
t=0     Single panel: a Mumbai commuter sprite (animated walking pose),
        rain falling vertically from above. NO velocity arrows yet.
        TTS1: "Two things are moving in this scene. The rain. And you."
[pause 0.8s]
t=1.5s  glow_focus pulses on the rain. animated_path draws a vertical
        downward arrow at the rain column. Label: "v_rain = 5 m/s ↓"
        TTS2: "First — the rain. Falling straight down at 5 metres per
               second. This is one velocity vector."
[pause 1.2s]
t=4.5s  glow_focus shifts to the commuter. animated_path draws a horizontal
        forward arrow at the commuter's feet. Label: "v_you = 4 m/s →"
        TTS3: "Second — you, walking forward at 4 metres per second.
               That's the other vector."
[pause]
t=7s    Both arrows fully visible, no glow.
        TTS4: "Two velocities. Two arrows. Different places, different
               directions. How do we add them?"
```

Reveal primitives: rain velocity arrow (animated_path + glow_focus) at TTS2. Commuter velocity arrow (animated_path + glow_focus) at TTS3.

### STATE_3 — The tip-to-tail moment (deep-dive enabled)

```
t=0     Both arrows from STATE_2 still in their original positions
        (rain at top, walking at feet). Commuter sprite frozen.
        TTS1: "We've got two arrows. We need to add them. Here's the rule
               every physicist uses."
[pause 1s]
t=2s    glow_focus pulses on the rain arrow's TAIL (top of the arrow).
        TTS2: "Take the second vector — the rain. Pick it up by its TAIL."
[pause 1s]
t=4s    PREDICTION beat:
        TTS3: "Where do you think we should put the rain arrow's tail?"
[pause 2s — let student think]
t=7s    animated_path animates the rain vector sliding over to the
        walking arrow's HEAD. Sound cue: whoosh during the slide.
        glow_focus pulses on the walking arrow's HEAD as the rain
        arrow's tail lands.
        TTS4: "Place its tail at the HEAD of the first vector. Tip to tail.
               That's the rule."
[pause 1s]
t=10s   Both arrows now connected as a chain. Annotation: "Chain complete:
        walk → rain."
        TTS5: "The two vectors now form a chain. Walking velocity, then
               rain velocity, head to tail."
```

Reveal primitives: rain-arrow-tail glow_focus at TTS2. animated_path slide of rain vector at TTS4 with sound_cue whoosh. Connection annotation at TTS5.

### STATE_4 — Reveal the resultant (deep-dive enabled)

```
t=0     Inherits STATE_3's final scene (chain complete, walk → rain).
        TTS1: "We've stacked the arrows. Now where's the resultant — the
               actual velocity of the rain as you feel it?"
[pause 1s]
t=2s    PREDICTION beat:
        TTS2: "Trace from the start of the walking arrow. Where do you
               think the resultant ends?"
[pause 2s — let student trace mentally]
t=5s    animated_path draws the diagonal from origin (tail of walking
        arrow) to tip (head of rain arrow). Sound cue: ding when the
        arrowhead lands.
        glow_focus pulses on the diagonal.
        TTS3: "From the START of the chain to the TIP of the chain.
               That diagonal IS the resultant."
[pause 1s]
t=8s    Label appears: "v_apparent = v_you + v_rain (head to tail)"
        TTS4: "And what does this diagonal mean? It's the velocity of the
               rain as YOU feel it — slanted, coming from in front. THAT'S
               the direction the umbrella must tilt toward."
```

Reveal primitives: diagonal animated_path with sound_cue ding at TTS3. Label fade-in at TTS4. glow_focus pulse on diagonal during TTS3.

### STATE_5 — Try-it, slider-driven (no Socratic reveal — student-driven)

```
t=0     STATE_4's final scene with slider underneath canvas.
        Slider: "Your walking speed: 4 m/s" (range 0–8, step 0.5).
        Rain fixed at 5 m/s ↓. Resultant arrow updates live.
        TTS1: "Your turn. Drag the slider. Watch the resultant change."
        Edge-case annotations appear on first interaction:
          v_you = 0   → "Standing still: rain feels purely vertical."
          v_you = 8   → "Sprinting: rain feels almost horizontal."
```

No reveal sequence — STATE_5 is exploration. `teaching_method: exploration_sliders`.

## 4. EPIC-C branches (4 genuine misconceptions)

Each STATE_1 VISUALIZES the wrong belief (Rule 16). Session-55 schema relaxation allows min 1 branch, but architect-spec discipline calls for 4 — and the misconception literature clearly documents 4 distinct errors here.

### Branch 1: `numerical_addition_of_speeds` (the most common error)

**Wrong belief**: "Rain at 5, walking at 4 → apparent rain at 9 m/s. You just add the numbers."
**STATE_1 visualization**: Speech bubble from the commuter: "v_apparent = 5 + 4 = 9 m/s" with a big red strikethrough. Below: a single vertical arrow labeled "9 m/s" pointing down — which obviously can't be right because then there'd be no horizontal component for the umbrella to tilt toward. Label: "Myth: Velocities add like ordinary numbers." Visual counter shows the correct head-to-tail diagonal at ~6.4 m/s, not 9, and at an angle, not vertical.
**Why this matters**: This is the single most common error in vector addition across all of Class 11 mechanics. Students learn vectors abstractly but reflexively treat them as scalars when given numbers.

### Branch 2: `place_tail_at_origin_not_head` (procedure error)

**Wrong belief**: "I move both arrows to start at the same point, then draw the diagonal." (parallelogram-without-knowing-the-rule)
**STATE_1 visualization**: Both vectors translated to share an origin — rain arrow drawn down from origin, walk arrow drawn right from origin. A confused student attempts to draw a diagonal but gets the parallelogram half-formed and ends up in the WRONG quadrant. Label: "Myth: Stack both tails at the same point — that gets the resultant." Visual counter: the correct head-to-tail produces an arrow that points northeast (forward-up in the commuter's experience), while the wrong attempt yields a southwest diagonal pointing into the ground.
**Why this matters**: students confuse the head-to-tail method with the parallelogram method, and end up doing neither correctly.

### Branch 3: `resultant_from_wrong_endpoint` (resultant tracing error)

**Wrong belief**: "The resultant goes from the head of the first arrow to the head of the second arrow." (off-by-one along the chain)
**STATE_1 visualization**: Chain correctly built (walk → rain head-to-tail), but the student draws the diagonal from the JUNCTION (head of walk = tail of rain) to the tip of rain — a tiny vertical arrow that's just the rain itself, not a true resultant. Label: "Myth: The resultant starts where the chain joins." Visual counter: the true resultant from the START of the walk arrow to the TIP of the rain arrow, with arrows showing the difference.
**Why this matters**: students who get the head-to-tail mechanic right still draw the resultant from the wrong starting point — common in tutoring sessions.

### Branch 4: `vectors_must_be_aligned_first` (rotation error)

**Wrong belief**: "Both vectors have to point in the same direction before I can add them. So rotate one to match the other, then add as scalars."
**STATE_1 visualization**: Walking arrow forced to rotate vertical (pointing down) to "match" the rain arrow, with a curved rotation indicator and "9 m/s" answer (collapsing back to Branch 1's error). Label: "Myth: You must align the vectors before adding them." Visual counter: the head-to-tail method works on PERPENDICULAR vectors directly — rotation is forbidden because it changes the physics.
**Why this matters**: This shows up in students who learned 1D motion first and want to reduce 2D problems back to 1D. Heard repeatedly in real tutoring sessions.

## 5. `has_prebuilt_deep_dive` states (2)

**STATE_3 (the tip-to-tail moment)** — THE pedagogical bottleneck. The single most pivotal moment in the concept. Students who get past this state internalize vector addition for the rest of mechanics; students who don't keep treating vectors as scalars. Pre-built deep-dive justified: walks through WHY tip-to-tail (versus tail-to-tail or head-to-head), demonstrates the rule with two more vector pairs in different orientations, and includes a static "rule card" sub-state students can return to mid-session.

**STATE_4 (the resultant reveal)** — second-biggest bottleneck. Once the chain is built, students still need to recognize that the resultant traces the WHOLE displacement of the chain. Pre-built deep-dive justified: shows the resultant as "the shortcut" (you could walk along the chain or take the diagonal — both end at the same place), with mini-examples on 3 different vector pairs.

All other states (STATE_1, STATE_2, STATE_5) get on-demand Sonnet deep-dives — the Explain button still appears (student-first policy from session 33), it just regenerates the first time it's clicked.

## 6. Drill-down clusters (3 per `has_prebuilt_deep_dive` state)

### STATE_3 clusters (tip-to-tail mechanic):

- **`why_tip_to_tail_not_tail_to_tail`** — "why do I put the tail on the head and not the tail on the tail?" (rule justification — confronts the parallelogram-method confusion)
- **`which_vector_moves`** — "do I move the rain arrow or the walking arrow? Does the order matter?" (commutativity / which-is-the-second-vector)
- **`is_it_still_the_same_arrow_after_moving`** — "the rain arrow moved — is it still the same vector? Does its length change? Its direction?" (vector identity after translation)

### STATE_4 clusters (resultant tracing):

- **`why_diagonal_not_chain_path`** — "why is the resultant a straight diagonal, not the actual zigzag path of walking-then-rain?" (resultant = displacement, not path)
- **`what_does_resultant_mean_physically`** — "the resultant is just a math arrow, right? It's not REAL?" (ontology: is the apparent rain velocity a real thing you feel?)
- **`how_does_this_connect_to_apparent_rain_velocity`** — "is this related to the rain umbrella problem from earlier?" (connects to existing `apparent_rain_velocity` and `umbrella_tilt_angle` concepts; cross-concept linking)

## 7. `entry_state_map` (v2.2)

```
foundational:  STATE_1 → STATE_4   # general "how do I add two vectors"
exploration:   STATE_5             # student-driven slider — for the "I get it, let me play" cohort
```

The classifier's `aspect` slot routes `vector addition tip to tail` to `foundational`. A repeat student returning with `let me try the slider` gets routed to `exploration` directly. Default aspect = `foundational`.

No `incline` / `elevator` / etc. axes — this concept is the foundational rule, not application-specific. Future authoring (when this concept is extended for vector subtraction or 3+ vector chains) would add aspects like `subtraction` or `multi_chain`.

## 8. Prerequisites (advisory — Rule 23)

- **`scalar_vs_vector`** — currently legacy (covered by `current_not_vector` atomic — gold-standard, session 53–54). Implicit assumption: the student knows vectors have magnitude AND direction.
- **`vector_basics`** — legacy bundle, post-split atomic family includes `unit_vector`, `negative_vector`, `equal_vs_parallel`, `scalar_multiplication`, `angle_between_vectors` (all gold-standard, sessions 18–35). Student should know what a vector arrow LOOKS LIKE before learning addition.

Both prerequisites are advisory only — Indian students jump topics, and many will arrive here straight from a "doubt-solver" referral asking "why does the umbrella tilt forward?" without ever having studied scalar vs. vector. The UI shows "Builds on X — 5 min intro?" but never blocks. Students who jump in and need vocabulary will get clarification via drill-down on demand.

**Forward-prerequisites** (concepts that will become enriched once this ships):
- `apparent_rain_velocity` — its "magnitude of resultant" derivation can now reference this concept's rule.
- `umbrella_tilt_angle` — its "tilt direction" insight can now reference this concept's resultant.
- `resultant_formula`, `direction_of_resultant` — both already shipped, but their EPIC-L hooks can be tightened to assume head-to-tail is internalized.

## 9. Real-world anchor

**Primary (Indian-specific, plain English, physics-true)**:

> A Mumbai college student walks home from Dadar station at 6:30 PM during the monsoon. The rain falls straight down at 5 metres per second. She walks forward at 4 metres per second. As she walks, the rain doesn't fall straight down anymore — it FEELS like it's slanting in from in front. She tilts her umbrella forward by exactly the angle of that slanted, apparent rain. She gets home dry. Tomorrow it pours again, and she'll do the same thing without thinking. Today, she's about to learn EXACTLY how that slanting direction is built — by stacking two velocity arrows tip to tail, then drawing the diagonal.

**Secondary (optional — same anchor, shifted to a different student)**:

> A kid runs forward at 6 m/s in light drizzle (rain at 2 m/s ↓). The drizzle now feels like it's blasting in from almost directly in front of him — because his speed is three times the rain's. The same head-to-tail rule applies; the diagonal just lies almost flat. Same physics. Different angle.

**Why these hook Class 10-12 students specifically**: every single Indian teenager has walked through monsoon rain. They've felt the wrong tilts and gotten wet on one side. The Dadar student is urban, recognizable, and instantly establishes that this isn't an abstract physics-textbook problem — it's the moment-to-moment physics of their daily commute. The kid in drizzle anchors the formula's range without changing the rule.

No textbook "let A and B be two vectors" framing. No figure references. No Hinglish. The English teacher would approve every sentence.

---

## DC Pandey check

Consulted DC Pandey Ch. 5 (Vectors) table of contents to confirm "head-to-tail vector addition" is in the geometric methods section (5.4, before the Pythagoras-based magnitude formula in 5.5 and the analytic resolution in 5.6). No teaching sequence imported, no example problems imported, no figure references imported. The state arc above is authored from first principles based on cognitive progression (anchor first → name the parts → the moment → the result → exploration), not from the textbook's chapter flow.

## Self-review checklist

- [x] Atomic claim is ONE sentence (compound but single-clause).
- [x] State count (5) matches §7 borderline simple/medium band.
- [x] 4 EPIC-C branches, each a real (not strawman) misconception with documented student-error provenance.
- [x] Each EPIC-C STATE_1 describes a primitive-level visualization of the wrong belief, not just narration.
- [x] 2 `has_prebuilt_deep_dive` states picked (STATE_3, STATE_4), each with 3 candidate cluster_ids.
- [x] Every EPIC-L state has a `teaching_method` field assigned.
- [x] Every state introducing new physics has a within-state Socratic-reveal plan with prediction question + reveal primitive + TTS sentence id mapping.
- [x] `entry_state_map` declared with `foundational` and `exploration` ranges.
- [x] Prerequisites are advisory, cite shipped concepts where possible, with forward-prerequisite notes.
- [x] Real-world anchor: Indian, plain English, physics-true.
- [x] DC Pandey check line present: scope only.
- [x] No section missing. Skeleton is handoff-ready to physics_author.

## Engine bug queue note

No new prevention rules surfaced for this concept. The Socratic-reveal pattern, primitive set used (animated_path + glow_focus + sound_cue + slider), and 5-state arc are all within already-shipped patterns. Premium primitives (committed in `7d4ea73`) provide the new visual capability; no engine changes blocking.

---

## Decision points for Pradeep before physics_author handoff

1. **State count**: 5 (recommended) vs 4 (compress STATE_1 hook into STATE_2 setup). 4 is faster to author + ship; 5 gives the hook room to land. **Recommend 5** — the hook IS the validation hypothesis ("does the visual tilt-comparison earn 2-min understanding?").
2. **EPIC-C branch count**: 4 (architect-spec compliant, recommended) vs 1 (session-55 schema-allowed, faster). **Recommend 4** — the misconceptions are documented and the validation demo will surface whether they're worth the authoring time.
3. **STATE_5 slider scope**: walk-speed-only (recommended, simpler) vs walk-speed + rain-speed (more interactive but harder to keep narrative anchored). **Recommend walk-speed-only** — rain-speed-fixed makes the narrative consistent; the rule is the same regardless of which slides.
4. **Concept name**: `vector_head_to_tail` (recommended, taxonomically clean) vs `vector_head_to_tail_rain` (per the original plan, anchor-named). **Recommend `vector_head_to_tail`** — anchor-named concepts pollute the catalog.

---

## Handoff note to physics_author (when approved)

Variables expected:
- `v_rain` (default 5 m/s, min 1, max 10) — rain falls vertically downward.
- `v_you` (default 4 m/s, min 0, max 8, step 0.5) — student's walking speed, horizontal forward.
- `v_apparent_mag` (derived: `sqrt(v_rain^2 + v_you^2)`) — magnitude of resultant; used in STATE_5 readout.
- `theta_apparent_deg` (derived: `atan(v_you / v_rain) * 180 / PI`) — angle of resultant from vertical; used in STATE_5 readout.

Animation type per E11: STATE_2 commuter is uniform translation (E11 motion type #7 — known doc-only gap, not a runtime issue per the umbrella_tilt_angle proof run). Rain droplets are E11 #2 free-fall. STATE_3's vector-slide animation is `animated_path` (premium primitive, shipped session 56).

Mark scheme for board mode (out of scope for Sim 1 — Sim 2 gets board treatment, per session-55 plan): would be 5 marks across 5 states, 1 mark each. Not authored now; can be added when Sim 1's board mode is built post-validation if signal is positive.

Premium primitives used (all shipped in `7d4ea73`):
- `glow_focus` — STATE_2 (each velocity in turn), STATE_3 (rain-arrow tail + walking-arrow head), STATE_4 (diagonal).
- `animated_path` — STATE_2 (each arrow drawing in tip-first), STATE_3 (rain arrow sliding to chain position), STATE_4 (diagonal drawing).
- `sound_cue` — STATE_3 (whoosh on slide), STATE_4 (ding on resultant arrowhead landing).
- NOT used: `particle_field`, `smooth_camera` — saved for Sim 2 / Sim 3.

Cluster registry SQL migration: physics_author writes `supabase_2026-05-05_seed_vector_head_to_tail_clusters_migration.sql` with 6 INSERT rows (3 clusters × 2 deep-dive states), 5 trigger_examples each.

Six registration sites (CLAUDE.md §6) for json_author handoff:
1. `src/data/concepts/vector_head_to_tail.json` (NEW).
2. SQL INSERT into `concept_panel_config`: `concept_key='vector_head_to_tail'`, `default_panel_count=1`, `panel_a_renderer='parametric'`, `panel_b_renderer=NULL`, `verified_by_human=false`.
3. `CONCEPT_RENDERER_MAP` in `src/lib/aiSimulationGenerator.ts`: add `'vector_head_to_tail': 'parametric'`.
4. `VALID_CONCEPT_IDS` in `src/lib/intentClassifier.ts`: add to vectors block + add a `CRITICAL DISAMBIGUATION` line ("head to tail" / "tip to tail" / "vector chain" → vector_head_to_tail).
5. `CONCEPT_PANEL_MAP` in `src/config/panelConfig.ts`: add single-panel entry with matching `config_key` + `label="Head-to-Tail Vector Addition"`.
6. `epic_l_path.states.STATE_3.has_prebuilt_deep_dive: true` and `epic_l_path.states.STATE_4.has_prebuilt_deep_dive: true`.
