# Phase 0 — the Periodicity wave (NCERT Cl.11 Ch.3, *Classification of Elements and Periodicity in Properties*)

> **Status: PLANNING ARTIFACT (Rule 17) — v4, 2026-08-06, desk `feat/chemistry-periodicity`.**
>
> **v4 = the §Config contract rewritten against the APPLY PATH.** The `atomic_and_ionic_radius`
> Checkpoint A returned `DESIGN_FIX` with seven P1s, and **five of them were this document** — the
> contract described what the builds *intended* rather than what the merged code *does*. The architect
> followed it faithfully and produced an unbuildable skeleton, so the fault is the contract's. §Config
> contract now carries a **DOES NOT EXIST** section naming every divergence with its call site, and
> the union walk gains a **CONTROL column** (the third recurrence of the union scar, in a direction
> the previous two fixes could not cover). Build 4 is scoped from these findings.
>
> **v3 = Checkpoint A cycle 2 applied.** Cycle 2 returned **`DESIGN_OK` on §0b** (the state arcs —
> rings, ordering, cues and misconception placement all cleared, ring cut re-run in both directions
> across the concept seam) and **blocked §0c** on three engine-spec defects. All are applied; see
> §Cycle-2 changelog. The reviewer stated no further design cycle is required.
>
> **v2 = Checkpoint A cycle 1.** `DESIGN_FIX` on v1 with eight P1s and nine P2s, all applied — see
> §Cycle-1 changelog.
>
> **Gate status: the DESIGN is cleared. The ENGINE DISPATCH is not yet triggered** — it lands on
> master, never in this desk (Rule 40), and is the founder's call. The two-cycle cap is spent:
> v3 is a spec edit against a diagnosed finding list, not a redesign.

---

## Why this chapter, and why now

The founder's ranking test (2026-08-05): **how many boards teach it, Indian *and* international.**
Ch.3 Periodicity is the only remaining chemistry chapter whose core concepts score 6/6. Chemical
Bonding was closed ahead of it and its tail deliberately left: MO theory is the chapter's biggest
remaining topic and scores **2/6** (CBSE + JEE only — absent from IB DP and AP).

This does not re-open the Session C5 ranked list, which orders by
(irreplaceability × curriculum weight ÷ renderer dependency) and is an explicit flexible default.
Periodic trends sits in it at **P2 #11**; this wave promotes it and takes the chapter around it.

---

## 0a — CHAPTER SURVEY

### Every section, measured

| § | Topic | Tier | Verdict |
|---|---|---|---|
| 3.1 | Why classify elements | — | ❌ text |
| 3.2 | Genesis — Döbereiner, Newlands, Mendeleev | — | ❌ history; a board and a table do this better |
| 3.3 | Modern periodic law, present form of the table | — | ❌ whiteboard |
| 3.4 | Nomenclature for Z > 100 | — | ❌ text |
| 3.5–3.6 | Electronic configuration → s/p/d/f block structure | ⭐ | The table's shape *is* the filling order, but a static diagram carries most of it. **The subshell-ordering half is NOT deferred — it is pulled into `atomic_and_ionic_radius` S8** (see §0b, Ruling 6a) because two later states stand on it |
| **3.7.1 a/b** | **Atomic and ionic radius** | 💎 | The cause is invisible. A board draws two circles and asserts why. It cannot show one shell pulled tighter as nuclear charge rises, nor an isoelectronic series where the electron count never changes and the radius falls anyway |
| **3.7.1 c** | **Ionisation enthalpy** | 💎 | The successive-IE staircase exposes shell structure by *where it jumps*; the Be/B and N/O anomalies are where the screening model measurably fails. Both are quantitative motions |
| 3.7.1 d | Electron gain enthalpy | ⭐ | Same machinery, opposite sign. Deferred — ledger |
| 3.7.1 e | Electronegativity | ⭐ | Partly served already by `bond_polarity_dipole_moment`. Deferred — ledger |
| 3.7.2 | Valence periodicity, anomalous 2nd-period behaviour | — | ❌ whiteboard |
| 3.7.3 | Periodic trends and chemical reactivity | ⭐ | Downstream of both diamonds. Deferred — ledger |

### Curriculum reach — Rule 38g CLAIMS, every non-CBSE cell needs a teacher of that board

| Concept | CBSE | JEE/NEET | IGCSE | IB DP | AP | A-level | Intersect |
|---|---|---|---|---|---|---|---|
| **Atomic & ionic radius** | full (§3.7.1) | full | full | full | full | full | **6/6** |
| **Ionisation enthalpy** | full (§3.7.1) | full | full | full | full | full | **6/6** |

The first wave whose built concepts are 6/6 on every board — even VSEPR is `partial` on IGCSE.
Ch.3 survived rationalisation intact, so neither concept carries a CBSE caveat, and the chapter is
already plumbed (`CHEMISTRY_CHAPTER_NAMES[3]`, `src/lib/chemistryCatalog.ts:27`).

**Standing gap:** fourteen concepts deep, not one international `curriculum_tags` cell has been
confirmed by a teacher of that board. Every non-CBSE cell above ships
`needs_teacher_verification: true`. This wave enlarges that gap; it does not close it.

### Does an existing scenario stretch?

Measured against this desk's code (`origin/master` `914124b`). **Every claim below carries the call
site it was read from, and each was independently re-verified in cycles 1 and 2** — six call-site
misreads were made across three rounds, all one class. See §Cycle-2 changelog for the binding
countermeasure: a claim needs its call site, the sweep that found every *other* site, and **when
that site executes**.

| Surface | Stretches? | Evidence |
|---|---|---|
| `field_3d` · `orbital_shapes` | **Partly — shape yes, Z no, and the library is short** | Geometry is genuinely derived from hydrogenic functions, but every entry is Z = 1: `OS_ORBITALS:58015` has no `zEff`, `osROutUnits:58240` converts with a bare `OS_A0`. The library holds **six** entries — `1s, 2s, 2p_x, 2p_y, 2p_z, 3d_xy` — with **no 3s, 3p or 4s** |
| `field_3d` · graph canvases | **Yes — fourteen precedents, one of them in a chemistry scenario** | Not one shared primitive, but fourteen per-scenario 2-D canvases of identical shape. **The nearest template is `bsc_trend:55863`** — a live trend canvas already inside `bonding_scene` (redraw `:56155`/`:57703`, widget map `:57832`), i.e. chemistry, not an AC waveform. Also `cap_graph_canvas:6806` (draw `capDrawGraph:7060`, widget map `:6961`, axis toggle `cap_axis_toggle:6810`), `ecp_graph_canvas:22920`, `ind_graph_canvas:23591`, `acg_graph_canvas:24399`, plus the AC pairs |
| `field_3d` · `molecular_geometry` / `bonding_scene` | No | One molecule about a central atom; units/charges/links. Neither carries element identity or Z |
| `particle_field` · `gas_box` | No | Periodicity is a property of single atoms, not a population |
| `parametric` | Partly | `axes` and `locus_trace` are live; `position_expr:1269` drives live positions. But using it would split the pair across two renderers and break Rule 32d |
| `graph_interactive` | **No — cannot reach the product** | `build_review_site.ts:3604` accepts only `field_3d`, `particle_field`, `physics_engine_config` |

