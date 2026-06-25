# Reviewer site vs B2C product — the two surfaces, kept straight

There are **two separate products** in two git worktrees. They are easy to confuse; this page is the map.

| | Reviewer / testing site | B2C product |
|---|---|---|
| **Who it's for** | The teacher/reviewer (Asmi) + you, internally | Students + demos (e.g. the appointment pitch) |
| **Worktree** | `C:\Tutor\physics-mind` (branch `visual-validator-full-build`) | `C:\physicsmind-voice-professor` (branch `feat/voice-professor`) |
| **What it is** | Static HTML review tool — whiteboard (pen / draw-on-sim / board), reorderable state rail, narration | Next.js app, dark/terracotta, AI professor inside the sim |
| **Run it** | `npm run review:all` then `npm run serve:review` | `npm run dev` |
| **URL** | `http://localhost:8080/` | `http://localhost:3000/voice-professor/<concept_id>` |
| **Share remotely** | `npm run deploy:review` → Netlify link | (its own deploy) |

> The whiteboard reviewer lives **only** in `C:\Tutor\physics-mind`. The voice-professor worktree has an older `build_review_site.ts` without the whiteboard — don't use it for reviews.

## The reviewer site, in detail (this worktree)

Built by `src/scripts/build_review_site.ts`. It turns a hand-authored `field_3d` diamond into a self-contained static page (no backend, Rule-18 safe). Per concept it writes `review-site/<concept_id>/{sim.html, index.html, meta.json}` and regenerates `review-site/index.html` — the **catalog** the reviewer lands on.

The catalog auto-scans `review-site/` — **any concept you build shows up automatically**. There is no hardcoded list.

### Commands

| Command | What it does |
|---|---|
| `npm run build:review <concept_id>` | Build one sim + refresh the catalog |
| `npm run review:all` | Rebuild **every** sim listed in `src/data/review_status.json` + catalog |
| `npm run catalog:refresh` | Refresh the catalog only (after editing `review_status.json`) — no sim rebuild |
| `npm run serve:review` | Serve `review-site/` at `http://localhost:8080/` |
| `npm run deploy:review` | Push `review-site/` to Netlify for a shareable link |

### Review tracking — `src/data/review_status.json`

Single source of truth for **what's been reviewed** and **her recorded videos**. You edit it; the catalog renders a green `✓ Reviewed` badge + video links from it.

```json
{
  "<concept_id>": {
    "reviewed": true,
    "reviewer": "Asmi Singh",
    "reviewed_date": "2026-06-18",
    "videos": [{ "label": "State-wise self-review", "url": "" }]
  }
}
```

- Empty `url` → the card shows `🎥 <label> — pending`. Fill the `url` and run `npm run catalog:refresh` → it becomes a clickable link.
- `url` can be an **external link** (Google Drive / unlisted YouTube — recommended, keeps deploys light) **or** a relative path like `./_media/<concept_id>/file.mp4` (put the file under `review-site/_media/<concept_id>/`; it deploys with the site).

## The recurring loop (every new sim)

1. Author a diamond JSON in `src/data/concepts/<id>.json` (must have a `field_3d_config` block).
2. Add an entry for it in `src/data/review_status.json` (start with `"reviewed": false`).
3. `npm run build:review <id>` (or `npm run review:all`).
4. `npm run serve:review` (local) or `npm run deploy:review` (send Asmi the link).
5. Asmi reviews on the whiteboard and records her screen.
6. Set `reviewed: true` + paste the video `url`(s) in `review_status.json` → `npm run catalog:refresh`.

Because the catalog scans the folder, **every sim you build lands in the reviewer site with no extra wiring.**
