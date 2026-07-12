# Architect skeleton — `magnetic_field_solenoid`

> **[VINTAGE — pre-Rule-31/35 architecture (Socratic beats, Indian anchors, EPIC-C). Historical record only — never clone.]**

> **[OLD MODEL — superseded by Rule 31, 2026-07-02.]** This exemplar predates the straightforward +
> per-state-contextual-controls doctrine: it uses Socratic predict→reveal pacing, `wait_for_answer` /
> `pause_after_ms` beats, and/or "sliders in the last state only". Do NOT clone its pacing or control
> placement for new concepts — clone `faraday_law_induction_skeleton.md` instead. Physics content and
> structure remain valid reference.

**Status:** Pass-1 v2.3 skeleton. CONCEPTUAL-ONLY per MAGNETISM_ARCHITECTURE M1–M6 carve-out. Board (M7) and competitive (M8) modes are explicitly deferred.

**Diamond context:** Diamond #4 in the magnetism proof-of-concept. This concept is the **M4 binary-gate validator** — the first non-hand-authored archetype-A concept (templated from Diamond #1 `magnetic_field_wire`). If this skeleton + physics_author + json_author + quality_auditor produce diamond output with ≤1 round of human iteration, the recursive-bootstrap method is proven and M5 may proceed.

**DC Pandey check:** Consulted Ch.26 §26.8 table of contents to confirm scope (long solenoid B = μ₀nI inside, ≈0 outside; circular-loop derivation precursor). No teaching method, no example problem, no figure reference imported.

**Engine bug queue check:** Architect-class prevention rules consulted via shipped sibling JSONs (`magnetic_field_wire`, `magnetic_force_moving_charge`, `torque_on_current_loop_in_field`). Rules satisfied: Rule 15 (varied advance_mode), Rule 16 (EPIC-C STATE_1 shows wrong belief), Rule 19 (≥3 primitives per state), interactivity-in-final-state-only rule (sliders only in STATE_7), no `show_sliders` in middle states.

---

## 1. Atomic claim

This concept teaches **the B-field of a long solenoid: nearly-uniform along the axis inside (B = μ₀nI), nearly zero outside, with RHR-curled-fingers convention (fingers wrap with the current, thumb gives B inside)**. It does **not** cover: Biot-Savart derivation from first principles (deferred to `biot_savart_law`), the field of a single circular loop (deferred to `magnetic_field_circular_loop`), toroids or Ampère's-law integral form (deferred to `amperes_circuital_law`), or end-of-solenoid edge corrections beyond a one-line "field weakens at the ends" mention.

---

## 2. State count + arc

