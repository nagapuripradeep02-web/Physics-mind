# PASS_2_PROPOSAL — student-experience lens, pending dogfood

> **PROPOSAL — dogfood on Diamond #4 before formalizing into agent specs. Do not treat as authoritative until promoted.**
>
> Created 2026-05-22. Owner: founder + orchestrator.

## Status

- **Pass-1 lens**: formalized into `physics-mind/.agents/architect/CLAUDE.md` §"Two-pass cognitive lens" and `physics-mind/.agents/quality_auditor/CLAUDE.md` Gate 14 on 2026-05-22.
- **Pass-2 four-question lens** (this doc): not yet in agent specs. Lives here pending Diamond #4 validation. If the lens proves valuable, it ships as a follow-up commit into `json_author/CLAUDE.md` + `quality_auditor/CLAUDE.md` Gate 15. If it doesn't, this doc gets revised and retried.

## Why Pass-2 is deferred (not skipped)

Three reasons it's not in the spec yet:

1. The lens has been validated **retroactively only** — on `torque_on_current_loop_in_field.json` STATE_6/7 during session 2026-05-21, AFTER the JSON had been authored without it. We don't know yet whether the four questions actually produce better JSONs during fresh authoring, or whether they add ceremony without insight.
2. The "spot-check 2 random non-introductory states" enforcement in the proposed Gate 15 is specifically unproven — that's a concrete enforcement choice, not a first-principles derivation, and it deserves dogfooding before becoming a hard gate.
3. The existing Socratic-reveal discipline (architect §"Socratic reveal" + json_author §v2.2 deltas + quality_auditor Gate 3c) already covers ~70% of operational Pass-2. The marginal value of Q1 ("what doesn't the student know yet") + Q2 ("what makes them feel confusion") needs to be measured on a fresh diamond before formalizing.

## The four-question Pass-2 lens

Apply per-state. If you can't answer all four in concrete terms (not generic), the state isn't done yet.

1. **What does the student NOT know yet at this moment?** Not what I want to teach — what is genuinely invisible to them right now. Name it in physics terms ("the current direction is invisible until dots flow"), not abstract ("they don't know the answer yet").
2. **What would make them FEEL the confusion before resolving it?** Not explain it. *Feel* it. The moment of "wait, something is happening and I don't know why yet." Use `pause_after_ms ≥ 2000` after the prediction question so the student sits in the confusion for at least 2 seconds.
3. **What needs to MOVE or APPEAR to make the physics visible — not described?** If you're writing words about current flowing, you've failed. The current should be moving on screen before the words start. `reveal_at_tts_id` does the timing; `animate_in` does the motion.
4. **Where does the student's hand or eye go?** Not where I want them to look — where they instinctively look. Put the important thing there. For RHR / FBD / gesture-based states, ALSO ask: *what does the student's hand want to do?* Does the on-screen animation mirror that gesture? If not, escalate to `peter_parker:renderer_primitives` for a gesture-mirror primitive — don't ship a static-arrow workaround silently.

### Re-entry orientation rule (companion check)

