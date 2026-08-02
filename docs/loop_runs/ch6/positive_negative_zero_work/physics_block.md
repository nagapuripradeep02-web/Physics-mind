# Physics Block — `positive_negative_zero_work`

> physics-author output, companion to `skeleton.md` (Checkpoint A CLOSED, cycle 2 — DESIGN_FIX cycle 1
> → 34 patches applied cycle 2). Renderer: `field_3d` / `newtons_laws_body` energy layer (SEAM
> K+L+M+N, 0d pure-JSON). Conceptual-only (Rule 20 [D]) — no `mode_overrides`, no board mark scheme
> (§4 of the physics-author output contract is therefore DEFERRED, per the standing directive).
> **Every number below (S1–S5 kinematics, the S5 permanence envelope, all loop/pin arithmetic) was
> independently recomputed by this session in Python before a single word of narration was written —
> see §10. Every figure matched the skeleton exactly. No refutation is filed anywhere in this block.**

## 0. Engine bug queue consultation (run before authoring)

Read the skeleton's own §0 verification record (5 load-bearing engine claims, all re-checked at
source this cycle) and `docs/loop_runs/ch6_state.md` §"SEAM K/L/M/N RESULT" (the authoritative
contract, which supersedes any renderer line-number literal). The 11 inherited `engine_bug_queue`
rows the skeleton applied are honoured here identically — this block adds nothing beyond what the
skeleton's "Scar compliance" table already discharges. Two rules with direct physics-author
consequence, restated for this stage:

| bug_class | applies here as |
|---|---|
| `default_variables_only_first_var_merged` | Every variable with a non-1 default (`F`, `F_ang`, `m`, `mu_s`, `mu_k`, `v0`) is explicitly authored per state. **This concept has TWO live instances, not one:** S3's `m` slider AND S6's `m` slider both need `bodies[].mass_kg` to agree with `slider_controls.m.default` (5, never the engine's internal `NLB_SLIDER_SPEC.m.def = 2`) — see §2 and constraint callout 9. |
| `nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate` | Still OPEN/inert. No `work_bar_*` focal is authored anywhere below. S4 authors NO `glow_focal` at all (F6 ruling) — this is a deliberate zero-dim choice, not an oversight. |

No bug forces an exception in this block.

---

## 1. `physics_engine_config`

**Length + home pose:** `length_m: 6`, authored explicitly on every state so the arithmetic below is
legible from the JSON itself. `initial_position_m: -5.4` on **all six states, same body** (`id:
"crate"`) — the exact rig and pose concept #1 left the teacher looking at (Rule 32d permanent home
pose). Zero checkpoints anywhere in this concept.

```json
{
  "variables": {
    "F":     { "name": "applied force magnitude", "unit": "N", "min": 0, "max": 60, "default": 20 },
    "F_ang": { "name": "pull angle above the floor", "unit": "deg", "min": 0, "max": 180, "default": 0 },
    "m":     { "name": "crate mass", "unit": "kg", "min": 0.5, "max": 10, "default": 5 },
    "g":     { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "mu_s":  { "name": "coefficient of static friction (S2/S4/S5/S6)", "unit": "", "min": 0, "max": 1, "default": 0 },
    "mu_k":  { "name": "coefficient of kinetic friction (S2/S4/S5/S6, authored equal to mu_s)", "unit": "", "min": 0, "max": 1, "default": 0 },
    "v0":    { "name": "state-authored initial launch speed (S2: 6, S3: 3, S5: 8; all other states start at rest)", "unit": "m/s", "min": 0, "max": 10, "default": 0 }
  },
  "computed_outputs": {
    "N":         { "formula": "m*g - F*sin(radians(F_ang))" },
    "F_along":   { "formula": "F*cos(radians(F_ang))" },
    "f_k":       { "formula": "mu_k*(m*g - F*sin(radians(F_ang)))" },
    "maxStat":   { "formula": "mu_s*(m*g - F*sin(radians(F_ang)))" },
    "a_driven":  { "formula": "(F*cos(radians(F_ang)) - mu_k*(m*g - F*sin(radians(F_ang))))/m" },
    "W_applied": { "formula": "F*d*cos(radians(F_ang))" },
    "W_friction":{ "formula": "-mu_k*(m*g - F*sin(radians(F_ang)))*d" },
    "W_normal":  { "formula": "0" },
    "W_net":     { "formula": "(F*cos(radians(F_ang)) - mu_k*(m*g - F*sin(radians(F_ang))))*d" }
  },
  "formulas": {
    "sign_positive":        "W = F·d·cos θ > 0 for 0° <= θ < 90° -- the force helps the motion (S1)",
    "sign_negative_friction":"W = f·d·cos 180° = -f·d -- kinetic friction's work is always negative while sliding (S2)",
    "sign_zero_perpendicular":"W = N·d·cos 90° = 0 -- a force at right angles to the displacement does zero work (S3)",
    "net_work_sum":          "W_net = W1 + W2 + W3 -- net work is the signed sum of every force's work (S4)",
    "sign_general_angle":    "W = F·d·cos θ -- one formula spans all three sign regimes; the sign lives in cos θ (S5/S6)",
    "normal_reaction":       "N = m·g - F·sin θ -- valid for θ in [0deg,180deg]; the pull's vertical component changes the floor's normal reaction",
    "max_static":            "maxStat = mu_s·N -- the ceiling static friction can supply before breakaway"
  },
  "constraints": [
    "W = F*d*cos(theta) for every force at every instant -- the sign comes from theta, never from the size of F",
    "N = m*g - F*sin(theta) stays >= 0 for every authored angle 0..180deg; the minimum reached anywhere in this concept is 24.0 N at theta=90deg with F=25N, so the crate never lifts off",
    "a force at exactly 90deg to the displacement does zero work, however far the body travels or however heavy it is",
    "kinetic friction always points opposite to the direction of sliding, so its work is negative whenever the body is actually moving",
    "static friction holds a body at rest only while the along-motion drive stays at or below mu_s*N; past that limit the body breaks away",
    "net work on a body is the signed sum of the work done by every individual force acting on it"
  ]
}
```

