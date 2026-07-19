// Brand fill, scroll reveals, header state, seats counter. No frameworks, no forms.
(function () {
  var B = window.BRAND;

  function branded(text) { return text.replace(/\{name\}/g, B.name); }

  // fill every [data-brand] slot from brand.js
  var slots = document.querySelectorAll("[data-brand]");
  for (var i = 0; i < slots.length; i++) {
    var key = slots[i].getAttribute("data-brand");
    if (B[key]) slots[i].textContent = branded(B[key]);
  }

  // mailto links
  var mails = document.querySelectorAll("a.mailto");
  for (var m = 0; m < mails.length; m++) {
    mails[m].href = "mailto:" + B.email;
    mails[m].textContent = B.email;
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // founding-seat counter — single edit point: seatsTaken in brand.js
  var seatsLeft = Math.max(0, (B.seatsTotal || 25) - (B.seatsTaken || 0));
  var seatEls = document.querySelectorAll("[data-seats-left]");
  for (var se = 0; se < seatEls.length; se++) seatEls[se].textContent = String(seatsLeft);

  // header hairline once scrolled
  var header = document.querySelector("header.site");
  var onScroll = function () {
    header.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // scroll reveals (CSS hides .reveal only when html.js is set)
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    for (var r = 0; r < reveals.length; r++) reveals[r].classList.add("in");
  } else {
    // stagger siblings within the same parent
    var counts = new Map();
    for (var k = 0; k < reveals.length; k++) {
      var parent = reveals[k].parentElement;
      var c = counts.get(parent) || 0;
      reveals[k].style.setProperty("--d", String(Math.min(c, 4)));
      counts.set(parent, c + 1);
    }
    var io = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        if (entries[e].isIntersecting) {
          entries[e].target.classList.add("in");
          io.unobserve(entries[e].target);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    for (var v = 0; v < reveals.length; v++) io.observe(reveals[v]);
  }

  // No signup form on the marketing site anymore — every trial CTA links straight to
  // app.viditra.co/join (Google one-tap). The instant self-serve path IS the funnel.
})();
