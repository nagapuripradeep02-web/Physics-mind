# rotmech desk C — loop state

updated: 2026-08-04
desk: `feat/rotmech-c` · `C:\Tutor\physics-mind-rotmech-c`
cut from: `4b289d4` (the Phase-0d pre-registration commit)
review_port: **8112**
regression_sample: **tension_force, equipotential_surfaces**
engine_surface: `rigid_body_rotation` (rbr) — the 0c-1 frozen contract at `field_3d_renderer.ts:939`

## Concept set — FROZEN. This desk owns exactly these two.

| Wave | Concept | Status |
|---|---|---|
| 1 | `angular_momentum` | **Checkpoint A `DESIGN_OK` + physics block DONE.** Design at `skeleton_rev4.md`, physics at `physics_block.md`. Next stage is `json-author` — nothing blocks it. |
| 2 | `rigid_body_rotation` | **DESIGN COMPLETE, still BLOCKED on 0c-3.** Checkpoint A `DESIGN_OK` (`skeleton_rev3.md`) + physics block done. Do NOT start json-author until 0c-3 merges AND the re-verification list in `founder_proxy_A_cycle2_final.md` §5.1 is re-run. Correction to the old premise below. |

## next
1. **`json-author` for `angular_momentum`** — JSON + SQL migration only; the 8 registration
   sites are pre-registered on master in `4b289d4` and are read-only here. **C1 travels as
   BINDING**: `theta0_rad = 1.739` on S3, every re-solve verified by projection, never derived.
   If C1 does not land, Checkpoint B fails the concept on it.
2. Then quality-auditor ∥ eye-walker → founder-proxy Checkpoint B.
3. `rigid_body_rotation` waits. Its design is finished and sealed; wave 2 starts at `json-author`
   as intended, once 0c-3 lands.

## done
- **`angular_momentum`** — architect → Checkpoint A (`DESIGN_FIX`, 13) → REV 2 → ruling delta
  REV 3 → cycle 2 (`DESIGN_FIX`, 5) → REV 4 → **`DESIGN_OK`** → physics block.
- **`rigid_body_rotation`** — REV 1 → Checkpoint A (`DESIGN_FIX`, 5 P1) → REV 2 → cycle 2
  (`DESIGN_FIX`, 3 P1) → REV 3 → **`DESIGN_OK`** → physics block. Engine ask for 0c-3:
  8 active + C7 defer-recommended + C2 withdrawn to Desk D.
- Engine findings F-C1…F-C5 + C10 + PASS 7/8 filed to `_engine/findings_c.md`.
- 12 scar candidates + 2 amendments indexed in `_engine/scar_candidates_c.sql`; none applied.

## Corrections to this file's own premises (verified in code this session)
1. **`rigid_body_rotation` does NOT need `body_shape` variants.** The brake drum's face IS the
   disc and its rim dot-ring IS the ring picture. The variants stay inert unless concept #1 buys
   them. The blocker is the marker/trace/gauge family (C1/C3/C4/C5) plus the camera (C8), not
   shape variants.
2. **`theta0_rad` is NOT inert.** `APPARATUS_CONTRACT.md:70` lists it as a silent no-op; the
   engine reads it at `:50499`, seeds it at `:50557`/`:49970` and returns it at `:49958`. It is
   the only lever controlling rod azimuth, and azimuth swings screen legibility by 1.85×. Filed
   as PASS 7 for the contract owner — **not corrected locally**, per `APPARATUS_CONTRACT.md` §4.
3. The blocked-concept trap this file records (silent skip of unknown readout tokens) is real and
   was hit in a second form: **`param_ramp` and `idle_auto_sweep` are consumed only for
   `param: "r"`** (`:49852`/`:49858`). Any other param is an equally silent no-op.

## Open items needing a founder ruling
1. **The two-timed-class fence.** 0c-2 is signed with the timed surface at exactly two field
   classes, a third being the Phase-0 alarm rule. Does that bind **0c-1**, and does it count
   **cumulatively**? #3's ask adds 2 to an existing 6. Under the cumulative reading there is no
   design fallback and the concept **re-scopes**. Raised in `findings_c.md` PASS 5.
2. **One machine, two poses.** F-C4 asks for per-state camera because #3 needs near-top-down and
   #9 needs oblique. Whether a teacher moving between two Ch.7 sims should see the same apparatus
   from two poses is a chapter-level taste call this desk cannot take.
3. ~~`torque`/`moment_of_inertia` prerequisites~~ — **RULED 2026-08-04**: name JSON-less ids where
   the dependency is real. `angular_momentum` names all four; #3 correctly names none of those two
   (it precedes them in the approved order).

## What `angular_momentum` CAN use today

`show_l_arrow` (`field_3d_renderer.ts:1039`) draws **L as a vector along the axis**, and `L` is
a live readout row. That is the concept's core, and it is built.

**The advanced ring is not.** `L = r × p` needs `cross_product_construction`, which is declared
but inert (`:939-956`). Author the core and extended rings only; the advanced ring waits for
0c-3. Rule 38a: hiding the advanced ring must leave a coherent lesson — design it that way from
the start rather than retrofitting.

## The blocked-concept trap — read before wave 2

`RBR_RO_META` (`:50147`) implements exactly six rows: `I · ω · L · KE · dL/dt · F`.
**No θ, α, W or v.** `rbrRebuildReadout` (`:50162`) does `if (!meta) continue` — an unknown
token is skipped in **silence**, with no throw and no gate failure. A concept authored against a
missing row passes every automated check with the taught quantity simply absent. That is why
wave 2 waits for 0c-3.

## Guardrails

1. **`npm run cache:clear:scoped -- <id>` ONLY.** The global 4-table wipe destroys four sibling
   desks' seeded rows mid-EYE.
2. **Cache one-owner rule.** This desk may seed exactly: `angular_momentum`,
   `rigid_body_rotation`, `tension_force`, `equipotential_surfaces`. Seeding any other key
   races a sibling desk.
3. **Always re-seed immediately before `visual:eyes`.**
4. **Shared registration files are READ-ONLY here** (pre-registered on master in `4b289d4`).
5. **Never edit the six platform files** — above all `field_3d_renderer.ts` and
   `deriveStateMeta.ts`, not even a comment.
6. **Engine findings → `docs/loop_runs/rotmech/_engine/findings_c.md`.** Desk E is the sole
   engine owner; Desk B owns SEAM R findings. Never dispatch an engine fix here.
7. **`APPARATUS_CONTRACT.md` is binding.** Home pose `r = 0.80`, `ω = +1.50`, `m = 2.0`,
   `I_frame 0.50`, `rod_half 1.00`, `drum 0.55`, `r` range 0.15–0.90. Desk A's
   `conservation_of_angular_momentum` opens from the same pose — a teacher moving between the
   two simulations must see one continuing machine.
8. **Progress lines → `docs/loop_runs/rotmech/_progress/c.md`**, never `PROGRESS.md`.
9. No `visual:approve` · no `tts:*` · no `PILOT_CONCEPTS` · no `build:pilot` · no `deploy:*` ·
   no `engine_bug_queue` DB writes · no merge to master · no `npm install` · no `git add -A`.
10. `npx --yes http-server review-site -p 8112 -c-1` (never `serve:review`, hardcoded to 8080).

## Open item needing a founder ruling
`torque` (#5) and `moment_of_inertia` (#6) precede `angular_momentum` in the approved teaching
order and are not in this wave. A `prerequisites` array naming them points at ids registered in
`VALID_CONCEPT_IDS` with no concept JSON. Get the ruling before seal, not at seal.
