// Rebuilds chapter-36 Mermaid graph with ALL 77 concepts (atomic + nano),
// 3-tier badges (Signature / Diamond / Standard), and the FULL strict
// dependency web (every prereq edge in the catalogue, any combination of
// atomic<->nano). Cross-topic prerequisites render as external (dashed) nodes.
const fs = require("fs");
const path = require("path");

const CAT = path.join(__dirname, "..", "docs", "catalog", "pilot-topic-36-moving-charges-magnetism.md");
const OUT = path.join(__dirname, "..", "docs", "exports", "chapters", "diagrams", "chapter-36-moving-charges-magnetism.mmd");

// ---- tier assignment (from the T36 diamond-classification pilot) ----
const SIGNATURE = new Set(["A3", "A21", "A30"]);
const DIAMOND = new Set([
  "A1", "A2", "A4", "A5", "A7", "A10", "A11", "A13", "A14", "A15",
  "A17", "A18", "A20", "A26", "A27", "A29", "A31", "A33", // 18 atomic
  "N1.2", "N11.2", // 2 nano
]);
const tierOf = (code) => (SIGNATURE.has(code) ? "sig" : DIAMOND.has(code) ? "dia" : "std");
const badge = (t) => (t === "sig" ? "⭐" : t === "dia" ? "💎" : "◻");

// ---- parse catalogue Section D rows: code, name, type, requires, required-by ----
const lines = fs.readFileSync(CAT, "utf8").split(/\r?\n/);
const nodes = new Map(); // code -> {code,name,type}
const edges = new Set(); // "src>dst"
const externals = new Map(); // extLabel -> id
const extEdges = new Set();

const CODE = "(A\\d+|N\\d+\\.\\d+)";
for (const ln of lines) {
  if (!ln.trim().startsWith("|")) continue;
  const idm = ln.match(new RegExp("\\|\\s*(?:↳\\s*)?\\*{0,2}" + CODE + "\\*{0,2}\\s*`([^`]+)`"));
  if (!idm) continue;
  const code = idm[1];
  const name = idm[2];
  // split into cells, find the exact atomic/nano type cell (robust to | in math)
  let s = ln.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  const cells = s.split("|");
  let k = -1;
  for (let i = 1; i < cells.length; i++) {
    const v = cells[i].replace(/\*/g, "").trim().toLowerCase();
    if (v === "atomic" || v === "nano") { k = i; break; }
  }
  if (k === -1) continue;
  const type = cells[k].replace(/\*/g, "").trim().toLowerCase();
  if (!nodes.has(code)) nodes.set(code, { code, name, type });
  // requires = cell k+3, required-by = cell k+4
  const requires = cells[k + 3] || "";
  const requiredBy = cells[k + 4] || "";
  nodes.get(code)._req = requires;
  nodes.get(code)._reqby = requiredBy;
}

// ---- build DIRECT-prereq edges (prereq -> dependent), then transitive-reduce ----
// Use Requires only (authoritative "what must come before this"); required-by is
// the inverse and only adds redundancy. Direction: prereq --> dependent.
const codeRe = /A\d+|N\d+\.\d+/g;
const extRe = /\[([^\]]+)\]/g;
const sid = (code) => code.replace(/\./g, "_");
let extId = 0;
const addExt = (label, dstCode) => {
  const clean = label.replace(/^(math-tools|Topic-\d+):\s*/i, "").trim();
  const tag = /math-tools/i.test(label) ? "math-tool" : (label.match(/Topic-\d+/) || ["other"])[0];
  if (!externals.has(clean)) externals.set(clean, { id: "X" + extId++, label: clean, tag });
  extEdges.add(externals.get(clean).id + ">" + sid(dstCode));
};

const raw = new Set(); // "src>dst" of direct prereq edges (sanitised codes)
for (const [code, n] of nodes) {
  for (const tok of (n._req.match(codeRe) || [])) {
    if (nodes.has(tok) && tok !== code) raw.add(sid(tok) + ">" + sid(code));
  }
  for (const m of n._req.matchAll(extRe)) addExt(m[1], code);
}

// adjacency + cycle-safe reachability (ignores the edge under test)
const adj = new Map();
for (const e of raw) { const [a, b] = e.split(">"); (adj.get(a) || adj.set(a, []).get(a)).push(b); }
const reachableWithout = (start, target, skipFrom, skipTo) => {
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const u = stack.pop();
    for (const v of adj.get(u) || []) {
      if (u === skipFrom && v === skipTo) continue; // don't use the edge we're testing
      if (v === target) return true;
      if (!seen.has(v)) { seen.add(v); stack.push(v); }
    }
  }
  return false;
};
// transitive reduction: drop edge a->b if b is still reachable from a another way
for (const e of raw) {
  const [a, b] = e.split(">");
  if (reachableWithout(a, b, a, b)) continue; // redundant (transitive)
  edges.add(e);
}

