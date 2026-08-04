# `.agents/` — Canonical Agent Specifications

> Rewritten 2026-06-11 (Batch A of the codebase audit). The previous README described
> a five-role, non-runnable, pre-session-32 world that no longer exists.

Thirteen roles, five clusters (Alex authoring + verification · Review taste gate · Peter Parker engines · Release · Offline). Each `<role>/CLAUDE.md` here is the
**founder-edited canonical source**; `physics-mind/.claude/agents/<role>.md` is the
**emitted dispatch wrapper** (YAML frontmatter + canonical body) that Claude Code's
native auto-dispatch actually reads. These ARE runnable subagents — dispatch via the
Agent tool with the hyphenated name (`json-author`), or let auto-dispatch match on the
wrapper description. Governance, regeneration procedure, and the same-session
emission-regen rule live in [`./CLAUDE.md`](./CLAUDE.md) — read that before editing
any spec.

## The pipeline (Alex cluster — sequential, never parallel)

```
architect ──► [founder_proxy Checkpoint A] ──► physics_author ──► json_author
     ──► quality_auditor ∥ eye_walker ──► [founder_proxy Checkpoint B]
     ──► [founder_proxy Checkpoint C seal] ──► founder ──► (ship)
                                                       │ FAIL routes back to the
                                                       │ named upstream agent, or
                                                       ▼ escalates to Peter Parker
                                       peter_parker:field3d_surgeon      (field_3d)
                                       peter_parker:renderer_primitives  (2D → the
                                                          pcpl_surgeon agent)
                                       peter_parker:runtime_generation
                                       (engine cluster — never call directly;
                                        see peter_parker/OVERVIEW.md)

feedback_collector — OFFLINE nightly only (E38–E41 quartet); writes to
proposal_queue for founder approval. Never in live serving paths.
DORMANT 2026-07-31 — shelved until real teacher feedback rows exist.

Added 2026-07-04: eye_walker (parallel verification — frame reads, alongside
quality_auditor) · retrofit_surgeon (per-concept named doctrine deltas) ·
shipper (Release cluster — founder-approval-gated post-approval chain).

Added 2026-07-23: chemistry_author (Alex) — CHEMISTRY concepts substitute it
at position #2: architect ──► chemistry_author ──► json_author ──►
quality_auditor. Same handoffs, same FAIL routing. Physics concepts are
unchanged. (CHEMISTRY_BUILD_PLAN.md Phase 2.)

Added 2026-08-04: mathematics_author (Alex) — MATHEMATICS concepts substitute
it at position #2: architect ──► mathematics_author ──► json_author ──►
quality_auditor. Same handoffs, same FAIL routing. Physics and chemistry are
unchanged. Two mathematics-only gates ride on top: nothing is authored off the
ranked list (docs/MATHEMATICS_DISCUSSIONS.md §6 — the whiteboard test bites
hardest in this subject), and only [LIVE] archetypes in
docs/patterns/mathematics.md may be specified until the cartesian_plane
scenario lands on master. (MATHEMATICS_BUILD_PLAN.md Phase 2.)

Graduated 2026-07-31 (from the ch7/ch8 chapter-loop trial): founder_proxy
(Review cluster — the founder's taste gate at Checkpoints A/B/C; reject-biased,
report-only, APPROVE = authoring sign-off never shipping) · field3d_surgeon
(Peter Parker — field_3d_renderer.ts specialist + Phase-0 scenario builds;
docs/AUTHORING_PIPELINE.md §0). Same day: renderer_primitives renamed
pcpl_surgeon (DB tag unchanged).
```

- **architect** decides WHAT: state count, arc shape, Rule 16a misconception beats
  (EPIC-C branches deferred until real students exist — 2026-06-10 directive),
  Definition of Done, deep-dive hot states, prerequisites, universal real-world anchor (Rule 35).
- **physics_author** decides HOW MUCH: formulas, variables, constraints, reveal
  timeline, drill-down phrasings. (Board mark schemes: deferred — conceptual-only
  directive 2026-06-11.)
- **chemistry_author** (added 2026-07-23) — the chemistry sibling of
  physics_author, substituted at position #2 for chemistry concepts: balanced-
  equation ledger (atom/charge conservation, redox electron balance), quantities
  with chemistry units, formulas, Rule 31 timelines targeting archetypes in
  `docs/patterns/chemistry.md` that map to EXISTING renderers, drill-down
  phrasings, constraints.
- **json_author** decides WHERE: coordinates, primitives, conceptual mode only
  (no mode_overrides while the 2026-06-11 directive is active), 8 registration sites,
  SQL migration.
