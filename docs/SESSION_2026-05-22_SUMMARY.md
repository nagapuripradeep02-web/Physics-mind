# Session Summary — 2026-05-22

> Single-doc digest of a long working session that mixed execution work (torque concept fixes, STATE_11 sandbox, agent spec audits) with strategic discussion (Pass-1/2 framework, India-first vs West-first, generative AI threat, founding playbook). Designed to be readable cold in a future session without needing to scroll back through transcripts.

---

## 1. Executive summary

**Three threads ran in parallel through this session:**

1. **Execution work on Diamond #3 (`torque_on_current_loop_in_field`)** — split STATE_6+7 into 5 new states (now 11 total), built a working interactive slider sandbox in STATE_11, fixed two latent renderer bugs along the way (cross-scenario theta_deg contamination from Lorentz handler, missing replay-on-TTS-click in admin harness), stripped STATE_5's slider violation. All shipped, type-checked, validator-passing.

2. **Pass-1 / Pass-2 framework formalization** — derived two-pass cognitive lens for concept authoring (Pass-1 = physics/exam-readiness strategy; Pass-2 = per-state student-experience execution). Pass-1 + PRIMARY-aha designation landed into `.agents/architect/CLAUDE.md` §"Two-pass cognitive lens" v2.3 and `.agents/quality_auditor/CLAUDE.md` §"Gate 14". Pass-2 four-question lens captured in `docs/PASS_2_PROPOSAL.md` for dogfood on Diamond #4 before formalizing.

3. **Strategic / philosophical discussions** — India-first vs West-first market positioning, Karpathy's Eureka Labs as direct/indirect competitor, 30-year forecast for simulation-based learning, generative AI's threat to pre-authored content catalogs, comprehension metric as the missing North Star, solo-founder playbook for team/investors/YC.

---

## 2. Execution work that shipped this session

### 2.1 Torque concept arc expansion (7 → 11 states)

**File:** `physics-mind/src/data/concepts/torque_on_current_loop_in_field.json`

Diagnosed STATE_6 and STATE_7 as fused multi-beat states using the one-sentence-claim test. Split into:

| New state | Claim | advance_mode | rotation_mode |
|---|---|---|---|
| 6 | θ sweeps 0→180°, τ traces a sine | `auto_after_tts` | `theta_sweep` |
| 7 | Predict where τ is max — reveal at 90° | `wait_for_answer` | `static` θ=90° |
| 8 | θ=0° stable, nudge returns | `auto_after_tts` | `oscillation` ±20° |
| 9 | θ=180° unstable, the flip | `auto_after_tts` | `slow_rotation` 170°→360° |
| 10 | Loop IS a bar magnet | `auto_after_tts` | `static` θ=60°, `bar_magnet_swap` |
| 11 | Sandbox — drag N, I, B, θ | `interaction_complete` | `static`, 4 sliders |

Cross-references updated: `entry_state_map.oscillation` → STATE_8, EPIC-C `magnetic_force_does_work` → STATE_8, EPIC-C `torque_max_when_mu_parallel` → STATE_6+7.

### 2.2 Interactive sandbox (STATE_11) — full slider panel

**File:** `physics-mind/src/lib/renderers/field_3d_renderer.ts`

The renderer previously had only `#sliders` (wire scenario) and `#lorentz_sliders` panels — **no torque-scenario slider panel existed.** Built `#torque_sliders` with 4 range inputs (N, I, B, θ) + live τ readout. Wiring:

- CSS panel mirroring Lorentz styling
- HTML inserted after `#lorentz_sliders`
- `applyState` scenario branch (show torque panel when `scenario_type === "torque_on_loop_uniform_field"` AND `show_sliders` truthy)
- `setupSliders` extended with `refreshTorqueLabels` — applies `slider_controls` defaults, wires input listeners, computes τ = N·I·A·B·|sin θ| in μN·m
- Per-frame slider-driven μ/τ arrow scaling in `updateTorqueLoopFrame` (sub-linear ^0.4 power, capped at 2.5–3.0× to stay on-canvas)
- State-entry sync (sets slider thumb to `stateDef.theta_deg` + seeds `lg.userData.slider_*` + dispatches input event so τ readout matches visible thumb)

### 2.3 Bug fixes that came out of this work

