/**
 * audit-visible-listings.js — Comprehensive audit of all visible listings on Tumbo.
 *
 * Queries ALL classes where is_placeholder=false AND hidden_from_directory=false,
 * then reports:
 *   1. Total visible listings
 *   2. Breakdown by category
 *   3. Listings with missing/short vibe_line
 *   4. Listings with generic template vibe_line phrases
 *   5. Listings that appear to be adult/non-child-enrichment
 *
 * Run: node scripts/audit-visible-listings.js
 */

const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ── Generic / template vibe_line phrases ──
const GENERIC_VIBE_PHRASES = [
  /supportive learning/i,
  /joyful space/i,
  /where every child/i,
  /nurturing environment/i,
  /fun and engaging/i,
  /safe and nurturing/i,
  /creative expression/i,
  /holistic development/i,
  /unlock.*potential/i,
  /passion for learning/i,
  /love of learning/i,
  /inspiring.*creativity/i,
  /fostering.*growth/i,
  /enriching.*experience/i,
];

// ── Adult / non-child-enrichment name patterns ──
const ADULT_PATTERNS = [
  { pattern: /\bphotography\b/i, label: "photography" },
  { pattern: /\bphoto\s*studio\b/i, label: "photo studio" },
  { pattern: /\bJC\b/, label: "JC (junior college)" },
  { pattern: /\bjunior\s+college\b/i, label: "junior college" },
  { pattern: /\bpolytechnic\b/i, label: "polytechnic" },
  { pattern: /\buniversity\b/i, label: "university" },
  { pattern: /\bcorporate\b/i, label: "corporate" },
  { pattern: /\bMBA\b/i, label: "MBA" },
  { pattern: /\bprofessional\b/i, label: "professional" },
  { pattern: /\bdriving\b/i, label: "driving" },
  { pattern: /\bwedding\b/i, label: "wedding" },
  { pattern: /\bdental\b/i, label: "dental" },
  { pattern: /\bmedical\b/i, label: "medical" },
  { pattern: /\bclinic\b/i, label: "clinic" },
  { pattern: /\bmaid\b/i, label: "maid" },
  { pattern: /\bpet\b/i, label: "pet" },
  { pattern: /\b(?<!kids?\s)spa\b/i, label: "spa (adult)" },
  { pattern: /\bsalon\b/i, label: "salon" },
  { pattern: /\breal\s+estate\b/i, label: "real estate" },
  { pattern: /\binsurance\b/i, label: "insurance" },
  { pattern: /\bA[\s-]?level\b/i, label: "A-Level" },
  { pattern: /\bITE\b/, label: "ITE" },
  { pattern: /\bNUS\b/, label: "NUS" },
  { pattern: /\bNTU\b/, label: "NTU" },
  { pattern: /\bSMU\b/, label: "SMU" },
];

const VIBE_LINE_MIN_GOOD = 25;

async function fetchAllVisible() {
  const allRows = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await sb
      .from("classes")
      .select("id, name, category, vibe_line, description, summary, provider_id")
      .eq("is_placeholder", false)
      .eq("hidden_from_directory", false)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return allRows;
}

async function fetchProviderNames(providerIds) {
  const map = {};
  const ids = [...new Set(providerIds.filter(Boolean))];
  for (let i = 0; i < ids.length; i += 200) {
    const batch = ids.slice(i, i + 200);
    const { data } = await sb.from("providers").select("id, name").in("id", batch);
    for (const p of data || []) map[p.id] = p.name;
  }
  return map;
}

function matchesAdultPattern(name, providerName) {
  const text = [name, providerName].filter(Boolean).join(" ");
  for (const { pattern, label } of ADULT_PATTERNS) {
    if (pattern.test(text)) return label;
  }
  return null;
}

function matchesGenericVibe(vibeLine) {
  if (!vibeLine) return null;
  for (const re of GENERIC_VIBE_PHRASES) {
    if (re.test(vibeLine)) return re.source;
  }
  return null;
}

