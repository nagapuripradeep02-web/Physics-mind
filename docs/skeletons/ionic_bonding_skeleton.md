# ARCHITECT SKELETON — `ionic_bonding` (chemistry, Phase-0 bonding wave, Desk 2 concept 1 of 2)

**Date:** 2026-08-03 · **Renderer:** `field_3d` · `scenario_type: 'bonding_scene'` · **Placement:** `free → lattice`
**Arc source (BINDING):** `docs/CHEMISTRY_PHASE0_BONDING.md` §0b `ionic_bonding` table, Checkpoint A `DESIGN_OK` cycle 2 (2026-08-01). This skeleton implements that arc; it does not redesign it. No arc defect was found.
**Registration:** site #1 ONLY (`src/data/concepts/chemistry/ionic_bonding.json`). Validation: `npm run validate:chemistry`. Sites 2/3/4/7/8 forbidden (Gate 8b all-or-nothing).

> ⛔ **INPUT GAP — DISPATCHING SESSION NOTE (2026-08-03).** The architect could not read the Desk-1
> artifacts: `docs/notes/bonding_scene_contract.md`, `docs/notes/bonding_scene_E2b-engine-fix-spec.md`,
> `docs/skeletons/hydrogen_bonding_skeleton.md` (and its two ⛔ CORRECTED blocks), the chemistry block,
> and both Desk-1 concept JSONs. **Cause confirmed: ALL of Desk 1 is unmerged.** 20 commits / 63 files
> live only on `feat/chemistry-polarity-hbonding`; none is on master, and this desk was cut from master.
> The architect instead verified every engine fact directly against live source
> (`field_3d_renderer.ts` bonding_scene region `:51080–51650`, `deriveStateMeta.ts` `:282/:669/:1992/:3698`,
> `check_bonding_scene.ts`) and recovered history from `PROGRESS_CHEMISTRY.md` + the Phase-0 doc. It
> reports the dispatch's engine-facts list matched source verbatim everywhere checked.
> **Before `chemistry_author` opens: merge Desk 1 to master (or cherry-pick its docs) and diff this
> skeleton against the sibling's ⛔ CORRECTED blocks.**

---

## 1 · Atomic claim + tier justification

**This concept teaches one idea: an ionic compound is not made of molecules — electron transfer makes ions, and ions pack into an endless repeating lattice whose structure explains everything salt does (shatters flat, melts high, conducts only when molten).** It does not cover Born–Haber energy cycles (ledger row 2), dissolution/hydration (ledger row 3), Fajans' polarisation (ledger row 4), or the metallic contrast's own arc (sibling concept `metallic_bonding`, this desk, concept 2).

**Tier: 💎 (fixed at Phase-0 §0a).** Whiteboard test: "there is no NaCl molecule" is a 3D fact about an endless lattice, and the cleavage beat — shift one layer by one site and the crystal splits — is a motion, not a picture. Capability 3 + 4.

