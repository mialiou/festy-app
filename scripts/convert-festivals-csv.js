#!/usr/bin/env node
/**
 * Converts Glide-exported festivals CSV to Supabase-compatible format.
 * Usage: node scripts/convert-festivals-csv.js
 * Output: scripts/festivals-import.csv (ready to drag into Supabase Table Editor)
 */

const fs = require("fs");
const path = require("path");

const INPUT  = "D:\\Dropbox\\Festy APP\\260409 ExportFromGlide\\Festivals260514.csv";
const OUTPUT = path.join(__dirname, "festivals-import.csv");

// ── Category normalisation ────────────────────────────────────────────────────
// The family emoji 👨‍👩‍👧‍👦 is a ZWJ sequence; stripping emoji code points alone
// leaves invisible ZWJ (U+200D) and VS-16 (U+FE0F) chars behind.
function stripInvisible(s) {
  return s
    .replace(/\p{Emoji}/gu, "")   // remove all emoji
    .replace(/‍/g, "")       // ZWJ
    .replace(/️/g, "")       // variation selector-16
    .replace(/​/g, "")       // zero-width space
    .replace(/﻿/g, "")       // BOM / zero-width no-break space
    .trim();
}

// Explicit name-to-category overrides for the 14 "Other" rows
const NAME_CATEGORY_OVERRIDES = {
  "Metropolmarathon":             "Sports Events",
  "Sparkassen Metropolmarathon":  "Sports Events",
  "Norisringrennen":              "Sports Events",
  "Nürnberger Firmenlauf":        "Sports Events",
  "Triathlon Nürnberg":           "Sports Events",
  "Seifenkistenrennen":           "Sports Events",
  "Nürnberg Digital Festival":    "Music Event",
  "Grüne Nacht":                  "Music Event",
  "Tag des offenen Denkmals":     "Historical Reenactment",
  "Dullnraamer Sidzung":          "Folk Festival",
  "Fürther Glanzlichter":         "Art Performance",
  // Remaining 3 stay as "Other": Stadt(ver)führungen, Tage der offenen Tür, Stadtverführungen
};

function normalizeCategory(rawCat, name) {
  if (!rawCat) return NAME_CATEGORY_OVERRIDES[name] ?? "Other";

  const clean = stripInvisible(rawCat);

  const CAT_MAP = {
    "Kirchweih":              "Kirchweih",
    "Beer Festival":          "Beer Festival",
    "Bierfest":               "Beer Festival",        // German alias
    "Music Event":            "Music Event",
    "Folk Festival":          "Folk Festival",
    "Art Performance":        "Art Performance",
    "Seasonal Market":        "Seasonal Market",
    "Food & Wine Tasting":    "Food & Wine Tasting",
    "Parade & Procession":    "Parade & Procession",
    "Historical Reenactment": "Historical Reenactment",
    "Sports Events":          "Sports Events",
    "Other":                  "Other",
  };

  const mapped = CAT_MAP[clean];
  if (mapped && mapped !== "Other") return mapped;

  // For "Other" (or unknown), name-based override takes precedence
  return NAME_CATEGORY_OVERRIDES[name] ?? "Other";
}

// ── Status normalisation ──────────────────────────────────────────────────────
function normalizeStatus(raw) {
  if (!raw) return "upcoming";
  const s = raw.trim().toLowerCase();
  if (s === "beendet" || s === "ended")                       return "ended";
  if (s === "aktiv" || s === "active" || s === "laufend")     return "active";
  if (s === "bevorstehend" || s === "upcoming" || s === "kommend") return "upcoming";
  return "upcoming";
}

// ── Date normalisation ────────────────────────────────────────────────────────
// Handles "2025/6/18 下午6:39:00", "2025/6/18", plain ISO, etc.
function normalizeDate(raw) {
  if (!raw || raw.trim() === "") return "";
  const datePart = raw.trim().split(" ")[0];
  const parts = datePart.split("/");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return datePart;
}

// ── CSV parser (handles quoted fields with embedded newlines/commas) ───────────
function parseCSV(content) {
  const rows = [];
  let row = [], field = "", inQuote = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i], next = content[i + 1];
    if (inQuote) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"')            inQuote = false;
      else                            field += ch;
    } else {
      if      (ch === '"')  inQuote = true;
      else if (ch === ',')  { row.push(field); field = ""; }
      else if (ch === '\n') { row.push(field); field = ""; rows.push(row); row = []; }
      else if (ch !== '\r') field += ch;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// ── CSV escape ────────────────────────────────────────────────────────────────
function esc(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  return (s.includes(",") || s.includes('"') || s.includes("\n"))
    ? '"' + s.replace(/"/g, '""') + '"'
    : s;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const raw  = fs.readFileSync(INPUT, "utf8");
const rows = parseCSV(raw);
if (rows.length < 2) { console.error("CSV appears empty"); process.exit(1); }

const headers = rows[0];
const idx = (name) => headers.findIndex((h) => h.trim() === name);

const I = {
  name:        idx("Name"),
  start_date:  idx("Start Date"),
  end_date:    idx("End Date"),
  category:    idx("Category"),
  location:    idx("Location"),
  description: idx("Description"),
  link:        idx("Link"),
  latitude:    idx("Latitude"),
  longitude:   idx("Longitude"),
  image_url:   idx("Image"),
  status:      idx("Status"),
};

const outHeader = ["name","start_date","end_date","category","location","description","link","latitude","longitude","image_url","status"];
const outRows = [outHeader.join(",")];
const catCounts = {};
let skipped = 0;

for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  if (row.every((c) => !c.trim())) continue;

  const name = row[I.name]?.trim();
  if (!name) { skipped++; continue; }

  const category = normalizeCategory(row[I.category], name);
  catCounts[category] = (catCounts[category] || 0) + 1;

  const out = [
    name,
    normalizeDate(row[I.start_date]),
    normalizeDate(row[I.end_date]),
    category,
    row[I.location]?.trim()    ?? "",
    row[I.description]?.trim() ?? "",
    row[I.link]?.trim()        ?? "",
    row[I.latitude]?.trim()    ?? "",
    row[I.longitude]?.trim()   ?? "",
    row[I.image_url]?.trim()   ?? "",
    normalizeStatus(row[I.status]),
  ].map(esc);

  outRows.push(out.join(","));
}

fs.writeFileSync(OUTPUT, outRows.join("\n"), "utf8");
console.log(`✅ Converted ${outRows.length - 1} festivals → ${OUTPUT}`);
if (skipped) console.log(`   (skipped ${skipped} rows with no name)`);

console.log("\nFinal category distribution:");
Object.entries(catCounts).sort((a,b) => b[1]-a[1])
  .forEach(([k,v]) => console.log(`  ${String(v).padStart(3)}x  ${k}`));