**Verdict: `orbital_shapes` is the right home and needs three additions, all bounded.** Rule 40a
sweep across all branches — `periodic_table` **0 hits**, `atomic_radius` **0 hits**; `shielding` and
`ionisation` hit only docs and the ionic/metallic chemistry blocks. Nothing is being built twice.

**Rule 33 does NOT fire on either concept** (corrected from v1). Rule 33 governs a *macroscopic*
taught variable with a microscopic mechanism. Atomic radius and ionisation enthalpy are microscopic
variables with microscopic mechanisms. The element overlay is required for a narrower and more
concrete reason — four core-ring delta cues say "period" and "group", which are untaught terms with
no on-screen referent (Rule 25), in states that must read with sound off (Rule 24).

---

## The engine decision

### <a id="union"></a>The union — walked STATE → ROWS

> **v1 walked this row → state, which is structurally incapable of finding a state that needs an
> unlisted row.** That is the filed scar `phase0_union_table_asserted_not_walked_state_by_state`
> (OPEN), whose prevention rule specifies this direction. Walking it correctly surfaced three
> capabilities v1 missed: rows **L**, **M**, and the true scope of row **A**.
>
> ⚠ **v4 — THE SAME SCAR RECURRED A THIRD TIME, in a direction the fix did not cover.** The state→rows
> walk covers what a state **RENDERS**. It has no row for what a state **EXPOSES**, so it cannot see a
> missing slider — and it did not: Phase 0 authored "Controls: Z · element · charge" for the explore
> state, three engine builds shipped, and **no control surface was ever built** (`#os_sliders` carries
> six rows: `orbital · dots · spin · probe · schar · twist`, `:62246-62270`). Row N covered
> *schedules*, never *controls*.
>
> **The walk therefore has TWO columns per state, not one: the capability it RENDERS and the control
> it EXPOSES — and the EXPLORE state is walked FIRST**, because it consumes the widest control surface
> and is exactly the state a capability-only union cannot see.

**Rows.** A = Z_eff scales the atomic orbital · B = radius HUD in pm · C = Z_eff HUD with provenance ·
D = element identity (Z, configuration, Slater S) · **E = element overlay panel (table strip *and*
trend curve — ONE row)** · G = staged shell filling · H = ghost/compare a second orbital ·
I = ion formation derived from A+D · K = energy HUD (hydrogenic, eV) · **L = 3s / 3p / 4s orbitals** ·
**M = measured, cited IE quantity in kJ mol⁻¹** · **N = within-state parameter scheduling**.

> **Row N was missed by BOTH cycle-1 and cycle-2 walks, and it is the difference between a lesson
> and a slideshow.** Nine of eighteen states declare an archetype whose motion *is* a parameter
> changing during the state — `nucleus-charge-up`, `period-sweep` (×2), `group-step` (×2),
> `ion-charge-sweep`, `count-held-Z-swept`, `staircase`, `count-from-jump`. Nothing supplies it.
> `mode` cannot: the code says so twice, verbatim — *"'mode' is a CAMERA-table key (OS_CAMERAS) and
> deliberately nothing else"* (`:60343`, repeated `:59314`) — and every motion in this scenario comes
> from an explicit schedule (`stipple_at_ms:60457`, `grow_at_ms:60614`, `ghost_at_ms:60641`,
> `probe_auto:61251`, `populate_steps:60366`). The v2 config contract's `element` / `z_eff` /
> `charge` are static scalars with no `at_ms`, so twelve of sixteen guided states would render as
> **still pictures** — the filed scar `field3d_authored_mode_string_is_inert_decoration_and_states_render_static`,
> recurring. **Row N = `element_steps` + `charge_steps` (shape of `gallery_steps`) and `z_ramp`
> (shape of `probe_auto`)**, all closed-form in state-local t per the scenario's accumulator-free
> contract (Rules 26/36). Append these two concepts to that scar row; do not mint a new `bug_class`.

| State | Rows it needs |
|---|---|
| radius S1 | B, K |
| radius S2 | A, B, D |
| radius S3 | A, B, C, D, G |
| radius S4 | A, B, C, D, **E** |
| radius S5 | A, B, D, **E**, **L** |
| radius S6 | A, B, D, H, I |
| radius S7 | A, B, C, D, H, I |
| radius S8 | C, D, G |
| radius S9 | A, B, C, D, E, G, H, I |
| IE S1 | **M** |
| IE S2 | A, B, D, **M** |
| IE S3 | A, B, C, D, **E**, **M** |
| IE S4 | A, B, D, **E**, **L**, **M** |
| IE S5 | D, **L**, **M** |
| IE S6 | D, **E**, **L**, **M** |
| IE S7 | C, D, **E**, **M** |
| IE S8 | C, D, **E**, **M** |
| IE S9 | A, B, C, D, E, M |

**Row N (parameter scheduling) is needed by:** radius S2, S4, S5, S6, S7 · IE S3, S4, S6 — every
state whose declared archetype is a sweep, a step or a staircase.

**Reverse assertion:** every row A–N appears in at least one state above (A×11, B×10, C×8, D×17,
E×8, G×3, H×3, I×3, K×1, L×4, M×9, N×8). **No state needs a capability outside A–N.**

### What each new row costs

