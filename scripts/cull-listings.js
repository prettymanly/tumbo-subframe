/**
 * cull-listings.js  --  Aggressive quality cull of the Tumbo directory
 * ======================================================================
 * Philosophy: "We only have one chance to make an impression. If we have
 * a low-quality post, we'd rather hide it."
 *
 * Three layers of culling (union -- a listing hidden by ANY layer stays hidden):
 *
 *   Layer 1  Category kill list
 *            Entire categories that are clearly not children's classes.
 *
 *   Layer 2  Content quality
 *            Missing name, bad vibe_line, missing description, bad photo,
 *            no tags, placeholder flag.
 *
 *   Layer 3  Enrichment integrity
 *            Summary == name, multiple critical fields missing, empty
 *            category + no tags.
 *
 * Workflow:
 *   1. DRY RUN -- print what would be hidden, per layer, with samples
 *   2. EXECUTE -- set hidden_from_directory = true
 *   3. REPORT  -- final visible / hidden counts
 *
 * Run:  node scripts/cull-listings.js
 */

const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ═══════════════════════════════════════════════════════════════════════
//  LAYER 1: Category kill list
// ═══════════════════════════════════════════════════════════════════════
const CATEGORY_KILL_LIST = new Set([
  // Photography / adult studios
  "Photography studio", "Photographer", "Photo studio",
  // Adult education
  "Junior college", "University", "Adult education school", "Vocational school",
  // Non-class services
  "Bicycle rental service", "Greengrocer", "Government office",
  "Tourist attraction", "Animal hospital", "Animal shelter", "Pet store",
  // Religious / non-profit
  "Buddhist temple", "Hindu temple", "Church", "Mosque", "Non-profit organization",
  // Generic Google Places types
  "Point of interest", "Establishment", "Locality", "Sublocality",
  // Other non-qualifying
  "Beauty salon", "Hair salon", "Spa", "Laundry service", "Car wash",
  "Moving company", "Real estate agency", "Insurance agency", "Accounting firm",
  "Law firm", "Tax preparation", "Financial planner", "Consultant",
  "Contractor", "Electrician", "Plumber", "Painter", "Locksmith",
  // Healthcare (non-class)
  "Hospital", "Clinic", "Doctor", "Dentist", "Physiotherapist",
  "Pharmacy", "Veterinary care",
  // Food / retail
  "Restaurant", "Cafe", "Bar", "Bakery", "Supermarket", "Grocery store",
  "Convenience store", "Liquor store", "Shopping mall", "Department store",
  "Clothing store", "Shoe store", "Jewelry store", "Electronics store",
  "Hardware store", "Book store", "Toy store", "Furniture store",
  "Home goods store", "Florist",
  // Transport
  "Bus station", "Train station", "Taxi stand", "Car rental", "Parking",
]);

// Case-insensitive lookup
const CATEGORY_KILL_LIST_LOWER = new Set(
  [...CATEGORY_KILL_LIST].map((c) => c.toLowerCase())
);

function failsLayer1(cls) {
  if (!cls.category) return false;
  return CATEGORY_KILL_LIST_LOWER.has(cls.category.toLowerCase().trim());
}

// ═══════════════════════════════════════════════════════════════════════
//  LAYER 2: Content quality
// ═══════════════════════════════════════════════════════════════════════

const GENERIC_VIBE_PATTERNS = [
  /^a fun and engaging class for kids\.?$/i,
  /^classes for children\.?$/i,
  /^fun activities for kids\.?$/i,
  /^a great place for children\.?$/i,
  /^fun and engaging/i,
  /^classes for (kids|children)/i,
  /^a (fun|great|wonderful|amazing) (place|class|school) for (kids|children)/i,
  /^(great|good|nice|best) (classes|activities|programs?) for (kids|children)/i,
  /^(learn|discover|explore) (and|&) (have fun|play|grow)/i,
  /^where (kids|children) (can )?(learn|grow|play|have fun)/i,
  /^nurturing.*environment/i,
  /^safe and nurturing/i,
  /^holistic development/i,
  /^enriching.*experience/i,
];

