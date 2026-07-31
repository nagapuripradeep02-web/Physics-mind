I read all three binding documents in full, plus the tray's `scar_candidates.sql`, the as-built contract, and `tension_force.json` as the current in-fleet shape reference. Two engine findings are reported explicitly in §0 below rather than designed around.

---

# ARCHITECT SKELETON — `equilibrium_of_particles`

**chapter:** Laws of Motion (Class 11) · **engine:** `force_rig`, `apparatus: "force_table"` · **worktree:** `C:\Tutor\physics-mind-lom-g` (`feat/lom-g-offaxis`)
**designed against:** `docs/loop_runs/lom_g/_engine/force_rig_json_contract.md` (as-built — authoritative), `docs/FORCE_RIG_ENGINE_SPEC.md` §7, `docs/loop_runs/lom_g_state.md`
**downstream:** physics-author → json-author → quality-auditor → FOUNDER REVIEW (no founder-proxy on this tray)

---

## §0 — ENGINE FINDINGS (read before anything else)

Two founder-named design points **cannot be built as described** on the engine as it exists. Neither is designed around silently; both are reported here per the under-generalization instruction. **Neither requires a renderer edit** — one is a reframe that is arguably truer to the apparatus, the other is a deliberate cut.

### Finding 1 — "sweep one angle and watch BOTH other tensions change while the ring holds centre" is not achievable. RESOLVED BY REFRAME, no engine change requested.

On this apparatus **tension is an INPUT, not a solved output**: `T_i = m_i · g` exactly, fixed by the hanging mass (contract §Branch A; spec §2). The ring **position** is the solved output. Therefore:

- Sweeping `angle1` with masses fixed **cannot** change `T₂` or `T₃` — those numbers are nailed to their hangers.
- The ring **cannot** hold centre while an angle sweeps — the centre stops being the balance point the instant the geometry changes.

