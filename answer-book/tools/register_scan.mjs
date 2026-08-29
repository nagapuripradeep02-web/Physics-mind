/**
 * register_scan.mjs — ADVISORY Rule 41 register scan over authored cards.
 *
 *   node answer-book/tools/register_scan.mjs ts_ipe_c2
 *   npm run scan:register -- ts_ipe_c2
 *
 * Rule 41 bans idioms, metaphors and personification in every string a student
 * reads. The build already runs `idiomsIn()` from vidiChecks.ts, but that list is
 * sixteen CHAT phrases ("piece of cake", "nail it") written to grade Vidi's replies
 * — it was never an authoring-register check and catches none of the ways science
 * prose actually breaks the rule. Every recorded authoring session has found its
 * idioms BY HAND.
 *
 * So: this reports CANDIDATES for a human to judge. It never fails, and it is not
 * wired into the build. A hit is a question, not a verdict.
 *
 * The hard part is that chemistry's real vocabulary looks like personification and
 * must NOT be flagged: a base DONATES a pair, an acid ACCEPTS one, charges ATTRACT
 * and REPEL, atoms SHARE electrons, an electron JUMPS to the conduction band, is
 * PROMOTED, OCCUPIES an orbital, is TRAPPED at a vacancy, ESCAPES the metal. Those
 * are the words the formula uses (Rule 41b) and they are deliberately absent below.
 */
import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const QDIR = join(process.cwd(), 'answer-book', 'questions');
const prefix = process.argv[2];
if (!prefix) {
    console.error('usage: register_scan.mjs <id_prefix>');
    process.exit(2);
}

/** Verbs and nouns that give an object a mind. */
const PERSONIFICATION = [
    'wants', 'want to', 'wanting', 'prefers', 'prefer to', 'likes to', 'dislikes',
    'is happy', 'are happy', 'happily', 'unhappy', 'tries to', 'try to', 'seeks',
    'decides', 'chooses to', 'knows', 'remembers', 'feels', 'cares', 'loves',
    'hates', 'enjoys', 'refuses', 'agrees', 'is eager', 'is reluctant', 'is lazy',
    'is greedy', 'hungry', 'thirsty', 'is comfortable', 'gets bored', 'nobody',
    'anybody', 'someone', 'fights', 'fight back', 'struggles', 'battles', 'attacks',
    'defends', 'punishes', 'rewards', 'gives up', 'lets go', 'holds on', 'hangs on',
    'clings', 'grabs', 'steals', 'dances', 'sleeps', 'wakes',
];

/** Figurative language: the thing is being described as something it is not. */
const METAPHOR = [
    'moves house', 'sets up home', 'at home', 'moves out', 'moves in', 'the whole wall',
    'a brick', 'like a wall', 'staircase', 'ladder', 'seesaw', 'tug of war',
    'a race', 'a journey', 'traffic', 'a crowd', 'crowded', 'squeezed', 'cosy',
    'the trick is', 'the secret is', 'the magic', 'magical', 'like magic',
    'get stuck', 'gets stuck', 'nowhere to go', 'somewhere to go', 'a ceiling',
    'the floor is', 'a bridge', 'a gate opens', 'opens the door', 'a highway',
];

/** Analogy markers — often fine, but each one is a metaphor waiting to happen. */
const ANALOGY = ['think of it as', 'imagine a', 'imagine the', 'is like a', 'are like a', 'just like a', 'as if it were'];

const BANDS = [
    ['PERSONIFICATION', PERSONIFICATION],
    ['METAPHOR', METAPHOR],
    ['ANALOGY?', ANALOGY],
];

const files = readdirSync(QDIR).filter((f) => f.startsWith(prefix) && f.endsWith('.json')).sort();
if (!files.length) {
    console.error(`no cards under "${prefix}"`);
    process.exit(2);
}

/** Every string a student actually reads. */
function readerStrings(q) {
    const out = [];
    const push = (where, text) => { if (typeof text === 'string' && text) out.push([where, text]); };
    push('question_text', q.question_text);
    push('insider_note', q.insider_note);
    for (const h of q.answer?.page_header ?? []) push('page_header', h);
    for (const s of q.answer?.steps ?? []) {
        push(`${s.id}.label`, s.label);
        push(`${s.id}.why`, s.why);
        push(`${s.id}.memory_tip`, s.memory_tip);
        push(`${s.id}.margin_note`, s.margin_note);
        push(`${s.id}.mark_note`, s.mark_note);
        for (const [i, m] of (s.common_mistakes ?? []).entries()) push(`${s.id}.common_mistakes[${i}]`, m);
        for (const [i, l] of (s.lines ?? []).entries()) push(`${s.id}.lines[${i}]`, typeof l === 'string' ? l : l.text);
        for (const e of s.figure?.elements ?? []) if (e.type === 'label') push(`${s.id}.figure.${e.id}`, e.text);
    }
    for (const c of q.cuts ?? []) {
        push(`cut:${c.key}.label`, c.label);
        push(`cut:${c.key}.question_text`, c.question_text);
        push(`cut:${c.key}.note`, c.note);
        for (const [sid, o] of Object.entries(c.steps ?? {})) {
            push(`cut:${c.key}.${sid}.why`, o.why);
            push(`cut:${c.key}.${sid}.memory_tip`, o.memory_tip);
            push(`cut:${c.key}.${sid}.margin_note`, o.margin_note);
            for (const [i, l] of (o.lines ?? []).entries()) push(`cut:${c.key}.${sid}.lines[${i}]`, typeof l === 'string' ? l : l.text);
        }
    }
    return out;
}

let strings = 0;
const hits = [];
for (const f of files) {
    const q = JSON.parse(readFileSync(join(QDIR, f), 'utf8'));
    for (const [where, text] of readerStrings(q)) {
        strings++;
        const low = text.toLowerCase();
        for (const [band, list] of BANDS) {
            for (const phrase of list) {
                if (new RegExp('\\b' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(low)) {
                    hits.push({ band, phrase, id: basename(f, '.json'), where, text });
                }
            }
        }
    }
}

console.log(`register scan: ${files.length} card(s) under "${prefix}", ${strings} reader-facing strings`);
if (!hits.length) {
    console.log('no candidates. (Advisory only — this list is not exhaustive; read the prose too.)');
    process.exit(0);
}
console.log(`\n${hits.length} candidate(s) — each is a QUESTION for a human, not a verdict:\n`);
for (const h of hits) {
    console.log(`  [${h.band}] "${h.phrase}"`);
    console.log(`    ${h.id} / ${h.where}`);
    console.log(`    ${h.text.length > 180 ? h.text.slice(0, 180) + '…' : h.text}`);
}
console.log('\nAdvisory: nothing failed. Judge each hit — chemistry\'s own vocabulary (donate,');
console.log('accept, attract, repel, share, jump, occupy, trap, escape) is deliberately NOT listed.');
