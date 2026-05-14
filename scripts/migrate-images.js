#!/usr/bin/env node
/**
 * One-time migration: Download images from Glide CDN → upload to Cloudinary → update Supabase URLs
 *
 * Usage:
 *   node scripts/migrate-images.js
 *
 * Required env vars (set in .env.local or export before running):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

const { createClient } = require("@supabase/supabase-js");
const cloudinary = require("cloudinary").v2;

// Load env
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadFromUrl(url, publicId) {
  return cloudinary.uploader.upload(url, {
    folder: "festy/festivals",
    public_id: publicId,
    overwrite: false,
    transformation: [{ width: 1200, height: 900, crop: "limit", quality: "auto" }],
  });
}

async function migrateFestivalImages() {
  console.log("📥 Fetching festivals with images from Supabase...");
  const { data: festivals, error } = await supabase
    .from("festivals")
    .select("id, name, image_url")
    .not("image_url", "is", null);

  if (error) {
    console.error("Error fetching festivals:", error);
    process.exit(1);
  }

  // Filter: only process Glide CDN URLs (not already Cloudinary)
  const toMigrate = festivals.filter(
    (f) => f.image_url && !f.image_url.includes("cloudinary.com")
  );

  console.log(`Found ${toMigrate.length} festivals to migrate.`);

  for (const festival of toMigrate) {
    try {
      console.log(`  ↑ Uploading: ${festival.name} (${festival.id})`);
      const result = await uploadFromUrl(
        festival.image_url,
        `festival_${festival.id}`
      );
      const { error: updateError } = await supabase
        .from("festivals")
        .update({ image_url: result.secure_url })
        .eq("id", festival.id);

      if (updateError) {
        console.error(`    ✗ DB update failed for ${festival.name}:`, updateError);
      } else {
        console.log(`    ✓ Done: ${result.secure_url}`);
      }
    } catch (err) {
      console.error(`    ✗ Upload failed for ${festival.name}:`, err.message);
    }
  }
}

async function migrateExperienceImages() {
  console.log("\n📥 Fetching experience images from Supabase...");
  const { data: experiences, error } = await supabase
    .from("experiences")
    .select("id, image_url")
    .not("image_url", "is", null);

  if (error) {
    console.error("Error fetching experiences:", error);
    return;
  }

  const toMigrate = experiences.filter(
    (e) => e.image_url && !e.image_url.includes("cloudinary.com")
  );

  console.log(`Found ${toMigrate.length} experience images to migrate.`);

  for (const exp of toMigrate) {
    try {
      console.log(`  ↑ Uploading experience: ${exp.id}`);
      const result = await uploadFromUrl(exp.image_url, `experience_${exp.id}`);
      const { error: updateError } = await supabase
        .from("experiences")
        .update({ image_url: result.secure_url })
        .eq("id", exp.id);

      if (updateError) {
        console.error(`    ✗ DB update failed for ${exp.id}:`, updateError);
      } else {
        console.log(`    ✓ Done: ${result.secure_url}`);
      }
    } catch (err) {
      console.error(`    ✗ Upload failed for ${exp.id}:`, err.message);
    }
  }
}

(async () => {
  await migrateFestivalImages();
  await migrateExperienceImages();
  console.log("\n✅ Migration complete!");
})();