function isGenericVibeLine(vl) {
  if (!vl) return true;
  const trimmed = vl.trim();
  if (trimmed.length < 20) return true;
  for (const re of GENERIC_VIBE_PATTERNS) {
    if (re.test(trimmed)) return true;
  }
  // Check if it's ONLY generic adjectives + class/kids/children with nothing specific
  const genericOnly = /^[a-z\s,]*(fun|engaging|creative|exciting|wonderful|amazing|great|best|quality|enriching|nurturing|joyful|supportive|inspiring|innovative|holistic|dynamic|vibrant|interactive)[a-z\s,]*(class|classes|program|school|centre|center|academy|studio|activities?|lessons?|sessions?|learning|education|enrichment)[a-z\s,]*(for|with)?[a-z\s,]*(kids?|children|toddlers?|preschoolers?|students?|learners?|little ones?)?\.?$/i;
  if (genericOnly.test(trimmed) && trimmed.length < 60) return true;
  return false;
}

function failsLayer2(cls) {
  const reasons = [];

  // Name missing
  if (!cls.name || cls.name.trim().length === 0) {
    reasons.push("missing name");
  }

  // Vibe line quality
  const vl = (cls.vibe_line || "").trim();
  if (vl.length === 0) {
    reasons.push("missing vibe_line");
  } else if (isGenericVibeLine(vl)) {
    reasons.push(`generic vibe_line: "${vl.slice(0, 60)}"`);
  }

  // Description missing
  if (!cls.description || cls.description.trim().length === 0) {
    reasons.push("missing description");
  }

  // Photo quality
  const photo = (cls.photo_url || "").trim();
  if (photo.length === 0) {
    reasons.push("missing photo_url");
  } else if (photo.includes("places.googleapis.com")) {
    reasons.push("Google Places placeholder photo");
  }

  // Placeholder check
  if (cls.is_placeholder) {
    reasons.push("is_placeholder = true");
  }

  // Tags check -- class_tags is a separate table, so we check the
  // class-level tag columns if they exist. Since classes table has no
  // warm_tags/enriched_tags columns, we check via the tag_count field
  // fetched separately (or skip if no tag join was done).
  // For this script, we'll check tags separately after the initial fetch.

  return reasons.length > 0 ? reasons : null;
}

// ═══════════════════════════════════════════════════════════════════════
//  LAYER 3: Enrichment integrity
// ═══════════════════════════════════════════════════════════════════════
function failsLayer3(cls, tagCount) {
  const reasons = [];

  // Summary is just the name repeated
  const summary = (cls.summary || "").trim().toLowerCase();
  const name = (cls.name || "").trim().toLowerCase();
  if (summary && name && (summary === name || summary.startsWith(name + ".") || summary.startsWith(name + " -"))) {
    reasons.push("summary is just name repeated");
  }

  // Multiple critical fields missing
  const hasVibe = (cls.vibe_line || "").trim().length > 0;
  const hasSummary = (cls.summary || "").trim().length > 0;
  const hasDesc = (cls.description || "").trim().length > 0;
  if (!hasVibe && !hasSummary && !hasDesc) {
    reasons.push("no vibe_line AND no summary AND no description");
  }

  // Category empty AND no tags
  const hasCat = (cls.category || "").trim().length > 0;
  if (!hasCat && tagCount === 0) {
    reasons.push("no category AND no tags");
  }

  return reasons.length > 0 ? reasons : null;
}

