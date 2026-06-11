// Pulls the ```mermaid``` block out of each chapter-*.md into a .mmd file
// under docs/exports/chapters/diagrams/ for rendering to PNG.
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "docs", "exports", "chapters");
const OUT = path.join(DIR, "diagrams");
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(DIR).filter((f) => /^chapter-\d+-.+\.md$/.test(f));
let wrote = 0, empty = 0;
for (const f of files) {
  const txt = fs.readFileSync(path.join(DIR, f), "utf8");
  const m = txt.match(/```mermaid\s*\n([\s\S]*?)```/);
  if (!m) { empty++; continue; }
  const body = m[1].trim();
  // a graph with only the "graph TD" header (no nodes) isn't worth rendering
  const nodeLines = body.split("\n").filter((l) => /\[".*"\]/.test(l));
  if (nodeLines.length === 0) { empty++; continue; }
  const base = f.replace(/\.md$/, "");
  fs.writeFileSync(path.join(OUT, base + ".mmd"), body + "\n", "utf8");
  wrote++;
}
console.log("wrote", wrote, ".mmd files; skipped", empty, "(no/empty graph)");
