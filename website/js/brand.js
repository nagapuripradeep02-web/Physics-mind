// Single source of truth for the brand. Renaming the startup = editing this file only.
window.BRAND = {
  name: "Viditra",
  sub: "For Teachers",
  tagline: "The moving picture you can’t draw on a whiteboard.",
  description:
    "{name} gives physics teachers accurate, manipulable 2D and 3D simulations for Class 10–12 — NCERT-mapped, for JEE, NEET and CBSE — driven live in class. One week free, then ₹499/month for founding teachers.",
  email: "pradeep@viditra.co",
  whatsapp: "919381346139",   // wa.me number for the trial CTA (country code, no + sign)
  seatsTotal: 25,
  seatsTaken: 15              // founder-updated as founding seats fill; site renders "X of 25 left"
};

(function () {
  var b = window.BRAND;
  document.documentElement.classList.add("js"); // reveal animations opt-in only when JS runs
  document.title = b.name + " — " + b.tagline;
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", b.description.replace(/\{name\}/g, b.name));
})();
