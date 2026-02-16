/**
 * Enrichment status — GPT rewrites by better standards (excl. flagged)
 * ═══════════════════════════════════════════════════════════════════
 * Reports how many non-placeholder classes (excluding FLAGGED_CLASS_IDS)
 * already meet the Chipchase-style standards vs still need full-enrich.
 * Uses the same needsEnrichment() logic as full-enrich.js.
 *
 * "Good enough" = passes needsEnrichment (no bad patterns) AND meetsEditorialStandard
 * (positive bar: description + summary + vibe_line subsections with min lengths).
 * See docs/EDITORIAL_STANDARDS.md for the distinction (out_of_scope vs bare_content).
 *
 * Run: node scripts/enrichment-status.js
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Keep in sync with full-enrich.js needsEnrichment()
const TEMPLATE_PHRASES = [
  "Classes at this provider", "Classes at the provider", "classes at the provider",
  "At the provider,", "programme building strong reading", "programme building conceptual",
  "instruction building water confidence", "coaching building physical skills",
  "programme building conversational fluency", "in a supportive learning environment",
  "building genuine skills and confidence",
];
const GENERIC_CHILD_PROFILE = [
  "children who enjoy", "respond well to", "supportive learning environment",
  "supportive, structured", "structured instruction", "enjoy creative activities",
  "enjoy play",
];
const GENERIC_OUTCOME = [
  "measurable progress", "greater confidence", "after a term",
  "show measurable progress",
];

function needsEnrichment(cls) {
  if (!cls.description || cls.description.length < 30) return true;
  if (TEMPLATE_PHRASES.some((p) => cls.description.includes(p))) return true;
  const templateVibes = ["made genuinely engaging", "built through genuine fun", "with real depth and warmth", "through patient, structured guidance", "in a supportive, playful environment"];
  if (cls.vibe_line && templateVibes.some((v) => cls.vibe_line.includes(v))) return true;
  if (cls.vibe_line && /where every child|where every note|where little ones|where curiosity|where young minds|where creativity blooms|where little feet|where little dancers|where musical magic|where math becomes|a joyful space|the joyful|a vibrant space|a focused space|interactive learning|the joy of music/i.test(cls.vibe_line)) return true;
  const profile = (cls.typical_child_profile || "").toLowerCase();
  const outcome = (cls.outcome_expectations || "").toLowerCase();
  if (GENERIC_CHILD_PROFILE.some((p) => profile.includes(p))) return true;
  if (GENERIC_OUTCOME.some((p) => outcome.includes(p))) return true;
  return false;
}

// Positive bar: "good enough" = has subsection-style content (agreed standard)
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
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  GPT rewrite status — better standards (excl. flagged)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  let allClasses = [];
  for (let offset = 0; ; offset += 1000) {
    const { data } = await sb
      .from("classes")
      .select("id, name, provider_id, category, description, summary, vibe_line, typical_child_profile, not_ideal_for, outcome_expectations, age_min, age_max, price, location, schedule, raw_reviews, discovered_from, google_rating, review_count")
      .eq("is_placeholder", false)
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allClasses = allClasses.concat(data);
  }

  const flaggedPath = path.join(__dirname, "..", "docs", "FLAGGED_CLASS_IDS.json");
  let flaggedIds = new Set();
  if (fs.existsSync(flaggedPath)) {
    try {
      const flagged = JSON.parse(fs.readFileSync(flaggedPath, "utf8"));
      flaggedIds = new Set(flagged.map((f) => f.id).filter(Boolean));
    } catch (_) {}
  }

  const excluded = allClasses.filter((c) => flaggedIds.has(c.id));
  const inScope = allClasses.filter((c) => !flaggedIds.has(c.id));

  const needRewrite = inScope.filter(needsEnrichment);
  const notNeedRewrite = inScope.filter((c) => !needsEnrichment(c));
  const meetStandards = notNeedRewrite.filter(meetsEditorialStandard);
  const bareContent = notNeedRewrite.filter((c) => !meetsEditorialStandard(c));

  console.log("  Total non-placeholder classes:", allClasses.length);
  console.log("  Flagged (hidden):", excluded.length);
  console.log("  In scope (excl. flagged):", inScope.length);
  console.log("");
  console.log("  Good enough (subsection content):", meetStandards.length);
  console.log("  Bare content (would hide):", bareContent.length);
  console.log("  Still need GPT rewrite:", needRewrite.length);
  console.log("");
  if (meetStandards.length > 0) {
    const pct = Math.round((100 * meetStandards.length) / inScope.length);
    console.log(`  → ${pct}% of in-scope classes meet editorial standard (description + summary + vibe_line).`);
  }
  if (needRewrite.length > 0) {
    console.log("\n  To run enrichment on the remaining:");
    console.log("    node scripts/full-enrich.js          # only those that need it (default)");
    console.log("    node scripts/full-enrich.js --limit=50");
    console.log("    node scripts/full-enrich.js --all    # re-enrich every in-scope class");
  }

  const base = process.env.BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const linksArg = process.argv.find((a) => a.startsWith("--links="));
  const linksGoodArg = process.argv.find((a) => a.startsWith("--links-good="));
  const linksBareArg = process.argv.find((a) => a.startsWith("--links-bare="));

  if (linksGoodArg && meetStandards.length > 0) {
    const n = Math.min(parseInt(linksGoodArg.split("=")[1], 10) || 1, meetStandards.length);
    console.log(`\n  ${n} link(s) — MEET standard (subsection content):\n`);
    for (const c of meetStandards.slice(0, n)) {
      console.log(`  ${c.name}`);
      console.log(`  ${base}/classes/${c.id}\n`);
    }
  }
  if (linksBareArg && bareContent.length > 0) {
    const n = Math.min(parseInt(linksBareArg.split("=")[1], 10) || 1, bareContent.length);
    console.log(`\n  ${n} link(s) — DON'T MEET standard (bare content):\n`);
    for (const c of bareContent.slice(0, n)) {
      console.log(`  ${c.name}`);
      console.log(`  ${base}/classes/${c.id}\n`);
    }
  }
  if (linksArg && !linksGoodArg && !linksBareArg && meetStandards.length > 0) {
    const n = Math.min(parseInt(linksArg.split("=")[1], 10) || 10, meetStandards.length);
    console.log(`\n  ${n} sample link(s) — done up to standard:\n`);
    for (const c of meetStandards.slice(0, n)) {
      console.log(`  ${c.name}`);
      console.log(`  ${base}/classes/${c.id}\n`);
    }
  }
  console.log("═══════════════════════════════════════════════════════════════\n");
}

run().catch(console.error);
