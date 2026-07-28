# `tts_audio/` — the ONLY backup of rendered narration

Version-controlled copies of every rendered narration clip + its `audio_manifest.json`.

## Why this directory exists

`review-site/` is **gitignored** (`.gitignore:95`), and Rule 30h is explicit that there is **no free
Supabase restore — the local manifest is the only cache**. So before this directory existed, every
rendered clip lived in exactly one untracked folder on one machine. Two ways that bit us on
2026-07-28 alone:

- `vsepr_molecular_shapes`' 17 clips existed **only** inside the `Viditra-chem3d` worktree. The
  branch merged to master and the audio did not travel with it, because a gitignored path never does.
- A `review-site/` clean at any point would have silently destroyed all of it. Re-rendering is real
  Sarvam spend, not a free rebuild.

## Restore

`build:review` writes into `review-site/<id>/` and preserves audio already there, so restoring is a
copy:

```bash
cp -R tts_audio/<concept_id>/audio          review-site/<concept_id>/
cp    tts_audio/<concept_id>/audio_manifest.json review-site/<concept_id>/
```

## Contract

- **English only.** Telugu is retired (Rule 30i) and Hindi is authored as text but never voiced.
- Voice with `npm run tts:generate -- <id> --langs=en`. It is hash-aware, so unchanged sentences are
  skipped and re-runs are cheap — but a *reworded* sentence is a new paid render. Voice only after
  the narration text has settled.
- **Re-copy here after every render.** Nothing automates that yet.
- Playback still defaults to muted (Rule 24 — the sim is the teacher's silent visual). These clips
  exist so the narration toggle actually produces sound when a teacher switches it on.

## Pre-flight before rendering any concept

1. **`tts_sentence` ids must be unique across the whole concept.** State-scope them (`s1_1`, `s2_1`,
   …). Neither the Zod schema nor `validate:chemistry` checks this — only `tts:generate` does, and it
   refuses rather than silently overwriting clips keyed by id. `bohr_model_energy_levels` shipped
   with 31 sentences numbering from `s1` in every state and had to be renamed before it could be
   voiced. **`validate:concepts` currently reports this defect class across dozens of physics
   concepts**, so any of them will hit it the first time someone tries to voice it.
2. **`ffmpeg` must be installed.** Without it Sarvam returns audio, the wav→mp3 step fails, and the
   paid calls are discarded (23 were lost this way once).

## Inventory (2026-07-28)

| Concept | Clips |
|---|---|
| `bohr_model_energy_levels` | 31 |
| `law_of_conservation_of_mass` | 23 |
| `kinetic_particle_theory` | 19 |
| `vsepr_molecular_shapes` | 17 |
