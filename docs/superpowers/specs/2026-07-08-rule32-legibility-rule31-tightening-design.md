# Design — Rule 32 (legibility doctrine) + Rule 31 tightening + subagent model split

**Date:** 2026-07-08 · **Status:** APPROVED (founder, brainstorm session this date) · **Scope:** doctrine + agent specs + model pins — upcoming sims only, no fleet retrofit, no engine/schema code changes.

---

## 1. Problem

Rule 31 (2026-07-02) already mandates straightforward beats, distinct motion, and per-state contextual controls — but three gaps remain:

1. **Pacing is contradictory and unenforced.** Three numbers coexist (Rule 31: ~15–25s · vault: ~28–35s · founder 2026-07-04: ~20s/~55 words), and nothing counts words at the gate. Pacing = narration length (`text_en`), not the JSON `duration` field.
2. **"No two states alike" is a judgment call.** Only quality_auditor Gate 3e prose + eye_walker eyeballing enforce it. At fleet velocity, near-duplicate states will slip through.
3. **"The teacher notices the difference" has no home.** States being different is not the same as each state making its *delta legible* to a teacher clicking through mid-class. Nothing in doctrine asks for that today.

## 2. Decisions (founder-approved in session)

| Question | Decision |
|---|---|
| Pacing cap | **One idea + one complete motion** per state; narration 25–55 EN words; >55 = split flag, <~20 = merge/enrich flag; motion may outrun narration, never the reverse |
| Distinctness enforcement | **Motion-archetype taxonomy + no-repeat gate** (contrast-pair exception), as design artifact + auditor gate — NOT a Zod field yet |
| Menu picks | **A1 cause-before-effect, A2 one-variable-moves, B1 delta cue, B2 scene continuity, C3 single focal** adopted now; A3/B3/C1/C2 deferred with triggers |
| Structure | **New Rule 32** ("legibility doctrine"); Rule 31 stays *shape*, Rule 32 is *visibility* |
| Models | **Fable 5 architect + Sonnet 5 all other pipeline/engine roles**; shipper stays haiku |
| Rollout | Prove on next 2–3 new concepts (`magnetic_flux` → `lenz_law` → `magnetic_materials`), Asmi pulse-check, then consider schema hardening |

## 3. Rule 31a amendment — pacing (one idea + one complete motion)

Replace the pacing sentence in Rule 31a (CLAUDE_RULES.md #31) and every echo of it (CLAUDE.md §5 pacing line, §7 Rule 31 index line, architect spec §3 duration column) with:

> A guided state = **ONE idea + ONE complete motion cycle**. Narration budget **25–55 EN words (2–4 tight sentences ≈ 10–20s at teaching pace)**, counted on the state's `tts_sentences[].text_en` — narration length IS the pacing; the JSON `duration` field remains a capture hint only. **>55 words = split flag** (the state carries two ideas — split it). **<~20 words = floor flag** (doesn't earn its own click — merge it or enrich the motion). The state's motion must complete at least one full cycle within a natural dwell, and the key composition must be pointable when paused. **The motion may run longer than the talking, never the reverse** — a genuinely long physics loop (faraday S4 approach→withdraw) is legitimate; long narration is always a split.

Supersessions to record inline: the ~15–25s figure (Rule 31 v1), the ~28–35s figure (Session 79 era), and the bare "~20s/state" phrasing (2026-07-04 directive) — all replaced by the word-budget formulation.

## 4. Rule 31b enforcement — motion-archetype taxonomy

**Seed vocabulary (10 archetypes).** Architect may coin a new one with one-line justification in the skeleton:

| Archetype | Definition | Example |
|---|---|---|
| `translate-through` | An object moves through/past the apparatus | Magnet slides into coil |
| `rotate/flip` | Orientation change of an object | Dipole flip; pole-face reversal |
| `densify/rarefy` | Field lines / particles visibly thicken or thin | Flux densifies as magnet nears |
| `oscillate/track` | Periodic motion with a readout tracking it | Magnet oscillates, needle tracks |
| `align/scatter` | Many elements order or disorder | Domain dipoles align; M grows |
| `flow-along-path` | Particles/beads stream along a path | Induced-current beads in the coil |
| `reveal-build` | Scene constructs piece by piece | Field lines draw in one by one |
| `cycle-compare` | A→B→A′ loop contrasting phases | Approach vs withdraw (Lenz) |
| `null-result-hold` | Deliberate "nothing happens" beat killing a misconception | Static magnet inside coil → needle 0 (faraday S1; the Rule 16a contrast pattern) |
| `drag-sandbox` | Teacher-driven manipulation | Explore state ONLY |

