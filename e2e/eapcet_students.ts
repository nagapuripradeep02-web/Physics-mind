/**
 * eapcet_students.ts — three students, each a rule over the PUBLIC facts of a
 * question, so what the app should conclude about them is known by
 * construction and derived at test time from the release, never hard-coded.
 *
 *   Pradeep   knows the physics, slips on numbers: the calculation-typed wrong
 *             option when the question has one, else the key; always says he
 *             went the right way; takes his time.
 *   Rahul     confident, wrong concepts: a concept/application-typed wrong
 *             option when one exists, else the key; on a question at an even
 *             position in the pool he admits the wrong route, at an odd one he
 *             claims the right route (so the option contradicts him); takes
 *             his time.
 *   Yashwanth guesses under time pressure: option 3 every time, "I guessed"
 *             every time, six seconds a question.
 *
 * The rules are written against the pool's ORDER (verified_ids), so the
 * answer sheet in the report is the same on every phone whatever the draw.
 */
import { labelOf, type PublicQuestion, type Intent, type Played } from './eapcet_helpers';

export type Fact = PublicQuestion & { question_en: string; options_en: string[]; difficulty?: string | null };
/** `typed`: what the student types before the options on a number question —
    absent = the printed value of the option they then pick; null = "I have no
    answer yet". */
export type Decision = { picked: number; route: string; intent: Intent; why: string; typed?: string | null };
export type Persona = {
    name: string;
    who: string;
    wait: number;                                   // ms the student spends on a question
    decide(q: Fact, poolIndex: number): Decision;
    truth: string;                                  // the designed verdict, in words
    holds(e: ReturnType<typeof import('./eapcet_helpers').expectation>): boolean;
};

function hasMenu(q: Fact): boolean { return !!(q.has_routes && !q.theory && q.routes && q.routes.length); }
function rightRoute(q: Fact): string { return hasMenu(q) ? 'r' : 'sure'; }
function labelled(q: Fact, types: string[]): number {
    const ot = q.option_types || {};
    for (const t of types) {
        const o = Object.keys(ot).find((k) => ot[k] === t);
        if (o) return Number(o);
    }
    return 0;
}
function routeLeadingTo(q: Fact, option: number): string | null {
    for (const r of q.routes || []) if (r.id !== 'r' && r.option === option) return r.id;
    return null;
}

export const PRADEEP: Persona = {
    name: 'Pradeep',
    who: 'knows the physics, slips on numbers',
    wait: 45000,
    decide(q) {
        const calc = labelled(q, ['calculation', 'careless']);
        if (calc && hasMenu(q)) return { picked: calc, route: 'r', intent: 'slip', why: 'the calculation-typed option, then the right route' };
        return { picked: q.answer, route: rightRoute(q), intent: 'solid', why: 'no calculation-typed option here: the key, then the right route' };
    },
    truth: 'weakness = calculation (when two or more of his slips are drawn); no mismatches; every wrong answer confirmed by its option',
    holds: (e) => e.mismatches === 0 && e.confirmed === e.wrong && (e.params.calculation >= 2 ? e.weakness === 'calculation' : e.weakness !== 'concept' && e.weakness !== 'application'),
};

export const RAHUL: Persona = {
    name: 'Rahul',
    who: 'confident, with wrong concepts',
    wait: 70000,
    decide(q, i) {
        const target = labelled(q, ['concept', 'application']);
        if (!target) return { picked: q.answer, route: rightRoute(q), intent: 'solid', why: 'no concept- or application-typed option here: the key, then the right route' };
        if (!hasMenu(q)) return { picked: target, route: 'sure', intent: 'belief', why: 'the wrong belief, and he was sure' };
        const honest = routeLeadingTo(q, target);
        if (i % 2 === 0 && honest) return { picked: target, route: honest, intent: 'wrong_route', why: 'the wrong-route option, and he admits that route (even position in the pool)' };
        return { picked: target, route: 'r', intent: 'mismatch', why: 'the wrong-route option, but he claims the right route (odd position in the pool): the option contradicts him' };
    },
    truth: 'weakness = concept or application (whichever his picks make larger; a tie goes to concept); at least one mismatch; zero calculation',
    holds: (e) => (e.weakness === 'concept' || e.weakness === 'application') && e.params.calculation === 0 && e.mismatches >= 1,
};

export const YASHWANTH: Persona = {
    name: 'Yashwanth',
    who: 'guesses under time pressure',
    wait: 6000,
    decide(q) {
        return { picked: 3, route: 'guess', intent: q.answer === 3 ? 'guess_right' : 'guess_wrong', why: 'option 3 every time, and "I guessed"', typed: null };
    },
    truth: 'weakness = guessed; rushed = every wrong answer; no type named; his score is the number of drawn questions whose key is (3)',
    holds: (e) => e.weakness === 'guessed' && e.params.concept + e.params.application + e.params.calculation === 0 && e.params.rushed === e.wrong,
};

export const STUDENTS = [PRADEEP, RAHUL, YASHWANTH];

export const OUTCOME_OF: Record<Intent, string> = {
    solid: 'solid', slip: 'slip', unlabelled: 'slip_unconfirmed', wrong_route: 'wrong_route', mismatch: 'wrong_route (mismatch)',
    belief: 'wrong_belief', guess_right: 'guessed_right', guess_wrong: 'guessed_wrong',
};

/** The route's text as the menu shows it, for the sheet. */
export function routeText(q: Fact, id: string): string {
    if (id === 'guess') return 'I guessed';
    if (id === 'sure') return 'I was sure';
    const r = (q.routes || []).find((x) => x.id === id);
    return r ? r.text : id;
}

/** Every 10-subset of the pool, in id order: 3003 draws for 15 questions. */
export function* combinations<T>(items: T[], k: number): Generator<T[]> {
    const n = items.length;
    const idx = Array.from({ length: k }, (_, i) => i);
    if (k > n) return;
    while (true) {
        yield idx.map((i) => items[i]);
        let i = k - 1;
        while (i >= 0 && idx[i] === n - k + i) i--;
        if (i < 0) return;
        idx[i]++;
        for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
    }
}

export function playedFor(persona: Persona, pool: Fact[], ids: string[]): Played[] {
    return ids.map((id) => {
        const i = pool.findIndex((q) => q.id === id);
        const q = pool[i];
        const d = persona.decide(q, i);
        return { qid: id, theory: !hasMenu(q), intent: d.intent, picked: d.picked, route: d.route, label: labelOf(q, d.picked) };
    });
}