- **Lorentz handler was scribbling torque-scenario `theta_deg`**: `refreshLorentzLabels` mutated `config.states[PM_currentState].theta_deg = parseFloat(thetaSliderL.value)` unconditionally. Fixed with `if (config.scenario_type !== "lorentz_force_uniform_field") return;` early-out. This was a latent silent bug affecting any state with `show_sliders` truthy in non-Lorentz scenarios.
- **Admin test harness fired bar-magnet swap and slow-rotation flip on page load** (timer started at iframe mount), so by the time founder scrolled to STATE_9/10 and clicked Play TTS, the animations had already played and the loop sat in its post-animation pose. Fixed with new `REPLAY_ANIMATIONS` postMessage handler in the renderer + `sendReplay()` helper in `_TtsPlayButton.tsx` that fires before TTS narration begins. Resets `rotation_init_theta_deg`, `rotation_start_time`, `barSwapStartTime` so one-shot animations replay in sync with narration. Production `TeacherPlayer` unaffected (doesn't post this message).
- **STATE_5 slider violation cleanup**: `show_sliders: ["N", "I", "L_side"]` removed from STATE_5's renderer config; label/caption updated to "observe-only — interactivity is reserved for STATE_11."

### 2.4 Admin test page expansion

**File:** `physics-mind/src/app/admin/test-torque-on-current-loop-in-field/page.tsx`

The hardcoded `STATES_TO_VERIFY` array updated from 7 to 11 entries, descriptions rewritten for the new arc. Header "Renders all 7 EPIC-L states" → "Renders all 11 EPIC-L states". All four `Edit` calls + cache-busting `?v=N` navigations needed to surface changes through Next.js dev cache.

### 2.5 Verification results

- `npx tsc --noEmit` → 0 errors across all changes
- `npm run validate:concepts` → `torque_on_current_loop_in_field.json` PASS
- Programmatic browser probes confirmed: panel displays in STATE_11 only (block); STATE_5 shows no sliders; STATE_9 long-way rotation math correct (renderer `slow_rotation` uses straight subtraction, goes 170→360 through 180°); STATE_8 τ-arrow flips direction at swing zero-crossings (renderer uses `sign(sin θ)`); REPLAY_ANIMATIONS message arrives at iframe within 12-27ms of Play click; τ math verified at four test points (defaults / N=2 / θ=0 / θ=90).

---

## 3. Pass-1 / Pass-2 cognitive framework — the core strategic output

### 3.1 The framework in one diagram

```
Authoring a concept JSON requires TWO independent perspective passes:

Pass 1 — Physics-author lens (top-down, strategic)
  ├─ Arc structure                              [already in architect spec]
  ├─ Prerequisite-cliff check per state         [NEW in v2.3]
  ├─ JEE-backwards trace                        [NEW in v2.3]
  ├─ Misconception entry mapping                [NEW in v2.3]
  ├─ PRIMARY aha + 0–2 SUPPORTING ahas          [NEW in v2.3]
  ├─ Aha cohesion check                         [NEW in v2.3]
  ├─ Wrong-belief setup states                  [NEW in v2.3]
  └─ Foundational-coverage rule                 [NEW in v2.3]

Pass 2 — Student-experience lens (bottom-up, per-state)
  Four questions, answered concretely for every state:
  ├─ Q1: What does the student NOT know yet?
  ├─ Q2: What would make them FEEL the confusion?
  ├─ Q3: What needs to MOVE to make physics visible?
  └─ Q4: Where does the student's hand or eye go?
  Plus: re-entry orientation rule (first 5s re-establish context)

Sweet-spot ahas: 1 PRIMARY + 1 SUPPORTING = 2 total.
Three total is rare; only if every supporting clearly serves the primary.
```

### 3.2 What shipped to specs vs what's deferred

| Pass | Status | File |
|---|---|---|
| Pass-1 strategic checklist + aha designation | **Shipped to spec** | `.agents/architect/CLAUDE.md` §"Two-pass cognitive lens (v2.3)" |
| Quality-auditor Gate 14 (Pass-1 audit, 14a–14e) | **Shipped to spec** | `.agents/quality_auditor/CLAUDE.md` §"Gate 14" |
| Reason-tag routing + dual-failure rule + scene_designer advisory mode | **Shipped to spec** | `.agents/quality_auditor/CLAUDE.md` §"Return-to-author feedback" |
| Pass-2 four-question lens (json-author) | **Proposal — dogfood on Diamond #4 first** | `docs/PASS_2_PROPOSAL.md` |
| Quality-auditor Gate 15 (Pass-2 audit) | **Proposal — promoted to spec after Diamond #4** | `docs/PASS_2_PROPOSAL.md` |

### 3.3 Conflict resolutions baked into the v2.3 edits

The audit surfaced eight potential conflicts; the high/medium-severity ones now have explicit resolutions in the shipped spec text:

1. **Patterns library is Pass-2-blind before M4** → resolved by `scene_designer advisory mode` carve-out: Gates 14/15 are advisory (PASS-WITH-NOTES) for scene_designer-generated content until the patterns library is retrofitted with Pass-2 annotations. Hard FAIL stays for hand-authored Diamonds.
2. **Foundational-aspect-vs-PRIMARY-aha coverage gap** → resolved by Gate 14e: PRIMARY aha state must be inside `entry_state_map.foundational` range OR a mandatory exit-pill must route there.
3. **Socratic-reveal vs Pass-2 four-question overlap** → resolved by explicit layering note: Socratic reveal is *tactical execution*, Pass-2 four-question lens is *strategic presence check*. Both required.
4. **Single-agent FAIL routing on dual Pass-1/Pass-2 failure** → resolved by `upstream wins` rule: route to `alex:architect` first with `[reason: pass-1]`; Pass-2 re-audit only after Pass-1 PASSes.
5. **M1–M6 magnetism exception breaks JEE-backwards trace** → resolved by 14b carve-out: trace against conceptual EPIC-L arc only; board/competitive coverage deferred to M7/M8.
6. **`has_prebuilt_deep_dive` picking vs Pass-1 cliff-state identification** → clarified as complementary (they should usually be the same states; document divergence).
7. **Rule 16 vs misconception-entry mapping** → clarified as complementary (mapping is upstream of Rule 16's visualization requirement).
8. **Gate 3b persona-lens vs Gate 15 four-question** → clarified as coexisting at different abstractions (3b is author persona; 15 is per-state cognitive presence).

### 3.4 Backfill carve-out (important for catalog migration)

Gate 14 applies to concepts authored or retrofitted **2026-05-22 or later**. The 60+ shipped concepts pre-dating Gate 14 are exempt until they're next touched. Without this carve-out, the next audit run would fail every existing concept on missing PRIMARY-aha designation. Backfill happens incrementally as concepts come back into rotation.

---

## 4. The refined aha-moment model (founder push-back on "one thing in 10 years")

Original framing was *"What is the one thing this student will remember in 10 years?"* — single governing question per concept.

Founder pushed back: in practice, atomic concepts often have 2–3 aha moments because they synthesize multiple ideas, and different students are hit harder by different aha types depending on prior background.

**Refined framing baked into v2.3 spec:**

| Type | What it reveals | Cognitive job |
|---|---|---|
| **Structural** | How the mechanism actually works | The mental model itself |
| **Counter-intuitive** | A wrong belief most students hold | Corrects a misconception |
| **Unifying** | Two things you thought were separate are the same | Compresses storage cost |

**Designation rule:** exactly 1 PRIMARY aha + 0–2 SUPPORTING ahas. Sweet spot = 2 total. Three only if every supporting clearly serves the primary; if a candidate aha stands alone, it belongs in a sibling atomic JSON.

**Applied to torque (Diamond #3):**
- **PRIMARY (Structural):** STATE_4 — "ΣF=0 but Στ≠0 — forces cancel, torque doesn't"
- **SUPPORTING (Counter-intuitive):** STATE_7 — "τ_max at θ=90°, NOT at θ=0° — alignment ≠ max"
- STATE_10 (loop = bar magnet) is a *closing synthesis beat*, not a third aha — elegant but not surprising

---

## 5. Strategic discussion — durable conclusions

### 5.1 India-first vs West-first (the most consequential strategic decision)

**Conclusion: India-first for the next 12-18 months. Build the engine West-compatible from day 1, but ship to India first.**

Reasoning:
- **Founder-market fit** is the single strongest investor signal; you're Indian, building for Indian students.
- **Validation cost**: 1000 users in India via WhatsApp/Instagram/Reddit costs ₹0–50 CAC. US equivalent costs $30–100 CAC. India is the cheaper lab.
- **Competitive landscape**: West has Khanmigo (free, Bezos/Schmidt backed), Brilliant ($25–50M ARR), MathAcademy, Eureka Labs (Karpathy, $1B+ implied resources), Synthesis, Duolingo Math. India has Physics Wallah ($1.1B valuation, **video-based — different product**), imploded Byju's, downsized Vedantu. **India window is genuinely open; West is brutal.**
- **Curriculum surface area**: NCERT Class 10-12 has ~300 atomic physics concepts (bounded). US AP/IB/A-level/Common Core is fragmented across 50 states (unbounded). Bounded surface = faster catalog completion = bigger moat.
- **Investor pitch**: "We have 5,000 paying Indian students at 85% comprehension. Now entering West with same engine + voice agent at $40/month." This pitch raises both Indian and US capital. **West-first → solo Indian founder with no traction → investors say no.**

**Voice agent is the West/EU strategy. Authored simulations + free TTS is the India strategy.** Same engine, two SKUs eventually.

### 5.2 Eureka Labs (Karpathy) — what it actually is

- Adult / college / technical learners
- AI / CS / ML content (LLM101n is the flagship)
- Text curriculum + chat tutor format
- NOT building K-12 physics, NOT building 3D simulations, NOT competing for Indian JEE student

**Not a direct competitor.** His success VALIDATES the AI-tutor thesis, helping PhysicsMind fundraise. Closer threats are Khanmigo (K-12 + AI tutor, but video+chat not simulations) and Brilliant (paid STEM, but no Indian curriculum focus).

### 5.3 The 30-year forecast

| Era | Dominant mode | Key shift |
|---|---|---|
| Pre-1800s | 1-on-1 tutor / apprenticeship | Personal, expensive, elite |
| 1800s–1900s | Classroom (1:30) | Industrial scale, cheap |
| 1990s–2000s | Textbooks + classroom + video | Content commodification |
| 2010s | Online interactive | Practice + feedback loops |
| **2020s (now)** | **AI tutor + simulation prototypes** | **1-on-1 returns via AI scale** |
| 2030s–2040s | Voice agent + AR/VR + generative content | Immersive personalized learning |
| 2050s+ | Brain-computer? Speculation. | Unknown |

**The simulation IS the prototype of the permanent next-30-year delivery mode.** Form factor evolves (browser → voice → AR → BCI); content discipline persists. PhysicsMind's Pass-1/2 framework is the foundation that survives every form-factor change.

**Three-layer destination:**
1. Content layer — disciplined pedagogy (Pass-1/2)
2. Delivery layer — browser/voice/AR/holographic (commoditizes)
3. Mentor layer — human-irreplaceable (motivation, assessment, inspiration)

**Teachers don't disappear; their role purifies** — strip routine content delivery, leave mentorship + community + deep assessment + inspiration.

### 5.4 Generative AI threat to pre-authored catalogs

**Honest forecast on when one-prompt 85-95% comprehension simulations become real:**

| Year | Capability |
|---|---|
| 2026 (now) | One-prompt sim that compiles, ~40-50% comprehension |
| 2028 | One-prompt with decent pedagogy, 60-70% |
| 2030 | One-prompt Pass-1 disciplined, 75-80% — matches PhysicsMind average |
| 2033 | One-prompt Pass-2 + adaptive, 85-90% — matches PhysicsMind best |
| 2035 | Real-time adaptive per student question, 90-95% |

**Implication: the value of the pre-authored catalog drops near zero by ~2033.** This is the existential risk to any content-authoring company.

**Five durable moats that survive generative AI:**
1. Evaluation data (comprehension scores, confusion logs, retention curves)
2. Brand + trust ("PhysicsMind = passing JEE")
3. Community + network effects
4. Distribution (owning million-student WhatsApp community in 2030 is permanent advantage)
5. Mentorship + assessment layer

**PhysicsMind's 10-year destination: be the Spotify of Indian secondary STEM.** Spotify makes zero music yet owns music distribution. Same arc: PhysicsMind transitions over 5-7 years from "we author content" to "trusted platform for AI-generated + certified content + community + mentorship."

**Survival depends on transitioning before AI catches up.** Window: 2025-2030 to make the pivot.

### 5.5 The comprehension metric — the missing North Star

**The single highest-priority infrastructure decision.** Without it, every authoring iteration is guesswork.

Three levels, cheapest to most rigorous:
1. Self-rating star (free, unreliable)
2. 5-question post-quiz (2 min student time, high reliability) — **start here**
3. Delayed retention test (1 week later, gold standard, expensive)

**Concrete first version**: 5 multiple-choice questions after STATE_11. Score 0-100. Log to Supabase `comprehension_scores` table. Dashboard per-concept averages. Per-question miss rates surface which states aren't landing. ~200 lines of code, one Supabase table, ~2 days work.

**Without metric**: PhysicsMind is a doctor without a thermometer. With it: every Pass-1/2 framework decision becomes testable instead of debatable.

### 5.6 Solo-founder playbook (honest numbers)

**Brutal odds:**
- YC overall acceptance: ~1.5%
- Solo founder + idea stage + no traction at YC: <0.5%
- Solo + 1000 users + $5K MRR: ~3-5%
- Co-founder + 1000 users + $5K MRR + India context: ~8-15%

**EXIST grant is the highest-ROI item this month.** Solo founder in Germany, university graduate June 2026 — apply NOW. Hit rate ~30-50% for prepared applicants. €40-50K equivalent, 12 months runway.

**Sequenced fundraising:**
1. EXIST grant (now-month 3): €40-50K
2. Friends & family (months 3-6, if needed): $10-25K
3. Indian angel (months 9-12): $50-150K
4. Pre-seed / Antler India / YC (months 12-15): $200-500K
5. Seed (months 18-24): $1-3M

**Team-building reality:**
- Real co-founder search: 6-12 months. Start NOW.
- Best paths: YC Co-Founder Matching, university network (TU/RWTH), ex-coworkers, hackathons.
- Indian physics teacher (₹15-30K/month, part-time): can hire in 2-4 weeks. **First hire, not an engineer.**
- IIT undergrad content authors (₹20-40K/month): hire after concept #5 ships.
- Full-time engineers: only after seed funding.

**Critical:** *don't grab the first willing co-founder.* 70% of startup failures with co-founders are co-founder conflicts. Trial via 4-6 week project before locking equity.

---

## 6. The fresh-start playbook (if rebuilding from line 1 of code today)

10 things to do differently — extracted as a forward-looking checklist:

1. **Build the comprehension metric BEFORE any content.** Day 1. No exceptions.
2. **Author ONE concept end-to-end to 95% comprehension before authoring concept #2.** Use as gold-standard template.
3. **Build scene_designer (M4) FIRST, not last.** Author concepts via templates from day 1.
4. **Single renderer, not multiple.** Commit to one (parametric_renderer or field_3d_renderer).
5. **Schema-first, code-second.** Lock Zod schema v1 in week 1.
6. **Use Web Speech API + local Whisper from day 1.** Keep per-view cost near zero.
7. **Public progress in week 1.** Find 20 Indian students, ship, iterate weekly.
8. **Skip board/competitive modes in V1.** Conceptual only until conceptual hits 85%.
9. **Build confusion-mining system from day 1.** Tier 8 nightly agents are foundational, not Phase 9.
10. **Don't build for JEE — build for Class 10 first.** Lower stakes, more forgiving students, gateway to Class 11-12 + JEE later.

**Two things current PhysicsMind is doing better than fresh-start me would have:**
- Pass-1/2 framework (you wouldn't have invented this in week 1 either, but it's genuinely excellent)
- Indian-context discipline (structural advantage, got it right from day 1)

---

## 7. Open questions / decisions deferred

| Question | Status | Trigger to revisit |
|---|---|---|
| Apply EXIST grant? | Founder action item | This week |
| Start co-founder search? | Founder action item | This week |
| Build comprehension metric (5-question quiz + Supabase table) | Top engineering priority | Before authoring concept #65 |
| Pass-2 four-question lens — promote to spec? | Dogfooded on Diamond #4 first | After Diamond #4 ships and lens is validated |
| Patterns library Pass-2 annotation retrofit | Required before M4 scene_designer hard FAIL | Before scene_designer enters production |
| Plugin packaging build | Skeleton committed, build deferred | First engineer hire 2 weeks out OR open-source decision |
| NCERT structured-search MCP | In backlog | After Diamond #4 ships |
| LSP-as-tool verification | In backlog | After 3+ grep-thrash signal |
| Voice agent (premium tier) | Deferred 12+ months | When India catalog hits 100 concepts at 85%+ comprehension |
| West-market entry | Deferred 18-24 months | When India MRR > $10K + 20K users |
| Hand-tracking (camera → on-screen hand sync) | Deferred 3-5 years | When phone cameras + on-device ML mature OR AR glasses descend to ~$500 |

---

## 8. Recommended next actions, ranked by leverage

**This week:**
1. EXIST grant application — start with university startup office. Single highest-ROI hour you can spend.
2. Co-founder search — YC Co-Founder Matching profile + LinkedIn posting.
3. Hire one Indian physics teacher (₹15-30K/month, 10-15 hrs/week) for content review + quiz authoring.
4. Get the just-fixed torque sim in front of 20 real Class 11 students via WhatsApp/Instagram. Observe.

**This month:**
5. Build comprehension metric v1 (5-question Google Form linked from sims; later upgrade to in-app quiz with Supabase logging).
6. Author Diamond #4 with the new Pass-1/2 framework live. Dogfood the four-question lens. Decide whether to promote to spec.
7. Apply to Antler India (admissions open year-round).

**Next 90 days:**
8. Author concepts 4-10 with Pass-1/2 discipline + comprehension metric measurement on each.
9. Build community-feature MVP (student streak counter, leaderboard per concept).
10. Get to 100 active Indian students with measured comprehension scores per concept.

---

## 9. File references (where this session's work lives)

| File | What changed |
|---|---|
| `src/data/concepts/torque_on_current_loop_in_field.json` | 7 → 11 EPIC-L states, 4 cross-refs updated, STATE_5 sliders stripped |
| `src/lib/renderers/field_3d_renderer.ts` | `#torque_sliders` panel + wiring + per-frame slider scaling + `REPLAY_ANIMATIONS` postMessage + Lorentz-mutation guard + `rotation_init_theta_deg` userData |
| `src/app/admin/test-torque-on-current-loop-in-field/page.tsx` | `STATES_TO_VERIFY` array 7 → 11 entries, descriptions rewritten |
| `src/app/admin/test-torque-on-current-loop-in-field/_TtsPlayButton.tsx` | `sendReplay()` helper + `play()` calls it before TTS narration |
| `.agents/architect/CLAUDE.md` | §"Two-pass cognitive lens (v2.3)" + 4 new self-review checklist items |
| `.agents/quality_auditor/CLAUDE.md` | §"Gate 14" + reason-tag routing + dual-failure rule + scene_designer advisory mode |
| `docs/PASS_2_PROPOSAL.md` | Pass-2 four-question lens + Gate 15 proposed text + dogfood instructions for Diamond #4 |
| `docs/HARNESS_REVIEW.md` | Quarterly review cadence + 10-item checklist + ad-hoc triggers |
| `docs/PLUGIN_PACKAGING_PLAN.md` | Plugin layout skeleton, build deferred |
| `docs/MCP_BACKLOG.md` | Deferred-with-trigger harness items |
| `MEMORY.md` (auto-memory) | Added: feedback_two_pass_lens, feedback_primary_aha_designation |
| `~/.claude/settings.json` | `continuous-learning` Stop hook wired |

---

## 10. The one-sentence takeaways

- **The simulation IS the moat. Voice and gesture are the delivery layer that rents the moat.**
- **PhysicsMind's 10-year destination is the Spotify of Indian K-12 STEM** — transitioning from content authoring to platform/community/distribution over 5-7 years.
- **Build the comprehension metric before authoring concept #65** — without measurement, every Pass-1/2 decision is guesswork.
- **India-first for 12-18 months, West with voice agent + premium tier afterward.** Same engine, two SKUs.
- **Pass-1 is strategic (architect-owned); Pass-2 is per-state experiential (json-author owned); both enforced at quality-auditor gates 14 and 15.**
- **PRIMARY + 0–2 SUPPORTING aha moments, sweet spot is 2 total. Cohesion check stops aha bloat.**
- **EXIST grant application this week is the highest-ROI hour available.**

---

*Session worked through: Diamond #3 split + sandbox + harness fix + STATE_5 cleanup → Pass-1/2 framework derivation → agent spec audit + edit proposal → conflict resolution → strategic discussion (market positioning, competitor analysis, generative AI threat, comprehension metric, founder playbook) → this summary doc.*

*Next session can open this file cold and continue without re-deriving any of the framework or strategic conclusions.*
