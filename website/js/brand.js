// Single source of truth for the brand. Renaming the startup = editing this file only.
window.BRAND = {
  name: "Viditra",
  sub: "For Teachers",
  tagline: "The moving picture you can’t draw on a whiteboard.",
  // The positioning line: the teacher's method is the big circle, the product sits inside it.
  promise: "Teachers bring the creativity. {name} brings the visibility.",
  description:
    "{name} gives junior colleges, academies and institutes live 2D and 3D physics simulations for the Indian curriculum — CBSE, ICSE and state boards — driven by your own teachers, in your own classrooms. Founding institute plans open now.",
  email: "pradeep@viditra.co",
  // Individual-teacher seats are RETIRED from the marketing site (institute-only pricing,
  // founder decision 2026-08-15). Existing founding-teacher subscriptions stay honoured in
  // the app. This pair is kept only so main.js's [data-seats-left] fill stays a no-op.
  seatsTotal: 20,
  seatsTaken: 0
};

(function () {
  var b = window.BRAND;
  function branded(text) { return String(text).replace(/\{name\}/g, b.name); }

  document.documentElement.classList.add("js"); // reveal animations opt-in only when JS runs

  // Only the landing page hands its <title>/description to the brand. The legal pages keep
  // their own ("Terms & Conditions — Viditra"), so this is opt-in via <html data-brand-title>.
  if (document.documentElement.hasAttribute("data-brand-title")) {
    document.title = b.name + " — " + b.tagline;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", branded(b.description));
  }

  // Fill every [data-brand] slot, on any page that loads this file — so the header wordmark
  // and tagline stay single-sourced HERE, legal pages included. main.js repeats this for the
  // landing page; writing the same textContent twice is a no-op.
  function fillSlots() {
    var slots = document.querySelectorAll("[data-brand]");
    for (var i = 0; i < slots.length; i++) {
      var key = slots[i].getAttribute("data-brand");
      if (b[key]) slots[i].textContent = branded(b[key]);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fillSlots);
  } else {
    fillSlots();
  }
})();
