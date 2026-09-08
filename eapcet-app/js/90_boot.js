/* Boot — order matters: the team-mark and auth capture resolve before the
 * first route, the route before any gate paint, and the tracker's first event
 * after the page has something to be about. */
(function () {
  var note = $('buildNote');
  if (note) { note.hidden = !Data.DEV_OPEN; note.textContent = Data.DEV_OPEN ? STR.dev_open : ''; }
  if (typeof Auth !== 'undefined') Auth.capture();
  window.addEventListener('hashchange', route);
  route();
  if (typeof Gate !== 'undefined') Gate.init();
  if (typeof Sync !== 'undefined') Sync.init();
  Track.log('open', { dev: Data.DEV_OPEN });
})();