**Representation triangle:** the particulate vertex leads every guided state; the symbolic vertex (formula surfaces, the reaction ledger) supports and never leads a core state; the macroscopic vertex enters through the anchor (a salt grain's flat faces) at S6–S8.

---

## 2 · State count + arc — 10 states (FIXED by Phase-0 §0b)

10 states sits at the "very complex" edge of the §5 calibration table and is justified: three examinable macroscopic properties (shatter, melt, conduct), each a distinct derived motion, plus a formation half (transfer → lattice) and one advanced comparison. Checkpoint A graded this arc twice.

| # | id | Purpose (one line) | teaching_method |
|---|---|---|---|
| S1 | `STATE_1` | One atom has a spare outer electron, the other a gap | — (straightforward beat) |
| S2 | `STATE_2` | The electron transfers and BOTH atoms change size | — |
| S3 | `STATE_3` | Attraction pulls the ions in; the shells stop them at 282 pm | — |
| S4 | `STATE_4` | **The pair does not stay a pair** — the lattice grows (PRIMARY aha; misconception pivot) | misconception_confrontation (16a contrast beat) |
| S5 | `STATE_5` | Every ion is surrounded by six of the other kind | — |
| S6 | `STATE_6` | One-site layer shift lines up like charges — the crystal splits | — |
| S7 | `STATE_7` | Melting frees the ions; the whole lattice must fail at once | — |
| S8 | `STATE_8` | Same field on solid and melt: only free ions carry charge | — (16a contrast beat #2) |
| S9 | `STATE_9` | **advanced** — double the charge, far stronger lattice (NaCl melts, MgO holds) | compare_contrast |
| S10 | `STATE_10` | Explore sandbox — all core controls | exploration_sliders |

`state_count: 10`. Rings: S1–S8 + S10 `core`, S9 `advanced` (contiguous, immediately before explore — Rule 38a). No extended ring. `advance_mode`: S1–S9 `manual_click`, S10 `interaction_complete` (Gate 12 ≥2 modes ✓).

**Archetype provenance:** all names are the Phase-0 coinages approved at Checkpoint A cycle 2 — members of the particulate-box (M) family of `docs/patterns/chemistry.md` §1, specialised per beat. `layer-shift-snap` is the wave's one DECLARED archetype-repeat contrast pair with `metallic_bonding` S5 `layer-shift-hold` (same motion, same `like_contacts` readout, opposite derived outcome). Declared, never renamed.

---

## 3 · Per-state control table (Rule 31 — the first design artifact)

Word counts are targets inside the 25–55 budget. **Duration is derived from the PLAYER's speech model** (player words = chars/5.5 at 2.16 w/s → ≈ 0.505 s per authored word), then `duration = ceil(player timeline ⁄ 1000)` where timeline = max(speech end, last cue + settle) — Desk-1 lessons 2 + 3. json-author re-derives from the FINAL narration strings; these are design envelopes, not final digits.

| # | Ring | Teaches | Archetype | Delta cue (≤5 words, Rule 41) | Controls `{id, min_ring}` | Words | Est. timeline | Duration (s) | Glow focal |
|---|---|---|---|---|---|---|---|---|---|
| S1 | core | Na has one spare outer electron; Cl has one gap | `shell-reveal` | "One spare, one gap" | — | 38 | ~19.5 s | 20 | `electrons` |
| S2 | core | Transfer; both radii change on the linear-pm scale | `transfer-and-resize` | "Electron moves, sizes swap" | — | 45 | ~23 s | 24 | `electrons` |
| S3 | core | Attraction in, shell repulsion out, balance at 282 pm | `pull-to-balance` | "Attraction stops at 282" | — | 42 | ~21.5 s | 22 | `units` |
| S4 | core | The pair refuses to stay a pair; the lattice grows | `lattice-grow` | "More ions keep joining" | — | 48 | ~24.5 s | 25 | `lattice` |
| S5 | core | 6:6 coordination, read from inside the block | `neighbour-cutaway` | "Six neighbours, every ion" | `{spin, core}` | 40 | ~20.5 s | 21 | `neighbours` |
| S6 | core | One-site shift → like charges meet → split (derived) | `layer-shift-snap` ⇄ | "One shift, it splits" | `{shift, core}` | 45 | ~23 s | 24 | `layer` |
| S7 | core | Heat frees the ions; the whole lattice fails at once | `melt-the-lattice` | "Heat frees the ions" | `{temperature, core}` | 45 | ~23 s | 24 | `lattice` |
| S8 | core | One field, two samples: only the melt conducts | `field-on-both` | "Free ions carry charge" | `{field, core}` | 50 | ~25.5 s | 26 | `units` |
| S9 | **adv** | Charge and size set lattice strength (NaCl vs MgO race) | `melt-race` | "Double charge, far stronger" | — | 45 | ~23 s | 24 | `lattice` |
| S10 | core | Explore | `interaction_complete` | — | `{ion_pair}` `{spin}` `{temperature}` `{shift}` `{field}` all core | 0/open | free-run | 30 | — |

No two guided states share an archetype except the declared cross-concept pair. No static state (S1–S9 all carry authored `thermal.jiggle_scale` > 0 and/or a scripted ramp; **`jiggle_scale` defaults to 0 and MUST be authored**). Motion-continuity budget: no static run > ~25% of any state's timeline; every scripted ramp is stretched to run under the sentence that explains it (lesson 4).

---

## 4 · The engine-block map — which states E3b must unblock

`BS_MODES_DEFERRED = ["layer_shift","electron_sea","drift","melt"]`; `groups`/`sea`/`ions`/`shift` parsed-and-passed-through with no behaviour; `check:bonding-scene` §8/§13/§14 are declared stubs (verified in source 2026-08-03).

| State | Buildable today? | E3b capability needed (exact) |
|---|---|---|
| S1–S5 | **YES** (E1 + E2 + E3a) | — |
| S6 | **NO** | `layer_shift` mode (`shift: {at_ms, duration_ms, offset_sites, plane}`; derived split via D-2) + the **D-7 `like_contacts` metric** + the `like_contacts` HUD line (declared in `BS_HUD_LINES`, unimplemented) + drag-seize on the `shift` row |
| S7 | **NO** | `melt` mode (derived from the per-pair melting point; the E2b `thermal.T_from/T_at_ms/T_ramp_ms` ramp already exists and drives it) + `melting_point`/`lattice_enthalpy` HUD lines + a per-ion-pair property table (§5.3) |
| S8 | **NO** | **row Q** `ions: {mobile, field}` with a field-on cue + the gate-13 negative control (the solid sample must NOT drift) + **row R `groups`** (two co-present samples) + `conductivity` HUD line + drag-seize on `field` |
| S9 | **NO** | **row R `groups`** (two lattices, one scene temperature) + `melt` + per-group melting-point / lattice-enthalpy readouts |
| S10 | **NO** | `layer_shift` + `melt` + row-Q behaviours live inside `explore` (sandbox drags must drive them) + `lattice_enthalpy`/`melting_point` HUD lines; explore idle auto-sweep already exists |

**All ten states are specified in full below** — this skeleton is the input to the E3b surgeon dispatch as well as to `chemistry_author`. HUD lines live today: `delta_chi, mu, radius_pm, valence, links, links_per_unit, bp, coordination, lattice_a`. E3b must implement `like_contacts, melting_point, lattice_enthalpy, conductivity` (+ `drift, atomisation` for metallic). `links.show_count` is parsed-and-never-read — **never author it**.

---

## 5 · Checkpoint-A second pass — rows R and D-7 (the two items Phase-0 §0c deferred to THIS skeleton)

### 5.1 Row R — `groups: [{id, label, at, units?, lattice, thermal, field}]` — what S8 and S9 each require

**S8 is *one field, two samples*.**
- Two groups, each with its OWN `lattice` (same cell, same `a_pm`, same species) and its OWN `thermal` (`g_solid` T_K 300; `g_melt` T_K 1100 — above NaCl's 1074 K).
- **A group must be able to OPEN already-molten**: `g_melt` authors no melt ramp — its `thermal.T_K` sits above the pair's melting point from t=0, and the molten arrangement is a closed-form function of (T_K, site index, state-local t). No latch, no replayed history (D-1); if the melt arrangement needs memory of having melted, use the E2 replay-the-latch pattern over absolutely-anchored sample times.
- **The field is authored ONCE at scene level and inherited by both groups.** Per-group `field` exists as an override, but S8 must NOT use it — inheriting one scene-level field is what makes "SAME field" true by construction rather than by a copy-paste that can drift. The field needs an on-cue (`field_at_ms`, destination-valued like every other cue) so the cause moves first (Rule 32a).
- **Gate 13's negative control is part of the state's spec, not just the gate's:** under the field, `g_solid`'s ions jiggle in place and never translate; `g_melt`'s drift along the field. A silent no-op teaches the opposite of the lesson.
- Group labels ("solid" / "molten", `pmCreateAutoLabel`) placed clear of the fixed 220 px right-anchored HUD.
- Camera: a two-group scene needs the fit-solve to span BOTH bounding boxes. Never author `camera`.

**S9 is *one temperature, two lattices*.**
- Two groups differing ONLY in `lattice` (`g_nacl`: rock_salt a 564.0, Na⁺/Cl⁻; `g_mgo`: rock_salt a 421.2, Mg²⁺/O²⁻).
- **`thermal` authored at SCENE level with NO per-group override** — the shared ramp IS the teaching. Uses the existing E2b cue: `T_from: 300`, `T_at_ms`, `T_ramp_ms`, destination `T_K: 1500`.
- Each group derives its own outcome from its own melting point: NaCl (1074 K) melts mid-ramp; MgO (3125 K) holds with growing jiggle. **Derived, never authored** (D-2) — which requires the property table of §5.3.
- Gate 14: heating past 1074 K leaves `g_mgo`'s lattice bit-for-bit unchanged (jiggle aside).
- Per-group readout: the single 220 px HUD prints per-group values one line each, engine-printed from the table, never hand-typed (lesson 1).

### 5.2 D-7 — `like_contacts`, specified so the naive version cannot be built

**Definition (binding, from Phase-0 D-7):** `like_contacts(t)` = like-charge nearest-neighbour contacts **created by the shift** (a DELTA against the unshifted reference lattice at the same t) **and left unscreened** (a contact is screened when electron-sea density lies between the pair — so in a metal every contact, before and after, is screened).

Operationally for the surgeon:
- `naive(t)` = count of nearest-neighbour pairs (separation ≤ ~1.1 × nn distance) with same-sign charge. On unshifted rock salt `naive = 0`; on a cation-only bcc metal `naive = 8` per interior site **before anything moves** — the case where naive and intended disagree.
- `like_contacts(t)` = `unscreened(shifted, t) − unscreened(unshifted reference, t)`. Ionic (no sea): 0 → 6. Metal (sea screens all): 0 → 0.
- The displayed number is the engine's derived count for the focal interface ion, and **gate 8 asserts the DEFINITION on the disagreement case**: the naive count on the cation-only lattice must be non-zero pre-shift while the shipped metric reads 0.
- **Skeleton discipline (lesson 1):** "0 → 6" is the Phase-0 design expectation. If the engine's derived count is not 6, that is a **Phase-0 arc discrepancy — STOP and report**; do not tune the metric to print 6, and do not hand-type 6 into an annotation. No narration or annotation quotes the digit; the HUD carries it.

### 5.3 One further E3b table this skeleton requires (flagged, not silently assumed)

S7/S8/S9/S10 read a melting point and a lattice enthalpy per ion pair. Neither exists. **E3b deliverable: extend `BS_ION_PAIRS` with `mp_K` and `lattice_kJ`** (NaCl 1074 K / 788 kJ·mol⁻¹ · KCl 1043 / 715 · LiF 1118 / 1030 · MgO 3125 / 3791 · CaO 2886 / 3401 — **all five rows chemistry-author-ratified with named conventions before Desk 2 authors against them**; Phase-0 fixed only NaCl 788/1074 and MgO 3791/3125). Convention to name: lattice dissociation enthalpy, MX(s) → M⁺(g) + X⁻(g), Born–Haber-derived; melting point at standard pressure. The gate PRINTS table-vs-literature with a ratify flag (the E1 dipole-table pattern), never asserts unratified digits. `conductivity`: the teaching number is the **gap** (≈10¹³-fold between molten and solid NaCl); endpoints are quoted with units and temperatures or not at all (Phase-0 ⚠ carried to chemistry-author).

---

## 6 · Rule-32 legibility plan

- **32a cause-first:** S2 the electron visibly leaves BEFORE either radius changes (radius ramp starts ~400 ms into the transfer); S3 the pull begins, THEN the stop; S4 the third ion arrives before the caption changes; S6 the layer slides → ~700 ms hold at full offset → the halves separate (derived); S7 the temperature HUD climbs and jiggle grows BEFORE the first ion leaves its site; S8 the field arrows appear, a beat, then the melt drifts; S9 the shared thermometer climbs before NaCl fails.
- **32b one variable moves:** each guided state's only changing quantity is its taught one (S5's spin is the D-4 countability convention; jiggle is ambient texture at authored amplitude). Explore exempt.
- **32c:** the delta-cue column IS each state's on-canvas caption opener; prose lives in the subtitle strip (Rule 34a).
- **32d home pose:** one apparatus throughout — S1's two atoms become S2's ions become S3's pair become S4's seed; S5 opens on S4's grown block (the `BS_COORD_RADIUS_SCALE` opening-up IS S5's beat); S6/S7 reopen on the packed block; S8/S9 are the declared two-sample frames (the one deliberate re-framing, fit-solved, never authored).
- **32e:** exactly one glow focal per state; the glow enum is the closed 11-key set (10 mesh keys + `trend`).

---

## 7 · Per-state `bonding_scene` authoring detail

Global: `render_annotations: true` and `config.field_lines.opacity: {}` (both mandatory — silent-no-op / blank-scene traps). **Never author `camera`/`camera_position`.** `eye_capture_ms` is **STATE-level**. Top-row annotations at x ∈ {160, 380, 500} only. All cue scalars name the **DESTINATION** (authoring the entry value produces a static state). Numbers live in the HUD; annotations carry the delta in words, each gated `at_ms`/`until_ms` and true for its whole visible window across the full range of every exposed control (lesson 5). Plain literal English (Rule 41).

### S1 — "One spare, one gap" · core · `shell-reveal` · LIVE
- `placement:'free'`, `mode:'assemble'`. Units `{id:'na', species:'Na', at:[-3,0,0]}`, `{id:'cl', species:'Cl', at:[3,0,0]}`. `electrons:{show:'shells'}` (Na 1 outer dot, Cl 7). `thermal:{T_K:298, jiggle_scale:0.5}`. `spin_start_ms:1500, spin_rate:0.15` (D-4 countability + declared motion).
- HUD `['valence']` (Na 1 · Cl 7). Formula surface `Na 3s¹ · Cl 3s²3p⁵`.
- Annotations: 3000 (x 160) "One spare outer electron"; 9000 (x 500) "One space for one more". `until_ms` = state end.
- Narration (≈38 w): sodium's outer shell holds one electron more than a full shell wants; chlorine's holds one fewer. Count the dots as the atoms turn. One spare, one gap — that mismatch is the whole story of this compound.
- `eye_capture_ms: 10000`. Duration 20.

### S2 — "Electron moves, sizes swap" · core · `transfer-and-resize` · LIVE
- `mode:'transfer'` (E3a). Same units. `transfer:{at_ms:5000, duration_ms:8000, from:'na', to:'cl'}` — stretched to run under its sentence. `electrons:{show:'shells'}`. Radii ramp on the **linear-pm** `BS_RADIUS_PM` scale: Na 186 → 102, Cl 99 → 181.
- HUD `['radius_pm']` (live ramped radius of the participants); the four numbers are engine-printed, **never typed into an annotation**.
- Formula surface `Na + Cl → Na⁺ + Cl⁻`.
- Annotations (post-settle, 14000): x 160 "Smaller: it lost a shell"; x 500 "Larger: one extra electron". Narration labels both starting radii "atomic radius" and states the basis once (metallic for Na, covalent for Cl) so 186-vs-99 is honest.
- Narration (≈45 w): chlorine pulls electrons far harder than sodium holds them, so the spare electron moves across — watch it. Sodium loses its whole outer shell and shrinks; chlorine gains one electron and swells. Two charged ions now, and the HUD shows both new sizes.
- `eye_capture_ms: 15000`. Duration 24.

### S3 — "Attraction stops at 282" · core · `pull-to-balance` · LIVE
- `mode:'approach_link'`, `links:{enabled:false}`. `approach_at_ms:4000`, duration ~7000, **destination separation authored explicitly as a_pm/2 of `BS_ION_PAIRS.NaCl` = 282.0 pm** (5.875 scene units at 48 pm/unit).
- ⚠ **The 282-vs-283 trap (lesson 1, for json-author):** the Shannon radii the engine renders sum to 102 + 181 = **283 pm**. If the destination were derived from radius contact the engine would settle at 283 while an authored "282" reads wrong beside it. So: the destination is AUTHORED at 282.0 (convention named on canvas: half the measured cell edge, a/2 = 564.0/2), and no annotation types a separation digit.
- HUD `['radius_pm']`. No formula surface. Annotation 11500 (x 380) "Full shells cannot overlap — they stop here".
- Narration (≈42 w): opposite charges pull the ions together — and they do not crash. The closer they get, the harder their full inner shells push back. Pull in, push out, balance: the ions settle at a fixed spacing, 282 picometres, half the crystal's measured cell edge.
- `eye_capture_ms: 12500`. Duration 22.

### S4 — "More ions keep joining" · core · `lattice-grow` · LIVE · **PRIMARY AHA + misconception pivot**
- `mode:'lattice_grow'` (E3a), `placement:'lattice'`. `lattice:{cell:'rock_salt', n:[5,5,5], a_pm:564.0, grow_at_ms:5000, grow_duration_ms:9000, grow_from: the S3 pair}` — 125 sites = `BS_MAX_SITES`; D-6 caps site labels at 8 automatically.
- HUD `['lattice_a']`. Formula surface `NaCl(s) — Na⁺ : Cl⁻ = 1 : 1`.
- **16a contrast beat (no predict→reveal):** OPENS on the lone pair — the picture the wrong belief expects — holds ~4 s while the narration names the expectation's consequence, then the growth shows the real physics: the third ion is pulled in as strongly as the second; there is no stopping point.
- `misconception_watch`: belief "NaCl is a molecule — one Na stuck to one Cl"; visual_counter "the pair refuses to stay a pair; ions keep joining until the lattice runs past the frame"; one_line_fix "NaCl is a 1:1 ratio of ions in an endless lattice, not a molecule."
- Annotations: 15000 (x 380) "The pattern repeats in every direction"; 17000 (x 160) "This block is a tiny corner of one grain" — any 10¹⁸-class number is chemistry-author-ratified with its grain-size convention named.
- Narration (≈48 w): here is the pair most people picture as "a molecule of salt." But a Cl⁻ pulls every Na⁺ near it, not just one — watch. Ions keep joining, in a strict alternating pattern, and nothing stops the growth. Salt is not molecules. It is one endless repeating lattice.
- `eye_capture_ms: 17600`. Duration 25.

### S5 — "Six neighbours, every ion" · core · `neighbour-cutaway` · LIVE
- `mode:'coordination'` (E3a). Packed home pose (32d). `lattice:{cell:'rock_salt', n:[3,3,3], a_pm:564.0, reveal:'peer_fade', reveal_at_ms:3500, focal_site: interior, label_sites: focal + 6 neighbours}`. The engine's ball-and-stick opening (`BS_COORD_RADIUS_SCALE` 0.35, peers to 0.12, six opaque rods) IS the beat. `{id:'spin', min_ring:'core'}`; slow authored spin keeps all six rods separable (D-4 across the full spin window).
- HUD `['coordination']` (6 : 6). No formula surface. Annotation 8000 (x 380) "Count the six rods" — true at every spin phase by the D-4 gate.
- Narration (≈40 w): let the block go glassy and keep one inside ion solid. Six rods, six neighbours of the opposite charge — above, below, left, right, front, back. Pick any ion in the whole crystal and the count is the same: six and six.
- `eye_capture_ms: 9000`. Duration 21.

### S6 — "One shift, it splits" · core · `layer-shift-snap` ⇄ · **E3b-BLOCKED**
- `mode:'layer_shift'`. Packed home pose. `shift:{at_ms:6000, duration_ms:3000, offset_sites:1, plane: horizontal mid-plane}`. Choreography: upper half slides one full site (cause), holds ~700 ms with the interface's like-charge pairs as glow focal (`layer`), then the derived split — halves separate on a closed-form ramp (10000 → 15000; D-2 outcome falls out of the charges; D-1 no accumulator).
- HUD `['like_contacts']` (E3b; derived 0 → 6 — no annotation types the digit). No formula surface.
- `{id:'shift', min_ring:'core'}` — scripted beat sharing a quantity with a live slider ⇒ **drag-seize required**.
- Annotations: 9200 (x 380) "A one-site slide lines up like charges" (mechanism wording — true wherever the teacher drags); 15500 (x 380) "Like charges push the halves apart".
- **Declared contrast pair** with `metallic_bonding` S5 (0 → 6 vs 0 → 0).
- Narration (≈45 w): this is why a salt grain splits into flat faces instead of denting. Slide the top half of the crystal by one position. Every plus now sits over a plus, every minus over a minus. The counter shows the new like-charge contacts — and the crystal splits along that plane.
- `eye_capture_ms: 16000`. Duration 24.

### S7 — "Heat frees the ions" · core · `melt-the-lattice` · **E3b-BLOCKED**
- `mode:'melt'`. Packed home pose. Scripted heat on the EXISTING E2b cue: `thermal:{T_from:300, T_at_ms:4000, T_ramp_ms:10000, T_K:1200, jiggle_scale:1}` (T_K is the DESTINATION; jiggle grows as √T today; the melt outcome — ions leaving sites once T crosses the pair's `mp_K` — is E3b, derived from §5.3, never authored).
- HUD `['melting_point','lattice_enthalpy']` (engine prints 1074 K · 788 kJ·mol⁻¹ from the ratified table). Formula surface `NaCl(s) → NaCl(l)`.
- `{id:'temperature', min_ring:'core'}` — **drag-seize required**.
- Annotations: 13000 (x 380) "Ions break free at the melting point" (conditional wording — true at any slider position); 15500 (x 160) "Every bond in the block must fail, not one".
- Narration (≈45 w): heat the crystal and every ion shakes harder, but each is still held by six neighbours — and those by six more. Nothing moves until the whole network fails at once. That is why the melting point is so high: the HUD shows the temperature and the energy it takes.
- `eye_capture_ms: 16000`. Duration 24.

### S8 — "Free ions carry charge" · core · `field-on-both` · **E3b-BLOCKED**
- `mode:'drift'`. `groups`: `g_solid {label:'solid', at:[-4.5,0,0], lattice: rock_salt [3,3,3] a 564.0, thermal:{T_K:300, jiggle_scale:0.6}}` · `g_melt {label:'molten', at:[4.5,0,0], same lattice spec, thermal:{T_K:1100, jiggle_scale:1}}` — `g_melt` opens already molten (§5.1; closed-form, no latch). **Scene-level** `ions:{mobile:true, field: destination, field_at_ms:6000}` inherited by BOTH groups.
- Choreography: field arrows fade in at 6000 (cause), beat, the melt's ions begin a slow biased drift ~6800; the solid's jiggle and never translate (the gate-13 negative control IS the 16a contrast beat).
- `misconception_watch` (pivot #2): belief "solid salt conducts — it is full of charges"; visual_counter "the same field on both samples: the solid's ions are locked to their sites and do not move; only the melt's free ions drift"; one_line_fix "charge must be free to MOVE to carry current — molten or dissolved, not solid."
- HUD `['conductivity']` (⚠ endpoints chemistry-author-ratified with units + temperatures, or the HUD shows the gap only).
- `{id:'field', min_ring:'core'}` (drag-seize). No formula surface. Annotations: 8000 over g_solid (x 160) "Held in place — no current"; 10500 over g_melt (x 500) "Free ions drift — current flows".
- Narration (≈50 w): both samples are pure salt, and the same push acts on both. In the solid every ion is locked in the lattice — it leans, and stays. In the molten sample the ions are free, and they drift: plus one way, minus the other. Moving charge is a current. Same substance, completely different behaviour.
- `eye_capture_ms: 13000`. Duration 26.

### S9 — "Double charge, far stronger" · **advanced** · `melt-race` · **E3b-BLOCKED**
- `mode:'melt'` with `groups`: `g_nacl {label:'NaCl', at:[-4.5,0,0], lattice: rock_salt [3,3,3] a 564.0}` · `g_mgo {label:'MgO', at:[4.5,0,0], lattice: rock_salt [3,3,3] a 421.2}` (Mg²⁺ 72 pm · O²⁻ 140 pm — smaller AND doubly charged). **Scene-level** `thermal:{T_from:300, T_at_ms:4000, T_ramp_ms:10000, T_K:1500}` — one temperature, no per-group override. NaCl fails mid-ramp (derived, 1074 K); MgO holds at 1500 K, jiggling (derived, 3125 K).
- HUD: per-group `['melting_point','lattice_enthalpy']`, engine-printed (NaCl 1074 K · 788; MgO 3125 K · 3791). Formula surface (advanced, algebra-only, 38c) `E ∝ q₁q₂ ⁄ r` — never Born–Landé.
- Annotations: 12000 over g_nacl (x 160) "Single charges — already molten"; 14000 over g_mgo (x 500) "Double charges, closer — still solid".
- Narration (≈45 w): same heater, two crystals. Salt's ions carry single charges; magnesium oxide's carry double charges, and they sit closer. The formula says double charge on both ions, at a smaller spacing, binds many times harder. Salt melts on the way up; magnesium oxide holds far past it.
- `eye_capture_ms: 15000`. Duration 24. No controls (watch-this beat).

### S10 — Explore · core · `interaction_complete` · **E3b-BLOCKED**
- `mode:'explore'`, `fit: true`. Rock-salt only — one cell covers all five `BS_ION_PAIRS`. Controls (ALL core): `ion_pair, spin, temperature, shift, field`.
- HUD `['lattice_a','melting_point','lattice_enthalpy']`. No formula surface (core-only sandbox). Narration 0/open. Explore idle auto-sweep keeps it moving (Rule 37 player invariant).
- **Lesson-6 duty (Rule 38b breach if skipped): every picker species hand-driven before ship.** Drive all five pairs through the full slider ranges and record readings: LiF's small cell (a 402.6) under the fit-solve; MgO/CaO double charges through shift (like_contacts must still derive correctly) and temperature (mp 3125/2886 K — **the temperature slider's max must be ≥ 3400 K** so MgO/CaO can actually melt in the sandbox, else the picker offers species whose behaviours are unreachable); field on each pair below/above its melting point. `config.explore_*` defaults authored explicitly — silence is the breach.

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

**Prerequisite cliffs.** (1) Shell model → breaks at **S1**; patch: S1's first sentence says "the dots are the outer electrons" literally. (2) Electronegativity → breaks at **S2**; patch: "chlorine pulls electrons far harder than sodium holds them" — no Δχ symbol at core ring. (3) Coulomb attraction → breaks at **S3**; patch: "opposite charges pull together" as the first clause, then the state teaches the non-obvious half (why they STOP).

**Exam-backwards trace.** *"MgO and NaCl both form rock-salt lattices. Explain why MgO's melting point (~3125 K) is far higher than NaCl's (~1074 K), why both conduct only when molten, and why both are brittle."* Pieces → states: rock-salt structure + 6:6 → S4/S5; melting = whole-lattice failure + lattice enthalpy → S7; conduction requires mobile ions → S8; brittleness = like-charge alignment on slip → S6; charge/size dependence E ∝ q₁q₂/r → S3 (r set by shells) + S9; formation half → S1–S2. **No missing piece; no state fails to serve the trace.**

**Misconception entry mapping.** Belief 1 planted by every textbook's dot-and-cross diagram AND potentially by our own S2–S3 pair picture — managed per §8; confronted proactively at S4. Belief 2 planted by "ionic compounds are made of charges"; confronted at S8 via the negative-control contrast.

### Block 2 — aha designation

- **PRIMARY aha (S4):** *"There is no molecule of salt — the pair refuses to stay a pair, and the crystal is one endless repeating lattice."*
- **SUPPORTING aha (S6):** *"Slide the layers one position and the crystal's own charges tear it apart"* — reinforces the primary (only a LATTICE can shatter this way) and is the declared setup for `metallic_bonding`'s contrast aha.
- **Cohesion:** S6 depends entirely on S4's lattice; no candidate aha stands alone. S9's MgO race is deliberately NOT an aha — it is a consequence of S3+S4's physics and lives in the advanced ring. 1 primary + 1 supporting.
- **Wrong-belief setup:** for S4 — S2/S3 build the confident "one Na⁺ + one Cl⁻, done" two-body story settling at 282 pm. For S6 — S5 builds "every ion is gripped by six neighbours, so this must be extremely tough"; the aha is that its own strength geometry is what makes one small slide fatal.
- **Foundational coverage:** S4 ∈ foundational ✓.

**Cross-references:** deep-dive picks (S2/S4/S6) vs cliff states (S1/S2/S3) overlap at S2 and diverge at S1/S3 — documented reason: the S1/S3 cliffs are fully patched by one inline sentence each (cheap), while S4/S6 are where exam questions and documented confusions concentrate (expensive, worth pre-authoring).

---

## 14 · Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the ten of §2, ids `STATE_1`–`STATE_10`, contiguous.

**(b) Symbol-label table (all real Unicode — Rule 34c across DOM + canvas text + sprite labels):**

| Spoken quantity | On-canvas label |
|---|---|
| sodium atom / ion | `Na` / `Na⁺` |
| chlorine atom / ion | `Cl` / `Cl⁻` |
| magnesium ion / oxide ion | `Mg²⁺` / `O²⁻` |
| the transferred electron | `e⁻` |
| electron configuration | `3s¹` · `3s²3p⁵` |
| radius (HUD) | `r = 102 pm` |
| cell edge (HUD) | `a = 564 pm` |
| coordination (HUD) | `6 : 6` |
| like-charge contacts (HUD) | `like contacts: 6` |
| temperature (HUD) | `T = 1074 K` |
| melting point (HUD) | `m.p. = 1074 K` |
| lattice enthalpy (HUD) | `ΔH = 788 kJ·mol⁻¹` |
| strength relation (S9) | `E ∝ q₁q₂ ⁄ r` |
| reaction ledger | `Na + Cl → Na⁺ + Cl⁻` · `NaCl(s) → NaCl(l)` |

**(c) Balanced-equation ledger plan (chemistry variant of the direction-rule row; RHR N/A):** S2 shows the transfer equation (charges as ion labels, no state symbols — free gas-phase atoms); S4 shows `NaCl(s) — Na⁺ : Cl⁻ = 1 : 1`; S7 shows `NaCl(s) → NaCl(l)`. Oxidation-number labels not used (charges carry the same information; redox framing belongs to a later concept). Particle-count scale factor: S4's "tiny corner of one grain"; any 10¹⁸-class number is chemistry-author-ratified with its grain-size convention named.

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

- `query_engine_bug_queue.ts` could not be run from this dispatch (no shell); the script is additionally a **known false-all-clear on chemistry concepts** (its concept list is hardcoded physics — OPEN scar from the σ/π session). Compliance was built from the FIELD3D checklist rows Phase-0 enumerates + the scars named in renderer source, all applied above: `render_annotations:true`, `config.field_lines.opacity:{}`, state-level `eye_capture_ms` on every annotation-payoff state, drag-seize on S6 `shift` / S7 `temperature` / S8 `field`, `top:52px` clearance, no frozen tail, explore idle auto-sweep, `pmCreateAutoLabel` only, no backticks, D-4 countability across the S5 spin window with the focal ion IN the counted set, D-6 label caps, closed enums only (no `show_count`, no invented cue keys — the two this skeleton NEEDS that do not exist, `field_at_ms` and the `BS_ION_PAIRS` property columns, are named as explicit E3b deliverables).
- **Desk-1 lessons 1–8 applied:** engine-printed numbers only (282/283 trap called out at S3; like_contacts digit never typed; per-pair table engine-printed), player-model durations, `duration = ceil(timeline)`, motion-continuity ≤25% static, control-range-true annotations (mechanism wording at S6/S7), explore species hand-drive duty with an explicit temperature-slider max (S10), evidence-before-statement cue ordering, and `check-layout-overlap` treated as non-evidence.
- **Missing-input disclosure:** see the ⛔ note at the top. **quality_auditor must run the live Gate-8 query.**

**NCERT check line:** Consulted NCERT Chemistry Cl.11 Ch.4 index to confirm scope (§4.2 ionic/electrovalent bond; lattice enthalpy §4.2.1). No teaching method, example problem, or figure imported. Exemplar consulted for misconception beliefs only.

---

## 16 · Self-review

- [x] Atomic claim one sentence; deferrals named with ledger rows
- [x] 10 states — FIXED arc implemented unmodified; no defect found; outside-table count justified
- [x] Per-state control table complete; no archetype repeat except the DECLARED pair; no static state
- [x] Rule 32 plan · Rule 33 (§14g) · Rule 34 budget (§14h) · Rule 35/38f anchor with rejected candidates · Rule 41 throughout
- [x] Rule 38: rings tagged, S9 contiguous advanced before explore, BOTH cuts walked, explore core-only, tags as claims, presets, 38e N/A stated
- [x] misconception_watch at exactly 2 genuine pivots; no predict→reveal; no `wait_for_answer`
- [x] 3 deep-dive states × 3 clusters · entry_state_map with foundational containing the PRIMARY aha · prerequisites advisory
- [x] Two-pass Block 1 + Block 2 complete
- [x] DoD complete, zero TBDs; chemistry ledger plan in place of RHR; five values flagged for chemistry-author ratification
- [x] E3b-blocked states marked per capability; rows R + D-7 given their Checkpoint-A second pass (§5) with surgeon-proof specs
- [x] Gate 12 ✓ · Rule 19 ≥3 primitives/state achievable everywhere
- [x] Registration site #1 only
- [ ] Engine bug queue script run — NOT run (no shell + known chemistry false-all-clear) — **flagged to quality_auditor**
- [ ] Sibling ⛔ CORRECTED blocks read — **unavailable (Desk 1 unmerged)** — flagged to founder-proxy

**Escalations (2):** (1) merge Desk 1 (or cherry-pick its docs) and diff this skeleton against the sibling's ⛔ blocks before chemistry_author opens; (2) **E3b must be dispatched** (`field3d-surgeon`, master) before S6–S10 are buildable — §4 + §5 are its dispatch input, including the two deliverables it must not discover mid-build: the `field_at_ms` cue and the `BS_ION_PAIRS` `mp_K`/`lattice_kJ` columns.