| Row | Cost | Notes |
|---|---|---|
| **A** | **Applied at FRAME time, not build time — six atomic sites** | ⚠ **The v2 costing was in the wrong place.** `buildOrbitalShapes:59778` bakes every table, sample pool and mesh ONCE at page load (`osBuildTables:59809`, `osBuildSamples:59810`, `rByLev:59816`, `osLobeGeometry:59824-25`); `applyOrbitalShapesState:60215` then consumes only the baked `orb.rByLev`. Editing those sites yields **one Z for the whole concept**, fixed at load — no slider would move anything. **Correct implementation:** hydrogenic Z-scaling is an exact **similarity** (every position is 1/Z of the Z=1 picture), so keep all ρ-space tables at Z=1 and apply Z at apply/frame time as a uniform `scale.setScalar(1/Z)` on cloud, boundary and node shell, plus a division on every pm number from `rByLev` / `shellPm` / `slabHalf`. No re-solve, no rebuild, and `SET_TIME_FREEZE` byte-identity holds because the scale is a pure function of state-local t. Sites: `:58240` boundary · `:58331` dot swarm · `:58434` lobe mesh · `:59818` node shell · `:60479` cutaway slab · **`:59755` `osPlaneMaxDensity`** (found by symbol sweep in cycle 2 — guarded only against hybrid/mo, so it IS on the atomic path; either carry Z there or forbid `'psi2'`/`'probe'` in any state with `z_eff ≠ 1` and enforce it in `check:periodicity`). **Two declared NON-goals:** the hybrid path (`osHybRootAt` at `:58512/13`, `:58560`, `:58672`, `:58721`) — periodicity never renders a hybrid; and `ringR:61356`, the **Bohr orbit prop** that dissolves in S1 — scaling it would be a defect |
| **L** | **Moderate — one silent-failure trap and three completeness items** | `osR:58167` dispatches n/l in three branches then **returns the 3d radial form unguarded**. An entry added as `"3s": {n:3,l:0}` silently evaluates 3d, renders plausibly, and passes every gate. Each new orbital needs (a) its own `osR` branch with a **`throw` on the unmatched case**, (b) its own offline-solved `levels` triple, (c) **its own solved `rhoMax`** — it is per-entry (14/26/26/40, `:58015-58021`) and sets the table extent, the slab `hStart:60479` and the `osRhoOuter` clamp; 3s/3p ≈ 40, 4s ≈ 70, and a copied value silently clamps the outer contour at the grid edge — and (d) `shellRho` generalised from a scalar (`:58017`, consumed `:59818`) to a node **list sized from `nodesRadial = n − l − 1` (`:58218`)**, because 4s carries **three** radial nodes, not the two a 3s-shaped list would allocate. `OS_EXPLORE_ORBITALS:58023` (the Rule 38b explore picker) updated deliberately. `osAng:58180` needs **no** change — its l=0/l=1 branches already serve 3s/3p/4s |
| **M** | **Small** | A cited IE table (kJ mol⁻¹) + a HUD line that prints provenance. The engine must never *compute* an IE — see engine decision 3 |
| **E** | **Small — copy-shape** | One DOM overlay driven by the state's current element: 18 cells for periods 2–3, plus a polyline with a marker. **Nearest template is `bsc_trend:55863`** (already a chemistry-scenario trend canvas); `capDrawGraph:7060` + widget map `:6961` for the axis-toggle pattern. **Not a graph engine.** Rule 39f auto-discovers inline `position:fixed` panels, so ⚙ costs nothing. ⚠ IE S5's successive-IE staircase is a **stepped/bar** draw, not a polyline — spec both marks |
| **I** | Small — derived from A + D | ⚠ Declared in the config contract but omitted from v2's §0c scope line. Two states and the radius explore depend on it |
| C | Trivial after A | |

### Four engine decisions taken now rather than discovered later

1. **Hydrogenic Z-scaling is EXACT, so row A changes no solved constant — and it belongs at FRAME
   time, not build time.** ψ_Z(r) = Z^{3/2} ψ₁(Zr): every iso-density level, r₉₀ and node radius
   already solved offline stays valid, because only the ρ → pm conversion carries Z. Because that
   makes the Z picture an exact **similarity** of the Z=1 picture, the implementation is a uniform
   `1/Z` scale applied where the state is applied — never a constant folded into the build. **Both
   halves must be stated in the dispatch:** without the first a surgeon re-derives the contour table;
   without the second the concept bakes one Z at page load and every slider is dead. (v2 stated the
   first only, and its five call sites were four build-time functions plus one apply-time consumer.)
2. **The contraction is DERIVED, never authored.** Z_eff comes from the element's configuration via
   Slater; the radius follows; the trend follows from the radii. If a state authors a radius, the
   concept is decorative. *(Corrected from v1: Slater is **not** "already implemented at `:58758`" —
   that line is one hardcoded expression for carbon 2p. Row D builds the rule; the v1 prose was
   wrong and row D was right.)*
