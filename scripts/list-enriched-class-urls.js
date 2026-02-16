/**
 * list-enriched-class-urls.js — Print URLs for classes that have Chipchase-style enrichment
 *
 * Run: node scripts/list-enriched-class-urls.js
 * Optional: BASE_URL=https://tumbo.vercel.app node scripts/list-enriched-class-urls.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local") });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const BASE = process.env.BASE_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://tumbo.vercel.app";

async function run() {
  const { data, error } = await sb
    .from("classes")
    .select("id, name, vibe_line, summary")
    .eq("is_placeholder", false)
    .not("vibe_line", "is", null)
    .limit(5);

  if (error) {
    console.error("Supabase error:", error.message);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.log("No enriched classes found. Run: node scripts/full-enrich.js --limit=5");
    process.exit(0);
  }

  console.log("Enriched (Chipchase-style) class posts — open in your app:\n");
  for (const c of data.slice(0, 5)) {
    const url = `${BASE}/classes/${c.id}`;
    console.log(`${c.name}`);
    console.log(`  ${url}`);
    if (c.vibe_line) console.log(`  vibe: "${c.vibe_line.slice(0, 60)}${c.vibe_line.length > 60 ? "…" : ""}"`);
    console.log("");
  }
  console.log("(Prepend http://localhost:3000 if running locally.)");
}

run().catch(console.error);
