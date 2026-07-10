// Shared animation engine: one rAF loop, scenes tick only while visible on screen.
// Under prefers-reduced-motion every scene draws a single static frame and the loop never runs.
(function () {
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
  var scenes = [];
  var rafId = null;
  var lastT = 0;

  function frame(t) {
    rafId = null;
    var dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    var any = false;
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      if (s.active && s.ready && !REDUCED.matches) {
        s.draw(t / 1000, dt);
        any = true;
      }
    }
    if (any) rafId = window.requestAnimationFrame(frame);
  }

  function wake() {
    if (rafId === null && !document.hidden && !REDUCED.matches) {
      lastT = performance.now();
      rafId = window.requestAnimationFrame(frame);
    }
  }

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      for (var j = 0; j < scenes.length; j++) {
        if (scenes[j].canvas === entries[i].target) {
          scenes[j].active = entries[i].isIntersecting;
        }
      }
    }
    wake();
  }, { threshold: 0.05, rootMargin: "10%" });

  function setup(s) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = s.canvas.getBoundingClientRect();
    if (rect.width < 2) { s.ready = false; return; }
    s.canvas.width = Math.round(rect.width * dpr);
    s.canvas.height = Math.round(rect.height * dpr);
    s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    s.w = rect.width;
    s.h = rect.height;
    if (s.resize) s.resize(s.w, s.h);
    s.ready = true;
    if (REDUCED.matches) s.draw(0, 0); // one meaningful static frame
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      for (var i = 0; i < scenes.length; i++) setup(scenes[i]);
      wake();
    }, 150);
  });

  document.addEventListener("visibilitychange", wake);

  var onReducedChange = function () {
    for (var i = 0; i < scenes.length; i++) setup(scenes[i]);
    wake();
  };
  if (REDUCED.addEventListener) REDUCED.addEventListener("change", onReducedChange);

  window.Motion = {
    register: function (canvas, factory) {
      if (!canvas) return;
      var s = { canvas: canvas, ctx: canvas.getContext("2d"), active: false, ready: false, w: 0, h: 0 };
      var api = factory(s); // { resize?(w,h), draw(t,dt) }
      s.resize = api.resize || null;
      s.draw = api.draw;
      scenes.push(s);
      setup(s);
      io.observe(canvas);
    },
    reduced: function () { return REDUCED.matches; },
    coarse: window.matchMedia("(pointer: coarse)").matches
  };
})();