3. **The engine never computes an ionisation enthalpy, and it never prints an unlabelled number.**
   `orb.E = −13.6/(n·n)` (`:58217`, `:58536`) is a hydrogenic Z=1 orbital energy in **eV** — not an
   IE, and Z_eff-scaling it misses period-2 values by a factor running from **≈1.07× at lithium
   (554 predicted / 520 measured) to ≈5.4× at neon (11 226 / 2081)**, with boron at 2217 vs **801**.
   (Corrected in cycle 2 — v2 printed "1.4–2.8×", which understated it; the spread is the point, and
   a doc requiring every claim to carry its evidence must get its own arithmetic right.) So: every IE
   on screen is a **cited measurement** and the HUD says
   so (`IE₁ = 801 kJ/mol (measured)`); every model number carries its provenance, exactly as the
   engine already does at `:61503` (`Z_eff = 3.25 (Slater)`, whose own comment reads *"prints no
   digit it does not have"*). A derived radius and a cited covalent radius never share a surface
   unlabelled.
4. **The model's FAILURE is the lesson, not a footnote.** Slater does not predict Be > B or N > O —
   it is blind to 2s/2p penetration and to p-subshell pair repulsion. v1 proposed hiding this in
   `authoring_notes` (invisible to every human) and naming the cause in narration (the literal shape
   of the filed scar `narration_attributes_an_effect_to_a_cause_the_model_does_not_contain`).
   **Instead:** IE S7/S8 put the model's prediction and the measurement on one axis, visually
   distinct, and teach the gap. That is what a good teacher does at a whiteboard, it needs no new
   engine, and it converts the wave's biggest liability into its two best states.

### <a id="reuse"></a>Reuse contract — what the dispatch must NOT re-derive

`osRhoOuter`, `osROutUnits`, `osOuterPm`, `osRhoAt`, `osAng`, the seeded sample pool and
`OS_ENCLOSURES` are correct as-is; row A calls them with a Z-aware pm-per-ρ and does not fork them.
**Exception, narrowed in cycle 1:** row L legitimately ADDS `levels` triples and `osR` branches for
new orbitals. v1's blanket "any diff touching `levels` is wrong by construction" would have blocked
its own row L.
### <a id="contract"></a>Config contract — VERIFIED AGAINST THE APPLY PATH

> **v4, 2026-08-06 — rewritten after the `atomic_and_ionic_radius` Checkpoint A returned
> `DESIGN_FIX` with seven P1s, five of which were this section describing INTENT rather than the
> code.** The architect followed this page faithfully and produced an unbuildable skeleton. That is a
> contract failure, not an authoring failure.
>
> **The rule this section now follows: every claim carries the call site it was read from, and
> anything not verified in the merged renderer is listed under DOES NOT EXIST rather than omitted.**
> Line numbers are against `origin/master` `9f7e531`; they drift — locate by symbol.

#### What EXISTS (verified in `field_3d_renderer.ts` at `9f7e531`)

```
state.orbital_shapes = {
  element: 'H'…'Ca',            // s/p block, periods 1–4. Static scalar.
  charge:  -3 … +3,             // integer, clamped
  orbital: '1s'|'2s'|'2p_{x,y,z}'|'3s'|'3p_{x,y,z}'|'4s'|'3d_xy'|'valence',
  z_eff:   <number 0.05..100> | 'slater',      // 'slater' needs `element`
  z_ramp:  {from,to,at_ms,duration_ms},        // OVERRIDES z_eff; never author both
  element_steps: [{at_ms, element}],           // cue names "element_0", "element_1", …
  charge_steps:  [{at_ms, charge}],            // cue names "charge_0",  "charge_1",  …
  overlay: { table, curve, mark, model_series },
  hud_lines: [...],             // closed set, below
  camera: {az, el, dist}, dot_target,          // MANDATORY per state
  …all pre-existing keys (populate_steps, gallery_steps, ghost_*, probe_auto,
    cutaway_at_ms, show_*) unchanged
}
```

**`hud_lines` — the complete handled set**, verified by sweeping the dispatch:
`occupancy · psi2 · slice_dots · energy · nodes · radius · label · tips · element · config · z_eff ·
ie_measured`. Anything else is silently ignored.
#### ⛔ DOES NOT EXIST — re-stamped 2026-08-06 after build 4 (`d2c703f`) and Checkpoint A cycle 2

> **Four of the original five rows are CLOSED. Read the status column — a stale gap list is how the
> first skeleton was written unbuildable, and a stale gap list that says "missing" about something
> that now exists causes the opposite error.**

| Gap | Status | Site |
|---|---|---|
| The explore state exposes `element` · `charge` · `zeff` dials | ✅ **CLOSED, build 4** — rows `:62395-62410`, map `:62636`; the seize lives *inside* `osElementAt`/`osChargeAt`/`osZEffAt`, so a drag is bit-for-bit the scheduled picture | — |
| `overlay` accepts an `element_steps`-only source | ✅ **CLOSED, build 4** — `ovHasElem = !!os.element \|\| element_steps.length \|\| osCtrlOn(os,'element')` | `:62727` |
| A ghost can hold a previous species | ✅ **CLOSED, build 4** — `ghost_species` resolves its own `OS_IONS` row and its own `ghostZ`; a dedicated `os_ghost_sphere` mesh covers s valences | `:60349`, `:62570` |
| A pinned electron-count surface | ✅ **CLOSED, build 4** — `hud_lines:'electron_count'`, `(held)` **measured** not asserted | `:64101-64115` |
| Staged nested-shell fill | ❌ **STILL OPEN** — `OS_MAX_SETS = 3` truncates and drops the **LAST** step; only ONE spherical boundary draws (`sphOrb`, last-wins); Z scales **all** active orbitals uniformly | `:59337`, `:62842`, `:63122` |

#### ⛔ NEW GAPS — re-stamped 2026-08-07 after builds 5 and 6

> **FOUR of the eight cycle-2 gaps are CLOSED.** Read the status column: a stale gap list that says
> "missing" about something that now exists causes the opposite error to one that says "exists"
> about something missing. Both have happened on this page.

| Gap | Status |
|---|---|
| No mid-state camera schedule | ✅ **CLOSED, build 5** — `camera_steps: [{at_ms, az, el, dist, ease_ms}]`, closed-form on state-local ms, never routed through the lerp. ⚠ **A state authoring it forfeits its ENTRY GLIDE** — the state before it hard-cuts at entry |
| No core-region surface | ✅ **CLOSED, builds 5 + 6** — `ghost_species[].as: 'core'` (held), and `orbital: 'shell'` for the LIVE species (build 6). Uses the **radial** 90% law, not the iso-density contour |
| `osZEffAt` orbital-independent | ✅ **CLOSED, build 5** — resolves per drawn orbital. K's 1s now 18.70 / 7.53 pm vs the 4s at 2.20 / 813.53 pm |
| No explore idle-spin fallback | ✅ **CLOSED, build 6** — 0.14 rad/s, gated on **absence** of `spin_rate`, and **requires `mode: 'explore'`**. Without that key a sandbox is byte-static AND `deriveStateMeta` expects motion, so THE EYE and the Rule-37 probe both fail |
| `ghost_species` had no clear step | ✅ **CLOSED, build 5** — `clear: true`. Pin it at the SAME `at_ms` as the element swap that ends the phase |
| The radius HUD relabels `r =` → `lobe tip =` | ✅ **CLOSED in practice, build 6** — `orbital: 'shell'` renders one silhouette family, so the relabel never fires. The branch still exists for lobe states |
| Annotation layer z-index 9 under z-index-10 opaque panels; one reserved rect | ❌ **STILL OPEN** — but build 5's `radius_vs_z` legend now reads "Slater model · neutral atoms", so the annotation this wave wanted is **no longer needed**. Do not author `render_annotations` |
| The `zeff` dial range | ✅ **CLOSED, build 5** — computed from the enum (0.15 … 19.70), no longer a typed literal |

**Still open, unchanged:** `OS_MAX_SETS = 3` truncation + single-`sphOrb` · no `'z'` HUD line ·
`os_overlay` has no glow key · the ASCII `Z_eff` HUD string (behind an approved baseline) · the
`element` HUD line duplicating the electron count beside the dedicated `electron_count` line ·
`os_ghost_sphere` shares `elementType: "os_surface"` with the live cloud, so a `surface` glow focal
lights both.

#### ⚠ THE MOTION VOCABULARY — the constraint that governs every choreography column

`orbital_shapes` offers an author exactly **three** motion primitives:

1. **Instantaneous swaps** — `element_steps` · `charge_steps` · `gallery_steps` · `populate_steps`.
   A swap is a **cut**, not a tween. There is no intermediate geometry.
2. **One continuous ramp** — `z_ramp` (and the pre-existing `probe_auto` / extrude / bloom / grow
   reveal beats).
3. **One camera per state.**

**Therefore:** a verb implying continuity — *contracts · grows · collapses · eases · relaxes* — is
authorable ONLY where a ramp or a reveal beat drives it. A cause-before-effect beat (Rule 32a) is
authorable ONLY where cause and effect read from **different resolved values**; two renderings of one
per-frame variable cannot be separated by timing. **Name the primitive beside every described motion
in the skeleton, or the state describes a picture the engine does not make.**
#### Authoring rules that ARE verified

- **`camera` + `dot_target` are mandatory per state.** `OS_CAMERAS` is solved for hydrogen; 4s r₉₀ ≈ 1779 pm at Z=1 while a period-3 element at Z_eff ≈ 6 contracts to ~170 pm. Compute `dist` from the shipped solve by (target r / hydrogen r); scale `dot_target` to hold dot density, verify via `PM_osVisDots`.
- **`'valence'`** resolves to the outermost occupied subshell of `element`+`charge`, derived (Na→3s, Na⁺→2p_z, K→4s, Ca²⁺→3p_z). An `element` state naming no `orbital` also resolves to valence — not the 1s fallback the `populate_baseid` scar is about. A p valence takes the `_z` member.
- **`overlay.curve` has NO group form, by design.** A group trend against Z is four scattered points; group states author `curve: null` + `table: true`.
- **`ie_successive` is driven by `charge` / `charge_steps`** — IE index = charge + 1. There is no separate "which electron" key. Rung count is derived, so the cliff moves with the element.
- **`model_series` is ignored on `radius_vs_z`** — no cited radius table exists and one was deliberately not invented. Provenance is colour-coded fleet-wide: amber solid round = citation, cyan dashed square = engine arithmetic.
- A **log y-axis** fires only when `model_series` is on and the series span > 1 decade.
- An **anion prints `IE = —`**; IE₀ is not notation. Never author a `k` past the citation.
- **`energy` is safe to pair with `z_eff ≠ 1`** since build 3 — it prints `−13.6·Z_eff²/n²` derived at frame time from the same scale applied to the mesh. It remains a *hydrogenic orbital energy*, never an ionisation energy; a state wanting an IE authors `ie_measured`.
- The overlay owns **bottom-left** and pushes the formula surface to top-left automatically.
- `OS_SUBSHELLS` stops at 4p — sufficient for H…Ca at −3..+3. A d-/f-block element re-opens Phase 0.
- **`OS_EXPLORE_ORBITALS` is still `["1s","2p_x","2p_y","2p_z"]`** — row L's "update deliberately" item was not applied. Override per concept with `config.explore_orbitals`.
- The `radius` HUD prints `r = 141 pm (90%)`, **not** `(model)` — the provenance stamp must come from the state's own caption.
- `hud_lines: 'element'` prints `10 e`, not `10 e⁻` (a Rule 34c gap).

#### ⚠ Known gaps, carried

- **`os_overlay` has no glow key** — the scenario's glow enum is closed at 12, all meshes. A state may SHOW the strip/curve but cannot make it the Rule 32e focal element.
- **Paired `element_steps` + `charge_steps` can be pulled apart by reveal pins.** Each resolves through its own `cueTriggerMs("element_i")` / `cueTriggerMs("charge_i")`. At authored `at_ms` the sequences are clean, but binding reveals to those cue names on different sentences can open a window rendering the wrong species — invisible to THE EYE, which sends no cue times. **Paired steps are pinned together or not at all.**
- **Row K (`energy`) is currently claimed by NO state in this wave.** Radius S1 dropped it (correctly, Rule 25) and it was the only claimant. Logged so the reverse union assertion is re-run whenever a skeleton declines a row.

#### ENUM FREEZE

`element`, `orbital`, `curve`, `mark` and `hud_lines` are closed. A state naming a value outside them
is a validator failure, never a silent fallback. **And the freeze check must enumerate EVERY closed
enum in this section — including `hud_lines`, the control-row set, and the glow keys — not only the
four value enums.** Checking four and skipping the rest is precisely how the first skeleton passed its
own enum-discipline pass while five of its states named surfaces that do not exist.
### <a id="ledger"></a>What this wave is deliberately NOT building

| Deferred | Why | Re-opens when |
|---|---|---|
| **d-/f-block trends** (lanthanoid contraction) | Library stops at `3d_xy`; one state's payoff for a new orbital family | A d-block or coordination concept is scheduled |
| **Electron gain enthalpy** | Rides A–M with no new engine, but is its own concept | Scheduled as wave concept #3 |
| **Electronegativity scales** | Numbers-and-tables; the *use* already ships in `bond_polarity_dipole_moment` | A teacher asks for the derivation |
| **Mendeleev's predictive gaps** | History, and a genuinely good whiteboard story | Never, on current doctrine |
| **Metallic / van der Waals radius** | Three radius definitions on one screen is a Rule 34 clutter failure. Covalent radius only, labelled | A-level demand from a real teacher |
| **Why Slater's constants are 0.35 / 0.85** | Beyond every board in the table | Never |
| **SCF / Clementi Z_eff** | The honest refinement of Slater, but a second model on screen at IE S7/S8 is Rule 34 clutter | Advanced-ring demand |

Each row walked against both §0b state tables. None is load-bearing.

---

## 0b — DEEPEST-CONCEPT DESIGN

**Cross-concept declaration (Rule 31b), stated here so it covers BOTH skeletons:** `period-sweep`
appears in radius S4 and ionisation S3 as a **declared contrast pair**. It is permitted only because
IE S3 re-shows what it contrasts against — **both numbers live on one screen, radius falling while
energy rises**. Its one-new-thing is the *inversion*, not the sweep. (v1 declared this in one
skeleton only and did not put both numbers on screen; without that, it is two states doing the same
thing twice.)

> Every number below is a DESIGN TARGET. `chemistry_author` verifies each against a cited source.
> Measured values (IE in kJ mol⁻¹, covalent radii in pm) are imported constants and must carry
> provenance on canvas. Narration budget is 25–55 EN words per guided state (Rule 31).

### `atomic_and_ionic_radius` — 💎 · NCERT §3.7.1(a)(b) · 6/6 boards

**Universal anchor (Rule 35):** a lithium-ion cell — lithium is used because its atoms are small, so
more charge fits in the same volume. No country, no brand, no culture. **Home state S1, allocated 12
of its 35 words** — an anchor with no state and no word budget is a filed scar
(`real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget`), and every other
state's budget is already committed.

**Misconception (Rule 16a, confronted at S7):** *"more electrons means a bigger atom."*

**Rings:** core S1–S7 · extended S8 · explore S9. **S7 is in CORE** — it is the misconception beat,
and v1 ringed it `extended`, which shipped the core preset without the beat that justifies the
concept.

| # | Teaches | Archetype | Delta cue (≤5 w) | Controls | Real number | Dur | Words | Ring |
|---|---|---|---|---|---|---|---|---|
| S1 | The size we measure — r₉₀ | `shell-settle` | "One electron, one shell" | — | r₉₀ pm | 14s | 35 | core |
| S2 | More protons pull the shell in | `nucleus-charge-up` | "More protons, smaller shell" | Z | r pm | 16s | 45 | core |
| S3 | **Inner electrons reduce that pull** | `screen-peel` | "Inner electrons reduce the pull" | shells | Z_eff = Z − S | 18s | 50 | core |
| S4 | Across a period: same shell, rising pull | `period-sweep` | "Same shell, smaller each step" | element | Z_eff, r | 16s | 45 | core |
| S5 | Down a group: a new shell resets it | `group-step` | "New shell, larger again" | element | n, r | 15s | 40 | core |
| S6 | Change the electron count at fixed nucleus | `ion-charge-sweep` | "Same nucleus, electrons changed" | charge ± | r_ion vs r_atom | 18s | 50 | core |
| S7 | **Isoelectronic series — the beat** | `count-held-Z-swept` | "Same electron count, smaller" | Z | e⁻ count PINNED, r falls | 20s | 55 | core |
| S8 | Where S comes from — subshells | `subshell-fill` | "Subshells set the screening" | subshell | S per group | 18s | 50 | extended |
| S9 | Explore | `open` | — | Z · element · charge (core only) | live | — | 0 | explore |

**Two v1 defects fixed here.** Screening (S3) now precedes every numeric use of Z_eff — v1 ringed it
`advanced`/last, so the core preset displayed a HUD quantity nothing on screen had explained. And v1's
S5+S6 (cation shrinks / anion grows) are **merged into S6**: the second was derivable from the first
with the sign flipped, and its cue "Gain one: bigger" stated the declared misconception verbatim on
canvas. The merged state makes the **held variable** the cue and the charge a manipulable — which is
the distinction the student actually needs. The freed slot pays for S8.

**S7 is the concept.** N³⁻ · O²⁻ · F⁻ · Na⁺ · Mg²⁺ · Al³⁺ all carry ten electrons and the radius
falls monotonically as Z rises. The electron-count readout must be visibly **pinned** while the
radius moves — that pinning IS the argument, and Rule 32b is doing pedagogical work here, not just
legibility.

### `ionisation_enthalpy` — 💎 · NCERT §3.7.1(c) · 6/6 boards

**Universal anchor (Rule 35):** sodium is stored under oil and neon is not — how easily an atom gives
up its outer electron decides how it behaves. **Home state S1, allocated 12 of its 35 words.**

**Prerequisite:** `atomic_and_ionic_radius` (Z_eff, screening, shell opening, subshells).

**Misconception (Rule 16a) — TWO beats, one in each ring, because one ring must never ship without
a beat.** *Core beat, S5:* **"every electron costs about the same to remove."** Sodium's second
electron costs **nine times** the first — a contradiction a student can read straight off the
staircase, and it survives the core-only cut. *Extended beat, S7/S8:* *"ionisation energy just rises
across a period."* (Cycle 2 finding: v2 declared only the second, both of whose states ring
`extended`, so the core preset shipped this concept with no wrong-belief confrontation at all — the
same defect v2 had just fixed for the staircase, one state over.)

