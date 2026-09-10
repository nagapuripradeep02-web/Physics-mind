# MODEL PROBES — what we measured, what we decided (living log)

> Every model measurement for the student products goes here, newest run appended at the bottom.
> Raw data: `docs/reports/model_probes/data/<run>/` (`sample.json` + `results.jsonl`, committed text).
> Photos/crops: `pdfs/probes/<run>/photos/` (gitignored — Allen and TSCHE pages never enter git).
> Scripts: `scripts/model_probes/`. Started 2026-09-10 (founder request: "everything we do, we put into the file").

## 1. Rules of the game

The product input is a phone photo of a printed question plus a one-line ask. Every probe sends
exactly that — one of four student phrasings rotated by question index ("Please solve this
question", "Please explain and solve this question", "Please solve and explain the question",
"What is the answer?") — never a system prompt, never a big prompt. **One call reads the photo
and solves**, so a separate vision read is not needed. Grading is a regex over the model's
closing lines (the option stated LAST wins) followed by a **hand pass over every miss** against
the crop and the key. Three things are reported in their own columns and never folded into
"wrong": a **disputed key** (the model's answer is defensible and the printed key is not), an
**excluded question** (a defective crop), and **no answer** (the model returned nothing). 30
questions per cell means roughly ±5 points of noise per cell; treat differences under that as
none.

## 2. Model landscape (verified 2026-09-10 against provider docs and a live `/models` call)

**DeepSeek** (`api.deepseek.com`, OpenAI-compatible, key `DEEPSEEK_API_KEY` in `.env.local` and as a Supabase secret):
- `deepseek-chat` = DeepSeek-V4.1-Flash non-thinking; `deepseek-reasoner` = V4.1-Flash thinking; `deepseek-flash` is the model id the probes use with `thinking: {type: enabled|disabled}` and `reasoning_effort: low|high|max` (default enabled/high). Thinking text comes back as `reasoning_content`; `usage.completion_tokens_details.reasoning_tokens` counts it.
- **R1 is retired** — folded into hybrid thinking since V3.1. **V4-Pro is routed to V4.1 Flash from 14 Sep 2026**, so "Flash" is the only DeepSeek model that exists for us.
- Vision: `image_url` data-URL content parts, ≤ 1,024 tokens per image.
- Price per million tokens, **off-peak / peak** (peak = 01–04 and 06–10 UTC on weekdays, i.e. 06:30–09:30 and 11:30–15:30 IST): input cache-miss $0.15 / $0.30, cache-hit $0.003 / $0.006, output (thinking included) $0.60 / $1.20. Our probes ran at peak; both tariffs are always shown.

**Google Gemini** (key `GOOGLE_GENERATIVE_AI_API_KEY`): 2.5 Flash $0.30 in / $2.50 out per million; 2.5 Flash-Lite $0.10 / $0.40. **The project is on the free tier: `GenerateRequestsPerDayPerProjectPerModel-FreeTier = 20`.** That is the whole project's daily quota for gemini-2.5-flash — one student's photo cap. The EAPCET photo step (`ep-photo-read`) is blocked on this until billing is enabled; a text-only call answering is NOT proof the image path has quota.

**Anthropic** (key `ANTHROPIC_API_KEY`, metered): present, used live only as a low-confidence vision fallback (`src/lib/sonnetVision.ts`) and by the visual-validator ladder. No OpenAI / OpenRouter / xAI key exists.

## 3. What the code routes today

`src/lib/modelRouter.ts` maps simple_chat / concept_explanation / mcq_generation / diagnostic_quiz / concept_tag / simulation_tip → `gemini-2.5-flash`; complex_problem and image_analysis → `claude-sonnet-4-6`; animation_generation → `deepseek-chat`. Its `detectTaskType` has no subject signal at all (taskHint → hasImages → isComplex → default). **Stale**: Gemini 2.5 Flash is listed at $0.10/$0.30 per million (real $0.30/$2.50 — `ep-photo-read/index.ts:71` and `visionGate.ts:100` carry the right numbers); `deepseek-chat` at $0.14/$0.28 is V3-era. **Bypassed**: of 25 `task_type` values in `ai_usage_log`, only three go through the registry; every image path in the repo (`ep-photo-read`, `photoGrader.ts`, `chat/route.ts`, `sonnetVision.ts`, `visionGate.ts`, `aiSimulationGenerator.ts`) hardcodes Gemini first. There is **no DeepSeek vision call anywhere in the repo** — the harness in `scripts/model_probes/` is the first.

## 4. The power-user cost question

"A student uploads 20 photos a day for 30 days = 600 questions not in our bank. What does it cost?"
- Two-call design (Gemini 2.5 Flash reads the photo, DeepSeek solves the text): the read alone is ≈ $0.001 per photo measured in the `ep-photo-read` ledger (`$0.00103`, 1,935 tokens) → ≈ $0.62 per 600, plus the solve.
- **One-call design (measured below): DeepSeek V4.1 Flash reads and solves in the same call** at $0.20–$0.65 per 600 EAPCET questions and $0.39–$1.34 per 600 JEE Main questions off-peak (double at peak). In rupees at ₹84: ₹17–₹113 per power-user-month off-peak. The two-call design is not needed.

## 5. Run 1 — EAPCET, text-only questions (2026-09-10)

Sample: 30 physics + 30 chemistry + 30 maths from the TG EAPCET bank (2021–2025), seed 20260910, excluding `needs_figure`, disputed keys and low-confidence transcriptions. Photos were **rendered** from the bank text onto paper with tilt/blur/JPEG (the official crops carry the key's green tick, so they cannot be shown to a model). Data: `data/eapcet_text_2026_09_10/`.

| Subject | off | low | high | max | out tokens off→max | avg s off→max |
|---|---|---|---|---|---|---|
| Physics /30 | 28 | 29 | 29 | 29 | 352 → 1,042 | 5 → 10 |
| Chemistry /30 | 27 | 28 | 29 | 30 | 360 → 2,077 | 7 → 15 |
| Maths /30 | 29 | 30 | 30 | 30 | 568 → 1,842 | 6 → 11 |
| **Total /90** | **84** | **87** | **88** | **89** | | |

- The one physics miss at every level is a **wrong official key**: Poiseuille flow with 1% change in radius, viscosity and density — the model's 3% is right, the key says 1%.
- Thinking tokens ≈ 1,400 at every effort; effort barely changes the bill: **$0.20 (off) → $0.65 (max) per 600 questions off-peak, $0.41 → $1.30 at peak.**
- Real misses after the hand pass: chemistry 2021-08-04 FN q150 (low/high), 2025-05-03 AN q136 (off/low), 2024-05-10 FN q155 and 2024-05-09 AN q153 (off); physics 2022-07-19 AN q094 (low/high); maths 2023-05-13 FN q051 (off, no option stated).
- Caveats: rendered prints, not phone photos; no figure questions; ±5 points per cell.

## 6. Run 2 — JEE Main 2024, real typeset crops (2026-09-10)

Sample: 30 per subject cut from the 20 Allen-typed JEE Main 2024 papers (`C:/Tutor/nta-source/jee-mains-2024/`, text layer; 2025 papers are scans and unusable), the crop ending just above the `Ans.` line so no key or solution ink enters the JPEG. Section B numericals (q21–30 / 51–60 / 81–90) graded as integers with 1% tolerance. One chemistry crop (09-apr-shift-2 q70) cut off the reactant structure and is **excluded** (n = 29). Data: `data/jee_main_2026_09_10/`; table from `scripts/model_probes/jee_final.py`.

| Mode | Physics /30 | Chemistry /29 | Maths /30 | Total /89 | Thinking tokens avg | p95 latency | $ per 600 q off-peak / peak |
|---|---|---|---|---|---|---|---|
| off | 29 | 23 | 25 | 77 | 0 | 16 s | $0.39 / $0.78 |
| low | 30 | 25 (+1 disputed) | 29 | 84 | 2,340 | 39 s | $0.98 / $1.96 |
| high | 30 | 24 (+1) | 29 | 83 | 2,970 | 53 s | $1.20 / $2.40 |
| max | 29 | 23 (+1) | 30 | 82 | 3,370 | 68 s | $1.34 / $2.68 |

Per-subject cost at max, off-peak: physics $0.0012, chemistry $0.0028, maths $0.0028 per question. Chemistry thinks ~4–5k tokens at high/max and takes 25 s on average.

**Error taxonomy (hand-checked against the crops):**
- Physics: 01-feb-shift-2 q45 (off — computed ½ then second-guessed to ⅔); 05-apr-shift-2 q36 (max — misread the mean-free-path options). Low and high: 30/30.
- Maths: off missed 5 (one answered "34, not in options"); low and high missed only 06-apr-shift-1 q03 (∫ gives ⅓, key ⅙); max 30/30.
- **Chemistry — five organic traps that no effort level fixes:** 08-apr-shift-1 q73 (the "naphthalene" drawn with four double bonds is NOT aromatic; model picks A and B at all four levels); 30-jan-shift-2 q86 (symmetric triene: 4 geometrical isomers, model says 2³ = 8); 09-apr-shift-2 q88 (counts chlorobenzene as unable to do Friedel–Crafts: 5 vs 4); 29-jan-shift-1 q89 (4-nitrobenzaldehyde counted Fehling-positive: 4 vs 3); 31-jan-shift-2 q63 (bromobenzene + conc. HNO₃ then NaOH: skips the trinitro/picric-acid route). Also 30-jan-shift-2 q81 and 04-apr-shift-2 q75 at off only. One max call spent all 32,000 tokens thinking on the cut-off crop and returned nothing.
- **Disputed key**: 01-feb-shift-1 q74, increasing ionic character. Pauling ΔEN puts ClF₃ (0.82) below SO₂ (0.86), which is the model's order at low/high/max; the key says the reverse.
- **15 grader corrections** the regex got wrong and the hand pass fixed: an integer answer written "2 × 10⁻⁴ m" read as −4; "1.93 × 10⁵ C" where the exam integer is 2; an option named by its text without the number ("(4) Decreases", "formaldehyde"); `\boxed{\text{Correct reaction: (2)}}`.

## 7. Decisions so far

- **Effort per subject on DeepSeek V4.1 Flash**: maths `max` (only zero-error level), physics `low` (30/30, half the latency of max), chemistry — the effort level does not matter, the model is the limit (23–25 of 29 at every level on JEE organic).
- **A single default**: `low` — 84/89 JEE at $0.98 per 600 with a 39 s p95, against `max` at 82/89 for $1.34 and 68 s.
- **Do not put JEE organic chemistry on this model alone.** A second opinion (another model, or a bank hit) is required before the chemistry route ships.
- The one-call design replaces the Gemini-read + solve design for questions outside the bank.

## 8. Open questions

- **Chemistry alternative** (founder: deferred on 2026-09-10 until the figure probe is done). Candidates and what each needs: Claude Sonnet 5 via the existing Anthropic key (≈ $3–5 for the 60 chemistry crops, runs today); Gemini 2.5 Flash / Pro (needs Google billing first); Claude Opus 5 as a ceiling (≈ $15–25).
- Real phone photos (glare, shadow, handwriting in the margin) vs these typeset crops with a photo effect.
- JEE Advanced (not on disk), figure-heavy questions (Runs 3–4 below), a figure source for maths (none exists in either corpus).
- `modelRouter.ts` price table and the `image_analysis → claude-sonnet-4-6` fiction.

## 9. How to rerun

```
# from C:\Tutor\physics-mind, DS_PROBE_OUT picks the run directory under docs/reports/model_probes/data/
DS_PROBE_OUT=eapcet_text_2026_09_10 python scripts/model_probes/ds_probe.py report
python scripts/model_probes/jee_final.py                       # Run 2 table with hand grades
DS_PROBE_OUT=<run> python scripts/model_probes/ds_probe.py run 2   # resumable; delete '"error"' lines first to retry
python scripts/model_probes/eapcet_figure_crop.py sample|crop|gate|sheet   # Run 3 crops (gate must PASS before run)
```
The DeepSeek key is read from `.env.local` by name only; never print it.

## 10. Run 3 — EAPCET FIGURE questions, real crops with the key redacted (2026-09-10)

Sample: 30 physics + 30 chemistry flagged `needs_figure` in the bank (seed 20260911; `transcription_confidence high`, key and second reader agree, not disputed). **Maths has no figure questions in the corpus** (0 of 2,080 rows), so it is absent by fact, not by choice. Physics figures cluster in current electricity, semiconductors and magnetism; chemistry figures are mostly organic structures, and half of them sit in the OPTIONS, so the crop keeps the options.

**How the photos were made** (`scripts/model_probes/eapcet_figure_crop.py`): the official crops leak the key twice (the ✔/✖ icons and the green/red fill of the option-label span), so each question was re-cropped from the source PDF after redacting, in memory, every coloured label (re-drawn in black), every icon beside a label (including the one that wraps to the top of the next page), and the `Chosen Option` value. Gate before any call: a pixel scan for key-green/key-red blobs on all 60 JPEGs (0 leaks), a text-layer scan, an icon-uniformity check (an option WITHOUT an icon would name the key by absence — the 2025 layout failed this on the first build because its red crosses are 16.3 pt and its green tick 10.9 pt), a **negative control** (the same gate flagged 60/60 official crops), and two contact sheets read by eye. Data: `data/eapcet_figures/` (`hand.json` holds the 51 hand grades and the 4 disputed rows).

| Mode | Physics /30 | Chemistry /30 | Total /60 | Thinking tokens avg | p95 latency | $ per 600 q off-peak / peak |
|---|---|---|---|---|---|---|
| off | 25 (+1 disputed) | 23 | 48 | 0 | 34 s | $0.43 / $0.86 |
| low | 25 (+1) | 26 | 51 | 4,330 | 90 s | $1.73 / $3.46 |
| high | 26 (+1) | 28 | 54 | 4,480 | 73 s | $1.79 / $3.58 |
| max | 25 (+1) | 27 | 52 | 5,620 | 106 s | $2.20 / $4.40 |

Against Run 1 (text-only EAPCET, same model): physics 29/30 → 25–26/30, chemistry 30/30 at max → 27–28/30. **A figure costs about 4 points per subject and 3× the thinking tokens** (1,400 → 4,300–5,600), and the p95 latency goes from 10–15 s to 60–105 s.

**What went wrong (hand-checked against the crops):**
- **Physics misses are figure-reading errors, not physics errors**: the four loop orientations vs B (2023-05-14 AN q108 — it swapped the n̂ directions of III and IV at every thinking level); the 5-gate circuit (q119 — read the final AND as an OR/XNOR at low/high/max; off got it right); the NOR-gate circuit (2022-07-20 FN q119, low); a bridge/battery circuit (2024-05-09 AN q107, off) and the three-battery loop (2022-07-18 AN q107, off).
- **Thinking that never ends**: 4 of 240 calls (the ±-uncertainty capacitor question at low/high/max and the three-battery loop at max) burnt the full 32,000-token budget and returned nothing. Run 2 had one such call; text-only Run 1 had none. Figures trigger it.
- **Wrong official key**: 2022-07-18 FN q089 — a 20 kN triangle over 2 ms is 20 N s; on 100 g that is +200 m/s, so 210 m/s (the model, every level); the key says 410. Counted as disputed, not wrong.
- **Chemistry**: the PV-vs-P curve for He (2021-08-05 AN q128) wrong at every level (it picked the H₂-like curve); the salicylic-acid bromination sequence (2022-07-18 AN q155) wrong at low/high/max — at max it derived 2,4,6-tribromophenol, which IS option 2, then wrote "option 1"; the benzanilide product (2023-05-12 FN q159) wrong at low/max/off, right at high. Off-mode adds four more, mostly option-matching slips on structures.
- **Grader lesson**: 2023 papers label options with 11-digit IDs, so the model answers "option 28393622397" or "the first option"; 27 of the 51 hand grades were IDs mapped back to ordinals from the PDF, and "4 Ω" was read by the regex as option 4. Any automatic grade on this corpus must map IDs first.

**Decision impact:** for EAPCET figure questions `high` is the best level (54/60) and `off` is not acceptable (48/60). Expect ~85% on figure questions vs ~97% on text questions, at 3× the cost per question.

## 11. Run 4 — JEE Main 2024 FIGURE questions (2026-09-10)

Sample: 30 physics + 30 chemistry crops that carry a figure, selected by `scripts/model_probes/jee_figure_select.py` from the same 20 Allen papers (seed 20260912, none of the Run 2 questions). The selector fixes the extractor's biggest figure-dropping path (an `Ans.` line inside a merged text block now ends the crop instead of discarding the question: 757 → 1,017 usable questions), scans only the crop rect for ink clusters (vector ≥45×38 pt for physics, ≥26×22 pt for chemistry structures; raster ≥70×45 / 40×30), refuses any crop that an `Ans.`/`Sol.` line touches (the first build leaked solutions through exactly this hole), and shows a contact sheet for an eye check — 6 of 96 candidates were false positives (a match-list table, a vector-formula question, assertion-reason, and three text questions) and were replaced by spares. JEE Main maths has no figure questions in this typeset. One chemistry crop (29-jan-shift-1 q68) cut off the bromine on two options and is **excluded** (n = 29). Data: `data/jee_figures/`.

| Mode | Physics /30 | Chemistry /29 | Total /59 | Thinking tokens avg | p95 latency | $ per 600 q off-peak / peak |
|---|---|---|---|---|---|---|
| off | 23 | 21 | 44 | 0 | 14 s | $0.21 / $0.42 |
| low | 29 | 24 | 53 | 4,720 | 102 s | $1.83 / $3.67 |
| high | **30** | 25 | 55 | 4,910 | 105 s | $1.89 / $3.78 |
| max | **30** | 23 | 53 | 5,130 | 87 s | $1.97 / $3.93 |

Against Run 2 (JEE text-mostly crops): physics is unchanged with thinking on (30/30 at high, 29 at low) but collapses without it (29 → 23 at off); chemistry is the same 23–25 of 29 it was without figures. Thinking on a JEE physics figure costs ~4,000 tokens (Run 2: 1,300–1,900), so **a figure roughly triples the cost per question** here too.

**What went wrong (hand-checked):**
- Physics: with thinking on, one miss in 120 calls (01-feb-shift-1 q34, the ladder circuit of 5 V cells and 0.2 Ω resistors, at low). Off-mode misses were circuits, a logic-gate bulb, a lens chain and two integer questions.
- Chemistry, at every level: the aromatic count (08-apr-shift-2 q86) — the first structure is a dihydro-naphthalene with sp³ carbons, the same trap as Run 2, and the model counts it aromatic; "most stable species" (30-jan-shift-1 q65) — option 4 is 1,3-cyclohexadiene and the model reads it as benzene; the aromatic-compound count (27-jan-shift-1 q86) — the model counts only rings that are aromatic "as a whole" (2) while the exam counts compounds containing a benzene ring (3); the optically-active count (08-apr-shift-2 q83) at low/max/off. Two calls (04-apr-shift-2 q62, high and max) burnt the 32,000-token budget and returned nothing.
- Integer grading: "3.24 × 10⁻⁶ J" and "18/17 Ω" are the exam integers 3 and 1 and were graded so by hand.

## 12. Decisions after Runs 3–4 (figures)

- **Physics figure questions need thinking ON.** Off mode drops to 23/30 on JEE figures and 25/30 on EAPCET figures. `high` is the level to use: JEE 30/30, EAPCET 26/30 (+1 wrong key). It costs ~$0.003 per figure question off-peak (≈ 3× a text question) and a p95 latency of 60–105 s.
- **EAPCET physics figures are the weak spot for this model** (25–26/30 at every thinking level; the misses are orientation, logic-gate and multi-battery circuit reading, plus 4 runaway-thinking calls in 240). JEE physics figures, cleaner typeset, are 30/30. The EAPCET crops carry a Telugu duplicate, a CBT metadata header and lower print quality — closer to what a student's phone will actually send.
- **Chemistry stays 23–28 of 30 regardless of figures or effort**, and the misses are the same organic traps as Run 2 (non-aromatic isomers drawn to look aromatic, counting conventions, misread ring structures). The chemistry alternative-model question stands.
- **Runaway thinking is a real failure mode on figures**: 4 of 240 EAPCET calls and 2 of 240 JEE calls hit the 32,000-token cap and returned nothing (Run 1: 0 of 360, Run 2: 1 of 360). A product must set a lower `max_tokens` and fall back (retry at `low`, or another model) instead of waiting two minutes for nothing.
- **Per-600 cost for a power user is therefore a mix**: text questions $0.65 (max) / figures ~$1.8 (high) per 600 off-peak; double at peak. Still under ₹350 per power-user-month at the worst mix.

## 13. Run 5 — Is it the picture or the chemistry? The missed items re-asked as TYPED TEXT (2026-09-10)

Six JEE chemistry items DeepSeek V4.1 Flash missed from the photo were typed out (structures as names / SMILES) and asked again at `high`, two draws each (`scripts/model_probes/chem_text_vs_image.py`, data `data/chem_text_vs_image/`). Two of them were already pure text in the photo, so they are controls.

| Item | From the photo | From typed text (2 draws) | Verdict |
|---|---|---|---|
| Aromatic set (08-apr-1 q73): the "naphthalene" drawn with four C=C | wrong at all 4 levels | **right, right** | picture: reads the drawn skeleton as naphthalene |
| Most stable species (30-jan-1 q65): option 4 is cyclohexa-1,3-diene | wrong at all 4 levels | **right, right** | picture: reads a two-double-bond hexagon as benzene |
| Bromobenzene → conc. HNO₃ → NaOH/HCl (31-jan-2 q63) | wrong at all 4 levels | **right, right** | picture: the option structures are not matched correctly |
| Geometrical isomers of the symmetric triene (30-jan-2 q86) | 8 at all 4 levels (key 4) | 2 runaway draws, then **4, 4** (24–30k thinking tokens) | picture + heavy reasoning: from the drawing it never sees the symmetry |
| Friedel–Crafts count (09-apr-2 q88, text-only question) | 5 at high/max, 4 at off/low | **4, 4** | unstable, not a reading problem |
| Fehling count (29-jan-1 q89, text-only question) | 4 at low/max | **4, 4** (key 3) | chemistry: it believes 4-nitrobenzaldehyde gives Fehling's test |

**Reading:** four of the six recurring misses disappear once the structure is given as text. The bottleneck on JEE organic chemistry is **reading drawn structures** (where the double bonds are, whether a ring is saturated, matching a derived product to the drawn options), not the organic chemistry itself. One miss is genuine chemistry knowledge (aromatic aldehydes and Fehling's), and one is run-to-run instability. This is the same class of failure as the physics figure misses (loop orientations, gate shapes): **the model solves what it reads, and it misreads drawings.**

**What this points to:** a separate *reader* for drawings — a stronger vision model (Gemini 2.5 Flash/Pro, Claude) or a chemistry structure recogniser (OCSR → SMILES) that turns the photo into text plus SMILES — with DeepSeek V4.1 Flash as the *solver*. The next measurement is the split pipeline on the same 60 chemistry crops: (a) transcribe with a stronger vision model, (b) solve the transcription with DeepSeek at `high`, (c) compare with the stronger model solving directly. Needs either Google billing (Gemini) or the Anthropic key (Claude). Not run yet — founder's call.

## 14. Run 6 — a stronger reader for drawings (Gemini 3.8 Flash) — BLOCKED on billing (2026-09-10)

The founder created a new Google API key. What the key taught us before any measurement:
- **Gemini 2.5 is retired for new projects.** `gemini-2.5-flash` and `gemini-2.5-pro` answer `404: no longer available to new users`; Google points at `gemini-3.6-flash` and `gemini-3.1-pro-preview`. The live `ep-photo-read` still uses 2.5 Flash on the OLD key's project; moving it to the new key means changing `EP_PHOTO_MODEL` too.
- **Current models and prices** (docs page dated 2026-09-04, paid tier, per million tokens): 3.8 / 3.7 / 3.6 Flash $0.75 in / $3.75 out through 2026-12-31 (then $1.50 / $7.50), thinking billed as output; 3.5 Flash $1.50 / $9.00; 3.5 Flash-Lite $0.30 / $2.50; 3.1 Flash-Lite $0.25 / $1.50; 3.1 Pro Preview $2.00 / $12.00. A question photo is ~1,100 image tokens. That is 5× DeepSeek's input price and 6× its output price; as a reader only (~600 output tokens) it is ≈ $0.003 per photo, about the cost of one DeepSeek figure solve.
- **Both 3.8 Flash and 3.6 Flash solved the cyclohexadiene item (30-jan-shift-1 q65) correctly on one direct call** — the item DeepSeek misread at all four levels. One draw, so a hint, not a result.
- **The new project is ALSO on the free tier**: every quota in the 429 carries the `FreeTier` suffix; `gemini-3.1-pro-preview` has zero free requests; the 3.8 Flash daily cap was exhausted after a handful of calls, and the model returned `503 high demand` on the first question. The run (`scripts/model_probes/gemini_probe.py`, resumable, known misses first) stopped itself with 0 usable rows.

**To unblock:** in Google AI Studio link an active billing account to this new project (Google: "tier upgrades from Free to Tier 1 typically take effect instantly"), then `python scripts/model_probes/gemini_probe.py run 2` and `... report --list`. Budget for the full run (118 questions × direct solve + transcription, plus DeepSeek on the transcripts): about $2–3.
