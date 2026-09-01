/**
 * vidiChecks.ts — the shakedown's mechanical checks, as pure functions.
 *
 * Extracted so the harness (src/scripts/vidi_shakedown.ts) and its tests
 * (__tests__/vidiChecker.test.ts) run the SAME code. They previously could not:
 * the harness is an entry-point script with a top-level fetch loop, so a test had
 * to re-declare the functions — and a test of a copy passes while the real one
 * rots. That is the identical failure mode as the copy-pasted persona.
 *
 * These flag; a human judges. Nothing here decides a mark.
 */

/** A mark is written "2 marks", "2-mark", "2 Marks" or the bank's attached "2M".
 *  CASE-SENSITIVE on purpose: the old `/i` flag let `M\b` match the SI metre, so
 *  "24 m/s", "9.8 m/s²" and "10^11 m" all read as mark claims — 7 false
 *  criticals in a 2,040-reply audit (2026-08-24), and in the context the same
 *  slip WHITELISTED physics quantities as authored marks, hiding real inventions.
 *  Replies never write a spaced "2 M" (0 of 2,040), so the bare form must be
 *  attached, which also keeps a chemistry "0.1 M" (molarity) out of the mark set. */
const MARK_TOKEN = /(\d+(?:\.\d+)?)(?:[\s-]*(?:[Mm]arks?|MARKS?)\b|M\b)/g;

/** Every mark value the model was actually GIVEN, read out of its own grounding
 *  text. Reading the context rather than the raw question is what kills the old
 *  false positive: cut totals live in the context but were absent from the
 *  question-derived set, so a correct answer about a 4-mark cut always flagged. */
export function authoredMarks(ctx: string): Set<string> {
    const found = new Set<string>();
    for (const m of ctx.matchAll(MARK_TOKEN)) found.add(m[1]);
    return found;
}

/** Totals the model can legitimately reach by ADDING authored step marks. The old
 *  checker called these "MARK NOT IN BANK" — the documented false positive, where
 *  the model summed 2+1+1=4 correctly. Separated out, not silenced. */
export function reachableSums(ctx: string): Set<string> {
    const steps = [...ctx.matchAll(/^\d+\. \[[^\]]+\] .* — (\d+)M$/gm)].map((m) => Number(m[1]));
    const sums = new Set<string>();
    // The widest question in the bank has 8 steps, so the full subset walk is 256.
    for (let mask = 1; mask < (1 << steps.length); mask++) {
        let t = 0;
        for (let i = 0; i < steps.length; i++) if (mask & (1 << i)) t += steps[i];
        sums.add(String(t));
    }
    return sums;
}

/** Mark values the reply CLAIMS. `[\s-]*` because `\s*` never matched a hyphen,
 *  so "the 4-mark version" walked straight past the old check. */
export function markClaims(reply: string): string[] {
    return [...reply.matchAll(MARK_TOKEN)].map((m) => m[1]);
}

/** Claims traceable to neither the grounding text nor a sum of its step marks.
 *  "0 marks" is never an invented scheme — it is the model saying a skipped step
 *  earns nothing — so a zero claim is exempt. */
export function inventedMarks(ctx: string, reply: string): string[] {
    const a = authoredMarks(ctx), s = reachableSums(ctx);
    return [...new Set(markClaims(reply).filter((m) => Number(m) !== 0 && !a.has(m) && !s.has(m)))];
}

/** Claims the model reached by arithmetic on authored steps — legitimate, but
 *  worth a human glance, so reported separately from an invention. */
export function summedMarks(ctx: string, reply: string): string[] {
    const a = authoredMarks(ctx), s = reachableSums(ctx);
    return [...new Set(markClaims(reply).filter((m) => !a.has(m) && s.has(m)))];
}

export function sentenceCount(reply: string): number {
    return reply.split(/[.!?।]\s+/).filter((s) => s.trim().length > 2).length;
}

/** The persona permits up to three short paragraphs when the student asks to be
 *  walked through the whole answer, so length is only a defect when they did not. */
