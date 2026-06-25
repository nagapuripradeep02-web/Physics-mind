# Voice Professor — Physics-Space Command Grammar

**v1.1 DRAFT — 2026-06-20**
**Status:** the **stricter, student-facing TARGET**. A *generative* variant of this idea has already SHIPPED in the worktree (Option B — see §0); that variant is teacher-facing and is the looser sibling of this doc. This doc describes where the grammar should land **before students** (no teacher watching).
**Owner gate:** Pradeep (Rule 17 — the answer/assertion physics content must be founder-reviewed before any student).

This is the **operation-vocabulary layer that sits above `PARAM_UPDATE`/`SET_STATE`**. It lets an AI professor *teach with* a simulation — drive parameters, direct attention, navigate states, answer questions — through a bounded, physics-space grammar that **cannot make the sim show wrong physics**.

It answers the 2D-vs-3D question directly: the grammar never mentions pixels, canvas, or camera coordinates. The professor reasons in **physics space** (θ, B, v, named objects, named viewpoints); the renderer owns all geometry. The same grammar drives a 2D PCPL sim and a 3D `field_3d` sim unchanged.

---

## 0. Reconciliation with the shipped demo (2026-06-20)

A working voice professor already runs in the `feat/voice-professor` worktree, and it took a **different branch of this idea** than the rest of this doc proposes. Both are valid; they sit at different points on the safety dial. Read this before assuming the doc == the code.

| Dimension | **Shipped demo (Option B — `professorBrain.ts`)** | **This doc (the student-facing target)** |
|---|---|---|
| Who writes the spoken words | **Sonnet 4.6 generates them live**, grounded in `physics_engine_config` | Words are **reviewed `answer_clusters`** (assertions route to pre-approved content) |
| Safety on the *words* | The **human teacher** is the check ("Generative · teacher-verified") | The **review gate** is the check (Rule 17) — works with no human watching |
| Safety on the *operations* | **Op whitelist** (`operations.ts` `validateBeats`) — bad state dropped, knob clamped | **Same** — this is the part both agree on |
| Output shape | **"beats"** = `{say, ops[]}` interleaved, streamed NDJSON/SSE | "command envelopes" + `MOVE`/`ANSWER` — a more declarative framing of the same ops |
| Model for routing | Stage-1 **regex + Haiku** cluster-match, then Sonnet | Classifier → one envelope; `ANSWER` resolves a reviewed cluster |

**What's already settled (don't re-litigate):** the operation layer. The shipped `operations.ts` whitelist *is* this doc's thesis made real — the AI emits only bounded ops, `set_state` drops on a bad target, `set_param` clamps to range, and the verified `field_3d` engine computes every physics output. That part meets the student-facing bar today. The shipped verbs map cleanly onto §5: `set_param`↔`SET_PARAM`, `set_camera`↔`ORIENT_TO` (named views), `set_glow`↔`FOCUS`, `set_state`↔`GOTO_STATE`, `pause/resume/set_speed`↔playback.