async function run() {
  console.log("================================================================");
  console.log("  TUMBO VISIBLE LISTINGS AUDIT");
  console.log("================================================================\n");

  const classes = await fetchAllVisible();
  const providerMap = await fetchProviderNames(classes.map((c) => c.provider_id));

  // ── 1. Total visible ──
  console.log(`TOTAL VISIBLE LISTINGS: ${classes.length}\n`);

  // ── 2. Category breakdown ──
  const byCategory = {};
  for (const c of classes) {
    const cat = c.category || "(no category)";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(c);
  }

  console.log("────────────────────────────────────────────────────────────────");
  console.log("  CATEGORY BREAKDOWN");
  console.log("────────────────────────────────────────────────────────────────");
  const sortedCats = Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length);
  for (const [cat, items] of sortedCats) {
    const samples = items.slice(0, 3).map((c) => c.name).join(", ");
    console.log(`  ${cat}: ${items.length} listings`);
    console.log(`    samples: ${samples}`);
  }
  console.log();

  // ── 3. Missing / short vibe_line ──
  const bareVibe = classes.filter((c) => {
    const v = (c.vibe_line || "").trim();
    return v.length === 0;
  });
  const shortVibe = classes.filter((c) => {
    const v = (c.vibe_line || "").trim();
    return v.length > 0 && v.length < VIBE_LINE_MIN_GOOD;
  });

  console.log("────────────────────────────────────────────────────────────────");
  console.log("  VIBE LINE QUALITY");
  console.log("────────────────────────────────────────────────────────────────");
  console.log(`  Missing vibe_line entirely: ${bareVibe.length}`);
  if (bareVibe.length > 0) {
    console.log(`    samples: ${bareVibe.slice(0, 5).map((c) => c.name).join(", ")}`);
  }
  console.log(`  Short vibe_line (<${VIBE_LINE_MIN_GOOD} chars): ${shortVibe.length}`);
  if (shortVibe.length > 0) {
    for (const c of shortVibe.slice(0, 5)) {
      console.log(`    "${c.vibe_line}" — ${c.name}`);
    }
  }
  console.log();

  // ── 4. Generic template vibe_lines ──
  const genericVibes = [];
  for (const c of classes) {
    const match = matchesGenericVibe(c.vibe_line);
    if (match) {
      genericVibes.push({ ...c, matchedPattern: match });
    }
  }

  console.log("────────────────────────────────────────────────────────────────");
  console.log("  GENERIC / TEMPLATE VIBE LINES");
  console.log("────────────────────────────────────────────────────────────────");
  console.log(`  Total with generic vibe_line: ${genericVibes.length}`);

  // Group by matched pattern
  const byGenericPattern = {};
  for (const g of genericVibes) {
    if (!byGenericPattern[g.matchedPattern]) byGenericPattern[g.matchedPattern] = [];
    byGenericPattern[g.matchedPattern].push(g);
  }
  for (const [pat, items] of Object.entries(byGenericPattern).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n  Pattern /${pat}/: ${items.length} listings`);
    for (const c of items.slice(0, 3)) {
      console.log(`    "${(c.vibe_line || "").slice(0, 80)}" — ${c.name}`);
    }
  }
  console.log();

  // ── 5. Adult / non-child-enrichment patterns ──
  const adultFlagged = [];
  for (const c of classes) {
    const provName = c.provider_id ? (providerMap[c.provider_id] || "") : "";
    const label = matchesAdultPattern(c.name, provName);
    if (label) {
      adultFlagged.push({ ...c, flagLabel: label, providerName: provName });
    }
  }

  console.log("────────────────────────────────────────────────────────────────");
  console.log("  ADULT / NON-CHILD-ENRICHMENT FLAGS");
  console.log("────────────────────────────────────────────────────────────────");
  console.log(`  Total flagged: ${adultFlagged.length}`);

  // Group by flag label
  const byFlag = {};
  for (const f of adultFlagged) {
    if (!byFlag[f.flagLabel]) byFlag[f.flagLabel] = [];
    byFlag[f.flagLabel].push(f);
  }
  for (const [label, items] of Object.entries(byFlag).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n  "${label}": ${items.length} listings`);
    for (const c of items.slice(0, 5)) {
      const prov = c.providerName ? ` (provider: ${c.providerName})` : "";
      console.log(`    - ${c.name}${prov} [cat: ${c.category || "none"}]`);
    }
    if (items.length > 5) console.log(`    ... and ${items.length - 5} more`);
  }
  console.log();

  // ── Summary ──
  console.log("================================================================");
  console.log("  SUMMARY");
  console.log("================================================================");
  console.log(`  Total visible listings:          ${classes.length}`);
  console.log(`  Categories:                      ${sortedCats.length}`);
  console.log(`  Missing vibe_line:               ${bareVibe.length}`);
  console.log(`  Short vibe_line (<25 chars):     ${shortVibe.length}`);
  console.log(`  Generic template vibe_line:      ${genericVibes.length}`);
  console.log(`  Adult/non-child-enrichment flag: ${adultFlagged.length}`);
  console.log();
}

run().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
