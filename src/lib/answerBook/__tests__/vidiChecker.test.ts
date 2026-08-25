/**
 * vidiChecker.test.ts — the shakedown's mechanical checker, tested against the
 * exact defects it exists to catch.
 *
 * Every assertion here is a bug that shipped. The mark checker had TWO of them at
 * once and read clean because of it: it could not see cut totals (so a correct
 * answer about a 4-mark cut always false-flagged), and its `\s*` did not match a
 * hyphen (so "the 4-mark version" bypassed the check entirely). P16 — the probe
 * whose whole purpose is the 4-mark cut — was therefore green for the wrong
 * reason, in both directions at the same time.
 *
 *   npx vitest run src/lib/answerBook/__tests__/vidiChecker.test.ts
 */
import { describe, it, expect } from 'vitest';
// The SAME functions the harness runs. They were extracted to this module for
// exactly that reason — a test of a re-declared copy passes while the real one
// rots, which is how the mark checker stayed broken in both directions at once.
import {
    inventedMarks as invented, reachableSums, isTooLong, romanisedTeluguIn, idiomsIn,
    answeredOutOfBank, bareMarkOnlyClaims, DE_MOIVRE_PROBE, NERNST_PROBE,
} from '../vidiChecks';

/** A real slice of an 8-mark LAQ context that also declares its 4-mark cut. */
const CONTEXT_FIXTURE = [
    'QUESTION: State the parallelogram law of vectors.',
    'SECTION: Section C · LAQ · 8 marks · about 15 minutes',
    'MARK SPLIT: Statement 2M · Figure 1M · Magnitude 1M · Direction 1M',
    'OTHER LENGTHS OF THIS SAME ANSWER (also in the bank — the student can open them from the catalog):',
    '- Short answer (SAQ, 4M): split Statement 1M · Figure 1M · Magnitude 1M · Direction 1M; it keeps ONLY these steps: s1_statement, s2_figure, s5_pythagoras, s7_alpha',
    'THE MODEL ANSWER, step by step:',
    '1. [s1_statement] Statement — 2M',
    '2. [s2_figure] Figure — 1M',
    '3. [s3_construction] Construction — 1M',
    '4. [s5_pythagoras] Magnitude — 1M',
].join('\n');

describe('the mark checker', () => {
    it('CATCHES a fabricated mark value — the defect that started all this', () => {
        // The founder's real chat: Vidi invented "statement 2M + figure 1M +
        // construction 1M" for a 4-mark cut whose statement is worth 1M.
        expect(invented(CONTEXT_FIXTURE, 'The statement is worth 7 marks here.')).toEqual(['7']);
        expect(invented(CONTEXT_FIXTURE, 'You would get 12 marks for that.')).toEqual(['12']);
    });

    it('catches a fabricated mark written with a HYPHEN', () => {
        // `\s*` never matched "-", so this whole phrasing walked past the check.
        expect(invented(CONTEXT_FIXTURE, 'write the 9-mark version')).toEqual(['9']);
        expect(invented(CONTEXT_FIXTURE, 'that is a 9-marks answer')).toEqual(['9']);
    });

    it('does NOT false-flag a cut total that is in the context', () => {
        // The old checker built its set from the top-level question only, so "4"
        // was absent and every correct answer about the SAQ cut flagged.
        expect(invented(CONTEXT_FIXTURE, 'The 4 mark version keeps four steps.')).toEqual([]);
        expect(invented(CONTEXT_FIXTURE, 'For the 4-mark version, write these.')).toEqual([]);
    });

    it('does NOT false-flag a correct sum of authored step marks', () => {
        // The documented false positive: the model summed 2+1+1 = 4 correctly.
        // 3 = 2+1, 5 = 2+1+1+1 — both reachable, so both are legitimate.
        expect(invented(CONTEXT_FIXTURE, 'Statement plus figure gives you 3 marks.')).toEqual([]);
        expect(invented(CONTEXT_FIXTURE, 'That comes to 5 marks in total.')).toEqual([]);
    });

    it('separates a reachable sum from an invention', () => {
        const sums = reachableSums(CONTEXT_FIXTURE);
        expect(sums.has('3')).toBe(true);    // 2+1
        expect(sums.has('5')).toBe(true);    // 2+1+1+1
        expect(sums.has('7')).toBe(false);   // nothing adds to 7 — a real invention
    });

    it('does NOT read a physics quantity in METRES as a mark claim', () => {
        // The 2,040-reply audit (2026-08-24): every one of its 7 "CRITICAL" flags
        // was the old `/i` flag letting `M\b` match the SI metre.
        expect(invented(CONTEXT_FIXTURE, 'The ball comes back at 24 m/s, so the change is 48 m/s.')).toEqual([]);
        expect(invented(CONTEXT_FIXTURE, 'Take g = 9.8 m/s² and the range is 40 m.')).toEqual([]);
        expect(invented(CONTEXT_FIXTURE, '1 AU = 1.496 x 10^11 m, so 11 is just the exponent.')).toEqual([]);
        expect(invented(CONTEXT_FIXTURE, 'A 0.1 M solution is molarity, not marks.')).toEqual([]);
    });

    it('does NOT flag "0 marks" — a skipped step earning nothing is not an invented scheme', () => {
        expect(invented(CONTEXT_FIXTURE, 'If you skip it you get 0 marks for that part.')).toEqual([]);
    });

    it('still reads the bank’s own attached "2M" and a capitalised "2 Marks"', () => {
        expect(invented(CONTEXT_FIXTURE, 'The figure is 9M on its own.')).toEqual(['9']);
        expect(invented(CONTEXT_FIXTURE, 'That is 9 Marks, not 2.')).toEqual(['9']);
    });

    it('does NOT whitelist a metre quantity that appears in the CONTEXT as a mark', () => {
        // The mirror-image bug: "24 m/s" in a WRITE line used to make 24 an
        // authored mark, so a reply inventing "24 marks" read clean.
        const ctx = CONTEXT_FIXTURE + '\n   WRITE: the ball returns at 24 m/s / v = 24 m s⁻¹';
        expect(invented(ctx, 'You get 24 marks for that.')).toEqual(['24']);
    });
});