**Rings:** core S1–S6 · extended S7–S8 · explore S9. **The staircase is in CORE** — v1 ringed S7/S8
`advanced`, shipping the core preset without the payoff its own whiteboard-test justification rests
on. Successive IE and reading valence count off the jump are standard IGCSE and A-level content.

| # | Teaches | Archetype | Delta cue (≤5 w) | Controls | Real number | Dur | Words | Ring |
|---|---|---|---|---|---|---|---|---|
| S1 | Removing an electron costs energy | `pull-free` | "Energy to remove one electron" | — | IE₁ kJ/mol (measured) | 14s | 35 | core |
| S2 | **One named pair** — Li vs F, side by side | `pair-compare` | "Smaller atom, more energy" | — | r, IE₁ for two atoms | 16s | 45 | core |
| S3 | **The inversion — the whole period, both traces** | `period-sweep` | "Size falls, energy rises" | element | r AND IE₁ live | 20s | 55 | core |
| S4 | Down a group: outer shell, cheaper | `group-step` | "Outer shell, less energy" | element | n, IE₁ | 15s | 40 | core |
| S5 | **Successive IE — the cliff** | `staircase` | "Second electron costs far more" | which e⁻ | 496 → 4562 → 6910 | 20s | 55 | core |
| S6 | **The cliff gives the valence count** | `count-from-jump` | "The jump gives valence count" | element | jump index | 18s | 50 | core |
| S7 | **Model vs measurement: boron** | `model-vs-measured` | "Boron needs less than beryllium" | element | 899 vs 801 measured | 20s | 55 | extended |
| S8 | **Model vs measurement: oxygen** | `model-vs-measured` | "Oxygen needs less than nitrogen" | element | 1402 vs 1314 measured | 20s | 55 | extended |
| S9 | Explore | `open` | — | element · which e⁻ · curve (core only) | live | — | 0 | explore |

