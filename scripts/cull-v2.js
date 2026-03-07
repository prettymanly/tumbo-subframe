/**
 * cull-v2.js — Comprehensive directory quality cull (v2)
 * ========================================================
 * Aggressive cull to remove all non-children's-enrichment listings.
 *
 * Layer 1: Category kill list (expanded)
 * Layer 2: Name-pattern matching (JCs, photo studios, corporate, adult ed, etc.)
 * Layer 3: Google Places auto-prefix names ("Education center at X")
 * Layer 4: Content quality (no description AND no summary = hide)
 *
 * Run:  node scripts/cull-v2.js
 */

const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ═══════════════════════════════════════════════════════════════════════
//  LAYER 1: Category kill list — expanded
// ═══════════════════════════════════════════════════════════════════════
const CATEGORY_KILL = new Set([
  // Photography / media
  "Photography studio", "Photographer", "Photo studio",
  "Photography service", "Photography class", "Portrait studio",
  "Video production service", "Animation studio",
  // Adult / higher education
  "Junior college", "University", "Adult education school",
  "Vocational school", "Distance learning center", "Computer training school",
  "Academic department", "Christian college", "International school",
  "Educational institution",
  // Generic Google Places types (not actual class providers)
  "Education center", "Training centre", "Training center",
  "Training provider", "Learning center", "Tutoring service",
  "Coaching center", "School",
  // Religious
  "Buddhist temple", "Hindu temple", "Church", "Mosque",
  "Non-profit organization", "Meditation center",
  // Therapy / medical (not enrichment)
  "Speech pathologist", "Occupational therapist", "Psychotherapist",
  "Hospital", "Clinic", "Doctor", "Dentist", "Physiotherapist",
  "Pharmacy", "Veterinary care", "Animal hospital",
  // Non-class services
  "Bicycle rental service", "Greengrocer", "Government office",
  "Tourist attraction", "Animal shelter", "Pet store",
  "Pet boarding service", "Dog day care center", "Veterinarian",
  "Internet cafe", "Event management company",
  "Non-governmental organization", "Association / Organization",
  "Corporate office", "Farm", "Garden center", "Garden",
  // Beauty / wellness (adult)
  "Beauty salon", "Hair salon", "Spa", "Laundry service", "Car wash",
  // Professional services
  "Moving company", "Real estate agency", "Insurance agency",
  "Accounting firm", "Law firm", "Tax preparation", "Financial planner",
  "Consultant", "Contractor", "Electrician", "Plumber", "Painter", "Locksmith",
  // Food / retail
  "Restaurant", "Cafe", "Bar", "Bakery", "Supermarket", "Grocery store",
  "Convenience store", "Liquor store", "Shopping mall", "Department store",
  "Clothing store", "Shoe store", "Jewelry store", "Electronics store",
  "Hardware store", "Book store", "Toy store", "Furniture store",
  "Home goods store", "Florist",
  // Transport
  "Bus station", "Train station", "Taxi stand", "Car rental", "Parking",
  // Other
  "Water park", "Archery range",
]);

const CATEGORY_KILL_LOWER = new Set([...CATEGORY_KILL].map(c => c.toLowerCase()));

