# CONCURRENT SESSION HANDOFF — starting #8 `solids_of_revolution` while #9 finishes

**Written 2026-08-27 by the session working `lines_and_planes_in_space` (#9).**
Read this before starting #8 in a second session. It is short on purpose: it is a *collision*
contract, not a build plan. #8's actual spec is named at the bottom.

---

## The one real conflict: `field_3d_renderer.ts`

#8 is a **separate engine purchase** — a new `field_3d` scenario (SR-A / SR-B). #9's remaining work
includes **one engine P3 in the same file** (`vg_formula_overlay_has_no_timed_reveal`). Two sessions
editing `field_3d_renderer.ts` on unpushed branches is the exact origin story Rule 40 was written for,
and it has already happened twice in this repo in one week.

**The agreement, and it is one-directional so nobody has to negotiate mid-flight:**

> **#8 owns `src/lib/renderers/field_3d_renderer.ts`. The #9 session does NOT touch it.**

The #9 session will do its two AUTHORING P3s only and leave the engine P3 filed and unstarted.
If #9 later needs that engine fix, it lands **after** #8's scenario is merged, rebased on it.

Everything else #9 touches is `src/data/concepts/mathematics/lines_and_planes_in_space.json` —
a file #8 has no reason to open.

---

## Three mechanical rules

**1. Never run a blanket cache clear.**
CLAUDE.md §6's `DELETE FROM simulation_cache;` wipes **every** row, not just yours. The other session's
THE EYE run reads a hand-seeded row and will silently capture a stale or missing sim if you clear it
mid-flight. Re-seed only your own concept:

```
npx tsx --env-file=.env.local src/scripts/_seed_subject_cache.ts solids_of_revolution
```

The four-table clear in §6 is for testing the *serving* path. Neither of us is on it.

**2. Work in your own desk, never the office.**
`npm run desk:new -- feat/mathematics-solids-of-revolution` (or check out the existing
`feat/field3d-solids-of-revolution`, which already carries SR-A `a755f0f` + SR-B). The office
(`/Users/karthikyerragadda/Desktop/Viditra/Physics-mind`) is checked out on the #9 branch.

`npm run desk:audit` now reports honest ahead/behind — the fix landed today (PR #140). Before that it
measured against the *local* master ref and reported desks as 0/0 when they were hundreds behind.

**3. Pick a port and verify by CONTENT, not status code.**
This session lost real time to it twice. `npx http-server` dies with `EADDRINUSE` and a **pre-existing
listener answers with HTTP 200 from a different desk's build**. Two stale servers were found running
from five days earlier.

```
curl -s http://localhost:<port>/<id>/sim.html | shasum -a 256   # must equal:
shasum -a 256 review-site/<id>/sim.html
```

Hash `sim.html`, not `index.html` — `index.html` was byte-identical across two desks whose `sim.html`
differed by 6.8 KB. Suggested split: **#9 uses 8091+, #8 uses 8095+.**

---

## Safe to share

- **`engine_bug_queue`** — seed scripts are marker-gated and upsert on `bug_class`; concurrent writes
  are fine. **But:** a plain `select` returns at most **1000 rows** and the table holds **1131**.
  Scanning that capped result and concluding a `bug_class` is absent is a FALSE NEGATIVE — it bit this
  session. Query ids directly (`.in('bug_class', [...])`) or use an exact `count`.
- **`visual_baselines/`** — per-concept directories, no overlap.
- **`tts_audio/`** — per-concept directories, no overlap.
- **Both sessions running THE EYE at once** is fine but each run is ~10 min of CPU; expect both to slow
  down, and expect `EYE_CAPTURE_ABORTED` (a missed sim-time pin) to become *more* likely on a loaded
  machine. That abort is correct behaviour — a frame that missed its pin is not evidence. Re-run on a
  quiet box rather than widening the cap.

---

## Where #8's spec lives

| what | where |
|---|---|
| scenario spec (SR-A / SR-B, closed profile enum, DOM tick labels via `nlbProjPx`) | `docs/MATHEMATICS_PHASE0_VECTORS_3D.md` — see **A26** |
| concept skeleton | `docs/skeletons/solids_of_revolution_skeleton.md` |
| existing engine work | branch `feat/field3d-solids-of-revolution` — SR-A `a755f0f`, SR-B; **not merged, shipping is founder-only** |
| ranked-list entry | `docs/MATHEMATICS_DISCUSSIONS.md` row 8 — *Solids of revolution*, 5.5/7 |
| build plan row | `docs/MATHEMATICS_BUILD_PLAN.md` P0-3D — "#8 = a SEPARATE purchase, now fully specced" |

**A26 records that the wave is ENGINE-COMPLETE and that "the units defect returned in reverse"** — read
that note before touching SR-A/SR-B, it is a known trap in this exact scenario.

Mathematics concepts register **NOWHERE** outside `src/data/concepts/mathematics/` — the 8 registration
sites in CLAUDE.md §6 are forbidden for mathematics ids. Validation is `npm run validate:mathematics`;
`npm run validate:concepts` reads the flat dir non-recursively and **cannot see a mathematics concept at
all**, so a green `validate:concepts` says nothing about #8.

---

## Two habits worth importing from this session

**A green check is only evidence if something was first made to fail.** Seven checks in this session
reported clean while measuring nothing: `desk:audit`'s ahead/behind, a committed-but-never-run seed
script, `founder_drive`'s Rule-37 motion probe, a page-relative pixel threshold, a full-page screenshot
that could not see the sim, a cross-origin `contentDocument` read swallowed by a `try/catch`, and a
greedy `sed` that compared filenames instead of hashes. **None was visible by reading the code.** Every
one surfaced only by constructing the defect and demanding the check catch it.

**A number written in a note is stale the moment the thing it measured moves.** F-6 today: a design note
claimed a label cleared its neighbour by "~73px, pixel-verified against the rendered frame". The shipped
frame gave ~14px, because the capture time had moved in a later re-budget. If you write a measured
number into a skeleton or a `note`, write **what it was measured against** beside it.

---

## #9's state as of this handoff

Merged to master: the concept, its baselines (incl. the `STATE_9@B` scene-group view), 37 EN clips, both
harness fixes (`founder_drive` + THE EYE per-scene-group capture), the desk-audit fix, and F-6.

Open on the #9 desk right now: **F-5 fixed** (one dead `glow` key deleted), the two authoring P3s next.
The concept is **NOT in `PILOT_CONCEPTS`** and must not be added — the founder's 2026-08-07 decision
("don't do the pilot concepts at all") stands, and no mathematics concept has passed the professor gate.