**Ordering is forced, not chosen.** S7/S8 stand on 2s/2p ordering and p-subshell pairing, which
`atomic_and_ionic_radius` teaches at S8 in the **extended** ring. Under Rule 38a a state cannot
survive a cut its foundation does not survive, so the anomalies ring `extended` too — which puts the
staircase before them. v1 had this inverted and asserted two causes the arc never taught.

**S5/S6 is the payoff.** Sodium's 496 → 4562 → 6910 kJ mol⁻¹ is not a trend, it is a cliff, and where
the cliff falls tells you how many valence electrons the atom had. S6 earns its slot only because the
jump **moves** as the element changes — re-reading S7's picture would be a Rule 31 failure.

**S7/S8 are the model's failure, taught.** Both draw the Slater prediction and the measurement on one
axis, visually distinct (`overlay.model_series`). The student sees the screening picture get boron
and oxygen wrong, and learns what it is missing. No state implies the model predicted the dip.

**Declared archetype repeat (Rule 31b): `model-vs-measured` at S7 AND S8.** Permitted as a contrast
pair only because the two failures have **different causes** and each must depict its own: S7 shows
boron's outer electron in a *different subshell* (2p, poorly penetrating, sitting outside the 2s it
is compared against); S8 shows oxygen's two electrons *sharing one 2p orbital*, which no other state
in either concept shows. **If the dispatch cannot depict p-subshell pairing, S8 collapses into S7
with new labels and must be cut to a single anomaly state.** That is a build-time decision, flagged
here rather than discovered at Checkpoint B — the concept survives either way at 8 or 9 states.

