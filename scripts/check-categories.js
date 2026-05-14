const fs = require("fs");
const INPUT = "D:\\Dropbox\\Festy APP\\260409 ExportFromGlide\\Festivals260514.csv";
const raw = fs.readFileSync(INPUT, "utf8");

function parseCSV(content) {
  const rows = [];
  let row = [], field = "", inQuote = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i], next = content[i + 1];
    if (inQuote) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') inQuote = false;
      else field += ch;
    } else {
      if (ch === '"') inQuote = true;
      else if (ch === ',') { row.push(field); field = ""; }
      else if (ch === '\n') { row.push(field); field = ""; rows.push(row); row = []; }
      else if (ch !== '\r') field += ch;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parseCSV(raw);
const headers = rows[0];
const catIdx  = headers.findIndex(h => h.trim() === "Category");
const nameIdx = headers.findIndex(h => h.trim() === "Name");

const VALID = new Set([
  "Kirchweih","Music Event","Folk Festival","Art Performance",
  "Seasonal Market","Food & Wine Tasting","Parade & Procession",
  "Historical Reenactment","Sports Events","Beer Festival","Other"
]);

function normalizeCategory(raw) {
  if (!raw) return "Other";
  const clean = raw.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|🏘️|👨‍👩‍👧‍👦/gu, "").trim();
  const MAP = {
    "Kirchweih": "Kirchweih",
    "Beer Festival": "Beer Festival",
    "Bierfest": "Beer Festival",
    "Music Event": "Music Event",
    "Folk Festival": "Folk Festival",
    "Art Performance": "Art Performance",
    "Seasonal Market": "Seasonal Market",
    "Food & Wine Tasting": "Food & Wine Tasting",
    "Parade & Procession": "Parade & Procession",
    "Historical Reenactment": "Historical Reenactment",
    "Sports Events": "Sports Events",
    "Other": "Other",
  };
  return MAP[clean] ?? clean;
}

console.log("=== Issues found ===");
const problems = [];
for (let i = 1; i < rows.length; i++) {
  const rawCat = rows[i][catIdx]?.trim();
  if (!rawCat) continue;
  const normalized = normalizeCategory(rawCat);
  if (!VALID.has(normalized)) {
    problems.push({ row: i + 1, name: rows[i][nameIdx], raw: rawCat, normalized });
  }
}
if (problems.length === 0) {
  console.log("None — all categories map cleanly after normalization.");
} else {
  problems.forEach(p => console.log(`  Row ${p.row}: "${p.raw}" → "${p.normalized}" — ${p.name}`));
}

console.log("\n=== 'Other' entries (14) ===");
for (let i = 1; i < rows.length; i++) {
  const rawCat = rows[i][catIdx]?.trim();
  if (rawCat === "Other") console.log(`  Row ${i+1}: ${rows[i][nameIdx]}`);
}

console.log("\n=== Final category distribution after normalization ===");
const counts = {};
for (let i = 1; i < rows.length; i++) {
  const c = normalizeCategory(rows[i][catIdx]?.trim());
  if (c) counts[c] = (counts[c] || 0) + 1;
}
Object.entries(counts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${v}x  ${k}`));
