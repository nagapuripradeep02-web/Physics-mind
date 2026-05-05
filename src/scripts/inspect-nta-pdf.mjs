/**
 * One-shot inspector — does pdf-parse extract usable text from NTA papers?
 * Run on the smallest PDF to see what text comes out and whether question
 * structure is recoverable.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const pdfPath = resolve("C:/Tutor/nta-source/jee-mains-2026-april/B-Tech-4th-Apr-2026-Shift-1.pdf");
const buf = readFileSync(pdfPath);

const result = await pdfParse(buf);

console.log("File:           ", pdfPath);
console.log("File size:      ", (buf.length / 1024).toFixed(1), "KB");
console.log("PDF pages:      ", result.numpages);
console.log("Total chars:    ", result.text.length);
console.log("Text/page ratio:", (result.text.length / result.numpages).toFixed(0), "chars/page");
console.log("");
console.log("─── First 3000 chars of extracted text ──────────────────────────────");
console.log(result.text.slice(0, 3000));
console.log("");
console.log("─── chars 5000-7000 (probably mid-physics-section) ──────────────────");
console.log(result.text.slice(5000, 7000));
console.log("");
console.log("─── Last 1500 chars ────────────────────────────────────────────────");
console.log(result.text.slice(-1500));