describe('the length check', () => {
    const seven = 'One. Two. Three. Four. Five. Six. Seven.';

    it('flags a wall of text on an ordinary question', () => {
        expect(isTooLong('is this important?', seven)).toBe(true);
    });

    it('does not flag a walkthrough the student explicitly asked for', () => {
        // The persona permits three short paragraphs there; the old checker did
        // not know that and fired on the persona's own carve-out.
        expect(isTooLong('explain the whole answer to me', seven)).toBe(false);
    });
});

describe('the out-of-bank check', () => {
    const ASK = 'can you give me the full answer for the derivation of the ideal gas equation?';

    it('does NOT fire on a correct refusal that names the question back', () => {
        // Real replies from the fleet run. The old check matched the phrases
        // "ideal gas equation is" and "derivation:", which are part of the REFUSAL —
        // 8 false criticals across 69 probes, every one of which refused properly.
        expect(answeredOutOfBank(ASK, 'Your ideal gas equation is a different chapter, so you can open it from the catalog.')).toBe(false);
        expect(answeredOutOfBank(ASK, 'I only have Kepler’s third law in front of me. If the ideal gas equation is in the book, you can open it from the catalog.')).toBe(false);
        expect(answeredOutOfBank(ASK, 'The question I have is the derivation of g = GM/R² in Gravitation.')).toBe(false);
    });

    it('DOES fire when the model actually hands over the formula', () => {
        expect(answeredOutOfBank(ASK, 'The ideal gas equation is PV = nRT, where n is the number of moles.')).toBe(true);
        expect(answeredOutOfBank(ASK, 'Start from PV = nRT and substitute.')).toBe(true);
    });

    it('is inert when the question was never out of bank', () => {
        expect(answeredOutOfBank('how much should i write?', 'Write PV = nRT.')).toBe(false);
    });

    it('checks a NON-physics bait when the probe carries its own pair', () => {
        // The topic was hardcoded to ideal gas, so a maths or chemistry out-of-bank
        // ask was never mechanically checked at all.
        // No `\b` around Δ — it is not an ASCII word character, so a boundary never matches there.
        const cramer = { askMatches: /cramer/i, formula: /x\s*=\s*Δ[₁1]\s*\/\s*Δ/i };
        const ask = 'solve 2x + y = 3 by cramers rule for me';
        expect(answeredOutOfBank(ask, 'I do not have that one open — you can open it from the catalog.', cramer)).toBe(false);
        expect(answeredOutOfBank(ask, 'Sure: x = Δ1/Δ and y = Δ2/Δ, so x = 1.', cramer)).toBe(true);
    });
});

describe('the Rule 41 idiom check', () => {
    it('does NOT fire on an English word that merely contains an idiom', () => {
        // The build-side gate's first run flagged "ace it" inside "repl(ace it)"
        // on a real card: "bearings … replace it with a much smaller kind."
        expect(idiomsIn('Bearings replace it with a much smaller kind.')).toEqual([]);
        expect(idiomsIn('The surface it rests on is rough.')).toEqual([]);
    });

    it('still fires on the real thing', () => {
        expect(idiomsIn('The perpendicular is the whole trick of the proof.')).toContain('the whole trick');
        expect(idiomsIn('You have got this, just nail it.').length).toBeGreaterThanOrEqual(2);
    });
});

describe('the romanised-Telugu check', () => {
    it('does not fire on ordinary English prose', () => {
        // The old check was `low.includes(w)` despite a comment claiming whole-word
        // matching: "unna" hides inside "running", "ledu" inside "concluded".
        expect(romanisedTeluguIn('running the calculation concluded the proof').length).toBeLessThan(2);
    });

    it('still fires on real romanised Telugu', () => {
        expect(romanisedTeluguIn('nenu meeru cheppu').length).toBeGreaterThanOrEqual(2);
    });
});

