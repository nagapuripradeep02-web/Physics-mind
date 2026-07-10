// Single source of truth for the brand. Renaming the startup = editing this file only.
window.BRAND = {
  name: "Viditra",
  sub: "For Teachers",
  tagline: "The moving picture you can’t draw on a whiteboard.",
  description:
    "{name} gives physics teachers accurate, manipulable 3D simulations for Class 10–12 — JEE, NEET and CBSE — driven live in class. One week free, then ₹699/month for founding teachers.",
  email: "nagapuripradeep02@gmail.com"
};

(function () {
  var b = window.BRAND;
  document.documentElement.classList.add("js"); // reveal animations opt-in only when JS runs
  document.title = b.name + " — " + b.tagline;
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", b.description.replace(/\{name\}/g, b.name));
})();
