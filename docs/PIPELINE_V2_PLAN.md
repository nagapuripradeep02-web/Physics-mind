# PIPELINE_V2_PLAN.md — The pipeline architecture roadmap

# v1.0 | 2026-07-31 — locked with founder (Pradeep) in the pipeline-v2 session.
# Phase 1+2 (roster graduation + doctrine) SHIPPED on `feat/pipeline-v2`; Phases 3–6 are the roadmap.
# This doc is the cross-session, cross-laptop source of truth for WHERE THE PIPELINE IS GOING.

---

## §0 — Why this exists (the 2026-07-31 audit, in three findings)

1. **The floor-raising machine is world-class; the ceiling-raising machine was never built.**
   The scar list (`engine_bug_queue`: 350 FIXED at audit time) turns every past defect into a
   permanent automated probe — closed and compounding. But every gate answers "is it broken?";
   only the founder answers "is it excellent?" → founder-proxy graduates as the standing taste
   gate, and the exemplar rubric (Phase 4) becomes the ceiling flywheel.
2. **Chapter cost is driven by UNPLANNED engine work, not review agents.** Token forensics
   (2026-07-25): new renderer/scenario work ≈ 42% of Ch.7's 1,296M tokens; review agents 7–15%;
   founder-proxy 3–6%; architect 0.7%. Ch.8 ran the amendments (specialist surgeon, one bug per
   dispatch, fresh session per concept) and did equivalent work in **177M** — ~7× cheaper.
   → the Phase-0 chapter doctrine + engine-dispatch discipline are now standing law
   (`docs/AUTHORING_PIPELINE.md` §0).
3. **The human loops are the real gap, and no agent substitutes.** Teacher review stalled
   (2 reviews total, last 2026-06-17); `pilot_feedback` = 0 rows from 8 real teachers /
   1,314 events; `student_confusion_log` still founder-sourced. Phase 6 exists for this,
   and feedback-collector stays DORMANT until it has real fuel.

## §1 — The target architecture (now live on master after Phase 1+2)

```
┌─ PER CHAPTER (once) — AUTHORING_PIPELINE.md §0 ───────────────────────────┐
│ 0a survey ALL concepts → union of engine needs (does an existing scenario  │
│    family stretch? cheapest Phase 0 = the one you don't need)              │
│ 0b deepest-concept skeleton + physics block → founder-proxy Checkpoint A   │
│ 0c surgeon builds ONE configurable scenario; its report = the JSON         │
│    contract for json-author                                                │
│ 0d concepts 1..N as pure JSON — 2..N need ZERO renderer edits, else ALARM  │
└────────────────────────────────────────────────────────────────────────────┘
┌─ PER CONCEPT ──────────────────────────────────────────────────────────────┐
│ architect (Fable 5) ──► founder-proxy Checkpoint A (Opus 5)                │
│   ──► physics-author / chemistry-author (Sonnet 5)                         │
│   ──► json-author (Sonnet 5)                                               │
│   ──► gates: tsc → validate:concepts → THE EYE ($0, mandatory)             │
│   ──► eye-walker ∥ quality-auditor (Opus 5)                                │
│   ──► founder-proxy Checkpoint B → C                                       │
│        │ FAIL[owner: peter_parker:*] → the owning surgeon, ONE bug_class   │
│        │ per dispatch, re-verify                                           │
│   ──► FOUNDER (visual:approve) ──► teacher review ──► shipper (Haiku)      │
└────────────────────────────────────────────────────────────────────────────┘
Engine layer: field3d-surgeon (Opus 5, field_3d + deriveStateMeta) ·
              pcpl-surgeon (Sonnet 5, parametric + particle_field) ·
              runtime-generation (Sonnet 5, generator/serving/cache — sole
              cache-DELETE authority)
Dormant:      feedback-collector (until real teacher feedback rows exist)
Compounding:  scar list (floor — live) · exemplar rubric (ceiling — Phase 4)
```

**Model-pin economics (founder-locked 2026-07-31):** taste roles get the best model, mechanical
roles the cheapest reliable one. Architect stays Fable 5 (0.7% of spend — negligible; the design
is the leverage). founder-proxy stays **Opus 5, NOT Fable** (token-cost call — Fable quota is the
scarce resource; revisit only if design quality plateaus, and then Checkpoint A only).
field3d-surgeon stays Opus 5 (audit: half the calls of Sonnet ⇒ cheaper in practice).