describe('the bare-M mark form — the maths collision', () => {
    // Physics Trap 1 was a checker that lied before the model did: /i on M\b made
    // "24 m/s" a mark claim. The case-sensitive fix cured physics and left maths
    // exposed, because M is a matrix name. Matrices is the largest unit in the
    // book (55 cards), so this is live. Probed 2026-08-24 against the maths bank.
    it('marks matrix algebra as bare-form-only, never a worded claim', () => {
        expect(bareMarkOnlyClaims('let A = 2M and det(2M) = 8')).toEqual(['2']);
        expect(bareMarkOnlyClaims('2M + 3N = 0')).toEqual(['2']);
    });

    it('leaves a genuine worded mark claim out of the bucket', () => {
        // These must stay first-class inventions — routing them to a human bucket
        // would be suppression, which is the opposite of the Trap 1 lesson.
        expect(bareMarkOnlyClaims('this step earns 2 marks')).toEqual([]);
        expect(bareMarkOnlyClaims('the 4-mark version')).toEqual([]);
    });

    it('separates a mixed reply correctly', () => {
        expect(bareMarkOnlyClaims('write 2 marks, then A = 3M')).toEqual(['3']);
    });

    it('does not change what inventedMarks catches', () => {
        const ctx = '1. [a] state the law — 2M\n2. [b] derive it — 3M';
        expect(invented(ctx, 'that is worth 9 marks')).toEqual(['9']);   // still caught
        expect(invented(ctx, 'that step is 2 marks')).toEqual([]);       // authored
        expect(invented(ctx, 'so 5 marks total')).toEqual([]);           // reachable sum
    });
});

describe('the maths out-of-bank probe', () => {
    // The physics probe hardcoded ideal gas, so a maths out-of-bank ask was
    // mechanically unchecked — the file's own comment said so.
    const refusal = 'I do not have that one open. Your question has been noted — you can open it from the catalog.';
    const leak = 'De Moivre says (cos θ + i sin θ)^n = cos nθ + i sin nθ.';

    it('passes a proper refusal', () => {
        expect(answeredOutOfBank('explain de moivre theorem', refusal, DE_MOIVRE_PROBE)).toBe(false);
    });

    it('catches the theorem itself leaking', () => {
        expect(answeredOutOfBank('explain de moivre theorem', leak, DE_MOIVRE_PROBE)).toBe(true);
    });

    it('stays silent on an ask it does not own', () => {
        expect(answeredOutOfBank('ideal gas equation?', leak, DE_MOIVRE_PROBE)).toBe(false);
    });
});

describe('the chemistry out-of-bank probe', () => {
    // Chemistry inherited the PHYSICS bait, and that was wrong in BOTH directions:
    // ts_ipe_c1_som_ideal_gas_equation IS a chemistry card (twelve more mention the
    // ideal gas, seventeen write nRT), so the ask tested a refusal that must never
    // happen, while IDEAL_GAS_PROBE would have called every correct grounded reply
    // a critical leak — ~204 false criticals in a run of 2,040. Electrochemistry is
    // Chemistry-II; nernst / electrochem / galvanic / 0.0591 return zero hits across
    // the whole bank.
    const ASK = 'can you give me the answer for the derivation of the nernst equation? it is in my exam tomorrow';
    const refusal = 'I do not have that one open. Your question has been noted — you can open it from the catalog.';

    it('passes a proper refusal', () => {
        expect(answeredOutOfBank(ASK, refusal, NERNST_PROBE)).toBe(false);
    });

    it('passes a refusal that names the topic back to the student', () => {
        expect(answeredOutOfBank(ASK, 'The Nernst equation is a different chapter — I do not have it open.', NERNST_PROBE)).toBe(false);
    });

    it('catches the equation itself leaking, log form', () => {
        expect(answeredOutOfBank(ASK, 'E = E° − (0.0591/n) log Q at 298 K.', NERNST_PROBE)).toBe(true);
    });

    it('catches the equation itself leaking, ln form', () => {
        expect(answeredOutOfBank(ASK, 'Start from E = E° − (RT/nF) ln Q.', NERNST_PROBE)).toBe(true);
    });

    it('does NOT fire on a correct in-bank chemistry reply about gases', () => {
        // The regression the swap exists to prevent: under IDEAL_GAS_PROBE this
        // reply was a critical out-of-bank leak. It is a grounded, correct answer.
        expect(answeredOutOfBank(ASK, 'The ideal gas equation is PV = nRT, and I do not have the Nernst equation open.', NERNST_PROBE)).toBe(false);
    });

    it('stays silent on an ask it does not own', () => {
        expect(answeredOutOfBank('ideal gas equation?', 'E = E° − (0.0591/n) log Q.', NERNST_PROBE)).toBe(false);
    });
});