**Control-table extension (architect's required design artifact).** The Rule 31 per-state control table gains two columns → `state × teaches × motion archetype × delta × live controls × duration`:
- **archetype** — exactly one from the vocabulary (or a coined one, justified);
- **delta** — one line: "what changed vs the previous state" — unique per state.

**The no-repeat gate (calibrated against the exemplar).** Two guided states may share an archetype **only as a deliberate contrast/reversal pair whose delta line names the flip** (faraday S2 push-in / S3 pull-out: same `translate-through`, taught delta = *sign of dΦ/dt reverses*). Same archetype without a declared contrast relationship = FAIL. `drag-sandbox` is reserved for the final explore state.

**Staging.** Design artifact + quality_auditor gate only — NOT a Zod schema field. Hardening trigger: taxonomy survives ~5 concepts unchanged → add `motion_archetype` (and `visible_controls`, already noted in Session 80) to the schema.

## 5. New Rule 32 — the legibility doctrine

### 5.1 Index line (append to CLAUDE.md §7)

> 32. **[A]** **Legibility — every state makes its physics and its difference visible.** (32a) the CAUSE moves visibly first, the effect responds after a readable beat — never simultaneous; (32b) in a guided state ONLY the taught variable's motion changes, all else holds pose (explore exempt); (32c) each guided state's caption OPENS with a ≤5-word delta cue naming its one new thing; (32d) the same apparatus persists across states from a recognizable home pose — at every click the only visible change IS the new thing; (32e) exactly ONE glow-focal element at any instant (Rule 29 = how to emphasize; 32e = how many). Gate 3f. (CLAUDE_RULES.md)

### 5.2 Full body (append to CLAUDE_RULES.md)

> **32. Legibility doctrine — every state makes its physics and its difference visible (founder, 2026-07-08).** Rule 31 governs a sim's *shape* (beats, controls, distinctness); Rule 32 governs its *visibility* — what lets a teacher point at the screen and lets a class see exactly what changed. Applies to all NEW concepts; existing fleet untouched until a founder-named retrofit delta.
>
> **(32a) Cause-before-effect.** Within a beat, choreography plays the cause visibly first; the effect responds after a readable gap (~0.5–1s). Never simultaneous soup — the teacher must be able to say "THIS causes THIS" while pointing. Continuous-tracking states (`oscillate/track`) may co-move cause and effect *after* the first explicit cause→effect demonstration.
>
> **(32b) One-variable-moves.** In a guided state, only the taught variable's motion changes; every other apparatus element holds its pose. The sim version of a controlled experiment — if the coil wobbles while the magnet approaches, the class cannot attribute the needle swing. The final explore state is exempt (synthesis).
>
> **(32c) Delta cue.** Each guided state's on-canvas caption (`field_3d_config.states[].caption` — the rendered text source) OPENS with a ≤5-word label naming the state's one new thing (e.g. "NEW: coil turns N", "NOW: magnet reverses"). STATE_1's cue names the setup/hook. Label-style, Rule 24-safe — never prose. The teacher clicking through never has to infer what changed.
>
> **(32d) Scene continuity.** The same apparatus persists across states — same coil, same magnet, same camera neighborhood; each state opens from a recognizable home pose of the SAME scene, never a teleport-rebuild. Camera moves only to frame the new thing. Result: at every click, the only visible change is the new thing, so the delta is legible by contrast.
>
> **(32e) Single focal.** At any instant exactly ONE element carries glow emphasis (`applyGlowEmphasis`). Two simultaneous focals = an overloaded beat = split attention. Rule 29 governs *how* to emphasize (brightness, never size); 32e governs *how many* (one).
>
> **Guidance (non-gated):** a state teaching a *dependence* ("faster → more deflection") should sweep its variable across its range within the loop so the class sees the zero-effect and max-effect brackets, not one arbitrary middle value.
>
> **Deferred-with-triggers (considered 2026-07-08, not yet doctrine):** (i) *progressive formula assembly* — the concept formula builds term-by-term across the arc, current term bright; trigger: voluntary trial on the next 2–3 concepts survives founder + Asmi review. (ii) *money frame* — each state declares its one pause-worthy composition; trigger: pilot pause-analytics show teachers tap-to-pause frequently. (iii) *live readout law* — every changing named quantity has a visible live meter; trigger: next NEW field_3d scenario authoring.

### 5.3 CLAUDE.md §6 self-review checklist addition

Append to the self-review line: `Rule 32 (cause-first, one-variable-moves, delta-cue caption, home-pose continuity, single focal)` and update the Rule 31 fragment to the new pacing phrasing.

## 6. Enforcement — agent-spec changes (canonical `.agents/`, emissions regenerated same session)

| Spec | Edit |
|---|---|
| `architect/CLAUDE.md` | §3 control table → add `motion archetype` + `delta` columns; new pacing text (§3 above); archetype vocabulary table; no-repeat + contrast-pair rule; Rule 32 rows in self-review checklist; faraday reference table annotated with archetypes |
| `physics_author/CLAUDE.md` | Motion timeline must sequence cause→effect with the readable gap; 25–55-word budget per state enforced at authoring time; only-taught-variable-moves in each state's motion spec |
| `json_author/CLAUDE.md` | Caption convention: delta cue first (≤5 words) in every `field_3d_config.states[].caption`; home-pose continuity across state configs; single-focal glow choreography (no overlapping glow windows) |
| `quality_auditor/CLAUDE.md` | **New Gate 3f — Rule 32/31-tight.** Mechanical: per-state `text_en` word count ∈ [~20, 55] (ceiling FAIL→split; floor flag); caption opens with ≤5-word cue (grep); no overlapping glow bindings (count). Structural: archetype table present in skeleton; JSON states match it; no archetype repeat without declared contrast pair. Judgment: cause→effect ordering visible in choreography; home-pose continuity across states. FAIL routes: pacing/caption → json_author or physics_author; archetype design → architect |
| `eye_walker/CLAUDE.md` | Per-state verdict table gains **"delta visible?"** column: does this state's frozen frame visibly differ from the previous state's, and is the delta cue readable in-frame? |

Also touched: `.agents/CLAUDE.md` role table (model column), `docs/AUTHORING_PIPELINE.md` Stage ② (control-table columns), the canonical clone skeleton `faraday_law_induction_skeleton.md` (add archetype/delta columns — locate live), root `CLAUDE.md` §5/§6/§7, `CLAUDE_RULES.md`, `docs/DISCUSSIONS.md` (session entry), `PROGRESS.md`.

Procedure: edit canonicals → regenerate emissions (`npm run sync:agents` — verify script name live) in the SAME session (hard rule 5 + the 2026-06-11 same-session rule).

## 7. Model configuration (emission frontmatter pins)

| Emission (`.claude/agents/`) | Model pin | Change |
|---|---|---|
| `architect.md` | `claude-fable-5` | **NEW** — creative pedagogy/choreography design role |
| `physics-author.md` | `claude-sonnet-5` | verify (pinned 2026-07-04) |
| `json-author.md` | `claude-sonnet-5` | NEW pin |
| `quality-auditor.md` | `claude-sonnet-5` | upgrade (was `claude-sonnet-4-6`, 2026-06-18) |
| `eye-walker.md` | `claude-sonnet-5` | NEW pin |
| `retrofit-surgeon.md` | `claude-sonnet-5` | NEW pin |
| `renderer-primitives.md` | `claude-sonnet-5` | NEW pin |
| `runtime-generation.md` | `claude-sonnet-5` | NEW pin |
| `shipper.md` | haiku | unchanged |
| `feedback-collector.md` | — | unchanged (dormant/nightly) |

Notes: Fable dispatch verified available in this harness (Agent tool model set includes `fable` / `claude-fable-5`). Architect runs once per concept, so even premium pricing is marginal next to json_author/auditor iterations. Watch the first Fable-architect dispatch's token cost in Claude Code usage reporting; fallback = one-line revert of the pin. Model pins live in emission frontmatter (sync preserves frontmatter); `.agents/CLAUDE.md` role table records them.

## 8. Rollout — prove, then harden

1. **Scope: upcoming sims only.** Queue: `magnetic_flux` (Ch.6 §6.3 — missing foundation) → `lenz_law` (§6.5) → `magnetic_materials` (Ch.5 §5.6). No fleet retrofit; that remains a founder-named `retrofit-surgeon` delta later.
2. **Teacher pulse:** add ONE question to Asmi's per-state review template (`reviews/` — locate live): *"Did each state feel clearly different from the previous one — and worth its own click?"*
3. **Hardening triggers:** taxonomy stable across ~5 concepts → Zod `motion_archetype` + `visible_controls` fields; deferred items promote on their recorded triggers (§5.2).
4. **Caveat:** updated agent specs dispatch natively only from the NEXT session — the first Rule-32 authoring run starts in a fresh session after this lands.

## 9. Out of scope

No renderer/engine code changes · no Zod schema changes · no retrofit of the 20 pilot sims · no changes to Rules 24/26/29 themselves (32 sharpens, never contradicts) · no new agents (10-role fleet unchanged) · TTS/audio pipeline untouched.

## 10. Implementation inventory (for the plan)

1. `CLAUDE.md` — §5 pacing line · §6 self-review · §7 index (amend 31 line, append 32 line)
2. `CLAUDE_RULES.md` — amend Rule 31 body pacing/archetype · append Rule 32 full body
3. `.agents/architect/CLAUDE.md` · 4. `.agents/physics_author/CLAUDE.md` · 5. `.agents/json_author/CLAUDE.md` · 6. `.agents/quality_auditor/CLAUDE.md` · 7. `.agents/eye_walker/CLAUDE.md` — per §6 table
8. Emissions ×10 — regenerate + model pins per §7
9. `.agents/CLAUDE.md` — role/model table
10. `docs/AUTHORING_PIPELINE.md` — Stage ② control-table columns
11. Clone skeleton `faraday_law_induction_skeleton.md` — archetype/delta columns (locate live)
12. Asmi review template — one pulse question (locate live)
13. `docs/DISCUSSIONS.md` + `PROGRESS.md` — session records
14. Vault outbound sync (founder-confirmed diff before writing)

Verification: `npx tsc --noEmit` 0 · `npm run validate:concepts` PASS (no schema change → must stay green) · sync-guard clean (emissions match canonicals) · grep: no surviving `~15–25s` / `~28–35s` pacing strings.
