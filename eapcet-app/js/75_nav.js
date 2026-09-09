/* Nav — the tab bar under every section screen, and two small things every
 * screen shares: the hash the student came from, and a toast.
 *
 * Three tabs in the founder's order: Learn · Weakness · Solutions. The bar
 * shows on every #/physics… route and on #/unlock, never on the door or the
 * team page. The active tab is read from the hash; a fix page opened from
 * Solutions keeps Solutions active, so its Back returns there. No clay on a
 * tab: clay is the one forward action on a page. The icons are static SVG
 * written here, never built from data. */
var Nav = (function () {
  var ICON = {
    learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6.5c-1.6-1.4-4-2-7.5-2v13c3.5 0 5.9.6 7.5 2 1.6-1.4 4-2 7.5-2v-13c-3.5 0-5.9.6-7.5 2z"/><path d="M12 6.5v13"/></svg>',
    weakness: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"/></svg>',
    solutions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 5.5h15v10h-8l-4.5 3.5v-3.5h-2.5z"/><path d="M8 9.5h8M8 12.5h5"/></svg>'
  };
  var TABS = [
    { key: 'learn', href: '#/physics/learn' },
    { key: 'weakness', href: '#/physics' },
    { key: 'solutions', href: '#/physics/solutions' }
  ];
  var prev = null;
  var cur = location.hash || '#/';
  var toastTimer = null;

  function labelOf(key) {
    if (key === 'learn') return STR.tab_learn;
    if (key === 'solutions') return STR.tab_solutions;
    return STR.tab_weakness;
  }
  function isSolutions(h) { return /^#\/physics\/solutions(\/|$)/.test(h || ''); }

  /** The tab a hash belongs to, or null where the bar is hidden. */
  function activeFor(hash) {
    var h = hash || '#/';
    if (/^#\/physics\/learn(\/|$)/.test(h)) return 'learn';
    if (isSolutions(h)) return 'solutions';
    if (/^#\/physics\/p[12]-\d{2}\/fix\//.test(h) && isSolutions(prev)) return 'solutions';
    if (/^#\/physics(\/|$)/.test(h) || h === '#/unlock') return 'weakness';
    return null;
  }

  function init() {
    var bar = $('tabbar');
    if (!bar) return;
    bar.setAttribute('aria-label', STR.tabbar_label);
    for (var i = 0; i < TABS.length; i++) (function (t) {
      var a = el('a', 'ep-tab');
      a.href = t.href;
      a.setAttribute('data-tab', t.key);
      a.innerHTML = ICON[t.key];
      a.appendChild(el('span', 'ep-tab-label', labelOf(t.key)));
      a.onclick = function () { Track.log('tab', { tab: t.key }); };
      bar.appendChild(a);
    })(TABS[i]);
    // Registered before the router's own listener (90_boot.js), so the router
    // always sees where the student came from.
    window.addEventListener('hashchange', function () { prev = cur; cur = location.hash || '#/'; });
  }

  /** Show or hide the bar for the current hash and mark the active tab. */
  function tabs() {
    var bar = $('tabbar');
    if (!bar) return;
    var active = activeFor(location.hash);
    bar.hidden = !active;
    if (active) document.body.classList.add('ep-has-tabbar'); else document.body.classList.remove('ep-has-tabbar');
    var links = bar.querySelectorAll('.ep-tab');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-tab') === active) links[i].setAttribute('aria-current', 'page');
      else links[i].removeAttribute('aria-current');
    }
  }

  /** The hash before this one, or null on a cold open. */
  function from() { return prev; }
  function fromSolutions() { return isSolutions(prev); }

  function toast(text) {
    var t = $('toast');
    if (!t) return;
    t.textContent = text;
    t.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  return { init: init, tabs: tabs, from: from, fromSolutions: fromSolutions, toast: toast, activeFor: activeFor };
})();