The first 5 seconds of every state should re-establish context visually — the relevant bodies, field, and vectors visible — so a returning student (one who hasn't watched the prior states this session) can orient without rewatching. New content lands AFTER that 5s of orientation.

## Proposed `json_author/CLAUDE.md` addition (verbatim, ready to copy when promoted)

Insert after §"v2.2 schema deltas (session 33 additions — non-breaking)" and before §"Teacher script — language discipline (Rule 13)":

> ## Pass-2 four-question lens (v2.3 addition) — per-state self-check
>
> **Layering note**: §"Socratic reveal" in architect/CLAUDE.md and the `reveal_at_tts_id` + `pause_after_ms` wiring above are the **tactical execution** of Pass-2. The four-question lens below is the **strategic presence-check that the tactic was executed for the right reason**. Socratic reveal answers Q3 (what moves) and partially Q4 (where eye goes). It does NOT answer Q1 or Q2. You must answer all four.
>
> Before declaring a state done, answer all four in concrete terms (not generic). If you can't, the state isn't done.
>
> 1. **What does the student NOT know yet at this moment?** Not what I want to teach — what is genuinely invisible to them right now. Name it in physics terms ("the current direction is invisible until dots flow"), not abstract ("they don't know the answer yet").
> 2. **What would make them FEEL the confusion before resolving it?** Not explain it. *Feel* it. Use `pause_after_ms ≥ 2000` after the prediction question. The student should sit in "wait, something is happening and I don't know why yet" for at least 2 seconds.
> 3. **What needs to MOVE or APPEAR to make the physics visible — not described?** If you're writing words about current flowing, you've failed. The current should be moving on screen before the words start. (`reveal_at_tts_id` does the timing; `animate_in` does the motion.)
> 4. **Where does the student's hand or eye go?** Not where I want them to look — where they instinctively look. Put the important thing there. For RHR / FBD / gesture-based states, ALSO ask: what does the student's hand want to do? Does the on-screen animation mirror that gesture? If not, escalate to `peter_parker:renderer_primitives` for a gesture-mirror primitive — don't ship a static-arrow workaround silently.
>
> **Re-entry orientation rule**: the first 5 seconds of every state should re-establish context visually — the relevant bodies, field, and vectors visible — so a returning student (who hasn't watched the prior states this session) can orient without rewatching. New content lands AFTER that 5s of orientation.

Append to §"Self-review checklist (run before handoff to quality_auditor)":

> - [ ] Pass-2 four-question lens answered concretely for every state (not "TBD", not generic).
> - [ ] Re-entry orientation check — first 5s of each state shows relevant context.
> - [ ] For RHR/FBD/gesture states: gesture-mirror primitive present OR escalation note attached (`peter_parker:renderer_primitives` bug filed).

## Proposed `quality_auditor/CLAUDE.md` Gate 15 (verbatim, ready to copy when promoted)

Insert after the current §"Gate 14 — Pass-1 strategic audit (v2.3 addition)":

> ### Gate 15 — Pass-2 four-question audit (v2.3 addition, pending Diamond #4 validation)
>
> **Layering note**: Gate 15 sits ABOVE Gate 3c. 3c is the *implementation check* (do `reveal_at_tts_id` bindings exist? Is the prediction sentence before the reveal sentence?). 15 is the *intent check* (does what reveals actually answer "what makes them feel confusion?"). 3c PASSes do not imply 15 PASSes.
>
> **Gate 3b (persona-lens) and Gate 15 (four-question) coexist**: 3b is the author persona ("would Mayer / a topper approve?"), 15 is the per-state cognitive presence check ("was the four-question lens answered concretely?"). Different abstractions, both required.
>
> For every EPIC-L state, walk the four-question lens and confirm the json_author's self-check answers are concrete, not generic:
>
> - **15a.** "What student doesn't know" is named in physics terms ("the current is invisible until dots flow"), not abstract ("they don't know the answer yet").
> - **15b.** "What makes them feel confusion" cites a specific primitive or pause beat ("3s pause after `s7_2`, wrong-belief annotation visible left, answer annotation hidden until `s7_3`").
> - **15c.** "What moves to make physics visible" cites a primitive with `animate_in` or `reveal_at_tts_id`.
> - **15d.** "Where the student's hand/eye goes" cites a focal primitive or annotation position. For states involving a directional rule (RHR, FBD, vector decomposition), additionally confirm a hand-mirror gesture primitive is present OR an explicit escalation note exists (`[escalation: peter_parker:renderer_primitives bug #N — rendered today as static arrows]`).
>
> Any state failing >2 of the 4 sub-checks = FAIL, route to `alex:json_author` with reason tag `[reason: pass-2]`.
>
> **Re-entry orientation sub-check (15e)**: spot-check 2 random non-introductory states. Each should establish visual context in the first 5s before new content lands. Heavy violation = FAIL.

## Layering notes — how the existing gates and proposed Gate 15 fit together

| Layer | Gate(s) | Scope | Abstraction |
|---|---|---|---|
| Schema | Gates 1, 2 | Type-check + Zod validator | Mechanical |
| Schema discipline | Gate 3a, 3d | CLAUDE.md §2 rules + E42 9 conditions | Mechanical |
| Persona judgment | Gate 3b (topper / Mayer / PER-canon) | Would these reviewers approve? | Pedagogy-as-persona |
| Tactical execution | Gate 3c (Socratic reveal discipline) | Do `reveal_at_tts_id` bindings + pauses exist and order correctly? | Tactical |
| Visual walk | Gates 4–7 | Live render in both paths, deep-dive smoke, drill-down smoke, console clean | Operational |
| Bug regression | Gate 8 | Engine bug queue probe enforcement | Regression |
| Layout / vocab | Gates 9–13 | Overlap, expression resolution, plain English, visual continuity, animation vocab | Operational |
| **Strategic Pass-1** | **Gate 14 (live in spec)** | **Cliff / JEE-backwards / misconception entry / aha designation / foundational coverage** | **Strategic** |
| **Strategic Pass-2** | **Gate 15 (proposed)** | **Per-state cognitive presence check via four-question lens** | **Strategic** |

Gates 14 + 15 are the only two STRATEGIC gates. Everything else is mechanical, tactical, operational, or regression. That's why they sit at the top — they enforce the WHY, not the HOW.

## Dogfood instructions for Diamond #4

When Diamond #4 (`magnetic_field_solenoid` or whichever concept is next in `MAGNETISM_ARCHITECTURE.md`) enters authoring:

1. **Architect phase** — produces Block 1 + Block 2 per the now-formalized v2.3 architect spec. Gate 14 applies on the skeleton.
2. **Physics_author phase** — unchanged.
3. **Json_author phase** — manually apply the four-question lens to each state. Record the answers (concrete, not generic) in a session notes file at `physics-mind/docs/notes/diamond4-pass2-notes.md`. This is the dogfooding artifact.
4. **Quality_auditor phase** — runs Gates 1–14 from the formalized spec, AND manually walks Gate 15 against the dogfood notes. Record any state where Gate 15 *would* have caught something Gates 1–14 missed.
5. **Post-ship retrospective** — review the dogfood notes:
   - Did the four-question lens catch real issues, or was it ceremony?
   - Were the answers actually concrete, or did the author lapse into generic phrasing?
   - Did Q1 + Q2 add value beyond what Socratic reveal already enforces?
   - Did the re-entry orientation rule catch any real "returning student would be lost here" cases?
6. **Promotion decision** — if dogfood validates the lens, ship the verbatim json_author + Gate 15 sections from this doc into the canonical specs. If it doesn't, revise this doc with what was learned and try again on Diamond #5.

## What gets retired when Gate 15 promotes

- This file (`PASS_2_PROPOSAL.md`) becomes a historical record. Move to `physics-mind/docs/archive/` once promoted.
- The dogfood notes file (`diamond4-pass2-notes.md`) stays in place as concrete examples of "how to answer the four questions" for future authors.

## Patterns library prerequisite (M4 transition)

Reminder, not part of this proposal: **before `peter_parker:scene_designer` ships at M4 binary gate**, every entry in `docs/patterns/magnetism.md` (and any future patterns library) must carry a Pass-2 annotation block describing what the student feels when the composed primitives appear. Without that retrofit, scene_designer's first batch of JSONs will systematically fail Gate 15 (once promoted) — and there's no human author to fix them. Patterns-library retrofit + Gate 15 promotion + scene_designer launch must be sequenced together.

This requirement is independent of this proposal's promotion decision. Even if Gate 15 doesn't ship, the patterns library needs Pass-2 thinking baked in for scene_designer to produce student-experience-aware output. The framework lives somewhere — either in the spec (Gate 15) or in the patterns (annotation blocks) or both. Doesn't live only in the orchestrator's head.
