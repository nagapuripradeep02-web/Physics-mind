// Reads scripts/catalog_extract.json and emits a single high-impact ("diamond")
// simulations one-pager: docs/exports/PhysicsMind_Diamond_Simulations.md
const fs = require("fs");
const path = require("path");

const data = require("./catalog_extract.json");
const OUT = path.join(__dirname, "..", "docs", "exports");

const classOf = (n) => (n <= 27 ? "Class 11" : "Class 12");
const TITLE_FIX = { "1d": "1D", "2d": "2D", Em: "EM", Ac: "AC", Shm: "SHM", Pn: "PN", Rc: "RC", Lc: "LC" };
const fixTitle = (t) => t.split(" ").map((w) => TITLE_FIX[w] || w).join(" ");
const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
const isDiamond = (n) => /diamond/i.test(n || "");
const isAha = (n) => /primary aha/i.test(n || "");
function cogError(notes) {
  const m = (notes || "").match(/cognitive_error_target:?\**\s*(.+)$/i);
  if (!m) return "";
  return m[1].replace(/\*\*/g, "").replace(/^["“]/, "").split(/["”]/)[0].trim();
}

const groups = [];
let total = 0;
for (const t of data.topics) {
  const hits = t.rows.filter((r) => isDiamond(r.notes) || isAha(r.notes));
  if (!hits.length) continue;
  total += hits.length;
  groups.push({ num: t.num, title: fixTitle(t.title), cls: classOf(t.num), hits });
}

const md = [];
md.push("# PhysicsMind — Highest-Impact (\"Diamond\") Simulations");
md.push("");
md.push(`> **For physics-teacher review — start here.** These are the **${total} highest-leverage simulations** out of the full ${data.topics.reduce((a, t) => a + t.rows.length, 0)}-concept catalogue: the "aha" moments where a single well-built interactive does the most to create real understanding (and break the most common wrong belief).`);
md.push("");
md.push("**The ask:** for each one — what is the cleanest demonstration, the exact moment of insight, and the misconception it must shatter? These are the ones worth designing most carefully.");
md.push("");
md.push("**Legend:** 💎 = flagged *diamond candidate* in the catalogue · ✦ = flagged *primary aha*. *Targets* = the documented wrong belief the simulation is built to correct.");
md.push("");

// quick chapter tally
md.push("## At a glance");
md.push("");
md.push("| # | Chapter | Class | High-impact sims |");
md.push("|---|---|---|---:|");
for (const g of groups) md.push(`| ${g.num} | ${g.title} | ${g.cls} | ${g.hits.length} |`);
md.push(`| | **Total** | | **${total}** |`);
md.push("");
md.push("---");
md.push("");

for (const g of groups) {
  md.push(`## T${g.num} — ${g.title}  *(${g.cls})*`);
  md.push("");
  for (const r of g.hits) {
    const badge = isDiamond(r.notes) ? "💎" : "✦";
    const ce = cogError(r.notes);
    const misc = ce ? `  \n  _Targets misconception: ${clean(ce)}_` : "";
    md.push(`- ${badge} **\`${r.id}\`** *(${r.type})* — ${clean(r.concept)}${misc}`);
  }
  md.push("");
}

fs.writeFileSync(path.join(OUT, "PhysicsMind_Diamond_Simulations.md"), md.join("\n"), "utf8");
console.log("Wrote docs/exports/PhysicsMind_Diamond_Simulations.md");
console.log("High-impact simulations:", total, "across", groups.length, "chapters");
