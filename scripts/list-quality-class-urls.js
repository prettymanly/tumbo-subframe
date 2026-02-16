/**
 * List 5 class URLs that pass the "quality" bar (no generic filler in who_thrives / what_to_expect / vibe).
 * Run: node scripts/list-quality-class-urls.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local") });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const BASE = process.env.BASE_URL || "https://tumbo.vercel.app";

const GENERIC_VIBE = /where every child|where every note|where little ones|where curiosity|where young minds|where creativity blooms|where little feet|where little dancers|where musical magic|where math becomes|a joyful space|the joyful|a vibrant space|a focused space|interactive learning|the joy of music|fun and engaging|supportive learning environment/i;
const GENERIC_PROFILE = ["children who enjoy", "respond well to", "supportive learning environment", "supportive, structured", "structured instruction", "enjoy creative activities", "enjoy play"];
const GENERIC_OUTCOME = ["measurable progress", "greater confidence", "after a term", "show measurable progress"];

function passesQuality(cls) {
  const profile = (cls.typical_child_profile || "").toLowerCase();
  const outcome = (cls.outcome_expectations || "").toLowerCase();
  const vibe = (cls.vibe_line || "").toLowerCase();
  if (GENERIC_VIBE.test(cls.vibe_line || "")) return false;
  if (GENERIC_PROFILE.some((p) => profile.includes(p))) return false;
  if (GENERIC_OUTCOME.some((p) => outcome.includes(p))) return false;
  return true;
}

async function run() {
  const { data, error } = await sb
    .from("classes")
    .select("id, name, vibe_line, summary, typical_child_profile, outcome_expectations")
    .eq("is_placeholder", false)
    .not("summary", "is", null)
    .not("vibe_line", "is", null)
    .limit(500);

  if (error) {
    console.error("Supabase error:", error.message);
    process.exit(1);
  }
  const passing = (data || []).filter(passesQuality);
  const five = passing.slice(0, 5);
  if (five.length === 0) {
    console.log("No classes passed the quality filter (no generic filler). Try re-running full-enrich.js with the updated prompt.");
    process.exit(0);
  }
  console.log("5 posts that pass the quality bar (no generic who_thrives/what_to_expect/vibe):\n");
  for (const c of five) {
    console.log(`${c.name}`);
    console.log(`  ${BASE}/classes/${c.id}`);
    if (c.vibe_line) console.log(`  vibe: ${c.vibe_line.slice(0, 70)}${c.vibe_line.length > 70 ? "…" : ""}`);
    console.log("");
  }
}

run().catch(console.error);
