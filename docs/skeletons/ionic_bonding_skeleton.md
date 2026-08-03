# ARCHITECT SKELETON — `ionic_bonding` (chemistry, Phase-0 bonding wave, Desk 2 concept 1 of 2)

**Date:** 2026-08-03 · **Renderer:** `field_3d` · `scenario_type: 'bonding_scene'` · **Placement:** `free → lattice`
**Arc source (BINDING):** `docs/CHEMISTRY_PHASE0_BONDING.md` §0b `ionic_bonding` table, Checkpoint A `DESIGN_OK` cycle 2 (2026-08-01). This skeleton implements that arc; it does not redesign it. No arc defect was found.
**Registration:** site #1 ONLY (`src/data/concepts/chemistry/ionic_bonding.json`). Validation: `npm run validate:chemistry`. Sites 2/3/4/7/8 forbidden (Gate 8b all-or-nothing).

> ⛔ **INPUT-GAP NOTE — UPDATED AT CHECKPOINT A CYCLE 2 (2026-08-03).** At cycle 1 the architect could
> not read the Desk-1 artifacts (all 20 commits / 63 files live only on `feat/chemistry-polarity-hbonding`).
> **Both escalations are now resolved:** (1) Desk-1's artifacts are readable via
> `git show origin/feat/chemistry-polarity-hbonding:<path>` — founder-proxy discharged the escalation
> after finding the skeleton had independently absorbed 5 of the 6 Desk-1 corrections; the one miss
> was leaning on `thermal.jiggle_scale` as the no-static-state guarantee while it was a site-layer
> no-op (P-2). That miss is closed in this revision (§3, §4). (2) The E3b engine dispatch is IN
> FLIGHT and much larger than Phase-0 scoped — site-layer parity was missing, not just the deferred
> modes. **The authoritative post-E3b engine contract is
> `docs/notes/bonding_scene_E3b-dispatch.md` (desk `feat/bonding-scene-e3b`); this skeleton is
> authored against it**, and §4 marks every state with the dispatch (1/2/3/4) that unblocks it.
> `chemistry_author` may author S1–S5 JSON now; S6–S10 JSON authoring waits for E3b to land.

---

## 1 · Atomic claim + tier justification

**This concept teaches one idea: an ionic compound is not made of molecules — electron transfer makes ions, and ions pack into an endless repeating lattice whose structure explains everything salt does (shatters flat, melts high, conducts only when molten).** It does not cover Born–Haber energy cycles (ledger row 2), dissolution/hydration (ledger row 3), Fajans' polarisation (ledger row 4), or the metallic contrast's own arc (sibling concept `metallic_bonding`, this desk, concept 2).

**Tier: 💎 (fixed at Phase-0 §0a).** Whiteboard test: "there is no NaCl molecule" is a 3D fact about an endless lattice, and the cleavage beat — shift one layer by one site and the crystal splits — is a motion, not a picture. Capability 3 + 4.

**Representation triangle:** the particulate vertex leads every guided state; the symbolic vertex (formula surfaces, the reaction ledger) supports and never leads a core state; the macroscopic vertex enters through the anchor (a salt grain's flat faces) at S6–S8.

---

## 2 · State count + arc — 10 states (FIXED by Phase-0 §0b)

10 states sits at the "very complex" edge of the §5 calibration table and is justified: three examinable macroscopic properties (shatter, melt, conduct), each a distinct derived motion, plus a formation half (transfer → lattice) and one advanced comparison. Checkpoint A graded this arc twice.

Each state's **title** (the rail string, Rule 41d: short, literal, first words carry the meaning —
the rail truncates) is authored here and is BINDING on json-author:

| # | id | Title (rail, Rule 41d) | Purpose (one line) | teaching_method |
|---|---|---|---|---|
| S1 | `STATE_1` | One spare electron, one gap | One atom has a spare outer electron, the other a gap | — (straightforward beat) |
| S2 | `STATE_2` | The electron transfers | The electron transfers and BOTH atoms change size | — |
| S3 | `STATE_3` | The ions pull in and stop | Attraction pulls the ions in; the full shells stop them | — |
| S4 | `STATE_4` | Not a molecule — a lattice | **The pair does not stay a pair** — the lattice grows (PRIMARY aha; misconception pivot) | misconception_confrontation (16a contrast beat) |
| S5 | `STATE_5` | Six neighbours for every ion | Every ion is surrounded by six of the other kind | — |
| S6 | `STATE_6` | One layer shift splits it | One-site layer shift lines up like charges — the crystal splits | — |
| S7 | `STATE_7` | Melting takes the whole lattice | Melting frees the ions; the whole lattice must fail at once | — |
| S8 | `STATE_8` | Only molten salt conducts | Same field on solid and melt: only free ions carry charge | — (16a contrast beat #2) |
| S9 | `STATE_9` | Higher charge, stronger lattice | **advanced** — double the charge, far stronger lattice (NaCl melts, MgO holds) | compare_contrast |
| S10 | `STATE_10` | Explore the lattice | Explore sandbox — all core controls | exploration_sliders |

`state_count: 10`. Rings: S1–S8 + S10 `core`, S9 `advanced` (contiguous, immediately before explore — Rule 38a). No extended ring. `advance_mode`: S1–S9 `manual_click`, S10 `interaction_complete` (Gate 12 ≥2 modes ✓).

**Archetype provenance:** all names are the Phase-0 coinages approved at Checkpoint A cycle 2 — members of the particulate-box (M) family of `docs/patterns/chemistry.md` §1, specialised per beat. `layer-shift-snap` is the wave's one DECLARED archetype-repeat contrast pair with `metallic_bonding` S5 `layer-shift-hold` (same motion, same `like_contacts` readout, opposite derived outcome). Declared, never renamed.

---

## 3 · Per-state control table (Rule 31 — the first design artifact)

Word counts are targets inside the 25–55 budget. **Duration is derived from the PLAYER's speech model** (player words = chars/5.5 at 2.16 w/s → ≈ 0.505 s per authored word), then `duration = ceil(player timeline ⁄ 1000)` where timeline = max(speech end, last cue + settle) — Desk-1 lessons 2 + 3. json-author re-derives from the FINAL narration strings; these are design envelopes, not final digits.

| # | Ring | Teaches | Archetype | Delta cue (≤5 words, Rule 41) | Controls `{id, min_ring}` | Words | Est. timeline | Duration (s) | Glow focal |
|---|---|---|---|---|---|---|---|---|---|
| S1 | core | Na has one spare outer electron; Cl has one gap | `shell-reveal` | "One spare, one gap" | — | 40 | ~20 s | 21 | `electrons` |
| S2 | core | Transfer; both radii change on the linear-pm scale | `transfer-and-resize` | "Electron moves, sizes change" | — | 45 | ~23 s | 24 | `electrons` |
| S3 | core | Attraction in, shell repulsion out, balance at a fixed spacing (HUD-read) | `pull-to-balance` | "Pull in, then stop" | — | 42 | ~21.5 s | 22 | `units` |
| S4 | core | The pair does not stay a pair; the lattice grows | `lattice-grow` | "More ions keep joining" | — | 48 | ~24.5 s | 25 | `lattice` |
| S5 | core | 6:6 coordination, read from inside the block | `neighbour-cutaway` | "Six neighbours, every ion" | `{spin, core}` | 40 | ~20.5 s | 21 | `neighbours` |
| S6 | core | One-site shift → like charges meet → split (derived) | `layer-shift-snap` ⇄ | "One shift, it splits" | `{shift, core}` | 45 | ~23 s | 24 | `layer` |
| S7 | core | Heat frees the ions; the whole lattice fails at once | `melt-the-lattice` | "Heat frees the ions" | `{temperature, core}` | 45 | ~23 s | 24 | `lattice` |
| S8 | core | One field, two samples: only the melt conducts | `field-on-both` | "Free ions carry charge" | `{field, core}` | 50 | ~25.5 s | 26 | `units` |
| S9 | **adv** | Charge and size set lattice strength (NaCl vs MgO race) | `melt-race` | "Double charge, far stronger" | — | 46 | ~23.5 s | 24 | `lattice` |
| S10 | core | Explore | `interaction_complete` | — | `{ion_pair}` `{spin}` `{temperature}` `{shift}` `{field}` all core | 0/open | free-run | 30 | — |

No two guided states share an archetype except the declared cross-concept pair.

**No static state — the guarantee and what it rests on (corrected at cycle 2).** The previous
revision rested this guarantee on `thermal.jiggle_scale`, which was a **site-layer no-op** on the
shipped engine (`bscJiggle` called only inside the unit layer's `orgAt`, `:54095` — E3b P-2), while
`deriveStateMeta` still declared the states MOVING: a green gate over ten dead states. Post-E3b
**dispatch 1 · S-2** applies `bscJiggle` to site positions (same deterministic per-site seeded
sines, same √(T/T₀) law), and the **S-8 parity gate, assertion 2** proves it frame-against-frame
(jiggle_scale 1 ⇒ two frames 200 ms apart differ; 0 ⇒ byte-identical). `jiggle_scale` keeps its
default of **0** — every S1–S9 state AUTHORS it > 0 and/or carries a scripted ramp; authoring stays
explicit. Motion-continuity budget: no static run > ~25% of any state's timeline; every scripted
ramp is stretched to run under the sentence that explains it (lesson 4).

---

## 4 · The engine-block map — the FUNCTION that moves each taught element, and the E3b dispatch that unblocks it

**Method (scar-closing):** a mode string only selects the camera pose (`BS_CAMERA_POSES`, `:51960+`).
A state is certified buildable ONLY by naming the renderer FUNCTION that moves its taught element,
with its line number. This closes `skeleton_certifies_a_state_buildable_from_a_mode_string_without_a_frame_probe`
and the architect directive `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path`
(the reader is quoted, not the seam report). Authoritative post-E3b contract:
`docs/notes/bonding_scene_E3b-dispatch.md` — dispatches **1** (site-layer parity), **2** (property
table + `melt` + row R `groups`), **3** (`layer_shift` + D-7 `like_contacts`), **4** (row Q `ions` +
`drift` + `field_at_ms` + conductivity).

| State | Taught element's motion | Moving function (post-E3b) | Live today? | Unblocked by |
|---|---|---|---|---|
| S1 | Per-site shell dots turning under spin; ambient jiggle | Spin: `bscSpinRot` on `sitePos` (live). Shell dots per site from `BS_VALENCE[bscParentEl(siteSp[i])]` + site-aware `valence` HUD: **D1·S-3**. Jiggle: `bscJiggle` on sites: **D1·S-2** | **NO — dead state** (P-3: dots come from `BS_VALENCE[mol.central]` with `molKey` falling back to `"HCl"` `:53810/:54843` ⇒ ONE dot, HUD `outer electrons = 1`) | **Dispatch 1** (S-2, S-3) |
| S2 | Electron dot crosses; species/charge/radius ramp together | `bscTransferProg` (`:52840`) → `bscTransferSite` (`:52851`): charge and radius ramp linearly in pm, Σq = 0 at every instant; electron dot `bsc_transfer_e` (`:53318`). All LIVE. Ambient jiggle: **D1·S-2** | **YES** (core beat live; jiggle texture pending D1) | **Dispatch 1** (S-2 only) |
| S3 | Two ions approach and settle; live distance readout | Site position chain — `separation_axis`/`approach_from`/`approach_at_ms`/`approach_duration_ms` on the leading site pair via closed-form `mgRamp`: **D1·S-1** (today `sitePos` is raw `at` + spin only, `:54376` — P-1, byte-static). `separation_pm` HUD: **D1·S-4**. Opening-extent fit for ions (`bscOpeningExtent` skips non-molecule species, `:52914`): **D1·S-1** | **NO — dead state** (P-1) | **Dispatch 1** (S-1, S-2, S-4) |
| S4 | Lattice grows site by site from the pair | `bscGrowShown` (`:52832`) ramps `nShown` over `grow_at_ms/grow_duration_ms` — LIVE. Ambient jiggle: **D1·S-2** | **YES** (growth live; jiggle pending D1) | **Dispatch 1** (S-2 only) |
| S5 | Peers fade, block opens to ball-and-stick, six rods; slow spin | Reveal ramp `revF` → `BS_PEER_FADE_OPACITY` (`:54445`) + `BS_COORD_RADIUS_SCALE` (`:51685`) + coordination rods (`:53303`) — LIVE. Spin: `bscSpinRot`, LIVE. `coordination = 6 : 6` HUD format (both counts independently derived): **D1·S-5**. Jiggle: **D1·S-2** | **YES for motion; HUD format is D1** (today prints `neighbours = <n>`, `:55080`) | **Dispatch 1** (S-2, S-5) |
| S6 | Upper half slides one site; derived split; live contact counter | `shift:{at_ms,duration_ms,offset_sites,plane}` closed-form ramp + derived separation: **D3·L-1**. `like_contacts` metric + HUD: **D3·L-2** (gate 8 asserts the definition on the cation-only disagreement case). Drag-seize on `shift`: D3·L-1. Jiggle: **D1·S-2** | **NO** (`layer_shift` ∈ `BS_MODES_DEFERRED`) | **Dispatches 1 + 3** |
| S7 | Temperature ramps; at the melting point ions leave sites (derived) | Thermal ramp cue `T_from/T_at_ms/T_ramp_ms` — LIVE (E2b). Melt outcome `f_melt = clamp((T_K − mp_K)/25, 0, 1)`: **D2·T-2**, reading `BS_ION_PAIRS.mp_K`: **D2·T-1**. `melting_point`/`lattice_enthalpy` HUD: **D2·T-3**. Growing jiggle: **D1·S-2**. Drag-seize on `temperature`: live pattern + D1·S-7 range check | **NO** (`melt` deferred; no property table) | **Dispatches 1 + 2** |
| S8 | Field arrows on-cue; melt's ions drift, solid's jiggle in place | `ions:{mobile, field}` + `mode:'drift'`: **D4·Q-1**. `field_at_ms` cue (destination-valued, frozen-pin registered): **D4·Q-2**. `conductivity` HUD: **D4·Q-3**. Two co-present samples (row R `groups`, inheritance by construction): **D2·T-4**; `g_melt` opens already molten via closed-form `f_melt`: **D2·T-2**. The solid's jiggle-in-place negative control: **D1·S-2 (load-bearing)** | **NO** (`drift` deferred; no groups/ions/field cue) | **Dispatches 1 + 2 + 4** |
| S9 | One scene-level ramp; NaCl melts mid-ramp, MgO holds (both derived) | Row R `groups` + scene-level `thermal` inheritance: **D2·T-4**. Derived per-group outcome: **D2·T-2** reading **D2·T-1**. Per-group prefixed HUD lines: **D2·T-3** | **NO** | **Dispatch 2** (ramp cue itself is live E2b) |
| S10 | Sandbox: picker + spin + temperature + shift + field all live | Ion-pair picker `bsc_ion_pair_select` → `pairOverride` in `bscSiteList` (`:52794–:52801`) — LIVE. Explore idle-spin guard must not stand down on a no-op jiggle signal: **D1·S-6**. Temperature range 300–3400: **D1·S-7** (authoring, §7.0). Shift/field/melt behaviours live inside explore: **D3 + D4 + D2** | **NO** (inherits every block above) | **Dispatches 1 + 2 + 3 + 4** |

HUD lines live today: `delta_chi, mu, radius_pm, valence*, links, links_per_unit, bp, coordination*, lattice_a`
(*`valence` is dead on ion scenes until D1·S-3; `coordination` is reformatted by D1·S-5*). E3b delivers
`separation_pm, like_contacts, melting_point, lattice_enthalpy, conductivity` (+ `drift, atomisation`
for metallic). `links.show_count` is parsed-and-never-read — **never author it**.

---

## 5 · Checkpoint-A second pass — rows R and D-7 (the two items Phase-0 §0c deferred to THIS skeleton)

### 5.1 Row R — `groups: [{id, label, at, units?, lattice, thermal, field}]` — what S8 and S9 each require

**S8 is *one field, two samples*.**
- Two groups, each with its OWN `lattice` (same cell, same `a_pm`, same species) and its OWN `thermal` (`g_solid` T_K 300; **`g_melt` T_K 1150** — see the melt-law knee, §5.3: the knee sits at `mp_K + 25` = 1099 K, so 1100 would sit at the knee with no margin; 1150 opens at `f_melt = 1` with 51 K of margin).
- **A group must be able to OPEN already-molten**: `g_melt` authors no melt ramp — its `thermal.T_K` sits above the knee from t=0, and the molten arrangement is a closed-form function of (T_K, site index, state-local t) via `f_melt` (D2·T-2). No latch, no replayed history (D-1).
- **The field is authored ONCE at scene level and inherited by both groups** (inheritance by construction, D2·T-4). Per-group `field` exists as an override, but S8 must NOT use it. The field turns on via `field_at_ms` (destination-valued, D4·Q-2) so the cause moves first (Rule 32a).
- **Gate 13's negative control is part of the state's spec:** under the field, `g_solid`'s ions jiggle in place (D1·S-2 — load-bearing: a byte-frozen solid teaches "solids are dead", not "solids are held in place") and never translate; `g_melt`'s drift along the field.
- **`conductivity` HUD (decided, D4·Q-3):** live and state-dependent — `g_solid` prints `conductivity: none — ions fixed`; `g_melt` prints `conductivity ≈ 3.5 S·cm⁻¹ (1100 K)`. The side-by-side gap IS the contrast; **no authored string quotes a ratio or a solid-side digit** (§5.3).
- Group labels ("solid" / "molten", `pmCreateAutoLabel`) placed clear of the fixed 220 px right-anchored HUD.
- Camera: the fit-solve spans BOTH bounding boxes (D2·T-4). Never author `camera`.

**S9 is *one temperature, two lattices*.**
- Two groups differing ONLY in `lattice` (`g_nacl`: rock_salt a 564.0, Na⁺/Cl⁻; `g_mgo`: rock_salt a 421.2, Mg²⁺/O²⁻).
- **`thermal` authored at SCENE level with NO per-group override** — the shared ramp IS the teaching. Uses the existing E2b cue: `T_from: 300`, `T_at_ms`, `T_ramp_ms`, destination `T_K: 1500` (inside the concept slider range, §7.0).
- Each group derives its own outcome from its own melting point: NaCl (1074 K) melts mid-ramp; MgO (3125 K) holds with growing jiggle. **Derived, never authored** (D-2), via §5.3's ratified table.
- Gate 14: heating past 1074 K leaves `g_mgo`'s lattice bit-for-bit unchanged (jiggle aside).
- **Per-group HUD format (decided, D2·T-3):** each line prints once per group, prefixed by the group label, group order = authored `groups` array order — exactly `NaCl m.p. = 1074 K` · `NaCl ΔH = 788 kJ·mol⁻¹` · `MgO m.p. = 3125 K` · `MgO ΔH = 3791 kJ·mol⁻¹`. Engine-printed from the table, never hand-typed (lesson 1).
- **HUD budget — a MEASURE-at-1024 duty, not a reasoned assumption (Desk-1 lesson: the HUD is a fixed box at every width).** S9 puts FOUR lines in the fixed 220 px HUD (min-width 190 px) beside two `pmCreateAutoLabel` group labels. E3b T-3 carries the measurement duty; json-author re-verifies at 1024 px on the built state before hand-off. If the four lines wrap or collide, the fix is layout (E3b), never abbreviating the decided strings.

### 5.2 D-7 — `like_contacts`, specified so the naive version cannot be built

**Definition (binding, from Phase-0 D-7):** `like_contacts(t)` = like-charge nearest-neighbour contacts **created by the shift** (a DELTA against the unshifted reference lattice at the same t) **and left unscreened** (a contact is screened when electron-sea density lies between the pair — so in a metal every contact, before and after, is screened).

Operationally for the surgeon:
- `naive(t)` = count of nearest-neighbour pairs (separation ≤ ~1.1 × nn distance) with same-sign charge. On unshifted rock salt `naive = 0`; on a cation-only bcc metal `naive = 8` per interior site **before anything moves** — the case where naive and intended disagree.
- `like_contacts(t)` = `unscreened(shifted, t) − unscreened(unshifted reference, t)`. Ionic (no sea): 0 → 6. Metal (sea screens all): 0 → 0.
- The displayed number is the engine's derived count for the focal interface ion, and **gate 8 asserts the DEFINITION on the disagreement case**: the naive count on the cation-only lattice must be non-zero pre-shift while the shipped metric reads 0.
- **Skeleton discipline (lesson 1):** "0 → 6" is the Phase-0 design expectation. If the engine's derived count is not 6, that is a **Phase-0 arc discrepancy — STOP and report**; do not tune the metric to print 6, and do not hand-type 6 into an annotation. No narration or annotation quotes the digit; the HUD carries it.

### 5.3 The ion-pair property table, the melt law, and the conductivity decision (all now DECIDED — transcribe, do not re-derive)

**Property table (D2·T-1) — all five rows RATIFIED by `chemistry_author` 2026-08-03, both columns; change no digit:** NaCl 1074 K / 788 kJ·mol⁻¹ · KCl 1043 / 715 · LiF 1118 / 1030 · MgO 3125 / 3791 · CaO 2886 / 3401. Conventions (named verbatim in the renderer source comment): `mp_K` = melting point at standard pressure, congruent melt; `lattice_kJ` = lattice DISSOCIATION enthalpy, MX(s) → M⁺(g) + X⁻(g), positive, 298 K, Born–Haber-derived — never Born–Landé/Kapustinskii. MgO/CaO carry a measurement-precision flag; KCl/LiF a normal cross-compilation-spread flag. The gate PRINTS table-vs-literature with the ratify flag (the E1 dipole-table pattern). HUD formats fixed: `m.p. = 1074 K` · `ΔH = 788 kJ·mol⁻¹`; under `groups`, prefixed by the group label.

**Melt law (D2·T-2) — stated here so json-author cannot re-break it:**
`f_melt = clamp((T_K − mp_K) ⁄ 25, 0, 1)` — **the knee sits at `mp_K + 25`** (NaCl: 1099 K). Sharp by design (25 K ≈ 2.3% of NaCl's mp — visually smooth, chemically sharp); the mobile fraction ramps deterministically by site index; closed-form in (T_K, site index, state-local t), no latch, so a group may open already molten. Derived, never authored (D-2). Authoring consequences: **S8's `g_melt.thermal.T_K` = 1150** (1100 has no margin over the knee); S7's scripted destination 1200 K clears the knee by 101 K; S9's 1500 K puts NaCl at f=1 and MgO at f=0. **Never widen or narrow the law to make an authored number work.**

**Conductivity (D4·Q-3) — the endpoint that could not be ratified:** `chemistry_author` RATIFIED molten NaCl ≈ 3.5 S·cm⁻¹ at 1100 K (Janz-tradition compilation) and **flatly declined any solid-NaCl endpoint** (defect-mediated, purity-dependent, spans orders of magnitude). **Phase-0's ≈10¹³-fold ratio does NOT ship.** The HUD is live and state-dependent: solid ⇒ `conductivity: none — ions fixed`; molten ⇒ `conductivity ≈ 3.5 S·cm⁻¹ (1100 K)`. S8 shows both samples side by side, so **the gap IS the on-screen contrast** — its strings teach by contrast and never quote a ratio or a solid-side digit.

---

## 6 · Rule-32 legibility plan

- **32a cause-first:** S2 the electron visibly leaves BEFORE either radius changes (radius ramp starts ~400 ms into the transfer); S3 the pull begins, THEN the stop; S4 the third ion arrives before the caption changes; S6 the layer slides → ~700 ms hold at full offset → the halves separate (derived); S7 the temperature HUD climbs and jiggle grows BEFORE the first ion leaves its site; S8 the field arrows appear, a beat, then the melt drifts; S9 the shared thermometer climbs before NaCl fails.
- **32b one variable moves:** each guided state's only changing quantity is its taught one (S5's spin is the D-4 countability convention; jiggle is ambient texture at authored amplitude). Explore exempt.
- **32c:** the delta-cue column IS each state's on-canvas caption opener; prose lives in the subtitle strip (Rule 34a).
- **32d home pose:** one apparatus throughout — S1's two atoms become S2's ions become S3's pair become S4's seed; S5 opens on S4's grown block (the `BS_COORD_RADIUS_SCALE` opening-up IS S5's beat); S6/S7 reopen on the packed block; S8/S9 are the declared two-sample frames (the one deliberate re-framing, fit-solved, never authored).
- **32e:** exactly one glow focal per state; the glow enum is the closed 11-key set (10 mesh keys + `trend`).

---

## 7 · Per-state `bonding_scene` authoring detail

Per-state discipline: **never author `camera`/`camera_position`.** `eye_capture_ms` is **STATE-level**. Top-row annotations at x ∈ {160, 380, 500} only. All cue scalars name the **DESTINATION** (authoring the entry value produces a static state). Numbers live in the HUD; annotations carry the delta in words, each gated `at_ms`/`until_ms` and true for its whole visible window across the full range of every exposed control (lesson 5). Plain literal English (Rule 41). **No authored string anywhere in this concept types a separation digit** — the `separation_pm` HUD (D1·S-4) is the instrument.

### 7.0 Concept-level `config` — authored IN FULL (readers quoted per the architect override-path directive)

```
config:
  render_annotations: true            # mandatory — silent-no-op trap
  field_lines: { opacity: {} }        # mandatory — blank-scene trap
  explorer_id: "ionic_bonding_explorer"   # Rule 27 stable ID; engine default is "bonding_explorer" (:53423) — author explicitly
  slider_controls:
    temperature: { min: 300, max: 3400, step: 25 }
```

- **`slider_controls` is read ONCE at concept level** (`lim`/`defc` readers `:53374–:53375`; panel built `:53404–:53418`). One range serves all ten states.
- **`temperature` MUST be overridden:** engine default is 100–600 K step 5 (`defc("temperature", 298, 100, 600)` in the panel build). That cannot serve S7's 1200 K destination, S9's 1500 K, or S10's duty to melt MgO (3125 K) and CaO (2886 K) — hence `{min: 300, max: 3400, step: 25}` (decided; E3b S-7 makes a scripted `T_K` destination outside this range a HARD gate error, never a silent clamp).
- **`spin`** default 0.16 rad/s, range 0–0.6, step 0.02 — serves S5's slow countable spin and S10; NO override.
- **`shift`** default 0, range 0–1, step 0.02 (1.0 = one full site) — serves S6's `offset_sites: 1` and S10; NO override.
- **`field`** default 0, range 0–1, step 0.02 — serves S8's destination `field: 1` and S10; NO override.
- **`separation`** slider: exposed by NO state of this concept (S3 is a scripted watch-this beat) — no override, no row.
- **`explore_species` / `explore_units`: deliberately NOT authored.** They feed the Molecule picker (`:53377`) and Species picker (`:53397`) — rows no state of this concept exposes (they stay `display:none`). S10's picker is `ion_pair`, whose five options are engine-hardcoded from `BS_ION_PAIRS` in the panel build. Authoring empty arrays would silently fall back to the molecule defaults anyway — absence is the honest spelling.

### S1 — "One spare, one gap" · core · `shell-reveal` · **E3b-BLOCKED (Dispatch 1)**
- `placement:'free'`, `mode:'assemble'`. Units `{id:'na', species:'Na', at:[-4.5,0,0]}`, `{id:'cl', species:'Cl', at:[4.5,0,0]}`. `electrons:{show:'shells'}`. `thermal:{T_K:298, jiggle_scale:0.5}` (real motion post-D1·S-2). `spin_start_ms:1500, spin_rate:0.15` (D-4 countability + declared motion).
- ⚠ **SPACING IS LOAD-BEARING — dispatching-session amendment (2026-08-03), from the E3b dispatch-1 surgeon's own fixture.** A shell ring is drawn at `siteRU + 0.42` around its site, so the rings must clear the NEIGHBOUR's disc. At the cycle-1 spacing (±3, i.e. 6 units apart) one of Cl's seven dots fell inside Na's sphere: Na's radius is 186 pm ⁄ 48 = 3.875 u, Cl's ring reaches 99 ⁄ 48 + 0.42 = 2.48 u, and 3.875 + 2.48 = 6.36 > 6. **Authored at ±4.5 (9 units apart)** — 2.6 u of clearance, and Na's own ring (4.295 u) still clears Cl's disc (2.06 u) by 2.6 u. This is a spacing rule, not an engine defect; json-author must re-check it if any radius or `at` changes.
- **Expected on-canvas result (post-D1·S-3, stated so the frame can be judged):** **1 shell dot on Na's ring, 7 on Cl's** — per-site counts from `BS_VALENCE[bscParentEl(siteSp[i])]` minus formal charge (neutral atoms here, so 1 and 7), each ring scaled to its own site radius, drawn camera-plane countable across the full spin window (D-4). *Today this state is DEAD (P-3): one dot from the `"HCl"` fallback and a HUD reading `outer electrons = 1`.*
- HUD `['valence']` — site-aware (D1·S-3), printing BOTH counts. Proposed exact string (E3b deliverable; surgeon implements verbatim or flags): `outer e⁻: Na 1 · Cl 7`.
- **Formula surface `Na 2,8,1 · Cl 2,8,7`** (shell-count notation, core ring). *Cycle-2 change (F-7): subshell notation `3s¹/3p⁵` assumed an untaught prerequisite (`bohr_model_energy_levels` does not teach subshells) and broke the 38c/38d ladder for IGCSE/AP-entry readers; shell counts also MATCH the dot picture (1 and 7) where `3s¹`/`3p⁵` does not. No state of this concept needs subshell notation — it is dropped, not moved.*
- Annotations: 3000 (x 160) "One spare outer electron"; 9000 (x 500) "One space for one more". `until_ms` = state end.
- Narration (≈40 w): the dots are the outer electrons. Sodium's outer shell holds one electron more than a full shell; chlorine's holds one fewer. Count the dots as the atoms turn: one spare, one gap. This mismatch is why sodium and chlorine react.
- `eye_capture_ms: 10000`. Duration 21.

### S2 — "Electron moves, sizes change" · core · `transfer-and-resize` · LIVE (jiggle texture pending D1·S-2)
- `mode:'transfer'`. Same units (±4.5, per S1's spacing rule). `transfer:{at_ms:5000, duration_ms:8000, from:'na', to:'cl'}` — stretched to run under its sentence. `electrons:{show:'shells'}`. Radii ramp on the **linear-pm** `BS_RADIUS_PM` scale: Na 186 → 102, Cl 99 → 181 (`bscTransferProg`/`bscTransferSite`, `:52840/:52851` — charge ramps WITH radius, Σq = 0 at every instant).
- HUD `['radius_pm']` (live ramped radius of the participants); the four numbers are engine-printed, **never typed into an annotation**.
- **Formula surface `Na(g) + Cl(g) → Na⁺(g) + Cl⁻(g)`** — the transfer depicted IS the Born–Haber gas-phase step; the state symbols make the surface say what the choreography shows (chemistry_author should-fix, adopted).
- Annotations (post-settle, 14000): x 160 "Smaller: it lost a shell"; x 500 "Larger: one extra electron". Narration labels both starting radii "atomic radius" and states the basis ONCE (metallic for Na, covalent for Cl) so 186-vs-99 is honest (chemistry_author-confirmed practice).
- Narration (≈45 w): chlorine pulls electrons far harder than sodium holds them, so the spare electron moves across — watch it. Sodium loses its whole outer shell and gets smaller; chlorine gains one electron and gets larger. Two charged ions now, and the readout shows both new sizes.
- `eye_capture_ms: 15000`. Duration 24.

### S3 — "Pull in, then stop" · core · `pull-to-balance` · **E3b-BLOCKED (Dispatch 1)**
- `mode:'approach_link'`, `links:{enabled:false}`. `approach_at_ms:4000`, duration ~7000, **destination separation authored explicitly as a_pm/2 of `BS_ION_PAIRS.NaCl` = 282.0 pm** (5.875 scene units at 48 pm/unit). Motion = the leading site pair on the closed-form `mgRamp` position chain (D1·S-1); the opening-extent fit must include ion sites (D1·S-1 second-order item) so the approach opens in frame.
- **Instrument (F-4 closed): HUD `['separation_pm','radius_pm']`** — `separation_pm` (D1·S-4) prints the live centre-to-centre distance, `d = 282 pm` at settle, ramping through the approach. The taught quantity now has a live readout (Rule 33d). **No authored string in this concept types a separation digit — including the delta cue** ("Pull in, then stop").
- ⚠ **The 282-vs-283 note (kept for json-author):** the Shannon radii on screen sum to 102 + 181 = **283 pm**; the authored destination is 282.0 by the a/2 convention (564.0/2). With `separation_pm` live the tension is invisible in text — the HUD prints the engine's own settle value and nothing else asserts one.
- **Convention placement (F-9 closed by deletion):** the a/2 convention is NOT named on canvas — an annotation saying "half the cell edge" would use a term S4 has not yet taught (Rule 25). It lives in the narration (spoken, forward-referencing) and closes visually at S4, where the `lattice_a` HUD shows `a = 564 pm` beside the lattice. The previous "named on canvas" claim is withdrawn.
- No formula surface. Annotation 11500 (x 380) "Full shells cannot overlap — they stop here".
- Narration (≈42 w): opposite charges pull the ions together. The closer they get, the harder their full inner shells push back. Pull in, push out, balance: the ions settle at a fixed spacing. The distance readout shows it live — half of the crystal's measured cell edge.
- `eye_capture_ms: 12500`. Duration 22.

### S4 — "More ions keep joining" · core · `lattice-grow` · LIVE (growth via `bscGrowShown`; jiggle texture pending D1·S-2) · **PRIMARY AHA + misconception pivot**
- `mode:'lattice_grow'` (E3a), `placement:'lattice'`. `lattice:{cell:'rock_salt', n:[5,5,5], a_pm:564.0, grow_at_ms:5000, grow_duration_ms:9000, grow_from: the S3 pair}` — 125 sites = `BS_MAX_SITES`; D-6 caps site labels at 8 automatically.
- HUD `['lattice_a']`. Formula surface `NaCl(s) — Na⁺ : Cl⁻ = 1 : 1`.
- **16a contrast beat (no predict→reveal):** OPENS on the lone pair — the picture the wrong belief expects — holds ~4 s while the narration names the expectation's consequence, then the growth shows the real physics: the third ion is pulled in as strongly as the second; there is no stopping point.
- `misconception_watch`: belief "NaCl is a molecule — one Na stuck to one Cl"; visual_counter "the pair does not stay a pair; ions keep joining until the lattice runs past the frame"; one_line_fix "NaCl is a 1:1 ratio of ions in an endless lattice, not a molecule."
- Annotations: 15000 (x 380) "The pattern repeats in every direction"; 17000 (x 160) "This block is a tiny corner of one grain" — any 10¹⁸-class number is chemistry-author-ratified with its grain-size convention named.
- Narration (≈48 w): here is the pair most people picture as "a molecule of salt." But a Cl⁻ pulls every Na⁺ near it, not just one — watch. Ions keep joining, in a strict alternating pattern, and nothing stops the growth. Salt is not molecules. It is one endless repeating lattice.
- `eye_capture_ms: 17600`. Duration 25.

### S5 — "Six neighbours, every ion" · core · `neighbour-cutaway` · LIVE (motion; `coordination = 6 : 6` HUD format is D1·S-5)
- `mode:'coordination'` (E3a). Packed home pose (32d). `lattice:{cell:'rock_salt', n:[3,3,3], a_pm:564.0, reveal:'peer_fade', reveal_at_ms:3500, focal_site: interior, label_sites: focal + 6 neighbours}`. The engine's ball-and-stick opening (`BS_COORD_RADIUS_SCALE` 0.35, peers to 0.12, six opaque rods) IS the beat. `{id:'spin', min_ring:'core'}`; slow authored spin keeps all six rods separable (D-4 across the full spin window).
- HUD `['coordination']` (prints `coordination = 6 : 6`, both counts independently derived over a complete-shell block — D1·S-5). No formula surface. Annotation 8000 (x 380) "Count the six rods" — true at every spin phase by the D-4 gate.
- Narration (≈40 w): fade the other ions and keep one inside ion solid. Six rods, six neighbours of the opposite charge — above, below, left, right, front, back. Pick any ion in the whole crystal and the count is the same: six and six.
- `eye_capture_ms: 9000`. Duration 21.

### S6 — "One shift, it splits" · core · `layer-shift-snap` ⇄ · **E3b-BLOCKED (Dispatches 1 + 3)**
- `mode:'layer_shift'`. Packed home pose. `shift:{at_ms:6000, duration_ms:3000, offset_sites:1, plane: horizontal mid-plane}`. Choreography: upper half slides one full site (cause), holds ~700 ms with the interface's like-charge pairs as glow focal (`layer`), then the derived split — halves separate on a closed-form ramp (10000 → 15000; D-2 outcome falls out of the charges; D-1 no accumulator).
- HUD `['like_contacts']` (E3b; derived 0 → 6 — no annotation types the digit). No formula surface.
- `{id:'shift', min_ring:'core'}` — scripted beat sharing a quantity with a live slider ⇒ **drag-seize required**.
- Annotations: 9200 (x 380) "A one-site slide lines up like charges" (mechanism wording — true wherever the teacher drags); 15500 (x 380) "Like charges push the halves apart".
- **Declared contrast pair** with `metallic_bonding` S5 (0 → 6 vs 0 → 0).
- Narration (≈45 w): this is why a salt grain splits into flat faces instead of denting. Slide the top half of the crystal by one position. Every plus now sits over a plus, every minus over a minus. The counter shows the new like-charge contacts — and the crystal splits along that plane.
- `eye_capture_ms: 16000`. Duration 24.

### S7 — "Heat frees the ions" · core · `melt-the-lattice` · **E3b-BLOCKED (Dispatches 1 + 2)**
- `mode:'melt'`. Packed home pose. Scripted heat on the EXISTING E2b cue: `thermal:{T_from:300, T_at_ms:4000, T_ramp_ms:10000, T_K:1200, jiggle_scale:1}` (T_K is the DESTINATION, inside the concept slider range 300–3400 of §7.0; jiggle grows as √T; the melt outcome is **derived** by `f_melt = clamp((T_K − mp_K)/25, 0, 1)` — §5.3 — with the knee at 1099 K, so the 1200 K destination clears it by 101 K and the beat completes on screen; never authored).
- HUD `['melting_point','lattice_enthalpy']` (engine prints 1074 K · 788 kJ·mol⁻¹ from the ratified table). Formula surface `NaCl(s) → NaCl(l)`.
- `{id:'temperature', min_ring:'core'}` — **drag-seize required**.
- Annotations: 13000 (x 380) "Ions become free at the melting point" (conditional wording — true at any slider position); 15500 (x 160) "Every bond in the block must fail, not one".
- Narration (≈45 w): heat the crystal and every ion shakes harder, but each is still held by six neighbours — and those by six more. Nothing moves until the whole network fails at once. That is why the melting point is so high: the HUD shows the temperature and the energy it takes.
- `eye_capture_ms: 16000`. Duration 24.

### S8 — "Free ions carry charge" · core · `field-on-both` · **E3b-BLOCKED (Dispatches 1 + 2 + 4)**
- `mode:'drift'`. `groups`: `g_solid {label:'solid', at:[-4.5,0,0], lattice: rock_salt [3,3,3] a 564.0, thermal:{T_K:300, jiggle_scale:0.6}}` · `g_melt {label:'molten', at:[4.5,0,0], same lattice spec, thermal:{T_K:1150, jiggle_scale:1}}` — **1150, not 1100: the melt-law knee is `mp_K + 25` = 1099 K (§5.3); 1150 opens at `f_melt = 1` with 51 K margin.** `g_melt` opens already molten (§5.1; closed-form, no latch). **Scene-level** `ions:{mobile:true, field: 1, field_at_ms:6000}` inherited by BOTH groups (D4·Q-2 — destination-valued, frozen-pin registered).
- Choreography: field arrows fade in at 6000 (cause), beat, the melt's ions begin a slow biased drift ~6800; the solid's jiggle in place (D1·S-2 — load-bearing) and never translate (the gate-13 negative control IS the 16a contrast beat).
- `misconception_watch` (pivot #2): belief "solid salt conducts — it is full of charges"; visual_counter "the same field on both samples: the solid's ions are held at their sites and do not move; only the melt's free ions drift"; one_line_fix "charge must be free to MOVE to carry current — molten or dissolved, not solid."
- **HUD `['conductivity']` (decided, D4·Q-3):** state-dependent, engine-printed — `g_solid` ⇒ `conductivity: none — ions fixed`; `g_melt` ⇒ `conductivity ≈ 3.5 S·cm⁻¹ (1100 K)`. The side-by-side gap IS the contrast. **Never a ratio, never a solid-side digit, in any string of this state.**
- `{id:'field', min_ring:'core'}` (drag-seize). No formula surface. Annotations: 8000 over g_solid (x 160) "Held in place — no current"; 10500 over g_melt (x 500) "Free ions drift — current flows".
- Narration (≈50 w): both samples are pure salt, and the same push acts on both. In the solid, every ion is held at its site — it is pulled slightly, and stays in place. In the molten sample the ions are free, and they drift: plus one way, minus the other. Moving charge is a current.
- `eye_capture_ms: 13000`. Duration 26.

### S9 — "Double charge, far stronger" · **advanced** · `melt-race` · **E3b-BLOCKED (Dispatch 2)**
- `mode:'melt'` with `groups`: `g_nacl {label:'NaCl', at:[-4.5,0,0], lattice: rock_salt [3,3,3] a 564.0}` · `g_mgo {label:'MgO', at:[4.5,0,0], lattice: rock_salt [3,3,3] a 421.2}` (Mg²⁺ 72 pm · O²⁻ 140 pm — smaller AND doubly charged). **Scene-level** `thermal:{T_from:300, T_at_ms:4000, T_ramp_ms:10000, T_K:1500}` — one temperature, no per-group override. NaCl fails mid-ramp (derived, 1074 K); MgO holds at 1500 K, jiggling (derived, 3125 K).
- HUD: per-group `['melting_point','lattice_enthalpy']`, engine-printed with the decided group-prefix format (D2·T-3): `NaCl m.p. = 1074 K` · `NaCl ΔH = 788 kJ·mol⁻¹` · `MgO m.p. = 3125 K` · `MgO ΔH = 3791 kJ·mol⁻¹` — **four lines in the fixed 220 px HUD beside two group labels: a MEASURE-at-1024 duty (E3b T-3 first, json-author re-verifies on the built state), never a reasoned assumption.** Formula surface (advanced, algebra-only, 38c) `E ∝ q₁q₂ ⁄ r` — never Born–Landé.
- Annotations: 12000 over g_nacl (x 160) "Single charges — already molten"; 14000 over g_mgo (x 500) "Double charges, closer — still solid".
- Narration (≈46 w): same heater, two crystals. Salt's ions carry single charges; magnesium oxide's carry double charges, and they sit closer together. Double charge on both ions, at a smaller spacing, gives a far stronger attraction. Salt melts on the way up; magnesium oxide stays solid far past that point.
- `eye_capture_ms: 15000`. Duration 24. No controls (watch-this beat).

### S10 — "Explore the lattice" · core · `interaction_complete` · **E3b-BLOCKED (Dispatches 1 + 2 + 3 + 4)**
- `mode:'explore'`, `fit: true`. **`placement:'lattice'` + `lattice:{cell:'rock_salt', n:[3,3,3], a_pm:564.0}` — MANDATORY:** `bscSiteList` (`:52794`) requires `placement === 'lattice' && lat` or the state falls through to free placement and renders NO lattice. The `ion_pair` picker's `pairOverride` then substitutes species and `a_pm` per pair (`:52794–:52801`), so the authored NaCl values are the opening pose, not a lock. Rock-salt only — one cell covers all five `BS_ION_PAIRS`.
- Controls (ALL core): `ion_pair, spin, temperature, shift, field`. Temperature range 300–3400 K step 25 comes from the concept-level `config.slider_controls` (§7.0) — MgO (3125 K) and CaO (2886 K) are meltable in the sandbox by construction; a scripted destination outside the range is a hard gate error (E3b S-7).
- Explore idle motion: authored `jiggle_scale` is REAL post-D1·S-2, and the idle-spin fallback stands down only on a live motion signal (D1·S-6) — no byte-frozen sandbox.
- HUD `['lattice_a','melting_point','lattice_enthalpy']`. No formula surface (core-only sandbox, 38b). Narration 0/open. Rule 37 player invariant keeps it running.
- **Lesson-6 duty (Rule 38b breach if skipped): every picker species hand-driven before ship.** Drive all five pairs through the full slider ranges and record readings: LiF's small cell (a 402.6) under the fit-solve; MgO/CaO double charges through shift (`like_contacts` must still derive correctly — and per §5.2, if the derived count differs from the design expectation, STOP and report, never tune) and temperature (both must actually melt below 3400 K); field on each pair below/above its melting point.

---

## 8 · Misconception confrontation plan (Rule 16a)

Exactly **two** `misconception_watch` entries — genuine pivots only.

| Wrong belief | Confronted at | How (contrast beat, no predict→reveal) |
|---|---|---|
| "NaCl is a molecule — one Na stuck to one Cl" | **S4** (the fixed Phase-0 pivot) | Opens on the pair the belief expects, names the expectation's consequence, then the lattice grows past the frame |
| "Solid salt conducts — it is full of charges" | **S8** | The same field on both samples: solid ions hold their sites (the row-Q negative control as pedagogy), molten ions drift |

**Planting-risk management (no pre-spoil):** S2–S3 necessarily show an isolated pair — the exact picture that plants the molecule belief. S3 does NOT foreshadow the correction; instead S3's strings never use "molecule" or "unit of salt" for the pair, and S4 follows immediately to kill the belief at full strength. No EPIC-C branches (EPIC-L-first).

---

## 9 · Deep-dive states + drill-down clusters

| State | Why invest | Clusters |
|---|---|---|
| **S2** | Ion-vs-atom size is a perennial exam trap (students expect the cation to grow) | `why_cation_shrinks` · `why_anion_grows` · `isoelectronic_size_compare` |
| **S4** | The PRIMARY aha; "formula unit" confuses every board's students | `formula_unit_vs_molecule` · `lattice_repeat_pattern` · `why_one_to_one_ratio` |
| **S6** | Brittleness is the most-asked "why" property; feeds the metallic contrast | `cleavage_flat_faces` · `brittle_vs_malleable` · `like_charge_repulsion_scale` |

---

## 10 · `entry_state_map`

```
foundational:        STATE_1 → STATE_4   # "what is ionic bonding / how does NaCl form"
lattice_structure:   STATE_4 → STATE_6   # "why is salt a crystal / why does it shatter"
physical_properties: STATE_7 → STATE_9   # "why high melting point / why does molten salt conduct"
```
Default `foundational`. **Foundational-coverage rule satisfied** — the PRIMARY aha (S4) closes the foundational slice.

---

## 11 · Prerequisites (advisory, Rule 23)

- `bohr_model_energy_levels` (shipped, master) — shells; S1's dots assume the student can read a shell diagram.
- `bond_polarity_dipole_moment` (Desk-1 sibling — **unmerged; see the input-gap note**) — "one atom pulls electrons harder". S2's cliff patch covers a student without it.
- Coulomb attraction (physics; no chemistry concept) — S3 patches inline in one plain sentence.

---

## 12 · Real-world anchor (Rule 35 / 38f)

**Primary: table salt (fixed by Phase-0)** — specifically *why a grain splits into flat, shiny faces instead of denting when crushed*. Universal; physics-true (cleavage IS S6's derived beat); converts an invisible claim into something a student can do at dinner. **Secondary (advanced, S9): the magnesium-oxide furnace lining** — a widest-syllabus-overlap industrial device; MgO lines furnaces precisely because its lattice holds to 3125 K.

**Rejected candidates (recorded):** road de-icing salt (climate-specific — fails Rule 35); rock candy / sugar crystals (sugar is molecular — physics-false for ionic bonding); solar salt-evaporation ponds (weak motion link, region-flavoured); electrolysis of brine (apparatus-led; S8 teaches conduction without wet-lab apparatus).

---

## 13 · Two-pass cognitive lens

### Block 1 — strategic

**Prerequisite cliffs.** (1) Shell model → breaks at **S1**; patch: S1's first sentence says "the dots are the outer electrons" literally. (2) **Subshell notation → broke at S1's formula surface (cycle-2 addition, F-7):** the named prerequisite `bohr_model_energy_levels` does not teach `3s¹`-style notation, so the cycle-1 surface `Na 3s¹ · Cl 3s²3p⁵` was an unpatched cliff; patched by SWAPPING the surface to shell-count notation `Na 2,8,1 · Cl 2,8,7`, which every entry syllabus reads and which matches the dot picture (1 and 7). Subshell notation is dropped from this concept entirely — no state needs it. (3) Electronegativity → breaks at **S2**; patch: "chlorine pulls electrons far harder than sodium holds them" — no Δχ symbol at core ring. (4) Coulomb attraction → breaks at **S3**; patch: "opposite charges pull the ions together" as the first clause, then the state teaches the non-obvious half (why they STOP).

**Exam-backwards trace.** *"MgO and NaCl both form rock-salt lattices. Explain why MgO's melting point (~3125 K) is far higher than NaCl's (~1074 K), why both conduct only when molten, and why both are brittle."* Pieces → states: rock-salt structure + 6:6 → S4/S5; melting = whole-lattice failure + lattice enthalpy → S7; conduction requires mobile ions → S8; brittleness = like-charge alignment on slip → S6; charge/size dependence E ∝ q₁q₂/r → S3 (r set by shells) + S9; formation half → S1–S2. **No missing piece; no state fails to serve the trace.**

**Misconception entry mapping.** Belief 1 planted by every textbook's dot-and-cross diagram AND potentially by our own S2–S3 pair picture — managed per §8; confronted proactively at S4. Belief 2 planted by "ionic compounds are made of charges"; confronted at S8 via the negative-control contrast.

### Block 2 — aha designation

- **PRIMARY aha (S4):** *"There is no molecule of salt — the pair does not stay a pair, and the crystal is one endless repeating lattice."*
- **SUPPORTING aha (S6):** *"Slide the layers one position and the crystal's own charges push it apart"* — reinforces the primary (only a LATTICE can split this way) and is the declared setup for `metallic_bonding`'s contrast aha.
- **Cohesion:** S6 depends entirely on S4's lattice; no candidate aha stands alone. S9's MgO race is deliberately NOT an aha — it is a consequence of S3+S4's physics and lives in the advanced ring. 1 primary + 1 supporting.
- **Wrong-belief setup:** for S4 — S2/S3 build the confident "one Na⁺ + one Cl⁻, done" two-body story settling at a fixed spacing. For S6 — S5 builds "every ion is held by six neighbours, so this must be extremely strong"; the aha is that this same strength geometry is what makes one small slide split it.
- **Foundational coverage:** S4 ∈ foundational ✓.

**Cross-references:** deep-dive picks (S2/S4/S6) vs cliff states (S1/S2/S3) overlap at S2 and diverge at S1/S3 — documented reason: the S1/S3 cliffs are fully patched by one inline sentence each (cheap), while S4/S6 are where exam questions and documented confusions concentrate (expensive, worth pre-authoring).

---

## 14 · Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the ten of §2, ids `STATE_1`–`STATE_10`, contiguous.

**(b) Symbol-label table (all real Unicode — Rule 34c across DOM + canvas text + sprite labels). Every string is EXACT; rows the engine cannot print today are marked with the E3b dispatch item that delivers them:**

| Spoken quantity | On-canvas string (exact) | Status |
|---|---|---|
| sodium atom / ion | `Na` / `Na⁺` | live sprite labels |
| chlorine atom / ion | `Cl` / `Cl⁻` | live |
| magnesium ion / oxide ion | `Mg²⁺` / `O²⁻` | live |
| the transferred electron | `e⁻` | live |
| electron shells (S1 formula surface) | `Na 2,8,1 · Cl 2,8,7` | authored (shell-count notation — F-7) |
| outer-electron count (HUD `valence`, S1) | `outer e⁻: Na 1 · Cl 7` | **E3b D1·S-3** (string proposed here for the surgeon; today the engine prints `outer electrons = 1` — dead) |
| radius (HUD) | `r = 102 pm` | live |
| ion separation (HUD, S3) | `d = 282 pm` | **E3b D1·S-4** (decided format) |
| cell edge (HUD) | `a = 564 pm` | live |
| coordination (HUD, S5) | `coordination = 6 : 6` | **E3b D1·S-5** (decided; BOTH counts independently derived) |
| like-charge contacts (HUD, S6) | `like contacts: 6` | **E3b D3·L-2** (digit is the derived count, never authored) |
| temperature (slider readout — not a HUD line) | `Temperature: 1200 K` | live (panel label format) |
| melting point (HUD) | `m.p. = 1074 K` | **E3b D2·T-3** (decided) |
| lattice enthalpy (HUD) | `ΔH = 788 kJ·mol⁻¹` | **E3b D2·T-3** (decided) |
| per-group prefix (S9) | `NaCl m.p. = 1074 K` / `MgO ΔH = 3791 kJ·mol⁻¹` | **E3b D2·T-3** (decided; group order = authored array order) |
| conductivity (HUD, S8) | `conductivity: none — ions fixed` / `conductivity ≈ 3.5 S·cm⁻¹ (1100 K)` | **E3b D4·Q-3** (decided; no ratio, no solid digit) |
| strength relation (S9 formula surface) | `E ∝ q₁q₂ ⁄ r` | authored (advanced ring) |
| reaction ledger | `Na(g) + Cl(g) → Na⁺(g) + Cl⁻(g)` · `NaCl(s) — Na⁺ : Cl⁻ = 1 : 1` · `NaCl(s) → NaCl(l)` | authored |

**(c) Balanced-equation ledger plan (chemistry variant of the direction-rule row; RHR N/A):** S2 shows the transfer equation **with state symbols** — `Na(g) + Cl(g) → Na⁺(g) + Cl⁻(g)`: the depicted transfer IS the Born–Haber gas-phase step, and the state symbols make the surface say so (chemistry_author should-fix, adopted at cycle 2); S4 shows `NaCl(s) — Na⁺ : Cl⁻ = 1 : 1`; S7 shows `NaCl(s) → NaCl(l)`. Oxidation-number labels not used (charges carry the same information; redox framing belongs to a later concept). Particle-count scale factor: S4's "tiny corner of one grain"; any 10¹⁸-class number is chemistry-author-ratified with its grain-size convention named (chemistry_author: keep this annotation wordy-not-numeric).

**(d) Motion plan:** per §7. No passive state.

**(e) Modes:** `assemble` (S1) · `transfer` (S2) · `approach_link` (S3) · `lattice_grow` (S4) · `coordination` (S5) · `layer_shift` (S6) · `melt` (S7, S9) · `drift` (S8) · `explore` (S10). Four of nine are E3b deliverables (§4).

**(f) assessment + coverage_map + misconception_watch:** watch at S4 + S8 only. Assessment stems (chemistry_author authors; coverage_map maps each to states): 1. why Na⁺ is smaller than Na (S2); 2. why "NaCl" does not name a molecule (S4); 3. predict the coordination number of an interior ion (S5); 4. explain brittleness via the layer shift (S6); 5. why molten NaCl conducts and solid does not (S8); 6. (advanced) rank NaCl/KCl/MgO by melting point with E ∝ q₁q₂/r (S3/S9).

**(g) Macro↔micro plan (Rule 33):** the taught variables of S6–S9 are macroscopic properties whose mechanism is the ion lattice itself — the crystal on screen IS the macro object and its interior IS the micro story, so no split-canvas band is needed; the zoom-link is S4's "tiny corner of one grain" annotation. Each state's interior tells its OWN story with a real engine-printed number (S5 6:6; S6 like_contacts 0→6; S7 T + m.p.; S8 drift vs hold; S9 two lattices, two fates). The fixed 220 px HUD is the numeric instrument on every state.

**(h) Canvas budget (Rule 34):** ONE formula surface per state (five states carry none), caption = the ≤5-word delta cue only, prose in the subtitle strip, value-only HUD, all math Unicode, annotations at x ∈ {160, 380, 500} clamped clear of the 220 px HUD, top-anchored panels at `top: 52 px`+.

**(i) Curriculum-flex (Rule 38):**
- **(i-1) Ring-cut walk.** Cut A (hide advanced = hide S9): S1–S8 + S10 is coherent — no surviving string references MgO, the q₁q₂/r formula, or "double charge"; S10's picker offering MgO/CaO is manipulation of core content, not a reference to S9's teaching, and S10's narration is empty. Cut B (advanced + extended): **identical to Cut A** — no extended ring exists. Both cuts verified against every delta cue, caption, formula surface and narration intent in §7. Enforcing rule: no S1–S8/S10 string may mention MgO's numbers or the strength comparison.
- **(i-2)** Explore surfaces CORE only: all controls core, no formula surface, every symbol shown (a, m.p., ΔH) established in core states. ✓
- **(i-3) `curriculum_tags` (CLAIMS, 38g):** CBSE/NCERT Cl.11 Ch.4 §4.2 `full, verified: true`; JEE/NEET `full`, IGCSE `full` (chapter opener), IB DP `full`, A-level `full`, AP `partial` — every one `needs_teacher_verification: true`. Enlarges the standing international-verification gap; recorded, not closed.
- **(i-4) Presets (hide, never reorder — 38h/25d):** `full` = S1–S10; `core` = S1–S8 + S10. No teacher-visible preset until 38g verification.
- **(i-5) Graph axes (38e):** no graph in this concept (the row-O trend surface is consumed by no ionic state). N/A, stated deliberately.

---

## 15 · Scar-compliance + engine-bug-queue note

- **`query_engine_bug_queue.ts` RUN at cycle 2 (2026-08-03)** — `--owner alex:architect` + `--row-type directive`, executed via the main checkout's `.env.local` (this worktree carries none — quality_auditor note). The script's **chemistry false-all-clear** caveat still applies to the concept-scoped query only; owner/directive queries are concept-independent and were read in full. Rows applied: `teach_do_not_prespoil_a_later_reveal` (✓ §8 planting-risk plan; S3 never foreshadows S4); `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` (✓ §4 names the READER function + line for every buildability claim; §7.0 quotes the slider readers `:53374–:53375/:53404–:53418`); `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` (✓ the anchor is a STATE assignment — S6's narration opens on the salt grain inside its 45-word budget; the S9 secondary rides S9's budget); `paired_skeletons_cite_each_other_by_state_number_across_a_renumbering` (✓ the metallic contrast pair is cited by CONTENT — archetype `layer-shift-hold` — with the state number quoted only against the Phase-0 §0b revision it belongs to). The cycle-1 scar `skeleton_certifies_a_state_buildable_from_a_mode_string_without_a_frame_probe` is closed structurally by §4's function-level map.
- FIELD3D checklist + renderer-source scars, all applied above: `render_annotations:true`, `config.field_lines.opacity:{}`, state-level `eye_capture_ms` on every annotation-payoff state, drag-seize on S6 `shift` / S7 `temperature` / S8 `field` (+ `separation`, `ion_pair` per E3b standing rule 5), `top:52px` clearance, no frozen tail, explore idle auto-sweep with the D1·S-6 corrected guard, `pmCreateAutoLabel` only, no backticks, D-4 countability across the S5 spin window with the focal ion IN the counted set, D-6 label caps, closed enums only (no `show_count`; every cue key this concept needs and the engine lacks is a NAMED E3b deliverable — `field_at_ms` D4·Q-2, the property columns D2·T-1, `separation_pm` D1·S-4).
- **Desk-1 lessons 1–8 applied:** engine-printed numbers only (the 282/283 tension is retired — `separation_pm` is the instrument and NO authored string types a separation digit; `like_contacts` digit never typed; per-pair table engine-printed with the ratify flag), player-model durations, `duration = ceil(timeline)`, motion-continuity ≤25% static, control-range-true annotations (mechanism wording at S6/S7), explore species hand-drive duty with the 3400 K ceiling authored in `config` (§7.0), evidence-before-statement cue ordering, HUD-fits = MEASURE at 1024 px (S9 four-line duty, §5.1), and `check-layout-overlap` treated as non-evidence.
- **Missing-input disclosure:** see the ⛔ note at the top. **quality_auditor must run the live Gate-8 query.**

**NCERT check line:** Consulted NCERT Chemistry Cl.11 Ch.4 index to confirm scope (§4.2 ionic/electrovalent bond; lattice enthalpy §4.2.1). No teaching method, example problem, or figure imported. Exemplar consulted for misconception beliefs only.

---

## 16 · Self-review (cycle 2)

- [x] Atomic claim one sentence; deferrals named with ledger rows
- [x] 10 states — FIXED arc implemented unmodified; outside-table count justified
- [x] **Ten state titles authored (§2, Rule 41d)** — short, literal, first words carry the meaning
- [x] Per-state control table complete; no archetype repeat except the DECLARED pair
- [x] **No-static-state guarantee rebuilt on the post-E3b engine** (D1·S-2 real site jiggle + S-8 parity gate), not on the pre-E3b `jiggle_scale` no-op
- [x] **§4 buildability = named renderer FUNCTIONS with line numbers + per-state E3b dispatch column** — never a mode string
- [x] **Rule 41 sweep across every reader-facing string** — removed "wants", "the whole story", "refuses" (all five occurrences), "The formula says", "swap" (→ "change": also physically misleading — the atoms do not exchange sizes), "glassy", "swells", "leans", "locked", "gripped", "fatal"
- [x] **No authored string types a separation digit anywhere** — `separation_pm` (D1·S-4) is S3's instrument; delta cue re-authored
- [x] **All decided E3b formats transcribed exactly** (§14b): `d = 282 pm` · `coordination = 6 : 6` · `m.p./ΔH` · group prefixes · both conductivity strings; melt law + knee stated (§5.3) with S8 `g_melt` at **1150 K** and S7/S9 destinations checked against it
- [x] **Concept-level `config` authored in full (§7.0)** — temperature `{300, 3400, 25}`; spin/shift/field defaults verified serving; `explore_species`/`explore_units` deliberately absent with reader-line reasons; `explorer_id` explicit
- [x] **S10 authors `placement:'lattice'` + the `lattice` block** (`bscSiteList` `:52794` falls through to free placement without it)
- [x] **S1 unit spacing widened to ±4.5** — shell rings must clear the neighbour's disc (arithmetic in §7 S1; from the E3b dispatch-1 surgeon's fixture)
- [x] Rule 32 plan · Rule 33 (§14g) · Rule 34 budget (§14h) · Rule 35/38f anchor with rejected candidates
- [x] Rule 38: rings tagged, S9 contiguous advanced before explore, BOTH cuts walked, explore core-only, tags as claims, presets, 38e N/A stated; **S1 formula surface at shell-count notation (38c/38d ladder repaired — F-7)**
- [x] misconception_watch at exactly 2 genuine pivots; no predict→reveal; no `wait_for_answer`
- [x] 3 deep-dive states × 3 clusters · entry_state_map with foundational containing the PRIMARY aha · prerequisites advisory
- [x] Two-pass Block 1 (now four cliffs incl. the subshell-notation cliff) + Block 2 complete
- [x] DoD complete, zero TBDs; chemistry ledger plan with gas-phase state symbols at S2
- [x] Gate 12 ✓ · Rule 19 ≥3 primitives/state achievable everywhere · Registration site #1 only
- [x] Engine bug queue RUN (owner + directive; concept-scoped query remains a known chemistry false-all-clear — **quality_auditor re-runs the live Gate-8 query**)
- [x] Desk-1 artifacts read via `git show origin/feat/chemistry-polarity-hbonding:<path>` — escalation #1 discharged; the one missed correction (jiggle no-op) closed this cycle

**Standing gate (was escalation #2, now dispatched):** E3b is IN FLIGHT on `feat/bonding-scene-e3b`
(`docs/notes/bonding_scene_E3b-dispatch.md` — dispatches 1–4, including `field_at_ms` and the
`BS_ION_PAIRS` property columns). Dispatch 1 (site-layer parity) is COMPLETE and committed.
`chemistry_author` may author S1–S5 now; **S6–S10 JSON authoring waits for dispatches 2–4.**
