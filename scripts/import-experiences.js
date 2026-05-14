#!/usr/bin/env node
/**
 * Imports Glide-exported User_Festival_Log CSV into Supabase experiences table.
 * Looks up festival_id and user_id by name/username from Supabase.
 *
 * Usage: node scripts/import-experiences.js
 *
 * Required env vars (from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const fs   = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const INPUT = "D:\\Dropbox\\Festy APP\\260409 ExportFromGlide\\User_Festival_Log_260514.csv";

// ── CSV parser ────────────────────────────────────────────────────────────────
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

// ── Datetime: "2025/6/19 下午9:11:52" → ISO string ───────────────────────────
function parseDateTime(raw) {
  if (!raw || !raw.trim()) return null;
  const parts = raw.trim().split(" ");
  if (parts.length < 2) return null;

  const datePart = parts[0]; // "2025/6/19"
  const periodAndTime = parts[1]; // "下午9:11:52" or "上午6:48:07"

  const [y, m, d] = datePart.split("/");

  let period = "", timeStr = "";
  if (periodAndTime.startsWith("下午")) {
    period = "pm";
    timeStr = periodAndTime.slice(2);
  } else if (periodAndTime.startsWith("上午")) {
    period = "am";
    timeStr = periodAndTime.slice(2);
  } else {
    timeStr = periodAndTime;
  }

  let [hh, mm, ss] = timeStr.split(":").map(Number);
  if (period === "pm" && hh < 12) hh += 12;
  if (period === "am" && hh === 12) hh = 0;

  const iso = `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}T${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}:${String(ss || 0).padStart(2,"0")}`;
  return iso;
}

// ── Beer size: "0.5 L" → "0.5L" ──────────────────────────────────────────────
function normalizeBeerSize(raw) {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim().replace(/\s+/g, "");
  if (["0.3L","0.5L","1L"].includes(s)) return s;
  return null;
}

// ── Senf: various → boolean ───────────────────────────────────────────────────
function normalizeSenf(raw) {
  if (!raw || !raw.trim()) return false;
  const s = raw.trim().toLowerCase();
  if (s === "?" || s === "unbekannt" || s === "nein" || s === "no") return false;
  return true; // "Ja", specific mustard names, etc.
}

// ── Numeric field ─────────────────────────────────────────────────────────────
function toNum(raw) {
  if (!raw || !raw.trim()) return null;
  const n = parseFloat(raw.trim().replace(",", "."));
  return isNaN(n) ? null : n;
}

// ── Rating: "5" or "⭐⭐⭐⭐⭐" → int ──────────────────────────────────────────
function toRating(raw) {
  if (!raw || !raw.trim()) return null;
  const n = parseInt(raw.trim(), 10);
  if (!isNaN(n) && n >= 1 && n <= 5) return n;
  return null;
}

// ── Fahrgeschäfte: "🎠 Karussell,🚗 Autoscooter" → string[] ─────────────────
function parseFahrt(raw) {
  if (!raw || !raw.trim()) return [];
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Fetch lookup maps
  console.log("📥 Fetching festivals from Supabase...");
  const { data: festivals, error: fErr } = await supabase
    .from("festivals").select("id, name");
  if (fErr) { console.error("Error fetching festivals:", fErr); process.exit(1); }

  console.log("📥 Fetching profiles from Supabase...");
  const { data: profiles, error: pErr } = await supabase
    .from("profiles").select("id, username");
  if (pErr) { console.error("Error fetching profiles:", pErr); process.exit(1); }

  const festivalMap = {};
  for (const f of festivals) festivalMap[f.name.trim().toLowerCase()] = f.id;

  const profileMap = {};
  for (const p of profiles) profileMap[p.username.trim().toLowerCase()] = p.id;

  // Parse CSV
  const raw  = fs.readFileSync(INPUT, "utf8");
  const rows = parseCSV(raw);
  if (rows.length < 2) { console.error("CSV appears empty"); process.exit(1); }

  const headers = rows[0];
  const idx = (name) => headers.findIndex(h => h.trim() === name);

  const I = {
    festival:   idx("Festival"),
    user:       idx("User"),
    join_date:  idx("Join Date"),
    bierbrauer: idx("Bierbrauer"),
    beer_name:  idx("Beer Name"),
    beer_size:  idx("Beer Size"),
    beer_price: idx("Beer Price"),
    bratwurst:  idx("Bratwurstbrötchen Price"),
    rating:     idx("Rating"),
    comment:    idx("Comment"),
    senf:       idx("Senf"),
    ice_cream:  idx("Ice Cream Price"),
    fahrt:      idx("Fahrgeschäfte"),
  };

  const toInsert = [];
  const skipped  = [];
  const unmatched = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.every(c => !c.trim())) continue;

    const festivalName = row[I.festival]?.trim();
    const userName     = row[I.user]?.trim();
    const joinDate     = parseDateTime(row[I.join_date]);

    if (!festivalName || !userName || !joinDate) {
      skipped.push({ row: r + 1, festival: festivalName, user: userName, reason: !festivalName ? "no festival" : !userName ? "no user" : "no date" });
      continue;
    }

    const festival_id = festivalMap[festivalName.toLowerCase()];
    if (!festival_id) {
      unmatched.push({ row: r + 1, type: "festival", value: festivalName });
      continue;
    }

    // Try exact match first, then first-word match
    let user_id = profileMap[userName.toLowerCase()] ?? null;
    if (!user_id) {
      const firstName = userName.split(" ")[0].toLowerCase();
      user_id = profileMap[firstName] ?? null;
    }

    toInsert.push({
      festival_id,
      user_id,                                        // null if not yet signed up
      pending_username: user_id ? null : userName,    // saved for later linking
      join_date:       joinDate,
      bierbrauer:      row[I.bierbrauer]?.trim() || null,
      beer_name:       row[I.beer_name]?.trim()  || null,
      beer_size:       normalizeBeerSize(row[I.beer_size]),
      beer_price:      toNum(row[I.beer_price]),
      bratwurst_price: toNum(row[I.bratwurst]),
      rating:          toRating(row[I.rating]),
      comment:         row[I.comment]?.trim()    || null,
      senf:            normalizeSenf(row[I.senf]),
      ice_cream_price: toNum(row[I.ice_cream]),
      fahrgeschaefte:  parseFahrt(row[I.fahrt]),
    });
  }

  console.log(`\n📊 Parsed: ${toInsert.length} ready, ${skipped.length} skipped, ${unmatched.length} unmatched`);

  if (skipped.length) {
    console.log("\n⚠️  Skipped rows:");
    skipped.forEach(s => console.log(`   Row ${s.row}: ${s.reason} — festival="${s.festival}" user="${s.user}"`));
  }

  if (unmatched.length) {
    console.log("\n❌ Unmatched (not imported):");
    unmatched.forEach(u => console.log(`   Row ${u.row}: ${u.type} not found — "${u.value}"`));
    console.log("\n   Fix: ensure festival names and usernames in Supabase match the CSV values above.");
  }

  if (!toInsert.length) {
    console.log("\nNothing to insert. Done.");
    return;
  }

  // Insert in batches of 50
  console.log(`\n⬆️  Inserting ${toInsert.length} experiences...`);
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await supabase.from("experiences").insert(batch);
    if (error) {
      console.error(`   Error on batch ${i / BATCH + 1}:`, error);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`   ✓ ${inserted}/${toInsert.length}`);
  }

  console.log(`\n✅ Done! Imported ${inserted} experiences.`);
}

main().catch(err => { console.error(err); process.exit(1); });
