/**
 * apply-flagged-hidden.js — Set hidden_from_directory = true for classes in docs/FLAGGED_CLASS_IDS.json.
 * Run AFTER reviewing docs/FLAGGED_OUT_OF_SCOPE.md. Ensures the DB has column hidden_from_directory
 * (run scripts/migrations/add-hidden-from-directory.sql in Supabase first).
 *
 * Run: node scripts/apply-flagged-hidden.js
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const FLAGGED_PATH = path.join(__dirname, "..", "docs", "FLAGGED_CLASS_IDS.json");

async function run() {
  if (!fs.existsSync(FLAGGED_PATH)) {
    console.error("Missing docs/FLAGGED_CLASS_IDS.json. Run: node scripts/flag-out-of-scope.js");
    process.exit(1);
  }
  const flagged = JSON.parse(fs.readFileSync(FLAGGED_PATH, "utf8"));
  const ids = flagged.map((f) => f.id).filter(Boolean);
  if (ids.length === 0) {
    console.log("No flagged IDs to apply.");
    return;
  }

  console.log(`Applying hidden_from_directory = true to ${ids.length} class(es)...`);
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
      console.error(error.message);
      continue;
    }
    updated += (data || []).length;
  }
  console.log(`Done. Hidden ${updated} class(es).`);
}

run().catch(console.error);