// ---- label prettifier ----
const pretty = (name) =>
  name
    .replace(/_equals_/g, " = ")
    .replace(/_over_/g, "/")
    .replace(/_cross_/g, "×")
    .replace(/_plus_/g, "+")
    .replace(/_minus_/g, "−")
    .replace(/_dot_/g, "·")
    .replace(/mu0/g, "μ₀")
    .replace(/2pi/g, "2π")
    .replace(/\bpi\b/g, "π")
    .replace(/_/g, " ")
    .replace(/"/g, "'")
    .trim();

// ---- emit Mermaid ----
const out = [];
out.push("graph TD");
out.push("  %% T36 Moving Charges & Magnetism — all 77 concepts, tier-badged, full dependency web");

// nodes grouped by type for readability of the source
const atomics = [...nodes.values()].filter((n) => n.type === "atomic");
const nanos = [...nodes.values()].filter((n) => n.type === "nano");
const emit = (n) => {
  const t = tierOf(n.code);
  out.push(`  ${sid(n.code)}["${badge(t)} ${n.code} · ${pretty(n.name)}"]`);
};
out.push("  %% --- atomic concepts ---");
atomics.forEach(emit);
out.push("  %% --- nano concepts ---");
nanos.forEach(emit);

// external cross-topic prereqs
if (externals.size) {
  out.push("  %% --- external (cross-topic) prerequisites ---");
  for (const e of externals.values()) out.push(`  ${e.id}(["⤴ ${e.label} (${e.tag})"])`);
}

// edges
out.push("  %% --- dependency edges (prereq --> dependent) ---");
for (const e of [...edges].sort()) {
  const [a, b] = e.split(">");
  out.push(`  ${a} --> ${b}`);
}
out.push("  %% --- external dependency edges (dashed) ---");
for (const e of [...extEdges].sort()) {
  const [a, b] = e.split(">");
  out.push(`  ${a} -.-> ${b}`);
}

// tier styles
out.push("  %% --- tier styling ---");
out.push("  classDef sig fill:#fbbf24,stroke:#b45309,stroke-width:3px,color:#1f2937;");
out.push("  classDef dia fill:#fde68a,stroke:#d97706,stroke-width:2px,color:#1f2937;");
out.push("  classDef std fill:#f9fafb,stroke:#9ca3af,stroke-width:1px,color:#374151;");
out.push("  classDef ext fill:#e5e7eb,stroke:#6b7280,stroke-dasharray:4 3,color:#4b5563;");
const byTier = (t) => [...nodes.values()].filter((n) => tierOf(n.code) === t).map((n) => sid(n.code));
out.push("  class " + byTier("sig").join(",") + " sig;");
out.push("  class " + byTier("dia").join(",") + " dia;");
out.push("  class " + byTier("std").join(",") + " std;");
if (externals.size) out.push("  class " + [...externals.values()].map((e) => e.id).join(",") + " ext;");

// legend
out.push("  %% --- legend ---");
out.push("  subgraph LEGEND[\" Legend \"]");
out.push("    L1[\"⭐ Signature — showcase sim\"]:::sig");
out.push("    L2[\"💎 Diamond — bespoke, highest polish\"]:::dia");
out.push("    L3[\"◻ Standard — template sim + TTS\"]:::std");
out.push("    L4([\"⤴ external prerequisite (other chapter)\"]):::ext");
out.push("  end");

fs.writeFileSync(OUT, out.join("\n") + "\n", "utf8");

// summary
const counts = { sig: 0, dia: 0, std: 0, atomicDia: 0, nanoDia: 0 };
for (const n of nodes.values()) {
  const t = tierOf(n.code);
  counts[t]++;
  if (t === "dia" && n.type === "atomic") counts.atomicDia++;
  if (t === "dia" && n.type === "nano") counts.nanoDia++;
}
console.log("nodes:", nodes.size, "(atomic", atomics.length, "+ nano", nanos.length, ")");
console.log("internal edges:", edges.size, "| external prereqs:", externals.size, "| external edges:", extEdges.size);
console.log("tiers -> signature:", counts.sig, " diamond:", counts.dia, "(atomic", counts.atomicDia, "+ nano", counts.nanoDia, ") standard:", counts.std);