**Contracted config-key map** (json-author writes these under `newtons_laws_body`, not
`physics_engine_config`'s own names):

| Quantity | Contracted key | Notes |
|---|---|---|
| `F`, `F_ang` | `bodies[].applied_force: { N, angle_deg }` | SEAM N key; `angle_deg` is a plain **degree** number 0…180, engine-converted internally — never wrap in `radians()` here. |
| `m` | `bodies[].mass_kg` | Independent of any slider default; must agree with `slider_controls.m.default` in S3 and S6 (constraint callout 9). |
| `mu_s`, `mu_k` | `bodies[].mu_s`, `bodies[].mu_k` | S2/S4/S5/S6 only; authored equal (DoD f-1) — never `mu_k > mu_s`. |
| `v0` | `bodies[].initial_velocity_mps` | S2:6 (`coast_with_friction`), S3:3 (`coast_no_force`), S5:8 (`accelerate_applied_force`). |
| frictionless | `surface.frictionless: true` | S1/S3 only. **Never author on S2/S4/S5/S6** — it hard-zeroes `mu_s`/`mu_k` at read time (L44685-86). |
| `d` | `displacement_vector: { body_id, label:'d', show_value:true }` | Drawn from `initial_position_m`; auto-hides below `\|Δs\| < 0.02 m`. |
| θ arc | `angle_arc: { from, to:'displacement', body_id, label:'θ', show_value:true, radius:0.85 }` | `to` is **`'displacement'`** everywhere in this concept (never `'surface'`) — see constraint callout 3. |
| `W` (bars) | `work_accumulators: [{ force, label, body_id }]` + state-level `work_scale_J` | `force` from the CLOSED enum `'applied'\|'friction'\|'normal'\|'net'`; labels verbatim (constraint callout 2). |
| HUD | `readouts: ['F_applied']` all states, `+ 'f'` on S2, `+ 'v'` everywhere a speed observable is taught | `'v'` is the concept's ONE permitted speed observable (f-4). Do NOT add `'N'`/`'a'` — internal-only. |
| slider ranges | `slider_controls: { F, F_ang, m }` | top-level, concept-wide; **`F_ang: {min:0, max:180, ...}`** is the per-concept override of the engine's own 0…85 default range — this IS what makes the whole concept reachable. |

---

## 2. Per-state variable overrides

Naive baseline (what the engine falls back to absent explicit per-state authoring): `F=20`,
`F_ang=0` (both `slider_controls` defaults for this concept), **`m=2` (`NLB_SLIDER_SPEC.m.def`, the
ENGINE's own internal default — NOT this concept's 5 kg crate)**, `mu_s=0, mu_k=0`,
`surface.frictionless` absent, `v0=0` (body starts at rest). Every departure, stated:

| State | Overrides vs. the naive baseline | Why |
|---|---|---|
| **S1** `positive_work` | `mode:'accelerate_applied_force'` · `F:20` (= baseline, authored explicitly) · `F_ang:0` (= baseline, authored explicitly so entry never jumps) · `m:5` · `surface.frictionless:true` · `initial_position_m:-5.4` | 0° pull is S1's whole picture; `m` must be the established crate, never the engine's 2 kg internal default. |
| **S2** `negative_work_friction` | `mode:'coast_with_friction'` · **`F:0` (no pull authored at all)** · `initial_velocity_mps:6` · `mu_s:0.4, mu_k:0.4` (equal, DoD f-1) · `m:5` · **`surface.frictionless` OMITTED** · `initial_position_m:-5.4` | S2's entire picture is friction acting alone against a launched crate; authoring `frictionless:true` would hard-zero `mu_s`/`mu_k` and collapse the PRIMARY-aha state to an undecelerated free-slide. |
| **S3** `zero_work_normal` | `mode:'coast_no_force'` · `initial_velocity_mps:3` · `surface.frictionless:true` · **`m:5` (LIVE control — verify against `slider_controls.m.default`, constraint callout 9)** · `initial_position_m:-5.4` | Coast with no applied force anywhere; `m` must be explicit because this is one of only two states where it is a live slider. |
| **S4** `net_work_ledger` | `mode:'accelerate_applied_force'` · `F:30` · `F_ang:0` · `mu_s:0.4, mu_k:0.4` (equal) · `m:5` · `surface.frictionless` OMITTED · `initial_position_m:-5.4` | Breakaway must be immediate (30 N > maxStat 19.6 N); authoring `frictionless:true` would erase two of the four bars. |
| **S5** `angle_decides_sign` | `mode:'accelerate_applied_force'` · `F:25` · `F_ang:120` · `initial_velocity_mps:8` · **`mu_s:0.65, mu_k:0.65`** · `m:5` · `surface.frictionless` OMITTED · `initial_position_m:-5.4` | μ = 0.65 is the F1 permanence envelope, independently re-verified in §10 — this exact value is load-bearing: a lower μ reopens the reversal Checkpoint A's F1 found. |
| **S6** `explore` | `mode:'sandbox'` · `trusted_drag_seizes:true` · `F:25` (authored opening, F11) · `F_ang:60` (authored opening, F11) · `mu_s:0.3, mu_k:0.3` (equal) · **`m:5` DUAL override: (a) `bodies[].mass_kg:5` AND (b) `slider_controls.m.default:5` using the literal key `"default"`, never `"def"`** · `surface.frictionless` OMITTED · `initial_position_m:-5.4` | The concept's second live instance of `default_variables_only_first_var_merged` — without both halves the slider opens on 2 kg while the body physics is 5 kg. |

`slider_controls` (concept-wide, authored once):
`F: {min:0, max:60, step:5, default:20}` · `F_ang: {min:0, max:180, step:5, default:0}` ·
`m: {min:0.5, max:10, step:0.5, default:5}`.

---

## 3. Per-state motion timeline + control table (Rule 31)

All arithmetic in this section was independently recomputed (§10) before being written here — every
figure matched the skeleton's own "Arithmetic" table exactly.

| # | t-window | What animates (pure fn of the state clock) | Driven by | Live control(s) |
|---|---|---|---|---|
| **S1** | 0–2000 ms (loop) | Crate accelerates from rest under the 20 N/0° pull (`a = 4.000 m/s²`); `d` arrow appears ≈100 ms in and stretches; the "by the pull" bar climbs from the mid-height zero line at **+20.0 J/m**; `v` readout rises to 4.8 m/s by the pin. | position `x(t)` under constant `a` | none |
| **S1** | loop reset | At `t=2000 ms` (`d=8.00 m`, bar `+160.0 J`, `v=8.0 m/s`) the trajectory resets to `t=0` and repeats identically. | `loop_reset_ms=2000` | none |
| **S2** | 0–1531 ms | Crate launched at `v0=6 m/s` with **no pull**; friction arrow (19.6 N) points backward against the still-forward motion; "by friction" bar dives from zero at **−19.6 J/m**; `v` readout falls 6.0 → 0. | `v(t) = 6 − 3.92t` | none |
| **S2** | 1531–3000 ms | Crate at rest; friction arrow AND its arc vanish (a real zero hides, L39664 — never a stub); bar holds flat at **−90.0 J**: the force is gone, the work it did stays counted. | rest-hold, drive = 0 | none |
| **S2** | loop reset | At `t=3000 ms` the trajectory resets and re-launches at 6 m/s. Pin sits ≥250 ms past the arrow-hide frame (invariant per DoD d). | `loop_reset_ms=3000` | none |
| **S3** | 0–2400 ms (loop) | Crate coasts at a constant 3 m/s; normal-force arrow (49.0 N at `m=5`) pushes straight up the whole run; `angle_arc` reads a fixed **90°**; `d` grows past 4 m by the pin; the "by the normal force" bar never leaves the zero line (engine-guaranteed, L44161). | position `x(t) = x0 + 3t` | `m` (0.5…10) |
| **S3** | continuous, any `m` | Dragging `m` re-derives `N = m·g` live — the arrow and its readout visibly grow or shrink. The bar stays at exactly **0.0 J** at every value: the extremes-sizing rule is satisfied by any scale. | `m` slider | `m` |
| **S3** | loop reset | At `t=2400 ms` (`d=7.20 m`) resets and repeats, UNLESS the teacher has touched `m` — a trusted input latches seizure and the crate runs the remaining track once, arresting at the +bound with `W` still 0 (fleet-normal, consistent with S3's own claim). | `loop_reset_ms=2400` | `m` |
| **S4** | 0–2000 ms (loop) | Crate breaks away immediately (30 N pull > 19.6 N maxStat) and accelerates (`a=2.080 m/s²`); all three arrows (applied/friction/normal) are visible from `t=0`; FOUR bars move at once: "by the pull" **+30.0 J/m**, "by friction" **−19.6 J/m**, "by the normal force" parked at **0**, "net" **+10.4 J/m**; `v` readout rises — net positive ↔ speeds up, observable only. | position `x(t)` under net `a=2.080` | none |
| **S4** | loop reset | At `t=2000 ms` (`d=4.16 m`; bars `+124.8 / −81.5 / 0 / +43.3 J`) resets and repeats. | `loop_reset_ms=2000` | none |
| **S5** | 0–1321 ms | Crate launched at 8 m/s decelerates under the 25 N/120° pull (along = **−12.5 N**) plus kinetic friction (17.777 N), both opposing the forward slide (`a=−6.055 m/s²`); the pull arrow leans up-and-back the whole time at its FULL 25 N; `angle_arc` reads a fixed **120°**; "by the pull" bar dives at **−12.5 J/m**; friction's negative work is real but deliberately unbarred (f-5). | `v(t) = 8 − 6.055t` | none |
| **S5** | 1321–2600 ms | Crate **permanently** at rest — the F1 fix: `μₛ·N(θ) ≥ 1.05·\|F cos θ\|` holds for every θ the slider can reach (independently re-verified, §10 — binding angle 30.68°/149.32°, margin 9.6% at authored `μₛ=0.65`). Unlike S2, the pull arrow HOLDS at 25 N/120° (nothing vanishes); the friction arrow FLIPS forward to the static value +12.5 N, holding the crate against the still-held pull. Bar holds flat at **−66.1 J**. | rest-hold via the engine's stuck/rest-clamp branch | `F_ang` (0…180) |
| **S5** | continuous, any θ | Dragging `F_ang` below 90° while the crate is still sliding turns the taught bar's direction green mid-run; at exactly 90° the pull's bar freezes while friction (still nonzero at θ=90°: `f=15.6 N`) keeps decelerating. | θ slider | `F_ang` |
| **S5** | loop reset | At `t=2600 ms` the trajectory resets and re-launches at 8 m/s/120°. No reversal is reachable at any θ, looped or seized (permanence envelope). | `loop_reset_ms=2600` | `F_ang` |
| **S6** | continuous, free-running (Rule 37) | Teacher drags the crate and/or `F`, `F_ang` (0…180), `m`; all three force arrows, four bars, `d` and the arc re-derive live every frame; on wrap the ledger and the `d` arrow re-zero in the same frame (`_dsp0`, engine-verified L45571-72/L44018). | all sliders + drag | `F`, `F_ang`, `m` + drag |
| **S6** | opens moving | Authored at `F=25 N, θ=60°`: drive 12.5 N > maxStat `0.3×27.35=8.2 N`, so the sandbox opens already sliding with a green "by the pull" bar — no teleport from S5's picture. | `applied_force` at entry | — |

**Glow focal per state (32e — at most one; every id from the verified list; no `work_bar_*`
anywhere):** S1 = `displacement_vector` · S2 = `nlb_arrow_crate_friction` · S3 =
`nlb_arrow_crate_normal` · S4 = **NONE authored** (F6 — omit the `glow_focal` key entirely; do not
author `energy_panel` or any empty-string value) · S5 = `angle_arc` · S6 = `nlb_body_crate`.

**`arrows.show` per state (DoD c):** S1 `['applied']` · S2 `['friction']` · S3 `['normal']` ·
S4 `['applied','friction','normal']` · S5 `['applied','friction']` · S6 `['applied','friction','normal']`.

**`work_scale_J`:** S1–S4 share **180** · S5 **315** · S6 **792** (extremes arithmetic re-verified
in §10 — all three authored values are ≥ the 1.1× floor). **Do not narrate a cross-state bar-length
comparison between S2's −90.0 J and S5's −66.1 J** — they render at 50% and 21% of half-track on
different scales (F9).

---

## 4. Narration (`text_en`)

**Rule 41 audit applied to every sentence below** — no idioms, no metaphors, no personification;
forces "point"/"act"/"do work", bars "climb"/"dive"/"hold" (literal bar motion). **f-4 boundary
respected: no sentence anywhere contains "kinetic energy", "energy", or ΔK** — only "speeds up" /
"slows down" plus the `v` readout, and only S4's speed clause is tied to the NET bar (never a single
force). **Word counts below are machine-counted** (§10 script) — every state lands inside its tabled
budget.

### STATE_1 `positive_work` — 43 words (target 30–45)

1. `{ "id": "s1_1", "text_en": "A steady twenty newton pull acts on the crate from rest, along the floor.", "glow": "nlb_arrow_crate_applied" }`
2. `{ "id": "s1_2", "text_en": "The pull is the only force acting, and the crate speeds up.", "glow": "nlb_body_crate" }`
3. `{ "id": "s1_3", "text_en": "The work bar climbs above the zero line — positive work, because the force points along the motion.", "glow": "displacement_vector" }`

### STATE_2 `negative_work_friction` — 55 words (target 40–55) — PRIMARY aha

1. `{ "id": "s2_1", "text_en": "The crate slides at six metres per second with no pull — only friction acts, pointing backward against its motion.", "glow": "nlb_arrow_crate_friction" }`
2. `{ "id": "s2_2", "text_en": "The bar dives below the zero line as the crate slows to a stop: negative work.", "glow": "displacement_vector" }`
3. `{ "id": "s2_3", "text_en": "At rest the friction arrow vanishes, but the bar still holds at minus ninety joules — the work is still counted.", "glow": "nlb_arrow_crate_friction" }`

### STATE_3 `zero_work_normal` — 47 words (target 35–50)

1. `{ "id": "s3_1", "text_en": "The crate coasts at three metres per second while the normal force pushes up, at ninety degrees to the motion.", "glow": "angle_arc" }`
2. `{ "id": "s3_2", "text_en": "The work bar never leaves the zero line, however far the crate travels.", "glow": "displacement_vector" }`
3. `{ "id": "s3_3", "text_en": "A heavier crate makes the normal force taller, but the bar still reads zero.", "glow": "nlb_arrow_crate_normal" }`

### STATE_4 `net_work_ledger` — 55 words (target 40–55) — SUPPORTING aha

1. `{ "id": "s4_1", "text_en": "The pull, friction, and the normal force act on the same moving crate — each keeps its own signed account.", "glow": "nlb_body_crate" }`
2. `{ "id": "s4_2", "text_en": "The pull's bar climbs green, friction's bar dives red, and the normal force's bar stays parked on zero.", "glow": "nlb_arrow_crate_friction" }`
3. `{ "id": "s4_3", "text_en": "The fourth bar is the net, the signed sum of the other three, and the crate speeds up." }`

(Sentence 3 carries no glow binding — deliberately, matching S4's own NONE-authored state focal; the
"speeds up" clause reads directly off "the net", so it stays tied to net work, never to the pull
alone, per the F3 boundary fix.)

### STATE_5 `angle_decides_sign` — 54 words (target 40–55)

1. `{ "id": "s5_1", "text_en": "A twenty-five newton pull leans back at a hundred and twenty degrees.", "glow": "angle_arc" }`
2. `{ "id": "s5_2", "text_en": "The bar dives below zero while the HUD reads a positive twenty-five newtons — the sign lives in the angle.", "glow": "nlb_arrow_crate_applied" }`
3. `{ "id": "s5_3", "text_en": "The rough floor's friction also does negative work here — we count only the pull's — and the crate comes to rest and stays there.", "glow": "nlb_arrow_crate_friction" }`

(Sentence 3 carries the (f-5) single mandated friction-acknowledgment clause verbatim: "the rough
floor's friction also does negative work here — we count only the pull's". Exactly one clause in the
entire concept names friction's unbarred work.)

### STATE_6 `explore` — 0/open (no scripted `tts_sentences`)

Per Rule 31's explore convention, S6 carries no TTS. json-author may author the two named
discoverables below as persistent on-canvas annotations (core-ring-safe, Rule 38b; static labels are
not TTS-timed, so the 0/open convention is intact) — matching the F10-corrected wording:

- **Static-hold discoverable:** "Set the force below μₛN and the crate holds still — every bar parks,
  because nothing moved." (static friction does no work either — the S2/S3 lesson transferred to a
  new configuration.)
- **Ninety-degree discoverable:** "At ninety degrees the pull's bar freezes while the friction bar
  keeps diving — kinetic friction still slows a moving crate." (F10: NOT "the crate coasts" — this
  sandbox's μ = 0.3 means a moving crate still decelerates at θ=90°.)

---

## 5. Misconception watch (Rule 16a — verbatim per skeleton §4, keep-verbatim per reviewer)

| State | `belief` | `visual_counter` | `one_line_fix` |
|---|---|---|---|
| **S2** | work can only accumulate upward; friction merely slows, contributing no work | the friction arrow points backward while the crate still moves forward; the friction bar dives below the zero line to −90.0 J as the speed readout falls to zero | a force pointing against the motion does negative work — the joules are real and carry a minus sign |
| **S3** | acting force → joules appear | the normal-force arrow pushes up for the whole run, the arc reads 90°, d grows past 4 m — and the normal-force bar sits parked exactly on the zero line | a force at right angles to the motion does zero work, however long it acts |
| **S5** | the minus sign belongs to the force | the HUD reads the full pull F = 25 N — positive — the entire time; only the arc past 90° sends the bar below zero, and dragging θ back under 90° while the crate still slides turns the same 25 N pull's bar green | the sign of work comes from the angle between the force and the motion, not from the force's own size |

S1, S4, S6 carry NO watch entry — straightforward teaching (skeleton §4). EPIC-C branches: none.

---

## 6. Drill-down cluster phrasings (5 real student-voice phrases × 9 clusters)

**S2 — `how_work_can_be_negative`:** "how can work be negative isnt work just force times distance" ·
"negative joules doesnt make sense to me" · "if work is negative does that mean it goes backwards in
time" · "how do you even get a minus sign in work" · "so work can be less than zero how"

**S2 — `friction_always_opposes_sliding`:** "why does friction always point backward" · "does friction
ever help the motion instead of opposing it" · "why is frictions angle always 180 degrees to the
motion" · "how do i know friction is exactly opposite to velocity" · "can friction ever do positive
work while sliding"

**S2 — `slowing_down_and_negative_work`:** "does slowing down always mean negative work" · "why does
the crate stopping mean the work was negative" · "is negative work the reason things slow down" ·
"how is losing speed connected to a negative number for work" · "if something slows down is the work
always negative"

**S3 — `why_ninety_degrees_means_zero`:** "why does 90 degrees give zero work" · "whats special about
a right angle for work" · "why cos 90 makes the whole thing disappear" · "how can an angle make work
completely vanish" · "why is perpendicular the exact cutoff for zero work"

**S3 — `force_without_work`:** "can a force act and still do nothing" · "how can something push on an
object without doing work" · "if the force is there the whole time why is the work zero" · "does a
force have to move something to count as doing work" · "so acting on an object isnt the same as
working on it"

**S3 — `carrying_a_bag_zero_work`:** "if i carry a heavy bag why is that zero work" · "my arm is
holding the bag up the whole walk so why no work" · "carrying something across a flat road should be
work right" · "why does walking with a bag count as doing nothing physics wise" · "if it feels tiring
how can the work be zero"

**S5 — `sign_of_cos_theta`:** "how does cos theta decide if work is plus or minus" · "why does cos
theta flip sign after 90 degrees" · "whats the pattern for cos theta being positive or negative" ·
"does cos theta only matter for the angle value" · "why does the same formula give different signs at
different angles"

**S5 — `negative_work_vs_negative_force`:** "if the work is negative does that mean the force is
negative" · "how can the force stay positive but the work go negative" · "does negative work mean the
force pushes the wrong way" · "why isnt the force itself negative when the work is" · "so the newtons
reading is still positive even with negative work"

**S5 — `ninety_degrees_the_dividing_line`:** "why is ninety degrees the exact line between positive
and negative work" · "what happens right at ninety degrees to the sign of work" · "is ninety degrees
always the boundary no matter the force" · "why does crossing ninety degrees flip the sign of work" ·
"whats so special about ninety degrees compared to any other angle"

---

## 7. Constraint callouts for json-author

1. **No `radians()` inside the `newtons_laws_body` config.** `applied_force.angle_deg` and
   `angle_arc` take plain **degree** numbers 0…180 — the engine converts internally. `radians()`
   belongs ONLY inside `physics_engine_config.computed_outputs` (THE CALCULATOR's evaluator
   special-cases it), never inside any field_3d config key.
2. **`work_accumulators[].label` must be the literal strings, verbatim (Rule 41 / DoD b):** `"by the
   pull"` (applied accumulator, S1/S4/S5/S6) · `"by friction"` (S2/S4) · `"by the normal force"`
   (S3/S4) · `"net — the sum"` (S4 only). Any other string breaks the engine's composed caption.
3. **`angle_arc.to` is `'displacement'` everywhere in this concept** (S2 friction↔displacement, S3
   normal↔displacement, S5 applied↔displacement) — **never `'surface'`**, unlike concept #1's
   convention. The arc's honest reference here is the direction of travel, per DoD (c).
4. **`work_scale_J` exactly:** `180` (S1–S4, shared for slope comparability) · `315` (S5) · `792`
   (S6) — the extremes arithmetic is independently reverified in §10; do not resize any of the three.
5. **Zero checkpoints anywhere in this concept.** Do not add one to any state.
6. **`surface.frictionless: true` and `bodies[].mu_s`/`mu_k` are mutually exclusive in effect** —
   authoring both is not a JSON error, but `frictionless: true` hard-zeroes `mu_s`/`mu_k` at read
   time (L44685-86). **Never author `frictionless: true` on S2, S4, S5, or S6.**
7. **Pick one stable `body_id`** (recommend `"crate"`) and propagate it identically across
   `bodies[].id`, `displacement_vector.body_id`, `angle_arc.body_id`, every
   `work_accumulators[].body_id`, and the glow focal strings `nlb_arrow_crate_applied` /
   `nlb_arrow_crate_friction` / `nlb_arrow_crate_normal` / `nlb_body_crate`.
8. **`slider_controls.F_ang` must be authored `{min:0, max:180, step:5, default:0}`** at the
   concept level — this per-concept override of the engine's own 0…85° default range is what makes
   S5's obtuse-angle regime reachable at all. Verify the key is literally `"default"`, never `"def"`.
9. **S3 AND S6 both expose the `m` control** — this concept's TWO live instances of
   `default_variables_only_first_var_merged` (not one, unlike concept #1 which had only S6). In both
   states, `bodies[].mass_kg` must agree with `slider_controls.m.default` (5, never the engine's
   internal `NLB_SLIDER_SPEC.m.def = 2`).
10. **No `param_ramp` anywhere in this concept.** `param_ramp.param`'s closed enum has no `'F_ang'`
    member, and the architect's own physics ruling holds: an authored angle ramp would make the
    ledger accumulate `∫F cos θ ds` against a printed surface reading `W = F·d·cos θ` — a genuine
    disagreement, not a labeling gap. The θ crossing in S5 is teacher-driven, by design.
11. **`checkpoints[].s_m`** — N/A, not used.
12. **Formula surfaces, per state (Rule 34b — one per state, math-serif Unicode, static template
    string, never live-interpolated):** S1 `W = F·d·cos θ > 0  (θ < 90°)` · S2
    `W = f·d·cos 180° = −f·d` · S3 `W = N·d·cos 90° = 0` · S4 `Wₙₑₜ = W₁ + W₂ + W₃` (U+2099/U+2091/U+209C
    and U+2081/U+2082/U+2083) · S5 `W = F·d·cos θ` · S6 `W = F·d·cos θ`.

---

## 8. `assessment` + `coverage_map`

Six questions, backward-designed, one per state, each with `distractor_misconceptions` on every
wrong option:

| q_id | state | tested idea | correct | key distractor |
|---|---|---|---|---|
| `q1_sign_convention` | S1 | θ<90° gives positive work — the sign convention | A ("Positive — force and displacement point the same way") | B invents a rule that starting from rest makes work negative (cause-of-motion confusion) |
| `q2_friction_negative_joules` | S2 | negative work from a force opposing the motion; friction's joules are real and negative | A (−60 J) | C: "friction only slows things down, it does not do work" — the exact planted belief |
| `q3_zero_perpendicular_bag` | S3 | a force at right angles to the motion does zero work, however long it acts (carried-bag form) | A (Exactly 0 J) | B: "acting force → accumulating joules" — the planted belief, transferred to the bag |
| `q4_net_work_signed_sum` | S4 | net work is the signed sum of every force's work — including the constant-velocity net-zero case | A (Exactly 0 J — the pull's positive work and friction's negative work cancel) | C: assumes friction always dominates and "wins" |
| `q5_obtuse_angle_computed` | S5 | sign from cos θ for an obtuse angle, computed numerically | A (≈ −104 J) | D: "obtuse angle automatically means zero" — confuses the 90° zero-case with the >90° negative case |
| `q6_sandbox_class_transfer` | S6 | transfer the zero-displacement / zero-work rule to a new configuration (static friction holding the crate still) | A (Zero for every force — nothing has displaced) | B/D: "acting force → joules" transferred to the static-friction case |

Full JSON (json-author renders verbatim):

```json
{
  "assessment": {
    "mastery_definition": "A student who has mastered this concept can state the sign of the work done by a force from the angle between the force and the displacement alone; explain why a force perpendicular to the motion does zero work however long it acts, using the carried-bag case; explain why kinetic friction's work is always negative while a body slides, and why the force reading itself stays positive even when the work is negative; compute work at an obtuse angle numerically; and sum the signed work of several forces into a correct net work, including the constant-velocity net-zero case.",
    "questions": [
      {
        "q_id": "q1_sign_convention",
        "stem": "A horizontal 25 N force pulls a crate 3 m across a frictionless floor, in the same direction the crate moves. What is the sign of the work done by this force?",
        "options": {
          "A": "Positive — force and displacement point the same way",
          "B": "Negative — the force causes the crate to start moving from rest",
          "C": "Zero — the crate starts from rest, so no work has been done yet",
          "D": "It cannot be determined without knowing the crate's mass"
        },
        "correct": "A",
        "distractor_misconceptions": {
          "B": "invents a rule that starting a body from rest makes the force's work negative — confuses cause-of-motion with the sign of work",
          "C": "confuses the body's initial rest state with a zero reading, ignoring that positive work accumulates from any nonzero force times displacement",
          "D": "mass-relevance misconception — work done by a force does not depend on the mass being moved"
        },
        "tested_idea": "theta < 90 degrees gives positive work -- the sign convention",
        "teaches_state": "STATE_1",
        "difficulty": "core",
        "parallel_form_stem": "A 15 N horizontal force drags a suitcase 2 m across a smooth floor, force and motion in the same direction. What is the sign of the work done?"
      },
      {
        "q_id": "q2_friction_negative_joules",
        "stem": "A crate slides across a rough floor with no applied push, slowing down as a constant 15 N kinetic friction force acts on it. What is the work done by friction while the crate travels 4 m?",
        "options": {
          "A": "-60 J",
          "B": "+60 J -- friction is what stops the crate, so it does positive work",
          "C": "0 J -- friction only slows things down, it does not do work",
          "D": "-4 J"
        },
        "correct": "A",
        "distractor_misconceptions": {
          "B": "attaches a positive sign to friction because it 'accomplishes' stopping the crate, instead of reading the sign from the angle between friction and the motion",
          "C": "friction merely slows, contributing no work -- the exact planted belief this state confronts",
          "D": "confuses the distance travelled with the work done -- unit-blind arithmetic"
        },
        "tested_idea": "negative work from a force opposing the motion; friction's joules are real and negative",
        "teaches_state": "STATE_2",
        "difficulty": "core",
        "parallel_form_stem": "A bicycle's brakes apply a constant 40 N backward friction force while the bike rolls 2.5 m forward before stopping. What is the work done by the brake friction?"
      },
      {
        "q_id": "q3_zero_perpendicular_bag",
        "stem": "You carry a bag straight up with your hand while walking 12 m across a level floor. Your hand's upward force on the bag stays constant the whole way. How much work does your hand's upward force do on the bag?",
        "options": {
          "A": "Exactly 0 J, however far you walk",
          "B": "A positive value that grows with the distance walked",
          "C": "A positive value equal to the force times your walking speed",
          "D": "A negative value, because your arm gets tired"
        },
        "correct": "A",
        "distractor_misconceptions": {
          "B": "acting force implies accumulating joules -- the planted belief, transferred to the carried-bag case",
          "C": "confuses work with power by multiplying force with speed instead of displacement along the force",
          "D": "confuses the carrier's own fatigue with the physics work done on the bag"
        },
        "tested_idea": "a force at right angles to the motion does zero work, however long it acts (perpendicular case; carried-bag anchor)",
        "teaches_state": "STATE_3",
        "difficulty": "core",
        "parallel_form_stem": "A crate coasts at constant speed across a frictionless floor while the floor's normal force pushes straight up on it the entire time. How much work does the normal force do?"
      },
      {
        "q_id": "q4_net_work_signed_sum",
        "stem": "A crate is pulled at a steady 20 N along a rough floor and moves at CONSTANT velocity the whole time, because friction exactly balances the pull. What is the net work done on the crate over any distance it travels?",
        "options": {
          "A": "Exactly 0 J -- the pull's positive work and friction's negative work cancel",
          "B": "A large positive value, because the pull is still doing work",
          "C": "A large negative value, because friction always wins",
          "D": "It depends on the crate's mass"
        },
        "correct": "A",
        "distractor_misconceptions": {
          "B": "ignores that friction's negative work is equal in size to the pull's positive work",
          "C": "assumes friction always dominates the sum rather than exactly cancelling it here",
          "D": "invents a mass-dependence for net work that does not exist when both forces are given directly"
        },
        "tested_idea": "net work is the signed sum of every force's work, including the constant-velocity net-zero case",
        "teaches_state": "STATE_4",
        "difficulty": "core",
        "parallel_form_stem": "A crate on a rough floor is pulled by a force doing +22 J of work while friction does exactly -22 J of work over the same distance. What is the net work done on the crate?"
      },
      {
        "q_id": "q5_obtuse_angle_computed",
        "stem": "A 30 N pull acts at 150 degrees to a crate's forward displacement of 4 m (cos 150 degrees is about -0.87). What is the work done by the pull?",
        "options": {
          "A": "About -104 J",
          "B": "About +104 J",
          "C": "About -60 J",
          "D": "0 J, because the angle is obtuse"
        },
        "correct": "A",
        "distractor_misconceptions": {
          "B": "correctly finds the magnitude but drops the negative sign the obtuse angle requires",
          "C": "uses sin 150 degrees instead of cos 150 degrees",
          "D": "confuses the 90 degree zero-work case with any obtuse angle, assuming every angle past 90 degrees also gives zero"
        },
        "tested_idea": "sign from cos theta for an obtuse angle, computed numerically",
        "teaches_state": "STATE_5",
        "difficulty": "stretch",
        "parallel_form_stem": "A 40 N force acts at 130 degrees to a body's 5 m displacement (cos 130 degrees is about -0.64). Find the work done by the force."
      },
      {
        "q_id": "q6_sandbox_class_transfer",
        "stem": "In the sandbox, you set the pull's force below mu_s times N so the crate never starts moving. What is the work done by EVERY force acting on the crate, including static friction?",
        "options": {
          "A": "Zero for every force -- nothing has displaced",
          "B": "Positive for the pull, negative for friction, because both forces are still acting",
          "C": "The pull does positive work equal to the force's own magnitude",
          "D": "Friction does negative work because it opposes the pull"
        },
        "correct": "A",
        "distractor_misconceptions": {
          "B": "acting force implies joules, transferred to the new static-friction configuration",
          "C": "confuses force magnitude with work directly, ignoring that displacement is zero",
          "D": "same planted belief as B, applied specifically to the static friction force"
        },
        "tested_idea": "transfer the zero-displacement / zero-work rule to a new configuration in the open sandbox",
        "teaches_state": "STATE_6",
        "difficulty": "core",
        "parallel_form_stem": "In a similar sandbox, a small force acts on a crate but never overcomes static friction. How much work does the applied force do?"
      }
    ]
  },
  "coverage_map": {
    "by_state": {
      "STATE_1": ["q1_sign_convention"],
      "STATE_2": ["q2_friction_negative_joules"],
      "STATE_3": ["q3_zero_perpendicular_bag"],
      "STATE_4": ["q4_net_work_signed_sum"],
      "STATE_5": ["q5_obtuse_angle_computed"],
      "STATE_6": ["q6_sandbox_class_transfer"]
    },
    "non_assessed_states": []
  }
}
```

---

## 9. Self-review checklist

Every symbol referenced in the skeleton's state narratives (`F`, `F_ang`/θ, `m`, `g`, `mu_s`, `mu_k`,
`v0`, `d`, `N`, `W`) appears in `variables`/`computed_outputs` ✓ · `radians()` only inside
`physics_engine_config`, never in the field_3d config keys (constraint callout 1) ✓ · live controls
match the architect's table exactly (S1/S2/S4 none · S3 `m` · S5 `F_ang` · S6 ALL) ✓ ·
`variable_overrides` documented and justified per state, both `m`-slider dual-override risks (S3 AND
S6) flagged, not just one ✓ · board mark scheme DEFERRED (Rule 20 [D]) ✓ · 9 clusters × 5 real-student
phrasings ✓ · 6 short factual constraints ✓ · numeric sanity checks run independently in Python for
every state (§10), all matched the skeleton to the last printed digit ✓ · motion timeline a pure
function of the state clock, zero `pause_after_ms` anywhere (Rule 26/31) ✓ · Rule 32 cause-before-effect
honoured in every state (the force/arrow is present from `t=0`, the crate's motion follows) ✓ · **word
budget (machine-counted, §10): S1 43 · S2 55 · S3 47 · S4 55 · S5 54 — all inside their tabled ranges;
S6 0/open** ✓ · notation ladder 38c: every formula surface is algebra-only (no calculus, no vector
dot/cross notation) — S1–S4/S6 core-ring, S5 the sole extended-ring state, still algebra-only ✓ ·
dialect 38d: no board-divergent term needed here (no "cell"/"battery" ambiguity in this concept) ✓ ·
engine bug queue consulted; both flagged prevention rules satisfied by explicit per-state design ✓ ·
DC Pandey check: nothing imported — every worked number, every anchor sentence, and all nine cluster
phrase sets were authored fresh from the skeleton's own physics, never from a textbook page ✓ ·
f-4 boundary swept: zero occurrences of "kinetic energy" / "energy" / "ΔK" in any narration, caption,
or formula surface ✓ · f-5 swept: exactly one narration clause (S5 sentence 3) acknowledges friction's
unbarred work, verbatim ✓ · f-6 swept: every `tts_sentences[].glow` value is one of the six verified
ids; S4's third sentence and none of S6's (0/open) carry a glow binding, by design ✓.

---

## 10. Independent arithmetic verification (Python, run before any narration was written)

Every figure below was computed from first principles (Newtonian kinematics + `N = mg − F sin θ`),
independently of the skeleton, then compared against it. **All matched exactly; nothing is refuted.**

| Check | Recomputed | Skeleton claims | |
|---|---|---|---|
| S1: `a`, loop d(2000ms), loop peak | 4.000 m/s², 8.000 m, 160.0 J | 4.000, 8.00, 160.0 | ✓ |
| S1: pin(1200ms phase) d / W / v | 2.880 m / 57.60 J / 4.80 m/s | 2.88 / +57.6 / 4.8 | ✓ |
| S2: `f`, `a`, t_stop, d_stop | 19.60 N, −3.920 m/s², 1.53061 s, 4.59184 m | 19.6, −3.920, 1.531, 4.592 | ✓ |
| S2: W at stop (two independent routes: `f·d` and `−½mv₀²`) | −90.000 J both routes | −90.0 J ≡ −½mv₀² | ✓ |
| S2: end position | −0.808 | −0.81 | ✓ |
| S3: loop d(2400ms), end, pin(1440ms) d | 7.200 m, +1.800, 4.320 m | 7.20, +1.8, 4.32 | ✓ |
| S4: breakaway check | 30 N > maxStat 19.6 N | 30 > 19.6 ✓ | ✓ |
| S4: `a`, loop d(2000ms), end, loop peak (applied) | 2.080 m/s², 4.160 m, −1.240, 124.80 J | 2.080, 4.16, −1.24, 124.8 | ✓ |
| S4: pin(1200ms) d / W_applied / W_friction / W_net | 1.4976 m / 44.928 / −29.353 / 15.575 J | 1.50 / +44.9 / −29.4 / +15.6 | ✓ |
| S5: along-component, N | −12.500 N, 27.34936 N | −12.5, 27.3 | ✓ |
| S5: `f_k`, `a` | 17.77709 N, −6.05542 m/s² | 17.777, −6.055 | ✓ |
| S5: t_stop, d_stop | 1.32113 s, 5.28452 m | 1.321, 5.285 | ✓ |
| S5: `W_pull`, `W_friction`, sum vs `−½mv₀²` | −66.057 J, −93.943 J, sum −160.000 J ≡ −160.000 J | −66.1, −93.9, −160.0 | ✓ |
| S5: end position | −0.1155 | −0.12 | ✓ |
| **S5 permanence envelope** — numeric search over θ ∈ [0°,180°] in 0.01° steps for `max(\|F cos θ\| / N(θ))` | **binding at θ = 30.68° (and, by symmetry, 149.32°), required μₛ = 0.59322** | μₛ ≈ 0.60, binding near θ ≈ 149.3° | ✓ (the search independently confirms the 30.68°/149.32° symmetry pair the skeleton names one side of) |
| S5 permanence: margin at authored μₛ = 0.65 | maxStat 23.559 N vs drive 21.501 N → **ratio 1.0957 (9.57% margin)** | margin 1.096 (9.6%) | ✓ |
| S5: min `N` over 0…180° (lift-off check) | 24.000 N at θ = 90° | 24.0 N, no lift-off | ✓ |
| S5: no restart from rest check | `μₛ·mg = 31.85 N` > max drive 25 N | 25 < 31.85 ✓ | ✓ |
| S5: seized-run bound audit at θ=90° | `a = −3.12 m/s²`, travel 10.256 m, end +4.856 | ≤10.26 m, end ≤+4.86 | ✓ |
| Word counts (machine-counted, script in this session) | S1 43, S2 55, S3 47, S4 55, S5 54 | targets 30–45 / 40–55 / 35–50 / 40–55 / 40–55 | ✓ all inside range |

**Nothing in the skeleton's physics was found wrong.** The one thing worth flagging as a genuine
independent finding (not a refutation — a confirmation with a sharper edge): the numeric θ-sweep
found the binding constraint occurs at a **symmetric PAIR of angles**, θ ≈ 30.68° and θ ≈ 149.32°
(both give the identical required μₛ = 0.5932, since `N(θ)` and `|cos θ|` are each symmetric about
90°). The skeleton names only the 149.3° side; both sides are simultaneously binding by construction,
which only makes the permanence envelope's margin argument stronger — the same 9.6% margin holds
approaching the stuck region from either the acute or the obtuse side of the slider's range. No
narration or DoD change follows from this; it is recorded here for the record.
