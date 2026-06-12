# PhysicsMind — Founder Runbook (Contributor Review Sessions)

**Version 1.0 — June 2026. Internal — do not send to contributors.**

---

## 0. Tonight, before the first call (~45 min)

- [ ] Create the Google Sheet from `review_form_template.csv` (File → Import in Google Sheets). One tab per simulation; copy the template tab and rename it (e.g., `magnetic_field_wire`). Delete extra state rows so the tab has exactly the sim's real state count.
- [ ] Add dropdowns: select the Verdict column → Data → Data validation → list: `Good, Minor, Major`. Same for Category column: `too fast, too crowded, missing visual, wrong emphasis, physics error, confusing narration, other`.
- [ ] Share the Sheet with her (editor on her tabs only is fine).
- [ ] Send her: `CONTRIBUTOR_GUIDE` + `CONTRIBUTOR_AGREEMENT` (PDF or the file). Ask for "I AGREE — [name, date]" on WhatsApp **before** the session.
- [ ] Pick simulation #1 (recommend `magnetic_field_wire`). **Do NOT send her any sim link tonight.** The First-Look only counts if it is genuinely her first look.
- [ ] Start `npm run dev` before the call; test the sim once yourself; close that tab.
- [ ] Zoom: enable recording (local is fine) + remote control.

## 1. Session agenda (~90 min, one simulation)

| Time | What | Your job |
|---|---|---|
| 0–15 | Brief: what PhysicsMind is, what the data is used for, confirm agreement received, confirm ₹500/packet | Talk |
| 15–20 | Start recording. Share screen, give her remote control. Open the sim NOW | Setup |
| 20–45 | **First-Look**: auto mode, narration ON, she thinks aloud | **STAY SILENT.** Do not explain, defend, or coach. Note timestamps of her strongest reactions |
| 45–80 | **Teaching pass**: she mutes TTS and teaches you as a student | Act like a real student: ask 2–3 honest questions ("why did it curve that way?"). Don't show product knowledge |
| 80–90 | Explain the Review Sheet, agree submission deadline (next day) | Walk her through 2 rows as examples |

**Hard rules for you:** never send the link in advance · never interrupt the First-Look · never argue with a flag during the session (clarify later in QA) · never pay before QA.

## 2. QA checklist per submitted Packet (~30 min)

- [ ] Every state row has a verdict; every Minor/Major has reason + fix + timestamp.
- [ ] Spot-check 3 flags against the recording at the stated timestamps — does the recording support the claim?
- [ ] Specificity test: could json-author act on each flag without asking her anything? If not → send back: "state N — what exactly, where exactly?"
- [ ] Rubber-stamp test: all-Good on a sim with known defects = calibration conversation, not payment refusal (first time).
- [ ] Log the packet in the tracking tab: date, sim, # flags by severity, accepted?, paid?, your notes on her signal quality.
- [ ] Pay via UPI within 48h of acceptance. Prompt payment = retention.

Then: convert accepted flags into `proposal_queue`-style items (concept_id, state_id, category, reason, suggested_fix, evidence=timestamp) and fix via the normal pipeline.

## 3. The solo-transition gate (sims 4–5 onward)

She works alone ONLY after **two consecutive Packets pass QA without rework**. Solo protocol:
- She still receives the sim link only at the agreed start time (send it, she starts within the hour).
- She self-records (Zoom solo meeting or any screen recorder) — recording with audio remains mandatory; no recording, no payment.
- Same Sheet, same checklist, same QA. The recording stays the lie detector when you're not present.
- **Blocker to clear first:** she needs her own access — time-boxed tunnel while you're online, or the minimum security batch + small deploy. Do not publicly deploy before the security fixes.

## 4. Red flags to watch (anti-gaming)

| Signal | Meaning | Response |
|---|---|---|
| Flags spike after you praise "finding problems" | Manufacturing issues | Re-anchor: Good-with-reason is equally paid |
| All-Good packets, fast turnaround | Rubber-stamping | Calibration talk; compare vs your own known defects |
| Timestamps don't match claims | Filling the sheet from memory/invention | Reject part C, one redo allowed |
| Sim activity in logs before session time | Previewed the sim | First-Look invalid for that sim; use a different sim |
| Quality drops on solo packets vs together packets | Effort discount when unobserved | Return to joint sessions for 1–2 sims |

## 5. Payments & records

- ₹500 per accepted Packet (her caliber justified the premium over ₹400; cap ~₹700 if she negotiates).
- Keep a simple ledger tab: date · sim · packet status · amount · UPI ref.
- Keep all recordings organized: `traces/<sim_id>/<date>_<contributor>_<firstlook|teaching>.mp4` — these are the AI-professor corpus; tag style (Socratic / direct) on ingestion.
