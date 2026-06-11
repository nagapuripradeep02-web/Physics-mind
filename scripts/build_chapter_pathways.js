// Reads scripts/catalog_extract.json and emits one dependency-ordered pathway
// document per chapter into docs/exports/chapters/, plus an INDEX.md.
// Each chapter: a Mermaid atomic-backbone graph + a level-by-level teaching
// ladder (atomics topologically sorted, nanos nested under their parent atomic).
const fs = require("fs");
const path = require("path");

const data = require("./catalog_extract.json");
const OUT = path.join(__dirname, "..", "docs", "exports", "chapters");
fs.mkdirSync(OUT, { recursive: true });

const classOf = (n) => (n <= 27 ? "Class 11" : "Class 12");
const TITLE_FIX = { "1d": "1D", "2d": "2D", Em: "EM", Ac: "AC", Shm: "SHM", Pn: "PN", Rc: "RC", Lc: "LC" };
const fixTitle = (t) => t.split(" ").map((w) => TITLE_FIX[w] || w).join(" ");
const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
const esc = (s) => clean(s).replace(/\|/g, "\\|");
const isDiamond = (notes) => /diamond/i.test(notes || "");
function cogError(notes) {
  const m = (notes || "").match(/cognitive_error_target:?\**\s*(.+)$/i);
  if (!m) return "";
  return m[1].replace(/\*\*/g, "").replace(/^["“]/, "").split(/["”]/)[0].trim();
}
// pull concept-id-looking tokens out of a Requires/Required-by cell
const tokens = (s) => (s || "").match(/[a-z][a-z0-9_]{3,}/gi) || [];

const index = [];