This is not an engine defect. It is what a **real** force table does, and the honest version of the beat is *better*: sweep `angle1` and the ring **continuously tracks a moving balance point**, never leaving it. Balance is still shown to be a live condition rather than a lucky pose — the thing that moves is the *place* where balance lives, and that is a rendered object (the ring's path), not an asserted number. Built as **STATE_4**.

If the founder wants tensions to be the solved quantity, that is a different apparatus (a spring-balance rig where the strings are elastic), i.e. a genuine engine request — **not** recommended, since `T = m·g` exactly is the whole teachability of the force table.

### Finding 2 — Lami's theorem is CUT. It cannot be rendered honestly here.

Lami reads `T₁/sin α = T₂/sin β = T₃/sin γ`, each angle **opposite** its tension. To read it "straight off the screen" a student must see the three inter-string angles. The engine as built exposes:

- **no** inter-string angle readout (`readouts` on branch A is closed: `T | sum_F | sum_Fx | sum_Fy`),
- **no** angle-arc primitive (the `glow_focal` id list contains no arc/angle object).

Authored DOM annotations stating "α = 127°" would be **stale the moment the ring moves off centre** (every guided state has motion, by design), and the ratio values would be authored text rather than live readouts — i.e. a caption asserting physics the picture does not show. That is exactly the failure the founder rejected on `newton_third_law` (*"an INTERACTION must be a rendered object, not asserted arrows"*).

**Verdict:** Lami gets no state and no formula surface. It survives as one optional sentence in the physics block for the teacher's own use. **If the founder wants Lami as a state, the engine needs two things it does not have — an inter-string `angle` readout and an angle-arc drawable — and that is the under-generalization signal, reported not worked around.** The advanced-ring slot is left EMPTY as a consequence (justified in §3).

### Finding 3 — three authored quantities are UNVERIFIED and must be measured, not assumed

physics-author must measure each with `npx tsx src/scripts/_scratch_fr_seams.ts` (extend it locally; do not commit engine changes) and trim the authored value if it fails:

| # | What must be measured | Fails if | Fallback |
|---|---|---|---|
| V1 | Settle duration for STATE_2 / STATE_3 at the authored `ring_mass_kg` + `damping` | settle < ~5 s (motion far shorter than narration) | raise `ring_mass_kg`, lower `damping` until 2–3 visible overshoots over ~6–8 s. Implicit drag is unconditionally stable (scar candidate 2), so low damping is safe — only oscillatory |
| V2 | `\|p\|` across the STATE_4 angle sweep and the STATE_5 / STATE_6 mass ramps | `\|p\| > 0.13 m` at any instant (table radius 0.25 m; ring must never approach the rim) | trim the ramp `to` value until it holds |
| V3 | Whether a visible slider row tracks a live `param_ramp` (STATE_4 shows `angle1` while ramping it) | the row's handle does not move with the ramp | author `controls_visible: []` on STATE_4 |

### Finding 4 — scar candidate 1 is OPEN and this concept is its named victim

`field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line` is `OPEN`, `concepts_affected` includes `equilibrium_of_particles`. **Every tension arrow in this concept is collinear with its own string.** The arrows are the taught object of the whole state table. eye-walker must be told explicitly: for every state, confirm each tension arrow's **shaft** is distinguishable from its string and each **tip position is proportional to magnitude** — a full-pass assertion suite is not evidence that anything is visible.

**Engine bug queue consultation:** no DB access from this worktree, and the tray forbids DB writes. Consulted the local mirror `docs/loop_runs/lom_g/_engine/scar_candidates.sql` (5 rows) in full. Candidates 1 and 2 are the architect-relevant ones and are satisfied: candidate 1 is escalated to the EYE brief above (it cannot be satisfied by authoring — it is a renderer defect, so it is FLAGGED to quality-auditor for Gate 8 as a documented exception); candidate 2 is a renderer-internal integrator rule with no authoring surface. Candidates 3–5 are whirl/regression-sample rows, not applicable.

**DC Pandey / NCERT check:** consulted NCERT Class 11 Ch.5 (Laws of Motion) and DC Pandey Ch. "Laws of Motion" **tables of contents only**, to confirm equilibrium of concurrent forces sits in this chapter and is a distinct sub-topic from friction and from connected bodies. **No teaching sequence, no example problem, no figure reference, no explanation phrasing imported.** Teaching is authored from first principles.

---

## §1 — ATOMIC CLAIM

**This concept teaches that a particle acted on by several concurrent forces is in equilibrium when, and only when, the vector sum of those forces is zero — which means each direction balances on its own (ΣFₓ = 0 AND ΣF_y = 0) — and only that.**

It does **not** cover: friction as one of the balancing forces (→ `friction_force`, `friction_static_kinetic`), equilibrium on an incline (→ `block_on_incline`, `inclined_plane_components`), connected bodies and shared acceleration (→ `connected_bodies`, `tension_force`), torque or rotational equilibrium (out of chapter — this is a **particle**, a point, so there is no lever arm), Lami's theorem (cut, §0 Finding 2), or non-concurrent/distributed forces.

---

## §2 — STATE COUNT + ARC

**7 states: 6 guided + 1 explore.**

**Justification against the §5 calibration table (medium = 5–6, complex = 7–9):** this sits at the top of *medium*. The core claim is one equation, but it has three genuinely separate teachable faces — (a) the apparatus reads tension directly off a hanging mass, so arrow length means something; (b) the sum being zero while the parts are large; (c) the components being independent — and one high-value consequence (the cable-angle law) that the founder named as the state a teacher will remember, which needs a **contrast pair** to land. 7 is the count at which no state is derivable from the one before it. It is also close to the engine's natural ceiling: this apparatus supports roughly four genuinely distinct motion archetypes (§3), so a longer arc would necessarily start repeating pictures.

**The arc:**

| # | Purpose (one line) | teaching_method |
|---|---|---|
| STATE_1 | The apparatus reads tension directly: each string pulls with exactly the weight hanging on it, and arrow length shows it | *(straightforward motion beat — no `teaching_method` field; Rule 31)* |
| STATE_2 | Three unequal pulls, all still there, and the resultant collapses to a dot — the ring stops and stays | straightforward motion beat |
| STATE_3 | The two directions balance separately: one component sum can be zero while the other is not | straightforward motion beat |
| STATE_4 | Balance is a live condition — move a pulley and the balance point moves; the ring tracks it | straightforward motion beat |
| STATE_5 | Steep support cables: each cable pulls **less** than the load it holds | straightforward motion beat |
| STATE_6 | Flat support cables: each cable pulls **far more** than the load, and the sag grows fast — a rope cannot be pulled perfectly straight | straightforward motion beat |
| STATE_7 | Explore — every mass and both angles live | `exploration_sliders` |

**No state uses `narrative_socratic`. No `wait_for_answer`. No `pause_after_ms`.** (Rule 31.)

---

## §3 — PER-STATE CHOREOGRAPHY + CONTROL PLAN (Rule 31 — the required first design artifact)

### The archetype vocabulary available on this engine

This apparatus offers exactly four honest motion drivers: (i) release the ring off centre and let it settle; (ii) ramp a hanging mass; (iii) ramp a pulley angle; (iv) teacher drag. Everything below is built from those. Coined archetypes and their justifications are declared, and **every repeat is a declared contrast pair whose delta names the flip**:

| Archetype | Definition | Used in |
|---|---|---|
| `mass-ramp-track` | a hanger grows, its arrow lengthens, the ring drifts **diagonally** to a new balance point | STATE_1 |
| `release-and-settle` | the ring opens displaced, returns, comes to rest; ΣF shrinks continuously to a dot | **STATE_2 / STATE_3 — declared contrast pair** |
| `angle-ramp-track` | a pulley sweeps around the rim; the ring traces the **moving** balance point | STATE_4 |
| `axis-locked-sag` *(coined)* | symmetric fixture; the load hanger grows and the ring travels along a **straight line** to a deeper balance point — the taught quantity is the ring's **displacement**, not its destination | **STATE_5 / STATE_6 — declared contrast pair** |

**Coining justification for `axis-locked-sag`:** the fixture is mirror-symmetric about the load axis, so the ring's motion is a straight line along that axis — exactly and provably (the two support strings stay mirror images at every ring position). That constrained straight-line sag is a qualitatively different picture from `mass-ramp-track`'s free 2-D drift, and the sag *distance* is the object being taught. **Honest disclosure for the auditor:** STATE_1, STATE_5 and STATE_6 all use a mass ramp as their *driver*. They are separated by picture, focal object and readout — STATE_1 hides the resultant, glows `fr_arrow_1` and teaches **arrow length** (readout `T` only); STATE_5/6 glow `fr_ring` and teach **ring displacement**. If the auditor judges this too thin a separation, the correct fix is to merge STATE_1 into STATE_2, not to invent a fifth archetype.

### The control table

| State | Teaches (one aspect) | Archetype | Delta line (= the ≤5-word on-canvas cue) | Distinct motion — what animates | `controls_visible` | Narration budget (EN words) | Duration | `depth_ring` | `advance_mode` |
|---|---|---|---|---|---|---|---|---|---|
| **STATE_1** | Tension = the hanging weight, exactly; arrow length is proportional to it | `mass-ramp-track` | **"Heavier hanger, longer arrow"** | Hanger 1's weight grows 3.0→5.0 kg over 9.2 s; arrow 1 lengthens 29.4→49.0 N in step; the ring then drifts diagonally to a new balance point (the effect, following the cause) | `[]` | 34–42 | 14 s | core | `manual_click` |
| **STATE_2** | ΣF = 0 is a real physical condition: the pulls cancel, they are not gone | `release-and-settle` | **"Resultant shrinks to a dot"** | Ring opens displaced 0.124 m, swings back with 2–3 visible overshoots, comes to rest at centre; the ΣF arrow shortens continuously the whole way and ends as a dot; all three tension arrows stay full length throughout | `[]` | 30–38 | 13 s | core | `manual_click` |
| **STATE_3** | The two directions are independent: ΣF_y can be exactly zero while ΣFₓ is not | `release-and-settle` **(pair member 2 — flip: the return is a straight line, not a diagonal; ΣF_y is pinned at 0.00 N the entire way while ΣFₓ alone drives the ring home)** | **"Vertical sum stays at zero"** | Four-string cross; ring opens displaced 0.13 m along +x **only**; returns along a perfectly straight line; `ΣFₓ` readout climbs −36 N → 0.00 N while `ΣF_y` reads 0.00 N at every instant | `[]` | 34–44 | 13 s | extended | `manual_click` |
| **STATE_4** | Balance is a live condition, not one lucky arrangement — change the geometry and the balance point moves | `angle-ramp-track` | **"Pulley moves, balance moves"** | Pulley 1 sweeps 0° → 40° around the rim over 9 s; the ring continuously tracks the moving balance point, tracing a curved path; `ΣF` stays near 0 the whole sweep | `["angle1"]` *(see §0 V3)* | 32–42 | 14 s | extended | `manual_click` |
| **STATE_5** | With steep support cables, each cable's pull is **smaller** than the load it holds | `axis-locked-sag` | **"Steep cables, small tension"** | Supports fixed at 60°/120°, 3.0 kg each; the load hanger grows 3.0→5.0 kg over 9 s; the ring travels straight down the vertical axis from ≈ +0.144 m to ≈ +0.028 m; readouts end at supports 29.4 N vs load 49.0 N | `[]` | 32–42 | 14 s | extended | `manual_click` |
| **STATE_6** | **PRIMARY AHA.** Flatten the cables and each pull becomes far larger than the load, and the sag grows — a rope can never be pulled perfectly straight | `axis-locked-sag` **(pair member 2 — flip: identical load ramp, identical release, cables at 17° instead of 60°; the sag is far larger and each cable now reads 49.0 N instead of 29.4 N for the same job)** | **"Flat cables, much larger tension"** | Supports fixed at 17°/163°, 5.0 kg each (the maximum this apparatus offers); the same load ramp 3.0→5.0 kg over 9 s; the ring sags straight down ≈ 65 mm and keeps going as the load grows — the only way the cables can carry more is by sagging further | `[]` | 38–48 | 14 s | extended | `manual_click` |
| **STATE_7** | Explore | `drag-sandbox` | **"Change any mass or angle"** | Opens displaced 0.10 m so it is alive on entry and settles; thereafter every teacher drag drives live continuous motion (Rule 37 — never freezes) | `["m1","m2","m3","angle1","angle2"]` | 0 / open | 0 (open) | core | `interaction_complete` |

**Rule 15 check:** `manual_click` × 6 + `interaction_complete` × 1 = 2 distinct modes. ✓

### Rule 32 legibility plan (per state)

- **32a cause before effect.** Every state's driver is a `param_ramp` starting at `start_ms: 1000` (STATE_1: 800) or a `ring_start_offset_m`. In every ramp state the **cause is visible first**: the hanger visibly grows / the pulley visibly moves for the first beat, and the ring's response follows as the imbalance builds — never simultaneous, because the ring is damped and integrated.
- **32b only the taught variable moves.** One `param_ramp` per state, one parameter. All other strings, masses and pulleys hold their authored pose. STATE_2/STATE_3 ramp nothing at all — only the released ring moves. STATE_7 exempt.
- **32c delta cue.** The "Delta line" column above **is** the on-canvas top caption verbatim (Rule 34a: caption = the ≤5-word cue only; prose narration lives in the strip below).
- **32d home pose, no teleport.** The **home pose is the 3-4-5 fixture** (3.0 kg @ 0°, 4.0 kg @ 90°, 5.0 kg @ 233.13°, ring at centre) and it is the opening pose of STATE_1, STATE_2, STATE_4 and STATE_7. STATE_3 changes to the four-string cross and STATE_5/6 to the sign-hanger fixture — both are **declared, narrated apparatus changes** ("now four strings", "now two support cables and a load"), not silent teleports, and the table, rim and ring never move or change. Camera is `[0, 3.4, 9.2]` on **every** state — it never cuts.
- **32e one glow focal.** Exactly one per state, listed in the config sketch (§9): `fr_arrow_1` / `fr_resultant` / `fr_ring` / `fr_pulley_1` / `fr_ring` / `fr_ring` / `fr_ring`.

### Rule 34 canvas budget (per state)

- ONE formula surface each (`formula_overlay`, math-serif Unicode): S1 `T = m g` · S2 `ΣF = 0` · S3 `ΣFₓ = 0 , ΣF_y = 0` · S4 `ΣF = 0` · S5 **and** S6 `T = W / (2 sin θ)` *(the same law twice is the entire point of the pair — same equation, different θ, different answer)* · S7 `ΣF = 0` **(core-ring only, per Rule 38b — the explore state must NOT carry the extended-ring cable formula)**.
- On-canvas caption = the ≤5-word delta cue only. HUD = value-only readouts (`T₁ = 29.4 N`, `ΣF = 0.00 N`, `ΣFₓ = 0.00 N`).
- All math Unicode: `Σ θ ° ₁ ₂ ₃ ₓ ·`. **No ASCII transcription anywhere** — and the sweep must cover all three text paths (concept-JSON DOM overlays, canvas-drawn text, 3D sprite labels).
- HUD clears the review chrome (`top: 52px`+). Formula surface left-centre; readouts and formula occupy distinct zones.

### Rule 33 macro↔micro

**Declared N/A with justification.** The taught variable (net force on a particle) is macroscopic and its mechanism is macroscopic — there is no micro level to link, so 33a–33c do not apply. **33d does apply and is binding:** every state carries live numeric readouts (`T`, `sum_F`, `sum_Fx`, `sum_Fy`) that change with the physical change, never a decorative dial. The `ΣF` **arrow itself is the instrument** — its length is the reading, and its collapse to a dot is the zero.

---

## §4 — MISCONCEPTION CONFRONTATION PLAN (Rule 16a)

**Two hooks for the whole concept, both at genuine pivots.** Five states carry **no** `misconception_watch` — they are straightforward teaching. (Founder guardrail 2026-07-04.) **No EPIC-C branches** (EPIC-L-first directive 2026-06-10).

### Hook 1 — STATE_2 · *the one the apparatus PROVES*

- **belief:** "If something is not moving, there is no force on it — the forces have been switched off."
- **contrast beat (straight, no predict-pause):** the state OPENS with the ring displaced and visibly moving, so the forces are obviously acting. It comes to rest — and **the three tension arrows are still at full length, the three hangers still hang, and the readouts still show 29.4 N, 39.2 N and 49.0 N.** The only thing that is zero is the resultant, and it is zero as a **dot**, on screen, next to three long arrows.
- **visual_counter:** three full-length tension arrows of three different lengths beside a resultant collapsed to a single dot, with a still ring.
- **one_line_fix:** "At rest the pulls cancel each other — they are still there."
- *This same frame also kills the sibling belief "balanced means the forces are equal in size", because the three numbers on screen are 29.4, 39.2 and 49.0 N and the ring still holds. That is named in the narration; it does not need a second hook.*

### Hook 2 — STATE_6 · *the primary-aha pivot*

- **belief:** "Pull a rope hard enough and you can make it perfectly straight" / "a flatter cable is under less strain because it barely leans."
- **contrast beat:** the wrong expectation's consequence first — the cables are pulled almost flat and each is at 49.0 N, the **maximum** this apparatus can supply, holding a load of only 29.4 N. Then the load grows, and the only thing that happens is that the ring **sags further**. There is no setting of the sliders that makes the sag go away; the sag is how the cable carries the load at all.
- **visual_counter:** support tension 49.0 N against a 29.4 N load at 17°, versus STATE_5's 29.4 N against 49.0 N at 60° — same apparatus, same ring, one number three times bigger.
- **one_line_fix:** "The flatter the cable, the larger the tension needed — at perfectly straight it would be infinite."

---

## §5 — `has_prebuilt_deep_dive` STATES

Two states flagged `true` (cache hint only — every state shows the Explain button; un-flagged states route to the feedback form, Rule 18):

1. **STATE_3** — components. This is the historical sticking point: students accept ΣF = 0 as a slogan and cannot turn it into two equations. It is also the Pass-1 prerequisite cliff (§7 Block 1), so flag and cliff agree.
2. **STATE_6** — the cable-angle law. The primary aha and the state whose "why does it blow up?" question a teacher will be asked immediately. Flag and aha agree.

*(STATE_4 was considered and rejected — it is conceptually easy once STATE_2 has landed.)*

Cross-reference: both flagged states carry Pass-1 cliff sentences; no divergence to document.

---

## §6 — DRILL-DOWN CLUSTERS

**STATE_3 (components):**
- `why_two_equations_not_one` — why a single "the forces balance" statement has to become two separate sums.
- `choosing_the_axes` — the axes are a choice; any pair of perpendicular directions works, and picking one along a string kills a term.
- `sign_of_a_component` — a component pointing along −x enters the sum as a negative number, not as a separate "backwards force".

**STATE_6 (cable-angle law):**
- `why_tension_blows_up_near_flat` — where the `1 / sin θ` comes from and why it has no ceiling.
- `why_cables_and_ropes_always_sag` — the sag is the mechanism, not a defect in the rope.
- `tension_larger_than_the_load` — how a cable can pull harder than the weight it holds without violating anything.

physics-author fleshes out `trigger_examples` per cluster.

---

## §7 — TWO-PASS COGNITIVE LENS

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.**
- `vector_resolution` — **breaks at STATE_3.** A student who has never resolved a vector will see two readouts and not know why there are two. **Patch (added to STATE_3's choreography):** the state's motion makes resolution unnecessary to *follow* — the ring's return is a straight line along x, `ΣF_y` sits at exactly 0.00 N for the whole return, and `ΣFₓ` visibly drives it home. The idea arrives as two numbers behaving differently, which is readable cold; a student who already has resolution simply reads it faster. No condescension, no re-teaching of resolution.
- `newton_first_law` — **breaks at STATE_2.** A student without it does not know why "zero net force" should mean "stays put". **Patch:** STATE_2 does not assert it, it shows it — the ring moves, stops, and then stays stopped for the rest of the state while the arrows remain.
- `tension_force` — **breaks at STATE_1.** A student who does not know a string pulls along its own line will misread the arrows. **Patch:** STATE_1's one sentence establishing "the string pulls toward its own pulley, with exactly the weight hanging on it" is the state's foundation sentence; the growing hanger and lengthening arrow prove it in the same breath.

**JEE-backwards trace.**
> *A sign of weight 200 N hangs from a point supported by two cables, each making 15° with the horizontal. Find the tension in each cable.*

| Piece the student needs | Delivered by |
|---|---|
| The junction point is a particle in equilibrium: ΣF = 0 | **STATE_2** |
| That resolves into two independent equations, ΣFₓ = 0 and ΣF_y = 0 | **STATE_3** |
| Each cable's tension acts along the cable, toward its support | **STATE_1** |
| By symmetry the horizontal parts cancel and the vertical parts share the load: 2T sin θ = W | **STATE_5** (steep case, worked in numbers on screen) |
| Why the answer is *much bigger* than 200 N at 15°, and why that is not an arithmetic slip | **STATE_6** |

No missing piece. No state added.

**Misconception entry mapping.**
- *"Equilibrium means no forces"* — proactively confronted at **STATE_2** (Hook 1). **Planting risk:** STATE_2's own narration must never say "the forces cancel out" in a way that reads as "the forces disappear". Phrase as "the pulls cancel **each other**" and keep the arrows on screen — flagged to physics-author as a wording constraint at the planting moment.
- *"A rope can be pulled perfectly straight"* — proactively confronted at **STATE_6** (Hook 2). **Planting risk:** STATE_5 deliberately builds the confident-wrong belief ("steep cables hold this easily, cables are no big deal") — that is the setup, and it is intentional, but STATE_5's narration must not generalise ("cables carry less than the load") without the qualifier "**when the cables are steep**". Flagged.

### Block 2 — Aha-moment designation

- **PRIMARY aha (STATE_6):** *A cable can only carry a load by sagging — the flatter you pull it, the harder it pulls, and it can never be pulled perfectly straight.*
- **SUPPORTING aha (STATE_2):** *Three pulls of three different sizes can add to nothing: the resultant shrinks to a dot while all three arrows stay at full length.*
- **Cohesion check.** The supporting aha directly sets up the primary: the blow-up at STATE_6 is **only** legible to a student who already accepts that a set of unequal pulls can sum to zero, because the cable law is that zero-sum rewritten for a symmetric pair (`2T sin θ = W`). Two ahas, not three. The candidate third (STATE_4's "balance is a live condition") was tested and **rejected** as an aha — it reinforces the supporting aha rather than standing on its own, so it stays a plain teaching state.
- **Wrong-belief setup.** For the PRIMARY: **STATE_5** builds the confident-wrong belief (steep cables hold the load with tension *below* the load — "cables are easy"), and STATE_6 breaks it with the identical ramp at a different angle. For the SUPPORTING: **STATE_1** builds it (bigger hanging mass → bigger pull → the ring moves; force means motion), and STATE_2 breaks it (the pulls are all still there and it does not move).
- **Foundational-coverage rule.** The PRIMARY aha (STATE_6) is **outside** `entry_state_map.foundational` (STATE_1–STATE_4). Therefore a **mandatory exit-pill** is declared from `foundational` into the `cables` slice — see §8. Requirement satisfied.

---

## §8 — `entry_state_map`

```
entry_state_map:
  foundational:  STATE_1 → STATE_4     # "what is equilibrium", "why doesn't it move", components
  cables:        STATE_5 → STATE_6     # "why does a tight rope pull so hard", two-cable support problems
  explore:       STATE_7

  exit_pills:
    foundational_to_cables:  "Why does a tight rope pull so hard? →"    # MANDATORY (Block 2)
```

Default aspect = `foundational`. Valid `aspect` values the classifier may return: `foundational`, `cables`, `explore`.

---

## §9 — PER-STATE `force_rig` CONFIG SKETCH (design against this, not against the spec)

**Top level (`field_3d_config`):**

```jsonc
"scenario_type": "force_rig",
"explorer_id": "force_rig_explorer",
"slider_controls": {
  "m1":     { "min": 1.2, "max": 5.0, "step": 0.1, "default": 3.0, "label": "m₁", "dp": 1 },
  "m2":     { "min": 1.2, "max": 5.0, "step": 0.1, "default": 4.0, "label": "m₂", "dp": 1 },
  "m3":     { "min": 1.2, "max": 5.0, "step": 0.1, "default": 5.0, "label": "m₃", "dp": 1 },
  "angle1": { "min": 0, "max": 359, "step": 1, "default": 0,  "label": "θ₁", "dp": 0 },
  "angle2": { "min": 0, "max": 359, "step": 1, "default": 90, "label": "θ₂", "dp": 0 }
}
```

**`camera_position: [0, 3.4, 9.2]` on every state** (contract §Shared — the value that framed the fixture acceptably). Never changed between states (Rule 32d).

**THE HOME FIXTURE (the 3-4-5 trio — the harness's own S3 fixture, exactly balanced at the centre):**

```
s1: angle_deg   0.00, hanging_mass_kg 3.0 → T₁ = 29.4 N    →  ( +29.4,   0.0 )
s2: angle_deg  90.00, hanging_mass_kg 4.0 → T₂ = 39.2 N    →  (   0.0, +39.2 )
s3: angle_deg 233.13, hanging_mass_kg 5.0 → T₃ = 49.0 N    →  ( −29.4, −39.2 )
                                                     Σ  =  (   0.00,  0.00 )  ✓
```
All three masses in the mandatory `[1.2, 5.0]` band; all three tensions (29.4 / 39.2 / 49.0 N) above the ~11.5 N arrow floor and below the 58.3 N cap, so **arrow length ∝ magnitude holds for every arrow in this concept.**

---

### STATE_1 — "Tension Equals the Hanging Weight" · core · `manual_click` · 14 s

```jsonc
"caption": "Heavier hanger, longer arrow",
"formula_overlay": "T = m g",
"show_sliders": true,
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 0.12, "damping": 40,
    "strings": [
      { "id": "s1", "angle_deg":   0.00, "hanging_mass_kg": 3.0, "label": "T₁", "color": "#FFD166" },
      { "id": "s2", "angle_deg":  90.00, "hanging_mass_kg": 4.0, "label": "T₂", "color": "#42A5F5" },
      { "id": "s3", "angle_deg": 233.13, "hanging_mass_kg": 5.0, "label": "T₃", "color": "#EF5350" }
    ],
    "show_resultant": false, "show_components": false
  },
  "arrows":   [{ "show": ["tension"] }],
  "readouts": ["T"],
  "controls_visible": [],
  "glow_focal": "fr_arrow_1",
  "param_ramp": { "param": "m1", "from": 3.0, "to": 5.0, "start_ms": 800, "end_ms": 10000 }
}
```
Reveal pin = 10000 + 1600 = **11600 ms** → duration 14 s. Resultant deliberately OFF: this state is about one arrow and one number. End pose: ring off centre (3-4-5 becomes 5-4-5) — STATE_2 restores the home pose and opens by moving, so there is no static teleport frame.

---

### STATE_2 — "Balanced: the Resultant Is Zero" · core · `manual_click` · 13 s · **SUPPORTING AHA · Hook 1**

```jsonc
"caption": "Resultant shrinks to a dot",
"formula_overlay": "ΣF = 0",
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 0.25, "damping": 12,      // ← tune per §0 V1 for a 6–8 s visible settle
    "ring_start_offset_m": [0.115, 0.045],
    "strings": [ /* HOME FIXTURE, verbatim */ ],
    "show_resultant": true
  },
  "arrows":   [{ "show": ["tension", "resultant"], "labels": { "resultant": "ΣF" } }],
  "readouts": ["T", "sum_F"],
  "controls_visible": [],
  "glow_focal": "fr_resultant"
}
```
No `param_ramp` — the released ring is the motion. `|offset| = 0.124 m ≤ 0.15` ✓.

---

### STATE_3 — "Each Direction Balances Separately" · extended · `manual_click` · 13 s

```jsonc
"caption": "Vertical sum stays at zero",
"formula_overlay": "ΣFₓ = 0 , ΣF_y = 0",
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 0.25, "damping": 12,
    "ring_start_offset_m": [0.13, 0.0],
    "strings": [                                     // four-string cross (max 4 ✓)
      { "id": "s1", "angle_deg":   0, "hanging_mass_kg": 3.0, "label": "T₁", "color": "#FFD166" },
      { "id": "s2", "angle_deg": 180, "hanging_mass_kg": 3.0, "label": "T₂", "color": "#FFD166" },
      { "id": "s3", "angle_deg":  90, "hanging_mass_kg": 4.0, "label": "T₃", "color": "#42A5F5" },
      { "id": "s4", "angle_deg": 270, "hanging_mass_kg": 4.0, "label": "T₄", "color": "#42A5F5" }
    ],
    "show_resultant": true
  },
  "arrows":   [{ "show": ["tension", "resultant"], "labels": { "resultant": "ΣF" } }],
  "readouts": ["sum_Fx", "sum_Fy", "T"],
  "controls_visible": [],
  "glow_focal": "fr_ring"
}
```
**Why this is exactly true, not approximately:** with the ring anywhere on the x-axis, the ±y strings are mirror images about that axis, so their y-components cancel identically — `ΣF_y` reads **0.00 N at every instant** — and the ±x pair cancels everywhere on the axis, so the whole restoring force is the ±y pair's x-components (≈ −36.2 N at release, → 0 at centre). The ring therefore returns along a **perfectly straight line** and never leaves the axis. That is the state's entire argument, rendered rather than asserted.

---

### STATE_4 — "Balance Moves When a Pulley Moves" · extended · `manual_click` · 14 s

```jsonc
"caption": "Pulley moves, balance moves",
"formula_overlay": "ΣF = 0",
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 0.12, "damping": 40,
    "strings": [ /* HOME FIXTURE, verbatim */ ],
    "show_resultant": true
  },
  "arrows":   [{ "show": ["tension", "resultant"], "labels": { "resultant": "ΣF" } }],
  "readouts": ["T", "sum_F"],
  "controls_visible": ["angle1"],        // ← §0 V3: if the row does not track a live ramp, author []
  "glow_focal": "fr_pulley_1",
  "param_ramp": { "param": "angle1", "from": 0, "to": 40, "start_ms": 1000, "end_ms": 10000 }
}
```
Pin = **11600 ms** → duration 14 s. **§0 V2 applies:** measure `|p|` across the whole 0°→40° sweep and trim `to` until `|p| ≤ 0.13 m` throughout. The teaching survives a smaller sweep intact — the point is that the balance point *moves continuously*, not how far.

---

### STATE_5 — "Steep Cables Pull Less" · extended · `manual_click` · 14 s

The load is authored as **`strings[0]`** deliberately, so that `param_ramp.param: "m1"` (the only mass the engine can ramp) ramps **the load**, keeping both supports symmetric.

```jsonc
"caption": "Steep cables, small tension",
"formula_overlay": "T = W / (2 sin θ)",
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 0.12, "damping": 40,
    "strings": [
      { "id": "s_load",  "angle_deg": 270, "hanging_mass_kg": 3.0, "label": "W",  "color": "#EF5350" },
      { "id": "s_left",  "angle_deg": 120, "hanging_mass_kg": 3.0, "label": "T₁", "color": "#FFD166" },
      { "id": "s_right", "angle_deg":  60, "hanging_mass_kg": 3.0, "label": "T₂", "color": "#FFD166" }
    ],
    "show_resultant": false
  },
  "arrows":   [{ "show": ["tension"] }],
  "readouts": ["T"],
  "controls_visible": [],
  "glow_focal": "fr_ring",
  "param_ramp": { "param": "m1", "from": 3.0, "to": 5.0, "start_ms": 1000, "end_ms": 10000 }
}
```
**Predicted motion (verify per §0 V2):** the fixture is mirror-symmetric about the vertical axis, so the ring travels straight down it. Balance requires `2 T_support sin θ_eff = W`; at load 3.0 kg the ring sits ≈ **+0.144 m**, at load 5.0 kg ≈ **+0.028 m** → a straight-line sag of ≈ **116 mm**, comfortably on the table. End readouts: supports 29.4 N each, load 49.0 N — **each cable pulls less than the load it holds.**

---

### STATE_6 — "Flat Cables Pull Much Harder" · extended · `manual_click` · 14 s · **PRIMARY AHA · Hook 2**

```jsonc
"caption": "Flat cables, much larger tension",
"formula_overlay": "T = W / (2 sin θ)",
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 0.12, "damping": 40,
    "strings": [
      { "id": "s_load",  "angle_deg": 270, "hanging_mass_kg": 3.0, "label": "W",  "color": "#EF5350" },
      { "id": "s_left",  "angle_deg": 163, "hanging_mass_kg": 5.0, "label": "T₁", "color": "#FFD166" },
      { "id": "s_right", "angle_deg":  17, "hanging_mass_kg": 5.0, "label": "T₂", "color": "#FFD166" }
    ],
    "show_resultant": false
  },
  "arrows":   [{ "show": ["tension"] }],
  "readouts": ["T"],
  "controls_visible": [],
  "glow_focal": "fr_ring",
  "param_ramp": { "param": "m1", "from": 3.0, "to": 5.0, "start_ms": 1000, "end_ms": 10000 }
}
```
**Predicted motion (verify per §0 V2):** identical ramp, identical release, cables at 17° instead of 60°. Balance at the centre would need a load of ≈ 2.92 kg, so the ring starts a little low and sags to ≈ **−0.065 m** by 5.0 kg — and the sag is the *only* way the cables can take the extra load. Readouts throughout: supports **49.0 N each** (the maximum this apparatus can supply) against a load of 29.4–49.0 N. Against STATE_5's 29.4 N, that is the whole argument in two numbers.

**Authoring note:** `17.00 / 163.00` is a starting value chosen for a clean readout. `angle_deg` is a continuous authored number (the `step: 1` band applies to the *slider row*, not to authored values), so physics-author may use the exact `θ = asin(W / 2T)` value if it makes the opening pose sit better.

---

### STATE_7 — "Explore: Change Any Mass or Angle" · core · `interaction_complete` · duration 0 (open)

```jsonc
"caption": "Change any mass or angle",
"formula_overlay": "ΣF = 0",                        // ← CORE ring only (Rule 38b) — NOT the cable formula
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 0.12, "damping": 40,
    "ring_start_offset_m": [0.10, 0.06],            // alive on entry: it settles, then stays live (Rule 37)
    "strings": [ /* HOME FIXTURE, verbatim — so m1/m2/m3 and angle1/angle2 bind to a balanced trio */ ],
    "show_resultant": true
  },
  "arrows":   [{ "show": ["tension", "resultant"], "labels": { "resultant": "ΣF" } }],
  "readouts": ["T", "sum_F", "sum_Fx", "sum_Fy"],
  "controls_visible": ["m1", "m2", "m3", "angle1", "angle2"],
  "trusted_drag_seizes": true,
  "glow_focal": "fr_ring"
}
```
Slider binding check (contract: `m<i>`/`angle<i>` → `strings[i-1]`): `m1`→s1, `m2`→s2, `m3`→s3, `angle1`→s1, `angle2`→s2. ✓ All five rows have a real target. The teacher can reproduce STATE_5/STATE_6 by hand here (drop `angle1`/`angle2` toward the horizontal and watch how much mass it takes) — which is where the cable law becomes *manipulable* rather than watched.

**Config-surface compliance audit (every state):** no `weight`/`normal`/`centripetal` arrow anywhere (branch-B only) · `resultant` and `centripetal` never co-authored (`centripetal` never authored at all) · no `omega`/`L`/`bob_mass` control ever authored · every `param_ramp.param` ∈ `{angle1, m1}` · every `hanging_mass_kg` ∈ `[1.2, 5.0]` · every `|ring_start_offset_m| ≤ 0.15` · ≤ 4 strings per state · exactly one `glow_focal` per state, every id from the branch-A list.

---

## §10 — PREREQUISITES (advisory only, Rule 23)

| concept_id | Status | Why |
|---|---|---|
| `newton_first_law` | shipped | "at rest ⟹ zero net force" is the logical hinge of STATE_2 |
| `tension_force` | shipped | a string pulls along its own line, toward its support |
| `vector_resolution` | shipped | components — the cliff at STATE_3 |
| `free_body_diagram` | shipped | reading a set of arrows on one body as one system |

Graph edge added: `newton_first_law` + `tension_force` + `vector_resolution` → **`equilibrium_of_particles`** → (`uniform_circular_motion`, next on this tray — it needs "a net force is required to change motion", which this concept establishes by showing the zero case).

---

## §11 — REAL-WORLD ANCHOR (Rule 35 — universal, culture-neutral; Rule 38f — widest syllabus overlap)

**Primary — a sign hanging from two cables.** A shop sign, a hanging light, a road sign: it hangs from a single point, and two cables run up to the wall on either side. The point where the cables meet is a particle in equilibrium — three pulls, one of them the weight of the sign. Every student has seen one; no country, brand or place is named. This is literally the STATE_5/STATE_6 fixture: the load string is the sign, the two support strings are the cables.

**Secondary — a washing line.** Pull a clothes line as tight as you can between two posts and it still dips in the middle. Hang something on it and it dips more. Pull harder to flatten it and the posts start to lean. That is the primary aha in an object a student can touch, and it is why the line can never be made perfectly straight.

**Why it hooks a Class 10–12 student:** the sign anchor turns an abstract "concurrent forces" statement into a question with an answer they can be surprised by — *the cables are pulling harder than the sign weighs.* The washing line then makes the surprise personal: they have all pulled a line tight and failed to remove the dip, and now they know why. Rule 38f is satisfied — a hanging sign and a clothes line appear in every syllabus this product ships to; no lab-specific apparatus (a real force table is used as the *instrument*, never as the *anchor*).

---

## §12 — DEFINITION OF DONE (Gate 0 — no TBDs)

**(a) Every EPIC-L state by id, one line of content**

| id | title (rail — first words carry the meaning) | content |
|---|---|---|
| STATE_1 | Tension Equals the Hanging Weight | ramp m₁ 3.0→5.0 kg; arrow 1 lengthens 29.4→49.0 N |
| STATE_2 | Balanced: the Resultant Is Zero | released off centre, settles; ΣF shrinks to a dot beside three full-length arrows |
| STATE_3 | Each Direction Balances Separately | four-string cross; straight-line return with ΣF_y pinned at 0.00 N |
| STATE_4 | Balance Moves When a Pulley Moves | angle1 sweeps 0°→40°; ring tracks the moving balance point |
| STATE_5 | Steep Cables Pull Less | load ramps 3.0→5.0 kg at 60°; supports read 29.4 N each |
| STATE_6 | Flat Cables Pull Much Harder | same ramp at 17°; supports read 49.0 N each and the sag grows |
| STATE_7 | Explore: Change Any Mass or Angle | all five controls live, `trusted_drag_seizes` |

**(b) Symbol-label table — every quantity the narration names → its exact on-canvas label**

| Narration says | On-canvas label | Where |
|---|---|---|
| "the tension in string one" | `T₁` | string sprite label + HUD `T₁ = 29.4 N` |
| "the tension in string two / three / four" | `T₂` `T₃` `T₄` | same |
| "the load" (STATE_5/6 only) | `W` | load-string sprite label + HUD `W = 29.4 N` |
| "the resultant" / "the sum of all the pulls" | `ΣF` | resultant arrow label + HUD `ΣF = 0.00 N` |
| "the sideways sum" | `ΣFₓ` | HUD `ΣFₓ = 0.00 N` |
| "the up-and-down sum" | `ΣF_y` | HUD `ΣF_y = 0.00 N` |
| "the hanging mass" | `m₁` `m₂` `m₃` | slider row labels (STATE_7) + hanger value text |
| "the angle the cable makes with the horizontal" | `θ` | formula surface only (no arc — §0 Finding 2) |
| "gravity" | `g` | formula surface only |

**Zero ASCII math anywhere** — `Σ θ ° ₁ ₂ ₃ ₓ ·` are Unicode, swept across DOM overlays, canvas-drawn text and 3D sprite labels (all three paths, Rule 34c).

**(c) Right-hand-rule plan — N/A.** No cross product, no circulation, no field direction in this concept. **The chemistry-style substitute does not apply either.** The direction discipline that *does* apply and is binding: **every tension arrow points from the ring toward its own pulley, always, in every state** — the engine solves it (`unit(pulley_i − p)`), the concept never authors a direction, and no arrow ever points outward from the ring away from a pulley.

**(d) Motion plan — what animates in every state:** STATE_1 hanger 1 + arrow 1 + ring drift · STATE_2 ring return + ΣF arrow shrinking · STATE_3 ring straight-line return + ΣFₓ readout · STATE_4 pulley 1 sweeping + ring tracking · STATE_5 load hanger + straight-line sag · STATE_6 load hanger + larger straight-line sag · STATE_7 settle on entry, then live under drag. **No state is static. No state's only delta is a glow change** (the `newtons_laws_body` scar).

**(e) Modes required:** conceptual only. **No `mode_overrides`** (Rule 20 [D] suspension). **No `epic_c_branches`** (EPIC-L-first directive).

**(f) `assessment` + `coverage_map` + `misconception_watch`:**
- `misconception_watch` on **STATE_2** and **STATE_6** only (§4). The other five states carry none.
- `assessment` — 6 questions, backward-designed, each with `distractor_misconceptions`, `teaches_state` and `parallel_form_stem`:

| q | tested_idea | teaches_state | keyed distractor to include |
|---|---|---|---|
| 1 | at rest ⟹ the pulls cancel, they are not absent | STATE_2 | "there are no forces on it" |
| 2 | balancing forces need not be equal in size | STATE_2 | "all three must be 39.2 N" |
| 3 | equilibrium requires **both** component sums to be zero | STATE_3 | "ΣFₓ = 0 is enough" |
| 4 | tension is set by the hanging weight, `T = mg` | STATE_1 | "tension depends on the string's angle" |
| 5 | symmetric two-cable support: `2T sin θ = W` | STATE_5 | "each cable carries W/2 regardless of angle" |
| 6 | as θ → 0 the tension grows without limit | STATE_6 | "at 0° the tension equals W" |

- `coverage_map.by_state` covers STATE_1, 2, 3, 5, 6; `non_assessed_states: [STATE_4, STATE_7]` (STATE_4 is a reinforcement beat, STATE_7 is a sandbox).
- Rule 19: every state's `scene_composition` carries ≥ 3 primitives — minimum set per state = delta-cue annotation, state label annotation, formula-surface annotation.

**(g) Macro↔micro plan (Rule 33) — N/A for a–c, binding for 33d.** See §3.

**(h) Canvas budget (Rule 34) — per state:** ONE formula surface (listed in §3), on-canvas caption = the ≤5-word delta cue only, HUD value-only, HUD clears `top: 52px`, no overlay collision. See §3.

**(i) Curriculum-flex block (Rule 38):**

- **(i-1) Both preset cuts checked coherent.**
  - *Hide advanced:* **no-op — this concept ships zero advanced-ring states**, for the reason given in §0 Finding 2 (the only genuinely advanced content this apparatus offers, Lami's theorem, cannot be rendered honestly; the general vector-sum form is one narration line, not a state). Rule 38a's contiguity requirement is vacuously satisfied. Documented as a deliberate judgment, not an omission.
  - *Hide advanced + extended:* survivors = **STATE_1, STATE_2, STATE_7**. Checked line by line: STATE_1's narration/caption/formula reference only `T = m g` and arrow length; STATE_2's reference only `ΣF = 0` and the three tension readouts; STATE_7's formula surface is `ΣF = 0` and its controls are the home fixture. **No surviving state's narration, caption, formula surface or readout mentions components, ΣFₓ/ΣF_y, cable angles, `T = W/(2 sin θ)`, sag, or the four-string cross.** The reduced lesson is a complete qualitative unit: *tension is the hanging weight → the pulls cancel and it stays put → try it yourself.* Coherent. ✓
  - **Binding constraint handed to physics-author:** STATE_1 and STATE_2 narration must not forward-reference "we will resolve these into components" or "cables" — that would break the reduced cut.
- **(i-2) Explore surfaces CORE-ring content only (38b).** STATE_7's `formula_overlay` is `ΣF = 0`, not `T = W/(2 sin θ)`; its labels use only `T₁ T₂ T₃ ΣF m₁ m₂ m₃`, all established in core states. `ΣFₓ`/`ΣF_y` appear in its `readouts` — **flagged as a judgment call for the auditor:** they are extended-ring symbols in a core-ring state. Recommendation: **keep them**, because a sandbox that hides two of the four numbers the engine computes is a worse instrument, and a reduced-syllabus teacher can simply not point at them. If the auditor rules this a 38b violation, the fix is `readouts: ["T","sum_F"]` on STATE_7 — no other change.
- **(i-3) `curriculum_tags`** — authored as CLAIMS (38g):

| curriculum | placement | `verified` | `needs_teacher_verification` |
|---|---|---|---|
| CBSE / NCERT Class 11 | Ch.5 Laws of Motion — equilibrium of concurrent forces | `true` | `false` |
| JEE Main / NEET | Unit: Laws of Motion — equilibrium of a particle, two-cable support problems | `false` | `true` |
| Cambridge IGCSE / A-Level | Forces — equilibrium of coplanar forces | `false` | `true` |
| US High School / AP Physics 1 | Dynamics — static equilibrium, ΣF = 0 | `false` | `true` |

Every non-CBSE cell ships `needs_teacher_verification: true`; **no preset goes teacher-visible until a real teacher of that curriculum confirms it.**
- **(i-4) Preset proposal (hide only, never reorder — 38h / Rule 25d):**
  - `full` → all 7 states.
  - `core_only` → hide STATE_3, STATE_4, STATE_5, STATE_6 → STATE_1, STATE_2, STATE_7.
  - *(No `hide_advanced` preset is proposed, since there is no advanced ring.)*
- **(i-5) Graph-axis convention (38e) — N/A.** This concept renders no graph. Nothing to decide, nothing to toggle.

---

## §13 — SELF-REVIEW

- [x] Atomic claim is ONE sentence.
- [x] State count (7) justified against the §5 table and against the engine's archetype ceiling.
- [x] Per-state control table present: teaches × archetype × delta × controls × narration budget × duration × ring × advance_mode.
- [x] Every archetype repeat is a **declared contrast pair** with the flip named (STATE_2/3, STATE_5/6). The mass-ramp family overlap (STATE_1 vs STATE_5/6) is disclosed with its separation criteria and a named fallback.
- [x] No static state; every state's motion is a rendered, physical change in geometry, position or arrow length — never glow, never opacity.
- [x] Rule 16a: 2 hooks, both at pivots, both proved by the apparatus rather than denied in a caption. Five states carry none.
- [x] Rule 32: cause-first, one variable, delta-cue captions, home-pose continuity, one glow focal each.
- [x] Rule 34: one formula surface per state, ≤5-word captions, value-only HUD, Unicode across all three text paths.
- [x] Rule 38: rings tagged; both cuts checked; explore is core-ring (with one flagged judgment call); `curriculum_tags` as claims; preset proposal derived from the rings.
- [x] Rule 41: every title, delta cue, caption and label above is basic literal English — no idioms, no personification. ("Sag" is the literal engineering word for what a cable does; it is not a metaphor. "Pulls harder" is literal. Nothing in this skeleton says a force *wants*, *knows*, *fights* or *gives*.)
- [x] Rule 15: 2 distinct advance modes. Rule 19: ≥3 primitives per state declared in the DoD.
- [x] `entry_state_map` declared with a **mandatory** exit-pill satisfying the foundational-coverage rule.
- [x] Prerequisites advisory, all four shipped.
- [x] Anchor universal, culture-neutral, plain English, physics-true, widest-syllabus device.
- [x] Definition of Done complete — **zero TBDs**.
- [x] Engine bug queue consulted via the tray's local mirror; scar candidate 1 escalated to the EYE brief as a documented exception and FLAGGED to quality-auditor for Gate 8.
- [x] Two-pass lens Blocks 1 and 2 present and filled.
- [x] Every config sketch audited against the as-built contract's closed enums and bands.

---

## §14 — HANDOFF NOTES TO `physics-author`

1. **Do the three §0 Finding 3 measurements FIRST** (settle duration, `|p|` bounds across every ramp, slider-tracks-ramp). Every duration and ramp endpoint in §9 is a *design intent* with arithmetic behind it, not a measured value. Trim `param_ramp.to` and the damping/ring-mass pair to what the harness actually shows.
2. **Narration budget is hard: 25–55 EN words per guided state**, and the per-state budgets in §3 are tighter than that on purpose so the motion is never shorter than the talking. The ramps are deliberately slow (≈ 9 s) for exactly this reason.
3. Two wording constraints are load-bearing and are flagged in §7: never say the forces "cancel out" in a way that reads as "disappear" (STATE_2), and never state "cables carry less than the load" without "**when the cables are steep**" (STATE_5).
4. The `physics_engine_config.constraints` block should record, in plain terms: `T_i = m_i g` **exactly** (the hanging mass IS the tension — the reason this apparatus is teachable); the string direction is toward its own pulley and is solved, never authored; damping is a display convenience and is **never** drawn or named as a force in the free-body diagram; and `2 T sin θ = W` for the symmetric two-cable case, with `T → ∞` as `θ → 0`.
5. **Lami's theorem: do not author it onto the canvas.** It may appear once in the physics block as teacher-facing background. Any caption, annotation or formula surface claiming it will be failed.
agentId: ad8a9daa2b1236102 (use SendMessage with to: 'ad8a9daa2b1236102', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 149832
tool_uses: 11
duration_ms: 798675</usage>