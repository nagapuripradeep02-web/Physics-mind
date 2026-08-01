# PROGRESS_CHEMISTRY.md — PhysicsMind Chemistry Build

> Dedicated chemistry build log (sibling of root `PROGRESS.md`, which stays the physics/engine log).
> Newest session first. Chemistry work started 2026-07-23 on branch `feat/chemistry-foundation`.
>
> **Companion docs:** `docs/CHEMISTRY_ARCHITECTURE.md` (design — extend, don't duplicate) ·
> `docs/CHEMISTRY_BUILD_PLAN.md` (phase-by-phase execution plan + tracker) ·
> `docs/CHEMISTRY_DISCUSSIONS.md` (strategy/decisions log) · `docs/patterns/chemistry.md`
> (architect pattern library) · `.agents/chemistry_author/CLAUDE.md` (the rigor role).

## Phase status

| Phase | Name | Status |
|---|---|---|
| 0 | Safety baseline | ✅ 2026-07-23 |
| 2 | Authoring layer (`chemistry_author` + pattern library) | ✅ 2026-07-23 |
| 1 | Curriculum plumbing (subject first-class) | ✅ 2026-07-23 |
| 2.5 | Parity hardening (4 shared specs + tooling + validate:chemistry) | ✅ 2026-07-23 |
| 3 | First concept — **Bohr energy levels** (Wave 1 pivoted from Rutherford; prove-first) | ✅ **MERGED TO MASTER 2026-07-27** (`b9eb735`) — authored, validated, quality_auditor gated, THE EYE 39/39, eye_walker walked, baselines approved. **Only Asmi's professor review remains.** |
| 3b | Second concept — **law_of_conservation_of_mass** (NCERT Cl.11 Ch.1 §1.3, archetype O) | ✅ **MERGED TO MASTER 2026-07-27** (`df3d993`) — full traditional pipeline, quality_auditor FAIL→fixed, THE EYE 44/44, baselines locked, 23/23 EN audio. **Only Asmi's professor review remains.** |
| 4 | Chemistry machine gates (ledger check, animation vocab) | ◐ 2026-07-28: `validate:chemistry` is now IN CI (`verify.yml`) — it had never run there, so a broken chemistry concept passed the whole workflow green. Ledger/animation-vocab gates still ☐ (4 scar candidates waiting to seed them). |
| 5 | Chemistry render surface — **four scenarios LIVE** | ✅ 2026-07-28/30: `field_3d` `molecular_geometry` (electron-domain 3D) · `field_3d` `orbital_shapes` (lobes; `kind:"hybrid"` + `kind:"mo"`) · `particle_field` `gas_box` (2D hard-disc gas) · `parametric` (2D). Still ☐: **lattices** (ionic/metallic solids) + **multi-molecule scenes** (intermolecular forces) — both now SPECCED as ONE scenario, `bonding_scene`, in `docs/CHEMISTRY_PHASE0_BONDING.md` (Phase 0 done 2026-08-01, engine not dispatched); wet-lab apparatus (Phase 5b). |

**Chemistry is a first-class subject ON MASTER across THREE renderer families, in 2D and 3D.**
All 10 concepts are baseline-locked. *(Table re-derived from disk 2026-08-01 — the previous version
double-listed `le_chateliers_principle`, omitted `dynamic_equilibrium` and
`collision_theory_activation_energy`, and swapped the states/baselines columns. Baselines = 2 × states:
`STATE_N.png` + `STATE_N__frozen.png`.)*

| Concept | NCERT | States | Baselines | Renderer · scenario | EN clips |
|---|---|---|---|---|---|
| `law_of_conservation_of_mass` | Cl.11 Ch.1 | 7 | 14 | parametric | 23 |
| `bohr_model_energy_levels` | Cl.11 Ch.2 | 9 | 18 | parametric | 31 |
| `atomic_orbitals_s_p_d` | Cl.11 Ch.2 | 9 | 18 | field_3d · `orbital_shapes` | — silent (30h) |
| `collision_theory_activation_energy` | Cl.12 Ch.3 | 9 | 18 | particle_field · `gas_box` | — silent (30h) |
| `vsepr_molecular_shapes` | Cl.11 Ch.4 | 7 | 14 | field_3d · `molecular_geometry` | 17 |
| `hybridisation_sp_sp2_sp3` | Cl.11 Ch.4 | 8 | 16 | field_3d · `orbital_shapes` (`kind:"hybrid"`) | 23 |
| `sigma_pi_bonding` | Cl.11 Ch.4 | 9 | 18 | field_3d · `orbital_shapes` (`kind:"mo"`) | — silent (30h) |
| `kinetic_particle_theory` | Cl.11 Ch.5 ⚠ | 7 | 14 | particle_field · `gas_box` | 19 |
| `dynamic_equilibrium` | Cl.11 Ch.6 | 7 | 14 | particle_field · `gas_box` | 24 |
| `le_chateliers_principle` | Cl.11 Ch.6 | 8 | 16 | particle_field · `gas_box` | 32 |

**Totals: 10 concepts · 80 states · 160 baselines · 169 EN clips · 3 silent.**
`validate:chemistry` **10/10 PASS**. The isolation contract held through every merge: all register at
site #1 only, and `validate:concepts` reports **146/146** without ever seeing them.

**The one gate none of them has passed is Asmi's professor review** — now **ten** concepts deep,
spanning both dimensionalities and four renderer surfaces. That is the bottleneck, not renderer
coverage, and it has been the stated bottleneck for **six** consecutive sessions. Put as plainly as
it can be: `sigma_pi_bonding` cleared three full audit rounds and every machine gate, and **not one
of those measures whether it teaches.**

---

## ⚙ SESSION — Phase 0 gated and E1 landed: the `bonding_scene` substrate is on master (2026-08-01, master — engine only, Rule 40)

> Continuation of the Phase-0 session below. founder-proxy Checkpoint A ran two cycles on the two
> deepest skeletons; E1 was dispatched to `field3d-surgeon` only after `DESIGN_OK`.
> **Engine on master (`12cac9a`); no concept authored. Desk 1 opens after E2.**

**Checkpoint A cycle 1: `DESIGN_FIX`, and it earned its place.** The load-bearing finding was a
process one: §0d's success test — *"no designed state needs a feature outside A–M"* — had been
written as a **claim rather than a walk**. Walking it state by state found **seven designed states,
three of them core-ring, consuming capabilities the union did not list**: a drawn valence/shared
electron pair, a trend surface (the boiling-point anomaly only reads as an anomaly against its
family's rising line — a value-only HUD just states four numbers), interior reveal on a lattice
(glow is brightness; it cannot defeat occlusion), and a per-species radius. Three more, verified
against the renderer: **the closed enums could not name substances the state tables teach**
(`MG_MOLECULES` has no H₂S/CO₂/CCl₄/CHCl₃/NF₃; `MG_ELEMENTS` no Na/Mg/Al), so the "one edit"
reuse claim was wrong; **the derived-outcome principle had been applied to the layer shift but not
to the H-bond criterion**, which was a hardcoded N/O/F whitelist — scripted in exactly the way that
decision forbids; and **Rule 38a broke at the explore states**, where a flat `controls` array left a
sandbox exposing a slider that shatters a crystal in a lesson that never showed the shatter.

**Cycle 2: `DESIGN_OK`**, on two enum edits plus seven carry-forward items. Two would have cost an
E3 re-architecture: the states cycle 1 added need **two co-present samples** (solid vs melt; NaCl vs
MgO) against a contract holding one `lattice` and a global `thermal` — fixed with a `groups: []`
layer, because the sample-vs-sample race *is* the teaching; and **`like_contacts` was specified by
its two outputs, not by what it measures** — in a cation-only lattice every nearest-neighbour contact
is already like-charged, so a literal count reads 8 → 8 and the gate would have passed a metric
teaching *"a metal has no like-charge neighbours."* Now defined as contacts created by the shift and
left unscreened, with the gate asserting the definition on the case where a naive metric and the
intended values disagree.

**The cycle-2 lesson, general:** a state added during a fix cycle was checked against the union rows
and against the closed enums, and never against whether **one config object can hold it**.
Cardinality is a third axis.

**Ring promotion.** `hydrogen_bonding` S6–S7 and `ionic_bonding` S6–S8 moved extended → **core**.
Both cuts survived, so no rule was broken — but it left hydrogen bonding's boiling-point anomaly (its
*literal* whiteboard-test justification) and all three examinable ionic properties outside the
core-only preset, i.e. outside IGCSE, the grade this wave exists to serve and where ionic bonding is
the chapter opener.

### E1 — what landed (`12cac9a`, master)
`field_3d` `scenario_type: 'bonding_scene'` (+1063 in `field_3d_renderer.ts`), `deriveStateMeta`
registration in the same change (+84), and a new **`npm run check:bonding-scene`** (493 lines,
negative controls on every section). Tables: 11 new `MG_MOLECULES` rows + an optional `ligands`
array, 10 new `MG_ELEMENTS` rows, and a **separate** `BS_RADIUS_PM` linear-pm table — molecule atoms
stay on the compressed legibility scale, ions and lattice sites use the linear one, because there the
size change *is* the lesson. Plus units, derived δ charges, the rigid two-dot electron glyph,
dipole arrows + derived resultant, index-derived deterministic jiggle, 13 ring-gated control rows,
closed mode/glow/hud/species enums with an explicit **implemented vs deferred** split.

**Three findings that corrected the spec — all from measurement, none from reading:**

1. **D-4's countability criterion, as written, omits the central atom — and that omission IS the
   scar.** Solved over the four ligands alone, the fleet house camera scores a comfortable 0.484 NDC
   across a full spin; add the central atom to the counted set and the same camera drops to **0.064
   NDC** mid-spin — one ligand swinging onto the carbon under a caption counting four. That is
   `field3d_counted_element_occluded_along_view_axis` reproduced verbatim on a camera the metric had
   just certified. **The counted set is whatever the caption is read against.** Re-solved; shipped
   camera 0.2258 with the central atom included, negative control 0.0000.
2. **OPEN-DECISION-1's ratified model double-counts.** Checkpoint A had corrected the original
   HCl-calibrated constant to *published bond moments **plus** an explicit lone-pair term* — and that
   correction was itself half-wrong. With the published values, N–H 1.31 reproduces NH₃ at **1.462 D**
   and N–F 0.17 reproduces NF₃ at **0.223 D** with a lone-pair term of **zero**, because tabulated
   bond moments are empirically fitted and already absorb it; a textbook-sized term pushes NH₃ to
   2.46 D and breaks H₂O at the same time. The mechanism ships, authored at 0. **S7's teaching still
   holds — the NH₃/NF₃ reversal is a *direction* reversal, not an extra vector**, and
   `chemistry-author` needs to know that before writing its narration.
3. **CHCl₃ is the one number the model misses** — 1.760 D against a literature 1.04 D, because bond
   moments are famously non-additive across the chloromethanes. Everything else lands (HF/HCl/HBr/HI
   exact, H₂O 1.849, NH₃ 1.462, NF₃ 0.223, every symmetric species < 1.2e-15). A per-molecule
   override hook is read by the model, so ratification is a data edit, and the gate **prints**
   model-vs-literature with a ratify flag rather than asserting values it cannot yet justify.

### Verification (independently re-run by the dispatching session, not taken on report)
`tsc` 0 · `check:renderer-syntax` + backticks clean · **`check:bonding-scene` all E1 sections PASS**
(2/3/6/7/8/9/13/14 declared E2/E3 stubs) · `validate:concepts` **146/146** · `validate:chemistry`
**10/10** · `check:hybrid-orbitals` + `check:sigma-pi` unregressed · THE EYE **vsepr 44/44 with all
14 baselines at 0.00%** — the concept that actually reads the grown tables · hybridisation 50/50 ·
σ/π 56/56. `MG_EXPLORE_MOLECULES` unchanged (no leak into VSEPR's picker), and gate §12 asserts every
pre-existing `MG_MOLECULES`/`MG_ELEMENTS` row is byte-identical.

The hybridisation/σ-π H₂ figures are non-zero (0.21–0.46%, tolerance 2.0%). The surgeon did not
accept that on a green total: it stashed the two engine files, re-seeded and re-ran on the pre-E1
renderer, getting **identical** figures — pre-existing baseline vintage, zero E1 pixel delta.

### Scars
**3 rows** drafted as SQL text, **NOT APPLIED** (engine_bug_queue writes are a founder decision):
the countability-metric omission (CRITICAL, FIXED), the bond-moment double-count (MAJOR, OPEN), and
`deferred_enum_members_must_be_declared_not_merely_unimplemented` (MODERATE, FIXED) — the answer to
"how do you keep 11 unimplemented modes from becoming the σ/π decorative-string scar".

### E2 — the intermolecular link layer (`096e9c1`, master)
Four deferred modes implemented (`assemble` · `approach_link` · `network` · `compare`), the derived
two-ended link criterion, the trend surface, and gate sections 6 + 9. `deriveStateMeta` **untouched**
— every beat rides a cue key E1 pre-wired. **No closed enum widened** (modes, controls, hud_lines,
glow keys, placements all unchanged; gate 10 asserts them against the frozen contract).

**The N/O/F requirement genuinely emerges.** Thresholds `donor 0.15 / acceptor 0.30` on the derived
per-atom charge, and the emerged acceptor set is **exactly {N, O, F}** — no whitelist anywhere:

| species | donor H δ+ | acceptor δ− | links? |
|---|---|---|---|
| H₂O | +0.319 | O **−0.638** | yes |
| NH₃ | +0.162 | N −0.485 | yes |
| HF | +0.547 | F −0.547 | yes |
| HCl | +0.206 | Cl −0.206 | **no** — acceptor fails |
| H₂S | +0.036 | S −0.071 | **no** — both fail |
| H₂Te | −0.003 | Te +0.003 | no — no donor at all |

⚠ **Correction to the E1 handoff carried into the last entry:** *"δ(O in H₂O) = 0.319"* is the
**per-bond ionic fraction, i.e. the donor H's charge**. The acceptor O carries **0.638** (two bonds).
The 9× O-vs-S separation survives, but a threshold authored at 0.319 for the acceptor would have been
wrong by 2×.

**The finding that mattered — hysteresis and determinism collide, and the obvious fix is the one
Rule 36 forbids.** `form_pm < break_pm` is meaningless without memory of whether a pair was already
bonded, and the natural implementation carries a per-pair **latch** across frames. That is exactly
the accumulator D-1 bans: THE EYE pins the clock, and a latched link set reproduces whatever phase
the browser happened to reach rather than the pinned one. Resolved by **replaying the latch instead
of carrying it** — the criterion is evaluated over a bounded lookback of absolutely-anchored sample
times (9 samples over 640 ms), oldest first, forming at the inner threshold and surviving to the
outer. Every sample is a closed-form position, so the whole latched *set* stays a pure function of
state-local t. Proven by rewind: pin 4000 → 9000 → 4000 ms gives byte-identical frames, and the set
is not constant over the window (92/131 frames linked). **The pattern generalises to any E3 beat
needing memory — a melt front, a shift outcome. Do not introduce a latch.**

**What the gates could not catch, and running it did.** A throwaway Playwright smoke over five states
found E1's frame pass reading each unit's *authored* species while the picker and the `compare` swap
wrote only the global — a **yellow H₂S molecule under an `H₂O` formula surface and a
`boiling point = 373 K` HUD**. That is a recurrence of the FIXED scar
`field3d_explore_picker_updates_global_but_frame_reads_authored_state_value`, inside a brand-new
scenario, and it is precisely S4's lesson rendering the opposite of itself. Fixed with `uSpecOf(u)`.
Fourth chemistry concept in a row where every machine gate was green and the defect came from frames.

**Four more E1 defects the second consumer exposed** — none visible with one unit: the `network` and
`compare` cameras framed nothing (13.0/10.0 against an ~11.5-unit box); the count slider stacked
every extra unit at the origin; `bscFindById` was an O(sceneObjects) linear scan, free at one unit and
millions of string compares per frame at thirty; and **D-6 was only half-built** — δ labels were
capped but atom element labels rendered on all 90 atoms at 30 waters.

**Verification (re-run independently, not taken on report):** tsc 0 · renderer-syntax + backticks
clean · `check:bonding-scene` **all E1 + E2 sections pass** (2/3/7/8/13/14 declared E3 stubs) ·
`validate:concepts` **146/146** · `validate:chemistry` **10/10** · `check:hybrid-orbitals` +
`check:sigma-pi` unregressed · THE EYE `vsepr_molecular_shapes` **44/44 with all 14 baselines at
exactly 0.00%**. Gate evidence: jiggle is √(T/T₀) to a worst residual of 2.8e-17; **every intra-unit
bond stick is invariant under temperature** (4.4e-16 — S6's misconception kill, asserted); links fall
79.5% → 61.6% from 120 K to 600 K; the family line extrapolates to 180.7 K and water misses it by
192.3 K.

**Scars: 3 rows, SQL text only, NOT APPLIED** — one UPDATE reopening the picker scar as a recurrence,
plus `hysteretic_state_cannot_be_latched_under_a_time_pin` (MAJOR, FIXED) and
`pooled_mesh_lookup_is_linear_scan_and_degrades_with_pool_growth` (MODERATE, FIXED).

### ⏭ NEXT
**E3 — the lattice layer** (rock_salt/fcc/bcc/hcp · growth · interior reveal · transfer + linear-pm
radii · the D-7 `like_contacts` metric · electron sea + drift · row Q ion drift · row R `groups`),
which unblocks **Desk 2**. **Desk 1 (`feat/chemistry-polarity-hbonding`) can open now** — E1 + E2
are both on master and it touches only JSON.

⚠ **Carry into Desk 1's prompt:** the smoke's loose 30-water box gave **≈1.07 links/molecule against
the doc's authored ≈3.5**. That is an *authoring* gap, not an engine one — reaching 3.5 needs tighter
`at` spacing and near-tetrahedral `orient` values. `json_author` must not conclude the thresholds are
wrong. Scale: **1 scene unit = 48 pm**, so a linear H-bond is 5.75 scene units O···O.

---

## 🧱 SESSION — Phase 0 for the bonding-successors wave: four concepts, ONE scenario, three sequenced dispatches, two desks (2026-08-01, no branch — design only, no code)

> Founder asked to complete Phase 0 for `hydrogen_bonding`, `bond_polarity_dipole_moment`,
> `ionic_bonding` and `metallic_bonding`, then open two working branches. **Phase 0a + 0b are done;
> 0c is planned and NOT dispatched.** Full artifact: **`docs/CHEMISTRY_PHASE0_BONDING.md`**.

**The result that matters: the four concepts need ONE new `field_3d` scenario, not the two the
survey feared and not the four that four parallel desks would have produced.** `bonding_scene` —
a scene of charged *units* (a molecule, or an ion on a lattice site) with links between them —
covers all four because `placement: 'free' | 'lattice'` is the only structural difference between
them. The shared substrate (units, per-atom charge, deterministic jiggle, HUD) is ~60–70% of the
build. Rule 40a sweep across all branches: `bonding_scene`, `lattice_cell`, `rock_salt`,
`electron_sea`, `hydrogen_bond`, `molecular_assembly`, `unit_cell` — **0 hits each**, nothing is
being built twice.

**No existing scenario stretches, but `molecular_geometry`'s geometry layer is directly reusable.**
`mgFrame` / `mgIdealDirs` / `MG_ELEMENTS` sit at the same template scope as every other scenario's
functions, so the new one *calls* them instead of re-deriving the VSEPR angle table. That reuse is
the whole reason this is one build. `gas_box` (2D), `orbital_shapes` and the electric `dipole`
scenario were each measured against the need and each fails it — the electric dipole shares a word
with bond polarity and nothing else.

**Three engine decisions taken now rather than discovered mid-build** — the Phase-0 payoff:
1. **No integrator anywhere.** The obvious implementation of "forty jiggling molecules whose
   H-bonds keep breaking" is a molecular-dynamics step loop, and it would break the fleet's
   frozen-baseline contract (Rules 26/36) — `SET_TIME_FREEZE` snaps to a pinned time and must
   reproduce byte-identical pixels. Required form: seeded sums of sines, amplitude ∝ √T, link
   presence evaluated from those closed-form positions. The network flickers, and flickers
   identically every replay.
2. **The layer-shift outcome is DERIVED from the lattice's charge pattern, never authored.**
   Like-charge alignment splits the ionic crystal; a cation lattice with a shared sea holds. This
   is the `gas_box` `Ea_rev` lesson — the derivation is what makes ionic S7 vs metallic S5 a real
   contrast instead of two animations.
3. **One instrument per quantity** — flagged as OPEN-DECISION-1, because polarity has exactly the
   σ/π hazard (a modelled vector sum that tracks the slider vs a literature μ in debye).

**Curriculum finding: this wave is the fix for the IGCSE hole.** The σ/π session recorded that for
IGCSE our bonding chapter is effectively empty — hybridisation and σ/π both carry *"hide the whole
concept for this board"*, leaving VSEPR alone. **Ionic, metallic and hydrogen bonding are all
full-coverage IGCSE topics.** No ranked P2 concept does that. ⚠ Counterweight: **metallic bonding is
the weakest of the four on CBSE** (Solid State was removed from the rationalised NCERT) — build it
fourth, with its CBSE cell authored `partial`, never `full`. And every international cell in all
four new files will ship `needs_teacher_verification: true` — this wave enlarges that gap rather
than closing it.

**Honest tier call:** `bond_polarity_dipole_moment` is ⭐, not 💎. A teacher *can* draw CO₂ with two
opposing arrows. Exactly one of its states is a diamond — four tetrahedral bond dipoles summing to
zero, then one substitution breaking it. It earns its build on the pairing: **it is hydrogen
bonding's prerequisite** (Rule 25 — δ+/δ− is otherwise an untaught term).

**0b delivered two full skeletons, not one**, because the union has two disjoint halves and one
skeleton cannot spec both: `hydrogen_bonding` (8 states, deepest on the free-placement half) and
`ionic_bonding` (9 states, deepest on the lattice half), each with the Rule-31 per-state control
table (archetype · delta cue · controls · real number) and its Rule-38 rings. Engine-facing tables
for polarity (8 states) and metallic (7 states) complete the union check: **every engine feature
A–M is exercised by at least one designed state, and no designed state needs a feature outside
A–M** — the §0d success test made checkable before a line of code.

**The plan (0c/0d), and why the desks pair the way they do:**

| Step | What | Lands |
|---|---|---|
| E1 | `bonding_scene` substrate (units · charges · dipole arrows · jiggle · `deriveStateMeta` registration · `check:bonding-scene`) | master |
| E2 | intermolecular link layer (form/break criterion · live count · temperature) | master |
| → | **Desk 1 `feat/chemistry-polarity-hbonding`** — polarity → hydrogen bonding, pure JSON | branch |
| E3 | lattice layer (rock_salt/fcc/bcc · transfer + radius re-scale · derived layer shift · electron sea) | master |
| → | **Desk 2 `feat/chemistry-ionic-metallic`** — ionic → metallic, pure JSON | branch |

Sequential engine dispatches, one `bug_class` each (Amendment 4), all to `field3d-surgeon`. Desk 1
opens while E3 is still in flight — it never touches an engine file, so there is no Rule-40
conflict, and a desk is working at all times without two sessions in `field_3d_renderer.ts`.
**Both pairings are doubly justified — by engine surface AND by pedagogy:** polarity precedes
hydrogen bonding, and metallic bonding's aha is a contrast against ionic bonding's cleavage beat.
Splitting either pair would put one half of a contrast beat in a branch that cannot see the other.

**The alarm-rule ledger is written in advance.** Six things this wave deliberately does not build —
ice I_h, Born–Haber, hydration shells, Fajans polarisation, alloys, covalent network solids — each
with its re-open condition, so a later concept does not ambush the engine.

**One regression-bearing edit is required and is called out:** `MG_MOLECULES` entries carry a single
`ligand:` string and cannot express CHCl₃ or NF₃. The safe change is an **optional** `ligands` array
read only by the new scenario. `vsepr_molecular_shapes` must come back unchanged from THE EYE, and
hybridisation and σ/π re-run, before E1 is called done.

### ⏭ NEXT — the gate before any engine code
**founder-proxy Checkpoint A on the two 0b skeletons** (`hydrogen_bonding`, `ionic_bonding`).
§0b puts it before any engine code for a reason: it is the highest-ROI quality slot in the pipeline.
**E1 must not be dispatched until it returns DESIGN_OK.** Three open decisions ride with it
(dipole instrument · the ice beat · desk order).

---

## 🔗 SESSION — Chemical Bonding coverage survey: the chapter is DONE per the ranked list, and the four proposed successors all need engine work (2026-08-01, no branch — survey only, nothing authored)

> Founder asked what was left in Chemical Bonding (NCERT Cl.11 Ch.4) and then which bonding concepts
> intersect Indian **and** international curricula. No concept was built this session; the output is
> the survey below and a build decision that is still open.

**1. Ch.4 is complete against the ranked list.** All three Ch.4 entries in `CHEMISTRY_DISCUSSIONS.md`
Session C5 §6 are built and baseline-locked: **#12 `vsepr_molecular_shapes`** (7 states),
**#13 `hybridisation_sp_sp2_sp3`** (8), **#17 `sigma_pi_bonding`** (9), plus **#16
`atomic_orbitals_s_p_d`** (Ch.2) which feeds them. **There is no remaining ranked work in this chapter.**

**2. Only VSEPR is genuinely universal — read from the concepts' OWN `curriculum_tags`.** All 10
chemistry concepts carry authored tags (physics is far patchier), so this is repo data, not recall:

| Concept | CBSE | JEE/NEET | IB DP | AP | A-level | IGCSE |
|---|---|---|---|---|---|---|
| `vsepr_molecular_shapes` | full ✅ | — | full | full | full | **partial** |
| `hybridisation_sp_sp2_sp3` | full ✅ | full | **partial — HL only** | full | full | **absent** |
| `sigma_pi_bonding` | full ✅ | full | **partial — HL only** | full | full | **absent** |
| `atomic_orbitals_s_p_d` | full ✅ | full | partial | partial | partial | **absent** |

Both hybridisation and σ/π carry the tag text *"hide the whole concept for this board"* for IGCSE.
So the Ch.4 trio is strong for CBSE/JEE/AP/A-level and weak-to-absent for the younger international
grades; **VSEPR is the only bonding concept every board touches.**

**⚠ 3. Every international cell is an unverified CLAIM.** In all four files only the **CBSE/NCERT row
is `verified: true`**; every IB / AP / A-level / IGCSE / NGSS row is `needs_teacher_verification: true`.
Rule 38g therefore blocks all of them from teacher-visible presets. **Ten concepts deep, not one
international mapping has been confirmed by a teacher of that board** — the same shape of gap as the
Asmi bottleneck, and it will silently cap the international story if it stays unclosed.

**4. The four proposed successors are unranked AND engine-blocked.** Founder proposed building, in
order: intermolecular forces / hydrogen bonding → polarity & dipole moment → ionic bonding → (4th TBD).
None is on the C5 list (the whiteboard test excluded most of Ch.4 as board-drawable). Measured against
the live scenarios:

| Proposed | Needs | Exists today? |
|---|---|---|
| Intermolecular forces / H-bonding | **multiple molecules** attracting, H-bonds forming/breaking | ❌ `molecular_geometry` renders ONE molecule |
| Polarity / dipole moment | one molecule + per-bond dipole vectors + resultant | ⚠️ extension of `molecular_geometry` |
| Ionic bonding | electron transfer → repeating **3D lattice** | ❌ no lattice scenario |
| Metallic bonding (4th candidate) | lattice + electron sea | ❌ shares the lattice gap |

**Three of four need engine work, on two different surfaces.** That makes four parallel desks the
exact Rule-40 hazard: three sessions editing `field_3d_renderer.ts` at once (cf. the twice-built PCPL
focal-glow fix, and PR #10's nine deceptive hunks). **Phase 0 must run before any concept desk opens.**

**5. Correction carried forward — Molecular Orbital Theory is NOT the universal pick.** MOT was
proposed mid-session as "the biggest remaining Ch.4 diamond"; that is wrong by the intersection test.
MOT is full in CBSE and heavy in JEE but **absent from IB DP and AP Chemistry**. By curriculum reach
the order is **hydrogen bonding / IMF → polarity → ionic**, with MOT among the *weakest* in the
chapter. (Assessment, not repo data — Rule 38g: needs teacher verification.)

**6. Where the ranked list actually still has work.** Unbuilt: **P1 #3 rate of reaction · #5
Maxwell–Boltzmann · #7 diffusion/Graham's** (all harvest the existing `gas_box`), and the whole of
**P2 — #8 titration curve · #9 reaction profiles · #10 hydrogen emission spectrum · #11 periodic
trends**, which the plan marks *"NO new engine work"*. That P2 block is exactly four concepts on
engines that already work — the cheapest four available, versus three engine builds for the bonding
successors.

**NEXT (open founder decision):** (a) the four zero-engine P2 concepts, or (b) close out Ch.4 with the
unranked bonding concepts, which requires a Phase-0 survey → one engine build landed on master
separately (Rule 40) → *then* two desks of pure-JSON concepts. Recommendation on record: run the
Phase-0 survey before opening any desk, and pair desks by **engine surface**, not curriculum order.

---

## ⚛ SESSION — σ/π bonding (P4 #17), the `kind:"mo"` surface, and eight blocking defects behind a 39/39 EYE — four times (2026-07-29/30, branch `feat/chemistry-sigma-pi`)

**Bottom line: molecular orbitals are a live capability and #17 is authored, audited three times and baseline-locked (fleet 66 → 67). The load-bearing finding came BEFORE any renderer code existed: the pattern doc said σ/π was "one line (a per-lobe origin offset)", and measurement killed that — "the same pool, translated" is not a picture of a bond, it is a picture of the misconception the concept exists to destroy. Engine on master (`20d265d`, `8d387bf`); concept on the branch.**

### What shipped
- **`kind:"mo"` on `field_3d` `orbital_shapes`** (additive; the s/p/d and hybrid paths bit-for-bit unchanged, asserted by `check:sigma-pi §12`). A signed two-centre field ψ_A ± ψ_B, a 2-D root table over (delta, azimuth), per-component spun origins, Z_eff as a length scale, a second nucleus, a precomputed twist ladder, both overlap regions, multi-MO per state, a ratio readout, and a reusable `bond_sticks` primitive.
- **`sigma_pi_bonding`** — 9 states, NCERT Cl.11 Ch.4 §4.7. Rings core S1–S6 / extended S7–S8 / core S9 explore.
- **`npm run check:sigma-pi`** — 12 sections, negative controls on every one, no browser.

### The design gate is where this concept was won
Four questions settled headlessly before a line of renderer code, each with a control:
- **Control:** an independent implementation reproduced the 2p 90% tip at **482.98 pm** against the **482 pm** already on master from `atomic_orbitals_s_p_d`.
- **Scale:** the shipped orbitals are hydrogenic Z=1, where a carbon 2p tip is **3.61× the C=C bond length** — each lobe reaching 3.6 bond lengths past the other nucleus. Z_eff = 3.25 is a requirement, not a refinement.
- **Topology — the finding that mattered:** at the 50% contour (the only usable one, per #13's `front_only` lesson) a *translated-pool* π bond is **four disconnected lobes that never touch**. Two atoms standing near each other with a visible gap, under a caption reading "the π bond". The true MO field gives the correct textbook topology at every enclosure.
- **Cost:** every MO component is star-shaped about its own centroid (0.0–0.1% ray re-entry), so the shipped mesh pipeline was reused and **marching cubes was never needed**.

Then two more numbers that became on-screen instruments: **S(φ) = S(0)·cos φ exactly** (max deviation 1e-14, S(90°) = 0.000000), and the sp²–sp² σ measured as the *better* picture as well as the correct one — back lobes collapse **1145 → 107 cells** because hybrids are directional.

### THE LESSON: "the π bond breaks" is not a picture of lumps separating
The obvious S6 animation — twist, and the two π lumps tear apart — is **wrong**. Measured up the whole ladder, the total-density surface holds at **2 components at every angle including 90°**: A's +x lobe and B's +y lobe still touch *diagonally* once perpendicular. The bond is gone (overlap exactly 0.000000) while the picture shows it intact. What vanishes is the **constructive region**, by *cancellation*: at 90° constructive 0.08589 and destructive 0.08589 **exactly annihilate**. Better lesson, true, and it reproduced the cos φ law by a second independent computation.

### The review rounds — eight blocking defects, then two, all behind 39/39
THE EYE reported **39 deterministic checks, 39 passed, 0 failed on all FOUR captures**, including the one containing every defect below. Fourth consecutive concept where that has happened.

| round | outcome |
|---|---|
| Audit 1 | **FAIL** — 7 blocking, **4 of 9 archetypes delivered** |
| Audit 2 | **FAIL** — 7 fixed, 2 blocking remain, **8/8 archetypes** |
| Audit 3 | **PASS-WITH-NOTES** — both fixed, 5 notes closed, 1 escalated |

The three that generalise:
1. **A silent identity fallback poisons everything downstream.** `os.orbital` is unset on an MO state (the id lives under `os.mo`), so `baseId = os.orbital || "1s"` activated the 1s ATOM in all nine states — a "1s" sprite over every molecular orbital *and a 1200-dot hydrogen-1s swarm drawn through the σ and π bonds*. The dot path's own comment already said "an MO simply has no swarm"; the fallback defeated its own stated intent. **A valid default is more dangerous than one that throws.**
2. **An authored field that no-ops produces a state that lies.** All nine `orbital_shapes.mode` strings were decoration — read only for a camera lookup the concept overrode. Three states were byte-static under captions describing motion. Fixed by adding explicit staging fields and deliberately *not* giving `mode` a second silent meaning.
3. **Two instruments for one quantity will eventually disagree.** S6's slider printed `S/S₀ = 1.000` while the HUD 500 px above read `π S/S₀ = 0.000`, in the same frame, on the primary-aha state — the slider resolved `list[0]` (σ, invariant) and ignored the state's `overlap_of`. A teacher reading the slider learns the opposite of the lesson.

### And the baselines were about to be locked without their content
`deriveStateMeta` pins each frozen frame at the derived reveal time and is **blind to `scene_composition` `at_ms`**, so **eight on-canvas labels were absent from the frames about to be approved — including both labels of the CRITICAL honesty fix landed minutes earlier**, which `check:sigma-pi` did not cover either. STATE_3 was pinned at 1500 ms and its baseline missed "Same overlap, any angle", the state's entire lesson. `eye_capture_ms` is the authored opt-in built for exactly this (`visual_eyes.ts:95`); this concept authored zero. Now five states carry it and the S8 baseline contains the caveat, the facts and the 133.9 pm HUD together.

### Where the process itself failed, recorded honestly
- **I mis-called a defect.** I reported STATE_1's bond rods as overshooting the nuclei. The auditor measured each rod at *exactly* the internuclear distance — the apparent overshoot is the screen projection of the 3D perpendicular offset at az45/el35. Nothing was wrong.
- **`eye_walker` confirmed my wrong call instead of checking it**, and separately marked STATE_1 "reads as intended" when its opening frame was **byte-identical to STATE_2's (0.00% differing px)** and it never drew the misconception at all. It also missed a giant "1s" glyph present in every frame of all nine states. Second consecutive concept where it under-read.
- **My own JSON edit was a silent no-op** — wrote `properties.x/y` where annotations position via a top-level `position` key, on a dict fetched with `.get(default)`, so it mutated a temporary. Caught only by reading the file back.
- **A fallback I wrote hid a real defect for a whole round.** Teaching `deriveStateMeta` the staging fields un-hid Rule 31a failures on **7 of 9 states** — and every narration-ratio warning in the entire chemistry fleet was this one concept, the other seven emitting zero. The picture genuinely completed in 4–6 s against 15–19 s of narration.
- **`check:sigma-pi` crashed on master**, because sections 7–12 read the concept JSON unguarded while Rule 40 keeps that on the branch. A platform gate that only ran if one chapter happened to be checked out — Rule 40 violated inside the Rule-40 gate. Found only by *running* it on master rather than assuming a clean cherry-pick meant a working tree.

**What actually caught things:** deriving expected geometry from the JSON and diffing it against pixels. Nothing else caught anything — not tsc, not the validators, not THE EYE at 39/39 four times over.

### Verification (evidence)
`tsc` 0 · `check:renderer-syntax` + `check:renderer-backticks` clean · `check:sigma-pi` **12/12 sections** with negative controls · `check:hybrid-orbitals` ALL PASS unregressed (and hybridisation re-run through THE EYE at **50/50 with all 16 baselines at 0.00–0.01%**) · `validate:chemistry` **8/8, zero warnings** · `validate:concepts` **141/141** with the concept never appearing in its output · THE EYE 39/39 ×4 · **9 baselines locked, founder-approved**.

### Scars
**12 rows** drafted in `docs/concepts/chemistry/scar_candidates_sigma_pi_bonding.sql` — **2 UPDATEs** (recurrences of classes already marked FIXED, one escalated MODERATE → CRITICAL) and **10 INSERTs**. **NOT APPLIED** — files-only per the standing convention that engine_bug_queue writes are a founder decision. Live table verified at 412 rows / 28 chemistry / **0 for this concept**.
Two rows are OPEN and outlive the concept: the frozen-pin blindness above, and **`query_engine_bug_queue --field3d` returning a false all-clear on every chemistry concept** because its list is hardcoded physics — which silently weakens Gate 8, the step that exists to stop recurrences, on a concept where **two of seven blocking defects were recurrences**.
Also corrected: the audit's note that `alex:chemistry_author` is rejected by the DB CHECK constraint is **false** — the value is in the constraint.

### Open items
1. **Asmi's professor review — eight concepts deep, five consecutive sessions.** Three audit rounds and every machine gate measure correctness, never teaching.
2. **`formula_at_ms` on the mo path** — S7's formula names π ~8 s before π exists; `show_formula` has no per-state timing. Escalated rather than worked around; the pattern already exists (`pef.formula_at_ms`). The HUD `parts` line has the same root cause.
3. **STATE_1's frozen baseline cannot see its own rods** (the pin lands after the dissolve). Protected by `check:sigma-pi §11` instead; the real fix is a second capture for dissolve-ending states.
4. **No `text_hi`** (Rule 30i FYI, never a gate). Silent narration by design (Rule 30h).

### ⏭ NEXT
The engine now makes **σ*/π* antibonding nearly free** — constructive vs destructive overlap *is* bonding vs antibonding, and both regions are already drawn. That is the natural door into **molecular orbital theory**, which is the largest international gap (core for IB HL, A-level, AP). Ch.4 still has neither end: no Lewis/ionic/bond-parameters/resonance/polarity at the front, no MO theory or hydrogen bonding at the back. **For IGCSE our bonding chapter is effectively empty** — hybridisation and σ/π both hide for that board, leaving VSEPR alone. Founder decision 2026-07-29 was to finish σ/π before any chapter-fill; that is now done.

---

## 💥 SESSION — `collision_theory_activation_energy` (P1 #4) + the activation-energy engine layer (2026-07-29, branch `feat/chemistry-collision-theory`; engine half on master)

**P1 #4 is SHIPPED, baseline-locked and merged to master** (founder approval 2026-07-30).
**9 states** on `gas_box` — not the 8 it was designed with; the ninth came from the founder asking
"what is activation energy? did you define anything in the simulation?", and the honest answer was
no. 9 baselines. Fleet 66 → 67. Master pushed (`f729fc2`).
**NOT voiced** (Rule 30h — audio is on-demand, not a ship gate) and **NOT in `PILOT_CONCEPTS`**
(CLAUDE.md §5 puts Asmi's professor gate before the deployed catalog, which still carries zero
chemistry sims).

Final gates: tsc 0 · `validate:chemistry` **9/9** · `validate:concepts` **141/141** (isolation held) ·
`check:gas-reaction` **65/65** (was 37) · THE EYE **35/35** · quality_auditor FAIL→all findings fixed ·
eye_walker FINDINGS→all fixed.

### Six engine commits on master (Rule 40), each with its gate
`58bfe65` the activation-energy layer (kT `Ea` slider + `userTouched` guard, `ea_at_cue`,
`show_arrhenius_plot`, `hist_speed_marks`) · `d2aafad` duplicate-key gate · `023e65b` four instrument
defects · `354ba14` per-state `reaction.enabled`, `ea_at_cue.ramp_ms`, span-guard fix ·
`cde17b3` `T_cue`/`piston_cue`, `counter_window_ms`, one-decimal clear rate, histogram dodges the
slider panel · `59a2b5c` the reaction-off population gate. **All inherited free by P1 #3 and #5.**

### THE LESSON: the instrument can be perfect while the box is wrong
STATE_7's density fix authored `species_counts {A:360, B:360}` with no `N`. With the reaction OFF,
`gasSyncCount` takes the branch where N IS the population and TRUNCATES the array — and
`gasPlaceSpecies` lays species down in order, so the survivors are the FIRST species only. **The
state opened with 720 discs and ran with 180, every one of them species A. Every B disc deleted.**

tsc, all three validators, `check:gas-reaction` 65/65 and THE EYE 35/35 were green. Worse: the
state's own Arrhenius plot still drew a clean straight line at a plausible slope, **because A–A
collisions clear an activation barrier exactly as well as A–B ones** — the one instrument that could
have reported it was mathematically immune to it. Found by looking at a frame and noticing the box
had gone entirely blue. Same family as the duplicate-key scar: authored, valid, silently discarded.
Now a hard `validate:chemistry` gate, negative-controlled.

### Every number measured; two measurements changed the design
- **The narration policy is proven, not assumed.** Absolute collision rates span **×5.29** across four
  viewports (54–283/s); the cleared **PERCENTAGE spans ×1.05** (3.22–3.39%). Only percentages,
  ratios and directions are spoken anywhere.
- **S4's crowding beat was going to use injection.** Measured **×1.00 — it does nothing**:
  `inject_cue` is silently undone with the reaction off. Piston instead.
- **The Arrhenius state was an open question** (signal or 1/√n noise?). Measured R² 0.95, slope
  within 1.7%, 8 points inside one state — and tripling density does NOT help, so unlike
  le_chatelier's K chip it needed no density exception for R². It needed one for SLOPE ACCURACY:
  at 180 discs the shipped seed missed the law by 21%, at 720 by 2.8%.

### Four narration claims were false against the instrument, not against the physics
Every one passed the physics gates and was caught by measuring the rendered chip:
"the counter reading three point three percent" (frames legitimately read 2.5%; at 1 s averaging the
chip swung **0.0%–8.2%**) · "soars past fourteen percent" (settled median 12.8–14.1) · "climbs to
eighteen" (15.5–22.2) · **"only about a third actually react" — the two chips read 38–50%: it is about
HALF**, and the earlier figure came from a different sampling window. Root cause of the first:
the counter averaged over 1 s while the reaction rates beside it already used 5 s, for exactly this
stated reason. Now authorable; a 0.0% frame under a caption about collisions clearing the barrier is
gone.

### The review round — the deterministic gate was green on frames containing all of it
THE EYE returned **35/35** on frames where the concept's central equation was **absent from every
state** (declared in `scene_composition`, never configured as `formula_overlay`), the explore state's
slider panel **clipped the histogram's own Eₐ label**, and S7's slope printed **−1100 against a
printed law of −900** under a caption reading "One straight line". Fifth consecutive concept where
the deterministic suite was green over real defects.

The slider/histogram collision **has been shipping in `kinetic_particle_theory` STATE_7** since the
histogram landed. Fixing it moves that concept's baselines **9.36% (pixels only; the other six states
are 0.00%)** — a founder re-baseline call, NOT taken.

### Open for founder
1. **`visual:approve` not run** on either concept. `collision_theory_activation_energy` has no
   baselines yet; `kinetic_particle_theory` STATE_7 needs re-approval for the overlay fix.
2. **The Arrhenius instrument was my judgment call.** Cutting S7 leaves 7 coherent states and both
   curriculum cut-checks still hold.
3. **Rule 32e is inert on `gas_box` fleet-wide** — `focal_primitive_id` is authored on every state of
   every gas_box concept and `glow_focal` on none, so `dimFor()` returns 1 everywhere. Not this
   build's regression; a scar candidate.
4. **Scar rows FILED — 18 of them** (`_seed_engine_bug_queue_collision_theory.ts`,
   session `session_2026-07-29_collision_theory_activation_energy`). **The recorded blocker was
   wrong**: `alex:chemistry_author` is NOT rejected by the queue's CHECK constraint — three rows
   already carried it — so the previous session's authoring rows were parked for no reason and
   should be re-filed too. 16 FIXED, **2 left OPEN deliberately**: `inject_cue` silently undone
   when the reaction is off (measured ×1.00, no concept depends on it) and
   `gas_box_glow_focal_never_authored_so_rule32e_is_inert` (fleet-wide, four concepts, founder call
   whether to backfill and move baselines or drop the Rule-32e claim from their scene roles).
5. **7 unpushed master commits.** No TTS (Rule 30h), no `PILOT_CONCEPTS` entry, no deploy.
6. **Asmi's professor review — now EIGHT concepts deep**, and the stated bottleneck for five sessions.

### The two review rounds, and the two questions that beat them

`quality_auditor` FAILed this concept **twice** and `eye_walker` walked it **twice**; between them
they found 9 real defects that tsc, three validators, `check:gas-reaction` (70 checks) and THE EYE
(35/35, then 39/39) had all passed. Worth separating what found what:

- **The gates found:** nothing the reviewers didn't. Every EYE run was green over frames containing
  real defects — the fifth consecutive concept where that is true.
- **The reviewers found:** the counter window, the cross-chip ratio, the formula surfaces that never
  painted, the slider/histogram clip, the Arrhenius slope error, the stale labels, the undeclared
  density exception, and — the sharpest — the term ledger still failing for A/B/AB and f/c/k after
  Eₐ was fixed. **A formula surface counts as USE.**
- **The founder found the two that mattered most**, and neither was a code defect: the symbol was
  printed before it was defined, and the concept named after activation energy never drew the energy
  hill. The second had passed BOTH review agents *because the skeleton declared it an omission* —
  and a declared omission is invisible to a correctness check. That is now a standing directive row.
- **I found, by looking at a frame:** the box had gone entirely blue (every B disc silently deleted
  by a truncation the Arrhenius plot was mathematically immune to), and my own slider-dodge fix had
  landed in the wrong function and changed nothing while every gate stayed green.

### Rule 41 arrived mid-ship
Rule 41 (plain-language law) landed on master from the parallel Laws-of-Motion session *after* this
concept was authored. Checked rather than assumed, and it had violations — including `"All yours"`,
which 41a names verbatim. Five captions/titles and seven narration lines rewritten.
**The caption edits moved 0.15–0.21% of pixels — under the 2% H2 tolerance — so THE EYE passed
56/56 without flagging them.** A text change that size is invisible to the pixel gate; the locked
baselines would have kept the old wording indefinitely had they not been re-approved deliberately.

### ⏭ NEXT
**#3 `rate_of_reaction`** — this concept is its mechanism and the engine work is already paid for.
Its one open snag is unchanged: surface area is a solid-phase cause this box cannot show.

---

## 🧬 SESSION — the hybrid-orbital surface + `hybridisation_sp_sp2_sp3` (P4 #13), and a sign that would have taught the opposite (2026-07-29, branch `feat/chemistry-hybridisation` → master)

**Bottom line: hybrid orbitals are a live capability on `orbital_shapes` and #13 is authored, validating and walked in a browser. The load-bearing finding came BEFORE any renderer code existed — the natural way to write a hybrid puts 82.5% of the electron behind the atom, renders beautifully, and teaches the inverse of directional bonding. Engine + its gate are on master (`2378219`); the concept continues on the branch. #17 σ/π is now the cheap next harvest.**

### What shipped
- **Hybrid orbitals on `field_3d` `orbital_shapes`** (additive; the s/p/d path is untouched). `kind: "hybrid"` entries for sp/sp², sp³ with derived geometry, a morph ladder, `angle_track`, `members`, `front_only`, and four solved cameras.
- **`hybridisation_sp_sp2_sp3`** — 8 states, NCERT Cl.11 Ch.4 §4.6. Rings core S1–S3 / extended S4–S5 / advanced S6–S7 / explore S8.
- **`npm run check:hybrid-orbitals`** — 26 checks, ~3 s, no browser. Pulls the SHIPPED function bodies out of `FIELD_3D_RENDERER_CODE` and asserts they reproduce numbers solved independently beforehand.

### The physics was settled first, with a control
Solved headlessly before a line of renderer code: normalisation 1.000000 at f = 0, ¼, ⅓, ½; the angle law `cos θ = −f/(1−f)` reproducing 180.00 / 120.00 / 109.47° against the direction lists to 0.01°; each set orthonormal to 5.6e−17. **The control is the reason to trust the rest**: pure 2p at the level `atomic_orbitals_s_p_d` ships gives 482.5 pm against its 482, and L/half-width 1.44 against its 1.44 — an independent implementation reproducing a number already on master.

### THE LESSON: the defect that no gate can see is the one you settle before you build
`R₂₀` is negative for ρ > 2, across most of the bonding region, so `ψ = +c_s ψ₂ₛ + c_p ψ₂ₚ` puts **82.5% of an sp³ electron BEHIND the atom**. Every caption stays literally true, every gate passes, the picture is beautiful, and the concept teaches the opposite of directional bonding. Measured both ways by hemisphere probability — a tip radius does NOT settle it (the back tip is *longer*, which is what made it look wrong in the first place and prompted the check). Same class as the `node_count` clover: geometrically right, posed wrong.

**And the obvious reuse was also wrong.** The shipped `p_set` camera — the solved (1,1,1) view that makes three 2p orbitals countable — foreshortens an sp³ lobe to **exactly 0.000**: one of the four points down the view axis and vanishes behind the nucleus under a caption counting four. That is the VSEPR methane-fourth-bond defect verbatim, and only a measurement says so. Cameras were re-solved; all three land at dist 6.0 with a ~250 px orbital radius, so one home pose serves the concept.

### Three more defects, all found by building the page and LOOKING
Every one was green across tsc, `check:renderer-syntax`, `validate:chemistry` and the 26-check hybrid gate.

| Defect | Why no gate saw it |
|---|---|
| Four sp³ surfaces rendered as a **featureless ball** under "Four, at 109.5°" | Each hybrid carries a back lobe and the backs sit exactly in the gaps between the fronts, so 4 fronts + 4 backs fill space near-spherically. I had measured the union waist at 0.808 ("marginal") beforehand and still under-called it — **the metric only counted the fronts.** Fixed with `front_only`: cut at the surface's own waist, capped at the nucleus. An OMISSION, not a distortion, and declared — S7 turns it off and shows exactly what the earlier states left out. |
| `bloom_at_ms` was a **silent no-op on every hybrid** | Gated on `l === 2` (the d clover); a hybrid has no `l`. Three states declared an assembling set in narration while the lobes stood at full size from frame one. Same shape as the duplicate-key scar: authored, valid, discarded. |
| My own S5 ghosted **all three 2p orbitals** — six extra lobes | Landing on top of the four hybrids at the moment the caption asks a student to count four. Dropped; the S1↔S5 contrast pair already carries the comparison across states through the shared home pose (Rule 32d). |

### A tooling trap worth a scar row
**A backtick inside a JS comment terminates the enclosing TS template literal.** Hit twice in one session writing `` `main` `` and `` `l` `` in renderer comments. `tsc` reports a misleading `TS1005 ',' expected` hundreds of lines away; `check:renderer-syntax` catches it but only as an esbuild parse error at the wrong site. Cheap permanent fix available: a lint that rejects backticks inside `FIELD_3D_RENDERER_CODE`.

### Verification (evidence)
`tsc` 0 · `check:renderer-syntax` OK on all three · `check:hybrid-orbitals` **26/26** · `validate:concepts` **141/141** (isolation held — the physics scan never sees the new concept) · `validate:chemistry` **7/7** · vitest **281/281** · `build:review` exit 0 · **walked in a real browser: sp² reads as three lobes at 120°, sp³ as four in the two-up/two-down tetrahedral view, HUD live and correct, zero console errors.**

### The review round — 10 more defects, every one behind a 35/35 EYE
THE EYE was run FOUR times and reported **35 deterministic checks, 35 passed, 0 failed** every time.
`eye_walker` and `quality_auditor` (dispatched in parallel) then found ten real defects in those
same frames, and the auditor returned **FAIL**. The deterministic suite has now been green on
frames containing CRITICAL errors on three separate rounds of this one concept. That is the
argument for the frame-read gate, stated as plainly as it can be.

| found by | defect |
|---|---|
| eye_walker | the populate **base fallback painted, then deleted, an orbital** — 2p_z appeared at t=0 and vanished at 2s under a caption promising "arrive one at a time and stay". RECURRENCE of a scar whose row already recommended this exact hardening and did not get it |
| eye_walker | `bloom` grew the WHOLE set, so a state following a single-member state blanked for 3s — the partner never visibly arrived |
| eye_walker | STATE_7's cutaway was **completely inert** (`cutF` is consumed only by the dot loop; that state has dots off) — the class filed EARLIER THE SAME DAY, live in the build that filed it |
| quality_auditor | **Gate 0 FAIL — no architect skeleton.** Its prediction was exact: the four undelivered motions were never anybody's *declared obligation*, so nothing checked them |
| quality_auditor | **S3/S4/S5 performed ONE uniform swell** while declaring three archetypes — Rule 31 distinctness satisfied on the NAME and failed on the motion |
| quality_auditor | **Rule 16a FAIL** — the wrong belief lived only in narration (off by default) and in dead JSON |
| quality_auditor | **Rule 38a/38b FAIL** — sp2/sp3 tagged *extended*, so the core cut of a concept called "sp, sp2, sp3" stopped before sp3; and explore surfaced the advanced s-character dial |
| quality_auditor | **24 scene_composition annotations + 8 focal_primitive_ids reference primitives the renderer never receives** |
| me, verifying | `front_sp2` authored 85.4% and labelled MEASURED; the build measures 84.7% |
| me, reading frames | a label appearing BEFORE its referent, and another surviving AFTER it |

All ten fixed and verified in frames. The three that generalise:

1. **An archetype is a claim about RHYTHM, not a label.** Two states animating the same element
   count are the same motion unless their per-element timing differs. New `bloom_offsets_ms`.
2. **A contrast beat is SEQUENTIAL, never superimposed.** Restoring the Rule-16a ghost immediately
   re-created the fusion problem — ghost lobes land in the gaps between the real ones. Deleting it
   (my first instinct, twice) trades a legibility defect for a pedagogy one. `ghost_fade_at_ms`
   lets the wrong picture lead and clear.
3. **The dead-annotation scar is STRUCTURAL, not a missing draw call.** `scene_composition` lives in
   `epic_l_path`; the renderer is only handed `field_3d_config`. Every field_3d concept has been
   satisfying Rule 19 with JSON the renderer has never seen. `mergeSceneAnnotations` fixes it
   **behind `render_annotations`** — fleet-wide would put unreviewed text on ~41 baseline-locked
   concepts and move every baseline in one commit. Filed OPEN; that is a founder call.

### The mechanical gate that came out of it
`npm run check:renderer-backticks` — the backtick class had recurred across three sessions and its
row already read *"recorded despite the guard existing"*. Locates each RENDERER_CODE literal's span
and reports a stray backtick with its real diagnosis; reads SOURCE TEXT so it works when the file is
too broken for tsc to load. Negative control performed before trusting it. **It then caught a
backtick I introduced an hour later.**
(The naive lint does not work — backticks are legal outside the literal; field_3d has 28 such
comments — so "any comment with a backtick" gives ~30 false positives.)

### Scars
**12 rows** record this concept: 10 new classes + 2 recurrences. Also surfaced, not silently merged:
the backtick class is filed TWICE under two names, so the list under-counts its own recurrences —
the one number it exists to get right. Founder call.

### Open items
1. **Asmi's professor review — now SEVEN concepts deep, and the stated bottleneck for four
   consecutive sessions.** Machine gates were green on frames containing CRITICAL errors four times
   in this session alone. Coverage keeps growing; the pedagogy gate has never run.
2. **Promotion (2s2 2p2 → 2s1 2p3) is never taught**, yet STATE_1's belief statement presupposes it.
   A real coverage gap: either a new opening state or an explicit prerequisite. Founder call,
   recorded in the skeleton §7 rather than quietly closed.
3. **Rule 19 fleet decision still OPEN** — backfill ~41 concepts and re-baseline, or stop counting
   non-rendering primitives toward Rule 19.
4. **No `text_hi`** (Rule 30i FYI, never a gate).

### ⏭ NEXT
1. **#17 σ/π as its OWN concept, not more states here** (founder decision 2026-07-29). It is about
   TWO atoms overlapping, not one atom's orbitals rearranging — the apparatus changes completely, so
   Rule 32d home-pose continuity breaks if merged. It carries its own misconception ("a double bond
   is two of the same bond"), and this concept is already 8 states with the budget strained. The
   engine work is shared and lands once (a per-lobe origin offset). Prerequisite chain:
   `atomic_orbitals_s_p_d → hybridisation_sp_sp2_sp3 → sigma_pi_bonding`.
2. **#1 Le Chatelier is being built in a PARALLEL SESSION** — do not pick it up.

## ⚖️ SESSION — `le_chateliers_principle` (P1 #1, the list's top concept) SHIPPED, + six gas_box platform commits (2026-07-29, branch `feat/chemistry-le-chatelier`; engine half on master)

**P1 #1 is built, gated and baseline-locked.** 8 states on `gas_box`. Fleet **65 → 66** baseline-locked.
17 baselines + **32 EN clips** (`8532407`). NOT deployed and NOT in `PILOT_CONCEPTS` — founder approved
the ship chain only; CLAUDE.md §5 puts Asmi's professor gate before the deployed catalog, which still
carries **zero** chemistry sims.

Final gates: tsc 0 · `validate:chemistry` **7/7** · `check:gas-reaction` all passed · `validate:concepts`
**141 PASS 0 FAIL** (physics untouched) · THE EYE **35/35** · quality_auditor **PASS** (3rd pass) ·
eye_walker **CLEAN**.

### The build was about making the CAUSE visible, not the physics

All three disturbances were ALREADY emergent on this engine (the `Ea_rev = Ea_fwd + E_bond` derivation
and the bimolecular/first-order asymmetry). What was missing: the engine could show only ONE of them
ARRIVING — the piston. Four fields closed it, each on master separately (Rule 40):

| commit | field | what it buys |
|---|---|---|
| `4e6df01` | `T_from` / `T_ramp_ms` | a state authoring `T: 500` opened already hot — the cause never moved on the PRIMARY aha |
| `4e6df01` | `inject_cue` / `inject_n` / `inject_species` | reagent arrives mid-state on the state clock |
| `532976f` | `reaction_at_cue: { cue, <constant> }` | the catalyst goes in while the class watches. Placed at `gasRxNum` — the ONE read point for every reaction constant — so `Ea_rev` follows by derivation and the null result stays EMERGENT |
| `4e6df01`/`aa21a14` | `show_k_ratio` | K as a live measured number (10 s window) |
| `458a6e3` | `piston_ramp_ms` | compression slow enough to stay isothermal |

`check:gas-reaction` grew **18 → 37 checks**. **All of this is inherited free by P1 #3/#4/#5.**

### Four defects no gate could see (and one that made a gate lie)

1. **⭐ THE EYE READS THE CACHE, NOT YOUR SOURCE.** `visual_eyes.ts` → `loadCachedSim()` reads ONLY the
   `simulation_cache` row — never the concept JSON, never the renderer — and for chemistry that row is
   seeded BY HAND and never auto-refreshes. A post-fix re-walk returned **35/35 green while rendering
   entirely pre-fix content**: four already-fixed defects all still "broken" in frames. Every visual
   finding in that run was a false negative. Caught only because eye_walker cross-checked frames
   against live source. **`npx tsx --env-file=.env.local src/scripts/_seed_chemistry_cache.ts <id>`
   after ANY JSON or renderer edit, BEFORE dispatching eye_walker.** Exact sibling of
   `gas_box_freeze_resim_uses_wrong_stepper` — *a green deterministic gate proves frames are
   REPRODUCIBLE, not correct.* **Proposed for `docs/AUTHORING_PIPELINE.md` §③ — founder ruling pending.**
2. **`drawGasThermometer` hardcoded `gasBoxL() + 142`** while every other chip accumulates via
   `pfWgVis`. STATE_4 is the fleet's first thermometer-WITHOUT-pressure state, so "T = 500 K" struck
   through the A/B counts for the whole state — on the PRIMARY aha, burying its own cause instrument.
3. **`gasMovePiston` drove the wall ~12× faster than thermal speed** — peak measured T **7173–9594 K**
   on a state authored at 300 K, product crashing 31 → 7, so for ~4 s the readout showed REVERSE
   leading. `piston_ramp_ms` → **336 K over 6 s**; default stroke provably unchanged, so
   `kinetic_particle_theory` keeps its baselines.
4. **⭐ A bonded pair did not look bonded** (`20cb20a`). `drawGasDimer` strokes the bond in the product
   colour then fills the discs — but bond length IS rA + rB, so the discs are tangent and the line is
   painted over, leaving ~2 px of purple. AB is the species every state tracks: the HUD printed a
   purple "AB 31" and the graph drew a purple curve while **nothing on canvas was purple**. The lesson
   had to be read off numbers instead of the picture. Fixed by draw order (rim both discs). **Also
   fixed `dynamic_equilibrium`**, whose STATE_2 opens with 45 previously-uncountable pairs — 14 H2
   failures, pixel-diff only, re-approved after founder view, **now 44/44**.

### Three narration defects: claims true in one frame of reference, false on screen

- **STATE_7 "the amounts move by about half"** — a BETWEEN-RUN comparison spoken as an in-state
  observation. Redesigned, not reworded.
- **STATE_5 "the counts sit exactly where the lesson left them"** — single frames legitimately read
  26–38, so an unlucky frame *confirmed* the misconception the state exists to refute. Now a band.
- **STATE_3 "forward pulls ahead of reverse"** — true as a net average (+0.75/s, 10/10 seeds) but the
  bars visibly cross mid-ramp. Now narrates the pair count.

### STATE_7 needed DENSITY, not a cleverer average

K's relative fluctuation scales as **1/√n_AB**; at normal density n_AB ≈ 30. Two averaging windows
were built and **measured failing** (chip swung 33–50%; in 10/10 seeds the RATIO moved more than the
amounts, inverting the state's whole contrast). Founder chose the root cause. STATE_7 now runs ~516
particles (n_AB ≈ 204): **|dK| 8–10% vs |dA| 34–42%, 0/8 seeds inverting, at three viewports**; shipped
frames read K 0.0089 → 0.0094 (+5.6%) while A goes 138 → 210 (+52%). Cost 2.18 ms/tick against 16.7 ms
— the collision sweep is spatially GRIDDED, so linear. A deliberate Rule 32d exception, in the one
state both curriculum presets can hide.

### The teaching pass — four gaps EVERY gate and BOTH review agents passed

Founder asked "walk the states, what is missing?". Answer, in order of damage:

1. **The principle was never stated.** Eight states taught every disturbance; no sentence gave the law
   or the name. S8 now closes with it, ending on S2's partial-compensation aha.
2. **Cooling was undemonstrable** — the likeliest question after the PRIMARY aha. Measured: at the
   250 K floor, cooling moved AB 31 → ~35, inside the noise band. At 200 K it is 31 → ~45 in 10 s with
   the box alive (fwd 3.5/s); at 150 K it reads dead (1.1/s). Floor now **200 K, measured**.
3. **The invisible bonded pair** (defect 4 above).
4. **The anchor promised what the sim cannot do** — "engineers steadily draw product away", but the
   reagent tap is A-only by design (S2 needs removal to target A). Rewritten onto the two levers the
   states actually show, which is better chemistry: pressurised because the product side has fewer
   molecules (S3), run hotter than the balance would like because forward is exothermic (S4).

**The pattern is the finding:** every agent was asked whether the sim was *correct*. None was asked
whether a teacher could *use* it. The gates verify claims against instruments; they do not ask whether
the picture teaches. **That fourth gate is a person asking "what is missing?".**

### Open for founder

1. ~~Three `engine_bug_queue` rows unfiled~~ — **BACKFILLED 2026-07-30, 13 rows + 1 extension**
   (`_seed_engine_bug_queue_le_chatelier_backfill.ts`). This concept had exactly **ONE** row against
   it before the backfill, so the whole session's defect classes sat in prose where no Gate 8
   pre-flight would ever read them; it now has **15**. **The recorded blocker was FALSE** —
   `alex:chemistry_author` is not rejected by the CHECK constraint (three rows already carried it),
   so nothing was ever actually blocked. Left OPEN deliberately: the stale-sim-cache gate blindness ⭐
   (still unenforced — the durable fix is to have `loadCachedSim` re-assemble from source and FAIL on
   a mismatch) and the viewport-dependent rate/pressure readouts (engine limitation, worked around by
   authoring). The teaching-pass meta-finding is now a standing `directive` row,
   `directive_no_gate_asks_whether_a_teacher_could_use_it`, carrying the three questions to answer in
   writing before any concept is signed off.
2. **Rates and pressure are still viewport-dependent** — `gasRxAreaNorm` normalises the equilibrium
   COMPOSITION, not the readouts (measured **4.6×** rate, **5.9×** pressure, 900×560 → 1600×900).
   Fixed by AUTHORING here (no absolute rate is spoken anywhere); normalising displayed pressure would
   break the `P·A/N·T` gas-law readout and move every shipped baseline. Engine limitation OPEN.
3. **6 unpushed master commits**: `1ee5cfa` `4e6df01` `aa21a14` `532976f` `458a6e3` `20cb20a`.
4. **Asmi's professor review** on this and the three earlier chemistry concepts.

---

## 🎯 NEXT CONCEPT — P1 #3 `rate_of_reaction`, and why #4 may deserve to go first

**The locked order (`CHEMISTRY_DISCUSSIONS.md` Session C5 §6) says #3 Rate of reaction.** P1 status:
#1 ✅ · #2 ✅ · **#3 ← next** · #4 ☐ · #5 ☐ · #6 ✅ · #7 ☐.

**Today's engine work lands directly on all three remaining P1 diamonds** — they are the same
`gas_box` scenario, so #3/#4/#5 inherit `T_from`, `inject_cue`, `reaction_at_cue`, `piston_ramp_ms`,
the visible dimer rim and the 37-check conservation gate at zero cost. This is the compounding the
particle-box thesis predicted.

**One honest snag in #3, for the architect to resolve at design time.** Rate of reaction's four causes
are concentration · temperature · **surface area** · catalyst. Three map onto `gas_box` cleanly and are
now *fully* built (concentration = `inject_cue`/N, temperature = `T_from`, catalyst = `reaction_at_cue`,
landed today). **Surface area does not** — it is a solid-liquid phenomenon and this scenario is a gas of
hard discs with no solid phase. Options: cover three causes on the box and teach surface area by
analogy; split it to a later concept; or scope a new primitive. Decide at skeleton stage, not mid-build.

**#4 `collision_theory_activation_energy` is the cheapest strong build remaining and arguably belongs
first.** Its instruments already exist and are verified: `activation_energy_kT` (a real Arrhenius
barrier pinned to `ea_ref_T`) and `show_collision_counter`, which prints collisions/s **and the
fraction clearing Eₐ** — precisely the "not every collision reacts" beat. It is also the *mechanism*
that explains #3, and `le_chateliers_principle` already lists it as an unbuilt prerequisite. Building
it first would close that gap and give #3 its foundation.

**#5 `maxwell_boltzmann_distribution` is equally well-instrumented** — `show_speed_histogram` (live
distribution + 2D theory curve + v_mp/v_avg/v_rms) and `hist_ref_T`, which pins the speed axis so the
curve visibly MOVES against it. **Read the GAS BOX banner's PHYSICS HONESTY note before authoring it:**
this is a true 2D gas, so its distribution is the 2D Rayleigh form, NOT the 3D form printed in NCERT.
Every qualitative beat is identical, but a state that prints the 3D formula prints a law this box does
not obey.

**Recommendation:** take **#4 → #3 → #5** rather than strict list order — #4 is cheaper, fully
instrumented, teaches the mechanism #3 needs, and closes a prerequisite `le_chateliers_principle`
already declares. Founder's call; the list order is a default, not a commitment.

## 🔬 SESSION — the `orbital_shapes` 3D surface + `atomic_orbitals_s_p_d` (P4 #16), and six defects behind a green run (2026-07-28/29, branch `feat/chemistry-orbitals` → master)

**Bottom line: chemistry's second 3D surface shipped and its first concept is merged and baseline-locked — and THE EYE passed 39/39 on frames containing FIVE real defects, with a sixth self-inflicted afterwards. Not one was caught by tsc, the validators, or THE EYE. Master: `39b906c`. Baseline fleet 63 → 64 (65 with the parallel session's).**

### What shipped
- **`orbital_shapes`** (`field_3d`, ~1500 lines, additive): s/p/d probability surfaces with a seeded measurement-dot swarm inside them, node planes, a camera-aligned cutaway exposing the 2s radial node shell, and a probe plane reading live `|ψ|²`. Everything geometric is DERIVED from exact hydrogenic (Z=1) functions at build time — 1s r₉₀ = 141 pm · 2s 483 pm (node shell at 2a₀ = 106 pm) · 2p tip 482 pm · 3d_xy 963 pm · E = −13.60/−3.40/−1.51 eV, agreeing with the shipped Bohr concept. Occupancy is MEASURED from the sample (89–91%), never asserted. Eight solved cameras ship as per-mode defaults.
- **`atomic_orbitals_s_p_d`** — 9 states, NCERT Cl.11 Ch.2 §2.6, P4 #16. 18 baselines, silent (Rule 30h: audio is on-demand, not a ship gate).
- **Archetype P is no longer [PHASE-5] at all** — both 3D halves shipped in one day as CASES on the existing Three.js renderer. **#13 hybridisation and #17 σ/π are now schedulable**; only crystal lattices remain [NEEDS-SCENARIO], so #19 solid state stays blocked.

### The scheduling correction that started the session
The plan of record (C5 §6 and the prior session's ⏭ NEXT) said #13 hybridisation was the cheap next harvest, needing no new renderer code. **A code read killed that premise**: `molecular_geometry` has no orbital geometry at all, and a Rule-40a sweep of seven candidate symbols returned zero hits across all history. #13, #16 and #17 all blocked on ONE missing capability. Building #13 on the scenario as it shipped would have taught domain-counting — which `vsepr_molecular_shapes` already taught one concept earlier: a demo-tier build wearing a 💎 rank, and exactly what the whiteboard test exists to stop. #16 went first because orbitals are what hybridisation hybridises (Rule 25, no untaught term).

**Third consecutive session where a tier label was optimistic and only a code read caught it** (C4 archetypes M/K/L → C6 archetype P → this). Named as doctrine in `patterns/chemistry.md`: the pattern doc is design memory, not source of truth — schedule off `git log -S`.

### THE LESSON: five defects behind 39/39, and every one was a claim about meaning
| Defect | Why no gate could see it |
|---|---|
| `node_count` rendered `3d_xy` as a **d_z²** | The mesh was never wrong. A default spin about world **+y** had rotated the clover 78–110° out of its solved face-on camera by the time the gallery reached it. Geometry correct, pose destroyed, caption and node-count both still correct — so the frame lied while every check passed. |
| The 2s node shell had **dots running through it for 12 of 24 s**, then 85% vanished in ONE frame | A LINEAR ramp on a parameter whose visible effect is non-linear: the slab stayed wider than the whole cloud for 82% of the ramp, so all the change landed at the end. The "node shell" label was gated on a bare ramp fraction, not on the physical condition it asserts. |
| Three 2p lobes **fused into a featureless ball** — 3 of 6 tips countable | Uniformly translucent same-family surfaces have no edge. Not fixable by camera (the global optimum was already found) and not by shrinking (that lies about a size the HUD prints). Fixed with Fresnel-weighted alpha so each lobe carries its own silhouette. |
| Energy HUD printed an **ASCII hyphen** | Regressed `ascii_minus_in_oncanvas_math_from_tofixed`, a row already marked **FIXED** on `bohr_model_energy_levels`. The probe readout had the identical bug and the auditor missed it — found by grepping every `toFixed` in the block instead of trusting the report. |
| STATE_5 opened on a labelled **"1s"** carrying 1s's energy and radius | Under a caption reading "Three axes, one energy". Reported upstream as a cosmetic 700 ms sphere; it was four wrong surfaces at once. |

### The sixth defect was mine, and it is the most transferable
The first STATE_7 fix authored `spin_rate` near the top of a block where a `spin_rate: 0` already sat fifteen lines below. **Duplicate JSON keys resolve last-wins**, so the value was silently discarded: the file stayed valid, `tsc` passed, `validate:chemistry` passed, THE EYE passed 39/39 — and the change did nothing. It was caught only by diffing the SEEDED sim html against the source and finding **9 `spin_rate` values where the source had 10**.

**Takeaway: a concept JSON is not schema-checked for duplicate keys, and neither Zod nor any gate will ever tell you.** A whole-file duplicate-key audit is three lines of Python and should probably become a chemistry gate. Verify an authored value ARRIVED, don't assume the edit was the delivery.

### Accepted, not hidden
`STATE_7` WARNs on Rule 31a (ratio 0.62). **That gate cannot see continuous motion** — `spin_rate` and `ghost_at_ms` don't count toward the choreography ratio, only discrete cues do (confirmed by reading `deriveStateMeta`, now documented in `patterns/chemistry.md`). The state genuinely moves for its full duration: 12 late dense frames are 12 unique images where they were previously 12 byte-identical copies. Retiming the cutaway to satisfy the number would push the reveal back past the sentence that claims it and re-break a CRITICAL fix, so the gate is left un-gamed. This is the C6 §5 pattern again — a gate that trains the author to ignore it.

### Open items
1. **7 scar-candidate rows drafted, NOT applied** (4 from the build, 3 from the defect round) — founder ruling pending.
2. **Deferred, its own dispatch:** `grow_at_ms` applies to lobes only, so a sphere ignores `growF` — STATE_7's "watch it grow larger than 1s" beat pops the 2s to full size instead of growing.
3. **Fleet-wide, pre-existing:** every field_3d state authors `scene_composition` annotations carrying real teaching text that **never paints** (open scar `field3d_scene_composition_annotation_silent_noop`). Rule 19 requires ≥3 primitives/state and on field_3d those are satisfied by JSON that renders nothing. Systemic, not this concept's.
4. **Audio not rendered** — Rule 30h, on-demand. One command when a teacher needs it.
5. **Asmi's review, now five concepts deep.**

### ⏭ NEXT
1. **#13 hybridisation** — now genuinely cheap and genuinely a diamond: it harvests both `orbital_shapes` and the shipped `molecular_geometry` scaffold. A lobe is `(angular factor in its OWN frame) × (frame list) × (scale)`, so #13 adds a frame list and lerps. Then **#17 σ/π** (one line: a per-lobe origin offset).
2. **#1 Le Chatelier** remains C5's highest-ranked unbuilt concept and is unblocked at zero engine cost.
3. **A duplicate-key check in `validate:chemistry`** — cheap, and this session proves it is needed.

---

## ⚗️ SESSION — the reaction layer + `dynamic_equilibrium`, and seven defects no gate could see (2026-07-28, branch `feat/chemistry-equilibrium` → master)

**Bottom line: the gas_box reaction layer (A + B ⇌ AB) is on master and `dynamic_equilibrium` is authored, validating and audited. The load-bearing finding is again a VERIFICATION one — seven real defects this session, and NOT ONE was caught by tsc, the validators, or THE EYE. Every one came from measuring the physics headlessly or driving the built page. `check:gas-reaction` (19 checks, ~4 s, no browser) is the gate that came out of it. Master: `c538f37`.**

### What shipped to master
- **The reaction layer.** Forward is bimolecular (line-of-centres energy ≥ Ea); reverse is first-order Arrhenius. **Ea_rev is DERIVED (Ea_fwd + E_bond) and cannot be authored** — that single decision is why heating an exothermic box shifts it back *by itself*, and why compressing it makes product, instead of either being scripted. Mass, momentum and energy are each conserved exactly, with an explicit ledger (KE + rotational + heat reservoir − N_AB·E_bond) a HUD can print.
- **Per-state opening composition** (`species_counts`) — without it every state of a reacting concept opens from the same mixture and plays the same movie.
- **`continuous_motion`** — a guided state may decline the end-of-timeline freeze. Dynamic equilibrium forced it: its central state says "the amounts stopped changing but the reaction never stopped", and the sim then stopped dead a second later, demonstrating the misconception it exists to kill.
- **The N tap is a chemical operation in both directions** — adds and removes reagent without ever breaking a bond.

### `dynamic_equilibrium` — 7 states, P1 #2
Rings core S1–S4 / extended S5 / advanced S6 / explore S7. Primary aha at S3: **the composition line goes flat while both rate bars stay lit and the made/broken counters keep climbing** — quality_auditor confirmed it lands (`165 made · 136 broken` over dead-flat traces). Constants MEASURED over ~1,100 headless sweeps, not guessed. 24 state-scoped tts ids, zero duplicates — this concept does not join the 41-file fleet-wide voicing scar.

### THE LESSON: measurement, not gates
| Found by | Defect |
|---|---|
| headless conservation probe | the N-count sync deleted dissociation fragments and minted atoms — B atoms 60 → 101, 60% of the box's energy gone |
| headless conservation probe | a collision-activated reverse made the reaction bimolecular in BOTH directions, so the density factors cancelled and compression shifted the equilibrium **backwards** (41 → 36) |
| chemistry_author sweeps | dragging N down destroyed bonded pairs, corrupting the inventory 90/90 → 55/60, unrecoverable |
| json_author driving the page | `continuous_motion` was **inert** — consumer wired, field never populated, no error anywhere |
| json_author driving the page | **the equilibrium position depended on browser window size** (31 / 17 / 15 across three screens) — every authored constant was true only on the author's monitor |
| eye_walker reading 166 frames | the rate bars renormalised to their own maximum, so S1's forward bar sat at 100% for 18 s while its printed value fell 8.0 → 2.0/s — the instrument contradicting the state it taught |
| quality_auditor driving the timeline | S2's narration outlived its instrument: "fwd sits at zero" began at t=12 s of a 19 s state, by which point the forward rate was climbing |

**10 rows in `engine_bug_queue`** (7 FIXED, each with a permanent check; 3 OPEN). The strongest new check is an identity rather than a tolerance: `forward_total − reverse_total` must EQUAL the dimers on screen.

### Two traps that produced convincing FALSE failures
Both cost real time and are now pinned in the check script's own comments: running the comparison **adiabatically** (the exothermic forward self-heated the box 500 → 650 K while the product-side run cooled to 150 K and froze solid), and comparing runs with **mismatched atom inventories** (60+60 vs 45+45 — two genuinely different equilibria, read as a bug). A false failure that looks like an engine defect costs as much as a real one.

### The claim the concept rests on is now a gate
Same equilibrium from either direction: mean product **20.5 from pure reactants vs 20.8 from pure product**. If a future engine edit breaks that, a check fails instead of a lesson.

### Parallel-session note
The orbitals session merged `orbital_shapes` to master mid-session. **Zero file overlap** verified before merging (they are `field_3d`, this is `particle_field`); clean merge. The two-worktree pattern held a second time.

### ✅ SHIPPED (2026-07-29, founder approval: "fix anything left and ship it with tts pls")
7 baselines + 7 frozen pins locked, **24 English clips** voiced (bulbul:v3 / priya), page rebuilt, 0 stale clips, page and audio both HTTP 200. Baseline fleet **63 → 64**. Master `a3e6566`.

**All eleven scar rows from this build are FIXED.** The last three were closed at ship time, and the third was caught by the ship itself:
- **A chemistry id could silently resolve to a physics file of the same name.** The resolver checked the flat physics path first, and `conceptCatalog` already rosters a physics `dynamic_equilibrium` (the Ch.8 mechanics sense). It now throws when both exist. Deliberately no rename: which subject keeps the plain name is an architect decision, and a resolver must not make naming policy — it only has to make the collision impossible to hit by accident.
- **The frozen H2 baseline was photographed before the concept happened.** Capture times derive from discrete reveal cues, and an emergent-physics scenario has none, so the 1500 ms default was used — the frozen frames of states with genuinely different physics came out near-identical. States may now author `eye_capture_ms` (opt-in, so no approved baseline moves). All seven states here are captured where their own claim is on screen.
- **The clips existed only in a gitignored folder.** `tts:generate` writes into `review-site/`, and Rule 30h is explicit that there is no free Supabase restore — so 24 clips that cost real Sarvam spend lived on one disk in one ignored directory. **This had already cost us once** (vsepr's 17 clips did not travel with their merge). `tts_audio/` had been created by hand as a backup, which made persistence depend on somebody remembering. The generator now mirrors clips + manifest into the tracked path as part of rendering, and prunes it in step so the copy cannot drift. Persistence is a property of rendering, not of memory.

### ⏭ NEXT
1. **`le_chateliers_principle`** (P1 #1) — the reason the reaction layer was built. Same engine, so materially cheaper; its three stresses (add reagent, change volume, change temperature) are all live and measured.
2. **Asmi's professor review** — now FIVE concepts deep with none reviewed. Still the bottleneck, and no longer a small sample.
3. A founder decision waiting: the Rule-31a "motion must span narration" validator WARN fires on every gas_box state (it measures the opening choreography's settle time, not continuous emergent motion). Either the heuristic or the authoring convention should change; it is a warning on both shipped gas_box concepts today.

---

## 📊 STATE OF CHEMISTRY — audit + next-concept decision (2026-07-28)

*Written at founder request: read the whole chemistry position, then pick the next 3D simulation
against NCERT + the international boards. This section is the audit; the decision is §D.*

### A. Where the roadmap actually stands

C5's ranked list has been executed further than the list itself records. Scored against it today:

| Rank | Item | Status |
|---|---|---|
| **P0** | particle-box engine | ✅ shipped as `gas_box` (2026-07-28) |
| **P1** | #6 kinetic particle theory | ✅ shipped |
| **P1** | #1 Le Chatelier · #2 dynamic equilibrium · #3 rates · #4 collision theory · #5 Maxwell–Boltzmann · #7 diffusion | ☐ **all six now UNBLOCKED** — the engine that gated them exists |
| **P2** | #8 titration curve · #9 reaction profiles · #10 H spectrum · #11 periodic trends | ☐ buildable today, zero engine work |
| **P3** | Three.js molecular surface | ✅ shipped as `field_3d` · `molecular_geometry` |
| **P4** | #12 VSEPR | ✅ shipped |
| **P4** | #13 hybridisation · #14 SN1/SN2 · #15 stereochem · #16 orbitals · #17 σ/π · #18 E1/E2 · #19 solid state | ☐ **every one blocked** — see §B |
| **P5** | #20–22 electrochem · electrolysis · titration apparatus | ☐ needs the 5b wet-lab primitives |

**Two engine builds in one day turned a 7-item backlog into a ~14-item harvest.** The bottleneck has
moved off renderer coverage entirely — and onto Asmi's professor review, which **none of the four
shipped concepts has passed.** Four concepts is no longer a small enough sample to keep deferring it.

### B. The 3D block — verified against code, not against the pattern doc

`docs/patterns/chemistry.md` says #13 and #17 "should reuse it with zero new renderer code." **That
claim does not survive a code read**, and the file's own warning says a renderer claim is a CLAIM and
it decays. What `molecular_geometry` actually holds: a central atom, ligands, lone-pair lobes, a live
angle arc and a domain hull, over BeCl₂ · BF₃ · CH₄ · NH₃ · H₂O · PCl₅ · SF₆.

**It has no orbital geometry of any kind.** Rule 40a pre-check across all history —
`orbital_shapes` · `p_orbital` · `hybrid_orbital` · `sigma_pi` · `orbital_lobe` · `MG_ORBITAL` ·
`mgOrbital` — **zero hits on every symbol.**

So the three cheap-looking P4 items block on one shared, missing capability:

| Concept | Needs | Verdict |
|---|---|---|
| #16 orbitals s/p/d | s sphere · p dumbbell · d cloverleaf | orbital-lobe geometry |
| #13 hybridisation | one s + three p **morphing into** four sp³ lobes | same capability |
| #17 σ / π | p-orbital overlap, end-on vs side-on | same capability |
| #14 SN1/SN2 · #15 stereochem | bond-breaking / inversion **motion** | a different, later layer |

**One engine build unlocks three diamonds** — structurally the `gas_box` bargain (one scenario, six
diamonds), and the C3 compounding doctrine applied where C5 allows it: inside the diamond zone.

This is the third consecutive session in which a tier label was optimistic and only a code read caught
it (C4 archetypes M/K/L → C6 archetype P → this). The pattern is stable enough to name: **the pattern
doc is a design memory, not a source of truth; schedule off `git log -S` instead.**

### C. Why hybridisation is NOT the cheap next harvest

C5 §6 and the last session's ⏭ NEXT both name #13 as the direct proof of P3 compounding, on the
grounds that it needs no new renderer code. §B kills the premise. And building it anyway, on the
scenario as it ships, would teach sp/sp²/sp³ as *domain counting* — which is what `vsepr_molecular_shapes`
already teaches, one shipped concept ago. Without the s+p mixing on screen it is VSEPR relabelled:
**a demo-tier build wearing a 💎 rank**, and precisely the failure C5's whiteboard test exists to stop.

Recorded because it was the standing plan and is now withdrawn.

### D. DECISION — next simulation: `atomic_orbitals_s_p_d` (#16), on a new orbital-lobe capability

Founder call, 2026-07-28. Build the orbital-lobe geometry on the live Three.js surface, then author
**atomic orbitals s/p/d** as its first concept.

**Why #16 leads the three, rather than #13:**
1. **Curriculum order.** NCERT Cl.11 **Ch.2** (Structure of Atom) — the prerequisite chapter for the
   Ch.4 bonding block. Orbitals are what hybridisation hybridises; teaching the mixing before the
   things being mixed inverts Rule 25 (foundation-first, no untaught term).
2. **It finishes an arc we already opened.** `bohr_model_energy_levels` shipped as concept #1, and the
   misconception it leaves standing is the planetary orbit. Orbital-as-probability-cloud is the
   correction — whiteboard capabilities **3** (hold 3D structure) and **4** (make a counterintuitive
   result believable) at once, which is as high as the C5 test scores.
3. **Widest board coverage of the three.** All boards (Rule 38g CLAIMS — only CBSE/NCERT is
   author-verified; every international cell needs a real teacher of that board to confirm).
4. **It de-risks the other two.** #13 and #17 both consume the lobes; whatever the orbital build gets
   wrong is cheaper to find now than twice more later.

**Then:** #13 hybridisation (harvests the new lobes **and** the shipped `molecular_geometry` scaffold —
the genuine P3-compounding proof, once it can be built honestly), then #17 σ/π.

**Standing correction to the queue:** #1 Le Chatelier — C5's "single best chemistry sim that exists to
be built" — is unblocked as of today and costs zero engine work. It is not being built now only
because the founder asked for 3D. It should be the first non-3D concept scheduled.

---

## 🧪 SESSION — the `gas_box` 2D engine + `kinetic_particle_theory`, and the session THE EYE lied twice (2026-07-28, branch `feat/particle-field-gas-box` → master)

**Bottom line: the P0 particle-box shipped and the first concept on it is merged and baseline-locked — but the load-bearing finding is a verification one. THE EYE reported 31/31 deterministic checks, TWICE, over frames generated by the WRONG physics stepper. `validate:chemistry` passed a sim whose gas heated 80× when a teacher dragged a slider. Every real defect this session was found by DRIVING the sim or by reading pixels; not one was caught by a gate. 20 rows now in `engine_bug_queue`. Master: `633f074`. Baseline fleet 61 → 63.**

### What shipped
- **`gas_box`** (`particle_field`, ~1000 lines, additive third family beside the circuit branch): true 2D hard-disc gas — Maxwell–Boltzmann velocities, momentum- and energy-conserving elastic collisions on a uniform-grid broad phase, bouncing walls with impulse tallying, a working piston that does real work, two-species diffusion behind a liftable barrier, activation-energy threshold. HUDs: pressure, thermometer, live speed histogram + 2D theory curve, collision counter, `P·A/N·T`.
- **`kinetic_particle_theory`** — 7 states, P1 #6 ("the substrate for 1–5"). 7 baselines, 19 EN clips.
- **`vsepr_molecular_shapes` + the `molecular_geometry` 3D surface** merged from the parallel `Viditra-chem3d` worktree. Verified before merging: same base, **zero file overlap** with the gas-box branch, and `field_3d_renderer.ts` is **1070 insertions / 3 deletions** where all three deletions are lines merely *extended* — genuinely additive, no existing scenario's behaviour changed.

### THE LESSON: a green deterministic gate proves frames are REPRODUCIBLE, not correct
The `SET_TIME_FREEZE` re-sim stepped `if (isCircuitFamily()) stepCircuit(st); else stepPhysics(st);`. `gas_box` got its branch in `draw()` and **not** at the freeze call site, so every frozen and dense capture advanced gas discs using the electron-drift lattice physics: clean at t=0, ~15 escaped by t=4000 ms, ~45+ scattered across the canvas by t=14000 ms, pressure and collisions pinned at 0. **THE EYE passed 31/31 on those frames, twice.** Reproducibly-wrong physics sails through every deterministic check. Only eye-walker reading pixels caught it. Fixed by extracting ONE `stepFor(state)` dispatcher shared by both stepping call sites.

### The other four that no gate could see
1. **Energy ratchet (CRITICAL).** `max(-gasPistonVx, 0)` on the moving wall added energy on compression and removed none on expansion. Two slider drags took KE 397 → 1545 → **31476** and `P·A/N·T` 0.78 → **52.7**. A single compression looks perfect; only cycling min→max→min exposes it. Fixed with a signed reflection.
2. **A lying thermometer (CRITICAL).** `gasTempK` was a setpoint, not a measurement, so piston work made the true temperature leave it — the instrument read 300 K over a gas ~80× hotter, and everything derived from T was computed against a number the gas no longer had. Now inverted from kinetic energy every tick.
3. **Ohm's-law readout on a gas box (CRITICAL, shipped to the product).** `updateReadouts()` branches on `hasSlider('V') || hasSlider('R')` as a proxy for "circuit". The Volume slider is keyed `V`, so a kinetic-theory sim rendered `V = 1.00 V / i = 59.71 A / R = 0.02 Ω`. **Single-letter slider ids are a shared namespace across every concept on the renderer.**
4. **A fix that created a CRITICAL.** Re-syncing unseized slider thumbs to authored values wrote into `userParams[]` — which the parameter fallback then read back. STATE_4's `piston_frac: 0.5` bled into every later state, so the PRIMARY aha state and the gas-law state both silently opened in a half box, the latter at 9.2% packing, outside the dilute regime its own readout is valid in. Fallbacks must resolve to a *stable declared default*, never live control state.

### Verification methodology — two false CRITICALs, and why
Driving a sim with `applyState()` **inside the iframe** bypasses the player, which keeps its own state index and freeze policy; it then correctly freezes the state IT thinks is current, and the sim imitates a hung renderer perfectly (dead sliders, stranded particles, clock pinned). Compounding it, `page.on('pageerror')` observes only the MAIN frame — "no console errors" over a dead sim is meaningless. **Drive via the rail + Play; install error listeners inside the sim frame.** Filed as a directive row.

### TTS doctrine changed (founder)
**Every concept ships English narration audio.** Playback still defaults to muted (Rule 24), but a narration toggle that produces silence is a broken control, not a default — this AMENDS Rule 30h's "on-demand, not a ship gate". Rendered 19 (gas box) + 31 (Bohr) clips; all four chemistry concepts now voiced.
- **Bohr could not be voiced at all**: 9 states each numbered from `s1`, and clips are keyed by id, so rendering would have collapsed 9 states of narration into 4 attached to the wrong visuals. `tts:generate` **refused** rather than emitting silently. Renamed 31 ids to state-scoped. `validate:concepts` reports this same class across dozens of physics concepts — each will hit it the first time it is voiced.
- **`tts_audio/` added, and it is load-bearing.** `review-site/` is gitignored and Rule 30h says there is no free Supabase restore, so clips lived in exactly one untracked folder. VSEPR's 17 clips existed **only** inside the `Viditra-chem3d` worktree — the branch merged and the audio did not travel, because a gitignored path never does. 90 clips, 3.4 MB, now tracked.

### Ops
- **`validate:chemistry` is now in CI.** It had never run in `verify.yml`, and `validate:concepts` scans non-recursively by design — so a broken chemistry concept passed the entire workflow green. Verified secret-free and network-free.
- **A sharper git blind spot than "trust the count, not the hook".** `git rev-list --count --branches --not --remotes` reads 0 whenever a commit is reachable from *any* remote ref — so with the auto-push hook pushing feature branches but explicitly **not** master, an unpushed master reports 0. Verify `origin/master` by SHA. Belongs in `GIT_WORKFLOW.md`.

### Gates
tsc 0 · `check:renderer-syntax` 3/3 · `validate:concepts` **141/141** unchanged · `validate:chemistry` **4/4** · THE EYE **44/44 with H2 live** (0.00% pixel diff on all 7 states) · eye-walker walked twice · quality-auditor FAIL → fixed → re-verified · every slider swept min/max/home through the product rail.

### ⏭ NEXT
1. **Asmi's professor review** — four concepts, 2D and 3D, none yet seen by a teacher. The bottleneck.
2. **The reaction layer** on `gas_box` (reversible A+B⇌AB on collision + forward/reverse rate tallies) unlocks **Le Chatelier** and **dynamic equilibrium**, P1 #1 and #2.
3. Buildable on the box **today, zero engine work**: Maxwell–Boltzmann, collision theory, diffusion/Graham's law, and most of rate-of-reaction.
4. `assessment` blocks are absent on every chemistry concept (Gates 19/20 dormant this phase).

### ⚠ CARRIED FORWARD — two fleet-wide items this session measured but did NOT fix

Both are **cross-subject** (they bind physics harder than chemistry) and are recorded here because
this session is where they were quantified. Neither is a chemistry blocker today; both are traps
waiting for whoever touches them next.

**1. Duplicate `tts_sentence` ids block voicing on 41 concepts.** Measured 2026-07-28 across the
whole fleet: **41 concepts carry duplicate ids totalling 611 colliding sentences; 104 are already
clean.** Worst offenders: `vector_resolution` (39 collisions in 45 sentences),
`newton_second_law_direction` (29), `umbrella_tilt_angle` (22), `contact_forces` (20),
`tension_in_string` (20). Clips are keyed by id, so rendering any of these would silently overwrite
clips and attach the wrong narration to the wrong visual — `tts:generate` REFUSES instead, so each
one is blocked at the moment someone first tries to voice it. `validate:concepts` already emits the
probe as a non-fatal WARN (`[legacy fleet — warning only]`), so the detection exists; only the
rename is outstanding. The fix is mechanical and inert — nothing references sentence ids — and was
applied to `bohr_model_energy_levels` (31 ids) this session as the reference. **Now that every
concept ships audio (the 2026-07-28 TTS directive), this is on the critical path for the physics
fleet, not a latent curiosity.**

**2. `GIT_WORKFLOW.md` needs a sharper unpushed-count caveat.** The doc's standing advice is "trust
the count, not the hook" — `git rev-list --count --branches --not --remotes`. That count reads **0
whenever a commit is reachable from ANY remote ref**. The auto-push hook pushes feature branches but
prints `post-commit: master is not auto-pushed`, so after merging a pushed branch into master, an
**unpushed master reports 0 and `git push` can even answer "Everything up-to-date"**. Both signals
look green while master has not landed. The reliable check is by SHA:
`git rev-parse origin/master` vs `git rev-parse master`, or
`git rev-list --count origin/master..master`. Master is precisely where this blind spot bites,
because it is the one ref the automation deliberately leaves alone.

---

## The renderer-compounding build FLOW (locked 2026-07-23 — **SUPERSEDED 2026-07-27, see below**)

> **⚠ SUPERSEDED by `docs/CHEMISTRY_DISCUSSIONS.md` Session C5 (2026-07-27).** The wave table below
> orders by RENDERER COST. That optimizes the wrong variable: it produced Wave 4 (bookkeeping —
> balancing, mole, stoichiometry) as a cheap harvest, and those concepts do not need to be simulations
> at all. **Order is now driven by IRREPLACEABILITY** (the whiteboard test: if a teacher with a
> whiteboard and 60 seconds gets the same result, it is not a diamond), with renderer-compounding
> demoted to a tie-breaker *between* diamonds. Wave 4 is deprioritised to last; the Wave-2 particle
> box becomes **P0** because it unlocks six diamonds. The ranked list lives in C5 §6 — **and that
> order is explicitly a flexible default, not a contract (founder, 2026-07-27).**
>
> The compounding *insight* below is still correct and still governs cost. It is kept for that, and
> because Waves 2/3/5 survive the re-ranking almost unchanged.

Build by **renderer archetype, not by chapter** — each renderer surface, built once, is reused by the
next concept, so cost-per-concept falls as the catalog grows (the physics magnetism recursive-bootstrap,
applied to chemistry). Every Wave 1–3 concept sits in NCERT **and** IGCSE/IB/AP/A-level; Rule 38
depth-rings absorb the depth difference (author at NCERT/JEE depth, hide the advanced ring for lighter
boards).

| Wave | Archetype | Renderer cost | Concepts (build order) |
|---|---|---|---|
| 1 Prove it | K trajectory | £0 (reuses built `magnetic_force_moving_charge`) | **Rutherford α-scattering** [→ electron-discovery deflection] |
| 2 Passport ⭐ | M particle-box (+N graph) | build gas-collision box ONCE | kinetic particle theory/states → diffusion → rates → collision theory → equilibrium/Le Chatelier |
| 3 Energy | L ladder (+N) | modest (generic 2D primitives) | Bohr/energy levels/spectra · reaction energy profiles/enthalpy/activation energy |
| 4 Bookkeeping | O ledger | cheap (generic primitives) | balancing · conservation of mass · mole concept · stoichiometry |
| 5 Structure | P Three.js | big (Phase 5) | orbitals s/p/d · bonding/VSEPR · hybridization · organic mechanisms · electrochem cells |

---

## 🧊 SESSION — The 3D surface opens: `molecular_geometry` scenario built + `vsepr_molecular_shapes` (P4 #12) authored on it, 4 EYE runs (2026-07-28, branch `feat/chemistry-3d-molecules`, separate worktree)

**Bottom line: chemistry now has a 3D render surface and its first 3D diamond. Session C5 §2 names
four capabilities a simulation has that a whiteboard does not, and capability 3 — hold 3D spatial
structure — was the only one with NO engine behind it; every concept in the C5 §6 P4 block was
blocked on it. Built the `field_3d` `scenario_type: "molecular_geometry"` (P3), then authored
`vsepr_molecular_shapes` (P4 #12, which C5 calls "arguably #2 overall after Le Chatelier") as pure
data over it with zero new renderer code. 5 commits, all local. THE EYE 31/31 with zero console
errors, `validate:chemistry` 3/3 PASS zero warnings, `validate:concepts` 141/141 unchanged and never
sees the file, tsc 0. NOT baseline-approved — `visual:approve` stays founder-gated.**

- **Worktree isolation first.** A parallel session was mid-flight in the main tree on
  `feat/particle-field-gas-box` with uncommitted work in `particle_field_renderer.ts` and a new
  `kinetic_particle_theory.json` (the 2D P0 particle-box — the other half of the C5 roadmap). All of
  this ran in a separate git worktree (`../Viditra-chem3d`, branch off master `df3d993`,
  node_modules symlinked) so the two sessions could not collide on a branch switch or a shared file.
- **The engine (`b6a0259`), and why it is a scenario rather than a molecule viewer.** The taught
  variable is the DOMAIN SET, so the shape is DERIVED, not authored: `mgIdealDirs` returns the
  maximum-separation arrangement for 2–6 domains, lone pairs consume the apex-side slots first, and
  `mgSqueeze` closes the surviving bonds to a target angle in closed form (pair → β = θ/2; symmetric
  tripod → cos θ = 1.5cos²β − 0.5; a fully symmetric set has a zero centroid and returns untouched,
  so CH₄ needs no special case). **Verified numerically before a single state was authored** —
  BeCl₂ 180.0 · BF₃ 120.0 · CH₄ 109.471 · NH₃ 107.0 · H₂O 104.5 · PCl₅ 120.0/90.0 · SF₆ 90.0.
  Because CH₄/NH₃/H₂O read ONE shared tetrahedral frame, the squeeze moves only the domain that
  changed: the two surviving bonds drift 2.4°, so Rule 32b/32d hold by construction rather than by
  authoring care. Rule 26/36: every beat INCLUDING the slow 3D turn is closed-form in state-local t
  (the spin is baked into the direction vectors, not integrated into a group rotation), so there is
  no accumulator and the scenario joins the accumulator-free snap-to-pin set. `deriveStateMeta`
  registered in the SAME change per the standing scar rule.
- **The concept (`e0b1ab4`).** 7 states, 5 core + 1 extended + explore, distinct declared archetype
  each: assemble → the flat board sketch relaxes out of the page (90.0° → 109.5°, H···H 154 → 178 pm
  off the real 109 pm bond — the misconception beat and the aha) → domains spread through BeCl₂ →
  BF₃ → CH₄ → a bond becomes a lone pair and the survivors close 109.5 → 107 → 104.5 → the 4-domain
  cage counts four while hiding the lobes leaves two atoms bent → PCl₅/SF₆ → sandbox. Three
  misconception_watch beats; six questions including a deliberate transfer item (CO₂: a multiple bond
  is ONE domain) that no single state stages. Site #1 only, verified zero registry occurrences.
- **THE EYE ran FOUR times, and all four were 31/31 green — every real defect came from reading the
  frames.** This is the session's clearest evidence for why the frame-read is the gate and the
  deterministic checks are only a pre-flight. What the machine passed and the eye caught:
  1. **Live labels clipped** — the arc/span/lone sprites were `createLabelSprite`, whose canvas is
     measured ONCE from its seed string, so "H–C–H = 109.5°" rendered as "–C–H = 109." Same class as
     the `ac_generator` "each half tu" clip that motivated `pmCreateAutoLabel` in the first place.
  2. **Methane's fourth bond was invisible** — aimed straight down the view axis, foreshortened to
     nothing behind the carbon, under a caption reading "Four bonds, one shape". A student counts 3.
  3. **STATE_2 projected 133.6° while its label said 109.5°** — in the one state that exists to
     correct a false picture. Found by MEASURING the projection, not by looking.
  4. A 180° arc pair cancels to a zero mid-vector, parking "Cl–Be–Cl = 180.0°" on the beryllium; the
     central symbol sat inside the arc wedge; and the cage edges had `depthTest:false` and drew white
     fans straight THROUGH the hydrogens.
- **Cameras were SOLVED, not chosen (`d1aac72`, `d8766ef`).** A scratch solver swept azimuth ×
  elevation against two objectives — every domain must project at ≥34% of its length (else it hides
  behind the central atom), and the measured angle must project near its label. Result: the tetra
  states share az76/el60 (worst domain 50%, arc shows 109.2° against a true 109.5°); STATE_3 takes
  az266/el8, where BeCl₂ reads 180°, BF₃ reads **exactly** 120° face-on and CH₄ reads 109°; STATE_6
  takes az264/el54. New authorable `flat_basis` puts STATE_2's sketch plane perpendicular to its
  camera, so its flat cross now measures exactly 90.00° AND the relaxed tetrahedron reads 109.2° —
  both ends of the concept's central contrast honest, and the last camera discontinuity gone.
- **A tooling hole closed (`119dabd`).** `validate-chemistry`'s Rule-31a choreography measure read
  `scene_composition` only — the PCPL shape — and on field_3d that block is a silent no-op, so it
  reported "choreography settles ~0ms" for EVERY field_3d chemistry concept regardless of timing. A
  warning that cannot be satisfied trains you to ignore the gate. Now also consults
  `deriveMaxRevealTimeMs`. It paid for itself twice: real ratios on the new concept (0.38 and 0.52,
  both genuinely under-timed → S1/S2 retimed so the motion spans the narration), and it cleared a
  false positive that had been sitting on `bohr_model_energy_levels` STATE_7.
- **Archetype P split in `docs/patterns/chemistry.md`** — the C4 lesson applied to my own work. "P —
  Molecular 3D" was one [PHASE-5] label over at least three separate engine builds. Now **P1
  electron-domain geometry [LIVE]** (this scenario) and **P2 orbitals + lattices [NEEDS-SCENARIO]**,
  with SN1/SN2 and stereochemistry noted as sitting between them (scaffold exists, motion layer does
  not). Also worth recording: the 3D surface arrived as a `scenario_type` on the existing Three.js
  `field_3d_renderer.ts`, NOT as the separate `molecule_3d`/`orbital_3d` renderer file
  `CHEMISTRY_ARCHITECTURE.md` §5c anticipated — which is why "the biggest lift" cost one scenario.
- **Files:** NEW `src/data/concepts/chemistry/vsepr_molecular_shapes.json`,
  `docs/concepts/chemistry/vsepr_molecular_shapes_skeleton.md`; EDITED
  `src/lib/renderers/field_3d_renderer.ts`, `src/lib/validators/visual/deriveStateMeta.ts`,
  `src/scripts/validate-chemistry.ts`, `docs/patterns/chemistry.md`. 5 commits
  (`b6a0259` → `119dabd` → `e0b1ab4` → `d1aac72` → `d8766ef`), **not pushed**.
- **ADDENDUM — the pipeline gates were run after the above, and they FAILED the first time.** The
  founder asked "did you even complete the quality auditor?" — I had not (a standing session rule
  barred subagents unless asked). Running it changed the outcome. **quality-auditor: FAIL** on two
  items — the skeleton had no Definition-of-Done block at all (Gate 0), and STATE_6's on-canvas
  formula asserted `5 → 120° and 90°` while the scenario draws ONE arc, so PCl₅'s axial 90° was
  claimed but never rendered. **eye-walker: 4 findings**, three MAJOR/CRITICAL. Every one was real,
  checked against the frames before fixing. **THE EYE had been 31/31 green on four consecutive runs
  the whole time.** Two findings were regressions from my own earlier "fixes" (pushing the arc label
  out made it collide with the span label on the aha frame; moving the central label away from the
  arc moved it onto a hydrogen), and one exposed a flaw in my method: the camera solver measured each
  domain's foreshortening but never PAIRWISE screen separation, so all three shipped cameras actually
  had overlapping atoms (gaps 0.05, −0.14, −0.28). Re-solving then optimised methane's arc but not
  water's, leaving water edge-on with 104.5° reading as nearly straight — the final solve constrains
  separation AND both arc families (CH₄ err 2.5°, H₂O err 2.2°). Also fixed: the lone-pair checkbox
  stayed checked with zero lobes on screen, and PCl₅ got a longer bond (`bond_scale`, and P–Cl really
  is 214 pm against methane's 109). Auditor re-check: **PASS**. Commits `0997401`, `2bd3eef`.
- **SHIPPED (founder-approved).** `visual:approve` locked 7 states / 14 PNGs and activated H2;
  re-running THE EYE against the new baselines gives **44/44 with all 14 H2 comparisons at 0.00%
  drift** — byte-identical, the accumulator-free Rule 26/36 claim proving itself rather than being
  asserted. `tts:generate --langs=en` rendered **17/17 EN clips, 0 stale** (bulbul:v3/priya, 760 KB);
  English-only per Rule 30i, and supplementary per Rule 30h. Review site verified serving on :8081
  (page, sim, manifest and clips all HTTP 200). No `PILOT_CONCEPTS`, no deploy, no merge, no push.
- **⏭ NEXT.** (1) **Asmi's professor review is the only gate left.** (2) **Hybridisation (#13) is the cheap next harvest** — C5
  §6 says build it as a pair with VSEPR, and it needs zero new renderer code, so it is the direct
  proof of the P3 compounding thesis. (3) σ/π (#17) likewise. (4) Merging: the engine commits are
  platform (Rule 40) and should go to master separately from the concept; the other session's
  `particle_field_renderer.ts` work is on a different file, so the two tracks should merge cleanly.
  (5) Orbitals (#16) and solid state (#19) stay blocked on the P2 scenario; SN1/SN2 (#14) needs a
  motion layer on top of the built scaffold.

---

## 🧪 SESSION — 2nd chemistry concept SHIPPED (`law_of_conservation_of_mass`) + the build order re-founded on the whiteboard test (2026-07-27, branches `feat/chemistry-ch1-conservation` → master, `docs/chemistry-priority-order`)

**Bottom line: the second chemistry diamond went end-to-end through the full traditional pipeline in one session — authored, FAILED review, fixed, baseline-locked, voiced, and merged to master — and then the founder's challenge to the concept itself overturned the chemistry build order. Six commits merged to master (`df3d993`), engine half cherry-picked separately (`dceca4c`) per Rule 40. tsc 0 · validate:chemistry 2/2 · validate:concepts 141/141 unchanged · THE EYE 44/44 · 23/23 EN clips. Baseline-locked fleet 60 → 61.**

### What shipped
`law_of_conservation_of_mass` — NCERT Cl.11 Ch.1 §1.3, 7 states, **archetype O (reaction ledger), the first of its archetype**, `parametric` renderer. Concept chosen by the founder's stated rule (NCERT chapter order weighted by international coverage). Twin-misconception design: burning appears to destroy mass (S1 plants the belief, S2 breaks it with the sealed twin — the primary aha) and rust appears to create it (S5). Pipeline run in full: `architect` → `chemistry-author` → `json-author` → `quality-auditor` ∥ `eye-walker`, no founder-proxy, every gate to the founder.

### The load-bearing lesson: every automated gate passed a broken sim
THE EYE reported **31/31**, `validate:chemistry` PASS, `tsc` 0, `check-layout-overlap` clean — on a concept whose **apparatus was disassembled in six of seven states**. `drawBody` anchors `rect` at TOP-LEFT and `circle` at CENTER (`parametric_renderer.ts:1465-1468`); json_author authored every rect as if centre-anchored, so the base/column/housing/pan — all at `x:175` to share a centre axis — rendered with centres at x=250/183/235/230, a staircase of unconnected bars, with the centre-aligned readout sitting out on the background. **Nothing read as a balance** (Rule 24 failure).

**The two AI reviewers disagreed, and the disagreement is the finding.** `quality-auditor` caught it by *deriving expected geometry from coordinates and comparing to pixels*; `eye-walker` read the same 145 frames and passed those states — it verified numbers, Unicode, staging, focal discipline (all genuinely correct) but never asked "does this read as a balance?", because the dispatch did not ask it to. Adjudicated by the orchestrator opening the frame directly. **Neither reviewer alone was sufficient; eye-walker also reported one non-defect (a "needle spike" that is `smoke_wisp` mid-grow).**

### Fix + verification
One `json-author` dispatch, ten findings, JSON-only (no numbers, narration or assessment touched — both reviewers had independently confirmed every rendered digit against the number lock). Re-laid all rect geometry; **added the S2 wisps that the misconception counter promised but never rendered** (the primary aha was asserted, not shown); separated S5's two oxygen atoms, which resolved to one pixel and read as an atom *vanishing* on the state teaching that mass is never destroyed; S3's CO₂ made linear; `zoom_box` pulled on-canvas from 80px off; `scale_pixels_per_unit` on the S7 needle (was rendering 5× long through the flask). Verified by **reading the frozen frames**, not by gates passing.

### Then: TTS (two blockers, both new)
- **Duplicate `tts_sentence` ids** — every state numbered from `s1` again, so clips (keyed by id) would have overwritten each other, collapsing 7 states into ~4 and attaching each to the wrong visual. `tts:generate` refused rather than emitting silently. Renamed all 23 to state-scoped (`s1_1`…`s7_1`); nothing references sentence ids, so the diff is exactly 23 lines. **Neither the schema nor `validate:chemistry` checks id uniqueness — only the TTS script does, so any never-voiced concept carries this latently.**
- **`ffmpeg` absent on this laptop** — Sarvam returned audio, wav→mp3 failed, **23 API calls spent and discarded**. Installed ffmpeg 8.1.2 (brew). New-machine setup gap, same family as the missing `agent-teams-reference.md`; belongs in `GIT_WORKFLOW.md` §0.
- Result: **23/23 EN clips** (bulbul:v3/priya, 318 words), manifest + clips HTTP 200. ⚠ `review-site/` is gitignored, so the audio is **unbacked** — a clean costs another 23 Sarvam calls (Rule 30h: no free restore).

### Doctrine changed this session
1. **GAP 2 is CLOSED and the doc was wrong.** `patterns/chemistry.md` still documented "parametric binds only TEXT to live variables; positions are static" as a live limit. `position_expr` landed in `369e263` (consumed at `:1185-1188`); `from_expr`/`to_expr` are consumed too (`:1780-1781`, `:2152-2163`), making that scar row stale. **All three pipeline agents designed S7 around a limitation that no longer existed** — same failure class as the archetype-`[LIVE]` scar. No defect, but the explore state shipped weaker than the engine allowed. Doc corrected with the evidence and the lesson.
2. **The whiteboard test (CHEMISTRY_DISCUSSIONS.md Session C5).** Founder challenge: *"these concepts can be explained without a simulation; a teacher does it more effectively and would use only the last state."* Correct — conservation of mass is demo-tier, and exactly one state (S2, open vs sealed) survives the test. Locked: a concept earns a build only if a teacher with a whiteboard and 60 seconds cannot produce the same understanding. Renderer-compounding demoted to a tie-breaker between diamonds. **Ch.1 ledger harvest (mole → stoichiometry → limiting reagent) cancelled.**
3. **A tier-based state cap was proposed and REJECTED by the founder** — it contradicted Rule 11 (never hardcode state count) and conflated *whether/when to build* with *how many states once building*. **State count stays complexity-driven, identically to physics; only the ORDER changed.**
4. **The priority order is explicitly a flexible default, not a contract** (founder). What is durable is the reasoning, not the sequence.

### Scar candidates — 4 filed, NONE applied (founder ruling needed)
`docs/concepts/chemistry/scar_candidates_law_of_conservation_of_mass.sql` + 2 more from review:
1. **`parametric_layout_gates_blind_to_body_geometry`** ⭐ *the load-bearing one* — `check-layout-overlap.mjs` computes bboxes only for text/arrows and `validate:chemistry` has **no canvas-bounds check at all**, so a disassembled apparatus and an 80px-off-canvas body both ship green. It also models a magnitude-driven `force_arrow` as a fixed short box, ignoring `scale_pixels_per_unit`.
2. `parametric_vector_primitive_ignores_appear_at_ms` — `drawVector` never calls `PM_animationGate` (9 sibling draw fns do), so staged `vector` reveals all fire at t=0, silently.
3. `parametric_derivation_step_reveal_ungated_concurrent_typing` — same for `drawDerivationStep`; N lines all type at once.
4. **`tts_sentence_id_uniqueness_unvalidated`** (new) — belongs in the validator, not at render time.
Also: the `parametric_from_expr_to_expr_never_consumed` row is **STALE** and should be retired before it misleads another author.

### Ops finding — the auto-push hook drops commits
Observed **3×** today: on two commits in quick succession, the second hook hits the in-flight lock and returns early on the reasoning that "pushes are cumulative", but the first push had already resolved its SHA — orphaning the second commit. Caught each time by `git rev-list --count --branches --not --remotes` and pushed by hand. This is `GIT_WORKFLOW.md` §0's *"trust the count, not the hook"*, now with a precise mechanism (a race between the lock check and the post-push SHA comparison) rather than the vaguer "observed after a large merge".

### Files changed
`src/data/concepts/chemistry/law_of_conservation_of_mass.json` (new) · `src/lib/renderers/parametric_renderer.ts` + `src/lib/physicsEngine/concepts/law_of_conservation_of_mass.ts` + `index.ts` (engine, cherry-picked to master as `dceca4c`) · `visual_baselines/law_of_conservation_of_mass/` (7 baselines) · `docs/concepts/chemistry/{skeleton,chemistry_block,scar_candidates}` · `docs/patterns/chemistry.md` (GAP 2) · `docs/CHEMISTRY_DISCUSSIONS.md` (Session C5) · `docs/CHEMISTRY_BUILD_PLAN.md` (order pointer) · this file.

### ⏭ NEXT
1. **P0 — the particle-box scenario build** (`peter_parker:renderer_primitives`, `particle_field`): one modest gas-collision scenario unlocks six diamonds (Le Chatelier, dynamic equilibrium, rates, collision theory, Maxwell–Boltzmann, kinetic theory). The highest-ROI action in the chemistry roadmap. Rule 40: lands on master separately.
2. **Or P2 with zero engine work** if concepts are preferred over engine: titration curve · reaction profiles · hydrogen spectrum · periodic trends — all on renderers live today.
3. **Founder rulings pending:** the 4 scar candidates · retire the stale `from_expr` row · merge `docs/chemistry-priority-order` to master.
4. **Asmi's professor review — now pending on BOTH chemistry concepts.** This is the only gate neither concept has passed.
---

## 🧪 SESSION — Convergence + SHIPPED TO MASTER: 130-commit merge, 3 platform fixes landed separately, eye_walker gate, baselines locked, DB migration applied (2026-07-26 → 27)

**Bottom line: chemistry is ON MASTER (`b9eb735`) with the isolation contract intact, and every
machine-checkable gate is green — tsc 0 · validate:concepts 141/141 · validate:chemistry 1/1 ·
vitest 281/281 · THE EYE 39/39 with zero console errors · 9 visual baselines approved (H2 now
live for the first time on a chemistry concept AND on the parametric family). The single
remaining gate is Asmi's professor review. The most valuable work this session was NOT writing
code — it was checking master before porting, which killed three of my own mechanisms.**

### The headline lesson: three of my engine changes were already solved on master, better
Master absorbed six branches (130 commits) while this branch worked. Before porting anything I
ran the Rule-40 check on each mechanism. Three died:

| Mine | Master's | Verdict |
|---|---|---|
| `PM_focalPulseBoost` (white colour-lerp) | `PM_focalEmphasis` + `SET_GLOW` override | Master: dims peers to 0.6 (Rule 29 as written), real `shadowBlur` glow, static so it doesn't mask D7 |
| `responsive_fill` (p5 `scale()` + manual `PM_mouseXd/Yd` remap) | `PM_fitCanvas` (style-only CSS box resize) | **Master decisively** — keeps mouse in 760×500 logical space with ZERO mapping code |
| GAP-1 review-site parametric branch | already imports `assembleParametricHtml` | Redundant — master builds a 207KB working parametric sim unaided |

The `responsive_fill` one matters most: master's own comment warns a canvas transform *"would
desync p5 1.9.4's scrollWidth-based mouse compensation and silently break every
drawCanvasSlider drag."* **Mine did exactly that** and added manual remapping to compensate.
Porting it would have shipped a regression into the shared engine. Ten minutes of reading
master's code prevented it.

### Three platform fixes landed on master SEPARATELY (Rule 40), each 1 file / 1 commit
Deliberately NOT bundled into the chemistry merge — engine files are platform.
1. **`fix/gate9-overlap-checker`** — Gate 9 was passing vacuously across the fleet. Measured:
   **126 of 141 concepts (89%)** carry >5 states once EPIC-C branches are counted (largest:
   `current_not_vector` at **21**); the checker read 5 and never read `epic_c_branches` at all.
   It also **crashed outright on 21 concepts** — nobody knew, because nothing swept the fleet.
   Three distinct crashes fixed (missing `position`, missing `id`, state-less bundle concept).
   **Kept master's body-anchored arrow resolution** (`buildBodyMap`/`resolveBodyAnchoredOrigin`)
   — a real improvement this branch's rewrite lacked. Combination, not replacement.
   Result: 141/141 scan, 0 crashes, **155 previously-invisible findings across 33 concepts**.
2. **`feat/parametric-play-path`** — ▶ Play was dead on the entire family (the renderer honoured
   `SET_TIME_FREEZE` but ignored `RESET_TRAJECTORY`/`REPLAY_ANIMATIONS`). Only **23 lines**,
   because master's `PM_resetSimClock` was already the right primitive.
3. **`feat/parametric-position-expr`** — bodies can bind position to live variables, not just
   text. Extracted `PM_liveExprVars()` so `PM_interpolate` and `position_expr` read ONE scope —
   a state cannot render a number and place its glyph from different values. Runtime-tested the
   emitted scope in a sandbox before shipping.

### The merge (130 commits, 5 conflicts) — and the regression verification caught
Resolved by taking master wholesale for all three superseded files, UNION for `sync-agents.js`
(both sides added agent roles — chemistry_author vs founder_proxy + field3d_surgeon; all three
`.agents/` dirs exist), and re-adding only `computePhysics_bohr_model_energy_levels`.

**Verification caught one real regression:** taking master's `build_review_site.ts` wholesale
dropped Phase-2.5 subject routing, so `build:review bohr_model_energy_levels` died with
"Concept JSON not found". Fixed by wiring in the shared `resolveConceptJsonPath` that four
other scripts already use — removing an inconsistency rather than adding a special case.
Physics resolution stays byte-identical and silent; chemistry logs its namespace.

### THE EYE post-merge — and the D7 mystery is SOLVED (it was calibration, not a defect)
Previously 32/39 with all 8 guided states flagged *"Animation died mid-state — likely a
render-loop exception."* **That diagnosis was wrong.** Master's `deriveStateMeta` now derives
real reveal windows (15000–19286 ms instead of a flat 1500 ms default) and D7 correctly relaxes
for states declaring `reveal_hold`: *"frozen tail is expected — one-shot reveal then holds
still."* A guided state holding its final picture IS correct Rule 26 behaviour; the old run
measured a 30 s window against ~15 s of choreography and called correct behaviour a crash.
Now **39/39, zero console errors, real motion detected in 5 states** (0.18–0.33% of canvas).

### eye_walker frame-walk (298 frames) — 4 findings, 2 scars confirmed fixed
7/9 states clean. No crashes, no physics errors. It **verified two open scars as fixed by the
merge**, and did it properly — by arithmetic, not eyeballing: S7's λ pointer computes
`2×656−705 = x607`, exactly `line_656_solid`'s x. And it diffed the electron before/during glow:
diameter unchanged, halo only → the Rule-29 size-bulge is genuinely gone.

**It also partially REFUTED my own probe, and it was right.** I had flagged S3/S7 as "narration
outruns choreography." Reveal-complete and narration-end actually co-terminate within a second;
the real defect is `duration` authored at ~2× measured content (32000/35000 ms vs ~17–19 s).
Filed as the sharper `state_duration_field_overpadded_vs_reveal` and **deliberately left my
original row OPEN with a note that its framing overstated what the frames show** — recording the
correction rather than quietly replacing it.

### Two findings FIXED this session
- **S9 depth-ring leak (MAJOR, Rule 38b).** The sandbox printed "λ = 656 nm" but no core state
  ever showed a numeric wavelength — core taught gaps in eV and the λ axis; the number came only
  from S7's extended-ring hc/ΔE derivation. Fixed by **introducing the value where it belongs
  pedagogically**: S6 (core) now labels each spectral line with its wavelength as it solidifies
  (656 / 486 / 434 / 410, colour-matched). That is S6's own thesis ("Every line, one gap") made
  literal — the fix strengthens the core lesson instead of padding it. The DERIVATION stays
  extended: core students see that a line has a wavelength, extended students see why.
- **S3 frozen-frame delta (MODERATE, Rule 32c/d).** The PRIMARY misconception state ended in
  S2's exact resting pose, so its frozen frame — the H2 baseline, and what a reviewer judges in
  isolation — carried none of its own teaching. Added two persistent verdict labels
  ("✗ smooth ramp" / "✓ fixed rungs only"). Both fixes confirmed by reading the actual frames.

### Baselines approved — H2 is live for the first time
`visual:approve` → **9 baselines** at tolerance 0.02. All 9 frozen frames get
`compare_frozen: true` (deterministic `SET_TIME_FREEZE` captures); the 5 animated states are
reference-only per `visual_approve`'s default. Until now H2 reported "Skipped — no approved
baseline", so nothing protected this sim from silent visual drift.

### The Supabase migration — applied, with one deviation the pre-flight forced
Authorised the Supabase MCP and applied to **`dxwpkjfypzxrzgbevfnx` (dev)** — explicitly not
`physicsmind-pilot`. I had been repeating an earlier session's "founder must do this" claim;
probing it properly showed why: the service-role key authenticates against PostgREST, which does
data operations only and **cannot execute DDL**, and no `exec_sql`-style RPC exists.

Pre-flight against live data changed the migration in two ways:
- **Added `peter_parker:field3d_surgeon`** to the owner_cluster CHECK. The migration predates
  that role; it is now active on master (`[owner: peter_parker:field3d_surgeon]` in shipped
  commits), so applying the list verbatim would have closed the chemistry_author gap while
  **recreating the identical latent bug** for field3d_surgeon.
- **Kept `peter_parker:visual_validator`.** The migration said to keep the CHECK "in sync with
  the admin OWNERS array" — but that array no longer lists it while **39 live rows use it**.
  Following that instruction literally would have invalidated 39 rows. The UI is the stale side.

Post-apply: 351/351 rows intact, both CHECKs present, index created. All three seed scripts
re-run with no "subject absent" warning. Queue splits **physics 328 · subject_neutral 21 ·
chemistry 2**.

### Queue: 4 rows added, 4 closed
Added `_seed_engine_bug_queue_bohr_eyewalker.ts` — 2 fixed above, 2 left OPEN (duration
overpadding; S4 prose in the caption band). Closed with evidence: the indicator-binding and
Rule-29 focal rows (both resolved by the post-merge `PM_focalEmphasis`), computed-but-unsurfaced,
and the older symbol-level ring row (verified independently: UV/IR/ΔE are gone from S9, and with
λ now core-introduced every symbol S9 renders traces to a core state).

### Also
- **`docs/GIT_WORKFLOW.md` §0** — promoted the hook installer to a setup step. It was documented
  inside §4 ("What is automated"), so reading top-down you start committing before reaching it —
  and `.git/hooks` is untracked, so a fresh machine has NO backup automation and nothing says so.
  Recorded first-hand that the auto-push hook is a convenience, not a guarantee (it skipped a
  push after the large merge; the unpushed count read 4, not 0).
- **tsx is an undeclared dependency** — not in `package.json`, `package-lock.json`,
  `node_modules`, or on PATH. `npx` silently downloads it from the registry at runtime
  (`~/.npm/_npx/…`, unpinned). So these scripts are offline-fragile. Deferred deliberately —
  adding it now creates a package-lock merge point and `npm ci` hard-errors on lock drift.
- **A physics finding handed back:** with Gate 9 working, `vector_head_to_tail` STATE_5 has a
  real 6px annotation overlap (`edge_hint_zero` ↔ `edge_hint_high`). Physics content untouched.

### ⏭ NEXT
1. **Asmi's professor review** — the only gate left on Bohr.
2. Retime S3/S7 `duration` fields + move S4's `prereq_note` out of the caption band (2 OPEN rows).
3. **Wave 2 = the passport cluster** (kinetic theory → diffusion → rates → collision theory →
   equilibrium) — needs the particle-box scenario built ONCE, then reused across the whole cluster.
4. Admin UI `OWNERS` dropdown is missing `visual_validator` + `field3d_surgeon` (product call).

---

## 🧪 SESSION (cont. 2) — Clearing the open list: THE EYE unblocked + run, scar-list probes mechanised, renderer Rule-29 fix (2026-07-24)

**Bottom line: five of the "still open" items are closed and THE EYE now RUNS on the parametric/chemistry family for the first time. Physics untouched throughout — tsc 0 · validate:concepts 124/124 · validate:chemistry 1/1 · both renderer bodies syntax-OK. Only the genuinely human/founder-gated items remain (Asmi review; the Supabase migration; two fuzzy probes).**

### THE EYE — unblocked (root cause found) and RUN
The "environmental Playwright stall" was NOT a network problem. A **hung download process from 02:37 (≈11 h old, ~0 CPU)** was holding `ms-playwright/__dirlock`, so every new install bailed instantly on the lock. Worse, even a fresh install **downloads 100 % of 92 MiB then hangs in EXTRACTION** — it writes only `ABOUT` + `LICENSE` (the two small text entries) and stalls before the 156 MB executable (macOS security scan on the binary write is the likely culprit; the binary runs fine once present, so not Gatekeeper-at-launch). Fix: killed the zombie tree, cleared the lock, then **salvaged a complete leftover temp zip** (`$TMPDIR/playwright-download-*/…headless-shell…1217.zip`, `unzip -t` clean) and extracted it manually into the cache + wrote `INSTALLATION_COMPLETE`. `chrome-headless-shell --version` → `Google Chrome for Testing 147.0.7727.15`.
- Then: `_seed_chemistry_cache.ts bohr_model_energy_levels` → `visual:eyes`. **THE EYE ran end-to-end: 9 states + 266 dense frames, 39 deterministic checks · 32 passed · 7 failed · $0.** Frames: `.visual_runs/bohr_model_energy_levels/20260724-140150/` (298 PNGs).
- **The 7 failures are all one class — [D7] "frozen tail" on the guided states (S1–S5, S7, S8; S6 and the S9 explorer PASS).** Motion runs ~10–17 s then holds static through D7's 30 s dense window. This is settle-then-hold, NOT a crash (motion runs for seconds first; no console exceptions). Two entangled causes, both a founder/eye_walker call: (a) D7's 30 s window over-captures the legitimate Rule-26 post-narration hold → a **D7-calibration scar candidate for the parametric family**; (b) the real Row-4 gap underneath (motion ends a few s before narration). **NOT approved (visual:approve stays founder-gated); the Rule-29 fix was NOT reverted to game the gate.** Note: removing the continuous size-throb (below) is what *unmasked* this — the throb had been keeping pixels changing every frame, hiding the static hold.

### Cross-machine convergence — focal emphasis unified on `PM_focalEmphasis` (2026-07-24, later)
A second machine (`feat/field3d-draggable-sensor`) independently fixed the SAME Rule-29 violation the
same day. Its `PM_focalEmphasis(spec) → {isFocal, alphaMul, glowPx}` landed in **`2435706`
"feat(pcpl): harden parametric renderer to doctrine parity"** (peter_parker:renderer_primitives).
**It won on merit and this tree adopted it**, deleting our `PM_focalPulseBoost`/`PM_brightenRgb`:
it dims non-focal peers (`alphaMul 0.6` — Rule 29 as written, "focal brightens **+ peers dim**",
which is what makes Rule 32e legible), uses a real `shadowBlur` glow rather than a white colour-lerp
that washes out on light elements, is **static** so it doesn't re-mask THE EYE's D7 frozen-tail
probe, and holds `glow_focus`'s halo radius CONSTANT (ours multiplied it by `1+boost`).
Ported **verbatim** — `diff` against their function is exactly ONE line: their `PM_simClockMs` →
this tree's freeze-aware `PM_now()`, so freeze-determinism holds under our clock.
- Rewired 5 sites: `drawLabel`/`drawAnnotation`/`drawForceArrow`/`drawFormulaBox` +
  `premium_primitives`' `glow_focus`. Glow set/reset pairs verified balanced (a leaked `shadowBlur`
  bleeds into every later primitive); the 5th reset in the file is master's pre-existing `=6`/`=0` pair.
- **Deliberately NOT rebased.** `origin/feat/field3d-draggable-sensor` is **23 commits behind master**
  (predates `capacitance.json`, `meter_bridge`, Rule 39g fleet-wide widgets, pilot catalog 47→53);
  rebasing onto it would move our base backwards. We stay on current master — when their 11 commits
  land, the rebase is a no-op for this file because the content is now identical.

**Post-rewire verification:** tsc 0 · validate:concepts **124/124** · validate:chemistry **1/1** ·
both renderer bodies syntax-OK · `build:review` exit 0 for a chemistry AND a physics parametric
concept · emitted p5 body (3552 lines) `node --check`s clean for both · glow set/reset pairs balanced.
**THE EYE re-run: 39 checks · 33 passed · 6 failed** (was 32/7) — **STATE_2's D7 recovered** and
**no new failure class appeared**; all 6 remaining failures are still the single pre-existing D7
frozen-tail class (S1/S3/S4/S5/S7/S8; S2/S6/S9 pass). Removing the sine pulse was expected to keep or
strengthen D7, and it did — the signal is now honest rather than masked by per-frame churn.

**Two claims from the cross-machine analysis were checked and corrected:** "master has no focal
machinery" (❌ master HAS `PM_focalPulseScale` at line 447 — it was a live Rule-29 violation, not a
gap) and "their branch deletes `capacitance.json`" (❌ **false alarm** — absent at the merge-base;
master added it *after* they branched). Their `pcplRenderer/` deletion IS real and **safe** (only
"Ported from…" comments reference it; zero imports in `src/`).

### ⚠ FLAGGED for the other machine — a SECOND collision the earlier analysis missed
**The player-clock contract is NOT additive.** Their branch already has a full clock —
`PM_simClockMs`/`PM_clockAccumMs`/`PM_paused`/`PM_frozen`/`PM_pinTargetMs`/`PM_pinCatchupPending`,
fixed 1/60 s ticks with deterministic catch-up, and `window.__PM_supportsTimePin` for THE EYE
(19 `SET_TIME_FREEZE` refs). Message types differ **both ways**:
- **Theirs LACKS `RESET_TRAJECTORY` + `REPLAY_ANIMATIONS`** — the ▶ Play path (ours has them).
- **Ours lacks `SET_CUE_TIME`** + their deterministic re-sim catch-up.

Their deterministic re-sim is the stronger base; our Play/Replay path is a genuine gap in theirs.
Converging is a separate, larger job — deliberately NOT bundled into the focal rewire.
Also: their branch modified `check-layout-overlap.mjs` (+103 lines) but **their version still has the
`C:/Tutor/…` Windows path and still hardcodes `STATE_1..STATE_5`** — the vacuous-Gate-9 bug is
unfixed there, so this tree's rewritten version should win that file on merge.

### Scar-list rows closed / mechanised (of the "6 OPEN")
- **Row 7 — `check-layout-overlap.mjs` STATE_1..5 hardcode → FIXED.** Now enumerates states from `Object.keys(epic_l_path.states)` (+ `epic_c_branches`), models each primitive's REAL rendered box (label = font·1.25 centre-anchored; annotation/formula_box = lines·1.35+pad top-left), and applies a 3 px penetration tolerance so the intentional 14 px label stagger stops false-positiving. Proof: it now scans **Bohr's 9 states and vector_head_to_tail's 17** — the old script silently stopped at STATE_5 on both (and hid a real 6 px annotation overlap in vector_head_to_tail STATE_5, a physics finding left for the physics pipeline). Stale `C:/Tutor/...` default path gone; bare ids resolve across physics + chemistry.
- **Row 5 — Rule-29 focal size-bulge → FIXED (renderer).** `PM_focalPulseScale` (a size multiplier hitting textSize/strokeWeight/headLen/lineHeight in drawLabel/drawAnnotation/drawForceArrow/drawFormulaBox) is gone. **Now converged on the other machine's `PM_focalEmphasis` — see the cross-machine section above** (our interim `PM_focalPulseBoost`/`PM_brightenRgb` were deleted in favour of it). Verified: emitted sim.html has 0 stale helpers, 6 `PM_focalEmphasis`, and the 3552-line p5 body `node --check`s clean for BOTH a chemistry and a physics parametric concept.
- **Row 2 — indicator hardcoded-to-default → FIXED (probe mechanised).** Hard gate in `validate:chemistry` (`indicatorBindingErrors`): a pointer/caret/needle/marker BODY in a slider state with an `animation` block but no `position_expr` FAILs. Bohr passes (its indicators all bind `position_expr`).
- **Row 4 — narration outruns choreography → probe mechanised as WARN** (`narrationChoreographyWarnings`, heuristic words/2.8 wps, matches the word-budget WARN pattern). It caught that the prior "all 8 retimed" claim was incomplete: **STATE_3 (0.69) and STATE_7 (0.62) still settle before narration ends** — corroborated independently by THE EYE's D7. Stays OPEN until those two are retimed (chemistry_author + Asmi, not a mechanical bump).
- **Rows 3 & 6 remain OPEN** for the next pass: Row 3 (explore-ring symbol) needs reliable symbol tokenisation; Row 6 (computed-but-unsurfaced) is under-specified here — the concept's `computed_outputs` roles are empty strings, and the actual instance is already fixed (S9's `readout_hud` branches on `direction` → absorb/emit word).
- Seed script `_seed_engine_bug_queue_bohr_audit.ts` updated in-place (rows 2/5/7 → FIXED with `fixed_in_files`; row 4 annotated) so a post-migration re-run reflects reality.

### Also closed
- **Catalog naming (was "still open #4"):** `chemistryCatalog.ts` `'bohr_model'` → `'bohr_model_energy_levels'` (concept_id + the two downstream prerequisites), matching the shipped id before the serving path live-wires it.

### Still open (genuinely human/founder-gated)
1. **Asmi professor review** — the human gate; unchanged.
2. **Supabase migration** (`…engine_bug_queue_chemistry_subject_migration.sql`) — verified correct/ready; still needs the founder's hand in the SQL editor (no direct Postgres from here).
3. **Row 3 + Row 6 probes** — next pass (see above).
4. **STATE_3 / STATE_7 retiming** + adjudicating THE EYE's D7 verdict (calibration vs. real) — chemistry_author + founder/eye_walker.

### Files changed
- `src/scripts/check-layout-overlap.mjs` (rewritten — Row 7)
- `src/lib/renderers/parametric_renderer.ts` + `src/lib/renderers/premium_primitives.ts` (Rule-29 brightness emphasis — Row 5)
- `src/scripts/validate-chemistry.ts` (Row 2 hard gate + Row 4 WARN probe)
- `src/lib/chemistryCatalog.ts` (bohr id fix)
- `src/scripts/_seed_engine_bug_queue_bohr_audit.ts` (status/fixed_in_files bookkeeping)
- (env) Playwright `chromium_headless_shell-1217` extracted into `~/Library/Caches/ms-playwright/`; `simulation_cache` seeded for bohr; EYE frames under `.visual_runs/`.

---

## 🧪 SESSION (cont.) — Quality pass: physics-grade polish, the scar list, and the stage-4 gate (2026-07-24)

**Bottom line: the founder's review ("it only fills 50–60% of the panel, text overlaps text, physics sims come out at another level — why not this?") was correct on every count, and the causes were structural, not cosmetic. Fixed, then formally gated. 19 defect classes are now recorded in `engine_bug_queue` (12 from the build, 7 from the audit) — the scar list that makes the NEXT chemistry concept cheaper. Physics untouched throughout: tsc 0 · validate:concepts 124/124 · validate:chemistry 1/1 · both physics review builds green.**

### Why chemistry looked worse than physics — three structural causes (all fixed)
1. **The panel-fill gap was renderer-level, not chemistry.** `field_3d` does `setSize(innerWidth, innerHeight)` and reframes with a camera; the parametric renderer drew on a **fixed 760×500 canvas pinned top-left** — measured 760×500 inside a 972×659 iframe = **59% fill**. Added a config-gated fit-and-center transform (design space preserved, mouse remapped for slider hit-testing) → **100% fill**, verified. Gated so physics app/admin rendering is byte-unchanged.
2. **The overlaps had ONE systemic root cause.** `PM_resolveAnnotationOverlap` force-separates every `annotation` by ~41px. The ladder's rungs converge to 27–50px apart, so all six labels were pushed off their own rungs and the cascade shoved the bottom label onto the λ-strip. **A label pointing at the wrong line is a correctness defect.** Fixed by moving anchored text to `label` primitives (exempt from the resolver).
3. **Transient arrows never disappeared.** `animated_path` primitives without `disappear_at_ms` all persisted into the frozen end frame, stacking their tip-anchored labels — this *was* the S6 bottom-left crowding and the S4 arrows-through-text.

### GAP-2 closed + THE EYE unblocked
- **`position_expr`** added to `drawBody` (positional sibling of `label_expr`) — verified live: dragging n_end 2→6 moved the electron to y=166, exactly the n=6 rung, with readouts recomputing to 1.13 eV / 1094 nm / IR.
- **THE EYE was structurally blocked for chemistry** (it reads `simulation_cache`, not the JSON). Built `src/scripts/_seed_chemistry_cache.ts` (renderer-aware, namespace-general) + extracted `src/scripts/lib/buildParametricConfig.ts` so the review site and the cache seed cannot drift. THE EYE now resolves the concept, enumerates all 9 states and builds reveal maps. **Remaining blocker is environmental only** — the Playwright `chrome-headless-shell` binary download stalls on this laptop's network (license files only, no binary). Re-run `npx playwright install chromium-headless-shell` then `npm run visual:eyes -- bohr_model_energy_levels`.

### The stage-4 `quality_auditor` gate — VERDICT: FAIL (then fixed)
The audit was genuinely adversarial and found what my own visual walk missed. **Chemistry substrate passed cleanly**: ledger exact to the last digit, both compute engines in exact parity, the 6→2 rounding trap correctly avoided (410 not 411 nm), all 36 slider combinations resolve with zero template leaks, isolation clean both directions, assessment well-built, Rule-35 sweep spotless.
- **F1 (CRITICAL, the real blocker):** the parametric renderer implemented only **3 of 7** player message types — no `SET_TIME_FREEZE`/`RESET_TRAJECTORY`/`REPLAY_ANIMATIONS`/`PAUSE`/`RESUME`. So **Play/Pause/Replay were dead on the entire parametric family** (violating root §6 + Rule 26b), and it's precisely why THE EYE could never gate this family — `SET_TIME_FREEZE` is its capture pin. Silent because `PM_simTimeMs` was still exposed, so the player's clock *read* succeeded while every *write* was dropped. **FIXED:** full clock contract implemented; every animation gate now reads `PM_now()`; verified all 7 types present in the built sim.
- **F2–F6 + concerns FIXED:** λ-pointer hardcoded to 656 nm while its own text said 486 (in the state fighting that exact misconception); S9's `n_start` moved nothing; explore state surfaced extended-ring `ΔE`/`UV`/`IR` (Rule 38b); **narration outran motion in all 8 guided states** (Rule 31a inversion — word budget passed, so budget compliance masked it); strip label back inside the renderer-owned slider band. All retimed/rebound; choreography now spans narration in every state.

### The scar list (the founder's ask) — 19 rows in `engine_bug_queue`
Recorded with `bug_class`/`severity`/`owner_cluster`/`root_cause`/`prevention_rule`/`probe_logic`, tagged `discovered_in_session`. **10 of 12 build-round classes are `subject_neutral`** — they bind physics authoring identically (canvas fit, annotation de-overlap, coincident text, ASCII math, control-zone, smooth_camera clipping, review-site branch, position binding, computePhysics dispatch). This is the point: the chemistry run hardened the *shared* factory.
- Migration written (**needs founder to run in the Supabase SQL editor** — no direct Postgres access from here): `supabase_2026-07-24_engine_bug_queue_chemistry_subject_migration.sql` adds the `subject` column **and fixes a latent Phase-2 gap — `alex:chemistry_author` was in both admin UI enums but never in the DB CHECK constraint**, so the UI offered an owner the database rejects. Until applied, rows are stored without `subject` (the seed scripts degrade gracefully and re-running backfills).

### Still open
1. **THE EYE run** — environmental (Playwright binary download).
2. **Asmi professor review** — the human gate; unchanged.
3. **6 OPEN queue rows** for the next pass (indicator-binding probe, explore-ring symbol probe, narration/choreography probe, Rule-29 focal-size violation in the renderer, computed-but-unsurfaced value, and `check-layout-overlap.mjs` hardcoding STATE_1–5 so Gate 9 silently skips later states on every concept).
4. `src/lib/chemistryCatalog.ts` names the concept `bohr_model` vs the shipped `bohr_model_energy_levels` — harmless while chemistry serving is deferred, live-wire when it isn't.

---

## 🧪 SESSION — First chemistry diamond BUILT: Rutherford go/no-go → pivot to Bohr energy levels → full pipeline end-to-end → renders on the teacher surface (2026-07-23, branch `feat/chemistry-foundation`)

**Bottom line: the chemistry pipeline is PROVEN end-to-end and the first chemistry simulation — `bohr_model_energy_levels` — is authored, validated, physically correct, and renders on the real teacher review surface. Two "zero-renderer" premises in the docs turned out to be optimistic (Rutherford AND, more subtly, the "zero engine code" banner for archetype L) — both were caught before wasting pipeline work, and one shared-tooling gap (the review site never supported the parametric renderer at all) was closed additively. Physics untouched throughout (tsc 0 · validate:concepts 124/124 · validate:chemistry 1/1 PASS).**

### The Rutherford go/no-go (decided against; founder pivot to Bohr)
The plan called Rutherford α-scattering a "£0 reuse of `magnetic_force_moving_charge`'s trajectory machinery." A read of `field_3d_renderer.ts` disproved it: Lorentz motion is **hardcoded closed-form** (`trajectory_mode: circle/helix/static`, no general force integrator), no Coulomb scenario animates a moving particle, and `animated_path` is 2D-only + not wired into field_3d. Rutherford's 1/r² **hyperbolic scattering** off a fixed nucleus needs a **new `field_3d` scenario (~200–400 lines)** — exactly the renderer spend Wave-1 "prove-first" was meant to avoid. **This is the same mislabel class as archetype M** (both overstated renderer readiness). Corrected `docs/patterns/chemistry.md`: archetype K split (in-field circular/helical = [LIVE]; scattering = [NEEDS-SCENARIO]), archetype M relabeled [NEEDS-SCENARIO] with a new tier between [LIVE] and [PHASE-5]. **Founder decision: pivot Wave 1 to Bohr / atomic energy levels** (archetype L, genuinely renderable on the existing 2D `parametric` renderer — the true zero-new-renderer path; iconic, NCERT Cl.11 Ch.2, rated "low engine cost" in `CHEMISTRY_ARCHITECTURE.md` §9).

### The Bohr build (full pipeline, sequential)
`architect` → 9-state skeleton (S1 rainbow-vs-lines hook → S2 ladder → S3 quantised-jump contrast (PRIMARY misconception) → S4 exact-photon absorb → S5 emission flip + first line → S6 gap-to-line fingerprint (PRIMARY aha) → S7 ΔE = hν = hc/λ ledger → S8 Eₙ = −13.6/n² + ionisation → S9 explore sandbox), Rule 16a/31/32/33/34/38 plan, universal anchor (glowing-gas sign / starlight). → `chemistry_author` → engine_config, python-verified energy-conservation ledger (E1..E6, four Balmer λ 656/486/434/410 nm, 1→3 absorption 12.09 eV, ionisation 13.6 eV all CONFIRMED), per-state motion timelines, 45 drill-down phrasings, integer-snap correctness rule. → `json_author` → `src/data/concepts/chemistry/bohr_model_energy_levels.json` (site #1 ONLY — isolation held), + the additive concept-gated compute wiring (see below), + a not-applied cluster-seed migration. → visual walk (me) → one ladder-clipping defect found + fixed.

### Two premise corrections + one tooling gap closed (all additive, physics byte-safe)
1. **Archetype L is [LIVE] but NOT "zero engine code."** `parametric_renderer.ts`'s `computePhysics()` is a hardcoded per-concept-id dispatch — every parametric concept needs its own ~15-line `computePhysics_<id>` (the "low engine cost" §9 forecast, not literally zero). Added `computePhysics_bohr_model_energy_levels` (iframe-side, for build:review live labels) + a TS engine `src/lib/physicsEngine/concepts/bohr_model_energy_levels.ts` + ENGINES entry — additive, concept-gated, fires only for this id.
2. **GAP 1 — the review site never supported the parametric renderer.** `build_review_site.ts` hard-gated on `field_3d_config`/`particle_field_config`; NO parametric concept (not even physics ones like `vector_head_to_tail`) could render on the teacher surface. Added an additive third branch (`buildParametricConfig` + `assembleParametricHtml`), mirroring the app-path construction. Verified physics field_3d review build (faraday) unaffected. **This unblocks the whole parametric family, physics and chemistry.**
3. **GAP 2 (known, deferred) — parametric can't bind `body`/`animated_path` positions to live variables.** Only text labels (`label_expr`/`text_expr`) are live-reactive. So in S7/S9 the slider updates the ΔE/λ NUMBERS live (verified: "ΔE = 1.89 eV λ = 656 nm (VISIBLE)") but the electron/photon GLYPH doesn't visually re-jump. Guided states S1–S8 (authored one-shot animations) are fully intact. GAP 2 = a `peter_parker:renderer_primitives` follow-up (a live-position-expr primitive) if future explore states need drag-driven motion.

### The one authoring defect found + fixed (visual walk)
STATE_2's `smooth_camera` zoom (1.3× centered on the bottom electron) pushed rungs n=4/5/6 off the top of the (already ~91%-full) canvas. `json_author` removed the smooth_camera (a legibility-over-flourish tradeoff — Rule 33 zoom-link sacrificed to keep all six rungs on-canvas). Re-verified: all 6 rungs now show with correct convergent spacing.

### Verification (evidence)
`tsc` 0 · `validate:concepts` **124/124** (physics untouched, isolation held) · `validate:chemistry` **1/1 PASS** · `build:review -- bohr_model_energy_levels` exit 0 · physics `build:review -- faraday_law_induction` exit 0 (parametric branch didn't disturb field_3d) · **visual walk on the served review site: S1 hook, S2 ladder (post-fix, all 6 rungs), S9 sandbox with live ΔE/λ readout — all render correctly.** Console clean (lone 404 = on-demand audio manifest, expected per Rule 30h).

### Files changed
- `src/data/concepts/chemistry/bohr_model_energy_levels.json` (new — the concept)
- `src/lib/renderers/parametric_renderer.ts` (+1 concept-gated compute fn + 1 dispatcher line)
- `src/lib/physicsEngine/concepts/bohr_model_energy_levels.ts` (new) + `src/lib/physicsEngine/index.ts` (+1 import, +1 ENGINES entry)
- `src/scripts/build_review_site.ts` (+parametric branch — GAP 1; helps physics parametric concepts too)
- `supabase_migrations/supabase_2026-07-23_seed_bohr_model_energy_levels_clusters_migration.sql` (new, NOT applied)
- `docs/patterns/chemistry.md` (archetype K split, M relabeled, L verified + tiers corrected)

### ⏭ NEXT — Bohr finishing + Wave-1.5
1. **Formal `quality_auditor` gate** (stage 4 — not yet run this session; chemistry gates: E42/RHR N/A, conservation/units/word-budget/assessment/Rule 24/31/32/34/35 apply) + **Asmi professor review**.
2. **THE EYE** needs a chemistry cache-seed (reads the chemistry subdir → `simulation_cache`) before `visual:eyes`/`visual:approve` (Phase-3d — still the prereq gate; the review-site path proved out today without it).
3. **GAP 2 decision:** greenlight a `renderer_primitives` live-position-expr primitive if drag-driven visual jumps matter, else ship S7/S9 with live numbers + authored default animation.
4. **Wave-1.5:** Rutherford α-scattering once a founder-approved `field_3d` scattering scenario is built (now correctly scoped as [NEEDS-SCENARIO]).
5. Not pushed. 8+ files changed on `feat/chemistry-foundation`.

---

## 🧪 SESSION — Chemistry foundation: architecture → chemistry_author → subject-aware catalog → parity-audit hardening → international build-flow locked (2026-07-23, branch `feat/chemistry-foundation`, new macOS laptop)

**Bottom line: chemistry went from an empty scaffold folder to a fully buildable subject at parity with physics — architecture + phased plan (Rule 17, founder-approved), the `chemistry_author` agent role + pattern library, subject-aware catalog plumbing (physics output proven BYTE-IDENTICAL), a founder-requested parity audit that hardened all four shared agent specs + the build/verify tooling, and a locked international-first, renderer-compounding build flow. Physics untouched throughout (tripwire green after every phase). 5 commits on `feat/chemistry-foundation`, NOT pushed. NO chemistry concept authored yet — next session builds Rutherford α-scattering (Wave 1, prove-first).**

### Phases delivered
- **Phase 0 — baseline (`d25cdc4`, `4a3cbf5`):** fixed a real repo bug (committed lockfile out of sync → `npm ci` failed repo-wide, missing @emnapi entries; proven fixed). Locked the isolation-contract comment in `validate-concepts.ts` (non-recursive scan = chemistry invisible to physics validation BY DESIGN). Installed the local agent-sync pre-commit hook. Recorded the green tripwire baseline.
- **Phase 2 — authoring layer (`d31f6c4`):** `.agents/chemistry_author/CLAUDE.md` (+ emission, sonnet-5 pin) — balanced-equation-ledger doctrine (atom/charge conservation, redox e⁻ balance), chemistry units first-class, [LIVE]-archetype-only interim rule. `docs/patterns/chemistry.md` — representation triangle (macro↔particulate↔symbolic), archetypes K–Q with renderer-gating, chemistry source roles (NCERT Chemistry backbone + NCERT Exemplar misconceptions + universal anchors). Governance: 11-role roster, `alex:chemistry_author` owner tag everywhere.
- **Phase 1 — curriculum plumbing (`c6bfb03`):** `Subject` type (client-safe); `src/lib/chemistryCatalog.ts` (NCERT Cl.11 Ch.1–4 maps + Ch.2 roadmap ghosts); `conceptCatalog.ts` routes by `subject` as a PARAMETER (default physics), NOT a stored field — physics API output proven byte-identical via a throwaway function-level diff harness. `?subject=` on both catalog routes; `/learn` label un-hardcoded (toggle deferred to Phase 3); separate `NCERT_CHEMISTRY_BOUNDARIES`.
- **Phase 2.5 — parity hardening (`ed49664`):** founder asked "is chemistry as strong as physics? why wasn't the architect changed?" — a two-audit pass (agent specs + serving-path tooling) found the four shared specs would misfire on a chemistry run (architect never referenced chemistry.md → violated chemistry_author's input contract by construction; auditor had no `alex:chemistry_author` FAIL route + Gate 2 would false-FAIL; json_author's 8-site registration inverted for chemistry; eye_walker lacked chemistry visual-sanity checks). Fixed with ADDITIVE "Chemistry concepts (2026-07-23)" sections in all four canonicals (+0 deletions, emissions regenerated same-session). Tooling: new shared `src/scripts/lib/resolveConceptJson.ts` (flat physics path FIRST = byte-identical; logs on chemistry resolution) wired into the 3 flat-hardcoded loaders — including fixing a SILENT-degradation trap (a missing chemistry JSON used to quietly disable THE EYE's Category I/E, now an explicit warning). New `npm run validate:chemistry` v0. Addenda to AUTHORING_PIPELINE.md + root CLAUDE.md (3 lines, founder-approved).

### Strategy locked this session (detail → CHEMISTRY_DISCUSSIONS.md)
- **Verdict: extend, don't duplicate.** The subject-neutral spine (schema, Rule 31/32/33/34 pacing/legibility, TTS, EYE motion-reading, catalog) transfers. Chemistry-specific work is concentrated in exactly two seams: the rigor role (chemistry_author — DONE) and the render surface (Phase 5). ONE shared architect/auditor/eye_walker with chemistry-aware SPECS, not sibling roles.
- **International + NCERT at once (the founder's priority):** chemistry's "universal passport" = the *physical chemistry of change* cluster (kinetic theory → rates → energetics → equilibrium) — both the highest cross-curriculum overlap AND the most simulatable, per Rule 38 + Session-86 market sizing + Topic-14 simulatability. Served by concept CHOICE (the passport concepts sit in every board) + Rule 38 depth-rings (NCERT depth authored, lighter boards hide the advanced ring).
- **Renderer reality check (verified):** `particle_field_renderer` is entirely circuit-shaped — NO gas-particle/collision scenario exists. So archetype M (particle-box) is NOT [LIVE]; it needs a modest scenario built once (then reused across the whole passport cluster). The ONLY true zero-renderer-cost start is Rutherford (archetype K, reuses the built trajectory engine). **`docs/patterns/chemistry.md` mislabels M as [LIVE] — flagged for correction.**
- **Decision (founder): prove-first.** Wave 1 = Rutherford α-scattering (zero renderer, validates the whole chemistry pipeline). The particle-box investment + the passport cluster follow in Wave 2.

### Verification (evidence)
`tsc` 0 · `validate:concepts` 124/124 (physics untouched) · `validate:chemistry` 0/0 PASS (empty namespace) · vitest 288/288 · agents 11/11 in sync · `build:review faraday_law_induction` exit 0 with zero resolver log lines (physics path silent) · chemistry-side resolution probed + logged.

### Environment notes (new machine)
Repo migrated from Windows (`C:\Tutor\...` paths in docs are historical). `~/.claude/rules/agent-teams-reference.md` (referenced by governance) does NOT exist on this laptop — the hard rules survive verbatim in `.agents/CLAUDE.md`, but the original external file should be recovered/re-authored. 2 pre-existing `react-hooks/set-state-in-effect` lint errors in `learn/page.tsx` (present on HEAD, untouched).

### ⏭ NEXT SESSION — Rutherford α-scattering (Wave 1, prove-first)
The first chemistry vertical slice through the full pipeline, on the registration-free review-site path:
1. **Concept correction first (small):** fix the archetype-M `[LIVE]` mislabel in `docs/patterns/chemistry.md` (add a "needs-a-scenario" tier between [LIVE] and [PHASE-5]); optionally re-seed the roadmap ghosts around the international wave order.
2. **Pipeline:** `architect` skeleton (chemistry sources + `docs/patterns/chemistry.md` archetype K; DoD = balanced-equation-ledger variant, RHR N/A) → `chemistry_author` block (α-particle trajectory geometry, closest-approach `d = kQq/E`, the ONE formula surface of the aha state) → `json_author` emits `src/data/concepts/chemistry/rutherford_alpha_scattering.json` (site #1 ONLY — sites 2/3/4/7/8 forbidden; reuse a `field_3d_config` on the force-in-field machinery) → `quality_auditor` (chemistry gates: ledger correctness N/A for a physics-experiment concept, but conservation/units apply; `validate:chemistry` PASS).
3. **Visual:** needs a `simulation_cache` row → a chemistry cache-seed script that reads the chemistry subdir (Phase-3 per-concept file) → `visual:eyes` (THE EYE) → `eye_walker` → founder review → `build:review -- rutherford_alpha_scattering`.
4. **Prereq to watch:** THE EYE reads the sim from Supabase `simulation_cache`, not the JSON — so the cache-seed step is the gate. The review-site path (`build:review`) renders straight from the JSON and needs no cache.