## §2 — Phase ledger

| Phase | What | Status | Trigger / notes |
|---|---|---|---|
| **1** | Graduate founder-proxy + field3d-surgeon (de-trial specs, scar-filing policy, owner-tag code lists) · rename renderer-primitives → pcpl-surgeon (DB tag unchanged) · feedback-collector DORMANT · governance sweep (13 roles) | **SHIPPED 2026-07-31** (`feat/pipeline-v2`) | — |
| **2** | Phase-0 chapter doctrine + Amendment-4 engine-dispatch discipline + founder-proxy checkpoints → `AUTHORING_PIPELINE.md` (v1.1). CHAPTER_LOOP.md re-bannered: doctrine graduated, the autonomous loop itself stays founder-triggered | **SHIPPED 2026-07-31** | — |
| **3** | **THE CALCULATOR** — a numeric-physics gate beside THE EYE: drive each state headlessly, read HUD/probe/readout values, assert against the physics computed from the concept's own variables. 3 invariant classes: readout-matches-formula · conservation checks · slider-response direction. $0, deterministic, no AI. | **SHIPPED 2026-07-31** (`feat/the-calculator`) — **ADVISORY** | `npm run numeric:calc -- <id>`. Fills the one uncovered gate: nothing verified the NUMBERS a teacher reads are physically right. Promotion to blocking + CI is a separate decision (see §5). |
| **4** | **Exemplar rubric** — distill WHY `faraday_law_induction` / `resistivity` / `magnetisation_and_intensity` are excellent into a scored sheet → becomes founder-proxy's Checkpoint A/B scoring rubric. Every founder rejection thereafter feeds it (the ceiling counterpart of the scar list). | **DRAFT 2026-08-01** — `docs/EXEMPLAR_RUBRIC.md` v0.1 | Derived from evidence (measured exemplar structure + 6 real founder rejections quoted from their fix commits); 10 scored dimensions. **NOT wired into founder_proxy yet** — 4 taste calls need the founder (§6 of that file): the score thresholds, whether the exemplar set is still current, whether `resistivity`'s Rule-41-violating titles get retrofitted, and whether a 0 blocks at Checkpoint A. |
| **5** | **Renderer modularization** — `field_3d_renderer.ts` is ~55K lines in ONE template literal (no backticks, drifting line numbers, 42%-of-cost re-exploration). New scenarios born as modules with co-located manifests (knobs/cues/widgets/deriveStateMeta entries in one place); old scenarios migrate ONLY when touched, shielded by H2 frozen baselines (byte-identical frames = proven-harmless refactor). Never a big-bang rewrite. | Slow burn, separate branch | Third-use signal for extracting shared parts (meters, zoom-links, graphs) into a library — composition over bespoke scenario blocks is the long-term "powerful renderer" bet. |
| **6** | **Feedback loop** — end-of-concept feedback prompt in the pilot player (a well-timed one-tap ask, not the passive corner button: 1,314 events / 0 feedback rows says passive doesn't work) + 4-bucket routing (teaching / build / test / engine-bug) for `pilot_feedback` rows, same funnel as Asmi's reviews. Re-activates feedback-collector when rows exist. | Product work, independent | The paying teacher's feedback outranks all telemetry. |
| **3.5** | **Desk hygiene + LAND** — the repo half of the pipeline, which no agent owned. `npm run desk:audit \| sync \| new \| close` make the countable failures machine-checked (stranded commits, drift behind master, desks left open after merge, the `node_modules` junction-removal order); the `git-steward` agent (Ops cluster, 14th role) carries a sealed desk to a reviewable PR and **stops at any conflict under `src/`**, routing Rule-40 platform files to the owning surgeon. `AUTHORING_PIPELINE.md` gains the ⧉ LAND companion step; `GIT_WORKFLOW.md` gains §7. | **SHIPPED 2026-08-01** | Triggered by an audit that found 7 commits on one disk, 3 desks 81 behind, and a merged desk still open. Deliberately NOT autonomous: it opens the PR, the founder merges. |
| — | physics-author → architect merge | **DEFERRED (founder, 2026-07-31)** | Rejected this round: architect's Fable pin is a quota-conservation directive — merging would bill formula grunt work at Fable tier and delete the one adversarial cross-check (physics-author can STOP a flawed skeleton). Revisit after the proof run only if the handoff proves leaky. |
| — | Full autonomous chapter loop as default | **Founder-gated** | The loop protocol (`CHAPTER_LOOP.md`) stays an explicit-instruction capability. Graduating it to default is a separate decision. |

## §3 — Proof run (the acceptance test for Phase 1+2)

Next NEW concept (e.g. the next Kinematics sibling on the existing `kinematics_1d_track`
scenario — JSON-only path, no engine work):
1. architect skeleton → **dispatch founder-proxy Checkpoint A** (new roster loads at session
   start — dispatch from a session opened AFTER the merge).
2. Normal pipeline → eye-walker ∥ quality-auditor → **Checkpoint B** → founder.
3. Any engine finding routes to the correct surgeon by file (field_3d → field3d-surgeon).
Success = the checkpoints produce actionable taste findings the gates missed, at ~2M
tokens/dispatch, and no routing lands on the wrong surgeon.

## §4 — Standing facts a future session should not re-derive

- The `peter_parker:renderer_primitives` DB tag is PERMANENT (CHECK-constrained, 172+ historical
  rows) and maps to the `pcpl-surgeon` agent. New field_3d bugs file under
  `peter_parker:field3d_surgeon` — never under the legacy tag.
- Live `engine_bug_queue` enums (verified 2026-07-31): severity `CRITICAL|MAJOR|MODERATE` (NO
  MINOR) · probe_type `sql|js_eval|manual|vision_model` · row_type
  `incident|probe_definition|directive`.
- `faraday_law_induction` has NO committed visual baseline fleet-wide (H2 silently skips);
  `capacitance` is the genuine H2 pixel proof in the field_3d regression pair. (Baselining
  faraday + `force_on_current_carrying_wire` — both DEPLOYED without baselines — is open work.)
- sync-agents.js is mtime-gated with a hardcoded ROLES list: canonical must be NEWER than its
  emission or sync silently skips; a first-try "all up-to-date" after copying files is a false
  negative. Emission frontmatter/preamble are hand-maintained (sync never regenerates them), and
  unquoted `description:` values containing `": "` silently break dispatch — keep them quoted.

## §5 — THE CALCULATOR: what it is and what promoting it requires

Shipped ADVISORY. `npm run numeric:calc -- <id>` — no `.env.local`, no Supabase, no AI, $0.

**Ground truth is the concept's own declared physics, never the renderer.** `computed_outputs`
is the primary source (586 declared fleet-wide, 555 normalize, **429 evaluate**);
`variables[].derived` is secondary (345 declared, 257 normalize, **163 evaluate**).
`formulas` and `constraints` are prose and are never parsed. Using `computePhysics_<id>` or a
renderer internal would make every assertion vacuously true.

**Inputs come from the screen, relationships from the JSON.** States animate their inputs, so
independent variables resolve live (painted value > visible slider > state override > declared
default) and dependent ones are recomputed. Where an input could only be read from a declared
default, a MISMATCH is ambiguous and SKIPs; a MATCH still counts. The asymmetry is deliberate.

**Three harvest channels, no renderer edit:** DOM overlays; a
`CanvasRenderingContext2D.prototype.fillText` hook (the only handle on p5 instruments, and it
also catches sprite labels, which render into an offscreen 2D canvas); Three.js sprite `_pmText`.

**Before promoting it to blocking / to `verify.yml`, three things must be true:**
1. The fleet census shows a false-positive rate near zero — every FAIL hand-confirmed.
2. CI can run it: it needs chromium plus the CDN `<script>` tags in the assembled HTML. Either
   install chromium in the workflow and allow the network, or vendor three/p5 locally.
3. `AUTHORING_PIPELINE.md` §③ and `GIT_WORKFLOW.md`'s pre-merge triad are updated together.

Known limitation, by design: sensitivity is lower in states that expose no sliders, because
their inputs are only readable from declared defaults and mismatches there must skip.
