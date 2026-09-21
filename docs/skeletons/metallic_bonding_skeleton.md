# ARCHITECT SKELETON — `metallic_bonding` (chemistry, Phase-0 bonding wave, Desk 3 concept 2 of 2)

**Date:** 2026-08-03 · **Cycle 2 of 2** (Checkpoint A cycle 1 `DESIGN_FIX`, all 12 MUST-FIX applied; WOULD-IMPROVE 3–7 applied; WI 1–2 recorded as ⚑ FOUNDER CALLS, not applied) · **Renderer:** `field_3d` · `scenario_type: 'bonding_scene'` · **Placement:** `lattice` + electron sea
**Arc source (BINDING):** `docs/CHEMISTRY_PHASE0_BONDING.md` §0b `metallic_bonding` table, Checkpoint A `DESIGN_OK` (2026-08-01) plus the three Checkpoint-A decisions restated in §2. This skeleton implements that arc; it does not redesign it. **No arc defect was found.** One ENGINE-claim discrepancy in the dispatch brief is corrected in §4 (S2 is E3b-blocked, not buildable today); one Rule-38b coherence gap is closed by a named E3b capability (§4 C-6) with an explicit descope fallback.
**Registration:** site #1 ONLY (`src/data/concepts/chemistry/metallic_bonding.json`). Validation: `npm run validate:chemistry`. Sites 2/3/4/7/8 forbidden (Gate 8b all-or-nothing).
**Engine contract:** `docs/notes/bonding_scene_contract.md` (E1+E2 vintage, read from `origin/feat/chemistry-polarity-hbonding`) supersedes the Phase-0 doc's literal guesses; **renderer SOURCE supersedes both** — every engine claim below re-verified against `src/lib/renderers/field_3d_renderer.ts` on this worktree (E3a + E5 landed; line numbers inline). Sibling skeleton read: `origin/feat/chemistry-ionic-metallic:docs/skeletons/ionic_bonding_skeleton.md` (its §5.2 defines `like_contacts` bindingly for S5). Desk-1 artifacts read including both ⛔ CORRECTED blocks and the ⛔ MEASUREMENT NOTE.

---

## 1 · Atomic claim + tier justification

**This concept teaches one idea: a metal is a lattice of positive cores in a shared sea of delocalised electrons — no electron is attached to any one atom — and that sea explains why metals conduct in the solid state, bend instead of shattering, and get stronger with more electrons per atom.** It does not cover band theory or semiconductors (deferred, no concept id yet); **alloys — deferred deliberately and recorded with its board evidence: alloying is the most-examined APPLICATION of metallic bonding at IGCSE and A-level (foreign-atom sizes disrupt layer sliding), and it needs its own arc — here it surfaces only as S5's drill-down cluster `why_alloys_are_harder`**; electrolytic vs metallic conduction side-by-side (ionic S8 owns the electrolyte half); the ionic arc itself (sibling `ionic_bonding`, Desk 2 concept 1).

**Tier: 💎 (fixed at Phase-0 §0a).** Whiteboard test: a shared swarm roaming a 3D lattice, a drift bias appearing under a field, and a layer slide that HOLDS where the salt crystal split are all motions and derived outcomes, not pictures. Capabilities 1 + 3 + 4.

**Representation triangle (`docs/patterns/chemistry.md` §0):** the particulate vertex leads every guided state; the symbolic vertex (the S2 ledger, the S6 trend chart) supports and never leads a core state; the macroscopic vertex enters through the anchor (a spoon bends, a wire carries current) at S4–S5.

**Archetype provenance:** all names are Phase-0 §0b coinages approved at Checkpoint A — particulate-box (M) family of `docs/patterns/chemistry.md` §1, [LIVE]-family machinery only. `layer-shift-hold` is the wave's ONE declared archetype-repeat contrast pair, with `ionic_bonding` S6 `layer-shift-snap` (same motion, same `like_contacts` readout, opposite derived outcome: 0 → 6 vs 0 → 0). Declared, never renamed (Rule 31b).

---

## 2 · State count + arc — 7 states (FIXED by Phase-0 §0b; not redesigned here)

7 states sits at the "complex" band of the §5 calibration table and is right: formation (pack → release → sea), two examinable properties each with its own derived motion (conduction, malleability/ductility), one extended trend state, one explore.

