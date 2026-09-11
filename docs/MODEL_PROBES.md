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

## 15. Run 6 (first light) — Gemini 3.6 Flash as the READER, DeepSeek as the solver (2026-09-10)

The founder supplied a second Google key (a new project with $300 of credit). Gemini 2.5 is gone for new projects, so the harness now takes `GEMINI_MODEL` and this run used **gemini-3.6-flash**. Three arms per question, same student ask, same grading: `gem_direct` (Gemini answers from the photo), `gem_read` (Gemini only transcribes: question text, every structure as SMILES plus a name of exactly what is drawn, every option, forbidden to solve), `ds_on_read` (DeepSeek V4.1 Flash at `high` solves that transcript, never sees the image). The question order puts **the items DeepSeek got wrong from the photo first**, so a small quota still answers the question.

**The free tier stopped the run at 9 of 118 questions** (`GenerateRequestsPerDayPerProjectPerModel-FreeTier`; the second key's project is not on the paid tier yet either — a `gemini-3.1-pro-preview` tier check reported free-tier quotas every minute from 15:23 to 15:29). Nine questions is not a result, but all nine are questions DeepSeek previously failed from the photo, so the direction is informative:

| Question (all previously WRONG for DeepSeek from the photo) | key | Gemini direct | Gemini reads → DeepSeek solves |
|---|---|---|---|
| aromatic set, fake naphthalene (08-apr-1 q73) | 1 | 3 ✗ | **1 ✓** |
| geometrical isomers, symmetric triene (30-jan-2 q86) | 4 | 4 ✓ | **4 ✓** |
| Friedel–Crafts count (09-apr-2 q88) | 4 | 4 ✓ | **4 ✓** |
| bromobenzene → HNO₃ → NaOH/HCl (31-jan-2 q63) | 1 | 1 ✓ | **1 ✓** |
| glucose/ribose match list (04-apr-2 q75) | 3 | 3 ✓ | **3 ✓** |
| optical isomerism count (30-jan-2 q81) | 4 | 4 ✓ | **4 ✓** |
| electricity for 1 mol H₂O → O₂ (01-feb-2 q87) | 2 | 1.93 ✓* | **1.93 ✓*** |
| ionic character order (01-feb-1 q74) | 3 | 4 (disputed key) | 4 (disputed key) |
| aromatic count (08-apr-2 q86) | 1 | 1 ✓ | quota stopped |

\* both give 1.93 × 10⁵ C, which is right; the exam wants the nearest integer 2. Hand-graded right, as in Run 2.

**Reading:** the split pipeline solved **8 of 8** items that DeepSeek had failed from the photo (one disputed key aside), and Gemini alone solved 7 of 9 — it repeated DeepSeek's mistake on the fake-naphthalene question, which the reader-then-solver split got right. This is the strongest evidence yet that **the JEE organic failures are drawing-reading failures, and a transcription step fixes them**. It is 9 questions, so it is a direction, not a number.

**Cost, measured:** Gemini 3.6 Flash reads a question photo for ~1,100 image tokens in and 3,000–7,000 out (it thinks while transcribing) ≈ $0.02 per photo at $0.75/$3.75 per million — **7× a DeepSeek solve**, and the transcript then costs a full DeepSeek `high` solve on top (16,000–21,000 tokens on these hard items). A cheaper reader (3.5 Flash-Lite at $0.30/$2.50, or capping the reader's thinking) is the obvious next lever.

**To finish:** link the key's project to the billing account (AI Studio names the project on the key's page; that exact project must be the one linked), then `GEMINI_MODEL=gemini-3.6-flash python scripts/model_probes/gemini_probe.py run 3` — it resumes from `results.jsonl` — and `... report --list`.

## 16. Run 7 — Gemini 3.5 Flash-Lite as reader and as solver, all 118 questions (2026-09-10)

The free daily quota is **per model**, so with 3.6 Flash exhausted the same three arms ran end to end on **gemini-3.5-flash-lite** ($0.30 in / $2.50 out per million): 118 questions × 3 calls = 354, one error. Data `data/chem_reader_lite/` with `hand.json` (39 hand grades, 4 disputed). Baseline for the same questions is DeepSeek from the photo in Runs 2–4.

| Set | Subject | DeepSeek photo (best level) | Flash-Lite alone | Flash-Lite reads → DeepSeek solves |
|---|---|---|---|---|
| JEE Main 2024 (Run 2 sample) | chemistry /29 | 25 | 26 (+1 disputed) | 26 (+1 disputed) |
| JEE Main figures (Run 4 sample) | chemistry /29 | 25 | 21 | **25** |
| EAPCET figures | chemistry /30 | 28 | **29** | 27 |
| EAPCET figures | physics /30 | 26 | 24 (+1 disputed) | 24 (+1 disputed) |
| **Total** | | **104 /118** | **100** | **102** |

Cost per question: Flash-Lite alone $0.0033, the split $0.0046–$0.0069 (reader plus a full DeepSeek `high` solve). DeepSeek alone from the photo is $0.0026–$0.0037 on the same questions. So **the split costs about 1.8× DeepSeek alone and buys nothing overall at this reader quality**.

**The finding is about the reader, not the pipeline.** On the ten hardest chemistry items (the ones DeepSeek fails from the photo), the two readers separate sharply:

| | DeepSeek photo | 3.6 Flash direct | 3.6 Flash split | Flash-Lite direct | Flash-Lite split |
|---|---|---|---|---|---|
| right of 10 | 4 | 8 | **7 of 8** | 6 of 9 | 5 of 9 |

3.6 Flash writes a 4,000–7,000-token transcript that names what is actually drawn ("bicyclic, 4 C=C, two sp³ CH₂"); Flash-Lite writes 200–800 tokens and loses exactly the detail that matters, so DeepSeek then reproduces its original error (the symmetric-triene isomer count is 8 again). **A cheap reader reads less, and the saving comes straight out of accuracy.**

**Where the split still clearly wins:** JEE chemistry *figure* questions, 21 → 25 of 29. That is the set that is nothing but drawings.

**Standing conclusion for the router:** transcribe-then-solve is worth it only with a strong reader, and only on figure/structure questions. The 3.6 Flash arm must be finished on the paid tier before this becomes a design decision — 9 questions is not a number.

## 17. Run 8 — Gemini 3.7 Flash as reader, 5 questions before its own cap (2026-09-10)

The free daily cap is per model and small, so a second strong reader was tried: **gemini-3.7-flash** (same $0.75/$3.75 tier as 3.6/3.8). It reached 5 of the hardest chemistry questions before its own `GenerateRequestsPerDayPerProjectPerModel-FreeTier` cap. Data `data/chem_reader_37/`.

| Question (DeepSeek fails all four levels from the photo) | key | 3.7 Flash alone | 3.7 Flash reads → DeepSeek |
|---|---|---|---|
| aromatic set, fake naphthalene (08-apr-1 q73) | 1 | ✓ | **✓** |
| geometrical isomers, symmetric triene (30-jan-2 q86) | 4 | ✓ | **✓** |
| Friedel–Crafts count (09-apr-2 q88) | 4 | ✓ | **✓** |
| bromobenzene sequence (31-jan-2 q63) | 1 | ✓ | quota |
| glucose/ribose match list (04-apr-2 q75) | 3 | ✓ | quota |
| Fehling count (29-jan-1 q89) | 3 | ✓ | ✗ (4 — the knowledge miss, not a reading one) |

**Strong readers pooled (3.6 + 3.7 Flash), on the hardest chemistry items only:**

| | DeepSeek from photo | strong Flash alone | strong Flash reads → DeepSeek | Flash-Lite alone | Flash-Lite reads → DeepSeek |
|---|---|---|---|---|---|
| right | 4 / 10 | **13 / 15** | **10 / 11** | 6 / 9 | 5 / 9 |

Both strong Flash models also solve the fake-naphthalene and symmetric-triene questions **directly from the photo**, which DeepSeek never does at any effort. The one item neither fixes is the Fehling count, where the model believes 4-nitrobenzaldehyde reacts — genuine chemistry, exactly as the typed-text retest (Run 5) predicted.

**Free-tier reality:** each Gemini model grants only a handful of requests per project per day, so the strong-reader arm cannot be completed without billing. Flash-Lite alone had a large enough allowance to finish all 118 (Run 7).

## 18. Run 9 — Gemini 3.7 Flash on ALL 148 figure + organic questions, paid tier (2026-09-10)

Billing landed on the key's project (the founder re-issued the first new key; it now answers past every free cap). The same three arms ran end to end on **gemini-3.7-flash** ($0.75 in / $3.75 out per million, its own default thinking — no thinking level was set), and the JEE Main physics figures (Run 4 sample) were added as a fifth set so physics is covered on both corpora. 148 questions × 3 calls = 444 rows, zero errors, three workers, ~25 min. Data `data/chem_reader_37/` (`hand.json`: 30 hand grades, 4 disputed — the two known wrong keys, each seen by both arms). Baseline = DeepSeek V4.1 Flash from the photo at `high` on the SAME questions (Runs 2–4).

| Set | Subject | DeepSeek photo `high` | **3.7 Flash alone** | 3.7 Flash reads → DeepSeek `high` |
|---|---|---|---|---|
| JEE Main 2024 text/organic (Run 2 sample) | chemistry /29 | 22 (+1 disputed) | **28 (+1 disputed)** | 27 (+1 disputed) |
| JEE Main figures (Run 4 sample) | chemistry /29 | 25 | **29** | 27 |
| EAPCET figures | chemistry /30 | 28 | **30** | 29 |
| EAPCET figures | physics /30 | 26 (+1 disputed) | 27 (+1 disputed) | **28 (+1 disputed)** |
| JEE Main figures (Run 4 sample) | physics /30 | **30** | **30** | 29 |
| **Total /148** | | **131** | **144** | 140 |

(DeepSeek at `low`/`max` on the same 148: 126 / 125. Flash-Lite alone on its 118: 100.)

**3.7 Flash alone misses 2 of 148.** Both are EAPCET physics circuit readings: the three-battery loop (2022-07-18 an q107 — it reads i₁ = 0, the same misread DeepSeek makes at every level) and a clipper output waveform (2021-08-06 fn q119, option 3 for 4). Every organic-chemistry question in all three chemistry sets is right, including the five "traps" DeepSeek fails at every effort (fake naphthalene, symmetric triene, Friedel–Crafts count, bromobenzene sequence, cyclohexadiene-as-benzene) **and the Fehling count** (the one item Run 5 called a knowledge miss — 3.7 Flash gets it right from the photo; DeepSeek still counts 4-nitrobenzaldehyde when given the transcript).

**The split is now the weaker arm.** With a strong reader the transcript is good, but DeepSeek adds its own failures on top: two runaway-thinking blanks (q86 aromatic count, q62 — 32,000 tokens, no answer), the Fehling belief, an uncertainty-propagation slip on the capacitor network, and two transcript ambiguities it could not recover (the He curve, a voltmeter placement). 140 vs 144, at 1.2–1.7× the cost and 2–6× the latency. **Transcribe-then-solve is dead as a design: solve directly on the strong model.**

**Cost and speed, measured on this run:**

| | thinking tokens | out tokens | avg latency | $/question |
|---|---|---|---|---|
| 3.7 Flash alone — chemistry | 650–790 | 1,100–1,220 | **5 s** | $0.0049–0.0054 |
| 3.7 Flash alone — physics figures | 750–1,150 | 1,220–1,660 | 5–6 s | $0.0054–0.0071 |
| 3.7 reads → DeepSeek `high` | 1,100–6,200 (DeepSeek) | 1,300–6,400 | 6–29 s | $0.0049–0.0093 |
| DeepSeek `high` from photo (Runs 2–4) | 1,300–5,800 | 1,500–6,000 | 10–32 s | $0.0010–0.0037 |

Whole run: 296 Gemini calls $1.55, 148 DeepSeek calls $0.30. Per question 3.7 Flash is **1.5–5× DeepSeek's price and 4–6× faster**; on figure questions specifically it is about 2× the price (DeepSeek's thinking balloons on figures, Gemini's does not).

**Disputed keys, third opinion:** 3.7 Flash also answers 210 m/s on the impulse graph and puts ClF₃ below SO₂ — three independent models against the key on both. Treat those two keys as wrong.

**Decision this supports (see §19):** route every question that carries a drawing, a structure, or a circuit to Gemini 3.7 Flash directly; keep DeepSeek `low`/`max` for text-only questions where it is 97–100% at a third of the price. Caveats: ±5 points per 30-question cell; typeset crops with a photo effect, not phone photos; one model version on one day; Gemini's 3.x Flash promotional price runs to 2026-12-31.

## 19. Decisions after Run 9

1. **Photo with a drawing/structure/circuit → Gemini 3.7 Flash, direct, default thinking.** 144/148 on the hardest sets, 5 s, ~$0.005–0.007. This replaces the "chemistry needs an alternative" open question from §8: the alternative is a stronger reader, and a strong *solver* on the photo beats any reader→solver split.
2. **Text-only photo → DeepSeek V4.1 Flash** (`low` physics/chemistry, `max` maths) — unchanged; ~$0.001–0.002, 97–100%.
3. **Drop the transcribe-then-solve pipeline.** Measured worse than direct at higher cost and latency with the best reader available.
4. **Runaway thinking is DeepSeek-specific** (8 blanks across Runs 3–9; Gemini 0 of 296). Any DeepSeek call needs a lower thinking cap and a Gemini fallback.
5. **Power-user cost with this routing** (600 photos/month, one fifth with figures): ≈ $1.2–1.5 ≈ ₹100–125; all-Gemini would be ≈ $3.3 ≈ ₹280. The 20/day cap and the bank-first path keep the ₹99–199 price viable.
6. Still unmeasured: a question-type classifier that decides the route (or send everything with an image cluster to Gemini and let the crop detector decide); real phone photos; JEE Advanced; Gemini 3.8 Flash (503 "high demand" today) and whether 3.6 vs 3.7 differ at scale.

## 20. Run 10 — the six toughest questions, every worked solution in full (2026-09-10)

Founder ask: solve the single toughest question per subject of EAPCET and JEE Main with DeepSeek V4.1 Flash at every level and with Gemini 3.7 Flash. "Toughest" is measured: per (exam, subject) the item the most model conditions missed across Runs 1–9 (disputed keys and defective crops out; tiebreak = most thinking tokens). The JEE maths top pick (`06-apr-shift-1 mat_q03`) turned out to be a **cut-off crop** (integral limits clipped) — that, not difficulty, is why it failed — so the next item was used. Same ask for all five calls (`Please solve this question`), fresh draws. Script `scripts/model_probes/toughest_six.py`; data `data/toughest_six/` (+ `hand.json`, 3 hand grades); every solution verbatim in **`docs/reports/model_probes/toughest_six_2026_09_10.md`**.

| Exam | Subject | Question | key | DS off | DS low | DS high | DS max | Gemini 3.7 |
|---|---|---|---|---|---|---|---|---|
| EAPCET 2021 | physics | capacitor network, (0.9 ± ?) µF | 3 | ✗ 2 | ✗ 2 | ∅ | ∅ | ✗ 2 (hedges "or 3") |
| EAPCET 2021 | chemistry | PV–P curves, which is He | 3 | ✗ 2 | ✗ 2 | ✗ 1 | ✗ 2 | ✗ 4 |
| EAPCET 2023 | maths | polar of P ∩ chord bisected at Q | 2 | ✓ | ✓ | ∅ | ✓ | ✓ |
| JEE Main 2024 | physics | 8-cell loop, ideal voltmeter | 3 (0 V) | ✗ 1 | ✗ 1 | ✓ | ✓ | ✓ |
| JEE Main 2024 | chemistry | 3,5-dibromocyclopentene + 2 Me₂NH | 2 | ✗ 4 | ✗ 3 | ✓ (cut mid-reason) | ∅ | ✗ 3 |
| JEE Main 2024 | maths | ‖2A‖³ = 2²¹, find α | 2 | ✓ | ✓ | ✓ | ✓ | ✓ |
| **right of 6** | | | | **2** | **2** | **3** | **3** | **3** |

∅ = the 32,000-token thinking budget ran out with no answer (DeepSeek `high` twice, `max` twice; a fifth call answered then ran out).

| | $ for the six | avg latency |
|---|---|---|
| DeepSeek off | $0.018 | 28 s |
| DeepSeek low | $0.076 | 90 s |
| DeepSeek high | $0.081 | 97 s |
| DeepSeek max | $0.086 | 110 s |
| Gemini 3.7 Flash | $0.080 | 11 s |

**Reading.** On questions selected *because* models fail them, nobody is reliable: the best single condition is 3 of 6. Two questions defeat everything — the EAPCET capacitor network (every model computes the nominal 0.9 µF and then picks the quadrature error 0.01 instead of the exam's summed relative error 0.023; Gemini even names 0.023 as "the EAMCET convention" and still commits to 0.01) and the He-curve question (four different answers across five calls; the drawing's slope order is what nobody reads consistently). The voltmeter loop is a thinking-level effect on DeepSeek: off/low reason from a wrong picture ("no current in that branch"), high/max find the 25 A loop current and the 0 V terminal voltage. The organic question is run-to-run unstable on both models (Gemini had it right in Run 9, wrong here; DeepSeek right only at `high`). On these hard items DeepSeek's thinking balloons to the cap and the call takes 2–2.5 minutes — the runaway problem is worst exactly where the question is hardest, and Gemini answers the same items in 5–22 s at the same total cost. Maths, both exams, is solved by everything.

**What this changes:** nothing in the routing decision (§19) — a six-item tail is not a benchmark — but it sharpens the product rule: the AI's answer on a figure question the bank does not hold must be shown as *working to check*, never as the verdict, and any DeepSeek call needs a hard thinking cap with a fallback.

## 21. Run 11 — does a Python sandbox fix the misses? Gemini 3.7 Flash with `code_execution` ON (2026-09-11)

Founder question: can backend code solve these questions? A general solver cannot exist (the input is free text plus a drawing), but a model that can *write and run* code is the practical version. Measured: Gemini 3.7 Flash with its built-in `code_execution` tool, same photos, same ask, on the 148 hard figure/organic questions (code-OFF baseline = Run 9), the 60 maths questions (Gemini never ran on maths — both OFF and ON here), and the six toughest (OFF = Run 10). 268 calls, zero errors, $2.16. Script `scripts/model_probes/code_exec_probe.py`; data `data/code_exec/` (`hand.json`: 15 hand grades, 1 disputed, 1 excluded — the cut-off `mat_q03` crop). Tool re-fed context (`toolUsePromptTokenCount`, ~4,000 tokens/call) is billed at the input rate and is in the $ column.

| Set | code OFF | **code ON** | $/q OFF → ON | avg s OFF → ON |
|---|---|---|---|---|
| EAPCET physics figures /30 | 27 (+1 disputed) | 28 (+1 disputed) | $0.0071 → $0.0105 | 6.3 → 6.7 |
| EAPCET chemistry figures /30 | 30 | 30 | $0.0050 → $0.0067 | 4.7 → 5.2 |
| JEE physics figures /30 | 30 | 30 | $0.0054 → $0.0108 | 5.0 → 6.2 |
| JEE chemistry figures /29 | 29 | 28 | $0.0054 → $0.0081 | 5.0 → 5.7 |
| JEE chemistry text/organic /29 | 28 (+1 disputed) | 29 | $0.0049 → $0.0073 | 5.1 → 5.4 |
| **hard 148** | **144** | **145** | $0.0056 → $0.0087 (+55%) | 5.2 → 5.8 |
| EAPCET maths /30 | 30 | 30 | $0.0060 → $0.0080 | 4.8 → 7.5 |
| JEE maths /29 | 29 | 29 | $0.0069 → $0.0089 | 5.3 → 8.7 |
| **maths 59** | **59** | **59** | +32% | +60% |

Six toughest, OFF → ON: capacitor error ✗→✗ (still 0.01), He curve ✗→**✓** (it cropped and re-read the graph), EAPCET maths ✓→✓, voltmeter loop ✓→✓, organic product ✗→✗, JEE maths ✓→✓.

**Flips on the 148:** fixed by code — the clipper waveform and the three-battery circuit (both figure reads); broken by code — the capacitor error convention and the organic product (both run-to-run unstable on this model anyway). Net +1.

**What the sandbox was actually used for** (114 of 208 code-ON calls ran code): on physics and chemistry, **42 image-zoom/plot snippets (OpenCV/PIL crops of the figure) against 10 computations** — the model uses code to *look closer*, not to calculate; on maths, 49 computations (SymPy/NumPy checks) against 11 zooms — and maths was already 59/59 without it.

**Reading.** Code execution does not move accuracy: +1 of 148 on the hard set, 0 of 59 on maths, at +55% cost and +12–60% latency. The three items that defeat every configuration are unchanged — an exam convention (which error formula), a drawing-slope read, and an organic mechanism — and none of them is a computation. Gemini 3.7 Flash alone is 59/59 on maths from the photo, so maths does not need the tool either. **Decision: do not turn on code execution by default.** Two narrower uses survive: (a) a deterministic *exam-convention* library (error propagation the EAPCET way, sig-fig rounding, g = 10) applied *after* the model — that is the only thing that would have caught the capacitor question, and it is our code, not the model's; (b) showing the model's own numeric check in the working when it ran one, as a trust signal. Both are product features, not accuracy fixes.

## 22. Product cost model from the runs — agreement gate, the review loop, usage personas (2026-09-10/11)

Computed in the session from the committed data; kept here so the decisions have their numbers.

**The two-solver agreement gate (from Run 9 data).** On the 148 hard questions where both Gemini 3.7 Flash (direct) and DeepSeek V4.1 Flash (`high`) answered from the photo, disputed keys aside:

| | questions | agreed answer right |
|---|---|---|
| both give the same answer | 129 (88%) | **129 / 129** |
| they disagree | 17 (12%) | Gemini right 15, DeepSeek right 2, both wrong 0 |

So agreement delivered a verdict on 88% of the hardest questions with zero measured errors, and disagreement flagged every case where one model was wrong. The known hole (Run 10): both can agree on the same wrong *convention* (the EAPCET capacitor error 0.01 vs 0.023) — a convention library after the model, not a third model, is the fix.

**Per-question costs used for the product model** (measured, off-peak): Gemini 3.7 Flash direct $0.004 text / $0.005–0.007 figure; DeepSeek `high` $0.001–0.003 text / $0.003–0.004 figure; the pair ≈ $0.006 text / $0.010 figure. 1,000 non-bank questions a month: pair on everything ≈ $7 (₹600; ≈ $9 at DeepSeek peak 11:30–15:30 IST weekdays); Gemini on all + DeepSeek on figures only ≈ $5.5; Gemini alone ≈ $5; routed single solver ≈ $2.5–3.

**The review loop** (question photo → hidden solve → student uploads a handwritten solution up to 3× → AI reviews → similar question): solve with gate $0.008; each handwritten-solution review **~$0.008 on 3.7 Flash (estimate — not measured; ~$0.003 on Flash-Lite)**; similar question **$0 from the bank** (generated + verified would be $0.004). Worst case per question ≈ $0.036 → 1,000 questions × 3 uploads ≈ **$36 ≈ ₹3,000 a month**; at the 20/day cap ≈ $22.

**Usage personas** (time-budget estimates, not measurements; a doubt costs 4–6 min, so ~30 photo doubts a day is the physical ceiling):

| user | photos/day | questions/month | solution uploads/month | cost (3.7 Flash reviews) | cost (Flash-Lite reviews) |
|---|---|---|---|---|---|
| obsessed average JEE aspirant (30–40% wrong, uploads on half) | 18 | ~540 | ~220 | ≈ $6.1 ≈ ₹520 | ≈ $5.0 ≈ ₹420 |
| heavy user | 15 | ~450 | ~90 | ≈ $4.3 ≈ ₹370 | ≈ $3.9 ≈ ₹330 |
| AIR-1 calibre student (90%+ right, few hard doubts, mock-day spikes) | 8 | ~250 | ~45 | ≈ $2.4 ≈ ₹200 | ≈ $2.1 ≈ ₹180 |
| moderate | 5, five days a week | ~110 | ~20 | ≈ $1.0 ≈ ₹90 | ≈ ₹80 |
| low | 1–2, some days | ~20 | ~3 | ≈ ₹17 | ≈ ₹15 |

The topper is cheap, the struggler is expensive, and the struggler is the customer. A blended base of 5% obsessed / 15% heavy / 40% moderate / 40% low costs ≈ ₹120–130 per user per month against ₹199 — viable, carried by the light users, and the margin shrinks as the product succeeds. JEE aspirants are nearly all non-bank (the bank is EAPCET past papers).

**Levers, in order:** similar question from the bank (free, verified); review on a cheaper model *after measuring it on real handwriting*; a monthly allowance (e.g. 400 photos + 100 solution reviews) instead of a daily cap that blocks mock-review days; one solve per question ever (cache by transcribed-question fingerprint — students in one batch send the same material); price the coaching loop as its own tier. The reviewer itself is designed in `docs/SOLUTION_REVIEWER_ARCHITECTURE.md`.

## 23. Run 12 — retrieval-augmented solving: three similar bank questions in the prompt (2026-09-11)

The "pattern similarity" half of the one-lakh-bank question (`docs/PRODUCT_GAPS_AND_BANK_STRATEGY.md` §3): if the model sees similar solved past questions, does it solve new ones better? Measured with what we have — the EAPCET PYQ bank (4,159 questions: text, options, official key, chapter; **no worked solutions**), BM25 similarity within subject, the three nearest questions with their keys placed in the prompt as "similar past EAPCET questions … for the style, level and conventions this exam expects", then the same photo and ask. Gemini 3.7 Flash direct, the 148 hard figure/organic questions, against Run 9 (photo only). Query text: the sample's own text for EAPCET, the Run 9 transcript for JEE (its crops carry no text). The query's own bank row is excluded; near-verbatim neighbours are flagged. 148 calls, $0.75. Script `scripts/model_probes/retrieval_probe.py`; data `data/retrieval/` (`hand.json`: 14 hand grades — with examples in front of it the model names options by text or ID far more often, so the regex missed 12 right answers; 2 disputed keys).

| Set | photo only (Run 9) | **with 3 bank examples** | $/q |
|---|---|---|---|
| JEE Main chemistry text/organic /29 | 28 (+1 disputed) | 28 (+1 disputed) | $0.0049 → $0.0046 |
| JEE Main physics figures /30 | 30 | 30 | $0.0054 → $0.0052 |
| JEE Main chemistry figures /29 | 29 | 28 | $0.0054 → $0.0047 |
| EAPCET physics figures /30 | 27 (+1 disputed) | **29 (+1 disputed)** | $0.0071 → $0.0063 |
| EAPCET chemistry figures /30 | 30 | 29 | $0.0050 → $0.0047 |
| **Total /148** | **144** | **144** | −8% |

Fixed by examples: the clipper waveform and the three-battery circuit — the two EAPCET physics figure reads that were the only misses in Run 9. Broken: the He PV–P curve and the organic product — the two items already shown to be unstable run-to-run (Runs 10–11). Net zero, at slightly lower cost (the model thinks less with examples in front of it).

**Two facts about the bank itself, found on the way.** (1) **EAPCET 2025 repeated earlier years' questions verbatim**: four 2025 questions had a near-identical neighbour (Jaccard 0.96 and 1.0 on two of them) from 2021–2024 — an exact-hit rate of 4 of 60 on the EAPCET sample, which is the first measured number for "how often does a new question already sit in the bank". (2) BM25 on question text puts only 51% of neighbours in the same chapter; retrieval by chapter tag first, text second, would be tighter.

**Reading.** With keys-only examples, retrieval does not move accuracy on this model — the misses that remain are not about style or convention the bank could show. The convention case (the capacitor error) did not appear here because it is not in the 148; on the six toughest it would need a *worked* neighbour, which the bank does not have. So the honest conclusion for the bank plan: the value of a large bank is **exact and near-exact hits** (free, verified — and the 2025 paper shows they exist), the reviewer's expected-method context, and the similar-question supply — not a lift in the solver's raw accuracy. The retrieval mechanism is worth revisiting only once the bank holds worked solutions (the answer-book and p1-02 waves), and then specifically on convention-type questions.

## 24. Run 13 — syllabus sweep: do the stored solutions use methods beyond Class 11–12? (2026-09-11)

Founder rule: every AI solution must stay at Class 10–12 level, nothing from a bachelor's course. Measured on the solutions we already hold: **506 worked solutions** — Gemini 3.7 Flash direct on the 148 hard questions and the 59 maths (Runs 9, 11), DeepSeek V4.1 Flash `high` on the four base runs (EAPCET text 90, JEE Main 90, EAPCET figures 60, JEE figures 60). Judge: DeepSeek V4.1 Flash with thinking off, JSON output, a prompt naming the ALLOWED set (NCERT 11–12 plus the coaching techniques JEE expects — L'Hôpital, Leibniz rule, King's rule, parameter differentiation, 3×3 determinants…) and the BEYOND set (Lagrangian/Hamiltonian, tensors, Laplace/Fourier, residues, matrix exponentials, Jacobians, higher ODEs, group theory, non-NCERT named reactions, university theorems by name), "used to reach the answer, not mentioned in passing". Script `scripts/model_probes/syllabus_sweep.py`; data `data/syllabus_sweep/`. 506 calls, **$0.04**.

| model | physics | chemistry | maths | flagged |
|---|---|---|---|---|
| DeepSeek V4.1 Flash `high` | 119 | 117 | 60 | **0** |
| Gemini 3.7 Flash | 59 | 88 | 60 | **0** |

**Positive control (run before believing a zero):** six planted solutions through the same judge — a Lagrangian bead-on-wire, a Laplace-transform RC circuit, a residue-theorem integral, a Jacobian change of variables, and two within-syllabus controls (v² = u² + 2as; L'Hôpital). The judge flagged **4 of 4** beyond-syllabus plants with the right reason and passed **2 of 2** within-syllabus ones. The zero is real, not blindness.

Most-used techniques across the 506 (the judge's own list): Ohm's law, electrophilic aromatic substitution, unit conversion, IUPAC rules, Boolean algebra, energy conservation, vector dot product, Markovnikov, carbocation stability, u-substitution, Vieta — the syllabus, as expected.

**Reading.** On exam questions with the product's one-line ask, both models already answer at syllabus level; beyond-syllabus methods did not occur once in 506 solutions. The founder's constraint is therefore cheap to enforce: a short syllabus clause in the system prompt plus this same $0.0001 judge as a post-check that regenerates the rare flagged solution. Caveat: the sweep is over *exam* questions solved from photos; a student's free-text ask ("solve using Lagrangian") or a textbook-style problem may pull a model off-syllabus more often, so the post-check stays on in the product, and the two-plant control should be re-run whenever the judge prompt changes.
