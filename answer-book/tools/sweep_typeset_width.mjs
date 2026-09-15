// node answer-book/tools/sweep_typeset_width.mjs <id_prefix> [dist]
//
// The e2e typeset probe (e2e/answer_book.spec.ts, 'a typeset line renders as math') scoped to
// one chapter, at BOTH lengths: every .kx-clip must hold real KaTeX, be no wider than its line's
// content box, and no raw TeX may reach the page. An over-wide typeset line is truncated with no
// other symptom, so run this after any batch that adds typeset lines — the full e2e sweep takes
// minutes and covers the whole book. Written for Maths-2B Definite Integrals, 2026-09-13.
import { createRequire } from 'module';
const ROOT = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
const require = createRequire(ROOT + '/package.json');
const { chromium } = require('playwright');
const prefix = process.argv[2];
const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 1440, height: 980 } });
await page.goto('file://' + ROOT + '/answer-book/' + (process.argv[3] || 'dist-mpc_2') + '/index.html');
await page.waitForFunction(() => !!window.PM_ANSWER, null, { timeout: 60000 });
const ids = await page.evaluate((p) => window.PM_QUESTIONS.filter((q) => q.question_id.startsWith(p) &&
  q.answer.steps.some((s) => [...(s.lines || []), ...(s.lines_compact || [])].some((l) => l && l.render === 'katex')))
  .map((q) => q.question_id), prefix);
const probe = () => page.evaluate(() => {
  const clips = [...document.querySelectorAll('.kx-clip')];
  return {
    clips: clips.length, typeset: clips.filter((c) => c.querySelector('.katex')).length,
    clipped: clips.filter((c) => {
      const line = c.closest('.line'); const cs = getComputedStyle(line);
      const avail = line.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const kin = c.firstElementChild; const natural = kin ? kin.getBoundingClientRect().width : c.scrollWidth;
      return natural > avail + 0.5 || natural > c.getBoundingClientRect().width + 0.5;
    }).map((c) => { const line = c.closest('.line'); const cs = getComputedStyle(line);
      const avail = line.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      return `${Math.round(c.firstElementChild.getBoundingClientRect().width - avail)}px over: ${c.getAttribute('data-tex')}`; }),
    rawTex: /\\(circ|therefore|because|begin\{|frac|text\{|int|sqrt|cdot)/.test(document.getElementById('notebookView').textContent || ''),
  };
});
let bad = 0, lines = 0;
for (const id of ids) {
  await page.evaluate((i) => window.PM_ANSWER.openQuestion(i), id);
  await page.evaluate(() => window.PM_ANSWER.revealAll()); await page.waitForTimeout(400);
  const rs = [['short', await probe()]];
  const exp = await page.evaluate(() => window.PM_ANSWER.getState().expandableSteps);
  if (exp.length) {
    await page.evaluate((x) => x.forEach((sid) => window.PM_ANSWER.setStepDetail(sid, 'full')), exp);
    await page.evaluate(() => window.PM_ANSWER.revealAll()); await page.waitForTimeout(400);
    rs.push(['full', await probe()]);
  }
  for (const [where, r] of rs) {
    lines += r.clips;
    if (r.typeset !== r.clips || r.clipped.length || r.rawTex) {
      bad++; console.log(`! ${id} (${where}): typeset ${r.typeset}/${r.clips}${r.rawTex ? ' RAW TEX' : ''}`);
      r.clipped.forEach((c) => console.log('    ' + c));
    }
  }
}
console.log(`${ids.length} cards with typeset lines · ${lines} typeset lines measured · ${bad} problems`);
await b.close();
