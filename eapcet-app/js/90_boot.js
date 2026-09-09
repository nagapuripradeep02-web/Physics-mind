/* Boot — order matters: the team-mark and auth capture resolve before the
 * first route, the tab bar's own listener before the router's (so the router
 * always knows where the student came from), the route before any gate
 * paint, and the tracker's first event after the page has something to be
 * about. */
(function () {
  var preview = !!(window.EP_BUILD && window.EP_BUILD.preview);
  var note = $('buildNote');
  if (note) {
    note.hidden = !(Data.DEV_OPEN || preview);
    note.textContent = Data.DEV_OPEN ? STR.dev_open : (preview ? STR.preview_note : '');
  }
  if (typeof Auth !== 'undefined') Auth.capture();
  if (typeof Nav !== 'undefined') Nav.init();
  window.addEventListener('hashchange', route);
  route();
  if (typeof Gate !== 'undefined') Gate.init();
  if (typeof Sync !== 'undefined') Sync.init();
  Track.log('open', { dev: Data.DEV_OPEN, preview: preview });
})();
