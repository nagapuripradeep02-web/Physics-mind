# rotmech per-desk progress logs

`PROGRESS.md` at the repo root is a single shared file that `docs/CHAPTER_LOOP.md` has every
sealed concept append to. Five parallel desks appending to one file at one anchor is a
**guaranteed five-way merge conflict**.

So during the Phase-0d parallel wave, each desk writes its session lines to its **own** file
here — `a.md`, `b.md`, `c.md`, `d.md`, `0c3.md` — and never touches `PROGRESS.md`.

After all five desks have merged, the office concatenates these into `PROGRESS.md` in one
commit, in chapter order, and deletes them.

Same reasoning applies to `docs/loop_runs/rotmech/_engine/findings_<desk>.md` (engine findings,
one file per desk, drained by Desk E) and `scar_candidates_<desk>.sql`. One shared append-only
file per five writers is a conflict; one file per writer is not.
