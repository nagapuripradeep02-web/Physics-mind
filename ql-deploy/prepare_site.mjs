/**
 * Assemble ql-deploy/site/ for the physicsmind-quicklearn Worker from the
 * locally built review-site output. Post-processes MY OWN build artifacts —
 * deliberately does not touch build_quicklearn.ts (another session's file):
 *
 *   1. copy quicklearn/faraday_law_induction/index.html,
 *      faraday_law_induction/sim.html, and vendor/ into site/
 *   2. rewrite "chat_server":"http://localhost:8082" -> "" (same-origin /api/*
 *      on the Worker; the builder's QL_CHAT_URL env treats '' as unset, so the
 *      rewrite happens here instead)
 *   3. inject the access-code fetch wrapper before </body>: attaches
 *      body.code (from ?code=... or localStorage, prompting once on the first
 *      Ask) to every same-origin /api/* POST; clears a stored bad code on 401
 *      so the next Ask re-prompts. The boot probe (/api/log) passes without a
 *      code by design — the Worker returns 200 and just skips logging.
 *   4. write a root index.html redirect to the lesson.
 *
 * Usage: node ql-deploy/prepare_site.mjs   (from the repo root)
 */
import { mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'review-site');
const OUT = join(ROOT, 'ql-deploy', 'site');
const CONCEPT = 'faraday_law_induction';

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'quicklearn', CONCEPT), { recursive: true });
mkdirSync(join(OUT, CONCEPT), { recursive: true });

// 1. sim + vendor, verbatim
cpSync(join(SRC, CONCEPT, 'sim.html'), join(OUT, CONCEPT, 'sim.html'));
cpSync(join(SRC, 'vendor'), join(OUT, 'vendor'), { recursive: true });

// 2+3. the quicklearn page: rewrite chat origin + inject the code wrapper
let html = readFileSync(join(SRC, 'quicklearn', CONCEPT, 'index.html'), 'utf-8');

const before = html;
html = html.replace('"chat_server":"http://localhost:8082"', '"chat_server":""');
if (html === before) throw new Error('chat_server rewrite did not match — builder output changed, update prepare_site.mjs');

const WRAPPER = `<script>
/* Access-code wrapper (deploy-only): attaches body.code to same-origin /api/*
   POSTs. Code source: ?code=... in the URL (teacher shares one link), else
   localStorage, else a one-time prompt on the first Ask. A 401 clears the
   stored code so the next Ask re-prompts. */
(function () {
  var KEY = 'ql_code';
  function stored() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function store(c) { try { localStorage.setItem(KEY, c); } catch (e) {} }
  try {
    var fromUrl = new URLSearchParams(location.search).get('code');
    if (fromUrl) store(fromUrl.trim());
  } catch (e) {}
  var origFetch = window.fetch;
  window.fetch = function (url, opts) {
    var u = String(url || '');
    var isApi = u.indexOf('/api/') === 0;
    if (isApi && opts && typeof opts.body === 'string') {
      var code = stored();
      if (u.indexOf('/api/chat') === 0 && !code) {
        code = (window.prompt('Enter the access code your teacher shared:') || '').trim();
        if (code) store(code);
      }
      try {
        var b = JSON.parse(opts.body);
        b.code = code;
        opts = Object.assign({}, opts, { body: JSON.stringify(b) });
      } catch (e) {}
    }
    var p = origFetch.call(this, url, opts);
    if (isApi) {
      p = p.then(function (r) {
        if (r && r.status === 401) { try { localStorage.removeItem(KEY); } catch (e) {} }
        return r;
      });
    }
    return p;
  };
})();
</script>
</body>`;
if (html.indexOf('</body>') < 0) throw new Error('no </body> in built page');
html = html.replace('</body>', WRAPPER);

writeFileSync(join(OUT, 'quicklearn', CONCEPT, 'index.html'), html, 'utf-8');

// 4. root redirect (keeps any ?code=... on the way through)
writeFileSync(join(OUT, 'index.html'), [
  '<!doctype html><meta charset="utf-8"><title>Viditra Quick Learn</title>',
  '<script>location.replace("/quicklearn/' + CONCEPT + '/" + location.search);</script>',
  '<p>Loading the lesson…</p>',
].join('\n'), 'utf-8');

console.log('ql-deploy/site assembled: quicklearn/' + CONCEPT + ' + sim + vendor + root redirect');