export function askedForWalkthrough(ask: string): boolean {
    return /\b(explain|walk|full answer|everything|whole answer|step by step)\b/i.test(ask);
}

export function isTooLong(ask: string, reply: string): boolean {
    return sentenceCount(reply) > (askedForWalkthrough(ask) ? 12 : 5);
}

export const IDIOMS = ['nail it', 'piece of cake', 'ace it', 'a breeze', 'hang of it', 'in the bag',
    'crack it', 'no sweat', 'game changer', 'the trick is', 'the whole trick',
    'you have got this', "you've got this", 'you got this', 'the formula knows', 'physics loves'];

/** WORD-BOUNDED, never a substring: a plain `includes` finds "ace it" inside
 *  "repl**ace it**" and "crack it" inside "cra**ck it**self". The first run of the
 *  build-side Rule 41 gate produced exactly that false positive on a real card
 *  ("bearings … replace it with a much smaller kind"). */
export function idiomsIn(text: string): string[] {
    const low = text.toLowerCase();
    return IDIOMS.filter((i) => new RegExp('\\b' + i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(low));
}

/** Telugu written in Latin letters — the defect where an English question is
 *  answered in romanised Telugu. WHOLE-WORD matched: the old substring test could
 *  fire on ordinary English ("unna" inside "running", "ledu" inside "concluded"),
 *  which its own comment claimed was already handled and was not. */
export const TELUGU_IN_LATIN = ['nenu', 'meeru', 'mee', 'cheyyi', 'cheddam', 'cheppu', 'kaani',
    'ikkada', 'ippudu', 'unna', 'gurinchi', 'enduku', 'ledu', 'kavali', 'chala', 'baga'];

export function romanisedTeluguIn(reply: string): string[] {
    const words = new Set(reply.toLowerCase().split(/[^a-z]+/).filter(Boolean));
    return TELUGU_IN_LATIN.filter((w) => words.has(w));
}

/** Markdown must never reach a student: the bubble renders with textContent. */
export function markdownIn(reply: string): string[] {
    const md: string[] = [];
    if (/\*\*[^*]+\*\*/.test(reply)) md.push('**bold**');
    if (/^\s{0,3}#{1,6}\s/m.test(reply)) md.push('# heading');
    if (/^\s{0,3}[-*+]\s/m.test(reply)) md.push('- bullet');
    if (/`/.test(reply)) md.push('backtick');
    return md;
}

/** Did the reply actually ANSWER an out-of-bank question instead of refusing it?
 *
 *  Fires on the SUBSTANCE (the formula), never on wording. The original check also
 *  matched the phrases "ideal gas equation is" and "derivation:", which are part of
 *  the CORRECT refusal — "your ideal gas equation is a different chapter, you can
 *  open it from the catalog". Fine on the single probe it was written for; across a
 *  fleet run it produced 8 false criticals out of 69 probes, every one of which had
 *  refused properly. Zero of the 69 contained the formula. */
export type OutOfBankProbe = { askMatches: RegExp; formula: RegExp };

/** The ideal-gas bait every fleet template carries. A probe about any other
 *  topic passes its own pair — the topic used to be hardcoded here, so a maths
 *  or chemistry out-of-bank ask was mechanically unchecked. */
export const IDEAL_GAS_PROBE: OutOfBankProbe = { askMatches: /ideal gas/i, formula: /\bnRT\b|\bPV\s*=/i };

/** The ORIGINAL maths bait, RETIRED 2026-08-29. De Moivre was chosen because it is
 *  Maths-2A — outside both 1A and 1B — so a correct reply said it was not open and
 *  pointed at the catalog. Maths-2A is now IN the bank (its unit 2 is De Moivre's
 *  theorem, nine LAQs and a VSAQ chapter), so this ask would test a refusal that
 *  must never happen — the exact NERNST_PROBE trap Chemistry-II hit. Kept as
 *  history and for the tests that cite it; no audit template points at it. The
 *  regex lesson stands: fire only on the SUBSTANCE, never on the wording of a
 *  refusal (hardcoding the topic cost the physics probe 8 false criticals out of
 *  69, every one of which had refused properly). */
export const DE_MOIVRE_PROBE: OutOfBankProbe = {
    askMatches: /de\s?moivre/i,
    formula: /cos\s*n\s*(?:θ|theta)|\(\s*cos\s*(?:θ|theta)\s*\+\s*i\s*sin/i,
};

/** The maths bait for 1A, 1B and 2A since 2026-08-29 — NOT for 2B, see below.
 *  Integration by parts is Maths-2B (Integration). It was outside every maths paper
 *  in the bank when this was written, and it is STILL outside 1A, 1B and 2A — but
 *  Maths-2B landed on 2026-08-30 and now carries it on 18 cards, so it is no longer
 *  outside the BANK. It stays correct as those three papers' bait (Vidi must refuse a
 *  question it does not have open, whoever else holds it) and it must NEVER be 2B's.
 Chosen the same way as HENDERSON_PROBE: grepped across all ~2,080
 *  questions first — "integration by parts", "definite integral" and "differential
 *  equation" each return ZERO hits (the six cards containing an ∫ are physics
 *  derivations, none of them the by-parts rule). It is a plausible ask for any
 *  Inter maths student and it has a formula, so the regex matches the SUBSTANCE
 *  (∫u dv = uv − ∫v du, in any of its spellings) and never the wording of a refusal. */
export const INTEGRATION_BY_PARTS_PROBE: OutOfBankProbe = {
    askMatches: /integration\s+by\s+parts|by\s+parts/i,
    formula: /∫\s*u\s*dv|u\s*v\s*[−-]\s*∫\s*v\s*du|\\int\s*u\s*\\?,?\s*dv|uv\s*[−-]\s*(?:∫|\\int)/i,
};

/** The Maths-2B bait. 2B cannot use INTEGRATION_BY_PARTS_PROBE — by parts IS its own
 *  Unit 6, on 18 of its cards — and it cannot use DE_MOIVRE_PROBE either, which 2A
 *  retired when De Moivre entered the bank. Simpson's rule is chosen the way
 *  HENDERSON_PROBE was: grepped across the whole merged bank first, where "simpson",
 *  "trapezoidal" and "numerical integration" each return ZERO cards. It is a
 *  plausible ask for a student holding an integration paper, it is genuinely outside
 *  the TS IPE syllabus, and it has a formula — so the regex fires on the SUBSTANCE
 *  (the h/3 rule with its 4-2-4 weights), never on the wording of a refusal. */
export const SIMPSONS_RULE_PROBE: OutOfBankProbe = {
    askMatches: /simpson|trapezoidal\s+rule|numerical\s+integration/i,
    formula: /h\s*\/\s*3|\(h\s*\/\s*3\)|y0\s*\+\s*4\s*y1|4\s*y[₁1]\s*\+\s*2\s*y[₂2]/i,
};

/** The chemistry bait. Electrochemistry is Chemistry-II — genuinely outside Junior
 *  chapters 1–7 — so a correct reply says it is not open and points at the catalog.
 *
 *  Chemistry used to carry the PHYSICS bait, and that was wrong in BOTH directions.
 *  `ts_ipe_c1_som_ideal_gas_equation` IS a chemistry card; twelve more chemistry
 *  cards mention the ideal gas and seventeen write nRT. So the ask tested a refusal
 *  that must never happen, while IDEAL_GAS_PROBE would have marked every correct,
 *  grounded reply a CRITICAL out-of-bank leak — about 204 false criticals in a run
 *  of 2,040, in the one template both physics graders named as the weak spot.
 *
 *  The topic was chosen by grepping the whole bank first, not by assumption:
 *  nernst, electrochem, galvanic and 0.0591 each return zero hits across all
 *  946 questions. The regex fires only on the SUBSTANCE, never on the wording of a
 *  refusal — the DE_MOIVRE_PROBE precedent, and the reason the physics probe was
 *  rewritten after 8 of its 69 criticals turned out to be proper refusals. */
/** Chemistry-II cannot use NERNST_PROBE: the Nernst equation is a SECOND-year
 *  topic and sits on two of its own cards, so that ask would test a refusal that
 *  must never happen - the exact mistake chemistry inherited from physics and
 *  that the note below was written about. (It also makes the note's own claim of
 *  zero nernst hits across the bank stale as of Chemistry-II; it stays true for
 *  the first-year chemistry cards the chemistry probe is actually asked against.)
 *
 *  Chosen the same way: grepped across all 1,326 questions first. henderson,
 *  hasselbalch and clapeyron each return ZERO hits, while markovnikov and
 *  diels-alder also return zero but carry no equation for the substance regex to
 *  fire on. Henderson-Hasselbalch is a plausible ask for a chemistry student and
 *  has a formula, so the regex matches the SUBSTANCE and never the wording of a
 *  refusal. */
export const HENDERSON_PROBE: OutOfBankProbe = {
    askMatches: /henderson|hasselbalch/i,
    formula: /pK\s*a?\s*\+\s*log|pH\s*=\s*pK|log\s*\(?\s*\[?\s*(salt|base|A[-−⁻])/i,
};

export const NERNST_PROBE: OutOfBankProbe = {
    askMatches: /nernst/i,
    formula: /0\.059\d*|RT\s*\/\s*\(?\s*nF|E\s*=\s*E\s*°/i,
};

export function answeredOutOfBank(ask: string, reply: string, probe: OutOfBankProbe = IDEAL_GAS_PROBE): boolean {
    if (!probe.askMatches.test(ask)) return false;
    return probe.formula.test(reply);
}

/** Step ids that genuinely exist in THIS context's cut. A literal step id only
 *  exists on one question, so a fleet template has to read them back. */
/** The spelled-out mark form alone — "2 marks", "2-mark", "2 Marks". */
const WORDED_MARK_TOKEN = /(\d+(?:\.\d+)?)[\s-]*(?:[Mm]arks?|MARKS?)\b/g;

/** Mark values a reply states ONLY in the bank's attached shorthand ("2M"), never
 *  in words.
 *
 *  In PHYSICS the attached form is unambiguous and stays a first-class mark claim.
 *  In MATHEMATICS it collides with ordinary notation — M is a matrix name — so a
 *  reply writing "let A = 2M", "2M + 3N = 0" or "det(2M) = 8" reads as claiming
 *  marks of 2. Probed against the maths bank 2026-08-24; Matrices is the largest
 *  unit in the book at 55 cards, so this is live, not hypothetical.
 *
 *  This silences nothing. It lets a caller route bare-form-only claims to a human
 *  bucket instead of calling them critical inventions — exactly the way summedMarks
 *  is separated from inventedMarks. Trap 1 of the physics audit was a checker that
 *  lied before the model did; the cure is separation, not suppression. */
export function bareMarkOnlyClaims(reply: string): string[] {
    const worded = new Set([...reply.matchAll(WORDED_MARK_TOKEN)].map((m) => m[1]));
    return [...new Set(markClaims(reply).filter((m) => !worded.has(m)))];
}

export function stepIdsIn(ctx: string): string[] {
    return [...ctx.matchAll(/^\d+\. \[([^\]]+)\]/gm)].map((m) => m[1]);
}

export function diagramStepIdsIn(ctx: string): string[] {
    return [...ctx.matchAll(/^\d+\. \[([^\]]+)\][^\n]*\n\s+WRITE: a labelled figure/gm)].map((m) => m[1]);
}

/** Step LABELS, paired with their ids. `skiplast` is judged on WHICH steps a reply
 *  names, never on the arithmetic — see namesSkippedStepAsMinimum. */
export function stepLabelsIn(ctx: string): { id: string; label: string }[] {
    return [...ctx.matchAll(/^\d+\. \[([^\]]+)\] (.*?) — \d+M$/gm)]
        .map((m) => ({ id: m[1], label: m[2].trim() }));
}

/** The `skiplast` defect, at last checked directly.
 *
 *  The old signal was summedMarks: it flagged the arithmetic the template EXISTS to
 *  perform (total minus the skipped step) and fired ~120 times across the 2026-08-24
 *  maths audit with zero true positives — while staying silent on all four replies
 *  that were genuinely wrong. The failure is never the number; it is naming the
 *  SKIPPED step inside the minimum the student must still write.
 *
 *  So: find the sentence that states the minimum, and look for the skipped step's own
 *  label words in it. Content words only, because "the" and "of" match everything. */
export function namesSkippedStepAsMinimum(ctx: string, skippedStepId: string | null, reply: string): boolean {
    if (!skippedStepId) return false;
    const step = stepLabelsIn(ctx).find((s) => s.id === skippedStepId);
    if (!step) return false;
    const sentences = reply.split(/(?<=[.!?])\s+/)
        .filter((s) => /\b(minimum|at least|you must (still )?write|must write)\b/i.test(s));
    if (!sentences.length) return false;
    const STOP = new Set(['the', 'and', 'for', 'into', 'from', 'with', 'that', 'this', 'its', 'take', 'then']);
    // Stem to a 5-char prefix: the reply writes "simplified" where the step label
    // says "Simplify", and an exact substring test misses that (measured 2026-08-24).
    const stems = step.label.toLowerCase().split(/[^a-z0-9]+/)
        .filter((w) => w.length > 3 && !STOP.has(w)).map((w) => w.slice(0, 5));
    if (!stems.length) return false;
    const need = stems.length === 1 ? 1 : 2;
    return sentences.some((sent) => {
        const words = sent.toLowerCase().split(/[^a-z0-9]+/).map((w) => w.slice(0, 5));
        const seen = new Set(words);
        return stems.filter((st) => seen.has(st)).length >= need;
    });
}
/** Words that exist only inside the machinery, and must never reach a student.
 *  Measured 2026-08-24: "the answer facts do not list any asked years" and raw step
 *  ids ("if you skip s6_divide") appeared across most graded slices. A student has
 *  no referent for either. Raw LaTeX is here too — the bubble renders textContent,
 *  so \begin{bmatrix} arrives literally. */
const INTERNAL_TERMS = [
    'answer facts', 'answer_facts', 'the bank shows', 'the bank lists', 'mark scheme grounding',
    'tutor_context', 'grounding text', 'the facts i hold', 'the facts i am carrying',
    'in my current answer', 'the records show',
];

export function leakedInternalVocabulary(ctx: string, reply: string): string[] {
    const low = reply.toLowerCase();
    const found = INTERNAL_TERMS.filter((t) => low.includes(t));
    // A literal authored step id is unambiguous: it exists nowhere a student can see.
    for (const id of stepIdsIn(ctx)) if (reply.includes(id)) found.push('step-id:' + id);
    // Escapes matter here: \\left written as \left is JS for the literal word
    // "left", which fired on 209 of 3,580 replies where readers found 2 (2026-08-24).
    if (/\\begin\{|\\frac|\\left|\\right|\\[a-zA-Z]+\{/.test(reply)) found.push('raw-latex');
    return [...new Set(found)];
}

/** Length budgets in WORDS, per template.
 *
 *  The old check was one global 5-sentence cap. It fired on `explain` — whose ask is
 *  literally "explain the whole answer to me" — and on Telugu, which needs more
 *  sentences to say the same thing, while missing genuinely padded short-ask replies.
 *  Words are what "too long on a phone" actually means. Budgets set from the graded
 *  corpus: the replies readers scored 3 sit well inside these. */
export const WORD_BUDGET: Record<string, number> = {
    explain: 380, telugu: 220, mistakes: 170, remember: 150, why: 150,
    whystep: 140, marks: 140, important: 120, skiplast: 130, outofbank: 90,
};

export function wordCount(reply: string): number {
    return reply.trim().split(/\s+/).filter(Boolean).length;
}

export function overWordBudget(template: string, reply: string): number {
    const budget = WORD_BUDGET[template] ?? 150;
    const n = wordCount(reply);
    return n > budget ? n : 0;
}

/** Endings a complete reply may legitimately have. Latin stops, the Telugu/
 *  Devanagari danda, an ellipsis, and the closing bracket or quote a sentence
 *  can finish on. */
const TERMINAL_END = /[.!?:)।॥”’"']$|…$/;

/** A reply that stops mid-sentence because max_tokens ran out.
 *
 *  THE CHECK NOBODY HAD WRITTEN. Three independent graders in the 2026-08-25
 *  chemistry round reported replies cut off mid-word — each losing whole
 *  mark-carrying properties on an answer the student was revising from — and all
 *  three noted that no mechanical check existed and that a regex over CONTENT
 *  could never find it: the reply is correct right up to the point it stops.
 *
 *  Measured over the full 2,040-reply corpus before shipping: 3 fires, all 3
 *  genuinely truncated, 0 false positives. Every one was `telugu`, which costs
 *  roughly 3x the tokens per sentence, so it hits the cap first.
 *
 *  An EMPTY reply is deliberately not truncation — that is the guard-reply or a
 *  dead upstream, and it has its own flag. Conflating them would hide both. */
export function looksTruncated(reply: string): boolean {
    const t = (reply ?? '').trim();
    if (!t) return false;
    return !TERMINAL_END.test(t);
}

/* ── the mark number written into prose ──────────────────────────────────────
 * A `margin_note` that OPENS by naming a mark is naming THIS step's mark, and
 * nothing kept that prose in step with `steps[].marks`. The 2026-08-28 re-cut of
 * the maths papers from 7 marks to 8 moved every mark and left the words behind:
 * a bank-wide sweep on 2026-09-01 found 35 notes across six subjects naming the
 * wrong mark, and one of them ("the seven are already spent") is what made Vidi
 * tell a student an 8-mark question was worth 7.
 *
 * Two deliberate non-checks, both learned by over-firing during that sweep:
 *   - a mid-sentence ordinal usually refers to ANOTHER step ("The names carry
 *     the second mark") and is correct, so only the OPENING phrase is read;
 *   - "One mark PER application" counts per item, not per step.
 */
const MARK_ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const MARK_CARDINALS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/** `null` when the note is fine. `marksBefore` = marks earned by earlier steps. */
export function markNumberError(note: string | undefined, stepMarks: number, marksBefore: number): string | null {
    if (!note) return null;

    const ord = note.match(new RegExp(String.raw`^\s*(${MARK_ORDINALS.join('|')})\s+marks?\b`, 'i'));
    if (ord) {
        const claimed = MARK_ORDINALS.indexOf(ord[1].toLowerCase()) + 1;
        if (stepMarks === 0) return `margin_note opens "${ord[0].trim()}" on a step worth 0 marks`;
        const first = marksBefore + 1, last = marksBefore + stepMarks;
        if (claimed < first || claimed > last) {
            const span = stepMarks > 1 ? `marks ${first}-${last}` : `mark ${first}`;
            return `margin_note opens "${ord[0].trim()}" but the step earns ${span}`;
        }
        return null;
    }

    const card = note.match(new RegExp(String.raw`^\s*(${MARK_CARDINALS.join('|')})\s+marks?\b`, 'i'));
    if (card) {
        if (/^\s*\w+\s+marks?\s+(per|each|for each)\b/i.test(note)) return null;
        const claimed = MARK_CARDINALS.indexOf(card[1].toLowerCase());
        if (claimed !== stepMarks) return `margin_note opens "${card[0].trim()}" but the step is worth ${stepMarks}`;
    }
    return null;
}