**The one real gap to close before students:** the **free narration**. With no teacher watching, Sonnet generating physics *claims* live is the part that crosses Rule 18's spirit. Two ways to close it, pick one when the time comes:
1. **Route assertions** (this doc's §1 model) — questions resolve to reviewed `answer_clusters`; Sonnet may still drive operations freely but speaks reviewed words.
2. **Auto-verify the words** — keep generative narration but add an automated physics-checker (a Tier-9-style gate) on each `say` before it's spoken, so the words earn the same "reviewed artifact" status the ops already have.

Until then: the demo is correctly scoped as **teacher-facing**. This doc stays the blueprint for the student-facing tightening, and the manifest in §10 remains the concept-bounding contract both share.

**Build status (2026-06-20).** The five "on-paper" capabilities below are now **BUILT in the worktree** (uncommitted; visual THE-EYE confirm pending):
- **sweep_param** ✅ — renderer-side smooth knob tween (`SWEEP_PARAM`), Sonnet emits it generatively.
- **announce** ✅ — *both* show + speak: renderer `#vp_readout` chip + server computes the value from the concept's `computed_outputs` formula (mathjs) so the spoken number can't drift.
- **dim_except / point_at** ✅ — renderer `SET_EMPHASIS` + `setObjDim` (opacity), reviewed `force_focus` move.
- **MOVE** ✅ — data-driven reviewed `moves[]` in the bundle JSON, matched in `resolveTurn`, served verbatim ($0). The doc's `ANSWER`-routing of *assertions* is still the deferred student-facing step (§0 above).
- **auto-manifest** ✅ — server-side derivation (`deriveStateElements` + variables + computed_outputs); the *renderer-emitted* `SIM_READY` manifest (§3's stronger form) stays deferred.

Naming note: shipped verbs use the renderer's snake_case (`sweep_param`, `dim_except`, `set_camera`); this doc's UPPER_CASE (`SWEEP_PARAM`, `ORIENT_TO`) is the same vocabulary in spec form.

---

## 1. The safety model — why this is Rule-18-safe by construction

Every professor action is exactly one of three kinds:

| Kind | Example | Reviewed? | Why safe |
|---|---|---|---|
| **OPERATION** | "set θ to 45", "go to state 3", "point at the force" | **No review needed** | An operation is an **input** to the renderer's reviewed physics engine. When the professor says `SET_PARAM(theta, 45)`, the renderer computes `F = qvB·sinθ` from the **validated formula** in `physics_engine_config`. The AI chose an input; the reviewed engine produced every pixel. It is physically impossible to display wrong physics by manipulating. |
| **READOUT** | "the force is now 7.2 × 10⁻²² N", "the period is 6.6 µs" | **No review needed** | A readout is the professor *speaking aloud an engine-computed output* (`computed_outputs`). It is the reviewed engine's number, read verbatim — not an un-reviewed claim. |
| **ASSERTION** | "the force is zero **because** v is parallel to B", "magnetic force never does work" | **MUST resolve to a reviewed artifact** | An assertion is a physics *claim/explanation*. It must map to a pre-authored, founder-reviewed `answer_cluster`. No cluster match → **fallback**, never improvise (Rule 18). |

**The leash is on assertions only.** The professor routes operations and readouts freely; it can only *explain* using reviewed content. This is what lets the voice layer feel fluid while staying inside the Rule-18 hard floor (no un-reviewed generative process decides physics a student sees).

---

## 2. Architecture — three layers

```
 voice utterance ──STT──▶  CLASSIFY  (Haiku, Rule-18: classify only — never generates physics)
                               │   maps NL → one COMMAND ENVELOPE, bounded by the sim MANIFEST
                               ▼
                    PHYSICS-SPACE COMMAND          ← this grammar (renderer-agnostic, physics units, stable IDs)
                               │   compiles down
                               ▼
                    postMessage  (SET_STATE / PARAM_UPDATE / FOCUS / SET_VIEW / PAUSE …)  ← renderer owns geometry
```

The classifier's entire job: **utterance → one envelope drawn from *this sim's* manifest**, or `FALLBACK` if no confident match. It cannot reference a state, object, param, value, view, or cluster that the manifest does not declare.

---

## 3. The sim manifest

On `SIM_READY`, the renderer emits a **manifest** that bounds the grammar for that sim. The manifest is **derived from the concept JSON** — it is a projection, not new authoring:

| Manifest field | Derived from |
|---|---|
| `states[]` | `epic_l_path.states` keys + titles |
| `objects[].params[]` | `physics_engine_config.variables` (units/min/max/default/step) — equivalently `field_3d_config.slider_controls` |
| `readouts[]` | `physics_engine_config.computed_outputs` (formula-computed, read-only) |
| `focusable[]` | the `glow` token vocabulary used across `teacher_script` |
| `views[]` | **authoring layer** — named viewpoints that compile to `camera_position` (§7) |
| `answer_clusters[]` | `epic_c_branches[]` — `branch_id` → cluster, `trigger_phrases` → classifier vocab, `state_sequence` → move seed |
| `moves[]` | reviewed op-sequences (the `epic_c_branches.state_sequence` are the seeds) |

**Manifest schema:**

```jsonc
{
  "concept_id": "string",
  "renderer": "field_3d | pcpl_2d",
  "states": [{ "id": "STATE_N", "title": "string" }],
  "objects": [{
    "id": "string",                       // stable, Rule-27 addressable
    "params": [{ "name", "unit", "min", "max", "default", "step", "enum?" }]
  }],
  "readouts": [{ "name", "unit", "formula" }],   // engine-computed, speakable, not settable
  "focusable": [{ "id", "label" }],              // FOCUS / POINT_AT targets
  "views": [{ "id", "label" }],                  // ORIENT_TO targets (named, closed set)
  "answer_clusters": [{
    "id", "question_gist", "trigger_phrases": ["..."],
    "answer_ref": "reviewed text/audio id",      // founder-reviewed (Rule 17)
    "move": "move_id | null"
  }],
  "moves": [{ "id", "label", "ops": [ <envelope>, ... ] }]   // reviewed op-sequences
}
```

---

## 4. The command envelope

Every command the classifier emits is exactly one envelope:

```jsonc
{
  "op": "<VERB>",          // closed enum, §5
  ...typed slots...,       // validated against the manifest
  "confidence": 0.0-1.0    // classifier self-report; below threshold → FALLBACK
}
```

Validation rules (enforced before dispatch, not by the model):
- `target`/`param`/`primitive_id`/`view`/`state`/`cluster` MUST exist in the manifest.
- numeric `value`/`from`/`to` MUST be within the param's `[min,max]`; out-of-range → **clamp** (don't reject silently — clamp + announce the limit).
- unknown slot or unmatched op → drop to `FALLBACK`.

---

## 5. Verb vocabulary

Closed enum. Each verb compiles to a postMessage in the §5 PostMessage contract (or a small, named extension of it).

| Group | Verb | Slots | Compiles to | New? |
|---|---|---|---|---|
| **Navigate** | `GOTO_STATE` | `state` | `SET_STATE` | — |
| | `REPLAY` | — | `SET_STATE` (re-apply) | — |
| **Manipulate** | `SET_PARAM` | `target, param, value, unit` | `PARAM_UPDATE` | — |
| | `SWEEP_PARAM` | `target, param, from, to, unit, duration_ms` | tweened `PARAM_UPDATE` stream | — |
| | `RESET` | `target` | `PARAM_UPDATE` (defaults) | — |
| **Attention** | `FOCUS` | `primitive_id` | `FOCUS` | **new** |
| | `POINT_AT` | `primitive_id` | `ANNOTATE` | **new** |
| | `DIM_EXCEPT` | `primitive_id[]` | `FOCUS` (inverse) | **new** |
| **View** | `ORIENT_TO` | `view` (named) | `SET_VIEW` | **new** |
| **Playback** | `PAUSE` / `RESUME` | — | `PAUSE` / `RESUME` (Rule 26) | — |
| | `SEEK` | `time_ms` | `SEEK` | **new** |
| | `SET_SPEED` | `factor` | `SET_SPEED` | **new** |
| | `MUTE` | `muted` | `MUTE` (Rule 26a) | — |
| **Readout** | `ANNOUNCE` | `readout` | (TTS reads engine output) | — |
| **Content** | `ANSWER` | `cluster` | resolve reviewed `answer_ref` (+ optional `move`) | **new** |
| **Macro** | `MOVE` | `move` | expand to reviewed op-sequence | **new** |
| **Fallback** | `FALLBACK` | `heard_text` | default behavior + log to `feedback_unified` | **new** |

Net-new postMessage verbs to add to the §5 contract: `FOCUS`, `ANNOTATE`, `SET_VIEW`, `SEEK`, `SET_SPEED`. Everything else already exists.

---

## 6. The classifier contract

The classifier (Haiku — **classify only**, Rule-18-safe) receives the manifest + the utterance and returns one envelope:

- **Question** ("why…", "what happens if…", "how come…") → try to match an `answer_cluster` by `trigger_phrases`. Match → `ANSWER{cluster}`. No confident match → `FALLBACK`.
- **Imperative on a param** ("make θ ninety", "crank the field up", "flip the charge") → `SET_PARAM` / `SWEEP_PARAM` / `RESET`.
- **Imperative on attention/view/playback** ("look at the force", "spin it so I see the circle", "pause", "slower") → `FOCUS` / `ORIENT_TO` / `PAUSE` / `SET_SPEED`.
- **Navigation** ("go back to the circle", "next bit") → `GOTO_STATE`.
- **Below confidence threshold OR references something not in the manifest** → `FALLBACK` (never invent). Fallback says something safe ("Good question — let me show you") + drives the most relevant declared operation + logs the unmatched phrase for later authoring.

---

## 7. The 2D/3D unifier — `ORIENT_TO` named views

This is the crux of the 2D-vs-3D problem. 3D's extra degree of freedom (the camera) is **never exposed as raw coordinates**. Instead the manifest declares a **closed set of authored, physics-meaningful named views**, and the renderer owns the camera math (quaternion, tween):

- A `field_3d` sim declares e.g. `["default", "down_the_field", "side_on", "rule_hand"]`; each compiles to a `camera_position` (+ optional animated transition).
- A 2D PCPL sim declares `["default"]` and ignores `ORIENT_TO`.

Same grammar, both renderers — and the AI never reasons in screen-space, only physics-space ("show me the circle face-on" → `ORIENT_TO{down_the_field}`, not "move camera to [0,5,0]").

---

## 8. Worked example

> **Student (voice):** "wait, why does the force vanish when it's going straight along the field?"

```jsonc
CLASSIFY → matches answer_cluster "force_zero_when_parallel" (a derived cluster, see §10)
EMIT: { "op": "ANSWER", "cluster": "force_zero_when_parallel", "confidence": 0.91 }
  → speaks reviewed answer_ref
  → runs attached move "show_force_collapse_to_zero":
       [ {"op":"GOTO_STATE","state":"STATE_8"},                                  // interactive state, live theta
         {"op":"SET_PARAM","target":"force_explorer","param":"theta_deg","value":90,"unit":"deg"},
         {"op":"FOCUS","primitive_id":"force_vector"},
         {"op":"SWEEP_PARAM","target":"force_explorer","param":"theta_deg",
            "from":90,"to":0,"unit":"deg","duration_ms":2500} ]
```

The proton's force arrow shrinks to zero as θ→0 — and **every frame is computed by the engine's real `sinθ`**, physics the AI never saw coming. Had the student instead said *"make it go a million metres a second"* with no cluster, that's a pure `SET_PARAM{v, 5e5}` (clamped to the declared max) — runs freely, no review, because the engine owns the result.

---

## 9. What to build (incremental over the demo)

The demo already does STT → Haiku-classify → `SET_STATE` jump + TTS. To reach this grammar:

1. **Manifest emission** on `SIM_READY` — mostly a projection of the concept JSON (see §10 for the concrete one).
2. **5 net-new postMessage verbs:** `FOCUS`, `ANNOTATE`, `SET_VIEW`, `SEEK`, `SET_SPEED`.
3. **Widen the classifier output** from "pick a state" to "pick one envelope from this manifest," with a `FALLBACK` path.
4. **Author `answer_clusters` + `moves`** as reviewed artifacts (the `epic_c_branches` are the seeds; founder-review the spoken `answer_ref` per Rule 17).

---

## 10. Concrete manifest — `magnetic_force_moving_charge`

Derived from `src/data/concepts/magnetic_force_moving_charge.json` (the `field_3d` Lorentz-force diamond, 8 states, authored order 0°→90°→no-work→Fleming→45°→why-sinθ→10°→interactive).

> **Honesty note (Rule 27):** this is a *pre-Rule-27* diamond. Its addressable surface is the **4 explorer sliders** (`q_sign`, `v`, `B`, `theta_deg`) — genuinely param-addressable via `slider_controls`. Its `focusable` targets are the renderer-internal **glow tokens** (`f`, `v`, `b`, …) — good enough for `FOCUS`/highlight, but not individually param-addressable. A Rule-27-native sim would expose more object-level params here. Manifest reflects reality, not the ideal.

```jsonc
{
  "concept_id": "magnetic_force_moving_charge",
  "renderer": "field_3d",

  "states": [
    { "id": "STATE_1", "title": "θ = 0°: v ∥ B → F = 0, straight line" },
    { "id": "STATE_2", "title": "θ = 90°: F max → full circle, r & T appear" },
    { "id": "STATE_3", "title": "Turns but speed never changes — F does no work" },
    { "id": "STATE_4", "title": "Fleming's left-hand rule — Class-10 bridge" },
    { "id": "STATE_5", "title": "θ = 45°: circle opens into a helix" },
    { "id": "STATE_6", "title": "Why sin θ — resolve v into v∥ + v⊥" },
    { "id": "STATE_7", "title": "θ = 10°: very stretched helix" },
    { "id": "STATE_8", "title": "Interactive — drag the sliders, watch the path" }
  ],

  "objects": [{
    "id": "force_explorer",
    "params": [
      { "name": "q_sign",    "unit": "",    "enum": [-1, 1], "default": 1, "step": 2 },
      { "name": "v",         "unit": "m/s", "min": 5e4,   "max": 5e5,  "default": 1e5,  "step": 1e4 },
      { "name": "B",         "unit": "T",   "min": 0.001, "max": 0.1,  "default": 0.01, "step": 0.001 },
      { "name": "theta_deg", "unit": "deg", "min": 0,     "max": 90,   "default": 90,   "step": 1 }
    ]
  }],

  "readouts": [
    { "name": "F_magnitude", "unit": "N",     "formula": "|q|·v·B·sin θ" },
    { "name": "r_cyclotron", "unit": "m",     "formula": "m·v·sin θ / (|q|·B)" },
    { "name": "T_cyclotron", "unit": "s",     "formula": "2π·m / (|q|·B)  (independent of v)" },
    { "name": "omega_cyclotron", "unit": "rad/s", "formula": "|q|·B / m" }
  ],

  "focusable": [
    { "id": "force_vector",     "label": "the force F (glow: f)" },
    { "id": "v_vector",         "label": "the velocity v (glow: v)" },
    { "id": "B_field",          "label": "the magnetic field B (glow: b)" },
    { "id": "particle_trail",   "label": "the path trail (glow: trail)" },
    { "id": "rule_hand",        "label": "the 3D right-hand (glow: hand)" },
    { "id": "v_parallel",       "label": "v cos θ component ∥ B (glow: v_parallel)" },
    { "id": "v_perp",           "label": "v sin θ component ⊥ B (glow: v_perp)" },
    { "id": "fleming_hand",     "label": "Fleming's left hand (glow: fleming)" },
    { "id": "sliders",          "label": "the slider panel (glow: sliders)" }
  ],

  "views": [
    { "id": "default",        "label": "3/4 perspective" },              // ~[3, 2.5, 4]
    { "id": "down_the_field", "label": "look along B — circle face-on" },// camera above, axis [0,1,0]
    { "id": "side_on",        "label": "perpendicular to B — see helix pitch" },
    { "id": "rule_hand",      "label": "frame the right-hand overlay" }  // ~[2.2, 1.6, -1.6]
  ],

  "answer_clusters": [
    {
      "id": "force_zero_when_parallel",
      "question_gist": "Why is the force zero when v is along B?",
      "trigger_phrases": ["why is force zero when parallel", "force vanishes along the field",
                          "no force when v parallel to B", "straight line no bending"],
      "answer_ref": "REVIEW_PENDING:ans_force_zero_parallel",
      "move": "show_force_collapse_to_zero"
    },
    {
      "id": "force_along_velocity",        // ← epic_c_branches[0]
      "question_gist": "Isn't F in the direction of motion?",
      "trigger_phrases": ["F is along v", "force is in the direction of motion",
                          "magnetic force pushes the particle forward", "F parallel to v"],
      "answer_ref": "REVIEW_PENDING:ans_force_perp_not_along_v",
      "move": "reveal_perpendicularity"
    },
    {
      "id": "force_along_field",           // ← epic_c_branches[1]
      "question_gist": "Isn't F along B?",
      "trigger_phrases": ["F is along B", "force is in the direction of the field",
                          "F parallel to B", "magnetic force points along magnetic field"],
      "answer_ref": "REVIEW_PENDING:ans_force_perp_not_along_b",
      "move": "reveal_perpendicularity"
    },
    {
      "id": "magnetic_force_does_work",    // ← epic_c_branches[2]
      "question_gist": "Does the field speed the charge up?",
      "trigger_phrases": ["magnetic field changes speed", "B field speeds up the charge",
                          "magnetic force changes kinetic energy", "work done by magnetic force"],
      "answer_ref": "REVIEW_PENDING:ans_no_work_done",
      "move": "show_speed_constant"
    },
    {
      "id": "left_hand_for_force",         // ← epic_c_branches[3]
      "question_gist": "Shouldn't I use the left hand?",
      "trigger_phrases": ["left hand rule for F", "use left hand for force", "Fleming's left hand"],
      "answer_ref": "REVIEW_PENDING:ans_which_hand",
      "move": "show_fleming_bridge"
    },
    {
      "id": "why_sin_theta",
      "question_gist": "Where does the sin θ come from?",
      "trigger_phrases": ["why sin theta", "where does sine theta come from",
                          "why is there a sin in the formula"],
      "answer_ref": "REVIEW_PENDING:ans_why_sin_theta",
      "move": "decompose_v"
    }
  ],

  "moves": [
    {
      "id": "show_force_collapse_to_zero",
      "label": "Sweep θ from 90° to 0° — watch F shrink to zero",
      "ops": [
        { "op": "GOTO_STATE", "state": "STATE_8" },
        { "op": "SET_PARAM", "target": "force_explorer", "param": "theta_deg", "value": 90, "unit": "deg" },
        { "op": "FOCUS", "primitive_id": "force_vector" },
        { "op": "ANNOUNCE", "readout": "F_magnitude" },
        { "op": "SWEEP_PARAM", "target": "force_explorer", "param": "theta_deg",
          "from": 90, "to": 0, "unit": "deg", "duration_ms": 2500 }
      ]
    },
    {
      "id": "reveal_perpendicularity",
      "label": "Show F ⊥ both v and B, face-on circle",
      "ops": [
        { "op": "GOTO_STATE", "state": "STATE_2" },
        { "op": "ORIENT_TO", "view": "down_the_field" },
        { "op": "DIM_EXCEPT", "primitive_id": ["force_vector", "v_vector", "B_field"] },
        { "op": "FOCUS", "primitive_id": "force_vector" }
      ]
    },
    {
      "id": "show_speed_constant",
      "label": "Equal-arc trail → speed is locked, no work",
      "ops": [
        { "op": "GOTO_STATE", "state": "STATE_3" },
        { "op": "FOCUS", "primitive_id": "particle_trail" },
        { "op": "ANNOUNCE", "readout": "T_cyclotron" }
      ]
    },
    {
      "id": "decompose_v",
      "label": "Resolve v into v∥ (no force) + v⊥ (makes F)",
      "ops": [
        { "op": "GOTO_STATE", "state": "STATE_6" },
        { "op": "FOCUS", "primitive_id": "v_perp" },
        { "op": "POINT_AT", "primitive_id": "v_parallel" }
      ]
    },
    {
      "id": "show_fleming_bridge",
      "label": "Fleming's left hand = same physics as right-hand cross product",
      "ops": [
        { "op": "GOTO_STATE", "state": "STATE_4" },
        { "op": "FOCUS", "primitive_id": "fleming_hand" }
      ]
    }
  ]
}
```

### Review gate before this ships (Rule 17)

Every `answer_ref` above is marked `REVIEW_PENDING:` — the spoken answer text is **content** (an assertion) and must be founder-reviewed for physics before any student hears it. The operations/moves themselves need no physics review (they only choose inputs to the reviewed engine), but they should get a visual once-over so the camera/focus reads correctly. The 4 clusters tagged `← epic_c_branches[n]` are lifted directly from the JSON's already-authored misconception branches; the 2 extra (`force_zero_when_parallel`, `why_sin_theta`) are new and need authoring + review.

---

## 11. Open questions

- **Live θ outside STATE_8.** `SWEEP_PARAM` assumes the renderer recomputes the trajectory from live `theta_deg`. Today that path is exercised by the STATE_8 sliders; the moves above route sweeps through STATE_8 for safety. If we want mid-circle sweeps in STATE_2, confirm the renderer recomputes `trajectory_mode` from live θ (it's currently per-state authored).
- **`answer_ref` storage.** Where do reviewed spoken answers live — a sidecar `voice_answers.<concept>.json`, or a new column on the concept JSON? Leaning sidecar so it versions independently and stays out of the validator's path until wired.
- **Manifest emission vs sidecar.** Emit from the renderer at `SIM_READY` (single source of truth, always in sync) vs. precompute a sidecar manifest file (inspectable, testable offline). Leaning emit-with-snapshot-test.
- **Confidence threshold + fallback copy.** Needs a real number from demo telemetry once it runs.
```