- **quality_auditor** decides IF: gates 0–20 with machine-extracted evidence,
  silent-failure probes, anti-plagiarism, visual walk. Reports + routes; never edits.
  (Gates 5/6 deep-dive/drill-down currently deferred — see banners in its spec.)
- **eye_walker** (added 2026-07-04) reads THE EYE frame dumps in its OWN context —
  per-state verdict table + ≤5 curated frames for founder eyes. Curates, never
  approves (`visual:approve` stays founder-triggered). Dispatched in parallel with
  quality_auditor.
- **retrofit_surgeon** (added 2026-07-04) applies ONE named doctrine delta to ONE
  existing concept — minimal surgical diff, preserves cue/glow bindings + the
  PRIMARY aha. Fleet migration = N parallel dispatches.
- **shipper** (added 2026-07-04; Release cluster) runs the founder-approval-gated
  Rule 30h release chain (visual:approve → tts:generate → build:review → verify).
  Refuses to run without an explicit founder-approval statement.
- **founder_proxy** (graduated 2026-07-31; Review cluster) plays the founder's own
  review at three checkpoints — A: is this skeleton the highest-value design? B: would
  the founder approve this build? C: did every claimed fix actually land? Reject-biased,
  Opus-pinned, report-only. Its APPROVE is authoring sign-off, never shipping.
- **pcpl_surgeon** / **field3d_surgeon** / **runtime_generation** (Peter Parker) fix
  ENGINES, never content — see peter_parker/OVERVIEW.md for the ownership split.
- **feedback_collector** decides WHAT CHANGES NEXT: cluster proposals from student
  signal. Design-locked; fuel-starved until real students exist — DORMANT 2026-07-31.

## Reading order per session

One role at a time. Each agent reads ONLY its own spec plus:
1. `C:\Tutor\physics-mind\CLAUDE.md` (the operating manual — mandatory every session).
2. `C:\Tutor\physics-mind\CLAUDE_RULES.md` (full rule bodies) as the §7 index points there.
3. The upstream agent's OUTPUT (not its spec).
4. Reference files as needed: `docs/AUTHORING_PIPELINE.md` (the authoring SOP — follow
   for every new sim), `C:\Tutor\physics-mind\CLAUDE_TEST.md`, and the archived docs at
   `physics-mind\docs\archive\`: PLAN.md [HISTORICAL], CLAUDE_REFERENCE.md [STALE],
   CLAUDE_ENGINES.md [SUPERSEDED — engine numbering kept only for scar-tag continuity].

**Anti-pattern**: loading all fourteen specs at once — context bloat + role confusion.

## Current-phase directives every spec already encodes (2026-06-11)

1. **Conceptual mode only** — board + competitive dropped (CLAUDE.md Rule 20
   suspension). New JSONs ship `epic_l_path` only.
2. **EPIC-L-first** — zero `epic_c_branches` until real students exist; misconceptions
   confronted inside EPIC-L (Rule 16a).
3. **No runtime deep-dive** (Rule 18) — the Explain button routes to a feedback form;
   deep-dives are hand-authored post-analytics only.
4. **Evidence discipline** — no PASS/FAIL claim without pasted tool output (a 2026-06-11
   audit subagent fabricated a compliance finding; never again).
5. **Definition of Done before building** — architect section 10 + quality_auditor
   Gate 0 (the biot_savart ~7-round lesson).

## History

The original five-spec system (sessions 30.5–31) treated these as non-runnable
role-play templates with a planned session-32 proof run on `umbrella_tilt_angle`.
That proof run happened (2026-04-23), the specs became dispatchable wrappers in
session 36, Peter Parker + the umbrella CLAUDE.md arrived later, and the specs have
since grown far past their original ≤150-line budget (quality_auditor alone is 400+
lines of accumulated gate law). Old content is in git history.

## Cross-references

- Governance + regen procedure: [`./CLAUDE.md`](./CLAUDE.md)
- Engine cluster charter: [`./peter_parker/OVERVIEW.md`](./peter_parker/OVERVIEW.md)
- Project manual: `C:\Tutor\physics-mind\CLAUDE.md` · Roadmap (historical): `docs\archive\PLAN.md`
- Authoring SOP: `docs/AUTHORING_PIPELINE.md` · Session log: `physics-mind/PROGRESS.md`
- Zod schema: `src/schemas/conceptJson.ts` · Validator: `src/scripts/validate-concepts.ts`
- Agent-teams decision rule: `~/.claude/rules/agent-teams-reference.md`