| # | id | Rail title (Rule 41d — first words carry the meaning) | teaching_method |
|---|---|---|---|
| S1 | `STATE_1` | Atoms pack in a regular lattice | — (straightforward beat) |
| S2 | `STATE_2` | Outer electrons come free | — |
| S3 | `STATE_3` | One shared sea holds all the cores (PRIMARY aha; misconception pivot 1) | misconception_confrontation (16a contrast beat) |
| S4 | `STATE_4` | Field on: a slow drift carries current (misconception pivot 2) | — (16a contrast beat #2) |
| S5 | `STATE_5` | Layers slide and the metal holds | — |
| S6 | `STATE_6` | **extended** — More electrons per atom, stronger metal | compare_contrast |
| S7 | `STATE_7` | Explore the metal | exploration_sliders |

`state_count: 7`. Rings: S1–S5 + S7 `core`, S6 `extended` (contiguous, immediately before explore — Rule 38a). No advanced ring. `advance_mode`: S1–S6 `manual_click`, S7 `interaction_complete` (Gate 12 ≥2 modes ✓).

**Checkpoint-A decisions honoured (not relitigated):**
1. S5 is the DECLARED contrast pair with `ionic_bonding` S6 — the only archetype repeat in the wave; name unchanged.
2. S6's evidence is **enthalpy of atomisation** (Na 107 · Mg 146 · Al 326 kJ·mol⁻¹), never melting point (Na 371 → Mg 923 → Al 933 K is a 1% rise for a 50% electron increase — the number contradicts the claim). Melting point appears in explore as context only.
3. S6 holds **ONE representative cell** and varies ONLY the valence count (Rule 32b); that cell is never labelled with a metal whose real packing differs (Na bcc · Mg hcp · Al fcc). `hcp` is in the `lattice.cell` enum so EXPLORE shows each metal in its true cell (`bscCellSites` hcp branch, `field_3d_renderer.ts:52657–52673`).

---

## 3 · Per-state control table (Rule 31 — the first design artifact)

Word counts are targets inside the 25–55 budget. **Duration is derived from the PLAYER's speech model** (player words = chars/5.5 at ≈2.16 w/s, `src/scripts/build_review_site.ts:1142–1168` → ≈0.505 s per authored word), then `duration = ceil(timeline ⁄ 1000)` where timeline = max(speech end, last cue + settle). The validator probe's words/2.8 model is NOT the shipped clock. json-author re-derives from FINAL narration strings; these are design envelopes.

| # | Ring | Teaches | Archetype | Delta cue (≤5 words, Rule 41) | Controls `{id, min_ring}` | Words | Est. timeline | Duration (s) | Glow focal (per-sentence map in §6) |
|---|---|---|---|---|---|---|---|---|---|
| S1 | core | Metal atoms pack in a regular repeating lattice | `pack-the-lattice` | "Atoms pack in rows" ⚑ | — | 38 | ~19.5 s | 20 | `lattice` |
| S2 | core | Every atom's outer electron leaves; cores become cations | `release-to-sea` | "Outer electrons come free" | — | 45 | ~23 s | 24 | `electrons` → `lattice` |
| S3 | core | The shared sea belongs to the whole crystal and holds it together | `sea-roam` | "Electrons move everywhere" | — | 48 | ~24.5 s | 25 | `electron_tag` (C-9) → `electrons` → `lattice` |
| S4 | core | A field adds a slow net drift — that drift is the current (and the sea carries heat) | `bias-the-swarm` | "Field adds slow drift" | `{field, core}` | 55 | ~28 s | 28 | `arrows` → `electrons` |
| S5 | core | The same one-site slide that split salt leaves the metal whole; bend and draw, not shatter | `layer-shift-hold` ⇄ | "Same shift, no split" | `{shift, core}` | 53 | ~27 s | 27 | `layer` → `electrons` → `layer` |
| S6 | **ext** | More free electrons per atom + higher core charge = stronger metal | `valence-ladder` | "More electrons, stronger hold" ⚑ | `{valence, ext}` | 45 | ~23 s | 24 | `lattice` → `electrons` → `trend` |
| S7 | core | Explore | `interaction_complete` | — | `{metal, core}` `{field, core}` `{shift, core}` `{valence, ext}` | 0/open | free-run | 30 | — |

(⚑ = string recorded as a founder call, see the ⚑ section — arc-fixed, not changed here.)

No two guided states share an archetype except the declared cross-concept pair. No static state: S1–S6 all carry authored `thermal.jiggle_scale` > 0 (**defaults to 0 — MUST be authored**) plus a scripted ramp each; S3–S6 additionally self-sustain via the roaming sea. **Motion-continuity budget: no static run > 25% of any state's timeline** — S1's grow runs 3 000 → 17 000 of 20 s (tail 15%) and S2's release 4 000 → 19 000 of 24 s (tail ~21%), each ramp stretched under the sentence that explains it (Desk-1 lesson 6: fix the timing, never add a spin). **`reveal_hold` is DECLARED on S1 and S2** (their tails are jiggle + parked-dot micro-motion only); S3–S6 need none (the sea self-sustains).

---

## 4 · The E3b ENGINE-BLOCK MAP — which states E3b must unblock

**Verified against source on this worktree, 2026-08-03:** `BS_MODES_E3A = ["transfer","lattice_grow","coordination"]` and `BS_MODES_DEFERRED = ["layer_shift","electron_sea","drift","melt"]` (`field_3d_renderer.ts:51628–51629`); `groups / sea / ions / shift` are "PARSED + PASSED THROUGH by E1/E2/E3a, owned by E3b" (`:51097–51098`); implemented HUD lines are exactly `BS_HUD_LINES_E1 + _E2 + _E3A` = `delta_chi, mu, radius_pm, valence, links, links_per_unit, bp, coordination, lattice_a` (`:51637–51639`) — `like_contacts, drift, atomisation, conductivity, melting_point, lattice_enthalpy` are declared (`:51634–51636`) and unimplemented; `check_bonding_scene.ts:4629` ends "all E1 + E2 + E2b + E2c-g + E3a + E1c + E5 + E3/E4 sections pass (8/13/14 are declared E3b stubs)" and its `NO_DRIVER = ["shift","field","valence","metal"]` (`:4002`) confirms those four control rows exist write-only (`:53547–53552`).

| State | Buildable today? | E3b capability needed (exact) |
|---|---|---|
| S1 | **YES** (E3a) | — · `lattice_grow` LIVE; bcc site generation LIVE (`bscCellSites` bcc filter `:52679–52684`); a single-species lattice needs no new key — `spB` defaults to `spA` when `units[1]` is absent (`bscSiteList` `:52798–52801`); neutral `Na` is a site (`bscIsSite` `:52762`, `BS_RADIUS_PM.Na = 186` `:51712`); `lattice_a` HUD LIVE |
| S2 | **NO — corrects the dispatch brief's "S1–S2 buildable today"** | **C-10** (the whole-lattice ionisation ramp + per-site outer-electron dots) + the C-2 sea substrate for the dots' render convention. Today's machinery cannot express it: `mode:'transfer'` requires `trFrom >= 0 && trTo >= 0` resolved by `units[].id` (`:54373–54375`, `:54483`) and lattice sites carry `unit: null` (`:52810`); shell dots draw ONLY on the focal free unit's central atom, pool of 8, camera-plane ring (`:54843–54860`) |
| S3 | **NO — E3b-BLOCKED (verdict determined by grep, per dispatch)** | `mode:'electron_sea'` is in `BS_MODES_DEFERRED` (`field_3d_renderer.ts:51629`) and the `sea` block is parse-only (`:51097`); no sea meshes exist anywhere in the region (grep `bscSea`: 0 hits). Needs **C-2** (the swarm) + **C-9** (the tagged-electron focal) |
| S4 | **NO** | `mode:'drift'` deferred (`:51629`); `drift` HUD line unimplemented (`:51637–51639`); `field` slider row exists (`bsc_field_row` `:53416`) write-only (`:53547`). Needs: `sea.field` (destination) + **`field_at_ms`** cue (destination-valued, cause-first — the SAME cue the ionic skeleton §4 already requests for its S8) + `sea.show_drift` (a small net-drift arrow; field/drift arrows carry `elementType: 'bsc_arrow'` so the existing `arrows` glow key binds them — reuse, no enum growth, the E1c lone-pair precedent) + drag-seize on the field row + the `drift` HUD line per the **C-3 model**: **`v_d = μE`, sodium mobility μ ≈ 5.3×10⁻³ m² V⁻¹ s⁻¹ (chemistry-author-RATIFIED with its convention named), slider 0–1 mapped linearly to E = 0 → 0.04 V m⁻¹, giving v_d = 0 → ≈1×10⁻⁴ m s⁻¹ full-scale.** The model, units and mapping are DECIDED HERE so the surgeon never invents them; the HUD's SI units are earned by the ratified μ. At `field = 0` the line is SPECIFIED to read `v_d = 0 m/s` — live zero, never "—", never stale |
| S5 | **NO** | `mode:'layer_shift'` deferred (`:51629`); `shift.at_ms`/`shift.duration_ms` declared E3b stubs (`check_bonding_scene.ts:937–938`); **D-7 `like_contacts`** unimplemented ("D-7 stays open for E3b", `:663`) — BINDING definition: ionic skeleton §5.2 (change-based AND screened; the sea screens every contact, so the metal reads 0 → 0 while the naive count on this very cation-only lattice is non-zero pre-shift — gate assertion 8's disagreement case IS this concept). Requires C-2 (screening is the mechanism — union row G on S5) + derived HOLD outcome (D-2) + the **RE-SEAT settle beat**: after a full one-site offset the slid layer's sites coincide with equivalent lattice sites, and the layer visibly settles into registry (a short damped closed-form settle, D-1) — the POSITIVE confirmation §6 S5 teaches with. Drag-seize on the `shift` row (`bsc_shift_row` `:53415`). `like_contacts` HUD is SPECIFIED live at every offset (reads 0 throughout on the metal — a live derived zero, never stale) |
| S6 | **NO** | `valence` slider row exists ("Free electrons per atom", 1–3, `:53417`; `PM_bscValence` seeded `:53549`) write-only (`:4002`). Needs **C-4** (scripted valence STEP cue + consumer + drag-seize) + **C-8** (trend live highlight). The `atomisation` HUD line is NOT used on S6 (one instrument, D-3 — the chart carries the value; see §6 S6) |
| S7 | **NO** | `mode:'explore'` LIVE with idle auto-sweep (contract trap 6), but every behaviour behind its four controls is E3b: the `metal` picker row exists with Na/Mg/Al options **hardcoded in the DOM string** (`bsc_metal_select` `:53419`; `PM_bscMetal` seeded `:53552`) and no consumer — it must swap species + cell + a_pm + valence TOGETHER off C-1's `BS_METALS` (the `pairOverride` pattern `:52794–52800` is the template); plus field/shift/valence sandbox behaviours from S2–S6; plus `drift`/`melting_point`/`atomisation` HUD lines; plus **C-6** hud-line ring-gating (with its descope fallback) |

### NEW E3b capabilities beyond the ionic skeleton's requests (final numbering C-1…C-10; flagged, never assumed)

- **C-1 · `BS_METALS` property table** — the analog of `BS_ION_PAIRS` that does not exist (grep `BS_METALS`: 0 hits): `{ Na: {cell:'bcc', a_pm:429.0, valence:1, dH_at_kJ:107, mp_K:371}, Mg: {cell:'hcp', a_pm:320.9, valence:2, dH_at_kJ:146, mp_K:923}, Al: {cell:'fcc', a_pm:404.9, valence:3, dH_at_kJ:326, mp_K:933} }` — **all fifteen cells chemistry-author-ratified with named conventions before authoring** (ΔH_at: standard enthalpy of atomisation of the solid element at 298 K, kJ per mole of atoms; a_pm: conventional cell edge, X-ray; hcp a_pm is the basal edge with ideal c/a = √(8/3), shipped `BS_HCP_C_OVER_A` `:51649`; mp at standard pressure). The gate PRINTS table-vs-literature with a ratify flag (the E1 dipole-table pattern). **Geometry solved for ALL THREE metals on the shared linear-pm scale, not just S1's:** Na bcc nn = a·√3⁄2 = 371.5 pm vs 2r = 372 ✓ · Al fcc nn = a⁄√2 = 286.3 pm vs 2r(143) = 286 ✓ · Mg hcp nn = a = 320.9 pm vs 2r(160) = 320 ✓ — every picker metal renders touching spheres, so the picker is geometrically sound. **Constraint (picker options are ENGINE-OWNED):** the three `<option>` values are hardcoded in the DOM string (`:53419`) — `BS_METALS` keys MUST match exactly {Na, Mg, Al}; a fourth table row would silently never appear in the picker unless the dispatch also rebuilds the row from the table. The E3b ask must state this coupling explicitly.
- **C-2 · The electron sea itself** (S2 dot substrate + S3 roam + S4 drift + S5 screening) — row G. Deterministic index-seeded closed-form roam through the lattice interstices (pure function of state-local t, D-1; byte-identical under SET_TIME_FREEZE), dots confined to the block volume. **Render convention: sea dots inherit the shipped electron-dot material convention — `depthTest:false, renderOrder 998` (`:53236–53252`) — so every dot draws on top of the cores and is never occluded by the lattice** (the interior-visibility mechanism §6 relies on). **Sea-count ceiling declared: `BS_MAX_SEA = 105`** (3 × 35 sites, S6's top step) — bounds the mesh pool as `BS_MAX_SITES` bounds sites; D-4 consequence: above ~40 dots the swarm is TEXTURE under the scale-factor convention, never a counted set — every counted electron claim rides the slider/HUD/tagged dot, none rides counting dots. Ionic's §4 requests row Q (ION drift), explicitly distinct from `sea`.
- **C-3 · `drift` + `atomisation` HUD lines** (ionic requested `like_contacts, melting_point, lattice_enthalpy, conductivity`). `drift` per the S4-row model above (`v_d = μE`, ratified μ, specified live zero). `atomisation` prints the named metal's `BS_METALS.dH_at_kJ` — consumed by S7 ONLY (S6 uses the chart as its one instrument).
- **C-4 · Scripted valence STEP cue + valence-row consumer + drag-seize** — `sea.valence_from` + `valence_at_ms` + `valence_step_ms`: a stepped closed-form function of t (1 → 2 → 3; fractional electrons per atom are meaningless, so a step, not a ramp), driving sea count ∝ valence and core charge labels +1 → +2 → +3 (Σq balanced against the sea). No ionic state touches `valence`.
- **C-5 · `valence` HUD line generalisation** — today it prints `BS_VALENCE[mol.central]` (`:55082`), a MOLECULE-path read; on a lattice of Na atoms it must read the live site species. (Corrected from cycle 1: `radius_pm` needs NO such fix — its `nShown > 0` branch already resolves from `siteSp[focalSite]` (`:55075`); only its final fallback (`:55077`) is molecule-only.)
- **C-6 · Ring-gated HUD lines** — `hud_lines` accepts `{id, min_ring}` like `controls` (bare string ⇒ core). Required for Rule 38b: S7's `atomisation` line must hide under the core-only preset. **Descope fallback, named so 38b can never break silently: if C-6 is descoped, `atomisation` leaves the S7 HUD entirely** — the explore state then carries `['lattice_a','drift','melting_point']` only, and 38b holds by removal instead of gating.
- **C-7 · Explore detach semantics for the valence slider** — on `metal` pick, the valence row SEIZES to that metal's true valence; a teacher DRAG of the valence row detaches the scene to an UNLABELLED "model metal": the element label clears and the element-tied DATA lines (`melting_point`, `atomisation`) blank to "—" (deliberate, distinct from S4's live `v_d = 0`: drift is a live derived quantity and always prints its number; mp/ΔH are table data with no referent once detached). Otherwise the sandbox can render an Al labelled with one free electron — the mislabel Checkpoint-A decision 3 forbids.
- **C-8 · Trend-panel live highlight** (S6) — the row-O panel is LIVE (E2); the highlight following `PM_bscValence` is new.
- **C-9 · Tagged-electron focal (NEW — closes a Rule-32e violation).** `BS_GLOW_ELS.electrons = ["bsc_electron","bsc_lone"]` (`:55308`) and `applyBondingSceneGlow` glows EVERY visible object of a focal elementType (`:55321–55333`) — so `glow_focal:'electrons'` on S3 would light ALL 40 dots: Rule 32e violated and "watch one electron" has no mechanism. Capability: the tagged dot carries a DISTINCT elementType `bsc_electron_tag`, reachable via a new twelfth glow key `electron_tag` (enum amendment — see Escalation 2; the eleven-key enum precedent is E5's own `trend` addition `:55310–55317`). Instance-level focal resolution is the acceptable alternative if the surgeon prefers it; either way S3's focal lights ONE dot.
- **C-10 · Whole-lattice ionisation ramp + per-site outer-electron dots (NEW — promoted from prose; S2's largest mechanism).** Generalises the `bscTransferSite` arithmetic (`:52851–52860`) from the from/to PAIR to ALL shown sites: per-site species label Na → Na⁺ (`pmCreateAutoLabel` — text changes), charge 0 → +1, radius 186 → 102 pm linear-pm, driven by `sea.release_at_ms` + `sea.release_duration_ms`; plus per-site outer-electron dots, **count = `BS_VALENCE[species]` per site**, born at each site's surface and departing on the ramp. Charge conservation extended: Σq(sites) + Σq(released dots) = 0 at every instant (gate-2 analog). **Regression guard (this MODIFIES E3a-shipped code `ionic_bonding` depends on): the existing `mode:'transfer'` path with `trFrom`/`trTo` must render BYTE-IDENTICAL before and after — a gate-1 determinism assertion pinned on `ionic_bonding` S2's frames.**

Shared-with-ionic requests this concept also depends on (dispatch ONCE, for both): `field_at_ms` cue; drag-seize on `shift`/`field` rows; the D-7 `like_contacts` metric + HUD line per ionic §5.2.

---

## 5 · Rule-32 legibility plan

- **32a cause-first:** S1 sites grow outward from the seed pair BEFORE the caption names the pattern; S2 the electron dots visibly LEAVE first, cores shrink and relabel ~800 ms after the first departure; S3 the tagged electron starts moving, THEN the annotation names what it is not attached to; S4 field arrows fade in across the block (cause), ~800 ms beat, the swarm gains its bias (effect); S5 the layer slides to full offset (cause), ~700 ms hold with the interface as glow focal, then the POSITIVE payoff — the layer visibly RE-SEATS into the equivalent sites and the block reads as the same pattern one row over (derived effect); S6 the valence steps up (cause), the sea thickens and the trend highlight moves (effect) after a readable beat.
- **32b one variable moves:** each guided state's only changing quantity is its taught one — jiggle is ambient texture at authored amplitude; the sea's roam is the ESTABLISHED backdrop from S3 onward. S6 holds cell, radius and label fixed while ONLY the electron count and core charge step. Explore exempt.
- **32c:** the delta-cue column IS each state's on-canvas caption opener; prose lives in the subtitle strip (Rule 34a).
- **32d home pose:** ONE apparatus throughout — S1 grows the bcc block; S2 ionises that same block in place **and terminates with the released dots PARKED at their parent sites**; S3 opens on exactly that parked pose (32d applies to the ELECTRONS, not only the cores); S4–S6 keep the identical block (S5 returns to the unslid pose on entry; S6 keeps the same block unlabelled); S7 re-frames only when the metal picker swaps the cell (fit-solved, never authored).
- **32e:** exactly one glow focal at any instant. The closed glow enum has **ELEVEN keys** — ten mesh keys + `trend` (`bsc_trend`, added by E5 `:55310–55317`, precisely because "a narration sentence about the trend line was unbindable by construction"); C-9 requests a twelfth (`electron_tag`). **Every state in §6 carries a per-sentence glow map** (json-author binds via the live `SET_GLOW` path — `applyBondingSceneGlow` reads live `glowTargets` and only falls back to the authored `glow_focal`), so no sentence's subject is ever unbound — the exact defect E5 was built to end.
- **Interior visibility (D-5 + the CRITICAL FIXED scar `field3d_uniform_translucent_same_family_surfaces_fuse_with_no_silhouette_cue`):** a metal block is a wall of IDENTICAL spheres — worse than rock salt (one species, one colour) — and glow is brightness (Rule 29), which cannot defeat occlusion. Every state S2–S6 therefore authors an EXPLICIT interior-visibility decision in §6, using only LIVE E3a mechanisms (`lattice.reveal ∈ {none,cutaway,peer_fade}` + `reveal_at_ms` `:54411–54413`, `BS_LATTICE_REVEALS` `:51644`, `BS_PEER_FADE_OPACITY` 0.12 `:51661`, `lattice.radius_scale` `:54416`) plus C-2's always-on-top dot convention. S2's own physics is the first mechanism: the 186 → 102 pm shrink (spheres from touching to 55% of the pitch) OPENS the interstices on screen — a free legibility beat, not merely a size claim.

---

## 6 · Per-state `bonding_scene` authoring detail

Global: `render_annotations: true` and `config.field_lines.opacity: {}` (both mandatory — silent-no-op / blank-scene traps). **Never author `camera` / `camera_position`** (Desk-1 lesson 5). **`eye_capture_ms` at STATE level, never nested** (lesson 3). Annotations carry `at_ms` AND `until_ms` (lesson 4), sit at x ∈ {160, 380, 500} clear of the fixed 220 px right-anchored HUD. **Range-truth discipline (lesson 7, extended per cycle 2 to ALL FOUR string classes): every annotation, delta cue, HUD line and `misconception_watch` string on a state that exposes a control must be specified true (or specified-live, for HUD readings) across that control's whole range** — per-string notes below. **Every `*_from`-less scalar cue key names the DESTINATION of a ramp from 0** (the `pair_shift: 0` scar). Numbers live in the HUD, engine-printed; annotations carry the delta in words; **narration never hand-quotes a digit the HUD derives on the same canvas.** Plain literal English everywhere (Rule 41): the sea does not want, choose, or know; "sea of electrons" is the standard term and stays.

### S1 — "Atoms pack in rows" ⚑ · core · `pack-the-lattice` · **LIVE today (E3a)**
- `placement:'lattice'`, `mode:'lattice_grow'`. `units:[{id:'na', species:'Na', at:[0,0,0]}]`. `lattice:{cell:'bcc', n:[5,5,5], a_pm:429.0, grow_at_ms:3000, grow_duration_ms:14000}` — grow runs 3 000 → 17 000 under the narration (tail 3 s of 20 = 15%, inside the 25% budget); 35 bcc sites (all-even 27 + all-odd 8), under `BS_MAX_SITES` 125; centre-outward, nothing shown moves. `thermal:{T_K:298, jiggle_scale:0.5}`. **`reveal_hold` declared** (jiggle-only tail).
- Geometry SOLVED: bcc nn = a·√3⁄2 = 371.5 pm and 2 × r(Na) = 372 pm on the shared linear-pm scale — the spheres TOUCH, which is what "pack" must read as.
- Interior visibility: `reveal:'none'` — DECIDED: this state's claim is about the outer pattern (rows/pattern at the silhouette); no interior read is asked for. Site labels default OFF on lattice (D-6, `:54428–54433`); no override.
- HUD `['lattice_a']` (a = 429 pm, engine-read `:54514`). No formula surface.
- Annotations: 6500–end (x 380) "The same spacing repeats everywhere"; 15500–end (x 160) "This block is a tiny corner of the metal". No controls → no range duty.
- **Glow map:** every sentence → `lattice`.
- Narration (≈38 w target): every solid metal is atoms packed in a repeating pattern. Watch sodium atoms settle into rows ⚑ — each new atom sits at the same spacing as the last. The block keeps this exact pattern in every direction, through the whole piece of metal.
- `eye_capture_ms: 17600`. Duration 20.

### S2 — "Outer electrons come free" · core · `release-to-sea` · **E3b-BLOCKED (§4 C-10 + C-2)**
- Same block, home pose (32d). `mode:'electron_sea'`. `sea:{count:35, release_at_ms:4000, release_duration_ms:15000}` — release runs 4 000 → 19 000 under its sentences (tail 5 s of 24 ≈ 21%, inside budget). Per C-10: one outer dot per site (BS_VALENCE.Na = 1) departs the site surface; every site ramps Na → Na⁺, charge 0 → +1, radius 186 → 102 pm; Σq(sites) + Σq(dots) = 0 throughout. Cause-first: first dots depart ~4000; core shrink + relabel begins ~4800. **`reveal_hold` declared.**
- **Terminal electron pose (SPECIFIED — S3's 16a beat depends on it): from release end (19 000) to end of state, every dot sits PARKED just off its parent site with small local jiggle — released but not yet roaming.** The roam is S3's delta, not S2's.
- Interior visibility (DECIDED): two mechanisms. (1) **The physics itself: the 186 → 102 pm shrink opens the interstices** — spheres go from touching to 55% of the site pitch, so the block visibly opens as it ionises (the free legibility beat). (2) The per-atom counted claim ("one electron for every atom", D-4) is NOT read by counting 35 interior dots: `lattice:{reveal:'peer_fade', reveal_at_ms:3000, focal_site: interior}` holds the focal interior site + its 8 bcc nearest neighbours solid while the rest ghost at 0.12 (`BS_PEER_FADE_OPACITY` `:51661`) — the count is read on the 9 solid sites, one departing dot each; the ghosted rest release in silhouette. Dots themselves are never occluded (C-2 `depthTest:false, renderOrder 998` convention `:53236–53252`).
- HUD `['valence']` ("outer electrons = 1" — needs C-5). Formula surface (ONE, Unicode): `Na → Na⁺ + e⁻`.
- Annotations: 8000–end (x 160) "Each atom releases one electron"; 15000–end (x 500) "The cores are now positive ions". No controls → no range duty.
- **Glow map:** sentence 1 → `lattice` (the block as it was); sentences 2–3 → `electrons` (ALL dots are the subject here — lighting every dot is correct on this state); sentence 4 → `lattice` (the shrunken cores).
- `misconception_watch` — NONE here (the pivot is S3; this state only sets it up).
- Narration (≈45 w target): sodium holds its outer electron weakly. Watch: every atom in the block releases that one electron at once. The freed electrons stay inside the metal — for now each sits beside the ion it left. Every core is now a positive ion, smaller than its atom.
- `eye_capture_ms: 19600`. Duration 24.

### S3 — "Electrons move everywhere" · core · `sea-roam` · **E3b-BLOCKED (§4 C-2 + C-9)** · **PRIMARY AHA + misconception pivot 1**
- Same block. `mode:'electron_sea'`, `sea:{count:40, speed: moderate}` — deterministic index-seeded roam (D-1). **Opens on S2's terminal parked pose and HOLDS it ~3 s** (32d for the electrons) — the picture the wrong belief expects — then the roam disperses every dot; the TAGGED electron (C-9, elementType `bsc_electron_tag`, the state's glow focal for its opening sentences) visibly crosses several cells from ~4000, passing many cations, and never returns.
- Interior visibility (DECIDED): `reveal:'none'` — justified: (1) after S2's shrink the cores subtend 55% of the pitch, so real sight-lines exist through the block; (2) ALL dots ride C-2's `depthTest:false, renderOrder 998` convention and therefore draw on top of every core — the tagged dot is never occluded anywhere on its path; (3) **D-4 requirement stated for the surgeon: at this state's frozen pin the tagged dot must be pairwise separable in NDC from every other dot** (the seeded paths guarantee it by construction or the seed is re-chosen; asserted in the gate, never eyeballed).
- `misconception_watch`: belief "in a metal each electron still belongs to its own atom"; visual_counter "one tagged electron crosses the whole block, passing core after core, and never returns to the atom it left"; one_line_fix "the outer electrons are shared by the whole crystal — no electron is attached to any one atom." (No control on this state → no range duty.)
- HUD: none. Formula surface (the state's ONE number surface): `n(e⁻) ≈ 2.5 × 10²⁸ per m³` — chemistry-author-ratified (sodium's free-electron density), scale factor named IN NARRATION ("each dot stands for very many electrons"); ratified data, never presented as a derived count.
- Annotations: 7000–end (x 380) "This electron is not attached to any atom"; 15000–end (x 160) "The sea of electrons holds the cores together".
- **Glow map:** sentences 1–2 (the tagged dot's journey) → `electron_tag` (C-9 — ONE dot lit, Rule 32e); sentence 3 ("every free electron does this") → `electrons`; sentence 4 (the bond) → `lattice`.
- Narration (≈48 w target): now watch one electron. It moves right across the block, past core after core, and it never goes back to the atom it left. Every free electron does this — one shared sea through the whole crystal. The pull between the positive cores and this negative sea is the metallic bond.
- `eye_capture_ms: 15600`. Duration 25.

### S4 — "Field adds slow drift" · core · `bias-the-swarm` · **E3b-BLOCKED (§4)** · misconception pivot 2
- Same block, sea established. `mode:'drift'`. `sea:{count:40, speed: moderate, field:1.0, show_drift:true}` + `field_at_ms:5000` (destination-valued; arrows fade in across the block over ~900 ms — elementType `bsc_arrow`, so the `arrows` glow key binds them — the bias appears ~800 ms later). Random roam CONTINUES at full amplitude beneath the bias.
- Interior visibility (DECIDED): `reveal:'none'` — same justification as S3 (open post-shrink lattice + always-on-top dots); the drift arrow is an overlay mesh, never buried.
- `{id:'field', min_ring:'core'}` — scripted cue + live slider share `field` ⇒ **drag-seize required**.
- HUD `['drift']` — engine-derived via the C-3 model (`v_d = μE`, ratified μ, slider → E mapping fixed in §4). **Range-truth across the field slider, all four string classes:** HUD — specified to read `v_d = 0 m/s` live at `field = 0` (never "—", never stale) and to track every drag; delta cue — "Field adds slow drift" is arc-fixed and stays honest at every slider value because the HUD's live zero is on the same canvas (at 0 field the cue names the state's scripted mechanism, the HUD shows its current value); annotations — mechanism-worded below; watch strings — qualitative (no digit).
- **Cross-link (shipped physics concept `drift_velocity`, master):** the same two-speed picture that concept teaches on a copper wire (`src/data/concepts/drift_velocity.json` STATE_3/4). Narration names the link in one plain sentence; json-author records it as an advisory cross-reference in the concept notes (no pill wiring — Gate 8b).
- `misconception_watch`: belief "metals conduct instantly because the electrons move very fast"; visual_counter "the field appears everywhere at once while the counter shows a very slow net drift — the fast random motion carries no current; the slow shared drift is the current"; one_line_fix "the FIELD acts on every electron at once; each electron itself only drifts very slowly — that slow shared drift is the current." (Qualitative — true at every field value.)
- Annotations (range-true across the field slider): 3000–9000 (x 160) "The same random motion as before" (true at every field value — the roam never changes); 10000–end (x 500) "The stronger the field, the faster the drift" (mechanism wording — true at every slider position INCLUDING zero).
- **Glow map:** sentence 1 (field appears) → `arrows`; sentences 2–3 (the sea's drift, the counter) → `electrons`; sentence 4 (heat) → `electrons`.
- **Rule 33 note (recorded partial — see §13 g):** the taught variable (current) is macroscopic and no macroscopic object is on canvas; deliberate, recorded, not dismissed.
- Narration (≈55 w target): connect this metal in a circuit and an electric field appears through the whole block at once. Watch the sea: the same random motion, plus a very slow net drift along the field — the counter shows how slow. That slow shared drift is the electric current. The same free electrons also carry heat through the metal.
- `eye_capture_ms: 13000`. Duration 28.

### S5 — "Same shift, no split" · core · `layer-shift-hold` ⇄ · **E3b-BLOCKED (§4)** · SUPPORTING aha
- Same block, field off, unslid home pose on entry. `mode:'layer_shift'`. `shift:{at_ms:6000, duration_ms:3000, offset_sites:1, plane: horizontal mid-plane}`. The sea keeps roaming through BOTH halves throughout (screening visible, not asserted). Derived outcome (D-2): the block holds; flipping the charge pattern must flip hold ↔ split with no authored change (gate assertion 8).
- **The POSITIVE, MOVING confirmation (cycle-2 fix — the payoff is no longer defined by absence): after the slide completes (~9000) the interface cores visibly RE-SEAT into the equivalent lattice sites (§4 S5-row settle beat, ~10000–12500), and the block reads as the identical pattern one row over.** The counter (`like_contacts`, the fixed cross-concept readout) stays on canvas reading 0 throughout — a live derived zero at every offset, never stale — while the re-seat gives the eye a real event to confirm the hold. `eye_capture_ms` moved to photograph the re-seated block.
- Interior visibility (DECIDED): `reveal:'none'` — the taught motion is of WHOLE layers, read at the block's silhouette; the interface sites are the `layer` glow focal during the slide; the sea's screening is read via the always-on-top dots between the faces.
- **Declared contrast pair** with `ionic_bonding` S6 `layer-shift-snap`: same motion, same `like_contacts` readout, opposite outcome — 0 → 0 here vs 0 → 6 there. Definition BINDING from ionic §5.2. "0 → 0" is the design expectation: if the derived count is not 0, that is a **STOP-AND-REPORT discrepancy** — never tune the metric or hand-type the digit.
- `{id:'shift', min_ring:'core'}` — **drag-seize required**.
- HUD `['like_contacts']` (derived; specified LIVE at every slider offset). No formula surface.
- Annotations (range-true across the shift slider): 7200–11000 (x 380) "The sea sits between every pair of cores" (true at every offset); 12000–end (x 160) **"Salt split at this step — the metal holds. The pattern after the slide is the same pattern as before."** (the on-canvas contrast word the sound-off read needs; the second sentence is the positive re-seat fact — both true at every dragged offset ≥ the completed slide, and the first clause is a cross-concept recall, not a claim about the live slider).
- **Glow map:** sentence 1 (salt recall) → `layer` (the about-to-slide layer); sentence 2 (the slide + counter) → `layer`; sentence 3 (the sea between cores) → `electrons`; sentence 4 (re-seat; bend and draw) → `layer`.
- Narration (≈53 w target): in salt, this same one-site slide lined up like charges and the crystal split. Slide the metal's top layer. The counter stays at zero: the sea sits between the cores at every position. The layer settles into the same pattern one row over — so metals can be bent and drawn into wires.
- `eye_capture_ms: 13200`. Duration 27.

### S6 — "More electrons, stronger hold" ⚑ · **extended** · `valence-ladder` · **E3b-BLOCKED (§4)**
- SAME block, SAME cell, SAME core radius, NO element label (Checkpoint-A decision 3). `mode:'electron_sea'` with the C-4 step cue: `sea:{valence_from:1, valence_at_ms:5000, valence_step_ms:4500}` → 1 at open, 2 at ~5000, 3 at ~9500 (stepped closed-form; dwell under each explaining sentence). Sea count scales ∝ valence (35 → 70 → 105, within C-2's `BS_MAX_SEA`); core charge labels step +1 → +2 → +3 (Σq balanced). Cores held at ONE size; the cell stays unlabelled.
- Interior visibility (DECIDED): `reveal:'none'` — the counted claim ("electrons per atom: 1 → 2 → 3") is READ FROM the slider value and the chart's x-axis, never by counting dots (C-2 ceiling note: at 70–105 dots the swarm is texture under the stated scale-factor convention); the stepping charge superscripts are read on the front sites.
- Row-O trend panel (LIVE, E2): `trend:{show:true, x_label:"Free electrons per atom", y_label:"ΔH of atomisation / kJ·mol⁻¹", points:[{label:'Na', x:1, y:107},{label:'Mg', x:2, y:146},{label:'Al', x:3, y:326}]}` — no `extrapolate_from`; labels plain-ASCII species keys (contract trap 1). Live highlight follows the valence value (C-8). The DATA points carry the real metals; the CELL stays unlabelled — the chart is evidence, the block is the model.
- **ONE instrument (D-3 / Rule 34b — cycle-2 fix): the chart is this state's only ΔH surface. NO `atomisation` HUD line here** — a HUD line echoing the highlighted point would (a) double-print the same quantity and (b) implicitly name the unlabelled bcc cell as Mg at valence 2 (Mg is hcp) — the mislabel decision 3 forbids. `atomisation` appears in S7 only, where the metal is named. HUD: none. No formula surface (the trend panel is the state's one symbolic surface).
- ΔH values are chemistry-author-RATIFIED published values with the convention named (§4 C-1); never hand-rounded; the chart prints them, narration quotes none.
- `{id:'valence', min_ring:'ext'}` — **drag-seize required** (scripted step + live slider share the quantity).
- Annotations (range-true across the valence slider): 6000–end (x 160) "Each step adds one electron per atom and one unit of core charge" (mechanism wording — true at every slider value); 11500–end (x 500) "More charge, more sea: a stronger hold" ⚑ (relational — true at every value). **Range-truth, other classes:** the chart highlight is specified to sit on the Na point at valence 1, Mg at 2, Al at 3 for ANY source of the value (script or drag); delta cue is arc-fixed ⚑.
- **Glow map:** sentences 1–2 (the step; the charges) → `lattice`; sentence 3 (the sea thickens) → `electrons`; sentence 4 (the chart climbs) → `trend` (the E5 eleventh key `:55317` — the exact defect class E5 ended, bound here by design).
- Narration (≈45 w target): keep the same lattice and change one thing: how many electrons each atom gives to the sea. One, then two, then three. Each step also raises the charge on every core. The chart shows the energy needed to pull one mole of atoms out: it climbs steeply. More shared electrons, stronger metal.
- `eye_capture_ms: 12500`. Duration 24.

### S7 — Explore · core · `interaction_complete` · **E3b-BLOCKED (§4)**
- `mode:'explore'`. Controls: `{metal, core}` · `{field, core}` · `{shift, core}` · `{valence, ext}`. The metal picker's options are **ENGINE-OWNED** — hardcoded Na/Mg/Al in the DOM string (`bsc_metal_select` `:53419`); `config.explore_species` / `explore_units` are the MOLECULE and free-species dropdowns of other scenes (`:53377–53378`, `:53397–53398`) and are **NOT authored here** — authoring them would inject three bogus atom entries into the molecule dropdown. The picker swaps species + TRUE cell + a_pm + valence together from C-1's `BS_METALS` (Na bcc 429.0 · Mg hcp 320.9 · Al fcc 404.9 — all three touch-solved in C-1). Valence-drag detach semantics per C-7 (unlabelled model metal; element-tied data lines blank to "—"; `drift` keeps printing its live value).
- HUD: `['lattice_a', 'drift', 'melting_point', {id:'atomisation', min_ring:'ext'}]` — melting point HERE as context only (decision 2), engine-printed from `BS_METALS.mp_K`. **If C-6 is descoped: `atomisation` leaves this HUD entirely** (§4 C-6 fallback — 38b then holds by removal). No formula surface (core-only sandbox, Rule 38b). Narration 0/open. Explore idle auto-sweep keeps it moving (contract trap 6; Rule 37 free-run).
- **Rule 38b check:** every control core except valence (ext-gated row); every core-ring HUD symbol established in core states (a → S1, drift → S4; m.p. is a plain everyday quantity used as context); `atomisation` ext-gated or absent. ✓
- **Lesson-7 duty (breach if skipped): hand-drive EVERY picker metal through EVERY control's full range before ship**, and record readings: all three metals × field 0 → max (drift HUD tracks live, `v_d = 0` at zero, ≈1×10⁻⁴ m/s full-scale per the C-3 mapping); all three metals × shift 0 → max (`like_contacts` derives 0 at every offset for every metal — non-zero = STOP and report); valence drag on each metal (C-7 detach fires; labels and data lines blank correctly; drift keeps printing); hcp fit-solve framing for Mg (never author `camera`); melting-point line swaps per metal.
- Duration 30 (free-run).

---

## 7 · Misconception confrontation plan (Rule 16a)

Exactly **two** `misconception_watch` entries — genuine pivots only, never a per-state tic.

| Wrong belief | Confronted at | How (contrast beat, no predict→reveal) |
|---|---|---|
| "In a metal each electron still belongs to its own atom" | **S3** (the Phase-0 pivot) | Opens on S2's terminal PARKED pose — every dot beside the core it left, exactly the picture the belief expects — holds ~3 s, then the roam disperses them and ONE tagged electron (C-9) visibly crosses the whole block and never returns |
| "Conduction is fast because the electrons move fast" | **S4** | The field appears everywhere at once while the drift HUD shows a very slow live value — fast random motion carrying no current beside a slow shared drift that IS the current (cross-linked to the shipped `drift_velocity` physics concept) |

**Planting-risk management (no pre-spoil):** S2 necessarily shows each atom releasing "its" electron — the exact picture that plants belief 1 — **and its terminal parked pose is DELIBERATE STAGING: it builds the confident wrong picture at full strength so S3's roam breaks it.** S2's strings never say the electron stays with or belongs to its atom after release ("for now each sits beside the ion it left" — literal, temporary, true). S4's "field appears at once" phrasing never says any electron moves fast along the wire. No EPIC-C branches (EPIC-L-first).

---

## 8 · Deep-dive states + drill-down clusters (`has_prebuilt_deep_dive` = cache hint, not a gate)

| State | Why invest | Clusters |
|---|---|---|
| **S3** | The PRIMARY aha; delocalisation is the concept every later topic stands on | `who_shares_the_electrons` · `sea_vs_covalent_sharing` · `why_sharing_lowers_energy` |
| **S4** | Two documented confusions meet here (fast-electron belief; drift vs signal speed); exam-favourite "why do metals conduct when solid" | `drift_vs_random_speed` · `why_the_field_acts_everywhere` · `metal_vs_molten_salt_conduction` |
| **S5** | Malleability/ductility-vs-brittleness is the most-asked property contrast; feeds alloy questions | `bend_vs_shatter` · `why_layers_slide_easily` · `why_alloys_are_harder` |

---

## 9 · `entry_state_map`

```
foundational:          STATE_1 → STATE_3   # "what is metallic bonding / electron sea"
conduction:            STATE_4             # "why do metals conduct electricity / heat"
strength_and_shaping:  STATE_5 → STATE_6   # "why do metals bend / what makes a metal strong"
```
Default `foundational`. **Foundational-coverage rule satisfied** — the PRIMARY aha (S3) closes the foundational slice.

---

## 10 · Prerequisites (advisory, Rule 23)

- `ionic_bonding` (Desk-2 sibling, `feat/chemistry-ionic-metallic`, unmerged) — S5's contrast is against its S6 cleavage beat. Cliff patched inline (§12); the state stands alone without it.
- `bohr_model_energy_levels` (shipped, master) — "outer electrons are held weakest" (S2).
- `drift_velocity` (shipped physics concept, master) — S4's two-speed picture; advisory cross-link, no gating.

---

## 11 · Real-world anchor (Rule 35 / 38f)

**Primary: a metal spoon bends; a salt grain shatters.** Universal, culture-neutral, physics-true — the bend IS S5's derived hold + re-seat, and the contrast pair across the two concepts is the wave's designed payoff. **Secondary (S4): the copper wire in any charger cable** — a widest-syllabus-overlap device; the current in it is literally S4's slow drift (the shipped `drift_velocity` concept's own anchor family), and the same sea carries the heat you feel in the cable.
**Rejected candidates (recorded):** aluminium drink can (bend beat weaker than the spoon; regional in form); gold jewellery (culture-adjacent, Rule 35 risk); railway track / power-grid pylons (region-flavoured infrastructure); blacksmith forging (romantic-historical register, Rule 41 risk).

---

## 12 · Two-pass cognitive lens

### Block 1 — strategic

**Prerequisite cliffs.** (1) Shell model → breaks at **S2**; patch: first sentence says "sodium holds its outer electron weakly" — no configuration notation at core ring. (2) `ionic_bonding` S6 → breaks at **S5**; patch: S5's opening clause re-states the salt outcome literally ("in salt, this same one-site slide lined up like charges and the crystal split") — complete for a student who never saw it, a recap for one who did. (3) `drift_velocity` → breaks at **S4**; patch: none needed beyond the state itself (it SHOWS both speeds); the cross-link sentence is enrichment, not a dependency.

**Exam-backwards trace.** *"Explain why (a) magnesium conducts electricity and heat in the solid state, (b) magnesium is malleable and ductile while magnesium oxide is brittle, and (c) aluminium's enthalpy of atomisation is about three times sodium's."* Pieces → states: lattice of cations + delocalised sea → S1–S3; electrical conduction = mobile delocalised electrons → S4; thermal conduction = the same sea carries heat → S4 (final clause); malleability/ductility = layers slide + re-seat, sea screens like-charge contact → S5 (ionic S6 is the brittle half); ΔH_at ∝ electrons per atom + core charge → S6. **No missing piece; no state fails to serve the trace.**

**Misconception entry mapping.** Belief 1 planted by dot-and-cross diagrams AND by our own S2 per-atom release — managed per §7 (the parked pose is the deliberate staging); confronted proactively at S3. Belief 2 planted by everyday "electricity is instant" experience; confronted at S4 with the live drift readout.

### Block 2 — aha designation

- **PRIMARY aha (S3):** *"No electron in a metal is attached to any one atom — one shared sea through the whole crystal is the bond."*
- **SUPPORTING aha (S5):** *"The same layer slide that shattered salt leaves the metal whole — the sea sits between the cores at every position, and the layer settles into the same pattern one row over."* Reinforces the primary (only a SHARED sea can screen every position) and is the cross-concept payoff the desk pairing exists for.
- **Cohesion:** S5 depends entirely on S3's sea; S4 and S6 are consequences, deliberately NOT ahas. 1 primary + 1 supporting.
- **Wrong-belief setup:** for S3 — S1/S2 build the confident per-atom picture (atoms pack; EACH atom releases ITS electron, which then sits parked beside it), so the roam breaks an earned expectation at full strength. For S5 — the ionic prerequisite plus S1's rigid ordered lattice build "ordered lattice ⇒ shatters like salt"; S5 breaks it with a positive re-seat and a counter pinned live at 0.
- **Foundational coverage:** S3 ∈ foundational ✓.

**Cross-references:** deep-dive picks (S3/S4/S5) and cliff states (S2/S4/S5) overlap at S4/S5 and diverge at S2 vs S3 — documented reason: the S2 cliff is fully patched by one inline sentence (cheap), while S3 is where the concept's defining confusion concentrates (expensive, worth pre-authoring).

---

## 13 · Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the seven of §2, ids `STATE_1`–`STATE_7`, contiguous.

**(b) Symbol-label table (all real Unicode — Rule 34c across DOM + canvas/chart text + sprite labels):**

| Spoken quantity | On-canvas label |
|---|---|
| sodium atom / sodium ion (core) | `Na` / `Na⁺` |
| a released electron | `e⁻` |
| core charge steps (S6) | `+1` · `+2` · `+3` (site superscripts via `bscSpeciesLabel`) |
| cell edge (HUD) | `a = 429 pm` |
| electron density (S3 formula surface) | `n(e⁻) ≈ 2.5 × 10²⁸ per m³` |
| drift speed (HUD, live) | `v_d = 0 m/s` … `v_d ≈ 1 × 10⁻⁴ m/s` (engine-printed, C-3 model) |
| like-charge contacts (HUD, live) | `like contacts: 0` |
| atomisation enthalpy (S7 HUD + S6 chart axis) | `ΔH = 326 kJ·mol⁻¹` · `ΔH of atomisation / kJ·mol⁻¹` |
| melting point (explore HUD, context) | `m.p. = 371 K` |
| free electrons per atom (slider + chart axis) | `Free electrons per atom` |
| reaction ledger | `Na → Na⁺ + e⁻` |

**(c) Balanced-equation ledger plan (chemistry variant; RHR N/A):** S2 shows `Na → Na⁺ + e⁻` (no state symbols — the release happens inside the solid; convention stated in the chemistry block). Oxidation-number labels not used (the stepping charge labels carry it). Particle-count scale factor: S3's "each dot stands for very many electrons" narration clause, with the ratified n on the formula surface; C-2's sea ceiling makes the dot count explicitly a texture convention.

**(d) Motion plan:** per §6. No passive state; every ramp retimed under its sentence with tails ≤ 25%; `reveal_hold` DECIDED (declared on S1 + S2, not needed S3–S6); S5's payoff is a positive moving re-seat, not an absence.

**(e) Modes:** `lattice_grow` (S1, LIVE E3a) · `electron_sea` (S2, S3, S6 — E3b) · `drift` (S4 — E3b) · `layer_shift` (S5 — E3b) · `explore` (S7 — mode LIVE, behaviours E3b). §4 is the block map.

**(f) assessment + coverage_map + misconception_watch:** watch at S3 + S4 only. Assessment stems (chemistry_author authors; coverage_map maps each to states): 1. describe metallic bonding in terms of cores and delocalised electrons (S1–S3); 2. explain why metals conduct electricity in the solid state while ionic solids do not (S4, cross ionic S8); 3. explain why metals are malleable and ionic crystals brittle (S5, cross ionic S6); 4. (extended) explain why ΔH_at rises Na → Mg → Al (S6); 5. state what happens to each atom when a metal forms (S2); **6. explain why metals are good conductors of HEAT (S4 — the same delocalised sea carries energy); 7. define malleable and ductile, and explain both with the layer slide (S5).**

**(g) Macro↔micro plan (Rule 33) — per state, no blanket argument:**
- S1–S3: the taught variable is itself microscopic (structure and delocalisation) — no macro band owed; the zoom-link is S1's "tiny corner of the metal" annotation.
- S4: **recorded deliberate PARTIAL.** The taught variable (current) is macroscopic and NO macroscopic object is on canvas — no wire, no circuit, no ammeter; 33a is not met on-screen. `bonding_scene` has no wire/circuit primitive and adding one is engine scope (the alarm rule), so the macro half is carried by the anchor sentence (the charger cable) and the advisory `drift_velocity` cross-link — whose particle_field sim DOES show the macro wire + instruments. Recorded here so quality-auditor and founder-proxy judge it as a decision, not an omission.
- S5: 33 satisfied — the block IS the macro object (the sliding, re-seating layers ARE the bend a spoon makes) and its interior IS the micro story, with the live counter as the instrument.
- S6: 33 satisfied at the data level — the trend chart is the macroscopic instrument (real measured ΔH_at values) sitting beside the micro mechanism (the thickening sea), one glow focal at a time.
- Instruments: the fixed 220 px HUD carries every live number a state owns (S1 a; S2 valence; S4 v_d live incl. 0; S5 like_contacts live; S7 all).

**(h) Canvas budget (Rule 34):** at most ONE formula/number surface per state (S1, S4, S5 carry none; S3's is the ratified n; S6's one surface is the trend panel — **no HUD echo of the chart's quantity, D-3**), caption = the ≤5-word delta cue only, prose in the subtitle strip, value-only HUD, all math Unicode (superscripts via `bscSpeciesLabel`; `×`/`⁻`/`≈` never ASCII), annotations at x ∈ {160, 380, 500} clear of the 220 px HUD, top-anchored panels at `top: 52 px`+.

**(i) Curriculum-flex (Rule 38):**
- **(i-1) Ring-cut walk.** Cut A (hide extended = hide S6): S1–S5 + S7 is coherent — no surviving narration, caption, delta cue or formula surface references the valence ladder, ΔH_at, Mg or Al BY TEACHING (S7's metal picker offering Mg/Al is manipulation of core content — packing and conduction are core — not a reference to S6's ladder); S7's valence row hides (ext-gated) and its `atomisation` HUD line hides (C-6) **or is absent entirely (C-6 descope fallback)** — 38b holds on both branches. Enforcing rule for downstream agents: no S1–S5 string may mention electron-count comparison or any ΔH number. Cut B (hide advanced + extended): **identical to Cut A** — no advanced ring exists. Both cuts walked against every string intent in §6.
- **(i-2)** Explore surfaces CORE only (§6 S7 check, incl. the C-6 fallback). ✓
- **(i-3) `curriculum_tags` (CLAIMS, 38g) — with the NCERT caveat carried:** CBSE/NCERT `partial, verified: true` — the rationalised NCERT removed the Solid State unit, so metallic bonding survives in CBSE only in thin descriptive form (Cl.11 Ch.4 mentions it qualitatively); the depth here EXCEEDS the current CBSE floor by design. JEE/NEET `partial, needs_teacher_verification: true`; IGCSE `full, needs_teacher_verification: true`; A-level `full, needs_teacher_verification: true`; IB DP `full, needs_teacher_verification: true`; AP `partial, needs_teacher_verification: true`. Enlarges the standing international-verification gap; recorded, not closed.
- **(i-4) Presets (hide, never reorder — 38h/25d):** `full` = S1–S7; `core` = S1–S5 + S7. No teacher-visible preset until 38g verification.
- **(i-5) Graph axes (38e):** one chart exists — S6's trend panel, ΔH_at (y) vs free electrons per atom (x). No board publishes a conflicting axis convention for this plot; decided as-authored, N/A for the axis-swap toggle. Stated deliberately.

---

## ⚑ FOUNDER CALLS (arc-fixed strings — recorded verbatim, NOT changed here)

Both items change strings fixed by the Phase-0 arc table, so they are the founder's call at Checkpoint A review, not the architect's:

1. **S1 "rows".** The delta cue "Atoms pack in rows" and the narration's "settle into rows" are slightly untrue for bcc — the body-centre sites are not in the corner sites' rows, and that is visible in the grown block. "Atoms pack in a pattern" is 4 words and true. (Skeleton keeps the arc strings, marked ⚑ at every occurrence.)
2. **S6 "hold" (noun).** The title/delta cue "More electrons, stronger hold" and the annotation "a stronger hold" use the register family Rule 41a bans alongside "grip"; "stronger bond" or the arc's own "stronger metal" is literal. (Kept as arc-fixed, marked ⚑.)

---

## 14 · Scar-compliance + engine-bug-queue note

- `query_engine_bug_queue.ts` was ATTEMPTED from this worktree and cannot run: no `.env.local` exists here (verified; `Missing Supabase env vars` on fallback), and the script is additionally a **known false-all-clear on chemistry concepts** (hardcoded physics concept list — the σ/π session's OPEN scar). **Flagged to quality_auditor: run the live Gate-8 query from a credentialed session before Checkpoint B.** Compliance below is built from the FIELD3D checklist rows Phase-0 enumerates + the scars named in renderer source + the contract file + all fourteen Desk-1 defects.
- Applied above: `render_annotations: true` · `config.field_lines.opacity: {}` · state-level `eye_capture_ms` (never nested) · `at_ms` AND `until_ms` on every annotation · no `camera`/`camera_position` anywhere · destination-valued cues only · drag-seize on S4 `field` / S5 `shift` / S6 `valence` · `top:52px` clearance · **no frozen tail: ramps retimed to ≤25% tails and `reveal_hold` DECLARED on S1/S2 (no conditional)** · explore idle auto-sweep (LIVE) · `pmCreateAutoLabel` for every changing label (the C-10 Na → Na⁺ site labels named explicitly) · no backticks destined for the template · D-6 label budget (lattice labels default OFF) · **D-5 interior-visibility decision authored on every lattice state S2–S6 (§5 + §6), citing the fused-surfaces CRITICAL scar** · closed enums only — every key §6 uses that does not exist today is a named C-item in §4; **`explore_species`/`explore_units` are NOT authored (they feed the molecule/species dropdowns `:53377–53398`, not the metal picker — cycle-2 correction)**.
- **Desk-1 lessons 1–9 + the four extra disciplines applied:** every engine claim grep-verified with line numbers (including overturning the brief's "S2 buildable today" and cycle-1's own `radius_pm` claim); THE EYE green = start of review; durations on the PLAYER's 2.16 w/s clock; engine-printed numbers only — **narration now quotes NO derived digit anywhere (S4 gone qualitative)**; range-truth extended to all four string classes (annotations, delta cues, HUD lines, watch strings) on every controlled state; explore hand-drive duty with expected readings (§6 S7); no hand-rounding of anything the engine fits or derives; HUD treated as a fixed 220 px box; lattice geometry solved numerically for ALL THREE metals (C-1).
- **Per-sentence glow maps** authored for every state (§6) against the ELEVEN-key enum (+ C-9's requested twelfth) — no sentence subject left unbindable (the E5 lesson, applied one desk later instead of recurring).
- **Rule 40/40a note:** this skeleton requests engine work (§4) for a SEPARATE `field3d-surgeon` dispatch on master — nothing here is a licence to touch `field_3d_renderer.ts` on this branch. Pre-existence: `git log --all -S "electron_sea"` shows the mode string only in the bonding_scene enum (no prior swarm build to collide with). C-10 carries its own regression guard because it modifies E3a-shipped code `ionic_bonding` depends on.

**NCERT check line:** Consulted NCERT Chemistry Cl.11 Ch.4 index to confirm scope (metallic bonding: brief qualitative mention; Solid State unit removed in the rationalised syllabus — caveat carried into §13 i-3). No teaching method, example problem, or figure imported. Exemplar consulted for misconception beliefs only.

---

## 15 · Self-review

- [x] Atomic claim one sentence; deferrals named — alloys deferral now recorded WITH its board evidence (§1)
- [x] 7 states — FIXED arc implemented unmodified; rings/archetypes/delta cues/controls untouched; three Checkpoint-A decisions honoured verbatim; ⚑ strings preserved and flagged, not changed
- [x] Per-state control table complete (player-clock durations, re-derived after cycle-2 retimes); no archetype repeat except the DECLARED pair; no static state; tails ≤25% with `reveal_hold` decided
- [x] Rule 32 plan (§5, incl. D-5 interior-visibility law + eleven-key glow enum + per-sentence glow maps) · Rule 33 per-state with S4's partial RECORDED (§13 g) · Rule 34 budget incl. D-3 one-instrument on S6 (§13 h) · Rule 35/38f anchor with rejected candidates · Rule 41 throughout
- [x] Rule 38: rings tagged; S6 the only extended, contiguous before explore; BOTH cuts walked; explore core-only on BOTH C-6 branches (built or descoped); tags as claims with the NCERT Solid-State caveat; presets; 38e stated
- [x] misconception_watch at exactly 2 genuine pivots; no predict→reveal; no `wait_for_answer`; planting risk managed via the SPECIFIED S2 terminal pose
- [x] 3 deep-dive states × 3 clusters · entry_state_map with foundational containing the PRIMARY aha · prerequisites advisory · drift_velocity cross-link recorded (S4)
- [x] DoD complete, zero TBDs (no conditional clauses remain); chemistry ledger plan in place of RHR; all ratification duties named (BS_METALS 15 cells + all-three-metals geometry, n, the μ/v_d model + slider mapping)
- [x] E3b block map complete per state with exact capabilities + source line numbers; TEN new capabilities C-1…C-10 incl. the C-9 tag focal and the C-10 ionisation ramp with its byte-identical transfer regression guard; C-6 descope fallback named
- [x] Gate 12 ✓ (`manual_click` ×6 + `interaction_complete`) · Rule 19 ≥3 primitives/state achievable everywhere
- [x] Registration site #1 only · `explore_species`/`explore_units` correctly NOT authored (cycle-2 fix)
- [ ] Engine bug queue script run — ATTEMPTED, blocked (no worktree credentials + known chemistry false-all-clear) — **flagged to quality_auditor**

**⛔ STOP AND REPORT items: NONE against the arc.** Report-level (unchanged from cycle 1): (1) the brief's "S1–S2 are buildable today" is HALF wrong — S2 is E3b-blocked (§4, grep-cited); only S1 builds today. (2) S5's "0 → 0" and S6's ΔH digits are design expectations — if the shipped derived metric or the ratification pass disagrees, that becomes a STOP-AND-REPORT at build time, never a tuning exercise.

**Escalations (2):** (1) **E3b must be dispatched** (`field3d-surgeon`, master, ONE bug_class per dispatch) before S2–S7 are buildable — §4 here plus ionic §4/§5 are the joint dispatch input; the ten metallic-only capabilities C-1…C-10 must be in scope explicitly (above all `BS_METALS` with its engine-owned-picker coupling, the C-10 ionisation ramp with its `ionic_bonding` regression guard, and the C-6 hud-line ring-gating with its named descope fallback) or they will be discovered mid-build (the alarm rule). (2) The following are ENUM/SHAPE AMENDMENTS under the Phase-0 freeze rule and must be written into `docs/CHEMISTRY_PHASE0_BONDING.md`'s contract BEFORE json-author opens: the `sea.*` cue keys (`release_at_ms`, `release_duration_ms`, `valence_from`, `valence_at_ms`, `valence_step_ms`), the `{id, min_ring}` form of `hud_lines` (C-6), and the twelfth glow key `electron_tag` (C-9).