**S2 vs S3 (cycle 2).** v2 let S2's cue state the inversion that S3 claims as its one-new-thing. S2
is now **one named pair** (lithium and fluorine, side by side, no sweep); S3 is the **whole period as
two opposite-going traces**. S2 establishes that the link exists; S3 shows it hold across eight
elements and names it an inversion.

**v1's fixed cue defect:** S8's cue was *"Pairing costs energy back"* — not literal English, and read
with sound off it says pairing *raises* the removal cost. The physics is the opposite: pairing raises
the electron's energy, so **less** energy removes it and IE **falls**. The v1 cue taught the sign
backwards at the state the doc calls a diamond.

---

## 0c — ENGINE ONCE (planned, NOT dispatched)

One dispatch, one `bug_class` (Amendment 4), to `field3d-surgeon`, landing on **master separately and
immediately** (Rule 40) — never in this desk.

**Scope:** rows **A** (frame-time `1/Z` similarity scale; six atomic sites, two declared non-goals) ·
**C** · **D** (element table with Slater S, computed at build time) · **E** (one DOM overlay: 18-cell
strip + line/step curve, copy-shape from `bsc_trend:55863`) · **I** (ion formation) · **L** (3s/3p/4s
with `osR` throw-on-unmatched, per-orbital solved `rhoMax`, node list from `nodesRadial`) · **M**
(cited IE table + provenance HUD) · **N** (`element_steps`, `charge_steps`, `z_ramp`) · plus
`check:periodicity`.

**The dispatch is NOT one `bug_class`.** Row A is a frame-time architecture change and row N is a new
motion vocabulary — different `bug_class`es under Amendment 4, and bundling them is how a ~100-call
ceiling gets hit mid-build.

**Sequencing corrected at dispatch time (2026-08-06).** The v3 order was "N first, the schedule keys
are additive and independent" — **wrong**: `element_steps` and `charge_steps` schedule parameters
(`element`, `charge`) that rows D and I have not yet introduced, so build 1 would have shipped code
that could not be verified. **Each parameter ships WITH its own schedule:**

| Build | Desk | Scope | Verifiable as |
|---|---|---|---|
| 1 ✅ | `feat/orbital-shapes-zscale` | row **A** (frame-time 1/Z similarity) + `z_ramp` + the `osPlaneMaxDensity` probe decision | **BUILT 2026-08-06.** 482.452 pm → 148.447 pm at Z=3.25 → back, in one page load; frozen frames sha256-identical across independent loads; regression 56/56 · 50/50 · 56/56, all baselines 0.00% |
| 2 ✅ | `feat/orbital-shapes-elements` | rows **D · I · L** + `element_steps` + `charge_steps` | **BUILT 2026-08-06.** Slater derived (reproduces carbon 3.25 exactly); all 11 orbitals r₉₀ within 0.000% of analytic; 4s renders 3 node shells; **isoelectronic series falls monotonically with nothing authored** — N³⁻ 169.3 → Al³⁺ 54.5 pm at 10 electrons throughout |
| 3 ✅ | `feat/orbital-shapes-overlay` | rows **E · M · K** | **BUILT 2026-08-06.** IE cited (CRC 97th / NIST ASD), every value stamped `(measured)`; model-vs-measured spread **measured** at 1.07× (Li) → 5.40× (Ne); row K fixed — C 2p at Z_eff 3.25 printed −3.40 eV, now −35.91; Rule 34d frame read with all overlays on, zero overlap; regression 56/56 · 50/50 · 56/56 all at **0.00%** |

Each is its own desk cut from `origin/master`, PR'd to master, never built in the concept desk
(Rule 40) and never in the office. Builds run **sequentially** — all three edit
`field_3d_renderer.ts`, and parallel dispatches into one engine file are the exact hazard Rule 40
exists for. Every build re-runs the `orbital_shapes` regression set before it is called done.

**Generalised lesson:** a schedule key and the parameter it drives are ONE unit of work. Splitting
"all parameters" from "all schedules" produces a build that cannot be tested, which is how an
unverifiable dispatch reaches master.

**Rows E and F merged in cycle 1** — both are one DOM overlay driven by the current element. v1 split
them and deferred both to a second dispatch, which would have blocked six of seventeen guided states,
four of them core, and produced a second Checkpoint A rather than a shippable concept.

**Mandatory** (`docs/FIELD3D_SCENARIO_CHECKLIST.md`): the reuse contract · Rule 36 (no hardcoded
per-frame delta) · Rule 39f (widget auto-discovery; no per-concept authoring) · frozen-baseline
byte-identity under `SET_TIME_FREEZE` · and a **regression re-run of `atomic_orbitals_s_p_d`,
`hybridisation_sp_sp2_sp3` and `sigma_pi_bonding` through THE EYE**, unchanged, before the dispatch is
called done — all three ride `orbital_shapes` and rows A and L touch shared code.