// ═══════════════════════════════════════════════════════════════════════
//  LAYER 2: Name-pattern matching
// ═══════════════════════════════════════════════════════════════════════
const NAME_KILL_PATTERNS = [
  // Junior colleges
  { rx: /\bJC\b/, label: "JC (junior college)" },
  { rx: /\bjunior\s+college\b/i, label: "junior college" },
  // Photography
  { rx: /\bphotography\s*(studio|service|class)?\b/i, label: "photography" },
  { rx: /\bphoto\s*studio\b/i, label: "photo studio" },
  // Corporate / adult
  { rx: /\bcorporate\b/i, label: "corporate" },
  { rx: /\bMBA\b/, label: "MBA" },
  { rx: /\bA[\s-]?level\b/i, label: "A-Level" },
  { rx: /\bO[\s-]?level\b/i, label: "O-Level" },
  // Healthcare / medical
  { rx: /\bmedical[,\s].*dental\b/i, label: "medical/dental" },
  { rx: /\bhealthcare courses?\b/i, label: "healthcare" },
  { rx: /\bdental\b/i, label: "dental" },
  // Higher ed institutions
  { rx: /\bpolytechnic\b/i, label: "polytechnic" },
  { rx: /\buniversity\b/i, label: "university" },
  { rx: /\bNUS\b/, label: "NUS" },
  { rx: /\bNTU\b/, label: "NTU" },
  { rx: /\bSMU\b/, label: "SMU" },
  { rx: /\bSIM\s+Global\b/i, label: "SIM Global" },
  { rx: /\bITE\b/, label: "ITE" },
  // Religious (not children's classes)
  { rx: /\bbible\s+(college|school|class)\b/i, label: "bible school" },
  // Wedding / events
  { rx: /\bwedding\b/i, label: "wedding" },
  // Pet / animal
  { rx: /\bpet\b/i, label: "pet" },
  // Driving
  { rx: /\bdriving\b/i, label: "driving" },
  // Salon
  { rx: /\bsalon\b(?!.*dance)/i, label: "salon" },
  // Maid
  { rx: /\bmaid\b/i, label: "maid" },
  // Real estate / insurance
  { rx: /\breal\s+estate\b/i, label: "real estate" },
  { rx: /\binsurance\b/i, label: "insurance" },
  // Esports / gaming cafe
  { rx: /\besports?\b/i, label: "esports" },
  { rx: /\bLAN\s+shop\b/i, label: "LAN shop" },
  { rx: /\bcyber\s+cafe\b/i, label: "cyber cafe" },
  { rx: /\bgaming\b(?!.*kid)/i, label: "gaming" },
];

// ═══════════════════════════════════════════════════════════════════════
//  LAYER 3: Google Places auto-prefix patterns
//  These are names like "Education center at X" or "Training centre at X"
//  which are Google-generated, not real class names.
// ═══════════════════════════════════════════════════════════════════════
const GOOGLE_PREFIX_RX = /^(Education center|Training centre|Training center|Learning center|Training provider|Tutoring service|Coaching center|Meditation center|Speech pathologist|Occupational therapist|Educational institution|Animation studio|Archery range|Internet cafe|Water park|Christian college|Preschool|School|Garden)\s+at\s+/i;

// ═══════════════════════════════════════════════════════════════════════
//  LAYER 4: Content quality — no real content at all
// ═══════════════════════════════════════════════════════════════════════
function failsContentQuality(cls) {
  const desc = (cls.description || "").trim();
  const summary = (cls.summary || "").trim();
  // If no description AND no summary, this listing has nothing to show
  if (desc.length === 0 && summary.length === 0) return "no description AND no summary";
  return null;
}

// ═══════════════════════════════════════════════════════════════════════
//  SAFELIST: Classes we know are legit despite pattern matches
// ═══════════════════════════════════════════════════════════════════════
const SAFE_CATEGORIES = new Set([
  "Sports", "Art", "Music", "Dance", "Swimming", "Martial Arts",
  "Drama", "Coding", "Cooking", "Yoga", "Gymnastics", "Football",
  "Science", "Rock Climbing", "Chess", "Holiday Camp", "STEM",
  "Water Sports", "Play", "Life Skills", "Children's camp",
  "Special Needs",
]);

// Don't kill by name pattern if the category is safe AND the listing has good content
function isSafeFromNameKill(cls) {
  if (!SAFE_CATEGORIES.has(cls.category)) return false;
  const desc = (cls.description || "").trim();
  const summary = (cls.summary || "").trim();
  return desc.length > 100 || summary.length > 50;
}

