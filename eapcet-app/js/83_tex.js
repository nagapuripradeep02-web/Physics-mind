/* Tex — typesets the solver's answer sheet with KaTeX, loaded from cdnjs the
 * first time a card needs it. Every line is created with its plain text
 * already showing, so a phone with no CDN (or a slow one) reads the plain
 * working and nothing waits on the network. When KaTeX is ready each line's
 * `data-tex` is rendered in one pass; a line KaTeX cannot parse goes back to
 * its plain text on its own. Offline builds never call this (no card exists
 * without EP_SOLVE_BASE), so the offline e2e's zero-request rule holds. */
var Tex = (function () {
  var CDN = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.18.6/';
  var TIMEOUT_MS = 8000;
  var state = 'idle';           // idle | loading | ready | failed
  var waiters = [];
  var t0 = 0;

  function settle(next) {
    state = next;
    var list = waiters; waiters = [];
    for (var i = 0; i < list.length; i++) { try { list[i](); } catch (e) {} }
  }
  function script(src, ok, bad) {
    var s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = ok; s.onerror = bad;
    document.head.appendChild(s);
  }
  function load() {
    if (state !== 'idle') return;
    state = 'loading';
    t0 = Date.now();
    var link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = CDN + 'katex.min.css';
    document.head.appendChild(link);
    var timer = setTimeout(function () { if (state === 'loading') settle('failed'); }, TIMEOUT_MS);
    script(CDN + 'katex.min.js', function () {
      script(CDN + 'contrib/auto-render.min.js', function () {
        clearTimeout(timer);
        if (state === 'loading') settle(typeof renderMathInElement === 'function' ? 'ready' : 'failed');
      }, function () { clearTimeout(timer); if (state === 'loading') settle('failed'); });
    }, function () { clearTimeout(timer); if (state === 'loading') settle('failed'); });
  }
  function ready(fn) {
    if (state === 'ready' || state === 'failed') { fn(); return; }
    waiters.push(fn);
    load();
  }

  /* Typeset every [data-tex] line under `root`. cb({state, ms, lines, failed})
   * runs once, after the pass (or at once when KaTeX is not available). */
  function render(root, cb) {
    var lines = root.querySelectorAll('[data-tex]');
    if (!lines.length) { if (cb) cb({ state: 'none', ms: 0, lines: 0, failed: 0 }); return; }
    var start = Date.now();
    ready(function () {
      var failed = 0;
      if (state === 'ready') {
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          var plain = line.textContent;
          try {
            line.textContent = line.getAttribute('data-tex');
            renderMathInElement(line, {
              delimiters: [{ left: '$$', right: '$$', display: false }, { left: '\\[', right: '\\]', display: false },
                           { left: '\\(', right: '\\)', display: false }, { left: '$', right: '$', display: false }],
              throwOnError: false, output: 'html', strict: 'ignore', trust: false,
              preProcess: function (m) { return '\\displaystyle ' + m; }   // fractions and integrals at full size, as on paper
            });
            if (line.querySelector('.katex-error') || !line.querySelector('.katex')) { line.textContent = plain; failed++; }
            else line.setAttribute('aria-label', plain);
          } catch (e) { line.textContent = plain; failed++; }
        }
      }
      if (cb) cb({ state: state, ms: Date.now() - start, lines: lines.length, failed: failed });
    });
  }

  return { render: render, state: function () { return state; } };
})();
