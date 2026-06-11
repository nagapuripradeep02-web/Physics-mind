// One-off extractor: pulls every atomic+nano concept row out of the Stage-2
// topic catalogs (docs/catalog/pilot-topic-*.md) into structured data.
// Parses by the canonical 8-column header signature so it ignores the
// cross-source / dependency tables that share the word "atomic"/"nano".
const fs = require("fs");
const path = require("path");

const CATALOG_DIR = path.join(__dirname, "..", "docs", "catalog");
const CANON_COLS = ["ID", "Concept", "Type", "Sim?", "In repo?", "Requires", "Required-by", "Notes"];

// pull a clean topic number + title from filename like pilot-topic-6-kinematics-1d.md
function topicMeta(file) {
  const m = file.match(/^pilot-topic-(\d+)-(.+)\.md$/);
  if (!m) return { num: 9999, slug: file, title: file };
  const num = parseInt(m[1], 10);
  const title = m[2].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { num, slug: m[2], title };
}

function splitRow(line) {
  // strip leading/trailing pipe, then split on unescaped pipes
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

function isSeparator(line) {
  return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes("-");
}

function isCanonHeader(cells) {
  if (cells.length < 8) return false;
  const head = cells.slice(0, 8).map((c) => c.replace(/\*/g, "").trim().toLowerCase());
  return (
    head[0] === "id" &&
    head[1] === "concept" &&
    head[2] === "type" &&
    head[3].startsWith("sim") &&
    head[4].startsWith("in repo") &&
    head[5] === "requires" &&
    head[6] === "required-by" &&
    head[7] === "notes"
  );
}

function cleanId(raw) {
  // ↳ marks a nano child; strip bold + arrow markers
  return raw.replace(/↳/g, "").replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function classifyType(typeCell) {
  const t = typeCell.replace(/\*/g, "").toLowerCase();
  if (t.includes("nano")) return "nano";
  if (t.includes("atomic")) return "atomic";
  return t || "?";
}

function flag(cell) {
  const c = cell.toLowerCase().trim();
  if (c.includes("✅")) return "yes";
  if (c.includes("❌")) return "no";
  if (/^yes\b/.test(c)) return "yes"; // "yes (rotating arrow ...)" Format-2
  if (/^no\b/.test(c)) return "no";
  if (c.includes("⚖") || c.includes("partial")) return "partial";
  if (c === "—" || c === "-" || c === "") return "—";
  // a Format-2 "Sim type" value (derivation/identity/calculus/substitution/...) means it IS simulatable
  if (/^(derivation|identity|calculus|substitution|animation|geometry|graph|vector|construction|table|demo)/.test(c)) return "yes";
  return cell.trim();
}

// Several layouts use short codes in the ID column (A1, A1.n1, N1.1) with the
// real concept name in the Concept column. Detect those.
function isCode(id) {
  return /^[A-Z]{1,3}\d+(\.[a-z]?\d+)*$/.test(id.trim());
}

function isNanoHeader(cells) {
  if (cells.length < 5) return false;
  const h = cells.slice(0, 5).map((c) => c.replace(/\*/g, "").trim().toLowerCase());
  return h[0] === "id" && /concept \(nano\)/.test(h[1]) && h[2] === "parent" && /sim/.test(h[3]) && h[4] === "notes";
}

const files = fs
  .readdirSync(CATALOG_DIR)
  .filter((f) => /^pilot-topic-\d+-.+\.md$/.test(f))
  .sort((a, b) => topicMeta(a).num - topicMeta(b).num);

const topics = [];
let grand = { atomic: 0, nano: 0, other: 0, simYes: 0, inRepoYes: 0 };
const seenGlobal = new Map(); // id -> first topic (dup detection)

for (const file of files) {
  const meta = topicMeta(file);
  const lines = fs.readFileSync(path.join(CATALOG_DIR, file), "utf8").split(/\r?\n/);
  const rows = [];
  const seenLocal = new Set();
  for (let i = 0; i < lines.length; i++) {
    const cells = splitRow(lines[i]);

    // ---- Format-2 separate nano table: | ID | Concept (nano) | Parent | Sim type | Notes |
    if (isNanoHeader(cells)) {
      let j = i + 1;
      if (j < lines.length && isSeparator(lines[j])) j++;
      for (; j < lines.length; j++) {
        const ln = lines[j];
        if (!ln.trim().startsWith("|")) break;
        if (isSeparator(ln)) continue;
        const rc = splitRow(ln);
        if (rc.length < 5) continue;
        if (cleanId(rc[0]).toLowerCase() === "id") continue;
        const id = cleanId(rc[1]); // real concept name is in the Concept(nano) col
        if (!id) continue;
        const key = id + "::nano";
        if (seenLocal.has(key)) continue;
        seenLocal.add(key);
        rows.push({
          id,
          concept: rc.slice(4).join("|").trim(), // Notes col carries the description
          type: "nano",
          sim: flag(rc[3] || ""),               // Sim type → simulatable
          inRepo: "—",
          requires: `parent: ${cleanId(rc[2])}`,
          requiredBy: "",
          notes: rc.slice(4).join("|").trim(),
        });
      }
      i = j - 1;
      continue;
    }

    if (!isCanonHeader(cells)) continue;
    // found a header; consume following rows
    let j = i + 1;
    if (j < lines.length && isSeparator(lines[j])) j++;
    for (; j < lines.length; j++) {
      const ln = lines[j];
      if (!ln.trim().startsWith("|")) break; // table ended
      if (isSeparator(ln)) continue;
      const rc = splitRow(ln);
      if (rc.length < 8) continue;
      // untrimmed cells (same boundaries) so we can rejoin pipe-broken concept/
      // notes text WITHOUT losing the spaces around math abs-value bars ( |v| ).
      const rcRaw = (() => {
        let s = ln.trim();
        if (s.startsWith("|")) s = s.slice(1);
        if (s.endsWith("|")) s = s.slice(0, -1);
        return s.split("|");
      })();
      let id = cleanId(rc[0]);
      if (!id || id.toLowerCase() === "id") continue;
      // Concept cells often contain math abs-value bars ( |v|, |displacement| )
      // that splitRow wrongly treats as column delimiters. The Type column is
      // reliably an exact "atomic"/"nano"/"micro" cell, so anchor on it:
      let k = -1;
      for (let c = 2; c < rc.length; c++) {
        const v = rc[c].replace(/\*/g, "").trim().toLowerCase();
        if (v === "atomic" || v === "nano" || v === "micro") { k = c; break; }
      }
      if (k === -1) continue; // not a real concept row
      let concept = rcRaw.slice(1, k).join("|").trim();
      const type = classifyType(rc[k]);
      const sim = flag(rc[k + 1] || "");
      const inRepo = flag(rc[k + 2] || "");
      const requires = (rc[k + 3] || "").trim();
      const requiredBy = (rc[k + 4] || "").trim();
      let notes = rcRaw.slice(k + 5).join("|").trim();
      // Resolve the several code-bearing layouts so the teacher sees real ids:
      //  D (T12/T21/T36): ID cell = "A1 real_name", description already in Concept col.
      //  B/C (T10/T13/T17/T30...): ID cell = bare code "A1"/"A1.n1", real name in
      //    Concept col, description in Notes.
      let code = "";
      const cn = id.match(/^([A-Z]{1,3}\d+(?:\.[a-z]?\d+)*)\s+(\S.*)$/);
      if (cn) {
        code = cn[1];
        id = cn[2].trim(); // concept (description) stays as parsed
      } else if (isCode(id) && concept) {
        code = id;
        id = cleanId(concept);
        concept = notes || concept;
      }
      const key = id + "::" + type;
      if (seenLocal.has(key)) continue; // same table repeated in file
      seenLocal.add(key);
      rows.push({ id, concept, type, sim, inRepo, requires, requiredBy, notes, code });
    }
    i = j - 1;
  }
  // translate code-based Requires/Required-by into real concept names (per topic)
  const codeMap = new Map();
  for (const r of rows) if (r.code) codeMap.set(r.code, r.id);
  const translate = (s) =>
    (s || "").replace(/[A-Z]{1,3}\d+(\.[a-z]?\d+)*/g, (m) => codeMap.get(m) || m);
  if (codeMap.size) {
    for (const r of rows) {
      r.requires = translate(r.requires);
      r.requiredBy = translate(r.requiredBy);
    }
  }

  // tally
  let a = 0, n = 0, o = 0, simY = 0, repoY = 0;
  for (const r of rows) {
    if (r.type === "atomic") a++;
    else if (r.type === "nano") n++;
    else o++;
    if (r.sim === "yes") simY++;
    if (r.inRepo === "yes") repoY++;
    if (!seenGlobal.has(r.id)) seenGlobal.set(r.id, meta.num);
  }
  grand.atomic += a;
  grand.nano += n;
  grand.other += o;
  grand.simYes += simY;
  grand.inRepoYes += repoY;
  topics.push({ ...meta, file, rows, counts: { atomic: a, nano: n, other: o, total: rows.length, simYes: simY, repoY } });
}

const out = { topics, grand, fileCount: files.length, uniqueIds: seenGlobal.size };
fs.writeFileSync(path.join(__dirname, "catalog_extract.json"), JSON.stringify(out, null, 2));

// console summary
console.log("files parsed:", files.length);
console.log("ATOMIC:", grand.atomic, " NANO:", grand.nano, " OTHER:", grand.other);
console.log("GRAND TOTAL entries:", grand.atomic + grand.nano + grand.other);
console.log("unique ids:", seenGlobal.size);
console.log("Sim?=yes:", grand.simYes, " In-repo=yes:", grand.inRepoYes);
console.log("---- per topic ----");
for (const t of topics) {
  console.log(
    `T${String(t.num).padEnd(3)} ${t.title.padEnd(34)} a=${String(t.counts.atomic).padStart(2)} n=${String(t.counts.nano).padStart(2)} tot=${String(t.counts.total).padStart(3)} sim=${String(t.counts.simYes).padStart(3)} repo=${String(t.counts.repoY).padStart(2)}`
  );
}
