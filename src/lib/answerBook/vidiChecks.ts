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

/** The maths bait. De Moivre is Maths-2A — genuinely outside both 1A and 1B — so a
 *  correct reply says it is not open and points at the catalog. The formula regex
 *  fires only on the SUBSTANCE (the theorem itself), never on the wording of a
 *  refusal: hardcoding the topic is what cost the physics probe 8 false criticals
 *  out of 69, every one of which had refused properly. */
export const DE_MOIVRE_PROBE: OutOfBankProbe = {
    askMatches: /de\s?moivre/i,
    formula: /cos\s*n\s*(?:θ|theta)|\(\s*cos\s*(?:θ|theta)\s*\+\s*i\s*sin/i,
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