// ═══════════════════════════════════════════════════════════════════════
//  FETCH
// ═══════════════════════════════════════════════════════════════════════
async function fetchAllVisible() {
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

// ═══════════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════════
async function run() {
  console.log("================================================================");
  console.log("  TUMBO CULL V2 — Comprehensive Directory Cleanup");
  console.log("================================================================\n");

  const visible = await fetchAllVisible();
  console.log(`  Currently visible: ${visible.length} listings\n`);

  const providerMap = await fetchProviderNames(visible.map(c => c.provider_id));

  const hits = {
    category: [],
    namePattern: [],
    googlePrefix: [],
    contentQuality: [],
  };
  const allCullIds = new Set();

  for (const cls of visible) {
    const cat = (cls.category || "").trim();
    const name = cls.name || "";
    const provName = cls.provider_id ? (providerMap[cls.provider_id] || "") : "";
    const fullText = [name, provName].filter(Boolean).join(" ");

    // Layer 1: Category kill
    if (cat && CATEGORY_KILL_LOWER.has(cat.toLowerCase())) {
      hits.category.push({ cls, reason: `killed category: "${cat}"` });
      allCullIds.add(cls.id);
      continue; // no need to check further
    }

    // Layer 3: Google Places auto-prefix (check before name patterns)
    if (GOOGLE_PREFIX_RX.test(name)) {
      hits.googlePrefix.push({ cls, reason: `Google prefix name: "${name.slice(0, 60)}"` });
      allCullIds.add(cls.id);
      continue;
    }

    // Layer 2: Name patterns (with safelist check)
    if (!isSafeFromNameKill(cls)) {
      for (const { rx, label } of NAME_KILL_PATTERNS) {
        if (rx.test(fullText)) {
          hits.namePattern.push({ cls, reason: `name pattern [${label}]: "${name.slice(0, 60)}"` });
          allCullIds.add(cls.id);
          break;
        }
      }
    }

    // Layer 4: Content quality
    const contentFail = failsContentQuality(cls);
    if (contentFail && !allCullIds.has(cls.id)) {
      hits.contentQuality.push({ cls, reason: contentFail });
      allCullIds.add(cls.id);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  DRY RUN REPORT
  // ═══════════════════════════════════════════════════════════════════
  console.log("================================================================");
  console.log("  DRY RUN REPORT");
  console.log("================================================================\n");

  for (const [layer, items] of Object.entries(hits)) {
    console.log(`── ${layer.toUpperCase()}: ${items.length} listings ──`);
    for (const { cls, reason } of items.slice(0, 10)) {
      console.log(`    - "${cls.name}" [cat: ${cls.category || "none"}] — ${reason}`);
    }
    if (items.length > 10) console.log(`    ... and ${items.length - 10} more`);
    console.log();
  }

  console.log("────────────────────────────────────────────────────────────────");
  console.log(`  TOTAL TO CULL: ${allCullIds.size}`);
  console.log(`  WILL REMAIN:   ${visible.length - allCullIds.size}`);
  console.log("────────────────────────────────────────────────────────────────\n");

  if (allCullIds.size === 0) {
    console.log("Nothing to cull. All listings pass quality checks.");
    return;
  }

  // ═══════════════════════════════════════════════════════════════════
  //  EXECUTE
  // ═══════════════════════════════════════════════════════════════════
  console.log("EXECUTING — setting hidden_from_directory = true...\n");

  const idsToHide = [...allCullIds];
  let updated = 0;

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
      continue;
    }

    updated += (data || []).length;
    console.log(`  Batch ${batchNum}/${totalBatches}: hid ${(data || []).length} listings`);
  }

  // ── Final count ──
  let finalVisible = 0;
  let from = 0;
  while (true) {
    const { data } = await sb
      .from("classes")
      .select("id")
      .eq("is_placeholder", false)
      .eq("hidden_from_directory", false)
      .range(from, from + 999);
    if (!data || data.length === 0) break;
    finalVisible += data.length;
    if (data.length < 1000) break;
    from += 1000;
  }

  console.log("\n================================================================");
  console.log("  FINAL REPORT");
  console.log("================================================================");
  console.log(`  Before:                  ${visible.length} visible`);
  console.log(`  Culled this run:         ${updated}`);
  console.log(`  Now visible:             ${finalVisible}`);
  console.log(`  Breakdown:`);
  console.log(`    Category kill:         ${hits.category.length}`);
  console.log(`    Name patterns:         ${hits.namePattern.length}`);
  console.log(`    Google prefix names:   ${hits.googlePrefix.length}`);
  console.log(`    Content quality:       ${hits.contentQuality.length}`);
  console.log("================================================================\n");
}

run().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