**State count: 8.** Reasoning: this is archetype-A field-viz (anchor count: 7, per Diamond #1) PLUS one extra state to make the *coil-to-uniform-axial-field superposition* land — the conceptual move that makes solenoid distinct from straight wire. Without that bridge state, the student sees circles around individual turns and never grasps why the *sum* points purely along the axis. 8 sits inside the §7 "medium" band (5–6) extended slightly because the concept genuinely contains two ideas held in superposition (per-turn field + axial sum) that must be revealed sequentially.

| # | State title | Purpose | teaching_method | advance_mode |
|---|---|---|---|---|
| STATE_1 | "The Coiled Wire — What if we wrap a current?" | Hook. Show a straight wire (callback to Diamond #1) morphing into a coiled wire. No field yet. | `narrative_socratic` | `auto_after_tts` |
| STATE_2 | "Each Turn Makes Its Own Field" | Reveal one turn at a time; circles around each turn become visible. Student sees the per-turn field is just the wire-field they already know, bent into a loop. | `narrative_socratic` | `manual_click` |
| STATE_3 | "Adding Up the Turns — Inside Becomes Axial" | The KEY state. Predict: what happens between two adjacent turns? Reveal: opposing field components cancel between turns, axial components add → uniform axial B inside. | `narrative_socratic` | `wait_for_answer` |
| STATE_4 | "Outside the Solenoid — Where Did the Field Go?" | Predict: what about outside? Reveal: outside contributions cancel almost everywhere; B_outside ≈ 0 for a long solenoid. | `narrative_socratic` | `manual_click` |
| STATE_5 | "RHR for a Solenoid — Curl with the Current, Thumb is B" | The hand-rule shift from Diamond #1: now fingers curl WITH the current loops, thumb gives B inside. This is the most-confused hand-rule swap. | `narrative_socratic` | `manual_click` |
| STATE_6 | "The Formula — B = μ₀nI, and n is Turns Per Unit Length" | Reveal magnitude. Predict ordering: does B depend on total turns N, or turns per meter n? Reveal: per unit length, because density of circulation matters, not raw count. | `narrative_socratic` | `manual_click` |
| STATE_7 | "Reverse the Current — Field Flips, Magnitude Unchanged" | Mirror of Diamond #1 STATE_4. Reinforces that RHR symmetry transfers from wire to solenoid. | `narrative_socratic` | `manual_click` |
| STATE_8 | "Explore — Tune n, I, and Watch B Inside" | Final interactive. Sliders on n and I; B-meter reads inside; student verifies B = μ₀nI by hand-prediction-then-check. | `exploration_sliders` | `interaction_complete` |

advance_mode variety check: 4 distinct values across 8 states (auto_after_tts, manual_click ×5, wait_for_answer, interaction_complete) → Rule 15 PASS.

---

## 3. Within-state choreography plan (Socratic reveal)

**STATE_1 — Hook (no new physics revealed; introductory exception, per architect spec):**
- t=0: straight vertical wire visible (callback to Diamond #1).
- TTS s1_1: "You already know the field around a single wire — circles."
- t=3s: wire morphs (animate_in: morph) into a 6-turn helical coil.
- TTS s1_2: "But what if we coil the wire — wrap it into a spring shape?"
- t=6s: TTS s1_3: "Each turn is still just a piece of wire carrying the same current. But the *combined* field changes shape dramatically. Let's see how."

**STATE_2 — Per-turn field reveal:**
- t=0: coil visible, no field. ONE turn highlighted (yellow).
- TTS s2_1: "Focus on this one turn. It is a wire carrying current — what kind of field does it make?"
- [pause 2-3s for prediction]
- TTS s2_2: "Right — circles around the wire, just like Diamond #1." → field circles `animate_in: fade` around the highlighted turn at `reveal_at_tts_id: s2_2`.
- TTS s2_3: "Now do the same for every turn." → remaining 5 turns' field circles fade in sequentially at `reveal_at_tts_id: s2_3`.
- TTS s2_4: "Six turns. Six sets of circles. They overlap in the middle — what does the sum look like?"

**STATE_3 — THE KEY STATE (axial sum reveal). PRIMARY AHA STATE.**
- t=0: two adjacent turns visible, each with its own field circles.
- TTS s3_1: "Look between two adjacent turns. The circles from the upper turn point one way; the circles from the lower turn meet them coming the other way."
- TTS s3_2 (prediction): "What happens when these opposite contributions meet? Pause for a moment and predict."
- **[pause_after_ms: 3000 — let student sit with confusion]**
- TTS s3_3: "Between the turns, the radial components CANCEL." → red cancellation arrows `animate_in: fade` at `reveal_at_tts_id: s3_3`; focal primitive spotlight on the cancellation zone.
- TTS s3_4: "But the AXIAL components — pointing along the solenoid's long axis — they ADD." → blue axial arrows `animate_in: arise` along the central axis at `reveal_at_tts_id: s3_4`; existing per-turn circles fade to 30% opacity to let the axial field dominate visually.
- TTS s3_5: "Sum it up over all turns: a single, uniform, axial magnetic field. Inside the solenoid, B is straight and steady, like the field of a giant bar magnet."

**STATE_4 — Outside reveal:**
- t=0: solenoid visible with strong axial B inside (from STATE_3 carryover).
- TTS s4_1: "Inside, the field is uniform and strong. But outside — what do you predict?"
- [pause 2-3s]
- TTS s4_2: "Most students guess the field outside is just a weaker version of inside. Watch what really happens." → outside field arrows `animate_in: fade` very faintly, then `animate_in: fade_out` to ≈zero at `reveal_at_tts_id: s4_2`.
- TTS s4_3: "Contributions from turns at different positions cancel almost completely outside. For a long solenoid, B_outside is approximately zero." → label "B_outside ≈ 0" writes into callout zone.
- TTS s4_4: "All the field energy is concentrated INSIDE the solenoid. This is why solenoids make excellent electromagnets."

**STATE_5 — RHR-swap (the most-confused hand-rule pivot):**
- t=0: solenoid visible with axial B (from STATE_3/4).
- TTS s5_1: "In Diamond #1 you learned: thumb along current, fingers curl with B. That was for a STRAIGHT wire."
- TTS s5_2 (prediction): "For a solenoid, what changes? Which hand part now follows the current?"
- [pause 2-3s]
- TTS s5_3: "The roles swap. FINGERS curl with the current loops; THUMB gives B inside." → right-hand overlay `animate_in: fade` with fingers wrapping the coil direction, thumb axial at `reveal_at_tts_id: s5_3`.
- TTS s5_4: "Same right hand. Different grip. Wire = thumb-current, fingers-B. Solenoid = fingers-current, thumb-B."

**STATE_6 — Formula reveal:**
- t=0: solenoid + axial B visible. Formula slot empty in callout zone.
- TTS s6_1: "How strong is B inside? Predict: does it depend on total turns N, or on something else?"
- [pause 2-3s]
- TTS s6_2: "Turns per unit length — what we call n. The DENSITY of current loops matters, not the raw count." → label "n = N/L (turns per metre)" `animate_in: handwriting` at `reveal_at_tts_id: s6_2`.
- TTS s6_3: "The formula: B equals mu-naught times n times I. Three factors, no distance r, no 1/r dependence inside — that is what 'uniform' means." → formula "B = μ₀ n I" writes into callout zone with `animate_in: handwriting`.
- TTS s6_4: "Double the turns per meter, double the field. Double the current, double the field. Stretch the same wire to twice the length — n halves, B halves."

**STATE_7 — Reverse-current:**
- t=0: solenoid with axial B pointing UP (carryover).
- TTS s7_1: "Now we reverse the battery. Watch the current direction." → current direction arrows flip animate_in.
- TTS s7_2: "Predict: which way will B point now?"
- [pause 2s]
- TTS s7_3: "B flips to point DOWN. Same magnitude, opposite direction." → axial B vector `animate_in: rotate_180` at `reveal_at_tts_id: s7_3`.
- TTS s7_4: "Right hand again — flip your grip, thumb now points down. Magnitude formula B = μ₀nI is unchanged; only direction reverses."

**STATE_8 — Exploration:**
- t=0: full solenoid with sliders for n and I visible. B-meter reading inside.
- TTS s8_1: "Now you drive. Crank up n — watch B grow proportionally."
- TTS s8_2: "Bring I down — watch B shrink. Try to predict B before you read the meter."
- TTS s8_3: "Notice: no matter where you place the probe INSIDE the solenoid, B reads the same. That is the uniformity. Outside, the probe reads near-zero."

---

## 4. EPIC-C branches (4)

Each branch's STATE_1 visualizes the wrong belief explicitly in scene_composition (Rule 16).

1. **`b_solenoid_field_is_radial`** — Misconception: "The B-field inside a solenoid points radially outward from the axis, like a star pattern, because each turn creates a circle." STATE_1 visualization: draw red "Wrong belief:" arrows pointing radially outward from the solenoid axis (label "Myth — B points like spokes of a wheel"), then refute by showing the axial superposition.

2. **`b_outside_solenoid_is_strong`** — Misconception: "The B-field outside the solenoid is just slightly weaker than inside — it falls off gradually like a wire's 1/r field." STATE_1 visualization: draw incorrect outside arrows of moderate length matching inside arrows (with "Myth — outside is like a weak version of inside" label), then refute with the actual ≈0 outside reality + cancellation explanation.

3. **`b_field_depends_on_N_not_n`** — Misconception: "Doubling the number of turns N doubles the field. Length of the solenoid doesn't matter — only how many turns you have." STATE_1 visualization: side-by-side two solenoids — both with N=10 turns, but one stretched to 2× the length. Student's instinct: same B. Annotation "Myth — N alone determines B". Refutation: B in the long one is half of B in the short one, because n = N/L halved.

4. **`b_rhr_same_as_wire`** — Misconception: "Use the same right-hand rule as for a wire: thumb along the current, fingers curl in B-direction. That gives axial B with current along the axis." STATE_1 visualization: draw the wire-RHR hand grip applied to the solenoid — thumb pointing along the wire's local direction (tangent to the coil, not axial), and a Myth-tagged "wrong B" arrow that comes out radial. Refute with the swap: fingers-curl-with-current-loops, thumb-axial-gives-B.

---

## 5. `has_prebuilt_deep_dive` states

Three states picked for pre-authored deep-dive (cache hint, not a gate — every state shows the Explain button per session-33 policy):

1. **STATE_3** (`has_prebuilt_deep_dive: true`) — The axial-superposition state. The PRIMARY aha lives here; students historically lose grip on *why* radial components cancel. Pre-author this deep-dive: show 2 turns, then 4 turns, then 8 turns, then "infinite" turns, with the radial-cancellation arrows fading out and axial buildup intensifying at each step.

2. **STATE_5** (`has_prebuilt_deep_dive: true`) — The RHR-swap state. Three documented confusion clusters exist (see §6). Pre-author the right/wrong hand-comparison breakdown.

3. **STATE_6** (`has_prebuilt_deep_dive: true`) — The formula state. n-vs-N is the most-asked clarification question on Class 12 magnetism — worth a hand-authored elaboration. Pre-author: stretch the solenoid in place while N stays fixed, watch B drop in real time.

Block-1 / Block-2 cross-reference: STATE_3 carries the PRIMARY aha (Pass-1 cliff also lives here for the `magnetic_field_wire` prerequisite). STATE_5 and STATE_6 carry Pass-1 cliffs for `right_hand_rule_curl` and `vector_resolution`. Alignment of deep-dive states with cliff states is satisfied.

---

## 6. Drill-down clusters

**For STATE_3 (axial-superposition deep-dive):**
- `radial_cancellation_unclear` — "I don't see why the radial parts cancel."
- `axial_addition_unclear` — "Why do the axial parts add and not also cancel?"
- `infinite_turns_assumption` — "Doesn't this only work if there are infinite turns?"

**For STATE_5 (RHR-swap):**
- `which_hand_part_is_current` — "Is the thumb the current or the field for a solenoid?"
- `same_rhr_as_wire` — "Can I just use the wire's right-hand rule here?"
- `curl_direction_ambiguous` — "Which way are my fingers supposed to curl — with the current loops, or against them?"

**For STATE_6 (n vs N):**
- `total_turns_matters` — "Why doesn't the total number of turns appear in the formula?"
- `units_of_n` — "What are the units of n? Is n dimensionless?"
- `length_effect` — "If I make the solenoid longer with the same turns, does B change?"

Physics_author fills in trigger_examples (3-5 phrasings each).

---

## 7. `entry_state_map`

```yaml
entry_state_map:
  foundational: [STATE_1, STATE_2, STATE_3, STATE_4]   # "what is a solenoid's field"
  rhr_application: [STATE_5]                            # "how do I use the right-hand rule for a solenoid"
  formula: [STATE_6, STATE_7]                           # "B = μ₀nI questions, current-reversal"
  exploration: [STATE_8]                                # "interactive — let me play"
```

**Foundational-coverage rule check:** PRIMARY aha = STATE_3 (see Block 2). STATE_3 is inside `foundational` range. PASS — foundational entrants will not silently miss the 10-year-memory.

Default aspect = `foundational`. Classifier returns `rhr_application` when student types "right-hand rule" or "which hand"; `formula` for "B = mu nought n I" or "how strong"; `exploration` only on explicit "let me play"/"show me sliders" queries.

---

## 8. Prerequisites

```yaml
prerequisites:
  - magnetic_field_wire     # shipped (Diamond #1) — gold-standard; student must understand circles-around-a-wire
  - right_hand_rule_curl    # nano; ships in M6 — gold-standard for the wire variant of RHR; advisory soft-link
  - vector_resolution       # shipped — gold-standard; needed for "radial vs axial component" decomposition in STATE_3
```

Advisory only. UI surfaces these as "Builds on X — 5 min intro?" pills, never as hard gates.

---

## 9. Real-world anchor

**Primary:** Picture the MRI machine in a Bangalore hospital — the tube the patient slides into. That tube is a giant solenoid, kilometres of copper wire coiled tightly around the patient's bore. When current flows through those coils, the inside of the tube fills with a powerful, uniform magnetic field — 1.5 tesla, ten thousand times stronger than Earth's field. The patient's body sits in that uniform field, and hydrogen atoms inside their tissues respond. The whole imaging trick depends on one piece of physics: the field inside a long solenoid is UNIFORM and AXIAL. If the field varied from point to point inside the tube, the image would be unreadable. The MRI works because B = μ₀nI is constant everywhere inside.

**Secondary:** Picture the starter motor in a Mumbai auto-rickshaw. When the driver turns the key, current surges through a small solenoid coil; the resulting axial field yanks an iron core inward, which mechanically pushes the starter pinion into the engine flywheel. No solenoid → no engine start. Every auto-rickshaw on Indian roads carries this concept under the hood.

**Why this hooks Class 10-12 students:** MRI is universally familiar (most students have seen one in a hospital, or watched a relative go in). Auto-rickshaws are unavoidable. Both demonstrate the *uniformity* property of solenoid B-field as a non-negotiable engineering requirement, not a textbook abstraction. Plain English throughout: no Hinglish, no "zameen", no "deewar".

---

## Block 1 — Pass-1 strategic checklist (v2.3)

### 1a. Prerequisite cliff sentences

- **`magnetic_field_wire` (shipped):** Cliff in STATE_2. If the student arrives without knowing the wire's circular B-field, STATE_2's "each turn is just a wire" reveal fails — they have no anchor for what one turn's field looks like. **Patch sentence (added to s2_1):** *"Quick reminder — a straight wire carrying current creates B-circles around it (we covered this earlier). Each turn of the solenoid is just a wire bent into a circle."* Doesn't condescend to students with the prerequisite (acknowledged briefly, then moves on); covers the gap for students without it.

- **`right_hand_rule_curl` (nano, ships M6):** Cliff in STATE_5. Students arriving without the wire-RHR mental model will not feel the *swap* in STATE_5 as a swap — they'll just receive the solenoid-RHR as a new isolated rule. **Patch sentence (added to s5_1):** Already in plan ("In Diamond #1 you learned: thumb along current, fingers curl with B."). This is the patch. For students who never saw Diamond #1, the patch sentence functions as a 5-second intro to the wire-RHR before pivoting to the solenoid version.

- **`vector_resolution` (shipped):** Cliff in STATE_3. The radial-vs-axial component decomposition in s3_3 / s3_4 ASSUMES the student knows you can split a vector into perpendicular components. **Patch sentence (added between s3_2 and s3_3):** *"To see why this happens, we split each field arrow into two pieces — one pointing along the solenoid axis, one pointing radially outward. (Vector resolution — same trick as splitting forces on an incline.)"* Acknowledges the prerequisite, gestures to a familiar example (forces on incline from `vector_resolution`), keeps moving.

### 1b. JEE-backwards trace (conceptual EPIC-L only per M1–M6 carve-out; board/competitive trace deferred to M7/M8)

**Test question (JEE-Main style, conceptual):**
*"A long solenoid of length 0.5 m has 500 turns carrying a current of 2 A. A second solenoid is made by stretching the same coil to length 1.0 m (same number of turns, same current). What is the ratio B₁ / B₂ of the magnetic fields inside the two solenoids? In which direction does B point in each, given the current flows anticlockwise viewed from the top?"*

Knowledge required → state delivering it:
- "B inside is along the axis" → STATE_3 (axial-superposition reveal)
- "B = μ₀nI" → STATE_6 (formula reveal)
- "n = N/L, so stretching halves n" → STATE_6 (n-vs-N reveal in s6_2, and slider behaviour s6_4)
- "B₁ / B₂ = n₁ / n₂ = 2/1" → derivable from STATE_6's "double n, double B" line
- "Direction by RHR: anticlockwise current viewed from top → B points UP along axis" → STATE_5 (solenoid RHR)
- "Outside the solenoid B ≈ 0 (so 'inside' qualifier matters)" → STATE_4

All knowledge delivered. No gaps. Board-mode trace (showing the worked-derivation form on an answer sheet with mark breakdown) is deferred to M7 per carve-out.

### 1c. Misconception-entry mapping

For each EPIC-C branch, name the EPIC-L sentence/visual that PLANTS that wrong belief, then either modify or flag explicitly.

1. **`b_solenoid_field_is_radial`** — Planted by STATE_2's reveal of *circles around each turn*. A student watching multiple circular patterns overlap can misread the overlap as a radial star. **Flag at planting moment:** add to s2_4: *"Six sets of circles look chaotic. But the chaos hides a pattern — the radial parts will cancel, and only the axial parts survive. Watch."* Pre-loads the resolution before the misconception can settle.

2. **`b_outside_solenoid_is_strong`** — Planted by STATE_3's emphasis on "strong inside." Student infers "if inside is strong, outside must be weak-but-similar." **Modify s3_5:** *"Inside the solenoid: uniform, strong, axial. Outside: that's the next surprise — we'll see in the next state."* Sets expectation that outside will surprise them.

3. **`b_field_depends_on_N_not_n`** — Planted by STATE_2's "six turns" emphasis. If you keep saying "six turns, six turns," students naturally hook B to N. **Modify s2_3:** *"Six turns spread over some length L. Hold that 'spread over L' in your head — it will matter in STATE_6."* Plants the seed that length matters before B is formalized.

4. **`b_rhr_same_as_wire`** — Planted by repeatedly invoking Diamond #1's RHR in STATE_2 ("each turn is just a wire, same rule"). Student carries the wire-grip into the solenoid. **Flag explicitly at STATE_5 s5_1:** "In Diamond #1 you learned: thumb along current, fingers curl with B. **That was for a STRAIGHT wire.** For a solenoid, the grip changes." Already in the plan — the explicit "for a straight wire" qualifier breaks the silent carry-over.

---

## Block 2 — Aha-moment designation (v2.3)

### PRIMARY aha (10-year-memory)

**"Inside a solenoid, the chaotic per-turn circles cancel each other's radial pieces — and what survives is one uniform, straight, axial magnetic field, like a bar magnet that you built out of pure current."**

State: **STATE_3.** Visual confirmation: the moment in s3_3/s3_4 when the per-turn circles fade to 30% opacity and the axial arrows arise along the solenoid's centerline. The student sees order emerge from overlap.

### SUPPORTING aha (1 — sweet spot)

**"Right hand, same hand — but the grip swaps roles. For a wire, thumb is current. For a solenoid, fingers are current."**

State: **STATE_5.** This supporting aha REINFORCES the PRIMARY: it tells the student "the wire-knowledge transfers — the geometry just rotates the hand by 90°." Cohesion check: STATE_5 only lands as an aha because the student already accepts STATE_3's "the inside is axial" — without STATE_3, STATE_5 is just an isolated rule. The two ahas are linked.

### Cohesion check

PRIMARY (axial superposition) and SUPPORTING (RHR-swap) are both about *the same axis*. PRIMARY says "the surviving field is along the axis"; SUPPORTING says "your thumb finds that axis." One physical insight (uniform axial B) viewed two ways (geometric superposition + hand-rule). Tight cohesion — both belong in this concept, not a sibling JSON.

A potential third supporting aha — "outside is ≈ zero" (STATE_4) — is excluded. It's surprising but doesn't reinforce or set up the PRIMARY. It belongs in this concept (it follows from the same superposition argument) but as a *consequence*, not as a separate aha. STATE_4 is informational, not transformational. 1 PRIMARY + 1 SUPPORTING = 2 total. Sweet spot.

### Wrong-belief setup states

- **PRIMARY aha setup (STATE_3):** STATE_2 builds the confident-wrong-belief that "many turns = many circles = some kind of chaotic mess in the middle." Without STATE_2's deliberate overload-on-turns, the cancellation in STATE_3 has nothing to break.
- **SUPPORTING aha setup (STATE_5):** STATE_2 ALSO sets up the wrong-belief for STATE_5 by invoking Diamond #1's wire-RHR via "each turn is just a wire." The student silently carries the wire-grip into STATE_5, then STATE_5 breaks it. STATE_2 does double duty as the wrong-belief setup for both ahas — efficient because the same "each turn is a wire" framing plants both seeds (radial-mess and wire-RHR).

### Foundational-coverage rule

PRIMARY aha state = STATE_3. `entry_state_map.foundational` = [STATE_1, STATE_2, STATE_3, STATE_4]. STATE_3 ∈ foundational. **PASS.** Students entering via foundational aspect cannot silently miss the 10-year-memory.

---

## Pass-2 dogfood notes (exploratory — feeds PASS_2_PROPOSAL.md retrospective)

This section is exploratory. The four-question lens is not yet in the architect spec; producing it here is to surface friction points for the Diamond #4 retrospective. Best stab per state, accepting that some answers may be generic — and that's the data.

### STATE_1 — Hook
- **Q1 (doesn't know yet):** *That a coiled wire produces a qualitatively different field shape than a straight wire.* (Physics-concrete.)
- **Q2 (feel confusion):** The morphing animation from straight wire → coil with no field shown leaves a "...so what?" gap. Hold the gap for 2-3s before the next TTS sentence.
- **Q3 (what moves):** The wire itself morphs into a helix. The geometry is the message; no words about coiling needed.
- **Q4 (hand/eye):** Eye tracks the wire as it morphs. No hand gesture yet (no RHR live yet).

### STATE_2 — Per-turn reveal
- **Q1:** *That a single turn of a coiled wire produces circles in a tilted plane, not a flat circle.*
- **Q2:** The first turn's circles fade in alone — student feels "OK, one turn done." Then the other 5 turns' fields appear in quick succession; the visual overload itself IS the felt confusion ("this is going to be a mess").
- **Q3:** Sequential reveal of 6 sets of field circles, fading in with 200ms stagger. Movement is the buildup.
- **Q4:** Eye drawn to the *overlap* zone (the central axis region). Critical that the focal primitive sits there, not on one of the individual turns.

### STATE_3 — Axial sum (PRIMARY aha)
- **Q1:** *That radial components of adjacent turns' fields point in opposite directions and cancel.* Without this, the axial-only sum looks magical.
- **Q2:** The 3-second pause after s3_2's prediction question is the single most important pause in this concept. The student MUST sit in "I don't know what happens between two turns" before the cancellation arrows appear. `pause_after_ms: 3000` is non-negotiable.
- **Q3:** Red cancellation arrows fade in BETWEEN the turns first (showing the cancellation visually); only after that do the blue axial arrows arise along the axis. Order matters — cancellation is the cause, axial-survival is the effect.
- **Q4:** Eye goes to the gap between two turns (where the cancellation happens). Hand wants to "trace along the axis" — this is a candidate for a future axis-trace gesture-mirror primitive. **Escalation candidate:** if testing shows students don't naturally trace the axis, file `peter_parker:renderer_primitives` bug for an axis-trace gesture cursor.

### STATE_4 — Outside reveal
- **Q1:** *That contributions from turns at different axial positions cancel almost perfectly outside the solenoid.*
- **Q2:** Pause after s4_1's "what do you predict?" — student instinct is "weaker but similar to inside." The fade-in-then-fade-out animation of outside arrows breaks the instinct.
- **Q3:** The fade-out IS the physics. Words explaining "it's almost zero" come after the visual.
- **Q4:** Eye should travel from inside (where it's been camped) to outside. Camera might need a small pan to encourage this, or a "look here" annotation on the outside region.

### STATE_5 — RHR swap (SUPPORTING aha)
- **Q1:** *That the wire-RHR grip does not transfer to a solenoid without role-swapping which hand part is the current.*
- **Q2:** s5_2's prediction question + 2-3s pause. Student tries to apply the wire-RHR mentally, gets confused, then the reveal lands.
- **Q3:** Right-hand overlay animates from the wire-grip (thumb-up, fingers-curl-out) to the solenoid-grip (fingers-curl-with-current-loops, thumb-axial). The HAND ANIMATION is the lesson. **This is a gesture-mirror primitive candidate** — current renderer may render hand as static SVG with case='A'/'B' toggle; if so, this is a Pass-2 escalation: file `peter_parker:renderer_primitives` for an animated grip-swap primitive. Don't ship a static workaround silently.
- **Q4:** Student's own right hand wants to mirror the on-screen grip. The on-screen animation MUST be the grip the student's hand can copy in real time. If the animation is too fast or the hand orientation is non-natural (e.g., palm-down when student's palm wants to be palm-out), the gesture mirror fails.

### STATE_6 — Formula
- **Q1:** *That n means turns-per-unit-length, not total turns, and that the formula contains no length term explicitly because length is folded into n.*
- **Q2:** Prediction in s6_1 ("N or something else?") + 2-3s pause. Student instinct is N; reveal breaks it.
- **Q3:** Formula writes character-by-character (handwriting animation). Then the s6_4 demonstrative — "stretch the solenoid, n halves, B halves" — should ANIMATE the solenoid stretching and the formula's n-value updating in real time. Animation, not just description.
- **Q4:** Eye on the formula in the callout zone. Hand wants to grab a slider and try it — but sliders don't appear until STATE_8 (interactivity-in-last-state rule). The s6_4 demonstrative serves as a teaser ("you'll get to try this in a moment").

### STATE_7 — Reverse current
- **Q1:** *That reversing the current direction reverses B but leaves magnitude unchanged.* (Familiar from Diamond #1, transferred here.)
- **Q2:** Short prediction in s7_2 (2s pause). The transfer-from-wire makes this state low-confusion; brief Q2 is appropriate.
- **Q3:** Current direction arrows flip; B-vector animates 180° rotation. Same animation idiom as Diamond #1 STATE_4.
- **Q4:** Hand re-mirrors the grip (now thumb-down instead of thumb-up). Gesture-mirror primitive applies again.

### STATE_8 — Explore
- **Q1:** *That n and I are the only two knobs that affect B inside; position (within the inside region) does not.*
- **Q2:** Not a confusion-feel state by design — this is "you drive." Confusion feel is reserved for the prior 7 states.
- **Q3:** Slider movement IS the visualization. n-slider drags → coil compresses/stretches in real time. I-slider drags → arrow density changes. B-meter reading updates live.
- **Q4:** Hand on sliders. Eye on the B-meter readout. Student moves the probe around inside the solenoid (if such a probe is rendered) and watches the reading stay constant — that's the kinaesthetic confirmation of uniformity.

### Re-entry orientation check
- Every state from STATE_3 onward must begin with the solenoid + at least the current-direction indicator visible in the first 5s, BEFORE new content reveals. STATE_3 in particular must show the per-turn circles from STATE_2 (faded to 30% opacity) so a returning student sees what they're about to dissect. STATE_5/STATE_6/STATE_7/STATE_8 must all show the axial-B-from-STATE_3 carryover in the first 5s.

### Friction surfaced for PASS_2_PROPOSAL retrospective
1. **Q1 wording slips toward Q3.** "What doesn't the student know yet" easily becomes "what's invisible until X moves" — which is really Q3 in physics terms. Architect-time Q1 may need rephrasing in the spec: *"name the missing concept in physics terms"* rather than the lens's current "name in physics terms (not abstract)."
2. **Q4 has a hidden sub-question** that fires only on RHR/FBD states (the gesture-mirror sub-question). Architect-time, that sub-question fires for STATE_5 and STATE_7 here. The spec's "ALSO ask" formulation works but is easy to skip — consider promoting the gesture-mirror sub-question to a standalone Q5 for hand-rule states.
3. **Pass-2 at architect time is partially speculative.** Several Q3/Q4 answers reference json_author-level details (`pause_after_ms`, `animate_in`, gesture-mirror primitives) that the architect can only forecast. Useful forecasting, but the *real* Q3/Q4 lands at json_author time. Architect's Pass-2 should be flagged as "design intent for json_author" rather than "ground truth."
4. **The cohesion check (Block 2) and Q1/Q2 (Pass-2) overlap.** Both ask "what is the student carrying into this state?" Worth checking in retrospective whether they're redundant or complementary.

---

## Self-review (architect/CLAUDE.md final checklist)

- [x] Atomic claim is ONE sentence.
- [x] State count (8) inside §7 medium band, with documented justification for the +2 over the 5–6 baseline.
- [x] 4 EPIC-C branches, each a real misconception, each STATE_1 visualizes the wrong belief.
- [x] 3 `has_prebuilt_deep_dive` states (STATE_3, STATE_5, STATE_6) with 3 cluster candidates each.
- [x] Every state has a `teaching_method`.
- [x] Every new-quantity state has a Socratic-reveal plan with prediction question + reveal primitive + reveal TTS sentence id.
- [x] `entry_state_map` has foundational + 3 aspect-specific ranges.
- [x] Prerequisites listed (advisory), 2 of 3 are shipped.
- [x] Real-world anchor is Indian (Bangalore MRI, Mumbai auto-rickshaw), plain English, physics-true.
- [x] DC Pandey check line in the header — scope only.
- [x] Engine bug queue check satisfied (no relevant violations).
- [x] **Block 1 present** — cliff sentences, JEE-backwards trace (conceptual-only per carve-out), misconception-entry mapping all filled.
- [x] **Block 2 present** — PRIMARY aha named, 1 SUPPORTING aha, cohesion check done, wrong-belief setup states identified.
- [x] **Foundational-coverage rule satisfied** — PRIMARY aha (STATE_3) ∈ `entry_state_map.foundational`.
- [x] **M1–M6 magnetism carve-out applied** — conceptual-only; board/competitive deferred to M7/M8; JEE-backwards trace against conceptual EPIC-L only.
- [x] No section missing. Skeleton is handoff-ready to physics_author.

---

## Handoff notes to physics_author

1. Physics block needs variables `n` (turns per metre, min 100, max 5000, default 1000), `I` (A, min 0.1, max 10, default 2), `L` (length, but probably derived from n × N; or just expose n directly), plus `mu_0`. Computed output: `B_inside = mu_0 * n * I`. Constraints: long-solenoid idealization (L ≫ R), ignore end effects, B_outside set to 0 in renderer though physically it's ε.
2. State-3's "infinite turns" assumption (drill-down cluster `infinite_turns_assumption`) needs a physics_author one-liner: *"In the long-solenoid limit, the field at any interior point depends only on local turn density, not on distance from the ends."*
3. Renderer integration: this is `field_3d` archetype A. Patterns to invoke from `magnetism.md` (M3-pending): `field_circles_from_1d_source` (adapted: source is the coil axis, but field structure is *interior axial*, not exterior circular — this may be a **missing pattern** the M4 gate surfaces), `rhr_curl_overlay` (adapted: thumb = B inside, fingers = current loops), `compass_approach_then_deflect` (probe inside solenoid reads strong; probe outside reads zero — strong contrast for STATE_4).
4. **Open question for human reviewer:** The "morph straight wire to coil" animation in STATE_1 may not exist as a renderer primitive yet. If `field_3d_renderer.ts` cannot morph the source geometry mid-state, STATE_1 needs a fallback: render the straight wire briefly in a sub-overlay, then cut to the coiled wire as STATE_1's main scene. Flag for `peter_parker:renderer_primitives` if morph isn't available.
5. **Open question for human reviewer:** STATE_5's hand-grip animation (wire-grip → solenoid-grip) is a gesture-mirror animation candidate. If the current `extras.right_hand` overlay only supports static case='A'/'B', the swap animation may not be possible. Quality_auditor should flag this on first render; physics_author can spec the animation in physics block as "out-of-renderer; needs primitive."

---

*Skeleton complete. Handoff to physics_author.*
