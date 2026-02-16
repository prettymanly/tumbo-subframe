/**
 * hide-bare-content.js — Hide all classes that don't meet editorial standard
 * ═══════════════════════════════════════════════════════════════════════════
 * Sets hidden_from_directory = true for every non-placeholder class that
 * fails meetsEditorialStandard (description + summary + vibe_line min lengths).
 * Run AFTER full-enrich.js so the site only shows up-to-standard listings.
 *
 * Same bar as scripts/enrichment-status.js (see docs/EDITORIAL_STANDARDS.md).
 * Writes docs/HIDDEN_BARE_CONTENT_IDS.json for later review.
 *
 * Requires: hidden_from_directory column (run add-hidden-from-directory.sql once).
 *
 * Run: node scripts/hide-bare-content.js --confirm
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const MIN_DESCRIPTION_LENGTH = 150;
const MIN_SUMMARY_LENGTH = 80;
const MIN_VIBE_LINE_LENGTH = 20;

function meetsEditorialStandard(cls) {
  const desc = (cls.description || "").trim();
  const summary = (cls.summary || "").trim();
  const vibe = (cls.vibe_line || "").trim();
  return (
    desc.length >= MIN_DESCRIPTION_LENGTH &&
    summary.length >= MIN_SUMMARY_LENGTH &&
    vibe.length >= MIN_VIBE_LINE_LENGTH
  );
}

async function run() {
  if (!process.argv.includes("--confirm")) {
    console.log("Hide all classes that don't meet editorial standard (bare content).");
    console.log("Same bar: description ≥150, summary ≥80, vibe_line ≥20 (see docs/EDITORIAL_STANDARDS.md).");
    console.log("\nTo apply, run: node scripts/hide-bare-content.js --confirm");
    return;
  }

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Hide bare content — only show up-to-standard listings");
  console.log("═══════════════════════════════════════════════════════════════\n");

  let allClasses = [];
  for (let offset = 0; ; offset += 1000) {
    const { data } = await sb
      .from("classes")
      .select("id, name, category, description, summary, vibe_line")
      .eq("is_placeholder", false)
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allClasses = allClasses.concat(data);
  }

  const toHide = allClasses.filter((c) => !meetsEditorialStandard(c));
  const ids = toHide.map((c) => c.id);

  if (ids.length === 0) {
    console.log("No classes to hide; all meet editorial standard.");
    return;
  }

  console.log(`Classes that don't meet standard: ${toHide.length}`);
  console.log(`Setting hidden_from_directory = true...\n`);

  let updated = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const { data, error } = await sb
      .from("classes")
      .update({ hidden_from_directory: true })
      .in("id", batch)
      .select("id");
    if (error) {
      if ((error.message || "").toLowerCase().includes("hidden_from_directory")) {
        console.error("Column hidden_from_directory missing. Run scripts/migrations/add-hidden-from-directory.sql in Supabase SQL editor.");
        process.exit(1);
      }
      throw error;
    }
    updated += (data || []).length;
  }

  const docsDir = path.join(__dirname, "..", "docs");
  const outPath = path.join(docsDir, "HIDDEN_BARE_CONTENT_IDS.json");
  const list = toHide.map((c) => ({ id: c.id, name: c.name, category: c.category || "" }));
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(list, null, 2), "utf8");

  console.log(`Done. Hidden ${updated} class(es).`);
  console.log(`List written to docs/HIDDEN_BARE_CONTENT_IDS.json for review.`);
  console.log("\nThe directory will now only show classes that meet the editorial standard.");
}

run().catch(console.error);