for (const t of data.topics) {
  const rows = t.rows;
  const ids = new Set(rows.map((r) => r.id));
  const byId = new Map(rows.map((r) => [r.id, r]));
  const atomics = rows.filter((r) => r.type !== "nano");
  const nanos = rows.filter((r) => r.type === "nano");
  const atomicIds = new Set(atomics.map((r) => r.id));

  // intra-chapter prerequisite edges (only edges to concepts in THIS chapter)
  const needs = new Map();
  for (const r of rows) needs.set(r.id, tokens(r.requires).filter((x) => ids.has(x) && x !== r.id));

  // topological levels via Kahn-by-waves (atomic->atomic edges only).
  // Each wave = one level; a node's level = longest prerequisite chain depth.
  // Cycles can't fully resolve, so we break them deterministically and flag them.
  const adj = new Map([...atomicIds].map((id) => [id, []]));
  const indeg = new Map([...atomicIds].map((id) => [id, 0]));
  const seenEdge = new Set();
  for (const id of atomicIds) {
    for (const p of needs.get(id)) {
      if (!atomicIds.has(p) || p === id) continue;
      const e = p + ">" + id;
      if (seenEdge.has(e)) continue;
      seenEdge.add(e);
      adj.get(p).push(id);
      indeg.set(id, indeg.get(id) + 1);
    }
  }
  const aLevel = new Map();
  const cycleNodes = new Set();
  const remaining = new Set(atomicIds);
  let cur = 0;
  while (remaining.size) {
    let ready = [...remaining].filter((id) => indeg.get(id) === 0);
    if (!ready.length) {
      // cycle — break it by releasing the least-blocked node(s) this wave
      const minIn = Math.min(...[...remaining].map((id) => indeg.get(id)));
      ready = [...remaining].filter((id) => indeg.get(id) === minIn);
      ready.forEach((id) => cycleNodes.add(id));
    }
    for (const id of ready) { aLevel.set(id, cur); remaining.delete(id); }
    for (const id of ready) for (const dep of adj.get(id)) if (remaining.has(dep)) indeg.set(dep, indeg.get(dep) - 1);
    cur++;
  }
  const maxL = atomics.length ? cur - 1 : 0;

  // nano -> parent atomic (first within-chapter atomic it requires)
  const parentOf = new Map();
  for (const n of nanos) {
    const p = needs.get(n.id).find((x) => atomicIds.has(x));
    parentOf.set(n.id, p || null);
  }
  const nanosByParent = new Map([...atomicIds].map((id) => [id, []]));
  const orphanNanos = [];
  for (const n of nanos) {
    const p = parentOf.get(n.id);
    if (p && nanosByParent.has(p)) nanosByParent.get(p).push(n);
    else orphanNanos.push(n);
  }

  // ---- build the document ----
  const dCount = rows.filter((r) => isDiamond(r.notes)).length;
  const foundations = atomics.filter((a) => aLevel.get(a.id) === 0).map((a) => a.id);
  const md = [];
  md.push(`# T${t.num} — ${fixTitle(t.title)}  *(${classOf(t.num)})*`);
  md.push("");
  md.push(`> Dependency-ordered teaching pathway for physics-teacher review.`);
  md.push(`> **${atomics.length} atomic + ${nanos.length} nano = ${rows.length} concept-simulations.**` + (dCount ? `  ${dCount} 💎 diamond (highest-impact).` : ""));
  md.push("");
  md.push(`**How to use this:** teach top-to-bottom. Everything in a level only depends on earlier levels. Each **atomic** is a full teachable idea (= one simulation); the **↳ nanos** under it are its sub-points (one symbol / term / edge-case each).`);
  md.push("");
  md.push(`**Foundations (teach first, nothing in this chapter comes before them):** ${foundations.length ? foundations.join(", ") : "— (this chapter's concepts mostly build on *other* chapters)"}`);
  md.push("");
  if (cycleNodes.size) {
    md.push(`> ⚠ **${cycleNodes.size} concept(s) have circular prerequisites** in the source catalogue (marked ⟲ below) — i.e. they list each other as prerequisites. The level placement for these is a best-effort break of the loop; worth a human review of the intended order.`);
    md.push("");
  }

  // ---- Mermaid atomic backbone ----
  md.push(`## Concept dependency graph (atomic backbone)`);
  md.push("");
  md.push("```mermaid");
  md.push("graph TD");
  const key = new Map([...atomicIds].map((id, i) => [id, "c" + i]));
  for (const a of atomics) {
    const label = a.id.replace(/_/g, " ").replace(/"/g, "'");
    md.push(`  ${key.get(a.id)}["${label}"]`);
  }
  let edges = 0;
  for (const a of atomics) {
    for (const p of needs.get(a.id)) {
      if (atomicIds.has(p) && p !== a.id) { md.push(`  ${key.get(p)} --> ${key.get(a.id)}`); edges++; }
    }
  }
  // highlight diamonds
  const diamondAtomics = atomics.filter((a) => isDiamond(a.notes));
  if (diamondAtomics.length) {
    md.push("  classDef diamond fill:#fde68a,stroke:#d97706,stroke-width:2px;");
    md.push("  class " + diamondAtomics.map((a) => key.get(a.id)).join(",") + " diamond;");
  }
  md.push("```");
  md.push("");
  if (edges === 0) md.push("*(No within-chapter prerequisite edges — these concepts depend mainly on earlier chapters. Order below is the catalogue sequence.)*\n");

  // ---- level ladder ----
  md.push(`## Teaching pathway (dependency-ordered)`);
  md.push("");
  // bullets are NOT table cells — keep literal pipes, just normalise whitespace
  const renderConcept = (r, isNano) => {
    const tag = (isDiamond(r.notes) ? " 💎" : "") + (cycleNodes.has(r.id) ? " ⟲" : "");
    const ce = cogError(r.notes);
    const misc = ce ? `  _(targets misconception: ${clean(ce)})_` : "";
    const desc = clean(r.concept);
    if (isNano) md.push(`  - ↳ \`${r.id}\` — ${desc}${tag}${misc}`);
    else md.push(`- **\`${r.id}\`**${tag} — ${desc}${misc}`);
  };
  for (let L = 0; L <= maxL; L++) {
    const here = atomics.filter((a) => aLevel.get(a.id) === L);
    if (!here.length) continue;
    md.push(`### Level ${L}${L === 0 ? " — foundations" : ""}`);
    md.push("");
    for (const a of here) {
      renderConcept(a, false);
      for (const n of nanosByParent.get(a.id)) renderConcept(n, true);
    }
    md.push("");
  }
  if (orphanNanos.length) {
    md.push(`### Other sub-concepts (parent atomic is in another chapter)`);
    md.push("");
    for (const n of orphanNanos) renderConcept(n, true);
    md.push("");
  }

  const slug = t.file.replace(/^pilot-topic-\d+-/, "").replace(/\.md$/, "");
  const fname = `chapter-${String(t.num).padStart(2, "0")}-${slug}.md`;
  fs.writeFileSync(path.join(OUT, fname), md.join("\n"), "utf8");
  index.push({ num: t.num, title: fixTitle(t.title), cls: classOf(t.num), fname, a: atomics.length, n: nanos.length, d: dCount, lv: maxL + 1, edges, cyc: cycleNodes.size });
}

// ---- INDEX ----
const idx = [];
idx.push("# PhysicsMind — Per-Chapter Teaching Pathways");
idx.push("");
idx.push("Each chapter is a **dependency-ordered** pathway (foundations first) with a visual concept-dependency graph. Hand a teacher one chapter at a time.");
idx.push("");
idx.push("| # | Chapter | Class | Atomic | Nano | 💎 | Levels | ⟲ cycles | File |");
idx.push("|---|---|---|---:|---:|---:|---:|---:|---|");
for (const c of index) idx.push(`| ${c.num} | ${c.title} | ${c.cls} | ${c.a} | ${c.n} | ${c.d} | ${c.lv} | ${c.cyc || ""} | [${c.fname}](./${c.fname}) |`);
idx.push("");
idx.push("*⟲ cycles = concepts that list each other as prerequisites in the source catalogue (a best-effort order is used; worth reviewing).*");
fs.writeFileSync(path.join(OUT, "INDEX.md"), idx.join("\n"), "utf8");

console.log("Wrote", index.length, "chapter files + INDEX.md to docs/exports/chapters/");
console.log("Chapters with a real dependency graph (>=1 internal edge):", index.filter((c) => c.edges > 0).length);
console.log("Chapters with NO internal edges (catalogue order kept):", index.filter((c) => c.edges === 0).map((c) => "T" + c.num).join(", ") || "none");
const cyc = index.filter((c) => c.cyc > 0);
console.log("Chapters with circular prerequisites:", cyc.length ? cyc.map((c) => `T${c.num}(${c.cyc})`).join(", ") : "none");
console.log("Max levels across chapters:", Math.max(...index.map((c) => c.lv)));
