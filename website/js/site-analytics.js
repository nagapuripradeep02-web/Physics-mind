/* Viditra marketing-site analytics beacon.
 * Records a 'visit' on load and a 'cta_click' for any [data-cta] element, into the
 * pilot Supabase `site_events` table (anon insert-only). Tags each with an outreach
 * ?src= / ?utm_source= so batches are attributable. Fail-silent — never blocks the page.
 */
(function () {
  var ENDPOINT = 'https://jqbnmltsupnnbuvqgkix.supabase.co/rest/v1/site_events';
  var KEY = 'sb_publishable_pNj_zCtoU3kKdedr0KMvlQ_rAUo7PXc';

  function sid() {
    try {
      var s = localStorage.getItem('pm_sid');
      if (!s) { s = Date.now().toString(36) + Math.random().toString(36).slice(2, 10); localStorage.setItem('pm_sid', s); }
      return s;
    } catch (e) { return null; }
  }

  function source() {
    try {
      var q = new URLSearchParams(location.search);
      var s = q.get('src') || q.get('utm_source');
      if (s) { try { sessionStorage.setItem('pm_src', s); } catch (e) {} return s; }
      return sessionStorage.getItem('pm_src') || null;
    } catch (e) { return null; }
  }

  function send(eventType, meta) {
    try {
      fetch(ENDPOINT, {
        method: 'POST',
        keepalive: true,
        headers: {
          apikey: KEY,
          Authorization: 'Bearer ' + KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          event_type: eventType,
          path: location.pathname,
          referrer: document.referrer || null,
          source: source(),
          session_id: sid(),
          meta: meta || null
        })
      }).catch(function () {});
    } catch (e) { /* never throw from analytics */ }
  }

  // One visit per page load.
  send('visit', null);

  // Any element (or ancestor) marked data-cta fires a cta_click carrying its label.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-cta]') : null;
    if (el) send('cta_click', { cta: el.getAttribute('data-cta') });
  }, true);

  // Manual hook if needed elsewhere.
  window.pmTrack = send;
})();
