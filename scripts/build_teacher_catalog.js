// Reads scripts/catalog_extract.json and emits two teacher-facing deliverables:
//   docs/exports/PhysicsMind_Concept_Catalog.csv   (sortable/filterable in Excel)
//   docs/exports/PhysicsMind_Concept_Catalog.md    (readable / printable overview)
const fs = require("fs");
const path = require("path");

const data = require("./catalog_extract.json");
const OUT_DIR = path.join(__dirname, "..", "docs", "exports");
fs.mkdirSync(OUT_DIR, { recursive: true });

const classOf = (num) => (num <= 27 ? "Class 11" : "Class 12");

// tidy the title-cased filename slugs for a human reader
const TITLE_FIX = {
  "1d": "1D", "2d": "2D", "Em": "EM", "Ac": "AC", "Shm": "SHM",
  "Pn": "PN", "Ncert": "NCERT", "Rc": "RC", "Lc": "LC",
};
function fixTitle(t) {
  return t
    .split(" ")
    .map((w) => TITLE_FIX[w] || w)
    .join(" ");
}

// ---- derive helper fields from the Notes column ----
function isDiamond(notes) {
  return /diamond/i.test(notes) ? "YES" : "";
}
function cogError(notes) {
  const m = notes.match(/cognitive_error_target:?\**\s*(.+)$/i);
  if (!m) return "";
  return m[1].replace(/\*\*/g, "").replace(/^["“]/, "").replace(/["”].*$/, (s) => "").trim();
}
function cleanCell(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

// ---- CSV ----
function csvField(s) {
  const v = (s == null ? "" : String(s));
  return '"' + v.replace(/"/g, '""') + '"';
}
const csvHeader = [
  "Topic#", "Topic", "Class", "Concept ID", "Type", "Simulatable",
  "Diamond (high-impact aha)", "Targets misconception", "Description (what the sim teaches)",
  "Requires (prerequisites)", "Required-by (unlocks)", "Notes", "Built in repo?",
];
const csvLines = [csvHeader.map(csvField).join(",")];

// ---- MD ----
const md = [];
md.push("# PhysicsMind — Complete Concept & Simulation Catalogue");
md.push("");
md.push("> **For physics-teacher review.** This is the full atomic + nano concept inventory across all 44 curriculum topics (NCERT Class 11 + 12, JEE/NEET).");
md.push("> Each row is one **teachable idea = one planned interactive simulation**. The `Requires` / `Required-by` columns are the dependency graph — use them to design the teaching pathway (what to teach before what).");
md.push("");
md.push("**What we'd love your help with:** for each concept — and especially the 💎 *diamond* moments — how would you teach it? What's the cleanest order, the right \"aha\" demonstration, and the wrong belief students walk in with that the simulation must break?");
md.push("");
md.push("**Status note:** this is the *plan*, not what's built yet. ~65 simulations are built so far; the catalogue is the full roadmap of everything we intend to build, sourced from where NCERT + HC Verma + DC Pandey all cover a concept. Topic numbers skip a few (5, 24, 28, 32, 33, 40) — those are either built directly without a catalogue (e.g. Vectors) or out of scope for now.");
md.push("");
md.push("## How to read this");
md.push("");
md.push("| Column | Meaning |");
md.push("|---|---|");
md.push("| **Type — atomic** | One complete teachable idea = one student question = one simulation (e.g. *free fall under gravity*). |");
md.push("| **Type — nano** | The smallest sub-unit — one symbol, one term, one edge-case under a parent atomic (shown with `↳`). |");
md.push("| **Simulatable** | ✅ = the idea can be shown as an interactive/animated simulation. (Almost all can.) |");
md.push("| **Diamond** | A high-impact \"aha\" simulation worth building to the highest polish — the moments that create understanding. |");
md.push("| **Targets misconception** | The specific wrong belief students hold that this simulation is designed to correct. |");
md.push("| **Requires** | Concepts a student should meet *before* this one — the incoming edges of the learning pathway. |");
md.push("| **Required-by** | Concepts that build on this one — the outgoing edges. Together these define the teaching sequence. |");
md.push("| **Description** | What the simulation actually teaches — the physics content, including derivation/formula where relevant. |");
md.push("");

// totals
let TA = 0, TN = 0, TS = 0, TD = 0;
const perTopic = [];
for (const t of data.topics) {
  let d = 0, s = 0;
  for (const r of t.rows) {
    if (isDiamond(r.notes)) d++;
    if (r.sim === "yes") s++;
  }
  TA += t.counts.atomic; TN += t.counts.nano; TS += s; TD += d;
  perTopic.push({ ...t, diamonds: d, sims: s });
}

md.push("## Summary");
md.push("");
md.push(`- **Topics:** ${data.topics.length}`);
md.push(`- **Total concept-simulations:** ${TA + TN}  ( ${TA} atomic + ${TN} nano )`);
md.push(`- **Unique concept IDs:** ${data.uniqueIds}  *(some concepts are shared across more than one topic)*`);
md.push(`- **Flagged simulatable:** ${TS}`);
md.push(`- **Diamond (highest-impact) simulations:** ${TD}`);
md.push("");
md.push("### Per-topic counts");
md.push("");
md.push("| # | Topic | Class | Atomic | Nano | Total | Simulatable | Diamonds |");
md.push("|---|---|---|---:|---:|---:|---:|---:|");
for (const t of perTopic) {
  md.push(`| ${t.num} | ${fixTitle(t.title)} | ${classOf(t.num)} | ${t.counts.atomic} | ${t.counts.nano} | ${t.counts.total} | ${t.sims} | ${t.diamonds} |`);
}
md.push("");
md.push("---");
md.push("");

// per-topic detail tables
const esc = (s) => cleanCell(s).replace(/\|/g, "\\|");
for (const t of data.topics) {
  md.push(`## T${t.num} — ${fixTitle(t.title)}  *(${classOf(t.num)})*`);
  md.push("");
  md.push(`*${t.counts.atomic} atomic + ${t.counts.nano} nano = ${t.counts.total} concepts.*`);
  md.push("");
  md.push("| Concept ID | Type | Sim | Diamond | Description (what it teaches) | Requires | Required-by | Targets misconception |");
  md.push("|---|---|:---:|:---:|---|---|---|---|");
  for (const r of t.rows) {
    const idCell = r.type === "nano" ? `↳ ${esc(r.id)}` : `**${esc(r.id)}**`;
    const simCell = r.sim === "yes" ? "✅" : r.sim === "no" ? "❌" : esc(r.sim);
    md.push(
      `| ${idCell} | ${r.type} | ${simCell} | ${isDiamond(r.notes) ? "💎" : ""} | ${esc(r.concept)} | ${esc(r.requires)} | ${esc(r.requiredBy)} | ${esc(cogError(r.notes))} |`
    );
    // CSV row
    csvLines.push([
      t.num, fixTitle(t.title), classOf(t.num), r.id, r.type,
      r.sim === "yes" ? "Yes" : r.sim === "no" ? "No" : r.sim,
      isDiamond(r.notes), cleanCell(cogError(r.notes)), cleanCell(r.concept),
      cleanCell(r.requires), cleanCell(r.requiredBy), cleanCell(r.notes),
      r.inRepo === "yes" ? "Yes" : "",
    ].map(csvField).join(","));
  }
  md.push("");
}

fs.writeFileSync(path.join(OUT_DIR, "PhysicsMind_Concept_Catalog.md"), md.join("\n"), "utf8");
fs.writeFileSync(path.join(OUT_DIR, "PhysicsMind_Concept_Catalog.csv"), "﻿" + csvLines.join("\r\n"), "utf8");

console.log("WROTE:");
console.log("  docs/exports/PhysicsMind_Concept_Catalog.md  (" + md.length + " lines)");
console.log("  docs/exports/PhysicsMind_Concept_Catalog.csv  (" + (csvLines.length - 1) + " data rows)");
console.log("Totals -> atomic:", TA, "nano:", TN, "total:", TA + TN, "simulatable:", TS, "diamonds:", TD);