**Probe owed at Checkpoint B:** `PM_osVisDots`, `PM_osSlabPm` and the radius HUD must ALL change when
`z_eff` changes (row A's failure mode is a boundary that scales while the cloud does not), and every
orbital in `OS_ORBITALS` must reach an `osR` branch matching its own n and l, with r₉₀ agreeing with
the analytic hydrogenic value to 1% (row L's silent-failure mode).

---

## OPEN DECISIONS

*(v1's three are all ruled. None remains open.)*

- **OPEN-DECISION-1 (table strip) → BUILD**, periods 2–3, as part of row E. Not a Rule 33 macro band
  — Rule 33 does not fire — but four core cues say "period"/"group" with no on-screen referent.
- **OPEN-DECISION-2 (trend curve) → BUILD**, folded into row E. Seven copy-shape precedents.
- **OPEN-DECISION-3 (anomaly honesty) → the model's failure IS the lesson** (engine decision 4).

---

## Cycle-1 changelog

| Finding | Applied |
|---|---|
| F1 orbitals | Row **L** added (3s/3p/4s), with the `osR:58167` unguarded-fallback trap and the 3s two-node `shellRho` generalisation both specced |
| F2 walk direction | Union re-walked **state → rows** with a reverse assertion |
| F3 IE quantity | Row **M** added; engine decision 3 — engine never computes an IE |
| F4 which radius | Engine decision 3 — provenance on canvas, derived and measured never unlabelled together |
| F5 Z_eff before screening | Screening moved to radius **S3**, before its first numeric use |
| F6 payoff outside core | radius S7 → core; IE staircase → core |
| F7 untaught causes | radius **S8** (subshells) added; IE S7/S8 ringed to sit behind it |
| F8/F9/F10 cues | Every cue rewritten literal (Rule 41); S8's inverted-physics cue fixed; S6 re-cued on the held variable |
| F11 information gain | radius S5+S6 merged into one ± charge state; IE S6 must make the jump *move* |
| F12 table columns | `Dur` and `Words` columns added to both tables |
| F13 malformed row | Fixed |
| F14 degenerate explore | IE explore now has three controls |
| F15 `:58758` prose | Corrected — one hardcoded carbon constant, not a Slater rule |
| F16 Rule 33 | Corrected — does not fire; overlay justified on Rule 25/24 instead |
| F17 graph precedent | Corrected — seven precedents; row E is copy-shape |
| F18 row A scope | Five atomic sites enumerated, **plus two non-goals v1 and the review both missed**: the hybrid path, and `ringR:61356` (the Bohr prop, which must NOT scale) |
| F19 anchors | Universal anchor declared per concept |
| F20 config contract | §Config contract added, with an enum freeze |
| Ruling 2 | `period-sweep` declared in the shared preamble; IE S3 now shows both numbers |
| Ruling 4 | Rows E+F merged, moved into the FIRST dispatch |
| Ruling 6a | Subshell foundation pulled into radius S8 rather than adding a concept |

---

## Cycle-2 changelog (v3)

Checkpoint A cycle 2 returned **`DESIGN_OK` on §0b** — the state arcs, rings, ordering, cues and
misconception placement are cleared, and the reviewer independently re-ran the ring cut in both
directions including across the concept seam. **§0c was NOT cleared**, with three blocking
engine-spec defects. All are applied here; no further design cycle is required (two-cycle cap
respected — this is a spec edit, not a redesign).

| Finding | Applied |
|---|---|
| **E1** row A costed at build time | Re-specced as a **frame-time `1/Z` similarity scale**. `buildOrbitalShapes:59778` bakes tables/samples/meshes once at load; v2's costing would have shipped one Z per concept and a dead slider |
| **E2** enumeration not exhaustive | **Sixth atomic site `:59755`** (`osPlaneMaxDensity`) added, with a `'psi2'`/`'probe'` forbid-or-carry decision. v2 wrote the list from reading, not from a symbol sweep |
| **E3** no motion source | **Row N added** (`element_steps`, `charge_steps`, `z_ramp`). `mode` is a camera key "and deliberately nothing else" (`:60343`); without row N twelve of sixteen guided states are still pictures |
| **E4** row L completeness | Per-orbital solved `rhoMax`; node list sized from `nodesRadial` (4s has **three** nodes); `OS_EXPLORE_ORBITALS:58023` updated; row **I** folded into the scope line |
| **A1** IE core ring had no beat | Second misconception declared with its beat at **S5** (core): "every electron costs about the same" vs sodium's 9× second electron |
| **A2** undeclared repeat | `model-vs-measured` at S7/S8 declared, each depicting its own cause — with an explicit cut-to-one fallback if pairing cannot be depicted |
| **A3** S2/S3 overlap | S2 = one named pair; S3 = the whole period as two traces |
| **A4** anchors unallocated | Both anchors given a home state and a word budget |
| **A5** wrong arithmetic | Corrected to ≈1.07× (Li) → ≈5.4× (Ne); v2's "1.4–2.8×" understated the spread |
| **A6** nearest precedent | `bsc_trend:55863` (a chemistry-scenario trend canvas) cited; count corrected from seven to fourteen |
| **A7** frozen `curve` enum | Group trends explicitly use `curve: null` + strip — recorded as a decision, not a short enum. `mark: 'line'\|'step'` added for the staircase |
| Dispatch shape | Split into **three sequenced `bug_class`es** (N → A → E·I·L·M) rather than one, per Amendment 4 |

**Correction record.** Across three rounds this doc made six verified engine errors, all one class —
a claim written from *reading* code rather than from a *sweep* or a *call-trace*: `z_eff` as
atomic-path (MO-only), `:58758` as a Slater rule (one carbon constant), "no graph primitive"
(fourteen exist), "five call sites" (six), row A's five sites as if they ran at apply time (four run
at build), and the arithmetic in engine decision 3. Same class as archetypes K, M and N being
labelled `[LIVE]` against renderers that could not do the thing.

**The countermeasure, now binding on this doc and offered as a fleet rule:** an engine claim must
carry (a) the call site it was read from, (b) **the output of the symbol sweep that found every other
site**, and (c) **when that site executes** — build, apply, or frame. v2 satisfied (a) and still
shipped three defects, because (b) and (c) are what the failures were made of.

**Sharpened by build 1 (2026-08-06) — sweep the BAKED SYMBOLS, not just the constant.** The row-A
dispatch swept `OS_A0` as instructed and still found two sites that sweep could not reach: the S1
measurement flashes and the slice-dot counter, both of which read a **baked Z=1 coordinate as a world
position** without ever naming `OS_A0`. At Z ≠ 1 every spark would have landed outside its own
contracted atom. They were found by grepping the baked symbols themselves — `_pos`, `rByLev`,
`shellPm`, `rhoMax`. **So the rule has two halves:** sweep the constant to find where the value is
*produced*, and sweep the baked symbols to find where it is *consumed*. This doc's enumeration was
short four times running; every miss was on the consumption side.