// ═══════════════════════════════════════════════════════════════════════
//  FETCH HELPERS
// ═══════════════════════════════════════════════════════════════════════
async function fetchAllCurrentlyVisible() {
  const allRows = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await sb
      .from("classes")
      .select("id, name, category, vibe_line, description, summary, photo_url, is_placeholder, hidden_from_directory, provider_id")
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

async function fetchTagCounts(classIds) {
  // Fetch from class_tags junction table to count tags per class
  const tagCounts = {};
  for (const id of classIds) tagCounts[id] = 0;

  for (let i = 0; i < classIds.length; i += 500) {
    const batch = classIds.slice(i, i + 500);
    const { data, error } = await sb
      .from("class_tags")
      .select("class_id")
      .in("class_id", batch);
    if (error) {
      // class_tags table might not exist or be empty -- that's fine
      console.warn("  (Could not fetch class_tags -- skipping tag check)");
      return tagCounts;
    }
    for (const row of data || []) {
      tagCounts[row.class_id] = (tagCounts[row.class_id] || 0) + 1;
    }
  }
  return tagCounts;
}

async function fetchTotalCounts() {
  // Total rows in classes table (all states)
  const { count: total } = await sb
    .from("classes")
    .select("id", { count: "exact", head: true });

  // Currently visible
  let visible = 0;
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data } = await sb
      .from("classes")
      .select("id")
      .eq("is_placeholder", false)
      .eq("hidden_from_directory", false)
      .range(from, from + PAGE - 1);
    if (!data || data.length === 0) break;
    visible += data.length;
    if (data.length < PAGE) break;
    from += PAGE;
  }

  return { total: total || 0, visible };
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════════
async function run() {
  console.log("================================================================");
  console.log("  TUMBO AGGRESSIVE LISTING CULL");
  console.log("  \"We only have one chance to make an impression.\"");
  console.log("================================================================\n");

  // ── Fetch all currently visible listings ──
  console.log("Fetching all currently visible listings...");
  const visible = await fetchAllCurrentlyVisible();
  console.log(`  Found ${visible.length} visible listings.\n`);

  // ── Fetch tag counts ──
  console.log("Fetching tag counts from class_tags...");
  const classIds = visible.map((c) => c.id);
  const tagCounts = await fetchTagCounts(classIds);
  const classesWithTags = Object.values(tagCounts).filter((c) => c > 0).length;
  console.log(`  ${classesWithTags} listings have at least 1 tag.\n`);

  // ── Evaluate each layer ──
  const layer1Hits = new Map(); // id -> { cls, reasons }
  const layer2Hits = new Map();
  const layer3Hits = new Map();
  const allCullIds = new Set();

  for (const cls of visible) {
    // Layer 1: Category kill
    if (failsLayer1(cls)) {
      layer1Hits.set(cls.id, { cls, reasons: [`killed category: "${cls.category}"`] });
      allCullIds.add(cls.id);
    }

    // Layer 2: Content quality
    const l2reasons = failsLayer2(cls);
    if (l2reasons) {
      layer2Hits.set(cls.id, { cls, reasons: l2reasons });
      allCullIds.add(cls.id);
    }

    // Layer 3: Enrichment integrity
    const l3reasons = failsLayer3(cls, tagCounts[cls.id] || 0);
    if (l3reasons) {
      layer3Hits.set(cls.id, { cls, reasons: l3reasons });
      allCullIds.add(cls.id);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  DRY RUN REPORT
  // ═══════════════════════════════════════════════════════════════════
  console.log("================================================================");
  console.log("  DRY RUN REPORT");
  console.log("================================================================\n");

  // Layer 1
  console.log("────────────────────────────────────────────────────────────────");
  console.log(`  LAYER 1: Category Kill List -- ${layer1Hits.size} listings`);
  console.log("────────────────────────────────────────────────────────────────");
  const l1ByCat = {};
  for (const [, { cls }] of layer1Hits) {
    const cat = cls.category || "(none)";
    if (!l1ByCat[cat]) l1ByCat[cat] = [];
    l1ByCat[cat].push(cls);
  }
  for (const [cat, items] of Object.entries(l1ByCat).sort((a, b) => b[1].length - a[1].length)) {
    const samples = items.slice(0, 3).map((c) => c.name).join(", ");
    console.log(`  ${cat}: ${items.length} -- e.g. ${samples}`);
  }
  console.log();

  // Layer 2
  console.log("────────────────────────────────────────────────────────────────");
  console.log(`  LAYER 2: Content Quality -- ${layer2Hits.size} listings`);
  console.log("────────────────────────────────────────────────────────────────");
  const l2ReasonCounts = {};
  for (const [, { reasons }] of layer2Hits) {
    for (const r of reasons) {
      const key = r.startsWith("generic vibe_line") ? "generic vibe_line" : r;
      l2ReasonCounts[key] = (l2ReasonCounts[key] || 0) + 1;
    }
  }
  for (const [reason, count] of Object.entries(l2ReasonCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${reason}: ${count}`);
  }
  // Show some samples
  const l2Samples = [...layer2Hits.values()].slice(0, 5);
  if (l2Samples.length > 0) {
    console.log("\n  Samples:");
    for (const { cls, reasons } of l2Samples) {
      console.log(`    - "${cls.name}" [cat: ${cls.category || "none"}] -- ${reasons.join("; ")}`);
    }
  }
  console.log();

  // Layer 3
  console.log("────────────────────────────────────────────────────────────────");
  console.log(`  LAYER 3: Enrichment Integrity -- ${layer3Hits.size} listings`);
  console.log("────────────────────────────────────────────────────────────────");
  const l3ReasonCounts = {};
  for (const [, { reasons }] of layer3Hits) {
    for (const r of reasons) {
      l3ReasonCounts[r] = (l3ReasonCounts[r] || 0) + 1;
    }
  }
  for (const [reason, count] of Object.entries(l3ReasonCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${reason}: ${count}`);
  }
  const l3Samples = [...layer3Hits.values()].slice(0, 5);
  if (l3Samples.length > 0) {
    console.log("\n  Samples:");
    for (const { cls, reasons } of l3Samples) {
      console.log(`    - "${cls.name}" [cat: ${cls.category || "none"}] -- ${reasons.join("; ")}`);
    }
  }
  console.log();

  // Overlap analysis
  const onlyL1 = [...layer1Hits.keys()].filter((id) => !layer2Hits.has(id) && !layer3Hits.has(id)).length;
  const onlyL2 = [...layer2Hits.keys()].filter((id) => !layer1Hits.has(id) && !layer3Hits.has(id)).length;
  const onlyL3 = [...layer3Hits.keys()].filter((id) => !layer1Hits.has(id) && !layer2Hits.has(id)).length;

  console.log("────────────────────────────────────────────────────────────────");
  console.log("  OVERLAP ANALYSIS");
  console.log("────────────────────────────────────────────────────────────────");
  console.log(`  Layer 1 only: ${onlyL1}`);
  console.log(`  Layer 2 only: ${onlyL2}`);
  console.log(`  Layer 3 only: ${onlyL3}`);
  console.log(`  TOTAL UNIQUE to cull: ${allCullIds.size}`);
  console.log(`  Will remain visible: ${visible.length - allCullIds.size}`);
  console.log();

  // ═══════════════════════════════════════════════════════════════════
  //  EXECUTE: Set hidden_from_directory = true
  // ═══════════════════════════════════════════════════════════════════
  if (allCullIds.size === 0) {
    console.log("Nothing to cull. All listings pass quality checks.");
    return;
  }

  console.log("================================================================");
  console.log("  EXECUTING CULL -- setting hidden_from_directory = true");
  console.log("================================================================\n");

  const idsToHide = [...allCullIds];
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < idsToHide.length; i += 100) {
    const batch = idsToHide.slice(i, i + 100);
    const batchNum = Math.floor(i / 100) + 1;
    const totalBatches = Math.ceil(idsToHide.length / 100);

    const { data, error } = await sb
      .from("classes")
      .update({ hidden_from_directory: true })
      .in("id", batch)
      .select("id");

    if (error) {
      console.error(`  Batch ${batchNum}/${totalBatches} ERROR: ${error.message}`);
      errors++;

      if ((error.message || "").toLowerCase().includes("hidden_from_directory")) {
        console.error("\n  FATAL: Column hidden_from_directory missing.");
        console.error("  Run scripts/migrations/add-hidden-from-directory.sql in Supabase SQL editor.");
        process.exit(1);
      }
      continue;
    }

    const count = (data || []).length;
    updated += count;
    console.log(`  Batch ${batchNum}/${totalBatches}: hid ${count} listings`);
  }

  console.log();

  // ═══════════════════════════════════════════════════════════════════
  //  FINAL REPORT
  // ═══════════════════════════════════════════════════════════════════
  const after = await fetchTotalCounts();

  console.log("================================================================");
  console.log("  FINAL REPORT");
  console.log("================================================================");
  console.log(`  Total rows in classes table:  ${after.total}`);
  console.log(`  Listings hidden this run:     ${updated}`);
  if (errors > 0) {
    console.log(`  Batch errors:                 ${errors}`);
  }
  console.log(`  Remaining visible listings:   ${after.visible}`);
  console.log();
  console.log("  Breakdown of what was culled:");
  console.log(`    Layer 1 (bad categories):    ${layer1Hits.size} flagged`);
  console.log(`    Layer 2 (content quality):   ${layer2Hits.size} flagged`);
  console.log(`    Layer 3 (enrichment):        ${layer3Hits.size} flagged`);
  console.log(`    Total unique culled:         ${allCullIds.size}`);
  console.log();
  console.log("  Done. Low-quality listings have been hidden from the directory.");
  console.log("================================================================\n");
}

run().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
